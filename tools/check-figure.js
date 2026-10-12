#!/usr/bin/env node
/* AOG FIGURE CHECK (AOG-FIGURE3D-V1) — the shared 3D person (aog-deploy/aog-figure3d.js) and stage (aog-deploy/aog-3dkit.js)
   that the Skate Lab, the Dojo, the Kitchen and the Sewing Room build on. See aog-deploy/_work/engine3d/CONTRACT.md.
   It opens the test bench (_work/engine3d/figure-test.html) in a real browser with WebGL and checks:
     · the joints: the names, a real hierarchy, every joint lined up with the body at rest, and the contract's examples
       (shoulderR [-90,0,0] puts the right wrist in front of the shoulder; [0,0,-90] out to the right at shoulder height;
       hipR [-90,0,0] lifts the knee forward; kneeR [90,0,0] folds the ankle behind the knee; spine bends and turns …),
     · reaching: ik.leg and ik.arm land within 1 cm, and counter-height reaches never flip the elbow,
     · the hands: the palm anchor's axes, grip opens and closes the fingers, pinch brings the thumb to the index tip,
     · REST feet on the floor in every outfit; blend, lookAt, setColors and dispose,
     · the stage: nothing is drawn and no frame is asked for while idle, the night look, and dispose leaves no WebGL context,
     · no errors in the console.
       node tools/check-figure.js
   Exit code 1 when anything fails. Run it after any change to aog-figure3d.js or aog-3dkit.js. */
const path = require("path"), fs = require("fs"), http = require("http"), cp = require("child_process");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(cp.execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
let fails = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const wait = ms => new Promise(o => setTimeout(o, ms));

(async () => {
  await new Promise(o => server.listen(0, o)); const port = server.address().port;
  const b = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 800 } });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  await ctx.addInitScript(() => {   // count every frame anyone asks for
    window.__raf = 0; const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = f => { window.__raf++; return raf(f); };
  });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(`http://127.0.0.1:${port}/_work/engine3d/figure-test.html?q=phone`, { waitUntil: "load" });
  await p.waitForFunction(() => window.FIGTEST && window.FIGTEST.ready, null, { timeout: 300000 });
  await wait(400);

  const r = await p.evaluate(async () => {
    const { makeFigure, JOINTS, REST } = await import("/aog-figure3d.js");
    const THREE = window.FIGTEST.THREE, V = (x, y, z) => new THREE.Vector3(x, y, z), out = {};
    const f = makeFigure({ outfit: "plain", quality: "phone" });
    const W = j => f.world(j);
    out.joints = JOINTS.join(",");
    out.hier = JOINTS.every(n => f.bones[n] && f.bones[n].isObject3D && (n === "pelvis" || JOINTS.includes(f.bones[n].parent.name)));
    f.setPose({ j: {} }); out.restAxes = JOINTS.filter(n => !["shoulderL", "shoulderR", "elbowL", "elbowR"].includes(n)).every(n => f.bones[n].quaternion.angleTo(new THREE.Quaternion()) < 1e-6);
    out.frozen = Object.isFrozen(REST) && Object.isFrozen(REST.j);
    const pose = j => { f.setPose({ j }); return f; };
    pose({ shoulderR: [-90, 0, 0], elbowR: [0, 0, 0] }); out.fwdR = W("wristR").sub(W("shoulderR")).toArray();
    pose({ shoulderL: [-90, 0, 0], elbowL: [0, 0, 0] }); out.fwdL = W("wristL").sub(W("shoulderL")).toArray();
    pose({ shoulderR: [-90, 0, 0] }); out.fwdRdef = W("wristR").sub(W("shoulderR")).toArray();
    pose({ shoulderR: [0, 0, -90], elbowR: [0, 0, 0] }); out.sideR = W("wristR").sub(W("shoulderR")).toArray();
    pose({ shoulderL: [0, 0, 90], elbowL: [0, 0, 0] }); out.sideL = W("wristL").sub(W("shoulderL")).toArray();
    pose({ elbowR: [-90, 0, 0], shoulderR: [0, 0, 0] }); out.elbow = W("wristR").sub(W("elbowR")).toArray();
    pose({ hipR: [-90, 0, 0] }); out.hip = W("kneeR").sub(W("hipR")).toArray();
    pose({ kneeR: [90, 0, 0] }); out.knee = W("ankleR").sub(W("kneeR")).toArray();
    pose({}); const h0 = W("head");
    pose({ spine: [10, 0, 0] }); out.bend = W("head").sub(h0).toArray();
    pose({ chest: [10, 0, 0] }); out.bendC = W("head").sub(h0).toArray();
    pose({ spine: [0, 30, 0] }); out.turn = [W("shoulderR").z, W("shoulderL").z];
    f.setPose({ root: { pos: [0, -0.2, 0] } }); out.lower = W("pelvis").y; f.setPose(REST); out.pelvis = W("pelvis").y;
    out.height = (() => { const b = new THREE.Box3().setFromObject(f.root, true); return b.max.y; })();
    // reaching, with the figure moved and turned in the world
    const g = makeFigure({ outfit: "skate", quality: "phone" }); g.root.position.set(1.3, 0.2, -0.7); g.root.rotation.y = 0.8; g.update();
    let worstLeg = 0, worstArm = 0, rng = 5; const rnd = () => (rng = (rng * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 40; i++) {
      g.setPose(REST);
      const sd = i % 2 ? "L" : "R", sx = sd === "L" ? 1 : -1;
      const hip = g.world("hip" + sd), sh = g.world("shoulder" + sd);
      const lt = g.root.localToWorld(V(sx * (0.05 + rnd() * 0.25), 0.15 + rnd() * 0.45, -0.25 + rnd() * 0.6));
      if (lt.distanceTo(hip) < 0.8) { g.ik.leg(sd, lt, g.root.localToWorld(V(sx * 0.2, 0.6, 1))); worstLeg = Math.max(worstLeg, g.world("ankle" + sd).distanceTo(lt)); }
      const at = g.root.localToWorld(V(sx * (-0.1 + rnd() * 0.4), 0.9 + rnd() * 0.6, 0.05 + rnd() * 0.4));
      if (at.distanceTo(sh) < 0.52) { g.ik.arm(sd, at); worstArm = Math.max(worstArm, g.world("wrist" + sd).distanceTo(at)); }
    }
    out.ik = [worstLeg, worstArm];
    // counter height: reaching forward to a worktop, the elbow stays low and behind, and moves smoothly
    const k = makeFigure({ outfit: "apron", quality: "phone" }); k.setPose(REST);
    let flips = 0, jump = 0, prev = null, miss = 0, far = 0, n = 0;
    for (const sd of ["R", "L"]) { const sx = sd === "L" ? 1 : -1;
      for (let z = 0.18; z <= 0.3; z += 0.06) for (let y = 0.95; y <= 1.12; y += 0.05) { prev = null;
        for (let xo = -0.24; xo <= 0.1; xo += 0.02) {
          const t = V(sx * (0.12 + xo), y, z), s = k.world("shoulder" + sd); k.ik.arm(sd, t);
          const e = k.world("elbow" + sd), w = k.world("wrist" + sd);
          const dir = w.clone().sub(s).normalize(), off = e.clone().sub(s); off.addScaledVector(dir, -off.dot(dir));   // where the elbow points, off the shoulder–wrist line
          if (e.y > s.y - 0.08 || e.z > w.z || (off.length() > 0.02 && (off.y > 0.005 || sx * off.x < -0.03))) flips++;
          if (t.distanceTo(s) < 0.53) { miss = Math.max(miss, w.distanceTo(t)); n++; }
          else far = Math.max(far, w.clone().sub(s).angleTo(t.clone().sub(s)));   // out of reach: the arm points straight at it
          if (prev) jump = Math.max(jump, e.distanceTo(prev)); prev = e.clone();
        } } }
    out.counter = [flips, jump, miss, far * 180 / Math.PI, n];
    // hands: the anchor, grip, pinch
    k.setPose(REST); k.grip("R", 0); k.update();
    const A = k.hand("R"), q = A.getWorldQuaternion(new THREE.Quaternion()), ws = new THREE.Vector3(); A.getWorldScale(ws);
    const ax = (v) => v.multiply(ws).applyQuaternion(q).normalize();
    const along = k.world("R_mid1").sub(k.world("wristR")).normalize(), thumbSide = k.world("R_idx1").sub(k.world("R_lit1")).normalize();
    const palmOut = V(1, 0, 0);   // the right palm faces the body's middle (+x) at rest
    out.anchor = [ax(V(0, 1, 0)).dot(along), ax(V(0, 0, 1)).dot(palmOut), ax(V(1, 0, 0)).dot(thumbSide)];
    const AL = k.hand("L"), qL = AL.getWorldQuaternion(new THREE.Quaternion()), wsL = new THREE.Vector3(); AL.getWorldScale(wsL);
    const axL = v => v.multiply(wsL).applyQuaternion(qL).normalize();
    out.anchorL = [axL(V(0, 1, 0)).dot(k.world("L_mid1").sub(k.world("wristL")).normalize()), axL(V(0, 0, 1)).dot(V(-1, 0, 0)), axL(V(1, 0, 0)).dot(k.world("L_idx1").sub(k.world("L_lit1")).normalize())];
    const tipToAnchor = () => k.tip("R", "mid").distanceTo(A.getWorldPosition(new THREE.Vector3()));
    k.grip("R", 0); const open = tipToAnchor(); k.grip("R", 1); const shut = tipToAnchor();
    k.pinch("R", true); const pin = k.tip("R", "idx").distanceTo(k.tip("R", "thb")), pinA = A.getWorldPosition(new THREE.Vector3()).distanceTo(k.tip("R", "idx").add(k.tip("R", "thb")).multiplyScalar(0.5));
    k.pinch("R", false); k.grip("R", 0.5);
    k.setPose({ grip: { L: 1 } }); const poseGrip = k.tip("L", "mid").distanceTo(k.hand("L").getWorldPosition(new THREE.Vector3()));
    out.hands = [open, shut, pin, pinA, poseGrip];
    // feet on the floor in every outfit and quality
    out.floor = [];
    for (const o of ["skate", "gi", "plain", "apron"]) for (const ql of ["phone", "full"]) { const h = makeFigure({ outfit: o, quality: ql }); out.floor.push([o, ql, h.footFloor("L"), h.footFloor("R"), h.info.segments, h.info.triangles]); h.dispose(); }
    // blend, lookAt, colors, dispose
    const a1 = { j: { shoulderR: [-90, 0, 0] } }, b1 = { j: { shoulderR: [0, 0, 0] } }, mid = f.blend(a1, b1, 0.5);
    out.blend = mid.j.shoulderR[0];
    f.setPose(REST); f.lookAt(f.root.localToWorld(V(2, 1.6, 0.5)), 1);
    out.look = V(0, 0, 1).applyQuaternion(f.bones.head.getWorldQuaternion(new THREE.Quaternion())).x;
    f.setColors({ top: "#ff0000" }); out.color = f.root.children.filter(m => m.isMesh).some(m => m.material.color.getHexString() === "ff0000");
    f.setColors({ top: "rgb(0, 128, 0)" }); out.color2 = f.root.children.filter(m => m.isMesh).some(m => m.material.color.getHexString() === "008000");
    out.normalsOK = f.root.children.filter(m => m.isMesh).every(m => { const n = m.geometry.attributes.normal; if (!n) return false; for (let i = 0; i < n.array.length; i++) if (!isFinite(n.array[i])) return false; return true; });
    const sc = new THREE.Scene(); sc.add(f.root); f.dispose(); out.disposed = f.disposed && !f.root.parent; f.dispose();
    g.dispose(); k.dispose();
    return out;
  });
  ok(r.joints === "pelvis,spine,chest,neck,head,clavL,shoulderL,elbowL,wristL,clavR,shoulderR,elbowR,wristR,hipL,kneeL,ankleL,toeL,hipR,kneeR,ankleR,toeR", "the 21 joints have the contract's names");
  ok(r.hier && r.restAxes && r.frozen, "the joints are a real hierarchy, each lined up with the body at rest; REST cannot be changed by mistake");
  const [fx, fy, fz] = r.fwdR;
  ok(fz > 0.5 && Math.abs(fy) < 0.03 && Math.abs(fx) < 0.03, `shoulderR [-90,0,0]: the right wrist is in front of the shoulder (${fz.toFixed(2)} m forward)`);
  ok(r.fwdL[2] > 0.5 && Math.abs(r.fwdL[1]) < 0.03, "shoulderL [-90,0,0]: the left arm too");
  ok(r.fwdRdef[2] > 0.45, "with the resting elbow bend left in, the arm still points forward");
  ok(r.sideR[0] < -0.5 && Math.abs(r.sideR[1]) < 0.03 && Math.abs(r.sideR[2]) < 0.03, `shoulderR [0,0,-90]: the right wrist goes out to the figure's right at shoulder height (x ${r.sideR[0].toFixed(2)}, y ${r.sideR[1].toFixed(3)})`);
  ok(r.sideL[0] > 0.5 && Math.abs(r.sideL[1]) < 0.03, "shoulderL [0,0,90]: the left wrist goes out to the left");
  ok(r.elbow[2] > 0.2 && Math.abs(r.elbow[1]) < 0.03, "elbowR [-90,0,0]: the forearm bends forward and up");
  ok(r.hip[2] > 0.4 && Math.abs(r.hip[1]) < 0.03, "hipR [-90,0,0]: the knee comes up in front");
  ok(r.knee[2] < -0.4 && Math.abs(r.knee[1]) < 0.03, "kneeR [90,0,0]: the ankle folds behind the knee");
  ok(r.bend[2] > 0.05 && r.bendC[2] > 0.03, "spine and chest [10,0,0] bend forward");
  ok(r.turn[0] > 0.05 && r.turn[1] < -0.05, "spine [0,30,0] turns the upper body to its left");
  ok(Math.abs(r.lower - (r.pelvis - 0.2)) < 1e-6, "root.pos[1] lowers the whole figure");
  ok(r.height > 1.66 && r.height < 1.8, `the figure is about 1.72 m tall (${r.height.toFixed(2)} m)`);
  ok(r.ik[0] < 0.01 && r.ik[1] < 0.01, `ik.leg and ik.arm reach their targets within 1 cm, the figure moved and turned (worst ${(r.ik[0] * 100).toFixed(2)} cm, ${(r.ik[1] * 100).toFixed(2)} cm)`);
  ok(r.counter[0] === 0 && r.counter[1] < 0.05 && r.counter[2] < 0.01 && r.counter[3] < 2 && r.counter[4] > 50, `reaching to a worktop in front (${r.counter[4]} places in reach), the wrist lands within 1 cm and the elbow stays low, out to the side and never flips (biggest elbow move ${(r.counter[1] * 100).toFixed(1)} cm per 2 cm; out of reach the arm points straight at the target, ${r.counter[3].toFixed(1)}°)`);
  ok(r.anchor.every(v => v > 0.85), `the right palm anchor: y along the fingers, z out of the palm, x toward the thumb (${r.anchor.map(v => v.toFixed(2)).join(", ")})`);
  ok(r.anchorL.every(v => v > 0.85), `the left palm anchor too (${r.anchorL.map(v => v.toFixed(2)).join(", ")})`);
  ok(r.hands[0] > 0.07 && r.hands[1] < 0.045, `grip 0 opens the fingers, grip 1 closes them round the anchor (${(r.hands[0] * 100).toFixed(1)} cm → ${(r.hands[1] * 100).toFixed(1)} cm)`);
  ok(r.hands[2] < 0.02 && r.hands[3] < 0.005, `pinch brings the thumb to the index tip (${(r.hands[2] * 100).toFixed(1)} cm between tip centers) and the anchor sits between them`);
  ok(r.hands[4] < 0.045, "a pose can carry grip: { L: 1 }");
  const badFloor = r.floor.filter(x => Math.abs(x[2]) > 0.003 || Math.abs(x[3]) > 0.003);
  ok(!badFloor.length, "REST feet are on the floor in every outfit (footFloor ≈ 0)" + (badFloor.length ? " (" + badFloor.map(x => x.slice(0, 4).join(" ")).join("; ") + ")" : ""));
  ok(r.floor.every(x => x[1] === "full" ? x[4] >= 24 : x[4] <= 16), "24+ segments around a limb on a computer, about 14 on a phone");
  ok(r.floor.every(x => x[1] === "full" || x[5] < 25000), "a phone figure stays under 25k triangles (" + r.floor.filter(x => x[1] === "phone").map(x => x[0] + " " + Math.round(x[5] / 100) / 10 + "k").join(", ") + ")");
  ok(Math.abs(r.blend + 45) < 0.5, `blend halfway between arms forward and arms down is 45° (${r.blend.toFixed(1)}°)`);
  ok(r.look > 0.3, "lookAt turns the head toward a point on its left");
  ok(r.color && r.color2, "setColors takes hex and rgb() token colors");
  ok(r.normalsOK, "every part has smooth, finite normals");
  ok(r.disposed, "fig.dispose() frees it and takes it out of the scene (twice is safe)");

  /* ── the stage: silent while idle, the night look, dispose ── */
  const s0 = await p.evaluate(() => ({ n: window.FIGTEST.stage.renders(), raf: window.__raf }));
  await wait(1500);
  const s1 = await p.evaluate(() => ({ n: window.FIGTEST.stage.renders(), raf: window.__raf }));
  ok(s1.n === s0.n && s1.raf === s0.raf, `nothing is drawn and no frame is asked for while nobody touches it (${s1.n - s0.n} pictures, ${s1.raf - s0.raf} frames)`);
  const st = await p.evaluate(() => { const s = window.FIGTEST.stage, n = s.renders(); s.setDark(true); const a = s.renders() - n; const bg = s.scene.background.getHexString(); s.setDark(false); return { a, bg, q: s.quality, sm: s.sun.shadow.mapSize.x, tm: s.renderer.toneMapping, env: !!s.scene.environment }; });
  ok(st.a === 1 && st.bg !== "e9e6df", "the night look draws once, with a dark sky");
  ok(st.q === "phone" && st.sm <= 1024 && st.env && st.tm === 4, "phone quality: a smaller shadow map; soft room light (PMREM) and ACES tone mapping");
  const anim = await p.evaluate(async () => { const s = window.FIGTEST.stage; let k = 0; s.animate(() => ++k < 5); await new Promise(o => setTimeout(o, 700)); return { k, on: s.animating }; });
  ok(anim.k === 5 && !anim.on, "a loop runs only while its step says something moves, then stops by itself");
  const gone = await p.evaluate(() => { const s = window.FIGTEST.stage, gl = s.renderer.getContext(); window.FIGTEST.figs.forEach(f => f.dispose()); s.dispose(); return { lost: gl.isContextLost(), canvases: document.querySelectorAll("canvas").length, alive: s.alive }; });
  ok(gone.lost && gone.canvases === 0 && !gone.alive, "dispose loses the WebGL context and removes the canvas");
  ok(!errs.length, "no errors in the console" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));

  await b.close(); server.close();
  console.log(fails ? `\n${fails} check(s) failed.` : "\nAll figure checks passed.");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
