/* AOG-LEARN-V1 (2026-10-11) — the listening engine (aog-learn.js + aog-learn-worker.js), on its own page.
   Jimmy: "Can the guitar, bass and piano teach how to play songs if I upload them?" — chords along with the song, exact MIDI
   files, the bass line and the melody. This suite checks the engine the rooms will use:
   · synthetic songs made here in an OfflineAudioContext with known content (piano-like and guitar-like tones, a drum loop, a
     bass line, a clear lead; I–V–vi–IV in a few keys, a minor song, 7th chords, swing, two chords a bar, a waltz):
     tempo within 2%, beat F-measure, key, chord accuracy by time overlap (target ≥ 80%), bass and melody notes;
   · the ten starter-crate songs (aog-deploy/audio/crate, made by _work/crate/make_crate.py, so their tempo, chords and bass
     are known): the same numbers, reported as they are;
   · a WAV ArrayBuffer, a File and an mp3 open the same way as an AudioBuffer; a MIDI File through analyze() is read exactly;
   · the worker and the page-only way (no Workers) give the very same lesson, and the page keeps breathing while it listens;
   · progress words come in order (open, beat, key, chords, bass, melody, done) and only grow; the Spanish words are there;
   · a four-minute song is heard in reasonable time (printed);
   · MIDI files written here (type 0 and 1, running status, tempo changes, note-on velocity 0, the sustain pedal, drums on
     channel 10, track names, program names): every note's time, length, pitch and strength; beats, bars, meter, key, chords;
   · no page errors. Ports 9283 (the page) and 9284 (a second page without Workers). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const M = require("./metrics.js");
const srv = require("../srv.js")(9283), srv2 = require("../srv.js")(9284);
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const r3 = x => Math.round(x * 1000) / 1000;
const HARNESS = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>learn</title></head><body><p id="t">listening test</p>
<script src="aog-learn.js"></script><script>(${synth.toString()})();</script></body></html>`;

/* ───────── the synthetic songs: events in seconds, rendered in the page ───────── */
const IV = { maj: [0, 4, 7], min: [0, 3, 7], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10] };
const near = (pc, c) => { let m = c - 6 + ((pc - (c - 6)) % 12 + 12) % 12; return m; };   /* the pitch with class pc in [c-6, c+6) */
function makeSong(o) {
  const beat = 60 / o.bpm, per = o.per || 4, start = o.start || 0.3, ev = [], chords = [], bass = [], lead = [];
  const sw = o.swing ? 2 / 3 : 0.5, cyc = o.prog, beatsPerCycle = cyc.reduce((a, c) => a + c[2], 0);
  const total = o.bars * per; let b = 0, ci = 0;
  while (b < total) { const [root, q, len] = cyc[ci % cyc.length]; chords.push({ t: start + b * beat, d: len * beat, root, q, b0: b, len }); b += len; ci++; }
  chords.forEach((c, k) => {
    const tones = IV[c.q].map(i => (c.root + i) % 12);
    /* the chord instrument */
    const voic = tones.map(pc => near(pc, 60)).sort((a, z) => a - z);
    for (let j = 0; j < c.len; j++) { const t0 = c.t + j * beat;
      if (o.inst === "guitar") { const gv = [near(c.root, 48)].concat(voic, [near(tones[0], 67)]);
        [0, sw].forEach((h, u) => { const tt = t0 + h * beat; (u ? gv.slice().reverse() : gv).forEach((m, s) => ev.push({ k: "guitar", t: tt + s * 0.012, d: (u ? 1 - sw : sw) * beat * 0.95, m, g: u ? 0.05 : 0.07 })); }); }
      else voic.forEach(m => ev.push({ k: "piano", t: t0, d: beat * 0.92, m, g: 0.09 })); }
    /* the bass */
    const R = near(c.root, 41), F = near((c.root + 7) % 12, 43);
    for (let j = 0; j < c.len; j++) { const t0 = c.t + j * beat;
      if (o.bass === "quarters") bass.push({ t: t0, d: beat * 0.85, m: R });
      else if (o.bass === "rootfifth") bass.push({ t: t0, d: beat * 0.85, m: j % 2 ? F : R });
      else if (o.bass === "walk") { const nx = chords[k + 1] ? near(chords[k + 1].root, 41) : R; const w = [R, near(tones[1], R + 5), near(tones[2], R + 7), nx - 1];
        bass.push({ t: t0, d: beat * 0.85, m: w[j % 4] }); }
      else if (o.bass === "eighths") { bass.push({ t: t0, d: beat * 0.42, m: R }); bass.push({ t: t0 + beat / 2, d: beat * 0.42, m: R }); }
      else if (o.bass === "chord" && j === 0) bass.push({ t: t0, d: c.len * beat * 0.9, m: R }); }
    });
  /* the lead: chord tones near the top, a rest at the end of every fourth bar, some notes played twice */
  const barT = beat * per;
  for (let bar = 0; bar < o.bars; bar++) {
    const t0 = start + bar * barT, c = chords.find(x => x.t <= t0 + 1e-6 && x.t + x.d > t0 + 1e-6) || chords[0];
    const tones = IV[c.q].slice(0, 3).map(i => (c.root + i) % 12), mel = tones.map(pc => near(pc, 74));
    const rhythm = bar % 4 === 3 ? [[0, per - 1]] : per === 3 ? [[0, 1], [1, 1], [2, 1]] : [[0, 1], [1, 1], [2, sw], [2 + sw, 1 - sw], [3, 1]];
    rhythm.forEach(([at, len], k) => { const cc = chords.find(x => x.t <= t0 + at * beat + 1e-6 && x.t + x.d > t0 + at * beat + 1e-6) || c;
      const tt = IV[cc.q].slice(0, 3).map(i => near((cc.root + i) % 12, 74)); let m = tt[(bar + k) % 3];
      if (k === 3 && bar % 2 === 0) m = lead[lead.length - 1].m;      /* the same note again */
      lead.push({ t: t0 + at * beat, d: len * beat * 0.9, m }); });
  }
  if (o.lead !== false) lead.forEach(n => ev.push({ k: "lead", t: n.t, d: n.d, m: n.m, g: 0.22 }));
  bass.forEach(n => ev.push({ k: "bass", t: n.t, d: n.d, m: n.m, g: 0.32 }));
  for (let i = 0; i < total; i++) { const t0 = start + i * beat, pos = i % per;
    if (per === 3) { if (pos === 0) ev.push({ k: "kick", t: t0, g: 0.8 }); else ev.push({ k: "snare", t: t0, g: 0.18 }); }
    else { if (pos === 0 || pos === 2) ev.push({ k: "kick", t: t0, g: 0.8 }); else ev.push({ k: "snare", t: t0, g: 0.35 }); }
    ev.push({ k: "hat", t: t0, g: 0.12 }); ev.push({ k: "hat", t: t0 + sw * beat, g: 0.08 }); }
  const sec = start + total * beat + 1.0;
  const beats = []; for (let i = 0; i < total; i++) beats.push(start + i * beat);
  const downbeats = []; for (let i = 0; i < o.bars; i++) downbeats.push(start + i * barT);
  return { name: o.name, sec, ev, truth: { bpm: o.bpm, beats, downbeats, chords: chords.map(c => ({ t: c.t, d: c.d, root: c.root, q: c.q })), bass, melody: o.lead !== false ? lead : [], key: o.key, num: per } };
}
const SONGS = [
  makeSong({ name: "c-pop-piano", bpm: 100, bars: 12, inst: "piano", bass: "quarters", key: { key: 0, minor: false }, prog: [[0, "maj", 4], [7, "maj", 4], [9, "min", 4], [5, "maj", 4]] }),
  makeSong({ name: "g-pop-guitar", bpm: 120, bars: 16, inst: "guitar", bass: "chord", key: { key: 7, minor: false }, prog: [[7, "maj", 4], [2, "maj", 4], [4, "min", 4], [0, "maj", 4]] }),
  makeSong({ name: "a-minor-piano", bpm: 90, bars: 12, inst: "piano", bass: "rootfifth", key: { key: 9, minor: true }, prog: [[9, "min", 4], [5, "maj", 4], [0, "maj", 4], [7, "maj", 4]] }),
  makeSong({ name: "f-sevenths-swing", bpm: 84, bars: 12, inst: "piano", bass: "walk", swing: true, key: { key: 5, minor: false }, prog: [[7, "m7", 4], [0, "7", 4], [5, "maj7", 4], [2, "m7", 4]] }),
  makeSong({ name: "d-two-a-bar", bpm: 76, bars: 10, inst: "guitar", bass: "chord", key: { key: 2, minor: false }, prog: [[2, "maj", 2], [9, "maj", 2], [11, "min", 2], [7, "maj", 2]] }),
  makeSong({ name: "e-waltz", bpm: 120, bars: 16, per: 3, inst: "piano", bass: "chord", key: { key: 4, minor: false }, prog: [[4, "maj", 3], [9, "maj", 3], [11, "7", 3], [4, "maj", 3]] }),
  makeSong({ name: "c-minor-sevenths", bpm: 110, bars: 12, inst: "guitar", bass: "eighths", key: { key: 0, minor: true }, prog: [[0, "m7", 4], [8, "maj7", 4], [3, "maj7", 4], [10, "7", 4]] }),
];

/* runs in the page: render events into an AudioBuffer (44.1 kHz stereo, so the engine also has to downmix and resample) */
function synth() {
  let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648 * 2 - 1;
  window.renderSong = async function (ev, sec, sr) { seed = 12345;
    sr = sr || 44100; const ctx = new OfflineAudioContext(2, Math.ceil(sec * sr), sr), out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination);
    const wave = (h) => { const re = new Float32Array(h.length + 1), im = new Float32Array(h.length + 1); h.forEach((a, i) => im[i + 1] = a); return ctx.createPeriodicWave(re, im); };
    const W = { piano: wave([1, 0.6, 0.35, 0.25, 0.15, 0.1, 0.06, 0.04]), guitar: wave([1, 0.8, 0.55, 0.45, 0.3, 0.25, 0.15, 0.1, 0.08, 0.05]),
      bass: wave([1, 0.5, 0.25, 0.12, 0.06]), lead: wave([1, 0.5, 0.33, 0.25, 0.2, 0.16, 0.14, 0.12]) };
    const nb = ctx.createBuffer(1, Math.ceil(sr * 0.4), sr), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = rnd();
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    for (const e of ev) {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(out);
      if (e.k === "piano" || e.k === "guitar" || e.k === "bass" || e.k === "lead") {
        const o = ctx.createOscillator(); o.setPeriodicWave(W[e.k]); o.frequency.value = hz(e.m); o.connect(g);
        const tau = e.k === "piano" ? 0.6 : e.k === "guitar" ? 0.35 : e.k === "bass" ? 0.9 : 1e4;
        g.gain.setValueAtTime(0, e.t); g.gain.linearRampToValueAtTime(e.g, e.t + (e.k === "lead" ? 0.015 : 0.004));
        g.gain.setTargetAtTime(0, e.t + 0.02, tau); g.gain.setTargetAtTime(0, e.t + e.d, 0.02);
        o.start(e.t); o.stop(e.t + e.d + 0.2);
      } else if (e.k === "kick") { const o = ctx.createOscillator(); o.frequency.setValueAtTime(120, e.t); o.frequency.exponentialRampToValueAtTime(45, e.t + 0.12); o.connect(g);
        g.gain.setValueAtTime(e.g, e.t); g.gain.setTargetAtTime(0, e.t, 0.1); o.start(e.t); o.stop(e.t + 0.6);
      } else { const s = ctx.createBufferSource(); s.buffer = nb; const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = e.k === "hat" ? 7000 : 1200; s.connect(f); f.connect(g);
        g.gain.setValueAtTime(e.g, e.t); g.gain.setTargetAtTime(0, e.t, e.k === "hat" ? 0.025 : 0.07); s.start(e.t); s.stop(e.t + 0.4);
        if (e.k === "snare") { const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = 190; const g2 = ctx.createGain(); g2.gain.setValueAtTime(e.g * 0.8, e.t); g2.gain.setTargetAtTime(0, e.t, 0.05); o.connect(g2); g2.connect(out); o.start(e.t); o.stop(e.t + 0.3); } }
    }
    return ctx.startRendering();
  };
  window.wavOf = function (buf) {   /* 16-bit PCM WAV */
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, dv = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); dv.setUint32(4, 36 + n * ch * 2, true); w(8, "WAVE"); w(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); w(36, "data"); dv.setUint32(40, n * ch * 2, true);
    const d = []; for (let c = 0; c < ch; c++) d.push(buf.getChannelData(c)); let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { dv.setInt16(o, Math.max(-1, Math.min(1, d[c][i])) * 32767, true); o += 2; }
    return dv.buffer;
  };
}

/* ───────── MIDI files, written byte by byte ───────── */
const vlq = n => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
const str = s => Array.from(Buffer.from(s, "utf8"));
function chunk(id, body) { const n = body.length; return [...Buffer.from(id), (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255, ...body]; }
function track(evs) { /* evs: [tick, bytes] in order (bytes already using running status where wanted) */
  let last = 0, body = []; evs.forEach(([t, b]) => { body.push(...vlq(t - last), ...b); last = t; }); body.push(0, 0xFF, 0x2F, 0); return chunk("MTrk", body); }
const meta = (type, data) => [0xFF, type, ...vlq(data.length), ...data];
function smf(fmt, tpq, tracks) { return Uint8Array.from([...chunk("MThd", [0, fmt, 0, tracks.length, (tpq >> 8) & 255, tpq & 255]), ...tracks.flat()]); }
function tickSecs(tpq, tempos) { return t => { let s = 0; for (let i = 0; i < tempos.length; i++) { const a = tempos[i][0], b = i + 1 < tempos.length ? tempos[i + 1][0] : Infinity; if (t <= a) break;
  s += (Math.min(t, b) - a) * tempos[i][1] / 1e6 / tpq; } return s; }; }

/* type 0: 3/4, 120 then 90 bpm, key signature G, running status, note-on 0 for off, the pedal, drums */
function midiType0() {
  const tpq = 480, metas = [], raw = [], exp = [], drums = [];
  metas.push([0, meta(0x03, str("Waltz Test"))], [0, meta(0x51, [0x07, 0xA1, 0x20])], [0, meta(0x58, [3, 2, 24, 8])], [0, meta(0x59, [1, 0])], [1440, meta(0x51, [0x0A, 0x2C, 0x2B])]);
  raw.push([0, -1, [0xC0, 0]]);                       /* program: piano */
  /* G, C, D7, G: a long chord and a short one in each bar, all on channel 1, so most events run on one status byte */
  const bars = [[43, 47, 50, 55], [48, 52, 55, 60], [50, 54, 57, 60], [43, 47, 50, 55]];
  const PD = 1450, PU = 2400;                          /* the pedal is down from 1450 to 2400 */
  bars.forEach((ns, bi) => { const b0 = bi * 1440; [[0, 900], [960, 400]].forEach(([at, len]) => ns.forEach((m, k) => { const on = b0 + at, off = on + len;
    raw.push([on, 1, [0x90, m, 70 + k * 5]], [off, 0, [0x90, m, 0]]); exp.push({ on, off: off >= PD && off < PU ? PU : off, m, v: 70 + k * 5 }); })); });
  /* note 79: struck at 1440, let go at 1500 under the pedal, struck again at 1800 (the first ends there), let go at 2000 (rings to 2400) */
  raw.push([1440, 1, [0x90, 79, 90]], [1500, 0, [0x90, 79, 0]], [1800, 1, [0x90, 79, 95]], [2000, 0, [0x90, 79, 0]]);
  exp.push({ on: 1440, off: 1800, m: 79, v: 90 }, { on: 1800, off: 2400, m: 79, v: 95 });
  for (let t = 0; t < 4 * 1440; t += 480) { raw.push([t, 2, [0x99, 36, 100]], [t + 120, 2, [0x99, 36, 0]]); drums.push({ on: t, off: t + 120, m: 36, v: 100 }); }
  raw.push([PD, 3, [0xB0, 64, 127]], [PU, 3, [0xB0, 64, 0]]);
  raw.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const all = metas.map(m => [m[0], -2, m[1]]).concat(raw).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  let run = -1; const evs = all.map(([t, k, bytes]) => { if (k === -2) { run = -1; return [t, bytes]; }
    const st = bytes[0], out = st === run ? bytes.slice(1) : bytes; run = st; return [t, out]; });
  const ts = tickSecs(tpq, [[0, 500000], [1440, 666667]]);
  const conv = l => l.map(n => ({ t: ts(n.on), d: ts(n.off) - ts(n.on), m: n.m, v: n.v })).sort((a, b) => a.t - b.t || a.m - b.m);
  return { bytes: smf(0, tpq, [track(evs)]), piano: conv(exp), drums: conv(drums), ts };
}
/* type 1: a conductor track (name, 100 then 75 bpm, 4/4, key signature C), bass, lead, piano (note-off messages with running status), drums */
function midiType1() {
  const tpq = 96, bar = 384, roots = [36, 43, 45, 41], chords = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]], names = ["C", "G", "Am", "F"];
  const t0 = [[0, meta(0x03, str("Song Test"))], [0, meta(0x51, [0x09, 0x27, 0xC0])], [0, meta(0x58, [4, 2, 24, 8])], [0, meta(0x59, [0, 0])], [2 * bar, meta(0x51, [0x0C, 0x35, 0x00])]];
  const bassN = [], leadN = [], pianoN = [], drumN = [], bassE = [[0, meta(0x03, str("Bass"))], [0, [0xC1, 33]]], leadE = [[0, meta(0x03, str("Lead"))], [0, [0xC2, 80]]];
  const pianoE = [[0, meta(0x03, str("Piano"))], [0, [0xC3, 0]]], drumE = [];
  const mel = [72, 74, 76, 79, 71, 74, 79, 77, 76, 72, 69, 72, 77, 76, 74, 72];
  for (let b = 0; b < 8; b++) { const B = b * bar;
    for (let q = 0; q < 4; q++) { const on = B + q * 96; bassN.push({ on, off: on + 80, m: roots[b % 4] + (q === 3 ? 7 : 0), v: 96 }); }
    for (let q = 0; q < 4; q++) { const on = B + q * 96; leadN.push({ on, off: on + 90, m: mel[(b * 4 + q) % 16], v: 110 }); }
    chords[b % 4].forEach((m, k) => pianoN.push({ on: B, off: B + bar - 4, m, v: 60 + k }));
    for (let q = 0; q < 4; q++) drumN.push({ on: B + q * 96, off: B + q * 96 + 24, m: q % 2 ? 38 : 36, v: 120 }); }
  const put = (E, N, ch, offStyle) => { const raw = []; N.forEach(n => { raw.push([n.on, 1, n]); raw.push([n.off, 0, n]); }); raw.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let run = -1; raw.forEach(([t, on, n]) => { const st = on ? 0x90 | ch : (offStyle === "off" ? 0x80 | ch : 0x90 | ch); const data = [n.m, on ? n.v : (offStyle === "off" ? 64 : 0)];
      E.push([t, st === run ? data : [st, ...data]]); run = st; }); };
  put(bassE, bassN, 1, "zero"); put(leadE, leadN, 2, "zero"); put(pianoE, pianoN, 3, "off"); put(drumE, drumN, 9, "zero");
  const ts = tickSecs(tpq, [[0, 600000], [2 * bar, 800000]]);
  const conv = l => l.map(n => ({ t: ts(n.on), d: ts(n.off) - ts(n.on), m: n.m, v: n.v })).sort((a, b) => a.t - b.t || a.m - b.m);
  return { bytes: smf(1, tpq, [track(t0), track(bassE), track(leadE), track(pianoE), track(drumE)]), bass: conv(bassN), lead: conv(leadN), piano: conv(pianoN), drums: conv(drumN), names, ts, bar };
}
function sameNotes(a, b) { if (a.length !== b.length) return "count " + a.length + " vs " + b.length;
  for (let i = 0; i < a.length; i++) { const x = a[i], y = b[i]; if (Math.abs(x.t - y.t) > 6e-4 || Math.abs(x.d - y.d) > 6e-4 || x.m !== y.m || (y.v != null && x.v !== y.v)) return "note " + i + " " + JSON.stringify(x) + " vs " + JSON.stringify(y); }
  return ""; }

function score(les, T, off) {
  off = off || 0; const sh = l => l.map(n => Object.assign({}, n, { t: n.t + off }));
  const s = { bpm: les.bpm, tempoErr: Math.abs(les.bpm - T.bpm) / T.bpm, beatF: M.fmeasure(les.beats, T.beats.map(t => t + off)), downF: M.fmeasure(les.downbeats, T.downbeats.map(t => t + off)),
    meter: les.meter.num, key: M.keyScore(les.key, T.key), keyName: les.key.name,
    chordExact: M.chordAcc(les.chords, sh(T.chords), "exact"), chordMajMin: M.chordAcc(les.chords, sh(T.chords), "majmin"),
    bassF: M.noteF(les.bass, sh(T.bass)).f, bassOverlap: M.pitchOverlap(les.bass, sh(T.bass)) };
  if (T.melody && T.melody.length) { const mf = M.noteF(les.melody, sh(T.melody)); s.melodyF = mf.f; s.melodyOverlap = M.pitchOverlap(les.melody, sh(T.melody)); }
  return s;
}
const fmt = s => Object.entries(s).map(([k, v]) => k + "=" + (typeof v === "number" ? r3(v) : v)).join(" ");
const mean = (a, k) => a.reduce((x, s) => x + (s[k] || 0), 0) / a.length;

(async () => {
  const b = await pw.chromium.launch();
  const open = async (port, noWorker) => {
    const c = await b.newContext(); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await c.route("**/__learn.html", r => r.fulfill({ contentType: "text/html", body: HARNESS }));
    if (noWorker) await c.addInitScript(() => { window.__workers = 0; delete window.Worker; window.Worker = undefined; });
    else await c.addInitScript(() => { window.__workers = 0; const W = window.Worker; window.Worker = function (u, o) { window.__workers++; return new W(u, o); }; });
    const p = await c.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    await p.goto(`http://localhost:${port}/__learn.html`); await p.waitForFunction(() => window.AOGLearn && window.renderSong);
    return { c, p, errs };
  };
  const { c, p, errs } = await open(9283);

  /* ── the words ── */
  const words = await p.evaluate(() => AOGLearn.words);
  const keys = ["open", "beat", "key", "chords", "bass", "melody", "done"];
  ok(keys.every(k => words.en[k] && words.es[k]) && words.en.beat === "Finding the beat…" && words.en.key === "Finding the key…" && words.en.chords === "Finding the chords…" &&
     words.en.bass === "Finding the bass line…" && words.en.melody === "Finding the melody…", "the step words, English: " + keys.map(k => words.en[k]).join(" | "));
  ok(/pulso/.test(words.es.beat) && /tonalidad/.test(words.es.key) && /acordes/.test(words.es.chords) && /bajo/.test(words.es.bass) && /melod/.test(words.es.melody), "and Spanish: " + keys.map(k => words.es[k]).join(" | "));

  /* ── the synthetic songs ── */
  console.log("== synthetic songs");
  const synthScores = [];
  for (const S of SONGS) {
    const res = await p.evaluate(async ({ ev, sec, name }) => { const buf = await renderSong(ev, sec); window.__last = buf; const t0 = performance.now(); const steps = [];
      const L = await AOGLearn.analyze(buf, { name, onProgress: (q, k) => steps.push([q, k]) }); return { L, ms: performance.now() - t0, steps, workers: window.__workers }; }, { ev: S.ev, sec: S.sec, name: S.name });
    const s = score(res.L, S.truth); s.ms = Math.round(res.ms); synthScores.push(s);
    console.log("   " + S.name.padEnd(18) + fmt(s));
    if (S.name === "c-pop-piano") {
      const ks = []; res.steps.forEach(([q, k]) => { if (ks[ks.length - 1] !== k) ks.push(k); });
      const mono = res.steps.every((st, i) => i === 0 || st[0] >= res.steps[i - 1][0]);
      ok(JSON.stringify(ks) === JSON.stringify(keys) && mono && res.steps[res.steps.length - 1][0] === 1 && res.steps.length > 20,
        `progress comes in order and only grows (${res.steps.length} calls): ${ks.join(" → ")}`);
      ok(res.workers >= 1, "it listened in a worker (" + res.workers + ")");
      ok(res.L.v === 1 && res.L.src === "audio" && res.L.sr === 22050 && res.L.name === "c-pop-piano" && Math.abs(res.L.sec - S.sec) < 0.05 && Array.isArray(res.L.tracks) && res.L.tracks.length === 0 &&
         res.L.notes.length === res.L.melody.length && res.L.chords.every(ch => ch.conf >= 0 && ch.conf <= 1 && typeof ch.name === "string") && res.L.bass.every(n => n.conf >= 0 && n.conf <= 1),
         "the lesson has the agreed shape (v, src, sr, name, sec, tracks [], notes from the melody, conf 0..1)");
      const onBeat = res.L.chords.every(ch => res.L.beats.some(t => Math.abs(t - ch.t) < 1e-3));
      ok(onBeat, "every chord change sits on a beat");
    }
  }
  ok(synthScores.every(s => s.tempoErr <= 0.02), "synthetic: tempo within 2% on every song (" + synthScores.map(s => s.bpm).join(", ") + ")");
  ok(mean(synthScores, "beatF") >= 0.9, "synthetic: beat F-measure " + r3(mean(synthScores, "beatF")));
  ok(synthScores.filter(s => s.key === 1).length >= SONGS.length - 1, "synthetic: key right on " + synthScores.filter(s => s.key === 1).length + " of " + SONGS.length + " (" + synthScores.map(s => s.keyName).join(", ") + ")");
  ok(mean(synthScores, "chordExact") >= 0.8, "synthetic: chords right (root and quality) " + r3(mean(synthScores, "chordExact")) + " of the time; root and third " + r3(mean(synthScores, "chordMajMin")));
  ok(synthScores[5].meter === 3 && synthScores.filter((s, i) => i !== 5).every(s => s.meter === 4), "the waltz is heard in 3, the rest in 4 (" + synthScores.map(s => s.meter).join(",") + ")");
  ok(mean(synthScores, "downF") >= 0.8, "synthetic: bar one found, F " + r3(mean(synthScores, "downF")));
  ok(mean(synthScores, "bassF") >= 0.7, "synthetic: bass notes F " + r3(mean(synthScores, "bassF")) + " (pitch overlap " + r3(mean(synthScores, "bassOverlap")) + ")");
  ok(mean(synthScores, "melodyF") >= 0.7, "synthetic: melody notes F " + r3(mean(synthScores, "melodyF")) + " (pitch overlap " + r3(mean(synthScores, "melodyOverlap")) + ")");

  /* ── the same song from a WAV ArrayBuffer and a File; the worker and the page-only way agree ── */
  const viaFile = await p.evaluate(async () => { const wav = wavOf(window.__last); const a = await AOGLearn.analyze(wav);
    const f = new File([wav], "My Song.wav", { type: "audio/wav" }); const b = await AOGLearn.analyze(f);
    const w1 = await AOGLearn.analyze(window.__last); const w2 = await AOGLearn.analyze(window.__last, { worker: false });
    return { a, b, same: JSON.stringify(w1) === JSON.stringify(w2) }; });
  const sw = score(viaFile.a, SONGS[SONGS.length - 1].truth);
  ok(sw.tempoErr <= 0.02 && sw.chordExact >= 0.7 && viaFile.b.name === "My Song" && viaFile.b.chords.length === viaFile.a.chords.length, "a WAV ArrayBuffer and a File open too (" + fmt({ bpm: sw.bpm, chords: sw.chordExact }) + ", name '" + viaFile.b.name + "')");
  ok(viaFile.same, "the worker and {worker:false} give the very same lesson");

  /* ── no Workers at all: the page listens in slices and keeps breathing; same lesson ── */
  { const W = await open(9284, true);
    const r = await W.p.evaluate(async ({ ev, sec }) => { const buf = await renderSong(ev, sec); let last = performance.now(), worst = 0, ticks = 0;
      const iv = setInterval(() => { const n = performance.now(); worst = Math.max(worst, n - last); last = n; ticks++; }, 16);
      const L = await AOGLearn.analyze(buf); clearInterval(iv); return { L, worst, ticks, hasWorker: typeof Worker }; }, { ev: SONGS[SONGS.length - 1].ev, sec: SONGS[SONGS.length - 1].sec });
    const w = await p.evaluate(async () => AOGLearn.analyze(window.__last));
    ok(r.hasWorker === "undefined" && JSON.stringify(r.L) === JSON.stringify(w), "without Workers the page listens itself, and the lesson is the same as the worker's");
    ok(r.worst < 150 && r.ticks > 10, `and the page keeps breathing while it listens (longest pause ${Math.round(r.worst)} ms, ${r.ticks} ticks)`);
    ok(W.errs.length === 0, "no page errors without Workers " + W.errs.join(" | "));
    await W.c.close(); }

  /* ── the starter crate (real mp3 files with known answers) ── */
  console.log("== starter crate (aog-deploy/audio/crate)");
  const files = fs.readdirSync(path.resolve(__dirname, "../../../aog-deploy/audio/crate"));
  const crate = [];
  for (const T of M.TRACKS) {
    const f = files.find(x => x.startsWith(T.n + "-"));
    const r = await p.evaluate(async (u) => { const ab = await (await fetch(u)).arrayBuffer(); const t0 = performance.now(); const L = await AOGLearn.analyze(ab); return { L, ms: performance.now() - t0 }; }, "audio/crate/" + f);
    const G = M.crateTruth(T);
    /* the mp3 decoder may start the song a few ms late: measure that from the beats and allow it */
    const offs = r.L.beats.map(t => { let d = 9; G.beats.forEach(g => { if (Math.abs(t - g) < Math.abs(d)) d = t - g; }); return d; }).sort((a, z) => a - z);
    const off = Math.max(-0.08, Math.min(0.08, offs[offs.length >> 1]));
    const s = score(r.L, Object.assign({}, G, { melody: [] }), Math.abs(off) < 0.07 ? off : 0); s.ms = Math.round(r.ms); s.off = r3(off);
    s.noChordIntro = M.chordAcc(r.L.chords, G.chords.map(ch => Object.assign({}, ch, { t: ch.t + s.off })), "N");
    crate.push(s); console.log("   " + f.padEnd(26) + fmt(s));
  }
  console.log(`   crate means: tempo ok ${crate.filter(s => s.tempoErr <= 0.02).length}/${crate.length} · beat F ${r3(mean(crate, "beatF"))} · bar one F ${r3(mean(crate, "downF"))} · key ${crate.filter(s => s.key === 1).length}/${crate.length} (MIREX ${r3(mean(crate, "key"))}) · chords exact ${r3(mean(crate, "chordExact"))}, root+third ${r3(mean(crate, "chordMajMin"))} · no chord in the drum intro ${r3(mean(crate, "noChordIntro"))} · bass F ${r3(mean(crate, "bassF"))}, pitch overlap ${r3(mean(crate, "bassOverlap"))}`);
  ok(crate.filter(s => s.tempoErr <= 0.02).length === crate.length, "crate: tempo within 2% on every song");
  ok(mean(crate, "chordMajMin") >= 0.85 && mean(crate, "bassOverlap") >= 0.85, "crate: chords (root and third) and the bass pitch hold up on real files");

  /* ── four minutes ── */
  { const r = await p.evaluate(async (u) => { const ab = await (await fetch(u)).arrayBuffer(); const ctx = new OfflineAudioContext(1, 1, 22050); const one = await ctx.decodeAudioData(ab);
      const n = 240 * 22050, buf = new AudioBuffer({ length: n, numberOfChannels: 1, sampleRate: 22050 }), d = buf.getChannelData(0), s = one.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = s[i % s.length];
      const t0 = performance.now(); const L = await AOGLearn.analyze(buf); return { ms: performance.now() - t0, chords: L.chords.length, beats: L.beats.length, bpm: L.bpm }; }, "audio/crate/06-brass-bus.mp3");
    console.log("   four minutes: " + (r.ms / 1000).toFixed(1) + " s, " + r.beats + " beats, " + r.chords + " chords, " + r.bpm + " bpm");
    ok(r.ms < 20000 && Math.abs(r.bpm - 106) / 106 < 0.02, "a four-minute song is heard in " + (r.ms / 1000).toFixed(1) + " s (aim under 20 s here)"); }

  /* ── MIDI files ── */
  console.log("== MIDI");
  { const m0 = midiType0(), L0 = await p.evaluate(a => AOGLearn.fromMidi(new Uint8Array(a).buffer), Array.from(m0.bytes));
    const pi = L0.tracks.find(t => !t.drums), dr = L0.tracks.find(t => t.drums);
    const e1 = pi ? sameNotes(pi.notes, m0.piano) : "no piano track", e2 = dr ? sameNotes(dr.notes, m0.drums) : "no drum track";
    ok(L0.src === "midi" && L0.tracks.length === 2 && !e1 && !e2, "type 0: every note's time, length, pitch and strength (running status, note-on 0, tempo change, the pedal held and a note struck again under it) " + (e1 || e2));
    ok(dr && dr.ch === 10 && dr.drums && dr.programName === "Drums" && pi.ch === 1 && pi.program === 0 && pi.name === "Acoustic Grand Piano" && L0.name === "Waltz Test", "type 0: channel 10 is drums, the piano is named by its program, the song by its name ('" + L0.name + "')");
    const want0 = []; for (let t = 0; t < 4 * 1440; t += 480) want0.push(r3(m0.ts(t)));
    ok(L0.meter.num === 3 && L0.meter.den === 4 && L0.bpm === 120 && JSON.stringify(L0.beats.map(r3)) === JSON.stringify(want0.filter(t => t < L0.sec - 1e-6 || t === 0)) && L0.downbeats.length === 4 && r3(L0.downbeats[1]) === r3(m0.ts(1440)),
       "type 0: 3/4, 120 bpm at the start, beats follow the tempo change (" + L0.beats.length + " beats, bars at " + L0.downbeats.map(r3).join(", ") + ")");
    ok(L0.key.key === 7 && !L0.key.minor && L0.key.name === "G", "type 0: the key is G (from the key signature and the notes): " + L0.key.name);
    const names0 = L0.chords.filter(ch => ch.root >= 0).map(ch => ch.name);
    ok(names0.join(" ") === "G C D7 G", "type 0: chords from the notes: " + names0.join(" ")); }
  { const m1 = midiType1(), L1 = await p.evaluate(a => AOGLearn.fromMidi(new Uint8Array(a).buffer), Array.from(m1.bytes));
    const T = n => L1.tracks.find(t => t.name === n);
    const errsN = ["Bass", "Lead", "Piano"].map(n => T(n) ? sameNotes(T(n).notes, m1[n.toLowerCase()]) : "no " + n).filter(Boolean); const dr = L1.tracks.find(t => t.drums);
    ok(L1.tracks.length === 4 && !errsN.length && dr && !sameNotes(dr.notes, m1.drums), "type 1: four tracks, every note exact (note-off messages and note-on 0, running status, 100 → 75 bpm) " + errsN.join(" "));
    ok(T("Bass").ch === 2 && T("Bass").program === 33 && T("Bass").programName === "Electric Bass (finger)" && T("Lead").programName === "Lead 1 (square)" && T("Piano").programName === "Acoustic Grand Piano" &&
       dr.ch === 10 && dr.name === "Drums" && L1.name === "Song Test", "type 1: track names, channels and General MIDI program names");
    ok(!sameNotes(L1.bass.map(n => ({ t: n.t, d: n.d, m: n.m })), m1.bass.map(n => ({ t: n.t, d: n.d, m: n.m }))) && !sameNotes(L1.melody.map(n => ({ t: n.t, d: n.d, m: n.m })), m1.lead.map(n => ({ t: n.t, d: n.d, m: n.m }))),
       "type 1: the bass line is the bass track, the melody is the lead");
    ok(L1.notes.length === m1.bass.length + m1.lead.length + m1.piano.length && L1.bpm === 100 && L1.meter.num === 4 && L1.downbeats.length === 8 && r3(L1.downbeats[3]) === r3(m1.ts(3 * m1.bar)) && L1.beats.length === 32,
       "type 1: all pitched notes, 100 bpm, 4/4, 8 bars and 32 beats on the tempo map");
    const cn = L1.chords.filter(ch => ch.root >= 0);
    ok(cn.map(ch => ch.name).join(" ") === "C G Am F C G Am F" && cn.every((ch, i) => Math.abs(ch.t - m1.ts(i * m1.bar)) < 1e-3) && L1.key.name === "C", "type 1: chords bar by bar: " + cn.map(ch => ch.name).join(" ") + " in " + L1.key.name);
    const viaBlob = await p.evaluate(async a => { const L = await AOGLearn.analyze(new File([new Uint8Array(a)], "song.mid")); return { src: L.src, name: L.name, n: L.notes.length }; }, Array.from(m1.bytes));
    ok(viaBlob.src === "midi" && viaBlob.n === L1.notes.length && viaBlob.name === "song", "a MIDI File given to analyze() is read as MIDI"); }

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close(); await b.close(); srv.close(); srv2.close();
  console.log(fails ? fails + " failed" : "all passed");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e && e.stack || e)); process.exit(1); });
