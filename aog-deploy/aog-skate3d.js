/* The Skate Lab in 3D (AOG-SKATE-3D-V1, 2026-10-12)
   Jimmy: "three.js 3d engine and keep on keeeping on. Remember we are the 1%."
   A real-time 3D skatepark and a jointed skater, driven by the same trick demos as the drawings in aog-skate.js
   (each demo frame: where the board is, how it is tipped, flipped and spun, where the feet are, how low the rider is).
   It draws only when asked: a step of a run, a drag of the camera, a resize. Nothing moves on its own.
   Loaded only when someone picks 3D (import() from aog-skate.js); three.js lives in /vendor/three-0.160.0 (MIT).
   World: x along the run (as in the drawings), y up, z toward the viewer. The rider's toes point toward the viewer. */
import * as THREE from "/vendor/three-0.160.0/three.module.min.js";

const DEG = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function create(kit) {
  // kit: { host, before, colors(), BOARD, deckMid(x), path(), at(s), dark() }
  const B = kit.BOARD;
  const canvas = document.createElement("canvas");
  canvas.className = "gl"; canvas.setAttribute("aria-hidden", "true");
  kit.host.insertBefore(canvas, kit.before);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, 160);

  /* ── materials: every color comes from the page's tokens, so light and dark both work ── */
  const M = {};
  const mat = (k, o) => (M[k] = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o || {})));
  ["hood", "hoodDk", "cargo", "cargoDk", "shoe", "sole", "skin", "helmet", "hair", "sticker", "grip", "wood", "truck", "wheel", "core", "bush",
   "ground", "ramp", "rampSide", "coping", "curb", "metal", "wax", "grass", "prop", "propDk", "lamp", "leaf", "trunk", "far"].forEach(k => mat(k));
  M.truck.metalness = 0.75; M.truck.roughness = 0.35; M.coping.metalness = 0.8; M.coping.roughness = 0.3; M.metal.metalness = 0.7; M.metal.roughness = 0.4;
  M.wheel.roughness = 0.55; M.helmet.roughness = 0.45; M.sole.roughness = 0.7; M.grip.roughness = 1;
  M.lamp.emissiveIntensity = 1;

  /* ── textures drawn once on small canvases ── */
  function canvasTex(w, h, draw, rep) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  }
  function noise(g, w, h, n, a, dark) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${dark ? "0,0,0" : "255,255,255"},${Math.random() * a})`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  let rng = 7; const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647;
  // concrete: a 1.5 m slab with a joint on two edges, speckles and a few soft stains
  const concreteTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#bdbdbd"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const x = rand() * w, y = rand() * h, r = 20 + rand() * 50; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(0,0,0,0.06)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    noise(g, w, h, 2600, 0.25, true); noise(g, w, h, 1600, 0.35, false);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h);
    g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.62, h * 0.2); g.lineTo(w * 0.7, h * 0.35); g.lineTo(w * 0.66, h * 0.48); g.stroke();
  }, [80, 80]);
  const gripTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#777"; g.fillRect(0, 0, w, h); noise(g, w, h, 3000, 0.5, true); noise(g, w, h, 1200, 0.4, false); }, [6, 1]);
  const plyTex = canvasTex(8, 64, (g, w, h) => { const c = ["#e8c99a", "#b8743f", "#e2bf8d", "#3a6fb0", "#e8c99a", "#c0601a", "#e2bf8d"]; c.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * h / 7, w, h / 7 + 1); }); });
  const bottomTex = canvasTex(512, 128, (g, w, h) => {   // the graphic under the deck: bold stripes and a plain circle (no logos)
    g.fillStyle = "#f2eee4"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#c0601a"; g.fillRect(w * 0.18, 0, w * 0.1, h); g.fillStyle = "#2e6fb0"; g.fillRect(w * 0.3, 0, w * 0.05, h);
    g.fillStyle = "#1f2430"; g.beginPath(); g.arc(w * 0.6, h / 2, h * 0.32, 0, 7); g.fill(); g.fillStyle = "#f2eee4"; g.beginPath(); g.arc(w * 0.6, h / 2, h * 0.16, 0, 7); g.fill();
    g.fillStyle = "#1f2430"; g.fillRect(w * 0.76, 0, w * 0.04, h);
  });
  const grassTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#6f9a55"; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(${rand() < .5 ? "40,80,30" : "150,190,110"},0.6)`; const x = rand() * w, y = rand() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rand() * 2 - 1, y - 3 - rand() * 4); g.stroke(); } }, [8, 8]);
  const plywoodTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#c9b48c"; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = "rgba(120,90,50,0.12)"; g.beginPath(); const y = rand() * h; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 8, w * .6, y - 8, w, y + 4); g.stroke(); } g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); }, [2, 2]);
  M.ground.map = concreteTex; M.grip.map = gripTex; M.ramp.map = plywoodTex; M.grass.map = grassTex;
  const woodEdge = new THREE.MeshStandardMaterial({ map: plyTex, roughness: 0.7 });
  const deckBottom = new THREE.MeshStandardMaterial({ map: bottomTex, roughness: 0.6 });

  function colors() {
    const C = kit.colors(), dark = kit.dark();
    const set = (k, c, sh) => { const col = new THREE.Color(c || "#888"); if (sh) col.offsetHSL(0, 0, sh); M[k].color.copy(col); };
    set("hood", C.hood); set("hoodDk", C.hood, -0.05); set("cargo", C.cargo); set("cargoDk", C.cargo, -0.06); set("shoe", C.shoe); set("sole", C.sole);
    set("skin", C.skin); set("helmet", C.helmet); set("hair", C.hair); set("sticker", C.ke); set("grip", "#ffffff"); M.grip.color.setRGB(0.16, 0.16, 0.17);
    set("truck", C.truck); set("wheel", C.wheel); set("core", C.ke); set("bush", C.ke, 0.1);
    set("ground", dark ? "#7c818a" : "#e9e4da"); set("ramp", dark ? "#b6a585" : "#f4e7cc"); set("rampSide", dark ? "#5a5246" : "#a8957a");
    set("coping", "#c9ced6"); set("curb", dark ? "#9a9890" : "#d8d3c8"); set("metal", "#9aa3ad"); set("wax", C.ke);
    set("grass", dark ? "#9fb08f" : "#ffffff"); set("prop", dark ? "#6b7079" : "#cfc8bb"); set("propDk", dark ? "#4c5058" : "#9d9586");
    set("leaf", dark ? "#3e5a45" : "#6e9a5c"); set("trunk", "#6b5340"); set("far", dark ? "#3c4252" : "#cdd3d8");
    M.lamp.color.set(dark ? "#fff1c9" : "#eeeeee"); M.lamp.emissive = new THREE.Color(dark ? "#ffd98a" : "#000000");
    const sky = new THREE.Color(dark ? "#1b2230" : "#dfe9ef");
    scene.background = sky; scene.fog = new THREE.Fog(sky, dark ? 14 : 18, dark ? 46 : 70);
    hemi.color.set(dark ? "#6f7f9f" : "#ffffff"); hemi.groundColor.set(dark ? "#2a2620" : "#b9a98f"); hemi.intensity = dark ? 0.95 : 1.15;
    sun.color.set(dark ? "#aab8e0" : "#fff4e2"); sun.intensity = dark ? 0.9 : 2.2;
    lampLights.forEach(l => l.intensity = dark ? 26 : 0);
    renderer.toneMappingExposure = dark ? 1.15 : 1.0;
  }

  /* ── lights: the sun (soft shadows), the sky, and two park lamps that light up at night ── */
  const hemi = new THREE.HemisphereLight("#ffffff", "#b9a98f", 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff4e2", 2.2); sun.castShadow = true;
  const phone = Math.min(window.innerWidth, window.innerHeight) < 600;
  sun.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -2, near: 0.5, far: 30 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun); scene.add(sun.target);
  const lampLights = [];

  /* ── the board: a deck bent into its kicks with a little concave, grip on top, plies on the edge, a graphic below ── */
  function deckGeometry() {
    const L = B.half, hw = 0.105, t = B.thick, NX = 72, NZ = 10;
    const width = x => { const ax = Math.abs(x), r = L - hw; return ax <= r ? hw : Math.sqrt(Math.max(0, hw * hw - (ax - r) * (ax - r))); };
    const yAt = (x, z, top) => kit.deckMid(x) - B.deckY + (top ? t / 2 : -t / 2) + 0.0035 * Math.pow(z / hw, 2) * (Math.abs(x) < 0.3 ? 1 : 0.4);
    const pos = [], uv = [], idx = [], groups = [];
    const grid = (top) => {
      const base = pos.length / 3;
      for (let i = 0; i <= NX; i++) { const x = -L + 2 * L * i / NX, w = Math.max(width(x), 0.0005);
        for (let j = 0; j <= NZ; j++) { const z = -w + 2 * w * j / NZ; pos.push(x, yAt(x, z, top), z); uv.push(i / NX, j / NZ); } }
      const start = idx.length;
      for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { const a = base + i * (NZ + 1) + j, b = a + NZ + 1;
        if (top) idx.push(a, a + 1, b, a + 1, b + 1, b); else idx.push(a, b, a + 1, a + 1, b, b + 1); }
      return [start, idx.length - start];
    };
    const g1 = grid(true), g2 = grid(false);
    // the edge: a band around the outline
    const base = pos.length / 3, ring = [];
    for (let i = 0; i <= NX; i++) { const x = -L + 2 * L * i / NX; ring.push([x, -Math.max(width(x), 0.0005)]); }
    for (let i = NX; i >= 0; i--) { const x = -L + 2 * L * i / NX; ring.push([x, Math.max(width(x), 0.0005)]); }
    ring.forEach(([x, z], k) => { pos.push(x, yAt(x, z, true), z, x, yAt(x, z, false), z); uv.push(k / ring.length, 0, k / ring.length, 1); });
    const s3 = idx.length;
    for (let k = 0; k < ring.length - 1; k++) { const a = base + 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    geo.addGroup(g1[0], g1[1], 0); geo.addGroup(g2[0], g2[1], 1); geo.addGroup(s3, idx.length - s3, 2);
    geo.computeVertexNormals();
    return geo;
  }
  function wheelGeometry() {   // a urethane wheel turned on a lathe: rounded lip, flat riding surface
    const r = B.wheelR, w = 0.032, pts = [];
    pts.push(new THREE.Vector2(0.008, -w / 2));
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + Math.PI / 2 * i / 6; pts.push(new THREE.Vector2(r - 0.006 + Math.cos(a) * 0.006, -w / 2 + 0.006 + Math.sin(a) * 0.006)); }
    for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 * i / 6; pts.push(new THREE.Vector2(r - 0.006 + Math.cos(a) * 0.006, w / 2 - 0.006 + Math.sin(a) * 0.006)); }
    pts.push(new THREE.Vector2(0.008, w / 2));
    const g = new THREE.LatheGeometry(pts, 28); g.rotateX(Math.PI / 2); return g;   // the axle along z
  }
  const shadowed = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  function makeBoard() {
    const g = new THREE.Group();
    const deck = new THREE.Mesh(deckGeometry(), [M.grip, deckBottom, woodEdge]); deck.position.y = B.deckY; g.add(deck);
    const wheels = [];
    [-B.axle, B.axle].forEach(x => {
      const top = kit.deckMid(x) - B.thick / 2;
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.01, 0.055), M.truck); base.position.set(x, top - 0.005, 0); g.add(base);
      const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 12), M.bush); bush.position.set(x + (x < 0 ? 0.008 : -0.008), top - 0.017, 0); g.add(bush);
      const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.07, 3, 1), M.truck); hanger.rotation.z = Math.PI / 2; hanger.rotation.y = Math.PI / 2;
      hanger.scale.set(1, 1, 1); hanger.position.set(x, B.wheelR + 0.012, 0); g.add(hanger);
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.205, 8), M.truck); axle.rotation.x = Math.PI / 2; axle.position.set(x, B.wheelR, 0); g.add(axle);
      const hb = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.016, 0.15), M.truck); hb.position.set(x, B.wheelR + 0.006, 0); g.add(hb);
      [-1, 1].forEach(s => {
        const wg = new THREE.Group(); wg.position.set(x, B.wheelR, s * 0.088);
        const w = new THREE.Mesh(wheelGeometry(), M.wheel); wg.add(w);
        const core = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.033, 6), M.core); core.rotation.x = Math.PI / 2; wg.add(core);
        g.add(wg); wheels.push(wg);
      });
    });
    g.userData.wheels = wheels;
    return shadowed(g);
  }

  /* ── the skater: meshes placed joint to joint every frame (no skinning: crisp, light, exact) ── */
  const UP = V(0, 1, 0);
  function taper(r0, r1, seg) { const g = new THREE.CylinderGeometry(r1, r0, 1, seg || 14, 1); g.translate(0, 0.5, 0); return g; }   // from y = 0 (r0) to y = 1 (r1)
  function limb(geo, m) { const o = new THREE.Mesh(geo, m); o.castShadow = true; return o; }
  function place(o, a, b) { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); o.position.copy(a); o.quaternion.setFromUnitVectors(UP, d.normalize()); o.scale.set(1, L, 1); }
  function shoeGeometry() {   // a skate shoe from the side, toe toward +x, then given its width
    const L = 0.27, h = 0.085, s = new THREE.Shape(), heel = -L * 0.42, toe = L * 0.58;
    s.moveTo(heel, 0.0); s.lineTo(heel - 0.004, h * 0.8); s.quadraticCurveTo(heel + 0.01, h + 0.006, heel + L * 0.22, h * 0.95);
    s.quadraticCurveTo(heel + L * 0.36, h * 1.08, heel + L * 0.44, h * 0.92); s.quadraticCurveTo(toe - L * 0.12, h * 0.62, toe - 0.006, h * 0.36);
    s.quadraticCurveTo(toe + 0.008, 0.02, toe - 0.01, 0); s.lineTo(heel, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.012, bevelSegments: 3, curveSegments: 8 });
    g.translate(0, 0.022, -0.035); return g;
  }
  function soleGeometry() { const g = new THREE.BoxGeometry(0.29, 0.024, 0.1); g.translate(0.02, 0.012, 0); return g; }
  function makeRider() {
    const R = new THREE.Group(), P = {};
    P.thighF = limb(taper(0.085, 0.07), M.cargo); P.thighB = limb(taper(0.085, 0.07), M.cargoDk);
    P.shinF = limb(taper(0.07, 0.082), M.cargo); P.shinB = limb(taper(0.07, 0.082), M.cargoDk);
    P.kneeF = limb(new THREE.SphereGeometry(0.072, 14, 10), M.cargo); P.kneeB = limb(new THREE.SphereGeometry(0.072, 14, 10), M.cargoDk);
    P.pelvis = limb(new THREE.CapsuleGeometry(0.1, 0.12, 6, 12), M.cargoDk);
    P.torso = limb(new THREE.CapsuleGeometry(0.15, 0.26, 8, 18), M.hood);
    P.hem = limb(new THREE.CylinderGeometry(0.19, 0.18, 0.07, 18), M.hood);
        P.hood = limb(new THREE.SphereGeometry(0.1, 16, 10), M.hoodDk);
    P.strL = limb(taper(0.006, 0.006, 6), M.sole); P.strR = limb(taper(0.006, 0.006, 6), M.sole);
    P.neck = limb(taper(0.045, 0.042, 10), M.skin);
    P.head = limb(new THREE.SphereGeometry(0.1, 20, 16), M.skin);
    P.earL = limb(new THREE.SphereGeometry(0.02, 8, 6), M.skin); P.earR = limb(new THREE.SphereGeometry(0.02, 8, 6), M.skin);
    P.hair = limb(new THREE.SphereGeometry(0.1, 16, 10), M.hair);
    P.helmet = limb(new THREE.SphereGeometry(0.122, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), M.helmet);
    P.stripe = limb(new THREE.SphereGeometry(0.1235, 24, 3, 0, Math.PI * 2, Math.PI * 0.27, Math.PI * 0.06), M.sole);
    P.brim = limb(new THREE.BoxGeometry(0.05, 0.012, 0.15), M.helmet);
    P.sticker = limb(new THREE.CircleGeometry(0.022, 12), M.sticker);
    ["F", "B"].forEach(s => {
      P["sh" + s] = limb(new THREE.SphereGeometry(0.068, 14, 10), s === "F" ? M.hood : M.hoodDk);
      P["upper" + s] = limb(taper(0.062, 0.052), s === "F" ? M.hood : M.hoodDk);
      P["elbow" + s] = limb(new THREE.SphereGeometry(0.052, 12, 8), s === "F" ? M.hood : M.hoodDk);
      P["fore" + s] = limb(taper(0.05, 0.046), s === "F" ? M.hood : M.hoodDk);
      P["cuff" + s] = limb(new THREE.CylinderGeometry(0.044, 0.044, 0.03, 12), M.hoodDk);
      P["hand" + s] = limb(new THREE.SphereGeometry(0.042, 12, 10), M.skin);
      const sh = new THREE.Group(); sh.add(limb(shoeGeometry(), M.shoe)); sh.add(limb(soleGeometry(), M.sole)); P["shoe" + s] = sh;
      P["cuffL" + s] = limb(new THREE.CylinderGeometry(0.088, 0.078, 0.05, 14), s === "F" ? M.cargo : M.cargoDk);
    });
    Object.values(P).forEach(o => R.add(o));
    R.traverse(m => { if (m.isMesh) m.castShadow = true; });
    R.userData.P = P;
    return R;
  }
  // two-bone reach: from a toward c with two parts of length l, bending toward the pole direction
  function knee(a, c, l, pole) {
    const d = new THREE.Vector3().subVectors(c, a), D = Math.min(d.length(), 2 * l - 1e-4), dn = d.clone().normalize();
    const h = Math.sqrt(Math.max(0, l * l - D * D / 4));
    const p = pole.clone().sub(dn.clone().multiplyScalar(pole.dot(dn))).normalize();
    return a.clone().add(dn.multiplyScalar(D / 2)).add(p.multiplyScalar(h));
  }
  function poseRider(R, o) {
    // o: fF, fB, hip (Vector3, in the surface frame), lean (rad), turn (rad), nose (+1/−1: world x of the board's nose), arms, lift, str, crouch
    const P = R.userData.P;
    const F = V(Math.sin(o.turn), 0, Math.cos(o.turn));                         // the chest's direction
    const U = V(0, 1, 0).applyAxisAngle(F, -o.lean);                             // up the spine, leaning toward the nose
    const X = new THREE.Vector3().crossVectors(U, F).normalize();               // the body's right
    const n = Math.sign(X.x * o.nose) || 1, S = X.clone().multiplyScalar(n);    // S points toward the nose side
    const hip = o.hip;
    const hipF = hip.clone().addScaledVector(S, 0.085), hipB = hip.clone().addScaledVector(S, -0.085);
    const pole = F.clone().addScaledVector(S, 0.75).normalize();   // knees forward over the toes and toward the nose
    [["F", o.fF, hipF], ["B", o.fB, hipB]].forEach(([s, f, hj]) => {
      const ank = f.clone().add(V(0, 0.06, 0));
      const k = knee(hj, ank, 0.45, pole);
      place(P["thigh" + s], hj, k); place(P["shin" + s], k, ank); P["knee" + s].position.copy(k);
      P["cuffL" + s].position.copy(ank).add(V(0, 0.005, 0)); P["cuffL" + s].quaternion.setFromUnitVectors(UP, new THREE.Vector3().subVectors(k, ank).normalize());
      // the shoe: toes toward the viewer side of the body, the front one turned a little toward the nose
      const sh = P["shoe" + s], fwd = F.clone().addScaledVector(S, s === "F" ? 0.38 : 0.1).setY(0).normalize();
      sh.position.copy(f); sh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(fwd, V(0, 1, 0), new THREE.Vector3().crossVectors(fwd, V(0, 1, 0))));
      sh.position.addScaledVector(fwd, -0.04);
    });
    place(P.pelvis, hipB.clone().addScaledVector(S, -0.02), hipF.clone().addScaledVector(S, 0.02)); P.pelvis.scale.set(1, 1, 1);
    P.pelvis.position.copy(hip); P.pelvis.quaternion.setFromUnitVectors(UP, S);
    // the hoodie: boxy, a ribbed hem, a pocket, the hood lumped behind the neck
    const basis = new THREE.Matrix4().makeBasis(X, U, F), q = new THREE.Quaternion().setFromRotationMatrix(basis);
    P.torso.position.copy(hip).addScaledVector(U, 0.27); P.torso.quaternion.copy(q); P.torso.scale.set(1.32, 1, 0.78);
    P.hem.position.copy(hip).addScaledVector(U, 0.02); P.hem.quaternion.copy(q); P.hem.scale.set(1.02, 1, 0.66);
    const neck = hip.clone().addScaledVector(U, 0.53);
    P.hood.position.copy(neck).addScaledVector(F, -0.07).addScaledVector(U, -0.02); P.hood.quaternion.copy(q); P.hood.scale.set(1.25, 0.75, 0.9);
    [["strL", -0.035], ["strR", 0.035]].forEach(([k, x]) => { const a = neck.clone().addScaledVector(X, x).addScaledVector(F, 0.1).addScaledVector(U, -0.04);
      const b = a.clone().addScaledVector(U, -0.13).addScaledVector(F, 0.03).addScaledVector(S, (o.str || 0) * 0.06); place(P[k], a, b); });
    // the head: turned to look toward the nose, a helmet with its brim forward, no face
    const look = F.clone().multiplyScalar(0.35).addScaledVector(S, 0.95).normalize();
    const headC = hip.clone().addScaledVector(U, 0.69).addScaledVector(F, 0.01);
    place(P.neck, neck.clone().addScaledVector(U, -0.02), headC);
    const hx = new THREE.Vector3().crossVectors(UP, look).normalize(), hq = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(hx, UP, look.clone()));
    P.head.position.copy(headC); P.head.quaternion.copy(hq); P.head.scale.set(0.92, 1.12, 1);
    P.earL.position.copy(headC).addScaledVector(hx, 0.093); P.earR.position.copy(headC).addScaledVector(hx, -0.093);
    P.hair.position.copy(headC).addScaledVector(look, -0.028).addScaledVector(UP, -0.005); P.hair.quaternion.copy(hq); P.hair.scale.set(0.9, 0.95, 0.82);   // hair showing at the back, under the helmet
    const hc = headC.clone().addScaledVector(UP, 0.03).addScaledVector(look, -0.01);
    P.helmet.position.copy(hc); P.helmet.quaternion.copy(hq); P.helmet.scale.set(0.95, 1.05, 1.05);
    P.stripe.position.copy(hc); P.stripe.quaternion.copy(hq); P.stripe.scale.set(0.95, 1.05, 1.05);
    P.brim.position.copy(hc).addScaledVector(look, 0.12).addScaledVector(UP, 0.005); P.brim.quaternion.copy(hq);
    P.sticker.position.copy(hc).addScaledVector(hx, 0.1).addScaledVector(UP, 0.06); P.sticker.quaternion.setFromUnitVectors(V(0, 0, 1), hx.clone().addScaledVector(UP, 0.5).normalize());
    // the arms: the front one leads, the back one trails; both come up in the air
    const a = o.arms == null ? 1 : o.arms, lift = o.lift || 0;
    [["F", 1, 0.28 + 0.5 * a + lift * 0.65, -0.42], ["B", -1, 0.36 + 0.6 * a + lift * 0.8, -0.25]].forEach(([s, sd, up, elb]) => {
      up = Math.min(2.1, up);
      const sh = hip.clone().addScaledVector(U, 0.47).addScaledVector(S, sd * 0.2);
      const out = S.clone().multiplyScalar(sd);
      const d1 = U.clone().multiplyScalar(-Math.cos(up)).addScaledVector(out, Math.sin(up)).addScaledVector(F, sd > 0 ? 0.22 : -0.08).normalize();
      const el = sh.clone().addScaledVector(d1, 0.27);
      const a2 = up + elb + lift * 0.5;
      const d2 = U.clone().multiplyScalar(-Math.cos(a2)).addScaledVector(out, Math.sin(a2)).addScaledVector(F, sd > 0 ? 0.45 : 0.1).normalize();
      const hand = el.clone().addScaledVector(d2, 0.25);
      P["sh" + s].position.copy(sh); place(P["upper" + s], sh, el); P["elbow" + s].position.copy(el);
      const wrist = el.clone().addScaledVector(d2, 0.2); place(P["fore" + s], el, wrist);
      P["cuff" + s].position.copy(wrist); P["cuff" + s].quaternion.setFromUnitVectors(UP, d2);
      P["hand" + s].position.copy(hand); P["hand" + s].scale.set(0.85, 1.1, 0.75); P["hand" + s].quaternion.setFromUnitVectors(UP, d2);
    });
  }

  /* ── the park ── */
  const world = new THREE.Group(); scene.add(world);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), M.ground); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; world.add(ground);
  const box = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; world.add(o); return o; };
  // set dressing behind the run: a long ledge, a flat bar, a bank, benches, lamp posts, a fence, trees and far buildings
  for (let k = -3; k <= 3; k++) {
    const x0 = k * 9;
    box(3.2, 0.42, 0.55, M.prop, x0 + 1.5, 0.21, -3.4); const edge = box(3.2, 0.025, 0.03, M.metal, x0 + 1.5, 0.43, -3.12);
    box(2.6, 0.04, 0.05, M.metal, x0 + 6, 0.33, -4.6); [x0 + 4.9, x0 + 7.1].forEach(x => box(0.05, 0.33, 0.05, M.metal, x, 0.165, -4.6));
    const bank = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.2, 3, 1, false), M.prop); bank.rotation.set(Math.PI / 2, 0, 0); bank.scale.set(1.3, 1, 0.5); bank.position.set(x0 + 4, 0.25, -7); bank.castShadow = bank.receiveShadow = true; world.add(bank);
    box(1.6, 0.06, 0.4, M.propDk, x0 + 0.5, 0.45, -6.2); [x0 - 0.1, x0 + 1.1].forEach(x => box(0.08, 0.45, 0.35, M.propDk, x, 0.225, -6.2));
    // a lamp post with its light
    const px = x0 + 3; box(0.08, 4.2, 0.08, M.propDk, px, 2.1, -5.2); box(0.7, 0.06, 0.08, M.propDk, px + 0.3, 4.2, -5.2);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.2), M.lamp); head.position.set(px + 0.55, 4.15, -5.2); world.add(head);
    if (Math.abs(k) <= 1) { const l = new THREE.SpotLight("#ffd98a", 0, 16, 0.75, 0.6, 1.6); l.position.set(px + 0.55, 4.1, -5.2); l.target.position.set(px + 0.8, 0, -1); world.add(l); world.add(l.target); lampLights.push(l); }
    // trees
    [x0 - 2, x0 + 5.5].forEach((x, i) => { const tz = -11 - i * 2.5; const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.2, 7), M.trunk); tr.position.set(x, 1.1, tz); tr.castShadow = true; world.add(tr);
      const lf = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 0), M.leaf); lf.position.set(x, 2.9, tz); lf.castShadow = true; world.add(lf); });
  }
  // the fence: posts and a top rail
  for (let x = -30; x <= 30; x += 2.5) box(0.05, 1.8, 0.05, M.metal, x, 0.9, -9);
  box(60, 0.04, 0.04, M.metal, 0, 1.8, -9); box(60, 0.04, 0.04, M.metal, 0, 0.1, -9);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 1.7), new THREE.MeshBasicMaterial({ color: "#8a929b", transparent: true, opacity: 0.12, depthWrite: false })); mesh.position.set(0, 0.95, -9); world.add(mesh);
  // the city far off in the haze
  for (let i = 0; i < 26; i++) { const h = 4 + rand() * 14, w = 3 + rand() * 6; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 4), M.far); b.position.set(-60 + i * 4.8 + rand() * 2, h / 2, -38 - rand() * 10); world.add(b); }

  // the scenes a demo can ask for
  const stage = new THREE.Group(); scene.add(stage);
  function rampMesh() {   // the mini ramp: the lab's own curve swept across 2.4 m, decks on both sides, steel coping
    const g = new THREE.Group(), pts = kit.path(), top = pts[0].y, W2 = 1.2;
    const s = new THREE.Shape(); s.moveTo(pts[0].x - 1.6, -0.0001); s.lineTo(pts[0].x - 1.6, top); s.lineTo(pts[0].x, top);
    pts.forEach(p => s.lineTo(p.x, p.y)); const xe = pts[pts.length - 1].x; s.lineTo(xe + 1.6, top); s.lineTo(xe + 1.6, -0.0001); s.lineTo(pts[0].x - 1.6, -0.0001);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 2 * W2, bevelEnabled: false, curveSegments: 4 });
    geo.translate(0, 0, -W2);
    const side = new THREE.Mesh(geo, [M.rampSide, M.ramp]); side.castShadow = side.receiveShadow = true; g.add(side);
    // the riding surface: a sheet laid on the curve so the plywood texture follows it
    const pos = [], uv = [], idx = []; let acc = 0;
    pts.forEach((p, i) => { if (i) acc += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); pos.push(p.x, p.y + 0.002, -W2, p.x, p.y + 0.002, W2); uv.push(acc, 0, acc, 2.4); });
    for (let i = 0; i < pts.length - 1; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx); sg.computeVertexNormals();
    const sheet = new THREE.Mesh(sg, M.ramp); sheet.receiveShadow = true; g.add(sheet);
    [pts[0].x, xe].forEach(x => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2 * W2, 14), M.coping); c.rotation.x = Math.PI / 2; c.position.set(x, top, 0); c.castShadow = true; g.add(c); });
    return g;
  }
  function curbMesh() {
    const g = new THREE.Group(), c0 = -0.5, c1 = 1.32, ht = 0.16;
    const b = new THREE.Mesh(new THREE.BoxGeometry(c1 - c0, ht, 0.4), M.curb); b.position.set((c0 + c1) / 2, ht / 2, 0); b.castShadow = b.receiveShadow = true; g.add(b);
    const iron = new THREE.Mesh(new THREE.BoxGeometry(c1 - c0, 0.012, 0.03), M.metal); iron.position.set((c0 + c1) / 2, ht + 0.004, 0.19); g.add(iron);
    const iron2 = iron.clone(); iron2.position.z = -0.19; g.add(iron2);
    const wax = new THREE.Mesh(new THREE.BoxGeometry(c1 - c0 - 0.1, 0.002, 0.36), new THREE.MeshStandardMaterial({ color: M.wax.color, roughness: 0.2, transparent: true, opacity: 0.25 })); wax.position.set((c0 + c1) / 2, ht + 0.001, 0); g.add(wax);
    return g;
  }
  function grassMesh() { const g = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), M.grass); g.rotation.x = -Math.PI / 2; g.position.set(0, 0.003, 0.4); g.receiveShadow = true; return g; }
  let sceneName = null;
  function setScene(name) {
    if (name === sceneName) return; sceneName = name;
    while (stage.children.length) stage.remove(stage.children[0]);
    if (name === "ramp") stage.add(rampMesh()); else if (name === "curb") stage.add(curbMesh()); else if (name === "grass") stage.add(grassMesh());
  }

  /* ── the board and the rider, inside a frame that sits on the ground or on the ramp ── */
  const surf = new THREE.Group(); scene.add(surf);
  const boardOuter = new THREE.Group(), pitchG = new THREE.Group(), dirG = new THREE.Group(), spinG = new THREE.Group();
  surf.add(boardOuter); boardOuter.add(pitchG); pitchG.add(dirG); dirG.add(spinG);
  const board = makeBoard(); spinG.add(board);
  const rider = makeRider(); surf.add(rider);
  const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.12, depthWrite: false }));
  shadowDisc.rotation.x = -Math.PI / 2; shadowDisc.scale.set(1, 0.32, 1); surf.add(shadowDisc);

  const tmp = new THREE.Vector3();
  function footOnBoard(q) {   // a foot's place on the board ([x along it, lift]) → the surface frame
    tmp.set(q[0], kit.deckMid(q[0]) + B.thick / 2 + q[1], 0);
    spinG.localToWorld(tmp); return surf.worldToLocal(tmp.clone());
  }
  let lastFr = null, camMode = "follow", orbit = { th: 0.6, el: 0.22, dist: 4.4 }, camX = null;
  function pose(fr) {
    lastFr = fr;
    let sx = 0, sy = 0, ang = 0;
    if (fr.mode === "path") { const q = kit.at(fr.s0); sx = q.x; sy = q.y; ang = Math.atan2(q.ty, q.tx); }
    surf.position.set(sx, sy, 0); surf.rotation.set(0, 0, ang);
    const dir = fr.dir, pv = (fr.piv === "back" ? -B.axle : fr.piv === "front" ? B.axle : 0) * dir, a = fr.pitch * DEG * dir;
    boardOuter.position.set(fr.bx + pv, fr.by + fr.h, 0);
    pitchG.rotation.set(0, 0, a); dirG.position.set(-pv, 0, 0); dirG.rotation.set(0, dir < 0 ? Math.PI : 0, 0);
    spinG.rotation.set(fr.roll * DEG, fr.yaw * DEG, 0, "YXZ");
    const roll = -((fr.mode === "path" ? fr.s0 * dir : fr.bx) / B.wheelR);
    board.userData.wheels.forEach(w => w.rotation.z = roll * dir);
    shadowDisc.position.set(fr.bx, fr.by + 0.004, 0); const k = Math.max(0.3, 1 - fr.h * 1.6); shadowDisc.material.opacity = 0.16 * k;
    surf.updateMatrixWorld(true);
    const gz = 0.14;   // a foot on the ground stands just in front of the board
    const fF = fr.f ? footOnBoard(fr.f) : V(fr.fg[0], fr.fg[1], gz), fB = fr.b ? footOnBoard(fr.b) : V(fr.bg[0], fr.bg[1], gz);
    const mid = fF.clone().add(fB).multiplyScalar(0.5); mid.x += fr.hx;
    let hip = V(mid.x, mid.y + 0.84 - 0.36 * fr.crouch + fr.jump, mid.z - 0.01);
    const ba = fr.ba * DEG; const hx = hip.x - mid.x, hy = hip.y - mid.y;
    hip.set(mid.x + hx * Math.cos(ba) - hy * Math.sin(ba), mid.y + hx * Math.sin(ba) + hy * Math.cos(ba), hip.z);
    const noseW = new THREE.Vector3(1, 0, 0).applyQuaternion(spinG.getWorldQuaternion(new THREE.Quaternion()));
    poseRider(rider, { fF, fB, hip, lean: fr.lean - ba, turn: fr.turn * DEG * dir, nose: noseW.x >= 0 ? 1 : -1, arms: fr.arms, lift: fr.lift, str: fr.str });
    return surf.localToWorld(hip.clone());
  }
  function aimCamera(target, fr) {
    const fx = fr && fr.cam != null ? fr.cam : target.x;
    if (camMode === "side") { camera.fov = 22; camera.position.set(fx, 1.0, 9.5); camera.lookAt(fx, 0.85, 0); }
    else if (camMode === "fish") { camera.fov = 96; const d = fr ? fr.dir : 1; camera.position.set(target.x + 0.9 * d, 0.32, 1.45); camera.lookAt(target.x - 0.1 * d, 0.62, 0); }
    else if (camMode === "orbit") { camera.fov = 38; const c = V(target.x, Math.max(0.7, target.y - 0.1), 0);
      camera.position.set(c.x + Math.sin(orbit.th) * Math.cos(orbit.el) * orbit.dist, c.y + Math.sin(orbit.el) * orbit.dist + 0.2, Math.cos(orbit.th) * Math.cos(orbit.el) * orbit.dist); camera.lookAt(c); }
    else { camera.fov = 40; camera.position.set(fx + 0.55, 1.05, 3.3); camera.lookAt(fx + 0.05, 0.78, 0); }   // the filmer, a little ahead, at chest height
    if (sceneName === "ramp" && camMode !== "orbit" && camMode !== "fish") { camera.fov = camMode === "side" ? 30 : 46; const cx = 1.1; camera.position.set(cx, camMode === "side" ? 1.2 : 1.6, camMode === "side" ? 9 : 5.6); camera.lookAt(cx, 0.75, 0); }
    camera.updateProjectionMatrix();
    sun.position.set(target.x - 3, 7, 5); sun.target.position.set(target.x, 0, 0); sun.target.updateMatrixWorld();
  }
  let W = 0, H = 0, renders = 0;
  function resize(w, h) { if (w === W && h === H) return; W = w; H = h; renderer.setSize(w, h, false); canvas.style.width = w + "px"; canvas.style.height = h + "px"; camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function render(fr, D) {
    if (D) setScene(D.scene);
    if (!fr) return;
    const t = pose(fr);
    aimCamera(t, fr);
    renderer.render(scene, camera); renders++;
  }
  // drag sideways to walk the camera around the rider (it switches to the orbit camera); never on its own
  let drag = null;
  function onDown(e) { drag = { x: e.clientX, y: e.clientY, th: orbit.th, el: orbit.el, moved: false }; }
  function onMove(e) {
    if (!drag) return false;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) < 6) return false;
    drag.moved = true; if (camMode !== "orbit") { camMode = "orbit"; kit.onCam && kit.onCam("orbit"); }
    orbit.th = drag.th - dx * 0.008; orbit.el = clamp(drag.el + dy * 0.004, 0.02, 1.1);
    return true;
  }
  function onUp() { const m = drag && drag.moved; drag = null; return m; }
  colors();
  return {
    canvas, render, resize, colors: () => { colors(); if (lastFr) render(lastFr); },
    setCam: m => { camMode = m; if (lastFr) render(lastFr); }, cam: () => camMode,
    onDown, onMove, onUp, renders: () => renders,
    show: on => { canvas.style.display = on ? "block" : "none"; }
  };
}
