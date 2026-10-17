/* Scoring for the listening engine (aog-learn.js): beat F-measure, chord overlap, note F-measure, and the known answers
   for the starter crate (aog-deploy/_work/crate/make_crate.py made those songs, so their tempo, chords and bass are known). */
const TRACKS = [
  { n: "01", bpm: 90, swing: 0.12, key: 5, prog: [[0, "min"], [0, "min"], [5, "min"], [3, "maj"]], bass: "x......x ..x....." },
  { n: "02", bpm: 80, swing: 0.18, key: 3, prog: [[0, "maj"], [5, "maj"], [2, "min"], [7, "dom"]], bass: "x.....x. ..x....." },
  { n: "03", bpm: 84, swing: 0.0, key: 7, prog: [[0, "maj"], [5, "maj"], [0, "maj"], [7, "maj"]], bass: "x..x.... ..x.x..." },
  { n: "04", bpm: 100, swing: 0.0, key: 0, prog: [[0, "maj"], [5, "maj"], [7, "maj"], [5, "maj"]], bass: "x.......x......." },
  { n: "05", bpm: 102, swing: 0.08, key: 2, prog: [[0, "min"], [5, "dom"], [0, "min"], [5, "dom"]], bass: "x.....x.x.....x." },
  { n: "06", bpm: 106, swing: 0.0, key: 10, prog: [[0, "dom"], [0, "dom"], [5, "dom"], [0, "dom"]], bass: "x.xx..x...x..xx." },
  { n: "07", bpm: 110, swing: 0.0, key: 9, prog: [[0, "min"], [3, "maj"], [5, "min"], [3, "maj"]], bass: "x..x..x...x....." },
  { n: "08", bpm: 114, swing: 0.0, key: 4, prog: [[0, "min"], [0, "min"], [3, "maj"], [5, "min"]], bass: "x.x.......x....." },
  { n: "09", bpm: 120, swing: 0.0, key: 6, prog: [[0, "min"], [0, "min"], [8, "maj"], [10, "maj"]], bass: "..x...x...x...x." },
  { n: "10", bpm: 124, swing: 0.0, key: 1, prog: [[0, "min"], [5, "min"], [8, "maj"], [7, "maj"]], bass: "..x...x...x...xx" },
  { n: "11", bpm: 128, swing: 0.0, key: 11, prog: [[0, "min"], [3, "maj"], [10, "maj"], [5, "min"]], bass: "..x.x.x...x.x.x." },
];
const QMAP = { maj: "maj7", min: "m7", dom: "7" };
function crateTruth(T, offset) {
  offset = offset || 0;
  const SR = 22050, beat = 60 / T.bpm, step = beat / 4, phrases = Math.max(2, Math.min(3, Math.floor(55 * T.bpm / 240 / 8))), bars = 8 * phrases;
  const at = (bar, s) => Math.round((bar * 16 + s) * step * SR + (s % 2 ? T.swing * step * SR : 0)) / SR + offset;
  const pat = T.bass.replace(/ /g, "").split("").map(c => c === "x");
  const beats = [], downbeats = [], chords = [], bass = [];
  for (let b = 0; b < bars * 4; b++) beats.push(b * beat + offset);
  for (let bar = 0; bar < bars; bar++) {
    downbeats.push(bar * 4 * beat + offset);
    const [root, kind] = T.prog[bar % 4];
    if (bar >= 8) chords.push({ t: bar * 4 * beat + offset, d: 4 * beat, root: (9 + T.key + root) % 12, q: QMAP[kind] });
    else if (bar < 4) chords.push({ t: bar * 4 * beat + offset, d: 4 * beat, root: -1, q: "N" });
    if (bar >= 4) pat.forEach((g, s) => { if (!g) return; let nx = 16; for (let k = s + 1; k < 16; k++) if (pat[k]) { nx = k; break; }
      bass.push({ t: at(bar, s), d: (nx - s) * step * 0.92, m: 33 + T.key + root + (s % 8 === 7 && T.bpm > 100 ? 12 : 0) }); });
  }
  return { bpm: T.bpm, beats, downbeats, chords, bass, key: { key: (9 + T.key) % 12, minor: T.prog[0][1] === "min" }, sec: bars * 4 * beat };
}
function fmeasure(est, ref, tol) {
  tol = tol || 0.07; const used = new Uint8Array(est.length); let hit = 0;
  for (const r of ref) { let bi = -1, bd = tol; est.forEach((e, i) => { const d = Math.abs(e - r); if (!used[i] && d <= bd) { bd = d; bi = i; } }); if (bi >= 0) { used[bi] = 1; hit++; } }
  const p = est.length ? hit / est.length : 0, r = ref.length ? hit / ref.length : 0; return p + r ? 2 * p * r / (p + r) : 0;
}
const TRIAD = { maj: "maj", "7": "maj", maj7: "maj", aug: "maj", min: "min", m7: "min", dim: "min", sus2: "sus", sus4: "sus", "5": "5", N: "N" };
/* fraction of the time with a known chord where the found chord agrees
   exact: root and quality · majmin: root and third (a power chord or sus counts) · root: the root · N: "no chord" found where there is none */
function chordAcc(est, ref, mode) {
  let tot = 0, ok = 0;
  for (const r of ref) { if (mode !== "N" && r.root < 0) continue; if (mode === "N" && r.root >= 0) continue;
    tot += r.d;
    for (const e of est) { const ov = Math.min(r.t + r.d, e.t + e.d) - Math.max(r.t, e.t); if (ov <= 0) continue;
      let same;
      if (mode === "N") same = e.root < 0;
      else if (mode === "exact") same = e.root === r.root && e.q === r.q;
      else if (mode === "root") same = e.root === r.root;
      else same = e.root === r.root && (TRIAD[e.q] === TRIAD[r.q] || TRIAD[e.q] === "5" || TRIAD[e.q] === "sus");
      if (same) ok += ov; } }
  return tot ? ok / tot : 1;
}
/* notes: onset within tol and the same pitch (pitch classes only when `pc`) */
function noteF(est, ref, tol, pc) {
  tol = tol || 0.07; const used = new Uint8Array(est.length); let hit = 0;
  for (const r of ref) { let bi = -1, bd = tol; est.forEach((e, i) => { const d = Math.abs(e.t - r.t); const same = pc ? (e.m - r.m) % 12 === 0 : e.m === r.m;
    if (!used[i] && same && d <= bd) { bd = d; bi = i; } }); if (bi >= 0) { used[bi] = 1; hit++; } }
  const p = est.length ? hit / est.length : 0, r = ref.length ? hit / ref.length : 0; return { p, r, f: p + r ? 2 * p * r / (p + r) : 0 };
}
/* how much of the time a known note sounds, the found line has the same pitch */
function pitchOverlap(est, ref, pc) {
  let tot = 0, ok = 0;
  for (const r of ref) { tot += r.d; for (const e of est) { const ov = Math.min(r.t + r.d, e.t + e.d) - Math.max(r.t, e.t);
    if (ov > 0 && (pc ? (e.m - r.m) % 12 === 0 : e.m === r.m)) ok += ov; } }
  return tot ? Math.min(1, ok / tot) : 1;
}
function keyScore(est, ref) { /* MIREX: same 1, fifth 0.5, relative 0.3, parallel 0.2 */
  if (est.key === ref.key && est.minor === ref.minor) return 1;
  if (est.minor === ref.minor && ((est.key - ref.key + 12) % 12 === 7 || (ref.key - est.key + 12) % 12 === 7)) return 0.5;
  if (est.minor !== ref.minor && ((ref.minor ? (ref.key + 3) % 12 : (ref.key + 9) % 12) === est.key)) return 0.3;
  if (est.minor !== ref.minor && est.key === ref.key) return 0.2;
  return 0;
}
/* the song's parts: est and ref are [{t, kind, letter}] in order (each runs to the next; the last to `end`).
   bound: F-measure of the part boundaries (within tol seconds) · kind: share of the time the kind (intro/part/end) agrees ·
   pair: pairwise F of "these two moments are the same part" over the moments both call a part (the letters themselves may
   differ, only which parts are alike counts) */
function sectionScore(est, ref, end, tol) {
  tol = tol || 0.3;
  const bE = est.slice(1).map(s => s.t), bR = ref.slice(1).map(s => s.t);
  const bound = !bR.length && !bE.length ? 1 : fmeasure(bE, bR, tol);
  const at = (list, t) => { let x = null; for (const s of list) if (s.t <= t + 1e-6) x = s; return x; };
  const t0 = Math.max(ref[0].t, est.length ? est[0].t : 0), T = []; for (let t = t0 + 0.05; t < end - 0.05; t += 0.25) T.push(t);
  let kOk = 0; const P = [];
  T.forEach(t => { const r = at(ref, t), e = at(est, t); if (r && e && r.kind === e.kind) kOk++; if (r && e && r.kind === "part" && e.kind === "part") P.push([r.letter, e.letter]); });
  let both = 0, onlyR = 0, onlyE = 0;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const sr = P[i][0] === P[j][0], se = P[i][1] === P[j][1];
    if (sr && se) both++; else if (sr) onlyR++; else if (se) onlyE++; }
  const pp = both + onlyE ? both / (both + onlyE) : 1, pr = both + onlyR ? both / (both + onlyR) : 1;
  return { bound, kind: T.length ? kOk / T.length : 1, pair: pp + pr ? 2 * pp * pr / (pp + pr) : 0 };
}
module.exports = { TRACKS, crateTruth, fmeasure, chordAcc, noteF, pitchOverlap, keyScore, sectionScore };
