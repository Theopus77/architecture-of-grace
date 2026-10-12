/* The shared 3D person (AOG-FIGURE3D-V1, 2026-10-12)
   Jimmy: "I want more realism, not sharp straight lines." "Hit the ceiling."
   One smooth body, skinned to a real joint hierarchy, so knees, elbows, hips and shoulders bend without seams.
   Every part is turned from a measured profile (thigh, calf with its muscle curve, forearm taper, wrist; a torso with
   chest, waist and hips), the clothes are cut a little larger than the body with soft folds, hems and cuffs, and the
   hands have jointed fingers and a thumb. No faces: a head is smooth skin, hair and ears.
   Used by the Skate Lab, the Dojo, the Kitchen and the Sewing Room (see _work/engine3d/CONTRACT.md).

   import { makeFigure, JOINTS, REST } from "/aog-figure3d.js";
   const fig = makeFigure({ outfit: "skate" | "gi" | "plain" | "apron", belt, colors, quality: "phone" | "full" });
   Units are meters; the figure faces +z, its left is +x, it stands on y = 0. Angles in degrees.
   pose = { root: { pos, rot (YXZ) }, j: { joint: [x, y, z] (XYZ) }, grip: { L, R } (0…1), pinch: { L, R } (bool) }
   fig.root is yours to place; a pose moves the body inside it. A joint left out of a pose takes its REST value. */
import * as THREE from "/vendor/three-0.160.0/three.module.min.js";

export const JOINTS = ["pelvis", "spine", "chest", "neck", "head", "clavL", "shoulderL", "elbowL", "wristL", "clavR", "shoulderR", "elbowR", "wristR",
  "hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"];
const PARENT = { pelvis: null, spine: "pelvis", chest: "spine", neck: "chest", head: "neck" };
["L", "R"].forEach(s => Object.assign(PARENT, { ["clav" + s]: "chest", ["shoulder" + s]: "clav" + s, ["elbow" + s]: "shoulder" + s, ["wrist" + s]: "elbow" + s,
  ["hip" + s]: "pelvis", ["knee" + s]: "hip" + s, ["ankle" + s]: "knee" + s, ["toe" + s]: "ankle" + s }));
// where each joint sits in the figure's own space at rest (left side; the right is the mirror image)
const AT = { pelvis: [0, 0.97, 0], spine: [0, 1.07, 0], chest: [0, 1.25, 0], neck: [0, 1.47, -0.01], head: [0, 1.545, 0],
  clavL: [0.03, 1.42, -0.01], shoulderL: [0.19, 1.41, -0.01], elbowL: [0.19, 1.12, -0.01], wristL: [0.19, 0.87, -0.01],
  hipL: [0.09, 0.92, 0], kneeL: [0.09, 0.5, 0], ankleL: [0.09, 0.08, 0], toeL: [0.09, 0.025, 0.135] };
Object.keys(AT).forEach(k => { if (k.endsWith("L")) { const a = AT[k]; AT[k.slice(0, -1) + "R"] = [-a[0], a[1], a[2]]; } });

const deepFreeze = o => { Object.values(o).forEach(v => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
export const REST = deepFreeze({ root: { pos: [0, 0, 0], rot: [0, 0, 0] },
  j: { shoulderL: [0, 0, 5], shoulderR: [0, 0, -5], elbowL: [-10, 0, 0], elbowR: [-10, 0, 0] } });
export const HEIGHT = 1.73;

const D2R = Math.PI / 180, TAU = Math.PI * 2;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const spow = (v, e) => (v < 0 ? -1 : 1) * Math.pow(Math.abs(v), e);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/* ── a smooth curve through keyed values (monotone cubic, so no wobbles or overshoot) ── */
function keyCurve(keysIn) {
  const keys = keysIn.slice().sort((a, b) => a[0] - b[0]), n = keys.length, m = keys[0].length;
  const tan = keys.map((k, i) => {
    const t = [0];
    for (let c = 1; c < m; c++) {
      const a = i < n - 1 ? (keys[i + 1][c] - k[c]) / (keys[i + 1][0] - k[0]) : null;
      const b = i > 0 ? (k[c] - keys[i - 1][c]) / (k[0] - keys[i - 1][0]) : null;
      t.push(a === null ? b : b === null ? a : (a * b <= 0 ? 0 : 2 * a * b / (a + b)));
    }
    return t;
  });
  const out = new Array(m);
  const f = s => {
    let i = 0;
    if (s <= keys[0][0]) { for (let c = 0; c < m; c++) out[c] = keys[0][c]; out[0] = s; return out; }
    if (s >= keys[n - 1][0]) { for (let c = 0; c < m; c++) out[c] = keys[n - 1][c]; out[0] = s; return out; }
    while (i < n - 2 && s > keys[i + 1][0]) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], t = (s - k0[0]) / h, t2 = t * t, t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
    out[0] = s;
    for (let c = 1; c < m; c++) out[c] = h00 * k0[c] + h10 * h * tan[i][c] + h01 * k1[c] + h11 * h * tan[i + 1][c];
    return out;
  };
  f.min = keys[0][0]; f.max = keys[n - 1][0];
  return f;
}

/* ── a turned surface: rings of a (super)ellipse along an axis. keys: [s, rx, rFront, rBack, cx, cz, n] ──
   map(a, s, b, out) places a ring point (a across, b front/back) in the figure's space. */
function makeSurf(keys, map) {
  const c = keyCurve(keys.map(k => [k[0], k[1], k[2], k[3], k[4] || 0, k[5] || 0, k[6] || 2]));
  const S = (th, s, d, out) => {
    const v = c(s), e = 2 / v[6], sn = Math.sin(th), cs = Math.cos(th);
    const a = v[4] + Math.max(v[1] + d, 0.0003) * spow(sn, e);
    const b = v[5] + Math.max((cs > 0 ? v[2] : v[3]) + d, 0.0003) * spow(cs, e);
    return map(a, s, b, out || new THREE.Vector3());
  };
  S.min = c.min; S.max = c.max; S.curve = c;
  return S;
}
const vertMap = (x0, z0, sx) => (a, s, b, o) => o.set(x0 + sx * a, s, z0 + b);
const frameMap = (O, D, A, B) => (a, s, b, o) => o.set(O.x + D.x * s + A.x * a + B.x * b, O.y + D.y * s + A.y * a + B.y * b, O.z + D.z * s + A.z * a + B.z * b);

/* ── a grid of points → smooth geometry; the seam of a closed ring is welded in the normals ── */
function gridGeo(rows, cols, closed, P, UV, outward) {
  const nc = closed ? cols + 1 : cols, pos = new Float32Array(rows * nc * 3), uv = new Float32Array(rows * nc * 2), v = new THREE.Vector3();
  const extra = new Float32Array(rows * nc);
  for (let i = 0; i < rows; i++) for (let j = 0; j < nc; j++) {
    const k = i * nc + j, r = P(i, closed ? j % cols : j, v, j); pos[k * 3] = v.x; pos[k * 3 + 1] = v.y; pos[k * 3 + 2] = v.z;
    if (typeof r === "number") extra[k] = r;
    const t = UV(i, j); uv[k * 2] = t[0]; uv[k * 2 + 1] = t[1];
  }
  const idx = [];
  for (let i = 0; i < rows - 1; i++) for (let j = 0; j < nc - 1; j++) {
    const a = i * nc + j, b = a + 1, c = a + nc, d = c + 1; idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const nr = g.attributes.normal.array;
  if (closed) for (let i = 0; i < rows; i++) {
    const a = i * nc * 3, b = (i * nc + cols) * 3;
    for (let q = 0; q < 3; q++) { const m = (nr[a + q] + nr[b + q]) / 2; nr[a + q] = nr[b + q] = m; }
    v.set(nr[a], nr[a + 1], nr[a + 2]).normalize(); nr[a] = nr[b] = v.x; nr[a + 1] = nr[b + 1] = v.y; nr[a + 2] = nr[b + 2] = v.z;
  }
  // make the normals point outward (the right side is a mirror image, so the winding can come out inside out)
  const mid = Math.floor(rows / 2), o = new THREE.Vector3(); let score = 0;
  for (let j = 0; j < nc; j++) { const k = mid * nc + j; outward(mid, closed ? j % cols : j, o); score += o.x * nr[k * 3] + o.y * nr[k * 3 + 1] + o.z * nr[k * 3 + 2]; }
  if (score < 0) {
    const ia = g.index.array; for (let q = 0; q < ia.length; q += 3) { const t = ia[q + 1]; ia[q + 1] = ia[q + 2]; ia[q + 2] = t; }
    for (let q = 0; q < nr.length; q++) nr[q] = -nr[q];
  }
  g.userData.s = extra; g.userData.cols = nc;
  return g;
}

/* ── a shell over a turned surface: from s0(θ) to s1(θ), lifted d(θ, s) off it, with rolled cloth edges (lips) ── */
function shell(S, o) {
  const cols = o.cols, th0 = o.th0 == null ? -Math.PI : o.th0, th1 = o.th1 == null ? Math.PI : o.th1, closed = o.th0 == null;
  const s0 = typeof o.s0 === "function" ? o.s0 : () => o.s0, s1 = typeof o.s1 === "function" ? o.s1 : () => o.s1;
  const d = o.d || (() => 0), step = o.step || 0.012;
  let span = 0; for (let j = 0; j <= 8; j++) { const th = th0 + (th1 - th0) * j / 8; span = Math.max(span, Math.abs(s1(th) - s0(th))); }
  const nr = Math.max(2, Math.ceil(span / step) + 1);
  const lip0 = o.lip0 || 0, lip1 = o.lip1 || 0, pre = lip0 ? 3 : 0, post = lip1 ? 3 : 0, rows = nr + pre + post;
  const dir = s1(th0) >= s0(th0) ? 1 : -1;
  const thAt = j => th0 + (th1 - th0) * j / cols;
  const rowParam = (i, th) => {   // → [s, extra d]
    if (i < pre) { const k = pre - i, s = s0(th); return k === 3 ? [s + dir * lip0 * 1.6, -lip0] : k === 2 ? [s - dir * lip0 * 0.35, -lip0 * 0.5] : [s, 0]; }
    const r = i - pre;
    if (r < nr) { const t = r / (nr - 1), e = o.ease ? o.ease(t) : t; return [s0(th) + (s1(th) - s0(th)) * e, 0]; }
    const k = r - nr + 1, s = s1(th);
    return k === 1 ? [s, 0] : k === 2 ? [s + dir * lip1 * 0.35, -lip1 * 0.5] : [s - dir * lip1 * 1.6, -lip1];
  };
  const vq = new THREE.Vector3(), n1 = new THREE.Vector3(), n2 = new THREE.Vector3(), n3 = new THREE.Vector3();
  const along = (th, s, dd, out) => {   // o.normal: lift off the surface along its normal, so a dome stays closed at its pole
    if (!o.normal) return S(th, s, dd, out);
    if (s >= S.max - 1e-6) {   // the pole itself: one point, lifted along the axis
      S(th, S.max, -1, out); n1.copy(out).sub(S(th, S.max - 0.01, -1, n2)).normalize(); return out.addScaledVector(n1, dd);
    }
    const e = 0.002, sc = clamp(s, S.min + e, S.max - e);
    S(th, sc, 0, out); S(th + e * 4, sc, 0, n1).sub(S(th - e * 4, sc, 0, n2)); S(th, sc + e, 0, n2).sub(S(th, sc - e, 0, n3));
    n3.crossVectors(n1, n2); if (n3.lengthSq() < 1e-14) n3.set(0, dir, 0);
    n3.normalize(); S(th, sc, 0.004, n1).sub(out); if (n3.dot(n1) < 0) n3.negate();
    if (s !== sc) out.copy(S(th, s, 0, n1));
    return out.addScaledVector(n3, dd);
  };
  const P = (i, j, out) => {
    const th = thAt(j), [s, ex] = rowParam(i, th), dd = d(th, s) + ex;
    along(th, s, dd, out); return s;
  };
  const g = gridGeo(rows, closed ? cols : cols + 1, closed, P, (i, j) => { const th = thAt(j), [s] = rowParam(i, th); return [(th - th0) / TAU * (o.uu || 2), s * (o.vv || 3)]; },
    (i, j, out) => { const th = thAt(j), [s] = rowParam(i, th), dd = d(th, s); along(th, s, dd + 0.01, out); return out.sub(along(th, s, dd, vq)); });
  return g;
}

/* ── a tube swept along a smooth path (hands, strings, belt tails, the hood's rim); round ends ── */
function sweep(points, o) {
  const curve = new THREE.CatmullRomCurve3(points, !!o.loop, "centripetal");
  const n = o.rings || 16, cols = o.cols || 12, e = 2 / (o.n || 2), caps = o.loop ? 0 : (o.caps == null ? 3 : o.caps);
  const rings = [];
  const up = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const t = i / n, P = curve.getPointAt(Math.min(t, 1)), T = curve.getTangentAt(Math.min(t, 1));
    const r = o.r(t);
    rings.push({ P, T, ra: r[0], rb: r[1], t });
  }
  if (caps) {
    const first = rings[0], last = rings[rings.length - 1], pre = [], post = [];
    for (let k = 1; k <= caps; k++) {
      const f = k / caps * Math.PI / 2, c = Math.max(Math.cos(f), 0.05), sn = Math.sin(f);
      pre.unshift({ P: first.P.clone().addScaledVector(first.T, -Math.min(first.ra, first.rb) * sn * (o.capLen || 1)), T: first.T, ra: first.ra * c, rb: first.rb * c, t: 0 });
      post.push({ P: last.P.clone().addScaledVector(last.T, Math.min(last.ra, last.rb) * sn * (o.capLen || 1)), T: last.T, ra: last.ra * c, rb: last.rb * c, t: 1 });
    }
    rings.unshift(...pre); rings.push(...post);
  }
  const upf = typeof o.up === "function" ? o.up : () => o.up || V3(0, 1, 0);
  const frames = rings.map(R => {
    up.copy(upf(R.t, R.P)); B.copy(up).addScaledVector(R.T, -up.dot(R.T)).normalize(); A.crossVectors(R.T, B).normalize();
    return [A.clone(), B.clone()];
  });
  const P = (i, j, out) => {
    const R = rings[i], th = j / cols * TAU, [a, b] = frames[i];
    return out.copy(R.P).addScaledVector(a, R.ra * spow(Math.sin(th), e)).addScaledVector(b, R.rb * spow(Math.cos(th), e));
  };
  const g = gridGeo(rings.length, cols, true, P, (i, j) => [j / cols, rings[i].t * (o.vv || 1)], (i, j, out) => P(i, j, out).sub(rings[i].P));
  g.userData.t = rings.map(r => r.t); g.userData.s = null;
  return g;
}

/* ── skin weights: which joints move each point ── */
function chainW(s, links) {   // links: [[bone, sEnd, blend], …] in increasing s
  let i = 0; while (i < links.length - 1 && s > links[i][1]) i++;
  const w = [[links[i][0], 1]];
  if (i > 0) { const e = links[i - 1][1], b = links[i - 1][2]; if (b > 0 && s - e < b) { const t = sstep(-b, b, s - e); w[0][1] = t; w.push([links[i - 1][0], 1 - t]); } }
  if (i < links.length - 1) { const e = links[i][1], b = links[i][2]; if (b > 0 && e - s < b) { const t = sstep(-b, b, s - e); w[0][1] = 1 - t; w.push([links[i + 1][0], t]); } }
  return w;
}
function mixW(w, bone, k) { if (k <= 0) return w; w.forEach(x => x[1] *= 1 - k); w.push([bone, k]); return w; }
function applyWeights(g, fn) {
  const p = g.attributes.position, n = p.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), v = new THREE.Vector3();
  const sArr = g.userData.s, tArr = g.userData.t;
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(p, i);
    const extra = sArr ? sArr[i] : tArr ? tArr[Math.floor(i / (g.userData.cols || 1))] : 0;
    const w = fn(v, extra).filter(x => x[1] > 1e-4).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const tot = w.reduce((a, x) => a + x[1], 0) || 1;
    w.forEach((x, k) => { si[i * 4 + k] = x[0]; sw[i * 4 + k] = x[1] / tot; });
  }
  g.setAttribute("skinIndex", new THREE.BufferAttribute(si, 4)); g.setAttribute("skinWeight", new THREE.BufferAttribute(sw, 4));
  return g;
}
function mergeGeos(list) {
  let nv = 0, ni = 0; list.forEach(g => { nv += g.attributes.position.count; ni += g.index.count; });
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), si = new Uint16Array(nv * 4), sw = new Float32Array(nv * 4);
  const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  let ov = 0, oi = 0;
  list.forEach(g => {
    const c = g.attributes.position.count;
    pos.set(g.attributes.position.array, ov * 3); nor.set(g.attributes.normal.array, ov * 3); uv.set(g.attributes.uv.array, ov * 2);
    si.set(g.attributes.skinIndex.array, ov * 4); sw.set(g.attributes.skinWeight.array, ov * 4);
    const ia = g.index.array; for (let k = 0; k < ia.length; k++) idx[oi + k] = ia[k] + ov;
    ov += c; oi += ia.length; g.dispose();
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setAttribute("skinIndex", new THREE.BufferAttribute(si, 4));
  g.setAttribute("skinWeight", new THREE.BufferAttribute(sw, 4)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

/* ── soft cloth: a small tiling normal map drawn once (folds, then the weave) ── */
function bumpTex(size, kind) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), H = new Float32Array(size * size);
  let seed = { knit: 5, weave: 11, canvas: 17, hair: 23, rib: 29 }[kind] || 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const waves = [];
  for (let k = 0; k < 9; k++) waves.push([Math.round((rnd() * 2 - 1) * 2), 1 + Math.floor(rnd() * 4), 0.9 / (1 + k * 0.45), rnd() * TAU]);
  const hairCols = []; for (let k = 0; k < 90; k++) hairCols.push([1 + Math.floor(rnd() * 70), rnd() * TAU, 0.3 + rnd() * 0.7]);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size; let h = 0;
    if (kind === "hair") { for (const [f, p, a] of hairCols) h += a * Math.sin(TAU * f * u + p + 0.8 * Math.sin(TAU * v * 2 + p)) / f * 6; }
    else if (kind === "rib") { h = Math.sin(TAU * 24 * u) * 0.9 + 0.08 * Math.sin(TAU * 64 * v); }
    else {
      const warp = 0.55 * Math.sin(TAU * (u + 2 * v)) + 0.35 * Math.sin(TAU * (2 * u - v) + 1.3);
      for (const [fx, fy, a, p] of waves) h += a * Math.sin(TAU * (fx * u + fy * v) + p + warp);
      const fine = kind === "knit" ? 0.06 * Math.sin(TAU * 48 * u) * Math.sin(TAU * 96 * v) : kind === "canvas" ? 0.07 * (Math.sin(TAU * 64 * u) + Math.sin(TAU * 64 * v)) : 0.04 * (Math.sin(TAU * 80 * u) + Math.sin(TAU * 80 * v));
      h = h * 0.22 + fine;
    }
    H[y * size + x] = h;
  }
  const img = g.createImageData(size, size), str = kind === "hair" ? 1.4 : kind === "rib" ? 2.2 : 3.2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const L = H[y * size + (x + size - 1) % size], R = H[y * size + (x + 1) % size], U = H[((y + size - 1) % size) * size + x], Dn = H[((y + 1) % size) * size + x];
    let nx = -(R - L) * str, ny = (Dn - U) * str, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const k = (y * size + x) * 4; img.data[k] = (nx * 0.5 + 0.5) * 255; img.data[k + 1] = (ny * 0.5 + 0.5) * 255; img.data[k + 2] = (nz * 0.5 + 0.5) * 255; img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}

/* ── colors for each outfit (pages pass their CSS token colors in options.colors) ── */
const DEFAULTS = {
  skate: { skin: "#c08a63", hair: "#2a1c14", top: "#3c6e8f", trim: "#2f5872", pants: "#6b6a4c", shoe: "#2b2e36", sole: "#f1ede3", laces: "#efebe2", helmet: "#d2603a", strings: "#efebe2", strap: "#22252b" },
  gi: { skin: "#c08a63", hair: "#2a1c14", top: "#f3f1ea", trim: "#e9e6dc", pants: "#f3f1ea", belt: "#1f1f22" },
  plain: { skin: "#c08a63", hair: "#2a1c14", top: "#b9573f", trim: "#a34a35", pants: "#3b4252", shoe: "#e9e7e1", sole: "#f8f7f3", laces: "#2b2e36" },
  apron: { skin: "#c08a63", hair: "#2a1c14", top: "#5d7f9c", trim: "#4f6d86", pants: "#3b4252", shoe: "#2b2e36", sole: "#f1ede3", laces: "#efebe2", apron: "#efe9dc", apronTie: "#c9bfa9", cap: "#f4f1ea" }
};
function toColor(c, fallback) { const k = new THREE.Color(); try { if (c && typeof c === "string") { k.setStyle(c.trim()); return k; } if (c && c.isColor) return k.copy(c); } catch (e) { /* not a color */ } return k.setStyle(fallback); }

/* ═══════════════════════════════ the figure ═══════════════════════════════ */
export function makeFigure(opts) {
  opts = opts || {};
  const outfit = DEFAULTS[opts.outfit] ? opts.outfit : "plain";
  const phone = opts.quality === "phone";
  const SEG = phone ? 14 : 26, TSEG = phone ? 22 : 40, HSEG = phone ? 18 : 32, STEP = phone ? 0.022 : 0.011;
  const colors = Object.assign({}, DEFAULTS[outfit], opts.colors || {});
  if (opts.belt) colors.belt = opts.belt;

  const root = new THREE.Group(); root.name = "figure";
  const body = new THREE.Group(); body.name = "body"; root.add(body);
  const bones = {}, BI = {};
  JOINTS.forEach((n, i) => { const b = new THREE.Bone(); b.name = n; bones[n] = b; BI[n] = i; });
  JOINTS.forEach(n => { const p = PARENT[n], a = AT[n], q = p ? AT[p] : [0, 0, 0]; bones[n].position.set(a[0] - q[0], a[1] - q[1], a[2] - q[2]); (p ? bones[p] : body).add(bones[n]); });
  const allBones = JOINTS.map(n => bones[n]);

  /* ── the hands' own small joints: four fingers and a thumb, three joints each ── */
  const FING = [  // name, knuckle z, knuckle y, three lengths, radius at base and tip
    ["idx", 0.0292, -0.093, [0.037, 0.023, 0.019], 0.0094, 0.0079],
    ["mid", 0.0105, -0.096, [0.041, 0.026, 0.020], 0.0097, 0.0081],
    ["rng", -0.0095, -0.094, [0.038, 0.024, 0.019], 0.0091, 0.0076],
    ["lit", -0.0275, -0.088, [0.030, 0.019, 0.017], 0.0081, 0.0068]];
  const TH_O = [0.0085, -0.03, 0.0205], TH_L = [0.044, 0.032, 0.027];
  const thDir = sx => V3(-sx * 0.26, -0.66, 0.56).normalize();
  const HB = {};   // side → { idx: [b1,b2,b3], …, thb: [...], palmN, anchor }
  ["L", "R"].forEach(S => {
    const sx = S === "L" ? 1 : -1, wrist = bones["wrist" + S], H = HB[S] = { sx, palmN: V3(-sx, 0, 0) };
    FING.forEach(([nm, z, y, L]) => {
      const b1 = new THREE.Bone(), b2 = new THREE.Bone(), b3 = new THREE.Bone();
      b1.name = S + "_" + nm + "1"; b2.name = S + "_" + nm + "2"; b3.name = S + "_" + nm + "3";
      b1.position.set(-sx * 0.002, y, z); b2.position.set(0, -L[0], 0); b3.position.set(0, -L[1], 0);
      wrist.add(b1); b1.add(b2); b2.add(b3); H[nm] = [b1, b2, b3]; allBones.push(b1, b2, b3);
    });
    const D = thDir(sx), t1 = new THREE.Bone(), t2 = new THREE.Bone(), t3 = new THREE.Bone();
    t1.name = S + "_thb1"; t2.name = S + "_thb2"; t3.name = S + "_thb3";
    t1.position.set(-sx * TH_O[0], TH_O[1], TH_O[2]); t2.position.copy(D).multiplyScalar(TH_L[0]); t3.position.copy(D).multiplyScalar(TH_L[1]);
    wrist.add(t1); t1.add(t2); t2.add(t3); H.thb = [t1, t2, t3]; allBones.push(t1, t2, t3);
    H.thD = D;
    // the anchor in the palm for a tool: x across the palm toward the thumb, y along the fingers, z out of the palm
    const anc = new THREE.Object3D(); anc.name = "hand" + S;
    anc.position.set(-sx * 0.031, -0.098, 0.004);
    anc.quaternion.setFromRotationMatrix(sx > 0 ? new THREE.Matrix4().makeBasis(V3(0, 0, -1), V3(0, -1, 0), V3(-1, 0, 0)) : new THREE.Matrix4().makeBasis(V3(0, 0, 1), V3(0, -1, 0), V3(1, 0, 0)));
    if (sx > 0) anc.scale.set(-1, 1, 1);   // a left hand is a mirror image: its x still points toward the thumb
    wrist.add(anc); H.anchor = anc; H.anchorHome = anc.position.clone(); H.grip = 0; H.pinch = false;
  });
  const boneIndex = new Map(allBones.map((b, i) => [b, i]));
  const bi = b => boneIndex.get(b);

  /* ── weights for each region of the body ── */
  const torsoLinks = [[BI.pelvis, 1.02, 0.05], [BI.spine, 1.2, 0.06], [BI.chest, 1.45, 0.04], [BI.neck, 1.535, 0.02], [BI.head, 9, 0]];
  const torsoW = p => chainW(p.y, torsoLinks);
  const skirtW = (k0, top, bot, back) => p => {   // cloth below the waist follows the thigh on its side, more toward the hem (and in front)
    const w = torsoW(p), side = p.x >= 0 ? "L" : "R", k = (k0 || 0.5) * sstep(top || 0.93, bot || 0.78, p.y) * (back == null ? 1 : back + (1 - back) * sstep(-0.03, 0.07, p.z));
    if (k <= 0) return w;
    const c = sstep(-0.05, 0.05, p.x);   // across the middle the two thighs share it
    w.forEach(x => x[1] *= 1 - k); w.push([BI.hipL, k * c], [BI.hipR, k * (1 - c)]); void side; return w;
  };
  const legW = S => p => mixW(chainW(-p.y, [[BI["hip" + S], -0.5, 0.045], [BI["knee" + S], -0.08, 0.025], [BI["ankle" + S], 9, 0]]), BI.pelvis, 0.7 * sstep(0.87, 0.985, p.y));
  const armW = S => p => mixW(chainW(-p.y, [[BI["shoulder" + S], -1.12, 0.04], [BI["elbow" + S], -0.87, 0.018], [BI["wrist" + S], 9, 0]]), BI.chest, 0.3 * sstep(1.4, 1.48, p.y));
  const footW = S => p => chainW(p.z, [[BI["ankle" + S], 0.135, 0.03], [BI["toe" + S], 9, 0]]);
  const one = b => () => [[b, 1]];

  /* ── materials ── */
  const texs = [], mats = {};
  const tex = (kind, size) => { const t = bumpTex(size || (phone ? 128 : 256), kind); if (t) texs.push(t); return t; };
  const tKnit = tex("knit"), tWeave = tex("weave"), tCanvas = tex("canvas"), tHair = tex("hair"), tRib = tex("rib", 64);
  const Std = phone ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial;
  function cloth(key, t, rough, extra) {
    const o = { roughness: rough == null ? 0.92 : rough, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.85 };
    if (t) { o.normalMap = t; o.normalScale = new THREE.Vector2(0.55, 0.55); }
    if (!phone) Object.assign(o, { sheen: 0.6, sheenRoughness: 0.7 });
    const m = new Std(Object.assign(o, extra || {})); m.userData.key = key; mats[key] = m; return m;
  }
  const skinM = new Std(Object.assign({ roughness: 0.52, metalness: 0, envMapIntensity: 0.9 }, phone ? {} : { sheen: 0.3, sheenRoughness: 0.45, clearcoat: 0.04, clearcoatRoughness: 0.6 }));
  skinM.userData.key = "skin"; mats.skin = skinM;
  const hairM = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0, normalMap: tHair, normalScale: new THREE.Vector2(0.8, 0.8), envMapIntensity: 0.8, side: THREE.DoubleSide });
  hairM.userData.key = "hair"; mats.hair = hairM;
  const buckets = new Map();   // material → geometries (merged into one skinned mesh each)
  const add = (m, g, w) => { applyWeights(g, w); if (!buckets.has(m)) buckets.set(m, []); buckets.get(m).push(g); };

  /* ═════════ the body: one smooth skin ═════════ */
  const TORSO = [
    [0.835, 0.02, 0.02, 0.02, 0, -0.005, 2], [0.85, 0.10, 0.06, 0.07, 0, -0.005, 2], [0.885, 0.155, 0.085, 0.10, 0, -0.01, 2.2],
    [0.93, 0.172, 0.09, 0.112, 0, -0.01, 2.3], [0.98, 0.168, 0.088, 0.10, 0, -0.008, 2.3], [1.04, 0.15, 0.088, 0.085, 0, 0, 2.2],
    [1.10, 0.148, 0.09, 0.082, 0, 0, 2.2], [1.18, 0.158, 0.10, 0.088, 0, 0, 2.3], [1.26, 0.172, 0.112, 0.092, 0, 0, 2.4],
    [1.33, 0.182, 0.11, 0.095, 0, -0.005, 2.6], [1.385, 0.19, 0.088, 0.09, 0, -0.01, 2.8], [1.425, 0.16, 0.07, 0.075, 0, -0.012, 2.6],
    [1.455, 0.09, 0.055, 0.06, 0, -0.012, 2.2], [1.48, 0.055, 0.05, 0.052, 0, -0.008, 2], [1.52, 0.05, 0.048, 0.05, 0, 0, 2],
    [1.56, 0.046, 0.046, 0.048, 0, 0.005, 2], [1.578, 0.012, 0.012, 0.012, 0, 0.005, 2]];
  // the shoulder cap: a round deltoid, its center easing in toward the neck as it rises (no square "pads").
  // capKeys(t) gives the same dome t meters bigger, so every sleeve follows the arm's own shape.
  const CAP = [[1.452, 0.003, 0.003, 0.003, -0.074], [1.449, 0.021, 0.02, 0.021, -0.062], [1.442, 0.034, 0.033, 0.035, -0.047], [1.428, 0.044, 0.043, 0.046, -0.029],
    [1.408, 0.05, 0.049, 0.052, -0.013], [1.384, 0.052, 0.051, 0.054, -0.004], [1.355, 0.051, 0.049, 0.051, 0]];
  const capKeys = t => CAP.map((k, i) => i ? [k[0], k[1] + t, k[2] + t, k[3] + t, k[4]] : [k[0] + t * 0.8, k[1], k[2], k[3], k[4] + t * 0.3]);
  const ARM = CAP.concat([
    [1.30, 0.047, 0.047, 0.045], [1.22, 0.044, 0.048, 0.042], [1.16, 0.04, 0.042, 0.04], [1.12, 0.037, 0.038, 0.038], [1.08, 0.041, 0.043, 0.041],
    [1.02, 0.039, 0.04, 0.038], [0.95, 0.03, 0.033, 0.031], [0.9, 0.0225, 0.0285, 0.0275]]);
  // the palm, in its own terms: [along from the wrist, half width across, toward the palm, toward the back, across shift, thickness shift, shape]
  const PALM = [[0.004, 0.0255, 0.0195, 0.0185, 0, 0.0005, 2.05], [0.022, 0.033, 0.019, 0.0165, 0.002, 0.001, 2.2], [0.045, 0.04, 0.019, 0.0145, 0.002, 0.0015, 2.35],
    [0.078, 0.043, 0.0165, 0.0135, 0, 0.001, 2.35], [0.093, 0.042, 0.014, 0.0125, -0.001, 0, 2.25], [0.102, 0.038, 0.011, 0.01, -0.002, 0, 2.1], [0.108, 0.029, 0.007, 0.007, -0.002, 0, 2], [0.111, 0.012, 0.003, 0.003, -0.002, 0, 2]];
  const HAND_END = AT.wristL[1] - 0.111;
  // turned into the arm's frame (across = x, front/back = z), so the forearm flows into the hand without a seam
  ARM.push(...PALM.map(k => [AT.wristL[1] - k[0], (k[2] + k[3]) / 2, k[1], k[1], (k[3] - k[2]) / 2 - k[5], k[4], k[6]]));
  // rows packed closer over the hand, where the shape turns quickly
  const armEase = top => { const h = 0.13 / (top - HAND_END); return t => t < 0.35 ? t / 0.35 * h : h + (t - 0.35) / 0.65 * (1 - h); };
  const LEG = [[1.0, 0.015, 0.015, 0.015], [0.985, 0.06, 0.06, 0.06], [0.95, 0.085, 0.085, 0.09], [0.90, 0.09, 0.09, 0.088], [0.82, 0.083, 0.086, 0.08],
    [0.72, 0.072, 0.075, 0.068], [0.62, 0.06, 0.062, 0.058], [0.54, 0.052, 0.055, 0.05], [0.50, 0.05, 0.053, 0.05], [0.45, 0.05, 0.048, 0.056],
    [0.40, 0.052, 0.045, 0.062], [0.34, 0.048, 0.042, 0.055], [0.26, 0.04, 0.036, 0.042], [0.18, 0.031, 0.03, 0.032], [0.12, 0.027, 0.028, 0.027],
    [0.085, 0.029, 0.03, 0.028], [0.06, 0.028, 0.028, 0.028], [0.045, 0.012, 0.012, 0.012]];
  const torsoS = makeSurf(TORSO, vertMap(0, 0, 1));
  const armS = (S, keys) => makeSurf(keys || ARM, vertMap(AT["shoulder" + S][0], -0.01, S === "L" ? 1 : -1));
  const legS = (S, keys) => makeSurf(keys || LEG, vertMap(AT["hip" + S][0], 0, S === "L" ? 1 : -1));
  const SIDES = ["L", "R"];

  // the torso's skin: all of it for the gi (the jacket opens at the chest), only the neck under other tops
  const torsoFrom = outfit === "gi" ? 0.835 : 1.40;
  add(skinM, shell(torsoS, { cols: TSEG, s0: torsoFrom, s1: 1.578, step: STEP }), torsoW);
  // arms: all of them under short or pushed-up sleeves, none under the hoodie
  const armFrom = { skate: null, gi: 1.45, plain: 1.32, apron: 1.2 }[outfit];
  { const top = armFrom || 0.95;   // under the hoodie only the wrist and hand show, the rest waits under the sleeve
    SIDES.forEach(S => add(skinM, shell(armS(S), { cols: SEG, s0: HAND_END, s1: top, step: STEP * (top - HAND_END > 0.4 ? 0.62 : 0.4), ease: armEase(top) }), armW(S))); }
  if (outfit === "gi") SIDES.forEach(S => add(skinM, shell(legS(S), { cols: SEG, s0: 0.045, s1: 0.5, step: STEP }), legW(S)));

  /* ── the head: skull, jaw and chin turned from a profile; ears; no face ── */
  const hy = AT.head[1];
  const HEAD = [[-0.06, 0.016, 0.012, 0.012, 0, 0.042], [-0.053, 0.042, 0.03, 0.034, 0, 0.036], [-0.036, 0.06, 0.047, 0.058, 0, 0.026],
    [-0.005, 0.067, 0.066, 0.076, 0, 0.018], [0.03, 0.073, 0.083, 0.09, 0, 0.011], [0.07, 0.077, 0.09, 0.097, 0, 0.005],
    [0.103, 0.076, 0.089, 0.096, 0, 0], [0.132, 0.068, 0.079, 0.086, 0, -0.003], [0.155, 0.051, 0.06, 0.066, 0, -0.005],
    [0.171, 0.026, 0.031, 0.034, 0, -0.006], [0.178, 0.003, 0.003, 0.003, 0, -0.006]];
  const headS = makeSurf(HEAD, (a, s, b, o) => o.set(a, hy + s, b));
  add(skinM, shell(headS, { cols: HSEG, s0: -0.06, s1: 0.178, step: phone ? 0.014 : 0.007 }), one(BI.head));
  SIDES.forEach(S => {   // an ear: a soft rim around a shallow bowl, tipped back a little
    const sx = S === "L" ? 1 : -1, c = V3(sx * 0.074, hy + 0.03, -0.012);
    const pts = []; for (let k = 0; k <= 10; k++) { const a = -0.4 + k / 10 * 4.0; pts.push(V3(c.x + sx * 0.004 * Math.sin(a), c.y + 0.028 * Math.cos(a) * (a < 1.6 ? 1 : 0.75), c.z - 0.017 * Math.sin(a) + 0.004)); }
    add(skinM, sweep(pts, { rings: phone ? 8 : 14, cols: phone ? 6 : 8, r: t => [0.0045 + 0.002 * Math.sin(t * Math.PI), 0.004], up: V3(sx, 0, 0) }), one(BI.head));
    const lobe = new THREE.SphereGeometry(1, phone ? 8 : 12, phone ? 6 : 10); lobe.scale(0.006, 0.024, 0.014); lobe.rotateX(-0.25); lobe.translate(c.x - sx * 0.001, c.y + 0.002, c.z - 0.004);
    lobe.deleteAttribute("uv"); lobe.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(lobe.attributes.position.count * 2), 2));
    add(skinM, lobe, one(BI.head));
  });
  // hair: a close cut that follows the skull, thin at the hairline
  const hairline = th => 0.058 + 0.07 * Math.cos(th) - 0.016 * Math.cos(2 * th);
  add(hairM, shell(headS, { cols: HSEG, s0: hairline, s1: 0.178, step: phone ? 0.014 : 0.008, lip0: 0.003, uu: 3, vv: 2, normal: true,
    d: (th, s) => 0.0035 + 0.007 * sstep(hairline(th), hairline(th) + 0.06, s) }), one(BI.head));

  /* ── hands: palm, four fingers and a thumb, all one smooth skin on their own joints ── */
  SIDES.forEach(S => {
    const H = HB[S], sx = H.sx, W = AT["wrist" + S], O = V3(W[0], W[1], W[2]), wb = BI["wrist" + S];
    const A = V3(0, 0, 1), Bp = V3(-sx, 0, 0), Dd = V3(0, -1, 0);
    // the fingers
    FING.forEach(([nm, z, y, L, r0, r1]) => {
      const bs = H[nm], len = L[0] + L[1] + L[2], start = -0.016;
      const K0 = V3(O.x - sx * 0.002, O.y + y, O.z + z);
      const keys = [[start, r0 * 1.05, r0 * 1.0, r0 * 1.0], [0, r0 * 1.1, r0 * 1.02, r0 * 1.06], [L[0] * 0.5, r0 * 0.97, r0 * 0.92, r0 * 0.88],
        [L[0], r0 * 0.96, r0 * 0.88, r0 * 0.92], [L[0] + L[1] * 0.5, (r0 + r1) / 2 * 0.95, (r0 + r1) / 2 * 0.9, (r0 + r1) / 2 * 0.85], [L[0] + L[1], r1 * 1.0, r1 * 0.92, r1 * 0.94]];
      const le = len - r1 * 0.8;
      for (let k = 0; k <= 4; k++) { const f = k / 4 * Math.PI / 2, c = Math.max(Math.cos(f), 0.04); keys.push([le + r1 * 0.95 * Math.sin(f), r1 * 0.9 * c, r1 * 0.86 * c, r1 * 0.8 * c]); }
      const fs = makeSurf(keys, frameMap(K0, Dd, A, Bp));
      add(skinM, shell(fs, { cols: phone ? 8 : 12, s0: start, s1: le + r1 * 0.95, step: phone ? 0.008 : 0.004 }),
        (p, s) => chainW(s, [[wb, 0.0, 0.007], [bi(bs[0]), L[0], 0.006], [bi(bs[1]), L[0] + L[1], 0.005], [bi(bs[2]), 9, 0]]));
    });
    // the thumb: a fat base that makes the ball of the thumb, then two joints
    {
      const D = H.thD, T0 = V3(O.x - sx * TH_O[0], O.y + TH_O[1], O.z + TH_O[2]);
      const Ax = new THREE.Vector3().crossVectors(D, Bp).normalize(), Bx = new THREE.Vector3().crossVectors(Ax, D).normalize();
      const L = TH_L, len = L[0] + L[1] + L[2], r1 = 0.0088;
      const keys = [[-0.008, 0.008, 0.008, 0.008], [0.004, 0.0145, 0.0142, 0.0125], [L[0] * 0.55, 0.0145, 0.0135, 0.012], [L[0], 0.0112, 0.0108, 0.0104],
        [L[0] + L[1] * 0.5, 0.0102, 0.0098, 0.0094], [L[0] + L[1], 0.0096, 0.0092, 0.009]];
      const le = len - r1 * 0.8;
      for (let k = 0; k <= 4; k++) { const f = k / 4 * Math.PI / 2, c = Math.max(Math.cos(f), 0.04); keys.push([le + r1 * 0.95 * Math.sin(f), r1 * 0.95 * c, r1 * 0.9 * c, r1 * 0.85 * c]); }
      const ts = makeSurf(keys, frameMap(T0, D, Ax, Bx));
      add(skinM, shell(ts, { cols: phone ? 8 : 16, s0: -0.008, s1: le + r1 * 0.95, step: phone ? 0.008 : 0.003 }),
        (p, s) => chainW(s, [[wb, 0.004, 0.012], [bi(H.thb[0]), L[0], 0.007], [bi(H.thb[1]), L[0] + L[1], 0.005], [bi(H.thb[2]), 9, 0]]));
    }
  });

  /* ── bare feet (gi) ── */
  const FOOT = [[-0.068, 0.012, 0.02, 0.02, 0, 0.035, 2.4], [-0.06, 0.028, 0.04, 0.033, 0, 0.035, 2.6], [-0.04, 0.033, 0.055, 0.035, 0, 0.037, 2.8],
    [-0.01, 0.034, 0.07, 0.04, 0, 0.042, 2.8], [0.03, 0.038, 0.052, 0.042, 0.002, 0.042, 2.8], [0.08, 0.044, 0.033, 0.036, 0.004, 0.036, 2.8],
    [0.13, 0.048, 0.02, 0.028, 0.004, 0.028, 2.8], [0.17, 0.046, 0.016, 0.022, 0.002, 0.022, 2.6], [0.195, 0.038, 0.013, 0.018, 0, 0.018, 2.4],
    [0.212, 0.02, 0.008, 0.012, -0.002, 0.014, 2.2], [0.218, 0.004, 0.003, 0.004, -0.002, 0.013, 2]];
  const footMap = (S, lift) => (a, s, b, o) => o.set(AT["ankle" + S][0] + (S === "L" ? 1 : -1) * a, b + (lift ? lift(s) : 0), s);

  /* ═════════ clothes ═════════ */
  const C = {};   // the shared cloth materials for this outfit
  function shoes(m) {
    const shoeM = new Std({ roughness: 0.62, metalness: 0, normalMap: tCanvas, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 0.85 });
    shoeM.userData.key = "shoe"; mats.shoe = shoeM;
    const soleM = new Std({ roughness: 0.5, metalness: 0, envMapIntensity: 0.9 }); soleM.userData.key = "sole"; mats.sole = soleM;
    const laceM = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, normalMap: tWeave }); laceM.userData.key = "laces"; mats.laces = laceM;
    const spring = s => 0.012 * sstep(0.15, 0.225, s);
    // the upper: heel counter, a padded collar, the tongue, a rounded toe box with a little toe spring
    const UPPER = [[-0.078, 0.02, 0.02, 0.012, 0, 0.065, 2.4], [-0.07, 0.036, 0.05, 0.035, 0, 0.065, 2.8], [-0.045, 0.045, 0.055, 0.04, 0, 0.07, 3],
      [0.0, 0.048, 0.056, 0.045, 0, 0.07, 3], [0.05, 0.051, 0.042, 0.045, 0.003, 0.07, 3], [0.1, 0.054, 0.032, 0.04, 0.005, 0.065, 3],
      [0.14, 0.055, 0.026, 0.035, 0.004, 0.06, 3], [0.18, 0.049, 0.022, 0.03, 0, 0.055, 2.8], [0.205, 0.036, 0.018, 0.024, -0.003, 0.05, 2.6],
      [0.22, 0.016, 0.01, 0.012, -0.004, 0.047, 2.2], [0.224, 0.003, 0.003, 0.003, -0.004, 0.046, 2]];
    const SOLE = [[-0.084, 0.02, 0.016, 0.016, 0, 0.018, 3], [-0.078, 0.042, 0.018, 0.018, 0, 0.018, 4], [-0.04, 0.051, 0.018, 0.018, 0, 0.018, 4],
      [0.05, 0.057, 0.018, 0.018, 0.003, 0.018, 4], [0.13, 0.061, 0.018, 0.018, 0.004, 0.018, 4], [0.19, 0.054, 0.019, 0.018, 0, 0.019, 4],
      [0.215, 0.04, 0.02, 0.017, -0.003, 0.02, 3.4], [0.228, 0.02, 0.016, 0.012, -0.004, 0.021, 2.6], [0.232, 0.004, 0.004, 0.004, -0.004, 0.021, 2]];
    SIDES.forEach(S => {
      add(shoeM, shell(makeSurf(UPPER, footMap(S, spring)), { cols: phone ? 16 : 28, s0: -0.078, s1: 0.224, step: phone ? 0.014 : 0.007, uu: 2, vv: 6 }), footW(S));
      add(soleM, shell(makeSurf(SOLE, footMap(S, spring)), { cols: phone ? 16 : 28, s0: -0.084, s1: 0.232, step: phone ? 0.014 : 0.007 }), footW(S));
      // laces: five soft crossings over the tongue
      const sx = S === "L" ? 1 : -1, x0 = AT["ankle" + S][0], up = makeSurf(UPPER, footMap(S, spring));
      for (let k = 0; k < 5; k++) {
        const z = 0.035 + k * 0.022, top = up(0, z, 0.003), w = 0.022 - k * 0.0015;
        const pts = [V3(x0 - w, top.y - 0.006, z - 0.006), V3(x0 - w * 0.4, top.y + 0.002, z), V3(x0 + w * 0.4, top.y + 0.002, z + 0.002), V3(x0 + w, top.y - 0.006, z + 0.008)];
        add(laceM, sweep(pts, { rings: phone ? 4 : 8, cols: 6, r: () => [0.0042, 0.0022], up: V3(0, 1, 0.3) }), footW(S));
      }
      void sx;
    });
    void m;
  }
  function pantsSeat(keys, m) { add(m, shell(makeSurf(keys, vertMap(0, 0, 1)), { cols: TSEG, s0: keys[0][0], s1: keys[keys.length - 1][0], step: STEP, uu: 3, vv: 3 }), skirtW(0.5)); }

  if (outfit === "skate") {
    C.top = cloth("top", tKnit, 0.95); C.trim = cloth("trim", tRib, 0.95); C.pants = cloth("pants", tCanvas, 0.9);
    // the hoodie: boxy, hanging straight from the chest, a cinched rib hem, a kangaroo pocket, the hood lying on the back
    const HOOD = [[0.865, 0.21, 0.134, 0.14, 0, -0.01, 2.3], [0.9, 0.208, 0.133, 0.14, 0, -0.01, 2.3], [0.98, 0.196, 0.127, 0.13, 0, -0.008, 2.3],
      [1.06, 0.186, 0.125, 0.118, 0, 0, 2.3], [1.16, 0.186, 0.13, 0.115, 0, 0, 2.3], [1.26, 0.193, 0.133, 0.113, 0, 0, 2.4],
      [1.33, 0.2, 0.13, 0.113, 0, -0.005, 2.6], [1.385, 0.205, 0.108, 0.11, 0, -0.01, 2.8], [1.425, 0.176, 0.088, 0.093, 0, -0.012, 2.6],
      [1.455, 0.106, 0.072, 0.075, 0, -0.012, 2.2], [1.478, 0.068, 0.064, 0.066, 0, -0.008, 2]];
    const hS = makeSurf(HOOD, vertMap(0, 0, 1));
    const pocket = (th, s) => { const half = 0.95 - (s - 0.92) * 1.6; return sstep(half + 0.06, half, Math.abs(th)) * sstep(0.905, 0.92, s) * sstep(1.09, 1.075, s); };
    const hoodBump = (th, s) => { const dth = Math.abs(Math.abs(th) - Math.PI); return Math.pow(Math.max(0, Math.cos(Math.min(dth / 1.05, 1) * Math.PI / 2)), 1.5) * Math.pow(Math.max(0, Math.sin(Math.PI * clamp((s - 1.25) / 0.23, 0, 1))), 0.7); };
    const hoodD = (th, s) => -0.007 * sstep(0.905, 0.868, s) + 0.005 * pocket(th, s) + 0.034 * hoodBump(th, s)
      + 0.0035 * Math.sin(th * 5 + s * 9) * sstep(0.93, 1.05, s) * sstep(1.3, 1.15, s);
    add(C.top, shell(hS, { cols: TSEG, s0: 0.905, s1: 1.478, step: STEP, d: hoodD, lip1: 0.012, uu: 3, vv: 3 }), skirtW(0.85, 1.0, 0.875, 0.45));
    add(C.trim, shell(hS, { cols: TSEG, s0: 0.866, s1: 0.906, step: STEP / 2, d: hoodD, lip0: 0.01, uu: 8, vv: 1 }), skirtW(0.85, 1.0, 0.875, 0.45));
    // the hood's rim around the neck, meeting at the chest, and the two drawstrings
    const rim = [V3(0, 1.49, -0.094), V3(0.074, 1.475, -0.066), V3(0.1, 1.452, -0.006), V3(0.082, 1.42, 0.066), V3(0.034, 1.39, 0.11),
      V3(-0.034, 1.39, 0.11), V3(-0.082, 1.42, 0.066), V3(-0.1, 1.452, -0.006), V3(-0.074, 1.475, -0.066)];
    add(C.top, sweep(rim, { loop: true, rings: phone ? 24 : 48, cols: phone ? 8 : 12, r: () => [0.03, 0.011], n: 2.4,
      up: (t, P) => V3(P.x, 0, P.z).normalize().multiplyScalar(0.8).add(V3(0, 0.6, 0)) }), torsoW);
    mats.strings = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0, normalMap: tWeave }); mats.strings.userData.key = "strings";
    [-1, 1].forEach(k => {
      const pts = [1.405, 1.36, 1.31, 1.27, 1.235].map((y, i) => { const p = hS(k * (0.2 + i * 0.01), y, 0.008 + hoodD(k * 0.2, y)); return V3(k * (0.03 + i * 0.002), y, p.z); });
      add(mats.strings, sweep(pts, { rings: phone ? 8 : 14, cols: 6, r: t => t > 0.9 ? [0.0046, 0.0046] : [0.0034, 0.0034] }), torsoW);
    });
    // sleeves: roomy, bunching above the cuff
    const SLV = capKeys(0.02).concat([[1.33, 0.069, 0.068, 0.068], [1.22, 0.064, 0.066, 0.062], [1.12, 0.063, 0.064, 0.062], [1.02, 0.057, 0.058, 0.056], [0.94, 0.05, 0.052, 0.05], [0.91, 0.046, 0.048, 0.047], [0.9, 0.038, 0.04, 0.04], [0.862, 0.032, 0.035, 0.034]]);
    SIDES.forEach(S => {
      const s = armS(S, SLV), dS = (th, y) => 0.004 * Math.sin(y * 75 + 1.7 * Math.sin(th * 2 + y * 9)) * sstep(1.06, 0.95, y) * sstep(0.9, 0.93, y);
      add(C.top, shell(s, { cols: SEG, s0: 0.9, s1: SLV[0][0], step: STEP, d: dS }), armW(S));
      add(C.trim, shell(s, { cols: SEG, s0: 0.862, s1: 0.902, step: STEP / 2, lip0: 0.008, uu: 6, vv: 1 }), armW(S));
    });
    // baggy cargo pants, stacked over the shoes, with a pocket and flap on each thigh
    pantsSeat([[0.84, 0.05, 0.04, 0.05], [0.86, 0.155, 0.098, 0.112], [0.9, 0.18, 0.104, 0.122, 0, -0.005, 2.2], [0.96, 0.178, 0.1, 0.116, 0, -0.005, 2.2], [1.03, 0.166, 0.096, 0.1, 0, 0, 2.2]], C.pants);
    const PL = [[1.0, 0.02, 0.02, 0.02], [0.985, 0.06, 0.062, 0.062], [0.94, 0.08, 0.088, 0.094], [0.86, 0.09, 0.098, 0.1], [0.78, 0.097, 0.1, 0.099], [0.72, 0.1, 0.1, 0.098], [0.6, 0.095, 0.096, 0.094],
      [0.5, 0.093, 0.094, 0.092], [0.38, 0.09, 0.09, 0.09], [0.25, 0.088, 0.088, 0.09], [0.15, 0.09, 0.09, 0.092], [0.09, 0.095, 0.095, 0.097], [0.05, 0.098, 0.098, 0.1]];
    SIDES.forEach(S => {
      const s = makeSurf(PL, vertMap(AT["hip" + S][0] * 1.06, 0, S === "L" ? 1 : -1));
      const out = Math.PI / 2;   // the outside of the leg (the mirror map keeps it outside on both legs)
      const pk = (th, y) => sstep(0.62, 0.52, Math.abs(th - out)) * sstep(0.55, 0.565, y) * sstep(0.73, 0.715, y);
      const flap = (th, y) => sstep(0.62, 0.52, Math.abs(th - out)) * sstep(0.69, 0.7, y) * sstep(0.745, 0.735, y);
      const dP = (th, y) => 0.008 * pk(th, y) + 0.004 * flap(th, y)
        + 0.007 * Math.sin(y * 52 + 2.2 * Math.sin(th * 2 + y * 13)) * sstep(0.32, 0.1, y) + 0.003 * Math.sin(th * 3 + y * 7) * sstep(0.95, 0.5, y);
      add(C.pants, shell(s, { cols: SEG + 4, s0: th => 0.058 + 0.02 * Math.cos(th), s1: 1.0, step: STEP, d: dP, lip0: 0.01, uu: 2, vv: 3 }), legW(S));
    });
    shoes();
    // the helmet: a smooth shell with a little gloss, a rolled rim, and its strap along the jaw
    const helM = new Std(Object.assign({ roughness: 0.32, metalness: 0, envMapIntensity: 1 }, phone ? {} : { clearcoat: 0.7, clearcoatRoughness: 0.18 }));
    helM.userData.key = "helmet"; mats.helmet = helM;
    const HELM = [[-0.03, 0.094, 0.106, 0.114, 0, 0.004, 2.15], [0.02, 0.101, 0.115, 0.121, 0, 0.004, 2.15], [0.07, 0.104, 0.118, 0.123, 0, 0, 2.15],
      [0.115, 0.1, 0.114, 0.118, 0, -0.002, 2.1], [0.15, 0.089, 0.102, 0.106, 0, -0.003, 2.05], [0.176, 0.07, 0.08, 0.083, 0, -0.004, 2],
      [0.193, 0.045, 0.052, 0.054, 0, -0.005, 2], [0.201, 0.02, 0.024, 0.025, 0, -0.006, 2], [0.203, 0.003, 0.003, 0.003, 0, -0.006, 2]];
    const helS = makeSurf(HELM, (a, s, b, o) => o.set(a, hy + s, b));
    const hEdge = th => 0.03 + 0.048 * Math.cos(th) + 0.004 * Math.cos(2 * th);
    helM.side = THREE.DoubleSide;
    add(helM, shell(helS, { cols: HSEG, s0: hEdge, s1: 0.203, step: phone ? 0.014 : 0.007, lip0: 0.016 }), one(BI.head));
    mats.strap = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, normalMap: tWeave }); mats.strap.userData.key = "strap";
    const strap = [V3(0.09, hy + 0.04, -0.02), V3(0.074, hy - 0.01, 0.0), V3(0.05, hy - 0.048, 0.024), V3(0.0, hy - 0.065, 0.042), V3(-0.05, hy - 0.048, 0.024), V3(-0.074, hy - 0.01, 0.0), V3(-0.09, hy + 0.04, -0.02)];
    add(mats.strap, sweep(strap, { rings: phone ? 16 : 32, cols: 6, r: () => [0.007, 0.0016], n: 3, caps: 0,
      up: (t, P) => V3(P.x, (P.y - hy) * 0.5, P.z - 0.01).normalize() }), one(BI.head));
  }

  if (outfit === "gi") {
    C.top = cloth("top", tWeave, 0.95, { normalScale: new THREE.Vector2(0.75, 0.75) }); C.pants = mats.pants = cloth("pants", tWeave, 0.95);
    // the jacket: heavy cotton, opening in a V to the belt, a thick collar all the way round, left over right below the belt
    const JK = [[0.76, 0.2, 0.135, 0.145, 0, -0.01, 2.2], [0.85, 0.195, 0.128, 0.14, 0, -0.01, 2.2], [0.93, 0.19, 0.12, 0.135, 0, -0.008, 2.2],
      [1.0, 0.176, 0.114, 0.12, 0, -0.004, 2.2], [1.04, 0.173, 0.114, 0.112, 0, 0, 2.2], [1.12, 0.176, 0.12, 0.108, 0, 0, 2.3],
      [1.2, 0.183, 0.127, 0.108, 0, 0, 2.3], [1.28, 0.191, 0.133, 0.11, 0, 0, 2.4], [1.34, 0.201, 0.13, 0.112, 0, -0.005, 2.6],
      [1.39, 0.208, 0.108, 0.108, 0, -0.01, 2.8], [1.43, 0.173, 0.088, 0.09, 0, -0.012, 2.6], [1.46, 0.102, 0.072, 0.074, 0, -0.012, 2.2], [1.482, 0.07, 0.065, 0.067, 0, -0.008, 2]];
    const jS = makeSurf(JK, vertMap(0, 0, 1));
    const tV = 1.275, ANG = 0.56;
    const top = th => { const a = Math.abs(th); return a >= ANG ? 1.482 : tV + (1.482 - tV) * Math.pow(a / ANG, 1.35); };
    const slope = th => { const h = 0.01; return (top(th + h) - top(th - h)) / (2 * h * 0.18); };
    const jD = (th, s) => {
      const dist = (top(th) - s) / Math.sqrt(1 + slope(th) * slope(th));
      const collar = 0.011 * (1 - sstep(0.035, 0.05, dist));
      const flapEdge = -0.12 - (tV - s) * 0.9;   // the outer flap's edge runs down and across
      const flap = s < tV + 0.01 ? 0.004 * sstep(flapEdge - 0.03, flapEdge, th) * sstep(tV + 0.01, tV - 0.01, s) : 0;
      return collar + flap + 0.003 * Math.sin(th * 4 + s * 11) * sstep(0.95, 0.8, s);
    };
    add(C.top, shell(jS, { cols: TSEG + 8, s0: 0.76, s1: top, step: STEP, d: jD, lip0: 0.01, lip1: 0.012, uu: 3, vv: 3 }), skirtW(0.55));
    const GS = capKeys(0.026).concat([[1.33, 0.075, 0.075, 0.075], [1.22, 0.071, 0.072, 0.07], [1.12, 0.069, 0.07, 0.068], [1.04, 0.068, 0.069, 0.067], [0.97, 0.066, 0.067, 0.066]]);
    SIDES.forEach(S => add(C.top, shell(armS(S, GS), { cols: SEG, s0: 0.97, s1: GS[0][0], step: STEP, lip0: 0.01,
      d: (th, y) => 0.003 * Math.sin(y * 40 + th * 2) * sstep(1.2, 1.0, y) }), armW(S)));
    // wide trousers ending above the ankle
    pantsSeat([[0.84, 0.05, 0.04, 0.05], [0.86, 0.16, 0.1, 0.115], [0.9, 0.19, 0.112, 0.13, 0, -0.005, 2.2], [0.96, 0.188, 0.106, 0.124, 0, -0.005, 2.2], [1.02, 0.174, 0.1, 0.104, 0, 0, 2.2]], C.pants);
    const GP = [[1.0, 0.02, 0.02, 0.02], [0.985, 0.07, 0.07, 0.07], [0.94, 0.105, 0.105, 0.108], [0.84, 0.11, 0.11, 0.108], [0.7, 0.103, 0.103, 0.1], [0.55, 0.097, 0.097, 0.095],
      [0.4, 0.093, 0.093, 0.093], [0.25, 0.09, 0.09, 0.09], [0.15, 0.088, 0.088, 0.088]];
    SIDES.forEach(S => add(C.pants, shell(makeSurf(GP, vertMap(AT["hip" + S][0] * 1.06, 0, S === "L" ? 1 : -1)),
      { cols: SEG + 4, s0: 0.15, s1: 1.0, step: STEP, lip0: 0.01, d: (th, y) => 0.004 * Math.sin(th * 3 + y * 9) + 0.003 * Math.sin(y * 31 + th) * sstep(0.4, 0.2, y) }), legW(S)));
    // the belt: a firm band, a square knot at the front and two tails
    const beltM = cloth("belt", tCanvas, 0.85); mats.belt = beltM;
    add(beltM, shell(jS, { cols: TSEG, s0: 0.976, s1: 1.022, step: 0.008, d: () => 0.008, lip0: 0.009, lip1: 0.009, uu: 4, vv: 1 }), torsoW);
    const fz = jS(0, 1.0, 0.017).z;
    const knot = new THREE.SphereGeometry(1, phone ? 12 : 20, phone ? 8 : 14); knot.scale(0.033, 0.027, 0.016); knot.rotateZ(0.12); knot.translate(0, 0.999, fz + 0.01);
    add(beltM, knot, torsoW);
    const tails = [[V3(-0.01, 0.99, fz + 0.012), V3(-0.03, 0.93, fz + 0.016), V3(-0.046, 0.84, fz + 0.024), V3(-0.052, 0.77, fz + 0.03)],
      [V3(0.01, 0.99, fz + 0.016), V3(0.028, 0.925, fz + 0.022), V3(0.04, 0.845, fz + 0.028), V3(0.046, 0.785, fz + 0.033)]];
    tails.forEach(pts => add(beltM, sweep(pts, { rings: phone ? 8 : 16, cols: 8, n: 4, r: () => [0.021, 0.0045], up: V3(0, 0, 1), caps: 1, capLen: 0.3 }), skirtW(0.3)));
    // bare feet
    SIDES.forEach(S => add(skinM, shell(makeSurf(FOOT, footMap(S)), { cols: phone ? 16 : 26, s0: -0.068, s1: 0.218, step: phone ? 0.012 : 0.006 }), footW(S)));
  }

  // the t-shirt hangs straight from the chest to the hips (no pinched waist), with a few soft folds low down
  const TEE = [[0.87, 0.203, 0.132, 0.136, 0, -0.008, 2.25], [0.95, 0.198, 0.128, 0.13, 0, -0.006, 2.25], [1.04, 0.186, 0.122, 0.116, 0, 0, 2.2],
    [1.12, 0.184, 0.124, 0.108, 0, 0, 2.25], [1.2, 0.187, 0.127, 0.106, 0, 0, 2.3], [1.27, 0.193, 0.128, 0.107, 0, 0, 2.4], [1.335, 0.199, 0.125, 0.11, 0, -0.005, 2.6],
    [1.385, 0.205, 0.103, 0.105, 0, -0.01, 2.8], [1.425, 0.175, 0.085, 0.09, 0, -0.012, 2.6], [1.455, 0.105, 0.07, 0.075, 0, -0.012, 2.2], [1.48, 0.07, 0.065, 0.067, 0, -0.008, 2]];
  const teeS = makeSurf(TEE, vertMap(0, 0, 1));
  if (outfit === "plain" || outfit === "apron") {
    C.top = cloth("top", tKnit, 0.92); C.trim = cloth("trim", tRib, 0.92); C.pants = cloth("pants", tKnit, 0.95);
    const shirtD = (th, s) => 0.0025 * Math.sin(th * 5 + s * 8) * sstep(0.9, 1.0, s) * sstep(1.2, 1.08, s) - 0.004 * sstep(0.9, 0.872, s);
    add(C.top, shell(teeS, { cols: TSEG, s0: 0.87, s1: 1.45, step: STEP, d: shirtD, lip0: 0.008, uu: 3, vv: 3 }), skirtW(0.85, 1.0, 0.88, 0.45));
    add(C.trim, shell(teeS, { cols: TSEG, s0: 1.445, s1: 1.478, step: 0.006, d: () => 0.002, lip1: 0.006, uu: 10, vv: 1 }), torsoW);
    // short sleeves (plain), or long sleeves pushed up past the elbow in soft rolls (apron)
    const TS = capKeys(0.016).concat([[1.33, 0.066, 0.065, 0.066], [1.27, 0.064, 0.064, 0.064], [1.2, 0.058, 0.06, 0.057], [1.12, 0.056, 0.057, 0.056], [1.06, 0.058, 0.058, 0.057]]);
    SIDES.forEach(S => {
      if (outfit === "plain") add(C.top, shell(armS(S, TS), { cols: SEG, s0: 1.27, s1: TS[0][0], step: STEP, lip0: 0.007 }), armW(S));
      else add(C.top, shell(armS(S, TS), { cols: SEG, s0: 1.06, s1: TS[0][0], step: STEP, lip0: 0.01,
        d: (th, y) => 0.006 * Math.pow(Math.max(0, Math.sin(y * 95 + 1.2 * Math.sin(th * 2))), 2) * sstep(1.2, 1.1, y) }), armW(S));
    });
    pantsSeat([[0.84, 0.05, 0.04, 0.05], [0.86, 0.15, 0.093, 0.108], [0.9, 0.176, 0.1, 0.12, 0, -0.005, 2.2], [0.96, 0.174, 0.096, 0.112, 0, -0.005, 2.2], [1.03, 0.16, 0.092, 0.096, 0, 0, 2.2]], C.pants);
    const JG = [[1.0, 0.02, 0.02, 0.02], [0.985, 0.058, 0.06, 0.06], [0.94, 0.079, 0.084, 0.088], [0.84, 0.088, 0.092, 0.091], [0.77, 0.088, 0.09, 0.087], [0.7, 0.087, 0.088, 0.084], [0.56, 0.072, 0.074, 0.07],
      [0.5, 0.07, 0.072, 0.069], [0.4, 0.068, 0.066, 0.074], [0.28, 0.06, 0.058, 0.064], [0.17, 0.054, 0.054, 0.056], [0.13, 0.05, 0.05, 0.05], [0.12, 0.041, 0.041, 0.041], [0.08, 0.038, 0.038, 0.038]];
    SIDES.forEach(S => {
      const s = makeSurf(JG, vertMap(AT["hip" + S][0] * 1.04, 0, S === "L" ? 1 : -1));
      add(C.pants, shell(s, { cols: SEG + 2, s0: 0.125, s1: 1.0, step: STEP, d: (th, y) => 0.003 * Math.sin(th * 3 + y * 8) + 0.004 * Math.sin(y * 60 + th) * sstep(0.3, 0.16, y) }), legW(S));
      add(C.trim, shell(s, { cols: SEG, s0: 0.082, s1: 0.128, step: 0.008, lip0: 0.006, uu: 6, vv: 1 }), legW(S));
    });
    shoes();
  }

  if (outfit === "apron") {
    // the apron: a bib on the chest, a skirt to the knee, a strap round the neck, ties in a bow at the back
    const apM = cloth("apron", tCanvas, 0.9); mats.apron = apM;
    const tieM = cloth("apronTie", tWeave, 0.9); mats.apronTie = tieM;
    const shirtS = makeSurf(TEE.map(k => [k[0], k[1] + 0.008, k[2] + 0.008, k[3] + 0.008, k[4], k[5], k[6]]), vertMap(0, 0, 1));   // just over the shirt
    const bibHalf = s => 0.62 - (s - 1.02) * 0.9;
    add(apM, shell(shirtS, { cols: phone ? 12 : 20, th0: -0.72, th1: 0.72, s0: 0.99, s1: 1.36, step: STEP, lip1: 0.006,
      d: (th, s) => 0.004 - 0.02 * sstep(bibHalf(s) - 0.12, bibHalf(s) + 0.05, Math.abs(th)) }), torsoW);
    const SK = [[0.5, 0.216, 0.17, 0.155], [0.62, 0.215, 0.165, 0.155], [0.74, 0.214, 0.158, 0.152], [0.86, 0.212, 0.146, 0.148, 0, 0, 2.2], [0.95, 0.206, 0.14, 0.14, 0, 0, 2.2], [1.02, 0.197, 0.134, 0.128, 0, 0, 2.2]];
    const skS = makeSurf(SK, vertMap(0, 0, 1));
    add(apM, shell(skS, { cols: phone ? 14 : 24, th0: -1.25, th1: 1.25, s0: 0.52, s1: 1.02, step: STEP, lip0: 0.006,
      d: (th, s) => 0.004 * Math.sin(th * 6 + s * 4) * sstep(0.9, 0.6, s) }), (p) => {
      const w = torsoW(p), k = 0.55 * sstep(0.95, 0.6, p.y);
      if (k <= 0) return w; w.forEach(x => x[1] *= 1 - k); w.push([BI.hipL, k * sstep(-0.06, 0.06, p.x)], [BI.hipR, k * (1 - sstep(-0.06, 0.06, p.x))]); return w;
    });
    add(tieM, shell(shirtS, { cols: TSEG, s0: 1.0, s1: 1.025, step: 0.006, d: () => 0.006, lip0: 0.004, lip1: 0.004, uu: 6, vv: 1 }), torsoW);
    [-1, 1].forEach(k => {   // the neck strap from each top corner of the bib round the back of the neck
      const c = shirtS(k * bibHalf(1.36) * 0.86, 1.355, 0.006);
      add(tieM, sweep([c, V3(k * 0.085, 1.44, 0.03), V3(k * 0.075, 1.485, -0.04), V3(0, 1.5, -0.075)], { rings: phone ? 8 : 16, cols: 6, n: 3, r: () => [0.011, 0.002], up: (t, P) => V3(P.x, 0.4, P.z).normalize(), caps: 0 }), torsoW);
      const b = shirtS(Math.PI, 1.012, 0.012);   // the bow at the back: a loop and a tail each side
      add(tieM, sweep([V3(0, b.y, b.z), V3(k * 0.04, b.y + 0.03, b.z - 0.012), V3(k * 0.07, b.y + 0.005, b.z - 0.01), V3(k * 0.03, b.y - 0.006, b.z - 0.004), V3(0, b.y, b.z - 0.002)], { rings: phone ? 10 : 18, cols: 6, n: 3, r: () => [0.01, 0.002], up: V3(0, 0, -1), caps: 0 }), torsoW);
      add(tieM, sweep([V3(0, b.y - 0.004, b.z - 0.004), V3(k * 0.025, b.y - 0.07, b.z - 0.012), V3(k * 0.04, b.y - 0.16, b.z - 0.01)], { rings: phone ? 8 : 14, cols: 6, n: 3, r: () => [0.011, 0.002], up: V3(0, 0, -1), caps: 1, capLen: 0.2 }), torsoW);
    });
    // hair tied back in a low bun, under a soft cotton cap with a band
    const capM = cloth("cap", tWeave, 0.9); mats.cap = capM;
    const bun = new THREE.SphereGeometry(1, phone ? 12 : 18, phone ? 10 : 14); bun.scale(0.032, 0.026, 0.026); bun.translate(0, hy - 0.004, -0.097);
    add(hairM, bun, one(BI.head));
    const capEdge = th => 0.065 + 0.045 * Math.cos(th) + 0.005 * Math.cos(2 * th);
    add(capM, shell(headS, { cols: HSEG, s0: capEdge, s1: 0.178, step: phone ? 0.014 : 0.007, lip0: 0.008, normal: true,
      d: (th, s) => 0.012 + 0.018 * sstep(0.1, 0.17, s) + 0.02 * sstep(0.6, 0.0, Math.abs(Math.abs(th) - Math.PI)) * sstep(0.0, 0.08, s) * sstep(0.15, 0.08, s) }), one(BI.head));
  }

  /* ── build the meshes: one skinned mesh per material ── */
  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(allBones);
  const meshes = [];
  let tris = 0;
  buckets.forEach((list, m) => {
    const g = mergeGeos(list); tris += g.index.count / 3;
    const mesh = new THREE.SkinnedMesh(g, m); mesh.name = "fig-" + (m.userData.key || "part");
    mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false;
    root.add(mesh); mesh.bind(skeleton, new THREE.Matrix4()); meshes.push(mesh);
  });

  /* ── colors ── */
  function setColors(c) {
    Object.assign(colors, c || {});
    Object.values(mats).forEach(m => { const k = m.userData.key; if (k && colors[k] != null) m.color.copy(toColor(colors[k], "#888888")); });
    if (mats.skin && !phone && mats.skin.sheenColor) mats.skin.sheenColor.copy(mats.skin.color).lerp(new THREE.Color("#ffd2b8"), 0.5);
    Object.values(mats).forEach(m => { if (m.sheenColor && m !== mats.skin) m.sheenColor.copy(m.color).lerp(new THREE.Color("#ffffff"), 0.35); });
  }
  if (!colors.trim && colors.top) colors.trim = colors.top;
  setColors();

  /* ── hands: grip and pinch ── */
  const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _ax = new THREE.Vector3();
  function curlFinger(H, nm, a, b, c, splay) {
    const bs = H[nm]; _ax.set(0, 0, -H.sx);
    bs[0].quaternion.setFromAxisAngle(_ax, a * D2R); if (splay) bs[0].quaternion.premultiply(_q2.setFromAxisAngle(_ax.set(H.sx, 0, 0), splay * D2R));
    bs[1].quaternion.setFromAxisAngle(_ax.set(0, 0, -H.sx), b * D2R); bs[2].quaternion.setFromAxisAngle(_ax, c * D2R);
  }
  function thumbPose(H, opp, f1, f2) {
    const D = H.thD, axOpp = new THREE.Vector3().crossVectors(D, H.palmN).normalize();
    const F = V3(0, 0, -1).addScaledVector(H.palmN, 0.6).normalize(), axF = new THREE.Vector3().crossVectors(D, F).normalize();
    H.thb[0].quaternion.setFromAxisAngle(axOpp, opp * D2R);
    H.thb[1].quaternion.setFromAxisAngle(axF, f1 * D2R); H.thb[2].quaternion.setFromAxisAngle(axF, f2 * D2R);
  }
  const THUMB = {};   // thumb angles found once per side: open, closed round a handle, and pinching the index tip
  const _m = new THREE.Matrix4();
  function boneLocal(S, b, off) { const w = bones["wrist" + S]; w.updateMatrixWorld(true); _m.copy(w.matrixWorld).invert(); return (off ? off.clone() : V3(0, 0, 0)).applyMatrix4(b.matrixWorld).applyMatrix4(_m); }
  function tipLocal(S, nm) {   // the tip of a finger in its wrist's space
    const H = HB[S], len = nm === "thb" ? TH_L[2] : FING.find(f => f[0] === nm)[3][2];
    return boneLocal(S, H[nm][2], nm === "thb" ? H.thD.clone().multiplyScalar(len) : V3(0, -len, 0));
  }
  function solveThumb(S, target) {   // search the thumb's three angles so its tip lands on a point (wrist space)
    const H = HB[S]; let best = [20, 10, 10], bd = 1e9;
    const cost = t => { thumbPose(H, t[0], t[1], t[2]); bones["wrist" + S].updateMatrixWorld(true); return tipLocal(S, "thb").distanceTo(target) + 0.00005 * (Math.max(0, -t[2]) + Math.max(0, -t[1])); };
    for (let o = -40; o <= 100; o += 10) for (let f1 = -30; f1 <= 80; f1 += 10) for (let f2 = -10; f2 <= 80; f2 += 15) { const d = cost([o, f1, f2]); if (d < bd) { bd = d; best = [o, f1, f2]; } }
    let st = 5;
    for (let it = 0; it < 40 && st > 0.2; it++) {
      let moved = false;
      for (let k = 0; k < 3; k++) for (const sg of [-1, 1]) { const t = best.slice(); t[k] += sg * st; const d = cost(t); if (d < bd) { bd = d; best = t; moved = true; } }
      if (!moved) st /= 2;
    }
    return best;
  }
  function fingersFor(H, g, pin) {
    if (pin) { const c = H.pinchIdx || [46, 46, 22]; curlFinger(H, "idx", c[0], c[1], c[2]); curlFinger(H, "mid", 52, 64, 40); curlFinger(H, "rng", 62, 78, 50); curlFinger(H, "lit", 70, 85, 55); return; }
    const r = 6 + g * 74;
    curlFinger(H, "idx", r * 0.92, 8 + g * 88, 6 + g * 58, (1 - g) * 2); curlFinger(H, "mid", r, 9 + g * 92, 7 + g * 60);
    curlFinger(H, "rng", r * 1.05, 10 + g * 94, 8 + g * 62, -(1 - g) * 2); curlFinger(H, "lit", r * 1.1, 11 + g * 95, 9 + g * 64, -(1 - g) * 5);
  }
  function thumbSets(S) {
    if (THUMB[S]) return THUMB[S];
    const H = HB[S], T = {};
    T.open = [8, 4, 4];
    fingersFor(H, 1, false); bones["wrist" + S].updateMatrixWorld(true);
    const over = boneLocal(S, H.idx[2]).add(boneLocal(S, H.mid[2])).multiplyScalar(0.5).addScaledVector(H.palmN, 0.016);
    T.fist = solveThumb(S, over);
    let bestD = 1e9;
    for (const c of [[40, 40, 20], [50, 50, 20], [55, 60, 25], [60, 65, 30], [65, 70, 30], [70, 75, 35], [45, 70, 40], [55, 80, 45]]) {
      H.pinchIdx = c; fingersFor(H, 0.5, true); bones["wrist" + S].updateMatrixWorld(true);
      const tip = tipLocal(S, "idx"), base = boneLocal(S, H.thb[0]);
      const goal = tip.clone().addScaledVector(base.sub(tip).normalize(), 0.0145), t = solveThumb(S, goal);
      thumbPose(H, t[0], t[1], t[2]); const d = tipLocal(S, "thb").distanceTo(goal);
      if (d < bestD - 0.002) { bestD = d; T.pinch = t; T.pinchIdx = c; }
    }
    H.pinchIdx = T.pinchIdx;
    return (THUMB[S] = T);
  }
  function applyHand(S) {
    const H = HB[S], g = clamp(H.grip, 0, 1), T = thumbSets(S);
    fingersFor(H, g, H.pinch);
    const t = H.pinch ? T.pinch : T.open.map((v, k) => v + (T.fist[k] - v) * g);
    thumbPose(H, t[0], t[1], t[2]);
    bones["wrist" + S].updateMatrixWorld(true);
    // the anchor: in the palm for a handle; between the thumb and index tips for a pinch
    if (H.pinch) H.anchor.position.copy(tipLocal(S, "idx")).add(tipLocal(S, "thb")).multiplyScalar(0.5);
    else H.anchor.position.copy(H.anchorHome);
  }
  const sideKey = s => (s === "R" || s === "right" || s === "r") ? "R" : "L";
  function grip(side, amount) { const S = sideKey(side); HB[S].grip = clamp(+amount || 0, 0, 1); HB[S].pinch = false; applyHand(S); }
  function pinch(side, on) { const S = sideKey(side); HB[S].pinch = !!on; if (on) HB[S].grip = 0.5; applyHand(S); }

  /* ── poses ── */
  const _e = new THREE.Euler();
  function jointAngles(p, n) { return (p && p.j && p.j[n]) || REST.j[n] || null; }
  function setPose(p) {
    p = p || REST;
    const r = p.root || {}, pos = r.pos || [0, 0, 0], rot = r.rot || [0, 0, 0];
    body.position.set(pos[0], pos[1], pos[2]); body.rotation.set(rot[0] * D2R, rot[1] * D2R, rot[2] * D2R, "YXZ");
    for (let i = 0; i < JOINTS.length; i++) { const n = JOINTS[i], a = jointAngles(p, n); if (a) bones[n].rotation.set(a[0] * D2R, a[1] * D2R, a[2] * D2R, "XYZ"); else bones[n].rotation.set(0, 0, 0, "XYZ"); }
    ["L", "R"].forEach(S => {
      const H = HB[S]; let ch = false;
      if (p.grip && p.grip[S] != null && p.grip[S] !== H.grip) { H.grip = clamp(+p.grip[S], 0, 1); ch = true; }
      if (p.pinch && p.pinch[S] != null && !!p.pinch[S] !== H.pinch) { H.pinch = !!p.pinch[S]; ch = true; }
      if (ch) applyHand(S);
    });
    update();
  }
  const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
  function blend(a, b, u) {
    a = a || REST; b = b || REST;
    const ra = a.root || {}, rb = b.root || {}, L = (x, y) => x + (y - x) * u;
    const pa = ra.pos || [0, 0, 0], pb = rb.pos || [0, 0, 0], oa = ra.rot || [0, 0, 0], ob = rb.rot || [0, 0, 0];
    const out = { root: { pos: [L(pa[0], pb[0]), L(pa[1], pb[1]), L(pa[2], pb[2])], rot: [L(oa[0], ob[0]), L(oa[1], ob[1]), L(oa[2], ob[2])] }, j: {} };
    JOINTS.forEach(n => {
      const ea = jointAngles(a, n) || [0, 0, 0], eb = jointAngles(b, n) || [0, 0, 0];
      if (ea[0] === eb[0] && ea[1] === eb[1] && ea[2] === eb[2]) { out.j[n] = ea.slice(); return; }
      _qa.setFromEuler(_e.set(ea[0] * D2R, ea[1] * D2R, ea[2] * D2R, "XYZ")); _qb.setFromEuler(_e.set(eb[0] * D2R, eb[1] * D2R, eb[2] * D2R, "XYZ"));
      _qa.slerp(_qb, u); _e.setFromQuaternion(_qa, "XYZ"); out.j[n] = [_e.x / D2R, _e.y / D2R, _e.z / D2R];
    });
    if (a.grip || b.grip) { out.grip = {}; ["L", "R"].forEach(S => { const x = a.grip && a.grip[S] != null ? a.grip[S] : HB[S].grip, y = b.grip && b.grip[S] != null ? b.grip[S] : HB[S].grip; out.grip[S] = L(x, y); }); }
    if (a.pinch || b.pinch) { out.pinch = {}; ["L", "R"].forEach(S => { out.pinch[S] = !!((u < 0.5 ? a : b).pinch || {})[S]; }); }
    return out;
  }
  function update() { root.updateMatrixWorld(true); }

  /* ── reaching: two-joint IK for legs and arms ── */
  const LEN = {
    leg: [AT.hipL[1] - AT.kneeL[1], AT.kneeL[1] - AT.ankleL[1]],
    arm: [AT.shoulderL[1] - AT.elbowL[1], AT.elbowL[1] - AT.wristL[1]] };
  const _inv = new THREE.Matrix4(), _T = new THREE.Vector3(), _P = new THREE.Vector3(), _M1 = new THREE.Matrix4(), _M2 = new THREE.Matrix4();
  function solve2(upper, lower, l1, l2, target, pole, bend, soft) {   // bend +1: a knee (bends back, points forward); −1: an elbow
    const parent = upper.parent; parent.updateWorldMatrix(true, false);
    _inv.copy(parent.matrixWorld).invert();
    _T.copy(target).applyMatrix4(_inv).sub(upper.position);
    _P.copy(pole).applyMatrix4(_inv).sub(upper.position);
    let D = _T.length();
    if (soft) {   // soft reach: the last few percent straighten gently, so the elbow never snaps
      const L = l1 + l2, ds = L * soft;
      if (D > ds) D = ds + (L - ds) * (1 - Math.exp(-(D - ds) / (L - ds)));
    }
    D = clamp(D, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-5);
    const phi = Math.PI - Math.acos(clamp((l1 * l1 + l2 * l2 - D * D) / (2 * l1 * l2), -1, 1));
    lower.rotation.set(bend * phi, 0, 0, "XYZ");
    const a = V3(0, -l1 - l2 * Math.cos(phi), -bend * l2 * Math.sin(phi)).normalize();
    const lp = V3(0, 0, bend); lp.addScaledVector(a, -lp.dot(a)).normalize();
    const x2 = _T.lengthSq() > 1e-10 ? _T.clone().normalize() : V3(0, -1, 0);
    let y2 = _P.clone().addScaledVector(x2, -_P.dot(x2));
    if (y2.lengthSq() < 1e-8) y2 = V3(0, 0, bend).addScaledVector(x2, -x2.z * bend);
    y2.normalize();
    _M1.makeBasis(a, lp, new THREE.Vector3().crossVectors(a, lp));
    _M2.makeBasis(x2, y2, new THREE.Vector3().crossVectors(x2, y2));
    upper.quaternion.setFromRotationMatrix(_M2.multiply(_M1.transpose()));
    upper.updateMatrixWorld(true);
  }
  // a natural pole when none is given: knees forward and a little out; elbows down, back and out (never flipping up)
  function autoPole(kind, S, target) {
    const sx = S === "L" ? 1 : -1, ref = kind === "leg" ? bones.pelvis : bones.chest;
    ref.updateWorldMatrix(true, false);
    const j = bones[(kind === "leg" ? "hip" : "shoulder") + S].getWorldPosition(new THREE.Vector3());
    const q = ref.getWorldQuaternion(new THREE.Quaternion());
    const off = kind === "leg" ? V3(sx * 0.12, 0, 1) : V3(sx * 0.55, -0.85, -0.45);
    // reaching up high or far behind, swing the elbow out to the side so it never flips over
    if (kind === "arm" && target) {
      const lt = target.clone().sub(j).applyQuaternion(q.clone().invert());
      if (lt.y > 0.1) off.set(sx * 0.9, -0.3 + clamp(lt.y, 0, 0.5) * 0.2, -0.5);
    }
    return j.add(off.applyQuaternion(q));
  }
  function footTo(S, o) {
    const ank = bones["ankle" + S], knee = bones["knee" + S]; knee.updateWorldMatrix(true, false);
    const up = (o.up || V3(0, 1, 0)).clone().normalize();
    let fw = o.forward ? o.forward.clone() : V3(0, 0, 1).applyQuaternion(body.getWorldQuaternion(new THREE.Quaternion()));
    fw.addScaledVector(up, -fw.dot(up)).normalize();
    const x = new THREE.Vector3().crossVectors(up, fw).normalize();
    const qw = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up, fw));
    ank.quaternion.copy(knee.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qw));
    ank.updateMatrixWorld(true);
  }
  const ik = {
    leg(side, target, pole, o) {
      const S = sideKey(side); o = o || {};
      solve2(bones["hip" + S], bones["knee" + S], LEN.leg[0], LEN.leg[1], target, pole || autoPole("leg", S, target), 1);
      if (o.footFlat || o.up || o.forward) footTo(S, o);
    },
    arm(side, target, pole, o) {
      const S = sideKey(side);
      solve2(bones["shoulder" + S], bones["elbow" + S], LEN.arm[0], LEN.arm[1], target, pole || autoPole("arm", S, target), -1, o && o.exact ? 0 : 0.965);
    }
  };

  /* ── looking ── */
  const _lq = new THREE.Quaternion();
  function lookAt(point, amount) {
    const k = amount == null ? 1 : clamp(amount, 0, 1);
    bones.chest.updateWorldMatrix(true, false);
    const head = bones.head.getWorldPosition(new THREE.Vector3()).add(V3(0, 0.08, 0));
    const inv = bones.chest.getWorldQuaternion(new THREE.Quaternion()).invert();
    const d = point.clone().sub(head).applyQuaternion(inv);
    const yaw = clamp(Math.atan2(d.x, d.z), -75 * D2R, 75 * D2R), pitch = clamp(-Math.atan2(d.y, Math.hypot(d.x, d.z)), -40 * D2R, 45 * D2R);
    bones.neck.quaternion.slerp(_lq.setFromEuler(_e.set(pitch * 0.4, yaw * 0.4, 0, "YXZ")), k);
    bones.head.quaternion.slerp(_lq.setFromEuler(_e.set(pitch * 0.6, yaw * 0.6, 0, "YXZ")), k);
    bones.neck.updateMatrixWorld(true);
  }
  function world(j) { const b = bones[j] || allBones.find(x => x.name === j); if (!b) return null; return b.getWorldPosition(new THREE.Vector3()); }
  // the sole: heel, middle, ball and toe, under the shoe (or the bare foot)
  const SOLE_PTS = [[-0.07, 0, "ankle"], [0.0, 0, "ankle"], [0.07, 0, "ankle"], [0.13, 0, "toe"], [0.19, outfit === "gi" ? 0.004 : 0.006, "toe"]];
  function footFloor(side) {
    const S = sideKey(side); let m = Infinity; const v = new THREE.Vector3();
    SOLE_PTS.forEach(([z, y, b]) => {
      const bn = bones[b + S], a = AT[b + S]; bn.updateWorldMatrix(true, false);
      v.set(AT["ankle" + S][0] - a[0], y - a[1], z - a[2]).applyMatrix4(bn.matrixWorld); m = Math.min(m, v.y);
    });
    return m;
  }

  let disposed = false;
  function dispose() {
    if (disposed) return; disposed = true;
    meshes.forEach(m => { m.geometry.dispose(); });
    Object.values(mats).forEach(m => m.dispose()); texs.forEach(t => t.dispose());
    skeleton.dispose();
    if (root.parent) root.parent.remove(root);
  }

  ["L", "R"].forEach(S => { HB[S].grip = 0.12; applyHand(S); });
  setPose(REST);

  return {
    root, body, bones, skeleton, outfit, colors, quality: phone ? "phone" : "full",
    info: { segments: SEG, torsoSegments: TSEG, triangles: tris, meshes: meshes.length },
    setPose, blend, update, ik, lookAt, world, footFloor, setColors, dispose,
    hand: side => HB[sideKey(side)].anchor,
    grip, pinch,
    tip: (side, finger) => { const S = sideKey(side), H = HB[S]; const b = H[finger || "idx"][2]; const len = finger === "thb" ? TH_L[2] : FING.find(f => f[0] === (finger || "idx"))[3][2];
      return (finger === "thb" ? H.thD.clone().multiplyScalar(len) : V3(0, -len, 0)).applyMatrix4(b.matrixWorld); },
    get disposed() { return disposed; }
  };
}
