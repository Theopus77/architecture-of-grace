"""AOG-TAL-V1 — drawn unit banners for Talmud Study, units 1–17.
Built from _work/course/banner_kit.py: rooms of books, lamps, landscapes and
towns only. No people, no depiction of God, no lettering. Ids prefixed "tlb{n}-"."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
from banner_kit import *

CREDITS = {
    1: "Drawn scene: a tall stack of very big books on a table, an oil lamp, and an arched window full of stars",
    2: "Drawn scene: a hill town at evening with an old olive tree and a stone well on the path below",
    3: "Drawn scene: two open books facing each other on a long table between two candles, shelves of books behind",
    4: "Drawn scene: a mountain with a cloud on its top, a long road winding toward a town, and a rolled scroll in the foreground",
    5: "Drawn scene: on the left green hills and a walled town, on the right a wide river with palm trees, two tall books between them",
    6: "Drawn scene: a young carob tree and a stone well under a full moon, with a quiet village on the hill",
    7: "Drawn scene: a market street of striped stalls with a balance scale resting on a crate",
    8: "Drawn scene: a very large open book on a reading stand under a lamp, its pages ruled in blocks",
    9: "Drawn scene: a river town among palm trees with a long arched hall where lamps are lit",
    10: "Drawn scene: a field at sunset with a stone well, a grazing ox and the first three stars in the sky",
    11: "Drawn scene: two lamps and two open books on a table with a balance scale between them",
    12: "Drawn scene: a table with two candles and a covered loaf at dusk, the sky turning deep blue in the window",
    13: "Drawn scene: a row of arches beside a busy market of stalls, with a balance scale in the foreground",
    14: "Drawn scene: an old olive tree beside a stone well, an open book resting on a bench in the shade",
    15: "Drawn scene: a writing desk with books, a reed pen and ink and a balance scale, a lamp glowing",
    16: "Drawn scene: towns of many lands in a row along a river at dusk, with shelves of books in the foreground",
    17: "Drawn scene: a great library at night, long shelves of books, lamps hanging over a table of open books",
}

def b1(p):
    s = Scene(p); s.add(wall(p, "#4A3A2E", "#2A2018"), window(p, 820, 250, 170, 200, ("#3A4A7A", "#1E3458", "#0A1E33")), table(300))
    s.add('<g fill="#F6F2E0" opacity=".85"><circle cx="860" cy="100" r="2"/><circle cx="900" cy="140" r="1.6"/><circle cx="940" cy="90" r="2"/><circle cx="880" cy="190" r="1.4"/><circle cx="960" cy="170" r="1.8"/></g>')
    stack = "".join('<rect x="%d" y="%d" width="%d" height="30" rx="3" fill="%s"/><rect x="%d" y="%d" width="%d" height="4" fill="#F2C964" opacity=".7"/>' % (300 - i * 6 + (i % 2) * 10, 270 - i * 32, 240 + i * 4, c, 306 - i * 6 + (i % 2) * 10, 280 - i * 32, 228 + i * 4)
                    for i, c in enumerate(("#7A2E2E", "#2E5A88", "#6E7C22", "#8A5A9A", "#C98A2A", "#2E5A5A")))
    s.add(stack, glow(p, 660, 250, 140, op=".35"), lamp(640, 298, 1.1))
    return s.svg(CREDITS[1])

def b2(p):
    s = Scene(p); s.add(sky(p, ["#3A4A7A", "#B87A7A", "#F2B488"]), ridge(220, 26, 5, "#8A7A6A"), city(760, 230, 1.1, "#C9A878", "#8A6A48"))
    s.add(ridge(290, 14, 7, "#6E7A4A"), olive(260, 360, 1.8), well(560, 380, 1))
    return s.svg(CREDITS[2])

def b3(p):
    s = Scene(p); s.add(wall(p, "#4A3A2E", "#2A2018"), shelf(40, 120, 1100, .9), shelf(40, 230, 1100, .8), glow(p, 600, 280, 260, op=".3"))
    s.add(table(310), candles(240, 310, 1), candles(940, 310, 1), open_book(480, 312, 1.2, cover="#2E5A88"), open_book(720, 312, 1.2, cover="#7A2E2E"))
    return s.svg(CREDITS[3])

def b4(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#B8D0E0", "#F4E6C8"]), clouds([(300, 80, 150)], ".9"), mountains([(300, 130, 240)], "#9A7A6A"), ground(300, "#C9B08A"))
    s.add('<path d="M380 300 Q600 340 820 310 T1060 300" stroke="#E8D8B0" stroke-width="16" fill="none"/>', city(1000, 300, .6, "#D8B888", "#A08058"), scroll(620, 370, .8))
    return s.svg(CREDITS[4])

def b5(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#C8D8E0", "#F6E0B8"]), ridge(240, 30, 3, "#8AA46A"), city(260, 240, .8, "#D8B888", "#A08058"))
    s.add('<rect x="600" y="0" width="600" height="420" fill="#E8C898" opacity=".35"/>', '<path d="M600 250 H1200 V420 H600z" fill="#C8A878"/>', '<path d="M640 300 Q900 280 1200 300 V360 Q900 340 640 360z" fill="#6FA8C0"/>')
    s.add(palm(760, 290, 1.1), palm(900, 286, 1.3, 5), palm(1100, 290, 1.1, -5), ground(370, "#6A5A3A"), books(540, 370, 1.4, ("#7A2E2E", "#2E5A88")))
    return s.svg(CREDITS[5])

def b6(p):
    s = Scene(p); s.add(sky(p, ["#0A1E33", "#1E3458", "#3A4A7A"]), stars(111, 80, 200), moon(900, 90, 30), ridge(250, 20, 3, "#2A3A3A"))
    s.add('<g opacity=".7">' + city(900, 250, .7, "#6A6A7A", "#4A4A5A") + "</g>", ground(320, "#2A3A2A"), tree(300, 360, .9, "#3E6A3C", "#5E8A4C"), well(560, 380, 1))
    return s.svg(CREDITS[6])

def b7(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#F6EAD0"]), house(120, 270, 1.3), house(1080, 270, 1.3, roof="#6A7A8A"), ground(270, "#C9B08A"))
    s.add(stall(340, 330, 1.2), stall(620, 330, 1.2, "#2E5A88"), stall(900, 330, 1.2, "#4E7A3C"), scales(620, 410, .8, "#6A4A2C"))
    return s.svg(CREDITS[7])

def b8(p):
    s = Scene(p); s.add(wall(p, "#5A4232", "#3A2A20"), glow(p, 600, 180, 260, op=".3"), hanging_lamp(600, 110, 1), table(330))
    page = lambda x: ('<rect x="%d" y="140" width="220" height="170" fill="#F7EEDC"/><rect x="%d" y="190" width="80" height="70" fill="#E8DCC0"/>' % (x, x + 70)
                      + "".join('<path d="M%d %d h%d" stroke="#B8A078" stroke-width="2"/>' % (x + 12, y, 196) for y in range(152, 186, 8))
                      + "".join('<path d="M%d %d h50 M%d %d h50" stroke="#B8A078" stroke-width="2"/>' % (x + 12, y, x + 158, y) for y in range(196, 260, 8))
                      + "".join('<path d="M%d %d h%d" stroke="#B8A078" stroke-width="2"/>' % (x + 12, y, 196) for y in range(270, 304, 8)))
    s.add('<path d="M360 320 L600 300 L840 320 V140 L600 126 L360 140z" fill="#5A2E2E"/>', page(372), page(606), '<path d="M600 130 V312" stroke="#8A7050" stroke-width="3"/>')
    return s.svg(CREDITS[8])

def b9(p):
    s = Scene(p); s.add(sky(p, ["#4A5A8A", "#E8A078", "#F6D0A0"]), ground(260, "#B89868"), water(p, 330, "#8AB8C8", "#3F7C94"))
    s.add(arches(420, 262, 5, 80, 110, "#E6D6B6", "#F2C964"), palm(200, 270, 1.4), palm(320, 266, 1.1, 5), palm(1000, 270, 1.3, -4), palm(1110, 268, 1.1))
    return s.svg(CREDITS[9])

def b10(p):
    s = Scene(p); s.add(sky(p, ["#1E3458", "#8A6A9A", "#F2A070"]), '<g fill="#FFF6D0"><circle cx="300" cy="80" r="3"/><circle cx="560" cy="60" r="3"/><circle cx="820" cy="90" r="3"/></g>', sun(p, 1000, 290, 30, "#FFE0B0", "#F08050"))
    ox = '<g transform="translate(360 350)" fill="#5A3A2A"><path d="M-60 0 v-30 q0 -20 30 -22 h60 q20 0 26 -12 l14 4 q-6 14 -10 28 v32 h-8 v-24 h-80 v24 z"/></g>'
    s.add(ridge(290, 12, 4, "#8A7A3A"), ground(330, "#6A6A2A"), ox, well(760, 380, 1))
    return s.svg(CREDITS[10])

def b11(p):
    s = Scene(p); s.add(wall(p, "#4A3A2E", "#2A2018"), glow(p, 300, 240, 150, op=".35"), glow(p, 900, 240, 150, op=".35"), table(300))
    s.add(lamp(220, 298, 1), lamp(980, 298, 1), open_book(380, 300, 1.1, cover="#2E5A88"), open_book(820, 300, 1.1, cover="#7A2E2E"), scales(600, 300, 1.2))
    return s.svg(CREDITS[11])

def b12(p):
    s = Scene(p); s.add(wall(p, "#5A4232", "#3A2A20"), window(p, 800, 240, 200, 190, ("#6A5A8A", "#2A3A6A", "#0A1E33")), glow(p, 400, 240, 180, op=".35"), table(300))
    loaf = '<g transform="translate(560 300)"><path d="M-70 0 q0 -40 70 -40 q70 0 70 40z" fill="#C98A4A"/><path d="M-76 0 q4 -30 76 -34 q72 4 76 34 v6 h-152z" fill="#F4EAD2" opacity=".9"/><path d="M-60 -10 h120" stroke="#6FA0B8" stroke-width="3"/></g>'
    s.add(candles(360, 300, 2), loaf)
    return s.svg(CREDITS[12])

def b13(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#F6EAD0"]), arches(20, 260, 5, 100, 150, "#E6D6B6", "#5A4A3A"), ground(262, "#C9B08A"))
    s.add(stall(700, 320, 1.1), stall(950, 320, 1.1, "#2E5A88"), scales(360, 400, 1.2, "#6A4A2C"))
    return s.svg(CREDITS[13])

def b14(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#B8D8E8", "#F6EAD0"]), ridge(250, 20, 6, "#9AAE7A"), ground(300, "#B8A070"))
    bench = '<g transform="translate(760 380)"><rect x="-110" y="-40" width="220" height="14" fill="#8A5A34"/><path d="M-96 -26 v26 M96 -26 v26" stroke="#5A3A22" stroke-width="10"/></g>'
    s.add(olive(360, 360, 2.2), well(560, 380, .9), bench, open_book(760, 342, .9))
    return s.svg(CREDITS[14])

def b15(p):
    s = Scene(p); s.add(wall(p, "#3A2A22", "#2A1C16"), shelf(40, 120, 1100, .9), glow(p, 820, 250, 180, op=".35"), table(300))
    s.add(books(160, 300, 1.1), pen_ink(420, 300), scales(620, 300, 1.1), lamp(860, 298, 1.1))
    return s.svg(CREDITS[15])

def b16(p):
    s = Scene(p); s.add(sky(p, ["#2A3A6A", "#9A6A8A", "#F2B488"]), ridge(220, 16, 4, "#6A5A6A"))
    s.add('<g opacity=".85">' + city(200, 230, .6, "#C9A878", "#8A6A48") + domes(480, 230, .6, "#D8C6A2", "#8AB0C0") + house(680, 230, .8, "#D8C6A2", "#8A4A3A") + house(760, 230, .7) + city(1020, 230, .6, "#B8A088", "#7A6A58", dome="#9A8A6A") + "</g>")
    s.add(water(p, 240, "#8AA8C0", "#3A5A7A"), table(330), shelf(80, 330, 1020, .8))
    return s.svg(CREDITS[16])

def b17(p):
    s = Scene(p); s.add(wall(p, "#2A1E18", "#1A1410"), shelf(40, 100, 1100, .9), shelf(40, 200, 1100, .8))
    s.add(hanging_lamp(300, 150, 1), hanging_lamp(600, 150, 1), hanging_lamp(900, 150, 1), glow(p, 600, 320, 300, op=".25"), table(310))
    s.add(open_book(300, 312, 1, cover="#2E5A88"), open_book(600, 312, 1.1), open_book(900, 312, 1, cover="#2E5A5A"))
    return s.svg(CREDITS[17])

BANNERS = {n: globals()["b%d" % n]("tlb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
