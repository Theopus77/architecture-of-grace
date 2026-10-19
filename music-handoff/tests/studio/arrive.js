/* AOG-DESK-ARRIVE-V1 (2026-10-19) — Jimmy: "I am unable to send the drums beats when I just record them, over on to the
   mixing DECK". In the Studio, a beat played on the Drum Machine, ● Record, ■ Stop, + Add to My Track ("Added to My Track."),
   then the Mixing Desk door: the take is on track 1 at once, not only in the list of takes. With the desk kept open out of
   sight: a second take replaces the first on track 1; the loop made into a file and sent comes in the same way; a track taken
   off stays off when the desk is opened again; a drum track filled by hand stays, and a new drum take goes on an empty
   track. The desk opened on its own (not in the Studio) puts nothing on a track by itself. Spanish. No page errors. Port 9412. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path");
const PORT = 9412, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
async function ctxOf(b) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
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
const room = async p => (await p.$("#room")).contentFrame();
/* the desk's tracks, once it has done its work: "1:Drum machine take 1", "2:-" … */
async function tracks(p) {
  const d = await room(p);
  await d.waitForFunction(() => !__aogStudio.S.busy, null, { timeout: 20000 }); await p.waitForTimeout(400);
  await d.waitForFunction(() => !__aogStudio.S.busy, null, { timeout: 20000 });
  return d.evaluate(() => __aogStudio.SONG.tracks.slice(0, 7).map((x, i) => (i + 1) + ":" + (x.clip ? x.clip.name : "-")));
}
/* on the Drum Machine: a beat playing, ● Record for about two seconds, ■ Stop, + Add to My Track */
async function drumTake(p) {
  const f = await room(p);
  if (!(await f.evaluate(() => S.ev.length))) { await f.click("#beatNext"); await p.waitForTimeout(1500); }
  if (!(await f.evaluate(() => SEQ.on))) await f.click("#playBtn");
  await p.waitForTimeout(800);
  const n = await f.evaluate(() => REC.n);
  await p.click("#tpRec"); await p.waitForTimeout(2200); await p.click("#tpRec");
  await f.waitForFunction(k => REC.n === k + 1 && !REC.closing, n, { timeout: 10000 });
  await f.click("#playBtn"); await p.waitForTimeout(200);   /* the beat stops */
  await p.click("#tpAdd"); await p.waitForTimeout(1500);
  return { n: n + 1, line: (await f.textContent("#takeLine")).trim() };
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await ctxOf(b), p = await c.newPage();
  await p.goto(U + "the-studio#pads"); await arrived(p, "music-pads.html");

  /* 1 · record a beat, add it, open the desk */
  let t = await drumTake(p);
  ok(t.n === 1 && /^Added to My Track\./.test(t.line), "the Drum Machine's take is added to My Track: " + t.line);
  await door(p, "studio", "music-studio.html");
  let tr = await tracks(p);
  ok(tr[0] === "1:Drum machine take 1" && tr.slice(1).every(x => /:-$/.test(x)), "the desk opens with the take on track 1: " + tr.join(" | "));
  const line = await (await room(p)).evaluate(() => document.getElementById("recLine").textContent);
  ok(line === "Drum machine take 1 is on track 1.", "the desk says where it went: " + line);

  /* 2 · the desk stays open out of sight; a second take takes the first one's place */
  await door(p, "pads", "music-pads.html");
  t = await drumTake(p);
  await door(p, "studio", "music-studio.html");
  tr = await tracks(p);
  ok(tr[0] === "1:Drum machine take 2" && tr[1] === "2:-", "the newer take replaces the first on track 1: " + tr.slice(0, 3).join(" | "));

  /* 3 · the loop made into a file, sent to the Mixing Desk */
  await door(p, "pads", "music-pads.html");
  let f = await room(p);
  await f.click("#bounceBtn"); await f.waitForFunction(() => !document.getElementById("bounceAct").hidden, null, { timeout: 30000 });
  await f.click("#bStudio"); await f.waitForFunction(() => /^Sent\./.test(document.getElementById("bounceLine").textContent), null, { timeout: 10000 });
  await door(p, "studio", "music-studio.html");
  tr = await tracks(p);
  const loop = await (await room(p)).evaluate(() => { const x = __aogStudio.SONG.tracks[0].clip; return x ? { take: x.take, head: x.head, bars: x.bars } : null; });
  ok(/^1:Drum machine loop · 2 bars · \d+ BPM$/.test(tr[0]) && loop && loop.take === false && loop.head === 0 && loop.bars === 2, "the loop file arrives on track 1, a whole loop: " + tr[0] + " " + JSON.stringify(loop));

  /* 4 · a track taken off stays off when the desk is opened again */
  await (await room(p)).evaluate(() => __aogStudio.takeOff ? __aogStudio.takeOff(0) : null);
  const hasOff = await (await room(p)).evaluate(() => typeof __aogStudio.takeOff === "function");
  if (!hasOff) await (await room(p)).evaluate(() => { __aogStudio.SONG.tracks[0].clip = null; __aogStudio.songChanged(); });
  await door(p, "pads", "music-pads.html"); await door(p, "studio", "music-studio.html");
  tr = await tracks(p);
  ok(tr[0] === "1:-", "a track taken off stays empty when the desk opens again: " + tr[0]);

  /* 5 · a drum track filled by hand stays; the new drum take goes on an empty track */
  const d = await room(p);
  await d.evaluate(async () => { const s = __aogStudio, o = s.sources().find(x => x.kind === "take" && x.x.from === "pads"); await s.putOn(o.id, 2); });
  await d.waitForFunction(() => !__aogStudio.S.busy && __aogStudio.SONG.tracks[2].clip, null, { timeout: 20000 });
  const hand = await d.evaluate(() => __aogStudio.SONG.tracks[2].clip.name);
  await door(p, "pads", "music-pads.html");
  t = await drumTake(p);
  await door(p, "studio", "music-studio.html");
  tr = await tracks(p);
  ok(tr[2] === "3:" + hand && tr[0] === "1:Drum machine take " + t.n, "the drum track filled by hand stays, the new take goes on an empty track: " + tr.slice(0, 4).join(" | "));

  /* 6 · Spanish */
  const c2 = await ctxOf(b), p2 = await c2.newPage();
  await p2.goto(U + "the-studio#pads"); await arrived(p2, "music-pads.html");
  await p2.click('button[data-lang="es"]'); await arrived(p2, "music-pads.html");
  await p2.waitForFunction(() => document.getElementById("tpRec").textContent.includes("Grabar"), null, { timeout: 10000 });
  f = await room(p2);
  await f.click("#beatNext"); await p2.waitForTimeout(1500); await f.click("#playBtn"); await p2.waitForTimeout(800);
  await p2.click("#tpRec"); await p2.waitForTimeout(2200); await p2.click("#tpRec");
  await f.waitForFunction(() => REC.n === 1 && !REC.closing, null, { timeout: 10000 });
  await f.click("#playBtn"); await p2.click("#tpAdd"); await p2.waitForTimeout(1500);
  await door(p2, "studio", "music-studio.html");
  tr = await tracks(p2);
  const es = await (await room(p2)).evaluate(() => document.getElementById("recLine").textContent);
  ok(/^1:/.test(tr[0]) && tr[0] !== "1:-" && /está en la pista 1\.$/.test(es), "Spanish: on track 1, and said so: " + tr[0] + " / " + es);
  await c2.close();

  /* 7 · the desk on its own, outside the Studio: nothing goes on a track by itself */
  const c3 = await ctxOf(b), p3 = await c3.newPage();
  await p3.goto(U + "music-pads.html"); await p3.waitForTimeout(800);
  await p3.evaluate(() => { const sr = 44100, n = sr, ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
    for (let i = 0; i < 4000; i++) { const x = Math.round(12000 * Math.sin(i / 3) * Math.exp(-i / 400)); v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
    return AOGHandoff.add(AOGHandoff.INBOX, { from: "pads", n: 1, name: { en: "Drum take 1", es: "Toma 1" }, sec: 1, bpm: 120, at: Date.now(), take: true, wav: new Blob([ab], { type: "audio/wav" }) }, { key: "alone" }); });
  await p3.goto(U + "music-studio.html"); await p3.waitForTimeout(2500);
  const alone = await p3.evaluate(() => ({ items: __aogStudio.INBOX.items.length, on: __aogStudio.SONG.tracks.filter(x => x.clip).length }));
  ok(alone.items === 1 && alone.on === 0, "outside the Studio the desk lists the take and leaves the tracks alone: " + JSON.stringify(alone));
  await c3.close();

  ok(errs.length === 0, "no page errors " + errs.slice(0, 4).join(" | "));
  console.log(fails ? `${fails} FAILED` : "ALL PASS");
  await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e && e.stack || e)); process.exit(1); });
