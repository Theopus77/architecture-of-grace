/* AOG-VOCAL-V1 (2026-10-23) — 🎙 The Vocal Booth, the Studio's ninth room (music-vocal.html, aog-vocal.js), in the place of
   🎤 Sing or rap (AOG-MICBOOTH-V1, whose test this replaces). With a pretend microphone (Chromium's fake device, fed short
   bursts of a voice-like 226 Hz tone, a little sharp of A3):
   · the Vocal Booth is a door, the eighth of nine, just before the Mixing Desk; the room fetches nothing and asks for no
     microphone until ● Record; it fits an iPhone upright and on its side, and an iPad; every key is 44 px or more;
   · with a Drum Machine loop on My Track, ● Record asks once, plays My Track and records; the meter moves only while
     recording; ■ Stop lets the microphone go and makes a take of the right length; a second take is kept beside the first;
     ✕ lets one go and Bring it back returns it;
   · the sounds, measured: Phone has little energy below 250 Hz; Echo has delayed copies in the gaps; Tuned pulls the
     226 Hz voice toward A (220 Hz); Robot pulls it harder; Air adds highs; Low cut takes lows away; Double spreads the voice
     left and right; Big hall rings on after the voice; nothing past −1 dB;
   · ▶ Hear it plays with the beat; a control moved while it plays changes the sound (the sound becomes Custom) and it plays on;
   · + Add to My Track puts it on the desk's track 8 at the right bar (From bar 1; bar 3 on the iPad), called Voz 1 / Voice 1,
     its sound named, its dry take kept, and My Track marks Voice; a take longer than the loop makes the beat repeat to fit;
   · a refused microphone shows the friendly line about Settings; reads and is calm in Spanish and English, light and dark;
     rests when idle (the engine paused, no frames); no page errors. Port 9494. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.resolve(__dirname, "../../../aog-deploy"), PORT = 9494, U = "http://localhost:" + PORT + "/", srv = require("../srv.js")(PORT);
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
/* the pretend voice: 0.4 s of a band-limited 226 Hz tone, then a soft "s" (60 ms of bright noise), then quiet, over and over */
const VOICE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "vocal-")), "voice.wav");
(() => { const sr = 48000, n = sr * 15, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  let seed = 12345, prev = 0; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
  for (let i = 0; i < n; i++) { const t = i / sr, ph = t % 1.5; let x = 0;
    if (ph < 0.4) { const env = Math.min(1, ph / 0.01, (0.4 - ph) / 0.01); for (let k = 1; k <= 17; k++) x += Math.sin(2 * Math.PI * 226 * k * t) / k; x *= env * 0.42; }
    else if (ph >= 0.42 && ph < 0.48) { const v = rnd(), hi = v - prev; prev = v; x = hi * 0.16 * Math.min(1, (ph - 0.42) / 0.005, (0.48 - ph) / 0.005); }   /* the s: noise, its lows taken away */
    b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x * 20000))), 44 + i * 2); }
  fs.writeFileSync(VOICE, b); })();
const COUNT = () => { window.__gum = 0; window.__streams = []; const md = navigator.mediaDevices; if (!md || !md.getUserMedia) return; const g = md.getUserMedia.bind(md);
  md.getUserMedia = async c => { window.__gum++; const s = await g(c); window.__streams.push(s); return s; }; };
const REFUSE = () => { const md = navigator.mediaDevices; if (!md) return; md.getUserMedia = async () => { window.__gum = (window.__gum || 0) + 1; throw new DOMException("refused", "NotAllowedError"); }; };
/* the sounds, measured in the booth */
const MEASURE = async () => {
  const OC = window.OfflineAudioContext, V = AOGVocal, dry = V.dry(), sr = V.state().take.sr;
  const band = async (x, type, f) => { const oc = new OC(1, x.length, sr), b = oc.createBuffer(1, x.length, sr); b.copyToChannel(x, 0); const s = oc.createBufferSource(); s.buffer = b;
    let n = s; for (let i = 0; i < 4; i++) { const z = oc.createBiquadFilter(); z.type = type; z.frequency.value = f; z.Q.value = -3.01; n.connect(z); n = z; } n.connect(oc.destination); s.start(0);
    const y = (await oc.startRendering()).getChannelData(0); let a = 0, t = 0; for (let i = 0; i < x.length; i++) { a += y[i] * y[i]; t += x[i] * x[i]; } return t > 0 ? a / t : 0; };
  const F = Math.round(0.02 * sr), fr = x => { const o = []; for (let i = 0; i + F <= x.length; i += F) { let e = 0; for (let j = 0; j < F; j++) e += x[i + j] * x[i + j]; o.push(e); } return o; };
  const dF = fr(dry); let mx = 0; dF.forEach(e => { if (e > mx) mx = e; });
  const gap = x => { const f = fr(x); let g = 0, t = 0; f.forEach((e, i) => { t += e; if (i < dF.length && dF[i] < mx * 1e-4) g += e; }); return t > 0 ? g / t : 0; };
  /* after the voice: the share of the sound that rings on past the take's end */
  const after = x => { let a = 0, t = 0; for (let i = 0; i < x.length; i++) { const e = x[i] * x[i]; t += e; if (i >= dry.length) a += e; } return t > 0 ? a / t : 0; };
  const side = m => { let d = 0, t = 0; for (let i = 0; i < m.L.length; i++) { const s = m.L[i] - m.R[i], q = m.L[i] + m.R[i]; d += s * s; t += q * q; } return t > 0 ? d / t : 0; };
  const pitch = x => { const N = Math.round(0.04 * sr), H = Math.round(0.02 * sr), lo = Math.floor(sr / 400), hi = Math.ceil(sr / 150), out = [];
    const ef = []; for (let i = 0; i + N <= x.length; i += H) { let e = 0; for (let j = 0; j < N; j++) e += x[i + j] * x[i + j]; ef.push(e); } let em = 0; ef.forEach(e => { if (e > em) em = e; });
    ef.forEach((e, k) => { if (e < em * 0.4) return; const i = k * H; let best = -1, bl = 0; const r = [];
      for (let L = lo - 1; L <= hi + 1; L++) { let s = 0; for (let j = 0; j < N; j++) s += x[i + j] * x[i + j + L]; r[L] = s; if (L >= lo && L <= hi && s > best) { best = s; bl = L; } }
      const a = r[bl - 1], b = r[bl], c = r[bl + 1], d = a - 2 * b + c, p = bl + (d < 0 ? 0.5 * (a - c) / d : 0); out.push(sr / p); });
    out.sort((a, b) => a - b); return out.length ? out[Math.floor(out.length / 2)] : 0; };
  const pk = m => { let p = 0; for (let i = 0; i < m.L.length; i++) { const a = Math.max(Math.abs(m.L[i]), Math.abs(m.R[i])); if (a > p) p = a; } return p; };
  const r = { dryHz: pitch(dry) }, peaks = [];
  const one = async (name, k, ch) => { const m = await V.make(k, ch); peaks.push(pk(m)); return m; };
  const clean = await one("clean", "clean"); r.clean = { low: await band(clean.L, "lowpass", 250), high: await band(clean.L, "highpass", 6000), gap: gap(clean.L), after: after(clean.L), hz: pitch(clean.L) };
  const dry0 = await one("dry0", "clean", { room: 0 }); r.clean.side = side(dry0);   /* Double is heard against no room: the room's own stereo is not Double's */
  const phone = await one("phone", "phone"); r.phone = { low: await band(phone.L, "lowpass", 250) };
  const echo = await one("echo", "echo"); r.echo = { gap: gap(echo.L) };
  const tuned = await one("tuned", "tuned"); r.tuned = { hz: pitch(tuned.L) };
  const robot = await one("robot", "robot"); r.robot = { hz: pitch(robot.L) };
  const hall = await one("hall", "hall"); r.hall = { after: after(hall.L) };
  const air = await one("air", "clean", { air: 9 }); r.air = { high: await band(air.L, "highpass", 6000) };
  const s0 = await one("s0", "clean", { ss: 0 }), s1 = await one("s1", "clean", { ss: 100 }); r.ss = { off: await band(s0.L, "highpass", 5000), on: await band(s1.L, "highpass", 5000) };
  const lc = await one("lc", "clean", { lc: 300 }); r.lc = { low: await band(lc.L, "lowpass", 250) };
  const dbl = await one("dbl", "clean", { dbl: 80, room: 0 }); r.dbl = { side: side(dbl) };
  r.peak = Math.max(...peaks);
  return r;
};
async function routes(ctx, lang) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await ctx.addInitScript(l => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", l); } catch (e) {} }, lang);
}
async function loopOnMyTrack(p) {
  await p.evaluate(() => AOGStudioShell.go("pads")); await W(3500);
  const f = p.frames().find(x => /music-pads/.test(x.url()));
  await f.waitForFunction(() => document.querySelectorAll("#grpSel option").length > 3, null, { timeout: 30000 });
  await f.evaluate(async () => { startBeat("boombap"); document.getElementById("bounceBtn").click(); for (let i = 0; i < 120 && document.getElementById("bounceAct").hidden; i++) await new Promise(r => setTimeout(r, 250)); document.getElementById("bStudio").click(); });
  await W(2500);
}
const gums = p => Promise.all(p.frames().map(f => f.evaluate(() => window.__gum || 0).catch(() => 0))).then(a => a.reduce((x, y) => x + y, 0));
const desk = p => p.frames().find(x => /music-studio/.test(x.url()));
async function booth(p) { for (let i = 0; i < 80; i++) { const f = p.frames().find(x => /music-vocal/.test(x.url())); if (f && await f.evaluate(() => !!window.AOGVocal && !!document.getElementById("vbRec")).catch(() => false)) return f; await W(250); } return null; }
const ST = f => f.evaluate(() => AOGVocal.state());
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + VOICE] });
  for (const [nm, o, lang, from, recMs] of [
    ["iPhone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, "es", 1, 6500],
    ["iPad", { viewport: { width: 1180, height: 820 }, hasTouch: true }, "en", 3, 14000]]) {
    const ctx = await b.newContext({ ...o, serviceWorkers: "block" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, lang); await ctx.addInitScript(COUNT);
    if (from > 1) await ctx.addInitScript(f => { try { localStorage.setItem("aog.overdub.v1", JSON.stringify({ on: true, from: f })); } catch (e) {} }, from);
    const p = await ctx.newPage(); await p.goto(U + "the-studio#piano"); await W(4000);
    /* 1 · the door, eighth of nine; no booth code and no 🎤 key */
    const doors = await p.evaluate(() => { const ds = [...document.querySelectorAll(".sh-doors [data-room], .sh-doors a")].map(e => e.getAttribute("data-room") || (e.getAttribute("href") || "").replace(/^.*#/, ""));
      return { ds: ds.filter((x, i) => x && ds.indexOf(x) === i), key: !!document.getElementById("shMic"), loaded: !!document.querySelector('script[src*="aog-micbooth"],script[src*="aog-vocal"]') }; });
    ok(doors.ds.join(" ") === "pads kit piano guitar bass band decks vocal studio" && !doors.key && !doors.loaded, `${nm}: the Vocal Booth is the eighth door of nine, before the Mixing Desk; no 🎤 key; nothing fetched for it: ${JSON.stringify(doors)}`);
    await loopOnMyTrack(p);
    await p.evaluate(() => AOGSong.set({ key: 0, minor: false }));   /* C major: A is a note of the key */
    await p.evaluate(() => AOGStudioShell.go("vocal"));
    const f = await booth(p);
    ok(!!f, `${nm}: the Vocal Booth opens`);
    if (!f) { await ctx.close(); continue; }
    await f.waitForFunction(() => AOGVocal.state().bk, null, { timeout: 40000 }).catch(() => {});
    let s = await ST(f);
    const lay = await f.evaluate(() => { const r = e => e.getBoundingClientRect(), bs = [...document.querySelectorAll("button,select,summary,label.vb-mon")].filter(x => x.offsetParent);
      return { sw: document.scrollingElement.scrollWidth, iw: innerWidth, small: bs.filter(x => r(x).height < 44).map(x => x.id || x.className || x.textContent), out: bs.filter(x => r(x).right > innerWidth + 1).map(x => x.id || x.className),
        help: document.getElementById("vbHelp").textContent, helpShown: !document.getElementById("vbHelp").hidden, rec: document.getElementById("vbRec").textContent.trim(), right: !document.getElementById("vbRight").hidden }; });
    ok(lay.sw <= lay.iw && !lay.small.length && !lay.out.length && lay.helpShown && /Headphones help|Los audífonos ayudan/.test(lay.help) && (lang === "es" ? /Grabar/ : /Record/).test(lay.rec) && !lay.right,
      `${nm}: the booth fits, every key 44px+, the headphones line shows, Record first and nothing else until there is a take: ${JSON.stringify(lay)}`);
    ok(s.bk && s.bk.loop && (await gums(p)) === 0 && !s.mic && !s.raf && s.ac == null, `${nm}: My Track is ready (${JSON.stringify(s.bk)}); no microphone asked for, no sound engine made, the meter still; "${s.line}"`);
    let pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `${nm}: the booth reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    /* 2 · Record, Stop */
    await f.click("#vbRec");
    await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 });
    const t0 = Date.now();
    const seen = new Set(); for (let i = 0; i < 12; i++) { await W(150); seen.add(await f.evaluate(() => document.getElementById("vbIn").style.transform)); }
    s = await ST(f);
    ok(s.mic && s.raf && s.ac === "running" && (await gums(p)) === 1 && seen.size >= 3, `${nm}: ● Record asked once and records; the meter moves while recording (${seen.size} levels); "${s.line}"`);
    await W(Math.max(0, recMs - (Date.now() - t0)));
    const wall = (Date.now() - t0) / 1000;
    await f.click("#vbRec");
    await f.waitForFunction(() => AOGVocal.state().takes === 1 && AOGVocal.state().state === "idle", null, { timeout: 15000 });
    s = await ST(f);
    const ended = await f.evaluate(() => window.__streams.every(x => x.getTracks().every(t => t.readyState === "ended")));
    const still = await f.evaluate(() => document.getElementById("vbIn").style.transform);
    ok(s.take && Math.abs(s.take.body - wall) < 1.3 && s.take.head >= 0 && s.take.head <= 0.26 && s.take.from === from && !s.mic && ended && !s.raf && /scaleX\(0\)/.test(still),
      `${nm}: ■ Stop lets the microphone go and makes a take of the right length (${wall.toFixed(2)} s recorded): ${JSON.stringify(s.take)}`);
    /* 3 · the sounds, measured */
    const R = await f.evaluate(MEASURE);
    ok(R.peak > 0.05 && R.peak <= 0.892, `${nm}: every sound renders, none past −1 dB (loudest peak ${R.peak.toFixed(3)})`);
    ok(R.phone.low < 0.12 && R.phone.low < R.clean.low / 3, `${nm}: Phone has little energy below 250 Hz (${(R.phone.low * 100).toFixed(1)}% against Clean's ${(R.clean.low * 100).toFixed(1)}%)`);
    ok(R.echo.gap > 3 * R.clean.gap && R.echo.gap > 0.02, `${nm}: Echo has delayed copies in the gaps (${(R.echo.gap * 100).toFixed(1)}% against Clean's ${(R.clean.gap * 100).toFixed(1)}%)`);
    ok(R.dryHz > 222 && Math.abs(R.tuned.hz - 220) < 0.5 * Math.abs(R.dryHz - 220), `${nm}: Tuned pulls the voice toward A (220 Hz): ${R.dryHz.toFixed(1)} Hz → ${R.tuned.hz.toFixed(1)} Hz`);
    ok(Math.abs(R.robot.hz - 220) <= Math.abs(R.tuned.hz - 220) + 0.3, `${nm}: Robot pulls it at least as hard: ${R.robot.hz.toFixed(1)} Hz`);
    ok(R.air.high > 1.5 * R.clean.high && R.clean.high > 0.0005, `${nm}: Air adds highs above 6 kHz (${(R.air.high * 100).toFixed(2)}% against ${(R.clean.high * 100).toFixed(2)}%)`);
    ok(R.ss.on < 0.7 * R.ss.off, `${nm}: Soft S calms the sharp s (above 5 kHz: ${(R.ss.on * 100).toFixed(2)}% at full against ${(R.ss.off * 100).toFixed(2)}% off)`);
    ok(R.lc.low < R.clean.low / 2, `${nm}: Low cut takes lows away (${(R.lc.low * 100).toFixed(1)}% below 250 Hz against ${(R.clean.low * 100).toFixed(1)}%)`);
    ok(R.dbl.side > 4 * R.clean.side + 0.005, `${nm}: Double spreads the voice left and right (side ${(R.dbl.side * 100).toFixed(2)}% against ${(R.clean.side * 100).toFixed(2)}%)`);
    ok(R.hall.after > 2 * R.clean.after, `${nm}: Big hall rings on after the voice (${(R.hall.after * 100).toFixed(2)}% against ${(R.clean.after * 100).toFixed(2)}%)`);
    /* 4 · Hear it; a control moved while it plays; every ready-made sound tapped */
    await f.click("#vbHear"); await W(900); s = await ST(f);
    ok(s.hear && s.ac === "running" && s.raf, `${nm}: ▶ Hear it plays the take with the beat, and its meter moves`);
    await f.evaluate(() => { document.getElementById("vbShape").open = true; const r = document.querySelector('.vb-r[data-k="echo"]'); r.value = 60; r.dispatchEvent(new Event("input", { bubbles: true })); });
    await W(400); s = await ST(f);
    ok(s.hear && s.snd === "custom" && s.P.echo === 60, `${nm}: Echo moved while it plays: it plays on, now Custom: ${JSON.stringify({ hear: s.hear, snd: s.snd, echo: s.P.echo })}`);
    for (const k of await f.evaluate(() => AOGVocal.presets)) { await f.click(`.vb-snd[data-snd="${k}"]`); await W(300); }
    await f.waitForFunction(() => !AOGVocal.state().making, null, { timeout: 30000 }).catch(() => {});
    await f.click('.vb-snd[data-snd="radio"]'); await W(600); s = await ST(f);
    ok(s.snd === "radio" && s.hear, `${nm}: each of the nine sounds can be tapped as it plays; Radio picked, still playing`);
    pc = await f.evaluate(`(${PROBE})()`); pk = await f.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `${nm}: with a take, its sounds and controls, the booth reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await f.click("#vbHear"); await W(500); s = await ST(f);
    ok(!s.hear && !s.raf, `${nm}: ■ Stop stops it, the meter rests`);
    /* 5 · + Add to My Track */
    await f.click("#vbAdd");
    await f.waitForFunction(() => /on My Track|en mi pista/.test(AOGVocal.state().line), null, { timeout: 30000 }).catch(() => {});
    s = await ST(f); await W(800);
    const dk = await desk(p).evaluate(async () => { const S = __aogStudio, c = S.SONG.tracks[7].clip, b = S.SONG.tracks[0].clip; const d = c && c.dry ? await S.sget(c.dry) : null;
      return c ? { voice: c.voice, name: c.name, startBar: c.startBar, head: c.head, body: c.body, snd: c.snd, dry: !!(d && d.wav && d.wav.size > 1000), beatLoops: b ? b.loops : 0, beatPieces: b && b.pieces ? b.pieces.map(q => q.n) : null } : null; });
    const mt = await p.evaluate(() => { const l = document.querySelector('.lay[data-layer="voice"]'); return !!(l && l.classList.contains("on")); });
    ok(dk && dk.voice && dk.startBar === from && dk.name === (lang === "es" ? "Voz 1" : "Voice 1") && Math.abs(dk.head - s.take.head) < 0.01 && dk.snd === "radio" && dk.dry && mt && s.take.added,
      `${nm}: + Add to My Track puts ${dk && dk.name} on track 8 at bar ${dk && dk.startBar}, called Radio, its dry take kept, My Track marks Voice: ${JSON.stringify(dk)} "${s.line}"`);
    if (nm === "iPad") ok(/repeats to fit/.test(s.line) && dk && (dk.beatLoops >= 2 || (dk.beatPieces && dk.beatPieces[0] >= 2)), `${nm}: a take longer than the loop makes the beat repeat to fit it: ${JSON.stringify({ loops: dk && dk.beatLoops, pieces: dk && dk.beatPieces, line: s.line })}`);
    /* 6 · a second take; ✕ and Bring it back (the mission slip, if it shows, is tapped away first, as a person would) */
    if (await p.evaluate(() => { const s = document.getElementById("msDone"); return !!(s && !s.hidden); })) { await p.click("#msDone"); await W(200); }
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 }); await W(2500);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().takes === 2, null, { timeout: 15000 }).catch(() => {});
    s = await ST(f);
    ok(s.takes === 2 && s.cur === 1 && !s.take.added && (await gums(p)) === 2, `${nm}: a second take is kept beside the first and picked: ${JSON.stringify({ takes: s.takes, cur: s.cur })}`);
    await f.click('.vb-tx[data-i="1"]'); await W(300); s = await ST(f);
    const goneLine = s.line;
    await f.click("#vbBack"); await W(300); const s2 = await ST(f);
    ok(s.takes === 1 && s.gone && s2.takes === 2 && !s2.gone, `${nm}: ✕ lets a take go ("${goneLine}"); Bring it back returns it`);
    /* 7 · a phone on its side */
    if (nm === "iPhone") {
      await p.setViewportSize({ width: 844, height: 390 }); await W(800);
      const side = await f.evaluate(() => { const r = e => e.getBoundingClientRect(), bs = [...document.querySelectorAll("button,select,summary")].filter(x => x.offsetParent);
        return { sw: document.scrollingElement.scrollWidth, iw: innerWidth, out: bs.filter(x => r(x).right > innerWidth + 1).map(x => x.id || x.className), small: bs.filter(x => r(x).height < 44).map(x => x.id || x.className) }; });
      ok(side.sw <= side.iw && !side.out.length && !side.small.length, `${nm} on its side: the booth fits: ${JSON.stringify(side)}`);
      await p.setViewportSize({ width: 390, height: 844 }); await W(300);
    }
    /* 8 · rests */
    await W(1500); s = await ST(f);
    ok(!s.hear && !s.mic && !s.raf && s.ac === "suspended", `${nm}: at rest: no sound, no microphone, no frames, the engine paused: ${JSON.stringify({ ac: s.ac })}`);
    ok(errs.length === 0, `${nm}: no page errors ` + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* 9 · a refused microphone, iPhone, dark */
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block", colorScheme: "dark" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, "en"); await ctx.addInitScript(REFUSE);
    await ctx.addInitScript(() => { try { localStorage.setItem("aog.theme", "dark"); } catch (e) {} });
    const p = await ctx.newPage(); await p.goto(U + "the-studio#vocal"); await W(3500);
    const f = await booth(p);
    await f.click("#vbRec"); await W(1200);
    const s = await ST(f), al = await f.evaluate(() => { const a = document.getElementById("vbAllow"); return { shown: !a.hidden, t: a.textContent }; });
    ok(s.allow && al.shown && /Settings, then Safari, then Microphone/.test(al.t) && /icon to the left of the web address/.test(al.t) && s.state === "idle" && !s.mic,
      `a refused microphone shows how to allow it (iPhone, iPad, computer): "${al.t.slice(0, 120)}…"`);
    const pc = await f.evaluate(`(${PROBE})()`);
    ok(!pc.length, `the refused line reads in the dark theme (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
    ok(errs.length === 0, "refused: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* 10 · AOG-VOCAL-MIC-V2: Safari on an iPad refused the room's frame though the site was allowed; the booth asks the Studio */
  { const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, isMobile: true, hasTouch: true, serviceWorkers: "block" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, "en"); await ctx.addInitScript(COUNT);
    await ctx.addInitScript(() => { if (window.parent === window) return; const md = navigator.mediaDevices; if (!md) return;
      md.getUserMedia = async () => { window.__frameAsked = (window.__frameAsked || 0) + 1; throw new DOMException("refused", "NotAllowedError"); }; });
    const p = await ctx.newPage(); await p.goto(U + "the-studio#vocal"); await W(3500);
    const f = await booth(p);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 }).catch(() => {}); await W(2000);
    let s = await ST(f); const rec = s.state === "rec", asked = await f.evaluate(() => window.__frameAsked || 0);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().takes === 1, null, { timeout: 15000 }).catch(() => {});
    s = await ST(f);
    ok(rec && asked >= 1 && (await gums(p)) >= 1 && s.takes === 1 && !s.allow, `the room's frame refused, the Studio's microphone records instead: ${JSON.stringify({ rec, asked, studio: await gums(p), takes: s.takes, allow: s.allow })}`);
    await W(1500); s = await ST(f);
    ok(!s.mic, "the Studio's microphone is let go after the take");
    ok(errs.length === 0, "frame refused: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
