/* The Skate Lab in 3D (AOG-SKATE-3D-V1, 2026-10-12; AOG-SKATE-3D-V2 the same day)
   Jimmy: "three.js 3d engine and keep on keeeping on. Remember we are the 1%." Then: "I want more realism, not sharp
   straight lines. do 1-3. Hit the ceiling with 1-3 quantum level of amazement!"
   A real-time 3D skatepark and a skater, driven by the same numbers as the drawings in aog-skate.js:
     · the trick book's demos (each frame: where the board is, how it is tipped, flipped and spun, where the feet are),
     · the Ramp, Ollie and Grinds rooms' own runs (simRamp, simOllie, simGrind), with the energy bars, the force arrows,
       the height marks and the friction streak standing in the scene (AOG-SKATE-3D-ROOMS-V1),
     · free skate (AOG-SKATE-FREE-V1): the rider someone drives around a small park.
   The park has no sharp straight lines: rounded ledges and benches, a ramp with steel coping, lathe-turned lamp posts,
   trees made of soft clustered leaves, a chain-link fence; soft image-based light (PMREM of a room), a sun with soft
   shadows, ACES tone mapping. The skater is the site's own figure (aog-figure3d.js) when it is there.
   It draws only when asked: a step of a run, a ride that is moving, a drag of the camera, a resize. Nothing moves on
   its own. Loaded only when someone picks 3D (import() from aog-skate.js); dispose() lets go of everything.
   World: x along the run, y up, z toward the viewer (meters). The rider's toes point toward +z on a board facing +x. */
import * as THREE from "/vendor/three-0.160.0/three.module.min.js";
import { RoundedBoxGeometry } from "/vendor/three-0.160.0/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "/vendor/three-0.160.0/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "/vendor/three-0.160.0/addons/utils/BufferGeometryUtils.js";

const DEG = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

export async function create(kit) {
  // kit: { host, before, colors(), BOARD, deckMid(x), L(en, es), path(), at(s), atPath(path, s), demoPath(), SHAPES, FPARK, fRamp(), WHEELS, dark(), onCam(k) }
  const B = kit.BOARD, L = kit.L || ((en) => en);
  const phone = Math.min(window.innerWidth, window.innerHeight) < 600;
  const SEG = phone ? 16 : 28;
  /* the figure (aog-figure3d.js) and the stage helper (aog-3dkit.js) come from the engine build; until they are there,
     the park keeps its own light and its own jointed rider */
  let FIG = null;
  try { FIG = await import("/aog-figure3d.js"); if (!FIG || !FIG.makeFigure) FIG = null; } catch (e) { FIG = null; }

  const canvas = document.createElement("canvas");
  canvas.className = "gl"; canvas.setAttribute("aria-hidden", "true");
  kit.host.insertBefore(canvas, kit.before);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, 260);
  const disposables = [];   // textures and render targets made here
  const track = t => (disposables.push(t), t);

  /* soft image-based light: a room's light, blurred (PMREM), so every curve picks up soft highlights */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment(renderer);
  const envRT = pmrem.fromScene(roomEnv, 0.04); track(envRT);
  scene.environment = envRT.texture;
  roomEnv.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  pmrem.dispose();

  /* ── materials: every color comes from the page's tokens, so light and dark both work ── */
  const M = {};
  const mat = (k, o) => (M[k] = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o || {})));
  ["hood", "hoodDk", "cargo", "cargoDk", "shoe", "sole", "skin", "helmet", "hair", "sticker", "grip", "truck", "wheel", "core", "bush",
   "ground", "ramp", "rampSide", "deckTop", "coping", "curb", "metal", "wax", "paint", "concrete", "grass", "prop", "propDk", "lamp", "trunk", "far", "bench", "pole",
   "pe", "ke", "heat", "pump", "force", "good", "friction", "path", "ink", "glass", "mark"].forEach(k => mat(k));
  M.leaf = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
  M.truck.metalness = 0.85; M.truck.roughness = 0.32; M.coping.metalness = 0.9; M.coping.roughness = 0.28; M.metal.metalness = 0.8; M.metal.roughness = 0.38;
  M.pole.metalness = 0.6; M.pole.roughness = 0.45;
  M.wheel.roughness = 0.5; M.helmet.roughness = 0.35; M.sole.roughness = 0.7; M.grip.roughness = 1; M.wax.roughness = 0.22; M.paint.roughness = 0.55;
  M.glass.transparent = true; M.glass.opacity = 0.22; M.glass.roughness = 0.08; M.glass.depthWrite = false;
  ["pe", "ke", "heat", "pump", "force", "good", "friction"].forEach(k => { M[k].roughness = 0.4; M[k].emissiveIntensity = 0.25; });
  M.lamp.emissiveIntensity = 1;

  /* ── textures drawn once on small canvases ── */
  let rng = 7; const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647;
  function canvasTex(w, h, draw, rep, color) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); if (color !== false) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return track(t);
  }
  function speckle(g, w, h, n, a, dark) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${dark ? "0,0,0" : "255,255,255"},${rand() * a})`; const s = 0.6 + rand() * 1.8; g.fillRect(rand() * w, rand() * h, s, s); } }
  // poured concrete: a 1.5 m slab with soft joints, aggregate, trowel marks and a few stains
  const concreteTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#c4c2bd"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) { const x = rand() * w, y = rand() * h, r = 30 + rand() * 120; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rand() < .5 ? "0,0,0" : "255,255,255"},0.06)`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 26; i++) { g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 6 + rand() * 10; g.beginPath(); const y = rand() * h; g.arc(rand() * w, y + 200, 200 + rand() * 80, Math.PI * 1.2, Math.PI * 1.6); g.stroke(); }
    speckle(g, w, h, 9000, 0.22, true); speckle(g, w, h, 6000, 0.28, false);
    const jg = g.createLinearGradient(0, 0, 0, 6); jg.addColorStop(0, "rgba(0,0,0,0.3)"); jg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = jg; g.fillRect(0, 0, w, 6);
    const jg2 = g.createLinearGradient(0, 0, 6, 0); jg2.addColorStop(0, "rgba(0,0,0,0.3)"); jg2.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = jg2; g.fillRect(0, 0, 6, h);
    g.strokeStyle = "rgba(0,0,0,0.16)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(w * 0.62, h * 0.2); g.quadraticCurveTo(w * 0.72, h * 0.33, w * 0.66, h * 0.48); g.stroke();
  }, [80, 80]);
  const concreteRough = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#d8d8d8"; g.fillRect(0, 0, w, h); speckle(g, w, h, 5000, 0.35, true); speckle(g, w, h, 2500, 0.4, false); }, [80, 80], false);
  const gripTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#6a6a6a"; g.fillRect(0, 0, w, h); speckle(g, w, h, 12000, 0.55, true); speckle(g, w, h, 5000, 0.35, false); }, [6, 1]);
  const plyTex = canvasTex(8, 64, (g, w, h) => { const c = ["#e8c99a", "#b8743f", "#e2bf8d", "#3a6fb0", "#e8c99a", "#c0601a", "#e2bf8d"]; c.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * h / 7, w, h / 7 + 1); }); });
  const bottomTex = canvasTex(512, 128, (g, w, h) => {   // the graphic under the deck: bold stripes and a plain circle (no logos)
    g.fillStyle = "#f2eee4"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#c0601a"; g.fillRect(w * 0.18, 0, w * 0.1, h); g.fillStyle = "#2e6fb0"; g.fillRect(w * 0.3, 0, w * 0.05, h);
    g.fillStyle = "#1f2430"; g.beginPath(); g.arc(w * 0.6, h / 2, h * 0.32, 0, 7); g.fill(); g.fillStyle = "#f2eee4"; g.beginPath(); g.arc(w * 0.6, h / 2, h * 0.16, 0, 7); g.fill();
    g.fillStyle = "#1f2430"; g.fillRect(w * 0.76, 0, w * 0.04, h);
  });
  const grassTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#6f9a55"; g.fillRect(0, 0, w, h); for (let i = 0; i < 4200; i++) { g.strokeStyle = `rgba(${rand() < .5 ? "40,80,30" : "160,200,120"},${0.25 + rand() * 0.4})`; g.lineWidth = 1; const x = rand() * w, y = rand() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + rand() * 2 - 1, y - 2, x + rand() * 4 - 2, y - 4 - rand() * 5); g.stroke(); } }, [24, 24]);
  const plywoodTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#cdb68c"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(120,85,45,${0.05 + rand() * 0.09})`; g.lineWidth = 1 + rand() * 2; g.beginPath(); const y = rand() * h; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + rand() * 16 - 8, w * .6, y + rand() * 16 - 8, w, y + rand() * 8 - 4); g.stroke(); }
    for (let i = 0; i < 5; i++) { const x = rand() * w, y = rand() * h; const gr = g.createRadialGradient(x, y, 0, x, y, 9); gr.addColorStop(0, "rgba(90,60,30,0.35)"); gr.addColorStop(1, "rgba(90,60,30,0)"); g.fillStyle = gr; g.fillRect(x - 9, y - 9, 18, 18); }
    g.fillStyle = "rgba(0,0,0,0.2)"; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
    g.fillStyle = "rgba(60,60,60,0.45)"; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(12 + i * (w - 24) / 3, 12 + j * (h - 24) / 3, 2.2, 0, 7); g.fill(); }   // screws
  }, [1, 1]);
  const linkTex = canvasTex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w / 2, 0); g.lineTo(w, h / 2); g.lineTo(w / 2, h); g.closePath(); g.stroke(); }, [120, 9]);
  const windowTex = canvasTex(128, 256, (g, w, h) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); for (let y = 10; y < h - 8; y += 18) for (let x = 8; x < w - 8; x += 16) { g.fillStyle = `rgba(40,55,70,${0.25 + rand() * 0.25})`; g.fillRect(x, y, 9, 11); } }, [1, 1]);
  M.ground.map = concreteTex; M.ground.roughnessMap = concreteRough; M.grip.map = gripTex; M.ramp.map = plywoodTex; M.deckTop.map = plywoodTex; M.grass.map = grassTex; M.far.map = windowTex;
  const concreteSmall = track(concreteTex.clone()); concreteSmall.repeat.set(1, 1); concreteSmall.needsUpdate = true;   // for rounded props (their UVs run 0–1 per face)
  const concreteM = track(concreteTex.clone()); concreteM.repeat.set(0.6, 0.6); concreteM.needsUpdate = true;          // for extruded shapes (their UVs are meters)
  M.concrete.map = concreteSmall; M.curb.map = concreteSmall; M.prop.map = concreteSmall;
  const hillMat = new THREE.MeshStandardMaterial({ map: concreteM, roughness: 0.9 });
  const woodEdge = new THREE.MeshStandardMaterial({ map: plyTex, roughness: 0.7 });
  const deckBottom = new THREE.MeshStandardMaterial({ map: bottomTex, roughness: 0.55 });
  const linkMat = new THREE.MeshStandardMaterial({ map: linkTex, alphaMap: linkTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, color: "#9aa3ad", metalness: 0.6, roughness: 0.5 });
  const ghostMat = new THREE.MeshStandardMaterial({ color: "#888", transparent: true, opacity: 0.2, depthWrite: false });
  const allMats = () => Object.values(M).concat([woodEdge, deckBottom, linkMat, ghostMat, hillMat]);

  /* the sky: a soft gradient dome (day: pale blue to warm haze; night: deep blue) */
  const skyU = { top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, bot: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float y = vP.y; vec3 c = y > 0.0 ? mix(mid, top, pow(clamp(y * 1.6, 0.0, 1.0), 0.7)) : mix(mid, bot, clamp(-y * 6.0, 0.0, 1.0)); gl_FragColor = vec4(c, 1.0); }"
  }));
  sky.renderOrder = -1; scene.add(sky);

  /* ── lights: the sun (soft shadows), a little sky fill, and park lamps that light up at night ── */
  const hemi = new THREE.HemisphereLight("#ffffff", "#b9a98f", 0.35); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff4e2", 2.4); sun.castShadow = true;
  sun.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -3, near: 0.5, far: 40 }); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.025;
  scene.add(sun); scene.add(sun.target);
  const lampLights = [];

  function colors() {
    const C = kit.colors(), dark = kit.dark();
    const set = (k, c, sh) => { const col = new THREE.Color(c || "#888"); if (sh) col.offsetHSL(0, 0, sh); M[k].color.copy(col); };
    set("hood", C.hood); set("hoodDk", C.hood, -0.05); set("cargo", C.cargo); set("cargoDk", C.cargo, -0.06); set("shoe", C.shoe); set("sole", C.sole);
    set("skin", C.skin); set("helmet", C.helmet); set("hair", C.hair); set("sticker", C.ke); M.grip.color.setRGB(0.16, 0.16, 0.17);
    set("truck", C.truck); set("wheel", C.wheel); set("core", C.ke); set("bush", C.ke, 0.1);
    set("ground", dark ? "#8a8f98" : "#f2eee6"); set("ramp", dark ? "#b8a888" : "#f6ead2"); set("deckTop", dark ? "#a89878" : "#e9dcc0"); set("rampSide", dark ? "#4f5866" : "#6d7f8e");
    set("coping", "#d4d9e0"); set("curb", dark ? "#a3a199" : "#e2ddd2"); set("concrete", dark ? "#9a9890" : "#d9d4c8"); set("metal", "#a9b2bc"); set("wax", dark ? "#c9c2b5" : "#ece6da"); set("paint", C.pe, dark ? -0.05 : 0.1);
    set("grass", dark ? "#8fa07f" : "#e6eedc"); set("prop", dark ? "#7a7f88" : "#d7d0c3"); set("propDk", dark ? "#565a62" : "#a39b8c"); set("bench", dark ? "#8a6a4a" : "#a77a4e"); set("pole", dark ? "#4a5059" : "#59626d");
    set("trunk", dark ? "#5a4636" : "#6b5340"); set("far", dark ? "#3c4252" : "#d3d8dc");
    ["pe", "ke", "heat", "pump", "force", "good", "friction", "path"].forEach(k => { set(k, C[k] || C.steel); M[k].emissive = M[k].color.clone(); });
    set("ink", C.ink); set("mark", C.ink); set("glass", dark ? "#cfe3ff" : "#ffffff");
    M.lamp.color.set(dark ? "#fff1c9" : "#f4f4f4"); M.lamp.emissive = new THREE.Color(dark ? "#ffd98a" : "#000000");
    const hz = new THREE.Color(dark ? "#1c2433" : "#e4ecf0");
    skyU.top.value.set(dark ? "#0b1220" : "#8fb8d8"); skyU.mid.value.copy(hz); skyU.bot.value.set(dark ? "#141a24" : "#d9d6cc");
    scene.background = hz; scene.fog = new THREE.Fog(hz, dark ? 16 : 30, dark ? 70 : 125);
    hemi.color.set(dark ? "#6f7f9f" : "#ffffff"); hemi.groundColor.set(dark ? "#2a2620" : "#b9a98f"); hemi.intensity = dark ? 0.55 : 0.35;
    sun.color.set(dark ? "#9fb0e0" : "#fff2dc"); sun.intensity = dark ? 0.75 : 2.6;
    lampLights.forEach(l => l.intensity = dark ? 30 : 0);
    allMats().forEach(m => { if ("envMapIntensity" in m) m.envMapIntensity = dark ? 0.32 : 0.75; });
    M.leaf.envMapIntensity = dark ? 0.2 : 0.45;
    renderer.toneMappingExposure = dark ? 1.18 : 1.0;
    if (rider && rider.colors) rider.colors(C);
    labels.forEach(l => l.redraw && l.redraw());
  }

  /* ── shape helpers: rounded boxes, lathe-turned posts, smooth tubes ── */
  const shadowed = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  const rbox = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, phone ? 2 : 4, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
  function mesh(geo, m, x, y, z, parent) { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = o.receiveShadow = true; if (parent) parent.add(o); return o; }
  function tube(points, r, m, parent, closed) {   // a smooth bent tube through the points (rails, legs, arms of lamps)
    const curve = new THREE.CatmullRomCurve3(points.map(p => V(p[0], p[1], p[2])), !!closed, "centripetal", 0.2);
    const o = mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 16), r, phone ? 8 : 14, !!closed), m, 0, 0, 0, parent);
    return o;
  }
  function roundedPolyline(pts, rad) {   // straight runs with rounded corners, for railings and flat bars
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = V(...pts[i]);
      if (i === 0 || i === pts.length - 1) { out.push(p); continue; }
      const a = V(...pts[i - 1]), c = V(...pts[i + 1]);
      const da = a.clone().sub(p).normalize(), dc = c.clone().sub(p).normalize();
      const p0 = p.clone().addScaledVector(da, rad), p1 = p.clone().addScaledVector(dc, rad);
      for (let k = 0; k <= 6; k++) { const u = k / 6; out.push(p0.clone().multiplyScalar((1 - u) * (1 - u)).addScaledVector(p, 2 * u * (1 - u)).addScaledVector(p1, u * u)); }
    }
    return out;
  }
  function pipe(pts, r, m, parent, rad) {   // a bent pipe: straight between rounded corners
    const path = new THREE.CurvePath(), q = roundedPolyline(pts, rad || 0.06);
    for (let i = 0; i < q.length - 1; i++) path.add(new THREE.LineCurve3(q[i], q[i + 1]));
    const o = mesh(new THREE.TubeGeometry(path, q.length * 2, r, phone ? 8 : 12, false), m, 0, 0, 0, parent);
    [q[0], q[q.length - 1]].forEach(p => mesh(new THREE.SphereGeometry(r, 10, 8), m, p.x, p.y, p.z, parent));
    return o;
  }
  function lathePost(h, r0, r1, m, parent, x, z) {   // a post turned on a lathe: a flared foot, a slim shaft, a rounded top
    const pts = [V(0, 0, 0), V(r0 * 2.2, 0, 0), V(r0 * 2.0, 0.03, 0), V(r0 * 1.15, 0.08, 0), V(r0, 0.14, 0), V(r1, h - 0.03, 0), V(r1 * 0.7, h - 0.005, 0), V(0, h, 0)].map(v => new THREE.Vector2(v.x, v.y));
    return mesh(new THREE.LatheGeometry(pts, phone ? 12 : 20), m, x, 0, z, parent);
  }
  /* soft leaves: a few displaced spheres clustered into one crown, darker underneath (vertex colors) */
  const crownGeos = [];
  function crownGeo(seed) {
    if (crownGeos[seed]) return crownGeos[seed];
    let r2 = 1000 + seed * 77; const rr = () => (r2 = (r2 * 16807) % 2147483647) / 2147483647;
    const parts = [], N = 7;
    for (let i = 0; i < N; i++) {
      const g = new THREE.SphereGeometry(0.55 + rr() * 0.4, phone ? 14 : 22, phone ? 10 : 16), a = i / N * Math.PI * 2 + rr();
      const p = g.attributes.position, ph = rr() * 10;
      for (let k = 0; k < p.count; k++) {
        const x = p.getX(k), y = p.getY(k), z = p.getZ(k), l = Math.hypot(x, y, z);
        const n = 1 + 0.13 * Math.sin(x * 7 + ph) * Math.sin(y * 6.3 + ph * 1.3) * Math.sin(z * 7.7) + 0.06 * Math.sin(x * 17 + y * 13 + z * 11 + ph);
        p.setXYZ(k, x * n, y * n * 0.86, z * n);
      }
      const rad = i === 0 ? 0 : 0.65 + rr() * 0.25;
      g.translate(Math.cos(a) * rad, (i === 0 ? 0.5 : rr() * 0.6), Math.sin(a) * rad);
      parts.push(g);
    }
    const top = new THREE.SphereGeometry(0.7, phone ? 14 : 22, phone ? 10 : 16); top.translate(0, 1.0, 0); parts.push(top);
    parts.forEach(g => g.deleteAttribute("uv"));
    const m = mergeGeometries(parts); parts.forEach(g => g.dispose());
    m.computeVertexNormals();
    const p = m.attributes.position, col = new Float32Array(p.count * 3), base = new THREE.Color("#5f8d4e"), lo = new THREE.Color("#2f4a2a"), hi = new THREE.Color("#8fb86a"), c = new THREE.Color();
    for (let k = 0; k < p.count; k++) { const y = p.getY(k); const u = clamp((y + 0.6) / 2.1, 0, 1); c.copy(lo).lerp(base, Math.min(1, u * 1.6)).lerp(hi, Math.max(0, u - 0.62) * 1.4); const j = 0.9 + 0.2 * Math.sin(k * 12.9898); c.multiplyScalar(j); col.set([c.r, c.g, c.b], k * 3); }
    m.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return (crownGeos[seed] = m);
  }
  function tree(x, z, s, seed, parent) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = seed * 1.7;
    const trunk = new THREE.LatheGeometry([[0, 0], [0.26, 0], [0.2, 0.08], [0.15, 0.4], [0.12, 1.6], [0.09, 2.3], [0, 2.4]].map(p => new THREE.Vector2(p[0], p[1])), phone ? 10 : 16);
    mesh(trunk, M.trunk, 0, 0, 0, g);
    tube([[0, 1.5, 0], [0.35, 1.95, 0.1], [0.6, 2.3, 0.2]], 0.05, M.trunk, g);
    tube([[0, 1.7, 0], [-0.3, 2.1, -0.15], [-0.55, 2.45, -0.2]], 0.045, M.trunk, g);
    const cr = mesh(crownGeo(seed % 3), M.leaf, 0, 2.55, 0, g); cr.scale.set(1.35, 1.25, 1.35);
    parent.add(g); return g;
  }

  /* ── the board: a deck bent into its kicks with a little concave, grip on top, plies on the edge, a graphic below ── */
  function deckGeometry() {
    const Lh = B.half, hw = 0.105, t = B.thick, NX = 80, NZ = 12;
    const width = x => { const ax = Math.abs(x), r = Lh - hw; return ax <= r ? hw : Math.sqrt(Math.max(0, hw * hw - (ax - r) * (ax - r))); };
    const yAt = (x, z, top) => kit.deckMid(x) - B.deckY + (top ? t / 2 : -t / 2) + 0.0035 * Math.pow(z / hw, 2) * (Math.abs(x) < 0.3 ? 1 : 0.4);
    const pos = [], uv = [], idx = [];
    const grid = (top) => {
      const base = pos.length / 3;
      for (let i = 0; i <= NX; i++) { const x = -Lh + 2 * Lh * i / NX, w = Math.max(width(x), 0.0005);
        for (let j = 0; j <= NZ; j++) { const z = -w + 2 * w * j / NZ; pos.push(x, yAt(x, z, top), z); uv.push(i / NX, j / NZ); } }
      const start = idx.length;
      for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { const a = base + i * (NZ + 1) + j, b = a + NZ + 1;
        if (top) idx.push(a, a + 1, b, a + 1, b + 1, b); else idx.push(a, b, a + 1, a + 1, b, b + 1); }
      return [start, idx.length - start];
    };
    const g1 = grid(true), g2 = grid(false);
    const base = pos.length / 3, ring = [];
    for (let i = 0; i <= NX; i++) { const x = -Lh + 2 * Lh * i / NX; ring.push([x, -Math.max(width(x), 0.0005)]); }
    for (let i = NX; i >= 0; i--) { const x = -Lh + 2 * Lh * i / NX; ring.push([x, Math.max(width(x), 0.0005)]); }
    ring.forEach(([x, z], k) => { pos.push(x, yAt(x, z, true), z, x, yAt(x, z, false), z); uv.push(k / ring.length, 0, k / ring.length, 1); });
    const s3 = idx.length;
    for (let k = 0; k < ring.length - 1; k++) { const a = base + 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    geo.addGroup(g1[0], g1[1], 0); geo.addGroup(g2[0], g2[1], 1); geo.addGroup(s3, idx.length - s3, 2);
    geo.computeVertexNormals();
    return geo;
  }
  function wheelGeometry() {   // a urethane wheel turned on a lathe: rounded lip, a slightly crowned riding surface
    const r = B.wheelR, w = 0.032, pts = [];
    pts.push(new THREE.Vector2(0.008, -w / 2));
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + Math.PI / 2 * i / 8; pts.push(new THREE.Vector2(r - 0.007 + Math.cos(a) * 0.007, -w / 2 + 0.007 + Math.sin(a) * 0.007)); }
    for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 * i / 8; pts.push(new THREE.Vector2(r - 0.007 + Math.cos(a) * 0.007, w / 2 - 0.007 + Math.sin(a) * 0.007)); }
    pts.push(new THREE.Vector2(0.008, w / 2));
    const g = new THREE.LatheGeometry(pts, 32); g.rotateX(Math.PI / 2); return g;   // the axle along z
  }
  const deckGeo = deckGeometry();
  function makeBoard() {
    const g = new THREE.Group();
    const deck = new THREE.Mesh(deckGeo, [M.grip, deckBottom, woodEdge]); deck.position.y = B.deckY; g.add(deck);
    const wheels = [];
    [-B.axle, B.axle].forEach(x => {
      const top = kit.deckMid(x) - B.thick / 2, inward = x < 0 ? 1 : -1;
      mesh(rbox(0.075, 0.012, 0.058, 0.004), M.truck, x, top - 0.006, 0, g);                                         // baseplate
      const bush = mesh(new THREE.CylinderGeometry(0.0125, 0.0135, 0.018, 16), M.bush, x + inward * 0.009, top - 0.02, 0, g); bush.rotation.z = inward * 0.5;
      mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.04, 8), M.truck, x + inward * 0.012, top - 0.02, 0, g).rotation.z = inward * 0.5;   // kingpin
      const hanger = mesh(new THREE.CapsuleGeometry(0.0115, 0.12, 6, 14), M.truck, x, B.wheelR + 0.007, 0, g); hanger.rotation.x = Math.PI / 2; hanger.scale.set(1.25, 1, 0.9);
      const pivot = mesh(new THREE.CapsuleGeometry(0.009, 0.03, 4, 10), M.truck, x + inward * 0.006, (top + B.wheelR) / 2, 0, g); pivot.rotation.z = inward * 0.6;
      const axle = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.205, 10), M.truck, x, B.wheelR, 0, g); axle.rotation.x = Math.PI / 2;
      [-1, 1].forEach(s => {
        const wg = new THREE.Group(); wg.position.set(x, B.wheelR, s * 0.088);
        mesh(wheelGeometry(), M.wheel, 0, 0, 0, wg);
        const core = mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.0335, 12), M.core, 0, 0, 0, wg); core.rotation.x = Math.PI / 2;
        mesh(new THREE.BoxGeometry(0.004, 0.02, 0.034), M.sole, 0.008, 0, 0, wg);   // a mark on the core, so the turning shows
        g.add(wg); wheels.push(wg);
      });
    });
    g.userData.wheels = wheels;
    return shadowed(g);
  }

  /* ── the skater ── */
  const labels = [];
  let rider = null;
  if (FIG) {
    try { rider = figureRider(); } catch (e) { console.warn("figure:", e); rider = null; }
  }
  if (!rider) rider = tubeRider();

  /* the site's figure (aog-figure3d.js): the hips placed where the trick puts them, the body turned by the trick's
     turn, each foot reached to its spot on the deck by ik.leg (the knee pointing over the toes and a little toward the
     nose, the sole flat on the grip), the arms by angles (the front arm leads, the back arm trails, both rise in the
     air), a twist through the shoulders toward the nose, and the head looking where the board goes. */
  function figColors(C) {
    const top = new THREE.Color(C.hood || "#3c6e8f"), trim = top.clone().offsetHSL(0, 0, -0.06);
    return { top: "#" + top.getHexString(), trim: "#" + trim.getHexString(), pants: C.cargo, shoe: C.shoe, sole: C.sole, laces: C.sole, skin: C.skin, helmet: C.helmet, hair: C.hair, strings: C.sole, strap: C.shoe };
  }
  function figureRider() {
    const fig = FIG.makeFigure({ outfit: "skate", quality: phone ? "phone" : "full", colors: figColors(kit.colors()) });
    fig.root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const ANK = 0.08, PELVIS = 0.97;   // the ankle above the sole, the pelvis above the floor (the figure's own measures)
    let targets = null;
    const api = { root: fig.root, fig,
      colors: C => fig.setColors(figColors(C)),
      pose(o, parent) {
        // o, in the parent's frame (the board's surface frame): fF, fB (the soles on the deck or the ground), upF, upB,
        // fwdF, fwdB (the deck's up and the toes' way, in the world), hip (the pelvis), lean, turn, nose, arms, lift
        const tq = o.turn, left = V(Math.cos(tq), 0, -Math.sin(tq)), F = V(Math.sin(tq), 0, Math.cos(tq));
        const ns = Math.sign(left.x * o.nose) || 1;                                   // +1: the nose is on the figure's left
        const lead = ns > 0 ? "L" : "R", trail = ns > 0 ? "R" : "L", sg = s => s === "L" ? 1 : -1;
        const a = o.arms == null ? 1 : o.arms, lift = clamp(o.lift || 0, 0, 1.2), lean = (o.lean || 0) / DEG;
        const crouch = clamp((o.fF.y + o.fB.y) / 2 + PELVIS - o.hip.y, 0, 0.5) / 0.5;
        const p = { root: { pos: [o.hip.x, o.hip.y - PELVIS, o.hip.z], rot: [0, tq / DEG, 0] }, j: {} };
        p.j.spine = [8 + 18 * crouch, ns * 8, -ns * lean * 0.45];
        p.j.chest = [4 + 10 * crouch, ns * 12, -ns * lean * 0.35];
        p.j["clav" + lead] = [0, 0, sg(lead) * (4 + 6 * lift)]; p.j["clav" + trail] = [0, 0, sg(trail) * (3 + 6 * lift)];
        p.j["shoulder" + lead] = [-22 - 12 * lift, sg(lead) * -10, sg(lead) * Math.min(112, 34 + 26 * a + 44 * lift)];
        p.j["elbow" + lead] = [-(24 + 16 * a + 14 * lift), 0, 0];
        p.j["shoulder" + trail] = [14 - 10 * lift, sg(trail) * 12, sg(trail) * Math.min(118, 28 + 30 * a + 52 * lift)];
        p.j["elbow" + trail] = [-(18 + 14 * a + 12 * lift), 0, 0];
        p.j["wrist" + lead] = [0, 0, sg(lead) * 10]; p.j["wrist" + trail] = [0, 0, sg(trail) * 14];
        p.grip = { L: 0.25, R: 0.25 };
        fig.setPose(p);
        parent.updateMatrixWorld(true); fig.root.updateMatrixWorld(true);
        // which leg takes which sole: the one on the nose's side takes the front foot
        const pairs = [[lead, o.fF, o.upF, o.fwdF], [trail, o.fB, o.upB, o.fwdB]];
        targets = [];
        pairs.forEach(([side, sole, up, fwd]) => {
          const soleW = parent.localToWorld(sole.clone()), ank = soleW.clone().addScaledVector(up, ANK);
          const hipW = fig.world("hip" + side);
          const pole = hipW.clone().lerp(ank, 0.5).addScaledVector(fwd, 0.9).add(parent.localToWorld(V(0, 0, 0)).sub(parent.localToWorld(V(-o.nose * 0.25, 0, 0))));
          fig.ik.leg(side, ank, pole, { up, forward: fwd });
          targets.push([side, ank]);
        });
        // the head looks along the board toward the nose, a little down at the ground ahead
        const noseW = parent.localToWorld(V(o.nose * 3.2, 0, 0.8)).add(V(0, -0.2, 0));
        fig.lookAt(noseW, 0.9);
        fig.update();
      },
      feetError() { return targets ? targets.map(([side, ank]) => fig.world("ankle" + side).distanceTo(ank)) : [0, 0]; },
      dispose: () => fig.dispose()
    };
    return api;
  }
  /* the jointed rider (kept while the figure is not there): smooth tapered limbs placed joint to joint */
  function tubeRider() {
    const R = new THREE.Group(), P = {};
    const limbGeo = (r0, r1) => { const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8, bulge = Math.sin(u * Math.PI) * 0.12; pts.push(new THREE.Vector2(lerp(r0, r1, u) * (1 + bulge), u)); } pts.unshift(new THREE.Vector2(0, 0)); pts.push(new THREE.Vector2(0, 1)); return new THREE.LatheGeometry(pts, SEG); };
    const lm = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; R.add(o); return o; };
    const sph = (r, m) => lm(new THREE.SphereGeometry(r, SEG, Math.round(SEG * 0.7)), m);
    P.thighF = lm(limbGeo(0.085, 0.07), M.cargo); P.thighB = lm(limbGeo(0.085, 0.07), M.cargoDk);
    P.shinF = lm(limbGeo(0.068, 0.08), M.cargo); P.shinB = lm(limbGeo(0.068, 0.08), M.cargoDk);
    P.kneeF = sph(0.07, M.cargo); P.kneeB = sph(0.07, M.cargoDk);
    P.pelvis = lm(new THREE.CapsuleGeometry(0.1, 0.12, 8, SEG), M.cargoDk);
    P.torso = lm(new THREE.CapsuleGeometry(0.15, 0.26, 10, SEG), M.hood);
    P.hem = lm(new THREE.TorusGeometry(0.17, 0.035, 10, SEG), M.hoodDk);
    P.hood = sph(0.1, M.hoodDk);
    P.strL = lm(limbGeo(0.006, 0.006), M.sole); P.strR = lm(limbGeo(0.006, 0.006), M.sole);
    P.neck = lm(limbGeo(0.045, 0.042), M.skin);
    P.head = sph(0.1, M.skin);
    P.earL = sph(0.02, M.skin); P.earR = sph(0.02, M.skin);
    P.hair = sph(0.1, M.hair);
    P.helmet = lm(new THREE.SphereGeometry(0.122, SEG, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), M.helmet);
    P.stripe = lm(new THREE.SphereGeometry(0.1235, SEG, 3, 0, Math.PI * 2, Math.PI * 0.27, Math.PI * 0.06), M.sole);
    ["F", "B"].forEach(s => {
      const cm = s === "F" ? M.hood : M.hoodDk;
      P["sh" + s] = sph(0.068, cm); P["upper" + s] = lm(limbGeo(0.062, 0.052), cm); P["elbow" + s] = sph(0.052, cm);
      P["fore" + s] = lm(limbGeo(0.05, 0.046), cm); P["cuff" + s] = lm(new THREE.TorusGeometry(0.042, 0.012, 8, 16), M.hoodDk);
      P["hand" + s] = sph(0.042, M.skin);
      const sh = new THREE.Group(); const up = new THREE.Mesh(rbox(0.25, 0.08, 0.1, 0.035), M.shoe); up.position.set(0.0, 0.055, 0); sh.add(up);
      const so = new THREE.Mesh(rbox(0.28, 0.026, 0.108, 0.01), M.sole); so.position.set(0.005, 0.013, 0); sh.add(so); R.add(sh); P["shoe" + s] = sh;
      P["cuffL" + s] = lm(new THREE.CylinderGeometry(0.088, 0.078, 0.05, SEG), s === "F" ? M.cargo : M.cargoDk);
    });
    R.traverse(m => { if (m.isMesh) m.castShadow = true; });
    const place = (o, a, b) => { const d = new THREE.Vector3().subVectors(b, a), Ln = d.length(); o.position.copy(a); o.quaternion.setFromUnitVectors(UP, d.normalize()); o.scale.set(1, Ln, 1); };
    const knee = (a, c, l, pole) => {
      const d = new THREE.Vector3().subVectors(c, a), D = Math.min(d.length(), 2 * l - 1e-4), dn = d.clone().normalize();
      const h = Math.sqrt(Math.max(0, l * l - D * D / 4));
      const p = pole.clone().sub(dn.clone().multiplyScalar(pole.dot(dn))).normalize();
      return a.clone().add(dn.multiplyScalar(D / 2)).add(p.multiplyScalar(h));
    };
    function pose(o) {
      const F = V(Math.sin(o.turn), 0, Math.cos(o.turn));
      const U = V(0, 1, 0).applyAxisAngle(F, -o.lean);
      const X = new THREE.Vector3().crossVectors(U, F).normalize();
      const n = Math.sign(X.x * o.nose) || 1, S = X.clone().multiplyScalar(n);
      const hip = o.hip;
      const hipF = hip.clone().addScaledVector(S, 0.085), hipB = hip.clone().addScaledVector(S, -0.085);
      const pole = F.clone().addScaledVector(S, 0.75).normalize();
      [["F", o.fF, hipF], ["B", o.fB, hipB]].forEach(([s, f, hj]) => {
        const ank = f.clone().add(V(0, 0.06, 0));
        const k = knee(hj, ank, 0.45, pole);
        place(P["thigh" + s], hj, k); place(P["shin" + s], k, ank); P["knee" + s].position.copy(k);
        P["cuffL" + s].position.copy(ank).add(V(0, 0.005, 0)); P["cuffL" + s].quaternion.setFromUnitVectors(UP, new THREE.Vector3().subVectors(k, ank).normalize());
        const sh = P["shoe" + s], fwd = F.clone().addScaledVector(S, s === "F" ? 0.38 : 0.1).setY(0).normalize();
        sh.position.copy(f); sh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(fwd, V(0, 1, 0), new THREE.Vector3().crossVectors(fwd, V(0, 1, 0))));
      });
      P.pelvis.position.copy(hip); P.pelvis.quaternion.setFromUnitVectors(UP, S);
      const basis = new THREE.Matrix4().makeBasis(X, U, F), q = new THREE.Quaternion().setFromRotationMatrix(basis);
      P.torso.position.copy(hip).addScaledVector(U, 0.27); P.torso.quaternion.copy(q); P.torso.scale.set(1.32, 1, 0.78);
      P.hem.position.copy(hip).addScaledVector(U, 0.03); P.hem.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2)); P.hem.scale.set(1.15, 0.72, 1);
      const neck = hip.clone().addScaledVector(U, 0.53);
      P.hood.position.copy(neck).addScaledVector(F, -0.07).addScaledVector(U, -0.02); P.hood.quaternion.copy(q); P.hood.scale.set(1.25, 0.75, 0.9);
      [["strL", -0.035], ["strR", 0.035]].forEach(([k, x]) => { const a = neck.clone().addScaledVector(X, x).addScaledVector(F, 0.1).addScaledVector(U, -0.04);
        const b = a.clone().addScaledVector(U, -0.13).addScaledVector(F, 0.03).addScaledVector(S, (o.str || 0) * 0.06); place(P[k], a, b); P[k].scale.x = P[k].scale.z = 1; });
      const look = F.clone().multiplyScalar(0.35).addScaledVector(S, 0.95).normalize();
      const headC = hip.clone().addScaledVector(U, 0.69).addScaledVector(F, 0.01);
      place(P.neck, neck.clone().addScaledVector(U, -0.02), headC);
      const hx = new THREE.Vector3().crossVectors(UP, look).normalize(), hq = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(hx, UP, look.clone()));
      P.head.position.copy(headC); P.head.quaternion.copy(hq); P.head.scale.set(0.92, 1.12, 1);
      P.earL.position.copy(headC).addScaledVector(hx, 0.093); P.earR.position.copy(headC).addScaledVector(hx, -0.093);
      P.hair.position.copy(headC).addScaledVector(look, -0.028).addScaledVector(UP, -0.005); P.hair.quaternion.copy(hq); P.hair.scale.set(0.9, 0.95, 0.82);
      const hc = headC.clone().addScaledVector(UP, 0.03).addScaledVector(look, -0.01);
      P.helmet.position.copy(hc); P.helmet.quaternion.copy(hq); P.helmet.scale.set(0.95, 1.05, 1.05);
      P.stripe.position.copy(hc); P.stripe.quaternion.copy(hq); P.stripe.scale.set(0.95, 1.05, 1.05);
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
        P["cuff" + s].position.copy(wrist); P["cuff" + s].quaternion.setFromUnitVectors(V(0, 0, 1), d2);
        P["hand" + s].position.copy(hand); P["hand" + s].scale.set(0.85, 1.1, 0.75); P["hand" + s].quaternion.setFromUnitVectors(UP, d2);
      });
      R.userData.soles = { F: o.fF.clone(), B: o.fB.clone() };
    }
    return { root: R, pose: o => pose(o), feetError: () => [0, 0] };
  }

  /* ── labels standing in the scene (canvas sprites; they follow the language and the theme) ── */
  function makeLabel(get, opts) {
    opts = opts || {};
    const c = document.createElement("canvas"), g = c.getContext("2d");
    const tex = track(new THREE.CanvasTexture(c)); tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, fog: false, sizeAttenuation: false }));
    sp.renderOrder = 5;
    let last = "";
    sp.redraw = () => {
      const C = kit.colors(), txt = get(), key = txt + kit.dark() + (opts.color || "");
      if (key === last) return; last = key;
      const fs = 44, pad = 16; g.font = `700 ${fs}px "Source Sans 3", ui-sans-serif, system-ui, sans-serif`;
      const w = Math.ceil(g.measureText(txt).width) + pad * 2, h = fs + pad * 1.4;
      c.width = w; c.height = h;
      g.font = `700 ${fs}px "Source Sans 3", ui-sans-serif, system-ui, sans-serif`;
      g.fillStyle = C.card || "#fff"; g.globalAlpha = 0.9; const r = h / 2.6;
      g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, h, r); g.arcTo(w, h, 0, h, r); g.arcTo(0, h, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.closePath(); g.fill();
      g.globalAlpha = 1; g.fillStyle = opts.color ? (C[opts.color] || opts.color) : (C.ink || "#111"); g.textBaseline = "middle"; g.fillText(txt, pad, h / 2 + 2);
      tex.needsUpdate = true;
      const H = (opts.h || 0.09) * (phone ? 0.42 : 0.36); sp.scale.set(H * w / h, H, 1);   // a steady size on the screen, whatever the distance
      sp.center.set(opts.cx != null ? opts.cx : 0.5, opts.cy != null ? opts.cy : 0.5);
    };
    sp.redraw(); labels.push(sp);
    return sp;
  }
  function makeArrow(m) {   // a smooth arrow: a round shaft and a cone, pointing along +y before it is aimed
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 14), m); shaft.geometry.translate(0, 0.5, 0); g.add(shaft);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 18), m); g.add(head);
    g.userData = { shaft, head };
    g.set = (from, dir, len) => {
      if (len < 0.02) { g.visible = false; return; } g.visible = true;
      g.position.copy(from); g.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
      const hl = Math.min(0.15, len * 0.45); shaft.scale.set(1, Math.max(0.001, len - hl), 1); head.scale.set(1, hl / 0.15, 1); head.position.y = len - hl / 2;
    };
    return g;
  }
  function dashedLine(m, n) {
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); geo.setDrawRange(0, 0);
    const mat2 = new THREE.LineDashedMaterial({ color: m.color, dashSize: 0.07, gapSize: 0.06, transparent: true, opacity: 0.7 });
    const line = new THREE.Line(geo, mat2); line.frustumCulled = false;
    line.set = (pts) => { const a = geo.attributes.position; const k = Math.min(n, pts.length); for (let i = 0; i < k; i++) a.setXYZ(i, pts[i][0], pts[i][1], pts[i][2] || 0); a.needsUpdate = true; geo.setDrawRange(0, k); if (k > 1) line.computeLineDistances(); line.material.color.copy(m.color); };
    return line;
  }

  /* ── the park ── */
  const world = new THREE.Group(); scene.add(world);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), M.ground); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  concreteTex.repeat.set(280, 280); concreteRough.repeat.set(280, 280);
  /* the set dressing behind the runs (it slides along in 9 m steps, so the scenery never runs out): a long rounded
     ledge, a flat bar, a bank, a bench, a lamp post, trees, a chain-link fence and the town far off in the haze */
  const dress = new THREE.Group(); world.add(dress);
  const ledgeGeo = rbox(3.2, 0.42, 0.55, 0.05), benchSeat = rbox(1.6, 0.05, 0.11, 0.02);
  for (let k = -3; k <= 4; k++) {
    const x0 = k * 9;
    mesh(ledgeGeo, M.prop, x0 + 1.5, 0.21, -3.4, dress);
    const ce = mesh(new THREE.CylinderGeometry(0.014, 0.014, 3.16, 10), M.metal, x0 + 1.5, 0.415, -3.13, dress); ce.rotation.z = Math.PI / 2;
    pipe([[x0 + 4.9, 0, -4.6], [x0 + 4.9, 0.33, -4.6], [x0 + 7.1, 0.33, -4.6], [x0 + 7.1, 0, -4.6]], 0.024, M.metal, dress, 0.05);
    // a bank: a rounded wedge
    const bs = new THREE.Shape(); bs.moveTo(-1.3, 0); bs.lineTo(1.0, 0); bs.lineTo(1.0, 0.5); bs.quadraticCurveTo(0.9, 0.56, 0.75, 0.5); bs.lineTo(-1.3, 0.02); bs.closePath();
    const bk = mesh(new THREE.ExtrudeGeometry(bs, { depth: 2.0, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3, curveSegments: 8 }), M.concrete, x0 + 4, 0, -8, dress);
    // a bench: rounded slats on a bent steel frame
    [0, 1, 2].forEach(i => mesh(benchSeat, M.bench, x0 + 0.5, 0.45, -6.35 + i * 0.13, dress));
    [x0 - 0.15, x0 + 1.15].forEach(x => pipe([[x, 0, -6.55], [x, 0.43, -6.45], [x, 0.43, -6.05], [x, 0, -5.95]], 0.018, M.pole, dress, 0.08));
    // a lamp post: turned on a lathe, a curved arm, a soft rounded head
    const px = x0 + 3;
    lathePost(4.2, 0.07, 0.045, M.pole, dress, px, -5.2);
    tube([[px, 4.1, -5.2], [px + 0.1, 4.35, -5.2], [px + 0.45, 4.4, -5.2], [px + 0.7, 4.28, -5.2]], 0.03, M.pole, dress);
    const head = mesh(new THREE.CapsuleGeometry(0.09, 0.26, 6, 16), M.lamp, px + 0.72, 4.18, -5.2, dress); head.rotation.z = Math.PI / 2; head.scale.set(1, 1, 0.7); head.castShadow = false;
    if (k >= -1 && k <= 1) { const l = new THREE.SpotLight("#ffd98a", 0, 18, 0.8, 0.7, 1.6); l.position.set(px + 0.72, 4.1, -5.2); l.target.position.set(px + 0.9, 0, -1); dress.add(l); dress.add(l.target); lampLights.push(l); }
    tree(x0 - 2, -11, 1.0 + (k & 1) * 0.15, (k + 9) % 3, dress); tree(x0 + 5.5, -13.5, 1.15, (k + 10) % 3, dress); if (k % 2 === 0) tree(x0 + 2.4, -16, 1.3, (k + 11) % 3, dress);
  }
  // the fence: turned posts, round rails and chain-link
  for (let x = -30; x <= 42; x += 2.5) lathePost(1.85, 0.03, 0.026, M.metal, dress, x, -9.4);
  [0.12, 1.82].forEach(y => { const r = mesh(new THREE.CylinderGeometry(0.022, 0.022, 72, 10), M.metal, 6, y, -9.4, dress); r.rotation.z = Math.PI / 2; });
  const link = mesh(new THREE.PlaneGeometry(72, 1.7), linkMat, 6, 0.97, -9.4, dress); link.castShadow = false;
  // the town far away
  const city = new THREE.Group(); world.add(city);
  for (let i = 0; i < 30; i++) { const h = 8 + rand() * 22, w = 5 + rand() * 9; const b = mesh(rbox(w, h, 5, 0.6), M.far, -90 + i * 6.5 + rand() * 2, h / 2, -95 - rand() * 20, city); b.castShadow = false; }
  for (let i = 0; i < 16; i++) tree(-60 + i * 8 + rand() * 3, 14 + rand() * 6, 1.2 + rand() * 0.4, i % 3, city);

  /* the free-skate park (AOG-SKATE-FREE-V1): the same places the ride's physics uses */
  let freePark = null;
  function buildFreePark() {
    const g = new THREE.Group(), FP = kit.FPARK, R = kit.fRamp(), Bd = FP.bounds;
    // grass around the slab, a rounded concrete border
    // (the shape is drawn with y = −z, then laid flat facing up)
    const ring = new THREE.Shape(); ring.moveTo(-60, -60); ring.lineTo(60, -60); ring.lineTo(60, 60); ring.lineTo(-60, 60); ring.closePath();
    const z0 = -Bd[3], z1 = -Bd[2], hole = new THREE.Path(), r = 0.8;
    hole.moveTo(Bd[0] + r, z0); hole.lineTo(Bd[1] - r, z0); hole.quadraticCurveTo(Bd[1], z0, Bd[1], z0 + r); hole.lineTo(Bd[1], z1 - r); hole.quadraticCurveTo(Bd[1], z1, Bd[1] - r, z1); hole.lineTo(Bd[0] + r, z1); hole.quadraticCurveTo(Bd[0], z1, Bd[0], z1 - r); hole.lineTo(Bd[0], z0 + r); hole.quadraticCurveTo(Bd[0], z0, Bd[0] + r, z0);
    ring.holes.push(hole);
    const grass = new THREE.Mesh(new THREE.ShapeGeometry(ring, 6), M.grass); grass.rotation.x = -Math.PI / 2; grass.position.y = 0.003; grass.receiveShadow = true; g.add(grass);
    grass.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v / 10; });
    const edge = new THREE.CurvePath(); const hp = hole.getPoints(6); for (let i = 0; i < hp.length; i++) { const a = hp[i], b = hp[(i + 1) % hp.length]; if (a.distanceTo(b) > 1e-4) edge.add(new THREE.LineCurve3(V(a.x, 0.03, -a.y), V(b.x, 0.03, -b.y))); }
    mesh(new THREE.TubeGeometry(edge, hp.length * 2, 0.07, 8, true), M.concrete, 0, 0, 0, g).scale.y = 0.6;
    // the mini ramp
    const ramp = rampMesh(kit.demoPath().pts, R.w2, R.deck, { rail: true }); ramp.position.set(R.x0, 0, R.z); g.add(ramp);
    // the ledge and the flat rail
    FP.obs.forEach(o => {
      if (o.id === "ledge") {
        mesh(rbox(o.x1 - o.x0, o.h, o.w, 0.03), M.prop, (o.x0 + o.x1) / 2, o.h / 2, o.z, g);
        [-1, 1].forEach(s => { const ir = mesh(new THREE.CylinderGeometry(0.012, 0.012, o.x1 - o.x0 - 0.04, 10), M.metal, (o.x0 + o.x1) / 2, o.h - 0.006, o.z + s * (o.w / 2 - 0.006), g); ir.rotation.z = Math.PI / 2; });
        const wx = mesh(rbox(o.x1 - o.x0 - 0.1, 0.004, o.w - 0.06, 0.002), M.wax, (o.x0 + o.x1) / 2, o.h + 0.001, o.z, g); wx.material = M.wax;
      } else {
        pipe([[o.x0, o.h, o.z], [o.x1, o.h, o.z]], 0.025, M.metal, g);
        [o.x0 + 0.2, o.x1 - 0.2].forEach(x => { mesh(new THREE.CylinderGeometry(0.022, 0.022, o.h, 12), M.metal, x, o.h / 2, o.z, g); mesh(rbox(0.16, 0.012, 0.1, 0.004), M.metal, x, 0.006, o.z, g); });
      }
    });
    // around the edge: benches, lamps and trees
    [[-12, 4.6], [-4, 4.6], [6, 4.6]].forEach(([x, z]) => { [0, 1, 2].forEach(i => mesh(benchSeat, M.bench, x, 0.45, z - 0.13 + i * 0.13, g)); [x - 0.65, x + 0.65].forEach(px => pipe([[px, 0, z - 0.2], [px, 0.43, z - 0.1], [px, 0.43, z + 0.3], [px, 0, z + 0.4]], 0.018, M.pole, g, 0.08)); });
    [[-13.8, -6], [-13.8, 3], [13.8, -6], [13.8, 3], [0, 6.6]].forEach(([x, z]) => { lathePost(4.2, 0.07, 0.045, M.pole, g, x, z); const hd = mesh(new THREE.SphereGeometry(0.16, 18, 12), M.lamp, x, 4.25, z, g); hd.castShadow = false; });
    { const l = new THREE.SpotLight("#ffd98a", 0, 22, 0.9, 0.7, 1.4); l.position.set(0, 4.1, 6.6); l.target.position.set(-3, 0, -1); g.add(l); g.add(l.target); lampLights.push(l); }
    [[-16, -9, 1.2], [-15.5, 7, 1.0], [16, -9, 1.3], [15.5, 7.5, 1.1], [-6, 9, 1.25], [7, 9.5, 1.15], [-9, -10.5, 1.3], [10, -11, 1.2]].forEach(([x, z, s], i) => tree(x, z, s, i % 3, g));
    scene.add(g); colors(); return g;
  }

  /* the ramps: a lab curve swept across its width, plywood on the riding surface, steel coping, decks with railings */
  function rampMesh(pts, W2, deckLen, opt) {
    opt = opt || {};
    const g = new THREE.Group(), top = pts[0].y, xe = pts[pts.length - 1].x, x0 = pts[0].x;
    const s = new THREE.Shape(); s.moveTo(x0 - deckLen, 0); s.lineTo(x0 - deckLen, top); s.lineTo(x0, top);
    pts.forEach(p => s.lineTo(p.x, p.y)); s.lineTo(xe + deckLen, top); s.lineTo(xe + deckLen, 0); s.lineTo(x0 - deckLen, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 2 * W2, bevelEnabled: false, curveSegments: 4 }); geo.translate(0, 0, -W2);
    const side = new THREE.Mesh(geo, [M.rampSide, M.rampSide]); side.castShadow = side.receiveShadow = true; g.add(side);
    // the riding surface: a sheet on the curve, so the plywood texture follows it; its edges rounded off by a small lip
    const pos = [], uv = [], idx = []; let acc = 0;
    pts.forEach((p, i) => { if (i) acc += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); pos.push(p.x, p.y + 0.003, -W2, p.x, p.y + 0.003, W2); uv.push(acc / 1.22, 0, acc / 1.22, 2 * W2 / 2.44); });
    for (let i = 0; i < pts.length - 1; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx); sg.computeVertexNormals();
    const sheet = new THREE.Mesh(sg, M.ramp); sheet.receiveShadow = true; g.add(sheet);
    // the decks: a rounded plywood top on each side
    [[x0 - deckLen / 2 - 0.02], [xe + deckLen / 2 + 0.02]].forEach(([cx]) => mesh(rbox(deckLen + 0.04, 0.03, 2 * W2 + 0.04, 0.012), M.deckTop, cx, top + 0.012, 0, g));
    // steel coping, its ends capped round
    [x0, xe].forEach(x => { const c = mesh(new THREE.CylinderGeometry(0.031, 0.031, 2 * W2 + 0.04, 24), M.coping, x, top + 0.004, 0, g); c.rotation.x = Math.PI / 2;
      [-1, 1].forEach(sz => mesh(new THREE.SphereGeometry(0.031, 14, 10), M.coping, x, top + 0.004, sz * (W2 + 0.02), g)); });
    // railings at the back of the decks
    if (opt.rail !== false && deckLen > 0.6) {
      [[x0 - deckLen + 0.08, -1], [xe + deckLen - 0.08, 1]].forEach(([x]) => pipe([[x, top, -W2 + 0.05], [x, top + 0.95, -W2 + 0.05], [x, top + 0.95, W2 - 0.05], [x, top, W2 - 0.05]], 0.022, M.pole, g, 0.1));
    }
    // the framing shows under a vert deck: a few rounded posts
    return g;
  }
  function hillMesh(path) {   // a long concrete hill at 5°: a rounded lip at the top
    const g = new THREE.Group(), p = path.pts, h = p[0].y, len = path.slopeLen;
    const s = new THREE.Shape(); s.moveTo(-2.5, 0); s.lineTo(-2.5, h); s.lineTo(-0.15, h); s.quadraticCurveTo(0, h, 0.15, h - 0.15 * Math.tan(5 * DEG)); s.lineTo(len, 0); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 4, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 10 }); geo.translate(0, 0, -2);
    const m = new THREE.Mesh(geo, hillMat); m.castShadow = m.receiveShadow = true; g.add(m);
    concreteTex.needsUpdate = true;
    return g;
  }

  /* ── what each room adds to the scene ── */
  const stage = new THREE.Group(); scene.add(stage);
  const fx = new THREE.Group(); scene.add(fx);   // arrows, gauges, trails, labels
  const arrowA = makeArrow(M.force), arrowB = makeArrow(M.good), arrowC = makeArrow(M.friction); fx.add(arrowA, arrowB, arrowC);
  const comBall = new THREE.Group(); { const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14, 0, Math.PI / 2), M.ink), s2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14, Math.PI, Math.PI / 2), M.ink); const w1 = new THREE.Mesh(new THREE.SphereGeometry(0.049, 20, 14), new THREE.MeshStandardMaterial({ color: "#f4f1ea", roughness: 0.5 })); comBall.add(s1, s2, w1); s2.rotation.x = Math.PI; } fx.add(comBall);
  const trail = dashedLine(M.path, 1200); fx.add(trail);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.012, 8, 32, 0.8), M.path); fx.add(arc);
  const labA = makeLabel(() => L("Back foot snaps the tail down", "El pie de atrás golpea la cola"), { color: "force", h: 0.075 });
  const labB = makeLabel(() => L("Ground pushes back up", "El suelo empuja hacia arriba"), { color: "good", h: 0.075 });
  const labC = makeLabel(() => L("Grip tape friction drags the board up", "La lija arrastra la tabla hacia arriba"), { color: "friction", h: 0.075 });
  const labStop = makeLabel(() => L("would stop here", "pararía aquí"), { color: "heat", h: 0.08 });
  let surfLabel = "";
  const labSurf = makeLabel(() => surfLabel || " ", { h: 0.075 });
  fx.add(labA, labB, labC, labStop, labSurf);
  // energy gauges: glass tubes filling with each kind of energy, on a rounded plinth, with their names
  const gauges = new THREE.Group(); fx.add(gauges);
  const GAUGE = [["pe", "Stored", "Guardada"], ["ke", "Motion", "Movimiento"], ["heat", "Heat", "Calor"], ["pump", "Pumping", "Bombeo"]].map(([k, en, es], i) => {
    const gg = new THREE.Group(); gg.position.x = i * 0.34; gauges.add(gg);
    const glass = mesh(new THREE.CapsuleGeometry(0.12, 1, 8, 24), M.glass, 0, 0.62, 0, gg); glass.castShadow = false; glass.renderOrder = 3;
    const fill = mesh(new THREE.CylinderGeometry(0.095, 0.095, 1, 24), M[k], 0, 0.12, 0, gg); fill.geometry.translate(0, 0.5, 0);
    const cap = mesh(new THREE.SphereGeometry(0.095, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M[k], 0, 0.12, 0, gg);
    const lab = makeLabel(() => L(en, es), { color: k, h: 0.085, cy: 0 }); lab.position.set(0, 1.5, 0); gg.add(lab);
    return { k, gg, fill, cap, lab };
  });
  mesh(rbox(1.45, 0.08, 0.42, 0.03), M.prop, 0.51, 0.04, 0, gauges);
  const ghosts = []; const ghostGeo = deckGeo;
  for (let i = 0; i < 16; i++) { const gm = new THREE.Mesh(ghostGeo, ghostMat); gm.visible = false; gm.renderOrder = 2; fx.add(gm); ghosts.push(gm); }
  const heatBar = mesh(rbox(1, 0.006, 0.032, 0.002), M.heat, 0, 0, 0, fx); heatBar.geometry.translate(0.5, 0, 0); heatBar.castShadow = false;
  const stopPost = new THREE.Group(); lathePost(0.7, 0.012, 0.01, M.heat, stopPost, 0, 0); { const fl = mesh(rbox(0.16, 0.1, 0.008, 0.02), M.heat, 0.09, 0.62, 0, stopPost); } fx.add(stopPost);
  const pole = new THREE.Group(); lathePost(0.7, 0.012, 0.01, M.pole, pole, 0, 0);
  const poleLabs = [];
  for (let c = 10; c <= 60; c += 10) { const t = mesh(new THREE.TorusGeometry(0.02, 0.005, 6, 16), M.mark, 0, c / 100, 0, pole); t.rotation.x = Math.PI / 2; if (c % 20 === 0) { const l = makeLabel(() => c + " cm", { h: 0.06, cx: 0 }); l.position.set(0.04, c / 100, 0); pole.add(l); poleLabs.push(l); } }
  fx.add(pole);
  function fxHide() { fx.children.forEach(c => c.visible = false); ghosts.forEach(g => g.visible = false); }

  let sceneName = null;
  function setScene(name, build) {
    if (name === sceneName) return; sceneName = name;
    while (stage.children.length) { const c = stage.children[0]; stage.remove(c); c.traverse(o => { if (o.geometry && !o.userData.keep) o.geometry.dispose(); }); }
    const isFree = name === "free";
    if (isFree && !freePark) freePark = buildFreePark();
    if (freePark) freePark.visible = isFree;
    dress.visible = !isFree;
    if (build) { const o = build(); if (o) stage.add(o); }
  }
  function trickScene(name) {
    setScene("trick:" + name, () => {
      if (name === "ramp") return rampMesh(kit.path(), 1.2, 1.6, { rail: false });
      if (name === "curb") { const g = new THREE.Group(), c0 = -0.5, c1 = 1.32, ht = 0.16;
        mesh(rbox(c1 - c0, ht, 0.4, 0.02), M.curb, (c0 + c1) / 2, ht / 2, 0, g);
        [-1, 1].forEach(s => { const ir = mesh(new THREE.CylinderGeometry(0.01, 0.01, c1 - c0 - 0.02, 10), M.metal, (c0 + c1) / 2, ht - 0.004, s * 0.195, g); ir.rotation.z = Math.PI / 2; });
        mesh(rbox(c1 - c0 - 0.1, 0.003, 0.34, 0.001), M.wax, (c0 + c1) / 2, ht + 0.001, 0, g); return g; }
      if (name === "grass") { const g = new THREE.Mesh(new THREE.CircleGeometry(5, 48), M.grass); g.rotation.x = -Math.PI / 2; g.position.set(0, 0.004, 0.4); g.receiveShadow = true; return g; }
      return null;
    });
  }

  /* ── the board and the rider, inside a frame that sits on the ground, on a ramp, or anywhere in the free park ── */
  const surf = new THREE.Group(); scene.add(surf);
  const boardOuter = new THREE.Group(), pitchG = new THREE.Group(), dirG = new THREE.Group(), spinG = new THREE.Group();
  surf.add(boardOuter); boardOuter.add(pitchG); pitchG.add(dirG); dirG.add(spinG);
  const board = makeBoard(); spinG.add(board);
  surf.add(rider.root);

  const tmp = new THREE.Vector3(), qS = new THREE.Quaternion(), qD = new THREE.Quaternion();
  /* a foot's place on the board ([x along it, lift]) → the surface frame, with the deck's up and the toes' way (world).
     A foot on the deck turns with the board; a foot lifted for a flip stays over it while the board spins below. */
  function footOnBoard(q, front) {
    const k = clamp(1 - q[1] / 0.035, 0, 1);
    tmp.set(q[0], kit.deckMid(q[0]) + B.thick / 2 + q[1], 0);
    const a = spinG.localToWorld(tmp.clone()), b = dirG.localToWorld(tmp.clone());
    const p = b.lerp(a, k);
    spinG.getWorldQuaternion(qS); dirG.getWorldQuaternion(qD); qD.slerp(qS, k);
    const up = V(0, 1, 0).applyQuaternion(qD), fwd = V(0, 0, 1).add(V(front ? 0.36 : 0.1, 0, 0)).normalize().applyQuaternion(qD);
    return { p: surf.worldToLocal(p), up, fwd };
  }
  let lastSpec = null, lastO = null, camMode = "follow", orbit = { th: 0.6, el: 0.22, dist: 4.4 };
  function pose(fr) {
    let sx = 0, sy = 0, sz = 0, ang = 0, yaw = 0, rl = 0;
    if (fr.surf) { sx = fr.surf.x; sy = fr.surf.y; sz = fr.surf.z || 0; ang = fr.surf.slope || 0; yaw = fr.surf.yaw || 0; rl = fr.surf.roll || 0; }
    else if (fr.mode === "path") { const q = kit.at(fr.s0); sx = q.x; sy = q.y; ang = Math.atan2(q.ty, q.tx); }
    surf.position.set(sx, sy, sz); surf.rotation.set(rl, -yaw, ang, "YZX");
    const dir = fr.dir, pv = (fr.piv === "back" ? -B.axle : fr.piv === "front" ? B.axle : 0) * dir, a = fr.pitch * DEG * dir;
    boardOuter.position.set(fr.bx + pv, fr.by + fr.h, 0);
    pitchG.rotation.set(0, 0, a); dirG.position.set(-pv, 0, 0); dirG.rotation.set(0, dir < 0 ? Math.PI : 0, 0);
    spinG.rotation.set(fr.roll * DEG, fr.yaw * DEG, 0, "YXZ");
    const roll = fr.dist != null ? -fr.dist / B.wheelR : -((fr.mode === "path" ? fr.s0 * dir : fr.bx) / B.wheelR);
    board.userData.wheels.forEach(w => w.rotation.z = roll * dir);
    surf.updateMatrixWorld(true);
    const gz = 0.14;   // a foot on the ground stands just beside the board, on the toe side
    const sUp = V(0, 1, 0).transformDirection(surf.matrixWorld), sZ = V(0, 0, 1).transformDirection(surf.matrixWorld), sX = V(1, 0, 0).transformDirection(surf.matrixWorld);
    const onGround = (g, front) => ({ p: V(g[0], g[1], gz), up: sUp.clone(), fwd: sZ.clone().addScaledVector(sX, front ? 0.5 : 0.2).normalize() });
    const FF = fr.f ? footOnBoard(fr.f, true) : onGround(fr.fg, true), FB = fr.b ? footOnBoard(fr.b, false) : onGround(fr.bg, false);
    const fF = FF.p, fB = FB.p;
    let hip;
    if (fr.hip) hip = V(fr.hip[0], fr.hip[1], -0.01);
    else {
      const mid = fF.clone().add(fB).multiplyScalar(0.5); mid.x += fr.hx;
      hip = V(mid.x, mid.y + 0.84 - 0.36 * fr.crouch + fr.jump, mid.z - 0.01);
      const ba = fr.ba * DEG; const hx = hip.x - mid.x, hy = hip.y - mid.y;
      hip.set(mid.x + hx * Math.cos(ba) - hy * Math.sin(ba), mid.y + hx * Math.sin(ba) + hy * Math.cos(ba), hip.z);
    }
    const noseW = new THREE.Vector3(1, 0, 0).applyQuaternion(spinG.getWorldQuaternion(new THREE.Quaternion()));
    const noseL = noseW.clone().transformDirection(new THREE.Matrix4().copy(surf.matrixWorld).invert());
    const o = { fF, fB, upF: FF.up, upB: FB.up, fwdF: FF.fwd, fwdB: FB.fwd, hip, lean: fr.lean - fr.ba * DEG, turn: fr.turn * DEG * dir, nose: noseL.x >= 0 ? 1 : -1, arms: fr.arms, lift: fr.lift, str: fr.str };
    rider.pose(o, surf); lastO = o;
    return surf.localToWorld(hip.clone());
  }

  /* ── cameras ── */
  const camPos = V(0, 1.6, 6), camLook = V(0, 0.6, 0), camTgtPos = V(), camTgtLook = V();
  let camSnap = true, camMoving = false, viewPad = 0;
  function frameCam(fov, pos, look) { camera.fov = fov; camTgtPos.copy(pos); camTgtLook.copy(look); }
  function fitDist(span, fov) { const hf = 2 * Math.atan(Math.tan(fov * DEG / 2) * camera.aspect); return span / 2 / Math.tan(Math.min(hf, fov * DEG) / 2); }
  function aimTrick(target, fr) {
    const fx0 = fr && fr.cam != null ? fr.cam : target.x;
    if (camMode === "side") frameCam(22, V(fx0, 1.0, 9.5), V(fx0, 0.85, 0));
    else if (camMode === "fish") { const d = fr ? fr.dir : 1; frameCam(96, V(target.x + 0.9 * d, 0.32, 1.45), V(target.x - 0.1 * d, 0.62, 0)); }
    else frameCam(40, V(fx0 + 0.55, 1.05, 3.3), V(fx0 + 0.05, 0.78, 0));
    if (sceneName === "trick:ramp" && camMode !== "fish") { const cx = 2.4; frameCam(camMode === "side" ? 30 : 42, V(cx + 0.3, camMode === "side" ? 1.2 : 1.7, camMode === "side" ? 9 : 6.2), V(cx, 0.75, 0)); }
  }
  function orbitCam(c) { frameCam(38, V(c.x + Math.sin(orbit.th) * Math.cos(orbit.el) * orbit.dist, c.y + Math.sin(orbit.el) * orbit.dist + 0.2, c.z + Math.cos(orbit.th) * Math.cos(orbit.el) * orbit.dist), c); }
  function applyCam(snap) {
    if (snap || camSnap) { camPos.copy(camTgtPos); camLook.copy(camTgtLook); camMoving = false; }
    camera.position.copy(camPos); camera.lookAt(camLook);
    if (viewPad > 0) camera.setViewOffset(W, H, 0, viewPad * H / 2, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function sunAt(x, z, wide) {
    sun.position.set(x - 4, 9, z + 6); sun.target.position.set(x, 0, z); sun.target.updateMatrixWorld();
    const s = wide ? 12 : 5; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s * 0.7 }); sun.shadow.camera.updateProjectionMatrix();
  }
  function slideWorld(x) { world.position.x = Math.floor(x / 9) * 9; }

  /* ── drawing each kind of scene ── */
  let W = 0, H = 0, renders = 0, lastFree = 0;
  function resize(w, h) { if (w === W && h === H) return; W = w; H = h; renderer.setSize(w, h, false); canvas.style.width = w + "px"; canvas.style.height = h + "px"; camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function draw(spec) {
    lastSpec = spec;
    const fr = spec.fr, d = spec.data || {};
    if (spec.cam && spec.cam !== camMode && !(camMode === "orbit" && spec.cam === "orbit")) camMode = spec.cam;
    fxHide(); viewPad = 0; camSnap = true;
    let t = V(0, 0.8, 0);
    if (spec.kind === "trick") {
      trickScene(spec.D ? spec.D.scene : "flat"); slideWorld(0);
      if (fr) t = pose(fr);
      if (camMode === "orbit") orbitCam(V(t.x, Math.max(0.7, t.y - 0.1), 0)); else aimTrick(t, fr);
      sunAt(t.x, 0);
    } else if (spec.kind === "ramp") {
      const path = d.path; if (!path) return;
      setScene("room:ramp:" + d.key, () => path.hill ? hillMesh(path) : rampMesh(path.pts, 1.2, 1.6, { rail: path.Hm > 2 }));
      if (fr) t = pose(fr);
      const xs = path.pts[0].x - 1.6, xe = path.hill ? 0 : path.pts[path.pts.length - 1].x + 1.6, top = path.Hm;
      slideWorld(path.hill ? t.x : 0);
      // the gauges: beside the ramp, filled with each kind of energy (each one a share of the total)
      gauges.visible = true; const gh = Math.max(1.3, top * 0.55);
      GAUGE.forEach(gg => { const v = d.energy ? d.energy[gg.k] : 0; gg.gg.visible = v >= 0; gg.gg.children.forEach(c => c.visible = true); const hgt = Math.max(0.002, clamp(v, 0, 1) * gh); gg.fill.scale.y = hgt; gg.cap.position.y = 0.12 + hgt; gg.gg.children[0].scale.set(1, (gh + 0.24) / 1.24, 1); gg.gg.children[0].position.y = 0.12 + gh / 2; gg.lab.position.y = 0.12 + gh + 0.3; });
      gauges.position.set(path.hill ? t.x + 2.2 : xe + 0.45, 0, path.hill ? 1.4 : 1.0); gauges.rotation.y = -0.35;
      gauges.children.forEach(c => { if (c.isMesh) c.visible = true; });
      if (d.forces) {
        const zf = 0.34, com = V(d.forces.com[0], d.forces.com[1], zf);
        arrowA.set(com, V(0, -1, 0), 0.55); arrowA.visible = true;
        if (d.forces.nG > 0.02) { arrowB.set(V(d.forces.contact[0], d.forces.contact[1], zf), V(d.forces.n[0], d.forces.n[1], 0), 0.55 * d.forces.nG); }
        comBall.visible = true; comBall.position.copy(com);
      }
      if (d.trail && d.trail.length > 1) { trail.visible = true; trail.set(d.trail.map(p => [p[0], p[1], 0.34])); }
      if (camMode === "orbit") orbitCam(V(t.x, Math.max(0.7, t.y - 0.1), 0));
      else if (camMode === "follow" || path.hill) frameCam(40, V(t.x + 1.4, t.y + 1.3, 4.6), V(t.x + 0.4, t.y + 0.35, 0));
      else { const span = (xe + 1.6) - xs, cx = (xs + xe + 1.6) / 2, dist = fitDist(span * 1.06, 40); frameCam(40, V(cx + span * 0.12, top * 0.55 + dist * 0.2, dist), V(cx, top * 0.42, 0)); }
      sunAt(t.x, 0, !path.hill && camMode === "wide");
    } else if (spec.kind === "ollie") {
      setScene("room:ollie", null); slideWorld(0);
      if (fr) t = pose(fr);
      pole.visible = true; pole.position.set(-0.85, 0, -0.32); pole.children.forEach(c => c.visible = true);
      if (d.trail && d.trail.length > 1) { trail.visible = true; trail.set(d.trail.map(p => [p[0], p[1], 0.3])); }
      (d.ghosts || []).slice(0, ghosts.length).forEach((gp, i) => {   // every moment, faint: the deck as it turned about the back wheels
        const gm = ghosts[i]; gm.visible = true; const a = gp.pitch * DEG;
        const cx = -B.axle + Math.cos(a) * B.axle, cy = gp.h + Math.sin(a) * B.axle;
        gm.position.set(cx - Math.sin(a) * B.deckY, cy + Math.cos(a) * B.deckY, 0); gm.rotation.set(0, 0, a);
      });
      if (d.forces && d.popping) {
        const tail = V(-B.half + 0.02, fr.h + 0.12, 0.2);
        arrowA.set(tail.clone().add(V(0, 0.55, 0)), V(0, -1, 0), 0.5); labA.visible = true; labA.position.copy(tail).add(V(-0.05, 0.7, 0));
        arrowB.set(V(-B.half - 0.08, 0, 0.2), V(0, 1, 0), 0.45); labB.visible = true; labB.position.set(-B.half - 0.25, 0.52, 0.2);
        arc.visible = true; arc.position.set(-B.axle, fr.h + B.wheelR, 0.2); arc.rotation.set(0, 0, Math.PI * 0.55);
      }
      if (d.forces && d.sliding) {
        const a = fr.pitch * DEG, f0 = V(-B.axle + Math.cos(a) * (B.axle + d.ffoot), fr.h + Math.sin(a) * (B.axle + d.ffoot) + 0.14, 0.22);
        arrowC.set(f0, V(Math.cos(a) + 0.15, Math.sin(a) + 0.5, 0), 0.4); labC.visible = true; labC.position.copy(f0).add(V(0.35, 0.42, 0));
      }
      if (camMode === "orbit") orbitCam(V(0, 0.6, 0));
      else if (camMode === "follow") frameCam(40, V(1.2, 1.0, 2.6), V(0, 0.65, 0));
      else frameCam(40, V(1.05, 1.15, 3.7), V(-0.05, 0.62, 0));
      sunAt(0, 0);
    } else if (spec.kind === "grind") {
      setScene("room:grind:" + d.key, () => grindMesh(d)); slideWorld(0);
      if (fr) t = pose(fr);
      viewPad = (d.bottom || 0) * 0.75;
      if (d.x > 0) { heatBar.visible = true; heatBar.position.set(0, d.rh + (d.surface === "metal" ? 0.026 : 0.003), d.surface === "metal" ? 0 : 0.17); heatBar.scale.set(Math.max(0.001, Math.min(d.x, d.len)), 1, 1); }
      if (d.d < d.len + 1.4) { stopPost.visible = true; stopPost.position.set(d.d, 0, -0.42); labStop.visible = true; labStop.position.set(d.d, 0.82, -0.42); }
      if (d.onIt && d.v > 0) { arrowC.set(V(d.x - 0.05, d.rh + 0.06, 0.25), V(-1, 0, 0), 0.25 + 0.7 * d.mu); }
      surfLabel = d.label || ""; if (surfLabel) { labSurf.redraw(); labSurf.visible = true; labSurf.position.set(d.len / 2, 0.08, 0.55); }
      const span = d.len + 2.8, cx = d.len / 2;
      if (camMode === "orbit") orbitCam(V(t.x, 0.6, 0));
      else if (camMode === "follow") frameCam(40, V(t.x + 1.0, 1.2, 3.2), V(t.x + 0.2, 0.55, 0));
      else { const dist = fitDist(span * 0.9, 40); frameCam(40, V(cx + span * 0.06, 0.75 + dist * 0.13, dist), V(cx, 0.42, 0)); }
      sunAt(cx, 0, true);
    } else if (spec.kind === "free") {
      setScene("free", null); world.position.x = 0;
      if (fr) t = pose(fr);
      const st = d.st;
      if (d.trail && d.trail.length > 1) { trail.visible = true; trail.set(d.trail.concat([[st.x, st.z, st.y]]).map(p => [p[0], (p[2] || 0) + 0.03, p[1]])); }
      const R = kit.fRamp(), onRamp = st.mode === "ramp" || st.mode === "stall" || (st.mode === "deck") || (st.mode === "ground" && Math.abs(st.z - R.z) <= R.w2 && st.x > R.xa - R.deck && st.x < R.xb + R.deck) || (st.mode === "air" && Math.abs(st.z - R.z) <= R.w2 + 0.5 && st.x > R.xa - R.deck && st.x < R.xb + R.deck);
      if (camMode === "orbit") orbitCam(V(t.x, Math.max(0.6, t.y - 0.1), t.z));
      else if (camMode === "park") frameCam(42, V(4, 12.5, 17), V(-1.2, 0, -1));
      else if (onRamp) { const cx = (R.xa + R.xb) / 2; frameCam(44, V(cx + 0.6, 2.6, R.z + 6.6), V(lerp(cx, st.x, 0.4), 0.7, R.z)); }
      else { const hd = st.h, back = 3.3; frameCam(45, V(st.x - Math.cos(hd) * back + Math.sin(hd) * 0.9, (st.y || 0) + 1.75, st.z - Math.sin(hd) * back - Math.cos(hd) * 0.9), V(st.x + Math.cos(hd) * 1.6, (st.y || 0) + 0.55, st.z + Math.sin(hd) * 1.6)); }
      sunAt(t.x, t.z, camMode === "park");
      // the camera eases after the rider (it never jumps), unless reduce motion is on
      if (!d.reduce && camMode !== "orbit") {
        const now = performance.now(), dt = lastFree ? Math.min(0.1, (now - lastFree) / 1000) : 1; lastFree = now;
        const k = 1 - Math.exp(-dt * 4.5);
        if (camPos.distanceTo(camTgtPos) > 5 || camLook.distanceTo(camTgtLook) > 5) { camPos.copy(camTgtPos); camLook.copy(camTgtLook); }   // a new start: cut, never sweep through the park
        camPos.lerp(camTgtPos, k); camLook.lerp(camTgtLook, k);
        camMoving = camPos.distanceTo(camTgtPos) > 0.01 || camLook.distanceTo(camTgtLook) > 0.01;
        camSnap = false;
      }
    }
    applyCam();
    labels.forEach(l => l.redraw());
    renderer.render(scene, camera); renders++;
  }
  function grindMesh(d) {
    const g = new THREE.Group(), len = d.len, rh = d.rh;
    if (d.surface === "metal") {
      pipe([[0, rh, 0], [len, rh, 0]], 0.025, M.metal, g);
      [0.15, len - 0.15].forEach(x => { mesh(new THREE.CylinderGeometry(0.022, 0.022, rh, 14), M.metal, x, rh / 2, 0, g); mesh(rbox(0.16, 0.012, 0.12, 0.004), M.metal, x, 0.006, 0, g); });
    } else {
      const m = d.surface === "wax" ? M.wax : d.surface === "paint" ? M.paint : M.concrete;
      mesh(rbox(len, rh, 0.4, d.surface === "concrete" ? 0.035 : 0.02), d.surface === "concrete" ? M.concrete : M.prop, len / 2, rh / 2, 0, g);
      if (d.surface !== "concrete") { mesh(rbox(len - 0.02, 0.005, 0.38, 0.002), m, len / 2, rh + 0.002, 0, g); [-1, 1].forEach(s => { const ir = mesh(new THREE.CylinderGeometry(0.012, 0.012, len - 0.03, 10), M.metal, len / 2, rh - 0.006, s * 0.195, g); ir.rotation.z = Math.PI / 2; }); }
    }
    return g;
  }

  // drag sideways to walk the camera around the rider (it switches to the walk-around camera); never on its own
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
    canvas, draw, resize,
    render: (fr, D) => draw({ kind: "trick", fr, D, cam: camMode }),   // the trick book's older call
    colors: () => { colors(); if (lastSpec) draw(lastSpec); },
    setCam: m => { camMode = m; if (lastSpec) draw(Object.assign({}, lastSpec, { cam: m })); }, cam: () => camMode,
    camBusy: () => camMoving,
    onDown, onMove, onUp, renders: () => renders,
    show: on => { canvas.style.display = on ? "block" : "none"; },
    figure: () => !!(rider && rider.fig),
    feetError: () => rider.feetError ? rider.feetError() : [0, 0],
    world: () => ({ surf: surf.position.clone(), board: boardOuter.getWorldPosition(new THREE.Vector3()) }),
    dispose: () => {   // let go of everything: the scene, its textures, the figure and the drawing context
      if (rider && rider.dispose) try { rider.dispose(); } catch (e) {}
      const seen = new Set();
      scene.traverse(o => { if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); } const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(x => { if (seen.has(x)) return; seen.add(x); if (x.map) x.map.dispose(); x.dispose(); }); });
      crownGeos.forEach(g => g && g.dispose());
      allMats().forEach(m => m.dispose());
      disposables.forEach(t => t.dispose());
      scene.environment = null;
      renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    }
  };
}
