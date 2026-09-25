"""Unit banners for the Social Studies K-12 course, units 13-24 (grades 6-12).

Twelve drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_ss_b import BANNERS, CREDITS, banner
    banner(19)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"ssb{n}-" so all 24 course banners can sit on one contents page.  No text,
no images, no filters, no external references.  Gradients and paths only.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm (floors, water, ground,
desk fronts) and the action sits in the upper 55%.
"""

import math

W, H = 1200, 420

CREDITS = {
    13: "Drawn scene: a classroom wall with the same world map framed in three projections, each stretching the continents differently, and a globe on a brass stand beside the desk",
    14: "Drawn scene: the Illinois capitol dome and a columned courthouse under a navy evening sky, seen over rows of chairs at a public meeting where one hand is raised",
    15: "Drawn scene: a dhow with a lateen sail on the Indian Ocean at dawn, the domes and minarets of Constantinople on the far shore, and a wooden printing press on a table",
    16: "Drawn scene: a Manchester cotton mill with smokestacks, a Paris crowd raising a tricolor, and a steam locomotive pulling across a viaduct under a smoky sky",
    17: "Drawn scene: trenches and barbed wire, a section of the Berlin Wall opened with light pouring through the gap, and a container ship on a calm night sea",
    18: "Drawn scene: Chicago from above at night with the lake, the river's branches, rail lines converging on the Loop, and two population pyramids as cream silhouettes in the sky",
    19: "Drawn scene: the wide steps and columns of the Supreme Court at dusk, and in front, a ballot box with a folded ballot and a pencil resting beside it",
    20: "Drawn scene: the Pullman rail yards with converging tracks and a clock tower, Hull House with its porch on Halsted Street, and the great Ferris wheel of the 1893 fair",
    21: "Drawn scene: a line of townspeople outside a small brick bank, the stands of Stagg Field with a glow under them, and a row of identical 1950s suburban houses",
    22: "Drawn scene: the Lincoln Memorial and the reflecting pool lined with marchers, and at right a Grant Park crowd at night beneath the lit Chicago skyline",
    23: "Drawn scene: the Capitol dome under a navy sky with a stock ticker line jagging across it, and on the table in front, an open egg carton with a dozen eggs",
    24: "Drawn scene: an archive reading room with tall shelves of boxes, a lamp, a magnifying glass over an old document, and a green street sign leaning by the table",
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


def _crowd(seed, xs, y, hmin=26, hspan=10, wmin=8):
    g, out = _lcg(seed), []
    for x in xs:
        out.append(_person(x, y + next(g) % 3, hmin + next(g) % hspan, wmin + next(g) % 3))
    return "".join(out)


# continents as rough blobs in a unit box (0..100 x 0..50), reused by the map scenes
_CONTS = (
    'M8 8 q14 -4 26 2 l6 8 l-8 10 l-6 8 l-8 -6 l-4 -10 z'          # North America
    'M26 30 l6 2 l2 8 l-4 8 l-6 -8 z'                                # South America
    'M44 10 q10 -4 18 0 l-4 8 l-8 4 l-6 -4 z'                         # Europe
    'M46 22 q8 -2 14 4 l-2 12 l-8 6 l-6 -10 z'                        # Africa
    'M62 6 q18 -4 30 4 l-2 10 l-14 6 l-8 -2 l-6 -8 z'                  # Asia
    'M78 34 q6 -2 10 2 l-2 6 l-8 0 z'                                 # Australia
)


def _map(x, y, w, h, stretch_top=1.0, fill="#243A66", op="1"):
    """Continents scaled into a w x h box; stretch_top > 1 exaggerates the north (Mercator-ish)."""
    sy = h / 50
    sx = w / 100
    return (f'<g transform="translate({x} {y}) scale({sx:.3f} {sy:.3f})" fill="{fill}" opacity="{op}">'
            f'<g transform="translate(0 {50*(1-stretch_top):.1f}) scale(1 {stretch_top})"><path d="{_CONTS}"/></g></g>')


# ───────────────────────── 13  Geography of the World: three projections and a globe ─────────────────────────
def _b13():
    p = "ssb13-"
    defs = (
        _lin(p+"wall", [(0, "#F3E7C9", None), (.6, "#E8D7B0", None), (1, "#D2BE92", None)])
        + _lin(p+"paper", [(0, "#FBF4E0", None), (1, "#EEDFB8", None)])
        + _lin(p+"frame", [(0, "#8A6A34", None), (1, "#4E3A1A", None)])
        + _lin(p+"desk", [(0, "#6E4E2A", None), (.15, "#3E2A14", None), (1, "#1C1208", None)])
        + _rad(p+"globe", [(0, "#4F78B8", 1), (.6, "#2E4F8A", 1), (1, "#16294E", 1)], .38, .35, .7)
        + _rad(p+"lamp", [(0, "#FFF2C8", .55), (.6, "#FFF2C8", .08), (1, "#FFF2C8", 0)])
    )
    grid = lambda x, y, w, h, nx, ny: "".join(f'<path d="M{x + i*w/nx:.0f} {y} v{h}"/>' for i in range(1, nx)) + "".join(f'<path d="M{x} {y + j*h/ny:.0f} h{w}"/>' for j in range(1, ny))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<circle cx="560" cy="20" r="320" fill="url(#{p}lamp)"/>
<g fill="url(#{p}frame)"><rect x="52" y="34" width="256" height="216" rx="3"/><rect x="352" y="70" width="336" height="150" rx="3"/><rect x="732" y="60" width="300" height="164" rx="3"/></g>
<g fill="url(#{p}paper)"><rect x="62" y="44" width="236" height="196"/><rect x="362" y="80" width="316" height="130"/><rect x="742" y="70" width="280" height="144"/></g>
<g stroke="#B8A478" stroke-width=".8" opacity=".7">{grid(62, 44, 236, 196, 6, 6)}{grid(362, 80, 316, 130, 8, 4)}</g>
<g stroke="#B8A478" stroke-width=".8" opacity=".7" fill="none"><ellipse cx="882" cy="142" rx="140" ry="72"/><ellipse cx="882" cy="142" rx="90" ry="72"/><ellipse cx="882" cy="142" rx="40" ry="72"/><path d="M742 142 h280 M760 106 h244 M760 178 h244"/></g>
{_map(62, 60, 236, 160, 1.45)}
{_map(362, 84, 316, 120, 0.8)}
{_map(752, 76, 260, 132, 1.0)}
<g fill="#FFFFFF" opacity=".18"><rect x="62" y="44" width="236" height="20"/><rect x="362" y="80" width="316" height="14"/><rect x="742" y="70" width="280" height="14"/></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}desk)"/>
<path d="M0 262 H1200 V267 H0z" fill="#8A6A34"/>
<g transform="translate(1100 190)">
<path d="M-40 72 h80 v-10 h-80z" fill="#8A6A34"/><path d="M-6 62 h12 v-16 h-12z" fill="#8A6A34"/>
<path d="M0 -70 A74 74 0 0 1 0 74" fill="none" stroke="#C9A44A" stroke-width="5" transform="rotate(23)"/>
<circle r="66" fill="url(#{p}globe)"/>
<g transform="rotate(23)" fill="#C9A44A" opacity=".95"><path d="M-30 -52 q12 -8 26 -2 l4 12 l-14 10 l-10 -4 z M-14 -14 q8 -4 16 2 l-2 14 l-10 8 l-8 -10 z M8 -40 q18 -6 30 4 l-6 14 l-16 4 l-8 -10 z M18 8 q10 -2 16 6 l-4 10 l-12 -2 z M-40 10 q6 -2 8 4 l-2 10 l-8 -4 z"/></g>
<g fill="none" stroke="#C9A44A" stroke-width=".8" opacity=".5" transform="rotate(23)"><ellipse rx="66" ry="20"/><ellipse rx="66" ry="44"/><ellipse rx="22" ry="66"/><ellipse rx="46" ry="66"/></g>
<ellipse cx="-24" cy="-30" rx="18" ry="10" fill="#FFFFFF" opacity=".16" transform="rotate(-30)"/>
</g>
<g fill="#3E2A14"><rect x="80" y="240" width="220" height="22" rx="3"/><rect x="330" y="248" width="120" height="14" rx="3"/></g>
<g fill="#EEDFB8"><rect x="90" y="226" width="200" height="16" rx="2"/><rect x="336" y="234" width="108" height="14" rx="2"/></g>
<g fill="#FFFFFF" opacity=".08"><ellipse cx="600" cy="300" rx="420" ry="14"/></g>
<g stroke="#1C1208" stroke-width="1.2" opacity=".5"><path d="M0 328 H1200 M0 384 H1200"/></g>
<g fill="#C9A44A" opacity=".6"><rect x="60" y="256" width="90" height="4" rx="2"/></g>
'''
    return _wrap(13, body, defs)


# ───────────────────────── 14  Citizens of Illinois: capitol, courthouse, a raised hand ─────────────────────────
def _b14():
    p = "ssb14-"
    defs = (
        _lin(p+"sky", [(0, "#0A1436", None), (.5, "#1E3066", None), (.85, "#5A5A78", None), (1, "#B8925A", None)])
        + _lin(p+"stone", [(0, "#E8DCC0", None), (1, "#A08C64", None)])
        + _lin(p+"stone2", [(0, "#D2C4A2", None), (1, "#7E6C4A", None)])
        + _lin(p+"floor", [(0, "#2C2418", None), (.2, "#1A150E", None), (1, "#0B0906", None)])
        + _rad(p+"glow", [(0, "#F6D88A", .8), (.4, "#F6D88A", .2), (1, "#F6D88A", 0)])
    )
    cols = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/>' for x, y, w, h in [(470 + i * 34, 196, 12, 66) for i in range(8)])
    dcols = "".join(f'<rect x="{x}" y="120" width="6" height="40"/>' for x in range(190, 300, 12))
    chairs = "".join(f'<path d="M{x} 300 v-30 h4 v18 h22 v-18 h4 v30 h-4 v-8 h-22 v8z"/>' for x in range(20, 1200, 60))
    chairs2 = "".join(f'<path d="M{x} 326 v-38 h5 v22 h28 v-22 h5 v38 h-5 v-10 h-28 v10z"/>' for x in range(-10, 1200, 70))
    heads = "".join(f'<circle cx="{x + 15}" cy="{262 + (i % 3) * 3}" r="9"/><path d="M{x + 3} 300 v-22 q0 -6 12 -8 q12 2 12 8 v22z"/>' for i, x in enumerate(range(20, 1200, 60)) if i % 5 != 2)
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(14, 40, 180, "#FFFFFF", ".6")}
<circle cx="244" cy="120" r="150" fill="url(#{p}glow)"/>
<g fill="url(#{p}stone2)">
<rect x="150" y="196" width="190" height="66"/><rect x="60" y="216" width="100" height="46"/><rect x="330" y="216" width="100" height="46"/>
<rect x="184" y="160" width="120" height="40"/><rect x="176" y="118" width="136" height="6"/>
<path d="M176 124 h136 v-6 h-136z"/>
<path d="M244 22 q-72 10 -70 96 h140 q2 -86 -70 -96z"/>
<rect x="238" y="0" width="12" height="26"/><path d="M228 26 h32 v-6 h-32z"/>
</g>
<g fill="#5A4E36">{dcols}</g>
<g fill="#F6D88A" opacity=".85"><rect x="200" y="176" width="10" height="16"/><rect x="230" y="176" width="10" height="16"/><rect x="258" y="176" width="10" height="16"/><rect x="284" y="176" width="10" height="16"/><rect x="80" y="230" width="8" height="14"/><rect x="110" y="230" width="8" height="14"/><rect x="350" y="230" width="8" height="14"/><rect x="380" y="230" width="8" height="14"/></g>
<path d="M240 50 q-40 20 -44 68 h88 q-4 -48 -44 -68z" fill="#F6D88A" opacity=".18"/>
<g fill="url(#{p}stone)">
<path d="M450 196 h280 l-140 -60z"/><rect x="450" y="192" width="280" height="8"/>
<rect x="460" y="256" width="260" height="6"/>
</g>
<g fill="#7E6C4A">{cols}</g>
<rect x="580" y="214" width="34" height="48" fill="#3A2E1C"/><rect x="590" y="220" width="14" height="30" fill="#F6D88A" opacity=".7"/>
<path d="M430 262 h320 v8 h-320z M420 270 h340 v8 h-340z" fill="#A08C64"/>
<path d="M0 278 H1200 V420 H0z" fill="url(#{p}floor)"/>
<g fill="#F6D88A" opacity=".16"><rect x="440" y="220" width="10" height="40"/><rect x="734" y="220" width="10" height="40"/></g>
<g fill="#080A16">{heads}</g>
<g fill="#0E1226">{chairs}</g>
<g fill="#0A0D1C">{chairs2}</g>
<g fill="#080A16"><path d="M736 300 v-24 q0 -8 14 -10 q14 2 14 10 v24z"/><circle cx="750" cy="256" r="10"/><path d="M760 276 l10 -46 q2 -6 6 -4 l-8 46z"/><path d="M768 224 l4 -12 M772 224 l8 -10 M776 226 l10 -6 M765 228 l-2 -12" stroke="#080A16" stroke-width="3" stroke-linecap="round"/></g>
<g fill="#F6D88A" opacity=".5"><circle cx="776" cy="222" r="6"/></g>
<g stroke="#0B0906" stroke-width="1.2" opacity=".5"><path d="M0 340 H1200 M0 392 H1200"/></g>
<g fill="#FFFFFF" opacity=".05"><ellipse cx="600" cy="330" rx="500" ry="16"/></g>
'''
    return _wrap(14, body, defs)


# ───────────────────────── 15  Empires and Exchange: dhow, Constantinople, printing press ─────────────────────────
def _b15():
    p = "ssb15-"
    defs = (
        _lin(p+"sky", [(0, "#12204A", None), (.35, "#3A4A78", None), (.6, "#C08A5A", None), (.72, "#F0C070", None), (.8, "#F8DCA0", None)])
        + _rad(p+"sun", [(0, "#FFF4D0", 1), (.3, "#FFD880", .7), (1, "#FFD880", 0)])
        + _lin(p+"sea", [(0, "#F0C070", .9), (.15, "#3A6A8A", 1), (.6, "#1A3A5A", 1), (1, "#0C1E36", 1)])
        + _lin(p+"city", [(0, "#4A3E58", None), (1, "#2A2238", None)])
        + _lin(p+"sail", [(0, "#FBF1D8", None), (1, "#D8C090", None)])
        + _lin(p+"hull", [(0, "#5A3A1A", None), (1, "#2A1A0A", None)])
        + _lin(p+"table", [(0, "#5A3E20", None), (.15, "#33220E", None), (1, "#160E06", None)])
    )
    domes = "".join(f'<path d="M{x} 230 v-{h} q0 -{r} {r} -{r} q{r} 0 {r} {r} v{h}z"/>' for x, r, h in ((560, 34, 20), (640, 16, 12), (700, 20, 10), (760, 26, 14), (830, 14, 8), (880, 30, 16)))
    minarets = "".join(f'<path d="M{x} 230 v-{h} l3 -8 l3 8 v{h}z"/>' for x, h in ((548, 90), (636, 96), (752, 80), (940, 92), (500, 60)))
    walls = "".join(f'<rect x="{x}" y="216" width="8" height="14"/>' for x in range(480, 1000, 16))
    waves = "".join(f'<path d="M{x} {y} q12 -4 24 0 t24 0"/>' for x, y in ((40, 262), (140, 276), (300, 268), (420, 282), (180, 292), (620, 270), (760, 284), (900, 272), (1040, 280), (1120, 264)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(15, 24, 110, "#FFFFFF", ".5")}
<circle cx="720" cy="226" r="160" fill="url(#{p}sun)"/>
<g fill="#3A4A78" opacity=".45"><ellipse cx="240" cy="90" rx="180" ry="7"/><ellipse cx="980" cy="120" rx="160" ry="6"/></g>
<path d="M440 232 Q700 224 1020 232 V240 H440z" fill="url(#{p}city)"/>
<g fill="url(#{p}city)">{domes}{minarets}{walls}<rect x="470" y="200" width="540" height="32"/><path d="M590 200 v-40 h40 v40z M780 200 v-30 h30 v30z"/></g>
<g fill="#F0C070" opacity=".5"><rect x="600" y="172" width="6" height="10"/><rect x="618" y="172" width="6" height="10"/><rect x="790" y="184" width="5" height="8"/></g>
<path d="M0 240 H1200 V420 H0z" fill="url(#{p}sea)"/>
<path d="M600 240 l-60 120 h120z" fill="#FFD880" opacity=".12"/>
<g fill="none" stroke="#F8DCA0" stroke-width="1.5" opacity=".5">{waves}</g>
<g transform="translate(250 262)">
<path d="M-120 0 q10 22 40 26 h160 q34 -4 60 -30 l-30 4 h-200z" fill="url(#{p}hull)"/>
<path d="M-118 0 h250" stroke="#C9A44A" stroke-width="2"/>
<path d="M-40 -4 l60 -190 l6 2 l-58 188z" fill="#5A3A1A"/>
<path d="M-60 -170 L140 -20 L-30 -2z" fill="url(#{p}sail)"/>
<path d="M-60 -170 L140 -20" stroke="#C9A44A" stroke-width="3"/>
<path d="M-30 -60 q40 -30 100 -20" stroke="#D8C090" stroke-width="1" fill="none" opacity=".7"/>
<path d="M100 -20 l30 -4" stroke="#5A3A1A" stroke-width="3"/>
{_person(20, -2, 20, 6).replace('<path', '<path fill="#2A1A0A"').replace('<circle', '<circle fill="#2A1A0A"')}
{_person(60, -2, 18, 6).replace('<path', '<path fill="#2A1A0A"').replace('<circle', '<circle fill="#2A1A0A"')}
<ellipse cx="60" cy="30" rx="150" ry="6" fill="#0C1E36" opacity=".5"/>
</g>
<path d="M760 300 H1200 V420 H760z" fill="url(#{p}table)"/>
<path d="M760 300 H1200 V305 H760z" fill="#8A6A34"/>
<g transform="translate(980 300)">
<path d="M-90 0 v-8 h180 v8z" fill="#2A1A0A"/>
<path d="M-70 -8 v-150 h14 v150z M56 -8 v-150 h14 v150z" fill="#4A3218"/>
<path d="M-80 -158 h164 v-12 h-164z" fill="#4A3218"/>
<path d="M-8 -146 h16 v40 h-16z" fill="#2A1A0A"/>
<path d="M-40 -106 h80 v10 h-80z" fill="#4A3218"/>
<path d="M-20 -146 q-30 -6 -30 20 q0 12 10 14" fill="none" stroke="#2A1A0A" stroke-width="5"/>
<circle cx="-42" cy="-112" r="7" fill="#2A1A0A"/>
<path d="M-40 -96 h80 v6 h-80z" fill="#C9A44A" opacity=".6"/>
<path d="M-56 -60 h112 v14 h-112z" fill="#4A3218"/>
<path d="M-48 -66 h96 v6 h-96z" fill="#FBF1D8"/>
<path d="M-40 -62 h80" stroke="#2A1A0A" stroke-width="1" stroke-dasharray="2 2" opacity=".6"/>
<path d="M-56 -46 h112 v38 h-112z" fill="#33220E"/>
<path d="M60 -8 v-40 h40 v40z" fill="#4A3218"/><path d="M64 -50 h32 v4 h-32z M64 -44 h32 v4 h-32z M64 -38 h32 v4 h-32z" fill="#FBF1D8"/>
</g>
<g fill="#FFFFFF" opacity=".06"><ellipse cx="980" cy="330" rx="180" ry="8"/></g>
<g stroke="#160E06" stroke-width="1.2" opacity=".5"><path d="M760 350 H1200 M760 392 H1200"/></g>
<g fill="#0C1E36" opacity=".6"><path d="M0 330 Q380 320 760 336 V420 H0z"/></g>
'''
    return _wrap(15, body, defs)


# ───────────────────────── 16  Revolutions: mill, tricolor crowd, locomotive ─────────────────────────
def _b16():
    p = "ssb16-"
    defs = (
        _lin(p+"sky", [(0, "#101A3A", None), (.45, "#2E3A5E", None), (.75, "#8A7A6A", None), (.9, "#C8A46A", None)])
        + _lin(p+"smoke", [(0, "#2E3A5E", 0), (1, "#8A8A8A", .55)])
        + _lin(p+"mill", [(0, "#5A3A2A", None), (1, "#2E1E16", None)])
        + _lin(p+"ground", [(0, "#3A2E24", None), (.2, "#1E1812", None), (1, "#0C0A08", None)])
        + _lin(p+"iron", [(0, "#4A4A52", None), (1, "#161618", None)])
        + _rad(p+"lamp", [(0, "#FFD070", .9), (.5, "#FFD070", .2), (1, "#FFD070", 0)])
        + _lin(p+"via", [(0, "#4E4438", None), (1, "#2A241C", None)])
    )
    wins = "".join(f'<rect x="{x}" y="{y}" width="10" height="16"/>' for y in (120, 156, 192) for x in range(80, 330, 26))
    stacks = "".join(f'<rect x="{x}" y="{30 + i * 14}" width="18" height="{80 - i * 14}"/>' for i, x in enumerate((110, 170, 240)))
    plumes = "".join(f'<path d="M{x + 9} {30 + i * 14} q-20 -30 10 -50 q30 -20 20 -60 q-10 -30 30 -40" fill="none" stroke="url(#{p}smoke)" stroke-width="{26 - i * 4}" stroke-linecap="round" opacity=".8"/>' for i, x in enumerate((110, 170, 240)))
    crowd = _crowd(16, range(430, 780, 22), 300, 28, 12, 8)
    arms = "".join(f'<path d="M{x + 2} {282} l{6 if i % 2 else -6} -20" stroke="#0A0A14" stroke-width="3" stroke-linecap="round"/>' for i, x in enumerate(range(452, 780, 44)))
    arches = "".join(f'<path d="M{x} 300 v-40 a24 24 0 0 1 48 0 v40z" fill="#0C0A08" opacity=".7"/>' for x in range(820, 1200, 66))
    ties = "".join(f'<rect x="{x}" y="222" width="4" height="8" fill="#161618"/>' for x in range(800, 1200, 14))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(16, 18, 100, "#FFFFFF", ".4")}
{plumes}
<g fill="#2E3A5E" opacity=".5"><ellipse cx="620" cy="90" rx="220" ry="8"/><ellipse cx="1000" cy="70" rx="180" ry="7"/></g>
<g fill="url(#{p}mill)"><rect x="60" y="100" width="300" height="200"/><path d="M60 100 h300 l-20 -14 h-260z"/>{stacks}</g>
<g fill="#FFD070" opacity=".75">{wins}</g>
<rect x="360" y="180" width="60" height="120" fill="#2E1E16"/>
<path d="M0 262 Q300 258 600 262 T1200 260 V420 H0z" fill="url(#{p}ground)"/>
<path d="M780 226 H1200 V300 H780z" fill="url(#{p}via)"/>
{arches}
<path d="M780 226 H1200 V232 H780z" fill="#161618"/>
{ties}
<g transform="translate(900 222)">
<path d="M-90 0 h200 v-20 h-200z" fill="#161618"/>
<path d="M-90 -20 v-40 h40 v40z" fill="url(#{p}iron)"/>
<path d="M-50 -20 v-32 q0 -10 10 -10 h110 q10 0 10 10 v32z" fill="url(#{p}iron)"/>
<path d="M86 -30 h30 q10 0 10 10 v20 h-40z" fill="#2A2A30"/>
<path d="M-30 -62 h16 v-30 h-16z" fill="#161618"/>
<path d="M-40 -92 h36 v-8 h-36z" fill="#3A3A42"/>
<path d="M30 -62 v-14 q10 -8 20 0 v14z" fill="#3A3A42"/>
<path d="M-24 -100 q-14 -40 20 -60 q30 -20 20 -60" fill="none" stroke="url(#{p}smoke)" stroke-width="20" stroke-linecap="round" opacity=".9"/>
<g fill="#3A3A42"><circle cx="-60" cy="4" r="14"/><circle cx="-14" cy="4" r="20"/><circle cx="34" cy="4" r="20"/><circle cx="92" cy="4" r="12"/><circle cx="120" cy="4" r="12"/></g>
<g fill="#161618"><circle cx="-60" cy="4" r="6"/><circle cx="-14" cy="4" r="8"/><circle cx="34" cy="4" r="8"/></g>
<path d="M-14 4 h48" stroke="#8A8A92" stroke-width="4"/>
<path d="M-80 -20 h0" /><rect x="-76" y="-50" width="12" height="16" fill="#FFD070" opacity=".8"/>
<circle cx="-82" cy="-40" r="6" fill="url(#{p}lamp)"/>
</g>
<g fill="#0A0A14">{crowd}</g>
{arms}
<path d="M604 296 l0 -150" stroke="#2A1E14" stroke-width="4"/>
<path d="M606 148 l90 0 l0 60 l-90 0z" fill="#20308A"/><path d="M636 148 h30 v60 h-30z" fill="#F4F0E8"/><path d="M666 148 h30 v60 h-30z" fill="#C8302A"/>
<path d="M606 148 q45 12 90 0 v60 q-45 -10 -90 0z" fill="#000000" opacity=".12"/>
<path d="M0 300 H780 V310 H0z" fill="#0C0A08" opacity=".6"/>
<g stroke="#0C0A08" stroke-width="1.2" opacity=".5"><path d="M0 340 H1200 M0 392 H1200"/></g>
<g fill="#FFD070" opacity=".08"><ellipse cx="200" cy="320" rx="180" ry="12"/></g>
'''
    return _wrap(16, body, defs)


# ───────────────────────── 17  Twentieth Century: trenches, the Wall opens, a container ship ─────────────────────────
def _b17():
    p = "ssb17-"
    defs = (
        _lin(p+"sky", [(0, "#060C24", None), (.5, "#14224A", None), (.85, "#3A4A6A", None), (1, "#6A6A78", None)])
        + _lin(p+"mud", [(0, "#4A3E30", None), (.3, "#2A2218", None), (1, "#100C08", None)])
        + _lin(p+"wall", [(0, "#B8B4A8", None), (.6, "#8A8678", None), (1, "#5A5648", None)])
        + _rad(p+"gap", [(0, "#FFF4C8", 1), (.35, "#FFD878", .7), (.7, "#FFD878", .15), (1, "#FFD878", 0)])
        + _lin(p+"sea", [(0, "#1A3050", None), (.5, "#0E1E38", None), (1, "#060C20", None)])
        + _lin(p+"ship", [(0, "#2A2E38", None), (1, "#101218", None)])
    )
    g = _lcg(17)
    posts = "".join(f'<path d="M{x} {252 + next(g) % 6} l{-4 + next(g) % 9} -{40 + next(g) % 20}" stroke="#100C08" stroke-width="3"/>' for x in range(30, 420, 42))
    wire = []
    for y0 in (206, 222, 238):
        pts = " ".join(f'L{x} {y0 + (next(g) % 8) - 4}' for x in range(30, 420, 8))
        wire.append(f'<path d="M30 {y0} {pts}" fill="none" stroke="#3A3428" stroke-width="1.4"/>')
    barbs = "".join(f'<path d="M{x} {y} l-4 -4 m4 4 l4 -4 m-4 4 l-4 4 m4 -4 l4 4" stroke="#3A3428" stroke-width="1.2"/>' for x in range(50, 420, 36) for y in (206, 222, 238))
    slabs = "".join(f'<rect x="{x}" y="150" width="58" height="110" rx="2" fill="url(#{p}wall)" stroke="#5A5648" stroke-width="1.5"/>' for x in (470, 530, 590, 770, 830, 890))
    graffiti = "".join(f'<path d="M{x} {y} q10 -10 20 0 t20 0" fill="none" stroke="{c}" stroke-width="3" opacity=".7"/>' for x, y, c in ((480, 200, "#E85A5A"), (540, 230, "#4A9AE8"), (600, 190, "#F0C040"), (780, 220, "#40C080"), (840, 200, "#E85A5A"), (900, 236, "#F0C040")))
    containers = "".join(f'<rect x="{x}" y="{y}" width="30" height="12" fill="{c}"/>' for x, y, c in ((980, 226, "#C84A3A"), (1012, 226, "#3A7AC8"), (1044, 226, "#E0A030"), (1076, 226, "#4AA060"), (996, 214, "#3A7AC8"), (1028, 214, "#C84A3A"), (1060, 214, "#E0A030"), (1012, 202, "#4AA060"), (1044, 202, "#3A7AC8")))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(17, 46, 160, "#FFFFFF", ".6")}
<circle cx="700" cy="150" r="200" fill="url(#{p}gap)" opacity=".55"/>
<g fill="#14224A" opacity=".6"><ellipse cx="200" cy="80" rx="180" ry="8"/><ellipse cx="1000" cy="60" rx="160" ry="7"/></g>
<path d="M940 250 H1200 V420 H940z" fill="url(#{p}sea)"/>
<path d="M940 250 Q1070 246 1200 250 V260 H940z" fill="#3A4A6A" opacity=".4"/>
<g transform="translate(1080 250)">
<path d="M-130 0 q10 22 30 24 h200 q20 -2 26 -24z" fill="url(#{p}ship)"/>
<path d="M-128 0 h250" stroke="#5A5E68" stroke-width="2"/>
<path d="M60 -12 h50 v-42 h-50z" fill="#3A3E48"/><path d="M66 -54 h38 v-10 h-38z" fill="#5A5E68"/><path d="M104 -64 h8 v-14 h-8z" fill="#3A3E48"/>
<g fill="#FFD878" opacity=".8"><rect x="70" y="-48" width="6" height="6"/><rect x="82" y="-48" width="6" height="6"/><rect x="94" y="-48" width="6" height="6"/></g>
<path d="M-110 -12 h170 v12 h-170z" fill="#2A2E38"/>
</g>
{containers}
<ellipse cx="1080" cy="290" rx="150" ry="6" fill="#FFD878" opacity=".12"/>
<path d="M450 262 H940 V420 H450z" fill="#1E2028"/>
<path d="M450 262 H940 V268 H450z" fill="#3A3E48"/>
{slabs}
{graffiti}
<rect x="460" y="144" width="490" height="8" fill="#6A6658"/>
<path d="M648 150 h122 v110 h-122z" fill="url(#{p}gap)"/>
<path d="M648 150 h122 v110 h-122z" fill="#FFF4C8" opacity=".55"/>
<path d="M600 262 L648 150 h122 L820 262z" fill="#FFF4C8" opacity=".12"/>
<g fill="#0A0C18">{_person(700, 262, 34, 10)}{_person(730, 262, 30, 9)}{_person(672, 262, 28, 8)}{_person(748, 262, 24, 7)}</g>
<path d="M702 242 l14 -20 M728 244 l12 -18" stroke="#0A0C18" stroke-width="3" stroke-linecap="round"/>
<path d="M640 232 l-30 -10 l20 -26 l30 10z" fill="#4A9AE8" opacity=".5"/>
<path d="M0 250 Q220 236 450 250 V420 H0z" fill="url(#{p}mud)"/>
<path d="M0 262 Q100 256 200 262 T450 262 V300 Q300 292 150 300 T0 300z" fill="#100C08"/>
<path d="M40 260 h80 v14 h-80z M240 258 h100 v14 h-100z" fill="#2A2218"/>
<g stroke="#4A3E30" stroke-width="2" opacity=".7"><path d="M44 262 v12 M60 262 v12 M76 262 v12 M92 262 v12 M108 262 v12 M244 260 v12 M262 260 v12 M280 260 v12 M298 260 v12 M316 260 v12 M334 260 v12"/></g>
{posts}
{"".join(wire)}
{barbs}
<g fill="#100C08"><path d="M170 250 q-4 -20 6 -30 q10 4 6 30z M190 254 q-2 -14 4 -20 q6 6 4 20z"/></g>
<path d="M120 300 q10 -24 30 -28 q10 22 -4 30z" fill="#100C08"/>
<g stroke="#060C20" stroke-width="1.2" opacity=".5"><path d="M0 340 H1200 M0 392 H1200"/></g>
'''
    return _wrap(17, body, defs)


# ───────────────────────── 18  Human Geography: Chicago from above, population pyramids ─────────────────────────
def _b18():
    p = "ssb18-"
    defs = (
        _lin(p+"land", [(0, "#0B1430", None), (1, "#06091A", None)])
        + _lin(p+"lake", [(0, "#12305E", None), (1, "#0A1E42", None)], 0, 0, 1, 0)
        + _lin(p+"river", [(0, "#2C5A9A", None), (1, "#1E3E70", None)])
        + _rad(p+"loop", [(0, "#FFE0A0", .55), (.4, "#F0B860", .18), (1, "#F0B860", 0)])
        + _lin(p+"cream", [(0, "#FBF1D8", .92), (1, "#E8D2A0", .85)])
    )
    streets = "".join(f'<path d="M{x} 0 V420" opacity="{.35 if x % 120 == 0 else .16}"/>' for x in range(0, 780, 30)) + \
              "".join(f'<path d="M0 {y} H780" opacity="{.35 if y % 120 == 0 else .16}"/>' for y in range(0, 420, 30))
    diag = '<path d="M0 420 L780 40 M0 300 L640 0 M200 420 L780 160 M0 60 L120 0" opacity=".45"/>'
    g = _lcg(18)
    lights = "".join(f'<circle cx="{next(g) % 780}" cy="{next(g) % 300 + 40}" r="{1 + (next(g) % 10) / 10:.1f}"/>' for _ in range(160))
    rails = "".join(f'<path d="M{x} 420 Q{(x + 620) / 2:.0f} {300} 640 212"/>' for x in (100, 260, 400, 560)) + \
            "".join(f'<path d="M{x} 0 Q{(x + 640) / 2:.0f} 110 640 212"/>' for x in (120, 300, 480)) + '<path d="M0 240 Q320 226 640 212"/>'
    towers = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1"/>' for x, y, w, h in ((640, 196, 12, 30), (660, 186, 10, 40), (626, 206, 8, 22), (676, 200, 10, 26), (610, 212, 8, 16)))

    def pyramid(cx, top, rows, w, hrow):
        # rows: list of half-widths as fractions; bottom row first
        out = []
        for i, f in enumerate(rows):
            y = top + (len(rows) - 1 - i) * hrow
            out.append(f'<rect x="{cx - w * f:.0f}" y="{y}" width="{w * f * 2:.0f}" height="{hrow - 1}"/>')
        return "".join(out)
    japan = [.55, .62, .7, .8, .92, 1.0, .96, .9, .82, .7, .55, .4, .26, .14]
    nigeria = [1.0, .9, .8, .7, .6, .5, .42, .34, .26, .2, .14, .09, .05, .03]
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}land)"/>
<path d="M780 0 Q760 100 786 220 Q800 320 770 420 H1200 V0z" fill="url(#{p}lake)"/>
<path d="M780 0 Q760 100 786 220 Q800 320 770 420" stroke="#F0B860" stroke-width="2" fill="none" opacity=".6"/>
<g stroke="#F0B860" stroke-width="1">{streets}</g>
<g stroke="#F0B860" stroke-width="1.2">{diag}</g>
<circle cx="700" cy="220" r="220" fill="url(#{p}loop)"/>
<g fill="#FFE0A0" opacity=".9">{lights}</g>
<g stroke="#FFF4D0" stroke-width="1.6" fill="none" opacity=".55">{rails}</g>
<path d="M786 212 Q700 214 640 212 Q560 210 500 170 Q420 120 380 60 Q350 20 340 0" stroke="url(#{p}river)" stroke-width="12" fill="none" stroke-linecap="round"/>
<path d="M640 212 Q560 240 520 300 Q480 360 470 420" stroke="url(#{p}river)" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M786 212 Q700 214 640 212 Q560 210 500 170 Q420 120 380 60 M640 212 Q560 240 520 300" stroke="#8AB8FF" stroke-width="1.2" fill="none" opacity=".5"/>
<g fill="#FFE0A0" opacity=".85">{towers}</g>
<g fill="#FFFFFF" opacity=".35"><rect x="640" y="192" width="12" height="3"/><rect x="660" y="182" width="10" height="3"/></g>
<g fill="url(#{p}cream)">{pyramid(940, 40, japan, 70, 11)}{pyramid(1100, 40, nigeria, 70, 11)}</g>
<path d="M940 36 V196 M1100 36 V196" stroke="#06091A" stroke-width="1.5" opacity=".6"/>
<path d="M860 196 h160 M1020 196 h160" stroke="#FBF1D8" stroke-width="1.2" opacity=".6"/>
<g fill="#FBF1D8" opacity=".25"><circle cx="880" cy="300" r="1.5"/><circle cx="960" cy="330" r="1.2"/><circle cx="1120" cy="310" r="1.5"/><circle cx="1040" cy="380" r="1.2"/></g>
<g stroke="#12305E" stroke-width="1.5" fill="none" opacity=".5"><path d="M820 330 q20 -6 40 0 t40 0 M900 370 q20 -6 40 0 t40 0 M1020 340 q20 -6 40 0 t40 0"/></g>
<g fill="#F0B860" opacity=".12"><ellipse cx="400" cy="380" rx="300" ry="12"/></g>
'''
    return _wrap(18, body, defs)


# ───────────────────────── 19  Civics: the Supreme Court steps and a ballot box ─────────────────────────
def _b19():
    p = "ssb19-"
    defs = (
        _lin(p+"sky", [(0, "#0C1640", None), (.5, "#2A3A7A", None), (.8, "#8A6A78", None), (1, "#E8B070", None)])
        + _lin(p+"marble", [(0, "#F6F0E0", None), (1, "#C8BC9E", None)])
        + _lin(p+"marble2", [(0, "#D8CCAE", None), (1, "#9A8E70", None)])
        + _lin(p+"steps", [(0, "#D8CCAE", None), (1, "#6A6050", None)])
        + _lin(p+"plaza", [(0, "#3A3428", None), (.2, "#221E16", None), (1, "#0C0A08", None)])
        + _lin(p+"box", [(0, "#8A5A2A", None), (1, "#4A2E12", None)])
        + _rad(p+"glow", [(0, "#FFE8B0", .5), (1, "#FFE8B0", 0)])
    )
    cols = "".join(f'<rect x="{x}" y="112" width="18" height="120"/>' for x in range(370, 830, 30))
    caps = "".join(f'<rect x="{x - 3}" y="108" width="24" height="6"/>' for x in range(370, 830, 30))
    steps = "".join(f'<rect x="{330 - i * 12}" y="{232 + i * 8}" width="{540 + i * 24}" height="8" fill="{"#E4D8BA" if i % 2 == 0 else "#C8BC9E"}"/>' for i in range(6))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(19, 36, 140, "#FFFFFF", ".55")}
<circle cx="600" cy="120" r="260" fill="url(#{p}glow)"/>
<g fill="#2A3A7A" opacity=".5"><ellipse cx="180" cy="120" rx="160" ry="7"/><ellipse cx="1020" cy="90" rx="180" ry="8"/></g>
<g fill="url(#{p}marble2)"><rect x="330" y="120" width="540" height="112"/><rect x="220" y="150" width="120" height="82"/><rect x="860" y="150" width="120" height="82"/></g>
<path d="M340 108 h520 l-260 -66z" fill="url(#{p}marble)"/>
<path d="M340 108 h520 l-260 -66z" fill="none" stroke="#9A8E70" stroke-width="2"/>
<g fill="#9A8E70" opacity=".6"><path d="M560 84 q40 -14 80 0 l-8 12 h-64z"/><circle cx="600" cy="66" r="6"/></g>
<rect x="336" y="104" width="528" height="8" fill="#C8BC9E"/>
<g fill="url(#{p}marble)">{cols}</g><g fill="#C8BC9E">{caps}</g>
<rect x="576" y="150" width="48" height="82" fill="#3A2E1C"/><rect x="590" y="156" width="20" height="60" fill="#FFE8B0" opacity=".45"/>
{steps}
<g fill="#F6F0E0" opacity=".6"><rect x="240" y="180" width="8" height="52"/><rect x="290" y="180" width="8" height="52"/><rect x="900" y="180" width="8" height="52"/><rect x="950" y="180" width="8" height="52"/></g>
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}plaza)"/>
<path d="M0 280 H1200 V284 H0z" fill="#6A6050"/>
<g fill="#0C0A08">{_person(300, 282, 30, 9)}{_person(322, 282, 26, 8)}{_person(880, 282, 30, 9)}{_person(1010, 282, 24, 8)}</g>
<g transform="translate(1040 280)">
<path d="M-70 0 v-80 h140 v80z" fill="url(#{p}box)"/>
<path d="M-70 -80 l10 -14 h120 l10 14z" fill="#A8743A"/>
<path d="M-26 -88 h52 v4 h-52z" fill="#1A1006"/>
<path d="M-70 -80 h140" stroke="#4A2E12" stroke-width="2"/>
<path d="M-56 -40 h112" stroke="#C9A44A" stroke-width="3" opacity=".8"/>
<path d="M-10 -94 l20 -34 h30 l-20 34z" fill="#FBF1D8"/><path d="M-4 -104 l14 0 M0 -112 l14 0 M4 -120 l14 0" stroke="#4A2E12" stroke-width="1.5"/>
<path d="M-40 -100 l-16 -60" stroke="#F0B840" stroke-width="7" stroke-linecap="butt"/><path d="M-56 -160 l-4 -12 l8 2z" fill="#3A2E1C"/><path d="M-40 -100 l2 6 l6 -4z" fill="#E86A8A"/>
<ellipse cx="0" cy="18" rx="90" ry="8" fill="#0C0A08" opacity=".6"/>
</g>
<g fill="#FFE8B0" opacity=".08"><ellipse cx="600" cy="320" rx="420" ry="14"/></g>
<g stroke="#0C0A08" stroke-width="1.2" opacity=".5"><path d="M0 344 H1200 M0 392 H1200"/></g>
<g fill="#1E1A12"><path d="M60 300 q-8 -22 0 -40 q8 18 0 40z M90 304 q-6 -16 0 -30 q6 14 0 30z M1150 302 q-8 -22 0 -40 q8 18 0 40z"/></g>
'''
    return _wrap(19, body, defs)


# ───────────────────────── 20  Gilded Age: Pullman yards, Hull House, the Ferris wheel ─────────────────────────
def _b20():
    p = "ssb20-"
    defs = (
        _lin(p+"sky", [(0, "#101A3C", None), (.5, "#3A3A66", None), (.8, "#B87A5A", None), (1, "#F0C080", None)])
        + _lin(p+"brick", [(0, "#8A4A32", None), (1, "#4E2A1C", None)])
        + _lin(p+"brick2", [(0, "#A8664A", None), (1, "#5E3626", None)])
        + _lin(p+"ground", [(0, "#3A2E24", None), (.2, "#201810", None), (1, "#0C0A06", None)])
        + _lin(p+"wheel", [(0, "#F6E0A0", None), (1, "#C09A50", None)])
        + _rad(p+"glow", [(0, "#FFE8A0", .45), (1, "#FFE8A0", 0)])
    )
    cx, cy, R = 1000, 150, 110
    spokes = "".join(f'<path d="M{cx} {cy} L{cx + math.cos(math.radians(a)) * R:.0f} {cy + math.sin(math.radians(a)) * R:.0f}"/>' for a in range(0, 360, 10))
    cars = "".join(f'<rect x="{cx + math.cos(math.radians(a)) * R - 7:.0f}" y="{cy + math.sin(math.radians(a)) * R - 4:.0f}" width="14" height="10" rx="2"/>' for a in range(0, 360, 20))
    rails = "".join(f'<path d="M{x} 300 L{380 - (x - 380) // 6} 228"/>' for x in range(-80, 720, 44))
    shop_wins = "".join(f'<rect x="{x}" y="{y}" width="8" height="12"/>' for y in (172, 200) for x in range(70, 330, 22))
    hull_wins = "".join(f'<rect x="{x}" y="{y}" width="12" height="18"/>' for y in (156, 196) for x in (560, 600, 640, 680))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(20, 30, 120, "#FFFFFF", ".5")}
<circle cx="1000" cy="150" r="180" fill="url(#{p}glow)"/>
<g fill="#3A3A66" opacity=".5"><ellipse cx="240" cy="70" rx="180" ry="7"/><ellipse cx="700" cy="50" rx="160" ry="6"/></g>
<g fill="url(#{p}brick)"><rect x="50" y="160" width="300" height="70"/><path d="M50 160 l60 -20 l60 20 l60 -20 l60 20 l60 -20 v20z"/><rect x="180" y="40" width="40" height="120"/><path d="M174 40 h52 l-26 -20z"/><rect x="330" y="130" width="14" height="100"/></g>
<circle cx="200" cy="72" r="12" fill="#F6E0A0"/><path d="M200 72 v-8 M200 72 l6 4" stroke="#4E2A1C" stroke-width="2"/>
<g fill="#FFE8A0" opacity=".7">{shop_wins}</g>
<g fill="url(#{p}brick2)"><rect x="540" y="130" width="180" height="100"/><path d="M540 130 h180 l-8 -14 h-164z"/><rect x="530" y="200" width="200" height="8"/><rect x="536" y="208" width="6" height="22"/><rect x="718" y="208" width="6" height="22"/><rect x="600" y="100" width="14" height="30"/></g>
<path d="M530 200 h200 l-12 -20 h-176z" fill="#7A4632"/>
<g fill="#FFE8A0" opacity=".75">{hull_wins}<rect x="618" y="196" width="24" height="34"/></g>
<g stroke="#5E3626" stroke-width="2"><path d="M548 208 v22 M580 208 v22 M680 208 v22 M712 208 v22"/></g>
<g fill="#0A0A14">{_person(660, 230, 26, 8)}{_person(760, 232, 20, 6)}{_person(520, 232, 20, 6)}</g>
<g stroke="url(#{p}wheel)" stroke-width="2" opacity=".9">{spokes}</g>
<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#F6E0A0" stroke-width="4"/>
<circle cx="{cx}" cy="{cy}" r="{R - 14}" fill="none" stroke="#F6E0A0" stroke-width="1.5" opacity=".7"/>
<circle cx="{cx}" cy="{cy}" r="8" fill="#F6E0A0"/>
<g fill="#4E2A1C">{cars}</g>
<path d="M{cx} {cy} L{cx - 60} 270 M{cx} {cy} L{cx + 60} 270 M{cx - 30} 230 h60" stroke="#C09A50" stroke-width="5"/>
<path d="M0 230 H1200 V420 H0z" fill="url(#{p}ground)"/>
<g stroke="#8A7A5A" stroke-width="2" opacity=".75">{rails}</g>
<g stroke="#0C0A06" stroke-width="3" opacity=".6"><path d="M0 264 H700 M0 286 H700 M0 300 H700"/></g>
<path d="M{cx - 66} 270 h132 v8 h-132z" fill="#5E3626"/>
<g fill="#FFE8A0" opacity=".14"><ellipse cx="1000" cy="300" rx="130" ry="10"/><ellipse cx="620" cy="260" rx="120" ry="8"/></g>
<g stroke="#0C0A06" stroke-width="1.2" opacity=".5"><path d="M0 344 H1200 M0 392 H1200"/></g>
<g transform="translate(120 300)"><path d="M-60 0 h120 v-22 h-120z" fill="#2A1E14"/><g fill="#3A2A1C"><circle cx="-40" cy="2" r="8"/><circle cx="40" cy="2" r="8"/></g><rect x="-52" y="-18" width="104" height="10" fill="#FFE8A0" opacity=".25"/></g>
'''
    return _wrap(20, body, defs)


# ───────────────────────── 21  World Wars and Cold War: bank run, Stagg Field glow, a suburb ─────────────────────────
def _b21():
    p = "ssb21-"
    defs = (
        _lin(p+"sky", [(0, "#0A1230", None), (.5, "#2A3660", None), (.85, "#8A8AA0", None), (1, "#E0C890", None)])
        + _lin(p+"bank", [(0, "#8A5A3A", None), (1, "#4A2E1C", None)])
        + _lin(p+"stands", [(0, "#4A4E5E", None), (1, "#20222C", None)])
        + _rad(p+"pile", [(0, "#FFE080", .95), (.3, "#FFB040", .55), (1, "#FFB040", 0)])
        + _lin(p+"house", [(0, "#F0E6D0", None), (1, "#C8B898", None)])
        + _lin(p+"roof", [(0, "#8A6A5A", None), (1, "#5A4238", None)])
        + _lin(p+"ground", [(0, "#2A2C2A", None), (.2, "#181A18", None), (1, "#080908", None)])
    )
    line = _crowd(21, range(40, 400, 24), 262, 28, 12, 8)
    stands = "".join(f'<path d="M{440 + i * 8} {230 - i * 12} h280 v12 h-280z"/>' for i in range(8))
    stand_edges = "".join(f'<path d="M{440 + i * 8} {230 - i * 12} v12"/>' for i in range(0, 8, 2))

    def house(x, y, s):
        return (f'<g transform="translate({x} {y}) scale({s})">'
                f'<path d="M-40 0 v-30 h80 v30z" fill="url(#{p}house)"/><path d="M-46 -30 l46 -26 l46 26z" fill="url(#{p}roof)"/>'
                f'<path d="M-8 0 v-16 h16 v16z" fill="#5A4238"/><rect x="-32" y="-22" width="12" height="10" fill="#FFE080" opacity=".85"/><rect x="18" y="-22" width="12" height="10" fill="#FFE080" opacity=".85"/>'
                f'<rect x="18" y="-52" width="8" height="14" fill="#5A4238"/></g>')
    houses = "".join(house(x, 262, .8) for x in range(820, 1200, 84)) + "".join(house(x, 236, .5) for x in range(800, 1220, 60))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(21, 34, 130, "#FFFFFF", ".5")}
<g fill="#2A3660" opacity=".5"><ellipse cx="200" cy="80" rx="160" ry="7"/><ellipse cx="1000" cy="60" rx="180" ry="8"/></g>
<g fill="url(#{p}bank)"><rect x="40" y="130" width="340" height="132"/><path d="M40 130 h340 v-10 h-340z"/><rect x="60" y="100" width="300" height="20"/></g>
<path d="M80 120 h260 l-12 -14 h-236z" fill="#A8744A"/>
<g fill="#F0E6D0"><rect x="70" y="150" width="14" height="80"/><rect x="130" y="150" width="14" height="80"/><rect x="276" y="150" width="14" height="80"/><rect x="336" y="150" width="14" height="80"/></g>
<rect x="170" y="180" width="80" height="82" fill="#2A1A0E"/><rect x="180" y="186" width="60" height="50" fill="#E0C890" opacity=".35"/>
<path d="M180 186 h60 v50 h-60z" fill="none" stroke="#4A2E1C" stroke-width="2"/><path d="M210 186 v50 M180 210 h60" stroke="#4A2E1C" stroke-width="2"/>
<rect x="60" y="232" width="300" height="30" fill="#4A2E1C"/>
<g fill="#0A0A14">{line}</g>
<g fill="url(#{p}stands)">{stands}</g>
<g stroke="#0A0A14" stroke-width="1.5" opacity=".6">{stand_edges}<path d="M440 230 h280 M448 218 h280 M456 206 h280 M464 194 h280 M472 182 h280 M480 170 h280 M488 158 h280"/></g>
<path d="M496 134 h280 v12 h-280z" fill="#4A4E5E"/>
<g fill="#20222C"><path d="M500 122 h12 v12 h-12z M540 122 h12 v12 h-12z M700 122 h12 v12 h-12z M740 122 h12 v12 h-12z"/></g>
<path d="M440 230 h280 v32 h-280z" fill="#20222C"/>
<ellipse cx="580" cy="262" rx="90" ry="34" fill="url(#{p}pile)"/>
<path d="M520 262 v-24 h120 v24z" fill="#FFB040" opacity=".35"/>
<g fill="#FFE080" opacity=".85"><rect x="530" y="246" width="4" height="10"/><rect x="546" y="242" width="4" height="14"/><rect x="562" y="248" width="4" height="8"/><rect x="578" y="240" width="4" height="16"/><rect x="594" y="246" width="4" height="10"/><rect x="610" y="242" width="4" height="14"/><rect x="626" y="248" width="4" height="8"/></g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}ground)"/>
<path d="M0 262 H1200 V266 H0z" fill="#4A4E5E"/>
{houses}
<path d="M780 262 h420 v10 h-420z" fill="#3A3C3A"/>
<g transform="translate(1060 288)"><path d="M-40 0 h80 v-10 h-80z" fill="#C8B898"/><path d="M-28 -10 l10 -12 h36 l10 12z" fill="#C8B898"/><g fill="#080908"><circle cx="-24" cy="2" r="6"/><circle cx="24" cy="2" r="6"/></g><rect x="-16" y="-20" width="30" height="8" fill="#0A1230" opacity=".7"/></g>
<g fill="#080908"><path d="M980 268 q-6 -16 0 -30 q6 12 0 30z M1000 270 q-4 -12 0 -22 q4 10 0 22z"/></g>
<g stroke="#080908" stroke-width="1.2" opacity=".5"><path d="M0 340 H1200 M0 392 H1200"/></g>
<g fill="#FFB040" opacity=".08"><ellipse cx="580" cy="300" rx="160" ry="12"/></g>
'''
    return _wrap(21, body, defs)


# ───────────────────────── 22  Civil Rights to Today: the reflecting pool and Grant Park at night ─────────────────────────
def _b22():
    p = "ssb22-"
    defs = (
        _lin(p+"sky", [(0, "#060C28", None), (.5, "#14225A", None), (.85, "#3A3A6A", None), (1, "#8A6A6A", None)])
        + _lin(p+"pool", [(0, "#8AA8D8", .9), (.4, "#3A5A9A", 1), (1, "#0E1E44", 1)])
        + _lin(p+"marble", [(0, "#F8F2E4", None), (1, "#C8BEA6", None)])
        + _lin(p+"ground", [(0, "#1E2A1E", None), (.2, "#101810", None), (1, "#060906", None)])
        + _rad(p+"flood", [(0, "#FFF2C8", .8), (.4, "#FFF2C8", .2), (1, "#FFF2C8", 0)])
        + _lin(p+"tower", [(0, "#2A3A6A", None), (1, "#101A3A", None)])
    )
    cols = "".join(f'<rect x="{x}" y="110" width="10" height="70"/>' for x in range(120, 330, 18))
    g = _lcg(22)
    marchers_l = "".join(_person(x, 244 + next(g) % 3, 14 + next(g) % 4, 5) for x in range(100, 620, 12))
    marchers_r = "".join(_person(x, 278 + next(g) % 3, 18 + next(g) % 5, 6) for x in range(60, 640, 14))
    towers = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{260 - y}"/>' for x, y, w in ((700, 120, 22), (730, 90, 30), (768, 140, 20), (796, 60, 36), (840, 110, 24), (872, 150, 18), (898, 80, 34), (940, 130, 22), (970, 100, 30), (1008, 150, 20), (1036, 70, 40), (1084, 120, 26), (1118, 160, 20), (1146, 100, 30), (1184, 140, 20)))
    twins = "".join(f'<rect x="{next(g) % 480 + 700}" y="{next(g) % 150 + 90}" width="3" height="4"/>' for _ in range(120))
    crowd = "".join(f'<circle cx="{next(g) % 500 + 690}" cy="{270 + next(g) % 26}" r="{4 + next(g) % 3}"/>' for _ in range(180))
    phones = "".join(f'<circle cx="{next(g) % 500 + 690}" cy="{262 + next(g) % 30}" r="1.6"/>' for _ in range(70))
    signs = "".join(f'<rect x="{x}" y="{y}" width="26" height="16" rx="1"/>' for x, y in ((720, 250), (800, 246), (890, 252), (990, 248), (1080, 250), (1150, 246)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(22, 50, 170, "#FFFFFF", ".6")}
<circle cx="220" cy="140" r="200" fill="url(#{p}flood)"/>
<g fill="#14225A" opacity=".55"><ellipse cx="500" cy="60" rx="180" ry="7"/></g>
<g fill="url(#{p}marble)"><rect x="100" y="98" width="250" height="12"/><rect x="96" y="82" width="258" height="16"/><rect x="110" y="180" width="230" height="10"/><rect x="90" y="190" width="270" height="12"/><rect x="80" y="202" width="290" height="10"/></g>
<g fill="#C8BEA6">{cols}</g>
<rect x="196" y="120" width="58" height="60" fill="#3A3A5A"/><path d="M212 178 v-30 q0 -10 13 -12 q13 2 13 12 v30z" fill="#F8F2E4" opacity=".7"/>
<path d="M0 212 H660 V420 H0z" fill="url(#{p}ground)"/>
<path d="M60 240 h560 v44 h-560z" fill="url(#{p}pool)"/>
<path d="M60 240 h560" stroke="#C8BEA6" stroke-width="2"/><path d="M60 284 h560" stroke="#C8BEA6" stroke-width="2"/>
<path d="M120 244 h40 v32 h-40z" fill="#F8F2E4" opacity=".28"/>
<g fill="#F8F2E4" opacity=".14"><path d="M100 250 q60 -4 120 0 t120 0 t120 0 t120 0" stroke="#F8F2E4" stroke-width="1.5" fill="none"/></g>
<g fill="#0A0A14">{marchers_l}</g>
<g fill="#080810">{marchers_r}</g>
<g fill="#F8F2E4" opacity=".85"><rect x="180" y="256" width="18" height="12"/><rect x="330" y="254" width="18" height="12"/><rect x="480" y="257" width="18" height="12"/></g>
<path d="M660 0 V420" stroke="#060C28" stroke-width="10" opacity=".7"/>
<path d="M660 260 H1200 V420 H660z" fill="#06090E"/>
<g fill="url(#{p}tower)">{towers}</g>
<g fill="#FFE8A0" opacity=".8">{twins}</g>
<rect x="800" y="60" width="36" height="6" fill="#FFE8A0" opacity=".8"/><rect x="1040" y="70" width="40" height="6" fill="#FFE8A0" opacity=".8"/>
<circle cx="940" cy="200" r="80" fill="url(#{p}flood)" opacity=".7"/>
<rect x="900" y="190" width="80" height="60" fill="#0A1230"/><rect x="910" y="200" width="60" height="40" fill="#FFF2C8" opacity=".6"/>
<g fill="#3A5A9A" opacity=".9">{signs}</g>
<g fill="#08080E">{crowd}</g>
<g fill="#FFF2C8" opacity=".9">{phones}</g>
<g stroke="#060906" stroke-width="1.2" opacity=".5"><path d="M0 344 H1200 M0 392 H1200"/></g>
<g fill="#0A140A"><path d="M30 236 q-8 -22 0 -40 q8 18 0 40z M620 232 q-9 -24 0 -42 q9 18 0 42z M640 238 q-6 -16 0 -28 q6 12 0 28z"/></g>
'''
    return _wrap(22, body, defs)


# ───────────────────────── 23  Government and Economics: the Capitol, a ticker line, an egg carton ─────────────────────────
def _b23():
    p = "ssb23-"
    defs = (
        _lin(p+"sky", [(0, "#080E2E", None), (.5, "#1A2A66", None), (.85, "#4A4A80", None), (1, "#A08A70", None)])
        + _lin(p+"dome", [(0, "#FAF4E6", None), (1, "#B8AC92", None)], 0, 0, 1, 0)
        + _lin(p+"stone", [(0, "#EAE0C8", None), (1, "#A89C7E", None)])
        + _lin(p+"table", [(0, "#4A3A28", None), (.15, "#2A2016", None), (1, "#100C08", None)])
        + _lin(p+"carton", [(0, "#C8C0B0", None), (1, "#8A8478", None)])
        + _rad(p+"egg", [(0, "#FFFCF2", 1), (.6, "#EFE6D2", 1), (1, "#C8BCA4", 1)], .4, .35, .7)
        + _rad(p+"glow", [(0, "#FFE8B0", .45), (1, "#FFE8B0", 0)])
    )
    g = _lcg(23)
    y = 120
    tick = ["M0 120"]
    for x in range(20, 1220, 20):
        y = max(30, min(200, y + (next(g) % 60) - 28))
        tick.append(f"L{x} {y}")
    ticker = " ".join(tick)
    drum = "".join(f'<rect x="{x}" y="112" width="6" height="30"/>' for x in range(548, 660, 12))
    wings = "".join(f'<rect x="{x}" y="186" width="10" height="46"/>' for x in range(330, 560, 26)) + "".join(f'<rect x="{x}" y="186" width="10" height="46"/>' for x in range(660, 880, 26))
    eggs = "".join(f'<ellipse cx="{x}" cy="{y}" rx="16" ry="19" fill="url(#{p}egg)"/>' for y in (250, 282) for x in range(560, 780, 36))
    cups = "".join(f'<path d="M{x - 18} {y + 8} q18 14 36 0" fill="none" stroke="#6A6458" stroke-width="2"/>' for y in (250, 282) for x in range(560, 780, 36))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(23, 44, 150, "#FFFFFF", ".55")}
<circle cx="600" cy="140" r="220" fill="url(#{p}glow)"/>
<g fill="#1A2A66" opacity=".5"><ellipse cx="180" cy="90" rx="160" ry="7"/><ellipse cx="1040" cy="70" rx="170" ry="8"/></g>
<path d="{ticker}" fill="none" stroke="#F0C060" stroke-width="2.5" stroke-linejoin="round" opacity=".9"/>
<path d="{ticker} V210 H0z" fill="#F0C060" opacity=".08"/>
<g fill="#F0C060"><circle cx="300" cy="{tick[15][1:].split()[1]}" r="4"/><circle cx="900" cy="{tick[45][1:].split()[1]}" r="4"/></g>
<g fill="url(#{p}stone)"><rect x="320" y="180" width="560" height="52"/><rect x="310" y="232" width="580" height="8"/><rect x="520" y="142" width="160" height="40"/><rect x="536" y="106" width="128" height="6"/></g>
<path d="M600 10 q-58 8 -58 96 h116 q0 -88 -58 -96z" fill="url(#{p}dome)"/>
<path d="M600 10 q-58 8 -58 96 h116 q0 -88 -58 -96z" fill="none" stroke="#8A7E64" stroke-width="1.5"/>
<path d="M560 60 q40 -10 80 0 M548 88 q52 -8 104 0" stroke="#8A7E64" stroke-width="1" fill="none" opacity=".6"/>
<rect x="596" y="0" width="8" height="12" fill="#EAE0C8"/><path d="M584 24 h32 v-6 h-32z" fill="#EAE0C8"/>
<g fill="#8A7E64">{drum}</g>
<g fill="#EAE0C8">{wings}</g>
<path d="M540 180 h120 l-60 -30z" fill="#EAE0C8"/>
<rect x="586" y="196" width="28" height="36" fill="#3A2E1C"/><rect x="594" y="200" width="12" height="24" fill="#FFE8B0" opacity=".5"/>
<g fill="#FFE8B0" opacity=".6"><rect x="360" y="200" width="6" height="12"/><rect x="412" y="200" width="6" height="12"/><rect x="464" y="200" width="6" height="12"/><rect x="740" y="200" width="6" height="12"/><rect x="792" y="200" width="6" height="12"/><rect x="844" y="200" width="6" height="12"/></g>
<path d="M0 240 H1200 V420 H0z" fill="url(#{p}table)"/>
<path d="M0 240 H1200 V244 H0z" fill="#6A5A40"/>
<path d="M530 240 v-8 h250 l-14 -60 h-222z" fill="url(#{p}carton)"/>
<path d="M530 232 h250 v78 h-250z" fill="url(#{p}carton)"/>
<path d="M530 232 h250" stroke="#6A6458" stroke-width="2"/>
{cups}
{eggs}
<g fill="#FFFFFF" opacity=".28"><ellipse cx="554" cy="242" rx="5" ry="7"/><ellipse cx="626" cy="242" rx="5" ry="7"/><ellipse cx="698" cy="274" rx="5" ry="7"/><ellipse cx="770" cy="242" rx="5" ry="7"/></g>
<ellipse cx="655" cy="318" rx="140" ry="8" fill="#100C08" opacity=".6"/>
<g fill="#FFE8B0" opacity=".08"><ellipse cx="600" cy="330" rx="420" ry="12"/></g>
<g stroke="#100C08" stroke-width="1.2" opacity=".5"><path d="M0 344 H1200 M0 392 H1200"/></g>
<g fill="#F0C060" opacity=".5"><rect x="120" y="230" width="60" height="4" rx="2"/><rect x="1020" y="230" width="60" height="4" rx="2"/></g>
'''
    return _wrap(23, body, defs)


# ───────────────────────── 24  Capstone: the archive reading room ─────────────────────────
def _b24():
    p = "ssb24-"
    defs = (
        _lin(p+"wall", [(0, "#1A1C2E", None), (1, "#2A2C44", None)])
        + _lin(p+"shelf", [(0, "#4A3A28", None), (1, "#2A2016", None)])
        + _lin(p+"box", [(0, "#C8B896", None), (1, "#8A7A58", None)])
        + _lin(p+"box2", [(0, "#A89A78", None), (1, "#6A5E46", None)])
        + _lin(p+"table", [(0, "#6A4E2E", None), (.15, "#3A2A18", None), (1, "#160E08", None)])
        + _rad(p+"lamp", [(0, "#FFF0C0", .85), (.3, "#FFE8A0", .3), (1, "#FFE8A0", 0)])
        + _rad(p+"lens", [(0, "#8AB8E8", .12), (.7, "#BFE0FF", .28), (1, "#FFFFFF", .5)])
        + _lin(p+"sign", [(0, "#2E8A4A", None), (1, "#1E5E32", None)])
    )
    g = _lcg(24)

    def shelf(x0, x1, ys, big):
        out = []
        for y in ys:
            out.append(f'<rect x="{x0}" y="{y}" width="{x1 - x0}" height="6" fill="url(#{p}shelf)"/>')
            x = x0 + 6
            while x < x1 - 30:
                w = (30 if big else 22) + next(g) % 8
                h = (36 if big else 28) + next(g) % 6
                fill = p + ("box" if next(g) % 3 else "box2")
                out.append(f'<rect x="{x}" y="{y - h}" width="{w}" height="{h}" rx="1" fill="url(#{fill})"/>')
                out.append(f'<rect x="{x + 4}" y="{y - h + 6}" width="{w - 8}" height="5" fill="#FBF1D8" opacity=".55"/>')
                x += w + 4
        return "".join(out)
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="40" y="0" width="360" height="262" fill="#141626"/><rect x="800" y="0" width="360" height="262" fill="#141626"/>
{shelf(46, 394, (60, 110, 160, 210, 260), True)}
{shelf(806, 1154, (60, 110, 160, 210, 260), True)}
<g fill="url(#{p}shelf)"><rect x="40" y="0" width="6" height="262"/><rect x="394" y="0" width="6" height="262"/><rect x="800" y="0" width="6" height="262"/><rect x="1154" y="0" width="6" height="262"/><rect x="40" y="0" width="360" height="8"/><rect x="800" y="0" width="360" height="8"/></g>
<rect x="420" y="30" width="360" height="200" rx="3" fill="#0E1020"/>
<g stroke="#4A4C64" stroke-width="2" fill="none"><rect x="420" y="30" width="360" height="200" rx="3"/><path d="M600 30 V230 M420 130 H780"/></g>
{_stars(24, 24, 200, "#FFFFFF", ".5", 424, 776)}
<circle cx="600" cy="0" r="170" fill="url(#{p}lamp)"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}table)"/>
<path d="M0 262 H1200 V267 H0z" fill="#8A6A44"/>
<g transform="translate(460 262)"><path d="M-2 0 v-90 h4 v90z" fill="#2A2016"/><path d="M-40 -90 h80 l-14 -30 h-52z" fill="#3A5A40"/><ellipse cx="0" cy="-90" rx="40" ry="6" fill="#FFF0C0" opacity=".9"/><circle cy="-96" r="70" fill="url(#{p}lamp)" opacity=".6"/><path d="M-30 0 h60 v-8 h-60z" fill="#2A2016"/></g>
<g transform="translate(600 262)">
<path d="M-140 0 l10 -70 h190 l-6 70z" fill="#EFE2C0"/><path d="M-150 0 l10 -70 h14 l-8 70z" fill="#C8B896"/>
<g stroke="#4A4C64" stroke-width="1.4" opacity=".65"><path d="M-116 -56 h140 M-118 -46 h100 M-120 -36 h130 M-122 -26 h90 M-124 -16 h120 M-126 -8 h70"/></g>
<path d="M-60 -50 h40" stroke="#C9A44A" stroke-width="3"/>
<path d="M60 -10 l70 -36" stroke="#3A2A18" stroke-width="12" stroke-linecap="round"/><path d="M60 -10 l70 -36" stroke="#8A6A44" stroke-width="7" stroke-linecap="round"/>
<circle cx="164" cy="-64" r="40" fill="url(#{p}lens)" stroke="#8A6A44" stroke-width="6"/><circle cx="164" cy="-64" r="40" fill="none" stroke="#2A2016" stroke-width="1.5"/>
<path d="M142 -80 q12 -14 28 -14" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity=".7"/>
<g stroke="#4A4C64" stroke-width="2.2" opacity=".8"><path d="M140 -68 h48 M142 -58 h40 M146 -48 h30"/></g>
</g>
<g transform="translate(1020 262)">
<path d="M-4 0 v-190 h8 v190z" fill="#8A8A90"/>
<path d="M-80 -190 h150 v34 h-150z" fill="url(#{p}sign)"/><path d="M-80 -190 h150 v34 h-150z" fill="none" stroke="#F4F0E8" stroke-width="2"/>
<g stroke="#F4F0E8" stroke-width="5" stroke-linecap="round"><path d="M-64 -173 h60 M6 -173 h50"/></g>
<path d="M-40 -150 h80 v22 h-80z" fill="url(#{p}sign)"/><path d="M-40 -150 h80 v22 h-80z" fill="none" stroke="#F4F0E8" stroke-width="1.5"/><path d="M-26 -139 h52" stroke="#F4F0E8" stroke-width="3.5" stroke-linecap="round"/>
<path d="M-24 0 h48 v-10 h-48z" fill="#3A2A18"/>
</g>
<g fill="url(#{p}box)"><rect x="140" y="220" width="60" height="42" rx="2"/><rect x="210" y="228" width="50" height="34" rx="2"/></g><g fill="#FBF1D8" opacity=".5"><rect x="148" y="228" width="44" height="5"/><rect x="218" y="236" width="34" height="5"/></g>
<g fill="#FFE8A0" opacity=".08"><ellipse cx="600" cy="320" rx="400" ry="12"/></g>
<g stroke="#160E08" stroke-width="1.2" opacity=".5"><path d="M0 344 H1200 M0 392 H1200"/></g>
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
