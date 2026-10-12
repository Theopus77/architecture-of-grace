#!/usr/bin/env node
/* AOG SEWING CHECK — Jimmy (2026-10-12): "Could we not take this amazement to FACS for cooking and sewing lessons? …
   demonstration on how to sew etc." The Sewing Room (sewing.html, /sewing-lab; aog-sewing-moves.js the words,
   aog-sewing.js the engine and the page, aog-sewing3d.js the room) works every stitch out from the needle's path, so a
   change could quietly teach a stitch wrong. This opens it on a computer, an iPhone and an iPad and checks:
     · the words: all 20 moves (ids fixed in _work/engine3d/CONTRACT.md) have a name, a line, steps, what helps and the
       tools in English and Spanish, the same number of steps in both, and one stretch of the demonstration per step,
     · the stitches: the thread only goes through the cloth where the needle went first, and every stitch leaves the
       right front and back (running: even dashes and gaps; backstitch: a solid line in front, long overlapping stitches
       behind; whipstitch: slants over the edge; blind hem: tiny catches on the right side; blanket: a loop at the edge
       for every stitch; button: bars through the holes, a wrapped shank, a knot behind; tie-off: a knot at the end;
       the machine: even 3 mm stitches, a backstitch at both ends, a square corner, 1.5 cm from the edge),
     · safety in the pictures: the foot off the pedal while threading, shears closed and handle first at the end, pins
       out before they reach the foot, the iron stood on its heel and unplugged at the end,
     · calm: words first, the 3D room right after; nothing draws or asks for frames while idle; Go plays once and stops;
       ▶ plays one step and lights it; ◀ and the slider; "reduce motion" shows each step's end at once; a drag draws,
     · every /sewing-lab#<id> opens that move (on load and by hashchange); no sideways scroll on an iPhone or an iPad in
       English or Spanish; the practice tracker is kept on the device; leaving lets the 3D go.
       node tools/check-sewing.js
   Exit code 1 when anything fails. Run it after any change to the Sewing Room's files (see CLAUDE.md). */
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
const IDS = ["thread-needle", "tie-knot", "running-stitch", "backstitch", "whipstitch", "slip-stitch", "blanket-stitch", "sew-button", "tie-off",
  "pin-pattern", "cut-fabric", "mark-fabric",
  "machine-parts", "wind-bobbin", "thread-machine", "straight-seam", "backstitch-machine", "pivot-corner", "seam-allowance", "press-seam"];

(async () => {
  await new Promise(o => server.listen(0, o)); const port = server.address().port, URL = `http://127.0.0.1:${port}/sewing.html`;
  const b = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });   // WebGL for the room
  async function open(vp, touch, hash, extra, init) {
    const ctx = await b.newContext(Object.assign({ viewport: vp, isMobile: !!touch, hasTouch: !!touch }, extra || {}));
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    await ctx.addInitScript(init => {   // count animation frames asked for (silent while idle)
      window.__raf = 0; const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = f => { window.__raf++; return raf(f); };
      if (init && init.lang) try { localStorage.setItem("aog.lang", init.lang); } catch (e) {}
    }, init || {});
    const p = await ctx.newPage(); p.errs = []; p.ctx = ctx;
    p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) p.errs.push(m.text()); });
    await p.goto(URL + (hash ? "#" + hash : ""), { waitUntil: "load" });
    return p;
  }
  const ready = async p => { for (let i = 0; i < 120; i++) { const s = await p.evaluate(() => window.AOGSewing.G3state()); if (s === "ready" || s === "failed") return s; await wait(250); } return "timeout"; };
  /* jump a playing demonstration to its end and wait until the player has stopped there */
  async function finish(p) {
    await p.evaluate(() => { window.AOGSewing.P.t0 -= 6e6; });
    for (let i = 0; i < 75 && await p.evaluate(() => window.AOGSewing.P.playing); i++) await wait(100);
  }

  /* ── words first, then the room ── */
  const p = await open({ width: 1280, height: 900 }, false, "backstitch");
  const first = await p.evaluate(() => ({ name: document.getElementById("mvName") && document.getElementById("mvName").textContent,
    steps: document.querySelectorAll("#steps li").length, g3: window.AOGSewing.G3state(),
    three: performance.getEntriesByType("resource").some(e => /aog-sewing3d|three\.module/.test(e.name) && e.responseEnd > 0 && e.startTime < 1) }));
  ok(first.name === "Backstitch" && first.steps === 8, `the words show at once (${first.name}, ${first.steps} steps), before the 3D room`);
  const g3 = await ready(p);
  ok(g3 === "ready", `the 3D room gets ready right after the words (${g3})`);
  ok(await p.evaluate(() => document.getElementById("loading").hidden), "\"Getting the sewing room ready…\" goes away once the room is up");

  /* ── the words and the demonstrations, straight from the engine ── */
  const eng = await p.evaluate(IDS => {
    const A = window.AOGSewing, W = window.AOGSewingWords, out = { ids: A.ORDER.slice(), bad: [], need: [], steps: [] };
    IDS.forEach(id => {
      const m = A.MOVES[id];
      if (!m) { out.bad.push(id + ": missing"); return; }
      ["en", "es"].forEach(l => { const c = m[l]; if (!c || !c.n || !c.d || !c.tip || !c.steps || !c.steps.length || c.steps.some(s => !s || s.length > 160)) out.bad.push(id + ": " + l + " words"); });
      if (m.en.steps.length !== m.es.steps.length) out.bad.push(id + ": " + m.en.steps.length + " English steps, " + m.es.steps.length + " Spanish");
      if (!m.tools.length || m.tools.some(k => !W.TOOLS[k])) out.bad.push(id + ": tools");
      (m.safe || []).forEach(k => { if (!W.SAFE[k] || !W.SAFE[k][0] || !W.SAFE[k][1]) out.bad.push(id + ": safety " + k); });
      const tl = A.timeline(id), n = m.en.steps.length;
      // one stretch of time per step, in order, with no gaps; sampling inside a stretch says that step
      let stepsOK = tl.steps.length === n && tl.steps[0][0] === 0 && Math.abs(tl.steps[n - 1][1] - tl.dur) < 1e-6;
      for (let k = 0; k < tl.steps.length && stepsOK; k++) {
        const r = tl.steps[k];
        if (!(r[1] > r[0]) || (k && Math.abs(r[0] - tl.steps[k - 1][1]) > 1e-6)) stepsOK = false;
        else for (const f of [0.1, 0.5, 0.95]) if (A.sample(tl, r[0] + (r[1] - r[0]) * f).step !== k) stepsOK = false;
      }
      out.steps.push([id, stepsOK, tl.steps.length, n]);
      const nc = A.needleCheck(id, 200);
      if (!nc.ok) out.need.push(id + " " + JSON.stringify(nc.bad[0]));
      // every sample is finite (no NaN anywhere in the picture)
      const bad = v => Array.isArray(v) ? v.some(bad) : (typeof v === "number" && !isFinite(v));
      for (let i = 0; i <= 40; i++) { const st = A.sample(tl, tl.dur * i / 40); if ([st.threads, st.needle, st.stitches, st.handL && st.handL.p, st.handR && st.handR.p].some(v => v && bad(v))) { out.bad.push(id + ": not a number at " + i + "/40"); break; } }
    });
    // the finished stitches, front and back
    const fp = {}; IDS.forEach(id => { fp[id] = A.finalPattern(id); });
    const L = ls => ls.map(l => l.len * 1000);
    const even = (xs, tol) => xs.length > 1 && Math.max(...xs) - Math.min(...xs) <= tol;
    const run = fp["running-stitch"], back = fp.backstitch, whip = fp.whipstitch, slip = fp["slip-stitch"], bl = fp["blanket-stitch"], btn = fp["sew-button"], tie = fp["tie-off"];
    // running: dashes in front and behind, all the same length, and they take turns (a front dash never lies over a back one)
    const overlap = (a, b) => Math.min(Math.max(a.a[0], a.b[0]), Math.max(b.a[0], b.b[0])) - Math.max(Math.min(a.a[0], a.b[0]), Math.min(b.a[0], b.b[0]));
    out.run = [run.front.length >= 4 && run.back.length >= 3 && even(L(run.front), 0.6) && even(L(run.back), 0.6) && run.front.every(f => run.back.every(k => overlap(f, k) < 0.0004)) && run.knots >= 1,
      `${run.front.length} front dashes of ${L(run.front)[0].toFixed(1)} mm, ${run.back.length} behind, taking turns`];
    // backstitch: the front stitches touch end to end (a solid line); the back ones are twice as long and overlap
    const gap = (a, b) => Math.min(...[[a.a, b.a], [a.a, b.b], [a.b, b.a], [a.b, b.b]].map(q => Math.hypot(q[0][0] - q[1][0], q[0][1] - q[1][1])));
    const touch = ls => ls.every((l, i) => !i || gap(l, ls[i - 1]) < 0.0004);
    const fl = L(back.front), bk = L(back.back);
    out.back = [back.front.length >= 5 && touch(back.front) && even(fl, 0.6) && Math.abs(bk[0] / fl[0] - 2) < 0.15 && back.back.every((k, i) => !i || overlap(k, back.back[i - 1]) > 0.002),
      `a solid line of ${back.front.length} front stitches (${fl[0].toFixed(1)} mm); behind, ${back.back.length} of ${bk[0].toFixed(1)} mm overlapping`];
    // whipstitch: one wrap over the edge per stitch, slanted on both sides
    const slant = l => Math.abs(l.b[0] - l.a[0]) > 0.0015 && Math.abs(l.b[1] - l.a[1]) > 0.0015;
    out.whip = [whip.wraps >= 5 && whip.front.length === whip.wraps && whip.back.length === whip.wraps && whip.front.every(slant),
      `${whip.wraps} wraps over the edge, ${whip.front.length} slants in front`];
    // blind hem: the catches that show on the right side are tiny (about 1 mm); the thread travels inside the fold
    out.slip = [slip.back.length >= 4 && L(slip.back).every(v => v < 1.6) && slip.inside.length >= 4,
      `${slip.back.length} catches of ${Math.max(...L(slip.back)).toFixed(1)} mm on the right side, ${slip.inside.length} slides inside the fold`];
    // blanket: a loop around the edge for every stitch, the stitches the same height and spacing
    out.blanket = [bl.wraps >= 5 && bl.back.length === bl.wraps && even(L(bl.back), 0.6), `${bl.wraps} loops along the edge, ${bl.back.length} even bars behind`];
    // button: bars through the holes, a wrapped shank, a knot behind, both buttons sewn
    out.button = [btn.over.length >= 4 && btn.shank >= 6 && btn.knots >= 2 && btn.pens.length >= 12, `${btn.over.length} bars over the buttons, ${btn.shank} wraps of shank, ${btn.knots} knots, ${btn.pens.length} passes through the cloth`];
    // tie-off: the running stitches stay, and a knot ends the thread at the back
    const tlT = A.timeline("tie-off"), loopAt = A.sample(tlT, (tlT.steps[4][0] + tlT.steps[4][1]) / 2).loop;
    out.tie = [tie.front.length >= 4 && tie.knots >= 2 && loopAt && loopAt.r > 0.002, `${tie.front.length} stitches kept, a loop to pass the needle through, and ${tie.knots} knots (the start and the end)`];
    // the machine: even 3 mm stitches 1.5 cm from the edge; a backstitch at both ends; a square corner
    const ms = id => fp[id].stitches, steps = s => s.slice(1).map((q, i) => Math.hypot(q[0] - s[i][0], q[1] - s[i][1]) * 1000);
    const ss = ms("straight-seam");
    out.seam = [ss.length > 40 && even(steps(ss), 0.05) && ss.every(q => Math.abs(q[0] + 0.015) < 0.0002), `${ss.length} stitches of ${steps(ss)[0].toFixed(1)} mm, all 15 mm from the edge`];
    const bm = ms("backstitch-machine"), dirs = bm.slice(1).map((q, i) => Math.sign(Math.round((q[1] - bm[i][1]) * 1e5)));
    const revs = dirs.reduce((n, d, i) => n + (i && d !== dirs[i - 1] ? 1 : 0), 0);
    out.bsm = [revs >= 4 && dirs[0] > 0 && dirs[dirs.length - 1] > 0, `the seam goes back over itself at the start and the end (${revs} turns)`];
    const pc = ms("pivot-corner"), d0 = [pc[1][0] - pc[0][0], pc[1][1] - pc[0][1]], d1 = [pc[pc.length - 1][0] - pc[pc.length - 2][0], pc[pc.length - 1][1] - pc[pc.length - 2][1]];
    const dot = (d0[0] * d1[0] + d0[1] * d1[1]) / Math.hypot(...d0) / Math.hypot(...d1);
    out.pivot = [Math.abs(dot) < 0.02 && pc.length > 40, `the seam turns a square corner (cos ${dot.toFixed(3)}) without a gap`];
    const sa = ms("seam-allowance");
    out.sa = [sa.length > 20 && sa.every(q => Math.abs(Math.abs(q[0]) - 0.015) < 0.0002), "the seam stays on the 1.5 cm (5/8 in) line"];
    // safety in the pictures
    const at = (id, k, f) => { const tl = A.timeline(id), r = tl.steps[k]; return A.sample(tl, r[0] + (r[1] - r[0]) * (f == null ? 0.999 : f)); };
    const tm = A.timeline("thread-machine"); let footOff = true;
    for (let k = 1; k < tm.steps.length; k++) for (const f of [0.05, 0.5, 0.99]) { const st = at("thread-machine", k, f); if (st.m.footOnPedal > 0.01 || st.m.pedal > 0) footOff = false; }
    const wb = A.timeline("wind-bobbin"); for (let k = 1; k < 5; k++) { const st = at("wind-bobbin", k, 0.5); if (st.m.footOnPedal > 0.01) footOff = false; }
    const cutEnd = A.sample(A.timeline("cut-fabric"), A.timeline("cut-fabric").dur).cut.shears;
    const press = A.sample(A.timeline("press-seam"), A.timeline("press-seam").dur);
    let pinsOut = true;
    const st0 = A.timeline("straight-seam"); for (let i = 0; i <= 200; i++) { const st = A.sample(st0, st0.dur * i / 200); if (st.mf && st.mf.pinsNow) st.mf.pinsNow.forEach(q => { if (q.lz - st.mf.needleLocal[1] < 0.03 && q.out < 1) pinsOut = false; }); }
    out.safe = [footOff, cutEnd.closed === 1 && cutEnd.open === 0 && cutEnd.hand > 0.99, pinsOut, press.iron.upright === 1 && press.pr.plugged === 0];
    return out;
  }, IDS);
  ok(eng.ids.length === 20 && IDS.every(id => eng.ids.includes(id)), `all 20 sewing moves are there (${eng.ids.length})`);
  ok(!eng.bad.length, "every move has its name, line, steps, what helps, tools and safety in English and Spanish" + (eng.bad.length ? ": " + eng.bad.slice(0, 6).join("; ") : ""));
  const stepBad = eng.steps.filter(s => !s[1]);
  ok(!stepBad.length, "every step has one stretch of the demonstration, in order (steps match the keyframes)" + (stepBad.length ? ": " + stepBad.map(s => `${s[0]} ${s[2]}/${s[3]}`).join(", ") : ""));
  ok(!eng.need.length, "the thread only goes through the cloth where the needle went first, in every hand move" + (eng.need.length ? ": " + eng.need.join("; ") : ""));
  ok(eng.run[0], "running stitch: " + eng.run[1]);
  ok(eng.back[0], "backstitch: " + eng.back[1]);
  ok(eng.whip[0], "whipstitch: " + eng.whip[1]);
  ok(eng.slip[0], "blind hem: " + eng.slip[1]);
  ok(eng.blanket[0], "blanket stitch: " + eng.blanket[1]);
  ok(eng.button[0], "sew on a button: " + eng.button[1]);
  ok(eng.tie[0], "tie off: " + eng.tie[1]);
  ok(eng.seam[0], "straight seam: " + eng.seam[1]);
  ok(eng.bsm[0], "backstitch on the machine: " + eng.bsm[1]);
  ok(eng.pivot[0], "pivot at a corner: " + eng.pivot[1]);
  ok(eng.sa[0], "seam allowance: " + eng.sa[1]);
  ok(eng.safe[0], "the foot stays off the pedal while threading and setting up the bobbin");
  ok(eng.safe[1], "the shears end closed and handed over handle first");
  ok(eng.safe[2], "every pin comes out before it reaches the presser foot");
  ok(eng.safe[3], "the iron ends standing on its heel, unplugged");

  /* ── the player: still while idle; Go plays once; ▶ one step; ◀; the slider; the back of the fabric ── */
  const idle0 = await p.evaluate(() => ({ r: window.AOGSewing.G3().renders(), f: window.__raf }));
  await wait(1500);
  const idle1 = await p.evaluate(() => ({ r: window.AOGSewing.G3().renders(), f: window.__raf }));
  ok(idle1.r === idle0.r && idle1.f === idle0.f, `still while idle: no drawing, no animation frames (${idle1.r - idle0.r} draws, ${idle1.f - idle0.f} frames in 1.5 s)`);
  await p.click("#goBtn"); await wait(400);
  const playing = await p.evaluate(() => ({ on: window.AOGSewing.P.playing, t: window.AOGSewing.P.t, label: document.getElementById("goBtn").textContent }));
  await finish(p);
  const done = await p.evaluate(() => ({ on: window.AOGSewing.P.playing, t: window.AOGSewing.P.t, dur: window.AOGSewing.P.tl.dur, lit: [...document.querySelectorAll("#steps li")].findIndex(li => li.classList.contains("on")), n: document.querySelectorAll("#steps li").length, r: window.AOGSewing.G3().renders(), f: window.__raf }));
  ok(playing.on && playing.t > 0 && playing.label === "Pause", "Go plays the demonstration (and turns into Pause)");
  ok(!done.on && Math.abs(done.t - done.dur) < 1e-6 && done.lit === done.n - 1, `Go plays once and stops at the end, the last step lit (${done.lit + 1} of ${done.n})`);
  await wait(800);
  const after = await p.evaluate(() => ({ r: window.AOGSewing.G3().renders(), f: window.__raf }));
  ok(after.r === done.r && after.f === done.f, "once it stops, nothing draws and no frames are asked for");
  await p.evaluate(() => window.AOGSewing.scene(0));
  await p.click("#nextBtn"); await finish(p);
  const s1 = await p.evaluate(() => ({ t: window.AOGSewing.P.t, end: window.AOGSewing.P.tl.steps[0][1], lit: [...document.querySelectorAll("#steps li")].findIndex(li => li.classList.contains("on")), cap: document.getElementById("stepNow").textContent }));
  await p.click("#nextBtn"); await finish(p);
  const s2 = await p.evaluate(() => ({ t: window.AOGSewing.P.t, end: window.AOGSewing.P.tl.steps[1][1], lit: [...document.querySelectorAll("#steps li")].findIndex(li => li.classList.contains("on")) }));
  ok(Math.abs(s1.t - s1.end) < 1e-3 && s1.lit === 0 && /^Step 1 of 8/.test(s1.cap) && Math.abs(s2.t - s2.end) < 1e-3 && s2.lit === 1, "▶ plays one step and stops, and that step is lit (step 1, then step 2)");
  await p.click("#prevBtn");
  const s3 = await p.evaluate(() => ({ lit: [...document.querySelectorAll("#steps li")].findIndex(li => li.classList.contains("on")), playing: window.AOGSewing.P.playing }));
  ok(s3.lit === 0 && !s3.playing, "◀ goes back one step");
  await p.click('[data-step="5"]');
  ok(await p.evaluate(() => [...document.querySelectorAll("#steps li")].findIndex(li => li.classList.contains("on"))) === 5, "tapping a step shows that step");
  await p.evaluate(() => { const s = document.getElementById("scrub"); s.value = "500"; s.dispatchEvent(new Event("input")); });
  ok(await p.evaluate(() => Math.abs(window.AOGSewing.P.t - window.AOGSewing.P.tl.dur / 2) < 0.05), "the slider moves through the demonstration");
  await p.click("#backBtn");
  const flip = await p.evaluate(() => ({ f: window.AOGSewing.P.st.work.flip, t: window.AOGSewing.P.t, dur: window.AOGSewing.P.tl.dur, pressed: document.getElementById("backBtn").getAttribute("aria-pressed") }));
  ok(flip.f === 1 && flip.pressed === "true" && Math.abs(flip.t - flip.dur) < 1e-6, "\"Show the back of the fabric\" turns the finished work over");
  await p.click("#backBtn");
  ok(await p.evaluate(() => window.AOGSewing.P.st.work.flip === 0), "and tapping it again shows the front");
  const svg = await p.evaluate(() => [...document.querySelectorAll("#result figure")].map(f => [f.querySelector("figcaption").textContent, f.querySelectorAll("line.th").length]));
  ok(svg.length === 2 && svg[0][1] >= 5 && svg[1][1] >= 4, `the finished stitches are drawn front and back under the steps (${svg.map(s => s.join(": ")).join(", ")})`);

  /* ── the camera: four views; a drag walks around and draws ── */
  const cams = await p.evaluate(() => [...document.querySelectorAll("#camSel option")].map(o => o.value));
  ok(cams.join() === "close,shoulder,across,orbit", "the camera menu: close on the hands, over the shoulder, across the table, walk around");
  const r0 = await p.evaluate(() => window.AOGSewing.G3().renders());
  for (const c of cams.slice(0, 3)) await p.selectOption("#camSel", c);
  const r1 = await p.evaluate(() => window.AOGSewing.G3().renders());
  ok(r1 - r0 >= 3, "each view draws once when chosen");
  const box = await (await p.$("#stage canvas")).boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down();
  for (let i = 1; i <= 6; i++) await p.mouse.move(box.x + box.width / 2 + i * 25, box.y + box.height / 2);
  await p.mouse.up();
  const r2 = await p.evaluate(() => ({ r: window.AOGSewing.G3().renders(), cam: document.getElementById("camSel").value }));
  ok(r2.r > r1 && r2.cam === "orbit", `dragging walks around the table and draws (${r2.r - r1} draws, view: ${r2.cam})`);
  await p.selectOption("#camSel", "close");
  const r3 = await p.evaluate(() => window.AOGSewing.G3().renders());
  await p.setViewportSize({ width: 800, height: 900 }); await wait(500);
  ok(await p.evaluate(() => window.AOGSewing.G3().renders()) > r3, "a new window size draws once");
  const r4 = await p.evaluate(() => window.AOGSewing.G3().renders());
  await p.evaluate(() => document.getElementById("themeBtn").click()); await wait(200);   // the site bar presses this button
  const r5 = await p.evaluate(() => ({ r: window.AOGSewing.G3().renders(), dark: document.documentElement.getAttribute("data-theme") }));
  ok(r5.r > r4 && r5.dark === "dark", "the night look draws once when the theme changes");
  await p.evaluate(() => document.getElementById("themeBtn").click());

  /* ── every /sewing-lab#<id> opens that move: by hashchange, then on load ── */
  const viaHash = [];
  for (const id of IDS) {
    await p.evaluate(id => { location.hash = id; }, id); await wait(60);
    const got = await p.evaluate(() => ({ m: window.AOGSewing.state.move, sel: document.getElementById("moveSel").value, h: document.getElementById("mvName").textContent, t: window.AOGSewing.P.t }));
    const want = await p.evaluate(id => window.AOGSewingWords.MOVES.find(m => m.id === id).en.n, id);
    if (got.m !== id || got.sel !== id || got.h !== want || got.t !== 0) viaHash.push(id);
  }
  ok(!viaHash.length, "a change of address (#<move>) opens that move, at its start" + (viaHash.length ? ": " + viaHash.join(", ") : ""));
  const ctxL = await b.newContext({ viewport: { width: 1024, height: 768 } }); await ctxL.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  await ctxL.route(/aog-sewing3d\.js/, r => r.abort());   // this sweep reads the words only
  const pl = await ctxL.newPage(), onLoad = [];
  for (const id of IDS) {
    await pl.goto(URL + "#" + id, { waitUntil: "domcontentloaded" });
    const got = await pl.evaluate(() => ({ m: window.AOGSewing && window.AOGSewing.state.move, h: document.getElementById("mvName") && document.getElementById("mvName").textContent }));
    const want = await pl.evaluate(id => window.AOGSewingWords.MOVES.find(m => m.id === id).en.n, id);
    if (got.m !== id || got.h !== want) onLoad.push(id + "→" + got.m);
  }
  ok(!onLoad.length, "every /sewing-lab#<move> link opens that move (all 20)" + (onLoad.length ? ": " + onLoad.join(", ") : ""));
  await ctxL.close();

  /* ── the practice tracker is kept on this device ── */
  await p.evaluate(() => { location.hash = "sew-button"; }); await wait(80);
  await p.click('[data-prog="2"]');
  await p.reload({ waitUntil: "load" }); await wait(300);
  const kept = await p.evaluate(() => ({ pressed: document.querySelector('[data-prog="2"]').getAttribute("aria-pressed"), saved: JSON.parse(localStorage.getItem("aog.sewing.v1")).progress["sew-button"], m: window.AOGSewing.state.move }));
  ok(kept.pressed === "true" && kept.saved === 2 && kept.m === "sew-button", "the practice tracker keeps \"I can do it slowly\" on this device after a reload");
  await p.click('[data-prog="2"]');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem("aog.sewing.v1")).progress["sew-button"] === 0), "tapping it again clears it");

  /* ── leaving lets the room go ── */
  await ready(p);
  const gone = await p.evaluate(() => { window.dispatchEvent(new Event("pagehide")); return { g: window.AOGSewing.G3(), canvas: !!document.querySelector("#stage canvas") }; });
  ok(gone.g === null && !gone.canvas, "leaving the page lets the 3D room and its drawing go");
  ok(!p.errs.length, "no errors on the computer" + (p.errs.length ? ": " + p.errs.slice(0, 3).join(" | ") : ""));
  await p.ctx.close();

  /* ── reduce motion: each step shows its end at once ── */
  const rm = await open({ width: 820, height: 1180 }, true, "running-stitch", { reducedMotion: "reduce" });
  await ready(rm);
  await rm.click("#nextBtn");
  const rm1 = await rm.evaluate(() => ({ on: window.AOGSewing.P.playing, t: window.AOGSewing.P.t, end: window.AOGSewing.P.tl.steps[0][1] }));
  await rm.click("#goBtn");
  const rm2 = await rm.evaluate(() => ({ on: window.AOGSewing.P.playing, t: window.AOGSewing.P.t, end: window.AOGSewing.P.tl.dur }));
  ok(!rm1.on && Math.abs(rm1.t - rm1.end) < 1e-3 && !rm2.on && Math.abs(rm2.t - rm2.end) < 1e-6, "with \"reduce motion\", ▶ and Go show the end at once, nothing plays");
  await rm.ctx.close();

  /* ── iPhone and iPad, English and Spanish: every move, no sideways scroll ── */
  for (const [dev, vp] of [["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }]]) {
    for (const lang of ["en", "es"]) {
      const q = await open(vp, true, "backstitch", { deviceScaleFactor: 2 }, { lang });
      const st = await ready(q);
      const wide = [];
      for (const id of IDS) {
        await q.evaluate(id => { location.hash = id; }, id); await wait(40);
        const w = await q.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.getElementById("mvName").textContent }));
        if (w.sw > w.cw + 1) wide.push(id + " " + w.sw);
      }
      const words = await q.evaluate(() => ({ lang: document.documentElement.lang, h: document.getElementById("mvName").textContent, go: document.getElementById("goBtn").textContent, back: document.getElementById("backBtn").textContent, safe: document.getElementById("safety").textContent }));
      const want = lang === "es" ? { h: "Planchar una costura", go: "Empezar", back: "Ver el revés de la tela", safe: /plancha/i } : { h: "Press a seam", go: "Go", back: "Show the back of the fabric", safe: /iron/i };
      ok(st === "ready" && !wide.length && words.lang === lang && words.h === want.h && words.go === want.go && want.safe.test(words.safe),
        `${dev}, ${lang === "es" ? "Spanish" : "English"}: every move fits with no sideways scroll, words and safety in ${lang === "es" ? "Spanish" : "English"}, the room is up` + (wide.length ? ": " + wide.join(", ") : ""));
      ok(!q.errs.length, `${dev} ${lang}: no errors` + (q.errs.length ? ": " + q.errs.slice(0, 3).join(" | ") : ""));
      await q.ctx.close();
    }
  }

  await b.close(); server.close();
  console.log(fails ? `\n${fails} check(s) failed.` : "\nThe Sewing Room passes.");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
