/* The Sewing Room (AOG-SEWING-ROOM-V1, 2026-10-12) — sewing.html, /sewing-lab
   Jimmy: "Could we not take this amazement to FACS for cooking and sewing lessons? … demonstration on how to sew etc."
   Part 1, the engine (no library): every move in aog-sewing-moves.js becomes a timeline. Each step of the move owns one
   stretch of time. sample(timeline, t) rebuilds the whole scene at time t from nothing, so ◀ ▶, the slider and Go all show
   exactly the same thing, and nothing depends on what happened before.
     · Hand stitches: the needle runs along one smooth path (its "track"). The thread is not drawn separately: wherever the
       needle's eye has passed through the cloth, the thread passes through too, and it stays there, stitch by stitch.
       Between the cloth and the eye the thread is pulled taut around the cloth, never through it.
     · The machine: the handwheel's angle drives the needle bar, the take-up lever and the feed dogs. A stitch forms only
       where the needle goes down through the fabric (top thread red on top, bobbin thread blue underneath).
   Part 2, the page: the move menu, the steps (the current one lit), Go (plays once), ◀ ▶, the slider, speed, the camera
   menu, "Show the back of the fabric", the practice tracker (kept on this device) and the 3D room (aog-sewing3d.js,
   loaded after the words show). Calm: nothing moves until Go or ▶; with "reduce motion" each step shows its end at once. */
(function () {
"use strict";
const WORDS = window.AOGSewingWords;
const DEG = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const ease = u => u * u * (3 - 2 * u);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const len = a => Math.hypot(a[0], a[1], a[2]);
const nrm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };

/* ═════════════ the work in the hand (units: meters; x along the seam, z across it, y out of the front) ═════════════ */
const LT = 0.0009, T = 2 * LT;          // one layer of cotton (drawn a little thick so it reads), two layers
const CL = 0.00052;                      // the thread's center sits this far off the cloth (thread radius 0.45 mm)
const NL = 0.034;                        // the hand needle's length
const FX = 0.08, EDGE = -0.05, FZ = 0.05; // the sample: x in [-FX, FX], z in [EDGE, FZ]; the top edge is at z = EDGE
const BH = 0.0026, PIN = 0.002;          // button thickness; the toothpick that makes the shank
function surf(x, z) {                     // the cloth is not flat: it cups softly over the fingers and droops at the far side
  let y = 0.34 * x * x + 0.2 * z * z;
  if (z > 0.028) y -= 1.6 * (z - 0.028) * (z - 0.028) + 0.0006 * Math.sin(x * 70) * smooth(0.028, 0.05, z);
  return y;
}
function topOf(x, z, kind) { return kind === "hem" ? LT + LT * smooth(-0.0006, 0.0006, z) : T; }

/* ── a node of the thread's route: where it is and which side of the cloth ──
   F front · B back · I between the layers · IF inside the hem's fold · E around the top edge · BT over a button
   U, W a point in the air (through a shank's loop, wrapped round a thread shank) · K a knot · cut the end of a thread */
function nodePt(n, st) {
  const k = st.work.kind;
  let y;
  switch (n.L) {
    case "F": y = topOf(n.x, n.z, k) + CL; break;
    case "B": y = -CL; break;
    case "I": y = LT; break;
    case "IF": y = 1.5 * LT; break;
    case "E": return [n.x, surf(n.x, n.z) + T / 2, n.z - CL * 1.25];
    case "BT": { const b = st.btn[n.b]; y = b.y + BH + CL + PIN; break; }
    case "U": case "W": y = n.y; break;
    case "K": { const kp = knotPos(n, st); return kp; }
    default: y = 0;
  }
  return [n.x, y + surf(n.x, n.z), n.z];
}
function knotPos(n, st) {
  const pin = n.L === "K" && n.inside ? [n.x, 1.5 * LT + surf(n.x, n.z), n.z] : [n.x, -CL * 1.6 + surf(n.x, n.z), n.z];
  if (!n.hang) return pin;
  const u = clamp((st.sEye - n.pinS) / 0.022, 0, 1);
  return mix(n.hang, pin, ease(u));
}
const CLOTH = { F: 1, B: 1, I: 1, IF: 1 };
const LEGGY = { F: 1, B: 1, I: 1, IF: 1, BT: 1 };
/* the route as polylines (one per thread; a "cut" ends one) */
function routeLines(nodes, st) {
  const lines = []; let cur = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.L === "cut") { if (cur.length) lines.push(cur); cur = []; continue; }
    const p = nodePt(n, st);
    cur.push(p);
    const m = nodes[i + 1];
    if (m && m.L === n.L && LEGGY[n.L]) {                 // a leg on one side: follow the cloth's curve
      const d = Math.hypot(m.x - n.x, m.z - n.z), k = Math.floor(d / 0.0015);
      for (let j = 1; j < k; j++) { const u = j / k; cur.push(nodePt({ L: n.L, x: lerp(n.x, m.x, u), z: lerp(n.z, m.z, u), b: n.b }, st)); }
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
}
/* where a point is: "a" above the cloth, "b" below it, "in" inside it, "o" off the cloth (past an edge) */
function region(p, kind) {
  const x = p[0], z = p[2];
  if (x < -FX || x > FX || z < EDGE || z > FZ) return "o";
  const y = p[1] - surf(x, z);
  if (y > topOf(x, z, kind) + 1e-5) return "a";
  if (y < -1e-5) return "b";
  return "in";
}
function clear(a, b, kind) {
  const n = Math.max(2, Math.ceil(len(sub(b, a)) / 0.0012));
  let last = region(a, kind);
  for (let i = 1; i <= n; i++) {
    const r = region(mix(a, b, i / n), kind);
    if (r === "in") return false;
    if ((last === "a" && r === "b") || (last === "b" && r === "a")) return false;
    last = r;
  }
  return true;
}
/* the thread between the cloth and the eye, pulled taut: it follows the needle's path but cuts every corner it can
   without ever passing through the cloth (string pulling) */
function taut(p0, pts, kind) {
  const out = [p0]; let cur = p0, i = 0;
  while (i < pts.length) {
    let j = pts.length - 1;
    while (j > i && !clear(cur, pts[j], kind)) j--;
    cur = pts[j]; out.push(cur); i = j + 1;
  }
  return out;
}

/* ── a smooth path through control points (centripetal Catmull–Rom), sampled every `step` meters ── */
function spline(ctrl, step) {
  const pts = [], s = [], at = [];
  const P = i => ctrl[clamp(i, 0, ctrl.length - 1)];
  let acc = 0;
  for (let i = 0; i < ctrl.length - 1; i++) {
    let p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    if (i === 0) p0 = sub(mul(p1, 2), p2);
    if (i === ctrl.length - 2) p3 = sub(mul(p2, 2), p1);
    const tj = (a, b) => Math.pow(Math.max(len(sub(b, a)), 1e-7), 0.5);
    const t0 = 0, t1 = t0 + tj(p0, p1), t2 = t1 + tj(p1, p2), t3 = t2 + tj(p2, p3);
    const n = Math.max(2, Math.ceil(len(sub(p2, p1)) / step));
    for (let k = 0; k < n; k++) {
      const t = lerp(t1, t2, k / n);
      const A1 = add(mul(p0, (t1 - t) / (t1 - t0)), mul(p1, (t - t0) / (t1 - t0)));
      const A2 = add(mul(p1, (t2 - t) / (t2 - t1)), mul(p2, (t - t1) / (t2 - t1)));
      const A3 = add(mul(p2, (t3 - t) / (t3 - t2)), mul(p3, (t - t2) / (t3 - t2)));
      const B1 = add(mul(A1, (t2 - t) / (t2 - t0)), mul(A2, (t - t0) / (t2 - t0)));
      const B2 = add(mul(A2, (t3 - t) / (t3 - t1)), mul(A3, (t - t1) / (t3 - t1)));
      const C = add(mul(B1, (t2 - t) / (t2 - t1)), mul(B2, (t - t1) / (t2 - t1)));
      if (k === 0) at[i] = pts.length;
      if (pts.length) acc += len(sub(C, pts[pts.length - 1]));
      pts.push(C); s.push(acc);
    }
  }
  const last = ctrl[ctrl.length - 1];
  acc += len(sub(last, pts[pts.length - 1])); at[ctrl.length - 1] = pts.length; pts.push(last); s.push(acc);
  return { pts, s, cs: at.map(i => s[i]) };
}
function pathAt(sp, s) {
  const S = sp.s, n = S.length;
  if (s <= 0) return sp.pts[0].slice();
  if (s >= S[n - 1]) return sp.pts[n - 1].slice();
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m] <= s) lo = m; else hi = m; }
  return mix(sp.pts[lo], sp.pts[hi], (s - S[lo]) / ((S[hi] - S[lo]) || 1));
}
function pathPart(sp, s0, s1, step) {
  const out = [], n = Math.max(1, Math.ceil((s1 - s0) / step));
  for (let i = 0; i <= n; i++) out.push(pathAt(sp, lerp(s0, s1, i / n)));
  return out;
}

/* ── a timeline: segments, each owned by one step; sample() replays them ── */
function TL(id, station, init) {
  return { id, station, segs: [], t: 0, init, derive: null,
    add(step, d, fn) { const s = { step, t0: this.t, t1: this.t + d, fn: fn || null }; this.segs.push(s); this.t += d; return s; },
    par(step, d, fn) { const L = this.segs[this.segs.length - 1], s = { step, t0: L.t0, t1: L.t0 + d, fn }; this.segs.push(s); this.t = Math.max(this.t, s.t1); return s; } };
}
function finish(tl, nSteps) {
  tl.dur = tl.t;
  tl.steps = [];
  for (let k = 0; k < nSteps; k++) {
    const ss = tl.segs.filter(s => s.step === k);
    tl.steps.push(ss.length ? [Math.min(...ss.map(s => s.t0)), Math.max(...ss.map(s => s.t1))] : null);
  }
  return tl;
}
function sample(tl, t) {
  const st = tl.init();
  st.t = t; st.step = 0; st.station = tl.station; st.id = tl.id;
  for (const s of tl.segs) {
    if (s.t0 > t + 1e-9) continue;
    const u = s.t1 > s.t0 ? clamp((t - s.t0) / (s.t1 - s.t0), 0, 1) : 1;
    if (s.fn) s.fn(st, ease(u), u);
  }
  for (let k = 0; k < tl.steps.length; k++) if (tl.steps[k] && tl.steps[k][0] <= t + 1e-9) st.step = k;
  if (tl.derive) tl.derive(st);
  return st;
}

/* ═════════════ hand sewing ═════════════ */
function workInit(kind, extra) {
  return () => Object.assign({ work: { kind, flip: 0, show: kind !== "none" }, tipS: 0, grabF: 0.2, grip: 0.5, btn: [], pick: null, loop: null,
    endKnot: 0, snips: null, cutTail: 0, needleShow: true, handL: { f: "work", p: [-0.083, T, 0.014], grip: 0.85 } }, extra ? extra() : {});
}
/* the needle's track and the events on it (where its eye takes the thread through the cloth) */
function Track(kind) {
  const c = [], evs = [];
  const H = {
    kind, c, evs, sp: null, last: 0,
    pt(p, nodes) { c.push(p); if (nodes) evs.push({ ci: c.length - 1, nodes }); return c.length - 1; },
    S(x, z, h) { return [x, topOf(x, z, kind) + h + surf(x, z), z]; },      // above the front
    Sb(x, z, h) { return [x, -h + surf(x, z), z]; },                         // below the back
    mid(x, z) { return [x, topOf(x, z, kind) / 2 + surf(x, z), z]; },
    done() { H.sp = spline(c, 0.0006); evs.forEach(e => { e.s = H.sp.cs[e.ci]; e.nodes.forEach(n => { if (n.L === "K" && n.hang) n.pinS = e.s; }); }); }
  };
  return H;
}
/* the needle moves to control point ci; the right hand holds it at fraction f of its length (0 eye … 1 tip) */
function tip(tl, H, step, d, ci, f0, f1) {
  const from = H.last; H.last = ci;
  return tl.add(step, d, (st, u) => { st.tipS = lerp(H.sp.cs[from], H.sp.cs[ci], u); st.grabF = lerp(f0, f1 == null ? f0 : f1, u); });
}
const ANG = 20 * DEG;
/* one stitch with the needle in a single move: down at a, up at b (both on the line z), from the front */
function scoop(H, a, b, z, opt) {
  opt = opt || {};
  const dir = Math.sign(b - a), ca = Math.cos(ANG), sa = Math.sin(ANG);
  const u1 = [dir * ca, -sa, 0], u2 = [dir * ca, sa, 0];
  const A = H.mid(a, z), B = H.mid(b, z);
  const i0 = H.pt(add(A, mul(u1, -0.044)));
  H.pt(add(A, mul(u1, -0.006)));
  H.pt(A, [{ L: "F", x: a, z }, { L: "B", x: a, z }]);
  const iA = H.pt(add(A, mul(u1, 0.0045)));
  H.pt(add(B, mul(u2, -0.0045)));
  H.pt(B, [{ L: "B", x: b, z }, { L: "F", x: b, z }]);
  H.pt(add(B, mul(u2, 0.006)));
  const iE = H.pt(add(B, mul(u2, 0.015)));
  return { i0, iA, iE, dir };
}
/* straight through the cloth, from one side to the other (a stab); u is the needle's direction */
function stab(H, x, z, from, u, nodesExtra, opt) {
  opt = opt || {};
  const P = H.mid(x, z);
  const nodes = (nodesExtra || []).concat([{ L: from, x, z }, { L: from === "F" ? "B" : "F", x, z }]);
  const i0 = H.pt(add(P, mul(u, -(opt.lead || 0.046))));
  H.pt(add(P, mul(u, -0.006)));
  H.pt(P, nodes);
  H.pt(add(P, mul(u, 0.006)));
  const iE = H.pt(add(P, mul(u, 0.016)));
  return { i0, iE };
}
/* pull the needle out and up, away from the cloth, until the thread lies flat (above the front or below the back) */
function pullOut(H, x, z, side, dx, dz) {
  const s = side === "F" ? 1 : -1, y = v => (side === "F" ? topOf(x, z, H.kind) + v : -v) + surf(x, z);
  H.pt([x + dx * 0.45, y(0.02), z + dz * 0.45]);
  H.pt([x + dx * 0.8, y(0.045), z + dz * 0.8]);
  return H.pt([x + dx, y(0.07), z + dz]);
}
/* the standard hand-sewing rhythm for a scoop stitch, split over the steps given */
function scoopStitch(tl, H, a, b, z, sDown, sUp, sPull, pace) {
  pace = pace || 1;
  const sc = scoop(H, a, b, z);
  tip(tl, H, sDown, 0.9 * pace, sc.i0, 0.2);                 // carry the needle to where it goes in
  tip(tl, H, sDown, 0.9 * pace, sc.iA, 0.2);                 // down through the cloth
  tip(tl, H, sUp, 0.9 * pace, sc.iE, 0.2);                   // along under and up
  tip(tl, H, sPull, 0.45 * pace, sc.iE, 0.2, 0.85);          // let go, take the tip
  const iP = pullOut(H, b, z, "F", sc.dir * 0.036, 0.008);
  tip(tl, H, sPull, 1.3 * pace, iP, 0.85);                   // pull the thread through
  return sc;
}
function knotNode(x, z, hang, inside) { return { L: "K", x, z, hang: inside ? null : hang, inside: !!inside }; }
/* the thread at time t: committed route + the taut thread up to the eye + the short end beyond the eye */
function deriveHand(H, pre) {
  return st => {
    const sp = H.sp, sEye = st.tipS - NL; st.sEye = sEye;
    const nodes = (pre ? pre(st) : []).slice();
    let lastS = -1, pending = null;
    for (const e of H.evs) {
      if (e.s <= sEye + 1e-7) { nodes.push(...e.nodes); lastS = e.s; }
      else { if (!pending) pending = e; }
    }
    if (st.endKnotNode) nodes.push(st.endKnotNode);
    if (st.cutAfter) nodes.push({ L: "cut" });
    st.nodes = nodes;
    const lines = routeLines(nodes, st);
    const eyeS = Math.max(0, sEye), tipS = st.tipS;
    const needle = pathPart(sp, eyeS, Math.max(eyeS + 0.002, Math.min(tipS, sp.s[sp.s.length - 1])), 0.002);
    st.needle = st.needleShow ? needle : null;
    const eye = needle[0];
    st.eye = eye;
    // the live end: from the last thing on the route (or a knot still hanging) to the eye
    const lastNode = nodes[nodes.length - 1];
    if (st.needleShow && !st.cutAfter) {
      let anchor, line;
      if (!lastNode || lastNode.L === "cut") {
        const k = pending && pending.nodes.find(n => n.L === "K");
        anchor = k ? knotPos(k, st) : add(eye, [0, -0.03, 0.006]);
        line = [anchor]; lines.push(line);
        if (k) st.loose = anchor;
      } else { line = lines[lines.length - 1]; anchor = line[line.length - 1]; }
      if (st.loop && st.loop.r > 0.0002) {                     // a loop left on the back (tie-off)
        const r = st.loop.r, c = add(anchor, [0, -r, 0]);
        for (let i = 1; i <= 20; i++) { const a = i / 20 * Math.PI * 2; line.push(add(c, [0, r * Math.cos(a), r * Math.sin(a)])); }
        anchor = line[line.length - 1];
      }
      const from = Math.max(0, lastS);
      const track = sEye > from ? pathPart(sp, from, sEye, 0.003) : [eye];
      track.shift(); track.push(eye);
      const tt = taut(anchor, track, st.work.kind);
      for (let i = 1; i < tt.length; i++) line.push(tt[i]);
      // the short end beyond the eye
      const back = nrm(sub(needle[0], needle[Math.min(2, needle.length - 1)]));
      st.shortEnd = [eye, add(eye, mul(back, 0.006)), add(add(eye, mul(back, 0.012)), [0, -0.01, 0.004]), add(add(eye, mul(back, 0.014)), [0, -0.026, 0.01])];
    } else if (st.cutAfter && st.tailLen) {
      const line = lines[lines.length - 1], a = line[line.length - 1];
      line.push(add(a, [0.002, -st.tailLen * 0.6, 0.003]), add(a, [0.003, -st.tailLen, 0.006]));
      st.shortEnd = null;
    } else st.shortEnd = null;
    st.threads = lines;
    st.knots = nodes.filter(n => n.L === "K").map(n => ({ p: knotPos(n, st), s: 1 }));
    if (st.endKnotNode && st.endKnot) st.knots.push({ p: nodePt(Object.assign({}, st.endKnotNode, { L: "B" }), st), s: st.endKnot });
    // the right hand holds the needle at fraction grabF of its length
    const gi = clamp(Math.round(st.grabF * (needle.length - 1)), 0, needle.length - 1);
    st.handR = { f: "work", p: needle[gi], grip: 0.5, pinch: true, dir: nrm(sub(needle[needle.length - 1], needle[0])) };
    if (!st.needleShow) st.handR = { f: "work", p: [0.05, 0.03, 0.04], grip: 0.2, pinch: false };
    if (st.snips) st.handR = { f: "work", p: st.snips.p, grip: 0.9, pinch: false };
  };
}
const sideF = dir => nrm([dir * 0.32, 1, 0.12]);
const sideB = dir => nrm([dir * 0.32, -1, 0.1]);
function flipSeg(tl, step, to) { tl.add(step, 1.6, (st, u) => { st.work.flip = to ? u : 1 - u; }); }
function holdSeg(tl, step, d) { tl.add(step, d || 0.8, null); }

const BUILD = {};
/* Running stitch: up at x0; scoops (x1, x2) (x3, x4) …; down at the end */
BUILD["running-stitch"] = () => {
  const tl = TL("running-stitch", "hand", workInit("pair")), H = Track("pair");
  const l = 0.008, x = k => 0.05 - k * l, dir = -1, z = 0;
  const s0 = stab(H, x(0), z, "B", sideF(dir), [knotNode(x(0), z, [x(0) + 0.004, -0.028, 0.006])]);
  H.last = s0.i0;
  holdSeg(tl, 0, 0.6);
  tip(tl, H, 0, 1.4, s0.iE, 0.2);
  tip(tl, H, 0, 0.4, s0.iE, 0.2, 0.85);
  tip(tl, H, 0, 1.5, pullOut(H, x(0), z, "F", 0.03, 0.01), 0.85);
  tip(tl, H, 0, 0.3, H.last, 0.85, 0.2);
  scoopStitch(tl, H, x(1), x(2), z, 1, 2, 3, 1.3);
  tip(tl, H, 3, 0.3, H.last, 0.85, 0.2);
  for (let k = 3; k <= 7; k += 2) { scoopStitch(tl, H, x(k), x(k + 1), z, 4, 4, 4, 0.75); tip(tl, H, 4, 0.25, H.last, 0.85, 0.2); }
  const e = stab(H, x(9), z, "F", sideB(dir));
  tip(tl, H, 5, 1, e.i0, 0.2); tip(tl, H, 5, 0.9, e.iE, 0.2); tip(tl, H, 5, 0.35, e.iE, 0.2, 0.85);
  tip(tl, H, 5, 1.3, pullOut(H, x(9), z, "B", -0.01, 0.012), 0.85);
  flipSeg(tl, 6, 1); holdSeg(tl, 6, 0.8);
  H.done(); tl.derive = deriveHand(H); tl.track = H;
  return finish(tl, 7);
};
/* Backstitch: up at x1; scoops (x0 → x2), (x1 → x3) …; down at x5 */
BUILD.backstitch = () => {
  const tl = TL("backstitch", "hand", workInit("pair")), H = Track("pair");
  const l = 0.0065, x = k => 0.042 - k * l, dir = -1, z = 0;
  const s0 = stab(H, x(1), z, "B", sideF(dir), [knotNode(x(1), z, [x(1) + 0.004, -0.028, 0.006])]);
  H.last = s0.i0;
  holdSeg(tl, 0, 0.6);
  tip(tl, H, 0, 1.4, s0.iE, 0.2); tip(tl, H, 0, 0.4, s0.iE, 0.2, 0.85);
  tip(tl, H, 0, 1.5, pullOut(H, x(1), z, "F", 0.03, 0.01), 0.85); tip(tl, H, 0, 0.3, H.last, 0.85, 0.2);
  scoopStitch(tl, H, x(0), x(2), z, 1, 2, 3, 1.3); tip(tl, H, 3, 0.3, H.last, 0.85, 0.2);
  scoopStitch(tl, H, x(1), x(3), z, 4, 4, 4, 1); tip(tl, H, 4, 0.3, H.last, 0.85, 0.2);
  for (let k = 2; k <= 4; k++) { scoopStitch(tl, H, x(k), x(k + 2), z, 5, 5, 5, 0.75); tip(tl, H, 5, 0.25, H.last, 0.85, 0.2); }
  const e = stab(H, x(5), z, "F", nrm([-dir * 0.3, -1, 0.1]));
  tip(tl, H, 6, 1, e.i0, 0.2); tip(tl, H, 6, 0.9, e.iE, 0.2); tip(tl, H, 6, 0.35, e.iE, 0.2, 0.85);
  tip(tl, H, 6, 1.3, pullOut(H, x(5), z, "B", -0.01, 0.012), 0.85);
  flipSeg(tl, 7, 1); holdSeg(tl, 7, 0.8);
  H.done(); tl.derive = deriveHand(H); tl.track = H;
  return finish(tl, 8);
};
/* Whipstitch: up from the back near the edge; over the edge to the back; through from the back a little along … */
BUILD.whipstitch = () => {
  const tl = TL("whipstitch", "hand", workInit("pair")), H = Track("pair");
  const sp = 0.0065, x = k => 0.04 - k * sp, zi = EDGE + 0.0045, n = 7;
  const uIn = nrm([0, 1, 0.75]);                                   // from the back, out the front, toward the inside
  const s0 = stab(H, x(0), zi, "B", uIn, [knotNode(x(0), zi, [x(0) + 0.003, -0.03, zi + 0.004])]);
  H.last = s0.i0;
  holdSeg(tl, 0, 1.2);
  tip(tl, H, 1, 1.4, s0.iE, 0.2); tip(tl, H, 1, 0.4, s0.iE, 0.2, 0.85);
  tip(tl, H, 1, 1.4, pullOut(H, x(0), zi, "F", -0.004, 0.03), 0.85);
  for (let k = 1; k < n; k++) {
    const xw = (x(k - 1) + x(k)) / 2, sNow = k === 1 ? [2, 3, 4] : [5, 5, 5], pace = k === 1 ? 1.2 : 0.7;
    tip(tl, H, sNow[0], 0.3 * pace, H.last, 0.85, 0.2);
    // over the top edge, down behind the work (the eye takes the thread over the edge: a wrap, no hole)
    H.pt([xw, T + 0.03 + surf(xw, EDGE), EDGE - 0.006]);
    const iO = H.pt([xw, T / 2 + surf(xw, EDGE), EDGE - 0.014], [{ L: "F", x: xw, z: EDGE }, { L: "E", x: xw, z: EDGE }, { L: "B", x: xw, z: EDGE }]);
    H.pt([x(k), -0.026 + surf(x(k), EDGE), EDGE - 0.02]);
    const s = stab(H, x(k), zi, "B", uIn);
    tip(tl, H, sNow[0], 1.1 * pace, iO, 0.2);
    tip(tl, H, sNow[1], 1.0 * pace, s.i0, 0.2);
    tip(tl, H, sNow[1], 0.9 * pace, s.iE, 0.2);
    tip(tl, H, sNow[2], 0.4 * pace, s.iE, 0.2, 0.85);
    tip(tl, H, sNow[2], 1.2 * pace, pullOut(H, x(k), zi, "F", -0.004, 0.03), 0.85);
  }
  flipSeg(tl, 6, 1); holdSeg(tl, 6, 0.8);
  H.done(); tl.derive = deriveHand(H); tl.track = H;
  return finish(tl, 7);
};
/* Slip stitch (blind hem): out through the fold; catch a thread of the main fabric; slide 1 cm inside the fold; out */
BUILD["slip-stitch"] = () => {
  const tl = TL("slip-stitch", "hand", workInit("hem")), H = Track("hem");
  const sp = 0.0095, x = k => 0.04 - k * sp, dir = -1, zf = 0.0012, zc = -0.0028, n = 6;
  // the needle starts inside the fold and comes out of it (the knot stays hidden in the fold)
  const P0 = [x(0), 1.5 * LT + surf(x(0), zf), zf];
  const i0 = H.pt(add(P0, [-dir * 0.045, 0, 0])); H.pt(add(P0, [-dir * 0.012, 0, 0]));
  H.pt(P0, [knotNode(x(0) - dir * 0.008, zf, null, true), { L: "IF", x: x(0), z: zf }, { L: "F", x: x(0), z: zf }]);
  H.pt(H.S(x(0) + dir * 0.004, zf, 0.0025)); const iE0 = H.pt(H.S(x(0) + dir * 0.012, zf + 0.002, 0.006));
  H.last = i0;
  tl.add(0, 2.2, (st, u) => { st.hemFold = u; });
  tip(tl, H, 1, 1.6, iE0, 0.2); tip(tl, H, 1, 0.4, iE0, 0.2, 0.85);
  tip(tl, H, 1, 1.2, pullOut(H, x(0), zf, "F", 0.02, -0.02), 0.85);
  for (let k = 0; k < n - 1; k++) {
    const first = k === 0, sC = first ? 2 : 5, sS = first ? 3 : 5, sP = first ? 4 : 5, pace = first ? 1.25 : 0.7;
    const c1 = x(k) + dir * 0.0006, c2 = x(k) + dir * 0.0016, f1 = x(k) + dir * 0.0026, e1 = x(k + 1);
    tip(tl, H, sC, 0.3 * pace, H.last, 0.85, 0.2);
    const u1 = nrm([dir * 0.94, -0.34, 0]);
    const C1 = H.mid(c1, zc), C2 = H.mid(c2, zc);
    const iA = H.pt(add(C1, mul(u1, -0.044))); H.pt(add(C1, mul(u1, -0.005)));
    H.pt(C1, [{ L: "F", x: c1, z: zc }, { L: "B", x: c1, z: zc }]);
    H.pt([lerp(c1, c2, 0.5), -0.0007 + surf(c1, zc), zc]);
    H.pt(C2, [{ L: "B", x: c2, z: zc }, { L: "F", x: c2, z: zc }]);
    const iC = H.pt(H.S(lerp(c2, f1, 0.5), lerp(zc, zf, 0.4), 0.0009));
    const F1 = [f1, 1.5 * LT + surf(f1, zf), zf];
    H.pt(F1, [{ L: "F", x: f1, z: zf }, { L: "IF", x: f1, z: zf }]);
    H.pt([lerp(f1, e1, 0.5), 1.5 * LT + surf((f1 + e1) / 2, zf), zf]);
    const E1 = [e1, 1.5 * LT + surf(e1, zf), zf];
    const iS = H.pt(E1, [{ L: "IF", x: e1, z: zf }, { L: "F", x: e1, z: zf }]);
    H.pt(H.S(e1 + dir * 0.004, zf, 0.002)); const iE = H.pt(H.S(e1 + dir * 0.012, zf + 0.002, 0.0055));
    tip(tl, H, sC, 1.0 * pace, iA, 0.2);
    tip(tl, H, sC, 0.9 * pace, iC, 0.2);
    tip(tl, H, sS, 1.1 * pace, iS, 0.2);
    tip(tl, H, sP, 0.5 * pace, iE, 0.2);
    tip(tl, H, sP, 0.4 * pace, iE, 0.2, 0.85);
    tip(tl, H, sP, 1.2 * pace, pullOut(H, e1, zf, "F", 0.02, -0.02), 0.85);
  }
  flipSeg(tl, 6, 1); holdSeg(tl, 6, 0.8);
  H.done(); tl.derive = deriveHand(H); tl.track = H;
  return finish(tl, 7);
};
/* Blanket stitch: up at the edge; down a step along and a little in; tip out past the edge in front of the loop */
BUILD["blanket-stitch"] = () => {
  const tl = TL("blanket-stitch", "hand", workInit("pair")), H = Track("pair");
  const sp = 0.0068, x = k => 0.04 - k * sp, d = 0.0065, n = 7;
  const s0 = stab(H, x(0), EDGE + 0.0012, "B", nrm([0, 1, 0.5]), [knotNode(x(0), EDGE + 0.0012, [x(0) + 0.003, -0.03, EDGE + 0.006])]);
  H.last = s0.i0;
  tip(tl, H, 0, 1.4, s0.iE, 0.2); tip(tl, H, 0, 0.4, s0.iE, 0.2, 0.85);
  tip(tl, H, 0, 1.4, pullOut(H, x(0), EDGE + 0.0012, "F", -0.004, -0.03), 0.85);
  for (let k = 1; k < n; k++) {
    const first = k === 1, sD = first ? 1 : 4, sT = first ? 2 : 4, sP = first ? 3 : 4, pace = first ? 1.25 : 0.7;
    tip(tl, H, sD, 0.3 * pace, H.last, 0.85, 0.2);
    const xi = x(k), zi = EDGE + d, u = nrm([0, -1, -0.85]);
    const P = H.mid(xi, zi);
    const iA = H.pt(add(P, mul(u, -0.044))); H.pt(add(P, mul(u, -0.005)));
    H.pt(P, [{ L: "F", x: xi, z: EDGE }, { L: "F", x: xi, z: zi }, { L: "B", x: xi, z: zi }]);
    const iU = H.pt([xi, -0.0016 + surf(xi, EDGE + 0.003), EDGE + 0.003]);
    const iW = H.pt([xi, -0.0012 + surf(xi, EDGE), EDGE - 0.0035], [{ L: "B", x: xi, z: EDGE }, { L: "E", x: xi, z: EDGE }, { L: "F", x: xi, z: EDGE }]);
    H.pt([xi, T + 0.002 + surf(xi, EDGE), EDGE - 0.008]);
    const iE = H.pt([xi, T + 0.009 + surf(xi, EDGE), EDGE - 0.012]);
    tip(tl, H, sD, 1.0 * pace, iA, 0.2);
    tip(tl, H, sD, 0.9 * pace, iU, 0.2);
    tip(tl, H, sT, 1.0 * pace, iE, 0.2);
    tip(tl, H, sP, 0.4 * pace, iE, 0.2, 0.85);
    tip(tl, H, sP, 1.2 * pace, pullOut(H, xi, EDGE, "F", -0.006, -0.035), 0.85);
  }
  flipSeg(tl, 5, 1); holdSeg(tl, 5, 0.8);
  H.done(); tl.derive = deriveHand(H); tl.track = H;
  return finish(tl, 6);
};
/* Sew on a button: a four-hole button with a toothpick spacer and a wrapped thread shank; then a shank button */
const BTN = { c: [0.016, 0], s: 0.0022, r: 0.0095, sc: [-0.03, 0] };
BUILD["sew-button"] = () => {
  const tl = TL("sew-button", "hand", workInit("pair", () => ({ btn: [{ kind: "four", x: BTN.c[0], z: BTN.c[1], y: 0.016, show: 0 }, { kind: "shank", x: BTN.sc[0], z: BTN.sc[1], y: 0.016, show: 0 }], pick: { show: 0, out: 0 } }))), H = Track("pair");
  const [cx, cz] = BTN.c, s = BTN.s;
  const ha = [cx - s, cz - s], hb = [cx - s, cz + s], hc = [cx + s, cz - s], hd = [cx + s, cz + s];
  const up = nrm([0.08, 1, 0.05]), down = nrm([0.08, -1, 0.05]);
  // 1 · up from the back at hole a's place (the knot on the back)
  const s0 = stab(H, ha[0], ha[1], "B", up, [knotNode(ha[0], ha[1], [ha[0] + 0.004, -0.028, ha[1] + 0.006])]);
  H.last = s0.i0;
  tip(tl, H, 0, 1.4, s0.iE, 0.2); tip(tl, H, 0, 0.4, s0.iE, 0.2, 0.85);
  tip(tl, H, 0, 1.3, pullOut(H, ha[0], ha[1], "F", 0.012, 0.01), 0.85);
  // 2 · the button, held up, goes onto the needle through hole a, then slides down the thread
  const hold = 0.016;
  tl.add(1, 0.8, (st, u) => { st.btn[0].show = u; });
  tip(tl, H, 1, 0.3, H.last, 0.85, 0.2);
  H.pt([ha[0] + 0.006, hold - 0.012 + surf(ha[0], ha[1]), ha[1] + 0.012]);
  const iHu = H.pt([ha[0], hold - 0.002 + surf(ha[0], ha[1]), ha[1]]);
  H.pt([ha[0], hold + BH / 2 + surf(ha[0], ha[1]), ha[1]], [{ L: "BT", x: ha[0], z: ha[1], b: 0 }]);
  const iHe = H.pt([ha[0] + 0.001, hold + 0.014 + surf(ha[0], ha[1]), ha[1] + 0.001]);
  tip(tl, H, 1, 1.0, iHu, 0.2); tip(tl, H, 1, 0.9, iHe, 0.2); tip(tl, H, 1, 0.35, iHe, 0.2, 0.85);
  tip(tl, H, 1, 1.0, H.pt([ha[0] + 0.004, 0.06 + surf(ha[0], ha[1]), ha[1] + 0.012]), 0.85);
  tl.add(1, 1.0, (st, u) => { st.btn[0].y = lerp(hold, T, u); });
  // 3 · the toothpick across the top
  tl.add(2, 1.4, (st, u) => { st.pick.show = u; });
  const passes = [];
  // 4 · down b, up a … three times; 5 · c and d three times
  const bt = (h) => ({ L: "BT", x: h[0], z: h[1], b: 0 });
  const downThrough = (h, step, pace) => {
    const P = H.mid(h[0], h[1]), top = T + PIN + BH;
    const iA = H.pt([h[0] - 0.004, top + 0.04 + surf(h[0], h[1]), h[1] + 0.006]);
    H.pt([h[0], top + 0.004 + surf(h[0], h[1]), h[1]]);
    H.pt([h[0], T + PIN + BH / 2 + surf(h[0], h[1]), h[1]], [bt(h)]);
    H.pt(P, [{ L: "F", x: h[0], z: h[1] }, { L: "B", x: h[0], z: h[1] }]);
    const iE = H.pt([h[0] + 0.001, -0.014 + surf(h[0], h[1]), h[1] + 0.002]);
    tip(tl, H, step, 0.3 * pace, H.last, 0.85, 0.2);
    tip(tl, H, step, 0.8 * pace, iA, 0.2); tip(tl, H, step, 0.8 * pace, iE, 0.2); tip(tl, H, step, 0.3 * pace, iE, 0.2, 0.85);
    tip(tl, H, step, 0.8 * pace, H.pt([h[0] + 0.006, -0.05 + surf(h[0], h[1]), h[1] + 0.012]), 0.85);
  };
  const upThrough = (h, step, pace) => {
    const P = H.mid(h[0], h[1]);
    const iA = H.pt([h[0] + 0.004, -0.04 + surf(h[0], h[1]), h[1] + 0.006]);
    H.pt([h[0], -0.004 + surf(h[0], h[1]), h[1]]);
    H.pt(P, [{ L: "B", x: h[0], z: h[1] }, { L: "F", x: h[0], z: h[1] }]);
    H.pt([h[0], T + PIN + BH / 2 + surf(h[0], h[1]), h[1]], [bt(h)]);
    const iE = H.pt([h[0] - 0.001, T + 0.016 + surf(h[0], h[1]), h[1] + 0.002]);
    tip(tl, H, step, 0.3 * pace, H.last, 0.85, 0.2);
    tip(tl, H, step, 0.8 * pace, iA, 0.2); tip(tl, H, step, 0.8 * pace, iE, 0.2); tip(tl, H, step, 0.3 * pace, iE, 0.2, 0.85);
    tip(tl, H, step, 0.8 * pace, H.pt([h[0] - 0.004, 0.06 + surf(h[0], h[1]), h[1] + 0.012]), 0.85);
  };
  downThrough(hb, 3, 1.1); upThrough(ha, 3, 0.8); downThrough(hb, 3, 0.7); upThrough(ha, 3, 0.7); downThrough(hb, 3, 0.7);
  upThrough(hc, 4, 0.8); downThrough(hd, 4, 0.7); upThrough(hc, 4, 0.6); downThrough(hd, 4, 0.6); upThrough(hc, 4, 0.6); downThrough(hd, 4, 0.6);
  // 6 · out with the toothpick; the button rises on its threads; up under the button beside the threads
  tl.add(5, 1.2, (st, u) => { st.pick.out = u; st.btn[0].y = T + PIN * u; });
  const w0 = [cx + 0.0048, cz];
  const sW = stab(H, w0[0], w0[1], "B", nrm([0.15, 1, 0.1]));
  tip(tl, H, 5, 0.3, H.last, 0.85, 0.2);
  tip(tl, H, 5, 0.9, sW.i0, 0.2);
  // the needle comes up and goes round the threads under the button (a helix); the thread wraps snugly (W nodes)
  const yA = T + 0.0004, yB = T + PIN - 0.0003, turns = 3;
  const P0 = H.mid(w0[0], w0[1]);
  H.c.pop(); H.c.pop();                                          // the stab's own way out is replaced by the wraps
  H.pt([w0[0], T + 0.0008 + surf(w0[0], w0[1]), w0[1]]);
  const NW = 24 * turns;
  let iWlast;
  for (let i = 1; i <= NW; i++) {
    const a = i / 24 * Math.PI * 2, f = i / NW, yy = lerp(yA, yB, f) + surf(cx, cz);
    const R = 0.0062;
    const evN = i % 3 === 0 ? [{ L: "W", x: cx + 0.0036 * Math.cos(a), z: cz + 0.0036 * Math.sin(a), y: lerp(yA, yB, f) }] : null;
    iWlast = H.pt([cx + R * Math.cos(a), yy, cz + R * Math.sin(a)], evN);
  }
  H.pt([cx + 0.012, T + 0.004 + surf(cx, cz), cz + 0.004]);
  const iWe = H.pt([cx + 0.03, T + 0.012 + surf(cx, cz), cz + 0.01]);
  tip(tl, H, 5, 0.9, H.c.length - NW - 3, 0.2);
  tip(tl, H, 6, 0.35, H.last, 0.2, 0.85);
  tip(tl, H, 6, 3.6, iWlast, 0.85);
  tip(tl, H, 6, 1.6, iWe, 0.85);
  tip(tl, H, 6, 0.8, H.pt([cx + 0.04, T + 0.04 + surf(cx, cz), cz + 0.015]), 0.85);
  // 8 · down beside the shank; a knot on the back; this thread ends
  const w1 = [cx + 0.0052, cz + 0.0022];
  const sD = stab(H, w1[0], w1[1], "F", nrm([0.15, -1, 0.1]));
  tip(tl, H, 7, 0.3, H.last, 0.85, 0.2); tip(tl, H, 7, 1.0, sD.i0, 0.2); tip(tl, H, 7, 0.9, sD.iE, 0.2); tip(tl, H, 7, 0.3, sD.iE, 0.2, 0.85);
  const iKb = H.pt([w1[0] + 0.004, -0.04 + surf(w1[0], w1[1]), w1[1] + 0.01], [{ L: "K", x: w1[0], z: w1[1] }, { L: "cut" }]);
  tip(tl, H, 7, 1.2, iKb, 0.85);
  // 9 · the shank button: up from the back, through the loop, down beside — four times, then a knot
  const [sx, sz] = BTN.sc, yLoop = T + 0.0016;
  tl.add(8, 1.0, (st, u) => { st.btn[1].show = u; st.btn[1].y = lerp(0.014, T, u); });
  let first = true;
  for (let p = 0; p < 4; p++) {
    const dz = (p - 1.5) * 0.0004, a1 = [sx - 0.0019, sz + dz], a2 = [sx + 0.0019, sz + dz];
    const step = p === 0 ? 8 : 9, pace = p === 0 ? 1.1 : 0.7;
    const P1 = H.mid(a1[0], a1[1]), P2 = H.mid(a2[0], a2[1]);
    const uu = nrm([0.35, 1, 0]);
    const iA = H.pt(add(P1, mul(uu, -0.044))); H.pt(add(P1, mul(uu, -0.005)));
    const n1 = [{ L: "B", x: a1[0], z: a1[1] }, { L: "F", x: a1[0], z: a1[1] }];
    if (first) n1.unshift(knotNode(a1[0], a1[1], [a1[0] - 0.004, -0.03, a1[1] + 0.006]));
    first = false;
    H.pt(P1, n1);
    H.pt([sx - 0.0012, yLoop + surf(sx, sz), sz + dz]);
    H.pt([sx, yLoop + 0.0002 + surf(sx, sz), sz + dz], [{ L: "U", x: sx, z: sz + dz, y: yLoop }]);
    H.pt([sx + 0.0012, yLoop + surf(sx, sz), sz + dz]);
    H.pt(P2, [{ L: "F", x: a2[0], z: a2[1] }, { L: "B", x: a2[0], z: a2[1] }]);
    const iE = H.pt(add(P2, mul(nrm([0.35, -1, 0]), 0.016)));
    tip(tl, H, step, 0.3 * pace, H.last, 0.85, 0.2);
    tip(tl, H, step, 1.0 * pace, iA, 0.2); tip(tl, H, step, 1.2 * pace, iE, 0.2); tip(tl, H, step, 0.3 * pace, iE, 0.2, 0.85);
    tip(tl, H, step, 0.9 * pace, H.pt([a2[0] + 0.004, -0.05 + surf(a2[0], a2[1]), a2[1] + 0.012]), 0.85);
  }
  tl.add(9, 0.8, (st, u) => { st.endKnotNode = { L: "K", x: sx + 0.0019, z: sz + 0.0006 }; st.endKnot = u; st.cutAfter = u > 0.5; st.tailLen = 0.008; st.needleShow = u < 0.5; });
  H.done(); tl.derive = deriveHand(H); tl.track = H;
  return finish(tl, 10);
};
/* Tie off: running stitches already made, the needle at the back; turn over; tiny stitch; loop; through twice; snip */
BUILD["tie-off"] = () => {
  const l = 0.008, x = k => 0.05 - k * l, z = 0;
  const pre = () => {
    const n = [knotNode(x(0), z, null)];
    n[0].hang = null;
    n.push({ L: "B", x: x(0), z }, { L: "F", x: x(0), z });
    for (let k = 1; k <= 8; k++) n.push({ L: k % 2 ? "F" : "B", x: x(k), z }, { L: k % 2 ? "B" : "F", x: x(k), z });
    return n;
  };
  const tl = TL("tie-off", "hand", workInit("pair")), H = Track("pair");
  const xe = x(8);                                        // the thread is at the back at x(8)
  const pB = [xe - 0.0012, 0.0014], pB2 = [xe - 0.0036, 0.0014];
  // the needle starts under the work, hanging from the last stitch
  const i0 = H.pt([xe + 0.004, -0.06 + surf(xe, z), z + 0.012]);
  H.pt([xe + 0.002, -0.045 + surf(xe, z), z + 0.01]);
  H.last = i0;
  holdSeg(tl, 0, 1.8);
  flipSeg(tl, 1, 1);
  // a tiny stitch on the back through the bottom layer only (B → I → B)
  const u1 = nrm([-0.94, 0.34, 0]), u2 = nrm([-0.94, -0.34, 0]);
  const A = [pB[0], LT / 2 + surf(pB[0], pB[1]), pB[1]], Bp = [pB2[0], LT / 2 + surf(pB2[0], pB2[1]), pB2[1]];
  const iA = H.pt(add(A, mul(u1, -0.044))); H.pt(add(A, mul(u1, -0.004)));
  H.pt(A, [{ L: "B", x: pB[0], z: pB[1] }, { L: "I", x: pB[0], z: pB[1] }]);
  H.pt(Bp, [{ L: "I", x: pB2[0], z: pB2[1] }, { L: "B", x: pB2[0], z: pB2[1] }]);
  H.pt(add(Bp, mul(u2, 0.005))); const iE = H.pt(add(Bp, mul(u2, 0.014)));
  tip(tl, H, 2, 1.2, iA, 0.2); tip(tl, H, 2, 1.4, iE, 0.2); tip(tl, H, 2, 0.4, iE, 0.2, 0.85);
  // pull, leaving a loop
  const iP = H.pt([pB2[0] - 0.02, -0.03 + surf(pB2[0], 0), 0.004]);
  tip(tl, H, 3, 1.6, iP, 0.85);
  tl.add(3, 0.01, (st) => { st.loop = { r: 0.0055 }; });
  const r0 = 0.0055;
  // through the loop twice (the loop stands up from the back at the last stitch)
  const lc = [pB2[0], -CL - r0 + surf(pB2[0], pB2[1]), pB2[1]];
  for (let k = 0; k < 2; k++) {
    H.pt(add(lc, [0.03, -0.01, 0.005]));
    H.pt(add(lc, [0.008, 0, 0]));
    const iT = H.pt(add(lc, [-0.008, 0, 0]));
    const iQ = H.pt(add(lc, [-0.03, -0.012, 0.004]));
    tip(tl, H, 4, 1.3, iT, 0.2); tip(tl, H, 4, 0.3, iT, 0.2, 0.85); tip(tl, H, 4, 1.3, iQ, 0.85);
    if (k === 0) tip(tl, H, 4, 0.3, iQ, 0.85, 0.2);
  }
  tl.add(5, 2.2, (st, u) => { st.loop = { r: r0 * (1 - u) }; st.endKnotNode = { L: "K", x: pB2[0], z: pB2[1] }; st.endKnot = u; });
  tip(tl, H, 5, 2.2, H.pt(add(lc, [-0.05, -0.02, 0.01])), 0.85);
  tl.par(5, 2.2, null);
  tl.add(6, 2.0, (st, u) => {
    st.snips = { p: add(nodePt({ L: "B", x: pB2[0] - 0.006, z: pB2[1] }, st), [0, -0.012, 0.004]), open: u < 0.5 ? u * 2 : 2 - u * 2 };
    if (u > 0.55) { st.cutAfter = true; st.tailLen = 0.006; st.needleShow = false; }
  });
  H.done(); tl.derive = deriveHand(H, pre); tl.track = H;
  tl.pre = pre;
  return finish(tl, 7);
};
/* Thread a needle and tie the needle knot: the needle and thread in the air (no cloth) */
BUILD["thread-needle"] = () => {
  const tl = TL("thread-needle", "hand", workInit("none", () => ({ tn: { cut: 0, snip: 0, lift: 0, end: 0, pull: 0 } })));
  tl.add(0, 2.4, (st, u) => { st.tn.cut = u; });
  tl.add(1, 2.0, (st, u) => { st.tn.snip = u; });
  tl.add(2, 1.8, (st, u) => { st.tn.lift = u; });
  tl.add(3, 2.6, (st, u) => { st.tn.end = u; });
  tl.add(4, 2.4, (st, u) => { st.tn.pull = u; });
  tl.derive = st => {
    const q = st.tn, eyeY = 0.03 + 0.012 * q.lift;
    const eye = [0, eyeY, 0.004 - 0.01 * q.lift];
    const dir = nrm([0, 1, -0.25 * q.lift]);
    const tipP = add(eye, mul(dir, -NL));
    st.needle = [tipP, eye];  // tip … eye
    st.needle = [eye, tipP].reverse();
    st.needleTipFirst = true;
    st.eye = eye;
    // the thread: from the spool on the right, its end coming to the eye
    const far = [0.2, -0.05, 0.02];
    const endStart = [0.07, eyeY - 0.015, 0.02];
    const endAtEye = add(eye, [0.006, 0, 0]);
    const endThrough = add(eye, [-0.012 - 0.03 * q.pull, -0.03 * q.pull, 0.002]);
    let end = q.end < 1 ? mix(endStart, endAtEye, ease(clamp(q.end * 1.3, 0, 1))) : endAtEye;
    if (q.end > 0.77) end = mix(endAtEye, add(eye, [-0.012, 0, 0]), ease((q.end - 0.77) / 0.23));
    if (q.pull > 0) end = endThrough;
    const line = [far, mix(far, end, 0.5), end];
    line[1] = add(line[1], [0, -0.03 * (1 - q.end), 0]);
    if (q.end > 0.77 || q.pull > 0) { line.splice(2, 0, add(eye, [0.004, 0, 0]), eye); }
    st.threads = [line.map(p => p.slice())];
    if (q.cut < 1) st.snips = { p: [0.1, 0.02, 0.03], open: Math.sin(q.cut * Math.PI) };
    else if (q.snip < 1) st.snips = { p: add(endStart, [0.004, 0.004, 0]), open: Math.sin(q.snip * Math.PI) };
    else st.snips = null;
    st.knots = [];
    st.handL = { f: "work", p: add(tipP, mul(dir, 0.008)), grip: 0.5, pinch: true };
    st.handR = st.snips ? { f: "work", p: st.snips.p, grip: 0.9 } : { f: "work", p: add(end, [0.012, -0.002, 0.004]), grip: 0.5, pinch: true };
  };
  return finish(tl, 5);
};
BUILD["tie-knot"] = () => {
  const tl = TL("tie-knot", "hand", workInit("none", () => ({ tk: { bring: 0, lay: 0, wrap: 0, pinch: 0, pull: 0, slide: 0 } })));
  ["bring", "lay", "wrap", "pinch", "pull", "slide"].forEach((k, i) => tl.add(i, [2.0, 1.6, 3.0, 1.2, 2.4, 2.4][i], (st, u) => { st.tk[k] = u; }));
  tl.derive = st => {
    const q = st.tk;
    const nx = 0.05 * q.pull + 0.03 * q.slide;                  // the needle is pulled out to the right
    const eye = [-0.018 + nx, 0.02, 0], tipP = [0.016 + nx, 0.02, 0];
    st.needle = [eye, tipP]; st.eye = eye;
    const wx0 = 0.004, wx1 = 0.01, R = 0.0011;                  // the wraps' place (held still once pinched)
    const endBase = [wx1 + 0.002, 0.0205, 0.0012];
    // the long thread leaves the eye, hangs in a U and comes back with its end along the needle near the tip
    const endFar = [0.03, -0.03, 0.02];
    let endP = mix(endFar, [0.03, 0.019, 0.004], ease(q.bring));
    endP = mix(endP, endBase, ease(q.lay));
    const loopDepth = lerp(0.05, 0.004, ease(q.pull) * 0.6 + ease(q.slide) * 0.4);
    const line = [eye];
    const hang = [lerp(eye[0], endP[0], 0.5), Math.min(eye[1], endP[1]) - loopDepth, 0.012];
    line.push(add(eye, [-0.004, -0.004, 0.002]), [eye[0] - 0.004, hang[1] + 0.01, 0.01], hang, [endP[0] + 0.006, hang[1] + 0.012, 0.012], endP);
    if (q.slide > 0.6) {                                          // the wraps have reached the end: a knot
      const k = [wx0 + 0.004, 0.0205, 0.0008];
      st.threads = [[eye, mix(eye, k, 0.5), k]];
      st.knots = [{ p: k, s: ease((q.slide - 0.6) / 0.4) }];
      st.coil = null;
    } else {
      st.threads = [line];
      st.knots = [];
      // the coil: wraps around the needle (then around the thread once the eye has passed)
      const nw = q.wrap * 3;
      if (nw > 0.02) {
        const pts = [], N = Math.ceil(nw * 16);
        const r = q.pull > 0.5 ? lerp(R, 0.0007, (q.pull - 0.5) * 2) : R;
        for (let i = 0; i <= N; i++) { const a = i / 16 * Math.PI * 2, f = i / (3 * 16); pts.push([lerp(wx1, wx0, f), 0.02 + r * Math.cos(a), r * Math.sin(a)]); }
        st.coil = pts;
      } else st.coil = null;
    }
    const back = [-1, 0, 0];
    st.shortEnd = [eye, add(eye, [-0.006, 0, 0.001]), add(eye, [-0.012, -0.012, 0.004]), add(eye, [-0.014, -0.03, 0.008])];
    st.handR = q.pull > 0 ? { f: "work", p: add(tipP, [-0.004, 0, 0]), grip: 0.5, pinch: true } : { f: "work", p: add(eye, [0.012, 0, 0]), grip: 0.5, pinch: true };
    st.handL = { f: "work", p: q.pinch > 0 ? [wx0 + 0.003, 0.02, 0.006] : add(endP, [0.004, -0.004, 0.006]), grip: 0.6, pinch: true };
  };
  return finish(tl, 6);
};

/* ═════════════ the machine (world units; the needle's place on the plate is LAYOUT.machine.NP) ═════════════ */
const TABLE_Y = 0.74;
const MX = -0.36, MZ = 0.18, BED_Y = TABLE_Y + 0.075;
const LAYOUT = {
  TABLE_Y, table: [-0.85, 0.85, -0.42, 0.42],
  hand: { seat: [0.45, 0.72], work: [0.45, 0.93, 0.37], tilt: 52 },
  machine: {
    NP: [MX, BED_Y, MZ], bedY: BED_Y, bed: [MX - 0.24, MX + 0.46, MZ - 0.095, MZ + 0.095], seat: [MX, 0.76],
    pedal: [MX + 0.13, 0, 0.6], pincushion: [MX + 0.56, TABLE_Y, MZ + 0.12],
    // the top thread's path, from the spool to the needle (relative to the needle's place on the plate)
    path: [[0.36, 0.268, -0.045], [0.33, 0.258, -0.03], [0.12, 0.258, -0.02], [0.03, 0.245, 0.03], [0.035, 0.205, 0.035],
           [0.03, 0.12, 0.034], [0.015, 0.105, 0.034], [0.0, 0.12, 0.034], [-0.012, 0.175, 0.035], ["takeup"], [-0.006, 0.16, 0.034],
           [-0.004, 0.09, 0.034], [0.0, 0.07, 0.014], ["eye"]],
    parts: { spool: [0.36, 0.29, -0.045], tension: [0.03, 0.2, 0.035], takeup: [-0.01, 0.2, 0.04], needle: [0, 0.06, 0.01], foot: [0, 0.012, 0.012],
      feed: [0, 0.002, 0.01], plate: [0.01, 0.002, 0.0], bobbin: [0, 0.002, 0.05], winder: [0.42, 0.27, -0.02], wheel: [0.5, 0.17, -0.045],
      selector: [0.38, 0.14, 0.01], pedal: null }
  },
  cut: { stand: [0.45, 0.76], cloth: [0.45, 0.13], size: [0.6, 0.44] },
  press: { stand: [1.6, 0.82], board: [1.6, 0.88, 0.32] }
};
const ML = { l: 0.003, W: 0.17, Lh: 0.2 };   // stitch length; the fabric pieces' width and length
function needleTipY(w) { return BED_Y + 0.0075 + 0.0165 * Math.cos(w * DEG); }     // w = 0 needle at its highest
function machineInit(extra) {
  return () => Object.assign({
    m: { w: 0, foot: 0, reverse: 0, threadU: 1, bobbinIn: 1, bobbinLoop: 0, tails: 1, dial: 0, winder: 0, wind: 0, bobbinFill: 1, spoolOn: 1, pedal: 0, footOnPedal: 0, hl: null },
    mf: { show: 1, T: [MX + 0.015, MZ - 0.012], rot: 0, st: [], pins: [], under: 0, off: 0, edge2: null },
    handL: { f: "world", p: [MX - 0.1, BED_Y + 0.01, MZ + 0.05], grip: 0.15 }, handR: { f: "world", p: [MX + 0.07, BED_Y + 0.01, MZ + 0.075], grip: 0.15 },
    look: [MX, BED_Y, MZ]
  }, extra ? extra() : {});
}
/* fabric ↔ world: world = T + R(rot)·local (x, z) */
function f2w(mf, p) { const c = Math.cos(mf.rot * DEG), s = Math.sin(mf.rot * DEG); return [mf.T[0] + c * p[0] - s * p[1], mf.T[1] + s * p[0] + c * p[1]]; }
function w2f(mf, p) { const c = Math.cos(mf.rot * DEG), s = Math.sin(mf.rot * DEG), x = p[0] - mf.T[0], z = p[1] - mf.T[1]; return [c * x + s * z, -s * x + c * z]; }
/* turn the handwheel by dw degrees; the needle goes down at w ≡ 180 (a stitch, if fabric is under it and the machine is
   threaded); the feed dogs move the fabric one stitch length while w is in [250, 350] (back when reverse is held) */
function turnWheel(st, dw) {
  const m = st.m, mf = st.mf, w0 = m.w, w1 = w0 + dw;
  const evs = [];
  for (let k = Math.floor((w0 - 180) / 360) + 1; 180 + 360 * k <= w1 + 1e-9; k++) if (180 + 360 * k > w0 + 1e-9) evs.push({ w: 180 + 360 * k, pen: 1 });
  for (let k = Math.floor((w0 - 350) / 360); 250 + 360 * k <= w1; k++) {
    const a = 250 + 360 * k, b = 350 + 360 * k;
    const lo = Math.max(a, w0), hi = Math.min(b, w1);
    if (hi > lo) evs.push({ w: lo, feed: (hi - lo) / 100 });
  }
  evs.sort((p, q) => p.w - q.w);
  for (const e of evs) {
    if (e.pen) {
      if (mf.show && m.foot > 0.5 && m.threadU >= 1 && mf.under) {
        const p = w2f(mf, [MX, MZ]);
        const L = mf.st[mf.st.length - 1];
        if (!L || Math.hypot(L[0] - p[0], L[1] - p[1]) > 1e-6 || mf.st.length === 0) mf.st.push(p);
        else mf.st.push(p);
      }
    } else if (mf.show && m.foot > 0.5 && mf.under && !m.noFeed) {
      const d = ML.l * e.feed * (m.reverse ? -1 : 1);
      mf.T = [mf.T[0], mf.T[1] - d];
    }
  }
  m.w = w1;
}
function sewSeg(tl, step, n, d, opt) {
  opt = opt || {};
  return tl.add(step, d, (st, u, raw) => {
    if (opt.rev) st.m.reverse = 1;
    st.m.pedal = opt.hand ? 0 : 1; st.m.footOnPedal = opt.hand ? st.m.footOnPedal : 1;
    turnWheel(st, 360 * n * raw);
    if (raw >= 1) { st.m.pedal = 0; if (opt.rev) st.m.reverse = 0; }
  });
}
function wheelSeg(tl, step, dw, d) { return tl.add(step, d, (st, u, raw) => { turnWheel(st, dw * raw); st.m.handOnWheel = raw < 1 ? 1 : 0; }); }
function footSeg(tl, step, to, d) { return tl.add(step, d || 0.8, (st, u) => { st.m.foot = to ? u : 1 - u; }); }
function pivotSeg(tl, step, deg, d) {
  return tl.add(step, d, (st, u) => {
    const mf = st.mf, N = [MX, MZ], loc = w2f(mf, N);
    mf.rot += deg * u;
    const c = Math.cos(mf.rot * DEG), s = Math.sin(mf.rot * DEG);
    mf.T = [N[0] - (c * loc[0] - s * loc[1]), N[1] - (s * loc[0] + c * loc[1])];
  });
}
function deriveMachine(st) {
  const m = st.m, mf = st.mf;
  m.needleY = needleTipY(m.w);
  m.feedUp = (() => { const p = ((m.w % 360) + 360) % 360; return p > 240 && p < 360 ? Math.sin((p - 240) / 120 * Math.PI) : 0; })();
  m.takeup = Math.cos((m.w - 25) * DEG);
  if (mf && mf.show) {
    mf.needleLocal = w2f(mf, [MX, MZ]);
    // pins come out before they reach the foot: each goes back to the pincushion
    mf.pinsNow = (mf.pins || []).map(pz => {
      const ahead = pz - mf.needleLocal[1];
      const out = clamp((0.055 - ahead) / 0.02, 0, 1);
      return { lz: pz, out };
    });
  }
  // the hands guide the fabric, away from the needle's path; the right hand takes each pin out
  if (mf && mf.pinsNow) { const pp = mf.pinsNow.find(p => p.out > 0 && p.out < 1); if (pp) { const w = f2w(mf, [0.012, pp.lz]); st.handR = { f: "world", p: mix([w[0], BED_Y + 0.008, w[1]], LAYOUT.machine.pincushion.map((v, i) => i === 1 ? v + 0.05 : v), ease(pp.out)), grip: 0.5, pinch: true }; } }
  st.stitches = mf ? mf.st : [];
}
function seamStart(tl) {
  tl.init = machineInit(() => ({ mf: { show: 1, T: [MX + 0.015, MZ - 0.05], rot: 0, st: [], pins: [0.04, 0.09, 0.14, 0.185], under: 0 } }));
}
BUILD["straight-seam"] = () => {
  const tl = TL("straight-seam", "machine"); seamStart(tl);
  tl.add(0, 2.2, (st, u) => { st.mf.pinShow = u; });
  tl.add(1, 2.0, (st, u) => { st.mf.T = [MX + 0.015, lerp(MZ - 0.05, MZ - 0.012, u)]; st.mf.under = u > 0.99 ? 1 : 0; });
  tl.add(2, 0.01, st => { st.mf.under = 1; });
  wheelSeg(tl, 2, 180, 1.8);
  footSeg(tl, 3, 1, 1.2);
  sewSeg(tl, 4, 18, 4.5);
  sewSeg(tl, 5, 38, 8.5);
  sewSeg(tl, 6, 4, 1.6);
  wheelSeg(tl, 6, 180, 1.2);
  footSeg(tl, 7, 0, 0.8);
  tl.add(7, 1.6, (st, u) => { st.mf.T = [st.mf.T[0], st.mf.T[1] - 0.05 * u]; st.mf.off = u; st.m.tails = 1 - u; });
  tl.derive = deriveMachine;
  return finish(tl, 8);
};
BUILD["backstitch-machine"] = () => {
  const tl = TL("backstitch-machine", "machine"); seamStart(tl);
  tl.add(0, 1.4, (st, u) => { st.mf.T = [MX + 0.015, lerp(MZ - 0.05, MZ - 0.022, u)]; st.mf.under = 1; });
  wheelSeg(tl, 0, 180, 1.2); footSeg(tl, 0, 1, 0.8);
  sewSeg(tl, 1, 4, 2.4);
  sewSeg(tl, 2, 4, 2.8, { rev: 1 });
  sewSeg(tl, 3, 40, 9);
  sewSeg(tl, 4, 4, 2.8, { rev: 1 });
  sewSeg(tl, 5, 7, 2.4);
  wheelSeg(tl, 5, 180, 0.9); footSeg(tl, 5, 0, 0.7);
  tl.derive = deriveMachine;
  return finish(tl, 6);
};
BUILD["pivot-corner"] = () => {
  const tl = TL("pivot-corner", "machine");
  tl.init = machineInit(() => ({ mf: { show: 1, T: [MX + 0.015, MZ - 0.12], rot: 0, st: [], pins: [], under: 1 }, m: { w: 180, foot: 1, reverse: 0, threadU: 1, bobbinIn: 1, tails: 0, pedal: 0, footOnPedal: 1 } }));
  // the seam has started earlier: stitches from lz = 0.012 to the needle
  tl.init0 = tl.init;
  tl.init = () => { const st = tl.init0(); for (let z = 0.012; z <= ML.Lh - 0.12 - 0.012 + 0.108 + 1e-9; z += ML.l) st.mf.st.push([-0.015, z]); return st; };
  sewSeg(tl, 0, 18, 5);
  sewSeg(tl, 1, 8, 4.2);
  tl.add(1, 0.01, null);
  footSeg(tl, 2, 0, 1.0);
  pivotSeg(tl, 3, -90, 3.2);
  footSeg(tl, 4, 1, 0.8);
  sewSeg(tl, 4, 16, 4.4);
  tl.derive = st => {
    deriveMachine(st);
    st.mf.corner = true;
  };
  tl.fix = st => st;
  return finish(tl, 5);
};
BUILD["seam-allowance"] = () => {
  const tl = TL("seam-allowance", "machine"); seamStart(tl);
  tl.init = machineInit(() => ({ mf: { show: 1, T: [MX + 0.04, MZ - 0.05], rot: 0, st: [], pins: [], under: 0 } }));
  tl.add(0, 2.4, (st, u) => { st.hl = { k: "allow", u }; });
  tl.add(1, 2.4, (st, u) => { st.hl = { k: "guide", u }; });
  tl.add(2, 2.4, (st, u) => { st.mf.T = [lerp(MX + 0.04, MX + 0.015, u), lerp(MZ - 0.05, MZ - 0.012, u)]; st.mf.under = u > 0.99 ? 1 : 0; st.hl = { k: "guide", u: 1 }; });
  tl.add(3, 0.01, st => { st.mf.under = 1; });
  wheelSeg(tl, 3, 180, 1.0); footSeg(tl, 3, 1, 0.7); sewSeg(tl, 3, 40, 9);
  wheelSeg(tl, 4, 180, 0.8); footSeg(tl, 4, 0, 0.6);
  tl.add(4, 2.6, (st, u) => { st.gauge = u; st.mf.T = [st.mf.T[0], st.mf.T[1] - 0.04 * u]; });
  tl.derive = deriveMachine;
  return finish(tl, 5);
};
BUILD["machine-parts"] = () => {
  const tl = TL("machine-parts", "machine", machineInit(() => ({ mf: { show: 0, T: [0, 0], rot: 0, st: [], pins: [] } })));
  const ks = ["spool", "tension", "takeup", "needle", "foot", "feed", "plate", "bobbin", "winder", "wheel", "selector", "pedal"];
  ks.forEach((k, i) => tl.add(i, 3.2, (st, u, raw) => {
    st.m.hl = k; st.hlU = u;
    if (k === "takeup" || k === "needle") turnWheel(st, 360 * raw);
    if (k === "foot") st.m.foot = Math.sin(raw * Math.PI);
    if (k === "feed") st.m.feedShow = 1, turnWheel(st, 360 * raw);
    if (k === "wheel") { turnWheel(st, 360 * raw); st.m.handOnWheel = raw < 1 ? 1 : 0; }
    if (k === "selector") st.m.dial = Math.sin(raw * Math.PI) * 40;
    if (k === "pedal") { st.m.pedal = Math.sin(raw * Math.PI) * 0.8; st.m.footOnPedal = 1; }
  }));
  tl.derive = st => { deriveMachine(st); };
  return finish(tl, 12);
};
BUILD["wind-bobbin"] = () => {
  const tl = TL("wind-bobbin", "machine", machineInit(() => ({ mf: { show: 0, T: [0, 0], rot: 0, st: [], pins: [] }, m: { w: 0, foot: 0, threadU: 0, bobbinIn: 0, tails: 0, winder: 0, wind: 0, bobbinFill: 0, onPin: 0, wpath: 0, wraps: 0, footOnPedal: 1, pedal: 0 } })));
  tl.add(0, 1.6, (st, u) => { st.m.footOnPedal = 1 - u; });
  tl.add(1, 2.0, (st, u) => { st.m.onPin = u; });
  tl.add(2, 2.6, (st, u) => { st.m.wpath = u; });
  tl.add(3, 2.0, (st, u) => { st.m.wraps = u; });
  tl.add(4, 1.4, (st, u) => { st.m.winder = u; });
  tl.add(5, 0.8, (st, u) => { st.m.footOnPedal = u; });
  tl.add(5, 5.5, (st, u, raw) => { st.m.pedal = raw < 0.92 ? 0.6 : 0; st.m.wind = raw * 40; st.m.bobbinFill = raw; st.m.handwheelFree = 1; });
  tl.add(6, 0.8, (st, u) => { st.m.footOnPedal = 1 - u; });
  tl.add(6, 1.2, (st, u) => { st.m.winder = 1 - u; });
  tl.add(6, 1.4, (st, u) => { st.m.snipW = u; });
  tl.derive = st => { deriveMachine(st); st.m.threadU = 0; };
  return finish(tl, 7);
};
BUILD["thread-machine"] = () => {
  const tl = TL("thread-machine", "machine", machineInit(() => ({ mf: { show: 0, T: [0, 0], rot: 0, st: [], pins: [] }, m: { w: 120, foot: 1, threadU: 0, bobbinIn: 0, bobbinLoop: 0, tails: 0, footOnPedal: 1, pedal: 0, spoolOn: 0 } })));
  // the stretch of the path each step threads (fractions of the path's points)
  tl.add(0, 1.0, (st, u) => { st.m.footOnPedal = 1 - u; });
  tl.add(0, 1.0, (st, u) => { st.m.foot = 1 - u; });
  wheelSeg(tl, 1, 240, 2.2);
  tl.add(2, 0.9, (st, u) => { st.m.spoolOn = u; });
  tl.add(2, 1.6, (st, u) => { st.m.threadU = lerp(0, 3, u) / 13; });
  tl.add(3, 3.0, (st, u) => { st.m.threadU = lerp(3, 8, u) / 13; });
  tl.add(4, 1.6, (st, u) => { st.m.threadU = lerp(8, 10, u) / 13; });
  tl.add(5, 1.8, (st, u) => { st.m.threadU = lerp(10, 12, u) / 13; });
  tl.add(6, 1.8, (st, u) => { st.m.threadU = lerp(12, 12.999, u) / 13; });
  tl.add(6, 0.01, (st, u) => { st.m.threadU = 1; });
  tl.add(7, 2.2, (st, u) => { st.m.bobbinIn = u; });
  tl.add(8, 0.01, null);
  wheelSeg(tl, 8, 360, 2.6);
  tl.par(8, 2.6, (st, u) => { st.m.bobbinLoop = Math.min(1, u * 1.6); });
  tl.add(9, 1.8, (st, u) => { st.m.tails = u; st.m.bobbinLoop = 1 - u; });
  tl.derive = st => { deriveMachine(st); st.m.threadDone = st.m.threadU >= 1; };
  return finish(tl, 10);
};
/* Press a seam on the ironing board (press-local: x along the seam, z across, y up from the board's top) */
BUILD["press-seam"] = () => {
  const tl = TL("press-seam", "press", () => ({ pr: { bOpen: 0, aA: 0, aB: 0, temp: 0, upright: 1, plugged: 1, steam: 0 }, iron: { x: -0.42, z: -0.02, lift: 0.0, upright: 1 } }));
  const at = (st, x, z, lift) => { st.iron.x = x; st.iron.z = z; st.iron.lift = lift; };
  tl.add(0, 2.4, (st, u) => { st.pr.temp = u; });
  // press as sewn: set down, lift, move, set down (three presses along the seam)
  const presses = (step, z, from, xs) => {
    let px = from;
    xs.forEach((x, i) => {
      tl.add(step, 0.9, (st, u) => { st.iron.upright = 0; at(st, lerp(px, x, u), z, 0.04 * Math.sin(u * Math.PI) + (i === 0 ? 0.03 * (1 - u) : 0)); });
      tl.add(step, 0.7, (st, u) => { at(st, x, z, 0); st.pr.steam = Math.sin(u * Math.PI); });
      px = x;
    });
    return px;
  };
  tl.add(1, 1.0, (st, u) => { st.iron.upright = 1 - u; at(st, lerp(-0.42, -0.1, u), lerp(-0.02, 0.004, u), 0.05 * (1 - u) + 0.02); });
  let px = presses(1, 0.004, -0.1, [-0.1, 0.0, 0.1]);
  tl.add(2, 1.0, (st, u) => { at(st, lerp(px, -0.42, u), lerp(0.004, -0.02, u), 0.05 * Math.sin(u * Math.PI)); st.iron.upright = u; });
  tl.add(2, 2.6, (st, u) => { st.pr.bOpen = u; st.pr.aA = 90 * u; st.pr.aB = 90 * u; });
  tl.add(2, 1.6, (st, u) => { st.pr.aA = 90 + 90 * u; st.pr.aB = 90 - 90 * u; st.pr.finger = u; });
  tl.add(3, 0.9, (st, u) => { st.iron.upright = 1 - u; at(st, lerp(-0.42, -0.1, u), lerp(-0.02, 0, u), 0.04 * (1 - u) + 0.02); });
  px = presses(3, 0, -0.1, [-0.1, 0.0, 0.1]);
  tl.add(4, 0.8, (st, u) => { at(st, lerp(px, 0.0, u), lerp(0, 0.06, u), 0.06 * Math.sin(u * Math.PI) + 0.02 * u); });
  tl.add(4, 1.6, (st, u) => { st.pr.aB = 180 * u; st.pr.side = u; });
  px = presses(4, -0.012, 0.0, [-0.1, 0.0, 0.1]);
  tl.add(5, 1.4, (st, u) => { at(st, lerp(px, -0.42, u), lerp(-0.012, -0.02, u), 0.05 * Math.sin(u * Math.PI)); st.iron.upright = u; });
  tl.add(6, 1.8, (st, u) => { st.pr.plugged = 1 - u; });
  tl.derive = st => {
    const ip = LAYOUT.press.board;
    st.look = [ip[0] + st.iron.x * 0.5, ip[1], ip[2]];
    st.handR = { f: "press", p: [st.iron.x + 0.03, 0.1 + st.iron.lift, st.iron.z], grip: 1, iron: true };
    if (st.pr.plugged < 1 && st.pr.plugged > 0) st.handR = { f: "press", p: [-0.6, 0.0, 0.2], grip: 0.8 };
    st.handL = st.pr.finger > 0 && st.pr.finger < 1 ? { f: "press", p: [0.0, 0.01, 0.02], grip: 0.1 } : { f: "press", p: [0.12, 0.004, 0.09], grip: 0.05 };
  };
  return finish(tl, 7);
};
/* Pin a pattern, cut, mark (table-local: x, z on the table top around LAYOUT.cut.cloth) */
const PAT = { w: 0.3, h: 0.22, r: 0.025, x0: -0.15, z0: -0.13 };   // the pattern piece, inside the folded cloth
function patternPath() {           // the cutting line, clockwise from the top left, as points every ~5 mm
  const { w, h, r, x0, z0 } = PAT, pts = [];
  const seg = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.005); for (let i = 0; i < n; i++) pts.push([lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]); };
  const arc = (c, a0) => { for (let i = 0; i < 6; i++) { const a = (a0 + i / 6 * 90) * DEG; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } };
  seg([x0 + r, z0], [x0 + w - r, z0]); arc([x0 + w - r, z0 + r], -90);
  seg([x0 + w, z0 + r], [x0 + w, z0 + h - r]); arc([x0 + w - r, z0 + h - r], 0);
  seg([x0 + w - r, z0 + h], [x0 + r, z0 + h]); arc([x0 + r, z0 + h - r], 90);
  seg([x0, z0 + h - r], [x0, z0 + r]); arc([x0 + r, z0 + r], 180);
  pts.push(pts[0].slice());
  return pts;
}
const PINS = [[-0.13, -0.11], [0.13, -0.11], [0.13, 0.07], [-0.13, 0.07], [0.0, -0.11], [0.0, 0.07], [-0.13, -0.02], [0.13, -0.02]];
BUILD["pin-pattern"] = () => {
  const tl = TL("pin-pattern", "cut", () => ({ cut: { fold: 0, pat: 0, measure: 0, pins: PINS.map(() => 0), spare: 0, s: 0, scrap: 0, show: 1, chalk: null, dots: 0 } }));
  tl.add(0, 2.6, (st, u) => { st.cut.fold = u; });
  tl.add(1, 2.4, (st, u) => { st.cut.pat = u; });
  tl.add(2, 3.2, (st, u) => { st.cut.measure = u; });
  tl.add(3, 1.6, (st, u) => { st.cut.pins[0] = u * 0.5; });
  tl.add(4, 1.6, (st, u) => { st.cut.pins[0] = 0.5 + u * 0.5; });
  for (let i = 1; i < PINS.length; i++) tl.add(5, 1.2, (st, u) => { st.cut.pins[i] = u; });
  tl.add(6, 1.8, (st, u) => { st.cut.spare = u; });
  tl.derive = st => {
    const c = st.cut, i = c.pins.findIndex(v => v > 0 && v < 1);
    const pc = LAYOUT.machine.pincushion, cc = LAYOUT.cut.cloth;
    const cushion = [pc[0] - cc[0], 0.04, pc[2] - cc[1]];
    if (i >= 0) { const p = PINS[i], v = c.pins[i], a = [p[0], 0.01, p[1]]; st.handR = { f: "cut", p: v < 0.5 ? mix(cushion, a, ease(v * 2)) : a, grip: 0.5, pinch: true }; }
    else if (c.measure > 0 && c.measure < 1) st.handR = { f: "cut", p: [c.measure < 0.5 ? -0.06 : 0.06, 0.01, 0.0], grip: 0.5, pinch: true };
    else if (c.spare > 0 && c.spare < 1) st.handR = { f: "cut", p: mix([0.2, 0.05, 0.12], cushion, ease(c.spare)), grip: 0.5, pinch: true };
    else st.handR = { f: "cut", p: [0.24, 0.005, 0.16], grip: 0.1 };
    st.handL = { f: "cut", p: [-0.06, 0.006, -0.02], grip: 0.05 };
  };
  return finish(tl, 7);
};
BUILD["cut-fabric"] = () => {
  const tl = TL("cut-fabric", "cut", () => ({ cut: { fold: 1, pat: 1, measure: 1, pins: PINS.map(() => 1), s: 0, scrap: 0, show: 1, notch: 0, shears: { s: 0, open: 0, closed: 1, hand: 0, down: 1 } } }));
  const path = patternPath(), N = path.length - 1;
  // the cut goes along the top edge, round the corner, down the right side
  const iCorner = path.findIndex(p => p[0] > PAT.x0 + PAT.w - 1e-4);
  tl.add(0, 2.0, (st, u) => { st.cut.hand = u; });
  tl.add(1, 2.0, (st, u) => { st.cut.shears.down = 1 - u; st.cut.shears.open = u; st.cut.shears.closed = 0; });
  const strokes = 7;
  for (let k = 0; k < strokes; k++) tl.add(2, 1.3, (st, u) => { st.cut.s = lerp(k, k + 1, u) / strokes * (iCorner / N); st.cut.shears.open = 1 - Math.sin(u * Math.PI) * 0.85; });
  tl.add(3, 2.2, (st, u) => { st.cut.s = lerp(iCorner - 3, iCorner + 3, u) / N; st.cut.shears.open = 1; st.cut.turn = u; });
  const more = 5, iEnd = path.findIndex((p, i) => i > iCorner && p[1] > PAT.z0 + PAT.h - PAT.r);
  for (let k = 0; k < more; k++) tl.add(3, 1.1, (st, u) => { st.cut.s = lerp(iCorner + 3 + (iEnd - iCorner - 3) * k / more, iCorner + 3 + (iEnd - iCorner - 3) * (k + 1) / more, u) / N; st.cut.shears.open = 1 - Math.sin(u * Math.PI) * 0.85; });
  tl.add(4, 2.4, (st, u) => { st.cut.notch = u; st.cut.shears.open = Math.sin(u * Math.PI * 2) * 0.3 + 0.3; });
  tl.add(5, 1.2, (st, u) => { st.cut.shears.open = 0.3 * (1 - u); st.cut.shears.closed = u; });
  tl.add(5, 2.2, (st, u) => { st.cut.shears.hand = u; });
  tl.derive = st => {
    const c = st.cut, s = c.s * N, i = Math.floor(s), f = s - i;
    const p = path[Math.min(i, N)], q = path[Math.min(i + 1, N)];
    const at = [lerp(p[0], q[0], f), lerp(p[1], q[1], f)];
    const tng = Math.atan2(q[1] - p[1], q[0] - p[0]);
    c.at = at; c.yaw = tng; c.path = path; c.N = N;
    const sh = c.shears;
    sh.p = sh.hand > 0 ? mix([at[0], 0.02, at[1]], [0.05, 0.12, 0.3], ease(sh.hand)) : sh.down > 0 ? mix([at[0] + 0.04, 0.005, at[1] - 0.02], [0.33, 0.005, 0.12], sh.down) : [at[0], 0.012, at[1]];
    sh.yaw = sh.hand > 0 ? lerp(tng, Math.PI / 2, sh.hand) : tng;
    if (c.notch > 0) { const nz = PAT.z0 + PAT.h * 0.5; sh.p = [PAT.x0 + PAT.w + 0.006, 0.012, nz]; sh.yaw = Math.PI; }
    st.handR = { f: "cut", p: add(sh.p, [0.0, 0.03, 0.05]), grip: 1 };
    st.handL = { f: "cut", p: [at[0] - 0.08 * Math.cos(tng) + 0.05 * Math.sin(tng), 0.006, at[1] - 0.08 * Math.sin(tng) - 0.06], grip: 0.05 };
    if (c.hand < 1 && !c.s) st.handL.p = mix([-0.2, 0.08, 0.2], st.handL.p, ease(c.hand || 0));
  };
  return finish(tl, 6);
};
BUILD["mark-fabric"] = () => {
  const tl = TL("mark-fabric", "cut", () => ({ cut: { fold: 1, pat: 0, measure: 1, pins: PINS.map(() => 0), s: 0, scrap: 1, show: 1, single: 1, test: 0, ruler: 0, chalk: 0, dots: 0, brush: 0 } }));
  tl.add(0, 2.4, (st, u) => { st.cut.test = u; });
  tl.add(1, 2.2, (st, u) => { st.cut.ruler = u; });
  tl.add(2, 3.0, (st, u) => { st.cut.chalk = u; });
  tl.add(3, 2.6, (st, u) => { st.cut.dots = u; });
  tl.add(4, 2.2, (st, u) => { st.cut.brush = u; });
  tl.derive = st => {
    const c = st.cut;
    const lineZ = PAT.z0 + 0.015, x0 = PAT.x0 + 0.02, x1 = PAT.x0 + PAT.w - 0.02;
    c.lineZ = lineZ; c.lx = [x0, x1];
    let p;
    if (c.test > 0 && c.test < 1) p = [0.25 + 0.02 * Math.sin(c.test * 6), 0.006, 0.17];
    else if (c.chalk > 0 && c.chalk < 1) p = [lerp(x0, x1, c.chalk), 0.006, lineZ + 0.002];
    else if (c.dots > 0 && c.dots < 1) { const k = Math.min(2, Math.floor(c.dots * 3)); p = [-0.08 + k * 0.08, 0.006 + 0.01 * Math.abs(Math.sin(c.dots * 3 * Math.PI)), 0.0]; }
    else if (c.brush > 0 && c.brush < 1) p = [lerp(x0, x1, c.brush), 0.01, lineZ];
    else p = [0.26, 0.01, 0.16];
    c.chalkP = p;
    st.handR = { f: "cut", p: add(p, [0, 0.025, 0.012]), grip: 0.8, pinch: true };
    st.handL = { f: "cut", p: c.ruler > 0 ? [0, 0.012, lineZ - 0.03] : [-0.18, 0.006, 0.05], grip: 0.05 };
  };
  return finish(tl, 5);
};

/* ═════════════ checks' helpers: what the finished stitches look like ═════════════ */
const timelines = {};
function timeline(id) { return timelines[id] || (timelines[id] = BUILD[id]()); }
function legs(nodes) {
  const out = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1];
    if (a.L === b.L && LEGGY[a.L]) {
      const l = Math.hypot(b.x - a.x, b.z - a.z);
      if (l > 0.0003) out.push({ L: a.L, a: [a.x, a.z], b: [b.x, b.z], len: l });
    }
  }
  return out;
}
function finalPattern(id) {
  const tl = timeline(id);
  if (tl.station === "machine") {
    const st = sample(tl, tl.dur);
    return { kind: "machine", stitches: st.stitches.map(p => p.slice()), top: Math.max(0, st.stitches.length - 1), bobbin: Math.max(0, st.stitches.length - 1) };
  }
  const st = sample(tl, tl.dur);
  if (!st.nodes) return { kind: "none" };
  const L = legs(st.nodes);
  const pens = [], wraps = [];
  for (let i = 0; i < st.nodes.length - 1; i++) {
    const a = st.nodes[i], b = st.nodes[i + 1];
    if (a.x === b.x && a.z === b.z && a.L !== b.L) {
      if (CLOTH[a.L] && CLOTH[b.L]) pens.push({ x: a.x, z: a.z, from: a.L, to: b.L });
      if (a.L === "E" || b.L === "E") wraps.push(a.x);
    }
  }
  return { kind: "hand", front: L.filter(l => l.L === "F"), back: L.filter(l => l.L === "B"), over: L.filter(l => l.L === "BT"), inside: L.filter(l => l.L === "I" || l.L === "IF"),
    pens, wraps: wraps.length / 2, shank: st.nodes.filter(n => n.L === "W").length, loop: st.nodes.filter(n => n.L === "U").length, knots: st.nodes.filter(n => n.L === "K").length + (st.endKnot ? 1 : 0) };
}
/* every place the thread goes through the cloth must be a place the needle went through first */
function needleCheck(id, samples) {
  const tl = timeline(id), H = tl.track;
  if (!H) return { ok: true, n: 0, bad: [] };
  const bad = [];
  const N = samples || 120;
  const passedAt = (s) => H.evs.filter(e => e.s <= s + 1e-7).map(e => { const p = H.sp.pts[H.sp.cs.indexOf(e.s)] || pathAt(H.sp, e.s); return p; });
  for (let i = 0; i <= N; i++) {
    const st = sample(tl, tl.dur * i / N);
    const holes = [];
    // the needle's tip has passed these points of its track: every place on the track where it went through the cloth
    const sp = H.sp, upTo = st.tipS;
    for (let k = 1; k < sp.pts.length && sp.s[k] <= upTo; k++) {
      const r0 = region(sp.pts[k - 1], H.kind), r1 = region(sp.pts[k], H.kind);
      if (r0 !== r1 && (r0 === "in" || r1 === "in")) holes.push(sp.pts[k]);
    }
    // pre-made stitches (tie-off) were made by a needle earlier: their holes count
    if (tl.pre) tl.pre(st).forEach(n => { if (CLOTH[n.L]) holes.push([n.x, 0, n.z]); });
    for (const line of st.threads || []) {
      for (let k = 1; k < line.length; k++) {
        const a = line[k - 1], b = line[k], ra = region(a, H.kind), rb = region(b, H.kind);
        const crosses = (ra === "a" && rb === "b") || (ra === "b" && rb === "a") || ra === "in" || rb === "in";
        if (!crosses) continue;
        const m = mix(a, b, 0.5);
        const near = holes.some(h => Math.hypot(h[0] - m[0], h[2] - m[2]) < 0.0022);
        if (!near) bad.push({ t: +st.t.toFixed(2), at: [+m[0].toFixed(4), +m[1].toFixed(4), +m[2].toFixed(4)] });
      }
    }
  }
  return { ok: !bad.length, n: N + 1, bad: bad.slice(0, 5) };
}

/* ═════════════ the page ═════════════ */
const ORDER = WORDS.ORDER, MOVES = {};
WORDS.MOVES.forEach(m => { MOVES[m.id] = m; });
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const KEY = "aog.sewing.v1";
let S;
try { S = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
if (!S || typeof S !== "object") { S = { lang: "en", move: "running-stitch", cam: "close", speed: 1, progress: {} }; try { if (localStorage.getItem("aog.lang") === "es") S.lang = "es"; } catch (e) {} }
if (!S.progress) S.progress = {};
if (!MOVES[S.move]) S.move = "running-stitch";
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
const $ = id => document.getElementById(id);
const es = () => S.lang === "es";
const L = (en, sp) => es() ? sp : en;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const P = { t: 0, playing: false, t0: 0, from: 0, to: 0, raf: 0, tl: null, flip: null, renders: 0 };

function cur() { return MOVES[S.move]; }
function words() {
  document.documentElement.lang = S.lang;
  document.title = L("The Sewing Room", "El Taller de Costura") + " — Architecture of Grace";
  $("brand").textContent = L("The Sewing Room", "El Taller de Costura");
  $("mastK").textContent = L("Family & Consumer Sciences · sewing", "Ciencias de la Familia y del Consumidor · costura");
  $("mastH").textContent = L("The Sewing Room", "El Taller de Costura");
  $("mastL").textContent = L("Watch each stitch up close, step by step, then try it with your own needle.", "Mira cada puntada de cerca, paso a paso, y luego pruébala con tu aguja.");
  $("langBtn").textContent = es() ? "EN" : "ES";
  $("themeBtn").textContent = document.documentElement.getAttribute("data-theme") === "dark" ? L("Light", "Claro") : L("Dark", "Oscuro");
  $("nav").innerHTML = `<a href="/kitchen">${L("Kitchen & Sewing Table", "Cocina y mesa de costura")}</a>`;
  $("foot").textContent = L("Architecture of Grace · The Sewing Room · Needles and pins live in the pincushion. Children sew and iron with a grown-up nearby.",
    "Architecture of Grace · El Taller de Costura · Las agujas y los alfileres viven en el alfiletero. Los niños cosen y planchan con un adulto cerca.");
}
function moveMenu() {
  const sel = $("moveSel");
  sel.innerHTML = WORDS.GROUPS.map(g => `<optgroup label="${esc(L(g.en, g.es))}">` +
    WORDS.MOVES.filter(m => m.g === g.id).map(m => `<option value="${m.id}"${m.id === S.move ? " selected" : ""}>${esc((es() ? m.es : m.en).n)}</option>`).join("") + "</optgroup>").join("");
  $("moveLab").textContent = L("Move", "Movimiento");
  const cam = $("camSel");
  const cams = [["close", "Close on the hands", "De cerca en las manos"], ["shoulder", "Over the shoulder", "Por encima del hombro"], ["across", "Across the table", "Desde el otro lado"], ["orbit", "Walk around (drag)", "Dar la vuelta (arrastra)"]];
  cam.innerHTML = cams.map(c => `<option value="${c[0]}"${c[0] === S.cam ? " selected" : ""}>${esc(L(c[1], c[2]))}</option>`).join("");
  $("camLab").textContent = L("View", "Vista");
  const sp = $("speedSel");
  sp.innerHTML = [[1, "Normal", "Normal"], [0.5, "Slow", "Lento"], [0.25, "Very slow", "Muy lento"]].map(s => `<option value="${s[0]}"${+S.speed === s[0] ? " selected" : ""}>${esc(L(s[1], s[2]))}</option>`).join("");
  $("speedLab").textContent = L("Speed", "Velocidad");
}
function prog(id) { return S.progress[id] || 0; }
function panel() {
  const m = cur(), c = es() ? m.es : m.en, p = prog(m.id);
  const tools = m.tools.map(k => WORDS.TOOLS[k] ? (es() ? WORDS.TOOLS[k][1] : WORDS.TOOLS[k][0]) : k);
  const safe = (m.safe || []).map(k => es() ? WORDS.SAFE[k][1] : WORDS.SAFE[k][0]);
  const hasBack = !!m.result || ["straight-seam", "backstitch-machine", "pivot-corner", "seam-allowance", "press-seam"].includes(m.id);
  const lv = [["Learning", "Aprendiendo"], ["I can do it slowly", "Lo hago despacio"], ["I can do it neatly", "Lo hago con cuidado"]];
  $("panel").innerHTML = `
    <p class="kicker">${esc(L(WORDS.GROUPS.find(g => g.id === m.g).en, WORDS.GROUPS.find(g => g.id === m.g).es))}</p>
    <h2 id="mvName">${esc(c.n)}</h2>
    <p class="say">${esc(c.d)}</p>
    <ol class="steps" id="steps">${c.steps.map((s, i) => `<li data-k="${i}"><button type="button" class="stepbtn" data-step="${i}">${esc(s)}</button></li>`).join("")}</ol>
    <div class="note warn" id="safety"><b>${esc(L("Safe hands", "Manos seguras"))}</b>${safe.length ? safe.map(s => `<span class="sl">${esc(s)}</span>`).join("") : `<span class="sl">${esc(L("Keep the chalk and ruler on the table when you are not using them.", "Deja la tiza y la regla en la mesa cuando no las uses."))}</span>`}</div>
    <p class="note good"><b>${esc(L("What helps", "Lo que ayuda"))}</b> ${esc(c.tip)}</p>
    <p class="muted tools"><b>${esc(L("You need", "Necesitas"))}:</b> ${esc(tools.join(" · "))}</p>
    ${hasBack ? `<div class="result" id="result"><h3>${esc(L("The finished stitches", "Las puntadas terminadas"))}</h3>${resultSVG(m.id)}</div>` : ""}
    <div class="track" role="group" aria-label="${esc(L("My practice", "Mi práctica"))}">
      <h3>${esc(L("My practice", "Mi práctica"))}</h3>
      <div class="seg">${lv.map((x, i) => `<button type="button" data-prog="${i + 1}" aria-pressed="${p === i + 1}">${esc(L(x[0], x[1]))}</button>`).join("")}</div>
      <p class="muted small">${esc(L("Saved on this device only.", "Se guarda solo en este equipo."))}</p>
    </div>`;
  $("panel").querySelectorAll("[data-prog]").forEach(b => b.onclick = () => { const v = +b.dataset.prog; S.progress[m.id] = S.progress[m.id] === v ? 0 : v; save(); panel(); lightStep(); });
  $("panel").querySelectorAll("[data-step]").forEach(b => b.onclick = () => showStep(+b.dataset.step));
  $("backBtn").hidden = !hasBack;
  backBtnWords();
  lightStep();
}
/* the finished stitches, front and back, drawn from the engine's own result (no 3D needed) */
function resultSVG(id) {
  const tl = timeline(id);
  const fp = finalPattern(id);
  const W = 300, H2 = 70;
  const box = (title, body) => `<figure class="rs"><figcaption>${esc(title)}</figcaption><svg viewBox="0 0 ${W} ${H2}" role="img" aria-label="${esc(title)}">${body}</svg></figure>`;
  if (fp.kind === "machine") {
    const pts = fp.stitches; if (!pts.length) return "";
    const xs = pts.map(p => p[1]), ys = pts.map(p => p[0]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys, -0.015), y1 = Math.max(...ys, -0.015);
    const sx = (W - 40) / Math.max(0.02, x1 - x0, y1 - y0 + 0.02);
    const X = p => 20 + (p[1] - x0) * sx, Y = p => H2 / 2 + (p[0] - (y0 + y1) / 2) * sx * -1;
    const line = (col) => pts.map((p, i) => i ? `<line x1="${X(pts[i - 1]).toFixed(1)}" y1="${Y(pts[i - 1]).toFixed(1)}" x2="${X(p).toFixed(1)}" y2="${Y(p).toFixed(1)}" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>` : "").join("");
    return `<div class="rsrow">${box(L("Top: the red top thread", "Arriba: el hilo rojo de arriba"), `<rect width="${W}" height="${H2}" rx="10" class="cloth"/>${line("var(--th-top)")}`)}${box(L("Under: the blue bobbin thread", "Abajo: el hilo azul de la bobina"), `<rect width="${W}" height="${H2}" rx="10" class="cloth2"/>${line("var(--th-bob)")}`)}</div>`;
  }
  if (fp.kind !== "hand") return "";
  const all = fp.front.concat(fp.back, fp.over);
  if (!all.length) return "";
  const xs = all.flatMap(l => [l.a[0], l.b[0]]), zs = all.flatMap(l => [l.a[1], l.b[1]]);
  const x0 = Math.min(...xs) - 0.004, x1 = Math.max(...xs) + 0.004, z0 = Math.min(...zs) - 0.004, z1 = Math.max(...zs) + 0.004;
  const sc = Math.min((W - 30) / (x1 - x0), (H2 - 20) / Math.max(0.006, z1 - z0));
  const X = x => W / 2 + (x - (x0 + x1) / 2) * sc * -1, Y = z => H2 / 2 + (z - (z0 + z1) / 2) * sc;
  const draw = (ls, cls) => ls.map(l => `<line x1="${X(l.a[0]).toFixed(1)}" y1="${Y(l.a[1]).toFixed(1)}" x2="${X(l.b[0]).toFixed(1)}" y2="${Y(l.b[1]).toFixed(1)}" class="${cls}"/>`).join("");
  let edge = "";
  if (["whipstitch", "blanket-stitch"].includes(id)) edge = `<line x1="0" x2="${W}" y1="${Y(EDGE).toFixed(1)}" y2="${Y(EDGE).toFixed(1)}" class="edge"/>`;
  if (id === "slip-stitch") edge = `<line x1="0" x2="${W}" y1="${Y(0.0012).toFixed(1)}" y2="${Y(0.0012).toFixed(1)}" class="edge"/>`;
  let btn = "";
  if (id === "sew-button") btn = `<circle cx="${X(BTN.c[0]).toFixed(1)}" cy="${Y(BTN.c[1]).toFixed(1)}" r="${(BTN.r * sc).toFixed(1)}" class="btn4"/><circle cx="${X(BTN.sc[0]).toFixed(1)}" cy="${Y(BTN.sc[1]).toFixed(1)}" r="${(0.0075 * sc).toFixed(1)}" class="btn4"/>`;
  const mirror = (ls) => ls.map(l => ({ a: [-l.a[0] + (x0 + x1), l.a[1]], b: [-l.b[0] + (x0 + x1), l.b[1]] }));
  const front = box(L("Front", "Derecho"), `<rect width="${W}" height="${H2}" rx="10" class="cloth"/>${edge}${btn}${draw(fp.front, "th")}${draw(fp.over, "th")}`);
  const back = box(L("Back (turned over)", "Revés (volteado)"), `<rect width="${W}" height="${H2}" rx="10" class="cloth2"/>${edge}${draw(mirror(fp.back), "th")}`);
  return `<div class="rsrow">${front}${back}</div>`;
}
function lightStep() {
  const k = P.st ? P.st.step : 0;
  document.querySelectorAll("#steps li").forEach((li, i) => { const on = i === k; if (li.classList.contains("on") !== on) li.classList.toggle("on", on); });
  const m = cur(), c = es() ? m.es : m.en;
  $("stepNow").textContent = L("Step ", "Paso ") + (k + 1) + L(" of ", " de ") + c.steps.length + " · " + c.steps[k];
  $("goBtn").textContent = P.playing ? L("Pause", "Pausa") : L("Go", "Empezar");
  $("goBtn").setAttribute("aria-label", P.playing ? L("Pause", "Pausa") : L("Play the whole move once", "Ver todo el movimiento una vez"));
}
function backBtnWords() {
  const on = P.flip != null ? P.flip : (P.st && P.st.work && P.st.work.flip > 0.5);
  $("backBtn").textContent = L("Show the back of the fabric", "Ver el revés de la tela");
  $("backBtn").setAttribute("aria-pressed", on ? "true" : "false");
}
/* ── the player ── */
function scene(t) {
  P.t = clamp(t, 0, P.tl.dur);
  P.st = sample(P.tl, P.t);
  if (P.flip != null) {
    if (P.st.work) P.st.work.flip = P.flip ? 1 : 0;
    P.st.showBack = P.flip ? 1 : 0;
  }
  $("scrub").value = String(Math.round(P.t / P.tl.dur * 1000));
  lightStep();
  draw();
}
function stop() { P.playing = false; if (P.raf) cancelAnimationFrame(P.raf); P.raf = 0; lightStep(); }
function playRange(from, to) {
  stop(); P.flip = null; backBtnWords();
  if (REDUCE) { scene(to); return; }
  P.from = from; P.to = to; P.t0 = performance.now(); P.playing = true; scene(from);
  const tick = now => {
    if (!P.playing) return;
    const t = P.from + (now - P.t0) / 1000 * (+S.speed || 1);
    if (t >= P.to) { P.playing = false; P.raf = 0; scene(P.to); return; }
    scene(t); P.raf = requestAnimationFrame(tick);
  };
  P.raf = requestAnimationFrame(tick);
}
function go() {
  if (P.playing) { stop(); return; }
  const from = P.t >= P.tl.dur - 1e-6 ? 0 : P.t;
  playRange(from, P.tl.dur);
}
function stepIndexAt(t) { let k = 0; P.tl.steps.forEach((r, i) => { if (r && r[0] <= t + 1e-6) k = i; }); return k; }
function next() {
  // ▶ plays the next step once (or the current one, if it has not been played to its end)
  const k = stepIndexAt(P.t), r = P.tl.steps[k];
  if (P.t < r[1] - 1e-6 && P.t > r[0] + 1e-6) { playRange(P.t, r[1]); return; }
  const kk = P.t >= r[1] - 1e-6 ? k + 1 : k;
  if (kk >= P.tl.steps.length) return;
  playRange(P.tl.steps[kk][0], P.tl.steps[kk][1]);
}
function prev() {
  stop(); P.flip = null;
  const k = stepIndexAt(P.t), r = P.tl.steps[k];
  const target = P.t > r[1] - 1e-6 && k >= 0 ? k : k - 1;
  if (target < 0) { scene(0); return; }
  scene(P.tl.steps[target][1] - 1e-4);
}
function showStep(k) { stop(); P.flip = null; const r = P.tl.steps[k]; scene(r[1] - 1e-4); }
function openMove(id, push) {
  stop();
  if (!MOVES[id]) id = "running-stitch";
  S.move = id; save();
  if (push && location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
  P.tl = timeline(id); P.flip = null;
  $("moveSel").value = id;
  panel();
  scene(0);
}
/* ── the 3D room ── */
let G3 = null, G3state = "";
function load3D() {
  if (G3state) return;
  G3state = "loading";
  $("loading").hidden = false;
  import("/aog-sewing3d.js").then(m => m.create({ host: $("stage"), engine: ENGINE, dark: () => document.documentElement.getAttribute("data-theme") === "dark",
      onCam: k => { S.cam = k; save(); $("camSel").value = k; } }))
    .then(g => { G3 = g; G3state = "ready"; $("loading").hidden = true; G3.setCam(S.cam || "close"); draw(); })
    .catch(err => { G3state = "failed"; console.warn("Sewing room 3D:", err); $("loading").textContent = L("The 3D room could not start on this device. The steps still work.", "La sala en 3D no pudo iniciar en este equipo. Los pasos siguen funcionando."); });
}
function draw() {
  $("stageDesc").textContent = $("stepNow").textContent;
  if (G3) G3.render(P.st);
}
const ENGINE = { LAYOUT, LT, T, CL, NL, FX, FZ, EDGE, BH, PIN, BTN, PAT, PINS, ML, surf, topOf, nodePt, f2w, w2f, needleTipY, patternPath, routeLines, region };
function wire() {
  $("goBtn").onclick = go; $("nextBtn").onclick = next; $("prevBtn").onclick = prev;
  $("scrub").oninput = () => { stop(); P.flip = null; scene(+$("scrub").value / 1000 * P.tl.dur); };
  $("moveSel").onchange = () => openMove($("moveSel").value, true);
  $("camSel").onchange = () => { S.cam = $("camSel").value; save(); if (G3) { G3.setCam(S.cam); draw(); } };
  $("speedSel").onchange = () => { S.speed = +$("speedSel").value; save(); };
  $("backBtn").onclick = () => {
    stop();
    const on = P.flip != null ? !P.flip : !(P.st && P.st.work && P.st.work.flip > 0.5) && !(P.st && P.st.showBack);
    P.flip = on;
    scene(P.tl.dur);
    backBtnWords();
  };
  $("langBtn").onclick = () => { S.lang = es() ? "en" : "es"; save(); try { localStorage.setItem("aog.lang", S.lang); } catch (e) {} words(); moveMenu(); panel(); scene(P.t); };
  $("themeBtn").onclick = () => {
    const nx = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nx); document.documentElement.classList.toggle("dark", nx === "dark");
    try { localStorage.setItem("aog.interior.ws.v1.theme", nx); } catch (e) {}
    words();
  };
  new MutationObserver(() => { if (G3) { G3.setDark(document.documentElement.getAttribute("data-theme") === "dark"); draw(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  let rz = 0;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (G3 && G3.resize()) draw(); }, 120); });
  window.addEventListener("hashchange", () => { const k = location.hash.slice(1); if (MOVES[k] && k !== S.move) openMove(k, false); });
  window.addEventListener("pagehide", () => { if (G3) { G3.dispose(); G3 = null; G3state = ""; } });
}
window.AOGSewing = { ENGINE, BUILD, timeline, sample, finalPattern, needleCheck, legs, ORDER, MOVES, P, state: S, open: id => openMove(id, true), go, next, prev,
  G3: () => G3, G3state: () => G3state, scene };
if (!$("panel")) return;   // the engine alone (for checks)
words(); moveMenu(); wire();
const start = location.hash.slice(1);
openMove(MOVES[start] ? start : S.move, !!MOVES[start]);
// the words are up; the 3D room comes right after, without holding them back
(window.requestIdleCallback || (f => setTimeout(f, 60)))(() => load3D(), { timeout: 400 });
})();
