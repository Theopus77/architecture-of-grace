/* AOG-SOLO-LICKNEAR-V2 (2026-10-18) — Jimmy: "Play this lick … needs to be closer to the fret board. One is unable to see the
   neck of the guitar while the licks are taking place." Inside the Studio, in the Guitar room, Solo:
   1 · the lick menu and ▶ Play this lick sit right under the neck (the button within 200 px of the neck's foot), on an
       iPhone upright and an iPad upright and sideways
   2 · pressed from anywhere on the page, the neck comes into sight as the lick plays
   3 · out of Solo, the licks are not shown; and there are no page errors. Port 9422.
   4 · AOG-SOLO-LICKS-PV-V1 (Jimmy, 2026-10-18: "the licks drop down menu is not visible by the neck"): on the whole screen
       (an iPad, a computer, a phone on its side), Guitar and Bass, the licks are a row right under the neck, a lick plays from
       it, and leaving the whole screen puts them back under the neck; and when the screen changes size (an iPad turned)
       and the Studio fits the room again, the licks stay right under the neck, before the room's controls.
   5 · (Jimmy, 2026-10-19, an iPad screenshot: the licks under the pedals) the room opened again with Solo already on
       (a reload, a return visit): the sound picker's row and the Studio's controls go after the licks, not between. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path"), PORT = 9422, srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  for (const [nm, vw] of [["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }], ["iPad sideways", { width: 1180, height: 820 }]]) {
    const ctx = await b.newContext({ viewport: vw, isMobile: true, hasTouch: true, serviceWorkers: "block" });
    ctx.on("page", pg => pg.on("pageerror", e => errs.push(nm + ": " + e.message)));
    await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#guitar`);
    await p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentDocument && f.contentDocument.getElementById("neckBox") && f.contentDocument.querySelector('[data-so-mode="solo"]'); } catch (e) { return false; } }), null, { timeout: 60000 });
    const f = p.frames().find(x => /music-guitar/.test(x.url()));
    const r = await f.evaluate(async () => {
      const off = !!document.querySelector(".so-licks.so-near") && !document.querySelector(".so-licks.so-near").hidden && document.querySelector(".so-licks.so-near").offsetParent !== null;
      document.querySelector('[data-so-mode="solo"]').click(); await new Promise(r => setTimeout(r, 400));
      const nb = document.getElementById("neckBox"), btn = document.getElementById("soLickBtn");
      const gap = btn.getBoundingClientRect().top - nb.getBoundingClientRect().bottom;
      scrollTo(0, document.documentElement.scrollHeight); await new Promise(r => setTimeout(r, 100));
      btn.click(); await new Promise(r => setTimeout(r, 300));
      const n = nb.getBoundingClientRect(), seen = n.top >= -1 && n.bottom <= innerHeight + 1;
      const playing = btn.getAttribute("aria-pressed") === "true"; btn.click();
      return { off, gap: Math.round(gap), seen, playing };
    });
    ok(!r.off, `${nm}: out of Solo the licks are not shown`);
    ok(r.gap >= 0 && r.gap <= 200, `${nm}: ▶ Play this lick sits right under the neck (${r.gap} px below it)`);
    ok(r.seen && r.playing, `${nm}: pressed from the foot of the page, the lick plays with the neck in sight`);
    await ctx.close();
  }
  for (const room of ["guitar", "bass"]) for (const [nm, o] of [["iPad sideways", { viewport: { width: 1180, height: 820 }, hasTouch: true }], ["computer", { viewport: { width: 1280, height: 720 } }], ["iPhone sideways", { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }]]) {
    const ctx = await b.newContext({ ...o, serviceWorkers: "block" });
    ctx.on("page", pg => pg.on("pageerror", e => errs.push(room + " " + nm + ": " + e.message)));
    await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#${room}`);
    await p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentDocument && f.contentDocument.querySelector('[data-so-mode="solo"]'); } catch (e) { return false; } }), null, { timeout: 60000 });
    const f = p.frames().find(x => new RegExp("music-" + room).test(x.url()));
    const r = await f.evaluate(async () => {
      const W = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
      const sm = document.querySelector('[data-so-mode="solo"]'); if (sm.offsetParent) { sm.click(); await W(800); }
      if (!document.body.classList.contains("aog-play")) { $("pvBig").click(); await W(600); }
      else { $("pvMore").click(); await W(200); $("pvSolo").click(); await W(800); $("pvMore").click(); await W(200); }
      const seen = e => { if (!e || !e.offsetParent) return false; const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2; if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return false; const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); };
      const lk = document.querySelector(".so-licks"), btn = $("soLickBtn"), nb = $("neckBox");
      const gap = Math.round(lk.getBoundingClientRect().top - nb.getBoundingClientRect().bottom);
      const shown = seen($("soLickSel")) && seen(btn);
      btn.click(); await W(600); const playing = btn.getAttribute("aria-pressed") === "true"; btn.click(); await W(200);
      $("pvMore").click(); await W(200); $("pvClose").click(); await W(500);
      return { shown, gap, playing, back: !!lk.previousElementSibling && lk.previousElementSibling.id === "neckBox" && !document.body.classList.contains("aog-play") };
    });
    ok(r.shown && r.gap >= -1 && r.gap <= 60, `${room}, ${nm}, whole screen: the lick menu and ▶ Play this lick are in sight right under the neck (${r.gap} px)`);
    ok(r.playing, `${room}, ${nm}, whole screen: a lick plays from there`);
    ok(r.back, `${room}, ${nm}: leaving the whole screen puts the licks back under the neck`);
    await ctx.close();
  }
  for (const room of ["guitar", "bass"]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block" });
    await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#${room}`);
    await p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentDocument && f.contentDocument.querySelector('[data-so-mode="solo"]'); } catch (e) { return false; } }), null, { timeout: 60000 });
    const f = p.frames().find(x => new RegExp("music-" + room).test(x.url()));
    await f.evaluate(async () => { document.querySelector('[data-so-mode="solo"]').click(); await new Promise(r => setTimeout(r, 800)); });
    await p.setViewportSize({ width: 900, height: 1300 }); await p.waitForTimeout(1500);
    const r = await f.evaluate(() => { const lk = document.querySelector(".so-licks"), nb = document.getElementById("neckBox"), ctl = document.querySelector(".aog-ctl");
      return { gap: Math.round(lk.getBoundingClientRect().top - nb.getBoundingClientRect().bottom), before: !ctl || !!(lk.compareDocumentPosition(ctl) & Node.DOCUMENT_POSITION_FOLLOWING) }; });
    ok(r.gap >= 0 && r.gap <= 200 && r.before, `${room}: the screen resized, the licks stay right under the neck, before the room's controls (${r.gap} px)`);
    await ctx.close();
  }
  for (const room of ["guitar", "bass"]) for (const [nm, o] of [["iPad sideways", { viewport: { width: 1180, height: 820 }, isMobile: true, hasTouch: true }], ["iPhone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
    const ctx = await b.newContext({ ...o, serviceWorkers: "block" });
    await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    const p = await ctx.newPage(); const ready = () => p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentDocument && f.contentDocument.querySelector('[data-so-mode="solo"]'); } catch (e) { return false; } }), null, { timeout: 60000 });
    await p.goto(`http://localhost:${PORT}/the-studio#${room}`); await ready();
    let f = p.frames().find(x => new RegExp("music-" + room).test(x.url()));
    await f.evaluate(async () => { const $ = id => document.getElementById(id), W = ms => new Promise(r => setTimeout(r, ms));
      if (document.body.classList.contains("aog-play")) { $("pvMore").click(); await W(200); $("pvSolo").click(); await W(800); $("pvClose").click(); await W(400); }
      else { document.querySelector('[data-so-mode="solo"]').click(); await W(800); } });
    await p.reload(); await ready(); await p.waitForTimeout(2500);
    f = p.frames().find(x => new RegExp("music-" + room).test(x.url()));
    const r = await f.evaluate(async () => { const $ = id => document.getElementById(id), W = ms => new Promise(r => setTimeout(r, ms));
      if (document.body.classList.contains("aog-play")) { $("pvMore").click(); await W(200); $("pvClose").click(); await W(800); }
      const lk = document.querySelector(".so-licks"), nb = $("neckBox");
      return { solo: document.body.classList.contains("aog-solo-on"), gap: Math.round(lk.getBoundingClientRect().top - nb.getBoundingClientRect().bottom) }; });
    ok(r.solo && r.gap >= 0 && r.gap <= 60, `${room}, ${nm}: opened again with Solo on, the licks are right under the neck (${r.gap} px)`);
    await ctx.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + e.message); process.exit(1); });
