"""Unit banners for the Science course, units 1-14 (K-2, 3-5, 6-8).

Fourteen drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_sci_a import BANNERS, CREDITS, banner
    banner(7)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"sb{n}-" so all 27 science banners can sit on one contents page.
No text, no images, no external references, no feTurbulence.

Page CSS note (same as the U.S. History banners):
    .sci-banner svg { width:100%; height:100%; display:block; }
The page sits the banner over a #0A1E33 band and paints a dark gradient
over the bottom ~45% for the unit title, so the lower part of every scene
is kept calm (table tops, water, ground) and the action sits in the
upper 55%.
"""

import math

W, H = 1200, 420

CREDITS = {
    1: "Drawn scene: a playground at golden hour with a swing mid-arc, a slide, a wagon being pulled and a ball rolling down a small hill",
    2: "Drawn scene: a bedroom at night where a flashlight throws a rabbit shadow puppet on the wall, with a drum on the floor and ripples in a glass of water",
    3: "Drawn scene: a bean sprout in a cup on a sunny windowsill, with a pond, prairie, a butterfly and a bird's nest outside the window",
    4: "Drawn scene: a spring backyard with a weather vane, a rain gauge, puddles reflecting the sky, the sun on one side, a faint moon on the other and the edge of a rainbow",
    5: "Drawn scene: a workshop table with a marble run of cardboard tubes, a magnet lifting paper clips and a lamp lit by a battery circuit",
    6: "Drawn scene: a kitchen science bench with a balloon on a scale, a straw that looks bent in a glass of water, sugar dissolving and a jump-rope wave frozen mid-air",
    7: "Drawn scene: a monarch chrysalis and butterfly on milkweed, tadpoles in a jar, an oak sapling beside a stump and a fossil fern in rock",
    8: "Drawn scene: a pond edge at dusk with cattails, a heron, a frog on a lily pad, dragonflies, fish shadows and mushrooms on a log",
    9: "Drawn scene: flat Illinois farmland under a huge sky with a distant storm cell and tornado funnel, a weather station and a rising moon",
    10: "Drawn scene: a chemistry bench with beakers, a burner flame, bubbles rising in a flask, a periodic-table poster of colored blocks and a molecule model",
    11: "Drawn scene: a roller coaster's first hill against a summer sunset sky, cars at the crest and a Ferris wheel far off",
    12: "Drawn scene: a spinning record and tonearm close up with sound waves as arcs, a radio tower on a hill sending signal arcs and a telescope under a night sky",
    13: "Drawn scene: a microscope on a lab bench with its eyepiece view shown as a large circle of onion cells, a beaker and a notebook",
    14: "Drawn scene: a rocky lakeshore with a flowering plant and waves, with a pea-plant trellis in the foreground corner",
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


# ───────────────────────── 1  Pushes, Pulls and Stuff: playground at golden hour ─────────────────────────
def _b1():
    p = "sb1-"
    defs = (
        _lin(p+"sky", [(0, "#5E9BD8", None), (.45, "#9CCBEE", None), (.75, "#F6D98C", None), (1, "#F7B968", None)])
        + _rad(p+"sun", [(0, "#FFF3C4", 1), (.3, "#FFD46A", .7), (1, "#FFD46A", 0)])
        + _lin(p+"hill", [(0, "#A7CF5E", None), (1, "#6E9E3C", None)])
        + _lin(p+"grass", [(0, "#8DBD4C", None), (1, "#4E7E2C", None)])
        + _lin(p+"fg", [(0, "#365C22", None), (1, "#1D3414", None)])
        + _lin(p+"slide", [(0, "#F4E1A6", None), (1, "#E0B85A", None)])
    )
    S = "#4A2C1C"
    rungs = "".join(f'<path d="M1046 {y} h28"/>' for y in range(200, 300, 16))
    tufts = "".join(f'<path d="M{x} 380 l3 -12 l3 12z M{x+8} 382 l2 -9 l3 9z"/>' for x in range(20, 1200, 64))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="860" cy="150" r="150" fill="url(#{p}sun)"/><circle cx="860" cy="150" r="38" fill="#FFF1BF"/>
<g fill="#FFFFFF" opacity=".55"><ellipse cx="200" cy="80" rx="120" ry="14"/><ellipse cx="260" cy="70" rx="60" ry="18"/><ellipse cx="1000" cy="60" rx="140" ry="12"/><ellipse cx="560" cy="110" rx="90" ry="9"/></g>
<path d="M0 262 Q80 236 160 250 Q240 214 320 246 Q400 230 480 250 Q560 226 640 248 Q720 236 800 254 Q880 232 960 250 Q1040 226 1120 248 Q1160 240 1200 250 V320 H0z" fill="#79A94A"/>
<path d="M0 312 H1200 V420 H0z" fill="url(#{p}grass)"/>
<path d="M210 312 Q400 170 660 312z" fill="url(#{p}hill)"/><path d="M210 312 Q400 170 660 312" stroke="#C6E08A" stroke-width="3" fill="none" opacity=".7"/>
<path d="M300 300 Q400 214 560 292" stroke="#C6E08A" stroke-width="2" fill="none" opacity=".6"/>
<g fill="none" stroke="{S}" stroke-width="2" opacity=".5"><path d="M470 232 q-20 -10 -34 -2"/><path d="M462 218 q-24 -10 -40 0"/><path d="M448 206 q-18 -6 -30 2"/></g>
<circle cx="508" cy="244" r="15" fill="#E4573D"/><path d="M493 244 q15 -12 30 0 q-15 12 -30 0z" fill="#F7EBD0"/><path d="M501 232 q7 12 0 24" stroke="#E4573D" stroke-width="2" fill="none"/>
<g stroke="{S}" stroke-width="6" fill="none" stroke-linecap="round"><path d="M612 300 L650 150 L688 300"/><path d="M780 300 L818 150 L856 300"/><path d="M650 150 H818"/></g>
<g stroke="{S}" stroke-width="2.5" fill="none"><path d="M690 150 L770 246"/><path d="M702 150 L782 246"/></g>
<path d="M758 244 l34 4 l-2 7 l-34 -4z" fill="{S}"/>
<g fill="{S}"><circle cx="784" cy="212" r="10"/><path d="M776 220 q10 -4 16 4 l10 22 l-14 6 l-8 -6 l-12 4 l-4 -8 q0 -14 12 -22z"/><path d="M786 246 l24 6 l-2 6 l-24 -6z"/><path d="M798 240 l14 -2 l-4 8z"/></g>
<g fill="{S}"><rect x="1040" y="190" width="6" height="122"/><rect x="1074" y="190" width="6" height="122"/><rect x="1032" y="184" width="54" height="8"/><g stroke="{S}" stroke-width="4">{rungs}</g></g>
<path d="M1036 190 q-80 40 -140 116 h-24 q60 -84 148 -130z" fill="url(#{p}slide)"/><path d="M1036 190 q-80 40 -140 116" stroke="{S}" stroke-width="4" fill="none"/><path d="M1024 184 q-84 46 -150 124" stroke="{S}" stroke-width="3" fill="none"/>
<path d="M960 312 l40 -60 l6 3 l-40 60z M900 312 l-14 -20 h6 l12 18z" fill="{S}"/>
<g fill="{S}"><circle cx="1056" cy="164" r="9"/><path d="M1046 174 h20 l4 16 h-28z"/></g>
<g fill="#C8402F"><path d="M228 280 h84 l-4 24 h-76z"/></g><path d="M228 280 h84 v6 h-84z" fill="#8F2B1F"/>
<g fill="{S}"><circle cx="244" cy="308" r="9"/><circle cx="296" cy="308" r="9"/><circle cx="244" cy="308" r="3" fill="#F6D98C"/><circle cx="296" cy="308" r="3" fill="#F6D98C"/></g>
<path d="M228 288 L178 270" stroke="{S}" stroke-width="3" fill="none"/>
<g fill="{S}"><circle cx="150" cy="236" r="11"/><path d="M142 248 q8 -4 16 0 l6 24 l-4 40 h-8 l-2 -30 l-6 30 h-8 l2 -40z"/><path d="M158 254 l22 14 l-2 5 l-24 -14z"/></g>
<g fill="#E4573D"><circle cx="270" cy="268" r="9"/></g><path d="M262 272 h16 l4 8 h-24z" fill="#4A6FB5"/>
<path d="M0 372 Q300 360 600 370 T1200 366 V420 H0z" fill="url(#{p}fg)"/>
<g fill="#1A2E12">{tufts}</g>
'''
    return _wrap(1, body, defs)


# ───────────────────────── 2  Light, Sound and Waves: bedroom at night ─────────────────────────
def _b2():
    p = "sb2-"
    defs = (
        _lin(p+"wall", [(0, "#0A1240", None), (.6, "#162764", None), (1, "#1E3272", None)])
        + _lin(p+"floor", [(0, "#1A1E4C", None), (1, "#090C22", None)])
        + _rad(p+"pool", [(0, "#FFE9B0", .95), (.5, "#FFC96A", .55), (1, "#FFC96A", 0)])
        + _lin(p+"cone", [(0, "#FFD98A", .6), (1, "#FFD98A", .05)], 0, 1, 1, 0)
        + _rad(p+"moon", [(0, "#F6F2E0", 1), (.3, "#E8E4CC", .7), (1, "#E8E4CC", 0)])
        + _lin(p+"bed", [(0, "#4F5A9A", None), (1, "#2C3468", None)])
        + _lin(p+"drum", [(0, "#C9473A", None), (1, "#7E2A22", None)])
    )
    lace = "".join(f'<path d="M{x} 270 l16 44 M{x+16} 270 l-16 44"/>' for x in range(852, 946, 16))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="900" y="40" width="210" height="170" fill="#0A1030"/>
{_stars(7, 26, 160, "#E8E9F5", ".8", 905, 1105)}
<circle cx="1050" cy="90" r="46" fill="url(#{p}moon)"/><circle cx="1050" cy="90" r="16" fill="#F6F2E0"/>
<g fill="#2C3B80"><rect x="892" y="32" width="226" height="8"/><rect x="892" y="210" width="226" height="10"/><rect x="892" y="32" width="8" height="188"/><rect x="1110" y="32" width="8" height="188"/><rect x="1002" y="40" width="6" height="170"/><rect x="900" y="122" width="210" height="6"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}floor)"/><path d="M0 300 h1200 v5 H0z" fill="#2A3574"/>
<path d="M232 252 L470 40 L860 130 L820 300z" fill="url(#{p}cone)"/>
<ellipse cx="640" cy="170" rx="250" ry="150" fill="url(#{p}pool)"/>
<g fill="#0A1240" opacity=".9"><ellipse cx="612" cy="112" rx="12" ry="40" transform="rotate(-14 612 112)"/><ellipse cx="648" cy="108" rx="12" ry="42" transform="rotate(10 648 108)"/><circle cx="630" cy="170" r="32"/><ellipse cx="630" cy="236" rx="40" ry="34"/><circle cx="612" cy="164" r="3" fill="#FFE9B0"/><path d="M596 176 q6 4 12 0" stroke="#FFE9B0" stroke-width="1.5" fill="none"/></g>
<path d="M566 300 v-30 q30 -20 64 -10 q16 10 8 40z" fill="#0A1240" opacity=".8"/>
<g fill="url(#{p}bed)"><rect x="20" y="180" width="18" height="120" rx="4"/><path d="M20 262 H330 V300 H20z"/><rect x="38" y="236" width="80" height="26" rx="8" fill="#DCDDEF"/></g>
<path d="M118 262 Q220 240 330 262 V300 H118z" fill="#6B76B8"/>
<g transform="translate(150 246) rotate(-32)"><rect x="0" y="-8" width="70" height="16" rx="4" fill="#2A2E3E"/><rect x="66" y="-11" width="18" height="22" rx="3" fill="#3C4152"/><rect x="82" y="-9" width="4" height="18" fill="#FFE9B0"/><rect x="10" y="-4" width="34" height="8" rx="2" fill="#4A4F62"/></g>
<g fill="url(#{p}drum)"><rect x="842" y="270" width="116" height="46"/></g><ellipse cx="900" cy="316" rx="58" ry="12" fill="#5E1F19"/><ellipse cx="900" cy="270" rx="58" ry="14" fill="#F1E5C8"/><ellipse cx="900" cy="270" rx="58" ry="14" fill="none" stroke="#C9473A" stroke-width="3"/>
<g stroke="#F1E5C8" stroke-width="2" fill="none">{lace}</g>
<g stroke="#D9C39A" stroke-width="4" stroke-linecap="round"><path d="M878 256 l-30 -46"/><path d="M924 258 l26 -48"/></g>
<g fill="none" stroke="#F1E5C8" stroke-width="1.5" opacity=".55"><path d="M842 236 q-12 12 -10 30"/><path d="M834 226 q-18 18 -14 46"/><path d="M958 236 q12 12 10 30"/><path d="M966 226 q18 18 14 46"/></g>
<g fill="#2A2C55"><rect x="1000" y="238" width="130" height="62"/><rect x="994" y="232" width="142" height="8"/></g>
<path d="M1044 176 h40 l-4 60 h-32z" fill="#DCE8F4" opacity=".35"/><path d="M1046 196 h36 l-3 40 h-30z" fill="#7FB4E6" opacity=".7"/>
<g fill="none" stroke="#DCE8F4" stroke-width="1.5" opacity=".9"><ellipse cx="1064" cy="196" rx="4" ry="1.5"/><ellipse cx="1064" cy="196" rx="10" ry="3"/><ellipse cx="1064" cy="196" rx="17" ry="5"/></g>
<circle cx="1064" cy="186" r="2.5" fill="#DCE8F4" opacity=".8"/>
<ellipse cx="560" cy="386" rx="220" ry="18" fill="#2A3574" opacity=".5"/><ellipse cx="560" cy="386" rx="180" ry="12" fill="#4A4F92" opacity=".35"/>
'''
    return _wrap(2, body, defs)


# ───────────────────────── 3  Living Things and Where They Live: windowsill morning ─────────────────────────
def _b3():
    p = "sb3-"
    defs = (
        _lin(p+"room", [(0, "#EAF0D8", None), (1, "#C6D3A8", None)])
        + _lin(p+"sky", [(0, "#8FC4E8", None), (.5, "#CFE6EE", None), (1, "#FBE8B4", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.35, "#FFE08A", .6), (1, "#FFE08A", 0)])
        + _lin(p+"prairie", [(0, "#A8C860", None), (1, "#6E9A3C", None)])
        + _lin(p+"pond", [(0, "#BDE0E8", None), (1, "#5FA0B6", None)])
        + _lin(p+"sill", [(0, "#B0885A", None), (.3, "#8A6A40", None), (1, "#3C2E1C", None)])
        + _lin(p+"curt", [(0, "#8DB27A", None), (1, "#5E8752", None)])
    )
    grass = "".join(f'<path d="M{x} 232 l2 -14 l3 14z"/>' for x in range(280, 940, 22))
    reeds = "".join(f'<path d="M{x} 226 v-30" stroke="#5E8752" stroke-width="2"/><ellipse cx="{x}" cy="{200}" rx="2.5" ry="7" fill="#7A5A3A"/>' for x in (520, 532, 548))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}room)"/>
<rect x="270" y="30" width="660" height="220" fill="url(#{p}sky)"/>
<circle cx="380" cy="120" r="120" fill="url(#{p}sun)"/><circle cx="380" cy="120" r="30" fill="#FFF6D0"/>
<g fill="#FFFFFF" opacity=".7"><ellipse cx="640" cy="70" rx="80" ry="9"/><ellipse cx="820" cy="100" rx="60" ry="7"/></g>
<path d="M270 200 Q400 176 520 190 T760 186 T930 194 V250 H270z" fill="#7FA95A"/>
<path d="M270 214 Q500 200 930 212 V250 H270z" fill="url(#{p}prairie)"/>
<ellipse cx="600" cy="232" rx="160" ry="18" fill="url(#{p}pond)"/><g fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".6"><path d="M520 230 h40 M600 236 h60 M640 226 h30"/></g>
<ellipse cx="560" cy="234" rx="12" ry="4" fill="#5E8752"/><ellipse cx="660" cy="238" rx="10" ry="3.5" fill="#5E8752"/>
{reeds}
<g fill="#7A9A4A">{grass}</g>
<path d="M846 250 v-100 M846 172 l-40 -26 M846 160 l34 -22" stroke="#5A3E2A" stroke-width="7" fill="none" stroke-linecap="round"/><g fill="#4E6B34"><circle cx="850" cy="110" r="46"/><circle cx="812" cy="132" r="30"/><circle cx="892" cy="128" r="32"/><circle cx="840" cy="84" r="28"/></g><g fill="#6A8C48"><circle cx="836" cy="100" r="18"/><circle cx="880" cy="120" r="14"/></g>
<path d="M800 154 q4 -14 14 -18 h28 q10 4 14 18 q-28 8 -56 0z" fill="#8A6A40"/><path d="M804 148 q24 10 48 0" stroke="#5A3E2A" stroke-width="1.5" fill="none"/><g fill="#BFE0E8"><ellipse cx="820" cy="142" rx="5" ry="6"/><ellipse cx="832" cy="142" rx="5" ry="6"/><ellipse cx="844" cy="142" rx="5" ry="6"/></g>
<g fill="#3A2A1A"><ellipse cx="884" cy="140" rx="10" ry="7"/><circle cx="893" cy="134" r="6"/><path d="M898 134 l8 2 l-8 2z"/><path d="M876 142 l-10 6 l6 -8z"/></g>
<g fill="#7A9A4A" opacity=".8"><path d="M300 170 q-14 -30 0 -60 q14 30 0 60z"/><path d="M330 174 q-10 -24 0 -48 q10 24 0 48z"/></g>
<g fill="#5E8752"><rect x="262" y="22" width="676" height="10"/><rect x="262" y="22" width="10" height="230"/><rect x="928" y="22" width="10" height="230"/><rect x="596" y="22" width="8" height="230"/><rect x="262" y="132" width="676" height="6"/></g>
<rect x="240" y="250" width="720" height="24" fill="url(#{p}sill)"/><rect x="240" y="250" width="720" height="4" fill="#D6B586"/>
<path d="M180 20 h100 v220 q-30 -20 -50 -40 q-6 20 -50 40z" fill="url(#{p}curt)"/><path d="M920 20 h100 v220 q-44 -20 -50 -40 q-20 20 -50 40z" fill="url(#{p}curt)"/>
<path d="M360 196 h56 l-6 56 h-44z" fill="#F4E9D2"/><path d="M360 196 h56 v8 h-56z" fill="#E4573D"/><path d="M366 236 h44 l-2 16 h-40z" fill="#5A4030"/>
<path d="M388 236 q-4 -30 8 -52 q4 -14 -6 -24" stroke="#5E9A3E" stroke-width="3.5" fill="none"/>
<g fill="#7CBF4E"><path d="M390 160 q-24 -6 -30 -30 q26 2 30 30z"/><path d="M392 158 q22 -10 34 -30 q-4 28 -34 30z"/><path d="M393 184 q-16 -4 -20 -18 q16 2 20 18z"/></g>
<path d="M386 220 q-6 -2 -8 6" stroke="#E8DCA8" stroke-width="2" fill="none"/>
<path d="M470 204 h40 v48 h-40z" fill="#DCE8F4" opacity=".55"/><rect x="474" y="200" width="32" height="6" fill="#8A6A40"/><path d="M474 214 h32 v36 h-32z" fill="#E8E0C8" opacity=".75"/><ellipse cx="490" cy="236" rx="6" ry="4" fill="#7A5A3A"/><path d="M490 234 q6 -10 2 -18" stroke="#9AC06A" stroke-width="2" fill="none"/>
<g transform="translate(760 176)"><path d="M0 0 q-30 -34 -10 -46 q18 -6 12 40z" fill="#F0923A"/><path d="M0 0 q30 -34 10 -46 q-18 -6 -12 40z" fill="#F0923A"/><path d="M0 0 q-26 10 -10 18 q10 2 12 -16z M0 0 q26 10 10 18 q-10 2 -12 -16z" fill="#F0923A"/><path d="M0 -8 v18" stroke="#2A1A10" stroke-width="3"/><path d="M-4 -30 q-6 -10 -12 -16 M4 -30 q6 -10 12 -16" stroke="#2A1A10" stroke-width="1.5" fill="none"/></g>
<path d="M0 274 H1200 V420 H0z" fill="#8A7050"/><path d="M0 274 H1200 V420 H0z" fill="url(#{p}sill)" opacity=".85"/>
'''
    return _wrap(3, body, defs)


# ───────────────────────── 4  Earth, Sky and Weather: backyard in spring ─────────────────────────
def _b4():
    p = "sb4-"
    defs = (
        _lin(p+"sky", [(0, "#6FA8E0", None), (.5, "#B6DAF3", None), (1, "#E6F1E2", None)])
        + _rad(p+"sun", [(0, "#FFF7CC", 1), (.3, "#FFE27A", .65), (1, "#FFE27A", 0)])
        + _lin(p+"grass", [(0, "#8CC24E", None), (1, "#4E8A2E", None)])
        + _lin(p+"fg", [(0, "#3C6A26", None), (1, "#1F3A16", None)])
        + _lin(p+"puddle", [(0, "#DDEFF8", None), (1, "#7FB0DC", None)])
        + _lin(p+"shed", [(0, "#B5533E", None), (1, "#7A3428", None)])
    )
    rb = ["#E4573D", "#F2A23A", "#F5D94A", "#7DC15A", "#4F9BD8", "#6C5CB8"]
    rainbow = "".join(f'<path d="M{1180-r} 360 A{r} {r} 0 0 1 1180 {360-r}" stroke="{c}" stroke-width="8"/>' for r, c in zip(range(300, 246, -9), rb))
    pickets = "".join(f'<path d="M{x} 300 v-40 l6 -8 l6 8 v40z"/>' for x in range(0, 1200, 20))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="none" opacity=".55">{rainbow}</g>
<circle cx="180" cy="120" r="130" fill="url(#{p}sun)"/><circle cx="180" cy="120" r="36" fill="#FFF7CC"/>
<circle cx="900" cy="80" r="22" fill="#FFFFFF" opacity=".5"/><circle cx="908" cy="76" r="18" fill="#B6DAF3" opacity=".9"/>
<g fill="#FFFFFF" opacity=".8"><ellipse cx="480" cy="90" rx="90" ry="14"/><ellipse cx="520" cy="80" rx="50" ry="20"/><ellipse cx="760" cy="130" rx="70" ry="10"/></g>
<path d="M0 262 Q150 250 300 258 T600 254 T900 258 T1200 252 V320 H0z" fill="#7FAF6A"/>
<path d="M326 300 v-70 l-20 -26 M326 250 l22 -26" stroke="#5A3E2A" stroke-width="8" fill="none" stroke-linecap="round"/><g fill="#E9A8C4"><circle cx="330" cy="196" r="46"/><circle cx="290" cy="222" r="34"/><circle cx="376" cy="224" r="36"/><circle cx="340" cy="240" r="26"/></g><g fill="#F6CFDF"><circle cx="316" cy="182" r="14"/><circle cx="360" cy="212" r="10"/></g>
<g fill="url(#{p}shed)"><rect x="740" y="210" width="170" height="90"/></g><path d="M728 212 L825 150 L922 212z" fill="#5A3E2A"/><rect x="800" y="250" width="34" height="50" fill="#4A2E1E"/>
<g stroke="#3A3A3A" stroke-width="3" fill="none"><path d="M825 150 v-50"/><path d="M800 118 h50 M825 93 v50"/></g>
<g fill="#3A3A3A"><path d="M800 118 l-8 -5 v10z M850 118 l8 -5 v10z M825 93 l-5 -8 h10z M825 143 l-5 8 h10z"/><path d="M786 104 h40 l12 -6 v12 l-12 -6z" transform="rotate(-18 806 104)"/></g>
<g fill="#F5F1E6">{pickets}</g><path d="M0 270 H1200 v6 H0z M0 292 H1200 v6 H0z" fill="#E4DFD0"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}grass)"/>
<g fill="#5A3E2A"><rect x="620" y="200" width="6" height="100"/></g><path d="M604 210 h38 v52 h-38z" fill="#DCE8F4" opacity=".55"/><path d="M606 236 h34 v26 h-34z" fill="#5FA0DC" opacity=".8"/><g stroke="#3A3A3A" stroke-width="1.5"><path d="M604 220 h8 M604 230 h8 M604 240 h8 M604 250 h8"/></g><path d="M600 206 h46 v6 h-46z" fill="#3A3A3A"/>
<ellipse cx="400" cy="342" rx="140" ry="18" fill="url(#{p}puddle)"/><ellipse cx="360" cy="342" rx="30" ry="6" fill="#FFF7CC" opacity=".8"/>
<ellipse cx="900" cy="352" rx="110" ry="14" fill="url(#{p}puddle)"/><g fill="none" stroke-width="2.5" opacity=".5"><path d="M820 350 q80 -8 160 0" stroke="#E4573D"/><path d="M826 354 q74 -8 150 0" stroke="#F5D94A"/><path d="M834 358 q66 -8 136 0" stroke="#4F9BD8"/></g>
<circle cx="948" cy="348" r="10" fill="#FFFFFF" opacity=".45"/>
<path d="M0 384 Q300 372 600 382 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
<g fill="#F5D94A"><circle cx="120" cy="330" r="4"/><circle cx="150" cy="322" r="4"/><circle cx="680" cy="330" r="4"/><circle cx="1120" cy="326" r="4"/></g>
'''
    return _wrap(4, body, defs)


# ───────────────────────── 5  Forces, Motion and Energy (3-5): workshop table ─────────────────────────
def _b5():
    p = "sb5-"
    defs = (
        _lin(p+"wall", [(0, "#3A4A66", None), (1, "#2A3648", None)])
        + _lin(p+"peg", [(0, "#C9974A", None), (1, "#A87A3A", None)])
        + f'<pattern id="{p}holes" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="2.2" fill="#6A4A20" opacity=".6"/></pattern>'
        + _lin(p+"table", [(0, "#9A7446", None), (.12, "#6E5030", None), (1, "#2E2114", None)])
        + _rad(p+"glow", [(0, "#FFF4C8", 1), (.3, "#FFD46A", .55), (1, "#FFD46A", 0)])
        + _lin(p+"tube", [(0, "#D9B97C", None), (1, "#A88650", None)])
    )
    def tube(x, y, L, ang):
        return (f'<g transform="translate({x} {y}) rotate({ang})"><rect x="0" y="-11" width="{L}" height="22" rx="3" fill="url(#{p}tube)"/>'
                f'<ellipse cx="{L}" cy="0" rx="4" ry="11" fill="#6E5030"/></g>')
    clips = "".join(f'<rect x="{x}" y="{y}" width="8" height="18" rx="4" fill="none" stroke="#C9CCD2" stroke-width="2"/>' for x, y in ((706, 150), (710, 166), (704, 182), (708, 198), (766, 150), (770, 166), (764, 182), (768, 198), (772, 214)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="70" y="20" width="560" height="220" fill="url(#{p}peg)"/><rect x="70" y="20" width="560" height="220" fill="url(#{p}holes)"/>
<g fill="none" stroke="#2A2118" stroke-width="5" stroke-linecap="round"><path d="M520 60 v70"/><path d="M580 50 v80"/></g><g fill="#2A2118"><path d="M504 56 h32 v14 h-32z"/><path d="M570 44 q10 -14 20 0 v10 q-10 8 -20 0z"/><rect x="574" y="128" width="12" height="6"/></g>
<path d="M0 250 H1200 V420 H0z" fill="url(#{p}table)"/><path d="M0 250 H1200 v8 H0z" fill="#B58A54"/>
<g fill="#B08A5A"><rect x="110" y="120" width="70" height="130"/><rect x="250" y="170" width="60" height="80"/><rect x="400" y="200" width="50" height="50"/></g><g fill="#8A6A3E"><rect x="110" y="120" width="70" height="8"/><rect x="250" y="170" width="60" height="8"/></g>
{tube(120, 100, 190, 18)}{tube(290, 176, 150, -22)}{tube(410, 120, 170, 24)}{tube(560, 200, 110, 30)}
<g fill="#3F8FD8"><circle cx="150" cy="96" r="7"/><circle cx="330" cy="164" r="7"/><circle cx="470" cy="136" r="7"/><circle cx="590" cy="194" r="7"/><circle cx="660" cy="240" r="7"/></g><g fill="#FFFFFF" opacity=".7"><circle cx="148" cy="94" r="2"/><circle cx="328" cy="162" r="2"/><circle cx="468" cy="134" r="2"/><circle cx="588" cy="192" r="2"/><circle cx="658" cy="238" r="2"/></g>
<path d="M660 226 q10 -30 40 -40" stroke="#FFFFFF" stroke-width="1.5" fill="none" opacity=".4"/>
<path d="M700 150 v-40 q0 -50 40 -50 q40 0 40 50 v40 h-20 v-40 q0 -30 -20 -30 q-20 0 -20 30 v40z" fill="#D9382E"/><path d="M700 150 v-18 h20 v18z M760 150 v-18 h20 v18z" fill="#C9CCD2"/><path d="M730 44 v52" stroke="#7A5A5A" stroke-width="1" opacity=".3"/>
<path d="M740 60 v-40" stroke="#2A2118" stroke-width="3"/><path d="M736 20 h8" stroke="#2A2118" stroke-width="3"/>
{clips}
<circle cx="1040" cy="150" r="90" fill="url(#{p}glow)"/>
<g fill="#FFF4C8"><path d="M1040 108 q-30 0 -30 30 q0 22 18 34 v10 h24 v-10 q18 -12 18 -34 q0 -30 -30 -30z"/></g><rect x="1028" y="182" width="24" height="16" fill="#5A5E68"/><g stroke="#5A5E68" stroke-width="2" fill="none"><path d="M1028 188 h24 M1028 194 h24"/></g><path d="M1034 172 l4 -14 l4 10 l4 -10 l4 14" stroke="#E86A2A" stroke-width="1.6" fill="none"/>
<rect x="1020" y="198" width="40" height="52" fill="#3A3E4A"/>
<g fill="#2A2118"><rect x="860" y="216" width="90" height="34" rx="4"/><rect x="950" y="226" width="8" height="14"/></g><rect x="866" y="222" width="34" height="22" fill="#D9382E"/><rect x="900" y="222" width="44" height="22" fill="#2E2114"/><path d="M866 222 h78 v6 h-78z" fill="#E4C070"/>
<g fill="none" stroke="#D9382E" stroke-width="3"><path d="M958 232 q40 0 62 -12 v-22 h6"/></g><g fill="none" stroke="#2A2118" stroke-width="3"><path d="M856 232 q-30 0 -30 -40 q0 -70 120 -80 q60 -4 60 40 q0 30 24 46"/></g>
<g fill="#2A2118"><circle cx="1030" cy="232" r="4"/><path d="M1030 232 l24 -14" stroke="#2A2118" stroke-width="3"/><circle cx="1058" cy="232" r="4"/></g>
<path d="M0 372 H1200 V420 H0z" fill="#1E160C" opacity=".55"/>
'''
    return _wrap(5, body, defs)


# ───────────────────────── 6  Matter and Waves: kitchen science bench ─────────────────────────
def _b6():
    p = "sb6-"
    defs = (
        _lin(p+"wall", [(0, "#F7FAF9", None), (1, "#E4EEEC", None)])
        + f'<pattern id="{p}tile" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="none" stroke="#CFDEDC" stroke-width="2"/></pattern>'
        + _lin(p+"cab", [(0, "#2A8C8A", None), (.06, "#1F6E6C", None), (1, "#0F3A3B", None)])
        + _lin(p+"water", [(0, "#BFE6EA", .9), (1, "#7FC4CE", .95)])
        + _rad(p+"balloon", [(0, "#FF9A82", 1), (.6, "#F26A4F", 1), (1, "#C94A34", 1)], .35, .3, .7)
    )
    pts = []
    for i in range(0, 481, 8):
        x = 700 + i
        y = 150 + 46 * math.sin(i / 480 * 2 * math.pi * 2.5)
        pts.append(f"{x} {y:.0f}")
    rope = "M" + " L".join(pts)
    sugar = "".join(f'<circle cx="{x}" cy="{y}" r="1.8"/>' for x, y in ((612, 196), (624, 210), (606, 222), (630, 232), (616, 244), (600, 238), (626, 250), (610, 258)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/><rect width="{W}" height="262" fill="url(#{p}tile)"/>
<rect x="0" y="40" width="1200" height="6" fill="#2A8C8A" opacity=".5"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}cab)"/><rect y="262" width="1200" height="14" fill="#3AA39F"/>
<g fill="none" stroke="#0F3A3B" stroke-width="2" opacity=".5"><path d="M0 300 H1200 M0 380 H1200"/></g><g fill="#7FC4CE" opacity=".5"><rect x="380" y="330" width="60" height="6" rx="3"/><rect x="760" y="330" width="60" height="6" rx="3"/></g>
<g fill="#D9E3E2"><path d="M160 262 v-22 q0 -10 10 -10 h120 q10 0 10 10 v22z"/><rect x="150" y="228" width="160" height="8" rx="4" fill="#B8C6C4"/></g><circle cx="230" cy="248" r="10" fill="#F7FAF9"/><path d="M230 248 l4 -6" stroke="#F26A4F" stroke-width="2"/>
<ellipse cx="230" cy="176" rx="40" ry="50" fill="url(#{p}balloon)"/><path d="M224 224 l6 -4 l6 4 l-6 4z" fill="#C94A34"/><path d="M230 228 q-8 4 -6 10 q4 -6 8 -10" stroke="#C94A34" stroke-width="1.5" fill="none"/><ellipse cx="216" cy="150" rx="8" ry="14" fill="#FFFFFF" opacity=".35"/>
<path d="M400 168 h60 l-4 94 h-52z" fill="#EAF4F5" opacity=".7" stroke="#B8C6C4" stroke-width="2"/><path d="M403 200 h54 l-3 62 h-48z" fill="url(#{p}water)"/>
<path d="M448 108 L438 200" stroke="#F26A4F" stroke-width="7" stroke-linecap="round"/><path d="M448 108 L438 200" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="10 10" opacity=".8"/>
<path d="M428 202 L418 258" stroke="#F26A4F" stroke-width="8" stroke-linecap="round"/><path d="M428 202 L418 258" stroke="#FFFFFF" stroke-width="2.4" stroke-dasharray="10 10" opacity=".8"/>
<path d="M580 174 h64 l-4 88 h-56z" fill="#EAF4F5" opacity=".7" stroke="#B8C6C4" stroke-width="2"/><path d="M583 190 h58 l-3 72 h-52z" fill="url(#{p}water)"/>
<path d="M600 262 L644 150" stroke="#B8C6C4" stroke-width="4" stroke-linecap="round"/><ellipse cx="602" cy="256" rx="7" ry="10" fill="#B8C6C4" transform="rotate(-70 602 256)"/>
<rect x="606" y="232" width="12" height="12" fill="#FFFFFF" transform="rotate(20 612 238)"/><g fill="#FFFFFF" opacity=".9">{sugar}</g>
<g stroke="#F26A4F" stroke-width="6" fill="none" stroke-linecap="round" opacity=".18"><path d="{rope}" transform="translate(0 10)"/></g>
<path d="{rope}" stroke="#F26A4F" stroke-width="6" fill="none" stroke-linecap="round"/>
<rect x="664" y="138" width="40" height="18" rx="6" fill="#2A8C8A"/><rect x="1176" y="140" width="40" height="18" rx="6" fill="#2A8C8A"/>
<g stroke="#2A8C8A" stroke-width="1.5" fill="none" opacity=".45" stroke-dasharray="4 4"><path d="M700 150 H1180"/><path d="M700 104 v92 M796 104 v92 M892 104 v92 M988 104 v92 M1084 104 v92"/></g>
<g stroke="#F26A4F" stroke-width="2" fill="none"><path d="M760 100 l-4 6 l8 0z M760 106 v-10"/></g>
<rect x="990" y="216" width="130" height="46" fill="#F7FAF9" stroke="#B8C6C4" stroke-width="2"/><g fill="#B8C6C4"><rect x="1002" y="228" width="60" height="4"/><rect x="1002" y="240" width="90" height="4"/><rect x="1002" y="250" width="40" height="4"/></g>
'''
    return _wrap(6, body, defs)


# ───────────────────────── 7  Life: Cycles, Traits and Survival: prairie edge ─────────────────────────
def _b7():
    p = "sb7-"
    defs = (
        _lin(p+"sky", [(0, "#F7DFA4", None), (.5, "#FBEBC4", None), (1, "#E7E9C4", None)])
        + _rad(p+"sun", [(0, "#FFF8DC", 1), (.3, "#FFE39A", .55), (1, "#FFE39A", 0)])
        + _lin(p+"far", [(0, "#A9C36A", None), (1, "#7E9E48", None)])
        + _lin(p+"ground", [(0, "#8FAE4C", None), (1, "#5A7A2E", None)])
        + _lin(p+"fg", [(0, "#3F5C24", None), (1, "#233816", None)])
        + _lin(p+"rock", [(0, "#A79E8E", None), (1, "#6A6256", None)])
        + _lin(p+"jar", [(0, "#D6EEF2", .5), (1, "#9DD1DC", .8)])
    )
    grass = "".join(f'<path d="M{x} 300 q{3-(x%3)*3} -20 {(x%5)-2} -34"/>' for x in range(0, 1200, 17))
    rings = "".join(f'<ellipse cx="960" cy="238" rx="{r}" ry="{r*.42:.0f}" fill="none" stroke="#7A5A3A" stroke-width="1.5"/>' for r in (10, 20, 30, 40))
    frond = "".join(f'<path d="M{760+i*7} {306-i*7} l-{10+i} -3 M{760+i*7} {306-i*7} l3 -{10+i}" stroke="#4A4238" stroke-width="1.6"/>' for i in range(7))
    tads = "".join(f'<path d="M{x} {y} q6 -4 8 0 q-2 4 -8 0z M{x+8} {y} q10 -6 22 -2 q-10 8 -22 2z"/>' for x, y in ((548, 200), (566, 224), (540, 240), (578, 250), (556, 268)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="640" cy="120" r="140" fill="url(#{p}sun)"/><circle cx="640" cy="120" r="32" fill="#FFF8DC"/>
<g fill="#FFFFFF" opacity=".55"><ellipse cx="200" cy="80" rx="120" ry="10"/><ellipse cx="960" cy="60" rx="140" ry="10"/></g>
<path d="M0 250 Q300 226 600 246 T1200 236 V320 H0z" fill="url(#{p}far)"/>
<g fill="#7E9E48"><ellipse cx="80" cy="238" rx="50" ry="26"/><ellipse cx="1120" cy="232" rx="60" ry="30"/><ellipse cx="1040" cy="242" rx="40" ry="18"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}ground)"/>
<path d="M888 300 h140 q-20 -60 -70 -60 q-50 0 -70 60z" fill="#8A6A48"/><ellipse cx="960" cy="238" rx="66" ry="28" fill="#C9A878"/>{rings}
<path d="M1070 300 v-110" stroke="#5A3E2A" stroke-width="5" fill="none"/><path d="M1070 236 l-24 -14 M1070 214 l22 -16" stroke="#5A3E2A" stroke-width="3" fill="none"/>
<g fill="#6DA646"><path d="M1046 222 q-16 -4 -30 -20 q4 -14 22 -6 q10 8 8 26z"/><path d="M1092 198 q10 -18 30 -20 q6 14 -8 24 q-12 6 -22 -4z"/><path d="M1070 190 q-12 -14 -6 -30 q14 4 14 22 q-2 8 -8 8z"/><path d="M1074 168 q10 -10 24 -6 q-2 14 -16 16z"/></g>
<path d="M700 300 q10 -50 60 -56 q60 -4 80 56z" fill="url(#{p}rock)"/><g stroke="#4A4238" stroke-width="2.2" fill="none"><path d="M760 306 L802 264"/></g>{frond}
<path d="M528 300 v-116 h64 v116z" fill="url(#{p}jar)" stroke="#8AB8C4" stroke-width="2"/><rect x="524" y="180" width="72" height="10" rx="3" fill="#8A6A48"/><rect x="532" y="196" width="56" height="104" fill="#7FBFC8" opacity=".45"/><path d="M532 288 h56 v12 h-56z" fill="#5A7A2E" opacity=".7"/>
<g fill="#1E2A1A">{tads}</g>
<path d="M240 300 v-160 q-4 -20 6 -30" stroke="#5E9A3E" stroke-width="5" fill="none"/>
<g fill="#6DA646"><path d="M240 250 q-40 -6 -60 -34 q34 -10 60 34z"/><path d="M242 250 q40 -10 64 -34 q-30 -8 -64 34z"/><path d="M240 200 q-36 -4 -54 -30 q30 -6 54 30z"/><path d="M243 196 q36 -8 58 -30 q-28 -4 -58 30z"/></g>
<g fill="#E28AAE"><circle cx="252" cy="118" r="20"/><circle cx="232" cy="130" r="14"/><circle cx="270" cy="134" r="14"/></g><g fill="#F4C5D8"><circle cx="248" cy="112" r="5"/><circle cx="260" cy="124" r="5"/><circle cx="238" cy="128" r="4"/></g>
<path d="M296 218 q-2 6 0 12" stroke="#2A2A1A" stroke-width="2" fill="none"/><path d="M290 228 q-14 8 -8 34 q4 12 14 12 q10 0 14 -12 q6 -26 -8 -34z" fill="#8FD0A0"/><path d="M286 238 h24 M285 244 h26" stroke="#E4C060" stroke-width="1.6"/><g fill="#E4C060"><circle cx="288" cy="234" r="1.4"/><circle cx="296" cy="232" r="1.4"/><circle cx="304" cy="234" r="1.4"/></g>
<g transform="translate(380 140) rotate(-15)"><g stroke="#2A1A10" stroke-width="3.5" fill="#F0923A"><ellipse cx="-32" cy="-22" rx="36" ry="17" transform="rotate(-32 -32 -22)"/><ellipse cx="32" cy="-22" rx="36" ry="17" transform="rotate(32 32 -22)"/><ellipse cx="-22" cy="18" rx="24" ry="17" transform="rotate(18 -22 18)"/><ellipse cx="22" cy="18" rx="24" ry="17" transform="rotate(-18 22 18)"/></g><g stroke="#2A1A10" stroke-width="1.6" fill="none"><path d="M-4 -6 L-50 -40 M-4 -4 L-60 -22 M-4 -2 L-44 -8 M4 -6 L50 -40 M4 -4 L60 -22 M4 -2 L44 -8 M-4 8 L-36 32 M-4 10 L-44 14 M4 8 L36 32 M4 10 L44 14"/></g><g fill="#FFF3D6"><circle cx="-58" cy="-44" r="2"/><circle cx="-66" cy="-30" r="2"/><circle cx="58" cy="-44" r="2"/><circle cx="66" cy="-30" r="2"/><circle cx="-42" cy="34" r="1.8"/><circle cx="42" cy="34" r="1.8"/></g><rect x="-4" y="-16" width="8" height="44" rx="4" fill="#2A1A10"/><path d="M-2 -16 q-8 -12 -18 -16 M2 -16 q8 -12 18 -16" stroke="#2A1A10" stroke-width="1.5" fill="none"/></g>
<g fill="none" stroke="#3F5C24" stroke-width="1.6">{grass}</g>
<path d="M0 372 Q300 360 600 370 T1200 364 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(7, body, defs)


# ───────────────────────── 8  Ecosystems and the Flow of Energy: pond edge at dusk ─────────────────────────
def _b8():
    p = "sb8-"
    defs = (
        _lin(p+"sky", [(0, "#2E1F56", None), (.45, "#6B3F78", None), (.78, "#D2775E", None), (1, "#F0B36A", None)])
        + _lin(p+"far", [(0, "#3A2A4E", None), (1, "#221A34", None)])
        + _lin(p+"water", [(0, "#8A4E66", None), (.35, "#4A3A5E", None), (1, "#15201F", None)])
        + _lin(p+"log", [(0, "#4A3626", None), (1, "#1E140C", None)])
        + _lin(p+"fg", [(0, "#12211A", None), (1, "#08110C", None)])
    )
    far = "".join((f'<path d="M{x} 236 q-{6+(x%3)*3} -{30+(x%5)*6} 0 -{60+(x%5)*8} q{6+(x%3)*3} {30+(x%5)*6} 0 {60+(x%5)*8}z"/>' if x % 3 == 0 else f'<ellipse cx="{x}" cy="{212-(x%5)*4}" rx="{22+(x%4)*6}" ry="{18+(x%3)*6}"/>') for x in range(20, 1200, 44))
    def cattails(xs, base, h, col):
        return "".join(f'<path d="M{x} {base} q{(x%3)-1} -{h//2} {(x%5)-2} -{h}" stroke="{col}" stroke-width="2.5" fill="none"/><rect x="{x+(x%5)-6}" y="{base-h-4}" width="8" height="26" rx="4" fill="#4A3020"/><path d="M{x+(x%5)-2} {base-h-4} v-16" stroke="{col}" stroke-width="1.5"/>' for x in xs)
    def dragonfly(x, y, s):
        return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 h52" stroke="#1E2A22" stroke-width="2.2"/><circle cx="-2" cy="0" r="4" fill="#1E2A22"/><circle cx="-6" cy="-2" r="1.6" fill="#35E6E6"/>'
                f'<g fill="#CFE8F0" opacity=".45" stroke="#E8F4F8" stroke-width="1"><ellipse cx="10" cy="-12" rx="22" ry="3.5" transform="rotate(-38 10 -12)"/><ellipse cx="10" cy="12" rx="22" ry="3.5" transform="rotate(38 10 12)"/><ellipse cx="20" cy="-10" rx="18" ry="3" transform="rotate(-24 20 -10)"/><ellipse cx="20" cy="10" rx="18" ry="3" transform="rotate(24 20 10)"/></g></g>')
    fish = "".join(f'<path d="M{x} {y} q14 -8 30 0 q-16 8 -30 0z M{x+30} {y} l10 -6 v12z" fill="#0A1410" opacity=".7"/>' for x, y in ((560, 330), (620, 350), (500, 356)))
    shroom = "".join(f'<path d="M{x} 286 v-12 h6 v12z" fill="#D9C7A8"/><path d="M{x-8} 276 q11 -{h} 22 0z" fill="#C9603A"/>' for x, h in ((1000, 18), (1030, 24), (1052, 14)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#6B3F78" opacity=".5"><ellipse cx="300" cy="70" rx="200" ry="10"/><ellipse cx="900" cy="100" rx="220" ry="12"/></g>
<circle cx="980" cy="60" r="18" fill="#F6EEDC" opacity=".9"/>
<path d="M0 226 H1200 V270 H0z" fill="url(#{p}far)"/><g fill="#2A1F40">{far}</g>
<path d="M0 250 H1200 V420 H0z" fill="url(#{p}water)"/>
<g fill="#F0B36A" opacity=".25"><path d="M480 268 q80 6 160 0 q-80 8 -160 0z"/><path d="M420 292 q120 8 240 0 q-120 10 -240 0z"/></g>
{fish}
<g fill="#151C18"><path d="M300 300 q-6 -50 12 -78 q10 -14 24 -6 q-12 10 -8 30 q6 28 -6 54z"/><path d="M318 218 q-4 -18 8 -30 q10 -8 14 4 q-8 4 -6 14 q2 12 -6 16z"/><circle cx="332" cy="186" r="8"/><path d="M338 186 l30 -4 l-30 -2z"/><path d="M308 302 v40 M318 300 v40" stroke="#151C18" stroke-width="3"/></g>
<path d="M298 300 q22 -14 44 -6 q4 8 -10 12 q-24 4 -34 -6z" fill="#151C18"/>
{cattails((40, 70, 96, 130, 160), 300, 120, "#1E2A22")}{cattails((1100, 1130, 1160, 1190), 300, 110, "#1E2A22")}
<g fill="#1E2A22"><path d="M40 300 q6 -60 -6 -120 q10 60 6 120z"/></g>
<ellipse cx="700" cy="304" rx="56" ry="16" fill="#3E7A3A"/><path d="M700 304 l40 -14 l-4 26z" fill="url(#{p}water)"/>
<g fill="#5E9A3E"><ellipse cx="690" cy="288" rx="24" ry="14"/><circle cx="710" cy="278" r="12"/><path d="M666 298 l-12 8 l6 -12z M714 296 l16 4 l-8 -10z"/></g><g fill="#F4E8A0"><circle cx="716" cy="272" r="4"/><circle cx="706" cy="272" r="4"/></g><g fill="#1E2A22"><circle cx="716" cy="272" r="2"/><circle cx="706" cy="272" r="2"/></g>
{dragonfly(500, 150, 1.1)}{dragonfly(580, 110, .8)}{dragonfly(540, 200, .6)}
<path d="M880 300 q-6 -28 30 -34 h290 v52 h-320z" fill="url(#{p}log)"/><ellipse cx="892" cy="292" rx="12" ry="26" fill="#6E5236"/><ellipse cx="892" cy="292" rx="6" ry="14" fill="none" stroke="#3E2E1E" stroke-width="1.5"/>
{shroom}
<g fill="#F4E8A0" opacity=".9"><circle cx="420" cy="230" r="2"/><circle cx="470" cy="248" r="2"/><circle cx="800" cy="236" r="2"/><circle cx="1040" cy="222" r="2"/><circle cx="640" cy="244" r="2"/></g>
<path d="M0 368 Q300 356 600 366 T1200 360 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(8, body, defs)


# ───────────────────────── 9  Earth, Weather and Space: Illinois farmland ─────────────────────────
def _b9():
    p = "sb9-"
    defs = (
        _lin(p+"sky", [(0, "#3D4A5E", None), (.4, "#7E8E8A", None), (.7, "#B9BC96", None), (1, "#E8C979", None)])
        + _lin(p+"storm", [(0, "#4E5866", None), (.5, "#3A424E", None), (1, "#262C36", None)])
        + _lin(p+"field", [(0, "#B49A56", None), (1, "#6E5E30", None)])
        + _lin(p+"fg", [(0, "#4E4426", None), (1, "#2A2414", None)])
        + _rad(p+"moon", [(0, "#F6F0DA", 1), (.3, "#E8E4CC", .7), (1, "#E8E4CC", 0)])
    )
    rows = "".join(f'<path d="M{x} 300 L{600+(x-600)*3} 420"/>' for x in range(0, 1201, 60))
    rain = "".join(f'<path d="M{x} 206 l-8 62"/>' for x in range(150, 360, 12))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<path d="M270 70 q80 -30 210 -6 q60 12 120 40 q-90 4 -170 8 q-90 6 -160 -2 q-20 -22 0 -40z" fill="#5A6470" opacity=".85"/>
<path d="M126 200 v-44 q-6 -44 44 -40 q6 -52 62 -44 q16 -46 70 -30 q44 -30 84 4 q44 -12 62 32 q34 -4 40 34 v88z" fill="url(#{p}storm)"/>
<path d="M170 116 q6 -40 50 -34 q16 -30 60 -20" stroke="#6A7480" stroke-width="3" fill="none" opacity=".5"/>
<path d="M112 196 h378 q8 6 0 12 h-378 q-8 -6 0 -12z" fill="#22282F"/>
<path d="M340 206 q40 6 80 0 q6 8 -2 14 q-40 4 -78 0 q-6 -6 0 -14z" fill="#1C2128"/>
<g stroke="#4E5866" stroke-width="1.5" opacity=".7" fill="none">{rain}</g>
<path d="M392 204 q-6 30 -2 44 q2 14 -2 22 h14 q-4 -10 0 -24 q6 -16 30 -44z" fill="#2E3540" opacity=".95"/><ellipse cx="396" cy="270" rx="30" ry="6" fill="#8A8060" opacity=".7"/>
<g stroke="#F3E9C4" stroke-width="1.5" fill="none" opacity=".8"><path d="M250 206 l-6 16 l8 -3 l-8 20"/></g>
<g fill="#B9BC96" opacity=".6"><ellipse cx="760" cy="120" rx="180" ry="9"/><ellipse cx="1000" cy="90" rx="160" ry="8"/></g>
<circle cx="1000" cy="210" r="70" fill="url(#{p}moon)"/><circle cx="1000" cy="210" r="24" fill="#F6F0DA"/>
<path d="M0 270 H1200 V300 H0z" fill="#8A8A54"/>
<g fill="#3A3820"><path d="M1090 270 v-30 h30 v30z M1086 240 l19 -12 l19 12z"/><rect x="1130" y="224" width="14" height="46"/><ellipse cx="1137" cy="224" rx="7" ry="3"/><path d="M40 270 q-10 -14 0 -26 q10 12 0 26z M60 270 q-8 -12 0 -22 q8 10 0 22z"/><path d="M880 270 q-6 -10 0 -20 q6 10 0 20z"/></g>
<g stroke="#2A2414" stroke-width="3" fill="none"><path d="M800 300 v-160"/><path d="M800 140 h-24 M800 140 h24"/><path d="M800 196 h30 M800 216 h-30"/></g>
<g fill="#2A2414"><path d="M776 140 q-8 -6 -8 -12 q8 2 8 12z M824 140 q8 -6 8 -12 q-8 2 -8 12z M800 128 q-6 -8 0 -14 q6 6 0 14z"/><path d="M830 190 l14 -3 v12 l-14 -3z"/><rect x="764" y="212" width="12" height="8"/><rect x="780" y="230" width="40" height="26"/><path d="M770 300 h60 l-4 -8 h-52z"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}field)"/>
<g stroke="#6E5E30" stroke-width="2" opacity=".7">{rows}</g>
<path d="M0 296 h1200 v6 H0z" fill="#8A7A44"/>
<path d="M0 384 Q300 376 600 382 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(9, body, defs)


# ───────────────────────── 10  Matter and Its Interactions: chemistry bench ─────────────────────────
def _b10():
    p = "sb10-"
    defs = (
        _lin(p+"wall", [(0, "#3E4654", None), (1, "#2A303A", None)])
        + _lin(p+"bench", [(0, "#1B1F26", None), (.1, "#14171C", None), (1, "#0A0C10", None)])
        + _rad(p+"flame", [(0, "#FFF2B0", 1), (.4, "#FF9A3A", .6), (1, "#FF9A3A", 0)])
        + f'<pattern id="{p}cells" width="24" height="26" patternUnits="userSpaceOnUse"><rect width="24" height="26" fill="none" stroke="#E6E8EA" stroke-width="2"/></pattern>'
    )
    # periodic-table silhouette: colored bands per row (no text)
    ox, oy, cw, ch = 654, 60, 21, 23
    def blk(c0, c1, r, col):
        return f'<rect x="{ox+c0*cw}" y="{oy+r*ch}" width="{(c1-c0+1)*cw}" height="{ch}" fill="{col}"/>'
    A, AE, TM, PM, MT, NM, HA, NG, LA = "#E86A5A", "#F2A23A", "#F5D94A", "#8FBF6A", "#5AB8A8", "#4F9BD8", "#8A6CD0", "#C46BB0", "#A8B0B8"
    table = (blk(0, 0, 0, NM) + blk(17, 17, 0, NG)
             + blk(0, 0, 1, A) + blk(1, 1, 1, AE) + blk(12, 12, 1, PM) + blk(13, 15, 1, NM) + blk(16, 16, 1, HA) + blk(17, 17, 1, NG)
             + blk(0, 0, 2, A) + blk(1, 1, 2, AE) + blk(12, 13, 2, PM) + blk(14, 15, 2, NM) + blk(16, 16, 2, HA) + blk(17, 17, 2, NG)
             + "".join(blk(0, 0, r, A) + blk(1, 1, r, AE) + blk(2, 11, r, TM) + blk(12, 13 + (r - 3) // 2, r, PM) + blk(14 + (r - 3) // 2, 15, r, MT if r < 5 else PM) + blk(16, 16, r, HA if r < 6 else PM) + blk(17, 17, r, NG) for r in (3, 4, 5, 6))
             + blk(2, 16, 7, LA) + blk(2, 16, 8, LA))
    bubbles = "".join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x, y, r in ((560, 232, 4), (572, 214, 3), (552, 200, 5), (566, 184, 3), (556, 168, 4), (548, 150, 2.5), (570, 140, 3)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="640" y="46" width="406" height="236" rx="3" fill="#F2F3F4"/><rect x="640" y="46" width="406" height="236" rx="3" fill="none" stroke="#1B1F26" stroke-width="4"/>
<g opacity=".92">{table}</g><rect x="{ox}" y="{oy}" width="{18*cw}" height="{9*ch}" fill="url(#{p}cells)"/><rect x="{ox}" y="{oy+7*ch}" width="{18*cw}" height="6" fill="#F2F3F4"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}bench)"/><rect y="262" width="1200" height="8" fill="#2E343C"/>
<g fill="#5A616C"><rect x="176" y="240" width="60" height="22" rx="3"/><rect x="200" y="176" width="12" height="66"/><rect x="194" y="170" width="24" height="10"/><path d="M212 220 h16 l4 -6" stroke="#5A616C" stroke-width="3" fill="none"/></g>
<circle cx="206" cy="150" r="60" fill="url(#{p}flame)"/><path d="M206 170 q-16 -20 -4 -52 q6 -12 10 -26 q6 30 12 44 q10 28 -18 34z" fill="#FF9A3A"/><path d="M206 170 q-8 -12 -2 -30 q4 -8 4 -16 q4 16 8 26 q4 16 -10 20z" fill="#4FA0E8"/>
<path d="M330 180 h70 v74 q0 8 -8 8 h-54 q-8 0 -8 -8z" fill="#DDE6EE" opacity=".35" stroke="#B8C6D2" stroke-width="2"/><path d="M332 212 h66 v42 q0 6 -6 6 h-54 q-6 0 -6 -6z" fill="#4F9BD8" opacity=".85"/><g stroke="#DDE6EE" stroke-width="1.5" opacity=".8"><path d="M340 194 h12 M340 206 h8 M340 218 h12 M340 230 h8 M340 242 h12"/></g>
<path d="M440 150 h50 v104 q0 8 -8 8 h-34 q-8 0 -8 -8z" fill="#DDE6EE" opacity=".35" stroke="#B8C6D2" stroke-width="2"/><path d="M442 200 h46 v54 q0 6 -6 6 h-34 q-6 0 -6 -6z" fill="#7DC15A" opacity=".85"/><g stroke="#DDE6EE" stroke-width="1.5" opacity=".8"><path d="M448 164 h10 M448 178 h6 M448 192 h10 M448 206 h6 M448 220 h10 M448 234 h6"/></g>
<path d="M546 130 h32 v46 l28 70 q4 10 -6 10 h-76 q-10 0 -6 -10 l28 -70z" fill="#DDE6EE" opacity=".4" stroke="#B8C6D2" stroke-width="2"/><path d="M536 210 l10 -20 h32 l14 34 q2 10 -6 10 h-64 q-8 0 -6 -10z" fill="#8A6CD0" opacity=".85"/><g fill="#F2F3F4" opacity=".8">{bubbles}</g><rect x="548" y="120" width="28" height="12" rx="3" fill="#2E343C"/>
<g stroke="#B8C6D2" stroke-width="4"><path d="M1110 210 L1066 236 M1110 210 L1156 236 M1110 210 L1088 170 M1110 210 L1140 176"/></g>
<g><circle cx="1110" cy="210" r="18" fill="#2A2E36"/><circle cx="1066" cy="236" r="12" fill="#F2F3F4"/><circle cx="1156" cy="236" r="12" fill="#F2F3F4"/><circle cx="1088" cy="170" r="12" fill="#F2F3F4"/><circle cx="1140" cy="176" r="14" fill="#E86A5A"/></g>
<g fill="#F2F3F4" opacity=".35"><circle cx="1104" cy="204" r="5"/><circle cx="1062" cy="232" r="3"/><circle cx="1136" cy="172" r="4"/></g>
<rect x="1050" y="250" width="120" height="12" rx="2" fill="#5A616C"/>
<g fill="#F2F3F4" opacity=".08"><ellipse cx="360" cy="290" rx="80" ry="8"/><ellipse cx="560" cy="290" rx="60" ry="6"/><ellipse cx="1110" cy="288" rx="90" ry="8"/></g>
<path d="M0 380 H1200 V420 H0z" fill="#06080A" opacity=".5"/>
'''
    return _wrap(10, body, defs)


# ───────────────────────── 11  Forces, Motion and Energy (6-8): roller coaster hill ─────────────────────────
def _b11():
    p = "sb11-"
    defs = (
        _lin(p+"sky", [(0, "#2F4F9A", None), (.4, "#6FA6E0", None), (.72, "#F2C273", None), (1, "#F0805A", None)])
        + _rad(p+"sun", [(0, "#FFF2C0", 1), (.3, "#FFC66A", .6), (1, "#FFC66A", 0)])
        + _lin(p+"far", [(0, "#4A3F6A", None), (1, "#2E2848", None)])
        + _lin(p+"fg", [(0, "#1E2A2A", None), (1, "#0E1414", None)])
    )
    track = "M-20 300 Q140 300 260 220 Q380 140 470 70 Q520 40 570 70 Q640 120 700 240 Q740 300 820 300 Q900 300 960 260 Q1010 230 1060 260 Q1100 290 1220 300"
    def bez(ptsq, t):
        return ptsq
    # supports: sample along a numeric approximation of the track for post positions
    def track_y(x):
        # piecewise quadratic estimation used only for support geometry
        segs = [((-20, 300), (140, 300), (260, 220)), ((260, 220), (380, 140), (470, 70)), ((470, 70), (520, 40), (570, 70)), ((570, 70), (640, 120), (700, 240)), ((700, 240), (740, 300), (820, 300)), ((820, 300), (900, 300), (960, 260)), ((960, 260), (1010, 230), (1060, 260)), ((1060, 260), (1100, 290), (1220, 300))]
        for p0, p1, p2 in segs:
            if p0[0] <= x <= p2[0]:
                lo, hi = 0.0, 1.0
                for _ in range(24):
                    t = (lo + hi) / 2
                    bx = (1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0]
                    if bx < x: lo = t
                    else: hi = t
                t = (lo + hi) / 2
                return (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1]
        return 300
    posts, braces = [], []
    xs = list(range(180, 1100, 46))
    for x in xs:
        y = track_y(x) + 8
        if y < 292:
            posts.append(f'M{x} {y:.0f} V300')
    for a, b in zip(xs, xs[1:]):
        ya, yb = track_y(a) + 8, track_y(b) + 8
        if ya < 292 and yb < 292:
            braces.append(f'M{a} {ya:.0f} L{b} {min(300, yb+40):.0f} M{b} {yb:.0f} L{a} {min(300, ya+40):.0f}')
            braces.append(f'M{a} {min(300, ya+70):.0f} L{b} {min(300, yb+70):.0f}')
    fw = "".join(f'<path d="M1010 200 l{60*math.cos(k*math.pi/6):.0f} {60*math.sin(k*math.pi/6):.0f}"/>' for k in range(12))
    cabs = "".join(f'<rect x="{1010+60*math.cos(k*math.pi/6)-5:.0f}" y="{200+60*math.sin(k*math.pi/6)-3:.0f}" width="10" height="9" rx="2"/>' for k in range(12))
    cars = "".join(f'<g transform="translate({x} {y}) rotate({r})"><rect x="-22" y="-14" width="44" height="16" rx="4" fill="#F5D94A"/><circle cx="-10" cy="-18" r="5" fill="#2A2A2A"/><circle cx="8" cy="-18" r="5" fill="#2A2A2A"/></g>' for x, y, r in ((470, 66, -36), (512, 46, -8), (556, 60, 30)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="200" cy="250" r="170" fill="url(#{p}sun)"/><circle cx="200" cy="250" r="40" fill="#FFF2C0"/>
<g fill="#FFFFFF" opacity=".5"><ellipse cx="700" cy="70" rx="160" ry="10"/><ellipse cx="900" cy="120" rx="120" ry="8"/></g>
<g fill="#F2C273" opacity=".4"><ellipse cx="300" cy="150" rx="140" ry="8"/></g>
<g stroke="#4A3F6A" stroke-width="3" fill="none"><circle cx="1010" cy="200" r="60"/><circle cx="1010" cy="200" r="50"/>{fw}<path d="M1010 200 L980 300 M1010 200 L1040 300"/></g><g fill="#4A3F6A">{cabs}<circle cx="1010" cy="200" r="6"/></g>
<path d="M0 282 Q200 262 400 276 T800 270 T1200 278 V330 H0z" fill="url(#{p}far)"/>
<g stroke="#8A2B2B" stroke-width="2.5" fill="none" opacity=".9"><path d="{"".join(braces)}"/></g>
<g stroke="#A83232" stroke-width="4" fill="none"><path d="{"".join(posts)}"/></g>
<path d="{track}" stroke="#C8363A" stroke-width="7" fill="none"/><path d="{track}" stroke="#C8363A" stroke-width="5" fill="none" transform="translate(0 9)"/>
<path d="{track}" stroke="#F0805A" stroke-width="1.5" fill="none" stroke-dasharray="3 9" opacity=".8"/>
{cars}
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}fg)"/>
<g fill="#0E1414"><ellipse cx="120" cy="300" rx="60" ry="30"/><ellipse cx="260" cy="304" rx="50" ry="22"/><ellipse cx="1120" cy="300" rx="70" ry="28"/><ellipse cx="900" cy="304" rx="40" ry="18"/></g>
<g fill="#F5D94A" opacity=".8"><circle cx="980" cy="280" r="2"/><circle cx="1000" cy="286" r="2"/><circle cx="1020" cy="286" r="2"/><circle cx="1040" cy="280" r="2"/></g>
'''
    return _wrap(11, body, defs)


# ───────────────────────── 12  Waves and Information: turntable, tower, telescope ─────────────────────────
def _b12():
    p = "sb12-"
    defs = (
        _lin(p+"sky", [(0, "#070A2A", None), (.6, "#141A54", None), (1, "#242C78", None)])
        + _lin(p+"hill", [(0, "#151A48", None), (1, "#0A0D2A", None)])
        + _rad(p+"vinyl", [(0, "#2A2A3E", None), (.2, "#15151F", None), (1, "#0A0A12", None)])
        + _rad(p+"sheen", [(0, "#35E6E6", 0), (.7, "#35E6E6", 0), (.86, "#35E6E6", .18), (1, "#35E6E6", 0)])
    )
    grooves = "".join(f'<circle cx="250" cy="300" r="{r}"/>' for r in range(70, 236, 9))
    waves = "".join(f'<path d="M{380-r*.1:.0f} {200} a{r} {r} 0 0 1 {r*1.2:.0f} {-r*.3:.0f}" stroke-opacity="{.9-0.13*i:.2f}"/>' for i, r in enumerate((60, 100, 140, 180, 220, 260)))
    waves = "".join(f'<path d="M{412+r*math.cos(math.radians(150)):.0f} {212+r*math.sin(math.radians(150)):.0f} A{r} {r} 0 0 1 {412+r*math.cos(math.radians(-60)):.0f} {212+r*math.sin(math.radians(-60)):.0f}" stroke-opacity="{.95-0.14*i:.2f}"/>' for i, r in enumerate((40, 80, 120, 160, 200, 240)))
    tower = "".join(f'<path d="M{1000-w} {y} L{1000+w} {y-28} M{1000+w} {y} L{1000-w} {y-28} M{1000-w} {y} h{2*w}"/>' for y, w in zip(range(262, 90, -28), (26, 23, 20, 17, 14, 11)))
    sig = "".join(f'<path d="M{1000-r*.7:.0f} {80+r*.7:.0f} A{r} {r} 0 0 1 {1000+r*.7:.0f} {80+r*.7:.0f}" stroke-opacity="{.95-0.2*i:.2f}"/>' for i, r in enumerate((26, 48, 70, 92)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(101, 90, 240, "#E8E9F5", ".8", 380, 1200)}
<g fill="#242C78" opacity=".55"><ellipse cx="800" cy="110" rx="160" ry="8"/></g>
<path d="M560 300 Q800 214 1000 240 Q1120 250 1200 232 V420 H560z" fill="url(#{p}hill)"/>
<g stroke="#8A8AC8" stroke-width="2" fill="none">{tower}<path d="M974 262 L1000 70 L1026 262"/><path d="M1000 70 v-22"/></g><circle cx="1000" cy="46" r="4" fill="#FF5A5A"/>
<g stroke="#35E6E6" stroke-width="3" fill="none" stroke-linecap="round">{sig}</g>
<g transform="translate(760 246)"><g stroke="#8A8AC8" stroke-width="3" fill="none"><path d="M0 0 L-24 40 M0 0 L20 42 M0 0 v44"/></g><rect x="-10" y="-52" width="20" height="70" rx="4" fill="#2A2E6A" transform="rotate(38 0 0)"/><rect x="-11" y="-56" width="22" height="10" rx="2" fill="#35E6E6" transform="rotate(38 0 0)" opacity=".8"/><circle cx="0" cy="0" r="7" fill="#8A8AC8"/></g>
<path d="M760 214 L640 84" stroke="#35E6E6" stroke-width="1" stroke-dasharray="3 7" opacity=".5"/>
<g fill="none" stroke="#35E6E6" stroke-width="2.5" stroke-linecap="round">{waves}</g>
<rect x="0" y="180" width="560" height="240" rx="8" fill="#1A1E48"/><rect x="0" y="180" width="560" height="8" fill="#2E3478"/>
<circle cx="250" cy="300" r="248" fill="#0A0A12"/><circle cx="250" cy="300" r="240" fill="url(#{p}vinyl)"/>
<g fill="none" stroke="#2C2C40" stroke-width="1.6">{grooves}</g>
<circle cx="250" cy="300" r="240" fill="url(#{p}sheen)"/>
<path d="M250 60 A240 240 0 0 1 452 168" stroke="#35E6E6" stroke-width="1.6" fill="none" opacity=".35"/>
<circle cx="250" cy="300" r="66" fill="#F26A4F"/><circle cx="250" cy="300" r="66" fill="none" stroke="#FFD9C8" stroke-width="2"/><circle cx="250" cy="300" r="6" fill="#DDE"/><circle cx="250" cy="300" r="40" fill="none" stroke="#FFD9C8" stroke-width="1" opacity=".5"/>
<circle cx="520" cy="112" r="20" fill="#2E3478"/><circle cx="520" cy="112" r="10" fill="#8A8AC8"/><circle cx="520" cy="112" r="8" fill="#8A8AC8"/>
<path d="M520 112 L440 190 L412 212" stroke="#B8B8E0" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M520 112 L440 190" stroke="#DADAF4" stroke-width="2" fill="none"/>
<path d="M424 202 l-18 12 l-4 -6 l16 -14z" fill="#35E6E6"/><rect x="536" y="96" width="26" height="12" rx="3" fill="#B8B8E0" transform="rotate(-45 549 102)"/>
<g fill="#35E6E6"><circle cx="412" cy="212" r="3"/></g>
<rect x="470" y="230" width="60" height="14" rx="3" fill="#2E3478"/><rect x="476" y="236" width="14" height="4" fill="#35E6E6"/>
'''
    return _wrap(12, body, defs)


# ───────────────────────── 13  Cells, Bodies and Reproduction: microscope and onion cells ─────────────────────────
def _b13():
    p = "sb13-"
    defs = (
        _lin(p+"wall", [(0, "#0C1A3A", None), (1, "#16305C", None)])
        + _lin(p+"bench", [(0, "#1E5E68", None), (.08, "#164A54", None), (1, "#0A2430", None)])
        + _rad(p+"view", [(0, "#F4F7F0", None), (.85, "#E2EEE8", None), (1, "#C4DCD6", None)])
        + _rad(p+"stain", [(0, "#C64A9A", .0), (.6, "#C64A9A", .12), (1, "#C64A9A", .32)], .4, .35, .7)
        + f'<clipPath id="{p}clip"><circle cx="830" cy="188" r="142"/></clipPath>'
        + _lin(p+"scope", [(0, "#243A6A", None), (1, "#0A1226", None)])
    )
    cells, nuclei = [], []
    x, seed = 0, 17
    for r in range(8):
        y = 30 + r * 40 + (r % 2) * 6
        x = 660 + (r % 2) * 30 - 40
        while x < 1000:
            seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
            w = 56 + seed % 40
            seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
            h = 34 + seed % 8
            cells.append(f'<path d="M{x} {y} q{w//2} -6 {w} 0 q4 {h//2} 0 {h} q-{w//2} 6 -{w} 0 q-4 -{h//2} 0 -{h}z"/>')
            nx, ny = x + w * .35 + seed % 14, y + h * .5 + (seed >> 6) % 8 - 4
            nuclei.append(f'<circle cx="{nx:.0f}" cy="{ny:.0f}" r="5.5"/>')
            x += w
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g fill="#16305C" opacity=".8"><rect x="40" y="30" width="360" height="130" rx="4"/></g><g fill="#3A5A98" opacity=".5"><rect x="60" y="50" width="110" height="24"/><rect x="190" y="50" width="70" height="24"/><rect x="60" y="94" width="150" height="24"/><rect x="230" y="94" width="150" height="24"/></g>
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}bench)"/>
<circle cx="830" cy="188" r="150" fill="#0A1226"/><circle cx="830" cy="188" r="142" fill="url(#{p}view)"/>
<g clip-path="url(#{p}clip)"><g fill="#CFE6DC" stroke="#3E8A8A" stroke-width="3">{"".join(cells)}</g><g fill="#C64A9A" opacity=".85">{"".join(nuclei)}</g><circle cx="830" cy="188" r="142" fill="url(#{p}stain)"/></g>
<circle cx="830" cy="188" r="142" fill="none" stroke="#1E5E68" stroke-width="3"/><path d="M700 120 A142 142 0 0 1 800 50" stroke="#FFFFFF" stroke-width="10" fill="none" opacity=".18" stroke-linecap="round"/>
<path d="M560 240 Q640 200 690 190" stroke="#3E8A8A" stroke-width="1.5" stroke-dasharray="4 6" fill="none" opacity=".6"/>
<g fill="url(#{p}scope)"><path d="M230 280 h170 q6 -14 -6 -18 h-150 q-16 4 -14 18z"/><path d="M340 262 q30 -30 24 -70 q-6 -40 -50 -60 l-14 8 q36 20 40 54 q4 34 -20 60z"/><rect x="250" y="196" width="100" height="12" rx="2"/><rect x="286" y="208" width="30" height="20"/><path d="M270 140 h60 v20 h-60z"/><rect x="288" y="160" width="10" height="20"/><rect x="306" y="160" width="10" height="16"/><rect x="272" y="160" width="10" height="12"/></g>
<g transform="translate(300 128) rotate(-28)"><rect x="-12" y="-80" width="24" height="86" rx="3" fill="url(#{p}scope)"/><rect x="-16" y="-88" width="32" height="12" rx="3" fill="#243A6A"/></g>
<rect x="262" y="190" width="72" height="6" fill="#DDE8F4" opacity=".7"/><rect x="284" y="189" width="28" height="8" fill="#C64A9A" opacity=".7"/>
<circle cx="300" cy="248" r="10" fill="#3E8A8A"/><circle cx="300" cy="248" r="5" fill="#9AE0E0"/>
<circle cx="366" cy="222" r="9" fill="#243A6A"/><circle cx="366" cy="222" r="4" fill="#0A1226"/>
<path d="M470 190 h48 v80 q0 8 -8 8 h-32 q-8 0 -8 -8z" fill="#DDE8F4" opacity=".3" stroke="#9BB4C8" stroke-width="2"/><path d="M472 226 h44 v44 q0 6 -6 6 h-32 q-6 0 -6 -6z" fill="#C64A9A" opacity=".85"/>
<path d="M560 280 l20 -40 h140 l6 40z" fill="#E8EEF0"/><path d="M726 280 l-6 -40 h140 l-8 40z" fill="#F4F7F0"/><path d="M720 240 v40" stroke="#9BB4C8" stroke-width="2"/><g stroke="#9BB4C8" stroke-width="1.5" opacity=".8"><path d="M592 250 h100 M588 260 h100 M584 270 h80"/><path d="M736 250 h100 M734 260 h100 M732 270 h60"/></g>
<circle cx="770" cy="252" r="10" fill="none" stroke="#3E8A8A" stroke-width="1.5"/><circle cx="774" cy="256" r="2" fill="#C64A9A"/>
<path d="M600 232 l70 -8" stroke="#F5D94A" stroke-width="4" stroke-linecap="round"/><path d="M670 224 l8 -1 l-6 4z" fill="#2A2A2A"/>
<g fill="#0A1226" opacity=".45"><ellipse cx="320" cy="292" rx="110" ry="8"/><ellipse cx="830" cy="298" rx="150" ry="10"/><ellipse cx="500" cy="290" rx="40" ry="5"/></g>
<path d="M0 372 H1200 V420 H0z" fill="#06121A" opacity=".55"/>
'''
    return _wrap(13, body, defs)


# ───────────────────────── 14  Ecosystems and Heredity: a rocky lakeshore ─────────────────────────
def _b14():
    p = "sb14-"
    defs = (
        _lin(p+"sky", [(0, "#3E86CC", None), (.55, "#9ACBEA", None), (1, "#D8ECF4", None)])
        + _lin(p+"sea", [(0, "#4FA8B0", None), (.5, "#2C8A8A", None), (1, "#1B5E68", None)])
        + _lin(p+"rock", [(0, "#5A5046", None), (1, "#2C2620", None)])
        + _lin(p+"shore", [(0, "#B08A50", None), (1, "#6A4E2C", None)])
        + _lin(p+"fg", [(0, "#4A3A22", None), (1, "#221A0E", None)])
        + _lin(p+"shell", [(0, "#8A7A48", None), (1, "#4E4224", None)])
    )
    scutes = "".join(f'<path d="M{x} {y} l12 -8 l14 0 l10 8 l-4 14 l-24 2 z"/>' for x, y in ((600, 208), (636, 196), (672, 200), (618, 228), (654, 224), (690, 228)))
    lattice = "".join(f'<path d="M{x} 130 L{x+90} 300 M{x+90} 130 L{x} 300"/>' for x in range(940, 1200, 46))
    leaves = "".join(f'<ellipse cx="{x}" cy="{y}" rx="12" ry="7" transform="rotate({r} {x} {y})"/>' for x, y, r in ((990, 170, -30), (1030, 150, 20), (1060, 200, -40), (1100, 160, 30), (1010, 230, 15), (1080, 250, -25), (1130, 210, 10), (1150, 140, -20)))
    pods = "".join(f'<path d="M{x} {y} q14 -6 26 6 q-12 8 -26 -6z" fill="#7BB35A"/>' for x, y in ((1040, 190), (1110, 240), (1160, 190)))
    flowers = "".join(f'<circle cx="{x}" cy="{y}" r="4" fill="#FFFFFF"/>' for x, y in ((1000, 150), (1070, 176), (1140, 232), (1120, 130)))
    finch = lambda x, y, s, bk: (f'<g transform="translate({x} {y}) scale({s})" fill="#2A2018"><ellipse cx="0" cy="0" rx="13" ry="8"/><circle cx="11" cy="-6" r="6"/>'
                                 f'<path d="M-12 -2 l-10 4 l8 2z"/><path d="M16 -6 {bk}"/><path d="M-2 8 v6 M4 8 v6" stroke="#2A2018" stroke-width="1.5"/></g>')
    waves = "".join(f'<path d="M{x} {y} q30 -6 60 0 q30 6 60 0" stroke="#E8F4F4" stroke-width="2" fill="none" opacity=".6"/>' for x, y in ((820, 214), (960, 226), (700, 206), (1080, 244), (880, 258)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#FFFFFF" opacity=".75"><ellipse cx="300" cy="70" rx="110" ry="10"/><ellipse cx="900" cy="90" rx="150" ry="12"/><ellipse cx="960" cy="80" rx="60" ry="18"/></g>
<path d="M700 200 q80 -34 200 -20 q80 8 140 20z" fill="#5A7A88" opacity=".7"/>
<path d="M0 198 H1200 V420 H0z" fill="url(#{p}sea)"/>
{waves}
<path d="M560 262 q80 -30 200 -20 q120 10 220 -14 V320 H560z" fill="#E8F4F4" opacity=".35"/>
<path d="M0 262 Q60 230 150 240 Q230 222 320 242 Q420 226 520 244 Q600 236 680 258 Q760 250 840 270 Q880 286 860 300 H0z" fill="url(#{p}rock)"/>
<g fill="#7A6E62" opacity=".75"><path d="M40 254 q50 -26 110 -14 q-40 10 -110 14z"/><path d="M240 244 q50 -22 90 -6 q-40 6 -90 6z"/><path d="M440 246 q50 -20 90 -4 q-40 6 -90 4z"/><path d="M690 262 q50 -14 90 2 q-40 4 -90 -2z"/></g>
<g fill="#2A241E"><path d="M130 300 q-30 -40 30 -50 q60 -6 70 50z"/><path d="M420 300 q-20 -36 40 -44 q60 -2 60 44z"/></g>
<g fill="#5A5046" opacity=".8"><path d="M140 258 q30 -12 70 -2 q-30 2 -70 2z"/><path d="M440 262 q30 -10 60 -2 q-30 2 -60 2z"/></g>
<path d="M310 240 v-100 q-2 -14 6 -22" stroke="#5E8A3E" stroke-width="10" stroke-linecap="round" fill="none"/>
<g fill="#7BB35A"><ellipse cx="290" cy="150" rx="18" ry="30" transform="rotate(-30 290 150)"/><ellipse cx="338" cy="140" rx="18" ry="30" transform="rotate(30 338 140)"/><ellipse cx="316" cy="98" rx="16" ry="28"/><ellipse cx="270" cy="110" rx="14" ry="24" transform="rotate(-50 270 110)"/><ellipse cx="360" cy="100" rx="14" ry="24" transform="rotate(50 360 100)"/><ellipse cx="290" cy="196" rx="16" ry="24" transform="rotate(-20 290 196)"/><ellipse cx="336" cy="200" rx="16" ry="24" transform="rotate(20 336 200)"/></g>
<g fill="#F5D94A"><circle cx="316" cy="68" r="6"/><circle cx="256" cy="92" r="5"/><circle cx="372" cy="80" r="5"/></g>
<path d="M0 300 H860 Q900 290 940 300 V420 H0z" fill="url(#{p}shore)"/>
<g fill="#6A4E2C" opacity=".6"><ellipse cx="200" cy="314" rx="60" ry="8"/><ellipse cx="520" cy="318" rx="80" ry="8"/></g>
<path d="M900 300 H1200 V420 H900z" fill="url(#{p}fg)"/>
<g stroke="#8A6A40" stroke-width="3" fill="none">{lattice}<path d="M940 300 H1200 M940 130 H1200 M940 215 H1200"/></g>
<path d="M980 300 q10 -60 40 -100 q30 -40 90 -60 q40 -12 70 -6" stroke="#5E8A3E" stroke-width="4" fill="none"/><path d="M1050 300 q20 -60 60 -90 q30 -30 80 -30" stroke="#5E8A3E" stroke-width="3" fill="none"/>
<g fill="#7BB35A">{leaves}</g>{pods}{flowers}
<g stroke="#7BB35A" stroke-width="1.5" fill="none"><path d="M1090 168 q10 -10 4 -18 q-8 2 -2 10"/><path d="M1150 118 q12 -6 8 -16 q-8 4 -4 12"/></g>
<path d="M0 384 Q300 376 600 382 T1200 378 V420 H0z" fill="#1A1408" opacity=".5"/>
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
