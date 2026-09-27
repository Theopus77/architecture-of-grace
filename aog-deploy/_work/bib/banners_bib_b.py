"""Unit banners for The Bible course, units 10-18 (6-8, 9-10 and 11-12).

Nine drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_bib_b import BANNERS, CREDITS, banner
    banner(14)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"bb{n}-" so all 18 Bible banners can sit on one contents page.
No text, no images, no photographs, no external references, no feTurbulence.
Calm colours; nothing moves.  Same layout rule as banners_bib_a: the
action sits in the upper 55%, the lower part stays calm for the title.

Landscapes and objects only: a mountain in cloud, a river valley of cities,
a lyre under the moon, a Roman road and harbour, a half-built tower, a
vineyard under a breaking storm, a hillside at dawn, a scriptorium, a
reading room.  No faces, no figures of any person the text names, no
religious emblems.
"""

W, H = 1200, 420

CREDITS = {
    10: "Drawn scene: a mountain with a bright cloud resting on its peak at twilight, a wide camp of tents in the valley below and a dry riverbed",
    11: "Drawn scene: a river valley at late afternoon with a stepped tower, a walled city with a gate, a palace with columns, palms and a long road between them",
    12: "Drawn scene: a lyre resting on a stone wall under a full moon, a cedar on the hill behind, a pomegranate branch and lilies in the foreground",
    13: "Drawn scene: a paved Roman road with a milestone running past aqueduct arches toward a harbour where a merchant ship waits, hills behind",
    14: "Drawn scene: a half-built stepped tower with scaffolding at dusk, and in the foreground a garden with two trees beside a river",
    15: "Drawn scene: terraced vineyards under a storm breaking open to light, a plumb line hanging still from a post, a wind-bent olive tree and a far whirlwind",
    16: "Drawn scene: a hillside at dawn with lilies in the grass, an oil lamp on a stand on a flat stone, a tall mustard plant with birds and a city on a far hill",
    17: "Drawn scene: a scriptorium desk with an open codex, loose papyrus sheets, an ink pot, a lamp and a wax tablet; through the window a column and a ship at sea",
    18: "Drawn scene: a quiet reading room with a tall window of coloured panes, shelves of books, a printing press, a globe and an open book on a lectern",
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


def _tent(x, y, w, h, fill, shade):
    return (f'<g><path d="M{x} {y} L{x+w//2} {y-h} L{x+w} {y}z" fill="{fill}"/>'
            f'<path d="M{x+w//2} {y-h} L{x+w} {y} H{x+w-w//5} L{x+w//2} {y-h+h//4}z" fill="{shade}" opacity=".5"/>'
            f'<path d="M{x+w//2} {y-h} v{h}" stroke="{shade}" stroke-width="2"/></g>')


# ───────────────────────── 10  The Pentateuch: a mountain in cloud ─────────────────────────
def _b10():
    p = "bb10-"
    defs = (
        _lin(p+"sky", [(0, "#2E3A6A", None), (.5, "#6A6A9A", None), (.85, "#C89A8A", None), (1, "#E8B888", None)])
        + _lin(p+"mtn", [(0, "#7A6A8A", None), (1, "#3E3450", None)])
        + _lin(p+"mtn2", [(0, "#9A8AA0", None), (1, "#5A4A6A", None)])
        + _rad(p+"glow", [(0, "#FFF6D0", .95), (.4, "#FFE08A", .45), (1, "#FFE08A", 0)])
        + _lin(p+"ground", [(0, "#B89A70", None), (1, "#6E5238", None)])
        + _lin(p+"fg", [(0, "#4A3A28", None), (1, "#1E140E", None)])
    )
    tents = "".join(_tent(x, y, w, h, "#D9C9A8", "#6E5238") for x, y, w, h in
                    ((80, 300, 60, 40), (160, 292, 44, 30), (230, 306, 70, 46), (330, 296, 50, 34), (400, 308, 60, 40), (480, 298, 40, 28),
                     (720, 300, 60, 40), (800, 292, 46, 30), (870, 308, 70, 46), (960, 296, 50, 34), (1040, 306, 60, 42), (1120, 298, 44, 30)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(17, 40, 120, "#FFFFFF", ".6")}
<path d="M0 270 Q120 230 240 250 Q360 220 480 246 V300 H0z" fill="url(#{p}mtn2)"/>
<path d="M700 246 Q840 214 960 240 Q1080 222 1200 250 V300 H700z" fill="url(#{p}mtn2)"/>
<path d="M360 300 L600 80 L840 300z" fill="url(#{p}mtn)"/><path d="M600 80 L840 300 H740 L600 130z" fill="#2E2440" opacity=".45"/>
<circle cx="600" cy="100" r="110" fill="url(#{p}glow)"/>
<g fill="#F7F0E0" opacity=".95"><ellipse cx="600" cy="104" rx="96" ry="22"/><ellipse cx="560" cy="92" rx="46" ry="26"/><ellipse cx="640" cy="90" rx="50" ry="24"/><ellipse cx="600" cy="80" rx="30" ry="20"/></g>
<g fill="#E8E0D0" opacity=".8"><ellipse cx="520" cy="120" rx="40" ry="10"/><ellipse cx="690" cy="118" rx="44" ry="10"/></g>
<path d="M0 300 Q300 284 600 300 T1200 296 V420 H0z" fill="url(#{p}ground)"/>
<path d="M0 340 Q200 330 400 344 Q600 356 800 342 Q1000 330 1200 344 V366 Q1000 354 800 364 Q600 376 400 366 Q200 354 0 362z" fill="#C9B888" opacity=".55"/>
{tents}
<g fill="#4A3A28" opacity=".8"><ellipse cx="600" cy="330" rx="22" ry="8"/><ellipse cx="640" cy="336" rx="14" ry="6"/><ellipse cx="560" cy="338" rx="12" ry="5"/></g>
<path d="M0 386 Q300 376 600 384 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(10, body, defs)


# ───────────────────────── 11  The History Books and the Ancient Near East: a river valley of cities ─────────────────────────
def _b11():
    p = "bb11-"
    defs = (
        _lin(p+"sky", [(0, "#8AB0D2", None), (.6, "#E0C8A8", None), (1, "#F0B478", None)])
        + _lin(p+"far", [(0, "#C0A890", None), (1, "#8A7060", None)])
        + _lin(p+"zig", [(0, "#C9A878", None), (1, "#8A6A40", None)])
        + _lin(p+"wall", [(0, "#E8D8B8", None), (1, "#B8A078", None)])
        + _lin(p+"river", [(0, "#A8C8D8", None), (1, "#4F7C94", None)])
        + _lin(p+"ground", [(0, "#C9B078", None), (1, "#8A7A44", None)])
        + _lin(p+"fg", [(0, "#6E6A38", None), (1, "#3A3A1C", None)])
    )
    steps = "".join(f'<rect x="{110 + i*14}" y="{250 - i*16}" width="{200 - i*28}" height="16" fill="url(#{p}zig)"/>' for i in range(6))
    stair = "".join(f'<rect x="{204}" y="{250 - i*16}" width="12" height="16" fill="#6E5238" opacity=".6"/>' for i in range(6))
    merlons = "".join(f'<rect x="{x}" y="200" width="12" height="10" fill="#B8A078"/>' for x in range(470, 700, 24))
    cols = "".join(f'<rect x="{x}" y="196" width="12" height="54" fill="#F0E4C8"/><rect x="{x-3}" y="192" width="18" height="6" fill="#E4D6B8"/>' for x in range(840, 1000, 32))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="1040" cy="110" r="30" fill="#FFF3C4" opacity=".9"/>
<path d="M0 240 Q200 200 400 230 Q600 196 800 226 Q1000 200 1200 232 V300 H0z" fill="url(#{p}far)"/>
{steps}{stair}<rect x="176" y="146" width="40" height="24" fill="#B08A56"/>
<rect x="460" y="210" width="250" height="40" fill="url(#{p}wall)"/>{merlons}
<rect x="450" y="186" width="30" height="64" fill="#D9C9A8"/><rect x="690" y="186" width="30" height="64" fill="#D9C9A8"/>
<g fill="#E4D6B8"><rect x="500" y="180" width="30" height="30"/><rect x="540" y="168" width="44" height="42"/><rect x="596" y="172" width="34" height="38"/><rect x="640" y="184" width="36" height="26"/></g>
<path d="M572 250 v-22 a12 12 0 0 1 24 0 v22z" fill="#4A3A20"/>
<rect x="820" y="250" width="200" height="8" fill="#D9C9A8"/><rect x="826" y="186" width="188" height="10" fill="#D9C9A8"/><path d="M826 186 L920 150 L1014 186z" fill="#E4D6B8"/>{cols}
{_palm(300, 262, 1.1, -4)}{_palm(760, 268, .9, 5)}{_palm(1100, 262, 1.2, -3)}{_palm(1150, 270, .8, 6)}
<path d="M0 260 Q300 250 600 262 T1200 256 V420 H0z" fill="url(#{p}ground)"/>
<path d="M0 320 Q300 300 600 322 T1200 312 V360 Q900 346 600 362 T0 352z" fill="url(#{p}river)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".5"><path d="M140 338 h70 M400 348 h60 M700 340 h80 M1000 334 h60"/></g>
<path d="M0 280 Q300 292 600 276 T1200 288 V296 Q900 282 600 286 T0 290z" fill="#E4D6B8" opacity=".7"/>
<path d="M0 386 Q300 376 600 384 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(11, body, defs)


# ───────────────────────── 12  Poetry and Wisdom: a lyre under the moon ─────────────────────────
def _b12():
    p = "bb12-"
    defs = (
        _lin(p+"sky", [(0, "#0A1440", None), (.6, "#1E2E6A", None), (1, "#3A4A7A", None)])
        + _rad(p+"moon", [(0, "#F6F2E0", 1), (.3, "#E8E4CC", .7), (1, "#E8E4CC", 0)])
        + _lin(p+"hill", [(0, "#2E4A3A", None), (1, "#182A20", None)])
        + _lin(p+"wall", [(0, "#8A8A7A", None), (1, "#4A4A40", None)])
        + _lin(p+"fg", [(0, "#1E2A1C", None), (1, "#0E140C", None)])
    )
    stones = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="26" rx="4" fill="#9A9A8A" opacity=".55"/>' for x, y, w in
                     ((20, 264, 70), (100, 264, 50), (160, 264, 80), (250, 264, 60), (320, 264, 70), (60, 292, 60), (130, 292, 80), (220, 292, 50), (280, 292, 90), (0, 292, 50),
                      (800, 264, 70), (880, 264, 50), (940, 264, 80), (1030, 264, 60), (1100, 264, 70), (840, 292, 60), (910, 292, 80), (1000, 292, 50), (1060, 292, 90), (1160, 292, 40)))
    strings = "".join(f'<path d="M{x} 176 V254" stroke="#F2C964" stroke-width="1.3"/>' for x in range(556, 640, 12))
    cedar = "".join(f'<path d="M{760 - w} {y} h{2*w}" stroke="#2E4A3A" stroke-width="10" stroke-linecap="round"/>' for y, w in ((130, 40), (150, 60), (170, 80), (190, 95), (210, 105)))
    lilies = "".join(f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 v-60" stroke="#5E8A46" stroke-width="3"/><path d="M0 -60 q-20 -10 -24 -34 q14 4 24 18 q10 -14 24 -18 q-4 24 -24 34z" fill="#F4EDE0"/><path d="M0 -60 q-8 -20 0 -34 q8 14 0 34z" fill="#FFFFFF"/><circle cx="0" cy="-70" r="3" fill="#F2C964"/></g>'
                     for x, y, s in ((100, 340, 1), (150, 350, .8), (1040, 344, 1), (1100, 352, .8)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(23, 120, 240, "#EEF0FF", ".85")}
<circle cx="300" cy="110" r="80" fill="url(#{p}moon)"/><circle cx="300" cy="110" r="34" fill="#F6F2E0"/>
<path d="M0 260 Q200 200 420 236 Q600 260 760 226 Q960 190 1200 240 V420 H0z" fill="url(#{p}hill)"/>
<path d="M760 240 v-130" stroke="#3A2A1A" stroke-width="8"/>{cedar}
<rect x="0" y="260" width="380" height="60" fill="url(#{p}wall)"/><rect x="800" y="260" width="400" height="60" fill="url(#{p}wall)"/>{stones}
<rect x="380" y="270" width="420" height="50" fill="url(#{p}wall)"/><rect x="380" y="266" width="420" height="6" fill="#9A9A8A" opacity=".7"/>
<g><path d="M540 270 q-20 -60 10 -100 q26 -30 60 -20 q30 10 40 50 q6 30 -10 70z" fill="#8A6A40"/><path d="M552 268 q-16 -56 12 -92 q22 -26 52 -18 q26 10 34 46 q4 26 -8 64z" fill="#5A3E2A"/><path d="M556 176 h84" stroke="#B08A56" stroke-width="6" stroke-linecap="round"/>{strings}</g>
<g transform="translate(860 300)"><path d="M0 0 q40 -50 90 -70" stroke="#5A3E2A" stroke-width="4" fill="none"/><g fill="#5E8A46"><ellipse cx="30" cy="-36" rx="14" ry="6" transform="rotate(-40 30 -36)"/><ellipse cx="56" cy="-52" rx="14" ry="6" transform="rotate(-30 56 -52)"/><ellipse cx="40" cy="-20" rx="12" ry="5" transform="rotate(-50 40 -20)"/></g><circle cx="90" cy="-62" r="16" fill="#A8323A"/><path d="M84 -78 l4 -6 l4 6 l4 -6 l4 6" stroke="#7E1F26" stroke-width="2" fill="none"/></g>
{lilies}
<path d="M0 384 Q300 372 600 382 T1200 376 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(12, body, defs)


# ───────────────────────── 13  The New Testament in Its World: a Roman road to the harbour ─────────────────────────
def _b13():
    p = "bb13-"
    defs = (
        _lin(p+"sky", [(0, "#7FB4DC", None), (.55, "#CFE3EE", None), (1, "#F6E8C4", None)])
        + _lin(p+"hill", [(0, "#B8B088", None), (1, "#7A7A5A", None)])
        + _lin(p+"sea", [(0, "#8FC0D4", None), (1, "#3E7C98", None)])
        + _lin(p+"road", [(0, "#C9C0A8", None), (1, "#8A8470", None)])
        + _lin(p+"aq", [(0, "#E4D6B8", None), (1, "#A89870", None)])
        + _lin(p+"fg", [(0, "#6A6A48", None), (1, "#2E2E1C", None)])
    )
    arches = "".join(f'<path d="M{x} 250 v-50 a24 24 0 0 1 48 0 v50z" fill="#7FB4DC" opacity=".8"/>' for x in range(110, 480, 60))
    arches_bg = "".join(f'<path d="M{x} 200 v-30 a16 16 0 0 1 32 0 v30z" fill="#9AC0D8" opacity=".8"/>' for x in range(122, 470, 60))
    stones = "".join(f'<path d="M{x} {y} l{w} 0 l-6 22 l-{w} 0z" fill="#B8B098" opacity=".55"/>' for x, y, w in
                     ((560, 300, 40), (610, 300, 50), (670, 300, 40), (520, 326, 60), (590, 326, 46), (646, 326, 60), (480, 352, 70), (560, 352, 50), (620, 352, 70)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#FFFFFF" opacity=".6"><ellipse cx="240" cy="70" rx="110" ry="12"/><ellipse cx="300" cy="62" rx="50" ry="16"/><ellipse cx="880" cy="60" rx="90" ry="9"/></g>
<path d="M0 250 Q200 170 420 214 Q600 240 800 210 Q1000 170 1200 230 V300 H0z" fill="url(#{p}hill)"/>
<rect x="100" y="150" width="420" height="16" fill="url(#{p}aq)"/><rect x="100" y="166" width="420" height="34" fill="url(#{p}aq)"/>{arches_bg}<rect x="100" y="200" width="420" height="50" fill="url(#{p}aq)"/>{arches}
<path d="M700 260 H1200 V320 H700z" fill="url(#{p}sea)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".5"><path d="M740 284 h60 M900 296 h80 M1080 280 h60"/></g>
<g transform="translate(980 300)"><path d="M-80 0 q80 30 160 0 l-16 -24 h-128z" fill="#6A4A2C"/><path d="M-80 0 q80 14 160 0" stroke="#3A2A1A" stroke-width="3" fill="none"/><path d="M0 -24 v-110" stroke="#5A3E2A" stroke-width="5"/><path d="M-50 -120 h100" stroke="#5A3E2A" stroke-width="4"/><path d="M-46 -116 h92 q-6 50 -46 70 q-40 -20 -46 -70z" fill="#F4EDE0"/><path d="M-46 -116 q46 30 92 0" stroke="#D9C9A8" stroke-width="2" fill="none"/></g>
<rect x="700" y="320" width="500" height="12" fill="#B8B098"/>
<path d="M0 260 Q300 250 700 262 V420 H0z" fill="#9A9A70"/>
<path d="M440 420 L560 260 H680 L760 420z" fill="url(#{p}road)"/>{stones}
<g transform="translate(400 300)"><rect x="0" y="-50" width="26" height="60" rx="6" fill="#D9C9A8"/><rect x="-4" y="6" width="34" height="10" fill="#B8B098"/><g stroke="#8A8470" stroke-width="2"><path d="M6 -36 h14 M6 -28 h14 M6 -20 h10"/></g></g>
{_tree(120, 300, 1.0, leaf="#6A8A5A", leaf2="#8AA070")}{_tree(280, 296, .8, leaf="#6A8A5A", leaf2="#8AA070")}
<g fill="#5A6A48"><ellipse cx="900" cy="270" rx="34" ry="8"/><ellipse cx="1120" cy="262" rx="30" ry="7"/></g>
<path d="M0 386 Q300 376 600 384 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(13, body, defs)


# ───────────────────────── 14  Close Reading the Torah: a half-built tower and a garden ─────────────────────────
def _b14():
    p = "bb14-"
    defs = (
        _lin(p+"sky", [(0, "#3A4A7A", None), (.5, "#9A8AA8", None), (.85, "#E8B088", None), (1, "#F0C890", None)])
        + _lin(p+"zig", [(0, "#C9A878", None), (1, "#7A5A38", None)])
        + _lin(p+"far", [(0, "#A89880", None), (1, "#6E5E50", None)])
        + _lin(p+"river", [(0, "#A8C8D8", None), (1, "#4F7C94", None)])
        + _lin(p+"grass", [(0, "#8DBD4C", None), (1, "#4E7E2C", None)])
        + _lin(p+"fg", [(0, "#365C22", None), (1, "#1D3414", None)])
    )
    steps = "".join(f'<rect x="{560 + i*22}" y="{250 - i*26}" width="{300 - i*44}" height="26" fill="url(#{p}zig)"/>' for i in range(5))
    scaffold = ("".join(f'<path d="M{x} 250 V{y}" stroke="#5A3E2A" stroke-width="3"/>' for x, y in ((600, 130), (640, 110), (680, 96), (720, 96), (760, 96), (800, 110), (840, 130)))
                + "".join(f'<path d="M600 {y} H840" stroke="#5A3E2A" stroke-width="2" opacity=".8"/>' for y in (150, 190, 230)))
    ramp = '<path d="M860 250 q-40 -60 -80 -100 l6 -4 q44 40 84 104z" fill="#B08A56"/>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(31, 30, 100, "#FFFFFF", ".5")}
<path d="M0 250 Q200 214 400 240 Q600 224 800 236 Q1000 214 1200 240 V300 H0z" fill="url(#{p}far)"/>
{steps}{scaffold}{ramp}
<rect x="648" y="94" width="124" height="12" fill="#5A3E2A" opacity=".5"/><rect x="668" y="86" width="40" height="8" fill="#B08A56"/><rect x="720" y="88" width="30" height="6" fill="#B08A56"/>
<path d="M0 300 Q300 280 600 300 T1200 296 V420 H0z" fill="url(#{p}grass)"/>
<path d="M0 340 Q200 322 400 340 Q600 358 800 340 Q1000 322 1200 340 V366 Q1000 350 800 366 Q600 380 400 366 Q200 350 0 362z" fill="url(#{p}river)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".5"><path d="M140 350 h60 M420 358 h70 M900 348 h60"/></g>
{_tree(200, 300, 1.6, leaf="#4E7A3C", leaf2="#7FAA58")}{_tree(400, 296, 1.3, leaf="#5E8A42", leaf2="#88B060")}
<g fill="#F2C964"><circle cx="184" cy="188" r="5"/><circle cx="222" cy="206" r="5"/><circle cx="196" cy="160" r="5"/></g>
<g fill="#E4573D"><circle cx="388" cy="208" r="4"/><circle cx="420" cy="222" r="4"/><circle cx="404" cy="184" r="4"/></g>
{_tree(1080, 300, 1.0)}{_tree(1160, 306, .7)}
<path d="M0 386 Q300 376 600 384 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(14, body, defs)


# ───────────────────────── 15  Prophets and Poets Close Up: vineyard under a breaking storm ─────────────────────────
def _b15():
    p = "bb15-"
    defs = (
        _lin(p+"sky", [(0, "#3A3E4A", None), (.5, "#6A6E7A", None), (1, "#B8B0A0", None)])
        + _rad(p+"break", [(0, "#FFF3C4", .95), (.35, "#F2C964", .45), (1, "#F2C964", 0)])
        + _lin(p+"hill", [(0, "#8A9A6A", None), (1, "#4E6A3C", None)])
        + _lin(p+"terr", [(0, "#A8B078", None), (1, "#6E7A48", None)])
        + _lin(p+"fg", [(0, "#3E4A2E", None), (1, "#1E2A18", None)])
    )
    clouds = "".join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#4A4E5A" opacity=".85"/>' for x, y, rx, ry in
                     ((100, 60, 160, 28), (300, 40, 140, 24), (520, 70, 120, 22), (900, 50, 180, 30), (1100, 80, 130, 24), (700, 30, 100, 18)))
    rows = "".join(f'<path d="M0 {y} Q300 {y-12} 600 {y} T1200 {y-6}" stroke="#4E6A3C" stroke-width="3" fill="none" opacity=".7"/>' for y in (262, 282, 302))
    vines = "".join(f'<g transform="translate({x} {y})"><path d="M0 0 v-24" stroke="#5A3E2A" stroke-width="3"/><circle cx="-8" cy="-26" r="7" fill="#6E9A50"/><circle cx="8" cy="-28" r="7" fill="#5E8A46"/><circle cx="0" cy="-36" r="7" fill="#7FAA58"/><circle cx="2" cy="-16" r="4" fill="#4A3A8C"/><circle cx="-4" cy="-12" r="3" fill="#4A3A8C"/></g>'
                    for x, y in [(x, 262 - 6 * ((x // 60) % 2)) for x in range(40, 1200, 60)] + [(x, 282 + 4 * ((x // 60) % 2)) for x in range(70, 1200, 60)] + [(x, 302 - 4 * ((x // 60) % 2)) for x in range(40, 1200, 60)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{clouds}
<ellipse cx="760" cy="120" rx="180" ry="120" fill="url(#{p}break)"/>
<g stroke="#FFF3C4" stroke-width="2" opacity=".35"><path d="M700 120 L640 260 M760 130 L760 260 M820 120 L880 260"/></g>
<path d="M1020 210 q-24 -40 6 -80 q-30 30 -20 60 q-14 -30 4 -60 q-24 26 -10 56 q-8 -14 0 -30 q-10 14 -2 40z" fill="#8A8A8A" opacity=".55"/>
<path d="M0 250 Q200 200 420 236 Q600 260 800 220 Q1000 190 1200 240 V420 H0z" fill="url(#{p}hill)"/>
<path d="M0 262 Q300 250 600 262 T1200 256 V420 H0z" fill="url(#{p}terr)"/>
{rows}{vines}
<g><path d="M300 320 v-120" stroke="#5A3E2A" stroke-width="8" stroke-linecap="round"/><path d="M300 200 h60" stroke="#5A3E2A" stroke-width="6" stroke-linecap="round"/><path d="M356 204 V300" stroke="#F2C964" stroke-width="1.5"/><path d="M350 300 h12 l-6 16z" fill="#8A8470"/></g>
<g transform="translate(940 320)"><path d="M0 0 q-10 -40 -30 -60 q-20 -20 -50 -24" stroke="#5A4A3A" stroke-width="9" fill="none" stroke-linecap="round"/><g fill="#8AA070"><ellipse cx="-90" cy="-90" rx="36" ry="16" transform="rotate(-20 -90 -90)"/><ellipse cx="-120" cy="-70" rx="26" ry="12" transform="rotate(-24 -120 -70)"/><ellipse cx="-60" cy="-100" rx="24" ry="12" transform="rotate(-16 -60 -100)"/></g></g>
<path d="M0 386 Q300 376 600 384 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(15, body, defs)


# ───────────────────────── 16  Reading the Gospels Closely: a hillside at dawn ─────────────────────────
def _b16():
    p = "bb16-"
    defs = (
        _lin(p+"sky", [(0, "#6A8AC0", None), (.5, "#C8D4E8", None), (.8, "#F6DDB0", None), (1, "#F0B478", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.3, "#FFE08A", .6), (1, "#FFE08A", 0)])
        + _lin(p+"far", [(0, "#B8A898", None), (1, "#8A7A6A", None)])
        + _lin(p+"hill", [(0, "#A8C870", None), (1, "#5E8A3E", None)])
        + _rad(p+"lamp", [(0, "#FFF3C4", .9), (.4, "#FFD46A", .35), (1, "#FFD46A", 0)])
        + _lin(p+"fg", [(0, "#365C22", None), (1, "#1D3414", None)])
    )
    houses = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>' for x, y, w, h, c in
                     ((960, 176, 30, 26, "#E4D6B8"), (994, 166, 40, 36, "#F0E4C8"), (1040, 172, 30, 30, "#D9C9A8"), (1074, 160, 46, 42, "#E4D6B8"), (1124, 178, 30, 24, "#F0E4C8"), (1052, 152, 16, 20, "#D9C9A8")))
    lilies = "".join(f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 v-50" stroke="#5E8A46" stroke-width="3"/><path d="M0 -50 q-18 -8 -22 -30 q12 4 22 16 q10 -12 22 -16 q-4 22 -22 30z" fill="#F4EDE0"/><path d="M0 -50 q-7 -18 0 -30 q7 12 0 30z" fill="#FFFFFF"/><circle cx="0" cy="-58" r="3" fill="#F2C964"/></g>'
                     for x, y, s in ((80, 330, 1), (130, 344, .8), (180, 334, .9), (240, 348, .7), (1000, 336, 1), (1060, 348, .8), (1120, 338, .9), (1170, 350, .7)))
    birds = "".join(f'<path d="M{x} {y} q6 -8 12 0 q-6 -3 -12 0z M{x+2} {y} q4 -5 8 0" fill="#3A2A1A"/>' for x, y in ((700, 120), (730, 110), (760, 128), (690, 150)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="900" cy="230" r="150" fill="url(#{p}sun)"/><circle cx="900" cy="230" r="36" fill="#FFF6D0"/>
<g fill="#FFFFFF" opacity=".55"><ellipse cx="240" cy="80" rx="120" ry="12"/><ellipse cx="300" cy="70" rx="50" ry="16"/></g>
<path d="M0 260 Q200 216 400 240 Q600 258 800 236 Q1000 200 1200 240 V300 H0z" fill="url(#{p}far)"/>
<path d="M900 240 Q1000 170 1100 160 Q1160 160 1200 200 V240z" fill="#A89880"/>{houses}<rect x="950" y="202" width="210" height="8" fill="#B8A078"/>
<path d="M0 300 Q200 240 420 262 Q600 280 800 270 Q1000 262 1200 290 V420 H0z" fill="url(#{p}hill)"/>
<g transform="translate(720 280)"><path d="M0 0 q-2 -50 4 -100 q2 -20 8 -40" stroke="#5A3E2A" stroke-width="6" fill="none" stroke-linecap="round"/><g fill="#6E9A50"><ellipse cx="-30" cy="-60" rx="26" ry="14" transform="rotate(-20 -30 -60)"/><ellipse cx="34" cy="-70" rx="26" ry="14" transform="rotate(20 34 -70)"/><ellipse cx="-24" cy="-100" rx="22" ry="12" transform="rotate(-24 -24 -100)"/><ellipse cx="36" cy="-110" rx="22" ry="12" transform="rotate(24 36 -110)"/><ellipse cx="6" cy="-134" rx="16" ry="10"/></g><g fill="#F2C964"><circle cx="-40" cy="-78" r="4"/><circle cx="44" cy="-90" r="4"/><circle cx="8" cy="-146" r="4"/><circle cx="-30" cy="-116" r="4"/></g></g>
{birds}
<g transform="translate(440 300)"><rect x="-70" y="-14" width="140" height="18" rx="6" fill="#8A8470"/><rect x="-6" y="-70" width="12" height="56" fill="#6A6A58"/><rect x="-24" y="-78" width="48" height="10" rx="3" fill="#6A6A58"/><ellipse cx="0" cy="-92" rx="70" ry="30" fill="url(#{p}lamp)"/><path d="M-26 -84 q26 -16 52 0 q-6 10 -26 10 q-20 0 -26 -10z" fill="#B08A56"/><path d="M24 -86 q10 -4 12 4" stroke="#8A6A40" stroke-width="3" fill="none"/><path d="M-3 -92 q3 -12 6 0 q-3 5 -6 0z" fill="#FFD46A"/></g>
{lilies}
<path d="M0 386 Q300 376 600 384 T1200 378 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(16, body, defs)


# ───────────────────────── 17  Paul, Interpretation and the Making of the Canon: the scriptorium ─────────────────────────
def _b17():
    p = "bb17-"
    defs = (
        _lin(p+"wall", [(0, "#E4D8C4", None), (1, "#C4B49A", None)])
        + _lin(p+"sky", [(0, "#7FB4DC", None), (.7, "#CFE3EE", None), (1, "#F6E8C4", None)])
        + _lin(p+"sea", [(0, "#8FC0D4", None), (1, "#3E7C98", None)])
        + _lin(p+"desk", [(0, "#B08A56", None), (.5, "#8A6A40", None), (1, "#5A3E2A", None)])
        + _rad(p+"lamp", [(0, "#FFF3C4", .95), (.4, "#FFD46A", .35), (1, "#FFD46A", 0)])
        + _lin(p+"page", [(0, "#F7EEDC", None), (1, "#E4D6B8", None)])
    )
    lines_l = "".join(f'<path d="M{x} {y} h{w}" stroke="#8A7A60" stroke-width="2" opacity=".55"/>' for x, y, w in
                      ((420, 280, 90), (420, 292, 110), (420, 304, 80), (420, 316, 120), (420, 328, 100)))
    lines_r = "".join(f'<path d="M{x} {y} h{w}" stroke="#8A7A60" stroke-width="2" opacity=".55"/>' for x, y, w in
                      ((560, 280, 110), (560, 292, 90), (560, 304, 120), (560, 316, 80), (560, 328, 110)))
    frag = "".join(f'<g transform="translate({x} {y}) rotate({r})"><path d="M0 0 h70 l-6 40 l-50 6 l-14 -20z" fill="#E8DCC0"/><g stroke="#8A7A60" stroke-width="1.5" opacity=".5"><path d="M8 10 h48 M8 20 h40 M8 30 h44"/></g></g>'
                    for x, y, r in ((160, 256, -8), (240, 262, 6), (740, 254, -5), (800, 268, 9)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="880" y="40" width="260" height="210" fill="url(#{p}sky)"/>
<path d="M880 190 H1140 V250 H880z" fill="url(#{p}sea)"/>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".5"><path d="M900 210 h50 M1000 226 h60 M1080 206 h40"/></g>
<g transform="translate(1040 214)"><path d="M-36 0 q36 12 72 0 l-8 -12 h-56z" fill="#6A4A2C"/><path d="M0 -12 v-50" stroke="#5A3E2A" stroke-width="3"/><path d="M-24 -56 h48 q-4 24 -24 34 q-20 -10 -24 -34z" fill="#F4EDE0"/></g>
<rect x="900" y="60" width="26" height="190" fill="#F0E4C8"/><rect x="894" y="54" width="38" height="10" fill="#E4D6B8"/><rect x="894" y="244" width="38" height="8" fill="#E4D6B8"/>
<g fill="#8A6A40"><rect x="870" y="30" width="280" height="12"/><rect x="870" y="250" width="280" height="12"/><rect x="870" y="30" width="12" height="232"/><rect x="1138" y="30" width="12" height="232"/></g>
<rect x="0" y="262" width="1200" height="34" fill="url(#{p}desk)"/><rect x="0" y="262" width="1200" height="4" fill="#D6B586"/>
<path d="M0 296 H1200 V420 H0z" fill="#3A2A1A"/>
<ellipse cx="90" cy="262" rx="80" ry="24" fill="url(#{p}lamp)"/>
<g transform="translate(90 254)"><path d="M-30 0 q30 -18 60 0 q-8 12 -30 12 q-22 0 -30 -12z" fill="#B08A56"/><path d="M28 -2 q10 -4 12 6" stroke="#8A6A40" stroke-width="3" fill="none"/><path d="M-4 -10 q4 -14 8 0 q-4 6 -8 0z" fill="#FFD46A"/></g>
{frag}
<g transform="translate(400 262)"><path d="M0 12 q-6 40 0 80 h300 q6 -40 0 -80z" fill="#5A3E2A"/><path d="M8 8 q-4 40 0 76 h138 q-2 -38 0 -76z" fill="url(#{p}page)"/><path d="M154 8 q-2 38 0 76 h138 q4 -36 0 -76z" fill="url(#{p}page)"/><path d="M150 8 v78" stroke="#C9B888" stroke-width="3"/><g fill="#A8323A" opacity=".8"><rect x="20" y="16" width="30" height="4"/><rect x="160" y="16" width="30" height="4"/></g></g>
{lines_l}{lines_r}
<g transform="translate(620 232)"><ellipse cx="0" cy="26" rx="20" ry="8" fill="#2A2A3A"/><rect x="-18" y="8" width="36" height="20" rx="4" fill="#4A3A5A"/><rect x="-12" y="4" width="24" height="6" rx="2" fill="#2A2A3A"/><path d="M6 6 l40 -46" stroke="#B8A078" stroke-width="4" stroke-linecap="round"/></g>
<g transform="translate(700 232)"><rect x="0" y="0" width="120" height="30" rx="4" fill="#7A5230"/><rect x="8" y="6" width="104" height="18" rx="2" fill="#2A2A3A"/><g stroke="#8A8A7A" stroke-width="1.5" opacity=".7"><path d="M16 12 h60 M16 18 h40"/></g></g>
<g transform="translate(1080 262)"><rect x="-60" y="-10" width="120" height="14" rx="2" fill="#F7EEDC"/><rect x="-60" y="-22" width="112" height="12" rx="2" fill="#E8DCC0"/><rect x="-60" y="-34" width="116" height="12" rx="2" fill="#F7EEDC"/></g>
'''
    return _wrap(17, body, defs)


# ───────────────────────── 18  The Bible in Culture and Capstone: the reading room ─────────────────────────
def _b18():
    p = "bb18-"
    defs = (
        _lin(p+"wall", [(0, "#DCD2C0", None), (1, "#B8AC98", None)])
        + _lin(p+"wood", [(0, "#8A6A40", None), (.5, "#6A4A2C", None), (1, "#3A2A1A", None)])
        + _lin(p+"floor", [(0, "#8A6A40", None), (1, "#3A2A1A", None)])
        + _rad(p+"light", [(0, "#FFF6D0", .5), (1, "#FFF6D0", 0)])
    )
    # a tall arched window of calm coloured panes: no picture in it, just a grid of glass
    pane_cols = ("#7FAAD2", "#A8C4E0", "#F2C964", "#C9B078", "#8AA070", "#B8457A", "#7A6AB8", "#E4D6B8", "#5F9CB4", "#F0923A", "#A8323A", "#6E9A50")
    panes = []
    k = 0
    for row in range(6):
        for col in range(4):
            x, y = 500 + col * 50, 90 + row * 34
            c = pane_cols[(k * 7 + row) % len(pane_cols)]
            panes.append(f'<rect x="{x}" y="{y}" width="46" height="30" fill="{c}" opacity=".85"/>')
            k += 1
    arch = "".join(f'<path d="M{500 + i*50} 90 a{23} {23} 0 0 1 46 0z" fill="{pane_cols[(i*5+2) % len(pane_cols)]}" opacity=".85"/>' for i in range(4))
    lead = ("".join(f'<path d="M{500 + col*50} 60 V294" stroke="#2A2A2A" stroke-width="3"/>' for col in range(5))
            + "".join(f'<path d="M500 {90 + row*34} H700" stroke="#2A2A2A" stroke-width="3"/>' for row in range(7)))
    def books(x0, y, seq):
        out, x = [], x0
        for h, w, c in seq:
            out.append(f'<rect x="{x}" y="{y-h}" width="{w}" height="{h}" rx="2" fill="{c}"/><rect x="{x+3}" y="{y-h+7}" width="{w-6}" height="3" fill="#F2C964" opacity=".7"/>')
            x += w + 3
        return "".join(out)
    seqA = ((70, 18, "#A8323A"), (80, 22, "#2E5A88"), (64, 16, "#6E7C22"), (84, 26, "#7A5230"), (74, 18, "#3F4AA6"), (68, 16, "#B87A12"), (82, 24, "#5E8A46"), (72, 18, "#8A3A5A"), (78, 20, "#2E6A88"), (66, 16, "#A8323A"), (84, 26, "#4A3A8C"), (74, 18, "#7A5230"))
    seqB = ((78, 22, "#4A3A8C"), (66, 16, "#B87A12"), (84, 26, "#2E5A88"), (70, 18, "#A8323A"), (80, 22, "#5E8A46"), (64, 16, "#7A5230"), (82, 24, "#3F4AA6"), (72, 18, "#6E7C22"), (76, 20, "#8A3A5A"), (68, 16, "#2E6A88"), (84, 26, "#A8323A"), (70, 18, "#5E8A46"))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g fill="url(#{p}wood)"><rect x="60" y="60" width="380" height="12"/><rect x="60" y="150" width="380" height="12"/><rect x="60" y="240" width="380" height="12"/><rect x="60" y="60" width="12" height="192"/><rect x="428" y="60" width="12" height="192"/></g>
<rect x="72" y="72" width="356" height="168" fill="#3A2A1A" opacity=".22"/>
{books(80, 150, seqA)}{books(80, 240, seqB)}
<g fill="url(#{p}wood)"><rect x="760" y="60" width="380" height="12"/><rect x="760" y="150" width="380" height="12"/><rect x="760" y="240" width="380" height="12"/><rect x="760" y="60" width="12" height="192"/><rect x="1128" y="60" width="12" height="192"/></g>
<rect x="772" y="72" width="356" height="168" fill="#3A2A1A" opacity=".22"/>
{books(780, 150, seqB)}{books(780, 240, seqA)}
<path d="M480 300 V90 a120 120 0 0 1 240 0 V300z" fill="#2A2A2A"/>
<path d="M500 294 V90 a100 100 0 0 1 200 0 V294z" fill="#E4D6B8"/>
{"".join(panes)}{arch}{lead}
<path d="M600 -10 a100 100 0 0 1 100 100 H500 a100 100 0 0 1 100 -100z" fill="#7FAAD2" opacity=".85"/>
<g stroke="#2A2A2A" stroke-width="3" fill="none"><path d="M500 90 a100 100 0 0 1 200 0"/><path d="M600 90 v-96"/><path d="M530 90 q10 -40 40 -60 M670 90 q-10 -40 -40 -60"/></g>
<ellipse cx="600" cy="330" rx="200" ry="40" fill="url(#{p}light)"/>
<rect x="0" y="300" width="1200" height="120" fill="url(#{p}floor)"/><rect x="0" y="300" width="1200" height="4" fill="#B08A56"/>
<g transform="translate(600 300)"><path d="M-10 0 v-60" stroke="#5A3E2A" stroke-width="10"/><path d="M-50 -60 h80 l-6 -30 h-68z" fill="#8A6A40"/><path d="M-44 -66 h32 l-4 -18 h-26z" fill="#F7EEDC"/><path d="M-10 -66 h32 l-2 -18 h-26z" fill="#F7EEDC"/><path d="M-30 0 h40" stroke="#5A3E2A" stroke-width="6" stroke-linecap="round"/></g>
<g transform="translate(240 300)"><rect x="-70" y="-10" width="140" height="10" fill="#5A3E2A"/><rect x="-60" y="-100" width="12" height="90" fill="#4A3A2A"/><rect x="48" y="-100" width="12" height="90" fill="#4A3A2A"/><rect x="-64" y="-108" width="128" height="10" fill="#4A3A2A"/><rect x="-40" y="-92" width="80" height="12" fill="#6A5A48"/><rect x="-6" y="-80" width="12" height="30" fill="#3A2A1A"/><rect x="-46" y="-50" width="92" height="10" fill="#8A6A40"/><rect x="-36" y="-44" width="72" height="8" fill="#F7EEDC"/><path d="M64 -70 q20 -6 24 10" stroke="#3A2A1A" stroke-width="4" fill="none"/></g>
<g transform="translate(960 300)"><ellipse cx="0" cy="-8" rx="40" ry="8" fill="#5A3E2A"/><path d="M0 -8 v-20" stroke="#5A3E2A" stroke-width="6"/><circle cx="0" cy="-70" r="44" fill="#7FAAD2"/><path d="M-30 -96 q20 -10 40 4 q-10 14 -30 10z M-40 -60 q30 -14 40 8 q-20 12 -40 -8z M6 -46 q26 -4 34 -20 q-6 24 -34 20z" fill="#8AA070"/><path d="M-30 -104 a44 44 0 0 1 0 68" stroke="#5A3E2A" stroke-width="4" fill="none"/><path d="M0 -114 v88" stroke="#5A3E2A" stroke-width="3" opacity=".6"/></g>
'''
    return _wrap(18, body, defs)


_BUILDERS = {10: _b10, 11: _b11, 12: _b12, 13: _b13, 14: _b14, 15: _b15, 16: _b16, 17: _b17, 18: _b18}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (10..18)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    from xml.dom import minidom
    for n in sorted(BANNERS):
        minidom.parseString(BANNERS[n])
        assert "--" not in BANNERS[n], "double minus in banner %d" % n
        print(n, len(BANNERS[n].encode("utf-8")), "bytes", "ok")
