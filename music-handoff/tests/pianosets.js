#!/usr/bin/env node
/* The piano's recorded sample sets, checked without a browser (Node and ffmpeg only, no server).

   For every set listed in music-handoff/tools/piano_real_sets.json (written by tools/piano_real_sets.py):
   - coverage: every key the page plays (C1 to C7, MIDI 24 to 96) is within one semitone of a recorded note
     (no more than 3 semitones between notes), and every note has a file for every layer;
   - size: the set's MP3s together are under 3 MB (over 2 MB is reported, not failed);
   - each file decodes as mono MP3 at 44,100 Hz; the note starts (3% of its peak, as the page measures it)
     within 2 ms of the file start; the file starts and ends in silence;
   - tuning: the note's pitch, measured from the decoded file, is within 5 cents of the key (and, for the toy
     piano, within 3 cents of the small detuning it was given on purpose);
   - clicks: no sudden jump anywhere after the first 30 ms of the note (a jump = a burst in the second
     difference of the wave 10 times stronger (20 dB) than its surroundings);
   - loops (held sets): the page's own loader is copied here: the file is decoded at 32,000 Hz, bakeLoop()
     blends the loop end into the loop start, and a held note is played three times round the loop. The blend
     and the jump must add no click, and the blended half second must stay within 1 dB of the same part of the
     note one loop earlier. Checked twice: with the MP3 encoder delay removed (as ffmpeg and most browsers do)
     and kept (25 ms later, as a decoder that ignores it would).

   usage: node music-handoff/tests/pianosets.js [set ...]     (exit code 1 if anything fails) */
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..", "..");
const MANIFEST = path.join(ROOT, "music-handoff", "tools", "piano_real_sets.json");
const AUDIO = path.join(ROOT, "aog-deploy", "audio", "piano");
const SR = 44100, KEY_LO = 24, KEY_HI = 96, MAX_BYTES = 3e6, AIM_BYTES = 2e6;

/* ── decoding ── */
function decode(file, rate, raw) {
  const args = ["-v", "error"].concat(raw ? ["-flags2", "+skip_manual"] : [], ["-i", file, "-ac", "1", "-ar", String(rate || SR), "-f", "f32le", "-"]);
  const buf = execFileSync("ffmpeg", args, { maxBuffer: 1 << 28 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
}
function probe(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name,channels,sample_rate", "-of", "json", file]).toString();
  return JSON.parse(out).streams[0];
}

/* ── FFT (radix 2, in place) ── */
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let j = 0; j < len / 2; j++) {
        const a = i + j, b = a + len / 2;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
function magSpectrum(seg) {
  let n = 1; while (n < 4 * seg.length || n < (1 << 18)) n <<= 1;
  const re = new Float64Array(n), im = new Float64Array(n), L = seg.length;
  for (let i = 0; i < L; i++) re[i] = seg[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (L - 1)));
  fft(re, im);
  const S = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) S[i] = Math.hypot(re[i], im[i]);
  return { S, n };
}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const cents = (f, r) => 1200 * Math.log2(f / r);
function peakNear(sp, f, spanC) {
  const { S, n } = sp, lo = Math.floor(f * Math.pow(2, -spanC / 1200) * n / SR), hi = Math.floor(f * Math.pow(2, spanC / 1200) * n / SR) + 1;
  if (lo < 1 || hi >= S.length - 1) return null;
  let i = lo; for (let k = lo; k <= hi; k++) if (S[k] > S[i]) i = k;
  const a = Math.log(S[i - 1] + 1e-15), b = Math.log(S[i] + 1e-15), c = Math.log(S[i + 1] + 1e-15), den = a - 2 * b + c;
  const p = den !== 0 ? 0.5 * (a - c) / den : 0;
  return { f: (i + p) * SR / n, a: S[i] };
}
/* the note's pitch, measured the way that suits the instrument */
function pitch(seg, f, method) {
  const sp = magSpectrum(seg);
  /* centroid: two reeds, detuned voices, a vibrato: the power-weighted mean frequency near each of the first four
     harmonics. centre: the same near the note itself only (a pan's note rings as two close partials, nearly as
     strong, and the ear hears the middle of the pair) */
  if (method === "centroid" || method === "centre") {
    let num = 0, den = 0;
    for (let k = 1; k <= (method === "centre" ? 1 : 4); k++) {
      const span = 60, lo = Math.floor(k * f * Math.pow(2, -span / 1200) * sp.n / SR), hi = Math.floor(k * f * Math.pow(2, span / 1200) * sp.n / SR) + 1;
      if (hi >= sp.S.length) break;
      let pw = 0, pf = 0;
      for (let i = lo; i <= hi; i++) { const p = sp.S[i] * sp.S[i]; pw += p; pf += p * i * SR / sp.n; }
      num += pw * (pf / pw) / k; den += pw;
    }
    return num / den;
  }
  const ks = method === "fund" ? [1] : [1, 2, 3, 4, 5, 6], est = [];
  ks.forEach(k => { const r = peakNear(sp, k * f, 60); if (r) est.push({ f: r.f / k, a: r.a }); });
  const mx = Math.max.apply(null, est.map(e => e.a));
  const use = est.filter(e => e.a > 0.1 * mx);
  let w = 0, s = 0; use.forEach(e => { w += e.a; s += e.a * e.f; });
  return s / w;
}

/* ── level and clicks ── */
function peakAbs(x, a, b) { let p = 0; for (let i = a || 0; i < (b || x.length); i++) { const v = Math.abs(x[i]); if (v > p) p = v; } return p; }
function rms(x, a, b) { let s = 0; a = Math.max(0, a); b = Math.min(x.length, b); for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); }
const dB = v => 20 * Math.log10(v + 1e-12);
function onsetOf(x) { const pk = peakAbs(x); for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > 0.03 * pk) return i; return 0; }
/* the second difference's energy in 1 ms windows. A click is a window 20 dB stronger than every other window in
   the 70 ms around it (3 ms either side left out). Comparing with the strongest neighbour, not a typical one,
   keeps an instrument's own sharp once-a-cycle peaks (a reed's bark, down to C1's 31 ms cycle) from counting. A
   floor 70 dB under the note's peak keeps codec noise in near-silence from counting. */
function clicks(x, from, to, sr, floorAmp) {
  const w = Math.round(0.001 * sr), n = Math.floor((to - from) / w), e = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let s = 0; const a = from + k * w;
    for (let i = Math.max(1, a); i < Math.min(x.length - 1, a + w); i++) { const d = x[i + 1] - 2 * x[i] + x[i - 1]; s += d * d; }
    e[k] = s / w;
  }
  const floor = Math.pow(floorAmp || 1e-7, 2);
  let worst = 0, at = -1; const R = 35;
  for (let k = 0; k < n; k++) {
    let mx = 0;
    for (let j = Math.max(0, k - R); j < Math.min(n, k + R + 1); j++) if (Math.abs(j - k) > 3 && e[j] > mx) mx = e[j];
    const r = (e[k] + floor) / (mx + floor);
    if (r > worst) { worst = r; at = from + k * w; }
  }
  return { ratioDb: 10 * Math.log10(worst || 1), at: at / sr };
}

/* ── the page's loop: bakeLoop() as music-piano.html has it, then a held note played round the loop ── */
function bakeLoop(d, sr, a, z, x) {
  const A = Math.round(a * sr), Z = Math.min(d.length, Math.round(z * sr)), X = Math.min(Math.round(x * sr), A, Z - A);
  for (let i = 0; i < X; i++) { const w = (i + 0.5) / X * Math.PI / 2, j = Z - X + i, k = A - X + i; d[j] = d[j] * Math.cos(w) + d[k] * Math.sin(w); }
  return { A, Z, X };
}
function loopCheck(file, loop, raw) {
  const sr = 32000, d = Float32Array.from(decode(file, sr, raw));
  const before = Float32Array.from(d);
  const { A, Z, X } = bakeLoop(d, sr, loop[0], loop[1], 0.5);
  const play = new Float32Array(Z + 3 * (Z - A));
  play.set(d.subarray(0, Z));
  for (let r = 0; r < 3; r++) play.set(d.subarray(A, Z), Z + r * (Z - A));
  /* the blended half second against the same stretch one loop earlier (the unblended file), in 20 ms steps */
  const w = Math.round(0.02 * sr); let worst = 0;
  for (let i = Z - X; i + w <= Z; i += w) {
    const now = rms(play, i, i + w), was = rms(before, i - (Z - A), i - (Z - A) + w);
    const dd = Math.abs(dB(now) - dB(was)); if (dd > worst) worst = dd;
  }
  /* clicks around the blend and the jumps, and anywhere in one whole pass round the loop */
  const fl = peakAbs(play) * Math.pow(10, -70 / 20);
  const c1 = clicks(play, Math.max(0, Z - X - Math.round(0.08 * sr)), Math.min(play.length, Z + Math.round(0.12 * sr)), sr, fl);
  const c2 = clicks(play, Z + (Z - A) - Math.round(0.08 * sr), Z + (Z - A) + Math.round(0.08 * sr), sr, fl);
  const c3 = clicks(play, Z, Z + (Z - A), sr, fl);
  /* the level's wobble, 20 ms at a time against the 300 ms around it: across the blend, the jump and a whole
     pass round the loop, it may wobble no more than the note does by itself before its loop (or 1.5 dB) */
  const wob = (x, a, b) => {
    const lv = []; for (let i = a; i + w <= b; i += w) lv.push(dB(rms(x, i, i + w)));
    let mx = 0; const R = 7;
    for (let k = 0; k < lv.length; k++) {
      const nb = lv.slice(Math.max(0, k - R), Math.min(lv.length, k + R + 1)).sort((p, q) => p - q);
      const d = Math.abs(lv[k] - nb[nb.length >> 1]); if (d > mx) mx = d;
    }
    return mx;
  };
  const natural = wob(before, Math.max(Math.round(0.15 * sr), A - X - Math.round(0.6 * sr)), A - X);
  const looped = wob(play, A - X, Z + (Z - A));
  return { swellDb: worst, clickDb: Math.max(c1.ratioDb, c2.ratioDb, c3.ratioDb), wobbleDb: looped, naturalDb: natural };
}

/* ── one set ── */
function checkSet(name, info) {
  const e = info.sets_entry, fails = [], notes = e.notes.slice().sort((a, b) => a - b), layers = e.layers;
  const say = m => fails.push(m);
  /* coverage */
  if (notes.join() !== e.notes.join()) say("notes are not in order");
  for (let i = 1; i < notes.length; i++) if (notes[i] - notes[i - 1] > 3) say(`gap of ${notes[i] - notes[i - 1]} between ${notes[i - 1]} and ${notes[i]}`);
  if (notes[0] > KEY_LO + 1) say(`lowest note ${notes[0]} leaves C1 uncovered`);
  if (notes[notes.length - 1] < KEY_HI - 1) say(`highest note ${notes[notes.length - 1]} leaves C7 uncovered`);
  if (layers.indexOf("m") < 0) say("no m layer (the page waits for every note's m)");
  const dir = path.join(AUDIO, name);
  let bytes = 0;
  const res = { files: 0, onsetMs: 0, cents: [], worstClick: -99, worstSwell: 0, worstLoopClick: -99 };
  notes.forEach(n => layers.forEach(l => {
    const f = path.join(dir, n + l + ".mp3"), key = n + l;
    if (!fs.existsSync(f)) { say(`missing ${key}.mp3`); return; }
    bytes += fs.statSync(f).size; res.files++;
    const p = probe(f);
    if (p.codec_name !== "mp3" || +p.channels !== 1 || +p.sample_rate !== SR) say(`${key}: ${p.codec_name} ${p.channels} ch ${p.sample_rate} Hz`);
    const x = decode(f), pk = peakAbs(x), on = onsetOf(x), onMs = 1000 * on / SR;
    res.onsetMs = Math.max(res.onsetMs, onMs);
    if (onMs > 2) say(`${key}: starts ${onMs.toFixed(1)} ms late`);
    if (peakAbs(x, 0, 4) > 0.01 * pk) say(`${key}: does not start from silence`);
    const tail = rms(x, x.length - Math.round(0.005 * SR), x.length);
    if (!e.loop && dB(tail / pk) > -45) say(`${key}: ends at ${dB(tail / pk).toFixed(0)} dB, not in silence`);
    if (e.loop && x.length < Math.round(e.loop[1] * SR)) say(`${key}: shorter than its loop end`);
    /* tuning */
    const meta = (info.files || {})[key] || {}, want = mtof(n) * Math.pow(2, (meta.detune_c || 0) / 1200);
    const a = e.loop ? Math.round((e.loop[0]) * SR) : on + Math.round(0.03 * SR);
    const b = e.loop ? Math.round((e.loop[1] - 0.6) * SR) : Math.min(x.length - Math.round(0.05 * SR), on + Math.round(Math.max(0.35, Math.min(0.7, 60 / mtof(n))) * SR));
    const fm = pitch(x.subarray(a, b), mtof(n), info.pitch || "harm");
    const c = cents(fm, mtof(n)), cw = cents(fm, want);
    res.cents.push(c);
    if (Math.abs(c) > 5) say(`${key}: ${c.toFixed(1)} cents off`);
    if (meta.detune_c && Math.abs(cw) > 3) say(`${key}: ${cw.toFixed(1)} cents from its intended ${meta.detune_c} cents`);
    /* clicks after the attack */
    const ck = clicks(x, on + Math.round(0.03 * SR), x.length, SR, pk * Math.pow(10, -70 / 20));
    res.worstClick = Math.max(res.worstClick, ck.ratioDb);
    if (ck.ratioDb > 20) say(`${key}: click ${ck.ratioDb.toFixed(0)} dB at ${ck.at.toFixed(3)} s`);
    /* the loop, as the page plays it */
    if (e.loop) [false, true].forEach(raw => {
      const lc = loopCheck(f, e.loop, raw), tag = raw ? " (encoder delay kept)" : "";
      res.worstSwell = Math.max(res.worstSwell, lc.swellDb); res.worstLoopClick = Math.max(res.worstLoopClick, lc.clickDb);
      res.worstWobble = Math.max(res.worstWobble || 0, lc.wobbleDb - lc.naturalDb);
      if (lc.swellDb > 1) say(`${key}: the loop blend moves the level ${lc.swellDb.toFixed(2)} dB${tag}`);
      if (lc.clickDb > 20) say(`${key}: a click at the loop, ${lc.clickDb.toFixed(0)} dB${tag}`);
      if (lc.wobbleDb > Math.max(1.5, lc.naturalDb + 0.75)) say(`${key}: the level wobbles ${lc.wobbleDb.toFixed(2)} dB round the loop (by itself ${lc.naturalDb.toFixed(2)} dB)${tag}`);
    });
  }));
  if (bytes > MAX_BYTES) say(`${(bytes / 1e6).toFixed(2)} MB, over 3 MB`);
  const cs = res.cents;
  const line = `${name.padEnd(10)} ${String(notes.length).padStart(2)} notes ${notes[0]}-${notes[notes.length - 1]} x [${layers.join("")}] ` +
    `${(bytes / 1e6).toFixed(2)} MB${bytes > AIM_BYTES ? " (over 2 MB)" : ""}  tuning ${Math.min.apply(null, cs).toFixed(1)}..${Math.max.apply(null, cs).toFixed(1)} c  ` +
    `onset <= ${res.onsetMs.toFixed(1)} ms  click ${res.worstClick.toFixed(0)} dB` + (e.loop ? `  loop [${e.loop}] blend ${res.worstSwell.toFixed(2)} dB, wobble +${Math.max(0, res.worstWobble).toFixed(2)} dB, click ${res.worstLoopClick.toFixed(0)} dB` : "");
  return { fails, line };
}

function main() {
  if (!fs.existsSync(MANIFEST)) { console.error("no manifest: run music-handoff/tools/piano_real_sets.py first"); process.exit(1); }
  const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8")), want = process.argv.slice(2);
  const names = Object.keys(man.sets).filter(k => !want.length || want.indexOf(k) >= 0);
  let bad = 0;
  names.forEach(k => {
    const { fails, line } = checkSet(k, man.sets[k]);
    console.log((fails.length ? "FAIL " : "ok   ") + line);
    fails.slice(0, 12).forEach(f => console.log("       - " + f));
    if (fails.length > 12) console.log(`       - … and ${fails.length - 12} more`);
    if (fails.length) bad++;
  });
  console.log(bad ? `${bad} of ${names.length} sets fail` : `all ${names.length} sets pass`);
  process.exit(bad ? 1 : 0);
}
main();
