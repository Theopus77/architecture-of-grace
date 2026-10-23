#!/usr/bin/env node
/* AOG MICROSCOPE CHECK — Jimmy (2026-10-12): "Is there ability for a quantum leap forward in the Micro …" The Microscope
   Lab (science-microscope.html, /microscope) now builds nine slides in depth (aog-micro-3d.js, AOG-MICRO-DEPTH-V1) and
   works the optics out live, so a change could quietly make it teach something wrong. This opens it on a computer, an
   iPhone and an iPad and checks:
     · every original slide draws at every objective (4×, 10×, 40×, 100× with oil), with no errors,
     · real depth: focusing through a slide changes which layer is sharp (sharpness measured at two depths),
     · real optics: the finest detail is λ/(NA + NA of the condenser), λ/2NA with the iris open; bars finer than that
       vanish and bars a little coarser show; closing the condenser iris gives contrast and takes away resolution,
     · every kind of light draws (brightfield, phase contrast, darkfield, oblique, polarized, fluorescence); salt stays
       dark between crossed polarizers while sugar lights up,
     · life only after Play: pond water and elodea are still until Play is pressed, then move, then stop by themselves;
       with "reduce motion" on, each press shows one still moment,
     · silent until used: nothing redraws while idle, the depth engine loads only when a depth slide is opened, and
       leaving lets go of the graphics chip,
     · the lessons still count (a few lesson steps on depth slides), the Home Screen app links are there, and every view
       fits an iPhone and an iPad in English and Spanish with no sideways scroll,
     · a lesson's Try it link (?slide=onion, ?slide=elodea; AOG-MICRO-LINK-V1) opens the lab with that slide on the stage,
       in focus, with no errors, still while idle, and ticks no lesson step the learner did not do.
       node tools/check-microscope.js
   Exit code 1 when anything fails. Run it after any change to science-microscope.html or aog-micro-*.js (see CLAUDE.md). */
const path = require("path"), fs = require("fs"), http = require("http"), cp = require("child_process");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(cp.execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split("?")[0].split("#")[0]); if (u.endsWith("/")) u += "index.html";
  let f = path.join(ROOT, u); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
let fails = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-9, Math.abs(b));
const wait = ms => new Promise(o => setTimeout(o, ms));
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const IPAD = { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const DESK = { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 };

(async () => {
  await new Promise(o => server.listen(0, o)); const base = `http://127.0.0.1:${server.address().port}/`;
  const b = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });   // WebGL for the depth engine
  async function open(dev, hash, extra, query) {
    const ctx = await b.newContext(Object.assign({}, dev, extra || {}));
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    await ctx.addInitScript(() => {
      const S = window.__silent = { raf: 0, gl: 0 };
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = f => { S.raf++; return raf(f); };
      const gc = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (k, o) { if (/webgl/.test(String(k))) S.gl++; return gc.call(this, k, o); };
    });
    const p = await ctx.newPage(); p.errs = [];
    p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) p.errs.push(m.text()); });
    await p.goto(base + "science-microscope.html" + (query || "") + (hash ? "#" + hash : ""), { waitUntil: "load" }); await wait(900);
    return p;
  }
  const files = p => p.evaluate(() => performance.getEntriesByType("resource").map(e => e.name));
  /* set the bench, then wait until the eyepiece has drawn this slide and stopped drawing */
  async function setLab(p, lab, opts) {
    await p.evaluate(l => { Object.assign(S.lab, { lightOn: true, clipped: true, cracked: false, depth: true, illum: "bright", stain: "none", dia: 70, polar: 90, plate: false, panX: 0, panY: 0, stageX: 50, stageY: 50, oil: false, oil40: false, filter: "day", prism: false, graticule: false, measure: false, mA: null, mB: null }, l); paint(); }, lab);
    await p.waitForFunction(() => !depthWanted(S.lab) || DEPTH.state === "failed" || (DEPTH.state === "ready" && AOGMicro3D.info().spec === S.lab.spec), null, { timeout: 90000 }).catch(() => {});
    let last = -1;
    for (let k = 0; k < 60; k++) { const n = await p.evaluate(() => window.__eyeFrames || 0); if (n === last) break; last = n; await wait((opts && opts.step) || 350); }
  }
  /* statistics of the eyepiece (inside the field stop) or of the depth engine's own picture */
  const stat = (p, which) => p.evaluate(w => {
    let src = w === "gl" ? AOGMicro3D.canvas() : document.getElementById("eyecanvas");
    const t = document.createElement("canvas"); t.width = src.width; t.height = src.height; const g = t.getContext("2d"); g.drawImage(src, 0, 0);
    const W = t.width, H = t.height, d = g.getImageData(0, 0, W, H).data, r = Math.min(W, H) * (w === "gl" ? 0.5 : 0.4);
    let s = 0, s2 = 0, n = 0, sat = 0;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { if ((x - W / 2) ** 2 + (y - H / 2) ** 2 > r * r) continue; const i = (y * W + x) * 4, L = (d[i] + d[i + 1] + d[i + 2]) / 3; s += L; s2 += L * L; n++; const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); if (mx > 90 && mx - mn > 60) sat++; }
    const m = s / n; return { mean: m, sd: Math.sqrt(Math.max(0, s2 / n - m * m)), sat: sat / n };
  }, which);

  /* ── silent until used: the bench and the lab open with no depth engine, and nothing redraws while idle ── */
  let p = await open(DESK, "");
  await wait(2500);
  let s0 = await p.evaluate(() => Object.assign({}, window.__silent)); await wait(2500); let s1 = await p.evaluate(() => Object.assign({}, window.__silent));
  ok(s1.raf === s0.raf && s1.gl === 0 && !(await files(p)).some(u => /aog-micro-3d/.test(u)), "the front of the lab opens still, with no WebGL and no depth engine");
  await p.evaluate(() => go("lab")); await setLab(p, { spec: "e", obj: 4, coarse: 42, fine: 0 });
  s0 = await p.evaluate(() => Object.assign({}, window.__silent)); await wait(2500); s1 = await p.evaluate(() => Object.assign({}, window.__silent));
  ok(s1.raf === s0.raf && s1.gl === 0 && !(await files(p)).some(u => /aog-micro-3d/.test(u)), "the eyepiece on a flat slide draws once, then is still; no depth engine loaded");
  await setLab(p, { spec: "onion", obj: 40, coarse: 45, fine: 10 });
  const loaded = (await files(p)).some(u => /aog-micro-3d/.test(u));
  ok(loaded && await p.evaluate(() => AOGMicro3D.info().live && AOGMicro3D.info().backend.startsWith("webgl2")), "opening the onion loads the depth engine (WebGL2) on demand");
  s0 = await p.evaluate(() => [window.__silent.raf, AOGMicro3D.info().renders]); await wait(3000); s1 = await p.evaluate(() => [window.__silent.raf, AOGMicro3D.info().renders]);
  ok(s1[0] === s0[0] && s1[1] === s0[1], `a depth slide is still while idle (${s1[0] - s0[0]} frames, ${s1[1] - s0[1]} renders in 3 s)`);
  await setLab(p, { spec: "hair", obj: 10, coarse: 44, fine: 0 });
  ok(await p.evaluate(() => !AOGMicro3D.info().live), "moving to a flat slide lets go of the graphics chip");
  await setLab(p, { spec: "onion", obj: 40, coarse: 45, fine: 10 });
  await p.evaluate(() => go("home")); await wait(400);
  ok(await p.evaluate(() => !AOGMicro3D.info().live), "leaving the lab lets go of the graphics chip");
  await p.evaluate(() => go("lab"));

  /* ── real optics: the numbers ── */
  const ab = await p.evaluate(() => { const A = AOGMicro3D; const r = {};
    r.d40 = A.abbeUm({ obj: 40, dia: 100, filter: "day" }); r.d100 = A.abbeUm({ obj: 100, oil: true, dia: 100, filter: "day" });
    r.d10b = A.abbeUm({ obj: 10, dia: 100, filter: "blue" }); r.d4 = A.abbeUm({ obj: 4, dia: 100, filter: "day" });
    r.closed = A.abbeUm({ obj: 40, dia: 0, filter: "day" }); r.dry100 = A.abbeUm({ obj: 100, oil: false, dia: 100, filter: "day" });
    r.page = abbeUmL(Object.assign({}, S.lab, { obj: 40, dia: 100, filter: "day", prism: false }));
    r.dof40 = A.dofUm({ obj: 40, filter: "day" }); r.dof4 = A.dofUm({ obj: 4, filter: "day" }); return r; });
  ok(near(ab.d40, 0.55 / (2 * 0.65), 0.002) && near(ab.d100, 0.55 / (2 * 1.25), 0.002) && near(ab.d10b, 0.47 / (2 * 0.25), 0.002) && near(ab.d4, 0.55 / (2 * 0.10), 0.002),
     `Abbe with the iris open is λ/2NA (40×: ${ab.d40.toFixed(3)} µm, 100× oil: ${ab.d100.toFixed(3)} µm, 10× blue: ${ab.d10b.toFixed(3)} µm)`);
  ok(near(ab.closed, 0.55 / (0.65 * 1.08), 0.002) && ab.dry100 > ab.d100 && near(ab.page, ab.d40, 0.001),
     `closing the condenser iris coarsens it to λ/(NA + 0.08 NA) = ${ab.closed.toFixed(3)} µm; dry 100× is worse than oil; the page shows the same number`);
  ok(ab.dof40 < 2 && ab.dof4 > 40, `depth of field follows NA: 40× ${ab.dof40.toFixed(1)} µm, 4× ${ab.dof4.toFixed(0)} µm`);
  const chip = await p.evaluate(async () => { Object.assign(S.lab, { obj: 40, dia: 100, filter: "day", spec: "onion" }); paint(); await new Promise(o => setTimeout(o, 300)); return document.getElementById("resread").textContent; });
  ok(/0\.42 µm/.test(chip), `the eyepiece chip says the finest detail: "${chip}"`);

  /* ── real optics: bars finer than the limit vanish, coarser bars show (the engine's own stage micrometer) ── */
  const bars = await p.evaluate(() => {
    const A = AOGMicro3D, R = 400, c = document.createElement("canvas"); c.width = c.height = R; const g = c.getContext("2d");
    function mod(L, period) {
      A.render(g, R, R, L, { zoom: (L.obj / 4) * (R / 420), w: R, zf: 0, t: 0, illum: "bright", model: "__bars", barPeriod: period, fovScale: 8 });
      const d = g.getImageData(0, R / 2, R, 1).data; let mx = 0, mn = 255;
      for (let x = R * 0.3 | 0; x < R * 0.7; x++) { const v = d[x * 4 + 1]; mx = Math.max(mx, v); mn = Math.min(mn, v); }
      return (mx - mn) / (mx + mn + 1e-6);
    }
    const L = { obj: 100, oil: true, dia: 100, filter: "day", spec: "__bars", stain: "none", panX: 0, panY: 0, rheo: 72 }, d = A.abbeUm(L);
    const out = { d: d, fine: mod(L, d * 0.6), coarse: mod(L, d * 1.8) };
    const Lc = Object.assign({}, L, { dia: 0 }); out.closedCoarse = mod(Lc, d * 1.25); out.openCoarse = mod(L, d * 1.25);
    return out;
  });
  ok(bars.fine < 0.04 && bars.coarse > 0.12, `at 100× oil (d = ${bars.d.toFixed(3)} µm) bars at 0.6 d vanish (contrast ${bars.fine.toFixed(3)}) and bars at 1.8 d show (${bars.coarse.toFixed(3)})`);
  ok(bars.openCoarse > bars.closedCoarse * 2, `closing the iris loses bars at 1.25 d (open ${bars.openCoarse.toFixed(3)}, closed ${bars.closedCoarse.toFixed(3)})`);
  await setLab(p, { spec: "onion", obj: 40, coarse: 45, fine: 10, dia: 100 }); const open100 = await stat(p, "gl");
  await setLab(p, { spec: "onion", obj: 40, coarse: 45, fine: 10, dia: 12 }); const closed12 = await stat(p, "gl");
  ok(closed12.sd > open100.sd * 1.15, `closing the iris on clear onion cells gives contrast (picture spread ${open100.sd.toFixed(1)} → ${closed12.sd.toFixed(1)})`);

  /* ── real depth: focusing moves which layer is sharp ── */
  const two = await p.evaluate(() => {
    /* a test slide: fine bars at +8 µm on the left, the same bars at −8 µm on the right */
    const A = AOGMicro3D, m = { ph: 0.2, pig: 1, st: {}, bir: 0, fl: [1, 0, 0] };
    A._models.__two = { id: "__two", z: [-9, 9], K: () => 6, mats: { m }, colors: () => ({ G: [0.9, 0.9, 0.9], B: [0, 0, 0] }),
      layer(g, sl, v, ink) { [[8, -1], [-8, 1]].forEach(([z, side]) => { if (z < sl.z0 || z >= sl.z1) return; g.fillStyle = ink.rgb(m, 1);
        for (let x = 1; x < 60; x += 2) g.fillRect(side > 0 ? x : -x - 1, -60, 1, 120); }); } };
    const R = 400, c = document.createElement("canvas"); c.width = c.height = R; const g = c.getContext("2d");
    function sharp(zf) {
      A.render(g, R, R, { obj: 40, dia: 70, filter: "day", spec: "__two", stain: "none", panX: 0, panY: 0, rheo: 72 }, { zoom: 10 * (R / 420), w: R, zf, t: 0, illum: "bright", model: "__two", fovScale: 2 });
      const d = g.getImageData(0, R / 2 - 20, R, 40).data; let lft = 0, rgt = 0;
      for (let y = 0; y < 40; y++) for (let x = 1; x < R; x++) { const i = (y * R + x) * 4, e = Math.abs(d[i + 1] - d[i - 3]); if (x < R / 2 - 4) lft += e; else if (x > R / 2 + 4) rgt += e; }
      return [lft, rgt];
    }
    return { up: sharp(8), down: sharp(-8) };
  });
  /* the rendered picture is turned 180° by the objective, so the +8 µm bars land on the right of the screen */
  const upR = two.up[1] / two.up[0], downR = two.down[0] / two.down[1];
  ok(upR > 2 && downR > 2, `focus at +8 µm: the +8 µm bars are ${upR.toFixed(1)}× sharper than the −8 µm bars; focus at −8 µm: the other way, ${downR.toFixed(1)}×`);
  await setLab(p, { spec: "onion", obj: 40, coarse: 40, fine: 0 }); const topTxt = await p.evaluate(() => document.getElementById("depthread").textContent); const topImg = await p.evaluate(() => AOGMicro3D.canvas().toDataURL());
  await setLab(p, { spec: "onion", obj: 40, coarse: 45, fine: 10 }); const nucTxt = await p.evaluate(() => document.getElementById("depthread").textContent);
  const diff = await p.evaluate(async u => { const im = new Image(); im.src = u; await im.decode(); const c = AOGMicro3D.canvas(), W = c.width, t = document.createElement("canvas"); t.width = W * 2; t.height = W; const g = t.getContext("2d"); g.drawImage(im, 0, 0); g.drawImage(c, W, 0);
    const a = g.getImageData(0, 0, W, W).data, b2 = g.getImageData(W, 0, W, W).data; let s = 0; for (let i = 0; i < a.length; i += 16) s += Math.abs(a[i + 1] - b2[i + 1]); return s / (a.length / 16); }, topImg);
  ok(/top wall/.test(topTxt) && /nucleus/.test(nucTxt) && diff > 2, `onion at 40×: "${topTxt}" then "${nucTxt}"; the picture changes (mean difference ${diff.toFixed(1)})`);

  /* ── every kind of light draws ── */
  const modes = {};
  /* cheek cells are not birefringent (they go black between crossed polarizers), so polarized light is tried on onion walls */
  for (const il of ["bright", "phase", "dark", "slit", "polar", "fluor"]) { await setLab(p, { spec: il === "polar" ? "onion" : "cheek", obj: 40, coarse: 45, fine: 10, illum: il, polar: 30 }); modes[il] = await stat(p, "gl"); }
  ok(Object.values(modes).every(m => m.sd > 2), "all six lights draw (cheek cells; onion walls for polarized): " + Object.entries(modes).map(([k, m]) => `${k} ${m.mean.toFixed(0)}±${m.sd.toFixed(0)}`).join(", "));
  ok(modes.dark.mean < 45 && modes.fluor.mean < 45 && modes.polar.mean < 45 && modes.bright.mean > 150 && modes.phase.mean < modes.bright.mean - 15,
     "darkfield, fluorescence and crossed polarizers are dark round the cells; phase contrast is a grey field");
  await setLab(p, { spec: "crystal", obj: 10, coarse: 44, fine: -30, illum: "polar", polar: 30 });
  const cry = await p.evaluate(() => {
    const A = AOGMicro3D, c = A.canvas(), R = c.width, t = document.createElement("canvas"); t.width = t.height = R; const g = t.getContext("2d"); g.drawImage(c, 0, 0);
    const s = (10 / 4) / 420 / A.UMU * R, v = { k: 1, x0: -R / 2 / s, x1: R / 2 / s, y0: -R / 2 / s, y1: R / 2 / s, cache: {} }, it = A._models.crystal.items(v, S.lab, 0);
    function at(arr, i) { const x = R / 2 - s * arr[i * 8], y = R / 2 - s * arr[i * 8 + 1]; if (x < 20 || y < 20 || x > R - 20 || y > R - 20) return null; const d = g.getImageData(x - 1, y - 1, 3, 3).data; let L = 0; for (let k = 0; k < 36; k += 4) L += Math.max(d[k], d[k + 1], d[k + 2]); return L / 9; }
    const salt = [], sugar = []; for (let i = 0; i < it.salt.length / 8; i++) { const L = at(it.salt, i); if (L != null) salt.push(L); } for (let i = 0; i < it.sugar.length / 8; i++) { const L = at(it.sugar, i); if (L != null) sugar.push(L); }
    salt.sort((a, b) => a - b); sugar.sort((a, b) => a - b);
    return { salt: salt[Math.floor(salt.length / 2)], sugar: sugar[Math.floor(sugar.length / 2)], ns: salt.length, nu: sugar.length };
  });
  ok(cry.ns > 0 && cry.nu > 0 && cry.salt < 45 && cry.sugar > 90, `crossed polarizers: salt cubes stay dark (${cry.salt && cry.salt.toFixed(0)}), sugar lights up (${cry.sugar && cry.sugar.toFixed(0)}) — ${cry.ns} salt, ${cry.nu} sugar in view`);
  const cryCol = await stat(p, "gl");
  ok(cryCol.sat > 0.01, `sugar shows interference colours (${(cryCol.sat * 100).toFixed(1)}% of the field strongly coloured)`);
  await setLab(p, { spec: "crystal", obj: 10, coarse: 44, fine: -30, illum: "polar", polar: 30, plate: true }); const plate = await stat(p, "gl");
  ok(plate.mean > cryCol.mean + 30, `the red plate turns the dark background magenta (field ${cryCol.mean.toFixed(0)} → ${plate.mean.toFixed(0)})`);

  /* ── the lessons still count on depth slides ── */
  const mis = await p.evaluate(async () => {
    const out = {}, w = () => new Promise(o => setTimeout(o, 250));
    for (const k of ["onion", "dark", "elodea40", "pond40", "yeast40", "cryPolar"]) delete S.missions[k];
    Object.assign(S.lab, { spec: "onion", obj: 40, coarse: 45, fine: 3, stain: "iodine", illum: "bright" }); paint(); await w(); out.onion = !!S.missions.onion;
    Object.assign(S.lab, { spec: "pond", obj: 10, coarse: 44, fine: 0, stain: "none", illum: "dark" }); paint(); await w(); out.dark = !!S.missions.dark;
    Object.assign(S.lab, { spec: "elodea", obj: 40, coarse: 45, fine: 3, stain: "none", illum: "bright" }); paint(); await w(); out.elodea40 = !!S.missions.elodea40;
    Object.assign(S.lab, { spec: "yeast", obj: 40, coarse: 45, fine: 3, stain: "none", illum: "bright" }); paint(); await w(); out.yeast40 = !!S.missions.yeast40;
    Object.assign(S.lab, { spec: "crystal", obj: 10, illum: "polar" }); paint(); await w(); out.cryPolar = !!S.missions.cryPolar;
    return out; });
  ok(Object.values(mis).every(Boolean), "lesson steps on depth slides still count: " + Object.entries(mis).map(([k, v]) => k + (v ? " ✓" : " ✗")).join(", "));
  ok(!p.errs.length, "no page errors on the computer" + (p.errs.length ? ": " + p.errs[0] : ""));
  await p.context().close();

  /* ── every original slide draws at every objective ── */
  p = await open(DESK, "lab");
  const specs = await p.evaluate(() => SPECIMENS.map(s => s.id));
  const bad = [];
  for (const id of specs) for (const obj of [4, 10, 40, 100]) {
    const fine = obj === 4 ? 0 : obj === 10 ? 0 : 3, coarse = obj === 4 ? 42 : obj === 10 ? 44 : obj === 40 ? 45 : 46;
    await setLab(p, { spec: id, obj, coarse, fine: obj === 100 ? 5 : fine, oil: obj === 100 }, { step: 200 });
    let st = await stat(p, "eye");
    if (!(st.sd > 1.5 && st.mean > 8)) { await wait(800); st = await stat(p, "eye"); }   // the first slide after opening can still be on its way
    const dep = await p.evaluate(() => !depthWanted(S.lab) || (DEPTH.state === "ready" && AOGMicro3D.info().spec === S.lab.spec));
    if (!(st.sd > 1.5 && st.mean > 8) || !dep) bad.push(`${id}@${obj}× (${st.mean.toFixed(0)}±${st.sd.toFixed(1)}${dep ? "" : ", depth engine did not draw"})`);
  }
  ok(!bad.length, `all ${specs.length} slides draw at 4×, 10×, 40× and 100×` + (bad.length ? ": blank " + bad.join(", ") : ""));
  const deep = await p.evaluate(() => DEPTH_SPECS.filter(s => !AOGMicro3D.has(s)));
  ok(!deep.length, "every slide listed as built in depth has a depth model" + (deep.length ? ": missing " + deep.join(", ") : ""));
  ok(!p.errs.length, "no page errors across every slide and objective" + (p.errs.length ? ": " + p.errs[0] : ""));
  await p.context().close();

  /* ── life only after Play, and it stops by itself ── */
  p = await open(DESK, "lab");
  await setLab(p, { spec: "pond", obj: 10, coarse: 44, fine: 0 });
  const still0 = await p.evaluate(() => [window.__silent.raf, LIVE.t, LIVE.playing]); await wait(2500); const still1 = await p.evaluate(() => [window.__silent.raf, LIVE.t, LIVE.playing]);
  ok(still1[0] === still0[0] && still1[1] === still0[1] && !still1[2], "pond water is a still picture until Play is pressed");
  const img0 = await p.evaluate(() => AOGMicro3D.canvas().toDataURL());
  await p.evaluate(() => { LIVE.limit = 2500; }); await p.click('[data-live="toggle"]');
  await wait(1200);
  const mid = await p.evaluate(() => [LIVE.playing, LIVE.t, window.__silent.raf]);
  const moved = await p.evaluate(async u => { const im = new Image(); im.src = u; await im.decode(); const c = AOGMicro3D.canvas(), W = c.width, t = document.createElement("canvas"); t.width = W * 2; t.height = W; const g = t.getContext("2d"); g.drawImage(im, 0, 0); g.drawImage(c, W, 0);
    const a = g.getImageData(0, 0, W, W).data, b2 = g.getImageData(W, 0, W, W).data; let s = 0; for (let i = 0; i < a.length; i += 16) s += Math.abs(a[i + 1] - b2[i + 1]); return s / (a.length / 16); }, img0);
  ok(mid[0] && mid[1] > still1[1] && mid[2] > still1[0] && moved > 0.3, `after Play the swimmers move (clock ${(mid[1] / 1000).toFixed(1)} s, picture change ${moved.toFixed(2)})`);
  await p.waitForFunction(() => !LIVE.playing, null, { timeout: 90000 }).catch(() => {}); await wait(600);
  const end0 = await p.evaluate(() => [LIVE.playing, window.__silent.raf, document.querySelector('[data-live="toggle"]').textContent]); await wait(1500); const end1 = await p.evaluate(() => window.__silent.raf);
  ok(!end0[0] && end1 === end0[1] && /Play/.test(end0[2]), "it stops by itself and goes still, ready to play again");
  await p.evaluate(() => { LIVE.limit = 45000; }); await p.click('[data-live="toggle"]'); await wait(600); await p.click('[data-live="toggle"]'); await wait(500);
  const paused = await p.evaluate(() => [LIVE.playing, window.__silent.raf]); await wait(1200);
  ok(!paused[0] && (await p.evaluate(() => window.__silent.raf)) === paused[1], "Pause stops it at once");
  await setLab(p, { spec: "elodea", obj: 40, coarse: 45, fine: -40 });
  const e0 = await p.evaluate(() => AOGMicro3D._models.elodea.items({ k: 1, x0: -60, x1: 60, y0: -60, y1: 60, cache: {} }, S.lab, LIVE.t / 1000).chl.slice(0, 40));
  await p.evaluate(() => { LIVE.limit = 1500; }); await p.click('[data-live="toggle"]'); await wait(500);
  await p.waitForFunction(() => !LIVE.playing, null, { timeout: 120000 }).catch(() => {});
  const e1 = await p.evaluate(() => [LIVE.playing, Array.from(AOGMicro3D._models.elodea.items({ k: 1, x0: -60, x1: 60, y0: -60, y1: 60, cache: {} }, S.lab, LIVE.t / 1000).chl.slice(0, 40))]);
  let shift = 0; for (let i = 0; i < 40; i += 8) shift = Math.max(shift, Math.hypot(e1[1][i] - e0[i], e1[1][i + 1] - e0[i + 1]));
  ok(!e1[0] && shift > 2 && shift < 40, `elodea's chloroplasts stream after Play (up to ${shift.toFixed(1)} µm in 1.5 s of play), then stop by themselves`);
  ok(!p.errs.length, "no page errors while playing" + (p.errs.length ? ": " + p.errs[0] : ""));
  await p.context().close();
  p = await open(DESK, "lab", { reducedMotion: "reduce" });
  await setLab(p, { spec: "pond", obj: 10, coarse: 44, fine: 0 });
  const rm0 = await p.evaluate(() => [!!document.querySelector('[data-live="step"]'), !document.querySelector('[data-live="toggle"]'), LIVE.t]);
  await p.click('[data-live="step"]'); await wait(1200); const rm1 = await p.evaluate(() => [LIVE.t, window.__silent.raf]); await wait(1500); const rm2 = await p.evaluate(() => [LIVE.t, window.__silent.raf]);
  ok(rm0[0] && rm0[1] && rm1[0] > rm0[2] && rm2[0] === rm1[0] && rm2[1] === rm1[1], "with reduce motion, Play becomes Next moment: one still frame per press");
  await p.context().close();

  /* ── Home Screen app ── */
  p = await open(PHONE, "");
  const app = await p.evaluate(() => ({ man: (document.querySelector('link[rel="manifest"]') || {}).getAttribute && document.querySelector('link[rel="manifest"]').getAttribute("href"), icon: (document.querySelector('link[rel="apple-touch-icon"]') || { getAttribute: () => "" }).getAttribute("href") }));
  let man = {}; try { man = JSON.parse(fs.readFileSync(path.join(ROOT, "microscope.webmanifest"), "utf8")); } catch (e) {}
  ok(app.man === "/microscope.webmanifest" && app.icon === "/app-microscope-touch.png" && fs.existsSync(path.join(ROOT, "app-microscope-touch.png")) && /microscope/.test(man.start_url || ""),
     `the Home Screen app is linked (${app.man}, ${app.icon}, start ${man.start_url})`);
  await p.context().close();

  /* ── a lesson's Try it link (AOG-MICRO-LINK-V1): ?slide=<id> opens the lab with that slide on the stage, then is still ── */
  for (const [id, dev, name] of [["onion", DESK, "computer"], ["elodea", PHONE, "iPhone"]]) {
    p = await open(dev, "", null, "?slide=" + id);
    await p.waitForFunction(() => !depthWanted(S.lab) || DEPTH.state === "failed" || (DEPTH.state === "ready" && AOGMicro3D.info().spec === S.lab.spec), null, { timeout: 90000 }).catch(() => {});
    let last = -1; for (let k = 0; k < 60; k++) { const n = await p.evaluate(() => window.__eyeFrames || 0); if (n === last) break; last = n; await wait(350); }
    const lk = await p.evaluate(() => ({ page: S.page, hash: location.hash, spec: S.lab.spec, menu: (document.querySelector("[data-slidemenu]") || {}).value, obj: S.lab.obj, lamp: S.lab.lightOn, band: focusBand(S.lab.coarse, S.lab.fine, S.lab.obj),
      depth: !depthWanted(S.lab) || (DEPTH.state === "ready" && AOGMicro3D.info().spec === S.lab.spec), playing: LIVE.playing }));
    const st = await stat(p, "eye");
    const q0 = await p.evaluate(() => [window.__silent.raf, LIVE.t]); await wait(2500); const q1 = await p.evaluate(() => [window.__silent.raf, LIVE.t, LIVE.playing]);
    ok(lk.page === "lab" && lk.hash === "#lab" && lk.spec === id && lk.menu === id && lk.obj === 4 && lk.lamp && lk.band === "in" && lk.depth && st.sd > 1.5 && st.mean > 8,
       `${name}: ?slide=${id} opens the lab with ${id} on the stage, lamp on, 4×, in focus (${st.mean.toFixed(0)}±${st.sd.toFixed(1)})`);
    ok(!lk.playing && !q1[2] && q1[0] === q0[0] && q1[1] === q0[1], `${name}: ?slide=${id} is still while idle (${q1[0] - q0[0]} frames in 2.5 s; nothing plays until Play)`);
    const tk = await p.evaluate(sid => { const first = STAIR[0].steps.filter(k => S.missions[k] && k !== "low"), own0 = !!S.missions["sl_" + sid + "_1"];
      const kn = document.querySelector('#view [data-knob="coarse"]'); if (kn) { kn.value = String(S.lab.coarse); kn.dispatchEvent(new Event("input")); }
      return { first, own0, own1: !!S.missions["sl_" + sid + "_1"], lamp: !!S.missions.lamp, knob: !!kn }; }, id);
    ok(!tk.first.length && !tk.own0, `${name}: ?slide=${id} ticks no lesson step on its own (lesson 1: ${tk.first.join(", ") || "none ticked"}; "${id} sharp at 4×" unticked)`);
    ok(tk.knob && tk.own1 && !tk.lamp, `${name}: once the learner turns the focus knob, "${id} sharp at 4×" ticks; the lamp the link turned on still does not`);
    ok(!p.errs.length, `${name}: ?slide=${id} has no console errors` + (p.errs.length ? ": " + p.errs[0] : ""));
    await p.context().close();
  }
  p = await open(DESK, "", null, "?slide=nosuchslide");
  const unk = await p.evaluate(() => [S.page, S.lab.spec, S.lab.lightOn]);
  ok(unk[0] === "home" && unk[1] === "e" && !unk[2] && !p.errs.length, `an unknown ?slide= opens the lab as before (${unk[0]}, ${unk[1]})`);
  await p.context().close();

  /* ── iPhone and iPad, English and Spanish: it fits, and it speaks both ── */
  for (const [name, dev] of [["iPhone", PHONE], ["iPad", IPAD]]) {
    p = await open(dev, "lab");
    for (const lang of ["en", "es"]) {
      await p.evaluate(l => { S.lang = l; }, lang);
      await setLab(p, { spec: "elodea", obj: 10, coarse: 44, fine: 0 });
      const v = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, read: (document.getElementById("depthread") || {}).textContent || "",
        btn: Array.from(document.querySelectorAll("[data-act='illum-phase'],[data-act='illum-fluor']")).map(b => b.textContent).join(" / "), play: (document.querySelector("[data-live]") || {}).textContent || "" }));
      const words = lang === "es" ? /Nítido ahora/.test(v.read) && /Contraste de fase/.test(v.btn) && /Reproducir/.test(v.play) : /Sharp now/.test(v.read) && /Phase contrast/.test(v.btn) && /Play/.test(v.play);
      ok(v.sw <= v.cw + 1 && words, `${name} ${lang.toUpperCase()}: no sideways scroll (${v.sw}/${v.cw}); "${v.read.slice(0, 40)}…", ${v.btn}, ${v.play.trim()}`);
    }
    for (const view of ["home", "meet", "lessons"]) { await p.evaluate(h => go(h), view); await wait(400); const sw = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(sw <= 1, `${name}: the ${view} view has no sideways scroll`); }
    ok(!p.errs.length, `${name}: no page errors` + (p.errs.length ? ": " + p.errs[0] : ""));
    await p.context().close();
  }

  /* ── the lessons and the guide describe the new things ── */
  const les = fs.readFileSync(path.join(ROOT, "microscope-lessons.html"), "utf8"), gd = fs.readFileSync(path.join(ROOT, "microscope-guide.html"), "utf8");
  ok(/AOG-MICRO-DEPTH-V1/.test(les) && /AOG-MICRO-DEPTH-V1/.test(gd) && /phase contrast/i.test(les) && /contraste de fase/i.test(les) && /λ\s*\/\s*2\s*NA|λ\/2NA/.test(les + gd),
     "the lessons and the guide teach depth, the new lights and the Abbe limit (in English and Spanish)");

  await b.close(); server.close();
  console.log(fails ? `\n${fails} check(s) failed` : "\nMicroscope: every check passes");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
