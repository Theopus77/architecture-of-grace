"""Unit banners for the English Language Arts course, units 1-12 (K-2, 3-5, 6-8).

Twelve drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_ela_a import BANNERS, CREDITS, banner
    banner(7)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"elb{n}-" so all the ELA banners can sit on one contents page.
No text, no letterforms, no images, no filters, no external references.

Page CSS note (same as the Science banners):
    .ela-banner svg { width:100%; height:100%; display:block; }
The page sits the banner over a #0A1E33 band and paints a dark gradient
over the bottom ~45% for the unit title, so the lower part of every scene
is kept calm (rugs, table tops, ground, water) and the action sits in the
upper 55%.
"""

import math

W, H = 1200, 420

CREDITS = {
    1: "Drawn scene: alphabet blocks stacked on a rug beside a child reading a picture book, with sound waves rising as arcs under a warm lamp",
    2: "Drawn scene: a word wall of blank cards, a long pencil leaning across it and a sentence strip laid on the desk below",
    3: "Drawn scene: two open books on a table at dusk, one showing a frog on a lily pad and the other a labeled frog diagram",
    4: "Drawn scene: an author's chair by a sunny window with a small audience seated on the rug and a drawing easel to one side",
    5: "Drawn scene: a long word split into puzzle-piece blocks floating above an open dictionary under a night sky",
    6: "Drawn scene: a rabbit at a campfire under the stars on one side and two brothers with one bicycle between them on the other",
    7: "Drawn scene: a straw beehive with honeybees looping around it, a folded newspaper and a bar chart on an easel",
    8: "Drawn scene: a writing desk with four drafts taped in a row on the wall and a sealed letter to the principal beside a pen",
    9: "Drawn scene: a book-club circle of empty chairs on a rug with a run-on sentence winding overhead as one long ribbon",
    10: "Drawn scene: a movie theater marquee at dusk with a lone boy walking away down the sidewalk toward a setting sun",
    11: "Drawn scene: two newspapers under a magnifying glass in front of a burning 1871 city skyline with smoke and sparks",
    12: "Drawn scene: a blacksmith's hammer and anvil forging a glowing word-shape between Greek columns and a Roman arch",
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


def _wrap(n, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[n]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


# shared palette
NAVY0, NAVY1, NAVY2 = "#0A1E33", "#142B4D", "#1E3A66"
GOLD, GOLD2, CREAM, CREAM2 = "#F2C86A", "#E8A93A", "#F4E9D2", "#FBEFD0"
INK = "#0B1730"


# ───────────────────────── 1  Sounds and Letters: blocks on a rug ─────────────────────────
def _b1():
    p = "elb1-"
    defs = (
        _lin(p+"wall", [(0, NAVY0, None), (.7, NAVY1, None), (1, NAVY2, None)])
        + _rad(p+"lamp", [(0, "#FFF1C8", .95), (.4, GOLD, .45), (1, GOLD, 0)])
        + _lin(p+"rug", [(0, "#8A3A2E", None), (1, "#5A2419", None)])
        + _lin(p+"floor", [(0, "#4A3520", None), (1, "#20160B", None)])
        + _lin(p+"blk", [(0, "#F6D98C", None), (1, "#D9A94A", None)])
    )
    def block(x, y, s, face, dot):
        # a cube seen from the front-top, with a small shape on its face (no letterforms)
        return (f'<g transform="translate({x} {y})"><rect x="0" y="0" width="{s}" height="{s}" fill="{face}"/>'
                f'<path d="M0 0 l{s*.28:.0f} -{s*.28:.0f} h{s} l-{s*.28:.0f} {s*.28:.0f}z" fill="#FFF3D0"/>'
                f'<path d="M{s} 0 l{s*.28:.0f} -{s*.28:.0f} v{s} l-{s*.28:.0f} {s*.28:.0f}z" fill="#B8842E"/>'
                f'<circle cx="{s/2:.0f}" cy="{s/2:.0f}" r="{s*.2:.0f}" fill="{dot}"/></g>')
    arcs = "".join(f'<path d="M{700+i*26} {150-i*6} A{40+i*26} {40+i*26} 0 0 1 {700+i*26} {250+i*6}" stroke="{GOLD}" stroke-width="3" fill="none" opacity="{.9-i*.15:.2f}"/>' for i in range(5))
    fringe = "".join(f'<path d="M{x} 386 v14"/>' for x in range(60, 1150, 18))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="0" y="286" width="1200" height="8" fill="#2A3E62"/>
<path d="M0 290 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M980 292 v-160 M960 132 h40" stroke="#2A2A2A" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M930 132 l20 -60 h60 l20 60z" fill="{CREAM}"/><path d="M930 132 l20 -60 h60 l20 60z" fill="{GOLD}" opacity=".5"/>
<ellipse cx="980" cy="150" rx="260" ry="150" fill="url(#{p}lamp)"/>
<ellipse cx="560" cy="360" rx="500" ry="52" fill="url(#{p}rug)"/><ellipse cx="560" cy="360" rx="440" ry="40" fill="none" stroke="{GOLD}" stroke-width="3" opacity=".45"/><ellipse cx="560" cy="360" rx="380" ry="30" fill="none" stroke="{CREAM}" stroke-width="2" opacity=".3"/>
<g stroke="{GOLD}" stroke-width="2" opacity=".35">{fringe}</g>
{block(150, 250, 60, "#E4573D", CREAM)}{block(216, 250, 60, "#4F9BD8", CREAM)}{block(282, 250, 60, "#F2C86A", INK)}
{block(184, 184, 60, "#7DC15A", CREAM)}{block(250, 184, 60, "#E4573D", CREAM)}
{block(218, 118, 60, "#4F9BD8", "#F2C86A")}
{block(420, 262, 44, "#F2C86A", INK)}{block(360, 268, 40, "#7DC15A", CREAM)}
<g fill="{INK}"><circle cx="600" cy="132" r="24"/><path d="M574 160 q26 -16 52 0 l14 60 q-10 40 -40 46 l-60 12 q-20 -6 -12 -30 l20 -40 q4 -40 26 -48z"/><path d="M560 262 q30 -30 90 -28 l40 44 h-70 q-40 4 -60 -16z"/></g>
<path d="M566 224 q40 -22 80 -8 l4 40 q-40 -18 -84 -2z" fill="{CREAM}"/><path d="M646 216 q36 -20 70 -6 l-2 42 q-34 -18 -68 -4z" fill="{CREAM2}"/><path d="M646 216 v52" stroke="{INK}" stroke-width="2"/>
<g fill="{GOLD}" opacity=".9"><circle cx="596" cy="240" r="8"/><rect x="662" y="226" width="34" height="4" rx="2"/><rect x="664" y="236" width="26" height="4" rx="2"/><rect x="666" y="246" width="30" height="4" rx="2"/></g>
<path d="M586 214 q10 -8 20 0" stroke="{CREAM}" stroke-width="1.5" fill="none" opacity=".6"/>
{arcs}
<g fill="{GOLD}"><circle cx="830" cy="118" r="4"/><circle cx="866" cy="146" r="3"/><circle cx="848" cy="270" r="3.5"/></g>
'''
    return _wrap(1, body, defs)


# ───────────────────────── 2  Words and Sentences: word wall and pencil ─────────────────────────
def _b2():
    p = "elb2-"
    defs = (
        _lin(p+"wall", [(0, NAVY1, None), (1, NAVY0, None)])
        + _lin(p+"desk", [(0, "#A67C4A", None), (.1, "#7A5630", None), (1, "#2E1E10", None)])
        + _lin(p+"pen", [(0, "#F2C86A", None), (.5, "#E8A93A", None), (1, "#B8842E", None)], 0, 0, 1, 0)
        + _lin(p+"strip", [(0, CREAM2, None), (1, "#E6D6B0", None)])
    )
    cols = ["#F4E9D2", "#FBEFD0", "#F2C86A", "#F4E9D2", "#E6D6B0", "#F2C86A"]
    cards = []
    k = 0
    for row in range(3):
        for col in range(6):
            x = 80 + col * 104 + (row % 2) * 30
            y = 46 + row * 66
            w = 76 + (k * 7) % 22
            c = cols[(k + row) % len(cols)]
            cards.append(f'<rect x="{x}" y="{y}" width="{w}" height="46" rx="5" fill="{c}"/>'
                         f'<rect x="{x+10}" y="{y+18}" width="{w-20}" height="5" rx="2" fill="{NAVY0}" opacity=".18"/>'
                         f'<rect x="{x+w/2-4:.0f}" y="{y-6}" width="8" height="8" rx="4" fill="{GOLD2}"/>')
            k += 1
    dashes = "".join(f'<rect x="{x}" y="332" width="{22 + (x//30)%3*10}" height="6" rx="3" fill="{NAVY1}" opacity=".35"/>' for x in range(340, 780, 52))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="60" y="30" width="700" height="210" rx="6" fill="{NAVY2}" opacity=".7"/><rect x="60" y="30" width="700" height="210" rx="6" fill="none" stroke="{GOLD}" stroke-width="3" opacity=".6"/>
{"".join(cards)}
<path d="M0 282 H1200 V420 H0z" fill="url(#{p}desk)"/><path d="M0 282 H1200 v6 H0z" fill="#C9975A"/>
<g transform="translate(1120 60) rotate(28)"><rect x="-14" y="0" width="28" height="330" fill="url(#{p}pen)"/><path d="M-14 0 h28 v-24 h-28z" fill="#E88A8A"/><rect x="-14" y="-28" width="28" height="12" fill="#B8BFC8"/><path d="M-14 330 L0 372 L14 330z" fill="{CREAM2}"/><path d="M-4 360 L0 372 L4 360z" fill="{INK}"/><path d="M-4 0 v330" stroke="#FFFFFF" stroke-width="3" opacity=".25"/></g>
<rect x="300" y="310" width="520" height="50" rx="6" fill="url(#{p}strip)"/><rect x="300" y="310" width="520" height="50" rx="6" fill="none" stroke="{GOLD2}" stroke-width="2"/>
<path d="M320 348 H800" stroke="{NAVY1}" stroke-width="1.5" opacity=".4"/>{dashes}
<circle cx="798" cy="335" r="4" fill="{NAVY0}" opacity=".6"/>
<rect x="860" y="300" width="80" height="14" rx="3" fill="{CREAM}" opacity=".9"/><rect x="860" y="318" width="60" height="14" rx="3" fill="{GOLD}" opacity=".9"/>
'''
    return _wrap(2, body, defs)


# ───────────────────────── 3  Stories and True Books: two open books at dusk ─────────────────────────
def _b3():
    p = "elb3-"
    defs = (
        _lin(p+"sky", [(0, NAVY0, None), (.55, NAVY2, None), (.9, "#7A5A7A", None), (1, "#E8A93A", None)])
        + _lin(p+"table", [(0, "#6A4A2C", None), (.08, "#4A3220", None), (1, "#1E140A", None)])
        + _lin(p+"page", [(0, CREAM2, None), (1, "#E6D6B0", None)])
        + _lin(p+"pond", [(0, "#4F9BD8", None), (1, "#1E3A66", None)])
    )
    leaders = "".join(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{NAVY1}" stroke-width="1.5"/><circle cx="{x1}" cy="{y1}" r="2.5" fill="{GOLD2}"/><rect x="{x2 + (4 if x2 > x1 else -34)}" y="{y2-3}" width="30" height="6" rx="3" fill="{NAVY1}" opacity=".5"/>'
                      for x1, y1, x2, y2 in ((880, 178, 960, 150), (868, 208, 960, 214), (836, 232, 760, 250), (846, 180, 760, 160)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(11, 40, 150, "#E8E9F5", ".75")}
<circle cx="150" cy="70" r="26" fill="{CREAM}" opacity=".95"/><circle cx="140" cy="64" r="22" fill="url(#{p}sky)" opacity=".85"/>
<path d="M0 272 H1200 V420 H0z" fill="url(#{p}table)"/><path d="M0 272 H1200 v5 H0z" fill="#8A6A40"/>
<path d="M120 272 q-6 -30 40 -34 q100 -60 180 -20 q-30 6 -40 30 q-100 -20 -180 24z" fill="{NAVY0}" opacity=".5"/>
<g><path d="M150 110 q120 -26 220 12 v150 q-100 -30 -220 -4z" fill="url(#{p}page)"/><path d="M370 122 q100 -38 220 -12 v158 q-120 -22 -220 4z" fill="url(#{p}page)"/><path d="M370 122 v150" stroke="#B8A078" stroke-width="3"/><path d="M148 112 q120 -26 222 12 q100 -38 222 -12" stroke="#8A6A40" stroke-width="2" fill="none"/></g>
<path d="M180 232 q80 -30 170 -8 q-60 22 -170 8z" fill="url(#{p}pond)"/>
<ellipse cx="262" cy="214" rx="36" ry="12" fill="#3E7A3A"/><path d="M262 214 l26 -10 l-4 18z" fill="url(#{p}pond)"/>
<g fill="#5E9A3E"><ellipse cx="256" cy="200" rx="18" ry="11"/><circle cx="270" cy="192" r="9"/><path d="M238 208 l-10 6 l6 -10z M274 206 l14 3 l-8 -8z"/></g><g fill="{GOLD}"><circle cx="274" cy="188" r="3"/><circle cx="266" cy="188" r="3"/></g>
<g fill="none" stroke="{GOLD}" stroke-width="1.5" opacity=".7"><path d="M292 176 q8 -8 6 -18 M300 178 q12 -10 12 -24"/></g>
<g fill="#3E7A3A" opacity=".8"><path d="M190 200 q4 -30 -2 -60 q8 30 2 60z"/><path d="M204 204 q2 -26 -4 -50 q10 26 4 50z"/></g>
<g stroke="{INK}" stroke-width="2.5" fill="none"><path d="M474 244 q-20 -30 -6 -54 q10 -30 40 -30 q30 0 40 30 q14 24 -6 54z"/><path d="M474 244 q-24 6 -30 20 M548 244 q24 6 30 20"/><path d="M490 184 q-14 -14 -20 -40 M532 184 q14 -14 20 -40"/><circle cx="500" cy="178" r="6"/><circle cx="522" cy="178" r="6"/><path d="M496 208 q15 10 30 0"/></g>
<g stroke="{INK}" stroke-width="1.5" fill="none"><path d="M500 178 L440 150 M522 178 L580 152 M540 220 L580 250 M480 220 L440 250"/></g>
<g fill="{GOLD2}"><rect x="404" y="146" width="36" height="7" rx="3"/><rect x="580" y="148" width="36" height="7" rx="3"/><rect x="580" y="246" width="36" height="7" rx="3"/><rect x="404" y="246" width="36" height="7" rx="3"/></g>
<g><path d="M660 130 q120 -20 220 10 v148 q-100 -24 -220 -8z" fill="url(#{p}page)"/><path d="M880 140 q100 -30 220 -8 v154 q-120 -18 -220 6z" fill="url(#{p}page)"/><path d="M880 140 v148" stroke="#B8A078" stroke-width="3"/><path d="M658 132 q120 -20 222 8 q100 -30 222 -8" stroke="#8A6A40" stroke-width="2" fill="none"/></g>
<g fill="{NAVY1}" opacity=".5"><rect x="690" y="160" width="140" height="6" rx="3"/><rect x="690" y="176" width="120" height="5" rx="2"/><rect x="690" y="190" width="130" height="5" rx="2"/><rect x="690" y="204" width="100" height="5" rx="2"/><rect x="690" y="218" width="130" height="5" rx="2"/><rect x="690" y="232" width="90" height="5" rx="2"/><rect x="690" y="246" width="120" height="5" rx="2"/></g>
<g stroke="{INK}" stroke-width="2.5" fill="none"><path d="M920 172 q-6 -20 12 -34 q18 -14 36 -6 q22 8 30 32 q8 24 -6 42 q-16 20 -42 14 q-22 -6 -30 -24 q-6 -14 0 -24z"/><path d="M940 210 q-20 10 -30 30 M990 208 q20 10 30 30"/><path d="M932 150 q-16 -10 -26 -28 M978 144 q16 -10 26 -28"/><circle cx="946" cy="148" r="5"/><circle cx="968" cy="146" r="5"/></g>
{leaders}
<rect x="1000" y="250" width="140" height="18" rx="3" fill="{GOLD}" opacity=".35"/><rect x="1000" y="250" width="140" height="18" rx="3" fill="none" stroke="{GOLD2}" stroke-width="1.5"/>
<path d="M0 372 H1200 V420 H0z" fill="#0F0A04" opacity=".5"/>
'''
    return _wrap(3, body, defs)


# ───────────────────────── 4  Writing and Telling: author's chair ─────────────────────────
def _b4():
    p = "elb4-"
    defs = (
        _lin(p+"wall", [(0, NAVY1, None), (1, NAVY0, None)])
        + _lin(p+"win", [(0, "#F6D98C", None), (.5, GOLD, None), (1, "#E8A93A", None)])
        + _rad(p+"glow", [(0, GOLD, .45), (1, GOLD, 0)])
        + _lin(p+"rug", [(0, "#2C6A7A", None), (1, "#173A4A", None)])
        + _lin(p+"floor", [(0, "#5A4028", None), (1, "#221608", None)])
        + _lin(p+"chair", [(0, "#8A3A2E", None), (1, "#5A2419", None)])
    )
    aud = "".join(f'<g fill="{INK}" transform="translate({x} {y}) scale({s})"><circle cx="0" cy="-30" r="14"/><path d="M-22 4 q0 -30 22 -30 q22 0 22 30 l-8 6 h-28z"/><path d="M-30 10 q30 -14 60 0 q-30 8 -60 0z"/></g>'
                  for x, y, s in ((470, 300, 1.0), (560, 286, .9), (650, 300, 1.0), (740, 288, .9), (830, 302, 1.0), (515, 330, .95), (605, 336, .95), (695, 330, .95), (785, 338, .95)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="470" y="30" width="300" height="180" rx="4" fill="url(#{p}win)"/><g fill="{NAVY0}" opacity=".85"><rect x="616" y="30" width="8" height="180"/><rect x="470" y="116" width="300" height="8"/></g><rect x="462" y="22" width="316" height="196" rx="6" fill="none" stroke="{CREAM}" stroke-width="6"/>
<ellipse cx="620" cy="260" rx="380" ry="120" fill="url(#{p}glow)"/>
<path d="M0 272 H1200 V420 H0z" fill="url(#{p}floor)"/>
<ellipse cx="640" cy="330" rx="330" ry="60" fill="url(#{p}rug)"/><ellipse cx="640" cy="330" rx="290" ry="46" fill="none" stroke="{GOLD}" stroke-width="2" opacity=".35"/>
<g fill="url(#{p}chair)"><rect x="160" y="110" width="110" height="20" rx="6"/><rect x="164" y="128" width="14" height="80"/><rect x="252" y="128" width="14" height="80"/><rect x="150" y="200" width="130" height="18" rx="4"/><rect x="156" y="216" width="12" height="60"/><rect x="262" y="216" width="12" height="60"/></g>
<path d="M150 200 h130 v18 h-130z" fill="{GOLD}" opacity=".35"/>
<g fill="{INK}"><circle cx="216" cy="120" r="18"/><path d="M196 140 q20 -10 40 0 l6 56 h-52z"/><path d="M190 196 h52 l6 40 h-64z"/><path d="M188 236 l-8 40 h12 l10 -40z M240 236 l8 40 h-12 l-10 -40z"/></g>
<path d="M186 158 q30 -12 60 0 l2 22 q-30 -10 -64 2z" fill="{CREAM}"/><path d="M216 156 v24" stroke="{INK}" stroke-width="1.5"/><g fill="{GOLD2}" opacity=".7"><rect x="194" y="164" width="16" height="3"/><rect x="224" y="164" width="16" height="3"/><rect x="194" y="170" width="14" height="3"/><rect x="224" y="170" width="14" height="3"/></g>
<g fill="none" stroke="{GOLD}" stroke-width="2.5" opacity=".7"><path d="M250 112 q14 6 18 20"/><path d="M262 100 q22 10 28 32"/><path d="M276 88 q30 14 36 46"/></g>
{aud}
<g stroke="#4A3A2A" stroke-width="7" fill="none" stroke-linecap="round"><path d="M1000 276 L1040 100 L1080 276"/><path d="M1040 100 V276"/><path d="M1008 240 H1072"/></g>
<rect x="972" y="96" width="136" height="150" rx="3" fill="{CREAM2}"/><rect x="972" y="96" width="136" height="150" rx="3" fill="none" stroke="#D2C09A" stroke-width="2"/>
<circle cx="1082" cy="126" r="16" fill="{GOLD}"/><g stroke="{GOLD}" stroke-width="2"><path d="M1082 104 v-6 M1082 148 v6 M1060 126 h-6 M1104 126 h6 M1066 110 l-4 -4 M1098 142 l4 4 M1098 110 l4 -4 M1066 142 l-4 4"/></g>
<path d="M1000 226 v-46 h50 v46z" fill="#E4573D"/><path d="M994 182 l31 -30 l31 30z" fill="{NAVY1}"/><rect x="1018" y="204" width="14" height="22" fill="{CREAM}"/>
<path d="M990 236 q30 -14 60 0" stroke="#7DC15A" stroke-width="4" fill="none"/>
<g fill="{GOLD2}"><rect x="990" y="226" width="6" height="16" rx="2"/><rect x="1004" y="226" width="6" height="16" rx="2" fill="#4F9BD8"/><rect x="1018" y="226" width="6" height="16" rx="2" fill="#E4573D"/><rect x="1032" y="226" width="6" height="16" rx="2" fill="#7DC15A"/></g>
'''
    return _wrap(4, body, defs)


# ───────────────────────── 5  Word Power: a word split into puzzle blocks ─────────────────────────
def _b5():
    p = "elb5-"
    defs = (
        _lin(p+"sky", [(0, NAVY0, None), (1, NAVY2, None)])
        + _rad(p+"glow", [(0, "#FFF1C8", .55), (.5, GOLD, .18), (1, GOLD, 0)])
        + _lin(p+"page", [(0, CREAM2, None), (1, "#E6D6B0", None)])
        + _lin(p+"table", [(0, "#4A3220", None), (.1, "#2E1E10", None), (1, "#120A04", None)])
        + _lin(p+"cover", [(0, "#8A3A2E", None), (1, "#4A1C14", None)])
    )
    def piece(x, y, w, h, fill, left, right, rot):
        # rectangle with a knob on the right (right=1) and a socket on the left (left=1)
        d = f"M0 0 h{w} "
        if right:
            d += f"v{h*.32:.0f} a{h*.16:.0f} {h*.16:.0f} 0 1 1 0 {h*.36:.0f} v{h*.32:.0f} "
        else:
            d += f"v{h} "
        d += f"h-{w} "
        if left:
            d += f"v-{h*.32:.0f} a{h*.16:.0f} {h*.16:.0f} 0 1 1 0 -{h*.36:.0f} z"
        else:
            d += "z"
        dots = "".join(f'<rect x="{12 + i*18}" y="{h/2-5:.0f}" width="12" height="10" rx="3" fill="{INK}" opacity=".35"/>' for i in range(int((w-20)//18)))
        return f'<g transform="translate({x} {y}) rotate({rot})"><path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="2"/>{dots}</g>'
    pages = "".join(f'<path d="M{300+i*4} {262+i*3} q150 -22 300 0" stroke="#D2C09A" stroke-width="1.5" fill="none"/>' for i in range(5))
    lines_l = "".join(f'<rect x="{330}" y="{182+i*12}" width="{110 - (i*17)%40}" height="4" rx="2" fill="{NAVY1}" opacity=".35"/>' for i in range(6))
    lines_r = "".join(f'<rect x="{620}" y="{182+i*12}" width="{120 - (i*23)%50}" height="4" rx="2" fill="{NAVY1}" opacity=".35"/>' for i in range(6))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(5, 60, 200, "#E8E9F5", ".7")}
<ellipse cx="600" cy="150" rx="420" ry="150" fill="url(#{p}glow)"/>
{piece(180, 80, 150, 70, "#E4573D", 0, 1, -8)}
{piece(370, 60, 130, 70, GOLD, 1, 1, 4)}
{piece(540, 82, 110, 70, CREAM, 1, 1, -5)}
{piece(690, 56, 170, 70, "#4F9BD8", 1, 1, 6)}
{piece(900, 84, 120, 70, "#7DC15A", 1, 0, -6)}
<g fill="{GOLD}" opacity=".8"><circle cx="340" cy="140" r="3"/><circle cx="520" cy="150" r="2.5"/><circle cx="660" cy="128" r="3"/><circle cx="880" cy="140" r="2.5"/></g>
<g stroke="{GOLD}" stroke-width="1.5" fill="none" opacity=".4" stroke-dasharray="6 6"><path d="M330 116 L370 100 M500 100 L540 118 M650 118 L690 92 M860 92 L900 116"/></g>
<path d="M0 290 H1200 V420 H0z" fill="url(#{p}table)"/>
<path d="M270 300 q160 -40 330 -12 q170 -28 330 12 v12 q-160 -30 -330 -2 q-170 -28 -330 2z" fill="url(#{p}cover)"/>
<path d="M290 288 q150 -34 310 -10 v-116 q-160 -28 -310 8z" fill="url(#{p}page)"/><path d="M600 278 q160 -24 310 10 v-118 q-150 -36 -310 -8z" fill="url(#{p}page)"/>
<path d="M600 160 v118" stroke="#B8A078" stroke-width="3"/>{pages}
<rect x="330" y="160" width="90" height="8" rx="3" fill="{GOLD2}" opacity=".8"/><rect x="620" y="158" width="70" height="8" rx="3" fill="{GOLD2}" opacity=".8"/>
{lines_l}{lines_r}
<rect x="560" y="160" width="20" height="34" rx="3" fill="#E4573D"/><path d="M560 194 h20 l-10 -10z" fill="{NAVY0}" opacity=".3"/>
<path d="M0 372 H1200 V420 H0z" fill="#06030A" opacity=".5"/>
'''
    return _wrap(5, body, defs)


# ───────────────────────── 6  Reading Stories: rabbit at a campfire, two brothers and a bike ─────────────────────────
def _b6():
    p = "elb6-"
    defs = (
        _lin(p+"sky", [(0, "#050F22", None), (.6, NAVY1, None), (1, "#2C4A7A", None)])
        + _rad(p+"fire", [(0, "#FFE9A0", .95), (.35, "#F2A23A", .55), (1, "#F2A23A", 0)])
        + _lin(p+"flame", [(0, "#FFF1C8", None), (.4, "#F2C86A", None), (1, "#E4573D", None)])
        + _lin(p+"ground", [(0, "#1E3A2E", None), (1, "#0A1A12", None)])
        + _rad(p+"moon", [(0, "#F6F2E0", 1), (.3, "#E8E4CC", .6), (1, "#E8E4CC", 0)])
    )
    trees = "".join(f'<path d="M{x} 300 l{w} -{h} l{w} {h}z" fill="#0C1F2A"/><path d="M{x+w*.4:.0f} {300-h*.3:.0f} l{w*.6:.0f} -{h*.55:.0f} l{w*.6:.0f} {h*.55:.0f}z" fill="#0C1F2A"/>' for x, w, h in ((0, 40, 130), (60, 34, 100), (1090, 40, 140), (1150, 30, 110)))
    spokes = "".join(f'<path d="M0 0 L{40*math.cos(math.radians(a)):.1f} {40*math.sin(math.radians(a)):.1f}"/>' for a in range(0, 360, 30))
    wheel = lambda cx, cy: f'<g transform="translate({cx} {cy})"><circle r="42" fill="none" stroke="{INK}" stroke-width="5"/><g stroke="{INK}" stroke-width="1.5">{spokes}</g><circle r="5" fill="{INK}"/></g>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(23, 90, 230, "#E8E9F5", ".85")}
<circle cx="1000" cy="70" r="60" fill="url(#{p}moon)"/><circle cx="1000" cy="70" r="22" fill="#F6F2E0"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}ground)"/><path d="M0 300 Q200 284 400 296 T800 292 T1200 298 V320 H0z" fill="#1E3A2E"/>
{trees}
<ellipse cx="300" cy="240" rx="220" ry="130" fill="url(#{p}fire)"/>
<g fill="#3A2416"><path d="M240 296 l60 -18 l6 8 l-60 18z"/><path d="M310 278 l60 18 l-6 8 l-60 -18z"/><path d="M262 300 h84 l-4 -8 h-76z"/></g>
<path d="M300 292 q-30 -30 -12 -70 q6 20 18 22 q-4 -34 20 -58 q-2 30 16 44 q14 -12 12 -30 q22 34 2 70 q-24 34 -56 22z" fill="url(#{p}flame)"/><path d="M300 288 q-14 -20 -4 -44 q8 14 12 14 q2 -22 14 -32 q0 22 10 30 q10 12 -4 30 q-14 12 -28 2z" fill="#FFF1C8" opacity=".85"/>
<g fill="{GOLD}"><circle cx="270" cy="200" r="2.5"/><circle cx="330" cy="186" r="2"/><circle cx="292" cy="170" r="1.8"/><circle cx="346" cy="212" r="2.2"/></g>
<g fill="{INK}"><ellipse cx="160" cy="262" rx="46" ry="34"/><circle cx="196" cy="230" r="22"/><ellipse cx="184" cy="196" rx="8" ry="30" transform="rotate(-18 184 196)"/><ellipse cx="204" cy="194" rx="8" ry="30" transform="rotate(8 204 194)"/><circle cx="120" cy="272" r="12"/><path d="M180 288 q30 -6 44 6 l-6 8 q-20 -8 -40 -2z"/></g>
<circle cx="206" cy="226" r="3" fill="{GOLD}"/>
<g fill="{INK}"><ellipse cx="450" cy="284" rx="40" ry="14"/></g>
<path d="M730 300 v-190" stroke="{INK}" stroke-width="2" opacity=".0"/>
{wheel(760, 250)}{wheel(940, 250)}
<g stroke="{INK}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M760 250 L820 180 L900 180 L940 250 L850 250 L820 180"/><path d="M850 250 L830 170 L810 168 M900 180 L880 150 L860 150 M900 180 L910 150 M810 168 l-14 -6"/></g>
<path d="M804 168 h34 l-4 -10 h-26z" fill="{INK}"/>
<g fill="{INK}"><circle cx="690" cy="112" r="20"/><path d="M670 136 q20 -10 40 0 l8 70 h-56z"/><path d="M666 206 h56 l-4 96 h-14 l-10 -70 l-10 70 h-14z"/><path d="M712 150 l40 18 l-4 7 l-40 -18z"/><path d="M674 150 l-22 40 l6 4 l22 -36z"/></g>
<g fill="{INK}"><circle cx="1010" cy="124" r="17"/><path d="M994 144 q16 -8 32 0 l6 60 h-44z"/><path d="M996 204 h40 l-2 96 h-12 l-6 -68 l-6 68 h-12z"/><path d="M992 156 l-40 10 l2 7 l40 -10z"/><path d="M1030 158 l20 36 l-6 4 l-20 -34z"/></g>
<path d="M0 384 Q300 372 600 382 T1200 376 V420 H0z" fill="#040A08" opacity=".6"/>
'''
    return _wrap(6, body, defs)


# ───────────────────────── 7  Reading to Learn: beehive, newspaper and chart ─────────────────────────
def _b7():
    p = "elb7-"
    defs = (
        _lin(p+"sky", [(0, NAVY1, None), (.6, "#2C4A7A", None), (1, "#7A6A5A", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.3, GOLD, .6), (1, GOLD, 0)])
        + _lin(p+"hive", [(0, "#F6D98C", None), (1, "#C9975A", None)])
        + _lin(p+"ground", [(0, "#5A7A3E", None), (1, "#233816", None)])
        + _lin(p+"paper", [(0, "#FBF5E6", None), (1, "#E6DEC8", None)])
    )
    coils = "".join(f'<ellipse cx="240" cy="{y}" rx="{r}" ry="16" fill="url(#{p}hive)" stroke="#8A6A40" stroke-width="2"/>' for y, r in ((240, 92), (214, 90), (188, 84), (162, 74), (138, 60), (116, 42), (98, 24)))
    def bee(x, y, a, s=1):
        return (f'<g transform="translate({x} {y}) rotate({a}) scale({s})"><ellipse cx="0" cy="0" rx="12" ry="7" fill="{GOLD}"/>'
                f'<path d="M-6 -7 v14 M0 -7 v14 M6 -7 v14" stroke="{INK}" stroke-width="2.5"/><circle cx="-13" cy="0" r="5" fill="{INK}"/>'
                f'<ellipse cx="2" cy="-9" rx="9" ry="4" fill="#DDE8F4" opacity=".7" transform="rotate(-20 2 -9)"/><ellipse cx="6" cy="-8" rx="7" ry="3" fill="#DDE8F4" opacity=".6" transform="rotate(-40 6 -8)"/></g>')
    bees = "".join(bee(*b) for b in ((360, 120, -20), (420, 90, 10, .9), (150, 100, 30, .8), (380, 190, -50, .85), (110, 170, 20, .9)))
    loops = "".join(f'<path d="{d}" stroke="{GOLD}" stroke-width="1.5" fill="none" stroke-dasharray="4 5" opacity=".55"/>' for d in ("M300 150 q40 -60 100 -40", "M140 130 q-20 -40 20 -60", "M330 200 q40 -10 70 -20"))
    cols = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="4" rx="2" fill="{NAVY1}" opacity=".45"/>' for x, y, w in [(600 + c*70, 190 + r*11, 54 - (r*13)%20) for c in range(3) for r in range(7)])
    bars = "".join(f'<rect x="{x}" y="{236-h}" width="26" height="{h}" fill="{c}"/>' for x, h, c in ((960, 40, GOLD), (994, 72, "#E4573D"), (1028, 56, "#4F9BD8"), (1062, 96, GOLD), (1096, 68, "#7DC15A")))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="560" cy="80" r="120" fill="url(#{p}sun)"/><circle cx="560" cy="80" r="30" fill="#FFF6D0"/>
<g fill="{CREAM}" opacity=".3"><ellipse cx="900" cy="60" rx="150" ry="10"/><ellipse cx="200" cy="50" rx="110" ry="9"/></g>
<path d="M0 272 Q300 254 600 266 T1200 260 V420 H0z" fill="url(#{p}ground)"/>
<rect x="150" y="248" width="180" height="14" rx="3" fill="#5A3E2A"/><rect x="164" y="262" width="14" height="30" fill="#5A3E2A"/><rect x="302" y="262" width="14" height="30" fill="#5A3E2A"/>
{coils}
<path d="M226 244 q14 -22 28 0z" fill="{INK}"/>
{loops}{bees}
<g transform="translate(590 150) rotate(-4)"><rect x="0" y="0" width="240" height="120" rx="3" fill="url(#{p}paper)"/><rect x="0" y="0" width="240" height="120" rx="3" fill="none" stroke="#C9BFA6" stroke-width="2"/><rect x="12" y="12" width="140" height="14" rx="3" fill="{NAVY0}" opacity=".7"/><rect x="164" y="12" width="64" height="44" rx="2" fill="{GOLD}" opacity=".6"/></g>
{cols}
<path d="M590 270 h240 l-6 8 h-240z" fill="#C9BFA6" opacity=".7"/>
<g stroke="#4A3A2A" stroke-width="6" fill="none" stroke-linecap="round"><path d="M950 270 L980 120 L1010 270"/><path d="M1100 270 L1130 120 L1160 270"/><path d="M980 120 H1130"/></g>
<rect x="940" y="112" width="200" height="140" rx="3" fill="{CREAM2}"/><rect x="940" y="112" width="200" height="140" rx="3" fill="none" stroke="#D2C09A" stroke-width="2"/>
<path d="M954 236 H1130 M954 236 V128" stroke="{INK}" stroke-width="2"/>{bars}
<path d="M0 382 Q300 372 600 380 T1200 374 V420 H0z" fill="#0A1408" opacity=".55"/>
'''
    return _wrap(7, body, defs)


# ───────────────────────── 8  Writing: four drafts on the wall ─────────────────────────
def _b8():
    p = "elb8-"
    defs = (
        _lin(p+"wall", [(0, NAVY0, None), (1, NAVY1, None)])
        + _lin(p+"desk", [(0, "#8A6A40", None), (.08, "#5A4028", None), (1, "#221608", None)])
        + _lin(p+"paper", [(0, "#FBF5E6", None), (1, "#E6DEC8", None)])
        + _rad(p+"lamp", [(0, "#FFF1C8", .7), (.5, GOLD, .25), (1, GOLD, 0)])
    )
    drafts = []
    for i, x in enumerate((100, 340, 580, 820)):
        rot = (-3, 2, -1.5, 2.5)[i]
        lines = "".join(f'<rect x="16" y="{22 + k*14}" width="{140 - (k*29 + i*11)%60}" height="5" rx="2" fill="{NAVY1}" opacity=".45"/>' for k in range(9))
        marks = "".join(f'<path d="M{20 + (k*47 + i*31) % 130} {26 + ((k*3+i) % 9)*14} h{22 + (k*7)%20}" stroke="#E4573D" stroke-width="2.5" opacity=".85"/>' for k in range(i + 1))
        cut = "".join(f'<path d="M{24 + k*40} {40 + k*28} l40 12 l-40 12" stroke="#E4573D" stroke-width="2" fill="none" opacity=".8"/>' for k in range(max(0, i - 1)))
        drafts.append(f'<g transform="translate({x} 60) rotate({rot})"><rect x="0" y="0" width="180" height="150" fill="url(#{p}paper)"/>'
                      f'{lines}{marks}{cut}<rect x="70" y="-6" width="40" height="12" rx="2" fill="{GOLD}" opacity=".85"/></g>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<ellipse cx="620" cy="220" rx="620" ry="180" fill="url(#{p}lamp)"/>
{"".join(drafts)}
<path d="M110 148 h1000" stroke="{GOLD}" stroke-width="1" opacity=".0"/>
<path d="M0 282 H1200 V420 H0z" fill="url(#{p}desk)"/><path d="M0 282 H1200 v6 H0z" fill="#B8925A"/>
<g transform="translate(420 300) rotate(-6)"><rect x="0" y="0" width="200" height="120" rx="4" fill="{CREAM2}"/><path d="M0 0 L100 66 L200 0" stroke="#D2C09A" stroke-width="3" fill="none"/><path d="M0 120 L80 54 M200 120 L120 54" stroke="#D2C09A" stroke-width="2" fill="none"/><circle cx="100" cy="66" r="12" fill="#E4573D"/><circle cx="100" cy="66" r="5" fill="{GOLD}"/></g>
<g transform="translate(700 316) rotate(18)"><rect x="0" y="0" width="180" height="16" rx="8" fill="{NAVY2}"/><rect x="0" y="0" width="60" height="16" rx="8" fill="{GOLD}"/><path d="M180 8 l22 -3 v6z" fill="{CREAM}"/></g>
<g fill="{CREAM}" opacity=".9"><rect x="900" y="296" width="140" height="10" rx="2"/><rect x="906" y="308" width="128" height="10" rx="2"/><rect x="912" y="320" width="116" height="10" rx="2"/></g>
<g fill="{INK}" opacity=".5"><rect x="150" y="300" width="120" height="14" rx="3"/><rect x="160" y="316" width="100" height="14" rx="3"/></g>
'''
    return _wrap(8, body, defs)


# ───────────────────────── 9  Grammar, Speaking and Listening: the book-club circle ─────────────────────────
def _b9():
    p = "elb9-"
    defs = (
        _lin(p+"wall", [(0, NAVY0, None), (1, NAVY2, None)])
        + _lin(p+"floor", [(0, "#4A3520", None), (1, "#1A1008", None)])
        + _lin(p+"rug", [(0, "#8A3A2E", None), (1, "#5A2419", None)])
        + _lin(p+"ribbon", [(0, "#F6D98C", None), (.5, GOLD, None), (1, "#E8A93A", None)], 0, 0, 1, 0)
    )
    def chair(cx, cy, s):
        return (f'<g transform="translate({cx} {cy}) scale({s})" fill="{INK}"><rect x="-22" y="-60" width="44" height="12" rx="4"/><rect x="-20" y="-50" width="6" height="34"/><rect x="14" y="-50" width="6" height="34"/>'
                f'<rect x="-26" y="-18" width="52" height="10" rx="3"/><rect x="-24" y="-8" width="5" height="30"/><rect x="19" y="-8" width="5" height="30"/></g>')
    chairs = "".join(chair(600 + 300*math.cos(math.radians(a)), 300 + 62*math.sin(math.radians(a)), .75 + .35*(1+math.sin(math.radians(a)))/2)
                     for a in (200, 240, 280, 320, 0, 40, 80, 120, 160))
    pts = []
    for i in range(0, 1101, 10):
        x = 50 + i
        y = 120 + 44*math.sin(i/1100*2*math.pi*2.2) + 18*math.sin(i/1100*2*math.pi*5.3)
        pts.append(f"{x} {y:.0f}")
    rib = "M" + " L".join(pts)
    ticks = "".join(f'<circle cx="{x}" cy="{120 + 44*math.sin((x-50)/1100*2*math.pi*2.2) + 18*math.sin((x-50)/1100*2*math.pi*5.3):.0f}" r="3" fill="{INK}" opacity=".5"/>' for x in range(90, 1150, 36))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g fill="{CREAM}" opacity=".08"><rect x="140" y="40" width="120" height="180"/><rect x="940" y="40" width="120" height="180"/></g>
<path d="M0 260 H1200 V420 H0z" fill="url(#{p}floor)"/>
<ellipse cx="600" cy="320" rx="420" ry="90" fill="url(#{p}rug)"/><ellipse cx="600" cy="320" rx="380" ry="72" fill="none" stroke="{GOLD}" stroke-width="3" opacity=".4"/>
<g stroke="{INK}" stroke-width="12" fill="none" opacity=".25"><path d="{rib}" transform="translate(4 8)"/></g>
<path d="{rib}" stroke="url(#{p}ribbon)" stroke-width="18" fill="none" stroke-linecap="round"/>
<path d="{rib}" stroke="{INK}" stroke-width="1.5" fill="none" stroke-dasharray="12 8" opacity=".55"/>
{ticks}
<path d="M1150 {120 + 44*math.sin(2*math.pi*2.2) + 18*math.sin(2*math.pi*5.3):.0f} l30 -14 v28z" fill="{GOLD}"/>
{chairs}
<g fill="{CREAM}"><path d="M570 262 h60 l-4 14 h-52z"/><path d="M574 262 q26 -8 52 0" stroke="{GOLD2}" stroke-width="2"/></g>
'''
    return _wrap(9, body, defs)


# ───────────────────────── 10  The Novel: theater marquee at dusk ─────────────────────────
def _b10():
    p = "elb10-"
    defs = (
        _lin(p+"sky", [(0, NAVY0, None), (.4, "#3A3A6E", None), (.7, "#B05A5A", None), (.9, "#F2A23A", None), (1, "#FFD98A", None)])
        + _rad(p+"sun", [(0, "#FFF1C8", 1), (.3, GOLD, .6), (1, GOLD, 0)])
        + _lin(p+"bldg", [(0, "#241A38", None), (1, "#120C1E", None)])
        + _lin(p+"road", [(0, "#2A2438", None), (1, "#0E0A16", None)])
        + _lin(p+"walk", [(0, "#4A4258", None), (1, "#2A2438", None)])
        + _rad(p+"neon", [(0, GOLD, .5), (1, GOLD, 0)])
    )
    bulbs = "".join(f'<circle cx="{x}" cy="{y}" r="4" fill="#FFF1C8"/>' for x in range(96, 470, 18) for y in (96, 184)) + \
            "".join(f'<circle cx="{x}" cy="{y}" r="4" fill="#FFF1C8"/>' for y in range(114, 180, 18) for x in (96, 468))
    windows = "".join(f'<rect x="{x}" y="{y}" width="10" height="14" fill="{GOLD}" opacity="{.25 + ((x*7+y)%5)*.15:.2f}"/>' for x in range(760, 1180, 40) for y in range(80, 240, 34) if (x*3 + y) % 7 != 0)
    posts = "".join(f'<rect x="{x}" y="{y}" width="28" height="44" rx="2" fill="{CREAM}" opacity=".85"/><rect x="{x+4}" y="{y+6}" width="20" height="22" fill="#E4573D" opacity=".7"/>' for x, y in ((120, 214), (170, 214), (400, 214), (450, 214)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="900" cy="262" r="120" fill="url(#{p}sun)"/><circle cx="900" cy="262" r="40" fill="#FFF1C8"/>
<g fill="#6B3F78" opacity=".45"><ellipse cx="700" cy="90" rx="240" ry="10"/><ellipse cx="1000" cy="130" rx="180" ry="9"/></g>
<g fill="url(#{p}bldg)"><rect x="740" y="60" width="90" height="220"/><rect x="820" y="110" width="120" height="170"/><rect x="930" y="140" width="80" height="140"/><rect x="1000" y="90" width="100" height="190"/><rect x="1090" y="150" width="110" height="130"/></g>
{windows}
<rect x="40" y="40" width="500" height="240" fill="url(#{p}bldg)"/>
<ellipse cx="282" cy="140" rx="300" ry="120" fill="url(#{p}neon)"/>
<rect x="80" y="80" width="404" height="120" rx="6" fill="{NAVY0}"/><rect x="80" y="80" width="404" height="120" rx="6" fill="none" stroke="{GOLD}" stroke-width="5"/>
{bulbs}
<g fill="{CREAM}" opacity=".95"><rect x="130" y="118" width="120" height="14" rx="4"/><rect x="266" y="118" width="80" height="14" rx="4"/><rect x="150" y="146" width="60" height="14" rx="4"/><rect x="226" y="146" width="140" height="14" rx="4"/><rect x="382" y="146" width="40" height="14" rx="4"/></g>
<path d="M60 202 h440 l-30 30 h-380z" fill="#3A2A50"/>
<rect x="220" y="214" width="120" height="66" fill="{GOLD}" opacity=".6"/><rect x="278" y="214" width="4" height="66" fill="{NAVY0}"/>
{posts}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}road)"/><path d="M0 280 H1200 v22 H0z" fill="url(#{p}walk)"/><path d="M0 302 H1200 v4 H0z" fill="#5A5270"/>
<g stroke="{GOLD}" stroke-width="3" opacity=".5" stroke-dasharray="40 30"><path d="M0 370 H1200"/></g>
<path d="M640 300 v-160" stroke="{INK}" stroke-width="5"/><ellipse cx="640" cy="136" rx="10" ry="14" fill="{GOLD}"/><ellipse cx="640" cy="136" rx="26" ry="10" fill="{GOLD}" opacity=".2"/>
<g fill="{INK}"><circle cx="720" cy="176" r="15"/><path d="M706 194 q14 -8 28 0 l4 48 h-36z"/><path d="M708 242 h32 l-2 60 h-9 l-4 -44 l-10 44 h-11z"/><path d="M736 202 l6 40 h-6 l-8 -40z M710 202 l-14 32 l6 3 l14 -30z"/></g>
<path d="M700 300 q20 -10 60 0 q-30 4 -60 0z" fill="{INK}" opacity=".6"/>
<path d="M0 384 H1200 V420 H0z" fill="#06040A" opacity=".55"/>
'''
    return _wrap(10, body, defs)


# ───────────────────────── 11  Nonfiction and Argument: Chicago 1871 and two newspapers ─────────────────────────
def _b11():
    p = "elb11-"
    defs = (
        _lin(p+"sky", [(0, "#0A0A1E", None), (.5, "#3A1A2A", None), (.8, "#A0402A", None), (1, "#F2A23A", None)])
        + _lin(p+"fire", [(0, "#FFF1C8", None), (.5, GOLD, None), (1, "#E4573D", None)])
        + _lin(p+"city", [(0, "#1A0C10", None), (1, "#0A0508", None)])
        + _lin(p+"water", [(0, "#6A2A20", None), (.5, "#2A1420", None), (1, "#0A0810", None)])
        + _lin(p+"paper", [(0, "#FBF5E6", None), (1, "#E6DEC8", None)])
        + _rad(p+"lens", [(0, "#FFF6D0", .35), (.7, GOLD, .12), (1, GOLD, 0)])
    )
    sky = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{300-y}" fill="url(#{p}city)"/>' for x, y, w in ((0, 200, 60), (60, 150, 50), (110, 190, 40), (150, 120, 70), (220, 170, 50), (270, 130, 30), (300, 180, 90), (390, 100, 60), (450, 160, 60), (510, 140, 40), (550, 190, 80), (630, 110, 50), (680, 170, 70), (750, 130, 60), (810, 190, 40), (850, 150, 70), (920, 120, 40), (960, 180, 80), (1040, 140, 60), (1100, 170, 50), (1150, 120, 50)))
    steeples = "".join(f'<path d="M{x} {y} l16 -60 l16 60z" fill="url(#{p}city)"/>' for x, y in ((404, 100), (644, 110), (924, 120)))
    flames = "".join(f'<path d="M{x} {y} q-12 -20 -4 -{h} q6 12 12 12 q2 -18 14 -30 q0 20 8 26 q8 -8 6 -20 q14 22 2 {h-8} q-16 22 -38 10z" fill="url(#{p}fire)" opacity=".92"/>' for x, y, h in ((170, 124, 50), (320, 184, 40), (400, 106, 60), (530, 146, 44), (660, 116, 56), (770, 134, 46), (880, 154, 50), (980, 184, 40), (1060, 144, 48), (1170, 124, 44)))
    sparks = _stars(41, 70, 200, GOLD, ".8")
    smoke = "".join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*.4:.0f}" fill="#2A1A1E" opacity=".5"/>' for x, y, r in ((200, 70, 90), (460, 50, 120), (720, 70, 100), (960, 60, 110), (600, 30, 140)))
    cols1 = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="3" rx="1.5" fill="{NAVY0}" opacity=".5"/>' for x, y, w in [(330 + c*60, 268 + r*8, 46 - (r*11 + c*5)%18) for c in range(3) for r in range(8)])
    cols2 = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="3" rx="1.5" fill="{NAVY0}" opacity=".5"/>' for x, y, w in [(640 + c*60, 262 + r*8, 46 - (r*7 + c*9)%18) for c in range(3) for r in range(8)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{smoke}
{flames}
{sky}{steeples}
{sparks}
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}water)"/>
<g fill="{GOLD}" opacity=".25"><path d="M100 316 q80 6 160 0 q-80 8 -160 0z"/><path d="M700 322 q120 8 240 0 q-120 10 -240 0z"/><path d="M1000 312 q60 6 120 0 q-60 8 -120 0z"/></g>
<g transform="translate(320 250) rotate(-3)"><rect x="0" y="0" width="200" height="110" rx="3" fill="url(#{p}paper)"/><rect x="10" y="10" width="120" height="12" rx="3" fill="{NAVY0}" opacity=".75"/><rect x="140" y="10" width="50" height="40" rx="2" fill="#E4573D" opacity=".55"/></g>
{cols1}
<g transform="translate(630 244) rotate(3)"><rect x="0" y="0" width="200" height="110" rx="3" fill="url(#{p}paper)"/><rect x="10" y="8" width="150" height="12" rx="3" fill="{NAVY0}" opacity=".75"/><rect x="10" y="26" width="80" height="6" rx="2" fill="{GOLD2}" opacity=".8"/></g>
{cols2}
<circle cx="560" cy="260" r="70" fill="url(#{p}lens)"/>
<circle cx="560" cy="260" r="60" fill="{CREAM}" opacity=".18"/><circle cx="560" cy="260" r="60" fill="none" stroke="{GOLD2}" stroke-width="8"/><circle cx="560" cy="260" r="52" fill="none" stroke="{CREAM}" stroke-width="2" opacity=".6"/>
<path d="M608 300 l70 60" stroke="{GOLD2}" stroke-width="16" stroke-linecap="round"/><path d="M612 304 l62 52" stroke="#5A2419" stroke-width="8" stroke-linecap="round"/>
<path d="M530 236 q30 -20 60 0" stroke="{CREAM}" stroke-width="3" fill="none" opacity=".5"/>
<g fill="{NAVY0}" opacity=".55"><rect x="520" y="250" width="70" height="5" rx="2"/><rect x="514" y="262" width="88" height="5" rx="2"/><rect x="520" y="274" width="76" height="5" rx="2"/></g>
<path d="M0 380 H1200 V420 H0z" fill="#040208" opacity=".55"/>
'''
    return _wrap(11, body, defs)


# ───────────────────────── 12  Words: Stems and Meaning: the word forge ─────────────────────────
def _b12():
    p = "elb12-"
    defs = (
        _lin(p+"sky", [(0, "#050F22", None), (.7, NAVY1, None), (1, "#4A3A5A", None)])
        + _rad(p+"forge", [(0, "#FFF1C8", .95), (.3, "#F2A23A", .55), (1, "#F2A23A", 0)])
        + _lin(p+"hot", [(0, "#FFF1C8", None), (.4, GOLD, None), (1, "#E4573D", None)], 0, 0, 1, 0)
        + _lin(p+"stone", [(0, "#C9BFA6", None), (1, "#6A6050", None)])
        + _lin(p+"ground", [(0, "#2A2420", None), (1, "#0E0A08", None)])
        + _lin(p+"anvil", [(0, "#3A3E4A", None), (1, "#141820", None)])
    )
    def column(x, h):
        flutes = "".join(f'<path d="M{x+8+i*8} {292-h+22} v{h-32}" stroke="#8A8070" stroke-width="1.5" opacity=".7"/>' for i in range(5))
        return (f'<rect x="{x-8}" y="{292-h}" width="60" height="12" fill="url(#{p}stone)"/><rect x="{x-2}" y="{292-h+12}" width="48" height="10" fill="#B0A690"/>'
                f'<rect x="{x}" y="{292-h+22}" width="44" height="{h-32}" fill="url(#{p}stone)"/>{flutes}'
                f'<rect x="{x-6}" y="{282}" width="56" height="10" fill="#B0A690"/>')
    def voussoirs(cx, cy, r):
        out = []
        for i in range(9):
            a0 = math.pi + i * math.pi / 9
            a1 = a0 + math.pi / 9
            x0, y0 = cx + r*math.cos(a0), cy + r*math.sin(a0)
            x1, y1 = cx + r*math.cos(a1), cy + r*math.sin(a1)
            xi0, yi0 = cx + (r-26)*math.cos(a0), cy + (r-26)*math.sin(a0)
            xi1, yi1 = cx + (r-26)*math.cos(a1), cy + (r-26)*math.sin(a1)
            out.append(f'<path d="M{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f} L{xi1:.1f} {yi1:.1f} A{r-26} {r-26} 0 0 0 {xi0:.1f} {yi0:.1f}z" fill="{"#B0A690" if i % 2 else "#8A8070"}" stroke="#4A4238" stroke-width="1"/>')
        return "".join(out)
    sparks = "".join(f'<path d="M600 190 l{dx} {dy}" stroke="{GOLD}" stroke-width="2" stroke-linecap="round" opacity=".9"/><circle cx="{600+dx*1.15:.0f}" cy="{190+dy*1.15:.0f}" r="2.5" fill="#FFF1C8"/>' for dx, dy in ((-40, -50), (30, -60), (-70, -20), (60, -30), (-20, -70), (80, -8), (-90, -50), (50, -80)))
    bar = "".join(f'<rect x="{560+i*32}" y="178" width="28" height="22" rx="4" fill="url(#{p}hot)" opacity="{1 - i*.12:.2f}"/>' for i in range(5))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(77, 50, 160, "#E8E9F5", ".7")}
{column(70, 220)}{column(160, 220)}{column(250, 220)}
<path d="M54 72 l0 -18 h268 l0 18z" fill="url(#{p}stone)"/><path d="M40 54 l150 -40 l150 40z" fill="#8A8070"/>
<rect x="60" y="72" width="256" height="14" fill="#B0A690"/>
<rect x="880" y="130" width="300" height="162" fill="url(#{p}stone)"/><path d="M910 292 v-110 a120 120 0 0 1 240 0 v110z" fill="url(#{p}sky)"/>
{voussoirs(1030, 182, 146)}
<rect x="880" y="120" width="300" height="12" fill="#B0A690"/><rect x="1016" y="34" width="28" height="18" fill="#8A8070"/>
<ellipse cx="600" cy="230" rx="260" ry="120" fill="url(#{p}forge)"/>
<g fill="url(#{p}anvil)"><path d="M480 210 q-40 -4 -40 20 q0 16 30 16 h30 v14 h-30 v20 h-30 v-20 h20 v-14 h200 v14 h20 v20 h-30 v-20 h-30 v-14 h60 q30 0 30 -16 q0 -24 -40 -20z"/><rect x="500" y="200" width="200" height="26" rx="4"/></g>
<rect x="500" y="200" width="200" height="6" fill="#5A5E6A"/>
{bar}
<g transform="translate(720 96) rotate(30)"><rect x="-8" y="0" width="16" height="120" rx="4" fill="#5A3E2A"/><rect x="-36" y="-22" width="72" height="42" rx="4" fill="#2A2E3A"/><rect x="-36" y="-22" width="72" height="8" rx="3" fill="#5A5E6A"/></g>
{sparks}
<path d="M0 292 H1200 V420 H0z" fill="url(#{p}ground)"/><path d="M0 292 H1200 v6 H0z" fill="#4A4238"/>
<rect x="440" y="292" width="320" height="30" fill="#1A1C24"/><rect x="460" y="322" width="280" height="14" fill="#0E1016"/>
<ellipse cx="600" cy="310" rx="150" ry="10" fill="{GOLD}" opacity=".18"/>
<path d="M0 380 H1200 V420 H0z" fill="#040204" opacity=".55"/>
'''
    return _wrap(12, body, defs)


_BUILDERS = {1: _b1, 2: _b2, 3: _b3, 4: _b4, 5: _b5, 6: _b6, 7: _b7, 8: _b8, 9: _b9, 10: _b10, 11: _b11, 12: _b12}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (1..12)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    import xml.etree.ElementTree as ET
    for n in range(1, 13):
        ET.fromstring(BANNERS[n])
        print(n, len(BANNERS[n].encode("utf-8")), "bytes")
