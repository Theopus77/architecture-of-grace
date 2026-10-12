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
/* jump a playing run to its end and wait (up to 15 s on a busy machine) until the player has stopped there */
async function finish(pg) {
  await pg.evaluate(() => { const P = window.AOGSkate.P; P.t0 -= 600000; });
  for (let i = 0; i < 75 && await pg.evaluate(() => window.AOGSkate.P.playing); i++) await wait(200);
}

(async () => {
  await new Promise(o => server.listen(0, o)); const port = server.address().port, URL = `http://127.0.0.1:${port}/skate-lab.html`;
  const b = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });   // WebGL for the 3D park
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
  /* ── silent until used (AOG-SKATE-BOOK-V1, AOG-SKATE-3D-V1): a visit loads no trick words, no 3D, and asks for no frames ── */
  const files = await p.evaluate(() => performance.getEntriesByType("resource").map(e => e.name));
  ok(!files.some(u => /aog-skate-book|aog-skate3d|three\.module/.test(u)) && await p.evaluate(() => window.AOGSkate.TRICKS.length === 0),
     "a visit loads no trick words and no 3D until the Trick book, Questions or 3D is opened");
  const phys = await p.evaluate(async () => {
    const A = window.AOGSkate, g = 9.8, out = {};
    await A.book();
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
    // the trick demos: every trick has one; its steps stay inside the trick's list and reach the last step; both feet always land somewhere
    out.demoBad = A.TRICKS.filter(t => { const d = A.simDemo(t.id), fr = d.frames, n = t.en.steps.length;
      return !A.DEMOS[t.id] || fr.length < 60 || fr.some(f => f.step < 0 || f.step >= n || !(f.f || f.fg) || !(f.b || f.bg) || [f.bx, f.by, f.h, f.pitch, f.roll, f.yaw].some(v => !isFinite(v))) || fr[fr.length - 1].step !== n - 1; }).map(t => t.id);
    // the filmer: on flat ground the camera keeps the rider near the middle; rolling is steady (no jerks between keys)
    const ol = A.simDemo("ollie").frames; out.camLag = Math.max.apply(null, ol.filter(f => f.t > 0.5).map(f => Math.abs(f.bx - f.cam)));
    out.jerk = Math.max.apply(null, ol.slice(2).map((f, i) => Math.abs((f.bx - ol[i + 1].bx) - (ol[i + 1].bx - ol[i].bx)) * 3600));
    out.faq = [A.FAQ.length, A.FAQ.filter(f => !f.en.q || !f.en.a || !f.es.q || !f.es.a || (f.trick && !A.TRICKS.some(t => t.id === f.trick)) || (f.room && !A.rooms.includes(f.room))).map(f => f.id)];
    // build a board: every suggestion fits and never bites; a riser adds its thickness; big wheels on soft bushings bite
    const riders = ["micro", "mini", "mid", "s", "m", "l"], uses = ["tricks", "ramps", "rough", "cruise"], bad = [];
    riders.forEach(r => uses.forEach(u => { const sg = A.suggestBoard(r, u), c = A.boardCheck(Object.assign({ use: u }, sg));
      if (c.fit !== "ok" || c.bite === "bite" || !c.hardOK || sg.axle !== sg.deck || sg.deckRange[0] > sg.deck || sg.deckRange[1] < sg.deck) bad.push(r + "/" + u); }));
    out.buildBad = bad;
    const base = { deck: 8, axle: 8, wheel: 60, duro: 99, riser: 0, bush: "soft", use: "tricks" };
    out.bite = [A.boardCheck(base).bite, A.boardCheck(Object.assign({}, base, { riser: 3.2 })).clear - A.boardCheck(base).clear,
                A.boardCheck(Object.assign({}, base, { axle: 7.5 })).fit, A.boardCheck(Object.assign({}, base, { axle: 8.75 })).fit,
                A.boardCheck(Object.assign({}, base, { use: "rough" })).hardOK, A.suggestBoard("mini", "tricks").deckRange, A.boltFor(3.2)[1]];
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
  ok(!phys.buildBad.length, "Build a board: all 24 suggested setups have trucks that fit, no wheel bite and wheels that suit the ground" + (phys.buildBad.length ? " (" + phys.buildBad.join(", ") + ")" : ""));
  ok(phys.bite[0] === "bite" && Math.abs(phys.bite[1] - 3.2) < 1e-9 && phys.bite[2] === "narrow" && phys.bite[3] === "wide" && phys.bite[4] === false,
     "Build a board: 60 mm wheels on soft bushings bite; a ⅛-inch riser adds 3.2 mm; narrow and wide trucks are caught; hard wheels on rough ground are flagged");
  ok(phys.bite[5][0] === 7 && phys.bite[5][1] === 7.25 && phys.bite[6] === "1", "Build a board: a mini deck is about 7–7¼ inches; a ⅛-inch riser takes 1-inch bolts");
  ok(!phys.demoBad.length, `every trick (${phys.tricks.length}) has a demo whose steps match its list and end on the last step` + (phys.demoBad.length ? " (" + phys.demoBad.join(", ") + ")" : ""));
  ok(phys.camLag < 0.3 && phys.jerk < 1e-6, `the camera follows the rider within ${phys.camLag.toFixed(2)} m, and rolling speed never jumps`);
  ok(phys.faq[0] >= 30 && !phys.faq[1].length, `Questions: ${phys.faq[0]} answers, each in English and Spanish, each link to a real trick or room` + (phys.faq[1].length ? " (" + phys.faq[1].join(", ") + ")" : ""));
  const badT = phys.tricks.filter(t => !t.en || !t.es || !phys.rooms.includes(t.room));
  ok(!badT.length, `${phys.tricks.length} tricks have steps, fixes and the science in English and Spanish, and a real room${badT.length ? " (" + badT.map(t => t.id).join(", ") + ")" : ""}`);

  /* ── calm: still until Go, once, then still; stepping by hand ── */
  ok(await p.evaluate(() => !window.AOGSkate.P.playing), "nothing moves when a room opens");
  await p.click("#goBtn"); await wait(150);
  ok(await p.evaluate(() => window.AOGSkate.P.playing), "Go plays the run");
  await finish(p);
  ok(await p.evaluate(() => { const P = window.AOGSkate.P; return !P.playing && P.k === P.frames.length - 1; }), "the run plays once and stops at its end");
  const k0 = await p.evaluate(() => window.AOGSkate.P.k); await p.click("#backBtn"); await p.click("#backBtn");
  ok(await p.evaluate(() => window.AOGSkate.P.k) === k0 - 2, "◀ steps back one moment at a time");
  ok(await p.evaluate(() => getComputedStyle(document.getElementById("stage")).touchAction).then(v => /pan-y|auto/.test(v)), "a finger on the drawing still scrolls the page");
  /* ── the trick book: the demo plays once and lights its step; progress is kept on the device; the map shows it ── */
  await p.evaluate(() => window.AOGSkate.trick("kickflip")); await wait(120);
  ok(await p.evaluate(() => !window.AOGSkate.P.playing && window.AOGSkate.P.frames.length > 60), "the trick book is still until Go");
  await p.click("#goBtn"); await wait(150); await finish(p);
  ok(await p.evaluate(() => { const P = window.AOGSkate.P, on = [...document.querySelectorAll("#panel .tsteps li")].findIndex(li => li.classList.contains("on")); return !P.playing && P.k === P.frames.length - 1 && on === document.querySelectorAll("#panel .tsteps li").length - 1; }),
     "a trick demo plays once, and the step it shows lights up in the list");
  await p.click("#backBtn");
  ok(await p.evaluate(() => document.querySelectorAll("#panel .tsteps li.on").length === 1), "stepping by hand keeps one step lit");
  await p.click('#panel [data-prog="2"]'); await p.reload({ waitUntil: "load" }); await wait(400);
  ok(await p.evaluate(() => window.AOGSkate.state.progress.kickflip === 2 && JSON.parse(localStorage.getItem("aog.skate.v1")).progress.kickflip === 2 && !!document.querySelector("#panel .tchip.s2")),
     "\"Landed it once\" is kept on this device and shows on the trick map");
  await p.evaluate(() => window.AOGSkate.trick("kickflip")); await wait(80);
  await p.click('#panel [data-tv="seq"]'); await wait(120);
  ok(await p.evaluate(() => window.AOGSkate.state.tricks.view === "seq" && !window.AOGSkate.P.playing), "the sequence shot draws the trick in one still picture");
  /* ── the 3D park (AOG-SKATE-3D-V1): loads when picked, draws only when asked, plays once, the camera walks around on a drag ── */
  await p.click('#panel [data-tv="3d"]');
  for (let i = 0; i < 80 && await p.evaluate(() => window.AOGSkate.G3state() !== "ready" && window.AOGSkate.G3state() !== "failed"); i++) await wait(200);
  ok(await p.evaluate(() => window.AOGSkate.G3state() === "ready" && window.AOGSkate.G3().canvas.style.display === "block"), "3D: the park loads when 3D is picked (three.js from the site itself)");
  const r0 = await p.evaluate(() => window.AOGSkate.G3().renders()); await wait(900);
  ok(await p.evaluate(r => window.AOGSkate.G3().renders() === r, r0), "3D: nothing is drawn while nobody presses anything");
  const shot = await (await p.$("#stage")).screenshot();
  ok(shot.length > 30000, `3D: the park and the rider are drawn (${Math.round(shot.length / 1024)} KB picture)`);
  await p.click("#goBtn"); await wait(200); await finish(p);
  ok(await p.evaluate(r => { const A = window.AOGSkate, P = A.P; return !P.playing && P.k === P.frames.length - 1 && A.G3().renders() > r + 1; }, r0), "3D: Go plays the trick once and stops at its end");
  const bx = await (await p.$("#cv")).boundingBox();
  await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down(); await p.mouse.move(bx.x + bx.width / 2 + 120, bx.y + bx.height / 2, { steps: 6 }); await p.mouse.up();
  ok(await p.evaluate(() => window.AOGSkate.G3().cam() === "orbit" && document.getElementById("kCam").value === "orbit"), "3D: dragging the picture walks the camera around the rider");
  await p.selectOption("#kCam", "follow");
  ok(await p.evaluate(() => window.AOGSkate.G3().cam() === "follow"), "3D: the camera menu picks the filmer again");
  await p.click('#panel [data-tv="move"]');
  ok(await p.evaluate(() => window.AOGSkate.G3() === null && !document.querySelector("#stage canvas.gl")), "3D: picking Moving puts the drawings back and lets go of the 3D drawing");
  await p.click('#panel [data-tv="3d"]');
  for (let i = 0; i < 60 && await p.evaluate(() => window.AOGSkate.G3state() !== "ready"); i++) await wait(150);
  await p.reload({ waitUntil: "load" }); await wait(500);
  const files2 = await p.evaluate(() => performance.getEntriesByType("resource").map(e => e.name));
  ok(await p.evaluate(() => window.AOGSkate.state.tricks.view === "move") && !files2.some(u => /aog-skate3d|three\.module/.test(u)), "3D left on stays off on the next visit until it is tapped again");
  /* ── Questions: search and topic narrow the list; a search with no accent still finds accented words ── */
  await p.evaluate(() => window.AOGSkate.open("questions")); await wait(100);
  const all = await p.$$eval("#panel details.qa", d => d.length);
  await p.fill("#fqQ", "helmet"); await wait(120);
  const some = await p.$$eval("#panel details.qa", d => d.length);
  ok(all >= 30 && some > 0 && some < all && await p.evaluate(() => document.activeElement && document.activeElement.id === "fqQ"), `Questions: "helmet" narrows ${all} answers to ${some}, and typing keeps its place`);
  await p.fill("#fqQ", ""); await p.selectOption("#fqC", { index: 1 }); await wait(120);
  const cat = await p.$$eval("#panel details.qa", d => d.length);
  ok(cat > 0 && cat < all, `Questions: one topic shows ${cat} of ${all}`);
  await p.selectOption("#fqC", "all");
  /* ── Build a board: every part, pulled apart, with a numbered parts list that follows the setup ── */
  await p.evaluate(() => window.AOGSkate.open("build")); await wait(100);
  await p.click('#panel [data-k="view"][data-v="parts"]'); await wait(120);
  const parts = await p.evaluate(() => ({ n: document.querySelectorAll("#partsList li").length, txt: document.getElementById("partsList").textContent, pr: !!document.getElementById("bdPrint") }));
  await p.click('#panel [data-k="riser"][data-v="6.4"]'); await wait(120);
  const parts2 = await p.evaluate(() => ({ n: document.querySelectorAll("#partsList li").length, txt: document.getElementById("partsList").textContent }));
  ok(parts.pr && parts2.n === parts.n + (/Riser/.test(parts.txt) ? 0 : 1) && /1¼″/.test(parts2.txt) && /608/.test(parts2.txt), `Build a board: the parts list (${parts2.n} lines) follows the setup — a ¼-inch riser adds riser pads and 1¼-inch bolts — and prints`);
  await p.click('#panel [data-k="view"][data-v="fit"]'); await p.click('#panel [data-k="riser"][data-v="0"]');
  ok(!p.errs.length, "no errors on a computer" + (p.errs.length ? ": " + p.errs[0] : ""));
  await p.context().close();

  /* ── the figure on the board (AOG-SKATE-3D-V2): the site's figure rides, its soles on the deck within 2 cm in every demo ── */
  const d3 = await open({ width: 1280, height: 900 }, false, "tricks", { colorScheme: "light" });
  await d3.addInitScript(() => { window.__raf = 0; const r = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => { window.__raf++; return r(f); }; });
  await d3.reload({ waitUntil: "load" }); await wait(500);
  const ready3 = async pg => { for (let i = 0; i < 100 && await pg.evaluate(() => window.AOGSkate.G3state() !== "ready" && window.AOGSkate.G3state() !== "failed"); i++) await wait(200); return pg.evaluate(() => window.AOGSkate.G3state()); };
  await d3.evaluate(() => window.AOGSkate.trick("ollie")); await wait(200); await d3.click('#panel [data-tv="3d"]'); await ready3(d3);
  const feet = await d3.evaluate(() => {
    const A = window.AOGSkate, G = A.G3(), bad = []; let worst = 0, n = 0;
    A.TRICKS.forEach(t => { const D = A.DEMOS[t.id], fr = A.simDemo(t.id).frames;
      for (let i = 0; i < fr.length; i += 3) { G.draw({ kind: "trick", fr: fr[i], D, dry: true }); const e = Math.max.apply(null, G.feetError()); n++; if (e > worst) worst = e; if (e > 0.02 && !bad.includes(t.id)) bad.push(t.id); } });
    return { fig: G.figure(), outfit: G.fig() && G.fig().outfit, worst, n, bad };
  });
  ok(feet.fig && feet.outfit === "skate", "3D: the rider is the site's figure in its skate outfit (hoodie, cargo pants, skate shoes, helmet)");
  ok(!feet.bad.length && feet.n > 500, `3D: in ${feet.n} moments of all ${phys.tricks.length} demos both soles stay within 2 cm of their place on the deck or the ground (worst ${(feet.worst * 100).toFixed(2)} cm)` + (feet.bad.length ? " — " + feet.bad.join(", ") : ""));
  const back = await d3.evaluate(() => {   // after a 180 the rider has turned around: the camera sees the back
    const A = window.AOGSkate, G = A.G3(), fr = A.simDemo("fs180").frames, D = A.DEMOS.fs180;
    const facing = f => { G.draw({ kind: "trick", fr: f, D, dry: true }); const fig = G.fig(); fig.root.updateMatrixWorld(true); const hp = fig.world("chest"), z = fig.world("hipL").sub(fig.world("hipR")); return { left: z.toArray(), y: hp.y }; };
    const a = facing(fr[0]), b = facing(fr[fr.length - 1]);
    return [a.left[0], b.left[0]];
  });
  ok(back[0] * back[1] < 0, "3D: after a frontside 180 the rider's body has turned around (the camera sees the back)");

  /* ── the physics rooms in 3D (AOG-SKATE-3D-ROOMS-V1): each loads on a tap, shows its own numbers in the scene ── */
  for (const room of ["ramp", "ollie", "grind"]) {
    await d3.evaluate(r => window.AOGSkate.open(r), room); await wait(150);
    ok(await d3.evaluate(() => window.AOGSkate.G3() === null && !document.querySelector("#stage canvas.gl")), `${room}: opens as a drawing; the 3D picture is let go until 3D is tapped`);
    await d3.click('#panel [data-v3="3d"]');
    ok(await ready3(d3) === "ready" && await d3.evaluate(() => window.AOGSkate.G3().canvas.style.display === "block"), `${room}: 3D loads on a tap`);
    const r0 = await d3.evaluate(() => window.AOGSkate.G3().renders()); await wait(700);
    ok(await d3.evaluate(r => window.AOGSkate.G3().renders() === r && !window.AOGSkate.P.playing, r0), `${room} 3D: still until Go (nothing drawn while idle)`);
    await d3.click("#goBtn"); await wait(200); await finish(d3);
    const done = await d3.evaluate(r => { const A = window.AOGSkate, P = A.P; return !P.playing && P.k === P.frames.length - 1 && A.G3().renders() > r + 1; }, r0);
    ok(done, `${room} 3D: Go plays the run once and stops at its end`);
    await d3.evaluate(() => { const P = window.AOGSkate.P; P.k = Math.floor(P.frames.length * 0.3); }); await d3.click("#fwdBtn"); await wait(150);
    const pr = await d3.evaluate(room => {
      const A = window.AOGSkate, P = A.P, f = P.frames[P.k], pb = A.G3().probe(), G = 9.8, out = { pb, feet: Math.max.apply(null, A.G3().feetError()) };
      if (room === "ramp") { const tot = Math.max(f.E0 + f.pumpW, 1); out.want = { pe: f.pe / tot, ke: f.ke / tot, heat: f.heat / tot }; out.at = [f.x, f.y]; }
      if (room === "ollie") { out.at = f.rearY; out.forces = A.state.ollie.forces; }
      if (room === "grind") { const o = A.state.grind, s = A.simGrind(Object.assign({}, o)); out.d = s.d; out.mu = s.mu; out.want = o.v * o.v / (2 * s.mu * G); }
      return out;
    }, room);
    if (room === "ramp") ok(pr.pb.kind === "ramp" && ["pe", "ke", "heat"].every(k => Math.abs(pr.pb.gauges[k] - pr.want[k]) < 0.01) && Math.abs(pr.pb.surf[0] - pr.at[0]) < 1e-6 && Math.abs(pr.pb.surf[1] - pr.at[1]) < 1e-6 && pr.pb.arrows[0] && pr.pb.trail,
      `ramp 3D: the energy bars in the scene show this moment's stored ${(pr.want.pe * 100).toFixed(0)}%, motion ${(pr.want.ke * 100).toFixed(0)}%, heat ${(pr.want.heat * 100).toFixed(0)}%; the board rides the ramp's curve; the force arrows and the path show`);
    if (room === "ollie") ok(pr.pb.kind === "ollie" && pr.pb.pole && Math.abs(pr.pb.board[1] - pr.at) < 0.2 && pr.pb.trail, `ollie 3D: the height pole and the path stand beside the board, which rises with the run (back wheels at ${(pr.at * 100).toFixed(0)} cm)`);
    if (room === "grind") ok(pr.pb.kind === "grind" && Math.abs(pr.pb.stop - pr.want) < 1e-6 && /μ ≈ 0\.25/.test(pr.pb.label), `grind 3D: "would stop here" stands at v²/(2μg) = ${pr.want.toFixed(2)} m, and the surface's μ is named`);
    ok(pr.feet <= 0.02, `${room} 3D: the soles stay on the deck (${(pr.feet * 100).toFixed(2)} cm)`);
  }
  // pop the ollie room's forces: at the snap the tail arrow and the ground's push show
  await d3.evaluate(() => window.AOGSkate.open("ollie")); await wait(150);
  const snap = await d3.evaluate(() => { const A = window.AOGSkate, P = A.P; const k = P.frames.findIndex(f => f.popping || f.phase === "pop"); if (k < 0) return null; P.k = k; P.ran = true; return k; });
  if (snap != null) { await d3.click("#backBtn"); await d3.click("#fwdBtn"); await wait(150); }
  ok(snap != null && await d3.evaluate(() => { const pb = window.AOGSkate.G3().probe(); return pb.arrows[0] && pb.arrows[1]; }), "ollie 3D: at the snap the force arrows stand in the scene (the tail pushed down, the ground pushing up)");
  // leaving 3D lets go of everything: the figure, the drawing and the graphics chip
  const gone = await d3.evaluate(async () => {
    const A = window.AOGSkate, G = A.G3(), cv = G.canvas, gl = cv.getContext("webgl2") || cv.getContext("webgl"), fig = G.fig();
    A.open("build"); await new Promise(r => setTimeout(r, 200));
    return { g3: A.G3() === null, canvas: !document.querySelector("#stage canvas.gl") && !cv.isConnected, lost: !gl || gl.isContextLost(), fig: !fig || fig.disposed };
  });
  ok(gone.g3 && gone.canvas && gone.lost && gone.fig, "3D: leaving it disposes the figure, removes the 3D picture and hands the graphics chip back (context lost)");

  /* ── free skate (AOG-SKATE-FREE-V1): still before a press, rolls on a press, stops by itself, then asks for no frames ── */
  await d3.evaluate(() => window.AOGSkate.open("free")); await wait(200);
  const fpad = await d3.evaluate(() => ["push", "left", "right", "ollie", "flip", "grind"].every(k => !!document.querySelector(`#player [data-pad="${k}"]`)));
  ok(fpad, "free skate: big buttons for Push, ←, →, Ollie, Kickflip and Grind");
  let raf0 = await d3.evaluate(() => window.__raf); await wait(800);
  ok(await d3.evaluate(r => window.__raf === r && !window.AOGSkate.free.running() && window.AOGSkate.free.st.v === 0, raf0), "free skate: nothing moves and no frames are asked for before a press");
  const x0 = await d3.evaluate(() => window.AOGSkate.free.st.x);
  await d3.keyboard.down("ArrowUp"); await wait(50); await d3.keyboard.up("ArrowUp"); await wait(700);
  const mv = await d3.evaluate(() => { const st = window.AOGSkate.free.st; return { x: st.x, v: st.v, run: window.AOGSkate.free.running() }; });
  ok(mv.run && mv.v > 0.3 && mv.x > x0 + 0.05, `free skate: ↑ on a computer pushes off (${mv.v.toFixed(1)} m/s, ${(mv.x - x0).toFixed(1)} m so far)`);
  await d3.keyboard.down("ArrowDown");
  for (let i = 0; i < 60 && await d3.evaluate(() => window.AOGSkate.free.running()); i++) await wait(150);
  const braked = await d3.evaluate(() => !window.AOGSkate.free.running() && window.AOGSkate.free.st.v === 0);
  await d3.keyboard.up("ArrowDown"); await wait(100);
  ok(braked && await d3.evaluate(() => !window.AOGSkate.free.running()), "free skate: the brake brings the rider to rest and the loop stops by itself");
  raf0 = await d3.evaluate(() => window.__raf); await wait(800);
  ok(await d3.evaluate(r => window.__raf === r, raf0), "free skate: at rest, no frames are asked for");
  // a push left alone rolls out and stops by itself (rolling friction and air)
  await d3.evaluate(() => window.AOGSkate.free.reset("flat"));
  const roll = await d3.evaluate(() => { const F = window.AOGSkate.free; F.press("push", true); F.run(90); return { v: F.st.v, x: F.st.x, msg: F.st.msg }; });
  ok(roll.v === 0 && roll.x > -11.5 + 3, `free skate: one push rolls ${(roll.x + 11.5).toFixed(1)} m and comes to rest by itself`);
  await d3.evaluate(() => window.AOGSkate.free.reset("flat"));
  const ol = await d3.evaluate(() => { const F = window.AOGSkate.free, pn = window.AOGSkate.popNumbers(); F.press("push", true); F.run(0.6, (q, t) => t > 0.55); let top = 0, air = 0; F.press("ollie", true);
    F.run(3, q => { top = Math.max(top, q.y); if (q.mode === "air") air += 1 / 240; return q.mode !== "air" && air > 0.05; }); return { top, air, cap: pn.cap, flight: pn.flight }; });
  ok(ol.air > 0.2 && Math.abs(ol.air - ol.flight) < 0.08, `free skate: an ollie stays up ${ol.air.toFixed(2)} s, the ollie room's 2v₀/g = ${ol.flight.toFixed(2)} s`);
  // in 3D the ride draws only while it moves
  await d3.click('#panel [data-fk="view"][data-v="3d"]'); await ready3(d3);
  await d3.evaluate(() => window.AOGSkate.free.reset("flat"));
  const settle = async () => { let a = -1, b = await d3.evaluate(() => window.AOGSkate.G3().renders()); for (let i = 0; i < 20 && a !== b; i++) { await wait(400); a = b; b = await d3.evaluate(() => window.AOGSkate.G3().renders()); } return b; };   // a late resize may draw once
  const fr0 = await settle(); await wait(700);
  const still3 = await d3.evaluate(r => ({ n: window.AOGSkate.G3().renders() - r, run: window.AOGSkate.free.running(), v: window.AOGSkate.free.st.v }), fr0);
  ok(still3.n === 0 && !still3.run && still3.v === 0, "free skate 3D: still until a press" + (still3.n || still3.run ? ` (${still3.n} pictures drawn, loop ${still3.run ? "running" : "off"})` : ""));
  const pushBtn = await d3.$('#player [data-pad="push"]'), pb = await pushBtn.boundingBox();
  await d3.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await d3.mouse.down(); await d3.mouse.up();
  for (let i = 0; i < 60 && await d3.evaluate(() => window.AOGSkate.free.st.v < 0.3); i++) await wait(150);   // a slow test machine draws few pictures a second
  const fm = await d3.evaluate(r => ({ n: window.AOGSkate.G3().renders() - r, v: window.AOGSkate.free.st.v, feet: Math.max.apply(null, window.AOGSkate.G3().feetError()) }), fr0);
  ok(fm.n >= 2 && fm.v > 0.2, `free skate 3D: the Push button rolls the rider through the park (${fm.n} pictures drawn)`);
  ok(fm.feet <= 0.02, `free skate 3D: the soles stay on the board or the ground (${(fm.feet * 100).toFixed(2)} cm)`);
  await d3.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await d3.keyboard.down("ArrowDown");
  for (let i = 0; i < 80 && await d3.evaluate(() => window.AOGSkate.free.running()); i++) await wait(150);
  await d3.keyboard.up("ArrowDown"); await wait(300);
  for (let i = 0; i < 40 && await d3.evaluate(() => window.AOGSkate.free.running()); i++) await wait(150);   // the camera eases to its place, then the loop stops
  const fr1 = await d3.evaluate(() => window.AOGSkate.G3().renders()); raf0 = await d3.evaluate(() => window.__raf); await wait(800);
  ok(await d3.evaluate(([r, f]) => window.AOGSkate.G3().renders() === r && window.__raf === f && !window.AOGSkate.free.running(), [fr1, raf0]), "free skate 3D: once the rider is at rest, nothing is drawn and no frames are asked for");
  ok(!d3.errs.length, "3D rooms and free skate: no errors" + (d3.errs.length ? ": " + d3.errs[0] : ""));
  await d3.context().close();

  /* Build a board is the lab's home (AOG-SKATE-BUILD-HOME-V1): /skate with no room opens it, even after another room was used */
  const home = await open({ width: 390, height: 844 }, true, "ollie");
  await home.goto(URL, { waitUntil: "load" }); await wait(400);
  ok(await home.evaluate(() => window.AOGSkate.state.room === "build" && window.AOGSkate.rooms[0] === "build" && /Build a board|Arma una tabla/.test(document.getElementById("panel").textContent)),
     "/skate opens on Build a board, first in the room menu, even after another room was used");
  await home.context().close();
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
        await q.waitForFunction(() => !document.querySelector("#panel .loading"));
        const has = await q.$("#goBtn");
        if (has) { await q.click("#goBtn"); await wait(120); await finish(q); }
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
