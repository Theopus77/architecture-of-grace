#!/usr/bin/env node
/* AOG CUBE CHECK — Jimmy (2026-10-11): "how to take this to the ceiling … DO them all". The Cube Lab's hands-on
   behaviour, checked on an iPad and an iPhone (touch, and acting like Safari) and on a computer, so a change can never
   quietly break it again:
     · the solver solves (aog-cube.js's own test),
     · a finger on the cube never scrolls the page; following the arrow makes that move,
     · the space around the cube never moves it; Front and Back are always the same two views; Undo on the cube,
     · circling a side's middle square turns that side like a steering wheel, both ways,
     · two fingers swiped together turn the whole cube; the rest of the cube steps back while a row turns,
     · Solve with me reaches Solved; every Learn step can be practised to the end; painting and Check my cube,
     · the named moves, the three kinds of help, practising one step, the real-cube check after a step,
     · symbols on the stickers, Read aloud (never on its own), the screen-reader description, the move card,
     · the camera: its color reader sorts a lit, tinted, noisy cube right, and its sheet opens and closes.
       node tools/check-cube.js
   Exit code 1 when anything fails. Run it after any change to cube-lab.html or aog-cube.js (see CLAUDE.md). */
const path = require("path"), fs = require("fs"), http = require("http"), cp = require("child_process");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(cp.execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg" };
const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
let fails = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const wait = ms => new Promise(o => setTimeout(o, ms));

(async () => {
  /* the short way: two-phase search, every answer checked by turning the cube to solved */
  try { const out = cp.execSync("node " + JSON.stringify(path.join(ROOT, "aog-cube-short.js")) + " test 8", { stdio: "pipe", timeout: 120000 }).toString().trim().split("\n").pop();
    const m = out.match(/longest (\d+)/); ok(/^ok/.test(out) && m && +m[1] <= 22, "the short way: " + out); }
  catch (e) { ok(false, "the short way's own test failed: " + String(e.stdout || e.message).slice(0, 300)); }
  /* the faster way (Level 2): cross in one go, pairs, two looks for the top, two for the last layer */
  try { const out = cp.execSync("node " + JSON.stringify(path.join(ROOT, "aog-cube-l2.js")) + " test 120", { stdio: "pipe", timeout: 300000 }).toString().trim().split("\n");
    const line = out.find(l => /^ok/.test(l)) || out.pop(), avg = +(line.match(/average ([\d.]+)/) || [0, 999])[1];
    ok(/^ok/.test(line) && avg < 95, "the faster way: " + line); }
  catch (e) { ok(false, "the faster way's own test failed: " + String(e.stdout || e.message).slice(0, 300)); }
  /* the solver */
  try { const out = cp.execSync("node " + JSON.stringify(path.join(ROOT, "aog-cube.js")) + " test", { stdio: "pipe" }).toString().trim().split("\n").pop(); ok(/^ok/.test(out), "the solver: " + out); }
  catch (e) { ok(false, "the solver's own test failed: " + String(e.stdout || e.message).slice(0, 300)); }

  await new Promise(o => server.listen(0, o)); const port = server.address().port, URL = `http://127.0.0.1:${port}/cube-lab.html`;
  const b = await pw.chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const st = p => p.evaluate(() => JSON.parse(localStorage.getItem("aog.cube.v1")));
  const hist = async p => (await st(p)).hist.length;
  async function open(vp, touch, hash, speed, way) {
    const ctx = await b.newContext({ viewport: vp, isMobile: !!touch, hasTouch: !!touch, permissions: ["camera"] });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    const p = await ctx.newPage(); p.errs = []; p.on("pageerror", e => p.errs.push(e.message));
    await ctx.addInitScript(([sp, way]) => { try { if (!localStorage.getItem("aog.cube.v1")) localStorage.setItem("aog.cube.v1", JSON.stringify(Object.assign(sp ? { speed: sp } : {}, way ? { method: way, wayV: 2 } : { method: "steps", wayV: 2 }))); } catch (e) {} }, [speed || null, way || null]);
    await p.goto(URL + "#" + (hash || "learn")); await p.waitForTimeout(800);
    const cdp = await ctx.newCDPSession(p);
    p.tp = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : pts.map(([x, y], id) => ({ x, y, id })) });
    p.ctx = ctx; return p;
  }
  const centreOf = (p, dir) => p.evaluate(dir => { const C = AOGCube, c = AOGCubeLab.cube; const i = c.P.findIndex(q => q.kind === 1 && C.eqV(c.pos(q), dir));
    const f = Object.keys(c.P[i].cols)[0]; const r = document.querySelector(`.face[data-i="${i}"][data-f="${f}"] i`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width }; }, dir);
  const screenCube = p => p.evaluate(() => { const c = AOGCubeLab.cube; return JSON.stringify(c.P.map(q => [c.pos(q), q.cols])); });
  const afterMove = (p, mv) => p.evaluate(mv => { const c = AOGCubeLab.cube.clone(); c.move(mv); return JSON.stringify(c.P.map(q => [c.pos(q), q.cols])); }, mv);

  /* ── touch: iPad landscape, iPad portrait, iPhone ── */
  for (const [name, vp] of [["iPad landscape", { width: 1000, height: 750 }], ["iPad portrait", { width: 750, height: 1000 }], ["iPhone", { width: 390, height: 844 }]]) {
    let p = await open(vp, true, "solve", "instant");
    await p.addStyleTag({ content: ".stage, .stage *{touch-action:auto !important}" });   /* act like Safari, which does not keep to touch-action alone */
    await p.evaluate(() => { scrollTo(0, 0); document.querySelector('[data-act="mix"]').click(); }); await p.waitForTimeout(300);
    let moved = 0, scrolled = 0; const N = 8;
    for (let n = 0; n < N; n++) {
      const info = await p.evaluate(() => { const path = document.querySelector("#arrow path.line"); if (!path) return null;
        const r = document.getElementById("stage").getBoundingClientRect(), k = r.width / document.getElementById("arrow").viewBox.baseVal.width;
        const v = path.getAttribute("d").match(/-?[\d.]+/g).map(Number), P = []; for (let i = 0; i < v.length; i += 2) P.push([r.left + v[i] * k, r.top + v[i + 1] * k]);
        return { P, h: JSON.parse(localStorage.getItem("aog.cube.v1")).hist.length, y: scrollY }; });
      if (!info) break;
      const P = info.P, i0 = Math.floor(P.length * .15), i1 = Math.floor(P.length * .9);
      await p.tp("touchStart", [P[i0]]); for (let k = i0 + 1; k <= i1; k++) { await p.tp("touchMove", [P[k]]); await p.waitForTimeout(16); } await p.tp("touchEnd", []); await p.waitForTimeout(250);
      const a = await p.evaluate(() => ({ h: JSON.parse(localStorage.getItem("aog.cube.v1")).hist.length, y: scrollY }));
      if (a.h > info.h) moved++; if (Math.abs(a.y - info.y) > 1) scrolled++;
    }
    ok(moved === N && scrolled === 0, `${name}: following the arrow with a finger made ${moved}/${N} moves; the page scrolled ${scrolled} times`);
    const sw = await p.evaluate(() => { const r = document.getElementById("stage").getBoundingClientRect(); return { x: r.left + r.width * .08, y: r.top + r.height * .3, y0: scrollY }; });
    await p.tp("touchStart", [[sw.x, sw.y]]); for (let k = 1; k <= 15; k++) { await p.tp("touchMove", [[sw.x, sw.y - k * 14]]); await p.waitForTimeout(10); } await p.tp("touchEnd", []); await p.waitForTimeout(200);
    ok(Math.abs(await p.evaluate(() => scrollY) - sw.y0) <= 1, `${name}: swiping up on the cube's box does not scroll the page`);
    ok(!p.errs.length, `${name}: no page errors (Solve with me) ${p.errs.join("; ")}`);
    await p.ctx.close();

    p = await open(vp, true, "learn");
    await p.evaluate(() => scrollTo(0, 0));
    const view = () => p.evaluate(() => document.getElementById("cubeView").style.transform);
    const home = await view();
    const box = await p.evaluate(() => { const r = document.getElementById("stage").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    for (const [x, y, dx, dy] of [[.06, .06, 1, 1], [.94, .06, -1, 1], [.06, .7, 1, -1], [.5, .04, 0, 1]]) {
      await p.tp("touchStart", [[box.x + box.w * x, box.y + box.h * y]]); for (let k = 1; k <= 20; k++) { await p.tp("touchMove", [[box.x + box.w * x + dx * k * 9, box.y + box.h * y + dy * k * 9]]); await p.waitForTimeout(10); } await p.tp("touchEnd", []); }
    await p.waitForTimeout(300);
    ok(await view() === home && await hist(p) === 0, `${name}: dragging the space around the cube moves nothing`);
    await p.tap('#lookRow [data-look="back"]'); await p.waitForTimeout(500); const back1 = await view();
    await p.tap('#lookRow [data-look="back"]'); await p.waitForTimeout(500);
    ok(back1 !== home && await view() === back1, `${name}: Back shows the back, the very same view every time`);
    await p.tap('#lookRow [data-look="front"]'); await p.waitForTimeout(500);
    ok(await view() === home, `${name}: Front is home`);
    /* a row drag: the rest of the cube steps back while it turns, and comes back after */
    await p.evaluate(() => scrollTo(0, 0));
    const s1 = await p.evaluate(() => { const C = AOGCube, c = AOGCubeLab.cube, i = c.P.findIndex(q => C.eqV(q.home, [1, 0, 1])); const r = document.querySelector(`.face[data-i="${i}"][data-f="F"] i`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const dimNow = () => p.evaluate(() => [...document.querySelectorAll(".face i b")].filter(x => x.style.opacity === "0.42").length);
    await p.tp("touchStart", [[s1.x, s1.y]]); for (let k = 1; k <= 6; k++) { await p.tp("touchMove", [[s1.x, s1.y - k * 10]]); await p.waitForTimeout(20); }
    const dimMid = await dimNow();
    for (let k = 7; k <= 10; k++) { await p.tp("touchMove", [[s1.x, s1.y - k * 10]]); await p.waitForTimeout(16); } await p.tp("touchEnd", []); await p.waitForTimeout(700);
    ok(dimMid > 20 && await dimNow() === 0, `${name}: while a row turns the rest steps back (${dimMid} stickers), and comes back after`);
    ok(await hist(p) === 1 && await view() === home, `${name}: dragging a row turns it, and the view stays put`);
    await p.tap("#stUndo"); await p.waitForTimeout(700); ok(await hist(p) === 0, `${name}: Undo on the cube takes it back`);
    /* the steering wheel: a finger on a middle square, circling it */
    let wheels = 0;
    for (const [dir, face] of [[[0, 0, 1], "F"], [[0, 1, 0], "U"], [[1, 0, 0], "R"]]) for (const sg of [1, -1]) {
      await p.evaluate(() => scrollTo(0, 0));
      const g = await centreOf(p, dir), mv = face + (sg < 0 ? "'" : ""), want = await afterMove(p, mv);
      await p.tp("touchStart", [[g.x, g.y]]); for (let k = 1; k <= 4; k++) { await p.tp("touchMove", [[g.x + g.w * .35 * k / 4, g.y]]); await p.waitForTimeout(14); }
      for (let k = 1; k <= 20; k++) { const a = sg * k * (Math.PI * .6 / 20); await p.tp("touchMove", [[g.x + g.w * Math.cos(a), g.y + g.w * Math.sin(a)]]); await p.waitForTimeout(14); }
      await p.tp("touchEnd", []); await p.waitForTimeout(600);
      if (await screenCube(p) === want) wheels++; else console.log("   wheel miss: " + mv);
    }
    ok(wheels === 6, `${name}: circling the front, top and right middles turns that side, each way (${wheels}/6)`);
    /* two fingers: swipe left = the whole cube to the left (y); swipe up = tip it away (x) */
    for (const [dx, dy, mv] of [[-1, 0, "y"], [0, -1, "x"]]) {
      await p.evaluate(() => scrollTo(0, 0));
      const g = await centreOf(p, [0, 0, 1]), want = await afterMove(p, mv), d = g.w * .7;
      const A = [g.x - d * .5, g.y + d * .2], B = [g.x + d * .5, g.y - d * .2];
      await p.tp("touchStart", [A]); await p.tp("touchStart", [A, B]);
      for (let k = 1; k <= 14; k++) { const o = k * 11; await p.tp("touchMove", [[A[0] + dx * o, A[1] + dy * o], [B[0] + dx * o, B[1] + dy * o]]); await p.waitForTimeout(16); }
      await p.tp("touchEnd", []); await p.waitForTimeout(600);
      ok(await screenCube(p) === want, `${name}: two fingers swiped ${dx ? "left" : "up"} turn the whole cube (${mv})`);
    }
    /* My cube: the camera button and the colors sit right under the cube (Jimmy, iPhone: "too much scrolling") */
    await p.evaluate(() => { location.hash = "mine"; scrollTo(0, 0); }); await p.waitForTimeout(400);
    const gap = await p.evaluate(() => { const s = document.getElementById("stage").getBoundingClientRect(), c = document.querySelector('#panel [data-act="camera"]').getBoundingClientRect(), pal = document.getElementById("paintBar").getBoundingClientRect(); return { cam: c.top - s.bottom, pal: pal.top - s.bottom }; });
    /* painting: a drag turns the cube the way the finger goes and paints nothing; Side shows a side straight on */
    { const fc = () => p.evaluate(() => { const C = AOGCube, c = AOGCubeLab.cube, i = c.P.findIndex(q => q.kind === 1 && C.eqV(c.pos(q), [0, 0, 1])); const r = document.querySelector(`.face[data-i="${i}"] i`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      const n0 = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("aog.cube.v1")).paint || {}).length), a = await fc();
      await p.tp("touchStart", [[a.x, a.y]]); for (let k = 1; k <= 10; k++) { await p.tp("touchMove", [[a.x + k * 7, a.y]]); await p.waitForTimeout(16); } await p.tp("touchEnd", []); await p.waitForTimeout(300);
      const b1 = await fc(), n1 = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("aog.cube.v1")).paint || {}).length);
      ok(b1.x - a.x > 15 && n1 === n0, `${name}: painting, a drag turns the cube the way the finger goes, and paints nothing`);
      const faceOn = await p.evaluate(async () => { const out = []; for (const f of ["R", "B", "L", "U", "D", "F"]) { const sel = document.getElementById("sideSel"); sel.value = f; sel.dispatchEvent(new Event("change")); await new Promise(o => setTimeout(o, 450));
        const C = AOGCube, c = AOGCubeLab.cube, M = document.getElementById("cubeView").style.transform.match(/-?[\d.e-]+/g).slice(1).map(Number);
        const n = C.FACES[f], v = [n[0], -n[1], n[2]], z = M[2] * v[0] + M[6] * v[1] + M[10] * v[2]; out.push(z > .85); } return out.every(Boolean); });
      ok(faceOn, `${name}: painting, Side shows each of the six sides nearly straight on`); }
    ok(gap.pal < 40 && gap.cam < 520, `${name}: in My cube the camera button and the colors are right under the cube (${Math.round(gap.cam)}px, ${Math.round(gap.pal)}px)`);
    ok(!p.errs.length, `${name}: no page errors (hands) ${p.errs.join("; ")}`);
    await p.ctx.close();
  }

  /* ── the short way first (Jimmy: "Can the shortest way always be deployed first?") and, on a phone, the move and its
     button in a bar at the bottom, the cube in view above ── */
  { const p = await open({ width: 390, height: 844 }, true, "solve", "instant", "fresh");
    await p.evaluate(() => { const S = JSON.parse(localStorage.getItem("aog.cube.v1")); delete S.method; delete S.wayV; localStorage.setItem("aog.cube.v1", JSON.stringify(S)); }); await p.reload(); await p.waitForTimeout(600);
    await p.evaluate(() => { scrollTo(0, 0); document.querySelector('#panel [data-act="mix"]').click(); });
    let found = false; try { await p.waitForSelector("#actBar:not([hidden]) [data-act='gnext']", { timeout: 30000 }); found = true; } catch (e) {}
    const way = await p.$eval("#waySel", s => s.value).catch(() => "");
    ok(found && way === "short", "Solve with me starts on the short way: a mixed cube gets its short way at once (" + way + ")");
    await p.evaluate(() => scrollTo(0, 0));
    const lay = await p.evaluate(() => { const st = document.getElementById("stage").getBoundingClientRect(), bar = document.getElementById("actBar").getBoundingClientRect(), btn = document.querySelector("#actBar [data-act='gnext']").getBoundingClientRect();
      return { cube: st.top >= 0 && st.bottom <= bar.top + 2, btn: btn.bottom <= innerHeight && btn.top >= 0, text: document.querySelector("#actBar .ab-move").textContent }; });
    ok(lay.cube && lay.btn && lay.text.length > 3, `iPhone: the whole cube and the I did it / Turn it button are on screen together, no scrolling ("${lay.text}")`);
    let n = 0; while (n < 40 && await p.$("#actBar:not([hidden]) [data-act='gnext']")) { await p.tap("#actBar [data-act='gnext']"); n++; await p.waitForTimeout(30); }
    ok(n > 0 && n <= 22 && /Solved!/.test(await p.textContent("#panel")) && await p.evaluate(() => document.getElementById("actBar").hidden), `iPhone: tapping the bar's button follows the short way to Solved (${n} moves), and the bar steps away`);
    ok(!p.errs.length, "no page errors (short way first) " + p.errs.join("; "));
    await p.ctx.close(); }

  /* ── a computer ── */
  let p = await open({ width: 1280, height: 900 }, false, "learn");
  await p.click('#pad [data-mv="R"]'); await p.waitForTimeout(700);
  let s = await st(p); ok(s.hist.join() === "R", "the pad's R turns and lands: " + s.hist);
  await p.click('#pad [data-act="undo"]'); await p.waitForTimeout(700); ok(await hist(p) === 0, "the pad's Undo");
  const fr = await p.evaluate(() => { scrollTo(0, 0); const C = AOGCube, i = new C.Cube().P.findIndex(q => C.eqV(q.home, [0, 1, 1])); const r = document.querySelector(`.face[data-i="${i}"][data-f="F"]`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await p.mouse.move(fr.x, fr.y); await p.mouse.down(); for (let k = 1; k <= 10; k++) { await p.mouse.move(fr.x + k * 14, fr.y + k * 2); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(500);
  ok((await st(p)).hist.join() === "U'", "a mouse drag along the front's top row to the right is U'");
  /* screen reader: the six sides, nine colors each */
  const desc = await p.textContent("#cubeDesc");
  ok(["Front", "Right", "Back", "Left", "Top", "Bottom"].every(w => desc.includes(w + ":")) && (desc.match(/,/g) || []).length >= 6 * 8, "a screen reader hears all six sides, square by square");
  /* symbols */
  await p.click('#viewRow [data-look="symbols"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.getElementById("stage").classList.contains("symbols") && getComputedStyle(document.querySelector(".face i"), "::before").content.length > 2), "Symbols: on puts a shape on every sticker");
  await p.click('#viewRow [data-look="symbols"]');
  /* the move card */
  await p.evaluate(() => { window.print = () => { window.__printed = document.getElementById("printCard").textContent; }; });
  await p.click('#panel [data-act="print"]');
  ok(/R U R' U'/.test(await p.evaluate(() => window.__printed || "")), "Print a move card fills the card with the moves for each step");
  /* every Learn step can be practised to its end */
  await p.selectOption("#speedSel", "instant");
  for (const li of [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13]) {
    await p.evaluate(i => document.querySelector(`#lessonRow [data-lesson="${i}"]`).click(), li); await p.waitForTimeout(150);
    await p.click('#panel [data-act="setup"]'); await p.click('#panel [data-act="hint"]');
    let k = 0; while (k < 300 && await p.$('#panel [data-act="gnext"]')) { await p.click('#panel [data-act="gnext"]'); k++; }
    ok(/This step is finished/.test(await p.textContent("#panel")) && (await st(p)).done[li], `Learn step ${li + 1}: practice reaches the end (${k} moves)`);
  }
  /* Solve with me: the named moves show during the corner moves */
  /* Read aloud already on: opening the page says nothing; a tap, then each next move is said */
  await p.goto(URL + "#solve"); await p.waitForTimeout(300);
  await p.evaluate(() => { const S = JSON.parse(localStorage.getItem("aog.cube.v1")); S.voice = true; localStorage.setItem("aog.cube.v1", JSON.stringify(S)); });
  await p.addInitScript(() => { window.__said = []; if (window.speechSynthesis) speechSynthesis.speak = u => window.__said.push(u.text); });
  await p.reload(); await p.waitForTimeout(600);
  const hasVoice = await p.$('#viewRow [data-look="voice"]');
  ok(await p.evaluate(() => window.__said.length) === 0, "Read aloud says nothing when the page opens");
  await p.click('#panel [data-act="mix"]'); await p.waitForTimeout(150);
  let sawChunk = false, sawWhole = false, sawSide = false, n = 0;
  while (n < 400) { if (!(await p.$('#panel [data-act="gnext"]'))) break; if (/corner moves/.test(await p.textContent("#panel")) && await p.$("#panel .cdots")) sawChunk = true;
    const kind = await p.evaluate(() => { const k = document.querySelector("#panel .kind"); return k ? [k.className, document.querySelectorAll("#arrow path.line").length, document.querySelector("#panel .move-big .tok").textContent] : null; });
    if (kind && /whole/.test(kind[0]) && kind[1] === 3 && /^[xyz]/.test(kind[2])) sawWhole = true;
    if (kind && /side/.test(kind[0]) && kind[1] === 1 && /^[UDLRFB]/.test(kind[2])) sawSide = true; await p.click('#panel [data-act="gnext"]'); n++; }
  ok(sawChunk, "the corner moves are named as one thing to learn, with still dots");
  ok(sawWhole && sawSide, "a whole-cube turn says Whole cube with an arrow on every row; a side turn says One side with one arrow");
  if (hasVoice) { const said = await p.evaluate(() => window.__said); ok(said.length > 5, "Read aloud says each next move after a tap (" + said.length + ": " + said.slice(0, 2).join(" / ") + ")"); }
  const fin = await p.textContent("#panel");
  ok(/Solved!/.test(fin) && /You did it, in \d+ moves/.test(fin), `Solve with me reaches Solved (${n} taps)`);
  /* practise the step that needed most help, then again */
  const drill = await p.$('#panel [data-act="drill"]');
  ok(!!drill, "the finish offers to practise one step");
  if (drill) { await drill.click(); await p.waitForTimeout(200);
    const k0 = await p.textContent("#panel .kicker"); let k = 0;
    while (k < 300 && await p.$('#panel [data-act="gnext"]')) { await p.click('#panel [data-act="gnext"]'); k++; }
    ok(/Practice ·/.test(k0) && /is finished/.test(await p.textContent("#panel")) && !!(await p.$('#panel [data-act="drill"]')), `practising one step ends on that step, with Again (${k} moves)`); }
  /* the three kinds of help */
  await p.click('#panel [data-act="undrill"]'); await p.waitForTimeout(200);
  /* the faster way in Solve with me: chosen under the card, it leads a mixed cube to Solved, in its four steps */
  { await p.click('#panel [data-act="mix"]'); await p.waitForTimeout(150); await p.selectOption("#waySel", "faster"); await p.waitForTimeout(150);
    const k0 = await p.textContent("#panel .kicker"); let fn = 0, kinds = new Set();
    while (fn < 200 && await p.$('#panel [data-act="gnext"]')) { kinds.add((await p.textContent("#panel .kicker")).split("·")[1]); await p.click('#panel [data-act="gnext"]'); fn++; }
    ok(/of 4/.test(k0) && /Solved!/.test(await p.textContent("#panel")) && fn < 110, `the faster way leads a mixed cube to Solved in ${fn} moves, through its steps (${[...kinds].map(x => (x || "").trim()).join(", ")})`);
    await p.click('#panel [data-act="mix"]'); await p.waitForTimeout(150); await p.selectOption("#waySel", "steps"); }
  await p.selectOption("#levelSel", "own"); await p.waitForTimeout(150);
  const own = await p.evaluate(() => ({ tok: !!document.querySelector("#panel .move-big .tok"), arrow: document.getElementById("arrow").innerHTML.length, aim: !!document.querySelector("#panel .aim") }));
  ok(!own.tok && !own.arrow && !own.aim, "On my own: no move, no arrow, no goal until asked");
  await p.click('#panel [data-act="reveal"]');
  const h1 = await p.evaluate(() => ({ tok: !!document.querySelector("#panel .move-big .tok"), aim: !!document.querySelector("#panel .aim") }));
  ok(h1.aim && !h1.tok, "Give me a hint shows the goal, not yet the move");
  await p.click('#panel [data-act="reveal"]');
  ok(await p.evaluate(() => !!document.querySelector("#panel .move-big .tok") && document.getElementById("arrow").innerHTML.length > 0), "Show me the move shows the move and its arrow");
  const hb = await hist(p); await p.click('#panel [data-act="gnext"]'); await p.waitForTimeout(150); ok(await hist(p) === hb + 1, "and Turn it turns it");
  await p.selectOption("#levelSel", "every");
  /* Show me the short way: found off the page, then followed with Turn it to Solved, in about 20 moves */
  await p.click('#panel [data-act="mix"]'); await p.waitForTimeout(150);
  await p.click('#panel [data-act="short"]');
  let shortOk = false; try { await p.waitForSelector("#panel .kicker:has-text('The short way')", { timeout: 30000 }); shortOk = true; } catch (e) {}
  let sn = 0; if (shortOk) while (sn < 40 && await p.$('#panel [data-act="gnext"]')) { await p.click('#panel [data-act="gnext"]'); sn++; }
  ok(shortOk && sn > 0 && sn <= 22 && /Solved!/.test(await p.textContent("#panel")), `Show me the short way solves a mixed cube in ${sn} moves (no more than 22)`);
  ok(!p.errs.length, "no page errors (computer) " + p.errs.join("; "));
  await p.ctx.close();

  /* ── my cube: the camera's color reader, painting, the doctor, the real-cube check ── */
  p = await open({ width: 1280, height: 900 }, false, "mine", "instant");
  const COL = { W: "#f4f3ee", Y: "#ffd43b", G: "#23a159", B: "#2a62c9", O: "#ff7e1f", R: "#d2303b" };
  const sampleCube = (seed, tint, bright, noise, cols) => p.evaluate(([seed, tint, bright, noise, COL]) => {
    let x = seed; const rnd = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
    const C = AOGCube, c = new C.Cube().run(C.scramble(25, rnd)), out = {}, truth = {};
    ["F", "R", "B", "L", "U", "D"].forEach(f => { out[f] = C.facelets(f).map(([pos, dir]) => { const col = c.colorAt(pos, dir); truth[pos.join(",") + "|" + f] = col;
      const h = COL[col], rgb = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
      return rgb.map((v, i) => Math.max(0, Math.min(255, v * tint[i] * bright + (rnd() - .5) * 2 * noise))); }); });
    return { out, truth };
  }, [seed, tint, bright, noise, cols || COL]);
  let right = 0; const LIGHTS = [[[1, 1, 1], 1, 8], [[1, .93, .78], .85, 12], [[.9, .95, 1.05], .7, 12], [[1, .97, .9], 1.05, 16], [[1, .9, .75], .6, 10]];
  for (let k = 0; k < 20; k++) { const [tint, br, nz] = LIGHTS[k % LIGHTS.length]; const { out, truth } = await sampleCube(1000 + k * 77, tint, br, nz);
    const got = await p.evaluate(o => AOGCubeLab.readColors(o), out); if (Object.keys(truth).every(q => got[q] === truth[q])) right++; }
  ok(right === 20, `the camera's color reader reads ${right}/20 cubes right, in daylight, lamp light, shade and noise`);
  { const { out, truth } = await sampleCube(777, [1, .95, .85], .9, 10, Object.assign({}, COL, { O: "#7d3cc0" }));   /* a cube with purple where orange usually is */
    const got = await p.evaluate(o => AOGCubeLab.readColors(o), out);
    ok(Object.keys(truth).every(q => got[q] === (truth[q] === "O" ? "P" : truth[q])), "a cube with purple instead of orange is read as purple"); }
  /* a neon cube (Jimmy's: pink where red is, lime yellow, light blue), colors measured from his own photos */
  { const NEON = { W: "#e5eae4", Y: "#daf265", G: "#8ad86f", B: "#68b2cc", O: "#fe825d", R: "#e1576a" };
    let ok2 = 0; for (let k = 0; k < 6; k++) { const { out, truth } = await sampleCube(3100 + k * 31, [1, .97, .92], .95, 10, NEON);
      const got = await p.evaluate(o => AOGCubeLab.readColors(o), out); if (Object.keys(truth).every(q => got[q] === (truth[q] === "R" ? "K" : truth[q]))) ok2++; }
    ok(ok2 === 6, `a neon cube is read with its own colors, pink as pink (${ok2}/6)`); }
  /* the cube turned the other way, the top and bottom shown the other way round, sides held crooked: still read right */
  { const { out, truth } = await sampleCube(5150, [1, 1, 1], 1, 6);
    const rot = (g, k) => { let a = g.slice(); for (let r = 0; r < k; r++) { const b = []; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) b[y * 3 + x] = a[x * 3 + (2 - y)]; a = b; } return a; };
    const held = { F: out.F, R: rot(out.L, 1), B: rot(out.B, 2), L: out.R, U: rot(out.D, 3), D: rot(out.U, 2) };
    const got = await p.evaluate(o => AOGCubeLab.readColors(o), held);
    ok(Object.keys(truth).every(q => got[q] === truth[q]), "turned the other way, top and bottom swapped, sides held crooked: the camera still reads the cube right"); }
  /* the camera finds the cube anywhere in the picture, smaller than the square, beside a face-like blob; no cube, no guess */
  { const r = await p.evaluate(() => {
      const draw = (withCube, x0, y0, S) => { const cv = document.createElement("canvas"); cv.width = 1280; cv.height = 960; const g = cv.getContext("2d");
        g.fillStyle = "#c9c3b8"; g.fillRect(0, 0, 1280, 960); g.fillStyle = "#5a3d2b"; g.fillRect(0, 300, 200, 660); g.fillStyle = "#d8a48c"; g.beginPath(); g.ellipse(560, 420, 230, 300, 0, 0, 7); g.fill();
        g.fillStyle = "#2b211c"; g.beginPath(); g.ellipse(560, 560, 200, 160, 0, 0, 7); g.fill(); g.fillStyle = "#f2f2f2"; g.fillRect(250, 760, 640, 200);
        const cols = ["#fe825d", "#e1576a", "#daf265", "#daf265", "#e1576a", "#68b2cc", "#e5eae4", "#e1576a", "#8ad86f"];
        if (withCube) { g.fillStyle = "#3a3a3a"; g.fillRect(x0, y0, S, S); const c = S / 3; cols.forEach((col, i) => { g.fillStyle = col; const x = x0 + (i % 3) * c + c * .05, y = y0 + Math.floor(i / 3) * c + c * .05; g.beginPath(); g.roundRect(x, y, c * .9, c * .9, c * .15); g.fill(); }); }
        const d = g.getImageData(0, 0, 1280, 960); for (let i = 0; i < d.data.length; i += 4) { const n = (Math.random() - .5) * 18; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } return d; };
      const want = ["#fe825d", "#e1576a", "#daf265", "#daf265", "#e1576a", "#68b2cc", "#e5eae4", "#e1576a", "#8ad86f"].map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
      let found = 0; for (const [x, y, S] of [[330, 265, 340], [700, 120, 260], [120, 520, 300]]) { const got = AOGCubeLab.sampleFace(draw(true, x, y, S)); if (got && got.every((c, i) => Math.hypot(...c.map((v, k) => v - want[i][k])) < 30)) found++; }
      return { found, none: AOGCubeLab.sampleFace(draw(false)) === null }; });
    ok(r.found === 3, `the camera finds the cube wherever it is held, smaller than the square (${r.found}/3)`);
    ok(r.none, "with no cube in the picture the camera says so, and does not guess"); }
  /* six sides through the camera's own steps, then Check my cube */
  const one = await sampleCube(4242, [1, .95, .85], .9, 10);
  /* each side: the camera's reading shows, the learner checks it (and fixes a wrong square), then goes on */
  let fixedSq = 0;
  for (const f of ["F", "R", "B", "L", "U", "D"]) {
    await p.evaluate(rgb => AOGCubeLab.camSide(rgb), one.out[f]); await p.waitForTimeout(80);
    const want = await p.evaluate(f => AOGCube.facelets(f).map(([pos]) => pos.join(",") + "|" + f), f);
    const shown = await p.$$eval(".cam [data-ck]", bs => bs.map(b => b.getAttribute("aria-label").split(": ")[1]));
    const names = { W: "white", Y: "yellow", G: "green", B: "blue", O: "orange", R: "red" };
    for (let j = 0; j < 9; j++) { const truth = names[one.truth[want[j]]]; if (shown[j] !== truth) { fixedSq++; const L = Object.keys(names).find(k => names[k] === truth); await p.click(`.cam [data-rb="${L}"]`); await p.click(`.cam [data-ck="${j}"]`); } }
    await p.evaluate(() => AOGCubeLab.camConfirm()); await p.waitForTimeout(80);
  }
  ok(fixedSq <= 6, `the camera's per-side reading needed ${fixedSq} square(s) fixed by hand over six sides (lamp light), each fixed right on that side`);
  /* Jimmy: "once I took the shot, I couldn't figure out what to do next" — the sheet stays open on a check screen */
  ok(await p.$$eval(".cam .rgrid", g => g.length) === 6 && /Every color has 9/.test(await p.textContent(".cam")) && !!(await p.$('.cam [data-cam="go"]')),
    "after six sides, a check screen shows all six sides, says the counts are right, and has one button to go on");
  /* one square misread: the counts say so, the big button waits, two taps fix it */
  const k0 = "1,1,1|F", true0 = one.truth[k0], wrong = true0 === "W" ? "Y" : "W";
  await p.click(`.cam [data-rb="${wrong}"]`); await p.click(`.cam [data-rk="${k0}"]`);
  await p.click('.cam [data-cam="go"]'); await p.waitForTimeout(150);
  ok(!!(await p.$(".cam")) && /Fix the colors first/.test(await p.textContent(".cam #revState")), "a misread square: the counts say what is off, and the sheet stays to fix it");
  await p.click(`.cam [data-rb="${true0}"]`); await p.click(`.cam [data-rk="${k0}"]`);
  ok(/Every color has 9/.test(await p.textContent(".cam")), "tap the right color, tap the square: fixed");
  await p.click('.cam [data-cam="go"]'); await p.waitForTimeout(400);
  s = await st(p); ok(!(await p.$(".cam")) && /#solve/.test(p.url()) && s.real, "It looks right goes straight to Solve with me with the camera-read cube");
  /* following along with a real cube: how to hold it, and how the front and top look after the move */
  { const before = await p.evaluate(() => ({ hold: (document.querySelector("#panel .hold") || {}).textContent || "",
      pics: [...document.querySelectorAll("#panel .after .rgrid.mini")].map(g => [...g.children].map(x => x.style.background)) }));
    await p.click('#panel [data-act="gnext"]'); await p.waitForTimeout(150);
    const now = await p.evaluate(() => { const C = AOGCube, c = AOGCubeLab.cube, sc = JSON.parse(localStorage.getItem("aog.cube.v1")).scheme, home = { Y: "U", W: "D", G: "F", B: "B", O: "R", R: "L" };
      const H = { W: "#f4f3ee", Y: "#ffd43b", G: "#23a159", B: "#2a62c9", O: "#ff7e1f", R: "#d2303b", P: "#7d3cc0", K: "#ff7eb6" };
      const rgb = h => "rgb(" + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(", ") + ")";
      return ["F", "U"].map(f => C.facelets(f).map(([pos, dir]) => { const col = c.colorAt(pos, dir); return rgb(H[sc[home[col]] || col]); })); });
    ok(/Hold your cube:.*on top.*facing you/.test(before.hold), "with a real cube, the card says how to hold it: " + before.hold.trim());
    ok(before.pics.length === 2 && JSON.stringify(before.pics) === JSON.stringify(now), "the after-move pictures show exactly how the front and top look once the move is done"); }
  /* with a real cube: after each step, does yours look like the screen? */
  let seen = false; n = 0;
  while (n < 300 && !seen && await p.$('#panel [data-act="gnext"]')) { await p.click('#panel [data-act="gnext"]'); n++; seen = !!(await p.$("#panel .checkin")); }
  ok(seen, "with a real cube, a finished step asks: does yours look like the screen?");
  if (seen) { await p.click('#panel [data-act="checkYes"]'); ok(!(await p.$("#panel .checkin")), "Yes, it matches puts the question away"); }
  /* Check with the camera: a side held up is compared with the screen; a square that differs is marked */
  { const r = await p.evaluate(() => { const C = AOGCube, c = AOGCubeLab.cube, H = { W: "#f4f3ee", Y: "#ffd43b", G: "#23a159", B: "#2a62c9", O: "#ff7e1f", R: "#d2303b", P: "#7d3cc0", K: "#ff7eb6" };
      const sc = JSON.parse(localStorage.getItem("aog.cube.v1")).scheme, home = { Y: "U", W: "D", G: "F", B: "B", O: "R", R: "L" };
      const shown = col => sc[home[col]] || col, rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) * .92);
      const side = C.facelets("R").map(([pos, dir]) => rgb(H[shown(c.colorAt(pos, dir))]));
      const same = AOGCubeLab.verifyRead(side.slice()); const off = side.slice(); off[0] = off[4].map(v => v); off[0] = rgb(H[shown(c.colorAt(...C.facelets("L")[4]))]);
      const turned = [6, 3, 0, 7, 4, 1, 8, 5, 2].map(i => side[i]); const tr = AOGCubeLab.verifyRead(turned);
      const diff = AOGCubeLab.verifyRead(off); document.querySelector(".cam [data-cam='close']").click();
      return { same: same.f === "R" && same.diff.length === 0, turned: tr.f === "R" && tr.diff.length === 0, diff: diff.f === "R" && diff.diff.length >= 1 }; });
    ok(r.same && r.turned, "Check with the camera: a side that matches says so, even held turned");
    ok(r.diff, "Check with the camera: a square that differs is found and marked"); }
  /* the camera sheet itself (a fake camera here) */
  await p.evaluate(() => { location.hash = "mine"; }); await p.waitForTimeout(300);
  await p.click('#panel [data-act="camera"]'); await p.waitForTimeout(1500);
  const camOk = await p.evaluate(() => { const v = document.querySelector(".cam video"); return !!v && v.videoWidth > 0; });
  ok(camOk && /picture stays on this device/.test(await p.textContent(".cam")), "Use the camera opens a sheet with the camera, and says the picture stays on the device");
  await p.click('.cam [data-cam="take"]'); await p.waitForTimeout(2500);
  ok(/can't see the cube/.test(await p.textContent(".cam")) && /Side 1 of 6/.test(await p.textContent(".cam")), "with no cube in view (a test camera), This side says it can't see the cube yet, and stays on side 1");
  await p.click('.cam [data-cam="close"]'); await p.waitForTimeout(150);
  ok(!(await p.$(".cam")) && await p.evaluate(() => !AOGCubeLab.cam), "Close puts the camera away and turns it off");
  /* painting by hand still works, and a wrong cube is caught */
  await p.click('#panel [data-act="copyMine"]'); await p.click('#paintBar [data-brush="R"]');
  const sq = await p.evaluate(() => { scrollTo(0, 0); const C = AOGCube, i = new C.Cube().P.findIndex(q => C.eqV(q.home, [1, 1, 1])); const r = document.querySelector(`.face[data-i="${i}"][data-f="F"]`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await p.mouse.click(sq.x, sq.y); await p.waitForTimeout(150);
  ok((await st(p)).paint["1,1,1|F"] === "R", "a tap paints a square");
  await p.click('#panel [data-act="checkMine"]'); ok(/Each color needs 9|can't|moved/.test(await p.textContent("#panel")), "a wrongly painted cube is caught");
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(200);
  ok(/Mi cubo/.test(await p.textContent("#panel")) && /Usar la cámara/.test(await p.textContent("#panel")), "Spanish");
  ok(!p.errs.length, "no page errors (my cube) " + p.errs.join("; "));
  await p.ctx.close();

  /* a browser that says no to the camera: the sheet says how to turn it on, in plain steps */
  { const b2 = await pw.chromium.launch(); const ctx = await b2.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    await ctx.addInitScript(() => { if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("blocked", "NotAllowedError")); });   /* as a phone does when the site may not use the camera */
    const q = await ctx.newPage(); await q.goto(URL + "#mine"); await q.waitForTimeout(700);
    await q.click('#panel [data-act="camera"]'); await q.waitForTimeout(1500);
    ok(/turned off for this site/.test(await q.textContent(".cam")) && /Website Settings/.test(await q.textContent(".cam")), "camera blocked: the sheet says how to turn it on");
    await b2.close(); }
  /* the site's headers let its own pages use the camera (camera=() blocked it on phones) */
  { const hd = fs.readFileSync(path.join(ROOT, "_headers"), "utf8"); ok(/Permissions-Policy:[^\n]*camera=\(self\)/.test(hd), "_headers lets the site's own pages ask for the camera"); }
  await b.close(); server.close();
  console.log(fails ? `\n${fails} cube check(s) failed.` : "\nThe Cube Lab passes every check.");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
