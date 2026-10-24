/* AOG-STRETCH-PRO-V1 in node: the desk's new time-stretch (aog-deploy/aog-stretch.js) against its first one (WSOLA in
   40 ms windows, aog-desk-warp.js, the same steps as music-studio.html wsola), on sounds made here:
   · drum hits (kick, snare, hat in 16ths at 120, stereo), alone and over a held chord;
   · a held chord, a voice-like tone (140 Hz with vibrato and vowels) and stereo noise.
   At 0.75×, 0.9×, 1.1×, 1.25× and 1.5× it measures, old against new:
   · each hit's timing (the first sample over half its peak, against the original's at time/speed): at most 1 ms;
   · each hit's peak: within 1 dB of the original;
   · the length: exactly round(length / speed);
   · clicks: the largest sample-to-sample jump, against the source's;
   · on the chord and the voice, the frame-to-frame spectral flux (warble), against the original's;
   · left and right moved together (a side made of the other, inverted and halved, stays exactly that);
   · the work: about a second per minute of stereo, or better.
   node music-handoff/tests/unit/stretch.js [--table] */
const fs = require("fs"), path = require("path"), vm = require("vm");
const WT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const PRO = require(path.join(WT, "aog-stretch.js"));
/* the first stretch, exactly as the desk's Worker runs it */
const oldSrc = fs.readFileSync(path.join(WT, "aog-desk-warp.js"), "utf8"), sb = { self: {}, Float32Array, Math };
vm.createContext(sb); vm.runInContext(oldSrc + ";self.__w=wsola;", sb);
const OLD = (X, sr, sp) => sb.self.__w(X, sr, sp, 0.012);
const NEW = (X, sr, sp) => PRO.stretch(X, sr, sp).out;
const TABLE = process.argv.includes("--table");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };

/* ── sounds ── */
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 * 2 - 1; }; }
function drums(sr, sec, opts) {
  opts = opts || {};
  const n = Math.round(sec * sr), L = new Float32Array(n), R = new Float32Array(n), r = rng(7), hits = [];
  const step = 0.125, first = opts.first != null ? opts.first : 0.1;
  for (let k = 0; first + k * step < sec - 0.3; k++) {
    const t = first + k * step, at = Math.round(t * sr), kind = k % 8 === 0 || k % 8 === 3 ? "kick" : k % 4 === 2 ? "snare" : "hat";
    const gain = kind === "hat" ? 0.35 + 0.1 * (k % 3) : kind === "snare" ? 0.7 : 0.9, pan = kind === "hat" ? 0.3 : 0;
    let ph = 0;
    for (let i = 0; i < Math.round(0.25 * sr) && at + i < n; i++) {
      const s = i / sr; let v = 0;
      if (kind === "kick") { const f = 50 + 110 * Math.exp(-s / 0.03); ph += 2 * Math.PI * f / sr; v = Math.sin(ph) * Math.exp(-s / 0.12) + (i < 0.002 * sr ? 0.5 * r() : 0); }
      else if (kind === "snare") { ph += 2 * Math.PI * 190 / sr; v = 0.5 * Math.sin(ph) * Math.exp(-s / 0.05) + 0.6 * r() * Math.exp(-s / 0.07); }
      else { v = r() * Math.exp(-s / 0.025); }
      v *= gain * Math.min(1, (0.25 * sr - i) / (0.01 * sr)); L[at + i] += v * (1 - pan); R[at + i] += v * (1 + pan) * 0.9;
    }
    hits.push({ t: at / sr, kind });
  }
  if (opts.bed) { const c = chord(sr, sec, 0.12); for (let i = 0; i < n; i++) { L[i] += c[0][i]; R[i] += c[1][i]; } }
  return { X: [L, R], hits };
}
function chord(sr, sec, amp) {
  const n = Math.round(sec * sr), L = new Float32Array(n), R = new Float32Array(n), f0 = [130.81, 164.81, 196.0, 261.63];
  for (let i = 0; i < n; i++) {
    const s = i / sr, env = Math.min(1, s / 0.02) * Math.min(1, (sec - s) / 0.05); let l = 0, rr = 0;
    for (const f of f0) for (let h = 1; h <= 6; h++) { const a = 1 / h; l += a * Math.sin(2 * Math.PI * f * h * s + h); rr += a * Math.sin(2 * Math.PI * f * 1.0007 * h * s + 2 * h); }
    L[i] = amp * env * l / 6; R[i] = amp * env * rr / 6;
  }
  return [L, R];
}
function voice(sr, sec) {
  const n = Math.round(sec * sr), L = new Float32Array(n), F = [[700, 1220, 2600], [300, 2300, 3000], [500, 900, 2400]];
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const s = i / sr, f = 140 * (1 + 0.015 * Math.sin(2 * Math.PI * 5.5 * s)), fm = F[Math.floor(s / 0.9) % 3];
    ph += 2 * Math.PI * f / sr; let v = 0;
    for (let h = 1; h * f < 5000; h++) { const hf = h * f; let a = 0; for (const c of fm) a += 1 / (1 + Math.pow((hf - c) / 120, 2)); v += a * Math.sin(h * ph) / Math.sqrt(h); }
    L[i] = 0.12 * v * Math.min(1, s / 0.05) * Math.min(1, (sec - s) / 0.05) * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.7 * s));
  }
  return [L, Float32Array.from(L, v => v * 0.8)];
}
function noise(sr, sec) { const n = Math.round(sec * sr), a = rng(3), b = rng(11), L = new Float32Array(n), R = new Float32Array(n); for (let i = 0; i < n; i++) { L[i] = 0.3 * a(); R[i] = 0.3 * b(); } return [L, R]; }

/* ── measures ── */
function absMax(X, a, b) { let m = 0; for (const x of X) for (let i = Math.max(0, a); i < Math.min(x.length, b); i++) m = Math.max(m, Math.abs(x[i])); return m; }
/* where a hit starts: its high end (the first difference, both channels, over 0.25 ms) first reaches half its peak near c */
function edge(X, c, sr, back, fwd) {
  const a = Math.max(1, Math.round(c - back * sr)), b = Math.min(X[0].length, Math.round(c + fwd * sr)), g = Math.max(1, Math.round(0.00025 * sr)), d = new Float32Array(b - a);
  for (let i = a; i < b; i++) for (const x of X) d[i - a] += Math.abs(x[i] - x[i - 1]);
  const e = new Float32Array(d.length); let s = 0; for (let i = 0; i < d.length; i++) { s += d[i] - (i >= g ? d[i - g] : 0); e[i] = s; }
  let pk = 0; for (const v of e) pk = Math.max(pk, v);
  for (let i = 0; i < e.length; i++) if (e[i] >= 0.5 * pk) return { at: a + i - (g >> 1), pk: absMax(X, a + i, a + i + Math.round(0.03 * sr)) };
  return { at: -1, pk: 0 };
}
function hitsOf(X, Y, hits, sr, sp) {
  let worst = 0, sum = 0, late = 0, loss = 0, cnt = 0;
  for (const h of hits) {
    const e0 = edge(X, h.t * sr, sr, 0.004, 0.01), want = e0.at / sp, e1 = edge(Y, want, sr, 0.025, 0.025);
    if (e1.at < 0) { worst = Infinity; continue; }
    const err = (e1.at - want) / sr * 1000; worst = Math.max(worst, Math.abs(err)); sum += Math.abs(err); late = Math.max(late, err); cnt++;
    const pk1 = e1.pk, d = 20 * Math.log10(pk1 / e0.pk);   /* each over the 30 ms from its own attack */
    loss = Math.max(loss, Math.abs(d));
  }
  return { worst, mean: sum / Math.max(1, cnt), late, loss };
}
function jump(X) { let m = 0; for (const x of X) for (let i = 1; i < x.length; i++) m = Math.max(m, Math.abs(x[i] - x[i - 1])); return m; }
/* frame-to-frame spectral flux: the mean of Σ(|X_t| − |X_t−1|)² / Σ|X_t|², 2048-point frames every 512, over the middle */
function flux(x, sr) {
  const N = 2048, hop = 512, w = new Float32Array(N).map((_, j) => 0.5 - 0.5 * Math.cos(2 * Math.PI * j / N));
  const a = Math.round(0.25 * sr), b = x.length - Math.round(0.25 * sr) - N; let prev = null, s = 0, c = 0;
  const re = new Float32Array(N), im = new Float32Array(N);
  for (let p = a; p < b; p += hop) {
    for (let j = 0; j < N; j++) { re[j] = x[p + j] * w[j]; im[j] = 0; }
    fftN(re, im); const mg = new Float32Array(N / 2); let e = 0;
    for (let k = 0; k < N / 2; k++) { mg[k] = Math.hypot(re[k], im[k]); e += mg[k] * mg[k]; }
    if (prev) { let d = 0; for (let k = 0; k < N / 2; k++) d += (mg[k] - prev[k]) ** 2; s += d / Math.max(1e-20, e); c++; }
    prev = mg;
  }
  return s / Math.max(1, c);
}
function fftN(re, im) {
  const N = re.length;
  for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= N; len <<= 1) { const ang = -2 * Math.PI / len;
    for (let i = 0; i < N; i += len) for (let j = 0; j < len / 2; j++) { const wr = Math.cos(ang * j), wi = Math.sin(ang * j), a = i + j, b = a + len / 2;
      const xr = re[b] * wr - im[b] * wi, xi = re[b] * wi + im[b] * wr; re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi; } }
}

/* ── the runs ── */
const SPEEDS = [0.75, 0.9, 1.1, 1.25, 1.5], sr = 44100;
const rows = [];
const kit = drums(sr, 4), bed = drums(sr, 4, { bed: true, first: 0.15 }), ch = chord(sr, 3, 0.5), vo = voice(sr, 3), nz = noise(sr, 2);
const jSrc = { kit: jump(kit.X), bed: jump(bed.X), chord: jump(ch), voice: jump(vo), noise: jump(nz) };
const fSrc = { chord: flux(ch[0], sr), voice: flux(vo[0], sr) };
for (const sp of SPEEDS) {
  for (const [name, fn] of [["old", OLD], ["new", NEW]]) {
    const r = { sp, name };
    const yk = fn(kit.X, sr, sp), yb = fn(bed.X, sr, sp), yc = fn(ch, sr, sp), yv = fn(vo, sr, sp), yn = fn(nz, sr, sp);
    r.kit = hitsOf(kit.X, yk, kit.hits, sr, sp); r.bed = hitsOf(bed.X, yb, bed.hits, sr, sp);
    r.len = [[kit.X, yk], [bed.X, yb], [ch, yc], [vo, yv], [nz, yn]].every(([x, y]) => y.length === 2 && y[0].length === Math.round(x[0].length / sp) && y[1].length === y[0].length);
    r.jump = Math.max(jump(yk) / jSrc.kit, jump(yb) / jSrc.bed, jump(yc) / jSrc.chord, jump(yv) / jSrc.voice, jump(yn) / jSrc.noise);
    r.fc = flux(yc[0], sr) / fSrc.chord; r.fv = flux(yv[0], sr) / fSrc.voice;
    rows.push(r);
  }
}
const f1 = v => (v === Infinity ? "lost" : v.toFixed(1));
if (TABLE) {
  console.log("speed engine | kit: worst ms, mean ms, peak dB | kit over chord: worst ms, peak dB | jump × source | flux × original: chord, voice");
  rows.forEach(r => console.log(`${r.sp.toFixed(2)}× ${r.name} | ${f1(r.kit.worst)}, ${f1(r.kit.mean)}, ${r.kit.loss.toFixed(2)} | ${f1(r.bed.worst)}, ${r.bed.loss.toFixed(2)} | ${r.jump.toFixed(2)} | ${r.fc.toFixed(2)}, ${r.fv.toFixed(2)}`));
}
for (const sp of SPEEDS) {
  const o = rows.find(r => r.sp === sp && r.name === "old"), n = rows.find(r => r.sp === sp && r.name === "new");
  ok(n.kit.worst <= 1 && n.bed.worst <= 1, `${sp}×: every hit lands within ${f1(Math.max(n.kit.worst, n.bed.worst))} ms of its new time (at most 1; the first stretch: ${f1(Math.max(o.kit.worst, o.bed.worst))} ms, up to ${f1(Math.max(o.kit.late, o.bed.late))} ms late)`);
  ok(n.kit.loss <= 1 && n.bed.loss <= 1, `${sp}×: every hit keeps its peak within ${Math.max(n.kit.loss, n.bed.loss).toFixed(2)} dB (at most 1; the first stretch: ${Math.max(o.kit.loss, o.bed.loss).toFixed(2)} dB)`);
  ok(n.len, `${sp}×: every sound is exactly round(length / speed) samples, in both channels`);
  ok(n.jump <= 1.25, `${sp}×: no clicks: the largest sample jump is ${n.jump.toFixed(2)}× the source's (at most 1.25; the first stretch: ${o.jump.toFixed(2)}×)`);
  ok(n.fc <= Math.max(1.5, o.fc) && n.fv <= Math.max(1.5, o.fv), `${sp}×: no warble: frame-to-frame spectral flux ${n.fc.toFixed(2)}× the original's on the held chord, ${n.fv.toFixed(2)}× on the voice (the first stretch: ${o.fc.toFixed(2)}×, ${o.fv.toFixed(2)}×)`);
}
/* the hits stay where they were found: the onsets the engine locked are the hits */
{
  const on = PRO.onsets(kit.X, sr).map(o => o.at / sr), miss = kit.hits.filter(h => !on.some(t => Math.abs(t - h.t) < 0.002)).length, extra = on.filter(t => !kit.hits.some(h => Math.abs(t - h.t) < 0.002)).length;
  ok(miss === 0 && extra === 0, `all ${kit.hits.length} hits are found within 2 ms (${miss} missed, ${extra} extra)`);
  const onB = PRO.onsets(bed.X, sr).map(o => o.at / sr), missB = bed.hits.filter(h => !onB.some(t => Math.abs(t - h.t) < 0.002)).length;
  ok(missB === 0, `over a held chord too (${missB} of ${bed.hits.length} missed)`);
  const onN = PRO.onsets(nz, sr).length, onC = PRO.onsets(ch, sr).length;
  ok(onN <= 1 && onC <= 1, `steady noise and a held chord have no hits to lock but their start (${onN}, ${onC})`);
}
/* left and right together */
{
  const L = bed.X[0], R = Float32Array.from(L, v => -0.5 * v), y = PRO.stretch([L, R], sr, 1.25).out; let m = 0;
  for (let i = 0; i < y[0].length; i++) m = Math.max(m, Math.abs(y[1][i] + 0.5 * y[0][i]));
  ok(m < 1e-6, `left and right move together: a side that is the other inverted and halved stays exactly that (off by ${m.toExponential(1)})`);
  const y1 = PRO.stretch(kit.X, sr, 1.1).out, y2 = PRO.stretch(kit.X, sr, 1.1).out;
  ok(y1[0].every((v, i) => v === y2[0][i]), "the same sound and speed give the same bits every time");
  const y48 = PRO.stretch(drums(48000, 2).X, 48000, 1.25).out, k48 = drums(48000, 2);
  const h48 = hitsOf(k48.X, y48, k48.hits, 48000, 1.25);
  ok(h48.worst <= 1 && h48.loss <= 1, `at 48 kHz too: hits within ${f1(h48.worst)} ms, peaks within ${h48.loss.toFixed(2)} dB`);
  const one = PRO.stretch([kit.X[0]], sr, 0.8).out;
  ok(one.length === 1 && one[0].length === Math.round(kit.X[0].length / 0.8), "one channel in, one channel out");
}
/* the far ends the desk can ask for (Follow the tempo goes from 0.25× to 4×, a pitch shift divides by up to 2): whole, clean */
for (const sp of [0.25, 0.5, 2, 3, 4]) {
  const y = PRO.stretch(bed.X, sr, sp).out, n = Math.round(bed.X[0].length / sp), fin = y.every(c => c.every(v => isFinite(v))), j = jump(y) / jSrc.bed;
  ok(y[0].length === n && y[1].length === n && fin && j <= 1.25, `${sp}×: exactly ${n} samples, every one a number, the largest jump ${j.toFixed(2)}× the source's`);
}
/* very short sounds and silence */
{
  let good = true; const bad = [];
  for (const len of [1, 64, 500, 2000, 6000]) for (const sp of [0.75, 1.5]) { const x = [Float32Array.from({ length: len }, (_, i) => Math.sin(i / 7) * (i < 40 ? i / 40 : 1)), new Float32Array(len)];
    const y = PRO.stretch(x, sr, sp).out; if (y[0].length !== Math.max(1, Math.round(len / sp)) || !y[0].every(isFinite)) { good = false; bad.push(len + "@" + sp); } }
  const z = PRO.stretch([new Float32Array(44100), new Float32Array(44100)], sr, 1.25).out;
  ok(good && z[0].every(v => v === 0), "very short sounds (1 to 6000 samples) and silence come out whole and clean " + bad.join(","));
}
/* the work: a minute of stereo (drums over a chord), in processor time (this machine is often busy with other suites) */
{
  const big = drums(sr, 60, { bed: true }), cpu = fn => { const c0 = process.cpuUsage(); fn(); const c = process.cpuUsage(c0); return (c.user + c.system) / 1000; };
  let best = Infinity, tOld = Infinity;
  for (let k = 0; k < 3; k++) best = Math.min(best, cpu(() => PRO.stretch(big.X, sr, 1.1)));
  for (let k = 0; k < 2; k++) tOld = Math.min(tOld, cpu(() => OLD(big.X, sr, 1.1)));
  ok(best <= 1000, `a minute of stereo takes ${Math.round(best)} ms of processor time (about a second or better; the first stretch: ${Math.round(tOld)} ms)`);
}
console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
