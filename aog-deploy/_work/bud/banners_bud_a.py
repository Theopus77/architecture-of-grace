"""AOG-BUD-V1 — drawn unit banners for Buddhist Texts, units 1–9.
Built from _work/course/banner_kit.py plus the Buddhist pieces below: the bodhi
tree, stupas, the Dharma wheel, lotus, prayer flags, monasteries, palm-leaf and
woodblock sutras, and landscapes. No people and no figure of the Buddha; the
Buddha is present only through the places and signs his followers honour.
No lettering. Every id is prefixed "bdb{n}-"."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
from banner_kit import *

# ---- Buddhist pieces (shared with banners_bud_b) ---------------------------

LEAF = "M0 0 C-9 -6 -13 -16 -8 -22 Q-4 -26 0 -21 Q4 -26 8 -22 C13 -16 9 -6 0 0z M0 0 L0 9"

def bodhi(x, y, s=1, leaf="#3E6E34", leaf2="#6E9A48", trunk="#5A4030", seed=5):
    """A wide bodhi (fig) tree: thick twisting trunk, broad dome of heart-shaped leaves."""
    g = rng(seed)
    out = ('<g transform="translate(%d %d) scale(%s)"><path d="M-34 0 q10 -40 2 -80 q-4 -30 -40 -60 M34 0 q-10 -40 -2 -80 q4 -30 44 -58 M-8 -90 q4 -40 -6 -70 M8 -90 q10 -30 40 -50" '
           'stroke="%s" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M-36 0 q12 -50 0 -100 h36 q-10 50 4 100z" fill="%s"/>') % (x, y, s, trunk, trunk)
    out += '<g fill="%s"><ellipse cx="0" cy="-170" rx="170" ry="70"/><ellipse cx="-120" cy="-140" rx="90" ry="50"/><ellipse cx="120" cy="-142" rx="92" ry="50"/><ellipse cx="-40" cy="-220" rx="100" ry="46"/><ellipse cx="60" cy="-214" rx="90" ry="44"/></g>' % leaf
    ls = ""
    for _ in range(70):
        lx = -200 + next(g) % 400; ly = -250 + next(g) % 150
        if (lx / 200.0) ** 2 + ((ly + 170) / 90.0) ** 2 > 1.1: continue
        ls += '<path d="%s" transform="translate(%d %d) rotate(%d) scale(.9)"/>' % (LEAF, lx, ly, 150 + next(g) % 60)
    out += '<g fill="%s" stroke="%s" stroke-width="1" opacity=".9">%s</g>' % (leaf2, leaf2, ls)
    return out + "</g>"

def stupa(x, y, s=1, c="#F2EBDC", shade="#C9BCA2", gold="#D9B45A"):
    """A stupa: stepped base, white dome, square harmika and a tiered gold spire."""
    rings = "".join('<rect x="%d" y="%d" width="%d" height="7" rx="2"/>' % (-14 + i * 2, -160 - i * 11, 28 - i * 4) for i in range(7))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-120" y="-24" width="240" height="24" fill="%s"/><rect x="-100" y="-44" width="200" height="22" fill="%s"/>'
            '<path d="M-90 -44 a90 84 0 0 1 180 0z" fill="%s"/><path d="M20 -126 a90 84 0 0 1 70 82 h-50z" fill="%s" opacity=".5"/>'
            '<rect x="-22" y="-146" width="44" height="22" fill="%s"/><rect x="-26" y="-150" width="52" height="6" fill="%s"/>'
            '<g fill="%s">%s</g><path d="M0 -236 v-14" stroke="%s" stroke-width="3"/><circle cx="0" cy="-252" r="4" fill="%s"/></g>') % (
        x, y, s, shade, c, c, shade, c, gold, gold, rings, gold, gold)

def wheel(x, y, r=60, c="#D9B45A", w=6):
    """The Dharma wheel: rim, hub and eight spokes."""
    sp = "".join('<path d="M0 %d V%d" transform="rotate(%d)"/>' % (r * 0.22, r, a) for a in range(0, 360, 45))
    knobs = "".join('<circle cx="0" cy="%d" r="%.1f" transform="rotate(%d)"/>' % (r + w, w * .8, a) for a in range(0, 360, 45))
    return ('<g transform="translate(%d %d)"><g stroke="%s" stroke-width="%d" fill="none" stroke-linecap="round"><circle r="%d"/>%s<circle r="%d"/></g>'
            '<g fill="%s">%s<circle r="%d"/></g></g>') % (x, y, c, w, r, sp, r * 0.22, c, knobs, r * 0.1)

def flags(x1, y1, x2, y2, sag=30, n=10, op="1"):
    """A string of prayer flags in the five traditional colours (plain cloth, no lettering)."""
    cols = ("#3A6AB8", "#F4F0E6", "#C8403A", "#3E8A4A", "#E8C040")
    mx, my = (x1 + x2) / 2.0, (y1 + y2) / 2.0 + sag
    out = '<path d="M%d %d Q%d %d %d %d" stroke="#6A5440" stroke-width="1.5" fill="none"/>' % (x1, y1, mx, my + sag, x2, y2)
    for i in range(n):
        t = (i + .5) / n
        fx = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2
        fy = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * (my + sag) + t * t * y2
        out += '<rect x="%.0f" y="%.0f" width="18" height="24" fill="%s" transform="rotate(%d %.0f %.0f)"/>' % (fx - 9, fy, cols[i % 5], (i * 7) % 9 - 4, fx, fy)
    return '<g opacity="%s">%s</g>' % (op, out)

def monastery(x, y, s=1, wall="#F2EBDC", band="#8A2E2A", roof="#D9B45A"):
    """A Himalayan monastery: sloping white walls, rows of dark windows, a red upper band, a gold roof."""
    wins = "".join('<rect x="%d" y="%d" width="10" height="14" fill="#2A2020"/>' % (-110 + c * 30, -100 + r * 30) for r in range(3) for c in range(8))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-140 0 L-126 -130 H126 L140 0z" fill="%s"/><path d="M40 -130 H126 L140 0 H40z" fill="#000" opacity=".08"/>%s'
            '<rect x="-128" y="-150" width="256" height="22" fill="%s"/><path d="M-70 -150 L-80 -168 H80 L70 -150z" fill="%s"/><rect x="-50" y="-190" width="100" height="24" fill="%s"/>'
            '<path d="M-64 -188 L0 -214 L64 -188z" fill="%s"/><rect x="-14" y="-40" width="28" height="40" fill="#5A2A22"/></g>') % (x, y, s, wall, wins, band, roof, band, roof)

def palm_leaf(x, y, s=1, rot=0, leaf="#E8D29A", wood="#7A4A2A", n=6):
    """A palm-leaf manuscript: long narrow leaves stacked between wooden covers, tied with cord."""
    lv = "".join('<rect x="-150" y="%d" width="300" height="6" rx="3" fill="%s" stroke="#B89A5A" stroke-width=".8"/>' % (-14 - i * 6, leaf) for i in range(n))
    top = -14 - n * 6
    return ('<g transform="translate(%d %d) scale(%s) rotate(%d)"><rect x="-154" y="-8" width="308" height="10" rx="4" fill="%s"/>%s<rect x="-154" y="%d" width="308" height="10" rx="4" fill="%s"/>'
            '<g fill="#3A2A1A"><circle cx="-90" cy="%d" r="3"/><circle cx="90" cy="%d" r="3"/></g><path d="M-90 %d q-10 30 -24 34 M90 %d q12 30 30 32" stroke="#A8323A" stroke-width="2.5" fill="none"/></g>') % (
        x, y, s, rot, wood, lv, top - 8, wood, top - 4, top - 4, top - 4, top - 4)

def open_leaf(x, y, s=1, leaf="#EAD6A0"):
    """One palm leaf laid open, lines of script shown only as faint ruled strokes."""
    ln = "".join('<path d="M%d %d h%d"/>' % (-130 + (i % 2) * 6, -18 + i * 9, 250 - (i % 3) * 20) for i in range(4))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-150" y="-26" width="300" height="44" rx="14" fill="%s" stroke="#B89A5A" stroke-width="1.5"/>'
            '<g stroke="#8A6A40" stroke-width="2" stroke-dasharray="7 3 12 4" opacity=".7">%s</g><circle cx="-80" cy="-4" r="3" fill="#8A6A40"/><circle cx="80" cy="-4" r="3" fill="#8A6A40"/></g>') % (x, y, s, leaf, ln)

def woodblock(x, y, s=1, wood="#9A6A3A"):
    """A carved printing block beside a printed sheet, text shown only as columns of ruled marks."""
    cols = "".join('<path d="M%d -80 v70"/>' % xx for xx in range(-60, 70, 14))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-80" y="-96" width="160" height="96" rx="4" fill="%s"/><rect x="-72" y="-88" width="144" height="80" fill="#7A5028"/>'
            '<g stroke="#C89A5A" stroke-width="4" stroke-dasharray="5 3">%s</g><rect x="-80" y="-4" width="160" height="4" fill="#5A3A1A"/></g>') % (x, y, s, wood, cols)

def sutra_sheet(x, y, s=1, paper="#F4EAD2"):
    cols = "".join('<path d="M%d -80 v70"/>' % xx for xx in range(-60, 70, 14))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-82" y="-96" width="164" height="96" fill="%s"/><rect x="-82" y="-96" width="164" height="96" fill="none" stroke="#B89A5A" stroke-width="2"/>'
            '<g stroke="#3A2A2A" stroke-width="3" stroke-dasharray="5 3" opacity=".75">%s</g><rect x="-74" y="-90" width="148" height="84" fill="none" stroke="#A8323A" stroke-width="1.5" opacity=".6"/></g>') % (x, y, s, paper, cols)

def deer(x, y, s=1, c="#B8844A", flip=False, down=False):
    """A resting deer, legs folded, as at the Deer Park."""
    head = ('<path d="M40 -26 q10 -4 16 -20 l6 2 q-2 16 -12 28z" /><ellipse cx="62" cy="-48" rx="12" ry="7"/><path d="M58 -54 l-6 -10 M56 -60 l-8 0 M64 -54 l4 -12 M66 -62 l6 -2" stroke="%s" stroke-width="2.5" fill="none"/>' % c
            if not down else '<path d="M40 -26 q14 4 24 18 l-4 4 q-12 -8 -22 -12z"/><ellipse cx="66" cy="-4" rx="12" ry="6"/><path d="M60 -12 l-4 -12 M64 -12 l6 -12" stroke="%s" stroke-width="2.5" fill="none"/>' % c)
    return ('<g transform="translate(%d %d) scale(%s)" fill="%s"><ellipse cx="0" cy="-20" rx="46" ry="20"/>%s<path d="M-40 -4 h70 q6 4 0 6 h-70z" opacity=".8"/>'
            '<g fill="#F4EAD2" opacity=".6"><circle cx="-10" cy="-28" r="3"/><circle cx="6" cy="-30" r="3"/><circle cx="-24" cy="-24" r="3"/><circle cx="18" cy="-26" r="2.5"/></g><path d="M-44 -26 q-10 -6 -8 -12" stroke="%s" stroke-width="5" fill="none"/></g>') % (
        x, y, "%s %s" % (-s if flip else s, s), c, head, c)

def big_lotus(x, y, s=1, c="#F0A8B8", c2="#E07890", leaf="#3E7A4A"):
    """A fully open lotus on its pad."""
    pet = lambda a, l, col: '<path d="M0 0 q-16 -%d 0 -%d q16 %d 0 %d z" fill="%s" transform="rotate(%d)"/>' % (l // 2, l, l // 2, l, col, a)
    back = "".join(pet(a, 60, c2) for a in (-70, -45, 45, 70))
    front = "".join(pet(a, 66, c) for a in (-25, 0, 25))
    return ('<g transform="translate(%d %d) scale(%s)"><ellipse cx="0" cy="6" rx="80" ry="14" fill="%s"/><path d="M0 6 L60 0" stroke="#2A5A34" stroke-width="2"/>%s%s'
            '<ellipse cx="0" cy="-4" rx="16" ry="6" fill="#E8C040"/></g>') % (x, y, s, leaf, back, front)

def pads(pts, c="#3E7A4A"):
    return "".join('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="%s"/><path d="M%d %d l%d -2" stroke="#2A5A34" stroke-width="2"/>' % (x, y, r, r // 4 + 2, c, x, y, r) for x, y, r in pts)

def buds(pts, c="#F0A8B8"):
    return "".join('<path d="M%d %d v-30" stroke="#3E7A4A" stroke-width="3"/><path d="M%d %d q-9 -12 0 -26 q9 14 0 26z" fill="%s"/>' % (x, y, x, y - 28, c) for x, y in pts)

def palace(x, y, s=1, wall="#E8D4B0", roof="#A8523A", shade="#C4A880"):
    """A walled palace with pavilions and curved roofs (no people)."""
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-200" y="-50" width="400" height="50" fill="%s"/>'
            '<g fill="%s">%s</g>'
            '<rect x="-150" y="-110" width="120" height="60" fill="%s"/><rect x="20" y="-120" width="140" height="70" fill="%s"/><rect x="-40" y="-150" width="70" height="100" fill="%s"/>'
            '<g fill="%s"><path d="M-164 -108 Q-90 -132 -16 -108 L-30 -124 H-150z"/><path d="M6 -118 Q90 -144 174 -118 L160 -134 H20z"/><path d="M-54 -148 Q-5 -176 44 -148 L32 -170 H-42z"/><path d="M-24 -170 L-5 -196 L14 -170z"/></g>'
            '<g fill="#3A2A1A" opacity=".55"><rect x="-130" y="-94" width="10" height="16"/><rect x="-100" y="-94" width="10" height="16"/><rect x="-70" y="-94" width="10" height="16"/>'
            '<rect x="50" y="-102" width="10" height="16"/><rect x="85" y="-102" width="10" height="16"/><rect x="120" y="-102" width="10" height="16"/><rect x="-14" y="-130" width="16" height="22"/></g>'
            '<path d="M-20 0 v-30 a15 15 0 0 1 30 0 v30z" fill="#3A2A1A"/></g>') % (
        x, y, s, shade, wall, "".join('<rect x="%d" y="-62" width="12" height="12"/>' % xx for xx in range(-200, 200, 24)), wall, wall, wall, roof)

def sala(x, y, s=1, leaf="#4E7A3C", bloom="#F4E6C8", seed=3):
    """A tall sala tree in flower."""
    g = rng(seed)
    fl = "".join('<circle cx="%d" cy="%d" r="3"/>' % (-40 + next(g) % 80, -170 + next(g) % 110) for _ in range(28))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M0 0 V-90" stroke="#5A4030" stroke-width="10"/><g fill="%s"><ellipse cx="0" cy="-120" rx="44" ry="60"/><ellipse cx="-20" cy="-96" rx="30" ry="30"/><ellipse cx="22" cy="-100" rx="30" ry="30"/></g>'
            '<g fill="%s" opacity=".9">%s</g></g>') % (x, y, s, leaf, bloom, fl)

def pillar(x, y, s=1, c="#E6D6B6", cap="#D9B45A"):
    """A polished stone column crowned with a wheel, as in Ashoka's pillars (no figures)."""
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-12 0 L-9 -230 H9 L12 0z" fill="%s"/><path d="M2 -230 H9 L12 0 H4z" fill="#000" opacity=".1"/>'
            '<path d="M-18 -230 q18 -22 36 0z" fill="%s"/><rect x="-20" y="-246" width="40" height="12" rx="3" fill="%s"/>%s</g>') % (x, y, s, c, cap, cap, wheel(0, -272, 22, cap, 3))

def basket(x, y, s=1, c="#C89A5A", dark="#8A6030"):
    """A woven basket holding bundles of palm leaves."""
    weave = "".join('<path d="M%d -60 q4 30 0 60"/>' % xx for xx in range(-50, 60, 12))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-60 -60 h120 l-10 60 h-100z" fill="%s"/><g stroke="%s" stroke-width="2" fill="none" opacity=".7">%s<path d="M-58 -40 h116 M-56 -20 h112"/></g>'
            '<g fill="#E8D29A" stroke="#B89A5A" stroke-width=".8"><rect x="-54" y="-72" width="80" height="6" rx="3"/><rect x="-40" y="-80" width="90" height="6" rx="3"/><rect x="-50" y="-88" width="70" height="6" rx="3"/></g>'
            '<rect x="-64" y="-66" width="128" height="8" rx="4" fill="%s"/></g>') % (x, y, s, c, dark, weave, dark)

def raft(x, y, s=1, c="#B8905A", dark="#7A5A34"):
    logs = "".join('<rect x="-80" y="%d" width="160" height="9" rx="4.5" fill="%s"/>' % (-9 - i * 8, c if i % 2 else "#A8804A") for i in range(3))
    return ('<g transform="translate(%d %d) scale(%s)">%s<path d="M-60 -32 v16 M60 -32 v16 M0 -32 v16" stroke="%s" stroke-width="4"/><path d="M40 -30 L100 -80" stroke="%s" stroke-width="4" stroke-linecap="round"/></g>') % (x, y, s, logs, dark, dark)

def float_lanterns(pts, c="#F2B84A"):
    """Paper lanterns floating on water, each with a soft reflection."""
    return "".join('<g transform="translate(%d %d) scale(%s)"><ellipse cx="0" cy="14" rx="26" ry="7" fill="#F8B040" opacity=".8"/><rect x="-12" y="-22" width="24" height="24" fill="%s"/>'
                   '<rect x="-12" y="-22" width="24" height="24" fill="#FFF3C0" opacity=".35"/><path d="M-14 2 h28 l-3 5 h-22z" fill="#6A4A2C"/><path d="M-12 -22 h24" stroke="#6A4A2C" stroke-width="2"/></g>' % (x, y, sc, c) for x, y, sc in pts)

def brick_monastery(x, y, s=1, c="#B06A48", dark="#7A4430"):
    """Terraced brick walls of an old monastic university, rows of small cells."""
    cells = "".join('<rect x="%d" y="-70" width="16" height="22" fill="#3A2018" opacity=".6"/>' % xx for xx in range(-180, 180, 36))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-220 0 v-40 h440 v40z" fill="%s"/><path d="M-200 -40 v-50 h400 v50z" fill="%s"/><path d="M-120 -90 v-40 h240 v40z" fill="%s"/>%s'
            '<g stroke="%s" stroke-width="1.5" opacity=".6"><path d="M-220 -20 h440 M-200 -60 h400 M-120 -110 h240"/></g><path d="M-30 -130 v-30 h60 v30z" fill="%s"/></g>') % (x, y, s, c, dark, c, cells, dark, dark)

def hare_moon(p, x, y, r=70):
    """A full moon with the soft shape of a sitting hare in its markings."""
    d = rad(p + "hm", [(0, "#FFF8E0", .6), (1, "#FFF8E0", 0)])
    return d, ('<circle cx="%d" cy="%d" r="%d" fill="url(#%shm)"/><circle cx="%d" cy="%d" r="%d" fill="#F6F0DA"/>'
               '<g transform="translate(%d %d)" fill="#D8CCA8" opacity=".85"><ellipse cx="4" cy="16" rx="26" ry="20"/><circle cx="-22" cy="-4" r="13"/>'
               '<path d="M-26 -14 q-6 -30 4 -36 q4 14 2 34z M-18 -14 q2 -30 14 -32 q0 16 -6 34z"/><circle cx="28" cy="26" r="7"/></g>') % (
        x, y, r * 3, p, x, y, r, x, y)

def monkey(x, y, s=1, c="#6A4A30", flip=False):
    return ('<g transform="translate(%d %d) scale(%s)" fill="%s"><ellipse cx="0" cy="0" rx="14" ry="18"/><circle cx="0" cy="-24" r="10"/><ellipse cx="0" cy="-22" rx="6" ry="5" fill="#C8A078"/>'
            '<path d="M-10 -6 q-14 -20 -8 -40 M10 -6 q14 -20 8 -40" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M8 14 q24 10 18 34" stroke="%s" stroke-width="3" fill="none"/></g>') % (
        x, y, "%s %s" % (-s if flip else s, s), c, c, c)

def mango(x, y, s=1, leaf="#2E5A34", leaf2="#4E7A3C", fruit="#E8A040"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M0 0 q-4 -60 10 -110 M8 -80 q60 -30 150 -40" stroke="#4A3424" stroke-width="16" fill="none" stroke-linecap="round"/>'
            '<g fill="%s"><ellipse cx="0" cy="-150" rx="110" ry="60"/><ellipse cx="120" cy="-150" rx="90" ry="40"/><ellipse cx="-70" cy="-120" rx="60" ry="40"/></g>'
            '<g fill="%s"><ellipse cx="-20" cy="-170" rx="50" ry="22"/><ellipse cx="130" cy="-160" rx="40" ry="16"/></g>'
            '<g fill="%s"><ellipse cx="-40" cy="-110" rx="6" ry="9"/><ellipse cx="30" cy="-116" rx="6" ry="9"/><ellipse cx="90" cy="-126" rx="6" ry="9"/><ellipse cx="150" cy="-128" rx="6" ry="9"/></g></g>') % (x, y, s, leaf, leaf2, fruit)

def birds(pts, c="#3A3A4A"):
    return '<g stroke="%s" stroke-width="2.2" fill="none" stroke-linecap="round">%s</g>' % (c, "".join('<path d="M%d %d q8 -8 14 0 q6 -8 14 0"/>' % (x, y) for x, y in pts))

def temple_hall(x, y, s=1, wall="#F2E6D0", roof="#3A3A44", post="#A8323A"):
    """A Japanese temple hall: red posts, white walls, a wide curved tiled roof."""
    posts = "".join('<rect x="%d" y="-80" width="10" height="80" fill="%s"/>' % (xx, post) for xx in range(-110, 120, 44))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-130" y="-8" width="260" height="8" fill="#8A8278"/><rect x="-116" y="-80" width="232" height="72" fill="%s"/>%s'
            '<path d="M-170 -76 Q0 -100 170 -76 L130 -120 H-130z" fill="%s"/><path d="M-110 -122 Q0 -140 110 -122 L80 -150 H-80z" fill="%s"/>'
            '<path d="M-20 0 v-50 h40 v50z" fill="#5A3A22"/></g>') % (x, y, s, wall, posts, roof, roof)

# ---- the units -------------------------------------------------------------

CREDITS = {
    1: "Drawn scene: a palace gate at dawn and a road leading out across the fields to a great bodhi tree glowing in the morning light",
    2: "Drawn scene: a mango tree leaning over a river at night, monkeys in its branches, and a full moon whose markings look like a sitting hare",
    3: "Drawn scene: a still lotus pond at sunrise, deer resting on the bank and birds crossing a quiet sky",
    4: "Drawn scene: three woven baskets holding bundles of palm-leaf books beneath a stone arch, a tied palm-leaf manuscript in front",
    5: "Drawn scene: a road winding from a palace past a bodhi tree and a deer park to a grove of flowering sala trees",
    6: "Drawn scene: a golden Dharma wheel shining above two resting deer at the edge of a lotus pond",
    7: "Drawn scene: paper lanterns floating on a river at dusk beneath strings of festival lanterns and a temple roof",
    8: "Drawn scene: a stone pillar crowned with a wheel and a white stupa on the plains, a road running toward far mountains and a pagoda",
    9: "Drawn scene: palm-leaf manuscripts stacked on the shelves of a monastery library, an oil lamp burning on the table",
}

def b1(p):
    s = Scene(p); s.add(sky(p, ["#5A6A9A", "#E8A078", "#FCE3B0", "#FFF2D6"]), sun(p, 860, 250, 30), clouds([(300, 90, 140), (1000, 70, 120)], ".35"))
    s.add(ridge(270, 12, 11, "#B89A88"), ground(290, "#A8B070"), palace(210, 300, .9))
    s.add('<path d="M330 420 Q560 320 820 300" stroke="#E6CFA0" stroke-width="34" fill="none" opacity=".85"/>')
    s.add(glow(p, 880, 190, 200, "#FFF2C0", ".5"), bodhi(880, 330, .95), ground(340, "#8A9A58"))
    s.add(buds([(560, 404), (600, 410), (1080, 400)]), birds([(640, 110), (680, 96), (720, 118)], "#6A5A6A"))
    return s.svg(CREDITS[1])

def b2(p):
    s = Scene(p); s.add(sky(p, ["#0A1430", "#16284A", "#2A3A62"]), stars(21, 160, 230), hare_moon(p, 880, 120, 64))
    s.add(ridge(270, 14, 22, "#1A2640"), water(p, 300, "#2E4A74", "#0E1C34"))
    s.add('<ellipse cx="880" cy="340" rx="50" ry="8" fill="#F6F0DA" opacity=".35"/><ellipse cx="880" cy="366" rx="30" ry="5" fill="#F6F0DA" opacity=".25"/>')
    s.add('<path d="M0 320 Q160 290 360 320 V420 H0z" fill="#1E3020"/>', mango(170, 330, 1.05, "#1E3A28", "#2E5A3A", "#C88A3A"))
    s.add(monkey(250, 190, .9), monkey(320, 198, .8, flip=True), monkey(120, 216, .85))
    s.add('<path d="M1200 330 Q1060 300 960 340 V420 H1200z" fill="#1E3020"/>')
    return s.svg(CREDITS[2])

def b3(p):
    s = Scene(p); s.add(sky(p, ["#9AB8D8", "#F4C8A8", "#FCE8C8"]), sun(p, 600, 230, 32, "#FFF6D8", "#FFD89A"))
    s.add(ridge(240, 10, 31, "#9AA8B8"), ridge(262, 12, 32, "#7A9A7A"))
    s.add(water(p, 272, "#C8DCE0", "#7AA8B4"))
    s.add(pads([(200, 330, 40), (330, 360, 34), (760, 350, 38), (920, 380, 44), (470, 395, 30)]), big_lotus(420, 330, .7), big_lotus(840, 360, .8, "#F6D0DA", "#E8A0B0"), buds([(260, 340), (980, 360), (560, 370)]))
    s.add('<path d="M1200 300 Q1060 280 980 310 Q1080 300 1200 330z" fill="#6E8A58"/>', deer(1080, 306, .8, flip=True), deer(1150, 314, .6, "#A87A44", down=True))
    s.add(birds([(300, 90), (340, 76), (380, 96)], "#5A6A7A"))
    return s.svg(CREDITS[3])

def b4(p):
    s = Scene(p); s.add(wall(p, "#E8D8B8", "#C8B08A"))
    s.add('<path d="M340 300 V120 a260 120 0 0 1 520 0 V300z" fill="#8A6A48"/><path d="M380 300 V130 a220 96 0 0 1 440 0 V300z" fill="#3A5A6A"/>')
    s.add('<path d="M380 300 V240 Q600 200 820 240 V300z" fill="#5A7A5A"/>', stupa(600, 244, .4))
    s.add(table(300, "#8A5A34", "#5A3A22"))
    s.add(basket(465, 300, 1), basket(600, 300, 1.05, "#D0A868"), basket(735, 300, 1))
    s.add(palm_leaf(600, 384, 1.25))
    s.add(big_lotus(170, 360, .6).replace("#3E7A4A", "#8A5A34", 1), big_lotus(1030, 360, .6).replace("#3E7A4A", "#8A5A34", 1))
    return s.svg(CREDITS[4])

def b5(p):
    s = Scene(p); s.add(sky(p, ["#7AA0C8", "#C8D8E0", "#F6E6C0"]), sun(p, 1080, 90, 26), clouds([(400, 70, 120), (760, 100, 100)], ".45"))
    s.add(mountains([(820, 150, 200), (1000, 170, 180)], "#9AA0B0"), ridge(250, 12, 51, "#8AA070"), ground(280, "#9AB068"))
    s.add('<path d="M120 420 Q300 300 470 320 T820 300 T1120 286" stroke="#E6CFA0" stroke-width="26" fill="none" opacity=".9"/>')
    s.add(palace(150, 300, .5), bodhi(470, 300, .45, seed=7), deer(690, 304, .55), deer(780, 306, .5, flip=True), wheel(735, 240, 20, "#C8A040", 3))
    s.add(sala(1060, 290, .7), sala(1130, 294, .55, seed=4), ground(350, "#7E9A58"))
    s.add(buds([(220, 400), (900, 390), (960, 404)]))
    return s.svg(CREDITS[5])

def b6(p):
    s = Scene(p); s.add(sky(p, ["#2A4A7A", "#7A8AB0", "#F2C890", "#FCE6C0"]))
    s.add(glow(p, 600, 150, 240, "#FFE8A0", ".55"), wheel(600, 150, 86, "#E8C050", 9))
    s.add(ridge(270, 10, 61, "#6A7A70"), ground(290, "#7E9A58"))
    s.add(deer(470, 310, .9), deer(730, 310, .9, flip=True))
    s.add(water(p, 340, "#A8C8D0", "#5A8A9A"), pads([(160, 380, 40), (300, 400, 30), (900, 386, 38), (1060, 370, 36)]), big_lotus(220, 372, .55), big_lotus(990, 378, .6, "#F6D0DA"), buds([(380, 396), (820, 400)]))
    return s.svg(CREDITS[6])

def b7(p):
    s = Scene(p); s.add(sky(p, ["#1E2A5A", "#6A4A7A", "#E07A5A", "#F6B878"]), stars(71, 40, 110, op=".6"))
    s.add(ridge(230, 12, 71, "#3A2A4A"), temple_hall(880, 262, .9, "#E8D6C0", "#2A2A38"), pagoda(1080, 262, .7, "#8A3A2A", "#2A2A38"))
    s.add(lanterns(40, 30, 7, 110, ("#E4573D", "#F2C964", "#F0923A", "#F4EAD2")))
    s.add(water(p, 262, "#6A5A8A", "#1E2A4A"))
    s.add(float_lanterns([(150, 320, 1), (290, 350, 1.2), (430, 312, .9), (560, 372, 1.3), (700, 332, 1), (840, 380, 1.3), (980, 340, 1), (1100, 390, 1.2), (380, 400, 1.3), (620, 300, .7), (900, 298, .7)]))
    return s.svg(CREDITS[7])

def b8(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#B8D0E0", "#F6E6C0"]), sun(p, 150, 90, 24), clouds([(700, 80, 140)], ".4"))
    s.add(mountains([(900, 110, 200), (1080, 130, 170), (760, 160, 150)], "#8A94AA", "#2A3040"), '<g fill="#F4F4F8"><path d="M900 110 l-34 46 l16 -6 l18 12 l16 -12 l18 6z"/><path d="M1080 130 l-28 38 l14 -4 l14 10 l14 -10 l14 4z"/></g>')
    s.add(pagoda(1000, 262, .55, "#8A3A2A", "#3A2A2A"), ridge(260, 10, 81, "#A8A070"), ground(290, "#C8B070"))
    s.add('<path d="M200 420 Q500 330 800 300 T1020 268" stroke="#E6CFA0" stroke-width="30" fill="none" opacity=".85"/>')
    s.add(pillar(230, 350, 1), stupa(520, 316, .9), palm(700, 316, 1, 4), palm(390, 330, .8, -5))
    return s.svg(CREDITS[8])

def b9(p):
    s = Scene(p); s.add(wall(p, "#6A3A2A", "#4A2A20"))
    s.add(glow(p, 820, 250, 260, "#FFD890", ".3"))
    for yy in (100, 190, 280):
        s.add('<rect x="80" y="%d" width="560" height="10" fill="#8A5A34"/>' % yy)
        for i, xx in enumerate(range(150, 620, 170)):
            s.add(palm_leaf(xx, yy, .5, 0, ("#E8D29A", "#DCC488", "#EEDCA8")[i % 3], ("#7A4A2A", "#A8323A", "#5A3A22")[i % 3], 5 + i % 3))
    s.add('<rect x="700" y="60" width="200" height="220" fill="#E8D8B8"/><path d="M710 280 V130 a90 60 0 0 1 180 0 V280z" fill="#3A5A7A"/>', stupa(800, 280, .45, "#C8D0D8", "#8A98A8", "#C8A860"))
    s.add(table(296, "#8A5A34", "#5A3A22"), open_leaf(520, 330, 1), lamp(860, 330, 1.2), flags(960, 40, 1200, 70, 20, 7))
    return s.svg(CREDITS[9])

BANNERS = {n: globals()["b%d" % n]("bdb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
