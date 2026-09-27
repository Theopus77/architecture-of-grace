"""AOG-ECO-V1 — drawn unit banners for Economics, units 1–10 (K–8).
Built from _work/course/banner_kit.py: places and objects, no people, no
lettering, no prices. Ids prefixed "eob{n}-"."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "course"))
from banner_kit import *

CREDITS = {
    1: "Drawn scene: a small house with an apple tree and a garden, a well and a market stall down the lane on a sunny morning",
    2: "Drawn scene: a glass jar of coins on a kitchen table beside a small stack of coins and a lamp, a window open on a garden",
    3: "Drawn scene: a morning market of striped stalls with fruit, a bakery and workshops along a village street",
    4: "Drawn scene: a dry field with only a few fruit trees and one well, and a long road to a town far away",
    5: "Drawn scene: a busy market square of striped stalls full of fruit, with stacks of coins on a crate",
    6: "Drawn scene: a harbor town with a domed town hall, a cargo ship at the dock and a road leading inland",
    7: "Drawn scene: a road that forks at sunrise, one way toward a town and one way toward green farm fields",
    8: "Drawn scene: a city skyline at dusk with lit windows and a row of market stalls in the foreground",
    9: "Drawn scene: a desk with a jar of coins, a notebook and a lamp beside a window over evening rooftops",
    10: "Drawn scene: a big container ship leaving a port at sunset, cranes on the dock and a city far behind",
}

def b1(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#B8D8E8", "#F6EAD0"]), sun(p, 1000, 90, 30), clouds([(300, 80, 140)]), ridge(260, 20, 3, "#9AC07A"), ground(310, "#7EAA5A"))
    garden = "".join('<ellipse cx="%d" cy="%d" rx="14" ry="8" fill="#4E7A3C"/>' % (x, 380 + (x % 3) * 8) for x in range(160, 420, 30))
    s.add(house(260, 330, 1.4), tree(480, 330, 1.2, leaf2="#E4573D"), garden, well(660, 370, .9), stall(930, 350, 1))
    return s.svg(CREDITS[1])

def b2(p):
    s = Scene(p); s.add(wall(p, "#E6D6B6", "#C9B894"), window(p, 840, 240, 180, 180, ("#FCE3B0", "#9AC08A", "#6A9ACA")), table(300, "#A8744A", "#6A4A2C"))
    jarr = '<g transform="translate(460 300)"><path d="M-60 0 q-10 -60 0 -110 h120 q10 50 0 110z" fill="#CFE4EC" opacity=".85"/><rect x="-66" y="-124" width="132" height="16" rx="4" fill="#8A6A40"/></g>'
    inside = coins(460, 290, 6)
    s.add(inside, jarr, coins(640, 298, 4), coins(700, 298, 2), lamp(300, 298, 1))
    return s.svg(CREDITS[2])

def b3(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#F6EAD0"]), house(120, 280, 1.3, roof="#8A4A3A"), house(1080, 280, 1.3, roof="#4A6A7A"), house(950, 280, 1), ground(280, "#C9B08A"))
    s.add(stall(340, 350, 1.2), stall(620, 350, 1.2, "#2E5A88", goods=("#C98A4A", "#E6C088")), stall(880, 360, 1.1, "#4E7A3C"))
    return s.svg(CREDITS[3])

def b4(p):
    s = Scene(p); s.add(sky(p, ["#8AB0D8", "#F6E0B8"]), sun(p, 900, 100, 36), ground(260, "#D8B888"), '<g opacity=".7">' + city(1000, 262, .5, "#C9A878", "#8A6A48") + "</g>")
    s.add('<path d="M100 420 Q500 300 980 264" stroke="#E8D8B0" stroke-width="18" fill="none"/>', tree(260, 340, 1, "#6E8A44", "#E4573D"), tree(600, 320, .8, "#6E8A44", "#E4573D"), well(420, 380, .9))
    return s.svg(CREDITS[4])

def b5(p):
    s = Scene(p); s.add(sky(p, ["#7AAAD8", "#F6EAD0"]), arches(0, 260, 11, 110, 130, "#E6D6B6", "#8A6A4A"), ground(262, "#C9B08A"))
    s.add(stall(200, 340, 1.1), stall(460, 340, 1.1, "#2E5A88"), stall(720, 340, 1.1, "#8A5A9A"), stall(980, 340, 1.1, "#4E7A3C"), '<rect x="560" y="370" width="90" height="40" fill="#8A5A34"/>', coins(585, 368, 4), coins(630, 368, 3))
    return s.svg(CREDITS[5])

def b6(p):
    s = Scene(p); s.add(sky(p, ["#6A9ACA", "#B8D8E8", "#F6EAD0"]), ridge(230, 20, 4, "#9AB07A"), domes(300, 262, 1, "#E6D6B6", "#C9A860"), house(120, 262, 1), house(480, 262, .9, roof="#4A6A7A"))
    s.add(ground(262, "#C9B08A"), water(p, 300, "#9CC8D8", "#3F7C94"), ship(860, 320, 1), '<rect x="600" y="296" width="600" height="10" fill="#6A6A6A"/>')
    return s.svg(CREDITS[6])

def b7(p):
    s = Scene(p); s.add(sky(p, ["#5A7AB8", "#F2B488", "#FCE3B0"]), sun(p, 600, 230, 36), ground(260, "#8AAE6A"))
    s.add('<g opacity=".8">' + city(260, 262, .6, "#C9A878", "#8A6A48") + "</g>", '<g fill="#6E9A40">' + "".join('<rect x="%d" y="%d" width="120" height="14" rx="6"/>' % (820 + (i % 2) * 130, 280 + i * 20) for i in range(6)) + "</g>")
    s.add('<path d="M600 420 L600 350 Q600 320 400 270" stroke="#E8D8B0" stroke-width="26" fill="none"/><path d="M600 350 Q600 320 850 272" stroke="#E8D8B0" stroke-width="26" fill="none"/>')
    return s.svg(CREDITS[7])

def b8(p):
    s = Scene(p); s.add(sky(p, ["#1E2A4A", "#6A5A8A", "#E8A078"]), skyline(300, "#2A3450", "#F6D98A", 3), ground(300, "#3A3A44"))
    s.add(stall(240, 380, 1), stall(520, 380, 1, "#2E5A88"), stall(800, 380, 1, "#8A5A9A"), stall(1060, 380, 1, "#4E7A3C"))
    return s.svg(CREDITS[8])

def b9(p):
    s = Scene(p); s.add(wall(p, "#4A3A4A", "#2A2030"), window(p, 800, 240, 220, 190, ("#F2A070", "#6A5A8A", "#2A3A6A")), table(300))
    s.add('<g opacity=".8">' + house(870, 240, .6, "#3A3050", "#2A2040", "#2A2040", "#F6D98A") + house(960, 240, .5, "#3A3050", "#2A2040", "#2A2040", "#F6D98A") + "</g>")
    note = '<g transform="translate(560 300)"><rect x="-80" y="-10" width="160" height="10" fill="#2E5A88"/><rect x="-76" y="-14" width="152" height="6" fill="#F7EEDC"/></g>'
    s.add(glow(p, 300, 250, 160, op=".35"), coins(420, 298, 5), note, lamp(260, 298, 1), '<g transform="translate(680 300)"><path d="M-30 0 q-6 -40 0 -70 h60 q6 30 0 70z" fill="#CFE4EC" opacity=".85"/></g>', coins(680, 296, 3))
    return s.svg(CREDITS[9])

def b10(p):
    s = Scene(p); s.add(sky(p, ["#3A4A7A", "#C87A6A", "#F6B878"]), sun(p, 900, 250, 40, "#FFE6B0", "#F0A060"), '<g opacity=".6">' + skyline(270, "#4A4A6A", "#F6D98A", 9) + "</g>")
    crane = lambda x: '<g transform="translate(%d 300)" stroke="#C8503A" stroke-width="6" fill="none"><path d="M0 0 v-140 h120 M0 -140 l-40 20 M80 -140 v50"/></g>' % x
    s.add(water(p, 290, "#E8A888", "#4A5A7A"), crane(80), crane(260), '<rect y="290" width="420" height="16" fill="#5A5A5A"/>', ship(760, 350, 1.3))
    return s.svg(CREDITS[10])

BANNERS = {n: globals()["b%d" % n]("eob%d-" % n) for n in CREDITS}

def banner(n):
    return BANNERS[n]

if __name__ == "__main__":
    check(BANNERS)
    if len(sys.argv) > 1: contact_sheet(BANNERS, sys.argv[1])
