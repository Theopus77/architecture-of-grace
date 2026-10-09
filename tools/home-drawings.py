#!/usr/bin/env python3
"""Jimmy's front-page drawings (2026-10-09) as the site's banners.

    python3 tools/home-drawings.py

Each drawing in home-handoff/drawings/ replaces the banner its front-page door
used, under the same names (img/banners/<banner>-pencil-{1600.webp,900.webp,900.jpg}),
so every page that shows that banner gets the new drawing. The drawing's paper is
matched to the site's paper (#F6F2E8), it fills the banner's height, sits 64%
across like the music rooms, and its edges fade into the paper.
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "home-handoff", "drawings")
BAN = os.path.join(HERE, "..", "aog-deploy", "img", "banners")
PAPER = np.array([0xF6, 0xF2, 0xE8], np.float32)
W, H = 1600, 560

# drawing -> the banner the door (and every other page) already uses
MAP = {
    "today-open-book": "page-selfreflect",
    "daily-drafts-calendar": "page-daily-drops",
    "recording-studio-mixer": "music-studio",
    "lab-bench-microscope": "page-microscope",
    "checkin-watering-can": "sel12-u2",
    "conversation-starters-tea": "page-door-talk",
    "courses-arch-microscope": "page-door-atrium",
    "sel-mirror": "sel12-u1",
    "faith-texts": "page-door-faith",
    "families-plant-lantern": "page-door-porch",
    "educator-dashboard": "page-dashboard",
    "standards-crosswalk": "page-door-crosswalk",
    "professional-development": "page-door-pd",
    "privacy-locked-book": "page-door-privacy",
    "contact-ink-bottle": "page-door-contact",
}


def ramp(n, edge):
    r = np.ones(n, np.float32)
    k = np.linspace(0, 1, edge, dtype=np.float32)
    k = k * k * (3 - 2 * k)
    r[:edge] = k
    r[-edge:] = k[::-1]
    return r


def banner(path):
    im = Image.open(path).convert("RGB")
    im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
    a = np.asarray(im, np.float32)
    # Match the drawing's paper to the site's paper; graphite keeps its value.
    paper = np.percentile(a.reshape(-1, 3), 92, axis=0)
    a = np.clip(a / paper, 0, 1) * PAPER
    h, w = a.shape[:2]
    alpha = np.minimum.outer(ramp(h, 36), ramp(w, int(w * .14)))[..., None]
    out = np.ones((H, W, 3), np.float32) * PAPER
    x0 = round(.64 * W - w / 2)       # whole drawing inside the doors' window (object-position 88%)
    out[:, x0:x0 + w] = out[:, x0:x0 + w] * (1 - alpha) + a * alpha
    return Image.fromarray(out.clip(0, 255).astype(np.uint8))


for src, name in MAP.items():
    img = banner(os.path.join(SRC, src + ".jpg"))
    base = os.path.join(BAN, name + "-pencil-")
    img.save(base + "1600.webp", quality=86, method=6)
    small = img.resize((900, 315), Image.LANCZOS)
    small.save(base + "900.webp", quality=84, method=6)
    small.save(base + "900.jpg", quality=88, optimize=True, progressive=True)
    print(src, "->", name)
