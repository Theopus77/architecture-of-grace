"""Unit banners for the SEL course "Architecture of Grace" — rooms 12, 18 and 36
(Book 1 "The Foundation" K-2, Book 2 "The Framework" 3-5, Book 3 "The Interior" 6-8),
four units each.  Twelve drawn, layered scenes as inline SVG.  Stdlib only.

    from banners_sel_a import BANNERS, CREDITS, banner
    banner("36-2")  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[key], focusable="false".  Every id is prefixed
"sb{room}u{unit}-" so all SEL banners can sit on one contents page.
No text, no faces or identifiable people, no images, no external references,
no feTurbulence.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm and the action sits in the
upper 55%.
"""

W, H = 1200, 420

CREDITS = {
    "12-1": "Drawn scene: a sunny bedroom with a tall mirror reflecting the window, a small backpack by the door and a potted plant",
    "12-2": "Drawn scene: a bright garden path with a bench, a watering can and a young sprout in a pot under a friendly sun",
    "12-3": "Drawn scene: two small chairs facing each other on a rug under a big tree, with a ball between them",
    "12-4": "Drawn scene: a sunny apple orchard with round trees, baskets of apples on the grass and a picnic blanket",
    "18-1": "Drawn scene: a hilltop trail at midday with a backpack, a compass lying on a rock and a wooden signpost",
    "18-2": "Drawn scene: a lighthouse on a headland at dusk casting a warm beam over a calm sea",
    "18-3": "Drawn scene: a wooden footbridge over a stream in soft morning light, with a lantern post at either end",
    "18-4": "Drawn scene: an orchard at harvest with a ladder against a tree, a wheelbarrow and baskets of fruit",
    "36-1": "Drawn scene: a quiet dresser at dusk with an oval mirror reflecting the evening sky and a plain mask resting beside it",
    "36-2": "Drawn scene: an empty classroom window at dusk with a desk lamp, a notebook and a pencil, the city lights beyond",
    "36-3": "Drawn scene: two chairs facing each other by a tall window at twilight with a small lamp between them",
    "36-4": "Drawn scene: a lantern-lit path through a night garden leading to an open gate under the stars",
}


def _stop(o, c, a):
    op = "" if a is None else ' stop-opacity="%s"' % a
    return '<stop offset="%s" stop-color="%s"%s/>' % (o, c, op)


def _lin(pid, stops, x1=0, y1=0, x2=0, y2=1):
    s = "".join(_stop(o, c, a) for o, c, a in stops)
    return f'<linearGradient id="{pid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def _rad(pid, stops, cx=.5, cy=.5, r=.5):
    s = "".join(_stop(o, c, a) for o, c, a in stops)
    return f'<radialGradient id="{pid}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'


def _stars(seed, n, ymax, color="#fff", op=".8", xmin=0, xmax=W):
    x, out = seed, []
    for _ in range(n):
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        px = xmin + x % (xmax - xmin)
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        py = x % ymax
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        r = 0.6 + (x % 10) / 10
        out.append(f'<circle cx="{px}" cy="{py}" r="{r:.1f}"/>')
    return f'<g fill="{color}" opacity="{op}">{"".join(out)}</g>'


def _tree(x, y, s, trunk="#6A4A2A", leaf="#5E9E48", leaf2="#7CB860"):
    """Round friendly tree with its base at (x, y), scale s.  Absolute coords only."""
    return (f'<rect x="{x-5*s:.0f}" y="{y-60*s:.0f}" width="{10*s:.0f}" height="{60*s:.0f}" fill="{trunk}"/>'
            f'<circle cx="{x:.0f}" cy="{y-80*s:.0f}" r="{40*s:.0f}" fill="{leaf}"/>'
            f'<circle cx="{x-22*s:.0f}" cy="{y-66*s:.0f}" r="{26*s:.0f}" fill="{leaf}"/>'
            f'<circle cx="{x+24*s:.0f}" cy="{y-68*s:.0f}" r="{26*s:.0f}" fill="{leaf}"/>'
            f'<circle cx="{x-10*s:.0f}" cy="{y-92*s:.0f}" r="{22*s:.0f}" fill="{leaf2}"/>')


def _fruit(cx, cy, pts, c="#E4473D", r=6):
    return "".join(f'<circle cx="{cx+dx}" cy="{cy+dy}" r="{r}" fill="{c}"/>' for dx, dy in pts)


def _chair(x, y, s, c, face=1):
    """Simple side-view chair; x is the back-post edge, y the seat top; face=1 faces right, -1 faces left."""
    w, hb, hl = 44 * s, 60 * s, 40 * s
    x0 = x if face == 1 else x - w
    bx = x if face == 1 else x - 9 * s
    lx1 = x0 + 3 * s
    lx2 = x0 + w - 9 * s
    return (f'<g fill="{c}">'
            f'<rect x="{bx:.0f}" y="{y-hb:.0f}" width="{9*s:.0f}" height="{hb:.0f}" rx="{3*s:.0f}"/>'
            f'<rect x="{x0:.0f}" y="{y:.0f}" width="{w:.0f}" height="{10*s:.0f}" rx="{3*s:.0f}"/>'
            f'<rect x="{lx1:.0f}" y="{y+10*s:.0f}" width="{6*s:.0f}" height="{hl:.0f}"/>'
            f'<rect x="{lx2:.0f}" y="{y+10*s:.0f}" width="{6*s:.0f}" height="{hl:.0f}"/>'
            f'<rect x="{bx:.0f}" y="{y-hb:.0f}" width="{9*s:.0f}" height="{18*s:.0f}" rx="{3*s:.0f}" fill="#FFF" opacity=".18"/>'
            f'</g>')


def _wrap(key, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[key]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


# ───────────────────────── 12-1  Knowing & Accepting Yourself: sunny room with a mirror ─────────────────────────
def _b12_1():
    p = "sb12u1-"
    defs = (_lin(p+"wall", [(0, "#FFF4D6", None), (1, "#F9E0B0", None)])
            + _lin(p+"floor", [(0, "#E2B27A", None), (1, "#8A5A34", None)])
            + _lin(p+"sky", [(0, "#78C4F0", None), (1, "#D6F0FA", None)])
            + _lin(p+"glass", [(0, "#BFE6F4", None), (1, "#E8F6FA", None)])
            + _rad(p+"sun", [(0, "#FFF3B0", .9), (1, "#FFF3B0", 0)]))
    boards = "".join(f'<path d="M{x} 280 l-40 140" stroke="#B07A46" stroke-width="2" opacity=".4"/>' for x in range(0, 1300, 70))
    rays = "".join(f'<path d="M980 60 l{dx} {dy}" stroke="#FFE27A" stroke-width="5" stroke-linecap="round" opacity=".7"/>'
                   for dx, dy in [(0, -44), (32, -32), (44, 0), (32, 32), (0, 44), (-32, 32), (-44, 0), (-32, -32)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="820" y="30" width="320" height="200" rx="8" fill="#5A3A24"/>
<rect x="834" y="44" width="292" height="172" fill="url(#{p}sky)"/>
<circle cx="980" cy="60" r="70" fill="url(#{p}sun)"/><circle cx="980" cy="60" r="24" fill="#FFE27A"/>{rays}
<g fill="#FFF" opacity=".9"><ellipse cx="900" cy="150" rx="40" ry="16"/><ellipse cx="920" cy="140" rx="30" ry="18"/><ellipse cx="1060" cy="110" rx="34" ry="14"/></g>
<path d="M980 44 v172 M834 130 h292" stroke="#5A3A24" stroke-width="6"/>
<rect x="810" y="226" width="340" height="12" fill="#8A5A34"/>
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}floor)"/>{boards}
<rect x="60" y="80" width="160" height="200" rx="4" fill="#8A5A34"/><rect x="70" y="90" width="140" height="180" fill="#E8C898"/>
<circle cx="140" cy="180" r="9" fill="#F4C84A"/>
<g><path d="M440 280 V70 q80 -40 160 0 V280z" fill="#F4C84A"/>
<path d="M458 280 V82 q62 -30 124 0 V280z" fill="url(#{p}glass)"/>
<path d="M470 92 q52 -26 104 0 V150 q-52 -20 -104 0z" fill="#78C4F0" opacity=".55"/>
<circle cx="560" cy="120" r="14" fill="#FFE27A" opacity=".8"/>
<path d="M470 180 q52 -14 104 0 V280 H470z" fill="#F9E0B0" opacity=".6"/>
<path d="M478 100 q0 90 12 160" stroke="#FFF" stroke-width="8" fill="none" opacity=".5" stroke-linecap="round"/>
<rect x="430" y="278" width="180" height="12" rx="4" fill="#B07A46"/></g>
<g><path d="M700 280 v-90 q0 -16 16 -16 h64 q16 0 16 16 v90z" fill="#E4573D"/>
<path d="M716 236 h80 v44 h-80z" fill="#C8432C"/><path d="M726 250 h60 v30 h-60z" fill="#F28A4A"/>
<path d="M716 176 q32 -30 64 0" stroke="#3A2A20" stroke-width="7" fill="none" stroke-linecap="round"/>
<circle cx="756" cy="222" r="5" fill="#3A2A20"/><path d="M756 228 v12" stroke="#3A2A20" stroke-width="4"/></g>
<g><path d="M290 280 l6 -40 h60 l6 40z" fill="#C86A3E"/>
<path d="M326 240 q-10 -40 6 -70 q-24 20 -30 60 q-18 -30 -8 -56 q10 20 14 40 q6 -50 40 -60 q-26 24 -22 86z" fill="#4E9A3E"/>
<circle cx="336" cy="180" r="10" fill="#F05A7A"/><circle cx="300" cy="196" r="8" fill="#F4C84A"/></g>
<rect x="880" y="250" width="200" height="30" rx="6" fill="#2A6A9A"/><rect x="880" y="244" width="200" height="12" rx="4" fill="#4A8ABA"/>
<circle cx="1040" cy="236" r="18" fill="#F4C84A"/><circle cx="1000" cy="240" r="12" fill="#E4573D"/>
<path d="M0 370 H1200 V420 H0z" fill="#2A1008" opacity=".45"/>
'''
    return _wrap("12-1", body, defs)


# ───────────────────────── 12-2  Self-Compassion & Self-Forgiveness: garden path with a watering can ─────────────────────────
def _b12_2():
    p = "sb12u2-"
    defs = (_lin(p+"sky", [(0, "#7AC8F2", None), (1, "#E0F4FA", None)])
            + _lin(p+"hill", [(0, "#9CD46A", None), (1, "#5E9E48", None)])
            + _lin(p+"grass", [(0, "#8CC85A", None), (1, "#3E7A34", None)])
            + _lin(p+"path", [(0, "#F2D8A8", None), (1, "#C8A878", None)])
            + _rad(p+"sun", [(0, "#FFF3B0", .95), (1, "#FFF3B0", 0)]))
    flowers = "".join(f'<g><path d="M{x} 280 v-{h}" stroke="#3E7A34" stroke-width="3"/><circle cx="{x}" cy="{280-h}" r="9" fill="{c}"/><circle cx="{x}" cy="{280-h}" r="4" fill="#FFE27A"/></g>'
                      for x, h, c in [(60, 40, "#F05A7A"), (100, 56, "#F4C84A"), (140, 36, "#9A6AD8"), (1080, 46, "#F05A7A"), (1120, 60, "#5AA0E0"), (1160, 40, "#F4C84A"), (200, 30, "#F28A4A"), (1030, 34, "#F28A4A")])
    stones = "".join(f'<ellipse cx="{x}" cy="{y}" rx="34" ry="12" fill="#D8C4A0" opacity=".9"/>' for x, y in [(600, 296), (560, 322), (640, 348), (590, 376)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="980" cy="80" r="100" fill="url(#{p}sun)"/><circle cx="980" cy="80" r="40" fill="#FFE27A"/>
<g fill="#FFF" opacity=".95"><ellipse cx="240" cy="90" rx="60" ry="22"/><ellipse cx="270" cy="76" rx="40" ry="24"/><ellipse cx="700" cy="60" rx="46" ry="16"/><ellipse cx="720" cy="50" rx="30" ry="18"/></g>
<path d="M0 240 Q300 170 600 220 T1200 210 V300 H0z" fill="url(#{p}hill)"/>
{_tree(180, 250, 1.1)}{_tree(1010, 244, .9, leaf="#6AAE52", leaf2="#8CC868")}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}grass)"/>
<path d="M520 280 q60 40 40 140 h120 q-30 -100 40 -140z" fill="url(#{p}path)"/>{stones}
{flowers}
<g><rect x="760" y="250" width="150" height="14" rx="3" fill="#8A5A34"/><rect x="760" y="230" width="150" height="14" rx="3" fill="#A87040"/>
<rect x="768" y="264" width="10" height="20" fill="#6A4A2A"/><rect x="892" y="264" width="10" height="20" fill="#6A4A2A"/>
<path d="M770 230 v-30 q0 -8 8 -8 h134 q8 0 8 8 v30" fill="none" stroke="#8A5A34" stroke-width="8"/></g>
<g><path d="M330 280 v-56 h80 v56z" fill="#3B8AB8"/><path d="M330 240 h80" stroke="#2A6A9A" stroke-width="6"/>
<path d="M410 240 l40 -30 l8 6 l-40 30" fill="#3B8AB8"/><path d="M448 206 l12 -6" stroke="#3B8AB8" stroke-width="10" stroke-linecap="round"/>
<path d="M370 224 q0 -30 30 -30" stroke="#2A6A9A" stroke-width="7" fill="none"/>
<g fill="#7AC8F2"><circle cx="480" cy="212" r="3"/><circle cx="492" cy="224" r="3"/><circle cx="504" cy="238" r="3"/><circle cx="470" cy="228" r="2.5"/><circle cx="486" cy="246" r="2.5"/></g></g>
<g><path d="M500 280 l6 -34 h44 l6 34z" fill="#C86A3E"/><path d="M528 246 v-26" stroke="#4E9A3E" stroke-width="4"/>
<path d="M528 226 q-16 -6 -18 -22 q16 2 18 22z M528 232 q16 -8 20 -24 q-18 2 -20 24z" fill="#6ABE50"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#10240A" opacity=".45"/>
'''
    return _wrap("12-2", body, defs)


# ───────────────────────── 12-3  Empathy & Forgiving Others: two chairs under a tree ─────────────────────────
def _b12_3():
    p = "sb12u3-"
    defs = (_lin(p+"sky", [(0, "#82CCF4", None), (1, "#E6F5FB", None)])
            + _lin(p+"grass", [(0, "#94CC62", None), (1, "#4A8A3C", None)])
            + _rad(p+"rug", [(0, "#F6C24A", None), (1, "#E8883A", None)]))
    rings = "".join(f'<ellipse cx="600" cy="300" rx="{r}" ry="{r*.32:.0f}" fill="none" stroke="#C8432C" stroke-width="4" opacity=".6"/>' for r in (240, 180, 120))
    leaves = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for x, y, r, c in
                     [(600, 90, 90, "#4E9A3E"), (500, 120, 70, "#5EAA4A"), (700, 120, 70, "#5EAA4A"), (560, 60, 60, "#6ABE50"), (650, 70, 56, "#6ABE50"), (440, 160, 50, "#4E9A3E"), (760, 160, 50, "#4E9A3E")])
    swing = ('<path d="M300 150 v100 M350 150 v100" stroke="#8A5A34" stroke-width="3"/><rect x="290" y="248" width="70" height="10" rx="3" fill="#C86A3E"/><path d="M290 150 h70" stroke="#6A4A2A" stroke-width="8" stroke-linecap="round"/>')
    butterflies = "".join(f'<g fill="{c}"><ellipse cx="{x-7}" cy="{y}" rx="7" ry="5" transform="rotate(-20 {x-7} {y})"/><ellipse cx="{x+7}" cy="{y}" rx="7" ry="5" transform="rotate(20 {x+7} {y})"/></g>'
                          for x, y, c in [(880, 120, "#F05A7A"), (930, 90, "#F4C84A"), (300, 110, "#9A6AD8")])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#FFF" opacity=".95"><ellipse cx="200" cy="70" rx="60" ry="20"/><ellipse cx="230" cy="58" rx="36" ry="22"/><ellipse cx="1000" cy="60" rx="56" ry="18"/><ellipse cx="1030" cy="48" rx="34" ry="20"/></g>
<path d="M0 260 Q300 220 600 250 T1200 240 V300 H0z" fill="#7EBE58"/>
<rect x="586" y="150" width="28" height="130" fill="#6A4A2A"/><path d="M586 220 q-30 -20 -50 -60 M614 200 q30 -14 50 -50" stroke="#6A4A2A" stroke-width="10" fill="none" stroke-linecap="round"/>
{leaves}{swing}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}grass)"/>
<ellipse cx="600" cy="300" rx="260" ry="84" fill="url(#{p}rug)"/>{rings}
{_chair(470, 250, 1.1, "#3B6AB8", 1)}{_chair(730, 250, 1.1, "#E4573D", -1)}
<circle cx="600" cy="268" r="24" fill="#FFF"/><circle cx="600" cy="268" r="9" fill="#E4573D"/><g fill="#E4573D" opacity=".8"><circle cx="582" cy="258" r="5"/><circle cx="618" cy="258" r="5"/><circle cx="584" cy="282" r="5"/><circle cx="616" cy="282" r="5"/></g>
{butterflies}
<g fill="#F05A7A"><circle cx="120" cy="272" r="8"/><circle cx="1080" cy="270" r="8"/></g><g fill="#F4C84A"><circle cx="150" cy="266" r="7"/><circle cx="1050" cy="264" r="7"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#10240A" opacity=".45"/>
'''
    return _wrap("12-3", body, defs)


# ───────────────────────── 12-4  Grace & Generosity: apple orchard with baskets ─────────────────────────
def _b12_4():
    p = "sb12u4-"
    defs = (_lin(p+"sky", [(0, "#88CCF4", None), (1, "#F6EED0", None)])
            + _lin(p+"grass", [(0, "#A0D06A", None), (1, "#4A8A3C", None)])
            + _rad(p+"sun", [(0, "#FFF3B0", .95), (1, "#FFF3B0", 0)]))
    apples = [(-20, -18), (18, -30), (6, 4), (-28, 10), (30, 2), (-4, -36)]
    trees = "".join(_tree(x, 270, s) + _fruit(x, int(270 - 80*s), [(int(dx*s), int(dy*s)) for dx, dy in apples], r=int(6*s)+1)
                    for x, s in [(120, 1.2), (330, 1.0), (880, 1.0), (1090, 1.2)])
    def basket(x, y, s):
        return (f'<path d="M{x-40*s:.0f} {y-30*s:.0f} h{80*s:.0f} l-{10*s:.0f} {30*s:.0f} h-{60*s:.0f}z" fill="#C89A5A"/>'
                f'<path d="M{x-40*s:.0f} {y-30*s:.0f} q{40*s:.0f} -{60*s:.0f} {80*s:.0f} 0" stroke="#A87040" stroke-width="{5*s:.0f}" fill="none"/>'
                f'<path d="M{x-34*s:.0f} {y-18*s:.0f} h{68*s:.0f} M{x-30*s:.0f} {y-8*s:.0f} h{60*s:.0f}" stroke="#A87040" stroke-width="{2*s:.0f}"/>'
                + _fruit(x, int(y-34*s), [(int(-22*s), 0), (0, int(-6*s)), (int(22*s), 0), (int(-10*s), int(-14*s)), (int(12*s), int(-14*s))], r=int(8*s)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="600" cy="50" r="110" fill="url(#{p}sun)"/><circle cx="600" cy="50" r="42" fill="#FFE27A"/>
<g fill="#FFF" opacity=".95"><ellipse cx="260" cy="80" rx="58" ry="20"/><ellipse cx="290" cy="66" rx="36" ry="22"/><ellipse cx="940" cy="90" rx="54" ry="18"/><ellipse cx="970" cy="76" rx="34" ry="20"/></g>
<path d="M0 250 Q300 200 600 236 T1200 226 V300 H0z" fill="#8CC85A"/>
{trees}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}grass)"/>
<g fill="#F2E6D0"><path d="M470 292 h260 l60 60 H410z"/></g>
<g stroke="#E4573D" stroke-width="5" opacity=".8" fill="none"><path d="M480 306 h240 M496 322 h230 M512 338 h230"/><path d="M540 292 l-40 60 M600 292 l0 60 M660 292 l40 60"/></g>
{basket(520, 290, 1.0)}{basket(690, 290, .85)}
<g fill="#3B6AB8"><rect x="1000" y="240" width="140" height="40" rx="10"/><rect x="1030" y="222" width="80" height="24" rx="8"/></g>
<g fill="#E4473D"><circle cx="1020" cy="232" r="9"/><circle cx="1120" cy="228" r="9"/></g>
<g fill="#F4C84A"><circle cx="740" cy="240" r="8"/><circle cx="460" cy="244" r="8"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#10240A" opacity=".45"/>
'''
    return _wrap("12-4", body, defs)


# ───────────────────────── 18-1  Knowing & Accepting Yourself: hilltop trail with compass and backpack ─────────────────────────
def _b18_1():
    p = "sb18u1-"
    defs = (_lin(p+"sky", [(0, "#5AA8E6", None), (1, "#DCEFF6", None)])
            + _lin(p+"far", [(0, "#8AA8C8", None), (1, "#6A88A8", None)])
            + _lin(p+"mid", [(0, "#7AA860", None), (1, "#4A7A40", None)])
            + _lin(p+"grass", [(0, "#A8B86A", None), (1, "#5A6A34", None)])
            + _rad(p+"face", [(0, "#FFFBEA", None), (1, "#E8D8B0", None)]))
    ticks = "".join(f'<rect x="{578}" y="{182}" width="4" height="{10 if k % 3 == 0 else 5}" fill="#3A2A20" transform="rotate({k*30} 580 236)"/>' for k in range(12))
    tufts = "".join(f'<path d="M{x} 300 l4 -14 l3 14 l4 -10 l2 10z" fill="#4A5A24"/>' for x in range(20, 1200, 43))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#FFF" opacity=".9"><ellipse cx="300" cy="70" rx="70" ry="22"/><ellipse cx="340" cy="56" rx="40" ry="24"/><ellipse cx="1000" cy="90" rx="60" ry="20"/><ellipse cx="1030" cy="76" rx="36" ry="22"/></g>
<path d="M0 220 L140 130 L280 190 L420 100 L560 170 L700 120 L860 190 L1000 110 L1200 180 V260 H0z" fill="url(#{p}far)"/>
<path d="M0 250 Q200 200 400 236 T800 226 T1200 232 V300 H0z" fill="url(#{p}mid)"/>
{_tree(1080, 262, .9, leaf="#4E8A40", leaf2="#6AA452")}{_tree(90, 266, .8, leaf="#4E8A40", leaf2="#6AA452")}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}grass)"/>{tufts}
<path d="M520 280 q40 50 80 140 h60 q-40 -90 20 -140z" fill="#D8C49A" opacity=".8"/>
<g><rect x="840" y="110" width="10" height="170" fill="#6A4A2A"/>
<path d="M850 130 h110 l16 12 l-16 12 h-110z" fill="#C89A5A"/><path d="M840 170 h-110 l-16 12 l16 12 h110z" fill="#C89A5A"/>
<path d="M866 142 h80 M746 182 h80" stroke="#6A4A2A" stroke-width="3" opacity=".6"/></g>
<g><path d="M300 280 v-100 q0 -20 20 -20 h90 q20 0 20 20 v100z" fill="#2A6A9A"/>
<path d="M320 220 h90 v60 h-90z" fill="#1E5078"/><path d="M332 236 h66 v36 h-66z" fill="#4A8ABA"/>
<path d="M320 160 q45 -34 90 0" stroke="#1E3A50" stroke-width="8" fill="none" stroke-linecap="round"/>
<rect x="290" y="200" width="14" height="40" rx="4" fill="#1E5078"/><rect x="426" y="200" width="14" height="40" rx="4" fill="#1E5078"/>
<path d="M300 262 h140" stroke="#F4C84A" stroke-width="4"/></g>
<ellipse cx="600" cy="278" rx="130" ry="30" fill="#8A8A7A"/><ellipse cx="596" cy="270" rx="118" ry="24" fill="#B0B0A0"/>
<g><circle cx="580" cy="236" r="60" fill="#B8742A"/><circle cx="580" cy="236" r="52" fill="url(#{p}face)"/>{ticks}
<path d="M580 236 l-14 10 l14 -60 l14 60z" fill="#E4573D"/><path d="M580 236 l14 -10 l-14 60 l-14 -60z" fill="#3A2A20"/>
<circle cx="580" cy="236" r="6" fill="#F4C84A"/><path d="M580 172 v-14" stroke="#B8742A" stroke-width="10" stroke-linecap="round"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#1A2010" opacity=".5"/>
'''
    return _wrap("18-1", body, defs)


# ───────────────────────── 18-2  Self-Compassion & Self-Forgiveness: lighthouse at dusk ─────────────────────────
def _b18_2():
    p = "sb18u2-"
    defs = (_lin(p+"sky", [(0, "#3A4A8A", None), (.55, "#B06A8A", None), (.85, "#F0A070", None), (1, "#F8CC90", None)])
            + _lin(p+"sea", [(0, "#6A8AB8", None), (1, "#1E2E58", None)])
            + _lin(p+"rock", [(0, "#6A5A50", None), (1, "#2A2028", None)])
            + _lin(p+"beam", [(0, "#FFE8A0", .75), (1, "#FFE8A0", 0)], 0, 0, 1, 0)
            + _rad(p+"lamp", [(0, "#FFF6C0", 1), (.4, "#FFE27A", .8), (1, "#FFE27A", 0)]))
    waves = "".join(f'<path d="M{x} {y} q20 -6 40 0 q20 6 40 0" stroke="#A8C0E0" stroke-width="2" fill="none" opacity=".5"/>' for x, y in [(60, 300), (200, 320), (900, 310), (1050, 330), (160, 350), (980, 356), (740, 300)])
    stripes = "".join(f'<path d="M{548+k*3} {130+k*30} h{104-k*6} v16 h-{104-k*6}z" fill="#E4573D"/>' for k in (0, 2, 4))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(21, 36, 140, "#FFF4DA", ".7")}
<circle cx="220" cy="120" r="30" fill="#FFF6D8" opacity=".9"/><circle cx="232" cy="112" r="26" fill="#6A6AA0" opacity=".9"/>
<path d="M0 240 H1200 V420 H0z" fill="url(#{p}sea)"/>
<path d="M0 240 Q300 236 600 240 T1200 240 v6 H0z" fill="#F0A070" opacity=".5"/>{waves}
<path d="M600 90 L1200 20 V180 Z" fill="url(#{p}beam)"/><path d="M600 90 L0 30 V170 Z" fill="url(#{p}beam)" opacity=".6"/>
<path d="M380 300 q60 -80 220 -70 q160 -10 240 70 q40 30 -20 40 H360 q-30 -10 20 -40z" fill="url(#{p}rock)"/>
<g><path d="M550 260 l18 -180 h64 l18 180z" fill="#F6EEDC"/>{stripes}
<rect x="556" y="72" width="88" height="12" fill="#3A2A20"/><rect x="566" y="40" width="68" height="34" fill="#FFE27A"/>
<path d="M566 40 h68 M566 52 h68 M582 40 v34 M618 40 v34" stroke="#3A2A20" stroke-width="3"/>
<path d="M560 40 l40 -26 l40 26z" fill="#E4573D"/><circle cx="600" cy="10" r="4" fill="#3A2A20"/>
<circle cx="600" cy="57" r="60" fill="url(#{p}lamp)"/>
<rect x="590" y="200" width="20" height="30" rx="10" fill="#3A2A20"/><rect x="590" y="130" width="20" height="26" rx="10" fill="#3A2A20"/></g>
<g><rect x="690" y="222" width="70" height="60" fill="#E8C898"/><path d="M684 222 l41 -26 l41 26z" fill="#8A3E2A"/><rect x="716" y="244" width="18" height="20" fill="#FFE27A"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#0A0E24" opacity=".5"/>
'''
    return _wrap("18-2", body, defs)


# ───────────────────────── 18-3  Empathy & Forgiving Others: footbridge over a stream ─────────────────────────
def _b18_3():
    p = "sb18u3-"
    defs = (_lin(p+"sky", [(0, "#F6D8A8", None), (.5, "#FBE8C8", None), (1, "#CFE8F2", None)])
            + _lin(p+"bank", [(0, "#8CBA5A", None), (1, "#4A7A3C", None)])
            + _lin(p+"water", [(0, "#8AC8E8", None), (1, "#3A78A8", None)])
            + _lin(p+"wood", [(0, "#B07A46", None), (1, "#7A4E2A", None)])
            + _rad(p+"glow", [(0, "#FFE8A0", .8), (1, "#FFE8A0", 0)]))
    planks = "".join(f'<path d="M{x} 226 v20" stroke="#5A3A24" stroke-width="2" opacity=".5"/>' for x in range(420, 800, 18))
    rails = "".join(f'<path d="M{x} 226 v-36" stroke="#7A4E2A" stroke-width="5"/>' for x in range(430, 790, 40))
    reeds = "".join(f'<path d="M{x} {y} q-4 -40 {dx} -60" stroke="#4A7A3C" stroke-width="3" fill="none"/>' for x, y, dx in [(120, 300, 6), (140, 306, -4), (160, 302, 8), (1040, 300, -6), (1060, 306, 4), (1080, 300, -8)])
    ripples = "".join(f'<path d="M{x} {y} q20 -5 40 0 q20 5 40 0" stroke="#CFEFFF" stroke-width="2" fill="none" opacity=".6"/>' for x, y in [(300, 330), (500, 350), (720, 340), (880, 360), (420, 380), (640, 386)])
    def lantern(x):
        return (f'<rect x="{x-4}" y="120" width="8" height="106" fill="#3A2A20"/>'
                f'<path d="M{x-16} 120 h32 l-4 -36 h-24z" fill="#3A2A20"/><rect x="{x-9}" y="92" width="18" height="24" fill="#FFE27A"/>'
                f'<path d="M{x-12} 84 l12 -10 l12 10z" fill="#3A2A20"/><circle cx="{x}" cy="104" r="36" fill="url(#{p}glow)"/>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="600" cy="120" r="120" fill="url(#{p}glow)"/>
<path d="M0 200 Q200 150 400 190 T800 180 T1200 190 V260 H0z" fill="#A8C888" opacity=".8"/>
{_tree(200, 262, 1.2, leaf="#5E9E48", leaf2="#7CB860")}{_tree(1000, 258, 1.3, leaf="#4E8A40", leaf2="#6AA452")}{_tree(80, 270, .7)}{_tree(1140, 270, .7)}
<path d="M0 260 Q150 250 300 262 L340 300 H0z" fill="url(#{p}bank)"/><path d="M1200 260 Q1050 250 900 262 L860 300 H1200z" fill="url(#{p}bank)"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}water)"/>
<path d="M300 262 Q600 240 900 262 L1200 300 V420 H0 V300z" fill="url(#{p}water)"/>{ripples}
<path d="M0 262 Q150 258 320 280 Q400 300 340 330 H0z" fill="url(#{p}bank)"/><path d="M1200 262 Q1050 258 880 280 Q800 300 860 330 H1200z" fill="url(#{p}bank)"/>
{reeds}
<g><path d="M400 250 Q600 200 800 250 v-24 Q600 176 400 226z" fill="url(#{p}wood)"/>
<path d="M400 226 Q600 176 800 226" stroke="#5A3A24" stroke-width="3" fill="none"/>{planks}
<path d="M400 190 Q600 140 800 190" stroke="#7A4E2A" stroke-width="6" fill="none"/>{rails}
<path d="M420 254 v-40 M780 254 v-40" stroke="#5A3A24" stroke-width="8"/></g>
{lantern(420)}{lantern(780)}
<g fill="#F05A7A"><circle cx="360" cy="286" r="6"/><circle cx="840" cy="284" r="6"/></g><g fill="#F4C84A"><circle cx="380" cy="292" r="5"/><circle cx="820" cy="290" r="5"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#0A1A24" opacity=".45"/>
'''
    return _wrap("18-3", body, defs)


# ───────────────────────── 18-4  Grace & Generosity: orchard at harvest ─────────────────────────
def _b18_4():
    p = "sb18u4-"
    defs = (_lin(p+"sky", [(0, "#F2B870", None), (.5, "#F8D8A0", None), (1, "#E8EAD0", None)])
            + _lin(p+"grass", [(0, "#B8B860", None), (1, "#5A6A34", None)])
            + _rad(p+"sun", [(0, "#FFF3B0", .95), (1, "#FFF3B0", 0)]))
    fruit = [(-20, -18), (18, -30), (6, 4), (-28, 10), (30, 2), (-4, -36), (26, -22)]
    trees = "".join(_tree(x, 270, s, leaf="#5E8E44", leaf2="#7AA858") + _fruit(x, int(270 - 80*s), [(int(dx*s), int(dy*s)) for dx, dy in fruit], c=c, r=int(6*s)+1)
                    for x, s, c in [(140, 1.3, "#E4473D"), (400, 1.0, "#F2A02E"), (1060, 1.3, "#E4473D"), (820, 1.0, "#F2A02E")])
    ladder = "".join(f'<path d="M{170+k*3} {270-k*22} h50" stroke="#C89A5A" stroke-width="5"/>' for k in range(1, 6))
    rows = "".join(f'<path d="M{x} 300 q300 -14 600 0" stroke="#4A5A24" stroke-width="2" fill="none" opacity=".4"/>' for x in (0, 600))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="600" cy="80" r="110" fill="url(#{p}sun)"/><circle cx="600" cy="80" r="36" fill="#FFE27A"/>
<path d="M0 240 Q300 200 600 226 T1200 220 V300 H0z" fill="#9AB868"/>
{trees}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}grass)"/>{rows}
<g><path d="M160 280 l16 -130 M226 280 l16 -130" stroke="#C89A5A" stroke-width="7"/>{ladder}</g>
<g><path d="M480 250 h150 l-20 40 h-110z" fill="#8A5A34"/><path d="M630 250 l60 -30" stroke="#6A4A2A" stroke-width="8" stroke-linecap="round"/>
<circle cx="490" cy="292" r="16" fill="#3A2A20"/><circle cx="490" cy="292" r="6" fill="#8A8A7A"/>
{_fruit(556, 250, [(-40, -8), (-14, -16), (14, -8), (40, -14), (0, -30), (-26, -30), (28, -30)], c="#E4473D", r=10)}</g>
<g><path d="M760 280 l6 -36 h96 l6 36z" fill="#C89A5A"/><path d="M766 244 q48 -60 96 0" stroke="#A87040" stroke-width="6" fill="none"/>
{_fruit(814, 244, [(-30, -6), (0, -12), (30, -6), (-14, -24), (16, -24)], c="#F2A02E", r=10)}</g>
<g><path d="M920 280 l6 -30 h70 l6 30z" fill="#C89A5A"/>{_fruit(961, 250, [(-22, -4), (0, -10), (22, -4), (-10, -20), (12, -20)], c="#E4473D", r=8)}</g>
<g fill="#F4C84A"><circle cx="60" cy="270" r="7"/><circle cx="1140" cy="268" r="7"/><circle cx="700" cy="262" r="6"/></g>
<g stroke="#4A3A30" stroke-width="2.5" fill="none"><path d="M900 60 q8 -8 14 0 q6 -8 14 0"/><path d="M950 44 q8 -8 14 0 q6 -8 14 0"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#1E1A08" opacity=".45"/>
'''
    return _wrap("18-4", body, defs)


# ───────────────────────── 36-1  Identity & The Weight of Perception: mirror and mask at dusk ─────────────────────────
def _b36_1():
    p = "sb36u1-"
    defs = (_lin(p+"wall", [(0, "#3A3050", None), (1, "#221C34", None)])
            + _lin(p+"sky", [(0, "#4A4A8A", None), (.6, "#A06A8A", None), (1, "#F0A070", None)])
            + _lin(p+"glass", [(0, "#5A5A9A", None), (.6, "#B07A98", None), (1, "#E8A880", None)])
            + _lin(p+"wood", [(0, "#8A5A3A", None), (1, "#4A2E1C", None)])
            + _rad(p+"glow", [(0, "#FFE8A0", .7), (1, "#FFE8A0", 0)]))
    grain = "".join(f'<path d="M{x} 262 q200 4 400 0" stroke="#3A2A20" stroke-width="1" fill="none" opacity=".4"/>' for x in (0, 400, 800))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="60" y="30" width="300" height="190" fill="#1A1428"/><rect x="72" y="42" width="276" height="166" fill="url(#{p}sky)"/>
{_stars(7, 18, 80, "#FFF4DA", ".6", 80, 340)}
<path d="M210 42 v166 M72 124 h276" stroke="#1A1428" stroke-width="6"/>
<g fill="#2A2040"><path d="M72 208 v-40 l30 -10 l20 14 l40 -20 l60 30 l40 -14 l40 20 l46 -10 v30z"/></g>
<path d="M0 250 H1200 V420 H0z" fill="url(#{p}wood)"/>{grain}
<path d="M0 250 h1200 v10 H0z" fill="#A87040" opacity=".6"/>
<g><ellipse cx="600" cy="80" rx="96" ry="120" fill="#C8A878"/><ellipse cx="600" cy="80" rx="84" ry="108" fill="url(#{p}glass)"/>
<ellipse cx="600" cy="80" rx="84" ry="108" fill="url(#{p}glow)" opacity=".5"/>
<path d="M540 40 q20 -40 50 -30" stroke="#FFF" stroke-width="6" fill="none" opacity=".35" stroke-linecap="round"/>
<path d="M520 120 q80 -30 160 0 v50 q-80 -20 -160 0z" fill="#2A2040" opacity=".55"/>
{_stars(3, 8, 60, "#FFF4DA", ".5", 540, 660)}
<circle cx="640" cy="60" r="8" fill="#FFF6D8" opacity=".9"/>
<path d="M520 90 q-30 30 -26 60 M680 90 q30 30 26 60" stroke="#C8A878" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M494 146 l6 104 M706 146 l-6 104" stroke="#C8A878" stroke-width="10" stroke-linecap="round"/><rect x="480" y="240" width="240" height="12" rx="4" fill="#A8885A"/></g>
<g><path d="M820 130 q-52 0 -52 60 q0 40 26 60 q26 12 52 0 q26 -20 26 -60 q0 -60 -52 -60z" fill="#E8DCC8"/>
<path d="M790 176 q12 -10 26 0 q-12 8 -26 0z M824 176 q12 -10 26 0 q-12 8 -26 0z" fill="#3A3050"/>
<path d="M768 170 l-40 -6 M872 170 l40 -6" stroke="#8A6A4A" stroke-width="2"/></g>
<g><rect x="960" y="190" width="14" height="60" fill="#8A6A4A"/><rect x="940" y="170" width="54" height="30" rx="6" fill="#F8E8B8"/><rect x="954" y="186" width="26" height="8" fill="#E8C898"/>
<circle cx="967" cy="176" r="40" fill="url(#{p}glow)"/></g>
<g><rect x="1040" y="220" width="90" height="30" rx="2" fill="#6A3A48"/><rect x="1050" y="200" width="70" height="24" rx="2" fill="#3A5A6A"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#0A0814" opacity=".55"/>
'''
    return _wrap("36-1", body, defs)


# ───────────────────────── 36-2  Self-Compassion & The Internal Critic: classroom window at dusk ─────────────────────────
def _b36_2():
    p = "sb36u2-"
    defs = (_lin(p+"wall", [(0, "#4A4258", None), (1, "#2C2638", None)])
            + _lin(p+"sky", [(0, "#2A3A78", None), (.5, "#7A5A8A", None), (.85, "#E88A6A", None), (1, "#F8C890", None)])
            + _lin(p+"desk", [(0, "#8A6A48", None), (1, "#4A3424", None)])
            + _rad(p+"lamp", [(0, "#FFE8A0", .8), (1, "#FFE8A0", 0)]))
    city = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{200-y}" fill="#2A2448"/>' for x, y, w in [(180, 140, 30), (216, 120, 40), (262, 150, 24), (292, 110, 36), (334, 130, 30), (760, 132, 36), (802, 116, 30), (838, 146, 40), (884, 124, 26), (916, 138, 34)])
    wins = "".join(f'<rect x="{x}" y="{y}" width="5" height="6" fill="#FFD98A" opacity=".85"/>' for x, y in [(190, 150), (226, 130), (236, 146), (300, 122), (310, 138), (342, 142), (770, 142), (810, 126), (850, 156), (890, 134), (926, 148), (900, 150)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g><rect x="150" y="40" width="240" height="180" fill="#1A1628"/><rect x="160" y="50" width="220" height="160" fill="url(#{p}sky)"/></g>
<g><rect x="730" y="40" width="240" height="180" fill="#1A1628"/><rect x="740" y="50" width="220" height="160" fill="url(#{p}sky)"/></g>
{_stars(9, 10, 40, "#FFF4DA", ".6", 160, 380)}{_stars(4, 10, 40, "#FFF4DA", ".6", 740, 960)}
<path d="M160 200 H380 M740 200 H960" stroke="#1A1628" stroke-width="0"/>
{city}{wins}
<path d="M160 200 h220 v10 h-220z M740 200 h220 v10 h-220z" fill="#2A2448"/>
<path d="M270 50 v160 M160 130 h220 M850 50 v160 M740 130 h220" stroke="#1A1628" stroke-width="6"/>
<rect x="140" y="220" width="260" height="10" fill="#6A5A48"/><rect x="720" y="220" width="260" height="10" fill="#6A5A48"/>
<rect x="420" y="60" width="290" height="140" rx="4" fill="#2E4A3E"/><rect x="428" y="68" width="274" height="124" fill="#38584A"/>
<g stroke="#C8D8C8" stroke-width="2" opacity=".35" fill="none"><path d="M460 100 q40 -10 80 0"/><path d="M460 130 q60 8 120 -4"/><path d="M620 100 h50 M620 126 h40"/></g>
<rect x="440" y="196" width="250" height="6" fill="#B8A888"/>
<path d="M0 270 H1200 V420 H0z" fill="url(#{p}desk)"/><path d="M0 270 h1200 v8 H0z" fill="#A88860" opacity=".6"/>
<g><rect x="1020" y="150" width="14" height="120" fill="#4A4A58"/><path d="M1027 150 q-30 -50 -99 -20" stroke="#4A4A58" stroke-width="12" fill="none" stroke-linecap="round"/>
<path d="M888 140 h80 l24 40 h-128z" fill="#5A5A6A"/><path d="M866 180 h126" stroke="#3A3A48" stroke-width="4"/><circle cx="928" cy="200" r="80" fill="url(#{p}lamp)"/><rect x="1000" y="262" width="54" height="12" rx="4" fill="#4A4A58"/></g>
<g><path d="M560 270 l-40 -60 h190 l40 60z" fill="#F6EEDC"/><path d="M552 270 l-40 -60" stroke="#3B6AB8" stroke-width="4"/>
<path d="M540 220 h150 M552 236 h150 M564 252 h150" stroke="#B8C8E0" stroke-width="2" opacity=".7"/>
<path d="M560 230 q30 -6 60 0" stroke="#4A4A58" stroke-width="2" fill="none"/></g>
<g transform="rotate(-18 820 258)"><rect x="760" y="252" width="120" height="12" rx="2" fill="#F4C84A"/><path d="M880 252 l18 6 l-18 6z" fill="#E8C898"/><path d="M898 258 l-6 -2 v4z" fill="#3A2A20"/><rect x="760" y="252" width="16" height="12" rx="2" fill="#F05A7A"/></g>
<g><path d="M300 270 v-40 h60 v40z" fill="#3B6AB8"/><path d="M300 236 h60" stroke="#2A4A8A" stroke-width="4"/><path d="M360 240 v-6 h12 v12 h-12z" fill="#3B6AB8"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#0A0814" opacity=".55"/>
'''
    return _wrap("36-2", body, defs)


# ───────────────────────── 36-3  Empathy & Forgiving Others: two chairs by a tall window at twilight ─────────────────────────
def _b36_3():
    p = "sb36u3-"
    defs = (_lin(p+"wall", [(0, "#4A3A48", None), (1, "#2A2030", None)])
            + _lin(p+"sky", [(0, "#2E3A80", None), (.55, "#8A5A88", None), (1, "#F0A878", None)])
            + _lin(p+"floor", [(0, "#8A6A50", None), (1, "#3A2A20", None)])
            + _rad(p+"lamp", [(0, "#FFE8A0", .85), (1, "#FFE8A0", 0)])
            + _rad(p+"pool", [(0, "#FFE8A0", .35), (1, "#FFE8A0", 0)]))
    boards = "".join(f'<path d="M{x} 280 l-30 140" stroke="#2A1A10" stroke-width="1.5" opacity=".5"/>' for x in range(0, 1300, 80))
    hills = '<path d="M400 200 q60 -40 120 -20 q60 -30 120 0 q80 -30 160 10 v30 H400z" fill="#2A2048"/>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="380" y="20" width="440" height="230" rx="10" fill="#1A1424"/><rect x="396" y="36" width="408" height="200" fill="url(#{p}sky)"/>
{_stars(13, 24, 90, "#FFF4DA", ".65", 400, 800)}
<circle cx="700" cy="90" r="22" fill="#FFF6D8" opacity=".9"/><circle cx="710" cy="84" r="18" fill="#7A5A88" opacity=".9"/>
{hills}
<path d="M600 36 v200 M396 136 h408" stroke="#1A1424" stroke-width="7"/>
<rect x="360" y="236" width="480" height="14" rx="3" fill="#6A5A48"/>
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}floor)"/>{boards}
<ellipse cx="600" cy="300" rx="260" ry="60" fill="url(#{p}pool)"/>
<ellipse cx="600" cy="296" rx="200" ry="50" fill="#6A3A48" opacity=".8"/><ellipse cx="600" cy="296" rx="170" ry="40" fill="none" stroke="#A86A78" stroke-width="3" opacity=".6"/>
<g><rect x="592" y="200" width="16" height="70" fill="#3A2A20"/><ellipse cx="600" cy="270" rx="34" ry="8" fill="#3A2A20"/>
<path d="M566 200 h68 l10 -50 h-88z" fill="#F8E8B8"/><circle cx="600" cy="176" r="70" fill="url(#{p}lamp)"/></g>
{_chair(430, 236, 1.25, "#B08258", 1)}{_chair(770, 236, 1.25, "#B08258", -1)}
<g fill="#C85A6A"><rect x="446" y="234" width="40" height="12" rx="3"/><rect x="714" y="234" width="40" height="12" rx="3"/></g>
<g><path d="M120 280 v-70 q0 -20 20 -20 h80 q20 0 20 20 v70z" fill="#3A4A5A"/><path d="M120 214 h120" stroke="#2A3A48" stroke-width="3"/>
<circle cx="180" cy="176" r="6" fill="#C8A878"/></g>
<g><rect x="1010" y="180" width="110" height="100" fill="#3A4A5A"/><path d="M1020 200 h90 M1020 224 h90 M1020 248 h90" stroke="#2A3A48" stroke-width="12"/>
<path d="M1024 194 h20 v12 h-20z M1052 194 h24 v12 h-24z M1084 194 h18 v12 h-18z M1030 218 h30 v12 h-30z M1070 218 h30 v12 h-30z" fill="#8A6A78"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#0A0810" opacity=".55"/>
'''
    return _wrap("36-3", body, defs)


# ───────────────────────── 36-4  Grace & Generosity: lantern-lit garden path to an open gate ─────────────────────────
def _b36_4():
    p = "sb36u4-"
    defs = (_lin(p+"sky", [(0, "#0E1436", None), (.6, "#2A3A78", None), (1, "#5A5A98", None)])
            + _lin(p+"hedge", [(0, "#2E5A3A", None), (1, "#142A1C", None)])
            + _lin(p+"path", [(0, "#8A7A60", None), (1, "#3A3020", None)])
            + _lin(p+"ground", [(0, "#22402A", None), (1, "#0E1C14", None)])
            + _rad(p+"glow", [(0, "#FFE8A0", .8), (1, "#FFE8A0", 0)])
            + _rad(p+"gate", [(0, "#FFF0B8", .9), (1, "#FFF0B8", 0)]))
    def lantern(x, y, s):
        return (f'<rect x="{x-3*s:.0f}" y="{y-70*s:.0f}" width="{6*s:.0f}" height="{70*s:.0f}" fill="#1A1A20"/>'
                f'<path d="M{x-12*s:.0f} {y-70*s:.0f} h{24*s:.0f} l-{3*s:.0f} -{28*s:.0f} h-{18*s:.0f}z" fill="#1A1A20"/>'
                f'<rect x="{x-7*s:.0f}" y="{y-94*s:.0f}" width="{14*s:.0f}" height="{20*s:.0f}" fill="#FFE27A"/>'
                f'<path d="M{x-10*s:.0f} {y-100*s:.0f} l{10*s:.0f} -{8*s:.0f} l{10*s:.0f} {8*s:.0f}z" fill="#1A1A20"/>'
                f'<circle cx="{x:.0f}" cy="{y-84*s:.0f}" r="{34*s:.0f}" fill="url(#{p}glow)"/>')
    bushes = "".join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*.7:.0f}" fill="{c}"/>' for x, y, r, c in
                     [(60, 260, 60, "#1E3A28"), (150, 270, 50, "#264832"), (1140, 260, 60, "#1E3A28"), (1050, 270, 50, "#264832"), (300, 276, 40, "#1E3A28"), (900, 276, 40, "#1E3A28")])
    blooms = "".join(f'<circle cx="{x}" cy="{y}" r="4" fill="{c}" opacity=".9"/>' for x, y, c in
                     [(40, 240, "#E8B8D8"), (90, 226, "#F8E8B8"), (130, 250, "#E8B8D8"), (1160, 236, "#E8B8D8"), (1110, 224, "#F8E8B8"), (1070, 250, "#E8B8D8"), (300, 260, "#F8E8B8"), (900, 262, "#F8E8B8")])
    fireflies = "".join(f'<circle cx="{x}" cy="{y}" r="2.5" fill="#FFF0A0" opacity=".85"/>' for x, y in [(380, 180), (420, 150), (820, 170), (860, 200), (500, 120), (720, 110), (250, 200), (960, 190)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(17, 60, 200, "#FFF4DA", ".8")}
<circle cx="1000" cy="70" r="26" fill="#FFF6D8" opacity=".95"/><circle cx="1012" cy="62" r="22" fill="#2A3A78" opacity=".95"/>
<path d="M0 230 Q200 190 400 220 T800 214 T1200 224 V300 H0z" fill="#182A40"/>
<path d="M0 240 H1200 V420 H0z" fill="url(#{p}ground)"/>
<path d="M0 250 h430 v-70 h-430z M770 250 h430 v-70 h-430z" fill="url(#{p}hedge)"/>
<path d="M0 180 q60 -20 100 0 q50 -18 100 0 q60 -20 120 0 q50 -14 110 0 M770 180 q60 -20 100 0 q50 -18 100 0 q60 -20 120 0 q50 -14 110 0" stroke="#2E5A3A" stroke-width="16" fill="none" stroke-linecap="round"/>
<g><rect x="430" y="90" width="30" height="160" fill="#2A2A30"/><rect x="740" y="90" width="30" height="160" fill="#2A2A30"/>
<path d="M430 90 q15 -30 30 0 M740 90 q15 -30 30 0" fill="#2A2A30"/>
<ellipse cx="600" cy="170" rx="150" ry="120" fill="url(#{p}gate)"/>
<path d="M460 250 V120 q0 -10 10 -10 h10 v140z" fill="#1A1A20"/><path d="M740 250 V120 q0 -10 -10 -10 h-10 v140z" fill="#1A1A20"/>
<g stroke="#1A1A20" stroke-width="4"><path d="M480 130 l40 -20 v140 l-40 0z" fill="#26262E" opacity=".9"/><path d="M720 130 l-40 -20 v140 l40 0z" fill="#26262E" opacity=".9"/></g>
<path d="M480 150 h40 M480 190 h40 M680 150 h40 M680 190 h40" stroke="#5A5A68" stroke-width="3"/></g>
<path d="M560 250 q-60 60 -200 170 h480 q-140 -110 -200 -170z" fill="url(#{p}path)"/>
<path d="M600 250 v170" stroke="#C8B890" stroke-width="2" opacity=".2"/>
{bushes}{blooms}{fireflies}
{lantern(350, 290, 1.0)}{lantern(850, 290, 1.0)}{lantern(470, 262, .7)}{lantern(730, 262, .7)}
<path d="M0 370 H1200 V420 H0z" fill="#04060E" opacity=".55"/>
'''
    return _wrap("36-4", body, defs)


_BUILDERS = {
    "12-1": _b12_1, "12-2": _b12_2, "12-3": _b12_3, "12-4": _b12_4,
    "18-1": _b18_1, "18-2": _b18_2, "18-3": _b18_3, "18-4": _b18_4,
    "36-1": _b36_1, "36-2": _b36_2, "36-3": _b36_3, "36-4": _b36_4,
}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {k: _clean(f()) for k, f in _BUILDERS.items()}


def banner(key):
    """Return the complete inline <svg> for unit key, e.g. "36-2"."""
    return BANNERS[key]


if __name__ == "__main__":
    for k in BANNERS:
        print(k, len(BANNERS[k].encode("utf-8")), "bytes")
