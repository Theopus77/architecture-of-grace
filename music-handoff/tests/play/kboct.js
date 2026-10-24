/* AOG-PIANO-KBOCT-V1 (2026-10-24) — Jimmy: "I can't get to the higher notes using the keyboard as I can't get past F5". With
   three octaves in view (C4 to C7), the letters start on the lowest key; X moves them up an octave at a time across every key
   in view (their labels follow), then moves the view; Z brings them back down. Port 9616. */
const { chromium } = require("playwright"); const srv = require("../srv.js"); const PORT = 9616; srv(PORT);
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 1680, height: 1000 }, serviceWorkers: "block" }); const errs = [];
  ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", "en"); } catch (e) {} });
  const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#piano`); await W(4500);
  const f = p.frames().find(x => /music-piano/.test(x.url()));
  await f.evaluate(() => { window.__on = []; const o = window.noteOn; window.noteOn = function (src, m, v) { if (src === "c") window.__on.push(m); return o.apply(this, arguments); }; });
  const st = () => f.evaluate(() => ({ lo: KB.lo, hi: KB.hi, ko: KB.ko, capA: (() => { const k = [...document.querySelectorAll("#kbd .kc")].find(x => x.textContent === "A"); return k ? +k.closest("[data-m]").dataset.m : null; })() }));
  const play = async key => { await f.evaluate(() => { window.__on = []; }); await p.keyboard.down(key); await W(80); await p.keyboard.up(key); await W(80); return f.evaluate(() => window.__on.slice()); };
  await f.click("#kbd .wk"); await W(300);
  let s0 = await st(); const oc = Math.round((s0.hi - s0.lo) / 12);
  ok(oc >= 2, `several octaves in view (${oc}: ${s0.lo} to ${s0.hi})`);
  let a = await play("a"); ok(a[0] === s0.lo + 12 * s0.ko && s0.capA === a[0], `A plays the key labelled A (${JSON.stringify({ played: a, label: s0.capA })})`);
  /* X walks the letters up to the top octave in view */
  for (let i = s0.ko; i < oc - 1; i++) { await p.keyboard.press("x"); await W(200); }
  let s1 = await st(); a = await play("a"); const k = await play("k");
  ok(s1.ko === oc - 1 && a[0] === s1.lo + 12 * (oc - 1) && s1.capA === a[0] && k[0] === a[0] + 12 && k[0] <= s1.hi,
    `X moves the letters to the top octave in view: A plays ${a[0]}, K plays ${k[0]}, the view tops out at ${s1.hi}, and the labels follow (${JSON.stringify(s1)})`);
  /* Z brings them back */
  for (let i = 0; i < oc - 1; i++) { await p.keyboard.press("z"); await W(200); }
  const s2 = await st(); a = await play("a");
  ok(s2.ko === 0 && a[0] === s2.lo && s2.capA === s2.lo, `Z brings the letters back down to the lowest key (${JSON.stringify(s2)})`);
  ok(errs.length === 0, "no page errors " + errs.slice(0, 3).join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
