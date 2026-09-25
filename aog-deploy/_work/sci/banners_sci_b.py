"""Unit banners for the Science K-12 course, units 15-27 (grades 6-12).

Thirteen drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_sci_b import BANNERS, CREDITS, banner
    banner(21)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"sb{n}-" so all 27 course banners can sit on one contents page.  No text,
no images, no filters, no external references.  Gradients and paths only.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm (floors, water, ground,
bench fronts) and the action sits in the upper 55%.
"""

import math

W, H = 1200, 420

CREDITS = {
    15: "Drawn scene: a total solar eclipse with a white corona over a southern Illinois field, a crowd looking up, a river bend, and volcano and plate layers hinted in the ground",
    16: "Drawn scene: a greenhouse interior at dawn with rows of plants, sun shafts through the glass, a jar holding a mint sprig and a candle, and a mitochondrion poster on the wall",
    17: "Drawn scene: a DNA double helix rising like a spiral staircase from a fossil cliff of rock strata holding a fish with legs, under a faint X-ray diffraction ring pattern",
    18: "Drawn scene: a restored prairie at dusk with bison silhouettes, wind-bent grass, a controlled burn line glowing on the horizon, and a tiny far city skyline",
    19: "Drawn scene: a lab at night with a periodic-table wall of colored tiles, a row of flame tests in red, orange, green and violet, and glassware on the bench",
    20: "Drawn scene: a crash-test sled and dummy mid-impact against a striped barrier under strobe lights, with a coil and magnet on a bench and a standing wave on a string",
    21: "Drawn scene: an observatory dome open to a starry sky with the Milky Way and a spiral galaxy, the Great Lakes outlined as a lit map on the ground",
    22: "Drawn scene: a row of colored test flames and a spectroscope throwing a rainbow of bright lines onto a dark wall, with a Bohr-style atom model glowing as a lamp",
    23: "Drawn scene: a titration setup with a burette and a flask turning pink, a balance, gas cylinders, and an airbag cross-section silhouette on a white bench",
    24: "Drawn scene: Galileo's inclined plane with a rolling ball and marked intervals, a pendulum, and a rocket capsule arcing over the Moon in an indigo sky",
    25: "Drawn scene: Young's double slit, a red beam through two slits making bright and dark violet bands on a screen, a Tesla-coil spark, and a turntable cartridge close-up",
    26: "Drawn scene: the Mississippi delta from above at sunset with a dead-zone tint in the Gulf, wind turbines and solar panels on a levee, and a heron in flight",
    27: "Drawn scene: a lecture hall board with a bar graph and trend line, John Snow's pump and cholera map in silhouette, a magnifying glass and a notebook on the desk",
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
    """Small standing silhouette, feet at (x, y), looking up (head tilted back)."""
    r = w * 0.42
    return (f'<path d="M{x-w/2:.0f} {y} v-{h*0.62:.0f} q0 -5 {w/2:.0f} -6 q{w/2:.0f} 1 {w/2:.0f} 6 v{h*0.62:.0f}z"/>'
            f'<circle cx="{x+1.5:.0f}" cy="{y-h*0.62-r-1:.0f}" r="{r:.1f}"/>')


# ───────────────────────── 15  Earth & Space Systems: eclipse over a field ─────────────────────────
def _b15():
    p = "sb15-"
    defs = (
        _lin(p+"sky", [(0, "#0B0820", None), (.35, "#2A1A4E", None), (.62, "#5B3A78", None), (.8, "#9A5C6E", None), (.9, "#C98A5A", None)])
        + _rad(p+"cor", [(0, "#FFFFFF", 1), (.18, "#F4EEFF", .85), (.4, "#C9B8F0", .35), (.7, "#8A70C8", .08), (1, "#8A70C8", 0)])
        + _lin(p+"far", [(0, "#4B3466", None), (1, "#2C1F44", None)])
        + _lin(p+"field", [(0, "#4A3A55", None), (1, "#2A1F38", None)])
        + _lin(p+"river", [(0, "#D8A090", .9), (1, "#5A3F66", .9)])
        + _lin(p+"ground", [(0, "#241C30", None), (.5, "#1A1424", None), (1, "#0F0B18", None)])
        + _rad(p+"magma", [(0, "#F0703A", .55), (.5, "#B03A2A", .25), (1, "#B03A2A", 0)], .5, .8, .5)
    )
    # corona streamers
    streams = []
    for i in range(14):
        a = i * math.pi * 2 / 14 + .2
        L = 92 if i % 2 else 66
        x1, y1 = 600 + math.cos(a) * 40, 122 + math.sin(a) * 40
        x2, y2 = 600 + math.cos(a) * L, 122 + math.sin(a) * L
        streams.append(f'<path d="M{x1:.0f} {y1:.0f} L{x2:.0f} {y2:.0f}"/>')
    rows = "".join(f'<path d="M{x} 254 L{x + (x-600)//5} 296"/>' for x in range(360, 1200, 30))
    crowd = "".join(_person(x, 314 + (x % 5), 24 + (x % 3) * 3) for x in range(150, 470, 23))
    crowd2 = "".join(_person(x, 320 + (x % 4), 20 + (x % 3) * 2, 7) for x in range(720, 1060, 26))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(15, 45, 200, "#EDE6FF", ".7")}
<circle cx="600" cy="122" r="200" fill="url(#{p}cor)"/>
<g stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".55">{"".join(streams)}</g>
<circle cx="600" cy="122" r="44" fill="#FFFFFF" opacity=".95"/>
<circle cx="600" cy="122" r="36" fill="#120D22"/>
<circle cx="600" cy="122" r="37" fill="none" stroke="#FFF4E0" stroke-width="1.5" opacity=".9"/>
<g fill="#3A2555" opacity=".5"><ellipse cx="200" cy="150" rx="170" ry="8"/><ellipse cx="1000" cy="130" rx="200" ry="9"/><ellipse cx="300" cy="196" rx="120" ry="5"/></g>
<path d="M0 232 Q160 218 320 228 T680 226 T1000 222 T1200 230 V260 H0z" fill="url(#{p}far)"/>
<g fill="#2C1F44"><path d="M40 232 q-8 -18 0 -30 q8 12 0 30z M64 232 q-7 -14 0 -26 q7 12 0 26z M1120 230 q-9 -18 0 -32 q9 14 0 32z M1148 230 q-7 -14 0 -26 q7 12 0 26z M900 226 q-6 -12 0 -22 q6 10 0 22z"/></g>
<path d="M0 252 H1200 V310 H0z" fill="url(#{p}field)"/>
<g stroke="#5C4A6C" stroke-width="1.2" opacity=".5">{rows}</g>
<path d="M0 254 Q120 262 180 276 T330 288 T500 296 T560 320 T480 340 T420 360 V420 H0 V340 Q60 320 80 300 T0 280z" fill="url(#{p}river)"/>
<path d="M0 262 Q120 268 180 282 T330 294 T500 302 T552 322" stroke="#F0C8B8" stroke-width="1" fill="none" opacity=".45"/>
<path d="M0 312 Q300 300 600 306 T1200 304 V420 H0z" fill="url(#{p}ground)"/>
<g fill="#0E0A18">{crowd}{crowd2}</g>
<g fill="#0E0A18"><path d="M560 322 h60 l-6 -22 h-48z"/><path d="M582 300 h16 v-10 h-16z"/><rect x="588" y="282" width="4" height="10"/></g>
<g stroke="#3A2C4C" stroke-width="1.2" fill="none" opacity=".7"><path d="M0 346 Q300 340 600 344 T1200 342"/><path d="M0 366 Q300 358 600 364 T1200 360"/><path d="M0 386 Q300 380 600 386 T1200 382"/></g>
<path d="M300 420 Q460 380 640 372 Q820 366 900 420z" fill="url(#{p}magma)"/>
<path d="M0 404 Q200 396 420 386 Q560 380 620 420 H0z" fill="#3A2A44" opacity=".35"/>
<path d="M1200 400 Q1000 392 800 382 Q700 378 640 420 H1200z" fill="#3A2A44" opacity=".35"/>
<path d="M596 340 l34 -40 l34 40z" fill="#1A1424"/><path d="M604 340 l26 -30 l26 30z" fill="#2A1F38"/>
<path d="M626 306 q4 -14 8 0z" fill="#F0703A" opacity=".7"/>
'''
    return _wrap(15, body, defs)


# ───────────────────────── 16  Biology: greenhouse at dawn ─────────────────────────
def _b16():
    p = "sb16-"
    defs = (
        _lin(p+"sky", [(0, "#8FB6C8", None), (.4, "#CFE0C8", None), (.75, "#F2E1A6", None), (1, "#F7EDC9", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.3, "#FFE39A", .6), (1, "#FFE39A", 0)])
        + _lin(p+"shaft", [(0, "#FFF2C4", .5), (1, "#FFF2C4", 0)])
        + _lin(p+"wall", [(0, "#2E4A3A", None), (1, "#1C3028", None)])
        + _lin(p+"floor", [(0, "#2B3A30", None), (.4, "#1C2A22", None), (1, "#0F1A15", None)])
        + _lin(p+"leaf", [(0, "#7FBF5A", None), (1, "#2F6B3A", None)])
        + _lin(p+"bench", [(0, "#6B5A3E", None), (1, "#3B3122", None)])
        + _lin(p+"jar", [(0, "#BFE0F0", .55), (.5, "#8CC4DC", .35), (1, "#5A93AE", .5)])
        + _rad(p+"flame", [(0, "#FFF2B0", 1), (.4, "#FFB040", .8), (1, "#FF7A20", 0)])
    )
    rafters = "".join(f'<path d="M{x} 40 L{x} 170"/>' for x in range(60, 1200, 90))
    # left bench rows (perspective), plants as tufts
    def tufts(y, x0, x1, step, s):
        out = []
        for x in range(x0, x1, step):
            out.append(f'<path d="M{x} {y} q-{4*s} -{10*s} -{2*s} -{16*s} q{2*s} {8*s} {2*s} {16*s} q0 -{12*s} {3*s} -{18*s} q{1*s} {10*s} -{1*s} {18*s} q{2*s} -{8*s} {6*s} -{12*s} q-{2*s} {8*s} -{4*s} {12*s}z"/>')
        return "".join(out)
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="880" cy="118" r="150" fill="url(#{p}sun)"/>
<g stroke="#5E7A70" stroke-width="3" opacity=".85">{rafters}<path d="M0 40 H1200 M0 100 H1200 M0 170 H1200"/></g>
<path d="M0 40 L600 6 L1200 40" stroke="#5E7A70" stroke-width="4" fill="none"/>
<path d="M600 6 V170" stroke="#5E7A70" stroke-width="3"/>
<g fill="url(#{p}shaft)"><path d="M700 40 L760 40 L520 330 L420 330z"/><path d="M820 40 L870 40 L700 330 L610 330z"/><path d="M920 40 L950 40 L880 330 L820 330z"/></g>
<path d="M0 170 H1200 V236 H0z" fill="url(#{p}wall)"/>
<g fill="#D9E6D0" opacity=".9"><rect x="120" y="182" width="88" height="48" rx="2"/></g>
<g transform="translate(164 206)"><ellipse rx="34" ry="16" fill="#B85A46"/><ellipse rx="30" ry="12" fill="#E8A070"/><path d="M-22 -10 v20 M-12 -12 v24 M-2 -12 v24 M8 -12 v24 M18 -10 v20" stroke="#B85A46" stroke-width="3" fill="none"/><path d="M-27 -6 v12 M23 -6 v12" stroke="#B85A46" stroke-width="2"/></g>
<g stroke="#5E7A70" stroke-width="2" opacity=".7"><path d="M0 170 V236 M300 170 V236 M600 170 V236 M900 170 V236"/></g>
<path d="M0 236 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M0 264 Q300 250 520 246 L520 258 Q300 262 0 276z" fill="url(#{p}bench)"/>
<path d="M0 290 Q300 276 540 270 L540 284 Q300 290 0 304z" fill="url(#{p}bench)"/>
<path d="M1200 264 Q900 250 680 246 L680 258 Q900 262 1200 276z" fill="url(#{p}bench)"/>
<g fill="url(#{p}leaf)">{tufts(250, 30, 520, 28, 1.0)}{tufts(275, 20, 540, 30, 1.2)}{tufts(250, 690, 1200, 28, 1.0)}</g>
<g fill="#2F6B3A" opacity=".8"><rect x="40" y="248" width="16" height="10" rx="2"/><rect x="96" y="246" width="16" height="10" rx="2"/><rect x="360" y="244" width="16" height="10" rx="2"/><rect x="760" y="245" width="16" height="10" rx="2"/><rect x="1040" y="248" width="16" height="10" rx="2"/></g>
<path d="M560 296 H660 V304 H560z" fill="url(#{p}bench)"/><path d="M566 304 v40 M654 304 v40" stroke="#3B3122" stroke-width="3"/>
<g transform="translate(590 292)">
<path d="M-24 0 V-46 q0 -6 6 -6 h36 q6 0 6 6 V0z" fill="url(#{p}jar)" stroke="#BFE0F0" stroke-width="1.5"/>
<rect x="-26" y="-58" width="52" height="8" rx="2" fill="#8CC4DC" opacity=".7"/>
<path d="M-8 -4 v-26 M-8 -22 q-8 -6 -10 -14 q8 2 10 14 M-8 -14 q8 -6 10 -14 q-8 2 -10 14 M-8 -30 q-6 -6 -6 -12 q6 2 6 12" stroke="#4F9C4A" stroke-width="2" fill="none"/>
<path d="M10 -4 v-20 h4 v20z" fill="#F4E8C8"/><ellipse cx="12" cy="-32" rx="8" ry="10" fill="url(#{p}flame)"/>
</g>
<circle cx="602" cy="262" r="26" fill="url(#{p}flame)" opacity=".25"/>
<g stroke="#0F1A15" stroke-width="1.5" opacity=".6"><path d="M0 330 H1200 M0 372 H1200 M0 414 H1200"/><path d="M200 236 L100 420 M400 236 L340 420 M600 236 V420 M800 236 L860 420 M1000 236 L1100 420"/></g>
<path d="M480 236 L720 236 L900 420 H300z" fill="#FFF2C4" opacity=".08"/>
'''
    return _wrap(16, body, defs)


# ───────────────────────── 17  Biology: DNA helix from a fossil cliff ─────────────────────────
def _b17():
    p = "sb17-"
    defs = (
        _lin(p+"sky", [(0, "#1E2A38", None), (.5, "#3A4C5E", None), (1, "#6A7A88", None)])
        + _lin(p+"cliff", [(0, "#5C4A3A", None), (.3, "#8A6A40", None), (.55, "#4E4A4A", None), (.8, "#7A5C3A", None), (1, "#2E2A2C", None)])
        + _lin(p+"ground", [(0, "#2E3A44", None), (1, "#141C24", None)])
        + _lin(p+"s1", [(0, "#F0B040", None), (1, "#C07A20", None)])
        + _lin(p+"s2", [(0, "#4FD0C0", None), (1, "#1E8A88", None)])
        + _rad(p+"glow", [(0, "#D8C8A0", .35), (.6, "#D8C8A0", .06), (1, "#D8C8A0", 0)])
    )
    # helix: two strands, staircase rungs, from (560, 330) up to (640, 20)
    s1, s2, rungs = [], [], []
    cx, amp = 610, 78
    for i in range(0, 61):
        t = i / 60
        y = 330 - t * 320
        ph = t * math.pi * 5
        x1 = cx + math.cos(ph) * amp
        x2 = cx - math.cos(ph) * amp
        s1.append(f'{"M" if i == 0 else "L"}{x1:.0f} {y:.0f}')
        s2.append(f'{"M" if i == 0 else "L"}{x2:.0f} {y:.0f}')
        if i % 3 == 0:
            d = abs(math.cos(ph))
            op = .35 + .6 * d
            rungs.append(f'<path d="M{x1:.0f} {y:.0f} L{x2:.0f} {y:.0f}" stroke-width="{3+3*d:.1f}" opacity="{op:.2f}"/>')
    rings = "".join(f'<circle cx="960" cy="110" r="{r}" stroke-dasharray="{6+r//10} {14+r//6}"/>' for r in (40, 64, 92, 124, 160))
    strata = "".join(f'<path d="M0 {y} Q130 {y-6+(i%3)*4} 260 {y+2} T480 {y-3}" />' for i, y in enumerate(range(120, 330, 22)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="960" cy="110" r="190" fill="url(#{p}glow)"/>
<g fill="none" stroke="#DCE6F0" stroke-width="1.5" opacity=".45">{rings}</g>
<g stroke="#DCE6F0" stroke-width="2.5" stroke-linecap="round" opacity=".55"><path d="M900 50 l12 12 M880 30 l10 10 M1020 50 l-12 12 M1040 30 l-10 10 M900 170 l12 -12 M880 190 l10 -10 M1020 170 l-12 -12 M1040 190 l-10 -10 M930 70 l6 6 M990 70 l-6 6 M930 150 l6 -6 M990 150 l-6 -6"/></g>
<circle cx="960" cy="110" r="6" fill="#DCE6F0" opacity=".6"/>
<g fill="#3A4C5E" opacity=".6"><ellipse cx="760" cy="60" rx="150" ry="8"/><ellipse cx="1100" cy="210" rx="120" ry="6"/></g>
<path d="M0 100 L60 92 L120 108 L200 96 L300 104 L400 98 L470 110 L480 330 H0z" fill="url(#{p}cliff)"/>
<g stroke="#2E2A2C" stroke-width="1.5" fill="none" opacity=".55">{strata}</g>
<path d="M470 110 L480 330 L520 330 L500 116z" fill="#2E2A2C" opacity=".7"/>
<g fill="#1E1A1C" transform="translate(150 224)"><path d="M-90 0 q20 -18 50 -16 q40 -2 80 6 q30 4 58 18 l-12 4 l14 8 l-30 -4 q-40 12 -84 6 q-40 -2 -62 -12 l-20 8 l6 -12 l-24 -6z"/><path d="M-30 6 l-10 22 l6 0 l8 -16 M20 8 l-6 24 l6 0 l6 -18 M60 6 l-4 22 l6 0 l4 -18" stroke="#1E1A1C" stroke-width="3" fill="none"/><path d="M-70 -10 q-14 -22 -30 -20 q6 12 20 22z"/><circle cx="70" cy="-2" r="3" fill="#8A6A40"/></g>
<g fill="none" stroke="#8A6A40" stroke-width="1.5" opacity=".8"><path d="M80 300 q10 -14 22 -12 q-6 10 -22 12z M300 296 q12 -10 24 -6 q-10 8 -24 6z"/></g>
<path d="M0 330 H1200 V420 H0z" fill="url(#{p}ground)"/>
<path d="M480 330 Q700 322 900 328 T1200 326 V420 H480z" fill="#1A2430"/>
<g stroke="#8AB0B8">{"".join(rungs)}</g>
<path d="{" ".join(s1)}" fill="none" stroke="url(#{p}s1)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<path d="{" ".join(s2)}" fill="none" stroke="url(#{p}s2)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#DCE6F0" opacity=".5"><circle cx="300" cy="40" r="1.4"/><circle cx="640" cy="24" r="1.2"/><circle cx="780" cy="20" r="1.5"/><circle cx="1140" cy="60" r="1.4"/><circle cx="1080" cy="30" r="1.1"/></g>
<g fill="#0F161C"><path d="M40 344 q-8 -20 0 -34 q8 14 0 34z M66 348 q-7 -16 0 -28 q7 12 0 28z M1120 342 q-9 -22 0 -36 q9 14 0 36z M1150 346 q-7 -16 0 -28 q7 12 0 28z"/></g>
'''
    return _wrap(17, body, defs)


# ───────────────────────── 18  Biology: prairie with bison ─────────────────────────
def _b18():
    p = "sb18-"
    defs = (
        _lin(p+"sky", [(0, "#1C2A4E", None), (.4, "#3E4A6E", None), (.7, "#9A6A5A", None), (.88, "#E08A3A", None), (1, "#F0B060", None)])
        + _lin(p+"burn", [(0, "#FF8C2A", 0), (.5, "#FF9A30", .9), (1, "#FF7020", 0)], 0, 0, 1, 0)
        + _lin(p+"smoke", [(0, "#F0B060", .0), (1, "#3E4A6E", .55)])
        + _lin(p+"far", [(0, "#5A4A50", None), (1, "#3E3040", None)])
        + _lin(p+"mid", [(0, "#8A5A34", None), (1, "#5A3A24", None)])
        + _lin(p+"fg", [(0, "#3A2618", None), (.5, "#22160E", None), (1, "#120B08", None)])
        + _lin(p+"grass", [(0, "#C88A3A", None), (1, "#6A4020", None)])
    )
    g = _lcg(18)
    blades = []
    for _ in range(150):
        x = next(g) % 1200
        h = 18 + next(g) % 28
        y = 262 + next(g) % 30
        sw = 10 + next(g) % 10
        blades.append(f'<path d="M{x} {y} q{sw//2} -{h//2} {sw} -{h}"/>')
    blades2 = []
    for _ in range(90):
        x = next(g) % 1200
        h = 30 + next(g) % 40
        y = 318 + next(g) % 30
        sw = 14 + next(g) % 12
        blades2.append(f'<path d="M{x} {y} q{sw//2} -{h//2} {sw} -{h}"/>')
    city = "".join(f'<rect x="{x}" y="{212-h}" width="{w}" height="{h}"/>' for x, w, h in ((60, 6, 14), (70, 8, 22), (82, 5, 12), (92, 7, 18), (104, 6, 9), (114, 9, 26), (128, 5, 15), (138, 6, 10)))
    def bison(x, y, s):
        return (f'<g transform="translate({x} {y}) scale({s})">'
                '<path d="M-60 0 v-30 q0 -14 10 -22 q10 -8 20 -14 q14 -10 34 -8 q20 2 32 14 q10 14 4 30 q-2 8 -8 10 l-4 20 h-8 l2 -18 h-20 l-2 18 h-8 l0 -18 q-10 2 -20 -2 l-4 20 h-8 l2 -20 q-8 0 -12 2 v-2z"/>'
                '<path d="M16 -70 q10 -8 20 -2 q-4 6 -12 6z M-6 -66 q-8 -6 -18 -2 q4 6 12 6z"/>'
                '<path d="M40 -46 q8 -6 12 0 q-2 8 -8 10z"/></g>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#3E4A6E" opacity=".5"><ellipse cx="300" cy="60" rx="200" ry="8"/><ellipse cx="900" cy="100" rx="240" ry="9"/></g>
<g fill="#F0B060" opacity=".55"><ellipse cx="640" cy="150" rx="220" ry="5"/><ellipse cx="1000" cy="168" rx="140" ry="4"/></g>
<path d="M400 60 Q560 40 700 80 Q820 110 940 170 Q1000 200 1200 206 V212 H420z" fill="url(#{p}smoke)"/>
<g fill="#2A2438" opacity=".85">{city}</g>
<path d="M0 214 Q200 208 400 212 T800 208 T1200 212 V236 H0z" fill="url(#{p}far)"/>
<rect x="380" y="208" width="820" height="6" fill="url(#{p}burn)"/>
<path d="M420 210 q8 -10 12 0 q2 -6 8 -2 q4 -8 10 0 q6 -12 12 -2 q4 -6 8 -1 q6 -10 12 0" stroke="#FFD070" stroke-width="2" fill="none" opacity=".9"/>
<path d="M880 210 q6 -10 12 0 q4 -8 10 0 q6 -12 12 -2 q4 -6 8 -1 q6 -8 12 0" stroke="#FFD070" stroke-width="2" fill="none" opacity=".9"/>
<path d="M0 236 Q300 226 600 232 T1200 228 V300 H0z" fill="url(#{p}mid)"/>
<g fill="#2A1A10">{bison(300, 296, 1.0)}{bison(470, 288, .72)}{bison(560, 284, .5)}{bison(900, 292, .85)}{bison(1040, 286, .6)}</g>
<g fill="none" stroke="url(#{p}grass)" stroke-width="1.6" stroke-linecap="round" opacity=".8">{"".join(blades)}</g>
<path d="M0 300 Q300 290 600 296 T1200 292 V420 H0z" fill="url(#{p}fg)"/>
<g fill="none" stroke="#5A3A24" stroke-width="2" stroke-linecap="round" opacity=".75">{"".join(blades2)}</g>
<g fill="#22160E"><path d="M80 320 q-6 -12 0 -24 q6 8 0 24z M100 316 q-4 -14 0 -26 q4 10 0 26z"/></g>
'''
    return _wrap(18, body, defs)


# ───────────────────────── 19  Physical Science: lab at night, periodic wall ─────────────────────────
def _b19():
    p = "sb19-"
    defs = (
        _lin(p+"wall", [(0, "#1A1D22", None), (1, "#2A2E36", None)])
        + _lin(p+"bench", [(0, "#3A3E48", None), (.15, "#22252C", None), (1, "#101216", None)])
        + _lin(p+"glass", [(0, "#C8D8E8", .35), (1, "#C8D8E8", .12)])
        + _rad(p+"fr", [(0, "#FFF0E0", 1), (.3, "#FF4A3A", .9), (1, "#FF4A3A", 0)])
        + _rad(p+"fo", [(0, "#FFF6D0", 1), (.3, "#FFA030", .9), (1, "#FFA030", 0)])
        + _rad(p+"fg", [(0, "#F0FFE0", 1), (.3, "#40D060", .9), (1, "#40D060", 0)])
        + _rad(p+"fv", [(0, "#F8F0FF", 1), (.3, "#9A5AF0", .9), (1, "#9A5AF0", 0)])
        + _rad(p+"lamp", [(0, "#FFE8B0", .5), (.6, "#FFE8B0", .08), (1, "#FFE8B0", 0)])
    )
    # periodic table layout: columns per row (period), coloured by block
    cols = {1: [1, 18], 2: [1, 2, 13, 14, 15, 16, 17, 18], 3: [1, 2, 13, 14, 15, 16, 17, 18]}
    for r in (4, 5, 6, 7):
        cols[r] = list(range(1, 19))
    def colr(c):
        if c == 1: return "#E85A5A"
        if c == 2: return "#E8A05A"
        if c <= 12: return "#5AB0E8"
        if c <= 16: return "#5AD08A"
        if c == 17: return "#D0D05A"
        return "#B080E8"
    tiles, ox, oy, s = [], 690, 34, 24
    for r, cs in cols.items():
        for c in cs:
            tiles.append(f'<rect x="{ox + (c-1)*s}" y="{oy + (r-1)*s}" width="{s-3}" height="{s-3}" rx="2" fill="{colr(c)}"/>')
    for c in range(3, 18):
        for r in (0, 1):
            tiles.append(f'<rect x="{ox + (c-1)*s}" y="{oy + 7*s + 8 + r*s}" width="{s-3}" height="{s-3}" rx="2" fill="#E8709A"/>')
    def flame(x, y, gid, h):
        return (f'<ellipse cx="{x}" cy="{y-h*0.5:.0f}" rx="{h*0.34:.0f}" ry="{h*0.6:.0f}" fill="url(#{gid})"/>'
                f'<path d="M{x-5} {y+2} h10 v-8 h-10z M{x-9} {y+2} h18 v4 h-18z" fill="#101216"/>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<circle cx="300" cy="120" r="220" fill="url(#{p}lamp)"/>
<path d="M280 0 h40 l10 40 h-60z" fill="#3A3E48"/><path d="M270 40 h60 v6 h-60z" fill="#FFE8B0" opacity=".5"/>
<rect x="676" y="22" width="460" height="230" rx="4" fill="#111318" opacity=".8"/>
<g opacity=".92">{"".join(tiles)}</g>
<g stroke="#3A3E48" stroke-width="2" fill="none" opacity=".8"><path d="M40 30 H600 M40 30 V220 M600 30 V220 M40 220 H600"/><path d="M60 50 h200 v40 h-200z M300 50 h280 v60 h-280z M60 110 h520 v90 h-520z" opacity=".5"/></g>
<g fill="#22252C"><rect x="60" y="112" width="520" height="86"/></g>
<g fill="#2A2E36"><rect x="70" y="60" width="180" height="26" rx="2"/><rect x="310" y="60" width="90" height="44" rx="2"/><rect x="420" y="60" width="150" height="44" rx="2"/></g>
<path d="M0 260 H1200 V420 H0z" fill="url(#{p}bench)"/>
<path d="M0 260 H1200 V266 H0z" fill="#4A4E58"/>
<g fill="url(#{p}glass)" stroke="#C8D8E8" stroke-width="1.5" stroke-opacity=".6">
<path d="M120 258 L100 258 L100 250 L124 200 L124 170 h20 v30 l24 50 v8z"/>
<path d="M210 258 V210 h40 v48z"/>
<path d="M300 258 l-10 -70 h50 l-10 70z"/>
<path d="M380 258 V214 q0 -10 10 -10 h30 q10 0 10 10 v44z"/>
<path d="M520 258 V206 h16 v52z"/><path d="M552 258 V196 h14 v62z"/>
</g>
<path d="M104 232 l20 -34 v0 h20 l20 34 v20 h-60z" fill="#3A8AE8" opacity=".55"/>
<path d="M212 236 h36 v20 h-36z" fill="#E8A030" opacity=".55"/>
<path d="M296 230 h38 l-6 28 h-26z" fill="#40D060" opacity=".5"/>
<path d="M382 232 h46 v24 h-46z" fill="#9A5AF0" opacity=".55"/>
<path d="M522 228 h12 v28 h-12z" fill="#E85A5A" opacity=".55"/>
<g>{flame(760, 252, p+"fr", 46)}{flame(830, 252, p+"fo", 52)}{flame(900, 252, p+"fg", 48)}{flame(970, 252, p+"fv", 50)}</g>
<g stroke="#5A5E68" stroke-width="2" fill="none"><path d="M760 262 v14 M830 262 v14 M900 262 v14 M970 262 v14"/><path d="M740 276 h250"/></g>
<g stroke="#5A5E68" stroke-width="1.5" fill="none" opacity=".6"><path d="M1040 258 v-40 M1040 236 h60 M1100 236 v22"/><rect x="1060" y="240" width="30" height="18" rx="3"/></g>
<g fill="#D8E0E8" opacity=".12"><ellipse cx="760" cy="300" rx="40" ry="10"/><ellipse cx="830" cy="300" rx="44" ry="10"/><ellipse cx="900" cy="300" rx="40" ry="10"/><ellipse cx="970" cy="300" rx="42" ry="10"/></g>
<g stroke="#5A5E68" stroke-width="1.2" fill="none" opacity=".4"><path d="M0 320 H1200 M0 380 H1200"/></g>
<g fill="#FF4A3A" opacity=".18"><ellipse cx="760" cy="230" rx="30" ry="36"/></g><g fill="#FFA030" opacity=".18"><ellipse cx="830" cy="228" rx="32" ry="38"/></g><g fill="#40D060" opacity=".18"><ellipse cx="900" cy="230" rx="30" ry="36"/></g><g fill="#9A5AF0" opacity=".18"><ellipse cx="970" cy="229" rx="32" ry="38"/></g>
'''
    return _wrap(19, body, defs)


# ───────────────────────── 20  Physical Science: crash test ─────────────────────────
def _b20():
    p = "sb20-"
    defs = (
        _lin(p+"wall", [(0, "#2E3640", None), (.5, "#3C4652", None), (1, "#556270", None)])
        + _lin(p+"floor", [(0, "#4A5560", None), (.2, "#2C343C", None), (1, "#12161A", None)])
        + _rad(p+"strobe", [(0, "#FFFFFF", .95), (.15, "#E0F0FF", .4), (.5, "#E0F0FF", .08), (1, "#E0F0FF", 0)])
        + _lin(p+"sled", [(0, "#9AA4AE", None), (1, "#4E5862", None)])
        + _lin(p+"hz", [(0, "#F2C41A", None), (1, "#C89A10", None)])
        + _lin(p+"bench", [(0, "#5A6470", None), (1, "#2C343C", None)])
        + _lin(p+"beam", [(0, "#3EC8FF", .6), (1, "#3EC8FF", 0)])
    )
    stripes = "".join(f'<path d="M{x} 196 l14 -14 h10 l-14 14z"/>' for x in range(884, 1000, 24))
    wave = "M60 92 " + " ".join(f'L{x} {92 + math.sin((x-60)/180*math.pi*2)*22 * math.sin((x-60)/360*math.pi):.0f}' for x in range(66, 421, 6))
    wave2 = "M60 92 " + " ".join(f'L{x} {92 - math.sin((x-60)/180*math.pi*2)*22 * math.sin((x-60)/360*math.pi):.0f}' for x in range(66, 421, 6))
    coil = " ".join(f'{"M" if i == 0 else "L"}{140 + i*2.6:.0f} {228 + math.sin(i*1.3)*14:.0f}' for i in range(0, 60))
    debris = "".join(f'<path d="M{x} {y} l{dx} {dy}"/>' for x, y, dx, dy in ((860, 170, -16, -14), (866, 150, -10, -18), (872, 200, -20, 6), (858, 214, -12, 12), (880, 132, -4, -18), (850, 190, -18, -2)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<circle cx="700" cy="10" r="170" fill="url(#{p}strobe)"/><circle cx="1000" cy="4" r="140" fill="url(#{p}strobe)"/><circle cx="420" cy="0" r="120" fill="url(#{p}strobe)" opacity=".6"/>
<g fill="#12161A"><rect x="690" y="0" width="20" height="16"/><rect x="990" y="0" width="20" height="12"/><rect x="410" y="0" width="20" height="10"/></g>
<path d="M0 246 H1200 V420 H0z" fill="url(#{p}floor)"/>
<g stroke="#12161A" stroke-width="3"><path d="M440 262 H1200 M440 270 H1200"/></g>
<g stroke="#F2C41A" stroke-width="2" opacity=".5"><path d="M480 246 v-10 M560 246 v-10 M640 246 v-10 M720 246 v-10"/></g>
<path d="M0 140 H420 V246 H0z" fill="#2A323A"/>
<path d="M0 240 H440 V252 H0z" fill="url(#{p}bench)"/>
<path d="M60 92 H420" stroke="#8A96A2" stroke-width="1"/><path d="M50 60 v70 M424 60 v70" stroke="#8A96A2" stroke-width="4"/>
<path d="{wave}" fill="none" stroke="#3EC8FF" stroke-width="2.5"/><path d="{wave2}" fill="none" stroke="#3EC8FF" stroke-width="2.5" opacity=".45"/>
<g fill="#3EC8FF" opacity=".9"><circle cx="150" cy="92" r="3"/><circle cx="240" cy="92" r="3"/><circle cx="330" cy="92" r="3"/></g>
<path d="{coil}" fill="none" stroke="#E8A050" stroke-width="3" stroke-linejoin="round"/>
<path d="M136 240 v-14 h30 v14z M282 240 v-14 h30 v14z" fill="#2C343C"/>
<rect x="330" y="216" width="80" height="20" rx="2" fill="#D03A3A"/><rect x="370" y="216" width="40" height="20" rx="2" fill="#3A5AD0"/>
<path d="M330 226 h-14 M410 226 h14" stroke="#F2F5F8" stroke-width="2"/>
<path d="M880 100 H1010 V246 H880z" fill="url(#{p}hz)"/>
<g fill="#12161A" opacity=".85">{stripes}</g>
<path d="M880 100 H1010 V112 H880z M880 196 H1010 V208 H880z" fill="#12161A" opacity=".6"/>
<path d="M1010 100 H1200 V246 H1010z" fill="#1E242A"/>
<g stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity=".9">{debris}</g>
<path d="M620 246 V226 H840 L860 246z" fill="url(#{p}sled)"/><path d="M620 226 V214 H700 q40 -30 100 0 H840 V226z" fill="#6E7A86"/>
<g fill="#6E7A86"><circle cx="660" cy="250" r="9"/><circle cx="800" cy="250" r="9"/></g><g fill="#12161A"><circle cx="660" cy="250" r="4"/><circle cx="800" cy="250" r="4"/></g>
<g fill="#F2C41A"><path d="M716 214 q10 -60 34 -70 l64 -20 l4 8 l-56 24 q-10 6 -12 14 l-6 44z"/><path d="M750 150 q-20 -8 -10 -30 l20 14 l30 -34 l8 8 l-30 32 q-4 12 -18 10z"/><circle cx="836" cy="118" r="18"/><path d="M780 140 q-6 -10 -30 -18 l-40 -8 l-2 10 l38 10 q16 6 30 12z"/></g>
<path d="M828 118 h16 M836 110 v16" stroke="#12161A" stroke-width="3"/>
<path d="M836 134 q8 -4 16 4 l20 30" stroke="#F2C41A" stroke-width="10" stroke-linecap="round" fill="none"/>
<path d="M440 246 H1200 V270 H440z" fill="url(#{p}beam)" opacity=".18"/>
<g fill="#FFFFFF" opacity=".5"><path d="M870 120 l4 -30 M876 128 l30 -26 M874 138 l36 -8" stroke="#FFFFFF" stroke-width="1.5"/></g>
<g stroke="#12161A" stroke-width="1.2" opacity=".4"><path d="M0 320 H1200 M0 372 H1200"/></g>
<rect x="440" y="140" width="440" height="6" fill="#12161A" opacity=".5"/>
<g fill="#F2C41A" opacity=".85"><rect x="470" y="128" width="16" height="12"/><rect x="560" y="128" width="16" height="12"/></g>
'''
    return _wrap(20, body, defs)


# ───────────────────────── 21  Earth & Space: observatory and the Milky Way ─────────────────────────
def _b21():
    p = "sb21-"
    defs = (
        _lin(p+"sky", [(0, "#03061A", None), (.6, "#0A1A44", None), (1, "#16305E", None)])
        + _lin(p+"mw", [(0, "#8FB8E8", 0), (.3, "#B8D8FF", .28), (.5, "#E0ECFF", .45), (.7, "#B8D8FF", .28), (1, "#8FB8E8", 0)])
        + _rad(p+"gal", [(0, "#FFF8E8", 1), (.15, "#E8D8FF", .7), (.5, "#8FA8E8", .18), (1, "#8FA8E8", 0)])
        + _lin(p+"dome", [(0, "#E8EEF6", None), (.5, "#AEBBCB", None), (1, "#66768A", None)], 0, 0, 1, 0)
        + _lin(p+"bld", [(0, "#4C5B6E", None), (1, "#243040", None)])
        + _lin(p+"ground", [(0, "#0C1A34", None), (1, "#040A18", None)])
        + _rad(p+"slit", [(0, "#3EE0FF", .8), (1, "#3EE0FF", 0)])
    )
    arms = []
    for k in (0, math.pi):
        pts = []
        for i in range(0, 40):
            t = i / 40 * math.pi * 1.9
            r = 4 + t * 8
            pts.append(f'{"M" if i == 0 else "L"}{240 + math.cos(t+k)*r:.0f} {96 + math.sin(t+k)*r*.55:.0f}')
        arms.append(" ".join(pts))
    lakes = (
        # rough Great Lakes silhouettes as one lit map
        '<path d="M480 300 q40 -22 100 -18 q60 4 110 14 q40 6 60 20 q-30 6 -80 2 q-50 -4 -100 6 q-50 4 -90 -10z"/>'   # Superior
        '<path d="M600 322 q8 22 6 46 q-2 22 8 34 q-30 6 -46 -8 q-6 -30 0 -60 q10 -12 32 -12z"/>'                      # Michigan
        '<path d="M690 322 q40 -4 70 10 q30 16 60 12 q10 20 -20 34 q-30 10 -60 -4 q-20 -14 -50 -22 q-10 -20 0 -30z"/>'  # Huron
        '<path d="M760 386 q60 -4 120 -24 q20 4 30 14 q-40 12 -110 24 q-30 2 -40 -14z"/>'                          # Erie
        '<path d="M930 382 q30 -6 60 -4 q10 8 0 14 q-30 4 -60 -2z"/>'                                             # Ontario
    )
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<path d="M-40 260 Q300 40 700 20 Q1000 10 1240 90 L1240 150 Q1000 90 700 90 Q400 110 0 320z" fill="url(#{p}mw)"/>
<path d="M200 220 Q500 110 800 70 Q1000 60 1240 110 L1240 130 Q1000 80 800 90 Q520 130 240 250z" fill="#0A1A44" opacity=".5"/>
{_stars(21, 160, 300, "#FFFFFF", ".85")}
{_stars(212, 60, 120, "#BFD8FF", ".6", 400, 1200)}
<circle cx="240" cy="96" r="70" fill="url(#{p}gal)"/>
<g fill="none" stroke="#E8E0FF" stroke-width="2.5" stroke-linecap="round" opacity=".7"><path d="{arms[0]}"/><path d="{arms[1]}"/></g>
<ellipse cx="240" cy="96" rx="10" ry="6" fill="#FFF8E8"/>
<g fill="#FFFFFF"><circle cx="300" cy="40" r="2.2"/><circle cx="1080" cy="60" r="2"/><circle cx="640" cy="30" r="1.8"/><circle cx="880" cy="150" r="1.8"/></g>
<path d="M0 262 Q200 250 400 256 T800 250 T1200 256 V300 H0z" fill="#101E3E"/>
<g transform="translate(900 232)">
<circle cx="0" cy="0" r="130" fill="#0A1A44" opacity=".01"/>
<path d="M-118 0 A118 118 0 0 1 118 0z" fill="url(#{p}dome)"/>
<path d="M-118 0 A118 118 0 0 1 118 0" stroke="#2C3A4C" stroke-width="2" fill="none"/>
<path d="M-14 -118 L-14 -117 A118 118 0 0 0 -118 -1 L-118 0 L-96 0 A96 96 0 0 1 -14 -95z" fill="#0A1A44" opacity=".01"/>
<path d="M6 -118 L30 -114 L30 0 L6 0z" fill="#06102A"/>
<path d="M6 -118 A118 118 0 0 1 30 -114" stroke="#06102A" stroke-width="3" fill="none"/>
<rect x="6" y="-116" width="24" height="116" fill="url(#{p}slit)" opacity=".5"/>
<path d="M12 -60 l10 -30 l4 2 l-10 30z" fill="#3EE0FF" opacity=".9"/><path d="M8 -30 l14 -38" stroke="#0A1A44" stroke-width="6"/><path d="M6 -26 l16 -40" stroke="#5A6C80" stroke-width="3"/>
<path d="M-130 0 H130 V8 H-130z" fill="#66768A"/>
<path d="M-124 8 H124 V64 H-124z" fill="url(#{p}bld)"/>
<g fill="#F2E2A0" opacity=".85"><rect x="-96" y="24" width="12" height="16"/><rect x="-60" y="24" width="12" height="16"/><rect x="60" y="24" width="12" height="16"/><rect x="96" y="24" width="12" height="16"/></g>
<rect x="-14" y="30" width="28" height="34" fill="#F2E2A0" opacity=".9"/>
</g>
<path d="M0 296 Q300 288 600 292 T1200 290 V420 H0z" fill="url(#{p}ground)"/>
<g fill="#0C1A34"><path d="M40 296 q-8 -20 0 -36 q8 16 0 36z M70 300 q-7 -16 0 -30 q7 14 0 30z M120 298 q-9 -22 0 -38 q9 16 0 38z M1140 298 q-8 -20 0 -36 q8 16 0 36z M1170 302 q-6 -14 0 -26 q6 12 0 26z"/></g>
<g fill="#3EE0FF" opacity=".16">{lakes}</g>
<g fill="none" stroke="#3EE0FF" stroke-width="1.5" opacity=".7">{lakes}</g>
<g fill="none" stroke="#3EE0FF" stroke-width=".8" opacity=".25"><path d="M400 300 H1080 M400 340 H1080 M400 380 H1080 M420 296 V420 M560 296 V420 M700 296 V420 M840 296 V420 M980 296 V420"/></g>
<circle cx="596" cy="376" r="3" fill="#F2E2A0" opacity=".9"/><circle cx="596" cy="376" r="8" fill="#F2E2A0" opacity=".25"/>
'''
    return _wrap(21, body, defs)


# ───────────────────────── 22  Chemistry: flames and the spectroscope ─────────────────────────
def _b22():
    p = "sb22-"
    defs = (
        _lin(p+"wall", [(0, "#050508", None), (1, "#121218", None)])
        + _lin(p+"bench", [(0, "#2A2A32", None), (.15, "#16161C", None), (1, "#08080B", None)])
        + _lin(p+"fan", [(0, "#FFFFFF", .55), (1, "#FFFFFF", 0)], 0, 0, 1, 0)
        + _rad(p+"nuc", [(0, "#FFF4C0", 1), (.3, "#FFB040", .8), (1, "#FF7020", 0)])
        + _rad(p+"lampglow", [(0, "#FFB040", .35), (1, "#FFB040", 0)])
    )
    fl = [("#FF3A2A", "#FFE0D0"), ("#FF9A20", "#FFF4C0"), ("#F0E040", "#FFFFF0"), ("#40D060", "#E0FFE8"), ("#3A8AFF", "#E0F0FF"), ("#9A5AF0", "#F4E8FF"), ("#FF5AC0", "#FFE8F8")]
    flames, defs2 = [], []
    for i, (c, core) in enumerate(fl):
        x = 90 + i * 64
        gid = f"{p}f{i}"
        defs2.append(_rad(gid, [(0, core, 1), (.35, c, .9), (1, c, 0)]))
        h = 44 + (i % 3) * 8
        flames.append(f'<ellipse cx="{x}" cy="{258-h*0.55:.0f}" rx="{h*0.3:.0f}" ry="{h*0.6:.0f}" fill="url(#{gid})"/>'
                      f'<ellipse cx="{x}" cy="{258-h*0.6:.0f}" rx="{h*0.7:.0f}" ry="{h*0.9:.0f}" fill="{c}" opacity=".14"/>'
                      f'<path d="M{x-4} 262 h8 v-10 h-8z M{x-8} 262 h16 v3 h-16z" fill="#2A2A32"/>')
    defs += "".join(defs2)
    # spectrum: a fan of beams to the wall, then vertical lines on the wall band
    spec = [("#FF3A2A", 8), ("#FF6A20", 3), ("#FFB020", 5), ("#F0E040", 2), ("#40D060", 7), ("#20C0C0", 3), ("#3A8AFF", 6), ("#6A3AFF", 4), ("#9A3AF0", 5)]
    lines, beams, xs = [], [], 700
    for c, wdt in spec:
        lines.append(f'<rect x="{xs}" y="60" width="{wdt}" height="120" fill="{c}"/>')
        lines.append(f'<rect x="{xs-6}" y="50" width="{wdt+12}" height="140" fill="{c}" opacity=".18"/>')
        beams.append(f'<path d="M560 176 L{xs} 60 L{xs+wdt} 180z" fill="{c}" opacity=".16"/>')
        xs += 44 + wdt
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="640" y="30" width="520" height="170" fill="#0B0B10"/>
{"".join(beams)}
{"".join(lines)}
<g fill="#1E1E28"><rect x="500" y="160" width="60" height="30" rx="3"/><path d="M560 168 h30 l-8 14 h-22z"/><rect x="520" y="190" width="10" height="70"/><rect x="500" y="256" width="60" height="8" rx="2"/></g>
<path d="M480 172 H500" stroke="#FFF" stroke-width="2" opacity=".6"/>
<path d="M560 176 L640 100 L640 184z" fill="url(#{p}fan)" opacity=".45"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}bench)"/>
<path d="M0 262 H1200 V266 H0z" fill="#3A3A44"/>
{"".join(flames)}
<g stroke="#3A3A44" stroke-width="3" fill="none"><path d="M60 262 v-8 h460 v8"/></g>
<g transform="translate(1040 150)">
<circle r="120" fill="url(#{p}lampglow)"/>
<g fill="none" stroke="#C0B090" stroke-width="1.6" opacity=".8"><ellipse rx="32" ry="12" transform="rotate(-20)"/><ellipse rx="60" ry="22" transform="rotate(25)"/><ellipse rx="86" ry="32" transform="rotate(-10)"/></g>
<circle r="14" fill="url(#{p}nuc)"/><circle r="6" fill="#FFF4C0"/>
<g fill="#FFD070"><circle cx="30" cy="-11" r="3.5"/><circle cx="-54" cy="-25" r="3.5"/><circle cx="50" cy="26" r="3.5"/><circle cx="-84" cy="12" r="3.5"/><circle cx="70" cy="-20" r="3.5"/></g>
<path d="M-4 90 h8 v22 h-8z M-24 112 h48 v8 h-48z" fill="#2A2A32"/>
</g>
<g fill="#FFFFFF" opacity=".12"><ellipse cx="282" cy="300" rx="240" ry="10"/><ellipse cx="1040" cy="300" rx="80" ry="8"/></g>
<g stroke="#3A3A44" stroke-width="1.2" opacity=".5"><path d="M0 330 H1200 M0 384 H1200"/></g>
<g fill="#1E1E28"><path d="M580 262 v-46 q0 -8 8 -8 h30 q8 0 8 8 v46z"/><path d="M596 208 h14 v-24 h-14z"/></g>
<path d="M582 240 h42 v20 h-42z" fill="#9A3AF0" opacity=".5"/>
'''
    return _wrap(22, body, defs)


# ───────────────────────── 23  Chemistry: titration bench ─────────────────────────
def _b23():
    p = "sb23-"
    defs = (
        _lin(p+"wall", [(0, "#E8ECF0", None), (.7, "#D4DAE2", None), (1, "#C0C8D2", None)])
        + _lin(p+"top", [(0, "#FAFBFC", None), (1, "#E0E4EA", None)])
        + _lin(p+"front", [(0, "#8A96A4", None), (.2, "#5A6572", None), (1, "#2E3640", None)])
        + _lin(p+"pink", [(0, "#F8C8DC", .8), (1, "#E8408A", .95)])
        + _lin(p+"cyl", [(0, "#8A96A4", None), (.5, "#B8C2CC", None), (1, "#5A6572", None)], 0, 0, 1, 0)
        + _lin(p+"cyl2", [(0, "#5E8A70", None), (.5, "#8AB498", None), (1, "#3E6A50", None)], 0, 0, 1, 0)
        + _lin(p+"glass", [(0, "#FFFFFF", .8), (1, "#C8D8E8", .4)])
        + _rad(p+"bag", [(0, "#FFFFFF", .9), (1, "#C8D0DA", .9)])
    )
    ticks = "".join(f'<path d="M382 {y} h{8 if i % 5 == 0 else 5}"/>' for i, y in enumerate(range(40, 180, 7)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g stroke="#C0C8D2" stroke-width="2" fill="none"><path d="M0 60 H1200 M0 200 H1200"/><rect x="700" y="20" width="240" height="120" rx="3"/></g>
<g fill="#F4F6F8"><rect x="700" y="20" width="240" height="120" rx="3"/></g>
<g transform="translate(720 30)">
<path d="M0 110 h200 v-6 h-200z M40 104 v-70 q0 -8 8 -8 h20 v78z" fill="#2E3640"/>
<path d="M92 104 v-60 q0 -10 10 -10 h60 q10 0 10 10 v60z" fill="#2E3640"/>
<circle cx="150" cy="96" r="12" fill="#2E3640"/><circle cx="150" cy="96" r="6" fill="#F4F6F8"/>
<ellipse cx="104" cy="60" rx="34" ry="30" fill="url(#{p}bag)"/><ellipse cx="104" cy="60" rx="34" ry="30" fill="none" stroke="#2E3640" stroke-width="2"/>
<path d="M56 60 q-14 -22 -4 -40 q10 -4 14 6" fill="#2E3640"/><circle cx="52" cy="14" r="10" fill="#2E3640"/><path d="M52 26 v18 l-8 16" stroke="#2E3640" stroke-width="7" fill="none"/>
<path d="M104 60 l-8 -10 M104 60 l8 -10 M104 60 l-10 6 M104 60 l10 6" stroke="#F0A0B8" stroke-width="2"/>
</g>
<path d="M0 262 H1200 V300 H0z" fill="url(#{p}top)"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}front)"/>
<g fill="#2E3640"><rect x="300" y="262" width="60" height="6" rx="2"/><rect x="326" y="30" width="8" height="234"/><rect x="334" y="60" width="40" height="8"/><rect x="334" y="160" width="40" height="8"/></g>
<rect x="372" y="34" width="20" height="140" fill="url(#{p}glass)" stroke="#8A96A4" stroke-width="1.2"/>
<rect x="374" y="70" width="16" height="102" fill="#C8DCF0" opacity=".9"/>
<g stroke="#2E3640" stroke-width="1" opacity=".7">{ticks}</g>
<path d="M382 174 v12 M376 182 h12" stroke="#2E3640" stroke-width="3"/><circle cx="382" cy="182" r="4" fill="#2E3640"/>
<path d="M382 190 v10 M382 200 v14" stroke="#8A96A4" stroke-width="2"/>
<path d="M382 206 v6" stroke="#E8408A" stroke-width="2"/><circle cx="382" cy="214" r="2" fill="#E8408A"/>
<path d="M366 262 l-30 -40 v-20 h92 v20 l-30 40z" fill="url(#{p}glass)" stroke="#8A96A4" stroke-width="1.2"/>
<path d="M340 226 v-8 h84 v8z" fill="#F4F6F8" opacity=".5"/>
<path d="M348 246 l-8 10 v6 h84 v-6 l-8 -10z" fill="url(#{p}pink)"/>
<path d="M356 236 q26 -6 52 0 v10 h-52z" fill="#F8C8DC" opacity=".55"/>
<g transform="translate(560 262)"><path d="M-70 0 v-14 h140 v14z" fill="#5A6572"/><path d="M-60 -14 v-10 h120 v10z" fill="#B8C2CC"/><path d="M-30 -24 v-40 h-40 v8 h32 v32z" fill="#5A6572"/><rect x="-62" y="-28" width="30" height="8" fill="#2E3640"/><rect x="-56" y="-26" width="18" height="4" fill="#40E080"/><circle cx="24" cy="-30" r="4" fill="#2E3640"/><path d="M14 -40 h60 v6 h-60z" fill="#8A96A4"/></g>
<g transform="translate(1020 262)">
<path d="M-90 0 v-170 q0 -20 20 -20 h40 q20 0 20 20 v170z" fill="url(#{p}cyl)"/><path d="M-60 -190 v-16 h20 v16z M-66 -206 h32 v-6 h-32z" fill="#2E3640"/><path d="M-50 -212 v-10 M-58 -218 h16" stroke="#2E3640" stroke-width="4"/>
<path d="M10 0 v-140 q0 -18 18 -18 h36 q18 0 18 18 v140z" fill="url(#{p}cyl2)"/><path d="M36 -158 v-14 h20 v14z M30 -172 h32 v-6 h-32z" fill="#2E3640"/>
<rect x="-90" y="-100" width="80" height="14" fill="#2E3640" opacity=".35"/><rect x="10" y="-80" width="72" height="12" fill="#2E3640" opacity=".35"/>
</g>
<path d="M914 262 v-100 h4 v100z M1108 262 v-90 h4 v90z" fill="#2E3640" opacity=".4"/>
<g fill="#FFFFFF" opacity=".5"><rect x="0" y="262" width="1200" height="3"/></g>
<g fill="#E8408A" opacity=".15"><ellipse cx="382" cy="292" rx="60" ry="8"/></g>
<g stroke="#2E3640" stroke-width="1.2" opacity=".35"><path d="M0 340 H1200 M0 390 H1200"/></g>
<g fill="#B8C2CC" opacity=".5"><rect x="120" y="230" width="90" height="32" rx="3"/><rect x="130" y="238" width="70" height="16" rx="2" fill="#2E3640"/></g>
<rect x="150" y="202" width="8" height="60" fill="#8A96A4"/><path d="M154 202 l-14 -60 h28z" fill="url(#{p}glass)" stroke="#8A96A4" stroke-width="1"/><path d="M148 176 h12 v26 h-12z" fill="#3A8AFF" opacity=".5"/>
'''
    return _wrap(23, body, defs)


# ───────────────────────── 24  Physics: Galileo's plane under an indigo sky ─────────────────────────
def _b24():
    p = "sb24-"
    defs = (
        _lin(p+"sky", [(0, "#0E0C34", None), (.5, "#25205E", None), (.8, "#4A3A6E", None), (1, "#6A5070", None)])
        + _rad(p+"moon", [(0, "#F8F4E0", 1), (.3, "#F0E8C8", .9), (1, "#F0E8C8", 0)])
        + _lin(p+"parch", [(0, "#E6D5A8", None), (.5, "#D6C08C", None), (1, "#B89E6A", None)])
        + _lin(p+"wood", [(0, "#8A5E32", None), (1, "#5A3A1E", None)])
        + _lin(p+"floor", [(0, "#8A7450", None), (.3, "#5A4A34", None), (1, "#2A2218", None)])
        + _rad(p+"ball", [(0, "#F0E0B0", 1), (.4, "#A08040", 1), (1, "#4A3418", 1)], .35, .35, .6)
        + _rad(p+"flame", [(0, "#FFF0B0", 1), (.4, "#FFB030", .7), (1, "#FF8020", 0)])
    )
    # inclined plane: from (120, 130) down to (760, 250); marks at distances ∝ n²
    x0, y0, x1, y1 = 120, 130, 780, 252
    marks = []
    for n in range(1, 9):
        t = (n * n) / 64
        mx, my = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        marks.append(f'<path d="M{mx:.0f} {my - 4:.0f} l3 -14 M{mx:.0f} {my-4:.0f}" stroke-width="{2 if n%2 else 1.4}"/>')
        marks.append(f'<circle cx="{mx:.0f}" cy="{my - 16:.0f}" r="2" fill="#FFE070" opacity=".3"/>')
    orbit = "M700 30 Q820 8 940 40 Q1080 80 1140 160"
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(24, 70, 200, "#F0ECFF", ".7")}
<circle cx="1000" cy="110" r="120" fill="url(#{p}moon)"/><circle cx="1000" cy="110" r="46" fill="#F0E8C8"/>
<g fill="#D6CCA8" opacity=".6"><circle cx="984" cy="98" r="9"/><circle cx="1010" cy="120" r="6"/><circle cx="1014" cy="94" r="4"/><circle cx="990" cy="126" r="5"/></g>
<path d="{orbit}" fill="none" stroke="#F0ECFF" stroke-width="1.5" stroke-dasharray="6 8" opacity=".6"/>
<g transform="translate(900 30) rotate(24)"><path d="M-22 0 q0 -14 14 -18 h16 q14 4 14 18z" fill="#E8E8F0"/><path d="M-22 0 h44 l-10 14 h-24z" fill="#B0B0C0"/><circle cx="0" cy="-6" r="3" fill="#25205E"/><path d="M-10 14 q10 20 20 0" fill="#FFB030" opacity=".8"/></g>
<path d="M0 226 Q300 214 600 220 T1200 216 V262 H0z" fill="#1A1640" opacity=".8"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M0 262 H1200 V268 H0z" fill="#3A2C1C"/>
<path d="M40 100 H900 V262 H40z" fill="url(#{p}parch)"/>
<path d="M40 100 H900 V262 H40z" fill="none" stroke="#8A6E3E" stroke-width="3"/>
<g fill="#B89E6A" opacity=".5"><path d="M60 120 q120 -8 240 0 M60 140 q160 -6 320 0" stroke="#B89E6A" stroke-width="1" fill="none"/></g>
<path d="M{x0} {y0} L{x1} {y1} L{x1} {y1+8} L{x0+30} {y1+8} L{x0} {y0+10}z" fill="url(#{p}wood)"/>
<path d="M{x0} {y0} L{x1} {y1}" stroke="#F0E0B0" stroke-width="1.5" opacity=".6"/>
<path d="M{x0+6} {y0+8} L{x0+6} {y1+8} L{x0+30} {y1+8}z" fill="#5A3A1E"/>
<path d="M{x0+2} {y1+8} h10 v-{y1-y0} h-10z" fill="#5A3A1E"/>
<g stroke="#3A2A14" fill="none">{"".join(marks)}</g>
<circle cx="360" cy="166" r="14" fill="url(#{p}ball)"/>
<path d="M300 154 q30 -10 60 0" stroke="#3A2A14" stroke-width="1.2" stroke-dasharray="3 4" fill="none" opacity=".7"/>
<g transform="translate(620 118)"><path d="M-40 0 h80 M0 0 v-8" stroke="#3A2A14" stroke-width="4"/><path d="M-40 0 v100 M40 0 v100" stroke="#3A2A14" stroke-width="3"/><path d="M0 0 L26 92" stroke="#3A2A14" stroke-width="1.5"/><circle cx="26" cy="96" r="9" fill="#3A2A14"/><path d="M0 0 L-28 90" stroke="#3A2A14" stroke-width="1" stroke-dasharray="3 4" opacity=".5"/><path d="M-28 92 q28 12 56 0" stroke="#3A2A14" stroke-width="1" stroke-dasharray="3 4" fill="none" opacity=".5"/></g>
<g transform="translate(830 200)"><path d="M-10 62 h20 v-10 h-20z" fill="#5A3A1E"/><path d="M-3 52 h6 v-40 h-6z" fill="#F4E8C8"/><ellipse cx="0" cy="2" rx="7" ry="12" fill="url(#{p}flame)"/><circle r="50" fill="url(#{p}flame)" opacity=".15"/></g>
<g stroke="#3A2A14" stroke-width="1.5" fill="none" opacity=".7"><path d="M120 248 h60 M130 240 l10 8 l-10 8"/><path d="M700 248 h60 M750 240 l10 8 l-10 8"/></g>
<g stroke="#2A2218" stroke-width="1.2" opacity=".4"><path d="M0 320 H1200 M0 380 H1200"/></g>
<path d="M40 262 H900 V280 H40z" fill="#3A2C1C" opacity=".5"/>
'''
    return _wrap(24, body, defs)


# ───────────────────────── 25  Physics: Young's double slit ─────────────────────────
def _b25():
    p = "sb25-"
    defs = (
        _lin(p+"bg", [(0, "#020206", None), (1, "#0C0A18", None)])
        + _lin(p+"beam", [(0, "#FF2A2A", .95), (1, "#FF2A2A", .6)], 0, 0, 1, 0)
        + _lin(p+"screen", [(0, "#1A1428", None), (1, "#0C0A18", None)])
        + _lin(p+"bench", [(0, "#2A2A36", None), (.15, "#16161E", None), (1, "#08080C", None)])
        + _rad(p+"spark", [(0, "#F8F0FF", .9), (.3, "#B070FF", .35), (1, "#B070FF", 0)])
        + _lin(p+"metal", [(0, "#8A8AA0", None), (1, "#3A3A4C", None)])
    )
    # wavefront arcs from two slits
    arcs = []
    for r in range(20, 260, 22):
        for sy in (150, 190):
            arcs.append(f'<path d="M{540+ (r if r<0 else 0)} {sy-r} A{r} {r} 0 0 1 540 {sy+r}" transform="translate({0} 0)"/>')
    # simpler: draw arcs centred at (540, sy) on the right side
    arcs = []
    for r in range(18, 300, 20):
        for sy in (150, 190):
            arcs.append(f'<path d="M540 {sy-r} A{r} {r} 0 0 1 540 {sy+r}"/>')
    # bands on the screen (x=880..900), cos² intensity
    bands = []
    for i in range(-9, 10):
        y = 170 + i * 12
        inten = math.cos(i * math.pi / 2.2) ** 2
        env = math.exp(-(i / 7) ** 2)
        op = (0.15 + 0.85 * inten) * env
        bands.append(f'<rect x="880" y="{y-5}" width="30" height="10" fill="#C08CFF" opacity="{op:.2f}"/>')
    bolt = "M1040 60 l-8 24 l14 -6 l-12 30 l18 -10 l-8 34 l16 -14 l-6 26"
    bolt2 = "M1040 60 l20 18 l-12 4 l26 26 l-14 2 l18 24"
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}bg)"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}bench)"/>
<path d="M0 262 H1200 V265 H0z" fill="#3A3A48"/>
<g transform="translate(80 160)"><rect x="0" y="-16" width="120" height="32" rx="4" fill="url(#{p}metal)"/><rect x="120" y="-8" width="12" height="16" fill="#3A3A4C"/><circle cx="20" cy="0" r="6" fill="#FF2A2A" opacity=".8"/><path d="M0 16 v30 M120 16 v30" stroke="#3A3A4C" stroke-width="4"/><rect x="-6" y="46" width="132" height="6" rx="2" fill="#3A3A4C"/></g>
<path d="M212 158 H520 V162 H212z" fill="url(#{p}beam)"/><path d="M212 154 H520 V166 H212z" fill="#FF2A2A" opacity=".2"/>
<path d="M212 160 H520" stroke="#FFD0D0" stroke-width="1.2" opacity=".9"/>
<g fill="none" stroke="#FF2A2A" stroke-width="1.2" opacity=".3">{"".join(arcs[0::4])}</g>
<g fill="none" stroke="#B070FF" stroke-width="1.2" opacity=".35">{"".join(arcs[1::4])}</g>
<g fill="none" stroke="#FF2A2A" stroke-width="1" opacity=".18">{"".join(arcs[2::4])}{"".join(arcs[3::4])}</g>
<g fill="#C08CFF" opacity=".12"><path d="M540 150 L880 60 L880 280z"/><path d="M540 190 L880 60 L880 280z"/></g>
<path d="M528 60 H548 V262 H528z" fill="url(#{p}metal)"/>
<rect x="526" y="144" width="24" height="12" fill="#0C0A18"/><rect x="526" y="184" width="24" height="12" fill="#0C0A18"/>
<rect x="878" y="40" width="34" height="222" fill="url(#{p}screen)" stroke="#3A3A4C" stroke-width="2"/>
{"".join(bands)}
<rect x="866" y="262" width="58" height="6" rx="2" fill="#3A3A4C"/><rect x="516" y="262" width="44" height="6" rx="2" fill="#3A3A4C"/>
<g transform="translate(1040 60)"><circle r="110" fill="url(#{p}spark)"/></g>
<path d="M1040 30 v30 M1024 30 h32" stroke="#8A8AA0" stroke-width="3"/><ellipse cx="1040" cy="34" rx="30" ry="9" fill="#8A8AA0"/><rect x="1030" y="42" width="20" height="120" fill="#6A6A80"/><rect x="1014" y="160" width="52" height="8" fill="#3A3A4C"/>
<g fill="none" stroke="#F8F0FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".95"><path d="{bolt}"/><path d="{bolt2}"/></g>
<g fill="none" stroke="#B070FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".35"><path d="{bolt}"/><path d="{bolt2}"/></g>
<path d="M1010 262 h60 v-96 h-60z" fill="#16161E"/><path d="M1000 262 h80 v-8 h-80z" fill="#3A3A4C"/>
<g transform="translate(300 262)">
<path d="M-90 -16 h60 l60 -40 h40 l10 12 h-60 l-50 34 h-60z" fill="#C0C0D0"/><path d="M-90 -16 v-12 h50 v12z" fill="#8A8AA0"/><path d="M-60 -28 v-6 h20 v6z" fill="#3A3A4C"/><path d="M-96 -6 l4 6 h20 l4 -6z" fill="#3A3A4C"/><path d="M-84 0 v6" stroke="#FFD0D0" stroke-width="2"/>
<path d="M-120 6 H0" stroke="#3A3A4C" stroke-width="2"/><path d="M-160 8 q80 -3 160 0" stroke="#4A4A5A" stroke-width="1" fill="none"/>
</g>
<g stroke="#4A4A5A" stroke-width="1" fill="none" opacity=".5"><path d="M0 300 q300 -4 600 0 t600 0"/><path d="M0 320 H1200 M0 380 H1200" stroke-width="1.2" opacity=".5"/></g>
<g fill="#FF2A2A" opacity=".15"><ellipse cx="380" cy="290" rx="180" ry="6"/></g><g fill="#B070FF" opacity=".15"><ellipse cx="900" cy="290" rx="100" ry="6"/></g>
'''
    return _wrap(25, body, defs)


# ───────────────────────── 26  Environmental Science: the delta from above ─────────────────────────
def _b26():
    p = "sb26-"
    defs = (
        _lin(p+"sky", [(0, "#3A2A5A", None), (.4, "#B25A5A", None), (.7, "#F08A5A", None), (.9, "#FFC078", None)])
        + _rad(p+"sun", [(0, "#FFF0C0", 1), (.3, "#FFB060", .6), (1, "#FFB060", 0)])
        + _lin(p+"gulf", [(0, "#F0A070", .9), (.2, "#4A8A90", 1), (.6, "#1A6A78", 1), (1, "#0C4A58", 1)])
        + _lin(p+"dead", [(0, "#6A7A40", 0), (.5, "#7A8A38", .7), (1, "#6A7A40", 0)], 0, 0, 1, 0)
        + _lin(p+"land", [(0, "#2E6A44", None), (1, "#183A28", None)])
        + _lin(p+"levee", [(0, "#3A4A3A", None), (.3, "#1E2A20", None), (1, "#0C1410", None)])
        + _lin(p+"panel", [(0, "#4A8AB8", None), (1, "#1A3A5A", None)])
    )
    g = _lcg(26)
    turb = []
    for x, s in ((200, 1.0), (300, .8), (400, .65), (1000, .9), (1100, 1.05)):
        a = next(g) % 360
        blades = "".join(f'<path d="M0 0 l{math.cos(math.radians(a+k))*36*s:.0f} {math.sin(math.radians(a+k))*36*s:.0f}"/>' for k in (0, 120, 240))
        turb.append(f'<g transform="translate({x} {306-int(60*s)})"><path d="M-3 {60*s:.0f} l3 -{60*s:.0f} l3 {60*s:.0f}z" fill="#E8E8E8"/><g stroke="#F0F0F0" stroke-width="3" stroke-linecap="round">{blades}</g><circle r="3" fill="#F0F0F0"/></g>')
    panels = "".join(f'<path d="M{x} 300 l24 -14 h30 l-24 14z" fill="url(#{p}panel)" stroke="#8AC0E8" stroke-width=".8"/>' for x in range(560, 900, 40))
    channels = ('<path d="M600 156 Q596 190 606 216 Q612 234 594 250 M606 216 Q630 226 660 224 Q690 222 720 236 M606 216 Q590 236 560 246 Q540 252 520 270 M660 224 Q700 236 700 262 M596 250 Q600 270 616 290"/>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="900" cy="150" r="150" fill="url(#{p}sun)"/><circle cx="900" cy="150" r="28" fill="#FFF0C0"/>
<g fill="#B25A5A" opacity=".45"><ellipse cx="240" cy="70" rx="180" ry="7"/><ellipse cx="760" cy="40" rx="200" ry="8"/><ellipse cx="1060" cy="110" rx="120" ry="5"/></g>
<path d="M0 154 H1200 V420 H0z" fill="url(#{p}gulf)"/>
<path d="M0 154 H1200 V160 H0z" fill="#F0A070" opacity=".6"/>
<path d="M470 200 Q560 176 680 190 Q820 206 960 214 Q900 260 780 270 Q660 280 560 258 Q470 240 470 200z" fill="url(#{p}dead)"/>
<path d="M-40 156 Q100 160 220 172 Q380 186 540 168 Q600 160 620 200 Q640 240 700 246 Q740 250 760 300 Q780 340 700 360 Q640 370 620 340 Q600 320 560 332 Q520 344 500 300 Q480 260 420 250 Q300 240 200 260 Q100 280 -40 270z" fill="url(#{p}land)"/>
<path d="M600 156 Q596 190 606 216 Q612 234 594 250" stroke="#2A6E80" stroke-width="10" fill="none" stroke-linecap="round"/>
<g fill="none" stroke="#2A6E80" stroke-width="4" stroke-linecap="round">{channels}</g>
<g fill="none" stroke="#F0A070" stroke-width="1.2" stroke-linecap="round" opacity=".55">{channels}</g>
<g fill="#4A8A90" opacity=".7"><ellipse cx="300" cy="222" rx="30" ry="6"/><ellipse cx="180" cy="238" rx="22" ry="5"/><ellipse cx="400" cy="230" rx="18" ry="4"/></g>
<g fill="#3A7A50"><ellipse cx="140" cy="200" rx="60" ry="6"/><ellipse cx="360" cy="192" rx="80" ry="6"/><ellipse cx="500" cy="212" rx="40" ry="4"/></g>
<path d="M0 306 Q300 292 600 300 T1200 296 V420 H0z" fill="url(#{p}levee)"/>
<path d="M0 306 Q300 292 600 300 T1200 296" stroke="#4A5A48" stroke-width="2" fill="none"/>
{panels}
{"".join(turb)}
<g transform="translate(760 92)"><path d="M0 0 q-30 -22 -70 -20 q26 6 52 22 q-6 8 -10 20 q20 -10 36 -12 q18 0 30 12 q-4 -14 -12 -20 q40 -2 76 -22 q-42 4 -78 12 q-8 -4 -24 -2z" fill="#1A0E1E"/><path d="M-20 4 q-8 14 -10 36" stroke="#1A0E1E" stroke-width="2" fill="none"/></g>
<g fill="#F0A070" opacity=".28"><ellipse cx="900" cy="240" rx="120" ry="5"/><ellipse cx="880" cy="262" rx="90" ry="4"/></g>
<g stroke="#0C1410" stroke-width="1.2" opacity=".5"><path d="M0 340 Q300 330 600 336 T1200 332 M0 380 Q300 372 600 378 T1200 374"/></g>
<g fill="#1E3A2A" opacity=".8"><path d="M30 316 q-5 -14 0 -26 q5 12 0 26z M52 320 q-4 -12 0 -22 q4 10 0 22z M1140 314 q-5 -14 0 -26 q5 12 0 26z"/></g>
'''
    return _wrap(26, body, defs)


# ───────────────────────── 27  Capstone: argue from evidence ─────────────────────────
def _b27():
    p = "sb27-"
    defs = (
        _lin(p+"wall", [(0, "#0F1E3E", None), (1, "#1A2E58", None)])
        + _lin(p+"board", [(0, "#122040", None), (1, "#0B1730", None)])
        + _lin(p+"desk", [(0, "#4A3A28", None), (.15, "#2E2418", None), (1, "#120E0A", None)])
        + _lin(p+"bar", [(0, "#F0F2F5", .95), (1, "#C0C8D8", .7)])
        + _rad(p+"lamp", [(0, "#FFE8A0", .45), (.6, "#FFE8A0", .06), (1, "#FFE8A0", 0)])
        + _rad(p+"lens", [(0, "#8AB8E8", .15), (.7, "#BFE0FF", .3), (1, "#FFFFFF", .5)])
    )
    heights = [30, 46, 58, 54, 74, 88, 96, 118]
    bars = "".join(f'<rect x="{110 + i*40}" y="{212 - h}" width="26" height="{h}" fill="url(#{p}bar)"/>' for i, h in enumerate(heights))
    trend = "M100 200 L440 84"
    # John Snow map: street grid + cluster of dots + pump
    g = _lcg(27)
    dots = []
    for _ in range(70):
        dx = next(g) % 140 - 70
        dy = next(g) % 90 - 45
        d = math.hypot(dx / 70, dy / 45)
        if d < 1:
            dots.append(f'<rect x="{800+dx:.0f}" y="{140+dy:.0f}" width="3" height="3"/>')
    dots = "".join(dots)
    streets = '<path d="M700 60 L900 60 M700 100 L900 100 M700 140 L910 140 M700 180 L900 180 M700 212 L900 212 M740 50 L740 212 M790 50 L800 212 M840 50 L850 212 M690 70 L910 200 M900 70 L700 190"/>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<circle cx="600" cy="0" r="300" fill="url(#{p}lamp)"/>
<rect x="60" y="40" width="1080" height="190" rx="3" fill="url(#{p}board)"/>
<rect x="60" y="40" width="1080" height="190" rx="3" fill="none" stroke="#8A7040" stroke-width="4"/>
<rect x="60" y="230" width="1080" height="8" fill="#6A5430"/>
<g stroke="#E8ECF2" stroke-width="2" opacity=".9"><path d="M96 70 V212 H460"/></g>
<g stroke="#E8ECF2" stroke-width="1" opacity=".3"><path d="M96 100 H460 M96 140 H460 M96 180 H460"/></g>
{bars}
<path d="{trend}" stroke="#F2C24A" stroke-width="3" stroke-linecap="round"/>
<g fill="#F2C24A"><circle cx="122" cy="180" r="4"/><circle cx="202" cy="152" r="4"/><circle cx="282" cy="130" r="4"/><circle cx="362" cy="110" r="4"/><circle cx="426" cy="90" r="4"/></g>
<g stroke="#E8ECF2" stroke-width="1.2" opacity=".35">{streets}</g>
<g fill="#F2C24A" opacity=".9">{dots}</g>
<g transform="translate(800 140)"><path d="M-8 22 h16 v-30 q0 -10 -8 -10 q-8 0 -8 10z" fill="#E8ECF2"/><path d="M-6 -22 v-16 h12 v16z M-10 -38 h20 v-6 h-20z" fill="#E8ECF2"/><path d="M8 -6 h14 l4 6 M22 -6 v14" stroke="#E8ECF2" stroke-width="4" fill="none" stroke-linecap="round"/><circle r="40" fill="none" stroke="#F2C24A" stroke-width="1.5" stroke-dasharray="4 5" opacity=".8"/></g>
<g stroke="#E8ECF2" stroke-width="2" opacity=".7"><path d="M960 80 h140 M960 112 h100 M960 144 h130 M960 176 h90"/></g>
<rect x="960" y="60" width="140" height="6" fill="#F2C24A" opacity=".8"/>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}desk)"/>
<path d="M0 262 H1200 V266 H0z" fill="#5A4A34"/>
<g transform="translate(560 270)"><path d="M-110 0 l4 -50 h130 l-4 50z" fill="#F2F4F6"/><path d="M-118 0 l4 -50 h12 l-4 50z" fill="#C0C8D8"/><g stroke="#3A5AA0" stroke-width="1.2" opacity=".6"><path d="M-84 -38 h80 M-86 -30 h60 M-88 -22 h74 M-90 -14 h52 M-92 -6 h68"/></g><path d="M-50 -34 h30" stroke="#F2C24A" stroke-width="3"/></g>
<g transform="translate(760 262)"><path d="M0 0 l60 -30" stroke="#5A4A34" stroke-width="10" stroke-linecap="round"/><path d="M0 0 l60 -30" stroke="#8A7040" stroke-width="6" stroke-linecap="round"/><circle cx="90" cy="-46" r="34" fill="url(#{p}lens)" stroke="#8A7040" stroke-width="5"/><circle cx="90" cy="-46" r="34" fill="none" stroke="#3A2A18" stroke-width="1.5"/><path d="M72 -60 q10 -12 24 -12" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity=".7"/></g>
<g transform="translate(280 262)"><path d="M-70 0 v-14 h140 v14z" fill="#1A2E58"/><path d="M-70 -14 q20 -8 70 -8 q50 0 70 8 v14 h-140z" fill="#2A4A88"/><path d="M-58 -10 h116" stroke="#F2F4F6" stroke-width="2"/></g>
<g fill="#F2F4F6" opacity=".8"><rect x="360" y="252" width="40" height="10" rx="2"/></g>
<g stroke="#120E0A" stroke-width="1.2" opacity=".5"><path d="M0 330 H1200 M0 386 H1200"/></g>
<g fill="#FFE8A0" opacity=".08"><ellipse cx="600" cy="300" rx="400" ry="14"/></g>
<g fill="#8A7040"><rect x="100" y="238" width="60" height="6" rx="2"/><rect x="1040" y="238" width="40" height="6" rx="2"/></g>
<g fill="#F2F4F6" opacity=".9"><rect x="104" y="232" width="14" height="6" rx="1"/><rect x="122" y="232" width="14" height="6" rx="1"/></g>
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
