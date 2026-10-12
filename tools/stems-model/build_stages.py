"""SCNet as ten small ONNX graphs run one after another (so a single-threaded onnxruntime-web keeps its memory to one
stage at a time), with every large weight outside the graphs in one packed file of 8-bit numbers and their scales,
which the page turns back into float32 for each graph (onnxruntime-web's externalData) as it loads it.

   s0  encoder:            mix_spec [1,4,2049,T]  ->  x [F3,T,128], k0 [1,32,616,T], k1 [1,64,186,T], k2 [1,128,57,T]
   s1…s6 dual path i:      x [F3,T',C] -> y           (s6 also turns back to [1,128,57,T])
   s7 decoder (deepest):   x, k  -> y [1,64,186,T]
   s8 decoder:             x, k  -> y [1,32,616,T]
   s9 decoder (finest):    x, k  -> stems [1,12,2049,T]  (drums, bass, vocals; channel; re, im)

usage: build_stages.py ckpt outdir [--keep16=N] [--f32]
writes outdir/s0.onnx … s9.onnx, outdir/weights.bin, outdir/manifest.json, and (for python checks) outdir/py/s<i>.bin
"""
import sys, os, json, math
sys.argv += ["--chunk", "--three"]
import numpy as np, onnx
from onnx import helper as H, TensorProto as TP, numpy_helper as NH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_scnet as B
import ckpt

T0 = B.T0


class S(B.G):
    def __init__(self, sd, mode):
        super().__init__(sd, "f32")
        self.qmode = mode
        self.ext = []          # this stage's external weights: (name, array, keep, kind)
        self.stages = []

    def const(self, arr, p="c", weight=False, keep=(0,)):
        arr = np.asarray(arr)
        if weight and arr.dtype == np.float32 and arr.size >= 256:
            nm = self.name(p)
            self.ext.append({"name": nm, "arr": arr, "keep": keep, "kind": "w"})
            return nm
        return super().const(arr, p, False, keep)

    def dft_ftc(self, x, T, inverse):
        # the DFT matrices are made by the page (exact), not shipped
        if not hasattr(self, "dmat"): self.dmat = {}
        key = (T, inverse, len(self.stages))
        if key not in self.dmat:
            if not inverse:
                K = T // 2 + 1; shape = [K, T]
            else:
                n = 2 * (T - 1); shape = [n, T]
            names = []
            for part in ("cos", "sin"):
                nm = self.name("dft")
                self.ext.append({"name": nm, "arr": np.zeros(shape, np.float32), "kind": "dft", "T": T, "inverse": inverse, "part": part})
                names.append(nm)
            self.dmat[key] = tuple(names)
        c, s_ = self.dmat[key]
        if not inverse:
            return self.op("Concat", [self.op("MatMul", [c, x]), self.op("MatMul", [s_, x])], axis=2)
        xr = self.slice(x, 2, 0, 128); xi = self.slice(x, 2, 128, 256)
        return self.op("Add", [self.op("MatMul", [c, xr]), self.op("MatMul", [s_, xi])])

    def start(self, ins):
        self.nodes, self.inits, self.ext, self.ins = [], [], [], ins

    def end(self, outs):
        """outs: [(tensor, graph name, shape)]"""
        for t, nm, _ in outs:
            self.nodes.append(H.make_node("Identity", [t], [nm]))
        self.stages.append({"nodes": self.nodes, "inits": self.inits, "ext": self.ext, "ins": self.ins, "outs": [(nm, shp) for _, nm, shp in outs]})

    def build_all(self):
        Fr, T = B.F0, T0
        self.start([("mix_spec", [1, 4, B.F0, T0])])
        x, skips = "mix_spec", []
        for li in range(3):
            x, skip, lengths, orig, Fn = self.sd_block(x, li, Fr, T, B.DIMS[li], B.DIMS[li + 1])
            skips.append((skip, lengths, orig, Fn))
            Fr = Fn
        C, Tc = B.DIMS[-1], T
        x = self.tr(self.reshape(x, [C, Fr, Tc]), [1, 2, 0])
        F3 = Fr
        self.end([(x, "x", [F3, Tc, C])] + [(s[0], f"k{i}", [1, B.DIMS[i + 1], s[3], T0]) for i, s in enumerate(skips)])
        for i in range(B.NDP):
            self.start([("x", [F3, Tc, C])])
            y = self.dual_path_ftc("x", f"separation_net.dp_modules.{i}", C)
            if i % 2 == 0:
                y = self.dft_ftc(y, Tc, False); C, Tc = 2 * C, Tc // 2 + 1
            else:
                y = self.dft_ftc(y, Tc, True); C, Tc = C // 2, 2 * (Tc - 1)
            if i == B.NDP - 1:
                y = self.reshape(self.tr(y, [2, 0, 1]), [1, C, F3, Tc])
                self.end([(y, "y", [1, C, F3, Tc])])
            else:
                self.end([(y, "y", [F3, Tc, C])])
        x_shape = [1, C, F3, Tc]
        for di in range(3):
            li = 2 - di
            skip, lengths, orig, Fn = skips.pop()
            self.start([("x", x_shape), ("k", [1, B.DIMS[li + 1], Fn, T0])])
            y = self.fusion("x", "k", f"decoder.{di}.0", B.DIMS[li + 1], sum(lengths), T0)
            y = self.su(y, f"decoder.{di}.1", lengths, orig, B.PICK if di == 2 else None)
            Fo = sum(orig)
            Co = B.DIMS[li] if di < 2 else len(B.PICK)
            x_shape = [1, Co, Fo, T0]
            self.end([(y, "stems" if di == 2 else "y", x_shape)])
        return self.stages


def quant(arr, keep):
    ax = tuple(a for a in range(arr.ndim) if a not in keep)
    sc = np.abs(arr).max(axis=ax, keepdims=True) / 127.0
    sc = np.where(sc > 0, sc, 1.0).astype(np.float32)
    q = np.clip(np.round(arr / sc), -127, 127).astype(np.int8)
    return q, sc


def dftmat(e):
    T, inv, part = e["T"], e["inverse"], e["part"]
    if not inv:
        t, k = np.arange(T), np.arange(T // 2 + 1)
        a = 2 * np.pi * np.outer(k, t) / T
        m = np.cos(a) / np.sqrt(T) if part == "cos" else -np.sin(a) / np.sqrt(T)
    else:
        K = T; n = 2 * (K - 1)
        t, k = np.arange(n), np.arange(K)
        a = 2 * np.pi * np.outer(t, k) / n
        w = np.full((1, K), 2.0); w[0, 0] = w[0, -1] = 1
        m = w * np.cos(a) / np.sqrt(n) if part == "cos" else -w * np.sin(a) / np.sqrt(n)
    return m.astype(np.float32)


def main():
    src, out = sys.argv[1], sys.argv[2]
    mode = "f32" if "--f32" in sys.argv else "int8"
    keepN = int(([a.split("=")[1] for a in sys.argv if a.startswith("--keep16=")] or ["0"])[0])
    os.makedirs(os.path.join(out, "py"), exist_ok=True)
    sd = ckpt.load(src)
    if "state_dict" in sd: sd = sd["state_dict"]
    g = S(sd, mode)
    stages = g.build_all()
    # the weights that lose most to 8 bits stay in 16 (by their own rounding error)
    allw = [e for st in stages for e in st["ext"] if e["kind"] == "w"]
    for e in allw:
        q, sc = quant(e["arr"], e["keep"])
        err = e["arr"] - q.astype(np.float32) * sc
        e["qsnr"] = 10 * np.log10((e["arr"] ** 2).sum() / ((err ** 2).sum() + 1e-30))
    worst = sorted(allw, key=lambda e: e["qsnr"])[:keepN]
    for e in worst: e["f16"] = True
    blob = bytearray()
    def put(b):
        while len(blob) % 4: blob.append(0)
        o = len(blob); blob.extend(b); return o
    man = {"model": "scnet", "T": T0, "segment": (T0 - 1) * 1024 - 1300, "n_fft": 4096, "hop": 1024,
           "sources": ["drums", "bass", "vocals"], "stages": []}
    for si, st in enumerate(stages):
        tens, off = [], 0
        pyb = bytearray()
        inits = list(st["inits"])
        for e in st["ext"]:
            arr = e["arr"] if e["kind"] == "w" else dftmat(e)
            n = arr.size
            t = {"name": e["name"], "shape": list(arr.shape), "off": off}
            if e["kind"] == "dft":
                t.update(kind="dft", T=e["T"], inverse=bool(e["inverse"]), part=e["part"]); deq = arr
            elif mode == "f32":
                t.update(kind="f32", src=put(arr.astype("<f4").tobytes())); deq = arr
            elif e.get("f16"):
                h = arr.astype(np.float16)
                t.update(kind="f16", src=put(h.astype("<f2").tobytes())); deq = h.astype(np.float32)
            else:
                q, sc = quant(arr, e["keep"])
                t.update(kind="i8", src=put(q.tobytes()), scale=put(sc.astype("<f4").tobytes()), sshape=list(sc.shape)); deq = q.astype(np.float32) * sc
            tp = onnx.TensorProto(); tp.name = e["name"]; tp.data_type = TP.FLOAT; tp.dims.extend(arr.shape)
            tp.data_location = onnx.TensorProto.EXTERNAL
            for k, v in (("location", f"s{si}.bin"), ("offset", str(off)), ("length", str(n * 4))):
                ent = tp.external_data.add(); ent.key = k; ent.value = v
            inits.append(tp)
            pyb.extend(deq.astype("<f4").tobytes())
            off += n * 4
            tens.append(t)
        ins = [H.make_tensor_value_info(nm, TP.FLOAT, shp) for nm, shp in st["ins"]]
        outs = [H.make_tensor_value_info(nm, TP.FLOAT, shp) for nm, shp in st["outs"]]
        gr = H.make_graph(st["nodes"], f"scnet_s{si}", ins, outs, inits)
        m = H.make_model(gr, opset_imports=[H.make_opsetid("", 17)], producer_name="aog-stems build_stages.py")
        m.ir_version = 8
        onnx.save(m, os.path.join(out, f"s{si}.onnx")); onnx.save(m, os.path.join(out, "py", f"s{si}.onnx"))
        open(os.path.join(out, "py", f"s{si}.bin"), "wb").write(pyb)
        man["stages"].append({"file": f"s{si}.onnx", "ext": f"s{si}.bin", "bytes": off, "tensors": tens,
                              "inputs": [[nm, shp] for nm, shp in st["ins"]], "outputs": [[nm, shp] for nm, shp in st["outs"]]})
    open(os.path.join(out, "weights.bin"), "wb").write(bytes(blob))
    json.dump(man, open(os.path.join(out, "manifest.json"), "w"), separators=(",", ":"))
    tot = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out) if os.path.isfile(os.path.join(out, f)))
    print("wrote", out, "weights.bin %.2f MB," % (len(blob) / 1e6), "all files %.2f MB" % (tot / 1e6), "stages", len(stages),
          "f16 kept:", [(e["name"], round(e["qsnr"], 1)) for e in worst])


if __name__ == "__main__":
    main()
