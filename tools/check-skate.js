#!/usr/bin/env node
/* AOG SKATE CHECK — Jimmy (2026-10-11): "Make a killer interactive engine." The Skate Lab (skate-lab.html, /skate,
   aog-skate.js) works its physics out live, so a change could quietly make it teach something wrong. This opens it on
   an iPhone, an iPad and a computer and checks:
     · the physics: on a frictionless ramp the speed at the bottom is √(2gh) and energy is kept; with friction the
       energy bars always add up to the start; a grind stops after v²/(2μg) whatever the mass; hang time is 2√(2h/g);
       a balanced turn obeys tan θ = v²/(gR); the arms-in spin keeps L = Iω; a manual is the center of mass over an axle,
     · every room opens, draws and runs with no errors, in English and in Spanish,
     · calm: nothing moves until Go; a run plays once and stops; ◀ ▶ step it by hand; with "reduce motion" on, Go shows
       the end at once; a finger on the drawing still scrolls the page; no sideways scroll on a phone,
     · every trick in the trick book has steps, fixes and the science in both languages, and its "Try it" room exists.
       node tools/check-skate.js
   Exit code 1 when anything fails. Run it after any change to skate-lab.html or aog-skate.js (see CLAUDE.md). */
const path = require("path"), fs = require("fs"), http = require("http"), cp = require("child_process");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(cp.execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg" };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
let fails = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const wait = ms => new Promise(o => setTimeout(o, ms));

(async () => {
  await new Promise(o => server.listen(0, o)); const port = server.address().port, URL = `http://127.0.0.1:${port}/skate-lab.html`;
  const b = await pw.chromium.launch();
  async function open(vp, touch, hash, extra) {
    const ctx = await b.newContext(Object.assign({ viewport: vp, isMobile: !!touch, hasTouch: !!touch }, extra || {}));
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    const p = await ctx.newPage(); p.errs = [];
    p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) p.errs.push(m.text()); });
    await p.goto(URL + (hash ? "#" + hash : ""), { waitUntil: "load" }); await wait(500);
    return p;
  }

  /* ── the physics, straight from the engine ── */
  const p = await open({ width: 1280, height: 900 }, false, "ramp");
  const phys = await p.evaluate(() => {
    const A = window.AOGSkate, g = 9.8, out = {};
    // frictionless drop-in: speed at the bottom = √(2gh); energy kept
    const r = A.simRamp({ shape: "mini", h: 1.2, wheel: "ideal", mass: 50, pump: false });
    out.idealV = r.firstBottom; out.idealWant = Math.sqrt(2 * g * 1.2);
    out.idealDrift = Math.max(...r.frames.map(f => Math.abs(f.pe + f.ke + f.heat - f.E0) / f.E0));
    // with friction: stored + motion + heat stays the start (within numerical error), and the speed is lower
    const rf = A.simRamp({ shape: "vert", h: 3.6, wheel: "ure", mass: 70, pump: false });
    out.fricDrift = Math.max(...rf.frames.filter(f => f.air === 0).map(f => Math.abs(f.pe + f.ke + f.heat - f.E0) / f.E0));
    out.fricLower = rf.firstBottom < Math.sqrt(2 * g * 3.6);
    // clay wheels roll a shorter way down the hill than urethane
    const hu = A.simRamp({ shape: "hill", h: 1.5, wheel: "ure", mass: 50 }), hc = A.simRamp({ shape: "hill", h: 1.5, wheel: "clay", mass: 50 });
    out.hill = [hu.frames[hu.frames.length - 1].x, hc.frames[hc.frames.length - 1].x];
    // pumping adds energy
    const rp = A.simRamp({ shape: "mini", h: 0.8, wheel: "ure", mass: 50, pump: true });
    out.pump = Math.max(...rp.frames.map(f => f.pumpW));
    // grind: d = v²/(2μg), the same for any mass
    const g1 = A.simGrind({ surface: "metal", trick: "fifty", v: 3, len: 6, mass: 40 }), g2 = A.simGrind({ surface: "metal", trick: "fifty", v: 3, len: 6, mass: 100 });
    const stopAt = s => s.frames.find(f => f.stopped).x;
    out.grind = [stopAt(g1), stopAt(g2), 9 / (2 * 0.25 * g)];
    // ollie: flight time 2v₀/g = 2√(2h/g)
    const o = A.simOllie({ pop: 0.7, slide: "on", jump: 0.3, forces: true });
    out.ollie = [o.flight, 2 * Math.sqrt(2 * 0.42 / g), o.outcome];
    out.ollieLate = A.simOllie({ pop: 0.7, slide: "late", jump: 0.3 }).outcome;
    out.ollieNone = A.simOllie({ pop: 0.7, slide: "none", jump: 0.3 }).outcome;
    // balance in a turn: the lean that balances satisfies tan θ = v²/(gR)
    Object.assign(A.state.balance, { mode: "turn", lean: 10, v: 3, truck: "loose" });
    const bc = A.balanceCalc(); out.turn = [Math.tan(bc.need), 9 / (g * bc.R), bc.R];
    Object.assign(A.state.balance, { lean: 10, v: bc.vbal }); out.vbal = Math.abs(A.balanceCalc().need - 10 * Math.PI / 180);
    // a manual: the center of mass over the back axle
    A.state.balance.com = -0.18; out.manual = A.standCalc().state; A.state.balance.com = 0; out.steady = A.standCalc().state;
    A.state.balance.com = -0.26; out.tail = A.standCalc().state; A.state.balance.com = 0;
    // spins: arms out 180° in the air, arms in 360°, L the same
    const so = A.simSpin({ arms: "out" }), si = A.simSpin({ arms: "in" });
    const air = so.frames.filter(f => f.w > 0); out.spin = [so.frames[so.frames.length - 1].ang * 180 / Math.PI, si.frames[si.frames.length - 1].ang * 180 / Math.PI];
    out.L = [...new Set(so.frames.concat(si.frames).filter(f => f.w > 0).map(f => (f.I * f.w).toFixed(6)))].length;
    // flips end where they should
    const kf = A.simFlip({ trick: "kickflip" }), tre = A.simFlip({ trick: "tre" });
    const last = s => s.frames[s.frames.length - 1]; out.flips = [last(kf).roll, last(tre).roll, last(tre).yaw];
    out.tricks = A.TRICKS.map(t => ({ id: t.id, room: t.room, en: t.en.steps.length && t.en.fixes.length && !!t.en.sci, es: t.es.steps.length === t.en.steps.length && t.es.fixes.length === t.en.fixes.length && !!t.es.sci }));
    out.rooms = A.rooms;
    return out;
  });
  ok(near(phys.idealV, phys.idealWant, 0.003), `frictionless ramp: ${phys.idealV.toFixed(3)} m/s at the bottom, √(2gh) = ${phys.idealWant.toFixed(3)}`);
  ok(phys.idealDrift < 0.003, `frictionless ramp keeps its energy (drift ${(phys.idealDrift * 100).toFixed(2)}%)`);
  ok(phys.fricDrift < 0.01, `with friction, stored + motion + heat = the start (drift ${(phys.fricDrift * 100).toFixed(2)}%)`);
  ok(phys.fricLower, "with friction the bottom speed is below √(2gh)");
  ok(phys.hill[0] > phys.hill[1] * 2, `urethane rolls farther than clay down the hill (${phys.hill[0].toFixed(1)} m against ${phys.hill[1].toFixed(1)} m)`);
  ok(phys.pump > 0, "pumping adds energy");
  ok(near(phys.grind[0], phys.grind[2], 0.03) && near(phys.grind[1], phys.grind[2], 0.03), `a grind stops after v²/(2μg) = ${phys.grind[2].toFixed(2)} m, light or heavy (${phys.grind[0].toFixed(2)}, ${phys.grind[1].toFixed(2)})`);
  ok(near(phys.ollie[0], phys.ollie[1], 0.001) && phys.ollie[2] === "clean", `ollie hang time 2√(2h/g) = ${phys.ollie[1].toFixed(3)} s; a slide right after the snap lands clean`);
  ok(phys.ollieLate === "tilt" && phys.ollieNone === "tail", "a late slide leaves the nose up; no slide lands on the tail");
  ok(near(phys.turn[0], phys.turn[1], 1e-9), `a balanced turn: tan θ = v²/(gR) (R = ${phys.turn[2].toFixed(2)} m)`);
  ok(phys.vbal < 1e-9, "at the balanced speed the needed lean equals the lean");
  ok(phys.manual === "manual" && phys.steady === "steady" && phys.tail === "tail", "center of mass over the back axle is a manual; behind it, the tail drops");
  ok(near(phys.spin[0], 180, 0.03) && near(phys.spin[1], 360, 0.03) && phys.L <= 2, `arms out turns ${phys.spin[0].toFixed(0)}°, arms in ${phys.spin[1].toFixed(0)}°; L = Iω stays the same`);
  ok(Math.abs(phys.flips[0] - 360) < 1e-6 && Math.abs(phys.flips[1] - 360) < 1e-6 && Math.abs(phys.flips[2] - 360) < 1e-6, "a kickflip turns 360° on the long axis; a 360 flip also 360° on the up-down axis");
  const badT = phys.tricks.filter(t => !t.en || !t.es || !phys.rooms.includes(t.room));
  ok(!badT.length, `${phys.tricks.length} tricks have steps, fixes and the science in English and Spanish, and a real room${badT.length ? " (" + badT.map(t => t.id).join(", ") + ")" : ""}`);

  /* ── calm: still until Go, once, then still; stepping by hand ── */
  ok(await p.evaluate(() => !window.AOGSkate.P.playing), "nothing moves when a room opens");
  await p.click("#goBtn"); await wait(150);
  ok(await p.evaluate(() => window.AOGSkate.P.playing), "Go plays the run");
  await p.evaluate(() => { const P = window.AOGSkate.P; P.t0 -= 60000; }); await wait(250);
  ok(await p.evaluate(() => { const P = window.AOGSkate.P; return !P.playing && P.k === P.frames.length - 1; }), "the run plays once and stops at its end");
  const k0 = await p.evaluate(() => window.AOGSkate.P.k); await p.click("#backBtn"); await p.click("#backBtn");
  ok(await p.evaluate(() => window.AOGSkate.P.k) === k0 - 2, "◀ steps back one moment at a time");
  ok(await p.evaluate(() => getComputedStyle(document.getElementById("stage")).touchAction).then(v => /pan-y|auto/.test(v)), "a finger on the drawing still scrolls the page");
  ok(!p.errs.length, "no errors on a computer" + (p.errs.length ? ": " + p.errs[0] : ""));
  await p.context().close();

  const rm = await open({ width: 820, height: 1180 }, true, "grind", { reducedMotion: "reduce" });
  await rm.click("#goBtn"); await wait(150);
  ok(await rm.evaluate(() => { const P = window.AOGSkate.P; return !P.playing && P.k === P.frames.length - 1 && P.frames.length > 1; }), "with reduce motion on, Go shows the whole run at once (iPad)");
  await rm.context().close();

  /* ── every room, both languages, iPhone and iPad ── */
  for (const [name, vp] of [["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }]]) {
    const q = await open(vp, true, "ramp");
    for (const lang of ["en", "es"]) {
      if (lang === "es") await q.evaluate(() => document.getElementById("langBtn").click());   // the site bar presses this hidden button
      for (const room of phys.rooms) {
        await q.evaluate(r => window.AOGSkate.open(r), room); await wait(80);
        const has = await q.$("#goBtn");
        if (has) { await q.click("#goBtn"); await wait(120); await q.evaluate(() => { const P = window.AOGSkate.P; P.t0 -= 60000; }); await wait(150); }
        const r = await q.evaluate(() => ({ pan: document.documentElement.scrollWidth - innerWidth, panel: document.getElementById("panel").textContent.length, lang: document.documentElement.lang }));
        if (r.pan > 2 || r.panel < 80 || r.lang !== lang) ok(false, `${name} ${lang} ${room}: pans ${r.pan}px, panel ${r.panel} chars, lang ${r.lang}`);
      }
    }
    ok(!q.errs.length, `${name}: all ${phys.rooms.length} rooms open, run and fit, in English and Spanish` + (q.errs.length ? " — " + q.errs[0] : ""));
    await q.context().close();
  }
  await b.close(); server.close();
  console.log(fails ? `\n${fails} check(s) failed` : "\nThe Skate Lab: all checks pass");
  process.exit(fails ? 1 : 0);
})();
