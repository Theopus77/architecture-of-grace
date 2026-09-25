"""Unit banners for the U.S. History course (grades 6-8).

Ten drawn, layered silhouette landscapes as inline SVG.  Stdlib only.

    from banners import BANNERS, CREDITS, banner
    banner(3)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"ub{n}-" so several banners can sit on one page.  No text, no images,
no external references; at most one light feTurbulence per banner.

Page CSS note:
    .ush-banner svg { width:100%; height:100%; display:block; }
The page sits the banner over a #0A1E33 band and paints a dark gradient
over the bottom ~45% for the unit title, so the lower part of every scene
is kept calm (ground planes, water, road) and the action sits in the
upper 55%.
"""

import math

W, H = 1200, 420

CREDITS = {
    1: "Drawn scene: the great mound of Cahokia at dusk on the Mississippi floodplain, with a palisade and a canoe on the river",
    2: "Drawn scene: a palisaded English settlement on a tidewater coast at dawn, a ship at anchor, tobacco fields and marsh grass",
    3: "Drawn scene: a New England meeting house and village green at night, a lantern in the steeple and a rider on the road",
    4: "Drawn scene: a paddle steamboat on a misty river at morning beside a mill with a water wheel",
    5: "Drawn scene: a wagon train crossing a wide plain toward far mountains under a big sky with a storm edge",
    6: "Drawn scene: a split-rail fence and field at dawn, a farmhouse under scaffold being rebuilt, a railroad trestle and a flag on a pole",
    7: "Drawn scene: a steel bridge with a locomotive crossing a lake, a smokestack skyline and an early skyscraper beyond",
    8: "Drawn scene: a rain-slick city street at night with a breadline awning and a theater marquee, an aircraft high above",
    9: "Drawn scene: a suburban street at twilight with a ranch house and TV antenna, a diner sign, a rocket contrail, and a marching crowd on the far street",
    10: "Drawn scene: a night skyline with a satellite arc, wind turbines on the horizon, and a highway of light trails",
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


def _stars(seed, n, ymax, color="#fff", op=".8"):
    # small deterministic LCG so the module needs no random import
    x, out = seed, []
    for _ in range(n):
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        px = x % W
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        py = x % ymax
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        r = 0.6 + (x % 10) / 10
        out.append(f'<circle cx="{px}" cy="{py}" r="{r:.1f}"/>')
    return f'<g fill="{color}" opacity="{op}">{"".join(out)}</g>'


def _wrap(n, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[n]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


# ───────────────────────── 1  Early Encounters: Cahokia at dusk ─────────────────────────
def _b1():
    p = "ub1-"
    defs = (
        _lin(p+"sky", [(0, "#3B2352", None), (.45, "#7A3F5C", None), (.72, "#D9793E", None), (.92, "#F2B65A", None)])
        + _rad(p+"sun", [(0, "#FFE7A8", 1), (.35, "#F7B04E", .7), (1, "#F7B04E", 0)])
        + _lin(p+"far", [(0, "#5E3B5A", None), (1, "#3E2C4A", None)])
        + _lin(p+"mound", [(0, "#5A4A3A", None), (.6, "#3A3128", None), (1, "#251F1A", None)])
        + _lin(p+"river", [(0, "#C88554", .9), (.5, "#6E4C5A", .9), (1, "#2C2338", 1)])
        + _lin(p+"fg", [(0, "#1C1A22", None), (1, "#0F0E14", None)])
    )
    trees = "".join(f'<path d="M{x} 262 q-8 -18 0 -34 q8 16 0 34z"/>' for x in range(30, 330, 26))
    trees2 = "".join(f'<ellipse cx="{x}" cy="{258+(x%3)*2}" rx="{14+(x%5)*2}" ry="{8+(x%4)}"/>' for x in range(900, 1220, 40))
    posts = "".join(f'<path d="M{x} 268 v-22 l3 -5 l3 5 v22z"/>' for x in range(390, 1010, 9))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="700" cy="255" r="150" fill="url(#{p}sun)"/>
<ellipse cx="700" cy="252" rx="36" ry="30" fill="#FFE2A0" opacity=".9"/>
<g fill="#7A3F5C" opacity=".35"><ellipse cx="260" cy="120" rx="190" ry="11"/><ellipse cx="880" cy="92" rx="240" ry="13"/><ellipse cx="1040" cy="150" rx="150" ry="8"/><ellipse cx="500" cy="165" rx="120" ry="6"/></g>
<path d="M0 262 Q200 250 380 258 T760 254 T1200 262 V300 H0z" fill="url(#{p}far)"/>
<g fill="#3E2C4A">{trees}</g><g fill="#43304E">{trees2}</g>
<path d="M370 270 L455 222 Q470 216 490 214 L560 176 Q600 164 640 176 L720 214 Q745 218 760 224 L845 270z" fill="url(#{p}mound)"/>
<path d="M455 222 L490 214 L480 224z M720 214 L760 224 L735 222z" fill="#6A5642" opacity=".55"/>
<path d="M470 218 h60 v-4 h-60z M676 208 h50 v-4 h-50z" fill="#6A5642" opacity=".5"/>
<path d="M556 178 h90 l-4 -6 h-82z" fill="#1F1A18"/>
<path d="M598 172 h12 v-16 h-12z M584 178 h40 l-2 -4 h-36z" fill="#1F1A18"/>
<g fill="#2A2320">{posts}</g>
<g fill="#2A2320"><ellipse cx="300" cy="268" rx="46" ry="12"/><path d="M256 268 L300 246 L344 268z"/><ellipse cx="960" cy="270" rx="44" ry="11"/><path d="M918 270 L960 250 L1002 270z"/><ellipse cx="1080" cy="268" rx="30" ry="9"/></g>
<path d="M0 272 H1200 V420 H0z" fill="url(#{p}river)"/>
<g stroke="#F2B65A" stroke-width="1.2" opacity=".35" fill="none"><path d="M560 300 q80 -6 160 0"/><path d="M520 322 q120 -8 240 0"/><path d="M600 346 q70 -4 140 0"/></g>
<g fill="#15121A"><path d="M560 314 q30 -6 62 -4 q10 0 8 3 q-30 5 -70 5 q-6 0 0 -4z"/><path d="M556 312 l-8 -8 M632 311 l8 -8" stroke="#15121A" stroke-width="2.5" fill="none"/><path d="M596 310 l4 -12 l4 12z"/><circle cx="600" cy="297" r="2.4"/><path d="M604 302 l8 12" stroke="#15121A" stroke-width="1.6"/></g>
<path d="M540 320 q60 8 130 0" stroke="#2C2338" stroke-width="1" fill="none" opacity=".5"/>
<path d="M0 360 Q120 340 260 352 T520 350 T860 354 T1200 350 V420 H0z" fill="url(#{p}fg)"/>
<g fill="#0E0D12"><path d="M62 352 q-14 -26 0 -52 q14 26 0 52z"/><path d="M88 356 q-12 -22 0 -44 q12 22 0 44z"/><path d="M1120 350 q-13 -24 0 -48 q13 24 0 48z"/><path d="M1150 354 q-10 -20 0 -40 q10 20 0 40z"/></g>
<g fill="#F2B65A" opacity=".9"><circle cx="590" cy="184" r="1.6"/><circle cx="610" cy="186" r="1.6"/></g>
'''
    return _wrap(1, body, defs)


# ───────────────────────── 2  English Settlement: tidewater dawn ─────────────────────────
def _b2():
    p = "ub2-"
    defs = (
        _lin(p+"sky", [(0, "#6E8FA1", None), (.4, "#B9C9B5", None), (.72, "#F1DCA2", None), (.9, "#F7E9C6", None)])
        + _rad(p+"glow", [(0, "#FFF6D6", .95), (.4, "#F5D98E", .55), (1, "#F5D98E", 0)])
        + _lin(p+"sea", [(0, "#D6D2A6", .95), (.5, "#6F9C8D", .95), (1, "#3D6B62", 1)])
        + _lin(p+"land", [(0, "#4C5F3F", None), (1, "#2D3B27", None)])
        + _lin(p+"field", [(0, "#5E6E3C", None), (1, "#33401F", None)])
        + _lin(p+"fg", [(0, "#22301F", None), (1, "#101A12", None)])
        + _lin(p+"sail", [(0, "#F6EEDC", None), (1, "#C9BFA0", None)])
    )
    far_trees = "M0 244 V222 Q40 208 80 220 Q110 200 150 218 Q190 206 230 220 Q270 212 310 224 Q350 204 390 222 Q430 214 470 230 L496 244z"
    posts = "".join(f'<path d="M{x} 250 v-26 l3 -5 l3 5 v26z"/>' for x in range(560, 900, 8))
    rows = "".join(f'<path d="M{x} 300 L{x-40+ (x-600)//6} 372" stroke="#3F5028" stroke-width="2"/>' for x in range(640, 1180, 45))
    tob = "".join(f'<path d="M{x} 300 q-6 -16 0 -22 q6 6 0 22z M{x+5} 300 q6 -14 0 -20 q-6 6 0 20z" fill="#3B4E24"/>' for x in range(650, 1190, 45))
    marsh = "".join(f'<path d="M{x} 380 l3 -34 l2 34z"/>' for x in range(10, 340, 18))
    def sail(x, y, w, h):
        b = int(w * 0.08)
        return f'<path d="M{x} {y} h{w} q-{b} {h//2} 0 {h} h-{w} q{b} -{h//2} 0 -{h}z"/>'
    sails = sail(-62,-100,44,30)+sail(-60,-66,40,38)+sail(-14,-128,68,32)+sail(-12,-92,64,30)+sail(-10,-58,60,34)+sail(56,-84,40,30)+sail(58,-50,36,26)
    ship = ('<g transform="translate(360 248)">'
            '<path d="M-96 0 q10 -16 20 -18 h150 q30 -4 46 -20 q-6 24 -26 38z" fill="#2B3A2B"/>'
            '<path d="M-76 -18 h150 v-6 h-150z" fill="#3E4B36"/>'
            '<path d="M120 -36 l38 -18" stroke="#2B3A2B" stroke-width="3"/>'
            '<g stroke="#2B3A2B" stroke-width="3"><path d="M-40 -18 v-108 M20 -18 v-124 M76 -18 v-96"/></g>'
            '<g stroke="#2B3A2B" stroke-width="2"><path d="M-64 -100 h48 M-62 -66 h44 M-16 -128 h72 M-14 -92 h68 M-12 -58 h64 M54 -84 h44 M56 -50 h40"/></g>'
            f'<g fill="url(#{p}sail)">{sails}</g>'
            '<path d="M20 -142 l14 4 l-14 4z M-40 -126 l12 3 l-12 3z" fill="#B0463B"/>'
            '<path d="M-8 -30 v-140" stroke="#2B3A2B" stroke-width="1" opacity=".7"/></g>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="380" cy="236" r="180" fill="url(#{p}glow)"/>
<g fill="#F7E9C6" opacity=".6"><ellipse cx="180" cy="90" rx="160" ry="8"/><ellipse cx="820" cy="70" rx="220" ry="10"/><ellipse cx="1020" cy="120" rx="130" ry="6"/></g>
<path d="{far_trees}" fill="#6F8A6A" opacity=".85"/><g fill="#5F7A5C" opacity=".9"><path d="M60 226 l8 -22 l8 22z M150 224 l7 -20 l7 20z M240 224 l8 -24 l8 24z M330 226 l7 -20 l7 20z M420 228 l8 -22 l8 22z"/></g><path d="M0 238 Q240 232 490 236 V244 H0z" fill="#7F9A80"/>
<path d="M0 232 H1200 V420 H0z" fill="url(#{p}sea)"/>
<g stroke="#F7E9C6" stroke-width="1" opacity=".4" fill="none"><path d="M60 250 h80 M200 262 h120 M20 280 h140 M120 292 h200 M340 270 h90"/></g>
{ship}
<path d="M520 258 Q700 240 900 250 T1200 246 V300 H520z" fill="url(#{p}land)"/>
<g fill="#26301F"><path d="M600 250 h60 l-30 -30z M600 250 v-20 h60 v20"/><path d="M700 250 h80 l-40 -36z M700 250 v-24 h80 v24"/><path d="M810 250 h50 l-25 -26z M810 250 v-16 h50 v16"/><path d="M745 214 h5 v-14 h-5z"/></g>
<g fill="#2C3823">{posts}</g>
<path d="M556 224 h10 v-40 h-10z M888 224 h10 v-40 h-10z" fill="#1F2A1A"/>
<path d="M556 186 h12 l-6 -12z M888 186 h12 l-6 -12z" fill="#1F2A1A"/>
<path d="M600 300 Q800 290 1200 296 V420 H600z" fill="url(#{p}field)"/>
<g opacity=".8">{rows}</g>{tob}
<path d="M0 340 Q160 330 340 344 T700 356 T1200 350 V420 H0z" fill="url(#{p}fg)"/>
<g fill="#16221A">{marsh}</g>
<path d="M440 246 l30 -3 l-3 10 h-30z" fill="#1D2A22"/>
'''
    return _wrap(2, body, defs)


# ───────────────────────── 3  A New Nation: meeting house at night ─────────────────────────
def _b3():
    p = "ub3-"
    defs = (
        _lin(p+"sky", [(0, "#070C24", None), (.6, "#182A58", None), (1, "#2B3E6E", None)])
        + _rad(p+"moon", [(0, "#F5F1DE", 1), (.25, "#E8E4CC", .8), (1, "#E8E4CC", 0)])
        + _rad(p+"lamp", [(0, "#FFE39A", .95), (.5, "#FFB84A", .35), (1, "#FFB84A", 0)])
        + _lin(p+"hill", [(0, "#1A2A4C", None), (1, "#0F1A34", None)])
        + _lin(p+"house", [(0, "#22304F", None), (1, "#0D1428", None)])
        + _lin(p+"green", [(0, "#12213C", None), (1, "#0A1428", None)])
    )
    trees = "".join(f'<path d="M{x} 262 q-{10+(x%3)*3} -30 0 -58 q{10+(x%3)*3} 28 0 58z"/>' for x in range(40, 420, 34))
    trees2 = "".join(f'<ellipse cx="{x}" cy="{250-(x%4)*3}" rx="{18+(x%3)*4}" ry="{18+(x%5)*2}"/>' for x in range(860, 1230, 46))
    fence = "".join(f'<rect x="{x}" y="318" width="3" height="18"/>' for x in range(130, 500, 14))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(31, 60, 230, "#E8E9F5", ".75")}
<circle cx="980" cy="86" r="90" fill="url(#{p}moon)"/><circle cx="980" cy="86" r="26" fill="#F5F1DE"/><circle cx="972" cy="78" r="6" fill="#DCD8C2" opacity=".5"/><circle cx="990" cy="92" r="4" fill="#DCD8C2" opacity=".5"/>
<g fill="#182A58" opacity=".7"><ellipse cx="300" cy="70" rx="180" ry="9"/><ellipse cx="760" cy="120" rx="220" ry="10"/></g>
<path d="M0 270 Q300 236 600 258 T1200 250 V330 H0z" fill="url(#{p}hill)"/>
<g fill="#0E1934">{trees}</g><g fill="#0E1934">{trees2}</g>
<circle cx="606" cy="150" r="60" fill="url(#{p}lamp)"/>
<g fill="url(#{p}house)">
<path d="M500 316 V228 H700 V316z"/><path d="M490 232 L600 176 L710 232z"/>
<path d="M580 176 V128 H632 V176z"/><path d="M574 130 L606 106 L638 130z"/><path d="M598 106 L606 76 L614 106z"/>
</g>
<path d="M600 78 v-10 M596 72 h8" stroke="#3A4C78" stroke-width="1.6"/>
<rect x="592" y="132" width="28" height="26" rx="2" fill="#FFCF6E"/><path d="M606 132 v26 M592 145 h28" stroke="#101a36" stroke-width="1.5"/>
<g fill="#F2B95C" opacity=".95"><rect x="522" y="250" width="16" height="26"/><rect x="556" y="250" width="16" height="26"/><rect x="628" y="250" width="16" height="26"/><rect x="662" y="250" width="16" height="26"/><rect x="522" y="288" width="16" height="20"/><rect x="662" y="288" width="16" height="20"/></g>
<rect x="588" y="270" width="24" height="46" fill="#0A1024"/>
<g fill="url(#{p}house)"><path d="M800 316 v-60 h110 v60z M792 258 l63 -34 l63 34z"/><path d="M150 316 v-52 h90 v52z M142 266 l53 -30 l53 30z"/><rect x="880" y="222" width="10" height="34"/></g>
<g fill="#F2B95C" opacity=".85"><rect x="822" y="272" width="12" height="16"/><rect x="866" y="272" width="12" height="16"/><rect x="172" y="278" width="12" height="16"/></g>
<path d="M0 316 H1200 V420 H0z" fill="url(#{p}green)"/>
<g fill="#0A1024">{fence}</g><path d="M130 322 H500 M130 330 H500" stroke="#0A1024" stroke-width="2"/>
<path d="M1200 318 Q900 312 600 322 T0 318 V342 Q300 330 600 334 T1200 330z" fill="#141F3C"/>
<g fill="#050916"><path d="M330 334 q6 -20 24 -22 q16 -2 26 8 l16 -2 q6 2 4 8 l-6 4 l6 12 h-6 l-6 -10 l-10 2 l-2 10 h-6 v-10 l-16 -2 l-4 12 h-6 l2 -12 q-14 -2 -16 2z"/><path d="M356 314 q4 -14 12 -16 q6 -2 6 6 l-4 12z"/><path d="M366 304 l3 -8 l3 8z"/><path d="M368 300 h9 l-3 -2z"/></g>
<path d="M348 300 q6 -10 14 -8" stroke="#F2B95C" stroke-width="1.5" fill="none" opacity=".8"/>
'''
    return _wrap(3, body, defs)


# ───────────────────────── 4  Early Republic: steamboat and mill in mist ─────────────────────────
def _b4():
    p = "ub4-"
    defs = (
        _lin(p+"sky", [(0, "#8FB3CF", None), (.5, "#CFE0EA", None), (1, "#F3EEDF", None)])
        + _lin(p+"mist", [(0, "#F3EEDF", 0), (.6, "#F3EEDF", .75), (1, "#F3EEDF", .9)])
        + _lin(p+"far", [(0, "#8CA6B8", None), (1, "#6F8CA1", None)])
        + _lin(p+"mid", [(0, "#5E7A8E", None), (1, "#46617A", None)])
        + _lin(p+"water", [(0, "#B9CFDC", None), (.5, "#7F9DB2", None), (1, "#48627A", None)])
        + _lin(p+"fg", [(0, "#2E4054", None), (1, "#1B2A3A", None)])
        + _lin(p+"boat", [(0, "#F6F1E4", None), (1, "#C9C0AC", None)])
    )
    trees = "".join(f'<path d="M{x} 258 q-{12+(x%3)*4} -40 0 -80 q{12+(x%3)*4} 40 0 80z"/>' for x in range(20, 340, 30))
    trees2 = "".join(f'<ellipse cx="{x}" cy="{246-(x%3)*4}" rx="{22+(x%4)*4}" ry="{20+(x%5)*3}"/>' for x in range(880, 1230, 44))
    spokes = "".join(f'<path d="M292 300 l{int(34*math.cos(a*3.14159/6)):d} {int(34*math.sin(a*3.14159/6)):d}"/>' for a in range(12))
    windows = "".join(f'<rect x="{x}" y="{y}" width="8" height="10"/>' for y in (214, 236, 258) for x in range(198, 268, 18))
    deck = "".join(f'<rect x="{x}" y="{y}" width="6" height="8"/>' for y in (218, 236) for x in range(560, 700, 14))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="880" cy="110" r="34" fill="#FBF7EA" opacity=".9"/>
<path d="M0 262 Q200 200 420 236 T800 226 T1200 236 V320 H0z" fill="url(#{p}far)"/>
<rect y="200" width="1200" height="130" fill="url(#{p}mist)"/>
<path d="M0 272 Q160 258 320 266 T640 264 T1000 268 T1200 262 V330 H0z" fill="url(#{p}mid)"/>
<g fill="#47627A">{trees}</g><g fill="#4C6A84">{trees2}</g>
<g fill="url(#{p}fg)"><path d="M180 300 V196 H280 V300z"/><path d="M172 200 L230 160 L288 200z"/><rect x="250" y="164" width="10" height="26"/></g>
<g fill="#EBD9A2" opacity=".9">{windows}</g>
<circle cx="292" cy="300" r="34" fill="none" stroke="#1B2A3A" stroke-width="5"/><g stroke="#1B2A3A" stroke-width="3">{spokes}</g><circle cx="292" cy="300" r="6" fill="#1B2A3A"/>
<path d="M300 292 q20 6 36 -2" stroke="#F3EEDF" stroke-width="2" fill="none" opacity=".7"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}water)"/>
<g fill="url(#{p}boat)">
<path d="M520 300 q6 -20 20 -22 h180 q16 2 22 22z"/>
<rect x="548" y="246" width="164" height="32" rx="2"/><rect x="556" y="214" width="148" height="32" rx="2"/><rect x="600" y="196" width="60" height="18"/>
</g>
<g fill="#3B4F63" opacity=".85">{deck}</g>
<rect x="580" y="140" width="12" height="60" fill="#2E4054"/><rect x="662" y="140" width="12" height="60" fill="#2E4054"/><rect x="576" y="136" width="20" height="8" fill="#2E4054"/><rect x="658" y="136" width="20" height="8" fill="#2E4054"/>
<g fill="#DDE6EC" opacity=".8"><ellipse cx="580" cy="118" rx="16" ry="10"/><ellipse cx="562" cy="98" rx="22" ry="13"/><ellipse cx="530" cy="80" rx="30" ry="15"/><ellipse cx="670" cy="120" rx="14" ry="9"/><ellipse cx="652" cy="100" rx="20" ry="12"/><ellipse cx="620" cy="82" rx="26" ry="14"/></g>
<circle cx="712" cy="278" r="26" fill="#2E4054"/><circle cx="712" cy="278" r="18" fill="#C9C0AC"/><g stroke="#2E4054" stroke-width="3"><path d="M712 260 v36 M694 278 h36 M699 265 l26 26 M725 265 l-26 26"/></g>
<path d="M720 264 v-22 h4 v22z" fill="#2E4054"/>
<g fill="#F3EEDF" opacity=".35"><path d="M520 322 q100 6 220 0 q-110 10 -220 0z"/><path d="M180 336 q60 4 140 0 q-70 8 -140 0z"/></g>
<path d="M0 372 Q140 362 300 370 T600 376 T900 372 T1200 378 V420 H0z" fill="#1F2E40"/>
<g fill="#F3EEDF" opacity=".5"><ellipse cx="300" cy="360" rx="260" ry="10"/><ellipse cx="900" cy="350" rx="220" ry="9"/></g>
'''
    return _wrap(4, body, defs)


# ───────────────────────── 5  Pushing Boundaries: wagon train on the plain ─────────────────────────
def _b5():
    p = "ub5-"
    defs = (
        _lin(p+"sky", [(0, "#3F4C5C", None), (.35, "#7C8A93", None), (.62, "#C6B790", None), (.85, "#E4C980", None)])
        + _lin(p+"storm", [(0, "#2C3540", .95), (1, "#4E5A66", 0)])
        + _lin(p+"mtn", [(0, "#6B7481", None), (1, "#4B5563", None)])
        + _lin(p+"mtn2", [(0, "#8A8E86", None), (1, "#5E6660", None)])
        + _lin(p+"plain", [(0, "#A79A6A", None), (1, "#7C7250", None)])
        + _lin(p+"fg", [(0, "#4E4B3A", None), (1, "#2E2C22", None)])
    )
    def wagon(x, y, s):
        return (f'<g transform="translate({x} {y}) scale({s})" fill="#2E2C22">'
                f'<path d="M0 0 q12 -30 30 -30 h56 q18 0 30 30z" fill="#E9E1CC"/>'
                f'<path d="M-2 0 h122 l-4 10 h-114z"/><circle cx="22" cy="14" r="7"/><circle cx="96" cy="14" r="8"/>'
                f'<path d="M-2 4 h-24 l-14 -6 l-8 6 l-6 -8 q10 -14 22 -10 l14 2 l8 4 h10z"/>'
                f'<path d="M-46 12 l-6 -8 l6 -8 M-30 12 l-6 -8 l6 -8" stroke="#2E2C22" stroke-width="3" fill="none"/></g>')
    sage = "".join(f'<ellipse cx="{x}" cy="{384+(x%5)*2}" rx="{8+(x%4)*3}" ry="{5+(x%3)}"/>' for x in range(10, 1200, 38))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<path d="M0 0 H1200 V96 Q1000 130 820 120 Q640 150 460 176 Q260 200 0 190z" fill="url(#{p}storm)"/>
<g fill="#2C3540" opacity=".3"><ellipse cx="160" cy="150" rx="260" ry="30"/><ellipse cx="560" cy="140" rx="240" ry="26"/><ellipse cx="340" cy="100" rx="300" ry="34"/></g>
<g fill="#3A434E" opacity=".35"><path d="M60 180 l40 90 h30 l-30 -90z"/><path d="M180 186 l30 80 h26 l-24 -80z"/></g>
<path d="M330 150 l-6 26 l10 -4 l-10 30" stroke="#F3E9C4" stroke-width="2" fill="none" opacity=".85"/>
<path d="M0 260 L120 222 L200 244 L300 200 L380 232 L470 206 L560 240 L640 216 L720 238 L820 208 L900 236 L980 214 L1080 240 L1200 210 V300 H0z" fill="url(#{p}mtn)"/>
<g fill="#E9E9E6" opacity=".85"><path d="M300 200 l12 12 l-6 4 l-8 -6 l-6 6 l-8 -2z"/><path d="M820 208 l14 12 l-8 4 l-10 -8 l-6 4 l-4 -2z"/><path d="M980 214 l10 10 l-8 2 l-8 -4z"/></g>
<path d="M0 282 L160 258 L260 270 L400 252 L520 268 L680 250 L800 266 L940 254 L1060 270 L1200 250 V320 H0z" fill="url(#{p}mtn2)"/>
<path d="M0 284 H1200 V420 H0z" fill="url(#{p}plain)"/>
<path d="M0 306 Q400 296 1200 300 V330 Q600 322 0 330z" fill="#8E8358" opacity=".8"/>
{wagon(760, 296, .38)}{wagon(880, 298, .42)}{wagon(1000, 300, .46)}
<path d="M0 346 Q300 318 700 316 T1200 308 V330 Q800 326 400 334 T0 362z" fill="#B0A16A" opacity=".5"/>
{wagon(560, 318, .62)}{wagon(340, 326, .8)}{wagon(80, 334, 1)}
<g fill="#2E2C22"><path d="M700 322 l4 -12 l3 3 l3 -3 l4 12 l-2 8 h-10z"/><circle cx="707" cy="308" r="3"/><path d="M712 308 l12 -8 l2 3 l-13 8z"/></g>
<g fill="#2E2C22"><ellipse cx="250" cy="330" rx="7" ry="4"/><ellipse cx="820" cy="326" rx="6" ry="3"/><ellipse cx="1140" cy="322" rx="6" ry="3"/></g>
<path d="M0 392 Q300 380 600 390 T1200 386 V420 H0z" fill="url(#{p}fg)"/>
<g fill="#3A3728">{sage}</g>
'''
    return _wrap(5, body, defs)


# ───────────────────────── 6  Civil War & Reconstruction: field at dawn ─────────────────────────
def _b6():
    p = "ub6-"
    defs = (
        _lin(p+"sky", [(0, "#5A5566", None), (.35, "#9C8593", None), (.62, "#D9A98E", None), (.85, "#F0C877", None)])
        + _rad(p+"sun", [(0, "#FFF0C0", 1), (.4, "#F5C86E", .6), (1, "#F5C86E", 0)])
        + _lin(p+"far", [(0, "#7A6B78", None), (1, "#5C5364", None)])
        + _lin(p+"mid", [(0, "#6A6156", None), (1, "#4B453E", None)])
        + _lin(p+"field", [(0, "#8A7C4E", None), (1, "#5B5236", None)])
        + _lin(p+"fg", [(0, "#3B3428", None), (1, "#1E1A14", None)])
    )
    trestle = "".join(f'<path d="M{x} 250 v-24 h4 v24z M{x-6} 250 l10 -24 M{x+10} 250 l-10 -24"/>' for x in range(760, 1120, 36))
    scaffold = "".join(f'<path d="M{x} 316 v-98" stroke="#2A2620" stroke-width="2.5"/>' for x in (470, 520, 570, 620, 670))
    rungs = "".join(f'<path d="M462 {y} h216" stroke="#2A2620" stroke-width="2"/>' for y in (232, 258, 284))
    rails = "".join(f'<path d="M{x} 322 l68 -8 M{x} 336 l68 -8 M{x} 350 l68 -8"/>' for x in range(-4, 1200, 68))
    posts = "".join(f'<path d="M{x} 314 v44"/>' for x in range(64, 1200, 68))
    stubble = "".join(f'<path d="M{x} 316 l2 -8 M{x+5} 316 l-2 -9"/>' for x in range(10, 1200, 30))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="880" cy="250" r="160" fill="url(#{p}sun)"/><ellipse cx="880" cy="250" rx="30" ry="22" fill="#FFF2C8"/>
<g fill="#9C8593" opacity=".45"><ellipse cx="240" cy="70" rx="230" ry="9"/><ellipse cx="680" cy="110" rx="160" ry="6"/><ellipse cx="1080" cy="70" rx="150" ry="7"/></g>
<path d="M0 252 Q200 226 400 242 T760 250 T1200 240 V300 H0z" fill="url(#{p}far)"/>
<path d="M740 250 H1140 V242 H740z" fill="#2A2620"/><g fill="#2A2620" stroke="#2A2620" stroke-width="1.5">{trestle}</g>
<path d="M0 270 Q160 262 330 268 T700 262 T1200 270 V330 H0z" fill="url(#{p}mid)"/>
<g fill="#3F3833"><path d="M60 268 q-14 -34 0 -68 q14 34 0 68z"/><path d="M100 270 q-10 -30 0 -60 q10 30 0 60z"/><ellipse cx="1130" cy="256" rx="30" ry="18"/><ellipse cx="1175" cy="262" rx="26" ry="14"/></g>
<g fill="#2A2620"><path d="M480 316 V236 H660 V316z"/><path d="M466 240 L570 190 L674 240z"/><rect x="620" y="196" width="14" height="30"/></g>
<path d="M480 236 V262 H660 V236z" fill="#8A6F4C"/><path d="M480 262 V316 H540 V262z" fill="#6E5A40" opacity=".55"/>
<g opacity=".95">{scaffold}{rungs}</g><path d="M470 218 h200" stroke="#2A2620" stroke-width="3"/>
<path d="M450 316 v-20 l40 -18" stroke="#2A2620" stroke-width="3" fill="none"/>
<rect x="560" y="270" width="24" height="46" fill="#F0C877" opacity=".9"/>
<rect x="356" y="184" width="4" height="132" fill="#2A2620"/><circle cx="358" cy="181" r="4" fill="#2A2620"/>
<path d="M360 188 q30 6 58 -2 q-2 14 0 30 q-28 8 -58 2z" fill="#B0463B"/><path d="M360 188 q30 6 58 -2 v14 q-28 8 -58 2z" fill="#3B3F6A"/><g fill="#F6F0DD" opacity=".9"><path d="M364 196 h48 M364 206 h50 M360 214 q30 6 58 -2" stroke="#F6F0DD" stroke-width="1.6"/></g>
<path d="M0 316 H1200 V420 H0z" fill="url(#{p}field)"/><g stroke="#3A3222" stroke-width="1.2">{stubble}</g>
<g stroke="#1E1A14" stroke-width="5" stroke-linecap="round" fill="none">{rails}</g><g stroke="#2A2620" stroke-width="6">{posts}</g>
<path d="M0 396 Q300 388 600 394 T1200 390 V420 H0z" fill="url(#{p}fg)"/>
'''
    return _wrap(6, body, defs)


# ───────────────────────── 7  America on the Move: steel bridge over the lake ─────────────────────────
def _b7():
    p = "ub7-"
    defs = (
        _lin(p+"sky", [(0, "#2C3E55", None), (.5, "#5E7A94", None), (.8, "#B98A63", None), (1, "#D6A575", None)])
        + _lin(p+"smoke", [(0, "#2C3E55", 0), (1, "#57616A", .75)])
        + _lin(p+"city", [(0, "#3E4C5C", None), (1, "#2A3644", None)])
        + _lin(p+"lake", [(0, "#8A6A52", None), (.4, "#4C6478", None), (1, "#1E2E40", None)])
        + _lin(p+"steel", [(0, "#4A3B31", None), (1, "#2B2320", None)])
        + _lin(p+"fg", [(0, "#1E2630", None), (1, "#10161E", None)])
    )
    bld = [(20, 200, 40), (70, 184, 30), (110, 216, 60), (180, 176, 36), (226, 204, 50), (286, 160, 44), (340, 196, 40), (390, 220, 70), (470, 170, 30), (510, 206, 46), (566, 150, 24), (600, 188, 60), (670, 226, 40), (720, 202, 60), (790, 176, 28), (830, 214, 50), (890, 192, 32), (930, 222, 70), (1010, 206, 40), (1060, 172, 34), (1100, 210, 60), (1170, 196, 40)]
    city = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{262-y}"/>' for x, y, w in bld)
    stacks = "".join(f'<rect x="{x}" y="{y}" width="8" height="{262-y}"/>' for x, y in ((130, 120), (410, 128), (612, 110), (950, 132), (1110, 124)))
    plumes = "".join(f'<path d="M{x} {y} q-10 -30 10 -50 q26 -22 60 -30 q-30 26 -34 50 q-6 26 -36 30z"/>' for x, y in ((134, 120), (414, 128), (616, 110), (954, 132), (1114, 124)))
    sky_win = "".join(f'<rect x="{x}" y="{y}" width="5" height="7"/>' for y in range(96, 250, 14) for x in range(722, 776, 12))
    truss = "".join(f'<path d="M{x} 282 l40 -50 M{x+40} 232 l40 50" stroke="#3A2E27" stroke-width="4"/>' for x in range(300, 900, 80))
    cars = "".join(f'<rect x="{x}" y="256" width="46" height="24" rx="2"/>' for x in range(600, 840, 52))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<rect width="1200" height="230" fill="url(#{p}smoke)"/>
<g fill="#5E7A94" opacity=".5"><ellipse cx="220" cy="60" rx="200" ry="10"/><ellipse cx="900" cy="48" rx="220" ry="12"/></g>
<g fill="url(#{p}city)">{city}</g>
<g fill="#242E3A">{stacks}</g><g fill="#6E7780" opacity=".55">{plumes}</g>
<g fill="#2A3644"><path d="M710 262 V96 H786 V262z"/><path d="M704 100 H792 V92 H704z"/><path d="M714 92 V78 H782 V92z"/><path d="M746 78 l2 -22 l2 22z"/></g>
<g fill="#E4B274" opacity=".85">{sky_win}</g>
<path d="M0 262 H1200 V420 H0z" fill="url(#{p}lake)"/>
<g fill="#D6A575" opacity=".22"><path d="M660 296 q80 6 160 0 q-80 10 -160 0z"/><path d="M700 322 q40 4 90 0 q-45 8 -90 0z"/></g>
<path d="M240 232 Q600 178 960 232" stroke="#2B2320" stroke-width="7" fill="none"/>
<path d="M240 232 Q600 178 960 232" stroke="#2B2320" stroke-width="7" fill="none" transform="translate(0 6)"/>
{truss}
<g fill="url(#{p}steel)"><rect x="300" y="232" width="18" height="60"/><rect x="600" y="228" width="18" height="64"/><rect x="882" y="232" width="18" height="60"/><rect x="230" y="278" width="740" height="10"/></g>
<g fill="#5A3E33"><rect x="284" y="288" width="50" height="54"/><rect x="584" y="288" width="50" height="54"/><rect x="866" y="288" width="50" height="54"/></g>
<g fill="#161B22">{cars}<path d="M846 280 h-6 v-18 h8 v-10 h12 v10 h30 q8 0 10 8 v10z"/><rect x="852" y="240" width="10" height="16"/><rect x="866" y="246" width="8" height="10"/><rect x="884" y="252" width="18" height="16" rx="2"/></g>
<g fill="#C9B5A0" opacity=".7"><ellipse cx="856" cy="228" rx="10" ry="7"/><ellipse cx="838" cy="212" rx="14" ry="9"/><ellipse cx="812" cy="196" rx="20" ry="11"/><ellipse cx="776" cy="184" rx="26" ry="12"/></g>
<g fill="#E4B274" opacity=".7"><rect x="612" y="262" width="4" height="6"/><rect x="664" y="262" width="4" height="6"/><rect x="716" y="262" width="4" height="6"/><rect x="768" y="262" width="4" height="6"/><rect x="820" y="262" width="4" height="6"/></g>
<path d="M0 360 Q200 350 420 356 T820 352 T1200 358 V420 H0z" fill="url(#{p}fg)"/>
<g fill="#0E141B"><path d="M120 356 q4 -30 30 -30 h60 q26 0 30 30z"/><rect x="180" y="300" width="6" height="36"/><path d="M1000 356 q4 -22 20 -22 h90 q16 0 20 22z"/></g>
'''
    return _wrap(7, body, defs)


# ───────────────────────── 8  Twentieth-Century Crises: rain-slick street ─────────────────────────
def _b8():
    p = "ub8-"
    defs = (
        _lin(p+"sky", [(0, "#0C1418", None), (.6, "#193038", None), (1, "#2A4A50", None)])
        + _lin(p+"bld", [(0, "#1E2A30", None), (1, "#111A1F", None)])
        + _lin(p+"street", [(0, "#243239", None), (.3, "#151F25", None), (1, "#0B1114", None)])
        + _rad(p+"marq", [(0, "#FFC46A", .9), (.5, "#F58A3C", .35), (1, "#F58A3C", 0)])
        + _rad(p+"lamp", [(0, "#FFD68A", .9), (.6, "#F2A24C", .25), (1, "#F2A24C", 0)])
        + _lin(p+"refl", [(0, "#F58A3C", .55), (1, "#F58A3C", 0)])
        + _lin(p+"refl2", [(0, "#4FB3B3", .45), (1, "#4FB3B3", 0)])
        + f'<pattern id="{p}win" width="26" height="24" patternUnits="userSpaceOnUse"><rect x="6" y="6" width="8" height="12" fill="#E0B96B" opacity=".5"/></pattern>'
        + f'<pattern id="{p}win2" width="28" height="24" patternUnits="userSpaceOnUse"><rect x="8" y="4" width="8" height="12" fill="#E0B96B" opacity=".35"/><rect x="22" y="14" width="4" height="6" fill="#E0B96B" opacity=".2"/></pattern>'
    )
    bulbs = "".join(f'<circle cx="{x}" cy="{y}" r="2.6"/>' for y in (206, 246) for x in range(586, 806, 12))
    bulbs2 = "".join(f'<circle cx="{x}" cy="{y}" r="2.6"/>' for x in (586, 806) for y in range(218, 240, 12))
    # breadline: a queue of coated figures with hats, varied height, along the sidewalk
    people = "".join(f'<path d="M{x} 320 v-{42+(x%3)*4} q0 -8 6 -10 h6 q6 2 6 10 v{42+(x%3)*4}z M{x+4} {268-(x%3)*4} q5 -12 10 0 z M{x+2} {264-(x%3)*4} h14 l-2 -3 h-10z"/>' for x in range(96, 330, 22))
    rain = "".join(f'<path d="M{x} {y} l-3 12"/>' for x in range(20, 1200, 60) for y in (40, 110, 170))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#1E2A30" opacity=".6"><rect x="300" y="60" width="90" height="160"/><rect x="420" y="90" width="120" height="130"/><rect x="800" y="70" width="110" height="150"/></g>
<g fill="url(#{p}bld)"><rect x="30" y="60" width="240" height="260"/><rect x="560" y="110" width="270" height="210"/><rect x="920" y="40" width="260" height="280"/><rect x="380" y="150" width="180" height="170"/><rect x="820" y="140" width="100" height="180"/></g>
<rect x="40" y="70" width="220" height="150" fill="url(#{p}win)"/><rect x="930" y="50" width="240" height="180" fill="url(#{p}win2)"/><rect x="390" y="176" width="160" height="60" fill="url(#{p}win2)"/>
<g fill="#0B1114"><rect x="30" y="200" width="240" height="6"/><rect x="920" y="196" width="260" height="6"/></g>
<rect x="380" y="150" width="180" height="20" fill="#0B1114"/>
<path d="M70 238 L340 238 L322 262 H88z" fill="#5A4A34"/><path d="M70 238 L340 238 L322 262 H88z" fill="#F2A24C" opacity=".18"/>
<g stroke="#1B1410" stroke-width="2"><path d="M88 262 v58 M322 262 v58"/><path d="M114 238 l-6 24 M158 238 l-4 24 M202 238 l-2 24 M246 238 l0 24 M290 238 l2 24"/></g>
<rect x="60" y="264" width="30" height="56" fill="#3A2A1A"/><rect x="66" y="270" width="18" height="24" fill="#F2A24C" opacity=".7"/>
<g fill="#0B1114">{people}</g>
<circle cx="696" cy="226" r="130" fill="url(#{p}marq)"/>
<path d="M566 200 h260 v56 h-260z" fill="#1B1410"/><path d="M566 200 h260 v6 h-260z M566 250 h260 v6 h-260z" fill="#3A2A1A"/>
<rect x="596" y="214" width="200" height="24" fill="#FFF1D2" opacity=".8"/>
<g fill="#FFD27A">{bulbs}{bulbs2}</g>
<path d="M566 256 H826 L806 276 H586z" fill="#2A1E16"/>
<g fill="#F0C070" opacity=".9"><rect x="620" y="280" width="14" height="36"/><rect x="646" y="280" width="14" height="36"/><rect x="740" y="280" width="14" height="36"/><rect x="766" y="280" width="14" height="36"/></g>
<rect x="676" y="276" width="40" height="44" fill="#FFF1D2" opacity=".7"/>
<g fill="#0B1114"><path d="M690 320 v-30 q0 -6 5 -8 h6 q5 2 5 8 v30z"/><path d="M693 280 q5 -10 10 0z"/></g>
<g stroke="#56707A" stroke-width="1.2" opacity=".35" fill="none">{rain}</g>
<path d="M0 320 H1200 V420 H0z" fill="url(#{p}street)"/>
<path d="M0 320 h1200 v4 H0z" fill="#3A4A52"/><path d="M0 328 H1200" stroke="#0B1114" stroke-width="3"/>
<circle cx="880" cy="230" r="70" fill="url(#{p}lamp)"/><rect x="878" y="224" width="4" height="96" fill="#0B1114"/><rect x="872" y="220" width="16" height="6" fill="#0B1114"/><ellipse cx="880" cy="230" rx="5" ry="4" fill="#FFE2A0"/>
<path d="M600 324 h200 V420 H580z" fill="url(#{p}refl)"/><path d="M870 324 h20 V420 h-30z" fill="url(#{p}refl2)"/>
<path d="M100 324 h220 V420 H90z" fill="url(#{p}refl)" opacity=".35"/>
<g fill="#F58A3C" opacity=".25"><ellipse cx="700" cy="350" rx="140" ry="6"/><ellipse cx="640" cy="376" rx="90" ry="4"/></g>
<path d="M920 250 q60 -30 130 -32 q-30 22 -70 36 q-40 10 -60 -4z" fill="#0B1114"/>
<g fill="#0B1114"><path d="M300 108 l-26 5 l4 3 l22 -2 l14 4 l3 -3 l-4 -5 l30 -1 l0 -3 l-30 -1 l-14 -6z"/></g>
<circle cx="292" cy="103" r="1.6" fill="#F58A3C"/>
'''
    return _wrap(8, body, defs)


# ───────────────────────── 9  Postwar America: suburban twilight ─────────────────────────
def _b9():
    p = "ub9-"
    defs = (
        _lin(p+"sky", [(0, "#4C6E8A", None), (.5, "#9FCDBE", None), (.78, "#F3C1A4", None), (1, "#F6E6C8", None)])
        + _lin(p+"far", [(0, "#6E9C97", None), (1, "#4C7A7A", None)])
        + _lin(p+"mid", [(0, "#3F6667", None), (1, "#2C4B4E", None)])
        + _lin(p+"lawn", [(0, "#7DA987", None), (1, "#3E6B52", None)])
        + _lin(p+"road", [(0, "#3F4A55", None), (1, "#242C34", None)])
        + _lin(p+"house", [(0, "#F6E6C8", None), (1, "#D9C0A0", None)])
        + _lin(p+"roof", [(0, "#8A5C4A", None), (1, "#5E3D32", None)])
    )
    houses_far = "".join(f'<path d="M{x} 250 v-22 h{60+(x%3)*8} v22z M{x-6} 228 l{34+(x%3)*4} -16 l{34+(x%3)*4} 16z"/>' for x in range(20, 1200, 96))
    crowd = "".join(f'<path d="M{x} 276 v-{20+(x%4)*3} q0 -6 5 -6 q5 0 5 6 v{20+(x%4)*3}z"/><circle cx="{x+5}" cy="{247-(x%4)*3}" r="3.4"/>' for x in range(150, 560, 11))
    signs = "".join(f'<path d="M{x} 250 v-{18+(x%3)*6}" stroke="#F6E6C8" stroke-width="1.6"/><rect x="{x-9}" y="{220-(x%3)*6}" width="18" height="12" fill="#F6E6C8"/>' for x in range(190, 550, 52))
    trees = "".join(f'<ellipse cx="{x}" cy="{246-(x%3)*4}" rx="{22+(x%4)*4}" ry="{18+(x%5)*3}"/>' for x in range(700, 1180, 70))
    win = "".join(f'<rect x="{x}" y="288" width="22" height="20" rx="1"/>' for x in (824, 860, 1000, 1040))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<g fill="#F6E6C8" opacity=".55"><ellipse cx="220" cy="120" rx="170" ry="7"/><ellipse cx="640" cy="150" rx="120" ry="5"/><ellipse cx="1060" cy="100" rx="160" ry="6"/></g>
<path d="M720 60 Q900 34 1160 26" stroke="#FFF6E4" stroke-width="6" fill="none" opacity=".9" stroke-linecap="round"/><path d="M700 62 Q900 38 1160 32" stroke="#FFF6E4" stroke-width="14" fill="none" opacity=".3" stroke-linecap="round"/>
<path d="M1162 22 l14 -3 l-4 8z" fill="#F6E6C8"/>
<path d="M0 264 Q300 250 600 258 T1200 254 V300 H0z" fill="url(#{p}far)"/>
<g fill="#4C7A7A">{trees}</g>
<g fill="#3B5E60">{houses_far}</g>
<path d="M130 250 h460 v6 h-460z" fill="#2C4B4E" opacity=".6"/>
{signs}<g fill="#1F3A3E">{crowd}</g>
<path d="M0 270 Q400 262 800 270 T1200 266 V330 H0z" fill="url(#{p}mid)"/>
<g fill="url(#{p}house)"><rect x="800" y="276" width="300" height="56"/></g>
<path d="M786 278 L820 250 H1090 L1114 278z" fill="url(#{p}roof)"/><rect x="1020" y="250" width="8" height="22" fill="#5E3D32"/>
<rect x="936" y="292" width="34" height="40" fill="#6E4C3F"/>
<g fill="#FFD886" opacity=".95">{win}</g>
<path d="M1024 250 v-40" stroke="#2C4B4E" stroke-width="2.5"/><path d="M1000 214 h48 M1004 222 h40 M1008 230 h32" stroke="#2C4B4E" stroke-width="2.5"/><path d="M1000 214 v-6 M1048 214 v-6" stroke="#2C4B4E" stroke-width="2"/>
<rect x="1120" y="252" width="22" height="80" fill="#D9C0A0"/>
<path d="M70 332 v-100" stroke="#2C4B4E" stroke-width="6"/>
<rect x="26" y="196" width="140" height="44" rx="22" fill="#F0705C"/><rect x="34" y="204" width="124" height="28" rx="14" fill="#F6E6C8" opacity=".92"/>
<g fill="#FFEDD0"><circle cx="34" cy="196" r="2.6"/><circle cx="60" cy="196" r="2.6"/><circle cx="86" cy="196" r="2.6"/><circle cx="112" cy="196" r="2.6"/><circle cx="138" cy="196" r="2.6"/><circle cx="160" cy="200" r="2.6"/><circle cx="34" cy="240" r="2.6"/><circle cx="60" cy="240" r="2.6"/><circle cx="86" cy="240" r="2.6"/><circle cx="112" cy="240" r="2.6"/><circle cx="138" cy="240" r="2.6"/><circle cx="160" cy="236" r="2.6"/></g>
<path d="M160 240 l24 12 l-6 -18z" fill="#F0705C"/>
<path d="M0 332 H1200 V420 H0z" fill="url(#{p}lawn)"/>
<path d="M0 360 Q600 352 1200 358 V420 H0z" fill="url(#{p}road)"/>
<path d="M100 388 h60 M300 388 h60 M500 388 h60 M700 388 h60 M900 388 h60 M1100 388 h60" stroke="#F6E6C8" stroke-width="4" opacity=".6"/>
<g fill="#2C4B4E"><path d="M500 334 h170 q8 -26 -30 -26 h-30 l-14 -14 h-50 l-16 14 q-36 0 -30 26z"/><circle cx="530" cy="334" r="9"/><circle cx="640" cy="334" r="9"/></g><path d="M560 298 h36 l8 10 h-52z" fill="#9FCDBE" opacity=".6"/>
<path d="M670 322 l30 -4 v8 h-30z" fill="#F0705C" opacity=".8"/>
'''
    return _wrap(9, body, defs)


# ───────────────────────── 10  Changing World: satellite arc and light trails ─────────────────────────
def _b10():
    p = "ub10-"
    defs = (
        _lin(p+"sky", [(0, "#05091F", None), (.55, "#0F1B4A", None), (.85, "#3A1F5C", None), (1, "#7A2A6A", None)])
        + _lin(p+"city", [(0, "#1B2A5E", None), (1, "#0D1636", None)])
        + _lin(p+"city2", [(0, "#0F1A44", None), (1, "#080F2A", None)])
        + _lin(p+"road", [(0, "#0E1533", None), (1, "#05091A", None)])
        + _lin(p+"trailR", [(0, "#FF3E9A", .0), (.4, "#FF3E9A", .9), (1, "#FF7BC0", 1)])
        + _lin(p+"trailW", [(0, "#3EE7FF", .0), (.4, "#3EE7FF", .9), (1, "#DDFAFF", 1)])
        + _rad(p+"glow", [(0, "#E23EA5", .45), (1, "#E23EA5", 0)])
        + f'<pattern id="{p}win" width="27" height="36" patternUnits="userSpaceOnUse"><g fill="#FFD9F2" opacity=".85"><rect x="2" y="3" width="3" height="5"/><rect x="14" y="15" width="3" height="5"/><rect x="20" y="27" width="3" height="5"/><rect x="8" y="24" width="3" height="5" opacity=".5"/></g></pattern>'
    )
    back = [(250, 128, 26), (286, 170, 36), (332, 200, 28), (370, 130, 44), (424, 166, 30), (464, 206, 24), (498, 150, 40), (548, 186, 26), (584, 96, 30), (624, 150, 40), (674, 194, 26), (710, 128, 34), (754, 176, 40), (804, 110, 26), (840, 160, 44), (894, 200, 24), (928, 146, 34), (972, 186, 40)]
    city = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{262-y}"/>' for x, y, w in back)
    wins = "".join(f'<rect x="{x+3}" y="{y+6}" width="{w-6}" height="{256-y}"/>' for x, y, w in back)
    turbines = "".join(f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 v-64" stroke="#7388C4" stroke-width="3.5"/><path d="M0 -64 l28 -14 M0 -64 l-20 24 M0 -64 l-6 -32" stroke="#9FB0E0" stroke-width="3" stroke-linecap="round"/><circle cy="-64" r="3.5" fill="#DCE4FF"/></g>' for x, y, s in ((50, 268, .8), (130, 270, 1.05), (210, 268, .9), (1000, 270, 1), (1080, 268, .85), (1160, 270, .95)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(91, 60, 200, "#DDE8FF", ".7")}
<path d="M-40 150 Q400 -40 1240 90" stroke="#3EE7FF" stroke-width="1.4" fill="none" opacity=".35" stroke-dasharray="6 8"/>
<g transform="translate(560 26) rotate(-8)" fill="#B8D6FF"><rect x="-8" y="-6" width="16" height="12" rx="2"/><rect x="-46" y="-3" width="34" height="6" fill="#3EE7FF"/><rect x="12" y="-3" width="34" height="6" fill="#3EE7FF"/><path d="M-13 -3 h-2 M13 -3 h2" stroke="#B8D6FF" stroke-width="3"/><circle cx="0" cy="-12" r="3" fill="none" stroke="#B8D6FF" stroke-width="1.4"/></g>
<circle cx="600" cy="262" r="260" fill="url(#{p}glow)"/>
<g fill="url(#{p}city)">{city}</g><g fill="url(#{p}win)">{wins}</g>
<g fill="#FF3E9A"><circle cx="263" cy="126" r="2"/><circle cx="598" cy="94" r="2"/><circle cx="816" cy="108" r="2"/></g>
<g fill="url(#{p}city2)"><rect x="300" y="200" width="120" height="70"/><rect x="560" y="180" width="200" height="90"/><rect x="820" y="196" width="100" height="74"/></g>
<path d="M0 268 Q120 262 240 268 T480 264 T720 268 T960 264 T1200 268 V300 H0z" fill="#101A48"/>
<path d="M0 274 H1200 V300 H0z" fill="#080F2A"/>{turbines}
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}road)"/>
<path d="M0 420 L420 300 H780 L1200 420z" fill="#0B1236"/>
<path d="M300 420 Q480 340 560 300 h20 Q520 340 380 420z" fill="url(#{p}trailR)" opacity=".9"/>
<path d="M360 420 Q520 340 578 300 h10 Q560 340 420 420z" fill="url(#{p}trailR)" opacity=".6"/>
<path d="M900 420 Q720 340 640 300 h-20 Q680 340 820 420z" fill="url(#{p}trailW)" opacity=".9"/>
<path d="M840 420 Q680 340 622 300 h-10 Q640 340 780 420z" fill="url(#{p}trailW)" opacity=".6"/>
<path d="M600 300 v120" stroke="#F6E6C8" stroke-width="2" stroke-dasharray="10 12" opacity=".45"/>
<g fill="#0B1236"><rect x="150" y="280" width="4" height="60"/><rect x="1046" y="280" width="4" height="60"/></g><g fill="#3EE7FF" opacity=".8"><circle cx="152" cy="280" r="3"/><circle cx="1048" cy="280" r="3"/></g>
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
