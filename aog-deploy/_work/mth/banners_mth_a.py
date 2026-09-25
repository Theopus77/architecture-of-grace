"""Unit banners for the Mathematics course, units 1-14 (K-2, 3-5, 6-8).

Fourteen drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_mth_a import BANNERS, CREDITS, banner
    banner(7)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"mb{n}-" so all 27 math banners can sit on one contents page.
Gradients, paths and patterns only (one clipPath at most); no text, no
images, no filters, no href.

Page CSS note (same as the Science and U.S. History banners):
    .mth-banner svg { width:100%; height:100%; display:block; }
The page sits the banner over a #0A1E33 band and paints a dark gradient
over the bottom ~45% for the unit title, so the lower part of every scene
is kept calm (table tops, water, ground) and the action sits in the
upper 55%.  Geometry is allowed to be the scenery (grids, tiles, lanes,
number lines) as long as it reads as a place or an object, not a diagram.
"""

import math

W, H = 1200, 420

CREDITS = {
    1: "Drawn scene: a yellow school bus at the curb on a bright morning with a line of children boarding, a hundred-chart poster in one window and ten-frame squares painted on the sidewalk",
    2: "Drawn scene: a pond at golden hour with ducks on the water and three flying off, lily pads joined like a number bond, and reeds at the edges",
    3: "Drawn scene: a lemonade stand at the end of a driveway under a shady tree, with stacks of paper cups in tens and a big glass jar of buttons on the table",
    4: "Drawn scene: a classroom wall with a chalkboard, a big analog clock, a ruler taped up and a rainy window with a rain gauge, and a bake-sale table with a cash box and coins",
    5: "Drawn scene: a block city of cubes, cylinders, cones and a triangle roof built on a striped rug in window light, with a sandwich cut in halves on a plate in front",
    6: "Drawn scene: a farm kitchen table with egg cartons, a muffin tin and cookies cooling in rows, and a window looking out on a field and a barn",
    7: "Drawn scene: a school gym set up for a science fair seen from the bleachers, with rows and columns of tables, a scoreboard panel and ceiling lights",
    8: "Drawn scene: the curved lanes of a running track with a picnic table in front holding a pizza cut in eighths, a wooden ruler and a tape measure",
    9: "Drawn scene: a 100-meter dash finish line at stadium dusk with runners at the tape, a photo-finish timing board and a stopwatch on a bench",
    10: "Drawn scene: a school garden at morning with raised beds, a fence going up, a wheelbarrow, a watering can and a row of bean poles of different heights",
    11: "Drawn scene: a city planner's desk under a lamp with a gridded street map and compass rose, a protractor and a treasure-map scroll marked with an X",
    12: "Drawn scene: a bright grocery aisle with shelves of boxes in two sizes, a hanging price tag, a shopping cart and a starburst sale sign",
    13: "Drawn scene: Chicago's lakefront in deep winter with the skyline, a frozen shore, falling snow and a thermometer post whose red column sits below zero",
    14: "Drawn scene: a brass balance scale on a lab table holding blocks on one pan and a bag on the other, a gridded chalkboard behind and a phone on the table",
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


def _dots(seed, n, ymax, color="#fff", op=".8", xmin=0, xmax=W, ymin=0, rmin=0.6):
    x, out = seed, []
    for _ in range(n):
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        px = xmin + x % (xmax - xmin)
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        py = ymin + x % (ymax - ymin)
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        r = rmin + (x % 10) / 10
        out.append(f'<circle cx="{px}" cy="{py}" r="{r:.1f}"/>')
    return f'<g fill="{color}" opacity="{op}">{"".join(out)}</g>'


def _kid(x, y, h, fill, arm=""):
    """Small child silhouette, feet at (x, y), height h."""
    r = h * 0.14
    return (f'<g fill="{fill}"><circle cx="{x}" cy="{y - h + r:.0f}" r="{r:.1f}"/>'
            f'<path d="M{x - r * 1.1:.0f} {y - h + 2.2 * r:.0f} q{r * 1.1:.0f} -{r * .6:.0f} {r * 2.2:.0f} 0 '
            f'l{r * .5:.0f} {h * .42:.0f} h-{r * .8:.0f} l-{r * .2:.0f} {h * .3:.0f} h-{r * .8:.0f} '
            f'l-{r * .1:.0f} -{h * .28:.0f} l-{r * .3:.0f} {h * .28:.0f} h-{r * .8:.0f} l-{r * .1:.0f} -{h * .3:.0f} h-{r * .8:.0f}z"/>{arm}</g>')


def _wrap(n, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[n]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


# ───────────────────────── 1  Counting and Numbers: school bus at the curb ─────────────────────────
def _b1():
    p = "mb1-"
    defs = (
        _lin(p+"sky", [(0, "#3F86CF", None), (.55, "#9FD0F2", None), (1, "#FFF0B8", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.4, "#FFE28A", .6), (1, "#FFE28A", 0)])
        + _lin(p+"bus", [(0, "#FFD447", None), (.5, "#F9BE2A", None), (1, "#D99312", None)])
        + _lin(p+"win", [(0, "#7FB2E0", None), (1, "#3D6FA6", None)])
        + _lin(p+"road", [(0, "#4A4F5A", None), (1, "#2C3038", None)])
        + _lin(p+"walk", [(0, "#E4DCC8", None), (1, "#B9B09A", None)])
        + f'<pattern id="{p}grid" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="none" stroke="#3D6FA6" stroke-width=".8"/></pattern>'
    )
    wins = "".join(f'<rect x="{x}" y="128" width="64" height="52" rx="4" fill="url(#{p}win)"/>' for x in range(486, 1000, 78))
    frames = "".join(
        f'<g transform="translate({x} 318)"><rect width="110" height="46" fill="none" stroke="#F6EFDD" stroke-width="3"/>'
        f'<path d="M22 0 v46 M44 0 v46 M66 0 v46 M88 0 v46 M0 23 h110" stroke="#F6EFDD" stroke-width="2"/></g>'
        for x in (40, 200, 360, 520, 680, 840, 1000)
    )
    counters = "".join(f'<circle cx="{x}" cy="{y}" r="7" fill="#E1573A"/>' for x, y in ((51, 329), (73, 329), (95, 329), (117, 329), (211, 329), (233, 329), (255, 329), (277, 329), (299, 329), (211, 353)))
    kids = "".join(_kid(x, 312, h, "#2B2540") for x, h in ((96, 64), (138, 72), (184, 60), (232, 68), (280, 62), (330, 70)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="1030" cy="70" r="150" fill="url(#{p}sun)"/><circle cx="1030" cy="70" r="34" fill="#FFF7DA"/>
<g fill="#FFFFFF" opacity=".7"><ellipse cx="220" cy="70" rx="110" ry="14"/><ellipse cx="280" cy="58" rx="50" ry="18"/><ellipse cx="640" cy="52" rx="90" ry="10"/></g>
<g fill="#6E9F6A"><ellipse cx="60" cy="236" rx="90" ry="54"/><ellipse cx="1120" cy="228" rx="120" ry="60"/><ellipse cx="1010" cy="238" rx="60" ry="36"/></g>
<g fill="#C3D0DD"><rect x="120" y="150" width="620" height="90"/><rect x="380" y="118" width="120" height="40"/><rect x="118" y="146" width="624" height="6" fill="#9FB0C2"/></g>
<g fill="#5F7C99">{"".join(f'<rect x="{x}" y="176" width="26" height="30"/>' for x in range(150, 720, 52))}</g>
<rect x="470" y="122" width="6" height="26" fill="#2B2540"/><path d="M476 122 l30 8 l-30 8z" fill="#E1573A"/>
<g fill="#2B2540"><rect x="770" y="140" width="5" height="100"/></g><path d="M775 140 h30 v18 h-30z" fill="#E1573A"/><path d="M775 140 h12 v9 h-12z" fill="#3D6FA6"/>
<path d="M0 240 H1200 V300 H0z" fill="url(#{p}road)"/>
<path d="M0 270 H360 M1020 270 H1200" stroke="#E8E0C4" stroke-width="3" stroke-dasharray="26 22" opacity=".5"/>
<g><path d="M340 96 h660 q40 0 42 40 v104 h-702z" fill="url(#{p}bus)"/><path d="M340 96 h660 q40 0 42 40 h-702z" fill="#FFDE6E" opacity=".5"/></g>
<path d="M370 96 h620 q10 0 12 8 h-644 q4 -8 12 -8z" fill="#3A3A3A" opacity=".55"/>
<rect x="340" y="190" width="702" height="14" fill="#2B2540"/><rect x="340" y="222" width="702" height="6" fill="#2B2540" opacity=".7"/>
{wins}
<rect x="720" y="134" width="40" height="40" fill="#FFFDF4"/><rect x="720" y="134" width="40" height="40" fill="url(#{p}grid)"/><rect x="720" y="134" width="40" height="40" fill="none" stroke="#3D6FA6" stroke-width="1.5"/>
<rect x="1006" y="128" width="30" height="52" rx="4" fill="url(#{p}win)"/>
<path d="M370 128 h84 v112 h-84z" fill="#2B2540"/><path d="M376 132 h34 v104 h-34z M416 132 h32 v104 h-32z" fill="url(#{p}win)"/><path d="M378 134 h30 v52 h-30z M418 134 h28 v52 h-28z" fill="#8CBFE8" opacity=".5"/>
<g fill="#E1573A"><rect x="352" y="104" width="14" height="10" rx="2"/><rect x="1016" y="104" width="14" height="10" rx="2"/></g><g fill="#FFF2A8"><rect x="352" y="118" width="14" height="8" rx="2"/><rect x="1016" y="118" width="14" height="8" rx="2"/></g>
<g fill="#3A3A3A"><rect x="1030" y="196" width="18" height="44" rx="3"/><rect x="1040" y="150" width="22" height="60" rx="4"/></g>
<rect x="1042" y="154" width="16" height="30" rx="2" fill="#F0F0F0"/><rect x="1042" y="188" width="16" height="18" rx="2" fill="#E1573A"/>
<g fill="#1E1E24"><circle cx="440" cy="244" r="30"/><circle cx="940" cy="244" r="30"/></g><g fill="#8A8A90"><circle cx="440" cy="244" r="13"/><circle cx="940" cy="244" r="13"/></g><g fill="#3A3A3A"><circle cx="440" cy="244" r="5"/><circle cx="940" cy="244" r="5"/></g>
<rect x="336" y="228" width="40" height="8" fill="#2B2540"/><rect x="1030" y="238" width="16" height="6" fill="#2B2540"/>
<path d="M0 296 H1200 V310 H0z" fill="#8F877A"/><path d="M0 310 H1200 V420 H0z" fill="url(#{p}walk)"/>
<path d="M0 316 H1200" stroke="#A59C88" stroke-width="2" opacity=".6"/>
{frames}{counters}
{kids}
<g fill="#E1573A"><path d="M132 250 h14 v12 h-14z"/></g><g fill="#3D6FA6"><path d="M226 246 h14 v12 h-14z"/><path d="M324 242 h14 v12 h-14z"/></g>
<path d="M360 312 l6 -34 h18 l-6 34z" fill="#2B2540"/>
'''
    return _wrap(1, body, defs)


# ───────────────────────── 2  Adding and Subtracting: pond at golden hour ─────────────────────────
def _b2():
    p = "mb2-"
    defs = (
        _lin(p+"sky", [(0, "#1F5A68", None), (.4, "#4A8A8C", None), (.75, "#E8A84A", None), (1, "#F7C878", None)])
        + _lin(p+"water", [(0, "#E9B562", None), (.3, "#8C9C6A", None), (.7, "#2E5E5C", None), (1, "#173E42", None)])
        + _rad(p+"sun", [(0, "#FFF4CC", 1), (.3, "#FFD98A", .8), (1, "#FFD98A", 0)])
        + _lin(p+"glint", [(0, "#FFE9A8", .7), (1, "#FFE9A8", 0)])
        + _lin(p+"far", [(0, "#173A42", None), (1, "#0F2A30", None)])
    )
    D = "#1E1A14"
    def duck(x, y, s=1, flip=False):
        t = f"translate({x} {y}) scale({-s if flip else s} {s})"
        return (f'<g transform="{t}" fill="{D}"><path d="M-30 0 q6 -14 30 -14 q10 0 14 -4 q4 -30 22 -30 q10 0 12 8 l10 2 l-10 4 q-4 6 -10 8 q-2 8 4 14 l-4 12 q-30 6 -68 0z"/>'
                f'<path d="M-40 4 q40 6 80 0" stroke="#F3D48C" stroke-width="1.2" fill="none" opacity=".7"/></g>')
    def flyer(x, y, s):
        return (f'<g transform="translate({x} {y}) scale({s})" fill="{D}"><path d="M-14 0 q14 -6 30 0 q10 -2 18 -6 q-12 8 -18 10 q-14 2 -30 -4z"/>'
                f'<path d="M-4 -2 q-10 -16 -24 -26 q14 8 30 22z M6 -2 q6 -20 24 -30 q-12 16 -18 32z"/></g>')
    ripples = "".join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r / 6}" fill="none" stroke="#FFE1A0" stroke-width="1.2" opacity="{o}"/>' for x, y, r, o in ((560, 262, 60, .45), (560, 262, 90, .25), (760, 248, 50, .4), (900, 270, 44, .4), (900, 270, 70, .2)))
    reeds_l = "".join(f'<path d="M{x} 420 q{dx} -100 {dx2} -{h}" stroke="{D}" stroke-width="{w}" fill="none" stroke-linecap="round"/><rect x="{x + dx2 - 4}" y="{420 - h - 34}" width="8" height="38" rx="4" fill="#3A2C1A"/>' for x, dx, dx2, h, w in ((40, 10, 16, 300, 4), (86, -6, -2, 250, 3), (128, 12, 20, 340, 4), (170, -4, 4, 210, 3), (1090, -12, -18, 320, 4), (1136, 8, 10, 260, 3), (1170, -6, -4, 300, 4)))
    grass = "".join(f'<path d="M{x} 420 q{d} -60 {d * 1.5:.0f} -110" stroke="{D}" stroke-width="2" fill="none"/>' for x, d in ((20, 4), (60, -8), (104, 6), (150, -10), (200, 3), (1060, -6), (1112, 8), (1150, -4), (1190, 6)))
    pads = "".join(f'<path d="M{x} {y} m-{r} 0 a{r} {r * .42:.0f} 0 1 0 {2 * r} 0 a{r} {r * .42:.0f} 0 1 0 -{2 * r} 0z" fill="#2F6A3E"/><path d="M{x} {y} l{r * .9:.0f} -{r * .3:.0f} l-{r * .2:.0f} {r * .45:.0f}z" fill="url(#{p}water)"/>' for x, y, r in ((330, 282, 56), (250, 326, 34), (420, 330, 34)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="880" cy="190" r="140" fill="url(#{p}sun)"/><circle cx="880" cy="190" r="34" fill="#FFF3C6"/>
<g fill="#FFD98A" opacity=".35"><ellipse cx="300" cy="80" rx="140" ry="8"/><ellipse cx="1000" cy="60" rx="90" ry="6"/><ellipse cx="560" cy="120" rx="120" ry="6"/></g>
{flyer(300, 96, 1)}{flyer(380, 66, .8)}{flyer(450, 110, .65)}
<path d="M0 200 q60 -30 120 -12 q40 -34 90 -6 q60 -30 110 -2 q40 -20 80 4 q30 -16 60 -4 h740 V212 H0z" fill="url(#{p}far)"/>
<path d="M0 206 H1200 V420 H0z" fill="url(#{p}water)"/>
<path d="M820 208 h120 l30 100 h-180z" fill="url(#{p}glint)"/>
<g stroke="#FFE1A0" stroke-width="2" opacity=".5"><path d="M840 220 h80 M830 236 h100 M846 254 h70 M836 274 h90 M852 296 h60"/></g>
<path d="M0 206 h1200" stroke="#F3D48C" stroke-width="1.5" opacity=".6"/>
{ripples}
{duck(560, 262, 1)}{duck(760, 248, .8, True)}{duck(900, 270, .9)}
<g fill="{D}"><ellipse cx="600" cy="256" rx="10" ry="4"/><ellipse cx="632" cy="254" rx="8" ry="3"/></g>
{pads}
<g stroke="#5F9A6A" stroke-width="3" fill="none" stroke-linecap="round"><path d="M318 300 q-40 6 -70 20"/><path d="M342 300 q40 6 76 24"/></g>
<g fill="#F6CFE0"><path d="M330 268 l-8 -14 l10 6 l-2 -16 l8 12 l8 -12 l-2 16 l10 -6 l-8 14z"/></g><circle cx="330" cy="264" r="4" fill="#FFE27A"/>
{reeds_l}{grass}
'''
    return _wrap(2, body, defs)


# ───────────────────────── 3  Place Value to 1,000: lemonade stand ─────────────────────────
def _b3():
    p = "mb3-"
    defs = (
        _lin(p+"sky", [(0, "#4E9EDD", None), (.6, "#A8D6F2", None), (1, "#E6F2F8", None)])
        + _lin(p+"lawn", [(0, "#8CC352", None), (1, "#4F8A2E", None)])
        + _lin(p+"drive", [(0, "#C9C3B4", None), (1, "#8E887A", None)])
        + _rad(p+"leaf", [(0, "#7DB94A", 1), (.7, "#4E8A2E", 1), (1, "#2F5E1C", 1)], .4, .35, .7)
        + _lin(p+"jar", [(0, "#DDEFF5", .55), (.5, "#FFFFFF", .25), (1, "#B9D5DD", .6)], 0, 0, 1, 0)
        + f'<pattern id="{p}cloth" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#FFF7D6"/><rect width="14" height="28" fill="#F5D94A"/></pattern>'
        + _lin(p+"lem", [(0, "#FFF0A0", None), (1, "#F2C43C", None)])
        + f'<pattern id="{p}awn" width="44" height="28" patternUnits="userSpaceOnUse"><rect width="44" height="28" fill="#F5D94A"/><rect width="22" height="28" fill="#FFF7D6"/></pattern>'
    )
    def stack(x, n=10):
        h = n * 5 + 6
        lines = " ".join(f"M{x + 2} {236 - i * 5} h22" for i in range(1, n))
        return (f'<path d="M{x} 236 v-{h} h26 v{h}z" fill="#F3F0E6"/><path d="M{x} 236 v-{h} h26 v{h}" fill="none" stroke="#C9C2B0" stroke-width="1"/>'
                f'<path d="{lines}" stroke="#C9C2B0" stroke-width="1"/>')
    stacks = "".join(stack(x) for x in (664, 700, 736, 772)) + stack(808, 4)
    btn_cols = ("#E1573A", "#3D6FA6", "#F2C43C", "#4E8A2E", "#F0F0F0", "#8B4A9E")
    buttons = "".join(f'<circle cx="{892 + (i * 17) % 60}" cy="{232 - (i * 11) % 66}" r="6" fill="{btn_cols[i % 6]}"/>' for i in range(22))
    scallops = "".join(f'<path d="M{x} 128 q11 14 22 0z" fill="{"#F5D94A" if i % 2 else "#FFF7D6"}"/>' for i, x in enumerate(range(620, 1000, 22)))
    stripes = f'<rect x="620" y="100" width="380" height="28" fill="url(#{p}awn)"/>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="560" cy="60" r="28" fill="#FFF7CC" opacity=".9"/>
<g fill="#FFFFFF" opacity=".8"><ellipse cx="820" cy="60" rx="110" ry="12"/><ellipse cx="860" cy="48" rx="50" ry="16"/><ellipse cx="300" cy="90" rx="80" ry="8"/></g>
<g fill="#C9D9E6"><path d="M300 236 v-70 l70 -46 l70 46 v70z"/><path d="M1000 236 v-60 l50 -36 l50 36 v60z"/></g><g fill="#8AA0B4"><path d="M300 166 l70 -46 l70 46 h-10 l-60 -38 l-60 38z"/><rect x="350" y="184" width="16" height="22"/><rect x="392" y="184" width="16" height="22"/><rect x="1036" y="196" width="14" height="18"/></g>
<g fill="#6EA84A"><ellipse cx="520" cy="228" rx="70" ry="30"/><ellipse cx="1130" cy="222" rx="90" ry="34"/></g>
<path d="M0 236 H1200 V420 H0z" fill="url(#{p}lawn)"/>
<path d="M560 236 h190 l100 184 H420z" fill="url(#{p}drive)"/><path d="M560 236 h190" stroke="#8E887A" stroke-width="2"/>
<path d="M0 236 q120 -30 200 40 q60 60 20 144 H0z" fill="#2E5A1A" opacity=".35"/>
<rect x="128" y="150" width="34" height="100" fill="#5A3A22"/><path d="M128 250 q-20 -6 -34 -2 h102 q-14 -4 -34 2z" fill="#4A2E18"/>
<g fill="url(#{p}leaf)"><circle cx="150" cy="110" r="110"/><circle cx="70" cy="150" r="74"/><circle cx="250" cy="150" r="70"/><circle cx="200" cy="60" r="60"/></g>
<g fill="#A6D46A" opacity=".5"><circle cx="120" cy="60" r="30"/><circle cx="220" cy="100" r="22"/></g>
<g fill="#5A3A22"><rect x="628" y="128" width="8" height="108"/><rect x="980" y="128" width="8" height="108"/></g>
{stripes}{scallops}<path d="M612 96 h392 v8 h-392z" fill="#5A3A22"/>
<rect x="640" y="236" width="340" height="60" fill="url(#{p}cloth)"/><rect x="640" y="236" width="340" height="8" fill="#5A3A22" opacity=".25"/><path d="M640 296 h340 l6 10 h-352z" fill="#5A3A22" opacity=".3"/>
{stacks}
<rect x="852" y="164" width="16" height="10" fill="#F3F0E6"/>
<path d="M880 236 v-72 q0 -10 10 -10 h60 q10 0 10 10 v72z" fill="#FFFFFF" opacity=".35"/>{buttons}<path d="M880 236 v-72 q0 -10 10 -10 h60 q10 0 10 10 v72z" fill="url(#{p}jar)"/><rect x="884" y="148" width="72" height="10" rx="3" fill="#8E887A"/><path d="M884 168 v66" stroke="#FFFFFF" stroke-width="3" opacity=".5"/>
<g><path d="M700 172 h50 l-6 64 h-38z" fill="#FFF4B0" opacity=".85"/><path d="M700 172 h50 v6 h-50z" fill="#C9C2B0"/><path d="M750 186 q18 4 12 30" stroke="#C9C2B0" stroke-width="4" fill="none"/><circle cx="716" cy="200" r="9" fill="url(#{p}lem)"/><circle cx="736" cy="220" r="8" fill="url(#{p}lem)"/></g>
<g fill="url(#{p}lem)"><ellipse cx="830" cy="228" rx="16" ry="12"/><ellipse cx="856" cy="230" rx="14" ry="11"/><ellipse cx="612" cy="212" rx="14" ry="11"/></g>
<g fill="#F5D94A"><circle cx="658" cy="206" r="14"/></g><circle cx="658" cy="206" r="9" fill="#FFF7D6"/><path d="M658 197 v18 M649 206 h18 M652 200 l12 12 M664 200 l-12 12" stroke="#F2C43C" stroke-width="1"/>
'''
    return _wrap(3, body, defs)


# ───────────────────────── 4  Measuring, Time and Money: classroom wall ─────────────────────────
def _b4():
    p = "mb4-"
    defs = (
        _lin(p+"wall", [(0, "#F7EFDA", None), (1, "#E9DDC0", None)])
        + _lin(p+"board", [(0, "#2E6B4E", None), (1, "#1F4E38", None)])
        + _lin(p+"table", [(0, "#8A5A32", None), (.1, "#7A4E2A", None), (1, "#4A2E18", None)])
        + _lin(p+"rain", [(0, "#8FA3B3", None), (1, "#C4CFD8", None)])
        + _lin(p+"box", [(0, "#8E9AA8", None), (1, "#5A6674", None)])
        + f'<pattern id="{p}check" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#F4F1E8"/><rect width="12" height="12" fill="#D94F3A"/><rect x="12" y="12" width="12" height="12" fill="#D94F3A"/></pattern>'
    )
    ticks = "".join(f'<path d="M{760 + 76 * math.sin(math.radians(a)):.1f} {140 - 76 * math.cos(math.radians(a)):.1f} L{760 + (66 if a % 90 == 0 else 70) * math.sin(math.radians(a)):.1f} {140 - (66 if a % 90 == 0 else 70) * math.cos(math.radians(a)):.1f}"/>' for a in range(0, 360, 30))
    ruler = "".join(f'<path d="M{x} 250 v{12 if i % 4 == 0 else 7 if i % 2 == 0 else 4}"/>' for i, x in enumerate(range(612, 1000, 12)))
    rain = "".join(f'<path d="M{x} {y} l-4 14"/>' for x, y in ((1010, 70), (1050, 100), (1090, 60), (1130, 120), (1030, 150), (1110, 170), (1070, 200), (1020, 200), (1150, 80), (1140, 210)))
    gauge = "".join(f'<path d="M1084 {y} h{8 if i % 2 == 0 else 5}"/>' for i, y in enumerate(range(180, 240, 6)))
    coins = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" stroke="{s}" stroke-width="1.5"/>' for x, y, r, c, s in ((470, 284, 9, "#E0C36A", "#B89A3C"), (492, 290, 9, "#E0C36A", "#B89A3C"), (452, 296, 8, "#D8D8DC", "#A0A0A8"), (512, 280, 8, "#D8D8DC", "#A0A0A8"), (530, 294, 9, "#C98A5A", "#9A6238"), (440, 280, 8, "#D8D8DC", "#A0A0A8")))
    cakes = "".join(f'<g transform="translate({x} 0)"><path d="M0 286 l4 -20 h24 l4 20z" fill="#C9A26A"/><path d="M-2 268 q16 -22 36 0z" fill="{c}"/><circle cx="16" cy="254" r="3" fill="#D94F3A"/></g>' for x, c in ((640, "#F2A7C7"), (682, "#F5E6B3"), (724, "#F2A7C7"), (766, "#8AC4E6")))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="0" y="30" width="1200" height="6" fill="#C9B994"/>
<rect x="60" y="56" width="500" height="200" fill="#6A4A2A"/><rect x="70" y="66" width="480" height="180" fill="url(#{p}board)"/>
<g fill="#FFFFFF" opacity=".08"><ellipse cx="200" cy="120" rx="80" ry="30"/><ellipse cx="420" cy="190" rx="60" ry="24"/></g>
<g fill="none" stroke="#F4F1E8" stroke-width="2" opacity=".55"><path d="M110 110 h160"/><path d="M110 140 h110"/><path d="M110 170 h140"/><path d="M110 200 h80"/><circle cx="420" cy="130" r="36"/><path d="M384 130 h72 M420 94 v72"/></g>
<rect x="60" y="256" width="500" height="10" fill="#8A6A44"/><g fill="#F4F1E8"><rect x="110" y="250" width="30" height="6" rx="2"/><rect x="150" y="250" width="22" height="6" rx="2"/></g><rect x="480" y="248" width="40" height="8" rx="2" fill="#4A3A2A"/>
<circle cx="760" cy="140" r="90" fill="#3A3A3A"/><circle cx="760" cy="140" r="82" fill="#FAF8F0"/>
<g stroke="#2A2A2A" stroke-width="3">{ticks}</g><circle cx="760" cy="140" r="74" fill="none" stroke="#2A2A2A" stroke-width="3" stroke-dasharray="1.2 6.55" opacity=".7"/>
<path d="M760 140 L727 121" stroke="#2A2A2A" stroke-width="6" stroke-linecap="round"/><path d="M760 140 L790 88" stroke="#2A2A2A" stroke-width="4" stroke-linecap="round"/><path d="M760 152 L806 175" stroke="#D94F3A" stroke-width="2" stroke-linecap="round"/><circle cx="760" cy="140" r="5" fill="#2A2A2A"/>
<rect x="600" y="240" width="400" height="26" fill="#E8C98A"/><rect x="600" y="240" width="400" height="26" fill="none" stroke="#B08A50" stroke-width="1.5"/><g stroke="#3A2A1A" stroke-width="1.5">{ruler}</g>
<g fill="#E9E4C2" opacity=".85"><path d="M612 232 l24 -6 l4 14 l-24 6z"/><path d="M968 232 l24 -6 l4 14 l-24 6z"/></g>
<rect x="1000" y="40" width="180" height="210" fill="#8A6A44"/><rect x="1010" y="50" width="160" height="190" fill="url(#{p}rain)"/>
<path d="M1010 190 q40 -20 80 -8 q40 -14 80 -4 v52 h-160z" fill="#5E7A62"/>
<g stroke="#E5EDF2" stroke-width="1.5" opacity=".8">{rain}</g>
<rect x="1086" y="140" width="6" height="100" fill="#8A6A44"/><rect x="1064" y="170" width="20" height="70" rx="3" fill="#DCE9F0" opacity=".85"/><rect x="1064" y="170" width="20" height="70" rx="3" fill="none" stroke="#5A6674" stroke-width="1.5"/><rect x="1066" y="212" width="16" height="26" fill="#5FA3D2" opacity=".8"/><g stroke="#3A4A5A" stroke-width="1.2">{gauge}</g><path d="M1058 168 h32 v6 h-32z" fill="#5A6674"/>
<rect x="1000" y="240" width="180" height="12" fill="#C9B994"/><rect x="1088" y="52" width="4" height="188" fill="#8A6A44"/><rect x="1010" y="142" width="160" height="4" fill="#8A6A44"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}table)"/><rect x="0" y="296" width="1200" height="8" fill="#A67A48"/>
<rect x="240" y="286" width="600" height="18" fill="url(#{p}check)"/><rect x="240" y="286" width="600" height="18" fill="#000" opacity=".12"/>
<g><rect x="300" y="238" width="130" height="56" rx="4" fill="url(#{p}box)"/><path d="M300 242 l6 -46 h130 l-6 46z" fill="#6A7684"/><path d="M300 242 h130" stroke="#3A4450" stroke-width="2"/><rect x="310" y="250" width="26" height="34" rx="2" fill="#7CB35A"/><rect x="342" y="250" width="26" height="34" rx="2" fill="#7CB35A"/><rect x="376" y="250" width="44" height="16" rx="2" fill="#E0C36A"/><rect x="376" y="270" width="44" height="14" rx="2" fill="#D8D8DC"/></g>
{coins}
<ellipse cx="704" cy="288" rx="110" ry="14" fill="#F4F1E8"/><ellipse cx="704" cy="288" rx="110" ry="14" fill="none" stroke="#C9C2B0" stroke-width="1.5"/>{cakes}
'''
    return _wrap(4, body, defs)


# ───────────────────────── 5  Shapes and Equal Shares: block city on a rug ─────────────────────────
def _b5():
    p = "mb5-"
    defs = (
        _lin(p+"wall", [(0, "#EDE4D2", None), (1, "#D9CDB6", None)])
        + _lin(p+"rug", [(0, "#8E6D5E", None), (1, "#5F4438", None)])
        + _lin(p+"light", [(0, "#FFF6D8", .55), (1, "#FFF6D8", 0)], 0, 0, 1, 1)
        + _lin(p+"pane", [(0, "#BFDCEF", None), (1, "#E8F2F8", None)])
        + f'<pattern id="{p}stripe" width="1200" height="30" patternUnits="userSpaceOnUse"><rect width="1200" height="30" fill="none"/><rect width="1200" height="6" fill="#C9A98A" opacity=".5"/><rect y="16" width="1200" height="3" fill="#3F6FA8" opacity=".35"/></pattern>'
    )
    def cube(x, y, s, top, left, right):
        h = s * .5
        return (f'<path d="M{x} {y} l{s} -{h:.0f} l{s} {h:.0f} l-{s} {h:.0f}z" fill="{top}"/>'
                f'<path d="M{x} {y} l{s} {h:.0f} v{s} l-{s} -{h:.0f}z" fill="{left}"/>'
                f'<path d="M{x + s} {y + h:.0f} l{s} -{h:.0f} v{s} l-{s} {h:.0f}z" fill="{right}"/>')
    def cyl(x, y, r, h, side, top):
        return (f'<path d="M{x - r} {y} v{h} a{r} {r * .35:.0f} 0 0 0 {2 * r} 0 v-{h}z" fill="{side}"/>'
                f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r * .35:.0f}" fill="{top}"/>')
    def cone(x, y, r, h, fill, dark):
        return (f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r * .35:.0f}" fill="{dark}"/>'
                f'<path d="M{x - r} {y} L{x} {y - h} L{x + r} {y}z" fill="{fill}"/>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="40" y="0" width="14" height="240" fill="#B8A88E"/><rect x="0" y="230" width="1200" height="12" fill="#B8A88E"/>
<rect x="80" y="30" width="250" height="190" fill="#7A6A52"/><rect x="90" y="40" width="230" height="170" fill="url(#{p}pane)"/>
<g fill="#7A6A52"><rect x="200" y="40" width="8" height="170"/><rect x="90" y="120" width="230" height="8"/></g>
<g fill="#FFFFFF" opacity=".7"><ellipse cx="150" cy="80" rx="40" ry="8"/><ellipse cx="260" cy="70" rx="30" ry="6"/></g>
<path d="M0 242 H1200 V420 H0z" fill="url(#{p}rug)"/><rect x="0" y="242" width="1200" height="178" fill="url(#{p}stripe)"/>
<path d="M120 242 L330 242 L1000 420 L420 420z" fill="url(#{p}light)"/>
<g fill="#000" opacity=".12"><ellipse cx="500" cy="300" rx="130" ry="14"/><ellipse cx="760" cy="290" rx="120" ry="12"/><ellipse cx="960" cy="280" rx="80" ry="10"/></g>
{cube(430, 250, 46, "#E06A58", "#9E3C2E", "#C7503F")}
{cube(430, 204, 46, "#E06A58", "#9E3C2E", "#C7503F")}
{cube(522, 250, 46, "#5F8FC9", "#2E4F80", "#3F6FA8")}
{cube(476, 274, 46, "#F0CE5A", "#B08A2A", "#E2B93B")}
{cyl(700, 200, 34, 90, "#3F6FA8", "#7FA6DA")}
{cyl(700, 160, 22, 40, "#2E4F80", "#7FA6DA")}
{cone(700, 154, 22, 60, "#E2B93B", "#B08A2A")}
{cube(770, 262, 40, "#7CB35A", "#3E6E2A", "#5A9440")}
{cube(770, 222, 40, "#7CB35A", "#3E6E2A", "#5A9440")}
<path d="M770 222 l40 -20 l40 20 l-40 20z" fill="#7CB35A"/><path d="M768 214 l42 -60 l42 60z" fill="#C7503F"/><path d="M810 154 l42 60 l-6 3 l-36 -52z" fill="#9E3C2E"/>
{cyl(880, 250, 26, 40, "#E2B93B", "#F0CE5A")}
{cube(920, 250, 34, "#5F8FC9", "#2E4F80", "#3F6FA8")}
{cone(970, 244, 26, 70, "#C7503F", "#9E3C2E")}
{cube(1040, 262, 38, "#F0CE5A", "#B08A2A", "#E2B93B")}
<path d="M600 284 q0 -34 40 -34 h20 q40 0 40 34 v6 h-100z" fill="#5F8FC9"/><rect x="592" y="280" width="116" height="12" rx="3" fill="#2E4F80"/>
<path d="M560 226 h40 l-8 24 h-24z" fill="#E2B93B"/>
<g transform="translate(0 -22)"><ellipse cx="300" cy="330" rx="120" ry="30" fill="#F4F1E8"/><ellipse cx="300" cy="330" rx="120" ry="30" fill="none" stroke="#C9C2B0" stroke-width="2"/><ellipse cx="300" cy="330" rx="96" ry="22" fill="none" stroke="#3F6FA8" stroke-width="1.5" opacity=".5"/>
<g><path d="M226 322 l72 -26 l-6 44 h-52z" fill="#E4B36E"/><path d="M228 320 l70 -26 l-2 16 l-66 24z" fill="#F1CE93"/><path d="M234 330 l60 -22" stroke="#7CB35A" stroke-width="3"/><path d="M238 336 l54 -20" stroke="#D94F3A" stroke-width="2"/></g>
<g><path d="M310 296 l72 26 l-14 22 h-52z" fill="#E4B36E"/><path d="M312 296 l70 26 l-8 4 l-64 -22z" fill="#F1CE93"/><path d="M318 306 l58 22" stroke="#7CB35A" stroke-width="3"/><path d="M314 312 l54 20" stroke="#D94F3A" stroke-width="2"/></g></g>
'''
    return _wrap(5, body, defs)


# ───────────────────────── 6  Multiplication and Division: farm kitchen table ─────────────────────────
def _b6():
    p = "mb6-"
    defs = (
        _lin(p+"wall", [(0, "#DDB05A", None), (1, "#C28F3C", None)])
        + _lin(p+"table", [(0, "#F1E3C4", None), (.08, "#E7D3AA", None), (1, "#B89466", None)])
        + _lin(p+"osky", [(0, "#8FC3EA", None), (1, "#E6EFC8", None)])
        + _lin(p+"field", [(0, "#B9C85E", None), (1, "#6E9A34", None)])
        + _lin(p+"tin", [(0, "#8A8E96", None), (1, "#4E525A", None)])
        + _rad(p+"muf", [(0, "#E8B266", 1), (.7, "#B8783A", 1), (1, "#8A5426", 1)], .4, .35, .7)
        + _rad(p+"cook", [(0, "#E6C58A", 1), (.8, "#C79A56", 1), (1, "#9C6E36", 1)], .4, .35, .7)
    )
    rows = "".join(f'<path d="M{770 + i * 30} 236 L{600 + i * 60} 300" stroke="#4E7A24" stroke-width="{1 + i * .2:.1f}" opacity=".55" fill="none"/>' for i in range(12))
    eggs = '<g fill="#F4E9D2">' + "".join(f'<ellipse cx="{x}" cy="{y}" rx="12" ry="9"/>' for x in range(226, 372, 29) for y in (242, 262)) + "</g>"
    cups = "".join(f'<ellipse cx="{x + 15}" cy="{y}" rx="15" ry="6" fill="#2A2E36"/><path d="M{x + 1} {y - 2} q14 -22 28 0 z" fill="url(#{p}muf)"/><ellipse cx="{x + 15}" cy="{y - 8}" rx="15" ry="7" fill="url(#{p}muf)"/>' for y in (222, 246) for x in (612, 650, 688, 726))
    cookies = "".join(f'<circle cx="{x}" cy="{y}" r="15" fill="url(#{p}cook)"/>' for y in (216, 250) for x in (846, 884, 922, 960, 998)) + '<g fill="#5A3420">' + "".join(f'<circle cx="{x - 5}" cy="{y - 4}" r="2"/><circle cx="{x + 5}" cy="{y + 3}" r="2"/>' for y in (216, 250) for x in (846, 884, 922, 960, 998)) + "</g>"
    wires = "".join(f'<path d="M830 {y} h190" stroke="#8A8E96" stroke-width="2"/>' for y in range(212, 270, 12))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="0" y="0" width="1200" height="20" fill="#A6712A" opacity=".5"/>
<rect x="590" y="30" width="360" height="240" fill="#F1E3C4"/><rect x="600" y="40" width="340" height="220" fill="url(#{p}osky)"/>
<g fill="#FFFFFF" opacity=".7"><ellipse cx="700" cy="90" rx="60" ry="10"/><ellipse cx="860" cy="70" rx="40" ry="8"/></g>
<path d="M600 178 q60 -10 120 -6 q60 -8 220 -4 v82 h-340z" fill="url(#{p}field)"/><g fill="#4E7A24" opacity=".5"><ellipse cx="640" cy="176" rx="34" ry="14"/><ellipse cx="900" cy="170" rx="40" ry="16"/></g>
<g><path d="M780 176 v-38 l32 -22 l32 22 v38z" fill="#B7402C"/><path d="M780 138 l32 -22 l32 22" fill="none" stroke="#7A2A1C" stroke-width="3"/><rect x="804" y="150" width="16" height="26" fill="#5A1E14"/><rect x="852" y="132" width="10" height="44" fill="#9A9A9A"/><ellipse cx="857" cy="132" rx="7" ry="4" fill="#B7B7B7"/></g>
<path d="M600 236 H940 V260 H600z" fill="url(#{p}field)"/>{rows}
<g fill="#F1E3C4"><rect x="770" y="40" width="6" height="220"/><rect x="600" y="148" width="340" height="6"/></g>
<g fill="#EAD6A8" opacity=".95"><path d="M560 26 h60 q10 120 -20 250 h-40z"/><path d="M980 26 h-60 q-10 120 20 250 h40z"/></g><g fill="#C28F3C"><rect x="556" y="20" width="428" height="8" rx="3"/></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}table)"/><path d="M0 262 h1200 v6 H0z" fill="#FFF6E0" opacity=".6"/>
<g fill="#000" opacity=".1"><ellipse cx="300" cy="288" rx="110" ry="10"/><ellipse cx="680" cy="286" rx="90" ry="8"/><ellipse cx="920" cy="288" rx="110" ry="8"/></g>
<g><path d="M204 226 h180 v52 h-180z" fill="#C4BBA8"/><path d="M204 226 l6 -70 h168 l6 70z" fill="#D8D0BD"/><path d="M212 162 h164 l4 56 h-172z" fill="#BFB6A2"/></g>
{eggs}<path d="M204 278 h180 v8 h-180z" fill="#9A9080"/>
<g><rect x="80" y="240" width="90" height="34" rx="3" fill="#B7402C"/><path d="M80 240 h90 l-6 -14 h-78z" fill="#D25640"/><ellipse cx="125" cy="274" rx="45" ry="6" fill="#8A2A1C"/><rect x="88" y="228" width="16" height="10" fill="#F4E9D2"/></g>
<rect x="596" y="196" width="180" height="76" rx="6" fill="url(#{p}tin)"/><rect x="596" y="196" width="180" height="76" rx="6" fill="none" stroke="#2A2E36" stroke-width="2"/>{cups}
<g fill="#8A8E96"><rect x="826" y="270" width="8" height="10"/><rect x="1016" y="270" width="8" height="10"/></g>{wires}<path d="M830 206 h190 v4 h-190z" fill="#A0A4AC"/>{cookies}
<path d="M1080 272 q-4 -30 30 -32 q34 2 30 32z" fill="#E7D3AA"/><path d="M1078 270 h64 v8 h-64z" fill="#B7402C"/>
'''
    return _wrap(6, body, defs)


# ───────────────────────── 7  Place Value and Multi-Digit Arithmetic: gym science fair ─────────────────────────
def _b7():
    p = "mb7-"
    defs = (
        _lin(p+"wall", [(0, "#2E4A6A", None), (1, "#4A6A8E", None)])
        + _lin(p+"floor", [(0, "#D6A86A", None), (.5, "#B98650", None), (1, "#7A5430", None)])
        + _rad(p+"lamp", [(0, "#FFF8E0", .9), (.4, "#FFE9A8", .3), (1, "#FFE9A8", 0)], .5, 0, .6)
        + _lin(p+"cloth", [(0, "#F6F2E8", None), (1, "#D9D3C6", None)])
    )
    lamps = "".join(f'<rect x="{x}" y="14" width="90" height="12" rx="3" fill="#FFF3C8"/><ellipse cx="{x + 45}" cy="20" rx="110" ry="80" fill="url(#{p}lamp)"/>' for x in (120, 380, 640, 900))
    seg = "".join(f'<rect x="{x}" y="{y}" width="10" height="4" rx="1" fill="#F5A03A" opacity="{o}"/>' for gx in (520, 560, 620, 660) for x, y, o in ((gx, 60, 1), (gx, 78, .9), (gx, 96, 1)))
    segv = "".join(f'<rect x="{x}" y="{y}" width="4" height="14" rx="1" fill="#F5A03A" opacity="{o}"/>' for gx in (520, 560, 620, 660) for x, y, o in ((gx - 3, 63, 1), (gx + 11, 63, .9), (gx - 3, 81, .3), (gx + 11, 81, 1)))
    boards = ("#D94F3A", "#3F6FA8", "#7CB35A", "#E2B93B", "#8B4A9E", "#E88A3A", "#3AA6A0")
    def table(cx, y, w, i, big):
        h = int(w * .22)
        bh = int(w * .42)
        c = boards[i % 7]
        board = f'<path d="M{cx - w * .42:.0f} {y - 2} l{w * .16:.0f} -{bh * .18:.0f} v{bh} l-{w * .16:.0f} {bh * .18:.0f}z M{cx - w * .26:.0f} {y - 2 - bh * .18:.0f} h{w * .52:.0f} v{bh} h-{w * .52:.0f}z M{cx + w * .26:.0f} {y - 2 - bh * .18:.0f} l{w * .16:.0f} {bh * .18:.0f} v{bh} l-{w * .16:.0f} -{bh * .18:.0f}z" fill="{c}" transform="translate(0 -{bh})"/>'
        if not big:
            board += f'<g fill="#FFFFFF" opacity=".7"><rect x="{cx - w * .2:.0f}" y="{y - bh - bh * .18 + 4:.0f}" width="{w * .4:.0f}" height="{bh * .3:.0f}"/><rect x="{cx - w * .2:.0f}" y="{y - bh + 6:.0f}" width="{w * .18:.0f}" height="{bh * .28:.0f}"/><rect x="{cx + w * .02:.0f}" y="{y - bh + 6:.0f}" width="{w * .18:.0f}" height="{bh * .28:.0f}"/></g>'
        return (board + f'<path d="M{cx - w // 2} {y} h{w} l{w * .06:.0f} {h} h-{w * 1.12:.0f}z" fill="url(#{p}cloth)"/><path d="M{cx - w // 2} {y} h{w}" stroke="#B9B2A2" stroke-width="1.5"/>')
    tables = "".join(table(cx, 214, 76, i, False) for i, cx in enumerate((160, 320, 480, 640, 800, 960, 1120)))
    tables2 = "".join(table(cx, 292, 118, i + 3, True) for i, cx in enumerate((110, 340, 570, 800, 1030)))
    people = "".join(_kid(x, 212, h, "#1E2A3A") for x, h in ((230, 44), (250, 40), (410, 46), (570, 42), (720, 48), (740, 40), (890, 46), (1050, 44)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="0" y="0" width="1200" height="36" fill="#1E3450"/>{lamps}
<g fill="#1E3450" opacity=".7"><rect x="0" y="120" width="1200" height="14"/><rect x="0" y="40" width="1200" height="4"/></g>
<g fill="#7A8FA8" opacity=".5"><rect x="60" y="60" width="90" height="56" rx="4"/><rect x="1050" y="60" width="90" height="56" rx="4"/></g>
<rect x="480" y="46" width="240" height="70" rx="6" fill="#0E1A28"/><rect x="480" y="46" width="240" height="70" rx="6" fill="none" stroke="#8FA4BC" stroke-width="3"/>{seg}{segv}
<g fill="#F5A03A"><circle cx="596" cy="72" r="3"/><circle cx="596" cy="90" r="3"/></g>
<g fill="#E88A3A"><rect x="100" y="78" width="10" height="6"/><rect x="1090" y="78" width="10" height="6"/></g>
<path d="M0 156 H1200 V420 H0z" fill="url(#{p}floor)"/>
<g stroke="#F4F1E8" stroke-width="2" opacity=".7" fill="none"><path d="M0 172 h1200"/><ellipse cx="600" cy="172" rx="120" ry="16"/><path d="M0 250 q600 -30 1200 0" opacity=".6"/><path d="M0 410 q600 -60 1200 0" opacity=".5"/></g>
<g stroke="#E2B93B" stroke-width="4" fill="none" opacity=".8"><path d="M240 156 L60 420 M960 156 L1140 420"/></g>
<rect x="0" y="134" width="1200" height="22" fill="#2A3D56"/>
{tables}{people}{tables2}
'''
    return _wrap(7, body, defs)


# ───────────────────────── 8  Fractions: running track and a picnic table ─────────────────────────
def _b8():
    p = "mb8-"
    defs = (
        _lin(p+"sky", [(0, "#4E9BDD", None), (.7, "#B9DCF3", None), (1, "#E8F2F8", None)])
        + _lin(p+"track", [(0, "#D0664A", None), (1, "#A8452E", None)])
        + _lin(p+"wood", [(0, "#B98858", None), (1, "#7A5232", None)])
        + _lin(p+"grass", [(0, "#8CC352", None), (1, "#5A9438", None)])
        + _rad(p+"pizza", [(0, "#E8B058", 1), (.85, "#D9863E", 1), (1, "#C86A2C", 1)])
        + _lin(p+"tape", [(0, "#F5D23C", None), (1, "#D9AE1E", None)])
    )
    lanes = "".join(f'<path d="M{-200 + i * 0} {180 + i * 0} A{760 - i * 14} {150 - i * 14} 0 0 0 1400 {330 + i * 0}" />' for i in range(1))
    lanes = "".join(f'<ellipse cx="640" cy="330" rx="{820 - i * 26}" ry="{164 - i * 15}" fill="none" stroke="#F4F1E8" stroke-width="2.5" opacity=".9"/>' for i in range(9))
    slices = "".join(f'<path d="M580 300 L{580 + 66 * math.cos(math.radians(a)):.1f} {300 + 66 * math.sin(math.radians(a)) * .55:.1f}" stroke="#7A3A16" stroke-width="2.5"/>' for a in range(0, 360, 45))
    pepp = "".join(f'<ellipse cx="{x}" cy="{y}" rx="7" ry="4" fill="#B7402C"/>' for x, y in ((556, 288), (600, 284), (620, 306), (560, 314), (596, 322), (632, 292), (540, 300), (580, 300)))
    ticks = "".join(f'<path d="M{i * 10} 0 v{12 if i % 5 == 0 else 6}"/>' for i in range(1, 23))
    tape = "".join(f'<path d="M{x} 262 v{7 if i % 2 else 4}"/>' for i, x in enumerate(range(792, 860, 8)))
    planks = "".join(f'<path d="M0 {y} H1200" stroke="#5A3A20" stroke-width="2" opacity=".5"/>' for y in (284, 330, 376))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#FFFFFF" opacity=".8"><ellipse cx="220" cy="60" rx="120" ry="12"/><ellipse cx="270" cy="48" rx="50" ry="16"/><ellipse cx="900" cy="80" rx="140" ry="10"/><ellipse cx="960" cy="66" rx="60" ry="18"/></g>
<g fill="#4E7A34"><ellipse cx="80" cy="180" rx="90" ry="40"/><ellipse cx="240" cy="176" rx="70" ry="34"/><ellipse cx="1100" cy="178" rx="100" ry="44"/><ellipse cx="960" cy="176" rx="60" ry="30"/></g>
<g fill="#C8B79A"><rect x="380" y="130" width="440" height="52"/><rect x="560" y="112" width="80" height="20"/></g><g fill="#5F7C99">{"".join(f'<rect x="{x}" y="144" width="22" height="24"/>' for x in range(400, 800, 44))}</g>
<g fill="#5A5A5A"><rect x="330" y="120" width="6" height="62"/><rect x="866" y="120" width="6" height="62"/></g><g fill="#F4F1E8"><path d="M330 120 h26 v16 h-26z"/></g>
<path d="M0 182 H1200 V420 H0z" fill="url(#{p}grass)"/>
<ellipse cx="640" cy="330" rx="830" ry="170" fill="url(#{p}track)"/>{lanes}
<ellipse cx="640" cy="330" rx="606" ry="46" fill="url(#{p}grass)"/>
<path d="M-80 330 L160 190" stroke="#F4F1E8" stroke-width="2.5" opacity=".7"/>
<path d="M0 244 H1200 V420 H0z" fill="url(#{p}wood)"/>{planks}<path d="M0 244 h1200 v5 H0z" fill="#D2A878"/>
<g fill="#000" opacity=".12"><ellipse cx="590" cy="290" rx="110" ry="24"/><ellipse cx="850" cy="252" rx="60" ry="8"/></g>
<g transform="translate(0 -26)"><ellipse cx="580" cy="300" rx="104" ry="56" fill="#F1E3C4"/><ellipse cx="580" cy="300" rx="90" ry="48" fill="url(#{p}pizza)"/><ellipse cx="580" cy="300" rx="70" ry="38" fill="#E6C86A" opacity=".8"/>{pepp}
<g fill="#4E8A2E" opacity=".8"><ellipse cx="572" cy="296" rx="5" ry="3"/><ellipse cx="612" cy="310" rx="5" ry="3"/><ellipse cx="548" cy="308" rx="5" ry="3"/></g>{slices}
<path d="M580 300 L646 300 A66 36 0 0 0 626 274z" fill="#F1E3C4" opacity=".28"/></g>
<g transform="translate(870 246) rotate(-52)"><rect x="0" y="-14" width="230" height="28" rx="2" fill="#E8C98A"/><rect x="0" y="-14" width="230" height="28" rx="2" fill="none" stroke="#9A7440" stroke-width="1.5"/><g stroke="#3A2A1A" stroke-width="1.2" transform="translate(0 -14)">{ticks}</g></g>
<g transform="translate(0 -18)"><circle cx="760" cy="248" r="26" fill="url(#{p}tape)"/><circle cx="760" cy="248" r="26" fill="none" stroke="#8A6A10" stroke-width="2"/><circle cx="760" cy="248" r="8" fill="#3A3A3A"/><rect x="784" y="258" width="76" height="12" fill="#F7EFD4"/><rect x="784" y="258" width="76" height="12" fill="none" stroke="#8A6A10" stroke-width="1"/><g stroke="#3A2A1A" stroke-width="1">{tape}</g><rect x="858" y="254" width="6" height="20" fill="#3A3A3A"/></g>
<path d="M0 396 H1200 V420 H0z" fill="#4A2E18" opacity=".5"/>
'''
    return _wrap(8, body, defs)


# ───────────────────────── 9  Decimals: 100-meter dash at dusk ─────────────────────────
def _b9():
    p = "mb9-"
    defs = (
        _lin(p+"sky", [(0, "#14213F", None), (.45, "#3A3F6E", None), (.75, "#E0692C", None), (1, "#F6A24C", None)])
        + _lin(p+"track", [(0, "#B5462E", None), (1, "#5E2416", None)])
        + _rad(p+"glow", [(0, "#FFF6D8", 1), (.25, "#FFE9A8", .5), (1, "#FFE9A8", 0)])
        + _lin(p+"stand", [(0, "#1B2A48", None), (1, "#0C1528", None)])
        + _lin(p+"panel", [(0, "#0B1220", None), (1, "#1A2438", None)])
    )
    D = "#0C1528"
    lanes = "".join(f'<path d="M{600 + (x - 600) * .16:.0f} 214 L{x} 420" stroke="#F4EBD8" stroke-width="2.5" opacity=".85"/>' for x in range(-200, 1401, 150))
    seats = "".join(f'<path d="M0 {y} H1200" stroke="#2A3B5E" stroke-width="2" opacity=".7"/>' for y in range(120, 205, 10))
    segs = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1.5" fill="#FF9A2E" opacity="{o}"/>' for gx in (906, 940, 990, 1024, 1064) for x, y, w, h, o in ((gx + 2, 106, 14, 3, 1), (gx + 2, 121, 14, 3, .8), (gx + 2, 136, 14, 3, 1), (gx - 1, 108, 3, 12, .9), (gx + 17, 108, 3, 12, 1), (gx - 1, 124, 3, 12, 1), (gx + 17, 124, 3, 12, .85)))
    def runner(x, y, s, lead):
        return (f'<g transform="translate({x} {y}) scale({s})" fill="{D}"><circle cx="0" cy="-88" r="11"/>'
                f'<path d="M-8 -76 q10 -6 18 2 l6 30 l-6 30 l14 30 l-8 4 l-18 -30 l-10 32 l-8 -2 l6 -36 l-6 -28 l-14 26 l-6 -4 l14 -34 l6 -20z"/>'
                f'<path d="M6 -66 l24 {"-18" if lead else "12"} l4 5 l-24 {"20" if lead else "-10"}z M-6 -66 l-24 {"14" if lead else "-14"} l-3 -5 l24 {"-12" if lead else "12"}z"/></g>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_dots(11, 26, 120, "#E8E9F5", ".6")}
<g fill="{D}"><rect x="150" y="40" width="8" height="90"/><rect x="1040" y="40" width="8" height="90"/><rect x="132" y="34" width="44" height="14" rx="3"/><rect x="1022" y="34" width="44" height="14" rx="3"/></g>
<g fill="#FFF3C8"><rect x="134" y="36" width="40" height="8" rx="2"/><rect x="1024" y="36" width="40" height="8" rx="2"/></g><ellipse cx="154" cy="42" rx="90" ry="60" fill="url(#{p}glow)"/><ellipse cx="1044" cy="42" rx="90" ry="60" fill="url(#{p}glow)"/>
<path d="M0 116 H1200 V214 H0z" fill="url(#{p}stand)"/>{seats}
<g fill="#E7EEF7" opacity=".9">{"".join(f'<rect x="{x}" y="{y}" width="12" height="7" rx="1"/>' for x, y in ((40, 128), (90, 148), (220, 138), (330, 168), (420, 128), (500, 158), (620, 138), (700, 168), (760, 128), (840, 148), (1120, 158), (1160, 128), (60, 188), (300, 198), (560, 188), (1000, 178)))}</g>
<rect x="0" y="204" width="1200" height="10" fill="#0C1528"/>
<g fill="{D}"><rect x="880" y="90" width="220" height="64" rx="4"/><rect x="972" y="154" width="8" height="60"/><rect x="1000" y="154" width="8" height="60"/></g><rect x="886" y="96" width="208" height="52" rx="3" fill="url(#{p}panel)"/>{segs}
<g fill="#FF9A2E"><circle cx="968" cy="114" r="2"/><circle cx="968" cy="130" r="2"/><circle cx="1048" cy="114" r="2"/><circle cx="1048" cy="130" r="2"/></g>
<path d="M0 214 H1200 V420 H0z" fill="url(#{p}track)"/>{lanes}
<path d="M40 330 h1120 v12 H40z" fill="#F4EBD8"/><g fill="#0C1528">{"".join(f'<rect x="{x}" y="330" width="14" height="12"/>' for x in range(54, 1160, 28))}</g>
<g fill="#F4EBD8" opacity=".9">{"".join(f'<rect x="{x}" y="240" width="26" height="14" rx="2"/>' for x in (440, 590, 740))}</g>
<g fill="{D}"><rect x="20" y="220" width="10" height="130"/><rect x="1170" y="220" width="10" height="130"/></g><path d="M30 300 h1140" stroke="#F4EBD8" stroke-width="3" stroke-dasharray="20 14" opacity=".9"/>
{runner(600, 338, 1.05, True)}{runner(740, 326, .9, False)}{runner(470, 322, .82, False)}
<g><rect x="80" y="322" width="240" height="14" rx="3" fill="#2A3548"/><rect x="92" y="336" width="10" height="26" fill="#1B2436"/><rect x="298" y="336" width="10" height="26" fill="#1B2436"/></g>
<g transform="translate(200 300)"><rect x="-6" y="-38" width="12" height="10" rx="2" fill="#C9CED8"/><circle cx="0" cy="0" r="28" fill="#8A93A6"/><circle cx="0" cy="0" r="22" fill="#F4EBD8"/><path d="M0 0 L0 -17" stroke="#0C1528" stroke-width="2.5"/><path d="M0 0 L11 8" stroke="#E0692C" stroke-width="2"/><circle cx="0" cy="0" r="2.5" fill="#0C1528"/><rect x="18" y="-30" width="8" height="8" rx="2" fill="#C9CED8" transform="rotate(30)"/></g>
'''
    return _wrap(9, body, defs)


# ───────────────────────── 10  Measurement and Data: school garden ─────────────────────────
def _b10():
    p = "mb10-"
    defs = (
        _lin(p+"sky", [(0, "#8FC5EA", None), (.6, "#D6E8F0", None), (1, "#FBE7B4", None)])
        + _rad(p+"sun", [(0, "#FFF8DA", 1), (.3, "#FFE9A0", .7), (1, "#FFE9A0", 0)])
        + _lin(p+"grass", [(0, "#A2CC5E", None), (1, "#5E9438", None)])
        + _lin(p+"soil", [(0, "#6A4A2C", None), (1, "#3E2A18", None)])
        + _lin(p+"wood", [(0, "#C29B66", None), (1, "#8A6438", None)])
        + _lin(p+"barrow", [(0, "#4E8A9E", None), (1, "#2E5C6E", None)])
    )
    heights = (60, 110, 84, 150, 128, 72)
    poles = ""
    for i, h in enumerate(heights):
        x = 440 + i * 46
        top = 236 - h
        leaves = "".join(f'<ellipse cx="{x + (10 if k % 2 else -10)}" cy="{236 - 14 - k * 22}" rx="9" ry="5" transform="rotate({-30 if k % 2 else 30} {x + (10 if k % 2 else -10)} {236 - 14 - k * 22})"/>' for k in range(max(1, h // 22)))
        poles += (f'<rect x="{x - 3}" y="{top}" width="6" height="{h}" fill="#7A5A32"/>'
                  f'<path d="M{x - 8} 236 q8 -{h * .4:.0f} -6 -{h * .6:.0f} q10 -12 6 -{h * .85:.0f}" stroke="#3E7A2A" stroke-width="2.5" fill="none"/>'
                  f'<g fill="#5FA83A">{leaves}</g>')
    posts = "".join(f'<rect x="{x}" y="{y}" width="10" height="{236 - y + 6}" fill="url(#{p}wood)"/>' for x, y in ((40, 150), (150, 152), (260, 154), (370, 156), (760, 158), (870, 160), (980, 162)))
    rails = '<g fill="#B08A56"><path d="M50 170 h100 l0 6 h-100z M160 172 h100 v6 h-100z M270 174 h100 v6 h-100z M50 208 h100 v6 h-100z M160 210 h100 v6 h-100z"/></g>'
    seedlings = "".join(f'<path d="M{x} {y} q-6 -10 -2 -16 M{x} {y} q6 -10 2 -16" stroke="#7CC44E" stroke-width="2.5" fill="none"/>' for x in range(110, 380, 40) for y in (270, 292))
    seedlings2 = "".join(f'<path d="M{x} {y} q-6 -10 -2 -16 M{x} {y} q6 -10 2 -16" stroke="#7CC44E" stroke-width="2.5" fill="none"/>' for x in range(520, 720, 50) for y in (300,))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="120" cy="90" r="130" fill="url(#{p}sun)"/><circle cx="120" cy="90" r="30" fill="#FFF8DA"/>
<g fill="#FFFFFF" opacity=".7"><ellipse cx="700" cy="60" rx="120" ry="10"/><ellipse cx="760" cy="48" rx="50" ry="14"/></g>
<g fill="#BFC7B0"><rect x="560" y="120" width="400" height="60"/><rect x="700" y="100" width="120" height="24"/></g><g fill="#6E8398">{"".join(f'<rect x="{x}" y="134" width="24" height="26"/>' for x in range(580, 950, 50))}</g>
<g fill="#5E8A44"><ellipse cx="480" cy="176" rx="70" ry="36"/><ellipse cx="1060" cy="170" rx="90" ry="44"/><ellipse cx="1160" cy="184" rx="60" ry="30"/></g>
<path d="M0 182 H1200 V420 H0z" fill="url(#{p}grass)"/>
<path d="M0 240 q300 -14 600 0 q300 -12 600 0 V420 H0z" fill="#7BAA46"/>
{posts}{rails}
<g><rect x="1010" y="196" width="60" height="6" fill="#B08A56" transform="rotate(38 1010 196)"/><rect x="1096" y="176" width="20" height="10" fill="#4A3A2A"/><rect x="1104" y="186" width="4" height="30" fill="#8A6438"/></g>
<path d="M80 258 h330 l16 52 h-362z" fill="url(#{p}wood)"/><path d="M92 262 h306 l10 42 h-326z" fill="url(#{p}soil)"/>{seedlings}
<path d="M500 280 h240 l14 44 h-268z" fill="url(#{p}wood)"/><path d="M510 284 h220 l8 34 h-236z" fill="url(#{p}soil)"/>{seedlings2}
<path d="M420 236 h300 v6 h-300z" fill="#3E2A18" opacity=".4"/>{poles}
<g><path d="M300 262 h56 v-40 h-56z" fill="#8FA33A"/><path d="M300 222 h56 l-6 -8 h-44z" fill="#A8B850"/><ellipse cx="328" cy="214" rx="22" ry="5" fill="#6E7E2A"/><path d="M356 236 l40 -22 l5 5 l-41 24z" fill="#8FA33A"/><circle cx="399" cy="212" r="7" fill="#A8B850"/><path d="M300 232 q-22 4 -22 16 q0 10 22 10" stroke="#8FA33A" stroke-width="5" fill="none"/><path d="M314 214 q14 -14 28 0" stroke="#8FA33A" stroke-width="4" fill="none"/></g>
<g><path d="M900 262 h150 l-16 46 h-124z" fill="url(#{p}barrow)"/><path d="M1050 262 q30 -14 60 -8 l-16 8 h-44z" fill="#3E7A8E"/><path d="M900 262 l-60 -14 l-2 6 l58 12z" fill="#4A3A2A"/><path d="M900 262 l-60 -14 l-2 6 l58 12z" fill="#4A3A2A" transform="translate(0 8)"/><circle cx="1040" cy="316" r="16" fill="#2A2A2A"/><circle cx="1040" cy="316" r="6" fill="#8A8A8A"/><rect x="990" y="308" width="6" height="12" fill="#2A2A2A"/><path d="M900 300 l60 4" stroke="#2A2A2A" stroke-width="3"/></g>
<g fill="#3E2A18" opacity=".6"><ellipse cx="978" cy="262" rx="60" ry="8"/></g>
<g fill="#000" opacity=".1"><ellipse cx="250" cy="316" rx="180" ry="8"/><ellipse cx="980" cy="326" rx="90" ry="8"/></g>
'''
    return _wrap(10, body, defs)


# ───────────────────────── 11  Geometry and the Coordinate Plane: city planner's desk ─────────────────────────
def _b11():
    p = "mb11-"
    defs = (
        _lin(p+"wall", [(0, "#2C343E", None), (1, "#414B58", None)])
        + _lin(p+"desk", [(0, "#5A4028", None), (1, "#2E2014", None)])
        + _rad(p+"lamp", [(0, "#FFF0C8", .9), (.4, "#FFE2A0", .35), (1, "#FFE2A0", 0)], .5, .2, .6)
        + _lin(p+"paper", [(0, "#EFE2C2", None), (1, "#D9C89E", None)])
        + f'<pattern id="{p}streets" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="none" stroke="#8A7A58" stroke-width="1.6"/></pattern>'
        + _lin(p+"scroll", [(0, "#E9D6A6", None), (1, "#C8B07A", None)])
    )
    rose = "".join(f'<path d="M0 0 L{6 * math.cos(math.radians(a - 45)):.1f} {6 * math.sin(math.radians(a - 45)):.1f} L{36 * math.cos(math.radians(a)):.1f} {36 * math.sin(math.radians(a)):.1f} L{6 * math.cos(math.radians(a + 45)):.1f} {6 * math.sin(math.radians(a + 45)):.1f}z" fill="{"#2E2014" if i % 2 else "#EFE2C2"}" stroke="#2E2014" stroke-width="1"/>' for i, a in enumerate((270, 0, 90, 180)))
    rose2 = "".join(f'<path d="M0 0 L{4 * math.cos(math.radians(a - 45)):.1f} {4 * math.sin(math.radians(a - 45)):.1f} L{20 * math.cos(math.radians(a)):.1f} {20 * math.sin(math.radians(a)):.1f} L{4 * math.cos(math.radians(a + 45)):.1f} {4 * math.sin(math.radians(a + 45)):.1f}z" fill="#8A7A58" stroke="#2E2014" stroke-width=".8"/>' for a in (315, 45, 135, 225))
    pticks = "".join(f'<path d="M{86 * math.cos(math.radians(a)):.1f} {-86 * math.sin(math.radians(a)):.1f} L{(74 if a % 30 == 0 else 80) * math.cos(math.radians(a)):.1f} {-(74 if a % 30 == 0 else 80) * math.sin(math.radians(a)):.1f}"/>' for a in range(0, 181, 10))
    blocks = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" opacity=".7"/>' for x, y, w, h, c in ((300, 176, 44, 44, "#7CA65A"), (432, 220, 88, 44, "#7CA65A"), (388, 132, 44, 44, "#C9A66A"), (256, 264, 44, 44, "#7CA65A"), (520, 176, 44, 44, "#C9A66A")))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<ellipse cx="900" cy="110" rx="420" ry="260" fill="url(#{p}lamp)"/>
<rect x="60" y="40" width="200" height="140" fill="#1F262E"/><rect x="70" y="50" width="180" height="120" fill="#2A3340"/><g stroke="#4A5866" stroke-width="1.5" opacity=".8">{"".join(f'<path d="M{x} 50 v120"/>' for x in range(90, 250, 20))}{"".join(f'<path d="M70 {y} h180"/>' for y in range(70, 170, 20))}</g><path d="M70 100 q60 -20 90 20 q40 30 90 10" stroke="#6E9BC0" stroke-width="5" fill="none" opacity=".7"/>
<path d="M0 222 H1200 V420 H0z" fill="url(#{p}desk)"/><path d="M0 222 h1200 v4 H0z" fill="#8A6438" opacity=".6"/>
<g transform="rotate(-3 460 230)"><rect x="140" y="120" width="640" height="220" fill="url(#{p}paper)"/><rect x="140" y="120" width="640" height="220" fill="url(#{p}streets)"/>
<path d="M140 250 q80 -50 180 -20 q100 40 200 -10 q120 -40 260 20 v40 q-140 -50 -260 -10 q-100 40 -200 0 q-100 -40 -180 10z" fill="#7FA6C4" opacity=".75"/>{blocks}
<g stroke="#2E2014" stroke-width="3" opacity=".8" fill="none"><path d="M228 120 v220"/><path d="M140 208 h640"/><path d="M580 120 v220"/></g>
<g transform="translate(700 172)">{rose2}{rose}<circle r="4" fill="#2E2014"/></g>
<rect x="140" y="120" width="640" height="220" fill="none" stroke="#8A7A58" stroke-width="2"/></g>
<g fill="#C9A66A"><circle cx="150" cy="128" r="5"/><circle cx="774" cy="118" r="5"/><circle cx="140" cy="342" r="5"/></g>
<g transform="translate(900 300) rotate(-10)"><path d="M-86 0 A86 86 0 0 1 86 0z" fill="#E8EEF4" opacity=".55"/><path d="M-86 0 A86 86 0 0 1 86 0z" fill="none" stroke="#3A4450" stroke-width="2.5"/><path d="M-50 0 A50 50 0 0 1 50 0" fill="none" stroke="#3A4450" stroke-width="1.5"/><circle r="5" fill="none" stroke="#3A4450" stroke-width="2"/><g stroke="#3A4450" stroke-width="1.5">{pticks}</g><path d="M-86 0 h172" stroke="#3A4450" stroke-width="2.5"/></g>
<g transform="translate(1040 190) rotate(8)"><rect x="-30" y="-56" width="150" height="112" fill="url(#{p}scroll)"/><path d="M-10 -30 q40 20 60 10 q30 -10 50 20" stroke="#8A5A28" stroke-width="2" stroke-dasharray="6 5" fill="none"/><path d="M92 -6 l16 16 M108 -6 l-16 16" stroke="#B7402C" stroke-width="4"/><path d="M-6 -40 l14 10 l-6 10 l-12 -8z" fill="#7CA65A" opacity=".8"/><rect x="-40" y="-64" width="20" height="128" rx="10" fill="#C8B07A"/><rect x="110" y="-64" width="20" height="128" rx="10" fill="#C8B07A"/><ellipse cx="-30" cy="-64" rx="10" ry="4" fill="#E9D6A6"/><ellipse cx="120" cy="-64" rx="10" ry="4" fill="#E9D6A6"/></g>
<g><rect x="1060" y="40" width="10" height="190" fill="#2A2A2A"/><path d="M1064 60 l-100 60 l6 6 l100 -60z" fill="#2A2A2A"/><path d="M930 130 l60 -30 l40 -20 l-14 40 l-70 30z" fill="#3A3A3A"/><path d="M890 132 h120 l-20 -26 h-80z" fill="#C9A66A"/><path d="M896 132 h108 l-10 -4 h-88z" fill="#FFF0C8"/><rect x="1030" y="226" width="80" height="10" rx="3" fill="#2A2A2A"/></g>
<g transform="translate(380 372) rotate(-18)"><rect x="-70" y="-5" width="140" height="10" fill="#E2B93B"/><path d="M70 -5 l16 5 l-16 5z" fill="#F1CE93"/><path d="M82 -1 l6 1 l-6 1z" fill="#2A2A2A"/><rect x="-80" y="-5" width="12" height="10" fill="#E88A8A"/></g>
<g><path d="M60 300 h70 v50 q0 8 -8 8 h-54 q-8 0 -8 -8z" fill="#3A4450"/><path d="M130 312 q24 -4 24 18 q0 18 -24 16" stroke="#3A4450" stroke-width="6" fill="none"/><ellipse cx="95" cy="300" rx="35" ry="8" fill="#5A6674"/></g>
<path d="M0 226 H1200 V232 H0z" fill="#000" opacity=".15"/>
'''
    return _wrap(11, body, defs)


# ───────────────────────── 12  Ratios, Rates and Proportions: grocery aisle ─────────────────────────
def _b12():
    p = "mb12-"
    defs = (
        _lin(p+"ceil", [(0, "#F7FAFB", None), (1, "#DCE6EA", None)])
        + _lin(p+"floor", [(0, "#E9EEF0", None), (1, "#B9C4CA", None)])
        + _lin(p+"shelf", [(0, "#D8DEE2", None), (1, "#A9B4BA", None)])
        + _rad(p+"lite", [(0, "#FFFFFF", .9), (1, "#FFFFFF", 0)])
        + _lin(p+"cart", [(0, "#8A96A0", None), (1, "#5A6670", None)])
        + f'<pattern id="{p}mesh" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0 h10 M0 0 v10" stroke="#C9D2D8" stroke-width="1.2" fill="none"/></pattern>'
    )
    T, C = "#2FA7A0", "#F0725A"
    def shelfside(left):
        out = []
        for k, (yf, yb, kind) in enumerate(((150, 176, "big"), (222, 206, "small"), (294, 236, "mix"))):
            X = (lambda t: t * 400) if left else (lambda t: 1200 - t * 400)
            sy = lambda t: yf + (yb - yf) * t
            out.append(f'<path d="M{X(0):.0f} {yf} L{X(1):.0f} {yb} v7 L{X(0):.0f} {yf + 10}z" fill="url(#{p}shelf)"/>')
            for j in range(7):
                t = .06 + j * .13
                sc = 1 - .48 * t
                big = kind == "big" or (kind == "mix" and j % 2 == 0)
                w = (38 if big else 24) * sc
                h = (58 if big else 34) * sc
                col = T if (j + k) % 2 == 0 else C
                x = X(t) - (0 if left else w)
                y = sy(t)
                out.append(f'<rect x="{x:.0f}" y="{y - h:.0f}" width="{w:.0f}" height="{h:.0f}" rx="1" fill="{col}"/><rect x="{x + w * .2:.0f}" y="{y - h * .75:.0f}" width="{w * .6:.0f}" height="{h * .22:.0f}" fill="#FFFFFF" opacity=".8"/>')
        return "".join(out)
    tag = '<g transform="translate(150 232) rotate(6)"><path d="M0 0 h56 l12 14 l-12 14 h-56z" fill="#FFF7D6" stroke="#B9A24A" stroke-width="1.5"/><circle cx="58" cy="14" r="3" fill="#B9A24A"/><rect x="8" y="6" width="34" height="6" fill="#F0725A"/><rect x="8" y="16" width="24" height="5" fill="#2A2A2A" opacity=".6"/></g>'
    star = "".join(f'{(600 + (52 if i % 2 == 0 else 34) * math.cos(math.radians(i * 15))):.1f} {(120 + (52 if i % 2 == 0 else 34) * math.sin(math.radians(i * 15))):.1f}' for i in range(24))
    tiles = "".join(f'<path d="M{x} 300 L{600 + (x - 600) * 3:.0f} 420" stroke="#A9B4BA" stroke-width="1.2" opacity=".7"/>' for x in range(400, 801, 40))
    body = f'''
<rect width="{W}" height="{H}" fill="#EEF3F5"/>
<path d="M0 0 H1200 V300 H0z" fill="url(#{p}ceil)"/>
<g fill="#FFFFFF"><rect x="440" y="36" width="320" height="10" rx="4"/><rect x="480" y="76" width="240" height="8" rx="4"/><rect x="510" y="108" width="180" height="6" rx="3"/></g><ellipse cx="600" cy="40" rx="260" ry="50" fill="url(#{p}lite)" opacity=".6"/>
<path d="M400 190 H800 V300 H400z" fill="#D5DEE2"/><g>{"".join(f'<rect x="{x}" y="{y}" width="26" height="30" fill="{C if (x // 30 + y // 30) % 2 else T}"/>' for y, xs in ((266, range(504, 700, 30)), (234, range(534, 670, 30)), (202, range(564, 640, 30))) for x in xs)}</g>
<path d="M400 300 H800 V420 H400z" fill="url(#{p}floor)"/><path d="M0 300 L400 300 L400 420 H0z M800 300 H1200 V420 H800z" fill="url(#{p}floor)"/>
{tiles}<path d="M400 300 L0 420 M800 300 L1200 420" stroke="#A9B4BA" stroke-width="1.5"/>
<path d="M0 60 L400 160 V240 L0 300z" fill="#CFD8DD"/><path d="M1200 60 L800 160 V240 L1200 300z" fill="#CFD8DD"/><path d="M0 60 L400 160 M1200 60 L800 160" stroke="#A9B4BA" stroke-width="3"/>
{shelfside(True)}{shelfside(False)}
<path d="M0 300 L400 240 v8 L0 316z M1200 300 L800 240 v8 L1200 316z" fill="#8A96A0"/>
{tag}
<path d="M600 46 v22" stroke="#8A96A0" stroke-width="1.5"/><polygon points="{star}" fill="{C}"/><polygon points="{star}" fill="none" stroke="#C94F3A" stroke-width="2" transform="translate(600 120) scale(.72) translate(-600 -120)"/><rect x="574" y="112" width="52" height="16" rx="3" fill="#FFF7D6" opacity=".9"/>
<g transform="translate(640 250)"><path d="M0 0 h150 l-14 70 h-124z" fill="url(#{p}cart)"/><path d="M4 4 h142 l-12 62 h-118z" fill="url(#{p}mesh)"/><path d="M0 0 h150 l-14 70 h-124z" fill="none" stroke="#3A4450" stroke-width="2.5"/><path d="M150 0 l30 -40 h36" stroke="#3A4450" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="204" y="-46" width="30" height="10" rx="5" fill="#F0725A"/><path d="M10 70 l-6 24 M130 70 l8 24" stroke="#3A4450" stroke-width="4"/><circle cx="2" cy="98" r="8" fill="#2A2A2A"/><circle cx="140" cy="98" r="8" fill="#2A2A2A"/><g><rect x="20" y="-30" width="26" height="36" fill="{T}"/><rect x="52" y="-22" width="20" height="28" fill="{C}"/><rect x="78" y="-34" width="30" height="40" fill="{C}"/><rect x="112" y="-18" width="16" height="24" fill="{T}"/></g><path d="M0 0 h150" stroke="#3A4450" stroke-width="3"/></g>
<path d="M0 404 H1200 V420 H0z" fill="#8A96A0" opacity=".25"/>
'''
    return _wrap(12, body, defs)


# ───────────────────────── 13  The Number System: Chicago lakefront in winter ─────────────────────────
def _b13():
    p = "mb13-"
    defs = (
        _lin(p+"sky", [(0, "#6E8FA6", None), (.55, "#B7CAD6", None), (1, "#DDE7EC", None)])
        + _lin(p+"city", [(0, "#4A5866", None), (1, "#2E3A46", None)])
        + _lin(p+"ice", [(0, "#DCE9F0", None), (.5, "#BFD5E0", None), (1, "#8FB0C2", None)])
        + _lin(p+"snow", [(0, "#FFFFFF", None), (1, "#D7E3EA", None)])
        + _lin(p+"post", [(0, "#6A5440", None), (1, "#3E3024", None)])
        + _lin(p+"merc", [(0, "#E8473A", None), (1, "#A82A22", None)])
    )
    S = "#4A5866"
    ticks = "".join(f'<path d="M{212 if i % 5 else 206} {150 + i * 8} h{8 if i % 5 else 14}"/>' for i in range(0, 21))
    ticks_l = "".join(f'<path d="M{188 if i % 5 else 194} {150 + i * 8} h{8 if i % 5 else 14}" transform="translate(-14 0)"/>' for i in range(0, 21))
    slabs = "".join(f'<path d="{d}" fill="#EAF2F6" opacity=".85"/>' for d in ("M300 300 l90 -6 l30 12 l-70 10z", "M520 320 l110 -4 l20 14 l-100 8z", "M760 296 l80 -8 l40 10 l-60 12z", "M980 318 l90 -10 l60 12 l-80 10z", "M120 340 l100 -6 l40 14 l-110 8z"))
    cracks = '<g stroke="#8FB0C2" stroke-width="1.5" fill="none" opacity=".7"><path d="M420 290 l60 20 l90 -6 l50 18"/><path d="M700 280 l40 24 l80 -4"/><path d="M880 296 l60 14 l60 -10"/></g>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#C9D6DE" opacity=".7"><ellipse cx="300" cy="70" rx="200" ry="16"/><ellipse cx="900" cy="50" rx="180" ry="14"/><ellipse cx="620" cy="100" rx="140" ry="10"/></g>
<g fill="url(#{p}city)">
<rect x="330" y="176" width="40" height="64"/><rect x="380" y="150" width="30" height="90"/><rect x="420" y="190" width="50" height="50"/>
<rect x="490" y="140" width="28" height="100"/><rect x="522" y="110" width="30" height="130"/><rect x="556" y="72" width="34" height="168"/><rect x="594" y="96" width="24" height="144"/>
<rect x="560" y="40" width="4" height="34"/><rect x="580" y="30" width="4" height="44"/>
<rect x="640" y="150" width="46" height="90"/><rect x="700" y="120" width="26" height="120"/><rect x="730" y="150" width="22" height="90"/><rect x="760" y="92" width="18" height="148"/><path d="M760 92 h18 l-3 -30 h-12z"/><rect x="767" y="20" width="3" height="42"/>
<rect x="800" y="130" width="40" height="110"/><rect x="850" y="160" width="60" height="80"/><path d="M930 240 v-150 l14 -24 l14 24 v150z"/><rect x="936" y="40" width="3" height="28"/><rect x="948" y="40" width="3" height="28"/>
<rect x="970" y="180" width="40" height="60"/><rect x="1020" y="196" width="80" height="44"/><rect x="1120" y="186" width="60" height="54"/><rect x="0" y="210" width="330" height="30"/><rect x="60" y="188" width="60" height="30"/>
</g>
<g fill="#E9C46A" opacity=".6">{"".join(f'<rect x="{x}" y="{y}" width="3" height="4"/>' for x, y in ((566, 120), (574, 150), (530, 160), (610, 180), (650, 200), (708, 170), (764, 140), (812, 180), (870, 200), (990, 210), (1050, 220), (345, 200)))}</g>
<path d="M0 240 H1200 V420 H0z" fill="url(#{p}ice)"/><path d="M0 240 h1200 v3 H0z" fill="#F4F8FA"/>
{slabs}{cracks}
<g fill="#F4F8FA" opacity=".5"><ellipse cx="500" cy="262" rx="200" ry="6"/><ellipse cx="900" cy="270" rx="160" ry="5"/></g>
<path d="M0 350 q200 -30 400 -10 q200 -22 420 0 q200 -16 380 10 V420 H0z" fill="url(#{p}snow)"/>
<g fill="#D7E3EA"><ellipse cx="640" cy="360" rx="100" ry="10"/><ellipse cx="1000" cy="380" rx="120" ry="12"/></g>
<g fill="{S}"><circle cx="760" cy="300" r="6"/><path d="M754 306 q6 -4 12 0 l4 30 h-6 l-4 -16 l-4 16 h-6z"/><path d="M766 314 l6 -6 l4 4 l-8 8z"/><circle cx="792" cy="326" r="4"/><path d="M782 330 h14 l4 8 h-6 l-2 -4 h-8 l-2 4 h-4z"/></g><path d="M770 318 l16 8" stroke="{S}" stroke-width="1.5"/>
<path d="M760 322 q-6 -6 -14 -2" stroke="#B7402C" stroke-width="3" fill="none"/>
<rect x="184" y="120" width="32" height="240" fill="url(#{p}post)"/><path d="M178 116 h44 v8 h-44z" fill="#2E2418"/><path d="M178 116 h44 l-4 -6 h-36z" fill="#F4F8FA"/>
<rect x="168" y="136" width="64" height="200" rx="6" fill="#F4F1E8"/><rect x="168" y="136" width="64" height="200" rx="6" fill="none" stroke="#3E3024" stroke-width="2"/>
<g stroke="#2E2418" stroke-width="1.5">{ticks}{ticks_l}</g><path d="M176 230 h48" stroke="#2E3A46" stroke-width="3"/>
<rect x="196" y="150" width="8" height="160" rx="4" fill="#E2E6EA"/><rect x="196" y="262" width="8" height="48" fill="url(#{p}merc)"/><circle cx="200" cy="316" r="13" fill="url(#{p}merc)"/>
<path d="M172 316 q28 10 56 0 v22 h-56z" fill="#F4F8FA" opacity=".8"/>
{_dots(23, 70, 400, "#FFFFFF", ".85", 0, 1200, 0, 1.0)}
<g fill="#FFFFFF" opacity=".5"><path d="M0 250 q40 -8 80 0 q40 -6 100 4 v6 H0z"/></g>
'''
    return _wrap(13, body, defs)


# ───────────────────────── 14  Expressions, Equations and Inequalities: brass balance ─────────────────────────
def _b14():
    p = "mb14-"
    defs = (
        _lin(p+"wall", [(0, "#1B2A48", None), (1, "#10203A", None)])
        + _lin(p+"board", [(0, "#22322C", None), (1, "#182620", None)])
        + _lin(p+"table", [(0, "#3A404C", None), (.06, "#2C323E", None), (1, "#181C26", None)])
        + _lin(p+"brass", [(0, "#F1D27A", None), (.5, "#C99A3A", None), (1, "#8E651E", None)])
        + _lin(p+"brassv", [(0, "#F1D27A", None), (.5, "#C99A3A", None), (1, "#8E651E", None)], 0, 0, 1, 0)
        + _rad(p+"pan", [(0, "#F6DE96", 1), (.7, "#C99A3A", 1), (1, "#8E651E", 1)], .4, .3, .7)
        + f'<pattern id="{p}grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 0 h30 M0 0 v30" stroke="#E8EEE6" stroke-width="1" opacity=".12" fill="none"/></pattern>'
        + _rad(p+"screen", [(0, "#BFE6FF", 1), (1, "#4A8FBF", 1)], .3, .2, .9)
    )
    def block(x, y, s, top, left, right):
        h = s * .5
        return (f'<path d="M{x} {y} l{s} -{h:.0f} l{s} {h:.0f} l-{s} {h:.0f}z" fill="{top}"/>'
                f'<path d="M{x} {y} l{s} {h:.0f} v{s} l-{s} -{h:.0f}z" fill="{left}"/>'
                f'<path d="M{x + s} {y + h:.0f} l{s} -{h:.0f} v{s} l-{s} {h:.0f}z" fill="{right}"/>')
    marks = "".join(f'<path d="M{600 + (i - 4) * 9} 96 v{10 if i == 4 else 6}"/>' for i in range(9))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="290" y="30" width="720" height="210" fill="#5A4028"/><rect x="300" y="40" width="700" height="190" fill="url(#{p}board)"/><rect x="300" y="40" width="700" height="190" fill="url(#{p}grid)"/>
<g fill="#FFFFFF" opacity=".06"><ellipse cx="430" cy="120" rx="90" ry="40"/><ellipse cx="860" cy="170" rx="80" ry="34"/></g>
<g fill="none" stroke="#E8EEE6" stroke-width="2" opacity=".5"><path d="M340 92 h60 M370 76 v32"/><path d="M420 92 h60"/><path d="M500 92 h60 M530 76 v32"/><path d="M580 92 h60 M580 100 h60"/><path d="M660 92 h60"/><path d="M340 160 h80 M340 172 h80"/><path d="M440 166 h40"/><path d="M500 152 l60 14 l-60 14"/><path d="M580 166 h60"/><path d="M880 80 h40 M900 60 v40"/><path d="M880 140 h40"/></g>
<rect x="290" y="240" width="720" height="10" fill="#8A6438"/><g fill="#F4F1E8"><rect x="340" y="234" width="28" height="6" rx="2"/><rect x="378" y="234" width="20" height="6" rx="2"/></g><rect x="900" y="232" width="50" height="8" rx="2" fill="#4A3A2A"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}table)"/><path d="M0 262 h1200 v4 H0z" fill="#5A6070" opacity=".6"/>
<g fill="#000" opacity=".3"><ellipse cx="600" cy="286" rx="220" ry="12"/><ellipse cx="1010" cy="292" rx="70" ry="8"/></g>
<rect x="500" y="244" width="200" height="20" rx="4" fill="url(#{p}brass)"/><rect x="520" y="236" width="160" height="10" rx="3" fill="url(#{p}brass)"/>
<rect x="592" y="70" width="16" height="170" fill="url(#{p}brassv)"/><path d="M600 60 l-14 30 h28z" fill="url(#{p}brass)"/>
<path d="M556 96 A48 48 0 0 1 644 96" fill="none" stroke="#F1D27A" stroke-width="2"/><g stroke="#F1D27A" stroke-width="1.5">{marks}</g>
<path d="M380 84 h440 l0 8 h-440z" fill="url(#{p}brass)"/><rect x="376" y="80" width="14" height="16" rx="3" fill="url(#{p}brass)"/><rect x="810" y="80" width="14" height="16" rx="3" fill="url(#{p}brass)"/>
<circle cx="600" cy="88" r="9" fill="url(#{p}brass)"/><path d="M600 88 v18 l-4 12 h8 l-4 -12" fill="#F1D27A"/>
<g stroke="#C99A3A" stroke-width="1.8" fill="none"><path d="M383 92 L346 206 M383 92 L420 206"/><path d="M817 92 L780 206 M817 92 L854 206"/></g>
<g stroke="#8E651E" stroke-width="1.2" stroke-dasharray="2 3" fill="none"><path d="M383 92 L346 206 M383 92 L420 206 M817 92 L780 206 M817 92 L854 206"/></g>
<ellipse cx="383" cy="214" rx="66" ry="12" fill="url(#{p}pan)"/><path d="M317 214 a66 12 0 0 0 132 0 v4 a66 12 0 0 1 -132 0z" fill="#8E651E"/>
<ellipse cx="817" cy="214" rx="66" ry="12" fill="url(#{p}pan)"/><path d="M751 214 a66 12 0 0 0 132 0 v4 a66 12 0 0 1 -132 0z" fill="#8E651E"/>
{block(346, 186, 22, "#F1D27A", "#8E651E", "#C99A3A")}{block(392, 190, 22, "#F1D27A", "#8E651E", "#C99A3A")}{block(370, 166, 22, "#F1D27A", "#8E651E", "#C99A3A")}
<path d="M786 210 q-16 -40 8 -60 q4 -10 24 -10 q20 0 24 10 q24 20 8 60z" fill="#7A6A9E"/><path d="M790 210 q-14 -36 8 -56 q4 -8 20 -8 q6 40 -4 64z" fill="#9A8ABE" opacity=".6"/><path d="M806 150 q12 -4 24 0" stroke="#4A3A6A" stroke-width="5" stroke-linecap="round"/><path d="M810 148 l-8 -14 l8 8 l6 -10 l0 12" stroke="#4A3A6A" stroke-width="2" fill="none"/>
<g transform="translate(1010 270) rotate(-12)"><rect x="-40" y="-70" width="80" height="140" rx="10" fill="#1A1D26"/><rect x="-40" y="-70" width="80" height="140" rx="10" fill="none" stroke="#5A6070" stroke-width="2"/><rect x="-33" y="-60" width="66" height="120" rx="4" fill="url(#{p}screen)"/><g fill="#FFFFFF" opacity=".8"><rect x="-26" y="-50" width="20" height="4" rx="2"/><rect x="-26" y="-38" width="44" height="4" rx="2"/><rect x="-26" y="-26" width="32" height="4" rx="2"/><rect x="-26" y="-14" width="52" height="4" rx="2"/></g><circle cx="0" cy="-66" r="2" fill="#5A6070"/></g>
<g fill="#F4F1E8"><rect x="140" y="252" width="30" height="7" rx="2"/><rect x="180" y="254" width="22" height="7" rx="2" fill="#E88A8A"/></g>
<g><rect x="80" y="230" width="150" height="30" rx="3" fill="#3E2A18"/><rect x="80" y="226" width="150" height="8" rx="2" fill="#5A4028"/><g fill="url(#{p}brass)"><rect x="92" y="236" width="12" height="18"/><rect x="110" y="238" width="10" height="16"/><rect x="126" y="240" width="8" height="14"/><rect x="140" y="242" width="7" height="12"/><rect x="153" y="244" width="6" height="10"/></g></g>
'''
    return _wrap(14, body, defs)


_BUILDERS = {1: _b1, 2: _b2, 3: _b3, 4: _b4, 5: _b5, 6: _b6, 7: _b7, 8: _b8, 9: _b9, 10: _b10, 11: _b11, 12: _b12, 13: _b13, 14: _b14}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (1..14)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    for n in range(1, 15):
        print(n, len(BANNERS[n].encode("utf-8")), "bytes")
