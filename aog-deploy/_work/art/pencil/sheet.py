#!/usr/bin/env python3
"""Sheet-style pencil drawings for the front page's doors (AOG-SHEET-V1, 2026-10-09).

Jimmy wanted every door to look like his "The Music Rooms" sheet: the objects alone on
cream paper, crisp outlines, fine cross-hatching, a small hatched shadow under them.

    node kit/gbuf.js <scene> OUT 4800 1680            # the buffers, at 3x
    python3 pencil/sheet.py <scene> OUT <name>         # -> img/banners/<name>-pencil-*

Inputs from gbuf.js: -n (view normals), -d (g = material id, b = sun x shadow),
-photo (lit tone with painted marks), -t (16-bit depth). Ids 1 and 2 (table, wall) are
background: they become bare paper, except for the cast shadow next to the objects.
The drawing is placed as the music rooms' banners are: about 84% of the height, at most
46% of the width, centred 60% across, on paper #F6F2E8.
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
BAN = os.path.abspath(os.path.join(HERE, "..", "..", "..", "img", "banners"))
PAPER = np.array([0xF6, 0xF2, 0xE8], np.float32)
W, H = 1600, 560


def rd(path, mode):
    return np.asarray(Image.open(path).convert(mode), np.float32) / 255.


def blur(a, s):
    return nd.gaussian_filter(a, s, mode="nearest")


def hatch(shape, ang, period, rng, warp=None, width=.34):
    """Fine parallel strokes: 1 on a line, 0 between. Broken a little, like a pencil."""
    h, w = shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    ph = (x * np.cos(ang) + y * np.sin(ang)) / period
    if warp is not None:
        ph = ph + warp
    ph = ph + .35 * blur(rng.standard_normal(shape).astype(np.float32), period * 3) * 3
    d = np.abs(ph - np.round(ph))                       # 0 on the line, .5 between
    line = np.clip((width - d) / .12, 0, 1)
    breaks = blur(rng.standard_normal(shape).astype(np.float32), period * 1.5)
    breaks = np.clip(.8 + breaks * 4, 0, 1)            # gaps along the strokes
    return line * breaks


def draw(gdir, scene, seed=3):
    rng = np.random.default_rng(seed)
    p = lambda s: os.path.join(gdir, scene + s + ".png")
    nrm = rd(p("-n"), "RGB") * 2 - 1
    d = rd(p("-d"), "RGB")
    ids = np.rint(d[..., 1] * 255).astype(np.int32)
    sun = d[..., 2]
    tone = rd(p("-photo"), "L")
    t16 = np.asarray(Image.open(p("-t")).convert("RGB"), np.float32)
    depth = (t16[..., 0] + t16[..., 1] / 255.) / 255.

    obj = ids >= 3
    ys, xs = np.nonzero(obj)
    # Work on the objects plus a margin for the cast shadow.
    m = int(.08 * (ys.max() - ys.min()))
    y0, y1 = max(0, ys.min() - m), min(obj.shape[0], ys.max() + 2 * m)
    x0, x1 = max(0, xs.min() - m), min(obj.shape[1], xs.max() + 3 * m)
    sl = (slice(y0, y1), slice(x0, x1))
    nrm, ids, sun, tone, depth, obj = nrm[sl], ids[sl], sun[sl], tone[sl], depth[sl], obj[sl]
    shape = obj.shape
    s = max(1., shape[0] / 600.)                       # stroke scale: ~600 px tall objects

    # ---- outlines: silhouettes heavy, inner creases light
    idb = np.zeros(shape, bool)
    for dy, dx in ((0, 1), (1, 0), (1, 1), (1, -1)):
        a, b = ids, np.roll(np.roll(ids, dy, 0), dx, 1)
        idb |= (a != b) & ((a >= 3) | (b >= 3))
    gz = np.hypot(*np.gradient(depth))
    crease = np.zeros(shape, np.float32)
    for k in range(3):
        gy, gx = np.gradient(nrm[..., k])
        crease += gy * gy + gx * gx
    crease = np.sqrt(crease) * obj
    sil = nd.binary_dilation(idb, iterations=max(1, int(1.3 * s))).astype(np.float32)
    jump = (gz > .004 / s) & obj
    inner = np.clip((crease - .18) / .25, 0, 1) * obj
    inner = np.maximum(inner, nd.binary_dilation(jump, iterations=max(1, int(.6 * s))))
    line = np.maximum(blur(sil, .45 * s) * 1.1, blur(inner.astype(np.float32), .6 * s) * .7)
    line = np.clip(line, 0, 1)
    # Pressure: lighter in the light, a little broken.
    wob = blur(rng.standard_normal(shape).astype(np.float32), 6 * s)
    line *= np.clip(.85 + 1.5 * wob, .55, 1.)

    # ---- shading on the objects: soft graphite plus hatching that follows the form
    # Light and shadow from the clean sun channel; each material's own shade from the
    # render, blurred hard, because the models' painted noise reads as blotches.
    t = np.clip(tone, 0, 1)
    v = .5 * blur(t, 5 * s) + .5 * (.3 + .7 * blur(sun, .8 * s))
    # Painted marks (letters, ruled lines, bands) come back as crisp pencil lines.
    marks = np.clip((blur(t, 4 * s) - blur(t, .5 * s) - .07) / .12, 0, 1) * obj
    # Stretch the objects' own range: the lit tops go to paper, the undersides to graphite.
    lo, hi = np.percentile(v[obj], 4), np.percentile(v[obj], 93)
    dark = np.clip((hi + .04 - v) / (hi - lo + .06), 0, 1) ** 1.1   # 0 = paper, 1 = graphite
    warp = 1.4 * nrm[..., 0] * 6 + 1.0 * nrm[..., 1] * 6   # strokes bend round curved forms
    h1 = hatch(shape, np.radians(-35), 3.4 * s, rng, warp=warp)
    h2 = hatch(shape, np.radians(55), 3.1 * s, rng, warp=-warp)
    h3 = hatch(shape, np.radians(10), 2.8 * s, rng)
    grain = blur(rng.random(shape).astype(np.float32), .5 * s)
    tex = blur(rng.standard_normal(shape).astype(np.float32), 1.2 * s)   # graphite grain
    shade = (.07 + .34 * dark + .02 * tex                       # blended graphite, never bare
             + .30 * h1 * np.clip(dark / .15, 0, 1)              # a light first layer everywhere
             + .30 * h1 * np.clip((dark - .2) / .25, 0, 1)       # heavier in the half-tones
             + .50 * h2 * np.clip((dark - .38) / .25, 0, 1)      # cross in the half-dark
             + .45 * h3 * np.clip((dark - .62) / .2, 0, 1))      # third in the darkest
    shade *= .8 + .4 * grain
    shade *= obj

    # ---- the cast shadow on the table: the objects' footprint pushed away from the
    # light (down and to the right), hatched and fading, like the music sheet
    table = ids == 1
    near = nd.distance_transform_edt(~obj)
    off = nd.shift(obj.astype(np.float32), (.05 * shape[0], .07 * shape[0]), order=0)
    cast = blur(np.maximum(off, blur(obj.astype(np.float32), .02 * shape[0])), .025 * shape[0])
    below = np.zeros(shape, np.float32)                  # only under and right of the objects
    cols = obj.any(0)
    top = np.where(cols, obj.argmax(0), shape[0])
    yy = np.arange(shape[0])[:, None]
    below = (yy > top[None, :] + .35 * (shape[0] - top[None, :].clip(0, shape[0]))).astype(np.float32)
    below = np.maximum(below, blur(below, .04 * shape[0]))
    fade = np.clip(1 - near / (.16 * shape[0]), 0, 1)
    shadow = np.clip(cast * 1.6, 0, 1) * table * fade * np.clip(blur(below, .03 * shape[0]) * 1.5, 0, 1)
    hs = hatch(shape, np.radians(-22), 3.0 * s, rng, width=.3)
    contact = np.clip(1 - near / (.012 * shape[0]), 0, 1) * table * below
    ground = .42 * shadow * (.3 + .7 * hs) + .3 * contact
    gl = hatch(shape, np.radians(-4), 5 * s, rng, width=.2)
    ground += .14 * gl * np.clip(1 - near / (.09 * shape[0]), 0, 1) * table * below * \
              np.clip(blur(rng.standard_normal(shape).astype(np.float32), 20 * s) * 3, 0, 1)

    ink = np.clip(np.maximum(np.maximum(line * .92, shade), marks * .8) + ground * (1 - obj), 0, .93)
    k = 1 - ink * .9                                     # graphite never reaches black
    return k


def place(k, name):
    ys, xs = np.nonzero(k < .985)
    k = k[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    sc = min(.84 * H / k.shape[0], .46 * W / k.shape[1])
    tile = Image.fromarray((k * 255).astype(np.uint8)).resize(
        (round(k.shape[1] * sc), round(k.shape[0] * sc)), Image.LANCZOS)
    full = np.ones((H, W), np.float32)
    t = np.asarray(tile, np.float32) / 255
    cx, cy = round(.60 * W - t.shape[1] / 2), round((H - t.shape[0]) / 2)
    full[cy:cy + t.shape[0], cx:cx + t.shape[1]] = t
    # A whisper of paper tooth across the sheet.
    rng = np.random.default_rng(11)
    tooth = 1 - .018 * blur(rng.random((H, W)).astype(np.float32), .8)
    img = Image.fromarray(((full * tooth)[..., None] * PAPER).clip(0, 255).astype(np.uint8))
    base = os.path.join(BAN, name + "-pencil-")
    img.save(base + "1600.webp", quality=84, method=6)
    small = img.resize((900, 315), Image.LANCZOS)
    small.save(base + "900.webp", quality=82, method=6)
    small.save(base + "900.jpg", quality=86, optimize=True, progressive=True)
    return base + "900.jpg"


if __name__ == "__main__":
    scene, gdir, name = sys.argv[1:4]
    print(place(draw(gdir, scene), name))
