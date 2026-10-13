/* AOG-PIANO-STEADY-V1 (2026-10-13) — Jimmy, on his iPhone held sideways, the Piano in the Studio: "after 5 notes, it seems
   to hit a glitch so I can't keep tempo". An iPhone on its side (iPhone 13 landscape: touch, the room's whole-screen keys),
   its processor slowed four times through the DevTools protocol, the Studio opened at /the-studio#piano as a visitor gets it
   (the made room, fast/music-piano.html). As soon as the piano can play, 40 notes by real touches at a steady tempo (24
   eighths at 100 bpm, then 16 sixteenths, a three-finger chord every sixth): each note reaches the piano within the budget,
   no recording is fetched or unpacked and the Studio fetches nothing mid-phrase, no long task. Then, once the hands are
   still, what waited happens: the soft and loud layers come in, the lesson tick is kept, the Studio fetches the next room.
   The Band (its keys sideways) the same way, briefly. Ports 9320, 9321. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const RATE = 4, FIRST_OK = 120, NOTE_MS = 30, P95_MS = 22;   /* ms at four times slower: a phone's touch to the piano's play call */
/* the site's own addresses (aog-deploy/_redirects): the Studio, and each room's made page */
function serve(port) {
  const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp3": "audio/mpeg", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
  return http.createServer((q, r) => {
    let u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
    if (u === "/the-studio" || u === "/music") u = "/the-studio.html";
    else { const m = u.match(/^\/(music-[a-z]+\.html)$/); if (m && fs.existsSync(path.join(ROOT, "fast", m[1]))) u = "/fast/" + m[1]; }
    if (u.endsWith("/")) u += "index.html";
    let f = path.join(ROOT, u); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": T[path.extname(f)] || "application/octet-stream" }); r.end(d); });
  }).listen(port);
}
/* in every frame: what is fetched and unpacked, the long tasks, each touch */
const PROBE = () => {
  const P = window.__P = { ev: [], lt: [] }, A = () => performance.timeOrigin + performance.now();
  try { new PerformanceObserver(l => l.getEntries().forEach(e => P.lt.push({ t: performance.timeOrigin + e.startTime, d: e.duration }))).observe({ type: "longtask", buffered: true }); } catch (e) {}
  const f0 = window.fetch; window.fetch = function (u) { P.ev.push({ k: "fetch", t: A(), u: String(u && u.url || u) }); return f0.apply(this, arguments); };
  const B = window.BaseAudioContext || window.AudioContext;
  if (B && B.prototype.decodeAudioData) { const d0 = B.prototype.decodeAudioData; B.prototype.decodeAudioData = function () { P.ev.push({ k: "decode", t: A() }); return d0.apply(this, arguments); }; }
  window.addEventListener("touchstart", e => P.ev.push({ k: "touch", t: A(), ts: performance.timeOrigin + e.timeStamp }), true);
};
async function room(b, port, id, file, ready, playFn) {
  const srv = serve(port), U = "http://localhost:" + port + "/";
  const c = await b.newContext({ ...pw.devices["iPhone 13 landscape"], serviceWorkers: "block" });
  await c.addInitScript(PROBE); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const errs = []; c.on("page", pg => pg.on("pageerror", e => errs.push(e.message)));
  const p = await c.newPage(), cdp = await c.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: RATE });
  await p.goto(U + "the-studio#" + id);
  let f = null; for (let i = 0; i < 300 && !f; i++) { f = p.frames().find(x => x.url().indexOf(file) >= 0); if (!f) await p.waitForTimeout(100); }
  await f.waitForFunction(ready, null, { timeout: 90000 });
  const fast = await f.evaluate(() => /AOG-FAST-BUILD-V1/.test(document.documentElement.innerHTML.slice(0, 600)) || !!document.querySelector('script[src^="/front/"]'));
  const view = await f.evaluate(() => ({ bp: typeof BP !== "undefined" && BP.on, keys: document.querySelectorAll("#kbd [data-m]").length }));
  ok(fast && view.bp && view.keys >= 20, `${id}: the Studio opens the made room, sideways the keys fill the screen (${view.keys} keys)`);
  await f.evaluate(playFn => { const P = window.__P, A = () => performance.timeOrigin + performance.now(), on = window[playFn];
    window[playFn] = function () { const s = A(), r = on.apply(this, arguments); P.ev.push({ k: "play", t: s, d: A() - s }); return r; }; }, playFn);
  const fr = await (await f.frameElement()).boundingBox();
  const keys = await f.evaluate(() => [...document.querySelectorAll("#kbd .wk")].map(el => { const r = el.getBoundingClientRect(); return { m: +el.getAttribute("data-m"), x: r.x + r.width / 2, y: r.y + r.height * 0.82 }; }).filter(k => k.x > 0));
  const at = i => ({ x: fr.x + keys[i].x, y: fr.y + keys[i].y });
  const plan = []; let t = 0, W = Math.min(keys.length - 4, 10);
  for (let i = 0; i < 40; i++) { const step = i < 24 ? 300 : 150, k = (i * 3) % W, chord = i % 6 === 5; plan.push({ t, ks: chord ? [k, k + 2, k + 4] : [k], hold: step * 0.6 }); t += step; }
  const S0 = Date.now() + 300;
  for (const n of plan) {
    let w = S0 + n.t - Date.now(); if (w > 0) await new Promise(r => setTimeout(r, w));
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: n.ks.map((k, j) => ({ ...at(k), id: j + 1 })) });
    w = S0 + n.t + n.hold - Date.now(); if (w > 0) await new Promise(r => setTimeout(r, w));
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }
  const S1 = Date.now() + 300; await p.waitForTimeout(400);
  const ev = (await f.evaluate("__P.ev")), lt = (await f.evaluate("__P.lt")).concat(await p.evaluate("__P.lt")), top = await p.evaluate("__P.ev");
  /* a chord's fingers land together: one note, the first finger's moment */
  const touches = ev.filter(e => e.k === "touch" && e.t >= S0 - 50).filter((e, i, a) => !i || e.ts - a[i - 1].ts > 20), plays = ev.filter(e => e.k === "play");
  const rows = touches.map((e, i) => { const nx = touches[i + 1] ? touches[i + 1].ts : Infinity, p0 = plays.find(x => x.t >= e.ts - 5 && x.t < nx); return p0 ? p0.t - e.ts + p0.d : null; });
  const later = rows.slice(1).filter(x => x != null).sort((a, b) => a - b), p95 = later[Math.floor(later.length * 0.95)] || 0, worst = later[later.length - 1] || 0;
  ok(touches.length === 40 && rows.every(x => x != null), `${id}: 40 notes touched, every one played (${touches.length} touched, ${rows.filter(x => x != null).length} played)`);
  ok(rows[0] != null && rows[0] <= FIRST_OK, `${id}: the first note reaches the room in ${Math.round(rows[0])} ms (it wakes the sound engine; budget ${FIRST_OK})`);
  ok(worst <= NOTE_MS && p95 <= P95_MS, `${id}: every later note within ${NOTE_MS} ms of its touch (worst ${worst.toFixed(1)}, 95% within ${p95.toFixed(1)}, budget ${P95_MS}; four times slower than a phone)`);
  /* (a download already asked for as the first finger lands may still be on its way: it is not unpacked) */
  const mid = ev.concat(top).filter(e => (e.k === "decode" || (e.k === "fetch" && e.t > touches[0].ts + 50)) && e.t >= touches[0].ts && e.t <= S1);
  ok(mid.length === 0, `${id}: nothing fetched or unpacked mid-phrase: ${mid.map(e => e.k + " " + (e.u || "").split("/").slice(-2).join("/") + " at " + Math.round(e.t - touches[0].ts) + " ms").slice(0, 6).join(", ") || "none"}`);
  const long = lt.filter(x => x.t >= touches[0].ts && x.t <= S1);
  ok(long.length === 0, `${id}: no long task while playing: ${long.map(x => Math.round(x.d) + " ms").join(", ") || "none"}`);
  return { srv, c, p, f, errs, S1 };
}
(async () => {
  const b = await pw.chromium.launch();
  /* the Piano: playing starts the moment the middle layer is in (the soft and loud layers have not come yet) */
  { const { srv, c, p, f, errs, S1 } = await room(b, 9320, "piano", "music-piano", () => typeof SETS !== "undefined" && SETS.grand && SETS.grand.ready, "noteOn");
    const pre = await f.evaluate(() => ({ done: SETS.grand.done, total: SETS.grand.total, tick: !!LS.done.key1, kept: /key1/.test(localStorage.getItem("aog.piano.lessons.v1") || "") }));
    ok(pre.tick && pre.done < pre.total, `piano: the soft and loud layers wait while the hands play (${pre.done} of ${pre.total} in); the first lesson tick is made at once`);
    await f.waitForFunction(() => SETS.grand.state === "ready" && SETS.grand.done >= SETS.grand.total, null, { timeout: 120000 });
    const post = await f.evaluate(() => ({ kept: /key1/.test(localStorage.getItem("aog.piano.lessons.v1") || ""), card: document.getElementById("lKick").textContent }));
    ok(post.kept && /\d/.test(post.card), `piano: once the hands are still the layers all come in, and the tick is kept and shown (${post.card})`);
    await p.waitForFunction(() => window.__P.ev.some(e => e.k === "fetch" && /\/(fast\/)?music-(pads|kit|guitar|bass|band|decks|studio)\.html/.test(e.u)), null, { timeout: 60000 });
    const warm = await p.evaluate(S1 => window.__P.ev.filter(e => e.k === "fetch" && /music-[a-z]+\.html/.test(e.u))[0].t - S1, S1);
    ok(warm >= 4000, `the Studio fetches the next room only after the keys were still: ${Math.round(warm / 1000)} s after the last note`);
    ok(errs.length === 0, "piano: no page errors " + errs.join(" | ")); await c.close(); srv.close(); }
  /* the Band: the same, on its keys */
  { const { srv, c, errs } = await room(b, 9321, "band", "music-band", () => typeof soundReady === "function" && soundReady(S.sound), "noteOn");
    ok(errs.length === 0, "band: no page errors " + errs.join(" | ")); await c.close(); srv.close(); }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
