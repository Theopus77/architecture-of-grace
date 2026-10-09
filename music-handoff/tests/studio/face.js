/* AOG-DESK-FACE-V1 — Jimmy's drawing of the Mixing Desk: "May the recording studio look something this amazing?"
   With four takes on the desk: the lanes are named for their instrument (Drums, Piano, Guitar, Bass; Empty; Voice on 8)
   and each wave is drawn in its lane; a round ▶ starts and stops the song, and the playhead steps across the lanes and
   rests where the song starts when it stops; the open channel names the chosen track in gold, with its wave; its Mute and
   Solo, its volume and Shape the sound (pan) change that track exactly as the mixer below does, and the mixer shows it;
   its fader reads in decibels (80 is 0 dB); the eight short faders set each track's volume, and a fader's number picks the track (gold); the lesson is on a paper
   slip that follows the lesson; Spanish; an iPhone and an iPad, light and dark: readable, calm, nothing sideways; inside
   the Recording Studio the ▶ is on the first screen. No page errors. Port 9256. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9256, U = "http://localhost:" + PORT + "/";
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
/* a take made in the page: hits that fade, like a real instrument */
const addTake = (p, from, hz, sec) => p.evaluate(async ([from, hz, sec]) => {
  const sr = 48000, n = sr * sec, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) { const tt = (i / sr) % 0.5; v.setInt16(44 + i * 2, Math.round(Math.sin(2 * Math.PI * hz * i / sr) * 14000 * Math.exp(-tt * 6) * Math.min(1, tt * 300)), true); }
  const at = Date.now(); await AOGHandoff.add(AOGHandoff.INBOX, { from, n: 1, name: from, sec, bpm: 120, at, take: true, wav: new Blob([b], { type: "audio/wav" }) }, { key: from + "|" + at });
}, [from, hz, sec]);
async function fourTakes(p) {
  await addTake(p, "pads", 110, 8); await addTake(p, "piano", 262, 6); await addTake(p, "guitar", 330, 4); await addTake(p, "bass", 82, 8);
  await p.evaluate(() => __aogStudio.listenFill()); await p.waitForFunction(() => !__aogStudio.S.busy && __aogStudio.SONG.tracks[3].clip, null, { timeout: 20000 });
  await p.waitForTimeout(500);
}
const face = p => p.evaluate(() => ({
  lanes: [...document.querySelectorAll("#timeline .st-lnm")].map(e => e.textContent).join(","),
  waves: [...document.querySelectorAll("#timeline .st-lane")].map(l => l.querySelectorAll(".st-clip svg.wv path").length).join(""),
  ch: document.querySelector("#chStrip .st-chn").textContent, chWave: !!document.querySelector("#chStrip .st-chw svg.wv path"),
  sel: [...document.querySelectorAll("#chFaders .st-f1.sel")].map(e => e.getAttribute("data-tr")).join(),
  ph: +getComputedStyle(document.getElementById("timeline")).getPropertyValue("--ph") || 0,
  slip: document.getElementById("slip").hidden ? "" : document.getElementById("slip").textContent
}));
const setRange = (p, sel, v) => p.evaluate(([sel, v]) => { const r = document.querySelector(sel); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); }, [sel, v]);

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "music-studio.html"); await p.waitForTimeout(1500);
  await fourTakes(p);
  let f = await face(p);
  ok(f.lanes === "Drums,Piano,Guitar,Bass,Empty,Empty,Empty,Voice" && f.waves === "11110000", "the lanes are named for their instrument, each take drawn as its wave: " + f.lanes + " / " + f.waves);
  ok(f.ch === "Drums" && f.chWave && f.sel === "0", "the open channel is Drums, gold, with its wave; fader 1 is gold");
  /* ▶ and the playhead */
  const ph0 = f.ph;
  await p.click("#playBtn"); await p.waitForTimeout(2600);
  const mid = await face(p);
  ok(await p.evaluate(() => __aogStudio.PLAY.on && document.getElementById("playBtn").classList.contains("on")) && mid.ph > ph0 + 0.02, `the round ▶ plays, and the playhead steps across the lanes (${ph0} → ${mid.ph})`);
  await p.click("#playBtn"); await p.waitForTimeout(400);
  ok(!(await p.evaluate(() => __aogStudio.PLAY.on)) && (await face(p)).ph === ph0, "■ stops it, and the playhead goes back to where the song starts");
  /* the open channel: Mute, Solo, volume, Shape the sound — the same as the mixer below */
  await p.click('.st-f1[data-tr="2"] .st-fn'); await p.waitForTimeout(300);
  f = await face(p);
  ok(f.ch === "Guitar" && f.sel === "2" && await p.evaluate(() => __aogStudio.SONG.sel === 2), "fader 3's number picks the Guitar: the open channel follows and fader 3 is gold");
  await p.click('#chStrip [data-cms="mute"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => __aogStudio.SONG.tracks[2].mute && document.querySelector('#mixer .st-strip[data-tr="2"] [data-ms="mute"]').getAttribute("aria-pressed") === "true" && document.querySelector('#chStrip [data-cms="mute"]').getAttribute("aria-pressed") === "true"),
    "Mute in the open channel mutes the guitar, and the mixer below shows it");
  await p.click('#chStrip [data-cms="mute"]'); await p.click('#chStrip [data-cms="solo"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !__aogStudio.SONG.tracks[2].mute && __aogStudio.SONG.tracks[2].solo && document.querySelectorAll("#chFaders .st-f1.off").length === 7), "Solo plays only the guitar: the other seven faders dim");
  await p.click('#chStrip [data-cms="solo"]');
  await setRange(p, "#cv-vol", 35); await p.waitForTimeout(200);
  ok(await p.evaluate(() => __aogStudio.SONG.tracks[2].vol === 35 && +document.getElementById("t2-vol").value === 35 && +document.getElementById("fv2").value === 35 && document.getElementById("cv-vol-o").textContent === "−14 dB"),
    "the open channel's fader sets the guitar to 35 (−14 dB): the mixer's slider and fader 3 move with it");
  await setRange(p, "#fv1", 60); await p.waitForTimeout(200);
  ok(await p.evaluate(() => __aogStudio.SONG.tracks[1].vol === 60 && +document.getElementById("t1-vol").value === 60), "fader 2 sets the piano to 60");
  await p.click("#chShape > summary"); await setRange(p, "#cs-pan", -40); await p.waitForTimeout(200);
  ok(await p.evaluate(() => __aogStudio.SONG.tracks[2].pan === -40 && +document.getElementById("t2-pan").value === -40), "Shape the sound opens; its pan moves the guitar left, as the mixer's does");
  await setRange(p, "#t2-vol", 70); await p.waitForTimeout(200);
  ok(await p.evaluate(() => +document.getElementById("fv2").value === 70 && +document.getElementById("cv-vol").value === 70), "a slider moved on the mixer itself shows on the console too");
  /* a reload keeps it all */
  await p.reload(); await p.waitForTimeout(2000); await p.waitForFunction(() => !__aogStudio.S.decoding, null, { timeout: 20000 });
  ok(await p.evaluate(() => __aogStudio.SONG.tracks[2].vol === 70 && __aogStudio.SONG.tracks[2].pan === -40 && +document.getElementById("fv1").value === 60 && document.querySelector("#chStrip .st-chn").textContent === "Guitar"), "a reload keeps the volumes, the pan and the open channel");
  /* the paper slip */
  f = await face(p);
  ok(/^Lesson \d+ · .+All lessons ›$/.test(f.slip), "the lesson is on a paper slip: " + f.slip);
  await p.evaluate(() => { const b = [...document.querySelectorAll("button, a")].find(x => x.textContent.trim() === "ES"); if (b) b.click(); }); await p.waitForTimeout(800);
  f = await face(p);
  ok(f.lanes === "Ritmos,Piano,Guitarra,Bajo,Vacía,Vacía,Vacía,Voz" && f.ch === "Guitarra" && /^Lección \d+ · .+Todas las lecciones ›$/.test(f.slip) && await p.textContent("#chShape > summary") === "Dale forma al sonido",
    "in Spanish: " + f.lanes + " · " + f.ch + " · " + f.slip.slice(0, 40));
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* an iPhone and an iPad, light and dark; the Recording Studio */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(1500);
    await fourTakes(m);
    await m.evaluate(() => { document.getElementById("chShape").open = true; document.getElementById("playMore").open = true; document.getElementById("desk").scrollIntoView(); });
    await m.waitForTimeout(300);
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`), sw = await m.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1);
    const fit = await m.evaluate(() => { const r = [...document.querySelectorAll("#chFaders .st-fn")].map(e => e.getBoundingClientRect()); const d = document.querySelector("#desk .st-cp").getBoundingClientRect();
      return r.every(q => q.width >= 36 && q.height >= 40 && q.right <= d.right + 1); });
    ok(sw && fit && !pc.length && !pk.length, `${dev}, ${theme}: nothing sideways, the eight faders fit (${fit}), reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    if (theme === "light") {
      await m.goto(U + "the-studio#studio");
      await m.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, null, { timeout: 20000 });
      await m.waitForTimeout(1500);
      const fr = m.frames().find(x => x.parentFrame() === m.mainFrame());
      const top = await fr.evaluate(() => { const r = document.getElementById("playBtn").getBoundingClientRect(); return { b: r.bottom, ih: innerHeight }; });
      ok(top.b < top.ih * 0.6, `${dev}: in the Recording Studio the ▶ is on the first screen (${Math.round(top.b)} of ${top.ih})`);
    }
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the iPhone or the iPad " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
