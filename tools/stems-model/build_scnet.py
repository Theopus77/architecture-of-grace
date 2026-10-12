"""SCNet (starrytong/SCNet, MIT; the MUSDB18-HQ checkpoint ZFTurbo/Music-Source-Separation-Training v.1.0.6 hosts)
written straight into an ONNX graph from its weights, without torch: the network between its STFT and iSTFT, as
@audio/neural-separate's export-scnet.py cuts it.
   mix_spec [1, 4, 2049, 476] -> stems_spec [1, 16, 2049, 476]  (source drums, bass, other, vocals; channel; re, im)
usage: build_scnet.py ckpt out.onnx [--fp16]
"""
import sys, math, numpy as np, onnx
from onnx import helper as H, TensorProto as TP, numpy_helper as NH
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import ckpt

F0 = 2049
T0 = int(([a.split("=")[1] for a in sys.argv if a.startswith("--T=")] or ["476"])[0])
DIMS = [4, 32, 64, 128]
SR = [0.175, 0.392, 0.433]
STRIDE = [1, 4, 16]
KERN = [3, 4, 16]
DEPTHS = [3, 2, 1]
NDP = int(([a.split("=")[1] for a in sys.argv if a.startswith("--ndp=")] or ["6"])[0])
V2 = "--v1" not in sys.argv
CUT = ([a.split("=")[1] for a in sys.argv if a.startswith("--cut=")] or [""])[0]
LIM = 12_000_000 if "--chunk" in sys.argv else 1 << 40
PICK = [0, 1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15] if "--three" in sys.argv else None   # drums, bass, vocals (no other)


class G:
    def __init__(self, sd, mode="f32", keep16=()):
        self.sd, self.nodes, self.inits, self.n = sd, [], [], 0
        self.mode, self.fp16, self.keep16, self.qerr = mode, mode in ("fp16", "int8"), set(keep16), {}

    def name(self, p="t"):
        self.n += 1
        return f"{p}{self.n}"

    def const(self, arr, p="c", weight=False, keep=(0,)):
        nm = self.name(p)
        arr = np.asarray(arr)
        if weight and self.mode == "int8" and arr.dtype == np.float32 and arr.size >= 256 and nm not in self.keep16:
            ax = tuple(a for a in range(arr.ndim) if a not in keep)
            sc = np.abs(arr).max(axis=ax, keepdims=True) / 127.0
            sc = np.where(sc > 0, sc, 1.0).astype(np.float32)
            q = np.clip(np.round(arr / sc), -127, 127).astype(np.int8)
            err = arr - q.astype(np.float32) * sc
            self.qerr[nm] = 10 * np.log10((arr ** 2).sum() / ((err ** 2).sum() + 1e-30))
            self.inits.append(NH.from_array(q, nm + "_q"))
            self.inits.append(NH.from_array(sc, nm + "_s"))
            self.nodes.append(H.make_node("Cast", [nm + "_q"], [nm + "_c"], to=TP.FLOAT))
            self.nodes.append(H.make_node("Mul", [nm + "_c", nm + "_s"], [nm]))
            return nm
        if weight and self.fp16 and arr.dtype == np.float32 and arr.size >= 256:
            self.inits.append(NH.from_array(arr.astype(np.float16), nm + "_h"))
            self.nodes.append(H.make_node("Cast", [nm + "_h"], [nm], to=TP.FLOAT))
        else:
            self.inits.append(NH.from_array(arr, nm))
        return nm

    def w(self, key):
        return self.const(self.sd[key].astype(np.float32), "w", weight=True)

    def op(self, typ, ins, n_out=1, **attrs):
        outs = [self.name(typ[:3].lower()) for _ in range(n_out)]
        self.nodes.append(H.make_node(typ, ins, outs, **attrs))
        return outs[0] if n_out == 1 else outs

    def i64(self, v):
        return self.const(np.array(v, dtype=np.int64), "s")

    def f32(self, v):
        return self.const(np.array(v, dtype=np.float32), "f")

    # building blocks
    def slice(self, x, axis, a, b):
        return self.op("Slice", [x, self.i64([a]), self.i64([b]), self.i64([axis])])

    def pad_axis(self, x, rank, axis, l, r):
        if l == 0 and r == 0:
            return x
        p = [0] * (2 * rank)
        p[axis], p[rank + axis] = l, r
        return self.op("Pad", [x, self.i64(p)], mode="constant")

    def reshape(self, x, shape):
        return self.op("Reshape", [x, self.i64(shape)])

    def tr(self, x, perm):
        return self.op("Transpose", [x], perm=perm)

    def groupnorm1(self, x, pre, rank, axes=None, shp=None):
        """GroupNorm(1, C): over every axis but the first, one at a time (the last first), then the channel affine.
        axes / shp: the axes to reduce and the affine's shape when the layout is another."""
        axes = axes if axes is not None else list(range(rank - 1, 0, -1))
        def mean(v):
            for a in axes:
                v = self.op("ReduceMean", [v], axes=[a], keepdims=1)
            return v
        mu = mean(x)
        d = self.op("Sub", [x, mu])
        var = mean(self.op("Mul", [d, d]))
        y = self.op("Div", [d, self.op("Sqrt", [self.op("Add", [var, self.f32(1e-5)])])])
        C = self.sd[pre + ".weight"].shape[0]
        shp = shp or [1, C] + [1] * (rank - 2)
        wt = self.const(self.sd[pre + ".weight"].reshape(shp).astype(np.float32), "gw")
        bs = self.const(self.sd[pre + ".bias"].reshape(shp).astype(np.float32), "gb")
        return self.op("Add", [self.op("Mul", [y, wt]), bs])

    def conv(self, x, pre, pads=None, strides=None, group=1, bias=True, as2d=False):
        if as2d:   # a Conv1d run along the last axis of [1, C, f, T]
            wk = self.sd[pre + ".weight"]
            Wn = self.const(wk.reshape(wk.shape[0], wk.shape[1], 1, wk.shape[2]).astype(np.float32), "w", weight=True)
            ins = [x, Wn, self.const(self.sd[pre + ".bias"].astype(np.float32), "b")]
            k = wk.shape[2]
            return self.op("Conv", ins, kernel_shape=[1, k], group=group, pads=[0, k // 2, 0, k // 2])
        ins = [x, self.w(pre + ".weight")]
        if bias and (pre + ".bias") in self.sd:
            ins.append(self.const(self.sd[pre + ".bias"].astype(np.float32), "b"))
        k = self.sd[pre + ".weight"].shape[2:]
        attrs = dict(kernel_shape=list(k), group=group)
        if pads is not None: attrs["pads"] = pads
        if strides is not None: attrs["strides"] = strides
        return self.op("Conv", ins, **attrs)

    def convT(self, x, pre, strides):
        ins = [x, self.w(pre + ".weight"), self.const(self.sd[pre + ".bias"].astype(np.float32), "b")]
        k = self.sd[pre + ".weight"].shape[2:]
        return self.op("ConvTranspose", ins, kernel_shape=list(k), strides=strides)

    def glu(self, x, C2):
        a, b = self.op("Split", [x, self.i64([C2 // 2, C2 // 2])], n_out=2, axis=1)
        return self.op("Mul", [a, self.op("Sigmoid", [b])])

    def swish(self, x):
        return self.op("Mul", [x, self.op("Sigmoid", [x])])

    def gelu(self, x):
        e = self.op("Erf", [self.op("Mul", [x, self.f32(1 / math.sqrt(2))])])
        return self.op("Mul", [self.op("Mul", [x, self.f32(0.5)]), self.op("Add", [e, self.f32(1.0)])])

    def lstm(self, x, pre, H_):
        """bidirectional LSTM over X [seq, batch, I] -> [seq, batch, 2H] (PyTorch gates i f g o -> ONNX i o f c)."""
        def gate(m):
            i, f, g, o = np.split(m, 4, axis=0)
            return np.concatenate([i, o, f, g], 0)
        W = np.stack([gate(self.sd[pre + ".weight_ih_l0"]), gate(self.sd[pre + ".weight_ih_l0_reverse"])]).astype(np.float32)
        R = np.stack([gate(self.sd[pre + ".weight_hh_l0"]), gate(self.sd[pre + ".weight_hh_l0_reverse"])]).astype(np.float32)
        B = np.stack([np.concatenate([gate(self.sd[pre + ".bias_ih_l0"]), gate(self.sd[pre + ".bias_hh_l0"])]),
                      np.concatenate([gate(self.sd[pre + ".bias_ih_l0_reverse"]), gate(self.sd[pre + ".bias_hh_l0_reverse"])])]).astype(np.float32)
        Wn = self.const(W, "lw", weight=True, keep=(0, 1)); Rn = self.const(R, "lr", weight=True, keep=(0, 1)); Bn = self.const(B, "lb")
        Y = self.op("LSTM", [x, Wn, Rn, Bn], direction="bidirectional", hidden_size=H_)   # [seq, 2, batch, H]
        Y = self.tr(Y, [0, 2, 1, 3])                                                     # [seq, batch, 2, H]
        return self.reshape(Y, [0, 0, 2 * H_])

    def linear(self, x, pre):
        Wt = self.const(self.sd[pre + ".weight"].T.copy().astype(np.float32), "lin", weight=True)
        return self.op("Add", [self.op("MatMul", [x, Wt]), self.const(self.sd[pre + ".bias"].astype(np.float32), "lb")])

    # SCNet
    def conv_module2d(self, x, pre, depth, C):
        """ConvolutionModule on [1, C, f, T] (each row f its own sequence: GroupNorm over C and T per f)."""
        for d in range(depth):
            p = f"{pre}.layers.{d}"
            y = self.groupnorm1(x, p + ".0", 4, axes=[3, 1])
            y = self.conv(y, p + ".1", as2d=True)
            y = self.glu(y, self.sd[p + ".1.weight"].shape[0])
            hid = self.sd[p + ".3.weight"].shape[0]
            y = self.conv(y, p + ".3", group=hid, as2d=True)
            y = self.groupnorm1(y, p + ".4", 4, axes=[3, 1])
            y = self.swish(y)
            y = self.conv(y, p + ".6", as2d=True)
            x = self.op("Add", [x, y])
        return x

    def lstm_lin(self, x, pre, H_, lin):
        """bidirectional LSTM over [seq, batch, I] then its Linear, without reordering the directions:
        Y [seq, 2, batch, H] @ W [2, H, C], summed over the directions -> [seq, batch, C]."""
        def gate(m):
            i, f, g, o = np.split(m, 4, axis=0)
            return np.concatenate([i, o, f, g], 0)
        W = np.stack([gate(self.sd[pre + ".weight_ih_l0"]), gate(self.sd[pre + ".weight_ih_l0_reverse"])]).astype(np.float32)
        R = np.stack([gate(self.sd[pre + ".weight_hh_l0"]), gate(self.sd[pre + ".weight_hh_l0_reverse"])]).astype(np.float32)
        B = np.stack([np.concatenate([gate(self.sd[pre + ".bias_ih_l0"]), gate(self.sd[pre + ".bias_hh_l0"])]),
                      np.concatenate([gate(self.sd[pre + ".bias_ih_l0_reverse"]), gate(self.sd[pre + ".bias_hh_l0_reverse"])])]).astype(np.float32)
        Wn = self.const(W, "lw", weight=True, keep=(0, 1)); Rn = self.const(R, "lr", weight=True, keep=(0, 1)); Bn = self.const(B, "lb")
        Y = self.op("LSTM", [x, Wn, Rn, Bn], direction="bidirectional", hidden_size=H_)
        Wl = self.sd[lin + ".weight"]                       # [C, 2H]
        Wd = np.stack([Wl[:, :H_].T, Wl[:, H_:].T]).astype(np.float32)   # [2, H, C]
        y = self.op("MatMul", [Y, self.const(Wd, "lin", weight=True, keep=(0, 2))])            # [seq, 2, batch, C]
        y = self.op("ReduceSum", [y, self.i64([1])], keepdims=0)
        return self.op("Add", [y, self.const(self.sd[lin + ".bias"].astype(np.float32), "lb")])

    def dual_path_ftc(self, x, pre, C):
        """the dual path on [F, T, C]"""
        orig = x
        y = self.groupnorm1(x, pre + ".norm_layers.0", 3, axes=[2, 1, 0], shp=[C])
        y = self.lstm_lin(y, pre + ".lstm_layers.0", C, pre + ".linear_layers.0")
        x = self.op("Add", [y, orig])
        orig = x
        y = self.groupnorm1(x, pre + ".norm_layers.1", 3, axes=[2, 1, 0], shp=[C])
        y = self.tr(y, [1, 0, 2])
        y = self.lstm_lin(y, pre + ".lstm_layers.1", C, pre + ".linear_layers.1")
        y = self.tr(y, [1, 0, 2])
        return self.op("Add", [y, orig])

    def dft_ftc(self, x, T, inverse):
        """FeatureConversion on [F, T, C]: the rfft (irfft) over T, ortho, re and im side by side on C"""
        if not hasattr(self, "dmat"): self.dmat = {}
        key = (T, inverse)
        if key in self.dmat:
            c, s_ = self.dmat[key]
            if not inverse: return self.op("Concat", [self.op("MatMul", [c, x]), self.op("MatMul", [s_, x])], axis=2)
            xr = self.slice(x, 2, 0, 128); xi = self.slice(x, 2, 128, 256)
            return self.op("Add", [self.op("MatMul", [c, xr]), self.op("MatMul", [s_, xi])])
        if not inverse:
            t, k = np.arange(T), np.arange(T // 2 + 1)
            a = 2 * np.pi * np.outer(k, t) / T                                   # [K, T]
            c = self.const((np.cos(a) / np.sqrt(T)).astype(np.float32), "dc")
            s_ = self.const((-np.sin(a) / np.sqrt(T)).astype(np.float32), "ds")
            self.dmat[key] = (c, s_)
            return self.op("Concat", [self.op("MatMul", [c, x]), self.op("MatMul", [s_, x])], axis=2)
        K = T; n = 2 * (K - 1)
        t, k = np.arange(n), np.arange(K)
        a = 2 * np.pi * np.outer(t, k) / n                                       # [n, K]
        w = np.full((1, K), 2.0); w[0, 0] = w[0, -1] = 1
        c = self.const((w * np.cos(a) / np.sqrt(n)).astype(np.float32), "ic")
        s_ = self.const((-w * np.sin(a) / np.sqrt(n)).astype(np.float32), "is")
        self.dmat[key] = (c, s_)
        xr = self.slice(x, 2, 0, 128); xi = self.slice(x, 2, 128, 256)
        return self.op("Add", [self.op("MatMul", [c, xr]), self.op("MatMul", [s_, xi])])

    def conv_module(self, x, pre, depth, C):
        """ConvolutionModule on [N, C, T]."""
        for d in range(depth):
            p = f"{pre}.layers.{d}"
            y = self.groupnorm1(x, p + ".0", 3)
            y = self.conv(y, p + ".1", pads=[1, 1])
            y = self.glu(y, self.sd[p + ".1.weight"].shape[0])
            hid = self.sd[p + ".3.weight"].shape[0]
            y = self.conv(y, p + ".3", pads=[1, 1], group=hid)
            y = self.groupnorm1(y, p + ".4", 3)
            y = self.swish(y)
            y = self.conv(y, p + ".6")
            x = self.op("Add", [x, y])
        return x

    def sd_block(self, x, li, Fr, T, Cin, Cout):
        pre = f"encoder.{li}"
        splits = [(0, math.ceil(Fr * SR[0])), (math.ceil(Fr * SR[0]), math.ceil(Fr * (SR[0] + SR[1]))), (math.ceil(Fr * (SR[0] + SR[1])), Fr)]
        bands, lengths, orig = [], [], []
        for bi, (a, b) in enumerate(splits):
            e = self.slice(x, 2, a, b)
            L = b - a
            orig.append(L)
            s, k = STRIDE[bi], KERN[bi]
            tp = k - s if s == 1 else (s - L % s) % s
            e = self.pad_axis(e, 4, 2, tp // 2, tp - tp // 2)
            e = self.conv(e, f"{pre}.SDlayer.convs.{bi}", strides=[s, 1])
            f = (L + tp - k) // s + 1
            # [1, C, f, T] -> [f, C, T] -> conv module -> back
            if V2:
                y = self.conv_module2d(e, f"{pre}.conv_modules.{bi}", DEPTHS[bi], Cout)
            else:
                y = self.reshape(self.tr(e, [0, 2, 1, 3]), [f, Cout, T])
                y = self.conv_module(y, f"{pre}.conv_modules.{bi}", DEPTHS[bi], Cout)
                y = self.tr(self.reshape(y, [1, f, Cout, T]), [0, 2, 1, 3])
            bands.append(self.gelu(y))
            lengths.append(f)
        full = self.op("Concat", bands, axis=2)
        out = self.conv3(full, self.sd[f"{pre}.globalconv.weight"], self.sd[f"{pre}.globalconv.bias"], sum(lengths), T)
        return out, full, lengths, orig, sum(lengths)

    def dual_path(self, x, pre, C, Fr, T):
        orig = x
        y = self.groupnorm1(x, pre + ".norm_layers.0", 4)
        y = self.reshape(self.tr(y, [2, 0, 3, 1]), [Fr, T, C])          # [F, T, C]: seq F, batch T
        y = self.lstm(y, pre + ".lstm_layers.0", C)
        y = self.linear(y, pre + ".linear_layers.0")                     # [F, T, C]
        y = self.tr(self.reshape(y, [Fr, 1, T, C]), [1, 3, 0, 2])        # [1, C, F, T]
        x = self.op("Add", [y, orig])
        orig = x
        y = self.groupnorm1(x, pre + ".norm_layers.1", 4)
        y = self.reshape(self.tr(y, [3, 0, 2, 1]), [T, Fr, C])           # seq T, batch F
        y = self.lstm(y, pre + ".lstm_layers.1", C)
        y = self.linear(y, pre + ".linear_layers.1")                     # [T, F, C]
        y = self.tr(self.reshape(y, [T, 1, Fr, C]), [1, 3, 2, 0])
        return self.op("Add", [y, orig])

    def dft(self, x, T, inverse):
        if not inverse:
            t, k = np.arange(T), np.arange(T // 2 + 1)
            a = 2 * np.pi * np.outer(t, k) / T
            c = self.const((np.cos(a) / np.sqrt(T)).astype(np.float32), "dc")
            s = self.const((-np.sin(a) / np.sqrt(T)).astype(np.float32), "ds")
            return self.op("Concat", [self.op("MatMul", [x, c]), self.op("MatMul", [x, s])], axis=1)
        K = T
        n = 2 * (K - 1)
        k, t = np.arange(K), np.arange(n)
        a = 2 * np.pi * np.outer(k, t) / n
        w = np.full((K, 1), 2.0); w[0] = w[-1] = 1
        c = self.const((w * np.cos(a) / np.sqrt(n)).astype(np.float32), "ic")
        s = self.const((-w * np.sin(a) / np.sqrt(n)).astype(np.float32), "is")
        Ch = 128
        xr = self.slice(x, 1, 0, Ch); xi = self.slice(x, 1, Ch, 2 * Ch)
        return self.op("Add", [self.op("MatMul", [xr, c]), self.op("MatMul", [xi, s])])

    def conv3(self, x, W, b, Fr, T):
        """a 3x3 convolution (padding 1) on [1, Cin, Fr, T], in bands of rows so that the im2col buffer a
        single-threaded onnxruntime builds (rows x T x Cin x 9 floats) stays under LIM floats"""
        Cin = W.shape[1]
        Wn = self.const(W.astype(np.float32), "w", weight=True); bn = self.const(b.astype(np.float32), "b")
        rows = max(1, LIM // (T * Cin * 9))
        if rows >= Fr:
            return self.op("Conv", [x, Wn, bn], kernel_shape=[3, 3], pads=[1, 1, 1, 1])
        k = -(-Fr // rows); rows = -(-Fr // k)
        xp = self.pad_axis(x, 4, 2, 1, 1)
        outs = []
        for a in range(0, Fr, rows):
            e = min(Fr, a + rows)
            outs.append(self.op("Conv", [self.slice(xp, 2, a, e + 2), Wn, bn], kernel_shape=[3, 3], pads=[0, 1, 0, 1]))
        return self.op("Concat", outs, axis=2)

    def fusion(self, x, skip, pre, C, Fr, T):
        x = self.op("Add", [x, skip])
        # conv(concat(x, x), W) = conv(x, W[:, :C] + W[:, C:]): the repeat folded into the weights
        W = self.sd[pre + ".conv.weight"]; W = W[:, :C] + W[:, C:]
        x = self.conv3(x, W, self.sd[pre + ".conv.bias"], Fr, T)
        return self.glu(x, 2 * C)

    def su(self, x, pre, lengths, orig, pick=None):
        outs, a = [], 0
        for bi in range(3):
            b = a + lengths[bi]
            e = self.slice(x, 2, a, b)
            if pick is not None:
                kp = f"{pre}.convtrs.{bi}"
                Wt = self.sd[kp + ".weight"][:, pick]; bt = self.sd[kp + ".bias"][pick]
                o = self.op("ConvTranspose", [e, self.const(Wt.astype(np.float32), "w", weight=True), self.const(bt.astype(np.float32), "b")], kernel_shape=[KERN[bi], 1], strides=[STRIDE[bi], 1])
            else:
                o = self.convT(e, f"{pre}.convtrs.{bi}", [STRIDE[bi], 1])
            cur = (lengths[bi] - 1) * STRIDE[bi] + KERN[bi]
            dist = abs(orig[bi] - cur) // 2
            outs.append(self.slice(o, 2, dist, dist + orig[bi]))
            a = b
        return self.op("Concat", outs, axis=2)

    def finish(self, x):
        self.nodes.append(H.make_node("Identity", [x], ["stems_spec"]))
        g = H.make_graph(self.nodes, "scnet", [H.make_tensor_value_info("mix_spec", TP.FLOAT, [1, 4, F0, T0])],
                         [H.make_tensor_value_info("stems_spec", TP.FLOAT, [None, None, None, None])], self.inits)
        m = H.make_model(g, opset_imports=[H.make_opsetid("", 17)]); m.ir_version = 8
        return m

    def build(self):
        x = "mix_spec"
        Fr, T = F0, T0
        skips = []
        for li in range(3):
            x, skip, lengths, orig, Fn = self.sd_block(x, li, Fr, T, DIMS[li], DIMS[li + 1])
            skips.append((skip, lengths, orig))
            Fr = Fn
        C, Tc = DIMS[-1], T
        if CUT == "enc": return self.finish(x)
        if V2:
            x = self.tr(self.reshape(x, [C, Fr, Tc]), [1, 2, 0])          # [F, T, C]
            for i in range(NDP):
                x = self.dual_path_ftc(x, f"separation_net.dp_modules.{i}", C)
                if i % 2 == 0:
                    x = self.dft_ftc(x, Tc, False); C, Tc = 2 * C, Tc // 2 + 1
                else:
                    x = self.dft_ftc(x, Tc, True); C, Tc = C // 2, 2 * (Tc - 1)
            x = self.reshape(self.tr(x, [2, 0, 1]), [1, C, Fr, Tc])
        for i in (range(NDP) if not V2 else []):
            x = self.dual_path(x, f"separation_net.dp_modules.{i}", C, Fr, Tc)
            if i % 2 == 0:
                x = self.dft(x, Tc, False); C, Tc = 2 * C, Tc // 2 + 1
            else:
                x = self.dft(x, Tc, True); C, Tc = C // 2, 2 * (Tc - 1)
        if CUT == "sep": return self.finish(x)
        for di in range(3):
            li = 2 - di
            skip, lengths, orig = skips.pop()
            x = self.fusion(x, skip, f"decoder.{di}.0", DIMS[li + 1], sum(lengths), T0)
            x = self.su(x, f"decoder.{di}.1", lengths, orig, PICK if di == 2 else None)
        self.nodes.append(H.make_node("Identity", [x], ["stems_spec"]))
        g = H.make_graph(self.nodes, "scnet", [H.make_tensor_value_info("mix_spec", TP.FLOAT, [1, 4, F0, T0])],
                         [H.make_tensor_value_info("stems_spec", TP.FLOAT, [1, 16 if PICK is None else len(PICK), F0, T0])], self.inits)
        m = H.make_model(g, opset_imports=[H.make_opsetid("", 17)], producer_name="aog-stems build_scnet.py")
        m.ir_version = 8
        return m


if __name__ == "__main__":
    sd = ckpt.load(sys.argv[1])
    if "state_dict" in sd: sd = sd["state_dict"]
    mode = "int8" if "--int8" in sys.argv else "fp16" if "--fp16" in sys.argv else "f32"
    keep = [a.split("=", 1)[1] for a in sys.argv if a.startswith("--keep=")]
    keep = keep[0].split(",") if keep else []
    g = G(sd, mode, keep)
    m = g.build()
    if g.qerr:
        for k, v in sorted(g.qerr.items(), key=lambda kv: kv[1])[:12]: print("  qerr", k, "%.1f dB" % v)
    onnx.checker.check_model(m)
    onnx.save(m, sys.argv[2])
    import os
    print("wrote", sys.argv[2], os.path.getsize(sys.argv[2]) / 1e6, "MB,", len(m.graph.node), "nodes")
