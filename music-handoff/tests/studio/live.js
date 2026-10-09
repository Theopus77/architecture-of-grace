/* AOG-LIVEINPUT-V1 — STUDIO-HANDOFF §10b, §10c: a real guitar or bass through a cable, and a free tuner. With Chromium's
   pretend input fed a steady tone: the Guitar page never asks for the input on load; Plug in your guitar names the three
   ways in and says the recording stays here; Turn on the input asks once, with the call-processing off; the delay through
   the page is shown. ● Record my guitar counts in, keeps the clean and the toned take, and puts the toned one on My
   Track (the Mixing Desk's list, marked live, the clean take with it), both carrying the 330 Hz note; Delete and Bring it
   back. Tune reads 330 Hz as E, in tune, and does not record; Done tuning keeps the input on; Turn off lets it go. A tone
   at 112 Hz reads as A, about 31 cents sharp; on the Bass, 55 Hz reads as A in tune and only the bass tuning is offered.
   A refused input is told plainly with Try again, and the on-screen guitar still plays. In the Studio, a live take marks
   Live guitar. Spanish; an iPhone, light and dark: nothing sideways, readable and calm; no page errors. Port 9252. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const PORT = 9252, U = "http://localhost:" + PORT + "/";
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
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "live-"));
function tone(hz) { const f = path.join(DIR, "t" + hz + ".wav"), sr = 48000, n = sr * 30, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(10000 * Math.sin(2 * Math.PI * hz * i / sr)), 44 + i * 2); fs.writeFileSync(f, b); return f; }
const launch = hz => pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + tone(hz)] });
const COUNT = () => { window.__gum = []; window.__streams = []; const md = navigator.mediaDevices; if (!md || !md.getUserMedia) return; const g = md.getUserMedia.bind(md);
  md.getUserMedia = async c => { window.__gum.push(JSON.stringify(c)); const s = await g(c); window.__streams.push(s); return s; }; };
const line = p => p.evaluate(() => (document.getElementById("aoglLine") || {}).textContent || "");
/* the loudest steady pitch in a .wav blob, by counting rising zero crossings in its middle */
const HZ = `(async blob => { const b = await new OfflineAudioContext(2, 1, 48000).decodeAudioData(await blob.arrayBuffer()), d = b.getChannelData(0), sr = b.sampleRate;
  const a = Math.floor(d.length * 0.3), z = Math.floor(d.length * 0.7); let up = 0, e = 0; for (let i = a + 1; i < z; i++) { if (d[i - 1] < 0 && d[i] >= 0) up++; e += d[i] * d[i]; }
  return { hz: Math.round(up / ((z - a) / sr)), db: +(10 * Math.log10(e / (z - a) + 1e-12)).toFixed(1), sec: +b.duration.toFixed(2) }; })`;
async function tuneRead(p, ms) { await p.waitForTimeout(ms || 1500); return p.evaluate(() => ({ note: document.querySelector("#aoglTune .al-note").textContent, cents: document.querySelector("#aoglTune .al-cents").textContent,
  inT: document.getElementById("aoglTune").classList.contains("in") })); }

(async () => {
  /* 1 · the guitar, a steady 330 Hz E */
  let b = await launch(330);
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c); await c.addInitScript(COUNT);
  const p = await c.newPage(); await p.goto(U + "music-guitar.html"); await p.waitForTimeout(1200);
  await p.locator("#liveBox").scrollIntoViewIfNeeded();
  const first = await p.evaluate(() => ({ gum: window.__gum.length, text: document.getElementById("liveBox").innerText }));
  ok(first.gum === 0 && first.text.includes("PLUG IN YOUR GUITAR") && first.text.includes("a USB interface, a USB guitar cable, or a microphone in front of your amp") &&
    first.text.includes("To record your guitar, this page needs the input. The recording stays on this device.") && first.text.includes("Turn on the input"),
    "loading never asks for the input, and the panel says the three ways in: " + JSON.stringify(first.gum));
  await p.click("#aoglOn"); await p.waitForFunction(() => window.AOGLive && document.getElementById("aoglOff"), null, { timeout: 10000 });
  const on = await p.evaluate(() => ({ gum: window.__gum, line: document.getElementById("aoglLine").textContent, lat: document.querySelector("#liveBox").innerText.match(/about (\d+) ms/) }));
  const cons = JSON.parse(on.gum[0] || "{}").audio || {};
  ok(on.gum.length === 1 && cons.echoCancellation === false && cons.noiseSuppression === false && cons.autoGainControl === false, "Turn on the input asks once, with the call-processing off: " + on.gum[0]);
  ok(on.line === "Your guitar is in. Play: you hear it through the amp above." && on.lat && +on.lat[1] >= 1, "it says you hear it through the amp, and the delay: " + (on.lat && on.lat[0]));

  /* 2 · ● Record my guitar, then Stop */
  const n0 = await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.length);
  await p.click("#aoglRec");
  await p.waitForFunction(() => /Get ready/.test(document.getElementById("aoglLine").textContent), null, { timeout: 5000 });
  ok(true, "Record counts in: Get ready…");
  await p.waitForFunction(() => /Recording/.test(document.getElementById("aoglLine").textContent), null, { timeout: 8000 });
  await p.waitForTimeout(2500); await p.click("#aoglStop");
  await p.waitForFunction(() => /Added to My Track/.test(document.getElementById("aoglLine").textContent), null, { timeout: 10000 });
  const tk = await p.evaluate(async src => { const r = await AOGHandoff.list(AOGHandoff.INBOX), x = r.items[0], it = await AOGHandoff.item(AOGHandoff.INBOX, x.id), hz = (0, eval)(src);
    return { n: r.items.length, from: x.from, live: x.live, name: x.name.en, sec: x.sec, tone: await hz(it.wav), dry: it.dry ? await hz(it.dry) : null,
      links: [...document.querySelectorAll("#liveBox a[download]")].map(a => a.getAttribute("download") + " " + a.textContent) }; }, HZ);
  ok(tk.n === n0 + 1 && tk.from === "guitar" && tk.live === true && tk.name === "Live guitar take 1" && tk.sec > 1.5, "Stop puts Live guitar take 1 on My Track: " + JSON.stringify({ from: tk.from, live: tk.live, sec: tk.sec }));
  ok(Math.abs(tk.tone.hz - 330) < 10 && tk.tone.db > -45 && tk.dry && Math.abs(tk.dry.hz - 330) < 6 && tk.dry.db > -45, "the toned take and the clean take both carry the note: " + JSON.stringify({ tone: tk.tone, dry: tk.dry }));
  ok(tk.links.join(" | ") === "live-guitar-1.wav Save with the amp (.wav) | live-guitar-1-clean.wav Save the clean take (.wav)", "both can be saved: " + tk.links.join(" | "));
  await p.click("#aoglDel"); await p.waitForSelector("#aoglBack");
  ok(await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.length) === n0 && await line(p) === "The take is deleted.", "Delete takes it out");
  await p.click("#aoglBack"); await p.waitForFunction(() => /Added/.test(document.getElementById("aoglLine").textContent), null, { timeout: 5000 });
  ok(await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items[0].name.en) === "Live guitar take 1", "Bring it back returns it");

  /* 3 · Tune */
  const nT = await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.length);
  await p.click("#aoglTuneBtn"); await p.waitForSelector("#aoglTune");
  let tr = await tuneRead(p);
  ok(tr.note === "E" && tr.inT && tr.cents === "In tune", "Tune reads 330 Hz as E, in tune: " + JSON.stringify(tr));
  ok(await p.evaluate(() => [...document.querySelectorAll("#aoglTuning option")].map(o => o.value).join(" ")) === "std dropd half", "standard first, then drop D and half a step down, behind one menu");
  await p.click("#aoglTuneBtn"); await p.waitForTimeout(300);
  ok(await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.length) === nT && await p.evaluate(() => !!document.getElementById("aoglOff") && !document.getElementById("aoglTune")),
    "Tune records nothing, and Done tuning keeps the input on");
  await p.click("#aoglOff"); await p.waitForTimeout(200);
  ok(await p.evaluate(() => window.__streams.every(s => s.getTracks().every(t => t.readyState === "ended"))), "Turn off the input lets it go");
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(200);
  ok((await p.textContent("#aoglOn")) === "Encender la entrada" && (await p.textContent("#aoglH")) === "Conecta tu guitarra", "Spanish: " + await p.textContent("#aoglH"));
  await c.close();

  /* 4 · in the Studio, a live take marks Live guitar */
  const e = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(e); await routes(e);
  const s = await e.newPage(); await s.goto(U + "the-studio#guitar");
  await s.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /music-guitar/.test(d.location.pathname); }, null, { timeout: 20000 });
  await s.waitForTimeout(1200);
  const f = s.frames().find(x => x.parentFrame() === s.mainFrame());
  await f.click("#aoglOn"); await f.waitForSelector("#aoglRec", { timeout: 10000 });
  await f.click("#aoglRec"); await f.waitForFunction(() => /Recording/.test(document.getElementById("aoglLine").textContent), null, { timeout: 8000 });
  await s.waitForTimeout(1200); await f.click("#aoglStop");
  await s.waitForFunction(() => !!document.querySelector('#mtList .lay.on[data-layer="liveguitar"]'), null, { timeout: 10000 });
  ok(await s.evaluate(() => !document.querySelector('#mtList .lay.on[data-layer="guitar"]')), "in the Studio, a live take marks Live guitar (and not the on-screen Guitar)");
  await e.close(); await b.close();

  /* 5 · 112 Hz reads as A, sharp */
  b = await launch(112);
  const g = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(g); await routes(g);
  const q = await g.newPage(); await q.goto(U + "music-guitar.html"); await q.waitForTimeout(1200);
  await q.click("#aoglTuneBtn"); await q.waitForSelector("#aoglTune", { timeout: 10000 });
  tr = await tuneRead(q); const cn = +(tr.cents.match(/(\d+) cents sharp/) || [0, -1])[1];
  ok(tr.note === "A" && !tr.inT && cn >= 26 && cn <= 36 && /loosen it a little/.test(tr.cents), "112 Hz reads as A, about 31 cents sharp: " + JSON.stringify(tr));
  /* 6 · a refused input */
  const h = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(h); await routes(h);
  await h.addInitScript(() => { if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("no", "NotAllowedError"); }; });
  const r = await h.newPage(); await r.goto(U + "music-guitar.html"); await r.waitForTimeout(1200);
  await r.click("#aoglOn"); await r.waitForTimeout(400);
  ok((await line(r)).startsWith("The input is not allowed on this page.") && (await r.textContent("#aoglOn")) === "Try again", "a refused input is told plainly, with Try again");
  await r.evaluate(() => { const b = document.querySelector("#chordStrip button, .cstrip button"); if (b) b.click(); }); await r.waitForTimeout(300);
  await b.close();

  /* 7 · the bass, 55 Hz */
  b = await launch(55);
  const k = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(k); await routes(k);
  const m = await k.newPage(); await m.goto(U + "music-bass.html"); await m.waitForTimeout(1200);
  await m.click("#aoglTuneBtn"); await m.waitForSelector("#aoglTune", { timeout: 10000 });
  tr = await tuneRead(m, 2000);
  ok(tr.note === "A" && tr.inT && await m.evaluate(() => [...document.querySelectorAll("#aoglTuning option")].map(o => o.value).join(" ")) === "bass" && (await m.textContent("#aoglH")) === "Plug in your bass",
    "on the Bass, 55 Hz reads as A in tune, and only the bass tuning is offered: " + JSON.stringify(tr));
  await k.close();

  /* 8 · an iPhone, light and dark, the input on and the tuner open */
  for (const theme of ["light", "dark"]) {
    const cx = await b.newContext({ ...pw.devices["iPhone 13"], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const v = await cx.newPage(); await v.goto(U + "music-bass.html"); await v.waitForTimeout(1200);
    await v.click("#aoglTuneBtn"); await v.waitForSelector("#aoglTune", { timeout: 10000 }); await v.waitForTimeout(800);
    await v.locator("#liveBox").scrollIntoViewIfNeeded(); await v.waitForTimeout(200);
    const fit = await v.evaluate(() => { const r = el => el.getBoundingClientRect(), bt = [...document.querySelectorAll("#liveBox button, #liveBox select")].filter(x => x.offsetParent);
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, min: Math.min(...bt.map(x => Math.round(r(x).height))), right: Math.max(...bt.map(x => Math.round(r(x).right))) }; });
    const pc = await v.evaluate(`(${PROBE})()`), pk = await v.evaluate(`(${CALM})()`);
    ok(fit.sw <= fit.iw && fit.right <= fit.iw && fit.min >= 44 && !pc.length && !pk.length, `iPhone, ${theme}: fits (${JSON.stringify(fit)}), reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
