# Pencil banners: how to draw a course's unit banners

Jimmy approved the pencil-sketch style on 2026-09-27. Every unit banner is a pencil drawing of
a still life: a few real objects that stand for the unit's topic. A reader should know what
the drawing shows at a glance.

The pipeline:

```
kit/scenes/<id>-still.glsl  --kit/gbuf.js-->  normals, depth, id, tone  --pencil.py-->  drawing
```

## 1. Choose the subject

- Read the unit page's title and its chapter titles first. Then pick objects a child would
  name straight away. For example: ABC blocks and a picture book, an abacus with number
  blocks, a book on a lectern with a scroll and an oil lamp, a wagon with a ball and a magnet.
- Use one focal object and one or two supporting objects. Four objects is the most.
- Avoid wide landscapes and far-off views. They do not read in pencil at banner size.

### Faith courses: no figures

- Qur'an, Islam and Hadith units: never show Muhammad, any prophet or God, and no people at all.
  No writing on the pages: use hint-lines and an ornamental frame only.
- Bible, Hebrew Bible, Talmud and other scripture units: never show God. Draw objects, not
  people (a book, a scroll, a lamp, a tablet, a plant).
- Hindu, Buddhist and Chinese-classics units: draw objects and architecture (a lamp, a bell,
  a brush and ink stone, a scroll, a lotus, a small shrine roof). Do not draw a deity, a
  Buddha image or a sage's face. Keep writing to hint-lines, never real script.
- Never draw fake text that looks like real words or verses.

## 2. Model the scene

Copy `kit/scenes/ela-u1-still.glsl` (the simplest one) to `kit/scenes/<id>-still.glsl`. Each
scene defines:

- **Camera:** `CAM_POS`, `CAM_TGT`, `CAM_FOV` (about 30). Use `MAXT 8.`, `STEPS 220` and
  `SHADOW_MAXSTEP .02`.
- **Light:** `SUN_DIR`, the key light. Keep it upper left and a little in front, for example
  `vec3(-.7,.85,-.3)`.
- **Includes:** `#include "lib.glsl"` then `#include "studio.glsl"`. They give you the
  primitives (sdRBox, sdCylX/Y/Z, sdTorus, sdCone, sdCapsule, smin, rot, fbm) and glyphs.
- **`vec2 map(vec3 p)`:** returns (distance, material id).
  - id 1 is the table (`p.y`) and id 2 the back wall (`.9-p.z`); both are background.
  - Give every object its own id from 3 upward, so its outline gets drawn.
- **`float toneAlb(float id, vec3 p, vec3 n)`:** the grey value of each material, 0 dark to
  1 white. Paint marks here: text hint-lines, tile patterns, bands on a ball. Painted marks
  become single pencil lines.
- **Letters and numbers:** carve real grooves with
  `carve(d, uv, glyph, size, halfWidth, depthCoord, depth)`, using glyph codes 65 to 67
  (A, B, C) and 49 to 51 (1, 2, 3). Add more glyphs to `glyph()` in `studio.glsl` when you
  need them. Also darken the groove in `toneAlb` so the letter reads.
- **Build like a model maker:** bevels (sdRBox radius), real thickness, small parts
  (handles, rims, ferrules, knobs), and wear or erosion as gentle noise. Never use flat
  boxes.
- Keep all real sizes in metres (a block is about 0.1).

## 3. Frame it: the framing rule

On the page, a navy cover darkens the left and bottom of the picture (behind the title). On a
wide screen the picture is shown at `object-position: 85% 45%`. So:

- **Where:** the whole subject group sits inside **x 44% to 90%** and **y 6% to 64%** of the
  1600 x 560 frame.
- **Focal point:** the focal object's centre is near **(68%, 35%)**.
- **How big:** the group is **50% to 60% of the frame height** and about **40% to 50% of its
  width**. The focal object alone is 35% to 55% of the frame height.
- **Keep clear:** the left 40% is only table, wall and paper. The bottom 35% is only table and
  cast shadow.
- **Composition:** use a table line (horizon) at about 25% to 40% from the top, with
  overlapping objects for depth. Cast shadows fall to the right, away from the light.
- **Fit it automatically:** run `python3 pencil/frame.py <id>`. It moves the camera
  (dolly and pan only, never a new angle) until the objects' box meets this rule. It prints
  the box after each pass.
- **Check it:** make a quick tone preview:

      node kit/gbuf.js <id>-still OUTDIR 800 280

  Look at `OUTDIR/<id>-still-photo.png` against the rule before you run the pencil pass.

## 4. Params (`pencil/params2.json`)

Add an entry for your unit id. Copy the entry for `ela-u1` and change:

- `scene`: `"<id>-still"`
- `mat`: one entry per id, `{"id": [value, contrast, style, form]}`.
  - value: the median tone (0 dark, 1 paper).
  - contrast: how much of the render's light and shadow to keep (1 to 1.5 for objects).
  - style: null for objects.
  - form: 0.5 to 1.0 shades each face by the key light.
  - Use `"1": [0.99, 0.8]` for the table and `"2": [0.97, 0.3]` for the wall, so they stay
    bare paper.
- `bg`: `[0, 1, 2]`. These are hatched loosely in screen space, not along the form.
- `texlines`: `{"id": [lo, hi, strength]}` for materials with painted or carved marks.
  Typical values are `[0.12, 0.4, 0.8]`. Keep `"ridge": true`.
- `focus`: `[0.7, 0.35, 0.4, 0.9]`, where the drawing is fullest. Keep it at the focal
  point.
- Keep `"slice": true`. Slice hatching draws hatch lines as parallel planes cutting the
  surface, so the lines wrap round each form.

## 5. Render and export

From `aog-deploy/_work/art`:

    node kit/gbuf.js <id>-still OUT                     # 1600x560: -n, -d, -photo, -t pngs
    for f in n d photo t; do mv OUT/<id>-still-$f.png OUT/<id>-$f.png; done
    python3 pencil/pencil.py <id> --gbuf OUT --out OUT --params pencil/params2.json          # proof
    python3 pencil/pencil.py <id> --gbuf OUT --out OUT --params pencil/params2.json --final  # export

`--final` writes these files. Each is 1600x560 (900 wide for the small ones), and the 1600
file is kept under 250 KB:

    img/banners/<id>-pencil-1600.webp
    img/banners/<id>-pencil-900.webp
    img/banners/<id>-pencil-900.jpg

Look at the proof PNG at full size, and again with a zoomed crop. Fix what reads poorly.
Common fixes:

- An object too light or too dark: change its `mat` value.
- A flat face: raise its form value.
- A letter too faint: darken the groove in `toneAlb` or raise its `texlines` strength.

## 6. Alt text

Add `"pencil_alt"` to the unit's entry in `_work/art/banners.json`. Describe the drawing
plainly, starting with "A pencil drawing of", for example:

    "ela-u1": {"alt": "...", "pencil_alt": "A pencil drawing of three wooden alphabet blocks carved A, B and C ..."}

The credit line under the banner becomes "Pencil drawing, not a photograph: <the rest>".

## 7. Wiring (the lead runs this last, never during a course build)

    python3 _work/art/apply_banners.py --style pencil                 # every course
    python3 _work/art/apply_banners.py --style pencil --only hin      # one course prefix
    python3 _work/art/apply_banners.py --style pencil --root /copy    # test on a copy

The script swaps the unit page's banner and its contents-page banner, and adds the navy
cover. It then needs `node tools/check-contrast.js` and `node tools/check-calm.js` on the
changed pages, and a bump of `const CACHE` in `sw.js`.
