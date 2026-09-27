"""Unit banner for the Science course, unit 28 (grades 6–8): Sound, Rhythm and
Recorded Music. Same rules as banners_sci_a/_b: 1200x420 inline SVG, ids
prefixed "sb28-", no text, no images, calm lower half for the title."""
from banners_sci_a import W, H, _lin, _rad, _stars

CREDITS = {
    28: "Drawn scene: a drum machine with a row of sixteen lit step pads, a spinning record on a turntable and an oscilloscope screen tracing a sound wave, under a night sky",
}

def _b28():
    p = "sb28-"
    defs = (
        _lin(p+"sky", [(0, "#070A2A", None), (.6, "#131A4E", None), (1, "#1F2A6E", None)])
        + _lin(p+"desk", [(0, "#1A1E48", None), (1, "#0A0D24", None)])
        + _rad(p+"vinyl", [(0, "#2A2A3E", None), (.2, "#15151F", None), (1, "#0A0A12", None)])
        + _rad(p+"glow", [(0, "#35E6A0", .35), (1, "#35E6A0", 0)])
    )
    import math
    # oscilloscope trace: a decaying kick-drum wave
    pts = []
    for i in range(0, 261, 3):
        t = i / 260
        y = 128 - 48 * math.exp(-3.2 * t) * math.sin(2 * math.pi * 3.5 * t)
        pts.append("%d,%.1f" % (880 + i, y))
    trace = " ".join(pts)
    grid = "".join(f'<path d="M{880+x} 64 v128"/>' for x in range(0, 261, 52)) + "".join(f'<path d="M880 {64+y} h260"/>' for y in range(0, 129, 32))
    # sixteen step pads, four groups of four; steps 1,5,9,13 lit (four on the floor)
    pads = []
    for s in range(16):
        x = 452 + s * 24 + (s // 4) * 6
        lit = s % 4 == 0
        fill = "#F2A33A" if lit else "#2E3478"
        pads.append(f'<rect x="{x}" y="236" width="18" height="18" rx="3" fill="{fill}"/>')
    pads = "".join(pads)
    grooves = "".join(f'<circle cx="220" cy="300" r="{r}"/>' for r in range(64, 200, 9))
    arcs = "".join(f'<path d="M{700-r} {150} A{r} {r} 0 0 1 {700+r} {150}" stroke-opacity="{.8-0.18*i:.2f}"/>' for i, r in enumerate((30, 54, 78, 102)))
    body = f'''
<rect width="{W}" height="{H}" fill="url(#{p}sky)"/>
{_stars(2801, 80, 200, "#E8E9F5", ".75")}
<g fill="none" stroke="#35E6E6" stroke-width="2.5" stroke-linecap="round">{arcs}</g>
<rect x="0" y="200" width="{W}" height="220" fill="url(#{p}desk)"/>
<rect x="0" y="200" width="{W}" height="6" fill="#2E3478"/>
<rect x="30" y="160" width="380" height="250" rx="10" fill="#161A40"/>
<circle cx="220" cy="300" r="196" fill="#0A0A12"/><circle cx="220" cy="300" r="188" fill="url(#{p}vinyl)"/>
<g fill="none" stroke="#2C2C40" stroke-width="1.6">{grooves}</g>
<circle cx="220" cy="300" r="52" fill="#F26A4F"/><circle cx="220" cy="300" r="5" fill="#DDE"/>
<circle cx="380" cy="186" r="16" fill="#2E3478"/><circle cx="380" cy="186" r="7" fill="#8A8AC8"/>
<path d="M380 186 L352 250 L318 272" stroke="#B8B8E0" stroke-width="6" stroke-linecap="round" fill="none"/>
<path d="M326 264 l-14 10 l-3 -5 l12 -11z" fill="#35E6E6"/>
<rect x="440" y="176" width="420" height="96" rx="10" fill="#20245A"/>
<rect x="452" y="190" width="120" height="30" rx="4" fill="#0E1234"/><rect x="460" y="198" width="60" height="6" rx="2" fill="#35E6A0" opacity=".85"/>
<g fill="#8A8AC8"><circle cx="610" cy="205" r="11"/><circle cx="650" cy="205" r="11"/><circle cx="690" cy="205" r="11"/></g>
<g fill="#20245A"><rect x="608" y="194" width="4" height="10"/><rect x="648" y="196" width="4" height="10" transform="rotate(40 650 205)"/><rect x="688" y="196" width="4" height="10" transform="rotate(-40 690 205)"/></g>
{pads}
<rect x="866" y="50" width="290" height="160" rx="12" fill="#1A1E48"/>
<rect x="880" y="64" width="260" height="128" rx="4" fill="#06140F"/>
<rect x="880" y="64" width="260" height="128" fill="url(#{p}glow)"/>
<g stroke="#1E4A38" stroke-width="1">{grid}</g>
<polyline points="{trace}" fill="none" stroke="#35E6A0" stroke-width="2.6" stroke-linejoin="round"/>
'''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
            f'role="img" aria-label="{CREDITS[28]}" focusable="false"><defs>{defs}</defs>{body}</svg>')

def _clean(s):
    return "\n".join(line.strip() for line in s.strip().splitlines() if line.strip())

BANNERS = {28: _clean(_b28())}

def banner(n):
    return BANNERS[int(n)]
