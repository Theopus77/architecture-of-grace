#!/usr/bin/env node
/* AOG DOJO CHECK — Jimmy (2026-10-12): "In the martial arts curriculum books, instructions on how to learn moves with
   this engine showing the person the moves!!!" The Dojo (dojo.html, /dojo; aog-dojo.js, aog-dojo-moves.js,
   aog-dojo3d.js on the shared figure aog-figure3d.js) shows each move step by step in 3D. This opens it on a computer,
   an iPad and an iPhone and checks:
     · the library: all 36 moves of the engine contract, each with steps and "what helps" in English and Spanish, and
       every step has keyframes (step numbers match the keys, in order, ending on the last step),
     · every move plays once and stops at its end with its last step lit; ▶ and ◀ step through it,
     · feet never sink more than 1 cm below the floor; in falls (and the sprawl) the whole body stays above the mat,
     · Mirror flips sides (the other leg kicks), and both address forms work: /dojo?side=left#id and /dojo#id?side=left,
       /dojo#front-kick opens that move, and a change of #id opens the new move,
     · silent: nothing is drawn and no animation frame is asked for while nobody touches it,
     · reduce motion shows each step's finished pose at once,
     · iPhone and iPad, English and Spanish: every move opens with no errors and no sideways scroll,
     · the practice tracker is kept on this device; the ghost picture draws.
       node tools/check-dojo.js
   Exit code 1 when anything fails. Run it after any change to the Dojo's files (see CLAUDE.md). */
const path = require("path"), fs = require("fs"), http = require("http"), cp = require("child_process");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(cp.execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
let fails = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const wait = ms => new Promise(o => setTimeout(o, ms));
const IDS = ["ready", "horse", "front-stance", "back-stance", "cat-stance", "guard", "step-forward", "step-back", "shuffle", "pivot", "jab", "cross", "hook",
  "uppercut", "reverse-punch", "palm-strike", "knife-hand", "high-block", "low-block", "inside-block", "outside-block", "knee-raise", "front-kick", "teep",
  "roundhouse-kick", "side-kick", "back-kick", "back-fall", "side-fall", "sprawl", "ginga", "en-garde", "lunge", "combo-jab-cross", "combo-block-punch", "form-1"];

(async () => {
  await new Promise(o => server.listen(0, o)); const port = server.address().port, BASE = `http://127.0.0.1:${port}/dojo.html`;
  const b = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  async function open(vp, touch, addr, extra) {
    const ctx = await b.newContext(Object.assign({ viewport: vp, isMobile: !!touch, hasTouch: !!touch }, extra || {}));
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    await ctx.addInitScript(() => {   // count animation frames asked for (silent while idle)
      window.__raf = 0; const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = f => { window.__raf++; return raf(f); };
    });
    const p = await ctx.newPage(); p.errs = [];
    p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) p.errs.push(m.text()); });
    await p.goto(BASE + (addr || ""), { waitUntil: "load" });
    return p;
  }
  /* jump a playing move to its end, then wait (a busy computer may draw slowly) until the player has stopped */
  const finish = async p => { await p.evaluate(() => { window.AOGDojo.P.t0 -= 600000; }); for (let i = 0; i < 100 && await p.evaluate(() => window.AOGDojo.P.playing); i++) await wait(50); };
  const stageShot = async p => { await p.evaluate(() => document.getElementById("stage").scrollIntoView({ block: "start" })); await wait(200); const bx = await (await p.$("#stage")).boundingBox(); return p.screenshot({ clip: bx, timeout: 60000 }); };
  const ready = async p => { for (let i = 0; i < 150 && await p.evaluate(() => !["ready", "failed"].includes(window.AOGDojo.G3state())); i++) await wait(200); return p.evaluate(() => window.AOGDojo.G3state()); };

  /* ── the words come first, then the room ── */
  const p = await open({ width: 1280, height: 900 }, false, "#front-kick");
  const early = await p.evaluate(() => ({ steps: document.querySelectorAll("#steps li").length, name: document.getElementById("moveName").textContent, id: window.AOGDojo.move.id }));
  ok(early.steps === 5 && early.id === "front-kick" && /Front kick/.test(early.name), "/dojo#front-kick opens the front kick, its words and step list showing at once");
  ok(await ready(p) === "ready", "the 3D dojo and the figure load right after (three.js from the site itself)");

  /* ── the library ── */
  const lib = await p.evaluate(() => window.AOGDojo.MOVES.map(m => {
    const n = m.en.steps.length, ss = new Set(m.keys.map(k => k.s));
    const bad = [];
    if (m.es.steps.length !== n || !m.en.n || !m.es.n || m.en.tips.length < 2 || m.es.tips.length !== m.en.tips.length) bad.push("words");
    for (let i = 0; i < n; i++) if (!ss.has(i)) bad.push("no keys for step " + (i + 1));
    m.keys.forEach((k, i) => { if (k.s < 0 || k.s >= n) bad.push("key step out of range"); if (i && (k.s < m.keys[i - 1].s || k.t <= m.keys[i - 1].t)) bad.push("keys out of order"); });
    if (m.keys[m.keys.length - 1].s !== n - 1 || m.keys[0].t !== 0) bad.push("ends");
    if ([...m.en.steps, ...m.es.steps].some(s => /\b(right|left|derech[oa]|izquierd[oa])\b/i.test(s))) bad.push("names a side");
    return { id: m.id, band: m.band, kind: m.kind, bad };
  }));
  const ids = lib.map(m => m.id);
  ok(IDS.every(i => ids.includes(i)) && ids.length === IDS.length, `all ${IDS.length} moves of the contract are in the library` + (IDS.filter(i => !ids.includes(i)).length ? " (missing " + IDS.filter(i => !ids.includes(i)).join(", ") + ")" : ""));
  const badLib = lib.filter(m => m.bad.length);
  ok(!badLib.length, "every move has steps and tips in English and Spanish, keys for every step, in order, and words that say front/back, not left/right" + (badLib.length ? " — " + badLib.map(m => m.id + ": " + m.bad[0]).join("; ") : ""));
  ok(await p.evaluate(() => { const o = [...document.querySelectorAll("#movePick optgroup")].map(g => g.label); return o.length === 8 && o[0] === "Stances" && o[7] === "Combinations and form"; }), "the move picker is one drop-down grouped by kind, with the grade band on each move");

  /* ── every move plays once and stops; the last step lights ── */
  const plays = [];
  for (const id of IDS) {
    await p.evaluate(i => window.AOGDojo.open(i), id);
    await p.click("#goBtn");
    const playing = await p.evaluate(() => window.AOGDojo.P.playing);
    await finish(p);
    const r = await p.evaluate(() => { const A = window.AOGDojo, P = A.P, lis = [...document.querySelectorAll("#steps li")]; return { done: !P.playing && Math.abs(P.t - A.move.dur) < 1e-6, lit: lis.findIndex(l => l.classList.contains("on")) === lis.length - 1 && document.querySelectorAll("#steps li.on").length === 1 }; });
    if (!playing || !r.done || !r.lit) plays.push(id);
  }
  ok(!plays.length, `all ${IDS.length} moves play once when Go is pressed, stop at the end, and light their last step` + (plays.length ? " (" + plays.join(", ") + ")" : ""));
  await p.evaluate(() => window.AOGDojo.open("front-kick"));
  await p.click("#fwdBtn"); await finish(p);
  const st1 = await p.evaluate(() => { const A = window.AOGDojo; return { t: A.P.t, e: A.stepEnd(1), playing: A.P.playing }; });
  await p.click("#fwdBtn"); await finish(p);
  await p.click("#backBtn"); await wait(50);
  const st2 = await p.evaluate(() => { const A = window.AOGDojo; return { t: A.P.t, e: A.stepEnd(1), lit: [...document.querySelectorAll("#steps li")].findIndex(l => l.classList.contains("on")) }; });
  ok(Math.abs(st1.t - st1.e) < 1e-6 && !st1.playing && Math.abs(st2.t - st2.e) < 1e-6 && st2.lit === 1, "▶ plays one step and stops; ◀ goes back one step, and the step list follows" + (st2.lit === 1 ? "" : ` (${JSON.stringify([st1, st2])})`));

  /* ── the floor: feet never more than 1 cm under it; falls rest on the mat, never through it ── */
  const floor = await p.evaluate(ids => ids.map(id => { const A = window.AOGDojo, m = A.MOVES.find(x => x.id === id), s = A.G3().sample(m, false, 30);
    const grounded = m.keys.some(k => k.ground === "body");
    return { id, grounded, minFoot: s.minFoot, minPlanted: s.minPlanted, minBody: s.minBody }; }), IDS);
  const sink = floor.filter(f => f.minFoot < -0.01 || (f.minPlanted !== Infinity && f.minPlanted < -0.01) || (f.grounded && f.minBody < -0.01));
  ok(!sink.length, `feet stay on the floor in every move (lowest sole ${Math.min(...floor.map(f => f.minFoot)).toFixed(3)} m); falls and the sprawl stay on top of the mat (lowest ${Math.min(...floor.filter(f => f.grounded).map(f => f.minBody)).toFixed(3)} m)` + (sink.length ? " — " + sink.map(f => `${f.id} foot ${f.minFoot.toFixed(3)} body ${f.minBody.toFixed(3)}`).join("; ") : ""));
  const floating = floor.filter(f => !f.grounded && !(f.minPlanted <= 0.012));
  ok(!floating.length, "planted feet really touch the floor (no floating stances)" + (floating.length ? " — " + floating.map(f => f.id + " " + f.minPlanted.toFixed(3)).join(", ") : ""));

  /* ── mirror: the other side does the work ── */
  const mir = await p.evaluate(() => { const A = window.AOGDojo, m = A.MOVES.find(x => x.id === "front-kick"); const a = A.G3().sample(m, false, 10), b = A.G3().sample(m, true, 10); return { a: a.high, b: b.high }; });
  ok(mir.a.R > mir.a.L + 0.3 && mir.b.L > mir.b.R + 0.3, `Mirror flips sides: the back leg that kicks is the right one (${mir.a.R.toFixed(2)} m), mirrored the left (${mir.b.L.toFixed(2)} m)`);
  await p.click("#mirrorBtn"); await wait(80);
  ok(await p.evaluate(() => window.AOGDojo.mirror && /side=left/.test(location.search) && location.hash === "#front-kick"), "the Mirror button turns on the other side and the address says ?side=left");
  await p.click("#mirrorBtn"); await wait(50);

  /* ── silent: nothing drawn, no animation frames, while nobody touches it ── */
  await wait(300);
  const idle0 = await p.evaluate(() => ({ r: window.AOGDojo.G3().renders(), f: window.__raf }));
  await wait(1500);
  const idle1 = await p.evaluate(() => ({ r: window.AOGDojo.G3().renders(), f: window.__raf }));
  ok(idle1.r === idle0.r && idle1.f === idle0.f, `nothing is drawn and no animation frame is asked for while idle (${idle1.r - idle0.r} draws, ${idle1.f - idle0.f} frames in 1.5 s)`);
  const shot = await stageShot(p);
  ok(shot.length > 40000, `the dojo and the figure are drawn (${Math.round(shot.length / 1024)} KB picture)`);
  /* the ghost: several faded moments in one still picture */
  await p.click("#ghostBtn"); await wait(400);
  ok(await p.evaluate(() => window.AOGDojo.state.ghost && document.getElementById("goBtn").disabled), "Ghost shows the whole move in one still picture");
  await p.click("#ghostBtn"); await wait(100);
  /* the view menu and a drag to walk around */
  await p.selectOption("#viewPick", "side"); await wait(80);
  const bx = await (await p.$("#stage")).boundingBox();
  await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down(); await p.mouse.move(bx.x + bx.width / 2 + 120, bx.y + bx.height / 2, { steps: 6 }); await p.mouse.up();
  ok(await p.evaluate(() => window.AOGDojo.G3().view() === "orbit" && document.getElementById("viewPick").value === "orbit"), "the camera menu picks a view; dragging the picture walks around the figure");
  /* the practice tracker */
  await p.click('#panel [data-prog="2"]'); await p.reload({ waitUntil: "load" }); await wait(300);
  ok(await p.evaluate(() => window.AOGDojo.state.progress["front-kick"] === 2 && JSON.parse(localStorage.getItem("aog.dojo.v1")).progress["front-kick"] === 2 && document.querySelector('#panel [data-prog="2"]').getAttribute("aria-pressed") === "true"),
     "\"I can do it slowly\" is kept on this device after a reload");
  await p.evaluate(() => { location.hash = "#jab"; }); await wait(150);
  ok(await p.evaluate(() => window.AOGDojo.move.id === "jab" && /Jab/.test(document.getElementById("moveName").textContent)), "changing the address to #jab opens the jab");
  ok(!p.errs.length, "no errors on a computer" + (p.errs.length ? ": " + p.errs[0] : ""));
  await p.context().close();

  /* ── both address forms for the other side ── */
  for (const addr of ["?side=left#front-kick", "#front-kick?side=left"]) {
    const q = await open({ width: 390, height: 844 }, true, addr);
    const r = await q.evaluate(() => ({ id: window.AOGDojo.move.id, m: window.AOGDojo.mirror, side: !document.getElementById("capSide").hidden }));
    ok(r.id === "front-kick" && r.m && r.side, `/dojo${addr} opens the front kick on the other side`);
    await q.evaluate(() => { location.hash = "#jab?side=left"; }); await wait(150);
    ok(await q.evaluate(() => window.AOGDojo.move.id === "jab" && window.AOGDojo.mirror), `then #jab?side=left opens the jab, still on the other side`);
    await q.context().close();
  }

  /* ── reduce motion: each step's finished pose at once ── */
  const rm = await open({ width: 820, height: 1180 }, true, "#roundhouse-kick", { reducedMotion: "reduce" });
  await ready(rm);
  await rm.click("#fwdBtn"); await wait(50);
  const a1 = await rm.evaluate(() => { const A = window.AOGDojo; return !A.P.playing && Math.abs(A.P.t - A.stepEnd(1)) < 1e-6; });
  await rm.click("#goBtn"); await wait(50);
  const a2 = await rm.evaluate(() => { const A = window.AOGDojo; return !A.P.playing && Math.abs(A.P.t - A.move.dur) < 1e-6; });
  ok(a1 && a2, "with reduce motion on, ▶ shows the next step's pose at once and Go shows the end at once (iPad)");
  await rm.context().close();

  /* ── iPhone and iPad, English and Spanish, every move ── */
  for (const [name, vp] of [["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }]]) {
    const q = await open(vp, true, "#ready");
    await ready(q);
    for (const lang of ["en", "es"]) {
      if (lang === "es") await q.evaluate(() => document.getElementById("langBtn").click());
      for (const id of IDS) {
        await q.evaluate(i => window.AOGDojo.open(i), id);
        const r = await q.evaluate(() => ({ pan: document.documentElement.scrollWidth - innerWidth, steps: document.querySelectorAll("#steps li").length, lang: document.documentElement.lang, txt: document.getElementById("panel").textContent }));
        if (r.pan > 2 || !r.steps || r.lang !== lang || (lang === "es" && !/Pasos/.test(r.txt))) ok(false, `${name} ${lang} ${id}: pans ${r.pan}px, ${r.steps} steps, lang ${r.lang}`);
      }
    }
    const sh = await stageShot(q);
    ok(!q.errs.length && sh.length > 20000, `${name}: all ${IDS.length} moves open and fit, in English and Spanish, with the 3D drawn` + (q.errs.length ? " — " + q.errs[0] : ""));
    await q.context().close();
  }
  await b.close(); server.close();
  console.log(fails ? `\n${fails} check(s) failed` : "\nThe Dojo: all checks pass");
  process.exit(fails ? 1 : 0);
})();
