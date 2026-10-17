/* AOG-STRUM-CLEAN-V1 (2026-10-17) — Jimmy: "Just playing the guitar, after about 10–15 strums, the music becomes all
   staticky." (iPhone and iPad, in the Studio, the Guitar room.) The limiter at the end of the room's chain let its own
   output past full scale (a DynamicsCompressor's own lift and a 2 ms attack), more often as the strings rang together, and
   the Studio's room sound was added after it: at the Volume's top, or with the room on, the speakers got clipped samples.
   The Guitar inside the Studio, on an iPhone held sideways, by real touches: 30 strums at about 2.5 a second, the chord
   buttons and the strum strip in turn, the chords changing. The room's output is tapped where it leaves for the speakers
   (after the limiter and the Volume, with the room sound if it is added there) and read per strum:
     · no clipped samples (|x| ≥ 0.999), and the peak stays under full scale
     · the high-frequency energy (above 6 kHz) and the floor between strums at strums 25–30 within 3 dB of strums 1–3
     · the voices bounded (a strum stops each string's note: at most 36 sounds at once), the sounds made per strum do not
       grow, and all of them let go once the strings have rung out
     · the Piano, played first and left, is silent (its audio context suspended) while the Guitar plays
     · no page errors
   Four ways: the steel-string acoustic as it starts (Dry, Volume 80); the Volume at 100 with the Hall; a driven amp (metal)
   at 100 in the Studio room; echoes and space (ambient: chorus, a long echo, the hall reverb) at 100 in the Church. Then
   30 strums rendered offline through the room's own chain (makeChain), the Volume at 100 and the Hall, as the live ones.
   node play/strumclean.js. Ports 9392–9395. */
const { pw, serve, PROBE } = require("./steady-all.js");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const N = 30, MAX_LIVE = 36;
/* the tap: every 128 frames of what it hears, sent on in pieces; "flush" sends the rest, then "done" */
const TAP = `class AogTap extends AudioWorkletProcessor{
  constructor(){ super(); this.n=0; this.L=new Float32Array(8192); this.R=new Float32Array(8192); this.f0=-1;
    this.port.onmessage=e=>{ if(e.data==='flush'){ this.send(); this.port.postMessage({done:true}); } }; }
  send(){ if(this.n){ this.port.postMessage({f0:this.f0, L:this.L.slice(0,this.n), R:this.R.slice(0,this.n)}); } this.n=0; this.f0=-1; }
  process(ins){ const x=ins[0], a=x&&x[0], b=x&&(x[1]||x[0]); if(this.f0<0) this.f0=currentFrame;
    for(let j=0;j<128;j++){ this.L[this.n+j]=a?a[j]:0; this.R[this.n+j]=b?b[j]:0; }
    this.n+=128; if(this.n>=8192) this.send(); return true; } }
registerProcessor('aog-strumtap', AogTap);`;
/* each strum's window: peak, clipped samples, the energy above 6 kHz, and the same in the last 120 ms before the next strum */
const ANALYSE = (strums) => {
  const T = window.__tap, sr = T.sr, len = T.chunks.reduce((s, c) => s + c.L.length, 0), f0 = T.chunks.length ? T.chunks[0].f0 : 0;
  const L = new Float32Array(len), R = new Float32Array(len); let o = 0; T.chunks.forEach(c => { L.set(c.L, o); R.set(c.R, o); o += c.L.length; });
  const hp = x => { let src = x; for (let pass = 0; pass < 2; pass++) { const w = 2 * Math.PI * 6000 / sr, cs = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2), a0 = 1 + al;
      const b0 = (1 + cs) / 2 / a0, b1 = -(1 + cs) / a0, b2 = (1 + cs) / 2 / a0, a1 = -2 * cs / a0, a2 = (1 - al) / a0; const y = new Float32Array(src.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let i = 0; i < src.length; i++) { const v = b0 * src[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = src[i]; y2 = y1; y1 = v; y[i] = v; } src = y; } return src; };
  const HL = hp(L), HR = hp(R), at = t => Math.max(0, Math.min(len, Math.round(t * sr - f0))), db = v => v > 0 ? 20 * Math.log10(v) : -200;
  const st = strums.filter(t => at(t) > 0 && at(t) < len);
  const win = st.map((t, k) => { const a = at(t), e = at(st[k + 1] != null ? st[k + 1] : t + 0.4), g = Math.max(a, e - Math.round(0.12 * sr));
    let pk = 0, clip = 0, hs = 0, gh = 0, gs = 0; for (let i = a; i < e; i++) { const x = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (x > pk) pk = x; if (x >= 0.999) clip++; hs += HL[i] * HL[i] + HR[i] * HR[i]; if (i >= g) { gh += HL[i] * HL[i] + HR[i] * HR[i]; gs += L[i] * L[i] + R[i] * R[i]; } }
    return { pk: db(pk), clip, hf: db(Math.sqrt(hs / Math.max(1, 2 * (e - a)))), gapHf: db(Math.sqrt(gh / Math.max(1, 2 * (e - g)))), gap: db(Math.sqrt(gs / Math.max(1, 2 * (e - g)))) }; });
  return { win, secs: len / sr };
};
const mean = (w, k) => w.reduce((s, x) => s + x[k], 0) / Math.max(1, w.length);
async function run(b, port, o) {
  const label = o.label;
  const c = await b.newContext({ ...pw.devices["iPhone 13 landscape"], serviceWorkers: "block" });
  await c.addInitScript(PROBE);
  /* every audio context a page makes, and every node it makes */
  await c.addInitScript(() => { const A = window.AudioContext; if (!A) return; window.__ctxs = []; window.__made = 0;
    const W = function (opt) { const x = new A(opt); window.__ctxs.push(x); return x; }; W.prototype = A.prototype; window.AudioContext = W; if (window.webkitAudioContext) window.webkitAudioContext = W;
    const B = window.BaseAudioContext && BaseAudioContext.prototype;
    if (B) Object.getOwnPropertyNames(B).filter(k => /^create(?!Buffer$|PeriodicWave$)/.test(k)).forEach(k => { const f = B[k]; if (typeof f === "function") B[k] = function () { if (!(this instanceof OfflineAudioContext)) window.__made++; return f.apply(this, arguments); }; });
    ["GainNode", "BiquadFilterNode", "StereoPannerNode", "WaveShaperNode", "AudioBufferSourceNode", "OscillatorNode", "ConstantSourceNode", "DynamicsCompressorNode", "ConvolverNode", "DelayNode"].forEach(k => {
      const C = window[k]; if (!C) return; const P = function (cx, op) { if (!(cx instanceof OfflineAudioContext)) window.__made++; return new C(cx, op); }; P.prototype = C.prototype; window[k] = P; }); });
  await c.addInitScript(k => { try { localStorage.setItem("aog.room.v1", String(k)); } catch (e) {} }, o.room || 0);
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const errs = []; c.on("page", pg => pg.on("pageerror", e => errs.push(e.message)));
  const p = await c.newPage(), cdp = await c.newCDPSession(p);
  const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts });
  const room = async id => { let f = null; for (let i = 0; i < 600 && !f; i++) { f = p.frames().find(x => x.url().indexOf("music-" + id) >= 0 && x.parentFrame() === p.mainFrame()); if (!f) await p.waitForTimeout(100); }
    await f.waitForLoadState("load"); return f; };
  let piano = null;
  if (o.fromPiano) {
    /* the Piano first: a few keys, then the Guitar's door */
    await p.goto(`http://localhost:${port}/the-studio#piano`); piano = await room("piano");
    await piano.waitForFunction(() => typeof ctx === "function" && typeof noteOn === "function", null, { timeout: 60000 });
    await piano.evaluate(() => { ctx(); noteOn("k", 60, 0.8); setTimeout(() => noteOff("k", 60), 400); }); await p.waitForTimeout(1200);
    await p.evaluate(() => document.querySelector('.sh-doors a[data-room="guitar"]').click());   /* (a phone on its side gives the room the whole screen) */
  } else await p.goto(`http://localhost:${port}/the-studio#guitar`);
  const f = await room("guitar");
  if (o.sound) await f.evaluate(id => { const s = document.getElementById("soundSel"); s.value = id; s.onchange(); }, o.sound);
  await f.waitForFunction(() => typeof soundReady === "function" && soundReady(S.sound), null, { timeout: 120000 });
  if (o.vol) await f.evaluate(v => { const el = document.getElementById("vol"); el.value = String(v); el.oninput(); }, o.vol);
  await p.waitForTimeout(800);
  const fr = await (await f.frameElement()).boundingBox();
  const geo = await f.evaluate(() => { const r = document.getElementById("neck").getBoundingClientRect(), k = r.width / NECK.W, sb = neckStrum();
    return { strum: sb ? { x: r.left + (sb.x0 + sb.w / 2) * k, y0: r.top + neckY(5) * k, y1: r.top + neckY(0) * k } : null,
      cs: [...document.querySelectorAll("#pvStrip .cs")].map(e => { const q = e.getBoundingClientRect(); return { x: q.x + q.width / 2, y: q.y + q.height / 2, w: q.width }; }).filter(q => q.w > 0) }; });
  ok(geo.strum && geo.cs.length >= 6, `${label}: the chord buttons (${geo.cs.length}) and the strum strip are there, sideways in the Studio`);
  const tapAt = async (q, id) => { await touch("touchStart", [{ x: fr.x + q.x, y: fr.y + q.y, id }]); await p.waitForTimeout(60); await touch("touchEnd", []); };
  /* what runs before the first note (an amp's slow wobblers) is not a voice; the first tap wakes the sound */
  const base = await f.evaluate("__P.live");
  await tapAt(geo.cs[0], 1); await p.waitForTimeout(2500);
  /* the tap where the sound leaves for the speakers: after the limiter and the Volume, with the room sound if it is added there */
  const where = await f.evaluate(async src => {
    await ac.audioWorklet.addModule(URL.createObjectURL(new Blob([src], { type: "application/javascript" })));
    const n = new AudioWorkletNode(ac, "aog-strumtap", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
    LIVE_CH.master.connect(n); const R = ac.__aogRoomLive, after = !!(R && !R.inside); if (after) R.wet.connect(n);
    const z = ac.createGain(); z.gain.value = 0; n.connect(z); z.connect(ac.destination);
    window.__tap = { node: n, sr: ac.sampleRate, chunks: [], strums: [], end: null, made: [], live: [] };
    n.port.onmessage = e => { if (e.data.done) { if (__tap.end) __tap.end(); } else __tap.chunks.push(e.data); };
    addEventListener("pointerdown", () => { const t = ac.currentTime, S0 = __tap.strums; if (!S0.length || t - S0[S0.length - 1] > 0.06) { S0.push(t); __tap.made.push(window.__made); __tap.live.push(__P.live); } }, true);
    return { after, room: R ? (R.inside ? "inside the chain" : "after the Volume") : "none" };
  }, TAP);
  await p.waitForTimeout(500);
  await f.evaluate(() => { __P.peak = __P.live; });
  /* 30 strums: a chord button, then a swipe down the strip, about 2.5 a second, the chords changing every two */
  const seq = [0, 3, 4, 5, 0, 3, 1, 4], t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const w = t0 + i * 400 + (i % 3) * 15 - Date.now(); if (w > 0) await p.waitForTimeout(w);
    if (i % 2 === 0) await tapAt(geo.cs[seq[(i >> 1) % seq.length] % geo.cs.length], 1);
    else { const s = geo.strum; for (let j = 0; j <= 6; j++) { const y = s.y0 + (s.y1 - s.y0) * (j / 6 * 1.15 - 0.07); await touch(j ? "touchMove" : "touchStart", [{ x: fr.x + s.x, y: fr.y + y, id: 2 }]); await p.waitForTimeout(8); }
      await touch("touchEnd", []); }
  }
  await p.waitForTimeout(1500);
  const st = await f.evaluate(() => new Promise(r => { __tap.end = () => r({ strums: __tap.strums, made: __tap.made, live: __tap.live, peak: __P.peak, all: ALL.length }); __tap.node.port.postMessage("flush"); }));
  const A = await f.evaluate(ANALYSE, st.strums), w = A.win;
  const first = w.slice(0, 3), last = w.slice(Math.max(3, w.length - 6)), mid = w.slice(9, 15);
  const clip = w.reduce((s, x) => s + x.clip, 0), pk = Math.max(...w.map(x => x.pk));
  ok(st.strums.length >= N && w.length >= N - 1, `${label}: ${N} strums landed (${st.strums.length} reached the room, ${w.length} measured over ${A.secs.toFixed(1)} s; the room sound ${where.room})`);
  ok(clip === 0 && pk < -0.2, `${label}: nothing clipped on its way to the speakers (${clip} samples at full scale; the loudest ${pk.toFixed(1)} dBFS; strums 1–3 ${first.reduce((s, x) => s + x.clip, 0)}, 10–15 ${mid.reduce((s, x) => s + x.clip, 0)}, 25–30 ${last.reduce((s, x) => s + x.clip, 0)})`);
  const dHf = mean(last, "hf") - mean(first, "hf"), dGap = mean(last, "gapHf") - mean(first, "gapHf");
  ok(Math.abs(dHf) <= 3 && dGap <= 3, `${label}: no static building up: above 6 kHz ${mean(first, "hf").toFixed(1)} → ${mean(last, "hf").toFixed(1)} dB, between strums ${mean(first, "gapHf").toFixed(1)} → ${mean(last, "gapHf").toFixed(1)} dB (within 3 dB)`);
  /* the sounds made for strums 2–4 against strums 26–29: a strum makes the same number each time */
  const per = (a, z) => (st.made[z] - st.made[a]) / (z - a), early = per(1, 4), late = per(st.made.length - 5, st.made.length - 1);
  const peak = st.peak - base;
  ok(peak <= MAX_LIVE && late <= early * 1.5 + 4, `${label}: the voices stay bounded (at most ${peak} sounds at once, ${MAX_LIVE} allowed; ${st.all} voices kept) and each strum makes as much as the first ones (${early.toFixed(0)} nodes a strum at first, ${late.toFixed(0)} at the end)`);
  await p.waitForTimeout(8000);
  const after = (await f.evaluate("__P.live")) - base;
  ok(after <= 2, `${label}: every sound lets go once the strings have rung out (${after} still alive 8 s after the last strum)`);
  if (piano) {
    const ps = await piano.evaluate(() => (window.__ctxs || []).map(x => x.state));
    ok(ps.length > 0 && ps.every(s => s !== "running"), `${label}: the Piano, left for the Guitar, is silent while the Guitar plays (${ps.join(", ") || "no context"})`);
  }
  ok(errs.length === 0, `${label}: no page errors ${errs.slice(0, 3).join(" | ")}`);
  const res = { f, p, c }; if (!o.keep) await c.close(); return res;
}
/* the same 30 strums rendered offline through the room's own chain (makeChain), the room sound where the live one is */
const offlineRun = f => f.evaluate(async N_ => {
    const sr = 44100, oc = new OfflineAudioContext(2, Math.ceil(sr * (N_ * 0.4 + 2)), sr);
    await AOGAmp.load(oc); const ch = makeChain(oc); await addCrunch(ch); setSound(ch, S.sound); ch.trim.gain.value = recTrim(S.sound);
    ch.master.gain.value = volGain(1);
    AOGRecorder.notes.space(oc, ch.post, ch.pre, 3);   /* the Hall, before the limiter, as live */
    const pads = allPads(), seq = [0, 0, 3, 3, 4, 4, 5, 5, 0, 0, 3, 3, 1, 1, 4, 4], prev = [], starts = [];
    for (let k = 0; k < N_; k++) { const t = 0.3 + k * 0.4, shp = shapeFor(pads[seq[k % seq.length] % pads.length]); starts.push(t); let j = 0;
      shp.forEach((fr, s) => { if (prev[s]) prev[s].stop(t + j * 0.016, SOUNDS[S.sound].damp); prev[s] = null; if (fr < 0) return; prev[s] = makeVoice(oc, ch, S.sound, TUNING[s] + fr, 0.74 * (1 - 0.03 * j), t + j * 0.016, s); j++; }); }
    const buf = await oc.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1);
    const win = (a, z) => { let pk = 0, cl = 0; const e = Math.round((z < N_ ? starts[z] : starts[N_ - 1] + 0.4) * sr);
      for (let i = Math.round(starts[a] * sr); i < e; i++) { const x = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (x > pk) pk = x; if (x >= 0.999) cl++; }
      return { pk: 20 * Math.log10(pk || 1e-9), cl }; };
    return { all: win(0, N_), a: win(0, 3), b: win(9, 15), c: win(24, N_) };
  }, N);
(async () => {
  const srv = serve(9392), b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const ways = [
    { label: "steel acoustic as it starts (Dry, Volume 80), after the Piano", fromPiano: true },
    { label: "steel acoustic, Volume 100, the Hall", vol: 100, room: 3 },
    { label: "metal (a driven amp), Volume 100, the Studio room", sound: "metal", vol: 100, room: 2 },
    { label: "ambient (chorus, echo, hall reverb), Volume 100, the Church", sound: "ambient", vol: 100, room: 4, keep: true }
  ];
  let last = null;
  for (const o of ways) { try { last = await run(b, 9392, o); } catch (e) { ok(false, o.label + ": " + e.message.split("\n")[0]); } }
  if (last) {
    try {
      await last.f.evaluate(id => { const s = document.getElementById("soundSel"); s.value = id; s.onchange(); }, "steel");
      await last.f.waitForFunction(() => soundReady(S.sound), null, { timeout: 60000 });
      const r = await offlineRun(last.f);
      ok(r.all.cl === 0 && r.all.pk < -0.2, `offline, 30 strums through makeChain (steel, Volume 100, the Hall): nothing clipped (${r.all.cl} samples at full scale; the loudest ${r.all.pk.toFixed(1)} dBFS; strums 1–3 ${r.a.pk.toFixed(1)}, 10–15 ${r.b.pk.toFixed(1)}, 25–30 ${r.c.pk.toFixed(1)} dBFS)`);
    } catch (e) { ok(false, "offline: " + e.message.split("\n")[0]); }
    await last.c.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
