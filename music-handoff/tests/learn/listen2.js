/* AOG-LEARN-V2 (2026-10-12) — the listening engine, second round (aog-learn.js). Jimmy: "Make it hit the ceiling … the
   world's best". This suite checks what was added, and prints the accuracy table before (the engine as it was, commit
   e1b37306, served beside the new one) and after:
   · E1 the beat on off-beat-heavy music: every starter-crate song's beat F-measure ≥ 0.95, and no synthetic or crate song's
     beat or bar-one score lower than before;
   · E2 7ths on short stabs: crate chords (root and quality) ≥ 0.8, synthetic ≥ 0.94; and a held-out song made here of
     short 7th stabs over a held bass;
   · E3 the song's parts: lesson.sections [{t,d,kind,letter}] from the first beat to the end, on bar lines, at least two
     bars; synthetic songs built here with a clear form (intro, A A B A, verse-chorus, an ending) and the starter crate
     (a drums-only intro, then one loop: one letter); AOGLearn.sections(lesson) from the chords alone agrees; MIDI
     lessons have them; the words (Intro, Part, Ending · Intro, Parte, Final);
   · E4 AOGLearn.hearChord(samples, sr): plucked and strummed guitar-like chords (Karplus-Strong) made here, open chords
     and barre chords, at 44.1 and 48 kHz, with and without a bass note; single notes and silence and noise give null or a
     low confidence; under 3 ms a call for 0.25 s;
   · E5 AOGLearn.simplify and AOGLearn.capo;
   · E6 analyze(…, {signal}) stops when asked (an AbortError), in a worker and on the page alone;
   · E7 the bass alone (the crate's bars 5-8, before the band comes in) is a power chord on the bass note or N.C.;
   · the worker and the page-only way still give the very same lesson (on the very same samples: the browser's own rendering
     of a song made here differs in its last bit from one rendering to the next); no page errors;
   · the page alone, from cold, never works longer than 12 ms at a time (the longest slice, from the browser's trace).
   Ports 9287 (the page), 9288 (a page without Workers), 9289 (the engine as it was). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), cp = require("child_process");
const M = require("./metrics.js");
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const r3 = x => Math.round(x * 1000) / 1000;
let OLD = ""; if (require.main === module) try { OLD = cp.execSync("git show e1b37306:aog-deploy/aog-learn.js", { cwd: __dirname, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1 << 24 }).toString(); } catch (e) {}

/* ───────── songs with a form: intro, parts, an ending ───────── */
const IV = { maj: [0, 4, 7], min: [0, 3, 7], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10] };
const near = (pc, c) => c - 6 + ((pc - (c - 6)) % 12 + 12) % 12;
/* o: {name, bpm, inst: piano|guitar|stab, bass: quarters|held|rootfifth, intro: drum-only bars, introProg: bars of their own
   (heard once), form: "AABA", parts: {A: [[root, q], … one per bar]}, end: bars of the home chord held, key} */
function makeForm(o) {
  const beat = 60 / o.bpm, per = 4, barT = per * beat, start = 0.25, ev = [], chords = [], bass = [], lead = [], secs = [];
  let bar = 0;
  const addBars = (list, kind, letter) => { secs.push({ t: start + bar * barT, kind, letter: letter || "" }); list.forEach(([root, q]) => { chords.push({ t: start + bar * barT, d: barT, root, q }); bar++; }); };
  if (o.intro) { secs.push({ t: start, kind: "intro", letter: "" }); for (let i = 0; i < o.intro; i++) { chords.push({ t: start + bar * barT, d: barT, root: -1, q: "N" }); bar++; } }
  if (o.introProg) addBars(o.introProg, o.intro ? "intro" : "intro");
  for (const L of o.form) addBars(o.parts[L], "part", L);
  if (o.end) addBars(Array(o.end).fill(o.parts[o.form[0]][0]), "end");
  const bars = bar, sec = start + bars * barT + 1.2;
  /* merge an intro made of drums then its own bars into one */
  const S = []; secs.forEach(s => { const L = S[S.length - 1]; if (L && L.kind === "intro" && s.kind === "intro") return; S.push(s); });
  chords.forEach((c, k) => { if (c.root < 0) return;
    const tones = IV[c.q].map(i => (c.root + i) % 12), voic = tones.map(pc => near(pc, 60)).sort((a, z) => a - z), last = k === chords.length - 1 || (o.end && k >= chords.length - o.end);
    for (let j = 0; j < per; j++) { const t0 = c.t + j * beat;
      if (last) { if (j === 0) voic.forEach(m => ev.push({ k: "piano", t: t0, d: barT * 0.95, m, g: 0.08 })); continue; }
      if (o.inst === "guitar") { const gv = [near(c.root, 48)].concat(voic, [near(tones[0], 67)]);
        [0, 0.5].forEach((h, u) => { const tt = t0 + h * beat; (u ? gv.slice().reverse() : gv).forEach((m, s) => ev.push({ k: "guitar", t: tt + s * 0.012, d: 0.5 * beat * 0.95, m, g: u ? 0.05 : 0.07 })); }); }
      else if (o.inst === "stab") { if (j === 1 || j === 3) voic.forEach(m => ev.push({ k: "stab", t: t0 + 0.5 * beat, d: 0.3 * beat, m, g: 0.1 })); }
      else voic.forEach(m => ev.push({ k: "piano", t: t0, d: beat * 0.92, m, g: 0.09 })); }
    const R = near(c.root, 41), F = near((c.root + 7) % 12, 43);
    if (o.bass === "held" || last) bass.push({ t: c.t, d: barT * 0.95, m: R });
    else for (let j = 0; j < per; j++) bass.push({ t: c.t + j * beat, d: beat * 0.85, m: o.bass === "rootfifth" && j % 2 ? F : R });
    /* a lead in the parts: chord tones, a rest at the end of every fourth bar */
    if (!last && o.lead !== false) { const bi = Math.round((c.t - start) / barT), mel = IV[c.q].slice(0, 3).map(i => near((c.root + i) % 12, 74));
      const rh = bi % 4 === 3 ? [[0, 3]] : [[0, 1], [1, 1], [2, 0.5], [2.5, 0.5], [3, 1]];
      rh.forEach(([at, len], q) => lead.push({ t: c.t + at * beat, d: len * beat * 0.9, m: mel[(bi + q) % 3] })); } });
  lead.forEach(n => ev.push({ k: "lead", t: n.t, d: n.d, m: n.m, g: 0.2 }));
  bass.forEach(n => ev.push({ k: "bass", t: n.t, d: n.d, m: n.m, g: 0.32 }));
  for (let i = 0; i < bars * per; i++) { const t0 = start + i * beat, pos = i % per, inEnd = o.end && i >= (bars - o.end) * per;
    if (inEnd && i > (bars - o.end) * per) continue;
    if (pos === 0 || pos === 2) ev.push({ k: "kick", t: t0, g: 0.8 }); else ev.push({ k: "snare", t: t0, g: 0.35 });
    ev.push({ k: "hat", t: t0, g: 0.12 }); ev.push({ k: "hat", t: t0 + 0.5 * beat, g: 0.08 }); }
  const beats = []; for (let i = 0; i < bars * per; i++) beats.push(start + i * beat);
  const downbeats = []; for (let i = 0; i < bars; i++) downbeats.push(start + i * barT);
  return { name: o.name, sec, ev, truth: { bpm: o.bpm, beats, downbeats, chords, bass, melody: lead, key: o.key, num: per, sections: S, end: start + bars * barT } };
}
const FORMS = [
  makeForm({ name: "aaba-piano", bpm: 96, inst: "piano", bass: "quarters", key: { key: 0, minor: false }, intro: 4, form: "AABA", end: 2,
    parts: { A: [[0, "maj"], [7, "maj"], [9, "min"], [5, "maj"], [0, "maj"], [7, "maj"], [5, "maj"], [0, "maj"]],
             B: [[5, "maj"], [5, "maj"], [0, "maj"], [0, "maj"], [2, "min"], [7, "maj"], [4, "min"], [7, "maj"]] } }),
  makeForm({ name: "verse-chorus-guitar", bpm: 112, inst: "guitar", bass: "rootfifth", key: { key: 7, minor: false }, introProg: [[4, "min"], [0, "maj"], [4, "min"], [0, "maj"]], form: "ABAB", end: 2,
    parts: { A: [[7, "maj"], [2, "maj"], [4, "min"], [0, "maj"], [7, "maj"], [2, "maj"], [4, "min"], [0, "maj"]],
             B: [[0, "maj"], [2, "maj"], [7, "maj"], [4, "min"], [0, "maj"], [2, "maj"], [7, "maj"], [7, "maj"]] } }),
  makeForm({ name: "stab-sevenths-aaba", bpm: 104, inst: "stab", bass: "held", lead: false, key: { key: 5, minor: false }, intro: 4, form: "AABA",
    parts: { A: [[5, "maj7"], [2, "m7"], [7, "m7"], [0, "7"], [5, "maj7"], [2, "m7"], [7, "m7"], [0, "7"]],
             B: [[10, "maj7"], [10, "maj7"], [9, "m7"], [2, "7"], [7, "m7"], [7, "m7"], [0, "7"], [0, "7"]] } }),
];

/* runs in the page: render events into an AudioBuffer (44.1 kHz stereo); Karplus-Strong strums */
function synth2() {
  let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648 * 2 - 1;
  window.renderSong = async function (ev, sec, sr) { seed = 12345;
    sr = sr || 44100; const ctx = new OfflineAudioContext(2, Math.ceil(sec * sr), sr), out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination);
    const wave = (h) => { const re = new Float32Array(h.length + 1), im = new Float32Array(h.length + 1); h.forEach((a, i) => im[i + 1] = a); return ctx.createPeriodicWave(re, im); };
    const W = { piano: wave([1, 0.6, 0.35, 0.25, 0.15, 0.1, 0.06, 0.04]), guitar: wave([1, 0.8, 0.55, 0.45, 0.3, 0.25, 0.15, 0.1, 0.08, 0.05]),
      bass: wave([1, 0.5, 0.25, 0.12, 0.06]), lead: wave([1, 0.5, 0.33, 0.25, 0.2, 0.16, 0.14, 0.12]), stab: wave([1, 0.45, 0.3, 0.2, 0.1]) };
    const nb = ctx.createBuffer(1, Math.ceil(sr * 0.4), sr), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = rnd();
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    for (const e of ev) {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(out);
      if (W[e.k]) {
        const o = ctx.createOscillator(); o.setPeriodicWave(W[e.k]); o.frequency.value = hz(e.m); o.connect(g);
        const tau = e.k === "piano" ? 0.6 : e.k === "guitar" ? 0.35 : e.k === "bass" ? 0.9 : e.k === "stab" ? 0.09 : 1e4;
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
  /* a plucked string (Karplus-Strong, extended as Jaffe and Smith did): a noise burst, softened by a one-pole low-pass (how
     bright the pluck is) and combed at the plucking point, round a delay line that loses a little each time */
  window.pluck = function (out, sr, midi, at, amp, bright, pos) {
    const f = 440 * Math.pow(2, (midi - 69) / 12), N = Math.max(2, Math.round(sr / f)), buf = new Float32Array(N), s0 = Math.floor(at * sr);
    const a = bright == null ? 0.5 : bright; let lp = 0;
    for (let i = 0; i < N; i++) { lp += a * (rnd() - lp); buf[i] = lp; }
    const P = Math.max(1, Math.round((pos == null ? 0.13 : pos) * N)), ex = Float32Array.from(buf); for (let i = 0; i < N; i++) buf[i] = ex[i] - ex[(i - P + N) % N];
    let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(buf[i])); for (let i = 0; i < N; i++) buf[i] /= mx || 1;
    let p = 0; const loss = 0.996;
    for (let i = s0; i < out.length; i++) { const v = buf[p], nx = buf[(p + 1) % N]; out[i] += amp * v; buf[p] = loss * 0.5 * (v + nx); p = (p + 1) % N; }
  };
  /* a strum: strings low to high, `gap` seconds apart; a bass note under it if asked */
  window.strum = function (notes, sr, len, gap, bassMidi) { seed = 777 + notes.reduce((a, b) => a + b, 0);
    const out = new Float32Array(Math.round(len * sr));
    notes.forEach((m, i) => pluck(out, sr, m, 0.01 + i * (gap == null ? 0.012 : gap), 0.25));
    if (bassMidi != null) pluck(out, sr, bassMidi, 0.0, 0.4, 0.15, 0.25);
    return out; };
  window.single = function (m, sr, len) { seed = m; const out = new Float32Array(Math.round(len * sr)); pluck(out, sr, m, 0.01, 0.3); return out; };
}
/* guitar chords as MIDI notes, low string to high: open chords, their 7ths, sus, and barre chords */
const GUITAR = {
  C: [[48, 52, 55, 60, 64], 0, "maj"], A: [[45, 52, 57, 61, 64], 9, "maj"], G: [[43, 47, 50, 55, 59, 67], 7, "maj"], E: [[40, 47, 52, 56, 59, 64], 4, "maj"],
  D: [[50, 57, 62, 66], 2, "maj"], Am: [[45, 52, 57, 60, 64], 9, "min"], Em: [[40, 47, 52, 55, 59, 64], 4, "min"], Dm: [[50, 57, 62, 65], 2, "min"],
  E7: [[40, 47, 50, 56, 59, 64], 4, "7"], A7: [[45, 52, 55, 61, 64], 9, "7"], D7: [[50, 57, 60, 66], 2, "7"], G7: [[43, 47, 50, 55, 59, 65], 7, "7"],
  C7: [[48, 52, 58, 60, 64], 0, "7"], Am7: [[45, 52, 55, 60, 64], 9, "m7"], Em7: [[40, 47, 52, 55, 62, 64], 4, "m7"], Cmaj7: [[48, 52, 55, 59, 64], 0, "maj7"],
  Fmaj7: [[53, 57, 60, 64], 5, "maj7"], Dm7: [[50, 57, 60, 65], 2, "m7"], Asus4: [[45, 52, 57, 62, 64], 9, "sus4"], Dsus2: [[50, 57, 62, 64], 2, "sus2"],
  F: [[41, 48, 53, 57, 60, 65], 5, "maj"], Bm: [[47, 54, 59, 62, 66], 11, "min"], Bb: [[46, 53, 58, 62, 65], 10, "maj"], "F#m": [[42, 49, 54, 57, 61, 66], 6, "min"],
  "C#m": [[49, 56, 61, 64, 68], 1, "min"], "G (barre)": [[43, 50, 55, 59, 62, 67], 7, "maj"],
};

module.exports = { FORMS, makeForm, synth2, GUITAR };
if (require.main !== module) return;

/* ───────── the test ───────── */
const srv = require("../srv.js")(9287), srv2 = require("../srv.js")(9288), srv3 = require("../srv.js")(9289);
const L1src = fs.readFileSync(path.join(__dirname, "listen.js"), "utf8");
const SONGS = (() => { const a = L1src.indexOf("const IV ="), b = L1src.indexOf("/* ───────── MIDI files"); const m = { exports: {} };
  new Function("module", "require", L1src.slice(a, b) + "\nmodule.exports = { SONGS };")(m, require); return m.exports.SONGS; })();
const HARNESS = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>learn</title></head><body><p id="t">listening test</p>
<script src="aog-learn.js"></script><script>(${synth2.toString()})();</script></body></html>`;
const OLDHARNESS = HARNESS.replace('src="aog-learn.js"', 'src="__old/aog-learn.js"');
function score(les, T, off) {
  off = off || 0; const sh = l => l.map(n => Object.assign({}, n, { t: n.t + off }));
  const s = { bpm: les.bpm, tempoErr: Math.abs(les.bpm - T.bpm) / T.bpm, beatF: M.fmeasure(les.beats, T.beats.map(t => t + off)), downF: M.fmeasure(les.downbeats, T.downbeats.map(t => t + off)),
    key: M.keyScore(les.key, T.key), chordExact: M.chordAcc(les.chords, sh(T.chords), "exact"), chordMajMin: M.chordAcc(les.chords, sh(T.chords), "majmin"),
    bassF: M.noteF(les.bass, sh(T.bass)).f };
  if (T.melody && T.melody.length) s.melodyF = M.noteF(les.melody, sh(T.melody)).f;
  return s;
}
const mean = (a, k) => a.reduce((x, s) => x + (s[k] || 0), 0) / a.length;
const secStr = S => (S || []).map(z => (z.kind === "part" ? z.letter : z.kind) + "@" + z.t.toFixed(1)).join(" ");
/* the parts are whole: from the first beat to the end, one after another, each on a bar line and at least two bars long */
function wellFormed(L) {
  const S = L.sections || [], bar = 60 / L.bpm * (L.meter.num || 4), why = [];
  if (!S.length) return "none";
  if (Math.abs(S[0].t - L.beats[0]) > 1e-3) why.push("starts " + S[0].t + " not at the first beat " + L.beats[0]);
  if (Math.abs(S[S.length - 1].t + S[S.length - 1].d - L.sec) > 2e-3) why.push("ends " + r3(S[S.length - 1].t + S[S.length - 1].d) + " not at " + L.sec);
  S.forEach((z, i) => { if (i && Math.abs(S[i - 1].t + S[i - 1].d - z.t) > 2e-3) why.push("gap before " + i);
    if (["intro", "part", "end"].indexOf(z.kind) < 0) why.push("kind " + z.kind);
    if (z.kind === "part" ? !/^[A-Z]+$/.test(z.letter) : z.letter !== "") why.push("letter " + z.letter);
    if (i && z.kind !== "end" && !L.downbeats.some(t => Math.abs(t - z.t) < 2e-3)) why.push("part " + i + " at " + z.t + " is not on a bar line");
    if (z.d < 1.9 * bar && !(z.kind === "end" && i === S.length - 1)) why.push("part " + i + " is " + r3(z.d / bar) + " bars"); });
  const first = S.find(z => z.kind === "part"); if (first && first.letter !== "A") why.push("the first part is " + first.letter);
  return why.join("; ");
}

(async () => {
  const b = await pw.chromium.launch();
  const open = async (port, opt) => { opt = opt || {};
    const c = await b.newContext(); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await c.route("**/__learn.html", r => r.fulfill({ contentType: "text/html", body: opt.old ? OLDHARNESS : HARNESS }));
    if (opt.old) { await c.route("**/__old/aog-learn.js", r => r.fulfill({ contentType: "text/javascript", body: OLD }));
      await c.route("**/__old/aog-learn-worker.js", r => r.fulfill({ contentType: "text/javascript", body: fs.readFileSync(path.join(ROOT, "aog-learn-worker.js"), "utf8") })); }
    if (opt.noWorker) await c.addInitScript(() => { window.__workers = 0; delete window.Worker; window.Worker = undefined; });
    else await c.addInitScript(() => { window.__workers = 0; window.__ended = 0; const W = window.Worker;
      window.Worker = function (u, o) { window.__workers++; const w = new W(u, o), t = w.terminate.bind(w); w.terminate = () => { window.__ended++; t(); }; return w; }; });
    const p = await c.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    await p.goto(`http://localhost:${port}/__learn.html`); await p.waitForFunction(() => window.AOGLearn && window.renderSong);
    return { c, p, errs };
  };
  const { c, p, errs } = await open(9287);
  const old = OLD ? await open(9289, { old: true }) : null;
  if (!old) console.log("(the engine as it was, e1b37306, is not in this checkout: the table shows the new engine only)");

  /* ── the words ── */
  const words = await p.evaluate(() => AOGLearn.words);
  ok(words.en.intro === "Intro" && words.en.part === "Part" && words.en.end === "Ending" && words.es.intro === "Intro" && words.es.part === "Parte" && words.es.end === "Final",
    "the words for the parts: " + ["intro", "part", "end"].map(k => words.en[k] + " / " + words.es[k]).join(", ") + ` (so "${words.en.part} A", "${words.es.part} A")`);
  const api = await p.evaluate(() => ["analyze", "fromMidi", "sections", "hearChord", "simplify", "capo", "chordName", "keyName", "isMidi", "spell", "word"].filter(k => typeof AOGLearn[k] !== "function"));
  ok(!api.length, "AOGLearn has every function, old and new " + api.join(" "));

  /* ── before and after: the synthetic songs, the form songs, the starter crate ── */
  const runAll = async (pg, list) => { const out = []; for (const S of list) out.push(await pg.evaluate(async ({ ev, sec, name, url }) => {
      let L; if (url) { const ab = await (await fetch(url)).arrayBuffer(); L = await AOGLearn.analyze(ab); }
      else { const buf = await renderSong(ev, sec); L = await AOGLearn.analyze(buf, { name }); } return L; }, S)); return out; };
  const files = fs.readdirSync(path.join(ROOT, "audio/crate"));
  const CR = M.TRACKS.map(T => ({ name: T.n, url: "audio/crate/" + files.find(x => x.startsWith(T.n + "-")), T }));
  const jobsS = SONGS.map(S => ({ ev: S.ev, sec: S.sec, name: S.name })), jobsF = FORMS.map(S => ({ ev: S.ev, sec: S.sec, name: S.name })), jobsC = CR.map(x => ({ url: x.url, name: x.name }));
  const t0 = Date.now();
  const both = async pg => ({ S: await runAll(pg, jobsS), F: await runAll(pg, jobsF), C: await runAll(pg, jobsC) });
  const [NEW, OLDL] = await Promise.all([both(p), old ? both(old.p) : null]);   /* the two engines side by side */
  const crateScore = (L, T) => { const G = M.crateTruth(T);
    const offs = L.beats.map(t => { let d = 9; G.beats.forEach(g => { if (Math.abs(t - g) < Math.abs(d)) d = t - g; }); return d; }).sort((a, z) => a - z);
    const off = Math.max(-0.08, Math.min(0.08, offs[offs.length >> 1])); return score(L, Object.assign({}, G, { melody: [] }), Math.abs(off) < 0.07 ? off : 0); };
  const rows = [];
  SONGS.forEach((S, i) => rows.push({ kind: "synth", name: S.name, n: score(NEW.S[i], S.truth), o: OLDL && score(OLDL.S[i], S.truth) }));
  FORMS.forEach((S, i) => rows.push({ kind: "form", name: S.name, n: score(NEW.F[i], S.truth), o: OLDL && score(OLDL.F[i], S.truth) }));
  CR.forEach((x, i) => rows.push({ kind: "crate", name: x.url.split("/").pop().replace(".mp3", ""), n: crateScore(NEW.C[i], x.T), o: OLDL && crateScore(OLDL.C[i], x.T) }));
  const K = ["beatF", "downF", "chordExact", "chordMajMin", "bassF", "key"];
  const cell = (o, n) => (o == null ? "" : r3(o).toFixed(3) + "→") + r3(n).toFixed(3);
  console.log("== accuracy, before → after (" + ((Date.now() - t0) / 1000).toFixed(0) + " s)");
  console.log("   " + "song".padEnd(22) + K.map(k => k.padEnd(13)).join(" "));
  rows.forEach(r => console.log("   " + r.name.padEnd(22) + K.map(k => cell(r.o && r.o[k], r.n[k]).padEnd(13)).join(" ")));
  ["synth", "form", "crate"].forEach(kd => { const R = rows.filter(r => r.kind === kd), mo = k => mean(R.map(r => r.o || {}), k), mn = k => mean(R.map(r => r.n), k);
    console.log("   " + ("mean " + kd).padEnd(22) + K.map(k => cell(OLDL ? mo(k) : null, mn(k)).padEnd(13)).join(" ")); });
  const S_ = rows.filter(r => r.kind === "synth"), C_ = rows.filter(r => r.kind === "crate"), F_ = rows.filter(r => r.kind === "form");
  /* E1 */
  ok(C_.every(r => r.n.beatF >= 0.95), "E1 the beat: every crate song's beat F-measure ≥ 0.95 (" + C_.map(r => r3(r.n.beatF)).join(", ") + ")");
  if (OLDL) { const worse = rows.filter(r => r.kind !== "form" && (r.n.beatF < r.o.beatF - 0.005 || r.n.downF < r.o.downF - 0.005)).map(r => r.name);
    ok(!worse.length, "E1 and no synthetic or crate song's beat or bar one is lower than before " + worse.join(" "));
    const lower = ["chordMajMin", "bassF", "key"].filter(k => mean(S_.map(r => r.n), k) < mean(S_.map(r => r.o), k) - 0.005 || mean(C_.map(r => r.n), k) < mean(C_.map(r => r.o), k) - 0.005);
    ok(!lower.length, "nothing else went down (root and third, bass notes, key; synthetic and crate means) " + lower.join(" ")); }
  /* E2 */
  const ce = mean(C_.map(r => r.n), "chordExact"), se = mean(S_.map(r => r.n), "chordExact");
  ok(ce >= 0.8 && se >= 0.94, `E2 7ths on short stabs: crate chords (root and quality) ${r3(ce)}${OLDL ? " (was " + r3(mean(C_.map(r => r.o), "chordExact")) + ")" : ""}, synthetic ${r3(se)}`);
  const stab = F_.find(r => r.name === "stab-sevenths-aaba");
  ok(stab.n.chordExact >= 0.9, "E2 and a song made here of short 7th stabs over a held bass (not tuned on): " + r3(stab.n.chordExact));
  /* E7 the bass alone: in bars 5-8 of every crate song the bass plays before the band comes in; those bars are a power
     chord on the bass note ("5") or N.C., never a chord the overtones and the drums seem to make */
  { let tot = 0, good = 0; const say = [];
    CR.forEach((x, i) => { const L = NEW.C[i], G = M.crateTruth(x.T), bar = 240 / x.T.bpm, names = [];
      const offs = L.beats.map(t => { let d = 9; G.beats.forEach(g => { if (Math.abs(t - g) < Math.abs(d)) d = t - g; }); return d; }).sort((a, z) => a - z), off = Math.abs(offs[offs.length >> 1]) < 0.07 ? offs[offs.length >> 1] : 0;
      for (let b = 4; b < 8; b++) { const t0 = b * bar + off, t1 = t0 + bar, root = (9 + x.T.key + x.T.prog[b % 4][0]) % 12;
        L.chords.forEach(c => { const ov = Math.min(t1, c.t + c.d) - Math.max(t0, c.t); if (ov <= 0.05) return; tot += ov;
          if (c.root < 0 || (c.q === "5" && c.root === root)) good += ov; if (names[names.length - 1] !== c.name) names.push(c.name); }); }
      say.push(x.name + " " + names.join(" ")); });
    ok(good >= 0.9 * tot, `E7 the bass alone before the band: ${r3(good / tot)} of bars 5-8 a power chord on the bass note or N.C. (${say.join(" · ")})`); }

  /* ── E3 the song's parts ── */
  console.log("== the song's parts");
  FORMS.forEach((S, i) => { const L = NEW.F[i], ss = M.sectionScore(L.sections, S.truth.sections, S.truth.end, 0.6 * 60 / S.truth.bpm), wf = wellFormed(L);
    console.log("   " + S.name.padEnd(22) + "heard: " + secStr(L.sections) + "\n   " + "".padEnd(22) + "made:  " + S.truth.sections.map(z => (z.kind === "part" ? z.letter : z.kind) + "@" + z.t.toFixed(1)).join(" "));
    ok(ss.bound >= 0.9 && ss.kind >= 0.95 && ss.pair >= 0.95 && !wf, `E3 ${S.name}: boundaries ${r3(ss.bound)}, kinds ${r3(ss.kind)}, same-part pairs ${r3(ss.pair)} ${wf}`); });
  const lessonOnly = await p.evaluate(Ls => Ls.map(L => { const x = Object.assign({}, L); delete x.sections; return AOGLearn.sections(x); }), NEW.F);
  FORMS.forEach((S, i) => { const ss = M.sectionScore(lessonOnly[i], S.truth.sections, S.truth.end, 0.6 * 60 / S.truth.bpm);
    ok(ss.bound >= 0.9 && ss.kind >= 0.9 && ss.pair >= 0.95, `E3 AOGLearn.sections(lesson) from the chords and bars alone, ${S.name}: ${secStr(lessonOnly[i])} (${r3(ss.bound)}, ${r3(ss.kind)}, ${r3(ss.pair)})`); });
  const crateWhy = CR.map((x, i) => { const L = NEW.C[i], S = L.sections, bar = 4 * 60 / x.T.bpm, off = L.beats[0], why = [wellFormed(L)].filter(Boolean);
    const ie = S[0].kind === "intro" ? (S[0].t + S[0].d - off) / bar : -1;
    if (!(Math.abs(ie - 4) < 0.1 || Math.abs(ie - 8) < 0.1)) why.push("intro " + r3(ie) + " bars");
    if (new Set(S.filter(z => z.kind === "part").map(z => z.letter)).size !== 1) why.push("letters " + secStr(S));
    return why.length ? x.name + ": " + why.join(", ") : ""; }).filter(Boolean);
  console.log("   crate: " + CR.map((x, i) => x.name + " " + secStr(NEW.C[i].sections)).join(" | "));
  ok(!crateWhy.length, "E3 the starter crate: a drums-only intro (to bar 5 or bar 9, where the band comes in), then one loop, one letter " + crateWhy.join(" · "));
  const crateLesson = await p.evaluate(L => { const x = Object.assign({}, L); delete x.sections; return AOGLearn.sections(x); }, NEW.C[10]);
  ok(crateLesson[0].kind === "intro" && crateLesson.filter(z => z.kind === "part").every(z => z.letter === "A"), "E3 and from a crate lesson's chords alone: " + secStr(crateLesson));
  const oldStyle = await p.evaluate(() => { const r = [AOGLearn.sections({}), AOGLearn.sections({ beats: [], chords: [] })];
    const L = { sec: 20, bpm: 120, meter: { num: 4 }, beats: [], downbeats: [], chords: [] }; for (let i = 0; i < 40; i++) L.beats.push(i * 0.5);
    L.chords = [{ t: 0, d: 20, root: 0, q: "maj" }]; r.push(AOGLearn.sections(L)); return r; });
  ok(oldStyle[0].length === 0 && oldStyle[1].length === 0 && oldStyle[2].length >= 1 && oldStyle[2][0].t === 0 && Math.abs(oldStyle[2].slice(-1)[0].t + oldStyle[2].slice(-1)[0].d - 20) < 1e-3,
    "E3 a lesson with no beats gives no parts; one chord all the way gives parts that cover it (" + secStr(oldStyle[2]) + ")");

  /* MIDI lessons have their parts too (four bars of C G Am F, twice) */
  { const vlq = n => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
    const chunk = (id, body) => [...Buffer.from(id), (body.length >>> 24) & 255, (body.length >>> 16) & 255, (body.length >>> 8) & 255, body.length & 255, ...body];
    const ev = []; const roots = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]], bass = [36, 43, 45, 41];
    for (let rep = 0; rep < 2; rep++) for (let k = 0; k < 4; k++) { const t = (rep * 4 + k) * 1920; roots[k].forEach(m => ev.push([t, [0x90, m, 90]], [t + 1900, [0x80, m, 0]])); ev.push([t, [0x91, bass[k], 90]], [t + 1900, [0x81, bass[k], 0]]); }
    ev.sort((a, z) => a[0] - z[0]); let last = 0, body = [...vlq(0), 0xFF, 0x51, 3, 0x07, 0xA1, 0x20]; ev.forEach(([t, bb]) => { body.push(...vlq(t - last), ...bb); last = t; }); body.push(0, 0xFF, 0x2F, 0);
    const bytes = [...chunk("MThd", [0, 0, 0, 1, 1, 0xE0]), ...chunk("MTrk", body)];
    const ML = await p.evaluate(a => AOGLearn.fromMidi(new Uint8Array(a).buffer), bytes);
    ok(Array.isArray(ML.sections) && ML.sections.length === 2 && ML.sections.every(z => z.kind === "part" && z.letter === "A") && Math.abs(ML.sections[1].t - 8) < 1e-3,
      "E3 a MIDI lesson has its parts: " + secStr(ML.sections)); }

  /* ── the worker and the page alone still agree, parts and all ── */
  { const W = await open(9288, { noWorker: true });
    /* the very same samples on both pages: rendered once (as 22050 Hz mono, what the listener hears), then handed over */
    const b64 = await p.evaluate(async ({ ev, sec }) => { const buf = await renderSong(ev, sec), len = Math.ceil(buf.length * 22050 / buf.sampleRate), ctx = new OfflineAudioContext(1, len, 22050), s = ctx.createBufferSource();
      s.buffer = buf; s.connect(ctx.destination); s.start(0); const m = (await ctx.startRendering()).getChannelData(0), u = new Uint8Array(m.buffer, m.byteOffset, m.byteLength); let x = "";
      for (let i = 0; i < u.length; i += 8192) x += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(x); }, jobsF[1]);
    const unpack = b64 => { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
      const f = new Float32Array(u.buffer), B = new AudioBuffer({ length: f.length, numberOfChannels: 1, sampleRate: 22050 }); B.copyToChannel(f, 0); return B; };
    const a = await p.evaluate(async ({ x, f }) => AOGLearn.analyze(new Function("return " + f)()(x), { name: "x" }), { x: b64, f: unpack.toString() });
    /* and on the page alone, two listenings at once (they share nothing) */
    const [z, z2] = await W.p.evaluate(async ({ x, f }) => { const B = new Function("return " + f)()(x); return Promise.all([AOGLearn.analyze(B, { name: "x" }), AOGLearn.analyze(B, { name: "x" })]); }, { x: b64, f: unpack.toString() });
    const dk = Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(z[k])), dk2 = Object.keys(z).filter(k => JSON.stringify(z[k]) !== JSON.stringify(z2[k]));
    ok(!dk.length && !dk2.length && a.sections.length > 3, "the worker and the page alone give the very same lesson, parts and all (" + a.sections.length + " parts), and so do two listenings at once on the page alone " + dk.map(k => k + ": " + JSON.stringify(a[k]).slice(0, 160) + " vs " + JSON.stringify(z[k]).slice(0, 160)).join(" · ") + dk2.join(" "));
    /* E6 on the page alone: asked to stop, it stops */
    const st = await W.p.evaluate(async ({ ev, sec }) => { const buf = await renderSong(ev, sec), ctl = new AbortController(); let last = 0, after = 0, stopped = 0;
      const t0 = performance.now(); setTimeout(() => { ctl.abort(); stopped = performance.now(); }, 400);
      let err = null; try { await AOGLearn.analyze(buf, { signal: ctl.signal, onProgress: q => { last = q; if (stopped) after++; } }); } catch (e) { err = e; }
      const rejAt = performance.now(); await new Promise(r => setTimeout(r, 600));
      const pre = new AbortController(); pre.abort(); let e2 = null; try { await AOGLearn.analyze(buf, { signal: pre.signal }); } catch (e) { e2 = e; }
      return { name: err && err.name, late: Math.round(rejAt - stopped), last, after, pre: e2 && e2.name }; }, jobsF[0]);
    ok(st.name === "AbortError" && st.late < 200 && st.after <= 1 && st.last < 1 && st.pre === "AbortError",
      `E6 on the page alone: stopped ${st.late} ms after it was asked, an ${st.name}, at ${r3(st.last)} of the way; a signal already stopped: ${st.pre}`);
    /* the page alone stays calm on a long song: it gives the browser a moment every few ms */
    const br = await W.p.evaluate(async (u) => { const ab = await (await fetch(u)).arrayBuffer(); const one = await new OfflineAudioContext(1, 1, 22050).decodeAudioData(ab);
      const n = 150 * 22050, buf = new AudioBuffer({ length: n, numberOfChannels: 1, sampleRate: 22050 }), d = buf.getChannelData(0), s0 = one.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = s0[i % s0.length];
      let last = performance.now(), gaps = []; const ch = new MessageChannel(); let on = true;
      ch.port1.onmessage = () => { const t = performance.now(); gaps.push(t - last); last = t; if (on) setTimeout(() => ch.port2.postMessage(0), 0); }; ch.port2.postMessage(0);
      const t0 = performance.now(); await AOGLearn.analyze(buf); on = false; gaps.sort((a, z) => a - z);
      return { ms: performance.now() - t0, worst: gaps[gaps.length - 1], p99: gaps[Math.floor(0.99 * gaps.length)], n: gaps.length }; }, "audio/crate/06-brass-bus.mp3");
    console.log(`   page alone, 2½ minutes: ${(br.ms / 1000).toFixed(1)} s; the page got a turn ${br.n} times, 99% within ${br.p99.toFixed(0)} ms, the longest wait ${br.worst.toFixed(0)} ms`);
    ok(br.p99 < 16 && br.worst < 60, "the page alone keeps breathing on a long song (99% of waits under 16 ms)");
    ok(W.errs.length === 0, "no page errors on the page alone " + W.errs.join(" | ")); await W.c.close(); }
  /* the longest slice: a fresh page alone (the code not yet warm) listens to 2½ minutes, and the browser's own trace gives
     every task's work on the page's thread (its CPU time: a busy machine stretches the wall time of a task, not this) */
  { const W = await open(9288, { noWorker: true });
    await W.p.evaluate(async (u) => { const ab = await (await fetch(u)).arrayBuffer(); const one = await new OfflineAudioContext(1, 1, 22050).decodeAudioData(ab);
      const n = 150 * 22050, buf = new AudioBuffer({ length: n, numberOfChannels: 1, sampleRate: 22050 }), d = buf.getChannelData(0), s0 = one.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = s0[i % s0.length]; window.__long = buf; }, "audio/crate/06-brass-bus.mp3");
    await b.startTracing(W.p, { categories: ["toplevel", "blink.user_timing"] });
    const ms = await W.p.evaluate(async () => { const t0 = performance.now(); performance.mark("aog-start"); await AOGLearn.analyze(window.__long); performance.mark("aog-end");
      const t = performance.now() - t0; await new Promise(r => setTimeout(r, 0)); return t; });
    const tr = JSON.parse((await b.stopTracing()).toString()), ev = tr.traceEvents || tr, m0 = ev.find(e => e.name === "aog-start"), m1 = ev.find(e => e.name === "aog-end");
    const tasks = m0 && m1 ? ev.filter(e => e.ph === "X" && /RunTask$/.test(e.name) && e.pid === m0.pid && e.tid === m0.tid && e.ts + e.dur >= m0.ts && e.ts <= m1.ts) : [];
    const cpu = tasks.map(e => (e.tdur != null ? e.tdur : e.dur) / 1000).sort((a, z) => z - a), wall = tasks.map(e => e.dur / 1000).sort((a, z) => z - a);
    console.log(`   a fresh page alone, 2½ minutes: ${(ms / 1000).toFixed(1)} s in ${tasks.length} slices; the longest ${cpu.slice(0, 5).map(x => x.toFixed(1)).join(", ")} ms of work (longest wall time ${wall.length ? wall[0].toFixed(0) : "?"} ms)`);
    ok(tasks.length > 100 && cpu[0] <= 12, `the longest slice on the page alone, from cold: ${cpu.length ? cpu[0].toFixed(1) : "?"} ms (12 ms or less)`);
    ok(W.errs.length === 0, "no page errors on the fresh page alone " + W.errs.join(" | ")); await W.c.close(); }
  /* E6 in the worker */
  { const st = await p.evaluate(async ({ ev, sec }) => { const buf = await renderSong(ev, sec), ctl = new AbortController(), w0 = window.__workers, e0 = window.__ended;
      let stopped = 0; setTimeout(() => { ctl.abort(); stopped = performance.now(); }, 300);
      let err = null; try { await AOGLearn.analyze(buf, { signal: ctl.signal }); } catch (e) { err = e; }
      const late = performance.now() - stopped; const after = await AOGLearn.analyze(window.__lastBuf = buf, { name: "again" });
      return { name: err && err.name, late: Math.round(late), workers: window.__workers - w0, ended: window.__ended - e0, again: after.chords.length > 0 }; }, jobsF[0]);
    ok(st.name === "AbortError" && st.late < 100 && st.workers >= 1 && st.workers === st.ended && st.again, `E6 in the worker: stopped ${st.late} ms after it was asked (${st.name}); every worker made (${st.workers}) has ended, after a stop and after a lesson; the next song listens as usual`); }

  /* ── E4 a chord played now ── */
  console.log("== hearChord");
  const hc = await p.evaluate(G => { const out = [], ms = [];
    for (const sr of [44100, 48000]) for (const nm of Object.keys(G)) { const [notes, root, q] = G[nm];
      for (const bass of [null, root + 36 - (root > 7 ? 12 : 0)]) { const x = strum(notes, sr, 0.8, 0.012, bass);
        for (const [w0, w1] of [[0, 0.25], [0.05, 0.2], [0.3, 0.55], [0, 0.5]]) { const seg = x.subarray(Math.round(w0 * sr), Math.round(w1 * sr));
          const r = AOGLearn.hearChord(seg, sr); out.push({ nm, sr, bass, w: w0 + "-" + w1, root, q, r }); } } }
    /* the time a call takes, for 0.25 s, after a first call */
    for (const sr of [44100, 48000]) { const x = strum(G.G[0], sr, 0.3, 0.012).subarray(0, Math.round(0.25 * sr)); AOGLearn.hearChord(x, sr);
      for (let i = 0; i < 200; i++) { const t0 = performance.now(); AOGLearn.hearChord(x, sr); ms.push(performance.now() - t0); } }
    const singles = []; for (const sr of [44100, 48000]) for (const m of [40, 43, 45, 50, 52, 55, 57, 59, 64, 69, 76]) { const x = single(m, sr, 0.8);
      for (const [w0, w1] of [[0, 0.25], [0.3, 0.55]]) singles.push(AOGLearn.hearChord(x.subarray(Math.round(w0 * sr), Math.round(w1 * sr)), sr)); }
    let sd = 1; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647 * 2 - 1, noise = new Float32Array(11025).map(() => 0.3 * rn());
    const quiet = AOGLearn.hearChord(new Float32Array(11025), 44100), hiss = AOGLearn.hearChord(noise, 44100), short = AOGLearn.hearChord(strum(G.C[0], 44100, 0.05), 44100);
    const Cs = strum(G["C#m"][0], 44100, 0.6).subarray(2205, 13230);
    const spell = [AOGLearn.hearChord(Cs, 44100, 4, false), AOGLearn.hearChord(Cs, 44100, 8, false), AOGLearn.hearChord(Cs, 44100)];
    ms.sort((a, z) => a - z); return { out, med: ms[ms.length >> 1], p95: ms[Math.floor(0.95 * ms.length)], singles, quiet, hiss, short, spell }; }, GUITAR);
  const fam = q => ({ maj: "M", "7": "M", maj7: "M", min: "m", m7: "m", sus2: "s", sus4: "s" }[q] || q);
  const right = hc.out.filter(x => x.r && x.r.root === x.root && x.r.q === x.q), rf = hc.out.filter(x => x.r && x.r.root === x.root && fam(x.r.q) === fam(x.q));
  const noBass = hc.out.filter(x => x.bass == null), nbRight = noBass.filter(x => x.r && x.r.root === x.root && x.r.q === x.q);
  const sure = hc.out.filter(x => x.r && x.r.conf >= 0.5), sureRight = sure.filter(x => x.r.root === x.root && x.r.q === x.q);
  const wrong = hc.out.filter(x => x.r && !(x.r.root === x.root && x.r.q === x.q)), none = hc.out.filter(x => !x.r);
  console.log(`   ${hc.out.length} strums (${Object.keys(GUITAR).length} chords, 44.1 and 48 kHz, with and without a bass note, four windows): right ${right.length}, root and family ${rf.length}, nothing said ${none.length}, wrong ${wrong.length}`);
  wrong.slice(0, 12).forEach(x => console.log(`     ${x.nm} @${x.sr} ${x.w}s bass ${x.bass} → ${x.r.name} ${x.r.conf}`));
  ok(right.length >= 0.85 * hc.out.length && nbRight.length >= 0.88 * noBass.length && rf.length >= 0.88 * hc.out.length,
    `E4 hearChord names the strum: ${r3(right.length / hc.out.length)} right (root and quality), ${r3(nbRight.length / noBass.length)} without a bass note, ${r3(rf.length / hc.out.length)} root and family`);
  ok(sureRight.length >= 0.95 * sure.length && sure.length >= 0.5 * hc.out.length, `E4 when it is sure (conf ≥ 0.5, ${sure.length} times) it is right ${r3(sureRight.length / sure.length)} of the time`);
  ok(hc.singles.every(r => !r || r.conf < 0.5), "E4 a single note is not a confident chord: " + hc.singles.map(r => r ? r.name + " " + r.conf : "null").join(", "));
  ok(hc.quiet === null && hc.hiss === null && hc.short === null, "E4 silence, noise and too little sound give null");
  ok(hc.spell[0] && hc.spell[0].name === "C#m" && hc.spell[1] && hc.spell[1].name === "Dbm" && hc.spell[2] && hc.spell[2].root === 1 && hc.spell[2].q === "min",
    "E4 spelled in the key: in E " + (hc.spell[0] || {}).name + ", in Ab " + (hc.spell[1] || {}).name);
  ok(hc.p95 < 3, `E4 fast: ${hc.med.toFixed(2)} ms a call for 0.25 s (95% under ${hc.p95.toFixed(2)} ms; aim under 3 ms)`);

  /* ── E5 easier chords and the capo ── */
  const e5 = await p.evaluate(() => { const A = AOGLearn, c = { t: 1, d: 2, root: 0, q: "maj7", name: "Cmaj7", conf: 0.8 };
    const s = A.simplify(c, 0, false), list = ["7", "maj7", "sus2", "sus4", "aug", "5", "m7", "dim", "min", "maj"].map(q => A.simplify({ root: 10, q, name: "" }, 5, false));
    const nc = A.simplify({ t: 0, d: 1, root: -1, q: "N", name: "N.C." }), sharp = A.simplify({ root: 10, q: "7" }, 11, false);
    const mk = (cs) => ({ key: { key: cs.key, minor: false }, chords: cs.ch.map(([root, q], i) => ({ t: i * 2, d: 2, root, q, name: A.chordName(root, q, cs.key, false) })) });
    const capos = [mk({ key: 3, ch: [[3, "maj"], [8, "maj"], [10, "maj"], [0, "min"]] }), mk({ key: 7, ch: [[7, "maj"], [0, "maj"], [2, "maj"], [4, "min"]] }),
      mk({ key: 10, ch: [[10, "maj"], [3, "maj"], [5, "maj"], [7, "min"]] }), mk({ key: 0, ch: [[0, "maj"], [7, "7"], [9, "m7"], [5, "maj"]] })].map(A.capo);
    return { s, c, list: list.map(x => x.q + ":" + x.name), nc, sharp, capos, empty: A.capo({ chords: [] }) }; });
  ok(e5.s.q === "maj" && e5.s.name === "C" && e5.s.t === 1 && e5.s.d === 2 && e5.s.conf === 0.8 && e5.c.q === "maj7" && e5.c.name === "Cmaj7" && e5.s !== e5.c,
    "E5 simplify gives a copy (time, length and confidence kept, the chord itself unchanged): Cmaj7 → " + e5.s.name);
  ok(e5.list.join(" ") === "maj:Bb maj:Bb maj:Bb maj:Bb maj:Bb maj:Bb min:Bbm min:Bbm min:Bbm maj:Bb" && e5.nc.name === "N.C." && e5.nc.q === "N" && e5.sharp.name === "A#",
    "E5 7 maj7 sus2 sus4 aug 5 → major, m7 dim → minor, N stays; spelled in the key: " + e5.list.join(" ") + " · N.C. · in B: " + e5.sharp.name);
  const cp = e5.capos;
  ok(cp[0].fret === 1 && Math.abs(cp[0].open - 0.75) < 1e-6 && cp[0].shapes.map(s => s.from + ">" + s.shape).join(" ") === "Eb>D Ab>G Bb>A Cm>Bm",
    "E5 capo, a song in Eb (Eb Ab Bb Cm): fret " + cp[0].fret + ", " + cp[0].shapes.map(s => s.from + " as " + s.shape).join(", ") + ", open " + cp[0].open + " (frets 1, 3 and 6 tie: the lowest)");
  ok(cp[1].fret === 0 && cp[1].open === 1 && cp[2].fret === 3 && cp[2].open === 1 && cp[2].shapes.map(s => s.shape).join(" ") === "G C D Em" && cp[3].fret === 5 && cp[3].shapes.map(s => s.shape).join(" ") === "G D7 Em7 C" && cp[3].open === 1 && cp[0].fret <= 7,
    `E5 capo: G C D Em needs none (fret ${cp[1].fret}); Bb Eb F Gm: fret ${cp[2].fret} (${cp[2].shapes.map(s => s.shape).join(" ")}); C G7 Am7 F: fret ${cp[3].fret} (${cp[3].shapes.map(s => s.shape).join(" ")})`);
  ok(e5.empty.fret === 0 && e5.empty.open === 0 && e5.empty.shapes.length === 0, "E5 capo with no chords: fret 0");

  ok(errs.length === 0 && (!old || old.errs.length === 0), "no page errors " + errs.concat(old ? old.errs : []).join(" | "));
  await c.close(); if (old) await old.c.close(); await b.close(); srv.close(); srv2.close(); srv3.close();
  console.log(fails ? fails + " failed" : "all passed");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e && e.stack || e)); process.exit(1); });
