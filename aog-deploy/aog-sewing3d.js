/* The Sewing Room in 3D (AOG-SEWING-3D-V1, 2026-10-12)
   Jimmy: "I want more realism, not sharp straight lines … hit the ceiling" and "silent when not being used … lighting fast".
   A sunny sewing room: a wooden table, a sewing machine with a rounded casting, a pincushion, shears, a measuring tape,
   an ironing board and an iron, a window with soft light (a lamp at night). A person (the shared figure, outfit "plain",
   no face) sews. Every picture is drawn from one state from the engine in aog-sewing.js (sample(timeline, t)); this file
   only turns that state into meshes. It draws only when the page asks (render): a step playing, a drag, a resize, the
   theme. Nothing here asks for frames by itself. dispose() gives everything back.
   Frames: world (meters, y up, the figure at the hand station faces −z); the work in the hand ("work", see the engine);
   the cutting table ("cut": around LAYOUT.cut.cloth on the table top); the ironing board ("press"). */
import { makeStage, THREE } from "/aog-3dkit.js";
import { RoundedBoxGeometry } from "/vendor/three-0.160.0/addons/geometries/RoundedBoxGeometry.js";

const DEG = Math.PI / 180;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };

export async function create(kit) {
  const E = kit.engine, LAY = E.LAYOUT, M_ = LAY.machine, NP = M_.NP, TY = LAY.TABLE_Y;
  const stage = makeStage({ host: kit.host, before: kit.host.firstChild, dark: kit.dark(), fov: 34, fogNear: 7, fogFar: 26, autoResize: false,
    light: { bg: "#efe9de", fog: "#efe9de", sunI: 1.9, exposure: 0.84 }, darkLook: { bg: "#151b26", fog: "#151b26", sunI: 0.5, env: 0.36, exposure: 0.95 } });
  const { scene, camera, renderer } = stage;
  const phone = stage.phone;
  stage.canvas.classList.add("gl");
  const SEG = phone ? 16 : 28;
  const owned = [];   // textures this file made (the kit disposes everything in the scene too)
  const keep = t => { owned.push(t); return t; };
  let rng = 11; const rnd = () => (rng = (rng * 16807) % 2147483647) / 2147483647;

  /* ═════════ textures, drawn once ═════════ */
  function ctex(w, h, draw, srgb = true) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = phone ? 4 : 8;
    return keep(t);
  }
  // a height field → a normal map
  function normalTex(w, h, height, k) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"), img = g.createImageData(w, h);
    const H = (x, y) => height(((x % w) + w) % w, ((y % h) + h) % h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * k, dy = (H(x, y + 1) - H(x, y - 1)) * k, l = Math.hypot(dx, dy, 1), i = (y * w + x) * 4;
      img.data[i] = (-dx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = phone ? 4 : 8; return keep(t);
  }
  // plain weave: 16 warp and 16 weft threads, each going over one and under one
  const WV = 128, WN = 16, cell = WV / WN;
  const weaveH = (x, y) => {
    const i = Math.floor(x / cell), j = Math.floor(y / cell), fx = (x % cell) / cell, fy = (y % cell) / cell;
    const warpOver = (i + j) % 2 === 0;
    const across = Math.sin(fx * Math.PI), along = Math.sin(fy * Math.PI);
    return warpOver ? 0.55 + 0.45 * across * (0.75 + 0.25 * Math.sin(fy * Math.PI)) : 0.55 + 0.45 * along * (0.75 + 0.25 * Math.sin(fx * Math.PI));
  };
  const weaveN = normalTex(WV, WV, weaveH, 1.6);
  const weaveMap = ctex(WV, WV, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 150 + weaveH(x, y) * 105 + (rnd() - 0.5) * 14, i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = clamp(v, 0, 255); img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  });
  const feltMap = ctex(128, 128, (g, w, h) => { g.fillStyle = "#e8e8e8"; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.strokeStyle = `rgba(${rnd() < 0.5 ? "0,0,0" : "255,255,255"},${rnd() * 0.12})`; g.beginPath(); const x = rnd() * w, y = rnd() * h, a = rnd() * 6.3; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5); g.stroke(); } });
  const feltN = normalTex(64, 64, (x, y) => Math.sin(x * 0.9) * Math.cos(y * 1.1) * 0.3 + ((x * 7 + y * 13) % 5) / 10, 0.6);
  const gingham = ctex(128, 128, (g, w, h) => {
    g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(70,110,160,0.42)"; for (let i = 0; i < 4; i++) { g.fillRect(i * 32, 0, 16, h); g.fillRect(0, i * 32, w, 16); }
    const img = g.getImageData(0, 0, w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = (y * w + x) * 4, v = 0.9 + 0.1 * weaveH(x, y); img.data[k] *= v; img.data[k + 1] *= v; img.data[k + 2] *= v; } g.putImageData(img, 0, 0);
  });
  // a twisted thread: diagonal plies
  const plyMap = ctex(32, 32, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,0,0,0.32)"; g.lineWidth = 5; for (let i = -2; i < 4; i++) { g.beginPath(); g.moveTo(i * 12, 0); g.lineTo(i * 12 + 16, h); g.stroke(); } g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; for (let i = -2; i < 4; i++) { g.beginPath(); g.moveTo(i * 12 + 6, 0); g.lineTo(i * 12 + 22, h); g.stroke(); } });
  const woodMap = ctex(512, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, "#b98a5c"); grd.addColorStop(1, "#a97a4e"); g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { const y = rnd() * h, a = rnd() * 0.16; g.strokeStyle = `rgba(80,45,20,${a})`; g.lineWidth = 0.6 + rnd() * 1.6; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3 + (rnd() - 0.5) * 1.5); g.stroke(); }
    for (let k = 0; k < 3; k++) { const x = rnd() * w, y = rnd() * h; const gr = g.createRadialGradient(x, y, 1, x, y, 18); gr.addColorStop(0, "rgba(70,40,15,0.5)"); gr.addColorStop(1, "rgba(70,40,15,0)"); g.fillStyle = gr; g.fillRect(x - 20, y - 20, 40, 40); }
  });
  const floorMap = ctex(512, 512, (g, w, h) => {
    const n = 6; for (let i = 0; i < n; i++) { const l = 150 + rnd() * 40; g.fillStyle = `rgb(${l},${l * 0.74 | 0},${l * 0.52 | 0})`; g.fillRect(0, i * h / n, w, h / n);
      for (let k = 0; k < 50; k++) { g.fillStyle = `rgba(60,30,10,${rnd() * 0.1})`; g.fillRect(0, i * h / n + rnd() * h / n, w, 1); }
      g.fillStyle = "rgba(40,20,5,0.4)"; g.fillRect(0, i * h / n, w, 2); g.fillRect(((i * 211) % w), i * h / n, 2, h / n); }
  });
  const plateMap = ctex(256, 256, (g, w, h) => {
    // the throat plate seen from above: 256 px = 12 cm (x) by 12 cm (z); the needle at the center; seam guides on the right
    g.fillStyle = "#c9ccd0"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.12})`; g.fillRect(rnd() * w, rnd() * h, 2, 1); }
    const px = m => w / 2 + m / 0.12 * w;
    g.fillStyle = "#3a3f46";
    g.fillRect(px(-0.004), h / 2 - 9, px(0.004) - px(-0.004), 18);          // the needle slot
    [-0.0065, 0.0045].forEach(x => g.fillRect(px(x), h / 2 - 20, px(x + 0.002) - px(x), 40)); // feed dog slots
    g.strokeStyle = "#4a5058"; g.lineWidth = 1.2;
    [[0.01, "1"], [0.013, ""], [0.0159, "5/8"], [0.02, "2"]].forEach(([m, lab]) => {
      g.lineWidth = lab === "5/8" ? 2.4 : 1.2; g.beginPath(); g.moveTo(px(m), 6); g.lineTo(px(m), h - 6); g.stroke();
      if (lab) { g.fillStyle = "#3a3f46"; g.font = "bold 11px sans-serif"; g.fillText(lab, px(m) + 3, 18); }
    });
  });
  const boardMap = ctex(128, 128, (g, w, h) => { g.fillStyle = "#e7e4dd"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(120,140,160,0.22)"; for (let i = 0; i < 8; i++) g.fillRect(0, i * 16, w, 4); for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.04})`; g.fillRect(rnd() * w, rnd() * h, 1, 1); } });
  const patternMap = ctex(512, 384, (g, w, h) => {
    // the pattern tissue: the cutting line at the edge, a dashed seam line 1.5 cm in, a grain arrow and notches (no words)
    g.fillStyle = "#eadcb8"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(120,90,40,${rnd() * 0.05})`; g.fillRect(rnd() * w, rnd() * h, 3, 1); }
    const sx = w / E.PAT.w, inset = 0.015 * sx;
    g.strokeStyle = "#5a4630"; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
    g.setLineDash([10, 7]); g.lineWidth = 2; g.strokeRect(inset, inset, w - 2 * inset, h - 2 * inset); g.setLineDash([]);
    g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.22, h * 0.5); g.lineTo(w * 0.78, h * 0.5); g.stroke();
    [[0.22, -1], [0.78, 1]].forEach(([x, d]) => { g.beginPath(); g.moveTo(w * x, h * 0.5); g.lineTo(w * x - d * 16, h * 0.5 - 10); g.moveTo(w * x, h * 0.5); g.lineTo(w * x - d * 16, h * 0.5 + 10); g.stroke(); });
    g.fillStyle = "#5a4630"; [[w - 4, h * 0.5, -1]].forEach(([x, y, d]) => { g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + d * 14, y); g.lineTo(x, y + 9); g.fill(); });
  });
  const rulerMap = ctex(512, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(20,30,40,0.85)"; for (let i = 0; i <= 100; i++) { g.lineWidth = i % 10 ? 1 : 2; g.beginPath(); g.moveTo(i * w / 100, 0); g.lineTo(i * w / 100, i % 10 ? 10 : 20); g.stroke(); } g.strokeStyle = "rgba(200,60,40,0.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, h * 0.75); g.lineTo(w, h * 0.75); g.stroke(); });
  const tapeMap = ctex(512, 32, (g, w, h) => { g.fillStyle = "#f0d64a"; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; for (let i = 0; i <= 50; i++) g.fillRect(i * w / 50, 0, 1.5, i % 5 ? 8 : 14); });

  /* ═════════ materials ═════════ */
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.8, metalness: 0 }, o));
  const phys = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ roughness: 0.6, metalness: 0 }, o));
  const MAT = {
    wood: std({ map: woodMap, roughness: 0.55, color: "#ffffff" }),
    woodDk: std({ map: woodMap, roughness: 0.6, color: "#c9b49a" }),
    floor: std({ map: floorMap, roughness: 0.62 }),
    wall: std({ color: "#ece4d6", roughness: 0.95 }),
    trim: std({ color: "#f6f2ea", roughness: 0.7 }),
    sky: new THREE.MeshBasicMaterial({ color: "#eaf3f7", fog: false }),
    curtain: phys({ color: "#d9c9a6", roughness: 0.9, sheen: 1, sheenRoughness: 0.6, sheenColor: new THREE.Color("#fff3d9"), side: THREE.DoubleSide, map: weaveMap, normalMap: weaveN }),
    cast: phys({ color: "#e9e1cf", roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.18 }),
    castAcc: phys({ color: "#6f948b", roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    chrome: std({ color: "#dfe3e8", metalness: 1, roughness: 0.18 }),
    steel: std({ color: "#c8ccd2", metalness: 1, roughness: 0.28 }),
    dark: std({ color: "#2a2d33", roughness: 0.5 }),
    plate: std({ map: plateMap, metalness: 0.9, roughness: 0.32 }),
    clear: phys({ color: "#ffffff", transmission: 0.0, transparent: true, opacity: 0.28, roughness: 0.05, clearcoat: 1 }),
    lamp: new THREE.MeshBasicMaterial({ color: "#fff1c8" }),
    rubber: std({ color: "#33363c", roughness: 0.85 }),
    thread: std({ color: "#b3263a", roughness: 0.62, map: plyMap }),
    threadB: std({ color: "#2b55a8", roughness: 0.62, map: plyMap }),
    spoolWood: std({ map: woodMap, color: "#e8d6b8", roughness: 0.5 }),
    clothTop: phys({ color: "#dccfb4", map: weaveMap, normalMap: weaveN, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.92, sheen: 0.6, sheenRoughness: 0.7, sheenColor: new THREE.Color("#fff6e6") }),
    clothBot: phys({ color: "#a9c0a8", map: weaveMap, normalMap: weaveN, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.92, sheen: 0.6, sheenRoughness: 0.7, sheenColor: new THREE.Color("#f2fff0") }),
    feltA: phys({ color: "#7fa1c2", map: feltMap, normalMap: feltN, roughness: 1, sheen: 0.8, sheenRoughness: 0.9, sheenColor: new THREE.Color("#dfeeff") }),
    feltB: phys({ color: "#e7d9b5", map: feltMap, normalMap: feltN, roughness: 1, sheen: 0.8, sheenRoughness: 0.9, sheenColor: new THREE.Color("#fff8e0") }),
    hem: phys({ color: "#8fa9c6", map: weaveMap, normalMap: weaveN, roughness: 0.9, sheen: 0.6, sheenRoughness: 0.7, sheenColor: new THREE.Color("#eef5ff") }),
    mfab: phys({ color: "#c7d6de", map: weaveMap, normalMap: weaveN, roughness: 0.9, sheen: 0.6, sheenRoughness: 0.7, sheenColor: new THREE.Color("#f4fbff") }),
    mfabW: phys({ color: "#dde6ea", map: weaveMap, normalMap: weaveN, roughness: 0.92, sheen: 0.5, sheenRoughness: 0.7, sheenColor: new THREE.Color("#f4fbff") }),
    gingham: phys({ map: gingham, normalMap: weaveN, roughness: 0.9, sheen: 0.5, sheenRoughness: 0.7, sheenColor: new THREE.Color("#ffffff") }),
    tissue: std({ map: patternMap, roughness: 0.85, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    button: phys({ color: "#e0ad45", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
    buttonS: phys({ color: "#2f3a52", roughness: 0.2, metalness: 0.2, clearcoat: 1 }),
    pinHeadR: phys({ color: "#d23d3d", roughness: 0.15, clearcoat: 1 }), pinHeadY: phys({ color: "#e9b52c", roughness: 0.15, clearcoat: 1 }), pinHeadB: phys({ color: "#3a72c4", roughness: 0.15, clearcoat: 1 }),
    cushion: phys({ color: "#c8423a", roughness: 0.85, sheen: 1, sheenColor: new THREE.Color("#ffb3a8"), sheenRoughness: 0.5, map: weaveMap, normalMap: weaveN }),
    leaf: std({ color: "#4f7f45", roughness: 0.7 }),
    shearBlade: std({ color: "#d8dde3", metalness: 1, roughness: 0.22 }),
    shearHandle: phys({ color: "#2f4f6f", roughness: 0.4, clearcoat: 0.5 }),
    toothpick: std({ color: "#e2c58f", roughness: 0.8 }),
    chalk: std({ color: "#5d86c9", roughness: 0.95 }),
    chalkLine: new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.8 }),
    ruler: phys({ map: rulerMap, transparent: true, opacity: 0.55, roughness: 0.1, clearcoat: 1, side: THREE.DoubleSide }),
    tape: std({ map: tapeMap, roughness: 0.6, side: THREE.DoubleSide }),
    tapeCase: phys({ color: "#e7b628", roughness: 0.35, clearcoat: 0.6 }),
    board: phys({ map: boardMap, roughness: 0.95, sheen: 0.4, sheenColor: new THREE.Color("#ffffff") }),
    ironShell: phys({ color: "#4f8a8b", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.12 }),
    ironWhite: phys({ color: "#f2f1ed", roughness: 0.3, clearcoat: 0.8 }),
    cord: std({ color: "#f1efea", roughness: 0.6 }),
    outlet: std({ color: "#f3f1ec", roughness: 0.5 }),
    hl: std({ color: "#f2c14e", emissive: "#f2b33a", emissiveIntensity: 0.35, roughness: 0.4, transparent: true, opacity: 0.55, depthWrite: false })
  };
  // threads: the plies run along the length (set per geometry by its own length)
  const threadM = { top: MAT.thread, bob: MAT.threadB };

  /* ═════════ geometry helpers ═════════ */
  const rbox = (w, h, d, r, seg) => new RoundedBoxGeometry(w, h, d, seg || (phone ? 3 : 5), r);
  function lathe(pts, seg) { return new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg || SEG); }
  function roundedShape(w, h, r, cx = 0, cy = 0) {
    const s = new THREE.Shape(), x = cx - w / 2, y = cy - h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function extrude(shape, depth, bevel, segs) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: segs || (phone ? 3 : 6), curveSegments: phone ? 10 : 20 });
    g.computeVertexNormals(); return g;
  }
  function mesh(geo, mat, parent, cast = true, recv = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; if (parent) parent.add(m); return m; }
  // a tube along points (smooth); u along the length counts in meters/period so the plies stay the same size
  function tubeGeo(pts, r, period, radial, closed) {
    const vs = pts.map(p => (p.isVector3 ? p : V(p[0], p[1], p[2])));
    const clean = [vs[0]]; for (let i = 1; i < vs.length; i++) if (vs[i].distanceToSquared(clean[clean.length - 1]) > 1e-12) clean.push(vs[i]);
    if (clean.length < 2) clean.push(clean[0].clone().add(V(0, 1e-5, 0)));
    const curve = new THREE.CatmullRomCurve3(clean, !!closed, "centripetal");
    const L = curve.getLength();
    const n = Math.max(4, Math.min(phone ? 900 : 1800, Math.ceil(L / (r * 1.6))));
    const g = new THREE.TubeGeometry(curve, n, r, radial || (phone ? 5 : 7), !!closed);
    if (period) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * L / period); }
    return g;
  }
  /* a slab of cloth: a grid on top and under, joined at the four sides; pos(i, j, top) gives each point */
  function Slab(nx, nz, mats, uvScale) {
    const nv = (nx + 1) * (nz + 1), sideN = 2 * (nx + nz);
    const total = nv * 2 + sideN * 2 * 2;
    const pos = new Float32Array(total * 3), uv = new Float32Array(total * 2), idx = [];
    const g = new THREE.BufferGeometry();
    const id = (i, j) => j * (nx + 1) + i;
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = id(i, j), b = id(i + 1, j), c = id(i, j + 1), d = id(i + 1, j + 1);
      idx.push(a, c, b, b, c, d);
    }
    const topCount = idx.length;
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = nv + id(i, j), b = nv + id(i + 1, j), c = nv + id(i, j + 1), d = nv + id(i + 1, j + 1);
      idx.push(a, b, c, b, d, c);
    }
    const botCount = idx.length - topCount;
    const ring = [];
    for (let i = 0; i < nx; i++) ring.push([i, 0]); for (let j = 0; j < nz; j++) ring.push([nx, j]);
    for (let i = nx; i > 0; i--) ring.push([i, nz]); for (let j = nz; j > 0; j--) ring.push([0, j]);
    const sideBase = nv * 2;
    for (let k = 0; k < ring.length; k++) {
      const a = sideBase + k * 4;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    g.setIndex(idx); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.addGroup(0, topCount, 0); g.addGroup(topCount, botCount, 1); g.addGroup(topCount + botCount, idx.length - topCount - botCount, 2);
    const m = new THREE.Mesh(g, mats); m.castShadow = true; m.receiveShadow = true;
    return {
      mesh: m,
      update(fn) {   // fn(i, j, top) → [x, y, z]; also (i, j) → [u, v] in meters for the texture
        for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
          const k = id(i, j), t = fn(i, j, true), b = fn(i, j, false);
          pos.set(t, k * 3); pos.set(b, (nv + k) * 3);
          const u = t[3] / uvScale, v = t[4] / uvScale;
          uv[k * 2] = u; uv[k * 2 + 1] = v; uv[(nv + k) * 2] = u; uv[(nv + k) * 2 + 1] = v;
        }
        for (let k = 0; k < ring.length; k++) {
          const [i0, j0] = ring[k], [i1, j1] = ring[(k + 1) % ring.length], a = sideBase + k * 4;
          const p0 = id(i0, j0), p1 = id(i1, j1);
          for (let c = 0; c < 3; c++) { pos[(a) * 3 + c] = pos[p0 * 3 + c]; pos[(a + 1) * 3 + c] = pos[p1 * 3 + c]; pos[(a + 2) * 3 + c] = pos[(nv + p0) * 3 + c]; pos[(a + 3) * 3 + c] = pos[(nv + p1) * 3 + c]; }
          uv[a * 2] = 0; uv[a * 2 + 1] = 0; uv[(a + 1) * 2] = 0.2; uv[(a + 1) * 2 + 1] = 0; uv[(a + 2) * 2] = 0; uv[(a + 2) * 2 + 1] = 0.02; uv[(a + 3) * 2] = 0.2; uv[(a + 3) * 2 + 1] = 0.02;
        }
        g.attributes.position.needsUpdate = true; g.attributes.uv.needsUpdate = true;
        g.computeVertexNormals(); g.computeBoundingSphere();
      }
    };
  }

  /* ═════════ the room ═════════ */
  const room = new THREE.Group(); scene.add(room);
  const floorM = mesh(new THREE.PlaneGeometry(9, 8), MAT.floor, room, false, true); floorM.rotation.x = -Math.PI / 2; floorM.position.set(0.6, 0, 0.8);
  floorMap.repeat.set(4, 4);
  // the back wall, with a window: a wall with a hole, a white frame, the sky beyond and soft curtains
  const WIN = { x: 0.15, y: 1.55, w: 1.5, h: 1.25, z: -1.05 };
  const wallShape = new THREE.Shape(); wallShape.moveTo(-3.5, 0); wallShape.lineTo(4.5, 0); wallShape.lineTo(4.5, 3); wallShape.lineTo(-3.5, 3); wallShape.lineTo(-3.5, 0);
  wallShape.holes.push(roundedShape(WIN.w, WIN.h, 0.02, WIN.x, WIN.y));
  const wall = mesh(new THREE.ShapeGeometry(wallShape), MAT.wall, room, false, true); wall.position.z = WIN.z;
  const sideWall = mesh(new THREE.PlaneGeometry(6, 3), MAT.wall, room, false, true); sideWall.rotation.y = Math.PI / 2; sideWall.position.set(-1.5, 1.5, 1.6);
  const rightWall = mesh(new THREE.PlaneGeometry(6, 3), MAT.wall, room, false, true); rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(2.55, 1.5, 1.6);
  const skirting = mesh(rbox(8, 0.1, 0.02, 0.006), MAT.trim, room, false, true); skirting.position.set(0.5, 0.05, WIN.z + 0.01);
  const sky = mesh(new THREE.PlaneGeometry(WIN.w + 0.4, WIN.h + 0.4), MAT.sky, room, false, false); sky.position.set(WIN.x, WIN.y, WIN.z - 0.25);
  // the frame and the bars, rounded
  [[WIN.w + 0.1, 0.07, 0, WIN.h / 2 + 0.02], [WIN.w + 0.1, 0.09, 0, -WIN.h / 2 - 0.03]].forEach(([w, h, x, y]) => { const f = mesh(rbox(w, h, 0.09, 0.018), MAT.trim, room); f.position.set(WIN.x + x, WIN.y + y, WIN.z); });
  [-1, 1].forEach(s => { const f = mesh(rbox(0.07, WIN.h + 0.1, 0.09, 0.018), MAT.trim, room); f.position.set(WIN.x + s * (WIN.w / 2 + 0.02), WIN.y, WIN.z); });
  const sill = mesh(rbox(WIN.w + 0.25, 0.04, 0.2, 0.015), MAT.trim, room); sill.position.set(WIN.x, WIN.y - WIN.h / 2 - 0.07, WIN.z + 0.06);
  { const b1 = mesh(rbox(0.035, WIN.h, 0.04, 0.012), MAT.trim, room); b1.position.set(WIN.x, WIN.y, WIN.z - 0.01); const b2 = mesh(rbox(WIN.w, 0.035, 0.04, 0.012), MAT.trim, room); b2.position.set(WIN.x, WIN.y + 0.1, WIN.z - 0.01); }
  // a plant on the sill (rounded pot, soft leaves)
  { const pot = mesh(lathe([[0, 0], [0.055, 0], [0.07, 0.11], [0.074, 0.12], [0.062, 0.12], [0.06, 0.115], [0, 0.115]]), std({ color: "#c98a63", roughness: 0.8 }), room); pot.position.set(WIN.x + 0.5, WIN.y - WIN.h / 2 - 0.05, WIN.z + 0.06);
    for (let i = 0; i < 9; i++) { const lf = mesh(new THREE.SphereGeometry(0.04, 12, 8), MAT.leaf, room); lf.scale.set(0.45, 1.3, 0.16); const a = i / 9 * Math.PI * 2; lf.position.set(pot.position.x + Math.cos(a) * 0.035, pot.position.y + 0.17 + (i % 3) * 0.02, pot.position.z + Math.sin(a) * 0.035); lf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); } }
  // curtains: soft folds
  function curtain(x) {
    const g = new THREE.PlaneGeometry(0.42, WIN.h + 0.35, 40, 10), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getY(i); p.setZ(i, Math.sin(u * 52) * 0.022 + Math.sin(u * 23 + 1) * 0.01 + (v < 0 ? -v * 0.02 : 0)); }
    g.computeVertexNormals();
    const c = mesh(g, MAT.curtain, room); c.position.set(x, WIN.y - 0.05, WIN.z + 0.09); return c;
  }
  curtain(WIN.x - WIN.w / 2 - 0.12); curtain(WIN.x + WIN.w / 2 + 0.12);
  // a shelf with spools on the side wall
  { const sh = mesh(rbox(0.22, 0.025, 0.9, 0.008), MAT.woodDk, room); sh.position.set(-1.38, 1.35, 0.1);
    const cols = ["#b3263a", "#2b55a8", "#e0b03a", "#4f8a5b", "#7a4fa0", "#e07a3a", "#3a3f46", "#f2efe8"];
    cols.forEach((c, i) => { const sp = spoolMesh(c, 0.75); sp.position.set(-1.36, 1.3625, -0.28 + i * 0.1); room.add(sp); }); }
  function spoolMesh(color, s = 1) {
    const g = new THREE.Group();
    const wood = mesh(lathe([[0.004, 0], [0.017, 0], [0.018, 0.002], [0.017, 0.004], [0.011, 0.005], [0.011, 0.043], [0.017, 0.044], [0.018, 0.046], [0.017, 0.048], [0.004, 0.048]]), MAT.spoolWood, g);
    const th = mesh(lathe([[0.0108, 0.005], [0.0148, 0.0055], [0.0152, 0.024], [0.0148, 0.0425], [0.0108, 0.043]]), std({ color, roughness: 0.6, map: plyMap }), g);
    th.material.map = plyMap;
    g.scale.setScalar(s); g.userData.thread = th; return g;
  }

  /* ═════════ the table ═════════ */
  const table = new THREE.Group(); room.add(table);
  const [tx0, tx1, tz0, tz1] = LAY.table;
  const top = mesh(rbox(tx1 - tx0, 0.035, tz1 - tz0, 0.012), MAT.wood, table); top.position.set((tx0 + tx1) / 2, TY - 0.0175, (tz0 + tz1) / 2);
  woodMap.repeat.set(1, 1);
  const legGeo = lathe([[0, 0], [0.022, 0], [0.024, 0.04], [0.02, 0.1], [0.026, 0.58], [0.03, 0.64], [0.03, 0.7], [0, 0.7]]);
  [[tx0 + 0.07, tz0 + 0.07], [tx1 - 0.07, tz0 + 0.07], [tx0 + 0.07, tz1 - 0.07], [tx1 - 0.07, tz1 - 0.07]].forEach(([x, z]) => { const l = mesh(legGeo, MAT.wood, table); l.position.set(x, 0, z); });
  const apron = mesh(rbox(tx1 - tx0 - 0.1, 0.07, tz1 - tz0 - 0.1, 0.01), MAT.woodDk, table); apron.position.set((tx0 + tx1) / 2, TY - 0.07, (tz0 + tz1) / 2);
  // chairs: a seat and a back of soft rounded wood
  function chair(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const seat = mesh(rbox(0.44, 0.04, 0.42, 0.015), MAT.wood, g); seat.position.y = 0.45;
    const cush = mesh(rbox(0.4, 0.03, 0.38, 0.014), phys({ color: "#8aa38f", roughness: 0.95, sheen: 0.6, sheenColor: new THREE.Color("#e6fff0"), map: weaveMap, normalMap: weaveN }), g); cush.position.y = 0.485;
    const lg = lathe([[0, 0], [0.016, 0], [0.018, 0.2], [0.015, 0.43], [0, 0.43]], 14);
    [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]].forEach(([a, b]) => { const l = mesh(lg, MAT.wood, g); l.position.set(a, 0, b); });
    const back = mesh(rbox(0.42, 0.18, 0.03, 0.014), MAT.wood, g); back.position.set(0, 0.82, 0.2);
    [-0.18, 0.18].forEach(a => { const p = mesh(rbox(0.03, 0.42, 0.03, 0.012), MAT.wood, g); p.position.set(a, 0.66, 0.2); });
    room.add(g); return g;
  }
  const chairH = chair(LAY.hand.seat[0], LAY.hand.seat[1] + 0.06), chairM = chair(M_.seat[0], M_.seat[1] + 0.06);

  /* ═════════ props on the table ═════════ */
  // the pincushion: a soft tomato with a leaf on top and a few pins
  const PC = M_.pincushion;
  const cushion = new THREE.Group(); cushion.position.set(PC[0], TY, PC[2]); room.add(cushion);
  { const pts = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI; pts.push([Math.max(0.0005, Math.cos(a) * 0.042), 0.028 + Math.sin(a) * 0.028]); }
    const body = mesh(lathe(pts, phone ? 18 : 32), MAT.cushion, cushion);
    const p = body.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 - 0.06 * Math.pow(Math.abs(Math.cos(a * 3)), 6); p.setX(i, x * k); p.setZ(i, z * k); } body.geometry.computeVertexNormals();
    for (let i = 0; i < 5; i++) { const lf = mesh(new THREE.SphereGeometry(0.012, 10, 6), MAT.leaf, cushion); lf.scale.set(1, 0.25, 0.4); const a = i / 5 * Math.PI * 2; lf.position.set(Math.cos(a) * 0.01, 0.056, Math.sin(a) * 0.01); lf.rotation.y = -a; }
    [[0.02, 0.01, MAT.pinHeadR], [-0.015, 0.02, MAT.pinHeadY], [0.0, -0.022, MAT.pinHeadB], [-0.025, -0.01, MAT.pinHeadR]].forEach(([x, z, m]) => { const pn = pinMesh(m); pn.position.set(x, 0.05, z); pn.lookAt(cushion.position.clone().add(V(x * 3, 0.15, z * 3))); pn.rotateX(Math.PI / 2); cushion.add(pn); }); }
  function pinMesh(headMat) {
    const g = new THREE.Group();
    const shaft = mesh(new THREE.CylinderGeometry(0.0003, 0.0003, 0.03, 6), MAT.steel, g, false); shaft.position.y = -0.015;
    const tipc = mesh(new THREE.ConeGeometry(0.0003, 0.002, 6), MAT.steel, g, false); tipc.position.y = -0.031; tipc.rotation.x = Math.PI;
    mesh(new THREE.SphereGeometry(0.0018, 12, 8), headMat, g); return g;
  }
  // a spool of thread and the measuring tape on the table
  const spoolT = spoolMesh("#b3263a"); spoolT.position.set(0.72, TY, 0.3); room.add(spoolT);
  const tapeCase = mesh(lathe([[0, 0], [0.028, 0], [0.031, 0.004], [0.031, 0.014], [0.028, 0.018], [0, 0.018]]), MAT.tapeCase, room); tapeCase.position.set(0.74, TY, 0.08);

  /* ═════════ the sewing machine (relative to the needle's place on the plate, NP) ═════════ */
  const mach = new THREE.Group(); mach.position.set(NP[0], NP[1], NP[2]); room.add(mach);
  const tagged = {};   // part id → meshes (the tour lights them)
  const tag = (k, m) => { (tagged[k] = tagged[k] || []).push(m); return m; };
  const [bx0, bx1, bz0, bz1] = M_.bed;
  // the bed: one long rounded slab on the table
  const bed = mesh(rbox(bx1 - bx0, 0.075, bz1 - bz0, 0.02), MAT.cast, mach); bed.position.set((bx0 + bx1) / 2 - NP[0], -0.0375, (bz0 + bz1) / 2 - NP[2]);
  // the upper casting: pillar, arm and head as one rounded profile (side view, x right, y up), extruded front to back
  const prof = new THREE.Shape();
  prof.moveTo(0.3, 0); prof.lineTo(0.43, 0); prof.quadraticCurveTo(0.455, 0.0, 0.455, 0.04); prof.lineTo(0.455, 0.215);
  prof.quadraticCurveTo(0.455, 0.255, 0.41, 0.255); prof.lineTo(-0.035, 0.255); prof.quadraticCurveTo(-0.07, 0.255, -0.07, 0.22);
  prof.lineTo(-0.07, 0.125); prof.quadraticCurveTo(-0.07, 0.1, -0.045, 0.1); prof.lineTo(0.045, 0.1); prof.quadraticCurveTo(0.065, 0.1, 0.07, 0.12);
  prof.quadraticCurveTo(0.09, 0.15, 0.13, 0.15); prof.lineTo(0.27, 0.15); prof.quadraticCurveTo(0.3, 0.15, 0.3, 0.12); prof.lineTo(0.3, 0);
  const castGeo = extrude(prof, 0.07, 0.014); castGeo.translate(0, 0, -0.085);
  const casting = mesh(castGeo, MAT.cast, mach);
  // the head's front plate (where the thread runs) and a soft accent band
  const face = mesh(rbox(0.13, 0.15, 0.03, 0.014), MAT.cast, mach); face.position.set(0.0, 0.18, 0.012);
  const band = mesh(rbox(0.36, 0.022, 0.012, 0.006), MAT.castAcc, mach); band.position.set(0.24, 0.215, 0.0);
  // the thread path parts
  const P = M_.path.filter(p => typeof p[0] === "number");
  const spoolPin = tag("spool", mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.055, 10), MAT.chrome, mach)); spoolPin.position.set(0.36, 0.255 + 0.0275 + 0.012, -0.045);
  const mSpool = spoolMesh("#b3263a"); mSpool.position.set(0.36, 0.268, -0.045); mach.add(mSpool); tag("spool", mSpool.userData.thread);
  const guide = tag("tension", mesh(new THREE.TorusGeometry(0.005, 0.0012, 8, 16), MAT.chrome, mach)); guide.position.set(0.33, 0.262, -0.03);
  const guide2 = tag("tension", mesh(rbox(0.016, 0.01, 0.012, 0.004), MAT.chrome, mach)); guide2.position.set(0.12, 0.262, -0.02);
  const dial = tag("tension", mesh(lathe([[0, 0], [0.016, 0], [0.017, 0.002], [0.017, 0.01], [0.015, 0.012], [0, 0.012]]), MAT.castAcc, mach)); dial.rotation.x = Math.PI / 2; dial.position.set(0.035, 0.205, 0.027);
  const discs = tag("tension", mesh(lathe([[0, 0], [0.007, 0], [0.0075, 0.002], [0.002, 0.004], [0.0075, 0.006], [0.007, 0.008], [0, 0.008]]), MAT.chrome, mach)); discs.rotation.x = Math.PI / 2; discs.position.set(0.03, 0.12, 0.03);
  const slot = mesh(rbox(0.006, 0.07, 0.006, 0.0028), MAT.dark, mach); slot.position.set(-0.012, 0.165, 0.028);
  const takeup = new THREE.Group(); mach.add(takeup);
  tag("takeup", mesh(rbox(0.008, 0.014, 0.022, 0.003), MAT.chrome, takeup)).position.set(0, 0, 0.0);
  tag("takeup", mesh(new THREE.TorusGeometry(0.0035, 0.0011, 8, 14), MAT.chrome, takeup)).position.set(0, 0.003, 0.013);
  const lowGuide = mesh(rbox(0.012, 0.006, 0.01, 0.0025), MAT.chrome, mach); lowGuide.position.set(-0.004, 0.09, 0.03);
  // needle bar, needle clamp, needle; the presser bar and foot; the foot lever
  const nbar = new THREE.Group(); mach.add(nbar);
  tag("needle", mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.08, 14), MAT.chrome, nbar)).position.set(0, 0.04 + 0.042, 0);
  tag("needle", mesh(rbox(0.012, 0.012, 0.012, 0.003), MAT.chrome, nbar)).position.set(0, 0.044, 0);
  const mNeedle = tag("needle", mesh(lathe([[0, -0.0015], [0.0004, 0], [0.0006, 0.004], [0.0006, 0.03], [0.0011, 0.031], [0.0011, 0.038], [0, 0.038]], 10), MAT.chrome, nbar, false));
  // needle tip at y = 0 in nbar coordinates (nbar.position.y = the tip's height above the plate)
  const pbar = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.09, 12), MAT.chrome, mach); pbar.position.set(0, 0.07, -0.012);
  const foot = new THREE.Group(); mach.add(foot);
  tag("foot", mesh(rbox(0.012, 0.012, 0.012, 0.003), MAT.chrome, foot)).position.set(0, 0.011, -0.012);
  const footShape = new THREE.Shape(); footShape.moveTo(-0.0095, -0.012); footShape.lineTo(0.0095, -0.012); footShape.quadraticCurveTo(0.011, 0.01, 0.0095, 0.02);
  footShape.quadraticCurveTo(0.006, 0.026, 0.002, 0.021); footShape.lineTo(0.002, 0.004); footShape.lineTo(-0.002, 0.004); footShape.lineTo(-0.002, 0.021); footShape.quadraticCurveTo(-0.006, 0.026, -0.0095, 0.02); footShape.quadraticCurveTo(-0.011, 0.01, -0.0095, -0.012);
  const footGeo = extrude(footShape, 0.0012, 0.0008, 3); footGeo.rotateX(Math.PI / 2); footGeo.translate(0, 0.0022, 0);
  tag("foot", mesh(footGeo, MAT.chrome, foot));
  const fLever = tag("foot", mesh(rbox(0.008, 0.035, 0.008, 0.003), MAT.chrome, mach)); fLever.position.set(0.0, 0.085, -0.095);
  // the throat plate, the feed dogs, the clear bobbin cover with the bobbin under it
  const plate = tag("plate", mesh(rbox(0.12, 0.003, 0.12, 0.0012), [MAT.plate, MAT.plate, MAT.plate, MAT.plate, MAT.plate, MAT.plate], mach, false, true)); plate.position.set(0, -0.0012, -0.02);
  plate.geometry.attributes.uv && (() => { const g = plate.geometry, p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 0.12 + 0.5, 0.5 - (p.getZ(i) + 0.02 - 0.02) / 0.12); })();
  const feed = new THREE.Group(); mach.add(feed);
  [-0.0055, 0.0055].forEach(x => { for (let k = 0; k < 6; k++) { const t = tag("feed", mesh(rbox(0.0016, 0.0016, 0.0022, 0.0006), MAT.dark, feed, false)); t.position.set(x, 0, -0.007 + k * 0.0028); } });
  const bobCover = tag("bobbin", mesh(rbox(0.05, 0.002, 0.04, 0.0009), MAT.clear, mach, false, false)); bobCover.position.set(0, -0.0006, 0.06);
  const bobbinG = new THREE.Group(); bobbinG.position.set(0, -0.009, 0.06); mach.add(bobbinG);
  tag("bobbin", mesh(lathe([[0.003, 0], [0.0105, 0], [0.0105, 0.0012], [0.004, 0.0015], [0.004, 0.0075], [0.0105, 0.0078], [0.0105, 0.009], [0.003, 0.009]]), MAT.clear, bobbinG));
  const bobThread = tag("bobbin", mesh(lathe([[0.004, 0.0015], [0.0095, 0.0016], [0.0098, 0.0045], [0.0095, 0.0074], [0.004, 0.0075]]), MAT.threadB, bobbinG));
  // the handwheel (it turns toward you), the stitch selector, the reverse lever, the bobbin winder
  const wheel = new THREE.Group(); wheel.position.set(0.47, 0.17, -0.045); mach.add(wheel);
  const wgeo = lathe([[0.0, 0], [0.05, 0], [0.053, 0.004], [0.053, 0.018], [0.05, 0.022], [0.03, 0.02], [0.012, 0.026], [0.0, 0.026]], phone ? 24 : 48); wgeo.rotateZ(-Math.PI / 2);
  tag("wheel", mesh(wgeo, MAT.castAcc, wheel));
  tag("wheel", mesh(new THREE.TorusGeometry(0.051, 0.0035, 8, phone ? 24 : 48), MAT.rubber, wheel)).rotation.y = Math.PI / 2;
  const wmark = mesh(rbox(0.003, 0.012, 0.004, 0.0012), MAT.cast, wheel); wmark.position.set(0.024, 0.038, 0);
  const selector = new THREE.Group(); selector.position.set(0.38, 0.135, 0.008); mach.add(selector);
  const selGeo = lathe([[0, 0], [0.024, 0], [0.026, 0.004], [0.026, 0.012], [0.022, 0.016], [0, 0.016]]); selGeo.rotateX(Math.PI / 2);
  tag("selector", mesh(selGeo, MAT.castAcc, selector)); tag("selector", mesh(rbox(0.004, 0.018, 0.004, 0.0015), MAT.cast, selector)).position.set(0, 0.012, 0.017);
  const revLever = new THREE.Group(); revLever.position.set(0.41, 0.065, 0.006); mach.add(revLever);
  tag("selector", mesh(rbox(0.03, 0.01, 0.014, 0.004), MAT.castAcc, revLever)).position.set(0, 0, 0.008);
  const winder = new THREE.Group(); winder.position.set(0.42, 0.262, -0.02); mach.add(winder);
  tag("winder", mesh(rbox(0.026, 0.008, 0.016, 0.004), MAT.chrome, winder));
  tag("winder", mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.022, 10), MAT.chrome, winder)).position.set(0, 0.012, 0);
  const wTension = tag("winder", mesh(lathe([[0, 0], [0.006, 0], [0.006, 0.004], [0, 0.004]], 14), MAT.chrome, mach)); wTension.position.set(0.16, 0.258, 0.0);
  const winderBob = new THREE.Group(); winder.add(winderBob); winderBob.position.set(0, 0.006, 0);
  mesh(lathe([[0.0025, 0], [0.0105, 0], [0.0105, 0.0012], [0.004, 0.0015], [0.004, 0.0075], [0.0105, 0.0078], [0.0105, 0.009], [0.0025, 0.009]]), MAT.clear, winderBob);
  const winderFill = mesh(lathe([[0.004, 0.0015], [0.0095, 0.0016], [0.0098, 0.0045], [0.0095, 0.0074], [0.004, 0.0075]]), MAT.threadB, winderBob);
  // a little lamp under the head (bright at night)
  const lampM = mesh(new THREE.SphereGeometry(0.008, 12, 8), MAT.lamp, mach, false, false); lampM.position.set(-0.03, 0.097, 0.0); lampM.scale.set(1.4, 0.4, 1);
  const lampL = new THREE.PointLight("#ffd9a0", 0, 0.9, 1.6); lampL.position.set(-0.03, 0.09, 0.02); mach.add(lampL);
  // the foot pedal on the floor and its cord
  const pedal = new THREE.Group(); pedal.position.set(M_.pedal[0], 0, M_.pedal[2]); room.add(pedal);
  const pedBase = tag("pedal", mesh(rbox(0.11, 0.03, 0.16, 0.014), MAT.rubber, pedal)); pedBase.position.y = 0.015;
  const pedTop = new THREE.Group(); pedTop.position.set(0, 0.03, 0.07); pedal.add(pedTop);
  tag("pedal", mesh(rbox(0.1, 0.018, 0.15, 0.012), MAT.castAcc, pedTop)).position.set(0, 0.012, -0.072);
  mesh(tubeGeo([[M_.pedal[0], 0.01, M_.pedal[2] - 0.08], [M_.pedal[0] - 0.05, 0.004, 0.1], [M_.pedal[0] + 0.1, 0.004, -0.3], [NP[0] + 0.42, TY + 0.002, NP[2] - 0.12], [NP[0] + 0.44, TY + 0.03, NP[2] - 0.09]], 0.003, 0, 6), MAT.rubber, room);
  // the highlight ring for the tour: a soft glow placed on the part
  const hlRing = mesh(new THREE.TorusGeometry(1, 0.08, 10, 40), MAT.hl, room, false, false); hlRing.visible = false;

  /* ═════════ the ironing board, the iron and the wall outlet ═════════ */
  const PB = LAY.press.board;
  const press = new THREE.Group(); press.position.set(PB[0], PB[1], PB[2]); room.add(press);
  const bShape = new THREE.Shape(); bShape.moveTo(-0.55, -0.18); bShape.lineTo(0.25, -0.18); bShape.bezierCurveTo(0.5, -0.18, 0.62, -0.06, 0.66, 0); bShape.bezierCurveTo(0.62, 0.06, 0.5, 0.18, 0.25, 0.18); bShape.lineTo(-0.55, 0.18); bShape.quadraticCurveTo(-0.6, 0.18, -0.6, 0.13); bShape.lineTo(-0.6, -0.13); bShape.quadraticCurveTo(-0.6, -0.18, -0.55, -0.18);
  const bGeo = extrude(bShape, 0.012, 0.012, phone ? 3 : 6); bGeo.rotateX(-Math.PI / 2); bGeo.translate(0, -0.026, 0);
  { const p = bGeo.attributes.position, uv = bGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * 3, p.getZ(i) * 3); }
  boardMap.repeat.set(1, 1);
  mesh(bGeo, MAT.board, press);
  [[-1, 1], [1, -1]].forEach(([a, b]) => { mesh(tubeGeo([[a * 0.4, -0.03, -0.12], [a * 0.1, -0.45, 0], [b * 0.38, -PB[1] + 0.01, 0.15]], 0.008, 0, 8), MAT.steel, press); mesh(tubeGeo([[a * 0.4, -0.03, 0.12], [a * 0.1, -0.45, 0], [b * 0.38, -PB[1] + 0.01, -0.15]], 0.008, 0, 8), MAT.steel, press); });
  const rest = mesh(rbox(0.16, 0.006, 0.2, 0.003), MAT.steel, press); rest.position.set(-0.6, -0.012, 0); rest.visible = false;
  // the iron: soleplate, a rounded shell, a handle loop; it can stand up on its heel
  const iron = new THREE.Group(); press.add(iron);
  const ironBody = new THREE.Group(); iron.add(ironBody);
  const sole = new THREE.Shape(); sole.moveTo(-0.11, -0.05); sole.lineTo(0.02, -0.05); sole.bezierCurveTo(0.08, -0.045, 0.12, -0.01, 0.135, 0); sole.bezierCurveTo(0.12, 0.01, 0.08, 0.045, 0.02, 0.05); sole.lineTo(-0.11, 0.05); sole.quadraticCurveTo(-0.12, 0.05, -0.12, 0.04); sole.lineTo(-0.12, -0.04); sole.quadraticCurveTo(-0.12, -0.05, -0.11, -0.05);
  const soleGeo = extrude(sole, 0.004, 0.003, 4); soleGeo.rotateX(-Math.PI / 2); soleGeo.translate(0, 0.003, 0); mesh(soleGeo, MAT.chrome, ironBody);
  const shellGeo = extrude(sole, 0.03, 0.022, phone ? 5 : 10); shellGeo.rotateX(-Math.PI / 2); shellGeo.scale(0.9, 1, 0.82); shellGeo.translate(-0.008, 0.032, 0); mesh(shellGeo, MAT.ironShell, ironBody);
  mesh(tubeGeo([[-0.09, 0.07, 0], [-0.085, 0.115, 0], [-0.02, 0.125, 0], [0.04, 0.11, 0], [0.06, 0.075, 0]], 0.012, 0, 12), MAT.ironWhite, ironBody);
  const ironDial = mesh(lathe([[0, 0], [0.012, 0], [0.012, 0.006], [0, 0.006]], 16), MAT.ironWhite, ironBody); ironDial.position.set(0.0, 0.07, 0.0);
  const OUT = [2.53, 0.42, 0.7];
  const outlet = mesh(rbox(0.012, 0.11, 0.07, 0.006), MAT.outlet, room); outlet.position.set(OUT[0], OUT[1], OUT[2]);
  const plug = mesh(rbox(0.03, 0.032, 0.022, 0.008), MAT.outlet, room);
  let cordMesh = null;

  /* ═════════ the hand work, the cloth on the machine, the cutting table, the seam on the board ═════════ */
  const work = new THREE.Group(); room.add(work);
  const flipG = new THREE.Group(); work.add(flipG);                // turns the work over (about its own x axis)
  const wInner = new THREE.Group(); flipG.add(wInner);
  const W = LAY.hand.work; work.position.set(W[0], W[1], W[2]); work.rotation.x = LAY.hand.tilt * DEG;
  const NXw = phone ? 44 : 70, NZw = phone ? 28 : 44;
  const layerA = Slab(NXw, NZw, [MAT.clothTop, MAT.clothTop, MAT.clothTop], 0.011);
  const layerB = Slab(NXw, NZw, [MAT.clothBot, MAT.clothBot, MAT.clothBot], 0.011);
  const hemL = Slab(NXw, Math.round(NZw / 2), [MAT.hem, MAT.hem, MAT.hem], 0.008);
  wInner.add(layerA.mesh, layerB.mesh, hemL.mesh);
  let workKind = "";
  function buildWork(kind) {
    workKind = kind;
    const felt = kind === "felt";
    layerA.mesh.material = felt ? [MAT.feltB, MAT.feltB, MAT.feltB] : kind === "hem" ? [MAT.hem, MAT.hem, MAT.hem] : [MAT.clothTop, MAT.clothTop, MAT.clothTop];
    layerB.mesh.material = felt ? [MAT.feltA, MAT.feltA, MAT.feltA] : [MAT.clothBot, MAT.clothBot, MAT.clothBot];
    const ek = kind === "hem" ? "hem" : "pair";
    const fx = E.FX, ez = E.EDGE, fz = E.FZ;
    const P = (i, j, nx, nz, z0, z1) => [lerp(-fx, fx, i / nx), lerp(z0, z1, j / nz)];
    if (kind === "hem") {
      // the main fabric (one layer) …
      layerA.update((i, j, t) => { const [x, z] = P(i, j, NXw, NZw, ez, fz); return [x, (t ? E.LT : 0) + E.surf(x, z), z, x, z]; });
      layerB.mesh.visible = false; hemL.mesh.visible = true;
      // … and the hem folded up on top of it, its turned-under edge rounded at z = 0
      hemL.update((i, j, t) => { const [x, z] = P(i, j, NXw, Math.round(NZw / 2), 0, fz); const r = smooth(0, 0.0015, z); return [x, E.LT + (t ? E.LT * (0.4 + 0.6 * r) : 0.0001) + E.surf(x, z), z, x, z + 0.3]; });
    } else {
      layerA.update((i, j, t) => { const [x, z] = P(i, j, NXw, NZw, ez, fz); return [x, (t ? E.T : E.LT + 0.00005) + E.surf(x, z), z, x, z]; });
      layerB.update((i, j, t) => { const [x, z] = P(i, j, NXw, NZw, ez, fz); return [x + 0.0004, (t ? E.LT - 0.00005 : 0) + E.surf(x, z), z, x, z + 0.4]; });
      layerB.mesh.visible = true; hemL.mesh.visible = false;
    }
  }
  // threads, needle, knots, buttons, toothpick, snips in the work's frame (rebuilt from each state)
  const dyn = new THREE.Group(); wInner.add(dyn);
  const dynWorld = new THREE.Group(); room.add(dynWorld);
  function clearGroup(g) { for (let i = g.children.length - 1; i >= 0; i--) { const c = g.children[i]; g.remove(c); c.traverse(o => { if (o.geometry && !o.userData.shared) o.geometry.dispose(); }); } }
  const needleEye = new THREE.TorusGeometry(0.00075, 0.00028, 6, 12); needleEye.scale(0.6, 1.9, 1); needleEye.userData = {};
  const knotGeo = new THREE.SphereGeometry(0.0011, 12, 10);
  const btn4 = (() => {
    const s = new THREE.Shape(); s.absarc(0, 0, E.BTN.r, 0, Math.PI * 2, false);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => { const h = new THREE.Path(); h.absarc(a * E.BTN.s, b * E.BTN.s, 0.0008, 0, Math.PI * 2, true); s.holes.push(h); });
    const g = new THREE.ExtrudeGeometry(s, { depth: E.BH - 0.0012, bevelEnabled: true, bevelThickness: 0.0006, bevelSize: 0.0008, bevelSegments: 4, curveSegments: 28 });
    g.rotateX(-Math.PI / 2); g.translate(0, 0.0006, 0);
    // a gentle dish in the middle
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getZ(i)); if (p.getY(i) > E.BH * 0.5 && r < E.BTN.r * 0.75) p.setY(i, p.getY(i) - 0.0005 * (1 - r / (E.BTN.r * 0.75))); }
    g.computeVertexNormals(); return g;
  })();
  const btnS = lathe([[0, 0.0016], [0.0072, 0.0016], [0.0076, 0.0022], [0.0062, 0.0036], [0.0035, 0.0043], [0, 0.0045]], 32);
  const shankLoop = new THREE.TorusGeometry(0.0012, 0.00035, 8, 16);
  const pickGeo = lathe([[0, -0.03], [0.0004, -0.029], [0.001, -0.026], [0.001, 0.026], [0.0004, 0.029], [0, 0.03]], 10); pickGeo.rotateZ(Math.PI / 2);
  const snipsG = (() => {   // small embroidery scissors: two short blades and two rings
    const g = new THREE.Group(), a = new THREE.Group(), b = new THREE.Group(); g.add(a, b);
    const blade = new THREE.Shape(); blade.moveTo(0, -0.0015); blade.lineTo(0.026, -0.0002); blade.quadraticCurveTo(0.028, 0, 0.026, 0.0004); blade.lineTo(0, 0.0018);
    const bg = extrude(blade, 0.0006, 0.0003, 2);
    const ring = new THREE.TorusGeometry(0.0055, 0.0012, 8, 18);
    [a, b].forEach((h, k) => { mesh(bg, MAT.shearBlade, h, false); const r = mesh(ring, MAT.shearBlade, h, false); r.position.set(-0.009, (k ? -1 : 1) * 0.004, 0.0003); });
    b.scale.y = -1; g.userData = { a, b }; return g;
  })();
  snipsG.visible = false; wInner.add(snipsG);

  // the cloth on the machine (two pieces, right sides together) and the seam's threads
  const NXm = phone ? 34 : 56, NZm = phone ? 40 : 66;
  const mTop = Slab(NXm, NZm, [MAT.mfabW, MAT.mfab, MAT.mfab], 0.008);
  const mBot = Slab(NXm, NZm, [MAT.mfab, MAT.mfabW, MAT.mfab], 0.008);
  room.add(mTop.mesh, mBot.mesh);
  const mDyn = new THREE.Group(); room.add(mDyn);
  function support(x, z) {   // the height of what the cloth lies on: the machine's bed or the table, with a soft fall between
    const dx = Math.max(bx0 - x, 0, x - bx1), dz = Math.max(bz0 - z, 0, z - bz1), d = Math.hypot(dx, dz);
    return lerp(M_.bedY, TY, smooth(0, 0.075, d)) + 0.0002;
  }

  // the cutting table: folded cloth, the pattern, pins, shears, chalk, ruler, measuring tape
  const CUT = LAY.cut;
  const cutG = new THREE.Group(); cutG.position.set(CUT.cloth[0], TY, CUT.cloth[1]); room.add(cutG);
  const NXc = phone ? 30 : 48, NZc = phone ? 24 : 36;
  const cCloth = Slab(NXc, NZc, [MAT.gingham, MAT.gingham, MAT.gingham], 0.05);
  cutG.add(cCloth.mesh);
  const pattern = (() => { const s = new THREE.Shape(); const p = E.patternPath(); s.moveTo(p[0][0], p[0][1]); p.forEach(q => s.lineTo(q[0], q[1]));
    const g = new THREE.ShapeGeometry(s, 4); g.rotateX(Math.PI / 2);
    const pos = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < pos.count; i++) { uv.setXY(i, (pos.getX(i) - E.PAT.x0) / E.PAT.w, 1 - (pos.getZ(i) - E.PAT.z0) / E.PAT.h); }
    g.scale(1, -1, 1); g.rotateX(Math.PI);
    return mesh(g, MAT.tissue, cutG, false, true); })();
  const cutPins = E.PINS.map((p, i) => { const pn = pinMesh([MAT.pinHeadR, MAT.pinHeadY, MAT.pinHeadB][i % 3]); cutG.add(pn); return pn; });
  const shears = (() => {
    const g = new THREE.Group(), a = new THREE.Group(), b = new THREE.Group(); g.add(a, b);
    const bl = new THREE.Shape(); bl.moveTo(-0.01, -0.004); bl.lineTo(0.11, -0.0012); bl.quadraticCurveTo(0.124, 0, 0.11, 0.0022); bl.lineTo(-0.01, 0.006); bl.lineTo(-0.01, -0.004);
    const bgeo = extrude(bl, 0.0012, 0.0008, 3); bgeo.rotateX(-Math.PI / 2);
    const handle = new THREE.Shape(); handle.absellipse(-0.05, 0, 0.026, 0.016, 0, Math.PI * 2, false); const hole = new THREE.Path(); hole.absellipse(-0.05, 0, 0.018, 0.009, 0, Math.PI * 2, true); handle.holes.push(hole);
    const hgeo = extrude(handle, 0.004, 0.0025, 4); hgeo.rotateX(-Math.PI / 2);
    const neck = new THREE.Shape(); neck.moveTo(-0.028, -0.004); neck.lineTo(-0.008, -0.004); neck.lineTo(-0.008, 0.005); neck.lineTo(-0.028, 0.008);
    const ngeo = extrude(neck, 0.003, 0.0015, 3); ngeo.rotateX(-Math.PI / 2);
    [a, b].forEach((h, k) => { mesh(bgeo, MAT.shearBlade, h); mesh(hgeo, MAT.shearHandle, h); mesh(ngeo, MAT.shearHandle, h); h.position.y = k ? 0 : 0.0022; });
    b.scale.z = -1;
    const screw = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.006, 14), MAT.chrome, g); screw.position.y = 0.002;
    cutG.add(g); g.userData = { a, b }; return g;
  })();
  const chalk = (() => { const s = new THREE.Shape(); s.moveTo(-0.02, -0.012); s.lineTo(0.02, -0.012); s.lineTo(0, 0.022); s.lineTo(-0.02, -0.012);
    const g = extrude(s, 0.003, 0.0025, 4); g.rotateX(-Math.PI / 2); g.translate(0, 0.0005, 0); return mesh(g, MAT.chalk, cutG); })();
  const ruler = mesh(rbox(0.36, 0.0025, 0.05, 0.001), MAT.ruler, cutG, false, false);
  const cutDyn = new THREE.Group(); cutG.add(cutDyn);
  const tapeStrip = mesh(new THREE.PlaneGeometry(1, 0.013), MAT.tape, cutG, false, true); tapeStrip.rotation.x = -Math.PI / 2; tapeStrip.visible = false;

  // the seam on the ironing board: two pieces and their seam allowances, each turning on the seam line
  const prG = new THREE.Group(); press.add(prG);
  const flap = (len, mats, wdt) => { const g = new THREE.Group(); const s = Slab(16, 6, mats, 0.008);
    s.update((i, j, t) => { const x = lerp(-wdt / 2, wdt / 2, i / 16), z = lerp(0, len, j / 6); return [x, t ? E.LT : 0, z, x, z]; }); g.add(s.mesh); prG.add(g); return g; };
  const PW = 0.34;
  const pA = flap(0.16, [MAT.mfabW, MAT.mfab, MAT.mfab], PW), pB = flap(0.16, [MAT.mfabW, MAT.mfab, MAT.mfab], PW);
  const aA = flap(0.015, [MAT.mfabW, MAT.mfab, MAT.mfab], PW), aB = flap(0.015, [MAT.mfabW, MAT.mfab, MAT.mfab], PW);
  const seamLine = mesh(tubeGeo([[-PW / 2, 0, 0], [PW / 2, 0, 0]], 0.0005, 0.002, 6), MAT.thread, prG, false);

  /* ═════════ the person ═════════ */
  let fig = null;
  try {
    const F = await import("/aog-figure3d.js");
    fig = F.makeFigure({ outfit: "plain", quality: phone ? "phone" : "full", colors: { top: "#5f7f73", trim: "#4e6b60", pants: "#3c4250" } });
    fig.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    room.add(fig.root);
  } catch (e) { console.warn("Sewing room: no figure", e); }
  const _v = new THREE.Vector3(), _w = new THREE.Vector3();
  function toWorld(f, p) {
    if (f === "world") return V(p[0], p[1], p[2]);
    if (f === "work") { wInner.updateWorldMatrix(true, false); return V(p[0], p[1], p[2]).applyMatrix4(wInner.matrixWorld); }
    if (f === "cut") return V(CUT.cloth[0] + p[0], TY + p[1], CUT.cloth[1] + p[2]);
    if (f === "press") return V(PB[0] + p[0], PB[1] + p[1], PB[2] + p[2]);
    return V(p[0], p[1], p[2]);
  }
  // put the hand's grip point on a target: solve the arm for the wrist, then correct by where the grip landed
  function reach(side, target, pole) {
    const S = side, wristName = "wrist" + S, anc = fig.hand(S);
    let goal = target.clone();
    for (let k = 0; k < 3; k++) {
      fig.ik.arm(S, goal, pole, { exact: true }); fig.update();
      const wp = fig.world(wristName), ap = anc.getWorldPosition(_w);
      goal = target.clone().sub(ap.clone().sub(wp));
    }
    fig.ik.arm(S, goal, pole, { exact: true }); fig.update();
  }
  function poseFigure(st) {
    if (!fig) return;
    const station = st.station, seated = station === "hand" || station === "machine";
    const seat = station === "hand" ? LAY.hand.seat : station === "machine" ? M_.seat : station === "cut" ? CUT.stand : LAY.press.stand;
    fig.root.position.set(seat[0], 0, seat[1]); fig.root.rotation.set(0, Math.PI, 0);
    const pose = { root: { pos: [0, seated ? -0.4 : 0, seated ? 0 : 0.0], rot: [0, 0, 0] }, j: {} };
    if (seated) Object.assign(pose.j, { spine: [8, 0, 0], chest: [8, 0, 0], neck: [10, 0, 0], hipL: [-86, 0, 4], hipR: [-86, 0, -4], kneeL: [86, 0, 0], kneeR: [86, 0, 0] });
    else Object.assign(pose.j, { spine: [10, 0, 0], chest: [12, 0, 0], neck: [14, 0, 0], kneeL: [4, 0, 0], kneeR: [4, 0, 0] });
    if (station === "hand") { pose.j.spine = [12, 0, 0]; pose.j.chest = [6, 0, 0]; }
    fig.setPose(pose); fig.update();
    // feet: on the floor; at the machine the right foot rests on the pedal when sewing
    if (seated) {
      const fwd = station === "machine" ? 0.2 : 0.18;
      const lf = V(seat[0] + 0.12, 0.085, seat[1] - fwd - 0.06);
      let rf = V(seat[0] - 0.12, 0.085, seat[1] - fwd);
      if (station === "machine" && st.m) {
        const on = st.m.footOnPedal || 0, pd = M_.pedal;
        const onP = V(pd[0] + 0.0, 0.085 + 0.05 - 0.012 * (st.m.pedal || 0), pd[2] + 0.02);
        rf = V(seat[0] - 0.18, 0.085, seat[1] - 0.12).lerp(onP, on);
      }
      fig.ik.leg("L", lf, null, { footFlat: true }); fig.ik.leg("R", rf, null, { footFlat: true });
      fig.update();
    }
    // hands
    const hl = st.handL, hr = st.handR;
    if (hr) { fig.grip("R", hr.grip == null ? 0.3 : hr.grip); if (hr.pinch) fig.pinch("R", true); reach("R", toWorld(hr.f, hr.p)); }
    if (hl) { fig.grip("L", hl.grip == null ? 0.3 : hl.grip); if (hl.pinch) fig.pinch("L", true); reach("L", toWorld(hl.f, hl.p)); }
    // look at the work
    fig.lookAt(focusPoint(st), 0.9); fig.update();
  }

  /* ═════════ cameras ═════════ */
  let camMode = "close", orbitYaw = null, camDrag = null, lastSt = null;
  function focusPoint(st) {
    const s = st.station;
    if (s === "hand") return toWorld("work", E.focusOf(st.id, st.step));
    if (s === "machine") {
      if (st.id === "machine-parts" && st.m.hl) { const p = M_.parts[st.m.hl]; if (p) return V(NP[0] + p[0], NP[1] + p[1], NP[2] + p[2]); return V(M_.pedal[0], 0.05, M_.pedal[2]); }
      if (st.id === "thread-machine" || st.id === "wind-bobbin") return V(NP[0] + 0.12, NP[1] + 0.14, NP[2]);
      return V(NP[0], NP[1] + 0.01, NP[2] + 0.02);
    }
    if (s === "cut") return toWorld("cut", st.cut && st.cut.at ? [st.cut.at[0] * 0.6, 0, st.cut.at[1] * 0.6] : [0, 0, -0.02]);
    if (s === "press") return toWorld("press", [st.iron ? st.iron.x * 0.4 : 0, 0.02, 0]);
    return V(0, 1, 0);
  }
  function camFor(st, mode) {
    const f = focusPoint(st), s = st.station;
    let pos;
    if (mode === "close") {
      if (s === "hand") {
        const n = V(0, 1, 0).applyQuaternion(work.quaternion);   // the work's face
        const flipNow = st.work && st.work.flip > 0.5 ? 1 : 0;
        pos = f.clone().addScaledVector(n, st.work.kind === "none" ? 0.17 : 0.105).add(V(-0.025, 0.03, 0.012));
        if (st.id === "whipstitch" || st.id === "blanket-stitch") {   // edge stitches: look from beyond the edge, so the wrap shows
          const out = V(0, 0, -1).applyQuaternion(work.quaternion);
          pos = f.clone().addScaledVector(n, 0.075).addScaledVector(out, 0.07).add(V(-0.02, 0, 0));
        }
        if (st.id === "sew-button" && st.step >= 5 && st.step <= 7) {   // the thread shank: a lower, side-on look under the button
          const out = V(0, 0, 1).applyQuaternion(work.quaternion);
          pos = f.clone().addScaledVector(n, 0.05).addScaledVector(out, 0.06).add(V(0.03, 0, 0));
        }
      } else if (s === "machine") {
        if (st.id === "machine-parts") pos = f.clone().add(st.m.hl === "pedal" ? V(-0.25, 0.45, 0.5) : V(-0.12, 0.12, 0.34));
        else if (st.id === "thread-machine" || st.id === "wind-bobbin") pos = f.clone().add(V(-0.12, 0.14, 0.5));
        else pos = f.clone().add(V(-0.05, 0.25, 0.17));
      } else if (s === "cut") pos = f.clone().add(V(-0.02, 0.56, 0.14));
      else pos = f.clone().add(V(0.1, 0.46, -0.34));
    } else if (mode === "shoulder") {
      const seat = s === "hand" ? LAY.hand.seat : s === "machine" ? M_.seat : s === "cut" ? CUT.stand : LAY.press.stand;
      pos = V(seat[0] - 0.36, (s === "hand" || s === "machine") ? 1.6 : 1.9, seat[1] + 0.34);
    } else {   // across the table, from the window side
      pos = V(f.x + 0.35, f.y + 0.45, f.z - 1.25);
      if (s === "press") pos = V(f.x - 0.2, f.y + 0.6, f.z - 1.2);
    }
    return { pos, f };
  }
  function placeCam(st) {
    const c = camFor(st, camMode === "orbit" ? "shoulder" : camMode);
    if (camMode === "orbit") {
      const f = c.f, d = Math.max(0.9, Math.hypot(c.pos.x - f.x, c.pos.z - f.z));
      if (orbitYaw == null) orbitYaw = Math.atan2(c.pos.x - f.x, c.pos.z - f.z);
      camera.position.set(f.x + Math.sin(orbitYaw) * d, c.pos.y, f.z + Math.cos(orbitYaw) * d);
      camera.lookAt(f);
    } else { camera.position.copy(c.pos); camera.lookAt(c.f); }
    camera.near = camMode === "close" ? 0.01 : 0.05; camera.updateProjectionMatrix();
    stage.sun.target.position.copy(c.f); stage.sun.position.copy(c.f).add(V(-0.6, 2.4, -2.2));
    const sc = stage.sun.shadow.camera, r = camMode === "close" ? 0.5 : 1.6; sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 0.5; sc.far = 6; sc.updateProjectionMatrix();
  }
  // a sideways drag walks the camera around; an up-down swipe still scrolls the page
  const cv = stage.canvas;
  cv.addEventListener("pointerdown", e => { camDrag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false, yaw: null }; });
  cv.addEventListener("pointermove", e => {
    if (!camDrag || e.pointerId !== camDrag.id || !lastSt) return;
    const dx = e.clientX - camDrag.x, dy = e.clientY - camDrag.y;
    if (!camDrag.moved && Math.abs(dy) > Math.abs(dx) + 2) { camDrag = null; return; }
    if (!camDrag.moved && Math.abs(dx) > 4) {
      camDrag.moved = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* fine */ }
      if (camMode !== "orbit") { const c = camFor(lastSt, camMode === "close" ? "shoulder" : camMode); orbitYaw = Math.atan2(c.pos.x - c.f.x, c.pos.z - c.f.z); camMode = "orbit"; if (kit.onCam) kit.onCam("orbit"); }
      camDrag.yaw = orbitYaw;
    }
    if (camDrag.moved) { orbitYaw = camDrag.yaw - dx * 0.008; placeCam(lastSt); stage.render(); }
  });
  ["pointerup", "pointercancel"].forEach(k => cv.addEventListener(k, () => { camDrag = null; }));

  /* ═════════ drawing one state ═════════ */
  const hide = (...ms) => ms.forEach(m => { m.visible = false; });
  const show = (m, on) => { m.visible = !!on; };
  function thread(pts, mat, parent, r) {
    if (!pts || pts.length < 2) return;
    mesh(tubeGeo(pts, r || 0.0005, 0.0016, phone ? 5 : 7), mat, parent, true, true);
  }
  function drawHand(st) {
    const kind = st.work.kind;
    const want = kind === "none" ? "none" : (st.id === "whipstitch" || st.id === "blanket-stitch") ? "felt" : kind;
    if (want !== workKind) buildWork(want);
    show(layerA.mesh, kind !== "none"); show(layerB.mesh, kind !== "none" && kind !== "hem"); show(hemL.mesh, kind === "hem");
    flipG.position.set(0, E.T / 2, 0); wInner.position.set(0, -E.T / 2, 0);
    flipG.rotation.x = Math.PI * (st.work.flip || 0);
    clearGroup(dyn);
    (st.threads || []).forEach(l => thread(l, MAT.thread, dyn));
    if (st.shortEnd) thread(st.shortEnd, MAT.thread, dyn);
    if (st.coil) thread(st.coil, MAT.thread, dyn, 0.0004);
    (st.knots || []).forEach(k => { if (k.s > 0.02) { const m = mesh(knotGeo, MAT.thread, dyn); knotGeo.userData.shared = true; m.userData.shared = true; m.geometry.userData.shared = true; m.position.set(k.p[0], k.p[1], k.p[2]); m.scale.set(1.2 * k.s, 0.8 * k.s, 1.1 * k.s); } });
    if (st.needle && st.needle.length > 1) {
      const pts = st.needle;
      mesh(tubeGeo(pts, 0.00038, 0, 8), MAT.steel, dyn);
      const a = V(...pts[pts.length - 1]), b = V(...pts[Math.max(0, pts.length - 2)]), dir = a.clone().sub(b).normalize();
      const cone = mesh(new THREE.ConeGeometry(0.00038, 0.0035, 8), MAT.steel, dyn); cone.position.copy(a).addScaledVector(dir, 0.0012);
      cone.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
      const e0 = V(...pts[0]), e1 = V(...pts[1]), ed = e0.clone().sub(e1).normalize();
      const eye = mesh(needleEye, MAT.steel, dyn); needleEye.userData.shared = true; eye.position.copy(e0).addScaledVector(ed, -0.0012); eye.quaternion.setFromUnitVectors(V(0, 1, 0), ed);
      const cap = mesh(new THREE.SphereGeometry(0.00038, 8, 6), MAT.steel, dyn); cap.position.copy(e0);
    }
    // buttons and the toothpick
    (st.btn || []).forEach((b, i) => {
      if (!b.show) return;
      if (b.kind === "four") { const m = mesh(btn4, MAT.button, dyn); m.geometry.userData.shared = true; m.position.set(b.x, b.y + E.surf(b.x, b.z), b.z); }
      else { const m = mesh(btnS, MAT.buttonS, dyn); m.geometry.userData.shared = true; m.position.set(b.x, b.y + E.surf(b.x, b.z), b.z); const l = mesh(shankLoop, MAT.chrome, dyn); l.geometry.userData.shared = true; l.position.set(b.x, b.y + 0.0016 + E.surf(b.x, b.z) - 0.0016 + 0.0016, b.z); l.rotation.y = Math.PI / 2; l.position.y = E.T + 0.0016 + E.surf(b.x, b.z); }
    });
    if (st.pick && st.pick.show > 0 && st.pick.out < 1) {
      const m = mesh(pickGeo, MAT.toothpick, dyn); m.geometry.userData.shared = true;
      const b = st.btn[0]; m.position.set(b.x + st.pick.out * 0.05, E.T + E.BH + E.PIN / 2 + E.surf(b.x, b.z) + st.pick.out * 0.02 + (1 - st.pick.show) * 0.02, b.z);
    }
    // the snips
    if (st.snips) { snipsG.visible = true; snipsG.position.set(st.snips.p[0], st.snips.p[1], st.snips.p[2]); snipsG.rotation.set(0, 0.6, Math.PI / 2 * 0.3); const o = st.snips.open * 0.35; snipsG.userData.a.rotation.z = o; snipsG.userData.b.rotation.z = -o; }
    else snipsG.visible = false;
  }
  function machineThreadPts(st, upto) {
    const m = st.m, out = [];
    const pts = M_.path.map(p => {
      if (p[0] === "takeup") return [-0.012, 0.175 + 0.022 * m.takeup, 0.044];
      if (p[0] === "eye") return [0, m.needleY - NP[1] + 0.0045, 0.0];
      return p;
    });
    const n = pts.length - 1, f = clamp(upto, 0, 1) * n, k = Math.floor(f);
    for (let i = 0; i <= Math.min(k, n); i++) out.push(V(NP[0] + pts[i][0], NP[1] + pts[i][1], NP[2] + pts[i][2]));
    if (k < n) { const a = pts[k], b = pts[k + 1], u = f - k; out.push(V(NP[0] + lerp(a[0], b[0], u), NP[1] + lerp(a[1], b[1], u), NP[2] + lerp(a[2], b[2], u))); }
    return out;
  }
  function drawMachine(st) {
    const m = st.m, mf = st.mf;
    // moving parts
    nbar.position.set(0, m.needleY - NP[1], 0);
    takeup.position.set(-0.012, 0.175 + 0.022 * m.takeup, 0.036);
    foot.position.set(0, 0.0012 + E.T + (1 - m.foot) * 0.007, 0);
    pbar.position.y = 0.07 + (1 - m.foot) * 0.007;
    fLever.rotation.x = (1 - m.foot) * -0.6;
    feed.position.y = -0.0018 + 0.0022 * (m.feedUp || 0);
    feed.position.z = (m.feedUp || 0) * 0.0015 * (m.reverse ? 1 : -1);
    wheel.rotation.x = -m.w * DEG;
    selector.rotation.z = -(m.dial || 0) * DEG;
    revLever.rotation.x = m.reverse ? 0.35 : 0;
    pedTop.rotation.x = 0.12 * (m.pedal || 0);
    mSpool.visible = m.spoolOn > 0.01; mSpool.position.y = 0.268 + (1 - (m.spoolOn == null ? 1 : m.spoolOn)) * 0.06;
    bobbinG.visible = m.bobbinIn > 0.01; bobbinG.position.y = -0.009 + (1 - m.bobbinIn) * 0.05;
    winder.position.x = 0.42 + (m.winder || 0) * 0.006;
    winderBob.visible = (m.onPin || 0) > 0.01 || st.id === "wind-bobbin" && (m.onPin || 0) > 0;
    winderBob.position.y = 0.006 + (1 - (m.onPin || 0)) * 0.04;
    winderBob.rotation.y = (m.wind || 0) * Math.PI * 2;
    const fill = m.bobbinFill == null ? 1 : m.bobbinFill; winderFill.scale.set(0.42 + 0.58 * fill, 1, 0.42 + 0.58 * fill);
    mSpool.rotation.y = -(m.wind || 0) * 0.6;
    lampL.intensity = kit.dark() ? 0.9 : 0.15;
    // the tour's highlight
    const hk = m.hl;
    hlRing.visible = !!(st.id === "machine-parts" && hk);
    if (hlRing.visible) {
      const p = M_.parts[hk]; const c = p ? V(NP[0] + p[0], NP[1] + p[1], NP[2] + p[2]) : V(M_.pedal[0], 0.06, M_.pedal[2]);
      hlRing.position.copy(c); const r = hk === "pedal" ? 0.11 : hk === "wheel" ? 0.07 : hk === "plate" ? 0.07 : 0.035;
      hlRing.scale.setScalar(r); hlRing.lookAt(camera.position);
    }
    // the cloth
    clearGroup(mDyn);
    const showF = mf && mf.show;
    show(mTop.mesh, showF); show(mBot.mesh, showF);
    const back = !!st.showBack;
    if (showF) {
      const Wd = E.ML.W, Lh = E.ML.Lh;
      const loc = (i, j) => [lerp(-Wd, 0, i / NXm), lerp(0, Lh, j / NZm)];
      const toW = (lx, lz) => back ? E.f2w(mf, [-0.03 - lx, lz]) : E.f2w(mf, [lx, lz]);
      const sag = (lx, lz) => 0.0007 * Math.sin(lx * 90 + lz * 40) * smooth(0.02, 0.06, -lx);   // a soft ripple away from the seam
      mTop.update((i, j, t) => { const [lx, lz] = loc(i, j), w = toW(lx, lz), y = support(w[0], w[1]) + sag(lx, lz); return [w[0], y + (back ? (t ? E.LT : 0.0001) : (t ? E.T : E.LT + 0.00005)), w[1], lx, lz]; });
      mBot.update((i, j, t) => { const [lx, lz] = loc(i, j), w = toW(lx + 0.0006, lz), y = support(w[0], w[1]) + sag(lx, lz); return [w[0], y + (back ? (t ? E.T : E.LT + 0.00005) : (t ? E.LT - 0.00005 : 0)), w[1], lx, lz]; });
      // the seam's threads: red on top, blue underneath, interlocking in the middle of the layers at every stitch
      const S = mf.st;
      const at = (p, h) => { const w = toW(p[0], p[1]), y = support(w[0], w[1]) + sag(p[0], p[1]); return V(w[0], y + h, w[1]); };
      const topY = back ? -0.00045 : E.T + 0.00038, botY = back ? E.T + 0.00038 : -0.00045, mid = E.LT;
      if (S.length) {
        const tops = [], bots = [];
        S.forEach((p, i) => {
          if (i) { const q = S[i - 1]; tops.push(at([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], topY)); bots.push(at([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], botY)); }
          tops.push(at(p, lerp(mid, topY, 0.35))); bots.push(at(p, lerp(mid, botY, 0.35)));
        });
        // tails at the start (pulled to the back) and the live ends
        const first = S[0], dirBack = [0, -1];
        if (m.tails > 0 || st.id !== "thread-machine") {
          tops.unshift(at([first[0] + 0.004, first[1] - 0.03], topY + 0.0003), at([first[0] + 0.001, first[1] - 0.008], topY));
          bots.unshift(at([first[0] + 0.006, first[1] - 0.03], botY - 0.0003), at([first[0] + 0.002, first[1] - 0.008], botY));
        }
        const last = S[S.length - 1];
        if (st.mf.off > 0) {
          const end = at([last[0] + 0.002, last[1] + 0.012 + 0.04 * mf.off], topY);
          tops.push(end); bots.push(at([last[0] + 0.004, last[1] + 0.012 + 0.04 * mf.off], botY));
        } else {
          // up to the needle's eye (or down into the cloth with the needle) and down into the bobbin
          tops.push(V(NP[0], Math.max(m.needleY + 0.0045, NP[1] + E.T), NP[2]));
          bots.push(V(NP[0], NP[1] - 0.004, NP[2]), V(NP[0], NP[1] - 0.009, NP[2] + 0.04));
        }
        thread(tops, back ? MAT.threadB : MAT.thread, mDyn, 0.00034);
        thread(bots, back ? MAT.thread : MAT.threadB, mDyn, 0.00034);
      }
      // pins across the seam, heads to the right; each goes back to the pincushion before it reaches the foot
      (mf.pinsNow || []).forEach((p, i) => {
        if (st.id !== "straight-seam") return;
        const vis = mf.pinShow == null ? 1 : clamp(mf.pinShow * 4 - i * 0.8, 0, 1);
        if (vis <= 0 || p.out >= 1) return;
        const pn = pinMesh([MAT.pinHeadR, MAT.pinHeadY, MAT.pinHeadB][i % 3]); mDyn.add(pn);
        const a = at([0.008, p.lz], E.T + 0.0012), b = at([-0.024, p.lz], E.T + 0.0004);
        const home = V(PC[0] + 0.01 * i, TY + 0.05, PC[2]);
        const head = a.clone().lerp(home, p.out); const dir = b.clone().sub(a).normalize();
        pn.position.copy(head).add(V(0, (1 - vis) * 0.05, 0)); pn.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().negate());
        pn.traverse(o => { if (o.geometry) o.userData.own = true; });
      });
      // the seam gauge (seam allowance)
      if (st.gauge > 0) {
        const g = new THREE.Group(); mDyn.add(g);
        const s0 = S[Math.floor(S.length / 2)] || [-0.015, 0.1];
        const pA = at([s0[0], s0[1]], E.T + 0.002);
        mesh(rbox(0.06, 0.0015, 0.012, 0.0006), MAT.steel, g).position.set(0.015, 0, 0);
        mesh(rbox(0.006, 0.004, 0.014, 0.001), MAT.castAcc, g).position.set(0.015 + 0.0, 0.002, 0);
        g.position.copy(pA).add(V(0, 0.02 * (1 - st.gauge), 0)); g.rotation.y = -mf.rot * DEG;
      }
    }
    // the top thread from the spool to the needle (while threading: only as far as it has gone)
    const tu = m.threadU == null ? 1 : m.threadU;
    if (st.id !== "wind-bobbin" && (tu > 0.001)) {
      const pts = machineThreadPts(st, tu);
      if (!(showF && mf.st.length) && tu >= 1 && m.tails > 0) {   // threads pulled under the foot to the back
        pts.push(V(NP[0], NP[1] + 0.002, NP[2] - 0.004), V(NP[0] + 0.004, NP[1] + 0.0006, NP[2] - 0.04 * m.tails - 0.004));
      } else if (!(showF && mf.st.length) && tu >= 1) {
        pts.push(V(NP[0] + 0.002, m.needleY - 0.012, NP[2] + 0.004), V(NP[0] + 0.008, m.needleY - 0.03, NP[2] + 0.014));
      }
      thread(pts, MAT.thread, mDyn, 0.00034);
      if (tu < 1) st.threadEnd = pts[pts.length - 1];
    }
    // the bobbin thread coming up as a loop, or its tail to the back
    if (m.bobbinIn > 0.99 && !(showF && mf.st.length)) {
      const b0 = V(NP[0], NP[1] - 0.006, NP[2] + 0.05);
      if (m.bobbinLoop > 0.01) {
        const h = 0.025 * m.bobbinLoop;
        thread([b0, V(NP[0], NP[1] - 0.003, NP[2] + 0.004), V(NP[0] - 0.004, NP[1] + h * 0.6, NP[2] + 0.006), V(NP[0] - 0.002, NP[1] + h, NP[2] + 0.01), V(NP[0] + 0.004, NP[1] + h * 0.6, NP[2] + 0.008), V(NP[0] + 0.001, m.needleY + 0.004, NP[2])], MAT.threadB, mDyn, 0.00034);
      } else if (m.tails > 0) {
        thread([b0, V(NP[0], NP[1] - 0.003, NP[2] + 0.002), V(NP[0] + 0.002, NP[1] + 0.0008, NP[2] - 0.006), V(NP[0] + 0.006, NP[1] + 0.0005, NP[2] - 0.04 * m.tails - 0.006)], MAT.threadB, mDyn, 0.00034);
      } else thread([b0, V(NP[0], NP[1] - 0.004, NP[2] + 0.03), V(NP[0] + 0.006, NP[1] - 0.0015, NP[2] + 0.01)], MAT.threadB, mDyn, 0.00034);
    }
    // winding a bobbin: spool → the winder's tension disc → the bobbin
    if (st.id === "wind-bobbin") {
      const sp = V(NP[0] + 0.36, NP[1] + 0.29, NP[2] - 0.045), td = V(NP[0] + 0.16, NP[1] + 0.262, NP[2] + 0.004), bb = V(NP[0] + 0.42 + (m.winder || 0) * 0.006, NP[1] + 0.272 + (1 - (m.onPin || 0)) * 0.04, NP[2] - 0.02);
      const wp = m.wpath || 0;
      if (wp > 0) {
        const pts = [sp, V(NP[0] + 0.33, NP[1] + 0.27, NP[2] - 0.03), V(NP[0] + 0.25, NP[1] + 0.27, NP[2] - 0.0)];
        const tail = wp < 0.6 ? pts[2].clone().lerp(td, wp / 0.6) : td.clone().add(V(0, 0.002, 0.008));
        pts.push(tail);
        if (wp >= 0.6) pts.push(td.clone().add(V(0.008, 0.002, 0)), td.clone().add(V(0.01, 0, -0.008)), bb.clone().lerp(td.clone().add(V(0.02, 0, -0.01)), 1 - clamp((wp - 0.6) / 0.4, 0, 1)));
        if (m.snipW > 0.5) pts.splice(pts.length - 1, 1, bb.clone().add(V(-0.03, 0.01, 0.02)));
        thread(pts, MAT.thread, mDyn, 0.00034);
      }
      winderFill.material = MAT.thread;
    } else winderFill.material = MAT.threadB;
  }
  function machineHands(st) {
    const m = st.m, mf = st.mf;
    // threading: the right hand carries the thread's end; turning the wheel: the right hand on the wheel
    if (st.threadEnd && st.id === "thread-machine") st.handR = { f: "world", p: [st.threadEnd.x + 0.004, st.threadEnd.y - 0.004, st.threadEnd.z + 0.012], grip: 0.5, pinch: true };
    if (m.handOnWheel) { const a = -m.w * DEG; st.handR = { f: "world", p: [NP[0] + 0.5, NP[1] + 0.17 + 0.05 * Math.cos(a), NP[2] - 0.045 + 0.05 * Math.sin(-a) + 0.01], grip: 0.6 }; }
    if (st.id === "machine-parts") { st.handR = { f: "world", p: [NP[0] + 0.18, TY + 0.01, NP[2] + 0.18], grip: 0.1 }; st.handL = { f: "world", p: [NP[0] - 0.2, TY + 0.01, NP[2] + 0.17], grip: 0.1 }; }
    if (st.id === "wind-bobbin") {
      const k = st.step;
      if (k === 1) st.handR = { f: "world", p: [NP[0] + 0.42, NP[1] + 0.29 + (1 - (m.onPin || 0)) * 0.04, NP[2] - 0.0], grip: 0.5, pinch: true };
      else if (k === 2 || k === 3) st.handR = { f: "world", p: [NP[0] + 0.25, NP[1] + 0.29, NP[2] + 0.02], grip: 0.5, pinch: true };
      else if (k === 4) st.handR = { f: "world", p: [NP[0] + 0.41, NP[1] + 0.28, NP[2] + 0.0], grip: 0.4 };
      else st.handR = { f: "world", p: [NP[0] + 0.25, TY + 0.01, NP[2] + 0.2], grip: 0.1 };
      st.handL = { f: "world", p: [NP[0] - 0.12, TY + 0.01, NP[2] + 0.2], grip: 0.1 };
    }
    if (st.id === "thread-machine" && st.step >= 7) {
      if (st.step === 7) st.handR = { f: "world", p: [NP[0] + 0.01, NP[1] + 0.02, NP[2] + 0.06], grip: 0.5, pinch: true };
      if (st.step === 8) st.handL = { f: "world", p: [NP[0] - 0.02, NP[1] + 0.04, NP[2] + 0.04], grip: 0.5, pinch: true };
      if (st.step === 9) st.handR = { f: "world", p: [NP[0] + 0.01, NP[1] + 0.012, NP[2] - 0.03 - 0.03 * m.tails], grip: 0.5, pinch: true };
    }
    if (st.id === "thread-machine" && st.step < 2) st.handR = st.step === 0 ? { f: "world", p: [NP[0], NP[1] + 0.085, NP[2] - 0.11], grip: 0.4 } : st.handR;
  }
  function drawCut(st) {
    const c = st.cut;
    const cw = CUT.size[0], cd = CUT.size[1];
    // the folded cloth: two layers, the fold along the far edge; a few soft ripples that smooth out
    const wr = (1 - (c.fold || 0)) * 0.006;
    cCloth.update((i, j, t) => { const x = lerp(-cw / 2, cw / 2, i / NXc), z = lerp(-cd / 2, cd / 2, j / NZc); const y = (t ? 0.0022 : 0.0003) + wr * Math.sin(x * 23 + z * 9) * Math.sin(z * 17) * smooth(-0.3, 0.2, z) + 0.0012 * Math.sin(j / NZc * Math.PI) * 0; return [x, y, z, x, z]; });
    const showPat = (c.pat || 0) > 0 && !c.single;
    pattern.visible = showPat; pattern.position.y = 0.0025 + (1 - (c.pat || 0)) * 0.06; pattern.rotation.y = (1 - (c.pat || 0)) * 0.3;
    cutPins.forEach((pn, i) => {
      const v = (c.pins || [])[i] || 0; pn.visible = v > 0 && !c.single;
      const p = E.PINS[i], pc = M_.pincushion;
      const home = V(pc[0] - CUT.cloth[0], 0.05, pc[2] - CUT.cloth[1]), at = V(p[0], 0.0045, p[1]);
      const u = clamp(v * 2, 0, 1), w = clamp(v * 2 - 1, 0, 1);
      pn.position.copy(home.clone().lerp(at.clone().add(V(0, 0.01, 0)), u)).add(V(0, -0.008 * w, 0));
      // pins lie almost flat, perpendicular to the nearest edge, pointing inward
      const ang = Math.abs(p[1] - (E.PAT.z0 + E.PAT.h / 2)) > 0.08 ? (p[1] < 0 ? 0 : Math.PI) : (p[0] < 0 ? Math.PI / 2 : -Math.PI / 2);
      pn.rotation.set(0, 0, 0); pn.rotateY(ang); pn.rotateX(-Math.PI / 2 + 0.12 * w + (1 - w) * 0.6);
    });
    clearGroup(cutDyn);
    // the measuring tape from the grain arrow to the fold
    tapeStrip.visible = (c.measure || 0) > 0 && c.measure < 1;
    if (tapeStrip.visible) { const x = c.measure < 0.5 ? -0.084 : 0.084, zA = E.PAT.z0 + E.PAT.h * 0.5, zF = -cd / 2; tapeStrip.scale.set(zA - zF, 1, 1); tapeStrip.position.set(x, 0.0045, (zA + zF) / 2); tapeStrip.rotation.set(-Math.PI / 2, 0, Math.PI / 2); }
    // the cut so far: a fine dark gap along the cutting line
    if (c.s > 0 && c.path) {
      const n = Math.max(2, Math.round(c.s * c.N)); const pts = c.path.slice(0, n).map(p => V(p[0], 0.0024, p[1])); pts.push(V(c.at[0], 0.0024, c.at[1]));
      if (pts.length > 1) mesh(tubeGeo(pts, 0.0007, 0, 4), MAT.dark, cutDyn, false, false);
    }
    // the shears: open and closing along the line, lower blade on the table; closed and handle first at the end
    const sh = c.shears;
    shears.visible = !!sh;
    if (sh) {
      shears.position.set(sh.p[0], sh.p[1], sh.p[2]); shears.rotation.set(0, -sh.yaw, 0);
      const o = (sh.open || 0) * 0.32; shears.userData.a.rotation.y = o; shears.userData.b.rotation.y = -o * 0.15; shears.rotation.z = sh.hand > 0 ? 0 : 0.04;
    }
    // chalk, ruler, the chalk line and dots
    const markOn = st.id === "mark-fabric";
    chalk.visible = markOn; ruler.visible = markOn && (c.ruler || 0) > 0;
    if (markOn) {
      chalk.position.set(c.chalkP[0], c.chalkP[1], c.chalkP[2]); chalk.rotation.set(0, 0.3, c.chalk > 0 && c.chalk < 1 ? 0.5 : 0);
      ruler.position.set((c.lx[0] + c.lx[1]) / 2, 0.004 + (1 - c.ruler) * 0.05, c.lineZ - 0.025 + 0.0005);
      const fade = 1 - (c.brush || 0);
      if (c.chalk > 0 && fade > 0.02) { const x1 = lerp(c.lx[0], c.lx[1], Math.min(1, c.chalk)); const ln = mesh(new THREE.PlaneGeometry(Math.max(0.001, x1 - c.lx[0]), 0.0018), MAT.chalkLine, cutDyn, false, false); ln.rotation.x = -Math.PI / 2; ln.position.set((c.lx[0] + x1) / 2, 0.0026, c.lineZ); ln.material = MAT.chalkLine.clone(); ln.material.opacity = 0.8 * fade; ln.userData.ownMat = true; }
      if (c.dots > 0 && fade > 0.02) for (let k = 0; k < 3; k++) if (c.dots * 3 > k + 0.6) { const d = mesh(new THREE.CircleGeometry(0.0022, 14), MAT.chalkLine, cutDyn, false, false); d.rotation.x = -Math.PI / 2; d.position.set(-0.08 + k * 0.08, 0.0026, 0); }
      if ((c.test || 0) > 0) { const d = mesh(new THREE.PlaneGeometry(0.03 * Math.min(1, c.test * 1.4), 0.002), MAT.chalkLine, cutDyn, false, false); d.rotation.x = -Math.PI / 2; d.position.set(0.25, 0.0026, 0.17); }
    }
  }
  function drawPress(st) {
    const pr = st.pr, ir = st.iron;
    // the pieces: A lies toward the back (θ = 180°), B starts on top of it and opens toward the front
    const LT = E.LT;
    // build from directions: θ about x at the hinge; 0 points +z (toward the person), 180 points −z
    const place = (g, th, dy) => { g.rotation.set(0, 0, 0); g.scale.set(1, 1, 1); g.position.set(0, dy, 0); g.rotateX(-th * DEG); if (th > 90) { g.scale.y = -1; } };
    place(pA, 180, 0.0002);
    place(pB, 180 - 180 * pr.bOpen, 0.0002 + LT * 1.05 * (1 - pr.bOpen) + 0.0002);
    place(aA, pr.aA, LT * 2.1 + 0.0004);
    place(aB, pr.aB, LT * 3.2 + 0.0006);
    seamLine.position.y = LT;
    // the iron: flat and pressing, or standing on its heel
    const up = ir.upright;
    iron.position.set(ir.x, 0.0025 + ir.lift, ir.z);
    iron.rotation.set(0, Math.PI, 0);
    // standing on its heel: turn about the heel's edge (x = −0.12) until the nose points up
    const a = up * (Math.PI / 2 - 0.05);
    ironBody.rotation.set(0, 0, a); ironBody.position.set(-0.12 + 0.12 * Math.cos(a), 0.12 * Math.sin(a), 0);
    // the cord to the outlet, and the plug
    if (cordMesh) { press.remove(cordMesh); cordMesh.geometry.dispose(); }
    iron.updateMatrixWorld(true);
    const back = V(-0.115, 0.03, 0).applyMatrix4(ironBody.matrixWorld);
    const plugAt = V(OUT[0] - 0.02 - 0.12 * (1 - pr.plugged), OUT[1] - 0.18 * (1 - pr.plugged), OUT[2]);
    plug.position.copy(plugAt); plug.rotation.set(0, 0, 0);
    const pts = [back, back.clone().add(V(-0.05, 0.08, 0.02)), V(PB[0] + 0.3, PB[1] + 0.12, PB[2] + 0.05), V(PB[0] + 0.62, PB[1] - 0.3, PB[2] + 0.2), V(OUT[0] - 0.3, 0.05, OUT[2]), plugAt.clone().add(V(-0.03, 0, 0))];
    cordMesh = mesh(tubeGeo(pts.map(p => p.clone().sub(press.position)), 0.003, 0, 6), MAT.cord, press);
  }

  /* ═════════ render ═════════ */
  let darkNow = !!kit.dark();
  function applyLook() {
    darkNow = !!kit.dark();
    MAT.sky.color.set(darkNow ? "#1d2a44" : "#eaf3f7");
    lampL.intensity = darkNow ? 0.9 : 0.15;
  }
  applyLook();
  function render(st) {
    if (!st) return;
    lastSt = st;
    const s = st.station;
    // which corner of the room is in use
    work.visible = s === "hand"; cutG.visible = s === "cut";
    show(mTop.mesh, false); show(mBot.mesh, false); clearGroup(mDyn); prG.visible = s === "press";
    rest.visible = false;
    if (s === "hand") drawHand(st);
    if (s === "machine") { drawMachine(st); machineHands(st); } else { nbar.position.set(0, E.needleTipY(0) - NP[1], 0); foot.position.set(0, 0.0012 + E.T + 0.007, 0); hlRing.visible = false; bobbinG.visible = true; mSpool.visible = true; winderBob.visible = false; }
    if (s === "cut") drawCut(st);
    if (s === "press") drawPress(st); else { iron.position.set(-0.52, 0.0025, 0); iron.rotation.set(0, Math.PI, 0); const a = Math.PI / 2 - 0.05; ironBody.rotation.set(0, 0, a); ironBody.position.set(-0.12 + 0.12 * Math.cos(a), 0.12 * Math.sin(a), 0); prG.visible = false; if (!cordMesh) drawPress({ pr: { bOpen: 0, aA: 0, aB: 0, plugged: 1 }, iron: { x: -0.52, z: 0, lift: 0, upright: 1 } }); }
    // chairs: the empty one stays tucked in
    chairH.position.z = LAY.hand.seat[1] + (s === "hand" ? 0.06 : -0.02);
    chairM.position.z = M_.seat[1] + (s === "machine" ? 0.06 : -0.02);
    chairH.visible = true; chairM.visible = true;
    if (s === "cut" || s === "press") chairH.position.z = LAY.hand.seat[1] - 0.06;
    poseFigure(st);
    placeCam(st);
    stage.render();
  }
  function resize() {
    const host = kit.host, w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return false;
    const before = stage.renders();
    stage.resize(w, h);
    return stage.renders() !== before;
  }
  resize();

  return {
    canvas: stage.canvas,
    render,
    resize: () => { const changed = resize(); if (changed && lastSt) render(lastSt); return false; },
    setDark: d => { stage.setDark(!!d); applyLook(); },
    setCam: k => { camMode = k; if (k !== "orbit") orbitYaw = null; },
    cam: () => camMode,
    renders: () => stage.renders(),
    figure: () => fig,
    dispose: () => { try { if (fig) fig.dispose(); } catch (e) { /* fine */ } owned.forEach(t => t.dispose()); stage.dispose(); }
  };
}
