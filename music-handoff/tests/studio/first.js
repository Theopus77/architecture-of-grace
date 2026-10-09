/* AOG-STUDIO-FIRST-V1 and AOG-STUDIO-LISTEN-V1 — STUDIO-HANDOFF §08 and §12b, the last two in Jimmy's order (3 and 9).
   1 · Inside the Recording Studio every room opens on its instrument: the thing you play is on the first screen of an
       iPhone and an iPad, and nothing that teaches (the course box, the guide, the lesson menu) sits above it. Those wait
       in one closed "Lessons and more" below the instrument, and still work there (the piano's lesson menu). The same
       room on its own address is untouched. Spanish. Light and dark: readable and calm, nothing sideways.
   2 · ▶ Listen plays My Track: takes added from two rooms go on the desk's empty tracks by themselves and play; at the
       desk ‹ <room> takes the place of Mix › and goes back; a newer take from a room replaces the one Listen placed, on the
       same track; a track filled or changed by hand is never changed; with nothing in My Track, one plain line says what to do.
   No page errors. Port 9255. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9255, U = "http://localhost:" + PORT + "/";
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
const FILE = { pads: "music-pads.html", kit: "music-kit.html", piano: "music-piano.html", guitar: "music-guitar.html", bass: "music-bass.html", band: "music-band.html", decks: "music-decks.html", studio: "music-studio.html" };
/* the thing you play in each room */
/* the Band opens on its chord pads; its section and instrument sit with its keys (AOG-SOUNDPICK-V1) */
const HERO = { pads: "#pads", kit: "#kitBox", piano: "#chordStrip", guitar: "#rig #pads", bass: "#rig #pads", band: "#rig #pads", decks: "#decks", studio: "#desk" };
const inner = p => p.frames().find(f => f.parentFrame() === p.mainFrame());
async function arrived(p, id) {
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr.contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, FILE[id], { timeout: 25000 });
  await p.waitForTimeout(1500);
}
/* where the room's instrument starts, and what sits above it, inside the frame */
const surface = (f, hero) => f.evaluate(hero => {
  const h = document.querySelector(hero), vis = e => { const s = getComputedStyle(e), q = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && q.height > 2; };
  const top = h ? h.getBoundingClientRect().top + scrollY : 1e9;
  const above = [...document.querySelectorAll(".aog-course-band, .pm-guide, .bench-bar, #lessonRow, #aogLearn")].filter(e => vis(e) && e.getBoundingClientRect().top + scrollY < top).map(e => e.id || e.className.split(" ")[0]);
  const L = document.getElementById("aogLearn");
  return { top: Math.round(top), ih: innerHeight, above, learn: L ? { open: L.open, say: L.querySelector("summary").textContent, has: [...L.lastChild.children].map(e => e.className.split(" ")[0]) } : null };
}, hero);
/* a two-second take, made in the page, put in My Track the way a room sends one */
const addTake = (p, from, hz, extra) => p.evaluate(async ([from, hz, extra]) => {
  const sr = 48000, n = sr * 2, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.round(Math.sin(2 * Math.PI * hz * i / sr) * 9000), true);
  const at = Date.now(), r = await AOGHandoff.add(AOGHandoff.INBOX, Object.assign({ from: from, n: 1, name: from + " take", sec: 2, bpm: 120, at: at, take: true, wav: new Blob([b], { type: "audio/wav" }) }, extra || {}), { key: from + "|" + at });
  return r.id;
}, [from, hz, extra]);
const lay = f => f.evaluate(() => __aogStudio.SONG.tracks.map(x => x.clip ? x.clip.layer + (x.clip.auto ? "*" : "") : "-").join(" "));

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · the first screen of every room, on an iPhone and an iPad, light and dark */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPad (gen 7)", "dark"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"]]) {
    const c = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(c); await routes(c);
    await c.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const p = await c.newPage(); await p.goto(U + "the-studio#pads"); await arrived(p, "pads");
    for (const id of Object.keys(FILE)) {
      if (id !== "pads") { await p.click(`.sh-doors a[data-room="${id}"]`); await arrived(p, id); }
      const f = inner(p), s = await surface(f, HERO[id]);
      /* the instrument starts high on the room's screen (a phone: in the top 70%, so a whole row shows; an iPad: the top half); nothing that teaches is above it */
      let first = s.top < s.ih * (dev.startsWith("iPhone") ? 0.7 : 0.5) && !s.above.length;   /* a phone: a whole row of it shows */
      const pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`), sw = await f.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1);
      ok(first && sw && !pc.length && !pk.length, `${dev}, ${theme}, ${id}: the instrument comes first (at ${s.top} of ${s.ih}${s.above.length ? "; above it: " + s.above.join(", ") : ""}), nothing sideways, reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
      if (dev === "iPhone 13" && theme === "light") {
        const want = { pads: ["bench-bar", "pm-guide"], piano: ["bench-bar", "aog-course-band"], guitar: ["aog-course-band"], bass: ["aog-course-band"], band: ["aog-course-band"], decks: ["bench-bar"], studio: ["aog-course-band"], kit: null }[id];
        ok(want === null ? !s.learn : (s.learn && !s.learn.open && s.learn.say === "Lessons and more" && want.every(k => s.learn.has.indexOf(k) >= 0)),
          `${id}: ${want ? "Lessons and more is closed and holds " + want.join(", ") : "no Lessons and more (nothing to put there)"}: ${JSON.stringify(s.learn)}`);
      }
    }
    /* the piano's lesson menu still works from Lessons and more; Spanish */
    if (dev === "iPhone 13" && theme === "light") {
      await p.click('.sh-doors a[data-room="piano"]'); await arrived(p, "piano");
      const f = inner(p);
      await f.click("#aogLearn > summary");
      const sel = f.locator("#aogLearn select").filter({ has: f.locator("option") }).last();
      const opts = await sel.evaluate(s => [...s.options].map(o => o.value));
      await sel.selectOption(opts[Math.min(1, opts.length - 1)]); await p.waitForTimeout(800);
      ok(await f.evaluate(() => document.getElementById("aogLearn").open) && opts.length > 1, "Lessons and more opens, and the piano's lesson menu in it can be used (" + opts.length + " choices)");
      await p.evaluate(() => { const b = [...document.querySelectorAll("button, a")].find(x => x.textContent.trim() === "ES"); if (b) b.click(); }); await p.waitForTimeout(1500);
      ok(await f.evaluate(() => document.querySelector("#aogLearn > summary").textContent) === "Lecciones y más", "in Spanish: Lecciones y más");
    }
    await c.close();
  }
  /* the same room on its own address is untouched */
  {
    const c = await b.newContext({ ...pw.devices["iPhone 13"] }); watch(c); await routes(c);
    const p = await c.newPage(); await p.goto(U + "music-guitar.html"); await p.waitForTimeout(3000);
    const s = await p.evaluate(() => ({ learn: !!document.getElementById("aogLearn"), first: !!document.querySelector("#rig > .blk:not([hidden])").querySelector("#pads"),
      menus: (document.querySelector(".sp-wrap") || {}).previousElementSibling === document.getElementById("neckBox") }));
    ok(!s.learn && s.first && s.menus, "the guitar on its own address has no Lessons and more; it opens on its chords, its instrument menus under the neck: " + JSON.stringify(s));
    await c.close();
  }

  /* 2 · ▶ Listen */
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "the-studio#guitar"); await arrived(p, "guitar");
  await p.click("#tpListen");
  await p.waitForFunction(() => document.getElementById("tpLine").textContent.length > 5, null, { timeout: 20000 });
  ok(await p.textContent("#tpLine") === "Nothing to hear yet. Record in a room, then press + Add to My Track.", "with nothing in My Track, Listen says what to do: " + await p.textContent("#tpLine"));
  await p.click("#tpBack"); await arrived(p, "guitar");
  /* two rooms add a take each */
  await addTake(p, "guitar", 330); await addTake(p, "bass", 82);
  await p.click("#tpListen");
  await p.waitForFunction(() => location.hash === "#studio", null, { timeout: 8000 }); await arrived(p, "studio");
  let f = inner(p);
  await f.waitForFunction(() => __aogStudio.PLAY.on, null, { timeout: 20000 });
  ok(await lay(f) === "guitar* bass* - - - - - -", "Listen puts the guitar and the bass takes on the first empty tracks and plays them: " + await lay(f));
  const bk = await p.evaluate(() => ({ back: document.getElementById("tpBack").hidden ? "" : document.getElementById("tpBack").textContent, mix: !document.getElementById("tpMix").hidden, listen: document.getElementById("tpListen").textContent }));
  ok(bk.back === "‹ Guitar" && !bk.mix && bk.listen === "■ Stop listening", "at the desk: ‹ Guitar in place of Mix ›, and ■ Stop listening: " + JSON.stringify(bk));
  await p.click("#tpListen"); await p.waitForTimeout(300);
  ok(!(await f.evaluate(() => __aogStudio.PLAY.on)), "■ Stop listening stops it");
  await p.click("#tpBack"); await arrived(p, "guitar");
  ok(await p.evaluate(() => location.hash === "#guitar" && document.getElementById("tpBack").hidden && !document.getElementById("tpMix").hidden), "‹ Guitar goes back to the guitar");
  /* a newer guitar take replaces the one Listen put there, on the same track; the desk's own track stays the student's */
  const g2 = await addTake(p, "guitar", 440);
  await p.click("#tpListen"); await p.waitForFunction(() => location.hash === "#studio", null, { timeout: 8000 }); await arrived(p, "studio");
  f = inner(p); await f.waitForFunction(() => __aogStudio.PLAY.on, null, { timeout: 20000 });
  ok(await lay(f) === "guitar* bass* - - - - - -" && await f.evaluate(id => __aogStudio.SONG.tracks[0].clip.tid === id, g2), "a newer guitar take replaces the old one on the same track: " + await lay(f));
  await p.click("#tpListen"); await p.waitForTimeout(300);
  /* by hand: the piano take on track 3 */
  const pi = await addTake(p, "piano", 262);
  await f.evaluate(() => __aogStudio.refreshInbox()); await p.waitForTimeout(400);
  await f.evaluate(async id => { await __aogStudio.putOn("take:" + id, 2); }, pi);
  const pi2 = await addTake(p, "piano", 294);
  await p.click("#tpListen"); await f.waitForFunction(() => __aogStudio.PLAY.on, null, { timeout: 20000 });
  ok(await lay(f) === "guitar* bass* piano - - - - -" && await f.evaluate(id => __aogStudio.SONG.tracks[2].clip.tid === id, pi), "a track filled by hand keeps its take, even with a newer one from that room: " + await lay(f));
  await p.click("#tpListen"); await p.waitForTimeout(300);
  /* a take Listen placed and then changed by hand (cut a beat off its start) is the student's too */
  const bass1 = await f.evaluate(() => __aogStudio.SONG.tracks[1].clip.tid);
  await f.evaluate(() => { __aogStudio.SONG.sel = 1; __aogStudio.clipAct("in+beat"); });
  await addTake(p, "bass", 98);
  await p.click("#tpListen"); await f.waitForFunction(() => __aogStudio.PLAY.on, null, { timeout: 20000 });
  ok(await lay(f) === "guitar* bass piano - - - - -" && await f.evaluate(id => __aogStudio.SONG.tracks[1].clip.tid === id, bass1), "a placed take you changed stays, even with a newer one: " + await lay(f));
  await p.click("#tpListen"); await p.waitForTimeout(300);
  /* a reload keeps what Listen placed */
  await p.reload(); await arrived(p, "studio"); f = inner(p);
  await f.waitForFunction(() => !__aogStudio.S.decoding, null, { timeout: 20000 });
  ok(await lay(f) === "guitar* bass piano - - - - -", "a reload keeps the tracks and which ones Listen placed: " + await lay(f));
  /* Spanish */
  await p.evaluate(() => { const b = [...document.querySelectorAll("button, a")].find(x => x.textContent.trim() === "ES"); if (b) b.click(); }); await p.waitForTimeout(800);
  await p.click('.sh-doors a[data-room="bass"]'); await arrived(p, "bass");
  await p.click("#tpListen"); await p.waitForFunction(() => location.hash === "#studio", null, { timeout: 8000 }); await arrived(p, "studio");
  ok(await p.evaluate(() => document.getElementById("tpBack").textContent) === "‹ Bajo" && await p.evaluate(() => document.getElementById("tpListen").textContent) === "■ Dejar de escuchar", "in Spanish: ‹ Bajo and ■ Dejar de escuchar");
  await p.click("#tpListen");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
