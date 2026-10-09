/* AOG-STUDIO-VOICE-V1 — STUDIO-HANDOFF §10: track 8 is your voice. With a pretend microphone (Chromium's fake device,
   fed a steady 330 Hz tone): loading the desk and pressing Play never asks for the microphone; track 8 shows Your voice,
   says plainly that it needs the microphone and that the recording stays on this device, and has no menu of instrument
   recordings. Record your voice asks for the microphone once, plays the song from the start bar and records; Stop lets
   the microphone go at once and puts "Your voice 1" on track 8, lined up a little after the start bar (the song's
   scheduling and the speakers' delay), and Make the mix with only track 8 heard carries the 330 Hz voice. Delete, then
   Bring it back returns the same take. Send it out offers Your voice on its own. A refused microphone keeps the slot,
   says so plainly with Try again, and Play still works. In the Studio, My Track marks Voice. Spanish; an iPhone, light
   and dark: nothing sideways, readable and calm; no page errors. Port 9251. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const PORT = 9251, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
}
/* the pretend microphone: 20 s of a steady 330 Hz tone */
const TONE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "voice-")), "tone.wav");
(() => { const sr = 48000, n = sr * 20, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(12000 * Math.sin(2 * Math.PI * 330 * i / sr)), 44 + i * 2); fs.writeFileSync(TONE, b); })();
/* every ask for the microphone is counted, and every stream kept to see that it is let go */
const COUNT = () => { window.__gum = 0; window.__streams = []; const md = navigator.mediaDevices; if (!md || !md.getUserMedia) return; const g = md.getUserMedia.bind(md);
  md.getUserMedia = async c => { window.__gum++; const s = await g(c); window.__streams.push(s); return s; }; };
const TAKE = `(async (n, freqs) => { const sr = 44100, head = 0.05, bar = 2.4, sec = head + bar * freqs.length, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0; for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0; if (t >= 0) { const k = Math.min(freqs.length - 1, Math.floor(t / bar)); ph += 2 * Math.PI * freqs[k] / sr; x = Math.round(7000 * Math.sin(ph)); }
    v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "voice|" + n });
})`;
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
const line = (p, id) => p.evaluate(i => (document.getElementById(i) || {}).textContent || "", id);
async function record(p, secs) {
  await p.click("#voiceRec");
  await p.waitForFunction(() => __aogStudio.VOICE.rec, null, { timeout: 10000 });
  await p.waitForTimeout(secs * 1000);
  await p.click("#voiceStop");
  await p.waitForFunction(() => !__aogStudio.VOICE.rec && !__aogStudio.VOICE.busy, null, { timeout: 10000 });
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + TONE] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  await c.addInitScript(COUNT);
  const p = await c.newPage(); await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await p.evaluate(`(async()=>{ const add=${TAKE}; await add(1, [220,220,220,220]); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0);

  /* 1 · nothing asks for the microphone on load or on Play */
  await p.click("#playBtn"); await p.waitForTimeout(600); await p.click("#playBtn");
  ok(await p.evaluate(() => window.__gum) === 0, "loading the desk and pressing Play never ask for the microphone");
  await p.selectOption("#trackSel", "7"); await p.waitForTimeout(200);
  const vb = await p.evaluate(() => ({ opt: document.querySelector('#trackSel option[value="7"]').textContent, text: document.getElementById("voiceBox").innerText,
    recs: getComputedStyle(document.getElementById("recs")).display, btn: (document.getElementById("voiceRec") || {}).textContent }));
  ok(vb.opt === "Track 8 · Voice" && vb.text.includes("To add your voice, this page needs the microphone. The recording stays on this device.") && vb.recs === "none" && vb.btn === "● Record your voice",
    "track 8 is Your voice: " + JSON.stringify(vb));

  /* 2 · Record, then Stop */
  await record(p, 2.5);
  const r1 = await p.evaluate(() => { const c = __aogStudio.SONG.tracks[7].clip; return { gum: window.__gum, ended: window.__streams.every(s => s.getTracks().every(t => t.readyState === "ended")),
    voice: c && c.voice, vn: c && c.vn, head: c && +c.head.toFixed(3), sec: c && +c.sec.toFixed(2), start: c && c.startBar, line: document.getElementById("voiceLine").textContent,
    strip: document.querySelector('#mixer .st-strip[data-tr="7"] .st-shn').textContent, played: __aogStudio.PLAY.on }; });
  ok(r1.gum === 1 && r1.ended && r1.voice && r1.vn === 1 && r1.start === 1 && r1.line === "Your voice is on track 8." && /Your voice 1$/.test(r1.strip) && !r1.played,
    "Record asked once; Stop let the microphone go and put Your voice 1 on track 8: " + JSON.stringify(r1));
  ok(r1.head > 0.08 && r1.head < 0.6 && r1.sec > 2, "the take is lined up just after the start bar, where the song began: head " + r1.head + " s");
  /* only track 8 heard: the mix carries the voice */
  await p.click('#mixer .st-strip[data-tr="7"] [data-ms="solo"]');
  await p.click("#mixBtn"); await p.waitForFunction(() => /ready/.test(document.getElementById("mixLine").textContent), null, { timeout: 60000 });
  const hz = await p.evaluate(async () => { const m = __aogStudio.MIX, buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(await m.wav.arrayBuffer()), d = buf.getChannelData(0), sr = buf.sampleRate;
    const a = Math.floor(0.6 * sr), z = Math.floor(1.6 * sr); let up = 0, e = 0; for (let i = a + 1; i < z; i++) { if (d[i - 1] < 0 && d[i] >= 0) up++; e += d[i] * d[i]; } return { hz: Math.round(up / ((z - a) / sr)), db: +(10 * Math.log10(e / (z - a))).toFixed(1) }; });
  ok(Math.abs(hz.hz - 330) < 8 && hz.db > -40, "Make the mix with only track 8 heard carries the voice: " + JSON.stringify(hz));
  await p.click('#mixer .st-strip[data-tr="7"] [data-ms="solo"]');

  /* 3 · Send it out: Your voice on its own */
  await p.click("#outBtn"); await p.waitForFunction(() => __aogStudio.OUT.song && !__aogStudio.OUT.busy, null, { timeout: 60000 });
  await p.click("#voiceOutBtn"); await p.waitForFunction(() => __aogStudio.OUT.voice && !__aogStudio.OUT.busy, null, { timeout: 60000 });
  ok(await p.evaluate(() => __aogStudio.OUT.voice.file.name) === "my-song-voice.wav", "Send it out offers your voice on its own: my-song-voice.wav");

  /* 4 · Delete, then Bring it back */
  await p.selectOption("#trackSel", "7"); await p.waitForTimeout(150);
  const id1 = await p.evaluate(() => __aogStudio.SONG.tracks[7].clip.id);
  await p.click('#clipBox [data-act="off"]'); await p.waitForSelector("#voiceBack", { timeout: 5000 });
  ok(await p.evaluate(() => !__aogStudio.SONG.tracks[7].clip) && (await p.textContent("#voiceBox")).includes("Your voice take is deleted."), "Delete takes it off, and offers to bring it back");
  await p.click("#voiceBack"); await p.waitForFunction(() => __aogStudio.SONG.tracks[7].clip, null, { timeout: 8000 });
  ok(await p.evaluate(() => __aogStudio.SONG.tracks[7].clip.id) === id1 && await p.evaluate(() => __aogStudio.BUF.has(__aogStudio.SONG.tracks[7].clip.id)), "Bring it back returns the same take");
  /* a reload keeps it */
  await p.reload(); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => { const c = __aogStudio.SONG.tracks[7].clip; return !!(c && c.voice && __aogStudio.BUF.has(c.id)); }), "a reload keeps your voice on track 8");
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.selectOption("#trackSel", "7"); await p.waitForTimeout(200);
  ok((await p.textContent("#voiceRec")) === "● Grabar otra vez" && (await p.textContent("#voiceBox")).includes("esta página necesita el micrófono"), "Spanish: " + await p.textContent("#voiceRec"));
  await c.close();

  /* 5 · a refused microphone */
  const d = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(d); await routes(d);
  await d.addInitScript(() => { if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("no", "NotAllowedError"); }; });
  const q = await d.newPage(); await q.goto(U + "music-studio.html"); await q.waitForTimeout(700);
  await q.evaluate(`(async()=>{ const add=${TAKE}; await add(1, [220,220,220,220]); })()`);
  await q.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await put(q, "Guitar take 1", 0);
  await q.selectOption("#trackSel", "7"); await q.click("#voiceRec"); await q.waitForTimeout(400);
  ok((await line(q, "voiceLine")).startsWith("The microphone is not allowed on this page.") && (await q.textContent("#voiceRec")) === "Try again", "a refused microphone is told plainly, with Try again");
  await q.click("#playBtn"); await q.waitForTimeout(400);
  ok(await q.evaluate(() => __aogStudio.PLAY.on), "and the song still plays"); await q.click("#playBtn");
  await d.close();

  /* 6 · in the Studio: My Track marks Voice */
  const e = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(e); await routes(e);
  const s = await e.newPage(); await s.goto(U + "the-studio#studio");
  await s.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /music-studio/.test(d.location.pathname); }, null, { timeout: 20000 });
  await s.waitForTimeout(1000);
  const f = s.frames().find(x => x.parentFrame() === s.mainFrame());
  await f.evaluate(`(async()=>{ const add=${TAKE}; await add(1, [220,220,220,220]); })()`);
  await f.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await put(f, "Guitar take 1", 0);
  ok(await s.evaluate(() => !document.querySelector('#mtList .lay.on[data-layer="voice"]')), "before a voice take, My Track's Voice is not marked");
  await f.selectOption("#trackSel", "7"); await record(f, 1.5);
  await s.waitForFunction(() => !!document.querySelector('#mtList .lay.on[data-layer="voice"]'), null, { timeout: 8000 });
  ok(true, "in the Studio, a voice take marks My Track's Voice");
  await e.close();

  /* 7 · an iPhone, light and dark */
  for (const theme of ["light", "dark"]) {
    const cx = await b.newContext({ ...pw.devices["iPhone 13"], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    await m.selectOption("#trackSel", "7"); await m.locator("#voiceBox").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const fit = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), bt = document.getElementById("voiceRec"); return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, btn: Math.round(r(bt).height), right: Math.round(r(bt).right) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(fit.sw <= fit.iw && fit.right <= fit.iw && fit.btn >= 44 && !pc.length && !pk.length, `iPhone, ${theme}: fits (${JSON.stringify(fit)}), reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
