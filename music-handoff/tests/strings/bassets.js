/* The recorded bass sets (AOG-REALBASS-V1): aog-deploy/audio/bass/<set>/set.json and its MP3s, made by
   music-handoff/tools/bass/build_bass_sets.py. Node only: no browser, no port; ffmpeg decodes the MP3s.
     node music-handoff/tests/strings/bassets.js            (every set in aog-deploy/audio/bass)
     node music-handoff/tests/strings/bassets.js growly     (one set)
   For every set:
   - set.json keeps the shared format; every file it names is there, and nothing else is;
   - every file is a mono MP3, 44,100 Hz, 128 kbps, and decodes;
   - every zone: the pluck (its first sample within 40 dB of its loudest) is within 2 ms of the file start, and it is
     the pluck (it climbs to within 20 dB of the peak in 3.5 ms; the file begins from silence, not inside the attack);
     its pitch, measured the way the build measures it (YIN over the steady part), is within 5 cents of m once c is
     applied; no click at the start or the end (no step bigger than the biggest step of the note's own first cycle);
     at most 6 s, and a file shorter than 6 s has died away before it ends; it ends on silence;
   Checked by putting faults in on purpose: a wrong c, a wrong level or bitrate, a stray file, silence or hiss left in
   front of the pluck, and a pluck cut into, all fail.
   - coverage: held notes from E1 (28) to at least G3 (55), no more than 3 semitones apart; every layer has every note;
     at least 2 layers; at least 2 takes in the low and middle range; at least 3 release noises (growly: scrapes too);
   - loudness (K-weighted, the loudest 400 ms, times g): each layer within 1.5 dB of its own middle along the neck, and
     the layers louder in order;
   - each set is at most 4 MB; CREDITS.txt is there in English and Spanish.
   AOG-STRINGS-REAL-V1 (2026-10-04): an organ set made to loop (every zone has lp: [loop start, loop end] in seconds of its
   own file; cosmo) plays one take of each note, needs no release noises, and may reach the top of the neck by playing
   its notes faster (maxShift up to 24: its highest note + maxShift reaches 60); its loops must lie inside the file, last
   at least 0.1 s and join without a click. A noise may also be a "slap" (the thumb on muted strings: growly).
   AOG-BASS-SYNTH-V1 (2026-10-04): a set recorded from a real synthesizer ("play":"straight" after "tuning": synthbass and
   acidbass, a Roland SH-2, music-handoff/tools/bass/build_synth_bass_sets.py) may be public domain under the Unlicense as
   well as CC0, and may reach the top of the neck by playing its notes faster, as a looped set does (its highest note +
   maxShift reaches 60, maxShift up to 24). A synthesizer sounds the same every time a key is pressed and makes no sound
   of a hand when a key is let go, so such a set needs one take of each note and no release noises. Its strengths were
   recorded with the synth's filter opening wider the harder a key is played, at one loudness (the page sets the
   loudness from how hard a note is played): so its layers are checked to get brighter in order (the spectral centroid
   up to 5.9 kHz of the first 186 ms, the median along the neck), not louder. A resonant synth's wave can peak once a cycle, late in
   its first cycle: a zone of such a set climbs to within 20 dB of its peak within its first cycle (at most 15 ms, as
   for a looped set, or one period of its note if that is longer). Every other check is the same. */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..", "..", "..", "aog-deploy", "audio", "bass");
const SR = 44100;
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };

/* ---------------------------------------------------------------- decoding */
function probe(f) {
  const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,channels,sample_rate,bit_rate",
    "-of", "json", f]).toString());
  return j.streams[0];
}
function decode(f) {
  const b = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-f", "f32le", "-acodec", "pcm_f32le", "-"], { maxBuffer: 1 << 28 });
  const a = new Float32Array(b.length / 4);
  for (let i = 0; i < a.length; i++) a[i] = b.readFloatLE(i * 4);
  return Float64Array.from(a);
}

/* ---------------------------------------------------------------- the measures (as build_bass_sets.py) */
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);
function peakOf(x) { let p = 0; for (let i = 0; i < x.length; i++) p = Math.max(p, Math.abs(x[i])); return p; }
function onset(x) { const t = peakOf(x) * Math.pow(10, -40 / 20); for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) >= t) return i; return 0; }
function biquad(b, a, x) {           /* direct form II transposed, as scipy's lfilter */
  const y = new Float64Array(x.length); let z1 = 0, z2 = 0;
  for (let i = 0; i < x.length; i++) { const v = x[i], o = b[0] * v + z1; z1 = b[1] * v - a[1] * o + z2; z2 = b[2] * v - a[2] * o; y[i] = o; }
  return y;
}
function kCoeffs(sr) {
  let f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196;
  let K = Math.tan(Math.PI * f0 / sr); const Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416), a0 = 1 + K / Q + K * K;
  const pb = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0], pa = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0];
  f0 = 38.13547087602444; Q = 0.5003270373238773; K = Math.tan(Math.PI * f0 / sr); const d = 1 + K / Q + K * K;
  return [pb, pa, [1, -2, 1], [1, 2 * (K * K - 1) / d, (1 - K / Q + K * K) / d]];
}
function loud400(x) {
  const [pb, pa, rb, ra] = kCoeffs(SR); const y = biquad(rb, ra, biquad(pb, pa, x)), n = Math.floor(0.4 * SR), N = Math.max(n, y.length);
  const c = new Float64Array(N + 1); for (let i = 0; i < N; i++) c[i + 1] = c[i] + (i < y.length ? y[i] * y[i] : 0);
  let best = 0; for (let s = 0; s + n <= N; s += Math.floor(0.01 * SR)) best = Math.max(best, (c[s + n] - c[s]) / n);
  return -0.691 + 10 * Math.log10(best + 1e-20);
}
function lowpass(fc) {
  const w = 2 * Math.PI * fc / SR, al = Math.sin(w) / Math.SQRT2, cw = Math.cos(w);   /* Q = 1/sqrt(2): 2Q = sqrt(2) */
  return [[(1 - cw) / 2 / (1 + al), (1 - cw) / (1 + al), (1 - cw) / 2 / (1 + al)], [1, -2 * cw / (1 + al), (1 - al) / (1 + al)]];
}
const STEADY = { sus: [0.3, 2.0, 30], stac: [0.04, 0.4, 15] };
function steadyEnd(x, on, ta, tmax, drop) {
  const w = Math.floor(0.02 * SR), n = Math.floor((x.length - on) / w), e = [];
  for (let k = 0; k < n; k++) { let s = 0; for (let i = on + k * w; i < on + (k + 1) * w; i++) s += x[i] * x[i]; e.push(20 * Math.log10(Math.sqrt(s / w) + 1e-12)); }
  const top = Math.max(...e);
  for (let k = Math.round(ta / 0.02); k < n; k++) if (e[k] < top - drop) return Math.min(k * 0.02, tmax);
  return Math.min(n * 0.02, tmax);
}
function yinFrame(y, s, W, tmin, tmax) {
  const d = new Float64Array(tmax + 1);
  for (let t = 1; t <= tmax; t++) { let acc = 0; for (let j = 0; j < W; j++) { const q = y[s + j] - y[s + j + t]; acc += q * q; } d[t] = acc; }
  const dp = new Float64Array(tmax + 1); dp[0] = 1; let cum = 0;
  for (let t = 1; t <= tmax; t++) { cum += d[t]; dp[t] = d[t] * t / Math.max(cum, 1e-30); }
  let t = -1; const t0 = Math.max(tmin, 2);
  for (let k = t0; k < tmax; k++) if (dp[k] < 0.15) { while (k + 1 < tmax && dp[k + 1] < dp[k]) k++; t = k; break; }
  if (t < 0) { t = t0; for (let k = t0; k < tmax; k++) if (dp[k] < dp[t]) t = k; }
  const den = d[t - 1] - 2 * d[t] + d[t + 1], off = den !== 0 ? 0.5 * (d[t - 1] - d[t + 1]) / den : 0;
  return [SR / (t + off), dp[t]];
}
function median(a) { const s = a.slice().sort((p, q) => p - q), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; }
function pitchCents(x, m, kind) {
  const on = onset(x), f0 = midiHz(m), [b, a] = lowpass(Math.min(6 * f0, 4000)), y = biquad(b, a, x);
  const [ta, tm, drop] = STEADY[kind], tb = steadyEnd(x, on, ta, tm, drop);
  const fmin = f0 * Math.pow(2, -4 / 12), fmax = f0 * Math.pow(2, 4 / 12);
  const tmax = Math.ceil(SR / fmin), tmin = Math.floor(SR / fmax), W = Math.ceil(2.5 * SR / fmin), res = [];
  for (let s = on + Math.round(ta * SR), last = on + Math.round(tb * SR); s <= last && s + W + tmax + 1 <= y.length; s += Math.floor(0.01 * SR))
    res.push(yinFrame(y, s, W, tmin, tmax));
  let good = res.filter(r => r[1] < 0.2).map(r => r[0]);
  if (good.length < 5) good = res.slice().sort((p, q) => p[1] - q[1]).slice(0, 5).filter(r => r[1] < 0.5).map(r => r[0]);
  return [median(good.map(f => 1200 * Math.log2(f / f0))), good.length];
}
function maxStep(x, from, to) { let s = 0; for (let i = Math.max(from, 0); i < Math.min(to, x.length); i++) s = Math.max(s, Math.abs(x[i] - (i > 0 ? x[i - 1] : 0))); return s; }
function rmsPow(x, a, b) { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return s / Math.max(1, b - a); }
function rmsDb(x, a, b) { return 10 * Math.log10(rmsPow(x, a, b) + 1e-30); }

/* ---------------------------------------------------------------- one set */
function checkSet(id) {
  const dir = path.join(ROOT, id), jf = path.join(dir, "set.json");
  ok(fs.existsSync(jf), `${id}: set.json is there`); if (!fs.existsSync(jf)) return;
  let S; try { S = JSON.parse(fs.readFileSync(jf, "utf8")); ok(true, `${id}: set.json reads as JSON`); } catch (e) { ok(false, `${id}: set.json reads as JSON (${e.message})`); return; }
  /* the shared format */
  const synth = S.play === "straight";   /* AOG-BASS-SYNTH-V1: recorded from a real synthesizer */
  const keys = ["id", "instrument", "name", "source", "license", "tuning"].concat(synth ? ["play"] : [], ["zones", "vel", "noise", "maxShift"]);
  ok(JSON.stringify(Object.keys(S)) === JSON.stringify(keys), `${id}: the keys, in order: ${Object.keys(S).join(",")}`);
  ok(S.id === id && S.instrument === "bass" && (S.license === "CC0-1.0" || (synth && S.license === "Unlicense")) && typeof S.source === "string" && S.source.length > 3 &&
    S.name && typeof S.name.en === "string" && typeof S.name.es === "string" && S.name.en && S.name.es,
    `${id}: id, instrument "bass", names in English and Spanish ("${S.name && S.name.en}" / "${S.name && S.name.es}"), source, ${S.license}`);
  ok(Array.isArray(S.tuning) && S.tuning.length === 4 && S.tuning.every((t, i) => Number.isInteger(t) && (!i || t > S.tuning[i - 1])), `${id}: tuning ${JSON.stringify(S.tuning)}`);
  const looped = S.zones.length > 0 && S.zones.every(z => Array.isArray(z.lp));
  ok(looped || synth ? Number.isInteger(S.maxShift) && S.maxShift >= 3 && S.maxShift <= 24 : S.maxShift === 3, `${id}: maxShift ${S.maxShift}${looped ? " (a looped set)" : synth ? " (a synthesizer)" : ""}`);
  const zk = ["f", "m", "c", "s", "v", "r", "k", "g"].concat(looped ? ["lp"] : []), nk = ["f", "k", "r", "g"];
  const badZ = S.zones.filter(z => JSON.stringify(Object.keys(z)) !== JSON.stringify(zk) || typeof z.f !== "string" || !Number.isInteger(z.m) ||
    (looped && !(z.lp.length === 2 && z.lp[0] > 0 && z.lp[1] - z.lp[0] >= 0.1)) ||
    typeof z.c !== "number" || !(z.s === null || (Number.isInteger(z.s) && z.s >= 0 && z.s < S.tuning.length)) || !Number.isInteger(z.v) || z.v < 1 ||
    !Number.isInteger(z.r) || z.r < 1 || !["sus", "stac"].includes(z.k) || !(z.g > 0));
  ok(S.zones.length > 0 && !badZ.length, `${id}: ${S.zones.length} zones, each {f,m,c,s,v,r,k,g} ${badZ.map(z => z.f).join(" ")}`);
  const badN = S.noise.filter(n => JSON.stringify(Object.keys(n)) !== JSON.stringify(nk) || !["release", "fingering", "scrape", "slap"].includes(n.k) || !Number.isInteger(n.r) || !(n.g > 0));
  ok(!badN.length, `${id}: ${S.noise.length} noises, each {f,k,r,g} ${badN.map(n => n.f).join(" ")}`);
  const susV = [...new Set(S.zones.filter(z => z.k === "sus").map(z => z.v))].sort((a, b) => a - b);
  ok(susV.length >= 2 && susV.every((v, i) => v === i + 1), `${id}: held-note layers ${susV.join(",")}`);
  ok(Array.isArray(S.vel) && S.vel.length === susV.length && S.vel[0] === 0 && S.vel.every((v, i) => !i || v > S.vel[i - 1]) && S.vel[S.vel.length - 1] < 1,
    `${id}: vel ${JSON.stringify(S.vel)}: one lower bound per layer, from 0, rising`);
  const named = new Set([...S.zones.map(z => z.f), ...S.noise.map(n => n.f)]);
  const there = fs.readdirSync(dir).filter(f => f !== "set.json");
  const missing = [...named].filter(f => !there.includes(f)), extra = there.filter(f => !named.has(f));
  ok(!missing.length && !extra.length && named.size === S.zones.length + S.noise.length,
    `${id}: every file named is there, once, and nothing else (missing ${missing.join(" ") || "none"}, extra ${extra.join(" ") || "none"})`);
  const dup = new Set(), dupl = [];
  S.zones.forEach(z => { const k = [z.k, z.v, z.m, z.r].join("/"); if (dup.has(k)) dupl.push(k); dup.add(k); });
  ok(!dupl.length, `${id}: no two zones share kind, layer, note and take ${dupl.join(" ")}`);

  /* every file */
  const fmtBad = [], dec = {};
  for (const f of named) {
    const p = path.join(dir, f);
    try {
      const st = probe(p);
      if (!(st.codec_name === "mp3" && +st.channels === 1 && +st.sample_rate === 44100 && +st.bit_rate === 128000)) fmtBad.push(`${f} ${st.codec_name} ${st.channels}ch ${st.sample_rate} ${st.bit_rate}`);
      dec[f] = decode(p);
      if (!dec[f].length) fmtBad.push(f + " empty");
    } catch (e) { fmtBad.push(`${f} does not decode`); }
  }
  ok(!fmtBad.length, `${id}: all ${named.size} files are mono MP3, 44,100 Hz, 128 kbps, and decode ${fmtBad.join("; ")}`);

  /* every zone */
  const late = [], off = [], clicks = [], long = [], cut = [], rows = [];
  for (const z of S.zones) {
    const x = dec[z.f]; if (!x) continue;
    const on = onset(x), ms = on / SR * 1000, pk = peakOf(x);
    if (ms > 2) late.push(`${z.f} ${ms.toFixed(2)} ms`);
    /* and it is the pluck that crossed: the note climbs on to within 20 dB of its peak in 3.5 ms (hiss or MP3 pre-echo
       left in front would cross first and climb no further), and the file begins from silence, not inside the attack
       (MP3 pre-echo can put -30 dB in the first samples; a cut attack puts far more) */
    let on20 = 0; while (on20 < x.length && Math.abs(x[on20]) < pk * 0.1) on20++;
    /* (an organ's key is not a pluck: its note swells up over some 5 to 10 ms, so a looped set gets 15) */
    if ((on20 - on) / SR > (looped ? 0.015 : synth ? Math.max(0.015, 1 / midiHz(z.m)) : 0.0035)) late.push(`${z.f} crosses -40 dB at ${ms.toFixed(2)} ms but -20 dB only at ${(on20 / SR * 1000).toFixed(2)} ms`);
    const w = 16, lead = Math.sqrt(rmsPow(x, 0, w));
    let top = 0; for (let a = 0; a + w <= Math.min(x.length, Math.floor(0.02 * SR)); a += 4) top = Math.max(top, Math.sqrt(rmsPow(x, a, a + w)));
    if (lead > top * 0.1) late.push(`${z.f} begins inside the attack: its first 0.36 ms at ${(20 * Math.log10(lead / top)).toFixed(1)} dB re the attack`);
    const [cents, frames] = pitchCents(x, z.m, z.k);
    if (!(Math.abs(cents - z.c) <= 5)) off.push(`${z.f} measured ${cents.toFixed(1)} c, set.json ${z.c}`);
    /* the note's own steps: its first cycle (a pluck is loudest there), or a looped note's loop (an organ's swell
       is quiet at first) */
    /* (AOG-BASS-SYNTH-V1: a synthesizer's filter is open widest as a note starts, so its first cycle, as for a pluck) */
    const P = Math.round(SR / midiHz(z.m + z.c / 100)), cyc = looped && !synth ? maxStep(x, Math.round(z.lp[0] * SR), Math.round(z.lp[1] * SR)) : maxStep(x, on, on + P + 1);
    const st = on > 0 ? maxStep(x, 0, on) : Math.abs(x[0]), en = Math.max(Math.abs(x[x.length - 1]), maxStep(x, x.length - Math.floor(0.03 * SR), x.length));
    if (!(st <= cyc && en <= cyc)) clicks.push(`${z.f} start ${st.toFixed(4)} end ${en.toFixed(4)} first cycle ${cyc.toFixed(4)}`);
    const sec = x.length / SR;
    if (sec > 6.0005) long.push(`${z.f} ${sec.toFixed(3)} s`);
    if (Math.abs(x[x.length - 1]) > 1e-3) cut.push(`${z.f} ends at ${x[x.length - 1].toFixed(4)}`);
    if (looped) {   /* a looped note: its loop inside the file, before the end's fade, and its seam no bigger a step than the
                       loop's own near it */
      const ls = Math.round(z.lp[0] * SR), le = Math.round(z.lp[1] * SR);
      if (le > x.length - Math.floor(0.03 * SR)) cut.push(`${z.f} loop ends at ${z.lp[1]} s, inside the end's fade (${sec.toFixed(3)} s)`);
      else { const seam = Math.abs(x[ls] - x[le - 1]), own = maxStep(x, le - 400, le);
        if (seam > own * 1.5) clicks.push(`${z.f} loop seam ${seam.toFixed(4)} against the loop's own steps ${own.toFixed(4)}`); }
    } else if (z.k === "sus" && sec < 5.99) {   /* cut early: only once the note has died away */
      const w = Math.floor(0.05 * SR), endPart = rmsDb(x, x.length - Math.floor(0.03 * SR) - w, x.length - Math.floor(0.03 * SR));
      let top = -300; for (let a = on; a + w <= x.length; a += w) top = Math.max(top, rmsDb(x, a, a + w));
      if (endPart > top - 54) cut.push(`${z.f} stops at ${sec.toFixed(2)} s while still at ${(endPart - top).toFixed(1)} dB`);
    }
    rows.push({ z, L: loud400(x) + 20 * Math.log10(z.g), cents, sec, peak: 20 * Math.log10(peakOf(x)) });
  }
  ok(!late.length, `${id}: every zone starts at its pluck: onset within 2 ms of the file start (latest ${Math.max(...S.zones.map(z => dec[z.f] ? onset(dec[z.f]) / SR * 1000 : 0)).toFixed(2)} ms) ${late.join("; ")}`);
  ok(!off.length, `${id}: every zone's pitch is within 5 cents of m once c is applied (largest gap ${Math.max(...rows.map(r => Math.abs(r.cents - r.z.c))).toFixed(2)} c) ${off.join("; ")}`);
  ok(!clicks.length, `${id}: no click at the start or the end of any zone ${clicks.join("; ")}`);
  ok(!long.length && !cut.length, `${id}: every zone is at most 6 s, ends on silence, and stops early only after it has died away ${long.concat(cut).join("; ")}`);
  ok(rows.every(r => r.peak < -0.1), `${id}: no zone reaches full scale (loudest peak ${Math.max(...rows.map(r => r.peak)).toFixed(2)} dBFS)`);

  /* coverage */
  const sus = S.zones.filter(z => z.k === "sus"), notes = [...new Set(sus.map(z => z.m))].sort((a, b) => a - b);
  const gaps = notes.slice(1).map((m, i) => m - notes[i]);
  ok(notes[0] <= 28 && (looped || synth ? notes[notes.length - 1] + S.maxShift >= 60 : notes[notes.length - 1] >= 55) && Math.max(...gaps) <= 3,
    `${id}: held notes ${notes.join(" ")}: from ${notes[0]} to ${notes[notes.length - 1]}${looped || synth ? " (played up to " + (notes[notes.length - 1] + S.maxShift) + ")" : ""}, at most ${Math.max(...gaps)} semitones apart`);
  const byS = {}; sus.forEach(z => { if (z.s !== null) (byS[z.s] = byS[z.s] || new Set()).add(z.m - S.tuning[z.s]); });
  if (Object.keys(byS).length) console.log(`     ${id}: frets per string (measured from each note's inharmonicity): ` +
    Object.keys(byS).map(s => `string ${s}: ${[...byS[s]].sort((a, b) => a - b).join(",")}`).join("; "));
  const layerNotes = susV.map(v => [...new Set(sus.filter(z => z.v === v).map(z => z.m))].sort((a, b) => a - b).join(" "));
  ok(layerNotes.every(l => l === layerNotes[0]), `${id}: every layer has every held note`);
  const lo = notes[0], hi = notes[notes.length - 1], mid = lo + (hi - lo) * 2 / 3, thin = [];
  for (const v of susV) for (const m of notes) {
    const rs = sus.filter(z => z.v === v && z.m === m).map(z => z.r).sort((a, b) => a - b);
    if (!rs.every((r, i) => r === i + 1)) thin.push(`v${v} ${m}: takes ${rs.join(",")}`);
    if (m <= mid && rs.length < 2 && !looped && !synth) thin.push(`v${v} ${m}: ${rs.length} take`);
  }
  ok(!thin.length, `${id}: at least 2 takes for every held note up to ${Math.floor(mid)} (the low and middle range), takes numbered from 1 ${thin.join("; ")}`);
  const stac = S.zones.filter(z => z.k === "stac");
  if (stac.length) {
    const sn = [...new Set(stac.map(z => z.m))].sort((a, b) => a - b), sg = sn.slice(1).map((m, i) => m - sn[i]);
    ok(sn[0] <= 28 && sn[sn.length - 1] >= 55 && Math.max(...sg) <= 3, `${id}: short (staccato) notes ${sn.join(" ")}, ${stac.length} zones, at most ${Math.max(...sg)} apart`);
  }
  const kinds = {}; S.noise.forEach(n => (kinds[n.k] = (kinds[n.k] || 0) + 1));
  ok((looped || synth || (kinds.release || 0) >= 3) && (id !== "growly" || ((kinds.scrape || 0) >= 1 && stac.length > 0)),
    `${id}: noises ${Object.entries(kinds).map(([k, n]) => n + " " + k).join(", ")}${id === "growly" ? " (and staccato zones)" : ""}`);

  /* loudness */
  const groups = {}; rows.forEach(r => (groups[r.z.k + " v" + r.z.v] = groups[r.z.k + " v" + r.z.v] || []).push(r));
  const spread = [], meds = {};
  Object.entries(groups).forEach(([g, rs]) => {
    const md = median(rs.map(r => r.L)); meds[g] = md;
    const lo2 = Math.min(...rs.map(r => r.L)) - md, hi2 = Math.max(...rs.map(r => r.L)) - md;
    console.log(`     ${id} ${g}: ${rs.length} files, loudness ${md.toFixed(2)} LUFS (400 ms), ${lo2.toFixed(2)} to +${hi2.toFixed(2)} dB along the neck`);
    if (lo2 < -1.5 || hi2 > 1.5) spread.push(`${g} ${lo2.toFixed(2)}..${hi2.toFixed(2)}`);
  });
  ok(!spread.length, `${id}: within each layer the notes are even along the neck (within 1.5 dB) ${spread.join("; ")}`);
  const ladder = susV.map(v => meds["sus v" + v]);
  if (!synth) ok(ladder.every((L, i) => !i || L > ladder[i - 1]), `${id}: the layers get louder in order: ${ladder.map(L => L.toFixed(2)).join(" < ")}`);
  else {   /* a synthesizer's strengths: the filter opens wider the harder a key is played */
    const cen = z => { const x = dec[z.f], on = onset(x), n = 8192, a = x.slice(on, on + Math.min(n, Math.floor(0.3 * SR)));
      let num = 0, den = 0;
      for (let k = 1; k < 1100; k++) { const f = k * SR / n; let re = 0, im = 0;   /* up to 5.9 kHz */
        for (let i = 0; i < a.length; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (a.length - 1)); re += a[i] * w * Math.cos(2 * Math.PI * f * i / SR); im -= a[i] * w * Math.sin(2 * Math.PI * f * i / SR); }
        const P = re * re + im * im; num += P * f; den += P; }
      return num / den; };
    const bright = susV.map(v => median(sus.filter(z => z.v === v && dec[z.f]).map(cen)));
    ok(bright.every((c, i) => !i || c > bright[i - 1]), `${id}: a synthesizer's layers get brighter in order (the harder, the wider its filter opens): ${bright.map(c => c.toFixed(0) + " Hz").join(" < ")} (loudness ${ladder.map(L => L.toFixed(2)).join(", ")})`);
  }

  /* noises: they decode, start near their sound, no click */
  const nbad = [];
  for (const n of S.noise) {
    const x = dec[n.f]; if (!x) continue;
    const on = onset(x), ref = maxStep(x, on, x.length), st = on > 0 ? maxStep(x, 0, on) : Math.abs(x[0]);
    if (on / SR > 0.002 || st > ref || Math.abs(x[x.length - 1]) > 1e-3 || x.length / SR > 6.0005) nbad.push(`${n.f} onset ${(on / SR * 1000).toFixed(2)} ms, start step ${st.toFixed(4)}`);
  }
  ok(!nbad.length, `${id}: every noise starts at its sound, has no click, ends on silence ${nbad.join("; ")}`);

  /* size */
  const bytes = fs.readdirSync(dir).reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0);
  ok(bytes <= 4e6, `${id}: ${bytes} bytes (${(bytes / 1e6).toFixed(2)} MB, ${(bytes / 1048576).toFixed(2)} MiB), at most 4 MB`);
  const cs = rows.map(r => r.z.c);
  console.log(`     ${id}: tuning as recorded ${Math.min(...cs).toFixed(1)} to +${Math.max(...cs).toFixed(1)} cents (held notes ${Math.min(...rows.filter(r => r.z.k === "sus").map(r => r.z.c)).toFixed(1)} to +${Math.max(...rows.filter(r => r.z.k === "sus").map(r => r.z.c)).toFixed(1)}); the engine applies c`);
}

const want = process.argv.slice(2);
const sets = fs.existsSync(ROOT) ? fs.readdirSync(ROOT).filter(d => fs.statSync(path.join(ROOT, d)).isDirectory()) : [];
ok(sets.length > 0, `sets in aog-deploy/audio/bass: ${sets.join(", ")}`);
for (const id of sets) if (!want.length || want.includes(id)) checkSet(id);
const cr = path.join(ROOT, "CREDITS.txt"), ct = fs.existsSync(cr) ? fs.readFileSync(cr, "utf8") : "";
const NEEDS = { growly: [/Growlybass/, /Karoryfer/, /karoryfer\.growlybass/, /Swagbass/, /karoryfer\.swagbass/], upright: [/Smolken/, /Meatbass/, /dsmolken\.double-bass/, /karoryfer\.meatbass/],
  ergo: [/Ergo/, /karoryfer\.ergo/], cosmo: [/Caveman Cosmonaut/, /Unitra/, /karoryfer\.caveman-cosmonaut/],
  synthbass: [/Roland SH-2/, /Filter Vel Bass/, /Modular Samples/, /publicsamples\/Roland-SH-2/, /Unlicense/],
  acidbass: [/Roland SH-2/, /Rezzy Saw Vel/, /Modular Samples/, /publicsamples\/Roland-SH-2/, /Unlicense/] };
const lacking = sets.filter(s => NEEDS[s] && !NEEDS[s].every(r => r.test(ct)));
ok(/CC0 1\.0/.test(ct) && /dominio público/.test(ct) && /What we changed/.test(ct) && /Lo que cambiamos/.test(ct) && !lacking.length,
  `CREDITS.txt names each set's library, maker and link, CC0, and what we changed, in English and Spanish ${lacking.join(" ")}`);
console.log(fails ? `${fails} FAILED` : "all passed");
process.exit(fails ? 1 : 0);
