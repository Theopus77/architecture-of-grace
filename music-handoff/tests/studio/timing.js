/* AOG-LATENCY-V1 (2026-10-11) — Jimmy's "3": "A one-tap timing check. The site makes a click and the mic listens for it.
   That measures your iPad's real delay, so overdubs and your voice line up exactly." In the Studio's Song panel, Check
   plays six clicks and hears them back: here through a known 37 ms delay in place of a speaker and a microphone. It finds
   the delay, says it in plain words, keeps it on the device, and agrees with itself when checked again; clicks it cannot
   hear keep nothing and say what to try; the voice at the Mixing Desk is then moved by exactly that much; Spanish.
   No page errors. Port 9271. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path");
const PORT = 9271, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
async function arrived(p, file) {
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, file, { timeout: 30000 });
  await p.waitForTimeout(700);
}
const LOOP = ms => `AOGLatency._loop = (c, out) => { const d = c.createDelay(1); d.delayTime.value = ${ms / 1000}; const m = c.createMediaStreamDestination(); out.connect(d); d.connect(m); return m.stream; };`;
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const c = await b.newContext({ viewport: { width: 1366, height: 900 }, permissions: ["microphone"] });
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  const p = await c.newPage();
  await p.goto(U + "the-studio#piano"); await arrived(p, "music-piano.html");
  await p.click("#tpSong");
  let w = await p.evaluate(() => ({ h: document.getElementById("latH").textContent, say: document.getElementById("latSay").textContent, go: document.getElementById("latGo").textContent, line: document.getElementById("latLine").textContent }));
  ok(w.h === "Timing check" && /^So your voice and a real guitar land in time\./.test(w.say) && w.go === "Check" && w.line === "", "the Song panel has the Timing check, not checked yet: " + JSON.stringify(w));
  /* a 37 ms round trip */
  await p.evaluate(LOOP(37));
  await p.click("#latGo");
  ok(await p.evaluate(() => document.getElementById("latGo").textContent) === "Listening…", "while it listens the button says so");
  await p.waitForFunction(() => /ms to play a sound/.test(document.getElementById("latLine").textContent) || /not heard clearly/.test(document.getElementById("latLine").textContent), null, { timeout: 20000 });
  w = await p.evaluate(() => ({ line: document.getElementById("latLine").textContent, kept: JSON.parse(localStorage.getItem("aog.latency.v1")), go: document.getElementById("latGo").textContent }));
  const ms = Math.round(w.kept && w.kept.rt * 1000);
  ok(w.kept && ms >= 37 && ms <= 70 && w.line === `This device takes ${ms} ms to play a sound and hear it back. Takes are moved that much, so they line up.` && w.go === "Check again",
    "it finds the 37 ms trip (plus the browser's own few ms): " + JSON.stringify(w));
  /* again: it agrees with itself */
  await p.click("#latGo");
  await p.waitForFunction(() => document.getElementById("latGo").textContent === "Check again", null, { timeout: 20000 });
  const again = await p.evaluate(() => JSON.parse(localStorage.getItem("aog.latency.v1")).rt * 1000);
  ok(Math.abs(again - w.kept.rt * 1000) < 3, `checked again, ${again.toFixed(1)} ms, within 3 ms of the first`);
  /* 80 ms more makes 80 ms more */
  await p.evaluate(LOOP(117)); await p.click("#latGo");
  await p.waitForFunction(() => document.getElementById("latGo").textContent === "Check again", null, { timeout: 20000 });
  const more = await p.evaluate(() => JSON.parse(localStorage.getItem("aog.latency.v1")).rt * 1000);
  ok(Math.abs(more - again - 80) < 3, `a trip 80 ms longer reads ${(more - again).toFixed(1)} ms longer`);
  /* nothing heard: nothing kept, and it says what to try */
  await p.evaluate(() => { AOGLatency._loop = c => c.createMediaStreamDestination().stream; });
  await p.click("#latGo");
  await p.waitForFunction(() => /not heard clearly/.test(document.getElementById("latLine").textContent), null, { timeout: 20000 });
  ok(Math.abs(await p.evaluate(() => JSON.parse(localStorage.getItem("aog.latency.v1")).rt * 1000) - more) < 0.01, "clicks it cannot hear keep nothing new, and it says: " + await p.evaluate(() => document.getElementById("latLine").textContent));
  /* the voice at the Mixing Desk is moved by the measured trip */
  await p.evaluate(LOOP(37)); await p.click("#latGo");
  await p.waitForFunction(() => document.getElementById("latGo").textContent === "Check again" && /ms to play/.test(document.getElementById("latLine").textContent), null, { timeout: 20000 });
  const rt = await p.evaluate(() => JSON.parse(localStorage.getItem("aog.latency.v1")).rt);
  await p.click("#songDone");
  await p.click('.sh-doors a[data-room="studio"]'); await arrived(p, "music-studio.html");
  const f = await (await p.$("#room")).contentFrame();
  await f.evaluate(() => { __aogStudio.voiceStart(); });
  await f.waitForFunction(() => __aogStudio.VOICE.rec, null, { timeout: 15000 });
  const vl = await f.evaluate(() => __aogStudio.VOICE.lat);
  await f.evaluate(() => __aogStudio.voiceStop());
  ok(Math.abs(vl - rt) < 1e-9, `your voice is moved by the measured trip: ${(vl * 1000).toFixed(1)} ms`);
  /* Spanish */
  await p.click('.sh-lang button[data-lang="es"]'); await p.waitForTimeout(900); await p.click("#tpSong");
  w = await p.evaluate(() => ({ h: document.getElementById("latH").textContent, go: document.getElementById("latGo").textContent, line: document.getElementById("latLine").textContent }));
  ok(w.h === "Prueba de tiempo" && w.go === "Probar otra vez" && /^Este aparato tarda \d+ ms en tocar un sonido y oírlo de vuelta\./.test(w.line), "in Spanish: " + JSON.stringify(w));
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
