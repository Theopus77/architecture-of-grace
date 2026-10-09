/* AOG-SOUNDPICK-V1 — Jimmy: "Can the instrument choice also sit right above or below the instruments itself … (Perhaps
   two drop down menus work as well)". In the Piano, the Guitar, the Bass and the Band the instrument choice is two short
   menus by the instrument: the Piano's under its keys, the Guitar's and the Bass's under the neck, the Band's above its
   keys. The first lists the kinds (the menu's own groups), the second the sounds of that kind. Picking a kind picks its
   first sound; picking a sound plays it; a sound set any other way (the page's own menu) shows in both. The old
   Instrument row is gone from the top. Spanish. iPhone and iPad, light and dark: readable, calm, nothing sideways; in the
   Recording Studio too. No page errors. Port 9258. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9258, U = "http://localhost:" + PORT + "/";
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
/* each room: where the menus sit, the words, a kind to pick and its first sound, a sound of another kind */
const ROOMS = [
  { file: "music-piano.html", id: "piano", where: "after the keys", kindW: "Kind", soundW: "Sound", kindEs: "Tipo", pickKind: "Organs and accordion", other: "bells" },
  { file: "music-guitar.html", id: "guitar", where: "after the neck", kindW: "Style", soundW: "Sound", kindEs: "Estilo", pickKind: "Metal", other: "steel" },
  { file: "music-bass.html", id: "bass", where: "after the neck", kindW: "Style", soundW: "Sound", kindEs: "Estilo", pickKind: "Upright and synth", other: "finger" },
  { file: "music-band.html", id: "band", where: "above the keys", kindW: "Section", soundW: "Instrument", kindEs: "Sección", pickKind: "Woodwinds", other: "trumpet" }
];
const place = p => p.evaluate(() => {
  const w = document.querySelector(".sp-wrap"), kbd = document.getElementById("kbd"), nb = document.getElementById("neckBox");
  const before = (a, b) => !!(a && b) && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  return { afterKeys: before(kbd, w) && w.previousElementSibling === kbd, afterNeck: before(nb, w) && w.previousElementSibling === nb,
    aboveKeys: before(w, kbd) && w.closest(".blk") === kbd.closest(".blk"),
    oldGone: !document.querySelector("#rig > .blk:not([hidden]) > .row #soundSel") };
});
const state = p => p.evaluate(() => ({ kind: document.getElementById("spKind").selectedOptions[0].textContent, sound: document.getElementById("spSound").value,
  soundName: document.getElementById("spSound").selectedOptions[0].textContent, src: document.getElementById("soundSel").value, n: document.getElementById("spSound").options.length,
  kl: document.getElementById("spKindLab").textContent, sl: document.getElementById("spSoundLab").textContent, s: typeof S !== "undefined" ? S.sound : "" }));

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  for (const R of ROOMS) {
    await p.goto(U + R.file); await p.waitForTimeout(2000);
    const pl = await place(p);
    ok((R.where === "after the keys" ? pl.afterKeys : R.where === "after the neck" ? pl.afterNeck : pl.aboveKeys) && pl.oldGone,
      `${R.id}: the two menus sit ${R.where}, and the old Instrument row is gone from the top: ${JSON.stringify(pl)}`);
    let s = await state(p);
    ok(s.kl === R.kindW && s.sl === R.soundW && s.sound === s.src && s.src === s.s, `${R.id}: ${s.kl} · ${s.sl}, showing ${s.kind} · ${s.soundName}`);
    const first = await p.evaluate(k => { const g = [...document.getElementById("soundSel").querySelectorAll("optgroup")].find(x => x.label === k); return g ? { v: g.children[0].value, n: g.children.length } : null; }, R.pickKind);
    await p.selectOption("#spKind", { label: R.pickKind }); await p.waitForTimeout(700);
    s = await state(p);
    ok(first && s.kind === R.pickKind && s.src === first.v && s.s === first.v && s.n === first.n, `${R.id}: picking ${R.pickKind} picks its first sound (${s.soundName}) and lists only its ${first && first.n} sounds`);
    const second = await p.evaluate(() => document.getElementById("spSound").options[1] && document.getElementById("spSound").options[1].value);
    if (second) { await p.selectOption("#spSound", second); await p.waitForTimeout(700); s = await state(p);
      ok(s.src === second && s.s === second, `${R.id}: picking a sound plays it: ${s.soundName}`); }
    await p.selectOption("#soundSel", R.other); await p.waitForTimeout(900);
    s = await state(p);
    ok(s.sound === R.other && s.src === R.other, `${R.id}: a sound set any other way shows in both menus: ${s.kind} · ${s.soundName}`);
    await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); }); await p.waitForTimeout(900);
    s = await state(p);
    ok(s.kl === R.kindEs, `${R.id} in Spanish: ${s.kl} · ${s.sl} · ${s.kind}`);
    await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); }); await p.waitForTimeout(300);
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* an iPhone and an iPad, light and dark; and in the Recording Studio */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage();
    for (const R of ROOMS) {
      await m.goto(U + R.file); await m.waitForTimeout(1800);
      await m.evaluate(() => document.querySelector(".sp-wrap").scrollIntoView({ block: "center" })); await m.waitForTimeout(200);
      const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`), sw = await m.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1);
      const fit = await m.evaluate(() => [...document.querySelectorAll("#spKind,#spSound")].every(e => { const r = e.getBoundingClientRect(); return r.width > 100 && r.right <= innerWidth && parseFloat(getComputedStyle(e).fontSize) >= 16; }));
      ok(sw && fit && !pc.length && !pk.length, `${dev}, ${theme}, ${R.id}: the menus fit (${fit}), nothing sideways, readable (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and calm (${pk.join("; ") || "ok"})`);
    }
    if (theme === "light") {
      await m.goto(U + "the-studio#guitar");
      await m.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /guitar/.test(d.location.pathname); }, null, { timeout: 20000 });
      await m.waitForTimeout(1500);
      const f = m.frames().find(x => x.parentFrame() === m.mainFrame());
      const g = await f.evaluate(() => { const w = document.querySelector(".sp-wrap"), nb = document.getElementById("neckBox"); return !!w && w.previousElementSibling === nb && !w.closest("[hidden]"); });
      ok(g, `${dev}: in the Recording Studio, the guitar's two menus sit under its neck`);
    }
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the iPhone or the iPad " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
