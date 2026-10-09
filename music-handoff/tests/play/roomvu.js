/* AOG-ROOM-VU-V1 — Jimmy: "Can the VU meters work in the instruments page as well, but much smaller." Every music room hears
   itself on a small pair of VU meters: on its own page beside its Record button; inside the Recording Studio in the bottom bar
   for the room you are in (not on the Mixing Desk, which has its own large ones). Playing a room moves its needles; quiet,
   they rest. Readable and calm on an iPhone and an iPad, light and dark. No page errors. Port 9260. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9260, U = "http://localhost:" + PORT + "/";
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
/* each room, and keys that play it */
const ROOMS = [["music-pads.html", ["KeyZ", "KeyA", "Digit1"]], ["music-kit.html", ["KeyA", "KeyS", "KeyD"]], ["music-piano.html", ["KeyA", "KeyD", "KeyG"]],
  ["music-guitar.html", ["KeyA", "KeyS", "Digit2"]], ["music-bass.html", ["KeyA", "KeyS", "KeyD"]], ["music-band.html", ["KeyA", "KeyS", "KeyD"]], ["music-decks.html", []]];
const pic = (f, sel) => f.evaluate(s => [...document.querySelectorAll(s + " canvas")].map(c => c.toDataURL().slice(-120)).join("|"), sel);
/* plays the keys a few times; the loudest level heard, and whether the meters (at sel, in page m) moved from rest at any moment */
async function play(f, kb, keys, m, sel, rest) {
  let best = -90, moved = false;
  for (let r = 0; r < 4; r++) for (const k of keys) { await kb.down(k); await f.waitForTimeout(60);
    const v = await f.evaluate(() => window.AOGVU && AOGVU.levels()); if (v) best = Math.max(best, v[0], v[1]);
    if (m && !moved && await pic(m, sel) !== rest) moved = true;
    await kb.up(k); await f.waitForTimeout(60); }
  return { best, moved };
}
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  for (const [file, keys] of ROOMS) {
    await p.goto(U + file); await p.waitForTimeout(1800);
    const where = await p.evaluate(() => { const v = document.querySelector(".aogvu"), rb = document.getElementById("recBtn") || document.getElementById("takeBtn");
      return { n: document.querySelectorAll(".aogvu").length, beside: !!(v && rb && v.parentNode === rb.parentNode), cv: v ? v.querySelectorAll("canvas").length : 0, aria: v && v.getAttribute("aria-label") }; });
    ok(where.n === 1 && where.beside && where.cv === 2 && /left and right/.test(where.aria || ""), `${file}: a small pair of VU meters beside Record: ${JSON.stringify(where)}`);
    const rest = await pic(p, ".aogvu");
    if (keys.length) {
      await p.mouse.click(5, 400).catch(() => {});
      const { best, moved } = await play(p, p.keyboard, keys, p, ".aogvu", rest);
      ok(best > -40 && moved, `${file}: playing it moves the needles (loudest ${best.toFixed(1)} dB)`);
    } else {
      /* the turntables: anything the page sends to the speakers is heard */
      const best = await p.evaluate(async () => { const AC = window.AudioContext || window.webkitAudioContext, ac = new AC(); await ac.resume();
        const o = ac.createOscillator(), g = ac.createGain(); g.gain.value = 0.3; o.connect(g); g.connect(ac.destination); o.start();
        await new Promise(r => setTimeout(r, 400)); const v = AOGVU.levels(); o.stop(); return v ? Math.max(v[0], v[1]) : -90; });
      ok(best > -20, `${file}: what the page plays is heard (${best.toFixed(1)} dB)`);
    }
    await p.waitForFunction(() => { const v = AOGVU.levels(); return !v || Math.max(v[0], v[1]) < -60; }, null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(3600);
    ok(await pic(p, ".aogvu") === rest, `${file}: quiet again, the needles rest`);
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* in the Recording Studio: the bottom bar shows the room's meters; not on the Mixing Desk */
  const s = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(s); await routes(s);
  const q = await s.newPage(); await q.goto(U + "the-studio#piano");
  await q.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, null, { timeout: 20000 });
  await q.waitForTimeout(1500);
  const f = q.frames().find(x => x.parentFrame() === q.mainFrame());
  const inRoom = await f.evaluate(() => document.querySelectorAll(".aogvu").length);
  const bar = await q.evaluate(() => { const v = document.querySelector("#tpVu .aogvu"); return !!v && !document.getElementById("tpVu").hidden && v.getBoundingClientRect().width > 80; });
  ok(bar && inRoom === 0, `in the Studio the pair sits in the bottom bar (${bar}), not twice in the room (${inRoom})`);
  const r0 = await pic(q, "#tpVu");
  await f.click("body", { position: { x: 5, y: 5 } }).catch(() => {});
  const sp = await play(f, q.keyboard, ["KeyA", "KeyD", "KeyG"], q, "#tpVu", r0);
  ok(sp.best > -40 && sp.moved, `playing the piano in the Studio moves the bar's needles (${sp.best.toFixed(1)} dB)`);
  await q.click('.sh-doors a[data-room="studio"]'); await q.waitForTimeout(2500);
  ok(await q.evaluate(() => document.getElementById("tpVu").hidden), "on the Mixing Desk the small pair steps aside (the desk has its own)");
  await s.close();

  /* an iPhone and an iPad, light and dark: readable, calm, nothing sideways */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7) landscape", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage();
    for (const file of ["music-piano.html", "music-guitar.html", "music-decks.html"]) {
      await m.goto(U + file); await m.waitForTimeout(1600);
      await m.evaluate(() => { const v = document.querySelector(".aogvu"); if (v) v.scrollIntoView({ block: "center" }); }); await m.waitForTimeout(200);
      const r = await m.evaluate(() => { const v = document.querySelector(".aogvu"), b = v && v.getBoundingClientRect(); return { fit: !!b && b.right <= innerWidth && b.left >= 0, sw: document.scrollingElement.scrollWidth <= innerWidth + 1 }; });
      const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
      ok(r.fit && r.sw && !pc.length && !pk.length, `${dev}, ${theme}, ${file}: the meters fit, nothing sideways, readable (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and calm (${pk.join("; ") || "ok"})`);
    }
    await m.goto(U + "the-studio#guitar"); await m.waitForTimeout(3000);
    const t = await m.evaluate(() => { const v = document.querySelector("#tpVu .aogvu"), b = v && v.getBoundingClientRect(); return { fit: !!b && b.right <= innerWidth + 1, sw: document.scrollingElement.scrollWidth <= innerWidth + 1 }; });
    const pc = await m.evaluate(`(${PROBE})()`);
    ok(t.fit && t.sw && !pc.length, `${dev}, ${theme}: in the Studio the bar's meters fit, nothing sideways, readable (${pc.length})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
