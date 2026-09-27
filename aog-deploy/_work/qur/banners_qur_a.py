"""AOG-QUR-V1 — drawn unit banners for The Qur'an, units 1–17.
Built from _work/course/banner_kit.py: landscapes, architecture, geometric
patterns, books and lamps only. No people, never Muhammad or any prophet, no
lettering or calligraphy. Every id is prefixed "qrb{n}-"."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
from banner_kit import *

CREDITS = {
    1: "Drawn scene: an open book on a folding wooden stand beneath a hanging lamp, against a wall of blue and gold star tiles",
    2: "Drawn scene: rocky desert mountains at night under a sky full of stars, a small dark cave high on one slope",
    3: "Drawn scene: dawn breaking over a quiet town of domes and slender towers, the sky turning from night to gold",
    4: "Drawn scene: shelves of bound books in a room of arches, with a band of geometric tiles along the wall",
    5: "Drawn scene: a line of camels crossing a desert valley between mountains toward a town at sunset",
    6: "Drawn scene: a wooden boat on a calm sea under a soft rainbow, palm trees on the shore and a well by the path",
    7: "Drawn scene: a courtyard garden with a fountain, a balance scale and trees heavy with fruit",
    8: "Drawn scene: a colonnade of arches around a courtyard, a lamp and an open book on a stand in the shade",
    9: "Drawn scene: a road across the desert from a valley town between mountains to an oasis of palm trees",
    10: "Drawn scene: a desert under a night sky full of stars and a crescent moon, with a still pool reflecting the light",
    11: "Drawn scene: a library with arched windows, tall shelves of books and hanging lamps glowing",
    12: "Drawn scene: the first light of morning over rugged dark mountains, the last stars fading",
    13: "Drawn scene: an oasis town among palm trees, with a stone well and a row of arches in the afternoon sun",
    14: "Drawn scene: two books open side by side on a table beneath a lamp, a rolled scroll beside them",
    15: "Drawn scene: a scholar's desk under a lamp with books, a reed pen and ink before an arched window at dusk",
    16: "Drawn scene: a courtyard of arches around a fountain, a balance scale resting in the foreground",
    17: "Drawn scene: a wall of geometric star tiles with hanging lamps glowing above an open book on a stand",
}

def b1(p):
    s = Scene(p); s.add(geo_pattern(p, 0, 0, 1200, 300), '<rect width="1200" height="300" fill="#0A1E33" opacity=".35"/>')
    s.add(glow(p, 600, 170, 220, op=".4"), hanging_lamp(600, 150, 1.4), table(300, "#6A4A2C", "#3A2A1C"), book_stand(600, 304, 1.6))
    return s.svg(CREDITS[1])

def b2(p):
    s = Scene(p); s.add(sky(p, ["#050E1C", "#0A1E33", "#1E3458", "#3A3A5A"]), stars(71, 200, 260), cave_mountain(620, 330, 1.2, "#4A3A3A", "#2A2020"))
    s.add(mountains([(160, 200, 200), (1060, 190, 210)], "#3A2E2E"), ground(330, "#2A2222"))
    return s.svg(CREDITS[2])

def b3(p):
    s = Scene(p); s.add(sky(p, ["#1E3458", "#6A5A8A", "#E8A078", "#FCE3B0"]), stars(81, 40, 90, op=".5"), sun(p, 600, 280, 36))
    s.add(ridge(270, 14, 3, "#5A4A5A"), domes(300, 320, 1, "#D8C8A8", "#8AB0C0"), tower(430, 320, 1, "#D8C8A8", "#8AB0C0"), domes(780, 330, .9, "#CDBB98", "#C9A860"), tower(900, 330, .9, "#CDBB98", "#C9A860"))
    s.add(ground(320, "#4A3A3A"))
    return s.svg(CREDITS[3])

def b4(p):
    s = Scene(p); s.add(wall(p, "#E6D6B6", "#C9B894"), geo_pattern(p, 0, 250, 1200, 40))
    s.add(arches(40, 250, 3, 110, 190, "#D8C6A2", "#4A3A2A"), arches(830, 250, 3, 110, 190, "#D8C6A2", "#4A3A2A"))
    s.add(shelf(420, 110, 360, .9), shelf(420, 220, 360, .8), table(300, "#8A5A34", "#5A3A22"))
    return s.svg(CREDITS[4])

def b5(p):
    s = Scene(p); s.add(sky(p, ["#4A5A8A", "#C87A6A", "#F6B878"]), sun(p, 900, 230, 40, "#FFE6B0", "#F0A060"), mountains([(200, 150, 220), (1050, 160, 200)], "#7A5A4A"))
    s.add(ground(300, "#C8A070"), '<g opacity=".8">' + city(880, 300, .7, "#D8B888", "#A08058") + "</g>")
    s.add(camel(260, 360, 1), camel(400, 356, .9), camel(530, 352, .8), ground(380, "#B08858"))
    return s.svg(CREDITS[5])

def b6(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#A8CCE0", "#F4E6C8"]), rainbow(700, 290, 230), water(p, 280, "#9CC8D8", "#3F7C94"), boat(640, 300, 1.2))
    s.add('<path d="M0 330 Q200 300 420 330 V420 H0z" fill="#D8C090"/>', palm(120, 360, 1.3, -4), palm(260, 356, 1, 6), well(360, 400, .8))
    return s.svg(CREDITS[6])

def b7(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#B8D8E8", "#F6EAD0"]), '<rect y="200" width="1200" height="220" fill="#E6D6B6"/>', geo_pattern(p, 0, 300, 1200, 120, op=".9"))
    s.add(tree(200, 300, 1.2, leaf="#4E7A3C", leaf2="#E4573D"), tree(1000, 300, 1.2, leaf="#4E7A3C", leaf2="#F0923A"), fountain(600, 320, 1.8), scales(840, 330, .9, "#8A5A34"))
    return s.svg(CREDITS[7])

def b8(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#F6EAD0"]), '<rect y="280" width="1200" height="140" fill="#D8C6A2"/>', arches(20, 280, 10, 116, 200, "#E6D6B6", "#5A4A3A"))
    s.add(book_stand(520, 360, 1.1), lamp(760, 360, 1))
    return s.svg(CREDITS[8])

def b9(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#C8D8E0", "#F6E0B8"]), mountains([(180, 140, 200), (380, 170, 160)], "#8A6A5A"), ground(300, "#D0A878"))
    s.add(domes(260, 300, .7, "#E6D6B6", "#A89070"), '<path d="M300 420 Q600 300 900 310" stroke="#B89060" stroke-width="30" fill="none" opacity=".6"/>')
    s.add(palm(900, 310, 1.2), palm(980, 306, 1.4, 5), palm(1080, 312, 1.1, -6), domes(1000, 318, .5, "#E6D6B6", "#8AB0C0"), camel(560, 380, .8))
    return s.svg(CREDITS[9])

def b10(p):
    s = Scene(p); s.add(sky(p, ["#050E1C", "#0A1E33", "#1E3458"]), stars(91, 240, 260), '<circle cx="900" cy="90" r="30" fill="#F6F2E0"/><circle cx="914" cy="82" r="28" fill="#0A1E33"/>')
    s.add(ridge(290, 16, 4, "#2A2A3A"), '<ellipse cx="600" cy="350" rx="300" ry="30" fill="#1E3458"/>', stars(92, 30, 40, op=".5").replace('<g ', '<g transform="translate(0 330)" ', 1))
    return s.svg(CREDITS[10])

def b11(p):
    s = Scene(p); s.add(wall(p, "#4A3A2E", "#2A2018"), window(p, 600, 220, 120, 170, ("#F8C890", "#6A9ACA", "#3A5A8A")))
    s.add(shelf(40, 120, 460, .9), shelf(40, 230, 460, .8), shelf(760, 120, 400, .9), shelf(760, 230, 400, .8))
    s.add(hanging_lamp(300, 60, 1), hanging_lamp(900, 60, 1), table(300))
    return s.svg(CREDITS[11])

def b12(p):
    s = Scene(p); s.add(sky(p, ["#0A1E33", "#3A4A7A", "#C88A7A", "#F6C898"]), stars(101, 60, 120, op=".6"))
    s.add(mountains([(160, 150, 220), (480, 120, 240), (820, 160, 220), (1100, 140, 200)], "#3A2E34"), ground(300, "#2A2226"))
    return s.svg(CREDITS[12])

def b13(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#B8D8E8", "#F6E6C8"]), ground(290, "#C8A878"), arches(560, 300, 5, 90, 110, "#E6D6B6", "#5A4A3A"))
    s.add(palm(140, 320, 1.4), palm(260, 330, 1.1, 6), palm(1080, 320, 1.4, -5), palm(980, 326, 1.1), well(420, 380, 1), ground(380, "#B89868"))
    return s.svg(CREDITS[13])

def b14(p):
    s = Scene(p); s.add(wall(p, "#5A4232", "#3A2A20"), glow(p, 600, 180, 240, op=".35"), hanging_lamp(600, 150, 1.2), table(300))
    s.add(open_book(420, 300, 1.4, cover="#2E5A5A"), open_book(780, 300, 1.4, cover="#7A2E2E"), rolled_scrolls(1000, 300, 2))
    return s.svg(CREDITS[14])

def b15(p):
    s = Scene(p); s.add(wall(p, "#3A2A22", "#2A1C16"), window(p, 800, 250, 180, 190), table(300))
    s.add(books(160, 300, 1.2), open_book(520, 300, 1.2), pen_ink(660, 300), lamp(380, 298, 1), glow(p, 400, 260, 160, op=".3"))
    return s.svg(CREDITS[15])

def b16(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#F6EAD0"]), '<rect y="280" width="1200" height="140" fill="#D8C6A2"/>', arches(20, 280, 10, 116, 190, "#E6D6B6", "#4A5A6A"))
    s.add(geo_pattern(p, 0, 330, 1200, 90, op=".7"), fountain(600, 350, 1.6), scales(260, 400, 1, "#6A4A2C"))
    return s.svg(CREDITS[16])

def b17(p):
    s = Scene(p); s.add(geo_pattern(p, 0, 0, 1200, 300, "#1E5A7A", "#D9B45A", "#E8DCC0"), '<rect width="1200" height="300" fill="#0A1E33" opacity=".3"/>')
    s.add(hanging_lamp(260, 150, 1.1, "#5F9CB4"), hanging_lamp(600, 130, 1.3), hanging_lamp(940, 150, 1.1, "#5F9CB4"), table(300, "#6A4A2C", "#3A2A1C"), book_stand(600, 304, 1.5))
    return s.svg(CREDITS[17])

BANNERS = {n: globals()["b%d" % n]("qrb%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
