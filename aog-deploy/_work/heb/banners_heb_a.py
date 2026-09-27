"""AOG-HEB-V1 — drawn unit banners for The Hebrew Bible, units 1–17.
Built from _work/course/banner_kit.py: landscapes and objects only, no people,
no depiction of God, no text. Every id is prefixed "hhb{n}-"."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
from banner_kit import *

CREDITS = {
    1: "Drawn scene: a garden at first light, a river winding between great trees, the sun rising while the last stars fade",
    2: "Drawn scene: tents in the desert under a sky full of stars, a resting camel and palm trees by a well",
    3: "Drawn scene: tall reeds on a slow river, and far off a mountain with a cloud resting on its top",
    4: "Drawn scene: a wooden shelf of rolled scrolls, an oil lamp and one scroll open on a table with only ruled lines",
    5: "Drawn scene: a walled town on a hill above a green river valley and fields of ripe barley",
    6: "Drawn scene: a hill city at evening with a harp resting on a rock and olive trees below",
    7: "Drawn scene: a harp, a lamp and rolled scrolls on a table by an arched window open on hills at dusk",
    8: "Drawn scene: three groups of bound books and scrolls on long shelves in a quiet library",
    9: "Drawn scene: a desert camp at dusk under a soft rainbow, with a tall mountain beyond",
    10: "Drawn scene: tents in the wilderness beside a river, and across it a walled city on a hill at sunrise",
    11: "Drawn scene: willow trees by a wide river with a harp hung in the branches and a far city at evening",
    12: "Drawn scene: an open book on a reading stand before an arched window that looks out on a garden",
    13: "Drawn scene: a city gate at noon with a balance scale and a rolled scroll in the foreground",
    14: "Drawn scene: a palace with a dome at night, a harp and a lamp beside a stone well under the moon",
    15: "Drawn scene: clay jars in the caves of desert cliffs above a salt sea, and a scribe's reed pen and ink",
    16: "Drawn scene: long shelves of books from many centuries, two candles and an open book on a table",
    17: "Drawn scene: a table set with two candles, a ram's horn and a scroll, a window open on a starry sky",
}

def b1(p):
    s = Scene(p); s.add(sky(p, ["#2A3A6A", "#8A6A9A", "#F2B488", "#FCE3B0"]), stars(11, 40, 120, op=".5"), sun(p, 900, 200, 30))
    s.add(ridge(250, 20, 3, "#7FA06A"), water(p, 300, "#BFE0E8", "#5F9CB4"))
    s.add(ground(360, "#4E6E3A"), tree(180, 300, 1.3), tree(330, 290, 1.0, leaf="#5E8A44"), tree(1020, 300, 1.2), olive(700, 292, 1))
    return s.svg(CREDITS[1])

def b2(p):
    s = Scene(p); s.add(sky(p, ["#0A1E33", "#1E3458", "#4A4A7A", "#C98A6A"]), stars(21, 160, 230), moon(980, 90))
    s.add(ridge(290, 18, 5, "#8A6A48"), ground(350, "#6E5238"), tents([(300, 330, 1.2), (470, 320, .9), (760, 334, 1.1)]), camel(600, 340, 1),
          palm(1000, 330, 1.2, 4), palm(1070, 334, 1, -6), well(900, 350, .8))
    return s.svg(CREDITS[2])

def b3(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#A8CCE0", "#F4E6C8"]), clouds([(900, 100, 140)], ".9"), mountains([(900, 140, 220)], "#A08070"))
    s.add(ridge(280, 10, 8, "#C9B08A"), water(p, 300))
    reeds = "".join('<path d="M%d 420 q%d -80 %d -%d" stroke="%s" stroke-width="4" fill="none"/>' % (x, (x % 7) - 3, (x % 9) - 4, 120 + x % 60, "#5E7A3C" if x % 2 else "#7E9A4C") for x in range(0, 420, 14))
    s.add(reeds, palm(560, 300, 1.1), palm(640, 300, .9, 5))
    return s.svg(CREDITS[3])

def b4(p):
    s = Scene(p); s.add(wall(p, "#3A2A2A", "#6A4A3A"), '<rect x="60" y="70" width="560" height="10" fill="#6A4A2C"/>', rolled_scrolls(100, 70, 3), rolled_scrolls(260, 70, 3), rolled_scrolls(420, 70, 3))
    s.add(glow(p, 860, 200, 180), table(300), scroll(700, 250, 1), lamp(960, 300, 1.2))
    return s.svg(CREDITS[4])

def b5(p):
    s = Scene(p); s.add(sky(p, ["#5A8ACA", "#9AC0E0", "#F6E6C0"]), clouds([(250, 80, 120), (800, 60, 160)]), ridge(210, 30, 4, "#9AAE7A"))
    s.add(city(760, 200, 1.1), ridge(250, 16, 9, "#7E9A5A"), water(p, 300, "#A8D0DC", "#4F8CA4"))
    wheat = "".join('<path d="M%d 420 v-%d" stroke="#D9B45A" stroke-width="3"/><ellipse cx="%d" cy="%d" rx="3" ry="9" fill="#E8C870"/>' % (x, 60 + x % 30, x, 420 - 60 - x % 30) for x in range(0, 1200, 9) if x < 380 or x > 900)
    s.add(wheat)
    return s.svg(CREDITS[5])

def b6(p):
    s = Scene(p); s.add(sky(p, ["#2A3A6A", "#A86A6A", "#F2B488"]), sun(p, 280, 200, 40, "#FFE6B0", "#F0A060"), ridge(220, 30, 6, "#6A5A5A"))
    s.add(ground(380, "#3A4A2A"), city(700, 230, 1.3, "#C9A878", "#8A6A48"), ridge(290, 20, 2, "#4A5A3A"), olive(200, 330, 1.2), olive(1000, 336, 1.1), harp(470, 380, 1.3))
    return s.svg(CREDITS[6])

def b7(p):
    s = Scene(p); s.add(wall(p, "#5A4232", "#3A2A20"), window(p, 560, 250, 180, 180), table(300))
    s.add(harp(160, 300, 1.6), rolled_scrolls(380, 300, 3), lamp(900, 298, 1.2))
    return s.svg(CREDITS[7])

def b8(p):
    s = Scene(p); s.add(wall(p, "#4A3A2E", "#2A2018"))
    s.add(shelf(60, 120, 320, .9), shelf(440, 120, 320, .9), shelf(820, 120, 320, .9))
    s.add('<g transform="translate(0 130)">' + rolled_scrolls(100, 120, 4) + rolled_scrolls(520, 120, 4) + rolled_scrolls(900, 120, 4) + "</g>", table(330), glow(p, 600, 300, 200, op=".25"))
    return s.svg(CREDITS[8])

def b9(p):
    s = Scene(p); s.add(sky(p, ["#4A5A8A", "#C88A7A", "#F6C898"]), rainbow(600, 300, 260), mountains([(880, 110, 230), (1080, 170, 160)], "#8A6A5A"))
    s.add(ground(370, "#8A6A48"), ridge(300, 14, 5, "#B8946A"), tents([(260, 350, 1.1), (430, 344, .8), (620, 356, 1)]), camel(780, 360, .9))
    return s.svg(CREDITS[9])

def b10(p):
    s = Scene(p); s.add(sky(p, ["#6A8ACA", "#E8B898", "#FCE3B0"]), sun(p, 950, 160, 34), city(900, 240, 1, "#D8B888", "#A08058"), ridge(250, 14, 3, "#9AAE7A"))
    s.add(water(p, 290, "#9CC8D8", "#4F8CA4"), ground(340, "#B8946A"), tents([(220, 380, 1), (380, 376, .8)]), palm(520, 380, 1))
    return s.svg(CREDITS[10])

def b11(p):
    s = Scene(p); s.add(sky(p, ["#2A2A5A", "#7A5A8A", "#E8A08A"]), '<g opacity=".6">' + city(760, 250, .8, "#8A7A8A", "#6A5A6A") + "</g>", water(p, 270, "#8AA8C0", "#3A5A7A"))
    wil = "".join('<path d="M%d 330 q%d -120 %d -200" stroke="#3A4A2A" stroke-width="10" fill="none"/>' % (x, 10, 20, ) + "".join('<path d="M%d %d q-6 60 0 %d" stroke="#6E8A4C" stroke-width="3" fill="none"/>' % (x + 20 + k * 10 - 50, 140 + (k % 3) * 10, 110 + (k % 4) * 12) for k in range(10)) for x in (160, 1040))
    s.add(ground(330, "#3A4A2A"), wil, harp(250, 250, 1))
    return s.svg(CREDITS[11])

def b12(p):
    s = Scene(p); s.add(wall(p, "#6A5242", "#3A2A20"), window(p, 760, 260, 220, 200, ("#FCE3B0", "#9AC08A", "#6A9ACA")))
    s.add('<g transform="translate(870 260)">' + tree(-40, 0, .8) + tree(50, 0, .6, leaf="#6E9A50") + "</g>", table(310), book_stand(360, 312, 1.4), lamp(1040, 308))
    return s.svg(CREDITS[12])

def b13(p):
    s = Scene(p); s.add(sky(p, ["#5A8ACA", "#A8CCE0", "#F6EAD0"]), city(600, 250, 1.6, "#D8B888", "#A08058"), ground(300, "#C9B08A"))
    s.add(scales(300, 390, 1.3, "#8A5A34"), scroll(900, 350, .9))
    return s.svg(CREDITS[13])

def b14(p):
    s = Scene(p); s.add(sky(p, ["#0A1E33", "#1E3458", "#3A4A7A"]), stars(41, 120, 200), moon(260, 80))
    s.add(city(760, 260, 1.3, "#B8A078", "#7A6A58", dome="#C9A860"), ground(300, "#5A4A3A"), well(300, 370, 1), harp(520, 380, 1), lamp(980, 380, 1))
    return s.svg(CREDITS[14])

def b15(p):
    s = Scene(p); s.add(sky(p, ["#8AB0D8", "#E8D8C0", "#F6E6C8"]), '<path d="M0 60 L200 80 L380 50 L560 90 L720 60 L720 300 H0z" fill="#B88A6A"/><path d="M0 60 L200 80 L380 50 L560 90 L720 60 V120 L0 140z" fill="#8A6048" opacity=".4"/>')
    for x, y in ((140, 170), (330, 150), (520, 190)):
        s.add('<ellipse cx="%d" cy="%d" rx="44" ry="30" fill="#2A1A14"/>' % (x, y), jar(x - 12, y + 22, .5, "#C99070"), jar(x + 14, y + 22, .45, "#A87050"))
    s.add(water(p, 300, "#A8D8D8", "#5A9AA8"), '<rect x="720" y="300" width="480" height="120" fill="#8A5A34"/>', scroll(930, 330, .9), pen_ink(1080, 360))
    return s.svg(CREDITS[15])

def b16(p):
    s = Scene(p); s.add(wall(p, "#3A2A22", "#2A1C16"), shelf(40, 110, 1100, .9), shelf(40, 220, 1100, .8), glow(p, 600, 300, 240, op=".3"))
    s.add(table(310), candles(420, 310, 2), open_book(700, 312, 1.3))
    return s.svg(CREDITS[16])

def b17(p):
    s = Scene(p); s.add(wall(p, "#5A4232", "#3A2A20"), window(p, 520, 240, 200, 200, ("#4A5A8A", "#1E3458", "#0A1E33")))
    s.add(glow(p, 300, 240, 160), table(300), candles(260, 300, 2), shofar(640, 300, 1.2), scroll(930, 250, .9))
    return s.svg(CREDITS[17])

BANNERS = {n: globals()["b%d" % n]("hhb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
