"""Unit banners for the Spanish course, units 1-10 (K-2, 3-5, 6-8).

Ten drawn, layered scenes from the Spanish-speaking world as inline SVG.
Stdlib only.

    from banners_spa_a import BANNERS, CREDITS, banner
    banner(7)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"spb{n}-" so all Spanish banners can sit on one contents page.
No text, no images, no external references, no feTurbulence.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm and the action sits in the
upper 55%.
"""

W, H = 1200, 420

CREDITS = {
    1: "Drawn scene: a town plaza bandstand at dusk with a guitarist, a trumpet player and sound curling up under strings of papel picado",
    2: "Drawn scene: a market stall with colorful piles of mangoes, limes, chiles, grapes and oranges under striped awnings and papel picado",
    3: "Drawn scene: a sunny house patio with a dog, a cat, a parrot on its perch, potted geraniums and an open window showing a bed and a lamp",
    4: "Drawn scene: the Andes with a big mother llama and three little llamas grazing below snowy peaks, a condor overhead",
    5: "Drawn scene: a village soccer field in the afternoon where a child kicks a ball toward a goal, with a whitewashed church and hills behind",
    6: "Drawn scene: an Andalusian courtyard with a tiled fountain, an orange tree, blue flowerpots on white walls and arched doorways",
    7: "Drawn scene: a colorful old Caribbean street with balconies and a street lamp, where two children trade speech bubbles holding question marks",
    8: "Drawn scene: a hillside town seen through one day, the sun rising, high at noon and setting in three arcs, with a rooster, a clock tower and lit windows",
    9: "Drawn scene: a colonial plaza in the morning with two friends waving hello beside a fountain, a church with twin towers and pigeons taking flight",
    10: "Drawn scene: a city clock tower at golden hour with a big clock face and bell, a tear-off wall calendar and a tram passing by",
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


def _papel(y, x0, x1, colors, sag=18, w=34):
    """A string of papel picado flags hanging along a shallow curve."""
    out = [f'<path d="M{x0} {y} Q{(x0+x1)/2} {y+sag*2} {x1} {y}" stroke="#3A2A20" stroke-width="1.5" fill="none"/>']
    n = int((x1 - x0) // (w + 6))
    for i in range(n):
        x = x0 + 6 + i * (w + 6)
        t = (x + w / 2 - x0) / (x1 - x0)
        yy = y + sag * 2 * 2 * t * (1 - t)
        c = colors[i % len(colors)]
        out.append(f'<path d="M{x:.0f} {yy:.0f} h{w} v{w*1.1:.0f} l-{w/4:.1f} -6 l-{w/4:.1f} 6 l-{w/4:.1f} -6 l-{w/4:.1f} 6z" fill="{c}" opacity=".92"/>'
                   f'<circle cx="{x+w/2:.0f}" cy="{yy+w*.45:.0f}" r="{w*.16:.1f}" fill="#000" opacity=".18"/>')
    return "".join(out)


def _person(x, y, s, c, arm=None):
    """Simple silhouette figure standing with feet at (x, y), scale s."""
    a = ""
    if arm == "wave":
        a = f'<path d="M{x+6*s} {y-50*s} l{14*s} -{22*s} l{4*s} {3*s} l-{12*s} {22*s}z"/>'
    elif arm == "kick":
        a = f'<path d="M{x+2*s} {y-22*s} l{22*s} {8*s} l-2 {6*s} l-{22*s} -{6*s}z"/>'
    return (f'<g fill="{c}"><circle cx="{x}" cy="{y-70*s}" r="{9*s}"/>'
            f'<path d="M{x-9*s} {y-58*s} q{9*s} -4 {18*s} 0 l{3*s} {30*s} l-{3*s} {28*s} h-{6*s} l-{3*s} -{22*s} l-{3*s} {22*s} h-{6*s} l-{3*s} -{28*s}z"/>{a}</g>')


def _wrap(n, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[n]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


PAP = ["#E8488A", "#F4B63A", "#3BB3A6", "#7B5BC9", "#E4573D", "#5AA0E0"]


# ───────────────────────── 1  Sounds of Spanish: plaza bandstand at dusk ─────────────────────────
def _b1():
    p = "spb1-"
    S = "#2A1638"
    defs = (_lin(p+"sky", [(0, "#2E2A6B", None), (.5, "#8A4E8E", None), (.85, "#F09A6A", None), (1, "#F6C27A", None)])
            + _rad(p+"glow", [(0, "#FFE3A0", .9), (1, "#FFE3A0", 0)])
            + _lin(p+"ground", [(0, "#6B3F48", None), (1, "#24142A", None)])
            + _lin(p+"roof", [(0, "#4A7A6A", None), (1, "#2C4C44", None)]))
    notes = "".join(f'<path d="M{x} {y} q30 -30 10 -60 q-20 -30 20 -50" stroke="#FFE3A0" stroke-width="2.5" fill="none" opacity="{o}"/>'
                    for x, y, o in [(520, 170, .7), (560, 160, .5), (650, 170, .7), (690, 155, .5)])
    dots = "".join(f'<circle cx="{x}" cy="{y}" r="5" fill="#FFE3A0" opacity=".8"/>' for x, y in [(548, 64), (590, 52), (678, 70), (722, 50)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(11, 30, 120, "#FFF4DA", ".6")}
<g fill="#3B2350"><path d="M0 250 V170 h60 v-30 h40 v30 h80 v80z"/><path d="M880 250 V150 l40 -40 l40 40 V120 h24 V90 l18 -24 l18 24 V120 h24 v130z"/><path d="M1100 250 v-90 h100 v90z"/></g>
<ellipse cx="600" cy="200" rx="280" ry="140" fill="url(#{p}glow)"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}ground)"/>
<path d="M440 150 L600 86 L760 150z" fill="url(#{p}roof)"/><path d="M596 86 v-18" stroke="{S}" stroke-width="4"/><circle cx="596" cy="64" r="5" fill="#F4B63A"/>
<g fill="{S}"><rect x="460" y="150" width="8" height="100"/><rect x="540" y="150" width="8" height="100"/><rect x="652" y="150" width="8" height="100"/><rect x="732" y="150" width="8" height="100"/><rect x="440" y="248" width="320" height="20"/></g>
<path d="M468 160 h264" stroke="#F4B63A" stroke-width="3"/>
<g fill="{S}"><circle cx="578" cy="186" r="10"/><path d="M568 198 h20 l4 50 h-28z"/><ellipse cx="596" cy="224" rx="16" ry="12" fill="#8A4A2A"/><rect x="600" y="206" width="36" height="5" fill="#8A4A2A" transform="rotate(-20 600 208)"/></g>
<g fill="{S}"><circle cx="636" cy="184" r="10"/><path d="M626 196 h20 l4 52 h-28z"/><path d="M644 190 l40 -10 l4 -8 l2 26 l-4 -8 l-40 4z" fill="#F4B63A"/></g>
{notes}{dots}
{_papel(40, -10, 440, PAP)}{_papel(40, 760, 1210, PAP)}
<g fill="{S}" opacity=".85"><circle cx="150" cy="248" r="9"/><path d="M142 258 h16 l3 40 h-22z"/><circle cx="1040" cy="244" r="9"/><path d="M1032 254 h16 l3 44 h-22z"/><circle cx="1066" cy="258" r="7"/><path d="M1060 266 h12 l2 32 h-16z"/></g>
<path d="M0 360 Q300 350 600 358 T1200 354 V420 H0z" fill="#1A0E20" opacity=".6"/>
'''
    return _wrap(1, body, defs)


# ───────────────────────── 2  Colors and Numbers: market stall ─────────────────────────
def _pile(cx, base, r, c, rows=3, hi="#fff"):
    out = []
    for row in range(rows):
        k = rows - row
        for i in range(k):
            x = cx + (i - (k - 1) / 2) * r * 1.9
            y = base - r - row * r * 1.6
            out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="{c}"/><circle cx="{x-r*.35:.0f}" cy="{y-r*.35:.0f}" r="{r*.25:.1f}" fill="{hi}" opacity=".45"/>')
    return "".join(out)


def _b2():
    p = "spb2-"
    defs = (_lin(p+"sky", [(0, "#F7E3B4", None), (1, "#F2C98A", None)])
            + _lin(p+"table", [(0, "#8A5A34", None), (1, "#3E2616", None)])
            + _lin(p+"wall", [(0, "#E7A05E", None), (1, "#C9743E", None)]))
    stripes = "".join(f'<path d="M{x} 80 h40 l-6 50 h-40z" fill="{c}"/>' for x, c in zip(range(40, 1200, 40), ["#E4573D", "#F7EBD0"] * 30))
    scal = "".join(f'<path d="M{x} 130 q17 18 34 0z" fill="{c}"/>' for x, c in zip(range(0, 1200, 34), ["#E4573D", "#F7EBD0"] * 40))
    piles = (_pile(170, 262, 22, "#F4A22E") + _pile(340, 262, 16, "#7FBF3A", 4) + _pile(500, 262, 20, "#D63A2E")
             + _pile(660, 262, 14, "#7B4BA8", 5) + _pile(830, 262, 22, "#F28A24") + _pile(1010, 262, 18, "#F2D53C", 4))
    chiles = "".join(f'<path d="M{x} 118 q6 30 -4 52 q14 -20 10 -52z" fill="#C8281E"/>' for x in range(300, 900, 22))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<rect y="0" width="{W}" height="80" fill="url(#{p}wall)"/>
{_papel(6, -10, 1210, PAP, 10, 30)}
<g fill="#5A3A24"><rect x="30" y="80" width="10" height="190"/><rect x="1160" y="80" width="10" height="190"/><rect x="600" y="80" width="8" height="190"/></g>
{stripes}{scal}
<path d="M290 118 H910" stroke="#5A3A24" stroke-width="3"/>{chiles}
<g fill="#C9A36A"><path d="M90 262 l20 -40 h120 l20 40z"/><path d="M260 262 l20 -40 h120 l20 40z"/><path d="M420 262 l20 -40 h120 l20 40z"/><path d="M580 262 l20 -40 h120 l20 40z"/><path d="M750 262 l20 -40 h120 l20 40z"/><path d="M930 262 l20 -40 h120 l20 40z"/></g>
{piles}
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}table)"/><path d="M0 262 h1200 v8 H0z" fill="#A8703E"/>
<g fill="#6E9E3C"><path d="M1110 262 q-10 -60 30 -100 q-10 50 -20 100z"/><path d="M1130 262 q10 -50 50 -70 q-30 40 -40 70z"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#20130A" opacity=".5"/>
'''
    return _wrap(2, body, defs)


# ───────────────────────── 3  El and La: a house patio with pets ─────────────────────────
def _b3():
    p = "spb3-"
    S = "#3A2418"
    defs = (_lin(p+"sky", [(0, "#6FB4E6", None), (1, "#C9E6F4", None)])
            + _lin(p+"wall", [(0, "#F6E3C0", None), (1, "#E8C898", None)])
            + _lin(p+"floor", [(0, "#C8683E", None), (1, "#6A2E1A", None)])
            + _lin(p+"room", [(0, "#4A3A5E", None), (1, "#2A2038", None)])
            + _rad(p+"lamp", [(0, "#FFE7A0", .9), (1, "#FFE7A0", 0)]))
    tiles = "".join(f'<path d="M{x} 280 l-60 140" stroke="#8A3E22" stroke-width="2" opacity=".5"/>' for x in range(0, 1300, 80))
    ger = "".join(f'<g><path d="M{x-22} 250 h44 l-6 30 h-32z" fill="#B85A34"/><circle cx="{x-12}" cy="238" r="12" fill="#3E7A34"/><circle cx="{x+12}" cy="236" r="12" fill="#4E8A3C"/>'
                  f'<circle cx="{x-8}" cy="226" r="7" fill="#E4373D"/><circle cx="{x+10}" cy="222" r="7" fill="#E4373D"/><circle cx="{x}" cy="230" r="6" fill="#F0505A"/></g>'
                  for x in (90, 1130, 1060))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<path d="M0 60 H1200 V280 H0z" fill="url(#{p}wall)"/>
<path d="M-10 60 L600 20 L1210 60 v12 H-10z" fill="#B85A34"/>{"".join(f'<path d="M{x} 44 v28" stroke="#8A3E22" stroke-width="2"/>' for x in range(20, 1200, 30))}
<rect x="170" y="100" width="220" height="150" fill="url(#{p}room)"/>
<circle cx="340" cy="160" r="60" fill="url(#{p}lamp)"/>
<g fill="#E7D9F0"><path d="M190 230 h120 v-24 h-120z"/><rect x="186" y="190" width="12" height="60" fill="#6A4A3A"/></g><rect x="200" y="200" width="30" height="12" rx="4" fill="#FFF"/><path d="M190 214 h124" stroke="#9A6AC8" stroke-width="10"/>
<g><path d="M330 150 h24 l-6 -18 h-12z" fill="#F4C84A"/><rect x="340" y="150" width="4" height="50" fill="#5A3A24"/><rect x="326" y="200" width="32" height="50" fill="#6A4A3A"/></g>
<g fill="none" stroke="#2A6A9A" stroke-width="8"><rect x="166" y="96" width="228" height="158"/></g><path d="M280 96 v158 M166 176 h228" stroke="#2A6A9A" stroke-width="4"/>
<g fill="#2A6A9A"><path d="M130 96 h36 v158 h-36z"/><path d="M394 96 h36 v158 h-36z"/></g>
<path d="M560 280 V130 q70 -60 140 0 V280z" fill="#6A3E24"/><path d="M630 90 V280" stroke="#4A2A18" stroke-width="3"/><circle cx="650" cy="200" r="4" fill="#F4C84A"/>
<g><rect x="880" y="110" width="6" height="170" fill="#5A3A24"/><path d="M850 130 h66" stroke="#5A3A24" stroke-width="5"/>
<path d="M896 128 q-18 -14 -8 -40 q14 -10 24 4 q6 18 -2 36z" fill="#2E9A4A"/><path d="M890 96 q-10 -8 0 -16 q12 0 10 12z" fill="#E4373D"/><path d="M886 90 l-8 4 l8 2z" fill="#F4C84A"/><circle cx="893" cy="89" r="2" fill="#111"/><path d="M904 128 l10 30 l-14 -24z" fill="#2A6ACB"/></g>
{ger}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}floor)"/>{tiles}
<g fill="#8A5A34"><ellipse cx="470" cy="300" rx="56" ry="22"/><circle cx="522" cy="270" r="18"/><path d="M512 258 l-6 -20 l14 12z M530 256 l10 -18 l2 18z"/><path d="M420 296 q-30 -14 -26 -36" stroke="#8A5A34" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="430" y="306" width="10" height="24"/><rect x="494" y="306" width="10" height="24"/></g><circle cx="528" cy="266" r="2.5" fill="#111"/><path d="M536 276 q6 2 4 6" stroke="#111" stroke-width="2" fill="none"/>
<g fill="{S}"><ellipse cx="770" cy="296" rx="34" ry="16"/><circle cx="800" cy="278" r="14"/><path d="M792 268 l2 -14 l8 10z M806 268 l6 -12 l2 14z"/><path d="M740 296 q-24 -4 -20 -40 q4 -6 8 0 q-2 30 16 34z"/></g><g fill="#9ADA6A"><circle cx="796" cy="276" r="2"/><circle cx="806" cy="276" r="2"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#2A1008" opacity=".5"/>
'''
    return _wrap(3, body, defs)


# ───────────────────────── 4  One and Many, Big and Little: llamas in the Andes ─────────────────────────
def _llama(x, y, s, c, head=1):
    hx = 30 * s * head
    return (f'<g fill="{c}"><ellipse cx="{x}" cy="{y-40*s}" rx="{34*s}" ry="{18*s}"/>'
            f'<rect x="{x-26*s}" y="{y-30*s}" width="{7*s}" height="{30*s}"/><rect x="{x-12*s}" y="{y-30*s}" width="{7*s}" height="{30*s}"/>'
            f'<rect x="{x+8*s}" y="{y-30*s}" width="{7*s}" height="{30*s}"/><rect x="{x+20*s}" y="{y-30*s}" width="{7*s}" height="{30*s}"/>'
            f'<path d="M{x+hx-6*s*head} {y-48*s} l{4*s*head} -{44*s} h{10*s*head} l{2*s*head} {44*s}z"/>'
            f'<ellipse cx="{x+hx+6*s*head}" cy="{y-92*s}" rx="{12*s}" ry="{7*s}"/>'
            f'<path d="M{x+hx} {y-96*s} l{-(2*s*head)} -{12*s} l{5*s*head} {8*s}z"/><path d="M{x+hx+6*s*head} {y-96*s} l{1*s*head} -{12*s} l{4*s*head} {10*s}z"/>'
            f'<path d="M{x-34*s*head} {y-44*s} q{-(8*s*head)} 2 {-(8*s*head)} {10*s}" stroke="{c}" stroke-width="{5*s}" fill="none"/></g>')


def _b4():
    p = "spb4-"
    defs = (_lin(p+"sky", [(0, "#3F7EC8", None), (.6, "#9CCBEE", None), (1, "#DCEFF6", None)])
            + _lin(p+"far", [(0, "#8A9ACB", None), (1, "#6A7AAB", None)])
            + _lin(p+"mid", [(0, "#6A8A5A", None), (1, "#4A6A3A", None)])
            + _lin(p+"grass", [(0, "#B8B85A", None), (1, "#5A5A24", None)]))
    tufts = "".join(f'<path d="M{x} 330 l4 -14 l3 14 l4 -10 l2 10z"/>' for x in range(10, 1200, 37))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<path d="M0 220 L120 110 L200 160 L330 40 L450 150 L560 90 L700 180 L840 60 L960 150 L1080 90 L1200 170 V260 H0z" fill="url(#{p}far)"/>
<g fill="#F4F6FA"><path d="M300 68 L330 40 L362 70 L346 64 L334 74 L320 62z"/><path d="M812 86 L840 60 L870 88 L852 80 L840 92 L826 80z"/><path d="M540 108 L560 90 L582 110 L566 104 L556 112z"/><path d="M1060 108 L1080 90 L1102 110 L1086 104 L1074 112z"/></g>
<path d="M0 250 Q200 190 420 230 T840 220 T1200 230 V300 H0z" fill="url(#{p}mid)"/>
<g stroke="#8AA86A" stroke-width="2" fill="none" opacity=".6"><path d="M60 250 q200 -30 380 0"/><path d="M700 240 q200 -26 400 -4"/></g>
<path d="M0 290 Q300 270 600 284 T1200 280 V420 H0z" fill="url(#{p}grass)"/>
<path d="M740 86 q30 -14 60 -4 q30 -14 60 4 q-30 -4 -60 8 q-30 -12 -60 -8z" fill="#2A2A30"/><path d="M790 84 h20 v6 h-20z" fill="#F4F6FA"/>
{_llama(420, 300, 1.6, "#F2E6D0")}{_llama(560, 300, .8, "#C89A6A")}{_llama(650, 304, .75, "#8A5A3A", -1)}{_llama(740, 302, .7, "#F2E6D0")}
<path d="M380 252 h56 v8 h-56z" fill="#E4373D"/><path d="M380 260 h56 v5 h-56z" fill="#3B6AB8"/>
<g fill="#4A4A1E">{tufts}</g>
<path d="M0 370 Q300 360 600 368 T1200 364 V420 H0z" fill="#2A2A10" opacity=".5"/>
'''
    return _wrap(4, body, defs)


# ───────────────────────── 5  A Whole Thought: village soccer ─────────────────────────
def _b5():
    p = "spb5-"
    S = "#2A3A20"
    defs = (_lin(p+"sky", [(0, "#4A9AD8", None), (1, "#F2E2B0", None)])
            + _lin(p+"hill", [(0, "#8ABA5A", None), (1, "#5A8A3A", None)])
            + _lin(p+"field", [(0, "#C8A868", None), (1, "#6A4E28", None)]))
    net = "".join(f'<path d="M{x} 170 v110" />' for x in range(930, 1060, 14)) + "".join(f'<path d="M930 {y} h124"/>' for y in range(180, 280, 14))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="180" cy="80" r="40" fill="#FFF3C4"/><circle cx="180" cy="80" r="70" fill="#FFF3C4" opacity=".25"/>
<path d="M0 230 Q200 150 420 200 T860 190 T1200 200 V280 H0z" fill="url(#{p}hill)"/>
<g><rect x="300" y="130" width="120" height="100" fill="#F7F2E6"/><rect x="330" y="80" width="46" height="60" fill="#F7F2E6"/><path d="M326 80 l27 -30 l27 30z" fill="#C8683E"/><path d="M353 50 v-18 M345 40 h16" stroke="#5A3A24" stroke-width="3"/>
<path d="M296 130 l64 -30 l64 30z" fill="#C8683E"/><path d="M344 230 v-40 q16 -18 32 0 v40z" fill="#6A3E24"/><circle cx="353" cy="104" r="10" fill="#6A3E24"/></g>
<g fill="#F7F2E6"><rect x="470" y="190" width="50" height="40"/><rect x="530" y="200" width="44" height="30"/><rect x="180" y="196" width="60" height="34"/></g><g fill="#C8683E"><path d="M466 190 l29 -16 l29 16z"/><path d="M526 200 l26 -14 l26 14z"/><path d="M176 196 l34 -16 l34 16z"/></g>
<path d="M0 270 H1200 V420 H0z" fill="url(#{p}field)"/>
<g stroke="#F7F2E6" stroke-width="3" opacity=".7" fill="none"><path d="M0 300 H1200"/><ellipse cx="400" cy="340" rx="140" ry="24"/></g>
<g stroke="#F7F2E6" stroke-width="6" fill="none"><path d="M930 280 V168 H1054 V280"/></g><g stroke="#F7F2E6" stroke-width="1.2" opacity=".6">{net}</g>
{_person(640, 290, 1.1, S, "kick")}<path d="M632 250 l14 -20 l4 4 l-12 18z" fill="{S}"/>
<circle cx="760" cy="210" r="12" fill="#FFF"/><path d="M754 204 l6 4 l6 -4 l-2 8 h-8z" fill="#222"/>
<g stroke="#FFF" stroke-width="2" opacity=".6" fill="none"><path d="M740 216 q-40 20 -80 50"/><path d="M744 224 q-30 16 -60 40"/></g>
{_person(990, 284, .95, "#2A4A8A", "wave")}{_person(470, 290, .9, "#8A2A2A")}
<path d="M0 370 H1200 V420 H0z" fill="#241A0A" opacity=".5"/>
'''
    return _wrap(5, body, defs)


# ───────────────────────── 6  Soy and Estoy: Andalusian courtyard ─────────────────────────
def _b6():
    p = "spb6-"
    defs = (_lin(p+"sky", [(0, "#3A8AD8", None), (1, "#A8D4F2", None)])
            + _lin(p+"wall", [(0, "#FBF7EE", None), (1, "#E8DFCB", None)])
            + _lin(p+"floor", [(0, "#D8C49A", None), (1, "#7A6440", None)])
            + _rad(p+"tree", [(0, "#4E9A3E", None), (1, "#2A5A24", None)])
            + _lin(p+"water", [(0, "#8AD4F0", None), (1, "#3A8AB8", None)]))
    pots = "".join(f'<path d="M{x} {y} h18 l-3 16 h-12z" fill="#2A5AB8"/><circle cx="{x+5}" cy="{y-4}" r="6" fill="#E4373D"/><circle cx="{x+13}" cy="{y-6}" r="6" fill="#F05A7A"/><circle cx="{x+9}" cy="{y-2}" r="5" fill="#3E7A34"/>'
                   for x, y in [(60, 70), (120, 90), (180, 70), (980, 70), (1040, 90), (1100, 70), (60, 150), (1100, 150)])
    arches = "".join(f'<path d="M{x} 280 V180 q40 -46 80 0 V280z" fill="#7A5A3A"/><path d="M{x} 180 q40 -46 80 0" stroke="#C8683E" stroke-width="6" fill="none"/>' for x in (250, 870))
    oranges = "".join(f'<circle cx="{x}" cy="{y}" r="6" fill="#F28A24"/>' for x, y in [(560, 70), (610, 50), (660, 80), (590, 110), (640, 118), (700, 100), (520, 100), (620, 84)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<path d="M0 30 H1200 V280 H0z" fill="url(#{p}wall)"/><path d="M0 30 H1200 v-10 H0z" fill="#C8683E"/>
<path d="M430 30 h340 v250 h-340z" fill="#A8D4F2" opacity=".0"/>
{arches}{pots}
<g fill="#F4C84A" opacity=".9">{"".join(f'<rect x="{x}" y="258" width="22" height="22" transform="rotate(45 {x+11} 269)"/>' for x in range(40, 1200, 60))}</g>
<rect x="596" y="130" width="10" height="120" fill="#6A4A2A"/>
<ellipse cx="600" cy="95" rx="120" ry="80" fill="url(#{p}tree)"/>{oranges}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}floor)"/>
<ellipse cx="600" cy="300" rx="150" ry="26" fill="#2A5AB8"/><ellipse cx="600" cy="296" rx="136" ry="20" fill="url(#{p}water)"/>
<g fill="#F4C84A">{"".join(f'<rect x="{x}" y="304" width="12" height="12" transform="rotate(45 {x+6} 310)"/>' for x in range(470, 740, 30))}</g>
<rect x="590" y="250" width="20" height="44" fill="#2A5AB8"/><ellipse cx="600" cy="250" rx="30" ry="8" fill="#2A5AB8"/>
<g stroke="#CFEFFF" stroke-width="2.5" fill="none" opacity=".85"><path d="M600 248 q-20 -40 -44 30"/><path d="M600 248 q20 -40 44 30"/><path d="M600 248 v-22"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#2A1E0A" opacity=".45"/>
'''
    return _wrap(6, body, defs)


# ───────────────────────── 7  Who, Where, When, Why: Caribbean street ─────────────────────────
def _b7():
    p = "spb7-"
    defs = (_lin(p+"sky", [(0, "#5AB4E6", None), (1, "#CDEBF6", None)])
            + _lin(p+"street", [(0, "#6A7A9A", None), (1, "#2A3050", None)]))
    cols = ["#F2C84A", "#3BB3A6", "#E8688A", "#5AA0E0", "#F28A4A", "#9AD06A", "#C88AE0"]
    houses = []
    for i, c in enumerate(cols):
        x = i * 172 - 10
        h = 190 + (i % 3) * 20
        top = 280 - h
        rails = "".join(f'<path d="M{x+22+k*10} {top+80} v18" stroke="#3A2A20" stroke-width="2"/>' for k in range(14))
        houses.append(f'<rect x="{x}" y="{top}" width="172" height="{h}" fill="{c}"/><rect x="{x}" y="{top}" width="172" height="10" fill="#FFF" opacity=".6"/>'
                      f'<rect x="{x+30}" y="{top+30}" width="30" height="50" fill="#2A5A6A"/><rect x="{x+110}" y="{top+30}" width="30" height="50" fill="#2A5A6A"/>'
                      f'<path d="M{x+20} {top+80} h140" stroke="#3A2A20" stroke-width="3"/>{rails}'
                      f'<path d="M{x+20} {top+98} h140" stroke="#3A2A20" stroke-width="3"/>'
                      f'<path d="M{x+66} 280 v-60 q20 -20 40 0 v60z" fill="#6A3E24"/>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{"".join(houses)}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}street)"/>
<g stroke="#8A9ABA" stroke-width="1.5" opacity=".5">{"".join(f'<path d="M{x} 280 l-30 140"/>' for x in range(0, 1300, 40))}</g>
<g fill="#1E2438"><rect x="1080" y="120" width="6" height="170"/><path d="M1070 110 h26 l-4 14 h-18z"/></g><circle cx="1083" cy="116" r="6" fill="#FFE7A0"/>
{_person(470, 300, 1.05, "#1E2438", "wave")}{_person(720, 300, .95, "#1E2438")}
<g><path d="M380 120 q0 -40 60 -40 h40 q60 0 60 40 q0 40 -60 40 h-30 l-24 22 l4 -22 q-50 0 -50 -40z" fill="#FFF"/>
<path d="M450 106 q0 -16 14 -16 q14 0 14 12 q0 10 -12 14 v10" stroke="#E4573D" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="466" cy="142" r="4" fill="#E4573D"/></g>
<g><path d="M660 110 q0 -40 60 -40 h40 q60 0 60 40 q0 40 -60 40 h-10 l4 22 l-24 -22 q-70 0 -70 -40z" fill="#FFF"/>
<path d="M728 96 q0 -16 14 -16 q14 0 14 12 q0 10 -12 14 v10" stroke="#3B6AB8" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="744" cy="132" r="4" fill="#3B6AB8"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#10141F" opacity=".5"/>
'''
    return _wrap(7, body, defs)


# ───────────────────────── 8  First, Then, Last: a day over a hillside town ─────────────────────────
def _b8():
    p = "spb8-"
    defs = (_lin(p+"sky", [(0, "#F2A86A", None), (.33, "#F6D8A0", None), (.34, "#6AB4E6", None), (.66, "#A8D8F2", None), (.67, "#6A4A8A", None), (1, "#E87A5A", None)], 0, 0, 1, 0)
            + _lin(p+"fade", [(0, "#FFFFFF", 0), (1, "#FFFFFF", .25)])
            + _lin(p+"hill", [(0, "#7A6A4A", None), (1, "#3A2E1E", None)])
            + _rad(p+"sun", [(0, "#FFF3C4", 1), (.35, "#FFD46A", .8), (1, "#FFD46A", 0)]))
    town = []
    for i, x in enumerate(range(40, 1180, 64)):
        y = 200 + (abs(x - 600) // 18)
        town.append(f'<rect x="{x}" y="{y}" width="50" height="{300-y}" fill="{["#F2E6D0", "#E8C898", "#F6D0B0"][i % 3]}"/><path d="M{x-4} {y} l29 -16 l29 16z" fill="#B85A34"/>'
                    f'<rect x="{x+18}" y="{y+14}" width="14" height="14" fill="{"#FFE07A" if x > 800 else "#5A4A3A"}"/>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<rect width="{W}" height="{H}" fill="url(#{p}fade)"/>
<circle cx="200" cy="170" r="80" fill="url(#{p}sun)"/><circle cx="200" cy="170" r="26" fill="#FFB84A"/>
<circle cx="600" cy="70" r="80" fill="url(#{p}sun)"/><circle cx="600" cy="70" r="28" fill="#FFE27A"/>
<circle cx="1000" cy="170" r="80" fill="url(#{p}sun)"/><circle cx="1000" cy="170" r="26" fill="#F2663A"/>
{_stars(5, 14, 120, "#FFF", ".7", 880, 1190)}
<g stroke="#FFF" stroke-width="3" stroke-dasharray="4 10" fill="none" opacity=".8"><path d="M240 140 Q400 40 560 60"/><path d="M640 60 Q800 40 960 140"/></g>
{"".join(town)}
<g><rect x="580" y="120" width="40" height="100" fill="#E8C898"/><path d="M574 120 l26 -26 l26 26z" fill="#B85A34"/><circle cx="600" cy="146" r="13" fill="#FFF"/><path d="M600 146 v-9 M600 146 h7" stroke="#222" stroke-width="2"/></g>
<path d="M0 290 Q300 270 600 282 T1200 278 V420 H0z" fill="url(#{p}hill)"/>
<g fill="#3A2418"><path d="M118 268 q-6 -22 10 -30 q10 -2 14 6 l8 -6 l-2 10 q10 10 -2 20z"/><path d="M130 268 l-2 14 M140 268 l2 14" stroke="#3A2418" stroke-width="3"/><path d="M104 250 q-10 -14 -2 -24 q6 10 12 12z" fill="#2A5A3A"/></g><path d="M136 236 l6 -8 l4 8z" fill="#E4373D"/><path d="M150 244 l6 2 l-6 2z" fill="#F4B63A"/>
<path d="M0 370 H1200 V420 H0z" fill="#1E140A" opacity=".5"/>
'''
    return _wrap(8, body, defs)


# ───────────────────────── 9  Greetings: colonial plaza in the morning ─────────────────────────
def _b9():
    p = "spb9-"
    defs = (_lin(p+"sky", [(0, "#F6C88A", None), (.5, "#F9E2B8", None), (1, "#CFE8F2", None)])
            + _lin(p+"church", [(0, "#F2D8A8", None), (1, "#D8B07A", None)])
            + _lin(p+"plaza", [(0, "#C8A878", None), (1, "#5A4428", None)]))
    birds = "".join(f'<path d="M{x} {y} q8 -8 14 0 q6 -8 14 0" stroke="#4A3A30" stroke-width="2.5" fill="none"/>' for x, y in [(700, 60), (740, 40), (780, 70), (820, 50), (860, 80), (660, 90)])
    trees = "".join(f'<rect x="{x-4}" y="190" width="8" height="90" fill="#4A3A24"/><circle cx="{x}" cy="180" r="42" fill="#4E8A3C"/><circle cx="{x-14}" cy="168" r="22" fill="#6AA84A"/>' for x in (90, 1110))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g><rect x="360" y="110" width="480" height="170" fill="url(#{p}church)"/>
<rect x="340" y="56" width="90" height="224" fill="url(#{p}church)"/><rect x="770" y="56" width="90" height="224" fill="url(#{p}church)"/>
<path d="M340 56 q45 -40 90 0z M770 56 q45 -40 90 0z" fill="#C8683E"/><path d="M385 16 v-18 M377 4 h16 M815 16 v-18 M807 4 h16" stroke="#5A3A24" stroke-width="3"/>
<path d="M366 60 v36 q19 -22 38 0 v-36z" fill="#5A3A24" transform="translate(0 20)"/><path d="M796 60 v36 q19 -22 38 0 v-36z" fill="#5A3A24" transform="translate(0 20)"/>
<path d="M430 110 L600 60 L770 110z" fill="#E8C898"/><circle cx="600" cy="120" r="20" fill="#8A5A34"/><path d="M560 280 v-80 q40 -50 80 0 v80z" fill="#6A3E24"/></g>
{trees}{birds}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}plaza)"/>
<g><ellipse cx="600" cy="300" rx="90" ry="16" fill="#8A7A5A"/><ellipse cx="600" cy="296" rx="80" ry="11" fill="#7AC0E0"/><rect x="592" y="246" width="16" height="50" fill="#A89A7A"/><ellipse cx="600" cy="246" rx="26" ry="6" fill="#A89A7A"/><path d="M600 244 q-14 -20 -24 8 M600 244 q14 -20 24 8" stroke="#CFEFFF" stroke-width="2" fill="none"/></g>
{_person(440, 310, 1.1, "#3A2A4A", "wave")}{_person(780, 310, 1.05, "#6A2A2A", "wave")}
<g fill="#6A6A7A"><ellipse cx="520" cy="320" rx="8" ry="5"/><ellipse cx="690" cy="322" rx="8" ry="5"/><circle cx="527" cy="316" r="3"/><circle cx="683" cy="318" r="3"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#1E1408" opacity=".5"/>
'''
    return _wrap(9, body, defs)


# ───────────────────────── 10  Numbers, Time and Dates: clock tower ─────────────────────────
def _b10():
    p = "spb10-"
    S = "#2A1E30"
    defs = (_lin(p+"sky", [(0, "#4A5AA8", None), (.55, "#E89A7A", None), (1, "#F6CC8A", None)])
            + _lin(p+"tower", [(0, "#E8C898", None), (1, "#B8885A", None)])
            + _rad(p+"face", [(0, "#FFFBEA", None), (1, "#F2E2B0", None)])
            + _lin(p+"street", [(0, "#5A4450", None), (1, "#1E1420", None)]))
    ticks = "".join(f'<rect x="598" y="92" width="4" height="{12 if k % 3 == 0 else 6}" fill="#3A2A20" transform="rotate({k*30} 600 140)"/>' for k in range(12))
    city = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{300-y}"/>' for x, y, w in [(0, 190, 90), (100, 170, 80), (190, 200, 110), (310, 180, 90), (800, 176, 100), (910, 200, 80), (1000, 160, 90), (1100, 190, 100)])
    wins = "".join(f'<rect x="{x}" y="{y}" width="8" height="10"/>' for x in range(20, 1200, 46) for y in (210, 240) if not 440 < x < 780)
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#6A4A6A">{city}</g><g fill="#FFD98A" opacity=".8">{wins}</g>
<rect x="540" y="70" width="120" height="230" fill="url(#{p}tower)"/><path d="M530 70 L600 10 L670 70z" fill="#8A3E2A"/><path d="M600 10 v-10" stroke="{S}" stroke-width="3"/>
<circle cx="600" cy="140" r="50" fill="#8A5A34"/><circle cx="600" cy="140" r="44" fill="url(#{p}face)"/>{ticks}
<path d="M600 140 L600 108" stroke="#3A2A20" stroke-width="5" stroke-linecap="round"/><path d="M600 140 L626 150" stroke="#3A2A20" stroke-width="4" stroke-linecap="round"/><circle cx="600" cy="140" r="4" fill="#3A2A20"/>
<path d="M570 250 v-40 q30 -30 60 0 v40z" fill="#3A2A20"/><path d="M586 246 q14 -40 28 0z" fill="#E8A83A"/><circle cx="600" cy="248" r="4" fill="#E8A83A"/>
<g><rect x="200" y="96" width="120" height="120" rx="6" fill="#FFF"/><rect x="200" y="96" width="120" height="30" rx="6" fill="#E4573D"/><path d="M226 90 v14 M294 90 v14" stroke="#3A2A20" stroke-width="5"/>
<g fill="#E4573D" opacity=".75">{"".join(f'<rect x="{212+c*20}" y="{134+r*18}" width="14" height="12" rx="2"/>' for r in range(4) for c in range(5))}</g><rect x="252" y="170" width="14" height="12" rx="2" fill="#3B6AB8"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}street)"/>
<path d="M0 312 H1200 M0 322 H1200" stroke="#8A7A6A" stroke-width="2"/>
<path d="M820 186 H1200" stroke="{S}" stroke-width="1.5"/>
<g><path d="M860 300 v-90 q0 -12 12 -12 h200 q12 0 12 12 v90z" fill="#E8A83A"/><rect x="860" y="270" width="224" height="10" fill="#B8742A"/>
{"".join(f'<rect x="{x}" y="214" width="30" height="36" rx="3" fill="#FFE7A0"/>' for x in range(876, 1070, 40))}<path d="M960 198 l14 -12" stroke="{S}" stroke-width="2"/>
<circle cx="900" cy="304" r="10" fill="{S}"/><circle cx="1044" cy="304" r="10" fill="{S}"/></g>
<path d="M0 370 H1200 V420 H0z" fill="#140A14" opacity=".5"/>
'''
    return _wrap(10, body, defs)


_BUILDERS = {1: _b1, 2: _b2, 3: _b3, 4: _b4, 5: _b5, 6: _b6, 7: _b7, 8: _b8, 9: _b9, 10: _b10}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (1..10)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    for n in range(1, 11):
        print(n, len(BANNERS[n].encode("utf-8")), "bytes")
