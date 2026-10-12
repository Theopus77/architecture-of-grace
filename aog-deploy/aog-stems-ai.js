/* ══ AOG-STEMS-AI-V1 (2026-10-12) — Split a song into its parts, Best quality: a trained model, on the device ══════════
   Jimmy: "It needs to be improved. Quantum this meaning it needs a big leap in its abilities."
   This file is a Worker (a module): aog-stems.js starts it only when a learner's split runs at Best, and lets it go
   when the split is done or stopped. Nothing here touches the page, makes a sound or fetches from another site.

   The model is SCNet (starrytong/SCNet, MIT; the author's MUSDB18-HQ weights), written into ten small ONNX graphs
   (models/stems/scnet-v1/, see its CREDITS.txt) and run by onnxruntime-web 1.30 (vendor/onnxruntime-web-1.30.0, MIT):
   WebGPU where the device has it, else WebAssembly on one thread (this site is not cross-origin isolated). The ten
   stages run one after another, so a phone holds only one stage's working memory at a time; the weights come as 8-bit
   numbers (11.6 MB) and are turned back into 32-bit ones here, stage by stage, as they load.

   Messages in:   {type:"init", ep:"webgpu"|"wasm", selftest?, fake?}  → {type:"ready", ep, ms, self} | {type:"error", where:"init", why, self}
                  (WebGPU is always self-tested first: AOG-STEMS-GPU-CHECK-V1, below)
                  {type:"seg", id, L, R}   (Float32Array, one 11 s segment, already scaled by the song's deviation)
                                                                        → {type:"tick", id, k} after each stage (k 1…10)
                                                                        → {type:"seg", id, d:[L,R], b:[L,R], v:[L,R]}
   Each part comes back as Float32Arrays (moved, not copied): drums, bass and the voice. "The rest" is made on the page
   (the song less the three), so the four always add back to the song. ═══════════════════════════════════════════════ */
const ROOT = new URL("./", import.meta.url);
const ORT_DIR = new URL("vendor/onnxruntime-web-1.30.0/", ROOT);
const MODEL_DIR = new URL("models/stems/scnet-v1/", ROOT);
let ort = null, man = null, sess = [], EP = "", N = 4096, HOP = 1024, T = 476, F = 2049, fft = null;
const post = (m, tr) => self.postMessage(m, tr || []);

/* ── the FFT: complex, radix 2, in place (Float64Array re, im) ── */
function makeFFT(n) {
  const rev = new Uint32Array(n), cs = new Float64Array(n / 2), sn = new Float64Array(n / 2), lg = Math.round(Math.log2(n));
  for (let i = 0; i < n; i++) { let r = 0, x = i; for (let b = 0; b < lg; b++) { r = (r << 1) | (x & 1); x >>= 1; } rev[i] = r; }
  for (let i = 0; i < n / 2; i++) { cs[i] = Math.cos(2 * Math.PI * i / n); sn[i] = -Math.sin(2 * Math.PI * i / n); }
  return function (re, im, inv) {
    for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let j = 0; j < half; j++) {
        const wr = cs[j * step], wi = inv ? -sn[j * step] : sn[j * step];
        for (let i = j; i < n; i += size) {
          const b = i + half, tr = re[b] * wr - im[b] * wi, ti = re[b] * wi + im[b] * wr;
          re[b] = re[i] - tr; im[b] = im[i] - ti; re[i] += tr; im[i] += ti;
        }
      }
    }
  };
}

/* ── the weights, back to 32 bits for one stage (its externalData) ── */
let HALF = null;
function half2f(h) {
  if (!HALF) { HALF = new Float32Array(65536); for (let i = 0; i < 65536; i++) { const s = i & 0x8000 ? -1 : 1, e = (i >> 10) & 31, m = i & 1023;
    HALF[i] = e === 0 ? s * m * Math.pow(2, -24) : e === 31 ? (m ? NaN : s * Infinity) : s * (1 + m / 1024) * Math.pow(2, e - 15); } }
  return HALF[h];
}
function stageWeights(st, W) {
  const out = new Float32Array(st.bytes / 4);
  for (const t of st.tensors) {
    const n = t.shape.reduce((a, b) => a * b, 1), o = t.off / 4, dst = out.subarray(o, o + n);
    if (t.kind === "dft") {
      const sh = t.shape, rows = sh[0], cols = sh[1];
      if (!t.inverse) { const Tn = t.T, sc = 1 / Math.sqrt(Tn);
        for (let k = 0; k < rows; k++) for (let x = 0; x < cols; x++) { const a = 2 * Math.PI * ((k * x) % Tn) / Tn; dst[k * cols + x] = (t.part === "cos" ? Math.cos(a) : -Math.sin(a)) * sc; } }
      else { const K = t.T, nn = 2 * (K - 1), sc = 1 / Math.sqrt(nn);
        for (let x = 0; x < rows; x++) for (let k = 0; k < cols; k++) { const a = 2 * Math.PI * ((x * k) % nn) / nn, w = k === 0 || k === K - 1 ? 1 : 2; dst[x * cols + k] = w * (t.part === "cos" ? Math.cos(a) : -Math.sin(a)) * sc; } }
    } else if (t.kind === "f32") dst.set(new Float32Array(W, t.src, n));
    else if (t.kind === "f16") { const h = new Uint16Array(W, t.src, n); for (let i = 0; i < n; i++) dst[i] = half2f(h[i]); }
    else {
      /* 8 bits and a scale per row: the scale's shape keeps some axes and is 1 on the others */
      const q = new Int8Array(W, t.src, n), sh = t.shape, ss = t.sshape, R = sh.length, scale = new Float32Array(W, t.scale, ss.reduce((a, b) => a * b, 1));
      const sStride = new Array(R); let acc = 1; for (let a = R - 1; a >= 0; a--) { sStride[a] = ss[a] === 1 ? 0 : acc; acc *= ss[a]; }
      const idx = new Array(R).fill(0); let si = 0;
      for (let i = 0; i < n; i++) {
        dst[i] = q[i] * scale[si];
        for (let a = R - 1; a >= 0; a--) { idx[a]++; si += sStride[a]; if (idx[a] < sh[a]) break; si -= sStride[a] * sh[a]; idx[a] = 0; }
      }
    }
  }
  return out;
}

async function init(ep, o) {
  const t0 = Date.now();
  o = o || {};
  if (ep !== "webgpu" && ep !== "wasm") throw new Error("no such backend: " + ep);
  man = await (await fetch(new URL("manifest.json", MODEL_DIR))).json();
  if (ep === "webgpu") {
    if (!self.navigator || !navigator.gpu) throw new Error("no webgpu");
    const ad = await navigator.gpu.requestAdapter(); if (!ad) throw new Error("no webgpu adapter");
    /* AOG-STEMS-GPU-CHECK-V1: every tensor must fit in one GPU buffer. The largest tensor is 71.6 MB; onnxruntime rounds
       a big buffer up to a power of two, so the largest buffer it asks for is 128 MiB (measured: 134217728 bytes), just what
       Safari allows by default. A GPU that allows less is not used. */
    const lim = ad.limits || {}, need = man.gpuBytes ? Math.pow(2, Math.ceil(Math.log2(man.gpuBytes))) : 0;
    if (need && (+lim.maxStorageBufferBindingSize < need || +lim.maxBufferSize < need))
      throw Object.assign(new Error("gpu limits"), { why: "limits " + lim.maxStorageBufferBindingSize + "/" + lim.maxBufferSize + " < " + need });
  }
  ort = await import(new URL(ep === "webgpu" ? "ort.webgpu.min.mjs" : "ort.wasm.min.mjs", ORT_DIR).href);
  ort.env.wasm.numThreads = 1; ort.env.wasm.proxy = false; ort.env.wasm.wasmPaths = ORT_DIR.href;
  N = man.n_fft; HOP = man.hop; T = man.T; F = N / 2 + 1; fft = makeFFT(N);
  const W = await (await fetch(new URL("weights.bin", MODEL_DIR))).arrayBuffer();
  sess = [];
  for (let i = 0; i < man.stages.length; i++) {
    const st = man.stages[i], g = await (await fetch(new URL(st.file, MODEL_DIR))).arrayBuffer();
    let ext = stageWeights(st, W);
    const opt = { executionProviders: [ep], graphOptimizationLevel: "all", externalData: [{ path: st.ext, data: new Uint8Array(ext.buffer) }] };
    if (ep === "wasm") { opt.enableCpuMemArena = false; opt.enableMemPattern = false; }
    if (ep === "webgpu" && i < man.stages.length - 1) opt.preferredOutputLocation = "gpu-buffer";
    sess.push(await ort.InferenceSession.create(new Uint8Array(g), opt));
    ext = null;
    post({ type: "load", k: i + 1, of: man.stages.length });
  }
  EP = ep;
  /* AOG-STEMS-GPU-CHECK-V1: a GPU is trusted only after it gives the right answers on a fixed input, every stage */
  if ((ep === "webgpu" || o.selftest) && man.selftest) {
    const st = await selftest(o.fake);
    self.__self = st;
    if (!st.ok) throw Object.assign(new Error("selftest"), { why: "selftest " + st.at + " " + st.db + " dB", self: st });
    return { ms: Date.now() - t0, self: st };
  }
  return { ms: Date.now() - t0, self: null };
}

/* ── AOG-STEMS-GPU-CHECK-V1 (2026-10-12): the self-test ─────────────────────────────────────────────────────────────
   Jimmy, on his iPad: "It sounds nasty!" The GPU path had only been checked on a software GPU. Now, before the parts
   are made on a device's GPU, one fixed input (made from whole numbers, the same bits everywhere) goes through all ten
   stages and each stage's outputs are compared with answers worked out on a computer's CPU from the very same weights
   (manifest.json "selftest", written by tools/stems-model/selftest.py): 96 values at fixed places (at least 50 dB alike)
   and the whole output's energy (within 1 %), and no NaN or Infinity anywhere. A GPU that clamps a big buffer, rounds
   to 16 bits or runs an op wrongly fails, and the page uses WebAssembly instead (a quiet console note says why).
   fake (tests only): "half" zeroes half of the first stage's answer, as a GPU that cut a buffer short would. */
function lcg(seed) { let x = seed >>> 0; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return (x >>> 8) / 16777216; }; }
async function selftest(fake) {
  const t0 = Date.now(), S = man.selftest, Fn = F, Tn = T, spec = new Float32Array(4 * Fn * Tn), g = lcg(S.seed);
  for (let c = 0, i = 0; c < 4; c++) for (let k = 0; k < Fn; k++) { const a = 4 / (1 + k / 20); for (let t = 0; t < Tn; t++, i++) spec[i] = (g() - 0.5) * a; }
  let j = 0, worst = { db: Infinity, at: "" }, bad = null;
  const check = async (stage, out, ten) => {
    const c = S.checks[j], jj = j++;
    if (bad) return;
    let d = ten.location && ten.location !== "cpu" ? await ten.getData() : ten.data;
    if (fake === "half" && stage === "s0" && out === "x") { d = new Float32Array(d); d.fill(0, d.length >> 1); }
    let ss = 0, fin = true;
    for (let i = 0; i < d.length; i++) { const v = d[i]; if (v !== v || v === Infinity || v === -Infinity) { fin = false; break; } ss += v * v; }
    let a = 0, e = 0; for (let i = 0; i < c.idx.length; i++) { const r = c.val[i], v = d[c.idx[i]]; a += r * r; e += (r - v) * (r - v); }
    const db = e > 0 ? 10 * Math.log10(a / e) : 200, ratio = c.ss > 0 ? ss / c.ss : 1, here = stage + "." + out;
    if (!fin || d.length !== c.n || !(db >= (S.minDb || 50)) || !(Math.abs(ratio - 1) <= 0.01)) bad = { at: here, db: +(fin ? db : -Infinity).toFixed(1), ratio: +ratio.toFixed(4), finite: fin, k: jj };
    if (db < worst.db) worst = { db, at: here };
    if (bad) throw BAD;   /* the first wrong answer is enough: no more stages run */
  };
  const BAD = new Error("selftest");
  const drop = (v) => { try { if (v && v.dispose) v.dispose(); } catch (e) {} };
  let o = await sess[0].run({ mix_spec: new ort.Tensor("float32", spec, [1, 4, Fn, Tn]) });
  const k0 = o.k0, k1 = o.k1, k2 = o.k2; let x = o.x;
  try {
    await check("s0", "x", x); await check("s0", "k0", k0); await check("s0", "k1", k1); await check("s0", "k2", k2);
    for (let i = 1; i <= 6; i++) { const y = (await sess[i].run({ x })).y; drop(x); x = y; await check("s" + i, "y", x); }
    let y = (await sess[7].run({ x, k: k2 })).y; drop(x); drop(k2); x = y; await check("s7", "y", x);
    y = (await sess[8].run({ x, k: k1 })).y; drop(x); drop(k1); x = y; await check("s8", "y", x);
    const stm = (await sess[9].run({ x, k: k0 })).stems; drop(x); drop(k0); await check("s9", "stems", stm); drop(stm);
  } catch (e) { if (e !== BAD) throw e; [x, k0, k1, k2].forEach(drop); }
  return bad ? Object.assign({ ok: false, ep: EP, ms: Date.now() - t0 }, bad) : { ok: true, ep: EP, ms: Date.now() - t0, db: +worst.db.toFixed(1), at: worst.at };
}

/* one segment's STFT (ones, normalized, centred, reflected), both channels in one complex FFT a frame */
function stft(L, R) {
  const P = (T - 1) * HOP, n = L.length, h = N / 2, spec = new Float32Array(4 * F * T), re = new Float64Array(N), im = new Float64Array(N), sc = 1 / Math.sqrt(N);
  const at = (x, j) => { if (j < 0) j = -j; else if (j >= P) j = 2 * (P - 1) - j; return j < n ? x[j] : 0; };
  const FT = F * T;
  for (let t = 0; t < T; t++) {
    const s = t * HOP - h;
    if (s >= 0 && s + N <= Math.min(n, P)) { for (let i = 0; i < N; i++) { re[i] = L[s + i]; im[i] = R[s + i]; } }
    else for (let i = 0; i < N; i++) { re[i] = at(L, s + i); im[i] = at(R, s + i); }
    fft(re, im, false);
    for (let k = 0; k < F; k++) {
      const k2 = k === 0 ? 0 : N - k, zr = re[k], zi = im[k], yr = re[k2], yi = im[k2], o = k * T + t;
      spec[o] = 0.5 * (zr + yr) * sc; spec[FT + o] = 0.5 * (zi - yi) * sc;              /* left */
      spec[2 * FT + o] = 0.5 * (zi + yi) * sc; spec[3 * FT + o] = -0.5 * (zr - yr) * sc;  /* right */
    }
  }
  return spec;
}
/* a source's two channels back to sound (one complex inverse FFT a frame), L samples each */
function istft(z, s, Lseg) {
  const P = (T - 1) * HOP, h = N / 2, M = (T - 1) * HOP + N, FT = F * T, sc = Math.sqrt(N) / N;
  const aL = new Float64Array(M), aR = new Float64Array(M), re = new Float64Array(N), im = new Float64Array(N);
  const bL = s * 4 * FT, bR = bL + 2 * FT;
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < F; k++) {
      const o = k * T + t; let lr = z[bL + o], li = z[bL + FT + o], rr = z[bR + o], ri = z[bR + FT + o];
      if (k === 0 || k === F - 1) { li = 0; ri = 0; }
      re[k] = lr - ri; im[k] = li + rr;                       /* X_L + i·X_R */
      if (k > 0 && k < F - 1) { re[N - k] = lr + ri; im[N - k] = rr - li; }   /* conj(X_L) + i·conj(X_R) */
    }
    fft(re, im, true);
    const a = t * HOP;
    for (let i = 0; i < N; i++) { aL[a + i] += re[i] * sc; aR[a + i] += im[i] * sc; }
  }
  const oL = new Float32Array(Lseg), oR = new Float32Array(Lseg);
  for (let j = 0; j < Lseg && j < P; j++) {
    const q = j + h, t1 = Math.min(T - 1, Math.floor(q / HOP)), t0 = Math.max(0, Math.ceil((q - N + 1) / HOP)), e = t1 - t0 + 1;
    oL[j] = aL[q] / e; oR[j] = aR[q] / e;
  }
  return [oL, oR];
}

async function segment(id, L, R) {
  const spec = stft(L, R);
  const T0 = (k) => post({ type: "tick", id, k });
  let o = await sess[0].run({ mix_spec: new ort.Tensor("float32", spec, [1, 4, F, T]) });
  const k0 = o.k0, k1 = o.k1, k2 = o.k2; let x = o.x; T0(1);
  const drop = (v) => { try { if (v && v.dispose && v !== k0 && v !== k1 && v !== k2) v.dispose(); } catch (e) {} };
  for (let i = 1; i <= 6; i++) { const y = (await sess[i].run({ x })).y; drop(x); x = y; T0(i + 1); }
  let y = (await sess[7].run({ x, k: k2 })).y; drop(x); try { k2.dispose && k2.dispose(); } catch (e) {} x = y; T0(8);
  y = (await sess[8].run({ x, k: k1 })).y; drop(x); try { k1.dispose && k1.dispose(); } catch (e) {} x = y; T0(9);
  const st = (await sess[9].run({ x, k: k0 })).stems; drop(x); try { k0.dispose && k0.dispose(); } catch (e) {}
  const z = st.data || await st.getData();
  /* AOG-STEMS-GPU-CHECK-V1: an answer with NaN or Infinity in it is never used (the page tries WebAssembly) */
  for (let i = 0; i < z.length; i += 7) { const q = z[i]; if (q !== q || q === Infinity || q === -Infinity) throw Object.assign(new Error("not finite"), { why: "not finite" }); }
  const n = L.length, d = istft(z, 0, n), b = istft(z, 1, n), v = istft(z, 2, n);
  try { st.dispose && st.dispose(); } catch (e) {}
  T0(10);
  post({ type: "seg", id, d, b, v }, [d[0].buffer, d[1].buffer, b[0].buffer, b[1].buffer, v[0].buffer, v[1].buffer]);
}

const isMem = (e) => /memory|allocation|Array buffer|out of bounds|OOM|bad_alloc/i.test(String(e && (e.message || e)));
let queue = Promise.resolve();
self.onmessage = (e) => {
  const d = e.data || {};
  if (d.type === "init") {
    queue = queue.then(() => init(d.ep, { selftest: !!d.selftest, fake: d.fake || "" }).then((r) => post({ type: "ready", ep: EP, ms: r.ms, self: r.self }),
      (er) => post({ type: "error", where: "init", message: String((er && er.message) || er), memory: isMem(er), why: (er && er.why) || "", self: (er && er.self) || null })));
  } else if (d.type === "seg") {
    queue = queue.then(() => segment(d.id, d.L, d.R).catch((er) => post({ type: "error", where: "seg", id: d.id, message: String((er && er.message) || er), memory: isMem(er), why: (er && er.why) || "" })));
  }
};
post({ type: "hello" });
