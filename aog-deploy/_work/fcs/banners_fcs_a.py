"""Unit banners for the Family & Consumer Sciences course, units 1-10 (K-2, 3-5, 6-8).

Ten drawn, layered scenes of kitchens, sinks, sewing tables, stores and
classrooms as inline SVG.  Stdlib only.

    from banners_fcs_a import BANNERS, CREDITS, banner
    banner(5)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"fb{n}-" so all FCS banners can sit on one contents page.
No text, no images, no external references, no feTurbulence.

The page paints a dark gradient over the bottom ~45% for the unit title,
so the lower part of every scene is kept calm and the action sits in the
upper 55%.
"""

W, H = 1200, 420

CREDITS = {
    1: "Drawn scene: a bright bathroom sink where a child washes soapy hands under a running tap, bubbles rising, a towel on its hook and a sparkle of glitter on the counter",
    2: "Drawn scene: a kitchen stove with a steaming pot, an oven mitt and pot holder, a mug of cocoa on the counter and a pair of scissors resting point-down",
    3: "Drawn scene: a lunch plate on a checked cloth with fruit, vegetables, bread, protein and a glass of water beside a rainbow of produce, and a small slice of birthday cake",
    4: "Drawn scene: a classroom corner with labeled bins on shelves, coats on hooks, blocks half put away, a watering can and a potted plant on the windowsill",
    5: "Drawn scene: a kitchen counter with nested dry measuring cups, a glass liquid measuring cup, measuring spoons, a bag of flour and a tray of cookies",
    6: "Drawn scene: a sewing table with a tomato pincushion, spools of thread, scissors, scattered buttons and a stuffed bear with a seam being stitched closed",
    7: "Drawn scene: a grocery aisle with two shelves of cereal boxes and small price tags, a shopping basket and a savings jar of coins with a picture taped on it",
    8: "Drawn scene: a warm kitchen at dinner time with a pot simmering on the stove, a kitchen timer, a wall clock, plates set on the table and dishes drying in a rack",
    9: "Drawn scene: a cooking-lab kitchen with color-coded cutting boards, a food thermometer in a roast, a lidded pan on the range, a refrigerator and a fire extinguisher on the wall",
    10: "Drawn scene: a wooden cutting board with a chef's knife, a half-diced onion, garlic cloves, a bunch of basil and small bowls of cut vegetables on a damp towel",
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


def _sparks(seed, n, x0, x1, y0, y1, color="#fff", op=".8"):
    """Deterministic scatter of small dots inside a box."""
    x, out = seed, []
    for _ in range(n):
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        px = x0 + x % max(1, x1 - x0)
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        py = y0 + x % max(1, y1 - y0)
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        r = 0.8 + (x % 10) / 8
        out.append(f'<circle cx="{px}" cy="{py}" r="{r:.1f}"/>')
    return f'<g fill="{color}" opacity="{op}">{"".join(out)}</g>'


def _tiles(y0, y1, step, color, op=".35", slant=0):
    out = []
    for x in range(-100, W + 200, step):
        out.append(f'<path d="M{x} {y0} l{slant} {y1 - y0}" stroke="{color}" stroke-width="2" opacity="{op}"/>')
    for y in range(y0, y1, step):
        out.append(f'<path d="M0 {y} H{W}" stroke="{color}" stroke-width="2" opacity="{op}"/>')
    return "".join(out)


def _steam(x, y, s=1.0, color="#fff", op=".55"):
    out = []
    for i, dx in enumerate((-14, 4, 20)):
        yy = y - i * 6
        out.append(f'<path d="M{x + dx * s:.0f} {yy:.0f} q{-10 * s:.0f} {-22 * s:.0f} {6 * s:.0f} {-40 * s:.0f} q{12 * s:.0f} {-18 * s:.0f} {-2 * s:.0f} {-38 * s:.0f}" '
                   f'stroke="{color}" stroke-width="{4 * s:.1f}" fill="none" stroke-linecap="round" opacity="{op}"/>')
    return "".join(out)


def _wrap(n, body, defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[n]}" focusable="false"><defs>{defs}</defs>{body}</svg>')


# ───────────────────────── 1  Clean Hands: washing at the sink ─────────────────────────
def _b1():
    p = "fb1-"
    S = "#2E3A55"
    defs = (_lin(p+"wall", [(0, "#DDF1F7", None), (1, "#BFE0EC", None)])
            + _lin(p+"counter", [(0, "#F6F1E6", None), (1, "#CFC6B4", None)])
            + _lin(p+"basin", [(0, "#FFFFFF", None), (1, "#D6E6EE", None)])
            + _rad(p+"bub", [(0, "#FFFFFF", .95), (.7, "#DDF3FA", .5), (1, "#9AD3E8", .2)])
            + _lin(p+"floor", [(0, "#8AA6B8", None), (1, "#3C5064", None)]))
    tiles = _tiles(0, 200, 50, "#FFFFFF", ".5")
    bubbles = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="url(#{p}bub)"/><circle cx="{x - r*.3:.0f}" cy="{y - r*.3:.0f}" r="{r*.22:.1f}" fill="#fff" opacity=".9"/>'
                      for x, y, r in [(470, 150, 16), (520, 118, 10), (560, 160, 22), (690, 130, 14), (730, 100, 9), (640, 88, 12), (600, 180, 9), (760, 170, 18), (430, 200, 11)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{tiles}
<rect x="130" y="30" width="230" height="160" rx="8" fill="#F8FBFC"/><rect x="140" y="40" width="210" height="140" rx="4" fill="#C9E4EE"/>
<path d="M150 50 l90 120" stroke="#FFF" stroke-width="10" opacity=".5"/><rect x="130" y="30" width="230" height="160" rx="8" fill="none" stroke="#8FAEBB" stroke-width="6"/>
<g><rect x="960" y="40" width="8" height="30" fill="#8FAEBB"/><circle cx="964" cy="42" r="7" fill="#8FAEBB"/>
<path d="M930 70 h70 v150 q-35 14 -70 0z" fill="#F6C56A"/><path d="M930 70 h70 v10 h-70z" fill="#E4A33A"/><path d="M948 120 h34 M948 150 h34 M948 180 h34" stroke="#E4A33A" stroke-width="4"/></g>
<path d="M0 232 H1200 V300 H0z" fill="url(#{p}counter)"/><path d="M0 232 h1200 v6 H0z" fill="#FFFFFF" opacity=".7"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M380 238 q0 60 60 60 h320 q60 0 60 -60z" fill="url(#{p}basin)"/><ellipse cx="600" cy="240" rx="220" ry="16" fill="#E8F1F5"/><ellipse cx="600" cy="240" rx="212" ry="11" fill="#FFFFFF"/>
<circle cx="600" cy="286" r="8" fill="#9AB4C0"/>
<g fill="#B9C6CE"><path d="M584 232 v-70 q0 -22 22 -22 h20 q30 0 34 34 v10" stroke="#B9C6CE" stroke-width="14" fill="none" stroke-linecap="round"/><rect x="640" y="180" width="30" height="10" rx="3"/><rect x="560" y="150" width="20" height="10" rx="4"/></g>
<path d="M655 192 v46" stroke="#9AD3E8" stroke-width="8" opacity=".8"/><path d="M655 192 v46" stroke="#FFFFFF" stroke-width="3" opacity=".9"/>
<g fill="#F1B48E"><path d="M600 262 l-40 -30 q-10 -14 6 -18 l20 6 l-4 -30 q4 -12 14 -4 l10 32 l6 -34 q6 -12 14 -2 l0 36 l14 -22 q10 -8 12 4 l-6 34 q14 -4 16 8 q-2 20 -30 30z"/><path d="M700 262 l40 -30 q10 -14 -6 -18 l-20 6 l4 -30 q-4 -12 -14 -4 l-10 32 l-6 -34 q-6 -12 -14 -2 l0 36 l-14 -22 q-10 -8 -12 4 l6 34 q-14 -4 -16 8 q2 20 30 30z"/></g>
<g fill="#F9F5EE" opacity=".95"><circle cx="612" cy="230" r="22"/><circle cx="650" cy="220" r="26"/><circle cx="690" cy="234" r="20"/><circle cx="632" cy="250" r="18"/><circle cx="672" cy="256" r="16"/></g>
{bubbles}
<g><rect x="800" y="196" width="60" height="42" rx="6" fill="#7BC8E6"/><rect x="800" y="196" width="60" height="42" rx="6" fill="none" stroke="#5AA6C4" stroke-width="3"/><path d="M822 196 v-12 h16 v12" fill="#5AA6C4"/><path d="M830 184 q0 -10 10 -10" stroke="#5AA6C4" stroke-width="4" fill="none"/></g>
{_sparks(7, 40, 180, 380, 200, 232, "#E8C25A", ".9")}{_sparks(19, 22, 880, 1180, 205, 232, "#D774C4", ".85")}
<path d="M0 372 Q300 364 600 370 T1200 366 V420 H0z" fill="#1E2A3C" opacity=".5"/>
'''
    return _wrap(1, body, defs)


# ───────────────────────── 2  Hot, Cold and Sharp: the stove and the scissors ─────────────────────────
def _b2():
    p = "fb2-"
    S = "#3A2C24"
    defs = (_lin(p+"wall", [(0, "#F7E6C6", None), (1, "#EFCF9B", None)])
            + _lin(p+"stove", [(0, "#F3F3F1", None), (1, "#C9C8C2", None)])
            + _lin(p+"counter", [(0, "#8E6A48", None), (1, "#5A3F2A", None)])
            + _lin(p+"pot", [(0, "#6B7A8A", None), (1, "#2F3A48", None)])
            + _rad(p+"burner", [(0, "#FF8A3A", .95), (.6, "#E43B1F", .8), (1, "#E43B1F", 0)])
            + _lin(p+"floor", [(0, "#B99A72", None), (1, "#5E4A32", None)]))
    tiles = _tiles(0, 200, 44, "#FFFFFF", ".45")
    coils = "".join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{c}" stroke-width="4"/>' for cx, cy, r, c in
                    [(470, 224, 28, "#E43B1F"), (470, 224, 18, "#FF8A3A"), (470, 224, 8, "#FF8A3A"), (700, 226, 28, "#4A4A4A"), (700, 226, 18, "#4A4A4A"), (700, 226, 8, "#4A4A4A")])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{tiles}
<rect x="80" y="40" width="240" height="150" rx="6" fill="#9ED2EA"/><path d="M90 50 l80 130" stroke="#FFF" stroke-width="12" opacity=".55"/><rect x="80" y="40" width="240" height="150" rx="6" fill="none" stroke="#FFFFFF" stroke-width="8"/><path d="M200 40 v150" stroke="#FFF" stroke-width="6"/>
<g><rect x="1010" y="40" width="10" height="24" fill="#8A6A4A"/><path d="M1000 64 h30 l6 40 q-22 30 -56 44 q-22 -24 -22 -56 q10 -20 42 -28z" fill="#E2603A"/><path d="M968 148 q18 -30 62 -44" stroke="#F7E6C6" stroke-width="6" fill="none" opacity=".7"/><path d="M1000 64 h30 v10 h-30z" fill="#B84A2A"/></g>
<g><rect x="1100" y="60" width="10" height="20" fill="#8A6A4A"/><rect x="1070" y="80" width="70" height="70" rx="8" fill="#5A8A6A"/><path d="M1080 90 h50 M1080 105 h50 M1080 120 h50 M1080 135 h50" stroke="#F0E8D0" stroke-width="4" opacity=".7"/></g>
<path d="M0 250 H1200 V300 H0z" fill="url(#{p}counter)"/><path d="M0 250 h1200 v6 H0z" fill="#B48A5E"/>
<rect x="380" y="180" width="420" height="70" rx="6" fill="url(#{p}stove)"/><rect x="380" y="150" width="420" height="30" rx="4" fill="#DDDCD8"/>
<g fill="#4A4A4A"><circle cx="420" cy="165" r="8"/><circle cx="460" cy="165" r="8"/><circle cx="720" cy="165" r="8"/><circle cx="760" cy="165" r="8"/></g><circle cx="420" cy="165" r="8" fill="#E43B1F"/>
<rect x="380" y="180" width="420" height="70" rx="6" fill="#EDECE8"/>{coils}
<ellipse cx="470" cy="224" rx="60" ry="30" fill="url(#{p}burner)" opacity=".7"/>
<g><path d="M410 226 q0 -50 60 -50 q60 0 60 50 v-56 h-120z" fill="url(#{p}pot)"/><rect x="410 " y="164" width="120" height="66" rx="8" fill="url(#{p}pot)"/><path d="M406 166 h128" stroke="#8A9AA8" stroke-width="6" stroke-linecap="round"/>
<path d="M530 176 h60 q10 0 10 8 q0 8 -10 8 h-60" fill="#2F3A48"/><path d="M400 176 h-18 q-6 0 -6 6 q0 6 6 6 h18" fill="#2F3A48"/></g>
{_steam(470, 156, 1.2, "#FFFFFF", ".7")}
<g><rect x="640" y="200" width="120" height="14" rx="4" fill="#3A5A8A"/><path d="M640 214 q60 22 120 0" fill="#3A5A8A"/></g>
<g><path d="M160 250 v-52 q0 -10 10 -10 h60 q10 0 10 10 v52z" fill="#E4573D"/><path d="M240 210 q26 0 26 20 q0 20 -26 20" stroke="#E4573D" stroke-width="10" fill="none"/><ellipse cx="200" cy="216" rx="30" ry="10" fill="#8A3A24"/><ellipse cx="200" cy="214" rx="26" ry="7" fill="#6A3A2A"/></g>
{_steam(200, 196, .8, "#FFFFFF", ".55")}
<g stroke="#6A6A6A" stroke-width="7" fill="none" stroke-linecap="round"><path d="M900 250 l16 -70"/><path d="M932 250 l-16 -70"/></g><g fill="none" stroke="#E4573D" stroke-width="8"><ellipse cx="892" cy="150" rx="18" ry="24" transform="rotate(20 892 150)"/><ellipse cx="940" cy="150" rx="18" ry="24" transform="rotate(-20 940 150)"/></g><circle cx="916" cy="182" r="4" fill="#333"/>
<g fill="#F4B63A"><rect x="1040" y="222" width="90" height="28" rx="4"/><rect x="1050" y="216" width="70" height="8" rx="3" fill="#E89A2A"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#20140A" opacity=".55"/>
'''
    return _wrap(2, body, defs)


# ───────────────────────── 3  Everyday Food and Sometimes Food: the plate ─────────────────────────
def _fruitrow():
    items = []
    for i, (c, kind) in enumerate([("#E43B1F", "round"), ("#F4A22E", "round"), ("#F2D53C", "banana"), ("#6DB33F", "round"),
                                    ("#4A8A3C", "leaf"), ("#3B6AB8", "berry"), ("#7B4BA8", "round")]):
        x = 760 + i * 58
        if kind == "round":
            items.append(f'<circle cx="{x}" cy="130" r="22" fill="{c}"/><circle cx="{x - 8}" cy="122" r="6" fill="#fff" opacity=".4"/><path d="M{x} 108 q4 -12 12 -12" stroke="#4A6A2A" stroke-width="3" fill="none"/>')
        elif kind == "banana":
            items.append(f'<path d="M{x - 22} 118 q22 40 44 6 q-10 12 -44 -6z" fill="{c}"/><path d="M{x - 22} 118 q22 34 44 6" stroke="#C9A22A" stroke-width="3" fill="none"/>')
        elif kind == "leaf":
            items.append(f'<path d="M{x - 22} 148 q10 -50 46 -44 q-6 44 -46 44z" fill="{c}"/><path d="M{x - 18} 146 q14 -30 40 -40" stroke="#2E5A24" stroke-width="2" fill="none"/>')
        else:
            items.append("".join(f'<circle cx="{x + dx}" cy="{132 + dy}" r="9" fill="{c}"/>' for dx, dy in [(-12, 0), (12, 0), (0, -10), (0, 10)]))
    return "".join(items)


def _b3():
    p = "fb3-"
    defs = (_lin(p+"wall", [(0, "#FBF3DD", None), (1, "#F2DFB2", None)])
            + _lin(p+"cloth", [(0, "#F6E8D0", None), (1, "#D9C29A", None)])
            + _rad(p+"plate", [(0, "#FFFFFF", None), (.85, "#F4F4F0", None), (1, "#D8D8D0", None)])
            + _lin(p+"water", [(0, "#BFE7F7", .9), (1, "#7CC3E4", .9)]))
    checks = "".join(f'<rect x="{x}" y="{y}" width="30" height="30" fill="#E4573D" opacity=".18"/>'
                     for y in range(240, 420, 60) for x in range(0, 1200, 60)) + "".join(
        f'<rect x="{x}" y="{y}" width="30" height="30" fill="#E4573D" opacity=".18"/>' for y in range(270, 420, 60) for x in range(30, 1200, 60))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<g stroke="#E8D6A8" stroke-width="2" opacity=".6">{"".join(f'<path d="M{x} 0 v240" />' for x in range(0, 1200, 40))}</g>
<rect x="60" y="30" width="270" height="170" rx="8" fill="#A8D8F0"/><path d="M60 30 h270 v170 h-270z" fill="none" stroke="#FFFFFF" stroke-width="10"/><path d="M195 30 v170 M60 115 h270" stroke="#FFFFFF" stroke-width="6"/>
<path d="M70 200 q60 -80 130 -40 q40 -50 120 -20 v60 h-250z" fill="#8FC96A" opacity=".85"/><circle cx="110" cy="70" r="26" fill="#FFE27A" opacity=".9"/>
<path d="M0 240 H1200 V420 H0z" fill="url(#{p}cloth)"/>{checks}
<path d="M720 92 h420 v100 h-420z" fill="#FFFFFF" opacity=".6"/><rect x="720" y="92" width="420" height="100" rx="8" fill="none" stroke="#C9A36A" stroke-width="4"/>
{_fruitrow()}
<ellipse cx="480" cy="250" rx="240" ry="70" fill="url(#{p}plate)"/><ellipse cx="480" cy="250" rx="200" ry="52" fill="none" stroke="#DADAD2" stroke-width="3"/>
<g><path d="M480 250 L300 250 A180 52 0 0 1 480 198z" fill="#6DB33F" opacity=".85"/><path d="M480 250 L480 198 A180 52 0 0 1 660 250z" fill="#E43B1F" opacity=".8"/><path d="M480 250 L660 250 A180 52 0 0 1 480 302z" fill="#E8B04A" opacity=".85"/><path d="M480 250 L480 302 A180 52 0 0 1 300 250z" fill="#C97A48" opacity=".85"/></g>
<g fill="#4A8A3C"><circle cx="380" cy="228" r="16"/><circle cx="410" cy="216" r="14"/><circle cx="350" cy="240" r="12"/></g><g fill="#F4A22E"><path d="M398 246 l30 -8 l-4 -12 l-30 8z"/><path d="M370 254 l30 -10 l-4 -10 l-30 10z"/></g>
<g fill="#E4573D"><circle cx="540" cy="222" r="12"/><circle cx="570" cy="230" r="12"/><circle cx="520" cy="240" r="11"/></g><g fill="#7B4BA8"><circle cx="600" cy="226" r="8"/><circle cx="612" cy="240" r="8"/><circle cx="592" cy="244" r="8"/></g>
<g><path d="M560 264 h60 v22 q-30 10 -60 0z" fill="#E8B04A"/><path d="M560 264 h60 v6 h-60z" fill="#C98A2A"/><path d="M584 262 q6 -22 12 0z" fill="#8FC96A"/></g>
<g><ellipse cx="400" cy="278" rx="46" ry="16" fill="#C97A48"/><ellipse cx="400" cy="274" rx="40" ry="12" fill="#E09A62"/><path d="M370 270 h30 M380 280 h40" stroke="#A85A2A" stroke-width="3"/></g>
<g><path d="M120 250 v-80 q0 -8 8 -8 h54 q8 0 8 8 v80z" fill="url(#{p}water)"/><rect x="120" y="162" width="70" height="8" rx="3" fill="#FFFFFF" opacity=".8"/><path d="M128 190 h54" stroke="#FFFFFF" stroke-width="2" opacity=".7"/><path d="M130 182 v56" stroke="#FFFFFF" stroke-width="6" opacity=".5"/></g>
<g><path d="M960 250 l50 -70 l40 6 l-8 68z" fill="#F6D8E0"/><path d="M960 250 l50 -70 l40 6 l-8 68" fill="none" stroke="#C97A9A" stroke-width="2"/><path d="M1010 180 l40 6 l-2 14 l-42 -8z" fill="#E4A0B8"/><path d="M990 208 l44 8 l-2 12 l-44 -8z" fill="#E4A0B8"/><rect x="1024" y="164" width="4" height="18" fill="#3B6AB8"/><path d="M1026 164 q-6 -10 0 -16 q6 6 0 16z" fill="#F4A22E"/></g>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#3A2810" opacity=".5"/>
'''
    return _wrap(3, body, defs)


# ───────────────────────── 4  A Job Done to the End: the classroom corner ─────────────────────────
def _b4():
    p = "fb4-"
    S = "#3A2C24"
    defs = (_lin(p+"wall", [(0, "#EFE6CE", None), (1, "#E0D0A8", None)])
            + _lin(p+"floor", [(0, "#C9A26E", None), (1, "#6E4E2E", None)])
            + _lin(p+"shelf", [(0, "#B98A58", None), (1, "#8A6238", None)])
            + _lin(p+"sky", [(0, "#8ECBEE", None), (1, "#D4ECF8", None)]))
    bins = "".join(f'<g><path d="M{x} {y} h74 l-6 44 h-62z" fill="{c}"/><rect x="{x - 2}" y="{y - 6}" width="78" height="10" rx="3" fill="{c}"/><rect x="{x + 14}" y="{y + 12}" width="46" height="18" rx="3" fill="#FFF8E8" opacity=".85"/></g>'
                   for x, y, c in [(70, 60, "#E4573D"), (160, 60, "#3BB3A6"), (250, 60, "#F4B63A"), (70, 140, "#5AA0E0"), (160, 140, "#7B5BC9"), (250, 140, "#7FBF3A")])
    hooks = "".join(f'<path d="M{x} 92 v18 q0 8 8 8" stroke="#6A5A4A" stroke-width="4" fill="none"/>' for x in range(900, 1160, 60))
    coats = "".join(f'<path d="M{x - 24} 118 l12 -8 h24 l12 8 l6 30 l-8 2 v70 h-44 v-70 l-8 -2z" fill="{c}"/><path d="M{x - 8} 110 h16 v20 h-16z" fill="#FFFFFF" opacity=".25"/>'
                    for x, c in [(908, "#E4573D"), (968, "#3B6AB8"), (1088, "#F4B63A")])
    blocks = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{c}"/>' for x, y, w, h, c in
                     [(480, 232, 60, 34, "#E4573D"), (548, 232, 34, 34, "#F4B63A"), (500, 200, 44, 32, "#5AA0E0"), (610, 240, 40, 26, "#7FBF3A"), (560, 200, 30, 30, "#7B5BC9")])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="520" y="30" width="260" height="150" rx="6" fill="url(#{p}sky)"/><path d="M520 30 h260 v150 h-260z" fill="none" stroke="#FFFFFF" stroke-width="10"/><path d="M650 30 v150 M520 105 h260" stroke="#FFFFFF" stroke-width="6"/>
<circle cx="740" cy="70" r="24" fill="#FFE27A" opacity=".9"/><path d="M530 180 q60 -60 120 -30 q60 -40 120 -10 v40 h-240z" fill="#8FC96A" opacity=".7"/>
<rect x="500" y="180" width="300" height="12" rx="3" fill="url(#{p}shelf)"/>
<g><path d="M700 178 v-44 q0 -6 6 -6 h34 q6 0 6 6 v44z" fill="#C97A48"/><path d="M696 134 h56" stroke="#A85A2A" stroke-width="6"/><path d="M728 90 q-30 10 -34 40 q14 -14 34 -12 q20 -2 30 18 q-2 -34 -30 -46z" fill="#4A8A3C"/><path d="M712 118 q16 -30 30 -40" stroke="#2E5A24" stroke-width="2" fill="none"/><path d="M726 128 v-32" stroke="#4A8A3C" stroke-width="4"/></g>
<g><path d="M560 176 v-36 q0 -6 6 -6 h40 q6 0 6 6 v36z" fill="#3BB3A6"/><path d="M612 150 q20 -6 34 -24" stroke="#3BB3A6" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M560 146 q26 -10 52 0" stroke="#2A8A80" stroke-width="4" fill="none"/><path d="M566 134 q26 -14 40 -4" fill="#3BB3A6"/></g>
<g><rect x="40" y="40" width="300" height="180" rx="6" fill="#F7F1E4"/><rect x="40" y="40" width="300" height="180" rx="6" fill="none" stroke="#8A6238" stroke-width="6"/><rect x="40" y="130" width="300" height="8" fill="#8A6238"/><rect x="40" y="212" width="300" height="8" fill="#8A6238"/></g>
{bins}
<rect x="880" y="82" width="300" height="14" rx="4" fill="url(#{p}shelf)"/>{hooks}{coats}
<path d="M0 270 H1200 V420 H0z" fill="url(#{p}floor)"/>{"".join(f'<path d="M{x} 270 l-40 150" stroke="#8A6238" stroke-width="2" opacity=".35"/>' for x in range(0, 1300, 100))}
<rect x="380" y="200" width="20" height="70" fill="#8A6238"/><rect x="380" y="196" width="320" height="8" rx="2" fill="#B98A58"/><path d="M380 266 h320 v8 h-320z" fill="#8A6238"/><rect x="680" y="200" width="20" height="70" fill="#8A6238"/>
{blocks}
<g><path d="M430 258 h80 l-6 30 h-68z" fill="#F4B63A"/><rect x="428" y="252" width="84" height="8" rx="3" fill="#E8A83A"/><rect x="452" y="266" width="36" height="14" rx="3" fill="#FFF8E8" opacity=".85"/></g>
<g fill="{S}"><circle cx="820" cy="222" r="11"/><path d="M810 236 h20 l6 60 h-32z"/><path d="M810 244 l-30 24 l4 4 l30 -22z"/></g><rect x="770" y="262" width="26" height="22" rx="3" fill="#5AA0E0"/>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#2A1A0A" opacity=".5"/>
'''
    return _wrap(4, body, defs)


# ───────────────────────── 5  Measure It Right: cups and spoons on the counter ─────────────────────────
def _cup(x, y, w, h, c, hi="#fff"):
    return (f'<path d="M{x} {y} h{w} l{-w*.12:.0f} {h} h{-w*.76:.0f}z" fill="{c}"/>'
            f'<path d="M{x + w} {y + 8} h22 q8 0 8 8 q0 8 -8 8 h-20" stroke="{c}" stroke-width="6" fill="none"/>'
            f'<ellipse cx="{x + w/2:.0f}" cy="{y}" rx="{w/2:.0f}" ry="5" fill="{hi}" opacity=".5"/>')


def _spoon(x, y, r, c, rot=0):
    return (f'<g transform="rotate({rot} {x} {y})"><ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*.7:.0f}" fill="{c}"/>'
            f'<ellipse cx="{x}" cy="{y}" rx="{r*.7:.0f}" ry="{r*.4:.0f}" fill="#000" opacity=".15"/>'
            f'<rect x="{x + r - 2}" y="{y - 3}" width="{r * 3}" height="6" rx="3" fill="{c}"/></g>')


def _b5():
    p = "fb5-"
    defs = (_lin(p+"wall", [(0, "#FDF6E3", None), (1, "#F3E2BE", None)])
            + _lin(p+"counter", [(0, "#EDE5D4", None), (1, "#BDB19A", None)])
            + _lin(p+"glass", [(0, "#D6EEF8", .7), (1, "#9CD0EA", .8)])
            + _lin(p+"flour", [(0, "#FFFFFF", None), (1, "#E7DEC8", None)])
            + _lin(p+"floor", [(0, "#A88A62", None), (1, "#5A4630", None)]))
    tiles = "".join(f'<rect x="{x}" y="{y}" width="56" height="56" fill="#A8D8E8" opacity="{.35 if (x//60 + y//60) % 2 else .18}"/>' for y in range(0, 190, 60) for x in range(0, 1200, 60))
    cookies = "".join(f'<circle cx="{x}" cy="{y}" r="17" fill="#C98A48"/><circle cx="{x-5}" cy="{y-4}" r="3" fill="#4A2A18"/><circle cx="{x+6}" cy="{y+3}" r="3" fill="#4A2A18"/><circle cx="{x-2}" cy="{y+7}" r="2.5" fill="#4A2A18"/>'
                      for x, y in [(880, 178), (930, 176), (980, 180), (1030, 176), (905, 210), (955, 212), (1005, 208)])
    marks = "".join(f'<path d="M{590 - k*10} {230 - k*14} h{14 if k % 2 else 26}" stroke="#2A6A9A" stroke-width="2"/>' for k in range(6))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{tiles}
<rect x="0" y="190" width="{W}" height="10" fill="#C9A36A"/>
<path d="M0 250 H1200 V310 H0z" fill="url(#{p}counter)"/><path d="M0 250 h1200 v6 H0z" fill="#FFFFFF" opacity=".8"/>
<path d="M0 310 H1200 V420 H0z" fill="url(#{p}floor)"/>
<g><path d="M130 250 v-120 q0 -12 12 -12 h110 q12 0 12 12 v120z" fill="url(#{p}flour)"/><path d="M142 118 h110 l8 -22 h-126z" fill="#E7DEC8"/><rect x="150" y="150" width="86" height="60" rx="6" fill="#5AA0E0"/><path d="M158 190 q36 -50 70 0z" fill="#F4E2B0"/><circle cx="193" cy="168" r="8" fill="#F4E2B0"/></g>
<path d="M120 250 q40 -30 100 -14 q30 -14 60 14z" fill="#FFFFFF"/>
{_cup(320, 196, 100, 54, "#E4573D")}{_cup(360, 210, 80, 40, "#F4B63A")}{_cup(392, 222, 64, 28, "#3BB3A6")}
<path d="M328 200 h88 l-4 12 h-80z" fill="#F4E2B0"/>
<g><path d="M540 250 v-120 h120 v120z" fill="url(#{p}glass)"/><path d="M540 250 v-120 h120 v120" fill="none" stroke="#7FB8D4" stroke-width="4"/><path d="M660 140 h34 q10 0 10 10 v40 q0 10 -10 10 h-34" stroke="#7FB8D4" stroke-width="8" fill="none"/>{marks}<path d="M544 188 h112 v62 h-112z" fill="#5AA0E0" opacity=".6"/><path d="M544 188 h112" stroke="#FFFFFF" stroke-width="3" opacity=".8"/></g>
<path d="M660 140 h34 q10 0 10 10 v40 q0 10 -10 10 h-34" stroke="#D6EEF8" stroke-width="3" fill="none" opacity=".7"/>
{_spoon(740, 236, 16, "#8A9AA8", -20)}{_spoon(778, 240, 11, "#8A9AA8", -30)}{_spoon(806, 244, 8, "#8A9AA8", -40)}
<g><rect x="850" y="150" width="210" height="80" rx="8" fill="#5A6A7A"/><rect x="858" y="158" width="194" height="64" rx="6" fill="#8A9AA8"/>{cookies}</g>
<rect x="1090" y="196" width="70" height="54" rx="6" fill="#E4A33A"/><path d="M1090 210 h70" stroke="#C98A2A" stroke-width="4"/><path d="M1096 232 h58" stroke="#FFFFFF" stroke-width="3" opacity=".6"/>
<g fill="#FFFFFF" opacity=".9"><circle cx="330" cy="244" r="3"/><circle cx="470" cy="248" r="2.5"/><circle cx="290" cy="240" r="2"/><circle cx="500" cy="242" r="3"/></g>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#2A1E10" opacity=".5"/>
'''
    return _wrap(5, body, defs)


# ───────────────────────── 6  The Needle and the Button: the sewing table ─────────────────────────
def _spool(x, y, c):
    return (f'<rect x="{x}" y="{y}" width="34" height="46" rx="4" fill="{c}"/><rect x="{x - 4}" y="{y - 4}" width="42" height="8" rx="2" fill="#D9C29A"/>'
            f'<rect x="{x - 4}" y="{y + 42}" width="42" height="8" rx="2" fill="#D9C29A"/>'
            + "".join(f'<path d="M{x} {y + 8 + k*8} h34" stroke="#000" stroke-width="1.5" opacity=".18"/>' for k in range(4)))


def _button(x, y, r, c, holes=4):
    h = "".join(f'<circle cx="{x + dx}" cy="{y + dy}" r="{r*.14:.1f}" fill="#3A2C24"/>' for dx, dy in
                ([(-r*.3, -r*.3), (r*.3, -r*.3), (-r*.3, r*.3), (r*.3, r*.3)] if holes == 4 else [(-r*.3, 0), (r*.3, 0)]))
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/><circle cx="{x}" cy="{y}" r="{r*.75:.1f}" fill="none" stroke="#000" stroke-width="1.5" opacity=".18"/>{h}'


def _b6():
    p = "fb6-"
    defs = (_lin(p+"wall", [(0, "#F1E4D2", None), (1, "#E2CDB0", None)])
            + _lin(p+"table", [(0, "#C9A26E", None), (1, "#7A5A3A", None)])
            + _lin(p+"cloth", [(0, "#8FB8D8", None), (1, "#5A8AB8", None)])
            + _rad(p+"lamp", [(0, "#FFF0C0", .8), (1, "#FFF0C0", 0)]))
    grain = "".join(f'<path d="M0 {y} q300 6 600 0 t600 0" stroke="#5A3E22" stroke-width="1.5" fill="none" opacity=".25"/>' for y in range(250, 420, 22))
    buttons = "".join(_button(x, y, r, c, h) for x, y, r, c, h in [(700, 226, 14, "#E4573D", 4), (738, 236, 11, "#3B6AB8", 2), (770, 222, 12, "#F4B63A", 4), (720, 254, 9, "#7B5BC9", 2), (760, 254, 10, "#3BB3A6", 4)])
    stitches = "".join(f'<path d="M{x} {230 + (k % 2) * 6} l10 -6" stroke="#E4573D" stroke-width="3" stroke-linecap="round"/>' for k, x in enumerate(range(940, 1010, 14)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{"".join(f'<path d="M{x} 0 v250" stroke="#D9C29A" stroke-width="3" opacity=".5"/>' for x in range(20, 1200, 70))}
<ellipse cx="380" cy="150" rx="320" ry="180" fill="url(#{p}lamp)"/>
<g><path d="M306 0 h8 v70 h-8z" fill="#5A4A3A"/><path d="M250 100 l30 -30 h60 l30 30z" fill="#E4A33A"/><path d="M250 100 h120 v6 h-120z" fill="#C98A2A"/></g>
<g><rect x="60" y="60" width="140" height="180" rx="8" fill="#8A6238"/><rect x="70" y="70" width="120" height="160" rx="4" fill="#E8D9C0"/><path d="M80 90 h100 M80 120 h100 M80 150 h100 M80 180 h100" stroke="#C9A36A" stroke-width="3"/>
<path d="M90 100 h30 v18 h-30z M130 100 h40 v18 h-40z M90 130 h50 v18 h-50z M150 130 h20 v18 h-20z" fill="#E4573D" opacity=".5"/><path d="M90 160 h80 v18 h-80z" fill="#3BB3A6" opacity=".5"/><path d="M90 190 h40 v18 h-40z M140 190 h30 v18 h-30z" fill="#F4B63A" opacity=".6"/></g>
<path d="M0 250 H1200 V420 H0z" fill="url(#{p}table)"/>{grain}
<path d="M430 250 q40 -40 160 -30 q120 -10 180 30z" fill="url(#{p}cloth)"/><path d="M450 250 q40 -30 140 -22" stroke="#FFFFFF" stroke-width="2" fill="none" opacity=".5"/>
{_spool(360, 200, "#E4573D")}{_spool(404, 210, "#3B6AB8")}{_spool(448, 204, "#F4B63A")}
<g><circle cx="600" cy="214" r="34" fill="#E43B1F"/><circle cx="600" cy="214" r="34" fill="none" stroke="#B82A18" stroke-width="2" opacity=".5"/><path d="M600 180 q-6 20 0 34 q6 -14 0 -34z M566 214 q20 -6 34 0 q-14 6 -34 0z" fill="#B82A18" opacity=".35"/><path d="M596 178 q4 -14 12 -12 q-2 10 -12 12z" fill="#4A8A3C"/><circle cx="634" cy="232" r="10" fill="#8A8A8A"/><path d="M634 232 l-14 -30" stroke="#8A8A8A" stroke-width="3"/>
<path d="M580 190 l-24 -28" stroke="#C0C0C0" stroke-width="3"/><circle cx="556" cy="162" r="5" fill="#E4573D"/><path d="M612 190 l24 -28" stroke="#C0C0C0" stroke-width="3"/><circle cx="636" cy="162" r="5" fill="#3B6AB8"/><path d="M604 188 l4 -34" stroke="#C0C0C0" stroke-width="3"/><circle cx="608" cy="154" r="5" fill="#F4B63A"/></g>
{buttons}
<g stroke="#6A6A6A" stroke-width="7" fill="none" stroke-linecap="round"><path d="M830 240 l60 -44"/><path d="M842 196 l58 44"/></g><g fill="none" stroke="#E4573D" stroke-width="8"><ellipse cx="820" cy="246" rx="18" ry="24" transform="rotate(50 820 246)"/><ellipse cx="830" cy="190" rx="18" ry="24" transform="rotate(-50 830 190)"/></g>
<g><ellipse cx="1000" cy="230" rx="60" ry="36" fill="#B98A58"/><circle cx="1058" cy="196" r="28" fill="#B98A58"/><circle cx="1042" cy="176" r="10" fill="#B98A58"/><circle cx="1076" cy="176" r="10" fill="#B98A58"/><circle cx="1042" cy="178" r="5" fill="#D9C29A"/><circle cx="1076" cy="178" r="5" fill="#D9C29A"/>
<ellipse cx="1060" cy="206" rx="12" ry="8" fill="#D9C29A"/><circle cx="1050" cy="194" r="3" fill="#111"/><circle cx="1068" cy="194" r="3" fill="#111"/><circle cx="1060" cy="204" r="3" fill="#111"/>
<ellipse cx="960" cy="256" rx="16" ry="10" fill="#B98A58"/><ellipse cx="1030" cy="260" rx="16" ry="10" fill="#B98A58"/><path d="M940 232 q40 -6 76 0" stroke="#6A4A2A" stroke-width="2" fill="none"/>{stitches}
<path d="M1010 214 l26 -30" stroke="#C0C0C0" stroke-width="3"/><path d="M1036 184 q20 -10 30 20 q-4 16 -20 16" stroke="#E4573D" stroke-width="2" fill="none"/><circle cx="1036" cy="184" r="2.5" fill="#666"/></g>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#2A1A0A" opacity=".5"/>
'''
    return _wrap(6, body, defs)


# ───────────────────────── 7  Money and Choices: the cereal aisle ─────────────────────────
def _box(x, y, w, h, c, c2):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{c}"/><rect x="{x + 6}" y="{y + 8}" width="{w - 12}" height="{h * .32:.0f}" rx="3" fill="{c2}"/>'
            f'<circle cx="{x + w/2:.0f}" cy="{y + h * .66:.0f}" r="{w * .22:.0f}" fill="#FFF8E8" opacity=".85"/><circle cx="{x + w/2:.0f}" cy="{y + h * .66:.0f}" r="{w * .12:.0f}" fill="{c2}" opacity=".7"/>')


def _tag(x, y, c="#F4B63A"):
    return f'<rect x="{x}" y="{y}" width="40" height="18" rx="2" fill="#FFF8E8"/><rect x="{x}" y="{y}" width="40" height="5" fill="{c}"/><path d="M{x + 6} {y + 12} h16 M{x + 26} {y + 12} h8" stroke="#3A2C24" stroke-width="2"/>'


def _coins(x, y, n):
    return "".join(f'<ellipse cx="{x + (k % 3) * 14 - 14}" cy="{y - (k // 3) * 6}" rx="12" ry="5" fill="#E8B04A" stroke="#C98A2A" stroke-width="1"/>' for k in range(n))


def _b7():
    p = "fb7-"
    S = "#3A2C24"
    defs = (_lin(p+"wall", [(0, "#F4F1E8", None), (1, "#E4DFD0", None)])
            + _lin(p+"shelf", [(0, "#D9D3C4", None), (1, "#A89F8C", None)])
            + _lin(p+"floor", [(0, "#C8C2B4", None), (1, "#6A6458", None)])
            + _lin(p+"jar", [(0, "#DFF1F8", .55), (1, "#A9D4E8", .7)]))
    row1 = "".join(_box(x, 86, 58, 84, c, c2) for x, c, c2 in [(120, "#E4573D", "#F4B63A"), (188, "#E4573D", "#F4B63A"), (256, "#3B6AB8", "#FFE27A"), (324, "#3B6AB8", "#FFE27A"), (392, "#7FBF3A", "#E4573D"), (460, "#7FBF3A", "#E4573D"), (528, "#7B5BC9", "#3BB3A6"), (596, "#7B5BC9", "#3BB3A6")])
    row2 = "".join(_box(x, 196, 78, 60, c, c2) for x, c, c2 in [(120, "#F4B63A", "#E4573D"), (210, "#F4B63A", "#E4573D"), (300, "#3BB3A6", "#FFF8E8"), (390, "#3BB3A6", "#FFF8E8"), (480, "#E4A33A", "#3B6AB8"), (570, "#E4A33A", "#3B6AB8")])
    tags1 = "".join(_tag(x, 174) for x in (126, 262, 398, 534))
    tags2 = "".join(_tag(x, 260, "#E4573D") for x in (126, 306, 486))
    weave = "".join(f'<path d="M{x} 176 l-10 60" stroke="#5A3A24" stroke-width="2" opacity=".5"/>' for x in range(870, 1010, 14))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="0" y="0" width="{W}" height="40" fill="#3BB3A6"/><rect x="0" y="40" width="{W}" height="6" fill="#2A8A80"/>
<rect x="90" y="60" width="600" height="220" rx="4" fill="#EDE8DA"/><rect x="90" y="60" width="600" height="220" rx="4" fill="none" stroke="#C9C2B0" stroke-width="4"/>
<rect x="96" y="170" width="588" height="10" fill="url(#{p}shelf)"/><rect x="96" y="256" width="588" height="10" fill="url(#{p}shelf)"/>
{row1}{tags1}{row2}{tags2}
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}floor)"/>{"".join(f'<path d="M{x} 280 l-60 140" stroke="#FFFFFF" stroke-width="2" opacity=".3"/>' for x in range(0, 1300, 120))}
<g><path d="M860 176 h150 l-14 84 h-122z" fill="#B85A34"/>{weave}<path d="M876 176 q60 -50 118 0" stroke="#3A2C24" stroke-width="8" fill="none" stroke-linecap="round"/>
<rect x="890" y="150" width="30" height="34" rx="3" fill="#E4573D"/><circle cx="950" cy="166" r="16" fill="#F4A22E"/><path d="M968 150 h28 v36 h-28z" fill="#5AA0E0"/></g>
<g><path d="M1060 250 v-90 q0 -10 10 -10 h80 q10 0 10 10 v90z" fill="url(#{p}jar)"/><rect x="1056" y="140" width="108" height="14" rx="4" fill="#5A8AB8"/><path d="M1064 160 v82" stroke="#FFFFFF" stroke-width="5" opacity=".6"/>
{_coins(1110, 240, 9)}<rect x="1080" y="172" width="70" height="46" fill="#FFF8E8" transform="rotate(-6 1115 195)"/><path d="M1090 210 l16 -22 l12 14 l10 -8 l14 20z" fill="#7FBF3A" transform="rotate(-6 1115 195)"/><circle cx="1136" cy="186" r="6" fill="#F4B63A" transform="rotate(-6 1115 195)"/><rect x="1108" y="166" width="22" height="8" fill="#F4B63A" opacity=".8"/></g>
<g fill="{S}"><circle cx="760" cy="150" r="12"/><path d="M748 165 h24 l8 84 h-40z"/><path d="M772 176 l40 20 l-3 6 l-40 -18z"/><path d="M748 176 l-30 30 l4 4 l30 -28z"/></g><rect x="808" y="192" width="20" height="26" rx="2" fill="#FFF8E8"/><path d="M812 198 h12 M812 204 h12 M812 210 h8" stroke="#3A2C24" stroke-width="2"/>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#1E1A14" opacity=".5"/>
'''
    return _wrap(7, body, defs)


# ───────────────────────── 8  Plan It, Cook It, Clean It Up: dinner at six ─────────────────────────
def _plate(x, y):
    return (f'<ellipse cx="{x}" cy="{y}" rx="34" ry="12" fill="#FFFFFF"/><ellipse cx="{x}" cy="{y}" rx="24" ry="8" fill="none" stroke="#DADAD2" stroke-width="2"/>'
            f'<path d="M{x - 48} {y - 10} v20 M{x - 52} {y - 10} v8 M{x - 44} {y - 10} v8" stroke="#8A9AA8" stroke-width="2.5"/><path d="M{x + 48} {y - 10} v20" stroke="#8A9AA8" stroke-width="3"/><ellipse cx="{x + 48}" cy="{y - 8}" rx="4" ry="6" fill="#8A9AA8"/>')


def _b8():
    p = "fb8-"
    defs = (_lin(p+"wall", [(0, "#F7E4C4", None), (1, "#EBC998", None)])
            + _lin(p+"counter", [(0, "#8E6A48", None), (1, "#5A3F2A", None)])
            + _lin(p+"floor", [(0, "#B99A72", None), (1, "#5E4A32", None)])
            + _rad(p+"win", [(0, "#F9C87A", None), (1, "#E88A5A", None)])
            + _lin(p+"pot", [(0, "#E4573D", None), (1, "#A83A24", None)]))
    ticks = "".join(f'<rect x="1078" y="66" width="3" height="{9 if k % 3 == 0 else 5}" fill="#3A2C24" transform="rotate({k*30} 1080 110)"/>' for k in range(12))
    rack = "".join(f'<path d="M{x} 250 v-50" stroke="#8A9AA8" stroke-width="3"/>' for x in range(790, 950, 20))
    dishes = "".join(f'<ellipse cx="{x}" cy="{y}" rx="9" ry="34" fill="#F6F6F2" stroke="#DADAD2" stroke-width="2"/>' for x, y in [(806, 216), (836, 216), (866, 216), (896, 216)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="60" y="30" width="230" height="150" rx="6" fill="url(#{p}win)"/><path d="M60 30 h230 v150 h-230z" fill="none" stroke="#FFFFFF" stroke-width="8"/><path d="M175 30 v150 M60 105 h230" stroke="#FFFFFF" stroke-width="5"/><circle cx="220" cy="80" r="22" fill="#FFE27A"/>
<path d="M70 178 q50 -40 100 -20 q50 -30 110 -6 v26 h-210z" fill="#5A6A3A" opacity=".8"/>
<g><circle cx="1080" cy="110" r="52" fill="#3A2C24"/><circle cx="1080" cy="110" r="46" fill="#FFF8E8"/>{ticks}<path d="M1080 110 v-28" stroke="#3A2C24" stroke-width="4" stroke-linecap="round"/><path d="M1080 110 l-22 14" stroke="#3A2C24" stroke-width="3" stroke-linecap="round"/><circle cx="1080" cy="110" r="3" fill="#E4573D"/></g>
<path d="M0 250 H1200 V300 H0z" fill="url(#{p}counter)"/><path d="M0 250 h1200 v6 H0z" fill="#B48A5E"/>
<rect x="340" y="176" width="300" height="74" rx="6" fill="#EDECE8"/><rect x="340" y="150" width="300" height="26" rx="4" fill="#DDDCD8"/><g fill="#4A4A4A"><circle cx="370" cy="163" r="7"/><circle cx="400" cy="163" r="7"/><circle cx="580" cy="163" r="7"/><circle cx="610" cy="163" r="7"/></g>
<g fill="none" stroke="#4A4A4A" stroke-width="4"><circle cx="410" cy="220" r="24"/><circle cx="410" cy="220" r="12"/><circle cx="570" cy="220" r="24"/><circle cx="570" cy="220" r="12"/></g>
<g><path d="M360 216 v-44 h100 v44z" fill="url(#{p}pot)"/><path d="M354 172 h112" stroke="#7A2A18" stroke-width="6" stroke-linecap="round"/><path d="M356 172 q54 -14 108 0" fill="#B83A24"/><rect x="404" y="150" width="12" height="10" rx="3" fill="#3A2C24"/><path d="M346 186 h-14 q-5 0 -5 5 q0 5 5 5 h14 M474 186 h14 q5 0 5 5 q0 5 -5 5 h-14" stroke="#7A2A18" stroke-width="5" fill="none"/></g>
{_steam(410, 150, 1.0, "#FFFFFF", ".7")}
<g><path d="M530 232 v-30 h90 v30z" fill="#6B7A8A"/><path d="M526 202 h98" stroke="#2F3A48" stroke-width="5" stroke-linecap="round"/><path d="M620 210 h40 q6 0 6 6 q0 6 -6 6 h-40" fill="#2F3A48"/></g>
<g><circle cx="700" cy="220" r="26" fill="#FFFFFF"/><circle cx="700" cy="220" r="26" fill="none" stroke="#E4573D" stroke-width="6"/><path d="M700 220 v-16 M700 220 l12 10" stroke="#3A2C24" stroke-width="3" stroke-linecap="round"/><rect x="694" y="186" width="12" height="8" rx="2" fill="#3A2C24"/></g>
<g><rect x="780" y="196" width="180" height="56" rx="6" fill="#B9C6CE"/>{rack}<rect x="780" y="246" width="180" height="8" rx="3" fill="#8A9AA8"/>{dishes}<rect x="920" y="200" width="28" height="48" rx="3" fill="#7CC3E4" opacity=".8"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}floor)"/>
<g><path d="M960 300 h230 v60 h-230z" fill="#E8C898"/><rect x="960" y="298" width="230" height="8" fill="#B48A5E"/><rect x="968" y="306" width="10" height="70" fill="#8A6238"/><rect x="1172" y="306" width="10" height="70" fill="#8A6238"/></g>
{_plate(1030, 294)}{_plate(1130, 294)}
<g><circle cx="1090" cy="270" r="14" fill="#F4B63A"/><rect x="1086" y="282" width="8" height="18" fill="#F4B63A"/><path d="M1080 296 h20 v6 h-20z" fill="#C98A2A"/></g>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#20140A" opacity=".55"/>
'''
    return _wrap(8, body, defs)


# ───────────────────────── 9  Kitchen Safety and Sanitation: the cooking lab ─────────────────────────
def _b9():
    p = "fb9-"
    defs = (_lin(p+"wall", [(0, "#EAF2F4", None), (1, "#C9DBE0", None)])
            + _lin(p+"steel", [(0, "#DADFE3", None), (1, "#9AA5AD", None)])
            + _lin(p+"fridge", [(0, "#F4F6F7", None), (1, "#C9D0D4", None)])
            + _lin(p+"floor", [(0, "#8A9AA8", None), (1, "#3C4A56", None)])
            + _lin(p+"roast", [(0, "#B86A3A", None), (1, "#7A3A1A", None)]))
    tiles = _tiles(0, 210, 42, "#FFFFFF", ".5")
    boards = "".join(f'<rect x="{x}" y="{y}" width="120" height="14" rx="3" fill="{c}"/><rect x="{x}" y="{y}" width="120" height="4" rx="2" fill="#FFF" opacity=".35"/>'
                     for x, y, c in [(120, 236, "#E4573D"), (120, 220, "#7FBF3A"), (120, 204, "#F4B63A"), (120, 188, "#3B6AB8")])
    gauge = "".join(f'<path d="M{700 + 20 * (k - 4) * .9:.0f} {170 - abs(k - 4) * 2} v6" stroke="#3A2C24" stroke-width="2"/>' for k in range(9))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{tiles}
<g><rect x="920" y="20" width="200" height="230" rx="6" fill="url(#{p}fridge)"/><rect x="920" y="20" width="200" height="230" rx="6" fill="none" stroke="#9AA5AD" stroke-width="4"/><path d="M920 110 h200" stroke="#9AA5AD" stroke-width="4"/>
<rect x="1096" y="50" width="8" height="40" rx="3" fill="#7A8890"/><rect x="1096" y="130" width="8" height="70" rx="3" fill="#7A8890"/>
<rect x="940" y="40" width="40" height="30" rx="4" fill="#E4573D"/><rect x="990" y="40" width="30" height="30" rx="4" fill="#3BB3A6"/><rect x="1030" y="46" width="24" height="24" rx="4" fill="#F4B63A"/><rect x="960" y="76" width="50" height="24" rx="3" fill="#FFF8E8"/></g>
<g><rect x="60" y="40" width="60" height="120" rx="8" fill="#E4573D"/><rect x="82" y="26" width="16" height="18" rx="4" fill="#3A2C24"/><path d="M96 30 h18 v10 h-18z" fill="#3A2C24"/><path d="M114 36 q20 10 14 40" stroke="#3A2C24" stroke-width="5" fill="none"/><rect x="70" y="80" width="40" height="40" rx="4" fill="#FFF8E8" opacity=".9"/><rect x="60" y="140" width="60" height="20" rx="4" fill="#B82A18"/></g>
<path d="M0 250 H1200 V300 H0z" fill="url(#{p}steel)"/><path d="M0 250 h1200 v6 H0z" fill="#F4F6F7"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}floor)"/>
{boards}<rect x="256" y="188" width="10" height="62" fill="#B98A58"/>
<g><rect x="300" y="170" width="220" height="80" rx="8" fill="#EDECE8"/><g fill="none" stroke="#4A4A4A" stroke-width="4"><circle cx="360" cy="216" r="24"/><circle cx="360" cy="216" r="12"/><circle cx="460" cy="216" r="24"/><circle cx="460" cy="216" r="12"/></g>
<path d="M410 212 v-34 h100 v34z" fill="#6B7A8A"/><path d="M404 178 h112" stroke="#2F3A48" stroke-width="5" stroke-linecap="round"/><path d="M408 178 q52 -26 104 0" fill="#3A4A5A"/><rect x="454" y="154" width="12" height="10" rx="3" fill="#2F3A48"/><path d="M510 186 h40 q6 0 6 6 q0 6 -6 6 h-40" fill="#2F3A48"/></g>
<g><rect x="600" y="226" width="200" height="24" rx="8" fill="#9AA5AD"/><path d="M620 226 q10 -60 80 -60 q70 0 80 60z" fill="url(#{p}roast)"/><path d="M640 220 q10 -40 60 -40" stroke="#E4A33A" stroke-width="3" fill="none" opacity=".6"/>
<path d="M700 190 l0 -60" stroke="#B9C6CE" stroke-width="4"/><circle cx="700" cy="128" r="30" fill="#FFFFFF" stroke="#3A2C24" stroke-width="4"/><path d="M700 128 l14 -20" stroke="#E4573D" stroke-width="3" stroke-linecap="round"/><circle cx="700" cy="128" r="3" fill="#3A2C24"/>
{"".join(f'<path d="M{700 + dx} {128 + dy} l{dx // 6} {dy // 6}" stroke="#3A2C24" stroke-width="2"/>' for dx, dy in [(-24, 0), (-17, -17), (0, -24), (17, -17), (24, 0)])}</g>
<g><rect x="820" y="160" width="90" height="90" rx="6" fill="#5AA0E0" opacity=".85"/><rect x="820" y="160" width="90" height="10" fill="#3B6AB8"/><path d="M830 190 h70 M830 210 h70 M830 230 h50" stroke="#FFFFFF" stroke-width="4" opacity=".7"/></g>
<rect x="546" y="226" width="52" height="20" rx="6" fill="#7BC8E6"/><rect x="536" y="242" width="72" height="12" rx="4" fill="#5AA6C4"/>
<g fill="#FFFFFF" opacity=".9"><circle cx="530" cy="236" r="4"/><circle cx="586" cy="224" r="3"/><circle cx="560" cy="212" r="3"/></g>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#141C24" opacity=".5"/>
'''
    return _wrap(9, body, defs)


# ───────────────────────── 10  Knife Skills: the cutting board ─────────────────────────
def _dice(x0, y0, n, c, c2, size=10):
    out = []
    for k in range(n):
        x = x0 + (k * 37) % 70 + (k % 3) * 4
        y = y0 + (k * 23) % 30
        out.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="2" fill="{c}"/><rect x="{x}" y="{y}" width="{size}" height="3" fill="{c2}"/>')
    return "".join(out)


def _b10():
    p = "fb10-"
    defs = (_lin(p+"wall", [(0, "#F1E7D4", None), (1, "#DFCBA6", None)])
            + _lin(p+"board", [(0, "#D9AE78", None), (1, "#B48A58", None)])
            + _lin(p+"counter", [(0, "#EDE5D4", None), (1, "#BDB19A", None)])
            + _lin(p+"blade", [(0, "#F4F6F7", None), (1, "#9AA5AD", None)])
            + _lin(p+"floor", [(0, "#A88A62", None), (1, "#5A4630", None)]))
    grain = "".join(f'<path d="M340 {y} q120 4 240 0 t240 0" stroke="#8A5E34" stroke-width="1.5" fill="none" opacity=".3"/>' for y in range(176, 250, 12))
    onion_rings = "".join(f'<path d="M{760 - r} 196 a{r} {r*.9:.0f} 0 0 1 {2*r} 0" fill="none" stroke="#C9A2C0" stroke-width="2" opacity=".8"/>' for r in (10, 18, 26, 34))
    grid = "".join(f'<path d="M{700 + k*10} 172 v60" stroke="#8A6A8A" stroke-width="1.5" opacity=".6"/>' for k in range(7)) + "".join(f'<path d="M698 {178 + k*10} h64" stroke="#8A6A8A" stroke-width="1.5" opacity=".6"/>' for k in range(6))
    basil = "".join(f'<path d="M{x} 210 q-16 -30 4 -50 q22 16 8 50z" fill="{c}" transform="rotate({rot} {x} 210)"/><path d="M{x + 2} 208 q-4 -24 4 -40" stroke="#2E5A24" stroke-width="1.5" fill="none" transform="rotate({rot} {x} 210)"/>'
                    for x, c, rot in [(1010, "#4A8A3C", -30), (1036, "#5A9A48", -8), (1062, "#3E7A34", 14), (1088, "#4A8A3C", 36)])
    garlic = "".join(f'<path d="M{x} {y} q-10 -18 0 -30 q12 -6 18 4 q8 14 -2 26z" fill="#F4EBD8"/><path d="M{x + 6} {y - 26} q4 -6 8 -10" stroke="#C9B48A" stroke-width="2" fill="none"/>' for x, y in [(900, 236), (926, 228), (948, 240)])
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
{"".join(f'<rect x="{x}" y="{y}" width="56" height="56" fill="#E4573D" opacity="{.14 if (x//60 + y//60) % 2 else .06}"/>' for y in range(0, 190, 60) for x in range(0, 1200, 60))}
<rect x="0" y="190" width="{W}" height="10" fill="#C9A36A"/>
<path d="M0 250 H1200 V310 H0z" fill="url(#{p}counter)"/><path d="M0 250 h1200 v6 H0z" fill="#FFFFFF" opacity=".8"/>
<path d="M0 310 H1200 V420 H0z" fill="url(#{p}floor)"/>
<path d="M300 258 h620 v10 h-620z" fill="#7CC3E4" opacity=".8"/><path d="M300 258 q-10 0 -10 6 v4 h10z M920 258 q10 0 10 6 v4 h-10z" fill="#7CC3E4" opacity=".8"/>
<rect x="320" y="166" width="580" height="92" rx="8" fill="url(#{p}board)"/>{grain}<rect x="320" y="166" width="580" height="92" rx="8" fill="none" stroke="#8A5E34" stroke-width="3"/>
<g><path d="M360 184 q-4 30 40 48 h250 q10 -14 0 -40 l-10 -10 h-240z" fill="url(#{p}blade)"/><path d="M400 232 h250 q10 -14 0 -40" fill="none" stroke="#7A8890" stroke-width="2"/><path d="M360 184 q-4 30 40 48" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".7"/>
<path d="M650 182 h20 v50 h-20z" fill="#2F3A48"/><path d="M670 186 h110 q10 0 10 10 v24 q0 10 -10 10 h-110z" fill="#3A2C24"/><g fill="#B9C6CE"><circle cx="700" cy="208" r="3"/><circle cx="740" cy="208" r="3"/><circle cx="772" cy="208" r="3"/></g></g>
<g transform="translate(60 0)"><circle cx="760" cy="196" r="40" fill="#E8D8E8"/><path d="M720 196 a40 36 0 0 1 80 0z" fill="#EFE6EE"/>{onion_rings}<path d="M760 156 q-4 -12 4 -20 q6 8 2 20z" fill="#C9A2C0"/><path d="M700 172 h64 v60 h-64z" fill="#EFE6EE"/>{grid}</g>
{_dice(560, 236, 8, "#EFE6EE", "#C9A2C0", 9)}
<g><ellipse cx="220" cy="236" rx="60" ry="18" fill="#F6F6F2"/><ellipse cx="220" cy="232" rx="52" ry="12" fill="#E4573D"/>{_dice(180, 214, 9, "#E43B1F", "#B82A18", 9)}<ellipse cx="220" cy="236" rx="60" ry="18" fill="none" stroke="#DADAD2" stroke-width="3"/></g>
<g><ellipse cx="1080" cy="234" rx="58" ry="18" fill="#F6F6F2"/>{"".join(f'<rect x="{1036 + k*12}" y="{218 + (k % 2) * 3}" width="6" height="22" rx="2" fill="#F4A22E"/>' for k in range(8))}<ellipse cx="1080" cy="234" rx="58" ry="18" fill="none" stroke="#DADAD2" stroke-width="3"/></g>
{basil}{garlic}
<g><path d="M960 236 h60 l-8 18 h-44z" fill="#F6F6F2"/><path d="M968 236 v-16 q0 -4 4 -4 h36 q4 0 4 4 v16" fill="#F6F6F2"/>{"".join(f'<path d="M{972 + k*10} 220 q4 -10 8 0" fill="#4A8A3C"/>' for k in range(4))}</g>
<g><rect x="150" y="60" width="200" height="110" rx="6" fill="#9ED2EA"/><path d="M150 60 h200 v110 h-200z" fill="none" stroke="#FFFFFF" stroke-width="8"/><path d="M250 60 v110 M150 115 h200" stroke="#FFFFFF" stroke-width="5"/></g>
<g><rect x="960" y="40" width="10" height="100" fill="#3A2C24"/>{"".join(f'<path d="M{x} 46 v76 q0 6 -6 6 q-6 0 -6 -6 v-76z" fill="{c}"/>' for x, c in [(990, "#C0C0C0"), (1020, "#C0C0C0"), (1050, "#C0C0C0"), (1080, "#C0C0C0")])}<path d="M960 40 h130 v6 h-130z" fill="#8A6238"/></g>
<path d="M0 372 Q300 366 600 372 T1200 368 V420 H0z" fill="#2A1E10" opacity=".5"/>
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
