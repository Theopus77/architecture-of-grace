"""AOG-HIN-V1 — drawn unit banners for the Hindu Texts course, units 10–17.
Uses the kit and the Indian pieces in banners_hin_a. No people, no figure of
any deity, no lettering. Ids prefixed "hnb{n}-"."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from banners_hin_a import *

def gopuram(x, y, s=1, c="#D8B888", shade="#A8845A", door="#3A2412"):
    """A south-Indian gateway tower: stepped tiers and a barrel roof, no figures."""
    out = '<g transform="translate(%d %d) scale(%s)"><rect x="-80" y="-70" width="160" height="70" fill="%s"/><path d="M-20 0 v-50 a20 20 0 0 1 40 0 v50z" fill="%s"/>' % (x, y, s, c, door)
    for i in range(6):
        w = 76 - i * 10; yy = -70 - i * 30
        out += '<path d="M%d %d L%d %d H%d L%d %dz" fill="%s"/><path d="M%d %d h%d" stroke="%s" stroke-width="4"/>' % (-w, yy, -w + 5, yy - 30, w - 5, w, yy, c, -w, yy, 2 * w, shade)
        out += "".join('<rect x="%d" y="%d" width="6" height="12" fill="%s" opacity=".7"/>' % (k, yy - 22, shade) for k in range(-w + 12, w - 12, 18))
    return out + '<path d="M-24 -250 q24 -26 48 0z" fill="%s"/><g fill="#D9A43A"><path d="M-14 -262 l4 -14 l4 14z"/><path d="M-3 -266 l4 -14 l4 14z"/><path d="M8 -262 l4 -14 l4 14z"/></g></g>' % shade

def tanpura(x, y, s=1, rot=-8, wood="#8A4A22", gourd="#B8763A"):
    strings = "".join('<path d="M%d -30 V-330" stroke="#EDE0C0" stroke-width="1"/>' % sx for sx in (-6, -2, 2, 6))
    return ('<g transform="translate(%d %d) scale(%s) rotate(%d)"><ellipse cx="0" cy="-40" rx="54" ry="46" fill="%s"/><ellipse cx="0" cy="-48" rx="40" ry="30" fill="#D9A45A" opacity=".45"/>'
            '<rect x="-12" y="-340" width="24" height="300" rx="6" fill="%s"/><path d="M-12 -130 h24 M-12 -230 h24" stroke="#D9A43A" stroke-width="3"/>%s'
            '<g fill="#5A2A10"><circle cx="-16" cy="-310" r="5"/><circle cx="16" cy="-290" r="5"/><circle cx="-16" cy="-270" r="5"/><circle cx="16" cy="-320" r="5"/></g></g>') % (x, y, s, rot, gourd, wood, strings)

def crane(x, y, s=1, c="#F2F0EA"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-2 0 v-40 M8 0 v-40" stroke="#6A5A4A" stroke-width="2.5"/><path d="M-30 -52 q10 -24 40 -18 q10 4 14 -10 q4 -30 4 -50 q6 -8 14 0 l20 8 l-20 -2 q-2 30 -8 56 q-8 24 -34 26 q-20 0 -30 -10z" fill="%s"/>'
            '<path d="M-30 -52 l-22 12 l18 -4z" fill="#3A3A4A"/><circle cx="66" cy="-122" r="1.6" fill="#1A1410"/></g>') % (x, y, s, c)

def chaupar(x, y, s=1):
    """A red game cloth with a gold border and three long dice (the dice game of the epic)."""
    dice = "".join('<g transform="translate(%d %d) rotate(%d)"><rect x="-34" y="-8" width="68" height="16" rx="3" fill="#F2E6C8"/><rect x="-34" y="4" width="68" height="4" rx="2" fill="#C8B898"/>'
                   '<g fill="#3A2A1A"><circle cx="-18" cy="-1" r="2.4"/><circle cx="0" cy="-1" r="2.4"/><circle cx="18" cy="-1" r="2.4"/></g></g>' % (dx, dy, r) for dx, dy, r in ((-60, -6, -8), (10, 4, 6), (70, -10, 20)))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-170 10 L-120 -40 H150 L190 10z" fill="#A8323A"/><path d="M-160 4 L-116 -34 H146 L180 4z" fill="none" stroke="#F2C964" stroke-width="3"/>'
            '<path d="M-30 -34 L-38 4 M30 -34 L36 4 M-140 -14 H164" stroke="#F2C964" stroke-width="2" opacity=".7"/>%s</g>') % (x, y, s, dice)

def citadel(x, y, s=1, brick="#B87A4A", dark="#8A5232"):
    """A mud-brick citadel on a platform with a stepped great bath (Indus cities)."""
    rows = "".join('<path d="M-220 %d h440" stroke="%s" stroke-width="1.5" opacity=".6"/>' % (yy, dark) for yy in range(-10, -80, -10))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-240 0 L-220 -80 H220 L240 0z" fill="%s"/>%s'
            '<rect x="-140" y="-130" width="120" height="50" fill="%s"/><rect x="20" y="-150" width="90" height="70" fill="%s"/><rect x="120" y="-118" width="70" height="38" fill="%s"/>'
            '<path d="M60 -150 v-40 h30 v40" fill="%s"/><path d="M-120 -86 h80 v-6 h-6 v-6 h-68 v6 h-6z" fill="#6FA8C0"/>'
            '<g fill="%s"><rect x="-120" y="-120" width="10" height="14"/><rect x="40" y="-136" width="10" height="14"/><rect x="70" y="-136" width="10" height="14"/><rect x="140" y="-108" width="10" height="14"/></g></g>') % (
        x, y, s, brick, rows, brick, brick, brick, dark, dark)

CREDITS = {
    10: "Drawn scene: a riverside village shrine at evening, a stringed tanpura resting in the grass beside an open palm-leaf book and a lamp",
    11: "Drawn scene: an old brick city by the sea, a sailing ship crossing to a far shore, and a modern city skyline with a temple tower",
    12: "Drawn scene: an empty chariot with its pennant raised on a wide field at sunrise, rows of banners far off on both sides, a conch in front",
    13: "Drawn scene: a night sky thick with stars above a still lotus pond, a soft Om glowing in the sky and one lamp at the water's edge",
    14: "Drawn scene: first light rising over dark waters, a still lake with a white crane, and a cross-shaped game board with long dice",
    15: "Drawn scene: a gateway tower, a temple and a school along a river, with palm-leaf books and printed books in the foreground",
    16: "Drawn scene: a palm-leaf book, an open book and a rolled scroll side by side on a table in lamplight, a balance scale between them",
    17: "Drawn scene: river steps at dusk with temples, bells and a conch, and many small lamps floating on the water",
}

def b10(p):
    s = Scene(p); s.add(sky(p, ["#3A3A6A", "#C07A7A", "#F2C08A"]), sun(p, 260, 230, 26, "#FFEAC0", "#F8B070"))
    s.add(ridge(236, 14, 71, "#6A5A6A"), ground(256, "#6E7A4A"), water(p, 280, "#D8B8A8", "#5A6A8A"), reflect(260, 294, 90, "#FFE0B0", 4, ".5"))
    s.add(temple(840, 280, .5, "#E8C890", "#B89060"), palm(700, 276, .9, -4), palm(1000, 276, 1, 5), tree(1120, 282, 1, "#3E6A3C", "#5E8A4C"))
    s.add(ground(340, "#4E6A34"))
    s.add(tanpura(420, 404, .7, -66), open_leaf(720, 392, 1.05), lamp(960, 400, 1))
    s.add(glow(p, 1020, 360, 70, op=".45"), '<g fill="#F08A24">%s</g>' % "".join('<circle cx="%d" cy="%d" r="6"/>' % (x, 408 - (x % 3) * 3) for x in range(520, 600, 14)))
    return s.svg(CREDITS[10])

def b11(p):
    s = Scene(p); s.add(sky(p, ["#4A7AAA", "#A8C8D8", "#F2DEB8"]), clouds([(520, 70, 180), (900, 50, 150)], ".7"))
    s.add('<clipPath id="%sr"><rect x="820" y="0" width="380" height="420"/></clipPath>' % p)
    s.add('<g clip-path="url(#%sr)" opacity=".85">' % p + skyline(262, "#5A6A8A", "#F6D98A", 11) + "</g>")
    s.add(ground(250, "#C8A878"), citadel(220, 262, .85))
    s.add('<path d="M430 420 L430 280 Q700 262 1200 266 V420z" fill="#4F8CA4"/>', '<path d="M430 280 Q700 262 1200 266 V278 Q720 276 430 294z" fill="#A8D0DC" opacity=".6"/>')
    s.add(sail_ship(640, 336, .9))
    s.add(temple(1060, 262, .35, "#E8D0A8", "#B8987A"))
    s.add('<g stroke="#FFFFFF" stroke-width="1.5" opacity=".5">%s</g>' % "".join('<path d="M%d %d h40"/>' % (x, 320 + (x * 7) % 70) for x in range(470, 1200, 110)))
    return s.svg(CREDITS[11])

def b12(p):
    s = Scene(p); s.add(sky(p, ["#3A2A5A", "#C0605A", "#F6B870"]), sun(p, 600, 250, 56, "#FFF0C0", "#FFA860"))
    s.add(ground(250, "#B8885A"))
    s.add('<g fill="#6A4A3A" opacity=".75">%s</g>' % "".join('<path d="M%d 252 v-44 l18 6 l-18 6"/><rect x="%d" y="208" width="3" height="44"/>' % (x, x - 1) for x in list(range(40, 420, 34)) + list(range(800, 1180, 34))))
    s.add('<path d="M0 262 Q600 240 1200 262 V300 H0z" fill="#E8C090" opacity=".35"/>', ground(300, "#9A6A40"))
    s.add(horse(830, 380, 1.1, "#F2EAD8"), horse(780, 390, 1.1, "#E4DCC8"))
    s.add(chariot(520, 396, 1.05, "#6A2A22"))
    s.add(conch(170, 400, 1.2), open_leaf(1060, 404, .5))
    return s.svg(CREDITS[12])

def b13(p):
    s = Scene(p); s.add(sky(p, ["#060A22", "#141E4A", "#2A2A5A"]))
    s.add(lin(p + "mw", [(0, "#8A8AC8", 0), (.5, "#B8B0E0", .35), (1, "#8A8AC8", 0)], 1, 0), '<path d="M0 240 Q600 0 1200 60 L1200 130 Q600 70 0 300z" fill="url(#%smw)"/>' % p)
    s.add(stars(131, 160, 260), stars(132, 60, 260, "#FFE8B0", ".7"))
    s.add(glow(p, 600, 130, 120, "#F2C964", ".3"), om(590, 170, .9, "#F2D48A", ".85"))
    s.add(ridge(270, 10, 81, "#141A34"), '<rect x="0" y="284" width="1200" height="136" fill="#10183A"/>')
    s.add('<g opacity=".35">%s</g>' % stars(133, 50, 120).replace('<g fill', '<g transform="translate(0 290)" fill', 1))
    s.add(reflect(600, 300, 90, "#F2C964", 5, ".3"))
    s.add(lotus_pond(330, [120, 300, 820, 1000]), lotus(600, 392, .9, "#F6D0DA"))
    s.add(diya(760, 404, 1.1))
    return s.svg(CREDITS[13])

def b14(p):
    s = Scene(p); s.add(sky(p, ["#0A0E22", "#2A2A4A", "#A07A6A"]), stars(141, 40, 120, op=".6"))
    s.add(glow(p, 300, 250, 240, "#FFD8A0", ".5"), '<rect x="0" y="250" width="1200" height="170" fill="#1A2238"/>', reflect(300, 262, 160, "#FFD8A0", 6, ".45"))
    s.add('<path d="M560 420 V270 Q800 240 1200 250 V420z" fill="#4E6A44"/>', '<path d="M620 420 Q640 300 900 296 Q1140 300 1200 330 V420z" fill="#5A8AA0"/>')
    s.add(cypress(1140, 300, .7, "#2E4A2A"), tree(640, 290, .9, "#2E5A34", "#4E7A44"), crane(900, 350, .8))
    s.add('<path d="M560 420 Q620 370 760 380 Q900 390 960 420z" fill="#3A5030"/>', chaupar(330, 400, 1))
    return s.svg(CREDITS[14])

def b15(p):
    s = Scene(p); s.add(sky(p, ["#5A8AB8", "#B8D0DC", "#F4E4C0"]), clouds([(300, 70, 160), (900, 60, 200)], ".7"))
    s.add(ridge(240, 14, 91, "#8AA07A"), ground(262, "#A8A070"))
    s.add(gopuram(220, 274, .82), temple(600, 274, .62, "#E8C890", "#B89060"), house(930, 274, 1.3, "#E6D6B6", "#A8523A"), tree(1100, 282, 1, "#3E6A3C", "#5E8A4C"))
    s.add(water(p, 296, "#A8D0DC", "#4F8CA4"))
    s.add('<path d="M280 420 Q300 350 600 348 Q900 350 920 420z" fill="#7A5A3A"/>')
    s.add(palm_leaf(470, 392, .55, n=4), books(640, 400, 1, ("#2E5A88", "#A8323A", "#6E7C22", "#C98A2A")), open_book(820, 400, .7, cover="#2E5A5A"))
    return s.svg(CREDITS[15])

def b16(p):
    s = Scene(p); s.add(wall(p, "#4A3A2E", "#2A2018"), window(p, 1000, 250, 150, 190, ("#F6D0A0", "#C07A7A", "#3A3A6A")), glow(p, 600, 250, 280, op=".3"), table(300))
    s.add(hanging_lamp(600, 140, 1), open_leaf(230, 300, .7), scales(430, 300, .9, "#D9A43A"), open_book(640, 300, 1.05, cover="#2E5A88"), scroll(850, 258, .6))
    return s.svg(CREDITS[16])

def b17(p):
    s = Scene(p); s.add(sky(p, ["#1E2250", "#8A4A6A", "#F09A60"]), stars(171, 20, 90, op=".6"))
    s.add(temple(260, 220, .55, "#D8B080", "#A88050"), temple(560, 220, .6, "#E0B888", "#B08858"), gopuram(900, 220, .5, "#D0A878", "#A07A50"), temple(1100, 220, .45, "#D8B080", "#A88050"))
    s.add('<rect x="0" y="210" width="1200" height="14" fill="#8A6A4A"/>', ghats(222, 6, "#B8986A", "#8A6A48"))
    s.add(garland(360, 760, 120, 26))
    s.add(water(p, 306, "#C87A6A", "#2A2A5A"))
    for i, (x, y) in enumerate(((120, 340), (260, 372), (420, 330), (560, 392), (700, 350), (830, 400), (960, 336), (1080, 378), (340, 410), (640, 322))):
        s.add(reflect(x, y + 6, 40, "#FFD890", 3, ".4"), diya(x, y, .7))
    s.add(conch(1130, 300, .8), diya_row(60, 294, 9, 124, .55))
    return s.svg(CREDITS[17])

BANNERS = {n: globals()["b%d" % n]("hnb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
