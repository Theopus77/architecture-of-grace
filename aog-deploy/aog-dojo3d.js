/* ══ AOG-DOJO-3D-V1 (2026-10-12) — the Dojo's room and the figure's posing (dojo.html, /dojo) ═════════════════════
   Jimmy: "I want more realism, not sharp straight lines … Hit the ceiling." A calm, real dojo: a smooth wooden floor,
   rounded mats, soft window light, a few smooth shapes on the walls (no words, no faces, no religious objects), a night
   look in dark theme. The figure is the shared one (aog-figure3d.js, outfit "gi"); this file only poses it:
     · every keyframe of a move (aog-dojo-moves.js) is solved once: planted feet are placed by IK so the sole lands
       flat on its spot (or on the ball of the foot, heel up), knees over the toes; falls rest the lowest part of the
       body on the mat;
     · between keys, joints blend (slerp), planted feet glide along the floor and lift in a low arc when they step,
       and nothing ever goes below the mat.
   It draws only when asked (a step plays, a drag, a resize, the theme). dispose() lets go of everything. */
import * as THREE from "/vendor/three-0.160.0/three.module.min.js";
import { RoundedBoxGeometry } from "/vendor/three-0.160.0/addons/geometries/RoundedBoxGeometry.js";
import { makeFigure, JOINTS } from "/aog-figure3d.js";

const DEG = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const EASE = {
  soft: u => u * u * (3 - 2 * u),
  snap: u => 1 - Math.pow(1 - u, 3),
  lin: u => u
};
const JN = JOINTS || ["pelvis", "spine", "chest", "neck", "head", "clavL", "shoulderL", "elbowL", "wristL", "clavR", "shoulderR", "elbowR", "wristR",
  "hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"];

export async function create(opt) {
  const host = opt.host;
  const phone = Math.min(screen.width || innerWidth, screen.height || innerHeight) < 600 || Math.min(innerWidth, innerHeight) < 600;
  const quality = phone ? "phone" : "full";
  let makeStage = null;
  try { makeStage = (await import("/aog-3dkit.js")).makeStage; } catch (e) { makeStage = null; }
  const stage = makeStage ? makeStage({ host, before: host.firstChild, quality, dark: opt.dark() }) : await ownStage(host, quality);
  const { renderer, scene, camera } = stage;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  let renders = 0;
  const draw = () => { stage.render(); renders++; };

  /* ══ the room ══ */
  const room = new THREE.Group(); scene.add(room);
  const disposables = [];
  const keep = x => { disposables.push(x); return x; };
  let rng = 11; const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647;
  function canvasTex(w, h, paint, rep) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; paint(c.getContext("2d"), w, h);
    const t = keep(new THREE.CanvasTexture(c)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  }
  function dataTex(w, h, paint, rep) {   // a normal map, kept linear
    const c = document.createElement("canvas"); c.width = w; c.height = h; paint(c.getContext("2d"), w, h);
    const t = keep(new THREE.CanvasTexture(c)); t.anisotropy = 4;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  }
  // wooden floor: long warm planks, soft grain, a darker seam between boards (white base, tinted by the token color)
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    const rows = 8, ph = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rand() * w * 0.5;
      while (x < w) {
        const len = w * (0.35 + rand() * 0.4), tone = 0.86 + rand() * 0.14;
        const c = Math.round(255 * tone); g.fillStyle = `rgb(${c},${Math.round(c * 0.97)},${Math.round(c * 0.93)})`;
        g.fillRect(x, r * ph, len, ph);
        for (let k = 0; k < 14; k++) {   // grain: long soft curves along the board
          g.strokeStyle = `rgba(90,60,30,${0.035 + rand() * 0.05})`; g.lineWidth = 0.6 + rand() * 1.6;
          const y = r * ph + rand() * ph; g.beginPath(); g.moveTo(x, y);
          g.bezierCurveTo(x + len * 0.3, y + (rand() - 0.5) * 8, x + len * 0.7, y + (rand() - 0.5) * 8, x + len, y + (rand() - 0.5) * 4); g.stroke();
        }
        g.fillStyle = "rgba(60,40,20,0.28)"; g.fillRect(x, r * ph, 2, ph);
        x += len;
      }
      g.fillStyle = "rgba(60,40,20,0.30)"; g.fillRect(0, r * ph, w, 2);
    }
  }, [3, 3]);
  // the mats: a woven canvas look (fine weave), tinted by the token colors
  const weave = (g, w, h) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(0,0,0,${0.03 + rand() * 0.03})`; g.fillRect(0, y, w, 1.5); }
    for (let x = 0; x < w; x += 4) { g.fillStyle = `rgba(0,0,0,${0.02 + rand() * 0.02})`; g.fillRect(x, 0, 1, h); }
  };
  const matTex = canvasTex(256, 256, weave, [3, 3]);
  const matNormal = dataTex(128, 128, (g, w, h) => {
    g.fillStyle = "rgb(128,128,255)"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { g.fillStyle = "rgb(128,150,240)"; g.fillRect(0, y, w, 1); g.fillStyle = "rgb(128,106,240)"; g.fillRect(0, y + 2, w, 1); }
  }, [6, 6]);
  const plaster = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(0,0,0,${rand() * 0.035})`; g.fillRect(rand() * w, rand() * h, 2, 2); } }, [6, 3]);

  const MAT = {
    floor: keep(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.42, metalness: 0 })),
    mat: keep(new THREE.MeshStandardMaterial({ map: matTex, normalMap: matNormal, normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.92 })),
    mat2: keep(new THREE.MeshStandardMaterial({ map: matTex, normalMap: matNormal, normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.92 })),
    wall: keep(new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.96 })),
    wood: keep(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.5 })),
    accent: keep(new THREE.MeshStandardMaterial({ roughness: 0.7 })),
    stone: keep(new THREE.MeshStandardMaterial({ roughness: 0.55 })),
    window: keep(new THREE.MeshStandardMaterial({ roughness: 1, emissive: new THREE.Color("#fff6e4"), emissiveIntensity: 1 })),
    lamp: keep(new THREE.MeshStandardMaterial({ roughness: 0.9, emissive: new THREE.Color("#ffd9a0"), emissiveIntensity: 0 })),
    shadowOnly: keep(new THREE.ShadowMaterial({ opacity: 0.18 }))
  };
  const add = (geo, mat, x, y, z, cast, recv) => { const m = new THREE.Mesh(keep(geo), mat); m.position.set(x, y, z); m.castShadow = !!cast; m.receiveShadow = recv !== false; room.add(m); return m; };
  const seg = phone ? 3 : 5;
  // floor (a little below the mats) and the mats (their top is y = 0, where the figure stands)
  const FLOOR_Y = -0.045;
  add(new THREE.PlaneGeometry(14, 14), MAT.floor, 0, FLOOR_Y, -1).rotation.x = -Math.PI / 2;
  const matW = 1.0, matD = 2.0, matH = 0.045;
  for (let i = -2; i < 2; i++) for (let k = -1; k < 2; k++) {
    const g = new RoundedBoxGeometry(matW - 0.01, matH, matD - 0.01, seg, 0.018);
    add(g, (i + k) % 2 === 0 ? MAT.mat : MAT.mat2, (i + 0.5) * matW, -matH / 2, k * matD - 0.3, false, true);
  }
  // walls: behind, and one side with tall soft windows
  const back = add(new THREE.PlaneGeometry(14, 6), MAT.wall, 0, 3 + FLOOR_Y, -5.2); back.receiveShadow = true;
  const sideW = add(new THREE.PlaneGeometry(12, 6), MAT.wall, -5.6, 3 + FLOOR_Y, 0.4); sideW.rotation.y = Math.PI / 2;
  // the other two walls, so every view looks into a room
  const frontW = add(new THREE.PlaneGeometry(14, 6), MAT.wall, 0, 3 + FLOOR_Y, 6.2); frontW.rotation.y = Math.PI;
  const rightW = add(new THREE.PlaneGeometry(12, 6), MAT.wall, 5.6, 3 + FLOOR_Y, 0.4); rightW.rotation.y = -Math.PI / 2;
  const railF = new THREE.CylinderGeometry(0.035, 0.035, 14, 20); railF.rotateZ(Math.PI / 2); add(railF, MAT.wood, 0, 0.95, 6.16, false);
  const railR = new THREE.CylinderGeometry(0.035, 0.035, 12, 20); railR.rotateX(Math.PI / 2); add(railR, MAT.wood, 5.56, 0.95, 0.4, false);
  add(new RoundedBoxGeometry(14, 0.16, 0.06, seg, 0.025), MAT.wood, 0, FLOOR_Y + 0.08, 6.17, false);
  add(new RoundedBoxGeometry(0.06, 0.16, 12, seg, 0.025), MAT.wood, 5.57, FLOOR_Y + 0.08, 0.4, false);
  // a wooden base rail and a soft top rail along the back wall (rounded, turned)
  const rail = new THREE.CylinderGeometry(0.035, 0.035, 14, 20); rail.rotateZ(Math.PI / 2);
  add(rail, MAT.wood, 0, 0.95, -5.16, false);
  const base = new RoundedBoxGeometry(14, 0.16, 0.06, seg, 0.025); add(base, MAT.wood, 0, FLOOR_Y + 0.08, -5.17, false);
  const baseS = new RoundedBoxGeometry(0.06, 0.16, 12, seg, 0.025); add(baseS, MAT.wood, -5.57, FLOOR_Y + 0.08, 0.4, false);
  // windows on the side wall: rounded panels of soft light with a wooden frame
  function roundRectShape(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  [-1.6, 1.4].forEach(z => {
    const frame = new THREE.ExtrudeGeometry(roundRectShape(1.5, 2.3, 0.3), { depth: 0.05, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 4, curveSegments: 16 });
    const f = add(frame, MAT.wood, -5.58, 1.85, z, false); f.rotation.y = Math.PI / 2;
    const pane = add(new THREE.ShapeGeometry(roundRectShape(1.36, 2.16, 0.26), 16), MAT.window, -5.5, 1.85, z, false, false); pane.rotation.y = Math.PI / 2;
  });
  // smooth shapes on the back wall: three soft discs in a calm row (wood, sage, stone) — just shapes
  const disc = r => { const t = 0.035, pts = [new THREE.Vector2(0.0001, t)]; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push(new THREE.Vector2(r - t + Math.sin(a) * t, Math.cos(a) * t)); } pts.push(new THREE.Vector2(0.0001, 0)); const g = new THREE.LatheGeometry(pts, 64); g.rotateX(Math.PI / 2); return g; };
  [[1.5, 2.0, 0.55, MAT.wood], [2.6, 2.5, 0.34, MAT.accent], [-4.2, 2.3, 0.42, MAT.stone]].forEach(([x, y, r, m]) => add(disc(r), m, x, y, -5.15, false));
  [[2.4, 2.1, 0.5, MAT.accent], [3.5, 2.6, 0.3, MAT.wood], [-3.2, 2.2, 0.38, MAT.stone]].forEach(([z, y, r, m]) => { const d = add(disc(r), m, 5.55, y, z, false); d.rotation.y = -Math.PI / 2; });
  [[-2.6, 2.2, 0.46, MAT.stone], [-3.7, 2.6, 0.3, MAT.accent], [3.6, 2.1, 0.52, MAT.wood]].forEach(([x, y, r, m]) => { const d = add(disc(r), m, x, y, 6.15, false); d.rotation.y = Math.PI; });
  // a row of soft vertical wooden slats on the front wall, rounded like dowels
  for (let i = 0; i < 9; i++) { const g = new THREE.CapsuleGeometry(0.035, 1.6, 6, 16); add(g, MAT.wood, 1.6 + i * 0.14, 1.9, 6.12, false); }
  // a long low bench with rounded edges, with three smooth river stones resting on it
  add(new RoundedBoxGeometry(2.6, 0.08, 0.42, seg, 0.035), MAT.wood, 2.4, 0.42 + FLOOR_Y, -4.7, true);
  [[1.6, 0.4], [2.6, 0.3], [3.4, 0.36]].forEach(([x, s]) => add(new RoundedBoxGeometry(0.1, 0.36, 0.34, seg, 0.04), MAT.wood, x, 0.2 + FLOOR_Y, -4.7, true));
  [[1.9, 0.11], [2.25, 0.08], [2.55, 0.06]].forEach(([x, r]) => { const s = add(new THREE.SphereGeometry(r, 32, 20), MAT.stone, x, 0.46 + FLOOR_Y + r * 0.55, -4.65, true); s.scale.set(1.3, 0.6, 1); });
  // round paper lamps hanging from above (they glow at night)
  const lampLights = [];
  [[-1.5, -2.6], [1.8, -2.2]].forEach(([x, z]) => {
    const s = add(new THREE.SphereGeometry(0.24, 32, 24), MAT.lamp, x, 3.3, z, false, false); s.scale.y = 0.85;
    const cord = add(new THREE.CylinderGeometry(0.006, 0.006, 2, 6), MAT.wood, x, 4.45, z, false, false);
    const L = new THREE.PointLight("#ffcf8a", 0, 9, 1.6); L.position.set(x, 3.15, z); scene.add(L); lampLights.push(L);
  });
  // the sun through the windows (soft shadows); the kit's own light is kept and tuned here
  const sun = new THREE.DirectionalLight("#fff1dc", 2.0);
  sun.position.set(-6, 5.5, 2.5); sun.target.position.set(0, 0.6, 0); sun.castShadow = true;
  const sm = phone ? 1024 : 2048; sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 20 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  scene.add(sun); scene.add(sun.target);
  const fill = new THREE.HemisphereLight("#fff8ee", "#b89a78", 0.5); scene.add(fill);

  /* ══ the figure ══ */
  const C0 = opt.colors();
  const giColors = c => ({ top: c.gi, trim: c.gi, pants: c.gi, skin: c.skin, hair: c.hair, belt: c.belt });
  const figOpts = c => ({ outfit: "gi", belt: c.belt, colors: giColors(c), quality });
  const fig = makeFigure(figOpts(C0));
  scene.add(fig.root);
  fig.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  /* ── the foot, measured once from the figure at rest ── */
  fig.setPose({ root: { pos: [0, 0, 0], rot: [0, 0, 0] }, j: {} }); fig.update();
  const FOOT = (() => {
    const out = {};
    ["L", "R"].forEach(s => {
      const a = fig.world("ankle" + s), t = fig.world("toe" + s), fl = fig.footFloor(s);
      out[s] = { ankleH: a.y - fl, toeH: t.y - fl, fwd: t.z - a.z, dx: t.x - a.x, restX: a.x, floor0: fl };
    });
    return out;
  })();

  /* ── one pose: FK joints, planted feet by IK, the body kept on or above the mat ── */
  const tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpV = new THREE.Vector3();
  const yawQ = d => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), d * DEG);
  const pitchQ = d => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), d * DEG);
  function ballOf(f, side) { const F = FOOT[side], y = f.yaw * DEG; return [f.p[0] + Math.sin(y) * F.fwd, f.p[1] + Math.cos(y) * F.fwd]; }
  function plant(F, side, ball, yaw, heel, lift, offset) {
    const S = FOOT[side];
    const q = yawQ(yaw).multiply(pitchQ(heel));
    const toe = new THREE.Vector3(ball[0] + offset.x, S.toeH + lift, ball[1] + offset.z);
    const v = new THREE.Vector3(0, S.ankleH - S.toeH, -S.fwd).applyQuaternion(q);
    const ankle = toe.clone().add(v);
    const hip = F.world("hip" + side);
    const fwd = new THREE.Vector3(Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG));
    const pole = hip.clone().lerp(ankle, 0.5).add(fwd.multiplyScalar(0.8)).add(new THREE.Vector3(0, 0.1, 0));
    F.ik.leg(side, ankle, pole);
    // the sole lies flat on the floor (turned by yaw, tipped up by heel); the toes stay flat
    const aj = F.J("ankle" + side), tj = F.J("toe" + side);
    aj.parent.updateWorldMatrix(true, false);
    aj.parent.getWorldQuaternion(tmpQ);
    aj.quaternion.copy(tmpQ.invert().multiply(q));
    if (tj) tj.quaternion.copy(pitchQ(-heel));
    aj.updateMatrixWorld(true);
  }
  const RAD = { pelvis: 0.11, spine: 0.12, chest: 0.12, neck: 0.06, head: 0.115, shoulderL: 0.06, shoulderR: 0.06, elbowL: 0.05, elbowR: 0.05,
                wristL: 0.04, wristR: 0.04, hipL: 0.09, hipR: 0.09, kneeL: 0.06, kneeR: 0.06, ankleL: 0.05, ankleR: 0.05, toeL: 0.025, toeR: 0.025 };
  function lowest(F, planted) {
    F.fig.root.updateMatrixWorld(true);
    let m = Infinity;
    for (const n in RAD) {
      if (planted && /ankle|toe/.test(n) && planted[n.slice(-1)]) continue;
      const w = F.world(n); if (w) m = Math.min(m, w.y - RAD[n]);
    }
    ["L", "R"].forEach(s => { if (!(planted && planted[s])) m = Math.min(m, F.fig.footFloor(s)); });
    return m;
  }
  // a figure wrapped with what the solver needs (the main figure, or a ghost)
  function wrap(f) {
    return { fig: f, J: n => f.bones[n], world: n => f.world(n), ik: f.ik };
  }
  const MAIN = wrap(fig);
  function readPose(F) {
    const out = { root: { pos: F.fig.body.position.toArray(), rot: [0, 0, 0] }, j: {} };
    tmpE.setFromQuaternion(F.fig.body.quaternion, "YXZ"); out.root.rot = [tmpE.x / DEG, tmpE.y / DEG, tmpE.z / DEG];
    JN.forEach(n => { const o = F.J(n); if (!o) return; tmpE.setFromQuaternion(o.quaternion, "XYZ"); out.j[n] = [tmpE.x / DEG, tmpE.y / DEG, tmpE.z / DEG]; });
    return out;
  }
  /* a key's root turns about the hips (where a person turns), not about the floor: the body's own origin is on the floor */
  const P0 = new THREE.Vector3(0, 0.97, 0);
  const rotP0 = rot => P0.clone().applyEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ"));
  function fkPose(k) {
    const j = {}; for (const n in k.j) j[n] = k.j[n];
    const pos = (k.root ? k.root.pos : [0, 0, 0]).slice(), rot = (k.root ? k.root.rot : [0, 0, 0]).slice(), r = rotP0(rot);
    pos[0] += P0.x - r.x; pos[1] += P0.y - r.y; pos[2] += P0.z - r.z;
    return { root: { pos, rot }, j, grip: Object.assign({ L: 0.92, R: 0.92 }, k.grip || {}) };
  }
  /* solve a keyframe on its own: FK, then IK for planted feet, then rest the body on the mat if asked */
  function solveKey(F, k, offset) {
    const pose = fkPose(k); pose.root.pos[0] += offset.x; pose.root.pos[2] += offset.z;
    F.fig.setPose(pose); F.fig.update && F.fig.update(); F.fig.root.updateMatrixWorld(true);
    const planted = { L: k.L && k.L !== "fk", R: k.R && k.R !== "fk" };
    for (let pass = 0; pass < 2; pass++) {
      ["L", "R"].forEach(s => { if (planted[s]) { const f = k[s]; plant(F, s, ballOf(f, s), f.yaw, f.heel || 0, 0, offset); } });
      // a planted foot that cannot reach the floor: lower the body a little and solve again
      let worst = 0; ["L", "R"].forEach(s => { if (planted[s]) worst = Math.max(worst, F.fig.footFloor(s) - 0.004); });
      if (worst > 0.002 && pass === 0) { F.fig.body.position.y -= worst; F.fig.update(); } else break;
    }
    // arms that reach for a spot (a punch's target, the chin for a guard): IK to the spot, the elbow toward its pole
    if (k.arm) ["L", "R"].forEach(s => {
      const a = k.arm[s]; if (!a) return;
      // a target is measured from where the key stands (its root's x and z), so a move that travels keeps its aim
      const ox = offset.x + (k.root ? k.root.pos[0] : 0), oz = offset.z + (k.root ? k.root.pos[2] : 0);
      const to = new THREE.Vector3(a.to[0] + ox, a.to[1], a.to[2] + oz), pole = new THREE.Vector3(a.pole[0] + ox, a.pole[1], a.pole[2] + oz);
      F.ik.arm(s, to, pole);
      const el = F.J("elbow" + s);
      if (a.twist) el.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a.twist * DEG));
      if (a.wrist) F.J("wrist" + s).rotation.set(a.wrist[0] * DEG, a.wrist[1] * DEG, a.wrist[2] * DEG, "XYZ");
      F.fig.update();
    });
    if (k.ground === "body") { const m = lowest(F, null); F.fig.body.position.y -= m; F.fig.update(); }
    const out = readPose(F); out.grip = pose.grip;
    const r = rotP0(out.root.rot); out.pelvis = [out.root.pos[0] + r.x - offset.x, out.root.pos[1] + r.y, out.root.pos[2] + r.z - offset.z];
    return out;
  }

  /* ══ the move ══ */
  let MV = null, KEYS = [], mirror = false, curT = 0;
  function setMove(m, mir) {
    MV = m; mirror = !!mir;
    const mk = window.AOGDojoMoves.mirrorKey;
    KEYS = m.keys.map(k => { const kk = mirror ? mk(k) : JSON.parse(JSON.stringify(k)); return kk; });
    KEYS.forEach(k => { k.solved = solveKey(MAIN, k, { x: 0, z: 0 }); });
    path = KEYS.map(k => ({ t: k.t, x: k.solved.pelvis[0], z: k.solved.pelvis[2] }));
    curT = 0;
    if (ghostOn) buildGhosts();
  }
  function segAt(t) {
    const k = KEYS;
    if (t <= k[0].t) return [0, 0, 0];
    for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1].t) { const u = (t - k[i].t) / Math.max(1e-6, k[i + 1].t - k[i].t); return [i, i + 1, (EASE[k[i + 1].ease] || EASE.soft)(clamp(u, 0, 1))]; }
    return [k.length - 1, k.length - 1, 0];
  }
  /* pose any figure at time t of the move (offset: where this copy stands) */
  function poseAt(F, t, offset) {
    offset = offset || { x: 0, z: 0 };
    const [a, b, u] = segAt(t), A = KEYS[a], B = KEYS[b];
    const pose = F.fig.blend(A.solved, B.solved, u);
    const pa = A.solved.pelvis, pb = B.solved.pelvis, r = rotP0(pose.root.rot);
    pose.root.pos = [lerp(pa[0], pb[0], u) - r.x + offset.x, lerp(pa[1], pb[1], u) - r.y, lerp(pa[2], pb[2], u) - r.z + offset.z];
    F.fig.setPose(pose); F.fig.update && F.fig.update(); F.fig.root.updateMatrixWorld(true);
    const planted = {};
    ["L", "R"].forEach(s => {
      const fa = A[s], fb = B[s];
      if (!fa || !fb || fa === "fk" || fb === "fk") return;
      planted[s] = true;
      const ba = ballOf(fa, s), bb = ballOf(fb, s), d = Math.hypot(bb[0] - ba[0], bb[1] - ba[1]);
      const ball = [lerp(ba[0], bb[0], u), lerp(ba[1], bb[1], u)];
      const lift = d > 0.03 ? Math.sin(Math.PI * u) * clamp(d * 0.16, 0.015, 0.09) : 0;
      plant(F, s, ball, lerp(fa.yaw, fb.yaw, u), lerp(fa.heel || 0, fb.heel || 0, u), lift, offset);
    });
    // nothing goes below the mat; a body resting on the mat stays on it
    const m = lowest(F, planted);
    if (A.ground === "body" && B.ground === "body") F.fig.body.position.y -= m;
    else if (m < 0) F.fig.body.position.y -= m;
    F.fig.root.updateMatrixWorld(true);
  }

  /* ══ the camera: Front, Side, Behind you, Walk around (drag) ══ */
  let view = "front", az = 20, el = 8, path = [], drag = null, W = 0, H = 0;
  const VIEWS = { front: [22, 7], side: [-90, 6], behind: [196, 12] };
  function center(t) {
    if (!path.length) return new THREE.Vector3(0, 0.92, 0);
    // follow the figure where it travels (form, steps), smoothly
    let x = path[0].x, z = path[0].z;
    for (let i = 0; i < path.length - 1; i++) if (t >= path[i].t) { const u = clamp((t - path[i].t) / Math.max(1e-6, path[i + 1].t - path[i].t), 0, 1), e = EASE.soft(u); x = lerp(path[i].x, path[i + 1].x, e); z = lerp(path[i].z, path[i + 1].z, e); }
    return new THREE.Vector3(x, 0.84, z);
  }
  function placeCamera(t) {
    const asp = W / Math.max(1, H), fov = camera.fov * DEG;
    let target = center(t), wNeed = 1.9, hNeed = 2.0;
    if (ghostOn && ghosts.length) { target = new THREE.Vector3(0, 0.88, 0); wNeed = ghostSpan + 1.0; hNeed = 2.2; }
    const dist = Math.max(hNeed / 2 / Math.tan(fov / 2), wNeed / 2 / (Math.tan(fov / 2) * asp)) * 1.0 + 0.2;
    const a = (ghostOn ? -74 : az) * DEG, e = (ghostOn ? 8 : el) * DEG;
    camera.position.set(target.x + Math.sin(a) * Math.cos(e) * dist, target.y + Math.sin(e) * dist + 0.1, target.z + Math.cos(a) * Math.cos(e) * dist);
    camera.lookAt(target);
    sun.target.position.set(target.x, 0.6, target.z); sun.position.set(target.x - 6, 5.5, target.z + 2.5);
  }
  function setView(v) { view = v; if (VIEWS[v]) { az = VIEWS[v][0]; el = VIEWS[v][1]; } }

  /* ══ the ghost: several faded moments of the move in one still picture ══ */
  let ghostOn = false, ghosts = [], ghostSpan = 0;
  function ghostTimes() {
    const n = window.AOGDojoMoves && MV ? MV.en.steps.length : 1, ends = [];
    for (let s = 0; s < n; s++) { let t = 0; KEYS.forEach(k => { if (k.s === s) t = k.t; }); ends.push(t); }
    // the moment each step reaches its shape; at most five, always the first and the most important middle ones
    let ts = ends;
    if (ts.length > 5) { const pick = []; for (let i = 0; i < 5; i++) pick.push(ts[Math.round(i * (ts.length - 1) / 4)]); ts = pick; }
    return ts;
  }
  function makeGhost() {
    const g = makeFigure(Object.assign(figOpts(opt.colors()), { quality: "phone" }));
    g.root.traverse(o => { if (o.isMesh) { o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone(); o.castShadow = false; o.receiveShadow = false; } });
    scene.add(g.root);
    return wrap(g);
  }
  function setOpacity(F, a) {
    F.fig.root.traverse(o => { if (o.isMesh) [].concat(o.material).forEach(m => { m.transparent = a < 1; m.opacity = a; m.depthWrite = a >= 1; m.needsUpdate = true; }); });
  }
  function buildGhosts() {
    const ts = ghostTimes(), n = ts.length;
    while (ghosts.length < n - 1) ghosts.push(makeGhost());
    ghosts.forEach((g, i) => g.fig.root.visible = i < n - 1);
    const kicky = /kick|fall|sprawl|lunge|teep|ginga/.test(MV.kind + MV.id);
    const sp = kicky ? 1.25 : 0.95; ghostSpan = (n - 1) * sp;
    ts.forEach((t, i) => {
      const F = i === n - 1 ? MAIN : ghosts[i];
      const c = center(t), off = { x: -c.x, z: (i - (n - 1) / 2) * sp - c.z };   // a row along the direction the figure faces, seen from its side
      poseAt(F, t, off);
      if (F !== MAIN) setOpacity(F, 0.26 + 0.42 * i / Math.max(1, n - 1));
    });
  }
  function setGhost(on) {
    ghostOn = !!on;
    if (ghostOn) buildGhosts(); else ghosts.forEach(g => g.fig.root.visible = false);
  }

  /* ══ colors from the page's tokens; a night look in dark theme ══ */
  function colors() {
    const c = opt.colors(), dark = opt.dark();
    const col = (x, d) => new THREE.Color(x || d);
    MAT.floor.color.copy(col(c.floor, "#c79d6c")); MAT.wood.color.copy(col(c.wood, "#9a7350"));
    MAT.mat.color.copy(col(c.mat, "#5e7f73")); MAT.mat2.color.copy(col(c.mat2, "#a8b9a4"));
    MAT.wall.color.copy(col(c.wall, "#efe7d9")); MAT.accent.color.copy(col(c.accent, "#8aa596"));
    MAT.stone.color.copy(col(dark ? "#8c8f94" : "#b9b4aa"));
    MAT.window.emissive.set(dark ? "#2a3b5c" : "#fff4de"); MAT.window.emissiveIntensity = dark ? 0.7 : 1.25; MAT.window.color.set(dark ? "#1c2740" : "#ffffff");
    MAT.lamp.emissiveIntensity = dark ? 1.6 : 0.15; MAT.lamp.color.set("#f6ead6");
    lampLights.forEach(L => L.intensity = dark ? 7 : 0);
    sun.color.set(dark ? "#9fb2e0" : "#fff0d8"); sun.intensity = dark ? 0.55 : 2.1;
    fill.color.set(dark ? "#56637f" : "#fff8ee"); fill.groundColor.set(dark ? "#2a241d" : "#b89a78"); fill.intensity = dark ? 0.35 : 0.45;
    const bg = col(dark ? "#141a24" : "#e9e1d2");
    scene.background = bg; if (scene.fog) scene.fog.color.copy(bg);
    if (stage.setDark) stage.setDark(dark);
    fig.setColors(giColors(c)); ghosts.forEach(g => g.fig.setColors(giColors(c)));
  }

  /* ══ size ══ */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h || (Math.abs(w - W) < 1 && Math.abs(h - H) < 1)) return false;
    W = w; H = h; stage.resize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); return true;
  }

  /* ══ what the page calls ══ */
  function show(t) {
    curT = t;
    resize();
    if (ghostOn) { buildGhosts(); } else poseAt(MAIN, t);
    placeCamera(t); draw();
  }
  function onDown(e) { if (ghostOn) return; drag = { x: e.clientX, y: e.clientY, az, el, moved: false, id: e.pointerId }; }
  function onMove(e) {
    if (!drag || ghostOn) return false;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) < 6) return false;   // a vertical swipe scrolls the page
    drag.moved = true;
    az = drag.az - dx * 0.4; el = clamp(drag.el + dy * 0.15, 2, 40);
    if (view !== "orbit") { view = "orbit"; opt.onView && opt.onView("orbit"); }
    return true;
  }
  function onUp() { drag = null; }
  function dispose() {
    ghosts.forEach(g => { g.fig.dispose && g.fig.dispose(); scene.remove(g.fig.root); }); ghosts = [];
    fig.dispose && fig.dispose(); scene.remove(fig.root);
    disposables.forEach(d => d.dispose && d.dispose());
    stage.dispose();
  }
  /* for the checks: walk a move frame by frame and report how the feet and body meet the floor */
  function sample(m, mir, fps) {
    const keepMove = MV, keepMir = mirror, keepGhost = ghostOn;
    ghostOn = false; setMove(m, mir);
    const out = { minPlanted: Infinity, minFoot: Infinity, minBody: Infinity, n: 0, step: [], side: null };
    for (let t = 0; t <= m.dur + 1e-6; t += 1 / (fps || 30)) {
      poseAt(MAIN, t);
      const fl = Math.min(fig.footFloor("L"), fig.footFloor("R"));
      out.minFoot = Math.min(out.minFoot, fl);
      out.minBody = Math.min(out.minBody, lowest(MAIN, null));
      const [a, b] = segAt(t);
      ["L", "R"].forEach(s => { if (KEYS[a][s] !== "fk" && KEYS[b][s] !== "fk") out.minPlanted = Math.min(out.minPlanted, fig.footFloor(s)); });
      out.n++;
    }
    // which ankle rises highest (mirror check)
    let hi = { L: -1, R: -1 };
    for (let t = 0; t <= m.dur; t += 0.1) { poseAt(MAIN, t); ["L", "R"].forEach(s => hi[s] = Math.max(hi[s], fig.world("ankle" + s).y)); }
    out.high = hi;
    if (keepMove) { setMove(keepMove, keepMir); } ghostOn = keepGhost;
    return out;
  }

  colors(); resize(); setView(view);
  return { setMove, show, setView, view: () => view, setGhost, colors, resize, onDown, onMove, onUp, dispose, sample,
    renders: () => renders, canvas, fig, poseAt: t => poseAt(MAIN, t), cam: () => view };
}

/* a stage of our own when the shared kit is not there (same look: soft room light, ACES, soft shadows) */
async function ownStage(host, quality) {
  const { RoomEnvironment } = await import("/vendor/three-0.160.0/addons/environments/RoomEnvironment.js");
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  host.insertBefore(renderer.domElement, host.firstChild);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, 0.05, 60);
  const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = env; pm.dispose();
  let n = 0;
  return { THREE, renderer, scene, camera, render() { renderer.render(scene, camera); n++; }, resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
    setDark() {}, renders: () => n,
    dispose() { env.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); } };
}
