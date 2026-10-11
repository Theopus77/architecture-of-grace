/* AOG-OVERDUB-V1 (2026-10-11) — Jimmy's "1": "Record over your song. In any room, press Record and hear My Track playing
   while you play. The new take lands on the right bar." My Track holds a drum take (a click on every bar line, at the song's
   120). On the piano, ● Record with ♫ With My Track on: the Studio gets My Track from the Mixing Desk (opened out of sight),
   four clicks, then My Track plays from the bar picked; a note played on bar 3 makes a take that starts exactly on bar 3's
   line, with none of My Track or the clicks in it; + Add to My Track puts it on its own track at bar 3 (the drums stay);
   From bar 5 places a note on bar 5; a beat playing on the Drum Machine starts again on the bar line; ♫ With My Track off
   makes a take as before. Spanish. No page errors. Port 9270. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path");
const PORT = 9270, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
async function ctxOf(b) {
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } });
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  return c;
}
async function arrived(p, file) {
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, file, { timeout: 30000 });
  await p.waitForTimeout(700);
}
const door = async (p, id, file) => { await p.click('.sh-doors a[data-room="' + id + '"]'); await arrived(p, file); };
const R = async (p, fn, arg) => { const f = await (await p.$("#room")).contentFrame(); return f.evaluate(([src, a]) => (new Function("a", "return (" + src + ")(a)"))(a), [fn.toString(), arg]); };
/* a drum take on My Track: 50 ms of quiet (the desk's lead-in for a take), then a click on every bar line at 120 (2 s a bar), 8 bars */
const DRUMS = () => { const sr = 44100, n = Math.round(sr * (0.05 + 16.5)), ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
  for (let k = 0; k < 8; k++) { const s0 = Math.round(sr * (0.05 + 2 * k)); for (let i = 0; i < 2000; i++) { const x = Math.round(12000 * Math.sin(i / 3) * Math.exp(-i / 400)); v.setInt16(44 + (s0 + i) * 4, x, true); v.setInt16(46 + (s0 + i) * 4, x, true); } }
  return AOGHandoff.add(AOGHandoff.INBOX, { from: "pads", n: 1, name: { en: "Drum take 1", es: "Toma de ritmos 1" }, sec: n / sr, bpm: 120, at: Date.now(), take: true, wav: new Blob([ab], { type: "audio/wav" }) }, { key: "od|drums" }); };
/* Record over My Track; play one piano note when bar `bar` is heard; stop after it */
async function overTake(p, bar) {
  await R(p, () => AOGStudioRec.toggle());
  await p.waitForFunction(() => { const f = document.getElementById("room").contentWindow; return f.AOGStudioRec.on(); }, null, { timeout: 30000 });
  const o = await R(p, () => { const O = REC.over; return O ? { S0: O.S0, from: O.from, barSec: O.barSec, bpm: O.bpm, lat: O.lat, now: ac.currentTime, line: document.getElementById("recLine").textContent } : null; });
  if (!o) return { o: null };
  await R(p, a => { const when = a.o.S0 + (a.bar - a.o.from) * a.o.barSec + a.o.lat + 0.01;   /* played 10 ms after the bar line, as a hand would */ const vc = makeVoice(ac, LIVE_CH, S.sound, 60, 0.85, when); if (vc) vc.stop(when + 0.6, vc.tau); }, { o, bar });
  const until = o.S0 + (bar - o.from + 0.6) * o.barSec + o.lat;
  for (let k = 0; k < 300 && (await R(p, () => ac.currentTime)) < until; k++) await p.waitForTimeout(100);
  await R(p, () => AOGStudioRec.toggle());
  await p.waitForFunction(() => { const r = document.getElementById("room").contentWindow.AOGStudioRec; return !r.on() && !r.busy(); }, null, { timeout: 8000 });
  await p.waitForTimeout(500);
  /* the take: where it is placed, and where its first sound is in it */
  const t = await R(p, async () => { const k = REC.takes[0], ab = await k.blob.arrayBuffer(), dv = new DataView(ab), sr = dv.getUint32(24, true), n = (ab.byteLength - 44) >> 2;
    let on = -1; for (let i = 0; i < n; i++) { const l = dv.getInt16(44 + i * 4, true); if (l > 300 || l < -300) { on = i; break; } }
    return { place: k.place, n: k.n, sec: k.sec, firstMs: on < 0 ? null : on / sr * 1000, line: document.getElementById("recLine").textContent }; });
  return { o, t };
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await ctxOf(b), p = await c.newPage();
  await p.goto(U + "the-studio#piano"); await arrived(p, "music-piano.html");
  await p.evaluate(() => AOGSong.set({ bpm: 120 }));
  await p.evaluate(DRUMS);
  await p.click("#tpSong");
  const bar = await p.evaluate(() => ({ over: document.getElementById("tpOver").textContent, pressed: document.getElementById("tpOver").getAttribute("aria-pressed"), from: document.getElementById("tpFrom").value, hidden: document.getElementById("tpFrom").parentNode.hidden }));
  ok(bar.over === "♫ Play My Track while I record: On" && bar.pressed === "true" && bar.from === "1" && !bar.hidden, "in the Song panel: Play My Track while I record, on, from the start: " + JSON.stringify(bar));

  /* 1 · a note on bar 3 */
  let r = await overTake(p, 3);
  ok(r.o && r.o.bpm === 120 && Math.abs(r.o.barSec - 2) < 1e-6 && r.o.from === 1 && /^Four clicks, then My Track plays\./.test(r.o.line), "Record got My Track from the desk (120, 2 s a bar) and counts in: " + JSON.stringify(r.o));
  ok(r.t && r.t.place && r.t.place.bar === 3 && r.t.place.bpm === 120, "a note played on bar 3 makes a take placed on bar 3: " + JSON.stringify(r.t && r.t.place));
  ok(r.t && r.t.firstMs != null && r.t.firstMs > 5 && r.t.firstMs < 40, "the take starts right on bar 3's line, its note " + (r.t && r.t.firstMs && r.t.firstMs.toFixed(1)) + " ms in, with none of My Track or the clicks before it");
  ok(r.t && /^Take \d+ comes in at bar 3\. Add it to My Track and it goes right there\.$/.test(r.t.line), "the room says so: " + (r.t && r.t.line));
  const ms3 = r.t && r.t.firstMs;   /* the note is played 10 ms after the line; the piano's own attack adds a little: the same every time */
  const frames = await p.evaluate(() => [...document.querySelectorAll("iframe.sh-room")].map(f => f.getAttribute("data-file")).sort().join(" "));
  ok(/music-studio\.html/.test(frames) && await p.evaluate(() => location.hash) === "#piano", "the desk was opened out of sight; you stay at the piano: " + frames);

  /* 2 · + Add to My Track: on its own track at bar 3, the drums stay */
  await p.click("#tpAdd"); await p.waitForTimeout(1200);
  const item = await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.find(x => x.from === "piano"));
  ok(item && item.place && item.place.bar === 3, "the take goes to My Track with its bar: " + JSON.stringify(item && item.place));
  await p.evaluate(() => { const f = [...document.querySelectorAll("iframe.sh-room")].find(x => x.getAttribute("data-file") === "/music-studio.html"); return f.contentWindow.__aogStudio.listenFill(); });
  const desk = await p.evaluate(() => { const f = [...document.querySelectorAll("iframe.sh-room")].find(x => x.getAttribute("data-file") === "/music-studio.html"), st = f.contentWindow.__aogStudio;
    return st.SONG.tracks.map((x, i) => x.clip ? { i, layer: x.clip.layer, bar: x.clip.startBar, head: x.clip.head, bpm: x.clip.bpm } : null).filter(Boolean); });
  const pc = desk.find(x => x.layer === "piano:over"), dr = desk.find(x => x.layer === "pads");
  ok(pc && pc.bar === 3 && pc.head === 0 && pc.bpm === 120 && dr && dr.bar === 1, "at the desk it sits on its own track at bar 3, no lead-in, and the drums stay on theirs: " + JSON.stringify(desk));

  /* 3 · From bar 5 */
  await p.selectOption("#tpFrom", "5");
  r = await overTake(p, 5);
  ok(r.o && r.o.from === 5 && r.t && r.t.place && r.t.place.bar === 5 && Math.abs(r.t.firstMs - ms3) < 1.5, (r.t && Math.abs(r.t.firstMs - ms3) < 1.5 ? "" : "NOT THE SAME DELAY ") + "From bar 5: My Track starts at bar 5, and a note there lands on bar 5, as far after the line as on bar 3: " + JSON.stringify({ o: r.o && r.o.from, t: r.t && r.t.place, ms: r.t && r.t.firstMs }));
  await p.selectOption("#tpFrom", "1");

  /* 4 · a beat playing on the Drum Machine starts again on the bar line */
  await p.click("#songDone");
  await door(p, "pads", "music-pads.html");
  await R(p, () => play()); await p.waitForTimeout(600);
  await R(p, () => AOGStudioRec.toggle());
  await p.waitForFunction(() => document.getElementById("room").contentWindow.AOGStudioRec.on(), null, { timeout: 30000 });
  const al = await R(p, () => ({ t0: SEQ.t0, S0: REC.over && REC.over.S0, on: SEQ.on }));
  ok(al.on && al.S0 && Math.abs(al.t0 - al.S0) < 1e-6, "the Drum Machine's loop starts again on My Track's first bar line: " + JSON.stringify(al));
  await R(p, () => AOGStudioRec.toggle()); await p.waitForTimeout(1500); await R(p, () => stop());

  /* 5 · ♫ With My Track off: a take as before */
  await door(p, "piano", "music-piano.html");
  await p.click("#tpSong"); await p.click("#tpOver");
  ok(await p.evaluate(() => document.getElementById("tpOver").getAttribute("aria-pressed") === "false" && document.getElementById("tpFrom").parentNode.hidden && JSON.parse(localStorage.getItem("aog.overdub.v1")).on === false && /: Off$/.test(document.getElementById("tpOver").textContent)), "Play My Track while I record turns off (and where it starts hides), remembered on this device");
  await R(p, () => AOGStudioRec.toggle()); await p.waitForTimeout(300);
  const over0 = await R(p, () => !!REC.over);
  await R(p, () => noteOn("k", 64, 0.8)); await p.waitForTimeout(600); await R(p, () => noteOff("k", 64));
  await R(p, () => AOGStudioRec.toggle());
  await p.waitForFunction(() => { const r = document.getElementById("room").contentWindow.AOGStudioRec; return !r.on() && !r.busy(); }, null, { timeout: 8000 }); await p.waitForTimeout(400);
  const plain = await R(p, () => ({ place: REC.takes[0].place, line: document.getElementById("recLine").textContent }));
  ok(!over0 && !plain.place, "off, Record makes a take as before, with no place: " + JSON.stringify(plain));
  await p.click("#tpOver");

  /* 6 · Spanish */
  await p.click('.sh-lang button[data-lang="es"]'); await p.waitForTimeout(1500);
  if (await p.evaluate(() => document.getElementById("songBox").hidden)) await p.click("#tpSong");
  const es = await p.evaluate(() => ({ over: document.getElementById("tpOver").textContent, from: document.getElementById("tpFrom").options[0].textContent, five: document.getElementById("tpFrom").options[1].textContent }));
  ok(es.over === "♫ Tocar mi pista mientras grabo: Sí" && es.from === "Desde el principio" && es.five === "Desde el compás 5", "in Spanish: " + JSON.stringify(es));

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
