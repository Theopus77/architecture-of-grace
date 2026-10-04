/* The turntables' loops and pads.
   LOOPS: a loop is exactly N beats and starts on a beat; a 1-bar loop over a steady groove sounds exactly like the
   record playing on (the seam is not there to hear); on a record whose beats all differ, the seam is crossfaded so
   it never steps harder than the music itself (a hard cut would click).
   PADS (hot cues): pressed between beats, a pad fires on the next beat line, to the sample; the kicks before and
   after the jump stay exactly one beat apart; with SLIP on, a held pad plays its chop and lets go back in time. */
const { ok, done, open, load } = require("./lib.js");
const srv = require("../srv.js")(9931);
/* the deck's own output (the needle, before the mixer), recorded on the audio thread */
const DECKTAPE = `window.deckTape = async (id, ms) => {
  const d = decks.find(x => x.id === id), chunks = [];
  const n = new AudioWorkletNode(actx, "aog-tape", { numberOfInputs:1, numberOfOutputs:1, outputChannelCount:[2] });
  n.port.onmessage = e => { if (e.data && e.data.t === "chunk") chunks.push(e.data.L); };
  const sink = actx.createGain(); sink.gain.value = 0; d.node.connect(n); n.connect(sink); sink.connect(actx.destination);
  n.port.postMessage({ t:"arm", on:true }); await new Promise(r => setTimeout(r, ms)); n.port.postMessage({ t:"arm", on:false });
  await new Promise(r => setTimeout(r, 250)); d.node.disconnect(n); n.disconnect();
  let len = 0; chunks.forEach(c => len += c.length); const out = new Float32Array(len); let o = 0; chunks.forEach(c => { out.set(c, o); o += c.length; });
  return out;
};`;
(async () => {
  const { b, p, errs } = await open(9931);
  await p.evaluate(DECKTAPE);
  await load(p, { A: "house" });
  await p.evaluate(() => { document.getElementById("noiseBtn").click(); });         /* vinyl noise off: every run the same */
  const g = await p.evaluate(() => { const d = decks[0]; return { sr: d.buf.sampleRate, csr: actx.sampleRate, beat: beatLen(d), g0: grid0(d) }; });
  const bar = 4 * g.beat;
  /* ── 1 · the loop is exactly N beats, on a beat ── */
  await p.evaluate(b => startDeck(decks[0], 9 * b + 1234.5), bar); await p.waitForTimeout(700);
  const lens = [];
  for (const n of [1, 2, 4, 8]) {
    await p.click(`[data-loop="A"][data-beats="${n}"]`); await p.waitForTimeout(350);
    const L = await p.evaluate(() => ({ a: decks[0].loopA, b: decks[0].loopB, on: decks[0].loopOn, wl: decks[0].wLoopOn }));
    lens.push({ n, beats: (L.b - L.a) / g.beat, onGrid: ((L.a - g.g0) / g.beat) % 1, on: L.on && L.wl });
    await p.click(`[data-loop="A"][data-beats="${n}"]`); await p.waitForTimeout(150);
  }
  ok(lens.every(x => x.on && Math.abs(x.beats - x.n) < 1e-6 && (Math.abs(x.onGrid) < 1e-6 || Math.abs(x.onGrid - 1) < 1e-6)),
    "loops of 1, 2, 4 and 8 beats are exactly that long and start on a beat: " + lens.map(x => `${x.n}→${x.beats.toFixed(6)}`).join(", "));
  await p.click('[data-play="A"]'); await p.waitForTimeout(800);
  /* ── 2 · a 1-bar loop over the steady intro = the record playing on ── */
  const start = 9 * bar;
  await p.evaluate(s => startDeck(decks[0], s), start); await p.waitForTimeout(300);
  const plain = await p.evaluate(() => deckTape("A", 5200).then(a => Array.from(a)));
  await p.click('[data-play="A"]'); await p.waitForTimeout(1200);
  await p.evaluate(s => startDeck(decks[0], s), start); await p.waitForTimeout(300);
  await p.click('[data-loop="A"][data-beats="4"]');
  const looped = await p.evaluate(() => deckTape("A", 5200).then(a => Array.from(a)));
  const wraps = await p.evaluate(() => decks[0].wraps);
  await p.click('[data-loop="A"][data-beats="4"]'); await p.click('[data-play="A"]'); await p.waitForTimeout(800);
  /* line the two up (each tape starts when it is armed; any whole number of bars apart is the same music), then
     compare sample by sample */
  const barOut = Math.round(bar / (g.sr / g.csr)), N = 8000;
  /* the normalised correlation of a window of `plain` against `looped` at a lag */
  const corrAt = (A0, lag, st) => { let s = 0, ex = 0, ey = 0; for (let i = 0; i < N; i += st) { const j = A0 + i + lag; if (j < 0 || j >= looped.length) return -2; const x = plain[A0 + i], y = looped[j]; s += x * y; ex += x * x; ey += y * y; } return s / Math.sqrt(ex * ey + 1e-30); };
  let bestLag = 0, bestC = -2;
  for (const A0 of [Math.round(g.csr * 1.2), Math.round(g.csr * 2.4)]) {
    let cl = 0, cc = -2;
    for (let lag = -barOut; lag <= barOut; lag += 3) { const c = corrAt(A0, lag, 4); if (c > cc) { cc = c; cl = lag; } }   /* coarse … */
    for (let lag = cl - 6; lag <= cl + 6; lag++) { const c = corrAt(A0, lag, 1); if (c > bestC) { bestC = c; bestLag = lag; } }   /* … then to the sample */
  }
  let dmax = 0, pk = 0, cmp = 0;
  for (let i = 4000; i < plain.length - 4000; i++) { const j = i + bestLag; if (j < 0 || j >= looped.length) continue; dmax = Math.max(dmax, Math.abs(plain[i] - looped[j])); pk = Math.max(pk, Math.abs(plain[i])); cmp++; }
  const db = 20 * Math.log10(dmax / pk + 1e-12);
  ok(wraps >= 1 && cmp > g.csr * 2 && db < -60, `a 1-bar loop over the steady intro comes round ${wraps}× and sounds exactly like the record playing on: lined up (correlation ${bestC.toFixed(6)}), the largest difference over ${(cmp / g.csr).toFixed(1)} s is ${db.toFixed(0)} dB below the peak`);
  /* ── 3 · a record whose beats all differ: the seam is crossfaded, never a click ──
     The record is two low tones that never line up with the beat, so every beat is a different waveform and a hard
     cut at the seam would be a step. A step is a click: sound high above anything the record holds. So: how much
     sound above 2 kHz does the looped deck make, next to what a hard cut would make? */
  await p.evaluate(() => {
    const sr = 44100, n = sr * 20, L = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / sr; L[i] = 0.4 * Math.sin(2 * Math.PI * 97.3 * t) + 0.35 * Math.sin(2 * Math.PI * (211 + 2 * t) * t); }
    const buf = actx.createBuffer(2, n, sr); buf.copyToChannel(L, 0); buf.copyToChannel(L, 1);
    putOn(decks[1], buf, Float32Array.from(L), Float32Array.from(L), { name: "test tone", key: "test:" + Date.now(), bpm: 120, beat0: 0, lufs: -14 });
    return ensureNode(decks[1]);
  });
  await p.waitForFunction(() => decks[1].bpm === 120 && decks[1].node, null, { timeout: 20000 });
  await p.evaluate(() => { send(decks[1], { t: "noise", v: 0 }); startDeck(decks[1], 44100 * 3); }); await p.waitForTimeout(400);
  const free = await p.evaluate(() => deckTape("B", 2500).then(a => Array.from(a)));
  await p.click('[data-loop="B"][data-beats="1"]');
  const seam = await p.evaluate(() => deckTape("B", 4000).then(a => Array.from(a)));
  const w2 = await p.evaluate(() => ({ wraps: decks[1].wraps, a: decks[1].loopA, b: decks[1].loopB }));
  /* the same loop cut hard, straight from the record */
  const cut = await p.evaluate(w => { const c = decks[1].buf.getChannelData(0), a = Math.floor(w.a), b = Math.floor(w.b), out = [];
    for (let k = 0; k < 4; k++) for (let i = a; i < b; i++) out.push(c[i]); return out; }, w2);
  const above2k = (a, sr) => {      /* the loudest moment above 2 kHz (four poles of high-pass) */
    const w = Math.tan(Math.PI * 2000 / sr), k = Math.SQRT2, n0 = 1 / (1 + k * w + w * w), b0 = n0, b1 = -2 * n0, b2 = n0, a1 = 2 * (w * w - 1) * n0, a2 = (1 - k * w + w * w) * n0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0, z1 = 0, z2 = 0, u1 = 0, u2 = 0, m = 0;
    for (let i = 0; i < a.length; i++) { const y = b0 * a[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = a[i]; y2 = y1; y1 = y;
      const u = b0 * y + b1 * z1 + b2 * z2 - a1 * u1 - a2 * u2; z2 = z1; z1 = y; u2 = u1; u1 = u; if (i > sr * 0.05) m = Math.max(m, Math.abs(u)); }
    return m; };
  const hFree = above2k(free, g.csr), hSeam = above2k(seam, g.csr), hCut = above2k(cut, g.sr);
  const dbr = x => (20 * Math.log10(x + 1e-9)).toFixed(0) + " dB";
  ok(w2.wraps >= 6 && hCut > 0.05 && hSeam < hCut / 20 && hSeam < 0.003,
    `a 1-beat loop on a record that never repeats wraps ${w2.wraps}× without a click: above 2 kHz the looped deck reaches ${dbr(hSeam)} (the record alone ${dbr(hFree)}); the same loop cut hard would reach ${dbr(hCut)}`);
  await p.click('[data-loop="B"][data-beats="1"]'); await p.click('[data-play="B"]');
  /* ── 4 · pads fire on the beat ── */
  await p.click('[data-slip="A"]');                                                   /* SLIP off: a pad jump stays */
  await p.evaluate(s => startDeck(decks[0], s), 9 * bar); await p.waitForTimeout(600);
  await p.click('[data-chop="A"]');
  const cues = await p.evaluate(() => decks[0].cues.slice());
  ok(cues.every(c => c != null) && cues.every((c, i) => i === 0 || Math.abs((c - cues[i - 1]) - g.beat) < 1e-6) && Math.abs(((cues[0] - g.g0) / bar) % 1) < 1e-6,
    "Chop 8 puts the 8 beats from the bar the needle is in on pads 1 to 8 (one beat apart, pad 1 on a bar line)");
  const taped = p.evaluate(() => deckTape("A", 4000).then(a => Array.from(a)));
  const presses = [];
  for (const [pad, wait] of [[2, 650], [5, 840], [0, 610]]) {
    await p.waitForTimeout(wait);
    const before = await p.evaluate(() => decks[0].jumps);
    await p.click(`[data-hot="A"][data-i="${pad}"]`);
    await p.waitForFunction(j => decks[0].jumps > j && decks[0].lastJump && decks[0].lastJump.q, before, { timeout: 4000 });
    presses.push(await p.evaluate(i => Object.assign({ cue: decks[0].cues[i] }, decks[0].lastJump), pad));
  }
  const kicks = await taped;
  const grid = presses.map(j => { const k = (j.at - g.g0) / g.beat; return { k: k, off: Math.abs(k - Math.round(k)) * g.beat, over: j.over, to: j.to, cue: j.cue }; });
  ok(grid.every(x => x.off < 1e-6 && x.over >= 0 && x.over < 2.5 && Math.abs(x.to - x.cue) < 1e-6),
    "three pads pressed between beats each fire on the next beat line, to the sample: " + grid.map(x => `beat ${x.k.toFixed(6)} (${x.over.toFixed(2)} samples past)`).join(", "));
  /* the kicks before, between and after the jumps stay one beat apart */
  const sr = g.csr, lp = []; let y1 = 0, y2 = 0; const c = 1 - Math.exp(-2 * Math.PI * 120 / sr);
  for (let i = 0; i < kicks.length; i++) { y1 += c * (kicks[i] - y1); y2 += c * (y1 - y2); lp.push(Math.abs(y2)); }
  /* the envelope holds each frame's loudest moment for 12 ms, so the kick's own 50 Hz wiggle never reads as a gap */
  const hop = Math.round(sr * 0.002), fr = []; for (let i = 0; i + hop < lp.length; i += hop) { let m = 0; for (let k = i; k < i + hop; k++) m = Math.max(m, lp[k]); fr.push(m); }
  const env = fr.map((x, i) => Math.max(...fr.slice(Math.max(0, i - 5), i + 1)));
  /* a kick starts where the low end first crosses 55% of its peak (found to the sample); the next one counts once the
     last has fallen below 30% (a kick's tail is still about a fifth of its peak when the next one lands). A kick already
     sounding when the tape starts has no start on the tape, so the first one counts only after a quiet moment */
  const mx = Math.max(...env), on = []; let armed = false;
  for (let i = 1; i < env.length; i++) {
    if (armed && env[i] > mx * 0.55) { for (let k = i * hop; k < (i + 1) * hop; k++) if (lp[k] > mx * 0.55) { on.push(k / sr); break; } armed = false; }
    if (env[i] < mx * 0.3) armed = true;
  }
  const iv = on.slice(1).map((t, i) => t - on[i]), beatSec = 60 / 125;
  const worst = Math.max(...iv.map(x => Math.abs(x - beatSec)));
  ok(on.length >= 7 && worst < 0.003, `the kicks across the three jumps stay one beat apart: ${on.length} kicks, intervals ${iv.map(x => (x * 1000).toFixed(1)).join(" ")} ms (one beat is ${(beatSec * 1000).toFixed(1)} ms; worst ${(worst * 1000).toFixed(2)} ms off)`);
  /* ── 5 · SLIP on: a held pad plays its chop, and letting go drops the record back in time ── */
  await p.click('[data-slip="A"]');
  await p.waitForTimeout(500);
  const t0 = await p.evaluate(() => ({ pos: decks[0].pos, frame: decks[0].frame, rr: decks[0].rr }));
  await p.locator('[data-hot="A"][data-i="6"]').dispatchEvent("pointerdown", { button: 0, pointerId: 7 });
  await p.waitForTimeout(1300);
  const mid = await p.evaluate(() => ({ div: decks[0].div, pos: decks[0].pos, slip: decks[0].slipPos }));
  await p.locator('[data-hot="A"][data-i="6"]').dispatchEvent("pointerup", { button: 0, pointerId: 7 });
  await p.waitForTimeout(1200);
  const t1 = await p.evaluate(() => ({ pos: decks[0].pos, frame: decks[0].frame, div: decks[0].div }));
  const expect = t0.pos + (t1.frame - t0.frame) * t0.rr, offMs = (t1.pos - expect) / g.sr * 1000;
  ok(mid.div && Math.abs(mid.pos - mid.slip) > g.sr * 0.3 && !t1.div && Math.abs(offMs) < 0.5,
    `SLIP on: while pad 7 is held the chop plays and the song runs on underneath (${((mid.slip - mid.pos) / g.sr).toFixed(2)} s apart); let go and the record is back where it would have been (${offMs.toFixed(3)} ms off)`);
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close(); process.exit(done() ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
