/* AOG-PADS-PAT-ANYSCALE-V1 — Jimmy: "I don't get the chords golden light up when I switch to minor keys in the chord bank.
   That needs to be fixed." On the Drum Machine's chord bank: Anime and J-pop · 4 5 3 6 lights pads 4, 5, 3, 6 in gold in
   C major; switching the scale to Minor keeps the pattern picked and the same four pads gold (now C minor's chords), and
   says so in one plain line; with the bank already in Minor, picking Anime and J-pop keeps it in Minor (it used to flip
   back to Major) and lights the same pads; a minor pattern picked in minor lights its pads, and stays lit in major; Choose a pattern…
   clears the gold; Spanish; a reload keeps it; an iPad and an iPhone, light and dark: readable and calm; no page errors.
   Port 9254. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9254, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort()); }
/* the gold pads: pad number → its step numbers, and each pad's chord */
const gold = p => p.evaluate(() => [...document.querySelectorAll(".pads button.pad.inpat")].map(b => (+b.getAttribute("data-p") + 1) + "=" + (b.querySelector(".po") || {}).textContent + ":" + (b.querySelector(".pn") || {}).textContent)
  .sort((a, b) => parseInt(a) - parseInt(b)).join(" "));
const line = p => p.evaluate(() => document.getElementById("guideNow").textContent.trim());
async function chordsBank(p) { const bi = await p.evaluate(() => S.banks.findIndex(b => b.type === "chords")); await p.selectOption("#bankSel", String(bi)); await p.waitForTimeout(300); }

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1024, height: 1366 } }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "music-pads.html"); await p.waitForTimeout(1500);
  await chordsBank(p);
  await p.selectOption("#fKey", "0").catch(() => {});
  await p.selectOption("#fScale", "major"); await p.waitForTimeout(200);
  await p.selectOption("#fPat", "anime"); await p.waitForTimeout(300);
  let g = await gold(p);
  ok(g === "3=3:Em 4=1:F 5=2:G 6=4:Am", "C major, Anime and J-pop · 4 5 3 6: pads 4, 5, 3, 6 are gold: " + g);

  /* 1 · switch to Minor: the same steps stay gold */
  await p.selectOption("#fScale", "minor"); await p.waitForTimeout(300);
  g = await gold(p);
  ok(await p.inputValue("#fPat") === "anime", "switching to Minor keeps the pattern picked");
  ok(g === "3=3:E♭ 4=1:Fm 5=2:Gm 6=4:A♭", "in C minor the same pads 4, 5, 3, 6 are gold, with C minor's chords: " + g);
  ok(await line(p) === "Play the gold numbers in order: pads 4, 5, 3, 6. One chord each bar. The same steps, with this key's chords.", "one plain line says so: " + await line(p));
  /* a reload keeps it */
  await p.reload(); await p.waitForTimeout(1500); await chordsBank(p);
  ok(await gold(p) === g && await p.inputValue("#fScale") === "minor", "a reload keeps the pattern and its gold in minor");

  /* 1b · everything set first: Minor, then the pattern. The scale stays Minor and the pads light */
  await p.selectOption("#fPat", ""); await p.selectOption("#fScale", "minor"); await p.waitForTimeout(200);
  await p.selectOption("#fPat", "anime"); await p.waitForTimeout(300);
  ok(await p.inputValue("#fScale") === "minor" && await gold(p) === "3=3:E♭ 4=1:Fm 5=2:Gm 6=4:A♭", "Minor first, then Anime and J-pop: it stays Minor and pads 4, 5, 3, 6 are gold: " + await gold(p));
  await p.selectOption("#fKey", "9"); await p.waitForTimeout(300);
  ok(await p.inputValue("#fScale") === "minor" && await gold(p) === "3=3:C 4=1:Dm 5=2:Em 6=4:F", "in A minor too: " + await gold(p));
  await p.selectOption("#fKey", "0"); await p.waitForTimeout(200);

  /* 2 · a minor pattern, in minor and then in major */
  await p.selectOption("#fPat", "minor"); await p.waitForTimeout(300);
  const gm = await gold(p);
  ok(await p.inputValue("#fScale") === "minor" && gm.split(" ").length === 4 && await line(p) === "Play the gold numbers in order: pads 1, 6, 3, 7. One chord each bar.", "Minor groove lights its four pads in minor: " + gm);
  await p.selectOption("#fScale", "major"); await p.waitForTimeout(300);
  ok((await gold(p)).replace(/:[^ ]*/g, "") === gm.replace(/:[^ ]*/g, "") && /The same steps/.test(await line(p)), "and they stay gold in major: " + await gold(p));

  /* 3 · Choose a pattern… clears the gold; Spanish */
  await p.selectOption("#fPat", ""); await p.waitForTimeout(200);
  ok(await gold(p) === "" && await line(p) === "Not sure which chords? Pick a pattern. Pad 1 is home.", "Choose a pattern… clears the gold");
  await p.selectOption("#fPat", "anime"); await p.selectOption("#fScale", "minor"); await p.waitForTimeout(200);
  await p.evaluate(() => document.getElementById("langBtn") && document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  ok(/Los mismos pasos, con los acordes de este tono\.$/.test(await line(p)), "Spanish: " + await line(p));
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 4 · an iPad and an iPhone, light and dark */
  for (const [dev, theme] of [["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"], ["iPhone 13", "light"], ["iPhone 13", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-pads.html"); await m.waitForTimeout(1500);
    await chordsBank(m); await m.selectOption("#fScale", "major"); await m.selectOption("#fPat", "anime"); await m.selectOption("#fScale", "minor"); await m.waitForTimeout(300);
    await m.locator(".pads").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const n = (await gold(m)).split(" ").filter(Boolean).length;
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    const sw = await m.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth);
    ok(n === 4 && sw && !pc.length && !pk.length, `${dev}, ${theme}: four gold pads in minor (${n}), nothing sideways, reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the iPad or the iPhone " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
