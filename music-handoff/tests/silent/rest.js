/* AOG-REST-IDLE-V1 (2026-10-17) — Jimmy: "We silenced everything that wasn't being used… (I thought)". The standing rule:
   "Rests when idle: no timer, loop or rAF while nothing plays." silent/hush allows a little; this allows none.
   1 · every room, left alone after its sounds are in (40 s, no touch): not one timer or frame callback in 3 s
   2 · and it wakes: a touch brings the meters' check and the turntables' drawing straight back
   No page errors. Port 9397. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const PORT = 9397, U = "http://localhost:" + PORT + "/"; const srv = require("../srv.js")(PORT);
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const COUNT = () => { window.__calls = 0; window.__what = []; const si = window.setInterval, st = window.setTimeout, raf = window.requestAnimationFrame;
  const tag = k => { const s = (new Error().stack || "").split("\n")[3] || ""; return () => { window.__calls++; if (window.__what.length < 6) window.__what.push(k + " " + s.trim()); }; };
  window.setInterval = (f, ...a) => { const t = tag("interval"); return si(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.setTimeout = (f, ...a) => { const t = tag("timeout"); return st(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.requestAnimationFrame = f => { const t = tag("frame"); return raf(x => { t(); f(x); }); }; };
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  const rooms = ["music-piano.html", "music-guitar.html", "music-bass.html", "music-band.html", "music-pads.html", "music-kit.html", "music-decks.html"];
  await Promise.all(rooms.map(async room => {
    const c = await b.newContext({ viewport: { width: 1024, height: 768 }, serviceWorkers: "block" }); await c.addInitScript(COUNT);
    c.on("page", pg => pg.on("pageerror", e => errs.push(room + ": " + e.message)));
    await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    const p = await c.newPage(); await p.goto(U + room); await p.waitForTimeout(40000);
    const r = await p.evaluate(async () => { window.__calls = 0; window.__what = []; const t0 = performance.now();
      await new Promise(r => setTimeout(r, 3000)); return { n: window.__calls - 1, what: window.__what.filter(w => !/eval at evaluate/.test(w)).slice(0, 3) }; });
    ok(r.n === 0, `${room}: left alone, it rests completely: ${r.n} timer/frame callbacks in 3 s ${r.what.join(" | ")}`);
    if (room === "music-decks.html" || room === "music-piano.html") {
      const w = await p.evaluate(async () => { window.__calls = 0; document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await new Promise(r => setTimeout(r, 600)); return window.__calls - 1; });
      ok(w > 0, `${room}: a touch wakes it (${w} callbacks in 0.6 s)`);
    }
    await c.close();
  }));
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + e.message); process.exit(1); });
