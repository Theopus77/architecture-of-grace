/* AOG-DJ-SCRATCH-V1 — Jimmy: "There is some lag on the turn tables scratching." Inside the Recording Studio
   (/the-studio#decks, the made page fast/music-decks.html), on an iPad and on an iPhone held sideways, with the CPU
   slowed four times: a finger scratches the record back and forth (real touch events) for a few seconds, and this
   measures, move by move, the time from the touch to the page's handler, the handler itself, the trip to the deck's
   engine, and how far the record's speed trails the finger (the hand-to-sound lag), the long tasks while scratching,
   and the sound itself (no clicks). Then a throw: let go mid-push and the record keeps its spin, and the motor pulls it
   back to speed. Port 9330. MEASURE=1 prints every number. */
const { pw, ok, done } = require("./lib.js");
const fs = require("fs"), path = require("path");
const PORT = 9330, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const LOUD = !!process.env.MEASURE;

/* the deck's engine, with a log: when each hand message arrives (audio clock), each block's speed, and the sound */
const WK = fs.readFileSync(path.join(ROOT, "aog-vinyl-worklet.js"), "utf8");
const HOOK_MSG = "this.port.onmessage = (e) => { this.core.msg(e.data); };";
const HOOK_PROC = "this.core.process(out[0], out[1] || out[0], n);";
const WKX = WK.replace(HOOK_MSG, `this.__a = []; this.__b = []; this.__o = null; this.__on = false;
        this.port.onmessage = (e) => { const m = e.data;
          if (m && m.t === "__go") { this.__a = []; this.__b = []; this.__o = new Float32Array(sampleRate * 12); this.__n = 0; this.__on = true; return; }
          if (m && m.t === "__get") { this.__on = false; this.port.postMessage({ t: "__log", a: this.__a, b: this.__b, o: this.__o ? this.__o.slice(0, this.__n) : null, sr: sampleRate }); return; }
          if (this.__on && m && m.seq != null) this.__a.push([m.seq, currentFrame]);
          this.core.msg(m); };`)
  .replace(HOOK_PROC, HOOK_PROC + `
        if (this.__on) { this.__b.push([currentFrame, this.core.rate / (this.core.srRatio || 1), this.core.pos, this.core.handOn ? 1 : 0]);
          const o = this.__o, L = out[0]; for (let i = 0; i < n && this.__n < o.length; i++) o[this.__n++] = L[i]; }`);
if (WKX.indexOf("__go") < 0 || WKX.indexOf("this.__b.push") < 0) { console.log("CRASH the engine's hooks are not where they were"); process.exit(1); }

const DEVICES = [["iPad", pw.devices["iPad Pro 11 landscape"]], ["iPhone", pw.devices["iPhone 13 landscape"]]];

async function run(name, device) {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext(Object.assign({}, device));
  const errs = [];
  c.on("page", pg => pg.on("pageerror", e => errs.push(e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await c.route(/\/music-decks\.html(\?.*)?$/, r => r.fulfill({ path: path.join(ROOT, "fast/music-decks.html"), contentType: "text/html" }));
  /* a worklet's module does not pass through the routes: the logged engine goes in by hand */
  await c.addInitScript(src => { try { const oa = AudioWorklet.prototype.addModule; AudioWorklet.prototype.addModule = function (u, o) {
    if (/aog-vinyl-worklet/.test(String(u))) u = URL.createObjectURL(new Blob([src], { type: "text/javascript" })); return oa.call(this, u, o); }; } catch (e) {} }, WKX);
  const p = await c.newPage();
  await p.goto(U + "the-studio#decks");
  await p.waitForFunction(() => { const fr = document.getElementById("room"), d = fr && fr.contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /music-decks\.html$/.test(d.location.pathname); }, null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  const f = await (await p.$("#room")).contentFrame();
  await f.evaluate(() => loadMade(decks[0], "house"));
  await f.waitForFunction(() => decks[0].buf && decks[0].bpm > 0 && (decks[0].node || decks[0].core), null, { timeout: 60000 });
  /* the log: each hand message numbered and timed as it leaves; each move timed from the touch to the handler's end */
  await f.evaluate(() => {
    const os = window.send; let seq = 0; window.__S = []; window.__M = []; window.__L = [];
    window.send = function (d, m) { if (m && m.t === "hand" && d === decks[0]) { m.seq = seq++; __S.push([m.seq, performance.now(), actx.currentTime, m.rate, m.on ? 1 : 0, m.x, m.v, m.ts]); } return os(d, m); };
    const pl = document.querySelector('#deckA .platter'), om = pl.onpointermove;
    pl.scrollIntoView({ block: "center" });
    pl.onpointermove = function (e) { const t0 = performance.now(), r = pl.getBoundingClientRect();
      const pts = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
      const ang = pts.map(ev => [ev.timeStamp, Math.atan2(ev.clientY - (r.top + r.height / 2), ev.clientX - (r.left + r.width / 2)) * 180 / Math.PI]);
      const out = om.call(this, e); __M.push([e.timeStamp, t0, performance.now(), actx.currentTime, ang]); return out; };
    try { new PerformanceObserver(l => l.getEntries().forEach(x => __L.push([x.startTime, x.duration, x.name]))).observe({ type: "longtask" }); } catch (e) {}
    decks[0].node.port.addEventListener("message", e => { if (e.data && e.data.t === "__log") window.__W = e.data; });
    /* the page's own frame loop, each time it runs; and each finger landing */
    window.__F = []; const ol = window.loop; window.loop = function () { __F.push(performance.now()); return ol.apply(this, arguments); };
    window.__D = []; pl.addEventListener("pointerdown", e => __D.push(e.timeStamp), true);
  });
  /* the record playing: a DJ scratches over a playing record (pressed without scrolling the platter away) */
  await f.evaluate(() => document.querySelector('[data-play="A"]').click());
  await p.waitForTimeout(1500);
  const geo = await p.evaluate(() => { const fr = document.getElementById("room").getBoundingClientRect(), d = document.getElementById("room").contentDocument;
    const r = d.querySelector("#deckA .platter").getBoundingClientRect(); return { x: fr.left + r.left + r.width / 2, y: fr.top + r.top + r.height / 2, rad: r.width / 2 }; });
  const cdp = await c.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await f.evaluate(() => decks[0].node.port.postMessage({ t: "__go" }));
  await p.waitForTimeout(700);
  const R = geo.rad * 0.7, A = 50, HZ = 2.5, SEC = 3.2, a0 = -90;
  const at = deg => ({ x: geo.x + R * Math.cos(deg * Math.PI / 180), y: geo.y + R * Math.sin(deg * Math.PI / 180), id: 1, radiusX: 8, radiusY: 8, force: 1 });
  /* a finger samples about 120 times a second on an iPad: the moves are sent on time, not each after the last one's answer */
  /* each touch carries the moment it was made, the way a real touch screen stamps it */
  const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts, timestamp: (performance.timeOrigin + performance.now()) / 1000 }).catch(() => {});
  const nap = ms => new Promise(r => setTimeout(r, ms));
  await touch("touchStart", [at(a0)]);
  const t0 = performance.now(), e0 = performance.timeOrigin + t0; let last = a0;
  for (;;) { const t = (performance.now() - t0) / 1000; if (t > SEC) break; last = a0 + A * Math.sin(2 * Math.PI * HZ * t); touch("touchMove", [at(last)]); await nap(8); }
  /* the throw: a quick push forward, and let go while the hand is still moving */
  const tt = Date.now(), from = last;
  for (;;) { const t = (Date.now() - tt) / 1000; if (t > 0.15) break; last = from + 1400 * t; touch("touchMove", [at(last)]); await nap(8); }
  await touch("touchEnd", []);
  await p.waitForTimeout(700);
  /* a slow, steady pull, the one that stretches a vocal: it must drag evenly, not warble */
  const sl0 = performance.timeOrigin + performance.now();
  await touch("touchStart", [at(a0)]);
  for (;;) { const t = (performance.timeOrigin + performance.now() - sl0) / 1000; if (t > 1.4) break; touch("touchMove", [at(a0 + 170 * t)]); await nap(8); }
  const sl1 = performance.timeOrigin + performance.now();
  await touch("touchEnd", []);
  await p.waitForTimeout(400);
  await f.evaluate(() => decks[0].node.port.postMessage({ t: "__get" }));
  await f.waitForFunction(() => window.__W, null, { timeout: 10000 });
  const D = await f.evaluate(([e0, A, HZ, sl]) => ({ F: __F.slice(), S: __S.slice(), M: __M.slice(), L: __L.slice(), W: { a: __W.a, b: __W.b, sr: __W.sr, o: Array.from(__W.o) }, touch: TOUCH[touch], dps: DEG_PER_SEC, origin: performance.timeOrigin, e0: e0, A: A, HZ: HZ, sl: sl,
    base: actx.baseLatency, out: actx.outputLatency }), [e0, A, HZ, [sl0, sl1]]);
  /* after rest: the record stopped and the page left alone until it looks only four times a second (AOG-DJ-REST-V1),
     then a hand: from the finger landing to the first hand message, and to the page drawing every frame again */
  await f.evaluate(() => { document.querySelector('[data-play="A"]').click(); });
  await p.waitForTimeout(7000);
  const r0 = await f.evaluate(() => ({ s: __S.length, f: __F.length, d: __D.length, rested: !!LOOPQ.t }));
  await touch("touchStart", [at(a0)]);
  for (let i = 0; i < 25; i++) { touch("touchMove", [at(a0 + i * 2)]); await nap(8); }
  await p.waitForTimeout(400);                                   /* the finger stays down, still */
  const still = await f.evaluate(() => ({ held: Math.abs(decks[0].rate), heldLevel: decks[0].level }));
  await touch("touchEnd", []);
  await p.waitForTimeout(300);
  const rest = await f.evaluate(r0 => { const d = __D[r0.d], s = __S.slice(r0.s).filter(x => x[4]), fr = __F.slice(r0.f).filter(t => t >= d);
    return { rested: r0.rested, first: d != null && s.length ? s[0][1] - d : -1, frame: fr.length > 2 ? fr[0] - d : -1, gap: fr.length > 2 ? Math.max(...fr.slice(1, 10).map((t, i) => t - fr[i])) : -1 }; }, r0);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await b.close();
  const out = analyse(name, D, errs); out.rest = Object.assign(rest, still); if (LOUD) console.log(JSON.stringify(rest));
  return out;
}

function analyse(name, D, errs) {
  const sr = D.W.sr, med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }, pct = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * q))]; };
  /* the page's clock against the audio clock, from the moves themselves */
  const off = med(D.M.map(m => m[2] / 1000 - m[3]));            /* perf seconds − audio seconds */
  const toA = ms => ms / 1000 - off;
  const inDelay = D.M.map(m => m[1] - m[0]), handle = D.M.map(m => m[2] - m[1]);
  /* trip to the engine, in ms of audio clock */
  const sent = new Map(D.S.map(s => [s[0], s]));
  const trip = D.W.a.map(([q, fr]) => { const s = sent.get(q); return s ? (fr / sr - s[2]) * 1000 : null; }).filter(x => x != null);
  /* the finger's speed, in record speeds, at each touch sample */
  const pts = []; D.M.forEach(m => m[4].forEach(p => pts.push(p)));
  pts.sort((a, b) => a[0] - b[0]); while (pts.length && pts[pts.length - 1][0] > D.sl[0] - D.origin) pts.pop();   /* the scratch, not the slow pull after it */
  const fing = [];
  for (let i = 1; i < pts.length; i++) { const dt = (pts[i][0] - pts[i - 1][0]) / 1000; if (dt <= 0) continue; let da = pts[i][1] - pts[i - 1][1]; while (da > 180) da -= 360; while (da < -180) da += 360;
    fing.push([toA((pts[i][0] + pts[i - 1][0]) / 2), da / dt / D.dps * D.touch]); }
  const tEnd = toA(pts[pts.length - 1][0]) - 0.13;                /* the scratch alone, before the throw */
  const tBeg = toA(pts[0][0]) + 0.25;
  const interp = (arr, t) => { let lo = 0, hi = arr.length - 1; if (t <= arr[0][0]) return arr[0][1]; if (t >= arr[hi][0]) return arr[hi][1];
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m][0] <= t) lo = m; else hi = m; } const a = arr[lo], b = arr[hi]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); };
  const blk = D.W.b.map(x => [x[0] / sr, x[1]]).filter(x => x[0] >= tBeg && x[0] <= tEnd);
  /* the finger as it really moved: the sine the touches were sent from, on the wall clock both sides share (audio
     seconds → the page's clock → the wall clock → seconds into the scratch) */
  const trueV = ta => { const s = ((ta + off) * 1000 + D.origin - D.e0) / 1000; return D.A * 2 * Math.PI * D.HZ * Math.cos(2 * Math.PI * D.HZ * s) / D.dps * D.touch; };
  /* how far behind the finger the record's speed runs: the shift that lines the two up best */
  function lagOf(series) { let best = -1, bl = 0;
    for (let L = 0; L <= 0.2; L += 0.0005) { let num = 0, da = 0, db = 0; series.forEach(([t, v]) => { const u = trueV(t - L); num += u * v; da += u * u; db += v * v; });
      const cc = num / Math.sqrt(da * db + 1e-12); if (cc > best) { best = cc; bl = L; } }
    return { lag: bl * 1000, cc: best }; }
  const follow = lagOf(blk);
  /* the speed the page sent, as it left, against the finger: the page's own share of the lag */
  const sentSer = D.S.filter(s => s[4]).map(s => [s[2], s[3]]).filter(x => x[0] >= tBeg && x[0] <= tEnd);
  const page = lagOf(sentSer);
  /* the engine's share: from a message arriving to the speed reaching it (63%) */
  const arrive = new Map(D.W.a.map(x => [x[0], x[1]]));
  /* long tasks during the scratch */
  const longs = D.L.filter(l => toA(l[0]) >= tBeg - 0.25 && toA(l[0]) <= tEnd + 0.2);
  /* the sound: clicks are samples that jump far beyond what the music around them does */
  const o = D.W.o, f0 = D.W.b[0][0];
  const scan = (a, b) => { let clicks = 0, worst = 0;
    for (let i = Math.max(512, a); i < Math.min(o.length - 512, b); i += 256) { let e = 0; for (let k = i - 256; k < i + 256; k++) { const d2 = o[k] - 2 * o[k - 1] + o[k - 2]; e += d2 * d2; } const rms = Math.sqrt(e / 512) + 1e-4;
      for (let k = i; k < i + 256; k++) { const d2 = Math.abs(o[k] - 2 * o[k - 1] + o[k - 2]) / rms; if (d2 > worst) worst = d2; if (d2 > 9) clicks++; } }
    return { clicks, worst }; };
  const on0 = D.W.b.findIndex(x => x[3] === 1), on1 = D.W.b.findIndex((x, i) => i > on0 && x[3] === 0);
  const plain = scan(0, D.W.b[on0][0] - f0 - 256), { clicks, worst } = scan(D.W.b[on0][0] - f0, D.W.b[on1][0] - f0);
  /* the throw and the pull-back: the last hand-off block, then the motor bringing the record back to speed */
  const W = D.W.b, rel = W.findIndex((x, i) => i > 0 && W[i - 1][3] === 1 && x[3] === 0);
  const relRate = rel > 0 ? W[rel][1] : 0, after = rel > 0 ? W.slice(rel) : [];
  const atMs = ms => { const x = after.find(y => (y[0] - W[rel][0]) / sr * 1000 >= ms); return x ? x[1] : NaN; };
  const r30 = atMs(30), r400 = atMs(400);
  const fr = D.F.filter(t => toA(t) >= tBeg && toA(t) <= tEnd), fiv = fr.slice(1).map((t, i) => t - fr[i]);
  /* the largest change of speed from one audio block (2.9 ms) to the next while the hand is on: a zipper shows here */
  let step = 0; for (let i = on0 + 1; i < on1 && W[i][0] / sr < tEnd - 0.03; i++) step = Math.max(step, Math.abs(W[i][1] - W[i - 1][1]));   /* the landing and the scratch; the throw's sudden push is the finger's own */
  /* from the finger to the engine: the touch reaching the page, the handler, the trip; the rest of the lag is the engine's */
  const deliver = med(inDelay) + med(handle) + med(trip);
  /* the slow pull: how much the speed wavers around its own average, in its middle second */
  const sA = toA(D.sl[0] - D.origin + 300), sB = toA(D.sl[1] - D.origin - 100), sr8 = W.filter(x => x[0] / sr >= sA && x[0] / sr <= sB && x[3] === 1).map(x => x[1]);
  const sMean = sr8.reduce((a, b) => a + b, 0) / (sr8.length || 1), wobble = Math.sqrt(sr8.reduce((a, b) => a + (b - sMean) * (b - sMean), 0) / (sr8.length || 1)) / (Math.abs(sMean) || 1);
  const R = { deliver, engine: follow.lag - deliver, step, wobble, sMean, sN: sr8.length, name, fps: fiv.length ? 1000 / med(fiv) : 0, frWorst: fiv.length ? Math.max(...fiv) : 0, inDelay: { med: med(inDelay), p95: pct(inDelay, 0.95) }, handle: { med: med(handle), p95: pct(handle, 0.95), max: Math.max(...handle) },
    trip: { med: med(trip), p95: pct(trip, 0.95) }, follow, page, longs: longs.map(l => +l[1].toFixed(0)), moves: D.M.length, msgs: D.S.length,
    clicks, worst: +worst.toFixed(1), plain, relRate, r30, r400, base: D.base, out: D.out, errs };
  if (LOUD) console.log(JSON.stringify(R));
  return R;
}

(async () => {
  try {
    for (const [name, dev] of DEVICES) {
      const R = await run(name, dev);
      const f1 = n => (+n).toFixed(1);
      console.log(`     ${name}, CPU ×4, in the Studio: ${R.moves} moves; touch to handler ${f1(R.inDelay.med)} ms (95%: ${f1(R.inDelay.p95)}), handler ${f1(R.handle.med)} ms (95%: ${f1(R.handle.p95)}, slowest ${f1(R.handle.max)}); `
        + `to the engine ${f1(R.trip.med)} ms; the record's speed trails the finger by ${f1(R.follow.lag)} ms (match ${R.follow.cc.toFixed(3)}), the page's share ${f1(R.page.lag)} ms; long tasks ${R.longs.length ? R.longs.join(", ") + " ms" : "none"}; `
        + `latency ${f1(R.base * 1000)} + ${f1(R.out * 1000)} ms; after rest the first hand message ${f1(R.rest.first)} ms after the touch, the screen back in ${f1(R.rest.frame)} ms`);
      ok(R.engine <= 8 && R.follow.cc > 0.95, `${name}: once a move reaches the engine the record follows within 8 ms (${f1(R.engine)} ms; ${f1(R.follow.lag)} ms behind the finger in all, ${f1(R.deliver)} ms of it the touch reaching the engine; match ${R.follow.cc.toFixed(3)})`);
      ok(R.handle.p95 <= 4 && R.inDelay.p95 <= 60, `${name}: each move is handled in under 4 ms (95%: ${f1(R.handle.p95)} ms) and reaches the handler within 60 ms (95%: ${f1(R.inDelay.p95)} ms)`);
      ok(R.trip.p95 <= 12, `${name}: a move reaches the engine within 12 ms of audio clock (95%: ${f1(R.trip.p95)} ms)`);
      ok(!R.longs.length, `${name}: no long tasks while scratching (${R.longs.length})`);
      ok(R.worst <= Math.max(18, 1.25 * R.plain.worst) && R.step < 2.5, `${name}: the scratch is smooth: no click sharper than the music itself has (the sharpest ${R.worst}×, the record playing alone ${R.plain.worst.toFixed(1)}×), the speed never jumps (largest step ${f1(R.step)}× in one block)`);
      ok(R.rest.rested && R.rest.first >= 0 && R.rest.first <= 30 && R.rest.frame >= 0 && R.rest.frame <= 60, `${name}: after the page rests, a hand is heard at once (${f1(R.rest.first)} ms) and the screen wakes (${f1(R.rest.frame)} ms)`);
      ok(R.rest.held < 0.02 && R.rest.heldLevel < 0.002, `${name}: a record held still under the finger is still and silent (speed ${(+R.rest.held).toFixed(4)}, level ${(+R.rest.heldLevel).toFixed(4)})`);
      ok(R.sN > 200 && R.wobble < 0.12, `${name}: a slow steady pull drags evenly (speed ${(+R.sMean).toFixed(2)}×, wavering ${(R.wobble * 100).toFixed(1)}% over ${R.sN} blocks)`);
      ok(R.relRate > 1.2 && R.r30 > 1.05 && Math.abs(R.r400 - 1) < 0.05, `${name}: the throw carries (${f1(R.relRate)}× as the hand lets go, ${f1(R.r30)}× 30 ms later) and the motor pulls it back to speed (${(+R.r400).toFixed(3)}× at 400 ms)`);
      ok(!R.errs.length, `${name}: no page errors ${R.errs.slice(0, 2).join(" | ")}`);
    }
  } catch (e) { console.log("CRASH " + (e && e.stack || e)); ok(false, "the suite ran to the end"); }
  srv.close(); process.exit(done() ? 1 : 0);
})();
