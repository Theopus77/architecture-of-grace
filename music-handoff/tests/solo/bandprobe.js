const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path"), PORT = 9451, srv = require("../srv.js")(PORT);
const ROOT = path.resolve(__dirname, "../../../aog-deploy");
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  ctx.on("page", pg => { pg.on("pageerror", e => console.log("ERR " + e.message)); pg.on("console", m => { if (m.type() === "error") console.log("CONSOLE " + m.text()); }); });
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#band`);
  await p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentWindow.AOGBandLick && f.contentDocument.getElementById("kbd"); } catch (e) { return false; } }), null, { timeout: 60000 });
  const f = p.frames().find(x => /music-band/.test(x.url()));
  const r = await f.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
    const before = !!window.AOGBandLicks;
    $("lkOpen").click(); for (let i = 0; i < 50 && !window.AOGBandLicks; i++) await W(100);
    await W(200);
    const kb = $("kbd").getBoundingClientRect(), lk = $("bandLicks").getBoundingClientRect();
    const out = { before, after: !!window.AOGBandLicks, opts: $("lkSel").options.length, prev: $("bandLicks").previousElementSibling && $("bandLicks").previousElementSibling.id, gap: Math.round(lk.top - kb.bottom), line: $("lkLine").textContent, song: $("lkSong").textContent, sound: S.sound };
    $("lkPlay").click(); await W(1500);
    const T = AOGBandLick._t; out.on = T.LK.on; out.log = T.LK.log.length; out.lit = document.querySelectorAll("#kbd .lk").length; out.seen = T.LK.seen.length;
    $("lkPlay").click(); await W(200); out.off = !T.LK.on;
    await T.lickRecord(); out.rec = T.LK.msg; out.err = T.LK.err; out.last = T.LK.last;
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close(); srv.close(); process.exit(0);
})().catch(e => { console.log("CRASH " + e.stack); process.exit(1); });
