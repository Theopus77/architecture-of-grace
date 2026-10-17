/* AOG-DESK-WARP-V1 (2026-10-17) — the Mixing Desk's time-stretch, in a Worker, so the page stays easy to use while a
   recording is made slower or faster (its speed, or Follow the song's tempo). The very same steps as the desk's own
   wsola() in music-studio.html (keep the two in step): the recording cut into 40 ms windows laid down at the new pace,
   each taken from where it best matches the sound before it (looking `tol` seconds either way), so nothing warbles.
   In:  {id, ch:[Float32Array …], sp, tol, sr}      Out: {id, out:[Float32Array …]} */
"use strict";
function wsola(X, sr, sp, tolSec) {
  const nch = X.length, n = X[0].length;
  const H = Math.max(64, Math.round(0.02 * sr)), N = 2 * H, tol = Math.round((tolSec || 0.012) * sr), Ha = H * sp, outN = Math.max(1, Math.round(n / sp));
  const Y = []; for (let ch = 0; ch < nch; ch++) Y.push(new Float32Array(outN + N));
  const W = new Float32Array(N); for (let j = 0; j < N; j++) W[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / N);
  const Q = 4, m = Math.floor(n / Q), D = new Float32Array(m + 1);
  for (let i = 0; i < m; i++) { let v = 0; const o = i * Q; for (let ch = 0; ch < nch; ch++) { const x = X[ch]; v += x[o] + x[o + 1] + x[o + 2] + x[o + 3]; } D[i] = v; }
  const Hq = Math.floor(H / Q), tq = Math.floor(tol / Q);
  let prev = 0, k = 0;
  for (let op = 0; op < outN; op += H, k++) {
    const nom = Math.round(k * Ha); let pos;
    if (k === 0) pos = 0;
    else {
      const tgt = prev + H;
      if (tgt + N >= n || nom + tol + N >= n) { pos = Math.max(0, Math.min(nom, n - N)); }
      else {
        const tg = Math.floor(tgt / Q), lo = Math.max(0, Math.floor(nom / Q) - tq), hi = Math.min(m - Hq - 1, Math.floor(nom / Q) + tq);
        let best = -Infinity, bq = Math.floor(nom / Q);
        for (let q = lo; q <= hi; q++) { let v = 0; for (let j = 0; j < Hq; j++) v += D[tg + j] * D[q + j]; if (v > best) { best = v; bq = q; } }
        let fb = -Infinity, fp = Math.max(0, Math.min(n - N - 1, bq * Q));
        for (let q = Math.max(0, bq * Q - Q); q <= Math.min(n - N - 1, bq * Q + Q); q++) {
          let v = 0; for (let j = 0; j < H; j += 2) { let a = 0, b = 0; for (let ch = 0; ch < nch; ch++) { a += X[ch][tgt + j]; b += X[ch][q + j]; } v += a * b; }
          if (v > fb) { fb = v; fp = q; } }
        pos = fp;
      }
    }
    for (let ch = 0; ch < nch; ch++) { const x = X[ch], y = Y[ch], L = Math.min(N, n - pos);
      if (k === 0) { for (let j = 0; j < L; j++) y[op + j] += x[pos + j] * (j < H ? 1 : W[j]); }
      else for (let j = 0; j < L; j++) y[op + j] += x[pos + j] * W[j]; }
    prev = pos;
  }
  return Y.map(y => y.slice(0, outN));
}
self.onmessage = e => {
  const d = e.data || {};
  try { const out = wsola(d.ch, d.sr, d.sp, d.tol); self.postMessage({ id: d.id, out: out }, out.map(a => a.buffer)); }
  catch (err) { self.postMessage({ id: d.id, out: null }); }
};
