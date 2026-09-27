#!/usr/bin/env python3
"""Pencil drawings for the FCS hands-on bench (fcs-shop.html): the kitchen and the sewing table.

  python3 pencil/bench.py bench-kitchen OUTDIR [--final]
  python3 pencil/bench.py bench-sewing  OUTDIR [--final]

Same pipeline as the unit banners (GUIDE.md): kit/gbuf.js renders kit/scenes/<id>-still.glsl,
then pencil.py (loaded unchanged, its frame swapped to 1600x1000, as novel.py does) draws it.
Params live in pencil/params_bench.json. The id buffer (<id>-d.png, green = material id) gives
each tappable object's box as percentages of the drawing; they are written to
pencil/bench_hotspots.json, which fcs-shop.html carries inline as HOT.
--final writes img/banners/<id>-pencil-1600.webp, -900.webp and -900.jpg."""
import os, sys, json, subprocess
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, '..', 'kit')
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
W, H = 1600, 1000

def load_pencil():
    src = open(os.path.join(HERE, 'pencil.py')).read()
    src = src.replace('W, H = 1600 * S, 560 * S', 'W, H = %d * S, %d * S' % (W, H))
    src = src.replace('.resize((1600, 560), Image.LANCZOS)', '.resize((%d, %d), Image.LANCZOS)' % (W, H))
    src = src.replace("if __name__ == '__main__':", 'if False:')
    g = {'__file__': os.path.join(HERE, 'pencil.py'), '__name__': 'pencil_bench'}
    exec(compile(src, 'pencil.py', 'exec'), g)
    return g

def hotspots(uid, out):
    ids = np.asarray(Image.open(os.path.join(out, uid + '-d.png')).convert('RGB'))[..., 1].astype(int)
    h, w = ids.shape; boxes = {}
    for i in sorted(set(np.unique(ids)) - {0, 1, 2, 255}):
        ys, xs = np.nonzero(ids == i)
        if len(xs) < 20: continue
        x0, x1 = np.percentile(xs, [.5, 99.5]); y0, y1 = np.percentile(ys, [.5, 99.5])
        boxes[str(i)] = [round(100 * x0 / w, 1), round(100 * y0 / h, 1), round(100 * (x1 - x0) / w, 1), round(100 * (y1 - y0) / h, 1)]
    return boxes

def main():
    uid, out = sys.argv[1], sys.argv[2]; final = '--final' in sys.argv
    os.makedirs(out, exist_ok=True)
    subprocess.run(['node', 'gbuf.js', uid + '-still', os.path.abspath(out), str(W), str(H)], cwd=KIT, check=True)
    for f in ('n', 'd', 'photo', 't'):
        a = os.path.join(out, '%s-still-%s.png' % (uid, f))
        if os.path.exists(a): os.replace(a, os.path.join(out, '%s-%s.png' % (uid, f)))
    P = json.load(open(os.path.join(HERE, 'params_bench.json')))[uid]
    g = load_pencil()
    img = g['render'](uid, out, P)
    img.save(os.path.join(out, 'pencil-%s.png' % uid))
    hp = os.path.join(HERE, 'bench_hotspots.json')
    allh = json.load(open(hp)) if os.path.exists(hp) else {}
    allh[uid] = hotspots(uid, out)
    json.dump(allh, open(hp, 'w'), indent=1)
    print(json.dumps(allh[uid]))
    if final:
        stem = os.path.join(ROOT, 'img', 'banners', uid + '-pencil')
        for q in range(84, 40, -4):
            img.save(stem + '-1600.webp', 'WEBP', quality=q, method=6)
            if os.path.getsize(stem + '-1600.webp') <= 300 * 1024: break
        small = img.resize((900, 563), Image.LANCZOS)
        small.save(stem + '-900.webp', 'WEBP', quality=80, method=6)
        small.save(stem + '-900.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
        for s in ('-1600.webp', '-900.webp', '-900.jpg'):
            print(os.path.relpath(stem + s, ROOT), os.path.getsize(stem + s))

if __name__ == '__main__':
    main()
