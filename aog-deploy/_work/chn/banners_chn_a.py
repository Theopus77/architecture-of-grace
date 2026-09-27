"""AOG-CHN-V1 — drawn unit banners for the Chinese Classics course, units 1–9.
Built from _work/course/banner_kit.py plus the Chinese pieces below (ink
mountains, mist, pines, bamboo, pavilions, bamboo-slip scrolls, a guqin,
ritual bronzes, the taiji, a butterfly). Sages appear only as tiny, still,
respectful silhouettes far off. No lettering. Ids are prefixed "cnb{n}-".
banners_chn_b.py (units 10–17) imports the pieces from here."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
from banner_kit import *

# ---- Chinese pieces --------------------------------------------------------

def peaks(base, pts, fill, op="1"):
    """Tall rounded ink-painting peaks: pts = (x, height, half-width)."""
    out = ""
    for x, h, w in pts:
        out += ('<path d="M%d %d C%d %d %d %d %d %d C%d %d %d %d %d %d z"/>'
                % (x - w, base, x - w * .55, base - h * .45, x - w * .45, base - h, x, base - h,
                   x + w * .45, base - h, x + w * .6, base - h * .4, x + w, base))
    return '<g fill="%s" opacity="%s">%s</g>' % (fill, op, out)

def mist(p, y, h, c="#FFFFFF", op=".85", tag="m"):
    d = lin(p + tag, [(0, c, 0), (.5, c, op), (1, c, 0)])
    return d, '<rect x="0" y="%d" width="%d" height="%d" fill="url(#%s%s)"/>' % (y, W, h, p, tag)

def pine(x, y, s=1, c="#2E4A3A", trunk="#4A3A2E", flip=False):
    f = -1 if flip else 1
    return ('<g transform="translate(%d %d) scale(%s %s)"><path d="M0 0 q-6 -40 8 -70 q12 -26 4 -60" stroke="%s" stroke-width="9" fill="none" stroke-linecap="round"/>'
            '<path d="M8 -70 q30 -6 60 -20 M10 -100 q-30 -6 -54 -12 M12 -128 q20 -6 36 -10" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round"/>'
            '<g fill="%s"><ellipse cx="62" cy="-96" rx="42" ry="12"/><ellipse cx="-48" cy="-118" rx="38" ry="11"/><ellipse cx="44" cy="-140" rx="32" ry="10"/><ellipse cx="8" cy="-156" rx="28" ry="10"/></g></g>'
            ) % (x, y, s * f, s, trunk, trunk, c)

def bamboo(x, y, h, c="#4E7A4A", leaf="#3E6A3E", lean=0):
    segs = "".join('<path d="M-5 %d h10" stroke="%s" stroke-width="2"/>' % (-yy, "#2E4A2E") for yy in range(40, h, 44))
    lv = "".join('<path d="M0 %d q%d -6 %d %d q%d -2 %d %d z" fill="%s"/>' % (-yy, 14 * d, 34 * d, 6, -18 * d, -34 * d, -6, leaf)
                 for i, (yy, d) in enumerate([(h - 20, 1), (h - 40, -1), (h - 70, 1), (h - 100, -1), (h - 130, 1)]) if yy > 40)
    return '<g transform="translate(%d %d) rotate(%d)"><rect x="-4" y="%d" width="8" height="%d" rx="3" fill="%s"/>%s%s</g>' % (x, y, lean, -h, h, c, segs, lv)

def roof(w, y, c):
    """An upturned-eave tiled roof, centred on 0, eave line at y."""
    return ('<path d="M%d %d Q%d %d %d %d Q0 %d %d %d Q%d %d %d %d Q%d %d %d %d H%d Q%d %d %d %d z" fill="%s"/>'
            % (-w - 18, y - 16, -w + 6, y - 2, -w + 30, y - 6, y - 48, w - 30, y - 6, w - 6, y - 2, w + 18, y - 16,
               w - 4, y + 2, w - 16, y + 6, -w + 16, -w + 4, y + 2, -w - 18, y - 16, c))

def pavilion(x, y, s=1, col="#A8323A", rf="#2E3A3A", base="#C9B89A", tiers=1):
    out = '<g transform="translate(%d %d) scale(%s)"><rect x="-96" y="-14" width="192" height="14" fill="%s"/>' % (x, y, s, base)
    out += '<g fill="%s"><rect x="-80" y="-104" width="10" height="90"/><rect x="-30" y="-104" width="10" height="90"/><rect x="20" y="-104" width="10" height="90"/><rect x="70" y="-104" width="10" height="90"/></g>' % col
    out += '<path d="M-80 -40 h160" stroke="%s" stroke-width="4"/><rect x="-84" y="-112" width="168" height="10" fill="%s"/>' % (col, col)
    out += roof(100, -110, rf)
    if tiers > 1:
        out += '<rect x="-50" y="-164" width="100" height="36" fill="%s"/>' % col + roof(66, -162, rf)
    top = -150 if tiers == 1 else -206
    return out + '<path d="M0 %d v-14" stroke="%s" stroke-width="4"/><circle cx="0" cy="%d" r="5" fill="#D9B45A"/></g>' % (top + 6, rf, top - 10)

def hall(x, y, s=1, wallc="#A8323A", rf="#2E3A3A", door="#5A2A20"):
    """A temple or school hall: stone base, red walls, lattice doors, tiled roof."""
    lat = "".join('<rect x="%d" y="-70" width="30" height="56" fill="%s"/><path d="M%d -56 h30 M%d -42 h30 M%d -28 h30 M%d -70 v56" stroke="#D9B45A" stroke-width="1.5" opacity=".6"/>'
                  % (xx, door, xx, xx, xx, xx + 15) for xx in (-95, -55, 25, 65))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-150" y="-14" width="300" height="14" fill="#C9B89A"/><rect x="-124" y="-90" width="248" height="76" fill="%s"/>'
            '<rect x="-15" y="-74" width="30" height="60" fill="%s"/>%s%s</g>') % (x, y, s, wallc, door, lat, roof(150, -88, rf))

def slips(x, y, s=1, n=14, wood="#D8BC84", cord="#8A3A2A", ink=True, curl=True):
    """An unrolled bamboo-slip book: slats tied by two cords, rows of small ink dashes (not letters)."""
    out = '<g transform="translate(%d %d) scale(%s)">' % (x, y, s)
    for i in range(n):
        sx = i * 16
        out += '<rect x="%d" y="-120" width="13" height="120" rx="2" fill="%s"/><rect x="%d" y="-120" width="3" height="120" fill="#FFFFFF" opacity=".25"/>' % (sx, wood, sx + 2)
        if ink:
            out += '<g fill="#2A2420" opacity=".7">%s</g>' % "".join('<rect x="%d" y="%d" width="5" height="%d" rx="1"/>' % (sx + 4, yy, 4 + (i * 7 + yy) % 5) for yy in range(-110, -12, 12) if (i * 3 + yy) % 7)
    out += '<path d="M-4 -92 H%d M-4 -30 H%d" stroke="%s" stroke-width="3"/>' % (n * 16, n * 16, cord)
    if curl:
        out += '<g transform="translate(%d 0)"><rect x="0" y="-122" width="34" height="124" rx="16" fill="%s"/><rect x="6" y="-122" width="4" height="124" fill="#A8864E"/><rect x="16" y="-122" width="4" height="124" fill="#A8864E"/><rect x="26" y="-122" width="4" height="124" fill="#A8864E" opacity=".6"/></g>' % (n * 16 - 2, wood)
    return out + "</g>"

def slip_bundle(x, y, s=1, wood="#C9A870"):
    """A rolled bundle of bamboo slips tied with a cord, lying down."""
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-60" y="-30" width="120" height="30" rx="14" fill="%s"/>'
            '<g stroke="#8A6A3A" stroke-width="2">%s</g><path d="M-20 -30 v30 M24 -30 v30" stroke="#8A3A2A" stroke-width="4"/>'
            '<ellipse cx="60" cy="-15" rx="8" ry="15" fill="#B8945A"/></g>') % (x, y, s, wood, "".join('<path d="M-56 %d h112"/>' % yy for yy in (-24, -18, -12, -6)))

def thread_books(x, y, s=1, cols=("#2E4A6A", "#3A5A4A", "#6A2E2E", "#2E4A6A", "#4A3A5A")):
    """A stack of thread-bound books (blue covers, white stitching, side view)."""
    out = '<g transform="translate(%d %d) scale(%s)">' % (x, y, s)
    for i, c in enumerate(cols):
        yy = -14 - i * 15; dx = (i % 2) * 6 - 3
        out += '<rect x="%d" y="%d" width="120" height="14" fill="#EFE2C2"/><rect x="%d" y="%d" width="120" height="3" fill="%s"/><rect x="%d" y="%d" width="120" height="3" fill="%s"/>' % (dx, yy, dx, yy, c, dx, yy + 11, c)
        out += '<rect x="%d" y="%d" width="20" height="14" fill="%s"/>' % (dx - 2, yy, c)
    return out + "</g>"

def brush_ink(x, y, s=1):
    """An inkstone with a brush resting across it."""
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-34" y="-12" width="68" height="12" rx="3" fill="#2A2A30"/><ellipse cx="-6" cy="-12" rx="22" ry="4" fill="#0E0E14"/>'
            '<path d="M-60 -22 L70 -34" stroke="#8A6A3A" stroke-width="5" stroke-linecap="round"/><path d="M70 -34 l22 -2 l-20 -4z" fill="#1A1A1A"/></g>') % (x, y, s)

def guqin(x, y, s=1, body="#4A2A20", top="#6A3A28"):
    """The seven-string zither lying on a low table, with its thirteen inlaid studs."""
    strings = "".join('<path d="M-160 %d L170 %d"/>' % (-16 + i * 3, -16 + i * 3) for i in range(7))
    hui = "".join('<circle cx="%d" cy="-19" r="2" fill="#F2E6C8"/>' % (-120 + i * 20) for i in range(13))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-190 -22 Q-190 -30 -176 -30 H150 q10 0 14 -6 q8 6 20 6 q8 0 8 10 v4 q-2 14 -12 14 H-176 q-14 0 -14 -12z" fill="%s"/>'
            '<path d="M-176 -30 H150 q10 0 14 -6 q8 6 20 6" stroke="%s" stroke-width="3" fill="none"/><g stroke="#E8DCC0" stroke-width=".9" opacity=".85">%s</g>%s'
            '<rect x="-166" y="-24" width="6" height="12" fill="#D9B45A"/></g>') % (x, y, s, body, top, strings, hui)

def ding(x, y, s=1, c="#4E7A6A", hi="#7AA898", dark="#2E4A40"):
    """A three-legged ritual bronze cauldron, green with age; plain bands of pattern."""
    band = "".join('<path d="M%d -92 l6 -6 l6 6 l-6 6z" fill="%s"/>' % (xx, dark) for xx in range(-60, 60, 16))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-54 -40 L-64 0 h12 L-36 -40z M54 -40 L64 0 h-12 L36 -40z M-6 -40 L-4 0 h8 L6 -40z" fill="%s"/>'
            '<path d="M-74 -104 H74 q-4 60 -74 66 q-70 -6 -74 -66z" fill="%s"/><rect x="-78" y="-110" width="156" height="8" rx="3" fill="%s"/>'
            '<path d="M-60 -110 v-26 h18 v26 M42 -110 v-26 h18 v26" stroke="%s" stroke-width="7" fill="none"/>%s'
            '<path d="M-60 -76 q60 18 120 0" stroke="%s" stroke-width="2" fill="none" opacity=".7"/></g>') % (x, y, s, dark, c, hi, c, band, hi)

def taiji(x, y, r, a="#1E2A34", b="#F4EAD2", op="1"):
    h = r / 2
    return ('<g transform="translate(%d %d)" opacity="%s"><circle r="%d" fill="%s"/><path d="M0 %d A%d %d 0 0 1 0 %d A%.1f %.1f 0 0 1 0 0 A%.1f %.1f 0 0 0 0 %d z" fill="%s"/>'
            '<circle cy="%.1f" r="%.1f" fill="%s"/><circle cy="%.1f" r="%.1f" fill="%s"/><circle r="%d" fill="none" stroke="%s" stroke-width="3"/></g>') % (
        x, y, op, r, b, -r, r, r, r, h, h, h, h, -r, a, h, r / 7, a, -h, r / 7, b, r, a)

def butterfly(x, y, s=1, c="#E8903A", c2="#F2C964", rot=-12):
    return ('<g transform="translate(%d %d) scale(%s) rotate(%d)"><path d="M0 0 C-10 -40 -58 -52 -54 -18 C-52 -2 -20 0 0 0z" fill="%s"/><path d="M0 0 C10 -40 58 -52 54 -18 C52 -2 20 0 0 0z" fill="%s"/>'
            '<path d="M0 0 C-30 4 -44 30 -24 36 C-10 38 -2 16 0 0z" fill="%s"/><path d="M0 0 C30 4 44 30 24 36 C10 38 2 16 0 0z" fill="%s"/>'
            '<g fill="%s" opacity=".85"><circle cx="-32" cy="-24" r="7"/><circle cx="32" cy="-24" r="7"/></g>'
            '<ellipse cx="0" cy="6" rx="3" ry="16" fill="#2A2420"/><path d="M-1 -8 q-6 -14 -14 -18 M1 -8 q6 -14 14 -18" stroke="#2A2420" stroke-width="1.6" fill="none"/></g>') % (x, y, s, rot, c, c, c2, c2, c2)

def sage(x, y, s=1, c="#2A2A34", staff=False):
    """A tiny robed figure seen from behind, standing still (a respectful silhouette)."""
    st = '<path d="M16 0 L12 -64" stroke="%s" stroke-width="2.5"/>' % c if staff else ""
    return ('<g transform="translate(%d %d) scale(%s)" fill="%s"><path d="M-14 0 q2 -30 6 -44 q-4 -6 0 -10 h16 q4 4 0 10 q4 14 6 44z"/>'
            '<circle cx="0" cy="-60" r="6"/><path d="M-4 -66 h8 v-4 h-8z"/>%s</g>') % (x, y, s, c, st)

def ox_rider(x, y, s=1, c="#2A2A34"):
    """An ox walking west (to the left) with a tiny rider seated on it."""
    return ('<g transform="translate(%d %d) scale(%s %s)" fill="%s"><path d="M-40 -18 q0 -22 26 -24 h34 q16 0 22 10 l10 -2 q10 2 8 12 l-8 6 q-6 4 -12 2 l-6 10 v24 h-7 v-20 h-30 v20 h-7 v-20 h-8 v20 h-7 v-20 q-10 -6 -12 -14z"/>'
            '<path d="M44 -34 q8 -6 14 -2 M44 -34 q4 -8 10 -10" stroke="%s" stroke-width="2.5" fill="none"/>'
            '<path d="M-6 -42 q2 -22 6 -30 h10 q4 8 6 30z"/><circle cx="5" cy="-78" r="5"/></g>') % (x, y, -s, s, c, c)

def blossom_tree(x, y, s=1, trunk="#4A3A2E", bloom="#F2B8C0", bloom2="#FFFFFF"):
    """A spreading apricot or plum tree in flower."""
    g = rng(x + y); dots = ""
    for _ in range(70):
        dx = -130 + next(g) % 260; dy = -190 + next(g) % 90
        dots += '<circle cx="%d" cy="%d" r="%d" fill="%s"/>' % (dx, dy, 5 + next(g) % 6, bloom if next(g) % 3 else bloom2)
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-6 0 q-10 -60 10 -110 M2 -90 q-40 -30 -110 -60 M4 -110 q40 -40 110 -50 M0 -120 q-10 -40 -20 -70 M40 -130 q20 -30 60 -40"'
            ' stroke="%s" stroke-width="9" fill="none" stroke-linecap="round"/>%s</g>') % (x, y, s, trunk, dots)

def red_lantern(x, y, s=1, c="#C8323A"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M0 -30 v14" stroke="#3A2A1A" stroke-width="2"/><ellipse cx="0" cy="12" rx="44" ry="40" fill="#FFB060" opacity=".2"/>'
            '<rect x="-12" y="-18" width="24" height="6" fill="#D9B45A"/><ellipse cx="0" cy="12" rx="24" ry="26" fill="%s"/><path d="M0 -12 v50 M-12 -10 q-8 22 0 46 M12 -10 q8 22 0 46" stroke="#8A1E24" stroke-width="1.5" fill="none"/>'
            '<rect x="-10" y="36" width="20" height="5" fill="#D9B45A"/><path d="M0 41 v18 M-4 41 v14 M4 41 v14" stroke="#D9B45A" stroke-width="1.5"/></g>') % (x, y, s, c)

def full_moon(p, x, y, r=46, c="#FFF4D6"):
    d = rad(p + "fm", [(0, c, .6), (.5, c, .15), (1, c, 0)])
    return d, '<circle cx="%d" cy="%d" r="%d" fill="url(#%sfm)"/><circle cx="%d" cy="%d" r="%d" fill="%s"/><g fill="#E8D8B0" opacity=".6"><circle cx="%d" cy="%d" r="%d"/><circle cx="%d" cy="%d" r="%d"/></g>' % (
        x, y, r * 4, p, x, y, r, c, x - r // 3, y - r // 4, r // 5, x + r // 4, y + r // 3, r // 7)

def city_wall(x, y, w, s=1, c="#8A7A68", rf="#2E3434"):
    """A long city wall with crenellations and a gate tower (Zhou-era town)."""
    cren = "".join('<rect x="%d" y="-62" width="12" height="10"/>' % xx for xx in range(-w, w, 22))
    return ('<g transform="translate(%d %d) scale(%s)"><g fill="%s"><rect x="%d" y="-52" width="%d" height="52"/>%s</g>'
            '<path d="M-22 0 v-30 a22 22 0 0 1 44 0 v30z" fill="#2A2420"/><rect x="-60" y="-92" width="120" height="30" fill="#A8323A"/>%s</g>') % (
        x, y, s, c, -w, 2 * w, cren, roof(74, -92, rf))

def stone_well(x, y, s=1, c="#8A8478"):
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-44" y="-40" width="88" height="40" fill="%s"/><g stroke="#5A564E" stroke-width="2"><path d="M-44 -26 h88 M-44 -12 h88 M-20 -40 v14 M16 -26 v14 M-8 -12 v12"/></g>'
            '<ellipse cx="0" cy="-40" rx="44" ry="8" fill="#1E2226"/><path d="M-38 -40 v-50 M38 -40 v-50" stroke="#4A3A2E" stroke-width="6"/>%s</g>') % (x, y, s, c, '<g transform="translate(0 -52) scale(.55)">' + roof(80, -30, "#2E3A3A") + "</g>")

def sprouts(x, y, n=5, c="#6EA04A"):
    return "".join('<g transform="translate(%d %d)"><path d="M0 0 q-2 -16 0 -26" stroke="%s" stroke-width="3" fill="none"/><path d="M0 -20 q-16 -12 -20 -2 q10 6 20 2z M0 -24 q14 -14 20 -4 q-10 8 -20 4z" fill="%s"/></g>' % (x + i * 34, y - (i % 2) * 4, c, c) for i in range(n))

def crane(x, y, s=1, c="#F6F2E8"):
    """A crane gliding with wings out."""
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-60 0 q30 -30 60 -4 q30 -30 60 4 q-30 -10 -60 8 q-30 -18 -60 -8z" fill="%s"/>'
            '<path d="M0 4 l40 4 l10 -3 M0 4 l-36 6" stroke="%s" stroke-width="3" fill="none"/><path d="M-50 -2 q4 -6 10 -2" stroke="#2A2A2A" stroke-width="3" fill="none"/><circle cx="50" cy="5" r="2.5" fill="#C8323A"/></g>') % (x, y, s, c, c)

def sampan(x, y, s=1, c="#3A2E28", hood="#6A5440"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-70 -8 q70 22 140 0 l-10 10 q-60 14 -120 0z" fill="%s"/><path d="M-26 -8 q26 -34 52 0z" fill="%s"/>'
            '<path d="M60 -6 l30 -40" stroke="%s" stroke-width="2.5"/></g>') % (x, y, s, c, hood, c)

def bridge(x, y, w, s=1, c="#A89C8A"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M%d 0 Q0 %d %d 0 h-26 Q0 %d %d 0z" fill="%s"/>'
            '<path d="M%d -8 Q0 %d %d -8" stroke="#6A6258" stroke-width="3" fill="none"/></g>') % (
        x, y, s, -w, -w * .7, w, -w * .5, -w + 26, c, -w + 6, -w * .7 - 10, w - 6)

def low_table(x, y, w, top="#6A3A28", leg="#3A2018"):
    return '<rect x="%d" y="%d" width="%d" height="10" rx="3" fill="%s"/><path d="M%d %d v34 M%d %d v34" stroke="%s" stroke-width="10"/>' % (x - w // 2, y, w, top, x - w // 2 + 16, y + 10, x + w // 2 - 16, y + 10, leg)

def ink_sky(p, cols=("#E9E2D0", "#F4EEDF", "#EDE3CC")):
    return sky(p, list(cols))

def ink_landscape(p, s, far="#8A9AA4", mid="#5A6E78", near="#34464E", seed=1):
    """A layered ink landscape: far, middle and near peaks with mist between."""
    s.add(peaks(300, [(120, 200, 110), (330, 250, 120), (560, 170, 100), (840, 230, 130), (1080, 190, 110)], far, ".7"))
    s.add(mist(p, 180, 140, tag="m1"))
    s.add(peaks(330, [(40, 170, 110), (250, 210, 100), (980, 220, 120), (1180, 160, 110)], mid, ".85"))
    s.add(mist(p, 250, 110, tag="m2", op=".7"))
    return s

# ---- the banners -------------------------------------------------------------

CREDITS = {
    1: "Drawn scene: an apricot tree in flower beside an open pavilion, an unrolled bamboo book on a low table in front, far hills behind",
    2: "Drawn scene: a road winding west through a mountain pass with a gate tower, a tiny ox and rider far off, a gnarled old tree and a butterfly",
    3: "Drawn scene: a family courtyard house at New Year with red lanterns glowing, a stream flowing past under a small stone bridge",
    4: "Drawn scene: an unrolled bamboo-slip book on a desk beside a stack of thread-bound books, a brush and an inkstone",
    5: "Drawn scene: a red school hall with a green ritual bronze cauldron before it, young sprouts growing in the foreground",
    6: "Drawn scene: misty ink mountains and a waterfall into a still lake, a pale taiji circle in the sky and a plain uncarved stone on the shore",
    7: "Drawn scene: a full moon over a lake, a two-storey pavilion on the shore, red lanterns strung along the water",
    8: "Drawn scene: a walled city of the Zhou age with a gate tower, roads leading out in many directions, bundles of bamboo books in the foreground",
    9: "Drawn scene: a scholar's table with four thread-bound books and five bamboo scrolls, a stone well and green sprouts in the garden beyond",
}

def b1(p):
    s = Scene(p); s.add(sky(p, ["#B8D4E0", "#E4EEE8", "#F6EFDC"]))
    s.add(peaks(300, [(160, 150, 120), (420, 190, 110), (1000, 170, 130)], "#9AAEB4", ".7"), mist(p, 220, 100, tag="m1"))
    s.add(ground(300, "#A8B884"), pavilion(830, 318, 1.15))
    s.add(blossom_tree(300, 330, 1.25), ground(340, "#8AA06A"))
    s.add(low_table(600, 356, 380), slips(470, 356, .9, 13))
    return s.svg(CREDITS[1])

def b2(p):
    s = Scene(p); s.add(sky(p, ["#F2C89A", "#F6E2C0", "#EEE6D2"]), sun(p, 150, 150, 30, "#FFF2D0", "#F6C890"))
    s.add(peaks(290, [(90, 180, 120), (300, 240, 120)], "#9A8A86", ".7"), peaks(290, [(760, 250, 130), (990, 200, 120), (1160, 220, 100)], "#8E8480", ".75"))
    s.add(mist(p, 200, 100, c="#F8EEDC", tag="m1"))
    s.add(ridge(300, 10, 11, "#B8A884"), city_wall(560, 300, 150, .6, "#8A7A68"))
    s.add('<path d="M560 300 Q420 330 300 312 Q160 296 0 318" stroke="#E6D2A8" stroke-width="14" fill="none"/>', ox_rider(300, 312, .5))
    s.add(ground(350, "#8A8A5A"), pine(1000, 380, 1.3, "#3E4E3A", flip=True), butterfly(780, 180, 1.1))
    return s.svg(CREDITS[2])

def b3(p):
    s = Scene(p); s.add(sky(p, ["#10203A", "#2A3A62", "#5A5A80"]), stars(33, 90, 150, op=".6"), moon(1060, 70, 20))
    s.add(peaks(260, [(150, 120, 140), (1000, 110, 160)], "#34405A", ".9"), ground(260, "#3A4232"))
    s.add(glow(p, 600, 190, 260, "#FFB060", ".35"), hall(600, 262, 1.25, "#9A2E32", "#1E2426", "#F2C070"))
    s.add('<path d="M330 56 Q600 96 870 56" stroke="#1A1410" stroke-width="2" fill="none"/>', red_lantern(390, 96, .8), red_lantern(500, 110, .8), red_lantern(700, 110, .8), red_lantern(810, 96, .8))
    s.add(water(p, 320, "#3A5A7A", "#1E3048"), bridge(900, 340, 90, 1, "#8A8478"), ground(390, "#2A3226"))
    return s.svg(CREDITS[3])

def b4(p):
    s = Scene(p); s.add(wall(p, "#E6DCC4", "#CDBE9E"), window(p, 1000, 250, 140, 190, ("#E4EEE8", "#B8D4E0", "#8AAEC0"), "#6A3A28"))
    s.add(bamboo(960, 250, 170, "#5E8A5A", "#3E6A3E", -4), bamboo(1050, 250, 150, "#5E8A5A", "#3E6A3E", 5))
    s.add(table(300, "#6A3A28", "#3A2018"), slips(260, 300, 1.4, 16), thread_books(40, 300, 1.2), brush_ink(820, 300, 1.2), slip_bundle(1080, 300, .8))
    return s.svg(CREDITS[4])

def b5(p):
    s = Scene(p); s.add(sky(p, ["#9CC0D8", "#DCE8E8", "#F4EEDC"]), peaks(260, [(120, 140, 130), (1080, 150, 140)], "#A4B4B8", ".7"))
    s.add(ground(270, "#C8BC9C"), hall(600, 272, 1.5), pine(170, 290, 1.1), pine(1030, 290, 1.1, flip=True))
    s.add('<rect y="300" width="1200" height="120" fill="#D8CCAE"/>', '<path d="M0 300 H1200" stroke="#B8A888" stroke-width="3"/>')
    s.add(glow(p, 600, 300, 140, "#FFF4D0", ".4"), ding(600, 400, 1.1), sprouts(160, 404, 5), sprouts(900, 404, 5))
    return s.svg(CREDITS[5])

def b6(p):
    s = Scene(p); s.add(ink_sky(p), taiji(930, 110, 56, "#3A4A54", "#F8F2E4", ".55"))
    s.add(peaks(310, [(120, 210, 110), (360, 260, 110), (700, 190, 110)], "#8A9AA4", ".75"), mist(p, 170, 150, c="#F4EEDF", tag="m1"))
    s.add('<path d="M352 110 q6 90 -4 200" stroke="#FFFFFF" stroke-width="10" fill="none" opacity=".8"/>')
    s.add(peaks(320, [(40, 160, 110), (280, 150, 90), (1150, 200, 120)], "#4A5E68", ".9"))
    s.add(water(p, 312, "#C8D8DC", "#8AAAB4"), '<path d="M500 380 q20 -40 70 -40 q60 0 70 40z" fill="#A89C8A"/><path d="M540 350 q30 -8 60 4" stroke="#C8BEAC" stroke-width="3" fill="none"/>')
    s.add(pine(90, 380, .9, "#2E3E3A"), sampan(860, 360, .9))
    return s.svg(CREDITS[6])

def b7(p):
    s = Scene(p); s.add(sky(p, ["#0E1A34", "#223A60", "#3A4E78"]), stars(77, 80, 180, op=".5"), full_moon(p, 820, 110, 50))
    s.add(peaks(290, [(220, 130, 150), (1100, 120, 140)], "#26344E", ".95"))
    s.add(water(p, 290, "#2E4A70", "#14223A"), '<g stroke="#FFF4D6" stroke-linecap="round" opacity=".5"><path d="M790 306 h60" stroke-width="4"/><path d="M800 322 h40" stroke-width="3"/><path d="M784 340 h72" stroke-width="3"/><path d="M806 360 h28" stroke-width="2"/><path d="M796 380 h48" stroke-width="2"/></g>')
    s.add(pavilion(330, 300, 1.1, "#9A2E32", "#141C26", "#6A6A6A", tiers=2))
    s.add('<path d="M0 30 Q300 70 640 34" stroke="#8A7A6A" stroke-width="2" fill="none"/>',
          red_lantern(80, 54, .6), red_lantern(200, 64, .6), red_lantern(460, 64, .6), red_lantern(580, 52, .6))
    s.add(sampan(640, 350, .8, "#1A1E28", "#2A2E38"), ground(400, "#141C26"))
    return s.svg(CREDITS[7])

def b8(p):
    s = Scene(p); s.add(sky(p, ["#C8B89A", "#E8DCC0", "#F2EAD6"]), peaks(250, [(150, 130, 160), (500, 110, 140), (900, 140, 170)], "#A89A86", ".6"))
    s.add(ground(250, "#C0AA84"), city_wall(600, 256, 260, .8, "#8A7460", "#2A2A28"))
    roads = "".join('<path d="M600 262 Q%d %d %d 420" stroke="#E4D2AA" stroke-width="%d" fill="none"/>' % ((600 + ex) // 2, 330, ex, w) for ex, w in ((-100, 16), (200, 14), (430, 12), (780, 12), (1000, 14), (1300, 16)))
    s.add(roads, tree(120, 300, .7, "#6A7A4A", "#8A9A5A"), tree(1080, 300, .7, "#6A7A4A", "#8A9A5A"))
    s.add(slip_bundle(160, 400, 1), slip_bundle(250, 376, .8), slip_bundle(1040, 400, 1))
    return s.svg(CREDITS[8])

def b9(p):
    s = Scene(p); s.add(wall(p, "#3A2A22", "#2A1C16"), window(p, 420, 250, 360, 210, ("#F4EEDC", "#C8DCC8", "#9CC0D8"), "#6A3A28"))
    s.d.append('<clipPath id="%sarch"><path d="M420 250 V220 a180 180 0 0 1 360 0 V250z"/></clipPath>' % p)
    s.add('<g clip-path="url(#%sarch)">' % p, peaks(250, [(520, 90, 90), (700, 120, 100)], "#A4B8BC", ".7"), '<rect x="420" y="228" width="360" height="22" fill="#9AB07A"/>')
    s.add(stone_well(520, 250, .9), sprouts(600, 246, 4), bamboo(720, 250, 170, "#5E8A5A", "#3E6A3E", 3), "</g>")
    s.add(table(300, "#6A3A28", "#3A2018"))
    s.add(thread_books(90, 300, 1.4, ("#2E4A6A", "#6A2E2E", "#3A5A4A", "#4A3A5A")))
    s.add("".join(slip_bundle(960 + (i % 2) * 30, 300 - i * 28, .9) for i in range(5)))
    s.add(brush_ink(560, 300, 1.1))
    return s.svg(CREDITS[9])

BANNERS = {n: globals()["b%d" % n]("cnb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
