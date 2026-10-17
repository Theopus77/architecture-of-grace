/* AOG-STUDIO-SUPREME-V1 (2026-10-17) — Jimmy: "I want the 'presentation or the room' of the studio / mixing board to be
   supreme in its presentation and excellence in its structure and handling." The Recording Studio's frame, in one order:
   the meter bridge (Back, the name, the room's meters and room sound, EN | ES), the eight doors, the room, the desk.
   1 · An iPhone upright, an iPad upright and on its side, and a computer, light and dark: all eight doors are on the
       screen at once, in song order, each one a single tap (44 px or more), the room you are in lit; Back, the name and
       EN | ES share one line; the meters sit on the bridge (not on a phone); nothing sideways, no page scroll, the room
       takes what is left; on an iPad on its side and a computer the doors run down the left beside the room. Readable
       and calm. "My notes" (the reading pages' notes button) never sits over the desk.
   2 · Switching rooms is at once and costs nothing: a room you go back to is the same page, as you left it (its own
       state and its sound engine, never closed), and it is in sight in the same moment as the tap.
   3 · ♩ Song opens a sheet over the room, just above the desk, without moving the room; a tap above the desk puts it away.
   4 · A phone on its side still gives the room the whole screen.
   No page errors. Port 9350. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9350, U = "http://localhost:" + PORT + "/";
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
const FILE = { pads: "music-pads.html", piano: "music-piano.html", bass: "music-bass.html", studio: "music-studio.html", decks: "music-decks.html" };
async function arrived(p, id) {
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument;
    return fr.getAttribute("data-file") === "/" + f && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, FILE[id], { timeout: 30000 });
  await p.waitForTimeout(600);
}
const SONG = "Drum Machine | Drum Kit | Piano | Guitar | Bass | Band | Turntables | Mixing Desk";
const init = ([th, es]) => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); if (es) localStorage.setItem("aog.lang", "es"); } catch (e) {} };

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · every screen, light and dark */
  const SIZES = [["iPhone", { ...pw.devices["iPhone 13"], viewport: { width: 390, height: 844 } }, "phone"], ["iPad upright", { ...pw.devices["iPad Pro 11"], viewport: { width: 820, height: 1180 } }, "row"],
    ["iPad on its side", { ...pw.devices["iPad Pro 11 landscape"], viewport: { width: 1180, height: 820 } }, "rail"], ["computer", { viewport: { width: 1440, height: 900 } }, "rail"]];
  const ROOMS = ["piano", "bass", "studio", "pads"];
  let n = 0;
  for (const [name, dev, kind] of SIZES) for (const theme of ["light", "dark"]) {
    const room = ROOMS[n++ % ROOMS.length], es = theme === "dark" && name === "iPad upright";
    const cx = await b.newContext({ ...dev, colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(init, [theme, es]);
    const m = await cx.newPage(); await m.goto(U + "the-studio#" + room); await arrived(m, room); await m.waitForTimeout(600);
    const r = await m.evaluate(() => {
      const R = el => el.getBoundingClientRect(), doors = [...document.querySelectorAll(".sh-doors a")], fr = document.getElementById("room"), cur = document.querySelector(".sh-doors a[aria-current]");
      const top = ["shBack", null, null].map((id, i) => R(i === 0 ? document.getElementById("shBack") : i === 1 ? document.querySelector(".sh-top h1") : document.querySelector(".sh-lang")));
      const vu = document.querySelector("#tpVu .aogvu"), vb = vu && R(vu);
      return { iw: innerWidth, ih: innerHeight, sw: document.scrollingElement.scrollWidth, sh: document.scrollingElement.scrollHeight,
        names: doors.map(a => a.textContent.trim()).join(" | "), es: document.documentElement.lang,
        inView: doors.every(a => { const x = R(a); return x.width > 0 && x.left >= -1 && x.right <= innerWidth + 1 && x.top >= -1 && x.bottom <= innerHeight + 1; }),
        minDoor: Math.min(...doors.map(a => Math.round(Math.min(R(a).height, R(a).width)))),
        cur: cur && cur.getAttribute("data-room"), oneLine: Math.max(...top.map(x => x.top + x.height / 2)) - Math.min(...top.map(x => x.top + x.height / 2)) < 6,
        rail: doors.length === 8 && R(doors[7]).top > R(doors[0]).bottom && R(doors[0]).right <= R(fr).left + 1, frame: Math.round(R(fr).height), frameBottom: Math.round(R(fr).bottom),
        mtTop: Math.round(R(document.getElementById("mt")).top), vuTop: vb ? Math.round(vb.top) : -1, vuShown: !!vb && vb.width > 0,
        notes: !!document.querySelector(".aog-mkdrawer, .aog-mkbtn, link[href*='aog-markup']") || !!window.__aogMarkup };
    });
    const wantNames = es ? "Caja de ritmos | Batería | Piano | Guitarra | Bajo | Banda | Tocadiscos | Mesa de mezclas" : SONG;
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    const vuOk = kind === "phone" ? !r.vuShown : room === "studio" ? !r.vuShown : r.vuShown && r.vuTop < 70;
    ok(r.names === wantNames && r.inView && r.minDoor >= 44 && r.cur === room && r.oneLine && (kind === "rail") === r.rail && r.sw <= r.iw && r.sh <= r.ih + 1 &&
      r.frameBottom <= r.mtTop + 1 && r.frame >= (kind === "phone" ? 380 : 500) && vuOk && !r.notes && !pc.length && !pk.length,
      `${name}, ${theme}${es ? ", Spanish" : ""}, ${room}: eight doors in song order, all on the screen, one tap each, the room lit; one top line; meters ${kind === "phone" ? "off" : "on the bridge"}; it fits; readable and calm ` +
      JSON.stringify({ ...r, names: r.names === wantNames ? "ok" : r.names, pc: pc.slice(0, 2), pk }));
    await cx.close();
  }

  /* 2 · switching rooms is at once and keeps the room (its state and its sound) */
  const c = await b.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "the-studio#piano"); await arrived(p, "piano");
  const pianoF = await (await p.$("#room")).contentFrame();
  await pianoF.evaluate("window.__mark = 42; ctx(); noteOn('k', 60, 0.7)"); await p.waitForTimeout(300); await pianoF.evaluate("noteOff('k', 60)");
  const st0 = await pianoF.evaluate("ac.state");
  await p.click('.sh-doors a[data-room="bass"]'); await arrived(p, "bass");
  const st1 = await pianoF.evaluate("ac.state");
  const t = await p.evaluate(() => { const a = document.querySelector('.sh-doors a[data-room="piano"]'), t0 = performance.now(); a.click();
    const fr = document.getElementById("room"), w = fr.contentWindow; return { ms: Math.round(performance.now() - t0), same: w.__mark === 42, shown: fr.style.display !== "none" && fr.getBoundingClientRect().height > 300,
      frames: [...document.querySelectorAll("iframe.sh-room")].filter(f => f.style.display !== "none").length, cur: document.querySelector(".sh-doors a[aria-current]").getAttribute("data-room") }; });
  await p.waitForTimeout(400);
  const st2 = await pianoF.evaluate("ac.state");
  ok(t.same && t.shown && t.frames === 1 && t.cur === "piano" && t.ms < 80, "going back to the piano is at once, and it is the same page, just as you left it: " + JSON.stringify(t));
  ok(st0 === "running" && st1 === "suspended" && st2 === "running", `the piano's sound rests out of sight and wakes when you come back, never closed (${st0} → ${st1} → ${st2})`);
  await pianoF.evaluate("noteOn('k', 64, 0.7)"); await p.waitForTimeout(200); await pianoF.evaluate("noteOff('k', 64)");
  ok(await pianoF.evaluate("ac.state") === "running", "the piano plays after the round trip");

  /* 3 · ♩ Song: a sheet over the room, just above the desk; a tap outside puts it away */
  const before = await p.evaluate(() => Math.round(document.getElementById("room").getBoundingClientRect().height));
  await p.click("#tpSong");
  const sh = await p.evaluate(() => { const bx = document.getElementById("songBox"), r = bx.getBoundingClientRect(), mt = document.getElementById("mt").getBoundingClientRect();
    return { open: !bx.hidden, bottom: Math.round(r.bottom), mtTop: Math.round(mt.top), top: Math.round(r.top), right: Math.round(r.right), iw: innerWidth,
      frame: Math.round(document.getElementById("room").getBoundingClientRect().height), focus: document.activeElement && document.activeElement.id }; });
  const pc = await p.evaluate(`(${PROBE})()`);
  ok(sh.open && sh.bottom <= sh.mtTop && sh.top >= 0 && sh.right <= sh.iw && sh.frame === before && sh.focus === "songBpm" && !pc.length,
    "♩ Song opens a sheet just above the desk, over the room, without moving it, readable: " + JSON.stringify({ ...sh, before, pc: pc.slice(0, 2) }));
  await p.mouse.click(600, 60);
  ok(await p.evaluate(() => document.getElementById("songBox").hidden && document.getElementById("tpSong").getAttribute("aria-expanded") === "false"), "a tap on the top line puts the Song sheet away");
  await c.close();

  /* 3b · a phone: My Track waits one tap away, on a sheet above the desk; the transport is one row; picking a room puts the sheet away */
  const ph = await b.newContext({ ...pw.devices["iPhone 13"] }); watch(ph); await routes(ph);
  const m = await ph.newPage(); await m.goto(U + "the-studio#piano"); await arrived(m, "piano");
  const row = await m.evaluate(() => { const bt = [...document.querySelectorAll("#mt .tp-b")].filter(x => x.offsetParent), R = x => x.getBoundingClientRect();
    return { labels: bt.map(x => x.textContent).join(" | "), tops: new Set(bt.map(x => Math.round(R(x).top))).size, min: Math.min(...bt.map(x => Math.round(R(x).height))), sheet: !!document.getElementById("mtRow").offsetParent,
      frame: Math.round(R(document.getElementById("room")).height), ih: innerHeight }; });
  ok(row.labels === "● Record | ▶ Listen | Send it out | My Track" && row.tops === 1 && row.min >= 44 && !row.sheet && row.frame >= row.ih * 0.62,
    "a phone: one row of keys, My Track one tap away, and the room keeps most of the screen: " + JSON.stringify(row));
  await m.tap("#mtOpen");
  const open = await m.evaluate(() => { const r = document.getElementById("mtRow").getBoundingClientRect(), mt = document.getElementById("mt").getBoundingClientRect();
    return { shown: r.height > 0, above: Math.round(r.bottom) <= Math.round(mt.top), strips: [...document.querySelectorAll("#mtList .lay")].filter(x => { const b = x.getBoundingClientRect(); return b.width > 0 && b.right <= innerWidth && b.bottom <= innerHeight; }).length,
      add: !!document.getElementById("mtAdd").offsetParent, song: !!document.getElementById("tpSong").offsetParent, exp: document.getElementById("mtOpen").getAttribute("aria-expanded") }; });
  const mpc = await m.evaluate(`(${PROBE})()`);
  ok(open.shown && open.above && open.strips === 10 && open.add && open.song && open.exp === "true" && !mpc.length, "the My Track key opens a sheet above the desk with the song, + Add a layer and all ten layers, readable: " + JSON.stringify({ ...open, pc: mpc.slice(0, 2) }));
  await m.tap(".sh-top h1");
  ok(await m.evaluate(() => !document.getElementById("mtRow").offsetParent && document.getElementById("mtOpen").getAttribute("aria-expanded") === "false"), "a tap on the top line puts the My Track sheet away");
  await m.tap("#mtOpen"); await m.selectOption("#mtAdd", "bass"); await arrived(m, "bass");
  ok(await m.evaluate(() => location.hash === "#bass" && !document.getElementById("mtRow").offsetParent), "+ Add a layer › The Bass goes to the Bass and puts the sheet away");
  await ph.close();

  /* 4 · a phone on its side: the room gets the whole screen */
  const ls = await b.newContext({ ...pw.devices["iPhone 13 landscape"] }); watch(ls); await routes(ls);
  const q = await ls.newPage(); await q.goto(U + "the-studio#piano"); await arrived(q, "piano");
  const lf = await q.evaluate(() => { const r = document.getElementById("room").getBoundingClientRect(); return { ih: innerHeight, top: Math.round(r.top), h: Math.round(r.height), sh: document.scrollingElement.scrollHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }; });
  ok(lf.top === 0 && lf.h >= lf.ih - 1 && lf.sh <= lf.ih + 1 && lf.sw <= lf.iw, "a phone on its side gives the room the whole screen: " + JSON.stringify(lf));
  await ls.close();

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
