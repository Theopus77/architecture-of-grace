#!/usr/bin/env python3
"""Graphite pencil renderer for unit banners (AOG-PENCIL-V1).

  python3 pencil.py <id> --gbuf DIR [--out DIR] [--final]

Inputs (1600x560): the rendered scene (img/banners/<id>-1600.webp) for values and texture,
and geometry buffers from ../kit/gbuf.js (<id>-n.png view normals, <id>-d.png depth/id/sun).
Works at 2x (3200x1120) and draws real strokes:
  contours  - from depth / normal / material breaks, drawn as 2-3 wandering, tapering passes
              with pressure falling off in the light and in the distance (lost-and-found edges)
  tone      - four hatching layers (H, HB, 2B, 6B) seeded on a jittered grid, each stroke
              traced along a flow field built from the surface normals (cross-contour on
              curved forms, a steady right-hand diagonal on flat faces), crossing in the darks
  smudge    - blended graphite in shadow masses, plus sheen in the darkest accents
  paper     - warm off-white sheet with tooth that breaks up every mark; highlights stay paper
  atmosphere- strokes get lighter, longer and looser with depth; drawing vignettes to paper
--final writes aog-deploy/img/banners/<id>-pencil-1600.webp / -900.webp / -900.jpg (<=250 KB).
"""
import sys, os, json, math, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
S = 2                       # supersample
W, H = 1600 * S, 560 * S
PAPER = np.array([238, 233, 222], np.float32) / 255.   # warm off-white
GRAPH = np.array([38, 38, 42], np.float32) / 255.      # graphite (very slightly cool)

def load(p, mode=None):
    im = Image.open(p)
    if mode: im = im.convert(mode)
    return np.asarray(im.resize((W, H), Image.BICUBIC), np.float32) / 255.

def blur(a, s): return nd.gaussian_filter(a, s, mode='nearest')

def noise(rng, s, shape=(H, W)):
    n = blur(rng.standard_normal(shape).astype(np.float32), s)
    return (n - n.mean()) / (n.std() + 1e-6)

def smooth01(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

# ------------------------------------------------------------------ inputs
def prepare(uid, gdir, P):
    rng = np.random.default_rng(P.get('seed', 7))
    pp = os.path.join(gdir, uid + '-photo.png')
    photo = load(pp if os.path.exists(pp) else os.path.join(ROOT, 'img', 'banners', uid + '-1600.webp'), 'RGB')
    lum = photo @ np.array([.2126, .7152, .0722], np.float32)
    nrm = load(os.path.join(gdir, uid + '-n.png'), 'RGB') * 2 - 1
    dd = np.asarray(Image.open(os.path.join(gdir, uid + '-d.png')).convert('RGB'), np.float32) / 255.
    ids_lo = np.rint(dd[..., 1] * 255).astype(np.int32)
    ids = np.asarray(Image.fromarray(ids_lo.astype(np.uint8)).resize((W, H), Image.NEAREST)).astype(np.int32)
    depth = np.asarray(Image.fromarray((dd[..., 0] * 65535).astype(np.uint16) if False else (dd[..., 0] * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32) / 255.
    sun = np.asarray(Image.fromarray((dd[..., 2] * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32) / 255.
    sky = depth > .995
    return rng, photo, lum, nrm, depth, ids, sun, sky

# ------------------------------------------------------------------ value plan
def value_map(lum, depth, sky, P):
    """0 = darkest graphite, 1 = paper. A drawing's value plan, not the photo's:
    simplified masses (bilateral-ish smoothing), pushed contrast, distance lifted."""
    L = np.power(np.clip(lum, 0, 1), P.get('gamma', .8))
    # keep some texture, but simplify: mix a heavy blur with a light one
    L = .55 * blur(L, 2.5 * S) + .45 * blur(L, 7 * S)
    lo, hi = np.percentile(L[~sky], [P.get('plo', 3), P.get('phi', 97)])
    T = np.clip((L - lo) / (hi - lo + 1e-6), 0, 1)
    T = T ** P.get('tpow', 1.0)
    T = P.get('tmin', .02) + (1 - P.get('tmin', .02)) * T
    # atmospheric perspective: distance lifts values toward paper
    far = smooth01(P.get('far0', .68), P.get('far1', .97), depth)
    T = T + (1 - T) * far * P.get('aerial', .65)
    T[sky] = np.clip(1 - (1 - T[sky]) * P.get('skyk', .45), 0, 1)
    if P.get('skyadd') and sky.any():
        # clouds: a few long, light, level strokes where the sky is darkest
        ls = blur(lum, 4 * S); a, b = np.percentile(ls[sky], [5, 95])
        c = np.clip((b - ls) / (b - a + 1e-6), 0, 1) ** 1.6
        T[sky] = np.minimum(T[sky], 1 - P['skyadd'] * c[sky])
    return T

# ------------------------------------------------------------------ flow field
def flow_field(nrm, sky, P, depth=None, cam=None):
    nx, ny = nrm[..., 0], -nrm[..., 1]           # screen: y down
    w = np.sqrt(nx * nx + ny * ny)
    # tangent perpendicular to projected normal (runs around the form)
    tx, ty = -ny, nx
    ang = np.arctan2(ty, tx)
    base = math.radians(P.get('diag', -52))       # right-handed diagonal, / direction
    wf = smooth01(.25, .75, w) * P.get('follow', .85)
    c2 = wf * np.cos(2 * ang) + (1 - wf) * math.cos(2 * base)
    s2 = wf * np.sin(2 * ang) + (1 - wf) * math.sin(2 * base)
    if cam is not None:
        # vertical faces: hatch along their receding horizontals (perspective lines),
        # as an architect draws a wall, instead of around a form they don't have
        fov, maxt = cam; k = math.tan(math.radians(fov) / 2)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        ux = (2 * xx - W) / H * k; uy = -(2 * yy - H) / H * k
        t = np.expm1(depth * math.log1p(maxt)); t = np.maximum(t, 1e-3)
        rl = np.sqrt(ux * ux + uy * uy + 1)
        px, py, pz = ux / rl * t, uy / rl * t, 1 / rl * t
        vnx, vny, vnz = nrm[..., 0], nrm[..., 1], -nrm[..., 2]
        e = .02 * t; qx, qz = px - vnz * e, pz + vnx * e
        sx = qx / qz - px / pz; sy = -(py / qz - py / pz)
        pa = np.arctan2(sy, sx)
        wv = smooth01(.75, .45, np.abs(vny)) * smooth01(.12, .45, np.abs(vnx)) * P.get('persp', 1.0)
        c2 = (1 - wv) * c2 + wv * np.cos(2 * pa); s2 = (1 - wv) * s2 + wv * np.sin(2 * pa)
    c2 = blur(c2, 5 * S); s2 = blur(s2, 5 * S)
    c2[sky] = math.cos(2 * math.radians(P.get('skyang', -8))); s2[sky] = math.sin(2 * math.radians(P.get('skyang', -8)))
    c2 = blur(c2, 2 * S); s2 = blur(s2, 2 * S)
    return .5 * np.arctan2(s2, c2)

# ------------------------------------------------------------------ strokes
def trace(theta, x, y, length, step, off, ids, rng):
    """Follow the (angle + off) field from (x, y) both ways; stop at material breaks."""
    pts = [(x, y)]; hx, hy = W - 1, H - 1
    i0 = ids[int(y), int(x)]
    for sgn in (1, -1):
        cx, cy = x, y; px, py = None, None; seg = []
        for _ in range(int(length / 2 / step)):
            a = theta[int(min(max(cy, 0), hy)), int(min(max(cx, 0), hx))] + off
            dx, dy = math.cos(a), math.sin(a)
            if px is not None and dx * px + dy * py < 0: dx, dy = -dx, -dy
            px, py = dx, dy
            cx += sgn * dx * step; cy += sgn * dy * step
            if not (0 <= cx < W and 0 <= cy < H): break
            if ids[int(cy), int(cx)] != i0 and rng.random() < .93: break
            seg.append((cx, cy))
        pts = (seg[::-1] + pts) if sgn == -1 else (pts + seg)
    return pts

def draw_stroke(dr, pts, width, dark, rng):
    """Tapering stroke with a pressure curve: light entry, firm middle, flicked exit."""
    n = len(pts)
    if n < 2: return
    k0 = rng.uniform(.25, .45); bias = rng.uniform(-.15, .15)
    for i in range(n - 1):
        t = (i + .5) / (n - 1)
        p = math.sin(math.pi * min(max(t + bias * t * (1 - t), 0), 1)) ** k0
        v = int(255 * dark * (.35 + .65 * p))
        if v <= 2: continue
        dr.line([pts[i], pts[i + 1]], fill=v, width=max(1, int(round(width * (.55 + .45 * p)))))

STYLE = {'hatch': 0, 'flick': 1, 'scribble': 2, 'flat': 3}

def scribble(dr, x, y, r, dark, width, rng):
    """A small cluster of looping marks: how foliage masses are drawn."""
    n = rng.integers(2, 4); a = rng.uniform(0, 6.28); pts = []
    cx, cy = x, y
    for i in range(n * 10):
        a += rng.uniform(.45, .8)
        rr = r * rng.uniform(.5, 1.0)
        cx += rng.normal(0, r * .12); cy += rng.normal(0, r * .1)
        pts.append((cx + rr * math.cos(a), cy + rr * .75 * math.sin(a)))
    draw_stroke(dr, pts, width, dark, rng)

def hatch_layer(theta, T, depth, ids, style, rng, thr, spacing, length, off, width, dark, jitter=.45, curve=1.0, mask=None, nb=(3, 7), layer=1):
    """Strokes come in bundles, as a hand lays them: a run of 3-7 near-parallel marks of
    similar length, each only where the value plan is darker than this pencil's threshold."""
    img = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(img)
    step = 3.0 * S; bsp = spacing * 4.2
    ys = np.arange(bsp / 2, H, bsp); xs = np.arange(bsp / 2, W, bsp)
    seeds = [(x0 + rng.uniform(-.5, .5) * bsp, y0 + rng.uniform(-.5, .5) * bsp) for y0 in ys for x0 in xs]
    rng.shuffle(seeds)
    for (bx, by) in seeds:
        if not (0 <= bx < W and 0 <= by < H): continue
        bi = (int(by), int(bx)); st = style[bi]
        if st == 1 and layer >= 3: st = 0      # shadowed grass: hatch under the flicks
        if mask is not None and not mask[bi]: continue
        if T[bi] >= thr + .08: continue
        d = depth[bi]; far = min(max((d - .55) / .4, 0), 1)
        if st == 2:           # foliage: clumps of short marks, each clump its own direction
            a0 = theta[bi] + off * .25 + rng.normal(0, .35)
            ca, sa = math.cos(a0), math.sin(a0); k = rng.integers(3, 7)
            Lb = length * .38 * (1 - .4 * far) * (.7 + .6 * rng.random()); sp_ = spacing * .8
            for j in range(k):
                o = (j - (k - 1) / 2) * sp_
                x = bx - sa * o + rng.normal(0, 1.2); y = by + ca * o + rng.normal(0, 1.2)
                if not (0 <= x < W and 0 <= y < H): continue
                t = T[int(y), int(x)]; th = thr + rng.normal(0, .03)
                if t >= th or ids[int(y), int(x)] != ids[bi]: continue
                L = Lb * rng.uniform(.7, 1.2); bend = rng.normal(0, L * .12)
                pts = [(x - ca * L / 2, y - sa * L / 2), (x - sa * bend, y + ca * bend), (x + ca * L / 2, y + sa * L / 2)]
                draw_stroke(dr, pts, width, dark * min(1, (th - t) / .15 + .4) * (1 - .4 * far), rng)
            continue
        a0 = theta[bi] + off + rng.normal(0, .05)
        if st == 1: a0 = -math.pi / 2 + rng.normal(0, .18) + off * .25    # grass flicks, near vertical
        if st == 3: a0 = rng.normal(0, .04) + (off * .15)                    # water: level strokes
        ca, sa = math.cos(a0), math.sin(a0)
        k = rng.integers(nb[0], nb[1] + 1)
        Lb = length * (.7 + .6 * rng.random()) * (1 + .6 * far)
        if st == 1: Lb = length * .45 * (1 - .6 * far) * (.7 + .6 * rng.random())
        if st == 3: Lb = length * (1.2 + 1.2 * rng.random())
        sp_ = spacing * (1 + .5 * far) * rng.uniform(.85, 1.15)
        for j in range(k):
            o = (j - (k - 1) / 2) * sp_
            x = bx - sa * o + rng.normal(0, .8) + ca * rng.normal(0, Lb * .08)
            y = by + ca * o + rng.normal(0, .8) + sa * rng.normal(0, Lb * .08)
            if not (0 <= x < W and 0 <= y < H): continue
            xi, yi = int(x), int(y)
            if mask is not None and not mask[yi, xi]: continue
            if ids[yi, xi] != ids[bi]: continue
            t = T[yi, xi]; th = thr + rng.normal(0, .015)
            if t >= th: continue
            strength = dark * min(1, (th - t) / .16 + .35) * (1 - .45 * far)
            L = Lb * rng.uniform(.8, 1.15)
            if st in (1, 3):
                pts = [(x - ca * L / 2, y - sa * L / 2), (x, y + rng.normal(0, .5)), (x + ca * L / 2 + rng.normal(0, 1), y + sa * L / 2)]
                if st == 1:   # flick: firm at the root, lifted at the tip; slight bend
                    pts = [(x, y + L * .5), (x + rng.normal(0, L * .06), y), (x + rng.normal(0, L * .15), y - L * .5)]
            else:
                pts = trace(theta, x, y, L, step, a0 - theta[yi, xi], ids, rng)
            draw_stroke(dr, pts, width * (1 - .3 * far), strength, rng)
    return np.asarray(img, np.float32) / 255.

def slice_phases(P, uid, nrm, ids, gdir, layers):
    """Cross-contour hatching: hatch lines are where parallel planes in the scene cut the
    surface, so they wrap round every form in true perspective (a cylinder gets rings, a
    block face gets parallel lines that converge). Spacing is set per object in pixels."""
    import re as _re
    sc = open(os.path.join(HERE, '..', 'kit', 'scenes', P.get('scene', uid) + '.glsl')).read()
    v3 = lambda k: np.array([float(x) for x in _re.search(r'#define ' + k + r'\s+vec3\(([^)]*)\)', sc).group(1).split(',')])
    cp, ct = v3('CAM_POS'), v3('CAM_TGT')
    fov = float(_re.search(r'#define CAM_FOV\s+([\d.]+)', sc).group(1)); maxt = float(_re.search(r'#define MAXT\s+([\d.]+)', sc).group(1))
    f = (ct - cp) / np.linalg.norm(ct - cp); r = np.cross([0, 1, 0], f); r /= np.linalg.norm(r); u = np.cross(f, r)
    k = math.tan(math.radians(fov) / 2)
    tp = np.asarray(Image.open(os.path.join(gdir, uid + '-t.png')).convert('RGB').resize((W, H), Image.NEAREST), np.float32)
    t = (tp[..., 0] + tp[..., 1] / 255.) / 255. * maxt
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    ux = (2 * (xx + .5) / W - 1) * W / H * k; uy = -(2 * (yy + .5) / H - 1) * k
    rd = f[None, None] + ux[..., None] * r[None, None] + uy[..., None] * u[None, None]
    rd /= np.linalg.norm(rd, axis=-1, keepdims=True)
    p = cp[None, None] + rd * t[..., None]
    nw = nrm[..., 0:1] * r + nrm[..., 1:2] * u - nrm[..., 2:3] * f
    fp = t * 2 * k / H
    fpo = np.zeros_like(fp)
    for i in np.unique(ids): m = ids == i; fpo[m] = np.median(fp[m])
    out = []
    for (A, B, spc) in layers:
        A = np.array(A, float); A /= np.linalg.norm(A); B = np.array(B, float); B /= np.linalg.norm(B)
        useB = np.abs(nw @ A) > .82
        d = np.where(useB, p @ B, p @ A)
        out.append(d / (spc * S * fpo + 1e-9))
    return out

def face_theta(theta, ids, sig):
    """Smooth the hatch direction inside each object only (no bleeding across edges)."""
    c2, s2 = np.cos(2 * theta), np.sin(2 * theta)
    oc, os_ = np.zeros_like(c2), np.zeros_like(s2)
    for k in np.unique(ids):
        m = (ids == k).astype(np.float32); w = blur(m, sig) + 1e-6
        oc += m * blur(c2 * m, sig) / w; os_ += m * blur(s2 * m, sig) / w
    return .5 * np.arctan2(os_, oc)

def proc_hatch(theta, T, ids, rng, thr, spacing, off, width, dark, soft=.05, ph=None):
    """Evenly spaced hatching laid like a draughtsman's: parallel lines that bend with the
    direction field, broken into strokes of varied length with staggered ends and pressure."""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    wob = noise(rng, 70 * S) * .18
    if ph is None:
        a = theta + off; ca, sa = np.cos(a), np.sin(a)
        ph = (-xx * sa + yy * ca) / spacing + wob
    else:
        gy, gx = np.gradient(blur(ph, 2 * S)); gn = np.hypot(gx, gy) + 1e-6
        ca, sa = -gy / gn, gx / gn
        ph = ph + wob
    row = np.floor(ph); hr = np.sin(row * 91.7 + 3.1) * 5413.7; hr -= np.floor(hr)
    fr = ph - row - .5 - (hr - .5) * .3
    u = (xx * ca + yy * sa)
    # per-row random stroke length & offset -> segments along the line
    h1 = np.sin(row * 12.9898 + 78.233) * 43758.5453; h1 -= np.floor(h1)
    h2 = np.sin(row * 39.3468 + 11.135) * 24634.6345; h2 -= np.floor(h2)
    L = (70 + 110 * h1) * S
    t = (u / L + h2 * 7.)
    seg = np.floor(t); tf = t - seg
    h3 = np.sin(seg * 7.13 + row * 3.71) * 9573.13; h3 -= np.floor(h3)
    press = np.sin(np.clip(tf, 0, 1) * math.pi) ** .35 * (.6 + .4 * h3) * (.8 + .2 * hr)
    gap = (tf > .02) & (tf < .985)
    line = np.clip(1 - np.abs(fr) * spacing / (width * (.6 + .5 * press)), 0, 1)
    # value mask with staggered ends: each stroke decides for itself where to stop
    m = smooth01(thr + soft, thr - soft, T + (h3 - .5) * .09)
    return line * press * gap * m * dark

# ------------------------------------------------------------------ contours
def contours(nrm, depth, ids, T, rng, P):
    # depth discontinuity (relative, in log depth), normal crease, material break
    db = blur(depth, 1.2 * S)
    dz = np.hypot(nd.sobel(db, 1), nd.sobel(db, 0))
    e_d = smooth01(P.get('ed0', .012), P.get('ed1', .05), dz)
    dn = sum(np.hypot(nd.sobel(nrm[..., c], 1), nd.sobel(nrm[..., c], 0)) for c in range(3))
    e_n = smooth01(P.get('en0', 1.2), P.get('en1', 2.6), dn) * P.get('crease', .6)
    idc = (nd.maximum_filter(ids, 3) != nd.minimum_filter(ids, 3)).astype(np.float32)
    e = np.maximum(np.maximum(e_d, e_n), idc * P.get('idline', .7))
    if P.get('bg'): e = np.where(np.isin(ids, P['bg']), idc * P.get('idline', .7), e)
    e = nd.maximum_filter(e, 2)
    # weight: heavy on the shadow side and close by, thin/lost in light and in distance
    near = 1 - smooth01(P.get('cn0', .45), P.get('cn1', .85), nd.minimum_filter(depth, 5))
    tone = 1 - smooth01(.35, .95, blur(T, 4 * S))
    lost = smooth01(-.6, .5, noise(rng, 18 * S))                  # lost-and-found gaps
    wgt = np.clip((.3 + .7 * tone) * (.35 + .65 * near) * (.25 + .75 * lost), 0, 1) * P.get('cw', 1.0)
    out = np.zeros((H, W), np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    for k in range(P.get('passes', 3)):
        # each pass wanders a little: a hand redrawing the same edge
        ox = noise(rng, 30 * S) * (1.2 + k * .9) * S; oy = noise(rng, 30 * S) * (1.2 + k * .9) * S
        ek = nd.map_coordinates(e * wgt, [yy + oy, xx + ox], order=1, mode='nearest')
        thin = blur(ek, .45 * S) * (1.0 if k == 0 else .55)
        press = .55 + .45 * smooth01(-1, 1, noise(rng, 45 * S))
        out = np.maximum(out, thin * press) if k == 0 else 1 - (1 - out) * (1 - .6 * thin * press)
    return np.clip(out * 1.25, 0, 1), e

# ------------------------------------------------------------------ paper
def paper_tooth(rng):
    fine = noise(rng, .7 * S)
    grain = noise(rng, 1.6 * S) + .6 * fine
    # a faint laid direction, like cold-press drawing paper
    laid = blur(rng.standard_normal((H, W)).astype(np.float32), (0.5 * S, 4 * S))
    laid = laid / (laid.std() + 1e-6)
    t = .6 * grain + .25 * laid + .15 * noise(rng, 6 * S)
    return (t - t.min()) / (t.max() - t.min())

def construction(rng, P):
    img = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(img)
    for ln in P.get('cons', []):
        (x0, y0), (x1, y1) = [(a * W, b * H) for a, b in ln[:2]]
        v = ln[2] if len(ln) > 2 else 60
        n = 40
        for i in range(n):
            t0, t1 = i / n, (i + 1) / n
            p = .5 + .5 * math.sin(i * .7 + rng.random())
            dr.line([(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0 + rng.normal(0, .4)),
                     (x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1)], fill=int(v * p), width=S)
    return np.asarray(img, np.float32) / 255.

# ------------------------------------------------------------------ compose
def render(uid, gdir, P):
    rng, photo, lum, nrm, depth, ids, sun, sky = prepare(uid, gdir, P)
    T = value_map(lum, depth, sky, P)
    style = np.zeros((H, W), np.int32)
    # value plan per material: [target mean value, contrast, stroke style]. Keeps the photo's
    # light and cast shadows, but sets each thing's local value the way a draughtsman would.
    M = P.get('mat', {})
    if M:
        T0 = T.copy(); Tm = T.copy()
        for k, m in M.items():
            sel = ids == int(k)
            if not sel.any(): continue
            if m[0] is not None:
                mu = np.median(T0[sel]); Tm[sel] = m[0] + (T0[sel] - mu) * m[1]
            if len(m) > 2 and m[2]: style[sel] = STYLE[m[2]]
        # a drawing key light (view space, from the upper left and in front) so each face of
        # a form takes its own value: the planes of a block, the terraces of a mound
        kx, ky, kz = P.get('key', [-.45, .75, .45]); kl = math.sqrt(kx * kx + ky * ky + kz * kz)
        ndl = (nrm[..., 0] * kx + nrm[..., 1] * ky + nrm[..., 2] * kz) / kl
        for k, m in M.items():
            sel = ids == int(k)
            if sel.any() and len(m) > 3: Tm[sel] += (ndl[sel] - np.median(ndl[sel])) * m[3]
        Tm = blur(Tm, .8 * S)
        T = np.where(sky, T0, np.clip(Tm, 0, 1))
        T = np.clip(T, 0, 1) ** P.get('curve', 1.0)
    sc = open(os.path.join(HERE, '..', 'kit', 'scenes', P.get('scene', uid) + '.glsl')).read()
    import re as _re
    cam = (float(_re.search(r'#define CAM_FOV\s+([\d.]+)', sc).group(1)), float(_re.search(r'#define MAXT\s+([\d.]+)', sc).group(1)))
    theta = flow_field(nrm, sky, P, depth, cam)
    if 'focus' in P:
        # the artist's attention: full value at the subject, fading toward clean paper
        fx, fy, rx, ry = P['focus']; fmin = P.get('fmin', .3)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx / W - fx) / rx) ** 2 + ((yy / H - fy) / ry) ** 2) + noise(rng, 50 * S) * .08
        att = fmin + (1 - fmin) * smooth01(1.25, .55, r)
        T = 1 - (1 - T) * att
    else: att, fmin = 1.0, 0.0
    sp = P.get('spacing', 1.0) * S
    notsky = ~sky
    # four pencils. (threshold, spacing, length, angle offset, width, darkness)
    if P.get('slice'):
        LY = P.get('slayers', [[[1, 1.3, .2], [0, 1, 0], 9, .93, 1.3, .4], [[-1, 1, .3], [1, 0, 0], 8, .74, 1.35, .5],
                               [[0, 1, 0], [1, 0, 0], 6.5, .55, 1.5, .62], [[1, .35, .15], [0, 0, 1], 4.5, .34, 1.9, .82]])
        phs = slice_phases(P, uid, nrm, ids, gdir, [(a, b, c) for a, b, c, *_ in LY])
        bg = np.isin(ids, P.get('bg', []))
        if bg.any():   # table and wall: plain screen-space hatching, loose and straight
            yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
            for i, l in enumerate(LY):
                a = math.radians(P.get('bgang', -35) + [0, 50, -45, 8][i]); sp_ = l[2] * S * 1.2
                phs[i] = np.where(bg, (-xx * math.sin(a) + yy * math.cos(a)) / sp_, phs[i])
        L1, L2, L3, L4 = [proc_hatch(None, T, ids, rng, l[3], 1, 0, l[4] * S, l[5], ph=ph) for l, ph in zip(LY, phs)]
    elif P.get('proc'):
        th2 = face_theta(theta, ids, 6 * S)
        hl = []
        for (thr, spc, off, wd, dk) in P.get('layers', [[.93, 9, 0, 1.3, .4], [.74, 8, 48, 1.35, .5], [.55, 6.5, -42, 1.5, .62], [.34, 4.5, 6, 1.9, .82]]):
            hl.append(proc_hatch(th2, T, ids, rng, thr, spc * S, math.radians(off), wd * S, dk))
        L1, L2, L3, L4 = hl
    else:
      L1 = hatch_layer(theta, T, depth, ids, style, rng, P.get('t1', .93), 5.2 * sp, 34 * S, 0.0, 1.2 * S, .34)          # H
      L2 = hatch_layer(theta, T, depth, ids, style, rng, P.get('t2', .76), 4.6 * sp, 28 * S, math.radians(58), 1.35 * S, .5, mask=notsky, layer=2)  # HB cross
      L3 = hatch_layer(theta, T, depth, ids, style, rng, P.get('t3', .56), 3.6 * sp, 22 * S, math.radians(-28), 1.6 * S, .7, mask=notsky, layer=3)  # 2B
      L4 = hatch_layer(theta, T, depth, ids, style, rng, P.get('t4', .33), 3.0 * sp, 16 * S, math.radians(88), 2.0 * S, .88, curve=2, mask=notsky, layer=4)  # 6B
    tooth = paper_tooth(rng)
    # tooth breaks the hard pencils most; soft graphite fills the valleys
    def bite(L, soft):
        g = np.clip((tooth - (.62 - .45 * soft)) / .45 + L * .6, 0, 1)
        return L * (.25 + .75 * g)
    hatch = 1 - (1 - bite(L1, 0)) * (1 - bite(L2, .3)) * (1 - bite(L3, .6)) * (1 - bite(L4, .9))
    # smudged graphite in the shadow masses (a stump / finger blend), a touch uneven
    dark = np.clip(1 - T, 0, 1)
    sm = (blur(dark, 1.5 * S) * smooth01(.4, .8, dark)) ** 1.4 * P.get('smudge', .42) * (.7 + .3 * smooth01(-1, 1, noise(rng, 25 * S)))
    sm *= (1 - .45 * smooth01(.6, .95, depth))
    sm = sm * (.7 + .3 * tooth)
    cont, emask = contours(nrm, depth, ids, T, rng, P)
    cont = cont * (.45 + .55 * np.clip((tooth - .15) / .5, 0, 1))
    if P.get('texlines'):
        # surface pattern (tiles, brick courses, letters, a picture on a page) as light line
        # work picked out of the render, not as tone
        lb = blur(lum, .7 * S)
        if P.get('ridge'):   # painted marks: a single line down the middle of each dark mark
            gm = np.clip(blur(lum, 3.5 * S) - lb, 0, 1) * 4
        else:
            gm = np.hypot(nd.sobel(lb, 1), nd.sobel(lb, 0))
        tl = np.zeros((H, W), np.float32)
        for k, (a0, a1, st) in P['texlines'].items():
            sel = nd.binary_erosion(ids == int(k), iterations=2 * S)
            tl = np.maximum(tl, smooth01(a0, a1, gm) * sel * st)
        if 'focus' in P: tl *= np.clip((att - fmin) / (1 - fmin + 1e-6) * 1.3, 0, 1)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        tl = nd.map_coordinates(tl, [yy + noise(rng, 14 * S) * 1.1 * S, xx + noise(rng, 14 * S) * 1.1 * S], order=1, mode='nearest')
        tl *= .55 + .45 * smooth01(-1.2, .8, noise(rng, 10 * S))       # pressure: lines come and go
        tl = blur(tl, .35 * S) * (.4 + .6 * np.clip((tooth - .1) / .5, 0, 1))
        cont = 1 - (1 - cont) * (1 - tl)
    cons = construction(rng, P) * (.5 + .5 * tooth)
    # drawing vignettes out to paper at the sheet edges (how a sketch sits on the page)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    ex = np.minimum(xx, W - 1 - xx) / W; ey = np.minimum(yy, H - 1 - yy) / H
    wob = noise(rng, 60 * S) * .006
    vig = smooth01(0, P.get('vigx', .06), ex + wob) * smooth01(0, P.get('vigy', .05), ey + wob)
    vig = np.maximum(vig, P.get('vigmin', 0))
    g = 1 - (1 - hatch) * (1 - sm) * (1 - cont * P.get('ck', .85))
    g = g * vig
    g = 1 - (1 - g) * (1 - cons * .6)
    # graphite: darkening of the paper colour toward graphite, with sheen in the deepest marks
    a = np.clip(g, 0, 1)[..., None] ** 1.05
    col = PAPER * (1 - a) + GRAPH * a
    sheen = smooth01(.72, .95, g)[..., None] * (.5 + .5 * tooth[..., None])
    col = col + sheen * .07 * (np.array([.9, .92, 1.0]))
    # paper itself: faint uneven tone and tooth visible in the clean areas
    col = col * (1 - .025 * noise(rng, 80 * S)[..., None] * .5) * (0.985 + .03 * tooth[..., None])
    col = np.clip(col, 0, 1)
    img = Image.fromarray((col * 255).astype(np.uint8)).resize((1600, 560), Image.LANCZOS)
    return img


def save_final(img, uid):
    out = os.path.join(ROOT, 'img', 'banners')
    stem = os.path.join(out, uid + '-pencil')
    for q in range(84, 40, -4):
        img.save(stem + '-1600.webp', 'WEBP', quality=q, method=6)
        if os.path.getsize(stem + '-1600.webp') <= 250 * 1024: break
    small = img.resize((900, 315), Image.LANCZOS)
    small.save(stem + '-900.webp', 'WEBP', quality=82, method=6)
    small.save(stem + '-900.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
    for s in ('-1600.webp', '-900.webp', '-900.jpg'):
        print(os.path.relpath(stem + s, ROOT), os.path.getsize(stem + s))

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('uid'); ap.add_argument('--gbuf', required=True)
    ap.add_argument('--out', default='.'); ap.add_argument('--params', default=os.path.join(HERE, 'params.json')); ap.add_argument('--final', action='store_true')
    a = ap.parse_args()
    P = json.load(open(a.params)).get(a.uid, {})
    img = render(a.uid, a.gbuf, P)
    os.makedirs(a.out, exist_ok=True)
    img.save(os.path.join(a.out, 'pencil-%s.png' % a.uid))
    if a.final: save_final(img, a.uid)
