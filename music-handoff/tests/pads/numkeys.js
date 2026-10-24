/* AOG-PADS-NUMKEYS-V1 (2026-10-23) — in the Drum Machine's B · Chords, the number keys 1 to 0, − and = play chords 1 to 12
   by their number, as on the Guitar and Bass; each of those pads shows its number key; the letters still play; banks A, C
   and D keep their keys; the line says so. Run: node pads/numkeys.js */
const { chromium } = require("playwright"); const srv = require("../srv.js"); const PORT = 9615; srv(PORT);
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block" }); const errs = [];
  ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", "en"); } catch (e) {} });
  const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#pads`); await W(4500);
  const f = p.frames().find(x => /music-pads/.test(x.url()));
  const bank = async n => { await f.evaluate(n => { const s = document.getElementById("bankSel"); s.value = String(n); s.dispatchEvent(new Event("change")); }, n); await f.waitForFunction(n => window.AOGPadsReady ? AOGPadsReady(n) : true, n, { timeout: 15000 }).catch(() => {}); await W(2500); };
  const caps = () => f.evaluate(() => [...document.querySelectorAll("#pads .pad")].map(x => { const k = x.querySelector(".pk"); return [+x.dataset.p, k ? k.textContent : ""]; }).sort((a, c) => a[0] - c[0]).map(x => x[1]));
  const hit = async (key, code) => { await f.evaluate(() => { window.__hits = []; document.querySelectorAll("#pads .pad").forEach(x => { x.__o && x.__o.disconnect(); x.__o = new MutationObserver(() => { window.__hits.push(+x.dataset.p); }); x.__o.observe(x, { attributes: true, attributeFilter: ["class", "style"] }); }); });
    await p.keyboard.down(key); await W(120); await p.keyboard.up(key); await W(200); return f.evaluate(() => window.__hits.slice(0, 1)); };   /* the pad that lit first; the one before it fades after */
  await f.click("#pads .pad"); await W(300);   /* a first tap wakes the sound */
  await bank(1);
  const c = await caps();
  ok(JSON.stringify(c.slice(0, 12)) === JSON.stringify(["1","2","3","4","5","6","7","8","9","0","−","="]) && !c.slice(12).some(x => /^[0-9]$/.test(x)),
    `B · Chords: pads 1 to 12 show the keys 1 to 0, − and =, and no other pad shows a number key: ${JSON.stringify(c)}`);
  const want = [["1", 0], ["7", 6], ["9", 8], ["0", 9], ["-", 10], ["=", 11]];
  for (const [k, i] of want) { const h = await hit(k); ok(h.length === 1 && h[0] === i, `B · Chords: the key ${k} plays chord ${i + 1}: ${JSON.stringify(h)}`); }
  const z = await hit("z"); ok(z.length === 1 && z[0] === 0, `B · Chords: a letter still plays its pad (Z, pad 1): ${JSON.stringify(z)}`);
  const line = await f.evaluate(() => document.getElementById("line").textContent);
  ok(/1 to 0, − and = for chords 1 to 12/.test(line), `the line tells the number keys in B · Chords: "${line}"`);
  await bank(0);
  const a = await caps(); const h1 = await hit("1");
  ok(a[12] === "1" && h1.length === 1 && h1[0] === 12, `A · Drums keeps its keys: the key 1 plays pad 13 as before: ${JSON.stringify({ cap: a[12], hit: h1 })}`);
  ok(errs.length === 0, "no page errors " + errs.slice(0, 3).join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
