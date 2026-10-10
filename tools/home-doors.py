#!/usr/bin/env python3
"""Front-page door drawings: turn Jimmy's pencil sheets into the doors' banners.

The front page shows one pencil drawing on each door (Today, Daily Drafts, ...).
The Recording Studio's door is cut from Jimmy's "The Music Rooms" sheet. This
tool does the same for every other door, so all the doors read as one hand.

    python3 tools/home-doors.py SHEET [SHEET ...]     # cut, then preview
    python3 tools/home-doors.py SHEET ... --apply     # also swap the doors

A sheet is a page of drawings in rows, read left to right, top to bottom, in
the order of DOORS below (sheet 1 holds the first eight, sheet 2 the rest). The
navy title and labels are ignored. A single drawing named after its door
(today.jpg, contact.png ...) is used as it is.

Each door gets img/banners/home-<door>-pencil-{1600.webp,900.webp,900.jpg}:
the drawing multiplied onto paper #F6F2E8, about 84% of the banner's height,
at most 46% of its width, centred 60% across (the music rooms' recipe).
--apply points index.html and aog-topbar.js at the new files and bumps sw.js.
The old banners stay: other pages still use them.
"""
import os, re, sys, time
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "aog-deploy")
BAN = os.path.join(ROOT, "img", "banners")

# Front-page order. The Recording Studio keeps Jimmy's music sheet drawing.
DOORS = ["today", "drafts", "bench", "checkin", "talk", "courses", "sel", "faith",
         "families", "dashboard", "crosswalk", "pd", "privacy", "contact", "quiet"]

PAPER = np.array([0xF6, 0xF2, 0xE8], dtype=np.float32)
W, H = 1600, 560


def ink_mask(a):
    """Pencil marks: darker than the paper and grey, not the navy lettering."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = .299 * r + .587 * g + .114 * b
    paper = np.percentile(lum, 90)
    navy = (b - r > 8) & (lum < paper - 8)
    # Grow the lettering a little so its soft edges go with it.
    navy = np.asarray(Image.fromarray((navy * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    return (lum < paper - 22) & ~navy, navy


def drawings_on(path):
    """Boxes (x0, y0, x1, y1) of each drawing on a sheet, in reading order."""
    im = Image.open(path).convert("RGB")
    a = np.asarray(im, dtype=np.float32)
    ink, _ = ink_mask(a)
    # Join the strokes of one drawing; keep drawings apart.
    s = max(im.size) / 1700
    m = Image.fromarray((ink * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
    m = m.filter(ImageFilter.GaussianBlur(9 * s)).point(lambda v: 255 if v > 12 else 0)
    lab = label(np.asarray(m) > 0)
    boxes = []
    for i in range(1, lab.max() + 1):
        ys, xs = np.nonzero(lab == i)
        if len(xs) < 0.004 * ink.size:
            continue
        sub = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        if sub.mean() < .01:
            continue
        boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    # Rows: drawings whose vertical centres sit close together.
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows, cur = [], []
    for b in boxes:
        if cur and (b[1] + b[3]) / 2 - (cur[-1][1] + cur[-1][3]) / 2 > .5 * min(b[3] - b[1], cur[-1][3] - cur[-1][1]):
            rows.append(cur); cur = []
        cur.append(b)
    if cur:
        rows.append(cur)
    return im, [b for r in rows for b in sorted(r, key=lambda b: b[0])]


def label(m):
    """Connected regions of a boolean mask (4-neighbour), no scipy needed."""
    h, w = m.shape
    lab = np.zeros((h, w), np.int32)
    n = 0
    for y0, x0 in zip(*np.nonzero(m)):
        if lab[y0, x0]:
            continue
        n += 1
        stack = [(y0, x0)]
        lab[y0, x0] = n
        while stack:
            y, x = stack.pop()
            for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= yy < h and 0 <= xx < w and m[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n
                    stack.append((yy, xx))
    return lab


def banner(im, box):
    """The drawing multiplied onto paper, placed as the music rooms are."""
    x0, y0, x1, y1 = box
    pad = int(.02 * max(x1 - x0, y1 - y0))
    crop = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
    a = np.asarray(crop, dtype=np.float32)
    _, navy = ink_mask(a)
    lum = a.mean(axis=2)
    paper = np.percentile(lum, 90)
    k = np.clip(lum / paper / .95, 0, 1)    # 1 = paper, darker = pencil
    k[navy] = 1                             # drop any label that crept in
    # Fade the edges of the cut so no box shows on the new paper.
    h, w = k.shape
    fy = np.clip(np.minimum(np.arange(h), np.arange(h)[::-1]) / max(1, pad), 0, 1)
    fx = np.clip(np.minimum(np.arange(w), np.arange(w)[::-1]) / max(1, pad), 0, 1)
    k = 1 - (1 - k) * np.minimum.outer(fy, fx)
    sc = min(.84 * H / k.shape[0], .46 * W / k.shape[1])
    tile = Image.fromarray((k * 255).astype(np.uint8)).resize(
        (max(1, round(k.shape[1] * sc)), max(1, round(k.shape[0] * sc))), Image.LANCZOS)
    full = np.ones((H, W), np.float32)
    t = np.asarray(tile, dtype=np.float32) / 255
    cx, cy = round(.60 * W - t.shape[1] / 2), round((H - t.shape[0]) / 2)
    full[cy:cy + t.shape[0], cx:cx + t.shape[1]] = t
    return Image.fromarray((full[..., None] * PAPER).clip(0, 255).astype(np.uint8))


def save(door, img):
    base = os.path.join(BAN, "home-%s-pencil-" % door)
    img.save(base + "1600.webp", quality=82, method=6)
    small = img.resize((900, 315), Image.LANCZOS)
    small.save(base + "900.webp", quality=80, method=6)
    small.save(base + "900.jpg", quality=84, optimize=True, progressive=True)


def apply(doors):
    idx = os.path.join(ROOT, "index.html")
    s = open(idx, encoding="utf-8").read()
    for d in doors:
        s, n = re.subn(r'(data-door="%s"[^>]*><span class="aogdn-pic"[^>]*><img src=")[^"]+(")' % d,
                       r"\g<1>/img/banners/home-%s-pencil-900.webp\2" % d, s, count=1)
        if not n:
            print("  index.html: no door", d)
    open(idx, "w", encoding="utf-8").write(s)
    top = os.path.join(ROOT, "aog-topbar.js")
    s = open(top, encoding="utf-8").read()
    for d in doors:
        s, n = re.subn(r'(\{"id":"%s",[^{}]*?"img":")[^"]+(")' % d,
                       r"\g<1>/img/banners/home-%s-pencil-900.webp\2" % d, s, count=1)
        if not n:
            print("  aog-topbar.js: no door", d)
    open(top, "w", encoding="utf-8").write(s)
    sw = os.path.join(ROOT, "sw.js")
    s = open(sw, encoding="utf-8").read()
    m = re.search(r"^const CACHE = 'aog-cache-[\d.]+\.m(\d+)'.*$", s, re.M)
    if m:
        n = int(m.group(1)) + 1
        new = ("const CACHE = 'aog-cache-%s.m%d'   // THE FRONT PAGE'S DOORS: JIMMY'S PENCIL DRAWINGS"
               " (%s) (previous: m%s)" % (time.strftime("%Y.%m.%d"), n, ", ".join(doors).upper(), m.group(1)))
        s = s[:m.start()] + new + "\n// " + s[m.start():]
        open(sw, "w", encoding="utf-8").write(s)
        print("  sw.js CACHE m%d" % n)


def main(args):
    do_apply = "--apply" in args
    paths = [a for a in args if not a.startswith("--")]
    if not paths:
        sys.exit(__doc__)
    queue, done = list(DOORS), []
    for p in paths:
        name = os.path.splitext(os.path.basename(p))[0].lower()
        if name in DOORS:
            im = Image.open(p).convert("RGB")
            _, boxes = drawings_on(p)
            x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes)
            x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
            save(name, banner(im, (x0, y0, x1, y1)))
            done.append(name)
            if name in queue:
                queue.remove(name)
            continue
        im, boxes = drawings_on(p)
        print("%s: %d drawings" % (p, len(boxes)))
        for b in boxes:
            if not queue:
                break
            d = queue.pop(0)
            save(d, banner(im, b))
            done.append(d)
            print("  %-10s from box %s" % (d, b))
    if not done:
        sys.exit("No drawings found.")
    # A contact sheet to check the cut before anything changes on the site.
    tiles = [Image.open(os.path.join(BAN, "home-%s-pencil-900.jpg" % d)) for d in done]
    sheet = Image.new("RGB", (900 * 2, 315 * ((len(tiles) + 1) // 2)), "white")
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % 2) * 900, (i // 2) * 315))
    prev = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "home-handoff", "preview.jpg")
    os.makedirs(os.path.dirname(prev), exist_ok=True)
    sheet.save(prev, quality=85)
    print("Preview:", os.path.normpath(prev), "(" + ", ".join(done) + ")")
    if do_apply:
        apply(done)
        print("Doors now use the new drawings. Run tools/check-contrast.js and check-calm.js on index.html.")


if __name__ == "__main__":
    main(sys.argv[1:])
