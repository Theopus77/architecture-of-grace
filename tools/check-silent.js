#!/usr/bin/env node
/* The silent check (AOG-SILENT-V1, 2026-10-12).
   Jimmy: "this has to be silent when not being used … lighting fast connectivity" and "make sure these follow the
   silent treatment". Every page this opens must, before anyone touches it:
     · ask for no animation frames once it has settled (nothing moves, nothing redraws on its own);
     · make no sound (no AudioContext started, no media playing);
   and a page that is NOT itself a 3D room must also:
     · start no WebGL and download no 3D code or star catalogue (three.js, aog-*3d.js, aog-figure3d.js, data/sky …).
   The 3D rooms (the Dojo, the Kitchen, the Sewing Room) may build their scene as they open, but then must be still.
   Usage: node tools/check-silent.js            # every page in PAGES
          node tools/check-silent.js dojo.html  # only these */
const path = require("path"), fs = require("fs"), http = require("http"), cp = require("child_process");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(cp.execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".bin": "application/octet-stream" };
const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split("?")[0].split("#")[0]); if (u.endsWith("/")) u += "index.html";
  let f = path.join(ROOT, u); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
// [page (with #room), is it a 3D room?]
const PAGES = [
  ["skate-lab.html", false], ["skate-lab.html#tricks", false], ["skate-lab.html#ramp", false], ["skate-lab.html#questions", false], ["skate-lab.html#free", false], ["skate-lab.html#ollie", false], ["skate-lab.html#grind", false],
  ["science-microscope.html", false], ["telescope.html", false], ["telescope.html#lab", false], ["telescope.html#lab", false],
  ["fcs-shop.html", false], ["fc2-knife-skills.html", false], ["fc4-hand-sewing.html", false], ["fcs-u10.html", false], ["facs-course.html", false],
  ["mar-u1.html", false], ["mar-u15.html", false], ["martial-arts-hub.html", false], ["martial-arts-course.html", false],
  ["dojo.html", true], ["dojo.html#front-kick", true], ["kitchen.html", true], ["kitchen.html#pancakes", true], ["sewing.html", true], ["sewing.html#backstitch", true]
];
const HEAVY = /three\.module|\/vendor\/three|aog-[a-z-]*3d\.js|aog-figure3d|aog-3dkit|\/data\/sky\/|\/vendor\/onnxruntime|\/models\/stems\/|aog-stems-ai\.js/;   // AOG-STEMS-AI-V1: the separation model too
let fails = 0, warns = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const wait = ms => new Promise(o => setTimeout(o, ms));
(async () => {
  await new Promise(o => server.listen(0, o));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const only = process.argv.slice(2);
  const list = only.length ? PAGES.filter(p => only.some(o => p[0].split("#")[0] === o.split("#")[0] || p[0] === o)).concat(only.filter(o => !PAGES.some(p => p[0] === o || p[0].split("#")[0] === o)).map(o => [o, /^(dojo|kitchen|sewing)\.html/.test(o)])) : PAGES;
  const b = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"] });
  for (const [page, is3D] of list) {
    if (!fs.existsSync(path.join(ROOT, page.split("#")[0]))) { console.log("· " + page + ": not built yet"); warns++; continue; }
    for (const [name, vp] of [["iPhone", { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }], ["computer", { width: 1280, height: 900 }]]) {
      const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1 });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
      await ctx.addInitScript(() => {
        const S = window.__silent = { raf: 0, gl: 0, audio: 0, media: 0 };
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = f => { S.raf++; return raf(f); };
        const gc = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (k, o) { if (/webgl/.test(String(k))) S.gl++; return gc.call(this, k, o); };
        ["AudioContext", "webkitAudioContext"].forEach(k => { const A = window[k]; if (!A) return; window[k] = function (...a) { S.audio++; return new A(...a); }; window[k].prototype = A.prototype; });
        const play = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { S.media++; return play.call(this); };
      });
      const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
      await p.goto(base + page, { waitUntil: "load" });
      // let it settle: a 3D room builds its scene; any page finishes its first paint
      await wait(is3D ? 6000 : 2500);
      const before = await p.evaluate(() => Object.assign({}, window.__silent));
      await wait(3000);   // three seconds with nobody touching anything
      const after = await p.evaluate(() => Object.assign({}, window.__silent));
      const files = await p.evaluate(() => performance.getEntriesByType("resource").map(e => e.name));
      const heavy = files.filter(u => HEAVY.test(u)).map(u => u.replace(base, "/"));
      const idleFrames = after.raf - before.raf;
      const label = `${page} (${name})`;
      ok(idleFrames === 0, `${label}: still while idle (${idleFrames} animation frames asked in 3 s)`);
      ok(after.audio === 0 && after.media === 0, `${label}: no sound`);
      if (!is3D) ok(after.gl === 0 && !heavy.length, `${label}: no 3D until tapped` + (after.gl || heavy.length ? ` (WebGL ${after.gl}, files: ${heavy.join(", ")})` : ""));
      if (errs.length) { console.log(`  ! ${label}: page error: ${errs[0]}`); }
      await ctx.close();
    }
  }
  await b.close(); server.close();
  console.log(fails ? `\n${fails} check(s) failed` : `\nSilent: every page passes${warns ? ` (${warns} not built yet)` : ""}`);
  process.exit(fails ? 1 : 0);
})();
