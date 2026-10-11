/* AOG-REC-KEEP-V1 · AOG-STUDIO-KEEP-TAKES-V1 · AOG-ADD-LAYER-TAKE-V1 · AOG-LISTEN-FULL-V1 (2026-10-11) — Jimmy: "Do the
   fixes first." Nothing you make in the Studio is lost without a word:
   A · a take made in a room comes back when the room opens again: after the Studio closed it (it keeps three rooms open),
       after a reload; a room left while it records ends the take and keeps it; a room whose takes cannot be kept on the
       device and are not on My Track is never closed; Delete takes a take out of the device's storage too.
   B · + Add a layer puts the take you just made on My Track, then opens the room you picked, and says so; a take already
       on My Track is not sent again.
   C · My Track's layers beyond the desk's seven tracks are named when you press Listen, never just left out.
   No page errors. Port 9264. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path");
const PORT = 9264, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
async function ctxOf(b) {
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } });
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  /* the room in sight: the Studio keeps rooms open in frames of their own, out of sight */
  await c.addInitScript(() => { window.VIS = () => [...document.querySelectorAll("iframe.sh-room")].find(f => f.style.display !== "none"); });
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  return c;
}
async function arrived(p, file) {
  await p.waitForFunction(f => { const fr = VIS(), d = fr.contentDocument;
    return fr.getAttribute("data-file") === "/" + f && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, file, { timeout: 30000 });
  await p.waitForTimeout(500);
}
const door = async (p, id, file) => { await p.click('.sh-doors a[data-room="' + id + '"]'); await arrived(p, file); };
const R = (p, fn, arg) => p.evaluate(([fn, arg]) => { const w = VIS().contentWindow; return (new Function("w", "arg", "return (" + fn + ")(w, arg)"))(w, arg); }, [fn.toString(), arg]);
/* a take on the piano: Record, a note, Stop */
async function take(p) {
  await R(p, w => w.AOGStudioRec.toggle()); await p.waitForTimeout(400);
  await R(p, w => w.noteOn("p", 60, 0.8)); await p.waitForTimeout(700);
  await R(p, w => w.AOGStudioRec.toggle());
  await p.waitForFunction(() => { const r = VIS().contentWindow.AOGStudioRec; return !r.on() && !r.busy() && r.last(); }, null, { timeout: 8000 });
  await p.waitForTimeout(600);
}
const frames = p => p.evaluate(() => [...document.querySelectorAll("iframe.sh-room")].map(f => f.getAttribute("data-file")).sort().join(" "));
const wav = () => { const n = 44100, ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, 44100, true); v.setUint32(28, 176400, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { const x = Math.round(8000 * Math.sin(i / 20)); v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  return new Blob([ab], { type: "audio/wav" }); };

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* A · a take comes back after the Studio closed its room, and after a reload */
  let c = await ctxOf(b), p = await c.newPage();
  await p.goto(U + "the-studio#piano"); await arrived(p, "music-piano.html");
  await take(p);
  let t1 = await R(p, w => ({ last: w.AOGStudioRec.last(), sent: w.AOGStudioRec.sent(), kept: w.AOGStudioRec.kept(), line: w.document.getElementById("recLine").textContent }));
  ok(t1.last && t1.last.sec > 0.4 && !t1.sent && t1.kept, "a take on the piano, not on My Track yet, kept on the device: " + JSON.stringify(t1));
  ok(/stay on this device, even when you leave/.test(t1.line), "the room says the takes stay: " + t1.line);
  await door(p, "guitar", "music-guitar.html"); await door(p, "bass", "music-bass.html"); await door(p, "band", "music-band.html");
  ok(!/music-piano/.test(await frames(p)), "three other rooms later, the Studio closed the piano: " + await frames(p));
  await door(p, "piano", "music-piano.html");
  await p.waitForFunction(() => VIS().contentWindow.AOGStudioRec.last(), null, { timeout: 8000 }).catch(() => {});
  let t2 = await R(p, w => ({ last: w.AOGStudioRec.last(), list: w.document.querySelectorAll("#takes .aogrec-take").length }));
  ok(t2.last && t2.last.n === t1.last.n && Math.abs(t2.last.sec - t1.last.sec) < 0.01 && t2.list === 1, "the piano opens again with its take: " + JSON.stringify(t2));
  await p.reload(); await arrived(p, "music-piano.html");
  await p.waitForFunction(() => VIS().contentWindow.AOGStudioRec.last(), null, { timeout: 8000 }).catch(() => {});
  t2 = await R(p, w => w.AOGStudioRec.last());
  ok(t2 && t2.n === t1.last.n, "and after a reload: " + JSON.stringify(t2));
  /* the next take is number 2, not 1 again */
  await take(p);
  t2 = await R(p, w => ({ last: w.AOGStudioRec.last(), n: w.document.querySelectorAll("#takes .aogrec-take").length }));
  ok(t2.last.n === t1.last.n + 1 && t2.n === 2, "the next take is take " + t2.last.n + ", and both are listed");
  /* Delete takes it out of the device's storage too */
  await R(p, (w, n) => w.document.querySelector('[data-aogrec-del="' + n + '"]').click(), t2.last.n); await p.waitForTimeout(600);
  await p.reload(); await arrived(p, "music-piano.html"); await p.waitForTimeout(1200);
  t2 = await R(p, w => ({ last: w.AOGStudioRec.last(), n: w.document.querySelectorAll("#takes .aogrec-take").length }));
  ok(t2.last && t2.last.n === t1.last.n && t2.n === 1, "a deleted take stays deleted after a reload: " + JSON.stringify(t2));

  /* leaving a room while it records ends the take and keeps it */
  await R(p, w => w.AOGStudioRec.toggle()); await p.waitForTimeout(400);
  await R(p, w => w.noteOn("p", 64, 0.8)); await p.waitForTimeout(600);
  await door(p, "guitar", "music-guitar.html"); await p.waitForTimeout(1800);
  await door(p, "piano", "music-piano.html");
  t2 = await R(p, w => ({ on: w.AOGStudioRec.on(), last: w.AOGStudioRec.last(), n: w.document.querySelectorAll("#takes .aogrec-take").length }));
  ok(!t2.on && t2.last && t2.last.n > t1.last.n && t2.last.sec > 0.5 && t2.n === 2, "a room left while recording ends the take and keeps it: " + JSON.stringify(t2));

  /* a room whose take cannot be kept and is not on My Track stays open */
  await R(p, w => { w.AOGStudioRec.kept = () => false; });
  await door(p, "bass", "music-bass.html"); await door(p, "band", "music-band.html"); await door(p, "pads", "music-pads.html");
  ok(/music-piano/.test(await frames(p)), "the Studio keeps a room open while its take could still be lost: " + await frames(p));

  /* B · + Add a layer puts the take on My Track, then opens the room picked */
  await door(p, "piano", "music-piano.html");
  await p.selectOption("#mtAdd", "bass"); await arrived(p, "music-bass.html");
  await p.waitForFunction(() => /take is on My Track/.test(document.getElementById("tpLine").textContent), null, { timeout: 6000 }).catch(() => {});
  let b1 = await p.evaluate(async () => ({ hash: location.hash, line: document.getElementById("tpLine").textContent,
    inbox: ((await AOGHandoff.list(AOGHandoff.INBOX)).items || []).filter(x => x.from === "piano").length,
    mark: document.querySelector('#mtList [data-layer="piano"]').classList.contains("on") }));
  ok(b1.hash === "#bass" && b1.inbox === 1 && /^Your Piano take is on My Track\.$/.test(b1.line), "+ Add a layer added the piano take, then opened the bass: " + JSON.stringify(b1));
  await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.querySelector('#mtList [data-layer="piano"]').classList.contains("on")), "and the Piano layer is marked");
  /* again from the piano: the same take is not sent twice */
  await door(p, "piano", "music-piano.html");
  await p.selectOption("#mtAdd", "band"); await arrived(p, "music-band.html"); await p.waitForTimeout(800);
  b1 = await p.evaluate(async () => ({ inbox: ((await AOGHandoff.list(AOGHandoff.INBOX)).items || []).filter(x => x.from === "piano").length, line: document.getElementById("tpLine").textContent }));
  ok(b1.inbox === 1 && !/take is on My Track/.test(b1.line), "a take already on My Track is not sent again: " + JSON.stringify(b1));
  /* after a reload the piano still knows its take is on My Track */
  await door(p, "piano", "music-piano.html"); await p.reload(); await arrived(p, "music-piano.html"); await p.waitForTimeout(1200);
  ok(await R(p, w => w.AOGStudioRec.sent()), "after a reload the piano still knows its take is on My Track");
  await c.close();

  /* C · nine layers, seven tracks: Listen names the two not playing */
  c = await ctxOf(b); p = await c.newPage();
  await p.goto(U + "the-studio#piano"); await arrived(p, "music-piano.html");
  await p.evaluate(async (src) => {
    const w = (new Function("return " + src))()();
    const L = [["pads"], ["drums"], ["piano"], ["guitar"], ["guitar", 1], ["bass"], ["bass", 1], ["band"], ["decks"]];
    let i = 0; for (const [from, live] of L) { i++;
      await AOGHandoff.add(AOGHandoff.INBOX, { from: from, live: !!live, n: 1, name: { en: from + " take", es: from + " toma" }, sec: 1, bpm: 120, at: Date.now() + i, take: true, wav: w }, { key: "fix|" + i }); }
  }, wav.toString());
  await p.click("#tpListen");
  await p.waitForFunction(() => /seven tracks are full/.test(document.getElementById("tpLine").textContent), null, { timeout: 30000 }).catch(() => {});
  const c1 = await p.evaluate(() => { const w = VIS().contentWindow, st = w.__aogStudio;
    return { line: document.getElementById("tpLine").textContent, left: st.listenLeft, on: st.SONG.tracks.filter((x, i) => i < 7 && x.clip).length, playing: st.PLAY.on }; });
  ok(c1.on === 7 && c1.left.join() === "band,decks" && c1.line === "Not playing, because the seven tracks are full: Band, Turntables. To hear one, put it on a track at the Mixing Desk.",
    "Listen fills the seven tracks and names the two left out: " + JSON.stringify(c1));
  await p.evaluate(() => { const b = document.querySelector('.sh-lang button[data-lang="es"]'); if (b) b.click(); }); await p.waitForTimeout(800);
  await p.evaluate(() => { const st = VIS().contentWindow.__aogStudio; if (st.PLAY.on) st.stop(); });
  await p.click("#tpListen");
  await p.waitForFunction(() => /siete pistas/.test(document.getElementById("tpLine").textContent), null, { timeout: 20000 }).catch(() => {});
  const c2 = await p.evaluate(() => document.getElementById("tpLine").textContent);
  ok(/^No suenan, porque las siete pistas están llenas: Banda, Tocadiscos\./.test(c2), "in Spanish: " + c2);
  await c.close();

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
