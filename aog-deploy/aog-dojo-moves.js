/* ══ AOG-DOJO-MOVES-V1 (2026-10-12) — the Dojo's move library (dojo.html, /dojo) ═══════════════════════════════
   Jimmy: "In the martial arts curriculum books, instructions on how to learn moves with this engine showing the
   person the moves!!!" Every move in the engine contract's table (_work/engine3d/CONTRACT.md, ids fixed) is a list of
   keyframes. Each keyframe belongs to a numbered step, and each step has a short, plain cue in English and Spanish.

   A keyframe:  { t: seconds from the start, s: step index (0-based), root: { pos:[x,y,z], rot:[x,y,z] },
                  j: { joint: [x,y,z] degrees, … }, L: foot, R: foot, ease, ground }
     · Joint angles follow the contract (Euler XYZ in degrees; the figure faces +z; its own left is +x):
         shoulderR [-90,0,0] arm forward · shoulderR [0,0,-90] arm out to the side · elbowR [-90,0,0] forearm up
         hipR [-90,0,0] thigh forward · kneeR [90,0,0] shin folds back · spine/chest [10,0,0] bend forward.
       A straight arm at [-90, 0, θ] points level, turned θ° toward the figure's left (either arm).
     · A foot { p:[x,z] the floor point under the ankle, yaw: degrees (+ turns the toes toward the figure's left),
       heel: degrees the heel is raised (standing on the ball of the foot) } is planted: the engine bends that leg so
       the foot lands exactly there, flat on the floor. A foot written "fk" is in the air, moved by its joint angles.
     · ground: "body" puts the lowest part of the body on the mat (falls, the sprawl).
     · ease: "soft" (default, in and out), "snap" (fast out, soft landing: strikes and kicks), "lin".
   The moves are written for the right side doing the work (the right hand punches, the right leg kicks, the left foot
   in front). "Mirror" (?side=left) flips every key to the other side; words never name a side, they say "front foot",
   "back hand", "kicking leg", so they read true either way. */
(function () {
"use strict";
const B = 0.13;   // the ball of the foot is about 13 cm in front of the ankle
const D2R = Math.PI / 180;

/* ── small helpers ── */
const clone = o => JSON.parse(JSON.stringify(o));
function merge() {   // later parts win; joint maps merge joint by joint
  const out = { j: {} };
  for (let i = 0; i < arguments.length; i++) {
    const p = arguments[i]; if (!p) continue;
    for (const k in p) {
      if (k === "j") Object.assign(out.j, clone(p.j));
      else if (k === "arm" || k === "grip") out[k] = Object.assign(out[k] || {}, clone(p[k]));
      else out[k] = clone(p[k]);
    }
  }
  return out;
}
const K = (t, s, ...parts) => Object.assign(merge(...parts), { t, s });
const foot = (x, z, yaw, heel) => ({ p: [x, z], yaw: yaw || 0, heel: heel || 0 });
/* turn a planted foot on its ball (the ball stays where it is) */
function pivot(f, yaw, heel) {
  const bx = f.p[0] + Math.sin(f.yaw * D2R) * B, bz = f.p[1] + Math.cos(f.yaw * D2R) * B;
  return { p: [+(bx - Math.sin(yaw * D2R) * B).toFixed(4), +(bz - Math.cos(yaw * D2R) * B).toFixed(4)], yaw, heel: heel || 0 };
}
const at = (f, dx, dz) => ({ p: [+(f.p[0] + dx).toFixed(4), +(f.p[1] + dz).toFixed(4)], yaw: f.yaw, heel: f.heel || 0 });
const root = (x, y, z, rx, ry, rz) => ({ root: { pos: [x, y, z], rot: [rx || 0, ry || 0, rz || 0] } });
const sub = (o, k, v) => { const c = clone(o); c[k] = v; return c; };

/* ── mirror a key to the other side (the engine calls this for ?side=left) ── */
const SWAP = { L: "R", R: "L" };
function mirrorAngles(a) { return [a[0], -a[1], -a[2]]; }
function mirrorFoot(f) { return f === "fk" || !f ? f : { p: [-f.p[0], f.p[1]], yaw: -f.yaw, heel: f.heel || 0 }; }
function mirrorKey(k) {
  const m = clone(k);
  if (k.root) m.root = { pos: [-k.root.pos[0], k.root.pos[1], k.root.pos[2]], rot: mirrorAngles(k.root.rot) };
  m.j = {};
  for (const n in k.j) {
    const last = n.slice(-1), other = (last === "L" || last === "R") && n !== "L" && n !== "R" ? n.slice(0, -1) + SWAP[last] : n;
    m.j[other] = mirrorAngles(k.j[n]);
  }
  m.L = mirrorFoot(k.R); m.R = mirrorFoot(k.L);
  if (k.grip) m.grip = { L: k.grip.R, R: k.grip.L };
  if (k.arm) { m.arm = {}; const mf = a => a && { to: [-a.to[0], a.to[1], a.to[2]], pole: [-a.pole[0], a.pole[1], a.pole[2]], twist: -(a.twist || 0), wrist: a.wrist && mirrorAngles(a.wrist) };
    if (k.arm.L) m.arm.R = mf(k.arm.L); if (k.arm.R) m.arm.L = mf(k.arm.R); }
  return m;
}

/* ══ stances (ball-of-foot aware; the left foot in front) ══ */
const ST = {
  attention: () => merge(root(0, 0, 0), { L: foot(0.07, 0, 14), R: foot(-0.07, 0, -14) }),
  ready: () => merge(root(0, -0.015, 0), { L: foot(0.13, 0, 9), R: foot(-0.13, 0, -9) }),
  horse: () => merge(root(0, -0.24, 0), { L: foot(0.37, 0, 6), R: foot(-0.37, 0, -6) }),
  front: (z) => merge(root(0, -0.15, (z || 0) + 0.05), { L: foot(0.12, (z || 0) + 0.42, 0), R: foot(-0.13, (z || 0) - 0.40, -28) }),
  frontR: (z) => merge(root(0, -0.15, (z || 0) + 0.05), { R: foot(-0.12, (z || 0) + 0.42, 0), L: foot(0.13, (z || 0) - 0.40, 28) }),
  back: (z) => merge(root(0.0, -0.21, (z || 0) - 0.10, 0, -50, 0), { L: foot(0.03, (z || 0) + 0.38, 0), R: foot(-0.02, (z || 0) - 0.30, -82) }),
  cat: (z) => merge(root(0.0, -0.21, (z || 0) - 0.07, 0, -25, 0), { L: foot(0.05, (z || 0) + 0.23, 0, 50), R: foot(-0.05, (z || 0) - 0.10, -35) }),
  guard: () => merge(root(0, -0.06, 0, 0, -28, 0), { L: foot(0.10, 0.20, -8), R: foot(-0.15, -0.22, -42, 14) })
};

/* ══ arms and upper body (right-side versions; L() mirrors a right-side part onto the left) ══ */
function Lside(part) { const out = {}; for (const n in part) out[n.slice(0, -1) + "L"] = mirrorAngles(part[n]); return out; }
const AR = {
  fistBelt: { shoulderR: [-14, 0, 12], elbowR: [-62, 30, 0], wristR: [0, 0, 0] },
  hip:      { shoulderR: [32, 0, -8], elbowR: [-122, -90, 0], wristR: [0, 0, 0] },        // fist on the hip, palm up
  punch:    { shoulderR: [-88, 0, 13], elbowR: [-4, 90, 0], wristR: [0, 0, 0] },          // straight, palm down, to the middle line
  punchHi:  { shoulderR: [-98, 0, 13], elbowR: [-4, 90, 0], wristR: [0, 0, 0] },
  reach:    { shoulderR: [-80, 0, 8], elbowR: [-6, 90, 0] },                               // the other hand reaches out before it pulls back
  guard:    { shoulderR: [-28, 0, 26], elbowR: [-138, 20, 0], wristR: [-10, 0, 0] },      // back hand by the chin
  guardLead:{ shoulderR: [-52, 0, 22], elbowR: [-112, 20, 0], wristR: [-10, 0, 0] },      // front hand at cheek height, a little forward
  sides:    { shoulderR: [4, 0, -4], elbowR: [-8, 0, 0] },
  // blocks
  riseStart:{ shoulderR: [30, 0, -8], elbowR: [-122, -90, 0] },                            // blocking arm low by the hip
  rise:     { shoulderR: [-150, 0, 22], elbowR: [-62, 70, 0], wristR: [0, 0, 0] },         // forearm above the forehead
  lowStart: { shoulderR: [-60, 0, 58], elbowR: [-128, 30, 0] },                            // fist by the other ear
  low:      { shoulderR: [-28, 0, -12], elbowR: [-10, 80, 0] },                            // forearm over the front knee
  inStart:  { shoulderR: [-30, 0, -62], elbowR: [-100, 0, 0] },                            // arm out to the side, fist up
  inside:   { shoulderR: [-55, 0, 28], elbowR: [-95, -40, 0] },                            // forearm across to the middle
  outStart: { shoulderR: [-35, 0, 55], elbowR: [-120, 60, 0] },                            // fist under the other arm
  outside:  { shoulderR: [-62, 0, -18], elbowR: [-92, -60, 0] },                           // forearm turned out, fist at shoulder height
  // strikes
  palm:     { shoulderR: [-92, 0, 12], elbowR: [-8, 0, 0], wristR: [0, 0, -70] },         // heel of the palm forward, fingers up
  palmStart:{ shoulderR: [30, 0, -8], elbowR: [-118, 0, 0], wristR: [0, 0, -60] },
  knifeStart:{ shoulderR: [-70, 0, 70], elbowR: [-135, 80, 0], wristR: [0, 0, 0] },        // open hand by the other ear
  knife:    { shoulderR: [-82, 0, -55], elbowR: [-8, 90, 0], wristR: [0, 0, 0] },          // arm out, edge of the hand leading
  hookCock: { shoulderR: [-60, 0, -40], elbowR: [-100, 90, 0] },
  hook:     { shoulderR: [-82, 0, -55], elbowR: [-92, 90, 0], wristR: [0, 0, 0] },         // elbow up, arm bent like a hook
  upperDip: { shoulderR: [-10, 0, 14], elbowR: [-110, -90, 0] },
  upper:    { shoulderR: [-58, 0, 16], elbowR: [-120, -90, 0] },                           // fist rises, palm toward you
  slap:     { shoulderR: [-8, 0, -48], elbowR: [-6, 0, 0], wristR: [0, 0, 0] }             // arm straight at 45°, palm down
};
/* arms that reach for a spot (IK), right-arm versions; spots are measured from where the figure stands */
const IK = {
  rise:    { to: [0.0, 1.72, 0.25], pole: [-0.7, 1.48, 0.38], twist: -60 },
  lowSet:  { to: [0.16, 1.48, 0.14], pole: [-0.2, 1.0, 0.4], twist: 0 },
  low:     { to: [-0.22, 0.82, 0.34], pole: [-0.6, 1.2, -0.1], twist: 70 },
  lowFS:   { to: [-0.17, 0.92, 0.56], pole: [-0.6, 1.3, 0.1], twist: 70 },
  inSet:   { to: [-0.48, 1.45, 0.12], pole: [-0.45, 0.9, -0.1], twist: 0 },
  inside:  { to: [-0.03, 1.38, 0.34], pole: [-0.3, 0.95, 0.35], twist: -40 },
  outSet:  { to: [0.12, 1.17, 0.14], pole: [-0.25, 1.05, 0.45], twist: 40 },
  outside: { to: [-0.27, 1.42, 0.32], pole: [-0.3, 0.95, 0.35], twist: -60 }
};
const ikDrop = (a, dy) => ({ to: [a.to[0], a.to[1] + dy, a.to[2]], pole: [a.pole[0], a.pole[1] + dy, a.pole[2]], twist: a.twist });
const ikL = a => ({ to: [-a.to[0], a.to[1], a.to[2]], pole: [-a.pole[0], a.pole[1], a.pole[2]], twist: -(a.twist || 0) });
const both = (r, l) => Object.assign({}, AR[r], Lside(AR[l || r]));
const arms = (r, l) => ({ j: both(r, l) });
const chinTuck = { j: { neck: [12, 0, 0], head: [6, 0, 0] } };
const tall = { j: { spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0] } };
const torso = (yaw, fwd) => ({ j: { spine: [fwd || 0, (yaw || 0) * 0.45, 0], chest: [0, (yaw || 0) * 0.55, 0] } });
const look = (yaw, down) => ({ j: { neck: [down || 0, (yaw || 0) * 0.5, 0], head: [0, (yaw || 0) * 0.5, 0] } });

/* guard pose (boxing, Muay Thai): left foot in front, hands up, chin down */
const GUARD = () => merge(ST.guard(), { j: Object.assign({}, AR.guard, Lside(AR.guardLead)) }, chinTuck);
const READY = () => merge(ST.ready(), arms("fistBelt"));
/* legs written by angle (the kicking leg in the air) */
const legR = (hip, knee, ankle, toe) => ({ R: "fk", j: { hipR: hip, kneeR: [knee, 0, 0], ankleR: ankle || [0, 0, 0], toeR: toe || [0, 0, 0] } });
const legL = (hip, knee, ankle, toe) => ({ L: "fk", j: { hipL: hip, kneeL: [knee, 0, 0], ankleL: ankle || [0, 0, 0], toeL: toe || [0, 0, 0] } });

/* ══ words ══ */
const W = (en, es) => ({ en, es });
const SAFE_KICK = W("Kick into the air, at knee or belly height. Never at a person.", "Patea al aire, a la altura de la rodilla o la barriga. Nunca a una persona.");
const SAFE_STRIKE = W("Strike the air, never a person. Keep your arm a little soft at the end.", "Golpea el aire, nunca a una persona. Deja el brazo un poco suave al final.");
const SAFE_FALL = W("Only on a mat or soft grass. Children: with a grown-up next to you.", "Solo sobre una colchoneta o pasto suave. Niños: con un adulto al lado.");

/* ══ THE MOVES ══ */
const M = [];
function move(o) { M.push(o); }

/* ─────────── Stances ─────────── */
move({ id: "ready", kind: "stance", band: "K-2", art: W("many arts", "muchas artes"),
  keys: [
    K(0, 0, ST.attention(), arms("sides")),
    K(0.9, 1, ST.attention(), merge(root(0, -0.005, 0)), arms("fistBelt")),
    K(1.8, 2, READY()),
    K(2.7, 3, READY(), { j: { chest: [-3, 0, 0] } }),
    K(3.3, 3, READY())
  ],
  en: { n: "Ready stance", steps: ["Stand tall with your feet together.", "Make two soft fists in front of your belt.", "Step your feet out as wide as your hips.", "Soften your knees. Breathe in, then out."],
        tips: ["Feel your weight in the middle of both feet.", "Shoulders low and relaxed. Eyes forward."] },
  es: { n: "Posición de listo", steps: ["Párate bien erguido con los pies juntos.", "Cierra dos puños suaves frente al cinturón.", "Separa los pies al ancho de la cadera.", "Afloja las rodillas. Inhala y luego exhala."],
        tips: ["Siente tu peso en el centro de los dos pies.", "Hombros bajos y relajados. La mirada al frente."] } });

move({ id: "horse", kind: "stance", band: "K-2", art: W("karate, kung fu, taekwondo", "karate, kung fu, taekwondo"),
  keys: [
    K(0, 0, READY()),
    K(0.9, 1, merge(root(0, -0.05, 0), { L: foot(0.37, 0, 6), R: ST.ready().R }, arms("fistBelt"))),
    K(1.4, 1, merge(root(0, -0.05, 0), { L: foot(0.37, 0, 6), R: foot(-0.37, 0, -6) }, arms("fistBelt"))),
    K(2.6, 2, ST.horse(), arms("hip"), tall),
    K(3.6, 3, ST.horse(), arms("hip"), { j: { spine: [-2, 0, 0] } }),
    K(4.2, 3, ST.horse(), arms("hip"))
  ],
  en: { n: "Horse stance", steps: ["Start in your ready stance.", "Step your feet out wide, about two shoulder widths.", "Bend your knees like you are riding a horse. Fists on your hips.", "Keep your back straight. Push your knees out over your toes."],
        tips: ["Toes point forward or a little out.", "Start high. Go lower a little at a time.", "Count five slow breaths, then stand up."] },
  es: { n: "Postura del jinete", steps: ["Empieza en tu posición de listo.", "Separa los pies bien abiertos, como dos anchos de hombros.", "Dobla las rodillas como si montaras a caballo. Puños en la cadera.", "Mantén la espalda recta. Empuja las rodillas hacia afuera, sobre los dedos."],
        tips: ["Los dedos miran al frente o un poco hacia afuera.", "Empieza alto. Baja un poco cada vez.", "Cuenta cinco respiraciones lentas y luego párate."] } });

move({ id: "front-stance", kind: "stance", band: "3-5", art: W("karate, taekwondo", "karate, taekwondo"),
  keys: [
    K(0, 0, READY()),
    K(0.8, 1, merge(root(0, -0.06, 0.02), { L: foot(0.15, 0, 9), R: ST.ready().R }, arms("fistBelt"))),
    K(1.8, 1, merge(root(0, -0.13, 0.10), { L: foot(0.12, 0.42, 0), R: foot(-0.13, -0.40 + 0.40, -9) }, arms("fistBelt"))),
    K(2.8, 2, merge(ST.front(), arms("fistBelt"))),
    K(3.8, 3, merge(ST.front(), arms("hip", "low"))),
    K(4.4, 3, merge(ST.front(), arms("hip", "low")))
  ],
  en: { n: "Front stance", steps: ["Start in your ready stance.", "Step your front foot forward, a long step.", "Turn your back foot out a little. Straighten your back leg.", "Bend your front knee over your toes. Hips face forward."],
        tips: ["Your front shin is straight up and down.", "Most of your weight is on the front leg.", "Feet stay shoulder width apart, like on two train tracks."] },
  es: { n: "Postura adelantada", steps: ["Empieza en tu posición de listo.", "Da un paso largo al frente con el pie delantero.", "Gira un poco hacia afuera el pie de atrás. Estira la pierna de atrás.", "Dobla la rodilla de adelante sobre los dedos. La cadera mira al frente."],
        tips: ["La espinilla de adelante queda vertical.", "Casi todo tu peso va en la pierna de adelante.", "Los pies quedan al ancho de los hombros, como sobre dos rieles."] } });

move({ id: "back-stance", kind: "stance", band: "6-8", art: W("karate, taekwondo", "karate, taekwondo"),
  keys: [
    K(0, 0, READY()),
    K(1.0, 1, merge(root(0, -0.08, -0.02, 0, -20, 0), { L: foot(0.15, 0, 9), R: foot(-0.06, -0.30, -82) }, arms("fistBelt"))),
    K(2.1, 2, merge(ST.back(0), { L: foot(0.03, 0.38, 0) }, arms("guard", "guardLead"), torso(-10))),
    K(3.1, 3, merge(ST.back(0), arms("guard", "guardLead"), torso(-10), look(40))),
    K(3.7, 3, merge(ST.back(0), arms("guard", "guardLead"), torso(-10), look(40)))
  ],
  en: { n: "Back stance", steps: ["Start in your ready stance.", "Step your back foot behind you. Turn it out to the side.", "Sit back. Bend your back knee. Most of your weight goes on it.", "Front foot points forward, light. Look over your front shoulder."],
        tips: ["Both heels sit on one line.", "About seven parts of your weight on the back leg, three on the front.", "Your back knee points the same way as your back toes."] },
  es: { n: "Postura atrasada", steps: ["Empieza en tu posición de listo.", "Lleva el pie de atrás hacia atrás. Gíralo hacia el lado.", "Siéntate atrás. Dobla la rodilla de atrás. Casi todo tu peso va en ella.", "El pie de adelante mira al frente, ligero. Mira por encima del hombro de adelante."],
        tips: ["Los dos talones quedan en una línea.", "Unas siete partes del peso en la pierna de atrás y tres en la de adelante.", "La rodilla de atrás apunta hacia donde apuntan los dedos de atrás."] } });

move({ id: "cat-stance", kind: "stance", band: "6-8", art: W("karate, kung fu", "karate, kung fu"),
  keys: [
    K(0, 0, READY()),
    K(1.0, 1, merge(root(0, -0.12, -0.04, 0, -18, 0), { L: foot(0.10, 0.04, 4), R: foot(-0.05, -0.10, -35) }, arms("guard", "guardLead"))),
    K(2.0, 2, merge(ST.cat(0), { L: foot(0.05, 0.23, 0, 0) }, arms("guard", "guardLead"))),
    K(2.9, 3, merge(ST.cat(0), arms("guard", "guardLead"), tall)),
    K(3.5, 3, merge(ST.cat(0), arms("guard", "guardLead")))
  ],
  en: { n: "Cat stance", steps: ["Start in your ready stance.", "Turn your back foot out. Bend that knee and sit on it.", "Slide your front foot forward, close in.", "Lift the front heel. Only the ball of your front foot touches, light like a cat's paw."],
        tips: ["Almost all of your weight is on the back leg.", "You could lift your front foot at any time.", "Keep your back straight, not leaning back."] },
  es: { n: "Postura del gato", steps: ["Empieza en tu posición de listo.", "Gira hacia afuera el pie de atrás. Dobla esa rodilla y siéntate en ella.", "Desliza el pie de adelante, cerca.", "Levanta el talón de adelante. Solo toca la punta del pie, ligera como la pata de un gato."],
        tips: ["Casi todo tu peso está en la pierna de atrás.", "Podrías levantar el pie de adelante en cualquier momento.", "Mantén la espalda recta, sin inclinarte hacia atrás."] } });

move({ id: "guard", kind: "stance", band: "6-8", art: W("boxing, Muay Thai, kickboxing", "boxeo, Muay Thai, kickboxing"),
  keys: [
    K(0, 0, READY()),
    K(1.0, 1, merge(root(0, -0.03, 0, 0, -14, 0), { L: foot(0.10, 0.20, -8), R: foot(-0.15, -0.22, -42, 0) }, arms("fistBelt"))),
    K(2.0, 2, merge(ST.guard(), { j: Object.assign({}, AR.guard, Lside(AR.guardLead)) })),
    K(2.9, 3, GUARD()),
    K(3.5, 3, GUARD())
  ],
  en: { n: "Guard (fighting stance)", steps: ["Start in your ready stance.", "Step one foot forward and turn your body a little sideways.", "Bring your hands up: back hand by your chin, front hand by your cheek.", "Tuck your chin. Elbows in. Knees soft. Back heel a little up."],
        tips: ["Feet about shoulder width, like standing on a clock at 12 and 4.", "Look over your front hand.", "Stay relaxed. Tight shoulders make you slow."] },
  es: { n: "Guardia", steps: ["Empieza en tu posición de listo.", "Adelanta un pie y gira el cuerpo un poco de lado.", "Sube las manos: la de atrás junto a la barbilla, la de adelante junto a la mejilla.", "Baja la barbilla. Codos adentro. Rodillas suaves. El talón de atrás un poco arriba."],
        tips: ["Pies al ancho de los hombros.", "Mira por encima de la mano de adelante.", "Quédate relajado. Los hombros tensos te hacen lento."] } });

/* ─────────── Footwork ─────────── */
{
  const A = merge(ST.front(0), arms("guard", "guardLead"));
  const mid = merge(root(0, -0.15, 0.42), { L: foot(0.12, 0.42, 0), R: foot(-0.04, 0.40, -6) }, arms("guard", "guardLead"));
  const Bk = merge(ST.frontR(0.84), arms("guardLead", "guard"));
  move({ id: "step-forward", kind: "footwork", band: "K-2", art: W("many arts", "muchas artes"),
    keys: [K(0, 0, A), K(0.6, 1, merge(A, root(0, -0.15, 0.30))), K(1.3, 1, mid), K(2.1, 2, Bk), K(2.7, 3, Bk), K(3.1, 3, Bk)],
    en: { n: "Step forward", steps: ["Start in a front stance, hands up.", "Shift your weight forward. Bring your back foot next to your front foot.", "Keep going. Step it out in front into a new front stance.", "Stop and stand strong. Your head stayed at the same height."],
          tips: ["Glide. Do not bob up and down.", "The foot passes close to the other foot.", "Keep your hands up the whole time."] },
    es: { n: "Paso adelante", steps: ["Empieza en postura adelantada, manos arriba.", "Pasa el peso adelante. Trae el pie de atrás junto al de adelante.", "Sigue. Sácalo al frente en una nueva postura adelantada.", "Detente firme. Tu cabeza se quedó a la misma altura."],
          tips: ["Deslízate. No subas y bajes.", "El pie pasa cerca del otro pie.", "Mantén las manos arriba todo el tiempo."] } });
  const A2 = merge(ST.front(0), arms("guard", "guardLead"));
  const mid2 = merge(root(0, -0.15, -0.36), { R: foot(-0.13, -0.40, -28), L: foot(0.04, -0.38, 6) }, arms("guard", "guardLead"));
  const B2 = merge(ST.frontR(-0.82), arms("guardLead", "guard"));
  move({ id: "step-back", kind: "footwork", band: "K-2", art: W("many arts", "muchas artes"),
    keys: [K(0, 0, A2), K(0.6, 1, merge(A2, root(0, -0.15, -0.22))), K(1.3, 1, mid2), K(2.1, 2, B2), K(2.7, 3, B2), K(3.1, 3, B2)],
    en: { n: "Step back", steps: ["Start in a front stance, hands up.", "Shift your weight back. Bring your front foot next to your back foot.", "Keep going. Step it out behind you into a new front stance.", "Stop and stand strong. Hands stayed up."],
          tips: ["Look forward, not at your feet.", "Glide at one height, like a train on a track.", "Step back as far as you stepped forward."] },
    es: { n: "Paso atrás", steps: ["Empieza en postura adelantada, manos arriba.", "Pasa el peso atrás. Trae el pie de adelante junto al de atrás.", "Sigue. Sácalo atrás en una nueva postura adelantada.", "Detente firme. Las manos siguen arriba."],
          tips: ["Mira al frente, no a tus pies.", "Deslízate a una sola altura, como un tren en su riel.", "Da el paso atrás tan largo como el paso adelante."] } });
}
{
  const G = GUARD(), g = ST.guard();
  const fwd = (d, L, R) => merge(G, root(0, -0.06, d, 0, -28, 0), { L, R });
  move({ id: "shuffle", kind: "footwork", band: "6-8", art: W("boxing, taekwondo", "boxeo, taekwondo"),
    keys: [
      K(0, 0, G),
      K(0.45, 1, fwd(0.12, at(g.L, 0, 0.24), g.R), { ease: "snap" }),
      K(0.8, 1, fwd(0.24, at(g.L, 0, 0.24), at(g.R, 0, 0.24))),
      K(1.4, 2, fwd(0.24, at(g.L, 0, 0.24), at(g.R, 0, 0.24))),
      K(1.85, 2, fwd(0.12, at(g.L, 0, 0.24), at(g.R, 0, 0)), { ease: "snap" }),
      K(2.2, 2, fwd(0, g.L, g.R)),
      K(2.8, 3, G)
    ],
    en: { n: "Shuffle step", steps: ["Start in your guard.", "Push off your back foot. Your front foot slides forward, then the back foot follows.", "Go back: your back foot slides back, then the front foot follows.", "You are in the same stance, the same width. Hands stayed up."],
          tips: ["Small steps. Feet stay close to the floor.", "Never cross or bring your feet together.", "The foot nearest where you go moves first."] },
    es: { n: "Paso deslizado", steps: ["Empieza en tu guardia.", "Empuja con el pie de atrás. El pie de adelante se desliza al frente y el de atrás lo sigue.", "Regresa: el pie de atrás se desliza atrás y el de adelante lo sigue.", "Quedas en la misma postura y el mismo ancho. Las manos siguen arriba."],
          tips: ["Pasos cortos. Los pies cerca del piso.", "Nunca cruces ni juntes los pies.", "Se mueve primero el pie más cercano a donde vas."] } });
  // pivot: on the ball of the front foot, the back foot swings a quarter turn
  const L0 = g.L, R0 = g.R, L1 = pivot(L0, L0.yaw + 90, 18);
  const ballL = [L0.p[0] + Math.sin(L0.yaw * D2R) * B, L0.p[1] + Math.cos(L0.yaw * D2R) * B];
  const rot = (pt, deg) => { const a = deg * D2R, x = pt[0] - ballL[0], z = pt[1] - ballL[1]; return [+(ballL[0] + x * Math.cos(a) + z * Math.sin(a)).toFixed(4), +(ballL[1] - x * Math.sin(a) + z * Math.cos(a)).toFixed(4)]; };
  const Rp1 = rot(R0.p, 45), Rp2 = rot(R0.p, 90), c1 = rot([0, 0], 45), c2 = rot([0, 0], 90);
  move({ id: "pivot", kind: "footwork", band: "9-12", art: W("many arts", "muchas artes"),
    keys: [
      K(0, 0, G),
      K(0.6, 1, merge(G, { L: pivot(L0, L0.yaw, 18) }, root(0.02, -0.07, 0.03, 0, -28, 0))),
      K(1.25, 2, merge(G, root(c1[0], -0.07, c1[1], 0, 17, 0), { L: pivot(L0, L0.yaw + 45, 18), R: { p: Rp1, yaw: R0.yaw + 45, heel: 10 } })),
      K(1.9, 2, merge(G, root(c2[0], -0.06, c2[1], 0, 62, 0), { L: L1, R: { p: Rp2, yaw: R0.yaw + 90, heel: 14 } })),
      K(2.5, 3, merge(G, root(c2[0], -0.06, c2[1], 0, 62, 0), { L: pivot(L1, L1.yaw, 0), R: { p: Rp2, yaw: R0.yaw + 90, heel: 14 } })),
      K(3.0, 3, merge(G, root(c2[0], -0.06, c2[1], 0, 62, 0), { L: pivot(L1, L1.yaw, 0), R: { p: Rp2, yaw: R0.yaw + 90, heel: 14 } }))
    ],
    en: { n: "Pivot turn", steps: ["Start in your guard.", "Rise a little onto the ball of your front foot.", "Swing your back foot around a quarter turn. Your body turns with it.", "Set your front heel down. You are in guard, facing a new way."],
          tips: ["The ball of the front foot stays on its spot, like a door hinge.", "Turn your hips and shoulders together.", "Hands stay up while you turn."] },
    es: { n: "Giro sobre el pie", steps: ["Empieza en tu guardia.", "Súbete un poco a la punta del pie de adelante.", "Gira el pie de atrás un cuarto de vuelta. Tu cuerpo gira con él.", "Baja el talón de adelante. Estás en guardia, mirando hacia otro lado."],
          tips: ["La punta del pie de adelante se queda en su lugar, como la bisagra de una puerta.", "Gira la cadera y los hombros juntos.", "Las manos siguen arriba mientras giras."] } });
}

/* ─────────── Hand strikes ─────────── */
{
  const G = GUARD(), g = ST.guard();
  const jabOut = merge(G, root(0.01, -0.06, 0.03, 0, -36, 0), { j: { clavL: [0, 0, 8], neck: [14, 0, 0] }, arm: { L: { to: [0.02, 1.40, 0.80], pole: [0.5, 0.9, 0.1], twist: 0 } } });
  move({ id: "jab", kind: "hand", band: "3-5", art: W("boxing", "boxeo"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(0.82, 1, jabOut, { ease: "snap" }), K(1.3, 1, jabOut), K(1.65, 2, G), K(2.3, 2, G)],
    en: { n: "Jab", steps: ["Start in your guard. Hands up by your face.", "Snap your front hand straight out. Turn the fist so the palm faces down. Breathe out.", "Bring it straight back to your face, the same way it went."],
          tips: ["Your back hand stays by your chin.", "Lift your front shoulder to cover your chin.", "Fast out, fast back, like touching a hot stove."] },
    es: { n: "Jab", steps: ["Empieza en tu guardia. Manos arriba junto a la cara.", "Lanza la mano de adelante recta. Gira el puño para que la palma mire abajo. Exhala.", "Regrésala recta a tu cara, por el mismo camino."],
          tips: ["La mano de atrás se queda junto a la barbilla.", "Sube el hombro de adelante para cubrir la barbilla.", "Rápido al salir y rápido al volver, como si tocaras una estufa caliente."] } });
  const crossOut = merge(G, root(0.01, -0.07, 0.05, 0, 4, 0), { R: pivot(g.R, -8, 32) }, torso(10), { j: { clavR: [0, 0, -6], neck: [14, -6, 0] }, arm: { R: { to: [-0.01, 1.40, 0.86], pole: [-0.5, 0.9, 0.1], twist: 0 } } });
  move({ id: "cross", kind: "hand", band: "3-5", art: W("boxing", "boxeo"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(0.9, 1, crossOut, { ease: "snap" }), K(1.4, 1, crossOut), K(1.8, 2, G), K(2.4, 2, G)],
    en: { n: "Cross", steps: ["Start in your guard.", "Turn your back foot and hip forward. Your back hand goes straight out. Breathe out.", "Bring the hand back to your chin and turn back into your guard."],
          tips: ["Your back heel lifts and turns, like squashing a bug.", "The power comes from your hip, not just your arm.", "Your front hand guards your face."] },
    es: { n: "Directo", steps: ["Empieza en tu guardia.", "Gira el pie y la cadera de atrás hacia adelante. La mano de atrás sale recta. Exhala.", "Regresa la mano a la barbilla y vuelve a tu guardia."],
          tips: ["El talón de atrás se levanta y gira, como si aplastaras un bicho.", "La fuerza viene de la cadera, no solo del brazo.", "La mano de adelante protege tu cara."] } });
  const hookOut = merge(G, root(0.0, -0.07, 0.02, 0, -48, 0), { L: pivot(g.L, -40, 26) }, torso(-14), { j: { neck: [14, 30, 0] }, arm: { L: { to: [-0.06, 1.38, 0.42], pole: [0.7, 1.42, 0.1], twist: 0 } } });
  move({ id: "hook", kind: "hand", band: "6-8", art: W("boxing", "boxeo"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(0.92, 1, hookOut, { ease: "snap" }), K(1.4, 1, hookOut), K(1.8, 2, G), K(2.4, 2, G)],
    en: { n: "Hook", steps: ["Start in your guard.", "Turn your front foot, hip and shoulder together. Your front arm swings around, bent like a hook, elbow at shoulder height. Breathe out.", "Turn back and bring the hand to your face."],
          tips: ["Keep the elbow bent the same amount the whole time.", "Your front heel turns out as your hip turns.", "Small and tight. The arm does not reach far."] },
    es: { n: "Gancho", steps: ["Empieza en tu guardia.", "Gira juntos el pie, la cadera y el hombro de adelante. El brazo de adelante gira doblado como un gancho, con el codo a la altura del hombro. Exhala.", "Gira de vuelta y lleva la mano a tu cara."],
          tips: ["Mantén el codo igual de doblado todo el tiempo.", "El talón de adelante gira hacia afuera cuando gira la cadera.", "Corto y cerrado. El brazo no se estira lejos."] } });
  const dip = merge(G, root(0, -0.13, 0, 0, -20, 0), { j: Object.assign({}, AR.upperDip) }, torso(-6, 6), chinTuck);
  const upOut = merge(G, root(0, -0.05, 0.03, 0, 2, 0), { R: pivot(g.R, -10, 30) }, torso(10, -2), chinTuck, { arm: { R: { to: [-0.03, 1.38, 0.40], pole: [-0.25, 0.8, 0.6], twist: 0 } } });
  move({ id: "uppercut", kind: "hand", band: "6-8", art: W("boxing", "boxeo"),
    keys: [K(0, 0, G), K(0.5, 0, G), K(1.0, 1, dip), K(1.3, 2, upOut, { ease: "snap" }), K(1.8, 2, upOut), K(2.2, 3, G), K(2.8, 3, G)],
    en: { n: "Uppercut", steps: ["Start in your guard.", "Bend your knees a little and drop your back hand to chest height.", "Push up with your legs and turn your hip. Your fist rises, palm toward you. Breathe out.", "Bring the hand back to your chin."],
          tips: ["The power comes up from your legs.", "Keep the elbow bent. The fist comes up, not out.", "Your other hand stays by your face."] },
    es: { n: "Uppercut", steps: ["Empieza en tu guardia.", "Dobla un poco las rodillas y baja la mano de atrás a la altura del pecho.", "Empuja hacia arriba con las piernas y gira la cadera. El puño sube con la palma hacia ti. Exhala.", "Regresa la mano a la barbilla."],
          tips: ["La fuerza sube desde las piernas.", "Mantén el codo doblado. El puño sube, no se va al frente.", "La otra mano se queda junto a tu cara."] } });
}
{
  const S0 = ST.front(0);
  const start = merge(S0, root(0, -0.15, 0.05, 0, -30, 0), arms("hip", "reach"), tall);
  const punch = merge(S0, root(0, -0.16, 0.07, 0, 0, 0), arms("punch", "hip"), tall);
  move({ id: "reverse-punch", kind: "hand", band: "K-2", art: W("karate", "karate"),
    keys: [K(0, 0, start), K(0.8, 0, start), K(1.25, 1, punch, { ease: "snap" }), K(2.0, 2, punch), K(2.9, 3, start), K(3.5, 3, start)],
    en: { n: "Reverse punch", steps: ["Front stance. Back fist on your hip, palm up. Front hand reaching out.", "Punch with the back hand. Twist the fist palm down at the end. Pull the other fist to your hip. Turn your hips forward.", "Stop and hold. Breathe out with a short sound.", "Slowly go back to the start and do it again."],
          tips: ["Both hands move at the same time, like a seesaw.", "Hit with the first two knuckles.", "Slow is fine. Smooth comes first, then fast."] },
    es: { n: "Puño invertido", steps: ["Postura adelantada. El puño de atrás en la cadera, palma arriba. La mano de adelante estirada.", "Golpea con la mano de atrás. Gira el puño, palma abajo, al final. Lleva el otro puño a la cadera. Gira la cadera al frente.", "Detente y sostén. Exhala con un sonido corto.", "Vuelve despacio al inicio y hazlo otra vez."],
          tips: ["Las dos manos se mueven a la vez, como un subibaja.", "Golpea con los dos primeros nudillos.", "Despacio está bien. Primero suave, luego rápido."] } });
  const G = GUARD(), g = ST.guard();
  const cock = merge(G, { j: Object.assign({}, AR.palmStart) });
  const out = merge(G, root(0.01, -0.07, 0.05, 0, 6, 0), { R: pivot(g.R, -8, 30) }, torso(8), { j: { neck: [10, -6, 0] }, arm: { R: { to: [-0.01, 1.40, 0.84], pole: [-0.5, 0.9, 0.1], twist: 0, wrist: [0, 0, -70] } }, grip: { R: 0.05 } });
  move({ id: "palm-strike", kind: "hand", band: "6-8", art: W("kung fu, self-defense", "kung fu, defensa personal"),
    keys: [K(0, 0, G), K(0.8, 1, cock), K(1.2, 2, out, { ease: "snap" }), K(1.9, 2, out), K(2.4, 3, G), K(3.0, 3, G)],
    en: { n: "Palm strike", steps: ["Start in your guard.", "Open your back hand. Bend the wrist back so the fingers point up.", "Push the heel of your palm straight forward and turn your hip. Breathe out.", "Bring the hand back to your face."],
          tips: ["The strong part is the heel of the hand, near the wrist.", "Keep the fingers together and back.", "A safe strike for the hand: no knuckles."] },
    es: { n: "Golpe de palma", steps: ["Empieza en tu guardia.", "Abre la mano de atrás. Dobla la muñeca hacia atrás para que los dedos apunten arriba.", "Empuja la base de la palma recta al frente y gira la cadera. Exhala.", "Regresa la mano a tu cara."],
          tips: ["La parte fuerte es la base de la mano, cerca de la muñeca.", "Dedos juntos y hacia atrás.", "Un golpe seguro para la mano: sin nudillos."] } });
  const H = ST.horse();
  const kStart = merge(H, root(0, -0.22, 0, 0, 0, 0), { j: Object.assign({}, AR.knifeStart, Lside(AR.hip)) }, torso(18), look(-40), { grip: { R: 0.04 } });
  const kOut = merge(H, root(0, -0.23, 0, 0, 0, 0), { j: Object.assign({}, AR.knife, Lside(AR.hip)) }, torso(-12), look(-55), { grip: { R: 0.04 } });
  move({ id: "knife-hand", kind: "hand", band: "6-8", art: W("karate, taekwondo", "karate, taekwondo"),
    keys: [K(0, 0, merge(H, arms("hip"))), K(0.9, 1, kStart), K(1.35, 2, kOut, { ease: "snap" }), K(2.1, 2, kOut), K(2.8, 3, merge(H, arms("hip"), look(0))), K(3.3, 3, merge(H, arms("hip")))],
    en: { n: "Knife-hand strike", steps: ["Horse stance, fists on your hips.", "Open one hand flat, fingers together. Bring it up by your other ear, palm toward the ear.", "Sweep the arm out to the side. Hit with the outside edge of the hand, palm down. Breathe out.", "Make a fist again and bring it back to your hip."],
          tips: ["Thumb tucked in along the hand.", "Look where your hand goes.", "Strike the air, like slicing a piece of paper."] },
    es: { n: "Golpe de mano de cuchillo", steps: ["Postura del jinete, puños en la cadera.", "Abre una mano plana, dedos juntos. Súbela junto a la otra oreja, con la palma hacia la oreja.", "Barre el brazo hacia el lado. Golpea con el borde de afuera de la mano, palma abajo. Exhala.", "Vuelve a cerrar el puño y regrésalo a la cadera."],
          tips: ["El pulgar va pegado a la mano.", "Mira hacia donde va tu mano.", "Golpea el aire, como si cortaras una hoja de papel."] } });
}

/* ─────────── Blocks (in place, ready stance; the other fist pulls to the hip) ─────────── */
function blockMove(id, band, startArms, endArms, en, es, extra) {
  const S = ST.ready();
  const r0 = merge(S, arms("fistBelt"));
  const part = x => typeof x === "string" ? { j: AR[x] } : x;
  const a = merge(S, { j: Object.assign({}, Lside(AR.reach)) }, part(startArms), extra && extra.a);
  const b = merge(S, { j: Object.assign({}, Lside(AR.hip)) }, part(endArms), extra && extra.b);
  move({ id, kind: "block", band, art: W("karate, taekwondo", "karate, taekwondo"),
    keys: [K(0, 0, r0), K(0.9, 1, a), K(1.35, 2, b, { ease: "snap" }), K(2.1, 2, b), K(2.9, 3, r0), K(3.4, 3, r0)], en, es });
}
blockMove("high-block", "K-2", "riseStart", { arm: { R: IK.rise } },
  { n: "Rising block", steps: ["Stand in your ready stance.", "Get set: blocking fist low by your hip, other hand reaching up in front.", "Raise the blocking forearm up over your forehead, turned out. Pull the other fist to your hip. Breathe out.", "Lower your arms back to ready."],
    tips: ["Your forearm stops about one fist above your forehead.", "The forearm slants up a little, like a roof.", "The two arms cross in front of you on the way."] },
  { n: "Bloqueo alto", steps: ["Párate en tu posición de listo.", "Prepárate: el puño que bloquea abajo junto a la cadera, la otra mano estirada arriba al frente.", "Sube el antebrazo que bloquea por encima de la frente, girado hacia afuera. Lleva el otro puño a la cadera. Exhala.", "Baja los brazos a la posición de listo."],
    tips: ["El antebrazo se detiene a un puño por encima de la frente.", "El antebrazo sube un poco inclinado, como un techo.", "Los dos brazos se cruzan frente a ti al pasar."] },
  { b: { j: { neck: [-4, 0, 0] } } });
blockMove("low-block", "K-2", { arm: { R: IK.lowSet } }, { arm: { R: IK.low } },
  { n: "Downward block", steps: ["Stand in your ready stance.", "Get set: blocking fist up by your other ear, other hand reaching down in front.", "Sweep the blocking arm down across your body. Stop a fist above your knee. Pull the other fist to your hip. Breathe out.", "Bring your arms back to ready."],
    tips: ["The blocking arm is almost straight at the end.", "Sweep like brushing crumbs off a table.", "Stand tall. Look forward, not down."] },
  { n: "Bloqueo bajo", steps: ["Párate en tu posición de listo.", "Prepárate: el puño que bloquea arriba junto a la otra oreja, la otra mano estirada hacia abajo al frente.", "Barre el brazo hacia abajo cruzando el cuerpo. Detente a un puño sobre la rodilla. Lleva el otro puño a la cadera. Exhala.", "Regresa los brazos a la posición de listo."],
    tips: ["El brazo que bloquea queda casi recto al final.", "Barre como si quitaras migas de una mesa.", "Párate erguido. Mira al frente, no abajo."] });
blockMove("inside-block", "3-5", { arm: { R: IK.inSet } }, { arm: { R: IK.inside } },
  { n: "Inside block", steps: ["Stand in your ready stance.", "Get set: blocking arm out to the side, elbow bent, fist up.", "Swing the forearm in across your chest to the middle. Pull the other fist to your hip. Breathe out.", "Bring your arms back to ready."],
    tips: ["Your elbow stays bent, about a right angle.", "The fist stops in line with your shoulder.", "Turn the forearm as it moves, like turning a key."] },
  { n: "Bloqueo hacia adentro", steps: ["Párate en tu posición de listo.", "Prepárate: el brazo que bloquea hacia el lado, codo doblado, puño arriba.", "Lleva el antebrazo hacia adentro, cruzando el pecho hasta el centro. Lleva el otro puño a la cadera. Exhala.", "Regresa los brazos a la posición de listo."],
    tips: ["El codo sigue doblado, como una esquina.", "El puño se detiene en línea con el hombro.", "Gira el antebrazo al moverlo, como al girar una llave."] },
  { b: { j: { chest: [0, -12, 0] } } });
blockMove("outside-block", "3-5", { arm: { R: IK.outSet } }, { arm: { R: IK.outside } },
  { n: "Outside block", steps: ["Stand in your ready stance.", "Get set: blocking fist under your other arm, near the armpit.", "Swing the forearm out to the side of your body. Fist at shoulder height. Pull the other fist to your hip. Breathe out.", "Bring your arms back to ready."],
    tips: ["Your elbow stays bent, about a right angle.", "The forearm stops just past your shoulder, not far out.", "Turn the fist as it arrives."] },
  { n: "Bloqueo hacia afuera", steps: ["Párate en tu posición de listo.", "Prepárate: el puño que bloquea debajo del otro brazo, cerca de la axila.", "Lleva el antebrazo hacia afuera, al lado del cuerpo. El puño a la altura del hombro. Lleva el otro puño a la cadera. Exhala.", "Regresa los brazos a la posición de listo."],
    tips: ["El codo sigue doblado, como una esquina.", "El antebrazo se detiene justo después del hombro, no muy afuera.", "Gira el puño al llegar."] },
  { a: { j: { chest: [0, 14, 0] } }, b: { j: { chest: [0, 8, 0] } } });

/* ─────────── Kicks (the back leg kicks; guard hands up) ─────────── */
{
  const R0 = merge(ST.ready(), arms("guard", "guard"));
  const chamber = merge(R0, root(0.06, -0.03, 0), { L: foot(0.15, 0, 9) }, legR([-92, 0, 0], 100, [-15, 0, 0], [0, 0, 0]));
  const ch2 = merge(chamber, root(0.06, -0.04, 0), { j: { kneeR: [90, 0, 0] } });
  move({ id: "knee-raise", kind: "kick", band: "K-2", art: W("every kicking art", "todas las artes de patada"),
    keys: [K(0, 0, R0), K(0.7, 1, merge(R0, root(0.06, -0.025, 0))), K(1.5, 2, chamber), K(2.6, 2, ch2), K(3.4, 3, merge(R0, root(0.06, -0.025, 0))), K(3.9, 3, R0)],
    en: { n: "Knee raise (chamber)", steps: ["Stand tall, hands up.", "Shift your weight onto your standing leg.", "Lift your other knee up to your belt, like a shield. Toes pull back. Hold and count to three.", "Lower your foot softly to the floor."],
          tips: ["Stand tall. Do not lean back.", "A wall or chair nearby helps with balance.", "This is the first part of almost every kick."] },
    es: { n: "Levantar la rodilla", steps: ["Párate bien erguido, manos arriba.", "Pasa tu peso a la pierna de apoyo.", "Sube la otra rodilla hasta el cinturón, como un escudo. Los dedos hacia atrás. Sostén y cuenta hasta tres.", "Baja el pie suave al piso."],
          tips: ["Mantente erguido. No te inclines atrás.", "Una pared o una silla cerca ayuda con el equilibrio.", "Esta es la primera parte de casi todas las patadas."] } });
}
{
  const S0 = merge(ST.front(0), arms("guard", "guardLead"), { root: { pos: [0, -0.12, 0.05], rot: [0, 0, 0] } });
  const sL = foot(0.12, 0.42, 0);
  const shift = merge(S0, root(0.08, -0.06, 0.40, 0, 0, 0), { L: sL });
  const cham = merge(shift, root(0.08, -0.05, 0.40, -4, 0, 0), legR([-100, 0, 4], 118, [-25, 0, 0], [-40, 0, 0]));
  const ext = merge(shift, root(0.08, -0.04, 0.42, -10, 0, 0), legR([-88, 0, 4], 6, [-28, 0, 0], [-45, 0, 0]), { j: { spine: [-4, 0, 0] } });
  move({ id: "front-kick", kind: "kick", band: "3-5", art: W("karate, taekwondo", "karate, taekwondo"),
    keys: [K(0, 0, S0), K(0.7, 0, S0), K(1.3, 1, cham), K(1.62, 2, ext, { ease: "snap" }), K(2.2, 2, ext), K(2.55, 3, cham), K(3.3, 4, S0), K(3.8, 4, S0)],
    en: { n: "Front kick", steps: ["Start in a front stance, hands up.", "Bring your back knee up first, like a shield. Toes pull back.", "Snap your lower leg out. Hit with the ball of your foot. Breathe out.", "Pull the foot back to your knee straight away.", "Put the foot down where it started."],
          tips: ["Keep the knee pointing at the target the whole time.", "Pull your toes back so you kick with the ball of the foot.", "Beginners kick at knee or belly height."] },
    es: { n: "Patada frontal", steps: ["Empieza en postura adelantada, manos arriba.", "Sube primero la rodilla de atrás, como un escudo. Los dedos hacia atrás.", "Lanza la parte baja de la pierna. Golpea con la planta, bajo los dedos. Exhala.", "Regresa el pie a la rodilla enseguida.", "Baja el pie donde empezó."],
          tips: ["La rodilla apunta al blanco todo el tiempo.", "Lleva los dedos hacia atrás para patear con la planta.", "Los principiantes patean a la altura de la rodilla o la barriga."] } });
  const G = GUARD(), g = ST.guard();
  const tShift = merge(G, root(0.06, -0.05, 0.12, 0, -18, 0), { L: g.L });
  const tCham = merge(tShift, root(0.06, -0.04, 0.12, -6, -10, 0), legR([-108, 0, 0], 118, [-20, 0, 0], [-30, 0, 0]));
  const tExt = merge(tShift, root(0.06, -0.03, 0.12, -16, -10, 0), legR([-84, 0, 0], 4, [-6, 0, 0], [-35, 0, 0]), { j: { spine: [-6, 0, 0], shoulderR: [6, 0, -8], elbowR: [-60, 0, 0] } }, { L: pivot(g.L, 20, 0) });
  move({ id: "teep", kind: "kick", band: "9-12", art: W("Muay Thai", "Muay Thai"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(1.2, 1, tCham), K(1.6, 2, tExt, { ease: "snap" }), K(2.2, 2, tExt), K(2.6, 3, tCham), K(3.3, 3, G), K(3.8, 3, G)],
    en: { n: "Push kick (teep)", steps: ["Start in your guard.", "Lift your back knee up high in front of you.", "Push your hips forward and press the foot straight out, like pushing a door shut. Lean back a little. Breathe out.", "Bring the knee back and set the foot down in your guard."],
          tips: ["It is a push, not a snap. Think of moving something away.", "Push with the ball of the foot or the whole sole.", "Your hands stay up while you lean back."] },
    es: { n: "Patada de empuje (teep)", steps: ["Empieza en tu guardia.", "Sube alto la rodilla de atrás frente a ti.", "Empuja la cadera al frente y estira el pie recto, como si cerraras una puerta con él. Inclínate un poco atrás. Exhala.", "Regresa la rodilla y baja el pie en tu guardia."],
          tips: ["Es un empujón, no un latigazo. Piensa en alejar algo.", "Empuja con la planta o con toda la suela.", "Las manos siguen arriba mientras te inclinas."] } });
  // roundhouse: the standing foot turns, the hip turns over, the knee comes up sideways, then the shin snaps around
  const rTurn = merge(G, root(0.04, -0.05, 0.18, 0, 20, 0), { L: pivot(g.L, 50, 16), R: pivot(g.R, -10, 50) });
  const rCham = merge(G, root(-0.02, -0.03, 0.30, 0, 80, -8), { L: pivot(g.L, 105, 18) }, legR([-14, 0, -80], 125, [20, 0, 0], [0, 0, 0]), { j: { spine: [0, 0, -6], chest: [0, -18, 0], neck: [12, -26, 0], head: [0, -20, 0] } });
  const rExt = merge(rCham, root(-0.02, -0.02, 0.30, 0, 88, -12), legR([-12, 0, -84], 8, [30, 0, 0], [0, 0, 0]), { j: { chest: [0, -24, 0], neck: [12, -34, 0], head: [0, -24, 0] } });
  move({ id: "roundhouse-kick", kind: "kick", band: "6-8", art: W("taekwondo, Muay Thai, karate", "taekwondo, Muay Thai, karate"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(1.15, 1, rTurn), K(1.6, 1, rCham), K(1.92, 2, rExt, { ease: "snap" }), K(2.5, 2, rExt), K(2.85, 3, rCham), K(3.4, 4, rTurn), K(3.9, 4, G), K(4.4, 4, G)],
    en: { n: "Roundhouse kick", steps: ["Start in your guard.", "Turn your standing foot out and swing your hip over. Your knee comes up to the side.", "Snap your lower leg around. Hit with the shin or the top of the foot. Breathe out.", "Fold the leg back to the knee.", "Turn back and set the foot down in your guard."],
          tips: ["Your standing heel turns toward the target. That opens your hip.", "Knee first, then the snap.", "Lean away a little, hands up. Beginners kick at belly height or lower."] },
    es: { n: "Patada circular", steps: ["Empieza en tu guardia.", "Gira hacia afuera el pie de apoyo y pasa la cadera por encima. La rodilla sube por el lado.", "Lanza en círculo la parte baja de la pierna. Golpea con la espinilla o el empeine. Exhala.", "Dobla la pierna de vuelta a la rodilla.", "Gira de vuelta y baja el pie en tu guardia."],
          tips: ["El talón de apoyo gira hacia el blanco. Eso abre la cadera.", "Primero la rodilla, luego el latigazo.", "Inclínate un poco al lado contrario, manos arriba. Los principiantes patean a la altura de la barriga o más abajo."] } });
  // side kick: sideways body, heel leads
  const sTurn = merge(G, root(0.03, -0.06, 0.20, 0, 50, 0), { L: pivot(g.L, 80, 0), R: pivot(g.R, 20, 30) }, { j: { neck: [10, -30, 0], head: [0, -26, 0] } });
  const sCham = merge(G, root(-0.02, -0.05, 0.36, 0, 88, -6), { L: pivot(g.L, 130, 0) }, legR([-95, 0, -28], 135, [-20, 0, 0], [-20, 0, 0]), { j: { neck: [10, -40, 0], head: [0, -36, 0] } });
  const sExt = merge(G, root(-0.02, -0.04, 0.38, 0, 90, -18), { L: pivot(g.L, 140, 0) }, legR([-8, 0, -84], 4, [-20, 0, 0], [-20, 0, 0]), { j: { spine: [0, 0, -10], neck: [8, -48, 6], head: [0, -36, 0] } });
  move({ id: "side-kick", kind: "kick", band: "6-8", art: W("taekwondo, karate", "taekwondo, karate"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(1.15, 1, sTurn), K(1.7, 1, sCham), K(2.05, 2, sExt, { ease: "snap" }), K(2.7, 2, sExt), K(3.05, 3, sCham), K(3.6, 4, sTurn), K(4.1, 4, G), K(4.6, 4, G)],
    en: { n: "Side kick", steps: ["Start in your guard.", "Turn sideways. Pull your knee up across your body. Look over your shoulder at the target.", "Push your leg straight out to the side. Heel first, toes a little down. Breathe out.", "Pull the knee back in.", "Set the foot down and turn back into your guard."],
          tips: ["Heel, hip and shoulder make one straight line.", "Your standing heel turns toward the target.", "Kick low to start: knee height is fine."] },
    es: { n: "Patada lateral", steps: ["Empieza en tu guardia.", "Ponte de lado. Sube la rodilla cruzando el cuerpo. Mira el blanco por encima del hombro.", "Empuja la pierna recta hacia el lado. Primero el talón, los dedos un poco abajo. Exhala.", "Regresa la rodilla.", "Baja el pie y gira de vuelta a tu guardia."],
          tips: ["Talón, cadera y hombro forman una línea recta.", "El talón de apoyo gira hacia el blanco.", "Patea bajo al empezar: a la altura de la rodilla está bien."] } });
  // back kick: look over the shoulder, thrust the heel straight back
  const bLook = merge(G, root(0.04, -0.06, 0.06, 0, -40, 0), { j: { neck: [6, -50, 0], head: [0, -40, 0] } });
  const bCham = merge(G, root(0.06, -0.06, 0.18, 16, -14, 0), { L: pivot(g.L, 0, 0) }, legR([-72, 0, 4], 128, [-10, 0, 0]), { j: { spine: [10, 0, 0], neck: [-6, -60, 0], head: [0, -45, 0] } });
  const bExt = merge(G, root(0.06, -0.09, 0.24, 36, -10, 0), { L: pivot(g.L, 0, 0) }, legR([54, 0, 2], 4, [12, 0, 0], [0, 0, 0]), { j: { spine: [8, 0, 0], neck: [-30, -60, 0], head: [-12, -45, 0] } });
  move({ id: "back-kick", kind: "kick", band: "9-12", art: W("taekwondo", "taekwondo"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(1.2, 1, bLook), K(1.8, 2, bCham), K(2.15, 3, bExt, { ease: "snap" }), K(2.8, 3, bExt), K(3.15, 4, bCham), K(3.8, 4, bLook), K(4.3, 4, G), K(4.8, 4, G)],
    en: { n: "Back kick", steps: ["Start in your guard.", "Look over your back shoulder to see behind you.", "Lift your knee in close, toes down.", "Push your heel straight back behind you. Toes point to the floor. Breathe out.", "Pull the knee in, set the foot down, and face forward."],
          tips: ["Always look before you kick back.", "Heel first, in a straight line, like a horse kicking.", "Lean forward a little to balance."] },
    es: { n: "Patada hacia atrás", steps: ["Empieza en tu guardia.", "Mira por encima del hombro de atrás para ver detrás de ti.", "Sube la rodilla cerca del cuerpo, dedos abajo.", "Empuja el talón recto hacia atrás. Los dedos apuntan al piso. Exhala.", "Regresa la rodilla, baja el pie y mira al frente."],
          tips: ["Mira siempre antes de patear hacia atrás.", "Primero el talón, en línea recta, como la patada de un caballo.", "Inclínate un poco al frente para equilibrarte."] } });
}

/* ─────────── Falls (on a mat; from low to the floor) ─────────── */
{
  const sitLegs = { L: "fk", R: "fk", j: { hipL: [-132, 0, 10], kneeL: [124, 0, 0], ankleL: [8, 0, 0], hipR: [-132, 0, -10], kneeR: [124, 0, 0], ankleR: [8, 0, 0] } };
  const sit = merge(root(0, 0, 0, -12, 0, 0), sitLegs, { j: { spine: [20, 0, 0], chest: [10, 0, 0] } }, chinTuck,
    { j: { shoulderR: [-84, 0, 6], elbowR: [-12, 0, 0], shoulderL: [-84, 0, -6], elbowL: [-12, 0, 0] } }, { ground: "body" });
  // rolled onto the round back: shoulder blades on the mat, legs up, chin tucked, head off the mat
  const roll = merge(root(0, 0, 0, -104, 0, 0), { L: "fk", R: "fk", j: { hipL: [-58, 0, 8], kneeL: [78, 0, 0], ankleL: [-10, 0, 0], hipR: [-58, 0, -8], kneeR: [78, 0, 0], ankleR: [-10, 0, 0] } },
    { j: { spine: [24, 0, 0], chest: [16, 0, 0], neck: [40, 0, 0], head: [14, 0, 0] } },
    { j: { shoulderR: [-60, 0, -36], elbowR: [-10, 0, 0], shoulderL: [-60, 0, 36], elbowL: [-10, 0, 0] } }, { ground: "body" });
  // both arms slap the mat at about 45° from the body, palms down
  const slap = merge(roll, root(0, 0, 0, -110, 0, 0), { j: { shoulderR: [-4, 0, -46], elbowR: [-4, 0, 0], wristR: [0, 0, 0], shoulderL: [-4, 0, 46], elbowL: [-4, 0, 0], wristL: [0, 0, 0] } }, { ground: "body" });
  const squat = merge(root(0, -0.42, 0.02, 0, 0, 0), { L: foot(0.14, 0.02, 10, 0), R: foot(-0.14, 0.02, -10, 0) }, { j: { spine: [30, 0, 0], chest: [10, 0, 0], shoulderR: [-80, 0, 20], elbowR: [-20, 0, 0], shoulderL: [-80, 0, -20], elbowL: [-20, 0, 0] } }, chinTuck);
  move({ id: "back-fall", kind: "fall", band: "K-2", fall: true, art: W("judo", "judo"),
    keys: [K(0, 0, sit), K(0.8, 1, sit, { j: { neck: [30, 0, 0], head: [10, 0, 0] } }), K(1.7, 2, roll), K(2.05, 2, slap, { ease: "snap" }), K(2.9, 2, slap), K(3.9, 3, sit), K(4.5, 3, sit)],
    en: { n: "Back fall (from sitting)", steps: ["Sit on the mat. Knees bent, arms out in front.", "Tuck your chin to your chest. Look at your belt.", "Roll back on your round back. Slap the mat with both arms, palms down. Breathe out.", "Roll back up to sitting."],
          tips: ["Your head never touches the mat. Keep looking at your belt.", "Arms hit at the same time, a little away from your body.", "Start from sitting. Practise many times before trying from a squat."] },
    es: { n: "Caída hacia atrás (desde sentado)", steps: ["Siéntate en la colchoneta. Rodillas dobladas, brazos al frente.", "Pega la barbilla al pecho. Mira tu cinturón.", "Rueda hacia atrás sobre tu espalda redonda. Golpea la colchoneta con los dos brazos, palmas abajo. Exhala.", "Rueda de vuelta hasta quedar sentado."],
          tips: ["Tu cabeza nunca toca la colchoneta. Sigue mirando tu cinturón.", "Los brazos golpean a la vez, un poco separados del cuerpo.", "Empieza sentado. Practica muchas veces antes de intentarlo desde cuclillas."] } });
  // side fall: from a low squat, one leg slides across, sit to that side, roll onto the side, slap with that arm
  const sq = merge(squat, { j: { shoulderR: [-70, 0, 10], elbowR: [-20, 0, 0] } });
  const reach = merge(root(-0.04, -0.46, 0.02, 0, 0, 8), { L: foot(0.14, 0.02, 10, 0), R: "fk" }, { j: { hipR: [-70, 0, 22], kneeR: [20, 0, 0], ankleR: [-10, 0, 0], spine: [24, 0, 0], chest: [8, 0, 0], shoulderR: [-90, 0, 36], elbowR: [-10, 0, 0], shoulderL: [-60, 0, -20], elbowL: [-40, 0, 0] } }, chinTuck);
  // lying on the side: rolled onto the hip and the back of that shoulder, chin tucked, head held off the mat,
  // the falling-side arm flat on the mat about 40° from the body, the other hand by the belt, the top knee up
  const side = merge(root(0, 0, 0, -96, 0, 40), { L: "fk", R: "fk" },
    { j: { hipL: [-78, 0, 16], kneeL: [92, 0, 0], ankleL: [-8, 0, 0], hipR: [-46, 0, -4], kneeR: [26, 0, 0], ankleR: [-8, 0, 0],
           spine: [18, 0, -4], chest: [12, 0, -4], neck: [34, 0, -20], head: [10, 0, -8],
           shoulderR: [-6, 0, -42], elbowR: [-4, 0, 0], wristR: [0, 0, 0], shoulderL: [-42, 0, -18], elbowL: [-96, 0, 0] } }, { ground: "body" });
  // sitting on the mat on the falling side, close to the heel, leaning back a little, that arm ready across the body
  const sitSide = merge(root(0, 0, 0, -22, 0, 18), { L: "fk", R: "fk" },
    { j: { hipL: [-100, 0, 12], kneeL: [136, 0, 0], ankleL: [-6, 0, 0], hipR: [-78, 0, -8], kneeR: [22, 0, 0], ankleR: [-8, 0, 0],
           spine: [22, 0, -4], chest: [10, 0, 0], neck: [26, 0, -10], head: [6, 0, 0],
           shoulderR: [-72, 0, 34], elbowR: [-14, 0, 0], shoulderL: [-58, 0, -16], elbowL: [-40, 0, 0] } }, { ground: "body" });
  move({ id: "side-fall", kind: "fall", band: "3-5", fall: true, art: W("judo", "judo"),
    keys: [K(0, 0, sq), K(0.9, 1, reach), K(1.8, 2, sitSide), K(2.4, 3, side, { ease: "snap" }), K(3.2, 3, side), K(4.2, 4, sitSide), K(4.8, 4, sitSide)],
    en: { n: "Side fall", steps: ["Squat low on the mat, arm out in front.", "Slide one leg across in front of you.", "Sit down onto that side, close to your heel.", "Roll onto your side. Slap the mat with that arm, palm down. Chin tucked. Breathe out.", "Sit back up."],
          tips: ["Start very low, close to the mat.", "Your head stays up off the mat.", "The arm slaps at about the angle of a clock's hands at four o'clock."] },
    es: { n: "Caída lateral", steps: ["Ponte en cuclillas sobre la colchoneta, brazo al frente.", "Desliza una pierna cruzando frente a ti.", "Siéntate hacia ese lado, cerca de tu talón.", "Rueda sobre tu costado. Golpea la colchoneta con ese brazo, palma abajo. Barbilla pegada. Exhala.", "Siéntate otra vez."],
          tips: ["Empieza muy bajo, cerca de la colchoneta.", "Tu cabeza se queda arriba, sin tocar la colchoneta.", "El brazo golpea un poco separado del cuerpo."] } });
}

/* ─────────── Styles from many arts ─────────── */
{
  const G = GUARD();
  const down = merge(root(0, 0, -0.6, 72, -10, 0), { L: "fk", R: "fk" },
    { j: { hipL: [12, 0, 18], kneeL: [10, 0, 0], ankleL: [50, 0, 0], toeL: [-60, 0, 0], hipR: [12, 0, -18], kneeR: [10, 0, 0], ankleR: [50, 0, 0], toeR: [-60, 0, 0],
           spine: [-22, 0, 0], chest: [-14, 0, 0], neck: [-30, 0, 0], head: [-10, 0, 0],
           shoulderR: [-60, 0, 8], elbowR: [-30, 0, 0], shoulderL: [-60, 0, -8], elbowL: [-30, 0, 0] } }, { ground: "body" });
  const half = merge(root(0, -0.28, -0.12, 30, -18, 0), { L: foot(0.10, 0.20, -8, 0), R: foot(-0.18, -0.50, -42, 50) },
    { j: { spine: [10, 0, 0], shoulderR: [-70, 0, 10], elbowR: [-40, 0, 0], shoulderL: [-70, 0, -10], elbowL: [-40, 0, 0] } });
  move({ id: "sprawl", kind: "style", band: "9-12", fall: true, art: W("wrestling", "lucha"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(1.05, 1, half), K(1.5, 1, down, { ease: "snap" }), K(2.4, 1, down), K(3.1, 2, half), K(3.8, 2, G), K(4.3, 2, G)],
    en: { n: "Sprawl", steps: ["Start in your guard.", "Drop your hands to the mat and shoot both legs back. Hips press down to the floor. Head and chest up.", "Bring your feet back under you and pop up into your guard."],
          tips: ["Land on the balls of your feet, legs wide.", "Your hips go heavy, toward the mat.", "Practise on a mat. Start slow."] },
    es: { n: "Sprawl", steps: ["Empieza en tu guardia.", "Baja las manos a la colchoneta y lanza las dos piernas atrás. La cadera presiona hacia el piso. Cabeza y pecho arriba.", "Trae los pies debajo de ti y levántate en tu guardia."],
          tips: ["Cae sobre las puntas de los pies, piernas abiertas.", "Tu cadera se pone pesada, hacia la colchoneta.", "Practica sobre una colchoneta. Empieza despacio."] } });
}
{
  // ginga: the rocking base of capoeira
  const base = (dx) => merge(root(0, -0.20, 0.02, 0, 0, 0), { L: foot(0.33, 0.06, 10), R: foot(-0.33, 0.06, -10) },
    { j: { spine: [14, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-60, 0, 0], shoulderL: [-30, 0, 20], elbowL: [-60, 0, 0] } });
  // the arm on the back-foot side comes up, the forearm across in front of the face; the other hand stays low and loose
  const shield = { to: [-0.01, 1.33, 0.40], pole: [-0.5, 0.95, 0.32], twist: 0 };
  const backR = merge(root(0.06, -0.22, -0.14, 0, -18, 0), { L: foot(0.33, 0.06, 10), R: foot(-0.08, -0.46, -20, 40) },
    { j: { spine: [22, 0, 0], chest: [0, -6, 0], shoulderL: [-20, 0, 30], elbowL: [-50, 0, 0], neck: [-8, 10, 0] }, arm: { R: shield } });
  const backL = merge(root(-0.06, -0.22, -0.14, 0, 18, 0), { R: foot(-0.33, 0.06, -10), L: foot(0.08, -0.46, 20, 40) },
    { j: { spine: [22, 0, 0], chest: [0, 6, 0], shoulderR: [-20, 0, -30], elbowR: [-50, 0, 0], neck: [-8, -10, 0] }, arm: { L: ikL(shield) } });
  move({ id: "ginga", kind: "style", band: "3-5", art: W("capoeira", "capoeira"),
    keys: [K(0, 0, base()), K(0.7, 0, base()), K(1.6, 1, backR), K(2.1, 1, backR), K(3.0, 2, base()), K(3.9, 3, backL), K(4.4, 3, backL), K(5.3, 4, base()), K(5.8, 4, base())],
    en: { n: "Ginga", steps: ["Stand with your feet wide, knees bent, hands loose in front.", "Step one foot back on a slant. The same arm comes up across your face.", "Bring the foot back beside the other, wide again.", "Now step the other foot back. That arm comes across your face.", "Back to wide. Keep rocking: one, two, three."],
          tips: ["Never stand still. The ginga is always moving, like a dance.", "The back foot stands on its ball.", "The arm in front of your face is your shield."] },
    es: { n: "Ginga", steps: ["Párate con los pies abiertos, rodillas dobladas, manos sueltas al frente.", "Lleva un pie atrás en diagonal. El brazo del mismo lado sube frente a tu cara.", "Regresa el pie junto al otro, abierto otra vez.", "Ahora lleva el otro pie atrás. Ese brazo cruza frente a tu cara.", "De vuelta abierto. Sigue meciéndote: uno, dos, tres."],
          tips: ["Nunca te quedes quieto. La ginga siempre se mueve, como un baile.", "El pie de atrás se apoya en la punta.", "El brazo frente a tu cara es tu escudo."] } });
}
{
  // fencing: the right foot leads; feet at a right angle; side-on body
  const eg = merge(root(-0.02, -0.15, 0.0, 0, 62, 0), { R: foot(-0.03, 0.34, 0), L: foot(0.02, -0.24, 88) },
    { j: { chest: [0, 14, 0], neck: [0, -40, 0], head: [0, -34, 0] }, grip: { R: 0.6, L: 0.3 },
      arm: { R: { to: [-0.14, 1.12, 0.52], pole: [-0.3, 0.75, 0.25], twist: 0 }, L: { to: [0.06, 1.62, -0.36], pole: [0.1, 1.32, -0.75], twist: 0 } } });
  const ready0 = merge(root(0, 0, 0, 0, 62, 0), { R: foot(-0.03, 0.10, 0), L: foot(0.02, -0.08, 88) },
    { j: { neck: [0, -40, 0], head: [0, -34, 0], shoulderL: [6, 0, 6] }, grip: { R: 0.6, L: 0.3 }, arm: { R: { to: [-0.16, 0.92, 0.42], pole: [-0.3, 0.9, -0.1], twist: 0 } } });
  move({ id: "en-garde", kind: "style", band: "6-8", art: W("fencing", "esgrima"),
    keys: [K(0, 0, ready0), K(0.8, 0, ready0), K(1.7, 1, merge(ready0, { R: foot(-0.03, 0.34, 0) }, root(-0.02, -0.04, 0.10, 0, 62, 0))), K(2.6, 2, eg), K(3.4, 3, eg, { j: { wristR: [-14, 0, 0] } }), K(3.9, 3, eg)],
    en: { n: "En garde", steps: ["Stand sideways. Front foot points forward, back foot points to the side. Heels on one line.", "Step the front foot forward about two foot lengths.", "Bend both knees. Raise your front hand to chest height, elbow bent. Lift your back arm up and behind.", "Stay balanced in the middle, ready to move."],
          tips: ["Your knees point the same way as your toes.", "Keep your back straight and your shoulders low.", "Weight in the middle, not on one leg."] },
    es: { n: "En garde", steps: ["Párate de lado. El pie de adelante apunta al frente, el de atrás hacia el lado. Talones en una línea.", "Adelanta el pie de adelante como dos largos de pie.", "Dobla las dos rodillas. Sube la mano de adelante a la altura del pecho, codo doblado. Sube el brazo de atrás arriba y atrás.", "Quédate equilibrado en el centro, listo para moverte."],
          tips: ["Las rodillas apuntan hacia donde apuntan los dedos.", "Espalda recta y hombros bajos.", "El peso en el centro, no en una pierna."] } });
  const armOut = merge(eg, { arm: { R: { to: [-0.10, 1.30, 1.25], pole: [-0.4, 0.9, 0.3], twist: 0 } } });
  const kick = merge(armOut, root(-0.02, -0.12, 0.18, 0, 62, 0), { R: "fk", j: { hipR: [-60, 0, 0], kneeR: [40, 0, 0], ankleR: [-20, 0, 0] } }, { arm: { L: { to: [0.05, 1.2, -0.55], pole: [0.2, 1.3, -0.3], twist: 0 }, R: { to: [-0.10, 1.30, 1.45], pole: [-0.4, 0.9, 0.3], twist: 0 } } });
  const lunge = merge(armOut, root(-0.02, -0.30, 0.42, 0, 62, 0), { R: foot(-0.04, 1.02, 0), L: foot(0.02, -0.24, 88) },
    { j: { spine: [6, 0, 0] }, arm: { L: { to: [0.06, 0.72, -0.95], pole: [0.3, 1.0, -0.2], twist: 0 }, R: { to: [-0.10, 1.25, 1.8], pole: [-0.4, 0.9, 0.6], twist: 0 } } });
  move({ id: "lunge", kind: "style", band: "6-8", art: W("fencing", "esgrima"),
    keys: [K(0, 0, eg), K(0.6, 0, eg), K(1.05, 1, armOut, { ease: "snap" }), K(1.4, 2, kick), K(1.75, 2, lunge, { ease: "snap" }), K(2.5, 2, lunge), K(3.4, 3, eg), K(3.9, 3, eg)],
    en: { n: "Lunge", steps: ["Start in en garde.", "Straighten your front arm first. Point it forward.", "Lift the front toes and reach the front foot forward. Push hard off the back leg until it is straight. Land heel first. Breathe out.", "Push back off the front foot to en garde."],
          tips: ["Arm first, then the legs.", "Your front knee stops over your ankle, not past your toes.", "Your back arm drops behind you to balance."] },
    es: { n: "Fondo", steps: ["Empieza en en garde.", "Estira primero el brazo de adelante. Apunta al frente.", "Levanta los dedos de adelante y estira el pie de adelante al frente. Empuja fuerte con la pierna de atrás hasta estirarla. Cae primero con el talón. Exhala.", "Empuja con el pie de adelante para volver a en garde."],
          tips: ["Primero el brazo, luego las piernas.", "La rodilla de adelante se detiene sobre el tobillo, no pasa los dedos.", "El brazo de atrás baja atrás para equilibrarte."] } });
}

/* ─────────── Combinations and form ─────────── */
{
  const G = GUARD(), g = ST.guard();
  const jabOut = merge(G, root(0.01, -0.06, 0.03, 0, -36, 0), { j: { clavL: [0, 0, 8], neck: [14, 0, 0] }, arm: { L: { to: [0.02, 1.40, 0.80], pole: [0.5, 0.9, 0.1], twist: 0 } } });
  const crossOut = merge(G, root(0.01, -0.07, 0.05, 0, 4, 0), { R: pivot(g.R, -8, 32) }, torso(10), { j: { clavR: [0, 0, -6], neck: [14, -6, 0] }, arm: { R: { to: [-0.01, 1.40, 0.86], pole: [-0.5, 0.9, 0.1], twist: 0 } } });
  move({ id: "combo-jab-cross", kind: "combo", band: "6-8", art: W("boxing", "boxeo"),
    keys: [K(0, 0, G), K(0.6, 0, G), K(0.82, 1, jabOut, { ease: "snap" }), K(1.15, 1, jabOut), K(1.45, 2, G), K(1.75, 3, crossOut, { ease: "snap" }), K(2.2, 3, crossOut), K(2.6, 4, G), K(3.2, 4, G)],
    en: { n: "Jab, cross", steps: ["Start in your guard.", "Jab: the front hand snaps straight out.", "Bring it back to your face.", "Cross: turn your back foot and hip, the back hand goes straight out. Breathe out on each punch.", "Back to your guard."],
          tips: ["One hand goes out as the other comes home.", "Say it as you go: one, two.", "Smooth first. Speed comes later."] },
    es: { n: "Jab y directo", steps: ["Empieza en tu guardia.", "Jab: la mano de adelante sale recta.", "Regrésala a tu cara.", "Directo: gira el pie y la cadera de atrás, la mano de atrás sale recta. Exhala en cada golpe.", "De vuelta a tu guardia."],
          tips: ["Una mano sale mientras la otra regresa.", "Dilo al hacerlo: uno, dos.", "Primero suave. La rapidez llega después."] } });
  const S0 = ST.front(0);
  const ready = merge(S0, root(0, -0.15, 0.05, 0, -25, 0), arms("fistBelt", "fistBelt"));
  const set = merge(S0, root(0, -0.15, 0.05, 0, -30, 0), { j: Object.assign({}, AR.reach) }, { arm: { L: ikL(ikDrop(IK.lowSet, -0.15)) } });
  const blk = merge(S0, root(0, -0.15, 0.05, 0, -32, 0), { j: Object.assign({}, AR.hip) }, { arm: { L: ikL(ikDrop(IK.lowFS, -0.15)) } });
  const pun = merge(S0, root(0, -0.16, 0.07, 0, 0, 0), arms("punch", "hip"));
  move({ id: "combo-block-punch", kind: "combo", band: "6-8", art: W("karate", "karate"),
    keys: [K(0, 0, ready), K(0.6, 0, ready), K(1.3, 1, set), K(1.7, 1, blk, { ease: "snap" }), K(2.3, 1, blk), K(2.7, 2, pun, { ease: "snap" }), K(3.4, 2, pun), K(4.2, 3, ready), K(4.7, 3, ready)],
    en: { n: "Block and punch", steps: ["Front stance, fists ready.", "Downward block with the front arm. The back fist goes to your hip.", "Reverse punch with the back hand. Hips turn forward. Breathe out.", "Go back to ready and repeat."],
          tips: ["Block, then punch: two counts, never one blur.", "Each hand pulls back as the other goes out.", "Feet stay planted the whole time."] },
    es: { n: "Bloqueo y puño", steps: ["Postura adelantada, puños listos.", "Bloqueo bajo con el brazo de adelante. El puño de atrás va a la cadera.", "Puño invertido con la mano de atrás. La cadera gira al frente. Exhala.", "Vuelve a listo y repite."],
          tips: ["Bloquea y luego golpea: dos tiempos, nunca uno.", "Cada mano regresa mientras la otra sale.", "Los pies se quedan firmes todo el tiempo."] } });
}
{
  /* form-1 — THE MEASURED STEP FORM: an original 8-move form made for this site (not a traditional kata).
     Along one line forward and back: low block, reverse punch, rising block, reverse punch, back stance outside block,
     cat stance palm strike, horse stance knife hand, close to ready. */
  const r0 = merge(ST.ready(), arms("fistBelt"));
  const L1 = foot(0.12, 0.80, 0), R1 = foot(-0.14, 0.0, -28);
  const s1 = (j, ry) => merge(root(0, -0.15, 0.44, 0, ry || 0, 0), { L: L1, R: R1 }, { j });
  const R3 = foot(-0.12, 1.62, 0), L3 = foot(0.13, 0.80, 28);
  const s3 = (j, ry) => merge(root(0, -0.15, 1.27, 0, ry || 0, 0), { L: L3, R: R3 }, { j });
  const midStep = merge(root(0, -0.15, 0.80), { L: foot(0.12, 0.80, 0), R: foot(-0.04, 0.78, -6) }, arms("fistBelt"));
  const R5 = foot(-0.02, 0.62, -82), L5 = foot(0.04, 1.28, 0);
  const back5 = (j) => merge(root(0.0, -0.21, 0.82, 0, -50, 0), { L: L5, R: R5 }, { j });
  const L6 = foot(0.05, 1.02, 0, 50), R6 = foot(-0.04, 0.70, -35);
  const cat6 = (j) => merge(root(0.0, -0.21, 0.78, 0, -25, 0), { L: L6, R: R6 }, { j });
  const H7a = merge(root(0.12, -0.12, 0.84, 0, 0, 0), { L: foot(0.38, 0.80, 6), R: foot(-0.04, 0.70, -20) });
  const H7 = (j) => merge(root(0.02, -0.24, 0.80, 0, 0, 0), { L: foot(0.38, 0.80, 6), R: foot(-0.34, 0.80, -6) }, { j });
  const end8a = merge(root(-0.08, -0.06, 0.80), { L: foot(0.15, 0.80, 9), R: foot(-0.34, 0.80, -6) }, arms("fistBelt"));
  const end8 = merge(root(0, -0.015, 0.80), { L: foot(0.15, 0.80, 9), R: foot(-0.15, 0.80, -9) }, arms("fistBelt"));
  const J = (r, l) => Object.assign({}, AR[r], Lside(AR[l]));
  move({ id: "form-1", kind: "combo", band: "9-12", art: W("an original form made for this site", "una forma original hecha para este sitio"),
    keys: [
      K(0, 0, r0), K(0.8, 0, r0),
      K(1.5, 1, s1(J("reach", "lowStart"), -10), { arm: { L: ikL(ikDrop(IK.lowSet, -0.15)) } }), K(2.0, 1, s1(J("hip", "low"), -30), { ease: "snap", arm: { L: ikL(ikDrop(IK.lowFS, -0.15)) } }), K(2.6, 1, s1(J("hip", "low"), -30), { arm: { L: ikL(ikDrop(IK.lowFS, -0.15)) } }),
      K(3.1, 2, s1(J("punch", "hip"), 0), { ease: "snap" }), K(3.8, 2, s1(J("punch", "hip"), 0)),
      K(4.5, 3, midStep), K(5.2, 3, s3(J("riseStart", "reach"), 10)), K(5.6, 3, s3(J("rise", "hip"), 25), { ease: "snap", arm: { R: ikDrop(IK.rise, -0.15) } }), K(6.2, 3, s3(J("rise", "hip"), 25), { arm: { R: ikDrop(IK.rise, -0.15) } }),
      K(6.7, 4, s3(Object.assign({}, AR.hip, Lside(AR.punch)), 0), { ease: "snap" }), K(7.4, 4, s3(Object.assign({}, AR.hip, Lside(AR.punch)), 0)),
      K(8.4, 5, back5(J("guard", "outStart")), { arm: { L: ikL(ikDrop(IK.outSet, -0.21)) } }), K(8.8, 5, back5(J("hip", "outside")), { ease: "snap", arm: { L: ikL(ikDrop(IK.outside, -0.21)) } }), K(9.4, 5, back5(J("hip", "outside")), { arm: { L: ikL(ikDrop(IK.outside, -0.21)) } }),
      K(10.2, 6, cat6(J("palmStart", "guardLead"))), K(10.6, 6, cat6(J("palm", "guardLead")), { ease: "snap" }), K(11.2, 6, cat6(J("palm", "guardLead"))),
      K(11.9, 7, merge(H7a, arms("hip"))), K(12.6, 7, H7(J("hip", "knifeStart"))), K(13.0, 7, H7(J("hip", "knife")), { ease: "snap" }, look(40)), K(13.7, 7, H7(J("hip", "knife")), look(40)),
      K(14.4, 8, end8a), K(15.1, 8, end8), K(15.9, 8, end8, { j: { chest: [-3, 0, 0] } }), K(16.4, 8, end8)
    ],
    en: { n: "The Measured Step form", steps: [
            "Begin in your ready stance. Breathe in.",
            "Move 1: Step the front foot forward into a front stance. Downward block.",
            "Move 2: Reverse punch with the back hand. Breathe out.",
            "Move 3: Step forward into a front stance on the other side. Rising block.",
            "Move 4: Reverse punch with the other hand. Breathe out.",
            "Move 5: Step back into a back stance. Outside block.",
            "Move 6: Draw the front foot in to a cat stance. Palm strike.",
            "Move 7: Open into a horse stance. Knife-hand strike to the side.",
            "Move 8: Bring your feet in to ready. Breathe out slowly. Stand still for a moment."],
          tips: ["Each move ends in a clear, still shape before the next one.", "Measured means even: the same calm speed for every step.", "Learn the moves on their own first, then join them."] },
    es: { n: "La forma del Paso Medido", steps: [
            "Empieza en tu posición de listo. Inhala.",
            "Movimiento 1: Da un paso al frente en postura adelantada. Bloqueo bajo.",
            "Movimiento 2: Puño invertido con la mano de atrás. Exhala.",
            "Movimiento 3: Da un paso al frente en postura adelantada del otro lado. Bloqueo alto.",
            "Movimiento 4: Puño invertido con la otra mano. Exhala.",
            "Movimiento 5: Da un paso atrás en postura atrasada. Bloqueo hacia afuera.",
            "Movimiento 6: Recoge el pie de adelante en postura del gato. Golpe de palma.",
            "Movimiento 7: Ábrete en postura del jinete. Golpe de mano de cuchillo hacia el lado.",
            "Movimiento 8: Junta los pies en listo. Exhala despacio. Quédate quieto un momento."],
          tips: ["Cada movimiento termina en una forma clara y quieta antes del siguiente.", "Medido quiere decir parejo: la misma velocidad tranquila en cada paso.", "Aprende primero cada movimiento solo, luego únelos."] } });
}

/* ══ the groups the picker shows, in order ══ */
const KINDS = [
  { k: "stance", en: "Stances", es: "Posturas" },
  { k: "footwork", en: "Footwork", es: "Juego de pies" },
  { k: "hand", en: "Hand strikes", es: "Golpes de mano" },
  { k: "block", en: "Blocks", es: "Bloqueos" },
  { k: "kick", en: "Kicks", es: "Patadas" },
  { k: "fall", en: "Falls", es: "Caídas" },
  { k: "style", en: "Styles from many arts", es: "Estilos de muchas artes" },
  { k: "combo", en: "Combinations and form", es: "Combinaciones y forma" }
];
const BANDS = { "K-2": "K–2", "3-5": "3–5", "6-8": "6–8", "9-12": "9–12" };
const ORDER = ["ready", "horse", "front-stance", "back-stance", "cat-stance", "guard", "step-forward", "step-back", "shuffle", "pivot",
  "jab", "cross", "hook", "uppercut", "reverse-punch", "palm-strike", "knife-hand", "high-block", "low-block", "inside-block", "outside-block",
  "knee-raise", "front-kick", "teep", "roundhouse-kick", "side-kick", "back-kick", "back-fall", "side-fall", "sprawl", "ginga", "en-garde", "lunge",
  "combo-jab-cross", "combo-block-punch", "form-1"];
M.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
M.forEach(m => { m.dur = m.keys[m.keys.length - 1].t; });

window.AOGDojoMoves = { MOVES: M, KINDS, BANDS, ORDER, mirrorKey, SAFE: { kick: SAFE_KICK, strike: SAFE_STRIKE, fall: SAFE_FALL } };
})();
