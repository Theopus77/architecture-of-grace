/* AOG-SILENT-V1 (2026-10-12) — Jimmy: "Make sure everything that has been built and will continue to be built has the silent
   treatment as I want this website LIGHT SPEED!!" In every instrument room: a sound engine a page adds with AOGVU.own(ctx) is
   paused by the Studio's hush and woken after; hush tells the page ("aog-hush", on and off); and a room left alone does almost
   nothing (timer and frame callbacks counted over 3 s). Port 9312. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const PORT = 9312, U = "http://localhost:" + PORT + "/"; const srv = require("../srv.js")(PORT);
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const COUNT = () => { window.__calls = 0; const si = window.setInterval, st = window.setTimeout, raf = window.requestAnimationFrame;
  window.setInterval = (f, ...a) => si(() => { window.__calls++; typeof f === "function" && f(); }, ...a);
  window.setTimeout = (f, ...a) => st(() => { window.__calls++; typeof f === "function" && f(); }, ...a);
  window.requestAnimationFrame = f => raf(t => { window.__calls++; f(t); }); };
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  for (const room of ["music-piano.html", "music-guitar.html", "music-bass.html", "music-band.html", "music-pads.html", "music-kit.html", "music-decks.html"]) {
    const c = await b.newContext({ viewport: { width: 1024, height: 768 }, serviceWorkers: "block" }); await c.addInitScript(COUNT);
    c.on("page", pg => pg.on("pageerror", e => errs.push(room + ": " + e.message)));
    await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    const p = await c.newPage(); await p.goto(U + room); await p.waitForTimeout(6000);
    const r = await p.evaluate(async () => {
      const c = new AudioContext(); await c.resume(); const seen = []; window.addEventListener("aog-hush", e => seen.push(e.detail.on));
      AOGVU.own(c); AOGVU.hush(true); await new Promise(r => setTimeout(r, 200)); const off = c.state;
      AOGVU.hush(false); await new Promise(r => setTimeout(r, 200)); const on = c.state; c.close();
      window.__calls = 0; await new Promise(r => setTimeout(r, 3000)); return { off, on, seen: seen.join(), idle: window.__calls - 1 };
    });
    ok(r.off === "suspended" && r.on === "running" && r.seen === "true,false", `${room}: an engine added with AOGVU.own rests out of sight and wakes after; the page is told: ${JSON.stringify(r)}`);
    ok(r.idle <= 25, `${room}: left alone it rests: ${r.idle} timer/frame callbacks in 3 s`);
    await c.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
