"""Unit banners for the English Language Arts K-12 course, units 13-24 (grades 6-12).

Twelve drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_ela_b import BANNERS, CREDITS, banner
    banner(19)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"elb{n}-" so all 24 course banners can sit on one contents page.  No text,
no letterforms, no images, no filters, no external references.  Gradients
and paths only.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm (floors, tables, ground,
water) and the action sits in the upper 55%.
"""

import math

W, H = 1200, 420

CREDITS = {
    13: "Drawn scene: a kitchen table at night with Grandma seated under a hanging lamp, a plate and cup set before her, and a giant golden comma hovering in the window's navy dark",
    14: "Drawn scene: a chalkboard where one thesis line has been written and struck out four times and stands clean the fifth, beside a window opening on a warm kitchen memory with a kettle",
    15: "Drawn scene: an Elizabethan thrust stage with pillars and a painted canopy, two figures facing each other on the boards, and a yellow autumn wood with two roads diverging beyond",
    16: "Drawn scene: the Gettysburg field under a navy sky with a lectern on a platform, a wide crowd of silhouettes with hats, flags on poles, and a lone speaker on a soapbox",
    17: "Drawn scene: a low stone wall running between an apple orchard and a pine field, with a chemistry flask and an unrolled scroll resting on the wall in the golden light",
    18: "Drawn scene: a campaign banner torn into three uneven pieces hanging from a rope, a courtroom gavel on its block, and a will with a red seal on a dark desk",
    19: "Drawn scene: eight books stacked on a research desk with three of them glowing gold, a green-shaded lamp, an open notebook and a pen under a tall window",
    20: "Drawn scene: a barred jail cell window at Concord opening on a moonlit pond and pines, a raven perched on the sill, and a cot and candle inside the stone cell",
    21: "Drawn scene: a long sentence as a golden ribbon looping across a navy field, a short one as a string of cream beads below it, and a pair of open scissors",
    22: "Drawn scene: Jefferson's portable writing desk with a draft page of lines and thick cross-outs, a quill in an inkwell, a candle, and a small bar graph card propped beside it",
    23: "Drawn scene: two publishers' stone buildings facing each other across a street with a giant comma standing between them, an envelope and a cover letter on the cobbles",
    24: "Drawn scene: a lectern with a projector beam throwing a Chicago neighborhood map with the lake edge onto a screen, rows of seated silhouettes and one raised hand",
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
            f'<circle cx="{x:.0f}" cy="{y-h*0.62-r-1:.0f}" r="{r:.1f}"/>')


def _comma(x, y, s, fill):
    """A giant comma glyph drawn as a shape (a dot with a tapering tail), centre of the dot at (x, y)."""
    return (f'<g transform="translate({x} {y}) scale({s})" fill="{fill}">'
            '<circle r="10"/>'
            '<path d="M-9 4 q6 14 -2 30 q-6 10 -14 12 q10 -12 8 -24 q-2 -10 -4 -14z"/>'
            '</g>')


# ───────────────────────── 13  Grammar and Style: Grandma at the kitchen table ─────────────────────────
def _b13():
    p = "elb13-"
    defs = (
        _lin(p+"wall", [(0, "#3A2C26", None), (.5, "#5A4434", None), (1, "#7A5C44", None)])
        + _lin(p+"night", [(0, "#070B22", None), (.7, "#12204A", None), (1, "#1E3060", None)])
        + _rad(p+"lamp", [(0, "#FFE9B0", .9), (.25, "#FFD070", .45), (.6, "#FFC050", .1), (1, "#FFC050", 0)])
        + _lin(p+"table", [(0, "#C8A060", None), (.12, "#8A6236", None), (1, "#4A3218", None)])
        + _lin(p+"cloth", [(0, "#F4E8CC", None), (1, "#D8C49A", None)])
        + _rad(p+"plate", [(0, "#FFFFFF", 1), (.7, "#F2ECDC", 1), (1, "#C8BC9C", 1)])
        + _lin(p+"floor", [(0, "#2E2016", None), (1, "#120C08", None)])
    )
    tiles = "".join(f'<path d="M{x} 40 V262"/>' for x in range(0, 1200, 60))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g stroke="#2A1E18" stroke-width="1" opacity=".35">{tiles}<path d="M0 100 H1200 M0 160 H1200 M0 220 H1200"/></g>
<rect x="640" y="30" width="360" height="210" rx="4" fill="#2A1E18"/>
<rect x="652" y="42" width="336" height="186" fill="url(#{p}night)"/>
{_stars(13, 26, 190, "#E8E0FF", ".7", 660, 980)}
<g stroke="#2A1E18" stroke-width="8"><path d="M820 42 V228 M652 136 H988"/></g>
{_comma(870, 96, 3.2, "#F2C24A")}
{_comma(870, 96, 3.2, "#FFE9B0")}
<g opacity=".18">{_comma(872, 100, 3.6, "#FFD070")}</g>
<path d="M330 0 v50" stroke="#2A1E18" stroke-width="4"/>
<path d="M270 100 L330 50 L390 100z" fill="#C8A060"/><path d="M280 100 h100 v6 h-100z" fill="#8A6236"/>
<circle cx="330" cy="150" r="150" fill="url(#{p}lamp)"/>
<g fill="#5A4434" opacity=".9"><rect x="60" y="120" width="120" height="80" rx="3"/><rect x="66" y="126" width="108" height="30" rx="2" fill="#7A5C44"/><rect x="66" y="162" width="108" height="32" rx="2" fill="#7A5C44"/></g>
<g fill="#C8A060" opacity=".7"><rect x="112" y="138" width="16" height="4" rx="2"/><rect x="112" y="176" width="16" height="4" rx="2"/></g>
<g fill="#F2ECDC" opacity=".55"><rect x="1060" y="70" width="80" height="120" rx="3"/><rect x="1070" y="84" width="60" height="4"/><rect x="1070" y="100" width="44" height="4"/><rect x="1070" y="116" width="54" height="4"/><rect x="1070" y="132" width="40" height="4"/></g>
<g fill="#1E1410">
<path d="M228 262 q-6 -60 30 -76 q10 -40 22 -50 q22 -6 34 10 q10 20 4 40 q30 8 30 40 q0 24 -2 36z"/>
<circle cx="292" cy="112" r="22"/><path d="M270 112 q-6 -22 22 -26 q28 4 22 26 q-4 -8 -22 -8 q-18 0 -22 8z" fill="#3A2C26"/>
<path d="M292 88 q-14 -4 -12 12" stroke="#3A2C26" stroke-width="3" fill="none"/>
<path d="M330 180 q40 10 70 8 q6 4 0 10 q-40 4 -76 -4z"/>
<path d="M340 186 q30 -4 56 -2" stroke="#4A3218" stroke-width="2" fill="none"/>
</g>
<path d="M300 176 q8 -12 22 -8 q10 4 6 14 q-14 -4 -28 -6z" fill="#F2ECDC" opacity=".7"/>
<path d="M0 262 Q400 254 700 258 T1200 254 V286 H0z" fill="url(#{p}table)"/>
<path d="M120 262 Q400 254 700 258 T1000 254 V276 H120z" fill="url(#{p}cloth)"/>
<g stroke="#D8C49A" stroke-width="1" opacity=".6"><path d="M180 258 H960 M180 268 H960"/></g>
<ellipse cx="470" cy="256" rx="70" ry="14" fill="url(#{p}plate)"/><ellipse cx="470" cy="256" rx="50" ry="9" fill="none" stroke="#C8BC9C" stroke-width="1"/>
<g fill="#8A6236"><ellipse cx="452" cy="252" rx="16" ry="5"/><ellipse cx="486" cy="254" rx="12" ry="4"/></g>
<path d="M552 256 h4 v-18 h-4z M550 238 h8 v-4 h-8z" fill="#C8BC9C"/><path d="M400 254 h3 v-20 h-3z M398 234 l3 -10 l3 10z" fill="#C8BC9C"/>
<g transform="translate(640 250)"><path d="M-14 6 v-22 h28 v22z" fill="#F2ECDC"/><path d="M14 -12 q12 0 12 8 q0 8 -12 8" stroke="#F2ECDC" stroke-width="3" fill="none"/><path d="M-10 -18 q6 -10 0 -18 M0 -18 q6 -12 0 -22 M10 -18 q6 -10 0 -18" stroke="#F2ECDC" stroke-width="1.5" fill="none" opacity=".5"/></g>
<path d="M0 286 H1200 V420 H0z" fill="url(#{p}floor)"/>
<g stroke="#4A3218" stroke-width="4"><path d="M150 286 v40 M980 286 v40"/></g>
<g stroke="#120C08" stroke-width="1.2" opacity=".5"><path d="M0 340 H1200 M0 390 H1200"/></g>
<g fill="#FFD070" opacity=".08"><ellipse cx="330" cy="300" rx="240" ry="14"/></g>
'''
    return _wrap(13, body, defs)


# ───────────────────────── 14  Writing Across Forms: the thesis rewritten five times ─────────────────────────
def _b14():
    p = "elb14-"
    defs = (
        _lin(p+"wall", [(0, "#1C2440", None), (1, "#28345A", None)])
        + _lin(p+"board", [(0, "#1E3A30", None), (1, "#12281F", None)])
        + _lin(p+"memory", [(0, "#F8E2A8", None), (.5, "#F0C070", None), (1, "#C88A48", None)])
        + _rad(p+"memglow", [(0, "#FFF0C0", .7), (1, "#FFF0C0", 0)])
        + _lin(p+"ledge", [(0, "#8A6A3A", None), (1, "#5A4222", None)])
        + _lin(p+"floor", [(0, "#2A2A34", None), (.3, "#1A1A22", None), (1, "#0C0C10", None)])
    )
    # five attempts: four wobbly chalk lines each with a strike, the fifth a clean confident gold stroke
    lines = []
    g = _lcg(14)
    for i in range(4):
        y = 76 + i * 30
        segs = []
        x = 120
        while x < 560:
            w = 14 + next(g) % 30
            segs.append(f'<path d="M{x} {y + (next(g) % 5 - 2)} h{w}"/>')
            x += w + 8 + next(g) % 8
        lines.append(f'<g stroke="#E8ECE4" stroke-width="3" stroke-linecap="round" opacity="{.4 + i * .1:.1f}">{"".join(segs)}</g>')
        lines.append(f'<path d="M110 {y + 2} Q330 {y - 8} 580 {y + 3}" stroke="#E8ECE4" stroke-width="2.5" fill="none" opacity=".8"/>')
    lines.append('<path d="M120 198 q60 -6 120 -2 q80 4 160 0 q60 -2 160 2" stroke="#F2C24A" stroke-width="6" stroke-linecap="round" fill="none"/>')
    lines.append('<path d="M120 212 h80 M220 212 h140 M380 212 h100" stroke="#F2C24A" stroke-width="3" stroke-linecap="round" opacity=".6"/>')
    chalkdust = "".join(f'<circle cx="{110 + next(g) % 480}" cy="{60 + next(g) % 170}" r="{0.6 + (next(g) % 8) / 10:.1f}"/>' for _ in range(40))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="70" y="36" width="560" height="200" rx="3" fill="url(#{p}board)"/>
<rect x="70" y="36" width="560" height="200" rx="3" fill="none" stroke="#8A6A3A" stroke-width="5"/>
<g fill="#E8ECE4" opacity=".25">{chalkdust}</g>
{"".join(lines)}
<rect x="70" y="236" width="560" height="10" fill="url(#{p}ledge)"/>
<g fill="#F2F2EE"><rect x="100" y="230" width="22" height="6" rx="1"/><rect x="128" y="230" width="22" height="6" rx="1"/></g><rect x="160" y="230" width="18" height="6" rx="1" fill="#F2C24A"/>
<rect x="780" y="30" width="330" height="220" rx="4" fill="#3A2C22"/>
<rect x="794" y="44" width="302" height="192" fill="url(#{p}memory)"/>
<circle cx="945" cy="140" r="150" fill="url(#{p}memglow)"/>
<g stroke="#3A2C22" stroke-width="7"><path d="M945 44 V236 M794 140 H1096"/></g>
<g fill="#7A4A2A" opacity=".9">
<path d="M804 200 h280 v8 h-280z"/><path d="M816 208 v28 M1072 208 v28" stroke="#7A4A2A" stroke-width="5"/>
<path d="M860 200 v-20 q0 -6 6 -6 h30 q6 0 6 6 v20z"/><path d="M902 186 q14 -2 14 10 q0 6 -14 4" fill="none" stroke="#7A4A2A" stroke-width="3"/><path d="M866 174 q12 -18 30 0z"/>
<path d="M990 200 v-8 h60 v8z"/><ellipse cx="1020" cy="190" rx="34" ry="8"/>
<path d="M1000 100 q20 -30 46 0 q-10 -8 -23 -8 q-13 0 -23 8z"/><path d="M1018 92 h10 v20 h-10z"/>
<path d="M1010 132 h24 v10 h-24z" opacity=".7"/>
</g>
<path d="M878 168 q4 -14 -2 -24 q-4 -8 2 -16" stroke="#F8E2A8" stroke-width="2" fill="none" opacity=".8"/><path d="M890 166 q4 -12 -2 -22 q-4 -8 2 -14" stroke="#F8E2A8" stroke-width="2" fill="none" opacity=".6"/>
<g fill="#F2F2EE" opacity=".5"><path d="M810 60 h60 v50 h-60z"/><path d="M820 70 h40 M820 82 h30 M820 94 h36" stroke="#3A2C22" stroke-width="2"/></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M0 262 H1200 V268 H0z" fill="#3A3A48"/>
<g fill="#28345A"><path d="M380 262 v-30 h140 v30z"/><path d="M372 232 h156 v-8 h-156z"/></g>
<g fill="#F2F2EE" opacity=".9"><path d="M400 224 l6 -20 h60 l-6 20z"/><path d="M412 212 h40 M410 218 h32" stroke="#3A5AA0" stroke-width="1.5" opacity=".7"/></g>
<path d="M470 224 l16 -30" stroke="#F2C24A" stroke-width="3" stroke-linecap="round"/>
<g stroke="#0C0C10" stroke-width="1.2" opacity=".5"><path d="M0 330 H1200 M0 386 H1200"/></g>
<g fill="#FFF0C0" opacity=".07"><ellipse cx="945" cy="300" rx="180" ry="12"/></g>
'''
    return _wrap(14, body, defs)


# ───────────────────────── 15  Literature: an Elizabethan stage and a yellow wood ─────────────────────────
def _b15():
    p = "elb15-"
    defs = (
        _lin(p+"sky", [(0, "#0A1030", None), (.5, "#1E2C60", None), (.8, "#5A4A70", None), (1, "#B08A58", None)])
        + _lin(p+"wood", [(0, "#F2C24A", None), (.5, "#D89A30", None), (1, "#8A5A20", None)])
        + _lin(p+"canopy", [(0, "#2A3A70", None), (1, "#1A2450", None)])
        + _lin(p+"pillar", [(0, "#E8D8B8", None), (.5, "#C8B088", None), (1, "#8A6A40", None)], 0, 0, 1, 0)
        + _lin(p+"boards", [(0, "#A07A44", None), (.1, "#7A5A30", None), (1, "#3A2A14", None)])
        + _lin(p+"road", [(0, "#E8D0A0", .9), (1, "#B08A58", .5)])
        + _lin(p+"ground", [(0, "#2A2014", None), (1, "#120C08", None)])
    )
    stars = "".join(f'<circle cx="{x}" cy="{y}" r="1.5"/>' for x, y in ((40, 30), (120, 60), (200, 22), (320, 50), (480, 18), (560, 44), (640, 30), (760, 14), (1040, 40)))
    def tree(x, y, s, col):
        return (f'<g transform="translate({x} {y}) scale({s})" fill="{col}">'
                '<path d="M-3 0 v-30 h6 v30z"/><circle cx="0" cy="-42" r="22"/><circle cx="-14" cy="-32" r="14"/><circle cx="14" cy="-34" r="15"/><circle cx="0" cy="-58" r="12"/></g>')
    trees = "".join([tree(760, 236, 1.1, "#D89A30"), tree(820, 240, .8, "#F2C24A"), tree(900, 234, 1.25, "#C88A28"), tree(1000, 238, .9, "#E8B040"), tree(1080, 232, 1.2, "#D89A30"), tree(1160, 240, .95, "#F2C24A"), tree(860, 246, .6, "#8A5A20"), tree(960, 248, .55, "#8A5A20")])
    # leaves scattered
    g = _lcg(15)
    leaves = "".join(f'<ellipse cx="{720 + next(g) % 480}" cy="{150 + next(g) % 100}" rx="3" ry="1.6" transform="rotate({next(g) % 90} {0} {0})" />' for _ in range(30))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#F2ECDC" opacity=".8">{stars}</g>
<circle cx="980" cy="70" r="26" fill="#F8F0D0"/><circle cx="980" cy="70" r="60" fill="#F8F0D0" opacity=".12"/>
<path d="M700 250 Q800 236 900 244 T1200 240 V262 H700z" fill="#7A5A28"/>
<g fill="#D89A30" opacity=".6">{leaves}</g>
{trees}
<path d="M840 262 Q860 236 900 220 Q940 206 1000 196" stroke="url(#{p}road)" stroke-width="18" stroke-linecap="round" fill="none"/>
<path d="M840 262 Q820 232 800 216 Q770 196 740 190" stroke="url(#{p}road)" stroke-width="16" stroke-linecap="round" fill="none"/>
<path d="M0 60 H660 V90 H0z" fill="url(#{p}canopy)"/>
<path d="M0 60 L330 20 L660 60z" fill="#1A2450"/>
<g fill="#F2C24A" opacity=".8"><circle cx="120" cy="74" r="4"/><circle cx="220" cy="72" r="3"/><circle cx="330" cy="76" r="5"/><circle cx="440" cy="72" r="3"/><circle cx="540" cy="74" r="4"/></g>
<path d="M0 90 H660 V104 H0z" fill="#8A6A40"/>
<path d="M110 104 h34 V262 h-34z" fill="url(#{p}pillar)"/><path d="M520 104 h34 V262 h-34z" fill="url(#{p}pillar)"/>
<g fill="#C8B088"><rect x="102" y="104" width="50" height="10"/><rect x="512" y="104" width="50" height="10"/></g>
<path d="M144 110 H520 V220 H144z" fill="#1A1430"/>
<g fill="#3A2C50"><rect x="230" y="130" width="60" height="90" rx="30"/><rect x="380" y="130" width="60" height="90" rx="30"/></g>
<rect x="290" y="150" width="90" height="70" fill="#2A2040"/><rect x="300" y="140" width="70" height="8" fill="#8A6A40"/>
<g fill="#0C0A16">
<g transform="translate(250 262)"><path d="M-22 0 l4 -70 q0 -12 12 -14 l4 -16 h8 l4 16 q12 2 12 14 l4 70z"/><circle cx="4" cy="-108" r="12"/><path d="M-6 -74 l-34 -30 l3 -4 l36 26z"/><path d="M-20 -60 q-10 30 -4 60" fill="none" stroke="#0C0A16" stroke-width="8"/></g>
<g transform="translate(430 262)"><path d="M-22 0 l4 -66 q0 -12 12 -14 l4 -14 h8 l4 14 q12 2 12 14 l4 66z"/><circle cx="4" cy="-104" r="12"/><path d="M12 -72 l30 -46 l4 3 l-28 48z"/><path d="M42 -118 l8 -14" stroke="#0C0A16" stroke-width="3"/></g>
</g>
<path d="M0 262 Q330 256 700 260 V300 H0z" fill="url(#{p}boards)"/>
<g stroke="#3A2A14" stroke-width="1" opacity=".6">{"".join(f'<path d="M{x} 262 V300"/>' for x in range(30, 700, 46))}</g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}ground)"/>
<path d="M700 262 H1200 V300 H700z" fill="#3A2A14"/>
<g fill="#F2C24A" opacity=".35"><ellipse cx="200" cy="330" rx="60" ry="8"/><ellipse cx="480" cy="330" rx="60" ry="8"/></g>
<g stroke="#120C08" stroke-width="1.2" opacity=".5"><path d="M0 344 H1200 M0 390 H1200"/></g>
'''
    return _wrap(15, body, defs)


# ───────────────────────── 16  The Language of Persuasion: Gettysburg ─────────────────────────
def _b16():
    p = "elb16-"
    defs = (
        _lin(p+"sky", [(0, "#0A1238", None), (.45, "#1E2E68", None), (.75, "#6A5A78", None), (.9, "#D8A060", None), (1, "#F2C878", None)])
        + _lin(p+"hills", [(0, "#3A3A5E", None), (1, "#262640", None)])
        + _lin(p+"field", [(0, "#6A5A3A", None), (.5, "#4A3E28", None), (1, "#2A2216", None)])
        + _lin(p+"platform", [(0, "#8A6A40", None), (1, "#4A3620", None)])
        + _lin(p+"ground", [(0, "#1E1A12", None), (1, "#0C0A08", None)])
        + _rad(p+"glow", [(0, "#F2C878", .5), (1, "#F2C878", 0)])
    )
    g = _lcg(16)
    crowd = []
    for row, (y, hmin, sc) in enumerate(((236, 20, .7), (250, 26, .85), (264, 32, 1.0))):
        x = 20 + next(g) % 30
        while x < 1180:
            if 560 < x < 700 and row == 2:
                x += 30; continue
            h = hmin + next(g) % 10
            w = int((8 + next(g) % 3) * sc)
            crowd.append(_person(x, y + next(g) % 4, h, w))
            if next(g) % 2 == 0:  # top hat
                crowd.append(f'<rect x="{x-5}" y="{y - h*0.62 - w*0.42 - 12:.0f}" width="10" height="9"/><rect x="{x-7}" y="{y - h*0.62 - w*0.42 - 4:.0f}" width="14" height="2"/>')
            x += 14 + next(g) % 16
    crowd = "".join(crowd)
    flags = "".join(f'<path d="M{x} {y} v-70" stroke="#1E1A12" stroke-width="2"/><path d="M{x} {y-70} l30 8 l-30 8z" fill="{c}"/>' for x, y, c in ((160, 236, "#B83A3A"), (1040, 238, "#B83A3A"), (400, 234, "#F2E8D0")))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(16, 30, 120, "#E8E0FF", ".6")}
<circle cx="600" cy="196" r="240" fill="url(#{p}glow)"/>
<g fill="#6A5A78" opacity=".5"><ellipse cx="220" cy="120" rx="200" ry="8"/><ellipse cx="900" cy="100" rx="220" ry="9"/></g>
<path d="M0 190 Q200 170 400 186 T800 178 T1200 190 V220 H0z" fill="url(#{p}hills)"/>
<g fill="#262640"><path d="M60 192 q-8 -18 0 -30 q8 12 0 30z M84 190 q-6 -14 0 -26 q6 12 0 26z M1100 188 q-9 -18 0 -32 q9 14 0 32z M1128 190 q-6 -14 0 -26 q6 12 0 26z M760 184 q-6 -14 0 -24 q6 10 0 24z"/></g>
<path d="M0 216 Q300 206 600 212 T1200 208 V290 H0z" fill="url(#{p}field)"/>
<g stroke="#8A7A50" stroke-width="1" opacity=".3">{"".join(f'<path d="M{x} 222 L{x + (x-600)//6} 288"/>' for x in range(0, 1220, 40))}</g>
{flags}
<path d="M560 268 h150 v-20 h-150z" fill="url(#{p}platform)"/><path d="M552 248 h166 v-6 h-166z" fill="#A08050"/>
<g stroke="#4A3620" stroke-width="3"><path d="M570 268 v20 M700 268 v20"/></g>
<g fill="#0C0A08">
<path d="M622 248 v-30 l-6 -8 h48 l-6 8 v30z"/><rect x="626" y="204" width="28" height="8"/>
<g transform="translate(665 248)"><path d="M-14 0 l2 -50 q0 -10 10 -12 v-8 h8 v8 q10 2 10 12 l2 50z"/><circle cx="2" cy="-78" r="9"/><rect x="-6" y="-102" width="16" height="16"/><rect x="-10" y="-88" width="24" height="3"/><path d="M-12 -56 q-16 6 -20 20 l4 2 q6 -12 18 -16z"/></g>
</g>
<g fill="#0C0A08">{crowd}</g>
<g fill="#0C0A08" transform="translate(1110 262)"><rect x="-22" y="-16" width="44" height="16"/><path d="M-22 -16 h44 M-22 -8 h44" stroke="#2A2216" stroke-width="1"/><path d="M-8 -16 l2 -40 q0 -8 6 -10 v-6 h6 v6 q6 2 6 10 l2 40z"/><circle cx="3" cy="-80" r="8"/><path d="M8 -58 l22 -22 l3 3 l-20 24z"/></g>
<path d="M0 290 Q300 282 600 288 T1200 284 V420 H0z" fill="url(#{p}ground)"/>
<g stroke="#0C0A08" stroke-width="1.2" opacity=".6"><path d="M0 340 Q300 334 600 340 T1200 336 M0 388 Q300 382 600 388 T1200 384"/></g>
<g fill="#F2C878" opacity=".06"><ellipse cx="640" cy="310" rx="300" ry="12"/></g>
'''
    return _wrap(16, body, defs)


# ───────────────────────── 17  Words and Structure: a wall between two fields ─────────────────────────
def _b17():
    p = "elb17-"
    defs = (
        _lin(p+"sky", [(0, "#14204A", None), (.5, "#3A4A80", None), (.8, "#C89A60", None), (1, "#F2D8A0", None)])
        + _lin(p+"orchard", [(0, "#8A9A48", None), (1, "#4A5A28", None)])
        + _lin(p+"pines", [(0, "#2A4A3A", None), (1, "#142A20", None)])
        + _lin(p+"stone", [(0, "#B8AC98", None), (.5, "#8A7E6A", None), (1, "#5A5040", None)])
        + _lin(p+"ground", [(0, "#2E2A1E", None), (1, "#120E0A", None)])
        + _lin(p+"glass", [(0, "#FFFFFF", .7), (1, "#C8D8E8", .35)])
        + _lin(p+"parch", [(0, "#F4E8C8", None), (1, "#D8C090", None)])
        + _rad(p+"sun", [(0, "#FFF0C0", 1), (.3, "#F2C878", .5), (1, "#F2C878", 0)])
    )
    g = _lcg(17)
    stones = []
    for row in range(5):
        y = 262 - row * 16
        x = -10 + next(g) % 20
        while x < 1220:
            w = 24 + next(g) % 30
            stones.append(f'<rect x="{x}" y="{y - 14}" width="{w}" height="14" rx="4" fill="url(#{p}stone)" stroke="#3A3228" stroke-width="1.2"/>')
            x += w + 3
    apples = "".join(f'<circle cx="{40 + next(g) % 520}" cy="{120 + next(g) % 90}" r="3" fill="#D84A3A"/>' for _ in range(24))
    def apple_tree(x, y, s):
        return f'<g transform="translate({x} {y}) scale({s})"><path d="M-4 0 v-36 h8 v36z" fill="#4A3218"/><circle cx="0" cy="-58" r="34" fill="url(#{p}orchard)"/><circle cx="-24" cy="-44" r="22" fill="url(#{p}orchard)"/><circle cx="26" cy="-46" r="22" fill="url(#{p}orchard)"/></g>'
    def pine(x, y, s):
        return f'<g transform="translate({x} {y}) scale({s})" fill="url(#{p}pines)"><path d="M0 -110 l-26 44 h14 l-22 36 h16 l-26 40 h88 l-26 -40 h16 l-22 -36 h14z"/><rect x="-4" y="-2" width="8" height="10" fill="#2A1E12"/></g>'
    trees = "".join([apple_tree(90, 200, 1.0), apple_tree(230, 206, 1.15), apple_tree(400, 202, .95), apple_tree(540, 210, .7)])
    pines_ = "".join([pine(700, 202, .9), pine(790, 208, 1.1), pine(890, 200, .8), pine(980, 210, 1.2), pine(1090, 204, 1.0), pine(1170, 210, .85)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="600" cy="170" r="190" fill="url(#{p}sun)"/>
<g fill="#3A4A80" opacity=".5"><ellipse cx="240" cy="60" rx="200" ry="8"/><ellipse cx="960" cy="90" rx="180" ry="7"/></g>
<path d="M0 200 Q300 190 600 198 T1200 194 V262 H0z" fill="#6A6A48"/>
<path d="M0 204 Q300 194 600 202 V262 H0z" fill="#8A9A48" opacity=".5"/>
<path d="M600 202 Q900 192 1200 196 V262 H600z" fill="#2A4A3A" opacity=".5"/>
{trees}{apples}
{pines_}
{"".join(stones)}
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}ground)"/>
<path d="M0 262 H1200 V266 H0z" fill="#5A5040"/>
<g transform="translate(480 182)">
<path d="M-22 0 l-10 -18 v-14 h18 v-40 h28 v40 h18 v14 l-10 18 v6 h-44z" fill="url(#{p}glass)" stroke="#5A6A80" stroke-width="1.5"/>
<path d="M-28 -14 h56 l-6 14 v6 h-44 v-6z" fill="#3A8AE8" opacity=".55"/>
<path d="M-8 -72 h16 v-8 h-16z" fill="#5A4A3A"/>
<g fill="#FFFFFF" opacity=".6"><circle cx="-4" cy="-6" r="2"/><circle cx="6" cy="-10" r="1.5"/><circle cx="0" cy="-16" r="1.2"/></g>
</g>
<g transform="translate(700 186)">
<path d="M-60 -50 q-10 0 -10 8 v40 q0 8 10 8 h120 q10 0 10 -8 v-40 q0 -8 -10 -8z" fill="url(#{p}parch)"/>
<path d="M-62 -54 q-12 0 -12 14 q0 14 12 14 q-6 -14 0 -28z M62 -54 q12 0 12 14 q0 14 -12 14 q6 -14 0 -28z" fill="#B8A070"/>
<rect x="-66" y="-56" width="8" height="66" rx="4" fill="#C8B080"/><rect x="58" y="-56" width="8" height="66" rx="4" fill="#C8B080"/>
<g stroke="#5A4A3A" stroke-width="2" opacity=".75"><path d="M-46 -34 h90 M-46 -22 h70 M-46 -10 h84 M-46 2 h56"/></g>
</g>
<g fill="#F2C878" opacity=".7"><ellipse cx="300" cy="300" rx="40" ry="3"/><ellipse cx="900" cy="300" rx="40" ry="3"/></g>
<g stroke="#120E0A" stroke-width="1.2" opacity=".5"><path d="M0 340 H1200 M0 388 H1200"/></g>
<g fill="#4A5A28" opacity=".6">{"".join(f'<path d="M{x} 300 q3 -14 6 -22 q3 8 6 22z"/>' for x in range(20, 580, 44))}</g>
'''
    return _wrap(17, body, defs)


# ───────────────────────── 18  Grammar for Writers: the banner torn in three ─────────────────────────
def _b18():
    p = "elb18-"
    defs = (
        _lin(p+"wall", [(0, "#101830", None), (.6, "#1A2648", None), (1, "#2A3660", None)])
        + _lin(p+"cloth", [(0, "#B83A3A", None), (1, "#7A2424", None)])
        + _lin(p+"cream", [(0, "#F4EAD0", None), (1, "#D8C8A0", None)])
        + _lin(p+"desk", [(0, "#5A3E24", None), (.12, "#3A2818", None), (1, "#160E08", None)])
        + _lin(p+"wood", [(0, "#8A5A30", None), (1, "#3A2410", None)])
        + _rad(p+"seal", [(0, "#E86060", 1), (.6, "#B83A3A", 1), (1, "#7A2424", 1)])
        + _rad(p+"lamp", [(0, "#F2C878", .4), (1, "#F2C878", 0)])
    )
    rope = 'M60 40 Q300 70 600 60 T1140 44'
    # three ragged pieces, each hanging from the rope, gaps between them, different sizes
    pieces = (
        '<path d="M100 48 L100 150 l14 -10 l10 14 l12 -12 l10 16 l12 -12 l12 10 l8 -18 l10 12 L188 50z" fill="url(#{p}cloth)"/>'
        '<path d="M118 70 h56 M118 86 h40 M118 102 h50" stroke="#F4EAD0" stroke-width="5" stroke-linecap="round" opacity=".85"/>'
        '<path d="M300 60 L300 170 l10 -14 l12 12 l14 -18 l10 16 l10 -12 l14 14 l10 -22 l12 12 l8 -14 l10 12 l12 -10 l10 14 l10 -14 L442 60z" fill="url(#{p}cloth)"/>'
        '<path d="M320 82 h100 M320 98 h70 M320 114 h90 M320 130 h60" stroke="#F4EAD0" stroke-width="5" stroke-linecap="round" opacity=".85"/>'
        '<path d="M560 56 L560 130 l12 -10 l8 14 l14 -14 l10 12 l12 -16 l10 10 L626 58z" fill="url(#{p}cloth)"/>'
        '<path d="M576 78 h34 M576 94 h24" stroke="#F4EAD0" stroke-width="5" stroke-linecap="round" opacity=".85"/>'
    ).replace("{p}", p)
    threads = '<g stroke="#B83A3A" stroke-width="1.5" opacity=".7"><path d="M190 60 q10 20 4 44 M292 64 q-8 26 0 50 M446 66 q14 20 6 40 M552 60 q-10 18 -2 38 M630 62 q12 16 6 34"/></g>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<circle cx="900" cy="80" r="220" fill="url(#{p}lamp)"/>
<g stroke="#2A3660" stroke-width="1.5" opacity=".6"><path d="M0 120 H1200 M0 200 H1200"/></g>
<g fill="#2A3660" opacity=".5">{"".join(f'<rect x="{x}" y="128" width="50" height="64" rx="2"/>' for x in range(700, 1180, 70))}</g>
<path d="{rope}" stroke="#D8C8A0" stroke-width="3" fill="none"/>
<g stroke="#8A7A50" stroke-width="2"><path d="M60 40 V20 M1140 44 V22"/></g>
{pieces}{threads}
<g fill="#D8C8A0"><rect x="96" y="44" width="10" height="10"/><rect x="184" y="46" width="10" height="10"/><rect x="296" y="56" width="10" height="10"/><rect x="438" y="56" width="10" height="10"/><rect x="556" y="52" width="10" height="10"/><rect x="622" y="54" width="10" height="10"/></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}desk)"/>
<path d="M0 262 H1200 V266 H0z" fill="#8A5A30"/>
<g transform="translate(760 262)">
<path d="M-80 0 v-14 h160 v14z" fill="url(#{p}wood)"/><path d="M-72 -14 v-6 h144 v6z" fill="#A07040"/>
<g transform="rotate(-24 20 -40)"><rect x="-10" y="-52" width="120" height="8" rx="4" fill="url(#{p}wood)"/><rect x="-46" y="-72" width="60" height="44" rx="8" fill="url(#{p}wood)"/><rect x="-50" y="-72" width="8" height="44" rx="3" fill="#A07040"/><rect x="6" y="-72" width="8" height="44" rx="3" fill="#A07040"/></g>
</g>
<g transform="translate(1000 258) rotate(-6)">
<path d="M-90 0 v-120 h180 v120z" fill="url(#{p}cream)"/>
<path d="M-90 0 v-120 h180 v120z" fill="none" stroke="#B8A070" stroke-width="1.5"/>
<g stroke="#4A3A28" stroke-width="2.5" opacity=".7"><path d="M-70 -96 h120 M-70 -82 h140 M-70 -68 h90 M-70 -54 h130 M-70 -40 h100 M-70 -26 h60"/></g>
<path d="M-70 -14 q20 -14 40 0" stroke="#4A3A28" stroke-width="2" fill="none"/>
<circle cx="52" cy="-22" r="18" fill="url(#{p}seal)"/><circle cx="52" cy="-22" r="10" fill="none" stroke="#7A2424" stroke-width="2"/>
<path d="M44 -6 l-6 24 l14 -8 l14 8 l-6 -24" fill="#B83A3A"/>
</g>
<g transform="translate(300 262)"><path d="M-60 0 v-20 h120 v20z" fill="#3A2818"/><path d="M-54 -20 v-6 h108 v6z" fill="#8A5A30"/></g>
<g stroke="#160E08" stroke-width="1.2" opacity=".5"><path d="M0 330 H1200 M0 386 H1200"/></g>
<g fill="#F2C878" opacity=".07"><ellipse cx="880" cy="300" rx="260" ry="12"/></g>
'''
    return _wrap(18, body, defs)


# ───────────────────────── 19  Research and Writing: eight books, three lit ─────────────────────────
def _b19():
    p = "elb19-"
    defs = (
        _lin(p+"wall", [(0, "#0E1630", None), (1, "#1C2850", None)])
        + _lin(p+"window", [(0, "#0A1030", None), (1, "#243A70", None)])
        + _lin(p+"desk", [(0, "#6A4A28", None), (.1, "#3E2A16", None), (1, "#160E08", None)])
        + _rad(p+"lamp", [(0, "#FFF0B0", 1), (.2, "#FFD070", .6), (.6, "#FFC050", .12), (1, "#FFC050", 0)])
        + _lin(p+"shade", [(0, "#4AA070", None), (1, "#1E5A3A", None)])
        + _lin(p+"lit", [(0, "#FFF0B0", None), (1, "#F2C24A", None)])
        + _lin(p+"page", [(0, "#F8F2E0", None), (1, "#D8CCB0", None)])
    )
    books = [("#3A4A80", 120, 22), ("#F2C24A", 132, 20), ("#6A3A3A", 110, 26), ("#2A5A4A", 126, 18), ("#F2C24A", 140, 24), ("#4A3A6A", 116, 20), ("#F2C24A", 128, 22), ("#8A5A30", 122, 26)]
    stack, y, cx = [], 262, 300
    for i, (c, w, h) in enumerate(books):
        lit = c == "#F2C24A"
        dx = (i % 3 - 1) * 6
        x = cx - w // 2 + dx
        fill = f"url(#{p}lit)" if lit else c
        stack.append(f'<rect x="{x}" y="{y - h}" width="{w}" height="{h}" rx="2" fill="{fill}"/>')
        stack.append(f'<rect x="{x + 4}" y="{y - h + 3}" width="{w - 8}" height="{h - 6}" rx="1" fill="none" stroke="{"#7A5A10" if lit else "#F8F2E0"}" stroke-width="1" opacity=".5"/>')
        stack.append(f'<rect x="{x + w - 5}" y="{y - h}" width="5" height="{h}" fill="#F8F2E0" opacity=".85"/>')
        if lit:
            stack.append(f'<rect x="{x - 14}" y="{y - h - 10}" width="{w + 28}" height="{h + 20}" rx="10" fill="#FFD070" opacity=".18"/>')
        y -= h
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="760" y="0" width="240" height="230" fill="#0A0E24"/>
<rect x="772" y="0" width="216" height="218" fill="url(#{p}window)"/>
{_stars(19, 30, 200, "#E8E0FF", ".7", 780, 980)}
<circle cx="920" cy="60" r="20" fill="#F8F0D0"/><circle cx="920" cy="60" r="50" fill="#F8F0D0" opacity=".1"/>
<g stroke="#0A0E24" stroke-width="8"><path d="M880 0 V218 M772 110 H988"/></g>
<rect x="752" y="228" width="256" height="10" fill="#3E2A16"/>
<g fill="#1C2850" opacity=".7"><rect x="60" y="30" width="360" height="30" rx="2"/><rect x="60" y="80" width="360" height="30" rx="2"/></g>
<g fill="#3A4A80">{"".join(f'<rect x="{x}" y="{32 + (i%2)*2}" width="{16 + (i*7)%14}" height="{26 - (i%2)*2}" rx="1"/>' for i, x in enumerate(range(70, 410, 30)))}</g>
<g fill="#6A3A3A">{"".join(f'<rect x="{x}" y="{82 + (i%3)}" width="{14 + (i*5)%16}" height="{27 - (i%3)}" rx="1"/>' for i, x in enumerate(range(74, 410, 32)))}</g>
<g fill="#F2C24A" opacity=".8">{"".join(f'<rect x="{x}" y="42" width="6" height="3"/>' for x in range(78, 410, 60))}</g>
<circle cx="600" cy="150" r="190" fill="url(#{p}lamp)"/>
<g transform="translate(600 262)">
<path d="M-60 0 v-8 h120 v8z" fill="#1E5A3A"/><path d="M-6 -8 v-110 h12 v110z" fill="#C8A040"/>
<path d="M-90 -118 q90 -30 180 0 l10 -30 q-100 -40 -200 0z" fill="url(#{p}shade)"/>
<path d="M-90 -118 q90 20 180 0" fill="#FFF0B0" opacity=".85"/>
<path d="M-100 -148 h200" stroke="#C8A040" stroke-width="3"/>
</g>
{"".join(stack)}
<g transform="translate(960 262)"><path d="M-90 0 l6 -46 h84 l4 46z" fill="url(#{p}page)"/><path d="M0 0 l4 -46 h84 l-6 46z" fill="url(#{p}page)"/><path d="M-84 -46 l6 46 M0 -46 l0 46" stroke="#B8A880" stroke-width="1"/><g stroke="#3A4A80" stroke-width="1.5" opacity=".6"><path d="M-72 -36 h60 M-70 -28 h50 M-68 -20 h58 M-66 -12 h40 M14 -36 h50 M12 -28 h60 M10 -20 h44"/></g><path d="M60 -8 l40 -50" stroke="#F2C24A" stroke-width="4" stroke-linecap="round"/><path d="M96 -54 l6 -8" stroke="#1E1E28" stroke-width="4" stroke-linecap="round"/></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}desk)"/>
<path d="M0 262 H1200 V267 H0z" fill="#8A6A40"/>
<g fill="#F8F2E0" opacity=".8"><rect x="1080" y="246" width="60" height="16" rx="2"/><rect x="1088" y="238" width="44" height="8" rx="2"/></g>
<g fill="#FFD070" opacity=".1"><ellipse cx="600" cy="300" rx="280" ry="14"/><ellipse cx="300" cy="300" rx="120" ry="10"/></g>
<g stroke="#160E08" stroke-width="1.2" opacity=".5"><path d="M0 334 H1200 M0 388 H1200"/></g>
'''
    return _wrap(19, body, defs)


# ───────────────────────── 20  American Voices: the cell at Concord ─────────────────────────
def _b20():
    p = "elb20-"
    defs = (
        _lin(p+"stone", [(0, "#2A2E3A", None), (.5, "#383E4C", None), (1, "#1C2028", None)])
        + _lin(p+"sky", [(0, "#060B26", None), (.6, "#12204A", None), (1, "#243A6A", None)])
        + _lin(p+"pond", [(0, "#243A6A", None), (.3, "#1A2E58", None), (1, "#0C1A38", None)])
        + _rad(p+"moon", [(0, "#F8F4E0", 1), (.3, "#F0E8C8", .8), (1, "#F0E8C8", 0)])
        + _lin(p+"floor", [(0, "#2A2A30", None), (.3, "#1A1A1E", None), (1, "#0A0A0C", None)])
        + _rad(p+"candle", [(0, "#FFF0B0", 1), (.3, "#FFB040", .6), (1, "#FF8020", 0)])
        + _lin(p+"pines", [(0, "#1A2C40", None), (1, "#0C1828", None)])
    )
    g = _lcg(20)
    blocks = []
    for row in range(9):
        y = row * 30
        x = -20 + (row % 2) * 30
        while x < 1220:
            w = 50 + next(g) % 30
            if not (330 < x + w and x < 870 and 20 < y + 30 and y < 240):
                blocks.append(f'<rect x="{x}" y="{y}" width="{w}" height="28" rx="1" fill="url(#{p}stone)" stroke="#14171E" stroke-width="1.5"/>')
            x += w + 2
    def pine(x, y, s):
        return f'<g transform="translate({x} {y}) scale({s})" fill="url(#{p}pines)"><path d="M0 -70 l-14 26 h8 l-14 24 h10 l-16 26 h52 l-16 -26 h10 l-14 -24 h8z"/></g>'
    pines = "".join(pine(x, 180 + (i % 3) * 4, .7 + (i % 4) * .15) for i, x in enumerate(range(360, 860, 40)))
    ripples = "".join(f'<ellipse cx="{560 + (i*37)%260}" cy="{200 + i*7}" rx="{30 + i*8}" ry="1.5"/>' for i in range(6))
    body = f'''
<rect width="{W}" height="{H}" fill="#1C2028"/>
{"".join(blocks)}
<rect x="340" y="30" width="520" height="210" fill="url(#{p}sky)"/>
{_stars(20, 40, 150, "#E8E4FF", ".75", 350, 850)}
<circle cx="700" cy="90" r="90" fill="url(#{p}moon)"/><circle cx="700" cy="90" r="30" fill="#F8F4E0"/>
{pines}
<path d="M340 190 Q600 184 860 190 V240 H340z" fill="url(#{p}pond)"/>
<path d="M680 190 q20 0 20 50 q0 -40 20 -50z" fill="#F8F4E0" opacity=".35"/>
<g fill="#F8F4E0" opacity=".3">{ripples}</g>
<g fill="#0C1828"><ellipse cx="380" cy="238" rx="60" ry="8"/><ellipse cx="820" cy="238" rx="60" ry="8"/></g>
<g stroke="#14171E" stroke-width="14"><path d="M430 30 V240 M520 30 V240 M610 30 V240 M700 30 V240 M790 30 V240"/></g>
<g stroke="#383E4C" stroke-width="4"><path d="M340 120 H860"/></g>
<rect x="320" y="240" width="560" height="22" fill="#383E4C"/><rect x="320" y="240" width="560" height="4" fill="#5A6070"/>
<g fill="#0A0A0C" transform="translate(800 242)">
<path d="M-30 0 q-4 -20 10 -30 q10 -12 26 -10 q14 2 22 12 q14 4 22 10 l-14 2 q6 8 2 16 h-70z"/>
<path d="M28 -34 q8 -12 14 -8 l12 -2 l-8 6 q-2 8 -12 8z"/><path d="M44 -36 l14 -2" stroke="#0A0A0C" stroke-width="3"/>
<path d="M-30 -6 l-34 4 l36 4z"/><path d="M-6 0 v10 M8 0 v10" stroke="#0A0A0C" stroke-width="3"/>
<circle cx="32" cy="-30" r="1.6" fill="#F2C24A"/>
</g>
<g transform="translate(150 262)"><path d="M-110 0 v-30 h220 v30z" fill="#2A2A30"/><path d="M-110 -30 v-10 h220 v10z" fill="#5A5A64"/><path d="M-100 -40 q40 -12 80 0z" fill="#8A8A94"/><path d="M-104 0 v22 M104 0 v22" stroke="#1A1A1E" stroke-width="4"/></g>
<g transform="translate(1060 262)"><path d="M-40 0 v-14 h80 v14z" fill="#2A2A30"/><path d="M-4 -14 v-40 h8 v40z" fill="#F4E8C8"/><ellipse cx="0" cy="-64" rx="7" ry="12" fill="url(#{p}candle)"/><circle cy="-60" r="50" fill="url(#{p}candle)" opacity=".15"/></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}floor)"/>
<g stroke="#0A0A0C" stroke-width="1.5" opacity=".6"><path d="M0 300 H1200 M0 340 H1200 M0 380 H1200"/><path d="M200 262 V420 M420 262 V420 M640 262 V420 M860 262 V420 M1080 262 V420"/></g>
<path d="M340 262 L300 420 H900 L860 262z" fill="#F0E8C8" opacity=".06"/>
'''
    return _wrap(20, body, defs)


# ───────────────────────── 21  Diction, Syntax and Style: ribbon and beads ─────────────────────────
def _b21():
    p = "elb21-"
    defs = (
        _lin(p+"bg", [(0, "#0A1238", None), (.6, "#182858", None), (1, "#243870", None)])
        + _lin(p+"ribbon", [(0, "#FFE9A0", None), (.5, "#F2C24A", None), (1, "#C89020", None)])
        + _lin(p+"ribshade", [(0, "#8A6010", None), (1, "#C89020", None)])
        + _rad(p+"bead", [(0, "#FFFFFF", 1), (.35, "#F4EAD0", 1), (1, "#B8A880", 1)], .35, .35, .65)
        + _lin(p+"blade", [(0, "#E8ECF2", None), (.5, "#A8B0BC", None), (1, "#6A7280", None)], 0, 0, 1, 0)
        + _lin(p+"felt", [(0, "#1A2650", None), (1, "#0C1430", None)])
        + _rad(p+"glow", [(0, "#F2C24A", .25), (1, "#F2C24A", 0)])
    )
    # ribbon: a long sinuous path across the upper band, drawn twice (shadow edge + face) with a twist
    rib = "M-20 150 C120 40 240 40 360 120 S560 220 700 140 S920 30 1040 100 S1180 200 1240 150"
    beads = "".join(f'<circle cx="{x}" cy="{224 + (i%2)*2}" r="{9 if i%4 else 12}" fill="url(#{p}bead)"/>' for i, x in enumerate(range(130, 520, 34)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}bg)"/>
{_stars(21, 40, 260, "#E8E4FF", ".45")}
<circle cx="600" cy="130" r="360" fill="url(#{p}glow)"/>
<path d="{rib}" fill="none" stroke="#0A1238" stroke-width="34" opacity=".5" transform="translate(0 6)"/>
<path d="{rib}" fill="none" stroke="url(#{p}ribshade)" stroke-width="30"/>
<path d="{rib}" fill="none" stroke="url(#{p}ribbon)" stroke-width="24"/>
<path d="{rib}" fill="none" stroke="#FFF6D0" stroke-width="2" opacity=".6" transform="translate(0 -8)"/>
<g stroke="#8A6010" stroke-width="2" opacity=".55"><path d="M40 118 l6 24 M180 68 l4 26 M300 90 l6 24 M440 168 l6 22 M600 188 l6 22 M760 118 l6 24 M880 60 l6 24 M1000 88 l6 24 M1120 160 l6 22"/></g>
<path d="M120 226 H520" stroke="#C8B080" stroke-width="2"/>
{beads}
<path d="M110 226 l-8 -4 v8z M530 226 l8 -4 v8z" fill="#C8B080"/>
<g transform="translate(880 200) rotate(-30)">
<path d="M-90 -14 l100 8 l60 -2 l6 8 l-64 6 l-100 4z" fill="url(#{p}blade)"/>
<path d="M-90 14 l100 -8 l60 2 l6 -8 l-64 -6 l-100 -4z" fill="url(#{p}blade)"/>
<circle cx="10" cy="0" r="5" fill="#3A4258"/>
<path d="M-90 -14 q-40 -30 -60 -6 q-4 26 30 30 q22 -2 30 -24z" fill="none" stroke="#F2C24A" stroke-width="9"/>
<path d="M-90 14 q-40 30 -60 6 q-4 -26 30 -30 q22 2 30 24z" fill="none" stroke="#F2C24A" stroke-width="9"/>
</g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}felt)"/>
<path d="M0 262 H1200 V265 H0z" fill="#3A4A80"/>
<g fill="#F2C24A" opacity=".5"><path d="M700 250 q30 -10 60 4 q-30 8 -60 -4z"/><path d="M1000 254 q26 -8 50 2 q-24 6 -50 -2z"/></g>
<g fill="#F4EAD0" opacity=".6"><circle cx="640" cy="254" r="5"/><circle cx="660" cy="256" r="4"/><circle cx="1090" cy="256" r="5"/></g>
<g stroke="#0C1430" stroke-width="1.2" opacity=".6"><path d="M0 330 H1200 M0 386 H1200"/></g>
<g fill="#F2C24A" opacity=".06"><ellipse cx="600" cy="300" rx="380" ry="12"/></g>
'''
    return _wrap(21, body, defs)


# ───────────────────────── 22  Reasoning and Argument: Jefferson's desk ─────────────────────────
def _b22():
    p = "elb22-"
    defs = (
        _lin(p+"wall", [(0, "#2A1E2A", None), (.5, "#3E2E38", None), (1, "#5A4444", None)])
        + _lin(p+"night", [(0, "#0A1030", None), (1, "#243A6A", None)])
        + _lin(p+"desk", [(0, "#7A4A28", None), (.1, "#4A2C16", None), (1, "#1A0E08", None)])
        + _lin(p+"lapdesk", [(0, "#A06A38", None), (1, "#5A3418", None)])
        + _lin(p+"page", [(0, "#F8F0DC", None), (1, "#E0D0A8", None)])
        + _rad(p+"candle", [(0, "#FFF0B0", 1), (.3, "#FFC050", .55), (1, "#FF9020", 0)])
        + _lin(p+"card", [(0, "#F4EAD0", None), (1, "#D8C8A0", None)])
    )
    # draft lines with cross-outs: many written lines, some thick strikes, one block replaced
    lines, strikes = [], []
    g = _lcg(22)
    for i in range(11):
        y = 96 + i * 12
        w = 140 + next(g) % 80
        lines.append(f'<path d="M420 {y} h{w}"/>')
        if i in (2, 3, 6, 9):
            strikes.append(f'<path d="M416 {y - 1} q{w//2} 4 {w + 8} -1"/>')
    inserts = '<path d="M430 72 q60 -6 120 0 M440 84 h80" stroke="#4A2C16" stroke-width="1.5" fill="none" opacity=".8"/><path d="M420 118 q-16 -20 -4 -40 l14 -6" stroke="#4A2C16" stroke-width="1.2" fill="none" opacity=".7"/>'
    bars = "".join(f'<rect x="{x}" y="{200 - h}" width="14" height="{h}" fill="{c}"/>' for x, h, c in ((920, 30, "#3A4A80"), (942, 58, "#3A4A80"), (964, 44, "#F2C24A"), (986, 84, "#3A4A80"), (1008, 66, "#3A4A80")))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="60" y="30" width="220" height="200" rx="3" fill="#1A1218"/><rect x="72" y="42" width="196" height="176" fill="url(#{p}night)"/>
{_stars(22, 20, 160, "#E8E4FF", ".7", 80, 260)}
<g stroke="#1A1218" stroke-width="7"><path d="M170 42 V218 M72 130 H268"/></g>
<g stroke="#5A4444" stroke-width="1.2" opacity=".5"><path d="M0 250 H1200"/><path d="M320 60 h60 v60 h-60z M340 40 h100" stroke-width="2"/></g>
<g fill="#5A4444" opacity=".6"><rect x="1080" y="40" width="80" height="170" rx="3"/><rect x="1090" y="50" width="60" height="50" rx="2" fill="#3E2E38"/><rect x="1090" y="110" width="60" height="90" rx="2" fill="#3E2E38"/></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}desk)"/>
<path d="M0 262 H1200 V267 H0z" fill="#A06A38"/>
<g transform="translate(560 262)">
<path d="M-200 0 v-30 l260 -30 v60z" fill="url(#{p}lapdesk)"/><path d="M-200 -30 l260 -30 l30 8 l-260 30z" fill="#C88A48"/><path d="M60 -60 l30 8 v60 h-30z" fill="#3A2010"/>
<path d="M-180 -36 l210 -26 l6 44 l-210 22z" fill="url(#{p}page)"/>
<path d="M-176 -40 l214 -26" stroke="#B8A880" stroke-width="1"/>
</g>
<g transform="translate(360 190) rotate(-7)">
<path d="M0 0 h280 v190 h-280z" fill="url(#{p}page)"/>
<g stroke="#4A2C16" stroke-width="2" stroke-linecap="round" opacity=".7" transform="translate(-380 -110)">{"".join(lines)}</g>
<g stroke="#2A1608" stroke-width="5" stroke-linecap="round" fill="none" transform="translate(-380 -110)">{"".join(strikes)}</g>
<g transform="translate(-380 -110)">{inserts}</g>
<path d="M30 20 h140" stroke="#4A2C16" stroke-width="3" opacity=".8"/>
</g>
<g transform="translate(740 262)"><path d="M-20 0 v-40 q0 -8 8 -8 h24 q8 0 8 8 v40z" fill="#1A1218"/><path d="M-10 -44 q10 -6 20 0 v-4 q-10 -6 -20 0z" fill="#3A3A44"/><path d="M8 -50 q10 -50 40 -90 q10 -10 12 -2 q-20 30 -40 92z" fill="#F4EAD0"/><path d="M14 -60 q12 -36 32 -70" stroke="#B8A880" stroke-width="1" fill="none"/></g>
<g transform="translate(840 262)"><path d="M-14 0 h28 v-8 h-28z" fill="#8A6A40"/><path d="M-5 -8 v-56 h10 v56z" fill="#F4E8C8"/><ellipse cx="0" cy="-74" rx="7" ry="13" fill="url(#{p}candle)"/><circle cy="-70" r="60" fill="url(#{p}candle)" opacity=".18"/></g>
<g transform="translate(0 40)"><rect x="900" y="104" width="140" height="106" rx="3" fill="url(#{p}card)"/><rect x="900" y="104" width="140" height="106" rx="3" fill="none" stroke="#B8A880" stroke-width="1.2"/><path d="M912 200 H1030 M912 120 V200" stroke="#3A4A80" stroke-width="1.5"/>{bars}<path d="M1000 118 h30" stroke="#4A2C16" stroke-width="2"/></g>
<path d="M960 262 v-48 h6 v48z" fill="#4A2C16"/>
<g stroke="#1A0E08" stroke-width="1.2" opacity=".5"><path d="M0 334 H1200 M0 388 H1200"/></g>
<g fill="#FFC050" opacity=".08"><ellipse cx="740" cy="300" rx="260" ry="14"/></g>
'''
    return _wrap(22, body, defs)


# ───────────────────────── 23  Advanced Grammar: two publishers and a comma between ─────────────────────────
def _b23():
    p = "elb23-"
    defs = (
        _lin(p+"sky", [(0, "#0A1238", None), (.6, "#1E2E60", None), (.9, "#7A6070", None), (1, "#D8A868", None)])
        + _lin(p+"bldl", [(0, "#8A7A64", None), (1, "#4A3E30", None)], 0, 0, 1, 0)
        + _lin(p+"bldr", [(0, "#4A3E30", None), (1, "#8A7A64", None)], 0, 0, 1, 0)
        + _lin(p+"street", [(0, "#3A3A44", None), (.15, "#22222A", None), (1, "#0C0C10", None)])
        + _lin(p+"paper", [(0, "#F8F2E0", None), (1, "#D8CCB0", None)])
        + _lin(p+"env", [(0, "#F4EAD0", None), (1, "#C8B890", None)])
        + _rad(p+"glow", [(0, "#F2C24A", .5), (1, "#F2C24A", 0)])
    )
    def facade(x, w, grad, cols, rows, lit_seed):
        g = _lcg(lit_seed)
        wins = []
        cw, ch = (w - 40) // cols, 20
        for r in range(rows):
            for c in range(cols):
                lit = next(g) % 3 == 0
                wins.append(f'<rect x="{x + 20 + c*cw + 4}" y="{70 + r*34}" width="{cw - 10}" height="{ch}" rx="1" fill="{"#F2C24A" if lit else "#1A1E2C"}" opacity="{".85" if lit else "1"}"/>')
        cornice = f'<rect x="{x - 8}" y="40" width="{w + 16}" height="10" fill="#B8A888"/><rect x="{x - 4}" y="50" width="{w + 8}" height="6" fill="#6A5E4C"/>'
        door = f'<rect x="{x + w//2 - 20}" y="222" width="40" height="40" rx="2" fill="#1A1E2C"/><path d="M{x + w//2 - 28} 222 h56 v-8 h-56z" fill="#B8A888"/>'
        return f'<rect x="{x}" y="50" width="{w}" height="212" fill="url(#{grad})"/>{cornice}{"".join(wins)}{door}'
    left = facade(60, 340, p+"bldl", 5, 4, 23)
    right = facade(800, 340, p+"bldr", 5, 4, 232)
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(23, 24, 120, "#E8E4FF", ".6", 380, 820)}
<circle cx="600" cy="120" r="200" fill="url(#{p}glow)"/>
<g fill="#4A3E30"><rect x="120" y="20" width="60" height="30"/><rect x="900" y="14" width="80" height="36"/><rect x="200" y="30" width="20" height="20"/></g>
{left}{right}
<g fill="#B8A888"><path d="M60 100 h340 v3 h-340z M60 134 h340 v3 h-340z M60 168 h340 v3 h-340z M60 202 h340 v3 h-340z" opacity=".5"/><path d="M800 100 h340 v3 h-340z M800 134 h340 v3 h-340z M800 168 h340 v3 h-340z M800 202 h340 v3 h-340z" opacity=".5"/></g>
<g fill="#F2C24A" opacity=".8"><rect x="200" y="54" width="60" height="6" rx="2"/><rect x="940" y="54" width="60" height="6" rx="2"/></g>
<g fill="#6A5E4C"><rect x="440" y="180" width="6" height="82"/><rect x="750" y="180" width="6" height="82"/></g><g fill="#F2C24A"><circle cx="443" cy="176" r="7"/><circle cx="753" cy="176" r="7"/></g>
<g opacity=".35">{_comma(600, 130, 7, "#F2C24A")}</g>
{_comma(600, 130, 6, "#FFF0B0")}
{_comma(602, 132, 5.2, "#F2C24A")}
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}street)"/>
<path d="M0 262 H1200 V266 H0z" fill="#5A5A64"/>
<g stroke="#0C0C10" stroke-width="1" opacity=".5">{"".join(f'<path d="M{x} 266 V300"/>' for x in range(0, 1200, 24))}<path d="M0 282 H1200 M0 300 H1200"/></g>
<g transform="translate(520 258) rotate(-8)"><path d="M-70 0 v-46 h140 v46z" fill="url(#{p}env)"/><path d="M-70 -46 l70 32 l70 -32" fill="none" stroke="#B8A880" stroke-width="2"/><path d="M-70 0 l52 -26 M70 0 l-52 -26" stroke="#B8A880" stroke-width="1.5"/><rect x="40" y="-40" width="20" height="16" fill="#B83A3A" opacity=".8"/></g>
<g transform="translate(690 256) rotate(5)"><path d="M-60 0 v-80 h120 v80z" fill="url(#{p}paper)"/><g stroke="#3A4A80" stroke-width="1.5" opacity=".6"><path d="M-48 -66 h60 M-48 -54 h96 M-48 -44 h88 M-48 -34 h96 M-48 -24 h70 M-48 -12 h40"/></g><path d="M-48 -66 h30" stroke="#B83A3A" stroke-width="3"/></g>
<g stroke="#0C0C10" stroke-width="1.2" opacity=".5"><path d="M0 336 H1200 M0 388 H1200"/></g>
<g fill="#F2C24A" opacity=".08"><ellipse cx="600" cy="300" rx="200" ry="12"/></g>
'''
    return _wrap(23, body, defs)


# ───────────────────────── 24  Capstone: the lectern and the map ─────────────────────────
def _b24():
    p = "elb24-"
    defs = (
        _lin(p+"wall", [(0, "#080C20", None), (1, "#141C3A", None)])
        + _lin(p+"screen", [(0, "#F4EFE0", None), (1, "#D8D0BC", None)])
        + _lin(p+"beam", [(0, "#FFF0C0", .0), (.6, "#FFF0C0", .12), (1, "#FFF0C0", .3)], 0, 0, 1, 0)
        + _lin(p+"floor", [(0, "#1E1E2A", None), (.3, "#121218", None), (1, "#06060A", None)])
        + _lin(p+"lake", [(0, "#4A8AC8", None), (1, "#2A5A98", None)])
        + _lin(p+"lectern", [(0, "#6A4A28", None), (1, "#3A2814", None)])
        + _rad(p+"proj", [(0, "#FFFFFF", 1), (.3, "#FFF0C0", .5), (1, "#FFF0C0", 0)])
    )
    # map: a street grid, a diagonal avenue, parks and the lake edge on the right
    grid = "".join(f'<path d="M{x} 60 V220"/>' for x in range(300, 640, 28)) + "".join(f'<path d="M280 {y} H660"/>' for y in range(60, 230, 24))
    g = _lcg(24)
    blocks = "".join(f'<rect x="{302 + (next(g) % 12) * 28}" y="{62 + (next(g) % 7) * 24}" width="24" height="20" fill="#F2C24A" opacity=".8"/>' for _ in range(9))
    seats = []
    for row, (y, s) in enumerate(((300, .6), (330, .8), (360, 1.0))):
        for x in range(60 + row * 20, 1180, 70 + row * 10):
            seats.append(f'<g transform="translate({x} {y}) scale({s})"><path d="M-14 0 q0 -22 14 -24 q14 2 14 24z"/><circle cy="-34" r="10"/></g>')
    seats = "".join(seats)
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="270" y="40" width="420" height="200" rx="3" fill="#2A2A34"/>
<rect x="280" y="50" width="400" height="180" fill="url(#{p}screen)"/>
<g stroke="#3A4A80" stroke-width="1" opacity=".45">{grid}</g>
<path d="M290 220 L600 60" stroke="#3A4A80" stroke-width="3" opacity=".7"/>
{blocks}
<g fill="#4A9A60" opacity=".7"><rect x="330" y="120" width="52" height="44" rx="2"/><rect x="470" y="180" width="70" height="36" rx="2"/></g>
<path d="M600 50 q-20 60 10 100 q20 40 -6 80 H680 V50z" fill="url(#{p}lake)"/>
<path d="M600 50 q-20 60 10 100 q20 40 -6 80" stroke="#F4EFE0" stroke-width="2" fill="none" opacity=".8"/>
<circle cx="452" cy="132" r="10" fill="none" stroke="#B83A3A" stroke-width="3"/><circle cx="452" cy="132" r="3" fill="#B83A3A"/>
<path d="M1060 130 L280 60 L280 230z" fill="url(#{p}beam)"/>
<g transform="translate(1080 130)"><rect x="-30" y="-16" width="60" height="32" rx="4" fill="#2A2A34"/><circle cx="-30" cy="0" r="10" fill="url(#{p}proj)"/><rect x="-6" y="16" width="12" height="60" fill="#2A2A34"/><rect x="-24" y="74" width="48" height="6" rx="2" fill="#3A3A48"/></g>
<g transform="translate(900 262)"><path d="M-30 0 v-90 l60 -14 v104z" fill="url(#{p}lectern)"/><path d="M-36 -92 l72 -16 l4 6 l-72 16z" fill="#8A6A40"/><path d="M-22 -100 l40 -10" stroke="#F4EFE0" stroke-width="3" opacity=".8"/>
<g fill="#06060A"><path d="M-6 -104 l2 -50 q0 -10 10 -12 v-8 h8 v8 q10 2 10 12 l2 50z"/><circle cx="10" cy="-180" r="10"/><path d="M-16 -150 l-30 -30 l4 -3 l30 28z"/></g></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M0 262 H1200 V266 H0z" fill="#3A3A48"/>
<g fill="#06060A">{seats}</g>
<g fill="#06060A" transform="translate(560 300)"><path d="M-14 0 q0 -22 14 -24 q14 2 14 24z"/><circle cy="-34" r="10"/><path d="M10 -30 l14 -50 l6 2 l-12 50z"/><path d="M22 -80 l-2 -8 l4 -1 l3 8 M25 -81 l2 -8 l4 0 l-1 9 M29 -80 l4 -6 l3 2 l-4 6" stroke="#06060A" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>
<g fill="#FFF0C0" opacity=".08"><ellipse cx="480" cy="290" rx="220" ry="10"/></g>
<g stroke="#06060A" stroke-width="1.2" opacity=".5"><path d="M0 318 H1200 M0 348 H1200 M0 380 H1200"/></g>
'''
    return _wrap(24, body, defs)


_BUILDERS = {13: _b13, 14: _b14, 15: _b15, 16: _b16, 17: _b17, 18: _b18,
             19: _b19, 20: _b20, 21: _b21, 22: _b22, 23: _b23, 24: _b24}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (13..24)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    for n in sorted(BANNERS):
        print(n, len(BANNERS[n].encode("utf-8")), "bytes")
