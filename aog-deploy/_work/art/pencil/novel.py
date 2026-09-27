#!/usr/bin/env python3
"""Pencil drawings for the novels: six book covers (portrait) and twenty scene drawings.

  python3 pencil/novel.py frame  <id>          # fit the camera to the framing rule (GUIDE.md, 8)
  python3 pencil/novel.py render <id> OUTDIR   # g-buffers + pencil proof  OUTDIR/pencil-<id>.png
  python3 pencil/novel.py export <id> OUTDIR   # proof -> aog-deploy/novels/... (scene or cover)

Ids: nov-<book>-cover (book = room-12 ... the-dwelling) and nov-room-<n>-u<k> (scenes).
Scene files are kit/scenes/<id>-still.glsl; they include novlib.glsl for the shared objects.
pencil.py is loaded unchanged, with its frame size swapped for the size each kind needs."""
import os, re, sys, json, math, subprocess, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, '..', 'kit')
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
PARAMS = os.path.join(HERE, 'params-novels.json')

# drawing size and framing box (fractions of the drawing) for each kind
KIND = {
    'cover': dict(size=(900, 960), box=(0.1, 0.16, 0.9, 0.93)),
    'scene': dict(size=(1600, 560), box=(0.24, 0.20, 0.76, 0.84)),
}
def kind(uid): return 'cover' if uid.endswith('-cover') else 'scene'

def load_pencil(w, h):
    src = open(os.path.join(HERE, 'pencil.py')).read()
    src = src.replace('W, H = 1600 * S, 560 * S', 'W, H = %d * S, %d * S' % (w, h))
    src = src.replace('.resize((1600, 560), Image.LANCZOS)', '.resize((%d, %d), Image.LANCZOS)' % (w, h))
    src = src.replace("if __name__ == '__main__':", 'if False:')
    g = {'__file__': os.path.join(HERE, 'pencil.py'), '__name__': 'pencil_novel'}
    exec(compile(src, 'pencil.py', 'exec'), g)
    return g

def params(uid):
    P = json.load(open(PARAMS))
    base = dict(P['_base'][kind(uid)]); base.update(P.get(uid, {}))
    base['scene'] = uid + '-still'
    mat = {'1': [0.99, 0.8], '2': [0.97, 0.3]}
    for k, v in base.get('m', {}).items():            # short form: {"3": value} or {"3": [value, contrast, form]}
        v = v if isinstance(v, list) else [v]
        mat[k] = [v[0], v[1] if len(v) > 1 else 1.2, None, v[2] if len(v) > 2 else 0.8]
    base['mat'] = mat
    base['texlines'] = {str(k): [0.12, 0.4, 0.8] for k in base.get('tex', [3, 4, 5, 6, 7])}
    return base

def gbuf(uid, out, w, h):
    subprocess.run(['node', 'gbuf.js', uid + '-still', out, str(w), str(h)], cwd=KIT, check=True)
    for f in ('n', 'd', 'photo', 't'):
        a = os.path.join(out, '%s-still-%s.png' % (uid, f))
        if os.path.exists(a): os.replace(a, os.path.join(out, '%s-%s.png' % (uid, f)))

def v3(s, k): return np.array([float(x) for x in re.search(r'#define ' + k + r'\s+vec3\(([^)]*)\)', s).group(1).split(',')])

def measure(uid, tmp, w, h):
    subprocess.run(['node', 'gbuf.js', uid + '-still', tmp, str(w), str(h)], cwd=KIT, capture_output=True, check=True)
    ids = np.asarray(Image.open(os.path.join(tmp, uid + '-still-d.png')).convert('RGB'))[..., 1].astype(int)
    src = open(os.path.join(KIT, 'scenes', uid + '-still.glsl')).read()
    m = re.search(r'@bg\s+([\d,]+)', src); bg = [int(x) for x in m.group(1).split(',')] if m else [0, 1, 2]
    ys, xs = np.nonzero(~np.isin(ids, bg)); H, W = ids.shape
    return xs.min() / W, ys.min() / H, (xs.max() + 1) / W, (ys.max() + 1) / H

def frame(uid, iters=3):
    """Dolly and pan only (the view angle stays), centring the group in the kind's box."""
    k = KIND[kind(uid)]; (W, H), box = k['size'], k['box']
    src = open(os.path.join(KIT, 'scenes', uid + '-still.glsl')).read()
    m = re.search(r'@box\s+([\d.,]+)', src)
    if m: box = [float(x) for x in m.group(1).split(',')]
    w, h = W // 4, H // 4
    f = os.path.join(KIT, 'scenes', uid + '-still.glsl'); tmp = tempfile.mkdtemp()
    for it in range(iters + 1):
        x0, y0, x1, y1 = measure(uid, tmp, w, h)
        print('%s pass %d: box x %.2f-%.2f y %.2f-%.2f' % (uid, it, x0, x1, y0, y1))
        if it == iters: break
        s = open(f).read(); cp, ct = v3(s, 'CAM_POS'), v3(s, 'CAM_TGT')
        fov = float(re.search(r'#define CAM_FOV\s+([\d.]+)', s).group(1))
        fw = ct - cp; d = np.linalg.norm(fw); fw /= d
        r = np.cross([0, 1, 0], fw); r /= np.linalg.norm(r); u = np.cross(fw, r)
        sc = float(np.clip(min((box[3] - box[1]) / (y1 - y0), (box[2] - box[0]) / (x1 - x0)), .5, 2.))
        kk = math.tan(math.radians(fov) / 2); hh = kk * d; hw = hh * W / H
        dx = ((x0 + x1) / 2 - (box[0] + box[2]) / 2) * 2 * hw; dy = -((y0 + y1) / 2 - (box[1] + box[3]) / 2) * 2 * hh
        ct2 = ct + r * dx + u * dy; cp2 = ct2 - fw * d / sc
        s = re.sub(r'#define CAM_POS vec3\([^)]*\)', '#define CAM_POS vec3(%.4f,%.4f,%.4f)' % tuple(cp2), s)
        s = re.sub(r'#define CAM_TGT vec3\([^)]*\)', '#define CAM_TGT vec3(%.4f,%.4f,%.4f)' % tuple(ct2), s)
        open(f, 'w').write(s)

def render(uid, out):
    os.makedirs(out, exist_ok=True)
    W, H = KIND[kind(uid)]['size']
    gbuf(uid, out, W, H)
    pen = load_pencil(W, H)
    img = pen['render'](uid, out, params(uid))
    img.save(os.path.join(out, 'pencil-%s.png' % uid))
    return img

# ------------------------------------------------------------------ covers
BOOKS = {
    'room-12': ('Book One', 'ROOM 12', ('The Year We', 'Met Sammy'), (70, 96, 52)),
    'room-18': ('Book Two', 'ROOM 18', ('The Year of the', 'Inner Critic'), (150, 70, 36)),
    'room-36': ('Book Three', 'ROOM 36', ('The Year of', 'Two Voices'), (100, 58, 118)),
    'room-104': ('Book Four', 'ROOM 104', ('The Year We', 'Looked Up'), (40, 86, 104)),
    'room-207': ('Book Five', 'ROOM 207', ('The Year We', 'Walked Out'), (132, 94, 30)),
    'the-dwelling': ('Book Six', 'THE DWELLING', ('The Years We', 'Kept Coming Back'), (132, 94, 30)),
}
FONT = '/usr/share/fonts/truetype/liberation/LiberationSerif-%s.ttf'
PAPER = (238, 233, 222); INK = (40, 40, 44)

def spaced(dr, xy, text, font, fill, track, anchor='mt'):
    """Letter-spaced text centred on xy."""
    widths = [dr.textlength(c, font=font) for c in text]; tot = sum(widths) + track * (len(text) - 1)
    x = xy[0] - tot / 2
    for c, wd in zip(text, widths):
        dr.text((x, xy[1]), c, font=font, fill=fill, anchor='l' + anchor[1]); x += wd + track

def rule(dr, cx, y, half, fill, dot=True):
    dr.line([(cx - half, y), (cx - 14, y)], fill=fill, width=2); dr.line([(cx + 14, y), (cx + half, y)], fill=fill, width=2)
    if dot: dr.ellipse([cx - 5, y - 5, cx + 5, y + 5], outline=fill, width=2)

def cover(uid, draw):
    book = uid[4:-6]; nb, big, sub, acc = BOOKS[book]
    S = 2; Wc, Hc = 900 * S, 1350 * S
    rng = np.random.default_rng(3)
    # the sheet: the drawing's paper colour with the same faint tooth
    n = rng.standard_normal((Hc // 4, Wc // 4)).astype(np.float32)
    n = np.asarray(Image.fromarray(((n * 12) + 128).clip(0, 255).astype(np.uint8)).resize((Wc, Hc), Image.BICUBIC), np.float32) - 128
    base = np.median(np.asarray(draw, np.float32)[-40:, 60:-60].reshape(-1, 3), 0)   # match the drawing's paper
    sheet = base[None, None, :] + n[..., None] * .18
    sheet = Image.fromarray(sheet.clip(0, 255).astype(np.uint8))
    d = draw.resize((900 * S, 960 * S), Image.LANCZOS)
    # fade the drawing into the sheet along its lower edge
    mask = np.ones((960 * S, 900 * S), np.float32)
    yy = np.arange(960 * S)[:, None] / (960 * S)
    mask *= np.clip((0.995 - yy) / 0.2, 0, 1) ** 1.5
    sheet.paste(d, (0, 0), Image.fromarray((mask * 255).astype(np.uint8)))
    dr = ImageDraw.Draw(sheet)
    cx = Wc // 2
    small = ImageFont.truetype(FONT % 'Regular', 17 * S); ital = ImageFont.truetype(FONT % 'Italic', 19 * S)
    spaced(dr, (cx, 30 * S), 'THE ARCHITECTURE OF GRACE', small, INK, 5 * S)
    dr.text((cx, 58 * S), '—  %s  —' % nb, font=ital, fill=INK, anchor='mt')
    y = 975 * S
    rule(dr, cx, y, 290 * S, INK)
    size = 120 if len(big) < 10 else 84
    bf = ImageFont.truetype(FONT % 'Bold', size * S)
    spaced(dr, (cx, y + 22 * S), big, bf, INK, (10 if len(big) < 10 else 5) * S)
    y2 = y + 22 * S + size * S + 8 * S
    rule(dr, cx, y2 + 8 * S, 90 * S, INK, dot=False)
    sf = ImageFont.truetype(FONT % 'Italic', 44 * S)
    dr.text((cx, y2 + 30 * S), sub[0], font=sf, fill=INK, anchor='mt')
    dr.text((cx, y2 + 80 * S), sub[1], font=sf, fill=acc, anchor='mt')
    dr.line([(cx - 90 * S, 1276 * S), (cx + 90 * S, 1276 * S)], fill=INK, width=2)
    spaced(dr, (cx, 1296 * S), 'JAMES ANTHONY RAMSDEN', ImageFont.truetype(FONT % 'Regular', 21 * S), INK, 4 * S)
    return sheet.resize((900, 1350), Image.LANCZOS)

def export(uid, out):
    img = Image.open(os.path.join(out, 'pencil-%s.png' % uid)).convert('RGB')
    if kind(uid) == 'cover':
        c = cover(uid, img); book = uid[4:-6]
        p = os.path.join(ROOT, 'novels', 'cover-%s.jpg' % book)
        c.save(p, 'JPEG', quality=86, optimize=True, progressive=True)
        c.save(os.path.join(out, 'cover-%s.png' % book))
        print(os.path.relpath(p, ROOT), os.path.getsize(p))
    else:
        name = uid[4:]
        small = img.resize((1200, 420), Image.LANCZOS)
        stem = os.path.join(ROOT, 'novels', 'scenes', name + '-pencil')
        for q in range(84, 40, -4):
            small.save(stem + '.webp', 'WEBP', quality=q, method=6)
            if os.path.getsize(stem + '.webp') <= 160 * 1024: break
        small.save(stem + '.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
        for s in ('.webp', '.jpg'): print(os.path.relpath(stem + s, ROOT), os.path.getsize(stem + s))

if __name__ == '__main__':
    cmd, uid = sys.argv[1], sys.argv[2]
    if cmd == 'frame': frame(uid)
    elif cmd == 'render': render(uid, sys.argv[3])
    elif cmd == 'export': export(uid, sys.argv[3])
    elif cmd == 'preview':   # cover layout only, into OUTDIR/cover-<book>.png
        cover(uid, Image.open(os.path.join(sys.argv[3], 'pencil-%s.png' % uid)).convert('RGB')).save(os.path.join(sys.argv[3], 'cover-%s.png' % uid[4:-6]))
