"""Unit banners for The Bible course, units 1-9 (K-2, 3-5 and the first 6-8 unit).

Nine drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_bib_a import BANNERS, CREDITS, banner
    banner(3)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"bb{n}-" so all 18 Bible banners can sit on one contents page.
No text, no images, no photographs, no external references, no feTurbulence.
Calm colours; nothing moves.

Page CSS note (same as the other courses):
    .scene svg { width:100%; height:100%; display:block; }
The page sits the banner over a #0A1E33 band and paints a dark gradient
over the bottom ~45% for the unit title, so the lower part of every scene
is kept calm (ground, water, table tops) and the action sits in the
upper 55%.

The scenes are landscapes and objects only: a garden, tents under stars,
reeds on a river, a shepherd's hill, a shelf of scrolls, a walled city, the
willows of Babylon, a lakeshore, a scribe's desk.  No faces, no figures of
any person the text names, no religious emblems.
"""

W, H = 1200, 420

CREDITS = {
    1: "Drawn scene: a garden at first light with a great tree, a river winding through it, the sun rising and a soft rainbow over a hill where a wooden boat rests",
    2: "Drawn scene: tents in a desert at night under a sky full of stars, a camel resting, a low fire and a pale dawn just beginning on the horizon",
    3: "Drawn scene: tall reeds on a slow river with a small woven basket floating among them, palm trees, and a mountain far off with a cloud resting on its top",
    4: "Drawn scene: a green hill of sheep with a shepherd's staff and a harp resting on a rock, a great fish rising in the sea beyond, and a small boat on a calm lake",
    5: "Drawn scene: a wooden shelf holding rolled scrolls and bound books of many colours, an oil lamp, and one scroll unrolled on a table showing only ruled lines",
    6: "Drawn scene: a walled city on a hill at golden hour with a ram's horn and a water jar in the foreground and a field of ripe barley with a sheaf laid down",
    7: "Drawn scene: willow trees by a wide river with a harp hung in the branches, a stepped tower far away, and a road leading toward a sunrise in the east",
    8: "Drawn scene: a lakeshore at morning with fishing boats and nets drying, olive trees on a green hill, a dusty road and a small stone town",
    9: "Drawn scene: a scribe's desk with a scroll, a reed pen and ink, a lamp, a lyre, a sealed letter and a ram's horn, a window open on hills at dusk",
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


def _tree(x, y, s, trunk="#5A3E2A", leaf="#4E7A3C", leaf2="#6E9A50"):
    """A round-headed tree with its base at (x, y); s is the scale."""
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="M-6 0 v-46 M0 -30 l-16 -14 M0 -34 l18 -12" stroke="{trunk}" stroke-width="7" fill="none" stroke-linecap="round"/>'
            f'<g fill="{leaf}"><circle cx="0" cy="-72" r="34"/><circle cx="-28" cy="-54" r="24"/><circle cx="30" cy="-56" r="25"/><circle cx="-6" cy="-96" r="22"/></g>'
            f'<g fill="{leaf2}"><circle cx="-10" cy="-78" r="14"/><circle cx="22" cy="-64" r="11"/></g></g>')


def _palm(x, y, s, lean=0):
    fronds = "".join(f'<path d="M0 -70 q{dx} {dy} {dx*2} {dy2}" stroke="#4E7A3C" stroke-width="5" fill="none" stroke-linecap="round"/>'
                     for dx, dy, dy2 in ((-18, -22, 6), (18, -22, 6), (-26, -8, 22), (26, -8, 22), (-8, -30, -20), (8, -30, -20)))
    return (f'<g transform="translate({x} {y}) scale({s}) rotate({lean})">'
            f'<path d="M0 0 q4 -36 0 -70" stroke="#7A5A3A" stroke-width="7" fill="none" stroke-linecap="round"/>{fronds}'
            f'<circle cx="0" cy="-68" r="6" fill="#8A6A40"/></g>')


# ───────────────────────── 1  Beginnings: a garden at first light ─────────────────────────
def _b1():
    p = "bb1-"
    defs = (
        _lin(p+"sky", [(0, "#8FB8DE", None), (.5, "#CFE3EE", None), (1, "#F8E3B4", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.35, "#FFE08A", .65), (1, "#FFE08A", 0)])
        + _lin(p+"hillA", [(0, "#9CC46A", None), (1, "#6E9A46", None)])
        + _lin(p+"hillB", [(0, "#7FAA58", None), (1, "#4E7A3C", None)])
        + _lin(p+"river", [(0, "#BFE0EA", None), (1, "#5F9CB4", None)])
        + _lin(p+"fg", [(0, "#3E6A2E", None), (1, "#1E3A18", None)])
    )
    arcs = "".join(f'<path d="M700 300 A{r} {r} 0 0 1 {700+2*r} 300" transform="translate({-r} 0)" stroke="{c}" stroke-width="9" fill="none" opacity=".45"/>'
                   for r, c in ((150, "#E4573D"), (141, "#F0923A"), (132, "#F2C964"), (123, "#8DBD4C"), (114, "#5F9CB4"), (105, "#7A6AB8")))
    flowers = "".join(f'<circle cx="{x}" cy="{y}" r="3.5" fill="{c}"/>' for x, y, c in
                      ((120, 330, "#F2C964"), (150, 344, "#E86A6A"), (180, 332, "#FFFFFF"), (230, 348, "#F2C964"), (290, 336, "#E86A6A"),
                       (960, 340, "#FFFFFF"), (1000, 330, "#F2C964"), (1050, 346, "#E86A6A"), (1100, 334, "#F2C964"), (1150, 348, "#FFFFFF")))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="960" cy="150" r="140" fill="url(#{p}sun)"/><circle cx="960" cy="150" r="34" fill="#FFF6D0"/>
<g fill="#FFFFFF" opacity=".6"><ellipse cx="240" cy="80" rx="110" ry="12"/><ellipse cx="300" cy="70" rx="50" ry="16"/><ellipse cx="640" cy="96" rx="90" ry="9"/></g>
<path d="M0 262 Q150 200 320 236 Q470 200 620 250 Q760 214 900 246 Q1050 214 1200 244 V330 H0z" fill="url(#{p}hillA)"/>
<g transform="translate(-150 0)">{arcs}</g>
<path d="M0 300 Q200 268 400 292 Q600 270 800 296 Q1000 272 1200 300 V420 H0z" fill="url(#{p}hillB)"/>
<path d="M640 232 q60 -30 130 -12 q60 14 80 40 l-6 6 q-30 -20 -80 -26 q-60 -6 -118 8z" fill="#8A6A40"/><path d="M660 236 h150 l-8 22 h-134z" fill="#6A4A2C"/><rect x="700" y="216" width="60" height="22" fill="#8A6A40"/><rect x="706" y="222" width="12" height="10" fill="#3A2A1A"/>
<path d="M0 330 Q120 300 240 330 Q360 360 480 336 Q600 316 720 340 Q840 364 960 340 Q1080 318 1200 340 V420 H0z" fill="url(#{p}river)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".5"><path d="M120 348 h60 M300 356 h80 M560 352 h50 M780 360 h70 M1000 350 h60"/></g>
{_tree(420, 300, 1.7, leaf="#4E7A3C", leaf2="#7FAA58")}
<g fill="#E4573D"><circle cx="404" cy="182" r="5"/><circle cx="446" cy="196" r="5"/><circle cx="428" cy="158" r="5"/><circle cx="386" cy="212" r="5"/></g>
{_tree(150, 296, 1.0)}{_tree(1040, 292, 1.1, leaf="#5E8A42", leaf2="#88B060")}{_tree(1150, 300, .8)}
<g fill="#3A2A1A" opacity=".8"><ellipse cx="560" cy="290" rx="14" ry="8"/><circle cx="574" cy="284" r="5"/><ellipse cx="590" cy="292" rx="12" ry="7"/><circle cx="602" cy="287" r="4"/></g>
<g fill="#5A3E2A" opacity=".8"><path d="M860 286 q10 -16 24 -4 q8 -12 20 0 v10 h-44z"/><path d="M896 284 q8 -14 20 -4 q6 -10 16 0 v10 h-36z"/></g>
<g fill="#F2C964"><path d="M820 214 q6 -8 12 0 q-6 6 -12 0z"/><path d="M1090 200 q6 -8 12 0 q-6 6 -12 0z"/></g>
<path d="M0 384 Q300 372 600 382 T1200 376 V420 H0z" fill="url(#{p}fg)"/>
{flowers}
'''
    return _wrap(1, body, defs)


# ───────────────────────── 2  Abraham's Family: tents under the stars ─────────────────────────
def _b2():
    p = "bb2-"
    defs = (
        _lin(p+"sky", [(0, "#0A1440", None), (.55, "#1E2E6A", None), (.85, "#5A4A7A", None), (1, "#D89A6A", None)])
        + _lin(p+"dune", [(0, "#8A6A48", None), (1, "#4A3626", None)])
        + _lin(p+"dune2", [(0, "#6E5238", None), (1, "#2E2016", None)])
        + _lin(p+"tent", [(0, "#C9B08A", None), (1, "#8A6E48", None)])
        + _lin(p+"tent2", [(0, "#B09470", None), (1, "#6E5238", None)])
        + _rad(p+"fire", [(0, "#FFE9B0", .9), (.4, "#F0923A", .5), (1, "#F0923A", 0)])
        + _rad(p+"moon", [(0, "#F6F2E0", 1), (.3, "#E8E4CC", .6), (1, "#E8E4CC", 0)])
    )
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(11, 140, 300, "#EEF0FF", ".85")}
{_stars(29, 30, 220, "#FFFFFF", "1")}
<circle cx="200" cy="90" r="40" fill="url(#{p}moon)"/><path d="M200 74 a16 16 0 1 0 0 32 a12 12 0 1 1 0 -32z" fill="#F6F2E0"/>
<path d="M0 290 Q200 240 420 270 Q640 300 860 262 Q1040 232 1200 270 V420 H0z" fill="url(#{p}dune)"/>
<path d="M0 330 Q240 300 480 326 Q720 350 960 318 Q1100 300 1200 322 V420 H0z" fill="url(#{p}dune2)"/>
<g><path d="M300 296 L400 190 L520 296z" fill="url(#{p}tent)"/><path d="M400 190 L520 296 H470 L400 220z" fill="#6E5238" opacity=".5"/><path d="M400 190 v106" stroke="#4A3626" stroke-width="3"/><path d="M380 296 L400 236 L420 296z" fill="#2E2016"/></g>
<g><path d="M700 300 L770 228 L860 300z" fill="url(#{p}tent2)"/><path d="M770 228 L860 300 H820 L770 250z" fill="#4A3626" opacity=".5"/><path d="M770 228 v72" stroke="#3A2A1A" stroke-width="3"/></g>
<g><path d="M960 292 L1010 244 L1070 292z" fill="url(#{p}tent2)"/><path d="M1010 244 v48" stroke="#3A2A1A" stroke-width="2"/></g>
<g stroke="#3A2A1A" stroke-width="1.5" opacity=".7"><path d="M300 296 l-30 14 M520 296 l30 14 M700 300 l-24 12 M860 300 l24 12"/></g>
<ellipse cx="600" cy="318" rx="70" ry="30" fill="url(#{p}fire)"/>
<g fill="#3A2A1A"><path d="M580 320 l40 -8 l2 4 l-40 8z M584 314 l34 10 l-2 4 l-34 -10z"/></g>
<path d="M596 312 q4 -14 10 -16 q-2 10 4 14 q-6 2 -14 2z" fill="#F0923A"/><path d="M600 312 q2 -8 6 -9 q0 6 2 8z" fill="#FFE9B0"/>
<g fill="#5A4030"><path d="M130 300 q10 -34 40 -38 q26 -2 36 18 q10 -6 22 4 q8 8 6 20 h-12 v18 h-8 v-18 h-40 v18 h-8 v-18 h-30z"/><path d="M204 262 q10 -10 14 -22 q6 4 4 14 q-4 8 -12 12z"/></g>
<g fill="#5A4030" opacity=".85"><ellipse cx="1120" cy="306" rx="22" ry="9"/><circle cx="1140" cy="296" r="7"/><ellipse cx="1150" cy="290" rx="8" ry="4"/></g>
<path d="M0 372 Q300 362 600 370 T1200 364 V420 H0z" fill="#1E140E"/>
'''
    return _wrap(2, body, defs)


# ───────────────────────── 3  Moses and the Way Out: reeds on the river ─────────────────────────
def _b3():
    p = "bb3-"
    defs = (
        _lin(p+"sky", [(0, "#79B4DC", None), (.6, "#CFE6EE", None), (1, "#F6E3B8", None)])
        + _lin(p+"mtn", [(0, "#8A7A9A", None), (1, "#5A4A6A", None)])
        + _lin(p+"bank", [(0, "#B8A86A", None), (1, "#8A7A44", None)])
        + _lin(p+"river", [(0, "#A8D0DC", None), (1, "#4F8CA4", None)])
        + _lin(p+"fg", [(0, "#3E6A2E", None), (1, "#1E3A18", None)])
        + _rad(p+"glow", [(0, "#FFFFFF", .9), (1, "#FFFFFF", 0)])
    )
    reeds = "".join(f'<path d="M{x} {y} q{dx} -60 {dx*1.6} -{h}" stroke="{c}" stroke-width="{w}" fill="none" stroke-linecap="round"/>'
                    f'<ellipse cx="{x+int(dx*1.6)}" cy="{y-h-8}" rx="4" ry="12" fill="#7A5A3A" transform="rotate({dx} {x+int(dx*1.6)} {y-h-8})"/>'
                    for x, y, dx, h, c, w in (
                        (60, 340, 6, 150, "#4E7A3C", 5), (100, 350, -8, 170, "#5E8A46", 5), (150, 344, 10, 140, "#4E7A3C", 4),
                        (190, 352, -4, 180, "#6E9A50", 5), (240, 346, 12, 130, "#4E7A3C", 4), (280, 356, -10, 160, "#5E8A46", 5),
                        (900, 350, 8, 150, "#4E7A3C", 5), (950, 344, -6, 170, "#5E8A46", 5), (1000, 356, 10, 140, "#4E7A3C", 4),
                        (1050, 348, -12, 160, "#6E9A50", 5), (1110, 354, 6, 180, "#4E7A3C", 5), (1160, 346, -8, 140, "#5E8A46", 4)))
    weave = "".join(f'<path d="M{x} 298 q10 -8 20 0 q10 8 20 0" stroke="#7A5A3A" stroke-width="1.5" fill="none"/>' for x in (520, 560, 600))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="1000" cy="120" r="120" fill="url(#{p}glow)" opacity=".5"/>
<path d="M520 240 L660 96 L800 240z" fill="url(#{p}mtn)"/><path d="M660 96 L800 240 H730 L660 130z" fill="#4A3A5A" opacity=".5"/>
<g fill="#FFFFFF" opacity=".92"><ellipse cx="660" cy="110" rx="70" ry="18"/><ellipse cx="630" cy="102" rx="34" ry="20"/><ellipse cx="690" cy="104" rx="36" ry="18"/></g>
<path d="M300 246 Q460 226 620 246 Q800 262 1200 240 V300 H0 V262 Q150 240 300 246z" fill="#C9B888"/>
{_palm(380, 262, 1.4, -4)}{_palm(440, 268, 1.1, 5)}{_palm(820, 262, 1.3, 3)}{_palm(870, 268, .9, -6)}
<path d="M0 262 Q200 254 400 268 Q600 282 800 266 Q1000 252 1200 266 V420 H0z" fill="url(#{p}bank)"/>
<path d="M0 300 Q300 280 600 300 T1200 296 V420 H0z" fill="url(#{p}river)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".5"><path d="M340 322 h70 M420 336 h50 M700 326 h80 M760 342 h40 M980 330 h60"/></g>
<g><ellipse cx="580" cy="314" rx="70" ry="14" fill="#2E5A6A" opacity=".35"/><path d="M518 292 q62 -14 124 0 l-8 26 q-54 10 -108 0z" fill="#B08A56"/><path d="M518 292 q62 -14 124 0 q-62 10 -124 0z" fill="#8A6A40"/>{weave}<path d="M540 288 q40 -10 80 0" stroke="#D9C39A" stroke-width="3" fill="none"/></g>
<g fill="#5E8A46"><ellipse cx="420" cy="330" rx="26" ry="8"/><ellipse cx="740" cy="338" rx="22" ry="7"/><ellipse cx="470" cy="346" rx="16" ry="5"/></g>
<g fill="#F2C9D0"><circle cx="420" cy="322" r="6"/><circle cx="740" cy="330" r="5"/></g>
{reeds}
<path d="M0 386 Q300 376 600 384 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(3, body, defs)


# ───────────────────────── 4  Kings, Prophets and a Teacher: the shepherd's hill ─────────────────────────
def _b4():
    p = "bb4-"
    defs = (
        _lin(p+"sky", [(0, "#6FA8D8", None), (.55, "#BFDCEC", None), (1, "#F6E8C4", None)])
        + _lin(p+"sea", [(0, "#7FB4C8", None), (1, "#2E6A88", None)])
        + _lin(p+"hill", [(0, "#A8C860", None), (1, "#5E8A3E", None)])
        + _lin(p+"hill2", [(0, "#7FAA58", None), (1, "#3E6A2E", None)])
        + _lin(p+"lake", [(0, "#BFE0EA", None), (1, "#5F9CB4", None)])
        + _lin(p+"fish", [(0, "#6A8AA8", None), (1, "#2E4A68", None)])
    )
    sheep = "".join(f'<g transform="translate({x} {y}) scale({s})"><ellipse cx="0" cy="0" rx="18" ry="11" fill="#F4EDE0"/><circle cx="-12" cy="-6" r="6" fill="#F4EDE0"/><circle cx="12" cy="-6" r="6" fill="#F4EDE0"/><circle cx="18" cy="-2" r="6" fill="#3A2A1A"/><path d="M-10 10 v8 M0 11 v8 M10 10 v8" stroke="#3A2A1A" stroke-width="2.5"/></g>'
                    for x, y, s in ((180, 262, 1), (250, 276, .9), (330, 258, .8), (410, 280, 1), (470, 262, .7), (560, 284, .9), (640, 268, .8)))
    strings = "".join(f'<path d="M{x} 236 V{y}" stroke="#F2C964" stroke-width="1.2"/>' for x, y in ((934, 292), (942, 288), (950, 284), (958, 280), (966, 276), (974, 272)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#FFFFFF" opacity=".6"><ellipse cx="300" cy="70" rx="120" ry="12"/><ellipse cx="360" cy="62" rx="50" ry="16"/><ellipse cx="900" cy="90" rx="100" ry="10"/></g>
<path d="M0 200 H1200 V300 H0z" fill="url(#{p}sea)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".45"><path d="M640 226 h60 M760 240 h80 M980 222 h70 M1080 250 h60"/></g>
<g transform="translate(800 214)"><path d="M0 0 q30 -40 90 -30 q40 8 60 34 q-30 20 -70 16 q-50 -2 -80 -20z" fill="url(#{p}fish)"/><path d="M150 4 l40 -30 l-6 34 l6 30 z" fill="#2E4A68"/><path d="M40 -22 q20 -30 34 -6 z" fill="#2E4A68"/><circle cx="26" cy="-4" r="5" fill="#E9EEF4"/><circle cx="28" cy="-4" r="2.5" fill="#0A1E33"/><path d="M-12 -6 q-6 -20 4 -34 M-14 -4 q-14 -8 -10 -24" stroke="#BFE0EA" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<path d="M0 300 Q200 190 420 236 Q560 260 700 290 V420 H0z" fill="url(#{p}hill)"/>
<path d="M600 300 Q800 296 1000 302 T1200 300 V420 H600z" fill="url(#{p}lake)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".5"><path d="M700 330 h60 M900 344 h80 M1080 328 h50"/></g>
<g><path d="M1020 300 q40 20 80 0 l-8 -22 h-64z" fill="#8A6A40"/><path d="M1052 278 v-60" stroke="#5A3E2A" stroke-width="3"/><path d="M1052 220 l38 50 h-38z" fill="#F4EDE0"/></g>
<path d="M0 320 Q300 300 600 320 Q900 340 1200 316 V420 H0z" fill="url(#{p}hill2)"/>
{sheep}
<g><path d="M860 300 q10 -60 50 -74 q30 -8 60 6 q-6 30 -30 40 q-40 14 -80 28z" fill="#8A6A40"/><path d="M880 296 q10 -44 42 -60 q20 -6 40 4" stroke="#5A3E2A" stroke-width="5" fill="none" stroke-linecap="round"/>{strings}</g>
<path d="M760 320 q-4 -60 4 -110 q4 -20 20 -22 q14 0 12 14 q-2 10 -14 8" stroke="#8A6A40" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M0 384 Q300 372 600 382 T1200 376 V420 H0z" fill="#1E3A18"/>
'''
    return _wrap(4, body, defs)


# ───────────────────────── 5  What the Bible Is: a shelf of scrolls and books ─────────────────────────
def _b5():
    p = "bb5-"
    defs = (
        _lin(p+"wall", [(0, "#F1E7D2", None), (1, "#D9C9A8", None)])
        + _lin(p+"wood", [(0, "#A07A4A", None), (.4, "#7A5630", None), (1, "#4A3220", None)])
        + _lin(p+"table", [(0, "#B08A56", None), (1, "#6A4A2C", None)])
        + _rad(p+"lamp", [(0, "#FFF3C4", .95), (.4, "#FFD46A", .35), (1, "#FFD46A", 0)])
        + _lin(p+"scroll", [(0, "#F7EEDC", None), (1, "#D9C9A8", None)])
    )
    books = []
    x = 96
    for h, w, c in ((84, 22, "#A8323A"), (96, 26, "#2E5A88"), (78, 18, "#6E7C22"), (100, 30, "#7A5230"), (90, 22, "#3F4AA6"), (82, 20, "#B87A12"),
                    (98, 28, "#5E8A46"), (86, 22, "#8A3A5A"), (92, 24, "#2E6A88"), (80, 18, "#A8323A"), (100, 30, "#4A3A8C"), (88, 22, "#7A5230")):
        books.append(f'<rect x="{x}" y="{212-h}" width="{w}" height="{h}" rx="2" fill="{c}"/><rect x="{x+3}" y="{212-h+8}" width="{w-6}" height="3" fill="#F2C964" opacity=".8"/><rect x="{x+3}" y="{212-h+16}" width="{w-6}" height="2" fill="#F2C964" opacity=".5"/>')
        x += w + 3
    scrolls = "".join(f'<g transform="translate({sx} 176)"><rect x="-8" y="-14" width="110" height="28" rx="14" fill="url(#{p}scroll)"/><circle cx="-8" cy="0" r="14" fill="#E4D6B8"/><circle cx="-8" cy="0" r="6" fill="#C9B888"/><rect x="-14" y="-16" width="6" height="32" rx="3" fill="#8A6A40"/><rect x="102" y="-16" width="6" height="32" rx="3" fill="#8A6A40"/><path d="M20 -6 h50" stroke="#A8323A" stroke-width="3" opacity=".7"/></g>'
                      for sx in (560, 700, 840, 980))
    scrolls2 = "".join(f'<g transform="translate({sx} 204)"><rect x="-8" y="-14" width="110" height="28" rx="14" fill="url(#{p}scroll)"/><circle cx="-8" cy="0" r="14" fill="#E4D6B8"/><circle cx="-8" cy="0" r="6" fill="#C9B888"/><rect x="-14" y="-16" width="6" height="32" rx="3" fill="#8A6A40"/><rect x="102" y="-16" width="6" height="32" rx="3" fill="#8A6A40"/></g>'
                       for sx in (630, 770, 910))
    lines = "".join(f'<path d="M{x} {y} h{w}" stroke="#8A7A60" stroke-width="2" opacity=".6"/>' for x, y, w in
                    ((470, 300, 120), (470, 312, 140), (470, 324, 110), (470, 336, 150), (640, 300, 130), (640, 312, 100), (640, 324, 150), (640, 336, 120)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="60" y="60" width="1080" height="14" fill="url(#{p}wood)"/><rect x="60" y="212" width="1080" height="14" fill="url(#{p}wood)"/>
<rect x="60" y="60" width="14" height="166" fill="url(#{p}wood)"/><rect x="1126" y="60" width="14" height="166" fill="url(#{p}wood)"/>
<rect x="520" y="60" width="10" height="166" fill="#6A4A2C" opacity=".8"/>
<rect x="74" y="74" width="446" height="138" fill="#4A3220" opacity=".25"/><rect x="530" y="74" width="596" height="138" fill="#4A3220" opacity=".25"/>
{"".join(books)}
{scrolls}{scrolls2}
<g fill="#C9B888"><ellipse cx="120" cy="120" rx="22" ry="8"/></g><path d="M100 120 v-40 q20 -10 40 0 v40" fill="#D9C9A8"/><path d="M100 80 q20 -10 40 0 q-20 10 -40 0z" fill="#B8A87A"/>
<rect x="0" y="262" width="1200" height="30" fill="url(#{p}table)"/><rect x="0" y="262" width="1200" height="4" fill="#D6B586"/>
<path d="M0 292 H1200 V420 H0z" fill="#5A3E2A"/>
<g transform="translate(280 250)"><ellipse cx="0" cy="12" rx="60" ry="20" fill="url(#{p}lamp)"/><path d="M-30 0 q30 -20 60 0 q-8 12 -30 12 q-22 0 -30 -12z" fill="#B08A56"/><path d="M28 -2 q10 -4 12 4" stroke="#8A6A40" stroke-width="3" fill="none"/><path d="M-4 -8 q4 -12 8 0 q-4 6 -8 0z" fill="#FFD46A"/><path d="M-2 -8 q2 -6 4 0z" fill="#FFF3C4"/></g>
<g transform="translate(440 264)"><path d="M0 8 h400 v84 h-400z" fill="url(#{p}scroll)"/><rect x="-14" y="0" width="28" height="100" rx="14" fill="#E4D6B8"/><rect x="386" y="0" width="28" height="100" rx="14" fill="#E4D6B8"/><rect x="-6" y="-8" width="12" height="116" rx="6" fill="#8A6A40"/><rect x="394" y="-8" width="12" height="116" rx="6" fill="#8A6A40"/>{lines}</g>
<g transform="translate(900 268)"><rect x="0" y="0" width="200" height="30" rx="4" fill="#7A5230"/><rect x="6" y="-4" width="188" height="10" rx="2" fill="#F7EEDC"/><rect x="0" y="30" width="200" height="6" fill="#4A3220"/></g>
'''
    return _wrap(5, body, defs)


# ───────────────────────── 6  The Land, the Judges and the Kings: a walled city on a hill ─────────────────────────
def _b6():
    p = "bb6-"
    defs = (
        _lin(p+"sky", [(0, "#7FAAD2", None), (.5, "#D8C4A8", None), (1, "#F0B478", None)])
        + _rad(p+"sun", [(0, "#FFF3C4", 1), (.3, "#FFD46A", .6), (1, "#FFD46A", 0)])
        + _lin(p+"far", [(0, "#B8A088", None), (1, "#8A7060", None)])
        + _lin(p+"hill", [(0, "#C9B078", None), (1, "#8A7A44", None)])
        + _lin(p+"wall", [(0, "#E8D8B8", None), (1, "#B8A078", None)])
        + _lin(p+"field", [(0, "#E8C868", None), (1, "#B89A3A", None)])
        + _lin(p+"fg", [(0, "#8A7A44", None), (1, "#4A3A20", None)])
    )
    merlons = "".join(f'<rect x="{x}" y="196" width="14" height="12" fill="#B8A078"/>' for x in range(420, 800, 28))
    towers = "".join(f'<rect x="{x}" y="150" width="46" height="70" fill="url(#{p}wall)"/><rect x="{x-4}" y="146" width="54" height="8" fill="#B8A078"/>' + "".join(f'<rect x="{x+i}" y="138" width="10" height="10" fill="#B8A078"/>' for i in (2, 18, 34)) for x in (400, 760))
    houses = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>' for x, y, w, h, c in
                     ((470, 170, 40, 34, "#D9C9A8"), (520, 156, 50, 48, "#E4D6B8"), (580, 148, 70, 56, "#F0E4C8"), (660, 162, 44, 42, "#D9C9A8"), (712, 172, 34, 32, "#E4D6B8"), (600, 128, 30, 24, "#F0E4C8")))
    stalks = "".join(f'<path d="M{x} 330 q{dx} -30 {dx} -60" stroke="#C9A848" stroke-width="2.5" fill="none"/><ellipse cx="{x+dx}" cy="{266}" rx="4" ry="12" fill="#E8C868"/>'
                     for x, dx in ((80, 3), (110, -2), (140, 4), (170, -3), (200, 2), (230, -4), (260, 3), (290, -2), (320, 4),
                                   (880, -3), (910, 2), (940, -4), (970, 3), (1000, -2), (1030, 4), (1060, -3), (1090, 2), (1120, -4), (1150, 3)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="220" cy="130" r="130" fill="url(#{p}sun)"/><circle cx="220" cy="130" r="32" fill="#FFF3C4"/>
<path d="M0 250 Q160 210 320 236 Q480 200 640 226 Q800 196 960 230 Q1080 212 1200 236 V300 H0z" fill="url(#{p}far)"/>
<path d="M300 300 Q460 160 600 150 Q740 160 900 300z" fill="url(#{p}hill)"/>
{houses}{towers}
<rect x="400" y="206" width="406" height="30" fill="url(#{p}wall)"/><rect x="400" y="204" width="406" height="4" fill="#B8A078"/>{merlons}
<path d="M590 236 v-22 a12 12 0 0 1 24 0 v22z" fill="#4A3A20"/>
{_tree(340, 300, .9, leaf="#5E7A46", leaf2="#7A9A5A")}{_tree(880, 296, .8, leaf="#5E7A46", leaf2="#7A9A5A")}
<path d="M0 300 Q300 280 600 300 T1200 296 V420 H0z" fill="url(#{p}field)"/>
{stalks}
<g transform="translate(500 300)"><g stroke="#C9A848" stroke-width="3" fill="none" stroke-linecap="round"><path d="M0 0 l-70 -30 M0 0 l-64 -44 M0 0 l-50 -56 M0 0 l-30 -62 M0 0 l70 -30 M0 0 l64 -44 M0 0 l50 -56 M0 0 l30 -62"/></g><g fill="#E8C868"><ellipse cx="-74" cy="-32" rx="12" ry="5" transform="rotate(24 -74 -32)"/><ellipse cx="-68" cy="-47" rx="12" ry="5" transform="rotate(34 -68 -47)"/><ellipse cx="-53" cy="-60" rx="12" ry="5" transform="rotate(48 -53 -60)"/><ellipse cx="-32" cy="-66" rx="12" ry="5" transform="rotate(64 -32 -66)"/><ellipse cx="74" cy="-32" rx="12" ry="5" transform="rotate(-24 74 -32)"/><ellipse cx="68" cy="-47" rx="12" ry="5" transform="rotate(-34 68 -47)"/><ellipse cx="53" cy="-60" rx="12" ry="5" transform="rotate(-48 53 -60)"/><ellipse cx="32" cy="-66" rx="12" ry="5" transform="rotate(-64 32 -66)"/></g><path d="M-14 -6 h28 v10 h-28z" fill="#8A6A40"/></g>
<g transform="translate(700 260)"><path d="M0 0 q-24 20 -18 50 q8 20 30 20 q22 0 30 -20 q6 -30 -18 -50z" fill="#B87A50"/><path d="M-6 -6 h36 v8 h-36z" fill="#8A5A30"/><path d="M-6 -6 q-16 6 -14 26 q4 -14 14 -18z" fill="#8A5A30"/><path d="M-6 30 q10 -30 20 -20" stroke="#D9A070" stroke-width="2" fill="none"/></g>
<g transform="translate(380 316)"><path d="M0 0 q-70 -6 -110 -46 q-14 -14 -8 -30 q6 12 20 22 q40 30 100 34 q6 4 6 12 q0 6 -8 8z" fill="#C9B078"/><path d="M0 0 q-70 -6 -110 -46 q4 6 12 10 q40 32 98 36z" fill="#8A7A44" opacity=".6"/><path d="M-2 -20 q-4 8 -2 20" stroke="#8A7A44" stroke-width="2" fill="none"/><path d="M-118 -76 q-4 -8 4 -10 q4 4 2 10z" fill="#8A7A44"/></g>
<path d="M0 384 Q300 372 600 382 T1200 376 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(6, body, defs)


# ───────────────────────── 7  Prophets, Exile and Return: willows by the river ─────────────────────────
def _b7():
    p = "bb7-"
    defs = (
        _lin(p+"sky", [(0, "#4A5A8A", None), (.5, "#9AA8C8", None), (.8, "#F0C890", None), (1, "#F6A868", None)])
        + _rad(p+"sun", [(0, "#FFF3C4", 1), (.3, "#FFD46A", .6), (1, "#FFD46A", 0)])
        + _lin(p+"river", [(0, "#8AA8B8", None), (1, "#3E6A80", None)])
        + _lin(p+"bank", [(0, "#8A9A6A", None), (1, "#4E6A3C", None)])
        + _lin(p+"zig", [(0, "#B89A70", None), (1, "#7A6040", None)])
        + _lin(p+"fg", [(0, "#3E4A2E", None), (1, "#1E2A18", None)])
    )
    def willow(x, y, s):
        fronds = "".join(f'<path d="M{dx} -90 q{dx//2+6} 40 {dx//2 + 2} {90+extra}" stroke="#6E9A50" stroke-width="3" fill="none" stroke-linecap="round"/>'
                         for dx, extra in ((-60, 10), (-44, 30), (-28, 40), (-12, 46), (4, 44), (20, 38), (36, 24), (52, 8), (66, -4)))
        return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 q-6 -50 4 -90" stroke="#4A3626" stroke-width="10" fill="none" stroke-linecap="round"/>'
                f'<ellipse cx="4" cy="-96" rx="76" ry="24" fill="#5E8A46"/><ellipse cx="0" cy="-104" rx="50" ry="18" fill="#7FAA58"/>{fronds}</g>')
    steps = "".join(f'<rect x="{960 + i*10}" y="{224 - i*14}" width="{160 - i*20}" height="14" fill="url(#{p}zig)"/>' for i in range(6))
    strings = "".join(f'<path d="M{x} 232 V{y}" stroke="#F2C964" stroke-width="1.2"/>' for x, y in ((560, 270), (566, 266), (572, 262), (578, 258), (584, 254)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="1080" cy="180" r="130" fill="url(#{p}sun)"/><circle cx="1080" cy="180" r="30" fill="#FFF3C4"/>
<path d="M0 232 Q200 216 400 226 Q600 236 800 222 Q1000 210 1200 226 V300 H0z" fill="#8A8A9A" opacity=".7"/>
{steps}
<path d="M0 300 Q200 270 400 296 Q600 320 800 290 Q1000 262 1200 290 V420 H0z" fill="url(#{p}bank)"/>
<path d="M760 300 q60 -30 130 -30 q100 0 190 -40 l20 6 q-90 46 -200 50 q-70 0 -130 30z" fill="#C9B078" opacity=".8"/>
<path d="M0 330 Q300 316 600 332 T1200 324 V420 H0z" fill="url(#{p}river)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".4"><path d="M120 350 h80 M340 364 h60 M620 352 h90 M880 366 h70 M1040 348 h60"/></g>
{willow(180, 300, 1.4)}{willow(560, 296, 1.1)}{willow(760, 302, .8)}
<g><path d="M540 208 v22" stroke="#4A3626" stroke-width="2"/><path d="M536 270 q2 -40 22 -50 q16 -6 34 4 q-4 20 -20 28 q-22 10 -36 18z" fill="#8A6A40"/><path d="M542 266 q6 -30 24 -40 q12 -4 26 2" stroke="#5A3E2A" stroke-width="4" fill="none" stroke-linecap="round"/>{strings}</g>
<g fill="#4E6A3C"><ellipse cx="100" cy="352" rx="30" ry="8"/><ellipse cx="900" cy="346" rx="34" ry="8"/></g>
<path d="M0 386 Q300 376 600 384 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(7, body, defs)


# ───────────────────────── 8  The New Testament Story: a lakeshore at morning ─────────────────────────
def _b8():
    p = "bb8-"
    defs = (
        _lin(p+"sky", [(0, "#7FB4DC", None), (.55, "#CFE3EE", None), (1, "#F6E8C4", None)])
        + _lin(p+"hill", [(0, "#A8C070", None), (1, "#6E9A46", None)])
        + _lin(p+"hill2", [(0, "#C9B888", None), (1, "#8A7A5A", None)])
        + _lin(p+"lake", [(0, "#A8D0DC", None), (1, "#4F8CA4", None)])
        + _lin(p+"boat", [(0, "#A07A4A", None), (1, "#5A3E2A", None)])
        + _lin(p+"shore", [(0, "#D9C9A8", None), (1, "#8A7A5A", None)])
    )
    def olive(x, y, s):
        return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 q-4 -30 2 -50 M2 -30 l-14 -12 M2 -34 l16 -12" stroke="#5A4A3A" stroke-width="6" fill="none" stroke-linecap="round"/>'
                f'<g fill="#8AA070"><ellipse cx="0" cy="-64" rx="30" ry="18"/><ellipse cx="-22" cy="-50" rx="18" ry="12"/><ellipse cx="24" cy="-52" rx="18" ry="12"/></g><g fill="#A8B888"><ellipse cx="-4" cy="-68" rx="12" ry="7"/></g></g>')
    houses = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>' for x, y, w, h, c in
                     ((900, 248, 40, 30, "#E4D6B8"), (944, 236, 50, 42, "#F0E4C8"), (1000, 244, 36, 34, "#D9C9A8"), (1040, 232, 60, 46, "#E4D6B8"), (1104, 250, 40, 28, "#F0E4C8")))
    net = "".join(f'<path d="M{x} 306 l14 26 M{x+14} 306 l-14 26" stroke="#8A7A5A" stroke-width="1.2"/>' for x in range(150, 300, 14))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#FFFFFF" opacity=".6"><ellipse cx="200" cy="80" rx="120" ry="12"/><ellipse cx="260" cy="70" rx="50" ry="16"/><ellipse cx="760" cy="60" rx="90" ry="9"/></g>
<path d="M0 250 Q200 170 420 210 Q600 236 780 200 Q980 160 1200 230 V300 H0z" fill="url(#{p}hill2)"/>
<path d="M0 270 Q160 210 360 250 Q520 280 700 256 V300 H0z" fill="url(#{p}hill)"/>
{olive(120, 268, 1.2)}{olive(300, 262, 1.0)}{olive(440, 272, .9)}{olive(560, 266, .8)}
{houses}<rect x="1010" y="220" width="20" height="24" fill="#D9C9A8"/><path d="M700 300 Q900 280 1200 296 V420 H700z" fill="url(#{p}shore)"/>
<path d="M0 300 Q300 288 600 302 T1200 300 V420 H0z" fill="url(#{p}lake)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".5"><path d="M100 330 h70 M360 344 h60 M640 332 h90 M900 350 h70 M1080 334 h60"/></g>
<g transform="translate(520 316)"><path d="M-70 0 q70 26 140 0 l-14 -20 h-112z" fill="url(#{p}boat)"/><path d="M-70 0 q70 12 140 0" stroke="#3A2A1A" stroke-width="3" fill="none"/><path d="M0 -20 v-80" stroke="#5A3E2A" stroke-width="4"/><path d="M4 -96 l50 74 h-50z" fill="#F4EDE0"/><path d="M-4 -96 l-40 74 h40z" fill="#E4D6B8"/></g>
<g transform="translate(860 328)"><path d="M-50 0 q50 20 100 0 l-10 -16 h-80z" fill="url(#{p}boat)"/><path d="M-50 0 q50 10 100 0" stroke="#3A2A1A" stroke-width="2.5" fill="none"/></g>
<g><path d="M140 300 v-40 M300 300 v-40" stroke="#5A3E2A" stroke-width="4"/><path d="M140 262 Q220 290 300 262" stroke="#5A3E2A" stroke-width="3" fill="none"/><path d="M140 262 Q220 300 300 262 V306 H140z" fill="#D9C9A8" opacity=".6"/>{net}</g>
<path d="M0 384 Q300 372 600 382 T1200 376 V420 H0z" fill="#2E4A3A"/>
'''
    return _wrap(8, body, defs)


# ───────────────────────── 9  Genres and How to Read Them: the scribe's desk ─────────────────────────
def _b9():
    p = "bb9-"
    defs = (
        _lin(p+"wall", [(0, "#E8DCC4", None), (1, "#C9B898", None)])
        + _lin(p+"sky", [(0, "#4A5A8A", None), (.6, "#B89AB8", None), (1, "#F0B478", None)])
        + _lin(p+"hills", [(0, "#6A6A8A", None), (1, "#3A3A5A", None)])
        + _lin(p+"desk", [(0, "#B08A56", None), (.5, "#8A6A40", None), (1, "#5A3E2A", None)])
        + _rad(p+"lamp", [(0, "#FFF3C4", .95), (.4, "#FFD46A", .35), (1, "#FFD46A", 0)])
        + _lin(p+"scroll", [(0, "#F7EEDC", None), (1, "#E4D6B8", None)])
    )
    lines = "".join(f'<path d="M{x} {y} h{w}" stroke="#8A7A60" stroke-width="2" opacity=".55"/>' for x, y, w in
                    ((360, 286, 90), (360, 298, 120), (360, 310, 100), (360, 322, 130), (500, 286, 110), (500, 298, 90), (500, 310, 130), (500, 322, 100)))
    strings = "".join(f'<path d="M{x} 250 V{y}" stroke="#F2C964" stroke-width="1.2"/>' for x, y in ((860, 300), (868, 296), (876, 292), (884, 288), (892, 284)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="700" y="40" width="360" height="200" fill="url(#{p}sky)"/>
<circle cx="980" cy="120" r="24" fill="#F6F2E0" opacity=".9"/>
{_stars(5, 24, 90, "#FFFFFF", ".8", 710, 1050)}
<path d="M700 200 Q780 150 860 180 Q940 200 1060 160 V240 H700z" fill="url(#{p}hills)"/>
<g fill="#8A6A40"><rect x="690" y="30" width="380" height="12"/><rect x="690" y="240" width="380" height="12"/><rect x="690" y="30" width="12" height="222"/><rect x="1058" y="30" width="12" height="222"/><rect x="874" y="30" width="8" height="222"/></g>
<rect x="0" y="270" width="1200" height="34" fill="url(#{p}desk)"/><rect x="0" y="270" width="1200" height="4" fill="#D6B586"/>
<path d="M0 304 H1200 V420 H0z" fill="#3A2A1A"/>
<ellipse cx="200" cy="270" rx="90" ry="26" fill="url(#{p}lamp)"/>
<g transform="translate(200 262)"><path d="M-34 0 q34 -20 68 0 q-8 12 -34 12 q-26 0 -34 -12z" fill="#B08A56"/><path d="M32 -2 q12 -4 14 6" stroke="#8A6A40" stroke-width="3" fill="none"/><path d="M-4 -10 q4 -14 8 0 q-4 6 -8 0z" fill="#FFD46A"/><path d="M-2 -10 q2 -8 4 0z" fill="#FFF3C4"/></g>
<g transform="translate(340 264)"><path d="M0 8 h300 v70 h-300z" fill="url(#{p}scroll)"/><rect x="-14" y="0" width="28" height="86" rx="14" fill="#E4D6B8"/><rect x="286" y="0" width="28" height="86" rx="14" fill="#E4D6B8"/><rect x="-6" y="-8" width="12" height="102" rx="6" fill="#8A6A40"/><rect x="294" y="-8" width="12" height="102" rx="6" fill="#8A6A40"/></g>
{lines}
<g transform="translate(660 250)"><path d="M0 26 l60 -60" stroke="#B8A078" stroke-width="5" stroke-linecap="round"/><path d="M0 26 l8 -14 l8 6z" fill="#3A2A1A"/><ellipse cx="90" cy="22" rx="18" ry="8" fill="#3A2A1A"/><rect x="72" y="4" width="36" height="18" rx="4" fill="#4A3A5A"/><rect x="78" y="0" width="24" height="6" rx="2" fill="#2A2A3A"/></g>
<g><path d="M820 300 q6 -50 40 -64 q26 -8 50 6 q-6 24 -28 34 q-32 12 -62 24z" fill="#8A6A40"/><path d="M828 296 q8 -40 36 -54 q18 -6 34 2" stroke="#5A3E2A" stroke-width="4" fill="none" stroke-linecap="round"/>{strings}</g>
<g transform="translate(960 244)"><rect x="0" y="0" width="90" height="56" rx="3" fill="#F7EEDC"/><path d="M0 0 l45 30 l45 -30" stroke="#C9B888" stroke-width="2" fill="none"/><circle cx="45" cy="34" r="9" fill="#A8323A"/><circle cx="45" cy="34" r="4" fill="#7E1F26"/></g>
<g transform="translate(1080 300)"><path d="M0 0 q-10 -50 30 -76 q20 -12 40 -6 q-20 10 -30 30 q-12 26 -22 52z" fill="#C9B078"/><path d="M30 -76 q20 -12 40 -6" stroke="#8A7A44" stroke-width="3" fill="none"/><path d="M8 -20 q2 -20 14 -36" stroke="#8A7A44" stroke-width="2" fill="none"/></g>
<g transform="translate(70 300)"><rect x="0" y="-30" width="120" height="30" rx="3" fill="#2E5A88"/><rect x="0" y="-56" width="110" height="26" rx="3" fill="#A8323A"/><rect x="0" y="-78" width="100" height="22" rx="3" fill="#6E7C22"/><g fill="#F2C964" opacity=".7"><rect x="8" y="-20" width="104" height="3"/><rect x="8" y="-46" width="94" height="3"/><rect x="8" y="-70" width="84" height="3"/></g></g>
'''
    return _wrap(9, body, defs)


_BUILDERS = {1: _b1, 2: _b2, 3: _b3, 4: _b4, 5: _b5, 6: _b6, 7: _b7, 8: _b8, 9: _b9}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (1..9)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    from xml.dom import minidom
    for n in sorted(BANNERS):
        minidom.parseString(BANNERS[n])
        assert "--" not in BANNERS[n], "double minus in banner %d" % n
        print(n, len(BANNERS[n].encode("utf-8")), "bytes", "ok")
