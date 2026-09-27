"""AOG-CHN-V1 — drawn unit banners for the Chinese Classics course, units 10–17.
Uses banner_kit.py and the Chinese pieces in banners_chn_a.py. Sages appear
only as tiny, still, respectful silhouettes far off. No lettering.
Ids are prefixed "cnb{n}-"."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from banners_chn_a import *

def junk(x, y, s=1, hull="#3A2A22", sail="#B8704A", rib="#6A3A28"):
    """A sailing junk with ribbed sails."""
    def sl(x0, h, w):
        ribs = "".join('<path d="M%d %d h%d"/>' % (x0, -30 - k * h // 5, w) for k in range(1, 5))
        return '<path d="M%d -30 v%d h%d l%d %d z" fill="%s"/><g stroke="%s" stroke-width="2">%s</g>' % (x0, -h, w, 8, h, sail, rib, ribs)
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-90 -30 H96 l20 -12 l-10 30 q-100 20 -190 0 l-20 -24z" fill="%s"/>'
            '<path d="M-40 -30 v-110 M30 -30 v-130" stroke="%s" stroke-width="4"/>%s%s</g>') % (x, y, s, hull, hull, sl(-40, 100, 60), sl(30, 120, 66))

def cells(x, y, n, s=1, wallc="#8A7A68", rf="#2E3434"):
    """A long row of examination cells: one small open cubicle after another."""
    out = '<g transform="translate(%d %d) scale(%s)"><rect x="0" y="-60" width="%d" height="60" fill="%s"/>' % (x, y, s, n * 34 + 6, wallc)
    out += "".join('<rect x="%d" y="-48" width="24" height="48" fill="#2A2420"/><rect x="%d" y="-24" width="24" height="4" fill="#C9A870"/>' % (8 + i * 34, 8 + i * 34) for i in range(n))
    out += '<path d="M-10 -58 H%d l-8 -14 H-2z" fill="%s"/>' % (n * 34 + 16, rf)
    return out + "</g>"

def wheel(x, y, r, c="#6A4A2C"):
    """A cart wheel of thirty spokes around an empty hub."""
    import math
    sp = "".join('<path d="M%.1f %.1f L%.1f %.1f"/>' % (math.cos(a) * 12, math.sin(a) * 12, math.cos(a) * (r - 6), math.sin(a) * (r - 6))
                 for a in (i * math.pi / 15 for i in range(30)))
    return ('<g transform="translate(%d %d)"><circle r="%d" fill="none" stroke="%s" stroke-width="10"/><g stroke="%s" stroke-width="2.5">%s</g>'
            '<circle r="13" fill="none" stroke="%s" stroke-width="6"/></g>') % (x, y, r - 5, c, c, sp, c)

def bowl(x, y, s=1, c="#B8704A", inner="#5A2E1E"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-60 -46 Q-56 0 0 0 Q56 0 60 -46z" fill="%s"/><ellipse cx="0" cy="-46" rx="60" ry="12" fill="%s"/>'
            '<path d="M-54 -30 q54 16 108 0" stroke="#8A4A2A" stroke-width="3" fill="none"/></g>') % (x, y, s, c, inner)

def frog(x, y, s=1, c="#5E8A3E"):
    return ('<g transform="translate(%d %d) scale(%s)" fill="%s"><ellipse cx="0" cy="-10" rx="16" ry="10"/><circle cx="-8" cy="-20" r="5"/><circle cx="8" cy="-20" r="5"/>'
            '<path d="M-16 -4 q-10 2 -14 6 h10z M16 -4 q10 2 14 6 h-10z"/><circle cx="-8" cy="-21" r="2" fill="#1A1A1A"/><circle cx="8" cy="-21" r="2" fill="#1A1A1A"/></g>') % (x, y, s, c)

def fish(x, y, s=1, c="#E8783A", rot=0):
    return ('<g transform="translate(%d %d) scale(%s) rotate(%d)"><path d="M-30 0 q20 -16 44 0 q-24 16 -44 0z" fill="%s"/><path d="M12 0 l14 -10 v20z" fill="%s"/>'
            '<circle cx="-20" cy="-2" r="2" fill="#1A1A1A"/><path d="M-6 -8 q6 8 0 16" stroke="#FFFFFF" stroke-width="1.5" fill="none" opacity=".5"/></g>') % (x, y, s, rot, c, c)

def ox(x, y, s=1, c="#6A5444"):
    """An ox grazing with its head down."""
    return ('<g transform="translate(%d %d) scale(%s)" fill="%s"><path d="M-50 -40 q10 -14 40 -12 h40 q16 0 22 14 l10 24 q2 10 -8 12 l-6 -2 l-8 -18 v42 h-8 v-24 h-50 v24 h-8 v-24 h-6 v24 h-8 v-26 q-12 -10 -10 -30z"/>'
            '<path d="M60 -30 q10 -8 18 -4 M60 -30 q-2 -10 6 -14" stroke="%s" stroke-width="3" fill="none"/><path d="M-50 -36 q-12 10 -8 30" stroke="%s" stroke-width="3" fill="none"/></g>') % (x, y, s, c, c, c)

def candle(x, y, s=1):
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-8" y="-50" width="16" height="50" fill="#C8323A"/><rect x="-18" y="0" width="36" height="6" fill="#8A6A3A"/>'
            '<ellipse cx="0" cy="-66" rx="12" ry="18" fill="#FFE08A" opacity=".35"/><path d="M0 -52 q-6 -8 0 -20 q6 12 0 20z" fill="#F0923A"/><path d="M0 -54 q-3 -5 0 -12 q3 7 0 12z" fill="#FFF3C0"/></g>') % (x, y, s)

def open_thread_book(x, y, s=1):
    """An open thread-bound book: columns of short marks, red commentary marks between (not letters)."""
    g = rng(x); cols = ""
    for side in (-1, 1):
        for i in range(8):
            cx = side * (14 + i * 12)
            cols += "".join('<rect x="%d" y="%d" width="4" height="%d" fill="%s"/>' % (cx - 2, yy, 3 + next(g) % 4, "#2A2420" if next(g) % 5 else "#B8323A") for yy in range(-78, -12, 9))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-116 0 V-88 H116 V0z" fill="#F4EAD2"/><path d="M0 -88 V0" stroke="#C9B894" stroke-width="2"/>'
            '<rect x="-116" y="-92" width="232" height="4" fill="#2E4A6A"/><g opacity=".75">%s</g></g>') % (x, y, s, cols)

def plum_branch(x, y, s=1, c="#3A2A22", b="#E86A7A"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M0 0 q40 20 90 10 q30 -8 60 20 M60 12 q10 30 40 44 M110 12 q20 -20 50 -20" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round"/>'
            '<g fill="%s">%s</g></g>') % (x, y, s, c, b, "".join('<circle cx="%d" cy="%d" r="5"/>' % pt for pt in ((40, 14), (86, 8), (100, 56), (150, 28), (160, -8), (72, 30), (124, 4))))

CREDITS = {
    10: "Drawn scene: a mountain temple with a two-storey pavilion on a misty peak, cranes flying past, bamboo books on a rock below",
    11: "Drawn scene: a long row of examination cells before a walled hall at sunset, and a sailing junk heading out across the sea",
    12: "Drawn scene: a quiet study with a seven-string zither and an unrolled bamboo book on a low table, bamboo and plum blossom at the window",
    13: "Drawn scene: a small village beside a winding river in an ink valley, a cart wheel and an empty clay bowl in the foreground",
    14: "Drawn scene: a stone well with a frog on its rim, an ox grazing in a field, and fish swimming under a stone bridge",
    15: "Drawn scene: a desk at night with open books full of red commentary marks, a candle, stacks of books and a moonlit window",
    16: "Drawn scene: two pavilions facing each other across a lake, joined by a long stone bridge, a pale taiji circle in the sky",
    17: "Drawn scene: a modern city beside ink mountains at dusk, and on a table in front an unrolled bamboo book, a brush and a zither",
}

def b10(p):
    s = Scene(p); s.add(sky(p, ["#C8D8DC", "#EAEEE6", "#F4EEDF"]))
    s.add(peaks(330, [(160, 220, 110), (420, 150, 120), (1080, 200, 120)], "#9AAAB0", ".7"), mist(p, 180, 160, c="#F4EEDF", tag="m1"))
    s.add(peaks(420, [(720, 280, 150)], "#4A5E68"), pavilion(720, 146, .62, "#9A2E32", "#1E2A30", "#8A8478", tiers=2))
    s.add(mist(p, 240, 110, c="#F4EEDF", tag="m2", op=".75"), pine(560, 330, .8, "#2E3E3A"))
    s.add(crane(300, 120, .9), crane(420, 170, .6), crane(1000, 90, .7))
    s.add('<path d="M0 420 V360 q80 -30 200 -20 q80 8 120 80z" fill="#6A6A62"/>', slips(40, 372, .55, 9), slip_bundle(250, 366, .6))
    return s.svg(CREDITS[10])

def b11(p):
    s = Scene(p); s.add(sky(p, ["#5A5A8A", "#D08A6A", "#F6C890"]), sun(p, 980, 250, 34, "#FFF0C8", "#F6A870"))
    s.add(water(p, 270, "#E8A880", "#5A5A7A"), '<path d="M0 240 Q300 230 600 250 L620 420 H0z" fill="#8A7A62"/>')
    s.add(hall(290, 250, .9, "#8A2E2E", "#2A2426"), cells(40, 330, 14, 1, "#A89478", "#3A3432"))
    s.add(junk(900, 330, .9, "#2A2020", "#A8603A", "#5A3020"))
    s.add('<path d="M0 360 Q300 346 640 372 L660 420 H0z" fill="#6A5A48"/>')
    return s.svg(CREDITS[11])

def b12(p):
    s = Scene(p); s.add(wall(p, "#E6DCC4", "#CDBE9E"))
    s.add('<circle cx="920" cy="160" r="130" fill="#6A3A28"/><circle cx="920" cy="160" r="118" fill="#DCE8E8"/>')
    s.add('<g clip-path="url(#%sround)">' % p, peaks(290, [(840, 120, 100), (1010, 150, 90)], "#A4B4B8", ".8"),
          bamboo(870, 290, 220, "#5E8A5A", "#3E6A3E", -3), bamboo(960, 290, 180, "#6E9A5E", "#4E7A4A", 4), "</g>")
    s.d.append('<clipPath id="%sround"><circle cx="920" cy="160" r="118"/></clipPath>' % p)
    s.add(plum_branch(640, 60, 1.1))
    s.add('<rect y="340" width="1200" height="80" fill="#8A6A48"/><path d="M0 340 H1200" stroke="#6A4A2C" stroke-width="4"/>')
    s.add(low_table(430, 300, 660), slips(120, 300, .62, 10), guqin(560, 300, .9))
    return s.svg(CREDITS[12])

def b13(p):
    s = Scene(p); s.add(ink_sky(p, ("#DCE2E0", "#F2EEE2", "#EDE3CC")))
    s.add(peaks(290, [(100, 200, 120), (330, 240, 120), (880, 230, 130), (1120, 200, 120)], "#8A9AA4", ".7"), mist(p, 170, 140, c="#F2EEE2", tag="m1"))
    s.add(ground(290, "#B8BC98"), '<path d="M600 290 Q520 320 640 350 Q780 390 700 420 H880 Q940 380 800 346 Q660 316 640 290z" fill="#9CB8C0"/>')
    s.add(house(470, 316, .45, "#E6DCC4", "#3A3A3A", "#5A3A22", "#F6D98A"), house(540, 300, .38, "#E6DCC4", "#3A3A3A", "#5A3A22", "#F6D98A"),
          house(780, 306, .42, "#E6DCC4", "#3A3A3A", "#5A3A22", "#F6D98A"), sampan(730, 334, .45))
    s.add(ground(370, "#8A9A6A"), wheel(200, 330, 64), bowl(1000, 400, 1.2))
    return s.svg(CREDITS[13])

def b14(p):
    s = Scene(p); s.add(sky(p, ["#9CC0D8", "#DCE8E8", "#F4EEDC"]), peaks(260, [(150, 120, 140), (1050, 140, 150)], "#A4B4B8", ".7"))
    s.add(ground(260, "#9AB07A"), ox(560, 294, .75), tree(120, 280, .8, "#5E7A4A", "#7A9A5A"))
    s.add(water(p, 320, "#8AB4C4", "#4A7A94"), bridge(820, 330, 150, 1, "#A89C8A"))
    s.add(fish(700, 380, 1, "#E8783A", -8), fish(780, 396, .8, "#F2C964", 10), fish(900, 376, .9, "#E8783A", 4))
    s.add('<path d="M0 420 V340 q200 -20 470 10 l30 70z" fill="#7A9A5A"/>', stone_well(300, 404, 1.1), frog(318, 368, 1))
    return s.svg(CREDITS[14])

def b15(p):
    s = Scene(p); s.add(wall(p, "#2E2420", "#1E1814"), window(p, 940, 240, 170, 190, ("#3A4A7A", "#1E3458", "#0A1E33"), "#5A3A28"))
    s.add(moon(990, 110, 18), glow(p, 470, 250, 230, op=".4"), table(300, "#6A3A28", "#3A2018"))
    s.add(thread_books(40, 300, 1.2), thread_books(200, 300, 1, ("#6A2E2E", "#2E4A6A", "#3A5A4A")))
    s.add(open_thread_book(640, 300, 1.2), candle(430, 300, 1.1), brush_ink(1000, 300, .9))
    return s.svg(CREDITS[15])

def b16(p):
    s = Scene(p); s.add(sky(p, ["#B8CCD8", "#E8EAE2", "#F4ECDA"]), taiji(600, 90, 44, "#3A4A54", "#F8F2E4", ".6"))
    s.add(peaks(270, [(100, 150, 140), (1100, 160, 140), (600, 110, 180)], "#9AAAB0", ".6"), mist(p, 190, 100, c="#F4ECDA", tag="m1"))
    s.add(water(p, 270, "#B8D0D8", "#6A94A8"))
    s.add('<path d="M0 300 Q120 280 260 300 Q320 360 250 420 H0z" fill="#7A8A5A"/><path d="M1200 300 Q1080 280 940 300 Q880 360 950 420 H1200z" fill="#7A8A5A"/>')
    s.add(pavilion(150, 300, .9, "#9A2E32", "#1E2A30"), pavilion(1050, 300, .9, "#9A2E32", "#1E2A30"))
    s.add('<path d="M240 300 Q600 250 960 300" stroke="#A89C8A" stroke-width="12" fill="none"/><path d="M240 290 Q600 240 960 290" stroke="#6A6258" stroke-width="2" fill="none"/>')
    s.add("".join('<path d="M%d %d v28" stroke="#A89C8A" stroke-width="6"/>' % (x, 300 - 50 * (1 - ((x - 600) / 360.0) ** 2)) for x in range(300, 960, 60)))
    s.add(sage(560, 268, .5, "#2A2E34", staff=True), sage(640, 268, .5, "#2A2E34"))
    return s.svg(CREDITS[16])

def b17(p):
    s = Scene(p); s.add(sky(p, ["#2A3A62", "#8A6A8A", "#F0A880", "#F6D2A8"]))
    s.add(peaks(270, [(120, 190, 130), (360, 150, 120), (1080, 200, 130)], "#5A5A7A", ".8"), mist(p, 180, 100, c="#F6D2A8", tag="m1", op=".6"))
    s.add(skyline(270, "#2E3A5A", "#F6D98A", 11), pagoda(250, 270, .8, "#8A2E2E", "#1E2230"))
    s.add(water(p, 268, "#6A6A8A", "#2A3450"))
    s.add(table(330, "#6A3A28", "#3A2018"), slips(60, 330, .8, 12), brush_ink(360, 330, .9), guqin(800, 330, 1.1))
    return s.svg(CREDITS[17])

BANNERS = {n: globals()["b%d" % n]("cnb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
