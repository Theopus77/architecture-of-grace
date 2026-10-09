/* The rooms reach for the ceiling (Jimmy, 2026-10-09: "1, 3, 2, 4").
   1 · AOG-ROOMS-ROOM-V1: inside the Recording Studio every room sits in the dim control room (its page takes the room's
       colour), and a menu on a dark panel is the desk's dark window with gold type (class aog-hw), on a room's own page too.
   Readable and calm on an iPad and an iPhone, light and dark; nothing sideways. No page errors. Port 9261. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9261, U = "http://localhost:" + PORT + "/";
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
const ROOMS = ["pads", "kit", "piano", "guitar", "bass", "band", "decks"];
async function inRoom(m, room) {
  await m.goto(U + "the-studio#" + room);
  await m.waitForFunction(r => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, room, { timeout: 20000 });
  await m.waitForTimeout(1800);
  return m.frames().find(x => x.parentFrame() === m.mainFrame());
}
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  for (const [dev, theme] of [["iPad (gen 7) landscape", "light"], ["iPad (gen 7) landscape", "dark"], ["iPhone 13", "light"], ["iPhone 13", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage();
    for (const room of ROOMS) {
      const f = await inRoom(m, room);
      const r = await f.evaluate(() => {
        const bg = getComputedStyle(document.body).backgroundColor;
        /* every menu that shows: on a dark panel it is the dark window with gold type; on a light card it keeps its look */
        const shown = [...document.querySelectorAll("select")].filter(s => s.getClientRects().length && !s.closest(".sp-keep"));
        const wrong = shown.filter(s => { if (!s.classList.contains("aog-hw")) return false; const c = getComputedStyle(s); return c.backgroundColor !== "rgb(18, 19, 22)" || c.color !== "rgb(246, 227, 180)"; }).length;
        return { bg, menus: shown.length, hw: shown.filter(s => s.classList.contains("aog-hw")).length, wrong, sw: document.scrollingElement.scrollWidth <= innerWidth + 1 };
      });
      const pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`), sp = await m.evaluate(`(${PROBE})()`);
      const needHw = dev.startsWith("iPad") && room !== "kit";
      ok(r.bg === "rgb(23, 17, 12)" && !r.wrong && (!needHw || r.hw > 0) && r.sw && !pc.length && !sp.length && !pk.length,
        `${dev}, ${theme}, ${room}: in the control room (${r.bg}), ${r.hw} of ${r.menus} menus dark with gold type, readable (${pc.length + sp.length} ${JSON.stringify(pc.concat(sp).slice(0, 2))}), calm (${pk.join("; ") || "ok"}), nothing sideways (${r.sw})`);
    }
    await cx.close();
  }
  /* on its own page a room keeps its paper, and its menus on dark panels are dark too */
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-piano.html"); await p.waitForTimeout(1800);
  const own = await p.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundColor, kind: document.getElementById("spKind").classList.contains("aog-hw") }));
  ok(own.bg !== "rgb(23, 17, 12)" && own.kind, "the piano on its own page keeps its paper; its Kind menu is the dark window: " + JSON.stringify(own));
  await c.close();
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
