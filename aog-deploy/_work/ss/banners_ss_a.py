"""Unit banners for the Social Studies course, units 1-12 (K-2, 3-5, 6-8).

Twelve drawn, layered silhouette scenes as inline SVG.  Stdlib only.

    from banners_ss_a import BANNERS, CREDITS, banner
    banner(7)  -> '<svg viewBox="0 0 1200 420" ...>...</svg>'

Each SVG is 1200x420, preserveAspectRatio="xMidYMid slice", role="img",
aria-label = CREDITS[n], focusable="false".  Every id is prefixed
"ssb{n}-" so all the social-studies banners can sit on one contents page.
No text, no images, no filters, no external references.

Page CSS note (same as the Science and U.S. History banners):
    .ss-banner svg { width:100%; height:100%; display:block; }
The page sits the banner over a #0A1E33 band and paints a dark gradient
over the bottom ~45% for the unit title, so the lower part of every scene
is kept calm (table tops, water, ground, street) and the action sits in
the upper 55%.  Palette: navy skies, warm golds and creams.
"""

import math

W, H = 1200, 420

CREDITS = {
    1: "Drawn scene: a family of four generations around a dinner table under a hanging lamp, with a school building and its flag seen through the window",
    2: "Drawn scene: a neighborhood street at dusk with row houses, a streetlamp, a fire truck, a mail carrier and a lemonade stand with a pitcher and cups",
    3: "Drawn scene: a classroom desk with a hand-drawn map, a compass rose and a pencil, a globe on its stand and a chalkboard behind",
    4: "Drawn scene: a waving flag with stars and stripes, a class ballot box with a slip going in, and old sepia photographs spread on a table",
    5: "Drawn scene: an Illinois prairie at sunrise with a winding river, a red barn and silo, and the Chicago skyline far off on the horizon",
    6: "Drawn scene: Cahokia's great earthen mound with a house on top, a wooden palisade, a market of stalls and baskets, and a longhouse",
    7: "Drawn scene: Independence Hall's clock tower and spire, a flatboat drifting down a river, and a quill pen standing in an inkwell beside a document",
    8: "Drawn scene: a village board table with a gavel and seated members, a state capitol dome behind, and a ballot with a marked box",
    9: "Drawn scene: a school store counter with jars of pencils, a large coin, and a map of the United States on the wall with the Midwest marked",
    10: "Drawn scene: a stepped ziggurat, the Nile with palms and a pyramid, and a clay tablet of cuneiform wedges in the foreground",
    11: "Drawn scene: the Parthenon on its hill, a Roman aqueduct of arches, and a camel caravan crossing under a gold sky",
    12: "Drawn scene: a mosque dome and minaret, a medieval castle with towers, a Mongol rider on horseback and a Mayan step pyramid under a crescent moon",
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


def _person(x, y, s, col, hair=None):
    """Seated silhouette: head, shoulders, body; scale s; anchored at chin (x, y)."""
    h = "" if hair is None else f'<path d="M-14 -34 q14 -14 28 0 v6 q-14 -8 -28 0z" fill="{hair}"/>'
    return (f'<g transform="translate({x} {y}) scale({s})" fill="{col}"><circle cx="0" cy="-18" r="14"/>'
            f'<path d="M-30 30 q0 -30 30 -30 q30 0 30 30z"/>{h}</g>')


# ───────────────────────── 1  Me, My Family, My School: dinner table ─────────────────────────
def _b1():
    p = "ssb1-"
    defs = (
        _lin(p+"wall", [(0, "#0F2444", None), (.7, "#1C3A62", None), (1, "#2A4C78", None)])
        + _rad(p+"lamp", [(0, "#FFF2C4", .95), (.4, "#F2C273", .45), (1, "#F2C273", 0)])
        + _lin(p+"sky", [(0, "#0A1E33", None), (.6, "#2D4F80", None), (1, "#F2C273", None)])
        + _lin(p+"table", [(0, "#C9A26A", None), (.1, "#9A7446", None), (1, "#3A2A18", None)])
        + _lin(p+"cloth", [(0, "#F7EBD0", None), (1, "#E4D2AC", None)])
    )
    win_rows = "".join(f'<rect x="{x}" y="{y}" width="14" height="16" fill="#F6D98C" opacity=".85"/>' for x in (880, 906, 932, 958, 984) for y in (128, 154))
    plates = "".join(f'<ellipse cx="{x}" cy="{y}" rx="26" ry="8" fill="#F7EBD0" stroke="#C9A26A" stroke-width="2"/><ellipse cx="{x}" cy="{y}" rx="16" ry="4.5" fill="#E8C98A"/>' for x, y in ((360, 262), (470, 258), (600, 258), (730, 262)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="848" y="60" width="200" height="150" fill="url(#{p}sky)"/>
{_stars(3, 18, 90, "#F7EBD0", ".7", 852, 1044)}
<path d="M860 210 v-70 h34 v-24 l16 -14 l16 14 v24 h60 v70z" fill="#142B4C"/>{win_rows}
<path d="M910 116 v-40" stroke="#F7EBD0" stroke-width="2"/><path d="M911 76 h22 l-6 6 l6 6 h-22z" fill="#E4573D"/>
<circle cx="932" cy="100" r="6" fill="#F6D98C"/><rect x="936" y="148" width="18" height="30" fill="#5A3A1E"/>
<g fill="#2A4C78"><rect x="840" y="52" width="216" height="8"/><rect x="840" y="52" width="8" height="166"/><rect x="1048" y="52" width="8" height="166"/><rect x="840" y="210" width="216" height="10"/><rect x="944" y="60" width="6" height="150"/><rect x="848" y="134" width="200" height="5"/></g>
<path d="M560 0 v70" stroke="#3A2A18" stroke-width="3"/><path d="M500 110 l60 -40 l60 40z" fill="#E4B860"/><path d="M500 110 h120 l6 6 h-132z" fill="#C9A26A"/>
<ellipse cx="560" cy="120" rx="240" ry="150" fill="url(#{p}lamp)"/>
<g fill="#F7EBD0" opacity=".5"><rect x="80" y="70" width="90" height="70" rx="3"/><rect x="190" y="90" width="60" height="50" rx="3"/></g><g fill="#C9A26A"><rect x="90" y="80" width="70" height="50"/><rect x="198" y="98" width="44" height="34"/></g>
<path d="M120 300 v-60 h20 v60z M100 240 h60 v-8 h-60z" fill="#1C3A62"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}table)"/><path d="M0 250 Q600 236 1200 250 V310 H0z" fill="url(#{p}cloth)"/>
{plates}
<path d="M540 240 q-20 -30 0 -60 q20 30 0 60z" fill="#E4573D"/><path d="M536 186 h8 v-6 h-8z" fill="#F6D98C"/><rect x="530" y="240" width="20" height="8" rx="2" fill="#9A7446"/>
<g fill="#F7EBD0"><path d="M660 244 h60 l-4 -34 q-26 -8 -52 0z"/></g><path d="M664 214 q26 -8 52 0" stroke="#C9A26A" stroke-width="2" fill="none"/>
<g fill="#E4B860"><rect x="420" y="228" width="12" height="20" rx="3"/><rect x="640" y="230" width="12" height="18" rx="3"/></g>
{_person(360, 210, 1.05, "#0A1E33", "#3A2A18")}{_person(470, 200, 1.15, "#0A1E33", "#F7EBD0")}{_person(600, 196, 1.2, "#0A1E33", "#F7EBD0")}{_person(730, 212, .8, "#0A1E33", "#3A2A18")}
<g fill="#F7EBD0" opacity=".9"><circle cx="600" cy="150" r="3"/><circle cx="470" cy="154" r="3"/></g>
<path d="M600 208 q40 -20 60 -40" stroke="#0A1E33" stroke-width="6" stroke-linecap="round" fill="none"/>
<path d="M0 372 H1200 V420 H0z" fill="#1E140A" opacity=".5"/>
'''
    return _wrap(1, body, defs)


# ───────────────────────── 2  Our Community: neighborhood street at dusk ─────────────────────────
def _b2():
    p = "ssb2-"
    defs = (
        _lin(p+"sky", [(0, "#0A1E33", None), (.5, "#2D4F80", None), (.85, "#E4B860", None), (1, "#F2C273", None)])
        + _lin(p+"road", [(0, "#3A3E48", None), (1, "#1A1C24", None)])
        + _lin(p+"walk", [(0, "#D6C7A2", None), (1, "#A89670", None)])
        + _rad(p+"lamp", [(0, "#FFF2C4", 1), (.3, "#F6D98C", .5), (1, "#F6D98C", 0)])
    )
    houses = []
    x = 0
    seed = 11
    while x < 1200:
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        w = 110 + seed % 60
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        top = 120 + seed % 50
        col = ("#142B4C", "#1E3A5F", "#0F2444")[seed % 3]
        houses.append(f'<path d="M{x} 250 v-{250-top} l{w//2} -{34+seed%20} l{w//2} {34+seed%20} v{250-top}z" fill="{col}"/>')
        for wx in range(x + 18, x + w - 24, 34):
            houses.append(f'<rect x="{wx}" y="{top+16}" width="16" height="20" fill="#F6D98C" opacity=".8"/>')
        houses.append(f'<rect x="{x+w//2-10}" y="216" width="20" height="34" fill="#F2C273" opacity=".6"/>')
        x += w + 10
    hydrant = '<g fill="#E4573D"><rect x="640" y="262" width="14" height="30" rx="3"/><rect x="636" y="260" width="22" height="6" rx="2"/><circle cx="647" cy="256" r="6"/><rect x="632" y="270" width="30" height="6" rx="3"/></g>'
    cups = "".join(f'<rect x="{x}" y="216" width="10" height="12" fill="#F7EBD0"/>' for x in (1080, 1096, 1112))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(21, 30, 110, "#F7EBD0", ".6")}
<g fill="#2D4F80" opacity=".5"><ellipse cx="300" cy="90" rx="160" ry="8"/><ellipse cx="900" cy="70" rx="180" ry="9"/></g>
<g>{"".join(houses)}</g>
<path d="M0 250 H1200 V292 H0z" fill="url(#{p}walk)"/>
<circle cx="420" cy="120" r="80" fill="url(#{p}lamp)"/><path d="M420 292 v-170" stroke="#1A1C24" stroke-width="6"/><path d="M406 122 h28 l-4 -18 h-20z" fill="#1A1C24"/><circle cx="420" cy="112" r="8" fill="#FFF2C4"/>
<g fill="#C8402F"><path d="M120 292 v-70 h150 q10 0 10 10 v60z"/><path d="M270 232 h60 l20 30 v30 h-80z"/></g><g fill="#F6D98C"><rect x="286" y="240" width="30" height="20"/><rect x="140" y="236" width="40" height="20" opacity=".5"/></g>
<path d="M130 224 h60 v-10 h-60z" fill="#F7EBD0"/><g stroke="#F7EBD0" stroke-width="3" fill="none"><path d="M140 226 v-30 h110 v30"/></g>
<g fill="#1A1C24"><circle cx="160" cy="292" r="14"/><circle cx="310" cy="292" r="14"/></g><g fill="#A89670"><circle cx="160" cy="292" r="6"/><circle cx="310" cy="292" r="6"/></g>
<g fill="#0A1E33"><circle cx="520" cy="196" r="12"/><path d="M508 210 q12 -6 24 0 l6 40 l-10 44 h-8 l-2 -34 l-8 34 h-8 l4 -44z"/><path d="M528 214 l30 12 l-2 8 l-30 -10z"/><path d="M552 228 h18 v22 h-18z"/><path d="M506 190 h28 v6 h-28z"/></g>
{hydrant}
<g fill="#0A1E33"><circle cx="720" cy="192" r="12"/><path d="M708 206 q12 -6 24 0 l4 40 l-8 46 h-8 l-2 -36 l-8 36 h-8 l6 -46z"/><path d="M700 186 q20 -14 40 0 h-40z"/><path d="M700 186 h40 v4 h-40z"/><path d="M698 220 l-20 -6 v10z"/></g>
<g fill="#E4B860"><path d="M1040 292 v-60 h150 v60z"/></g><path d="M1034 234 h162 v-8 h-162z" fill="#F7EBD0"/><path d="M1040 232 v-30 h6 v30z M1184 232 v-30 h6 v30z" fill="#9A7446"/><path d="M1030 202 h170 l-6 -14 h-158z" fill="#E4573D"/><path d="M1034 202 h162 v4 h-162z" fill="#F7EBD0"/>
<g stroke="#F7EBD0" stroke-width="2" fill="none"><path d="M1060 254 v24 M1080 254 v24 M1100 254 v24 M1120 254 v24 M1140 254 v24 M1160 254 v24"/></g>
<path d="M1046 226 h20 v-30 h-20z" fill="#F7EBD0" opacity=".8"/><path d="M1048 210 h16 v14 h-16z" fill="#F2C273"/><path d="M1066 200 q10 4 4 12" stroke="#F7EBD0" stroke-width="2" fill="none"/>
{cups}
<g fill="#0A1E33"><circle cx="1150" cy="180" r="11"/><path d="M1140 192 q10 -6 20 0 l4 34 h-28z"/></g>
<path d="M0 292 H1200 V420 H0z" fill="url(#{p}road)"/><path d="M0 292 h1200 v4 H0z" fill="#5A5E68"/>
<g fill="#F6D98C" opacity=".6"><rect x="40" y="356" width="60" height="6"/><rect x="180" y="356" width="60" height="6"/><rect x="320" y="356" width="60" height="6"/><rect x="460" y="356" width="60" height="6"/><rect x="600" y="356" width="60" height="6"/><rect x="740" y="356" width="60" height="6"/><rect x="880" y="356" width="60" height="6"/><rect x="1020" y="356" width="60" height="6"/><rect x="1160" y="356" width="40" height="6"/></g>
'''
    return _wrap(2, body, defs)


# ───────────────────────── 3  Maps and Places: classroom desk with map and globe ─────────────────────────
def _b3():
    p = "ssb3-"
    defs = (
        _lin(p+"wall", [(0, "#F4E9D2", None), (1, "#E4D2AC", None)])
        + _lin(p+"board", [(0, "#1E3A5F", None), (1, "#142B4C", None)])
        + _lin(p+"desk", [(0, "#C9A26A", None), (.08, "#A87A3A", None), (1, "#4A2C1C", None)])
        + _rad(p+"globe", [(0, "#7FB4E6", 1), (.7, "#3F7FC0", 1), (1, "#1E3A5F", 1)], .38, .35, .7)
        + _lin(p+"paper", [(0, "#FBF3E0", None), (1, "#EDDDB4", None)])
    )
    grid = "".join(f'<path d="M{x} 150 V296"/>' for x in range(240, 620, 44)) + "".join(f'<path d="M180 {y} H660"/>' for y in range(160, 296, 32))
    lat = "".join(f'<ellipse cx="900" cy="150" rx="{r:.0f}" ry="{88*abs(math.cos(math.radians(a))):.0f}" transform="translate(0 {(-88*math.sin(math.radians(a))):.0f})"/>' for a, r in ((0, 88), (30, 76), (-30, 76), (60, 44), (-60, 44)))
    lon = "".join(f'<ellipse cx="900" cy="150" rx="{r}" ry="88"/>' for r in (20, 50, 80))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="60" y="30" width="600" height="120" fill="url(#{p}board)"/><rect x="52" y="22" width="616" height="8" fill="#9A7446"/><rect x="52" y="150" width="616" height="10" fill="#9A7446"/>
<g stroke="#F7EBD0" stroke-width="3" fill="none" opacity=".85"><path d="M100 60 q30 -20 60 0 t60 0 t60 0"/><path d="M100 100 h80 M200 100 h50 M270 100 h110"/><path d="M480 50 l20 60 l20 -60"/><circle cx="580" cy="80" r="24"/><path d="M560 80 h40 M580 56 v48"/></g>
<rect x="700" y="40" width="440" height="110" fill="#E4B860" opacity=".35"/>
<path d="M0 232 H1200 V420 H0z" fill="url(#{p}desk)"/><path d="M0 232 h1200 v6 H0z" fill="#E4B860"/>
<g transform="rotate(-4 420 230)"><rect x="180" y="150" width="480" height="150" rx="4" fill="url(#{p}paper)"/><rect x="180" y="150" width="480" height="150" rx="4" fill="none" stroke="#C9A26A" stroke-width="2"/>
<g stroke="#C9A26A" stroke-width="1" opacity=".5">{grid}</g>
<g fill="#7FB4E6" opacity=".7"><path d="M200 220 q60 -30 120 -10 q40 20 100 0 q40 -14 80 10 v70 H200z"/></g>
<path d="M240 200 q30 -20 50 4" stroke="#3F7FC0" stroke-width="4" fill="none"/>
<g fill="#E4573D"><rect x="300" y="176" width="24" height="18"/><path d="M296 176 l16 -12 l16 12z"/></g>
<g fill="#5E8752"><circle cx="420" cy="180" r="14"/><circle cx="440" cy="188" r="10"/></g><rect x="428" y="192" width="5" height="12" fill="#5A3E2A"/>
<g fill="#F2C273"><rect x="500" y="172" width="40" height="30"/><path d="M496 172 l24 -14 l24 14z"/></g><rect x="516" y="186" width="10" height="16" fill="#9A7446"/>
<path d="M330 186 q60 40 190 22" stroke="#E4573D" stroke-width="2.5" stroke-dasharray="6 5" fill="none"/>
<g transform="translate(600 200)"><circle r="26" fill="none" stroke="#3A2A18" stroke-width="2"/><path d="M0 -30 l6 24 l-6 -6 l-6 6z" fill="#E4573D"/><path d="M0 30 l6 -24 l-6 6 l-6 -6z M30 0 l-24 6 l6 -6 l-6 -6z M-30 0 l24 6 l-6 -6 l-6 -6z" fill="#3A2A18"/></g>
</g>
<g transform="translate(720 290) rotate(-18)"><rect x="-90" y="-7" width="180" height="14" rx="2" fill="#F2C273"/><path d="M90 -7 l24 7 l-24 7z" fill="#EDDDB4"/><path d="M110 -1 l4 1 l-4 1z" fill="#3A2A18"/><rect x="-90" y="-7" width="16" height="14" fill="#E4573D"/><rect x="-74" y="-7" width="6" height="14" fill="#A8B0B8"/></g>
<g fill="#3A2A18"><path d="M840 232 h120 l-8 -12 h-104z"/><rect x="893" y="150" width="14" height="70"/></g>
<path d="M900 30 A120 120 0 0 1 1010 190" stroke="#3A2A18" stroke-width="10" fill="none" stroke-linecap="round"/>
<circle cx="900" cy="150" r="88" fill="url(#{p}globe)"/>
<g fill="#5E8752" opacity=".9"><path d="M850 110 q30 -20 60 -10 q10 20 -10 30 q-30 10 -40 40 q-20 -20 -10 -60z"/><path d="M930 150 q30 -10 40 10 q-10 30 -30 40 q-16 -20 -10 -50z"/><path d="M900 76 q20 -6 34 8 q-14 6 -34 -8z"/></g>
<g fill="none" stroke="#F7EBD0" stroke-width="1" opacity=".55">{lat}{lon}</g>
<circle cx="900" cy="150" r="88" fill="none" stroke="#1E3A5F" stroke-width="3"/><circle cx="870" cy="112" r="20" fill="#FFFFFF" opacity=".18"/>
<g fill="#F7EBD0" opacity=".5"><rect x="1040" y="196" width="120" height="36" rx="3"/></g><g fill="#E4573D"><rect x="1050" y="204" width="30" height="20" rx="2"/></g><g fill="#3F7FC0"><rect x="1090" y="204" width="30" height="20" rx="2"/></g>
<path d="M0 372 H1200 V420 H0z" fill="#1E140A" opacity=".5"/>
'''
    return _wrap(3, body, defs)


# ───────────────────────── 4  Then and Now, and Our Country: flag, ballot box, photographs ─────────────────────────
def _b4():
    p = "ssb4-"
    defs = (
        _lin(p+"wall", [(0, "#0A1E33", None), (.6, "#1E3A5F", None), (1, "#2D4F80", None)])
        + _lin(p+"table", [(0, "#E4D2AC", None), (.1, "#C9A26A", None), (1, "#5A3A1E", None)])
        + _lin(p+"box", [(0, "#3F7FC0", None), (1, "#1E3A5F", None)])
        + _lin(p+"photo", [(0, "#F7EBD0", None), (1, "#D8C29A", None)])
        + _rad(p+"glow", [(0, "#F6D98C", .5), (1, "#F6D98C", 0)])
    )
    stripes = "".join(f'<path d="M60 {y} q80 {14 if i%2 else -14} 160 0 t160 0 t160 0 v18 q-80 {14 if i%2 else -14} -160 0 t-160 0 t-160 0z" fill="{"#C8402F" if i%2==0 else "#F7EBD0"}"/>' for i, y in enumerate(range(60, 240, 18)))
    stars = "".join(f'<circle cx="{x}" cy="{y}" r="4" fill="#F7EBD0"/>' for y in range(72, 156, 16) for x in range(76, 240, 20))
    def photo(x, y, rot, inner):
        return (f'<g transform="translate({x} {y}) rotate({rot})"><rect x="-62" y="-46" width="124" height="92" fill="url(#{p}photo)"/>'
                f'<rect x="-52" y="-36" width="104" height="72" fill="#7A5A3A" opacity=".8"/>{inner}</g>')
    ph1 = '<path d="M-40 30 v-20 h20 v-14 l14 -12 l14 12 v14 h20 v20z" fill="#E4D2AC" opacity=".8"/><circle cx="-12" cy="-2" r="4" fill="#E4D2AC"/>'
    ph2 = '<g fill="#E4D2AC" opacity=".8"><circle cx="-14" cy="-10" r="10"/><path d="M-30 30 q0 -26 16 -26 q16 0 16 26z"/><circle cx="18" cy="-4" r="8"/><path d="M4 30 q0 -22 14 -22 q14 0 14 22z"/></g>'
    ph3 = '<g fill="#E4D2AC" opacity=".8"><path d="M-40 20 h60 v-16 h-30 l-6 -10 h-24z"/><circle cx="-26" cy="26" r="7"/><circle cx="8" cy="26" r="7"/></g>'
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<ellipse cx="620" cy="140" rx="300" ry="160" fill="url(#{p}glow)"/>
{stripes}
<path d="M60 60 q80 -14 160 0 v92 q-80 14 -160 0z" fill="#1E3A5F"/>{stars}
<rect x="52" y="20" width="8" height="280" fill="#C9A26A"/><circle cx="56" cy="18" r="8" fill="#F2C273"/>
<path d="M0 260 H1200 V420 H0z" fill="url(#{p}table)"/>
<path d="M520 262 v-110 h200 v110z" fill="url(#{p}box)"/><path d="M510 152 h220 l-10 -16 h-200z" fill="#3F7FC0"/><path d="M510 152 h220 v6 h-220z" fill="#7FB4E6"/>
<rect x="580" y="140" width="80" height="6" fill="#0A1E33"/>
<g transform="translate(620 120) rotate(-20)"><rect x="-30" y="-40" width="60" height="70" fill="#F7EBD0"/><rect x="-20" y="-28" width="12" height="12" fill="none" stroke="#1E3A5F" stroke-width="2"/><path d="M-19 -22 l4 5 l8 -10" stroke="#C8402F" stroke-width="2.5" fill="none"/><rect x="-4" y="-26" width="28" height="4" fill="#1E3A5F" opacity=".5"/><rect x="-20" y="-6" width="12" height="12" fill="none" stroke="#1E3A5F" stroke-width="2"/><rect x="-4" y="-4" width="28" height="4" fill="#1E3A5F" opacity=".5"/><rect x="-20" y="14" width="40" height="4" fill="#1E3A5F" opacity=".3"/></g>
<g fill="#F7EBD0" opacity=".7"><path d="M540 180 h30 v40 h-30z"/><path d="M560 200 l10 -10 l10 10z"/></g>
<g fill="#F2C273"><path d="M610 200 l6 -14 l6 14 l-14 -9 h16z"/></g>
{photo(900, 200, 8, ph1)}{photo(1040, 170, -10, ph2)}{photo(980, 250, 3, ph3)}
<g fill="#0A1E33"><circle cx="360" cy="230" r="14"/><path d="M340 262 q0 -22 20 -22 q20 0 20 22z"/></g><path d="M366 236 l12 -4 l-2 -4z" fill="#F2C273"/>
<path d="M0 372 H1200 V420 H0z" fill="#1E140A" opacity=".5"/>
'''
    return _wrap(4, body, defs)


# ───────────────────────── 5  Illinois: Land and People: prairie, river, barn, skyline ─────────────────────────
def _b5():
    p = "ssb5-"
    defs = (
        _lin(p+"sky", [(0, "#0A1E33", None), (.35, "#2D4F80", None), (.7, "#E4B860", None), (1, "#F6D98C", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.3, "#F6D98C", .6), (1, "#F6D98C", 0)])
        + _lin(p+"far", [(0, "#8FAE4C", None), (1, "#5A7A2E", None)])
        + _lin(p+"river", [(0, "#F6D98C", None), (.4, "#7FB4E6", None), (1, "#2D4F80", None)])
        + _lin(p+"fg", [(0, "#3F5C24", None), (1, "#1E2E12", None)])
    )
    sky = [(600, 190, 30, 150), (640, 180, 24, 174), (676, 196, 18, 180), (560, 200, 18, 176), (720, 200, 22, 170), (750, 198, 14, 180), (520, 204, 12, 184)]
    skyline = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{210-y}"/>' for x, _, w, y in sky) + '<path d="M626 150 h4 v-40 h-4z M614 150 h4 v-30 h-4z" fill="#0A1E33"/>'
    grass = "".join(f'<path d="M{x} 306 q{(x%3)*4-4} -24 {(x%5)-2} -48 M{x+7} 306 q{4-(x%3)*3} -18 {(x%4)-1} -34"/>' for x in range(0, 1200, 19))
    flowers = "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="{c}"/>' for x, y, c in ((60, 268, "#F6D98C"), (120, 280, "#C8402F"), (200, 272, "#F6D98C"), (940, 276, "#C8402F"), (1010, 264, "#F6D98C"), (1140, 282, "#F6D98C"), (860, 284, "#C8402F")))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(5, 24, 90, "#F7EBD0", ".5")}
<circle cx="940" cy="190" r="130" fill="url(#{p}sun)"/><circle cx="940" cy="190" r="34" fill="#FFF6D0"/>
<g fill="#F7EBD0" opacity=".35"><ellipse cx="300" cy="120" rx="200" ry="8"/><ellipse cx="800" cy="100" rx="160" ry="7"/></g>
<g fill="#1E3A5F" opacity=".8">{skyline}</g>
<path d="M0 210 H1200 V240 H0z" fill="url(#{p}far)"/>
<path d="M0 230 Q300 216 600 230 T1200 226 V300 H0z" fill="#7E9E48"/>
<path d="M-20 262 Q200 250 380 268 Q560 286 760 264 Q920 246 1220 270 V300 H-20z" fill="url(#{p}river)"/>
<g fill="none" stroke="#FFF6D0" stroke-width="1.5" opacity=".6"><path d="M120 266 h60 M400 276 h50 M760 268 h70 M1000 266 h60"/></g>
<g fill="#C8402F"><path d="M240 240 v-60 h110 v60z"/><path d="M232 182 l63 -38 l63 38z"/></g><path d="M232 182 h126 v5 h-126z" fill="#7A2A1E"/><rect x="280" y="204" width="30" height="36" fill="#5A3A1E"/><path d="M280 204 l30 36 M310 204 l-30 36" stroke="#F7EBD0" stroke-width="2"/>
<rect x="360" y="150" width="34" height="90" fill="#C9C9C9"/><path d="M356 150 q21 -22 42 0z" fill="#A8A8A8"/><rect x="360" y="150" width="34" height="90" fill="url(#{p}far)" opacity=".2"/>
<g fill="#5A3E2A"><path d="M150 240 v-30 h4 v30z M154 210 l18 -8 M154 210 l-16 -6" stroke="#5A3E2A" stroke-width="3"/></g><g fill="#5E8752"><circle cx="152" cy="192" r="24"/><circle cx="134" cy="204" r="16"/><circle cx="172" cy="204" r="16"/></g>
<g fill="#5A3E2A"><rect x="1060" y="200" width="4" height="40"/><path d="M1044 204 h36 l-4 -6 h-28z"/></g><g fill="#5E8752"><circle cx="1062" cy="186" r="20"/><circle cx="1046" cy="198" r="12"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}fg)"/>
<g fill="none" stroke="#5A7A2E" stroke-width="1.8">{grass}</g>
{flowers}
<path d="M0 384 Q300 376 600 382 T1200 378 V420 H0z" fill="#12200C" opacity=".6"/>
'''
    return _wrap(5, body, defs)


# ───────────────────────── 6  The First Peoples: Cahokia's great mound and market ─────────────────────────
def _b6():
    p = "ssb6-"
    defs = (
        _lin(p+"sky", [(0, "#142B4C", None), (.5, "#3F6FA8", None), (.8, "#F2C273", None), (1, "#F6D98C", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.3, "#F6D98C", .5), (1, "#F6D98C", 0)])
        + _lin(p+"mound", [(0, "#9AB85A", None), (.5, "#6E9A3C", None), (1, "#4E7A2C", None)])
        + _lin(p+"ground", [(0, "#C9A26A", None), (1, "#8A6A40", None)])
        + _lin(p+"fg", [(0, "#5A3E2A", None), (1, "#2A1C10", None)])
    )
    posts = "".join(f'<path d="M{x} 236 v-40 l4 -6 l4 6 v40z"/>' for x in range(300, 900, 12))
    stalls = "".join(f'<g transform="translate({x} 0)"><path d="M0 262 v-50 h4 v50z M60 262 v-50 h4 v50z" fill="#5A3E2A"/><path d="M-6 214 h76 l-8 -18 h-60z" fill="{c}"/><path d="M4 262 h56 v-18 h-56z" fill="#9A7446"/></g>' for x, c in ((120, "#C8402F"), (210, "#F2C273"), (860, "#E4B860"), (950, "#C8402F")))
    baskets = "".join(f'<path d="M{x} 262 q-6 -20 12 -20 q18 0 12 20z" fill="#A87A3A"/><path d="M{x+2} 250 h20 M{x} 256 h24" stroke="#5A3E2A" stroke-width="1.2"/>' for x in (140, 176, 230, 880, 970))
    bark = "".join(f'<path d="M{x} 166 v96"/>' for x in range(1030, 1170, 14))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="600" cy="130" r="150" fill="url(#{p}sun)"/><circle cx="600" cy="130" r="34" fill="#FFF6D0"/>
<g fill="#F7EBD0" opacity=".4"><ellipse cx="200" cy="80" rx="140" ry="7"/><ellipse cx="1000" cy="60" rx="160" ry="8"/></g>
<path d="M0 262 H1200 V300 H0z" fill="url(#{p}ground)"/>
<path d="M300 262 L400 190 H460 L520 130 H680 L740 190 H800 L900 262z" fill="url(#{p}mound)"/>
<path d="M400 190 H460 M520 130 H680 M740 190 H800" stroke="#C9E08A" stroke-width="2" opacity=".6"/>
<path d="M560 130 v-30 h80 v30z" fill="#5A3E2A"/><path d="M552 100 l48 -34 l48 34z" fill="#C9A26A"/><path d="M552 100 h96 v4 h-96z" fill="#8A6A40"/>
<path d="M598 262 V182 M580 182 h36" stroke="#F7EBD0" stroke-width="3" fill="none" opacity=".6"/>
<g fill="#5A3E2A">{posts}</g>
{stalls}{baskets}
<g fill="#5A3E2A"><rect x="1020" y="166" width="164" height="96"/></g><path d="M1010 168 q82 -60 184 0z" fill="#8A6A40"/><g stroke="#3A2A18" stroke-width="1.5" opacity=".6">{bark}</g><path d="M1010 168 h184 v4 h-184z" fill="#3A2A18"/><rect x="1090" y="222" width="24" height="40" fill="#2A1C10"/>
<path d="M1100 108 q6 -30 -4 -50 q14 20 4 50z" fill="#8A8A8A" opacity=".5"/>
<g fill="#2A1C10"><circle cx="160" cy="184" r="10"/><path d="M150 196 q10 -6 20 0 l4 30 l-6 36 h-6 l-2 -28 l-6 28 h-6 l4 -36z"/><path d="M170 202 l16 -6 l2 6 l-16 6z"/></g>
<g fill="#2A1C10"><circle cx="300" cy="190" r="9"/><path d="M291 202 q9 -6 18 0 l4 26 l-4 34 h-6 l-2 -24 l-6 24 h-6 l2 -34z"/><path d="M288 196 h24 v-6 h-24z"/></g>
<g fill="#2A1C10"><circle cx="820" cy="186" r="10"/><path d="M810 198 q10 -6 20 0 l4 28 l-6 36 h-6 l-2 -26 l-6 26 h-6 l4 -36z"/><path d="M806 216 l-14 -12 l4 -4 l14 12z"/><path d="M780 196 q10 -14 20 0 q-10 6 -20 0z" fill="#A87A3A"/></g>
<g fill="#F2C273" opacity=".8"><circle cx="230" cy="248" r="3"/><circle cx="238" cy="244" r="3"/><circle cx="246" cy="250" r="3"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}fg)"/>
<path d="M0 372 Q300 364 600 372 T1200 366 V420 H0z" fill="#1A1008" opacity=".5"/>
'''
    return _wrap(6, body, defs)


# ───────────────────────── 7  Colonies to a New Nation: spire, flatboat, quill ─────────────────────────
def _b7():
    p = "ssb7-"
    defs = (
        _lin(p+"sky", [(0, "#0A1E33", None), (.4, "#1E3A5F", None), (.8, "#E4B860", None), (1, "#F6D98C", None)])
        + _lin(p+"hall", [(0, "#8A3A2A", None), (1, "#4A2018", None)])
        + _lin(p+"river", [(0, "#E4B860", None), (.3, "#7FB4E6", None), (1, "#142B4C", None)])
        + _lin(p+"paper", [(0, "#FBF3E0", None), (1, "#E8D8B0", None)])
        + _lin(p+"quill", [(0, "#F7EBD0", None), (1, "#C9A26A", None)])
    )
    windows = "".join(f'<rect x="{x}" y="{y}" width="12" height="18" fill="#F6D98C" opacity=".8"/>' for x in (110, 140, 170, 200, 230) for y in (200, 236))
    lines = "".join(f'<path d="M{x} {y} h{w}"/>' for x, y, w in ((880, 220, 200), (880, 236, 180), (880, 252, 210), (880, 268, 160), (880, 284, 190)))
    logs = "".join(f'<rect x="{560+i*44}" y="270" width="40" height="8" rx="4" fill="#5A3E2A"/>' for i in range(5))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(9, 22, 100, "#F7EBD0", ".5", 300, 1200)}
<g fill="#F7EBD0" opacity=".35"><ellipse cx="700" cy="120" rx="180" ry="8"/></g>
<path d="M90 300 v-110 h180 v110z" fill="url(#{p}hall)"/><path d="M84 190 h192 v-8 h-192z" fill="#F7EBD0" opacity=".6"/>{windows}
<path d="M150 190 v-40 h60 v40z" fill="url(#{p}hall)"/><path d="M146 150 h68 v-6 h-68z" fill="#F7EBD0" opacity=".6"/>
<path d="M156 150 v-38 h48 v38z" fill="#F7EBD0"/><circle cx="180" cy="130" r="14" fill="#0A1E33"/><circle cx="180" cy="130" r="14" fill="none" stroke="#F2C273" stroke-width="2"/><path d="M180 130 v-9 M180 130 l6 4" stroke="#F2C273" stroke-width="2"/>
<path d="M160 112 v-30 h40 v30z" fill="url(#{p}hall)"/><g stroke="#F6D98C" stroke-width="3" fill="none"><path d="M168 108 v-20 M180 108 v-20 M192 108 v-20"/></g>
<path d="M156 82 h48 l-4 -10 h-40z" fill="#F7EBD0" opacity=".7"/><path d="M164 72 L180 8 L196 72z" fill="#F7EBD0" opacity=".9"/><path d="M180 8 v-4" stroke="#F2C273" stroke-width="2"/><circle cx="180" cy="4" r="3" fill="#F2C273"/>
<rect x="60" y="230" width="30" height="70" fill="url(#{p}hall)"/><rect x="270" y="230" width="30" height="70" fill="url(#{p}hall)"/>
<g fill="#1E3A5F"><rect x="300" y="240" width="18" height="60"/><circle cx="309" cy="232" r="18"/><rect x="40" y="250" width="12" height="50"/><circle cx="46" cy="242" r="14"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}river)"/>
<g fill="none" stroke="#FFF6D0" stroke-width="1.5" opacity=".5"><path d="M60 320 h80 M300 334 h100 M900 326 h80 M1100 342 h60"/></g>
<path d="M540 296 l30 -30 h200 l30 30 l-8 12 h-244z" fill="#5A3E2A"/><path d="M548 296 h228 v6 h-228z" fill="#3A2A18"/>
<path d="M590 266 v-40 h130 v40z" fill="#8A6A40"/><path d="M584 226 q65 -20 142 0z" fill="#5A3E2A"/><path d="M720 246 h-20 v20 h20z" fill="#2A1C10"/>
<path d="M760 262 l40 -60" stroke="#3A2A18" stroke-width="4" stroke-linecap="round"/>
<g fill="#0A1E33"><circle cx="780" cy="214" r="9"/><path d="M771 226 q9 -6 18 0 l3 40 h-24z"/></g>
<g fill="#0A1E33"><circle cx="600" cy="220" r="8"/><path d="M592 230 q8 -6 16 0 l2 36 h-20z"/><circle cx="626" cy="230" r="6"/><path d="M620 238 q6 -4 12 0 l2 28 h-16z"/></g>
{logs}
<g transform="rotate(-8 1000 260)"><rect x="860" y="200" width="250" height="110" fill="url(#{p}paper)"/><g stroke="#8A6A40" stroke-width="2.5" opacity=".6">{lines}</g><path d="M1000 300 q-4 -10 6 -14 q8 6 -2 14z" fill="#3A2A18" opacity=".6"/></g>
<path d="M1020 300 h50 v-30 h-50z" fill="#0A1E33"/><ellipse cx="1045" cy="270" rx="25" ry="7" fill="#1E3A5F"/><ellipse cx="1045" cy="270" rx="12" ry="4" fill="#0A1E33"/>
<g transform="translate(1046 268) rotate(24)"><path d="M0 0 l-6 -180 q6 -30 20 -50 q-8 60 -2 200z" fill="url(#{p}quill)"/><path d="M-3 0 l-3 -170" stroke="#9A7446" stroke-width="2"/><path d="M-4 -60 q-26 -30 -26 -80 q10 30 24 60z M2 -80 q30 -40 30 -90 q-6 40 -28 66z" fill="#F7EBD0" opacity=".9"/><path d="M0 0 l-2 8 l-4 -8z" fill="#3A2A18"/></g>
<path d="M0 384 H1200 V420 H0z" fill="#06121A" opacity=".5"/>
'''
    return _wrap(7, body, defs)


# ───────────────────────── 8  Government: board table, capitol dome, ballot ─────────────────────────
def _b8():
    p = "ssb8-"
    defs = (
        _lin(p+"sky", [(0, "#0A1E33", None), (.6, "#2D4F80", None), (1, "#E4B860", None)])
        + _lin(p+"cap", [(0, "#F7EBD0", None), (1, "#C9B890", None)])
        + _lin(p+"table", [(0, "#8A6A40", None), (.1, "#5A3E2A", None), (1, "#2A1C10", None)])
        + _lin(p+"cloth", [(0, "#2D4F80", None), (1, "#142B4C", None)])
        + _rad(p+"glow", [(0, "#F6D98C", .6), (1, "#F6D98C", 0)])
    )
    cols = "".join(f'<rect x="{x}" y="172" width="8" height="52" fill="#C9B890"/>' for x in range(508, 700, 24))
    dome_ribs = "".join(f'<path d="M600 60 Q{600+dx} 110 {600+dx*1.6:.0f} 172" stroke="#C9B890" stroke-width="1.5" fill="none"/>' for dx in (-40, -20, 0, 20, 40))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(13, 30, 120, "#F7EBD0", ".55")}
<ellipse cx="600" cy="150" rx="260" ry="120" fill="url(#{p}glow)"/>
<path d="M440 224 h320 v-52 h-320z" fill="url(#{p}cap)"/><path d="M430 172 h340 v-8 h-340z" fill="#F7EBD0"/>{cols}
<path d="M520 172 h160 v-24 h-160z" fill="#E8D8B0"/><path d="M528 148 q72 -100 144 0z" fill="url(#{p}cap)"/>{dome_ribs}
<path d="M580 60 h40 v-12 h-40z" fill="#E8D8B0"/><path d="M590 48 l10 -22 l10 22z" fill="#F2C273"/><circle cx="600" cy="24" r="4" fill="#F2C273"/>
<path d="M300 224 h140 v-40 h-140z M760 224 h140 v-40 h-140z" fill="#E8D8B0"/><g fill="#0A1E33" opacity=".6"><rect x="320" y="196" width="10" height="16"/><rect x="350" y="196" width="10" height="16"/><rect x="380" y="196" width="10" height="16"/><rect x="410" y="196" width="10" height="16"/><rect x="780" y="196" width="10" height="16"/><rect x="810" y="196" width="10" height="16"/><rect x="840" y="196" width="10" height="16"/><rect x="870" y="196" width="10" height="16"/></g>
<path d="M0 224 H1200 V260 H0z" fill="#1E3A5F"/>
<path d="M0 258 H1200 V420 H0z" fill="url(#{p}table)"/><path d="M0 258 h1200 v6 H0z" fill="#C9A26A"/>
<path d="M0 262 Q600 246 1200 262 V300 H0z" fill="url(#{p}cloth)"/>
{_person(160, 230, 1, "#0A1E33", "#5A3E2A")}{_person(320, 226, 1.05, "#0A1E33", "#F7EBD0")}{_person(880, 226, 1.05, "#0A1E33", "#3A2A18")}{_person(1040, 230, 1, "#0A1E33", "#C9A26A")}
<g fill="#F7EBD0" opacity=".9"><rect x="130" y="262" width="60" height="4"/><rect x="290" y="260" width="60" height="4"/><rect x="850" y="260" width="60" height="4"/><rect x="1010" y="262" width="60" height="4"/></g>
<g transform="translate(560 268) rotate(-24)"><rect x="-6" y="-50" width="12" height="60" rx="3" fill="#8A6A40"/><rect x="-26" y="-64" width="52" height="24" rx="6" fill="#5A3E2A"/></g><ellipse cx="600" cy="278" rx="34" ry="8" fill="#3A2A18"/>
<g transform="translate(720 270) rotate(6)"><rect x="-44" y="-56" width="88" height="70" fill="#F7EBD0"/><rect x="-32" y="-44" width="14" height="14" fill="none" stroke="#1E3A5F" stroke-width="2"/><path d="M-30 -38 l5 6 l10 -12" stroke="#C8402F" stroke-width="3" fill="none"/><rect x="-12" y="-40" width="44" height="5" fill="#1E3A5F" opacity=".5"/><rect x="-32" y="-20" width="14" height="14" fill="none" stroke="#1E3A5F" stroke-width="2"/><rect x="-12" y="-16" width="44" height="5" fill="#1E3A5F" opacity=".5"/><rect x="-32" y="2" width="70" height="4" fill="#1E3A5F" opacity=".3"/></g>
<path d="M0 372 H1200 V420 H0z" fill="#0A0604" opacity=".45"/>
'''
    return _wrap(8, body, defs)


# ───────────────────────── 9  Money, Markets and Regions: school store, coin, U.S. map ─────────────────────────
def _b9():
    p = "ssb9-"
    defs = (
        _lin(p+"wall", [(0, "#1E3A5F", None), (1, "#142B4C", None)])
        + _lin(p+"counter", [(0, "#E4B860", None), (.08, "#C9A26A", None), (1, "#5A3A1E", None)])
        + _rad(p+"coin", [(0, "#FFF0B8", 1), (.55, "#F2C273", 1), (1, "#C9A26A", 1)], .4, .35, .7)
        + _lin(p+"map", [(0, "#F7EBD0", None), (1, "#E4D2AC", None)])
    )
    usa = ("M640 90 l20 -6 l40 4 l30 -10 l40 6 l30 16 l40 -4 l24 12 l10 24 l-8 22 l8 14 l-14 4 l-26 -8 l-4 20 l-20 14 l-6 -18 l-22 -4 "
           "l-16 20 l-26 -2 l-14 12 l-30 -4 l-20 -6 l-26 -16 l-24 6 l-36 -2 l-30 -12 l-14 -20 l-4 -30 l30 -36 l24 -8z")
    pencils = "".join(f'<rect x="{x}" y="{y}" width="6" height="52" rx="2" fill="{c}" transform="rotate({r} {x+3} {y+52})"/>' for x, y, c, r in ((178, 172, "#F2C273", -12), (188, 168, "#F2C273", -4), (198, 170, "#C8402F", 4), (208, 174, "#F2C273", 12), (324, 176, "#3F7FC0", -8), (334, 170, "#F2C273", 2), (344, 174, "#F2C273", 10)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}wall)"/>
<rect x="590" y="40" width="380" height="200" rx="3" fill="url(#{p}map)"/><rect x="590" y="40" width="380" height="200" rx="3" fill="none" stroke="#C9A26A" stroke-width="4"/>
<path d="{usa}" fill="#7FB4E6" opacity=".85" stroke="#1E3A5F" stroke-width="2"/>
<path d="M760 92 l30 -4 l24 10 l6 30 l-20 16 l-30 -4 l-16 -18z" fill="#E4B860" opacity=".9" stroke="#1E3A5F" stroke-width="1.5"/>
<circle cx="796" cy="106" r="6" fill="#C8402F"/><circle cx="796" cy="106" r="2.5" fill="#F7EBD0"/>
<g stroke="#1E3A5F" stroke-width="1" fill="none" opacity=".35"><path d="M600 100 h360 M600 150 h360 M600 200 h360 M680 44 v190 M780 44 v190 M880 44 v190"/></g>
<g transform="translate(930 200)"><circle r="18" fill="none" stroke="#1E3A5F" stroke-width="1.5"/><path d="M0 -20 l4 16 l-4 -4 l-4 4z" fill="#C8402F"/><path d="M0 20 l4 -16 l-4 4 l-4 -4z M20 0 l-16 4 l4 -4 l-4 -4z M-20 0 l16 4 l-4 -4 l-4 -4z" fill="#1E3A5F"/></g>
<path d="M0 240 H1200 V420 H0z" fill="url(#{p}counter)"/><path d="M0 240 h1200 v8 H0z" fill="#F6D98C"/>
<g fill="#F7EBD0" opacity=".35"><rect x="168" y="196" width="60" height="44" rx="4"/><rect x="314" y="196" width="60" height="44" rx="4"/></g>{pencils}

<g fill="#C8402F"><rect x="430" y="204" width="70" height="36" rx="3"/></g><g fill="#F6D98C"><rect x="440" y="214" width="50" height="8"/></g>
<g fill="#3F7FC0"><rect x="60" y="180" width="50" height="60" rx="3"/></g><g fill="#F7EBD0"><rect x="70" y="192" width="30" height="4"/><rect x="70" y="204" width="30" height="4"/><rect x="70" y="216" width="20" height="4"/></g>
<g fill="#0A1E33"><circle cx="1090" cy="164" r="14"/><path d="M1070 240 q0 -40 20 -40 q20 0 20 40z"/></g><path d="M1088 202 h22 v16 h-22z" fill="#5A3E2A"/><path d="M1090 204 h18 v3 h-18z" fill="#F6D98C"/>
<g transform="translate(1020 300)"><circle r="70" fill="#8A6A40"/><circle cx="-4" cy="-4" r="70" fill="url(#{p}coin)"/><circle cx="-4" cy="-4" r="60" fill="none" stroke="#C9A26A" stroke-width="3"/><circle cx="-4" cy="-4" r="66" fill="none" stroke="#FFF0B8" stroke-width="1.5" opacity=".6"/>
<path d="M-4 -46 l10 30 h32 l-26 18 l10 30 l-26 -18 l-26 18 l10 -30 l-26 -18 h32z" fill="#C9A26A" opacity=".8"/><path d="M-4 -40 l8 26 h27 l-22 15 l8 26 l-21 -15 l-21 15 l8 -26 l-22 -15 h27z" fill="#F2C273"/></g>
<g fill="#C9A26A"><ellipse cx="700" cy="278" rx="60" ry="10"/><circle cx="700" cy="270" r="20" fill="#F2C273"/><circle cx="700" cy="266" r="20" fill="#F6D98C"/><circle cx="700" cy="266" r="14" fill="none" stroke="#C9A26A" stroke-width="2"/></g>
<path d="M0 372 H1200 V420 H0z" fill="#1E140A" opacity=".5"/>
'''
    return _wrap(9, body, defs)


# ───────────────────────── 10  The First Civilizations: ziggurat, Nile, pyramid, tablet ─────────────────────────
def _b10():
    p = "ssb10-"
    defs = (
        _lin(p+"sky", [(0, "#0A1E33", None), (.45, "#2D4F80", None), (.78, "#E4B860", None), (1, "#F6D98C", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.3, "#F6D98C", .55), (1, "#F6D98C", 0)])
        + _lin(p+"sand", [(0, "#E4C48A", None), (1, "#A87A3A", None)])
        + _lin(p+"river", [(0, "#F2C273", None), (.3, "#5FA0DC", None), (1, "#1E3A5F", None)])
        + _lin(p+"zig", [(0, "#C9A26A", None), (1, "#7A5A32", None)])
        + _lin(p+"pyr", [(0, "#E8D8B0", None), (1, "#A87A3A", None)], 0, 0, 1, 0)
        + _lin(p+"clay", [(0, "#B08A50", None), (1, "#7A5A32", None)])
    )
    tiers = "".join(f'<path d="M{300-w} {y} h{2*w} v-{h} h-{2*w}z" fill="url(#{p}zig)"/><path d="M{300-w} {y-h} h{2*w} v3 h-{2*w}z" fill="#E8D8B0" opacity=".5"/>' for w, y, h in ((150, 240, 34), (118, 206, 30), (88, 176, 26), (60, 150, 22), (34, 128, 20)))
    stair = "".join(f'<path d="M{300-3} {y} h6" stroke="#3A2A18" stroke-width="2"/>' for y in range(112, 240, 6))
    palms = "".join(f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 q-4 -40 4 -70" stroke="#3A2A18" stroke-width="5" fill="none"/><g fill="#4E7A2C"><path d="M4 -70 q-30 -20 -50 -6 q26 -2 50 6z"/><path d="M4 -70 q30 -20 50 -6 q-26 -2 -50 6z"/><path d="M4 -70 q-24 6 -34 30 q22 -14 34 -30z"/><path d="M4 -70 q24 6 34 30 q-22 -14 -34 -30z"/><path d="M4 -70 q-6 -30 6 -40 q4 22 -6 40z"/></g></g>' for x, y, s in ((560, 262, 1), (620, 262, .7), (1130, 262, .9)))
    def wedges(x0, y0, rows):
        out = []
        seed = 41
        for r in range(rows):
            x = x0
            while x < x0 + 130:
                seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
                k = seed % 4
                y = y0 + r * 14
                if k == 0:
                    out.append(f'<path d="M{x} {y} l10 -3 l-8 6z"/>')
                elif k == 1:
                    out.append(f'<path d="M{x} {y-5} l3 10 l-6 -6z"/>')
                elif k == 2:
                    out.append(f'<path d="M{x} {y} l12 0 l-10 4z M{x+6} {y-6} l3 6 l-6 0z"/>')
                x += 14 + seed % 8
        return "".join(out)
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(17, 26, 100, "#F7EBD0", ".5")}
<circle cx="820" cy="180" r="140" fill="url(#{p}sun)"/><circle cx="820" cy="180" r="36" fill="#FFF6D0"/>
<path d="M0 240 H1200 V280 H0z" fill="url(#{p}sand)"/>
<path d="M880 240 L1000 60 L1120 240z" fill="url(#{p}pyr)"/><path d="M1000 60 L1120 240 H1000z" fill="#7A5A32" opacity=".55"/>
<path d="M700 240 L760 150 L820 240z" fill="#C9A26A" opacity=".7"/><path d="M760 150 L820 240 H760z" fill="#7A5A32" opacity=".4"/>
{tiers}{stair}
<path d="M280 128 h40 v-24 h-40z" fill="#3A2A18"/><path d="M276 104 h48 v-4 h-48z" fill="#E8D8B0"/>
<path d="M0 262 Q200 250 400 266 Q600 282 800 262 Q1000 246 1200 264 V300 H0z" fill="url(#{p}river)"/>
<g fill="none" stroke="#FFF6D0" stroke-width="1.5" opacity=".55"><path d="M60 270 h60 M420 276 h60 M760 268 h60 M1020 266 h60"/></g>
{palms}
<path d="M660 274 q30 -10 60 0 l-8 12 h-44z" fill="#5A3E2A"/><path d="M690 262 v-30 l20 20 h-20" stroke="#F7EBD0" stroke-width="2" fill="#F7EBD0"/>
<g fill="#5A3E2A"><path d="M0 300 H1200 V420 H0z"/></g><path d="M0 300 H1200 V420 H0z" fill="url(#{p}sand)" opacity=".85"/>
<g transform="translate(120 250) rotate(-6)"><path d="M0 0 q-6 -8 0 -16 h170 q6 8 0 16 v96 q-6 8 0 16 h-170 q-6 -8 0 -16z" fill="url(#{p}clay)"/><path d="M6 -10 h158 v112 h-158z" fill="none" stroke="#5A3E2A" stroke-width="1.5" opacity=".5"/><g fill="#3A2A18" opacity=".8">{wedges(16, 4, 7)}</g></g>
<g transform="translate(340 300)"><path d="M0 0 q-20 -30 0 -40 h30 q20 10 0 40z" fill="#8A6A40"/><path d="M0 -40 h30 q8 -20 -15 -24 q-23 4 -15 24z" fill="#7A5A32"/></g>
<path d="M0 384 H1200 V420 H0z" fill="#2A1C10" opacity=".5"/>
'''
    return _wrap(10, body, defs)


# ───────────────────────── 11  Classical Worlds: Parthenon, aqueduct, caravan ─────────────────────────
def _b11():
    p = "ssb11-"
    defs = (
        _lin(p+"sky", [(0, "#142B4C", None), (.4, "#3F6FA8", None), (.75, "#F2C273", None), (1, "#F6D98C", None)])
        + _rad(p+"sun", [(0, "#FFF6D0", 1), (.3, "#F6D98C", .5), (1, "#F6D98C", 0)])
        + _lin(p+"hill", [(0, "#8A7A50", None), (1, "#5A4A2C", None)])
        + _lin(p+"stone", [(0, "#E8D8B0", None), (1, "#B09A68", None)])
        + _lin(p+"ground", [(0, "#D8B878", None), (1, "#8A6A40", None)])
        + _lin(p+"fg", [(0, "#5A3E2A", None), (1, "#2A1C10", None)])
    )
    cols = "".join(f'<rect x="{x}" y="120" width="10" height="66" fill="url(#{p}stone)"/><rect x="{x-2}" y="118" width="14" height="4" fill="#E8D8B0"/>' for x in range(120, 380, 26))
    arches = "".join(f'<path d="M{x} 250 v-60 a30 30 0 0 1 60 0 v60z" fill="#3F6FA8" opacity=".6"/>' for x in range(560, 1180, 74))
    small = "".join(f'<path d="M{x} 160 v-22 a14 14 0 0 1 28 0 v22z" fill="#3F6FA8" opacity=".5"/>' for x in range(560, 1180, 37))
    def camel(x, y, s, flip):
        return (f'<g transform="translate({x} {y}) scale({-s if flip else s} {s})" fill="#2A1C10"><path d="M-40 0 q-6 -30 10 -40 q10 -16 24 -6 q14 -12 26 6 q14 10 8 40z"/>'
                f'<path d="M20 -34 q10 -30 22 -30 q10 0 12 8 l-4 6 q-6 -4 -12 4 q-6 18 -8 46z"/><path d="M-36 0 v26 M-26 0 v26 M10 0 v26 M22 0 v26" stroke="#2A1C10" stroke-width="4"/>'
                f'<path d="M-42 -6 q-10 6 -8 16" stroke="#2A1C10" stroke-width="3" fill="none"/><path d="M-10 -44 h24 v8 h-24z" fill="#C8402F"/></g>')
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
<circle cx="700" cy="120" r="140" fill="url(#{p}sun)"/><circle cx="700" cy="120" r="34" fill="#FFF6D0"/>
<g fill="#F7EBD0" opacity=".35"><ellipse cx="950" cy="60" rx="160" ry="8"/><ellipse cx="300" cy="50" rx="120" ry="7"/></g>
<path d="M-20 250 Q100 170 250 186 Q380 180 500 250z" fill="url(#{p}hill)"/>
<rect x="104" y="186" width="292" height="10" fill="#B09A68"/><rect x="96" y="196" width="308" height="8" fill="#8A7A50"/>
{cols}
<rect x="106" y="106" width="288" height="12" fill="url(#{p}stone)"/><path d="M100 106 L250 62 L400 106z" fill="url(#{p}stone)"/><path d="M116 104 L250 68 L384 104z" fill="#B09A68" opacity=".6"/>
<g fill="#E8D8B0"><rect x="560" y="164" width="620" height="12"/><rect x="560" y="250" width="620" height="8" opacity=".6"/></g>
<rect x="560" y="176" width="620" height="74" fill="url(#{p}stone)"/>{arches}
<rect x="560" y="130" width="620" height="34" fill="url(#{p}stone)"/>{small}
<rect x="560" y="122" width="620" height="8" fill="#E8D8B0"/><path d="M560 126 h620" stroke="#7FB4E6" stroke-width="3" opacity=".7"/>
<path d="M0 250 H1200 V300 H0z" fill="url(#{p}ground)"/>
{camel(300, 264, 1.05, False)}{camel(400, 268, .9, False)}{camel(490, 266, 1, False)}
<g fill="#2A1C10"><circle cx="228" cy="220" r="8"/><path d="M220 230 q8 -5 16 0 l3 34 h-22z"/><path d="M236 236 l24 10" stroke="#2A1C10" stroke-width="3"/></g>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}fg)"/>
<g fill="#D8B878" opacity=".25"><ellipse cx="300" cy="316" rx="120" ry="8"/><ellipse cx="800" cy="320" rx="160" ry="8"/></g>
<path d="M0 384 H1200 V420 H0z" fill="#1A1008" opacity=".5"/>
'''
    return _wrap(11, body, defs)


# ───────────────────────── 12  Faiths, Empires and Exchange: mosque, castle, rider, Mayan pyramid ─────────────────────────
def _b12():
    p = "ssb12-"
    defs = (
        _lin(p+"sky", [(0, "#070E22", None), (.5, "#142B4C", None), (.85, "#2D4F80", None), (1, "#E4B860", None)])
        + _rad(p+"moon", [(0, "#FFF6D0", 1), (.3, "#F6D98C", .6), (1, "#F6D98C", 0)])
        + _lin(p+"far", [(0, "#1E3A5F", None), (1, "#0F2444", None)])
        + _lin(p+"ground", [(0, "#4A3A22", None), (1, "#2A1C10", None)])
        + _lin(p+"cream", [(0, "#F7EBD0", None), (1, "#C9B890", None)])
        + _lin(p+"castle", [(0, "#8A8A8A", None), (1, "#4A4A52", None)])
    )
    crenel = "".join(f'<rect x="{x}" y="156" width="12" height="12"/>' for x in range(760, 940, 24))
    tow_cr = "".join(f'<rect x="{x}" y="{y}" width="8" height="10"/>' for y in (108,) for x in range(740, 772, 16)) + "".join(f'<rect x="{x}" y="120" width="8" height="10"/>' for x in range(930, 962, 16))
    steps = "".join(f'<path d="M{1130-w} {y} h{2*w} v-{h} h-{2*w}z"/>' for w, y, h in ((150, 250, 22), (126, 228, 22), (102, 206, 22), (78, 184, 22), (54, 162, 22), (30, 140, 18)))
    stair = "".join(f'<path d="M1116 {y} h28"/>' for y in range(126, 250, 6))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(33, 110, 200, "#F7EBD0", ".7")}
<circle cx="600" cy="90" r="90" fill="url(#{p}moon)"/><circle cx="600" cy="90" r="34" fill="#FFF6D0"/><circle cx="616" cy="80" r="30" fill="#0E1E3A"/>
<path d="M0 250 Q200 236 400 246 T800 244 T1200 248 V300 H0z" fill="url(#{p}far)"/>
<rect x="150" y="190" width="200" height="60" fill="url(#{p}cream)"/><path d="M160 190 q90 -110 180 0z" fill="url(#{p}cream)"/><path d="M160 190 h180 v6 h-180z" fill="#C9A26A"/>
<path d="M250 86 v-16" stroke="#F2C273" stroke-width="3"/><path d="M248 70 a8 8 0 1 1 8 -6 a6 6 0 1 0 -6 6z" fill="#F2C273"/>
<g fill="#0F2444"><path d="M230 250 v-40 a20 20 0 0 1 40 0 v40z"/><path d="M180 250 v-24 a10 10 0 0 1 20 0 v24z"/><path d="M300 250 v-24 a10 10 0 0 1 20 0 v24z"/></g>
<rect x="392" y="90" width="26" height="160" fill="url(#{p}cream)"/><rect x="386" y="140" width="38" height="8" fill="#C9A26A"/><rect x="386" y="200" width="38" height="8" fill="#C9A26A"/><path d="M388 90 h34 l-17 -26z" fill="#C9A26A"/><path d="M405 64 v-10" stroke="#F2C273" stroke-width="2"/>
<rect x="760" y="168" width="180" height="82" fill="url(#{p}castle)"/><g fill="url(#{p}castle)">{crenel}</g>
<rect x="736" y="118" width="44" height="132" fill="url(#{p}castle)"/><g fill="#4A4A52">{tow_cr}</g><path d="M732 118 h52 l-26 -40z" fill="#5A3A1E"/><path d="M758 78 v-20" stroke="#C8402F" stroke-width="2"/><path d="M758 58 h20 l-20 10z" fill="#C8402F"/>
<rect x="926" y="130" width="44" height="120" fill="url(#{p}castle)"/><path d="M922 130 h52 l-26 -40z" fill="#5A3A1E"/>
<g fill="#0F2444"><path d="M834 250 v-40 a16 16 0 0 1 32 0 v40z"/><rect x="800" y="190" width="8" height="20"/><rect x="890" y="190" width="8" height="20"/><rect x="752" y="140" width="6" height="16"/><rect x="942" y="150" width="6" height="16"/></g>
<g fill="#F6D98C" opacity=".8"><rect x="800" y="190" width="8" height="20"/><rect x="752" y="140" width="6" height="16"/></g>
<g fill="#2A1C10">{steps}</g><g stroke="#4A3A22" stroke-width="1.2">{stair}</g><rect x="1116" y="120" width="28" height="20" fill="#2A1C10"/><path d="M1112 122 h36 v-4 h-36z" fill="#5A4A2C"/>
<g fill="#0A1E33"><path d="M560 264 q-10 -30 10 -46 q10 -20 40 -12 l20 -4 q10 -14 22 -4 l14 12 q4 6 -6 8 l-10 -2 q0 26 -12 42 l-10 -4 q-6 -4 0 -12 q-20 4 -40 0 q-6 16 -14 20z"/><path d="M566 260 l-8 30 M584 262 l-4 30 M614 262 l4 30 M630 258 l10 30" stroke="#0A1E33" stroke-width="5" stroke-linecap="round"/><path d="M552 224 q-16 6 -20 26" stroke="#0A1E33" stroke-width="4" fill="none"/></g>
<g fill="#0A1E33"><circle cx="602" cy="176" r="9"/><path d="M592 186 q10 -6 20 0 l4 22 l-12 8 l-14 -6z"/><path d="M596 180 q6 -10 14 -2 h-14z"/><path d="M612 190 l40 -30 l3 4 l-40 30z"/></g><path d="M650 156 l-14 10 l4 -14z" fill="#0A1E33"/>
<path d="M0 300 H1200 V420 H0z" fill="url(#{p}ground)"/>
<path d="M0 372 Q300 364 600 372 T1200 366 V420 H0z" fill="#0A0604" opacity=".5"/>
'''
    return _wrap(12, body, defs)


_BUILDERS = {1: _b1, 2: _b2, 3: _b3, 4: _b4, 5: _b5, 6: _b6, 7: _b7, 8: _b8, 9: _b9, 10: _b10, 11: _b11, 12: _b12}


def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())


BANNERS = {n: _clean(f()) for n, f in _BUILDERS.items()}


def banner(n):
    """Return the complete inline <svg> for unit n (1..12)."""
    return BANNERS[int(n)]


if __name__ == "__main__":
    for n in range(1, 13):
        print(n, len(BANNERS[n].encode("utf-8")), "bytes")
