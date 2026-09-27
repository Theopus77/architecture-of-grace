#!/usr/bin/env python3
"""AOG-SKETCH-ICONS-V1 (2026-09-27) — Jimmy: "Get rid of the emojis, make everything sketch worthy."
Turns each rendered picture (render.js → <codepoints>.png) into a graphite drawing on transparent:
a firm outline, inner contour lines, and diagonal hatching (cross-hatching in the darkest places),
in warm pencil grey. Writes img/sketch/<codepoints>.webp (160 px) for the pages to show instead of
the emoji.   python3 make_sketch.py <in_dir> <out_dir>"""
import sys, os, numpy as np
from PIL import Image
from scipy import ndimage as ndi
IN, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
S = 300
yy, xx = np.mgrid[0:S, 0:S]
rng = np.random.default_rng(3)
def lines(angle, period, width=1.1):
    a = np.deg2rad(angle); d = xx * np.cos(a) + yy * np.sin(a)
    d = d + ndi.gaussian_filter(rng.standard_normal((S, S)), 6) * 2.2      # a hand's wobble
    ph = np.mod(d, period); return np.clip(1 - np.abs(ph - period / 2) / width, 0, 1)
H1, H2, H3 = lines(38, 5.2), lines(-52, 6.0), lines(38, 2.8, .9)
for f in sorted(os.listdir(IN)):
    if not f.endswith(".png"): continue
    im = np.asarray(Image.open(os.path.join(IN, f)).convert("RGBA")).astype(float) / 255
    a = im[..., 3]; rgb = im[..., :3]
    if a.max() == 0: continue
    L = (0.3 * rgb[..., 0] + 0.59 * rgb[..., 1] + 0.11 * rgb[..., 2])
    L = np.where(a > .05, L, 1.0)
    Ls = ndi.gaussian_filter(L, 1.2)
    tone = 1 - Ls                                                          # 0 paper … 1 dark
    # contours: edges of the shape and of colour regions
    gx, gy = ndi.sobel(Ls, 1), ndi.sobel(Ls, 0); edge = np.hypot(gx, gy)
    edge = np.clip((edge - .08) * 3.2, 0, 1)
    sil = np.hypot(ndi.sobel(ndi.gaussian_filter(a, 1.0), 1), ndi.sobel(ndi.gaussian_filter(a, 1.0), 0))
    sil = np.clip(sil * 1.6, 0, 1)
    # hatching by tone: light single lines, mid double, dark cross-hatch
    hatch = H1 * np.clip((tone - .12) * 2.2, 0, 1) + H2 * np.clip((tone - .38) * 2.4, 0, 1) + H3 * np.clip((tone - .62) * 2.6, 0, .9)
    ink = np.clip(np.maximum.reduce([edge * .9, sil, hatch * .75]), 0, 1)
    grain = ndi.gaussian_filter(rng.random((S, S)), .7)
    ink = ink * (.78 + .32 * grain)
    ink = np.where(a > .02, ink, sil * .9)
    alpha = np.clip(ink * 1.15, 0, 1)
    # paper fill inside the shape so the drawing reads on any background
    paper = np.clip(ndi.gaussian_filter(a, 1.5) * .9, 0, 1) * (a > .3)
    col = np.array([0.20, 0.19, 0.17])[None, None, :]                       # warm graphite
    pap = np.array([0.985, 0.972, 0.94])[None, None, :]
    out_a = np.clip(paper + alpha * (1 - paper), 0, 1)
    out_rgb = (col * alpha[..., None] + pap * (paper * (1 - alpha))[..., None]) / np.maximum(out_a[..., None], 1e-4)
    img = Image.fromarray((np.dstack([out_rgb, out_a]) * 255).astype(np.uint8), "RGBA")
    bb = img.getbbox()
    if bb:
        pad = 8; img = img.crop((max(bb[0]-pad,0), max(bb[1]-pad,0), min(bb[2]+pad,S), min(bb[3]+pad,S)))
    w, h = img.size; k = 160 / max(w, h); img = img.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    img.save(os.path.join(OUT, f[:-4] + ".webp"), "WEBP", quality=82, method=6)
print("done", len(os.listdir(OUT)))
