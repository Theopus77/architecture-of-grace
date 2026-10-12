/* The Kitchen Lab in 3D (AOG-KITCHEN-3D-V1, 2026-10-12)
   Jimmy: "I want more realism, not sharp straight lines … hit the ceiling" and "this has to be silent when not being used".
   A warm, bright kitchen with a long island (a sink with running water, a glass cooktop whose rings glow when on, an oven
   under it), a window behind the cook, soft image-based light and a sun with soft shadows. The cook is the shared figure
   (aog-figure3d.js, outfit "apron"); each hand is solved to hold its tool exactly (claw grip, knife tip on the board …).
   Everything is worked out from (step, how far through it) alone, so Go, ◀ ▶ and the slider all show the same picture.
   It draws only when show(), a drag, a resize or a theme change asks. Nothing moves on its own. No sounds.
   World: meters; the cook faces +z; the cook's own left is +x; the island's front edge is at z = 0.16. */
import * as THREE from "/vendor/three-0.160.0/three.module.min.js";
import { RoundedBoxGeometry } from "/vendor/three-0.160.0/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "/vendor/three-0.160.0/addons/environments/RoomEnvironment.js";
import { makeFigure } from "/aog-figure3d.js";

const D2R = Math.PI / 180, TAU = Math.PI * 2;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const sst = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const nrm = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
/* a smooth value through keys: K(u, [[u0, v0], [u1, v1] …]); v may be a number or an array */
function K(u, keys) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], t = sst(a, b, u);
      return Array.isArray(va) ? va.map((x, j) => lerp(x, vb[j], t)) : lerp(va, vb, t);
    }
  }
  return keys[keys.length - 1][1];
}
const win = (u, a, b) => clamp((u - a) / (b - a), 0, 1);   // where u is inside [a, b], 0 … 1
const TOP = 0.92;           // the counter's top
const FRONT = 0.16;         // the island's front edge
const BOARD = { x: 0, z: 0.46, w: 0.42, d: 0.28, h: 0.024 };
const BOWL = { x: 0.33, z: 0.42, r: 0.125, h: 0.1 };
const SINK = { x: -1.0, z: 0.52, w: 0.54, d: 0.42, depth: 0.2 };
const COOK = { x0: 0.6, x1: 1.4, z0: 0.24, z1: 0.98 };
const PAN = { x: 0.82, z: 0.42, r: 0.13 };
const POT = { x: 1.17, z: 0.44, r: 0.12, h: 0.16 };
const LIDREST = new THREE.Vector3(1.44, 0.92 + 0.004, 0.46);   // where the pot's lid rests on the counter, right of the cooktop
const OVEN = { x: 1.0, w: 0.68, y0: 0.16, y1: 0.66, rackY: 0.4, out: 0.34 };   // the door is on its bottom hinge; the rack slides out by `out`

export async function create(opts) {
  const host = opts.host, R = opts.R;
  const phone = Math.min(innerWidth, innerHeight) < 600;
  const canvas = document.createElement("canvas"); canvas.setAttribute("aria-hidden", "true");
  host.insertBefore(canvas, opts.before || null);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 4 / 3, 0.03, 40);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = envTex;
  let renders = 0, dark = !!opts.dark, view = opts.view || "shoulder";
  const disposables = [envTex];
  const track = o => { disposables.push(o); return o; };

  /* ── light: a soft sky from the room, a sun through the window, warm lamps at night ── */
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
  sun.position.set(-2.2, 4.2, -3.2); sun.target.position.set(0, 0.9, 0.4);
  sun.castShadow = true; sun.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -2.4, right: 2.4, top: 2.4, bottom: -1.2, near: 0.5, far: 12 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 5;
  scene.add(sun, sun.target);
  const fill = new THREE.HemisphereLight(0xfff6ea, 0x8a7a66, 0.55); scene.add(fill);
  const lamp = new THREE.PointLight(0xffd29a, 0, 6, 1.6); lamp.position.set(0.2, 2.15, 0.62); scene.add(lamp);
  const lamp2 = new THREE.PointLight(0xffd29a, 0, 6, 1.6); lamp2.position.set(-0.9, 2.15, 0.62); scene.add(lamp2);

  /* ── textures, drawn once on small canvases ── */
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function ctex(w, h, draw, rep, srgb) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return track(t);
  }
  const speck = (g, w, h, n, col, a, s) => { for (let i = 0; i < n; i++) { g.fillStyle = col.replace("A", (rnd() * a).toFixed(3)); const r = (s || 1) * (0.5 + rnd()); g.beginPath(); g.arc(rnd() * w, rnd() * h, r, 0, TAU); g.fill(); } };
  const T = {};
  T.quartz = ctex(512, 512, (g, w, h) => { g.fillStyle = "#f1ece3"; g.fillRect(0, 0, w, h); speck(g, w, h, 2600, "rgba(120,105,90,A)", 0.35, 0.9); speck(g, w, h, 500, "rgba(255,255,255,A)", 0.8, 1.2);
    for (let i = 0; i < 7; i++) { g.strokeStyle = `rgba(150,135,120,${0.05 + rnd() * 0.06})`; g.lineWidth = 1 + rnd() * 2; g.beginPath(); let x = rnd() * w, y = 0; g.moveTo(x, y); while (y < h) { x += (rnd() - 0.5) * 40; y += 20 + rnd() * 30; g.lineTo(x, y); } g.stroke(); } }, [3, 1.2]);
  T.wood = ctex(512, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#c89562"); gr.addColorStop(1, "#b57f4c"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(${rnd() < 0.5 ? "90,55,25" : "235,200,150"},${0.08 + rnd() * 0.12})`; g.lineWidth = 0.6 + rnd() * 1.6; const y = rnd() * h; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3 + (rnd() - 0.5) * 2); g.stroke(); } }, [1, 1]);
  T.floor = ctex(512, 512, (g, w, h) => { const rows = 8; for (let r = 0; r < rows; r++) { let x = -rnd() * 200; while (x < w) { const L = 140 + rnd() * 160, c = 150 + rnd() * 30; g.fillStyle = `rgb(${c + 40},${c},${c - 40})`; g.fillRect(x, r * h / rows, L, h / rows);
      for (let i = 0; i < 14; i++) { g.strokeStyle = `rgba(90,60,30,${0.05 + rnd() * 0.08})`; g.beginPath(); const y = r * h / rows + rnd() * h / rows; g.moveTo(x, y); g.bezierCurveTo(x + L / 3, y + 3, x + L * 2 / 3, y - 3, x + L, y + 1); g.stroke(); }
      g.fillStyle = "rgba(60,40,20,0.35)"; g.fillRect(x, r * h / rows, 2, h / rows); x += L; } g.fillStyle = "rgba(60,40,20,0.3)"; g.fillRect(0, r * h / rows, w, 2); } }, [5, 5]);
  T.tile = ctex(256, 256, (g, w, h) => { g.fillStyle = "#d9d2c6"; g.fillRect(0, 0, w, h); const tw = w / 2, th = h / 4;
    for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) { const x = c * tw + (r % 2 ? tw / 2 : 0), y = r * th; const gr = g.createLinearGradient(x, y, x, y + th); gr.addColorStop(0, "#fbf8f2"); gr.addColorStop(1, "#ede6da"); g.fillStyle = gr;
      g.beginPath(); g.roundRect(x + 3, y + 3, tw - 6, th - 6, 6); g.fill(); } }, [6, 3]);
  T.plaster = ctex(256, 256, (g, w, h) => { g.fillStyle = "#efe7da"; g.fillRect(0, 0, w, h); speck(g, w, h, 1800, "rgba(150,130,100,A)", 0.08, 2); speck(g, w, h, 900, "rgba(255,255,255,A)", 0.2, 2); }, [4, 2]);
  T.board = ctex(256, 256, (g, w, h) => { g.fillStyle = "#d9a86f"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(${rnd() < .5 ? "150,95,45" : "240,200,150"},${0.12 + rnd() * 0.15})`; g.fillRect(0, i * h / 9, w, h / 9); }
    for (let i = 0; i < 80; i++) { g.strokeStyle = `rgba(110,70,30,${0.06 + rnd() * 0.1})`; g.beginPath(); const y = rnd() * h; g.moveTo(0, y); g.bezierCurveTo(w / 3, y + 4, w * 2 / 3, y - 4, w, y + 2); g.stroke(); }
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(80,50,20,${0.05 + rnd() * 0.07})`; const x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - .5) * 6, y + 14 + rnd() * 20); g.stroke(); } });
  T.sky = ctex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#9cc6e6"); gr.addColorStop(0.62, "#e6eff2"); gr.addColorStop(0.63, "#a9c08e"); gr.addColorStop(1, "#7c9a66"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const x = rnd() * w, y = h * 0.6 - rnd() * 18, r = 14 + rnd() * 26; const c = g.createRadialGradient(x, y, 0, x, y, r); c.addColorStop(0, "rgba(95,135,85,0.95)"); c.addColorStop(1, "rgba(95,135,85,0)"); g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    for (let i = 0; i < 5; i++) { const x = rnd() * w, y = 20 + rnd() * 70; g.fillStyle = "rgba(255,255,255,0.55)"; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + k * 9 - 18, y + Math.sin(k) * 3, 16, 7, 0, 0, TAU); g.fill(); } } });
  T.night = ctex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0d1a33"); gr.addColorStop(0.62, "#24365a"); gr.addColorStop(0.63, "#16231c"); gr.addColorStop(1, "#0e1611"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    speck(g, w, h * 0.55, 90, "rgba(255,255,240,A)", 0.9, 0.7); g.fillStyle = "#f4efd8"; g.beginPath(); g.arc(w * 0.75, h * 0.18, 10, 0, TAU); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(255,206,120,0.85)"; g.fillRect(rnd() * w, h * 0.58 + rnd() * 8, 3, 3); } });
  T.knit = ctex(64, 64, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) { g.fillStyle = (x + y) % 8 ? "#9a9a9a" : "#666"; g.fillRect(x, y, 3, 3); } }, [6, 6], false);
  T.straw = ctex(128, 128, (g, w, h) => { g.fillStyle = "#c8202c"; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,0.08)"); gr.addColorStop(1, "rgba(80,0,0,0.25)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 11) for (let x = (y % 22) ? 4 : 9; x < w; x += 11) { g.fillStyle = "#f2d06a"; g.beginPath(); g.ellipse(x, y, 1.6, 2.4, 0, 0, TAU); g.fill(); g.fillStyle = "rgba(90,0,0,0.35)"; g.beginPath(); g.ellipse(x, y + 2, 2.4, 1.2, 0, 0, TAU); g.fill(); } });
  T.strawCut = ctex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.55, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, "#fbe6e6"); gr.addColorStop(0.45, "#f28a92"); gr.addColorStop(0.85, "#d42a38"); gr.addColorStop(1, "#b81424"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  T.carrot = ctex(128, 64, (g, w, h) => { g.fillStyle = "#e8761e"; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(150,60,0,${0.15 + rnd() * 0.2})`; g.lineWidth = 1; const x = rnd() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (rnd() - .5) * 4, h); g.stroke(); } for (let i = 0; i < 18; i++) { g.strokeStyle = "rgba(160,70,10,0.35)"; const y = rnd() * h, x = rnd() * w; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y); g.stroke(); } });
  T.coin = ctex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, "#f7b25a"); gr.addColorStop(0.42, "#f3a043"); gr.addColorStop(0.5, "#e57d1e"); gr.addColorStop(1, "#e06f12"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  T.bananaCoin = ctex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2); gr.addColorStop(0, "#efe2b6"); gr.addColorStop(0.3, "#f6edcf"); gr.addColorStop(0.95, "#f3e8c4"); gr.addColorStop(1, "#e8d79a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const a = i * TAU / 3; g.fillStyle = "rgba(150,120,70,0.5)"; g.beginPath(); g.arc(w / 2 + Math.cos(a) * 5, h / 2 + Math.sin(a) * 5, 1.4, 0, TAU); g.fill(); } });
  T.pancakeTop = ctex(256, 256, (g, w, h) => { g.fillStyle = "#efd9a2"; g.fillRect(0, 0, w, h); speck(g, w, h, 900, "rgba(200,160,90,A)", 0.25, 1.5); });
  T.pancakeBubbles = ctex(256, 256, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { const x = rnd() * w, y = rnd() * h, r = 1.5 + rnd() * 3.5; if (Math.hypot(x - w / 2, y - h / 2) > w * 0.47) continue; g.fillStyle = `rgb(${Math.floor(120 + rnd() * 135)},0,0)`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }, null, false);
  T.pancakeBrown = ctex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); gr.addColorStop(0, "#a8622a"); gr.addColorStop(0.7, "#bb7535"); gr.addColorStop(0.92, "#d49a56"); gr.addColorStop(1, "#e2b878"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const x = rnd() * w, y = rnd() * h; g.fillStyle = `rgba(${rnd() < 0.5 ? "120,60,20" : "220,170,100"},${0.15 + rnd() * 0.25})`; g.beginPath(); g.arc(x, y, 1 + rnd() * 5, 0, TAU); g.fill(); } });
  T.yolk = ctex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(w * 0.4, h * 0.35, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, "#ffd36b"); gr.addColorStop(1, "#f29b12"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  T.shell = ctex(128, 128, (g, w, h) => { g.fillStyle = "#f3e7d3"; g.fillRect(0, 0, w, h); speck(g, w, h, 500, "rgba(170,130,90,A)", 0.18, 0.8); });
  T.tomato = ctex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, "#c8281c"); gr.addColorStop(1, "#a5180f"); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${rnd() < .5 ? "255,140,90" : "120,10,0"},0.18)`; g.beginPath(); g.arc(rnd() * w, rnd() * h, 3 + rnd() * 10, 0, TAU); g.fill(); } }, [2, 2]);
  T.dough = ctex(128, 128, (g, w, h) => { g.fillStyle = "#f1e1c0"; g.fillRect(0, 0, w, h); speck(g, w, h, 700, "rgba(190,160,110,A)", 0.25, 1.2); speck(g, w, h, 300, "rgba(255,255,255,A)", 0.6, 1.5); }, [2, 2]);
  T.crust = ctex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w / 2); gr.addColorStop(0, "#e0b46c"); gr.addColorStop(0.85, "#c78838"); gr.addColorStop(1, "#9b5c20"); g.fillStyle = gr; g.fillRect(0, 0, w, h); speck(g, w, h, 600, "rgba(120,60,20,A)", 0.3, 2); });
  T.sauce = ctex(128, 128, (g, w, h) => { g.fillStyle = "#b8261a"; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${rnd() < .5 ? "230,90,50" : "110,15,5"},${0.15 + rnd() * 0.2})`; g.beginPath(); g.arc(rnd() * w, rnd() * h, 2 + rnd() * 7, 0, TAU); g.fill(); } speck(g, w, h, 40, "rgba(60,110,40,A)", 0.6, 1.4); }, [2, 2]);
  T.cheese = ctex(64, 64, (g, w, h) => { g.fillStyle = "#f2d78a"; g.fillRect(0, 0, w, h); speck(g, w, h, 40, "rgba(200,160,70,A)", 0.4, 1.5); });
  T.liner = ctex(256, 32, (g, w, h) => { for (let x = 0; x < w; x++) { const c = 205 + 40 * Math.cos(x / w * TAU * 24); g.fillStyle = `rgb(${c},${c * 0.93},${c * 0.82})`; g.fillRect(x, 0, 1, h); } }, [1, 1]);
  T.muffin = ctex(128, 128, (g, w, h) => { g.fillStyle = "#c98a45"; g.fillRect(0, 0, w, h); speck(g, w, h, 500, "rgba(110,60,20,A)", 0.3, 2); speck(g, w, h, 300, "rgba(240,200,140,A)", 0.4, 2); speck(g, w, h, 14, "rgba(50,40,110,A)", 0.9, 4); });
  T.batter = ctex(128, 128, (g, w, h) => { g.fillStyle = "#ecd7a4"; g.fillRect(0, 0, w, h); speck(g, w, h, 400, "rgba(200,170,110,A)", 0.25, 1.5); });
  T.granola = ctex(128, 128, (g, w, h) => { g.fillStyle = "#b5824a"; g.fillRect(0, 0, w, h); speck(g, w, h, 600, "rgba(90,50,15,A)", 0.5, 3); speck(g, w, h, 300, "rgba(240,210,150,A)", 0.5, 2.5); });
  T.foam = ctex(64, 64, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); speck(g, w, h, 200, "rgba(200,220,235,A)", 0.5, 2); });
  T.water = ctex(128, 128, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 20; const c = g.createRadialGradient(x, y, 0, x, y, r); c.addColorStop(0, "rgba(255,255,255,0.25)"); c.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = c; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, [3, 3], false);
  T.steel = ctex(256, 64, (g, w, h) => { g.fillStyle = "#9a9a9a"; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.strokeStyle = `rgba(${rnd() < .5 ? "255,255,255" : "40,40,40"},0.12)`; const y = rnd() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (rnd() - 0.5)); g.stroke(); } }, [1, 1], false);
  T.cloth = ctex(128, 128, (g, w, h) => { g.fillStyle = "#f4efe6"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(63,107,82,0.55)"; for (let i = 0; i < 4; i++) { g.fillRect(0, 10 + i * 30, w, 5); g.fillRect(10 + i * 30, 0, 5, h); } }, [1, 1]);
  T.colander = ctex(128, 64, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#000"; for (let y = 8; y < h - 6; y += 8) for (let x = (y % 16) ? 4 : 8; x < w; x += 8) { g.beginPath(); g.arc(x, y, 2, 0, TAU); g.fill(); } }, [1, 1], false);
  T.grater = ctex(64, 128, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#000"; for (let y = 10; y < h - 8; y += 9) for (let x = (y % 18) ? 6 : 11; x < w - 4; x += 10) { g.beginPath(); g.ellipse(x, y, 2.6, 1.8, 0, 0, TAU); g.fill(); } }, [1, 1], false);
  T.jugLines = ctex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(190,40,30,0.95)"; for (let i = 1; i < 8; i++) { const y = h - i * h / 8.5; g.fillRect(w * 0.42, y, i % 2 ? w * 0.08 : w * 0.16, 2); } }, [1, 1]);

  /* ── materials: one for each kind of thing ── */
  const Phys = phone ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial;
  const M = {};
  const mat = (k, o, P) => track(M[k] = new (P || THREE.MeshStandardMaterial)(Object.assign({ roughness: 0.6, metalness: 0 }, o)));
  mat("quartz", { map: T.quartz, roughness: 0.32, envMapIntensity: 0.9 }, Phys); if (M.quartz.clearcoat != null) { M.quartz.clearcoat = 0.5; M.quartz.clearcoatRoughness = 0.25; }
  mat("cabinet", { color: 0x8fa58e, roughness: 0.55 }); mat("cabinetDk", { color: 0x7b9179, roughness: 0.6 });
  mat("handle", { color: 0xc9a46a, roughness: 0.28, metalness: 0.9 });
  mat("floor", { map: T.floor, roughness: 0.55 }); mat("wall", { map: T.plaster, roughness: 0.92 }); mat("tile", { map: T.tile, roughness: 0.25, envMapIntensity: 0.8 });
  mat("woodTop", { map: T.wood, roughness: 0.5 }); mat("shelf", { map: T.wood, roughness: 0.55, color: 0xe2c9a6 });
  mat("steel", { color: 0xd4d6d8, roughness: 0.22, metalness: 1, roughnessMap: T.steel, envMapIntensity: 1.1 });
  mat("steelDk", { color: 0x9da2a8, roughness: 0.3, metalness: 1 });
  mat("chrome", { color: 0xe8eaec, roughness: 0.08, metalness: 1, envMapIntensity: 1.3 });
  mat("glassTop", { color: 0x111214, roughness: 0.08, metalness: 0.1, envMapIntensity: 1.2 }, Phys); if (M.glassTop.clearcoat != null) { M.glassTop.clearcoat = 1; M.glassTop.clearcoatRoughness = 0.05; }
  mat("ring", { color: 0x2a2a2c, roughness: 0.4, emissive: 0xff3a10, emissiveIntensity: 0 });
  mat("ovenGlass", { color: 0x1a1c20, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.82, envMapIntensity: 1.3 });
  mat("enamel", { color: 0x2c2e33, roughness: 0.5 }); mat("ovenGlow", { color: 0x332211, emissive: 0xffa24a, emissiveIntensity: 0 });
  mat("sky", { map: T.sky, roughness: 1, metalness: 0, emissive: 0xffffff, emissiveMap: T.sky, emissiveIntensity: 0.9 });
  mat("frame", { color: 0xf6f2ea, roughness: 0.5 }); mat("glass", { color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.12, envMapIntensity: 1.5 });
  mat("ceramic", { color: 0xf7f3ec, roughness: 0.18, envMapIntensity: 1 }, Phys); if (M.ceramic.clearcoat != null) { M.ceramic.clearcoat = 0.8; M.ceramic.clearcoatRoughness = 0.15; }
  mat("ceramicSage", { color: 0x9db7a3, roughness: 0.22 }, Phys); if (M.ceramicSage.clearcoat != null) { M.ceramicSage.clearcoat = 0.7; M.ceramicSage.clearcoatRoughness = 0.2; }
  mat("board", { map: T.board, roughness: 0.62 });
  mat("blade", { color: 0xdfe3e7, roughness: 0.16, metalness: 1, envMapIntensity: 1.3 });
  mat("knifeHandle", { color: 0x2b211b, roughness: 0.45 }); mat("rivet", { color: 0xd8d8d8, roughness: 0.2, metalness: 1 });
  mat("woodTool", { map: T.wood, color: 0xf0d6b0, roughness: 0.6 });
  mat("silicone", { color: 0xc8553d, roughness: 0.55 }); mat("siliconeSage", { color: 0x5d8a6c, roughness: 0.55 });
  mat("nonstick", { color: 0x1d1e21, roughness: 0.38, metalness: 0.4, envMapIntensity: 0.9 }); mat("panOut", { color: 0x2c2d31, roughness: 0.35, metalness: 0.6 });
  mat("blackHandle", { color: 0x1a1a1b, roughness: 0.55 });
  mat("jug", { color: 0xffffff, roughness: 0.03, transparent: true, opacity: 0.22, envMapIntensity: 1.6, depthWrite: false }); mat("jugLines", { map: T.jugLines, transparent: true, roughness: 0.4, depthWrite: false });
  mat("mitt", { color: 0xc4573f, roughness: 0.95, map: T.knit }); mat("mittCuff", { color: 0xf0e8d8, roughness: 0.95 });
  mat("cloth", { map: T.cloth, roughness: 0.95, side: THREE.DoubleSide }); mat("towel", { color: 0xe9e2d4, roughness: 1, side: THREE.DoubleSide, map: T.knit });
  mat("sponge", { color: 0xf2cf4a, roughness: 1 }); mat("spongeTop", { color: 0x4e8a5a, roughness: 0.9 });
  mat("soap", { color: 0xeaf0e8, roughness: 0.15, transparent: true, opacity: 0.85 }, Phys); mat("pump", { color: 0x2f3236, roughness: 0.4 });
  mat("thermo", { color: 0xe9e4da, roughness: 0.3 }); mat("screen", { color: 0x2a3a2c, roughness: 0.2, emissive: 0x8fe0a0, emissiveIntensity: 0.25 });
  mat("plant", { color: 0x5f8d4e, roughness: 0.7, side: THREE.DoubleSide }); mat("pot2", { color: 0xd38a5b, roughness: 0.75 });
  mat("lampShade", { color: 0xf3ead9, roughness: 0.5, side: THREE.DoubleSide, emissive: 0xffd9a0, emissiveIntensity: 0 });
  mat("waterStream", { color: 0xdff2ff, roughness: 0.02, transparent: true, opacity: 0.55, envMapIntensity: 1.6, depthWrite: false }, Phys);
  mat("waterPool", { color: 0x9fc4d4, roughness: 0.04, transparent: true, opacity: 0.55, envMapIntensity: 1.4, normalMap: T.water, depthWrite: false });
  mat("lather", { color: 0xffffff, roughness: 0.4, map: T.foam });
  mat("steam", { color: 0xffffff, roughness: 1, transparent: true, opacity: 0.2, depthWrite: false });
  // food
  mat("flour", { color: 0xf6f1e6, roughness: 0.95 }); mat("sugar", { color: 0xfbfaf6, roughness: 0.5 }); mat("granola", { map: T.granola, roughness: 0.9 });
  mat("milk", { color: 0xfbfaf5, roughness: 0.2 }, Phys); mat("batter", { map: T.batter, roughness: 0.35, color: 0xffffff }, Phys);
  mat("eggWhite", { color: 0xf3f0e4, roughness: 0.1, transparent: true, opacity: 0.8 }, Phys); mat("yolk", { map: T.yolk, roughness: 0.15 }, Phys);
  if (M.yolk.clearcoat != null) { M.yolk.clearcoat = 1; M.yolk.clearcoatRoughness = 0.1; M.eggWhite.clearcoat = 1; M.batter.clearcoat = 0.4; }
  mat("beaten", { color: 0xf6c447, roughness: 0.2 }, Phys); mat("scrambled", { color: 0xf7d466, roughness: 0.55 });
  mat("shell", { map: T.shell, roughness: 0.55 }); mat("shellIn", { color: 0xf8f6ef, roughness: 0.7, side: THREE.BackSide });
  mat("straw", { map: T.straw, roughness: 0.3 }, Phys); mat("strawCut", { map: T.strawCut, roughness: 0.45 }); mat("calyx", { color: 0x4f8a2a, roughness: 0.6, side: THREE.DoubleSide });
  mat("banana", { color: 0xf2d24a, roughness: 0.45 }); mat("bananaTip", { color: 0x5a4220, roughness: 0.7 }); mat("bananaIn", { map: T.bananaCoin, roughness: 0.5 }); mat("bananaFlesh", { color: 0xf4ebc8, roughness: 0.5 });
  mat("apple", { color: 0xb81e22, roughness: 0.32 }, Phys); mat("appleIn", { color: 0xf6eccb, roughness: 0.5 }); mat("stem", { color: 0x5b4024, roughness: 0.8 });
  mat("grape", { color: 0x8dbb4c, roughness: 0.25 }, Phys); mat("blueberry", { color: 0x3a4278, roughness: 0.45 });
  mat("carrot", { map: T.carrot, roughness: 0.55 }); mat("carrotIn", { map: T.coin, roughness: 0.5 }); mat("leafTop", { color: 0x4f8a2a, roughness: 0.7 });
  mat("pepperRed", { color: 0xc4161a, roughness: 0.18 }, Phys); mat("pepperIn", { color: 0xe8e2c8, roughness: 0.5 });
  mat("onion", { color: 0xc89a5e, roughness: 0.5 }); mat("onionIn", { color: 0xf3efe0, roughness: 0.3, transparent: true, opacity: 0.95 });
  mat("garlic", { color: 0xf1eadc, roughness: 0.45 }); mat("broccoli", { color: 0x3f7a35, roughness: 0.85 }); mat("broccoliStem", { color: 0x8db06a, roughness: 0.6 });
  mat("tomato", { map: T.tomato, roughness: 0.2 }, Phys); mat("cheese", { map: T.cheese, roughness: 0.6 }); mat("basil", { color: 0x3f7f35, roughness: 0.5, side: THREE.DoubleSide });
  mat("butter", { color: 0xf6e3a0, roughness: 0.35 }); mat("oil", { color: 0xd9b54a, roughness: 0.05, transparent: true, opacity: 0.6 }, Phys);
  mat("pancakeTop", { map: T.pancakeTop, roughness: 0.6 }); mat("pancakeBrown", { map: T.pancakeBrown, roughness: 0.55 }); mat("pancakeSide", { color: 0xe8c98a, roughness: 0.6 });
  mat("dough", { map: T.dough, roughness: 0.65 }); mat("crust", { map: T.crust, roughness: 0.6 }); mat("sauce", { map: T.sauce, roughness: 0.25 }, Phys);
  mat("pasta", { color: 0xf0d48a, roughness: 0.4 }); mat("rice", { color: 0xfbf8ef, roughness: 0.7 }); mat("yogurt", { color: 0xfbf9f2, roughness: 0.3 }, Phys);
  mat("liner", { map: T.liner, roughness: 0.8, side: THREE.DoubleSide }); mat("muffin", { map: T.muffin, roughness: 0.75 });
  mat("vinegar", { color: 0xb46a3a, roughness: 0.05, transparent: true, opacity: 0.7 }, Phys); mat("dressing", { color: 0xd9b061, roughness: 0.2 }, Phys); mat("mustard", { color: 0xd8a425, roughness: 0.4 });
  mat("honey", { color: 0xd8901c, roughness: 0.05, transparent: true, opacity: 0.85 }, Phys); mat("soy", { color: 0x3a1c0c, roughness: 0.05 }, Phys);
  mat("salt", { color: 0xffffff, roughness: 0.3 }); mat("pepperGr", { color: 0x2a2420, roughness: 0.8 }); mat("generic", { color: 0x8aa860, roughness: 0.5 }); mat("genericIn", { color: 0xe7e1c0, roughness: 0.5 });
  mat("water", { color: 0xcfe5ee, roughness: 0.03, transparent: true, opacity: 0.5, envMapIntensity: 1.4, normalMap: T.water, depthWrite: false });
  mat("bubble", { color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.55, depthWrite: false });

  /* ── geometry helpers ── */
  const SEG = phone ? 20 : 36;
  const G = (g) => track(g);
  const lathe = (pts, seg, phi0, phiLen) => G(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg || SEG, phi0 || 0, phiLen || TAU));
  const rbox = (w, h, d, r, s) => G(new RoundedBoxGeometry(w, h, d, s || (phone ? 2 : 4), r));
  const cyl = (rt, rb, h, s, open) => G(new THREE.CylinderGeometry(rt, rb, h, s || SEG, 1, !!open));
  const sph = (r, ws, hs) => G(new THREE.SphereGeometry(r, ws || SEG, hs || Math.round((ws || SEG) * 0.7)));
  const tor = (R0, r, rs, ts, arc) => G(new THREE.TorusGeometry(R0, r, rs || 10, ts || SEG, arc || TAU));
  function tube(points, r, seg, rs, closed) { return G(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => V(p[0], p[1], p[2])), !!closed), seg || 32, r, rs || 10, !!closed)); }
  /* a tube whose radius changes along it (banana, carrot, faucet) */
  function sweep(points, rfn, seg, rs) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => V(p[0], p[1], p[2])));
    const n = seg || 40, m = rs || 18, fr = curve.computeFrenetFrames(n, false), pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) { const t = i / n, P = curve.getPointAt(t), r = rfn(t), N0 = fr.normals[i], B0 = fr.binormals[i];
      for (let j = 0; j <= m; j++) { const a = j / m * TAU, c = Math.cos(a), s = Math.sin(a); pos.push(P.x + r * (c * N0.x + s * B0.x), P.y + r * (c * N0.y + s * B0.y), P.z + r * (c * N0.z + s * B0.z)); uv.push(t, j / m); } }
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const a = i * (m + 1) + j, b = a + m + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return G(g);
  }
  const mesh = (g, m, cast, recv) => { const o = new THREE.Mesh(g, m); o.castShadow = cast !== false; o.receiveShadow = recv !== false; return o; };
  const grp = (...k) => { const g = new THREE.Group(); k.forEach(o => g.add(o)); return g; };
  const at = (o, x, y, z, rx, ry, rz) => { o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); return o; };

  /* ══ THE ROOM ══ */
  const room = new THREE.Group(); scene.add(room);
  const floor = mesh(G(new THREE.PlaneGeometry(9, 9)), M.floor, false, true); floor.rotation.x = -Math.PI / 2; room.add(floor);
  // the back wall behind the cook, with a big window
  const BACK = -1.75;
  const wallG = G(new THREE.PlaneGeometry(9, 3.2));
  const backWall = new THREE.Group(); room.add(backWall);
  { // the wall in pieces around the window opening (x −1.1 … 0.9, y 1.0 … 2.2)
    const piece = (x0, x1, y0, y1) => { const m = mesh(G(new THREE.PlaneGeometry(x1 - x0, y1 - y0)), M.wall, false, true); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, BACK); m.material = M.wall; backWall.add(m); };
    piece(-4.5, -1.1, 0, 3.2); piece(0.9, 4.5, 0, 3.2); piece(-1.1, 0.9, 0, 1.0); piece(-1.1, 0.9, 2.2, 3.2);
    const skyP = mesh(G(new THREE.PlaneGeometry(2.6, 1.6)), M.sky, false, false); skyP.position.set(-0.1, 1.6, BACK - 0.6); backWall.add(skyP);
    // a deep, rounded window frame and a sill
    const fr = (w, h, x, y) => { const m = mesh(rbox(w, h, 0.12, 0.02), M.frame); m.position.set(x, y, BACK - 0.02); backWall.add(m); };
    fr(2.1, 0.07, -0.1, 2.2); fr(2.1, 0.07, -0.1, 1.0); fr(0.07, 1.27, -1.12, 1.6); fr(0.07, 1.27, 0.92, 1.6); fr(0.045, 1.2, -0.1, 1.6); fr(2.0, 0.035, -0.1, 1.62);
    const sill = mesh(rbox(2.3, 0.04, 0.3, 0.015), M.quartz); sill.position.set(-0.1, 0.98, BACK + 0.1); backWall.add(sill);
    const gl = mesh(G(new THREE.PlaneGeometry(2.0, 1.15)), M.glass, false, false); gl.position.set(-0.1, 1.6, BACK - 0.05); backWall.add(gl);
    // herbs on the sill
    [-0.75, -0.45, 0.6].forEach((x, i) => { const pot = mesh(lathe([[0, 0], [0.055, 0], [0.065, 0.1], [0.07, 0.11], [0, 0.11]], 20), M.pot2); pot.position.set(x, 1.0, BACK + 0.12); backWall.add(pot);
      for (let k = 0; k < 9; k++) { const lf = mesh(sph(0.03, 10, 8), M.plant); lf.scale.set(0.5, 1.4, 0.18); const a = k / 9 * TAU + i; lf.position.set(x + Math.cos(a) * 0.035, 1.16 + (k % 3) * 0.03, BACK + 0.12 + Math.sin(a) * 0.035); lf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); backWall.add(lf); } });
  }
  // the back counter run under the window: cabinets and a wooden top
  { const run = mesh(rbox(4.2, 0.86, 0.6, 0.03), M.cabinetDk); run.position.set(-0.1, 0.43, BACK + 0.3 + 0.01); backWall.add(run);
    for (let i = 0; i < 7; i++) { const d = mesh(rbox(0.56, 0.7, 0.03, 0.02), M.cabinet); d.position.set(-1.9 + i * 0.6, 0.44, BACK + 0.62); backWall.add(d); const h = mesh(cyl(0.008, 0.008, 0.14, 10), M.handle); h.position.set(-1.9 + i * 0.6 + 0.2, 0.62, BACK + 0.65); backWall.add(h); }
    const top = mesh(rbox(4.3, 0.04, 0.66, 0.015), M.woodTop); top.position.set(-0.1, 0.88, BACK + 0.32); backWall.add(top);
    // tiles up the wall beside the window
    const tl = mesh(G(new THREE.PlaneGeometry(1.6, 1.3)), M.tile, false, true); tl.position.set(-2.0, 1.55, BACK + 0.005); backWall.add(tl);
    const tr = mesh(G(new THREE.PlaneGeometry(1.6, 1.3)), M.tile, false, true); tr.position.set(1.8, 1.55, BACK + 0.005); backWall.add(tr);
    // open shelves with jars and bowls
    [1.6, 2.0].forEach(y => { const s = mesh(rbox(1.3, 0.035, 0.24, 0.012), M.shelf); s.position.set(1.75, y, BACK + 0.14); backWall.add(s); });
    [[1.3, 1.62, 0.07, 0.16], [1.48, 1.62, 0.06, 0.12], [1.66, 1.62, 0.065, 0.2], [2.05, 1.62, 0.09, 0.06], [1.4, 2.02, 0.1, 0.07], [1.75, 2.02, 0.06, 0.18], [2.1, 2.02, 0.07, 0.13]].forEach(([x, y, r, h], i) => {
      const j = mesh(lathe([[0, 0], [r * 0.95, 0], [r, 0.01], [r, h * 0.85], [r * 0.7, h], [0, h]], 24), i % 3 ? M.ceramic : M.ceramicSage); j.position.set(x, y + 0.018, BACK + 0.14); backWall.add(j); });
    const crock = mesh(lathe([[0, 0], [0.07, 0], [0.075, 0.16], [0.07, 0.17], [0, 0.17]], 24), M.ceramicSage); crock.position.set(-1.9, 0.9, BACK + 0.3); backWall.add(crock);
    [[-0.02, 0.3, 0.1], [0.02, 0.32, -0.12], [0, 0.28, 0.02]].forEach(([dx, h, a]) => { const s = mesh(cyl(0.008, 0.01, h, 10), M.woodTool); s.position.set(-1.9 + dx, 0.9 + h / 2 + 0.05, BACK + 0.3); s.rotation.z = a; backWall.add(s); });
  }
  // side walls and the far wall (seen when walking around)
  const sideL = mesh(wallG, M.wall, false, true); sideL.position.set(3.2, 1.6, 0.7); sideL.rotation.y = -Math.PI / 2; room.add(sideL);
  const sideR = mesh(wallG, M.wall, false, true); sideR.position.set(-3.0, 1.6, 0.7); sideR.rotation.y = Math.PI / 2; room.add(sideR);
  const far = mesh(wallG, M.wall, false, true); far.position.set(0, 1.6, 3.6); far.rotation.y = Math.PI; room.add(far);
  { // a second window and a plant on the far wall
    const sp = mesh(G(new THREE.PlaneGeometry(1.2, 1.1)), M.sky, false, false); sp.position.set(-1.2, 1.65, 3.62); sp.rotation.y = Math.PI; room.add(sp);
    const fr2 = mesh(rbox(1.3, 1.2, 0.05, 0.02), M.frame); fr2.position.set(-1.2, 1.65, 3.64); room.add(fr2); sp.position.z = 3.6;
    const pot = mesh(lathe([[0, 0], [0.16, 0], [0.2, 0.35], [0.21, 0.37], [0, 0.37]], 24), M.pot2); pot.position.set(1.5, 0, 3.2); room.add(pot);
    for (let k = 0; k < 14; k++) { const lf = mesh(sph(0.12, 12, 8), M.plant); lf.scale.set(0.35, 1.5, 0.12); const a = k / 14 * TAU; lf.position.set(1.5 + Math.cos(a) * 0.12, 0.62 + (k % 4) * 0.08, 3.2 + Math.sin(a) * 0.12); lf.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6); room.add(lf); }
  }
  // pendant lamps over the island
  const shades = [];
  [0.2, -0.9].forEach(x => { const cord = mesh(cyl(0.004, 0.004, 0.8, 6), M.blackHandle, false, false); cord.position.set(x, 2.75, 0.62); room.add(cord);
    const sh = mesh(lathe([[0.02, 0.2], [0.06, 0.19], [0.14, 0.08], [0.17, 0.0], [0.168, -0.005]], 32), M.lampShade, false, false); sh.position.set(x, 2.15, 0.62); room.add(sh); shades.push(sh);
    const bulb = mesh(sph(0.04, 16, 12), M.lampShade, false, false); bulb.position.set(x, 2.17, 0.62); room.add(bulb); });

  /* ══ THE ISLAND ══ */
  const island = new THREE.Group(); room.add(island);
  const IX0 = -1.55, IX1 = 1.55, IZ0 = FRONT, IZ1 = 1.08, TH = 0.04;
  { // the cabinet body, built around the oven's opening so the oven is a real hollow you can see into
    const by0 = 0.1, by1 = TOP - TH, bz = (IZ0 + IZ1) / 2, bd = IZ1 - IZ0 - 0.1, ox0 = OVEN.x - OVEN.w / 2 - 0.02, ox1 = OVEN.x + OVEN.w / 2 + 0.02;
    const body = (x0, x1, y0, y1) => { const m = mesh(rbox(x1 - x0, y1 - y0, bd, 0.025), M.cabinetDk); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, bz); island.add(m); };
    body(IX0 + 0.04, ox0, by0, by1); body(ox1, IX1 - 0.04, by0, by1); body(ox0 - 0.01, ox1 + 0.01, OVEN.y1 + 0.005, by1); body(ox0 - 0.01, ox1 + 0.01, by0, OVEN.y0 - 0.005);
    // a drawer front over the oven, with a rounded bar
    { const d = mesh(rbox(OVEN.w + 0.03, by1 - OVEN.y1 - 0.11, 0.03, 0.02), M.cabinet); d.position.set(OVEN.x, (OVEN.y1 + 0.1 + by1) / 2, IZ0 + 0.035); island.add(d);
      const h = mesh(cyl(0.008, 0.008, 0.2, 10), M.handle); h.rotation.z = Math.PI / 2; h.position.set(OVEN.x, (OVEN.y1 + 0.1 + by1) / 2, IZ0 + 0.01); island.add(h); }
    const kick = mesh(rbox(IX1 - IX0 - 0.16, 0.1, IZ1 - IZ0 - 0.2, 0.02), M.blackHandle); kick.position.set(0, 0.05, (IZ0 + IZ1) / 2); island.add(kick);
    // doors and drawers on the cook's side (not where the oven is)
    [[-1.3, 0.5], [-0.75, 0.5], [-0.2, 0.5], [0.35, 0.36]].forEach(([x, w]) => {
      const d = mesh(rbox(w - 0.03, 0.5, 0.03, 0.02), M.cabinet); d.position.set(x, 0.38, IZ0 + 0.035); island.add(d);
      const dr = mesh(rbox(w - 0.03, 0.17, 0.03, 0.02), M.cabinet); dr.position.set(x, 0.75, IZ0 + 0.035); island.add(dr);
      const h1 = mesh(cyl(0.008, 0.008, 0.16, 10), M.handle); h1.rotation.z = Math.PI / 2; h1.position.set(x, 0.78, IZ0 + 0.01); island.add(h1);
      const h2 = mesh(cyl(0.008, 0.008, 0.14, 10), M.handle); h2.position.set(x + w / 2 - 0.08, 0.5, IZ0 + 0.01); island.add(h2); });
    // the counter top, in pieces around the sink opening and the cooktop
    const top = (x0, x1, z0, z1) => { const m = mesh(rbox(x1 - x0, TH, z1 - z0, 0.012), M.quartz); m.position.set((x0 + x1) / 2, TOP - TH / 2, (z0 + z1) / 2); island.add(m); return m; };
    const sx0 = SINK.x - SINK.w / 2, sx1 = SINK.x + SINK.w / 2, sz0 = SINK.z - SINK.d / 2, sz1 = SINK.z + SINK.d / 2;
    top(IX0, sx0 + 0.01, IZ0, IZ1); top(sx1 - 0.01, COOK.x0 + 0.01, IZ0, IZ1); top(COOK.x1 - 0.01, IX1, IZ0, IZ1);
    top(sx0, sx1, IZ0, sz0 + 0.01); top(sx0, sx1, sz1 - 0.01, IZ1);
    top(COOK.x0, COOK.x1, IZ0, COOK.z0 + 0.01); top(COOK.x0, COOK.x1, COOK.z1 - 0.01, IZ1);
    // a softly rounded front edge (the "bullnose") so nothing is a sharp line
    const nose = mesh(cyl(TH / 2, TH / 2, IX1 - IX0, 24), M.quartz); nose.rotation.z = Math.PI / 2; nose.position.set(0, TOP - TH / 2, IZ0 + 0.004); nose.scale.set(1, 1, 0.6); island.add(nose);
  }
  // the sink: a deep, brushed steel basin (seen from inside) and an arched faucet
  { const basin = mesh(rbox(SINK.w - 0.02, SINK.depth, SINK.d - 0.02, 0.05, 5), M.steel, false, true); basin.material = M.steel.clone(); basin.material.side = THREE.BackSide; track(basin.material);
    basin.position.set(SINK.x, TOP - SINK.depth / 2 + 0.004, SINK.z); island.add(basin);
    const drain = mesh(cyl(0.035, 0.035, 0.004, 24), M.chrome, false, false); drain.position.set(SINK.x, TOP - SINK.depth + 0.008, SINK.z + 0.04); island.add(drain);
    const rim = mesh(tor(1, 0.006, 8, 48), M.steelDk); rim.rotation.x = Math.PI / 2; rim.scale.set(SINK.w / 2 - 0.01, SINK.d / 2 - 0.01, 1); rim.position.set(SINK.x, TOP + 0.001, SINK.z); island.add(rim);
    const base = mesh(cyl(0.028, 0.032, 0.05, 24), M.chrome); base.position.set(SINK.x, TOP + 0.025, IZ1 - 0.13); island.add(base);
    const neck = mesh(sweep([[0, 0, 0], [0, 0.22, 0], [0, 0.34, -0.06], [0, 0.36, -0.2], [0, 0.3, -0.31], [0, 0.24, -0.33]], () => 0.014, 48, 14), M.chrome);
    neck.position.set(SINK.x, TOP + 0.04, IZ1 - 0.13); island.add(neck);
    const lever = mesh(cyl(0.006, 0.008, 0.11, 12), M.chrome); lever.position.set(SINK.x + 0.05, TOP + 0.09, IZ1 - 0.13); lever.rotation.z = -1.1; island.add(lever);
    // soap pump and a towel on the island's end
    const bottle = mesh(lathe([[0, 0], [0.035, 0], [0.04, 0.02], [0.04, 0.13], [0.02, 0.16], [0.012, 0.17], [0, 0.17]], 24), M.soap); bottle.position.set(SINK.x - 0.36, TOP, SINK.z - 0.1); island.add(bottle);
    const pump = mesh(cyl(0.008, 0.008, 0.04, 10), M.pump); pump.position.set(SINK.x - 0.36, TOP + 0.19, SINK.z - 0.1); island.add(pump);
    const nozzle = mesh(rbox(0.05, 0.012, 0.016, 0.005), M.pump); nozzle.position.set(SINK.x - 0.34, TOP + 0.21, SINK.z - 0.1); island.add(nozzle);
  }
  const water = new THREE.Group(); island.add(water);
  const stream = mesh(sweep([[0, 0, 0], [0, -0.1, 0], [0, -0.25, 0], [0, -0.42, 0]], t => 0.007 + 0.003 * t, 16, 12), M.waterStream, false, false);
  stream.position.set(SINK.x, TOP + 0.27, IZ1 - 0.13 - 0.33); water.add(stream);
  const pool = mesh(G(new THREE.CircleGeometry(1, 40)), M.waterPool, false, false); pool.rotation.x = -Math.PI / 2; pool.scale.set(0.09, 0.07, 1); pool.position.set(SINK.x, TOP - SINK.depth + 0.012, IZ1 - 0.46); water.add(pool);
  const splash = new THREE.InstancedMesh(sph(0.004, 8, 6), M.waterStream, 40); splash.position.copy(pool.position); water.add(splash);
  // the cooktop: black glass, four rings that glow when on
  const rings = {};
  { const glass = mesh(rbox(COOK.x1 - COOK.x0 + 0.02, 0.012, COOK.z1 - COOK.z0 + 0.02, 0.005), M.glassTop); glass.position.set((COOK.x0 + COOK.x1) / 2, TOP - 0.004, (COOK.z0 + COOK.z1) / 2); island.add(glass);
    [["pan", PAN.x, PAN.z, 0.1], ["pot", POT.x, POT.z, 0.085], ["bl", PAN.x, 0.8, 0.075], ["br", POT.x, 0.8, 0.09]].forEach(([k, x, z, r]) => {
      const mm = M.ring.clone(); track(mm); const g = new THREE.Group();
      const t1 = mesh(tor(r, 0.004, 6, 48), mm, false, false); t1.rotation.x = Math.PI / 2; g.add(t1);
      const t2 = mesh(tor(r * 0.62, 0.0035, 6, 40), mm, false, false); t2.rotation.x = Math.PI / 2; g.add(t2);
      const t3 = mesh(tor(r * 0.3, 0.003, 6, 30), mm, false, false); t3.rotation.x = Math.PI / 2; g.add(t3);
      g.position.set(x, TOP + 0.003, z); island.add(g); rings[k] = { g, m: mm };
    });
    const knobs = new THREE.Group(); [0, 1, 2, 3].forEach(i => { const kb = mesh(cyl(0.02, 0.022, 0.025, 20), M.steelDk); kb.rotation.x = Math.PI / 2; kb.position.set(COOK.x0 + 0.14 + i * 0.17, 0.83, IZ0 - 0.005); knobs.add(kb); }); island.add(knobs);
  }
  // the oven under the cooktop: the door opens on its bottom hinge; the rack slides out
  const oven = { door: new THREE.Group(), rack: new THREE.Group(), glowM: M.ovenGlow };
  { const cav = mesh(rbox(OVEN.w, OVEN.y1 - OVEN.y0, 0.5, 0.03), M.enamel.clone(), false, true); cav.material.side = THREE.BackSide; track(cav.material); cav.position.set(OVEN.x, (OVEN.y0 + OVEN.y1) / 2, FRONT + 0.31);   // just behind the door, never in front of it island.add(cav);
    const glow = mesh(G(new THREE.PlaneGeometry(OVEN.w - 0.1, 0.4)), M.ovenGlow, false, false); glow.position.set(OVEN.x, (OVEN.y0 + OVEN.y1) / 2, FRONT + 0.54); glow.rotation.y = Math.PI; island.add(glow);
    const face = mesh(rbox(OVEN.w + 0.06, 0.08, 0.03, 0.012), M.steelDk); face.position.set(OVEN.x, OVEN.y1 + 0.05, FRONT + 0.02); island.add(face);
    const panel = mesh(rbox(OVEN.w + 0.04, OVEN.y1 - OVEN.y0 + 0.02, 0.035, 0.02), M.steel); panel.position.set(0, (OVEN.y1 - OVEN.y0) / 2, -0.018); oven.door.add(panel);
    const win = mesh(rbox(OVEN.w - 0.16, (OVEN.y1 - OVEN.y0) * 0.5, 0.01, 0.02), M.ovenGlass, false, false); win.position.set(0, (OVEN.y1 - OVEN.y0) * 0.5, -0.037); oven.door.add(win);
    const bar = mesh(cyl(0.011, 0.011, OVEN.w - 0.1, 16), M.chrome); bar.rotation.z = Math.PI / 2; bar.position.set(0, OVEN.y1 - OVEN.y0 - 0.06, -0.075); oven.door.add(bar);
    [-1, 1].forEach(s => { const p = mesh(cyl(0.008, 0.008, 0.045, 10), M.chrome); p.rotation.x = Math.PI / 2; p.position.set(s * (OVEN.w / 2 - 0.08), OVEN.y1 - OVEN.y0 - 0.06, -0.052); oven.door.add(p); });
    oven.door.position.set(OVEN.x, OVEN.y0, FRONT + 0.005); island.add(oven.door);
    // the rack: a frame of thin rounded wires
    const rw = OVEN.w - 0.08, rd = 0.42; const wireG = cyl(0.003, 0.003, rd, 6);
    for (let i = 0; i <= 10; i++) { const w = mesh(wireG, M.chrome, false, false); w.rotation.x = Math.PI / 2; w.position.set(-rw / 2 + i * rw / 10, 0, 0); oven.rack.add(w); }
    [-rd / 2, 0, rd / 2].forEach(z => { const w = mesh(cyl(0.004, 0.004, rw, 6), M.chrome, false, false); w.rotation.z = Math.PI / 2; w.position.set(0, 0, z); oven.rack.add(w); });
    oven.rack.position.set(OVEN.x, OVEN.rackY, FRONT + 0.27); island.add(oven.rack);
  }
  // the cutting board (with a damp towel peeking out under it so it never slides)
  const board = mesh(rbox(BOARD.w, BOARD.h, BOARD.d, 0.01), M.board); board.position.set(BOARD.x, TOP + BOARD.h / 2 + 0.003, BOARD.z); island.add(board);
  const boardTowel = mesh(rbox(BOARD.w - 0.04, 0.004, BOARD.d + 0.02, 0.002), M.towel, false, true); boardTowel.position.set(BOARD.x, TOP + 0.002, BOARD.z); island.add(boardTowel);
  const BTOP = TOP + BOARD.h + 0.003;

  /* ══ THE COOK ══ */
  const fig = makeFigure({ outfit: "apron", quality: phone ? "phone" : "full", colors: { top: "#5d7f9c", apron: "#f1ebdf", pants: "#3b4252", cap: "#f6f3ec" } });
  scene.add(fig.root);
  fig.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const J = fig.bones;
  // where the palm anchor sits in each wrist's own space, and the hand's rest axes there (thumb T0, palm out N0)
  const H0 = {};
  ["L", "R"].forEach(S => { H0[S] = { T: V(0, 0, 1), N: V(S === "L" ? -1 : 1, 0, 0), sgn: S === "R" ? 1 : -1 }; });
  /* a hand frame from its thumb direction T and palm-out direction N: X = thumb (right) or pinky side (left), Y = fingers, Z = palm out */
  const _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _v1 = V(0, 0, 0), _v2 = V(0, 0, 0);
  function frameRot(S, T, N, out) {
    const t = T.clone().normalize(), n = N.clone().addScaledVector(t, -N.dot(t)).normalize();
    const x = S === "R" ? t : t.clone().negate(), f = new THREE.Vector3().crossVectors(n, x);
    return (out || new THREE.Matrix4()).makeBasis(x, f, n);
  }
  const REST_FRAME = { R: frameRot("R", V(0, 0, 1), V(1, 0, 0)), L: frameRot("L", V(0, 0, 1), V(-1, 0, 0)) };
  const REST_INV = { R: REST_FRAME.R.clone().invert(), L: REST_FRAME.L.clone().invert() };
  /* the tool in a hand: a group whose frame is X = thumb, Z = palm out (both hands; no mirror), Y = Z × X */
  function toolFrame(T, N) { const t = T.clone().normalize(), n = N.clone().addScaledVector(t, -N.dot(t)).normalize(); return new THREE.Matrix4().makeBasis(t, new THREE.Vector3().crossVectors(n, t), n); }
  const gripObj = { R: new THREE.Group(), L: new THREE.Group() }; gripObj.R.matrixAutoUpdate = gripObj.L.matrixAutoUpdate = false; scene.add(gripObj.R, gripObj.L);

  /* ══ TOOLS ══ each tool is built with its handle at the origin, the handle along +x (toward the thumb), palm side −z */
  const TOOL = {};
  function tool(id, obj, home, hold) { obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); obj.visible = false; scene.add(obj); TOOL[id] = { obj, home, hold: hold || new THREE.Matrix4() }; return obj; }
  const holdM = (x, y, z, rx, ry, rz) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0, "XYZ")), V(1, 1, 1));
  const homeAt = (x, y, z, ry, rz, rx) => ({ pos: V(x, y, z), rot: new THREE.Euler(rx || 0, ry || 0, rz || 0, "YXZ") });
  { // chef's knife: blade toward +x, edge toward −y; handle at the origin
    const k = new THREE.Group();
    const sh = new THREE.Shape(); sh.moveTo(0, 0.004); sh.lineTo(0.17, 0.004); sh.quadraticCurveTo(0.2, 0.0, 0.215, -0.018); sh.quadraticCurveTo(0.12, -0.044, 0.01, -0.042); sh.quadraticCurveTo(0.0, -0.03, 0, 0.004);
    const bg = G(new THREE.ExtrudeGeometry(sh, { depth: 0.0016, bevelEnabled: true, bevelThickness: 0.0007, bevelSize: 0.0012, bevelSegments: 2, curveSegments: 16 })); bg.translate(0, 0, -0.0008);
    const blade = mesh(bg, M.blade); blade.position.set(0.055, 0.016, 0); k.add(blade);
    const bol = mesh(cyl(0.012, 0.011, 0.012, 16), M.blade); bol.rotation.z = Math.PI / 2; bol.scale.set(1, 1, 0.55); bol.position.set(0.052, 0.002, 0); k.add(bol);
    const hd = mesh(lathe([[0, -0.058], [0.009, -0.057], [0.0115, -0.05], [0.0125, -0.02], [0.011, 0.02], [0.0115, 0.04], [0.0095, 0.046], [0, 0.046]], 20), M.knifeHandle); hd.rotation.z = -Math.PI / 2; hd.scale.set(1, 1, 0.62); hd.position.set(0, 0.002, 0); k.add(hd);
    [-0.02, 0.012].forEach(x => { const r = mesh(cyl(0.0035, 0.0035, 0.016, 10), M.rivet); r.rotation.x = Math.PI / 2; r.position.set(x, 0.002, 0); k.add(r); });
    tool("knife", k, homeAt(-0.25, BTOP + 0.012, 0.42, Math.PI / 2 + 0.2, 0, Math.PI / 2), holdM(0, 0.004, 0.012));
    TOOL.knife.tip = V(0.27, -0.002, 0); TOOL.knife.edgeMid = V(0.17, -0.026, 0);
  }
  function longTool(id, headFn, len, mHandle, home, hold) {   // a handle along +x from the origin, a head at its end
    const t = new THREE.Group(); const h = mesh(lathe([[0, -0.05], [0.0105, -0.048], [0.012, -0.03], [0.011, 0.06], [0.009, len], [0, len]], 16), mHandle); h.rotation.z = -Math.PI / 2; t.add(h); headFn(t, len); return tool(id, t, home, hold);
  }
  // whisk: the wires go out of the pinky side (−x)
  { const w = new THREE.Group(); const hd = mesh(lathe([[0, 0], [0.012, 0.004], [0.0135, 0.05], [0.011, 0.11], [0.008, 0.115], [0, 0.115]], 18), M.siliconeSage); w.add(hd); hd.rotation.z = Math.PI / 2; hd.position.x = 0.05;
    const wires = new THREE.Group(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI; const loop = mesh(tube([[0, 0, 0], [0.024, 0.0, -0.06], [0.034, 0, -0.14], [0.0, 0, -0.19], [-0.034, 0, -0.14], [-0.024, 0, -0.06], [0, 0, 0]], 0.0011, 40, 5), M.chrome, false, false); loop.rotation.z = a; wires.add(loop); }
    wires.rotation.y = -Math.PI / 2; wires.position.x = -0.05; w.add(wires);
    tool("whisk", w, homeAt(0.26, TOP + 0.015, 0.66, 0.3, 0, Math.PI / 2), holdM(0, 0, 0.012)); TOOL.whisk.tip = V(-0.24, 0, 0); }
  // wooden spoon: the bowl goes out of the pinky side
  { const s = new THREE.Group(); const h = mesh(lathe([[0, 0], [0.007, 0.01], [0.0085, 0.12], [0.009, 0.2], [0.007, 0.22], [0, 0.22]], 14), M.woodTool); h.rotation.z = -Math.PI / 2; h.position.x = -0.08 + 0.22; s.add(h); h.rotation.z = Math.PI / 2; h.position.x = 0.1;
    const b = mesh(sph(0.03, 18, 12), M.woodTool); b.scale.set(1.25, 0.32, 0.85); b.position.set(-0.15, 0, 0); s.add(b);
    tool("spoon", s, homeAt(0.0, TOP + 0.012, 0.7, 0.1, 0, Math.PI / 2), holdM(0, 0, 0.011)); TOOL.spoon.tip = V(-0.17, 0, 0); }
  // silicone spatula
  { const s = new THREE.Group(); const h = mesh(cyl(0.007, 0.0085, 0.24, 14), M.woodTool); h.rotation.z = Math.PI / 2; h.position.x = 0.0; s.add(h);
    const head = mesh(rbox(0.075, 0.055, 0.009, 0.004, 3), M.silicone); head.position.set(-0.155, 0, 0); s.add(head);
    tool("spatula", s, homeAt(0.5, TOP + 0.012, 0.62, -0.3, 0, Math.PI / 2), holdM(0.02, 0, 0.011)); TOOL.spatula.tip = V(-0.19, 0, 0); }
  // turner: a thin slotted blade forward of the thumb
  { const s = new THREE.Group(); const h = mesh(lathe([[0, -0.06], [0.01, -0.058], [0.012, 0.04], [0.006, 0.06], [0, 0.06]], 14), M.blackHandle); h.rotation.z = -Math.PI / 2; s.add(h);
    const neck = mesh(cyl(0.004, 0.004, 0.08, 10), M.steel); neck.rotation.z = Math.PI / 2; neck.position.set(0.1, 0, 0); s.add(neck);
    const bl = mesh(rbox(0.11, 0.004, 0.085, 0.002, 2), M.steel); bl.position.set(0.19, -0.012, 0); bl.rotation.z = -0.25; s.add(bl);
    s.children.forEach(c => { if (c === bl) return; });
    tool("turner", s, homeAt(0.62, TOP + 0.012, 0.3, -0.5, 0, 0), holdM(0, 0, 0.012)); TOOL.turner.tip = V(0.24, -0.02, 0); }
  // peeler
  { const s = new THREE.Group(); const h = mesh(lathe([[0, -0.05], [0.011, -0.046], [0.012, 0.03], [0.008, 0.05], [0, 0.05]], 14), M.siliconeSage); h.rotation.z = -Math.PI / 2; s.add(h);
    const fr = mesh(tube([[0.05, 0, 0], [0.07, 0.016, 0], [0.11, 0.016, 0], [0.12, 0, 0]], 0.0025, 20, 6), M.steel); s.add(fr);
    const bl = mesh(rbox(0.06, 0.006, 0.012, 0.002, 2), M.blade); bl.position.set(0.09, 0.012, 0); s.add(bl);
    tool("peeler", s, homeAt(-0.24, TOP + 0.012, 0.62, 0.4, 0, Math.PI / 2), holdM(0, 0, 0.011)); }
  // dry measuring cup: the cup at the thumb end
  { const s = new THREE.Group(); const h = mesh(rbox(0.11, 0.006, 0.022, 0.003, 2), M.steel); s.add(h);
    const c = mesh(lathe([[0, 0], [0.036, 0], [0.042, 0.004], [0.046, 0.05], [0.047, 0.052], [0.044, 0.052], [0.043, 0.006], [0, 0.006]], 30), M.steel); c.position.set(0.1, -0.05, 0); s.add(c);
    const fill = mesh(lathe([[0, 0], [0.04, 0], [0.044, 0.04], [0.03, 0.05], [0, 0.053]], 26), M.flour); fill.position.set(0.1, -0.05, 0); s.add(fill); s.userData.fill = fill;
    tool("cups", s, homeAt(-0.16, TOP + 0.002, 0.66, 0.4, 0, 0), holdM(0, -0.002, 0.012)); TOOL.cups.cup = V(0.1, -0.05, 0); }
  // straight edge (a table knife)
  { const s = new THREE.Group(); const h = mesh(lathe([[0, -0.05], [0.007, -0.046], [0.008, 0.04], [0, 0.045]], 12), M.steel); h.rotation.z = -Math.PI / 2; s.add(h);
    const bl = mesh(rbox(0.11, 0.016, 0.003, 0.0015, 2), M.steel); bl.position.set(0.1, -0.004, 0); s.add(bl);
    tool("straight", s, homeAt(-0.3, TOP + 0.006, 0.62, 0.3, 0, Math.PI / 2), holdM(0, 0, 0.01)); }
  // liquid measuring jug (clear glass, red marks): the body sits out from the palm (+z), the handle in the fist
  { const s = new THREE.Group(); const prof = [[0, 0], [0.055, 0], [0.058, 0.004], [0.06, 0.11], [0.062, 0.115], [0.057, 0.115], [0.056, 0.006], [0, 0.006]];
    const body = mesh(lathe(prof, 32), M.jug, false, false); body.renderOrder = 3; s.add(body); body.position.set(0, -0.06, 0.08);
    const lines = mesh(cyl(0.0605, 0.0605, 0.1, 32, true), M.jugLines, false, false); lines.position.set(0, -0.005, 0.08); lines.rotation.y = -Math.PI / 2; s.add(lines);
    const h = mesh(tube([[0, 0.05, 0.022], [0, 0.055, 0.0], [0, 0.0, -0.01], [0, -0.05, 0.0], [0, -0.055, 0.022]], 0.008, 24, 8), M.jug, false, false); s.add(h);
    const liq = mesh(cyl(0.054, 0.054, 1, 30), M.milk, false, false); liq.position.set(0, -0.054, 0.08); s.add(liq); s.userData.liq = liq;
    s.rotation.set(0, 0, 0); // the handle's axis is x
    const wrap = new THREE.Group(); s.rotation.z = Math.PI / 2; wrap.add(s);
    tool("jug", wrap, homeAt(0.12, TOP + 0.06, 0.66, Math.PI, 0, -Math.PI / 2), holdM(0, 0, 0.014)); TOOL.jug.inner = s; }
  // rolling pin
  { const s = new THREE.Group(); const b = mesh(lathe([[0, -0.2], [0.02, -0.2], [0.028, -0.17], [0.03, 0], [0.028, 0.17], [0.02, 0.2], [0, 0.2]], 24), M.woodTool); b.rotation.z = Math.PI / 2; s.add(b);
    tool("pin", s, homeAt(0.0, TOP + 0.03, 0.72, 0, 0, 0), holdM(0, 0, 0.03)); }
  // box grater
  { const s = new THREE.Group(); const gm = M.steel.clone(); gm.alphaMap = T.grater; gm.alphaTest = 0.5; gm.side = THREE.DoubleSide; track(gm);
    const body = mesh(cyl(0.045, 0.065, 0.22, 4, true), gm); body.rotation.y = Math.PI / 4; body.position.y = 0.11; s.add(body);
    const top = mesh(tube([[-0.04, 0.22, 0], [-0.03, 0.27, 0], [0.03, 0.27, 0], [0.04, 0.22, 0]], 0.006, 20, 8), M.blackHandle); s.add(top);
    tool("grater", s, homeAt(0.05, BTOP, BOARD.z, 0, 0, 0)); }
  // food thermometer (a probe with a round dial body)
  { const s = new THREE.Group(); const body = mesh(rbox(0.04, 0.09, 0.02, 0.01), M.thermo); body.rotation.z = Math.PI / 2; s.add(body);
    const sc = mesh(rbox(0.026, 0.03, 0.004, 0.003), M.screen, false, false); sc.position.set(0.0, 0, 0.011); s.add(sc);
    const probe = mesh(cyl(0.0018, 0.0012, 0.13, 8), M.steel); probe.rotation.z = Math.PI / 2; probe.position.set(-0.11, 0, 0); s.add(probe);
    tool("thermo", s, homeAt(0.5, TOP + 0.012, 0.66, 0.3, 0, Math.PI / 2), holdM(0, 0, 0.012)); TOOL.thermo.tip = V(-0.175, 0, 0); }
  // oven mitts: soft quilted mittens that cover each hand
  const mitts = {};
  ["L", "R"].forEach(S => { const m = new THREE.Group(); const body = mesh(lathe([[0, -0.11], [0.03, -0.105], [0.05, -0.07], [0.055, 0.0], [0.05, 0.05], [0.035, 0.085], [0, 0.095]], 24), M.mitt); body.scale.set(1, 1, 0.62); body.rotation.z = Math.PI / 2; m.add(body);
    const th = mesh(sph(0.022, 14, 10), M.mitt); th.scale.set(1.6, 0.9, 0.9); th.position.set(0.03, S === "R" ? 0 : 0, 0.04); m.add(th);
    const cuff = mesh(cyl(0.05, 0.05, 0.04, 24, true), M.mittCuff); cuff.rotation.z = Math.PI / 2; cuff.scale.set(1, 1, 0.68); cuff.position.set(-0.12, 0, 0); m.add(cuff);
    m.traverse(o => { if (o.isMesh) o.castShadow = true; }); m.visible = false; scene.add(m); mitts[S] = m; });
  // dishcloth, sponge, towel, plate, glass
  { const c = mesh(rbox(0.16, 0.12, 0.012, 0.005, 2), M.cloth); tool("cloth", grp(c), homeAt(-0.4, TOP + 0.006, 0.55, 0.2, 0, -Math.PI / 2), holdM(0, 0.01, 0.022)); }   // flat under the palm
  { const s = grp(mesh(rbox(0.09, 0.03, 0.06, 0.01), M.sponge), at(mesh(rbox(0.09, 0.008, 0.06, 0.004), M.spongeTop), 0, 0.018, 0)); tool("sponge", s, homeAt(SINK.x + 0.36, TOP + 0.015, SINK.z + 0.22, 0.3), holdM(0, 0, -0.03)); }
  { const t = mesh(sweep([[0, 0, 0], [0.05, -0.08, 0], [0.04, -0.2, 0.02]], t => 0.03 - 0.005 * t, 16, 10), M.towel); t.scale.set(1, 1, 0.35); tool("towel", grp(t), homeAt(SINK.x - 0.42, TOP + 0.02, SINK.z - 0.1, 0, 0, 0)); TOOL.towel.obj.visible = true; }
  const plate = mesh(lathe([[0, 0], [0.1, 0], [0.105, 0.004], [0.14, 0.018], [0.145, 0.02], [0.14, 0.022], [0.1, 0.008], [0, 0.008]], 40), M.ceramic); plate.position.set(-0.3, TOP, 0.6); plate.visible = false; island.add(plate);

  /* ══ VESSELS: the bowl, the pan, the pot, the colander, the tin, the tray ══ */
  const bowl = new THREE.Group(); island.add(bowl); bowl.position.set(BOWL.x, TOP, BOWL.z);
  bowl.add(mesh(lathe([[0, 0.002], [0.05, 0], [0.085, 0.012], [0.112, 0.04], [0.125, 0.08], [0.128, 0.1], [0.122, 0.101], [0.117, 0.08], [0.105, 0.045], [0.08, 0.018], [0, 0.012]], 44), M.ceramicSage));
  const bowlFill = mesh(G(new THREE.CircleGeometry(1, 40)), M.batter, false, true); bowlFill.rotation.x = -Math.PI / 2; bowl.add(bowlFill);
  const bowlMound = mesh(sph(1, 28, 16), M.flour); bowlMound.scale.set(0.08, 0.03, 0.08); bowl.add(bowlMound);
  const smallBowl = mesh(lathe([[0, 0.002], [0.04, 0], [0.06, 0.012], [0.072, 0.045], [0.068, 0.046], [0.055, 0.016], [0, 0.01]], 32), M.ceramic); smallBowl.position.set(0.12, TOP, 0.58); island.add(smallBowl);
  const eggDish = new THREE.Group(); eggDish.position.set(-0.17, TOP, 0.62); island.add(eggDish);
  eggDish.add(mesh(lathe([[0, 0.002], [0.05, 0], [0.075, 0.01], [0.085, 0.03], [0.08, 0.031], [0.07, 0.014], [0, 0.009]], 32), M.ceramic));
  // the frying pan (handle turned in, toward +x and back)
  const pan = new THREE.Group(); island.add(pan); pan.position.set(PAN.x, TOP + 0.004, PAN.z);
  pan.add(mesh(lathe([[0, 0], [0.105, 0], [0.118, 0.006], [0.13, 0.035], [0.134, 0.042], [0.13, 0.043], [0.124, 0.038], [0.113, 0.01], [0, 0.007]], 48), M.nonstick));
  const panHandle = mesh(sweep([[0.125, 0.035, 0], [0.18, 0.045, 0], [0.3, 0.06, 0]], t => 0.011 - 0.002 * t, 16, 12), M.blackHandle); pan.add(panHandle);
  pan.rotation.y = -0.6; const PAN_HANDLE = V(0.25, 0.055, 0);
  const panFood = new THREE.Group(); pan.add(panFood);
  // the pot with its lid
  const pot = new THREE.Group(); island.add(pot); pot.position.set(POT.x, TOP + 0.004, POT.z);
  pot.add(mesh(lathe([[0, 0], [POT.r - 0.01, 0], [POT.r, 0.01], [POT.r, POT.h], [POT.r + 0.004, POT.h + 0.004], [POT.r - 0.004, POT.h], [POT.r - 0.006, 0.012], [0, 0.008]], 48), M.steel));
  [-1, 1].forEach(s => { const h = mesh(tor(0.022, 0.006, 8, 20, Math.PI), M.steelDk); h.position.set(s * (POT.r + 0.004), POT.h - 0.03, 0); h.rotation.set(0, s > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI / 2); h.rotation.set(Math.PI / 2, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2); pot.add(h); });
  pot.rotation.y = 0.0;
  const potLid = grp(mesh(lathe([[0, 0.035], [0.02, 0.034], [POT.r - 0.01, 0.006], [POT.r + 0.006, 0], [POT.r + 0.004, -0.004], [0, 0.03]], 40), M.steel), at(mesh(sph(0.016, 14, 10), M.blackHandle), 0, 0.045, 0));
  potLid.position.set(0, POT.h + 0.004, 0); pot.add(potLid);
  const potWater = mesh(G(new THREE.CircleGeometry(POT.r - 0.008, 40)), M.water, false, false); potWater.rotation.x = -Math.PI / 2; potWater.position.y = POT.h * 0.7; pot.add(potWater);
  const potSauce = mesh(G(new THREE.CircleGeometry(POT.r - 0.008, 40)), M.sauce, false, true); potSauce.rotation.x = -Math.PI / 2; potSauce.position.y = POT.h * 0.45; pot.add(potSauce);
  const bubbles = new THREE.InstancedMesh(sph(1, 10, 8), M.bubble, 40); bubbles.frustumCulled = false; scene.add(bubbles); bubbles.count = 0;
  const steam = new THREE.InstancedMesh(sph(1, 10, 8), M.steam, 14); steam.frustumCulled = false; scene.add(steam); steam.count = 0;
  // colander in the sink
  const colM = M.steel.clone(); colM.alphaMap = T.colander; colM.alphaTest = 0.5; colM.side = THREE.DoubleSide; track(colM);
  const colander = grp(mesh(lathe([[0.04, 0], [0.07, 0.01], [0.1, 0.05], [0.11, 0.09]], 36), colM), at(mesh(tor(0.11, 0.004, 6, 36), M.steelDk), 0, 0.09, 0));
  colander.children[1].rotation.x = Math.PI / 2; colander.position.set(SINK.x, TOP - SINK.depth + 0.01, SINK.z); island.add(colander);
  // muffin tin with paper cups, and a baking tray
  const tin = new THREE.Group(); scene.add(tin);
  tin.add(mesh(rbox(0.36, 0.03, 0.27, 0.012), M.panOut));
  const muffins = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -0.12 + c * 0.08, z = -0.08 + r * 0.08;
    const lin = mesh(lathe([[0, 0], [0.024, 0], [0.033, 0.034], [0.034, 0.035]], 24, 0, TAU), M.liner, false, true); lin.position.set(x, 0.0, z); tin.add(lin);
    const top = mesh(sph(0.033, 22, 14), M.batter); top.scale.set(1, 0.4, 1); top.position.set(x, 0.022, z); tin.add(top); muffins.push(top); }
  const tray = new THREE.Group(); scene.add(tray);
  tray.add(mesh(rbox(0.42, 0.014, 0.32, 0.008), M.steelDk));
  // dough (ball → kneaded → risen → rolled → pizza)
  const dough = mesh(sph(1, 40, 28), M.dough); dough.castShadow = true; scene.add(dough);
  const doughSauce = mesh(G(new THREE.CircleGeometry(1, 48)), M.sauce, false, true); doughSauce.rotation.x = -Math.PI / 2; scene.add(doughSauce);
  const doughCheese = new THREE.InstancedMesh(rbox(1, 1, 1, 0.3, 1), M.cheese, 120); doughCheese.castShadow = true; scene.add(doughCheese);
  // a pile of pieces and a glass for the parfait
  const glassCup = new THREE.Group(); scene.add(glassCup);
  glassCup.add(mesh(lathe([[0, 0], [0.04, 0], [0.042, 0.004], [0.045, 0.14], [0.042, 0.14], [0.039, 0.008], [0, 0.008]], 32), M.jug, false, false));
  const parfait = []; [M.yogurt, M.strawCut, M.granola, M.yogurt, M.blueberry, M.granola].forEach((m, i) => { const l = mesh(cyl(0.039, 0.039, 0.02, 28), m, false, false); l.position.y = 0.018 + i * 0.021; glassCup.add(l); parfait.push(l); });

  /* ══ FOOD ══ */
  const FOOD = {};
  // an egg: a real egg profile; it splits into two half-shells; a yolk and a soft white
  const eggProf = []; for (let i = 0; i <= 24; i++) { const t = i / 24, a = t * Math.PI; eggProf.push([Math.sin(a) * 0.0215 * (1 - 0.12 * Math.cos(a)), -Math.cos(a) * 0.029]); }
  const eggG = lathe(eggProf, 28);
  const halfProf = (lo) => eggProf.filter(p => lo ? p[1] <= 0.002 : p[1] >= -0.002);
  const eggHalfA = lathe(halfProf(true), 28), eggHalfB = lathe(halfProf(false), 28);
  const egg = { whole: mesh(eggG, M.shell), a: grp(mesh(eggHalfA, M.shell), mesh(eggHalfA, M.shellIn)), b: grp(mesh(eggHalfB, M.shell), mesh(eggHalfB, M.shellIn)),
    yolk: mesh(sph(0.0135, 24, 16), M.yolk), white: mesh(sph(1, 24, 12), M.eggWhite), crack: mesh(tor(0.0215, 0.0012, 4, 40), M.stem, false, false) };
  Object.values(egg).forEach(o => { o.visible = false; scene.add(o); });
  egg.crack.rotation.x = Math.PI / 2;
  const eggsWaiting = []; for (let i = 0; i < 3; i++) { const e = mesh(eggG, M.shell); e.rotation.z = Math.PI / 2; e.position.set(-0.02 + i * 0.025, 0.035, (i % 2) * 0.02 - 0.01); eggDish.add(e); eggsWaiting.push(e); }
  const yolksInBowl = []; for (let i = 0; i < 4; i++) { const y = mesh(sph(0.0135, 20, 12), M.yolk); y.scale.y = 0.6; bowl.add(y); yolksInBowl.push(y); }
  /* produce: built along +x, lying on its side on the board */
  function produce(kind) {
    const g = new THREE.Group(); let len = 0.1, rad = 0.02, skin = M.generic, flesh = M.genericIn, coinM = M.genericIn, pieceM = M.genericIn;
    if (kind === "carrot" || kind === "cucumber") { len = 0.19; rad = 0.016; skin = M.carrot; coinM = M.carrotIn; pieceM = M.carrotIn; flesh = M.carrotIn;
      g.add(mesh(sweep([[-0.095, 0, 0], [-0.03, 0.001, 0], [0.04, 0.0, 0], [0.095, -0.002, 0]], t => 0.016 * (0.25 + 0.75 * Math.pow(Math.sin(Math.min(1, t * 1.15) * Math.PI / 2 + 0.0001), 0.35)) * (1 - 0.65 * t * t), 40, 18), skin));
      const top = mesh(cyl(0.01, 0.012, 0.012, 14), M.leafTop); top.rotation.z = Math.PI / 2; top.position.x = -0.098; g.add(top);
    } else if (kind === "banana") { len = 0.18; rad = 0.018; skin = M.banana; coinM = M.bananaIn; pieceM = M.bananaFlesh; flesh = M.bananaFlesh;
      g.add(mesh(sweep([[-0.09, 0.012, 0], [-0.04, 0.0, 0], [0.03, 0.0, 0], [0.09, 0.016, 0]], t => 0.018 * Math.pow(Math.sin(t * Math.PI), 0.4), 36, 18), skin));
      const tip = mesh(cyl(0.004, 0.006, 0.02, 10), M.bananaTip); tip.rotation.z = Math.PI / 2 + 0.3; tip.position.set(-0.098, 0.016, 0); g.add(tip);
    } else if (kind === "strawberry") { len = 0.045; rad = 0.019; skin = M.straw; flesh = M.strawCut; coinM = M.strawCut; pieceM = M.strawCut;
      const b = mesh(lathe([[0, -0.026], [0.008, -0.022], [0.015, -0.012], [0.019, 0.002], [0.017, 0.012], [0.009, 0.017], [0, 0.017]], 24), skin); b.rotation.z = Math.PI / 2; g.add(b);
      const cx = mesh(G(new THREE.CircleGeometry(0.016, 7)), M.calyx); cx.rotation.y = Math.PI / 2; cx.position.x = -0.018; g.add(cx);
    } else if (kind === "apple" || kind === "tomato" || kind === "onion" || kind === "bellpepper" || kind === "potato" || kind === "lemon" || kind === "generic") {
      const P = { apple: [0.04, M.apple, M.appleIn], tomato: [0.036, M.tomato, M.strawCut], onion: [0.038, M.onion, M.onionIn], bellpepper: [0.042, M.pepperRed, M.pepperIn], potato: [0.04, M.onion, M.appleIn], lemon: [0.03, M.butter, M.butter], generic: [0.035, M.generic, M.genericIn] }[kind];
      rad = P[0]; len = rad * 2; skin = P[1]; flesh = P[2]; coinM = flesh; pieceM = flesh;
      const r = rad; const prof = kind === "apple" ? [[0, -r * 0.82], [r * 0.45, -r * 0.9], [r * 0.9, -r * 0.55], [r, 0], [r * 0.88, r * 0.62], [r * 0.45, r * 0.86], [r * 0.12, r * 0.72], [0, r * 0.66]]
        : kind === "onion" ? [[0, -r * 0.9], [r * 0.6, -r * 0.75], [r, -r * 0.1], [r * 0.85, r * 0.55], [r * 0.3, r * 0.95], [0.003, r * 1.25], [0, r * 1.25]]
        : kind === "bellpepper" ? [[0, -r * 0.8], [r * 0.7, -r * 0.92], [r, -r * 0.4], [r * 0.98, r * 0.5], [r * 0.7, r * 0.9], [r * 0.15, r * 0.82], [0, r * 0.8]]
        : [[0, -r * 0.88], [r * 0.6, -r * 0.8], [r, -r * 0.1], [r * 0.95, r * 0.4], [r * 0.6, r * 0.82], [0, r * 0.86]];
      const lg = lathe(prof, 32);
      if (kind === "bellpepper") { const p = lg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.08 * Math.cos(a * 4); p.setX(i, x * k); p.setZ(i, z * k); } lg.computeVertexNormals(); }
      const b = mesh(lg, skin); b.rotation.z = -Math.PI / 2; g.add(b);
      if (kind === "apple" || kind === "bellpepper" || kind === "tomato") { const st = mesh(cyl(0.002, 0.003, 0.02, 8), kind === "apple" ? M.stem : M.leafTop); st.rotation.z = -Math.PI / 2; st.position.x = r * 0.8; g.add(st); }
    } else if (kind === "garlic") { rad = 0.02; len = 0.04; skin = M.garlic; flesh = M.garlic; coinM = M.garlic; pieceM = M.garlic;
      const b = mesh(lathe([[0, -0.016], [0.015, -0.013], [0.021, -0.002], [0.017, 0.012], [0.006, 0.02], [0.002, 0.026], [0, 0.026]], 24), skin); b.rotation.z = -Math.PI / 2; g.add(b);
    } else if (kind === "broccoli") { rad = 0.04; len = 0.1; skin = M.broccoli; flesh = M.broccoliStem; coinM = M.broccoli; pieceM = M.broccoli;
      const st = mesh(cyl(0.012, 0.016, 0.07, 14), M.broccoliStem); st.rotation.z = Math.PI / 2; st.position.x = 0.03; g.add(st);
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, f = mesh(sph(0.022, 12, 10), M.broccoli); f.position.set(-0.02 - Math.abs(Math.sin(a)) * 0.006, Math.cos(a) * 0.022, Math.sin(a) * 0.022); f.scale.set(0.9, 1, 1); g.add(f); }
      const c = mesh(sph(0.026, 12, 10), M.broccoli); c.position.x = -0.03; g.add(c);
    } else if (kind === "cheese") { rad = 0.025; len = 0.09; skin = M.cheese; flesh = M.cheese; coinM = M.cheese; pieceM = M.cheese; g.add(mesh(rbox(0.09, 0.05, 0.05, 0.006), skin));
    } else if (kind === "grape" || kind === "blueberry") { rad = 0.012; len = 0.06; skin = kind === "grape" ? M.grape : M.blueberry; flesh = skin; coinM = skin; pieceM = skin;
      for (let i = 0; i < 9; i++) { const b = mesh(sph(0.011, 14, 10), skin); b.position.set((i % 3) * 0.022 - 0.022, 0.0 + Math.floor(i / 3) * 0.004, (Math.floor(i / 3) - 1) * 0.02); b.scale.set(1, 1.15, 1); g.add(b); }
    }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return { g, len, rad, skin, flesh, coinM, pieceM, kind };
  }
  const produceCache = {};
  const getProduce = k => produceCache[k] || (produceCache[k] = (() => { const p = produce(k); p.g.visible = false; scene.add(p.g); return p; })());
  // the cut pieces: one instanced pile for each look (coin, cube, bit, wedge)
  const PIECES = {};
  function pieces(key, geo, m, n) { const im = new THREE.InstancedMesh(geo, m, n); im.castShadow = true; im.receiveShadow = true; im.count = 0; im.frustumCulled = false; scene.add(im); PIECES[key] = im; return im; }
  const coinG = cyl(1, 1, 1, 22), cubeG = rbox(1, 1, 1, 0.2, 2), bitG = sph(1, 8, 6), halfG = sph(1, 16, 10, ), stripG = rbox(1, 1, 1, 0.35, 2);
  const pieceMats = new Set();
  function pileFor(m, shape) { const key = m.uuid + shape; if (PIECES[key]) return PIECES[key]; pieceMats.add(key); return pieces(key, { coin: coinG, cube: cubeG, bit: bitG, half: halfG, strip: stripG }[shape], m, 160); }
  const _o3 = new THREE.Object3D();
  function putPieces(list) {   // list: [{m, shape, items:[[x,y,z, sx,sy,sz, rx,ry,rz]]}]
    Object.values(PIECES).forEach(im => { im.count = 0; });
    list.forEach(L => { const im = pileFor(L.m, L.shape); L.items.forEach(it => { if (im.count >= 160) return; _o3.position.set(it[0], it[1], it[2]); _o3.scale.set(it[3], it[4], it[5]); _o3.rotation.set(it[6] || 0, it[7] || 0, it[8] || 0); _o3.updateMatrix(); im.setMatrixAt(im.count++, _o3.matrix); }); im.instanceMatrix.needsUpdate = true; });
  }
  // a pancake: a soft disc; top and bottom can show raw batter, bubbles or golden brown
  const pancakeG = (() => { const pr = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pr.push([0.075 + 0.006 * Math.sin(a), 0.006 * (1 - Math.cos(a))]); } pr.unshift([0, 0]); const p2 = pr.slice().reverse().map(p => [p[0], 0.012 - p[1] * 0.0]); return null; })();
  const pcTop = mesh(G(new THREE.CircleGeometry(0.078, 48)), M.pancakeTop.clone(), false, true); track(pcTop.material); pcTop.material.emissiveMap = null;
  const pcBot = mesh(G(new THREE.CircleGeometry(0.078, 48)), M.pancakeBrown, false, true);
  const pcSide = mesh(G(new THREE.CylinderGeometry(0.078, 0.076, 0.012, 48, 1, true)), M.pancakeSide);
  const pancake = grp(at(pcTop, 0, 0.006, 0, -Math.PI / 2), at(pcBot, 0, -0.006, 0, Math.PI / 2), pcSide); pancake.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(pancake);
  const pancakeStack = new THREE.Group(); for (let i = 0; i < 3; i++) { const p = pancake.clone(); p.children[0].material = M.pancakeBrown; p.position.y = i * 0.013; p.rotation.y = i; pancakeStack.add(p); } scene.add(pancakeStack);
  // a stream of something pouring (milk, batter, oil): a soft tube we bend each frame
  const pourStream = mesh(sweep([[0, 0, 0], [0, -0.05, 0], [0, -0.1, 0]], () => 0.006, 12, 10), M.milk, false, false); scene.add(pourStream); pourStream.visible = false;
  function setStream(a, b, r, m) {
    const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(V(lerp(a.x, b.x, t * t * 0.3 + t * 0.7 * 0 + t * 0.3 + t * 0.7 * t), lerp(a.y, b.y, t), lerp(a.z, b.z, t * 0.6 + t * t * 0.4))); }
    const curve = new THREE.CatmullRomCurve3(pts); const g = new THREE.TubeGeometry(curve, 12, r, 10, false);
    pourStream.geometry.dispose(); pourStream.geometry = g; pourStream.material = m; pourStream.visible = true;
  }
  // falling bits (salt, flour dust, grated cheese) and soap lather on the hands
  const fallers = new THREE.InstancedMesh(sph(1, 6, 4), M.salt, 60); fallers.frustumCulled = false; fallers.count = 0; scene.add(fallers);
  const lather = new THREE.InstancedMesh(sph(1, 8, 6), M.lather, 70); lather.frustumCulled = false; lather.count = 0; scene.add(lather);
  const curds = new THREE.InstancedMesh(sph(1, 10, 8), M.scrambled, 70); curds.castShadow = true; curds.frustumCulled = false; curds.count = 0; scene.add(curds);
  const pastaStraight = tube([[0, 0, 0], [0, 0.12, 0], [0, 0.24, 0]], 0.0016, 12, 5);
  const spaghetti = new THREE.InstancedMesh(pastaStraight, M.pasta, 50); spaghetti.castShadow = true; spaghetti.frustumCulled = false; spaghetti.count = 0; scene.add(spaghetti);
  const noodleSoft = tube([[0, 0, 0], [0.03, 0.01, 0.02], [0.05, 0.015, -0.02], [0.02, 0.02, -0.05], [-0.03, 0.022, -0.03], [-0.05, 0.018, 0.02]], 0.0019, 24, 5);
  const noodles = new THREE.InstancedMesh(noodleSoft, M.pasta, 40); noodles.castShadow = true; noodles.frustumCulled = false; noodles.count = 0; scene.add(noodles);

  /* ══ STATE: what is where, step by step ══ */
  const STAND = { sink: { x: SINK.x, z: 0, yaw: 0 }, board: { x: 0.1, z: 0, yaw: 0 }, stove: { x: 0.92, z: 0, yaw: 0 }, oven: { x: 1.0, z: -0.47, yaw: 0 }, pot: { x: 1.08, z: 0, yaw: 0 } };
  const PRODUCE = ["strawberry", "banana", "apple", "grape", "blueberry", "carrot", "cucumber", "bellpepper", "broccoli", "onion", "garlic", "tomato", "potato", "lemon", "cheese"];
  const DEFAULT_ITEM = { chop: "carrot", slice: "cucumber", dice: "onion", mince: "garlic", peel: "carrot", grate: "cheese", rinse: "strawberry" };
  const LIQ_M = { milk: "milk", water: "water", oil: "oil", lemonjuice: "vinegar", vinegar: "vinegar", honey: "honey", soy: "soy", tomatosauce: "sauce", yogurt: "yogurt", egg: "beaten" };
  const DRY_M = { flour: "flour", sugar: "sugar", powder: "flour", salt: "salt", granola: "granola", spice: "pepperGr", mustard: "mustard", rice: "rice", pepper: "pepperGr", yogurt: "yogurt" };
  function blankState() { return { stand: "board", board: null, bowl: { kind: "empty", fill: 0, mix: 0, yolks: 0, pieces: [], m: "batter", lumps: 0 }, pan: { kind: null, cook: 0, flip: 0, pieces: [] },
    pot: { water: 0, heat: 0, pasta: 0, sauce: 0, lid: 1 }, panHeat: 0, dough: null, tin: null, plate: null, glass: 0, grated: 0, colander: null, stack: 0 }; }
  const clone = o => JSON.parse(JSON.stringify(o));
  let RC = null, states = [], plans = [];
  function stepItems(step) { return (step.ing || []).map(k => (RC.ing || []).find(i => i.k === k)).filter(Boolean); }
  function itemFor(step, id) { const it = stepItems(step).map(i => i.item).find(x => PRODUCE.includes(x)); return it || DEFAULT_ITEM[id] || "carrot"; }
  function liquidFor(step) { const it = stepItems(step).map(i => i.item).find(x => LIQ_M[x]); return it ? LIQ_M[it] : "milk"; }
  function dryFor(step) { const it = stepItems(step).map(i => i.item).find(x => DRY_M[x]); return it ? DRY_M[it] : "flour"; }
  const has = (step, t) => (step.tools || []).includes(t);
  const stoveStep = (step, s) => has(step, "pan") || has(step, "pot") || step.a.some(a => ["saute", "flip", "boil", "simmer"].includes(a));
  /* what each skill changes when it is done */
  const DONE = {
    "measure-dry": (s, st) => { const m = dryFor(st); if (s.bowl.kind === "empty" || s.bowl.kind === "dry") { s.bowl.kind = "dry"; s.bowl.m = m; } s.bowl.fill = Math.min(1, s.bowl.fill + 0.3); },
    "measure-liquid": (s, st) => { s.jug = liquidFor(st); },
    "pour": (s, st) => { const into = pourTarget(st, s);
      if (into === "pan") { const it = stepItems(st).map(i => i.item); if (s.bowl.kind === "batter" || it.includes("flour")) { s.pan.kind = "pancake"; s.pan.cook = 0; s.pan.flip = 0; } else if (s.bowl.kind === "beaten" || it.includes("egg")) { s.pan.kind = "eggs"; s.pan.cook = 0; s.bowl = blankState().bowl; } else if (it.includes("tomatosauce")) { s.pan.kind = "sauce"; } else s.pan.kind = s.pan.kind || "oil"; }
      else if (into === "pot") { if (stepItems(st).some(i => i.item === "tomatosauce")) s.pot.sauce = 1; else s.pot.water = 1; }
      else if (into === "tin") { s.tin = { fill: 1, baked: 0, at: "counter" }; s.bowl = blankState().bowl; }
      else if (into === "colander") { s.colander = s.pot.pasta ? "pasta" : "veg"; s.pot.pasta = 0; s.pot.water = 0; }
      else { const m = s.jug || liquidFor(st); if (s.bowl.kind === "empty") { s.bowl.kind = "wet"; s.bowl.m = m; } else if (s.bowl.kind === "dry") { s.bowl.kind = "wetdry"; } else if (s.bowl.kind === "fruit") { s.bowl.glaze = 1; }
        if (m === "oil" && s.bowl.m === "vinegar") s.bowl.kind = "dressing"; s.bowl.fill = Math.min(1, s.bowl.fill + 0.25); }
      s.jug = null; },
    "crack-egg": (s) => { if (s.bowl.kind === "empty" || s.bowl.kind === "eggs") s.bowl.kind = "eggs"; s.bowl.yolks = Math.min(4, s.bowl.yolks + 1); s.bowl.fill = Math.max(s.bowl.fill, 0.25); },
    "whisk": (s) => { const b = s.bowl; if (b.kind === "eggs" || b.yolks) { b.kind = b.kind === "dry" ? "dry" : "beaten"; b.yolks = 0; } if (b.kind === "dressing" || b.m === "vinegar") b.kind = "emulsion"; if (b.kind === "wetdry") b.kind = "batter"; b.mix = 1; b.fill = Math.max(b.fill, 0.3); },
    "stir": (s, st) => { if (stoveStep(st, s)) { if (s.pan.kind) s.pan.cook = Math.min(1, s.pan.cook + 0.5); if (s.pan.kind === "eggs") s.pan.kind = "scrambled"; if (s.pot.pasta) s.pot.pasta = Math.max(s.pot.pasta, 0.6); }
      else { if (s.bowl.kind === "wetdry" || s.bowl.kind === "dry" && s.bowl.fill > 0.4) s.bowl.kind = (s.dough || (RC && RC.id === "pizza-dough")) ? "dough" : "batter"; if (s.bowl.kind === "empty") { s.bowl.kind = "wet"; s.bowl.fill = 0.4; } s.bowl.mix = 1; } },
    "fold": (s) => { const b = s.bowl; if (b.pieces.length && b.kind !== "batter" && b.kind !== "wetdry") { b.kind = "fruit"; } else { b.kind = "batter"; b.lumps = 0.4; } b.mix = 1; },
    "chop": (s, st) => cutDone(s, st, "chop"), "slice": (s, st) => cutDone(s, st, "slice"), "dice": (s, st) => cutDone(s, st, "dice"), "mince": (s, st) => cutDone(s, st, "mince"),
    "peel": (s, st) => { s.board = { item: itemFor(st, "peel"), cut: 0, style: null, peeled: 1 }; },
    "grate": (s) => { s.grated = 1; },
    "knead": (s) => { s.dough = Object.assign(s.dough || { rise: 0, flat: 0, sauce: 0, cheese: 0, baked: 0 }, { where: "board", smooth: 1 }); if (s.bowl.kind === "dough") s.bowl = blankState().bowl; },
    "counter": (s, st) => { if (st.rise && s.dough) { s.dough.rise = 1; s.dough.where = "bowl"; } },
    "roll-dough": (s) => { s.dough = Object.assign(s.dough || { smooth: 1, rise: 1, sauce: 0, cheese: 0, baked: 0 }, { where: "tray", flat: 1 }); },
    "spread": (s) => { if (s.dough) s.dough.sauce = 1; },
    "season": (s, st) => { if (s.dough && s.dough.sauce && stepItems(st).some(i => i.item === "cheese")) s.dough.cheese = 1; },
    "flip": (s) => { if (s.pan.kind === "pancake") { s.pan.flip = 1; s.pan.cook = 1; } },
    "saute": (s, st) => { const prev = s.board && s.board.cut ? [s.board.item] : []; const it = stepItems(st).map(i => i.item).filter(x => PRODUCE.includes(x));
      s.pan.pieces = Array.from(new Set(s.pan.pieces.concat(prev, it))); if (s.board && s.board.cut) s.board = null;
      if (!s.pan.kind || s.pan.kind === "oil") s.pan.kind = s.pan.pieces.length ? "veg" : (stepItems(st).some(i => i.item === "butter") ? "butter" : "oil"); s.pan.cook = Math.min(1, s.pan.cook + 0.6); s.panHeat = 1; },
    "boil": (s, st) => { s.pot.water = 1; s.pot.heat = 1; s.pot.lid = 0; s.lidRest = LIDREST.toArray(); if (stepItems(st).some(i => i.item === "pasta")) s.pot.pasta = 1; },
    "simmer": (s, st) => { if (s.pan.kind === "sauce" || stepItems(st).some(i => i.item === "tomatosauce")) { s.pan.kind = "sauce"; s.pan.cook = 1; } else s.pot.heat = 0.5; },
    "bake": (s) => { if (s.dough && s.dough.flat) s.dough.baked = 1; else s.tin = { fill: 1, baked: 1, at: "counter" }; },
    "check-temp": () => {},
    "plate": (s, st) => { if (has(st, "glass")) { s.glass = 1; return; } s.plate = s.pan.kind === "pancake" ? "pancakes" : s.pan.kind ? s.pan.kind : s.pot.pasta || s.colander === "pasta" ? "pasta" : s.tin && s.tin.baked ? "muffins" : s.bowl.kind === "fruit" ? "fruit" : "generic";
      if (s.pan.kind === "pancake") { s.stack = 3; } s.pan = blankState().pan; s.panHeat = 0; s.pot.heat = 0; },
    "wipe-clean": () => {}, "wash-dishes": () => {}, "wash-hands": () => {}, "tie-hair": () => {}, "rinse": () => {}
  };
  function cutDone(s, st, style) {
    const item = itemFor(st, style);
    // what was cut before goes into the bowl (so the board is clear for the next food)
    if (s.board && s.board.cut && s.board.item !== item) { s.bowl.pieces.push([s.board.item, s.board.style]); if (s.bowl.kind === "empty") s.bowl.kind = "pieces"; }
    s.board = { item, cut: 1, style, peeled: s.board && s.board.item === item ? s.board.peeled : 0 };
  }
  function pourTarget(st, s) {
    if (has(st, "colander")) return "colander";
    if (has(st, "tin")) return "tin";
    if (has(st, "pan") || (s.pan.kind && stoveStep(st, s))) return "pan";
    if (has(st, "pot")) return "pot";
    return "bowl";
  }
  const STAND_OF = (id, st, s) => { const a = R.ACTIONS[id] ? R.ACTIONS[id].at : "board";
    if (id === "stir" || id === "season" || id === "pour" || id === "check-temp" || id === "plate") { if (stoveStep(st, s) || (id === "check-temp" && s.pan.kind)) return (has(st, "pot") && !has(st, "pan")) || (s.pot.pasta && !s.pan.kind) ? "pot" : "stove"; if (id === "check-temp" && s.tin) return "board"; return "board"; }
    if ((id === "boil" || id === "simmer") && !(id === "simmer" && (s.pan.kind === "sauce" || has(st, "pan")))) return "pot";
    if (id === "pour" && has(st, "colander")) return "sink";
    return a === "oven" ? "oven" : a; };
  function buildStates(rc) {
    RC = rc; states = []; plans = [];
    let s = blankState();
    rc.steps.forEach(st => {
      const before = clone(s); let t = 0; const seg = [];
      st.a.forEach(id => { const A = R.ACTIONS[id] || R.ACTIONS.counter; const stand = STAND_OF(id, st, s); seg.push({ id, t0: t, t1: t + A.secs, stand, from: s.stand, pre: clone(s) }); t += A.secs; (DONE[id] || (() => {}))(s, st); s.stand = stand; });
      states.push({ before, after: clone(s) }); plans.push({ seg, total: Math.max(1, t) });
    });
  }

  /* ══ THE CHOREOGRAPHY ══ Each skill: anim(c, u) with u 0 … 1 sets c.R and c.L (hands: G grip point, T thumb, N palm out,
     grip, tool), c.body (lean, crouch, turn), c.look, and changes c.s (what the food looks like at this moment). */
  const P = (x, y, z) => V(x, y, z);
  const DOWN = V(0, -1, 0), UP = V(0, 1, 0), FWD = V(0, 0, 1), BACKV = V(0, 0, -1), LEFT = V(1, 0, 0), RIGHT = V(-1, 0, 0);
  const rotY = (v, a) => v.clone().applyAxisAngle(UP, a);
  /* where the palm must be so that a point of a tool (in the tool's own space) lands on a point in the world */
  function gripFor(id, local, world, T, N) {
    const tf = toolFrame(T, N).multiply(TOOL[id].hold); const p = local.clone().applyMatrix4(tf);   // tf has no translation yet
    return world.clone().sub(p);
  }
  const KNIFE_GRIP = (tip, pitch, yaw) => {   // the knife's tip on the board; the handle raised by pitch (degrees); returns the hand
    const p = pitch * D2R, y = (yaw || 0) * D2R; const d = V(Math.sin(y) * Math.cos(p), -Math.sin(p), Math.cos(y) * Math.cos(p));
    const T = d.clone(), N = rotY(LEFT, y);
    return { G: gripFor("knife", TOOL.knife.tip, tip, T, N), T, N, grip: 0.92, tool: "knife" };
  };
  const TIP = (id, tipW, T, N, grip) => ({ G: gripFor(id, TOOL[id].tip || V(0, 0, 0), tipW, T, N), T, N, grip: grip || 0.88, tool: id });
  const ANIM = {};
  // ── wash hands: wet, soap, scrub all five places for 20 seconds (shown quickly), rinse, dry ──
  ANIM["wash-hands"] = (c, u) => {
    const x = SINK.x, zS = IZ1 - 0.46, under = P(x, TOP + 0.06, zS - 0.01), front = P(x, TOP + 0.1, 0.36);
    c.body.lean = 14; c.look = P(x, TOP, 0.42);
    const ph = u < 0.12 ? "wet" : u < 0.22 ? "soap" : u < 0.74 ? "scrub" : u < 0.86 ? "rinse" : "dry";
    c.s.water = (ph === "wet" || ph === "rinse") ? 1 : 0;
    let mid = ph === "wet" || ph === "rinse" ? under.clone() : front.clone();
    if (ph === "soap") mid = P(x - 0.2, TOP + 0.16, SINK.z - 0.12);
    const k = (u - 0.22) / 0.52, sub = Math.floor(clamp(k, 0, 0.999) * 5), su = (k * 5) % 1, wob = Math.sin(su * TAU * 3) * 0.022;
    let R0 = { G: mid.clone().add(V(-0.035, 0, 0)), T: nrm(0, 0.5, 1), N: LEFT.clone(), grip: 0.15 }, L0 = { G: mid.clone().add(V(0.035, 0, 0)), T: nrm(0, 0.5, 1), N: RIGHT.clone(), grip: 0.15 };
    if (ph === "soap") { L0 = { G: P(x - 0.33, TOP + 0.13, SINK.z - 0.11), T: nrm(0, 0, 1), N: UP.clone(), grip: 0.3 }; R0 = { G: P(x - 0.35, TOP + 0.2 - 0.01 * Math.max(0, Math.sin(win(u, 0.14, 0.2) * Math.PI)), SINK.z - 0.1), T: nrm(-0.2, 0, 1), N: DOWN.clone(), grip: 0.1 }; }
    if (ph === "scrub") {
      if (sub === 0) { R0.G.add(V(0, wob, wob)); L0.G.add(V(0, -wob, -wob)); }                    // palms
      else if (sub === 1) { R0 = { G: mid.clone().add(V(0.0, 0.025, 0.0 + wob)), T: nrm(0.4, 0, 1), N: DOWN.clone(), grip: 0.1 }; L0 = { G: mid.clone().add(V(0.01, -0.0, -wob)), T: nrm(-0.5, 0.3, 1), N: UP.clone(), grip: 0.1 }; }   // backs
      else if (sub === 2) { R0 = { G: mid.clone().add(V(-0.02 + wob * 0.6, 0, 0.012)), T: nrm(0.2, 0.5, 1), N: nrm(1, 0, -0.2), grip: 0.05 }; L0 = { G: mid.clone().add(V(0.02 - wob * 0.6, 0, 0.0)), T: nrm(-0.2, 0.5, 1), N: nrm(-1, 0, -0.2), grip: 0.05 }; }   // between fingers
      else if (sub === 3) { R0 = { G: mid.clone().add(V(-0.03, 0, 0)), T: nrm(0, 1, 0.4), N: LEFT.clone(), grip: 0.75 }; L0 = { G: mid.clone().add(V(0.02, 0.0 + wob * 0.4, 0.01)), T: nrm(-0.3, 0.6, 1), N: RIGHT.clone(), grip: 0.4 }; }   // thumbs
      else { R0 = { G: mid.clone().add(V(-0.02, 0.03, 0)), T: nrm(0, 0, 1), N: DOWN.clone(), grip: 0.85 }; L0 = { G: mid.clone().add(V(0.02, -0.0 + wob * 0.3, 0)), T: nrm(-0.2, 0, 1), N: UP.clone(), grip: 0.05 }; }   // under the nails
      c.s.lather = 1;
    }
    if (ph === "rinse") { R0.G.add(V(0, Math.sin(u * 90) * 0.01, 0)); c.s.lather = Math.max(0, 1 - win(u, 0.74, 0.82)); }
    if (ph === "dry") { const tp = P(x - 0.4, TOP + 0.08, SINK.z - 0.1); R0 = { G: tp.clone().add(V(0.02, 0.02, 0)), T: nrm(0, 0.3, 1), N: LEFT.clone(), grip: 0.5 }; L0 = { G: tp.clone().add(V(0.07, 0.0 + Math.sin(u * 80) * 0.01, 0)), T: nrm(0, 0.3, 1), N: RIGHT.clone(), grip: 0.4 }; c.s.towelIn = 1; c.look = tp; }
    c.R = R0; c.L = L0; c.say = ["wet", "soap", "scrub", "rinse", "dry"].indexOf(ph);
  };
  // ── tie hair back: both hands to the back of the head, then settle the cap ──
  ANIM["tie-hair"] = (c, u) => {
    const head = c.fig("head"), back = head.clone().add(rotY(V(0, -0.02, -0.11), c.yaw));
    const k = Math.sin(win(u, 0.15, 0.75) * Math.PI * 3) * 0.015;
    c.R = { G: back.clone().add(rotY(V(-0.05, k, 0.0), c.yaw)), T: rotY(nrm(0.6, 0.6, 0), c.yaw), N: rotY(nrm(0.2, 0, 1), c.yaw), grip: 0.6 };
    c.L = { G: back.clone().add(rotY(V(0.05, -k, 0.0), c.yaw)), T: rotY(nrm(-0.6, 0.6, 0), c.yaw), N: rotY(nrm(-0.2, 0, 1), c.yaw), grip: 0.6 };
    if (u > 0.75) { c.R.G = head.clone().add(rotY(V(-0.08, 0.06, 0.02), c.yaw)); c.R.N = rotY(nrm(0.6, -0.4, 0), c.yaw); c.R.T = rotY(FWD, c.yaw); c.L.G = head.clone().add(rotY(V(0.08, 0.06, 0.02), c.yaw)); c.L.N = rotY(nrm(-0.6, -0.4, 0), c.yaw); c.L.T = rotY(FWD, c.yaw); }
    c.look = null; c.body.lean = 6; c.body.headDown = 18;
  };
  // ── cutting: the claw holds the food; the knife's tip stays on the board and rocks down through it ──
  function cutAnim(style) {
    return (c, u) => {
      const item = c.item, pr = getProduce(item), len = Math.max(0.05, pr.len), z = BOARD.z - 0.01;
      const x0 = BOARD.x - len / 2 + 0.01, n = style === "mince" ? 10 : style === "dice" ? 8 : style === "slice" ? 9 : 6;
      c.body.lean = 16; c.look = P(BOARD.x, BTOP, z);
      if (style === "mince") {   // rock across a pile with the other hand flat on the spine
        const rk = Math.sin(u * TAU * 7), sweepX = Math.sin(u * TAU * 1.5) * 0.03, pitch = 12 + 10 * (0.5 + 0.5 * rk);
        const tip = P(BOARD.x + sweepX + 0.02, BTOP + 0.001, z + 0.1);
        c.R = KNIFE_GRIP(tip, pitch, -8);
        const spine = tip.clone().add(V(-Math.sin(-8 * D2R) * 0.08, 0.035 + 0.012 * (0.5 + 0.5 * rk), -0.07));
        c.L = { G: spine.clone().add(V(0.0, 0.035, 0)), T: nrm(-0.3, 0, 1), N: DOWN.clone(), grip: 0.12 };
        c.s.board = { item, cut: 1, style: u > 0.25 ? "mince" : "chop", prog: clamp(u * 1.4, 0, 1), peeled: 1 };
        return;
      }
      // each stroke: lift (handle up), slide over to the next cut, rock down through the food
      const k = u * n, i = Math.floor(clamp(k, 0, n - 0.001)), f = k - i, cutX = x0 + (i + 1) * (len - 0.02) / (n + 1);
      const pitch = f < 0.45 ? lerp(24, 26, f / 0.45) : lerp(26, 1.5, sst(0.45, 0.95, f));
      const tip = P(cutX - 0.003, BTOP + 0.001, z + Math.max(0.075, pr.rad + 0.05));
      c.R = KNIFE_GRIP(tip, pitch, -4);
      // the claw: fingertips tucked, knuckles against the blade, a little behind the next cut
      const clawX = cutX + 0.03 + 0.008 * (1 - f), top = BTOP + pr.rad * 2 + 0.045;
      c.L = { G: P(clawX + 0.012, top, z - 0.008), T: nrm(-0.15, 0, -1), N: nrm(0.35, -1, 0), grip: 0.72 };
      const done = (i + (f > 0.9 ? 1 : 0)) / n;
      c.s.board = { item, cut: 1, style, prog: done, peeled: c.s.board && c.s.board.item === item ? c.s.board.peeled : 0, cutX };
    };
  }
  ANIM.chop = cutAnim("chop"); ANIM.slice = cutAnim("slice"); ANIM.dice = cutAnim("dice"); ANIM.mince = cutAnim("mince");
  // ── peel: hold the food in one hand, peel away from the body in long strokes ──
  ANIM.peel = (c, u) => {
    const item = c.item, pr = getProduce(item), banana = item === "banana";
    const fx = BOARD.x + 0.02, fy = BTOP + 0.11, fz = BOARD.z - 0.02;
    c.body.lean = 14; c.look = P(fx, fy, fz);
    c.s.held = { item, side: "L", tilt: banana ? -60 : -35, peelProg: u };
    c.L = { G: P(fx + 0.06, fy, fz), T: nrm(0, 0.3, 1), N: nrm(-0.7, 0.6, 0), grip: 0.62 };
    if (banana) { const pull = Math.sin(win(u, 0.1, 0.95) * Math.PI * 3); c.R = { G: P(fx - 0.06, fy + 0.05 - 0.07 * Math.abs(pull), fz + 0.01), T: nrm(0, 1, 0.3), N: LEFT.clone(), grip: 0.55 }; c.R.pinch = true; }
    else { const k = (u * 5) % 1, ang = Math.floor(u * 5) * 60; const along = lerp(-0.08, 0.06, sst(0.1, 0.85, k));
      c.R = { G: P(fx + along * 0.95 - 0.05, fy + 0.035 - 0.012 * Math.sin(k * Math.PI), fz + 0.04), T: nrm(-1, -0.4, 0.2), N: nrm(0, 0.2, -1), grip: 0.9, tool: "peeler" }; c.s.held.spin = ang; }
  };
  // ── measure dry: scoop, overfill a little, level with a straight edge, tip into the bowl ──
  ANIM["measure-dry"] = (c, u) => {
    const bag = P(-0.2, TOP, 0.62), lev = P(-0.05, TOP + 0.09, 0.42), over = P(BOWL.x - 0.05, TOP + 0.24, BOWL.z - 0.02);
    // spoon it in (two spoonfuls, not pressed down), a little over the top; then level; then tip it in
    const cupA = P(-0.06, TOP + 0.07, 0.5), spoons = win(u, 0.06, 0.27) * 2, sp = spoons % 1, scoop = Math.min(2, Math.floor(spoons));
    c.body.lean = 12; c.s.bag = 1; c.s.cupFill = u < 0.06 ? 0 : u < 0.3 ? Math.min(1.2, 0.6 * scoop + 0.6 * sst(0.72, 0.95, sp) * (scoop < 2 ? 1 : 0)) : u < 0.62 ? lerp(1.2, 1, sst(0.4, 0.6, u)) : u < 0.85 ? lerp(1, 0, sst(0.68, 0.82, u)) : 0;
    const cupG = u < 0.3 ? K(u, [[0.0, cupA.toArray()], [0.27, cupA.toArray()], [0.32, lev.toArray()]])
      : u < 0.62 ? lev.toArray() : K(u, [[0.62, lev.toArray()], [0.72, over.toArray()], [0.86, over.toArray()], [1, lev.toArray()]]);
    const tipA = K(u, [[0.66, 0], [0.74, 1], [0.84, 1], [0.9, 0]]);
    c.L = { G: V(...cupG).add(V(0.05, 0, 0)), T: nrm(-1, 0, -0.15 * 0).applyAxisAngle(FWD, 0).applyAxisAngle(V(1, 0, 0), 0), N: nrm(0, -1, 0).applyAxisAngle(V(-1, 0, 0), 0).add(V(0, 0, 0)), grip: 0.85, tool: "cups" };
    c.L.T = nrm(-1, -0.0, 0.0).applyAxisAngle(V(0, 0, 1), -tipA * 1.5); c.L.N = nrm(0, -1, 0).applyAxisAngle(V(0, 0, 1), -tipA * 1.5).applyAxisAngle(V(0, 0, 1), 0);
    c.L.N = V(0, 0, -1).applyAxisAngle(V(0, 0, 1), 0); c.L.N = nrm(0, 0.0, -1); c.L.T = nrm(-1, -0.25 * tipA, 0).applyAxisAngle(FWD, -tipA * 1.6);
    if (u > 0.33 && u < 0.62) { const k = sst(0.36, 0.58, u); const cupC = lev.clone().add(V(-0.05 + 0.1, -0.05, 0)).add(V(-0.1 + 0.0, 0.0, 0)); c.look = cupC;
      c.R = { G: P(lev.x - 0.08 + 0.0, lev.y + 0.0, lev.z - 0.06 + 0.12 * k), T: nrm(0.15, 0, 1), N: nrm(0, 0, -1).applyAxisAngle(UP, 0).add(V(0, 0, 0)), grip: 0.8, tool: "straight" }; c.R.N = nrm(1, 0, 0); c.R.T = nrm(0.2, 0, 1); }
    else if (u > 0.04 && u < 0.28) {   // the spoon: into the bag, over the cup, tip it in
      const inBag = bag.clone().add(V(0.0, 0.1, -0.01)), overCup = cupA.clone().add(V(-0.02, 0.07, 0));
      const pos = V(...K(sp, [[0, overCup.toArray()], [0.3, inBag.toArray()], [0.45, inBag.clone().add(V(0, 0.03, 0)).toArray()], [0.72, overCup.toArray()], [1, overCup.toArray()]]));
      const tilt = sst(0.72, 0.9, sp) * (1 - sst(0.95, 1, sp)), T = nrm(0.1, 0.9, -0.35).applyAxisAngle(FWD, -tilt * 0.9);
      c.R = TIP("spoon", pos, T, nrm(1, 0, 0.25).applyAxisAngle(FWD, -tilt * 0.9), 0.85); c.look = sp < 0.5 ? bag : cupA;
    }
    else if (u < 0.3) { c.R = null; c.look = bag; } else { c.R = null; c.look = over; }
  };
  // ── measure liquid: pour to the line, then bend down so the eyes are level with it ──
  ANIM["measure-liquid"] = (c, u) => {
    const jug = P(0.12, TOP, 0.42), bottle = P(-0.05, TOP + 0.2, 0.42);
    c.s.jugAt = "counter"; c.s.jugFill = u < 0.12 ? 0 : u < 0.5 ? lerp(0, 0.95, win(u, 0.15, 0.48)) : u < 0.8 ? 0.95 : lerp(0.95, 1, win(u, 0.8, 0.88));
    const pourA = K(u, [[0.08, 0], [0.16, 1], [0.46, 1], [0.52, 0], [0.8, 0], [0.84, 0.6], [0.88, 0]]);
    c.s.bottle = { pos: bottle.clone().add(V(0.0, 0.0, 0)), tilt: pourA }; c.s.liquid = liquidFor(c.step);
    c.R = { G: bottle.clone().add(V(-0.06, 0, 0)), T: nrm(0, 1, 0).applyAxisAngle(FWD, -pourA * 1.7), N: LEFT.clone().applyAxisAngle(FWD, -pourA * 1.7), grip: 0.75 };
    c.L = { G: jug.clone().add(V(0.09, 0.06, 0)), T: UP.clone(), N: RIGHT.clone(), grip: 0.6 };
    if (pourA > 0.3) c.s.stream = { from: "bottle", to: jug.clone().add(V(0, 0.09, 0)), m: c.s.liquid };
    const crouch = K(u, [[0.5, 0], [0.6, 1], [0.86, 1], [0.95, 0]]);
    c.body.crouch = crouch * 0.42; c.body.lean = lerp(12, 4, crouch); c.look = jug.clone().add(V(0, 0.08 * c.s.jugFill + 0.01, 0));
    if (crouch > 0.5) { c.R = { G: P(-0.12, TOP + 0.02 - 0.0, 0.3), T: FWD.clone(), N: DOWN.clone(), grip: 0.2 }; c.s.bottle.pos = bottle.clone().add(V(-0.05, -0.2 + 0.0, 0.12)); c.s.bottle.tilt = 0; c.s.bottle.rest = 1; }
    c.s.eyeLine = crouch;
  };
  // ── crack an egg: tap on the flat counter, thumbs in the crack, open over a small bowl ──
  ANIM["crack-egg"] = (c, u) => {
    const into = has(c.step, "smallbowl") ? P(0.12, TOP, 0.58) : P(BOWL.x, TOP, BOWL.z), flat = P(0.06, TOP, 0.32), dish = P(-0.17, TOP + 0.04, 0.62);
    const above = into.clone().add(V(0, 0.15, 0));
    c.body.lean = 14;
    let Ge;
    if (u < 0.34) {
      const taps = Math.max(0, Math.sin(win(u, 0.16, 0.32) * Math.PI * 2)) ;
      Ge = V(...K(u, [[0, dish.toArray()], [0.1, flat.clone().add(V(0, 0.08, 0)).toArray()], [0.16, flat.clone().add(V(0, 0.035, 0)).toArray()], [0.34, flat.clone().add(V(0, 0.04, 0)).toArray()]]));
      if (u > 0.16) Ge.y = flat.y + 0.022 + 0.03 * (1 - Math.abs(Math.cos(win(u, 0.16, 0.32) * Math.PI * 2))) * 0.5;
      c.R = { G: Ge.clone().add(V(-0.012, 0.0, -0.035)), T: nrm(0, 0.4, 1), N: nrm(0.7, 0.3, 0), grip: 0.5 };
      c.L = null; c.look = Ge; c.s.egg = { mode: "whole", pos: Ge, cracked: u > 0.22 }; return;
    }
    Ge = V(...K(u, [[0.34, flat.clone().add(V(0, 0.04, 0)).toArray()], [0.46, above.toArray()]]));
    const open = sst(0.5, 0.68, u), apart = 0.01 + 0.035 * open, away = sst(0.76, 0.95, u);
    const roll = open * 1.3;
    const posR = Ge.clone().add(V(-apart, 0, 0)).lerp(dish.clone().add(V(-0.03, 0.05, 0)), away), posL = Ge.clone().add(V(apart, 0, 0)).lerp(dish.clone().add(V(0.03, 0.05, 0)), away);
    c.R = { G: posR.clone().add(V(-0.022, -0.01, -0.0)), T: nrm(0, 0.85, 0.5).applyAxisAngle(FWD, roll), N: LEFT.clone().applyAxisAngle(FWD, roll), grip: 0.5 };
    c.L = { G: posL.clone().add(V(0.022, -0.01, -0.0)), T: nrm(0, 0.85, 0.5).applyAxisAngle(FWD, -roll), N: RIGHT.clone().applyAxisAngle(FWD, -roll), grip: 0.5 };
    c.look = Ge; c.s.egg = { mode: "open", pos: Ge, open, posR, posL, roll, fall: sst(0.56, 0.72, u), into, gone: away > 0.98 };
  };
  // ── whisk: the bowl tipped toward you, held by the other hand; quick circles through the bottom ──
  ANIM.whisk = (c, u) => {
    const b = P(BOWL.x, TOP, BOWL.z), w = sst(0.0, 0.12, u) * (1 - sst(0.9, 1, u)), ph = u * TAU * 16, r = 0.045 * w;
    c.s.bowlTilt = 0.22 * sst(0, 0.1, u) * (1 - sst(0.92, 1, u));
    const tipP = b.clone().add(V(Math.cos(ph) * r, 0.03, Math.sin(ph) * r * 0.7 - 0.01));
    const T = nrm(0.15 + Math.cos(ph) * 0.08 * w, 0.85, -0.5);   // the thumb up and back; the wires point down into the bowl
    c.R = TIP("whisk", tipP, T, nrm(1, 0, 0.2), 0.9);
    c.L = { G: b.clone().add(V(0.12, 0.1, -0.02)), T: nrm(0, 0.4, 1), N: nrm(-0.9, 0.2, 0.1), grip: 0.55 };
    c.body.lean = 12; c.body.turn = 10; c.look = b; c.s.mixing = u;
  };
  // ── stir: slow circles; scrape the sides ──
  ANIM.stir = (c, u) => {
    const stove = c.stand === "stove" || c.stand === "pot", inPot = c.stand === "pot";
    const ctr = inPot ? P(POT.x, TOP + POT.h * 0.5, POT.z) : stove ? P(PAN.x, TOP + 0.02, PAN.z) : P(BOWL.x, TOP + 0.03, BOWL.z);
    const ph = u * TAU * 4, r = (inPot ? 0.07 : stove ? 0.07 : 0.06) * sst(0, 0.1, u);
    const tipP = ctr.clone().add(V(Math.cos(ph) * r, 0.0, Math.sin(ph) * r * 0.8));
    const T = nrm(0.1, 0.9, -0.35); const tl = stove ? "spatula" : "spoon";
    c.R = TIP(has(c.step, "spatula") || (stove && !inPot) ? "spatula" : "spoon", tipP, T, nrm(1, 0, 0.25));
    c.L = inPot ? { G: P(POT.x + POT.r + 0.03, TOP + POT.h - 0.02, POT.z), T: FWD.clone(), N: RIGHT.clone(), grip: 0.4, mitt: false } : stove ? { G: pan.localToWorld(PAN_HANDLE.clone()), T: rotY(LEFT, -0.6), N: DOWN.clone(), grip: 0.85 } : { G: P(BOWL.x + 0.12, TOP + 0.1, BOWL.z - 0.02), T: nrm(0, 0.4, 1), N: nrm(-0.9, 0.2, 0.1), grip: 0.55 };
    if (inPot) c.L = null;
    c.body.lean = 12; c.look = ctr; c.s.mixing = u;
  };
  // ── fold: in at the far side, scrape across the bottom, lift and turn over; turn the bowl ──
  ANIM.fold = (c, u) => {
    const b = P(BOWL.x, TOP, BOWL.z), n = 4, k = (u * n) % 1;
    const p = k < 0.55 ? V(...K(k, [[0, [0, 0.07, 0.08]], [0.12, [0, 0.03, 0.07]], [0.55, [0, 0.025, -0.07]]])) : V(...K(k, [[0.55, [0, 0.025, -0.07]], [0.8, [0, 0.08, -0.02]], [1, [0, 0.07, 0.08]]]));
    const turn = k < 0.55 ? 0 : sst(0.55, 0.85, k) * 2.2;
    const T = nrm(0.2, 0.8, -0.2 + (k < 0.55 ? 0 : 0.2)).applyAxisAngle(FWD, 0);
    c.R = TIP("spatula", b.clone().add(p), T, nrm(1, 0, 0).applyAxisAngle(T, turn), 0.85);
    c.L = { G: b.clone().add(V(0.12, 0.09, -0.02)), T: nrm(0, 0.4, 1), N: nrm(-0.9, 0.2, 0.1), grip: 0.55 };
    c.s.bowlSpin = u * 1.6; c.body.lean = 12; c.look = b; c.s.mixing = u;
  };
  // ── pour: two hands if it is big; slowly, close; away from the body when hot ──
  ANIM.pour = (c, u) => {
    const into = pourTarget(c.step, c.s), src = into === "pan" && (c.s.bowl.kind === "batter" || c.s.bowl.kind === "beaten") ? "bowl" : into === "colander" ? "pot" : into === "tin" ? "spoon" : "jug";
    const dst = into === "pan" ? P(PAN.x, TOP + 0.03, PAN.z) : into === "pot" ? P(POT.x, TOP + POT.h, POT.z) : into === "colander" ? P(SINK.x, TOP - 0.05, SINK.z) : into === "tin" ? P(0.0, TOP + 0.04, 0.42) : P(BOWL.x, TOP + 0.05, BOWL.z);
    const a = K(u, [[0.1, 0], [0.3, 1], [0.75, 1], [0.92, 0]]);
    c.body.lean = 12; c.look = dst;
    if (src === "jug") { const jg = dst.clone().add(V(-0.13, 0.16, -0.03));
      c.s.jugAt = "hand"; c.s.jugFill = c.s.jugFill == null ? 0.9 : c.s.jugFill; c.s.jugFill = lerp(0.9, 0.05, win(u, 0.3, 0.8)); c.s.liquid = c.s.jug || liquidFor(c.step);
      c.R = { G: V(...K(u, [[0, P(0.05, TOP + 0.08, 0.45).toArray()], [0.25, jg.toArray()], [0.85, jg.toArray()], [1, P(0.05, TOP + 0.08, 0.45).toArray()]])), T: UP.clone().applyAxisAngle(FWD, -a * 1.3), N: nrm(1, 0, 0.0).applyAxisAngle(FWD, -a * 1.3), grip: 0.85, tool: "jug" };
      if (a > 0.6) c.s.stream = { from: "jug", to: dst, m: c.s.liquid };
      c.s.fillInto = { into, k: win(u, 0.3, 0.8) };
    } else if (src === "bowl") { // pour batter or eggs from the bowl into the pan, two hands
      c.s.bowlHeld = { k: sst(0.05, 0.25, u) * (1 - sst(0.85, 1, u)), tilt: a };
      const bc = V(...K(u, [[0.05, [BOWL.x, TOP, BOWL.z]], [0.25, [PAN.x - 0.02, TOP + 0.16, PAN.z - 0.12]], [0.85, [PAN.x - 0.02, TOP + 0.16, PAN.z - 0.12]], [1, [BOWL.x, TOP, BOWL.z]]]));
      c.s.bowlPos = bc; c.R = { G: bc.clone().add(V(-0.13, 0.08, 0)), T: nrm(0, 0.4, 1), N: nrm(0.9, 0.2, 0.1), grip: 0.55 }; c.L = { G: bc.clone().add(V(0.13, 0.08, 0)), T: nrm(0, 0.4, 1), N: nrm(-0.9, 0.2, 0.1), grip: 0.55 };
      if (a > 0.6) c.s.stream = { from: "bowl", to: dst, m: c.s.bowl.kind === "beaten" ? "beaten" : "batter" };
      c.s.fillInto = { into, k: win(u, 0.3, 0.8) };
    } else if (src === "pot") { // drain: mitts on, pour away from you
      c.s.mitts = 1; const pc = V(...K(u, [[0.05, [POT.x, TOP + 0.004, POT.z]], [0.3, [SINK.x + 0.12, TOP + 0.2, SINK.z]], [0.8, [SINK.x + 0.12, TOP + 0.2, SINK.z]], [1, [POT.x, TOP + 0.004, POT.z]]]));
      c.s.potHeld = { pos: pc, tilt: a * 0.9 };
      c.R = { G: pc.clone().add(V(-POT.r - 0.035, POT.h - 0.02, 0)), T: FWD.clone(), N: LEFT.clone(), grip: 0.6 }; c.L = { G: pc.clone().add(V(POT.r + 0.035, POT.h - 0.02, 0)), T: FWD.clone(), N: RIGHT.clone(), grip: 0.6 };
      if (a > 0.6) c.s.stream = { from: "pot", to: dst, m: "water" }; c.look = dst;
    } else { // spoon batter into the tin
      const n = 4, k = (u * n) % 1, cell = Math.floor(u * n);
      const cx = -0.12 + (cell % 4) * 0.08, tipP = P(cx + 0.0, TOP + 0.05 + 0.04 * Math.sin(k * Math.PI), 0.42 + 0.0);
      const T = nrm(0.1, 0.9, -0.35); c.R = TIP("spoon", tipP, T, nrm(1, 0, 0.25));
      c.s.fillInto = { into: "tin", k: u };
    }
  };
  // ── season: a pinch, sprinkled from a little higher up ──
  ANIM.season = (c, u) => {
    const tgt = c.stand === "stove" ? P(PAN.x, TOP + 0.03, PAN.z) : c.stand === "pot" ? P(POT.x, TOP + POT.h, POT.z) : c.s.dough && c.s.dough.flat ? P(0, TOP + 0.03, 0.4) : P(BOWL.x, TOP + 0.06, BOWL.z);
    const cellar = P(-0.12, TOP + 0.05, 0.62);
    const hp = V(...K(u, [[0, cellar.clone().add(V(0, 0.04, 0)).toArray()], [0.2, cellar.clone().add(V(0, 0.02, 0)).toArray()], [0.4, tgt.clone().add(V(-0.02, 0.2, -0.05)).toArray()], [0.85, tgt.clone().add(V(-0.02, 0.2, -0.05)).toArray()], [1, cellar.clone().add(V(0, 0.06, 0)).toArray()]]));
    const rub = Math.sin(u * 60) * 0.004;
    c.R = { G: hp.clone().add(V(rub, 0, 0)), T: nrm(0, -0.4, 1), N: DOWN.clone(), grip: 0.45, pinch: true };
    c.s.salt = u > 0.42 && u < 0.86 ? { from: hp.clone().add(V(0, -0.03, 0.04)), to: tgt, k: (u - 0.42) / 0.44 } : null;
    c.s.cellar = 1; c.body.lean = 10; c.look = tgt;
    if (c.s.dough && c.s.dough.flat && c.step.ing && c.step.ing.length) c.s.cheeseProg = u;
  };
  // ── flip: bubbles pop, edges dry; the turner slides all the way under; over, close to the pan ──
  ANIM.flip = (c, u) => {
    const pc = P(PAN.x, TOP + 0.02, PAN.z);
    c.s.burner = 1; c.body.lean = 12; c.look = pc;
    const handle = pan.localToWorld(PAN_HANDLE.clone());
    c.L = { G: handle.clone().add(V(0.0, 0.025, 0)), T: rotY(V(-1, 0, 0), -0.6).add(V(0, 0.0, 0)).normalize(), N: DOWN.clone(), grip: 0.85 };
    c.L.T = rotY(RIGHT, -0.6).negate().negate(); c.L.T = new THREE.Vector3(-Math.cos(0.6), 0, -Math.sin(0.6)).negate(); c.L.T = V(-Math.cos(-0.6), 0, Math.sin(-0.6)).negate();
    c.L.T = nrm(-1, 0, 0).applyAxisAngle(UP, -0.6);
    const slide = sst(0.25, 0.45, u), lift = sst(0.5, 0.62, u), turn = sst(0.55, 0.78, u), down = sst(0.78, 0.9, u);
    // the turner comes from the cook's side of the pan, slides all the way under, lifts a little and turns over, close to the pan
    const bladeP = pc.clone().add(V(-0.03, 0.004 + 0.06 * lift * (1 - down), -0.13 + 0.12 * slide));
    const roll = turn * Math.PI;
    const T = nrm(0.3, 0.12 + 0.6 * lift * (1 - down), 1);
    c.R = TIP("turner", bladeP, T, nrm(-1, 0, 0.3).applyAxisAngle(T, -roll * 0.75), 0.92);
    c.s.pancake = { cook: lerp(0.75, 1, u), flipK: turn, lift: lift * (1 - down) * 0.06, slide, at: bladeP, roll, bubbles: 1 - turn };
  };
  // ── sauté: oil in, food in away from you, keep it moving ──
  ANIM.saute = (c, u) => {
    const pc = P(PAN.x, TOP + 0.03, PAN.z); c.s.burner = 1;
    const ph = u * TAU * 6, r = 0.06 * sst(0.15, 0.25, u);
    const tipP = pc.clone().add(V(Math.cos(ph) * r, 0.0, Math.sin(ph) * r * 0.6));
    const T = nrm(0.1, 0.9, -0.35);
    c.R = TIP(has(c.step, "spoon") ? "spoon" : "spatula", tipP, T, nrm(1, 0, 0.25));
    c.L = { G: pan.localToWorld(PAN_HANDLE.clone()).add(V(0, 0.025, 0)), T: nrm(-1, 0, 0).applyAxisAngle(UP, -0.6), N: DOWN.clone(), grip: 0.85 };
    c.body.lean = 12; c.look = pc; c.s.sizzle = u; c.s.panMove = ph;
  };
  // ── boil and simmer: lid on, big rolling bubbles; lower food in with a spoon; small gentle bubbles ──
  ANIM.boil = (c, u) => {
    const pc = P(POT.x, TOP + POT.h, POT.z); c.s.potBurner = 1; c.body.lean = 10; c.look = pc;
    c.s.pot.water = 1; c.s.boilK = sst(0, 0.4, u);
    const pasta = stepItems(c.step).some(i => i.item === "pasta");
    c.s.pot.lid = u < 0.35 ? 1 : 0;
    // the left hand lifts the lid by its knob, far edge first, so the steam goes away from you and the lid shields you;
    // it sets the lid down on the counter on the left; then the right hand lowers the food in
    const restL = restHand("L", 0, V(STAND.pot.x, 0, STAND.pot.z), c.body), lidUp = pc.clone().add(V(0.1, 0.1, 0.1));
    const lp = u < 0.35 ? pc.clone().add(V(0, 0.05, 0)) : V(...K(u, [[0.35, pc.clone().add(V(0, 0.05, 0)).toArray()], [0.43, lidUp.toArray()], [0.52, LIDREST.toArray()]]));
    const letGo = sst(0.52, 0.62, u);
    c.L = { G: lp.clone().add(V(0, 0.035 + 0.01 * win(u, 0.43, 0.52), 0)).lerp(restL.G, letGo), T: FWD.clone(), N: DOWN.clone().lerp(restL.N, letGo).normalize(), grip: lerp(0.55, 0.15, letGo) };
    if (letGo >= 1) c.L = null;
    if (u > 0.35 && u < 0.52) { c.s.lidHeld = lp; c.s.lidTilt = sst(0.35, 0.42, u) * (1 - sst(0.45, 0.52, u)); c.s.pot.lid = 0; }
    if (u >= 0.52) c.s.lidRest = LIDREST.toArray();
    if (pasta && u > 0.5) {
      const restR = restHand("R", 0, V(STAND.pot.x, 0, STAND.pot.z), c.body), inK = sst(0.5, 0.58, u), away = sst(0.8, 0.92, u);
      const hp = P(POT.x - 0.02, TOP + POT.h + 0.2 - 0.06 * sst(0.58, 0.75, u), POT.z - 0.02);
      c.R = { G: restR.G.clone().lerp(hp, inK).lerp(restR.G, away), T: restR.T.clone().lerp(nrm(0, 0.2, 1), inK * (1 - away)).normalize(), N: restR.N.clone().lerp(LEFT, inK * (1 - away)).normalize(), grip: 0.7 };
      c.s.pastaIn = sst(0.58, 0.75, u); c.s.pastaSoft = sst(0.7, 1, u); if (away >= 1) c.R = null;
    }
  };
  ANIM.simmer = (c, u) => {
    const inPan = c.stand === "stove"; const pc = inPan ? P(PAN.x, TOP + 0.03, PAN.z) : P(POT.x, TOP + POT.h * 0.6, POT.z);
    if (inPan) c.s.burner = 0.5; else c.s.potBurner = 0.5; c.s.simmerK = 1; c.body.lean = 10; c.look = pc;
    const stirOn = win(u, 0.35, 0.7), ph = u * TAU * 3, r = 0.05 * Math.sin(stirOn * Math.PI);
    if (stirOn > 0 && stirOn < 1) { const T = nrm(0.1, 0.9, -0.35); c.R = TIP("spoon", pc.clone().add(V(Math.cos(ph) * r, 0, Math.sin(ph) * r)), T, nrm(1, 0, 0.25)); }
  };
  // ── bake: mitts on; open the door; pull the rack; pan on; push in; close. Later, out again ──
  ANIM.bake = (c, u) => {
    c.s.mitts = 1; c.s.ovenOn = 1;
    // Mitts on. Step in and pick up the tin; step back and squat (back straight, knees bent), the tin in the left mitt.
    // Open the door, pull the rack out, set the tin on it with both mitts, push the rack in, close the door, stand.
    // (The clock shows the baking time quickly.) Squat, open, pull the rack, lift the tin out, push the rack in, close,
    // stand, step in and set the tin on the counter to cool.
    const door = K(u, [[0.18, 0], [0.26, 1], [0.46, 1], [0.53, 0], [0.66, 0], [0.72, 1], [0.85, 1], [0.89, 0]]);
    const rack = K(u, [[0.26, 0], [0.31, 1], [0.4, 1], [0.45, 0], [0.72, 0], [0.77, 1], [0.81, 1], [0.85, 0]]);
    c.s.door = door; c.s.rack = rack; c.s.baked = u > 0.6 ? 1 : 0;
    c.body.crouch = K(u, [[0.08, 0], [0.16, 1.05], [0.53, 1.05], [0.58, 0], [0.62, 0], [0.66, 1.05], [0.88, 1.05], [0.93, 0]]);
    c.body.fwd = K(u, [[0, 0], [0.04, 0.3], [0.1, 0.3], [0.15, 0], [0.27, 0], [0.3, 0.12], [0.44, 0.12], [0.47, 0], [0.62, 0], [0.65, 0.12], [0.84, 0.12], [0.87, 0], [0.88, 0], [0.92, 0.3], [0.95, 0.3], [1, 0]]);
    c.body.lean = 12 + c.body.crouch * 14;
    const rackP = P(OVEN.x, OVEN.rackY + 0.02, FRONT + 0.27 - OVEN.out * rack), start = P(OVEN.x - 0.04, TOP + 0.02, 0.25);
    const hold = P(OVEN.x + 0.3, 0.62, -0.24), lifted = start.clone().add(V(0.05, 0.07, -0.12));
    const panP = u < 0.04 ? start.clone() : u < 0.18 ? V(...K(u, [[0.04, start.toArray()], [0.09, lifted.toArray()], [0.18, hold.toArray()]]))
      : u < 0.32 ? hold.clone() : u < 0.4 ? V(...K(u, [[0.32, hold.toArray()], [0.4, rackP.toArray()]])) : u < 0.77 ? rackP.clone()
      : u < 0.89 ? V(...K(u, [[0.77, rackP.toArray()], [0.82, hold.toArray()]])) : V(...K(u, [[0.89, hold.toArray()], [0.93, start.toArray()]]));
    c.s.bakeObj = { pos: panP, inOven: u > 0.45 && u < 0.72 };
    const hinge = OVEN.y1 - OVEN.y0 - 0.06, doorHandle = P(OVEN.x, OVEN.y0 + hinge * Math.cos(door * 1.45), FRONT - 0.075 - hinge * Math.sin(door * 1.45));
    const rackFront = rackP.clone().add(V(-0.12, 0.015, -0.2));
    const inW = (a, b) => u > a && u < b;
    c.look = inW(0.16, 0.9) ? (door > 0.3 ? rackP : doorHandle) : panP;
    const w = 0.135, both = () => { c.R = { G: panP.clone().add(V(-w, 0.012, -0.01)), T: FWD.clone(), N: nrm(1, 0.15, 0), grip: 0.45 }; c.L = { G: panP.clone().add(V(w, 0.012, -0.01)), T: FWD.clone(), N: nrm(-1, 0.15, 0), grip: 0.45 }; };
    if (inW(0.03, 0.13) || inW(0.32, 0.41) || inW(0.76, 0.82) || inW(0.88, 0.94)) { both(); return; }
    if (inW(0.13, 0.32) || inW(0.82, 0.88)) c.L = { G: panP.clone().add(V(0.0, -0.025, -0.02)), T: FWD.clone(), N: UP.clone(), grip: 0.3 };   // the tin flat on the left mitt
    if (inW(0.15, 0.26) || inW(0.45, 0.54) || inW(0.64, 0.72) || inW(0.84, 0.89))   // the right mitt on the door's bar
      c.R = { G: doorHandle.clone().add(V(-0.1, 0.02, -0.01)), T: nrm(1, 0, 0), N: nrm(0, -0.2 + 0.9 * (1 - door), -1).normalize(), grip: 0.7 };
    else if (inW(0.26, 0.32) || inW(0.4, 0.45) || inW(0.72, 0.77) || inW(0.81, 0.84))   // the right mitt slides the rack by its front wire
      c.R = { G: rackFront, T: FWD.clone(), N: DOWN.clone(), grip: 0.55 };
  };
  // ── check the temperature: the tip in the thickest part, wait for the number ──
  ANIM["check-temp"] = (c, u) => {
    const tgt = c.s.pan.kind ? P(PAN.x, TOP + 0.03, PAN.z) : c.s.tin ? P(0.0, TOP + 0.05, 0.42) : P(0.12, TOP + 0.06, 0.42);
    const ins = sst(0.2, 0.42, u) * (1 - sst(0.85, 1, u)), T = nrm(0.1, 0.9, -0.3);
    const tip = tgt.clone().add(V(0, 0.06 * (1 - ins) - 0.006, 0));
    c.R = TIP("thermo", tip, T, nrm(1, 0, 0.3), 0.85);
    c.s.thermo = { k: sst(0.42, 0.8, u), want: (c.step.temp && c.step.temp.f) || 165, want_c: (c.step.temp && c.step.temp.c) || 74 };
    c.body.lean = 12; c.look = tgt; if (c.s.tin) c.s.mitts = 0;
  };
  // ── plate: to the middle of a clean plate; wipe the edge ──
  ANIM.plate = (c, u) => {
    const pl = P(-0.12, TOP, 0.42);
    c.s.plateShow = 1; c.s.plateAt = pl; c.s.plateK = sst(0.25, 0.7, u); c.body.lean = 10; c.look = pl;
    if (c.s.pan.kind && c.stand === "stove") { const T = nrm(1, 0.15, 0.05); const bp = V(...K(u, [[0.1, [PAN.x - 0.08, TOP + 0.03, PAN.z]], [0.35, [PAN.x - 0.02, TOP + 0.05, PAN.z]], [0.6, [pl.x + 0.02, TOP + 0.06, pl.z]], [0.8, [pl.x, TOP + 0.03, pl.z]]]));
      c.R = TIP("turner", bp, T, FWD.clone(), 0.9); c.s.serveFrom = bp; }
    else { const ph = u * TAU * 3; const T = nrm(0.1, 0.9, -0.35); const sp = V(...K(u, [[0, [BOWL.x, TOP + 0.05, BOWL.z]], [0.3, [BOWL.x, TOP + 0.04, BOWL.z]], [0.55, [pl.x, TOP + 0.08, pl.z]], [0.8, [pl.x, TOP + 0.04, pl.z]], [1, [pl.x + 0.1, TOP + 0.06, pl.z]]]));
      c.R = TIP("spoon", sp, T, nrm(1, 0, 0.25)); }
    c.L = { G: pl.clone().add(V(0.17, 0.03, -0.02)), T: FWD.clone(), N: DOWN.clone(), grip: 0.4 };
  };
  // ── wipe the counter: clean side toward the messy side, in overlapping strokes ──
  ANIM["wipe-clean"] = (c, u) => {
    const n = 4, k = (u * n) % 1, row = Math.floor(u * n);
    const x = lerp(-0.36, 0.36, Math.min(n - 1, row + sst(0.82, 1, k)) / (n - 1)), z = K(k, [[0, 0.6], [0.5, 0.28], [1, 0.6]]);   // overlapping rows, sliding over at the far end
    const p = P(x, TOP + 0.03, z);
    c.R = { G: p, T: nrm(0, 0, 1), N: DOWN.clone(), grip: 0.25, tool: "cloth" };
    c.L = { G: P(0.45, TOP + 0.02, 0.3), T: FWD.clone(), N: DOWN.clone(), grip: 0.2 };
    c.body.lean = 16; c.look = p; c.body.shift = x * 0.6;
  };
  // ── wash the dishes: hot soapy water; one thing at a time; rinse; into the rack ──
  ANIM["wash-dishes"] = (c, u) => {
    const x = SINK.x, mid = P(x, TOP - 0.04, SINK.z), ph = u * TAU * 6;
    c.s.water = u > 0.65 && u < 0.85 ? 1 : 0; c.s.dishWash = 1;
    c.L = { G: mid.clone().add(V(0.07, 0.06, 0)), T: nrm(0, 0.4, 1), N: RIGHT.clone().add(V(0, 0.3, 0)), grip: 0.55 };
    c.R = { G: mid.clone().add(V(-0.04 + Math.cos(ph) * 0.03, 0.08 + Math.sin(ph) * 0.02, 0.0)), T: FWD.clone(), N: LEFT.clone(), grip: 0.6, tool: "sponge" };
    c.s.dishPos = mid.clone().add(V(0.02, 0.05, 0.0)); c.body.lean = 16; c.look = mid; c.s.lather = u < 0.65 ? 0.5 : 0;
  };
  // ── rinse fruit and vegetables: under cool water in a colander, rubbing gently ──
  ANIM.rinse = (c, u) => {
    const x = SINK.x, mid = P(x, TOP - 0.06, SINK.z + 0.02); c.s.water = u > 0.08 && u < 0.92 ? 1 : 0; c.s.rinseItem = c.item; c.s.colanderShow = 1;
    const ph = u * TAU * 5;
    c.R = { G: mid.clone().add(V(-0.05 + Math.cos(ph) * 0.02, 0.1, Math.sin(ph) * 0.02)), T: nrm(0, 0.3, 1), N: nrm(0.5, -0.8, 0), grip: 0.45 };
    c.L = { G: mid.clone().add(V(0.06 - Math.cos(ph) * 0.02, 0.1, -Math.sin(ph) * 0.02)), T: nrm(0, 0.3, 1), N: nrm(-0.5, -0.8, 0), grip: 0.45 };
    c.body.lean = 16; c.look = mid;
  };
  // ── grate: the grater on the board; push down across the holes; stop when it is small ──
  ANIM.grate = (c, u) => {
    const gp = P(0.05, BTOP, BOARD.z), n = 6, k = (u * n) % 1;
    const y = K(k, [[0, 0.2], [0.6, 0.06], [1, 0.2]]) , size = 1 - 0.6 * u;
    c.s.graterShow = 1; c.s.grated = u; c.s.cheeseBlock = { pos: P(gp.x - 0.065, BTOP + y, gp.z), size };
    c.R = { G: P(gp.x - 0.1, BTOP + y + 0.04, gp.z - 0.0), T: nrm(0.3, 0.5, 1), N: nrm(1, -0.2, 0), grip: 0.7 };
    c.L = { G: gp.clone().add(V(0.0, 0.29, -0.0)), T: nrm(1, 0, 0), N: DOWN.clone(), grip: 0.85 };
    c.body.lean = 16; c.look = gp.clone().add(V(0, 0.1, 0));
  };
  // ── knead: push away with the heel of the hand, fold back, quarter turn ──
  ANIM.knead = (c, u) => {
    const dp = P(0.0, TOP, BOARD.z), n = 5, k = (u * n) % 1;
    const push = K(k, [[0, 0], [0.45, 1], [0.6, 1], [0.85, 0], [1, 0]]), fold = K(k, [[0.55, 0], [0.85, 1], [1, 1]]);
    c.s.knead = { push, fold, turn: Math.floor(u * n) * Math.PI / 2 + fold * Math.PI / 2, smooth: u };
    c.R = { G: dp.clone().add(V(-0.03, 0.07 + 0.02 * (1 - push), -0.03 + 0.09 * push)), T: nrm(0.4, 0.2, 1), N: nrm(0.2, -1, 0.5), grip: 0.2 };
    c.L = { G: dp.clone().add(V(0.05, 0.08 + 0.03 * fold, 0.1 - 0.1 * fold)), T: nrm(-0.4, 0.2, 1), N: nrm(-0.2, -1, -0.3 + 0.6 * fold), grip: 0.45 };
    c.body.lean = 22 + push * 6; c.look = dp; c.s.flourDust = 1;
  };
  // ── roll out: from the middle out; quarter turns ──
  ANIM["roll-dough"] = (c, u) => {
    const dp = P(0.0, TOP + 0.012, 0.4), n = 4, k = (u * n) % 1;
    const z = K(k, [[0, 0], [0.5, 0.1], [1, -0.08]]);
    c.s.roll = u;
    const pinP = dp.clone().add(V(0, 0.04 + (0.012 * (1 - u)), z));
    c.R = { G: pinP.clone().add(V(-0.13, 0.03, 0)), T: FWD.clone(), N: DOWN.clone(), grip: 0.6 };
    c.L = { G: pinP.clone().add(V(0.13, 0.03, 0)), T: FWD.clone(), N: DOWN.clone(), grip: 0.6 };
    c.s.pinAt = pinP; c.body.lean = 20; c.look = dp; c.s.flourDust = 1;
  };
  // ── spread: in the middle, then out in circles with the back of the spoon ──
  ANIM.spread = (c, u) => {
    const dp = P(0.0, TOP + 0.02, 0.4), r = 0.12 * sst(0.1, 0.9, u), ph = u * TAU * 5;
    const tipP = dp.clone().add(V(Math.cos(ph) * r, 0.005, Math.sin(ph) * r * 0.9)), T = nrm(0.1, 0.75, -0.6);
    c.R = TIP("spoon", tipP, T, nrm(1, 0, 0.25));
    c.L = { G: P(0.24, TOP + 0.02, 0.3), T: FWD.clone(), N: DOWN.clone(), grip: 0.2 };
    c.s.spreadK = sst(0.05, 0.95, u); c.body.lean = 16; c.look = dp;
  };
  // ── the calm stand-in for a step the reader could not picture: hands at the counter, the words on the screen ──
  ANIM.counter = (c, u) => {
    const p = P(0.0, TOP + 0.03, 0.38), w = Math.sin(u * Math.PI);
    c.R = { G: p.clone().add(V(-0.1, 0.02 * w, 0)), T: nrm(0.2, 0, 1), N: DOWN.clone(), grip: 0.3 };
    c.L = { G: p.clone().add(V(0.12, 0.02 * w, 0)), T: nrm(-0.2, 0, 1), N: DOWN.clone(), grip: 0.3 };
    c.body.lean = 12; c.look = p;
    if (c.step.rise) c.s.riseK = sst(0.1, 0.9, u);
  };

  /* ══ THE BODY: stand, walk, lean, crouch; hands solved to their frames; tools follow the real hands ══ */
  const FIG = { x: 0, z: 0, yaw: 0 };
  function standXZ(stand) { return STAND[stand] || STAND.board; }
  // the hands hanging relaxed at the sides; they follow the body when it bends forward or squats
  const restHand = (S, yaw, base, body) => ({ G: base.clone().add(rotY(V(S === "L" ? 0.21 : -0.21,
      0.78 - (body ? (body.crouch || 0) * 0.42 + (1 - Math.cos((body.lean || 0) * D2R)) * 0.5 : 0), 0.05 + (body ? Math.sin((body.lean || 0) * D2R) * 0.45 + (body.fwd || 0) : 0)), yaw)), T: rotY(FWD, yaw), N: rotY(S === "L" ? RIGHT : LEFT, yaw), grip: 0.15, rest: true });
  // how far past its reach a hand's target is (0 when it can reach), for the posture now on the figure
  function overReach(c, crouch) {
    let worst = 0, dir = V(0, 0, 0);
    ["R", "L"].forEach(S => { const h = c[S]; if (!h) return;
      const sh = J["shoulder" + S].getWorldPosition(new THREE.Vector3());
      const rot = frameRot(S, h.T, h.N, _m1), Rw = _m2.multiplyMatrices(rot, REST_INV[S]);
      const wt = h.G.clone().sub(fig.hand(S).position.clone().applyMatrix4(new THREE.Matrix4().extractRotation(Rw)));
      const d = wt.clone().sub(sh), over = d.length() - 0.525;
      if (over > worst) { worst = over; dir = d.normalize(); } });
    return { over: worst, dir };
  }
  function solveFigure(c, stance) {
    const pose = { root: { pos: [0, 0, 0], rot: [0, 0, 0] }, j: {} };
    const crouch = c.body.crouch || 0, fwd = c.body.fwd || 0; let lean = c.body.lean || 0, shiftX = c.body.shift || 0, shiftZ = 0;   // fwd: a step in toward the counter
    const yawV = a => rotY(a, stance.yaw);
    const posture = () => {
      pose.root.pos = [stance.x + shiftX + Math.sin(stance.yaw) * fwd, -crouch * 0.42, stance.z + shiftZ + Math.cos(stance.yaw) * fwd]; pose.root.rot = [0, stance.yaw / D2R, 0];
      fig.root.position.set(0, 0, 0); fig.root.rotation.set(0, 0, 0);
      pose.j.spine = [lean * 0.45, (c.body.turn || 0) * 0.4, 0]; pose.j.chest = [lean * 0.55, (c.body.turn || 0) * 0.6, 0];
      pose.j.hipL = [-lean * 0.5 - crouch * 70, 0, 2]; pose.j.hipR = [-lean * 0.5 - crouch * 70, 0, -2];
      pose.grip = { L: c.L ? c.L.grip : 0.15, R: c.R ? c.R.grip : 0.15 }; pose.pinch = { L: !!(c.L && c.L.pinch), R: !!(c.R && c.R.pinch) };
      fig.setPose(pose);
      // feet planted on the floor (they step when the cook walks)
      ["L", "R"].forEach(S => { const f = stance.feet ? stance.feet[S] : V(stance.x, 0, stance.z).add(yawV(V(S === "L" ? 0.11 : -0.11, 0, -0.02 + fwd)));
        const target = V(f.x, 0.08 + (stance.lift ? stance.lift[S] || 0 : 0), f.z);
        fig.ik.leg(S, target, V(f.x, 0.6, f.z).add(yawV(V(S === "L" ? 0.08 : -0.08, 0, 0.8))), { footFlat: true, forward: yawV(nrm(S === "L" ? 0.12 : -0.12, 0, 1)) }); });
      fig.update();
    };
    posture();
    // a target a little out of reach: bend forward a little more and let the hips drift toward it (as a cook does),
    // a smooth function of the target, so the picture never jumps
    for (let i = 0; i < 6; i++) {
      const o = overReach(c, crouch); if (o.over < 0.004) break;
      const down = clamp(-o.dir.y, 0, 1), side = o.dir.x;
      lean = Math.min(48, lean + o.over * (60 + 90 * down));
      shiftX = clamp(shiftX + side * o.over * 0.8, (c.body.shift || 0) - 0.16, (c.body.shift || 0) + 0.16);
      posture();
    }
    if (c.look) fig.lookAt(c.look, 0.85); else if (c.body.headDown) fig.lookAt(V(stance.x, 0.5, stance.z + 0.5), 0.6);
    // the hands
    ["R", "L"].forEach(S => {
      const h = c[S] || restHand(S, stance.yaw, V(stance.x + shiftX, 0, stance.z), c.body);
      const sh = J["shoulder" + S].getWorldPosition(new THREE.Vector3());
      const rot = frameRot(S, h.T, h.N, _m1);
      const anc = fig.hand(S); const G0 = anc.position.clone();   // the palm point in the wrist's own space
      const Rw = _m2.multiplyMatrices(rot, REST_INV[S]);
      const wristTarget = h.G.clone().sub(G0.clone().applyMatrix4(new THREE.Matrix4().extractRotation(Rw)));
      // keep the wrist inside reach so the arm never locks straight with a jerk
      const d = wristTarget.clone().sub(sh), max = 0.535; if (d.length() > max) wristTarget.copy(sh).addScaledVector(d.normalize(), max);
      const pole = sh.clone().add(rotY(V(S === "L" ? 0.5 : -0.5, -0.75, -0.45), stance.yaw));
      fig.ik.arm(S, wristTarget, h.pole || pole);
      const elbowQ = J["elbow" + S].getWorldQuaternion(_q1);
      const qW = _q2.setFromRotationMatrix(Rw);
      J["wrist" + S].quaternion.copy(elbowQ.invert().multiply(qW));
      J["wrist" + S].updateMatrixWorld(true);
      // where the hand really is now: the tool goes there
      const wm = J["wrist" + S].matrixWorld, gw = G0.clone().applyMatrix4(wm);
      const tw = rotY(V(0, 0, 0), 0); const T = h.T.clone().normalize(), N = h.N.clone().addScaledVector(T, -h.N.dot(T)).normalize();
      const tf = toolFrame(T, N); tf.setPosition(gw);
      gripObj[S].matrix.copy(tf); gripObj[S].matrixWorldNeedsUpdate = true; gripObj[S].userData.tool = h.tool || null; gripObj[S].userData.G = gw; gripObj[S].userData.want = h.G.clone();
    });
    fig.update();
  }
  /* ══ PUTTING A MOMENT ON SCREEN ══ */
  const shownTools = new Set();
  function placeTool(id, m) { const t = TOOL[id]; if (!t) return; t.obj.visible = true; t.obj.matrixAutoUpdate = false; t.obj.matrix.copy(m); t.obj.matrixWorldNeedsUpdate = true; shownTools.add(id); }
  function homeTool(id) { const t = TOOL[id]; if (!t || !t.home) return; const m = new THREE.Matrix4().compose(t.home.pos, new THREE.Quaternion().setFromEuler(t.home.rot), V(1, 1, 1)); placeTool(id, m); }
  const toolsOfStep = (st) => { const set = new Set(); st.a.forEach(id => { const A = R.ACTIONS[id]; (A ? A.tools : []).forEach(t => set.add(t)); }); (st.tools || []).forEach(t => set.add(t)); return set; };
  let current = { k: 0, u: 0 }, lastInfo = {};
  function moment(k, u) {
    if (!RC || !plans[k]) return;
    current = { k, u };
    const st = RC.steps[k], pl = plans[k], t = u * pl.total;
    const s = clone(states[k].before);
    let seg = pl.seg[pl.seg.length - 1];
    for (const sg of pl.seg) { if (t < sg.t1 || sg === pl.seg[pl.seg.length - 1]) { seg = sg; break; } (DONE[sg.id] || (() => {}))(s, st); s.stand = sg.stand; }
    const lu = clamp((t - seg.t0) / (seg.t1 - seg.t0), 0, 1);
    // walking from where the cook was to where this skill is done (the first moment of the skill)
    const from = standXZ(s.stand), to = standXZ(seg.stand), dist = Math.hypot(to.x - from.x, to.z - from.z);
    const walkT = dist > 0.05 ? Math.min(0.28, (0.5 + dist * 0.9) / (seg.t1 - seg.t0)) : 0;
    const wk = walkT ? sst(0, walkT, lu) : 1, au = walkT ? clamp((lu - walkT) / (1 - walkT), 0, 1) : lu;
    const stance = { x: lerp(from.x, to.x, wk), z: lerp(from.z, to.z, wk), yaw: lerp(from.yaw, to.yaw, wk) };
    if (walkT && wk < 1) {   // two side steps: the leading foot, then the other
      const sgn = Math.sign(to.x - from.x) || 1, lead = sgn > 0 ? "L" : "R", trail = lead === "L" ? "R" : "L";
      const footAt = (S, kk) => { const a = V(from.x, 0, from.z).add(V(S === "L" ? 0.11 : -0.11, 0, -0.02)), b = V(to.x, 0, to.z).add(V(S === "L" ? 0.11 : -0.11, 0, -0.02)); return a.lerp(b, kk); };
      const k1 = sst(0, 0.55, wk), k2 = sst(0.45, 1, wk);
      stance.feet = { [lead]: footAt(lead, k1), [trail]: footAt(trail, k2) };
      stance.lift = { [lead]: Math.sin(k1 * Math.PI) * 0.05, [trail]: Math.sin(k2 * Math.PI) * 0.05 };
    }
    const c = { s, step: st, stand: seg.stand, item: itemFor(st, seg.id), body: { lean: 4 }, R: null, L: null, look: null, yaw: stance.yaw, fig: j => fig.world(j) || V(stance.x, 1.6, stance.z) };
    if (wk >= 1 || !walkT) {
      (ANIM[seg.id] || ANIM.counter)(c, au);
      // in and out of the skill: hands come from rest and go back to rest
      const e = sst(0, 0.08, au) * (1 - sst(0.93, 1, au));
      ["R", "L"].forEach(S => { const h = c[S]; if (!h) return; const r = restHand(S, stance.yaw, V(stance.x + (c.body.shift || 0), 0, stance.z), c.body); if (e < 1) { h.G = r.G.clone().lerp(h.G, e); h.G.y += Math.sin(Math.PI * e) * 0.15; h.T = r.T.clone().lerp(h.T, e).normalize(); h.N = r.N.clone().lerp(h.N, e).normalize(); h.grip = lerp(0.15, h.grip, e); if (e < 0.35) h.tool = h.tool && h.tool; } });
      c.body.lean = lerp(4, c.body.lean || 4, sst(0, 0.1, au) * (1 - sst(0.9, 1, au)));
      if (c.body.crouch) c.body.crouch *= 1;
    } else { c.look = V(to.x, 1.0, 0.5); }
    solveFigure(c, stance);
    scenery(c, st, seg, au);
    FIG.x = stance.x; FIG.z = stance.z; FIG.yaw = stance.yaw; FIG.focus = focusFor(seg.stand, c);
    // which shoulder the camera looks over: the side where this skill's hands work (worked out from the skill's middle, so it holds still)
    let camSide = -1;
    try { const c2 = { s: clone(states[k].before), step: st, stand: seg.stand, item: c.item, body: { lean: 4 }, R: null, L: null, look: null, yaw: stance.yaw, fig: c.fig };
      (ANIM[seg.id] || ANIM.counter)(c2, 0.5); const hs = [c2.R, c2.L].filter(h => h && h.G);
      if (hs.length && hs.reduce((a, h) => a + h.G.x, 0) / hs.length - to.x > 0.12) camSide = 1; } catch (e) {}
    lastInfo = { action: seg.id, lu: au, stand: seg.stand, R: c.R, L: c.L, camSide };
  }
  function focusFor(stand, c) {
    const f = { sink: V(SINK.x, TOP, SINK.z), board: V(0.06, TOP, BOARD.z), stove: V(0.95, TOP, 0.45), pot: V(1.1, TOP + 0.05, 0.45), oven: V(1.0, 0.6, 0.1) }[stand] || V(0, TOP, 0.4);
    return f;
  }

  /* what the counter, the vessels and the food look like at this moment */
  function scenery(c, st, seg, au) {
    const s = c.s;
    // tools: the ones this step uses wait at home; the ones in a hand ride with it
    Object.keys(TOOL).forEach(id => { if (id !== "towel") TOOL[id].obj.visible = false; }); shownTools.clear();
    const need = toolsOfStep(st);
    const inHand = { R: c.R && c.R.tool, L: c.L && c.L.tool };
    need.forEach(id => { if (TOOL[id] && id !== inHand.R && id !== inHand.L) homeTool(id); });
    ["R", "L"].forEach(S => { const id = inHand[S]; if (!id || !TOOL[id]) return; const m = gripObj[S].matrix.clone().multiply(TOOL[id].hold); placeTool(id, m); });
    TOOL.towel.obj.visible = true; if (!s.towelIn) homeTool("towel"); else { const m = gripObj.R.matrix.clone().multiply(holdM(0.03, -0.04, 0.03, 0, 0, 0.4)); placeTool("towel", m); }
    // oven mitts over the hands
    ["L", "R"].forEach(S => { mitts[S].visible = !!s.mitts; if (s.mitts) { mitts[S].matrixAutoUpdate = false; mitts[S].matrix.copy(gripObj[S].matrix).multiply(holdM(0.0, 0.03, 0.005, 0, 0, Math.PI / 2)); mitts[S].matrixWorldNeedsUpdate = true; } });
    fig.root.traverse(o => { if (o.isSkinnedMesh || o.isMesh) o.visible = true; });
    // water at the sink
    water.visible = !!s.water; pool.visible = !!s.water;
    if (s.water) { const tt = au * 40; for (let i = 0; i < 40; i++) { const a = i * 2.39996, r = 0.01 + ((i * 0.37 + tt * 0.6) % 1) * 0.05; _o3.position.set(Math.cos(a) * r, 0.003 + 0.01 * Math.sin((tt + i) * 1.7) ** 2, Math.sin(a) * r * 0.8); const sc = 0.6 + (i % 3) * 0.3; _o3.scale.set(sc, sc, sc); _o3.updateMatrix(); splash.setMatrixAt(i, _o3.matrix); } splash.instanceMatrix.needsUpdate = true; }
    // lather on the hands
    lather.count = 0;
    if (s.lather) { const n = Math.round(60 * clamp(s.lather, 0, 1)); ["L", "R"].forEach((S, si) => { const g = gripObj[S].userData.G; if (!g) return; for (let i = 0; i < n / 2; i++) { const a = i * 2.4 + si, b = i * 1.7;
      _o3.position.set(g.x + Math.cos(a) * 0.035, g.y + Math.sin(b) * 0.025, g.z + Math.sin(a) * 0.04); const sc = 0.004 + (i % 4) * 0.0025; _o3.scale.set(sc, sc, sc); _o3.updateMatrix(); lather.setMatrixAt(lather.count++, _o3.matrix); } }); lather.instanceMatrix.needsUpdate = true; }
    // the cooktop rings: on when the pan or pot is cooking
    const panOn = s.burner != null ? s.burner : (s.panHeat || (s.pan.kind && s.pan.kind !== "oil" && seg.stand === "stove" ? 0.8 : 0)), potOn = s.potBurner != null ? s.potBurner : (s.pot.heat ? s.pot.heat : 0);
    rings.pan.m.emissiveIntensity = 2.4 * panOn; rings.pan.m.color.set(panOn ? 0x4a1a10 : 0x2a2a2c);
    rings.pot.m.emissiveIntensity = 2.4 * potOn; rings.pot.m.color.set(potOn ? 0x4a1a10 : 0x2a2a2c);
    rings.bl.m.emissiveIntensity = 0; rings.br.m.emissiveIntensity = 0;
    // the board and what is on it
    const pieceList = [];
    const pr = s.board ? getProduce(s.board.item) : null;
    Object.values(produceCache).forEach(p => { p.g.visible = false; });
    if (s.board && !s.held) boardFood(s.board, pieceList, pr);
    if (s.held) { const p = getProduce(s.held.item); p.g.visible = true; const g = gripObj.L.userData.G; p.g.matrixAutoUpdate = true; p.g.position.copy(g).add(V(-0.03, 0.0, 0.02)); p.g.rotation.set(0, (s.held.spin || 0) * D2R, s.held.tilt * D2R * 0.6); p.g.scale.setScalar(1); }
    if (s.rinseItem && s.colanderShow) { const p = getProduce(s.rinseItem); p.g.visible = true; p.g.position.set(SINK.x, TOP - SINK.depth + 0.06, SINK.z); p.g.rotation.set(0, 0.4, 0); }
    colander.visible = !!(s.colanderShow || s.colander);
    // the bowl
    const b = s.bowl, bowlVisible = b.kind !== "empty" || ["whisk", "fold", "crack-egg", "measure-dry", "stir", "pour"].includes(seg.id) && !(seg.stand === "stove" || seg.stand === "pot" || seg.stand === "sink");
    bowl.visible = bowlVisible || b.pieces.length > 0;
    bowl.position.set(BOWL.x, TOP, BOWL.z); bowl.rotation.set(-(s.bowlTilt || 0), s.bowlSpin || 0, 0);
    if (s.bowlHeld && s.bowlPos) { bowl.position.copy(s.bowlPos); bowl.rotation.set(0, 0, s.bowlHeld.tilt * 0.9 * (s.bowlHeld.k)); }
    bowlContents(b, s, seg, pieceList);
    smallBowl.visible = has(st, "smallbowl") || seg.id === "crack-egg";
    eggDish.visible = seg.id === "crack-egg";
    eggsWaiting.forEach((e, i) => { e.visible = seg.id === "crack-egg" && i < (s.egg && s.egg.mode ? 2 : 3); });
    eggScene(s);
    // pan and pot
    panScene(s, seg, pieceList, au);
    potScene(s, seg, au);
    // pour stream
    pourStream.visible = false;
    if (s.stream) { const from = s.stream.from === "jug" ? TOOL.jug.obj.localToWorld(V(0.0, 0.07, 0.14)) : s.stream.from === "bottle" ? s.bottleMouth || V(-0.05, TOP + 0.26, 0.42) : s.stream.from === "pot" ? s.potMouth || V(SINK.x + 0.05, TOP + 0.2, SINK.z) : bowl.localToWorld(V(-0.12, 0.09, 0)); setStream(from, s.stream.to, s.stream.from === "pot" ? 0.012 : 0.0055, M[s.stream.m] || M.milk); }
    // bottle for measuring liquid
    bottle.visible = !!s.bottle;
    if (s.bottle) { const g = s.bottle.rest ? s.bottle.pos : gripObj.R.userData.G; bottle.position.copy(g).add(V(0.03, 0, 0)); bottle.rotation.set(0, 0, s.bottle.rest ? 0 : -s.bottle.tilt * 1.7); bottleLiquid.material = M[s.liquid === "water" ? "water" : s.liquid] || M.milk; s.bottleMouth = bottle.localToWorld(V(0, 0.2, 0)); }
    // the jug's liquid level
    if (TOOL.jug.obj.visible) { const lq = TOOL.jug.inner.userData.liq, f = clamp(s.jugFill != null ? s.jugFill : 0, 0, 1); lq.visible = f > 0.01; lq.scale.set(1, Math.max(0.001, f * 0.1), 1); lq.position.y = -0.054 + f * 0.05; lq.material = M[s.liquid === "water" ? "water" : (s.liquid || "milk")] || M.milk;
      if (seg.id === "measure-liquid" && s.jugAt === "counter") { const m = new THREE.Matrix4().compose(V(0.12 + 0.0, TOP + 0.06, 0.42), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, -Math.PI / 2, "YXZ")), V(1, 1, 1)); placeTool("jug", m); } }
    // the dry cup's fill
    if (TOOL.cups.obj.visible) { const f = s.cupFill || 0, fl = TOOL.cups.obj.userData.fill; fl.visible = f > 0.02; fl.scale.set(1, clamp(f, 0.02, 1.25), 1); fl.material = M[dryFor(st)] || M.flour; }
    bag.visible = !!s.bag; cellar.visible = !!s.cellar;
    // salt falling
    fallers.count = 0;
    if (s.salt) { for (let i = 0; i < 30; i++) { const k = (s.salt.k * 3 + i / 30) % 1; const p = s.salt.from.clone().lerp(s.salt.to, k); p.x += Math.sin(i * 7.1) * 0.02 * k; p.z += Math.cos(i * 3.3) * 0.02 * k; _o3.position.copy(p); _o3.scale.setScalar(0.0018); _o3.updateMatrix(); fallers.setMatrixAt(fallers.count++, _o3.matrix); } fallers.instanceMatrix.needsUpdate = true; }
    // the grater and its pile
    if (s.graterShow || s.grated) { if (s.graterShow) homeTool("grater"); const pile = clamp(s.grated, 0, 1); const items = []; for (let i = 0; i < Math.round(60 * pile); i++) { const a = i * 2.4, r = Math.sqrt(i / 60) * 0.04; items.push([0.05 + 0.045 + Math.cos(a) * r * 0.6, BTOP + 0.002 + (1 - r / 0.04) * 0.012 * pile, BOARD.z + Math.sin(a) * r, 0.002, 0.002, 0.012, 0, a, 0.3]); } pieceList.push({ m: M.cheese, shape: "strip", items }); }
    if (s.cheeseBlock) { const p = getProduce("cheese"); p.g.visible = true; p.g.position.copy(s.cheeseBlock.pos); p.g.rotation.set(0, 0, Math.PI / 2 - 0.4); p.g.scale.set(s.cheeseBlock.size, 1, 1); }
    // dough, tin, tray
    doughScene(s, seg, au);
    tinScene(s, seg, au);
    // oven door and rack
    oven.door.rotation.x = -(s.door || 0) * 1.45; oven.rack.position.z = FRONT + 0.27 - OVEN.out * (s.rack || 0);
    M.ovenGlow.emissiveIntensity = (s.ovenOn ? 1.2 : 0) * (0.4 + 0.6 * (s.door || 0));
    // the plate
    plateScene(s, seg, au, pieceList);
    // glass (parfait)
    glassCup.visible = has(st, "glass") || s.glass > 0; glassCup.position.set(-0.12, TOP, 0.42);
    parfait.forEach((l, i) => { const k = s.glass ? 1 : (seg.id === "plate" ? clamp(au * 6 - i, 0, 1) : 0); l.visible = k > 0.02; l.scale.y = Math.max(0.01, k); l.position.y = 0.018 + i * 0.021 - 0.01 * (1 - k); });
    putPieces(pieceList);
    // thermometer screen
    if (s.thermo && TOOL.thermo.obj.visible) M.screen.emissiveIntensity = 0.25 + 0.5 * s.thermo.k;
    lastInfo.thermo = s.thermo || null;
    // steam over hot water
    steam.count = 0;
    if ((s.pot.heat || s.boilK) && s.pot.water) { const k = Math.max(s.pot.heat || 0, s.boilK || 0); for (let i = 0; i < 10; i++) { const ph = (i / 10 + au * 0.8) % 1; _o3.position.set(POT.x + Math.sin(i * 2.1) * 0.05 + Math.sin(ph * 6 + i) * 0.02, TOP + POT.h + 0.03 + ph * 0.3, POT.z + Math.cos(i * 1.7) * 0.05); _o3.scale.setScalar((0.02 + ph * 0.05) * k); _o3.updateMatrix(); steam.setMatrixAt(steam.count++, _o3.matrix); } steam.instanceMatrix.needsUpdate = true; M.steam.opacity = 0.12; }
  }
  // a bag of flour (no label) and a salt cellar
  const bag = grp(mesh(rbox(0.12, 0.16, 0.08, 0.03), M.cloth), at(mesh(sph(0.055, 18, 12), M.flour), 0, 0.08, 0)); bag.children[1].scale.y = 0.35; bag.position.set(-0.2, TOP + 0.08, 0.62); island.add(bag); bag.visible = false;
  const cellar = grp(mesh(lathe([[0, 0], [0.04, 0], [0.045, 0.04], [0.04, 0.045], [0, 0.045]], 24), M.ceramic), at(mesh(G(new THREE.CircleGeometry(0.038, 24)), M.salt), 0, 0.042, 0, -Math.PI / 2)); cellar.position.set(-0.12, TOP, 0.62); island.add(cellar); cellar.visible = false;
  const bottleLiquid = mesh(cyl(0.031, 0.031, 0.15, 24), M.milk, false, false);
  const bottle = grp(mesh(lathe([[0, 0], [0.034, 0], [0.036, 0.01], [0.036, 0.16], [0.015, 0.2], [0.014, 0.22], [0, 0.22]], 24), M.jug, false, false), at(bottleLiquid, 0, 0.085, 0)); scene.add(bottle); bottle.visible = false;

  function boardFood(bd, list, pr) {
    const z = BOARD.z - 0.01, y0 = BTOP;
    const prog = bd.prog != null ? bd.prog : (bd.cut ? 1 : 0), len = pr.len, x0 = BOARD.x - len / 2 + 0.01;
    // the uncut part stays whole (a clean end where the last cut was); the cut part lies in pieces
    const cutTo = x0 + prog * (len - 0.02);
    const round = !["carrot", "cucumber", "banana", "cheese"].includes(pr.kind);
    if (prog < 0.999 || !bd.cut) {
      pr.g.visible = true; pr.g.matrixAutoUpdate = true; pr.g.rotation.set(0, 0, 0);
      const keep = 1 - prog * 0.97; pr.g.scale.set(keep, 1, 1); pr.g.position.set(BOARD.x + (len * (1 - keep)) / 2 + 0.008 * prog, y0 + pr.rad * (round ? 1 : 0.95), z);
      if (bd.peeled && pr.kind === "carrot") pr.g.children[0].material = M.carrot;
    }
    if (!bd.cut) return;
    const style = bd.style || "chop", n = Math.max(1, Math.round(prog * (style === "mince" ? 40 : style === "dice" ? 30 : style === "slice" ? 10 : 7)));
    const items = []; let shape = "coin", m = pr.coinM;
    const sx = pr.rad;
    if (style === "slice" || style === "chop") {
      if (round && style === "chop") { shape = "cube"; m = pr.pieceM; for (let i = 0; i < n; i++) { const a = i * 2.3; items.push([x0 - 0.02 + (i % 4) * 0.018 * 0.9 + (Math.floor(i / 4)) * 0.004, y0 + 0.01, z - 0.03 + Math.floor(i / 4) * 0.022 + Math.sin(a) * 0.004, pr.rad * 0.5, pr.rad * 0.45, pr.rad * 0.5, 0.1 * Math.sin(a), a, 0.1]); } }
      else if (round) { shape = "half"; m = pr.coinM; for (let i = 0; i < n; i++) { items.push([x0 - 0.01 + i * 0.012, y0 + pr.rad * 0.7, z + (i % 2) * 0.004, 0.005, pr.rad * 0.8, pr.rad * 0.9, 0, 0, -0.25 - i * 0.02]); } }
      else { const th = Math.max(0.006, (len - 0.02) / 10); for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * th - 0.012 * (1 - i / n), r = sx * (0.6 + 0.4 * Math.sin(clamp((x - x0) / len, 0, 1) * Math.PI) ** 0.3); items.push([x - 0.012, y0 + r * 0.98, z + Math.sin(i * 1.7) * 0.004, r, th * 0.82, r, 0, 0, Math.PI / 2 + 0.2 + Math.sin(i) * 0.12]); } }
    } else if (style === "dice") { shape = "cube"; m = pr.pieceM; const s = Math.max(0.006, pr.rad * 0.38); for (let i = 0; i < n; i++) { const a = i * 2.39996, r = Math.sqrt(i) * s * 0.9; items.push([x0 - 0.01 + Math.cos(a) * r * 0.8, y0 + s * 0.5 + (i > 18 ? s * 0.8 : 0), z + Math.sin(a) * r * 0.7, s, s * 0.9, s, a * 0.3, a, 0]); } }
    else { shape = "bit"; m = pr.pieceM; for (let i = 0; i < n; i++) { const a = i * 2.39996, r = Math.sqrt(i) * 0.0035; items.push([BOARD.x + 0.02 + Math.cos(a) * r, y0 + 0.002 + (1 - r / 0.025) * 0.004, z + 0.04 + Math.sin(a) * r * 0.7, 0.0025, 0.0017, 0.0022, 0, a, 0]); } }
    list.push({ m, shape, items });
  }
  const BOWL_LOOK = { dry: "flour", wet: "milk", eggs: "eggWhite", beaten: "beaten", batter: "batter", wetdry: "batter", dough: "dough", emulsion: "dressing", dressing: "vinegar", fruit: "bananaFlesh", pieces: "bananaFlesh" };
  function bowlContents(b, s, seg, list) {
    bowlFill.visible = false; bowlMound.visible = false; yolksInBowl.forEach(y => { y.visible = false; });
    if (b.kind === "empty" && !b.pieces.length && !(s.fillInto && s.fillInto.into === "bowl")) return;
    let kind = b.kind, fill = b.fill;
    if (s.fillInto && s.fillInto.into === "bowl") { fill = Math.max(fill, 0.15) + 0.2 * s.fillInto.k; if (kind === "empty") kind = "wet"; }
    if (seg.id === "measure-dry" && s.cupFill != null) { const add = win(current.u * 1, 0, 1); }
    const level = 0.025 + 0.05 * clamp(fill, 0, 1), r = 0.06 + 0.055 * clamp(fill, 0, 1) / 1 + 0.0;
    if (kind === "dry") { bowlMound.visible = true; bowlMound.material = M[b.m] || M.flour; bowlMound.position.y = 0.012; bowlMound.scale.set(0.045 + 0.04 * fill, 0.015 + 0.03 * fill, 0.045 + 0.04 * fill); if (s.mixing != null && seg.id === "whisk") bowlMound.scale.y *= 1 - 0.4 * s.mixing; return; }
    if (kind === "pieces" || kind === "fruit") { bowlFill.visible = b.glaze ? true : false; bowlFill.material = M.honey; bowlFill.position.y = 0.02; bowlFill.scale.set(0.07, 0.07, 1);
      const items = []; b.pieces.forEach(([it, st], j) => { const pr = getProduce(it); for (let i = 0; i < 14; i++) { const a = i * 2.39996 + j * 1.3, rr = Math.sqrt(i / 14) * 0.075; const w = (bowl.matrixWorld ? 1 : 1);
        const p = bowl.localToWorld(V(Math.cos(a + (s.bowlSpin || 0) * 0) * rr, 0.025 + (1 - rr / 0.075) * 0.02 + j * 0.008, Math.sin(a) * rr)); const sz = it === "strawberry" ? 0.012 : it === "grape" || it === "blueberry" ? 0.011 : 0.009;
        items.push([p.x, p.y, p.z, sz, sz * (it === "banana" ? 0.5 : 0.9), sz, a, a * 2, 0]); } list.push({ m: it === "grape" ? M.grape : it === "blueberry" ? M.blueberry : pr.coinM, shape: it === "grape" || it === "blueberry" ? "bit" : st === "dice" ? "cube" : "coin", items: items.splice(0) }); });
      return; }
    bowlFill.visible = true; bowlFill.position.y = level; bowlFill.scale.set(r + 0.004, r + 0.004, 1);
    let mm = BOWL_LOOK[kind] || "milk"; if (kind === "wet") mm = b.m && M[b.m] ? b.m : "milk";
    if (kind === "eggs" || (b.yolks && kind !== "beaten")) { mm = "eggWhite"; yolksInBowl.forEach((y, i) => { y.visible = i < b.yolks; y.position.set(Math.cos(i * 2.4) * 0.025 * (i > 0), level + 0.004, Math.sin(i * 2.4) * 0.025 * (i > 0)); }); }
    if (seg.id === "whisk" && s.mixing != null) { const m = s.mixing; if (b.yolks || kind === "eggs") { yolksInBowl.forEach(y => { y.visible = y.visible && m < 0.3; }); mm = m < 0.3 ? "eggWhite" : "beaten"; } if (b.m === "vinegar" || kind === "dressing") mm = m < 0.5 ? "vinegar" : "dressing"; if (kind === "wetdry") mm = "batter"; }
    if (seg.id === "pour" && s.fillInto && kind === "dressing") mm = "vinegar";
    bowlFill.material = M[mm] || M.milk;
  }
  function eggScene(s) {
    egg.whole.visible = egg.a.visible = egg.b.visible = egg.yolk.visible = egg.white.visible = egg.crack.visible = false;
    if (!s.egg) return;
    const e = s.egg;
    if (e.mode === "whole") { egg.whole.visible = true; egg.whole.position.copy(e.pos); egg.whole.rotation.set(0, 0, Math.PI / 2); if (e.cracked) { egg.crack.visible = true; egg.crack.position.copy(e.pos); egg.crack.rotation.set(0, Math.PI / 2, 0); } return; }
    if (e.gone) return;
    egg.a.visible = egg.b.visible = true;
    egg.a.position.copy(e.posR); egg.a.rotation.set(0, 0, -Math.PI / 2 + e.roll * 0.9);
    egg.b.position.copy(e.posL); egg.b.rotation.set(0, 0, -Math.PI / 2 - e.roll * 0.9);
    if (e.fall > 0 && e.fall < 1) { egg.yolk.visible = true; egg.white.visible = true; const p = e.pos.clone().lerp(e.into.clone().add(V(0, 0.03, 0)), e.fall * e.fall); egg.yolk.position.copy(p); egg.white.position.copy(p).add(V(0, 0.01, 0)); egg.white.scale.set(0.02, 0.02 + 0.03 * e.fall, 0.02); }
  }
  function panScene(s, seg, list, au) {
    panFood.clear(); pancake.visible = false; curds.count = 0;
    pan.visible = !!(s.pan.kind || ["flip", "saute"].includes(seg.id) || (seg.stand === "stove") || s.panHeat) || (RC && RC.steps.some(x => x.a.includes("saute") || x.a.includes("flip")));
    const k = s.pan.kind; const into = s.fillInto && s.fillInto.into === "pan" ? s.fillInto.k : null;
    let kind = k; if (into != null && !k) kind = (s.bowl.kind === "batter") ? "pancake" : s.bowl.kind === "beaten" ? "eggs" : "oil";
    if (into != null && (s.bowl.kind === "batter")) kind = "pancake"; if (into != null && s.bowl.kind === "beaten") kind = "eggs";
    if (kind === "pancake" || s.pancake) {
      pancake.visible = true; const pc = s.pancake;
      const grow = into != null ? Math.max(0.15, into) : 1;
      pancake.scale.set(grow, 1, grow);
      const cook = pc ? pc.cook : s.pan.cook != null ? (seg.id === "pour" ? into * 0.5 : Math.max(0.5, s.pan.cook)) : 0;
      // the top shows raw batter with bubbles as it cooks; after the flip the golden side is up
      const flipped = s.pan.flip || (pc && pc.flipK > 0.5);
      const top = pcTop.material; top.map = T.pancakeTop; top.color.setRGB(1, 1, 1);
      if (!flipped) { top.map = T.pancakeTop; const bub = clamp((cook - 0.3) / 0.5, 0, 1); top.color.setRGB(1, 1 - 0.04 * bub, 1 - 0.1 * bub); top.roughnessMap = null; top.bumpMap = T.pancakeBubbles; top.bumpScale = 0.01 * bub; }
      else { top.map = T.pancakeBrown; top.bumpMap = null; }
      top.needsUpdate = true;
      pcBot.material = flipped ? M.pancakeTop : M.pancakeBrown;
      if (pc) { const base = P(PAN.x, TOP + 0.012, PAN.z); const at2 = base.clone().lerp(pc.at.clone().add(V(0.02, 0.0, 0.06)), pc.slide * 0.25); at2.y += pc.lift + Math.sin(pc.flipK * Math.PI) * 0.05;
        pancake.position.copy(at2); pancake.rotation.set(0, 0, 0); pancake.rotateOnWorldAxis(nrm(0.3, 0, 1), -pc.flipK * Math.PI); }
      else { pancake.position.set(PAN.x, TOP + 0.012, PAN.z); pancake.rotation.set(0, 0, 0); }
      if (s.serveFrom) { pancake.position.copy(s.serveFrom).add(V(0, 0.008, 0)); pancake.rotation.set(0, 0, 0); pcTop.material.map = T.pancakeBrown; }
    } else if (kind === "eggs" || kind === "scrambled") {
      const set = kind === "scrambled" ? 1 : seg.id === "stir" ? (s.mixing || 0) : seg.id === "check-temp" || seg.id === "plate" ? 1 : 0;
      if (set < 0.3) { const f = mesh(G(new THREE.CircleGeometry(0.1 * (into != null ? Math.max(0.2, into) : 1), 40)), M.beaten, false, true); f.rotation.x = -Math.PI / 2; f.position.y = 0.011; panFood.add(f); track(f.geometry); }
      const n = Math.round(60 * set); for (let i = 0; i < n; i++) { const a = i * 2.39996, r = Math.sqrt(i / 60) * 0.085; const p = pan.localToWorld(V(Math.cos(a) * r, 0.016, Math.sin(a) * r)); if (s.serveFrom) p.copy(s.serveFrom).add(V(Math.cos(a) * r * 0.4, 0.01, Math.sin(a) * r * 0.4));
        _o3.position.copy(p); _o3.scale.set(0.011 + (i % 3) * 0.003, 0.007, 0.01); _o3.rotation.set(0, a, 0); _o3.updateMatrix(); curds.setMatrixAt(curds.count++, _o3.matrix); }
      curds.instanceMatrix.needsUpdate = true;
    } else if (kind === "sauce") { const f = mesh(G(new THREE.CircleGeometry(0.115, 40)), M.sauce, false, true); f.rotation.x = -Math.PI / 2; f.position.y = 0.016; panFood.add(f); track(f.geometry);
      if (s.simmerK) for (let i = 0; i < 8; i++) { const ph = (i * 0.37 + au * 3) % 1; const bb = mesh(sph(0.004 + 0.004 * Math.sin(ph * Math.PI), 8, 6), M.sauce); bb.position.set(Math.cos(i * 2.4) * 0.06, 0.017, Math.sin(i * 2.4) * 0.06); panFood.add(bb); } }
    else if (kind === "butter" || kind === "oil" || kind === "veg" || kind === "garlic") {
      const f = mesh(G(new THREE.CircleGeometry(kind === "butter" ? 0.06 + 0.03 * (s.sizzle || 1) : 0.09, 32)), kind === "butter" ? M.butter : M.oil, false, true); f.rotation.x = -Math.PI / 2; f.position.y = 0.0095; panFood.add(f); track(f.geometry);
      const pcs = s.pan.pieces.length ? s.pan.pieces : (seg.id === "saute" ? stepItems(seg.stand ? RC.steps[current.k] : {}).map(i => i.item).filter(x => PRODUCE.includes(x)) : []);
      const brown = clamp(s.pan.cook || (s.sizzle || 0), 0, 1);
      pcs.forEach((it, j) => { const pr = getProduce(it); const items = []; for (let i = 0; i < 12; i++) { const a = i * 2.39996 + j * 0.9 + (s.panMove || 0) * 0.08 * ((i % 2) ? 1 : -1), r = Math.sqrt((i + 0.5) / 12) * 0.085; const p = pan.localToWorld(V(Math.cos(a) * r, 0.015, Math.sin(a) * r)); const sz = it === "garlic" ? 0.004 : 0.009;
        items.push([p.x, p.y, p.z, sz, sz * 0.7, sz, a, a, 0]); } list.push({ m: it === "broccoli" ? M.broccoli : it === "bellpepper" ? M.pepperRed : pr.pieceM, shape: it === "carrot" ? "coin" : it === "garlic" ? "bit" : it === "bellpepper" ? "strip" : "cube", items }); });
    }
    if (s.panMove != null) pan.position.x = PAN.x + Math.sin(s.panMove) * 0.004; else pan.position.x = PAN.x;
  }
  function potScene(s, seg, au) {
    pot.visible = !!(s.pot.water || s.pot.heat || s.pot.sauce || ["boil", "simmer"].includes(seg.id) && seg.stand === "pot" || s.potHeld) || (RC && RC.steps.some(x => x.a.includes("boil")));
    if (s.potHeld) { pot.position.copy(s.potHeld.pos); pot.rotation.set(0, 0, s.potHeld.tilt); s.potMouth = pot.localToWorld(V(-POT.r, POT.h, 0)); } else { pot.position.set(POT.x, TOP + 0.004, POT.z); pot.rotation.set(0, 0, 0); }
    potWater.visible = !!s.pot.water; potSauce.visible = !!s.pot.sauce && !s.pot.water;
    potLid.visible = true;
    if (s.lidHeld) { potLid.position.copy(pot.worldToLocal(s.lidHeld.clone())); potLid.rotation.set(-0.55 * (s.lidTilt || 0), 0, 0); }
    else if (s.lidRest && !s.pot.lid) { potLid.position.copy(pot.worldToLocal(V(...s.lidRest))); potLid.rotation.set(0, 0, 0); }
    else if (s.pot.lid && !(s.pot.pasta)) { potLid.position.set(0, POT.h + 0.004, 0); potLid.rotation.set(0, 0, 0); }
    else { potLid.position.set(0.0, 0.0, 0); potLid.visible = false; }
    // bubbles: big rolling ones for a boil, small gentle ones for a simmer
    bubbles.count = 0;
    const heat = s.boilK != null ? s.boilK : (s.pot.heat || 0);
    if (s.pot.water && heat > 0.05 && pot.visible) { const n = Math.round(36 * heat), big = heat > 0.7 ? 1 : 0.5; for (let i = 0; i < n; i++) { const ph = (i * 0.618 + au * (2 + 3 * heat)) % 1; const a = i * 2.39996, r = Math.sqrt((i + 0.5) / 36) * (POT.r - 0.02);
      _o3.position.set(pot.position.x + Math.cos(a) * r, pot.position.y + POT.h * 0.7 + 0.002, pot.position.z + Math.sin(a) * r); const sc = (0.003 + 0.007 * big) * Math.sin(ph * Math.PI); _o3.scale.set(sc, sc * 0.7, sc); _o3.updateMatrix(); bubbles.setMatrixAt(bubbles.count++, _o3.matrix); } bubbles.instanceMatrix.needsUpdate = true; }
    // spaghetti: stiff sticks that soften and sink into the water
    spaghetti.count = 0; noodles.count = 0;
    const pin = s.pastaIn != null ? s.pastaIn : (s.pot.pasta ? 1 : 0), soft = s.pastaSoft != null ? s.pastaSoft : (s.pot.pasta ? 1 : 0);
    if (pin > 0 && pot.visible && !s.potHeld) {
      const nS = Math.round(30 * (1 - soft)), nN = Math.round(36 * soft);
      for (let i = 0; i < nS; i++) { const a = i * 2.39996, r = 0.01 + (i % 5) * 0.004, lean = 0.25 + 0.5 * soft;
        _o3.position.set(POT.x + Math.cos(a) * r, TOP + POT.h * 0.7 + 0.12 * (1 - pin) - 0.08, POT.z + Math.sin(a) * r); _o3.rotation.set(Math.sin(a) * lean, 0, Math.cos(a) * lean); _o3.scale.setScalar(1); _o3.updateMatrix(); spaghetti.setMatrixAt(spaghetti.count++, _o3.matrix); }
      for (let i = 0; i < nN; i++) { const a = i * 2.39996; _o3.position.set(POT.x + Math.cos(a) * 0.03, TOP + POT.h * 0.62 + (i % 4) * 0.004, POT.z + Math.sin(a) * 0.03); _o3.rotation.set(0, a, 0); _o3.scale.setScalar(0.95); _o3.updateMatrix(); noodles.setMatrixAt(noodles.count++, _o3.matrix); }
      spaghetti.instanceMatrix.needsUpdate = true; noodles.instanceMatrix.needsUpdate = true;
    }
    if (s.colander === "pasta" || (s.potHeld && s.potHeld.tilt > 0.6)) { for (let i = 0; i < 30; i++) { const a = i * 2.39996; _o3.position.set(SINK.x + Math.cos(a) * 0.04, TOP - SINK.depth + 0.04 + (i % 4) * 0.005, SINK.z + Math.sin(a) * 0.04); _o3.rotation.set(0, a, 0); _o3.scale.setScalar(1); _o3.updateMatrix(); noodles.setMatrixAt(noodles.count++, _o3.matrix); } noodles.instanceMatrix.needsUpdate = true; }
  }
  function doughScene(s, seg, au) {
    dough.visible = false; doughSauce.visible = false; doughCheese.count = 0; tray.visible = false;
    let d = s.dough;
    if (!d && s.bowl.kind === "dough") { dough.visible = true; dough.position.copy(bowl.localToWorld(V(0, 0.05, 0))); dough.scale.set(0.06, 0.04, 0.06); dough.material = M.dough; return; }
    if (seg.id === "knead" && !d) d = { where: "board", smooth: 0, rise: 0, flat: 0, sauce: 0, cheese: 0, baked: 0 };
    if (!d) return;
    dough.visible = true; dough.material = d.baked ? M.crust : M.dough;
    const kn = s.knead;
    if (d.where === "bowl" || (s.riseK != null)) { const r = s.riseK != null ? s.riseK : d.rise; dough.position.set(BOWL.x, TOP + 0.04 + 0.01 * r, BOWL.z); bowl.visible = true; const sc = 0.055 * (1 + 0.28 * r); dough.scale.set(sc, sc * 0.8, sc); return; }
    if (d.flat || s.roll != null) { const f = s.roll != null ? sst(0, 1, s.roll) : 1; tray.visible = true; tray.position.set(0, TOP + 0.007, 0.4); tray.rotation.set(0, 0, 0);
      const bake = s.bakeObj; if (bake && seg.id === "bake") tray.position.copy(bake.pos);
      dough.position.copy(tray.position).add(V(0, 0.012, 0)); const r = lerp(0.07, 0.15, f); dough.scale.set(r, lerp(0.05, 0.007, f), r * 0.92);
      const sp = s.spreadK != null ? s.spreadK : d.sauce; if (sp > 0) { doughSauce.visible = true; doughSauce.position.copy(dough.position).add(V(0, 0.0075, 0)); doughSauce.scale.setScalar(Math.max(0.01, 0.13 * sp)); }
      const ch = s.cheeseProg != null ? s.cheeseProg : d.cheese; if (ch > 0) { const n = Math.round(110 * ch); for (let i = 0; i < n; i++) { const a = i * 2.39996, rr = Math.sqrt(i / 110) * 0.12; _o3.position.set(dough.position.x + Math.cos(a) * rr, dough.position.y + 0.009, dough.position.z + Math.sin(a) * rr); _o3.rotation.set(0, a, 0); _o3.scale.set(0.012, 0.003, 0.004); _o3.updateMatrix(); doughCheese.setMatrixAt(doughCheese.count++, _o3.matrix); } doughCheese.instanceMatrix.needsUpdate = true; doughCheese.material = d.baked || (s.baked && seg.id === "bake") ? M.crust : M.cheese; }
      if (seg.id === "bake" && s.baked) dough.material = M.crust;
      return; }
    // a ball on the board, squashed by the push, smoother as it is kneaded
    const push = kn ? kn.push : 0, smooth = kn ? kn.smooth : d.smooth;
    dough.position.set(0.0, TOP + 0.035 - 0.012 * push, BOARD.z + 0.04 * push);
    dough.scale.set(0.06 * (1 + 0.12 * push), 0.042 * (1 - 0.3 * push), 0.06 * (1 + 0.45 * push));
    dough.rotation.set(0, kn ? kn.turn : 0, 0);
    M.dough.roughness = lerp(0.85, 0.5, smooth); M.dough.bumpMap = T.knit; M.dough.bumpScale = lerp(0.6, 0.05, smooth);
  }
  function tinScene(s, seg, au) {
    tin.visible = !!(s.tin || (seg.id === "bake" && !(s.dough && s.dough.flat)) || (seg.id === "pour" && s.fillInto && s.fillInto.into === "tin"));
    if (!tin.visible) return;
    tin.position.set(0, TOP + 0.015, 0.42); tin.rotation.set(0, 0, 0);
    if (s.bakeObj && seg.id === "bake") tin.position.copy(s.bakeObj.pos).add(V(0, 0.005, 0));
    const fill = s.fillInto && s.fillInto.into === "tin" ? s.fillInto.k : (s.tin ? s.tin.fill : 0), baked = (seg.id === "bake" ? s.baked : (s.tin && s.tin.baked)) || 0;
    muffins.forEach((m, i) => { const f = clamp(fill * 12 - i, 0, 1); m.visible = f > 0.02; m.material = baked ? M.muffin : M.batter; const h = baked ? 0.85 : 0.35 * f + 0.05; m.scale.set(0.95 * Math.max(0.3, f), h, 0.95 * Math.max(0.3, f)); m.position.y = baked ? 0.035 : 0.015 + 0.006 * f; });
  }
  function plateScene(s, seg, au, list) {
    plate.visible = !!(s.plate || s.plateShow) && !s.glass && !(RC && RC.steps[current.k] && has(RC.steps[current.k], "glass"));
    const pl = s.plateAt || P(-0.12, TOP, 0.42); plate.position.copy(pl);
    pancakeStack.visible = false;
    if (!plate.visible) return;
    const kind = s.plate || (seg.id === "plate" ? (s.pan.kind === "pancake" ? "pancakes" : s.pan.kind || (s.pot.pasta || s.colander === "pasta" ? "pasta" : s.tin && s.tin.baked ? "muffins" : s.bowl.kind === "fruit" ? "fruit" : "generic")) : null);
    const k = s.plate ? 1 : s.plateK || 0;
    if (kind === "pancakes") { pancakeStack.visible = k > 0.5 || !!s.plate; pancakeStack.position.copy(pl).add(V(0, 0.016, 0)); pancakeStack.children.forEach((p, i) => { p.visible = i < Math.ceil(3 * (s.plate ? 1 : k)); }); }
    else if (kind === "scrambled" || kind === "eggs") { const items = []; for (let i = 0; i < Math.round(40 * k); i++) { const a = i * 2.39996, r = Math.sqrt(i / 40) * 0.05; items.push([pl.x + Math.cos(a) * r, pl.y + 0.016 + (1 - r / 0.05) * 0.008, pl.z + Math.sin(a) * r, 0.012, 0.008, 0.011, 0, a, 0]); } list.push({ m: M.scrambled, shape: "bit", items }); }
    else if (kind === "pasta") { for (let i = 0; i < Math.round(30 * k); i++) { const a = i * 2.39996; _o3.position.set(pl.x + Math.cos(a) * 0.02, pl.y + 0.012 + (i % 5) * 0.004, pl.z + Math.sin(a) * 0.02); _o3.rotation.set(0, a, 0); _o3.scale.setScalar(0.9); _o3.updateMatrix(); noodles.setMatrixAt(noodles.count++, _o3.matrix); } noodles.instanceMatrix.needsUpdate = true;
      const sc = mesh(G(new THREE.CircleGeometry(0.045 * k + 0.001, 30)), M.sauce, false, false); }
    else if (kind === "muffins") { const items = []; for (let i = 0; i < Math.round(3 * Math.max(k, 0.01)); i++) items.push([pl.x - 0.05 + i * 0.05, pl.y + 0.03, pl.z + (i % 2) * 0.03, 0.033, 0.03, 0.033, 0, 0, 0]); list.push({ m: M.muffin, shape: "bit", items }); }
    else if (kind === "veg" || kind === "fruit" || kind === "sauce" || kind === "generic") { const items = []; for (let i = 0; i < Math.round(40 * k); i++) { const a = i * 2.39996, r = Math.sqrt(i / 40) * 0.06; items.push([pl.x + Math.cos(a) * r, pl.y + 0.016 + (1 - r / 0.06) * 0.01, pl.z + Math.sin(a) * r, 0.009, 0.007, 0.009, a, a, 0]); }
      list.push({ m: kind === "fruit" ? M.strawCut : kind === "sauce" ? M.sauce : kind === "veg" ? M.pepperRed : M.rice, shape: "cube", items }); }
  }

  /* ══ CAMERA ══ */
  const orbit = { yaw: 0.6, pitch: 0.32, dist: 2.6 };
  function aimCamera() {
    const f = FIG.focus || V(0, TOP, 0.4), x = FIG.x, z = FIG.z, yaw = FIG.yaw || 0;
    const aspect = camera.aspect, narrow = aspect < 1.1;
    const atOven = lastInfo && lastInfo.stand === "oven";
    if (atOven && (view === "shoulder" || view === "across")) {   // the oven is low on the cook's side: look from beside the cook
      camera.fov = narrow ? 58 : 46; const side = view === "shoulder" ? 1 : -1;
      camera.position.set(OVEN.x + side * 1.05, 1.25, -0.95); camera.lookAt(OVEN.x + side * 0.05, 0.52, -0.05); }
    else if (view === "across") { camera.fov = narrow ? 52 : 40; camera.position.set(f.x + 0.35, 1.5, 2.55 + (narrow ? 0.5 : 0)); camera.lookAt(f.x - 0.05, 1.08, 0.15); }
    else if (view === "hands") { camera.fov = narrow ? 46 : 36; const hand = lastInfo.R && lastInfo.R.G ? lastInfo.R.G.clone().lerp(f, 0.55) : f.clone(); hand.y = Math.max(hand.y, TOP + 0.03); camera.position.set(hand.x + 0.18, hand.y + 0.36, hand.z + 0.62 + (narrow ? 0.12 : 0)); camera.lookAt(hand.x, hand.y + 0.0, hand.z - 0.03); }
    else if (view === "walk") { camera.fov = narrow ? 55 : 42; const c = V(f.x * 0.6, 1.0, 0.35); camera.position.set(c.x + Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist, c.y + Math.sin(orbit.pitch) * orbit.dist, c.z + Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist); camera.lookAt(c); }
    else { // over the shoulder: just behind and above the cook's right shoulder, looking down at the hands
      camera.fov = narrow ? 60 : 48; const crouch = lastInfo && lastInfo.stand === "oven";
      // aim between the work place and the hands, so a bowl on the cook's left is not hidden behind the body
      const hs = [lastInfo.R, lastInfo.L].filter(h => h && h.G && !h.rest).map(h => h.G);
      const t = hs.length ? f.clone().lerp(hs.reduce((a, g) => a.add(g), V(0, 0, 0)).multiplyScalar(1 / hs.length), 0.6) : f.clone(); t.y = Math.max(t.y, TOP - 0.02);
      camera.position.set(t.x + (lastInfo.camSide || -1) * 0.46, crouch ? 1.45 : 2.3, z - 0.34); camera.lookAt(t.x - 0.02, t.y - 0.02, t.z + 0.05); }
    camera.updateProjectionMatrix();
  }
  // walk around: drag with a finger or a mouse (only in that view)
  let drag = null;
  canvas.style.touchAction = "pan-y";
  function onDown(e) { if (view !== "walk") return; drag = { x: e.clientX, y: e.clientY, yaw: orbit.yaw, pitch: orbit.pitch }; canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); }
  function onMove(e) { if (!drag || view !== "walk") return; orbit.yaw = drag.yaw - (e.clientX - drag.x) * 0.008; orbit.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.006, 0.05, 1.1); draw(); }
  function onUp() { drag = null; }
  canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove); ["pointerup", "pointercancel", "pointerleave"].forEach(k => canvas.addEventListener(k, onUp));

  /* ══ LOOK: day or night ══ */
  function setDark(d) {
    dark = !!d;
    M.sky.map = dark ? T.night : T.sky; M.sky.emissiveMap = M.sky.map; M.sky.emissiveIntensity = dark ? 0.8 : 0.95; M.sky.needsUpdate = true;
    sun.intensity = dark ? 0.0 : 2.3; sun.color.set(dark ? 0x9fb4ff : 0xfff1dc);
    fill.intensity = dark ? 0.1 : 0.55; fill.color.set(dark ? 0x9fb0d0 : 0xfff6ea);
    // the room's soft sky light dims at night (three r160 has no scene.environmentIntensity, so each material is set)
    scene.traverse(o => { if (!o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
      if (m.envMapIntensity == null) return; if (m.userData.env0 == null) m.userData.env0 = m.envMapIntensity; m.envMapIntensity = m.userData.env0 * (dark ? 0.16 : 1); }); });
    lamp.intensity = dark ? 7 : 0; lamp2.intensity = dark ? 6 : 0; M.lampShade.emissiveIntensity = dark ? 1.4 : 0;
    lamp.castShadow = false;
    renderer.toneMappingExposure = dark ? 1.0 : 1.0;
    scene.background = new THREE.Color(dark ? 0x10151d : 0xf3ece0);
    scene.fog = new THREE.Fog(dark ? 0x10151d : 0xf3ece0, 6, 14);
  }
  function resize() { const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function draw() { aimCamera(); renderer.render(scene, camera); renders++; }

  /* the API the page uses */
  let disposed = false;
  setDark(dark); resize();
  const api = {
    load(rc) { buildStates(rc); moment(0, 0); draw(); },
    show(k, u) { if (disposed || !RC) return; moment(clamp(k, 0, RC.steps.length - 1), clamp(u, 0, 1)); draw(); },
    setView(v) { view = v; canvas.style.touchAction = v === "walk" ? "none" : "pan-y"; draw(); },
    setDark(d) { setDark(d); draw(); },
    resize() { resize(); draw(); },
    renders: () => renders,
    orbit(y, p, d) { orbit.yaw = y; orbit.pitch = p; if (d) orbit.dist = d; view = "walk"; draw(); },
    info: () => {   // for the checks: what is in each hand, and how far the hand is from where it should be
      const out = { action: lastInfo.action, stand: lastInfo.stand, thermo: lastInfo.thermo, hands: {} };
      ["R", "L"].forEach(S => { const g = gripObj[S].userData; const tool = g.tool; let gap = null;
        if (tool && TOOL[tool]) { const toolOrigin = V(0, 0, 0).applyMatrix4(TOOL[tool].obj.matrix); const handPalm = fig.hand(S).getWorldPosition(new THREE.Vector3()); gap = toolOrigin.distanceTo(handPalm); }
        out.hands[S] = { tool: tool || null, gap, miss: g.G && g.want ? g.G.distanceTo(g.want) : null }; });
      if (TOOL.knife.obj.visible) { out.knifeTipY = TOOL.knife.tip.clone().applyMatrix4(TOOL.knife.obj.matrix).y; out.boardTop = BTOP; }
      out.mitts = !!(mitts.R.visible && mitts.L.visible); out.door = oven.door.rotation.x;
      out.tools = Array.from(shownTools); return out;
    },
    figure: fig, scene, camera,
    dispose() {
      if (disposed) return; disposed = true;
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove);
      fig.dispose();
      scene.traverse(o => { if (o.geometry && o.geometry.dispose) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose && m.dispose()); });
      disposables.forEach(d => { try { d.dispose(); } catch (e) {} });
      pmrem.dispose(); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {}
      canvas.remove();
    }
  };
  return api;
}
