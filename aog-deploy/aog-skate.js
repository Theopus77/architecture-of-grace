/* ══ AOG-SKATE-LAB-V1 (2026-10-11) — the Skate Lab's engine (skate-lab.html, /skate) ════════════════════
   Jimmy: "how to do tricks, grinds, etc. how it balance all the grooves from a science perspective. Make a
   killer interactive engine." Seven rooms, each a real calculation drawn on one canvas:
     ramp      the rider rolls along a real ramp: gravity along the slope, rolling friction from the normal force
               (which includes v²/r on a curve), air drag, and pumping. Stored + motion energy + heat = total, always.
     ollie     the tail as a lever about the back wheels, the front foot's friction, timing, hang time 2√(2h/g).
     grind     slowing μg on a rail or ledge: distance v²/(2μg); mass does not change it.
     balance   center of mass over the wheels (standing, manuals) and in a turn: truck tilt → steer → radius,
               and the one speed that balances a lean, tan θ = v²/(gR).
     flip      a 3D board turning about its long, short and up-down axes; arms in and out, L = Iω.
     timeline  the board and the wheel, 1959 to today.
     tricks    where each foot goes, the steps, what helps, the science.
     build     build a board: a whole setup for a rider and a use, and checks for truck fit, wheels and wheel bite.
   Calm (CLAUDE.md): nothing moves until Go; a run plays once and stops; ◀ ▶ and the slider step through
   every moment by hand. With "reduce motion" on, Go shows the whole run at once as a still picture.
   Every run is worked out first (a list of moments), then shown, so what you see is exactly what was computed.
   Physics constants: g = 9.8 m/s². Values marked "example" (friction, hardness) are typical, not measured. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const G = 9.8, DEG = Math.PI / 180;
const KEY = "aog.skate.v1";
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ── saved choices (this device only) ── */
const DEF = {
  lang: "en", room: "build", speed: 1, stance: "regular",
  ramp: { shape: "mini", h: 1.2, wheel: "ure", mass: 50, pump: false, guess: "" },
  ollie: { pop: 0.7, slide: "on", jump: 0.3, forces: true, ghost: false },
  grind: { surface: "metal", trick: "fifty", v: 3, len: 2.5, mass: 50 },
  balance: { mode: "stand", com: 0, lean: 10, v: 3, truck: "med" },
  flip: { mode: "board", trick: "kickflip", view: "corner", arms: "out" },
  timeline: { i: 0 },
  tricks: { id: "stance" },
  build: { rider: "m", use: "tricks", deck: 8.125, axle: 8.125, wheel: 52, duro: 100, riser: 0, bush: "med", type: "pop" }
};
let S;
try { S = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
if (!S || typeof S !== "object") { S = JSON.parse(JSON.stringify(DEF)); try { if (localStorage.getItem("aog.lang") === "es") S.lang = "es"; } catch (e) {} }
for (const k in DEF) { if (S[k] == null) S[k] = JSON.parse(JSON.stringify(DEF[k])); else if (typeof DEF[k] === "object") for (const j in DEF[k]) if (S[k][j] == null) S[k][j] = DEF[k][j]; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
const es = () => S.lang === "es";
const L = (en, sp) => es() ? sp : en;
const num = (x, d) => (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace(".", es() ? "," : ".");

/* ══ the canvas: a fixed drawing size, scaled to the page's width; resized only when the width changes ══ */
const cv = $("cv"), ctx = cv.getContext("2d");
let W = 900, H = 500, SC = 1, FS = 20, sizedW = 0;
function fit(force) {
  const cssW = cv.parentNode.clientWidth || 360;
  if (!force && Math.abs(cssW - sizedW) < 2) return false;
  sizedW = cssW;
  const narrow = cssW < 600;
  W = 900; H = Math.round(W * (narrow ? 0.78 : 0.56));
  SC = cssW / W;
  FS = Math.max(24, 14 / SC);
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * H / W * dpr);
  cv.style.height = Math.round(cssW * H / W) + "px";
  ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  return true;
}
let C = {};
function colors() {
  const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  C = {};
  ["sky", "ground", "ramp", "ramp-edge", "ink", "deck", "grip", "wheel", "truck", "skin", "shirt", "pants", "pe", "ke", "heat", "pump", "force", "friction", "path", "grid", "soft"].forEach(k => C[k] = v("--cv-" + k));
  C.steel = v("--steel"); C.good = v("--good"); C.warn = v("--warn"); C.card = v("--card"); C.line = v("--line");
}
function font(w, mult) { ctx.font = (w || 600) + " " + Math.round(FS * (mult || 1)) + 'px "Source Sans 3", ui-sans-serif, system-ui, sans-serif'; }
function text(s, x, y, o) {
  o = o || {}; font(o.w, o.m); ctx.fillStyle = o.c || C.ink; ctx.textAlign = o.a || "left"; ctx.textBaseline = o.b || "alphabetic";
  if (o.bg) { const tw = ctx.measureText(s).width, h = FS * (o.m || 1); const x0 = o.a === "center" ? x - tw / 2 : o.a === "right" ? x - tw : x;
    ctx.save(); ctx.fillStyle = o.bg; ctx.globalAlpha = .88; roundRect(x0 - 6, y - h * .85, tw + 12, h * 1.15, 6); ctx.fill(); ctx.restore(); }
  ctx.fillText(s, x, y);
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function clear() { ctx.save(); ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.fillStyle = C.sky; ctx.fillRect(0, 0, W, H); ctx.restore(); }
/* an arrow in screen space; len in px */
function arrow(x1, y1, x2, y2, col, lw) {
  const a = Math.atan2(y2 - y1, x2 - x1), hl = Math.max(10, (lw || 4) * 3.2);
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw || 4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hl * .6, y2 - Math.sin(a) * hl * .6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .42), y2 - hl * Math.sin(a - .42)); ctx.lineTo(x2 - hl * Math.cos(a + .42), y2 - hl * Math.sin(a + .42)); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ══ the board and the rider, drawn in meters with y up (the caller sets the transform) ══
   Board frame: x along the board (nose +), origin midway between the two wheel contacts, y up. */
const BOARD = { half: 0.40, kickStart: 0.29, kickRise: 0.035, axle: 0.18, wheelR: 0.027, deckY: 0.085, thick: 0.014 };
function deckPath() {
  const b = BOARD, y = b.deckY;
  return [[-b.half, y + b.kickRise], [-b.kickStart, y], [b.kickStart, y], [b.half, y + b.kickRise]];
}
function drawBoardSide(lw) {
  const b = BOARD;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  // trucks
  ctx.fillStyle = C.truck; ctx.strokeStyle = C.truck; ctx.lineWidth = 0.012;
  [-b.axle, b.axle].forEach(x => { ctx.beginPath(); ctx.moveTo(x - 0.035, b.deckY - b.thick / 2); ctx.lineTo(x + 0.035, b.deckY - b.thick / 2); ctx.lineTo(x + 0.012, b.wheelR); ctx.lineTo(x - 0.012, b.wheelR); ctx.closePath(); ctx.fill(); });
  // wheels
  [-b.axle, b.axle].forEach(x => { ctx.beginPath(); ctx.arc(x, b.wheelR, b.wheelR, 0, 7); ctx.fillStyle = C.wheel; ctx.fill(); ctx.lineWidth = 0.006; ctx.strokeStyle = C["ramp-edge"]; ctx.stroke(); });
  // deck: wood with grip on top
  const p = deckPath();
  ctx.strokeStyle = C.deck; ctx.lineWidth = b.thick + (lw || 0);
  ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
  ctx.strokeStyle = C.grip; ctx.lineWidth = 0.005;
  ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(q[0], q[1] + b.thick / 2) : ctx.moveTo(q[0], q[1] + b.thick / 2)); ctx.stroke();
}
/* the height of the deck's top at board-x (for placing feet) */
function deckTop(x) {
  const b = BOARD, ax = Math.abs(x);
  return b.deckY + b.thick / 2 + (ax > b.kickStart ? (ax - b.kickStart) / (b.half - b.kickStart) * b.kickRise : 0);
}
/* a rider: feet at fB, fF; hip at hp (all [x,y] in the same frame, y up); lean (radians, + toward nose) */
function drawBody(fB, fF, hp, o) {
  o = o || {};
  const LEG = 0.46, lean = o.lean || 0;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  function leg(f, side) {
    const dx = hp[0] - f[0], dy = hp[1] - f[1], d = Math.hypot(dx, dy) || 1e-6;
    let k;
    if (d >= 2 * LEG) k = [f[0] + dx / 2, f[1] + dy / 2];
    else { const h = Math.sqrt(LEG * LEG - d * d / 4); const px = -dy / d, py = dx / d; k = [f[0] + dx / 2 + px * h * side, f[1] + dy / 2 + py * h * side]; }
    ctx.strokeStyle = C.pants; ctx.lineWidth = 0.075;
    ctx.beginPath(); ctx.moveTo(f[0], f[1] + 0.03); ctx.lineTo(k[0], k[1]); ctx.lineTo(hp[0], hp[1]); ctx.stroke();
    // knee pad
    ctx.fillStyle = C.grip; ctx.beginPath(); ctx.arc(k[0], k[1], 0.042, 0, 7); ctx.fill();
    // shoe
    ctx.strokeStyle = C.grip; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(f[0] - 0.05, f[1] + 0.02); ctx.lineTo(f[0] + 0.05, f[1] + 0.02); ctx.stroke();
  }
  // the leg toward the tail bends out toward the tail, the front leg toward the nose: knees read as bent
  leg(fB, 1); leg(fF, -1);
  const sh = [hp[0] + Math.sin(lean) * 0.52, hp[1] + Math.cos(lean) * 0.52];
  ctx.strokeStyle = C.shirt; ctx.lineWidth = 0.13;
  ctx.beginPath(); ctx.moveTo(hp[0], hp[1] + 0.04); ctx.lineTo(sh[0], sh[1]); ctx.stroke();
  // arms out for balance
  const arm = o.arms != null ? o.arms : 1;
  ctx.lineWidth = 0.055;
  ctx.beginPath(); ctx.moveTo(sh[0], sh[1] - 0.03); ctx.lineTo(sh[0] - 0.22 * arm - 0.05, sh[1] - 0.12); ctx.lineTo(sh[0] - 0.42 * arm - 0.04, sh[1] - 0.24 + 0.1 * arm); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sh[0], sh[1] - 0.03); ctx.lineTo(sh[0] + 0.22 * arm + 0.05, sh[1] - 0.1); ctx.lineTo(sh[0] + 0.42 * arm + 0.04, sh[1] - 0.2 + 0.1 * arm); ctx.stroke();
  // head with a helmet
  const hd = [sh[0] + Math.sin(lean) * 0.17, sh[1] + Math.cos(lean) * 0.17];
  ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(hd[0], hd[1], 0.1, 0, 7); ctx.fill();
  ctx.fillStyle = C.steel; ctx.beginPath(); ctx.arc(hd[0], hd[1] + 0.012, 0.112, lean + 0.05, lean + Math.PI - 0.05); ctx.closePath(); ctx.fill();
  if (o.com) drawCOM(o.com[0], o.com[1], 0.05);
}
function drawCOM(x, y, r) {
  ctx.save(); ctx.lineWidth = r * 0.28; ctx.strokeStyle = C.ink; ctx.fillStyle = C.sky;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, 0, Math.PI / 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, Math.PI, Math.PI * 1.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/* a whole rider on a board, in board frame; crouch 0 (tall) … 1 (low) */
function drawRider(crouch, o) {
  o = o || {};
  drawBoardSide();
  const fb = -0.2, ff = 0.13;
  const fB = [fb, deckTop(fb)], fF = [ff, deckTop(ff)];
  const hip = [(fb + ff) / 2 + 0.01, deckTop(0) + 0.86 - 0.36 * crouch];
  drawBody(fB, fF, hip, { lean: o.lean || 0.06, com: o.com !== false ? [hip[0] + 0.02, hip[1] + 0.12] : null, arms: o.arms });
  return [hip[0] + 0.02, hip[1] + 0.12];
}

/* ══ the player: every run is a list of moments; Go plays it once; ◀ ▶ and the slider step by hand ══ */
const P = { frames: [], dt: 1 / 60, k: 0, playing: false, raf: 0, t0: 0, tk0: 0, ran: false };
function setRun(frames, dt) { stop(); P.frames = frames || []; P.dt = dt || 1 / 60; P.k = 0; P.ran = false; }
function stop() { P.playing = false; if (P.raf) cancelAnimationFrame(P.raf); P.raf = 0; }
function go() {
  ROOMS[S.room].run();
  if (!P.frames.length) return;
  P.ran = true;
  if (REDUCE) { P.k = P.frames.length - 1; paint(); return; }
  P.k = 0; P.playing = true; P.t0 = performance.now(); P.tk0 = 0;
  const tick = now => {
    if (!P.playing) return;
    const k = Math.floor(P.tk0 + (now - P.t0) / 1000 / P.dt * S.speed);
    if (k >= P.frames.length - 1) { P.k = P.frames.length - 1; P.playing = false; P.raf = 0; paint(); return; }
    if (k !== P.k) { P.k = k; paint(true); }
    P.raf = requestAnimationFrame(tick);
  };
  paint(true);
  P.raf = requestAnimationFrame(tick);
}
function pause() {
  if (P.playing) { stop(); paint(); return; }
  if (!P.frames.length || P.k >= P.frames.length - 1) { go(); return; }
  P.playing = true; P.t0 = performance.now(); P.tk0 = P.k;
  const tick = now => {
    if (!P.playing) return;
    const k = Math.floor(P.tk0 + (now - P.t0) / 1000 / P.dt * S.speed);
    if (k >= P.frames.length - 1) { P.k = P.frames.length - 1; P.playing = false; P.raf = 0; paint(); return; }
    if (k !== P.k) { P.k = k; paint(true); }
    P.raf = requestAnimationFrame(tick);
  };
  paint(); P.raf = requestAnimationFrame(tick);
}
function stepBy(n) { stop(); if (!P.frames.length) return; P.ran = true; P.k = clamp(P.k + n, 0, P.frames.length - 1); paint(); }
function playerHtml(room) {
  if (!room.player) return "";
  const n = P.frames.length, has = n > 1;
  const sp = s => `<button type="button" data-spd="${s}" aria-pressed="${S.speed === s}">${s === 1 ? L("Normal", "Normal") : s === .5 ? L("Slow", "Lento") : L("Very slow", "Muy lento")}</button>`;
  return `<button type="button" class="btn btn-steel" id="goBtn">${P.playing ? L("Pause", "Pausa") : (P.ran && P.k < n - 1 && P.k > 0) ? L("Keep going", "Seguir") : L("Go", "Ir")}</button>
    <button type="button" class="btn" id="backBtn" aria-label="${L("One step back", "Un paso atrás")}" ${has ? "" : "disabled"}>◀</button>
    <button type="button" class="btn" id="fwdBtn" aria-label="${L("One step forward", "Un paso adelante")}" ${has ? "" : "disabled"}>▶</button>
    <span class="grow"><input type="range" id="scrub" min="0" max="${Math.max(0, n - 1)}" value="${P.k}" aria-label="${L("Moment in the run", "Momento del recorrido")}" ${has ? "" : "disabled"}><span class="time" id="tRead">${num(P.k * P.dt, 2)} s</span></span>
    <span class="seg" role="group" aria-label="${L("Speed", "Velocidad")}">${sp(1)}${sp(.5)}${sp(.25)}</span>`;
}
function wirePlayer() {
  const g = $("goBtn"); if (!g) return;
  g.onclick = () => { if (P.playing) pause(); else if (P.ran && P.k > 0 && P.k < P.frames.length - 1) pause(); else go(); };
  $("backBtn").onclick = () => stepBy(-1); $("fwdBtn").onclick = () => stepBy(1);
  $("scrub").oninput = e => { stop(); P.ran = true; P.k = +e.target.value; paint(true); };
  $("scrub").onchange = () => paint();
  document.querySelectorAll("[data-spd]").forEach(b => b.onclick = () => { S.speed = +b.getAttribute("data-spd"); save(); if (P.playing) { P.tk0 = P.k; P.t0 = performance.now(); } paintPlayer(); });
}
function paintPlayer() { const room = ROOMS[S.room]; $("player").innerHTML = playerHtml(room); $("player").hidden = !room.player; wirePlayer(); }

/* ══ ROOM 1 — the ramp ═══════════════════════════════════════════════════════════════════════════════ */
const WHEELS = {
  ideal: { mu: 0, en: "No friction (ideal)", es: "Sin fricción (ideal)" },
  ure: { mu: 0.012, en: "Urethane (since the 1970s)", es: "Uretano (desde los años 70)" },
  clay: { mu: 0.04, en: "Clay (1960s)", es: "Arcilla (años 60)" },
  steel: { mu: 0.05, en: "Steel (1950s)", es: "Acero (años 50)" }
};
const SHAPES = {
  mini: { R: 1.8, Hm: 1.2, F: 2.5, en: "Mini ramp", es: "Mini rampa" },
  vert: { R: 3.0, Hm: 3.6, F: 4.0, en: "Vert ramp", es: "Rampa vertical" },
  hill: { slope: 5, en: "Gentle hill", es: "Colina suave" }
};
const DRAG_K = 0.27;   // ½ ρ C A for a standing rider, kg/m (example)
function buildPath(sh, h) {
  const pts = [];   // {x, y, k (curvature, + concave up), seg}
  if (sh === "hill") {
    const a = SHAPES.hill.slope * DEG, len = h / Math.tan(a);
    for (let x = 0; x <= len; x += 0.05) pts.push({ x, y: h - x * Math.tan(a), k: 0, seg: "slope" });
    for (let x = len; x <= len + 400; x += 0.25) pts.push({ x, y: 0, k: 0, seg: "flat" });
    return { pts, R: 0, Hm: h, F: 0, hill: true, slopeLen: len };
  }
  const { R, Hm, F } = SHAPES[sh];
  const ds = 0.02;
  const vert = Math.max(0, Hm - R);
  // left wall: vertical part (vert ramps), then the curve (transition) down to the flat
  for (let y = Hm; y > R; y -= ds) pts.push({ x: 0, y, k: 0, seg: "wallL" });
  const t0 = Hm >= R ? 0 : Math.asin(1 - Hm / R);
  for (let t = t0; t < Math.PI / 2; t += ds / R) pts.push({ x: R - R * Math.cos(t), y: R - R * Math.sin(t), k: 1 / R, seg: "curveL" });
  for (let x = R; x < R + F; x += ds) pts.push({ x, y: 0, k: 0, seg: "flat" });
  for (let t = Math.PI / 2; t > t0; t -= ds / R) pts.push({ x: R + F + R * Math.cos(t), y: R - R * Math.sin(t), k: 1 / R, seg: "curveR" });
  if (Hm >= R) for (let y = R; y <= Hm + 1e-9; y += ds) pts.push({ x: 2 * R + F, y, k: 0, seg: "wallR" });
  else pts.push({ x: R + F + R * Math.cos(t0), y: Hm, k: 1 / R, seg: "curveR" });
  return { pts, R, Hm, F, vert, t0 };
}
function prepPath(path) {
  const p = path.pts; let s = 0;
  for (let i = 0; i < p.length; i++) {
    if (i) s += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
    p[i].s = s;
  }
  for (let i = 0; i < p.length; i++) {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)], d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    p[i].tx = (b.x - a.x) / d; p[i].ty = (b.y - a.y) / d;
  }
  path.len = s; return path;
}
function at(path, s) {   // position, tangent and curvature at arc length s
  const p = path.pts; let lo = 0, hi = p.length - 1;
  if (s <= 0) return p[0]; if (s >= path.len) return p[hi];
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p[m].s <= s) lo = m; else hi = m; }
  const a = p[lo], b = p[hi], u = (s - a.s) / ((b.s - a.s) || 1);
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), tx: lerp(a.tx, b.tx, u), ty: lerp(a.ty, b.ty, u), k: u < .5 ? a.k : b.k, seg: u < .5 ? a.seg : b.seg, s };
}
/* the ramp run: integrate along the path in small steps (1/600 s), keep one moment every 1/60 s */
function simRamp(o) {
  const path = prepPath(buildPath(o.shape, o.h));
  const mu = WHEELS[o.wheel].mu, m = o.mass, sub = 10, dt = 1 / 600;
  const Hm = path.Hm, pumpOn = o.pump && !path.hill;
  // the start: on the left wall at height h, standing still (a drop-in)
  let s = 0;
  if (!path.hill) { const p = path.pts; for (let i = 0; i < p.length; i++) if (p[i].y <= o.h) { s = p[i].s; break; } }
  let v = 0, t = 0, heat = 0, pumpW = 0, air = 0, vair = 0, stillT = 0, lastSeg = at(path, s).seg, ended = "", firstBottom = null, maxV = 0;
  const E0 = m * G * at(path, s).y;
  const frames = [];
  const tMax = path.hill ? 70 : 25;
  for (let step = 0; step < tMax * 600; step++) {
    const q = at(path, s);
    let nG = 1;
    if (air > 0 || vair !== 0) {          // in the air above a vert ramp's top (straight up and down)
      vair -= G * dt; air += vair * dt;
      if (air <= 0) { air = 0; v = (q.seg === "wallL" ? 1 : -1) * Math.abs(vair); vair = 0; }
      nG = 0;
    } else {
      const cosA = Math.abs(q.tx);
      const n = G * cosA * (q.ty * 0 + 1) + v * v * q.k;     // normal force per kilogram (gravity part + curve part)
      nG = Math.max(0, n) / G;
      const fr = mu * Math.max(0, n), drag = (o.wheel === "ideal" ? 0 : DRAG_K) * v * v / m;   // ideal: no friction and no air
      let a = -G * q.ty;
      if (Math.abs(v) > 1e-4) a -= Math.sign(v) * (fr + drag);
      else if (Math.abs(a) <= fr) a = 0;
      const vNew = v + a * dt;
      if (v !== 0 && Math.sign(vNew) !== Math.sign(v) && Math.abs(G * q.ty) <= fr) v = 0; else v = vNew;
      heat += (fr + drag) * Math.abs(v) * dt * m;
      s += v * dt;
      // pumping: standing tall through the bottom of each curve adds energy (work done by the legs against v²/r)
      const q2 = at(path, s);
      if (pumpOn && q2.seg !== lastSeg && (lastSeg === "flat" || q2.seg === "flat")) {
        const add = 0.5 * m * 0.3 * v * v / path.R; pumpW += add;
        v = Math.sign(v) * Math.sqrt(v * v + 2 * add / m);
      }
      lastSeg = q2.seg;
      if (s >= path.len && v > 0) {
        if (path.hill) { ended = "far"; s = path.len; v = 0; }
        else if (path.vert > 0) { s = path.len; vair = v; v = 0; air = 1e-6; }
        else { ended = "deck"; s = path.len; v = 0; }
      }
      if (s <= 0 && v < 0) {
        if (path.vert > 0) { s = 0; vair = -v; v = 0; air = 1e-6; }
        else { ended = "deck"; s = 0; v = 0; }
      }
      if (!path.hill && firstBottom == null && q2.seg === "flat") firstBottom = Math.abs(v);
      if (path.hill && firstBottom == null && q2.seg === "flat") firstBottom = Math.abs(v);
    }
    maxV = Math.max(maxV, Math.abs(v), Math.abs(vair));
    if (step % sub === 0) {
      const q3 = at(path, s), y = q3.y + air;
      const speed = air > 0 ? Math.abs(vair) : Math.abs(v);
      const crouch = pumpOn ? clamp(0.85 - (q3.y / (path.R || 1)) * 0.7 + (q3.seg === "flat" ? -0.5 : 0), 0.05, 0.9) : 0.35;
      frames.push({ t, s, x: q3.x, y, base: q3.y, tx: q3.tx, ty: q3.ty, v: speed, air, nG, pe: m * G * y, ke: 0.5 * m * speed * speed, heat, pumpW, crouch, seg: q3.seg, E0 });
    }
    t += dt;
    if (ended) break;
    if (Math.abs(v) < 0.03 && air === 0 && vair === 0) { stillT += dt; if (stillT > 0.6) { ended = "stopped"; break; } } else stillT = 0;
  }
  return { frames, path, ended, firstBottom, maxV, E0, ideal: Math.sqrt(2 * G * at(path, 0).y * (path.hill ? 1 : 0) + 2 * G * (path.hill ? 0 : o.h)) };
}
let RR = null;   // the latest ramp run
function rampView(path) {
  if (path.hill) return null;
  const w = 2 * path.R + path.F, pad = 0.8;
  const sc = Math.min((W - 60) / (w + 2 * pad + 1.2), (H - 70) / (path.Hm + 1.8));
  const tall = (path.Hm + 1.7) * sc;
  return { sc, ox: (W - w * sc) / 2, oy: Math.min(H - 34, H / 2 + tall / 2 + 10) };
}
function drawRamp(fr) {
  const path = RR.path;
  let sc, ox, oy;
  if (path.hill) { sc = Math.min(W / 22, (H - 80) / (path.Hm + 2.2)); oy = H - 40; const fx = fr ? fr.x : 0; ox = W * 0.32 - fx * sc; }
  else { const v = rampView(path); sc = v.sc; ox = v.ox; oy = v.oy; }
  const X = x => ox + x * sc, Y = y => oy - y * sc;
  // ground grid: a mark every meter (hill: every 5 m with a number)
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  if (path.hill) {
    const x0 = Math.floor((-ox / sc) / 5) * 5;
    for (let x = x0; x < (W - ox) / sc + 5; x += 5) { ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(0) + 12); ctx.strokeStyle = C.soft; ctx.stroke(); if (x >= 0) text(num(x, 0) + " m", X(x) + 3, Y(0) + 28, { m: .75, c: C.soft }); }
  } else {
    for (let y = 1; y <= Math.ceil(path.Hm + 1); y++) { ctx.beginPath(); ctx.moveTo(0, Y(y)); ctx.lineTo(W, Y(y)); ctx.strokeStyle = C.grid; ctx.stroke(); text(y + " m", 8, Y(y) - 4, { m: .7, c: C.soft }); }
  }
  // the ramp itself: filled under the riding surface
  const p = path.pts;
  ctx.fillStyle = C.ramp; ctx.beginPath(); ctx.moveTo(X(p[0].x - (path.hill ? 0 : 0.9)), Y(-1));
  if (!path.hill) ctx.lineTo(X(p[0].x - 0.9), Y(p[0].y));
  p.forEach(q => ctx.lineTo(X(q.x), Y(q.y)));
  if (!path.hill) ctx.lineTo(X(p[p.length - 1].x + 0.9), Y(p[p.length - 1].y));
  ctx.lineTo(X(p[p.length - 1].x + (path.hill ? 0 : 0.9)), Y(-1)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C["ramp-edge"]; ctx.lineWidth = 3; ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(X(q.x), Y(q.y)) : ctx.moveTo(X(q.x), Y(q.y))); ctx.stroke();
  if (!path.hill) {   // decks and coping
    const xl = p[0].x, xr = p[p.length - 1].x, top = path.Hm;
    ctx.beginPath(); ctx.moveTo(X(xl - 0.9), Y(top)); ctx.lineTo(X(xl), Y(top)); ctx.moveTo(X(xr), Y(top)); ctx.lineTo(X(xr + 0.9), Y(top)); ctx.stroke();
    ctx.fillStyle = C.truck; [xl, xr].forEach(x => { ctx.beginPath(); ctx.arc(X(x), Y(top), 0.035 * sc + 2, 0, 7); ctx.fill(); });
  }
  ctx.fillStyle = C.ground; ctx.fillRect(0, Y(0) + (path.hill ? 0 : 1), W, H);
  if (path.hill) { ctx.fillStyle = C.ramp; ctx.beginPath(); ctx.moveTo(X(p[0].x), Y(p[0].y)); p.forEach(q => { if (q.x < path.slopeLen + 1) ctx.lineTo(X(q.x), Y(q.y)); }); ctx.lineTo(X(0), Y(0)); ctx.closePath(); ctx.fill(); }
  if (!fr) return;
  // the path already ridden
  const fs = P.frames;
  if (fs.length > 1 && P.ran) {
    ctx.save(); ctx.strokeStyle = C.path; ctx.globalAlpha = .55; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]); ctx.beginPath();
    for (let i = 0; i <= P.k; i += 2) { const f = fs[i]; const nx = -f.ty, ny = f.tx; const cx = f.x + nx * 0.98, cy = f.base + ny * 0.98 + f.air; i ? ctx.lineTo(X(cx), Y(cy)) : ctx.moveTo(X(cx), Y(cy)); }
    ctx.stroke(); ctx.restore();
  }
  // the rider: board along the surface, body along the surface's normal
  ctx.save(); ctx.translate(X(fr.x), Y(fr.y)); ctx.scale(sc, -sc); ctx.rotate(Math.atan2(fr.ty, fr.tx));
  drawRider(fr.crouch);
  ctx.restore();
  // force arrows: weight straight down; the ramp's push along the normal
  if (S.ramp.forces !== false) {
    const nx = -fr.ty, ny = fr.tx, cx = X(fr.x + nx * 0.98), cy = Y(fr.base + ny * 0.98 + fr.air);
    arrow(cx, cy, cx, cy + 46, C.force, 4);
    if (fr.nG > 0.02) arrow(X(fr.x), Y(fr.base) , X(fr.x) + nx * 46 * fr.nG, Y(fr.base) - ny * 46 * fr.nG, C.good, 4);
  }
}
function rampUnder(fr) {
  if (!fr) return "";
  const tot = Math.max(fr.E0 + fr.pumpW, 1);
  const bar = (k, label, val, col) => `<div class="ebar"><span>${label}</span><span class="track"><span class="fill" style="width:${clamp(val / tot * 100, 0, 100)}%;background:var(${col})"></span></span><span class="num">${num(val / 1000, 2)} kJ</span></div>`;
  return `<div class="reads">
    <div class="read"><div class="k">${L("Speed", "Rapidez")}</div><div class="v">${num(fr.v, 1)}</div><div class="u">m/s · ${num(fr.v * 3.6, 0)} km/h</div></div>
    <div class="read"><div class="k">${L("Height", "Altura")}</div><div class="v">${num(fr.y, 2)}</div><div class="u">m</div></div>
    <div class="read"><div class="k">${L("Feels like", "Se siente como")}</div><div class="v">${num(fr.nG, 1)}×</div><div class="u">${L("your weight", "tu peso")}</div></div>
    ${RR.path.hill ? `<div class="read"><div class="k">${L("Rolled", "Rodó")}</div><div class="v">${num(fr.x, 1)}</div><div class="u">m</div></div>` : ""}
  </div>
  <div class="ebars" style="margin-top:.5rem" aria-label="${L("Energy", "Energía")}">
    ${bar("pe", L("Stored (height)", "Guardada (altura)"), fr.pe, "--cv-pe")}
    ${bar("ke", L("Motion", "Movimiento"), fr.ke, "--cv-ke")}
    ${bar("heat", L("Heat and sound", "Calor y sonido"), fr.heat, "--cv-heat")}
    ${S.ramp.pump && !RR.path.hill ? bar("pump", L("Added by pumping", "Añadida al bombear"), fr.pumpW, "--cv-pump") : ""}
  </div>`;
}
function rampPanel() {
  const o = S.ramp, sh = SHAPES[o.shape], hmax = o.shape === "hill" ? 3 : sh.Hm;
  const seg = (key, val, label) => `<button type="button" data-k="${key}" data-v="${val}" aria-pressed="${String(o[key]) === String(val)}">${label}</button>`;
  const r = RR, done = P.ran && P.k >= P.frames.length - 1 && r;
  const ideal = Math.sqrt(2 * G * o.h);
  let result = "";
  if (done && r.firstBottom != null) {
    const g = parseFloat(String(o.guess).replace(",", "."));
    result = `<div class="note good"><b>${L("Speed at the bottom", "Rapidez abajo")}: ${num(r.firstBottom, 2)} m/s</b><br>
      ${isFinite(g) ? L("Your guess was ", "Tu predicción fue ") + num(g, 1) + " m/s. " : ""}${L("With no friction it would be", "Sin fricción sería")} ${num(ideal, 2)} m/s.</div>
      <div class="math">${L("Stored energy becomes motion energy", "La energía guardada se vuelve energía de movimiento")}:
m·g·h = ½·m·v²   →   v = √(2·g·h)
v = √(2 × 9.8 × ${num(o.h, 1)}) = ${num(ideal, 2)} m/s
${L("The mass cancels: a heavy rider and a light rider reach the same speed.", "La masa se cancela: un ciclista pesado y uno ligero llegan a la misma rapidez.").replace(L("rider", "ciclista"), L("rider", "patinador")).replace(L("rider", "ciclista"), L("rider", "patinador"))}</div>
      ${r.ended === "deck" ? `<div class="note warn">${L("Pumping added so much energy that you rolled up onto the deck. On a real ramp, that is the moment to learn a kickturn.", "Bombear añadió tanta energía que subiste a la plataforma. En una rampa real, es el momento de aprender un kickturn.")}</div>` : ""}
      ${r.path.vert > 0 && r.frames.some(f => f.air > 0.05) ? `<div class="note">${L("You flew above the coping: on a vert wall the ramp points straight up, so you go straight up and come straight back down.", "Volaste sobre el coping: en una pared vertical la rampa apunta hacia arriba, así que subes y bajas en línea recta.")}</div>` : ""}`;
  }
  return `<p class="kicker">${L("Room 1 · Energy", "Sala 1 · Energía")}</p>
  <h2>${L("Ramp and energy", "Rampa y energía")}</h2>
  <p class="say">${L("Pick a ramp and a starting height, guess your speed at the bottom, then press Go. Watch the energy bars: what you lose in height you gain in speed.", "Elige una rampa y una altura de salida, adivina tu rapidez abajo y pulsa Ir. Mira las barras: lo que pierdes en altura lo ganas en rapidez.")}</p>
  <div class="ctl"><span class="lab">${L("Ramp", "Rampa")}</span><div class="seg">${["mini", "vert", "hill"].map(k => seg("shape", k, L(SHAPES[k].en, SHAPES[k].es))).join("")}</div></div>
  <div class="ctl"><label for="rH">${L("Start height", "Altura de salida")} <output>${num(o.h, 1)} m</output></label><input type="range" id="rH" min="0.2" max="${hmax}" step="0.1" value="${o.h}"></div>
  <div class="ctl"><span class="lab">${L("Wheels", "Ruedas")}</span><div class="seg">${["ure", "clay", "steel", "ideal"].map(k => seg("wheel", k, L(WHEELS[k].en, WHEELS[k].es))).join("")}</div>
    <p class="hint">${L("Rolling friction, example values", "Fricción al rodar, valores de ejemplo")}: ${["ure", "clay", "steel"].map(k => L(WHEELS[k].en, WHEELS[k].es).split(" (")[0] + " μ = " + num(WHEELS[k].mu, 3)).join(" · ")}</p></div>
  ${o.shape !== "hill" ? `<div class="ctl"><span class="lab">${L("Pumping", "Bombear")}</span><div class="seg">${seg("pump", false, L("Off", "No"))}${seg("pump", true, L("On: stand tall at the bottom of each curve", "Sí: ponte de pie abajo en cada curva"))}</div></div>` : ""}
  <div class="ctl"><label for="rM">${L("Rider's mass", "Masa del patinador")} <output>${o.mass} kg</output></label><input type="range" id="rM" min="20" max="110" step="5" value="${o.mass}"></div>
  <div class="ctl"><label for="rG">${L("Your guess: speed at the bottom (m/s)", "Tu predicción: rapidez abajo (m/s)")}</label><input class="num" id="rG" inputmode="decimal" value="${esc(o.guess)}" autocomplete="off"></div>
  ${result}
  <p class="legend"><span><i style="background:var(--cv-force)"></i>${L("Weight (gravity)", "Peso (gravedad)")}</span><span><i style="background:var(--good)"></i>${L("The ramp pushes back", "La rampa empuja")}</span><span><i style="background:var(--cv-path)"></i>${L("Path of your center of mass", "Camino de tu centro de masa")}</span></p>
  <details class="more"><summary>${L("The science", "La ciencia")}</summary>
   <p>${L("At the top you have stored energy because of your height: m·g·h. Rolling down, gravity turns it into motion energy: ½·m·v². Friction in the wheels and the push of the air turn a little into heat and sound, so you never roll back quite as high as you started.", "Arriba tienes energía guardada por tu altura: m·g·h. Al bajar, la gravedad la convierte en energía de movimiento: ½·m·v². La fricción de las ruedas y el aire convierten un poco en calor y sonido, así que nunca vuelves a subir tan alto como empezaste.")}</p>
   <p>${L("At the bottom of a curve the ramp pushes up harder than your weight, because it must also bend your path: extra push = m·v²/r. That is why you feel heavy there. Skaters pump by standing tall at that moment, so their legs do work and add energy.", "Abajo de una curva la rampa empuja más fuerte que tu peso, porque también debe doblar tu camino: empuje extra = m·v²/r. Por eso te sientes pesado allí. Para bombear, los patinadores se ponen de pie en ese momento, así sus piernas hacen trabajo y añaden energía.")}</p>
   <p>${L("Urethane wheels, sold from the early 1970s, roll with much less friction than clay or steel wheels. Try each one on the hill.", "Las ruedas de uretano, vendidas desde principios de los años 70, ruedan con mucha menos fricción que las de arcilla o acero. Prueba cada una en la colina.")}</p>
  </details>`;
}
function rampWire() {
  const o = S.ramp;
  document.querySelectorAll("#panel [data-k]").forEach(b => b.onclick = () => {
    const k = b.getAttribute("data-k"), v = b.getAttribute("data-v");
    o[k] = v === "true" ? true : v === "false" ? false : v;
    if (k === "shape") o.h = v === "hill" ? 1.5 : SHAPES[v].Hm;
    save(); rampReset();
  });
  $("rH").oninput = e => { o.h = +e.target.value; e.target.previousElementSibling.querySelector("output").textContent = num(o.h, 1) + " m"; save(); rampReset(true); };
  $("rH").onchange = () => panel();
  $("rM").oninput = e => { o.mass = +e.target.value; e.target.previousElementSibling.querySelector("output").textContent = o.mass + " kg"; save(); rampReset(true); };
  $("rM").onchange = () => panel();
  $("rG").oninput = e => { o.guess = e.target.value; save(); };
}
function rampReset(quiet) { RR = simRamp(S.ramp); setRun(RR.frames, 1 / 60); if (!quiet) panel(); paint(); }

/* ══ ROOM 2 — the ollie ══════════════════════════════════════════════════════════════════════════════
   A timed model of the five moves (crouch, pop, slide, jump, land). The board turns about its back wheels
   when the tail is snapped; the front foot's friction drags it up and levels it; the rider's center of mass
   flies in a parabola for 2·v₀/g seconds. Timing decides the outcome. */
function simOllie(o) {
  const dt = 1 / 120, tp = 0.36;                                     // tp: the pop
  const v0 = Math.sqrt(2 * G * (o.jump + 0.12));                      // takeoff speed of the center of mass
  const flight = 2 * v0 / G, tLand = tp + flight;
  const alphaMax = (12 + 22 * o.pop) * DEG;                           // how far the tail snap turns the board
  const slideAt = { early: tp - 0.08, on: tp + 0.04, late: tp + 0.2, none: 99 }[o.slide];
  const popEff = o.slide === "early" ? 0.45 : 1;
  const cap = (0.12 + o.jump) * (0.45 + 0.55 * o.pop) * popEff;       // the board can rise only as high as the pop carries it
  const comBase = 0.98, frames = [];
  let peakB = 0, outcome;
  for (let t = 0; t <= tLand + 0.45; t += dt) {
    let com, crouch, phase, phi = 0, rearY = 0, ffoot = 0.1, feetUp = 0;
    if (t < tp) { const u = t / tp; crouch = ease(u) * 0.9; com = comBase - 0.3 * crouch; phase = "crouch"; ffoot = 0.1; }
    else if (t < tLand) {
      const tt = t - tp; com = comBase - 0.27 + v0 * tt - 0.5 * G * tt * tt; crouch = 0.9 - clamp(tt / 0.12, 0, 1) * 0.5 + clamp((tt - flight * 0.35) / 0.1, 0, 1) * 0.45 - clamp((tt - flight * 0.7) / 0.1, 0, 1) * 0.2;
      // the board: snap up about the back wheels, then the slide levels it while it rises
      const snap = clamp(tt / 0.05, 0, 1);
      const sl = t >= slideAt ? clamp((t - slideAt) / 0.13, 0, 1) : 0;
      phi = alphaMax * snap * (1 - ease(sl) * (o.slide === "none" ? 0 : 1));
      if (o.slide === "none") phi = alphaMax * snap * (1 - clamp((tt - 0.15) / 0.5, 0, 0.55));
      if (o.slide === "early") phi *= 0.5;
      const rise = Math.min(cap, Math.max(0, com - (comBase - 0.27)) * 0.95);
      rearY = rise * clamp((tt - 0.02) / 0.06, 0, 1);
      ffoot = 0.1 + 0.2 * ease(sl);
      feetUp = rearY;
      phase = tt < 0.05 ? "pop" : sl > 0 && sl < 1 ? "slide" : tt < flight / 2 ? "rise" : "fall";
      if (Math.abs(tt - flight / 2) < flight * 0.12) phase = phi < 6 * DEG ? "level" : "peak";
    } else {
      const tt = t - tLand; com = comBase - 0.27 * clamp(1 - Math.abs(tt - 0.12) / 0.12, 0, 1) - 0.0; crouch = 0.75 * clamp(1 - tt / 0.35, 0, 1) + 0.1;
      phase = "land"; ffoot = 0.3;
      if (o.slide === "late" || o.slide === "none") phi = (o.slide === "none" ? 12 : 9) * DEG * clamp(1 - tt / 0.15, 0, 1);
    }
    // landing pose of the board sets the outcome, read once at the moment of landing
    if (outcome == null && t >= tLand - dt) {
      const f = frames[frames.length - 1];
      const tilt = f ? f.phi / DEG : 0;
      outcome = o.slide === "early" ? "low" : o.slide === "none" ? "tail" : o.slide === "late" ? "tilt" : o.pop < 0.35 ? "low" : tilt < 6 ? "clean" : "tilt";
    }
    peakB = Math.max(peakB, rearY + Math.sin(phi) * 0.18);
    frames.push({ t, com, crouch, phi, rearY, ffoot, feetUp, phase, popping: t >= tp && t < tp + 0.06, sliding: t >= slideAt && t < slideAt + 0.13 && t > tp - 0.1 });
  }
  return { frames, flight, v0, peakB, outcome, tp, alphaMax };
}
let OR = null;
function boardPose(f) {   // the board's center and angle from the back wheel's place and the pitch
  const rx = -BOARD.axle, ry = f.rearY;
  return { cx: rx + Math.cos(f.phi) * BOARD.axle, cy: ry + Math.sin(f.phi) * BOARD.axle, ang: f.phi };
}
function toBoard(p, bx, by) { return [p.cx + Math.cos(p.ang) * bx - Math.sin(p.ang) * by, p.cy + Math.sin(p.ang) * bx + Math.cos(p.ang) * by]; }
function drawOllie(fr) {
  const sc = Math.min(W / 2.2, (H - 70) / 2.25), ox = W / 2, oy = H - 50;
  const X = x => ox + x * sc, Y = y => oy - y * sc;
  ctx.fillStyle = C.ground; ctx.fillRect(0, Y(0), W, H);
  // height marks
  const hstep = 0.1 * sc < FS * 1.15 ? 0.2 : 0.1;
  for (let h = hstep; h <= 0.61; h += hstep) { const y = Y(h); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(-1.05), y); ctx.lineTo(X(-0.62), y); ctx.stroke(); text(num(h * 100, 0) + " cm", X(-1.05), y - 4, { m: .7, c: C.soft }); }
  if (!fr) return;
  const fs = P.frames;
  // every moment, faint (Show every moment)
  if (S.ollie.ghost && P.ran) {
    ctx.save(); ctx.globalAlpha = .18;
    for (let i = 0; i < fs.length; i += 6) { const p = boardPose(fs[i]); ctx.save(); ctx.translate(X(p.cx), Y(p.cy)); ctx.scale(sc, -sc); ctx.rotate(p.ang); drawBoardSide(); ctx.restore(); }
    ctx.restore();
  }
  // path of the center of mass
  if (P.ran) { ctx.save(); ctx.strokeStyle = C.path; ctx.globalAlpha = .6; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]); ctx.beginPath();
    for (let i = 0; i <= P.k; i += 2) { const f = fs[i]; const x = X(0.03), y = Y(f.com + BOARD.deckY); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
  const p = boardPose(fr);
  ctx.save(); ctx.translate(X(0), Y(0)); ctx.scale(sc, -sc);
  ctx.save(); ctx.translate(p.cx, p.cy); ctx.rotate(p.ang); drawBoardSide(); ctx.restore();
  // feet: the back foot on the tail, the front foot sliding toward the nose; lifted a little in the air
  const bfx = -0.31, ffx = fr.ffoot;
  const air = fr.phase !== "crouch" && fr.phase !== "land" && fr.phase !== "pop";
  const fB = toBoard(p, bfx, deckTop(bfx) + (air ? 0.03 : 0)), fF = toBoard(p, ffx, deckTop(ffx) + (air ? 0.02 : 0));
  const hip = [0.0, fr.com + BOARD.deckY - 0.12];
  drawBody(fB, fF, hip, { lean: 0.05, com: [0.03, fr.com + BOARD.deckY], arms: 1 });
  ctx.restore();
  // forces at the pop and the slide
  if (S.ollie.forces) {
    if (fr.popping || (fr.phase === "pop")) {
      const tail = toBoard(p, -BOARD.half, BOARD.deckY);
      arrow(X(tail[0]), Y(tail[1]) - 70, X(tail[0]), Y(tail[1]) - 6, C.force, 5);
      text(L("Back foot snaps the tail down", "El pie de atrás golpea la cola"), X(tail[0]) - 10, Y(tail[1]) - 80, { m: .8, c: C.force, a: "left", bg: C.sky });
      arrow(X(tail[0]) - 18, Y(0) + 2, X(tail[0]) - 18, Y(0) - 56, C.good, 5);
      text(L("Ground pushes back up", "El suelo empuja hacia arriba"), X(tail[0]) - 30, Y(0) + 26, { m: .8, c: C.good, a: "left", bg: C.sky });
      // the turn about the back wheels
      const pr = toBoard(p, -BOARD.axle, 0);
      ctx.save(); ctx.strokeStyle = C.steel; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(pr[0]), Y(pr[1]), 46, -Math.PI * 0.95, -Math.PI * 0.55); ctx.stroke(); ctx.restore();
    }
    if (fr.sliding) {
      const a = toBoard(p, fr.ffoot - 0.05, deckTop(fr.ffoot) + 0.05), b = toBoard(p, fr.ffoot + 0.16, deckTop(fr.ffoot) + 0.08);
      arrow(X(a[0]), Y(a[1]) - 26, X(b[0]), Y(b[1]) - 46, C.friction, 5);
      text(L("Grip tape friction drags the board up", "La lija arrastra la tabla hacia arriba"), Math.min(X(b[0]) + 10, W - 10), Y(b[1]) - 52, { m: .8, c: C.friction, a: X(b[0]) > W * .6 ? "right" : "left", bg: C.sky });
    }
  }
  const PH = { crouch: L("1 · Crouch", "1 · Agáchate"), pop: L("2 · Pop", "2 · Golpe"), slide: L("3 · Slide", "3 · Desliza"), rise: L("4 · Jump", "4 · Salta"), peak: L("5 · Top", "5 · Arriba"), level: L("5 · Level at the top", "5 · Nivelada arriba"), fall: L("6 · Come down", "6 · Baja"), land: L("7 · Land, knees bent", "7 · Aterriza, rodillas dobladas") };
  text(PH[fr.phase] || "", 16, 34, { w: 700, m: 1.05, c: C.steel });
}
function ollieUnder(fr) {
  if (!fr || !OR) return "";
  const p = boardPose(fr), hb = Math.max(0, fr.rearY + Math.sin(p.ang) * 0.18);
  return `<div class="reads">
    <div class="read"><div class="k">${L("Board angle", "Ángulo de la tabla")}</div><div class="v">${num(fr.phi / DEG, 0)}°</div><div class="u">${L("nose up", "nariz arriba")}</div></div>
    <div class="read"><div class="k">${L("Board height", "Altura de la tabla")}</div><div class="v">${num(fr.rearY * 100, 0)}</div><div class="u">cm</div></div>
    <div class="read"><div class="k">${L("In the air", "En el aire")}</div><div class="v">${num(OR.flight, 2)}</div><div class="u">s</div></div>
    <div class="read"><div class="k">${L("Takeoff speed", "Rapidez al saltar")}</div><div class="v">${num(OR.v0, 1)}</div><div class="u">m/s ${L("up", "hacia arriba")}</div></div>
  </div>`;
}
function olliePanel() {
  const o = S.ollie, r = OR, done = P.ran && P.k >= P.frames.length - 1;
  const seg = (k, v, l) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="${String(o[k]) === String(v)}">${l}</button>`;
  const F = Math.round(200 + 600 * o.pop), tq = F * 0.15;
  const OUT = {
    clean: [L("Clean ollie!", "¡Ollie limpio!"), L("The front foot slid just after the pop, so friction pulled the board up and leveled it at the top. You landed with all four wheels together.", "El pie de adelante se deslizó justo después del golpe, así la fricción subió la tabla y la niveló arriba. Aterrizaste con las cuatro ruedas juntas."), "good"],
    tilt: [L("The nose stayed up", "La nariz se quedó arriba"), L("The front foot slid too late, so nothing leveled the board before landing. It came down tail first. Slide sooner: right after the snap.", "El pie de adelante se deslizó tarde, y nada niveló la tabla antes de aterrizar. Cayó primero la cola. Desliza antes: justo después del golpe."), "warn"],
    tail: [L("No slide, no level", "Sin deslizar, no se nivela"), L("Without the front foot's slide, the board just turns about its back wheels and falls back on its tail. The slide is what lifts the back of the board and levels it.", "Sin el deslizamiento del pie de adelante, la tabla solo gira sobre las ruedas de atrás y cae sobre la cola. El deslizamiento levanta la parte de atrás y la nivela."), "warn"],
    low: [L("A low ollie", "Un ollie bajo"), o.slide === "early" ? L("The front foot slid before the pop, so its weight held the nose down while the tail snapped. Snap first, then slide.", "El pie de adelante se deslizó antes del golpe, y su peso sujetó la nariz mientras la cola golpeaba. Primero golpea, luego desliza.") : L("A soft snap turns the board only a little, so it cannot rise far. Snap the tail quickly and hard.", "Un golpe suave gira poco la tabla, así que no puede subir mucho. Golpea la cola rápido y fuerte."), "warn"]
  };
  const out = r && OUT[r.outcome];
  return `<p class="kicker">${L("Room 2 · Levers and friction", "Sala 2 · Palancas y fricción")}</p>
  <h2>${L("The ollie", "El ollie")}</h2>
  <p class="say">${L("The ollie is the jump under almost every trick. Set the snap, the slide and the jump, press Go, then step through it with ◀ ▶.", "El ollie es el salto debajo de casi todos los trucos. Elige el golpe, el deslizamiento y el salto, pulsa Ir y luego avanza paso a paso con ◀ ▶.")}</p>
  <div class="ctl"><label for="oP">${L("Snap of the tail", "Golpe de la cola")} <output>${num(o.pop * 100, 0)}%</output></label><input type="range" id="oP" min="0.2" max="1" step="0.05" value="${o.pop}"></div>
  <div class="ctl"><span class="lab">${L("When the front foot slides", "Cuándo se desliza el pie de adelante")}</span><div class="seg">${seg("slide", "early", L("Too early", "Muy pronto"))}${seg("slide", "on", L("Right after the snap", "Justo después del golpe"))}${seg("slide", "late", L("Too late", "Muy tarde"))}${seg("slide", "none", L("No slide", "Sin deslizar"))}</div></div>
  <div class="ctl"><label for="oJ">${L("How high you jump", "Qué tan alto saltas")} <output>${num(o.jump * 100, 0)} cm</output></label><input type="range" id="oJ" min="0.1" max="0.5" step="0.02" value="${o.jump}"></div>
  <div class="ctl"><span class="lab">${L("Show", "Mostrar")}</span><div class="seg">${seg("forces", !o.forces, o.forces ? L("Forces: on", "Fuerzas: sí") : L("Forces: off", "Fuerzas: no"))}${seg("ghost", !o.ghost, o.ghost ? L("Every moment: on", "Cada momento: sí") : L("Every moment: off", "Cada momento: no"))}</div></div>
  ${done && out ? `<div class="note ${out[2]}"><b>${out[0]}</b><br>${out[1]}</div>` : ""}
  <div class="math">${L("Torque on the tail (example)", "Torque en la cola (ejemplo)")}:
τ = ${L("force", "fuerza")} × ${L("distance from the back wheels", "distancia a las ruedas de atrás")}
τ = ${F} N × 0.15 m = ${num(tq, 0)} N·m

${L("Time in the air for a jump of height h", "Tiempo en el aire para un salto de altura h")}:
t = 2·√(2h / g) = 2·√(2 × ${num(o.jump + 0.12, 2)} / 9.8) = ${num(r ? r.flight : 0, 2)} s</div>
  <details class="more"><summary>${L("The science", "La ciencia")}</summary>
   <p>${L("The board is a lever. The back wheels are the pivot. When the back foot snaps the tail down, the ground pushes back up on the tail (Newton's third law), and the board turns: the nose rises.", "La tabla es una palanca. Las ruedas de atrás son el pivote. Cuando el pie de atrás golpea la cola, el suelo empuja la cola hacia arriba (tercera ley de Newton) y la tabla gira: la nariz sube.")}</p>
   <p>${L("Grip tape is rough like sandpaper. As the front foot slides up toward the nose, friction drags the board upward and turns it back to level. Then the rider lifts both knees so the board has room to rise.", "La lija es áspera. Cuando el pie de adelante se desliza hacia la nariz, la fricción arrastra la tabla hacia arriba y la vuelve a nivelar. Luego el patinador sube las rodillas para que la tabla tenga espacio.")}</p>
   <p>${L("Your center of mass flies in a curve called a parabola. Bending your knees as you land spreads the stop over more time, so the force on your legs is smaller.", "Tu centro de masa vuela en una curva llamada parábola. Doblar las rodillas al aterrizar reparte la parada en más tiempo, y la fuerza en tus piernas es menor.")}</p>
  </details>`;
}
function ollieWire() {
  const o = S.ollie;
  document.querySelectorAll("#panel [data-k]").forEach(b => b.onclick = () => { const k = b.getAttribute("data-k"), v = b.getAttribute("data-v"); o[k] = v === "true" ? true : v === "false" ? false : v; save(); if (k === "forces" || k === "ghost") { panel(); paint(); } else ollieReset(); });
  $("oP").oninput = e => { o.pop = +e.target.value; e.target.previousElementSibling.querySelector("output").textContent = num(o.pop * 100, 0) + "%"; save(); ollieReset(true); };
  $("oJ").oninput = e => { o.jump = +e.target.value; e.target.previousElementSibling.querySelector("output").textContent = num(o.jump * 100, 0) + " cm"; save(); ollieReset(true); };
  $("oP").onchange = $("oJ").onchange = () => panel();
}
function ollieReset(quiet) { OR = simOllie(S.ollie); setRun(OR.frames, 1 / 120); if (!quiet) panel(); paint(); }

/* ══ ROOM 3 — grinds and slides ═════════════════════════════════════════════════════════════════════
   On a level rail or ledge, kinetic friction f = μN = μmg slows the board at a = μg (mass cancels).
   Distance to a stop d = v² / (2μg); speed at the end of a rail of length ℓ: √(v² − 2μgℓ). */
const SURF = {
  metal: { en: "Metal rail", es: "Barandal de metal", mu: { fifty: 0.25, five: 0.25, board: 0.2 } },
  wax: { en: "Waxed ledge", es: "Bordillo con cera", mu: { fifty: 0.12, five: 0.12, board: 0.1 } },
  paint: { en: "Painted ledge, no wax", es: "Bordillo pintado, sin cera", mu: { fifty: 0.3, five: 0.3, board: 0.28 } },
  concrete: { en: "Rough concrete", es: "Concreto áspero", mu: { fifty: 0.5, five: 0.5, board: 0.45 } }
};
const GTRICK = {
  fifty: { en: "50-50 (both trucks)", es: "50-50 (los dos ejes)" },
  five: { en: "5-0 (back truck only)", es: "5-0 (solo el eje de atrás)" },
  board: { en: "Boardslide (middle of the deck)", es: "Boardslide (el centro de la tabla)" }
};
let GR = null;
function simGrind(o) {
  const mu = SURF[o.surface].mu[o.trick], a = mu * G, dt = 1 / 60, frames = [];
  const pre = 1.2, post = 1.2;
  let x = -pre, v = o.v, t = 0, heat = 0, stopped = false;
  while (t < 12) {
    const on = x >= 0 && x <= o.len;
    if (on && v > 0) { const v2 = Math.max(0, v - a * dt); heat += 0.5 * o.mass * (v * v - v2 * v2); x += (v + v2) / 2 * dt; v = v2; if (v === 0) stopped = true; }
    else x += v * dt;
    frames.push({ t, x, v, on: x >= 0 && x <= o.len, heat, stopped });
    t += dt;
    if (stopped && frames.length > 40 && frames[frames.length - 40].stopped) break;
    if (x > o.len + post) break;
  }
  const d = o.v * o.v / (2 * a), exit = o.v * o.v - 2 * a * o.len;
  return { frames, mu, a, d, vExit: exit > 0 ? Math.sqrt(exit) : 0, makes: exit > 0 };
}
function drawGrind(fr) {
  const o = S.grind;
  const span = o.len + 2.8, sc = Math.min((W - 60) / span, (H - 230) / 1.25), ox = 30 + 1.4 * sc, oy = H - 200;
  const X = x => ox + x * sc, Y = y => oy - y * sc;
  const rh = 0.35;   // rail or ledge height
  ctx.fillStyle = C.ground; ctx.fillRect(0, Y(0), W, H - Y(0));
  // the obstacle
  if (o.surface === "metal") {
    ctx.strokeStyle = C.truck; ctx.lineWidth = 0.04 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(X(0), Y(rh)); ctx.lineTo(X(o.len), Y(rh)); ctx.stroke();
    ctx.lineWidth = 0.035 * sc; [0.15, o.len - 0.15].forEach(x => { ctx.beginPath(); ctx.moveTo(X(x), Y(rh)); ctx.lineTo(X(x), Y(0)); ctx.stroke(); });
  } else {
    ctx.fillStyle = C.ramp; ctx.fillRect(X(0), Y(rh), o.len * sc, rh * sc);
    ctx.strokeStyle = o.surface === "wax" ? C.ke : C["ramp-edge"]; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(X(0), Y(rh)); ctx.lineTo(X(o.len), Y(rh)); ctx.stroke();
  }
  text(L(SURF[o.surface].en, SURF[o.surface].es) + " · μ ≈ " + num(GR.mu, 2), X(o.len / 2), Y(0) + 30, { a: "center", m: .8, c: C.soft });
  // the stop distance marker (where friction alone would stop you)
  if (GR.d < o.len + 1.4) { const top = Math.max(FS * 1.6, Y(rh + 2.05)); ctx.save(); ctx.strokeStyle = C.heat; ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(GR.d), top + 6); ctx.lineTo(X(GR.d), Y(rh) + 10); ctx.stroke(); ctx.restore(); text(L("would stop here", "pararía aquí"), clamp(X(GR.d), 90, W - 90), top, { a: "center", m: .8, c: C.heat, bg: C.sky }); }
  if (fr) {
    // the warm streak where energy turned into heat
    if (fr.x > 0) { ctx.save(); ctx.strokeStyle = C.heat; ctx.globalAlpha = .55; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X(0), Y(rh) - 3); ctx.lineTo(X(Math.min(fr.x, o.len)), Y(rh) - 3); ctx.stroke(); ctx.restore(); }
    const onIt = fr.x >= -0.05 && fr.x <= o.len + 0.05, base = onIt ? rh : 0;
    const tilt = o.trick === "five" && onIt ? 7 * DEG : 0;
    ctx.save(); ctx.translate(X(fr.x), Y(base - (onIt ? (o.trick === "board" ? BOARD.deckY : BOARD.wheelR + 0.01) : 0))); ctx.scale(sc, -sc); ctx.rotate(tilt);
    if (o.trick === "board" && onIt) {   // the deck sits across the rail: seen end-on from the side
      ctx.fillStyle = C.deck; ctx.fillRect(-0.105, BOARD.deckY - BOARD.thick / 2, 0.21, BOARD.thick);
      ctx.fillStyle = C.grip; ctx.fillRect(-0.105, BOARD.deckY + BOARD.thick / 2 - 0.004, 0.21, 0.004);
      ctx.fillStyle = C.wheel; [-0.08, 0.08].forEach(x => { ctx.beginPath(); ctx.arc(x, BOARD.wheelR, BOARD.wheelR, 0, 7); ctx.fill(); });
      drawBody([-0.13, deckTop(0)], [0.13, deckTop(0)], [0, deckTop(0) + 0.6], { lean: -0.12, com: [0, deckTop(0) + 0.72], arms: 1 });
    } else drawRider(0.45, { lean: o.trick === "five" ? -0.05 : 0.04 });
    ctx.restore();
    if (onIt && fr.v > 0) {
      const x = X(fr.x), y = Y(rh);
      arrow(x - 4, y - 8, x - 4 - 40 - 80 * GR.mu, y - 8, C.friction, 4);
      text(L("friction", "fricción"), x - 50 - 80 * GR.mu, y - 18, { a: "right", m: .75, c: C.friction, bg: C.sky });
    }
  }
  // speed against distance, under the drawing
  const gx = 50, gy = H - 24, gw = W - 80, gh = 120, vmax = 6;
  const GX = x => gx + (x + 1.2) / span * gw, GY = v => gy - v / vmax * gh;
  ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
  text(L("speed (m/s)", "rapidez (m/s)"), gx + 6, gy - gh + 2, { m: .7, c: C.soft, b: "top" });
  text(L("distance (m)", "distancia (m)"), gx + gw, gy - 6, { m: .7, c: C.soft, a: "right" });
  ctx.save(); ctx.strokeStyle = C.line; ctx.setLineDash([4, 4]); [0, o.len].forEach(x => { ctx.beginPath(); ctx.moveTo(GX(x), gy); ctx.lineTo(GX(x), gy - gh); ctx.stroke(); }); ctx.restore();
  if (fr) { const fs = P.frames; ctx.strokeStyle = C.ke; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= P.k; i++) { const f = fs[i]; i ? ctx.lineTo(GX(f.x), GY(f.v)) : ctx.moveTo(GX(f.x), GY(f.v)); } ctx.stroke();
    ctx.fillStyle = C.ke; ctx.beginPath(); ctx.arc(GX(fr.x), GY(fr.v), 6, 0, 7); ctx.fill(); }
}
function grindUnder(fr) {
  if (!fr) return "";
  return `<div class="reads">
    <div class="read"><div class="k">${L("Speed", "Rapidez")}</div><div class="v">${num(fr.v, 2)}</div><div class="u">m/s</div></div>
    <div class="read"><div class="k">${L("On the rail", "En el barandal")}</div><div class="v">${num(clamp(fr.x, 0, S.grind.len), 2)}</div><div class="u">m ${L("of", "de")} ${num(S.grind.len, 1)}</div></div>
    <div class="read"><div class="k">${L("Slowing", "Frenado")}</div><div class="v">${num(GR.a, 2)}</div><div class="u">m/s²</div></div>
    <div class="read"><div class="k">${L("Turned to heat", "Convertido en calor")}</div><div class="v">${num(fr.heat, 0)}</div><div class="u">J</div></div>
  </div>`;
}
function grindPanel() {
  const o = S.grind, r = GR, done = P.ran && P.k >= P.frames.length - 1;
  const seg = (k, v, l) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="${String(o[k]) === String(v)}">${l}</button>`;
  return `<p class="kicker">${L("Room 3 · Friction", "Sala 3 · Fricción")}</p>
  <h2>${L("Grinds and slides", "Grinds y slides")}</h2>
  <p class="say">${L("A grind is the trucks scraping along an edge; a slide is the wood of the deck. Friction slows you the whole way. Will you reach the end?", "Un grind es raspar los ejes por un borde; un slide es raspar la madera de la tabla. La fricción te frena todo el camino. ¿Llegarás al final?")}</p>
  <div class="ctl"><label for="gS">${L("Surface", "Superficie")}</label><select class="sel" id="gS">${Object.keys(SURF).map(k => `<option value="${k}" ${o.surface === k ? "selected" : ""}>${L(SURF[k].en, SURF[k].es)}</option>`).join("")}</select></div>
  <div class="ctl"><span class="lab">${L("Trick", "Truco")}</span><div class="seg">${Object.keys(GTRICK).map(k => seg("trick", k, L(GTRICK[k].en, GTRICK[k].es))).join("")}</div></div>
  <div class="ctl"><label for="gV">${L("Speed when you lock in", "Rapidez al entrar")} <output>${num(o.v, 1)} m/s</output></label><input type="range" id="gV" min="1" max="6" step="0.1" value="${o.v}"></div>
  <div class="ctl"><label for="gL">${L("Length of the rail", "Largo del barandal")} <output>${num(o.len, 1)} m</output></label><input type="range" id="gL" min="1" max="6" step="0.1" value="${o.len}"></div>
  <div class="ctl"><label for="gM">${L("Rider's mass", "Masa del patinador")} <output>${o.mass} kg</output></label><input type="range" id="gM" min="20" max="110" step="5" value="${o.mass}"></div>
  ${done ? `<div class="note ${r.makes ? "good" : "warn"}">${r.makes ? `<b>${L("You reach the end", "Llegas al final")}</b><br>${L("You leave the rail at", "Sales del barandal a")} ${num(r.vExit, 2)} m/s.` : `<b>${L("You stop on the rail", "Te detienes en el barandal")}</b><br>${L("Friction stops you after", "La fricción te detiene después de")} ${num(r.d, 2)} m. ${L("Come in faster, or wax the edge.", "Entra más rápido o pon cera en el borde.")}`}</div>` : ""}
  <div class="math">${L("Friction on a level rail", "Fricción en un barandal plano")}: f = μ·m·g
${L("Slowing", "Frenado")}: a = f / m = μ·g = ${num(r.mu, 2)} × 9.8 = ${num(r.a, 2)} m/s²
${L("Distance to stop", "Distancia para parar")}: d = v² / (2·μ·g)
d = ${num(o.v, 1)}² / (2 × ${num(r.a, 2)}) = ${num(r.d, 2)} m</div>
  <p class="hint muted">${L("Friction values here are examples. Real ones depend on wax, paint, wear and temperature.", "Los valores de fricción son ejemplos. Los reales dependen de la cera, la pintura, el desgaste y la temperatura.")}</p>
  <details class="more"><summary>${L("The science", "La ciencia")}</summary>
   <p>${L("Change the rider's mass: the distance stays the same. A heavier rider presses harder, so friction is bigger, but there is also more mass to slow down. The two cancel.", "Cambia la masa: la distancia no cambia. Un patinador más pesado aprieta más, así que hay más fricción, pero también más masa que frenar. Las dos cosas se cancelan.")}</p>
   <p>${L("A 5-0 rides on one truck and a 50-50 on two. In this simple model the slowing is the same: friction depends on how hard you press and on the two materials, not on how much of the board touches.", "Un 5-0 va sobre un eje y un 50-50 sobre dos. En este modelo simple el frenado es igual: la fricción depende de cuánto aprietas y de los dos materiales, no de cuánta tabla toca.")}</p>
   <p>${L("Wax makes the coefficient of friction μ smaller. Double your speed and you go four times as far, because the distance grows with v².", "La cera hace más pequeño el coeficiente de fricción μ. Duplica la rapidez y llegas cuatro veces más lejos, porque la distancia crece con v².")}</p>
   <p>${L("Learn grinds on a low curb or a flat bar, with a helmet and pads, before anything higher.", "Aprende grinds en un bordillo bajo o una barra plana, con casco y protecciones, antes de algo más alto.")}</p>
  </details>`;
}
function grindWire() {
  const o = S.grind;
  document.querySelectorAll("#panel [data-k]").forEach(b => b.onclick = () => { o[b.getAttribute("data-k")] = b.getAttribute("data-v"); save(); grindReset(); });
  $("gS").onchange = e => { o.surface = e.target.value; save(); grindReset(); };
  [["gV", "v", 1, " m/s"], ["gL", "len", 1, " m"], ["gM", "mass", 0, " kg"]].forEach(([id, k, d, u]) => {
    $(id).oninput = e => { o[k] = +e.target.value; e.target.previousElementSibling.querySelector("output").textContent = num(o[k], d) + u; save(); grindReset(true); };
    $(id).onchange = () => panel();
  });
}
function grindReset(quiet) { GR = simGrind(S.grind); setRun(GR.frames, 1 / 60); if (!quiet) panel(); paint(); }

/* ══ ROOM 4 — balance and turning ═══════════════════════════════════════════════════════════════════
   Standing: the board rests on two axles; your weight's line must fall between them (or you tip onto the tail
   or nose: a manual balances right over one axle). Turning: tilting the deck turns the trucks. With a pivot at
   45°, the wheels steer by about the tilt: tan δ = tan φ · tan 45°. Radius R = wheelbase / (2·tan δ).
   A lean θ balances a turn when tan θ = v² / (g·R). */
const TRUCKS = { loose: { max: 15, en: "Loose", es: "Sueltos" }, med: { max: 11, en: "Medium", es: "Medios" }, tight: { max: 7, en: "Tight", es: "Duros" } };
const WB = 0.36;   // wheelbase, m (between the axles)
function balanceCalc() {
  const o = S.balance, tr = TRUCKS[o.truck];
  const phi = Math.min(o.lean, tr.max) * DEG, delta = Math.atan(Math.tan(phi));
  const R = phi > 0.001 ? WB / (2 * Math.tan(delta)) : Infinity;
  const need = isFinite(R) ? Math.atan(o.v * o.v / (G * R)) : 0;
  const vbal = isFinite(R) ? Math.sqrt(G * R * Math.tan(o.lean * DEG)) : 0;
  return { phi, delta, R, need, vbal, a: isFinite(R) ? o.v * o.v / R : 0, capped: o.lean > tr.max };
}
function standCalc() {
  const x = S.balance.com;   // center of mass along the board, m (+ toward the nose)
  const ax = BOARD.axle;
  let tilt = 0, state = "steady";
  if (x < -ax - 0.03) { state = "tail"; tilt = Math.asin((BOARD.deckY + 0.03) / (BOARD.half - ax)); }
  else if (x < -ax + 0.005) { state = "manual"; tilt = clamp((-ax - x + 0.005) / 0.035, 0, 1) * 9 * DEG; }
  else if (x > ax + 0.03) { state = "nose"; tilt = -Math.asin((BOARD.deckY + 0.03) / (BOARD.half - ax)); }
  else if (x > ax - 0.005) { state = "nosemanual"; tilt = -clamp((x - ax + 0.005) / 0.035, 0, 1) * 9 * DEG; }
  return { x, tilt, state };
}
function drawBalance() {
  const o = S.balance;
  if (o.mode === "stand") {
    const sc = Math.min(W / 1.5, (H - 90) / 1.75), ox = W / 2, oy = H - 60;
    const X = x => ox + x * sc, Y = y => oy - y * sc;
    ctx.fillStyle = C.ground; ctx.fillRect(0, Y(0), W, H);
    const st = standCalc(), piv = st.tilt > 0 ? -BOARD.axle : st.tilt < 0 ? BOARD.axle : 0;
    // base of support between the axles
    ctx.save(); ctx.fillStyle = C.good; ctx.globalAlpha = .25; ctx.fillRect(X(-BOARD.axle), Y(0) - 6, 2 * BOARD.axle * sc, 12); ctx.restore();
    text(L("base of support", "base de apoyo"), X(0), Y(0) + 30, { a: "center", m: .8, c: C.good });
    ctx.save(); ctx.translate(X(piv), Y(0)); ctx.scale(sc, -sc); ctx.rotate(st.tilt); ctx.translate(-piv, 0);
    const fb = -0.2, ff = 0.13, hipx = st.x - 0.02;
    drawBoardSide();
    drawBody([fb, deckTop(fb)], [ff, deckTop(ff)], [hipx, deckTop(0) + 0.76], { lean: 0, arms: 1 });
    ctx.restore();
    // the line of the weight, straight down from the center of mass
    const cx = X(piv + (st.x - piv) * Math.cos(st.tilt) - (deckTop(0) + 0.88) * Math.sin(st.tilt)), cy = Y((st.x - piv) * Math.sin(st.tilt) + (deckTop(0) + 0.88) * Math.cos(st.tilt));
    ctx.save(); ctx.strokeStyle = C.force; ctx.setLineDash([8, 6]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, Y(0)); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, -sc); drawCOM(0, 0, 0.05); ctx.restore();
    arrow(cx, cy + 22, cx, cy + 90, C.force, 4);
    const lab = { steady: L("Steady on four wheels", "Firme sobre cuatro ruedas"), manual: L("Manual: balanced on the back wheels", "Manual: equilibrio en las ruedas de atrás"), tail: L("Too far back: the tail hits the ground", "Muy atrás: la cola toca el suelo"), nosemanual: L("Nose manual: balanced on the front wheels", "Nose manual: equilibrio en las ruedas de adelante"), nose: L("Too far forward: the nose hits the ground", "Muy adelante: la nariz toca el suelo") }[st.state];
    text(lab, 16, 34, { w: 700, m: 1.05, c: st.state === "steady" ? C.good : st.state.indexOf("manual") >= 0 ? C.steel : C.warn });
    return;
  }
  // turning: the front view (looking along the board) on the left, the path from above on the right
  const b = balanceCalc(), half = W * 0.5;
  const sc = Math.min(half / 1.25, (H - 80) / 1.9), ox = half * 0.5, oy = H - 50;
  const X = x => ox + x * sc, Y = y => oy - y * sc;
  ctx.fillStyle = C.ground; ctx.fillRect(0, Y(0), half, H);
  text(L("From the front", "De frente"), 16, 32, { w: 700, c: C.soft, m: .85 });
  const th = S.balance.lean * DEG;
  ctx.save(); ctx.translate(X(0), Y(0)); ctx.scale(sc, -sc);
  // wheels stay on the ground; the deck tilts by φ about the trucks
  ctx.fillStyle = C.wheel; [-0.095, 0.095].forEach(x => { ctx.fillRect(x - 0.02, 0, 0.04, 0.054); });
  ctx.fillStyle = C.truck; ctx.fillRect(-0.1, 0.045, 0.2, 0.018);
  ctx.save(); ctx.translate(0, 0.075); ctx.rotate(-b.phi); ctx.fillStyle = C.deck; ctx.fillRect(-0.105, 0, 0.21, 0.014); ctx.fillStyle = C.grip; ctx.fillRect(-0.105, 0.014, 0.21, 0.004); ctx.restore();
  // the rider leans by θ (toward the inside of the turn, drawn to the right)
  ctx.save(); ctx.translate(0, 0.09); ctx.rotate(-th);
  ctx.strokeStyle = C.pants; ctx.lineWidth = 0.075; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-0.06, 0); ctx.lineTo(-0.04, 0.42); ctx.lineTo(0, 0.82); ctx.moveTo(0.06, 0); ctx.lineTo(0.04, 0.42); ctx.lineTo(0, 0.82); ctx.stroke();
  ctx.strokeStyle = C.shirt; ctx.lineWidth = 0.15; ctx.beginPath(); ctx.moveTo(0, 0.84); ctx.lineTo(0, 1.32); ctx.stroke();
  ctx.lineWidth = 0.055; ctx.beginPath(); ctx.moveTo(0, 1.3); ctx.lineTo(-0.3, 1.12); ctx.moveTo(0, 1.3); ctx.lineTo(0.3, 1.12); ctx.stroke();
  ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, 1.48, 0.1, 0, 7); ctx.fill();
  ctx.fillStyle = C.steel; ctx.beginPath(); ctx.arc(0, 1.49, 0.112, 0.05, Math.PI - 0.05); ctx.closePath(); ctx.fill();
  drawCOM(0, 0.95, 0.05);
  ctx.restore();
  ctx.restore();
  // forces: weight down from the center of mass; the ground's push along the needed direction
  const cxm = X(Math.sin(th) * 0.86), cym = Y(0.09 + Math.cos(th) * 0.86);
  arrow(cxm, cym + 18, cxm, cym + 90, C.force, 4);
  const nd = b.need;
  arrow(X(0), Y(0), X(0) + Math.sin(nd) * 150, Y(0) - Math.cos(nd) * 150, C.good, 4);
  text(L("needed lean", "inclinación necesaria"), X(0) + Math.sin(nd) * 150 + 8, Y(0) - Math.cos(nd) * 150, { m: .75, c: C.good, bg: C.sky });
  // from above: the circle the board draws
  ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(half, 12); ctx.lineTo(half, H - 12); ctx.stroke();
  text(L("From above", "Desde arriba"), half + 16, 32, { w: 700, c: C.soft, m: .85 });
  const R = b.R, cx2 = half + half * 0.5, cy2 = H * 0.56, maxR = Math.min(half * 0.42, H * 0.38);
  const ps = isFinite(R) ? maxR / Math.max(R, 1.6) : 0;
  if (isFinite(R)) {
    ctx.save(); ctx.strokeStyle = C.path; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.arc(cx2, cy2, R * ps, 0, 7); ctx.stroke(); ctx.restore();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, 7); ctx.fill();
    ctx.strokeStyle = C.soft; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + R * ps, cy2); ctx.stroke();
    text("R = " + num(R, 2) + " m", cx2 + R * ps / 2, cy2 - 10, { a: "center", m: .85, bg: C.sky });
    // the board on the circle, seen from above
    ctx.save(); ctx.translate(cx2 + R * ps, cy2); ctx.rotate(-Math.PI / 2); const bs = ps * 1;
    ctx.fillStyle = C.deck; roundRect(-0.4 * bs, -0.1 * bs, 0.8 * bs, 0.2 * bs, 0.1 * bs); ctx.fill(); ctx.restore();
    arrow(cx2 + R * ps - 12, cy2, cx2 + R * ps - 12 - 50, cy2, C.good, 3);
    text(L("toward the center", "hacia el centro"), cx2 + R * ps - 70, cy2 + 26, { a: "right", m: .7, c: C.good, bg: C.sky });
  } else text(L("Straight line: no lean, no turn", "Línea recta: sin inclinar, sin girar"), cx2, cy2, { a: "center", m: .9, c: C.soft });
}
function balanceUnder() {
  const o = S.balance;
  if (o.mode === "stand") {
    const st = standCalc();
    return `<div class="reads"><div class="read"><div class="k">${L("Center of mass", "Centro de masa")}</div><div class="v">${num(st.x * 100, 0)}</div><div class="u">cm ${L("from the middle", "del centro")}</div></div>
      <div class="read"><div class="k">${L("Back wheels at", "Ruedas de atrás en")}</div><div class="v">${num(-BOARD.axle * 100, 0)}</div><div class="u">cm</div></div>
      <div class="read"><div class="k">${L("Front wheels at", "Ruedas de adelante en")}</div><div class="v">+${num(BOARD.axle * 100, 0)}</div><div class="u">cm</div></div></div>`;
  }
  const b = balanceCalc();
  return `<div class="reads">
    <div class="read"><div class="k">${L("Deck tilt", "Inclinación de la tabla")}</div><div class="v">${num(b.phi / DEG, 0)}°</div><div class="u">${b.capped ? L("trucks at their limit", "ejes al límite") : L("follows your lean", "sigue tu inclinación")}</div></div>
    <div class="read"><div class="k">${L("Turn radius", "Radio de giro")}</div><div class="v">${isFinite(b.R) ? num(b.R, 2) : "∞"}</div><div class="u">m</div></div>
    <div class="read"><div class="k">${L("Lean needed", "Inclinación necesaria")}</div><div class="v">${num(b.need / DEG, 0)}°</div><div class="u">${L("at this speed", "a esta rapidez")}</div></div>
    <div class="read"><div class="k">${L("Balanced speed", "Rapidez de equilibrio")}</div><div class="v">${num(b.vbal, 1)}</div><div class="u">m/s</div></div>
  </div>`;
}
function balancePanel() {
  const o = S.balance;
  const seg = (k, v, l) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="${String(o[k]) === String(v)}">${l}</button>`;
  let body;
  if (o.mode === "stand") {
    const st = standCalc();
    const say = { steady: L("Your center of mass is between the axles, inside the base of support. The board stays flat.", "Tu centro de masa está entre los ejes, dentro de la base de apoyo. La tabla queda plana."),
      manual: L("Your center of mass is right over the back axle. That is a manual: the front wheels lift, and tiny shifts keep you there.", "Tu centro de masa está justo sobre el eje de atrás. Eso es un manual: las ruedas de adelante suben y pequeños movimientos te mantienen ahí."),
      nosemanual: L("Your center of mass is right over the front axle: a nose manual.", "Tu centro de masa está justo sobre el eje de adelante: un nose manual."),
      tail: L("Your weight's line falls behind the back wheels. Your weight turns the board about those wheels until the tail scrapes. Shift a little forward.", "La línea de tu peso cae detrás de las ruedas de atrás. Tu peso gira la tabla sobre esas ruedas hasta que la cola raspa. Muévete un poco adelante."),
      nose: L("Your weight's line falls in front of the front wheels, so the nose drops. Shift back.", "La línea de tu peso cae delante de las ruedas de adelante y la nariz baja. Muévete atrás.") }[st.state];
    body = `<div class="ctl"><label for="bC">${L("Shift your weight", "Mueve tu peso")} <output>${num(o.com * 100, 0)} cm</output></label><input type="range" id="bC" min="-0.26" max="0.26" step="0.005" value="${o.com}">
      <p class="hint">${L("Left: toward the tail. Right: toward the nose.", "Izquierda: hacia la cola. Derecha: hacia la nariz.")}</p></div>
      <div class="note ${st.state === "steady" ? "good" : st.state.indexOf("manual") >= 0 ? "" : "warn"}">${say}</div>
      <div class="math">${L("Turning effect of your weight about the back wheels", "Efecto de giro de tu peso sobre las ruedas de atrás")}:
τ = m·g × ${L("distance", "distancia")}
${L("Over the axle the distance is 0, so the turning stops: that is the balance point.", "Sobre el eje la distancia es 0 y el giro para: ese es el punto de equilibrio.")}</div>
      <details class="more"><summary>${L("The science", "La ciencia")}</summary>
       <p>${L("You balance when the line straight down from your center of mass falls inside your base of support. On a skateboard the support is the four wheels, so the safe zone runs from the back axle to the front axle.", "Te equilibras cuando la línea recta hacia abajo desde tu centro de masa cae dentro de tu base de apoyo. En una patineta el apoyo son las cuatro ruedas, así que la zona segura va del eje de atrás al de adelante.")}</p>
       <p>${L("Bent knees lower your center of mass, so small bumps tip you less. Feet over the bolts give a wide, steady base.", "Las rodillas dobladas bajan tu centro de masa, y los baches te mueven menos. Los pies sobre los tornillos dan una base ancha y firme.")}</p></details>`;
  } else {
    const b = balanceCalc(), diff = (o.lean * DEG - b.need) / DEG;
    const st = Math.abs(diff) < 1.5 ? ["good", L("Balanced: your lean matches the turn.", "En equilibrio: tu inclinación coincide con el giro.")] : diff > 0 ? ["warn", L("You lean more than this speed needs: you would tip to the inside. Go a little faster or lean less.", "Te inclinas más de lo que pide esta rapidez: caerías hacia adentro. Ve un poco más rápido o inclínate menos.")] : ["warn", L("You lean less than this speed needs: the turn would push you to the outside. Lean more or slow down.", "Te inclinas menos de lo que pide esta rapidez: el giro te empujaría hacia afuera. Inclínate más o frena.")];
    body = `<div class="ctl"><label for="bL">${L("Your lean", "Tu inclinación")} <output>${o.lean}°</output></label><input type="range" id="bL" min="0" max="25" step="1" value="${o.lean}"></div>
      <div class="ctl"><label for="bV">${L("Speed", "Rapidez")} <output>${num(o.v, 1)} m/s</output></label><input type="range" id="bV" min="0.5" max="8" step="0.1" value="${o.v}"></div>
      <div class="ctl"><span class="lab">${L("Trucks (bushings)", "Ejes (gomas)")}</span><div class="seg">${Object.keys(TRUCKS).map(k => seg("truck", k, L(TRUCKS[k].en, TRUCKS[k].es) + " · " + TRUCKS[k].max + "°")).join("")}</div></div>
      <div class="note ${st[0]}">${st[1]}</div>
      <div class="math">${L("Deck tilt → steer (pivot at 45°)", "Inclinación → giro (pivote a 45°)")}: δ ≈ φ = ${num(b.phi / DEG, 0)}°
${L("Radius", "Radio")}: R = ${L("wheelbase", "distancia entre ejes")} / (2·tan δ) = 0.36 / (2 × ${num(Math.tan(b.delta), 3)}) = ${isFinite(b.R) ? num(b.R, 2) : "∞"} m
${L("Lean that balances", "Inclinación que equilibra")}: tan θ = v² / (g·R) → θ = ${num(b.need / DEG, 1)}°</div>
      <details class="more"><summary>${L("The science", "La ciencia")}</summary>
       <p>${L("A skateboard turns because its trucks are built on a slanted pivot. Press on your toes or heels and the deck tilts; the slanted pivot makes the wheels steer. More tilt, tighter turn. Soft bushings let the deck tilt more.", "Una patineta gira porque sus ejes tienen un pivote inclinado. Presiona con los dedos o los talones y la tabla se inclina; el pivote hace que las ruedas giren. Más inclinación, giro más cerrado. Las gomas blandas dejan inclinar más.")}</p>
       <p>${L("Moving in a circle needs a push toward the center: m·v²/R. The ground's friction gives it. To keep from tipping, you lean in until the ground's push points through your center of mass.", "Moverse en círculo necesita un empuje hacia el centro: m·v²/R. La fricción del suelo lo da. Para no caer, te inclinas hasta que el empuje del suelo apunte a tu centro de masa.")}</p>
       <p>${L("Speed wobble is a fast side-to-side shake at high speed. Riders calm it by bending low, putting more weight on the front foot, and slowing down. Tighter trucks wobble less.", "El speed wobble es un temblor rápido de lado a lado a alta rapidez. Se calma agachándose, poniendo más peso en el pie de adelante y frenando. Los ejes más duros tiemblan menos.")}</p></details>`;
  }
  return `<p class="kicker">${L("Room 4 · Balance", "Sala 4 · Equilibrio")}</p>
  <h2>${L("Balance and turning", "Equilibrio y giros")}</h2>
  <p class="say">${L("Balance is about where your center of mass is. Move it and watch.", "El equilibrio depende de dónde está tu centro de masa. Muévelo y observa.")}</p>
  <div class="ctl"><div class="seg">${seg("mode", "stand", L("Standing and manuals", "De pie y manuals"))}${seg("mode", "turn", L("Turning", "Girar"))}</div></div>${body}`;
}
function balanceWire() {
  const o = S.balance;
  document.querySelectorAll("#panel [data-k]").forEach(b => b.onclick = () => { o[b.getAttribute("data-k")] = b.getAttribute("data-v"); save(); panel(); paint(); });
  const live = (id, k, f) => { const el = $(id); if (!el) return; el.oninput = e => { o[k] = +e.target.value; save(); el.previousElementSibling.querySelector("output").textContent = f(o[k]); paint(); }; el.onchange = () => panel(); };
  live("bC", "com", v => num(v * 100, 0) + " cm"); live("bL", "lean", v => v + "°"); live("bV", "v", v => num(v, 1) + " m/s");
}

/* ══ ROOM 5 — flips and spins (a 3D board) ═════════════════════════════════════════════════════════
   Axes: long (nose to tail) = flips; up-down = shove-its; short (side to side) = impossibles.
   Directions are for a regular rider; goofy mirrors them. */
const FTR = {
  kickflip: { roll: 360, yaw: 0, pitch: 0, en: "Kickflip", es: "Kickflip", how: ["The front foot flicks off the toe-side corner of the nose. The board spins around its long axis.", "El pie de adelante raspa la esquina de la nariz del lado de los dedos. La tabla gira sobre su eje largo."] },
  heelflip: { roll: -360, yaw: 0, pitch: 0, en: "Heelflip", es: "Heelflip", how: ["The front heel kicks off the heel-side edge of the nose. The board spins around its long axis the other way.", "El talón de adelante golpea el borde de la nariz del lado de los talones. La tabla gira sobre su eje largo al revés."] },
  shove: { roll: 0, yaw: 180, pitch: 0, en: "Pop shove-it", es: "Pop shove-it", how: ["The back foot pops and scoops the tail behind you. The board spins flat, half a turn, around the up-down axis.", "El pie de atrás golpea y empuja la cola hacia atrás. La tabla gira plana, media vuelta, sobre el eje vertical."] },
  fsshove: { roll: 0, yaw: -180, pitch: 0, en: "Frontside shove-it", es: "Shove-it frontside", how: ["The back foot scoops the tail in front of you, toward your toes. Half a turn the other way.", "El pie de atrás empuja la cola hacia adelante, hacia tus dedos. Media vuelta al revés."] },
  shove360: { roll: 0, yaw: 360, pitch: 0, en: "360 shove-it", es: "Shove-it 360", how: ["A harder scoop with the back foot: one whole flat turn.", "Un empuje más fuerte con el pie de atrás: una vuelta plana completa."] },
  varial: { roll: 360, yaw: 180, pitch: 0, en: "Varial kickflip", es: "Varial kickflip", how: ["A pop shove-it and a kickflip at once: the back foot scoops while the front foot flicks.", "Un pop shove-it y un kickflip a la vez: el pie de atrás empuja mientras el de adelante raspa."] },
  tre: { roll: 360, yaw: 360, pitch: 0, en: "360 flip (tre flip)", es: "360 flip (tre flip)", how: ["A 360 shove-it and a kickflip at once. The back foot does most of the work with a big scoop.", "Un shove-it 360 y un kickflip a la vez. El pie de atrás hace casi todo con un gran empuje."] },
  impossible: { roll: 0, yaw: 0, pitch: 360, en: "Impossible", es: "Impossible", how: ["The board wraps end over end around the back foot. Rodney Mullen made it famous in the early 1980s.", "La tabla da una vuelta de punta a punta alrededor del pie de atrás. Rodney Mullen la hizo famosa a principios de los años 80."] }
};
const VIEWS = { corner: [35, 22], side: [0, 8], front: [90, 8], above: [25, 62] };
let FR = null;
function simFlip(o) {
  const tr = FTR[o.trick], dt = 1 / 120, frames = [], T = 0.5, pre = 0.12, post = 0.2, hmax = 0.3;
  for (let t = 0; t <= pre + T + post; t += dt) {
    const u = clamp((t - pre) / T, 0, 1), e = ease(clamp((u - 0.08) / 0.8, 0, 1));
    const h = 4 * hmax * u * (1 - u);
    frames.push({ t, u, h, roll: tr.roll * e, yaw: tr.yaw * e, pitch: tr.pitch * e });
  }
  return { frames, T };
}
let BMESH = null;
function boardMesh() {   // a deck outline with kicks, two trucks, four wheels (meters, board frame: x nose, y left, z up)
  if (BMESH) return BMESH;
  const top = [], n = 14, hw = 0.105, len = 0.4;
  // the outline: straight sides, rounded nose and tail
  const out = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; out.push([len - hw + Math.cos(a) * hw, Math.sin(a) * hw]); }
  for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + Math.PI * i / n; out.push([-len + hw + Math.cos(a) * hw, Math.sin(a) * hw]); }
  const z = x => { const ax = Math.abs(x); return 0.085 + (ax > 0.29 ? (ax - 0.29) / 0.11 * 0.035 : 0); };
  BMESH = { out: out.map(p => [p[0], p[1], z(p[0])]), z };
  return BMESH;
}
function rot(p, r) {   // roll about x, pitch about y (through the tail end for impossibles), yaw about z
  let [x, y, z] = p;
  const cr = Math.cos(r.roll * DEG), sr = Math.sin(r.roll * DEG);
  let y1 = y * cr - (z - 0.06) * sr, z1 = y * sr + (z - 0.06) * cr + 0.06; y = y1; z = z1;
  if (r.pitch) { const px = -0.3, cp = Math.cos(r.pitch * DEG), sp = Math.sin(r.pitch * DEG); const x1 = (x - px) * cp - (z - 0.06) * sp + px; z = (x - px) * sp + (z - 0.06) * cp + 0.06; x = x1; }
  const cy = Math.cos(r.yaw * DEG), sy = Math.sin(r.yaw * DEG);
  const x2 = x * cy - y * sy; y = x * sy + y * cy; x = x2;
  return [x, y, z + r.h];
}
function project(p, view) {
  const az = view[0] * DEG, el = view[1] * DEG;
  const x = p[0] * Math.cos(az) - p[1] * Math.sin(az), y = p[0] * Math.sin(az) + p[1] * Math.cos(az);
  const sx = x, sy = p[2] * Math.cos(el) - y * Math.sin(el), depth = y * Math.cos(el) + p[2] * Math.sin(el);
  return [sx, sy, depth];
}
function drawFlip(fr) {
  const o = S.flip;
  if (o.mode === "spin") return drawSpin(fr);
  const view = VIEWS[o.view], sc = Math.min(W / 1.25, (H - 60) / 0.85), ox = W / 2, oy = H - 70;
  const P2 = p => { const q = project(p, view); return [ox + q[0] * sc, oy - q[1] * sc, q[2]]; };
  const goofy = S.stance === "goofy" ? -1 : 1;
  const r = fr ? { roll: fr.roll * goofy, yaw: fr.yaw * goofy, pitch: fr.pitch, h: fr.h } : { roll: 0, yaw: 0, pitch: 0, h: 0 };
  // the ground and its shadow
  ctx.fillStyle = C.ground; const g0 = P2([0, 0, 0]); ctx.fillRect(0, g0[1] + 40, W, H);
  ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(g0[0], g0[1] + 8, 0.42 * sc * (1 - r.h), 0.1 * sc * (1 - r.h) * Math.max(0.3, Math.sin(view[1] * DEG) + .3), 0, 0, 7); ctx.fill(); ctx.restore();
  // height marks
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  // the board: faces sorted far to near
  const m = boardMesh();
  const topW = m.out.map(p => rot(p, r)), botW = m.out.map(p => rot([p[0], p[1], p[2] - 0.014], r));
  const faces = [];
  const nrm = (a, b, c) => { const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; };
  const camDir = (() => { const az = view[0] * DEG, el = view[1] * DEG; return [Math.sin(az) * Math.cos(el) * -1 * 0 + -Math.sin(az) * Math.cos(el), -Math.cos(az) * Math.cos(el) * -1, Math.sin(el)]; })();
  const depthOf = pts => pts.reduce((s, p) => s + project(p, view)[2], 0) / pts.length;
  faces.push({ pts: topW, col: C.grip, d: depthOf(topW) });
  faces.push({ pts: botW.slice().reverse(), col: C.deck, d: depthOf(botW) });
  for (let i = 0; i < topW.length; i++) { const j = (i + 1) % topW.length; const q = [topW[i], topW[j], botW[j], botW[i]]; faces.push({ pts: q, col: C.deck, d: depthOf(q), edge: true }); }
  // trucks and wheels
  [-0.18, 0.18].forEach(x => {
    const tq = [[x - 0.03, -0.075, 0.07], [x + 0.03, -0.075, 0.07], [x + 0.03, 0.075, 0.07], [x - 0.03, 0.075, 0.07]].map(p => rot(p, r));
    const tb = [[x - 0.012, -0.09, 0.03], [x + 0.012, -0.09, 0.03], [x + 0.012, 0.09, 0.03], [x - 0.012, 0.09, 0.03]].map(p => rot(p, r));
    faces.push({ pts: tq, col: C.truck, d: depthOf(tq) - 0.001 }); faces.push({ pts: tb, col: C.truck, d: depthOf(tb) });
    [-0.095, 0.095].forEach(y => { const c = rot([x, y, 0.027], r); faces.push({ wheel: c, col: C.wheel, d: project(c, view)[2] - 0.002, ax: rot([x, y + 0.02, 0.027], r) }); });
  });
  faces.sort((a, b) => a.d - b.d);   // depth grows toward the eye: far faces first
  faces.forEach(f => {
    if (f.wheel) {
      const c = P2(f.wheel), a2 = P2(f.ax); const dx = a2[0] - c[0], dy = a2[1] - c[1];
      const rr = 0.027 * sc, sq = clamp(Math.hypot(dx, dy) / (0.02 * sc), 0.15, 1);
      ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(Math.atan2(dy, dx)); ctx.fillStyle = f.col; ctx.strokeStyle = C["ramp-edge"]; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, 0, rr * sq + 2, rr, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); return;
    }
    ctx.beginPath(); f.pts.forEach((p, i) => { const q = P2(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath();
    ctx.fillStyle = f.col; ctx.fill(); if (!f.edge) { ctx.strokeStyle = C["ramp-edge"]; ctx.lineWidth = 1.2; ctx.stroke(); }
  });
  // the nose marker: a small dot on the nose so you can follow it
  const nose = P2(rot([0.37, 0, 0.12], r)); ctx.fillStyle = C.ke; ctx.beginPath(); ctx.arc(nose[0], nose[1], 7, 0, 7); ctx.fill();
  // the axes the trick turns about
  const tr = FTR[o.trick];
  const axis = (a, b, col, lab) => { const p = P2(a), q = P2(b); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([10, 7]); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore(); text(lab, q[0] + 8, q[1], { m: .8, c: col, bg: C.sky }); };
  if (tr.roll) axis([-0.6, 0, 0.06 + r.h], [0.6, 0, 0.06 + r.h], C.pe, L("long axis", "eje largo"));
  if (tr.yaw) axis([0, 0, r.h - 0.25], [0, 0, r.h + 0.4], C.heat, L("up-down axis", "eje vertical"));
  if (tr.pitch) axis([-0.3, -0.4, 0.06 + r.h], [-0.3, 0.4, 0.06 + r.h], C.pump, L("short axis", "eje corto"));
  text(L(tr.en, tr.es) + (S.stance === "goofy" ? " · goofy" : " · regular"), 16, 34, { w: 700, m: 1.05, c: C.steel });
}
/* arms in, arms out: the same spin (angular momentum L) turns faster with a smaller moment of inertia I */
const I_OUT = 2.4, I_IN = 1.2, AIR = 0.5, L_SPIN = I_OUT * Math.PI / AIR;   // example values, kg·m²
function simSpin(o) {
  const dt = 1 / 120, frames = []; let ang = 0;
  for (let t = 0; t <= AIR + 0.3; t += dt) {
    const inAir = t < AIR, armsIn = o.arms === "in" || (o.arms === "half" && t >= AIR / 2);
    const I = armsIn ? I_IN : I_OUT, w = inAir ? L_SPIN / I : 0;
    ang += w * dt;
    frames.push({ t, ang, I, w, armsIn });
  }
  return { frames };
}
function drawSpin(fr) {
  const cx = W / 2, cy = H / 2 + 10, s = Math.min(W, H) * 0.32;
  ctx.fillStyle = C.ground; ctx.beginPath(); ctx.arc(cx, cy, s * 1.25, 0, 7); ctx.fill();
  if (!fr) return;
  // the trail of the turn so far
  ctx.save(); ctx.strokeStyle = C.ke; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, s * 1.1, -Math.PI / 2, -Math.PI / 2 + fr.ang); ctx.stroke(); ctx.restore();
  text(num(fr.ang / DEG, 0) + "°", cx, cy - s * 1.25 - 12, { a: "center", w: 700, m: 1.2, c: C.ke });
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(fr.ang);
  // the board under the feet (from above), the shoulders and arms
  ctx.fillStyle = C.deck; roundRect(-s * 0.85, -s * 0.2, s * 1.7, s * 0.4, s * 0.2); ctx.fill();
  ctx.strokeStyle = C.shirt; ctx.lineWidth = s * 0.16; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-s * 0.32, 0); ctx.lineTo(s * 0.32, 0); ctx.stroke();
  const reach = fr.armsIn ? 0.42 : 0.95;
  ctx.lineWidth = s * 0.07; ctx.beginPath(); ctx.moveTo(-s * 0.32, 0); ctx.lineTo(-s * reach, fr.armsIn ? s * 0.18 : s * 0.05); ctx.moveTo(s * 0.32, 0); ctx.lineTo(s * reach, fr.armsIn ? s * 0.18 : s * 0.05); ctx.stroke();
  ctx.fillStyle = C.steel; ctx.beginPath(); ctx.arc(0, 0, s * 0.16, 0, 7); ctx.fill();
  ctx.restore();
  text(L("From above", "Desde arriba"), 16, 34, { w: 700, m: 1, c: C.soft });
}
function flipUnder(fr) {
  if (!fr) return "";
  if (S.flip.mode === "spin") return `<div class="reads"><div class="read"><div class="k">${L("Turned", "Giro")}</div><div class="v">${num(fr.ang / DEG, 0)}°</div></div>
    <div class="read"><div class="k">I</div><div class="v">${num(fr.I, 1)}</div><div class="u">kg·m²</div></div>
    <div class="read"><div class="k">ω</div><div class="v">${num(fr.w, 1)}</div><div class="u">rad/s</div></div>
    <div class="read"><div class="k">L = I·ω</div><div class="v">${num(fr.w ? fr.I * fr.w : L_SPIN, 1)}</div><div class="u">${L("stays the same", "no cambia")}</div></div></div>`;
  return `<div class="reads">
    <div class="read"><div class="k">${L("Long axis (flip)", "Eje largo (flip)")}</div><div class="v">${num(Math.abs(fr.roll), 0)}°</div></div>
    <div class="read"><div class="k">${L("Up-down (shove)", "Vertical (shove)")}</div><div class="v">${num(Math.abs(fr.yaw), 0)}°</div></div>
    <div class="read"><div class="k">${L("Short axis", "Eje corto")}</div><div class="v">${num(Math.abs(fr.pitch), 0)}°</div></div>
    <div class="read"><div class="k">${L("Height", "Altura")}</div><div class="v">${num(fr.h * 100, 0)}</div><div class="u">cm</div></div></div>`;
}
function flipPanel() {
  const o = S.flip, tr = FTR[o.trick];
  const seg = (k, v, l) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="${String(o[k]) === String(v)}">${l}</button>`;
  const top = `<p class="kicker">${L("Room 5 · Rotation", "Sala 5 · Rotación")}</p><h2>${L("Flips and spins", "Flips y giros")}</h2>
   <div class="ctl"><div class="seg">${seg("mode", "board", L("The board's flips", "Los flips de la tabla"))}${seg("mode", "spin", L("Your body's spin", "El giro de tu cuerpo"))}</div></div>`;
  if (o.mode === "spin") return top + `<p class="say">${L("In the air nothing can add spin, so your angular momentum stays the same. Pull your arms in and you turn faster. Press Go to try a 180.", "En el aire nada puede añadir giro, así que tu momento angular no cambia. Junta los brazos y giras más rápido. Pulsa Ir para probar un 180.")}</p>
   <div class="ctl"><span class="lab">${L("Arms", "Brazos")}</span><div class="seg">${seg("arms", "out", L("Out the whole time", "Abiertos todo el tiempo"))}${seg("arms", "half", L("Pull in halfway", "Juntar a la mitad"))}${seg("arms", "in", L("In the whole time", "Juntos todo el tiempo"))}</div></div>
   <div class="math">L = I·ω  (${L("stays the same in the air", "no cambia en el aire")})
${L("Arms out", "Brazos abiertos")}: I = ${num(I_OUT, 1)} kg·m² → ω = ${num(L_SPIN / I_OUT, 1)} rad/s
${L("Arms in", "Brazos juntos")}:  I = ${num(I_IN, 1)} kg·m² → ω = ${num(L_SPIN / I_IN, 1)} rad/s
${L("In 0.5 s of air", "En 0,5 s de aire")}: ${L("out", "abiertos")} 180°, ${L("in", "juntos")} 360°</div>
   <p class="hint muted">${L("The moments of inertia are example values for a teen rider.", "Los momentos de inercia son valores de ejemplo para un patinador adolescente.")}</p>
   <details class="more"><summary>${L("The science", "La ciencia")}</summary><p>${L("Skaters wind up their shoulders before a 180 because all the spin must start while the wheels still touch the ground. Once in the air, the only way to turn faster is to pull mass closer to the spin's center. Figure skaters do the same thing.", "Los patinadores giran los hombros antes de un 180 porque todo el giro debe empezar mientras las ruedas tocan el suelo. En el aire, la única forma de girar más rápido es acercar la masa al centro del giro. Los patinadores sobre hielo hacen lo mismo.")}</p></details>`;
  return top + `<p class="say">${L("Every flip trick is the board turning about one or more of its three axes. Pick a trick, press Go, then step through it.", "Cada flip es la tabla girando sobre uno o más de sus tres ejes. Elige un truco, pulsa Ir y avanza paso a paso.")}</p>
   <div class="ctl"><label for="fT">${L("Trick", "Truco")}</label><select class="sel" id="fT">${Object.keys(FTR).map(k => `<option value="${k}" ${o.trick === k ? "selected" : ""}>${L(FTR[k].en, FTR[k].es)}</option>`).join("")}</select></div>
   <div class="ctl"><span class="lab">${L("Look from", "Mirar desde")}</span><div class="seg">${seg("view", "corner", L("Corner", "Esquina"))}${seg("view", "side", L("Side", "Lado"))}${seg("view", "front", L("Nose", "Nariz"))}${seg("view", "above", L("Above", "Arriba"))}</div></div>
   <div class="ctl"><span class="lab">${L("Stance", "Postura")}</span><div class="seg"><button type="button" data-st="regular" aria-pressed="${S.stance === "regular"}">${L("Regular (left foot forward)", "Regular (pie izquierdo adelante)")}</button><button type="button" data-st="goofy" aria-pressed="${S.stance === "goofy"}">${L("Goofy (right foot forward)", "Goofy (pie derecho adelante)")}</button></div></div>
   <div class="note">${es() ? tr.how[1] : tr.how[0]}</div>
   <p class="legend"><span><i style="background:var(--cv-ke)"></i>${L("The nose", "La nariz")}</span>${tr.roll ? `<span><i style="background:var(--cv-pe)"></i>${L("Long axis", "Eje largo")}</span>` : ""}${tr.yaw ? `<span><i style="background:var(--cv-heat)"></i>${L("Up-down axis", "Eje vertical")}</span>` : ""}${tr.pitch ? `<span><i style="background:var(--cv-pump)"></i>${L("Short axis", "Eje corto")}</span>` : ""}</p>
   <div class="math">${L("A 30 cm ollie gives about 0.5 s in the air.", "Un ollie de 30 cm da unos 0,5 s en el aire.")}
${L("A kickflip turns 360° in that time", "Un kickflip gira 360° en ese tiempo")}: 360° / 0.5 s ≈ 720°/s
${L("That is two full turns every second.", "Son dos vueltas completas cada segundo.")}</div>`;
}
function flipWire() {
  const o = S.flip;
  document.querySelectorAll("#panel [data-k]").forEach(b => b.onclick = () => { const k = b.getAttribute("data-k"); o[k] = b.getAttribute("data-v"); save(); if (k === "view") { panel(); paint(); } else flipReset(); });
  document.querySelectorAll("#panel [data-st]").forEach(b => b.onclick = () => { S.stance = b.getAttribute("data-st"); save(); panel(); paint(); });
  const sel = $("fT"); if (sel) sel.onchange = e => { o.trick = e.target.value; save(); flipReset(); };
}
function flipReset(quiet) { FR = S.flip.mode === "spin" ? simSpin(S.flip) : simFlip(S.flip); setRun(FR.frames, 1 / 120); if (!quiet) panel(); paint(); }

/* ══ ROOM 6 — boards through time ════════════════════════════════════════════════════════════════════ */
const ERAS = [
  { y: "1950s", shape: { len: 0.6, w: 0.13, kickT: 0, kickN: 0, round: 0.02 }, wheel: { col: "#8a929b", en: "steel", es: "acero" },
    en: ["Sidewalk surfing", "Surfers in California wanted to surf when the ocean was flat. They fixed roller-skate wheels under planks of wood. The wheels were steel: loud, and stopped dead by small stones."],
    es: ["Surf en la acera", "Los surfistas de California querían surfear cuando el mar estaba tranquilo. Pusieron ruedas de patines bajo tablas de madera. Las ruedas eran de acero: ruidosas, y una piedrita las paraba en seco."] },
  { y: "1959", shape: { len: 0.62, w: 0.14, kickT: 0, kickN: 0, round: 0.05 }, wheel: { col: "#8a929b", en: "steel", es: "acero" },
    en: ["Boards in stores", "Around 1959, skateboards made in factories went on sale in stores."], es: ["Tablas en las tiendas", "Hacia 1959 se empezaron a vender en las tiendas patinetas hechas en fábricas."] },
  { y: "1965", shape: { len: 0.66, w: 0.16, kickT: 0, kickN: 0, round: 0.07 }, wheel: { col: "#b07a52", en: "clay", es: "arcilla" },
    en: ["The first boom", "Companies such as Makaha and Hobie sold boards with clay wheels. The first national championships were held in Anaheim, California, in 1965 and shown on television. Patti McGee was women's champion and appeared on the cover of Life magazine."],
    es: ["El primer auge", "Empresas como Makaha y Hobie vendían tablas con ruedas de arcilla. El primer campeonato nacional fue en Anaheim, California, en 1965, y salió en la televisión. Patti McGee fue campeona y salió en la portada de la revista Life."] },
  { y: "1971", shape: { len: 0.7, w: 0.17, kickT: 0.04, kickN: 0, round: 0.08 }, wheel: { col: "#b07a52", en: "clay", es: "arcilla" },
    en: ["The kicktail", "Larry Stevenson of Makaha received a patent for the kicktail in 1971: a tail bent up so a rider can press it with the back foot and lift the nose."],
    es: ["El kicktail", "Larry Stevenson, de Makaha, recibió en 1971 una patente por el kicktail: una cola doblada hacia arriba para presionarla con el pie de atrás y levantar la nariz."] },
  { y: "1972", shape: { len: 0.72, w: 0.18, kickT: 0.04, kickN: 0, round: 0.08 }, wheel: { col: "#e8d7a6", en: "urethane", es: "uretano" },
    en: ["Urethane wheels", "In the early 1970s Frank Nasworthy sold urethane wheels (Cadillac Wheels). They gripped the ground and rolled over cracks. Skating could now be smooth and fast."],
    es: ["Ruedas de uretano", "A principios de los años 70 Frank Nasworthy vendió ruedas de uretano (Cadillac Wheels). Se agarraban al suelo y pasaban sobre las grietas. Patinar ya podía ser suave y rápido."] },
  { y: "1975", shape: { len: 0.74, w: 0.2, kickT: 0.04, kickN: 0, round: 0.09 }, wheel: { col: "#e8d7a6", en: "urethane, precision bearings", es: "uretano, rodamientos de precisión" },
    en: ["Del Mar and the Zephyr team", "The Zephyr team from Santa Monica and Venice, including Peggy Oki, Tony Alva, Jay Adams and Stacy Peralta, skated low and surf-style at the 1975 Del Mar Nationals. Sealed precision bearings arrived in the mid-1970s."],
    es: ["Del Mar y el equipo Zephyr", "El equipo Zephyr de Santa Mónica y Venice, con Peggy Oki, Tony Alva, Jay Adams y Stacy Peralta, patinó bajo y al estilo del surf en el Del Mar Nationals de 1975. Los rodamientos de precisión sellados llegaron a mediados de los años 70."] },
  { y: "1976", shape: { len: 0.76, w: 0.22, kickT: 0.045, kickN: 0, round: 0.1 }, wheel: { col: "#e8d7a6", en: "urethane", es: "uretano" },
    en: ["Pools and the first skateparks", "A drought in California in 1976–77 left swimming pools empty, and skaters rode their curved walls. Carlsbad Skatepark in California and Skateboard City in Port Orange, Florida, both opened in 1976."],
    es: ["Piscinas y los primeros skateparks", "Una sequía en California en 1976–77 dejó vacías las piscinas, y los patinadores montaron sus paredes curvas. Carlsbad Skatepark en California y Skateboard City en Port Orange, Florida, abrieron en 1976."] },
  { y: "1978", shape: { len: 0.76, w: 0.25, kickT: 0.05, kickN: 0.01, round: 0.11 }, wheel: { col: "#e8d7a6", en: "urethane", es: "uretano" },
    en: ["The ollie", "In the late 1970s Alan \"Ollie\" Gelfand popped into the air on a ramp with no hands. The trick took his nickname: the ollie."],
    es: ["El ollie", "A finales de los años 70 Alan \"Ollie\" Gelfand saltó en una rampa sin usar las manos. El truco tomó su apodo: el ollie."] },
  { y: "1981", shape: { len: 0.78, w: 0.26, kickT: 0.05, kickN: 0.015, round: 0.11 }, wheel: { col: "#e8d7a6", en: "urethane", es: "uretano" },
    en: ["Flat ground and Thrasher", "Rodney Mullen brought the ollie to flat ground in the early 1980s and invented many flat-ground tricks. Thrasher magazine began in 1981. Many skateparks closed over insurance costs, so skaters built backyard ramps."],
    es: ["Suelo plano y Thrasher", "Rodney Mullen llevó el ollie al suelo plano a principios de los años 80 e inventó muchos trucos. La revista Thrasher empezó en 1981. Muchos skateparks cerraron por el costo del seguro, y los patinadores construyeron rampas en sus patios."] },
  { y: "1984", shape: { len: 0.78, w: 0.255, kickT: 0.05, kickN: 0.02, round: 0.1, fish: 1 }, wheel: { col: "#e8d7a6", en: "urethane", es: "uretano" },
    en: ["Videos and the Bones Brigade", "Powell Peralta's The Bones Brigade Video Show (1984) let skaters everywhere watch tricks again and again. TransWorld SKATEboarding had started in 1983."],
    es: ["Videos y el Bones Brigade", "The Bones Brigade Video Show de Powell Peralta (1984) dejó que patinadores de todas partes vieran trucos una y otra vez. TransWorld SKATEboarding había empezado en 1983."] },
  { y: "1991", shape: { len: 0.8, w: 0.2, kickT: 0.05, kickN: 0.05, round: 0.1 }, wheel: { col: "#f2ede0", en: "small, hard urethane", es: "uretano pequeño y duro" },
    en: ["The street era", "Videos such as Blind's Video Days (1991) and Plan B's Questionable (1992) spread street skating: ledges, rails and stairs. Boards became narrow with two kicks, and wheels got small."],
    es: ["La era de la calle", "Videos como Video Days de Blind (1991) y Questionable de Plan B (1992) difundieron el patinaje callejero: bordillos, barandales y escaleras. Las tablas se hicieron angostas con dos colas, y las ruedas pequeñas."] },
  { y: "1999", shape: { len: 0.8, w: 0.205, kickT: 0.05, kickN: 0.05, round: 0.1 }, wheel: { col: "#f2ede0", en: "urethane", es: "uretano" },
    en: ["The 900", "ESPN's Extreme Games began in 1995 and were called the X Games from 1996. At the 1999 X Games in San Francisco, Tony Hawk landed the 900: two and a half spins in the air. The video game Tony Hawk's Pro Skater came out the same year."],
    es: ["El 900", "Los Extreme Games de ESPN empezaron en 1995 y se llamaron X Games desde 1996. En los X Games de 1999 en San Francisco, Tony Hawk logró el 900: dos vueltas y media en el aire. El videojuego Tony Hawk's Pro Skater salió ese mismo año."] },
  { y: "2007", shape: { len: 0.8, w: 0.205, kickT: 0.05, kickN: 0.05, round: 0.1 }, wheel: { col: "#f2ede0", en: "urethane", es: "uretano" },
    en: ["Skateistan", "Oliver Percovich founded Skateistan in Kabul, Afghanistan, in 2007, using skateboarding to bring children, including many girls, to school."],
    es: ["Skateistan", "Oliver Percovich fundó Skateistan en Kabul, Afganistán, en 2007, y usó el skate para llevar a niños, entre ellos muchas niñas, a la escuela."] },
  { y: "2021", shape: { len: 0.8, w: 0.21, kickT: 0.05, kickN: 0.05, round: 0.1 }, wheel: { col: "#f2ede0", en: "urethane", es: "uretano" },
    en: ["The Olympics", "Skateboarding joined the Olympics at Tokyo 2020, held in 2021. Momiji Nishiya of Japan, age 13, won women's street; Rayssa Leal of Brazil, also 13, won silver. Yuto Horigome won men's street, and Keegan Palmer of Australia won men's park."],
    es: ["Los Juegos Olímpicos", "El skate llegó a los Juegos Olímpicos en Tokio 2020, celebrados en 2021. Momiji Nishiya de Japón, de 13 años, ganó street femenino; Rayssa Leal de Brasil, también de 13, ganó plata. Yuto Horigome ganó street masculino, y Keegan Palmer de Australia ganó park masculino."] },
  { y: "2024", shape: { len: 0.8, w: 0.21, kickT: 0.05, kickN: 0.05, round: 0.1 }, wheel: { col: "#f2ede0", en: "urethane", es: "uretano" },
    en: ["Paris", "At Paris 2024, Yuto Horigome and Keegan Palmer won again. Arisa Trew of Australia won women's park, and Coco Yoshizawa of Japan won women's street."],
    es: ["París", "En París 2024, Yuto Horigome y Keegan Palmer volvieron a ganar. Arisa Trew de Australia ganó park femenino, y Coco Yoshizawa de Japón ganó street femenino."] }
];
function drawTimeline() {
  const e = ERAS[clamp(S.timeline.i, 0, ERAS.length - 1)], s = e.shape;
  const sc = Math.min((W - 120) / 0.9, (H - 120) / 0.62), cx = W / 2, cyTop = H * 0.36, cySide = H * 0.78;
  text(e.y, 18, 44, { w: 800, m: 1.6, c: C.steel });
  text(L("From above", "Desde arriba"), W - 18, 36, { a: "right", m: .8, c: C.soft });
  // from above: the outline (a fishtail in the 1980s)
  const hl = s.len / 2, hw = s.w / 2, r = Math.min(s.round, hw);
  ctx.save(); ctx.translate(cx, cyTop); ctx.scale(sc, sc);
  ctx.beginPath();
  ctx.moveTo(-hl + r, -hw); ctx.lineTo(hl - r, -hw); ctx.quadraticCurveTo(hl, -hw, hl, -hw + r); ctx.lineTo(hl, hw - r); ctx.quadraticCurveTo(hl, hw, hl - r, hw);
  if (s.fish) { ctx.lineTo(-hl + 0.12, hw); ctx.lineTo(-hl + 0.02, hw * 0.55); ctx.lineTo(-hl, hw * 0.2); ctx.lineTo(-hl + 0.05, 0); ctx.lineTo(-hl, -hw * 0.2); ctx.lineTo(-hl + 0.02, -hw * 0.55); ctx.lineTo(-hl + 0.12, -hw); }
  else { ctx.lineTo(-hl + r, hw); ctx.quadraticCurveTo(-hl, hw, -hl, hw - r); ctx.lineTo(-hl, -hw + r); ctx.quadraticCurveTo(-hl, -hw, -hl + r, -hw); }
  ctx.closePath(); ctx.fillStyle = C.grip; ctx.fill(); ctx.strokeStyle = C.deck; ctx.lineWidth = 0.008; ctx.stroke();
  ctx.fillStyle = C.truck; [-0.18 * s.len / 0.8, 0.18 * s.len / 0.8].forEach(x => [-0.02, 0.02].forEach(dy => [-0.012, 0.012].forEach(dx => { ctx.beginPath(); ctx.arc(x + dx, dy, 0.004, 0, 7); ctx.fill(); })));
  ctx.restore();
  // width and length labels
  text(num(s.len * 100, 0) + " cm", cx, cyTop - hw * sc - 14, { a: "center", m: .85, c: C.soft });
  text(num(s.w * 100, 0) + " cm", cx + hl * sc + 14, cyTop + 6, { m: .85, c: C.soft });
  // from the side: kicks and wheels
  text(L("From the side", "De lado"), W - 18, cySide - 0.16 * sc, { a: "right", m: .8, c: C.soft });
  ctx.fillStyle = C.ground; ctx.fillRect(0, cySide, W, H);
  ctx.save(); ctx.translate(cx, cySide); ctx.scale(sc, -sc);
  const ax = 0.18 * s.len / 0.8, wr = e.wheel.en.indexOf("small") >= 0 ? 0.025 : e.wheel.en === "steel" ? 0.022 : 0.03;
  ctx.fillStyle = C.truck; [-ax, ax].forEach(x => { ctx.fillRect(x - 0.03, wr + 0.012, 0.06, 0.02); });
  [-ax, ax].forEach(x => { ctx.beginPath(); ctx.arc(x, wr, wr, 0, 7); ctx.fillStyle = e.wheel.col; ctx.fill(); ctx.lineWidth = 0.004; ctx.strokeStyle = C["ramp-edge"]; ctx.stroke(); });
  const dy = wr + 0.04;
  ctx.strokeStyle = C.deck; ctx.lineWidth = 0.014; ctx.lineCap = "round"; ctx.beginPath();
  ctx.moveTo(-hl, dy + s.kickT); ctx.lineTo(-hl + 0.1, dy); ctx.lineTo(hl - 0.1, dy); ctx.lineTo(hl, dy + s.kickN); ctx.stroke();
  ctx.restore();
  text(L("Wheels: ", "Ruedas: ") + L(e.wheel.en, e.wheel.es), cx, cySide + 34, { a: "center", m: .9, c: C.ink });
}
function timelinePanel() {
  const i = clamp(S.timeline.i, 0, ERAS.length - 1), e = ERAS[i], tx = es() ? e.es : e.en;
  return `<p class="kicker">${L("Room 6 · History", "Sala 6 · Historia")}</p>
  <h2>${L("Boards through time", "Las tablas en el tiempo")}</h2>
  <p class="say">${L("Move through the years. Watch the board and the wheels change, and read what each change made possible.", "Avanza por los años. Mira cómo cambian la tabla y las ruedas, y lee qué hizo posible cada cambio.")}</p>
  <div class="ctl"><label for="tY">${L("Year", "Año")} <output>${e.y}</output></label><input type="range" id="tY" min="0" max="${ERAS.length - 1}" step="1" value="${i}"></div>
  <div class="row"><button type="button" class="btn" id="tPrev" ${i ? "" : "disabled"}>◀ ${L("Earlier", "Antes")}</button><button type="button" class="btn" id="tNext" ${i < ERAS.length - 1 ? "" : "disabled"}>${L("Later", "Después")} ▶</button></div>
  <h3>${e.y} · ${esc(tx[0])}</h3><p>${esc(tx[1])}</p>
  <p class="hint muted">${L("Board sizes are typical of each time, drawn to scale.", "Los tamaños son típicos de cada época, dibujados a escala.")}</p>
  <p><a href="/skateboarding">${L("The whole history, in the course", "Toda la historia, en el curso")} →</a></p>`;
}
function timelineWire() {
  const set = i => { S.timeline.i = clamp(i, 0, ERAS.length - 1); save(); panel(); paint(); };
  $("tY").oninput = e => { S.timeline.i = +e.target.value; save(); paint(); e.target.previousElementSibling.querySelector("output").textContent = ERAS[S.timeline.i].y; };
  $("tY").onchange = () => panel();
  $("tPrev").onclick = () => set(S.timeline.i - 1); $("tNext").onclick = () => set(S.timeline.i + 1);
}

/* ══ ROOM 7 — the trick book ═════════════════════════════════════════════════════════════════════════
   Feet in board space (from above): x along the board (nose +, meters), y across (toe side +). Foot angle in
   degrees from straight across the board. Arrows show what a foot does. Goofy mirrors the picture. */
const TRICKS = [
  { id: "stance", lv: 1, room: "balance", feet: { f: [0.13, 0, 10], b: [-0.17, 0, 5] },
    en: { n: "Stance: regular or goofy", steps: ["Stand on the board on grass or carpet, so it cannot roll.", "Try your left foot in front, then your right. The one that feels steady is your stance: left in front is regular, right in front is goofy. Both are fine.", "Put both feet over the bolts, across the board, shoulder-width apart.", "Bend your knees a little, like a spring. Keep your arms loose and out to the sides.", "Look up, where you would go, not at your feet."], fixes: [["The board wobbles", "Bend your knees more and keep your feet over the bolts."], ["I can't tell which foot goes first", "Have a friend give you a gentle push from behind: the foot you step forward with often goes in front."]], sci: "Your feet over the bolts sit right above the wheels, so your weight is inside the base of support." },
    es: { n: "Postura: regular o goofy", steps: ["Párate en la tabla sobre pasto o alfombra, para que no ruede.", "Prueba el pie izquierdo adelante y luego el derecho. El que se sienta firme es tu postura: izquierdo adelante es regular, derecho adelante es goofy. Las dos están bien.", "Pon los dos pies sobre los tornillos, de lado, al ancho de los hombros.", "Dobla un poco las rodillas, como un resorte. Brazos sueltos y hacia los lados.", "Mira hacia arriba, adonde irías, no a tus pies."], fixes: [["La tabla se mueve", "Dobla más las rodillas y deja los pies sobre los tornillos."], ["No sé qué pie va adelante", "Pide a alguien que te empuje suave por detrás: el pie que das adelante suele ser el de adelante."]], sci: "Tus pies sobre los tornillos quedan encima de las ruedas, así tu peso está dentro de la base de apoyo." } },
  { id: "push", lv: 1, room: "ramp", feet: { f: [0.15, 0, -55], b: [0.05, 0.25, 0] }, arrows: [{ from: [0.05, 0.25], to: [-0.35, 0.25] }],
    en: { n: "Pushing", steps: ["Helmet on. Find a smooth, flat place with no cars.", "Put your front foot over the front bolts, pointing toward the nose.", "Push the ground with your back foot, beside the board, behind you.", "Put the back foot on the board over the back bolts, across the board, and turn the front foot sideways.", "Roll. Push again when you slow down. Small pushes are fine."], fixes: [["The board rolls away from my front foot", "Keep most of your weight on the front foot while you push."], ["I wobble after I push", "Turn your front foot sideways as soon as your back foot is on, and bend your knees."]], sci: "A push is a force. The ground pushes back on your foot (Newton's third law) and that starts you rolling." },
    es: { n: "Empujar", steps: ["Ponte el casco. Busca un lugar liso y plano, sin autos.", "Pon el pie de adelante sobre los tornillos delanteros, apuntando a la nariz.", "Empuja el suelo con el pie de atrás, al lado de la tabla, detrás de ti.", "Sube el pie de atrás sobre los tornillos traseros, de lado, y gira el pie de adelante de lado.", "Rueda. Empuja otra vez cuando vayas más lento. Empujes pequeños están bien."], fixes: [["La tabla se escapa del pie de adelante", "Deja casi todo tu peso en el pie de adelante mientras empujas."], ["Me tambaleo después de empujar", "Gira el pie de adelante de lado en cuanto subas el de atrás, y dobla las rodillas."]], sci: "Un empujón es una fuerza. El suelo empuja tu pie de vuelta (tercera ley de Newton) y eso te pone a rodar." } },
  { id: "stop", lv: 1, room: "grind", feet: { f: [0.15, 0, -50], b: [0.0, 0.25, 0] }, arrows: [{ from: [-0.05, 0.25], to: [-0.3, 0.25] }],
    en: { n: "Stopping: the foot brake", steps: ["Roll slowly on flat ground.", "Turn your front foot to point toward the nose, with your weight on it.", "Lower your back foot and let the sole touch the ground lightly beside the board.", "Press a little harder to slow down. Keep the foot flat, not on the heel.", "When you are slow enough, step off."], fixes: [["My foot bounces", "Touch down lightly at first, then press slowly."], ["I'm too fast to try", "Practice the stop at walking speed first."]], sci: "Your shoe rubbing the ground makes friction, which turns your motion energy into heat." },
    es: { n: "Frenar con el pie", steps: ["Rueda despacio en suelo plano.", "Gira el pie de adelante hacia la nariz, con tu peso en él.", "Baja el pie de atrás y deja que la suela roce el suelo al lado de la tabla.", "Presiona un poco más para frenar. El pie plano, no sobre el talón.", "Cuando vayas lento, bájate."], fixes: [["Mi pie rebota", "Toca el suelo suave al principio y luego presiona poco a poco."], ["Voy muy rápido para probar", "Practica el frenado primero a paso de caminar."]], sci: "Tu zapato rozando el suelo hace fricción, que convierte tu energía de movimiento en calor." } },
  { id: "kickturn", lv: 2, room: "balance", feet: { f: [0.1, 0, 10], b: [-0.32, 0, 5] }, arrows: [{ from: [0.3, 0], to: [0.3, 0.25], curve: 1 }],
    en: { n: "Kickturn", steps: ["Stand still on a flat, smooth place first, with your back foot on the tail.", "Press the tail gently so the front wheels lift a little.", "Turn your shoulders and head where you want to go; the board follows.", "Put the front wheels down. Start with small turns, then bigger ones.", "Try it while rolling slowly."], fixes: [["The board shoots out", "Press the tail more gently and keep weight on the front foot too."], ["It won't turn", "Turn your shoulders first. The hips and the board follow."]], sci: "The tail is a lever: pressing it turns the board about the back wheels, so the front wheels lift and there is less friction to stop the turn." },
    es: { n: "Kickturn", steps: ["Primero quieto en un lugar plano y liso, con el pie de atrás en la cola.", "Presiona la cola suave para que suban un poco las ruedas de adelante.", "Gira los hombros y la cabeza adonde quieres ir; la tabla te sigue.", "Baja las ruedas de adelante. Empieza con giros pequeños, luego más grandes.", "Pruébalo rodando despacio."], fixes: [["La tabla se escapa", "Presiona la cola más suave y deja peso también en el pie de adelante."], ["No gira", "Gira primero los hombros. La cadera y la tabla siguen."]], sci: "La cola es una palanca: al presionarla, la tabla gira sobre las ruedas de atrás, suben las de adelante y hay menos fricción que frene el giro." } },
  { id: "tictac", lv: 2, room: "balance", feet: { f: [0.1, 0, 10], b: [-0.32, 0, 5] },
    en: { n: "Tic-tac", steps: ["Start with small kickturns: lift the front wheels and turn a little to the toe side.", "Put them down and turn a little to the heel side.", "Keep going side to side in a steady rhythm.", "Each small turn moves you forward without pushing.", "Keep your knees bent and your shoulders leading."], fixes: [["I go nowhere", "Make the turns a little wider and quicker."], ["I lose balance", "Lift the front wheels only a little."]], sci: "Swinging the board side to side turns small twists into forward motion, like a swimmer's kick." },
    es: { n: "Tic-tac", steps: ["Empieza con kickturns pequeños: sube las ruedas de adelante y gira un poco hacia el lado de los dedos.", "Bájalas y gira un poco hacia el lado de los talones.", "Sigue de lado a lado con un ritmo parejo.", "Cada giro pequeño te mueve adelante sin empujar.", "Rodillas dobladas y los hombros guían."], fixes: [["No avanzo", "Haz giros un poco más anchos y rápidos."], ["Pierdo el equilibrio", "Sube solo un poco las ruedas de adelante."]], sci: "Mover la tabla de lado a lado convierte pequeños giros en avance, como la patada de un nadador." } },
  { id: "manual", lv: 2, room: "balance", feet: { f: [0.08, 0, 10], b: [-0.27, 0, 5] },
    en: { n: "Manual", steps: ["Roll slowly on flat ground.", "Shift your weight back until your center of mass is right over the back wheels.", "The front wheels lift. Keep the tail just off the ground.", "Use tiny moves of your arms and hips to stay balanced.", "Put the front wheels down before you lose it. Try for a short distance first."], fixes: [["The tail scrapes", "Your weight is too far back. Move it forward a little."], ["The front won't lift", "Lean back more, and keep your back foot near the tail."]], sci: "A manual is balance on one axle: the line of your weight falls right over the back wheels, so it cannot turn the board either way." },
    es: { n: "Manual", steps: ["Rueda despacio en suelo plano.", "Lleva tu peso atrás hasta que tu centro de masa quede justo sobre las ruedas de atrás.", "Suben las ruedas de adelante. La cola queda justo sobre el suelo.", "Usa pequeños movimientos de brazos y cadera para mantenerte.", "Baja las ruedas antes de perderlo. Prueba primero una distancia corta."], fixes: [["La cola raspa", "Tu peso está muy atrás. Muévelo un poco adelante."], ["La nariz no sube", "Inclínate más atrás y deja el pie de atrás cerca de la cola."]], sci: "Un manual es equilibrio sobre un eje: la línea de tu peso cae justo sobre las ruedas de atrás, así no gira la tabla para ningún lado." } },
  { id: "dropin", lv: 2, room: "ramp", feet: { f: [0.15, 0, 5], b: [-0.33, 0, 5] },
    en: { n: "Dropping in", steps: ["Start on a small ramp, with a coach or a grown-up beside you, in full pads and a helmet.", "Put the tail on the coping (the metal edge), with the back wheels hanging over the ramp. Hold it with your back foot.", "Put your front foot over the front bolts.", "Lean forward, onto your front foot, and push the front wheels down onto the ramp. Commit all the way.", "Keep your knees bent and your weight forward as you roll down."], fixes: [["The board shoots out in front", "You leaned back. Leaning forward feels scary but keeps the board under you."], ["I freeze at the top", "That is normal. Practice on a smaller ramp, or have someone hold your hand."]], sci: "On a slope, gravity pulls you along the ramp. If your weight stays behind the wheels, the board speeds away under you. Leaning forward keeps your center of mass over your feet." },
    es: { n: "Dropping in (entrar a la rampa)", steps: ["Empieza en una rampa pequeña, con un entrenador o un adulto al lado, con protecciones y casco.", "Pon la cola sobre el coping (el borde de metal), con las ruedas de atrás colgando sobre la rampa. Sujétala con el pie de atrás.", "Pon el pie de adelante sobre los tornillos delanteros.", "Inclínate adelante, sobre el pie de adelante, y baja las ruedas delanteras a la rampa. Decídete del todo.", "Rodillas dobladas y el peso adelante mientras bajas."], fixes: [["La tabla se me escapa adelante", "Te inclinaste atrás. Inclinarse adelante da miedo pero mantiene la tabla bajo ti."], ["Me quedo congelado arriba", "Es normal. Practica en una rampa más pequeña o pide que te den la mano."]], sci: "En una pendiente, la gravedad te jala por la rampa. Si tu peso queda detrás de las ruedas, la tabla acelera bajo ti. Inclinarte adelante mantiene tu centro de masa sobre tus pies." } },
  { id: "ollie", lv: 3, room: "ollie", feet: { f: [0.05, 0, 15], b: [-0.33, 0.03, 0] }, arrows: [{ from: [0.05, 0], to: [0.3, -0.01] }, { from: [-0.37, 0.03], to: [-0.37, 0.03], down: 1 }],
    en: { n: "Ollie", steps: ["Practice standing still on grass or carpet first.", "Back foot: the ball of the foot on the tail. Front foot: just behind the front bolts.", "Crouch: bend your knees low.", "Snap the tail down hard with your back foot, and jump.", "Right after the snap, slide your front foot up toward the nose. The side of your shoe drags on the grip tape.", "Lift both knees up so the board can rise; push the nose level with your front foot.", "Land with both feet over the bolts and bend your knees."], fixes: [["The board barely leaves the ground", "Snap the tail faster, and slide the front foot after the snap, not before."], ["The board lands on its tail", "Slide the front foot higher and sooner to level the board."], ["I land with my feet off the bolts", "Jump straight up, not forward, and look down at the board."]], sci: "The tail is a lever about the back wheels; the front foot's friction drags the board up and levels it. A 30 cm ollie keeps you in the air about half a second." },
    es: { n: "Ollie", steps: ["Practica primero quieto en pasto o alfombra.", "Pie de atrás: la punta del pie en la cola. Pie de adelante: justo detrás de los tornillos delanteros.", "Agáchate: dobla bien las rodillas.", "Golpea la cola fuerte con el pie de atrás y salta.", "Justo después del golpe, desliza el pie de adelante hacia la nariz. El lado del zapato roza la lija.", "Sube las dos rodillas para que la tabla suba; nivela la nariz con el pie de adelante.", "Aterriza con los dos pies sobre los tornillos y dobla las rodillas."], fixes: [["La tabla casi no sube", "Golpea la cola más rápido y desliza el pie de adelante después del golpe, no antes."], ["La tabla cae de cola", "Desliza el pie de adelante más alto y antes, para nivelar la tabla."], ["Aterrizo con los pies fuera de los tornillos", "Salta hacia arriba, no hacia adelante, y mira la tabla."]], sci: "La cola es una palanca sobre las ruedas de atrás; la fricción del pie de adelante sube y nivela la tabla. Un ollie de 30 cm te deja en el aire medio segundo." } },
  { id: "shove", lv: 3, room: "flip", feet: { f: [0.12, 0, 10], b: [-0.34, 0.05, 0] }, arrows: [{ from: [-0.36, 0.05], to: [-0.3, -0.2], curve: 1 }],
    en: { n: "Pop shove-it", steps: ["Back foot on the tail, toes near the toe-side edge, ready to scoop.", "Front foot over the front bolts, a little toward the heel side.", "Pop the tail and scoop it behind you with your back foot.", "Jump up. Let the board spin half a turn flat under you.", "Catch it with your back foot, then your front foot, over the bolts, and land with bent knees."], fixes: [["The board flies away", "Scoop less hard, and jump straight up."], ["The board only turns a quarter", "Scoop with more snap from the ankle."]], sci: "The scoop pushes the tail sideways, a torque about the up-down axis, so the board spins flat." },
    es: { n: "Pop shove-it", steps: ["Pie de atrás en la cola, con los dedos cerca del borde del lado de los dedos, listo para empujar.", "Pie de adelante sobre los tornillos delanteros, un poco hacia el lado de los talones.", "Golpea la cola y empújala hacia atrás con el pie de atrás.", "Salta. Deja que la tabla gire media vuelta plana bajo ti.", "Atrápala con el pie de atrás, luego con el de adelante, sobre los tornillos, y aterriza con las rodillas dobladas."], fixes: [["La tabla sale volando", "Empuja menos fuerte y salta recto hacia arriba."], ["La tabla gira solo un cuarto", "Empuja con más golpe del tobillo."]], sci: "El empuje mueve la cola de lado, un torque sobre el eje vertical, y la tabla gira plana." } },
  { id: "kickflip", lv: 3, room: "flip", feet: { f: [0.02, -0.02, 35], b: [-0.33, 0.02, 0] }, arrows: [{ from: [0.05, 0], to: [0.33, 0.12] }],
    en: { n: "Kickflip", steps: ["Get a steady ollie first.", "Front foot angled, just behind the front bolts, toes near the toe-side edge. Back foot on the tail.", "Crouch, snap the tail, and slide your front foot up toward the nose, like an ollie.", "At the end of the slide, flick the front foot off the toe-side corner of the nose.", "Lift your knees high. The board flips under you.", "When you see the grip tape again, catch it with your back foot, then your front foot, and land over the bolts."], fixes: [["The board flips but flies forward", "Flick more to the side and less forward."], ["It doesn't flip all the way", "Flick off the very corner of the nose, with snap."], ["I land on the board's edge", "Wait to see the grip tape before you put your feet down."]], sci: "The flick off the corner gives the board a turning push about its long axis. It spins about 720° per second in a half-second of air." },
    es: { n: "Kickflip", steps: ["Primero ten un ollie firme.", "Pie de adelante en ángulo, justo detrás de los tornillos delanteros, con los dedos cerca del borde del lado de los dedos. Pie de atrás en la cola.", "Agáchate, golpea la cola y desliza el pie de adelante hacia la nariz, como un ollie.", "Al final, raspa con el pie de adelante la esquina de la nariz del lado de los dedos.", "Sube bien las rodillas. La tabla gira bajo ti.", "Cuando veas otra vez la lija, atrápala con el pie de atrás, luego el de adelante, y aterriza sobre los tornillos."], fixes: [["La tabla gira pero se va adelante", "Raspa más hacia el lado y menos hacia adelante."], ["No da la vuelta completa", "Raspa justo la esquina de la nariz, con golpe."], ["Caigo sobre el borde", "Espera a ver la lija antes de bajar los pies."]], sci: "Raspar la esquina da a la tabla un empuje de giro sobre su eje largo. Gira unos 720° por segundo en medio segundo de aire." } },
  { id: "heelflip", lv: 3, room: "flip", feet: { f: [0.08, 0.03, 0], b: [-0.33, 0.02, 0] }, arrows: [{ from: [0.1, 0.03], to: [0.33, -0.13] }],
    en: { n: "Heelflip", steps: ["Front foot straight across the board, toes hanging a little over the toe-side edge. Back foot on the tail.", "Crouch and snap the tail like an ollie.", "Slide your front foot up, then kick your heel off the heel-side corner of the nose, forward and out.", "Lift your knees; the board flips the other way from a kickflip.", "Catch it with both feet over the bolts and bend your knees."], fixes: [["The board flies away behind you", "Kick forward more and less to the side."], ["It turns sideways", "Keep your shoulders square to the board."]], sci: "The heel pushes the heel-side edge, a torque about the long axis in the opposite direction to a kickflip." },
    es: { n: "Heelflip", steps: ["Pie de adelante recto, de lado, con los dedos un poco fuera del borde del lado de los dedos. Pie de atrás en la cola.", "Agáchate y golpea la cola como en un ollie.", "Desliza el pie de adelante y luego golpea con el talón la esquina de la nariz del lado de los talones, hacia adelante y afuera.", "Sube las rodillas; la tabla gira al revés que en un kickflip.", "Atrápala con los dos pies sobre los tornillos y dobla las rodillas."], fixes: [["La tabla se va hacia atrás", "Golpea más hacia adelante y menos hacia el lado."], ["Gira de lado", "Mantén los hombros alineados con la tabla."]], sci: "El talón empuja el borde del lado de los talones, un torque sobre el eje largo en dirección contraria al kickflip." } },
  { id: "fs180", lv: 3, room: "flip", feet: { f: [0.1, 0, 10], b: [-0.3, 0, 5] },
    en: { n: "Frontside 180", steps: ["Get a steady ollie first.", "Before you pop, wind your shoulders back, away from where you will turn.", "Pop an ollie and turn your shoulders toward your front side (your chest leads).", "Your hips and the board follow your shoulders, half a turn.", "Land rolling backward (fakie), knees bent, and look where you are going."], fixes: [["I only turn a quarter", "Wind up more before the pop, and lead with your head."], ["I land off the board", "Pop straight up and keep your feet over the bolts."]], sci: "All the spin must start while the wheels touch the ground. In the air, your angular momentum stays the same; pulling your arms in spins you faster." },
    es: { n: "Frontside 180", steps: ["Primero ten un ollie firme.", "Antes del golpe, gira los hombros hacia atrás, al lado contrario del giro.", "Haz un ollie y gira los hombros hacia tu frente (el pecho guía).", "La cadera y la tabla siguen a los hombros, media vuelta.", "Aterriza rodando hacia atrás (fakie), rodillas dobladas, y mira adonde vas."], fixes: [["Solo giro un cuarto", "Gira más los hombros antes del golpe y guía con la cabeza."], ["Caigo fuera de la tabla", "Salta recto y deja los pies sobre los tornillos."]], sci: "Todo el giro debe empezar mientras las ruedas tocan el suelo. En el aire tu momento angular no cambia; juntar los brazos te hace girar más rápido." } },
  { id: "fifty", lv: 4, room: "grind", feet: { f: [0.15, 0, 5], b: [-0.2, 0, 5] },
    en: { n: "50-50 grind", steps: ["Start on a low painted curb or a low flat bar, with a helmet and pads. Wax the edge.", "Roll toward the curb at a slight angle, at a steady, medium speed.", "Ollie up so both trucks land on the edge, front and back, with your feet over the bolts.", "Keep your weight centered over the edge and your knees bent. Look at the end.", "At the end, lift the nose a little and roll off, or ollie off."], fixes: [["I slide off the side", "Come in at a smaller angle and land with your weight centered over the edge."], ["I stop on the curb", "Come in faster, or add wax."]], sci: "Friction slows you at μg the whole way. The distance you can grind is v² / (2μg): double your speed and you go four times as far." },
    es: { n: "Grind 50-50", steps: ["Empieza en un bordillo pintado bajo o una barra plana baja, con casco y protecciones. Pon cera en el borde.", "Rueda hacia el bordillo en un ángulo pequeño, a una rapidez media y pareja.", "Haz un ollie para que los dos ejes caigan en el borde, con los pies sobre los tornillos.", "Peso centrado sobre el borde y rodillas dobladas. Mira el final.", "Al final, sube un poco la nariz y sal rodando, o sal con un ollie."], fixes: [["Me resbalo por el lado", "Entra con menos ángulo y cae con el peso centrado sobre el borde."], ["Me detengo en el bordillo", "Entra más rápido o pon más cera."]], sci: "La fricción te frena a μg todo el camino. La distancia que puedes hacer es v² / (2μg): duplica la rapidez y llegas cuatro veces más lejos." } },
  { id: "fiveo", lv: 4, room: "grind", feet: { f: [0.12, 0, 5], b: [-0.3, 0, 5] },
    en: { n: "5-0 grind", steps: ["Get a steady 50-50 first, on a low curb with wax.", "Ollie onto the curb so only the back truck lands on the edge.", "Keep the nose up by keeping your weight over the back truck, like a manual.", "Look at the end of the curb.", "Push the nose down or ollie off at the end."], fixes: [["The nose drops onto the curb", "Keep more weight over the back truck."], ["The tail scrapes", "Shift forward a little so the tail stays up."]], sci: "A 5-0 is a manual on an edge: your weight's line falls right over the back truck." },
    es: { n: "Grind 5-0", steps: ["Primero ten un 50-50 firme, en un bordillo bajo con cera.", "Haz un ollie al bordillo para que solo el eje de atrás caiga en el borde.", "Mantén la nariz arriba con el peso sobre el eje de atrás, como un manual.", "Mira el final del bordillo.", "Baja la nariz o sal con un ollie al final."], fixes: [["La nariz cae al bordillo", "Deja más peso sobre el eje de atrás."], ["La cola raspa", "Muévete un poco adelante para que la cola quede arriba."]], sci: "Un 5-0 es un manual sobre un borde: la línea de tu peso cae justo sobre el eje de atrás." } },
  { id: "boardslide", lv: 4, room: "grind", feet: { f: [0.15, 0, 5], b: [-0.2, 0, 5] },
    en: { n: "Boardslide", steps: ["Start on a low flat bar or a waxed curb, with a helmet and pads.", "Roll alongside the bar, close and nearly parallel to it.", "Ollie and turn the board a quarter turn so the middle of the deck lands across the bar.", "Keep your weight centered over the bar and your knees bent.", "At the end, turn the board back a quarter turn and land rolling."], fixes: [["I fall off the far side", "Keep your weight centered and don't lean over the bar."], ["I stop on the bar", "Come in faster or wax the bar."]], sci: "The wood or plastic under the deck slides on metal with less friction than you might think; wax lowers it more." },
    es: { n: "Boardslide", steps: ["Empieza en una barra plana baja o un bordillo con cera, con casco y protecciones.", "Rueda al lado de la barra, cerca y casi paralelo.", "Haz un ollie y gira la tabla un cuarto de vuelta para que el centro de la tabla caiga atravesado sobre la barra.", "Peso centrado sobre la barra y rodillas dobladas.", "Al final, gira la tabla de vuelta un cuarto y aterriza rodando."], fixes: [["Me caigo del otro lado", "Mantén el peso centrado y no te inclines sobre la barra."], ["Me detengo en la barra", "Entra más rápido o pon cera en la barra."]], sci: "La madera o el plástico bajo la tabla resbala en el metal con poca fricción; la cera la baja más." } },
  { id: "rockfakie", lv: 4, room: "ramp", feet: { f: [0.12, 0, 5], b: [-0.3, 0, 5] },
    en: { n: "Rock to fakie", steps: ["On a small ramp you can drop in on, with full pads and a helmet.", "Ride up the ramp toward the coping with enough speed to reach the top.", "Lift the front wheels and set the middle of the board on the coping, front wheels over the deck.", "Press the tail to lift the front wheels back over the coping.", "Roll back down the ramp backward (fakie), weight centered, knees bent."], fixes: [["The front wheels hang up on the coping", "Press the tail more firmly before rolling back."], ["I don't reach the coping", "Pump the ramp to gain speed."]], sci: "You need enough motion energy at the bottom to rise to the coping: ½·m·v² must be at least m·g·h." },
    es: { n: "Rock to fakie", steps: ["En una rampa pequeña en la que ya puedas entrar, con protecciones y casco.", "Sube por la rampa hacia el coping con rapidez para llegar arriba.", "Sube las ruedas de adelante y apoya el centro de la tabla en el coping, con las ruedas delanteras sobre la plataforma.", "Presiona la cola para pasar las ruedas de adelante de vuelta sobre el coping.", "Baja por la rampa hacia atrás (fakie), peso centrado, rodillas dobladas."], fixes: [["Las ruedas de adelante se atoran en el coping", "Presiona la cola más firme antes de volver."], ["No llego al coping", "Bombea la rampa para ganar rapidez."]], sci: "Necesitas suficiente energía de movimiento abajo para subir al coping: ½·m·v² debe ser al menos m·g·h." } },
  { id: "fall", lv: 1, room: "balance", feet: { f: [0.13, 0, 10], b: [-0.17, 0, 5] },
    en: { n: "Falling safely", steps: ["Practice on grass, in a helmet, wrist guards and pads.", "When you feel yourself going, crouch low: you have less far to fall.", "Do not catch yourself with locked, straight arms.", "Roll onto your side or shoulder, or slide on your knee pads.", "Step off the board on purpose when a trick goes wrong. That is a skill too."], fixes: [["I always put my hands out", "Practice rolling on grass slowly, many times, until it feels natural."], ["I'm scared of falling", "That is a normal, useful signal. Break the trick into smaller steps."]], sci: "Rolling and sliding spread the stop over more time and more of your body, so the force on any one place is smaller." },
    es: { n: "Caer con seguridad", steps: ["Practica en el pasto, con casco, muñequeras y protecciones.", "Cuando sientas que te caes, agáchate: caes desde menos altura.", "No te sostengas con los brazos rectos y rígidos.", "Rueda sobre tu lado o tu hombro, o deslízate sobre las rodilleras.", "Bájate de la tabla a propósito cuando un truco sale mal. Eso también es una habilidad."], fixes: [["Siempre pongo las manos", "Practica rodar en el pasto despacio, muchas veces, hasta que salga natural."], ["Me da miedo caer", "Es una señal normal y útil. Divide el truco en pasos más pequeños."]], sci: "Rodar y deslizarse reparten la parada en más tiempo y más partes del cuerpo, así la fuerza en un solo lugar es menor." } }
];
const LV = { 1: ["First steps", "Primeros pasos"], 2: ["Rolling", "Rodando"], 3: ["Pop and flip", "Saltar y girar"], 4: ["Grinds and ramps", "Grinds y rampas"] };
function drawFoot(x, y, ang, col, mirror) {   // a shoe from above, in board meters (toes toward the toe side, +y)
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang * DEG * mirror);
  ctx.fillStyle = col; ctx.globalAlpha = .85;
  ctx.beginPath(); ctx.ellipse(0, 0.0, 0.05, 0.135, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1; ctx.strokeStyle = C.ink; ctx.lineWidth = 0.004; ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0.1, 0.012, 0, 7); ctx.fill();   // the toe end
  ctx.restore();
}
function drawTricks() {
  const t = TRICKS.find(x => x.id === S.tricks.id) || TRICKS[0];
  const mir = S.stance === "goofy" ? -1 : 1;
  const sc = Math.min((W - 100) / 1.0, (H - 120) / 0.62), cx = W / 2, cy = H / 2 + 6;
  text(L("From above", "Desde arriba"), 16, 34, { w: 700, m: .9, c: C.soft });
  text((S.stance === "goofy" ? "Goofy" : "Regular") + " · " + L("nose →", "nariz →").replace("→", mir > 0 ? "→" : "←"), W - 16, 34, { a: "right", m: .9, c: C.soft });
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc * mir, sc);
  // the board from above: rounded ends, grip, bolts
  const hl = 0.4, hw = 0.105;
  ctx.fillStyle = C.grip; ctx.beginPath(); ctx.moveTo(-hl + hw, -hw); ctx.lineTo(hl - hw, -hw); ctx.arc(hl - hw, 0, hw, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-hl + hw, hw); ctx.arc(-hl + hw, 0, hw, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.deck; ctx.lineWidth = 0.01; ctx.stroke();
  ctx.save(); ctx.globalAlpha = .4; ctx.strokeStyle = C.wheel; ctx.lineWidth = 0.004; [-0.29, 0.29].forEach(x => { ctx.beginPath(); ctx.moveTo(x, -hw); ctx.lineTo(x, hw); ctx.stroke(); }); ctx.restore();
  ctx.fillStyle = C.truck; [-0.18, 0.18].forEach(x => [-0.025, 0.025].forEach(dy => [-0.014, 0.014].forEach(dx => { ctx.beginPath(); ctx.arc(x + dx, dy, 0.006, 0, 7); ctx.fill(); })));
  const fF = t.feet.f, fB = t.feet.b;
  drawFoot(fB[0], fB[1], fB[2], C.pe, mir); drawFoot(fF[0], fF[1], fF[2], C.ke, mir);
  ctx.restore();
  // arrows (screen space)
  (t.arrows || []).forEach(a => {
    const sx = x => cx + x * sc * mir, sy = y => cy + y * sc;
    if (a.down) { ctx.save(); ctx.strokeStyle = C.force; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx(a.from[0]), sy(a.from[1]), 22, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(sx(a.from[0]), sy(a.from[1]), 6, 0, 7); ctx.fillStyle = C.force; ctx.fill(); ctx.restore(); text(L("snap down", "golpe abajo"), sx(a.from[0]), sy(a.from[1]) + 46, { a: "center", m: .8, c: C.force, bg: C.sky }); return; }
    arrow(sx(a.from[0]), sy(a.from[1]), sx(a.to[0]), sy(a.to[1]), C.force, 5);
  });
  text(L("Toe side", "Lado de los dedos"), cx, cy + 0.105 * sc + 34, { a: "center", m: .85, c: C.soft });
  text(L("Heel side", "Lado de los talones"), cx, cy - 0.105 * sc - 18, { a: "center", m: .85, c: C.soft });
  text(L("Tail", "Cola"), cx - 0.4 * sc * mir - 20 * mir, cy + 6, { a: mir > 0 ? "right" : "left", m: .85, c: C.soft });
  text(L("Nose", "Nariz"), cx + 0.4 * sc * mir + 20 * mir, cy + 6, { a: mir > 0 ? "left" : "right", m: .85, c: C.soft });
}
function tricksPanel() {
  const t = TRICKS.find(x => x.id === S.tricks.id) || TRICKS[0], c = es() ? t.es : t.en, i = TRICKS.indexOf(t);
  const groups = [1, 2, 3, 4].map(lv => `<optgroup label="${esc(L(LV[lv][0], LV[lv][1]))}">${TRICKS.filter(x => x.lv === lv).map(x => `<option value="${x.id}" ${x.id === t.id ? "selected" : ""}>${esc(es() ? x.es.n : x.en.n)}</option>`).join("")}</optgroup>`).join("");
  const ROOMN = { ramp: L("Ramp and energy", "Rampa y energía"), ollie: L("The ollie", "El ollie"), grind: L("Grinds and slides", "Grinds y slides"), balance: L("Balance and turning", "Equilibrio y giros"), flip: L("Flips and spins", "Flips y giros") };
  return `<p class="kicker">${L("Room 7 · How to", "Sala 7 · Cómo se hace")}</p>
  <h2>${L("Trick book", "Libro de trucos")}</h2>
  <div class="ctl"><label for="kT">${L("Pick a trick", "Elige un truco")}</label><select class="sel" id="kT">${groups}</select></div>
  <div class="ctl"><div class="seg"><button type="button" data-st="regular" aria-pressed="${S.stance === "regular"}">${L("Regular", "Regular")}</button><button type="button" data-st="goofy" aria-pressed="${S.stance === "goofy"}">Goofy</button></div></div>
  <h3>${esc(c.n)}</h3>
  <p><span class="tag">${esc(L(LV[t.lv][0], LV[t.lv][1]))}</span><span class="tag">${L("Helmet on", "Con casco")}</span>${t.lv >= 2 ? `<span class="tag">${L("Wrist guards and pads", "Muñequeras y protecciones")}</span>` : ""}</p>
  <p class="legend"><span><i style="background:var(--cv-ke)"></i>${L("Front foot", "Pie de adelante")}</span><span><i style="background:var(--cv-pe)"></i>${L("Back foot", "Pie de atrás")}</span><span><i style="background:var(--cv-force)"></i>${L("What the foot does", "Lo que hace el pie")}</span></p>
  <ol class="tsteps">${c.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
  <h3>${L("If this happens, try this", "Si pasa esto, prueba esto")}</h3>
  <div class="fixes">${c.fixes.map(f => `<div><b>${esc(f[0])}</b>${esc(f[1])}</div>`).join("")}</div>
  <div class="note"><b>${L("The science", "La ciencia")}:</b> ${esc(c.sci)}</div>
  <div class="row"><button type="button" class="btn" data-go="${t.room}">${L("Try it in", "Pruébalo en")}: ${ROOMN[t.room]}</button></div>
  <div class="row" style="margin-top:.5rem"><button type="button" class="btn" id="kPrev" ${i ? "" : "disabled"}>◀ ${L("Previous", "Anterior")}</button><button type="button" class="btn" id="kNext" ${i < TRICKS.length - 1 ? "" : "disabled"}>${L("Next", "Siguiente")} ▶</button></div>
  <p class="hint muted">${L("Learn in a smooth, safe place away from cars. Children ride with a grown-up nearby. Never hold on to a moving car or bike.", "Aprende en un lugar liso y seguro, lejos de los autos. Los niños patinan con un adulto cerca. Nunca te agarres de un auto o una bici en movimiento.")}</p>`;
}
function tricksWire() {
  $("kT").onchange = e => { S.tricks.id = e.target.value; save(); panel(); paint(); };
  document.querySelectorAll("#panel [data-st]").forEach(b => b.onclick = () => { S.stance = b.getAttribute("data-st"); save(); panel(); paint(); });
  const i = TRICKS.findIndex(x => x.id === S.tricks.id);
  $("kPrev").onclick = () => { S.tricks.id = TRICKS[Math.max(0, i - 1)].id; save(); panel(); paint(); };
  $("kNext").onclick = () => { S.tricks.id = TRICKS[Math.min(TRICKS.length - 1, i + 1)].id; save(); panel(); paint(); };
  document.querySelectorAll("#panel [data-go]").forEach(b => b.onclick = () => openRoom(b.getAttribute("data-go"), true));
}

/* ══ ROOM 8 — build a board (AOG-SKATE-BUILD-V1, 2026-10-11) ═════════════════════════════════════════════
   Jimmy: suggestions on boards, wheels, trucks. Pick a size and what you will do most; get a whole setup with the
   reason for each part; then change any part and the checks answer: do the trucks fit the deck (axle width within
   about 1/4 inch of the deck), do the wheels suit the ground, will the wheels bite? Wheel bite is a simple model,
   drawn from the front at full lean: the deck sits 53 mm above the axle (a mid truck) plus the riser; leaning by φ
   (soft 15°, medium 11°, hard 8°) lowers the deck over a wheel by x·sin φ, where x is the wheel's distance from the
   middle. Clearance = 53 + riser − wheel radius − x·sin φ. Sizes are typical shop ranges, never rules. */
const RIDERS = {
  micro: { d: [6.5, 7.0], bush: "soft", en: "Little kid, about age 5 and under", es: "Niño pequeño, unos 5 años o menos" },
  mini: { d: [7.0, 7.3], bush: "soft", en: "Kid, about 6 to 8", es: "Niño, unos 6 a 8 años" },
  mid: { d: [7.3, 7.6], bush: "soft", en: "Kid, about 9 to 12", es: "Niño, unos 9 a 12 años" },
  s: { d: [7.75, 8.0], bush: "med", en: "Teen or adult, small feet (US men's 6–8)", es: "Joven o adulto, pies pequeños (EE. UU. 6–8)" },
  m: { d: [8.0, 8.25], bush: "med", en: "Teen or adult, medium feet (US men's 8½–10½)", es: "Joven o adulto, pies medianos (EE. UU. 8½–10½)" },
  l: { d: [8.25, 8.75], bush: "med", en: "Teen or adult, large feet (US men's 11 and up)", es: "Joven o adulto, pies grandes (EE. UU. 11 o más)" }
};
const USES = {
  tricks: { w: [51, 54], a: [99, 101], riser: 0, type: "pop", add: 0, en: "Learn tricks on smooth ground", es: "Aprender trucos en suelo liso" },
  ramps: { w: [54, 58], a: [99, 101], riser: 0, type: "pop", add: 0.25, en: "Ride ramps and bowls", es: "Montar rampas y bowls" },
  rough: { w: [54, 56], a: [87, 92], riser: 0, type: "pop", add: 0, en: "Roll on rough sidewalks", es: "Rodar en aceras ásperas" },
  cruise: { w: [56, 60], a: [78, 87], riser: 3.2, type: "cruiser", add: 0.25, en: "Cruise paths and get around", es: "Pasear por senderos y moverte" }
};
const BUSH = { soft: { phi: 15, en: "Soft", es: "Blandas" }, med: { phi: 11, en: "Medium", es: "Medias" }, hard: { phi: 8, en: "Hard", es: "Duras" } };
const RISERS = [0, 3.2, 6.4];
const in8 = x => Math.round(x * 8) / 8;
function suggestBoard(rider, use) {
  const R = RIDERS[rider], U = USES[use], small = rider === "micro";
  const d = [in8(R.d[0] + U.add), in8(R.d[1] + U.add)], deck = in8((d[0] + d[1]) / 2);
  const w = small ? [U.w[0] - 1, U.w[1] - 2] : U.w, wheel = Math.round((w[0] + w[1]) / 2), duro = Math.round((U.a[0] + U.a[1]) / 2);
  const riser = wheel >= 56 ? Math.max(U.riser, 3.2) : U.riser;
  return { deckRange: d, deck, axle: deck, wheelRange: w, wheel, duroRange: U.a, duro, riser, bush: R.bush, type: U.type };
}
function inch(x) {   // 8.125 → 8⅛″ (skate shops write eighths)
  const n = Math.round(x * 8), w = Math.floor(n / 8), f = n % 8;
  return (w ? w : "") + ["", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"][f] + "″";
}
function boltFor(riser) { return riser < 1 ? [0.875, "7/8"] : riser < 5 ? [1.0, "1"] : [1.25, "1¼"]; }
function boardCheck(o) {
  const fitDiff = o.axle - o.deck;
  const x = o.axle * 25.4 / 2 - 10, phi = BUSH[o.bush].phi * DEG;
  const clear = 53 + o.riser - o.wheel / 2 - x * Math.sin(phi);
  const where = o.use, hardOK = where === "rough" || where === "cruise" ? o.duro <= 92 : o.duro >= 95;
  return { fitDiff, fit: Math.abs(fitDiff) <= 0.25 ? "ok" : fitDiff < 0 ? "narrow" : "wide", clear, bite: clear < 0 ? "bite" : clear < 3 ? "close" : "ok", hardOK, x, phi };
}
function drawBuild() {
  const o = S.build, ch = boardCheck(o), half = W * 0.52;
  // the front view at full lean (left)
  const r = o.wheel / 2, H0 = 53 + o.riser, Wd = o.deck * 25.4, ax = o.axle * 25.4;
  const sc = Math.min((half - 50) / Math.max(Wd, ax + 40), (H - 120) / 150), ox = half / 2, oy = Math.min(H - 70, H / 2 + 75 * sc);
  const X = x => ox + x * sc, Y = y => oy - y * sc;
  const narrow = sizedW < 600;
  text(narrow ? L("Front, full lean", "De frente") : L("From the front, leaning all the way", "De frente, inclinada al máximo"), 16, 34, { w: 700, m: .85, c: C.soft });
  ctx.fillStyle = C.ground; ctx.fillRect(0, Y(0), half, H);
  const xw = ch.x;   // wheel's distance from the middle (to its inner top), as in the check
  [-1, 1].forEach(sd => { const cx = sd * (ax / 2 - 16); ctx.fillStyle = C.wheel; ctx.strokeStyle = C["ramp-edge"]; ctx.lineWidth = 2; roundRect(X(cx - 16), Y(2 * r), 32 * sc, 2 * r * sc, 4); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = C.truck; ctx.fillRect(X(-ax / 2), Y(r + 4), ax * sc, 8 * sc);           // the axle and hanger
  ctx.fillRect(X(-18), Y(r + 30), 36 * sc, 26 * sc);                                    // the hanger body
  ctx.fillStyle = C.soft; ctx.fillRect(X(-11), Y(r + 53), 22 * sc, 23 * sc);              // the kingpin and bushings between hanger and baseplate
  ctx.save(); ctx.translate(X(0), Y(r + 53)); ctx.rotate(ch.phi);                       // baseplate top: riser and deck stack above it and tilt with it
  ctx.fillStyle = C.truck; ctx.fillRect(-30 * sc, 0, 60 * sc, 6 * sc);
  if (o.riser) { ctx.fillStyle = C.soft; ctx.fillRect(-32 * sc, -o.riser * sc, 64 * sc, o.riser * sc); }
  ctx.fillStyle = C.deck; ctx.fillRect(-Wd / 2 * sc, -(o.riser + 11) * sc, Wd * sc, 11 * sc);
  ctx.fillStyle = C.grip; ctx.fillRect(-Wd / 2 * sc, -(o.riser + 12) * sc, Wd * sc, 1.6 * sc);
  ctx.restore();
  // the gap over the low wheel (the right side drops when the deck turns clockwise on screen)
  const gx = X(xw), wheelTop = Y(2 * r), deckLow = Y(r + H0 - xw * Math.sin(ch.phi));
  const col = ch.bite === "bite" ? C.force : ch.bite === "close" ? C.warn : C.good;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx, wheelTop); ctx.lineTo(gx, deckLow); ctx.stroke(); ctx.restore();
  text((ch.clear < 0 ? L("hits: ", "choca: ") : L("gap ", "espacio ")) + num(Math.abs(ch.clear), 0) + " mm", Math.min(gx + 10, half - 10), (wheelTop + deckLow) / 2 - 30, { m: .85, c: col, bg: C.sky, a: gx + 10 > half - 140 ? "right" : "left" });
  text(L(BUSH[o.bush].en, BUSH[o.bush].es) + " · " + BUSH[o.bush].phi + "°", ox, Y(0) + 32, { a: "center", m: .8, c: C.soft });
  // from above (right): the deck outline and the wheels at the ends of the axles
  ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(half, 12); ctx.lineTo(half, H - 12); ctx.stroke();
  text(L("From above", "Desde arriba"), half + 16, 34, { w: 700, m: .85, c: C.soft });
  const len = (o.type === "cruiser" ? 30 : 31.5) * 25.4, s2 = Math.min((W - half - 70) / Math.max(Wd, ax + 40), (H - FS * 4.6 - 60) / len);
  const cx2 = half + (W - half) / 2, cy2 = 30 + FS + len * s2 / 2;
  ctx.save(); ctx.translate(cx2, cy2); ctx.scale(s2, s2);
  const hw = Wd / 2, hl = len / 2, nose = o.type === "cruiser" ? hw * 0.9 : hw;
  ctx.fillStyle = C.grip; ctx.beginPath(); ctx.moveTo(-hw, -hl + hw); ctx.arc(0, -hl + hw, hw, Math.PI, 0); ctx.lineTo(hw, hl - nose); ctx.arc(0, hl - nose, hw, 0, Math.PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.deck; ctx.lineWidth = 4 / s2; ctx.stroke();
  const wb = 14.25 * 25.4 / 2;
  [-wb, wb].forEach(y => {
    ctx.fillStyle = C.truck; ctx.fillRect(-ax / 2, y - 5, ax, 10);
    [-1, 1].forEach(sd => { ctx.fillStyle = C.wheel; ctx.strokeStyle = C["ramp-edge"]; ctx.lineWidth = 2 / s2; ctx.fillRect(sd * ax / 2 - (sd > 0 ? 32 : 0), y - r, 32, 2 * r); ctx.strokeRect(sd * ax / 2 - (sd > 0 ? 32 : 0), y - r, 32, 2 * r); });
  });
  ctx.restore();
  const over = (ax - Wd) / 2;
  text(L("Deck ", "Tabla ") + inch(o.deck) + " · " + L("axle ", "eje ") + inch(o.axle), cx2, H - 44, { a: "center", m: .85, c: C.ink });
  text(ch.fit === "ok" ? L("trucks fit the deck", "los ejes encajan con la tabla") : over > 0 ? L("wheels stick out ", "las ruedas sobresalen ") + num(over, 0) + " mm" : L("trucks too narrow by ", "ejes angostos por ") + num(-over, 0) + " mm", cx2, H - 18, { a: "center", m: .85, c: ch.fit === "ok" ? C.good : C.warn });
}
function buildUnder() {
  const o = S.build, ch = boardCheck(o), b = boltFor(o.riser);
  return `<div class="reads">
    <div class="read"><div class="k">${L("Deck", "Tabla")}</div><div class="v">${inch(o.deck)}</div><div class="u">${num(o.deck * 2.54, 1)} cm</div></div>
    <div class="read"><div class="k">${L("Wheels", "Ruedas")}</div><div class="v">${o.wheel} mm</div><div class="u">${o.duro}A</div></div>
    <div class="read"><div class="k">${L("Clearance", "Espacio")}</div><div class="v">${num(ch.clear, 0)} mm</div><div class="u">${L("at full lean", "inclinada al máximo")}</div></div>
    <div class="read"><div class="k">${L("Bolts", "Tornillos")}</div><div class="v">${b[1]}″</div><div class="u">${L("8 bearings, size 608", "8 rodamientos, tamaño 608")}</div></div>
  </div>`;
}
function buildPanel() {
  const o = S.build, sg = suggestBoard(o.rider, o.use), ch = boardCheck(o), b = boltFor(sg.riser);
  const seg = (k, v, l) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="${String(o[k]) === String(v)}">${l}</button>`;
  const rng = (a, u) => u === "in" ? inch(a[0]).replace("″", "") + "–" + inch(a[1]) : a[0] + "–" + a[1] + u;
  const typeName = sg.type === "cruiser" ? L("A cruiser: big soft wheels, made for rolling and carving", "Un cruiser: ruedas grandes y blandas, para rodar y hacer curvas") : L("A standard trick board (popsicle shape, a kick at each end)", "Una tabla de trucos estándar (forma de paleta, con dos colas)");
  const notes = [];
  notes.push(ch.fit === "ok" ? ["good", L("The trucks fit the deck: the wheels sit right under its edges.", "Los ejes encajan con la tabla: las ruedas quedan justo bajo sus bordes.")] :
    ch.fit === "narrow" ? ["warn", L("The trucks are narrower than the deck by more than a quarter inch. The board will feel tippy. Choose trucks with an axle closer to the deck's width.", "Los ejes son más angostos que la tabla por más de un cuarto de pulgada. La tabla se sentirá inestable. Elige ejes más cercanos al ancho de la tabla.")] :
    ["warn", L("The trucks are wider than the deck by more than a quarter inch. The wheels stick out, where they catch on ledges and your shoes.", "Los ejes son más anchos que la tabla por más de un cuarto de pulgada. Las ruedas sobresalen y se enganchan en bordes y zapatos.")]);
  notes.push(ch.bite === "bite" ? ["warn", L("Wheel bite: at full lean the deck reaches the wheel and stops it. Add a riser pad, choose harder bushings or smaller wheels.", "Wheel bite: inclinada al máximo, la tabla toca la rueda y la frena. Añade un riser, gomas más duras o ruedas más pequeñas.")] :
    ch.bite === "close" ? ["warn", L("Close to wheel bite: only a few millimeters to spare at full lean. A riser pad would help.", "Casi wheel bite: quedan pocos milímetros inclinada al máximo. Un riser ayudaría.")] :
    ["good", L("No wheel bite: there is room over the wheels even at full lean.", "Sin wheel bite: hay espacio sobre las ruedas aun inclinada al máximo.")]);
  notes.push(ch.hardOK ? ["good", L("The wheel hardness suits where you will ride.", "La dureza de las ruedas va bien con donde patinarás.")] :
    (o.use === "rough" || o.use === "cruise") ? ["warn", L("These wheels are hard for rough ground. Every crack will shake the board. Softer wheels (about 78A to 92A) roll over it.", "Estas ruedas son duras para suelo áspero. Cada grieta sacudirá la tabla. Las ruedas blandas (unos 78A a 92A) pasan por encima.")] :
    ["warn", L("These wheels are soft for smooth ground and tricks. They grip well but feel slow and sticky for slides. Harder wheels (about 95A to 101A) suit it better.", "Estas ruedas son blandas para suelo liso y trucos. Agarran bien pero se sienten lentas para deslizar. Las más duras (unos 95A a 101A) van mejor.")]);
  return `<p class="kicker">${L("Start here · Gear", "Empieza aquí · Equipo")}</p>
  <h2>${L("Build a board", "Arma una tabla")}</h2>
  <p class="say">${L("Tell the lab your size and what you will do most. It suggests a whole setup and says why. Then change any part and watch the checks.", "Dile al laboratorio tu tamaño y lo que más harás. Te sugiere una tabla completa y explica por qué. Luego cambia cualquier pieza y mira las comprobaciones.")}</p>
  <div class="ctl"><label for="bdR">${L("Who will ride it?", "¿Quién la va a usar?")}</label><select class="sel" id="bdR">${Object.keys(RIDERS).map(k => `<option value="${k}" ${o.rider === k ? "selected" : ""}>${esc(L(RIDERS[k].en, RIDERS[k].es))}</option>`).join("")}</select></div>
  <div class="ctl"><label for="bdU">${L("What will you do most?", "¿Qué harás más?")}</label><select class="sel" id="bdU">${Object.keys(USES).map(k => `<option value="${k}" ${o.use === k ? "selected" : ""}>${esc(L(USES[k].en, USES[k].es))}</option>`).join("")}</select></div>
  <h3>${L("Suggested setup", "Tabla sugerida")}</h3>
  <div class="fixes">
    <div><b>${typeName}</b></div>
    <div><b>${L("Deck", "Tabla")}: ${rng(sg.deckRange, "in")} ${L("wide", "de ancho")}</b>${L("Wide enough for your feet to sit across it over the bolts.", "Suficiente para que tus pies queden de lado sobre los tornillos.")}${o.use === "ramps" || o.use === "cruise" ? " " + L("A little wider for steady landings and rolling.", "Un poco más ancha para aterrizar y rodar con estabilidad.") : ""}</div>
    <div><b>${L("Trucks: axle about", "Ejes: eje de unos")} ${rng(sg.deckRange, "in")}</b>${L("Match the axle width to the deck (within about ¼ inch). Each maker lists its axle widths on a size chart.", "El ancho del eje igual al de la tabla (con ¼ de pulgada de diferencia). Cada fabricante publica sus anchos.")}</div>
    <div><b>${L("Wheels", "Ruedas")}: ${rng(sg.wheelRange, " mm")}, ${rng(sg.duroRange, "A")}</b>${o.use === "tricks" ? L("Small and hard: light to pop, fast on smooth ground.", "Pequeñas y duras: ligeras para saltar, rápidas en suelo liso.") : o.use === "ramps" ? L("A little bigger to carry speed; hard for smooth ramps.", "Un poco más grandes para mantener la rapidez; duras para rampas lisas.") : o.use === "rough" ? L("Softer, so cracks and pebbles do not stop you.", "Más blandas, para que grietas y piedritas no te frenen.") : L("Big and soft: smooth and quiet over rough paths.", "Grandes y blandas: suaves y silenciosas en senderos ásperos.")}</div>
    <div><b>${L("Bushings", "Gomas")}: ${L(BUSH[sg.bush].en, BUSH[sg.bush].es)}</b>${sg.bush === "soft" ? L("Light riders turn easily on soft bushings.", "Los patinadores ligeros giran fácil con gomas blandas.") : L("Medium is a good start; heavier riders often choose harder ones.", "Medias es un buen comienzo; los más pesados suelen elegir más duras.")}</div>
    <div><b>${L("Riser pad", "Riser")}: ${sg.riser ? L("⅛ inch", "⅛ de pulgada") : L("none", "ninguno")} · ${L("bolts", "tornillos")} ${b[1]}″</b>${sg.riser ? L("Lifts the deck away from bigger wheels to prevent wheel bite.", "Separa la tabla de las ruedas grandes para evitar el wheel bite.") : L("Not needed with these wheels.", "No hace falta con estas ruedas.")}</div>
    <div><b>${L("Bearings: 8, size 608", "Rodamientos: 8, tamaño 608")}</b>${L("Two in each wheel. Almost every skateboard wheel takes this size.", "Dos en cada rueda. Casi todas las ruedas usan este tamaño.")}</div>
  </div>
  <div class="row" style="margin:.6rem 0"><button type="button" class="btn btn-steel" id="bdUse">${L("Show this setup", "Mostrar esta tabla")}</button></div>
  <h3>${L("Try it yourself", "Pruébalo tú")}</h3>
  <div class="ctl"><label for="bdD">${L("Deck width", "Ancho de la tabla")} <output>${inch(o.deck)}</output></label><input type="range" id="bdD" min="6.5" max="9.5" step="0.125" value="${o.deck}"></div>
  <div class="ctl"><label for="bdA">${L("Truck axle width", "Ancho del eje")} <output>${inch(o.axle)}</output></label><input type="range" id="bdA" min="6.5" max="9.5" step="0.125" value="${o.axle}"></div>
  <div class="ctl"><label for="bdW">${L("Wheel size", "Tamaño de rueda")} <output>${o.wheel} mm</output></label><input type="range" id="bdW" min="48" max="64" step="1" value="${o.wheel}"></div>
  <div class="ctl"><label for="bdH">${L("Wheel hardness", "Dureza de rueda")} <output>${o.duro}A</output></label><input type="range" id="bdH" min="78" max="101" step="1" value="${o.duro}"></div>
  <div class="ctl"><span class="lab">${L("Riser pad", "Riser")}</span><div class="seg">${seg("riser", 0, L("None", "Ninguno"))}${seg("riser", 3.2, "⅛″")}${seg("riser", 6.4, "¼″")}</div></div>
  <div class="ctl"><span class="lab">${L("Bushings", "Gomas")}</span><div class="seg">${Object.keys(BUSH).map(k => seg("bush", k, L(BUSH[k].en, BUSH[k].es))).join("")}</div></div>
  ${notes.map(n => `<div class="note ${n[0]}">${n[1]}</div>`).join("")}
  <div class="math">${L("Clearance at full lean (simple model)", "Espacio inclinada al máximo (modelo simple)")}:
53 mm + ${L("riser", "riser")} ${num(o.riser, 1)} − ${L("wheel radius", "radio")} ${num(o.wheel / 2, 1)} − ${num(ch.x, 0)} × sin ${BUSH[o.bush].phi}°
= ${num(ch.clear, 1)} mm</div>
  <p class="hint muted">${L("Sizes are typical shop ranges, not rules. Feet matter more than age. Stand on a board in flat shoes before you buy.", "Los tamaños son rangos típicos de las tiendas, no reglas. Los pies importan más que la edad. Párate en la tabla con zapatos planos antes de comprar.")}</p>
  <details class="more"><summary>${L("Check it before every ride", "Revísala antes de cada paseo")}</summary>
   <ol class="tsteps"><li>${L("Every bolt and nut is snug.", "Cada tornillo y tuerca está firme.")}</li><li>${L("Each wheel spins freely and does not wobble.", "Cada rueda gira libre y no se tambalea.")}</li><li>${L("The trucks turn evenly to both sides.", "Los ejes giran igual hacia los dos lados.")}</li><li>${L("Helmet on and buckled; wrist guards and pads while you learn.", "Casco puesto y abrochado; muñequeras y protecciones mientras aprendes.")}</li></ol></details>
  <p><a href="/skt6">${L("Lesson: a board your size (grades 3–5)", "Lección: una tabla de tu tamaño (grados 3–5)")} →</a><br><a href="/skt17">${L("Lesson: trucks that fit the deck (adult)", "Lección: ejes que encajan con la tabla (adultos)")} →</a><br><a href="/skt14">${L("Unit: decks, wheels and bearings (grades 11–12)", "Unidad: tablas, ruedas y rodamientos (grados 11–12)")} →</a></p>`;
}
function buildWire() {
  const o = S.build;
  const useSuggestion = () => { const sg = suggestBoard(o.rider, o.use); Object.assign(o, { deck: sg.deck, axle: sg.axle, wheel: sg.wheel, duro: sg.duro, riser: sg.riser, bush: sg.bush, type: sg.type }); save(); panel(); paint(); };
  $("bdR").onchange = e => { o.rider = e.target.value; useSuggestion(); };
  $("bdU").onchange = e => { o.use = e.target.value; useSuggestion(); };
  $("bdUse").onclick = useSuggestion;
  document.querySelectorAll("#panel [data-k]").forEach(b => b.onclick = () => { const k = b.getAttribute("data-k"), v = b.getAttribute("data-v"); o[k] = k === "riser" ? +v : v; save(); panel(); paint(); });
  [["bdD", "deck", v => inch(v)], ["bdA", "axle", v => inch(v)], ["bdW", "wheel", v => v + " mm"], ["bdH", "duro", v => v + "A"]].forEach(([id, k, f]) => {
    $(id).oninput = e => { o[k] = +e.target.value; e.target.previousElementSibling.querySelector("output").textContent = f(o[k]); save(); paint(); $("under").innerHTML = buildUnder(); };
    $(id).onchange = () => panel();
  });
}

/* ══ the rooms, the page and the words ══════════════════════════════════════════════════════════════ */
const ROOMS = {
  ramp: { en: "Ramp and energy", es: "Rampa y energía", player: true, run: () => rampReset(true), reset: rampReset, draw: () => drawRamp(P.frames[P.k]), under: () => rampUnder(P.frames[P.k]), panel: rampPanel, wire: rampWire,
    desc: () => L("A side view of a ramp with a skater. ", "Vista de lado de una rampa con un patinador. ") },
  ollie: { en: "The ollie", es: "El ollie", player: true, run: () => ollieReset(true), reset: ollieReset, draw: () => drawOllie(P.frames[P.k]), under: () => ollieUnder(P.frames[P.k]), panel: olliePanel, wire: ollieWire,
    desc: () => L("A side view of a skater doing an ollie. ", "Vista de lado de un patinador haciendo un ollie. ") },
  grind: { en: "Grinds and slides", es: "Grinds y slides", player: true, run: () => grindReset(true), reset: grindReset, draw: () => drawGrind(P.frames[P.k]), under: () => grindUnder(P.frames[P.k]), panel: grindPanel, wire: grindWire,
    desc: () => L("A skater grinding along a rail, with a graph of speed against distance. ", "Un patinador haciendo grind en un barandal, con una gráfica de rapidez y distancia. ") },
  balance: { en: "Balance and turning", es: "Equilibrio y giros", player: false, run: () => {}, reset: () => { setRun([], 1); panel(); paint(); }, draw: drawBalance, under: balanceUnder, panel: balancePanel, wire: balanceWire,
    desc: () => L("A skater on a board, showing the center of mass. ", "Un patinador en la tabla, con el centro de masa. ") },
  flip: { en: "Flips and spins", es: "Flips y giros", player: true, run: () => flipReset(true), reset: flipReset, draw: () => drawFlip(P.frames[P.k]), under: () => flipUnder(P.frames[P.k]), panel: flipPanel, wire: flipWire,
    desc: () => L("A 3D skateboard turning in the air. ", "Una patineta en 3D girando en el aire. ") },
  timeline: { en: "Boards through time", es: "Las tablas en el tiempo", player: false, run: () => {}, reset: () => { setRun([], 1); panel(); paint(); }, draw: drawTimeline, under: () => "", panel: timelinePanel, wire: timelineWire,
    desc: () => L("A skateboard from above and from the side, as boards looked in ", "Una patineta desde arriba y de lado, como eran en ") + ERAS[S.timeline.i].y + ". " },
  build: { en: "Build a board", es: "Arma una tabla", player: false, run: () => {}, reset: () => { setRun([], 1); panel(); paint(); }, draw: drawBuild, under: buildUnder, panel: buildPanel, wire: buildWire,
    desc: () => L("A skateboard from the front, leaning all the way over its wheels, and from above. ", "Una patineta de frente, inclinada al máximo sobre sus ruedas, y desde arriba. ") },
  tricks: { en: "Trick book", es: "Libro de trucos", player: false, run: () => {}, reset: () => { setRun([], 1); panel(); paint(); }, draw: drawTricks, under: () => "", panel: tricksPanel, wire: tricksWire,
    desc: () => L("A skateboard from above showing where each foot goes. ", "Una patineta desde arriba que muestra dónde va cada pie. ") }
};
const ORDER = ["build", "ramp", "ollie", "grind", "balance", "flip", "timeline", "tricks"];   // AOG-SKATE-BUILD-HOME-V1: Build a board first
function panel() { const r = ROOMS[S.room]; $("panel").innerHTML = r.panel(); r.wire(); paintPlayer(); $("under").innerHTML = r.under(); }
function paint(fast) {
  if (fit()) colors();
  clear(); ROOMS[S.room].draw();
  $("under").innerHTML = ROOMS[S.room].under();
  const sc = $("scrub"); if (sc) { sc.max = Math.max(0, P.frames.length - 1); sc.value = P.k; }
  const tr = $("tRead"); if (tr) tr.textContent = num(P.k * P.dt, 2) + " s";
  if (!fast) { paintPlayer(); const fr = P.frames[P.k]; $("cvDesc").textContent = ROOMS[S.room].desc() + (fr && fr.v != null ? L("Speed ", "Rapidez ") + num(fr.v, 1) + " m/s." : ""); }
  // the result notes in the panel appear when a run reaches its end
  if (!fast && P.ran && P.k >= P.frames.length - 1 && ROOMS[S.room].player && !P._shown) { P._shown = true; panel(); P._shown = false; }
}
function rooms() {
  $("roomRow").innerHTML = ORDER.map(k => `<button type="button" data-room="${k}" aria-pressed="${S.room === k}">${L(ROOMS[k].en, ROOMS[k].es)}</button>`).join("");
  $("roomRow").querySelectorAll("[data-room]").forEach(b => b.onclick = () => openRoom(b.getAttribute("data-room"), true));
}
function openRoom(k, push) {
  if (!ROOMS[k]) k = "ramp";
  stop(); S.room = k; save();
  if (push && location.hash !== "#" + k) history.replaceState(null, "", "#" + k);
  rooms(); fit(true); colors(); ROOMS[k].reset();
}
function words() {
  document.documentElement.lang = S.lang;
  document.title = L("The Skate Lab", "El Laboratorio de Skate") + " — Architecture of Grace";
  $("brand").textContent = L("The Skate Lab", "El Laboratorio de Skate");
  $("mastK").textContent = L("Skateboarding · the science you can try", "Skate · la ciencia que puedes probar");
  $("mastH").textContent = L("The Skate Lab", "El Laboratorio de Skate");
  $("mastL").textContent = L("Build your board, then try ramps, ollies, grinds and flips with real physics.", "Arma tu tabla y luego prueba rampas, ollies, grinds y flips con física real.");
  $("langBtn").textContent = es() ? "EN" : "ES";
  $("themeBtn").textContent = document.documentElement.getAttribute("data-theme") === "dark" ? L("Light", "Claro") : L("Dark", "Oscuro");
  $("nav").innerHTML = `<a href="/skateboarding">${L("The course", "El curso")}</a><a href="/drops/skate">${L("Daily Practice", "Práctica diaria")}</a>`;
  $("foot").textContent = L("Architecture of Grace · The Skate Lab · every number is worked out with g = 9.8 m/s²; friction and hardness values are examples. Wear a helmet, learn in a safe place, and ride with a grown-up nearby if you are a child.",
    "Architecture of Grace · El Laboratorio de Skate · cada número se calcula con g = 9,8 m/s²; los valores de fricción y dureza son ejemplos. Usa casco, aprende en un lugar seguro y, si eres niño, patina con un adulto cerca.");
}
$("langBtn").onclick = () => { S.lang = es() ? "en" : "es"; save(); try { localStorage.setItem("aog.lang", S.lang); } catch (e) {} words(); rooms(); panel(); paint(); };
$("themeBtn").onclick = () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next); document.documentElement.classList.toggle("dark", next === "dark");
  try { localStorage.setItem("aog.interior.ws.v1.theme", next); } catch (e) {}
  words(); colors(); paint();
};
new MutationObserver(() => { colors(); paint(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
window.addEventListener("resize", () => { if (fit()) { colors(); paint(); } });
window.addEventListener("hashchange", () => { const k = location.hash.slice(1); if (ROOMS[k] && k !== S.room) openRoom(k, false); });
/* for the site's checks (tools/check-skate.js) */
window.AOGSkate = { suggestBoard, boardCheck, boltFor, simRamp, simGrind, simOllie, simFlip, simSpin, balanceCalc, standCalc, rooms: ORDER, open: k => openRoom(k, true), state: S, P, go, TRICKS, ERAS };
words();
/* AOG-SKATE-BUILD-HOME-V1 (2026-10-11) — Jimmy: "Make build a board a main stay for this page." /skate always opens on
   Build a board; an address that names a room (/skate#ollie, a lesson's link) still opens that room. */
const start = location.hash.slice(1);
openRoom(ROOMS[start] ? start : "build", !!ROOMS[start]);
})();
