"""AOG-HIN-V1 — drawn unit banners for the Hindu Texts course, units 1–9.
Built from _work/course/banner_kit.py plus the Indian pieces below (diya,
temple, ghats, palm-leaf manuscript, banyan, cow, deer, chariot, conch, Om).
No people, no figure of any deity, no lettering. Ids prefixed "hnb{n}-".
banners_hin_b.py imports the pieces from here."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
from banner_kit import *

# ---- Indian pieces ---------------------------------------------------------

def diya(x, y, s=1, body="#B8603A", rim="#8A3E24", halo=True):
    """A small clay diya with a still flame."""
    h = '<ellipse cx="0" cy="-26" rx="22" ry="30" fill="#FFD27A" opacity=".28"/>' if halo else ""
    return ('<g transform="translate(%d %d) scale(%s)">%s<path d="M-24 -8 q24 22 48 0 q-4 -4 -12 -6 q2 -6 -12 -8 q-14 2 -12 8 q-8 2 -12 6z" fill="%s"/>'
            '<path d="M-24 -8 q24 10 48 0" stroke="%s" stroke-width="2.5" fill="none"/><path d="M0 -14 q-8 -12 0 -30 q8 18 0 30z" fill="#F0923A"/>'
            '<path d="M0 -16 q-4 -7 0 -17 q4 10 0 17z" fill="#FFF3C0"/></g>') % (x, y, s, h, body, rim)

def diya_row(x, y, n, gap, s=1, dy=0):
    return "".join(diya(x + i * gap, y + i * dy, s) for i in range(n))

def temple(x, y, s=1, c="#E2C08A", shade="#B8905A", flag="#E4702A", door="#4A2A1A"):
    """A north-Indian stone temple: plinth, porch with a small roof and a tall banded tower, a plain pennant. No images."""
    bands = "".join('<path d="M%d %d h%d" stroke="%s" stroke-width="3"/>' % (-44 + i * 3, -120 - i * 22, 88 - i * 6, shade) for i in range(8))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-120" y="-18" width="240" height="18" fill="%s"/><rect x="-104" y="-30" width="208" height="12" fill="%s"/>'
            '<path d="M-54 -30 V-110 Q-58 -210 0 -300 Q58 -210 54 -110 V-30z" fill="%s"/><path d="M0 -300 Q58 -210 54 -110 V-30 H18 Q24 -200 0 -300z" fill="%s" opacity=".55"/>%s'
            '<ellipse cx="0" cy="-302" rx="18" ry="7" fill="%s"/><path d="M-5 -308 q5 -18 10 0z" fill="#D9A43A"/><path d="M0 -310 v-40" stroke="#6A4A2C" stroke-width="3"/><path d="M0 -350 l34 9 l-34 9z" fill="%s"/>'
            '<path d="M-104 -30 v-60 h60 v60z" fill="%s"/><path d="M-110 -90 h72 l-36 -40z" fill="%s"/><path d="M-86 -30 v-30 a12 12 0 0 1 24 0 v30z" fill="%s"/>'
            '<path d="M-18 -30 v-50 a18 18 0 0 1 36 0 v50z" fill="%s"/><path d="M104 -30 v-60 h-60 v60z" fill="%s"/><path d="M110 -90 h-72 l36 -40z" fill="%s"/>'
            '<path d="M86 -30 v-30 a12 12 0 0 0 -24 0 v30z" fill="%s"/></g>') % (
        x, y, s, shade, c, c, shade, bands, shade, flag, c, shade, door, door, c, shade, door)

def ghats(y, n=5, c="#D8BE92", edge="#B89A6A", x0=0, x1=1200):
    """Stone river steps coming down to the water from y."""
    return "".join('<rect x="%d" y="%d" width="%d" height="14" fill="%s"/><rect x="%d" y="%d" width="%d" height="3" fill="%s"/>' % (
        x0 + i * 6, y + i * 14, x1 - x0 - i * 12, c, x0 + i * 6, y + i * 14 + 11, x1 - x0 - i * 12, edge) for i in range(n))

def palm_leaf(x, y, s=1, leaf="#E4CE94", board="#6A3E22", n=5):
    """A palm-leaf manuscript: a stack of long narrow leaves between two wooden boards, tied with a cord."""
    leaves = "".join('<rect x="-150" y="%d" width="300" height="6" rx="3" fill="%s"/>' % (-14 - i * 6, leaf if i % 2 else "#D8BE80") for i in range(n))
    top = -14 - n * 6
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-158" y="-12" width="316" height="12" rx="5" fill="%s"/>%s'
            '<rect x="-158" y="%d" width="316" height="12" rx="5" fill="%s"/><circle cx="-80" cy="%d" r="4" fill="#3A2210"/>'
            '<path d="M-80 %d q-10 40 -40 50" stroke="#A8323A" stroke-width="3" fill="none"/><circle cx="80" cy="%d" r="4" fill="#3A2210"/></g>') % (
        x, y, s, board, leaves, top - 12, board, top - 6, top - 6, top - 6)

def open_leaf(x, y, s=1, leaf="#EAD6A0", ink="#8A6A3A"):
    """One palm leaf lying open, with rows of fine lines (no letters)."""
    rows = "".join('<path d="M%d %d h%d" stroke="%s" stroke-width="1.4" stroke-dasharray="6 3"/>' % (-150, yy, 124, ink, ) + '<path d="M%d %d h%d" stroke="%s" stroke-width="1.4" stroke-dasharray="5 3"/>' % (26, yy, 124, ink) for yy in (-18, -11, -4))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-160" y="-26" width="320" height="30" rx="14" fill="%s"/>%s'
            '<circle cx="-8" cy="-11" r="4" fill="#6A4A2A"/></g>') % (x, y, s, leaf, rows)

def banyan(x, y, s=1, leaf="#3E6A34", leaf2="#5A8A44", trunk="#6A4A30"):
    roots = "".join('<path d="M%d -110 V0" stroke="%s" stroke-width="3" opacity=".8"/>' % (rx, trunk) for rx in (-150, -122, -96, 84, 110, 138, 160))
    return ('<g transform="translate(%d %d) scale(%s)">%s<path d="M-30 0 q10 -60 -4 -130 h64 q-14 70 -4 130z" fill="%s"/>'
            '<path d="M-10 -120 q-60 -10 -120 10 M10 -120 q70 -10 130 10" stroke="%s" stroke-width="12" fill="none" stroke-linecap="round"/>'
            '<g fill="%s"><ellipse cx="0" cy="-170" rx="120" ry="50"/><ellipse cx="-120" cy="-140" rx="80" ry="38"/><ellipse cx="120" cy="-140" rx="84" ry="38"/><ellipse cx="-40" cy="-200" rx="70" ry="34"/><ellipse cx="60" cy="-196" rx="70" ry="32"/></g>'
            '<g fill="%s" opacity=".8"><ellipse cx="-60" cy="-180" rx="40" ry="14"/><ellipse cx="70" cy="-168" rx="44" ry="14"/><ellipse cx="-150" cy="-150" rx="30" ry="10"/><ellipse cx="140" cy="-150" rx="30" ry="10"/></g></g>') % (
        x, y, s, roots, trunk, trunk, leaf, leaf2)

def cow(x, y, s=1, c="#F2EAD8", shade="#C8B898", flip=False):
    """A humped Indian cow, standing calmly."""
    f = " scale(-1 1)" if flip else ""
    legs = "".join('<rect x="%d" y="-36" width="8" height="36" rx="3" fill="%s"/>' % (lx, c if i % 2 == 0 else shade) for i, lx in enumerate((-40, -30, 24, 34)))
    return ('<g transform="translate(%d %d) scale(%s)%s">%s<ellipse cx="0" cy="-52" rx="50" ry="22" fill="%s"/><circle cx="32" cy="-70" r="11" fill="%s"/>'
            '<path d="M38 -64 q18 -6 28 0 l8 20 q-4 8 -12 6 q-14 -6 -24 -8z" fill="%s"/><path d="M40 -44 q10 14 24 4" fill="%s"/>'
            '<ellipse cx="58" cy="-62" rx="9" ry="4" fill="%s" transform="rotate(20 58 -62)"/>'
            '<path d="M66 -66 q2 -12 -4 -18 M72 -64 q6 -10 4 -18" stroke="#8A7A5A" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
            '<circle cx="70" cy="-54" r="2" fill="#2A1E14"/>'
            '<path d="M-48 -58 q-10 18 -6 44" stroke="%s" stroke-width="3" fill="none"/><ellipse cx="-54" cy="-12" rx="4" ry="7" fill="%s"/></g>') % (
        x, y, s, f, legs, c, c, c, shade, shade, shade, "#6A5A4A")

def deer(x, y, s=1, c="#D9A43A", spot="#FFF0C0", flip=False):
    f = " scale(-1 1)" if flip else ""
    spots = "".join('<circle cx="%d" cy="%d" r="3"/>' % (sx, sy) for sx, sy in ((-26, -40), (-12, -44), (2, -40), (-18, -34), (-4, -32), (12, -44)))
    return ('<g transform="translate(%d %d) scale(%s)%s"><g fill="%s"><path d="M-40 -40 q0 -14 16 -14 h40 q8 0 12 -8 l8 -26 q4 -8 12 -6 l10 6 l-2 6 l-10 -2 l-6 30 q-2 14 -12 18 v10 l6 36 h-6 l-8 -32 h-30 l-6 32 h-6 l2 -34 q-12 -4 -14 -14 l-6 -2z"/>'
            '<path d="M-24 -18 l-8 32 h-6 l6 -34z"/></g><g stroke="%s" stroke-width="3" fill="none" stroke-linecap="round"><path d="M32 -86 q-4 -14 -14 -20 M32 -86 q2 -16 12 -22 M24 -98 l-8 -2 M40 -100 l6 -6"/></g>'
            '<g fill="%s" opacity=".9">%s</g><circle cx="40" cy="-78" r="2" fill="#3A2A1A"/></g>') % (x, y, s, f, c, c, spot, spots)

def chariot(x, y, s=1, body="#8A3A2A", trim="#D9A43A", pennant="#E4702A"):
    """An empty two-wheeled chariot with a canopy and a plain pennant."""
    spokes = "".join('<path d="M0 0 L%.1f %.1f"/>' % (34 * c, 34 * t) for c, t in ((1, 0), (.7, .7), (0, 1), (-.7, .7), (-1, 0), (-.7, -.7), (0, -1), (.7, -.7)))
    wheel = '<g transform="translate(%d -40)"><circle r="40" fill="none" stroke="#4A2A1A" stroke-width="8"/><g stroke="#4A2A1A" stroke-width="4">%s</g><circle r="8" fill="%s"/></g>'
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M60 -60 L210 -20" stroke="#5A3A22" stroke-width="8" stroke-linecap="round"/>'
            '<path d="M-90 -50 h170 l-10 -70 h-150z" fill="%s"/><path d="M-80 -110 h150" stroke="%s" stroke-width="5"/><path d="M-84 -80 h160" stroke="%s" stroke-width="3" opacity=".7"/>'
            '<path d="M-80 -120 V-190 M70 -120 V-190" stroke="#5A3A22" stroke-width="5"/><path d="M-96 -186 q91 -46 182 0z" fill="%s"/><path d="M-96 -186 h182" stroke="%s" stroke-width="4"/>'
            '<path d="M-6 -214 V-290" stroke="#5A3A22" stroke-width="4"/><path d="M-4 -290 q40 6 64 -2 q-18 12 -2 26 q-30 6 -62 0z" fill="%s"/>%s%s</g>') % (
        x, y, s, body, trim, trim, body, trim, pennant, wheel % (-50, spokes, trim), wheel % (40, spokes, trim))

def horse(x, y, s=1, c="#F2EAD8", mane="#C8B898"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-60 -60 q0 -22 26 -24 h50 q14 -2 22 -16 l12 -30 q6 -10 16 -8 l12 8 q6 4 4 12 l-10 4 l-6 -4 l-14 26 q-4 20 -20 30 v12 l8 40 h-8 l-10 -36 h-44 l-8 36 h-8 l4 -40 q-14 -6 -16 -20 q-14 8 -16 30 h-6 q0 -26 20 -40z" fill="%s"/>'
            '<path d="M24 -100 q14 -20 22 -34 q6 12 -2 22 q-8 12 -18 18z" fill="%s"/></g>') % (x, y, s, c, mane)

def conch(x, y, s=1, c="#F4ECDC", shade="#D8C4A4"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-50 0 q-6 -30 24 -44 q30 -12 56 4 q20 10 22 26 q-26 -6 -40 10 q-20 18 -62 4z" fill="%s"/>'
            '<path d="M-26 -44 q-10 -14 6 -22 q12 8 8 20z" fill="%s"/><path d="M-40 -12 q30 -22 60 -18 M-30 -26 q24 -14 50 -10" stroke="%s" stroke-width="3" fill="none"/>'
            '<path d="M52 -14 q-14 4 -18 16" stroke="#E8A0B0" stroke-width="5" fill="none"/></g>') % (x, y, s, c, shade, shade)

def om(x, y, s=1, c="#F2C964", op="1"):
    """A respectful Om sign drawn as a symbol (strokes, no text element)."""
    return ('<g transform="translate(%d %d) scale(%s)" fill="none" stroke="%s" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="%s">'
            '<path d="M-44 -56 q22 -22 44 -6 q16 16 -6 30 q-12 6 -26 4"/>'
            '<path d="M-32 -28 q40 -4 44 26 q4 34 -34 40 q-24 2 -34 -14"/>'
            '<path d="M10 -24 q18 -22 36 -4 q16 20 6 50 q-6 16 4 26"/>'
            '<path d="M18 -92 q22 18 44 0" stroke-width="7"/></g>'
            '<circle cx="%d" cy="%d" r="%s" fill="%s" opacity="%s"/>') % (x, y, s, c, op, x + 40 * s, y - 110 * s, 7 * s, c, op)

def fire_altar(x, y, s=1, brick="#A8523A", mortar="#7A3A26"):
    rows = "".join('<path d="M-70 %d h140" stroke="%s" stroke-width="2"/>' % (yy, mortar) for yy in (-12, -24, -36))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-70" y="-46" width="140" height="46" fill="%s"/>%s'
            '<path d="M-44 -46 q-6 -40 20 -60 q-4 26 12 34 q-2 -40 22 -64 q2 40 18 50 q6 -18 20 -24 q2 34 -8 64z" fill="#F0923A"/>'
            '<path d="M-20 -46 q-2 -24 12 -36 q0 18 10 22 q4 -14 14 -18 q2 20 -6 32z" fill="#FFE08A"/></g>') % (x, y, s, brick, rows)

def hut(x, y, s=1, wall="#C89A6A", thatch="#A8844A", door="#4A2E1A"):
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-56" y="-60" width="112" height="60" fill="%s"/><path d="M-80 -54 L0 -120 L80 -54z" fill="%s"/>'
            '<g stroke="#7A5A2A" stroke-width="2" opacity=".6"><path d="M-60 -64 L0 -112 M-30 -60 L0 -100 M60 -64 L0 -112 M30 -60 L0 -100"/></g>'
            '<path d="M-14 0 v-38 h28 v38z" fill="%s"/></g>') % (x, y, s, wall, thatch, door)

def bow(x, y, s=1, c="#6A3E22", rot=0):
    return ('<g transform="translate(%d %d) scale(%s) rotate(%d)"><path d="M0 -90 q40 90 0 180" stroke="%s" stroke-width="7" fill="none" stroke-linecap="round"/>'
            '<path d="M0 -90 V90" stroke="#E8DCC0" stroke-width="1.5"/><rect x="-6" y="-8" width="10" height="16" fill="#D9A43A"/></g>') % (x, y, s, rot, c)

def quiver(x, y, s=1, rot=0):
    arrows = "".join('<path d="M%d -100 v-26" stroke="#8A6A40" stroke-width="2.5"/><path d="M%d -128 l-5 -10 h10z" fill="#C8B898"/><path d="M%d -104 l-5 6 M%d -104 l5 6" stroke="#A8323A" stroke-width="3"/>' % (ax, ax, ax, ax) for ax in (-8, 0, 8))
    return '<g transform="translate(%d %d) scale(%s) rotate(%d)">%s<rect x="-14" y="-104" width="28" height="104" rx="8" fill="#7A4A2A"/><path d="M-14 -80 h28 M-14 -24 h28" stroke="#D9A43A" stroke-width="4"/></g>' % (x, y, s, rot, arrows)

def lotus_pond(y, xs, seed=3):
    g = rng(seed); out = ""
    for i, x in enumerate(xs):
        out += '<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="#3E7A4A"/>' % (x + 60, y + 14 + next(g) % 20, 30 + next(g) % 14, 8)
        out += lotus(x, y + next(g) % 24, .6 + (next(g) % 4) / 10, ("#F2B8C8", "#F6D0DA", "#E8A0B0")[i % 3])
    return out

def garland(x0, x1, y, sag=30, c1="#F08A24", c2="#F6C33A"):
    n = int((x1 - x0) / 13); out = ""
    for i in range(n + 1):
        t = i / n; xx = x0 + (x1 - x0) * t; yy = y + 4 * sag * t * (1 - t)
        out += '<circle cx="%d" cy="%d" r="7" fill="%s"/>' % (xx, yy, c1 if i % 3 else c2)
    return out

def rangoli(x, y, r=60, cols=("#E4573D", "#F2C964", "#4E9A6A", "#5F9CB4", "#C84A8A")):
    out = '<g transform="translate(%d %d) scale(1 .38)">' % (x, y)
    for k, c in enumerate(cols):
        rr = r - k * r / len(cols); petals = 8 + (k % 2) * 4
        for j in range(petals):
            out += '<ellipse cx="0" cy="%d" rx="%d" ry="%d" fill="%s" transform="rotate(%d)"/>' % (-rr * .55, rr * .16 + 2, rr * .45, c, j * 360 / petals)
    return out + '<circle r="%d" fill="#FFF3C0"/></g>' % (r * .12)

def powder(x, y, s=1, c="#E4573D", bowl="#8A5A34"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-40 -18 q0 20 40 20 q40 0 40 -20z" fill="%s"/><path d="M-36 -18 q36 -40 72 0z" fill="%s"/>'
            '<ellipse cx="0" cy="-18" rx="40" ry="6" fill="%s" opacity=".6"/></g>') % (x, y, s, bowl, c, c)

def pillar_hall(x, y, n, gap, h, c="#E2C08A", shade="#B8905A"):
    out = '<g transform="translate(%d %d)"><rect x="-20" y="%d" width="%d" height="20" fill="%s"/>' % (x, y, -h - 20, (n - 1) * gap + 40, shade)
    for i in range(n):
        px = i * gap
        out += '<rect x="%d" y="%d" width="16" height="%d" fill="%s"/><rect x="%d" y="%d" width="24" height="8" fill="%s"/><rect x="%d" y="-8" width="24" height="8" fill="%s"/>' % (
            px - 8, -h, h, c, px - 12, -h, shade, px - 12, shade)
    return out + "</g>"

def sail_ship(x, y, s=1, hull="#5A3A22", sail="#F2E6C8"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-100 -20 q100 40 200 0 l-16 -16 h-170z" fill="%s"/><path d="M-10 -36 V-170 M40 -36 V-130" stroke="#3A2A1A" stroke-width="4"/>'
            '<path d="M-6 -164 q54 50 0 116 z" fill="%s"/><path d="M44 -126 q36 36 0 84z" fill="%s"/><path d="M-80 -36 q-4 -30 20 -40 v40z" fill="%s" opacity=".85"/></g>') % (x, y, s, hull, sail, sail, sail)

def modaks(x, y, s=1):
    """A brass bowl heaped with round sweets."""
    pts = ((-34, -10), (-12, -12), (12, -12), (34, -10), (-22, -30), (0, -32), (22, -30), (-10, -50), (12, -50))
    sw = "".join('<circle cx="%d" cy="%d" r="12" fill="#F0A840"/><circle cx="%d" cy="%d" r="4" fill="#FFD890" opacity=".8"/>' % (mx, my, mx - 4, my - 4) for mx, my in pts)
    return '<g transform="translate(%d %d) scale(%s)">%s<path d="M-56 -2 q56 36 112 0z" fill="#C8963A"/><path d="M-56 -2 h112" stroke="#8A5A2A" stroke-width="3"/></g>' % (x, y, s, sw)

def mouse(x, y, s=1, c="#8A7A6A"):
    return ('<g transform="translate(%d %d) scale(%s)"><ellipse cx="0" cy="-10" rx="18" ry="11" fill="%s"/><path d="M14 -16 q12 -2 16 8 q-8 6 -18 2z" fill="%s"/>'
            '<circle cx="12" cy="-20" r="6" fill="%s"/><circle cx="12" cy="-20" r="3" fill="#E8B8B0"/><circle cx="24" cy="-10" r="1.6" fill="#1A1410"/>'
            '<path d="M-18 -8 q-20 4 -26 -10" stroke="%s" stroke-width="2" fill="none"/></g>') % (x, y, s, c, c, c, c)

def flute(x, y, s=1, rot=-6):
    holes = "".join('<circle cx="%d" cy="0" r="2.4" fill="#4A2A1A"/>' % hx for hx in (-30, -14, 2, 18, 34, 50))
    return ('<g transform="translate(%d %d) scale(%s) rotate(%d)"><rect x="-110" y="-6" width="220" height="12" rx="6" fill="#C8A060"/>%s'
            '<path d="M-86 -6 v12 M-78 -6 v12 M84 -6 v12" stroke="#A8323A" stroke-width="3"/><path d="M-82 6 q-6 22 4 34 M-82 6 q6 20 -2 36" stroke="#A8323A" stroke-width="2" fill="none"/>'
            '<path d="M-78 30 q-8 -10 -2 -18 q6 8 2 18z" fill="#3E7A4A"/></g>') % (x, y, s, rot, holes)

def peacock_feather(x, y, s=1, rot=-20):
    barbs = "".join('<path d="M0 %d q-14 -6 -18 -16 M0 %d q14 -6 18 -16" stroke="#6A9A3A" stroke-width="1.5" fill="none"/>' % (yy, yy) for yy in range(-10, -90, -8))
    return ('<g transform="translate(%d %d) scale(%s) rotate(%d)"><path d="M0 0 V-120" stroke="#8A7A4A" stroke-width="2"/>%s'
            '<ellipse cx="0" cy="-116" rx="20" ry="26" fill="#3E8A6A"/><ellipse cx="0" cy="-114" rx="13" ry="17" fill="#D9A43A"/><ellipse cx="0" cy="-112" rx="8" ry="11" fill="#2E5A9A"/><ellipse cx="0" cy="-110" rx="4" ry="6" fill="#1A2A5A"/></g>') % (x, y, s, rot, barbs)

def himalaya(y, fill="#8A9AB8", snow="#F4F6FA", peaks=((180, 90, 220), (520, 50, 260), (880, 80, 240), (1140, 110, 200))):
    out = ""
    for px, py, w in peaks:
        out += '<path d="M%d %d L%d %d L%d %d z" fill="%s"/>' % (px - w, y, px, py, px + w, y, fill)
        out += '<path d="M%d %d L%d %d L%d %d L%d %d L%d %d z" fill="%s"/>' % (px, py, px + w * .22, py + (y - py) * .22, px + 6, py + (y - py) * .16, px - w * .12, py + (y - py) * .24, px - w * .2, py + (y - py) * .2, snow)
    return out

def reflect(x, y, w, c="#FFE08A", n=5, op=".5"):
    return '<g stroke="%s" stroke-width="3" stroke-linecap="round" opacity="%s">%s</g>' % (c, op, "".join(
        '<path d="M%d %d h%d"/>' % (x - (w - i * w / n) / 2, y + i * 9, w - i * w / n) for i in range(n)))

def bells(x, y, n=3, gap=40, c="#D9A43A"):
    return "".join('<g transform="translate(%d %d)"><path d="M0 0 v%d" stroke="#6A4A2C" stroke-width="2"/><path d="M-12 %d q0 -26 12 -26 q12 0 12 26z" fill="%s"/><circle cx="0" cy="%d" r="3.5" fill="#8A5A2A"/></g>' % (
        x + i * gap, y, 20 + (i % 2) * 14, 46 + (i % 2) * 14, c, 49 + (i % 2) * 14) for i in range(n))

# ---- the scenes ------------------------------------------------------------

CREDITS = {
    1: "Drawn scene: a thatched forest hut beside a river, a golden deer among the trees, and a bow and quiver resting by the door",
    2: "Drawn scene: a green hill sheltering a herd of cows under a stormy sky, with a flute and peacock feather, and a bowl of sweets beside a small mouse",
    3: "Drawn scene: steps lined with glowing clay lamps at night, a bright rangoli on the ground, and bowls of coloured powder",
    4: "Drawn scene: a teacher's forest school at dawn under a banyan tree, with palm-leaf books tied between wooden boards and a lamp",
    5: "Drawn scene: a palace city on the left, a deep forest in the middle, and a line of stones crossing the sea to an island on the right",
    6: "Drawn scene: an empty chariot with a pennant and two white horses on a wide plain at dawn, two camps far off, a conch shell in front",
    7: "Drawn scene: a stone temple with a pennant at dusk, marigold garlands, a lotus pond and a row of lamps",
    8: "Drawn scene: a brick fire altar burning by a river at sunrise, with snowy mountains beyond",
    9: "Drawn scene: forest huts beneath a great banyan tree beside a clear stream, a deer grazing, stars fading at dawn",
}

def b1(p):
    s = Scene(p); s.add(sky(p, ["#4A7AA8", "#9CC0CC", "#F4DDB0"]), sun(p, 980, 120, 26, "#FFF6D0", "#FFD890"))
    s.add(ridge(200, 24, 11, "#6E8E6A"), ridge(240, 18, 12, "#4E7050"))
    s.add(tree(80, 290, 1.9, "#2E5A34", "#4E7A44"), tree(1120, 300, 2.1, "#2E5A34", "#4E7A44"), tree(980, 280, 1.4, "#3E6A3C", "#5E8A4C"))
    s.add(ground(270, "#7E9A52"), water(p, 336, "#9CC8D0", "#3F7C94"))
    s.add(reflect(980, 350, 80, "#FFF0C0", 4, ".4"))
    s.add(hut(360, 300, 1.25), bow(478, 300, .75, rot=12), quiver(520, 304, .85, 10))
    s.add(tree(250, 300, 1.2, "#3E6A3C", "#5E8A4C"), deer(760, 294, .95), tree(880, 300, 1.1, "#3E6A3C", "#5E8A4C"))
    s.add('<g fill="#F2E6A0" opacity=".7"><circle cx="720" cy="220" r="3"/><circle cx="800" cy="200" r="2"/><circle cx="700" cy="250" r="2"/><circle cx="830" cy="236" r="2.5"/></g>')
    return s.svg(CREDITS[1])

def b2(p):
    s = Scene(p); s.add(sky(p, ["#2A3A5A", "#5A6A8A", "#A8B8C8"]), clouds([(160, 60, 260), (560, 40, 320), (1000, 70, 280)], ".55", "#DDE4EE"))
    s.add('<g stroke="#9AB0C8" stroke-width="1.5" opacity=".5">%s</g>' % "".join('<path d="M%d %d l-10 30"/>' % (x, 90 + (x * 7) % 40) for x in range(40, 1200, 34)))
    s.add('<path d="M340 250 Q380 110 600 96 Q820 110 860 250z" fill="#4E7A3C"/><path d="M600 96 Q820 110 860 250 H700 Q720 150 600 96z" fill="#3A6030" opacity=".8"/>')
    s.add('<path d="M420 250 q180 -60 360 0z" fill="#20301E" opacity=".55"/>')
    s.add(ground(250, "#8AA85A"), cow(500, 268, .95, "#F2EAD8"), cow(710, 270, .95, "#E8D8BC", flip=True), cow(610, 280, .75, "#D8C4A4"))
    s.add(ground(320, "#6E8E44"), flute(260, 372, 1), peacock_feather(150, 400, .95, -24))
    s.add(modaks(940, 386, 1.1), mouse(1060, 392, 1.1))
    s.add('<path d="M860 392 h240" stroke="#5A6A2A" stroke-width="2" opacity=".5"/>')
    return s.svg(CREDITS[2])

def b3(p):
    s = Scene(p); s.add(sky(p, ["#0A1433", "#1E2A5A", "#4A3A6A"]), stars(33, 70, 180))
    s.add('<g opacity=".9">' + temple(600, 250, .55, "#3A3050", "#2A2240", "#E4702A", "#F2C964") + "</g>", glow(p, 600, 230, 120, op=".25"))
    s.add(ghats(250, 6, "#6A5470", "#4A3A58"))
    for i in (1, 3, 5):
        s.add("".join(diya(70 + i * 12 + k * 90, 262 + i * 14, .55, halo=False) for k in range(12 - i // 2)))
    s.add('<rect x="0" y="334" width="1200" height="86" fill="#3A2E48"/>', rangoli(600, 380, 150))
    s.add(powder(170, 400, 1, "#E4573D"), powder(270, 404, .9, "#F2C964"), powder(930, 404, .9, "#4E9A6A"), powder(1030, 400, 1, "#C84A8A"))
    s.add(diya(420, 392, 1), diya(780, 392, 1))
    return s.svg(CREDITS[3])

def b4(p):
    s = Scene(p); s.add(sky(p, ["#5A7AA8", "#E8B888", "#F6DCA8"]), sun(p, 900, 230, 30, "#FFF2C8", "#FFC878"))
    s.add(ridge(220, 20, 21, "#9A8A7A"), ridge(250, 14, 22, "#6E7E5A"), ground(280, "#8A9A5A"))
    s.add(banyan(330, 330, 1.2), hut(900, 300, .8, "#B89A6A"))
    s.add('<ellipse cx="600" cy="400" rx="640" ry="70" fill="#6A7A40"/>')
    s.add('<path d="M500 372 h320 l-14 14 h-292z" fill="#6A3E22"/><path d="M520 386 v24 M800 386 v24" stroke="#4A2A16" stroke-width="10"/>')
    s.add(palm_leaf(660, 372, .9), open_leaf(660, 314, .8))
    s.add(lamp(1010, 380, .9), glow(p, 1060, 330, 70, op=".4"))
    s.add(palm_leaf(170, 400, .55, n=4))
    return s.svg(CREDITS[4])

def b5(p):
    s = Scene(p); s.add(sky(p, ["#3A6A9A", "#A8C8D8", "#F6E2B8"]), clouds([(240, 70, 160), (760, 50, 200)], ".7"))
    s.add(ridge(230, 20, 31, "#8AA47A"), ground(250, "#A8B070"))
    s.add(temple(170, 262, .5, "#F2DCA8", "#C8A870", "#E4702A"), temple(300, 262, .38, "#EAD2A0", "#C0A068", "#E4702A"), city(230, 262, .7, "#F2DCA8", "#C8A870"))
    s.add(''.join(tree(x, 300 + (x % 3) * 8, 1 + (x % 5) / 8, "#2E5A34", "#4E7A44") for x in range(430, 780, 46)))
    s.add('<path d="M760 420 L760 300 Q900 280 1200 270 V420z" fill="#4F8CA4"/>', '<path d="M760 300 Q900 280 1200 270 V286 Q960 296 760 312z" fill="#A8D0DC" opacity=".6"/>')
    s.add('<g fill="#9A8A7A">%s</g>' % "".join('<ellipse cx="%d" cy="%d" rx="%d" ry="7"/>' % (780 + i * 26, 318 - i * 3, 14 - i % 3) for i in range(13)))
    s.add('<path d="M1060 272 q60 -60 140 -40 v40z" fill="#5E7A4A"/>', palm(1120, 262, .8, -4), palm(1170, 258, .7, 6))
    s.add(ground(360, "#5E7A3C"), bow(90, 380, .5, rot=80))
    return s.svg(CREDITS[5])

def b6(p):
    s = Scene(p); s.add(sky(p, ["#5A4A7A", "#D88A6A", "#F6C890"]), sun(p, 600, 250, 40, "#FFF0C0", "#FFB870"))
    s.add(ground(250, "#C8A070"))
    s.add(tents([(120, 254, .5), (200, 254, .6), (280, 254, .5), (920, 254, .5), (1000, 254, .6), (1080, 254, .5)], "#E0C8A0", "#8A6A48"))
    s.add('<g stroke="#6A4A30" stroke-width="2">%s</g>' % "".join('<path d="M%d 250 v-40"/><path d="M%d 212 l16 5 l-16 5z" fill="%s"/>' % (x, x, c) for x, c in ((160, "#C8503A"), (240, "#C8503A"), (960, "#2E5A88"), (1040, "#2E5A88"))))
    s.add(ground(300, "#A8804A"))
    s.add(horse(930, 384, 1.05, "#E4DCC8"), horse(880, 392, 1.05, "#F2EAD8"))
    s.add(chariot(560, 400, .95))
    s.add(conch(170, 396, 1.1))
    return s.svg(CREDITS[6])

def b7(p):
    s = Scene(p); s.add(sky(p, ["#2A2A5A", "#A85A7A", "#F2A870"]), stars(77, 25, 90))
    s.add(ridge(270, 12, 41, "#5A4A6A"))
    s.add(temple(600, 300, .9, "#E8C890", "#B89060"))
    s.add(garland(360, 840, 184, 30), garland(420, 780, 150, 20, "#F6C33A", "#F08A24"))
    s.add(ground(300, "#8A6A48"), ghats(300, 3, "#C8A878", "#9A7A58"))
    s.add(water(p, 342, "#6A6A9A", "#2A3A6A"), reflect(600, 356, 120, "#F2C964", 5, ".35"))
    s.add(lotus_pond(360, [80, 220, 900, 1040, 1150]))
    s.add(diya_row(360, 306, 9, 60, .6))
    return s.svg(CREDITS[7])

def b8(p):
    s = Scene(p); s.add(sky(p, ["#6A8AB8", "#F2C0A0", "#FAE0B0"]), sun(p, 860, 210, 34, "#FFF4D0", "#FFC878"))
    s.add(himalaya(250, "#8A92B0"))
    s.add(ridge(246, 12, 51, "#7A8A6A"), ground(270, "#9AA060"))
    s.add(water(p, 300, "#B8D8E0", "#4F8CA4"), reflect(860, 316, 110, "#FFF0C0", 5, ".6"))
    s.add('<path d="M0 420 V330 Q300 316 520 340 Q560 380 560 420z" fill="#8A7A4A"/>')
    s.add(glow(p, 320, 300, 170, "#FFB050", ".45"), fire_altar(320, 380, 1.3))
    s.add('<g fill="#C8B070"><path d="M120 380 q10 -30 0 -60 q16 30 6 60z"/><path d="M140 380 q14 -26 20 -52 q2 30 -12 52z"/><path d="M100 380 q-14 -24 -10 -48 q14 24 16 48z"/></g>')
    s.add('<g fill="#6A8A4A" opacity=".8"><path d="M40 380 q6 -20 0 -40 q12 20 6 40z"/><path d="M60 380 q10 -16 14 -34 q0 20 -8 34z"/></g>')
    return s.svg(CREDITS[8])

def b9(p):
    s = Scene(p); s.add(sky(p, ["#2A3A6A", "#8A9AC0", "#F2DCB8"]), stars(99, 25, 100, op=".5"))
    s.add(ridge(220, 20, 61, "#5A6A7A"), ridge(250, 16, 62, "#4E6A50"), ground(280, "#6E8A4A"))
    s.add(banyan(620, 300, 1.12, "#2E5A30", "#4E7A40"))
    s.add(hut(250, 300, .85), hut(380, 300, .7, "#B8906A"), hut(1000, 300, .8))
    s.add('<path d="M0 360 Q300 330 600 356 T1200 344 V400 Q900 380 600 404 T0 396z" fill="#8AC0CC"/><path d="M0 372 Q300 346 600 370 T1200 358" stroke="#E8F4F4" stroke-width="2" fill="none" opacity=".6"/>')
    s.add(deer(880, 348, .7, "#B8864A", "#F2E0B8", flip=True), lotus(160, 388, .5), lotus(1080, 382, .55, "#F6D0DA"))
    return s.svg(CREDITS[9])

BANNERS = {n: globals()["b%d" % n]("hnb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
