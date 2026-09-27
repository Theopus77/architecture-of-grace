"""AOG-BUD-V1 — drawn unit banners for Buddhist Texts, units 10–17.
Uses banner_kit.py and the Buddhist pieces in banners_bud_a. No people, no
figure of the Buddha, no lettering. Every id is prefixed "bdb{n}-"."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from banner_kit import *
from banners_bud_a import (bodhi, stupa, wheel, flags, monastery, palm_leaf, open_leaf, woodblock, sutra_sheet, deer,
                           big_lotus, pads, buds, sala, pillar, raft, brick_monastery, birds, temple_hall)

def _right(svg, x0):
    """Keep only the skyline blocks that stand right of x0 (the far shore)."""
    import re
    return "".join(m for m in re.findall(r'<rect [^>]*/>', svg) if int(re.search(r'x="(\d+)"', m).group(1)) >= x0)

CREDITS = {
    10: "Drawn scene: a white monastery on a Himalayan slope strung with prayer flags, a pagoda and a lotus pond in the valley below",
    11: "Drawn scene: a steamship crossing the ocean from a coast of pagodas toward a lakeside city of towers and domed halls",
    12: "Drawn scene: the great round stupa of the Deer Park at dawn with deer resting in the grass, a grove of flowering sala trees at dusk beyond",
    13: "Drawn scene: a palm-leaf manuscript open on a low table beside an oil lamp, a window looking out on a moonlit lake",
    14: "Drawn scene: a bamboo raft left on the near bank of a wide river, the far shore green and bright in the morning sun",
    15: "Drawn scene: the terraced brick walls of an old monastic university under a starry sky, a carved printing block and printed sutra in front",
    16: "Drawn scene: several paths climbing a mountain from different valleys toward a small stupa at the summit, prayer flags on the ridge",
    17: "Drawn scene: a writing desk with a palm-leaf bundle, a printed sutra and a lotus, before a window showing a temple and stupa at dusk",
}

def b10(p):
    s = Scene(p); s.add(sky(p, ["#3A6AA8", "#8AB4D8", "#E6EEF2"]), clouds([(260, 70, 140), (900, 60, 120)], ".5"))
    s.add(mountains([(180, 60, 260), (560, 90, 240), (980, 50, 280)], "#8A94AA", "#1A2030"))
    s.add('<g fill="#F6F8FC"><path d="M180 60 l-50 70 l24 -8 l26 18 l22 -18 l28 8z"/><path d="M560 90 l-44 60 l20 -6 l24 14 l22 -14 l22 6z"/><path d="M980 50 l-56 76 l26 -8 l30 18 l26 -18 l30 8z"/></g>')
    s.add(ridge(250, 16, 101, "#6A7A58"), monastery(360, 260, .8), flags(160, 170, 560, 150, 18, 14), flags(420, 130, 760, 190, 22, 12))
    s.add(ground(290, "#7E9A58"), pagoda(900, 300, .6, "#8A3A2A", "#2A2A38"), water(p, 330, "#A8C8D0", "#5A8A9A"))
    s.add(pads([(180, 370, 36), (640, 390, 30), (1060, 372, 40)]), big_lotus(260, 364, .5), big_lotus(1000, 370, .55, "#F6D0DA"), buds([(720, 400), (560, 380)]))
    return s.svg(CREDITS[10])

def b11(p):
    s = Scene(p); s.add(sky(p, ["#5A8AC0", "#B0D0E4", "#F2E8D0"]), sun(p, 1040, 80, 24), clouds([(500, 70, 150), (820, 110, 110)], ".5"))
    s.add(water(p, 270, "#7AAAC8", "#2E5A80"))
    s.add('<path d="M0 290 Q120 250 260 270 V300 H0z" fill="#5A7A58"/>', pagoda(90, 280, .5, "#8A3A2A", "#2A2A38"), pagoda(190, 278, .38, "#8A3A2A", "#2A2A38"))
    s.add('<path d="M820 276 H1200 V300 H820z" fill="#7A8A6A"/>', _right(skyline(276, "#6A7A94", "#F6D98A", 11), 840))
    s.add('<g transform="translate(0 0)">' + domes(930, 276, .55, "#E6D6B6", "#A8B8C0") + "</g>")
    s.add('<g transform="translate(560 330) scale(1.1)"><path d="M-120 -10 H130 l-20 26 H-100z" fill="#2A3A4A"/><rect x="-90" y="-34" width="170" height="24" fill="#F2EBDC"/>'
          '<rect x="-20" y="-70" width="18" height="38" fill="#A8323A"/><rect x="20" y="-70" width="18" height="38" fill="#A8323A"/><rect x="-20" y="-70" width="18" height="6" fill="#2A2A2A"/><rect x="20" y="-70" width="18" height="6" fill="#2A2A2A"/>'
          '<path d="M-70 -34 V-90 M90 -34 V-86" stroke="#4A3A2A" stroke-width="4"/><g fill="#F4F4F4" opacity=".5"><ellipse cx="-4" cy="-94" rx="24" ry="10"/><ellipse cx="30" cy="-110" rx="30" ry="12"/></g></g>')
    s.add(birds([(360, 120), (400, 104), (700, 150)], "#4A5A6A"))
    return s.svg(CREDITS[11])

def b12(p):
    s = Scene(p); s.add(sky(p, ["#4A5A8A", "#C88A8A", "#F6C898", "#FCE6C0"]), sun(p, 260, 250, 30))
    s.add(ridge(260, 10, 121, "#9A8A88"), ground(290, "#9AA868"))
    s.add('<g transform="translate(560 320)"><rect x="-120" y="-150" width="240" height="150" fill="#C89A78"/><path d="M-120 -150 a120 110 0 0 1 240 0z" fill="#B88A68"/>'
          '<rect x="-120" y="-120" width="240" height="30" fill="#D8B090"/><g fill="#A87858">' + "".join('<rect x="%d" y="-116" width="20" height="22" rx="4"/>' % xx for xx in range(-106, 110, 34)) +
          '</g><path d="M40 -150 a120 110 0 0 1 80 0 V0 H40z" fill="#000" opacity=".1"/></g>')
    s.add(wheel(560, 90, 18, "#E8C050", 3), deer(390, 350, .75), deer(740, 352, .75, flip=True), deer(460, 380, .55, "#A87A44", down=True))
    s.add(sala(970, 300, .9, seed=5), sala(1060, 310, 1.05, seed=6), sala(1150, 300, .85, seed=7), ground(360, "#7E9A58"))
    s.add(buds([(200, 400), (880, 396)]))
    return s.svg(CREDITS[12])

def b13(p):
    s = Scene(p); s.add(wall(p, "#5A3A2E", "#3A2620"))
    wd, wb = window(p, 780, 280, 300, 230, ("#2A4A6A", "#1E3458", "#0A1430"), "#C8B090")
    s.add((wd, wb))
    s.add('<g><circle cx="930" cy="110" r="26" fill="#F6F2E0"/><circle cx="930" cy="110" r="50" fill="#F6F2E0" opacity=".2"/>'
          '<rect x="780" y="190" width="300" height="90" fill="#1E3458"/><ellipse cx="930" cy="230" rx="40" ry="5" fill="#F6F2E0" opacity=".5"/><ellipse cx="930" cy="250" rx="24" ry="3" fill="#F6F2E0" opacity=".35"/>'
          '<path d="M780 196 Q860 176 940 194 T1080 186 V200 H780z" fill="#0E1C34"/></g>')
    s.add(glow(p, 400, 300, 280, "#FFD890", ".35"), table(300, "#8A5A34", "#5A3A22"), palm_leaf(250, 298, .7, 0, "#E8D29A", "#7A4A2A", 4), open_leaf(430, 352, 1.1), lamp(700, 352, 1.1), big_lotus(130, 362, .5))
    return s.svg(CREDITS[13])

def b14(p):
    s = Scene(p); s.add(sky(p, ["#7AA8D8", "#C8DCE8", "#F6EAC8"]), sun(p, 900, 110, 30), clouds([(300, 80, 130)], ".45"))
    s.add(ridge(200, 14, 141, "#8AA8A0"), '<path d="M0 230 Q300 206 600 224 T1200 214 V250 H0z" fill="#6E9A58"/>', tree(850, 236, .6), tree(980, 232, .7, "#5E8A44"), stupa(700, 232, .25), tree(260, 240, .5))
    s.add(water(p, 246, "#9CC4D8", "#3E7090"))
    s.add('<path d="M0 360 Q300 330 620 360 T1200 380 V420 H0z" fill="#B8A070"/>', raft(460, 380, 1.8))
    s.add(buds([(200, 380), (800, 396)], "#F6D0DA"), birds([(560, 120), (600, 104), (640, 126)], "#5A6A7A"))
    return s.svg(CREDITS[14])

def b15(p):
    s = Scene(p); s.add(sky(p, ["#0A1430", "#1E2E5A", "#4A4A7A", "#8A6A7A"]), stars(151, 180, 220), moon(1040, 80, 20))
    s.add(ridge(270, 10, 151, "#2A2A40"), brick_monastery(600, 300, 1.2, "#A0604A", "#6A3A2C"), ground(300, "#3A3438"))
    s.add(glow(p, 600, 360, 200, "#FFD890", ".3"), woodblock(470, 400, .8), sutra_sheet(680, 400, .8), lamp(860, 390, .9))
    return s.svg(CREDITS[15])

def b16(p):
    s = Scene(p); s.add(sky(p, ["#5A7AB0", "#E8A888", "#FCE0B8"]), sun(p, 600, 70, 26, "#FFF6D8", "#FFD89A"))
    s.add('<path d="M0 420 L600 90 L1200 420z" fill="#8A7A7A"/><path d="M600 90 L1200 420 H760z" fill="#5A4A50" opacity=".4"/>')
    s.add('<path d="M100 420 Q300 330 380 300 T520 180 L590 110 M1100 420 Q900 340 820 290 T680 170 L610 110 M600 420 Q560 330 620 260 T600 110" stroke="#E6CFA0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>')
    s.add(stupa(600, 100, .2), flags(490, 150, 710, 150, 8, 10))
    s.add(ridge(360, 12, 161, "#6E8A58"), tree(140, 380, .8), tree(1080, 380, .8, "#5E8A44"), tree(420, 390, .5))
    return s.svg(CREDITS[16])

def b17(p):
    s = Scene(p); s.add(wall(p, "#E8D8B8", "#C8B08A"))
    wd, wb = window(p, 720, 280, 380, 250, ("#F6B878", "#C87A6A", "#3A3A6A"))
    s.add((wd, wb), '<g opacity=".9">' + temple_hall(820, 280, .55, "#E8D6C0", "#2A2A38") + stupa(1000, 280, .45, "#E8E0D0", "#B8A890") + "</g>", flags(730, 70, 1090, 70, 12, 9))
    s.add(table(290, "#8A5A34", "#5A3A22"), palm_leaf(220, 330, .8, 0, "#E8D29A", "#A8323A", 5), sutra_sheet(470, 360, .7), big_lotus(640, 330, .55), lamp(880, 350, 1.1), wheel(90, 120, 44, "#C8A040", 5))
    return s.svg(CREDITS[17])

BANNERS = {n: globals()["b%d" % n]("bdb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1:
        import banners_bud_a
        allb = dict(banners_bud_a.BANNERS); allb.update(BANNERS)
        contact_sheet(allb, sys.argv[1])
