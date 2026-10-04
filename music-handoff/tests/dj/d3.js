/* The turntables' mixer: the 3-band isolator EQ (flat when level, a KILL takes its band out, switching is
   click-free), the one-knob filter (low-pass left, high-pass right) on the live channel, and the effects timed
   in beats (echo, reverb, flanger) — measured offline through the real worklet, and live as the pitch moves. */
const { ok, done, open, load } = require("./lib.js");
const srv = require("../srv.js")(9932);
(async () => {
  const { b, p, errs } = await open(9932);
  /* ── 1 · the isolator, offline: tones at 60 Hz, 1 kHz and 8 kHz through the page's own EQ ── */
  const eq = await p.evaluate(async () => {
    const sr = 48000, F = [60, 1000, 8000];
    async function render(setup) {
      const oc = new OfflineAudioContext(1, sr, sr), e = AOGDJ.isolator(oc), res = [];
      const buf = oc.createBuffer(1, sr, sr), d = buf.getChannelData(0);
      for (let i = 0; i < sr; i++) d[i] = F.reduce((s, f) => s + 0.2 * Math.sin(2 * Math.PI * f * i / sr), 0);
      const s = oc.createBufferSource(); s.buffer = buf; s.connect(e.input); e.output.connect(oc.destination); setup(e); s.start();
      const out = (await oc.startRendering()).getChannelData(0);
      for (const f of F) { let re = 0, im = 0; for (let i = sr / 2; i < sr; i++) { re += out[i] * Math.cos(2 * Math.PI * f * i / sr); im += out[i] * Math.sin(2 * Math.PI * f * i / sr); } res.push(20 * Math.log10(Math.hypot(re, im) / (sr / 2) * 2 / 0.2)); }
      return res;
    }
    const r = {};
    r.flat = await render(() => {});
    r.killLow = await render(e => e.kill("low", true));
    r.killMid = await render(e => e.kill("mid", true));
    r.killHigh = await render(e => e.kill("high", true));
    r.lowUp = await render(e => e.set("low", 6));
    r.lowDown = await render(e => e.set("low", -26));
    /* and the three bands add back up flat everywhere, as the curve on screen says */
    const oc = new OfflineAudioContext(1, 128, sr), e = AOGDJ.isolator(oc), fq = new Float32Array(60), m = new Float32Array(60), ph = new Float32Array(60);
    for (let i = 0; i < 60; i++) fq[i] = 25 * Math.pow(18000 / 25, i / 59);
    e.filters[0].getFrequencyResponse(fq, m, ph);
    r.sumDev = Math.max(...Array.from(m).map(x => Math.abs(20 * Math.log10(x))));
    return r;
  });
  const f = a => a.map(x => x.toFixed(1)).join(" / ");
  ok(eq.flat.every(x => Math.abs(x) < 0.3) && eq.sumDev < 0.05, `flat, the three bands add back to the music unchanged: 60 Hz / 1 kHz / 8 kHz at ${f(eq.flat)} dB; anywhere from 25 Hz to 18 kHz within ${eq.sumDev.toFixed(3)} dB`);
  ok(eq.killLow[0] < -40 && Math.abs(eq.killLow[1]) < 0.5 && Math.abs(eq.killLow[2]) < 0.5, `KILL LOW takes the bass out and leaves the rest: ${f(eq.killLow)} dB`);
  ok(eq.killMid[1] < -28 && Math.abs(eq.killMid[0]) < 0.5 && Math.abs(eq.killMid[2]) < 0.5, `KILL MID: ${f(eq.killMid)} dB`);
  ok(eq.killHigh[2] < -30 && Math.abs(eq.killHigh[0]) < 0.5 && Math.abs(eq.killHigh[1]) < 0.5, `KILL HIGH: ${f(eq.killHigh)} dB`);
  ok(Math.abs(eq.lowUp[0] - 6) < 0.5 && Math.abs(eq.lowDown[0] + 26) < 1.5 && Math.abs(eq.lowUp[2]) < 0.5, `the LOW knob reaches +6 dB and -26 dB (${eq.lowUp[0].toFixed(1)}, ${eq.lowDown[0].toFixed(1)}) without touching the top`);
  /* ── 2 · a kill switched mid-note: no click (a hard switch would make one) ── */
  const clk = await p.evaluate(async () => {
    const sr = 48000;
    async function run() {
      const oc = new OfflineAudioContext(1, sr, sr), e = AOGDJ.isolator(oc), o = oc.createOscillator(); o.frequency.value = 70;
      const g = oc.createGain(); g.gain.value = 0.5; o.connect(g); g.connect(e.input);
      /* listen above 2 kHz, where a 70 Hz tone has nothing: anything there is the switch */
      const h1 = oc.createBiquadFilter(), h2 = oc.createBiquadFilter(); h1.type = h2.type = "highpass"; h1.frequency.value = h2.frequency.value = 2000;
      e.output.connect(h1); h1.connect(h2); h2.connect(oc.destination); o.start();
      oc.suspend(0.5).then(() => { e.kill("low", true); oc.resume(); });
      const out = (await oc.startRendering()).getChannelData(0);
      let m = 0; for (let i = Math.round(0.45 * sr); i < Math.round(0.6 * sr); i++) m = Math.max(m, Math.abs(out[i]));
      return m;
    }
    /* the hard switch: the same tone cut dead at 0.5 s */
    async function cutDead() {
      const oc = new OfflineAudioContext(1, sr, sr), o = oc.createOscillator(); o.frequency.value = 70;
      const g = oc.createGain(); g.gain.setValueAtTime(0.5, 0); g.gain.setValueAtTime(0, 0.5003);
      const h1 = oc.createBiquadFilter(), h2 = oc.createBiquadFilter(); h1.type = h2.type = "highpass"; h1.frequency.value = h2.frequency.value = 2000;
      o.connect(g); g.connect(h1); h1.connect(h2); h2.connect(oc.destination); o.start();
      const out = (await oc.startRendering()).getChannelData(0);
      let m = 0; for (let i = Math.round(0.45 * sr); i < Math.round(0.6 * sr); i++) m = Math.max(m, Math.abs(out[i]));
      return m;
    }
    return { kill: await run(), dead: await cutDead() };
  });
  const dbs = x => (20 * Math.log10(x + 1e-9)).toFixed(0) + " dB";
  ok(clk.kill < clk.dead / 30 && clk.kill < 0.002, `KILL LOW pressed in the middle of a bass note leaves nothing above 2 kHz (${dbs(clk.kill)}); cutting the note dead would click at ${dbs(clk.dead)}`);
  /* ── 3 · the live channel: the filter and the kills on a record that is playing ── */
  await load(p, { A: "house" });
  await p.evaluate(() => { startDeck(decks[0], 26 * 4 * beatLen(decks[0])); });
  await p.evaluate(() => { const d = decks[0]; window.__an = actx.createAnalyser(); __an.fftSize = 8192; __an.smoothingTimeConstant = 0; d.hp.connect(__an); });
  const bands = () => p.evaluate(async () => {
    const a = window.__an, n = a.frequencyBinCount, sr = actx.sampleRate, buf = new Float32Array(n), lo = [], hi = [];
    for (let k = 0; k < 24; k++) { await new Promise(r => setTimeout(r, 80)); a.getFloatFrequencyData(buf);
      let l = 0, h = 0; for (let i = 1; i < n; i++) { const fq = i * sr / a.fftSize, p = Math.pow(10, buf[i] / 10); if (fq >= 40 && fq < 110) l += p; if (fq >= 6000 && fq < 12000) h += p; } lo.push(l); hi.push(h); }
    const m = x => 10 * Math.log10(x.reduce((s, v) => s + v, 0) / x.length + 1e-30);
    return { lo: m(lo), hi: m(hi) };
  });
  const setF = v => p.evaluate(v => { const i = document.querySelector('[data-filter="A"]'); i.value = String(v); i.dispatchEvent(new Event("input")); }, v);
  await p.waitForTimeout(600);
  const base = await bands();
  await setF(-0.8); await p.waitForTimeout(400); const lp = await bands();
  await setF(0.8); await p.waitForTimeout(400); const hp = await bands();
  await setF(0); await p.waitForTimeout(400);
  const ro = await p.evaluate(() => document.querySelector('[data-fout="A"]').textContent);
  ok(lp.hi - base.hi < -25 && Math.abs(lp.lo - base.lo) < 4, `FILTER to the left (low-pass) on the playing record: the top drops ${(lp.hi - base.hi).toFixed(0)} dB, the bass moves ${(lp.lo - base.lo).toFixed(1)} dB`);
  ok(hp.lo - base.lo < -25 && Math.abs(hp.hi - base.hi) < 4, `FILTER to the right (high-pass): the bass drops ${(hp.lo - base.lo).toFixed(0)} dB, the top moves ${(hp.hi - base.hi).toFixed(1)} dB; back in the middle it reads "${ro}"`);
  await p.click('[data-kill="A"][data-band="low"]'); await p.waitForTimeout(300); const kl = await bands();
  const kp = await p.evaluate(() => ({ pressed: document.querySelector('[data-kill="A"][data-band="low"]').getAttribute("aria-pressed"), killed: decks[0].eq.killed("low") }));
  await p.click('[data-kill="A"][data-band="high"]'); await p.waitForTimeout(300); const kh = await bands();
  await p.click('[data-flat="A"]'); await p.waitForTimeout(400); const fl = await bands();
  ok(kp.killed && kp.pressed === "true" && kl.lo - base.lo < -30 && Math.abs(kl.hi - base.hi) < 3, `KILL LOW on the live channel: the bass drops ${(kl.lo - base.lo).toFixed(0)} dB, the top stays (${(kl.hi - base.hi).toFixed(1)} dB)`);
  ok(kh.hi - base.hi < -25 && Math.abs(fl.lo - base.lo) < 2 && Math.abs(fl.hi - base.hi) < 2, `KILL HIGH too: the top drops ${(kh.hi - base.hi).toFixed(0)} dB; FLAT puts both back (${(fl.lo - base.lo).toFixed(1)} / ${(fl.hi - base.hi).toFixed(1)} dB)`);
  /* ── 4 · effects in beats: offline, through the real worklet ── */
  const fx = await p.evaluate(async () => {
    const sr = 48000, out = [];
    for (const [bpm, beats] of [[125, 0.75], [90, 0.5], [135, 1], [120, 0.25]]) {
      const oc = new OfflineAudioContext(2, sr * 3, sr);
      await oc.audioWorklet.addModule(new URL("aog-vinyl-worklet.js", document.baseURI).href);
      const n = new AudioWorkletNode(oc, "aog-djfx", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
      const buf = oc.createBuffer(1, sr * 3, sr); buf.getChannelData(0)[Math.round(0.5 * sr)] = 1;
      const s = oc.createBufferSource(); s.buffer = buf; s.connect(n); n.connect(oc.destination); s.start();
      n.port.postMessage({ t: "fx", type: "echo", amt: 1, beatSec: 60 / bpm, beats: { echo: beats } });
      oc.suspend(0.25).then(() => new Promise(r => setTimeout(r, 60))).then(() => oc.resume());
      const o = (await oc.startRendering()).getChannelData(0);
      const peaks = []; let i0 = Math.round(0.5 * sr) + 40;
      for (let k = 0; k < 2; k++) { let pk = 0, at = 0; const win = Math.round(beats * 60 / bpm * sr * 1.5); for (let i = i0; i < Math.min(o.length, i0 + win); i++) if (Math.abs(o[i]) > pk) { pk = Math.abs(o[i]); at = i; } peaks.push(at); i0 = at + 40; }
      out.push({ bpm, beats, want: beats * 60 / bpm * 1000, first: (peaks[0] - 0.5 * sr) / sr * 1000, second: (peaks[1] - peaks[0]) / sr * 1000 });
    }
    /* the reverb's tail: how long it takes to fall 60 dB (Schroeder's backward sum), at 2 and 4 beats of 125 BPM */
    const rt = [];
    for (const beats of [2, 4]) {
      const oc = new OfflineAudioContext(2, sr * 6, sr);
      await oc.audioWorklet.addModule(new URL("aog-vinyl-worklet.js", document.baseURI).href);
      const n = new AudioWorkletNode(oc, "aog-djfx", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
      const buf = oc.createBuffer(1, sr * 6, sr); for (let i = 0; i < 960; i++) buf.getChannelData(0)[Math.round(0.5 * sr) + i] = Math.sin(2 * Math.PI * 600 * i / sr) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / 960));
      const s = oc.createBufferSource(); s.buffer = buf; s.connect(n); n.connect(oc.destination); s.start();
      n.port.postMessage({ t: "fx", type: "reverb", amt: 1, beatSec: 60 / 125, beats: { reverb: beats } });
      oc.suspend(0.25).then(() => new Promise(r => setTimeout(r, 60))).then(() => oc.resume());
      const o = (await oc.startRendering()).getChannelData(0);
      const st = Math.round(0.52 * sr); let E = 0; const sch = new Float64Array(o.length);
      for (let i = o.length - 1; i >= st; i--) { E += o[i] * o[i]; sch[i] = E; }
      const db = i => 10 * Math.log10(sch[i] / sch[st]);
      let t5 = 0, t25 = 0; for (let i = st; i < o.length; i++) { if (!t5 && db(i) < -5) t5 = i; if (!t25 && db(i) < -25) { t25 = i; break; } }
      rt.push({ beats, want: beats * 60 / 125, rt60: (t25 - t5) / sr * 3 });
    }
    return { echo: out, rt };
  });
  ok(fx.echo.every(e => Math.abs(e.first - e.want) < 0.5 && Math.abs(e.second - e.want) < 0.5),
    "ECHO repeats in beats of the record's tempo: " + fx.echo.map(e => `${e.beats} beat at ${e.bpm} BPM → ${e.first.toFixed(2)} ms, then ${e.second.toFixed(2)} ms (wanted ${e.want.toFixed(2)})`).join(" · "));
  ok(fx.rt.every(r => Math.abs(r.rt60 / r.want - 1) < 0.25), "REVERB rings for its beats: " + fx.rt.map(r => `${r.beats} beats → falls 60 dB in ${r.rt60.toFixed(2)} s (${r.want.toFixed(2)} s wanted)`).join(" · "));
  /* ── 5 · live: the effect follows the record's tempo as the pitch moves ── */
  const ask = () => p.evaluate(() => new Promise(r => { const n = decks[0].fx; n.port.onmessage = e => { if (e.data && e.data.t === "fxst") r(e.data); }; n.port.postMessage({ t: "ask" }); }));
  await p.click('[data-fxtype="A"][data-v="echo"]');
  await p.evaluate(() => { const i = document.querySelector('[data-fxamt="A"]'); i.value = "0.6"; i.dispatchEvent(new Event("input")); });
  await p.waitForTimeout(300);
  const s1 = await ask();
  await p.evaluate(() => { const i = document.querySelector('[data-speed="A"]'); i.value = "1.04"; i.dispatchEvent(new Event("input")); });
  await p.waitForTimeout(300);
  const s2 = await ask();
  const sr = s1.sr, w1 = 0.75 * 60 / 125 * sr, w2 = 0.75 * 60 / 130 * sr;
  ok(Math.abs(s1.echoDelay - w1) < 1 && Math.abs(s2.echoDelay - w2) < 1, `live on deck A: ¾-beat echo is ${(s1.echoDelay / sr * 1000).toFixed(2)} ms at 125 BPM; pitch +4% (130 BPM) and it becomes ${(s2.echoDelay / sr * 1000).toFixed(2)} ms (${(w2 / sr * 1000).toFixed(2)} wanted)`);
  await p.click('[data-fxtype="A"][data-v="flanger"]');
  await p.evaluate(() => { const s = document.querySelector('[data-fxbeats="A"]'); s.value = "8"; s.dispatchEvent(new Event("change")); });
  await p.waitForTimeout(300);
  const s3 = await ask();
  const opts = await p.evaluate(() => [...document.querySelector('[data-fxbeats="A"]').options].map(o => o.text).join(","));
  ok(s3.type === "flanger" && Math.abs(s3.flangerPeriod - 8 * 60 / 130 * sr) < 1, `FLANGER: one sweep every 8 beats = ${(s3.flangerPeriod / sr).toFixed(3)} s at 130 BPM; its beat menu offers ${opts}`);
  await p.click('[data-fxtype="A"][data-v="reverb"]'); await p.waitForTimeout(300);
  const s4 = await ask();
  ok(s4.type === "reverb" && Math.abs(s4.rt60 - s4.beats.reverb * 60 / 130) < 1e-6, `REVERB at ${s4.beats.reverb} beats rings ${s4.rt60.toFixed(3)} s at 130 BPM`);
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close(); process.exit(done() ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
