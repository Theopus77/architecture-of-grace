"""Unit banners for the Mathematics K-12 course, units 15-27 (grades 6-12).

Thirteen drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_mth_b import BANNERS, CREDITS, banner
    banner(19)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"mb{n}-" so all 27 course banners can sit on one contents page.  No text,
no images, no filters, no external references.  Gradients, paths and
patterns only.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm (ground, road, water, desk
fronts) and the action sits in the upper 55%.  Where the geometry itself
is the scenery (grids, arcs, tilings, curves) it is drawn as a real place
or object, never as a labelled diagram.
"""

import math

W, H = 1200, 420

CREDITS = {
    15: "Drawn scene: a hillside bike path at dawn, a straight road climbing to a flat stretch with a rider, evenly spaced fence posts, and a staircase cut up a bluff in the mist",
    16: "Drawn scene: the Giza pyramids at sunset with a knotted rope staked in the sand as a three-four-five triangle and a surveyor standing at one corner",
    17: "Drawn scene: a classroom at evening with a dot plot growing on the whiteboard, a jar of coins, two dice and a spinner on the teacher's desk, dusk in the window",
    18: "Drawn scene: a rainy night city street with a taxi and its glowing meter, a bus shelter, neon signs, and light trails crossing on the wet road",
    19: "Drawn scene: a basketball court at dusk, a ball arcing toward the hoop along a faint dotted path, bleachers, a scoreboard and the wood floor",
    20: "Drawn scene: a steel truss bridge of repeating triangles over a green river at evening, with a compass and straightedge on a drafting table in the foreground",
    21: "Drawn scene: a flagpole on a school lawn casting a long late-afternoon shadow toward a small mirror on the grass, a manhole cover in the road, a Ferris wheel far off",
    22: "Drawn scene: a baseball diamond under stadium lights at night with a scoreboard and a scatter of fans in the stands that drifts upward like a trend",
    23: "Drawn scene: a workbench with a cardboard sheet cut at the corners beside the open box folded from it, and rolling hills in the window drawn as one smooth curve",
    24: "Drawn scene: a seismograph drum tracing a waveform on a desk by a window on Chicago's lakefront at sunrise, the lake rolling in a long wave",
    25: "Drawn scene: a nautilus shell cut open on a teal desk beside coin stacks that double in height, under a framed aerial print of a stadium with spiraling rows",
    26: "Drawn scene: a polling place at dusk with a line of people waiting at a lit door, a bell-curve-shaped hill behind, a clipboard and a ballot box on the table",
    27: "Drawn scene: a Main Street intersection at evening with a traffic light, a columned bank, a car at the curb, and a bar-chart poster in a shop window",
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


def _lcg(seed):
    x = seed
    while True:
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        yield x


def _stars(seed, n, ymax, color="#fff", op=".8", xmin=0, xmax=W):
    g, out = _lcg(seed), []
    for _ in range(n):
        px = xmin + next(g) % (xmax - xmin)
        py = next(g) % ymax
        r = 0.5 + (next(g) % 10) / 10
        out.append(f'<circle cx="{px}" cy="{py}" r="{r:.1f}"/>')
    return f'<g fill="{color}" opacity="{op}">{"".join(out)}</g>'


def _wrap(n, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[n]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


def _person(x, y, h=26, w=8):
    """Small standing silhouette, feet at (x, y)."""
    r = w * 0.42
    return (f'<path d="M{x-w/2:.0f} {y} v-{h*0.62:.0f} q0 -5 {w/2:.0f} -6 q{w/2:.0f} 1 {w/2:.0f} 6 v{h*0.62:.0f}z"/>'
            f'<circle cx="{x:.0f}" cy="{y-h*0.62-r-2:.0f}" r="{r:.1f}"/>')


# ───────────────────────── 15  Functions: a bike path at dawn ─────────────────────────
def _b15():
    p = "mb15-"
    defs = (
        _lin(p+"sky", [(0, "#4E6484", None), (.3, "#8AA0AC", None), (.55, "#D2D2BC", None), (.75, "#F0D8A0", None), (1, "#F8E8C0", None)])
        + _rad(p+"sun", [(0, "#FFF4D0", 1), (.25, "#FFE0A0", .7), (1, "#FFE0A0", 0)])
        + _lin(p+"far", [(0, "#A8B8A8", None), (1, "#8CA48E", None)])
        + _lin(p+"bluff", [(0, "#7A9A78", None), (1, "#4E6E52", None)])
        + _lin(p+"mid", [(0, "#78966A", None), (1, "#3E5C42", None)])
        + _lin(p+"road", [(0, "#F2E2B0", None), (1, "#CDB482", None)])
        + _lin(p+"fg", [(0, "#2C4230", None), (.5, "#1A2C20", None), (1, "#0E1A14", None)])
        + _lin(p+"mist", [(0, "#F4F0E4", 0), (.5, "#F4F0E4", .55), (1, "#F4F0E4", 0)])
    )
    # the climb: a straight line from (0, 310) to (520, 212); fence posts at even x steps
    posts = "".join(f'<path d="M{x} {310 - (x/520)*98:.0f} v-14"/>' for x in range(40, 521, 60))
    posts += "".join(f'<path d="M{x} 212 v-14"/>' for x in range(580, 781, 60))
    # the staircase cut into the bluff: even risers, even treads
    steps = "M820 262 " + " ".join(f'H{860 + i*40} V{240 - i*22}' for i in range(5)) + " H1200 V262z"
    treads = "".join(f'<path d="M{860 + i*40} {240 - i*22} h40"/>' for i in range(5))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="880" cy="170" r="170" fill="url(#{p}sun)"/><circle cx="880" cy="170" r="24" fill="#FFF6DC"/>
<g fill="#8AA0AC" opacity=".45"><ellipse cx="260" cy="70" rx="200" ry="7"/><ellipse cx="760" cy="44" rx="160" ry="6"/></g>
<path d="M0 206 Q150 176 300 194 T600 184 T900 200 T1200 182 V270 H0z" fill="url(#{p}far)"/>
<path d="M0 226 Q200 216 400 226 T800 218 T1200 226 V262 H0z" fill="#B8C4B0" opacity=".6"/>
<path d="{steps}" fill="url(#{p}bluff)"/>
<g stroke="#DCE6C8" stroke-width="2" opacity=".7">{treads}</g>
<g fill="#3E5C42"><path d="M1090 152 q-6 -22 0 -40 q6 18 0 40z M1130 150 q-8 -26 0 -46 q8 20 0 46z M1170 152 q-5 -18 0 -32 q5 14 0 32z M1050 154 q-4 -14 0 -24 q4 10 0 24z"/></g>
<path d="M0 302 Q200 286 420 262 T820 246 Q1000 244 1200 262 V340 H0z" fill="url(#{p}mid)"/>
<path d="M0 326 L520 224 L850 222 V218 L520 218 L0 316z" fill="#2C4230" opacity=".25"/>
<path d="M0 320 L520 218 L850 216 V204 L520 204 L0 300z" fill="url(#{p}road)"/>
<path d="M0 310 L520 211 H850" stroke="#FFF8E0" stroke-width="1" stroke-dasharray="10 12" fill="none" opacity=".6"/>
<g stroke="#2C4230" stroke-width="2.5" stroke-linecap="round">{posts}</g>
<path d="M40 296 L520 198 H790" stroke="#2C4230" stroke-width="1.2" fill="none" opacity=".55"/>
<g transform="translate(660 210)"><g fill="none" stroke="#1C2A20" stroke-width="2.6"><circle cx="-15" cy="-9" r="9"/><circle cx="15" cy="-9" r="9"/><path d="M-15 -9 L-3 -26 L11 -26 L15 -9 M-3 -26 L5 -9 M-3 -26 L-6 -31 L-10 -31 M11 -26 L10 -32"/></g><path d="M-1 -25 q-2 -14 8 -22 q8 -4 12 3 l-2 10 l-8 -2 l-2 12z" fill="#1C2A20"/><path d="M14 -34 l-6 7 M-1 -25 l4 6 l-4 8" stroke="#1C2A20" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="19" cy="-47" r="4.5" fill="#1C2A20"/></g>
<g fill="#1C2A20">{_person(984, 176, 20, 6)}{_person(1004, 176, 16, 5)}</g>
<rect x="0" y="180" width="1200" height="110" fill="url(#{p}mist)"/>
<path d="M0 334 Q300 320 600 330 T1200 322 V420 H0z" fill="url(#{p}fg)"/>
<g fill="none" stroke="#3E5C42" stroke-width="1.8" stroke-linecap="round" opacity=".8"><path d="M60 334 q6 -14 4 -26 M120 330 q8 -12 6 -24 M700 332 q6 -14 2 -26 M1060 326 q8 -12 4 -24 M1100 328 q6 -10 3 -20"/></g>
<g fill="#1A2C20"><path d="M30 336 q-10 -28 0 -50 q10 22 0 50z M60 338 q-7 -20 0 -36 q7 16 0 36z M1160 330 q-9 -26 0 -46 q9 20 0 46z"/></g>
'''
    return _wrap(15, body, defs)


# ───────────────────────── 16  Geometry: Giza and a rope triangle ─────────────────────────
def _b16():
    p = "mb16-"
    defs = (
        _lin(p+"sky", [(0, "#36224E", None), (.35, "#7A3A68", None), (.62, "#C85A7A", None), (.82, "#EA8A58", None), (1, "#F4B876", None)])
        + _rad(p+"sun", [(0, "#FFE8B0", 1), (.3, "#FFB870", .65), (1, "#FFB870", 0)])
        + _lin(p+"lit", [(0, "#E8A468", None), (1, "#C07848", None)])
        + _lin(p+"shade", [(0, "#6A3654", None), (1, "#4A2844", None)])
        + _lin(p+"sand", [(0, "#DCA868", None), (.5, "#C48A54", None), (1, "#9A6640", None)])
        + _lin(p+"fg", [(0, "#6E4634", None), (.4, "#3E2822", None), (1, "#1E1416", None)])
        + _lin(p+"haze", [(0, "#F4B876", .6), (1, "#F4B876", 0)])
    )
    # 3-4-5 rope: right angle at A, 4 units along the sand, 3 units away (foreshortened)
    A, B, C = (360, 288), (600, 288), (436, 228)
    knots = []
    for i in range(5):
        knots.append((A[0] + (B[0]-A[0]) * i / 4, A[1]))
    for i in range(1, 3):
        knots.append((A[0] + (C[0]-A[0]) * i / 3, A[1] + (C[1]-A[1]) * i / 3))
    for i in range(0, 5):
        t = i / 5
        knots.append((C[0] + (B[0]-C[0]) * t, C[1] + (B[1]-C[1]) * t))
    kn = "".join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="3"/>' for x, y in knots)
    def stake(x, y):
        return f'<path d="M{x} {y+2} v-22 M{x-5} {y-18} h10"/>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="760" cy="214" r="150" fill="url(#{p}sun)"/><circle cx="760" cy="214" r="34" fill="#FFE0A0"/>
<g fill="#7A3A68" opacity=".5"><ellipse cx="220" cy="60" rx="180" ry="6"/><ellipse cx="1000" cy="90" rx="200" ry="7"/><ellipse cx="560" cy="130" rx="120" ry="4"/></g>
<path d="M980 244 L1060 200 L1160 244z" fill="#B0687A"/>
<path d="M700 250 L930 104 L1170 250z" fill="url(#{p}shade)"/><path d="M930 104 L1170 250 H1000z" fill="url(#{p}lit)" opacity=".85"/>
<path d="M0 250 L120 190 L280 250z" fill="url(#{p}shade)"/><path d="M120 190 L280 250 H190z" fill="url(#{p}lit)" opacity=".8"/>
<path d="M180 250 L520 60 L860 250z" fill="url(#{p}shade)"/><path d="M520 60 L860 250 H592z" fill="url(#{p}lit)"/>
<path d="M0 250 H1200 V262 H0z" fill="url(#{p}haze)"/>
<path d="M0 250 H1200 V304 H0z" fill="url(#{p}sand)"/>
<g fill="#E8B878" opacity=".5"><path d="M0 268 Q200 258 420 266 T840 262 T1200 268 V276 Q1000 272 840 274 T420 278 T0 280z"/></g>
<g fill="#4A2844" opacity=".7"><path d="M1040 248 q4 -10 10 -12 q6 0 8 -6 l4 0 l-2 8 q4 2 6 10z"/><path d="M1058 236 l2 -6 l3 6z"/>{_person(1070, 250, 12, 4)}{_person(120, 254, 12, 4)}{_person(134, 254, 10, 3)}</g>
<path d="M0 300 Q300 292 600 300 T1200 296 V420 H0z" fill="url(#{p}fg)"/>
<path d="M{A[0]} {A[1]} L{B[0]} {B[1]} L{C[0]} {C[1]}z" fill="#3E2822" opacity=".35"/>
<path d="M{A[0]} {A[1]} L{B[0]} {B[1]} L{C[0]} {C[1]}z" fill="none" stroke="#F2E0B8" stroke-width="2.2" stroke-linejoin="round"/>
<g fill="#FFF2D0">{kn}</g>
<g stroke="#1E1416" stroke-width="3" stroke-linecap="round" fill="none">{stake(*A)}{stake(*B)}{stake(*C)}</g>
<g fill="#1E1416">{_person(646, 300, 44, 12)}<path d="M652 262 l14 -6 l14 40" stroke="#1E1416" stroke-width="3.5" stroke-linecap="round" fill="none"/><path d="M676 246 v54" stroke="#1E1416" stroke-width="2.5"/><path d="M670 246 h12 l-6 -8z"/></g>
<g fill="#E8B878" opacity=".25"><ellipse cx="480" cy="330" rx="220" ry="7"/><ellipse cx="900" cy="350" rx="160" ry="5"/></g>
'''
    return _wrap(16, body, defs)


# ───────────────────────── 17  Statistics: classroom at evening ─────────────────────────
def _b17():
    p = "mb17-"
    defs = (
        _lin(p+"wall", [(0, "#1C2846", None), (1, "#2A3A5E", None)])
        + _lin(p+"win", [(0, "#2C3A70", None), (.5, "#7A5A80", None), (1, "#F0A060", None)])
        + _lin(p+"board", [(0, "#FBFBF7", None), (1, "#E8E8E2", None)])
        + _lin(p+"desk", [(0, "#8A6A48", None), (.12, "#5A4430", None), (1, "#2A1E16", None)])
        + _lin(p+"floor", [(0, "#1A2238", None), (1, "#0C1020", None)])
        + _lin(p+"jar", [(0, "#DCEAF4", .5), (.5, "#B0CCE0", .3), (1, "#7A9AB4", .45)])
        + _lin(p+"coin", [(0, "#F0D080", None), (1, "#B08A38", None)])
        + _rad(p+"lamp", [(0, "#FFF4D8", .55), (.5, "#FFF4D8", .12), (1, "#FFF4D8", 0)])
    )
    counts = [1, 2, 2, 4, 6, 8, 9, 7, 5, 3, 2, 1, 1]
    dots, red = [], []
    for i, c in enumerate(counts):
        x = 200 + i * 36
        for k in range(c):
            y = 214 - k * 13
            (red if (i == 6 and k == 8) or (i == 3 and k == 3) else dots).append(f'<circle cx="{x}" cy="{y}" r="5.2"/>')
    ticks = "".join(f'<path d="M{200 + i*36} 222 v6"/>' for i in range(13))
    coins = "".join(f'<ellipse cx="{240 + (k%3)*2 - 2}" cy="{278 - k*5}" rx="15" ry="4.5"/>' for k in range(8))
    def die(x, y, s, pips):
        pp = "".join(f'<circle cx="{x + a*s}" cy="{y + b*s}" r="{s*0.09:.1f}"/>' for a, b in pips)
        return (f'<path d="M{x-s/2} {y-s/2} h{s} v{s} h-{s}z" fill="#F6F6F2"/><path d="M{x+s/2} {y-s/2} l{s*0.28:.0f} -{s*0.22:.0f} v{s} l-{s*0.28:.0f} {s*0.22:.0f}z" fill="#D8D8D2"/>'
                f'<path d="M{x-s/2} {y-s/2} l{s*0.28:.0f} -{s*0.22:.0f} h{s} l-{s*0.28:.0f} {s*0.22:.0f}z" fill="#ECECE6"/><g fill="#C82828">{pp}</g>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g fill="#F6EED8" opacity=".9"><rect x="300" y="14" width="150" height="8" rx="2"/><rect x="760" y="14" width="150" height="8" rx="2"/></g>
<ellipse cx="375" cy="30" rx="170" ry="60" fill="url(#{p}lamp)"/><ellipse cx="835" cy="30" rx="170" ry="60" fill="url(#{p}lamp)"/>
<rect x="900" y="48" width="240" height="176" fill="url(#{p}win)"/>
<g fill="#1A2242"><path d="M900 200 q30 -30 60 -10 q30 -24 60 -6 q20 -20 50 -8 q30 -14 70 0 V224 H900z"/><rect x="1016" y="150" width="8" height="74"/></g>
<g fill="#F6EED8" opacity=".6"><circle cx="1090" cy="110" r="10"/></g>
<g stroke="#0E1424" stroke-width="5" fill="none"><rect x="900" y="48" width="240" height="176"/><path d="M1020 48 V224 M900 136 H1140"/></g>
<rect x="128" y="46" width="600" height="196" rx="3" fill="url(#{p}board)"/>
<rect x="128" y="242" width="600" height="8" fill="#B8B8B0"/><rect x="128" y="46" width="600" height="196" rx="3" fill="none" stroke="#9AA0A8" stroke-width="3"/>
<path d="M176 222 H660" stroke="#2A3A6C" stroke-width="2"/><g stroke="#2A3A6C" stroke-width="1.6">{ticks}</g>
<g fill="#2A3A6C">{"".join(dots)}</g><g fill="#C82828">{"".join(red)}</g>
<g><rect x="300" y="238" width="36" height="6" rx="2" fill="#C82828"/><rect x="346" y="238" width="36" height="6" rx="2" fill="#2A3A6C"/></g>
<circle cx="820" cy="90" r="24" fill="#F6F6F2" stroke="#2A3A5E" stroke-width="3"/><path d="M820 90 v-15 M820 90 l10 6" stroke="#1C2846" stroke-width="2.5" stroke-linecap="round"/>
<g fill="#111828" opacity=".9"><rect x="40" y="226" width="90" height="10" rx="2"/><rect x="50" y="236" width="6" height="30"/><rect x="114" y="236" width="6" height="30"/><rect x="1050" y="228" width="90" height="10" rx="2"/><rect x="1060" y="238" width="6" height="28"/><rect x="1124" y="238" width="6" height="28"/></g>
<path d="M0 266 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M60 250 H1140 L1120 300 H80z" fill="url(#{p}desk)"/>
<path d="M80 300 H1120 V420 H80z" fill="#241A14"/><path d="M80 300 H1120 V306 H80z" fill="#3E2E22"/>
<g fill="url(#{p}coin)" stroke="#7A5A20" stroke-width=".8">{coins}</g>
<path d="M216 284 V226 q0 -6 6 -6 h36 q6 0 6 6 V284z" fill="url(#{p}jar)" stroke="#DCEAF4" stroke-width="1.5"/><rect x="214" y="212" width="52" height="9" rx="2" fill="#B0CCE0" opacity=".75"/>
{die(420, 270, 24, [(0,0)])}{die(476, 262, 22, [(-.2,-.2),(.2,.2),(-.2,.2),(.2,-.2)])}
<g transform="translate(640 262)"><circle r="30" fill="#F6F6F2"/><path d="M0 0 L0 -30 A30 30 0 0 1 30 0z" fill="#C82828"/><path d="M0 0 L0 30 A30 30 0 0 1 -30 0z" fill="#2A3A6C"/><path d="M0 0 L-30 0 A30 30 0 0 1 0 -30z" fill="#C82828" opacity=".55"/><circle r="30" fill="none" stroke="#2A3A5E" stroke-width="2"/><path d="M-14 12 L20 -16 l-8 -1 l10 -7 l-2 12 l-4 -6z" fill="#111828"/><circle r="3" fill="#111828"/></g>
<g fill="#F6EED8" opacity=".9"><rect x="880" y="236" width="120" height="14" rx="2"/><rect x="890" y="228" width="100" height="8" rx="2" opacity=".7"/></g>
<g fill="#C82828"><rect x="1040" y="240" width="60" height="10" rx="2"/></g>
<g stroke="#0C1020" stroke-width="1.2" opacity=".5"><path d="M0 330 H80 M1120 330 H1200 M0 380 H80 M1120 380 H1200"/></g>
'''
    return _wrap(17, body, defs)


# ───────────────────────── 18  Algebra I: a night street, a taxi, crossing light trails ─────────────────────────
def _b18():
    p = "mb18-"
    defs = (
        _lin(p+"sky", [(0, "#04080F", None), (.6, "#0A1A26", None), (1, "#123040", None)])
        + _lin(p+"bld", [(0, "#16222C", None), (1, "#0C141A", None)])
        + _lin(p+"road", [(0, "#243640", None), (.25, "#141F26", None), (1, "#08100F", None)])
        + _rad(p+"teal", [(0, "#4FE0D8", .8), (.5, "#2CBFB8", .28), (1, "#2CBFB8", 0)])
        + _rad(p+"amber", [(0, "#FFD070", .85), (.5, "#F5A030", .3), (1, "#F5A030", 0)])
        + _lin(p+"rt", [(0, "#4FE0D8", .6), (1, "#4FE0D8", 0)])
        + _lin(p+"ra", [(0, "#F5A030", .6), (1, "#F5A030", 0)])
        + _lin(p+"tr1", [(0, "#4FE0D8", 0), (.4, "#4FE0D8", .8), (.6, "#4FE0D8", .8), (1, "#4FE0D8", 0)], 0, 0, 1, 0)
        + _lin(p+"tr2", [(0, "#FFC060", 0), (.4, "#FFC060", .85), (.6, "#FFC060", .85), (1, "#FFC060", 0)], 0, 0, 1, 0)
        + _lin(p+"cab", [(0, "#FFD24A", None), (1, "#D8A020", None)])
        + f'<pattern id="{p}win" width="24" height="26" patternUnits="userSpaceOnUse"><rect x="5" y="6" width="8" height="11" fill="#E8D8A0" opacity=".45"/></pattern>'
        + f'<pattern id="{p}win2" width="30" height="24" patternUnits="userSpaceOnUse"><rect x="4" y="4" width="7" height="10" fill="#9AE8E0" opacity=".3"/><rect x="20" y="12" width="5" height="8" fill="#E8D8A0" opacity=".3"/></pattern>'
    )
    rain = "".join(f'<path d="M{x} {y} l-4 16"/>' for x in range(14, 1200, 72) for y in (20, 110, 200))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#0E1820"><rect x="340" y="40" width="110" height="200"/><rect x="820" y="60" width="130" height="190"/><rect x="470" y="90" width="60" height="160"/></g>
<g fill="url(#{p}bld)"><rect x="0" y="30" width="300" height="270"/><rect x="560" y="120" width="260" height="180"/><rect x="900" y="20" width="300" height="280"/><rect x="440" y="150" width="140" height="150"/></g>
<rect x="10" y="40" width="280" height="150" fill="url(#{p}win)"/><rect x="910" y="30" width="280" height="170" fill="url(#{p}win2)"/><rect x="570" y="130" width="240" height="60" fill="url(#{p}win)"/><rect x="450" y="160" width="120" height="50" fill="url(#{p}win2)"/>
<g fill="#08100F"><rect x="0" y="196" width="300" height="6"/><rect x="900" y="204" width="300" height="6"/></g>
<circle cx="150" cy="222" r="120" fill="url(#{p}teal)"/><circle cx="1050" cy="236" r="110" fill="url(#{p}amber)"/>
<g fill="none" stroke="#4FE0D8" stroke-width="3.5" stroke-linecap="round"><rect x="90" y="206" width="120" height="30" rx="15"/><path d="M110 221 h18 M140 221 h10 M160 221 h30"/></g>
<g fill="none" stroke="#FFC060" stroke-width="3.5" stroke-linecap="round"><rect x="1000" y="222" width="100" height="28" rx="6"/><path d="M1016 236 l10 -8 l10 8 l10 -8 l10 8 M1064 230 v12"/></g>
<rect x="640" y="210" width="12" height="90" fill="#0C141A"/><rect x="630" y="206" width="32" height="10" rx="2" fill="#0C141A"/>
<g><rect x="200" y="200" width="150" height="8" fill="#22303A"/><rect x="206" y="208" width="6" height="92" fill="#22303A"/><rect x="338" y="208" width="6" height="92" fill="#22303A"/><rect x="216" y="214" width="60" height="70" fill="#F5A030" opacity=".28"/><rect x="216" y="214" width="60" height="70" fill="none" stroke="#3A4C56" stroke-width="2"/></g>
<g fill="#0A1218">{_person(300, 300, 44, 12)}<path d="M292 258 q6 -14 16 0" fill="#0A1218"/><path d="M286 268 l-10 26" stroke="#0A1218" stroke-width="4" stroke-linecap="round"/></g>
<g fill="#4FE0D8" opacity=".9"><circle cx="646" cy="200" r="5"/></g><circle cx="646" cy="200" r="16" fill="url(#{p}teal)"/>
<circle cx="742" cy="222" r="60" fill="url(#{p}amber)" opacity=".9"/>
<g transform="translate(560 300)">
<path d="M0 0 v-30 q0 -8 8 -8 h30 l22 -26 h90 l40 26 h22 q10 0 10 10 V0z" fill="url(#{p}cab)"/>
<path d="M44 -38 l18 -22 h84 l34 22z" fill="#1A2A34"/><path d="M62 -58 h30 v20 h-46z M100 -58 h30 l30 20 h-60z" fill="#7ACAD8" opacity=".55"/>
<rect x="96" y="-70" width="40" height="12" rx="3" fill="#FFF0B0"/><ellipse cx="116" cy="-64" rx="50" ry="22" fill="url(#{p}amber)" opacity=".8"/>
<rect x="150" y="-46" width="14" height="9" rx="1" fill="#7CFF9A"/><ellipse cx="157" cy="-42" rx="20" ry="10" fill="#7CFF9A" opacity=".3"/>
<rect x="6" y="-24" width="60" height="8" fill="#0C141A" opacity=".5"/><rect x="6" y="-14" width="60" height="6" fill="#F6F6F2" opacity=".4"/>
<circle cx="46" cy="0" r="12" fill="#0A1218"/><circle cx="46" cy="0" r="5" fill="#3A4C56"/><circle cx="184" cy="0" r="12" fill="#0A1218"/><circle cx="184" cy="0" r="5" fill="#3A4C56"/>
<rect x="212" y="-22" width="10" height="8" rx="2" fill="#FFF6D0"/><rect x="-2" y="-22" width="8" height="8" rx="2" fill="#FF4040"/>
</g>
<path d="M782 282 L1200 240 V320 L782 290z" fill="#FFF6D0" opacity=".08"/>
<g stroke="#8AB8C4" stroke-width="1.2" opacity=".35" fill="none">{rain}</g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}road)"/>
<path d="M0 300 H1200 V304 H0z" fill="#3A4C56"/>
<path d="M120 304 h180 V420 H100z" fill="url(#{p}rt)" opacity=".7"/><path d="M1010 304 h110 V420 H990z" fill="url(#{p}ra)" opacity=".8"/><path d="M640 304 h130 V420 H620z" fill="url(#{p}ra)" opacity=".5"/>
<path d="M240 306 h4 V420 h-8z" fill="#F5A030" opacity=".35"/>
<path d="M60 416 L1140 310" stroke="url(#{p}tr1)" stroke-width="4" stroke-linecap="round"/>
<path d="M1140 416 L60 310" stroke="url(#{p}tr2)" stroke-width="4" stroke-linecap="round"/>
<circle cx="600" cy="363" r="5" fill="#FFFFFF" opacity=".85"/><circle cx="600" cy="363" r="14" fill="#FFFFFF" opacity=".15"/>
<g fill="#F6F6F2" opacity=".35"><rect x="380" y="352" width="60" height="5"/><rect x="520" y="352" width="60" height="5"/><rect x="660" y="352" width="60" height="5"/><rect x="800" y="352" width="60" height="5"/></g>
'''
    return _wrap(18, body, defs)


# ───────────────────────── 19  Algebra I: a basketball arc at dusk ─────────────────────────
def _b19():
    p = "mb19-"
    defs = (
        _lin(p+"sky", [(0, "#141E4A", None), (.4, "#4A2E62", None), (.7, "#C05A48", None), (.88, "#F09040", None), (1, "#FAC470", None)])
        + _lin(p+"wood", [(0, "#D8A060", None), (.3, "#B8803E", None), (1, "#5C3C20", None)])
        + _lin(p+"bl", [(0, "#2A2E48", None), (1, "#141830", None)])
        + _lin(p+"board", [(0, "#F4F4F0", .8), (1, "#D8DCE4", .55)])
        + _rad(p+"lamp", [(0, "#FFE8B0", .6), (.5, "#FFE8B0", .12), (1, "#FFE8B0", 0)])
        + _rad(p+"ball", [(0, "#FFB060", None), (1, "#D85A18", None)], .4, .35, .7)
        + f'<pattern id="{p}led" width="9" height="9" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="5" height="5" fill="#FFB030" opacity=".85"/></pattern>'
    )
    bleach = "M0 116 " + " ".join(f'H{40 + i*44} V{116 + (i+1)*20}' for i in range(6)) + " V240 H0z"
    seats = "".join(f'<path d="M{40 + i*44} {116 + (i+1)*20} h44" />' for i in range(6))
    fans = "".join(_person(x, y, 18, 6) for x, y in ((60, 138), (110, 156), (150, 176), (200, 178), (250, 198), (290, 218), (330, 238), (90, 138)))
    net = "".join(f'<path d="M{996 + i*6} 134 L{1000 + i*4} 164"/>' for i in range(6))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#4A2E62" opacity=".45"><ellipse cx="640" cy="52" rx="220" ry="7"/><ellipse cx="1020" cy="96" rx="140" ry="5"/></g>
<circle cx="860" cy="0" r="120" fill="url(#{p}lamp)"/>
<g fill="#2A2438"><path d="M420 214 q10 -30 40 -34 q20 -30 60 -20 q30 -20 60 0 q40 -10 60 24 q30 -6 44 30 H420z"/><path d="M780 214 q10 -26 40 -30 q20 -24 50 -14 q30 -16 60 6 q40 -6 70 38 H780z"/><path d="M1080 214 q14 -34 60 -28 q30 -10 60 20 V214z"/></g>
<rect x="440" y="192" width="760" height="4" fill="#3A3448"/>
<rect x="510" y="118" width="200" height="66" rx="4" fill="#0E1024"/><rect x="510" y="118" width="200" height="66" rx="4" fill="none" stroke="#3A3448" stroke-width="3"/>
<rect x="526" y="132" width="54" height="24" fill="url(#{p}led)"/><rect x="640" y="132" width="54" height="24" fill="url(#{p}led)"/><rect x="592" y="162" width="36" height="14" fill="url(#{p}led)"/>
<circle cx="610" cy="142" r="4" fill="#FF3A3A"/><rect x="560" y="184" width="6" height="30" fill="#3A3448"/><rect x="654" y="184" width="6" height="30" fill="#3A3448"/>
<path d="{bleach}" fill="url(#{p}bl)"/>
<g stroke="#4A4E68" stroke-width="2">{seats}</g>
<g fill="#0E1024">{fans}</g>
<rect x="1040" y="100" width="8" height="140" fill="#2A2438"/><path d="M1044 100 h-40 v14 h40z" fill="#2A2438"/>
<rect x="960" y="70" width="8" height="70" rx="2" fill="#F4F4F0" opacity=".9"/><rect x="968" y="70" width="34" height="70" fill="url(#{p}board)"/><path d="M1002 70 l4 6 v70 l-4 -6z" fill="#B8BCC8"/>
<path d="M968 114 h30" stroke="#E8442A" stroke-width="2"/>
<rect x="996" y="126" width="10" height="4" fill="#E8442A"/><ellipse cx="1012" cy="128" rx="16" ry="5" fill="none" stroke="#E8442A" stroke-width="3"/>
<g stroke="#F4F4F0" stroke-width="1.2" fill="none" opacity=".8">{net}<path d="M1000 148 h24 M1002 158 h20"/></g>
<path d="M290 190 Q650 -76 1000 122" fill="none" stroke="#FFF4D8" stroke-width="2.4" stroke-dasharray="1 13" stroke-linecap="round" opacity=".75"/>
<g transform="translate(718 38)"><circle r="15" fill="url(#{p}ball)"/><path d="M-15 0 h30 M0 -15 v30 M-11 -10 q11 10 22 0 M-11 10 q11 -10 22 0" stroke="#7A3010" stroke-width="1.4" fill="none"/></g>
<g fill="#0E1024"><path d="M258 240 l4 -44 l-8 -2 l4 -30 q2 -12 12 -12 h6 q10 0 12 12 l4 30 l-8 2 l4 44 h-10 l-6 -34 l-6 34z"/><circle cx="269" cy="140" r="8"/><path d="M262 156 l-16 -34 l8 -4 M276 156 l14 -36 l8 6" stroke="#0E1024" stroke-width="4.5" stroke-linecap="round" fill="none"/></g>
<path d="M0 240 H1200 V420 H0z" fill="url(#{p}wood)"/>
<g fill="none" stroke="#F8F0E0" stroke-width="2.5" opacity=".55"><path d="M0 250 H1200"/><path d="M1200 250 v0 M900 250 v100 h300" /><path d="M1200 250 Q880 300 1200 380" opacity=".8"/><path d="M0 250 v120 h180 v-120" /><path d="M0 250 Q300 300 0 380"/></g>
<g fill="#E8442A" opacity=".3"><path d="M900 250 h300 v100 h-300z"/></g>
<g fill="none" stroke="#F8F0E0" stroke-width="1.4" opacity=".4"><ellipse cx="600" cy="320" rx="70" ry="24"/><path d="M600 250 V420"/></g>
<g stroke="#7A5030" stroke-width="1" opacity=".5"><path d="M0 268 H1200 M0 292 H1200 M0 322 H1200 M0 356 H1200 M0 396 H1200"/></g>
'''
    return _wrap(19, body, defs)


# ───────────────────────── 20  Geometry: a truss bridge, compass and straightedge ─────────────────────────
def _b20():
    p = "mb20-"
    defs = (
        _lin(p+"sky", [(0, "#22304A", None), (.45, "#5A5A78", None), (.75, "#B08A80", None), (1, "#E8B888", None)])
        + _lin(p+"hill", [(0, "#3E4C58", None), (1, "#2A3640", None)])
        + _lin(p+"river", [(0, "#4E8A78", None), (.3, "#2E6656", None), (1, "#183C34", None)])
        + _lin(p+"steel", [(0, "#8A96A2", None), (1, "#4A545E", None)])
        + _lin(p+"table", [(0, "#4C4234", None), (.15, "#2E2820", None), (1, "#141210", None)])
        + _lin(p+"paper", [(0, "#F2EEE2", None), (1, "#D8D2C2", None)])
        + _rad(p+"lamp", [(0, "#FFE6B8", .5), (.6, "#FFE6B8", .08), (1, "#FFE6B8", 0)])
    )
    # Warren truss with verticals: panels every 56 px between x=96 and x=1104
    top, bot, x0, n, w = 108, 168, 96, 18, 56
    chords = f'<path d="M{x0} {top} H{x0 + n*w} M{x0} {bot} H{x0 + n*w}"/>'
    web = []
    for i in range(n + 1):
        x = x0 + i * w
        web.append(f'M{x} {top} V{bot}')
        if i < n:
            web.append(f'M{x} {bot} L{x + w} {top}' if i % 2 == 0 else f'M{x} {top} L{x + w} {bot}')
    web = f'<path d="{" ".join(web)}"/>'
    refl = "".join(f'<path d="M{x0 + i*w*2} 252 v34" opacity=".35"/>' for i in range(10))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#5A5A78" opacity=".5"><ellipse cx="300" cy="50" rx="200" ry="7"/><ellipse cx="900" cy="80" rx="160" ry="6"/></g>
<circle cx="1000" cy="230" r="120" fill="url(#{p}lamp)"/>
<path d="M0 200 Q150 160 300 186 T600 176 T900 190 T1200 170 V252 H0z" fill="url(#{p}hill)"/>
<path d="M0 226 Q200 208 400 224 T800 214 T1200 226 V252 H0z" fill="#33414C"/>
<g fill="#22303A"><path d="M30 224 q-8 -22 0 -40 q8 18 0 40z M60 226 q-6 -18 0 -32 q6 14 0 32z M1150 222 q-9 -24 0 -42 q9 18 0 42z M1180 226 q-6 -16 0 -30 q6 12 0 30z"/></g>
<path d="M0 252 H1200 V330 H0z" fill="url(#{p}river)"/>
<g fill="#E8B888" opacity=".2"><ellipse cx="600" cy="262" rx="560" ry="4"/><ellipse cx="400" cy="290" rx="200" ry="3"/><ellipse cx="900" cy="300" rx="180" ry="3"/></g>
<g fill="#22303A"><path d="M60 178 h40 V252 h-40z M340 178 h40 V252 h-40z M620 178 h40 V252 h-40z M900 178 h40 V252 h-40z M1140 178 h40 V252 h-40z"/></g>
<g stroke="#2E6656" stroke-width="8">{refl}</g>
<g fill="none" stroke="#4E8A78" stroke-width="1.5" opacity=".5"><path d="M96 262 H1104 M96 274 H1104"/></g>
<rect x="60" y="168" width="1120" height="12" fill="url(#{p}steel)"/><rect x="60" y="164" width="1120" height="4" fill="#A8B4BE"/>
<g fill="none" stroke="url(#{p}steel)" stroke-width="5" stroke-linejoin="round">{chords}</g>
<g fill="none" stroke="#98A4AE" stroke-width="3" stroke-linejoin="round">{web}</g>
<g fill="none" stroke="#4A545E" stroke-width="1.5" opacity=".7">{chords}</g>
<g fill="#FFE6B8" opacity=".9"><circle cx="300" cy="160" r="2"/><circle cx="700" cy="160" r="2"/><circle cx="1100" cy="160" r="2"/></g>
<g fill="#0E1418"><path d="M760 164 v-22 h20 v-6 h14 v6 h20 v22z"/><circle cx="772" cy="164" r="4"/><circle cx="800" cy="164" r="4"/></g>
<path d="M0 300 Q300 290 600 300 T1200 296 V420 H0z" fill="url(#{p}table)"/>
<path d="M300 306 L860 302 L900 360 L260 366z" fill="url(#{p}paper)"/>
<g fill="none" stroke="#6A7A8A" stroke-width="1.2" opacity=".8"><path d="M420 350 L560 318 L700 350z"/><path d="M420 350 A80 40 0 0 1 512 318" stroke-dasharray="4 4"/><path d="M700 350 A80 40 0 0 0 608 318" stroke-dasharray="4 4"/><path d="M340 336 h420" stroke-dasharray="3 5"/><circle cx="560" cy="342" r="2"/></g>
<g stroke="#B8C0C8" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M640 268 L590 344 M640 268 L700 344"/></g><circle cx="640" cy="266" r="6" fill="#C8D0D8"/><rect x="636" y="252" width="8" height="14" rx="3" fill="#8A96A2"/><circle cx="700" cy="344" r="2.5" fill="#3A3A3A"/>
<path d="M300 356 L840 322 L842 332 L302 366z" fill="#D8C8A0"/><path d="M300 356 L840 322 L841 326 L301 360z" fill="#F0E4C0"/>
<g stroke="#8A7A50" stroke-width="1" opacity=".8">{"".join(f'<path d="M{x} {356 - (x-300)*34/540:.1f} v{4 if (x-300)%40 else 8}"/>' for x in range(320, 840, 20))}</g>
<g fill="#0E1418" opacity=".5"><ellipse cx="640" cy="360" rx="80" ry="4"/></g>
'''
    return _wrap(20, body, defs)


# ───────────────────────── 21  Geometry: a flagpole's shadow ─────────────────────────
def _b21():
    p = "mb21-"
    defs = (
        _lin(p+"sky", [(0, "#6A8EC0", None), (.4, "#B8C8D8", None), (.7, "#F0DCA0", None), (1, "#F8C878", None)])
        + _rad(p+"sun", [(0, "#FFFAE0", 1), (.2, "#FFE6A0", .7), (1, "#FFE6A0", 0)])
        + _lin(p+"lawn", [(0, "#8AB458", None), (.5, "#5E9040", None), (1, "#3E6A30", None)])
        + _lin(p+"road", [(0, "#4A4A48", None), (.2, "#2E2E2C", None), (1, "#161614", None)])
        + _lin(p+"school", [(0, "#C8A878", None), (1, "#9A7E58", None)])
        + _lin(p+"mirror", [(0, "#F8F8FF", None), (1, "#9AB8D8", None)])
        + f'<pattern id="{p}win" width="34" height="30" patternUnits="userSpaceOnUse"><rect x="6" y="6" width="18" height="18" fill="#5A6E88" opacity=".85"/><rect x="8" y="8" width="7" height="7" fill="#FFF0C0" opacity=".5"/></pattern>'
        + f'<pattern id="{p}holes" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.6" fill="#1A1A18"/></pattern>'
    )
    cx, cy, r = 1060, 150, 62
    spokes = " ".join(f'M{cx} {cy} L{cx + math.cos(k*math.pi/6)*r:.0f} {cy + math.sin(k*math.pi/6)*r:.0f}' for k in range(12))
    cabins = "".join(f'<rect x="{cx + math.cos(k*math.pi/6)*r - 4:.0f}" y="{cy + math.sin(k*math.pi/6)*r - 2:.0f}" width="8" height="7" rx="1"/>' for k in range(12))
    trees = "".join(f'<path d="M{x} 232 q-{s} -{s*2.6:.0f} 0 -{s*3.4:.0f} q{s} {s*0.8:.0f} 0 {s*3.4:.0f}z"/>' for x, s in ((600, 10), (640, 13), (700, 9), (860, 12), (900, 9), (960, 11)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="110" cy="128" r="170" fill="url(#{p}sun)"/><circle cx="110" cy="128" r="30" fill="#FFFAE0"/>
<g fill="#B8C8D8" opacity=".55"><ellipse cx="520" cy="60" rx="180" ry="8"/><ellipse cx="900" cy="40" rx="140" ry="6"/></g>
<path d="M560 226 Q800 204 1200 214 V234 H560z" fill="#8AA070" opacity=".8"/>
<g fill="none" stroke="#3A3A48" stroke-width="2.5"><circle cx="{cx}" cy="{cy}" r="{r}"/><path d="{spokes}"/><path d="M{cx} {cy} L{cx-40} 232 M{cx} {cy} L{cx+40} 232"/></g>
<g fill="#3A3A48">{cabins}<circle cx="{cx}" cy="{cy}" r="5"/></g>
<g fill="#3E5A3A">{trees}</g>
<path d="M120 232 V160 H520 V232z" fill="url(#{p}school)"/><path d="M110 160 H530 L520 150 H120z" fill="#7A6040"/>
<rect x="132" y="168" width="376" height="30" fill="url(#{p}win)"/><rect x="132" y="200" width="376" height="30" fill="url(#{p}win)" opacity=".8"/>
<rect x="300" y="196" width="40" height="36" fill="#4A3A28"/><rect x="306" y="200" width="28" height="26" fill="#FFF0C0" opacity=".5"/><path d="M280 194 h80 v-6 h-80z" fill="#3E5A3A"/>
<path d="M0 232 H1200 V308 H0z" fill="url(#{p}lawn)"/>
<path d="M616 306 L1150 262 L1164 270 L628 310z" fill="#2A4A28" opacity=".7"/><path d="M1150 262 l14 -10 l20 6 l-20 12z" fill="#2A4A28" opacity=".7"/>
<g fill="#2A4A28" opacity=".55"><path d="M120 232 H520 L560 250 H160z"/></g>
<rect x="618" y="30" width="5" height="276" fill="#C8CCD0"/><rect x="617" y="30" width="2" height="276" fill="#F4F4F4"/><circle cx="620" cy="28" r="5" fill="#E8C060"/>
<g><rect x="624" y="40" width="72" height="42" fill="#F4F4F0"/><g fill="#C83030"><rect x="624" y="40" width="72" height="6"/><rect x="624" y="52" width="72" height="6"/><rect x="624" y="64" width="72" height="6"/><rect x="624" y="76" width="72" height="6"/></g><rect x="624" y="40" width="30" height="24" fill="#2A3A78"/></g>
<ellipse cx="820" cy="292" rx="24" ry="7" fill="url(#{p}mirror)" stroke="#8A8A80" stroke-width="1.5"/><ellipse cx="816" cy="290" rx="10" ry="3" fill="#FFFFFF" opacity=".8"/>
<g fill="#1A2418">{_person(940, 306, 46, 13)}<path d="M934 262 l-14 18" stroke="#1A2418" stroke-width="4" stroke-linecap="round"/></g>
<path d="M0 308 H1200 V420 H0z" fill="url(#{p}road)"/><path d="M0 308 H1200 V314 H0z" fill="#8A8A80"/>
<g fill="#F4F4F0" opacity=".5"><rect x="0" y="360" width="70" height="5"/><rect x="140" y="360" width="70" height="5"/><rect x="1000" y="360" width="70" height="5"/><rect x="1140" y="360" width="60" height="5"/></g>
<ellipse cx="380" cy="332" rx="62" ry="15" fill="#1E1E1C"/><ellipse cx="380" cy="330" rx="58" ry="13" fill="#7A7A70"/><ellipse cx="380" cy="330" rx="48" ry="10.5" fill="#5A5A52" stroke="#8A8A80" stroke-width="1.5"/><ellipse cx="380" cy="330" rx="42" ry="9" fill="url(#{p}holes)"/><ellipse cx="380" cy="330" rx="20" ry="4.5" fill="#5A5A52"/>
<g fill="#6A6A62" opacity=".4"><ellipse cx="700" cy="340" rx="200" ry="3"/></g>
'''
    return _wrap(21, body, defs)


# ───────────────────────── 22  Statistics: a ballpark under lights ─────────────────────────
def _b22():
    p = "mb22-"
    defs = (
        _lin(p+"sky", [(0, "#050C24", None), (.6, "#0E1E48", None), (1, "#1E3A6A", None)])
        + _rad(p+"lamp", [(0, "#FFFFFF", .95), (.2, "#DCEAFF", .35), (.6, "#DCEAFF", .06), (1, "#DCEAFF", 0)])
        + _lin(p+"stand", [(0, "#2A3454", None), (1, "#161C34", None)])
        + _lin(p+"grass", [(0, "#4E9A48", None), (.4, "#2E6E34", None), (1, "#163A22", None)])
        + _lin(p+"dirt", [(0, "#B08858", None), (1, "#7A5A38", None)])
        + f'<pattern id="{p}led" width="8" height="8" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="4" height="4" fill="#FFB030" opacity=".85"/></pattern>'
        + f'<pattern id="{p}lt" width="10" height="9" patternUnits="userSpaceOnUse"><rect x="1" y="1" width="8" height="7" fill="#FFFFFF" opacity=".9"/></pattern>'
    )
    # fans in the stands: a scatter with a loose upward trend, left to right
    g = _lcg(22)
    fans = []
    for _ in range(64):
        x = 80 + next(g) % 1040
        base = 214 - (x - 80) * 0.045
        y = base - 4 + (next(g) % 30) - 15
        y = max(150, min(224, y))
        fans.append(f'<circle cx="{x}" cy="{y:.0f}" r="{2.2 + (next(g) % 3) * .4:.1f}"/>')
    rows = "".join(f'<path d="M40 {y} Q600 {y-18} 1160 {y}"/>' for y in range(156, 236, 14))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(22, 40, 130, "#FFFFFF", ".6")}
<circle cx="190" cy="40" r="150" fill="url(#{p}lamp)"/><circle cx="1010" cy="40" r="150" fill="url(#{p}lamp)"/>
<rect x="150" y="18" width="80" height="44" fill="url(#{p}lt)"/><rect x="970" y="18" width="80" height="44" fill="url(#{p}lt)"/>
<g fill="#0A0E1E"><rect x="186" y="62" width="8" height="84"/><rect x="1006" y="62" width="8" height="84"/><rect x="146" y="14" width="88" height="4"/><rect x="966" y="14" width="88" height="4"/></g>
<path d="M40 146 Q600 118 1160 146 V236 H40z" fill="url(#{p}stand)"/>
<g fill="none" stroke="#3A4468" stroke-width="1.5">{rows}</g>
<g fill="#E8ECF4" opacity=".85">{"".join(fans)}</g>
<rect x="510" y="52" width="180" height="64" rx="3" fill="#0A0E1E"/><rect x="510" y="52" width="180" height="64" rx="3" fill="none" stroke="#3A4468" stroke-width="3"/>
<rect x="526" y="66" width="52" height="24" fill="url(#{p}led)"/><rect x="622" y="66" width="52" height="24" fill="url(#{p}led)"/><rect x="580" y="96" width="40" height="12" fill="url(#{p}led)"/><circle cx="600" cy="74" r="4" fill="#FF3A3A"/>
<rect x="540" y="116" width="6" height="30" fill="#0A0E1E"/><rect x="654" y="116" width="6" height="30" fill="#0A0E1E"/>
<path d="M40 236 H1160 V246 H40z" fill="#1E4A2A"/><path d="M40 234 H1160 V237 H40z" fill="#F0E060" opacity=".8"/>
<path d="M0 246 H1200 V420 H0z" fill="url(#{p}grass)"/>
<g fill="#2E6E34" opacity=".7"><path d="M0 260 H1200 V274 H0z M0 288 H1200 V302 H0z M0 316 H1200 V330 H0z M0 344 H1200 V358 H0z M0 372 H1200 V386 H0z"/></g>
<path d="M600 248 Q1000 250 1040 330 Q600 390 160 330 Q200 250 600 248z" fill="url(#{p}dirt)"/>
<path d="M600 262 L940 330 L600 380 L260 330z" fill="url(#{p}grass)"/>
<path d="M600 262 L940 330 L600 380 L260 330z" fill="none" stroke="#B08858" stroke-width="14" stroke-linejoin="round"/>
<ellipse cx="600" cy="322" rx="26" ry="9" fill="#B08858"/><ellipse cx="600" cy="381" rx="30" ry="9" fill="#B08858"/>
<g fill="#F8F8F4"><rect x="594" y="258" width="12" height="8"/><rect x="930" y="326" width="12" height="8"/><rect x="258" y="326" width="12" height="8"/><path d="M594 378 h12 v5 l-6 4 l-6 -4z"/></g>
<path d="M600 380 L160 330 M600 380 L1040 330" stroke="#F8F8F4" stroke-width="2" opacity=".7"/>
<g fill="#0A0E1E">{_person(600, 318, 22, 7)}{_person(700, 300, 22, 7)}{_person(760, 344, 20, 7)}{_person(400, 296, 22, 7)}{_person(470, 262, 18, 6)}{_person(880, 270, 18, 6)}</g>
'''
    return _wrap(22, body, defs)


# ───────────────────────── 23  Algebra II: a box on the workbench, hills in the window ─────────────────────────
def _b23():
    p = "mb23-"
    defs = (
        _lin(p+"wall", [(0, "#2A4C6E", None), (1, "#1C3650", None)])
        + _lin(p+"sky", [(0, "#78B4DC", None), (1, "#E0ECF0", None)])
        + _lin(p+"hill", [(0, "#8AB868", None), (1, "#4E8048", None)])
        + _lin(p+"bench", [(0, "#A07A48", None), (.12, "#6E5030", None), (1, "#2A1E12", None)])
        + _lin(p+"card", [(0, "#D8B478", None), (1, "#B8925A", None)])
        + _lin(p+"card2", [(0, "#C4A068", None), (1, "#8E6E42", None)])
        + f'<pattern id="{p}peg" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.6" fill="#0E1E30" opacity=".8"/></pattern>'
    )
    # rolling hills as one smooth curve through the window
    def poly(x):
        t = (x - 700) / 380 * 2 - 1
        return 150 - 34 * (t**3 - 0.9 * t) - 10 * t
    hill = "M700 236 " + " ".join(f'L{x} {poly(x):.0f}' for x in range(700, 1081, 12)) + " L1080 236z"
    hill2 = "M700 236 " + " ".join(f'L{x} {poly(x) + 42 - 16*math.sin((x-700)/120):.0f}' for x in range(700, 1081, 12)) + " L1080 236z"
    # net: a rectangle with the corners cut out (perspective parallelogram), fold lines dashed
    P = lambda s_, t_: f"{560 + s_ + 1.52*t_:.0f} {292 - t_:.0f}"
    corners = [(24, 0), (156, 0), (156, 10), (180, 10), (180, 36), (156, 36), (156, 46), (24, 46), (24, 36), (0, 36), (0, 10), (24, 10)]
    net_d = "M" + " L".join(P(*c) for c in corners) + "z"
    folds = f"M{P(24,10)} L{P(24,36)} M{P(156,10)} L{P(156,36)} M{P(24,10)} L{P(156,10)} M{P(24,36)} L{P(156,36)}"
    net = (f'<path d="{net_d}" fill="url(#{p}card)" stroke="#8E6E42" stroke-width="1.5" stroke-linejoin="round"/>'
           f'<path d="{folds}" stroke="#8E6E42" stroke-width="1.2" stroke-dasharray="6 4" fill="none"/>'
           f'<path d="M{P(0,10)} L{P(24,10)} L{P(24,0)}" fill="none" stroke="#6E5030" stroke-width="2"/>'
           f'<path d="M{P(-30,0)} L{P(-6,0)} L{P(-6,10)} L{P(-30,10)}z M{P(186,0)} L{P(210,0)} L{P(210,10)} L{P(186,10)}z" fill="#C4A068" opacity=".9"/>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="60" y="30" width="560" height="200" fill="url(#{p}peg)"/>
<rect x="60" y="30" width="560" height="200" fill="none" stroke="#173049" stroke-width="4"/>
<g fill="#0E1E30"><path d="M120 60 h8 v90 h-8z M104 56 h40 v14 h-40z"/><path d="M200 56 h10 v100 h-10z M188 150 q17 -6 34 0 v10 h-34z"/><path d="M280 60 l40 -6 v8 l-40 6z M280 60 h6 v70 h-6z"/><rect x="380" y="60" width="180" height="16" rx="2"/><rect x="380" y="90" width="120" height="8" rx="2"/></g>
<g stroke="#5A8AB0" stroke-width="1.2" opacity=".6">{"".join(f'<path d="M{x} 60 v{4 if (x-380)%40 else 8}"/>' for x in range(388, 560, 10))}</g>
<rect x="700" y="36" width="380" height="200" fill="url(#{p}sky)"/>
<g fill="#FFFFFF" opacity=".7"><ellipse cx="800" cy="80" rx="46" ry="12"/><ellipse cx="830" cy="72" rx="30" ry="12"/><ellipse cx="1000" cy="60" rx="36" ry="9"/></g>
<path d="{hill}" fill="#6A9A7C" opacity=".8"/>
<path d="{hill2}" fill="url(#{p}hill)"/>
<g fill="#3A6A3A"><path d="M760 200 q-6 -20 0 -32 q6 12 0 32z M1010 214 q-7 -22 0 -36 q7 14 0 36z M1030 216 q-5 -16 0 -26 q5 10 0 26z"/></g>
<g fill="#F4F0E4" opacity=".9"><rect x="1040" y="176" width="12" height="16"/><path d="M1036 176 h20 l-10 -8z"/></g>
<g stroke="#101E2C" stroke-width="8" fill="none"><rect x="700" y="36" width="380" height="200"/><path d="M890 36 V236 M700 136 H1080"/></g>
<rect x="690" y="236" width="400" height="8" fill="#17304A"/>
<path d="M0 250 H1200 V420 H0z" fill="url(#{p}bench)"/>
<path d="M0 250 H1200 V256 H0z" fill="#C09258"/>
{net}
<g transform="translate(220 296)">
<path d="M70 -108 L220 -108 L220 -164 L70 -164z" fill="#D0AC70"/>
<path d="M0 -70 L70 -108 L220 -108 L150 -70z" fill="#3E2C14"/><path d="M0 -70 L70 -108 L150 -108 L80 -70z" fill="#5A4022"/>
<path d="M0 -70 L70 -108 L70 -158 L0 -120z" fill="#E4C48A"/>
<path d="M0 0 V-70 H150 V0z" fill="url(#{p}card)"/><path d="M150 0 V-70 L220 -108 V-38z" fill="url(#{p}card2)"/>
<path d="M150 -70 L220 -108 L220 -160 L150 -122z" fill="#B48E52"/>
<path d="M0 -70 H150 V-30 H0z" fill="#E8CC96"/><path d="M0 -34 H150 V-28 H0z" fill="#7A5A30" opacity=".45"/>
<path d="M0 0 V-70 L70 -108 H220 V-38 L150 0z" fill="none" stroke="#7A5A30" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M150 -70 V0 M70 -108 V-158 M150 -122 L220 -160 M150 -70 V-122 M0 -70 H150" fill="none" stroke="#7A5A30" stroke-width="1.2" opacity=".7"/>
</g>
<g><rect x="960" y="266" width="200" height="12" fill="#E8E0C0" transform="rotate(-8 960 266)"/><g stroke="#4A4A3A" stroke-width="1">{"".join(f'<path d="M{x} {266 - (x-960)*0.14:.0f} v{4 if (x-960)%40 else 7}"/>' for x in range(970, 1160, 10))}</g></g>
<g><rect x="860" y="278" width="80" height="14" rx="3" fill="#E8B020" transform="rotate(12 860 278)"/><path d="M938 292 l34 6 l-4 8 l-32 -4z" fill="#C8CCD0" transform="rotate(12 860 278)"/></g>
<g fill="#0E1E30" opacity=".35"><ellipse cx="300" cy="300" rx="120" ry="6"/><ellipse cx="660" cy="296" rx="100" ry="4"/></g>
<g stroke="#2A1E12" stroke-width="1.2" opacity=".5"><path d="M0 330 H1200 M0 380 H1200"/></g>
'''
    return _wrap(23, body, defs)


# ───────────────────────── 24  Algebra II: a seismograph by a lakefront window ─────────────────────────
def _b24():
    p = "mb24-"
    defs = (
        _lin(p+"wall", [(0, "#3A4652", None), (1, "#2A3440", None)])
        + _lin(p+"sky", [(0, "#4A5A88", None), (.5, "#D89060", None), (.8, "#F8C860", None), (1, "#FCE0A0", None)])
        + _rad(p+"sun", [(0, "#FFF8E0", 1), (.25, "#FFD070", .7), (1, "#FFD070", 0)])
        + _lin(p+"lake", [(0, "#4ED0E0", None), (.5, "#1E8AA8", None), (1, "#124860", None)])
        + _lin(p+"drum", [(0, "#F4EEDC", None), (.25, "#FFFDF4", None), (.7, "#D8D0B8", None), (1, "#8E866E", None)])
        + _lin(p+"desk", [(0, "#5A5A62", None), (.12, "#34343C", None), (1, "#141418", None)])
        + _lin(p+"steel", [(0, "#B8C0C8", None), (1, "#5A626A", None)])
        + _lin(p+"shine", [(0, "#FFF6C0", .6), (1, "#FFF6C0", 0)])
    )
    # the earthquake trace: quiet, then a burst that decays, wrapped on the drum
    pts = []
    for i in range(0, 261, 3):
        x = 180 + i
        t = i / 260
        env = 0 if t < .28 else 34 * math.exp(-(t - .28) * 4.2) * min(1, (t - .28) * 30)
        y = 196 + env * math.sin(i * .55) + 1.5 * math.sin(i * .17)
        pts.append(f'{"M" if i == 0 else "L"}{x} {y:.1f}')
    trace = " ".join(pts)
    trace2 = " ".join(f'{"M" if i == 0 else "L"}{180 + i} {214 + 1.5*math.sin(i*.19):.1f}' for i in range(0, 261, 4))
    # the lake: one long rolling wave
    wave = "M780 180 " + " ".join(f'L{x} {180 + 5*math.sin((x-780)/34) - 4*math.cos((x-780)/90):.1f}' for x in range(784, 1101, 6)) + " L1100 236 H780z"
    wave2 = "M780 206 " + " ".join(f'L{x} {206 + 4*math.sin((x-760)/28):.1f}' for x in range(784, 1101, 6))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="780" y="30" width="320" height="206" fill="url(#{p}sky)"/>
<circle cx="980" cy="164" r="110" fill="url(#{p}sun)"/><circle cx="980" cy="164" r="22" fill="#FFF8E0"/>
<g fill="#D89060" opacity=".5"><ellipse cx="860" cy="70" rx="70" ry="4"/><ellipse cx="1040" cy="96" rx="60" ry="3"/></g>
<g fill="#1E2A44"><path d="M780 182 h30 v-70 h6 v-30 h4 v30 h6 v70 h20 v-44 h14 v44 h16 v-60 h12 v60 h10 v-30 h16 v30 h14 v-20 h18 v20 h24 v-38 h4 v-52 h4 v52 h4 v38 h10 v-16 h12 v16 h50 v-30 h20 v30 h30 v-14 h10 v14 h6 v-56 l10 -8 l10 8 v56 h4 v-70 h2 v-18 h2 v18 h2 v70 h6 v-40 h14 v40 h14 v-16 h6 v16 h20 v-28 h10 v28 h4 v-70 h6 v-16 h3 v16 h6 v70 h10 v24 H780z"/></g>
<path d="{wave}" fill="url(#{p}lake)"/>
<path d="{wave2}" fill="none" stroke="#9AF0F8" stroke-width="1.6" opacity=".7"/>
<path d="M900 236 L1060 176 L1100 176 L1100 236z" fill="url(#{p}shine)" opacity=".7"/>
<g fill="#124860"><path d="M790 230 q60 -8 120 0 q60 -6 120 0 q40 -4 70 0 V236 H790z"/></g>
<g stroke="#1A2028" stroke-width="8" fill="none"><rect x="780" y="30" width="320" height="206"/><path d="M940 30 V236 M780 130 H1100"/></g>
<rect x="770" y="236" width="340" height="8" fill="#22282E"/>
<rect x="60" y="40" width="300" height="120" rx="3" fill="#2A3038"/><rect x="60" y="40" width="300" height="120" rx="3" fill="none" stroke="#4A525A" stroke-width="2"/>
<path d="M76 100 h268" stroke="#4A525A" stroke-width="1"/><path d="M76 100 {" ".join(f'L{x} {100 + 18*math.sin((x-76)/16)*math.exp(-abs(x-210)/70):.1f}' for x in range(80, 345, 6))}" stroke="#6ADCE0" stroke-width="1.6" fill="none"/>
<path d="M0 270 H1200 V420 H0z" fill="url(#{p}desk)"/>
<path d="M0 270 H1200 V275 H0z" fill="#6E6E78"/>
<rect x="150" y="248" width="400" height="22" rx="3" fill="#2A2E36"/><rect x="150" y="248" width="400" height="4" fill="#4A525A"/>
<rect x="160" y="146" width="320" height="102" fill="url(#{p}drum)"/><ellipse cx="480" cy="197" rx="20" ry="51" fill="#B8B09A"/><ellipse cx="480" cy="197" rx="14" ry="44" fill="#8E866E"/>
<ellipse cx="160" cy="197" rx="20" ry="51" fill="url(#{p}drum)"/><ellipse cx="160" cy="197" rx="20" ry="51" fill="none" stroke="#8E866E" stroke-width="1"/>
<g stroke="#C8C0A8" stroke-width=".8" opacity=".7">{"".join(f'<path d="M{x} 148 V246"/>' for x in range(200, 480, 40))}</g>
<path d="{trace2}" fill="none" stroke="#4A4A50" stroke-width="1" opacity=".55"/>
<path d="{trace}" fill="none" stroke="#1A1A22" stroke-width="1.7" stroke-linejoin="round"/>
<rect x="510" y="120" width="14" height="128" fill="url(#{p}steel)"/><rect x="500" y="112" width="34" height="12" rx="2" fill="#8A929A"/>
<path d="M516 140 L440 186 L436 190" stroke="#8A929A" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M440 186 l-4 8" stroke="#E04040" stroke-width="3" stroke-linecap="round"/>
<circle cx="516" cy="140" r="6" fill="#C8D0D8"/><rect x="470" y="164" width="22" height="16" rx="3" fill="#5A626A"/>
<circle cx="100" cy="242" r="10" fill="#4A525A"/><circle cx="100" cy="242" r="4" fill="#6ADCE0"/>
<g fill="#F8C860" opacity=".12"><rect x="780" y="276" width="320" height="140"/></g>
<g stroke="#141418" stroke-width="1.2" opacity=".5"><path d="M0 330 H1200 M0 380 H1200"/></g>
'''
    return _wrap(24, body, defs)


# ───────────────────────── 25  Sequences: a nautilus, coin stacks, a stadium print ─────────────────────────
def _b25():
    p = "mb25-"
    defs = (
        _lin(p+"wall", [(0, "#F4EAD4", None), (1, "#E6D8BC", None)])
        + _lin(p+"desk", [(0, "#3E8A88", None), (.14, "#2A6664", None), (1, "#11302E", None)])
        + _lin(p+"shell", [(0, "#FFF8EA", None), (1, "#E2C9A0", None)])
        + _lin(p+"coin", [(0, "#F4D882", None), (1, "#B08A38", None)])
        + _lin(p+"brass", [(0, "#D8B860", None), (1, "#8E6E28", None)])
        + _lin(p+"pitch", [(0, "#4E9A58", None), (1, "#2E6E3A", None)])
        + _rad(p+"lamp", [(0, "#FFF2C0", .75), (.5, "#FFF2C0", .18), (1, "#FFF2C0", 0)])
    )
    # nautilus: a logarithmic spiral, chambers as septa between consecutive whorls
    cx, cy, a, b = 330, 184, 12, 0.17
    def sp(th):
        r = a * math.exp(b * th)
        return cx + r * math.cos(th), cy - r * math.sin(th)
    N = 4 * math.pi
    outer = [sp(N - i * 0.22) for i in range(int(N / 0.22) + 1)]
    outline = "M%.1f %.1f " % outer[0] + " ".join(f'L{x:.1f} {y:.1f}' for x, y in outer[1:])
    septa = []
    th = N - 0.25
    while th > 2 * math.pi + 0.3:
        x1, y1 = sp(th); x2, y2 = sp(th - 2 * math.pi)
        mx, my = (x1 + x2) / 2 + (y2 - y1) * .18, (y1 + y2) / 2 + (x1 - x2) * .18
        septa.append(f'M{x1:.1f} {y1:.1f} Q{mx:.1f} {my:.1f} {x2:.1f} {y2:.1f}')
        th -= 0.45
    septa = " ".join(septa)
    innersp = " ".join(f'{"M" if i == 0 else "L"}{x:.1f} {y:.1f}' for i, (x, y) in enumerate(sp(N - 2*math.pi - i*0.15) for i in range(int((N - 2*math.pi) / 0.35) + 1)))
    lipx, lipy = sp(N)
    coins = []
    for k, n in enumerate((1, 2, 4, 8)):
        x = 590 + k * 56
        for j in range(n):
            coins.append(f'<ellipse cx="{x}" cy="{288 - j*6:.1f}" rx="21" ry="6.5"/>')
    # stadium from above: an oval bowl whose seating rows spiral outward
    sx, sy = 860, 132
    rows = []
    for i in range(3 * 24 + 1):
        t = i / 24
        th = t * 2 * math.pi
        rx, ry = 62 + 11 * t, 30 + 7 * t
        rows.append(f'{"M" if i == 0 else "L"}{sx + rx*math.cos(th):.1f} {sy + ry*math.sin(th):.1f}')
    rows = " ".join(rows)
    aisles = " ".join(f'M{sx + 64*math.cos(k*math.pi/8):.0f} {sy + 32*math.sin(k*math.pi/8):.0f} L{sx + 96*math.cos(k*math.pi/8):.0f} {sy + 52*math.sin(k*math.pi/8):.0f}' for k in range(16))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g fill="#E0D0B0" opacity=".6"><rect x="0" y="0" width="1200" height="14"/><rect x="0" y="236" width="1200" height="6"/></g>
<g fill="url(#{p}brass)"><rect x="40" y="96" width="220" height="7"/><rect x="40" y="170" width="220" height="7"/></g><g fill="#2A6664"><rect x="50" y="56" width="14" height="40"/><rect x="66" y="50" width="12" height="46"/><rect x="80" y="60" width="16" height="36"/><rect x="120" y="52" width="12" height="44"/><rect x="134" y="58" width="14" height="38"/><rect x="180" y="54" width="12" height="42"/><rect x="60" y="128" width="14" height="42"/><rect x="76" y="134" width="12" height="36"/><rect x="150" y="126" width="12" height="44"/><rect x="164" y="132" width="16" height="38"/><rect x="200" y="130" width="12" height="40"/></g><g fill="#B89848"><rect x="98" y="66" width="18" height="30"/><rect x="150" y="62" width="14" height="34"/><rect x="220" y="140" width="24" height="30"/><rect x="90" y="140" width="14" height="30"/></g>
<rect x="640" y="36" width="440" height="192" rx="2" fill="url(#{p}brass)"/><rect x="648" y="44" width="424" height="176" fill="#1C3A3E"/>
<rect x="648" y="44" width="424" height="176" fill="#245058" opacity=".5"/>
<ellipse cx="{sx}" cy="{sy}" rx="98" ry="54" fill="#3A5A5A"/><ellipse cx="{sx}" cy="{sy}" rx="94" ry="50" fill="#5A7A72"/>
<path d="{rows}" fill="none" stroke="#C8B890" stroke-width="1.3" opacity=".9"/>
<path d="{aisles}" stroke="#1C3A3E" stroke-width="2" fill="none" opacity=".8"/>
<ellipse cx="{sx}" cy="{sy}" rx="60" ry="28" fill="url(#{p}pitch)"/><rect x="{sx-34}" y="{sy-16}" width="68" height="32" fill="none" stroke="#DCE8D0" stroke-width="1" opacity=".8"/><circle cx="{sx}" cy="{sy}" r="7" fill="none" stroke="#DCE8D0" stroke-width="1" opacity=".8"/>
<g fill="#2E4448" opacity=".7"><rect x="660" y="180" width="60" height="30"/><rect x="990" y="60" width="70" height="40"/><path d="M660 60 h50 v8 h-50z M660 76 h30 v8 h-30z"/></g>
<g fill="#8FB0AC" opacity=".5"><rect x="990" y="170" width="70" height="36"/></g>
<rect x="640" y="36" width="440" height="192" rx="2" fill="none" stroke="#B89848" stroke-width="2"/>
<circle cx="1120" cy="180" r="110" fill="url(#{p}lamp)"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}desk)"/>
<path d="M0 262 H1200 V267 H0z" fill="#5AA8A4"/>
<g><path d="{outline} L{cx:.1f} {cy:.1f}z" fill="url(#{p}shell)" stroke="#B48E5A" stroke-width="1.6" stroke-linejoin="round"/><path d="{innersp}" fill="none" stroke="#B48E5A" stroke-width="1.6"/><path d="{septa}" fill="none" stroke="#B48E5A" stroke-width="1.2" opacity=".9"/><path d="{outline}" fill="none" stroke="#7A5A34" stroke-width="2.2"/><ellipse cx="{cx+40:.0f}" cy="{cy-40:.0f}" rx="26" ry="10" transform="rotate(-30 {cx+40:.0f} {cy-40:.0f})" fill="#FFFFFF" opacity=".4"/></g>
<g fill="#11302E" opacity=".35"><ellipse cx="350" cy="266" rx="110" ry="8"/></g>
<g fill="url(#{p}coin)" stroke="#8A6A22" stroke-width=".8">{"".join(coins)}</g>
<g fill="#11302E" opacity=".35"><ellipse cx="670" cy="292" rx="110" ry="6"/></g>
<g><path d="M1010 262 q0 -110 100 -110 q40 0 44 40" stroke="url(#{p}brass)" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="1010" cy="262" rx="30" ry="8" fill="#B89848"/><path d="M1120 200 l60 0 l-14 -40 h-32z" fill="#F4E0A0"/><path d="M1120 200 l60 0 l-14 -40 h-32z" fill="none" stroke="#B89848" stroke-width="2"/></g>
<g stroke="#11302E" stroke-width="1.2" opacity=".5"><path d="M0 330 H1200 M0 380 H1200"/></g>
'''
    return _wrap(25, body, defs)


# ───────────────────────── 26  Statistics: a polling place at dusk ─────────────────────────
def _b26():
    p = "mb26-"
    defs = (
        _lin(p+"sky", [(0, "#22306E", None), (.4, "#6A4A80", None), (.7, "#D07A60", None), (.9, "#F4B070", None), (1, "#FAD8A0", None)])
        + _lin(p+"hill", [(0, "#5A5A90", None), (1, "#3A3A68", None)])
        + _lin(p+"hill2", [(0, "#2E3A60", None), (1, "#1E2848", None)])
        + _lin(p+"bld", [(0, "#4A6A98", None), (1, "#2E4A78", None)])
        + _lin(p+"walk", [(0, "#3A3A48", None), (.4, "#22222E", None), (1, "#0E0E16", None)])
        + _lin(p+"plaza", [(0, "#8A8AA4", None), (1, "#4E4E68", None)])
        + _rad(p+"door", [(0, "#FFE8A0", .9), (.5, "#FFC060", .3), (1, "#FFC060", 0)])
        + _lin(p+"box", [(0, "#3A6AB0", None), (1, "#1E3C70", None)])
        + f'<pattern id="{p}win" width="40" height="30" patternUnits="userSpaceOnUse"><rect x="6" y="6" width="26" height="18" fill="#FFE0A0" opacity=".55"/></pattern>'
    )
    bell = "M0 262 " + " ".join(f'L{x} {262 - 132*math.exp(-((x-560)/170)**2):.0f}' for x in range(0, 1201, 16)) + " L1200 262z"
    bell2 = "M0 262 " + " ".join(f'L{x} {262 - 60*math.exp(-((x-260)/240)**2) - 40*math.exp(-((x-1000)/200)**2):.0f}' for x in range(0, 1201, 20)) + " L1200 262z"
    g = _lcg(26)
    line = []
    xs = [724, 690, 664, 620, 596, 548, 522, 500, 452, 418, 380, 356, 306, 270, 238, 190, 160]
    for i, x in enumerate(xs):
        y = 297 + i * 0.3
        h = 54 + next(g) % 22
        w = 12 + next(g) % 5
        line.append(_person(x + next(g) % 6 - 3, y, h, w))
        r = next(g) % 5
        if r == 0:
            line.append(f'<path d="M{x-w//2-2} {y-h*.42:.0f} q-6 -2 -8 -14 M{x+w//2+2} {y-h*.42:.0f} q6 -2 8 -14" stroke="#0E0E16" stroke-width="3.5" stroke-linecap="round" fill="none"/>')
        elif r == 1:
            line.append(f'<rect x="{x+w//2+2}" y="{y-h*.34:.0f}" width="9" height="12" rx="2"/>')
        elif r == 2:
            line.append(_person(x - w - 4, y, int(h*.55), 7))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#6A4A80" opacity=".5"><ellipse cx="200" cy="50" rx="160" ry="6"/><ellipse cx="980" cy="70" rx="200" ry="7"/></g>
<circle cx="820" cy="200" r="120" fill="url(#{p}door)" opacity=".35"/>
<path d="{bell2}" fill="url(#{p}hill2)"/>
<path d="{bell}" fill="url(#{p}hill)"/>
<g fill="#2E2E58"><path d="M420 176 q-8 -26 0 -46 q8 20 0 46z M470 156 q-6 -22 0 -38 q6 16 0 38z M690 170 q-8 -24 0 -44 q8 18 0 44z M120 244 q-6 -18 0 -32 q6 14 0 32z M1100 246 q-8 -22 0 -40 q8 18 0 40z"/></g>
<path d="M700 262 V150 H1120 V262z" fill="url(#{p}bld)"/><path d="M690 150 H1130 V142 H690z" fill="#1E3050"/>
<rect x="716" y="160" width="400" height="30" fill="url(#{p}win)"/>
<rect x="960" y="200" width="140" height="62" fill="url(#{p}win)"/>
<g><rect x="760" y="196" width="60" height="66" fill="#FFE8A0"/><ellipse cx="790" cy="262" rx="90" ry="26" fill="url(#{p}door)"/><path d="M746 196 h88 l-8 -12 h-72z" fill="#1E3050"/><rect x="788" y="196" width="4" height="66" fill="#8A6A30"/></g>
<rect x="860" y="204" width="70" height="46" rx="2" fill="#F4F0E8"/><g fill="#2E4A78" opacity=".8"><rect x="868" y="212" width="54" height="6"/><rect x="868" y="224" width="40" height="6"/><rect x="868" y="236" width="48" height="6"/></g>
<g><rect x="1130" y="120" width="3" height="142" fill="#C8CCD0"/><rect x="1133" y="122" width="36" height="22" fill="#F4F4F0"/><g fill="#C83030"><rect x="1133" y="122" width="36" height="4"/><rect x="1133" y="130" width="36" height="4"/><rect x="1133" y="138" width="36" height="4"/></g><rect x="1133" y="122" width="15" height="12" fill="#2A3A78"/></g>
<rect x="620" y="200" width="4" height="62" fill="#1E3050"/><circle cx="622" cy="196" r="7" fill="#FFE8A0"/><circle cx="622" cy="196" r="30" fill="url(#{p}door)" opacity=".5"/>
<path d="M0 262 H1200 V300 H0z" fill="url(#{p}plaza)"/><path d="M0 262 H1200 V266 H0z" fill="#A0A0B8"/>
<g fill="#1E1E2E" opacity=".5">{"".join(f'<ellipse cx="{x}" cy="298" rx="14" ry="3"/>' for x in xs)}</g>
<g fill="#0E0E16">{"".join(line)}</g>
<path d="M0 300 Q300 296 600 300 T1200 298 V420 H0z" fill="url(#{p}walk)"/>
<path d="M200 312 H1000 L1020 340 H180z" fill="#2E4A78"/><path d="M200 312 H1000 L1020 340 H180z" fill="#3A5A8A" opacity=".5"/>
<g transform="translate(720 314)"><path d="M0 0 L-6 -50 H110 L116 0z" fill="url(#{p}box)"/><path d="M-6 -50 L10 -62 H126 L110 -50z" fill="#4A80C8"/><path d="M110 -50 L126 -62 V-12 L116 0z" fill="#1E3C70"/><rect x="34" y="-59" width="50" height="3" fill="#0E0E16"/><path d="M50 -58 l8 -16 h20 l-8 16z" fill="#F4F0E8"/><circle cx="24" cy="-24" r="10" fill="#F4F0E8" opacity=".5"/></g>
<g transform="translate(150 318) rotate(-4)"><rect x="0" y="-70" width="150" height="70" rx="3" fill="#5A3E24"/><rect x="8" y="-62" width="134" height="60" fill="#F4F0E8"/><rect x="50" y="-78" width="50" height="14" rx="3" fill="#8A8A90"/><g stroke="#2E4A78" stroke-width="1.6" opacity=".8"><path d="M20 -50 h110 M20 -40 h110 M20 -30 h110 M20 -20 h110 M20 -10 h70"/></g><g fill="#C83030"><rect x="20" y="-52" width="6" height="4"/><rect x="20" y="-32" width="6" height="4"/></g></g>
<g fill="#FFE8A0" opacity=".14"><ellipse cx="790" cy="330" rx="140" ry="8"/></g>
'''
    return _wrap(26, body, defs)


# ───────────────────────── 27  Financial Math: a Main Street intersection ─────────────────────────
def _b27():
    p = "mb27-"
    defs = (
        _lin(p+"sky", [(0, "#26305A", None), (.45, "#6A5478", None), (.75, "#C87A68", None), (1, "#F0B078", None)])
        + _lin(p+"bank", [(0, "#F0E4C8", None), (1, "#C8B898", None)])
        + _lin(p+"col", [(0, "#F8F0DC", None), (.6, "#E0D4B8", None), (1, "#A89878", None)], 0, 0, 1, 0)
        + _lin(p+"brick", [(0, "#A04838", None), (1, "#6E3028", None)])
        + _lin(p+"road", [(0, "#3A3A3E", None), (.2, "#262628", None), (1, "#111112", None)])
        + _rad(p+"lamp", [(0, "#FFE8B0", .8), (.5, "#FFE8B0", .16), (1, "#FFE8B0", 0)])
        + _rad(p+"green", [(0, "#7CFF9A", 1), (.4, "#2AC860", .5), (1, "#2AC860", 0)])
        + _lin(p+"car", [(0, "#3A4A70", None), (1, "#1C2640", None)])
        + f'<pattern id="{p}win" width="36" height="40" patternUnits="userSpaceOnUse"><rect x="8" y="6" width="20" height="26" fill="#FFE0A0" opacity=".6"/><rect x="8" y="6" width="20" height="26" fill="none" stroke="#3A2020" stroke-width="2"/></pattern>'
        + f'<pattern id="{p}brk" width="20" height="10" patternUnits="userSpaceOnUse"><path d="M0 5 h20 M10 0 v5 M0 5 v5" stroke="#5A2820" stroke-width=".8" fill="none" opacity=".5"/></pattern>'
    )
    cols = "".join(f'<rect x="{x}" y="150" width="26" height="120" fill="url(#{p}col)"/><rect x="{x-4}" y="146" width="34" height="8" fill="#E0D4B8"/><rect x="{x-3}" y="266" width="32" height="6" fill="#C8B898"/>' for x in (200, 280, 360, 440))
    bars = "".join(f'<rect x="{x}" y="{240 - h}" width="12" height="{h}" fill="#2A5A98"/>' for x, h in ((904, 12), (920, 20), (936, 16), (952, 30), (968, 38)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#6A5478" opacity=".5"><ellipse cx="300" cy="40" rx="200" ry="6"/><ellipse cx="900" cy="30" rx="160" ry="6"/></g>
<g fill="#2C2440" opacity=".7"><rect x="0" y="140" width="130" height="160"/><rect x="40" y="110" width="50" height="40"/><path d="M0 140 h130 l-20 -20 h-90z"/></g>
<rect x="640" y="70" width="560" height="230" fill="url(#{p}brick)"/><rect x="640" y="70" width="560" height="230" fill="url(#{p}brk)"/>
<rect x="650" y="90" width="540" height="90" fill="url(#{p}win)"/>
<rect x="640" y="60" width="560" height="12" fill="#5A2820"/><rect x="660" y="184" width="520" height="8" fill="#5A2820"/>
<g><path d="M650 196 h180 l-10 -16 h-160z" fill="#2E5A48"/><path d="M650 196 h180 v6 h-180z" fill="#1E3A30"/><rect x="664" y="200" width="150" height="70" fill="#3A5A80" opacity=".8"/><rect x="664" y="200" width="150" height="70" fill="#FFE8B0" opacity=".28"/></g>
<g><path d="M860 196 h180 l-10 -16 h-160z" fill="#A83838"/><path d="M860 196 h180 v6 h-180z" fill="#6E2828"/><rect x="874" y="200" width="150" height="70" fill="#FFF0C8" opacity=".35"/><rect x="890" y="206" width="100" height="46" rx="2" fill="#F8F4EC"/><path d="M898 240 h84" stroke="#2A5A98" stroke-width="1.5"/>{bars}</g>
<g><rect x="1070" y="200" width="100" height="70" fill="#3A5A80" opacity=".8"/><rect x="1070" y="200" width="100" height="70" fill="#FFE8B0" opacity=".3"/><rect x="1064" y="196" width="112" height="6" fill="#5A2820"/></g>
<rect x="640" y="270" width="560" height="30" fill="#4A2A28"/>
<path d="M140 150 H540 V276 H140z" fill="url(#{p}bank)"/>
<path d="M124 150 H556 L340 84z" fill="#E8DCC0"/><path d="M124 150 H556 L340 84z" fill="none" stroke="#B8A888" stroke-width="3" stroke-linejoin="round"/><path d="M148 146 H532 L340 96z" fill="#D8CCAC"/>
<rect x="132" y="146" width="416" height="10" fill="#D8CCAC"/><rect x="132" y="138" width="416" height="8" fill="#B8A888"/>
{cols}
<rect x="300" y="196" width="60" height="76" fill="#3A2A20"/><rect x="306" y="202" width="48" height="64" fill="#FFE8B0" opacity=".55"/><path d="M296 196 h68 v-8 h-68z" fill="#B8A888"/>
<g fill="#7A6A50" opacity=".6"><rect x="228" y="200" width="30" height="40"/><rect x="404" y="200" width="30" height="40"/></g>
<path d="M120 300 H560 V276 H120z" fill="#C8B898"/><path d="M110 300 H570 V288 H110z" fill="#B0A080"/>
<rect x="588" y="160" width="7" height="140" fill="#2A2A2E"/><path d="M591 164 h130" stroke="#2A2A2E" stroke-width="7" stroke-linecap="round"/>
<rect x="690" y="160" width="22" height="58" rx="4" fill="#1A1A1E"/><circle cx="701" cy="172" r="6" fill="#5A2020"/><circle cx="701" cy="190" r="6" fill="#5A4820"/><circle cx="701" cy="208" r="6" fill="#7CFF9A"/><circle cx="701" cy="208" r="16" fill="url(#{p}green)" opacity=".7"/>
<circle cx="588" cy="176" r="60" fill="url(#{p}lamp)" opacity=".8"/><path d="M574 176 h28 l-4 -8 h-20z" fill="#FFF0C0"/>
<rect x="1150" y="190" width="5" height="110" fill="#2A2A2E"/><circle cx="1152" cy="186" r="60" fill="url(#{p}lamp)" opacity=".7"/><circle cx="1152" cy="186" r="6" fill="#FFF0C0"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}road)"/>
<path d="M0 300 H1200 V306 H0z" fill="#6A6A6C"/>
<g transform="translate(780 318)"><path d="M0 0 v-22 q0 -6 6 -6 h28 l22 -22 h74 l30 22 h20 q8 0 8 8 V0z" fill="url(#{p}car)"/><path d="M40 -28 l16 -16 h66 l24 16z" fill="#1A2030"/><path d="M60 -44 h30 v14 h-44z M96 -44 h24 l22 14 h-46z" fill="#9AB8D8" opacity=".5"/><circle cx="44" cy="0" r="12" fill="#0E0E12"/><circle cx="44" cy="0" r="5" fill="#4A4A50"/><circle cx="150" cy="0" r="12" fill="#0E0E12"/><circle cx="150" cy="0" r="5" fill="#4A4A50"/><rect x="176" y="-20" width="10" height="8" rx="2" fill="#FFF6D0"/><rect x="0" y="-20" width="8" height="8" rx="2" fill="#FF4040"/><ellipse cx="2" cy="-16" rx="24" ry="10" fill="#FF4040" opacity=".2"/></g>
<g fill="#F4F4F0" opacity=".65"><rect x="500" y="312" width="16" height="50"/><rect x="530" y="312" width="16" height="50"/><rect x="560" y="312" width="16" height="50"/><rect x="590" y="312" width="16" height="50"/><rect x="620" y="312" width="16" height="50"/><rect x="650" y="312" width="16" height="50"/><rect x="680" y="312" width="16" height="50"/></g>
<g fill="#F0D060" opacity=".55"><rect x="20" y="380" width="60" height="5"/><rect x="140" y="380" width="60" height="5"/><rect x="260" y="380" width="60" height="5"/><rect x="380" y="380" width="60" height="5"/><rect x="760" y="380" width="60" height="5"/><rect x="880" y="380" width="60" height="5"/><rect x="1000" y="380" width="60" height="5"/><rect x="1120" y="380" width="60" height="5"/></g>
<g fill="#FFE8B0" opacity=".12"><ellipse cx="588" cy="330" rx="60" ry="8"/><ellipse cx="1152" cy="330" rx="50" ry="7"/></g>
'''
    return _wrap(27, body, defs)


_BUILDERS = {15: _b15, 16: _b16, 17: _b17, 18: _b18, 19: _b19, 20: _b20, 21: _b21,
             22: _b22, 23: _b23, 24: _b24, 25: _b25, 26: _b26, 27: _b27}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (15..27)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    for n in sorted(BANNERS):
        print(n, len(BANNERS[n].encode("utf-8")), "bytes")
