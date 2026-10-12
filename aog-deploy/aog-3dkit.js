/* The shared 3D stage (AOG-3DKIT-V1, 2026-10-12)
   A renderer, a scene, soft light and a camera for every 3D room (Skate Lab, Dojo, Kitchen, Sewing Room).
   Silent until used: nothing here asks for frames on its own. render() is the only thing that draws; animate() runs a
   loop only while its step says there is still something moving, then stops by itself. dispose() gives everything back
   and loses the WebGL context.

   import { makeStage } from "/aog-3dkit.js";
   const st = makeStage({ host, before, quality: "phone" | "full" (default: by screen size), dark: false });
   st.floor({ kind: "mat" | "concrete" | "wood" | "plain" | "shadow", color, size });
   st.render(); st.resize(w, h); st.setDark(true); st.renders(); st.dispose(); */
import * as THREE from "/vendor/three-0.160.0/three.module.min.js";
import { RoomEnvironment } from "/vendor/three-0.160.0/addons/environments/RoomEnvironment.js";

export { THREE };

const LOOK = {
  light: { bg: "#e9e6df", fog: "#e9e6df", sun: "#fff3e2", sunI: 2.4, hemiSky: "#f4f1ea", hemiGround: "#8f877a", hemiI: 0.35, exposure: 1.0, env: 1 },
  dark: { bg: "#141b27", fog: "#141b27", sun: "#b9c8ff", sunI: 1.15, hemiSky: "#41507a", hemiGround: "#141a24", hemiI: 0.3, exposure: 0.92, env: 0.42 }
};

export function phoneQuality() {
  try { return Math.min(screen.width, screen.height) < 600 || Math.min(innerWidth, innerHeight) < 600; } catch (e) { return false; }
}

export function makeStage(o) {
  o = o || {};
  const quality = o.quality === "phone" || o.quality === "full" ? o.quality : (phoneQuality() ? "phone" : "full");
  const phone = quality === "phone";
  const pal = { light: Object.assign({}, LOOK.light, o.light || {}), dark: Object.assign({}, LOOK.dark, o.darkLook || {}) };

  const canvas = document.createElement("canvas");
  canvas.className = o.className || "aog-3d";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;outline:none";
  if (o.host) o.host.insertBefore(canvas, o.before || null);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: !!o.preserveDrawingBuffer });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov || 35, 16 / 9, 0.05, 200);
  camera.position.set(2.4, 1.55, 4.2); camera.lookAt(0, 0.95, 0);

  // soft image-based light from a room, made once (a dim copy is made the first time the night look is asked for)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment(renderer);
  const envLight = pmrem.fromScene(room, 0.04).texture;
  let envDark = null;
  function makeDarkEnv() {
    const r = new RoomEnvironment(renderer);
    r.traverse(m => { if (m.material) { const mm = m.material; if (mm.color) mm.color.multiplyScalar(pal.dark.env); if (mm.emissive) mm.emissive.multiplyScalar(pal.dark.env); if (mm.emissiveIntensity != null) mm.emissiveIntensity *= pal.dark.env; } if (m.isLight) m.intensity *= pal.dark.env; });
    envDark = pmrem.fromScene(r, 0.04).texture;
    r.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); });
  }
  room.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); });

  const hemi = new THREE.HemisphereLight("#fff", "#888", 0.3); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff", 2); sun.position.set(2.8, 5.5, 3.6); sun.castShadow = true;
  sun.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  scene.add(sun); scene.add(sun.target);
  const sunOffset = sun.position.clone();
  function shadowFocus(center, radius) {
    const c = center || new THREE.Vector3(0, 0.9, 0), r = radius || 2.4, cam = sun.shadow.camera;
    sun.target.position.copy(c); sun.position.copy(c).add(sunOffset);
    cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r; cam.near = 0.5; cam.far = sunOffset.length() + r * 2 + 4; cam.updateProjectionMatrix();
  }
  shadowFocus(o.focus, o.shadowRadius);
  scene.fog = new THREE.Fog("#fff", o.fogNear || 9, o.fogFar || 42);

  let dark = false;
  function setDark(on) {
    dark = !!on; const L = dark ? pal.dark : pal.light;
    if (dark && !envDark) makeDarkEnv();
    scene.environment = dark ? envDark : envLight;
    scene.background = new THREE.Color(L.bg); scene.fog.color.set(L.fog);
    sun.color.set(L.sun); sun.intensity = L.sunI; hemi.color.set(L.hemiSky); hemi.groundColor.set(L.hemiGround); hemi.intensity = L.hemiI;
    renderer.toneMappingExposure = L.exposure;
    floors.forEach(f => f.userData.retint && f.userData.retint(dark));
    if (alive && sized) render();
  }

  /* ── floors: a dojo mat, concrete, wood, a plain color, or only the shadow ── */
  const floors = [], ownTex = [];
  function canvasTex(w, h, draw, rep) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (rep) t.repeat.set(rep, rep); ownTex.push(t); return t;
  }
  let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function speckle(g, w, h, n, a) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? "0,0,0" : "255,255,255"},${rnd() * a})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 1.5, 1 + rnd() * 1.5); } }
  function floor(f) {
    f = f || {};
    const kind = f.kind || "plain", size = f.size || 60;
    let mat, geo = new THREE.CircleGeometry(size / 2, 64);
    if (kind === "shadow") mat = new THREE.ShadowMaterial({ opacity: f.opacity == null ? 0.25 : f.opacity });
    else {
      const o2 = { roughness: f.roughness == null ? 0.9 : f.roughness, metalness: 0 };
      if (kind === "mat") {   // soft tatami-like mats, 1 m × 2 m, with soft seams
        o2.map = canvasTex(256, 512, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); speckle(g, w, h, 5000, 0.05);
          for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(0,0,0,${0.012 + rnd() * 0.012})`; g.fillRect(0, y, w, 1); }
          g.fillStyle = "rgba(0,0,0,0.16)"; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); }, 1);
        o2.map.repeat.set(size / 1, size / 2); o2.roughness = 0.85;
      } else if (kind === "concrete") {
        o2.map = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#c4c4c4"; g.fillRect(0, 0, w, h); speckle(g, w, h, 4000, 0.25);
          g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); }, size / 1.5);
      } else if (kind === "wood") {
        o2.map = canvasTex(512, 512, (g, w, h) => { const n = 8; for (let i = 0; i < n; i++) { const l = 205 + rnd() * 30; g.fillStyle = `rgb(${l},${l * 0.82 | 0},${l * 0.62 | 0})`; g.fillRect(0, i * h / n, w, h / n);
          for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(90,50,20,${rnd() * 0.08})`; g.fillRect(0, i * h / n + rnd() * h / n, w, 1); } g.fillStyle = "rgba(60,30,10,0.35)"; g.fillRect(0, i * h / n, w, 1.5); } }, size / 1.6);
        o2.roughness = 0.6;
      }
      mat = new THREE.MeshStandardMaterial(o2);
      const c = f.color, cd = f.colorDark;
      const tint = d => mat.color.set((d ? cd : c) || (d ? "#3a4252" : (kind === "plain" ? "#d8d2c4" : "#ffffff")));
      geo.userData = {}; tint(dark);
      var retint = tint;
    }
    const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.y = f.y || 0; m.receiveShadow = true; m.name = "floor";
    m.userData.retint = retint || null;
    scene.add(m); floors.push(m);
    return m;
  }

  /* ── drawing ── */
  let count = 0, alive = true, sized = false, w = 0, h = 0;
  function render() {
    if (!alive) return;
    if (!sized) resize();
    renderer.render(scene, camera); count++;
  }
  function resize(W, H) {
    if (!alive) return;
    const host = canvas.parentElement;
    W = Math.round(W || (host ? host.clientWidth : 0) || canvas.clientWidth || 640);
    H = Math.round(H || (host ? host.clientHeight : 0) || canvas.clientHeight || Math.round(W * 9 / 16));
    if (W === w && H === h && sized) return;
    w = W; h = H; sized = true;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    render();
  }
  let ro = null;
  if (o.autoResize !== false && typeof ResizeObserver !== "undefined" && o.host) {
    ro = new ResizeObserver(() => { const host = canvas.parentElement; if (host && (host.clientWidth !== w || host.clientHeight !== h)) resize(); });
    ro.observe(o.host);
  }

  /* ── a loop that runs only while something moves: step(dt, t) returns true to keep going ── */
  let raf = 0, stepFn = null, last = 0, t0 = 0;
  function frame(now) {
    raf = 0; if (!alive || !stepFn) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    const more = stepFn(dt, (now - t0) / 1000);
    render();
    if (more && stepFn) raf = requestAnimationFrame(frame); else stepFn = null;
  }
  function animate(step) { stop(); stepFn = step; last = t0 = performance.now(); raf = requestAnimationFrame(frame); return stop; }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; stepFn = null; }

  /* ── turning the camera around a point with a sideways drag (an up-down swipe still scrolls the page) ── */
  let orbitOff = null;
  function orbit(op) {
    op = op || {};
    if (orbitOff) orbitOff();
    const target = op.target || new THREE.Vector3(0, 0.95, 0);
    let yaw = Math.atan2(camera.position.x - target.x, camera.position.z - target.z), dist = Math.hypot(camera.position.x - target.x, camera.position.z - target.z), hgt = camera.position.y;
    let down = null;
    const place = () => { camera.position.set(target.x + Math.sin(yaw) * dist, hgt, target.z + Math.cos(yaw) * dist); camera.lookAt(target); };
    const pd = e => { down = { x: e.clientX, y: e.clientY, yaw, id: e.pointerId, moved: false }; };
    const pm = e => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!down.moved && Math.abs(dy) > Math.abs(dx)) { down = null; return; }
      if (Math.abs(dx) > 3) { down.moved = true; try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* fine */ } }
      yaw = down.yaw - dx * 0.008;
      if (op.min != null) yaw = Math.max(op.min, yaw); if (op.max != null) yaw = Math.min(op.max, yaw);
      place(); render(); if (op.onChange) op.onChange(yaw);
    };
    const pu = () => { down = null; };
    canvas.addEventListener("pointerdown", pd); canvas.addEventListener("pointermove", pm);
    canvas.addEventListener("pointerup", pu); canvas.addEventListener("pointercancel", pu);
    orbitOff = () => { canvas.removeEventListener("pointerdown", pd); canvas.removeEventListener("pointermove", pm); canvas.removeEventListener("pointerup", pu); canvas.removeEventListener("pointercancel", pu); orbitOff = null; };
    return { set(y) { yaw = y; place(); render(); }, get yaw() { return yaw; }, off: () => orbitOff && orbitOff() };
  }

  function look(pos, target) { camera.position.copy(pos); camera.lookAt(target || new THREE.Vector3(0, 0.95, 0)); }

  function dispose() {
    if (!alive) return;
    stop(); if (orbitOff) orbitOff(); if (ro) ro.disconnect();
    scene.traverse(m => {
      if (m.geometry) m.geometry.dispose();
      if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach(mm => {
        Object.values(mm).forEach(v => { if (v && v.isTexture) v.dispose(); }); mm.dispose(); });
      if (m.skeleton) m.skeleton.dispose();
      if (m.isLight && m.shadow && m.shadow.map) m.shadow.map.dispose();
    });
    ownTex.forEach(t => t.dispose()); envLight.dispose(); if (envDark) envDark.dispose(); pmrem.dispose();
    scene.clear();
    renderer.renderLists.dispose(); renderer.dispose(); renderer.forceContextLoss();
    canvas.remove(); alive = false;
  }

  setDark(!!o.dark);

  return {
    THREE, renderer, scene, camera, canvas, sun, hemi, quality, phone,
    render, resize, setDark, dispose, floor, shadowFocus, animate, stop, orbit, look,
    renders: () => count,
    get dark() { return dark; }, get alive() { return alive; }, get animating() { return !!stepFn; }
  };
}
