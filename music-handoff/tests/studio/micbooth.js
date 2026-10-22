/* AOG-MICBOOTH-V1 (2026-10-22) — 🎤 Sing or rap, the Studio's vocal booth (aog-micbooth.js). With a pretend microphone
   (Chromium's fake device, fed short bursts of a voice-like 226 Hz tone, a little sharp of A3):
   · 🎤 Sing or rap is in the Studio's top line in every room; nothing is fetched and the microphone is not asked for until
     Record; the booth opens over the room and fits an iPhone upright and on its side, an iPad;
   · with a Drum Machine loop on My Track, ● Record asks once, plays My Track and records; the meter moves only while
     recording; ■ Stop lets the microphone go and makes a take of the right length;
   · the four sounds render: Phone has little energy below 250 Hz; Echo has delayed copies in the gaps; Tuned pulls the
     226 Hz voice toward A (220 Hz, a note of C major); Clean renders; ▶ Hear it plays and stops; a sound tapped plays;
   · + Add to My Track puts it on the Mixing Desk's track 8 at the right bar (From bar 1; bar 3 on the iPad), called Voz 1 /
     Voice 1, its dry take kept, and My Track marks Voice; a take longer than the loop makes the beat repeat to fit it;
   · a refused microphone shows the friendly line about Settings; iPhone in Spanish, iPad in English; reads and is calm; no
     page errors. Port 9494. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.resolve(__dirname, "../../../aog-deploy"), PORT = 9494, U = "http://localhost:" + PORT + "/", srv = require("../srv.js")(PORT);
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
/* the pretend voice: 0.4 s of a band-limited 226 Hz tone, then 1.1 s of quiet, over and over */
const VOICE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "booth-")), "voice.wav");
(() => { const sr = 48000, n = sr * 15, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) { const t = i / sr, ph = t % 1.5; let x = 0;
    if (ph < 0.4) { const env = Math.min(1, ph / 0.01, (0.4 - ph) / 0.01); for (let k = 1; k <= 17; k++) x += Math.sin(2 * Math.PI * 226 * k * t) / k; x *= env * 0.42; }
    b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x * 20000))), 44 + i * 2); }
  fs.writeFileSync(VOICE, b); })();
const COUNT = () => { window.__gum = 0; window.__streams = []; const md = navigator.mediaDevices; if (!md || !md.getUserMedia) return; const g = md.getUserMedia.bind(md);
  md.getUserMedia = async c => { window.__gum++; const s = await g(c); window.__streams.push(s); return s; }; };
const REFUSE = () => { const md = navigator.mediaDevices; if (!md) return; md.getUserMedia = async () => { window.__gum = (window.__gum || 0) + 1; throw new DOMException("refused", "NotAllowedError"); }; };
/* the sounds, measured in the Studio page */
const MEASURE = async () => {
  const OC = window.OfflineAudioContext, M = AOGMicBooth, dry = M.dry(), sr = M.state().take.sr;
  const low = async x => { const oc = new OC(1, x.length, sr), b = oc.createBuffer(1, x.length, sr); b.copyToChannel(x, 0); const s = oc.createBufferSource(); s.buffer = b;
    let n = s; for (let i = 0; i < 4; i++) { const f = oc.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 250; f.Q.value = -3.01; n.connect(f); n = f; } n.connect(oc.destination); s.start();
    const y = (await oc.startRendering()).getChannelData(0); let a = 0, t = 0; for (let i = 0; i < x.length; i++) { a += y[i] * y[i]; t += x[i] * x[i]; } return t > 0 ? a / t : 0; };
  /* the gaps: 20 ms frames where the dry take is quiet */
  const F = Math.round(0.02 * sr), fr = x => { const o = []; for (let i = 0; i + F <= x.length; i += F) { let e = 0; for (let j = 0; j < F; j++) e += x[i + j] * x[i + j]; o.push(e); } return o; };
  const dF = fr(dry), mx = Math.max(...dF), gap = x => { const f = fr(x); let g = 0, t = 0; f.forEach((e, i) => { t += e; if (i < dF.length && dF[i] < mx * 1e-4) g += e; }); return t > 0 ? g / t : 0; };
  /* the pitch: autocorrelation over the loud part of each burst, the median */
  const pitch = x => { const N = Math.round(0.04 * sr), H = Math.round(0.02 * sr), lo = Math.floor(sr / 400), hi = Math.ceil(sr / 150), out = [];
    const ef = []; for (let i = 0; i + N <= x.length; i += H) { let e = 0; for (let j = 0; j < N; j++) e += x[i + j] * x[i + j]; ef.push(e); } const em = Math.max(...ef);
    ef.forEach((e, k) => { if (e < em * 0.4) return; const i = k * H; let best = -1, bl = 0; const r = [];
      for (let L = lo - 1; L <= hi + 1; L++) { let s = 0; for (let j = 0; j < N; j++) s += x[i + j] * x[i + j + L]; r[L] = s; if (L >= lo && L <= hi && s > best) { best = s; bl = L; } }
      const a = r[bl - 1], b = r[bl], c = r[bl + 1], d = a - 2 * b + c, p = bl + (d < 0 ? 0.5 * (a - c) / d : 0); out.push(sr / p); });
    out.sort((a, b) => a - b); return out.length ? out[Math.floor(out.length / 2)] : 0; };
  const r = { dryHz: pitch(dry), dryLow: await low(dry) };
  for (const k of ["clean", "echo", "tuned", "phone"]) { const m = await M.make(k); r[k] = { n: m.L.length, low: await low(m.L), gap: gap(m.L), hz: k === "tuned" || k === "clean" ? pitch(m.L) : 0, peak: m.L.reduce((a, v) => Math.max(a, Math.abs(v)), 0) }; }
  return r;
};
const ST = p => p.evaluate(() => AOGMicBooth.state());
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
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + VOICE] });
  for (const [nm, o, lang, room, from, recMs] of [
    ["iPhone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, "es", "piano", 1, 6500],
    ["iPad", { viewport: { width: 1180, height: 820 }, hasTouch: true }, "en", "bass", 3, 14000]]) {
    const ctx = await b.newContext({ ...o, serviceWorkers: "block" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, lang); await ctx.addInitScript(COUNT);
    if (from > 1) await ctx.addInitScript(f => { try { localStorage.setItem("aog.overdub.v1", JSON.stringify({ on: true, from: f })); } catch (e) {} }, from);
    const p = await ctx.newPage(); await p.goto(U + "the-studio#" + room); await W(4000);
    /* 1 · the key, in the top line, and nothing fetched yet */
    const key = await p.evaluate(() => { const k = document.getElementById("shMic"), r = k.getBoundingClientRect(), top = document.querySelector(".sh-top");
      return { t: k.textContent.trim(), vis: !!k.offsetParent, h: Math.round(r.height), right: Math.round(r.right), iw: innerWidth, topFit: top.scrollWidth <= top.clientWidth + 1, sw: document.scrollingElement.scrollWidth,
        loaded: !!window.AOGMicBooth || !!document.querySelector('script[src*="aog-micbooth"]') }; });
    ok(key.vis && key.h >= 44 && key.right <= key.iw && key.topFit && key.sw <= key.iw && (lang === "es" ? /Canta o rapea/ : /Sing or rap/).test(key.t) && !key.loaded,
      `${nm}: 🎤 ${key.t} is in the top line, fits and is ${key.h}px tall; the booth is not fetched yet: ${JSON.stringify(key)}`);
    await loopOnMyTrack(p);
    await p.evaluate(r => AOGStudioShell.go(r), room); await W(3000);
    await p.evaluate(() => AOGSong.set({ key: 0, minor: false }));   /* C major: A is a note of the key */
    /* 2 · the booth opens over the room; the microphone is not asked for */
    await p.click("#shMic");
    await p.waitForFunction(() => window.AOGMicBooth && AOGMicBooth.state().open, null, { timeout: 10000 });
    await p.waitForFunction(() => AOGMicBooth.state().bk, null, { timeout: 40000 }).catch(() => {});
    let s = await ST(p);
    const lay = await p.evaluate(() => { const m = document.getElementById("aogMicBooth"), r = e => e.getBoundingClientRect(), bs = [...m.querySelectorAll("button")].filter(x => x.offsetParent);
      return { vis: !m.hidden, cover: r(m).width >= innerWidth - 1, sw: document.scrollingElement.scrollWidth, iw: innerWidth, small: bs.filter(x => r(x).height < 44).map(x => x.id || x.textContent),
        out: bs.filter(x => r(x).right > innerWidth + 1).map(x => x.id), help: document.getElementById("mbHelp").textContent, helpShown: !document.getElementById("mbHelp").hidden, focus: document.activeElement && document.activeElement.id }; });
    ok(lay.vis && lay.cover && lay.sw <= lay.iw && !lay.small.length && !lay.out.length && lay.helpShown && /Headphones help|Los audífonos ayudan/.test(lay.help) && lay.focus === "mbH",
      `${nm}: the booth opens over the room, fits, every button 44px+, the headphones line shows once: ${JSON.stringify(lay)}`);
    ok(s.bk && s.bk.loop && (await gums(p)) === 0 && !s.mic && !s.raf, `${nm}: My Track is ready (a loop that can go round: ${JSON.stringify(s.bk)}); the microphone has not been asked for; the meter is still; line "${s.line}"`);
    const pc = await p.evaluate(`(${PROBE})()`), pk = await p.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `${nm}: the booth reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    /* 3 · Record, Stop */
    await p.click("#mbRec");
    await p.waitForFunction(() => AOGMicBooth.state().state === "rec", null, { timeout: 15000 });
    const t0 = Date.now();
    const seen = new Set(); for (let i = 0; i < 12; i++) { await W(150); seen.add(await p.evaluate(() => document.getElementById("mbLvl").style.transform)); }
    const m1 = seen.size, m2 = [...seen].slice(0, 4).join(" ");
    s = await ST(p);
    ok(s.mic && s.raf && s.ac === "running" && (await gums(p)) === 1 && m1 >= 3, `${nm}: ● Record asked once and records; the meter moves while recording (${m1} levels: ${m2}); "${s.line}"`);
    await W(Math.max(0, recMs - (Date.now() - t0)));
    const wall = (Date.now() - t0) / 1000;
    await p.click("#mbRec");
    await p.waitForFunction(() => AOGMicBooth.state().state === "take", null, { timeout: 15000 });
    s = await ST(p);
    const ended = await p.evaluate(() => window.__streams.every(x => x.getTracks().every(t => t.readyState === "ended")));
    const still = await p.evaluate(() => document.getElementById("mbLvl").style.transform);
    ok(s.take && Math.abs(s.take.body - wall) < 1.3 && s.take.head >= 0 && s.take.head <= 0.26 && s.take.from === from && !s.mic && ended && !s.raf && /scaleX\(0\)/.test(still),
      `${nm}: ■ Stop lets the microphone go and makes a take of the right length (${wall.toFixed(2)} s recorded): ${JSON.stringify(s.take)}`);
    await p.waitForFunction(() => !AOGMicBooth.state().making, null, { timeout: 20000 });
    /* 4 · the four sounds */
    const R = await p.evaluate(MEASURE);
    ok(R.clean.n > 0 && R.clean.peak > 0.05 && R.clean.peak <= 0.9, `${nm}: Clean renders (peak ${R.clean.peak.toFixed(2)})`);
    ok(R.phone.low < 0.12 && R.phone.low < R.clean.low / 3, `${nm}: Phone has little energy below 250 Hz (${(R.phone.low * 100).toFixed(1)}% against Clean's ${(R.clean.low * 100).toFixed(1)}%)`);
    ok(R.echo.gap > 3 * R.clean.gap && R.echo.gap > 0.02, `${nm}: Echo has delayed copies in the gaps (${(R.echo.gap * 100).toFixed(1)}% of its sound against Clean's ${(R.clean.gap * 100).toFixed(1)}%)`);
    ok(R.dryHz > 222 && Math.abs(R.tuned.hz - 220) < 0.5 * Math.abs(R.dryHz - 220), `${nm}: Tuned pulls the voice toward A (220 Hz): ${R.dryHz.toFixed(1)} Hz → ${R.tuned.hz.toFixed(1)} Hz`);
    /* 5 · Hear it, a sound tapped */
    await p.click("#mbHear"); await W(800); s = await ST(p);
    ok(s.hear && s.ac === "running", `${nm}: ▶ Hear it plays the take with the beat`);
    await p.click("#mbHear"); await W(500); s = await ST(p);
    ok(!s.hear, `${nm}: ■ Stop stops it`);
    await p.click('.mb-snd[data-snd="echo"]'); await W(900); s = await ST(p);
    ok(s.snd === "echo" && s.hear, `${nm}: tapping Echo plays it with the beat: ${JSON.stringify({ snd: s.snd, hear: s.hear, line: s.line })}`);
    /* 6 · + Add to My Track */
    await p.click("#mbAdd");
    await p.waitForFunction(() => /on My Track|en mi pista/.test(AOGMicBooth.state().line), null, { timeout: 20000 }).catch(() => {});
    s = await ST(p); await W(800);
    const dk = await desk(p).evaluate(async () => { const S = __aogStudio, c = S.SONG.tracks[7].clip, b = S.SONG.tracks[0].clip; const d = c && c.dry ? await S.sget(c.dry) : null;
      return c ? { voice: c.voice, name: c.name, startBar: c.startBar, head: c.head, body: c.body, sec: c.sec, snd: c.snd, dry: !!(d && d.wav && d.wav.size > 1000), beatLoops: b ? b.loops : 0, beatPieces: b && b.pieces ? b.pieces.map(x => x.n) : null } : null; });
    const mt = await p.evaluate(() => { const l = document.querySelector('.lay[data-layer="voice"]'); return !!(l && l.classList.contains("on")); });
    ok(dk && dk.voice && dk.startBar === from && dk.name === (lang === "es" ? "Voz 1" : "Voice 1") && Math.abs(dk.head - s.take.head) < 0.01 && dk.snd === "echo" && dk.dry && mt,
      `${nm}: + Add to My Track puts ${dk && dk.name} on track 8 at bar ${dk && dk.startBar}, its dry take kept, My Track marks Voice: ${JSON.stringify(dk)} "${s.line}"`);
    if (nm === "iPad") ok(/repeats to fit/.test(s.line) && (dk.beatLoops >= 2 || (dk.beatPieces && dk.beatPieces[0] >= 2)), `${nm}: a take longer than the loop makes the beat repeat to fit it: ${JSON.stringify({ loops: dk.beatLoops, pieces: dk.beatPieces })}`);
    /* 7 · a phone on its side; then Close */
    if (nm === "iPhone") {
      await p.setViewportSize({ width: 844, height: 390 }); await W(500);
      const side = await p.evaluate(() => { const m = document.getElementById("aogMicBooth"), r = e => e.getBoundingClientRect(), bs = [...m.querySelectorAll("button")].filter(x => x.offsetParent);
        return { vis: !m.hidden, sw: document.scrollingElement.scrollWidth, iw: innerWidth, out: bs.filter(x => r(x).right > innerWidth + 1).map(x => x.id), small: bs.filter(x => r(x).height < 44).map(x => x.id) }; });
      ok(side.vis && side.sw <= side.iw && !side.out.length && !side.small.length, `${nm} on its side: the booth stays open and fits: ${JSON.stringify(side)}`);
      await p.setViewportSize({ width: 390, height: 844 }); await W(300);
    }
    await p.keyboard.press("Escape"); await W(700); s = await ST(p);
    const back = await p.evaluate(() => document.activeElement && document.activeElement.id);
    ok(!s.open && !s.hear && !s.mic && s.ac === "suspended" && back === "shMic", `${nm}: Escape closes the booth, its sound rests, the keyboard is back on 🎤: ${JSON.stringify({ open: s.open, ac: s.ac, back })}`);
    ok(errs.length === 0, `${nm}: no page errors ` + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* 8 · a refused microphone */
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block", colorScheme: "dark" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, "en"); await ctx.addInitScript(REFUSE);
    await ctx.addInitScript(() => { try { localStorage.setItem("aog.theme", "dark"); } catch (e) {} });
    const p = await ctx.newPage(); await p.goto(U + "the-studio#guitar"); await W(3500);
    await p.click("#shMic"); await p.waitForFunction(() => window.AOGMicBooth && AOGMicBooth.state().open, null, { timeout: 10000 }); await W(1500);
    await p.click("#mbRec"); await W(1200);
    const s = await ST(p), al = await p.evaluate(() => { const a = document.getElementById("mbAllow"); return { shown: !a.hidden, t: a.textContent }; });
    ok(s.allow && al.shown && /Settings, then Safari, then Microphone/.test(al.t) && /icon to the left of the web address/.test(al.t) && s.state === "idle" && !s.mic,
      `a refused microphone shows how to allow it (iPhone, iPad, computer): "${al.t.slice(0, 120)}…"`);
    const pc = await p.evaluate(`(${PROBE})()`);
    ok(!pc.length, `the refused line reads in the dark theme (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
    ok(errs.length === 0, "refused: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
