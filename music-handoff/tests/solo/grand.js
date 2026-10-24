/* AOG-GRAND-PRO-V1 (2026-10-23) — Jimmy wants the Studio pro-grade everywhere. The Piano's grand (music-piano.html,
   audio/piano/grand3/, music-handoff/tools/piano_grand_pro.py), rendered offline through the room's own chain (makeChain:
   its room, glue, limiter and ceiling, the default volume) and measured:
   1 · decays: a held C4 still sounds at −60 dB or above (under its loudest 50 ms) at 8 s, C2 at 12 s, C6 at 4 s, with the
       key held and with the key let go on the pedal; let go without the pedal, it stops within 3 s (the dampers work)
       (today's grand: C4 −67 dB at 5 s and silent from 6 s, C2 silent from 7 s, C6 from 3 s)
   2 · strength: C2, C4 and C6 at every strength 0.02 … 1, the instrument itself (before the room's compressor and
       limiter, as the level tests measure a sound): louder as it is played harder (never more than 0.3 dB softer), no
       step over 1.5 dB from one strength to the next (today's: jumps of 5.3 dB at 0.42 and 6.1 dB at 0.78), and the
       hardest clearly louder than today's hardest (2 dB or more; as heard, through the compressor and the limiter, louder
       still, though they hold it close); the C chord a pad plays (C4 E4 G4 at 0.74 and
       C3 at 0.63, before the compressor, as the level tests measure it) where it was (−8.66 dB, within 0.5 dB); with only
       the middle strength in (the first moments), every strength within 1 dB of the full set
   3 · release: a key let go without the pedal makes the damper's sound (between 55 and 20 dB under the note); with the
       pedal down, none; the live keys do this (noteOff)
   4 · pedal: the free strings ring along with a chord on the pedal, softly (between 32 and 12 dB under it), and not
       without the pedal; a MIDI pedal halfway down (CC64 64) lets a note die slower than none and faster than all the way
   5 · no clicks: held notes through their loop and their long decay (C2, C4, C6, soft and hard) and a phrase of notes
       let go, every 1 ms of the sound's change against the 200 ms around it
   6 · light: the first download is the middle strength only (no more than today's 2.41 MB), the piano plays once it is
       in, nothing more comes before someone plays; once they have, and the keys are still, the rest comes (sizes shown);
       on a phone five strengths (not b), one microphone; on an iPad six, both
   7 · tap-to-sound with every strength in (play/steady-all.js's measure: the Studio, an iPhone held sideways, four times
       slower, 120 notes at two strengths, so many notes blend two recordings): within 25 ms, voices bounded, nothing
       fetched or unpacked mid-play
   8 · an iPhone and an iPad, in the Studio: the piano plays a real tap, a tap low on a key reaches the loudest strengths,
       no page errors.
   Port 9458 (9459 for 7). GRAND_QUICK=1 skips 7. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), PORT = 9458, srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const METER = fs.readFileSync(path.join(__dirname, "../../tools/levels/meter.inc.js"), "utf8");
const KW = fs.readFileSync(path.join(__dirname, "../bandt/measure.inc"), "utf8").replace(/^const MEASURE=`/, "").replace(/`;\s*$/, "");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; return c; };
/* today's grand (origin/main before AOG-GRAND-PRO-V1), measured the same way */
/* (pre: the instrument, before the room's compressor and limiter; post: through them, as heard) */
const OLD = { pre: { 60: -6.1, 36: -5.31, 84: -4.94 }, post: { 60: -9.43, 36: -9.72, 84: -9.61 }, jump: 6.1, chord: -8.66, firstMB: 2.41 };

async function desk(b) {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block" }), p = await c.newPage(), errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto(`http://localhost:${PORT}/music-piano.html`); await p.waitForTimeout(800);
  await p.addScriptTag({ content: METER }); await p.addScriptTag({ content: KW });
  return { c, p, errs };
}
/* in the page: the helpers every check below uses */
const HELP = () => {
  window.__G = {
    chain(sec, pre) { const oc = new OfflineAudioContext(2, Math.round(44100 * sec), 44100), ch = makeChain(oc); ch.master.gain.value = volGain(0.8); setSendLevel(ch, "grand"); setEra(ch, 0, 0); S.sound = "grand";
      if (pre) { ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); } return { oc, ch }; },
    env(buf, t, w) { const sr = buf.sampleRate, n = Math.floor((w || 0.05) * sr), i = Math.floor(t * sr); let s = 0, k = 0; for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let j = i; j < i + n && j < d.length; j++) { s += d[j] * d[j]; k++; } } return 10 * Math.log10(s / Math.max(1, k) + 1e-20); },
    peak(buf) { let best = -999; for (let t = 0; t < 1.5; t += 0.025) best = Math.max(best, __G.env(buf, t)); return best; },
    rms(L, a, z, sr) { let s = 0; const i0 = Math.floor(a * sr), i1 = Math.floor(z * sr); for (let i = i0; i < i1; i++) s += L[i] * L[i]; return 10 * Math.log10(s / Math.max(1, i1 - i0) + 1e-20); },
    /* the sound's change, 1 ms at a time, against the 200 ms around it: a click is a jump the music does not make */
    clicks(buf, skip) { const sr = buf.sampleRate, n = Math.floor(0.001 * sr), out = [];
      for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c), F = Math.floor(d.length / n), e = new Float64Array(F);
        for (let f = 0; f < F; f++) { let s = 0; for (let j = f * n + 1; j < (f + 1) * n; j++) { const x = d[j] - d[j - 1]; s += x * x; } e[f] = s / n; }
        for (let f = 100; f < F - 100; f++) { const t = f / 1000; if (skip.some(([a, z]) => t >= a && t < z)) continue;
          const win = Array.from(e.subarray(f - 100, f + 100)).sort((a, b) => a - b), med = win[100];
          if (e[f] > 64 * med && e[f] > 1e-9) out.push(+t.toFixed(3)); } }
      return out; },
    async full() { HANDS.rush = 1; const set = SETS.grand; await loadSet("grand"); const t0 = Date.now(); while (set.done < set.total && Date.now() - t0 < 180000) await new Promise(r => setTimeout(r, 50)); HANDS.rush = 0; return { done: set.done, total: set.total }; }
  };
};

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  /* ── 6 · light: what a computer downloads first ── */
  {
    const c = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block" }), p = await c.newPage(), got = [];
    await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    p.on("request", r => { const u = r.url(); if (/\/audio\/piano\/grand3\//.test(u)) got.push(decodeURIComponent(u.split("/grand3/")[1])); });
    const size = f => fs.statSync(path.join(ROOT, "audio/piano/grand3", f)).size;
    await p.goto(`http://localhost:${PORT}/music-piano.html`);
    await p.waitForFunction(() => SETS.grand.ready, null, { timeout: 120000 });
    await p.waitForTimeout(4500);
    const first = got.slice(), firstMB = first.reduce((s, f) => s + size(f), 0) / 1e6, line = await p.evaluate(() => document.getElementById("loadLine").textContent);
    const all = fs.readdirSync(path.join(ROOT, "audio/piano/grand3")), allMB = all.reduce((s, f) => s + size(f), 0) / 1e6;
    ok(first.length === 30 && first.every(f => /^\d+c\.mp3$/.test(f)) && firstMB <= OLD.firstMB && /^Ready\./.test(line),
      `light: the first download is the middle strength of the 30 notes only (${first.length} files, ${firstMB.toFixed(2)} MB; today's ${OLD.firstMB} MB), and it plays ("${line}"); nothing more until someone plays (in all ${all.length} files, ${allMB.toFixed(2)} MB)`);
    const t0 = await p.evaluate(() => { noteOn("k", 60, 0.7); setTimeout(() => noteOff("k", 60), 200); return Date.now(); });
    await p.waitForFunction(() => SETS.grand.done >= SETS.grand.total, null, { timeout: 180000 });
    const st = await p.evaluate(() => ({ lays: proLays(SETS.grand).join(""), ch: SETS.grand.buf["60f"] && SETS.grand.buf["60f"].numberOfChannels, rel: Object.keys(SETS.grand.rel).length }));
    const restMB = got.slice(first.length).reduce((s, f) => s + size(f), 0) / 1e6;
    ok(got.length === all.length && st.lays === "abcdef" && st.ch === 2 && st.rel === 34,
      `light: once played, and the keys still, the rest comes: ${got.length - first.length} files, ${restMB.toFixed(2)} MB (six strengths ${st.lays}, both microphones, ${st.rel} release and pedal sounds) in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    await c.close();
  }

  const { c, p, errs } = await desk(b);
  await p.evaluate(HELP);
  const L = await p.evaluate(() => __G.full());
  ok(L.done === L.total, `every recording in (${L.done} of ${L.total})`);

  /* ── 1 · decays ── */
  const dec = await p.evaluate(async () => {
    const out = [];
    for (const [m, at, T] of [[60, 8, 10], [36, 12, 14], [84, 4, 6]]) for (const how of ["held", "pedal", "off"]) {
      const { oc, ch } = __G.chain(T); const vc = makeVoice(oc, ch, "grand", m, 0.7, 0.05);
      if (how === "pedal") symPedal(ch, 1, 0);          /* the key let go at 0.5 s on the pedal: it rings on as if held */
      if (how === "off") vc.stop(1.0, vc.tau, { rel: true });
      const buf = await oc.startRendering(), pk = __G.peak(buf);
      out.push({ m, at, how, lv: +(__G.env(buf, how === "off" ? 4.0 : at) - pk).toFixed(1), curve: [1, 2, 4, 6, 8, 10, 12].filter(t => t < T).map(t => +(__G.env(buf, t) - pk).toFixed(1)) });
    }
    return out; });
  const NAME = { 60: "C4", 36: "C2", 84: "C6" };
  dec.forEach(d => {
    if (d.how === "off") ok(d.lv < -60, `decay: ${NAME[d.m]} let go at 1 s without the pedal is gone 3 s later (${d.lv} dB at 4 s)`);
    else ok(d.lv >= -60, `decay: ${NAME[d.m]} ${d.how === "held" ? "held" : "let go on the pedal"} still sounds at ${d.at} s: ${d.lv} dB under its peak (at 1, 2, 4, 6, 8 … s: ${d.curve.join(", ")})`);
  });

  /* ── 2 · strength ── */
  const curve = await p.evaluate(async () => {
    const out = {};
    for (const m of [60, 36, 84]) for (const pre of [1, 0]) { const row = [];
      for (let i = 1; i <= 50; i++) { const v = i / 50, { oc, ch } = __G.chain(0.6, pre); makeVoice(oc, ch, "grand", m, v, 0.05); row.push(+__lv.kw(await oc.startRendering(), 0.05, 0.4).lufs.toFixed(2)); }
      out[(pre ? "pre" : "post") + m] = row; }
    /* the C chord, as the levels tests play it (before the compressor) */
    const { oc, ch } = __G.chain(2.5); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
    [60, 64, 67, 48].forEach((m, j) => { const vc = makeVoice(oc, ch, "grand", m, 0.74 * (j === 3 ? 0.85 : 1), 0.05); if (vc) vc.stop(2.05, vc.tau); });
    out.chord = +__kw(await oc.startRendering()).toFixed(2);
    /* only the middle strength in: as loud at every strength */
    const set = SETS.grand, keep = {}; Object.keys(set.buf).forEach(k => { if (!/c$/.test(k)) { keep[k] = set.buf[k]; delete set.buf[k]; } });
    const mid = []; for (const v of [0.2, 0.45, 0.6, 0.74, 0.85, 0.95, 1]) { const { oc, ch } = __G.chain(0.6, 1); makeVoice(oc, ch, "grand", 60, v, 0.05); mid.push([v, +__lv.kw(await oc.startRendering(), 0.05, 0.4).lufs.toFixed(2)]); }
    Object.assign(set.buf, keep); out.mid = mid;
    return out; });
  for (const m of [60, 36, 84]) {
    const r = curve["pre" + m], q = curve["post" + m], steps = r.slice(1).map((y, i) => y - r[i]), big = Math.max(...steps.map(Math.abs)), drop = Math.min(...steps);
    const ff = r[r.length - 1], qs = q.slice(1).map((y, i) => y - q[i]);
    ok(big <= 1.5 && drop >= -0.3, `strength: ${NAME[m]} louder as it is played harder, the biggest step ${big.toFixed(2)} dB (today's ${OLD.jump}), never softer by more than ${Math.max(0, -drop).toFixed(2)} dB (softest ${r[0]}, 0.5 ${r[24]}, 0.74 ${r[36]}, hardest ${ff} LUFS, before the compressor); as heard, the biggest step ${Math.max(...qs.map(Math.abs)).toFixed(2)} dB`);
    ok(ff - OLD.pre[m] >= 2 && q[49] - OLD.post[m] > 0, `strength: ${NAME[m]} at its hardest ${ff} LUFS, ${(ff - OLD.pre[m]).toFixed(1)} dB over today's hardest (${OLD.pre[m]}); as heard, through the room's compressor and limiter, ${q[49]} (${(q[49] - OLD.post[m]).toFixed(1)} dB over today's ${OLD.post[m]})`);
  }
  ok(Math.abs(curve.chord - OLD.chord) <= 0.5, `strength: the C chord a pad plays is where it was: ${curve.chord} dB (today's ${OLD.chord})`);
  const mdev = curve.mid.map(([v, y]) => [v, y - curve.pre60[Math.round(v * 50) - 1]]);
  ok(mdev.every(([v, d]) => Math.abs(d) <= 1), `strength: with only the middle strength in, every strength within 1 dB of the full set (${mdev.map(([v, d]) => v + ": " + (d >= 0 ? "+" : "") + d.toFixed(2)).join(", ")})`);

  /* ── 3 · release ── */
  const rel = await p.evaluate(async () => {
    const two = async o => { const { oc, ch } = __G.chain(2.5); const vc = makeVoice(oc, ch, "grand", 60, 0.7, 0.05); vc.stop(1.0, vc.tau, o); return oc.startRendering(); };
    const a = await two({ rel: true }), b = await two(undefined), sr = a.sampleRate, d = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) d[i] = a.getChannelData(0)[i] - b.getChannelData(0)[i];
    const note = __G.peak(b), noise = __G.rms(d, 1.0, 1.4, sr);
    /* the live keys: let go without the pedal, the damper's sound; with it, none */
    const calls = []; const r0 = window.relNoise; window.relNoise = function () { calls.push(1); return r0.apply(this, arguments); };
    ctx(); setSus(false); noteOn("k", 60, 0.7); noteOff("k", 60); const without = calls.length;
    setSus(true); noteOn("k", 62, 0.7); noteOff("k", 62); const withPed = calls.length - without; setSus(false);
    window.relNoise = r0;
    return { db: +(noise - note).toFixed(1), without, withPed }; });
  ok(rel.db <= -20 && rel.db >= -55, `release: a key let go without the pedal makes the damper's sound, ${rel.db} dB under the note`);
  ok(rel.without === 1 && rel.withPed === 0, `release: the live keys make it when let go without the pedal (${rel.without}), not on the pedal (${rel.withPed})`);

  /* ── 4 · pedal ── */
  const ped = await p.evaluate(async () => {
    const chord = async d => { const { oc, ch } = __G.chain(4.5); [60, 64, 67].forEach(m => makeVoice(oc, ch, "grand", m, 0.7, 0.05)); symPedal(ch, d, 0); return oc.startRendering(); };
    const a = await chord(1), b = await chord(0), sr = a.sampleRate, d = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) d[i] = a.getChannelData(0)[i] - b.getChannelData(0)[i];
    /* a MIDI pedal: up, halfway, down; C4 let go at 0.3 s, its level at 2.3 s */
    const half = [];
    for (const v of [0, 64, 127]) { ctx(); setPedal(0); setSus(false); setPedal(v / 127); noteOn("k", 60, 0.7); const vc = LIVE.get("k60"); noteOff("k", 60);
      half.push({ v, stopped: !!vc.stopped, inLive: LIVE.has("k60"), tau: vc.stopped ? +vc.end.toFixed(2) - +ac.currentTime.toFixed(2) : null }); setPedal(0); }
    return { res: +(__G.rms(d, 0.5, 4.0, sr) - __G.rms(b.getChannelData(0), 0.5, 4.0, sr)).toFixed(1), half }; });
  ok(ped.res <= -12 && ped.res >= -32, `pedal: the free strings ring along with a chord on the pedal, ${ped.res} dB under it`);
  const [h0, h64, h127] = ped.half;
  ok(h0.stopped && h64.stopped && !h127.stopped && h127.inLive && h64.tau > h0.tau * 3, `pedal: a MIDI pedal up stops a note let go (ends in ${h0.tau.toFixed(1)} s), halfway lets it die slower (${h64.tau.toFixed(1)} s), all the way holds it`);

  /* ── 5 · no clicks ── */
  const clk = await p.evaluate(async () => {
    const out = [];
    for (const [m, T] of [[36, 14], [60, 10], [84, 6]]) for (const v of [0.45, 1]) {
      const { oc, ch } = __G.chain(T); makeVoice(oc, ch, "grand", m, v, 0.05); const buf = await oc.startRendering();
      out.push({ what: m + " at " + v, at: __G.clicks(buf, [[0, 0.3]]) }); }
    /* a phrase: notes let go (the dampers), two strengths, blends */
    const { oc, ch } = __G.chain(6); const skip = []; let t = 0.05;
    [48, 52, 55, 60, 64, 67, 72, 76, 79, 84].forEach((m, i) => { const vc = makeVoice(oc, ch, "grand", m, i % 2 ? 0.78 : 0.55, t); vc.stop(t + 0.35, vc.tau); skip.push([t - 0.01, t + 0.15]); t += 0.4; });
    out.push({ what: "a phrase let go", at: __G.clicks(await oc.startRendering(), skip) });
    return out; });
  const cl = clk.filter(x => x.at.length);
  ok(!cl.length, `no clicks: ${clk.length} renders (held through the loop and the long decay, and a phrase let go)${cl.length ? " — " + cl.map(x => x.what + " at " + x.at.slice(0, 5).join(", ") + " s").join("; ") : ""}`);
  ok(errs.length === 0, "desk: no page errors " + errs.slice(0, 3).join(" | "));
  await c.close();

  /* ── 8 · an iPhone and an iPad, in the Studio ── */
  for (const [dev, vw] of [["iPhone", { ...pw.devices["iPhone 13"] }], ["iPad", { ...pw.devices["iPad Pro 11"] }]]) {
    const cx = await b.newContext({ ...vw, serviceWorkers: "block" }), e2 = [];
    cx.on("page", pg => pg.on("pageerror", e => e2.push(e.message))); await cx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await cx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    const pg = await cx.newPage(); await pg.goto(`http://localhost:${PORT}/the-studio#piano`);
    let f = null; for (let i = 0; i < 600 && !f; i++) { f = pg.frames().find(x => /music-piano/.test(x.url())); if (!f) await pg.waitForTimeout(100); }
    await f.waitForFunction(() => typeof SETS !== "undefined" && SETS.grand.ready && document.querySelector("#kbd [data-m]"), null, { timeout: 120000 });
    await f.evaluate(() => { window.__v = []; const n0 = window.noteOn; window.noteOn = function (tag, m, v) { window.__v.push(v); return n0.apply(this, arguments); }; });
    const fr = await (await f.frameElement()).boundingBox();
    const k = await f.evaluate(() => { const el = [...document.querySelectorAll("#kbd .wk")].find(x => { const r = x.getBoundingClientRect(); return r.x > 0 && r.right < innerWidth; }); el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y, h: r.height }; });
    const fr2 = await (await f.frameElement()).boundingBox();
    await pg.touchscreen.tap(fr2.x + k.x, fr2.y + k.y + k.h * 0.88); await pg.waitForTimeout(500);
    await pg.touchscreen.tap(fr2.x + k.x, fr2.y + k.y + k.h * 0.3); await pg.waitForTimeout(500);
    const st = await f.evaluate(() => ({ v: window.__v, lays: proLays(SETS.grand).join(""), live: ac && ac.state, phone: onPhone(), mics: SETS.grand.buf["60c"] && SETS.grand.buf["60c"].numberOfChannels }));
    ok(st.v.length >= 2 && st.v[0] >= 0.99 && st.v[1] < 0.75 && st.live === "running" && st.lays === (dev === "iPhone" ? "acdef" : "abcdef") && st.mics === (dev === "iPhone" ? 1 : 2) && !e2.length,
      `${dev}: in the Studio the grand plays a real tap; low on a key it is the hardest (${st.v.map(x => x.toFixed(2)).join(", ")}), strengths ${st.lays}, ${st.mics === 1 ? "one microphone" : "both microphones"}${e2.length ? "; errors: " + e2.slice(0, 2).join(" | ") : ""}`);
    await cx.close();
  }
  await b.close();

  /* ── 7 · tap-to-sound with every strength in ── */
  if (!process.env.GRAND_QUICK) {
    process.env.STEADY_NOTES = process.env.STEADY_NOTES || "120";
    const STEADY = require("../play/steady-all.js"), port = 9459, s2 = STEADY.serve(port);
    const R0 = STEADY.ROOMS.piano;
    STEADY.ROOMS.piano = Object.assign({}, R0, {
      setup: async f => { await f.waitForFunction(() => typeof SETS !== "undefined" && SETS.grand && SETS.grand.ready, null, { timeout: 120000 });
        await f.evaluate(async () => { HANDS.rush = 1; const t0 = Date.now(); while (SETS.grand.done < SETS.grand.total && Date.now() - t0 < 180000) await new Promise(r => setTimeout(r, 100)); HANDS.rush = 0; }); },
      ready: () => SETS.grand.done >= SETS.grand.total,
      sounds: () => ["grand"],
      /* two strengths: high on the key (blending two recordings) and low (the hardest) */
      at: () => [...document.querySelectorAll("#kbd [data-m]")].map((el, i) => { const r = el.getBoundingClientRect(), bk = el.classList.contains("bk"); return { bk, m: +el.getAttribute("data-m"), x: r.x + r.width / 2, y: r.y + r.height * (bk ? 0.6 : (i % 2 ? 0.55 : 0.85)) }; })
        .filter(k => k.x > 0 && k.x < innerWidth).sort((a, b) => a.bk - b.bk) });
    const b2 = await pw.chromium.launch();
    try { await STEADY.play(b2, port, "piano"); } catch (e) { ok(false, "tap-to-sound: " + e.message.split("\n")[0]); }
    fails += STEADY.fails(); await b2.close(); s2.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
