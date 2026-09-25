"""Unit banners for the SEL rooms 104 (Grades 9-10, Book 4 "The Facade")
and 207 (Grades 11-12, Book 5 "The Capstone"), four units each.

Eight drawn, layered scenes as inline SVG.  Stdlib only.

    from banners_sel_b import BANNERS, CREDITS, banner
    banner("104-3")  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[key], focusable="false".  Every id is prefixed
"sb{room}u{unit}-" so all SEL banners can sit on one contents page.
No text, no faces, no images, no external references, no feTurbulence.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm and the subject sits in the
upper 55%.
"""

W, H = 1200, 420

CREDITS = {
    "104-1": "Drawn scene: a dressing-table mirror at dusk reflecting a lit window, with a plain half mask resting on the dresser beside it",
    "104-2": "Drawn scene: a backpack set down on a park bench under a tree after rain, puddles catching a clearing evening sky",
    "104-3": "Drawn scene: two empty chairs turned to face each other in a quiet classroom beside a tall window at dusk",
    "104-4": "Drawn scene: a stone footbridge with lanterns crossing a river toward a small town at nightfall",
    "207-1": "Drawn scene: a brass compass resting on an unrolled map under a wide night sky with one bright north star",
    "207-2": "Drawn scene: a workbench lamp shining on a mended bowl with gold seams, with tools hung neatly on the wall behind",
    "207-3": "Drawn scene: a lighthouse on a headland at first light, its beam reaching across a calm sea",
    "207-4": "Drawn scene: a garden path leading between rows of fruit trees toward a low hill in late golden light",
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


def _tree(x, y, s, trunk, leaf, leaf2=None):
    """Round-canopy tree with its base at (x, y), scale s."""
    leaf2 = leaf2 or leaf
    return (f'<rect x="{x - 5 * s:.0f}" y="{y - 70 * s:.0f}" width="{10 * s:.0f}" height="{70 * s:.0f}" fill="{trunk}"/>'
            f'<circle cx="{x:.0f}" cy="{y - 90 * s:.0f}" r="{44 * s:.0f}" fill="{leaf}"/>'
            f'<circle cx="{x - 22 * s:.0f}" cy="{y - 104 * s:.0f}" r="{26 * s:.0f}" fill="{leaf2}"/>'
            f'<circle cx="{x + 24 * s:.0f}" cy="{y - 100 * s:.0f}" r="{22 * s:.0f}" fill="{leaf2}"/>')


def _wrap(key, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[key]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


# ───────────────────────── 104-1  The Curated Self: mirror and mask at dusk ─────────────────────────
def _b104_1():
    p = "sb104u1-"
    defs = (_lin(p+"wall", [(0, "#4A3D5C", None), (1, "#2C2438", None)])
            + _lin(p+"sky", [(0, "#3A3F7A", None), (.55, "#9A5C86", None), (1, "#F0A26A", None)])
            + _lin(p+"glass", [(0, "#9CB8D6", None), (.5, "#C8DCE8", None), (1, "#7C98B8", None)], 0, 0, 1, 1)
            + _lin(p+"table", [(0, "#8A5A3A", None), (1, "#3E2616", None)])
            + _rad(p+"lamp", [(0, "#FFE7A8", .9), (1, "#FFE7A8", 0)]))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="760" y="30" width="300" height="230" fill="url(#{p}sky)"/>
{_stars(21, 12, 90, "#FFF4DA", ".6", 770, 1050)}
<g fill="#2A2650"><path d="M760 200 h60 v-40 h30 v40 h50 v-30 h40 v30 h60 v-50 h30 v50 h30 v60 h-300z"/></g>
<g fill="#FFD98A" opacity=".8"><rect x="790" y="172" width="8" height="10"/><rect x="920" y="184" width="8" height="10"/><rect x="990" y="164" width="8" height="10"/></g>
<g fill="none" stroke="#D9C8A8" stroke-width="8"><rect x="760" y="30" width="300" height="230"/><path d="M910 30 v230 M760 150 h300"/></g>
<circle cx="180" cy="120" r="120" fill="url(#{p}lamp)"/>
<g><rect x="172" y="120" width="16" height="130" fill="#6A4A2A"/><path d="M120 120 l30 -60 h60 l30 60z" fill="#F2D9A8"/><path d="M120 120 h120" stroke="#C8A878" stroke-width="4"/></g>
<g><ellipse cx="520" cy="150" rx="118" ry="140" fill="#C9A96A"/><ellipse cx="520" cy="150" rx="104" ry="126" fill="url(#{p}glass)"/>
<path d="M448 60 q60 -30 130 10" stroke="#FFFFFF" stroke-width="6" fill="none" opacity=".45" stroke-linecap="round"/>
<path d="M600 90 q20 60 -10 130" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>
<g opacity=".55"><rect x="540" y="96" width="60" height="70" fill="#F0A26A"/><rect x="540" y="96" width="60" height="70" fill="none" stroke="#D9C8A8" stroke-width="3"/><path d="M570 96 v70 M540 130 h60" stroke="#D9C8A8" stroke-width="2"/></g>
<path d="M508 288 h24 l10 -18 h-44z" fill="#A8884A"/><ellipse cx="520" cy="290" rx="60" ry="8" fill="#A8884A"/></g>
<path d="M0 270 Q600 262 1200 270 V420 H0z" fill="url(#{p}table)"/>
<path d="M0 270 Q600 262 1200 270 v8 Q600 270 0 278z" fill="#B8885A" opacity=".7"/>
<g><path d="M244 250 q56 -18 112 0 q6 34 -20 46 q-36 12 -72 0 q-26 -12 -20 -46z" fill="#F4EDE0"/>
<path d="M244 250 q56 -18 112 0 q6 34 -20 46 q-36 12 -72 0 q-26 -12 -20 -46z" fill="none" stroke="#C8B48A" stroke-width="2.5"/>
<path d="M262 268 q12 -10 24 0 q-12 10 -24 0z M314 268 q12 -10 24 0 q-12 10 -24 0z" fill="#8A5A3A"/>
<path d="M244 254 q-24 -8 -40 8" stroke="#B85A5A" stroke-width="2.5" fill="none"/><path d="M356 254 q24 -8 40 8" stroke="#B85A5A" stroke-width="2.5" fill="none"/></g>
<g><path d="M680 300 h50 l4 -16 h-58z" fill="#3B6AB8"/><path d="M680 300 h50 l4 -16 h-58z" fill="none" stroke="#2A4A8A" stroke-width="2"/><rect x="640" y="286" width="44" height="14" rx="3" fill="#E4573D"/></g>
<path d="M0 372 Q600 366 1200 372 V420 H0z" fill="#180E18" opacity=".55"/>
'''
    return _wrap("104-1", body, defs)


# ───────────────────────── 104-2  Resilience Through Self-Kindness: backpack on a bench after rain ─────────────────────────
def _b104_2():
    p = "sb104u2-"
    defs = (_lin(p+"sky", [(0, "#5E6B9A", None), (.45, "#C7A8B8", None), (1, "#F6CFA0", None)])
            + _lin(p+"ground", [(0, "#6E8A5A", None), (1, "#2E3E24", None)])
            + _lin(p+"far", [(0, "#8A96B0", None), (1, "#6A7A98", None)])
            + _rad(p+"sun", [(0, "#FFF0C8", .85), (1, "#FFF0C8", 0)]))
    drops = "".join(f'<path d="M{x} {y} v10" stroke="#DCE8F4" stroke-width="2" stroke-linecap="round" opacity=".5"/>'
                    for x, y in [(80, 60), (140, 110), (220, 40), (300, 90), (400, 50), (960, 70), (1040, 30), (1120, 100), (1160, 60), (860, 40)])
    puddles = "".join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#C7A8B8" opacity=".5"/>'
                      for x, y, rx, ry in [(180, 318, 70, 8), (980, 322, 90, 9), (1120, 310, 40, 5), (420, 330, 50, 6)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="980" cy="160" r="150" fill="url(#{p}sun)"/>
<g fill="#FFF" opacity=".55"><ellipse cx="260" cy="80" rx="120" ry="30"/><ellipse cx="330" cy="70" rx="80" ry="34"/><ellipse cx="1000" cy="60" rx="140" ry="30"/><ellipse cx="1080" cy="50" rx="70" ry="30"/></g>
<path d="M0 240 Q200 200 420 230 T840 218 T1200 228 V300 H0z" fill="url(#{p}far)"/>
{drops}
{_tree(760, 300, 1.7, "#4A3A24", "#4E7A3C", "#6A9A4A")}
{_tree(1120, 296, 1.0, "#4A3A24", "#3E6A34", "#5A8A44")}
<path d="M0 296 Q300 284 600 292 T1200 288 V420 H0z" fill="url(#{p}ground)"/>
{puddles}
<g><rect x="380" y="262" width="360" height="14" rx="3" fill="#8A5A34"/><rect x="380" y="242" width="360" height="12" rx="3" fill="#8A5A34"/>
<path d="M400 276 v46 M720 276 v46" stroke="#3A2A1A" stroke-width="8"/><path d="M400 242 v-22 M720 242 v-22" stroke="#3A2A1A" stroke-width="8"/>
<rect x="380" y="216" width="360" height="10" rx="3" fill="#8A5A34"/></g>
<g><path d="M520 262 v-92 q0 -18 18 -18 h64 q18 0 18 18 v92z" fill="#3B6AB8"/><path d="M520 262 v-92 q0 -18 18 -18 h64 q18 0 18 18 v92z" fill="none" stroke="#2A4A8A" stroke-width="2"/>
<path d="M534 262 v-40 q0 -8 8 -8 h56 q8 0 8 8 v40z" fill="#2E5498"/><path d="M548 152 q22 -18 44 0" stroke="#2A4A8A" stroke-width="6" fill="none" stroke-linecap="round"/>
<rect x="556" y="196" width="28" height="10" rx="3" fill="#F4B63A"/><path d="M604 176 v50" stroke="#F4B63A" stroke-width="4" stroke-linecap="round"/></g>
<g stroke="#F4B63A" stroke-width="2" fill="none" opacity=".7"><path d="M480 160 q-40 -14 -60 6"/><path d="M440 200 q-30 -8 -50 6"/></g>
<g fill="#4E7A3C"><path d="M60 300 l4 -22 l4 22z M80 298 l3 -16 l3 16z M1180 296 l4 -20 l4 20z"/></g>
<path d="M0 372 Q600 366 1200 372 V420 H0z" fill="#101A0C" opacity=".55"/>
'''
    return _wrap("104-2", body, defs)


# ───────────────────────── 104-3  Conflict & Context: two chairs facing each other ─────────────────────────
def _chair(x, y, s, c, face=1):
    """Simple school chair with its seat front-left at (x, y); face=1 faces right, -1 left."""
    d = face
    bx = x - 30 * s * d  # back post x
    return (f'<g fill="{c}" stroke="{c}" stroke-linecap="round">'
            f'<rect x="{min(x, x + 60 * s * d):.0f}" y="{y:.0f}" width="{60 * s:.0f}" height="{8 * s:.0f}" rx="2"/>'
            f'<path d="M{bx + 30 * s * d:.0f} {y:.0f} v{-(64 * s):.0f} q0 -8 {8 * s * d:.0f} -8 h{20 * s * d:.0f} q{8 * s * d:.0f} 0 {8 * s * d:.0f} 8 v{64 * s:.0f}" fill="none" stroke-width="{7 * s:.0f}"/>'
            f'<path d="M{bx + 36 * s * d:.0f} {y - 50 * s:.0f} h{30 * s * d:.0f} M{bx + 36 * s * d:.0f} {y - 34 * s:.0f} h{30 * s * d:.0f}" stroke-width="{5 * s:.0f}"/>'
            f'<path d="M{x + 6 * s * d:.0f} {y + 8 * s:.0f} v{52 * s:.0f} M{x + 54 * s * d:.0f} {y + 8 * s:.0f} v{52 * s:.0f}" stroke-width="{6 * s:.0f}"/>'
            f'</g>')


def _b104_3():
    p = "sb104u3-"
    defs = (_lin(p+"wall", [(0, "#EADFC8", None), (1, "#CDBF9E", None)])
            + _lin(p+"sky", [(0, "#4A4A8A", None), (.5, "#B86A7A", None), (1, "#F6B07A", None)])
            + _lin(p+"floor", [(0, "#B48A5A", None), (1, "#5A3E24", None)])
            + _lin(p+"light", [(0, "#F6B07A", .35), (1, "#F6B07A", 0)]))
    boards = "".join(f'<path d="M{x} 300 l-40 120" stroke="#8A6A40" stroke-width="1.5" opacity=".5"/>' for x in range(0, 1300, 60))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="470" y="20" width="260" height="260" fill="url(#{p}sky)"/>
{_stars(7, 8, 80, "#FFF4DA", ".5", 480, 720)}
<g fill="#3A3460"><path d="M470 210 h50 v-30 h40 v30 h40 v-50 h36 v50 h50 v-20 h44 v90 h-260z"/></g>
<g fill="#FFD98A" opacity=".8"><rect x="530" y="190" width="7" height="9"/><rect x="620" y="176" width="7" height="9"/><rect x="690" y="204" width="7" height="9"/></g>
<g fill="none" stroke="#F4EFE4" stroke-width="10"><rect x="470" y="20" width="260" height="260"/><path d="M600 20 v260 M470 150 h260"/></g>
<rect x="450" y="280" width="300" height="14" fill="#F4EFE4"/>
<g><rect x="60" y="60" width="300" height="180" rx="4" fill="#2E4A3E"/><rect x="60" y="60" width="300" height="180" rx="4" fill="none" stroke="#8A6A40" stroke-width="8"/><rect x="60" y="240" width="300" height="10" fill="#B8A078"/>
<g stroke="#D8E0D0" stroke-width="3" opacity=".6" fill="none"><path d="M100 110 h120"/><path d="M100 140 h180"/><path d="M100 170 h80"/></g></g>
<g><rect x="880" y="60" width="240" height="180" fill="#D8C8A0"/><rect x="880" y="60" width="240" height="180" fill="none" stroke="#8A6A40" stroke-width="6"/>
<g opacity=".8"><rect x="900" y="80" width="60" height="70" fill="#7AA8C8"/><rect x="980" y="90" width="60" height="70" fill="#E8A860"/><rect x="1050" y="76" width="50" height="60" fill="#8AB878"/><rect x="920" y="164" width="70" height="60" fill="#D08080"/><rect x="1010" y="170" width="80" height="50" fill="#F4E4B0"/></g></g>
<path d="M0 300 Q600 292 1200 300 V420 H0z" fill="url(#{p}floor)"/>{boards}
<path d="M470 300 L380 420 H820 L730 300z" fill="url(#{p}light)"/>
{_chair(400, 250, 1.3, "#2E3A48", 1)}
{_chair(800, 250, 1.3, "#2E3A48", -1)}
<path d="M0 372 Q600 366 1200 372 V420 H0z" fill="#1A1008" opacity=".55"/>
'''
    return _wrap("104-3", body, defs)


# ───────────────────────── 104-4  Community & Legacy: a lantern-lit footbridge to a town ─────────────────────────
def _b104_4():
    p = "sb104u4-"
    defs = (_lin(p+"sky", [(0, "#1E2A5A", None), (.6, "#4A4A8A", None), (1, "#C87A6A", None)])
            + _lin(p+"hills", [(0, "#3A3A68", None), (1, "#242448", None)])
            + _lin(p+"water", [(0, "#4A5A8A", None), (1, "#161A34", None)])
            + _lin(p+"stone", [(0, "#A89A80", None), (1, "#5A5040", None)])
            + _rad(p+"lamp", [(0, "#FFE7A8", .9), (1, "#FFE7A8", 0)]))
    town = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{230 - y}" fill="#2A2A50"/><path d="M{x - 3} {y} l{w / 2 + 3:.0f} -{r} l{w / 2 + 3:.0f} {r}z" fill="#3E2E48"/>'
                   f'<rect x="{x + w // 2 - 4}" y="{y + 14}" width="8" height="9" fill="#FFD98A"/>'
                   for x, y, w, r in [(690, 170, 40, 14), (740, 150, 50, 18), (800, 176, 44, 12), (850, 140, 60, 20), (920, 168, 46, 14), (976, 156, 54, 16), (1040, 178, 40, 12), (1090, 150, 50, 18), (1150, 172, 44, 14)])
    lamps = "".join(f'<circle cx="{x}" cy="{y}" r="44" fill="url(#{p}lamp)"/><rect x="{x - 2}" y="{y + 4}" width="4" height="{b - y - 4}" fill="#2A2436"/>'
                    f'<path d="M{x - 9} {y - 14} h18 l-3 20 h-12z" fill="#2A2436"/><rect x="{x - 5}" y="{y - 10}" width="10" height="12" fill="#FFE7A8"/>'
                    for x, y, b in [(330, 188, 250), (560, 176, 238), (790, 188, 250)])
    ripples = "".join(f'<path d="M{x} {y} q30 -4 60 0" stroke="#8A9AC8" stroke-width="1.5" fill="none" opacity=".5"/>' for x, y in [(100, 330), (200, 350), (900, 340), (1050, 356), (500, 345), (700, 336)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(33, 40, 140, "#FFF4DA", ".7")}
<circle cx="200" cy="80" r="26" fill="#FFF3C4"/><circle cx="200" cy="80" r="48" fill="#FFF3C4" opacity=".18"/>
<path d="M0 220 Q160 150 340 200 T700 190 T1200 210 V260 H0z" fill="url(#{p}hills)"/>
{town}
{_tree(60, 262, 1.1, "#1E1A2E", "#2A3450", "#324060")}
{_tree(1170, 258, .9, "#1E1A2E", "#2A3450", "#324060")}
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}water)"/>
{ripples}
<g><path d="M230 300 q0 -60 100 -60 h460 q100 0 100 60z" fill="url(#{p}stone)"/>
<path d="M330 300 q20 -44 60 -44 q40 0 60 44z M470 300 q20 -50 90 -50 q70 0 90 50z M750 300 q20 -44 60 -44 q40 0 60 44z" fill="#161A34"/>
<path d="M230 244 q0 -14 100 -14 h460 q100 0 100 14z" fill="#B8A888"/>
<path d="M240 232 h640" stroke="#4A4050" stroke-width="3"/>{"".join(f'<rect x="{x}" y="212" width="4" height="22" fill="#4A4050"/>' for x in range(250, 880, 22))}<path d="M240 212 h640" stroke="#4A4050" stroke-width="4"/></g>
{lamps}
<g fill="#FFE7A8" opacity=".35"><ellipse cx="330" cy="326" rx="30" ry="6"/><ellipse cx="560" cy="330" rx="34" ry="6"/><ellipse cx="790" cy="326" rx="30" ry="6"/></g>
<path d="M0 372 Q600 366 1200 372 V420 H0z" fill="#0A0C1A" opacity=".55"/>
'''
    return _wrap("104-4", body, defs)


# ───────────────────────── 207-1  The Compass of Values: a compass on a map under the stars ─────────────────────────
def _b207_1():
    p = "sb207u1-"
    defs = (_lin(p+"sky", [(0, "#0E1430", None), (.7, "#28305C", None), (1, "#5A4A70", None)])
            + _lin(p+"table", [(0, "#5A4028", None), (1, "#20140C", None)])
            + _lin(p+"map", [(0, "#EBDDB8", None), (1, "#C8B488", None)])
            + _rad(p+"brass", [(0, "#F4E0A0", None), (.6, "#C8A050", None), (1, "#8A6A2A", None)], .4, .35, .7)
            + _rad(p+"face", [(0, "#FBF6E8", None), (1, "#E4D8B8", None)])
            + _rad(p+"star", [(0, "#FFFFFF", 1), (.3, "#FFF3C4", .7), (1, "#FFF3C4", 0)]))
    ticks = "".join(f'<rect x="597" y="82" width="{4 if k % 9 == 0 else 2}" height="{14 if k % 9 == 0 else 7}" fill="#5A4A30" transform="rotate({k * 10} 600 160)"/>' for k in range(36))
    contours = "".join(f'<path d="{d}" stroke="#9A8A60" stroke-width="1.5" fill="none" opacity=".6"/>'
                       for d in ["M60 300 q80 -60 200 -30 t220 20", "M100 330 q100 -40 240 -20", "M800 290 q120 -50 280 -20", "M860 320 q100 -30 240 -10", "M900 260 q60 -40 160 -30"])
    rose = ('<circle cx="1010" cy="300" r="22" fill="none" stroke="#9A8A60" stroke-width="1.5" opacity=".7"/>'
            + "".join(f'<path d="M1010 300 l-6 -6 l6 -30 l6 30z" fill="#9A8A60" opacity=".75" transform="rotate({k * 90} 1010 300)"/>' for k in range(4)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(41, 80, 200, "#FFF4DA", ".75")}
<g stroke="#FFF4DA" stroke-width="1" opacity=".35" fill="none"><path d="M300 60 l40 30 l50 -20 l60 40 M900 40 l40 20 l30 -30 l40 40"/></g>
<circle cx="600" cy="48" r="40" fill="url(#{p}star)"/><path d="M600 20 l4 24 l24 4 l-24 4 l-4 24 l-4 -24 l-24 -4 l24 -4z" fill="#FFFFFF"/>
<path d="M0 220 Q300 190 600 212 T1200 208 V260 H0z" fill="#181C3C"/>
<path d="M0 250 Q600 240 1200 250 V420 H0z" fill="url(#{p}table)"/>
<path d="M40 268 q560 -20 1120 0 v130 H40z" fill="url(#{p}map)"/><path d="M40 268 q560 -20 1120 0" stroke="#B8A470" stroke-width="3" fill="none"/>
<path d="M40 268 q4 60 0 130 M1160 268 q-4 60 0 130" stroke="#B8A470" stroke-width="6" fill="none"/>
{contours}{rose}
<g stroke="#9A8A60" stroke-width="1.5" stroke-dasharray="6 6" fill="none" opacity=".6"><path d="M180 350 Q400 300 600 320 T1010 300"/></g>
<g><ellipse cx="600" cy="236" rx="96" ry="22" fill="#000" opacity=".3"/>
<circle cx="600" cy="160" r="86" fill="url(#{p}brass)"/><circle cx="600" cy="160" r="72" fill="#3A2C14"/><circle cx="600" cy="160" r="66" fill="url(#{p}face)"/>
<circle cx="600" cy="160" r="52" fill="none" stroke="#B8A478" stroke-width="1.5"/>{ticks}
<g fill="#7A6A48"><path d="M600 108 l6 12 l-6 -4 l-6 4z M600 212 l6 -12 l-6 4 l-6 -4z M548 160 l12 6 l-4 -6 l4 -6z M652 160 l-12 6 l4 -6 l-4 -6z"/></g>
<path d="M600 160 l-14 12 l14 -66 l14 66z" fill="#C8302E"/><path d="M600 160 l-14 -12 l14 66 l14 -66z" fill="#3A4A6A"/>
<circle cx="600" cy="160" r="6" fill="#C8A050"/><circle cx="600" cy="160" r="2.5" fill="#3A2C14"/>
<path d="M600 74 v-10 q0 -12 12 -12 q12 0 12 12 v6" stroke="#C8A050" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<g stroke="#5A4A30" stroke-width="3" stroke-linecap="round"><path d="M300 260 l-30 60"/><path d="M270 320 l6 -4"/></g>
<path d="M0 372 Q600 366 1200 372 V420 H0z" fill="#0A0806" opacity=".55"/>
'''
    return _wrap("207-1", body, defs)


# ───────────────────────── 207-2  The Adult Repair Manual: workbench with a gold-seamed bowl ─────────────────────────
def _b207_2():
    p = "sb207u2-"
    defs = (_lin(p+"wall", [(0, "#3A3430", None), (1, "#221E1C", None)])
            + _lin(p+"bench", [(0, "#8A6A44", None), (1, "#3A2A18", None)])
            + _rad(p+"lamp", [(0, "#FFE7A8", .95), (.5, "#FFD98A", .35), (1, "#FFD98A", 0)], .5, .5, .5)
            + _rad(p+"bowl", [(0, "#8CA8C0", None), (1, "#4A607A", None)], .5, .2, .8))
    pegs = "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="#1A1614"/>' for x in range(760, 1140, 40) for y in range(70, 200, 40))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="740" y="50" width="420" height="170" rx="4" fill="#5A4A38"/>{pegs}
<g stroke="#D8D0C0" stroke-width="5" stroke-linecap="round" fill="none">
<path d="M790 80 v90"/><path d="M780 80 h20 l-4 -14 h-12z" fill="#2A2A2A"/>
<path d="M860 78 v96 M846 84 h28 M846 84 v-10 h28 v10" stroke-width="4"/>
<path d="M930 76 v100"/><path d="M918 76 h24 v14 h-24z" fill="#B85A34"/>
<path d="M1000 84 q-16 -16 -32 0 v70 h32z" fill="#7A5A3A" stroke-width="3"/><path d="M984 154 v30"/>
<path d="M1070 78 v100 M1058 78 h24" stroke-width="4"/><path d="M1064 178 h12 l-6 10z" fill="#D8D0C0"/>
</g>
<g><rect x="360" y="70" width="60" height="56" rx="4" fill="#8A7A5A"/><rect x="366" y="76" width="48" height="44" fill="#3A5A44"/><path d="M372 90 h36 M372 100 h28 M372 110 h20" stroke="#D8E0D0" stroke-width="2" opacity=".6"/></g>
<g><rect x="200" y="0" width="8" height="150" fill="#2A2624"/><path d="M110 150 q94 -60 188 0z" fill="#2A2624"/><path d="M110 150 h188" stroke="#4A4240" stroke-width="3"/><ellipse cx="204" cy="152" rx="40" ry="8" fill="#FFE7A8" opacity=".9"/></g>
<ellipse cx="420" cy="280" rx="420" ry="220" fill="url(#{p}lamp)"/>
<path d="M0 276 Q600 268 1200 276 V420 H0z" fill="url(#{p}bench)"/>
<path d="M0 276 Q600 268 1200 276 v10 Q600 278 0 286z" fill="#B8925A" opacity=".8"/>
<g><ellipse cx="480" cy="290" rx="120" ry="18" fill="#000" opacity=".3"/>
<path d="M370 196 q0 84 110 84 q110 0 110 -84z" fill="url(#{p}bowl)"/><ellipse cx="480" cy="196" rx="110" ry="22" fill="#6A88A8"/><ellipse cx="480" cy="196" rx="94" ry="14" fill="#3E5470"/>
<g stroke="#F2C24A" stroke-width="4" fill="none" stroke-linecap="round"><path d="M410 208 q20 30 8 62"/><path d="M418 240 q30 6 44 34"/><path d="M548 210 q-14 26 -4 58"/><path d="M500 218 q10 22 -2 58"/></g>
<g stroke="#FFE7A8" stroke-width="1.5" fill="none" opacity=".8"><path d="M410 208 q20 30 8 62"/><path d="M548 210 q-14 26 -4 58"/></g></g>
<g><rect x="700" y="252" width="150" height="26" rx="3" fill="#B85A34"/><path d="M700 252 h150 v26 h-150z" fill="none" stroke="#7A3A24" stroke-width="2"/><rect x="716" y="258" width="60" height="14" rx="2" fill="#F2E4C0"/></g>
<g><path d="M120 278 q40 -44 88 -8" stroke="#C8A050" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M120 278 l-4 -4 l10 -8" stroke="#8A6A2A" stroke-width="3" fill="none"/></g>
<g fill="#D8D0C0" opacity=".9"><circle cx="640" cy="262" r="4"/><circle cx="660" cy="270" r="4"/><circle cx="624" cy="272" r="3"/></g>
<g><rect x="900" y="230" width="34" height="48" rx="4" fill="#3B6AB8"/><rect x="908" y="222" width="18" height="10" fill="#2A4A8A"/></g>
<path d="M0 372 Q600 366 1200 372 V420 H0z" fill="#0E0A08" opacity=".55"/>
'''
    return _wrap("207-2", body, defs)


# ───────────────────────── 207-3  Transcendent Forgiveness: a lighthouse at first light ─────────────────────────
def _b207_3():
    p = "sb207u3-"
    defs = (_lin(p+"sky", [(0, "#3A4A7A", None), (.5, "#B88AA0", None), (.85, "#F2B88A", None), (1, "#FBE0B0", None)])
            + _lin(p+"sea", [(0, "#6A8AB0", None), (1, "#1E2E4A", None)])
            + _lin(p+"rock", [(0, "#6A6A6A", None), (1, "#2E2E30", None)])
            + _lin(p+"tower", [(0, "#F6F0E4", None), (.5, "#FFFFFF", None), (1, "#C8C0B0", None)], 0, 0, 1, 0)
            + _lin(p+"beam", [(0, "#FFE7A8", .55), (1, "#FFE7A8", 0)], 0, 0, 1, 0)
            + _rad(p+"sun", [(0, "#FFF3C4", .9), (1, "#FFF3C4", 0)]))
    stripes = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="18" fill="#C8302E"/>' for x, y, w in [(556, 130, 88), (562, 190, 76)])
    waves = "".join(f'<path d="M{x} {y} q20 -5 40 0 t40 0" stroke="#A8C0D8" stroke-width="1.5" fill="none" opacity=".45"/>'
                    for x, y in [(60, 320), (200, 336), (340, 326), (900, 330), (1040, 346), (760, 342), (160, 356), (1100, 320)])
    birds = "".join(f'<path d="M{x} {y} q7 -7 13 0 q6 -7 13 0" stroke="#4A3A50" stroke-width="2" fill="none"/>' for x, y in [(140, 120), (180, 100), (210, 130)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(17, 20, 90, "#FFF4DA", ".45", 0, 700)}
<circle cx="1000" cy="250" r="160" fill="url(#{p}sun)"/><circle cx="1000" cy="250" r="30" fill="#FFE7A8"/>
<g fill="#C8A0A8" opacity=".5"><ellipse cx="300" cy="170" rx="160" ry="14"/><ellipse cx="1000" cy="150" rx="120" ry="10"/><ellipse cx="640" cy="200" rx="100" ry="8"/></g>
{birds}
<path d="M600 92 L0 20 V170 Z" fill="url(#{p}beam)" transform="translate(0 0)"/>
<path d="M600 92 L1200 30 V150 Z" fill="url(#{p}beam)" opacity=".45"/>
<path d="M0 262 Q600 254 1200 262 V420 H0z" fill="url(#{p}sea)"/>
<path d="M980 262 q-2 60 20 120" stroke="#FFE7A8" stroke-width="8" opacity=".25" fill="none"/>
{waves}
<path d="M380 300 q40 -60 120 -50 q40 -30 100 -18 q60 -20 120 20 q50 6 60 48z" fill="url(#{p}rock)"/>
<g><path d="M552 250 l10 -160 h76 l10 160z" fill="url(#{p}tower)"/>{stripes}
<rect x="548" y="246" width="104" height="12" fill="#3A3A40"/>
<rect x="556" y="80" width="88" height="10" fill="#3A3A40"/><rect x="566" y="60" width="68" height="22" fill="#FFE7A8"/><path d="M566 60 h68 M566 71 h68" stroke="#3A3A40" stroke-width="2"/><path d="M570 60 v22 M586 60 v22 M602 60 v22 M618 60 v22 M630 60 v22" stroke="#3A3A40" stroke-width="2"/>
<path d="M560 60 l40 -22 l40 22z" fill="#C8302E"/><rect x="598" y="26" width="4" height="14" fill="#3A3A40"/>
<circle cx="600" cy="72" r="14" fill="#FFF8D8"/>
<rect x="592" y="200" width="16" height="30" rx="8" fill="#3A3A40"/><rect x="594" y="150" width="12" height="16" rx="6" fill="#3A3A40"/><rect x="594" y="108" width="12" height="16" rx="6" fill="#3A3A40"/></g>
<g><rect x="690" y="222" width="70" height="40" fill="#F6F0E4"/><path d="M684 222 l41 -22 l41 22z" fill="#C8302E"/><rect x="716" y="236" width="12" height="14" fill="#FFE7A8"/></g>
<g fill="#4A4A4C"><path d="M390 300 l-10 -10 l24 -8 l16 10z M700 296 l10 -14 l30 6 l4 12z"/></g>
<path d="M0 372 Q600 366 1200 372 V420 H0z" fill="#0A1020" opacity=".55"/>
'''
    return _wrap("207-3", body, defs)


# ───────────────────────── 207-4  The Orchard Legacy: a garden path between fruit trees ─────────────────────────
def _b207_4():
    p = "sb207u4-"
    defs = (_lin(p+"sky", [(0, "#8AB0D8", None), (.6, "#F2CFA0", None), (1, "#F8E4B8", None)])
            + _lin(p+"hill", [(0, "#A8B87A", None), (1, "#6E8A4A", None)])
            + _lin(p+"grass", [(0, "#8AA850", None), (1, "#3E5A28", None)])
            + _lin(p+"path", [(0, "#D8C49A", None), (1, "#8A7448", None)])
            + _rad(p+"sun", [(0, "#FFF3C4", .8), (1, "#FFF3C4", 0)]))
    rows = []
    # rows of trees receding toward the vanishing point at (600, 214)
    for depth, (yb, s, n, spread) in enumerate([(214, .28, 6, 130), (232, .45, 5, 230), (262, .7, 4, 330), (300, 1.0, 3, 430)]):
        for side in (-1, 1):
            for i in range(n):
                x = 600 + side * (spread * .28 + i * spread / max(n - 1, 1)) * .95
                leaf = ["#7AA84A", "#6A9A40", "#5A8A38", "#4E7A34"][depth]
                leaf2 = ["#9AC060", "#8AB050", "#7AA048", "#6A9040"][depth]
                rows.append(_tree(x, yb, s, "#5A4028", leaf, leaf2))
                if depth >= 2:
                    rows.append("".join(f'<circle cx="{x + dx * s:.0f}" cy="{yb - (90 + dy) * s:.0f}" r="{4.5 * s:.1f}" fill="#E4573D"/>'
                                        for dx, dy in [(-16, 10), (14, -6), (0, 22), (24, 14), (-24, -10)]))
    lines = "".join(f'<path d="M{x} 420 L600 220" stroke="#9A8A5A" stroke-width="1" opacity=".35"/>' for x in (200, 360, 840, 1000))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="600" cy="150" r="170" fill="url(#{p}sun)"/>
<g fill="#FFF" opacity=".55"><ellipse cx="200" cy="70" rx="110" ry="24"/><ellipse cx="260" cy="60" rx="70" ry="28"/><ellipse cx="960" cy="90" rx="130" ry="22"/></g>
<path d="M0 214 Q200 150 420 196 T780 178 T1200 196 V240 H0z" fill="url(#{p}hill)"/>
<path d="M0 226 Q600 208 1200 226 V420 H0z" fill="url(#{p}grass)"/>
<path d="M520 420 L590 220 L610 220 L680 420z" fill="url(#{p}path)"/>
{lines}
<g stroke="#C8B48A" stroke-width="1.5" fill="none" opacity=".5"><path d="M540 380 q60 -8 120 0"/><path d="M556 330 q44 -6 88 0"/><path d="M572 290 q28 -4 56 0"/></g>
{"".join(rows)}
<g><rect x="1010" y="272" width="120" height="10" rx="2" fill="#8A5A34"/><rect x="1010" y="256" width="120" height="8" rx="2" fill="#8A5A34"/><path d="M1020 282 v30 M1120 282 v30 M1020 256 v-20 M1120 256 v-20" stroke="#4A3018" stroke-width="6"/></g>
<g><path d="M80 300 h50 l-6 -30 h-38z" fill="#B8783E"/><ellipse cx="105" cy="270" rx="25" ry="6" fill="#8A5A2E"/><g fill="#E4573D"><circle cx="96" cy="264" r="7"/><circle cx="112" cy="262" r="7"/><circle cx="104" cy="254" r="7"/></g></g>
<g fill="#F4B63A"><circle cx="220" cy="330" r="3"/><circle cx="240" cy="322" r="3"/><circle cx="900" cy="334" r="3"/><circle cx="960" cy="326" r="3"/><circle cx="1180" cy="320" r="3"/></g>
<path d="M0 372 Q600 366 1200 372 V420 H0z" fill="#101A08" opacity=".5"/>
'''
    return _wrap("207-4", body, defs)


_BUILDERS = {
    "104-1": _b104_1, "104-2": _b104_2, "104-3": _b104_3, "104-4": _b104_4,
    "207-1": _b207_1, "207-2": _b207_2, "207-3": _b207_3, "207-4": _b207_4,
}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {k: _clean(f()) for k, f in _BUILDERS.items()}


def banner(key):
    """Return the complete inline <svg> for a room-unit key such as "104-3"."""
    return BANNERS[key]


if __name__ == "__main__":
    for k in BANNERS:
        print(k, len(BANNERS[k].encode("utf-8")), "bytes")
