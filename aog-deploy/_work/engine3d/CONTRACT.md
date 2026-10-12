# The 3D engine build — shared contract (2026-10-12)

Jimmy: "I want more realism, not sharp straight lines. … Hit the ceiling … In the martial arts curriculum books,
instructions on how to learn moves with this engine showing the person the moves!!! Assign agents."
Earlier: "three.js 3d engine … we are the 1%" and "this has to be silent when not being used … lighting fast".

Read `/home/user/architecture-of-grace/CLAUDE.md` first. Every standing rule there applies (calm pages, plain words in
English and Spanish, contrast and calm checks, no faces in the site's art, architectureofgrace.com, Housekeeping).

## Who owns what (never edit a file you do not own; never run git commit/stash/checkout/reset/add)

| Agent | Owns (create or edit) |
|---|---|
| FIGURE | `aog-deploy/aog-figure3d.js`, `aog-deploy/aog-3dkit.js`, `aog-deploy/vendor/three-0.160.0/addons/**`, `aog-deploy/_work/engine3d/figure-test.html`, `tools/check-figure.js` |
| SKATE | `aog-deploy/aog-skate.js`, `aog-deploy/aog-skate3d.js`, `aog-deploy/aog-skate-book.js`, `aog-deploy/skate-lab.html`, `tools/check-skate.js` |
| DOJO | `aog-deploy/dojo.html`, `aog-deploy/aog-dojo.js`, `aog-deploy/aog-dojo-moves.js`, `aog-deploy/aog-dojo3d.js`, `tools/check-dojo.js`, `aog-deploy/dojo.webmanifest` (optional) |
| MAR | `aog-deploy/_work/mar/**`, the built `aog-deploy/mar-u*.html`, `martial-arts-course.html`, `martial-arts-hub.html` (only through the course build scripts), `tools/check-mar-practice.js` (optional) |
| Lead (me) | `aog-deploy/sw.js`, `aog-deploy/_redirects`, `CLAUDE.md`, `index.html`, `aog-topbar.js`, every other shared file |

Need a change in a file you do not own (a redirect, a cache bump, a front-page door)? Put it in your final report.

## Rules for every 3D page

- three.js is `/vendor/three-0.160.0/three.module.min.js` (kept in the site, MIT). Never load anything from a CDN.
  Addons (RoomEnvironment, RoundedBoxGeometry, …) are copied by FIGURE into `/vendor/three-0.160.0/addons/` with
  their `from 'three'` imports rewritten to the relative vendor path.
- **Silent until used.** A page that is not about 3D loads no 3D until a tap. Nothing calls requestAnimationFrame
  while idle; render only when a step plays, a finger drags, the size or theme changes. A loop that runs while a
  person drives something (free skate) stops by itself once everything is at rest. Leaving 3D disposes the renderer,
  geometries, materials, textures and calls `forceContextLoss()`.
- **Calm.** Nothing moves on its own. Go plays once. Reduce motion shows the end at once. No surprise sounds.
- **Realism, no sharp straight lines** (Jimmy). Smooth, rounded, organic shapes: lathe-turned limbs with real muscle
  curves, rounded boxes, 24+ radial segments for a body on a computer (fewer on a phone), smooth normals, soft image-based
  light (PMREM of RoomEnvironment) plus a sun with soft shadows, ACES tone mapping, cloth with a subtle canvas normal
  map. No icosahedron trees, no bare boxes as people or props.
- iPhone first, then iPad, then computer. `devicePixelRatio` capped at 2; a "phone" quality level (smaller shadow map,
  fewer segments) when the short side of the screen is under 600px.
- English and Spanish for every word a person reads. Plain words: short sentences, what to do or what helps.
- No faces. A head is smooth skin with hair and ears; no eyes, mouth or nose.

## The figure (FIGURE builds it; SKATE and DOJO use it)

```js
import { makeFigure, JOINTS, REST } from "/aog-figure3d.js";
import { makeStage } from "/aog-3dkit.js";   // renderer + scene + soft light + render-on-demand + dispose
const fig = makeFigure({ outfit: "skate" | "gi" | "plain", belt: "#..." /* gi only */, colors: {...}, quality: "phone" | "full" });
scene.add(fig.root);
```

- Units are meters. `fig.root` stands on the floor (y = 0) between the feet, facing **+z**; the figure's own left is
  **+x**. Height about 1.72 m. Rest pose (`REST`): standing tall, arms relaxed at the sides, feet hip-width.
- Joints (each an Object3D in a real hierarchy):
  `pelvis, spine, chest, neck, head, clavL, shoulderL, elbowL, wristL, clavR, shoulderR, elbowR, wristR,
   hipL, kneeL, ankleL, toeL, hipR, kneeR, ankleR, toeR`.
  At rest every joint's local axes line up with the root's (x = figure's left, y = up, z = forward).
- A pose: `{ root: { pos: [x, y, z], rot: [x, y, z] }, j: { shoulderR: [x, y, z], … } }`. Angles in **degrees**,
  Euler order **XYZ** for joints and **YXZ** for the root. A joint left out stays at rest. Examples (they must hold):
  - `shoulderR: [-90, 0, 0]` raises the right arm straight forward; `shoulderL: [-90, 0, 0]` the left.
  - `shoulderR: [0, 0, -90]` raises the right arm out to the side; `shoulderL: [0, 0, 90]` the left.
  - `elbowR: [-90, 0, 0]` bends the right forearm forward and up (an elbow only bends one way).
  - `hipR: [-90, 0, 0]` lifts the right thigh forward (knee up); `kneeR: [90, 0, 0]` folds the right shin back.
  - `spine`/`chest: [10, 0, 0]` bends forward; `[0, 30, 0]` turns the upper body to its left.
  - `root.pos[1]` lowers or raises the whole figure (a deep stance sets it below its standing height).
- API:
  - `fig.setPose(pose)`; `fig.blend(a, b, u)` returns a pose (slerp per joint, lerp root); `fig.update()`.
  - `fig.ik.leg(side, ankleTargetWorld, poleWorld)` and `fig.ik.arm(side, wristTargetWorld, poleWorld)` set hip/knee or
    shoulder/elbow rotations so the ankle/wrist reaches the target (skate: feet stay on the board).
  - `fig.lookAt(worldPoint, amount)` turns neck and head toward a point; `fig.world(joint)` returns a Vector3.
  - `fig.footFloor(side)` returns the world y of that sole (for checks: feet on the floor).
  - `fig.setColors(colors)`, `fig.dispose()`.
- Outfits: `skate` (hoodie with hood and strings, baggy cargo pants stacked over skate shoes with white cupsoles,
  a helmet); `gi` (white or token-colored jacket with lapels and sleeves to the forearm, wide trousers, a belt with a
  knot and two tails, bare feet); `plain` (t-shirt, joggers, sneakers). Colors come from the page's CSS tokens.
- `aog-3dkit.js`: `makeStage({ host, before, quality, dark })` → `{ THREE, renderer, scene, camera, render(), resize(w,h),
  setDark(bool), dispose(), renders() }` with PMREM RoomEnvironment light, a sun with soft shadows, ACES, fog, and a
  floor helper. `render()` is the only thing that draws.

## The moves (DOJO builds them; MAR writes the lessons that use them) — ids are fixed

Safety, always: warm up first; a clear space; strikes and kicks go into the air, **never at a person**; kicks stay at
knee or belly height for beginners; falls only on a mat or soft grass, with a grown-up for children; stop if
something hurts; with a grown-up nearby if you are a child. Say what helps, never what is wrong with a learner.

| id | English | Español | from |
|---|---|---|---|
| ready | Ready stance | Posición de listo | many arts |
| horse | Horse stance | Postura del jinete | karate, kung fu, taekwondo |
| front-stance | Front stance | Postura adelantada | karate, taekwondo |
| back-stance | Back stance | Postura atrasada | karate, taekwondo |
| cat-stance | Cat stance | Postura del gato | karate, kung fu |
| guard | Guard (fighting stance) | Guardia | boxing, Muay Thai, kickboxing |
| step-forward | Step forward | Paso adelante | many arts |
| step-back | Step back | Paso atrás | many arts |
| shuffle | Shuffle step | Paso deslizado | boxing, taekwondo |
| pivot | Pivot turn | Giro sobre el pie | many arts |
| jab | Jab | Jab | boxing |
| cross | Cross | Directo | boxing |
| hook | Hook | Gancho | boxing |
| uppercut | Uppercut | Uppercut | boxing |
| reverse-punch | Reverse punch | Puño invertido | karate |
| palm-strike | Palm strike | Golpe de palma | kung fu, self-defense |
| knife-hand | Knife-hand strike | Golpe de mano de cuchillo | karate, taekwondo |
| high-block | Rising block | Bloqueo alto | karate, taekwondo |
| low-block | Downward block | Bloqueo bajo | karate, taekwondo |
| inside-block | Inside block | Bloqueo hacia adentro | karate, taekwondo |
| outside-block | Outside block | Bloqueo hacia afuera | karate, taekwondo |
| knee-raise | Knee raise (chamber) | Levantar la rodilla | every kicking art |
| front-kick | Front kick | Patada frontal | karate, taekwondo |
| teep | Push kick (teep) | Patada de empuje (teep) | Muay Thai |
| roundhouse-kick | Roundhouse kick | Patada circular | taekwondo, Muay Thai, karate |
| side-kick | Side kick | Patada lateral | taekwondo, karate |
| back-kick | Back kick | Patada hacia atrás | taekwondo |
| back-fall | Back fall (from sitting) | Caída hacia atrás (desde sentado) | judo |
| side-fall | Side fall | Caída lateral | judo |
| sprawl | Sprawl | Sprawl | wrestling |
| ginga | Ginga | Ginga | capoeira |
| en-garde | En garde | En garde | fencing |
| lunge | Lunge | Fondo | fencing |
| combo-jab-cross | Jab, cross | Jab y directo | boxing |
| combo-block-punch | Block and punch | Bloqueo y puño | karate |
| form-1 | The Measured Step form | La forma del Paso Medido | an original 8-move form made for this site |

Bands (what a lesson for that band may ask): K–2: ready, horse, step-forward, step-back, high-block, low-block,
knee-raise, reverse-punch (slow), back-fall (from sitting, on a mat, with a grown-up). 3–5 adds front-stance,
front-kick, jab, cross, inside-block, outside-block, side-fall, ginga. 6–8 adds back-stance, cat-stance, guard,
shuffle, roundhouse-kick, side-kick, hook, uppercut, palm-strike, knife-hand, combo-jab-cross, combo-block-punch,
en-garde, lunge. 9–12 adds pivot, teep, back-kick, sprawl, form-1.

The Dojo page: `dojo.html`, served at **/dojo** (Lead adds `_redirects`). A move opens at `/dojo#<id>`; `?side=left`
mirrors it. Lessons link to `/dojo#<id>`.

## Reporting

End with: what you built (files), how to see it, the checks you ran and their output, screenshots you looked at
(paths), anything you need from the Lead (redirects, cache, CLAUDE.md lines, front-page doors), and known limits.
