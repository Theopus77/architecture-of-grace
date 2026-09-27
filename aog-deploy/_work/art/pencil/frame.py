#!/usr/bin/env python3
"""Fit a still scene's camera to the framing rule (see GUIDE.md).

  python3 frame.py <id> [--box 0.46,0.06,0.96,0.64] [--iters 3]

Renders small id buffers with ../kit/gbuf.js, measures the box around every object that is not
background (ids 0, 1, 2 unless the scene lists more with // @bg 0,1,2,7), then dollies and pans
the camera (CAM_POS and CAM_TGT in kit/scenes/<id>-still.glsl) until that box matches the target:
x from 44% to 90% at most, top at 6% and bottom at 64% of the frame. It keeps the viewing angle,
so the drawing's perspective does not change, only its size and place."""
import os, re, sys, math, subprocess, tempfile
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, '..', 'kit')

def v3(s, k): return np.array([float(x) for x in re.search(r'#define ' + k + r'\s+vec3\(([^)]*)\)', s).group(1).split(',')])

def measure(uid, tmp):
    subprocess.run(['node', 'gbuf.js', uid + '-still', tmp, '400', '140'], cwd=KIT, capture_output=True)
    d = np.asarray(Image.open(os.path.join(tmp, uid + '-still-d.png')).convert('RGB'))
    ids = d[..., 1].astype(int)
    src = open(os.path.join(KIT, 'scenes', uid + '-still.glsl')).read()
    m = re.search(r'@bg\s+([\d,]+)', src); bg = [int(x) for x in m.group(1).split(',')] if m else [0, 1, 2]
    ys, xs = np.nonzero(~np.isin(ids, bg))
    H, W = ids.shape
    return xs.min() / W, ys.min() / H, (xs.max() + 1) / W, (ys.max() + 1) / H

def main():
    uid = sys.argv[1]
    box = [0.44, 0.06, 0.90, 0.64]; iters = 3
    for i, a in enumerate(sys.argv):
        if a == '--box': box = [float(x) for x in sys.argv[i + 1].split(',')]
        if a == '--iters': iters = int(sys.argv[i + 1])
    f = os.path.join(KIT, 'scenes', uid + '-still.glsl')
    tmp = tempfile.mkdtemp()
    for it in range(iters):
        x0, y0, x1, y1 = measure(uid, tmp)
        print('%s pass %d: box x %.2f-%.2f y %.2f-%.2f' % (uid, it, x0, x1, y0, y1))
        s = open(f).read(); cp, ct = v3(s, 'CAM_POS'), v3(s, 'CAM_TGT')
        fov = float(re.search(r'#define CAM_FOV\s+([\d.]+)', s).group(1))
        fw = ct - cp; d = np.linalg.norm(fw); fw /= d
        r = np.cross([0, 1, 0], fw); r /= np.linalg.norm(r); u = np.cross(fw, r)
        # scale: fit height to the target height, and width to at most the target width
        sc = min((box[3] - box[1]) / (y1 - y0), (box[2] - box[0]) / (x1 - x0) * 1.0)
        sc = float(np.clip(sc, .6, 1.8))
        # centre offset in frame units, turned into metres at the subject distance
        k = math.tan(math.radians(fov) / 2); hh = k * d; hw = hh * 1600 / 560
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if sc * (x1 - x0) < (box[2] - box[0]) - .01: tx = .68   # narrow group: centre it on the right-hand third line
        else: tx = (box[0] + box[2]) / 2
        ty = (box[1] + box[3]) / 2
        dx = (cx - tx) * 2 * hw; dy = -(cy - ty) * 2 * hh
        shift = r * dx + u * dy
        nd_ = d / sc
        ct2 = ct + shift; cp2 = ct2 - fw * nd_
        s = re.sub(r'#define CAM_POS vec3\([^)]*\)', '#define CAM_POS vec3(%.4f,%.4f,%.4f)' % tuple(cp2), s)
        s = re.sub(r'#define CAM_TGT vec3\([^)]*\)', '#define CAM_TGT vec3(%.4f,%.4f,%.4f)' % tuple(ct2), s)
        open(f, 'w').write(s)
    x0, y0, x1, y1 = measure(uid, tmp)
    print('%s final: box x %.2f-%.2f y %.2f-%.2f' % (uid, x0, x1, y0, y1))

if __name__ == '__main__':
    main()
