"""AOG-REL-V1 — drawn unit banners for World Religions, units 1–12 (K–8).
Built from _work/course/banner_kit.py: places, objects and landscapes only —
no people, no depiction of God or any prophet, no lettering. Ids "rkb{n}-"."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
from banner_kit import *

CREDITS = {
    1: "Drawn scene: a festive table by a window at evening, with candles, bowls of fruit and strings of colored lanterns overhead",
    2: "Drawn scene: a cozy shelf of old books and rolled scrolls beside a lamp, with a window open on a night of stars",
    3: "Drawn scene: a big shade tree and a stone well on a green hill at sunrise, sheep grazing nearby",
    4: "Drawn scene: a small town at golden hour where buildings of many shapes stand side by side: domes, arches, a tower and a tiered roof",
    5: "Drawn scene: an old hill city of stone with domes and towers above olive trees at morning",
    6: "Drawn scene: a calm river with lotus flowers, a tiered temple roof and green mountains in the mist",
    7: "Drawn scene: a neighborhood street at evening where houses and houses of worship of many kinds stand in a row",
    8: "Drawn scene: a historian's desk with a scroll, open books, a reed pen and ink under a lamp",
    9: "Drawn scene: a road winding from a walled hill city past olive trees toward a far town with a dome",
    10: "Drawn scene: a hall of arches and geometric tiles with shelves of books and hanging lamps",
    11: "Drawn scene: misty green mountains over a river, a tiered pagoda roof and lotus flowers in the water",
    12: "Drawn scene: a wide plain under a sky full of stars with a great baobab tree, and a lit city skyline far away",
}

def b1(p):
    s = Scene(p); s.add(wall(p, "#5A3A4A", "#3A2A30"), window(p, 900, 240, 160, 180, ("#F8C890", "#8A5A9A", "#2A2A5A")), lanterns(40, 30, 7, 110))
    fruit = "".join('<circle cx="%d" cy="%d" r="12" fill="%s"/>' % (x, 280 - (i % 2) * 10, c) for i, (x, c) in enumerate(zip(range(480, 620, 20), ("#E4573D", "#F2C964", "#8DBD4C", "#F0923A", "#E4573D", "#F2C964", "#8DBD4C"))))
    s.add(glow(p, 320, 250, 170, op=".35"), table(300, "#A8744A", "#6A4A2C"), candles(280, 300, 3), '<ellipse cx="550" cy="298" rx="90" ry="14" fill="#E6D6B6"/>', fruit, jar(760, 300, .9))
    return s.svg(CREDITS[1])

def b2(p):
    s = Scene(p); s.add(wall(p, "#4A3A2E", "#2A2018"), window(p, 880, 240, 150, 180, ("#3A4A7A", "#1E3458", "#0A1E33")))
    s.add('<g fill="#F6F2E0"><circle cx="920" cy="110" r="2"/><circle cx="970" cy="150" r="2"/><circle cx="1000" cy="100" r="1.6"/></g>', shelf(60, 130, 640, .9), '<rect x="50" y="230" width="660" height="10" fill="#6A4A2C"/>', rolled_scrolls(120, 230, 4), rolled_scrolls(420, 230, 4))
    s.add(table(300), glow(p, 780, 260, 140, op=".35"), lamp(760, 298, 1.1))
    return s.svg(CREDITS[2])

def b3(p):
    s = Scene(p); s.add(sky(p, ["#7AA8D8", "#F2C898", "#FCE3B0"]), sun(p, 950, 230, 34), ridge(270, 20, 3, "#8AAE6A"), ground(320, "#6E9A50"))
    s.add(tree(360, 340, 1.8), well(640, 370, 1), sheep([(780, 360), (840, 372), (900, 358)]))
    return s.svg(CREDITS[3])

def b4(p):
    s = Scene(p); s.add(sky(p, ["#5A7AB8", "#E8A878", "#F6D0A0"]), ground(310, "#B89868"))
    s.add(domes(200, 320, .9), house(420, 320, 1.1, roof="#8A4A3A"), tower(520, 320, 1), pagoda(700, 320, .8), city(980, 320, .6, "#D8C6A2", "#A89070"), house(1140, 320, .9, roof="#4A6A7A"))
    return s.svg(CREDITS[4])

def b5(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#C8DCE8", "#F6EAD0"]), ridge(240, 30, 5, "#B8A080"))
    s.add(city(600, 250, 1.4, "#D8C6A2", "#A89070", dome="#C9A860"), tower(380, 250, .8, "#D8C6A2", "#8AB0C0"), tower(840, 250, .8, "#D8C6A2", "#8A7A6A"))
    s.add(ridge(300, 14, 8, "#7E9A5A"), olive(200, 380, 1.4), olive(1000, 380, 1.3), olive(620, 390, 1))
    return s.svg(CREDITS[5])

def b6(p):
    s = Scene(p); s.add(sky(p, ["#8AB0C8", "#D8E4E0", "#F4EAD2"]), '<g opacity=".7">' + mountains([(260, 120, 240), (700, 150, 220), (1060, 110, 230)], "#6A8A7A") + "</g>")
    s.add(ridge(270, 16, 4, "#4E7A5A"), pagoda(840, 280, 1), water(p, 300, "#9CC8C8", "#4F8C94"), lotus(300, 350), lotus(460, 380, .8), lotus(1000, 370, .9, "#F2C0C8"))
    return s.svg(CREDITS[6])

def b7(p):
    s = Scene(p); s.add(sky(p, ["#2A3A6A", "#8A6A9A", "#F2B488"]), ground(320, "#4A4A4A"))
    s.add(house(100, 320, 1), domes(290, 320, .8, "#E6D6B6", "#6FA0B8"), tower(420, 320, .9), house(530, 320, 1, roof="#4A6A7A"), pagoda(680, 320, .6), city(900, 320, .5, "#D8C6A2", "#A89070", dome="#C9A860"), house(1100, 320, 1.1, roof="#6A4A7A"))
    s.add('<rect y="330" width="1200" height="8" fill="#8A8A8A"/>', lanterns(0, 250, 8, 150, ("#F2C964",)))
    return s.svg(CREDITS[7])

def b8(p):
    s = Scene(p); s.add(wall(p, "#3A2A22", "#2A1C16"), shelf(40, 120, 1100, .9), glow(p, 900, 250, 180, op=".35"), table(300))
    s.add(scroll(260, 250, 1), open_book(520, 300, 1.1), pen_ink(660, 300), books(720, 300, 1), lamp(940, 298, 1.1))
    return s.svg(CREDITS[8])

def b9(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#F6D8B0"]), ridge(220, 26, 4, "#B8A080"), city(260, 230, 1, "#D8C6A2", "#A89070"))
    s.add(domes(1000, 250, .5, "#E6D6B6", "#8AB0C0"), ground(270, "#C8B080"), '<path d="M200 420 Q500 300 1000 262" stroke="#E8D8B0" stroke-width="22" fill="none"/>', olive(160, 370, 1.4), olive(760, 360, 1.2), olive(980, 400, 1.3))
    return s.svg(CREDITS[9])

def b10(p):
    s = Scene(p); s.add(geo_pattern(p, 0, 0, 1200, 300, "#2E5A88", "#D9B45A", "#EFE4CC"), '<rect width="1200" height="300" fill="#0A1E33" opacity=".25"/>')
    s.add(arches(0, 300, 10, 120, 240, "#E6D6B6", "#3A2A20"), shelf(80, 200, 220, .8), shelf(560, 200, 220, .8), hanging_lamp(460, 150, 1), hanging_lamp(940, 150, 1), '<rect y="300" width="1200" height="120" fill="#8A5A34"/>')
    return s.svg(CREDITS[10])

def b11(p):
    s = Scene(p); s.add(sky(p, ["#A8C0C8", "#E0E8E0", "#F6EAD0"]), '<g opacity=".55">' + mountains([(180, 90, 200), (560, 130, 220), (960, 80, 240)], "#5A7A6A") + "</g>")
    s.add(clouds([(300, 200, 260), (900, 210, 300)], ".7"), ridge(280, 18, 9, "#3E6A4A"), pagoda(320, 290, 1.2, "#A8403A"), water(p, 310, "#A8C8C8", "#5A8A94"), lotus(700, 360), lotus(860, 390, .8), lotus(1040, 350, .9))
    return s.svg(CREDITS[11])

def b12(p):
    s = Scene(p); s.add(sky(p, ["#050E1C", "#0A1E33", "#2A3A6A", "#8A5A6A"]), stars(121, 220, 250), '<g opacity=".8">' + skyline(300, "#1A2438", "#F6D98A") + "</g>")
    s.add(ground(300, "#3A3226"), baobab(360, 360, 1.3, "#2A2018", "#2E3A22"))
    return s.svg(CREDITS[12])

BANNERS = {n: globals()["b%d" % n]("rkb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
