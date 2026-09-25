"""Unit banners for the Family & Consumer Sciences course, units 11-20 (6-8, 9-10, 11-12).

Ten drawn, layered scenes of kitchens, sewing tables, stores, homes and
classrooms as inline SVG.  Stdlib only.

    from banners_fcs_b import BANNERS, CREDITS, banner
    banner(13)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"fb{n}-" so all FCS banners can sit on one contents page.
No text, no images, no external references, no feTurbulence.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm and the action sits in the
upper 55%.
"""

W, H = 1200, 420

CREDITS = {
    11: "Drawn scene: a sunny kitchen counter with nested measuring cups, a row of measuring spoons, a glass liquid cup, a kitchen scale and a bowl of flour beside a recipe card",
    12: "Drawn scene: a hand-sewing table with a practice square of stitches under a lamp, a tomato pincushion, spools of thread, scissors and a scatter of buttons",
    13: "Drawn scene: a classroom sewing machine feeding blue fabric under the needle, a bobbin and spool on top, a finished drawstring bag and a seam gauge beside it",
    14: "Drawn scene: a fabric store wall of colorful bolts with a cutting counter, a pattern envelope, a tape measure and pinking shears",
    15: "Drawn scene: a kitchen range with a simmering pot, a skillet over a blue flame and an oven window glowing on a tray of roasting vegetables",
    16: "Drawn scene: a kitchen table with a plate divided into food groups, a glass of water, a bowl of fruit, paper grocery bags and a week planner pinned to the wall",
    17: "Drawn scene: a food-science lab bench with a muffin tin, a whisk in a bowl, jars of flour and sugar, a beaker, a thermometer and six cookies on a rack",
    18: "Drawn scene: a warm living room with a toddler stacking blocks on a rug, a crib, a rocking chair, a picture book and a small plant by the window",
    19: "Drawn scene: a first apartment on moving day with stacked boxes, a set of keys, a lamp, a laptop, a jar of coins and a window onto the street",
    20: "Drawn scene: a long dinner table set for twelve with candles and plates under string lights, a young cook presenting a dish and a dress form wearing a sewn piece",
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


def _wrap(n, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[n]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


def _person(x, y, s, c, arm=None):
    """Simple silhouette figure standing with feet at (x, y), scale s."""
    a = ""
    if arm == "present":
        a = f'<path d="M{x+6*s:.0f} {y-50*s:.0f} l{22*s:.0f} {-(6*s):.0f} l{2*s:.0f} {5*s:.0f} l{-(22*s):.0f} {8*s:.0f}z"/>'
    return (f'<g fill="{c}"><circle cx="{x}" cy="{y-70*s:.0f}" r="{9*s:.1f}"/>'
            f'<path d="M{x-9*s:.0f} {y-58*s:.0f} q{9*s:.0f} -4 {18*s:.0f} 0 l{3*s:.0f} {30*s:.0f} l{-(3*s):.0f} {28*s:.0f} h{-(6*s):.0f} l{-(3*s):.0f} {-(22*s):.0f} l{-(3*s):.0f} {22*s:.0f} h{-(6*s):.0f} l{-(3*s):.0f} {-(28*s):.0f}z"/>{a}</g>')


def _tiles(y0, y1, step, color, op=".35"):
    """Backsplash / floor grid lines."""
    out = [f'<path d="M0 {y} H{W}" stroke="{color}" stroke-width="1.5" opacity="{op}"/>' for y in range(y0, y1, step)]
    out += [f'<path d="M{x} {y0} V{y1}" stroke="{color}" stroke-width="1.5" opacity="{op}"/>' for x in range(0, W + 1, step)]
    return "".join(out)


def _spool(x, y, c, s=1.0):
    w, h = 22 * s, 30 * s
    return (f'<g><rect x="{x-w/2:.0f}" y="{y-h:.0f}" width="{w:.0f}" height="{h:.0f}" fill="{c}"/>'
            f'<rect x="{x-w/2-3:.0f}" y="{y-h-4:.0f}" width="{w+6:.0f}" height="5" rx="1" fill="#D9C4A0"/>'
            f'<rect x="{x-w/2-3:.0f}" y="{y-1:.0f}" width="{w+6:.0f}" height="5" rx="1" fill="#D9C4A0"/>'
            + "".join(f'<path d="M{x-w/2:.0f} {y-h+4+i*4:.0f} h{w:.0f}" stroke="#000" stroke-width="0.8" opacity=".18"/>' for i in range(int(h//4)-1)) + '</g>')


def _button(x, y, r, c, holes=4):
    hs = r * .28
    if holes == 4:
        h = "".join(f'<circle cx="{x+dx*hs:.1f}" cy="{y+dy*hs:.1f}" r="{r*.13:.1f}" fill="#3A2A20"/>' for dx, dy in [(-1, -1), (1, -1), (-1, 1), (1, 1)])
    else:
        h = "".join(f'<circle cx="{x+dx*hs:.1f}" cy="{y:.1f}" r="{r*.13:.1f}" fill="#3A2A20"/>' for dx in (-1, 1))
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/><circle cx="{x}" cy="{y}" r="{r*.75:.1f}" fill="none" stroke="#000" stroke-width="1" opacity=".18"/>{h}'


def _stitch_row(x0, y, x1, c, dash="10 6", w=2.5):
    return f'<path d="M{x0} {y} H{x1}" stroke="{c}" stroke-width="{w}" stroke-dasharray="{dash}" stroke-linecap="round" fill="none"/>'


# ───────────────────────── 11  Measuring and Reading a Recipe: the counter ─────────────────────────
def _b11():
    p = "fb11-"
    defs = (_lin(p+"wall", [(0, "#F6E7C8", None), (1, "#EED6A8", None)])
            + _lin(p+"counter", [(0, "#E9E2D6", None), (1, "#BFB4A4", None)])
            + _lin(p+"cab", [(0, "#7A4E30", None), (1, "#4E3020", None)])
            + _lin(p+"win", [(0, "#9CD0EE", None), (1, "#DDF0F8", None)])
            + _rad(p+"sun", [(0, "#FFF4C8", .9), (1, "#FFF4C8", 0)]))
    # nested dry measuring cups (steel), largest at back
    cups = ""
    for cx, r, h in [(80, 40, 44), (168, 32, 36), (240, 26, 30), (300, 20, 24)]:
        cups += (f'<path d="M{cx-r} {250-h} h{2*r} l-6 {h} h{-(2*r-12)}z" fill="#C9CDD2"/>'
                 f'<path d="M{cx-r+6} {250-h} h{r-6} v{h-2} h{-(r-10)}z" fill="#fff" opacity=".28"/>'
                 f'<path d="M{cx+r-2} {254-h} h{r+8} v7 h{-(r+8)}z" fill="#A9AEB4"/>'
                 f'<ellipse cx="{cx}" cy="{250-h}" rx="{r}" ry="5" fill="#8E949B"/>'
                 f'<ellipse cx="{cx}" cy="{250-h}" rx="{r-5}" ry="3" fill="#E9EBEE"/>')
    # measuring spoons on a ring
    spoons = "".join(f'<g transform="rotate({a} 420 232)"><path d="M420 232 l0 -70" stroke="#B9BEC5" stroke-width="5" stroke-linecap="round"/>'
                     f'<ellipse cx="420" cy="{232-70-r}" rx="{r}" ry="{r*.7:.0f}" fill="#C9CDD2" stroke="#8E949B" stroke-width="1.5"/></g>'
                     for a, r in [(-38, 14), (-16, 11), (8, 9), (30, 7)])
    # recipe card with ruled lines (no text)
    lines = "".join(f'<path d="M{640} {y} h{wd}" stroke="#7A8A9A" stroke-width="3" stroke-linecap="round"/>' for y, wd in [(118, 120), (140, 180), (156, 160), (172, 190), (188, 150), (204, 170), (220, 130)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{_tiles(0, 250, 40, "#D8BC86", ".5")}
<rect x="900" y="20" width="240" height="180" rx="4" fill="url(#{p}win)"/><g fill="none" stroke="#F8F3E8" stroke-width="10"><rect x="900" y="20" width="240" height="180" rx="4"/><path d="M1020 20 v180 M900 110 h240"/></g>
<circle cx="1000" cy="80" r="140" fill="url(#{p}sun)"/>
<g fill="#5A8A3A"><path d="M930 200 q-6 -60 30 -80 q-6 40 -14 80z"/><path d="M950 200 q10 -50 46 -60 q-20 30 -30 60z"/></g><path d="M916 200 h60 l-6 36 h-48z" fill="#B85A34"/>
<rect x="0" y="250" width="{W}" height="22" fill="url(#{p}counter)"/><rect x="0" y="272" width="{W}" height="148" fill="url(#{p}cab)"/>
<g stroke="#2E1A10" stroke-width="3" fill="none"><rect x="30" y="290" width="330" height="110" rx="3"/><rect x="400" y="290" width="330" height="110" rx="3"/><rect x="770" y="290" width="400" height="110" rx="3"/></g>
<g fill="#D9B46A"><rect x="180" y="330" width="30" height="8" rx="4"/><rect x="550" y="330" width="30" height="8" rx="4"/><rect x="955" y="330" width="30" height="8" rx="4"/></g>
{cups}
{spoons}<circle cx="420" cy="232" r="9" fill="none" stroke="#8E949B" stroke-width="3"/>
<g><path d="M480 170 h90 l8 80 h-106z" fill="#BFE6F4" opacity=".7"/><path d="M480 170 h90 l8 80 h-106z" fill="none" stroke="#5A8AA0" stroke-width="2.5"/><path d="M486 214 h86 l4 36 h-94z" fill="#F4E3B4" opacity=".85"/>{"".join(f'<path d="M{488+i*2} {184+i*16} h14" stroke="#5A8AA0" stroke-width="2"/>' for i in range(4))}<path d="M570 178 q26 4 26 26 q0 10 -10 12" stroke="#5A8AA0" stroke-width="5" fill="none"/></g>
<g><rect x="620" y="100" width="230" height="140" rx="6" fill="#FFFDF5" transform="rotate(-4 735 170)"/><rect x="620" y="100" width="230" height="140" rx="6" fill="none" stroke="#D9C4A0" stroke-width="2" transform="rotate(-4 735 170)"/><g transform="rotate(-4 735 170)">{lines}</g></g>
<g><ellipse cx="760" cy="252" rx="86" ry="14" fill="#8A6A48"/><path d="M674 250 q86 -110 172 0z" fill="#C8783E"/><path d="M690 250 q70 -76 140 0z" fill="#F7F0E0"/><path d="M700 236 q60 -40 120 0" fill="#FFF" opacity=".7"/><rect x="740" y="150" width="8" height="90" rx="3" fill="#6A4A30" transform="rotate(18 744 195)"/></g>
<g><rect x="1000" y="212" width="120" height="40" rx="8" fill="#E4573D"/><rect x="1010" y="196" width="100" height="22" rx="4" fill="#C9CDD2"/><rect x="1028" y="228" width="44" height="14" rx="3" fill="#2A2A2A"/><path d="M1032 235 h8 M1046 235 h8 M1060 235 h8" stroke="#8ED3A0" stroke-width="3"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#1A0E08" opacity=".5"/>
'''
    return _wrap(11, body, defs)


# ───────────────────────── 12  Hand Sewing: the practice square ─────────────────────────
def _b12():
    p = "fb12-"
    defs = (_lin(p+"wall", [(0, "#C9D9CB", None), (1, "#A8BFAA", None)])
            + _lin(p+"table", [(0, "#B8834E", None), (1, "#6A4324", None)])
            + _rad(p+"lamp", [(0, "#FFF0B8", .85), (1, "#FFF0B8", 0)]))
    S = "#3A2A20"
    square = (f'<rect x="440" y="120" width="300" height="150" fill="#F7EFDE" transform="rotate(-6 590 195)"/>'
              f'<g transform="rotate(-6 590 195)">'
              + _stitch_row(460, 142, 720, "#D63A2E", "12 8") + _stitch_row(460, 162, 720, "#2A6ACB", "6 4")
              + _stitch_row(460, 182, 720, "#3E8A34", "14 0")
              + f'<path d="M460 202 {" ".join(f"l8 -10 l8 10" for _ in range(16))}" stroke="#7B4BA8" stroke-width="2.5" fill="none"/>'
              + f'<path d="M460 224 {" ".join(f"l16 0 m-16 0 l0 -10 m0 10 " for _ in range(16))}" stroke="#F4A22E" stroke-width="2.5" fill="none"/>'
              + _stitch_row(460, 244, 720, "#3BB3A6", "4 6")
              + f'<path d="M460 262 {" ".join(f"l8 -8 l8 8" for _ in range(16))}" stroke="#E8488A" stroke-width="2" fill="none"/></g>')
    needle = ('<path d="M690 100 l60 -40" stroke="#B9BEC5" stroke-width="4" stroke-linecap="round"/><ellipse cx="745" cy="63" rx="4" ry="2.5" fill="none" stroke="#7A7F86" stroke-width="1.5" transform="rotate(-34 745 63)"/>'
              '<path d="M746 62 q40 -30 70 10 q10 30 -20 50" stroke="#D63A2E" stroke-width="2" fill="none"/>')
    buttons = "".join(_button(x, y, r, c, h) for x, y, r, c, h in [(930, 214, 13, "#F4B63A", 4), (964, 232, 10, "#5AA0E0", 2), (996, 210, 12, "#E4573D", 4), (1030, 236, 9, "#F7F0E0", 4), (1060, 214, 11, "#3E8A34", 2)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g fill="#F7F0E0" opacity=".6">{"".join(f'<circle cx="{x}" cy="{y}" r="3"/>' for x in range(20, 1200, 60) for y in range(20, 250, 60))}</g>
<g><rect x="1010" y="0" width="14" height="150" fill="{S}"/><path d="M960 150 h114 l20 40 h-154z" fill="#F4A22E"/><rect x="990" y="120" width="54" height="30" fill="{S}"/></g>
<ellipse cx="1040" cy="240" rx="260" ry="120" fill="url(#{p}lamp)"/>
<rect x="0" y="250" width="{W}" height="170" fill="url(#{p}table)"/><rect x="0" y="250" width="{W}" height="6" fill="#D9A46A"/>
<path d="M0 262 h1200 M0 300 h1200" stroke="#4A2A14" stroke-width="1.5" opacity=".4"/>
{square}
{needle}
<g><ellipse cx="200" cy="228" rx="60" ry="42" fill="#D63A2E"/><ellipse cx="180" cy="210" rx="22" ry="14" fill="#fff" opacity=".22"/>{"".join(f'<path d="M{200+dx} 186 q{dx*.4:.0f} 42 0 84" stroke="#A82A20" stroke-width="2" fill="none" opacity=".7"/>' for dx in (-36, -12, 12, 36))}<path d="M190 188 q10 -14 20 0 q-4 -12 -10 -16 q-6 4 -10 16z" fill="#3E8A34"/>
{"".join(f'<path d="M{x} {y} l{dx} {dy}" stroke="#B9BEC5" stroke-width="2.5" stroke-linecap="round"/><circle cx="{x}" cy="{y}" r="4" fill="{c}"/>' for x, y, dx, dy, c in [(170, 178, 10, 24, "#F4B63A"), (206, 174, -2, 26, "#2A6ACB"), (236, 190, -8, 22, "#7B4BA8"), (150, 210, 14, 18, "#3BB3A6")])}</g>
{_spool(320, 250, "#2A6ACB")}{_spool(352, 250, "#E4573D", .9)}{_spool(384, 250, "#F4B63A", 1.05)}
{_spool(300, 214, "#3E8A34", .8)}
<g transform="rotate(-24 850 240)"><path d="M810 250 l90 -20" stroke="#8E949B" stroke-width="7"/><path d="M810 250 l90 -6" stroke="#B9BEC5" stroke-width="7"/><ellipse cx="800" cy="256" rx="16" ry="11" fill="none" stroke="#2A2A2A" stroke-width="6"/><ellipse cx="796" cy="234" rx="16" ry="11" fill="none" stroke="#2A2A2A" stroke-width="6"/></g>
{buttons}
<path d="M0 370 H1200 V420 H0z" fill="#1A0E08" opacity=".5"/>
'''
    return _wrap(12, body, defs)


# ───────────────────────── 13  The Sewing Machine ─────────────────────────
def _b13():
    p = "fb13-"
    defs = (_lin(p+"wall", [(0, "#F1E6D2", None), (1, "#E2CFAE", None)])
            + _lin(p+"table", [(0, "#DCD3C2", None), (1, "#9A8E7A", None)])
            + _lin(p+"mach", [(0, "#F4F1EA", None), (1, "#C9C2B2", None)])
            + _lin(p+"cloth", [(0, "#4A86D8", None), (1, "#2A5AA8", None)]))
    S = "#3A3A44"
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g fill="#D9B46A" opacity=".5"><rect x="40" y="30" width="360" height="12" rx="6"/><rect x="40" y="30" width="6" height="110"/><rect x="394" y="30" width="6" height="110"/></g>
<g><rect x="60" y="42" width="60" height="70" fill="#E8488A"/><rect x="130" y="42" width="60" height="70" fill="#3BB3A6"/><rect x="200" y="42" width="60" height="70" fill="#F4B63A"/><rect x="270" y="42" width="60" height="70" fill="#7B5BC9"/><rect x="340" y="42" width="50" height="70" fill="#E4573D"/></g>
<g fill="#E4573D" opacity=".85"><rect x="880" y="20" width="240" height="160" rx="10" fill="#8A6A48"/><rect x="900" y="36" width="200" height="130" fill="#F7F0E0"/>{"".join(f'<circle cx="{x}" cy="{y}" r="4" fill="#E4573D"/>' for x in range(920, 1090, 30) for y in range(56, 150, 30))}</g>
<rect x="0" y="262" width="{W}" height="158" fill="url(#{p}table)"/><rect x="0" y="262" width="{W}" height="6" fill="#F4EFE4"/>
<g>
<rect x="380" y="228" width="420" height="34" rx="8" fill="url(#{p}mach)"/>
<path d="M420 228 V110 q0 -30 30 -30 h300 q30 0 30 30 v40 h-90 q-22 0 -22 22 v56z" fill="url(#{p}mach)"/>
<path d="M420 228 V110 q0 -30 30 -30 h300 q30 0 30 30 v40 h-90 q-22 0 -22 22 v56z" fill="none" stroke="#9A9488" stroke-width="2"/>
<circle cx="740" cy="116" r="22" fill="#D9D2C2" stroke="#9A9488" stroke-width="2"/><circle cx="740" cy="116" r="6" fill="{S}"/>
<circle cx="480" cy="140" r="18" fill="#D9D2C2" stroke="#9A9488" stroke-width="2"/><path d="M480 128 v12 l8 6" stroke="{S}" stroke-width="3" fill="none"/>
<rect x="560" y="100" width="80" height="14" rx="7" fill="#C9C2B2"/><rect x="600" y="96" width="14" height="22" rx="3" fill="{S}"/>
{_spool(700, 84, "#2A5AA8", .9)}<path d="M700 60 v-24" stroke="#9A9488" stroke-width="4"/>
<path d="M700 60 q-60 -10 -120 20 q-40 20 -100 10 q-16 6 -14 40" stroke="#2A5AA8" stroke-width="2" fill="none"/>
<rect x="608" y="190" width="14" height="30" rx="2" fill="#B9BEC5"/><path d="M615 220 v18" stroke="#7A7F86" stroke-width="3"/><rect x="600" y="230" width="30" height="8" rx="2" fill="#7A7F86"/>
<rect x="590" y="236" width="80" height="6" rx="2" fill="#8E949B"/>{"".join(f'<path d="M{596+i*10} 242 v4" stroke="#7A7F86" stroke-width="2"/>' for i in range(7))}
<path d="M380 242 h420" stroke="#9A9488" stroke-width="1.5" opacity=".6"/>
</g>
<path d="M300 262 h340 v-16 q-140 -6 -260 -10 q-40 4 -80 26z" fill="url(#{p}cloth)"/>
<path d="M240 262 h440 l-20 -22 q-140 -8 -300 -6 q-80 8 -120 28z" fill="url(#{p}cloth)" opacity=".85"/>
<path d="M270 252 h380" stroke="#F7F0E0" stroke-width="2" stroke-dasharray="8 6"/>
<g><path d="M900 262 v-90 q0 -16 20 -20 q60 -16 120 0 q20 4 20 20 v90z" fill="#E4573D"/><path d="M910 200 q60 -14 140 0" stroke="#A82A20" stroke-width="2" fill="none"/><path d="M932 178 q54 -12 108 0" stroke="#F7F0E0" stroke-width="3" fill="none"/><path d="M1038 178 q40 20 20 60" stroke="#F7F0E0" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="1058" cy="238" r="5" fill="#F7F0E0"/><path d="M920 262 h136" stroke="#A82A20" stroke-width="3" stroke-dasharray="6 5"/></g>
<g transform="rotate(-8 140 236)"><rect x="60" y="230" width="160" height="12" rx="2" fill="#C9CDD2"/>{"".join(f'<path d="M{70+i*15} 230 v{6 if i%2 else 10}" stroke="#3A3A44" stroke-width="1.5"/>' for i in range(10))}<rect x="120" y="222" width="10" height="28" rx="2" fill="#2A6ACB"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#1A1410" opacity=".5"/>
'''
    return _wrap(13, body, defs)


# ───────────────────────── 14  Fabric, Fibers and Patterns: the fabric store ─────────────────────────
def _b14():
    p = "fb14-"
    defs = (_lin(p+"wall", [(0, "#E8DCC6", None), (1, "#CDBFA6", None)])
            + _lin(p+"counter", [(0, "#8A5A34", None), (1, "#4E3020", None)])
            + _lin(p+"floor", [(0, "#B8A88E", None), (1, "#7A6A54", None)]))
    cols = ["#E4573D", "#3BB3A6", "#F4B63A", "#7B5BC9", "#5AA0E0", "#E8488A", "#3E8A34", "#F7F0E0", "#C8783E", "#2A5AA8", "#D63A2E", "#9ADA6A"]
    bolts = ""
    for shelf, y in enumerate((60, 130, 200)):
        for i in range(12):
            x = 20 + i * 74 + (shelf % 2) * 18
            c = cols[(i + shelf * 5) % len(cols)]
            pat = ""
            if (i + shelf) % 3 == 0:
                pat = "".join(f'<circle cx="{x+12+k*14}" cy="{y+10+j*14}" r="2.5" fill="#fff" opacity=".6"/>' for k in range(4) for j in range(4))
            elif (i + shelf) % 3 == 1:
                pat = "".join(f'<path d="M{x+6+k*14} {y+2} v56" stroke="#fff" stroke-width="2" opacity=".4"/>' for k in range(4))
            bolts += (f'<rect x="{x}" y="{y}" width="60" height="60" rx="3" fill="{c}"/>{pat}'
                      f'<path d="M{x} {y+60} h60 v4 h-60z" fill="#000" opacity=".2"/><path d="M{x+4} {y+4} h52" stroke="#fff" stroke-width="2" opacity=".35"/>')
    shelves = "".join(f'<rect x="0" y="{y+62}" width="{W}" height="8" fill="#6A4A30"/>' for y in (60, 130, 200))
    tape = ('<path d="M760 150 q40 -50 90 -10 q40 40 10 90 q-40 40 -80 6" stroke="#F4B63A" stroke-width="14" fill="none" stroke-linecap="round"/>'
            + "".join(f'<path d="M{x} {y} l{dx} {dy}" stroke="#3A2A20" stroke-width="1.5"/>' for x, y, dx, dy in [(776, 138, 4, 6), (792, 128, 2, 7), (810, 126, 0, 7), (828, 130, -2, 7), (846, 146, -6, 4), (860, 170, -7, 0), (858, 196, -6, -3), (842, 220, -4, -6)]))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="0" y="0" width="{W}" height="24" fill="#6A4A30"/><rect x="0" y="24" width="{W}" height="6" fill="#8A6A48"/>
{bolts}{shelves}
<rect x="0" y="280" width="{W}" height="140" fill="url(#{p}floor)"/>
<rect x="500" y="262" width="700" height="24" rx="3" fill="#D9C4A0"/><rect x="500" y="286" width="700" height="134" fill="url(#{p}counter)"/><rect x="500" y="262" width="700" height="4" fill="#F7F0E0"/>
<g><rect x="560" y="110" width="150" height="150" rx="4" fill="#F7F0E0" transform="rotate(4 635 185)"/><g transform="rotate(4 635 185)"><rect x="572" y="122" width="126" height="90" fill="#C9D9E6"/><path d="M600 212 q10 -70 40 -80 q30 -6 34 80z" fill="#E8488A"/><path d="M616 132 l-18 30 h16 z" fill="#E8488A"/><path d="M660 132 l18 30 h-16 z" fill="#E8488A"/><circle cx="640" cy="122" r="8" fill="#8A6A48"/><g fill="#7A8A9A"><rect x="572" y="220" width="60" height="5" rx="2"/><rect x="572" y="232" width="90" height="5" rx="2"/><rect x="572" y="244" width="70" height="5" rx="2"/></g></g></g>
{tape}
<g transform="rotate(-18 1000 220)"><path d="M950 232 h110" stroke="#8E949B" stroke-width="9"/><path d="M950 232 h110" stroke="#B9BEC5" stroke-width="4"/>{"".join(f'<path d="M{958+i*9} 236 l4 -5 l5 5" stroke="#3A2A20" stroke-width="1.5" fill="none"/>' for i in range(11))}<ellipse cx="940" cy="244" rx="16" ry="10" fill="none" stroke="#E4573D" stroke-width="6"/><ellipse cx="936" cy="222" rx="16" ry="10" fill="none" stroke="#E4573D" stroke-width="6"/></g>
<g><path d="M1080 262 v-40 q40 -20 80 0 v40z" fill="#3BB3A6"/><path d="M1080 262 v-30 q40 -14 80 0 v30z" fill="#fff" opacity=".2"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#1A1008" opacity=".5"/>
'''
    return _wrap(14, body, defs)


# ───────────────────────── 15  Cooking Methods and Heat: the range ─────────────────────────
def _b15():
    p = "fb15-"
    defs = (_lin(p+"wall", [(0, "#F0DCC0", None), (1, "#DDBE94", None)])
            + _lin(p+"range", [(0, "#DCE0E4", None), (1, "#9AA0A8", None)])
            + _lin(p+"oven", [(0, "#F4A22E", None), (1, "#8A2A10", None)])
            + _rad(p+"glow", [(0, "#FFD27A", .9), (1, "#FFD27A", 0)])
            + _lin(p+"floor", [(0, "#8A5A34", None), (1, "#3E2616", None)]))
    steam = "".join(f'<path d="M{x} 130 q-14 -24 0 -46 q14 -22 0 -44" stroke="#fff" stroke-width="5" fill="none" opacity="{o}" stroke-linecap="round"/>' for x, o in [(290, .5), (320, .7), (350, .5)])
    flame = "".join(f'<path d="M{x} 250 q-8 -18 0 -30 q8 12 0 30z" fill="#5AA0E0"/><path d="M{x} 250 q-4 -12 0 -18 q4 6 0 18z" fill="#DDF0FF"/>' for x in range(770, 870, 16))
    veg = "".join(f'<rect x="{x}" y="{y}" width="20" height="12" rx="4" fill="{c}"/>' for x, y, c in [(470, 330, "#E4573D"), (500, 326, "#F4A22E"), (530, 332, "#3E8A34"), (560, 328, "#E4573D"), (590, 330, "#F4B63A"), (620, 326, "#7B4BA8"), (650, 332, "#F4A22E"), (485, 348, "#3E8A34"), (515, 346, "#F4B63A"), (545, 350, "#7B4BA8"), (575, 344, "#E4573D"), (605, 348, "#3E8A34"), (635, 346, "#E4573D")])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{_tiles(0, 240, 48, "#B8865A", ".45")}
<path d="M360 0 h480 v70 q-240 40 -480 0z" fill="#7A7F86"/><path d="M360 0 h480 v60 q-240 34 -480 0z" fill="#B9BEC5"/><rect x="380" y="20" width="440" height="6" rx="3" fill="#3A3A44"/>
<g fill="#6A4A30"><rect x="0" y="50" width="300" height="10"/><rect x="900" y="50" width="300" height="10"/></g>
<g stroke="#3A3A44" stroke-width="3" fill="none" stroke-linecap="round"><path d="M60 60 v20"/><path d="M140 60 v20"/><path d="M220 60 v20"/><path d="M980 60 v20"/><path d="M1060 60 v20"/><path d="M1140 60 v20"/></g>
<g><path d="M40 80 h40 v34 q-20 10 -40 0z" fill="#8E949B"/><path d="M120 80 h40 v40 q-20 10 -40 0z" fill="#C8783E"/><path d="M200 80 h40 v30 q-20 10 -40 0z" fill="#8E949B"/><path d="M960 80 h40 v34 q-20 8 -40 0z" fill="#E4573D"/><path d="M1040 80 h40 v40 q-20 8 -40 0z" fill="#8E949B"/><path d="M1120 80 h40 v30 q-20 8 -40 0z" fill="#C8783E"/></g>
<rect x="0" y="240" width="300" height="180" fill="#6A4A30"/><rect x="900" y="240" width="300" height="180" fill="#6A4A30"/><rect x="0" y="236" width="300" height="10" fill="#D9C4A0"/><rect x="900" y="236" width="300" height="10" fill="#D9C4A0"/>
<rect x="300" y="250" width="600" height="170" fill="url(#{p}range)"/><rect x="300" y="250" width="600" height="8" fill="#3A3A44"/>
<g fill="#3A3A44"><ellipse cx="420" cy="252" rx="60" ry="8"/><ellipse cx="780" cy="252" rx="60" ry="8"/><ellipse cx="600" cy="252" rx="50" ry="7"/></g>
<rect x="400" y="290" width="400" height="90" rx="6" fill="#2A2A30"/><rect x="410" y="300" width="380" height="72" rx="4" fill="url(#{p}oven)"/><rect x="410" y="300" width="380" height="72" rx="4" fill="#2A1008" opacity=".35"/>
<ellipse cx="600" cy="336" rx="200" ry="50" fill="url(#{p}glow)"/>
<rect x="440" y="320" width="250" height="40" rx="3" fill="#7A7F86"/>{veg}
<rect x="400" y="378" width="400" height="14" rx="4" fill="#B9BEC5"/>
<g fill="#3A3A44">{"".join(f'<circle cx="{x}" cy="{272}" r="9"/>' for x in (330, 360, 840, 870))}</g>
<g transform="translate(100 0)"><path d="M260 250 v-100 q0 -10 10 -10 h100 q10 0 10 10 v100z" fill="#8E949B"/><path d="M270 150 h100" stroke="#fff" stroke-width="4" opacity=".4"/><rect x="250" y="136" width="140" height="10" rx="5" fill="#3A3A44"/><path d="M278 136 q42 -30 84 0z" fill="#3A3A44"/><circle cx="320" cy="116" r="8" fill="#3A3A44"/>{steam}
<path d="M240 190 h20 v10 h-20z" fill="#3A3A44"/><path d="M380 190 h20 v10 h-20z" fill="#3A3A44"/></g>
{flame}
<g><ellipse cx="820" cy="248" rx="70" ry="10" fill="#2A2A30"/><path d="M750 248 q0 -24 12 -24 h116 q12 0 12 24z" fill="#3A3A44"/><ellipse cx="820" cy="226" rx="66" ry="8" fill="#5A5A64"/><rect x="884" y="220" width="110" height="12" rx="6" fill="#3A3A44"/>
<g fill="#F4A22E"><circle cx="796" cy="226" r="6"/><circle cx="822" cy="224" r="7"/><circle cx="848" cy="226" r="6"/><circle cx="810" cy="230" r="5" fill="#3E8A34"/><circle cx="836" cy="230" r="5" fill="#E4573D"/></g></g>
<path d="M0 370 H1200 V420 H0z" fill="#1A0E08" opacity=".5"/>
'''
    return _wrap(15, body, defs)


# ───────────────────────── 16  Nutrition and Meal Planning: the kitchen table ─────────────────────────
def _b16():
    p = "fb16-"
    defs = (_lin(p+"wall", [(0, "#FBF1DC", None), (1, "#EFD9B4", None)])
            + _lin(p+"table", [(0, "#D9A46A", None), (1, "#8A5A34", None)])
            + _lin(p+"win", [(0, "#8CC8EE", None), (1, "#DDF0F8", None)]))
    grid = "".join(f'<rect x="{62+c*44}" y="{78+r*32}" width="38" height="26" rx="3" fill="{col}" opacity=".9"/>'
                   for r in range(4) for c, col in enumerate(["#E4573D", "#F4B63A", "#3BB3A6", "#7B5BC9", "#5AA0E0", "#E8488A", "#3E8A34"]))
    grid += "".join(f'<path d="M{70+c*44} {90+r*32} h22" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>' for r in range(4) for c in range(7))
    fruit = ('<ellipse cx="960" cy="238" rx="80" ry="22" fill="#5A4A3A"/><path d="M880 236 q80 -20 160 0 q-10 20 -80 26 q-70 -6 -80 -26z" fill="#8A6A48"/>'
             + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for x, y, r, c in [(920, 214, 18, "#E4373D"), (960, 208, 20, "#F4A22E"), (1000, 216, 17, "#7FBF3A"), (940, 192, 16, "#F2D53C"), (980, 190, 15, "#E4373D")])
             + '<path d="M930 172 q20 -14 40 0 q-20 -4 -40 0z" fill="#3E8A34"/>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g transform="translate(0 -30)"><rect x="40" y="50" width="330" height="170" rx="6" fill="#F7F0E0"/><rect x="40" y="50" width="330" height="22" rx="6" fill="#2A5AA8"/><g fill="#F7F0E0">{"".join(f'<rect x="{66+c*44}" y="58" width="30" height="5" rx="2"/>' for c in range(7))}</g>{grid}
<circle cx="205" cy="50" r="7" fill="#E4573D"/></g>
<rect x="800" y="20" width="360" height="150" rx="4" fill="url(#{p}win)"/><g fill="none" stroke="#F8F3E8" stroke-width="10"><rect x="800" y="20" width="360" height="150" rx="4"/><path d="M980 20 v150 M800 95 h360"/></g>
<g fill="#6A9A3A"><path d="M820 150 q60 -60 130 -30 q40 -30 100 0 v20 h-230z" opacity=".7"/></g>
<rect x="0" y="250" width="{W}" height="170" fill="url(#{p}table)"/><rect x="0" y="250" width="{W}" height="6" fill="#F0C890"/>
<g><ellipse cx="560" cy="250" rx="150" ry="52" fill="#E9E2D6"/><ellipse cx="560" cy="250" rx="150" ry="52" fill="none" stroke="#C9BFB0" stroke-width="3"/><ellipse cx="560" cy="248" rx="128" ry="42" fill="#F7F4EE"/>
<path d="M560 248 L432 248 A128 42 0 0 1 560 206z" fill="#3E8A34"/><path d="M560 248 L560 206 A128 42 0 0 1 688 248z" fill="#E4573D"/><path d="M560 248 L688 248 A128 42 0 0 1 560 290z" fill="#C8783E"/><path d="M560 248 L560 290 A128 42 0 0 1 432 248z" fill="#F4B63A"/>
<g fill="#fff" opacity=".2"><circle cx="500" cy="228" r="10"/><circle cx="620" cy="228" r="10"/><circle cx="620" cy="268" r="10"/><circle cx="500" cy="268" r="10"/></g>
<circle cx="560" cy="248" r="6" fill="#F7F4EE"/></g>
<g><circle cx="740" cy="210" r="26" fill="#DDF0F8" stroke="#8A9AA0" stroke-width="3"/><circle cx="740" cy="210" r="18" fill="#fff" opacity=".7"/><circle cx="740" cy="210" r="8" fill="#5AA0E0" opacity=".5"/></g>
<g transform="translate(60 0)"><path d="M300 236 h100 v-80 h-100z" fill="#C8A26A"/><path d="M300 156 h100 l-6 -14 h-88z" fill="#B58E58"/><path d="M320 156 q30 -30 60 0" stroke="#8A6A48" stroke-width="4" fill="none"/><path d="M330 146 q-6 -50 10 -70 q4 30 -2 70z" fill="#3E8A34"/><path d="M360 146 q10 -46 30 -60 q-14 30 -22 60z" fill="#6A9A3A"/><rect x="342" y="120" width="26" height="30" rx="3" fill="#F4A22E"/><rect x="342" y="120" width="26" height="30" rx="3" fill="#fff" opacity=".2"/></g>
<g><path d="M200 246 h90 v-70 h-90z" fill="#B58E58"/><path d="M200 176 h90 l-6 -12 h-78z" fill="#A8804A"/><path d="M220 176 q25 -26 50 0" stroke="#8A6A48" stroke-width="4" fill="none"/><ellipse cx="228" cy="160" rx="16" ry="12" fill="#F7F0E0"/><rect x="252" y="140" width="24" height="26" rx="3" fill="#5AA0E0"/></g>
<g stroke="#8E949B" stroke-width="4" stroke-linecap="round"><path d="M420 250 v-52"/><path d="M416 198 v-14 M424 198 v-14 M420 198 v-16"/><path d="M700 250 v-52"/></g><ellipse cx="700" cy="196" rx="8" ry="12" fill="#8E949B"/>
{fruit}
<path d="M0 370 H1200 V420 H0z" fill="#1A0E08" opacity=".5"/>
'''
    return _wrap(16, body, defs)


# ───────────────────────── 17  Food Science: the lab bench ─────────────────────────
def _b17():
    p = "fb17-"
    defs = (_lin(p+"wall", [(0, "#E6EEF2", None), (1, "#C6D4DC", None)])
            + _lin(p+"bench", [(0, "#2A3A44", None), (1, "#101820", None)])
            + _rad(p+"lamp", [(0, "#FFF6D0", .7), (1, "#FFF6D0", 0)]))
    S = "#2A3A44"
    muffins = "".join(f'<ellipse cx="{x}" cy="{y}" rx="18" ry="8" fill="#5A5A64"/><path d="M{x-18} {y} q0 -30 18 -30 q18 0 18 30z" fill="#C8783E"/><path d="M{x-12} {y-12} q12 -14 24 0" stroke="#F4A22E" stroke-width="3" fill="none"/>'
                      for x, y in [(160, 214), (204, 214), (248, 214), (160, 236), (204, 236), (248, 236)])
    def _chips(x, y):
        return "".join(f'<circle cx="{x+dx}" cy="{y+dy}" r="2.5" fill="#4A2A18"/>' for dx, dy in [(-6, -4), (5, -6), (2, 5), (-4, 6)])
    cookies = "".join(f'<circle cx="{x}" cy="{y}" r="16" fill="{c}"/>{_chips(x, y)}'
                      for x, y, c in [(900, 226, "#E8B86A"), (940, 226, "#DDA85A"), (980, 226, "#C8904A"), (1020, 226, "#B87A38"), (1060, 226, "#A86A2A"), (1100, 226, "#8A5220")])
    jars = "".join(f'<rect x="{x}" y="{170}" width="50" height="80" rx="6" fill="#DDF0F8" opacity=".7"/><rect x="{x+6}" y="{170+lvl}" width="38" height="{78-lvl}" rx="4" fill="{c}"/><rect x="{x-2}" y="{162}" width="54" height="12" rx="3" fill="#8E949B"/><rect x="{x}" y="{170}" width="50" height="80" rx="6" fill="none" stroke="#7A8A9A" stroke-width="2"/>'
                   for x, lvl, c in [(380, 20, "#F7F0E0"), (440, 34, "#EFD9B4"), (500, 14, "#C8783E")])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{_tiles(0, 250, 50, "#9AB0BC", ".35")}
<g><rect x="560" y="20" width="360" height="130" rx="3" fill="#2F5A3A"/><rect x="560" y="20" width="360" height="130" rx="3" fill="none" stroke="#8A6A48" stroke-width="8"/>
<g stroke="#F7F0E0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"><path d="M590 120 L640 70 L690 96 L740 50 L790 80 L840 40 L890 60"/><path d="M590 130 h300"/><path d="M590 130 v-90"/></g>
<g fill="#F7F0E0" opacity=".85">{"".join(f'<circle cx="{x}" cy="{y}" r="4"/>' for x, y in [(640, 70), (690, 96), (740, 50), (790, 80), (840, 40), (890, 60)])}</g></g>
<ellipse cx="600" cy="230" rx="500" ry="80" fill="url(#{p}lamp)"/>
<rect x="0" y="250" width="{W}" height="170" fill="url(#{p}bench)"/><rect x="0" y="250" width="{W}" height="5" fill="#5A6A74"/>
<rect x="130" y="180" width="150" height="70" rx="6" fill="#7A7F86"/><rect x="130" y="180" width="150" height="70" rx="6" fill="none" stroke="#5A5A64" stroke-width="2"/>
{muffins}
{jars}
<g><path d="M640 250 q-40 -60 0 -70 h80 q40 10 0 70z" fill="#E9E2D6"/><path d="M640 250 q-40 -60 0 -70 h80 q40 10 0 70z" fill="none" stroke="#C9BFB0" stroke-width="2"/><path d="M660 186 h44" stroke="#EFD9B4" stroke-width="6"/><path d="M700 184 l30 -70" stroke="#8E949B" stroke-width="4" stroke-linecap="round"/><path d="M700 184 q-14 -20 4 -44 q18 -22 30 -26" stroke="#8E949B" stroke-width="3" fill="none"/><path d="M700 184 q22 -12 30 -34 q6 -22 0 -36" stroke="#8E949B" stroke-width="3" fill="none"/></g>
<g><path d="M780 250 v-60 l-6 -6 v-14 h40 v14 l-6 6 v60z" fill="#DDF0F8" opacity=".75"/><path d="M780 250 v-60 l-6 -6 v-14 h40 v14 l-6 6 v60z" fill="none" stroke="#7A8A9A" stroke-width="2"/><rect x="782" y="214" width="34" height="36" fill="#F4B63A" opacity=".8"/>{"".join(f'<path d="M804 {200+i*10} h8" stroke="#7A8A9A" stroke-width="2"/>' for i in range(4))}</g>
<g transform="rotate(20 850 190)"><rect x="846" y="130" width="8" height="110" rx="4" fill="#DDF0F8" stroke="#7A8A9A" stroke-width="1.5"/><rect x="848" y="180" width="4" height="58" fill="#D63A2E"/><circle cx="850" cy="240" r="7" fill="#D63A2E"/></g>
<rect x="880" y="236" width="240" height="14" rx="3" fill="#8E949B"/>{"".join(f'<path d="M{884+i*16} 236 v14" stroke="#5A5A64" stroke-width="2"/>' for i in range(15))}
{cookies}
<g fill="#F4B63A"><circle cx="1130" cy="190" r="4"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#06090C" opacity=".5"/>
'''
    return _wrap(17, body, defs)


# ───────────────────────── 18  Child Development and Care: the living room ─────────────────────────
def _b18():
    p = "fb18-"
    defs = (_lin(p+"wall", [(0, "#F7E4D0", None), (1, "#EDC9AC", None)])
            + _lin(p+"floor", [(0, "#C8905A", None), (1, "#7A4E2A", None)])
            + _lin(p+"win", [(0, "#9CD0EE", None), (1, "#E4F4FA", None)])
            + _rad(p+"rug", [(0, "#E8A0A0", None), (1, "#C86A6A", None)]))
    boards = "".join(f'<path d="M0 {y} H{W}" stroke="#5A3A1E" stroke-width="1.5" opacity=".35"/>' for y in range(290, 420, 22))
    blocks = "".join(f'<rect x="{x}" y="{y}" width="30" height="30" rx="3" fill="{c}"/><rect x="{x+6}" y="{y+6}" width="18" height="18" rx="2" fill="#fff" opacity=".22"/>'
                     for x, y, c in [(600, 258, "#E4573D"), (632, 258, "#F4B63A"), (612, 228, "#5AA0E0"), (616, 198, "#3E8A34")])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g fill="#F7F0E0" opacity=".4">{"".join(f'<circle cx="{x}" cy="{y}" r="6"/>' for x in range(30, 1200, 70) for y in range(30, 250, 70))}</g>
<rect x="760" y="30" width="260" height="170" rx="4" fill="url(#{p}win)"/><g fill="none" stroke="#F8F3E8" stroke-width="10"><rect x="760" y="30" width="260" height="170" rx="4"/><path d="M890 30 v170 M760 115 h260"/></g>
<path d="M740 20 h20 v190 h-20z M1020 20 h20 v190 h-20z" fill="#F4B63A" opacity=".7"/>
<circle cx="820" cy="80" r="28" fill="#FFF4C8"/>
<rect x="0" y="280" width="{W}" height="140" fill="url(#{p}floor)"/>{boards}
<ellipse cx="620" cy="300" rx="260" ry="46" fill="url(#{p}rug)"/><ellipse cx="620" cy="300" rx="220" ry="34" fill="none" stroke="#F7F0E0" stroke-width="4" opacity=".6"/>
<g><rect x="90" y="130" width="230" height="150" rx="6" fill="#F7F0E0"/>{"".join(f'<rect x="{x}" y="142" width="7" height="126" rx="3" fill="#D9C4A0"/>' for x in range(100, 310, 22))}<rect x="80" y="122" width="250" height="14" rx="6" fill="#D9B46A"/><rect x="80" y="270" width="250" height="12" rx="4" fill="#D9B46A"/><rect x="96" y="130" width="218" height="14" fill="#F4B63A" opacity=".5"/>
<path d="M150 90 q10 20 40 24" stroke="#8E949B" stroke-width="3" fill="none"/><path d="M200 90 q-10 20 -40 24" stroke="#8E949B" stroke-width="3" fill="none"/><rect x="172" y="60" width="6" height="34" fill="#8E949B"/><g><circle cx="150" cy="90" r="10" fill="#F4B63A"/><path d="M190 80 l12 10 l-12 10z" fill="#5AA0E0"/><circle cx="175" cy="52" r="9" fill="#E4573D"/></g></g>
<g><path d="M960 280 q-40 -14 0 -30 h180 q40 16 0 30z" fill="#8A5A34"/><rect x="980" y="150" width="140" height="110" rx="14" fill="#5A8A9A"/><rect x="990" y="230" width="150" height="34" rx="10" fill="#7AA6B4"/><rect x="984" y="170" width="16" height="70" rx="6" fill="#4A7A8A"/><rect x="1122" y="170" width="16" height="70" rx="6" fill="#4A7A8A"/><rect x="1000" y="264" width="10" height="20" fill="#5A3A1E"/><rect x="1118" y="264" width="10" height="20" fill="#5A3A1E"/></g>
<g fill="#F7F0E0"><path d="M420 264 l20 -40 h60 l20 40z"/><path d="M420 264 h100 v-6 h-100z" fill="#E4573D"/></g><g stroke="#D9B46A" stroke-width="3" fill="none"><path d="M446 236 l18 -8 M470 232 l18 -6"/></g>
{blocks}
<g><path d="M640 260 q-8 -30 20 -34 q30 -6 34 30z" fill="#F4B63A"/><circle cx="676" cy="212" r="18" fill="#C68A5A"/><path d="M660 204 q16 -18 32 0 q-4 -10 -16 -12 q-12 2 -16 12z" fill="#3A2A20"/><circle cx="670" cy="212" r="2.2" fill="#111"/><circle cx="682" cy="212" r="2.2" fill="#111"/><path d="M672 220 q4 3 8 0" stroke="#111" stroke-width="1.5" fill="none"/><path d="M652 236 l-22 -12 l4 -6 l24 10z" fill="#C68A5A"/><path d="M696 240 l16 -22 l6 4 l-14 24z" fill="#C68A5A"/><path d="M646 262 q-16 6 -12 14 h34z" fill="#5AA0E0"/><path d="M690 262 q16 6 12 14 h-34z" fill="#5AA0E0"/></g>
<g><rect x="740" y="236" width="44" height="30" rx="4" fill="#7B5BC9"/><rect x="746" y="236" width="18" height="30" fill="#F7F0E0" opacity=".85"/><rect x="766" y="236" width="18" height="30" fill="#F7F0E0" opacity=".85"/><path d="M762 236 v30" stroke="#3A2A20" stroke-width="2"/><circle cx="755" cy="248" r="4" fill="#F4B63A"/><path d="M770 244 h10 M770 252 h10" stroke="#7B5BC9" stroke-width="2"/></g>
<g><path d="M1130 240 h40 l-6 36 h-28z" fill="#B85A34"/><path d="M1150 240 q-30 -30 -14 -60 q14 20 14 60z" fill="#3E8A34"/><path d="M1150 240 q30 -30 14 -60 q-14 20 -14 60z" fill="#5AA046"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#1A0E08" opacity=".5"/>
'''
    return _wrap(18, body, defs)


# ───────────────────────── 19  Independent Living and Money: moving day ─────────────────────────
def _b19():
    p = "fb19-"
    defs = (_lin(p+"wall", [(0, "#E8E4DA", None), (1, "#CFC8BA", None)])
            + _lin(p+"floor", [(0, "#B8865A", None), (1, "#5A3A1E", None)])
            + _lin(p+"street", [(0, "#F5D6A8", None), (.6, "#C8A88A", None), (1, "#8A7A6A", None)])
            + _rad(p+"lamp", [(0, "#FFE7A0", .9), (1, "#FFE7A0", 0)]))
    def box(x, y, w, h, c="#D9A46A"):
        return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="#8A5A34" stroke-width="2"/>'
                f'<path d="M{x+w/2:.0f} {y} v{h}" stroke="#8A5A34" stroke-width="2"/><path d="M{x+w/2-8:.0f} {y+2} h16 v{h-4} h-16z" fill="#C8A26A" opacity=".8"/>'
                f'<path d="M{x+8} {y+14} h{w*.3:.0f}" stroke="#3A2A20" stroke-width="3" stroke-linecap="round"/>')
    coins = "".join(f'<ellipse cx="{x}" cy="{y}" rx="9" ry="4" fill="#F4B63A" stroke="#B8842A" stroke-width="1"/>' for x, y in [(850, 236), (866, 232), (842, 226), (860, 220), (852, 212), (870, 244), (846, 246), (862, 206)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="0" y="150" width="{W}" height="6" fill="#B8B0A0"/>
<rect x="700" y="20" width="300" height="190" rx="4" fill="url(#{p}street)"/>
<g fill="#A88A6A" opacity=".8"><path d="M720 210 v-80 h50 v-30 h40 v110z"/><path d="M830 210 v-110 h60 v110z"/><path d="M910 210 v-70 h70 v70z"/></g>
<g fill="#FFE7A0" opacity=".8">{"".join(f'<rect x="{x}" y="{y}" width="10" height="12"/>' for x, y in [(730, 150), (750, 150), (730, 175), (840, 120), (860, 140), (870, 170), (925, 160), (950, 160), (925, 185)])}</g>
<path d="M700 172 h300" stroke="#C8A88A" stroke-width="3"/><g fill="none" stroke="#F8F3E8" stroke-width="10"><rect x="700" y="20" width="300" height="190" rx="4"/><path d="M850 20 v190 M700 115 h300"/></g>
<rect x="0" y="262" width="{W}" height="158" fill="url(#{p}floor)"/>{"".join(f'<path d="M0 {y} H{W}" stroke="#4A2A14" stroke-width="1.5" opacity=".35"/>' for y in range(280, 420, 24))}
<g><rect x="40" y="60" width="130" height="202" fill="#7A5A3A"/><rect x="50" y="70" width="110" height="182" fill="#5A3A24"/><circle cx="150" cy="170" r="6" fill="#F4B63A"/><rect x="30" y="52" width="150" height="10" fill="#8A6A48"/></g>
<g><path d="M150 136 l14 14" stroke="#F4B63A" stroke-width="4" stroke-linecap="round"/><circle cx="170" cy="126" r="9" fill="none" stroke="#F4B63A" stroke-width="4"/><path d="M176 132 l16 16 l-4 4 l-4 -4 l-4 4 l-4 -4 l-4 4 l-4 -4" stroke="#F4B63A" stroke-width="3" fill="none"/><path d="M164 132 l-10 26 l4 3 l-3 3 l3 3 l-4 4" stroke="#D9C4A0" stroke-width="3" fill="none"/></g>
{box(240, 190, 130, 72)}{box(270, 130, 100, 60, "#E0B47A")}{box(380, 210, 90, 52, "#C89A5A")}
<g><path d="M490 262 h150 v-6 h-150z" fill="#8A5A34"/><rect x="520" y="200" width="90" height="62" fill="#5A3A24"/><rect x="600" y="262" width="60" height="4" fill="#3A2A20"/>
<ellipse cx="600" cy="230" rx="140" ry="70" fill="url(#{p}lamp)"/>
<rect x="596" y="150" width="6" height="50" fill="#3A3A44"/><path d="M568 150 h64 l10 -34 h-84z" fill="#F4B63A"/><rect x="580" y="200" width="38" height="8" rx="3" fill="#3A3A44"/></g>
<g><path d="M660 262 l6 -44 h130 l6 44z" fill="#3A3A44"/><path d="M672 224 h118 l4 30 h-126z" fill="#2A5AA8"/><path d="M700 236 h60 M700 246 h40" stroke="#7AA6E8" stroke-width="3" stroke-linecap="round"/><rect x="650" y="258" width="160" height="6" rx="2" fill="#5A5A64"/></g>
<g><rect x="836" y="200" width="46" height="62" rx="8" fill="#DDF0F8" opacity=".6"/><rect x="836" y="200" width="46" height="62" rx="8" fill="none" stroke="#7A8A9A" stroke-width="2"/>{coins}<rect x="832" y="194" width="54" height="10" rx="3" fill="#8E949B"/></g>
<g><path d="M1040 262 v-110 l20 -14 h100 l20 14 v110z" fill="#8A5A34"/><rect x="1056" y="150" width="108" height="112" fill="#A87A4A"/><path d="M1060 156 h100 M1060 190 h100 M1060 224 h100" stroke="#5A3A24" stroke-width="3"/>{"".join(f'<rect x="{x}" y="{y}" width="14" height="28" fill="{c}"/>' for x, y, c in [(1066, 160, "#E4573D"), (1084, 158, "#3BB3A6"), (1102, 162, "#F4B63A"), (1120, 160, "#7B5BC9"), (1140, 158, "#5AA0E0"), (1070, 194, "#F7F0E0"), (1090, 196, "#E8488A"), (1110, 192, "#3E8A34")])}</g>
<g><path d="M960 262 l-14 -50 h50 l-14 50z" fill="#5AA0E0"/><path d="M948 212 q22 -60 60 -20 q-6 40 -32 34z" fill="#3E8A34"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#1A0E08" opacity=".5"/>
'''
    return _wrap(19, body, defs)


# ───────────────────────── 20  Capstone: the dinner is served ─────────────────────────
def _b20():
    p = "fb20-"
    defs = (_lin(p+"wall", [(0, "#3A2848", None), (1, "#6A4A5A", None)])
            + _lin(p+"table", [(0, "#F7F0E0", None), (1, "#C9BFB0", None)])
            + _lin(p+"floor", [(0, "#5A3A2A", None), (1, "#24140E", None)])
            + _rad(p+"bulb", [(0, "#FFF0B8", 1), (1, "#FFF0B8", 0)])
            + _rad(p+"cand", [(0, "#FFE7A0", .9), (1, "#FFE7A0", 0)]))
    S = "#2A1820"
    lights = ""
    for x0, x1, sag in [(0, 600, 40), (600, 1200, 40)]:
        lights += f'<path d="M{x0} 30 Q{(x0+x1)//2} {30+sag*2} {x1} 30" stroke="#3A2A28" stroke-width="2" fill="none"/>'
        for i in range(1, 9):
            t = i / 9
            x = x0 + (x1 - x0) * t
            y = 30 + sag * 2 * 2 * t * (1 - t)
            lights += f'<circle cx="{x:.0f}" cy="{y+14:.0f}" r="18" fill="url(#{p}bulb)" opacity=".7"/><circle cx="{x:.0f}" cy="{y+12:.0f}" r="5" fill="#FFF4C8"/><path d="M{x:.0f} {y:.0f} v8" stroke="#3A2A28" stroke-width="2"/>'
    settings = ""
    for i in range(6):
        x = 250 + i * 140
        settings += (f'<ellipse cx="{x}" cy="248" rx="34" ry="12" fill="#fff"/><ellipse cx="{x}" cy="248" rx="26" ry="8" fill="none" stroke="#C8A26A" stroke-width="1.5"/>'
                     f'<path d="M{x-44} 238 v20 M{x+44} 238 v20" stroke="#B9BEC5" stroke-width="3" stroke-linecap="round"/>'
                     f'<path d="M{x+52} 236 v-14 q-8 -6 -8 -20 h20 q0 14 -8 20 v14z" fill="#DDF0F8" opacity=".75"/><path d="M{x+52} 236 v-14 q-8 -6 -8 -20 h20 q0 14 -8 20 v14z" fill="none" stroke="#B9BEC5" stroke-width="1.5"/><path d="M{x+46} 238 h20" stroke="#B9BEC5" stroke-width="2"/>'
                     f'<path d="M{x-8} 232 l8 -6 l8 6 l-8 6z" fill="#E4573D"/>')
    candles = "".join(f'<ellipse cx="{x}" cy="196" rx="34" ry="36" fill="url(#{p}cand)"/><rect x="{x-5}" y="190" width="10" height="50" rx="2" fill="#F7F0E0"/><path d="M{x} 190 q-7 -12 0 -24 q7 12 0 24z" fill="#F4B63A"/><path d="M{x} 188 q-3 -7 0 -14 q3 7 0 14z" fill="#FFF4C8"/><rect x="{x-12}" y="238" width="24" height="6" rx="3" fill="#B8842A"/>'
                      for x in (320, 600, 880))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{lights}
<rect x="0" y="262" width="{W}" height="158" fill="url(#{p}floor)"/>
<path d="M60 262 q540 -40 1080 0 v20 H60z" fill="url(#{p}table)"/><path d="M60 262 q540 -40 1080 0" stroke="#F7F0E0" stroke-width="3" fill="none"/>
<path d="M60 282 h1080 v14 h-1080z" fill="#E9E2D6"/><path d="M90 296 v60 M1110 296 v60" stroke="#8A5A34" stroke-width="8"/>
{settings}
{candles}
<g><rect x="1040" y="90" width="6" height="172" fill="#3A2A28"/><path d="M1010 262 h66 l-8 -10 h-50z" fill="#3A2A28"/><path d="M1043 100 q-30 10 -34 60 q-4 30 4 60 h60 q8 -30 4 -60 q-4 -50 -34 -60z" fill="#E8488A"/><path d="M1043 100 q-18 6 -24 40 q-4 26 4 60 h40 q8 -34 4 -60 q-6 -34 -24 -40z" fill="#fff" opacity=".12"/><path d="M1009 220 h68" stroke="#F7F0E0" stroke-width="2" stroke-dasharray="6 5"/><ellipse cx="1043" cy="96" rx="14" ry="6" fill="#3A2A28"/></g>
{_person(180, 262, 1.0, S, "present")}
<g><ellipse cx="236" cy="200" rx="30" ry="8" fill="#fff"/><path d="M212 198 q24 -34 48 0z" fill="#B9BEC5"/><path d="M226 196 q10 -20 20 0" fill="#fff" opacity=".4"/><path d="M236 176 v-8" stroke="#B9BEC5" stroke-width="3"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#0E0608" opacity=".5"/>
'''
    return _wrap(20, body, defs)


_BUILDERS = {11: _b11, 12: _b12, 13: _b13, 14: _b14, 15: _b15, 16: _b16, 17: _b17, 18: _b18, 19: _b19, 20: _b20}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (11..20)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    for n in range(11, 21):
        print(n, len(BANNERS[n].encode("utf-8")), "bytes")
