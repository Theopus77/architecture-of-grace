"""AOG-STEMS-GPU-CHECK-V1 — the reference answers for the model's self-test, written into manifest.json ("selftest").

Before aog-stems-ai.js trusts a device's GPU (WebGPU), it runs one fixed input through all ten stages and compares
every stage's outputs with these answers, worked out here by onnxruntime on the CPU from the very same weights
(weights.bin, turned back into 32-bit numbers as the page does). A GPU that clamps a large buffer, rounds to 16 bits
or runs an op wrongly fails it, and the page uses WebAssembly instead.

The input is made the same way in both places from whole numbers only (no sin, no exp), so it is bit for bit the same:
  a 32-bit LCG  x = x * 1664525 + 1013904223 (mod 2^32), u = (x >>> 8) / 2^24,
  mix_spec[c, k, t] = float32((u - 0.5) * 4 / (1 + k / 20))   in that order (c, k, t), seed 12345.
For each stage output it keeps the sum of squares and 96 values at places drawn by the same LCG (seed 777 + 1000 * j,
j the output's number in order), u * size, floored.
Also "gpuBytes": the largest tensor any stage holds (the page asks the GPU for buffers at least this big).

usage: selftest.py models/stems/scnet-v1     (needs numpy, onnx, onnxruntime)
"""
import os, sys, json, numpy as np, onnx, onnxruntime as ort
from onnx import shape_inference


def lcg(seed):
    x = seed & 0xFFFFFFFF
    while True:
        x = (x * 1664525 + 1013904223) & 0xFFFFFFFF
        yield (x >> 8) / 16777216.0


def stage_weights(st, W):
    outb = np.zeros(st["bytes"] // 4, np.float32)
    for t in st["tensors"]:
        n = int(np.prod(t["shape"])); o = t["off"] // 4; dst = outb[o:o + n].reshape(t["shape"])
        if t["kind"] == "dft":
            rows, cols = t["shape"]
            if not t["inverse"]:
                Tn = t["T"]; k = np.arange(rows)[:, None]; xx = np.arange(cols)[None]; ang = 2 * np.pi * ((k * xx) % Tn) / Tn
                dst[:] = (np.cos(ang) if t["part"] == "cos" else -np.sin(ang)) / np.sqrt(Tn)
            else:
                K = t["T"]; nn = 2 * (K - 1); xx = np.arange(rows)[:, None]; k = np.arange(cols)[None]; ang = 2 * np.pi * ((xx * k) % nn) / nn
                w = np.where((k == 0) | (k == K - 1), 1, 2)
                dst[:] = w * (np.cos(ang) if t["part"] == "cos" else -np.sin(ang)) / np.sqrt(nn)
        elif t["kind"] == "f32": dst[:] = np.frombuffer(W, "<f4", n, t["src"]).reshape(t["shape"])
        elif t["kind"] == "f16": dst[:] = np.frombuffer(W, "<f2", n, t["src"]).astype(np.float32).reshape(t["shape"])
        else:
            q = np.frombuffer(W, np.int8, n, t["src"]).reshape(t["shape"]).astype(np.float32)
            sc = np.frombuffer(W, "<f4", int(np.prod(t["sshape"])), t["scale"]).reshape(t["sshape"])
            dst[:] = q * sc
    return outb


def main():
    md = sys.argv[1]
    man = json.load(open(os.path.join(md, "manifest.json")))
    W = open(os.path.join(md, "weights.bin"), "rb").read()
    S, big = [], 0
    for st in man["stages"]:
        m = onnx.load(os.path.join(md, st["file"]), load_external_data=False)
        inf = shape_inference.infer_shapes(m)
        for v in list(inf.graph.value_info) + list(inf.graph.output) + list(inf.graph.input):
            d = [x.dim_value for x in v.type.tensor_type.shape.dim]
            if d and all(d): big = max(big, int(np.prod(d)) * 4)
        ext = stage_weights(st, W)
        for init in m.graph.initializer:
            if init.data_location == onnx.TensorProto.EXTERNAL:
                d = {e.key: e.value for e in init.external_data}
                off, ln = int(d["offset"]), int(d["length"])
                init.ClearField("external_data"); init.data_location = onnx.TensorProto.DEFAULT
                init.raw_data = ext[off // 4:(off + ln) // 4].astype("<f4").tobytes()
        S.append(ort.InferenceSession(m.SerializeToString(), providers=["CPUExecutionProvider"]))
    F, T = 2049, man["T"]
    g = lcg(12345)
    u = np.fromiter((next(g) for _ in range(4 * F * T)), np.float64, 4 * F * T).reshape(4, F, T)
    k = np.arange(F, dtype=np.float64).reshape(1, F, 1)
    spec = ((u - 0.5) * (4.0 / (1.0 + k / 20.0))).astype(np.float32)[None]
    outs = []
    x, k0, k1, k2 = S[0].run(None, {"mix_spec": spec}); outs += [("s0", "x", x), ("s0", "k0", k0), ("s0", "k1", k1), ("s0", "k2", k2)]
    for i in range(1, 7):
        x = S[i].run(None, {"x": x})[0]; outs.append(("s%d" % i, "y", x))
    x = S[7].run(None, {"x": x, "k": k2})[0]; outs.append(("s7", "y", x))
    x = S[8].run(None, {"x": x, "k": k1})[0]; outs.append(("s8", "y", x))
    x = S[9].run(None, {"x": x, "k": k0})[0]; outs.append(("s9", "stems", x))
    checks = []
    for j, (stg, nm, a) in enumerate(outs):
        flat = a.reshape(-1).astype(np.float64); n = flat.size; gg = lcg(777 + 1000 * j)
        idx = [int(next(gg) * n) for _ in range(96)]
        checks.append({"stage": stg, "out": nm, "n": n, "ss": float((flat ** 2).sum()), "idx": idx, "val": [float(np.float32(flat[i])) for i in idx]})
    man["selftest"] = {"seed": 12345, "minDb": 50, "checks": checks}
    man["gpuBytes"] = big
    json.dump(man, open(os.path.join(md, "manifest.json"), "w"), separators=(",", ":"))
    print("selftest: %d checks, largest tensor %.1f MB" % (len(checks), big / 2 ** 20))


if __name__ == "__main__":
    main()
