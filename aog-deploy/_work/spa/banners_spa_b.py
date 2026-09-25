"""Unit banners for the Spanish course, units 11-20 (6-8, 9-10, 11-12).

Ten drawn, layered scenes from the Spanish-speaking world as inline SVG.
Stdlib only.

    from banners_spa_b import BANNERS, CREDITS, banner
    banner(13)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"spb{n}-" so all banners can sit on one contents page.
No text, no images, no external references, no feTurbulence.
The lower ~45% of every scene is kept calm for the unit title overlay.
"""

W, H = 1200, 420

CREDITS = {
    11: "Drawn scene: a sunny classroom with a chalkboard of doodles, wooden desks, a globe, a backpack and an open window onto green hills",
    12: "Drawn scene: a town plaza under a flowering jacaranda with a bandstand, a bench, a cat asleep in the sun and a rain cloud drifting away",
    13: "Drawn scene: a morning market with striped awnings, crates of mangoes, limes and chiles, hanging baskets and the sun rising behind the stalls",
    14: "Drawn scene: a family kitchen table with a paella pan, a bowl of oranges, a jug of flowers and a guitar leaning by the window",
    15: "Drawn scene: a beach at the end of the day with a sandcastle, footprints leading to the waves, a beached rowboat and a sun sinking into the sea",
    16: "Drawn scene: a grandmother's tiled courtyard at dusk with a stone fountain, potted geraniums, a hammock and warm lamplight in an arched doorway",
    17: "Drawn scene: a bedroom at sunrise with an alarm clock ringing, a round mirror, a towel on a hook, a toothbrush cup and slippers by the bed",
    18: "Drawn scene: a night plaza with a wishing fountain, coins glinting in the water, papel picado strung overhead, candles and a shooting star",
    19: "Drawn scene: a panorama from snowy Andes peaks with a llama, across a white mission church and adobe houses, to a Caribbean palm beach",
    20: "Drawn scene: a school stage with red curtains, a spotlight on an empty podium, an easel with a poster board and rows of seats in shadow",
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


# ───────────────────────── 11  Classroom ─────────────────────────
def _b11():
    p = "spb11-"
    defs = (_lin(p+"wall", [(0, "#F3E3C3", None), (1, "#E6CFA2", None)])
            + _lin(p+"sky", [(0, "#8CC8EE", None), (1, "#DDF0F8", None)])
            + _lin(p+"floor", [(0, "#A8743F", None), (1, "#5A3A1E", None)])
            + _lin(p+"board", [(0, "#2F5A44", None), (1, "#24473A", None)]))
    desks = "".join(
        f'<g><rect x="{x}" y="262" width="150" height="14" rx="3" fill="#B07A44"/>'
        f'<path d="M{x+10} 276 v70 M{x+140} 276 v70" stroke="#6E4A28" stroke-width="7"/>'
        f'<rect x="{x+30}" y="248" width="44" height="14" fill="#F4F0E4"/><path d="M{x+52} 248 v14" stroke="#9A8C70" stroke-width="1.5"/>'
        f'<rect x="{x+90}" y="254" width="36" height="5" rx="2" fill="#F2C438" transform="rotate(-12 {x+108} 256)"/></g>'
        for x in (80, 330, 580))
    body = f'''
<rect width="1200" height="420" fill="url(#{p}wall)"/>
<rect x="60" y="40" width="560" height="190" rx="6" fill="#7A5230"/><rect x="72" y="52" width="536" height="166" fill="url(#{p}board)"/>
<g stroke="#EDEBDF" stroke-width="3" fill="none" opacity=".85" stroke-linecap="round"><circle cx="160" cy="120" r="34"/><path d="M160 86 v68 M126 120 h68"/><path d="M250 170 l40 -80 l40 80z"/><path d="M380 100 q30 -30 60 0 t60 0"/><path d="M390 160 h120 M390 180 h80"/><path d="M540 90 l14 14 l24 -30"/></g>
<rect x="70" y="222" width="540" height="8" fill="#8A6036"/><g fill="#F7F2E6"><rect x="120" y="217" width="22" height="6" rx="2"/><rect x="170" y="217" width="16" height="6" rx="2"/></g>
<rect x="760" y="50" width="330" height="200" rx="4" fill="#F7EEDB"/><rect x="774" y="64" width="302" height="172" fill="url(#{p}sky)"/>
<path d="M774 190 Q840 150 920 170 Q1000 140 1076 168 V236 H774z" fill="#7FB35A"/><path d="M774 214 Q880 190 960 206 Q1030 196 1076 210 V236 H774z" fill="#5A8E3E"/>
<circle cx="1020" cy="104" r="22" fill="#FFE08A"/><g fill="#fff" opacity=".9"><ellipse cx="850" cy="100" rx="36" ry="12"/><ellipse cx="874" cy="92" rx="22" ry="12"/></g>
<path d="M925 64 v172 M774 150 h302" stroke="#F7EEDB" stroke-width="8"/>
<g transform="translate(700 150)"><path d="M0 100 v-16 M-24 116 h48" stroke="#6E4A28" stroke-width="6"/><circle cx="0" cy="46" r="40" fill="#4A8FC8"/><path d="M-26 30 q18 -14 30 4 q10 20 -4 30 q-20 8 -22 -12z M14 20 q14 4 16 18 q-10 2 -16 -6z" fill="#8BC06A"/><path d="M-44 46 a44 44 0 0 0 88 0" stroke="#B08A3E" stroke-width="4" fill="none"/></g>
<rect x="0" y="300" width="1200" height="120" fill="url(#{p}floor)"/>
{desks}
<g transform="translate(900 250)"><path d="M0 20 q0 -30 40 -30 q40 0 40 30 v76 h-80z" fill="#D2553A"/><rect x="12" y="44" width="56" height="32" rx="6" fill="#B04028"/><path d="M20 -8 q20 -26 40 0" stroke="#8A3020" stroke-width="6" fill="none"/></g>
<rect x="0" y="380" width="1200" height="40" fill="#2A1A0C" opacity=".5"/>
'''
    return _wrap(11, body, defs)


# ───────────────────────── 12  Plaza, jacaranda ─────────────────────────
def _b12():
    p = "spb12-"
    defs = (_lin(p+"sky", [(0, "#7FB6E0", None), (1, "#E4F1F6", None)])
            + _lin(p+"ground", [(0, "#D9C29A", None), (1, "#8C7250", None)]))
    blooms = "".join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x, y, r in
                     [(250, 80, 50), (320, 60, 56), (390, 90, 48), (200, 130, 40), (300, 120, 50), (430, 140, 36), (360, 150, 40), (240, 170, 30)])
    body = f'''
<rect width="1200" height="420" fill="url(#{p}sky)"/>
<g fill="#6E7A8C" opacity=".8"><ellipse cx="1010" cy="70" rx="80" ry="26"/><ellipse cx="1060" cy="56" rx="50" ry="26"/></g>
<g stroke="#7E8FA8" stroke-width="2" opacity=".6"><path d="M990 100 l-8 22 M1020 104 l-8 22 M1050 100 l-8 22"/></g>
<circle cx="1120" cy="170" r="28" fill="#FFE39A"/>
<path d="M0 230 H1200 V420 H0z" fill="url(#{p}ground)"/>
<g transform="translate(640 110)"><path d="M-110 30 L0 -30 L110 30z" fill="#C0503A"/><rect x="-100" y="30" width="200" height="10" fill="#8A3A28"/><path d="M-90 40 v90 M-30 40 v90 M30 40 v90 M90 40 v90" stroke="#F3EEE0" stroke-width="6"/><path d="M-90 100 h180" stroke="#F3EEE0" stroke-width="3"/><rect x="-116" y="130" width="232" height="16" fill="#E8DCC0"/></g>
<path d="M310 300 q-10 -80 -4 -140 M306 200 q-40 -20 -70 -50 M308 180 q40 -20 70 -40" stroke="#6A4A30" stroke-width="16" fill="none" stroke-linecap="round"/>
<g fill="#9C7AD0" opacity=".95">{blooms}</g><g fill="#B99AE6" opacity=".7"><circle cx="280" cy="70" r="20"/><circle cx="380" cy="80" r="18"/><circle cx="330" cy="130" r="16"/></g>
<g fill="#9C7AD0" opacity=".6"><circle cx="200" cy="300" r="3"/><circle cx="360" cy="308" r="3"/><circle cx="420" cy="296" r="2.5"/><circle cx="260" cy="316" r="2.5"/></g>
<g transform="translate(840 230)"><rect x="0" y="0" width="170" height="12" rx="3" fill="#2E5A3E"/><rect x="0" y="-36" width="170" height="10" rx="3" fill="#2E5A3E"/><rect x="0" y="-20" width="170" height="10" rx="3" fill="#2E5A3E"/><path d="M12 12 v34 M158 12 v34" stroke="#1E3A28" stroke-width="8"/>
<path d="M100 -6 q-6 -20 16 -22 q8 -10 14 0 q18 2 12 22z" fill="#E08A3A"/><path d="M116 -28 l4 -8 l4 8 M126 -28 l4 -8 l4 8" fill="#E08A3A"/><path d="M142 -6 q16 -2 14 -14" stroke="#E08A3A" stroke-width="5" fill="none"/></g>
<rect x="0" y="360" width="1200" height="60" fill="#3A2A18" opacity=".45"/>
'''
    return _wrap(12, body, defs)


# ───────────────────────── 13  Morning market ─────────────────────────
def _b13():
    p = "spb13-"
    defs = (_lin(p+"sky", [(0, "#F7C58A", None), (1, "#FCE8C4", None)])
            + _rad(p+"sun", [(0, "#FFF4C8", 1), (.4, "#FFD27A", .8), (1, "#FFD27A", 0)])
            + _lin(p+"ground", [(0, "#B08A5E", None), (1, "#4E3620", None)]))

    def stall(x, c1, c2, fruit):
        stripes = "".join(f'<path d="M{x+i*30} 110 h30 l-4 50 h-22z" fill="{c1 if i % 2 else c2}"/>' for i in range(8))
        crates = "".join(
            f'<rect x="{x+10+i*78}" y="236" width="68" height="40" fill="#A0703E"/><path d="M{x+10+i*78} 256 h68" stroke="#7A5028" stroke-width="2"/>'
            + "".join(f'<circle cx="{x+22+i*78+j*14}" cy="{232 - (j % 2) * 4}" r="8" fill="{fruit[i % len(fruit)]}"/>' for j in range(4))
            for i in range(3))
        return (f'<path d="M{x+6} 160 v120 M{x+234} 160 v120" stroke="#5A3A20" stroke-width="7"/>{stripes}'
                f'<path d="M{x} 160 q20 12 40 0 q20 12 40 0 q20 12 40 0 q20 12 40 0 q20 12 40 0 q20 12 40 0" fill="{c1}"/>{crates}')
    body = f'''
<rect width="1200" height="420" fill="url(#{p}sky)"/>
<circle cx="600" cy="120" r="120" fill="url(#{p}sun)"/><circle cx="600" cy="120" r="36" fill="#FFE39A"/>
<path d="M0 200 Q200 170 420 190 Q700 160 900 186 Q1060 176 1200 190 V300 H0z" fill="#D9A56E" opacity=".6"/>
<path d="M0 280 H1200 V420 H0z" fill="url(#{p}ground)"/>
{stall(40, "#D8452E", "#F6ECD8", ["#F2A33A", "#6FAE3A", "#C8302A"])}
{stall(470, "#2E7EA8", "#F6ECD8", ["#F4C23A", "#E0782E", "#7AB84A"])}
{stall(900, "#3E9A5A", "#F6ECD8", ["#C8302A", "#F2A33A", "#8A4A9A"])}
<g stroke="#5A3A20" stroke-width="2" fill="#C89A58"><path d="M380 110 v30"/><path d="M362 140 h36 l-6 20 h-24z"/><path d="M820 110 v26"/><path d="M804 136 h32 l-6 18 h-20z"/></g>
<path d="M0 360 Q300 350 600 358 T1200 354 V420 H0z" fill="#2A1A0C" opacity=".5"/>
'''
    return _wrap(13, body, defs)


# ───────────────────────── 14  Kitchen table ─────────────────────────
def _b14():
    p = "spb14-"
    defs = (_lin(p+"wall", [(0, "#F0D7A8", None), (1, "#E2B97A", None)])
            + _lin(p+"table", [(0, "#9A5E30", None), (1, "#4A2A12", None)])
            + _rad(p+"rice", [(0, "#F7D160", None), (1, "#E3A33A", None)]))
    tiles = "".join(f'<rect x="{x}" y="200" width="40" height="40" fill="{"#2E6EA8" if (x//40) % 2 else "#F4F0E4"}"/>' for x in range(0, 1200, 40))
    body = f'''
<rect width="1200" height="420" fill="url(#{p}wall)"/>{tiles}
<rect x="820" y="30" width="240" height="160" fill="#F6EEDB"/><rect x="832" y="42" width="216" height="136" fill="#9ED0EE"/><path d="M832 150 Q900 120 960 140 Q1010 120 1048 136 V178 H832z" fill="#8AB85A"/><path d="M940 42 v136" stroke="#F6EEDB" stroke-width="8"/>
<g fill="#3E8A3A"><path d="M60 60 q30 30 0 60 q-30 -30 0 -60z"/><path d="M100 50 q30 30 0 60 q-30 -30 0 -60z"/></g><path d="M40 40 h110" stroke="#6A4A2A" stroke-width="4"/>
<path d="M0 250 H1200 V420 H0z" fill="url(#{p}table)"/>
<g transform="translate(470 250)"><ellipse cx="0" cy="0" rx="150" ry="34" fill="#2A2A2A"/><ellipse cx="0" cy="-4" rx="136" ry="28" fill="url(#{p}rice)"/><path d="M-150 0 h-40 M150 0 h40" stroke="#2A2A2A" stroke-width="10" stroke-linecap="round"/>
<g fill="#D9482E"><ellipse cx="-60" cy="-8" rx="14" ry="6"/><ellipse cx="40" cy="-14" rx="14" ry="6"/><ellipse cx="80" cy="4" rx="12" ry="5"/></g><g fill="#3A2A4A"><ellipse cx="-20" cy="6" rx="12" ry="6"/><ellipse cx="0" cy="-16" rx="12" ry="6"/></g><g fill="#6AAE3A"><circle cx="-90" cy="4" r="4"/><circle cx="20" cy="10" r="4"/><circle cx="100" cy="-10" r="4"/><circle cx="-40" cy="-18" r="4"/></g><g fill="#F6E48A"><path d="M60 -20 l24 8 l-24 8z"/><path d="M-110 -6 l-20 6 l20 6z"/></g></g>
<g transform="translate(200 240)"><path d="M-70 0 q0 44 70 44 q70 0 70 -44z" fill="#E8DCC0"/><g fill="#F08A24"><circle cx="-36" cy="-8" r="20"/><circle cx="0" cy="-16" r="22"/><circle cx="36" cy="-8" r="20"/></g><path d="M0 -38 q10 -6 14 -2 q-6 6 -14 2" fill="#3E8A3A"/></g>
<g transform="translate(730 240)"><path d="M-24 0 q-10 -40 6 -60 h36 q16 20 6 60z" fill="#3E7AB0"/><g fill="#F4F0E4"><circle cx="-20" cy="-78" r="10"/><circle cx="4" cy="-92" r="11"/><circle cx="24" cy="-76" r="10"/></g><g fill="#E0503A"><circle cx="-6" cy="-100" r="8"/><circle cx="18" cy="-100" r="8"/></g><path d="M0 -60 v-26" stroke="#3E8A3A" stroke-width="3"/></g>
<g transform="translate(1020 280) rotate(-18)"><ellipse cx="0" cy="0" rx="46" ry="54" fill="#C07A3A"/><ellipse cx="0" cy="-66" rx="34" ry="40" fill="#C07A3A"/><circle cx="0" cy="-36" r="14" fill="#2A1A0C"/><rect x="-7" y="-240" width="14" height="170" fill="#5A3A1E"/><rect x="-12" y="-270" width="24" height="34" rx="4" fill="#3A2412"/><path d="M-3 -236 v230 M3 -236 v230" stroke="#EEE" stroke-width=".8"/></g>
<path d="M0 380 H1200 V420 H0z" fill="#1A0E06" opacity=".5"/>
'''
    return _wrap(14, body, defs)


# ───────────────────────── 15  Beach at day's end ─────────────────────────
def _b15():
    p = "spb15-"
    defs = (_lin(p+"sky", [(0, "#5A4A8A", None), (.5, "#E07A5A", None), (1, "#F7C27A", None)])
            + _lin(p+"sea", [(0, "#3E7AA0", None), (1, "#1E4A6A", None)])
            + _lin(p+"sand", [(0, "#EFCF98", None), (1, "#A57E4E", None)]))
    prints = "".join(f'<ellipse cx="{300+i*55+(i%2)*8}" cy="{350 - i*9 + (i%2)*10}" rx="6" ry="10" transform="rotate(-60 {300+i*55+(i%2)*8} {350 - i*9 + (i%2)*10})"/>' for i in range(9))
    body = f'''
<rect width="1200" height="420" fill="url(#{p}sky)"/>
<circle cx="820" cy="206" r="54" fill="#FFD37A"/>
<rect x="0" y="206" width="1200" height="100" fill="url(#{p}sea)"/>
<g fill="#FFD37A" opacity=".7"><rect x="770" y="214" width="100" height="4" rx="2"/><rect x="790" y="226" width="60" height="4" rx="2"/><rect x="800" y="240" width="40" height="3" rx="2"/></g>
<path d="M0 280 Q200 270 400 284 Q700 266 1200 276 V306 H0z" fill="#F4F0E4" opacity=".55"/>
<path d="M0 290 Q300 278 600 290 T1200 286 V420 H0z" fill="url(#{p}sand)"/>
<g fill="#8A6A40" opacity=".55">{prints}</g>
<g transform="translate(180 300)"><path d="M-70 20 v-40 h140 v40z" fill="#D8B070"/><path d="M-50 -20 v-40 h100 v40z" fill="#DDB878"/><path d="M-16 -60 v-36 h32 v36z" fill="#E2C080"/><g fill="#D8B070"><path d="M-70 -20 v-10 h14 v10 M-40 -20 v-10 h14 v10 M40 -20 v-10 h14 v10 M56 -20 v-10 h14 v10"/></g><path d="M0 -96 v-30" stroke="#6A4A2A" stroke-width="2"/><path d="M0 -126 l22 7 l-22 7z" fill="#E0503A"/><path d="M-10 20 v-18 a10 10 0 0 1 20 0 v18z" fill="#8A6A40"/></g>
<g transform="translate(1000 300) rotate(-6)"><path d="M-90 -10 q90 40 180 0 l-16 26 q-74 22 -148 0z" fill="#2E6E8E"/><path d="M-90 -10 q90 40 180 0" stroke="#F4F0E4" stroke-width="4" fill="none"/><path d="M-40 -2 l120 -40" stroke="#6A4A2A" stroke-width="5"/></g>
<g stroke="#2A1A3A" stroke-width="2" fill="none"><path d="M500 110 q8 -8 16 0 q8 -8 16 0"/><path d="M560 90 q6 -6 12 0 q6 -6 12 0"/></g>
<path d="M0 380 Q300 372 600 378 T1200 374 V420 H0z" fill="#2A1A0C" opacity=".45"/>
'''
    return _wrap(15, body, defs)


# ───────────────────────── 16  Grandmother's courtyard ─────────────────────────
def _b16():
    p = "spb16-"
    defs = (_lin(p+"sky", [(0, "#2E2E5E", None), (.7, "#B86A6A", None), (1, "#E8A07A", None)])
            + _lin(p+"wall", [(0, "#E8C49A", None), (1, "#C49A6E", None)])
            + _rad(p+"lamp", [(0, "#FFE7A6", 1), (1, "#FFB050", 0)])
            + _lin(p+"floor", [(0, "#B8603E", None), (1, "#5A2A18", None)]))
    tiles = "".join(f'<path d="M{x} 300 l40 0 l{(x-600)/12+40:.1f} 120 l-40 0z" fill="none" stroke="#7A3A22" stroke-width="2"/>' for x in range(-200, 1400, 40))

    def pot(x, y):
        return (f'<path d="M{x-20} {y} h40 l-6 34 h-28z" fill="#C0603A"/>'
                f'<g fill="#3E7A3A"><circle cx="{x-12}" cy="{y-8}" r="12"/><circle cx="{x+12}" cy="{y-8}" r="12"/><circle cx="{x}" cy="{y-18}" r="12"/></g>'
                f'<g fill="#E0303A"><circle cx="{x-10}" cy="{y-20}" r="6"/><circle cx="{x+8}" cy="{y-28}" r="6"/><circle cx="{x+14}" cy="{y-12}" r="5"/></g>')
    body = f'''
<rect width="1200" height="420" fill="url(#{p}sky)"/>{_stars(16, 30, 80, "#fff", ".7")}
<rect x="0" y="90" width="1200" height="230" fill="url(#{p}wall)"/>
<path d="M0 90 H1200 v14 H0z" fill="#9A4A2E"/><g fill="#B85A38">{"".join(f'<path d="M{x} 90 q12 -14 24 0z"/>' for x in range(0, 1200, 24))}</g>
<g transform="translate(250 0)"><circle cx="0" cy="210" r="110" fill="url(#{p}lamp)"/><path d="M-50 300 v-120 a50 50 0 0 1 100 0 v120z" fill="#FFD68A"/><path d="M-50 300 v-120 a50 50 0 0 1 100 0 v120" fill="none" stroke="#7A4A2A" stroke-width="6"/><path d="M0 130 v-12" stroke="#3A2A1A" stroke-width="2"/></g>
<rect x="420" y="150" width="60" height="70" fill="#5A3A2A"/><path d="M420 185 h60 M450 150 v70" stroke="#E8C49A" stroke-width="3"/>
<g transform="translate(640 260)"><ellipse cx="0" cy="40" rx="100" ry="20" fill="#9A8A7A"/><rect x="-100" y="10" width="200" height="30" fill="#B0A090"/><ellipse cx="0" cy="10" rx="100" ry="18" fill="#6AA0B8"/><rect x="-10" y="-60" width="20" height="70" fill="#B0A090"/><ellipse cx="0" cy="-60" rx="40" ry="10" fill="#B0A090"/><path d="M-30 -58 q-20 20 -30 60 M30 -58 q20 20 30 60" stroke="#A6D0E0" stroke-width="3" fill="none" opacity=".8"/></g>
<path d="M880 140 v170 M1140 140 v170" stroke="#6A4A2A" stroke-width="10"/><path d="M880 160 q130 120 260 0" stroke="#D8452E" stroke-width="14" fill="none"/><path d="M880 160 q130 112 260 0" stroke="#F2C438" stroke-width="4" fill="none"/><path d="M880 166 q130 120 260 0" stroke="#2E7EA8" stroke-width="4" fill="none"/>
{pot(120, 280)}{pot(390, 280)}{pot(800, 280)}{pot(460, 150)}
<path d="M0 314 H1200 V420 H0z" fill="url(#{p}floor)"/><g clip-path="none">{tiles}</g>
<rect x="0" y="370" width="1200" height="50" fill="#1A0A04" opacity=".5"/>
'''
    return _wrap(16, body, defs)


# ───────────────────────── 17  Bedroom at sunrise ─────────────────────────
def _b17():
    p = "spb17-"
    defs = (_lin(p+"wall", [(0, "#BFD8E8", None), (1, "#9EC0D6", None)])
            + _lin(p+"sky", [(0, "#F7B87A", None), (1, "#FCE2B0", None)])
            + _lin(p+"floor", [(0, "#8A6040", None), (1, "#3A2414", None)])
            + _rad(p+"mirror", [(0, "#EAF4FA", None), (1, "#A8C8DC", None)]))
    body = f'''
<rect width="1200" height="420" fill="url(#{p}wall)"/>
<rect x="80" y="40" width="260" height="200" fill="#F4EEE0"/><rect x="94" y="54" width="232" height="172" fill="url(#{p}sky)"/><circle cx="210" cy="220" r="44" fill="#FFD66A"/><path d="M94 200 h232 v26 H94z" fill="#6A8A5A"/><path d="M210 54 v172" stroke="#F4EEE0" stroke-width="8"/>
<path d="M60 36 q60 120 30 210 h-30z M360 36 q-60 120 -30 210 h30z" fill="#E08A6A"/>
<g transform="translate(560 130)"><circle r="70" fill="#C09060"/><circle r="60" fill="url(#{p}mirror)"/><path d="M-30 -30 l20 -12 M-24 -16 l30 -20" stroke="#fff" stroke-width="4" opacity=".8"/></g>
<rect x="470" y="220" width="180" height="16" rx="3" fill="#F4F0E4"/>
<g transform="translate(510 220)"><path d="M-14 0 l4 -30 h20 l4 30z" fill="#2E7EA8"/><path d="M-2 -30 v-30 M6 -30 v-22" stroke="#E0503A" stroke-width="4"/><rect x="-6" y="-66" width="8" height="10" fill="#F4F0E4"/></g>
<path d="M760 60 v14" stroke="#7A5A3A" stroke-width="6"/><path d="M750 74 q10 -8 20 0 q20 60 -6 120 h-8 q-26 -60 -6 -120z" fill="#F2C438"/><path d="M748 150 h44" stroke="#E0A020" stroke-width="3"/>
<rect x="840" y="200" width="360" height="110" rx="10" fill="#E8E0CC"/><rect x="840" y="180" width="90" height="40" rx="14" fill="#F6F2E6"/><path d="M930 206 h270 v40 h-270z" fill="#D8452E"/><path d="M840 300 v20 M1190 300 v20" stroke="#5A3A20" stroke-width="10"/>
<g transform="translate(780 240)"><rect x="-30" y="0" width="60" height="70" fill="#8A5A30"/><circle cx="0" cy="-26" r="26" fill="#F2C438"/><circle cx="0" cy="-26" r="20" fill="#FBF6E6"/><path d="M0 -26 v-14 M0 -26 l10 6" stroke="#2A1A0C" stroke-width="3" stroke-linecap="round"/><circle cx="-20" cy="-50" r="8" fill="#E0A020"/><circle cx="20" cy="-50" r="8" fill="#E0A020"/><g stroke="#2A1A0C" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M-44 -46 q-8 -8 -4 -18 M44 -46 q8 -8 4 -18 M-52 -30 q-10 -4 -10 -14 M52 -30 q10 -4 10 -14"/></g></g>
<path d="M0 310 H1200 V420 H0z" fill="url(#{p}floor)"/>
<g fill="#E07A8A"><ellipse cx="900" cy="340" rx="34" ry="12"/><ellipse cx="960" cy="346" rx="34" ry="12"/></g>
<rect x="0" y="380" width="1200" height="40" fill="#1A0E06" opacity=".5"/>
'''
    return _wrap(17, body, defs)


# ───────────────────────── 18  Wishing fountain at night ─────────────────────────
def _b18():
    p = "spb18-"
    defs = (_lin(p+"sky", [(0, "#0E1A3A", None), (1, "#2E3A6A", None)])
            + _lin(p+"ground", [(0, "#4A4260", None), (1, "#1A1628", None)])
            + _rad(p+"glow", [(0, "#FFD68A", .9), (1, "#FFB050", 0)]))
    cols = ["#E0503A", "#F2C438", "#3EA8D8", "#E07AB0", "#6ABE5A"]
    def picado(y0, x0, x1, sag, off):
        n = int((x1 - x0) / 44)
        out = []
        for i in range(n):
            x = x0 + i * 44
            t = (i + .5) / n
            y = y0 + sag * 4 * t * (1 - t)
            c = cols[(i + off) % 5]
            out.append(f'<path d="M{x+4:.0f} {y:.0f} h34 v38 l-6 -6 l-5 6 l-6 -6 l-6 6 l-5 -6 l-6 6z" fill="{c}"/><circle cx="{x+21:.0f}" cy="{y+16:.0f}" r="6" fill="#0E1A3A" opacity=".6"/>')
        return f'<path d="M{x0} {y0} Q{(x0+x1)/2} {y0+2*sag} {x1} {y0}" stroke="#DDD" stroke-width="1.5" fill="none"/>' + "".join(out)
    coins = "".join(f'<ellipse cx="{x}" cy="{y}" rx="5" ry="2" fill="#F2C438"/>' for x, y in [(540, 262), (580, 270), (620, 258), (660, 268), (700, 262), (600, 276), (560, 256)])
    candles = "".join(f'<g transform="translate({x} 300)"><circle cy="-30" r="26" fill="url(#{p}glow)"/><rect x="-6" y="-24" width="12" height="28" fill="#F4ECD8"/><path d="M0 -24 q-5 -8 0 -16 q5 8 0 16z" fill="#FFC04A"/></g>' for x in (340, 380, 860, 900))
    body = f'''
<rect width="1200" height="420" fill="url(#{p}sky)"/>{_stars(18, 70, 200)}
<path d="M960 40 l-160 60" stroke="#fff" stroke-width="2" opacity=".6"/><circle cx="960" cy="40" r="4" fill="#fff"/>
<circle cx="150" cy="70" r="28" fill="#F4ECD0"/><circle cx="162" cy="62" r="26" fill="#0E1A3A" opacity=".85"/>
<path d="M0 180 h140 v-50 h60 v50 h120 v-30 l30 -20 l30 20 v30 H1200 V300 H0z" fill="#2A2A4A"/><g fill="#FFD68A" opacity=".8"><rect x="160" y="150" width="14" height="18"/><rect x="60" y="200" width="16" height="20"/><rect x="1000" y="210" width="16" height="20"/><rect x="1100" y="200" width="16" height="20"/></g>
{picado(60, 0, 560, 30, 0)}{picado(60, 640, 1200, 30, 2)}
<path d="M0 290 H1200 V420 H0z" fill="url(#{p}ground)"/>
<g transform="translate(620 0)"><ellipse cx="0" cy="300" rx="190" ry="30" fill="#8A8098"/><rect x="-190" y="250" width="380" height="50" fill="#A098B0"/><ellipse cx="0" cy="250" rx="190" ry="30" fill="#6A8AB0"/><ellipse cx="0" cy="250" rx="170" ry="22" fill="#2E4A7A"/><rect x="-14" y="150" width="28" height="100" fill="#A098B0"/><ellipse cx="0" cy="150" rx="60" ry="14" fill="#A098B0"/><path d="M-50 150 q-40 40 -50 96 M50 150 q40 40 50 96 M0 136 q0 -30 0 -30" stroke="#A6D0F0" stroke-width="3" fill="none" opacity=".8"/></g>
<g transform="translate(-20 0)">{coins}</g>{candles}
<rect x="0" y="370" width="1200" height="50" fill="#0A0814" opacity=".5"/>
'''
    return _wrap(18, body, defs)


# ───────────────────────── 19  Andes to Caribbean ─────────────────────────
def _b19():
    p = "spb19-"
    defs = (_lin(p+"sky", [(0, "#6AA8DA", None), (1, "#D8EEF6", None)], 0, 0, 0, 1)
            + _lin(p+"sea", [(0, "#3EC0C8", None), (1, "#1E8AA8", None)])
            + _lin(p+"land", [(0, "#A8B868", None), (1, "#5A6A34", None)]))
    body = f'''
<rect width="1200" height="420" fill="url(#{p}sky)"/>
<path d="M0 240 L90 90 L150 160 L230 50 L320 170 L380 120 L460 240z" fill="#6A7A9A"/><path d="M90 90 L70 124 L100 116 L120 132 L150 160z M230 50 L200 100 L232 88 L262 110 L276 102z M380 120 L362 146 L392 140 L410 150z" fill="#F4F6FA"/>
<circle cx="980" cy="80" r="34" fill="#FFE08A"/>
<path d="M0 240 Q200 220 400 236 Q600 220 800 240 Q900 236 960 250 V320 H0z" fill="url(#{p}land)"/>
<g transform="translate(250 230)" fill="#EDE2CC"><path d="M-30 0 v-26 q0 -8 10 -10 h36 q8 0 10 -8 v-26 l6 -8 l2 8 l2 -8 l2 10 v20 q2 10 -6 14 q-6 4 -6 10 v24 h-6 v-18 h-30 v18z"/><path d="M-30 0 v-20 M-24 0 v-20" stroke="#EDE2CC" stroke-width="5"/><circle cx="24" cy="-68" r="1.6" fill="#2A1A0C"/></g>
<g transform="translate(600 170)"><rect x="-70" y="20" width="140" height="70" fill="#F7F4EC"/><path d="M-70 20 q70 -30 140 0z" fill="#F7F4EC"/><rect x="-24" y="-40" width="48" height="60" fill="#F7F4EC"/><path d="M-30 -40 a30 30 0 0 1 60 0z" fill="#F7F4EC"/><path d="M0 -70 v-24 M-8 -84 h16" stroke="#8A6A40" stroke-width="3"/><circle cx="0" cy="-16" r="8" fill="#6A5040"/><path d="M-14 90 v-30 a14 14 0 0 1 28 0 v30z" fill="#7A4A2A"/></g>
<g fill="#D89A6A"><rect x="450" y="210" width="70" height="44"/><rect x="690" y="214" width="80" height="40"/></g><g fill="#B8603E"><path d="M444 210 h82 l-8 -12 h-66z M684 214 h92 l-8 -12 h-76z"/></g><g fill="#5A3A20"><rect x="476" y="230" width="16" height="24"/><rect x="720" y="232" width="16" height="22"/></g>
<path d="M880 250 Q1000 240 1200 244 V320 H860z" fill="url(#{p}sea)"/><path d="M820 320 Q880 240 1000 300 Q1100 320 1200 312 V320z" fill="#F2DDA8"/>
<g transform="translate(1060 300)"><path d="M0 0 q-6 -80 20 -150" stroke="#7A5A34" stroke-width="10" fill="none"/><g fill="#3E9A4A"><path d="M20 -150 q-50 -10 -80 30 q40 -20 80 -30z"/><path d="M20 -150 q50 -14 80 24 q-40 -16 -80 -24z"/><path d="M20 -150 q-30 -40 -70 -40 q40 10 70 40z"/><path d="M20 -150 q30 -40 70 -36 q-40 8 -70 36z"/><path d="M20 -150 q0 -40 -10 -60 q20 20 10 60z"/></g><g fill="#6A4A20"><circle cx="16" cy="-142" r="6"/><circle cx="26" cy="-140" r="6"/></g></g>
<path d="M0 320 H1200 V420 H0z" fill="#4A5A2C"/>
<path d="M0 370 H1200 V420 H0z" fill="#1A2010" opacity=".5"/>
'''
    return _wrap(19, body, defs)


# ───────────────────────── 20  School stage ─────────────────────────
def _b20():
    p = "spb20-"
    defs = (_lin(p+"curtain", [(0, "#A01E2A", None), (1, "#5A0E16", None)], 0, 0, 1, 0)
            + _lin(p+"curtainR", [(0, "#5A0E16", None), (1, "#A01E2A", None)], 0, 0, 1, 0)
            + _lin(p+"back", [(0, "#2A1A2E", None), (1, "#3E2A3A", None)])
            + _lin(p+"beam", [(0, "#FFF2C0", .5), (1, "#FFF2C0", .05)])
            + _lin(p+"stage", [(0, "#A8703A", None), (1, "#5A3418", None)]))
    folds = "".join(f'<path d="M{x} 0 v300" stroke="#3E0A10" stroke-width="3" opacity=".5"/>' for x in (40, 90, 140, 190, 1010, 1060, 1110, 1160))
    seats = "".join(f'<path d="M{x} {y} q0 -26 24 -26 q24 0 24 26z" fill="#140C14"/>' for y in (380, 410) for x in range(-10 + (y % 20), 1220, 56))
    body = f'''
<rect width="1200" height="420" fill="url(#{p}back)"/>
<path d="M560 0 L420 290 H780 L640 0z" fill="url(#{p}beam)"/>
<path d="M0 0 H230 Q200 150 240 300 H0z" fill="url(#{p}curtain)"/><path d="M1200 0 H970 Q1000 150 960 300 H1200z" fill="url(#{p}curtainR)"/>{folds}
<path d="M0 0 H1200 V40 Q900 60 600 44 Q300 60 0 40z" fill="#8A1420"/><path d="M0 40 Q300 60 600 44 Q900 60 1200 40" stroke="#E0B040" stroke-width="4" fill="none"/>
<path d="M0 290 H1200 V330 H0z" fill="url(#{p}stage)"/><rect x="0" y="330" width="1200" height="90" fill="#140C14"/>
<ellipse cx="600" cy="292" rx="150" ry="14" fill="#FFF2C0" opacity=".35"/>
<g transform="translate(600 290)"><path d="M-50 0 l10 -120 h80 l10 120z" fill="#7A4A26"/><path d="M-60 -120 h120 l-8 -16 h-104z" fill="#8A5A30"/><path d="M-20 -60 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0" fill="#E0B040" opacity=".8"/><path d="M20 -136 q16 -30 6 -50" stroke="#2A2A2A" stroke-width="3" fill="none"/><ellipse cx="25" cy="-190" rx="6" ry="9" fill="#2A2A2A"/></g>
<g transform="translate(830 290)"><path d="M-50 0 L0 -200 L50 0 M0 -200 v200" stroke="#6A4A2A" stroke-width="7" fill="none"/><rect x="-70" y="-180" width="140" height="110" fill="#F4F0E4"/><g opacity=".85"><circle cx="-36" cy="-140" r="18" fill="#E0503A"/><rect x="-10" y="-156" width="60" height="8" fill="#3E7AB0"/><rect x="-10" y="-140" width="44" height="8" fill="#3E7AB0"/><path d="M-50 -90 l30 -24 l24 12 l40 -30" stroke="#3E9A4A" stroke-width="5" fill="none"/></g></g>
<g transform="translate(380 290)"><rect x="-8" y="-60" width="16" height="60" fill="#3E2A1A"/><path d="M-20 -60 q20 -40 40 0z" fill="#3E7A3A"/></g>
{seats}
'''
    return _wrap(20, body, defs)


_BUILDERS = {11: _b11, 12: _b12, 13: _b13, 14: _b14, 15: _b15, 16: _b16, 17: _b17, 18: _b18, 19: _b19, 20: _b20}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (11..20)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    for n in range(11, 21):
        print(n, len(BANNERS[n].encode("utf-8")), "bytes")
