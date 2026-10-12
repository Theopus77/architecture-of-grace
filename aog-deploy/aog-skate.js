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
  tricks: { id: "stance", view: "move", cam: "follow" },
  progress: {},
  faq: { q: "", cat: "all" },
  build: { rider: "m", use: "tricks", deck: 8.125, axle: 8.125, wheel: 52, duro: 100, riser: 0, bush: "med", type: "pop", view: "fit" }
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
const cv = $("cv");
let ctx = cv.getContext("2d");   // let: the sequence shot draws each moment on a sheet of its own
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
  C.steel = v("--steel"); C.steelFg = v("--steel-fg");
  // the rider's clothes (AOG-SKATE-RIDER-V3); older pages without these tokens fall back to the shirt and pants
  [["hood", "shirt"], ["cargo", "pants"], ["shoe", "pants"], ["sole", "wheel"], ["helmet", "ke"], ["hair", "ink"]].forEach(([k, f]) => C[k] = v("--cv-" + k) || C[f]); C.good = v("--good"); C.warn = v("--warn"); C.card = v("--card"); C.line = v("--line");
}
function font(w, mult) { ctx.font = (w || 600) + " " + Math.round(FS * (mult || 1)) + 'px "Source Sans 3", ui-sans-serif, system-ui, sans-serif'; }
function text(s, x, y, o) {
  o = o || {}; font(o.w, o.m); ctx.fillStyle = o.c || C.ink; ctx.textAlign = o.a || "left"; ctx.textBaseline = o.b || "alphabetic";
  if (o.bg) { const tw = ctx.measureText(s).width, h = FS * (o.m || 1); const x0 = o.a === "center" ? x - tw / 2 : o.a === "right" ? x - tw : x;
    ctx.save(); ctx.fillStyle = o.bg; ctx.globalAlpha = .88; roundRect(x0 - 6, y - h * .85, tw + 12, h * 1.15, 6); ctx.fill(); ctx.restore(); }
  ctx.fillText(s, x, y);
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function clear() { ctx.save(); ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, shade(C.sky, 0.25)); g.addColorStop(1, C.sky); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
/* an arrow in screen space; len in px */
function arrow(x1, y1, x2, y2, col, lw) {
  const a = Math.atan2(y2 - y1, x2 - x1), hl = Math.max(10, (lw || 4) * 3.2);
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw || 4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hl * .6, y2 - Math.sin(a) * hl * .6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .42), y2 - hl * Math.sin(a - .42)); ctx.lineTo(x2 - hl * Math.cos(a + .42), y2 - hl * Math.sin(a + .42)); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ══ the board and the rider, drawn in meters with y up (the caller sets the transform) ══
   AOG-SKATE-ART-V2 (2026-10-11) — Jimmy: "the graphics … can be elevated … elite and amazing". An illustrated skater:
   tapered limbs that bend at real joints, shoes with soles, knee and elbow pads, a vented helmet with its chin strap,
   a shirt with a collar and a shaded side; a board with seven maple plies on its edge, grip on top, shaped trucks
   (baseplate, bushing, hanger, kingpin) and urethane wheels with cores and bearings. Every color comes from the page's
   own tokens, shaded lighter or darker, so light and dark themes both work. Nothing moves on its own.
   Board frame: x along the board (nose +), origin midway between the two wheel contacts, y up. */
const BOARD = { half: 0.40, kickStart: 0.29, kickRise: 0.035, axle: 0.18, wheelR: 0.027, deckY: 0.085, thick: 0.014 };
function rgb(c) {
  c = String(c || "").trim();
  let m = /^#([0-9a-f]{3})$/i.exec(c); if (m) return m[1].split("").map(h => parseInt(h + h, 16));
  m = /^#([0-9a-f]{6})$/i.exec(c); if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16));
  m = /rgba?\(([^)]+)\)/.exec(c); if (m) return m[1].split(",").slice(0, 3).map(x => parseFloat(x));
  return [128, 128, 128];
}
/* a token, shaded: amt > 0 toward white, < 0 toward black */
function shade(c, amt) { const v = rgb(c); return "rgb(" + v.map(x => Math.round(amt > 0 ? x + (255 - x) * amt : x * (1 + amt))).join(",") + ")"; }
function alpha(c, a) { const v = rgb(c); return "rgba(" + v.join(",") + "," + a + ")"; }
function deckPath() {
  const b = BOARD, y = b.deckY;
  return [[-b.half, y + b.kickRise], [-b.kickStart, y], [b.kickStart, y], [b.half, y + b.kickRise]];
}
/* the deck's center line at board-x: flat between the bolts, curving up into the kicks */
function deckMid(x) {
  const b = BOARD, ax = Math.abs(x);
  if (ax <= b.kickStart) return b.deckY;
  const u = (ax - b.kickStart) / (b.half - b.kickStart);
  return b.deckY + b.kickRise * (0.35 * u + 0.65 * u * u);
}
function drawWheel(x, y, r) {
  ctx.fillStyle = C.wheel; ctx.strokeStyle = shade(C.wheel, -0.45); ctx.lineWidth = r * 0.12;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = shade(C.wheel, -0.18); ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, 7); ctx.fill();          // the core
  ctx.save(); ctx.strokeStyle = shade(C.wheel, -0.4); ctx.lineWidth = r * 0.14; ctx.beginPath(); ctx.arc(x, y, r * 0.46, WHEEL_A, WHEEL_A + 1.1); ctx.stroke(); ctx.restore();   // a mark on the core, turning as it rolls
  ctx.fillStyle = shade(C.truck, -0.35); ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, 7); ctx.fill();           // the bearing
  ctx.fillStyle = shade(C.truck, 0.35); ctx.beginPath(); ctx.arc(x, y, r * 0.12, 0, 7); ctx.fill();           // the axle nut
  ctx.strokeStyle = alpha("#ffffff", 0.55); ctx.lineWidth = r * 0.1;                                          // a soft highlight
  ctx.beginPath(); ctx.arc(x, y, r * 0.82, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
}
function drawTruck(x) {
  const b = BOARD, top = deckMid(x) - b.thick / 2, ink = shade(C.truck, -0.45);
  ctx.lineWidth = 0.003; ctx.strokeStyle = ink;
  ctx.fillStyle = shade(C.truck, -0.1); ctx.beginPath(); ctx.rect(x - 0.032, top - 0.009, 0.064, 0.009); ctx.fill(); ctx.stroke();   // baseplate
  ctx.fillStyle = shade(C.soft, 0.25); ctx.beginPath(); ctx.ellipse(x + (x < 0 ? 0.008 : -0.008), top - 0.017, 0.011, 0.008, 0, 0, 7); ctx.fill(); ctx.stroke(); // bushing
  ctx.fillStyle = C.truck; ctx.beginPath();                                                                    // hanger
  ctx.moveTo(x - 0.024, top - 0.022); ctx.lineTo(x + 0.024, top - 0.022);
  ctx.quadraticCurveTo(x + 0.02, b.wheelR + 0.006, x + 0.006, b.wheelR); ctx.lineTo(x - 0.006, b.wheelR);
  ctx.quadraticCurveTo(x - 0.02, b.wheelR + 0.006, x - 0.024, top - 0.022); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = shade(C.truck, 0.3); ctx.lineWidth = 0.004; ctx.beginPath();                                // kingpin
  ctx.moveTo(x + (x < 0 ? 0.004 : -0.004), top - 0.004); ctx.lineTo(x + (x < 0 ? 0.014 : -0.014), top - 0.03); ctx.stroke();
}
function drawBoardSide(lw) {
  const b = BOARD, n = 40, xs = [];
  for (let i = 0; i <= n; i++) xs.push(-b.half + 2 * b.half * i / n);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  drawTruck(-b.axle); drawTruck(b.axle);
  drawWheel(-b.axle, b.wheelR, b.wheelR); drawWheel(b.axle, b.wheelR, b.wheelR);
  // the deck: a filled edge seven plies thick, rounded at both tips, grip on top
  const t = b.thick / 2 + (lw || 0) / 2;
  ctx.beginPath();
  xs.forEach((x, i) => { const y = deckMid(x) + t; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.arc(b.half, deckMid(b.half), t, Math.PI / 2, -Math.PI / 2, true);
  for (let i = n; i >= 0; i--) ctx.lineTo(xs[i], deckMid(xs[i]) - t);
  ctx.arc(-b.half, deckMid(-b.half), t, -Math.PI / 2, Math.PI / 2, true);
  ctx.closePath(); ctx.fillStyle = C.deck; ctx.fill();
  ctx.strokeStyle = shade(C.deck, -0.45); ctx.lineWidth = 0.0025; ctx.stroke();
  ctx.lineWidth = 0.0012; ctx.strokeStyle = shade(C.deck, 0.35);                                             // the plies
  [-0.5, -0.17, 0.17, 0.5].forEach(f => { ctx.beginPath(); xs.forEach((x, i) => { const y = deckMid(x) + f * t * 1.4 * 0.5; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); });
  ctx.strokeStyle = C.grip; ctx.lineWidth = 0.0045;                                                          // grip tape
  ctx.beginPath(); xs.forEach((x, i) => { const y = deckMid(x) + t; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
}
/* the height of the deck's top at board-x (for placing feet) */
function deckTop(x) { return deckMid(x) + BOARD.thick / 2; }
/* a limb: a tapered band from a to b, wa and wb wide, with round joints */
function limb(a, b, wa, wb, col) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1e-6, px = -dy / d, py = dx / d;
  ctx.fillStyle = col; ctx.strokeStyle = shade(col, -0.4); ctx.lineWidth = 0.004;
  ctx.beginPath();
  ctx.moveTo(a[0] + px * wa / 2, a[1] + py * wa / 2); ctx.lineTo(b[0] + px * wb / 2, b[1] + py * wb / 2);
  ctx.arc(b[0], b[1], wb / 2, Math.atan2(py, px), Math.atan2(-py, -px), true);
  ctx.lineTo(a[0] - px * wa / 2, a[1] - py * wa / 2);
  ctx.arc(a[0], a[1], wa / 2, Math.atan2(-py, -px), Math.atan2(py, px), true);
  ctx.closePath(); ctx.fill(); ctx.stroke();
}
function bend(a, b, len, side) {   // the middle joint of a two-part limb of length len each, bending toward side
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
  if (d >= 2 * len) return [a[0] + dx / 2, a[1] + dy / 2];
  const h = Math.sqrt(len * len - d * d / 4), px = -dy / d, py = dx / d;
  return [a[0] + dx / 2 + px * h * side, a[1] + dy / 2 + py * h * side];
}
/* ── the skater (AOG-SKATE-RIDER-V3, 2026-10-11): Jimmy, "a teenager would laugh at this". A rider with style: a
   hoodie with its hood and strings, baggy cargo pants stacked over chunky skate shoes, a helmet, the head turned to
   look where the board is going, knees bent forward over the toes, and two arms that do different things. No face is
   drawn. o.nose: +1 when the nose points right on screen, −1 left. o.lift raises both arms (in the air, on a pop);
   o.str swings the hood strings; o.twist turns the shoulders. ── */
function shoe(f, n, k) {   // a skate shoe at f, toe toward the nose (n), k = how much of its length shows (1 side on, 0.6 turned)
  const x = f[0], y = f[1], L = 0.27 * (k || 1), h = 0.085, ink = shade(C.shoe, -0.55);
  ctx.save(); ctx.translate(x, y); ctx.scale(n, 1);
  const heel = -L * 0.42, toe = L * 0.58;
  ctx.lineWidth = 0.004; ctx.strokeStyle = ink; ctx.fillStyle = C.shoe;
  ctx.beginPath();                                                                                            // the upper: heel counter, collar, a puffy tongue, the toe box
  ctx.moveTo(heel, 0.012); ctx.lineTo(heel - 0.004, h * 0.8); ctx.quadraticCurveTo(heel + 0.01, h + 0.006, heel + L * 0.22, h * 0.95);
  ctx.quadraticCurveTo(heel + L * 0.36, h * 1.08, heel + L * 0.44, h * 0.92);
  ctx.quadraticCurveTo(toe - L * 0.12, h * 0.62, toe - 0.006, h * 0.36); ctx.quadraticCurveTo(toe + 0.008, 0.02, toe - 0.01, 0.012); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.sole; ctx.strokeStyle = shade(C.sole, -0.45);                                            // the thick white cupsole
  ctx.beginPath(); ctx.moveTo(heel - 0.006, 0); ctx.lineTo(toe + 0.004, 0); ctx.quadraticCurveTo(toe + 0.014, 0.012, toe + 0.002, 0.024); ctx.lineTo(heel - 0.006, 0.024); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = shade(C.sole, -0.3); ctx.lineWidth = 0.002; ctx.beginPath(); ctx.moveTo(heel, 0.009); ctx.lineTo(toe, 0.009); ctx.stroke();
  ctx.strokeStyle = alpha(C.sole, 0.9); ctx.lineWidth = 0.008;                                                // a side stripe
  ctx.beginPath(); ctx.moveTo(heel + L * 0.18, 0.035); ctx.quadraticCurveTo(heel + L * 0.45, 0.075, heel + L * 0.62, 0.045); ctx.stroke();
  ctx.strokeStyle = shade(C.shoe, 0.35); ctx.lineWidth = 0.004;                                               // laces
  for (let i = 0; i < 3; i++) { const lx = heel + L * (0.44 + i * 0.07); ctx.beginPath(); ctx.moveTo(lx - 0.012, h * (0.92 - i * 0.1)); ctx.lineTo(lx + 0.012, h * (0.86 - i * 0.1)); ctx.stroke(); }
  ctx.restore();
}
function drawBody(fB, fF, hp, o) {
  o = o || {};
  const n = o.nose || 1, lean = o.lean || 0, lift = o.lift || 0, str = o.str || 0, tw = Math.min(1, Math.abs(o.twist || 0));
  const LEG = 0.47;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  // the two feet: the front one (toward the nose) turned a little toward it, the back one more across the board
  const front = (fF[0] - fB[0]) * n >= 0 ? fF : fB, back = front === fF ? fB : fF;
  const hipF = [hp[0] + n * 0.075, hp[1]], hipB = [hp[0] - n * 0.075, hp[1]];
  function leg(f, hj, isFront) {
    const ank = [f[0] - n * 0.01, f[1] + 0.06];
    // knees come forward over the toes (toward us, so the bend shows short) and lean a little toward the nose
    const m0 = [(ank[0] + hj[0]) / 2, (ank[1] + hj[1]) / 2], dist = Math.hypot(hj[0] - ank[0], hj[1] - ank[1]), d = dist < 2 * LEG ? Math.sqrt(LEG * LEG - dist * dist / 4) : 0;
    const k = [m0[0] + n * d * 0.42, m0[1] - d * 0.12];
    const pc = C.cargo, dk = shade(pc, -0.18);
    limb(hj, k, 0.16, 0.135, isFront ? pc : dk);                                                                 // thigh, baggy
    limb(k, ank, 0.135, 0.15, isFront ? shade(pc, -0.06) : shade(dk, -0.06));                                    // shin, wider at the cuff
    ctx.strokeStyle = alpha(shade(pc, -0.5), 0.45); ctx.lineWidth = 0.004;                                      // folds at the knee and a cargo pocket
    ctx.beginPath(); ctx.moveTo(k[0] - 0.05, k[1] + 0.02); ctx.quadraticCurveTo(k[0], k[1] - 0.015, k[0] + 0.05, k[1] + 0.025); ctx.stroke();
    const pm = [lerp(hj[0], k[0], 0.55), lerp(hj[1], k[1], 0.55)];
    ctx.fillStyle = alpha(shade(pc, -0.25), 0.55); roundRect(pm[0] - 0.035, pm[1] - 0.04, 0.07, 0.07, 0.01); ctx.fill();
    // the cuff stacks over the shoe
    ctx.fillStyle = shade(pc, -0.1); ctx.beginPath(); ctx.ellipse(ank[0], ank[1] + 0.004, 0.08, 0.026, 0, 0, 7); ctx.fill(); ctx.stroke();
    shoe(f, n, isFront ? 0.95 : 0.7);
  }
  leg(back, hipB, false); leg(front, hipF, true);
  // the hoodie: boxy, a ribbed hem, a pocket, the hood bunched at the back of the neck
  const sw = 0.215 * (1 - 0.28 * tw);
  ctx.save(); ctx.translate(hp[0], hp[1]); ctx.rotate(-lean);
  const hc = C.hood, hd = shade(hc, -0.28);
  if (!o.back) { ctx.fillStyle = hd; ctx.beginPath(); ctx.ellipse(-n * 0.03, 0.52, 0.13, 0.065, 0, 0, 7); ctx.fill(); }   // the hood, behind
  ctx.beginPath(); ctx.moveTo(-0.19, -0.06); ctx.quadraticCurveTo(-0.215, 0.2, -sw, 0.46); ctx.quadraticCurveTo(-0.1, 0.53, 0, 0.52); ctx.quadraticCurveTo(0.1, 0.53, sw, 0.46); ctx.quadraticCurveTo(0.215, 0.2, 0.19, -0.06); ctx.closePath();
  ctx.fillStyle = hc; ctx.fill(); ctx.strokeStyle = shade(hc, -0.5); ctx.lineWidth = 0.004; ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.fillStyle = alpha(shade(hc, -0.55), 0.3); ctx.fillRect(n > 0 ? 0.07 : -0.3, -0.1, 0.23, 0.7);            // the side away from the light
  ctx.fillStyle = alpha(shade(hc, 0.4), 0.18); ctx.fillRect(n > 0 ? -0.3 : 0.12, -0.1, 0.07, 0.7);             // a soft highlight
  ctx.fillStyle = shade(hc, -0.2); ctx.fillRect(-0.25, -0.07, 0.5, 0.055);                                      // the ribbed hem
  ctx.strokeStyle = alpha(shade(hc, -0.6), 0.5); ctx.lineWidth = 0.004;
  if (!o.back) { ctx.beginPath(); ctx.moveTo(-0.11, 0.02); ctx.lineTo(-0.08, 0.17); ctx.lineTo(0.08, 0.17); ctx.lineTo(0.11, 0.02); ctx.stroke(); }   // the pocket
  else { ctx.fillStyle = shade(hc, -0.12); ctx.beginPath(); ctx.moveTo(-0.11, 0.5); ctx.quadraticCurveTo(-0.12, 0.3, 0, 0.27); ctx.quadraticCurveTo(0.12, 0.3, 0.11, 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();   // seen from behind: the hood lies on the back
    ctx.beginPath(); ctx.moveTo(0, 0.5); ctx.lineTo(0, 0.29); ctx.stroke(); }
  ctx.restore();
  if (!o.back) { ctx.strokeStyle = shade(C.sole, -0.08); ctx.lineWidth = 0.007;                                // the strings, swinging
  [-0.035, 0.035].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0.47); ctx.quadraticCurveTo(x + str * 0.03, 0.42, x + str * 0.07, 0.35 + Math.abs(str) * 0.02); ctx.stroke(); });
  ctx.fillStyle = shade(C.sole, -0.08); [-0.035, 0.035].forEach(x => { ctx.beginPath(); ctx.arc(x + str * 0.07, 0.35 + Math.abs(str) * 0.02, 0.008, 0, 7); ctx.fill(); }); }
  ctx.restore();
  const R = (x, y) => [hp[0] + x * Math.cos(lean) + y * Math.sin(lean), hp[1] - x * Math.sin(lean) + y * Math.cos(lean)];
  // the arms: the front arm leads, the back arm trails and sits higher; both rise with o.lift
  const a = o.arms != null ? o.arms : 1;
  // relaxed: the upper arm out from the side, the forearm hanging a little lower; in the air (lift) both come up
  [[n, 0.28 + 0.5 * a, -0.42], [-n, 0.36 + 0.6 * a, -0.25]].forEach(([sd, up, elb], i) => {
    const sh = R(sd * (sw - 0.02), 0.44), ang = Math.min(2.1, up + lift * (i ? 0.8 : 0.65));        // from straight down, outward
    const u = [Math.sin(ang) * sd, -Math.cos(ang)], el = [sh[0] + u[0] * 0.27, sh[1] + u[1] * 0.27];
    const a2 = ang + elb + lift * 0.5, fa = [Math.sin(a2) * sd, -Math.cos(a2)], hand = [el[0] + fa[0] * 0.25, el[1] + fa[1] * 0.25];
    const sc2 = i ? hd : hc;
    limb(sh, el, 0.11, 0.095, sc2);                                                                             // sleeve
    limb(el, [lerp(el[0], hand[0], 0.8), lerp(el[1], hand[1], 0.8)], 0.095, 0.085, sc2);
    ctx.fillStyle = shade(hc, -0.2); ctx.beginPath(); ctx.arc(lerp(el[0], hand[0], 0.8), lerp(el[1], hand[1], 0.8), 0.044, 0, 7); ctx.fill();   // cuff
    ctx.fillStyle = C.skin; ctx.strokeStyle = shade(C.skin, -0.4); ctx.lineWidth = 0.003;                      // hand, loose
    ctx.beginPath(); ctx.ellipse(hand[0], hand[1], 0.036, 0.042, Math.atan2(fa[1], fa[0]) + Math.PI / 2, 0, 7); ctx.fill(); ctx.stroke();
  });
  // the head, turned toward the nose: neck, ear, a little hair, and a helmet with its brim forward (no face is drawn)
  const hdp = R(n * 0.012, 0.66);
  ctx.save(); ctx.translate(hdp[0], hdp[1]); ctx.rotate(-lean * 0.6); ctx.scale(n, 1);
  ctx.fillStyle = shade(C.skin, -0.08); roundRect(-0.04, -0.13, 0.07, 0.07, 0.02); ctx.fill();                  // neck
  if (o.back) {   // from behind: the back of the head, hair at the nape, the helmet's shell
    ctx.fillStyle = C.skin; ctx.strokeStyle = shade(C.skin, -0.4); ctx.lineWidth = 0.004;
    ctx.beginPath(); ctx.ellipse(0, -0.03, 0.08, 0.085, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.hair; ctx.beginPath(); ctx.moveTo(-0.08, 0.0); ctx.quadraticCurveTo(-0.07, -0.1, 0, -0.105); ctx.quadraticCurveTo(0.07, -0.1, 0.08, 0.0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(C.skin, -0.14); [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * 0.082, -0.03, 0.013, 0.024, 0, 0, 7); ctx.fill(); });
    const hm = C.helmet;
    ctx.beginPath(); ctx.moveTo(-0.11, 0.0); ctx.quadraticCurveTo(-0.115, 0.158, 0, 0.16); ctx.quadraticCurveTo(0.115, 0.158, 0.11, 0.0); ctx.closePath();
    ctx.fillStyle = hm; ctx.fill(); ctx.strokeStyle = shade(hm, -0.5); ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = C.sole; ctx.fillRect(-0.12, 0.068, 0.24, 0.018); ctx.fillStyle = alpha(shade(hm, -0.5), 0.25); ctx.fillRect(0.02, -0.05, 0.12, 0.25); ctx.restore();
    ctx.strokeStyle = shade(hm, -0.45); ctx.lineWidth = 0.008; ctx.beginPath(); ctx.moveTo(-0.025, 0.155); ctx.lineTo(-0.025, 0.11); ctx.moveTo(0.025, 0.155); ctx.lineTo(0.025, 0.11); ctx.stroke();   // vents
    ctx.restore(); if (o.com) drawCOM(o.com[0], o.com[1], 0.05); return;
  }
  ctx.fillStyle = C.skin; ctx.strokeStyle = shade(C.skin, -0.4); ctx.lineWidth = 0.004;
  ctx.beginPath(); ctx.moveTo(-0.075, 0.02); ctx.quadraticCurveTo(-0.085, -0.075, -0.03, -0.1);                 // back of the head and the jaw
  ctx.quadraticCurveTo(0.04, -0.115, 0.07, -0.07); ctx.quadraticCurveTo(0.088, -0.03, 0.086, 0.02); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = shade(C.hair, 0); ctx.beginPath(); ctx.moveTo(-0.08, 0.02); ctx.quadraticCurveTo(-0.095, -0.05, -0.06, -0.075); ctx.lineTo(-0.045, -0.02); ctx.closePath(); ctx.fill();   // hair at the nape
  ctx.fillStyle = shade(C.skin, -0.14); ctx.beginPath(); ctx.ellipse(-0.012, -0.03, 0.017, 0.026, 0, 0, 7); ctx.fill();   // ear
  ctx.strokeStyle = shade(C.helmet, -0.45); ctx.lineWidth = 0.006; ctx.beginPath(); ctx.moveTo(-0.012, -0.003); ctx.lineTo(0.03, -0.1); ctx.stroke();   // strap
  const hm = C.helmet;
  ctx.beginPath(); ctx.moveTo(-0.1, 0.0); ctx.quadraticCurveTo(-0.115, 0.15, 0.0, 0.158); ctx.quadraticCurveTo(0.105, 0.155, 0.112, 0.03); ctx.lineTo(0.118, 0.012); ctx.lineTo(-0.1, 0.0); ctx.closePath();
  ctx.fillStyle = hm; ctx.fill(); ctx.strokeStyle = shade(hm, -0.5); ctx.lineWidth = 0.004; ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.fillStyle = alpha(shade(hm, -0.5), 0.28); ctx.beginPath(); ctx.ellipse(0.02, -0.02, 0.15, 0.07, 0, 0, 7); ctx.fill();   // shade low on the shell
  ctx.fillStyle = C.sole; ctx.fillRect(-0.12, 0.068, 0.25, 0.018);                                               // a stripe sticker
  ctx.fillStyle = C.ke; roundRect(-0.07, 0.09, 0.045, 0.03, 0.008); ctx.fill();                                  // and a small sticker
  ctx.restore();
  ctx.fillStyle = shade(hm, -0.35); ctx.beginPath(); ctx.moveTo(0.06, 0.012); ctx.lineTo(0.135, 0.008); ctx.lineTo(0.12, 0.024); ctx.lineTo(0.06, 0.03); ctx.closePath(); ctx.fill();   // the brim edge
  ctx.strokeStyle = alpha("#ffffff", 0.45); ctx.lineWidth = 0.009; ctx.beginPath(); ctx.arc(0.0, 0.05, 0.085, Math.PI * 0.55, Math.PI * 0.8); ctx.stroke();
  ctx.restore();
  if (o.com) drawCOM(o.com[0], o.com[1], 0.05);
}
function drawCOM(x, y, r) {
  ctx.save(); ctx.lineWidth = r * 0.28; ctx.strokeStyle = C.ink; ctx.fillStyle = C.sky;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, 0, Math.PI / 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, Math.PI, Math.PI * 1.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/* a soft shadow on the ground under the board (board frame, ground at y = 0) */
function boardShadow(h) {
  const k = Math.max(0.25, 1 - (h || 0) * 1.6);
  ctx.fillStyle = alpha(C.ink, 0.16 * k); ctx.beginPath(); ctx.ellipse(0, 0.002, 0.46 * (0.7 + 0.3 * k), 0.016, 0, 0, 7); ctx.fill();
}
/* a whole rider on a board, in board frame; crouch 0 (tall) … 1 (low) */
function drawRider(crouch, o) {
  o = o || {};
  boardShadow(0);
  drawBoardSide();
  const fb = -0.2, ff = 0.13;
  const fB = [fb, deckTop(fb)], fF = [ff, deckTop(ff)];
  const hip = [(fb + ff) / 2 + 0.01, deckTop(0) + 0.86 - 0.36 * crouch];
  drawBody(fB, fF, hip, { lean: o.lean || 0.06, com: o.com !== false ? [hip[0] + 0.02, hip[1] + 0.12] : null, arms: o.arms });
  return [hip[0] + 0.02, hip[1] + 0.12];
}
/* the ground in screen space: poured concrete with a soft gradient and expansion joints (static) */
function drawGround(y0, x0, x1, step) {
  const g = ctx.createLinearGradient(0, y0, 0, H);
  g.addColorStop(0, shade(C.ground, 0.08)); g.addColorStop(1, shade(C.ground, -0.12));
  ctx.fillStyle = g; ctx.fillRect(x0 || 0, y0, (x1 || W) - (x0 || 0), H - y0);
  ctx.strokeStyle = alpha(C.ink, 0.18); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 || 0, y0); ctx.lineTo(x1 || W, y0); ctx.stroke();
  if (step) { ctx.strokeStyle = alpha(C.ink, 0.08); ctx.lineWidth = 1.5; for (let x = (x0 || 0) + step / 2; x < (x1 || W); x += step) { ctx.beginPath(); ctx.moveTo(x, y0 + 4); ctx.lineTo(x - 18, H); ctx.stroke(); } }
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
  hill: { slope: 5, en: "Gentle hill", es: "Colina suave" },
  demo: { R: 1.2, Hm: 0.9, F: 2.4, en: "Demo ramp", es: "Rampa de demostración" }   // the trick book's mini ramp
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
  drawGround(Y(0), 0, W, 140);
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
  ctx.save(); ctx.translate(p.cx, 0); boardShadow(p.cy); ctx.restore();
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
  drawGround(Y(0), 0, W, 160);
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
    drawGround(Y(0), 0, W, 140);
    const st = standCalc(), piv = st.tilt > 0 ? -BOARD.axle : st.tilt < 0 ? BOARD.axle : 0;
    // base of support between the axles
    ctx.save(); ctx.fillStyle = C.good; ctx.globalAlpha = .25; ctx.fillRect(X(-BOARD.axle), Y(0) - 6, 2 * BOARD.axle * sc, 12); ctx.restore();
    text(L("base of support", "base de apoyo"), X(0), Y(0) + 30, { a: "center", m: .8, c: C.good });
    ctx.save(); ctx.translate(X(piv), Y(0)); ctx.scale(sc, -sc); ctx.rotate(st.tilt); ctx.translate(-piv, 0);
    const fb = -0.2, ff = 0.13, hipx = st.x - 0.02;
    drawBoardSide();
    drawBody([fb, deckTop(fb)], [ff, deckTop(ff)], [hipx, deckTop(0) + 0.84], { lean: 0, arms: 1 });
    ctx.restore();
    // the line of the weight, straight down from the center of mass
    const cx = X(piv + (st.x - piv) * Math.cos(st.tilt) - (deckTop(0) + 0.96) * Math.sin(st.tilt)), cy = Y((st.x - piv) * Math.sin(st.tilt) + (deckTop(0) + 0.96) * Math.cos(st.tilt));
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
/* AOG-SKATE-TRICKS-V2 (2026-10-11) — Jimmy: "the tricks … everything can be elevated … elite and amazing!" Nine more
   tricks (carve, pump, fakie, nose manual, backside 180, axle stall, noseslide, varial kickflip, 360 flip), what to learn
   first for every trick, an animated demo of each one (below), "learning / landed it / got it" saved on this device,
   and a map of the whole book. */
TRICKS.push(...[{"id": "carve", "lv": 2, "room": "balance", "feet": {"f": [0.15, 0, 10], "b": [-0.17, 0, 5]}, "arrows": [{"from": [0.3, 0], "to": [0.3, 0.25], "curve": 1}], "pre": ["stance", "push", "stop"], "en": {"n": "Carving", "steps": ["Helmet on. Find a wide, smooth, flat place with no cars, like an empty court.", "Push to a slow, steady roll. Feet over the bolts, knees bent.", "Press gently with your toes. The board turns toward the toe side.", "Let the turn finish, then press gently with your heels. The board turns toward the heel side.", "Lean your whole body into each turn, ankles to shoulders, not just your hips.", "Link the turns in a smooth S shape. Make them long and slow at first."], "fixes": [["The board barely turns", "Press a little harder on the edge and lean your shoulders into the turn."], ["I wobble when I switch sides", "Pass through the middle slowly, with both feet flat, before you press the other edge."], ["I'm going too fast", "Make each turn longer and wider. Carving uphill a little slows you down too."]], "sci": "Tilting the deck squeezes the bushings, so the trucks steer the wheels. The wheels' grip pushes you toward the middle of the turn, and leaning in balances it: tan θ = v²/(gR), so a faster or tighter turn needs more lean."}, "es": {"n": "Carving (curvas largas)", "steps": ["Ponte el casco. Busca un lugar ancho, liso y plano, sin autos, como una cancha vacía.", "Empuja hasta rodar despacio y parejo. Pies sobre los tornillos, rodillas dobladas.", "Presiona suave con los dedos. La tabla gira hacia el lado de los dedos.", "Deja que termine el giro y presiona suave con los talones. La tabla gira hacia el lado de los talones.", "Inclina todo el cuerpo en cada giro, de los tobillos a los hombros, no solo la cadera.", "Une los giros en forma de S suave. Al principio, hazlos largos y lentos."], "fixes": [["La tabla casi no gira", "Presiona un poco más el borde e inclina los hombros hacia el giro."], ["Me tambaleo al cambiar de lado", "Pasa por el centro despacio, con los dos pies planos, antes de presionar el otro borde."], ["Voy muy rápido", "Haz cada giro más largo y ancho. Hacer la curva un poco cuesta arriba también te frena."]], "sci": "Al inclinar la tabla se aprietan los bujes y los ejes dirigen las ruedas. El agarre de las ruedas te empuja hacia el centro del giro, y al inclinarte lo equilibras: tan θ = v²/(gR); un giro más rápido o más cerrado pide más inclinación."}}, {"id": "pump", "lv": 3, "room": "ramp", "feet": {"f": [0.15, 0, 5], "b": [-0.2, 0, 5]}, "pre": ["kickturn", "dropin"], "en": {"n": "Pumping", "steps": ["Use a small ramp or a smooth bowl, with full pads and a helmet.", "Roll back and forth on the lower part of the ramp first, with your feet over the bolts.", "As you come up near the top of your ride, crouch: bend your knees low.", "As you pass through the curve at the bottom, push down through your feet and stand up taller.", "Crouch again as you rise up the other side. Then stand up again through the curve.", "Keep the rhythm, like pumping a swing. Each pass takes you a little higher."], "fixes": [["I slow down anyway", "Check your timing: stand up in the curve, not on the flat part or near the top."], ["I lose balance when I stand up", "Stand up smoothly, with your weight centered over both feet."]], "sci": "Standing up in the curve raises your body against the extra push the ramp gives you there, so your legs do work and add energy. Crouching near the top, where that push is small, costs little. More energy at the bottom means a higher ride: ½·m·v² = m·g·h."}, "es": {"n": "Bombear", "steps": ["Usa una rampa pequeña o un bowl liso, con protecciones y casco.", "Primero rueda de ida y vuelta en la parte baja de la rampa, con los pies sobre los tornillos.", "Al subir cerca de lo más alto de tu recorrido, agáchate: dobla bien las rodillas.", "Al pasar por la curva de abajo, empuja hacia abajo con los pies y párate más alto.", "Agáchate otra vez al subir por el otro lado. Luego párate otra vez en la curva.", "Sigue el ritmo, como al columpiarte. Cada pasada te lleva un poco más alto."], "fixes": [["Igual voy perdiendo rapidez", "Revisa el momento: párate en la curva, no en la parte plana ni cerca de arriba."], ["Pierdo el equilibrio al pararme", "Párate suave, con el peso centrado sobre los dos pies."]], "sci": "Al pararte en la curva levantas tu cuerpo contra el empuje extra que ahí te da la rampa, así tus piernas hacen trabajo y suman energía. Agacharte cerca de arriba, donde ese empuje es pequeño, cuesta poco. Más energía abajo te lleva más alto: ½·m·v² = m·g·h."}}, {"id": "fakie", "lv": 2, "room": "balance", "feet": {"f": [0.13, 0, 10], "b": [-0.17, 0, 5]}, "arrows": [{"from": [-0.1, 0], "to": [-0.38, 0]}], "pre": ["stance", "push", "stop"], "en": {"n": "Riding fakie", "steps": ["Helmet on. Find a smooth, flat place with no cars.", "Stand in your normal stance, feet over the bolts. Fakie means rolling backward: the tail goes first.", "Hold a wall or a friend's hand and give a gentle push so you roll backward slowly.", "Turn your head and look over your back shoulder, where you are going.", "Keep your knees bent and your weight centered over both feet.", "To stop, let the board slow down and step off. Then try a little faster."], "fixes": [["I feel like I'm falling backward", "Bend your knees more and keep your weight over the middle of the board, not over the tail."], ["I can't see where I'm going", "Turn your head first. Your shoulders can stay mostly where they are."]], "sci": "The wheels roll the same both ways, so the board does not care which end leads. Your stance stays the same; only your view changes, so looking where you go keeps your balance."}, "es": {"n": "Rodar en fakie", "steps": ["Ponte el casco. Busca un lugar liso y plano, sin autos.", "Párate en tu postura normal, pies sobre los tornillos. Fakie es rodar hacia atrás: la cola va primero.", "Sujétate de una pared o de la mano de alguien y empuja suave para rodar hacia atrás despacio.", "Gira la cabeza y mira por encima del hombro de atrás, adonde vas.", "Rodillas dobladas y el peso centrado sobre los dos pies.", "Para frenar, deja que la tabla vaya más lento y bájate. Luego prueba un poco más rápido."], "fixes": [["Siento que me caigo hacia atrás", "Dobla más las rodillas y deja tu peso sobre el centro de la tabla, no sobre la cola."], ["No veo adónde voy", "Gira primero la cabeza. Los hombros pueden quedarse casi donde están."]], "sci": "Las ruedas giran igual en los dos sentidos, así a la tabla no le importa qué punta va primero. Tu postura es la misma; solo cambia lo que ves, por eso mirar adonde vas te ayuda a mantener el equilibrio."}}, {"id": "nosemanual", "lv": 3, "room": "balance", "feet": {"f": [0.3, 0, 5], "b": [-0.1, 0, 5]}, "pre": ["manual"], "en": {"n": "Nose manual", "steps": ["Get a steady manual first. Helmet on, on smooth, flat ground.", "Roll slowly. Move your front foot onto the nose and your back foot to just behind the back bolts.", "Shift your weight forward until it is right over the front wheels.", "The back wheels lift. Keep the nose just off the ground.", "Use small moves of your arms and hips to stay balanced. Look ahead, not down.", "Put the back wheels down before you lose it. Try for a short distance first."], "fixes": [["The nose scrapes", "Your weight is too far forward. Move it back a little."], ["The back wheels won't lift", "Move your front foot closer to the end of the nose and lean forward a little more."]], "sci": "A nose manual is a manual on the other axle: the line of your weight falls right over the front wheels. The nose is shorter than the tail on many boards, so the balance window is smaller."}, "es": {"n": "Nose manual", "steps": ["Primero ten un manual firme. Con casco, en suelo liso y plano.", "Rueda despacio. Lleva el pie de adelante a la nariz y el de atrás justo detrás de los tornillos traseros.", "Lleva tu peso adelante hasta que quede justo sobre las ruedas de adelante.", "Suben las ruedas de atrás. La nariz queda justo sobre el suelo.", "Usa pequeños movimientos de brazos y cadera para mantenerte. Mira adelante, no abajo.", "Baja las ruedas de atrás antes de perderlo. Prueba primero una distancia corta."], "fixes": [["La nariz raspa", "Tu peso está muy adelante. Muévelo un poco atrás."], ["Las ruedas de atrás no suben", "Lleva el pie de adelante más cerca de la punta de la nariz e inclínate un poco más adelante."]], "sci": "Un nose manual es un manual sobre el otro eje: la línea de tu peso cae justo sobre las ruedas de adelante. En muchas tablas la nariz es más corta que la cola, así el espacio para el equilibrio es menor."}}, {"id": "bs180", "lv": 3, "room": "flip", "feet": {"f": [0.1, 0, 10], "b": [-0.3, 0, 5]}, "arrows": [{"from": [0.3, 0], "to": [0.3, -0.25], "curve": 1}], "pre": ["ollie", "fakie"], "en": {"n": "Backside 180", "steps": ["Get a steady ollie and a steady fakie roll first. Helmet on, on smooth, flat ground.", "Before you pop, wind your shoulders a little toward your front, the toe side.", "Pop an ollie and turn your shoulders the other way, so your back leads.", "Your hips and the board follow your shoulders, half a turn. Look over your back shoulder for the ground.", "Land rolling backward (fakie), with both feet over the bolts and your knees bent."], "fixes": [["I only turn a quarter", "Wind up more before the pop, and turn your head first."], ["I can't see where I'll land", "That is normal for backside spins. Look over your back shoulder as soon as you pop."], ["The board turns but I don't", "Turn your shoulders and hips together, and pop straight up."]], "sci": "Your feet push on the ground to start the spin, a torque, before the wheels leave it. In the air nothing can add spin, so a backside 180 turns the same amount as a frontside 180; only the direction changes."}, "es": {"n": "Backside 180", "steps": ["Primero ten un ollie firme y rueda en fakie con calma. Con casco, en suelo liso y plano.", "Antes del golpe, gira un poco los hombros hacia tu frente, el lado de los dedos.", "Haz un ollie y gira los hombros al otro lado, para que tu espalda guíe.", "La cadera y la tabla siguen a los hombros, media vuelta. Busca el suelo por encima del hombro de atrás.", "Aterriza rodando hacia atrás (fakie), con los dos pies sobre los tornillos y las rodillas dobladas."], "fixes": [["Solo giro un cuarto", "Gira más los hombros antes del golpe y gira primero la cabeza."], ["No veo dónde voy a caer", "Es normal en los giros backside. Mira por encima del hombro de atrás en cuanto saltes."], ["La tabla gira pero yo no", "Gira hombros y cadera juntos, y salta recto hacia arriba."]], "sci": "Tus pies empujan el suelo para empezar el giro, un torque, antes de que las ruedas lo dejen. En el aire nada puede sumar giro, así un backside 180 gira lo mismo que un frontside 180; solo cambia la dirección."}}, {"id": "axlestall", "lv": 4, "room": "ramp", "feet": {"f": [0.15, 0, 5], "b": [-0.2, 0, 5]}, "pre": ["dropin", "kickturn", "rockfakie"], "en": {"n": "Axle stall", "steps": ["Use a small ramp you can already drop in on and rock to fakie on, with full pads and a helmet.", "Ride up toward the coping with enough speed to just reach the top.", "Near the top, press the tail a little and turn, like a kickturn, so the board ends up along the coping.", "Set the back truck on the coping, then the front truck. Both trucks rest on the coping, the board along it.", "Pause there with your weight centered between your feet, knees bent.", "Press the tail a little, turn the nose back toward the ramp, and drop back in with your weight forward, like a drop-in."], "fixes": [["I slide off the coping", "Come up with a little less speed and set the back truck down first, firmly."], ["I hang up when I drop back in", "Lift the front wheels clear of the coping before you turn, and lean forward as you go."]], "sci": "At the top your motion energy has become stored energy, m·g·h, and you stop for a moment. Dropping back in turns it back into motion: from a height h, v = √(2gh), less a little lost to friction."}, "es": {"n": "Axle stall", "steps": ["Usa una rampa pequeña en la que ya puedas entrar y hacer rock to fakie, con protecciones y casco.", "Sube hacia el coping con la rapidez justa para llegar arriba.", "Cerca de arriba, presiona un poco la cola y gira, como un kickturn, para que la tabla quede a lo largo del coping.", "Apoya el eje de atrás en el coping y luego el de adelante. Los dos ejes descansan en el coping, la tabla a lo largo.", "Haz una pausa con el peso centrado entre los pies, rodillas dobladas.", "Presiona un poco la cola, gira la nariz hacia la rampa y vuelve a entrar con el peso adelante, como al hacer drop in."], "fixes": [["Me resbalo del coping", "Sube con un poco menos de rapidez y apoya primero el eje de atrás, firme."], ["Me atoro al volver a entrar", "Pasa las ruedas de adelante sobre el coping antes de girar e inclínate adelante al bajar."]], "sci": "Arriba, tu energía de movimiento se volvió energía guardada, m·g·h, y te detienes un momento. Al volver a entrar se vuelve movimiento otra vez: desde una altura h, v = √(2gh), menos un poco que se pierde por fricción."}}, {"id": "noseslide", "lv": 4, "room": "grind", "feet": {"f": [0.3, 0, 5], "b": [-0.12, 0, 5]}, "pre": ["ollie", "nosemanual", "boardslide"], "en": {"n": "Noseslide", "steps": ["Start on a low waxed curb, with a helmet and pads. Never a handrail or stairs.", "Roll alongside the curb, close and nearly parallel, at a steady, medium speed.", "Ollie and turn the board a quarter turn so the nose lands on top of the curb's edge.", "Keep your front foot on the nose, pressing down, and your weight over it. The tail stays in the air.", "Look at the end of the curb and keep your knees bent.", "At the end, turn the board back a quarter turn and land rolling, feet over the bolts."], "fixes": [["The tail drops and I stop", "Keep more weight on your front foot, over the nose."], ["The nose slips off the curb", "Ollie a little higher and land with the nose fully on top of the edge."], ["I stop on the curb", "Come in a little faster, or add wax."]], "sci": "Pressing the nose puts nearly all your weight on it, and the friction is f = μN. Wax lowers μ, so the same weight slides farther before friction stops you."}, "es": {"n": "Noseslide", "steps": ["Empieza en un bordillo bajo con cera, con casco y protecciones. Nunca un pasamanos ni escaleras.", "Rueda al lado del bordillo, cerca y casi paralelo, a una rapidez media y pareja.", "Haz un ollie y gira la tabla un cuarto de vuelta para que la nariz caiga sobre el borde del bordillo.", "Deja el pie de adelante en la nariz, presionando, y tu peso sobre él. La cola queda en el aire.", "Mira el final del bordillo y deja las rodillas dobladas.", "Al final, gira la tabla de vuelta un cuarto y aterriza rodando, con los pies sobre los tornillos."], "fixes": [["La cola baja y me detengo", "Deja más peso en el pie de adelante, sobre la nariz."], ["La nariz se resbala del bordillo", "Haz el ollie un poco más alto y cae con la nariz bien encima del borde."], ["Me detengo en el bordillo", "Entra un poco más rápido o pon más cera."]], "sci": "Al presionar la nariz, casi todo tu peso queda en ella, y la fricción es f = μN. La cera baja μ, así el mismo peso se desliza más lejos antes de que la fricción te detenga."}}, {"id": "varial", "lv": 5, "room": "flip", "feet": {"f": [0.05, -0.02, 30], "b": [-0.34, 0.05, 0]}, "arrows": [{"from": [-0.36, 0.05], "to": [-0.3, -0.2], "curve": 1}, {"from": [0.07, 0], "to": [0.33, 0.1]}], "pre": ["shove", "kickflip"], "en": {"n": "Varial kickflip", "steps": ["Advanced: learn this only after your pop shove-it and kickflip are both steady. Helmet on, on smooth, flat ground.", "Back foot on the tail, toes near the toe-side edge, ready to scoop. Front foot angled, just behind the front bolts.", "Pop the tail and scoop it behind you with your back foot, like a pop shove-it.", "At the same time, flick your front foot off the toe-side corner of the nose, a little forward, like a small kickflip.", "Jump up and lift your knees. The board spins half a turn flat and flips once under you.", "When you see the grip tape again, catch it with your back foot, then your front foot, and land over the bolts."], "fixes": [["It only shoves and doesn't flip", "Flick the front foot off the very corner of the nose."], ["It flips but only turns a quarter", "Scoop harder with the back foot."], ["The board flies away", "Jump straight up, and flick a little less."]], "sci": "The scoop is a torque about the up-down axis and the flick is a torque about the long axis, so the board spins both ways at once: half a turn flat and a full flip."}, "es": {"n": "Varial kickflip", "steps": ["Avanzado: apréndelo solo cuando tu pop shove-it y tu kickflip ya sean firmes. Con casco, en suelo liso y plano.", "Pie de atrás en la cola, con los dedos cerca del borde del lado de los dedos, listo para empujar. Pie de adelante en ángulo, justo detrás de los tornillos delanteros.", "Golpea la cola y empújala hacia atrás con el pie de atrás, como un pop shove-it.", "Al mismo tiempo, raspa con el pie de adelante la esquina de la nariz del lado de los dedos, un poco hacia adelante, como un kickflip pequeño.", "Salta y sube las rodillas. La tabla gira media vuelta plana y da una vuelta completa bajo ti.", "Cuando veas otra vez la lija, atrápala con el pie de atrás, luego el de adelante, y aterriza sobre los tornillos."], "fixes": [["Solo gira plana y no da la vuelta", "Raspa justo la esquina de la nariz con el pie de adelante."], ["Da la vuelta pero gira solo un cuarto", "Empuja más fuerte con el pie de atrás."], ["La tabla sale volando", "Salta recto hacia arriba y raspa un poco menos."]], "sci": "El empuje del pie de atrás es un torque sobre el eje vertical y el raspón es un torque sobre el eje largo, así la tabla gira de las dos formas a la vez: media vuelta plana y una vuelta completa."}}, {"id": "tre", "lv": 5, "room": "flip", "feet": {"f": [0.05, -0.02, 35], "b": [-0.36, 0.06, 0]}, "arrows": [{"from": [-0.38, 0.06], "to": [-0.3, -0.22], "curve": 1}, {"from": [0.07, 0], "to": [0.33, 0.1]}], "pre": ["varial", "kickflip", "shove"], "en": {"n": "360 flip (tre flip)", "steps": ["Advanced: learn this only after your varial kickflip is steady. Helmet on, on smooth, flat ground, never down stairs.", "Back foot on the tail, toes near the toe-side edge, ready to scoop. Front foot angled, just behind the front bolts.", "Pop and scoop the tail hard behind you and a little down with your back foot. The back foot does most of the work.", "Flick your front foot lightly off the toe-side corner of the nose, a little forward.", "Jump up and lift your knees high. The board spins a full turn flat and flips once under you.", "When you see the grip tape again, catch it with your back foot, then your front foot, and land over the bolts with bent knees."], "fixes": [["The board only turns half way", "Scoop harder with the back foot, with snap from the ankle."], ["It flips too much", "Flick lighter with the front foot. Let the back foot lead."], ["The board shoots out in front", "Jump straight up and scoop more behind you, less forward."]], "sci": "The scoop spins the board a full turn about the up-down axis while the flick spins it once about its long axis. Both spins start before the board leaves your feet; in the air nothing adds more."}, "es": {"n": "360 flip (tre flip)", "steps": ["Avanzado: apréndelo solo cuando tu varial kickflip ya sea firme. Con casco, en suelo liso y plano, nunca escaleras abajo.", "Pie de atrás en la cola, con los dedos cerca del borde del lado de los dedos, listo para empujar. Pie de adelante en ángulo, justo detrás de los tornillos delanteros.", "Golpea y empuja la cola fuerte hacia atrás y un poco hacia abajo con el pie de atrás. El pie de atrás hace casi todo el trabajo.", "Raspa suave con el pie de adelante la esquina de la nariz del lado de los dedos, un poco hacia adelante.", "Salta y sube bien las rodillas. La tabla gira una vuelta entera plana y da una vuelta completa bajo ti.", "Cuando veas otra vez la lija, atrápala con el pie de atrás, luego el de adelante, y aterriza sobre los tornillos con las rodillas dobladas."], "fixes": [["La tabla gira solo media vuelta", "Empuja más fuerte con el pie de atrás, con golpe del tobillo."], ["Da demasiadas vueltas", "Raspa más suave con el pie de adelante. Deja que guíe el pie de atrás."], ["La tabla se va adelante", "Salta recto hacia arriba y empuja más hacia atrás, menos hacia adelante."]], "sci": "El empuje gira la tabla una vuelta entera sobre el eje vertical mientras el raspón la hace dar una vuelta sobre su eje largo. Los dos giros empiezan antes de que la tabla deje tus pies; en el aire nada suma más."}}]);
const PRE = { stance: [], fall: [], push: ["stance"], stop: ["push"], kickturn: ["push"], tictac: ["kickturn"], manual: ["push"],
  dropin: ["kickturn", "stop"], ollie: ["push"], shove: ["ollie"], kickflip: ["ollie"], heelflip: ["ollie"], fs180: ["ollie"],
  fifty: ["ollie"], fiveo: ["fifty", "manual"], boardslide: ["ollie"], rockfakie: ["dropin"] };
TRICKS.forEach(t => { if (!t.pre) t.pre = PRE[t.id] || []; });
TRICKS.sort((a, b) => a.lv - b.lv);
const LV = { 1: ["First steps", "Primeros pasos"], 2: ["Rolling", "Rodando"], 3: ["Pop and flip", "Saltar y girar"], 4: ["Grinds and ramps", "Grinds y rampas"], 5: ["Advanced", "Avanzado"] };
const STATUS = [["Not yet", "Todavía no"], ["Learning", "Aprendiendo"], ["Landed it once", "Lo logré una vez"], ["Got it (7 of 10)", "Lo domino (7 de 10)"]];
function prog(id) { return (S.progress && S.progress[id]) || 0; }

/* ══ the trick demos (AOG-SKATE-DEMO-V1) ══════════════════════════════════════════════════════════════════
   A demo is a list of keys in time. Each key sets any of: where the board is (free: bx, by in meters; or on the mini ramp:
   mode "path" and s, the distance along the ramp), its lift h, pitch (degrees, about the back wheels, the front wheels or
   the middle: piv), roll and yaw (degrees: drawn as a true 3D board), dir −1 to face the other way; the feet (f, b: their
   place along the board and how far lifted; fg, bg: a foot on the ground, in meters), crouch, lean, arms, jump, turn (the
   body turning, degrees), ba (the body tipping about the feet, degrees) and hx (weight forward or back). Between keys
   everything eases. s is the step shown in the list. */
const KD = (t, s, o) => Object.assign({ t, s }, o || {});
const DEMO_DEF = { scene: "flat", mode: "free", dir: 1, s0: 0, bx: 0, by: 0, h: 0, pitch: 0, piv: "mid", roll: 0, yaw: 0, crouch: 0.25, lean: 0.04, arms: 1, jump: 0, turn: 0, ba: 0, hx: 0, f: [0.13, 0], b: [-0.2, 0], fg: null, bg: null, path: 0 };
const NUMS = ["bx", "by", "h", "pitch", "roll", "yaw", "crouch", "lean", "arms", "jump", "turn", "ba", "hx", "path"];
let DPATH = null;
function demoPath() { if (!DPATH) DPATH = prepPath(buildPath("demo", SHAPES.demo.Hm)); return DPATH; }
/* the ollie and every trick built on it: phases → step numbers; o.roll / o.yaw / o.turn spin during the air */
function popDemo(o) {
  const st = o.steps, R = o.roll || 0, Y = o.yaw || 0, T = o.turn || 0, back = o.back || [-0.33, 0], front = o.front || [0.04, 0];
  const keys = [
    KD(0, st[0], { bx: -3.60, b: back, f: front, crouch: 0.2, arms: 0.8 }),
    KD(1.0, st[1], { bx: -2.00, turn: o.wind || 0 }),
    KD(1.7, st[2], { bx: -0.88, crouch: 0.85, arms: 0.6 }),
    KD(2.05, st[3], { bx: -0.32, piv: "back", pitch: 24, h: 0.02, crouch: 0.55, jump: 0.07, arms: 1 }),
    KD(2.2, st[4], { bx: -0.08, pitch: 10, h: 0.16, f: [front[0] + 0.22, 0.03], b: [back[0] + 0.02, 0.05], crouch: 0.6 }),
    KD(2.38, st[5], { bx: 0.21, pitch: 2, h: 0.3, roll: R * 0.45, yaw: Y * 0.45, turn: T * 0.45, f: [0.2, R ? 0.12 : 0.04], b: [-0.2, R || Y ? 0.1 : 0.04], crouch: 0.92 }),
    KD(2.6, st[5], { bx: 0.56, pitch: 0, h: 0.24, roll: R, yaw: Y, turn: T, f: [0.16, 0.05], b: [-0.18, 0.05], crouch: 0.9 }),
    KD(2.82, st[6], { bx: 0.91, h: 0, crouch: 0.68, f: [0.16, 0], b: [-0.18, 0] }),
    KD(3.4, st[6], { bx: 1.84, crouch: 0.3 }),
    KD(4.0, st[6], { bx: 2.80 })
  ];
  keys.forEach(k => k.bx = 1.6 * k.t - 3.6);   // rolling at a steady 1.6 m/s
  return { scene: "flat", view: [-1.25, 1.0, -0.06, 2.25], seq: [1.5, 3.05], keys };
}
function grindDemo(o) {   // ollie onto a low curb, ride it, come off: o.onCurb holds the board's pose on the curb
  const st = o.steps, on = o.onCurb;
  return { scene: "curb", view: [-1.75, 2.05, -0.06, 2.2], seq: [0.85, 3.95], keys: [
    KD(0, st[0], { bx: -1.55, crouch: 0.25 }),
    KD(1.0, st[1], { bx: -1.15, crouch: 0.6, b: [-0.33, 0], f: [0.05, 0] }),
    KD(1.3, st[2], { bx: -0.95, piv: "back", pitch: 20, h: 0.05, crouch: 0.5, jump: 0.05 }),
    KD(1.55, st[2], Object.assign({ bx: -0.68, pitch: 0, h: 0.27, f: [0.15, 0.03], b: [-0.2, 0.03], crouch: 0.8 }, on.air || {})),
    KD(1.8, st[3], Object.assign({ bx: -0.4, h: 0.13, crouch: 0.45, jump: 0 }, on)),
    KD(2.9, st[3], Object.assign({ bx: 0.55 }, on)),
    KD(3.4, st[4], Object.assign({ bx: 0.95 }, on)),
    KD(3.65, st[4], { bx: 1.25, h: 0.12, pitch: 0, yaw: 0, turn: 0, hx: 0, piv: "mid" }),
    KD(3.9, st[4], { bx: 1.5, h: 0, crouch: 0.55 }),
    KD(4.6, st[4], { bx: 1.85, crouch: 0.3 })
  ] };
}
const DEMOS = {
  stance: { scene: "grass", view: [-0.95, 0.95, -0.06, 2.1], keys: [
    KD(0, 0, { crouch: 0.05, arms: 0.35, lean: 0 }), KD(1.4, 1, { f: [0.1, 0], b: [-0.24, 0] }), KD(2.6, 2, { f: [0.18, 0], b: [-0.18, 0] }),
    KD(3.8, 3, { crouch: 0.35 }), KD(5.0, 4, { arms: 1, lean: 0.02 }), KD(6.0, 4, {})] },
  push: { scene: "flat", view: [-1.0, 2.45, -0.06, 2.2], keys: [
    KD(0, 0, { bx: -0.45, b: null, bg: [-0.52, 0], f: [0.15, 0], crouch: 0.15, arms: 0.5 }), KD(1.1, 1, {}),
    KD(1.7, 2, { crouch: 0.35 }), KD(2.5, 2, { bx: -0.05, bg: [-0.62, 0], crouch: 0.32 }),
    KD(2.9, 3, { bx: 0.2, bg: [0.0, 0.13], crouch: 0.25 }), KD(3.25, 3, { bx: 0.4, b: [-0.18, 0], bg: null }),
    KD(4.6, 4, { bx: 1.2, crouch: 0.3 }), KD(5.2, 4, { bx: 1.42 })] },
  stop: { scene: "flat", view: [-1.0, 2.3, -0.06, 2.2], keys: [
    KD(0, 0, { bx: -0.7, crouch: 0.25 }), KD(1.2, 1, { bx: -0.15, f: [0.15, 0] }),
    KD(2.0, 2, { bx: 0.25, b: null, bg: [0.12, 0.07], crouch: 0.3 }), KD(2.8, 3, { bx: 0.62, bg: [0.48, 0], crouch: 0.35 }),
    KD(3.8, 3, { bx: 0.86, bg: [0.72, 0] }), KD(4.6, 4, { bx: 0.95, bg: [0.8, 0], crouch: 0.15 }), KD(5.4, 4, {})] },
  kickturn: { scene: "flat", view: [-1.0, 1.0, -0.06, 2.2], keys: [
    KD(0, 0, { b: [-0.32, 0], f: [0.1, 0], crouch: 0.3 }), KD(1.2, 1, { piv: "back", pitch: 11, crouch: 0.35, hx: -0.04 }),
    KD(2.2, 2, { pitch: 11, yaw: 45, turn: 35 }), KD(3.0, 3, { pitch: 0, yaw: 70, turn: 50, hx: 0 }),
    KD(4.0, 4, { piv: "back", pitch: 10, yaw: 25, turn: 20 }), KD(4.8, 4, { pitch: 0, yaw: 0, turn: 0 }), KD(5.4, 4, {})] },
  manual: { scene: "flat", view: [-1.35, 1.55, -0.06, 2.2], keys: [
    KD(0, 0, { bx: -1.05, b: [-0.27, 0], f: [0.08, 0] }), KD(1.0, 1, { bx: -0.7, crouch: 0.3, hx: -0.03 }),
    KD(1.8, 2, { bx: -0.35, piv: "back", pitch: 9, hx: -0.09, lean: -0.08 }), KD(3.4, 3, { bx: 0.35, pitch: 9 }),
    KD(4.2, 4, { bx: 0.7, pitch: 0, hx: 0, lean: 0.04 }), KD(4.9, 4, { bx: 0.95 })] },
  nosemanual: { scene: "flat", view: [-1.35, 1.55, -0.06, 2.2], keys: [
    KD(0, 0, { bx: -1.05 }), KD(1.0, 1, { bx: -0.75, f: [0.33, 0], b: [-0.03, 0], crouch: 0.3 }),
    KD(1.8, 2, { bx: -0.4, piv: "front", pitch: -9, hx: 0.09, lean: 0.12 }), KD(2.4, 3, { bx: -0.15, pitch: -9 }),
    KD(3.4, 4, { bx: 0.35, pitch: -9 }), KD(4.2, 5, { bx: 0.7, pitch: 0, hx: 0, lean: 0.04 }), KD(4.9, 5, { bx: 0.95 })] },
  tictac: (() => { const k = [KD(0, 0, { bx: -0.85, b: [-0.32, 0], f: [0.1, 0], crouch: 0.3 })];
    for (let i = 0; i < 7; i++) k.push(KD(0.9 + i * 0.55, i < 1 ? 1 : i < 2 ? 2 : i < 6 ? 3 : 4, { bx: -0.75 + i * 0.2, piv: "back", pitch: i % 2 ? 2 : 7, yaw: i % 2 ? -22 : 22, turn: i % 2 ? -14 : 14 }));
    k.push(KD(5.0, 4, { bx: 0.65, pitch: 0, yaw: 0, turn: 0 })); return { scene: "flat", view: [-1.2, 1.35, -0.06, 2.2], keys: k }; })(),
  carve: { scene: "flat", view: [-1.35, 1.6, -0.06, 2.2], keys: [
    KD(0, 0, { bx: -1.1 }), KD(0.9, 1, { bx: -0.8, crouch: 0.35 }),
    KD(1.8, 2, { bx: -0.45, roll: 9, yaw: 14, turn: 10, hx: 0.02 }), KD(2.8, 3, { bx: -0.05, roll: -9, yaw: -14, turn: -10 }),
    KD(3.7, 4, { bx: 0.3, roll: 10, yaw: 16, turn: 12, crouch: 0.42 }), KD(4.6, 5, { bx: 0.65, roll: -10, yaw: -16, turn: -12 }),
    KD(5.4, 5, { bx: 0.95, roll: 0, yaw: 0, turn: 0, crouch: 0.3 })] },
  fakie: { scene: "flat", view: [-1.4, 1.2, -0.06, 2.2], keys: [
    KD(0, 0, { bx: 0.85 }), KD(1.0, 1, { f: [0.17, 0], b: [-0.18, 0] }), KD(2.0, 2, { bx: 0.7, crouch: 0.3 }),
    KD(3.0, 3, { bx: 0.25, turn: -18, lean: -0.05 }), KD(4.0, 4, { bx: -0.25, crouch: 0.35 }), KD(5.0, 5, { bx: -0.55, turn: 0, crouch: 0.15 }), KD(5.6, 5, { bx: -0.6 })] },
  ollie: popDemo({ steps: [0, 1, 2, 3, 4, 5, 6] }),
  kickflip: popDemo({ steps: [0, 1, 2, 2, 3, 4, 5], roll: 360, front: [0.02, 0] }),
  heelflip: popDemo({ steps: [0, 0, 1, 1, 2, 3, 4], roll: -360, front: [0.08, 0] }),
  shove: popDemo({ steps: [0, 1, 2, 2, 2, 3, 4], yaw: 180 }),
  varial: popDemo({ steps: [0, 1, 2, 2, 3, 4, 5], yaw: 180, roll: 360 }),
  tre: popDemo({ steps: [0, 1, 2, 2, 3, 4, 5], yaw: 360, roll: 360 }),
  fs180: popDemo({ steps: [0, 1, 2, 2, 3, 3, 4], yaw: 180, turn: 180, wind: -25 }),
  bs180: popDemo({ steps: [0, 1, 2, 2, 3, 3, 4], yaw: -180, turn: -180, wind: 25 }),
  fifty: grindDemo({ steps: [0, 1, 2, 3, 4], onCurb: { pitch: 0 } }),
  fiveo: grindDemo({ steps: [0, 1, 1, 2, 4], onCurb: { piv: "back", pitch: 8, hx: -0.06 } }),
  boardslide: grindDemo({ steps: [0, 1, 2, 3, 4], onCurb: { h: 0.085, yaw: 90, turn: 75, air: { yaw: 60, turn: 50 } } }),
  noseslide: grindDemo({ steps: [0, 1, 2, 3, 5], onCurb: { h: 0.085, yaw: 90, turn: 75, hx: 0.06, air: { yaw: 60, turn: 50 } } }),
  fall: { scene: "grass", view: [-1.1, 1.4, -0.06, 2.1], keys: [
    KD(0, 0, { crouch: 0.15 }), KD(1.2, 1, { crouch: 0.95, arms: 0.4 }), KD(2.0, 2, { arms: 0.0, ba: -18 }),
    KD(2.8, 3, { ba: -50, crouch: 1, f: null, b: null, fg: [0.2, 0], bg: [-0.12, 0], bx: 0.45, arms: 0.75 }), KD(3.6, 3, { ba: -58, bx: 0.7, arms: 0.85 }),
    KD(4.6, 4, { ba: 0, crouch: 0.15, arms: 0.6, fg: [0.1, 0], bg: [-0.22, 0], bx: 0.75 }), KD(5.4, 4, {})] },
  dropin: { scene: "ramp", view: [-1.25, 1.95, -0.06, 2.75], seq: [2.3, 5.3], keys: [
    KD(0, 0, { bx: 0.24, by: 0.885, piv: "back", pitch: 12, b: [-0.33, 0], f: null, fg: [-0.42, 0.9], crouch: 0.2, arms: 0.6 }),
    KD(1.2, 1, {}), KD(2.4, 2, { f: [0.15, 0], fg: null, crouch: 0.3 }),
    KD(3.3, 3, { pitch: -35, lean: 0.12, ba: -28, crouch: 0.42 }), KD(3.85, 3, { pitch: -55, ba: -42 }),
    KD(3.95, 4, { mode: "path", s0: 0.2, bx: 0, by: 0, pitch: 0, piv: "mid", ba: 0, lean: 0.12, crouch: 0.48 }),
    KD(5.0, 4, { s0: 1.55, crouch: 0.35, lean: 0.06 }), KD(5.7, 4, { s0: 2.35 })] },
  rockfakie: { scene: "ramp", view: [-1.25, 2.6, -0.06, 2.75], keys: [
    KD(0, 0, { mode: "path", dir: -1, s0: 2.7, crouch: 0.3 }), KD(1.0, 1, { s0: 1.0, crouch: 0.38 }), KD(1.5, 1, { s0: 0.24 }),
    KD(1.75, 2, { mode: "free", dir: -1, bx: 0.03, by: 0.87, pitch: -4, ba: 0, crouch: 0.3 }), KD(2.7, 3, { piv: "back", pitch: 9 }),
    KD(3.05, 4, { mode: "path", dir: -1, s0: 0.28, pitch: 0, piv: "mid" }), KD(4.4, 4, { s0: 2.3, crouch: 0.32 })] },
  axlestall: { scene: "ramp", view: [-1.25, 2.6, -0.06, 2.75], keys: [
    KD(0, 0, { mode: "path", dir: -1, s0: 2.7, crouch: 0.3 }), KD(1.0, 1, { s0: 1.0, crouch: 0.4 }), KD(1.45, 1, { s0: 0.24 }),
    KD(1.75, 2, { mode: "free", dir: -1, bx: 0.03, by: 0.9, yaw: 45, turn: 45, piv: "back", pitch: 8 }),
    KD(2.3, 3, { yaw: 90, turn: 90, pitch: 0, by: 0.92 }), KD(3.4, 4, {}),
    KD(3.9, 5, { yaw: 160, turn: 150, piv: "back", pitch: -25, ba: -20 }),
    KD(4.15, 5, { mode: "path", dir: 1, s0: 0.24, yaw: 0, turn: 0, pitch: 0, piv: "mid", ba: 0 }), KD(5.4, 5, { s0: 2.3 })] },
  pump: (() => { const L = 5.5, k = [KD(0, 0, { mode: "path", s0: 0.45, crouch: 0.5 })];
    const pts = [[1.0, 1, 1.35, 0.25], [1.9, 2, 2.75, 0.2], [2.8, 3, 4.6, 0.85], [3.7, 3, 3.6, 0.2], [4.6, 4, 2.0, 0.15], [5.5, 4, 0.75, 0.9], [6.4, 5, 2.0, 0.15], [7.3, 5, 3.9, 0.2], [8.2, 5, 5.05, 0.9]];
    pts.forEach(p => k.push(KD(p[0], p[1], { s0: Math.min(p[2], L), crouch: p[3] })));
    return { scene: "ramp", view: [-0.7, 5.5, -0.06, 2.6], keys: k }; })()
};
/* fill every key from the one before it, so each key is a whole pose */
function demoKeys(D) {
  if (D._full) return D._full;
  let prev = Object.assign({}, DEMO_DEF);
  D._full = D.keys.map(k => { const o = Object.assign({}, prev, k); if ("fg" in k && k.fg) o.f = null; if ("bg" in k && k.bg) o.b = null; prev = o; return o; });
  return D._full;
}
function demoAt(D, t) {
  const K = demoKeys(D); let i = 0;
  while (i < K.length - 2 && K[i + 1].t <= t) i++;
  const a = K[i], b = K[Math.min(i + 1, K.length - 1)], u = b.t > a.t ? ease(clamp((t - a.t) / (b.t - a.t), 0, 1)) : 0;
  const o = Object.assign({}, a);
  if (a.mode === b.mode && a.dir === b.dir) {
    NUMS.forEach(n => o[n] = lerp(a[n], b[n], u)); o.s0 = lerp(a.s0, b.s0, u);
    const ul = b.t > a.t ? clamp((t - a.t) / (b.t - a.t), 0, 1) : 0; o.bx = lerp(a.bx, b.bx, ul);   // rolling is steady: the distance moves evenly, never in jerks
    ["f", "b", "fg", "bg"].forEach(n => { if (a[n] && b[n]) o[n] = [lerp(a[n][0], b[n][0], u), lerp(a[n][1], b[n][1], u)]; });
  }
  o.step = t >= b.t ? b.s : a.s; o.t = t;
  return o;
}
/* the board in 3D, in the current transform (meters, y up), seen from the side and a little above */
function drawBoard3D(roll, yaw) {
  const view = [0, 9], r = { roll, yaw, pitch: 0, h: 0 }, m = boardMesh();
  const P = p => { const q = project(rot(p, r), view); return q; };
  const top = m.out.map(p => P(p)), bot = m.out.map(p => P([p[0], p[1], p[2] - 0.014]));
  const faces = [], depth = a => a.reduce((s, q) => s + q[2], 0) / a.length;
  faces.push({ pts: top, col: C.grip, d: depth(top) }); faces.push({ pts: bot.slice().reverse(), col: C.deck, d: depth(bot) });
  // the graphic under the deck (seen when it flips): two bold bands and a dot, just below the wood
  const gz = 0.085 - 0.0146, bd = depth(bot);
  [[-0.2, -0.12, C.sole], [-0.06, 0.02, C.ke], [0.1, 0.13, C.sole]].forEach(([x0, x1, col]) => {
    const q = [[x0, -0.1, gz], [x1, -0.1, gz], [x1, 0.1, gz], [x0, 0.1, gz]].map(P);
    faces.push({ pts: q, col, d: bd + 1e-6, edge: true });
  });
  for (let i = 0; i < top.length; i++) { const j = (i + 1) % top.length, q = [top[i], top[j], bot[j], bot[i]]; faces.push({ pts: q, col: shade(C.deck, -0.12), d: depth(q), edge: true }); }
  [-0.18, 0.18].forEach(x => {
    const tq = [[x - 0.03, -0.075, 0.07], [x + 0.03, -0.075, 0.07], [x + 0.03, 0.075, 0.07], [x - 0.03, 0.075, 0.07]].map(P);
    faces.push({ pts: tq, col: C.truck, d: depth(tq) });
    [-0.095, 0.095].forEach(y => { const c = P([x, y, 0.027]); faces.push({ wheel: c, d: c[2] - 0.002 }); });
  });
  faces.sort((a, b) => a.d - b.d);
  faces.forEach(f => {
    if (f.wheel) { drawWheel(f.wheel[0], f.wheel[1], 0.026); return; }
    ctx.beginPath(); f.pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
    ctx.fillStyle = f.col; ctx.fill(); if (!f.edge) { ctx.strokeStyle = shade(C.deck, -0.45); ctx.lineWidth = 0.003; ctx.stroke(); }
  });
}
function is0(a) { const m = ((a % 360) + 360) % 360; return m < 0.5 || m > 359.5; }
function is180(a) { const m = ((a % 360) + 360) % 360; return Math.abs(m - 180) < 0.5; }
function simDemo(id) {
  const D = DEMOS[id]; if (!D) return { frames: [] };
  const K = demoKeys(D), end = K[K.length - 1].t, frames = [], dt = 1 / 60;
  for (let t = 0; t <= end + 1e-9; t += dt) frames.push(demoAt(D, t));
  // AOG-SKATE-FILM-V1: what a filmer would catch. The camera follows the rider on flat ground; the arms rise and the
  // hood strings swing a moment behind the body (two soft springs); the pop and the landing are marked for their dust.
  const follow = D.scene === "flat" || D.scene === "grass";
  let cam = frames.length ? frames[0].bx : 0, cv = 0, L = 0, Lv = 0, Sx = 0, Sv = 0, popT = -9, landT = -9, popX = 0, landX = 0, wasUp = false, wasPop = false;
  frames.forEach((f, i) => {
    const p = frames[Math.max(0, i - 1)];
    const hy = f.by + f.h + f.jump - 0.36 * f.crouch, py = p.by + p.h + p.jump - 0.36 * p.crouch;
    const vy = (hy - py) / dt, vx = (f.bx - p.bx) / dt + (f.mode === "path" ? (f.s0 - p.s0) / dt * f.dir : 0);
    const up = f.h > 0.05;
    const tl = clamp(Math.abs(vy) * 0.55 + (up ? 0.45 : 0), 0, 1.1);
    Lv += ((tl - L) * 140 - Lv * 16) * dt; L += Lv * dt;
    const ts = clamp(-vx * 0.35 - vy * 0.5, -1, 1);
    Sv += ((ts - Sx) * 90 - Sv * 7) * dt; Sx += Sv * dt;
    const pop = f.piv === "back" && f.pitch > 14 && f.h < 0.06 && f.mode === "free" && D.scene !== "ramp";
    if (pop && !wasPop) { popT = f.t; popX = f.bx - BOARD.half * f.dir; }
    if (!up && wasUp) { landT = f.t; landX = f.bx; }
    wasPop = pop; wasUp = up;
    if (follow) { const bv = (f.bx - p.bx) / dt; cv += ((f.bx - cam) * 14 + (bv - cv) * 8) * dt; cam += cv * dt; }   // matches the rider's speed, so the rider stays in the middle
    Object.assign(f, { lift: L, str: Sx, cam: follow ? cam : null, popAge: f.t - popT, popX, landAge: f.t - landT, landX });
  });
  return { frames };
}
/* the wheels turn with the distance rolled: a mark on each core shows it */
let WHEEL_A = 0;
/* the scene: flat ground, grass, a curb or the mini ramp; on flat ground the camera moves, so the ground and a far ledge slide by */
function drawDemoScene(D, X, Y, sc, cam) {
  const sky = D.scene;
  if (sky === "ramp") {
    const p = demoPath().pts, top = SHAPES.demo.Hm;
    ctx.fillStyle = C.ramp; ctx.beginPath(); ctx.moveTo(X(-3), Y(top)); ctx.lineTo(X(p[0].x), Y(top));
    p.forEach(q => ctx.lineTo(X(q.x), Y(q.y))); ctx.lineTo(X(p[p.length - 1].x + 3), Y(top)); ctx.lineTo(X(p[p.length - 1].x + 3), Y(-1)); ctx.lineTo(X(-3), Y(-1)); ctx.closePath(); ctx.fill();
    // plywood sheets on the transition, framing under the deck
    ctx.save(); ctx.clip(); ctx.strokeStyle = alpha(C.ink, 0.07); ctx.lineWidth = 1.5;
    for (let x = -3; x < 0; x += 0.4) { ctx.beginPath(); ctx.moveTo(X(x), Y(top) + 2); ctx.lineTo(X(x), Y(0)); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = C["ramp-edge"]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(-3), Y(top)); p.forEach(q => ctx.lineTo(X(q.x), Y(q.y))); ctx.lineTo(X(p[p.length - 1].x + 3), Y(top)); ctx.stroke();
    [p[0], p[p.length - 1]].forEach(q => { const r = Math.max(4, 0.03 * sc); const g = ctx.createLinearGradient(0, Y(top) - r, 0, Y(top) + r); g.addColorStop(0, shade(C.truck, 0.5)); g.addColorStop(1, shade(C.truck, -0.3)); ctx.fillStyle = g; ctx.strokeStyle = shade(C.truck, -0.5); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(q.x), Y(top), r, 0, 7); ctx.fill(); ctx.stroke(); });
    drawGround(Y(0) + 1, 0, W, 0);
    return;
  }
  const sh = cam || 0;
  // far away (slides slower): low ledges and lamp posts standing on the ground, faint
  const far = x => X(x * 0.5 + sh * 0.5);
  for (let k = Math.floor((sh - 10) / 5) - 1; k < (sh + 10) / 5 + 1; k++) {
    const x0 = k * 5, lx = far(x0), lw = 1.4 * 0.5 * sc, lh = 0.2 * sc;
    ctx.fillStyle = alpha(C.ink, 0.045); ctx.fillRect(lx, Y(0) - lh, lw, lh);
    ctx.fillStyle = alpha(C.ink, 0.08); ctx.fillRect(lx, Y(0) - lh, lw, 3);
    const px = far(x0 + 3.2); ctx.fillStyle = alpha(C.ink, 0.07); ctx.fillRect(px - 1.5, Y(0) - 1.6 * sc, 3, 1.6 * sc);
    ctx.fillRect(px - 1.5, Y(0) - 1.6 * sc, 0.16 * sc, 3); ctx.beginPath(); ctx.ellipse(px + 0.16 * sc, Y(0) - 1.6 * sc + 4, 0.05 * sc, 0.02 * sc, 0, 0, 7); ctx.fill();
  }
  drawGround(Y(0), 0, W, 0);
  // expansion joints and a few cracks in the slab, fixed to the ground so they slide by as the camera follows
  ctx.strokeStyle = alpha(C.ink, 0.1); ctx.lineWidth = 1.5;
  for (let k = Math.floor((sh - 6) / 1.5); k < (sh + 6) / 1.5; k++) { const x = X(k * 1.5); ctx.beginPath(); ctx.moveTo(x, Y(0) + 3); ctx.lineTo(x - 0.25 * sc, H); ctx.stroke(); }
  ctx.strokeStyle = alpha(C.ink, 0.06); ctx.lineWidth = 1;
  for (let k = Math.floor((sh - 6) / 2.1); k < (sh + 6) / 2.1; k++) { const x = X(k * 2.1 + 0.6); ctx.beginPath(); ctx.moveTo(x, Y(0) + 8); ctx.lineTo(x + 0.08 * sc, Y(0) + 16); ctx.lineTo(x + 0.03 * sc, Y(0) + 26); ctx.stroke(); }
  if (sky === "grass") {
    ctx.fillStyle = alpha(C.good, 0.22); ctx.fillRect(0, Y(0), W, H - Y(0));
    ctx.strokeStyle = alpha(C.good, 0.5); ctx.lineWidth = 2;
    for (let x = 12; x < W; x += 23) { ctx.beginPath(); ctx.moveTo(x, Y(0) + 2); ctx.lineTo(x - 4, Y(0) - 7); ctx.moveTo(x + 6, Y(0) + 2); ctx.lineTo(x + 9, Y(0) - 5); ctx.stroke(); }
    text(L("Grass or carpet", "Pasto o alfombra"), W - 16, Y(0) + FS * 1.3, { a: "right", m: .75, c: C.soft });
  }
  if (sky === "curb") {
    const c0 = -0.5, c1 = 1.32, ht = 0.16;
    const g = ctx.createLinearGradient(0, Y(ht), 0, Y(0)); g.addColorStop(0, shade(C.ramp, 0.18)); g.addColorStop(1, shade(C.ramp, -0.05));
    ctx.fillStyle = g; ctx.fillRect(X(c0), Y(ht), (c1 - c0) * sc, ht * sc);
    ctx.fillStyle = shade(C.truck, 0.2); ctx.fillRect(X(c0), Y(ht), (c1 - c0) * sc, 0.022 * sc);              // angle iron on the edge
    ctx.strokeStyle = alpha(C.ke, 0.9); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(c0), Y(ht)); ctx.lineTo(X(c1), Y(ht)); ctx.stroke();    // the wax
    ctx.strokeStyle = shade(C.ramp, -0.4); ctx.lineWidth = 1.5; ctx.strokeRect(X(c0), Y(ht), (c1 - c0) * sc, ht * sc);
    text(L("Low curb, waxed", "Bordillo bajo con cera"), X((c0 + c1) / 2), Y(0) + FS * 1.3, { a: "center", m: .75, c: C.soft });
  }
}
/* dust where the tail snaps the ground, and where the wheels land: a few soft puffs that spread and fade */
function drawDust(x0, y0, age, sc, wide) {
  if (age < 0 || age > 0.45) return;
  const u = age / 0.45;
  ctx.save(); ctx.fillStyle = alpha(C.ground === "" ? C.soft : shade(C.ground, -0.25), 0.32 * (1 - u));
  [-1, -0.5, 0.15, 0.6, 1].forEach((d, i) => { const r = (0.025 + 0.05 * u) * sc * (i % 2 ? 0.8 : 1); ctx.beginPath(); ctx.arc(x0 + d * (0.05 + 0.18 * u) * sc * wide, y0 - (0.01 + 0.04 * u * (i % 2 ? 1.4 : 0.8)) * sc, r, 0, 7); ctx.fill(); });
  ctx.restore();
}
function demoFrame(D) {   // the drawing frame for a demo: the view widened a little so arms never leave the picture
  const v = [D.view[0] - 0.45, D.view[1] + 0.45, D.view[2], D.view[3]], gap = Math.max(22, FS * 1.7), sc = Math.min((W - 40) / (v[1] - v[0]), (H - 18 - gap) / (v[3] - v[2]));
  const ox = (W - (v[1] - v[0]) * sc) / 2 - v[0] * sc, oy = H - gap + v[2] * sc - Math.max(0, (H - 18 - gap - (v[3] - v[2]) * sc)) / 2;
  return { v, sc, ox, oy, mid: (D.view[0] + D.view[1]) / 2 };
}
function drawDemo(fr, D, opt) {
  opt = opt || {};
  const F = demoFrame(D), sc = F.sc, cam = opt.cam != null ? opt.cam : (fr && fr.cam != null ? fr.cam : null);
  const shift = cam != null ? cam - F.mid : 0;
  const X = x => F.ox + (x - shift) * sc, Y = y => F.oy - y * sc;
  if (!opt.noScene) drawDemoScene(D, X, Y, sc, shift);
  if (!fr) return;
  if (!opt.noFx) {
    drawDust(X(fr.popX), Y(0), fr.popAge, sc, 0.7);
    if (fr.popAge >= 0 && fr.popAge < 0.12) {   // the snap
      ctx.save(); ctx.strokeStyle = alpha(C.ink, 0.5 * (1 - fr.popAge / 0.12)); ctx.lineWidth = 2;
      [-2.4, -1.9, -1.4].forEach(a => { const x = X(fr.popX), y = Y(0.01); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 0.05 * sc * fr.dir, y + Math.sin(a) * 0.05 * sc); ctx.lineTo(x + Math.cos(a) * 0.12 * sc * fr.dir, y + Math.sin(a) * 0.12 * sc); ctx.stroke(); });
      ctx.restore();
    }
    drawDust(X(fr.landX), Y(D.scene === "curb" && fr.landX > -0.5 && fr.landX < 1.32 ? 0.16 : 0), fr.landAge, sc, 1.6);
  }
  // the surface frame: the ground, or a point on the ramp with its slope
  let sx = 0, sy = 0, ang = 0;
  if (fr.mode === "path") { const q = at(demoPath(), fr.s0); sx = q.x; sy = q.y; ang = Math.atan2(q.ty, q.tx); }
  const dir = fr.dir, pv = (fr.piv === "back" ? -BOARD.axle : fr.piv === "front" ? BOARD.axle : 0) * dir, a = fr.pitch * DEG * dir;
  const bt = (x, y) => { const x1 = x * dir; const xr = pv + (x1 - pv) * Math.cos(a) - y * Math.sin(a), yr = (x1 - pv) * Math.sin(a) + y * Math.cos(a); return [fr.bx + xr, fr.by + fr.h + yr]; };
  const flat2D = is0(fr.roll) && (is0(fr.yaw) || is180(fr.yaw));
  WHEEL_A = -((fr.mode === "path" ? fr.s0 * dir : fr.bx) / BOARD.wheelR);
  ctx.save(); ctx.translate(X(sx), Y(sy)); ctx.scale(sc, -sc); ctx.rotate(ang);
  if (fr.mode === "path" || Math.abs(fr.pitch) < 15 || fr.h > 0.05) { ctx.save(); ctx.translate(fr.bx, fr.by); boardShadow(fr.h); ctx.restore(); }
  ctx.save(); ctx.translate(fr.bx, fr.by + fr.h); ctx.translate(pv, 0); ctx.rotate(a); ctx.translate(-pv, 0); ctx.scale(dir * (flat2D && is180(fr.yaw) ? -1 : 1), 1);
  if (flat2D) drawBoardSide(); else drawBoard3D(fr.roll, fr.yaw);
  ctx.restore();
  // the feet: on the board (turned with it when it spins) or on the ground
  const onBoard = (q) => {
    if (flat2D) { const xx = q[0] * (is180(fr.yaw) ? -1 : 1); return bt(xx, deckTop(q[0]) + q[1]); }
    const p3 = project(rot([q[0], 0, deckTop(q[0])], { roll: fr.roll, yaw: fr.yaw, pitch: 0, h: 0 }), [0, 9]);
    return bt(p3[0], p3[1] + q[1]);
  };
  const fF = fr.f ? onBoard(fr.f) : fr.fg, fB = fr.b ? onBoard(fr.b) : fr.bg;
  const mid = [(fF[0] + fB[0]) / 2 + fr.hx, (fF[1] + fB[1]) / 2];
  let hip = [mid[0], mid[1] + 0.84 - 0.36 * fr.crouch + fr.jump];
  const ba = fr.ba * DEG; hip = [mid[0] + (hip[0] - mid[0]) * Math.cos(ba) - (hip[1] - mid[1]) * Math.sin(ba), mid[1] + (hip[0] - mid[0]) * Math.sin(ba) + (hip[1] - mid[1]) * Math.cos(ba)];
  const tc = Math.cos(fr.turn * DEG), sq = Math.max(0.62, Math.abs(tc));
  // which way the rider looks: toward the nose (riding fakie, the body still faces the same way; the head looks back)
  const nose = dir * (Math.cos(fr.yaw * DEG) >= 0 ? 1 : -1) * (tc >= 0 ? 1 : -1);
  ctx.save(); ctx.translate(hip[0], 0); ctx.scale(sq, 1); ctx.translate(-hip[0], 0);
  drawBody(fB, fF, hip, { lean: fr.lean - ba, arms: fr.arms, nose, lift: opt.still ? 0 : fr.lift || 0, str: opt.still ? 0 : fr.str || 0, twist: Math.sin(fr.turn * DEG), back: tc < 0 });
  ctx.restore();
  ctx.restore();
}
/* the sequence shot: the trick in seven faded moments across one picture, the way skate magazines print it */
function drawSequence(D, frames) {
  if (!frames.length) return;
  const K = demoKeys(D), t0 = D.seq ? D.seq[0] : 0, t1 = D.seq ? D.seq[1] : K[K.length - 1].t;
  const pick = [];
  for (let i = 0; i < 7; i++) { const t = t0 + (t1 - t0) * i / 6; pick.push(frames[clamp(Math.round(t * 60), 0, frames.length - 1)]); }
  // on flat ground the picture widens to hold the whole trick; on a curb or a ramp the stage already does
  const flat = D.scene === "flat" || D.scene === "grass", xs = pick.map(f => f.bx), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  if (flat) D = Object.assign({}, D, { view: [Math.min(D.view[0], x0 - 0.5), Math.max(D.view[1], x1 + 0.5), D.view[2], D.view[3]] });
  const cam = flat ? (D.view[0] + D.view[1]) / 2 : null;
  drawDemo(null, D, { cam });
  // each moment is drawn whole on its own sheet, then laid down faded, so a rider's parts never show through each other
  const off = drawSequence.off || (drawSequence.off = document.createElement("canvas")), main = ctx;
  off.width = cv.width; off.height = cv.height;
  pick.forEach((f, i) => {
    const o2 = off.getContext("2d"); o2.setTransform(1, 0, 0, 1, 0, 0); o2.clearRect(0, 0, off.width, off.height); o2.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    ctx = o2; drawDemo(f, D, { cam, noScene: true, noFx: true, still: true }); ctx = main;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = i === 6 ? 1 : 0.22 + 0.1 * i; ctx.drawImage(off, 0, 0); ctx.restore();
  });
}
/* the feet from above: the setup for the trick, in a small box (toe side down, nose toward the arrow) */
function drawFoot(x, y, ang, col, mirror) {   // a shoe from above, in board meters (toes toward the toe side, +y)
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang * DEG * mirror);
  ctx.fillStyle = col; ctx.globalAlpha = .9;
  ctx.beginPath(); ctx.ellipse(0, 0.0, 0.05, 0.135, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1; ctx.strokeStyle = shade(col, -0.45); ctx.lineWidth = 0.005; ctx.stroke();
  ctx.fillStyle = shade(col, -0.45); ctx.beginPath(); ctx.arc(0, 0.1, 0.012, 0, 7); ctx.fill();   // the toe end
  ctx.restore();
}
function drawFeetMap(t, cx, cy, sc, small) {
  const mir = S.stance === "goofy" ? -1 : 1;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc * mir, sc);
  const hl = 0.4, hw = 0.105;
  ctx.fillStyle = C.grip; ctx.beginPath(); ctx.moveTo(-hl + hw, -hw); ctx.lineTo(hl - hw, -hw); ctx.arc(hl - hw, 0, hw, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-hl + hw, hw); ctx.arc(-hl + hw, 0, hw, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.deck; ctx.lineWidth = 0.012; ctx.stroke();
  ctx.save(); ctx.globalAlpha = .35; ctx.strokeStyle = C.wheel; ctx.lineWidth = 0.004; [-0.29, 0.29].forEach(x => { ctx.beginPath(); ctx.moveTo(x, -hw); ctx.lineTo(x, hw); ctx.stroke(); }); ctx.restore();
  ctx.fillStyle = shade(C.truck, 0.2); [-0.18, 0.18].forEach(x => [-0.025, 0.025].forEach(dy => [-0.014, 0.014].forEach(dx => { ctx.beginPath(); ctx.arc(x + dx, dy, 0.006, 0, 7); ctx.fill(); })));
  const fF = t.feet.f, fB = t.feet.b;
  drawFoot(fB[0], fB[1], fB[2], C.pe, mir); drawFoot(fF[0], fF[1], fF[2], C.ke, mir);
  ctx.restore();
  (t.arrows || []).forEach(ar => {
    const X = x => cx + x * sc * mir, Y = y => cy + y * sc;
    if (ar.down) { ctx.save(); ctx.strokeStyle = C.force; ctx.lineWidth = small ? 2.5 : 4; ctx.beginPath(); ctx.arc(X(ar.from[0]), Y(ar.from[1]), small ? 11 : 22, 0, 7); ctx.stroke(); ctx.restore(); return; }
    arrow(X(ar.from[0]), Y(ar.from[1]), X(ar.to[0]), Y(ar.to[1]), C.force, small ? 3 : 5);
  });
  if (!small) {
    text(L("Toe side", "Lado de los dedos"), cx, cy + 0.105 * sc + 34, { a: "center", m: .85, c: C.soft });
    text(L("Heel side", "Lado de los talones"), cx, cy - 0.105 * sc - 18, { a: "center", m: .85, c: C.soft });
  }
  text(L("nose", "nariz") + (mir > 0 ? " →" : ""), cx + (0.4 * sc + 8) * mir, cy + FS * 0.3, { a: mir > 0 ? "left" : "right", m: .7, c: C.soft });
  if (mir < 0) text("← ", cx - 0.4 * sc - 8 - ctx.measureText(L("nose", "nariz")).width, cy + FS * 0.3, { a: "right", m: .7, c: C.soft });
}
let TR = null;
function curTrick() { return TRICKS.find(x => x.id === S.tricks.id) || TRICKS[0]; }
/* ── the 3D park (AOG-SKATE-3D-V1): three.js, loaded the first time someone picks 3D; it draws only when asked ── */
let G3 = null, G3state = "";   // "", "loading", "ready", "failed"
function want3D() { return S.room === "tricks" && S.tricks.view === "3d"; }
function load3D() {
  if (G3state) return;
  G3state = "loading";
  import("/aog-skate3d.js").then(m => {
    G3 = m.create({ host: $("stage"), before: cv, colors: () => C, BOARD, deckMid, path: () => demoPath().pts, at: q => at(demoPath(), q),
      dark: () => document.documentElement.getAttribute("data-theme") === "dark", onCam: k => { S.tricks.cam = k; save(); const sel = $("kCam"); if (sel) sel.value = k; } });
    G3.setCam(S.tricks.cam || "follow"); G3state = "ready"; paint();
  }).catch(err => { G3state = "failed"; console.warn("3D park:", err); paint(); });
}
function drawTricks(fr) {
  const t = curTrick(), D = DEMOS[t.id];
  if (want3D()) {
    if (G3state === "ready") {
      ctx.clearRect(0, 0, W, H); G3.show(true); G3.resize(sizedW, Math.round(sizedW * H / W)); G3.render(fr || P.frames[0], D);
    } else {
      if (!G3state) load3D();
      text(G3state === "failed" ? L("3D could not start on this device. Pick Moving to watch the trick.", "El 3D no pudo iniciar en este equipo. Elige En movimiento para ver el truco.") : L("Building the 3D park…", "Construyendo el parque en 3D…"), W / 2, H / 2, { a: "center", m: 1, w: 700, c: C.soft });
    }
  } else if (D && S.tricks.view === "seq") drawSequence(D, P.frames); else if (D) drawDemo(fr, D);
  // the setup from above, top right; the step, top left
  const bw = Math.min(W * 0.34, 300), sc = bw / 1.0, bx = W - bw / 2 - 18, by = 18 + 0.13 * sc + FS * 0.2;
  ctx.save(); ctx.fillStyle = alpha(C.card, 0.92); ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; roundRect(W - bw - 30, 8, bw + 22, 0.26 * sc + FS * 1.6, 12); ctx.fill(); ctx.stroke(); ctx.restore();
  text(L("Feet, from above", "Pies, desde arriba"), W - bw - 20, 8 + FS * 0.95, { m: .7, w: 700, c: C.soft });
  drawFeetMap(t, bx, by + FS * 0.75, sc * 0.82, true);
  const c = es() ? t.es : t.en;
  if (S.tricks.view === "seq") text(L("Sequence", "Secuencia"), 16, 34, { w: 700, m: 1.05, c: C.steel });
  else if (want3D() && fr) text(L("Step ", "Paso ") + (fr.step + 1) + L(" of ", " de ") + c.steps.length, 16, 34, { w: 700, m: 1.05, c: C.steel, bg: C.card });
  else if (fr) text(L("Step ", "Paso ") + (fr.step + 1) + L(" of ", " de ") + c.steps.length, 16, 34, { w: 700, m: 1.05, c: C.steel });
  else text(c.n, 16, 34, { w: 700, m: 1.05, c: C.steel });
}
function tricksOnFrame(fr) {
  if (!fr) return;
  document.querySelectorAll("#panel .tsteps li").forEach((li, i) => { const on = i === fr.step; if (li.classList.contains("on") !== on) li.classList.toggle("on", on); });
}
function nextUp() {
  return TRICKS.filter(t => prog(t.id) < 2 && t.pre.every(p => prog(p) >= 2)).slice(0, 3);
}
function tricksPanel() {
  const t = curTrick(), c = es() ? t.es : t.en, i = TRICKS.indexOf(t), p = prog(t.id);
  const groups = [1, 2, 3, 4, 5].map(lv => `<optgroup label="${esc(L(LV[lv][0], LV[lv][1]))}">${TRICKS.filter(x => x.lv === lv).map(x => `<option value="${x.id}" ${x.id === t.id ? "selected" : ""}>${["", "· ", "✓ ", "★ "][prog(x.id)]}${esc(es() ? x.es.n : x.en.n)}</option>`).join("")}</optgroup>`).join("");
  const ROOMN = { ramp: L("Ramp and energy", "Rampa y energía"), ollie: L("The ollie", "El ollie"), grind: L("Grinds and slides", "Grinds y slides"), balance: L("Balance and turning", "Equilibrio y giros"), flip: L("Flips and spins", "Flips y giros"), build: L("Build a board", "Arma una tabla") };
  const name = id => { const x = TRICKS.find(y => y.id === id); return x ? (es() ? x.es.n : x.en.n) : id; };
  const done = TRICKS.filter(x => prog(x.id) >= 3).length, landed = TRICKS.filter(x => prog(x.id) >= 2).length;
  const nu = nextUp();
  return `<p class="kicker">${L("Room 7 · How to", "Sala 7 · Cómo se hace")}</p>
  <h2>${L("Trick book", "Libro de trucos")}</h2>
  <div class="ctl"><label for="kT">${L("Pick a trick", "Elige un truco")}</label><select class="sel" id="kT">${groups}</select></div>
  <div class="ctl"><span class="lab">${L("Watch it", "Míralo")}</span><div class="seg"><button type="button" data-tv="move" aria-pressed="${S.tricks.view !== "seq"}">${L("Moving", "En movimiento")}</button><button type="button" data-tv="seq" aria-pressed="${S.tricks.view === "seq"}">${L("Sequence", "Secuencia")}</button><button type="button" data-tv="3d" aria-pressed="${S.tricks.view === "3d"}">3D</button></div></div>
  ${S.tricks.view === "3d" ? `<div class="ctl"><label for="kCam">${L("Camera", "Cámara")}</label><select class="sel" id="kCam">${[["follow", L("Filmer, rolling along", "Camarógrafo, rodando al lado")], ["fish", L("Fisheye, up close", "Ojo de pez, de cerca")], ["side", L("From the side", "De lado")], ["orbit", L("Walk around (drag the picture)", "Rodear (arrastra la imagen)")]].map(([k, l]) => `<option value="${k}" ${(S.tricks.cam || "follow") === k ? "selected" : ""}>${l}</option>`).join("")}</select><p class="hint">${L("Drag the picture sideways to walk around the rider.", "Arrastra la imagen de lado para rodear al patinador.")}</p></div>` : ""}
  <div class="ctl"><div class="seg"><button type="button" data-st="regular" aria-pressed="${S.stance === "regular"}">${L("Regular", "Regular")}</button><button type="button" data-st="goofy" aria-pressed="${S.stance === "goofy"}">Goofy</button></div></div>
  <h3>${esc(c.n)}</h3>
  <p><span class="tag">${esc(L(LV[t.lv][0], LV[t.lv][1]))}</span><span class="tag">${L("Helmet on", "Con casco")}</span>${t.lv >= 2 ? `<span class="tag">${L("Wrist guards and pads", "Muñequeras y protecciones")}</span>` : ""}</p>
  ${t.pre.length ? `<p class="hint">${L("Learn first", "Aprende primero")}: ${t.pre.map(id => `<button type="button" class="linkish" data-go-trick="${id}"><i class="pg s${prog(id)}"></i>${esc(name(id))}</button>`).join(", ")}</p>` : ""}
  <p class="say">${L("Press Go to watch it. ◀ ▶ step through it; each step lights up below.", "Pulsa Ir para verlo. ◀ ▶ avanza paso a paso; cada paso se ilumina abajo.")}</p>
  <ol class="tsteps">${c.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
  <h3>${L("If this happens, try this", "Si pasa esto, prueba esto")}</h3>
  <div class="fixes">${c.fixes.map(f => `<div><b>${esc(f[0])}</b>${esc(f[1])}</div>`).join("")}</div>
  <div class="note"><b>${L("The science", "La ciencia")}:</b> ${esc(c.sci)}</div>
  <div class="ctl"><span class="lab">${L("Where are you with it?", "¿Cómo vas con este?")}</span><div class="seg">${[1, 2, 3].map(k => `<button type="button" data-prog="${k}" aria-pressed="${p === k}"><i class="pg s${k}"></i>${L(STATUS[k][0], STATUS[k][1])}</button>`).join("")}</div>
   <p class="hint">${L("Saved on this device only.", "Se guarda solo en este dispositivo.")}${p ? ` <button type="button" class="linkish" data-prog="0">${L("Clear", "Borrar")}</button>` : ""}</p></div>
  <div class="row"><button type="button" class="btn" data-go="${t.room}">${L("Try the science in", "Prueba la ciencia en")}: ${ROOMN[t.room] || ""}</button></div>
  <div class="row" style="margin-top:.5rem"><button type="button" class="btn" id="kPrev" ${i ? "" : "disabled"}>◀ ${L("Previous", "Anterior")}</button><button type="button" class="btn" id="kNext" ${i < TRICKS.length - 1 ? "" : "disabled"}>${L("Next", "Siguiente")} ▶</button></div>
  <details class="more"><summary>${L("Your trick map", "Tu mapa de trucos")} · ${landed}/${TRICKS.length}</summary>
   <p class="hint"><i class="pg s1"></i>${L("learning", "aprendiendo")} · <i class="pg s2"></i>${L("landed it once", "lo logré una vez")} · <i class="pg s3"></i>${L("got it, 7 of 10 tries", "lo domino, 7 de 10 intentos")}</p>
   ${nu.length ? `<p><b>${L("Ready to learn next", "Listo para aprender")}:</b> ${nu.map(x => `<button type="button" class="linkish" data-go-trick="${x.id}">${esc(name(x.id))}</button>`).join(", ")}</p>` : ""}
   <div class="tmap">${[1, 2, 3, 4, 5].map(lv => `<div class="tlv"><b>${esc(L(LV[lv][0], LV[lv][1]))}</b><p>${TRICKS.filter(x => x.lv === lv).map(x => `<span class="tchip s${prog(x.id)}"><i class="pg s${prog(x.id)}"></i>${esc(name(x.id))}</span>`).join(" ")}</p></div>`).join("")}</div>
  </details>
  <p class="hint muted">${L("Learn in a smooth, safe place away from cars. Children ride with a grown-up nearby. Never hold on to a moving car or bike.", "Aprende en un lugar liso y seguro, lejos de los autos. Los niños patinan con un adulto cerca. Nunca te agarres de un auto o una bici en movimiento.")}</p>`;
}
function tricksWire() {
  const pick = id => { S.tricks.id = id; save(); tricksReset(); };
  $("kT").onchange = e => pick(e.target.value);
  document.querySelectorAll("#panel [data-tv]").forEach(b => b.onclick = () => { S.tricks.view = b.getAttribute("data-tv"); save(); panel(); paint(); });
  if ($("kCam")) $("kCam").onchange = e => { S.tricks.cam = e.target.value; save(); if (G3) G3.setCam(S.tricks.cam); paint(); };
  document.querySelectorAll("#panel [data-st]").forEach(b => b.onclick = () => { S.stance = b.getAttribute("data-st"); save(); panel(); paint(); });
  const i = TRICKS.indexOf(curTrick());
  $("kPrev").onclick = () => pick(TRICKS[Math.max(0, i - 1)].id);
  $("kNext").onclick = () => pick(TRICKS[Math.min(TRICKS.length - 1, i + 1)].id);
  document.querySelectorAll("#panel [data-go]").forEach(b => b.onclick = () => openRoom(b.getAttribute("data-go"), true));
  document.querySelectorAll("#panel [data-go-trick]").forEach(b => b.onclick = () => pick(b.getAttribute("data-go-trick")));
  document.querySelectorAll("#panel [data-prog]").forEach(b => b.onclick = () => { S.progress = S.progress || {}; S.progress[S.tricks.id] = +b.getAttribute("data-prog"); save(); panel(); paint(); });
}
function tricksReset(quiet) { TR = simDemo(curTrick().id); setRun(TR.frames, 1 / 60); if (!quiet) panel(); paint(); }

/* ══ ROOM 9 — questions (AOG-SKATE-FAQ-V1) ═════════════════════════════════════════════════════════════════
   Thirty plain answers: getting started, gear, safety, tricks, the skatepark, grown-ups, the science. Search and a topic
   menu; each answer can open the room or the trick it talks about. */
const FAQ = [{"id": "regular-or-goofy", "cat": "start", "room": "tricks", "trick": "stance", "en": {"q": "Am I regular or goofy?", "a": "Regular means your left foot goes in front. Goofy means your right foot goes in front. Both are normal, and neither one is better. To find yours, stand on the board on grass or carpet so it cannot roll. Try each foot in front. The one that feels steady and easy is your front foot. Still not sure? Try both for a few days. From here on, think front foot and back foot."}, "es": {"q": "¿Soy regular o goofy?", "a": "Regular quiere decir que el pie izquierdo va adelante. Goofy quiere decir que el pie derecho va adelante. Las dos formas son normales, y ninguna es mejor. Para saber cuál es la tuya, párate en la patineta sobre pasto o alfombra, así no rueda. Prueba con cada pie adelante. El que se siente firme y cómodo es tu pie de adelante. ¿Todavía no sabes? Prueba las dos formas unos días. Desde ahora, piensa en pie de adelante y pie de atrás."}}, {"id": "where-to-learn", "cat": "start", "room": "tricks", "trick": "push", "en": {"q": "Where should I learn to ride?", "a": "Pick a place that is smooth, flat, dry and away from cars. An empty basketball court, a quiet smooth path or the flat part of a skatepark all work. First, stand on the board on grass or carpet so it cannot roll far. Feel your balance there. Then roll slowly on smooth ground. A small pebble can stop a wheel suddenly, so look ahead and sweep the spot if you can. Children should have a grown-up nearby."}, "es": {"q": "¿Dónde aprendo a patinar?", "a": "Busca un lugar liso, plano, seco y lejos de los carros. Sirve una cancha de básquetbol vacía, un camino liso y tranquilo o la parte plana de un skatepark. Primero, párate en la patineta sobre pasto o alfombra, así no rueda lejos. Siente tu equilibrio ahí. Después, rueda despacio en un piso liso. Una piedrita puede frenar una rueda de golpe, así que mira hacia adelante y barre el lugar si puedes. Los niños deben tener a un adulto cerca."}}, {"id": "how-old", "cat": "start", "en": {"q": "How old is old enough to skate?", "a": "The American Academy of Pediatrics says children under 5 should not ride skateboards. At that age, balance and the skill of falling safely are still growing. It says children 6 to 10 should skate with an adult watching. Older kids, teens and adults can start at any age. Whatever your age, a helmet that fits and a smooth place away from cars come first."}, "es": {"q": "¿Desde qué edad se puede patinar?", "a": "La Academia Americana de Pediatría dice que los niños menores de 5 años no deben andar en patineta. A esa edad, el equilibrio y la habilidad de caer con cuidado todavía están creciendo. También dice que los niños de 6 a 10 años deben patinar con un adulto mirando. Los niños mayores, los jóvenes y los adultos pueden empezar a cualquier edad. Tengas la edad que tengas, primero va un casco que te quede bien y un lugar liso lejos de los carros."}}, {"id": "learn-first", "cat": "start", "room": "tricks", "trick": "stop", "en": {"q": "What should I learn first?", "a": "Learn these in order. First, stand still on the board on grass or carpet, with your front foot over the front bolts. Next, push: put your back foot on the ground, take small steps, then put it back on the board. Then learn to stop: lift your back foot and let its sole drag gently on the ground. Then turn by leaning toward your toes or your heels. Practice falling small early too. Tricks can wait until rolling feels calm."}, "es": {"q": "¿Qué aprendo primero?", "a": "Aprende esto en orden. Primero, párate quieto en la patineta sobre pasto o alfombra, con el pie de adelante sobre los tornillos de adelante. Después, empuja: pon el pie de atrás en el piso, da pasos cortos y vuelve a subirlo a la patineta. Luego aprende a frenar: baja el pie de atrás y deja que la suela roce suavemente el piso. Luego gira inclinándote hacia los dedos o hacia los talones. Practica también caer con cuidado desde el principio. Los trucos pueden esperar hasta que rodar se sienta tranquilo."}}, {"id": "first-board", "cat": "gear", "room": "build", "en": {"q": "What kind of board should I get first?", "a": "A complete, meaning a board that comes already put together, is a fine start. Many first decks are about 7.5 to 8.25 inches (19 to 21 cm) wide. Smaller riders often like the narrower ones. Most decks are made of seven thin layers of maple. Check that the wheels spin freely and the trucks turn when you lean. Toy boards with hard plastic wheels often slip and rattle. The Build a board room shows how the parts fit together."}, "es": {"q": "¿Qué patineta compro primero?", "a": "Una completa, o sea una patineta que ya viene armada, es un buen comienzo. Muchas tablas para empezar miden entre 7.5 y 8.25 pulgadas (de 19 a 21 cm) de ancho, más o menos. A los niños más pequeños muchas veces les gustan las más angostas. Casi todas las tablas tienen siete capas delgadas de maple. Revisa que las ruedas giren libres y que los trucks giren cuando te inclinas. Las patinetas de juguete con ruedas de plástico duro suelen resbalar y hacer ruido. La sala Arma una patineta muestra cómo se juntan las partes."}}, {"id": "soft-or-hard-wheels", "cat": "gear", "room": "build", "en": {"q": "Should I get soft wheels or hard wheels?", "a": "Wheel hardness is measured on the durometer A scale. Skateboard wheels go from about 78A, which is soft, to about 101A, which is hard. Soft wheels grip well, feel smooth and roll over rough ground and small cracks. They are good for sidewalks and cruising. Hard wheels slide more easily and feel fast on smooth skatepark concrete. For a first board on mixed ground, wheels on the softer side are often easier."}, "es": {"q": "¿Compro ruedas blandas o duras?", "a": "La dureza de las ruedas se mide en la escala de durómetro A. Las ruedas de patineta van de unos 78A, que son blandas, a unos 101A, que son duras. Las ruedas blandas agarran bien, se sienten suaves y pasan por piso áspero y grietas pequeñas. Son buenas para la banqueta y para pasear. Las ruedas duras se deslizan con más facilidad y se sienten rápidas en el concreto liso del skatepark. Para una primera patineta en pisos variados, las ruedas más blandas suelen ser más fáciles."}}, {"id": "truck-tightness", "cat": "gear", "room": "build", "en": {"q": "How tight should my trucks be?", "a": "The big nut in the middle of each truck, the kingpin nut, sets how easily the board turns. Looser trucks turn with a small lean but can feel wobbly. Tighter trucks feel steady but need a bigger lean to turn. Start in the middle. Turn the nut a quarter turn at a time, then ride and feel the change. Never loosen it so far that the nut barely holds on. Set both trucks about the same."}, "es": {"q": "¿Qué tan apretados deben estar los trucks?", "a": "La tuerca grande en el centro de cada truck, la tuerca del kingpin, decide qué tan fácil gira la patineta. Los trucks flojos giran con poca inclinación, pero se pueden sentir tambaleantes. Los trucks apretados se sienten firmes, pero necesitas inclinarte más para girar. Empieza en un punto medio. Gira la tuerca un cuarto de vuelta cada vez, luego rueda y siente el cambio. Nunca la aflojes tanto que la tuerca apenas se sostenga. Deja los dos trucks más o menos iguales."}}, {"id": "shoes", "cat": "gear", "en": {"q": "What shoes should I wear?", "a": "Wear sneakers with a flat rubber sole, such as canvas or suede ones. A flat sole lets you feel the board and grips the grip tape. Skip sandals, boots with thick heels and running shoes with big curved soles. Tie your laces well and tuck in the ends so they cannot catch. Ollies and flip tricks rub the top of your shoe, so that spot may wear out faster. That is normal."}, "es": {"q": "¿Qué zapatos uso?", "a": "Usa tenis con suela de hule plana, por ejemplo de lona o de gamuza. Una suela plana te deja sentir la patineta y se agarra bien a la lija. Evita las sandalias, las botas con tacón grueso y los tenis para correr con suela muy curva. Amarra bien las agujetas y mete las puntas para que no se atoren. Los ollies y los trucos de flip rozan la parte de arriba del zapato, así que esa parte se puede gastar más rápido. Eso es normal."}}, {"id": "replace-parts", "cat": "gear", "room": "build", "en": {"q": "When should I replace grip tape or bearings?", "a": "Replace grip tape when it feels smooth and your shoes slip, or when it peels up at the edges. Scrubbing it with a stiff brush can help first. Bearings need care when the wheels stop spinning quickly, grind, squeak or feel rough. Sometimes cleaning them fixes the problem. If they stay rough or rusty, replace them. The ABEC number on bearings tells how precisely they are made, not how fast they go."}, "es": {"q": "¿Cuándo cambio la lija o los baleros?", "a": "Cambia la lija cuando se sienta lisa y tus zapatos resbalen, o cuando se despegue en las orillas. Antes, tallarla con un cepillo duro puede ayudar. Los baleros necesitan cuidado cuando las ruedas dejan de girar pronto, raspan, rechinan o se sienten ásperas. A veces limpiarlos arregla el problema. Si siguen ásperos u oxidados, cámbialos. El número ABEC de los baleros dice qué tan precisos están hechos, no qué tan rápido van."}}, {"id": "helmet-fit", "cat": "safety", "en": {"q": "How should my helmet fit?", "a": "A good helmet sits level on your head and covers your forehead. It feels snug, not tight, and it does not rock when you shake your head. Always buckle the strap. About one finger should fit between the strap and your chin. Wear it every time, even for a short ride. Many helmets are made for one big hit, so replace yours after a hard crash, even if it looks fine. Look for a label saying it meets a safety standard."}, "es": {"q": "¿Cómo me debe quedar el casco?", "a": "Un buen casco queda derecho en la cabeza y te cubre la frente. Se siente ajustado, pero no apretado, y no se mueve cuando sacudes la cabeza. Siempre abrocha la correa. Debe caber más o menos un dedo entre la correa y tu barbilla. Úsalo cada vez, aunque sea un paseo corto. Muchos cascos están hechos para un solo golpe fuerte, así que cámbialo después de una caída dura, aunque se vea bien. Busca una etiqueta que diga que cumple una norma de seguridad."}}, {"id": "wrist-guards", "cat": "safety", "trick": "fall", "en": {"q": "Do I really need wrist guards?", "a": "They help a lot, especially while you learn. Wrist injuries are among the most common skateboarding injuries, because people reach out with their hands when they fall. Wrist guards have a stiff piece that helps protect the wrist when a hand hits the ground. Knee pads and elbow pads help too. Knee pads also let you slide safely down a ramp. Pads that fit snugly and stay in place work best."}, "es": {"q": "¿De verdad necesito muñequeras?", "a": "Ayudan mucho, sobre todo mientras aprendes. Las lesiones de muñeca están entre las más comunes al andar en patineta, porque al caer la gente estira las manos. Las muñequeras tienen una pieza firme que ayuda a proteger la muñeca cuando la mano pega en el piso. Las rodilleras y las coderas también ayudan. Con las rodilleras, además, puedes deslizarte con seguridad por una rampa. Las protecciones que quedan ajustadas y no se mueven funcionan mejor."}}, {"id": "how-to-fall", "cat": "safety", "room": "tricks", "trick": "fall", "en": {"q": "How do I fall without getting hurt?", "a": "Falling is part of learning, and you can practice it. When you feel a fall coming, crouch low so you have less distance to fall. Try not to catch yourself with straight, locked arms. Instead, let your body roll onto your side or shoulder. On a ramp, drop to your knee pads and slide down. Practice these moves slowly on grass first. Falling small is a skill, just like any trick."}, "es": {"q": "¿Cómo me caigo sin lastimarme?", "a": "Caerse es parte de aprender, y lo puedes practicar. Cuando sientas que te vas a caer, agáchate para tener menos distancia hasta el piso. Trata de no detenerte con los brazos estirados y rígidos. Mejor, deja que tu cuerpo ruede hacia un lado o sobre el hombro. En una rampa, cae sobre las rodilleras y deslízate hacia abajo. Practica estos movimientos despacio, primero en el pasto. Caer con cuidado es una habilidad, igual que cualquier truco."}}, {"id": "wet-ground", "cat": "safety", "en": {"q": "Can I skate when the ground is wet?", "a": "It is best not to. Wet urethane wheels lose their grip, so the board can slip out with no warning. Water also gets inside the bearings and makes them rust, so they spin rough or stop. A wooden deck can soak up water and get weaker. Wait until the ground is fully dry. If your board gets wet, dry it with a towel and let it air-dry before you ride again."}, "es": {"q": "¿Puedo patinar si el piso está mojado?", "a": "Mejor no. Las ruedas de uretano mojadas pierden agarre, y la patineta se puede resbalar sin aviso. El agua también entra a los baleros y los oxida, así que giran ásperos o se detienen. Una tabla de madera puede absorber agua y debilitarse. Espera a que el piso esté bien seco. Si tu patineta se moja, sécala con una toalla y déjala secar al aire antes de volver a usarla."}}, {"id": "near-cars", "cat": "safety", "en": {"q": "Is it okay to skate in the street or near cars?", "a": "No. Drivers may not see a skateboarder, and a board cannot stop quickly. Never skate in traffic, down hills where cars drive, or out of a driveway into the street. Never hold onto a car, bike or any moving vehicle to get pulled along. Choose a skatepark, an empty court or a smooth path away from cars. When you need to cross a street, step off, pick up your board and walk."}, "es": {"q": "¿Está bien patinar en la calle o cerca de los carros?", "a": "No. Los conductores pueden no ver a quien va en patineta, y una patineta no frena rápido. Nunca patines entre el tráfico, en bajadas por donde pasan carros ni saliendo de una cochera hacia la calle. Nunca te agarres de un carro, una bici ni ningún vehículo para que te jale. Escoge un skatepark, una cancha vacía o un camino liso lejos de los carros. Cuando tengas que cruzar una calle, bájate, levanta tu patineta y camina."}}, {"id": "ollie-time", "cat": "tricks", "room": "ollie", "trick": "ollie", "en": {"q": "How long does it take to learn an ollie?", "a": "It takes most people many practice days, often weeks, and sometimes longer. Everyone learns at a different pace, and that is fine. The ollie has several parts: snap the tail, slide the front foot up, jump and level the board. Practice standing still on grass or carpet first. Then try it while rolling slowly. Short practice on most days often works better than one long day. Every small hop is progress."}, "es": {"q": "¿Cuánto tiempo toma aprender el ollie?", "a": "A la mayoría le toma muchos días de práctica, muchas veces semanas, y a veces más. Cada persona aprende a su ritmo, y eso está bien. El ollie tiene varias partes: pegar con la cola, subir deslizando el pie de adelante, saltar y emparejar la patineta. Practica primero quieto sobre pasto o alfombra. Después pruébalo rodando despacio. Practicar un rato corto casi todos los días suele funcionar mejor que un solo día largo. Cada saltito pequeño es un avance."}}, {"id": "board-shoots-out", "cat": "tricks", "room": "ollie", "trick": "ollie", "en": {"q": "Why does my board roll away or shoot out in front of me?", "a": "Usually your weight is too far back. When you lean back, the board rolls forward without you. Keep your shoulders over the board and your knees bent. On an ollie, the board shoots out when your back foot pushes forward instead of straight down. It also happens when you jump backward. Snap the tail down, then jump straight up. Keep your shoulders facing the same way as the board."}, "es": {"q": "¿Por qué mi patineta se me va o sale disparada hacia adelante?", "a": "Casi siempre es porque tu peso está muy atrás. Cuando te echas para atrás, la patineta sigue rodando sin ti. Mantén los hombros sobre la patineta y las rodillas dobladas. En el ollie, la patineta sale disparada cuando el pie de atrás empuja hacia adelante en vez de hacia abajo. También pasa cuando saltas hacia atrás. Pega la cola hacia abajo y luego salta derecho hacia arriba. Mantén los hombros mirando hacia el mismo lado que la patineta."}}, {"id": "kickflip-or-heelflip", "cat": "tricks", "room": "flip", "trick": "kickflip", "en": {"q": "What is the difference between a kickflip and a heelflip?", "a": "Both start like an ollie, and the board spins one full turn under your feet. In a kickflip, the front foot slides up and flicks off the heel-side edge of the nose with the side of the toes. In a heelflip, the front foot flicks off the toe-side edge of the nose with the heel. So the two tricks spin in opposite directions. Learn a steady ollie before trying either one."}, "es": {"q": "¿Cuál es la diferencia entre un kickflip y un heelflip?", "a": "Los dos empiezan como un ollie, y la patineta da una vuelta completa debajo de tus pies. En el kickflip, el pie de adelante sube y golpea la orilla del lado de los talones de la nariz con el costado de los dedos. En el heelflip, el pie de adelante golpea la orilla del lado de los dedos de la nariz con el talón. Por eso los dos trucos giran en direcciones opuestas. Aprende un ollie firme antes de probar cualquiera de los dos."}}, {"id": "stairs-and-rails", "cat": "tricks", "room": "grind", "en": {"q": "When can I try stairs or rails?", "a": "Much later. Stairs and handrails come only after a long time of steady basics: rolling, turning, stopping, falling small and clean ollies. When you are ready to slide on something, start low. A painted curb, a low ledge or a low flat bar at a skatepark comes first. Go higher only in small steps, with a helmet and pads. Skating is not a race. Low tricks done well are real skating."}, "es": {"q": "¿Cuándo puedo probar escaleras o barandales?", "a": "Mucho después. Las escaleras y los barandales vienen solo después de mucho tiempo con lo básico firme: rodar, girar, frenar, caer con cuidado y hacer ollies limpios. Cuando estés listo para deslizarte en algo, empieza bajo. Primero va una orilla pintada, un borde bajo o un tubo bajo y plano en un skatepark. Sube de altura solo poco a poco, con casco y protecciones. Patinar no es una carrera. Los trucos bajos bien hechos también son patinar de verdad."}}, {"id": "feeling-scared", "cat": "tricks", "en": {"q": "I feel scared to try a trick. What can I do?", "a": "Feeling scared is normal. It is your body asking you to slow down and plan. Break the trick into smaller steps. Practice each step standing still on grass or carpet. Try a lower or slower version first. Wear your helmet and pads so a fall stays small. A friend or a grown-up nearby can help. It is fine to stop for the day and come back. Many experienced skaters still feel fear."}, "es": {"q": "Me da miedo probar un truco. ¿Qué puedo hacer?", "a": "Sentir miedo es normal. Es tu cuerpo pidiéndote que vayas más despacio y que planees. Divide el truco en pasos más pequeños. Practica cada paso quieto sobre pasto o alfombra. Prueba primero una versión más baja o más lenta. Usa casco y protecciones para que una caída sea pequeña. Un amigo o un adulto cerca puede ayudar. Está bien parar por hoy y volver otro día. Muchos patinadores con experiencia también sienten miedo."}}, {"id": "taking-turns", "cat": "park", "en": {"q": "How do I take turns at the skatepark?", "a": "Skateparks run on taking turns. Wait until the person before you finishes their run. Before you go, look around and make sure your path is clear. Keep your runs short when it is busy. Do not sit on ramps or ledges, and do not stand where people land. When your turn ends, roll out of the way. Watching others first helps you learn how people move through the park."}, "es": {"q": "¿Cómo tomo turnos en el skatepark?", "a": "En el skatepark todo funciona por turnos. Espera a que la persona antes que tú termine su recorrido. Antes de salir, mira alrededor y revisa que tu camino esté libre. Haz recorridos cortos cuando hay mucha gente. No te sientes en las rampas ni en los bordes, y no te pares donde la gente cae de un truco. Cuando termine tu turno, sal del camino rodando. Mirar a los demás primero te ayuda a aprender cómo se mueve la gente en el parque."}}, {"id": "look-before-drop-in", "cat": "park", "room": "ramp", "trick": "dropin", "en": {"q": "What should I check before I drop in?", "a": "Look at the whole ramp and the flat bottom first. Make sure no one is rolling toward you or standing where you will land. Set your tail on the coping and wait until the path is clear. Let others see that you are next. If two people start at once, one person waits. Learn to drop in on a small ramp first, with a helmet and pads."}, "es": {"q": "¿Qué reviso antes de hacer un drop in?", "a": "Primero mira toda la rampa y la parte plana de abajo. Revisa que nadie venga rodando hacia ti ni esté parado donde vas a llegar. Pon la cola de la patineta en el coping y espera hasta que el camino esté libre. Deja que los demás vean que sigues tú. Si dos personas salen al mismo tiempo, una espera. Aprende el drop in primero en una rampa pequeña, con casco y protecciones."}}, {"id": "what-is-a-snake", "cat": "park", "en": {"q": "What is a snake at the skatepark?", "a": "A snake is someone who cuts in and takes a turn that belongs to someone else. Cutting in can cause crashes and hard feelings. If you are not sure whose turn it is, wait and let the other person go. If you cut in by mistake, say sorry and roll out of the way. Most skaters are kind to beginners who wait their turn."}, "es": {"q": "¿Qué es un snake en el skatepark?", "a": "Un snake es alguien que se mete y toma un turno que le toca a otra persona. Meterse así puede causar choques y enojos. Si no sabes a quién le toca, espera y deja que la otra persona vaya primero. Si te metiste sin querer, pide perdón y sal del camino. La mayoría de los patinadores son amables con los principiantes que esperan su turno."}}, {"id": "busy-times", "cat": "park", "en": {"q": "When is the skatepark less busy?", "a": "Many skateparks are calmer early in the morning. They are often busier after school, in the evening and on weekends. Visit at a few different times and notice what feels best for you. If it is crowded, practice basics in a quiet flat corner, or come back another time. Some parks offer lessons or beginner times. A calmer park can make learning feel easier."}, "es": {"q": "¿Cuándo hay menos gente en el skatepark?", "a": "Muchos skateparks están más tranquilos temprano en la mañana. Suelen tener más gente después de la escuela, en la tarde-noche y los fines de semana. Ve a distintas horas y fíjate cuál se siente mejor para ti. Si hay mucha gente, practica lo básico en una esquina plana y tranquila, o regresa otro día. Algunos parques tienen clases u horarios para principiantes. Un parque más tranquilo puede hacer que aprender se sienta más fácil."}}, {"id": "too-late-to-start", "cat": "adults", "en": {"q": "Am I too old to start skating?", "a": "No. Many people start skateboarding as adults. You can learn to push, turn, stop and do tricks, one step at a time. Adults often bring helpful strengths, like patience, planning and knowing when to rest. Bodies can take longer to heal as we get older, so protection matters even more. Wear a helmet, wrist guards, knee pads and elbow pads. Start on flat ground and enjoy each new step."}, "es": {"q": "¿Ya estoy muy grande para empezar a patinar?", "a": "No. Mucha gente empieza a andar en patineta de adulta. Puedes aprender a empujar, girar, frenar y hacer trucos, paso a paso. Los adultos muchas veces traen fortalezas que ayudan, como la paciencia, la planeación y saber cuándo descansar. Con los años, el cuerpo puede tardar más en sanar, así que la protección importa todavía más. Usa casco, muñequeras, rodilleras y coderas. Empieza en piso plano y disfruta cada paso nuevo."}}, {"id": "adult-pace", "cat": "adults", "room": "balance", "en": {"q": "How should I pace my practice as an adult?", "a": "Warm up first with a few minutes of walking, gentle stretches and easy rolling. Shorter sessions a few times a week often work well. Stop while you still feel fresh, because tired legs make falls more likely. Hip pads or padded shorts can soften falls on your side. Learn one skill until it feels steady before adding the next. Rest days are part of getting better."}, "es": {"q": "¿Cómo organizo mi práctica siendo adulto?", "a": "Primero calienta unos minutos: camina, estírate con suavidad y rueda tranquilo. Varias sesiones cortas a la semana suelen funcionar bien. Para cuando todavía te sientas con energía, porque las piernas cansadas hacen más probables las caídas. Las protecciones de cadera o los shorts acolchados pueden suavizar las caídas de lado. Aprende una habilidad hasta que se sienta firme antes de pasar a la siguiente. Los días de descanso también son parte de mejorar."}}, {"id": "joining-sessions", "cat": "adults", "en": {"q": "How can I join a session or find other adult skaters?", "a": "Some cities have adult skate nights, lessons or meetups at local parks. Ask at a skate shop or check the park's notice board. At a session, say hello, watch for a bit and take turns. Nobody expects a beginner to be good, and most skaters remember starting out. You can practice in a quiet corner while others ride. Cheering for other people's tries is part of skate culture."}, "es": {"q": "¿Cómo me uno a una sesión o encuentro a otros adultos que patinan?", "a": "Algunas ciudades tienen noches de patineta para adultos, clases o reuniones en los parques. Pregunta en una tienda de patinetas o revisa el tablero de avisos del parque. En una sesión, saluda, observa un rato y toma turnos. Nadie espera que un principiante lo haga bien, y la mayoría de los patinadores recuerdan cuando empezaron. Puedes practicar en una esquina tranquila mientras otros patinan. Echarle porras a los intentos de los demás es parte de la cultura de la patineta."}}, {"id": "why-bend-knees", "cat": "science", "room": "balance", "en": {"q": "Why should I bend my knees?", "a": "Bent knees lower your center of mass, so you are harder to tip over. They also work like springs. When the board hits a bump or you land, your legs bend and slow your body over a longer time. Stopping over a longer time means a smaller force on your body. Straight, stiff legs send each bump straight into your joints. That is why skaters ride with soft, bent knees."}, "es": {"q": "¿Por qué debo doblar las rodillas?", "a": "Con las rodillas dobladas, tu centro de masa queda más bajo, así que es más difícil que te caigas. Las rodillas también funcionan como resortes. Cuando la patineta pega con un bache o cuando caes, tus piernas se doblan y frenan tu cuerpo en más tiempo. Frenar en más tiempo significa una fuerza más pequeña sobre tu cuerpo. Las piernas rectas y rígidas mandan cada golpe directo a tus articulaciones. Por eso se patina con las rodillas suaves y dobladas."}}, {"id": "why-lean-forward", "cat": "science", "room": "ramp", "trick": "dropin", "en": {"q": "Why do I lean forward when I drop in?", "a": "On a ramp, the board speeds up as it rolls down the slope. If your body stays back, the board rolls out from under you and you fall backward. Leaning forward keeps your center of mass over the board as it speeds up. Then your body and the board move together. Put weight on your front foot and press the front wheels down onto the ramp. Leaning in feels scary at first, but it is what keeps you up."}, "es": {"q": "¿Por qué me inclino hacia adelante en el drop in?", "a": "En una rampa, la patineta acelera mientras baja por la pendiente. Si tu cuerpo se queda atrás, la patineta se sale de debajo de ti y te caes hacia atrás. Inclinarte hacia adelante mantiene tu centro de masa sobre la patineta mientras acelera. Así tu cuerpo y la patineta se mueven juntos. Pon peso en el pie de adelante y empuja las ruedas de adelante contra la rampa. Inclinarte da miedo al principio, pero es lo que te mantiene arriba."}}, {"id": "skate-wax", "cat": "science", "room": "grind", "trick": "boardslide", "en": {"q": "What is skate wax for, and why does it help?", "a": "Skate wax is a hard wax rubbed thinly on the edge of a curb, ledge or box so trucks and boards slide. Sliding is slowed by kinetic friction: f = μN. Wax fills tiny bumps in the surface and lowers μ, the coefficient of friction. Less friction means you keep more speed. On level ground, slide distance is v²/(2μg), so halving μ doubles the distance. Use a thin layer, ask first at a park, and never wax stairs or walkways."}, "es": {"q": "¿Para qué sirve la cera de patineta y por qué ayuda?", "a": "La cera de patineta es una cera dura que se frota en capa delgada en la orilla de un bordillo, un borde o una caja para que los trucks y la tabla se deslicen. Lo que frena el deslizamiento es la fricción cinética: f = μN. La cera rellena bultitos de la superficie y baja μ, el coeficiente de fricción. Con menos fricción conservas más velocidad. En piso plano, la distancia de deslizamiento es v²/(2μg), así que si μ baja a la mitad, la distancia se duplica. Usa una capa delgada, pregunta primero en el parque y nunca encerices escaleras ni banquetas."}}, {"id": "bigger-wheels-cracks", "cat": "science", "room": "build", "en": {"q": "Why do bigger wheels roll over cracks more easily?", "a": "A bigger wheel meets a crack or pebble at a gentler angle. The edge of the bump pushes more upward on the wheel and less straight back against it. So the wheel climbs over instead of stopping. A small wheel hits the same bump more head-on, and the board can stop suddenly while you keep going. Softer wheels help too, because they squish around small bumps. That is why cruising boards often have big, soft wheels."}, "es": {"q": "¿Por qué las ruedas grandes pasan mejor por las grietas?", "a": "Una rueda grande choca con una grieta o una piedrita en un ángulo más suave. La orilla del bache empuja la rueda más hacia arriba y menos hacia atrás. Así la rueda se sube y pasa en vez de detenerse. Una rueda chica pega con el mismo bache más de frente, y la patineta se puede frenar de golpe mientras tú sigues hacia adelante. Las ruedas blandas también ayudan, porque se aplastan un poco alrededor de los bultitos. Por eso las patinetas para pasear suelen tener ruedas grandes y blandas."}}];
const FAQCAT = { start: ["Getting started", "Para empezar"], gear: ["Gear", "Equipo"], safety: ["Safety", "Seguridad"], tricks: ["Tricks", "Trucos"], park: ["At the skatepark", "En el skatepark"], adults: ["For grown-ups", "Para adultos"], science: ["The science", "La ciencia"] };
function drawFaq() {
  const sc = Math.min(W / 2.6, (H - 70) / 2.2), ox = W * 0.32, oy = H - 46;
  drawGround(oy, 0, W, 150);
  ctx.save(); ctx.translate(ox, oy); ctx.scale(sc, -sc); drawRider(0.25, { com: false, lean: 0.03, arms: 0.85 }); ctx.restore();
  // a big question mark on a card, and how many answers wait below
  const cx = W * 0.72, cy = H * 0.42, r = Math.min(W, H) * 0.2;
  ctx.fillStyle = C.card; ctx.strokeStyle = C.line; ctx.lineWidth = 2; roundRect(cx - r, cy - r, 2 * r, 2 * r, r * 0.3); ctx.fill(); ctx.stroke();
  text("?", cx, cy + r * 0.38, { a: "center", w: 800, m: r / FS * 1.3, c: C.steel });
  text(FAQ.length + " " + L("answers", "respuestas"), cx, cy + r + FS * 1.4, { a: "center", w: 700, m: .95, c: C.ink });
}
function faqPanel() {
  const q = (S.faq && S.faq.q) || "", cat = (S.faq && S.faq.cat) || "all", fold = x => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), ql = fold(q.trim());   // "rampa" finds "rampa", "dropin" finds "drop in"
  const items = FAQ.filter(f => (cat === "all" || f.cat === cat) && (!ql || fold(es() ? f.es.q + " " + f.es.a : f.en.q + " " + f.en.a).indexOf(ql) >= 0));
  const ROOMN = { build: L("Build a board", "Arma una tabla"), ramp: L("Ramp and energy", "Rampa y energía"), ollie: L("The ollie", "El ollie"), grind: L("Grinds and slides", "Grinds y slides"), balance: L("Balance and turning", "Equilibrio y giros"), flip: L("Flips and spins", "Flips y giros"), timeline: L("Boards through time", "Las tablas en el tiempo"), tricks: L("Trick book", "Libro de trucos") };
  const tname = id => { const x = TRICKS.find(y => y.id === id); return x ? (es() ? x.es.n : x.en.n) : id; };
  return `<p class="kicker">${L("Room 8 · Questions", "Sala 8 · Preguntas")}</p>
  <h2>${L("Questions skaters ask", "Preguntas de patinadores")}</h2>
  <div class="ctl"><label for="fqQ">${L("Search", "Buscar")}</label><input class="num" id="fqQ" type="search" value="${esc(q)}" autocomplete="off" style="width:100%" placeholder="${L("helmet, wheels, ollie…", "casco, ruedas, ollie…")}"></div>
  <div class="ctl"><label for="fqC">${L("Topic", "Tema")}</label><select class="sel" id="fqC"><option value="all">${L("Every topic", "Todos los temas")}</option>${Object.keys(FAQCAT).map(k => `<option value="${k}" ${cat === k ? "selected" : ""}>${esc(L(FAQCAT[k][0], FAQCAT[k][1]))}</option>`).join("")}</select></div>
  <p class="hint" aria-live="polite">${items.length} ${L(items.length === 1 ? "answer" : "answers", items.length === 1 ? "respuesta" : "respuestas")}</p>
  <div class="faq">${items.map(f => { const c = es() ? f.es : f.en; return `<details class="more qa"><summary>${esc(c.q)}</summary><p>${esc(c.a)}</p>${f.room || f.trick ? `<div class="row">${f.trick ? `<button type="button" class="btn" data-fq-trick="${f.trick}">${L("See the trick", "Ver el truco")}: ${esc(tname(f.trick))}</button>` : ""}${f.room && f.room !== "tricks" ? `<button type="button" class="btn" data-go="${f.room}">${L("Try it in", "Pruébalo en")}: ${ROOMN[f.room] || f.room}</button>` : ""}</div>` : ""}</details>`; }).join("") || `<p>${L("No answer matches yet. Try a shorter word.", "Ninguna respuesta coincide. Prueba una palabra más corta.")}</p>`}</div>`;
}
function faqWire() {
  S.faq = S.faq || { q: "", cat: "all" };
  const box = $("fqQ");
  box.oninput = e => { S.faq.q = e.target.value; save(); const pos = e.target.selectionStart; panel(); const nb = $("fqQ"); nb.focus(); try { nb.setSelectionRange(pos, pos); } catch (x) {} };
  $("fqC").onchange = e => { S.faq.cat = e.target.value; save(); panel(); };
  document.querySelectorAll("#panel [data-go]").forEach(b => b.onclick = () => openRoom(b.getAttribute("data-go"), true));
  document.querySelectorAll("#panel [data-fq-trick]").forEach(b => b.onclick = () => { S.tricks.id = b.getAttribute("data-fq-trick"); save(); openRoom("tricks", true); });
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
/* ── every part, pulled apart (AOG-SKATE-PARTS-V1): the board from the side, each layer lifted off the next, numbered to
   match the parts list under the picture ── */
function buildParts() {
  const o = S.build, b = boltFor(o.riser), rs = o.riser ? (o.riser < 5 ? "⅛″" : "¼″") : "";
  const P2 = [
    { id: "bolt", n: 8, en: "Mounting bolts and nuts", es: "Tornillos y tuercas", spec: b[1] + "″", why: L("Long enough to pass through the deck, riser and baseplate.", "Lo bastante largos para atravesar tabla, riser y base.") },
    { id: "grip", n: 1, en: "Grip tape", es: "Lija", spec: L("one sheet, about 9 × 33 in", "una hoja, unos 9 × 33 pulg"), why: L("Rough like sandpaper, so your shoes hold on.", "Áspera como lija, para que tus zapatos se agarren.") },
    { id: "deck", n: 1, en: "Deck", es: "Tabla", spec: inch(o.deck) + (o.type === "cruiser" ? L(", cruiser", ", cruiser") : L(", 7-ply maple", ", arce de 7 capas")), why: L("The board you stand on.", "La tabla donde te paras.") }
  ];
  if (o.riser) P2.push({ id: "riser", n: 2, en: "Riser pads", es: "Risers", spec: rs, why: L("Lift the deck away from the wheels.", "Separan la tabla de las ruedas.") });
  P2.push(
    { id: "base", n: 2, en: "Baseplates", es: "Bases", spec: L("part of each truck", "parte de cada eje"), why: L("Bolt to the deck. The kingpin stands up from it.", "Se atornillan a la tabla. De ella sale el kingpin.") },
    { id: "bush", n: 4, en: "Bushings, on the kingpin", es: "Gomas, en el kingpin", spec: L(BUSH[o.bush].en, BUSH[o.bush].es), why: L("Rubber cushions. Softer ones let the board lean and turn more.", "Cojines de goma. Las más blandas dejan inclinar y girar más.") },
    { id: "hanger", n: 2, en: "Hangers with axles", es: "Colgantes con eje", spec: L("axle ", "eje ") + inch(o.axle), why: L("Hold the wheels. Match the axle to the deck's width.", "Sostienen las ruedas. El eje igual al ancho de la tabla.") },
    { id: "bear", n: 8, en: "Bearings, size 608, with 4 spacers", es: "Rodamientos 608, con 4 separadores", spec: L("2 in each wheel", "2 en cada rueda"), why: L("Let the wheels spin.", "Dejan girar las ruedas.") },
    { id: "wheel", n: 4, en: "Wheels", es: "Ruedas", spec: o.wheel + " mm, " + o.duro + "A", why: o.duro <= 92 ? L("Soft: smooth over cracks.", "Blandas: suaves sobre grietas.") : L("Hard: fast and slidey on smooth ground.", "Duras: rápidas en suelo liso.") },
    { id: "nut", n: 4, en: "Axle nuts, with 8 speed washers", es: "Tuercas del eje, con 8 arandelas", spec: L("come with the trucks", "vienen con los ejes"), why: L("Hold each wheel on. Snug, so the wheel still spins.", "Sujetan cada rueda. Firmes, pero que la rueda gire.") }
  );
  return P2;
}
function drawParts() {
  const o = S.build, parts = buildParts(), num1 = id => parts.findIndex(p => p.id === id) + 1;
  const len = (o.type === "cruiser" ? 30 : 31.5) * 25.4, wb = 14.25 * 25.4 / 2, hl = len / 2, bolt = boltFor(o.riser)[0] * 25.4;
  const top = FS * 1.9, gapPx = Math.max(10, FS * 0.42), sc = (W - FS * 3.2) / (len + 40);
  const hw0 = [["bolt", bolt + 8], ["riser", o.riser ? Math.max(o.riser, 5) : 0], ["base", 14], ["bush", 30], ["hanger", 34], ["bear", 22], ["wheel", o.wheel], ["nut", 13]].filter(r => r[1] > 0);
  const hwTot = hw0.reduce((s, r) => s + r[1], 0), nRows = hw0.length + 2;
  const k = clamp((H - top - 16 - gapPx * (nRows - 1) - 62 * sc) / (hwTot * sc), 1, 2.2), hs = sc * k;   // the small parts are drawn bigger
  const rows = [hw0[0], ["grip", 4 / k], ["deck", 58 / k]].concat(hw0.slice(1)).map(r => [r[0], r[1] * k]);
  const tot = rows.reduce((s, r) => s + r[1], 0) * sc;
  const gap = clamp((H - top - 16 - tot) / (rows.length - 1), gapPx, FS * 2.4);   // spread the layers to fill the picture
  const cx = W / 2 + FS * 0.7, X = x => cx + x * sc;
  text(k > 1.15 ? L("Every part, pulled apart. Small parts drawn bigger.", "Cada pieza, separada. Las pequeñas, más grandes.") : L("Every part, pulled apart", "Cada pieza, separada"), 16, FS * 1.15, { w: 700, m: .85, c: C.soft });
  let y = top; const Y = {};
  y = top + Math.max(0, (H - top - 16 - tot - gap * (rows.length - 1)) / 2);
  rows.forEach(r => { Y[r[0]] = [y, y + r[1] * sc]; y += r[1] * sc + gap; });
  const ym = id => (Y[id][0] + Y[id][1]) / 2;
  // the dashed lines the parts slide along, through each truck's middle
  ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = alpha(C.ink, 0.25); ctx.lineWidth = 1.5;
  [-wb, wb].forEach(x => { ctx.beginPath(); ctx.moveTo(X(x), Y.bolt[0]); ctx.lineTo(X(x), Y.nut[1]); ctx.stroke(); });
  ctx.restore();
  const line = (pts, fill, stroke) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } };
  // the deck's top line: flat between the trucks, kicking up at the nose and tail
  const kick = 48, flat = hl - 150, prof = x => { const a = Math.abs(x); return a <= flat ? 0 : kick * Math.pow((a - flat) / 150, 1.6); };
  const curve = (y0, th) => { const up = [], dn = []; for (let x = -hl; x <= hl + 0.1; x += 10) { up.push([X(x), y0 - prof(x) * sc]); dn.unshift([X(x), y0 - prof(x) * sc + th * sc]); } return up.concat(dn); };
  const dY = Y.deck[1] - 11 * sc;
  line(curve(dY, 11), C.deck, shade(C.deck, -0.4));
  ctx.strokeStyle = alpha(shade(C.deck, 0.4), 0.6); ctx.lineWidth = 1; for (let k = 1; k < 4; k++) { const ply = curve(dY + k * 2.75 * sc, 0).slice(0, Math.floor(len / 10) + 1); ctx.beginPath(); ply.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }
  line(curve(Y.grip[1] - Math.max(2 * sc, 4), Math.max(2, 4 / sc)), C.grip, alpha(C.ink, 0.35));
  const XT = (tx, d) => X(tx) + d * hs;
  [-wb, wb].forEach(tx => {
    // bolts: two of the four show from the side
    [-27, 27].forEach(d => { const x = XT(tx, d); ctx.fillStyle = C.truck; ctx.fillRect(x - 2.5 * hs, Y.bolt[0] + 4 * hs, 5 * hs, bolt * hs); ctx.fillStyle = shade(C.truck, -0.25); ctx.fillRect(x - 6 * hs, Y.bolt[0], 12 * hs, 4.5 * hs);
      ctx.strokeStyle = alpha(C.ink, 0.25); ctx.lineWidth = 1; for (let t = 8; t < bolt; t += 4) { ctx.beginPath(); ctx.moveTo(x - 2.5 * hs, Y.bolt[0] + (4 + t) * hs); ctx.lineTo(x + 2.5 * hs, Y.bolt[0] + (5.5 + t) * hs); ctx.stroke(); } });
    if (Y.riser) { ctx.fillStyle = shade(C.soft, 0.2); ctx.strokeStyle = shade(C.soft, -0.3); ctx.lineWidth = 1.5; roundRect(XT(tx, -34), Y.riser[0], 68 * hs, Y.riser[1] - Y.riser[0], 2); ctx.fill(); ctx.stroke(); }
    // baseplate with the kingpin standing up out of it, tipped toward the middle of the board
    const s = tx < 0 ? 1 : -1, b0 = Y.base[0], b1 = Y.base[1];
    line([[XT(tx, -36), b0], [XT(tx, 36), b0], [XT(tx, 30), b1], [XT(tx, -30), b1]], C.truck, shade(C.truck, -0.4));
    const kp0 = [X(tx), b1], kp1 = [XT(tx, s * 14), Y.bush[1] + 4 * hs];
    ctx.strokeStyle = shade(C.truck, -0.3); ctx.lineWidth = 4 * hs; ctx.beginPath(); ctx.moveTo(kp0[0], kp0[1]); ctx.lineTo(kp1[0], kp1[1]); ctx.stroke();
    // two bushings on the kingpin, softer ones a lighter color
    const bc = o.bush === "soft" ? shade(C.ke, 0.35) : o.bush === "med" ? C.ke : shade(C.ke, -0.3);
    [0.27, 0.73].forEach(f => { const x = lerp(kp0[0], kp1[0], f), yy = lerp(Y.bush[0], Y.bush[1], f); ctx.fillStyle = bc; ctx.strokeStyle = shade(bc, -0.4); ctx.lineWidth = 1.5; roundRect(x - 12 * hs, yy - 6.5 * hs, 24 * hs, 13 * hs, 4 * hs); ctx.fill(); ctx.stroke(); });
    // the hanger, seen from the side, with the axle end on
    const h0 = Y.hanger[0], h1 = Y.hanger[1];
    line([[XT(tx, -26), h0], [XT(tx, 26), h0], [XT(tx, 9), h1], [XT(tx, -9), h1]], C.truck, shade(C.truck, -0.4));
    ctx.fillStyle = shade(C.truck, -0.45); ctx.beginPath(); ctx.arc(X(tx), h1 - 5 * hs, 4 * hs, 0, 7); ctx.fill();
    // a bearing (the shield and the hole for the axle)
    const br = ym("bear"); ctx.fillStyle = shade(C.truck, 0.15); ctx.strokeStyle = shade(C.truck, -0.4); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(tx), br, 11 * hs, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(tx), br, 4 * hs, 0, 7); ctx.fill();
    ctx.strokeStyle = alpha(C.ink, 0.35); ctx.beginPath(); ctx.arc(X(tx), br, 7.5 * hs, 0, 7); ctx.stroke();
    drawWheel(X(tx), ym("wheel"), o.wheel / 2 * hs);
    // the axle nut
    const ny = ym("nut"); ctx.fillStyle = shade(C.truck, -0.1); ctx.strokeStyle = shade(C.truck, -0.5); ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; const px = X(tx) + Math.cos(a) * 6.5 * hs, py = ny + Math.sin(a) * 6.5 * hs; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  // the numbers, at the left, matching the list
  const badge = (id, yy) => { const k = num1(id); if (!k) return; const r = FS * 0.5, x = X(-hl) - FS * 0.95;
    ctx.fillStyle = C.steel; ctx.beginPath(); ctx.arc(x, yy, r, 0, 7); ctx.fill();
    text(String(k), x, yy + r * 0.38, { a: "center", m: .62, w: 700, c: C.steelFg || "#fff" });
    ctx.strokeStyle = alpha(C.steel, 0.5); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + r, yy); ctx.lineTo(X(-wb) - 40 * hs, yy); ctx.stroke(); };
  badge("bolt", Y.bolt[0] + 6 * hs); badge("grip", Y.grip[1] - 1); badge("deck", dY + 5 * sc);
  ["riser", "base", "bush", "hanger", "bear", "wheel", "nut"].forEach(id => { if (Y[id]) badge(id, ym(id)); });
}
function partsList() {
  const parts = buildParts();
  return `<div id="partsList" class="parts">
    <h3>${L("Parts list", "Lista de piezas")}</h3>
    <ol>${parts.map(p => `<li><b>${esc(L(p.en, p.es))}</b> <span class="pq">× ${p.n}</span> · ${esc(p.spec)}<br><span class="muted">${esc(p.why)}</span></li>`).join("")}</ol>
    <p class="hint">${L("Trucks come as a pair, with the baseplates, kingpins, bushings, hangers and nuts. Wheels come as a set of 4.", "Los ejes vienen en pareja, con bases, kingpins, gomas, colgantes y tuercas. Las ruedas vienen en juegos de 4.")}</p>
    <div class="row no-print"><button type="button" class="btn" id="bdPrint">${L("Print this list", "Imprimir esta lista")}</button></div>
  </div>`;
}
function drawBuild() {
  if (S.build.view === "parts") { drawParts(); return; }
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
  if (o.view === "parts") return partsList();
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
  <div class="ctl"><span class="lab">${L("Picture", "Imagen")}</span><div class="seg">${seg("view", "fit", L("Fit check", "Comprobar"))}${seg("view", "parts", L("Every part", "Cada pieza"))}</div></div>
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
  if (!buildWire.print) { buildWire.print = true; document.addEventListener("click", e => { if (e.target && e.target.id === "bdPrint") { document.body.classList.add("print-parts"); window.print(); } }); window.addEventListener("afterprint", () => document.body.classList.remove("print-parts")); }
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
    desc: () => S.build.view === "parts" ? L("A skateboard from the side, every part pulled apart and numbered to match the parts list. ", "Una patineta de lado, cada pieza separada y numerada como en la lista de piezas. ") : L("A skateboard from the front, leaning all the way over its wheels, and from above. ", "Una patineta de frente, inclinada al máximo sobre sus ruedas, y desde arriba. ") },
  tricks: { en: "Trick book", es: "Libro de trucos", player: true, run: () => tricksReset(true), reset: tricksReset, draw: () => drawTricks(P.frames[P.k]), under: () => "", panel: tricksPanel, wire: tricksWire, onFrame: tricksOnFrame,
    desc: () => L("A skater showing the trick, step by step, with a small map of where each foot goes. ", "Un patinador muestra el truco paso a paso, con un mapa pequeño de dónde va cada pie. ") + (es() ? curTrick().es.n : curTrick().en.n) + ". " },
  questions: { en: "Questions", es: "Preguntas", player: false, run: () => {}, reset: () => { setRun([], 1); panel(); paint(); }, draw: drawFaq, under: () => "", panel: faqPanel, wire: faqWire,
    desc: () => L("A skater beside a question mark. The answers are below. ", "Un patinador junto a un signo de pregunta. Las respuestas están abajo. ") }
};
const ORDER = ["build", "ramp", "ollie", "grind", "balance", "flip", "timeline", "tricks", "questions"];   // AOG-SKATE-BUILD-HOME-V1: Build a board first
function panel() { const r = ROOMS[S.room]; $("panel").innerHTML = r.panel(); r.wire(); paintPlayer(); $("under").innerHTML = r.under(); if (r.onFrame) r.onFrame(P.frames[P.k]); }
function paint(fast) {
  if (fit()) colors();
  clear(); if (G3 && !want3D()) G3.show(false); ROOMS[S.room].draw();
  $("under").innerHTML = ROOMS[S.room].under();
  const sc = $("scrub"); if (sc) { sc.max = Math.max(0, P.frames.length - 1); sc.value = P.k; }
  const tr = $("tRead"); if (tr) tr.textContent = num(P.k * P.dt, 2) + " s";
  if (!fast) { paintPlayer(); const fr = P.frames[P.k]; $("cvDesc").textContent = ROOMS[S.room].desc() + (fr && fr.v != null ? L("Speed ", "Rapidez ") + num(fr.v, 1) + " m/s." : ""); }
  // the result notes in the panel appear when a run reaches its end
  if (!fast && P.ran && P.k >= P.frames.length - 1 && ROOMS[S.room].player && !P._shown) { P._shown = true; panel(); P._shown = false; }
  if (ROOMS[S.room].onFrame) ROOMS[S.room].onFrame(P.frames[P.k]);
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
new MutationObserver(() => { colors(); if (G3) G3.colors(); paint(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
window.addEventListener("resize", () => { if (fit()) { colors(); paint(); } });
window.addEventListener("hashchange", () => { const k = location.hash.slice(1); if (ROOMS[k] && k !== S.room) openRoom(k, false); });
cv.addEventListener("pointerdown", e => { if (G3 && want3D()) G3.onDown(e); });
cv.addEventListener("pointermove", e => { if (G3 && want3D() && G3.onMove(e)) { drawTricksOverlayOnly(); } });
["pointerup", "pointercancel", "pointerleave"].forEach(k => cv.addEventListener(k, () => { if (G3) G3.onUp(); }));
function drawTricksOverlayOnly() { paint(true); }
/* for the site's checks (tools/check-skate.js) */
window.AOGSkate = { suggestBoard, boardCheck, boltFor, simRamp, simGrind, simOllie, simFlip, simSpin, balanceCalc, standCalc, rooms: ORDER, open: k => openRoom(k, true), state: S, P, go, TRICKS, ERAS, DEMOS, simDemo, FAQ, G3: () => G3, G3state: () => G3state, trick: id => { S.tricks.id = id; save(); if (S.room === "tricks") tricksReset(); else openRoom("tricks", true); } };
words();
/* AOG-SKATE-BUILD-HOME-V1 (2026-10-11) — Jimmy: "Make build a board a main stay for this page." /skate always opens on
   Build a board; an address that names a room (/skate#ollie, a lesson's link) still opens that room. */
const start = location.hash.slice(1);
openRoom(ROOMS[start] ? start : "build", !!ROOMS[start]);
})();
