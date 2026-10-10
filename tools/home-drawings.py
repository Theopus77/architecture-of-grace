#!/usr/bin/env python3
"""Jimmy's front-page drawings (2026-10-09) as the site's banners.

    python3 tools/home-drawings.py

Each drawing in home-handoff/drawings/ replaces the banner its front-page door
used (the check-in slips and Quiet Space get banners of their own, wired by wire()), under the same names (img/banners/<banner>-pencil-{1600.webp,900.webp,900.jpg}),
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
    # These had borrowed other pages' banners, so they get banners of their own.
    "weekly-checkin": "slip-weekly",
    "end-of-class": "slip-endclass",
    "before-a-test": "slip-test",
    "after-a-test": "slip-posttest",
    "goal-check": "slip-goal",
    "group-work": "slip-team",
    "end-of-unit": "slip-unit",
    "after-hard-moment": "slip-repair",
    "school-checklist": "slip-school",
    "grace-point-sheet": "slip-points",
    "evening-checkin-home": "slip-home",
    "morning-note-home": "slip-morning",
    "homework-note": "slip-homework",
    "home-checklist": "slip-homecheck",
    "bedtime-checklist": "slip-bedtime",
    "quiet-space": "quiet-space",
}

# Where the front page shows those own banners: each check-in slip's card (by its
# link) and the Quiet Space door. The grace point sheet serves school and home.
SLIPS = {s: "slip-" + s for s in ("weekly endclass test posttest goal team unit repair "
                                    "school points home morning homework homecheck bedtime").split()}
SLIPS["homepoints"] = "slip-points"


def wire():
    import re
    idx = os.path.join(HERE, "..", "aog-deploy", "index.html")
    s = open(idx, encoding="utf-8").read()
    for slip, name in SLIPS.items():
        pat = r'(<li><a href="/slip\.html\?s=%s"><span class="aogdn-cpic"[^>]*><picture>.*?</picture>)' % slip
        # Every card for this slip (the page lists them in more than one place).
        s, n = re.subn(pat, lambda m: re.sub(r"/img/banners/[a-z0-9-]+-pencil-900\.",
                                              "/img/banners/%s-pencil-900." % name, m.group(1)), s)
        if not n:
            print("  no card for slip", slip)
    s, n = re.subn(r'(data-door="quiet"[^>]*><span class="aogdn-pic"[^>]*><img src=")/img/banners/[a-z0-9-]+-pencil-900\.',
                   r"\g<1>/img/banners/quiet-space-pencil-900.", s, count=1)
    if not n:
        print("  no Quiet Space door")
    open(idx, "w", encoding="utf-8").write(s)


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
wire()
