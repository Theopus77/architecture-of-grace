"""AOG-REL banners, units 1–12 — hand-built vector scenes for the World Religions course.
House style follows _work/eco/banners_eco_a.py: 1200x420, navy ground, warm gold light,
places, objects, texts and landscapes only; no lettering of any script; ids prefixed rlbN-."""
import random

HEAD = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" '
        'preserveAspectRatio="xMidYMid slice" role="img" aria-label="%s" focusable="false">')


def _svg(label, defs, body):
    return HEAD % label + '<defs>' + ''.join(defs) + '</defs>\n' + body.strip() + '\n</svg>'


def _stops(stops):
    out = ''
    for s in stops:
        a = '' if len(s) == 2 else ' stop-opacity="%s"' % s[2]
        out += '<stop offset="%s" stop-color="%s"%s/>' % (s[0], s[1], a)
    return out


def _lg(i, stops, x2=0, y2=1):
    return '<linearGradient id="%s" x1="0" y1="0" x2="%s" y2="%s">%s</linearGradient>' % (i, x2, y2, _stops(stops))


def _rg(i, stops):
    return '<radialGradient id="%s" cx="0.5" cy="0.5" r="0.5">%s</radialGradient>' % (i, _stops(stops))


def _glow(i, core='#FFF2C4', a=0.9):
    return _rg(i, [(0, core, a), (0.4, '#F2C273', round(a * 0.4, 2)), (1, '#F2C273', 0)])


def _stars(seed, n, x0, x1, y0, y1, op=0.6):
    r = random.Random(seed)
    c = ''.join('<circle cx="%d" cy="%d" r="%.1f"/>' % (r.randint(x0, x1), r.randint(y0, y1),
                r.choice([0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4])) for _ in range(n))
    return '<g fill="#F7EBD0" opacity="%s">%s</g>' % (op, c)


def _spines(seed, x0, x1, y, h):
    """A shelf of book spines standing on a plank at height y (one path per colour)."""
    r = random.Random(seed)
    cols = ['#1C3A62', '#2A4C78', '#7A3E2E', '#8A6A3A', '#2E5A4C', '#E4D2AC', '#5A4E36']
    d, x = {}, x0
    while x < x1 - 8:
        w = r.randint(12, 22)
        hh = r.randint(h - 16, h)
        c = r.choice(cols)
        d[c] = d.get(c, '') + 'M%d %dh%dv%dh-%dz' % (x, y - hh, w, hh, w)
        x += w + 1
    out = ''.join('<path d="%s" fill="%s"/>' % (v, c) for c, v in sorted(d.items()))
    return out + '<rect x="%d" y="%d" width="%d" height="6" fill="#142B4C"/>' % (x0 - 6, y, x1 - x0 + 12)


def _lines(x, y, w, n, gap=7, col='#9A7446', op=0.55, seed=0):
    """Plain ruled lines standing in for writing: shapes only, nothing legible."""
    r = random.Random(seed)
    d = ''.join('M%d %d h%d ' % (x, y + k * gap, w - r.randint(0, w // 4)) for k in range(n))
    return '<path d="%s" stroke="%s" stroke-width="1.6" opacity="%s" fill="none"/>' % (d.strip(), col, op)


def _windows(seed, x0, x1, y0, y1, step=16, p=0.6, col='#F6D98C', op=0.8):
    """Scattered lit windows, drawn as one compact path."""
    r = random.Random(seed)
    d = ''
    for y in range(y0, y1, step + 4):
        for x in range(x0, x1, step):
            if r.random() < p:
                d += 'M%d %dh6v9h-6z' % (x, y)
    return '<path d="%s" fill="%s" opacity="%s"/>' % (d or 'M0 0z', col, op)


BANNERS, CREDITS = {}, {}

# ───────────────────────── 1 · How to Read a Sacred Text ─────────────────────────
CREDITS[13] = ('Drawn scene: a lamplit reading room at night, a long table holding a stack of closed '
              'books, a rolled scroll, an open codex under a magnifying lens and a bound palm-leaf '
              'manuscript, with stars in the arched window behind')
_d = [_lg('rlb1-wall', [(0, '#0A1E33'), (0.6, '#0F2444'), (1, '#1C3A62')]),
      _lg('rlb1-sky', [(0, '#0A1E33'), (0.7, '#1C3A62'), (1, '#2A4C78')]),
      _lg('rlb1-table', [(0, '#C9A26A'), (0.12, '#9A7446'), (1, '#2E2012')]),
      _lg('rlb1-roll', [(0, '#FFF2C4'), (0.5, '#E4D2AC'), (1, '#9A7446')]),
      _glow('rlb1-lamp'),
      _glow('rlb1-lens', '#FFF2C4', 0.5)]
BANNERS[13] = _svg(CREDITS[13], _d, '''
<rect width="1200" height="420" fill="url(#rlb1-wall)"/>
<path d="M470 236 V120 A130 130 0 0 1 730 120 V236z" fill="url(#rlb1-sky)"/>
''' + _stars(101, 18, 492, 708, 60, 226, 0.7) + '''
<circle cx="660" cy="78" r="2" fill="#FFF2C4"/>
<g fill="none" stroke="#2A4C78" stroke-width="8"><path d="M470 236 V120 A130 130 0 0 1 730 120 V236z"/></g>
<g fill="#2A4C78"><rect x="597" y="-4" width="6" height="240"/><rect x="470" y="150" width="260" height="5"/><rect x="456" y="232" width="288" height="12"/></g>
<g>''' + _spines(11, 150, 380, 130, 48) + _spines(12, 150, 380, 220, 48) + '''</g>
<g>''' + _spines(14, 820, 1050, 130, 48) + _spines(15, 820, 1050, 220, 48) + '''</g>
<rect x="0" y="0" width="140" height="420" fill="#0A1E33" opacity=".55"/><rect x="1060" y="0" width="140" height="420" fill="#0A1E33" opacity=".55"/>
<ellipse cx="760" cy="250" rx="420" ry="170" fill="url(#rlb1-lamp)" opacity=".85"/>
<rect x="0" y="282" width="1200" height="138" fill="url(#rlb1-table)"/>
<rect x="0" y="282" width="1200" height="4" fill="#E4B860" opacity=".5"/>
<g><rect x="286" y="266" width="120" height="16" fill="#7A3E2E"/><rect x="292" y="250" width="110" height="16" fill="#2A4C78"/><rect x="284" y="236" width="116" height="14" fill="#E4D2AC"/><rect x="296" y="222" width="100" height="14" fill="#2E5A4C"/>
<g fill="#F7EBD0" opacity=".55"><rect x="402" y="268" width="3" height="12"/><rect x="398" y="252" width="3" height="12"/><rect x="396" y="238" width="3" height="10"/><rect x="392" y="224" width="3" height="10"/></g></g>
<g><rect x="424" y="276" width="120" height="30" rx="15" fill="url(#rlb1-roll)"/><path d="M470 306 q30 10 70 4 l4 -4" fill="#E4D2AC"/>
<rect x="414" y="286" width="12" height="10" rx="3" fill="#5A3A1E"/><rect x="542" y="286" width="12" height="10" rx="3" fill="#5A3A1E"/>
<ellipse cx="424" cy="291" rx="6" ry="15" fill="#C9A26A"/><path d="M454 276 v30 M510 276 v30" stroke="#7A3E2E" stroke-width="3"/></g>
<g><path d="M580 316 q-4 -30 4 -40 q46 -8 80 4 v40 q-40 -10 -84 -4z" fill="#F7EBD0"/><path d="M744 316 q4 -30 -4 -40 q-46 -8 -80 4 v40 q40 -10 84 -4z" fill="#EFE0BE"/>
<path d="M660 280 v40" stroke="#9A7446" stroke-width="1.5"/><path d="M576 318 q44 -8 84 6 q40 -14 88 -6 l2 6 q-46 -6 -90 8 q-44 -14 -86 -8z" fill="#7A3E2E"/>
''' + _lines(592, 288, 58, 4, 7, seed=1) + _lines(672, 288, 58, 4, 7, seed=2) + '''</g>
<g><circle cx="712" cy="296" r="30" fill="url(#rlb1-lens)"/><circle cx="712" cy="296" r="30" fill="#FFF2C4" opacity=".12"/><circle cx="712" cy="296" r="30" fill="none" stroke="#C9A26A" stroke-width="5"/>
<path d="M734 318 l40 30" stroke="#3A2A18" stroke-width="9" stroke-linecap="round"/><path d="M700 280 q8 -6 18 -4" stroke="#FFF2C4" stroke-width="2" fill="none" opacity=".7"/></g>
<g><ellipse cx="820" cy="282" rx="30" ry="6" fill="#3A2A18"/><path d="M800 280 q20 -26 40 0z" fill="#C9A26A"/><rect x="814" y="240" width="12" height="18" fill="#9A7446"/>
<path d="M808 240 q-4 -40 12 -58 q16 18 12 58z" fill="#FFF2C4" opacity=".35"/><path d="M820 230 q-6 -12 0 -24 q6 12 0 24z" fill="#F2C964"/><circle cx="820" cy="222" r="46" fill="url(#rlb1-lamp)"/></g>
<g><rect x="858" y="286" width="150" height="7" rx="2" fill="#5A3A1E"/><rect x="862" y="278" width="142" height="4" fill="#D8C08A"/><rect x="860" y="273" width="146" height="4" fill="#E4D2AC"/><rect x="864" y="268" width="140" height="4" fill="#CDB485"/><rect x="858" y="261" width="150" height="7" rx="2" fill="#5A3A1E"/>
<path d="M896 258 v38 M970 258 v38" stroke="#C4553D" stroke-width="2"/><circle cx="896" cy="262" r="3" fill="#C4553D"/><circle cx="970" cy="262" r="3" fill="#C4553D"/></g>
<path d="M0 396 H1200 V420 H0z" fill="#1E140A" opacity=".5"/>
''')

# ───────────────────────── 2 · The Hebrew Bible ─────────────────────────
CREDITS[14] = ('Drawn scene: a desert at dusk with a distant mountain under the first stars, dark tents '
              'lit from within across the sand, and the two wooden rollers of a Torah scroll in the '
              'foreground with the parchment shown as plain columns')
_d = [_lg('rlb2-sky', [(0, '#0A1E33'), (0.45, '#1C3A62'), (0.72, '#2A4C78'), (0.9, '#C99A5E'), (1, '#F2C273')]),
      _lg('rlb2-sand', [(0, '#9A7446'), (0.3, '#5A4228'), (1, '#1E140A')]),
      _lg('rlb2-parch', [(0, '#FFF2C4'), (1, '#E4D2AC')]),
      _lg('rlb2-roll', [(0, '#9A7446'), (0.4, '#F7EBD0'), (1, '#9A7446')], 1, 0),
      _lg('rlb2-wood', [(0, '#3A2A18'), (0.45, '#9A7446'), (1, '#3A2A18')], 1, 0),
      _glow('rlb2-dusk', '#FFF2C4', 0.8),
      _glow('rlb2-lamp', '#F2C964', 0.8)]
BANNERS[14] = _svg(CREDITS[14], _d, '''
<rect width="1200" height="420" fill="url(#rlb2-sky)"/>
''' + _stars(201, 60, 60, 1140, 8, 150, 0.7) + '''
<circle cx="760" cy="58" r="2.4" fill="#FFF2C4"/><circle cx="760" cy="58" r="10" fill="url(#rlb2-dusk)"/>
<ellipse cx="600" cy="252" rx="520" ry="80" fill="url(#rlb2-dusk)" opacity=".7"/>
<path d="M300 256 L420 196 L470 206 L540 170 L600 118 L636 142 L664 132 L730 190 L800 212 L900 256z" fill="#2A4C78" opacity=".9"/>
<path d="M540 170 L600 118 L636 142 L610 150 L580 144z" fill="#4A6A94" opacity=".6"/>
<path d="M0 256 L140 226 L240 244 L300 256z M880 256 L990 232 L1080 242 L1200 228 V256z" fill="#1C3A62"/>
<path d="M0 256 q300 -18 600 -2 q300 16 600 -8 V420 H0z" fill="url(#rlb2-sand)"/>
<path d="M0 300 q200 -24 420 -4 q180 16 380 -6 q200 -18 400 4" stroke="#C9A26A" stroke-width="2" fill="none" opacity=".35"/>
<g><path d="M248 276 l22 -30 h108 l22 30z" fill="#0A1E33"/><path d="M270 246 l54 -10 l54 10" stroke="#0A1E33" stroke-width="3" fill="none"/>
<path d="M312 276 v-20 h26 v20z" fill="#F2C964" opacity=".9"/><circle cx="325" cy="266" r="36" fill="url(#rlb2-lamp)"/>
<path d="M248 276 l-22 10 M400 276 l22 10" stroke="#0A1E33" stroke-width="1.5"/></g>
<g><path d="M150 284 l16 -22 h76 l16 22z" fill="#0F2444"/><path d="M190 284 v-12 h16 v12z" fill="#F2C964" opacity=".7"/></g>
<g><path d="M820 280 l22 -30 h112 l22 30z" fill="#0A1E33"/><path d="M842 250 l56 -10 l56 10" stroke="#0A1E33" stroke-width="3" fill="none"/>
<path d="M884 280 v-20 h26 v20z" fill="#F2C964" opacity=".9"/><circle cx="897" cy="270" r="36" fill="url(#rlb2-lamp)"/>
<path d="M820 280 l-22 10 M976 280 l22 10" stroke="#0A1E33" stroke-width="1.5"/></g>
<g><path d="M984 290 l14 -20 h66 l14 20z" fill="#0F2444"/><path d="M1020 290 v-12 h14 v12z" fill="#F2C964" opacity=".6"/></g>
<ellipse cx="600" cy="360" rx="260" ry="90" fill="url(#rlb2-dusk)" opacity=".35"/>
<g><rect x="524" y="300" width="152" height="112" fill="url(#rlb2-parch)"/>
<g fill="none" stroke="#9A7446" stroke-width="1.4" opacity=".45"><path d="M536 312 h36 M536 320 h36 M536 328 h36 M536 336 h36 M536 344 h36 M536 352 h36 M536 360 h36 M536 368 h36 M536 376 h36 M536 384 h36 M536 392 h36"/>
<path d="M582 312 h36 M582 320 h36 M582 328 h36 M582 336 h36 M582 344 h36 M582 352 h36 M582 360 h36 M582 368 h36 M582 376 h36 M582 384 h36 M582 392 h36"/>
<path d="M628 312 h36 M628 320 h36 M628 328 h36 M628 336 h36 M628 344 h36 M628 352 h36 M628 360 h36 M628 368 h36 M628 376 h36 M628 384 h36 M628 392 h36"/></g></g>
<g><rect x="488" y="296" width="40" height="124" rx="10" fill="url(#rlb2-roll)"/><rect x="672" y="296" width="40" height="124" rx="10" fill="url(#rlb2-roll)"/>
<rect x="502" y="262" width="12" height="36" fill="url(#rlb2-wood)"/><rect x="686" y="262" width="12" height="36" fill="url(#rlb2-wood)"/>
<ellipse cx="508" cy="296" rx="30" ry="7" fill="#5A3A1E"/><ellipse cx="692" cy="296" rx="30" ry="7" fill="#5A3A1E"/>
<ellipse cx="508" cy="293" rx="30" ry="6" fill="#9A7446"/><ellipse cx="692" cy="293" rx="30" ry="6" fill="#9A7446"/>
<ellipse cx="508" cy="262" rx="9" ry="6" fill="#C9A26A"/><ellipse cx="692" cy="262" rx="9" ry="6" fill="#C9A26A"/>
<path d="M496 310 v96 M680 310 v96" stroke="#FFF2C4" stroke-width="3" opacity=".5"/></g>
<path d="M0 404 H1200 V420 H0z" fill="#0A0A0A" opacity=".35"/>
''')

# ───────────────────────── 3 · The New Testament ─────────────────────────
CREDITS[15] = ('Drawn scene: a lakeshore in Galilee at evening, two wooden fishing boats drawn up on '
              'the stones with nets drying, and a road winding up to a small hill town with lit windows')
_d = [_lg('rlb3-sky', [(0, '#0A1E33'), (0.5, '#1C3A62'), (0.85, '#C99A5E'), (1, '#F2C273')]),
      _lg('rlb3-lake', [(0, '#C99A5E'), (0.12, '#2A4C78'), (1, '#0F2444')]),
      _lg('rlb3-shore', [(0, '#5A4E36'), (1, '#1E140A')]),
      _lg('rlb3-hull', [(0, '#C9A26A'), (0.5, '#7A5430'), (1, '#3A2A18')]),
      _glow('rlb3-sun', '#FFF2C4', 0.9),
      _glow('rlb3-lamp', '#F2C964', 0.8)]
_town = ''.join('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (x, y, w, h, c) for x, y, w, h, c in [
    (736, 170, 30, 22, '#C9B48A'), (768, 162, 26, 30, '#E4D2AC'), (796, 168, 34, 24, '#B8A27A'),
    (752, 150, 22, 20, '#E4D2AC'), (778, 142, 30, 22, '#C9B48A'), (810, 150, 24, 20, '#B8A27A'),
    (790, 126, 20, 18, '#E4D2AC'), (834, 176, 28, 20, '#C9B48A'), (714, 182, 24, 16, '#B8A27A')])
BANNERS[15] = _svg(CREDITS[15], _d, '''
<rect width="1200" height="240" fill="url(#rlb3-sky)"/>
''' + _stars(301, 30, 40, 1160, 6, 110, 0.55) + '''
<circle cx="420" cy="228" r="80" fill="url(#rlb3-sun)" opacity=".8"/>
<path d="M0 236 q120 -30 240 -18 q140 -22 260 -4 q120 -16 200 6 H0z" fill="#2A4C78" opacity=".8"/>
<rect x="0" y="232" width="1200" height="110" fill="url(#rlb3-lake)"/>
<g stroke="#F2C964" stroke-width="2" opacity=".5"><path d="M380 250 h80 M390 262 h56 M370 276 h96 M400 290 h40 M384 306 h70"/></g>
<g stroke="#F7EBD0" stroke-width="1" opacity=".2"><path d="M80 270 h60 M180 300 h80 M560 280 h70 M620 318 h90 M1040 290 h70"/></g>
<path d="M640 240 q80 -120 200 -126 q120 10 200 80 q60 30 160 40 V300 H640z" fill="#1C3A62"/>
<path d="M680 240 q70 -90 160 -100 q100 6 170 74 q40 20 70 26z" fill="#142B4C"/>
''' + _town + '''
<g fill="#7A6A4A" opacity=".8"><path d="M736 170 h30 v2 h-30z M768 162 h26 v2 h-26z M796 168 h34 v2 h-34z M752 150 h22 v2 h-22z M778 142 h30 v2 h-30z M810 150 h24 v2 h-24z M790 126 h20 v2 h-20z"/></g>
<g fill="#F2C964"><rect x="744" y="178" width="6" height="7"/><rect x="776" y="172" width="6" height="8"/><rect x="808" y="176" width="6" height="7"/><rect x="760" y="156" width="5" height="7"/><rect x="788" y="150" width="6" height="7"/><rect x="818" y="156" width="5" height="7"/><rect x="797" y="132" width="5" height="6"/><rect x="842" y="182" width="6" height="7"/><rect x="722" y="186" width="5" height="6"/></g>
<circle cx="784" cy="164" r="60" fill="url(#rlb3-lamp)" opacity=".7"/>
<g fill="#0F2444"><path d="M870 150 q-6 -30 4 -44 q8 14 4 44z"/><path d="M890 162 q-6 -24 4 -36 q8 12 4 36z"/></g>
<path d="M0 340 q300 -20 640 -10 q300 -10 560 0 V420 H0z" fill="url(#rlb3-shore)"/>
<path d="M680 420 q-20 -40 40 -72 q70 -30 30 -70 q-30 -24 40 -60 q30 -12 20 -30" stroke="#E4D2AC" stroke-width="10" fill="none" opacity=".35" stroke-linecap="round"/>
<path d="M680 420 q-20 -40 40 -72 q70 -30 30 -70 q-30 -24 40 -60 q30 -12 20 -30" stroke="#E4D2AC" stroke-width="3" fill="none" opacity=".5" stroke-dasharray="6 8"/>
<g fill="#3A2E20">''' + ''.join('<ellipse cx="%d" cy="%d" rx="%d" ry="%d"/>' % (x, y, rx, ry) for x, y, rx, ry in random.Random(31).sample([(x, y, rx, ry) for x in range(10, 1200, 46) for y in (352, 372, 396) for rx in (14,) for ry in (6,)], 26)) + '''</g>
<g fill="#6A5A40" opacity=".6">''' + ''.join('<ellipse cx="%d" cy="%d" rx="10" ry="4"/>' % (x, y) for x, y in random.Random(32).sample([(x, y) for x in range(20, 1200, 38) for y in (348, 366, 388, 408)], 20)) + '''</g>
<g><path d="M300 362 q80 26 200 6 l30 -34 q-120 16 -250 6z" fill="url(#rlb3-hull)"/><path d="M280 340 q130 10 250 -6" stroke="#E4D2AC" stroke-width="3" fill="none" opacity=".6"/>
<path d="M400 344 v-104" stroke="#3A2A18" stroke-width="5"/><path d="M400 250 l-60 86" stroke="#3A2A18" stroke-width="1.5"/>
<path d="M320 342 q30 20 60 2 q10 24 30 18" stroke="#C9B48A" stroke-width="1.5" fill="none" opacity=".6"/></g>
<g><path d="M520 384 q70 22 170 2 l22 -28 q-100 14 -210 4z" fill="url(#rlb3-hull)"/><path d="M500 362 q110 8 212 -4" stroke="#E4D2AC" stroke-width="3" fill="none" opacity=".6"/></g>
<g stroke="#C9B48A" stroke-width="1" opacity=".55" fill="none"><path d="M200 300 v60 M214 300 v60 M228 300 v60 M242 300 v60 M256 300 v60 M200 312 h56 M200 326 h56 M200 340 h56 M200 354 h56"/></g>
<path d="M190 300 v68 M266 300 v68 M186 300 h84" stroke="#3A2A18" stroke-width="4"/>
<path d="M870 380 v-56" stroke="#3A2A18" stroke-width="4"/><rect x="862" y="310" width="16" height="16" fill="#F2C964"/><circle cx="870" cy="318" r="46" fill="url(#rlb3-lamp)"/>
<path d="M0 408 H1200 V420 H0z" fill="#050A14" opacity=".5"/>
''')

# ───────────────────────── 4 · Judaism ─────────────────────────
CREDITS[16] = ('Drawn scene: a Sabbath table at dusk with two lit candles, a loaf of challah under an '
              'embroidered cover and a cup, and through the window the rooftops of a city at sunset')
_d = [_lg('rlb4-wall', [(0, '#0A1E33'), (0.6, '#0F2444'), (1, '#1C3A62')]),
      _lg('rlb4-sky', [(0, '#1C3A62'), (0.45, '#2A4C78'), (0.8, '#C99A5E'), (1, '#F2C273')]),
      _lg('rlb4-cloth', [(0, '#FFF2C4'), (0.15, '#F7EBD0'), (1, '#8A7650')]),
      _lg('rlb4-cup', [(0, '#9A7446'), (0.4, '#FFF2C4'), (1, '#8A6A3A')], 1, 0),
      _lg('rlb4-cover', [(0, '#2A4C78'), (1, '#1C3A62')]),
      _glow('rlb4-flame', '#FFF2C4', 0.95)]
_roofs = ('<path d="M420 236 V190 h40 v-14 h30 v14 h24 v-26 l20 -14 l20 14 v26 h36 v-20 h44 v20 h30 v-34 h40 v34 h28 v-12 h34 V236z" fill="#142B4C"/>'
          '<path d="M540 156 v-14 M704 156 v-16 h6 v16" stroke="#142B4C" stroke-width="3"/>')
BANNERS[16] = _svg(CREDITS[16], _d, '''
<rect width="1200" height="420" fill="url(#rlb4-wall)"/>
<g stroke="#0A1E33" stroke-width="1" opacity=".35"><path d="M0 60 H1200 M0 140 H1200 M0 220 H1200"/></g>
<rect x="420" y="40" width="360" height="196" fill="url(#rlb4-sky)"/>
''' + _stars(401, 14, 430, 770, 48, 110, 0.55) + _roofs + '''
''' + _windows(41, 428, 776, 196, 232, 18, 0.35, '#F6D98C', 0.85) + '''
<g fill="#2A4C78"><rect x="410" y="32" width="380" height="8"/><rect x="410" y="32" width="10" height="214"/><rect x="780" y="32" width="10" height="214"/><rect x="400" y="236" width="400" height="12"/><rect x="596" y="40" width="8" height="196"/></g>
<rect x="0" y="0" width="130" height="420" fill="#0A1E33" opacity=".5"/><rect x="1070" y="0" width="130" height="420" fill="#0A1E33" opacity=".5"/>
<g fill="#1C3A62"><rect x="200" y="110" width="110" height="90" rx="3"/></g><rect x="210" y="120" width="90" height="70" fill="#2A4C78"/><path d="M210 190 l30 -30 l20 18 l16 -12 l24 24z" fill="#142B4C"/>
<g fill="#1C3A62"><rect x="880" y="96" width="150" height="8"/><rect x="890" y="52" width="14" height="44"/><rect x="906" y="60" width="12" height="36"/><rect x="920" y="56" width="16" height="40"/><path d="M944 96 l20 -40 l10 4 l-18 36z"/></g>
<ellipse cx="560" cy="250" rx="420" ry="190" fill="url(#rlb4-flame)" opacity=".55"/>
<path d="M0 282 H1200 V420 H0z" fill="url(#rlb4-cloth)"/>
<path d="M0 282 H1200" stroke="#FFF2C4" stroke-width="3" opacity=".6"/>
<g stroke="#C9B48A" stroke-width="1" opacity=".4"><path d="M120 300 v120 M1080 300 v120"/></g>
<g><ellipse cx="480" cy="306" rx="26" ry="6" fill="#8A6A3A"/><path d="M466 306 q14 -8 28 0 l-6 -16 h-16z" fill="url(#rlb4-cup)"/><rect x="474" y="238" width="12" height="54" fill="url(#rlb4-cup)"/><ellipse cx="480" cy="238" rx="14" ry="4" fill="#C9A26A"/>
<rect x="475" y="186" width="10" height="50" fill="#F7EBD0"/><path d="M480 186 v-6" stroke="#3A2A18" stroke-width="1.5"/><path d="M480 182 q-8 -12 0 -28 q8 16 0 28z" fill="#F2C964"/><path d="M480 178 q-3 -6 0 -14 q3 8 0 14z" fill="#FFF2C4"/>
<circle cx="480" cy="170" r="54" fill="url(#rlb4-flame)"/></g>
<g><ellipse cx="560" cy="306" rx="26" ry="6" fill="#8A6A3A"/><path d="M546 306 q14 -8 28 0 l-6 -16 h-16z" fill="url(#rlb4-cup)"/><rect x="554" y="238" width="12" height="54" fill="url(#rlb4-cup)"/><ellipse cx="560" cy="238" rx="14" ry="4" fill="#C9A26A"/>
<rect x="555" y="186" width="10" height="50" fill="#F7EBD0"/><path d="M560 186 v-6" stroke="#3A2A18" stroke-width="1.5"/><path d="M560 182 q-8 -12 0 -28 q8 16 0 28z" fill="#F2C964"/><path d="M560 178 q-3 -6 0 -14 q3 8 0 14z" fill="#FFF2C4"/>
<circle cx="560" cy="170" r="54" fill="url(#rlb4-flame)"/></g>
<g><ellipse cx="700" cy="332" rx="110" ry="14" fill="#5A4E36" opacity=".5"/><ellipse cx="700" cy="324" rx="100" ry="12" fill="#C9B48A"/>
<path d="M608 326 q-6 -56 92 -62 q98 6 92 62 q-4 8 -12 6 q-80 -14 -160 0 q-10 2 -12 -6z" fill="url(#rlb4-cover)"/>
<path d="M610 316 q90 -16 180 0" stroke="#F2C273" stroke-width="3" fill="none"/><path d="M614 306 q86 -14 172 0" stroke="#F2C273" stroke-width="1.2" fill="none" opacity=".8"/>
<g fill="#F2C273" opacity=".85"><circle cx="640" cy="311" r="2"/><circle cx="670" cy="308" r="2"/><circle cx="700" cy="307" r="2"/><circle cx="730" cy="308" r="2"/><circle cx="760" cy="311" r="2"/></g>
<path d="M620 334 v10 M640 332 v10 M660 331 v10 M680 330 v10 M720 330 v10 M740 331 v10 M760 332 v10 M780 334 v10" stroke="#F2C273" stroke-width="1.5" opacity=".7"/>
<path d="M660 282 q40 -10 80 0" stroke="#FFF2C4" stroke-width="2" fill="none" opacity=".3"/></g>
<g><ellipse cx="850" cy="324" rx="24" ry="6" fill="#8A6A3A"/><path d="M834 324 q16 -10 32 0 l-10 -8 h-12z" fill="url(#rlb4-cup)"/><rect x="846" y="290" width="8" height="28" fill="url(#rlb4-cup)"/>
<path d="M822 244 h56 q-2 40 -28 48 q-26 -8 -28 -48z" fill="url(#rlb4-cup)"/><ellipse cx="850" cy="244" rx="28" ry="5" fill="#7A3E2E"/><path d="M830 256 h40" stroke="#8A6A3A" stroke-width="1.5" opacity=".7"/></g>
<path d="M0 404 H1200 V420 H0z" fill="#3A2A18" opacity=".4"/>
''')

# ───────────────────────── 5 · Islam ─────────────────────────
CREDITS[17] = ('Drawn scene: an empty mosque courtyard at dusk, a row of pointed arches lit from within, '
              'a fountain for washing at the center, a dome and a minaret against the gold sky and a '
              'crescent moon high above')
_d = [_lg('rlb5-sky', [(0, '#0A1E33'), (0.35, '#1C3A62'), (0.7, '#C99A5E'), (1, '#F2C273')]),
      _lg('rlb5-stone', [(0, '#F7EBD0'), (1, '#A08C64')]),
      _lg('rlb5-floor', [(0, '#8A7650'), (1, '#2E2418')]),
      _lg('rlb5-tower', [(0, '#A08C64'), (0.4, '#F7EBD0'), (1, '#8A7650')], 1, 0),
      _lg('rlb5-water', [(0, '#4A6A94'), (1, '#1C3A62')]),
      _glow('rlb5-lit', '#FFF2C4', 0.9)]
_arches = ''
for _x in range(222, 980, 76):
    _arches += ('<path d="M%d 318 V262 Q%d 226 %d 214 Q%d 226 %d 262 V318z" fill="#3A2A18"/>'
                '<path d="M%d 318 V266 Q%d 236 %d 226 Q%d 236 %d 266 V318z" fill="#F2C964" opacity=".45"/>'
                '<path d="M%d 214 v18" stroke="#8A6A3A" stroke-width="1.2"/><path d="M%d 232 h8 l-2 10 h-4z" fill="#FFF2C4"/>'
                % (_x, _x, _x + 26, _x + 52, _x + 52, _x + 6, _x + 6, _x + 26, _x + 46, _x + 46, _x + 26, _x + 22))
BANNERS[17] = _svg(CREDITS[17], _d, '''
<rect width="1200" height="420" fill="url(#rlb5-sky)"/>
''' + _stars(501, 22, 40, 1160, 6, 90, 0.55) + '''
<path d="M394 38 A32 32 0 1 0 394 102 A40 40 0 0 1 394 38z" fill="#FFF2C4"/><circle cx="380" cy="70" r="60" fill="url(#rlb5-lit)" opacity=".35"/>
<path d="M0 210 h60 v-30 h40 v30 h60 v-16 h50 V220 H0z M1000 220 v-22 h50 v-24 h40 v24 h110 V220z" fill="#1C3A62" opacity=".7"/>
<g><rect x="494" y="150" width="172" height="50" fill="#C9B48A"/><path d="M500 152 q0 -84 80 -90 q80 6 80 90z" fill="url(#rlb5-stone)"/><path d="M580 62 v-14" stroke="#C9A26A" stroke-width="3"/><circle cx="580" cy="46" r="4" fill="#F2C273"/>
<g fill="#5A4E36" opacity=".6"><rect x="512" y="164" width="8" height="18" rx="4"/><rect x="540" y="164" width="8" height="18" rx="4"/><rect x="568" y="164" width="8" height="18" rx="4"/><rect x="596" y="164" width="8" height="18" rx="4"/><rect x="624" y="164" width="8" height="18" rx="4"/><rect x="648" y="164" width="8" height="18" rx="4"/></g></g>
<g><rect x="790" y="96" width="30" height="190" fill="url(#rlb5-tower)"/><rect x="782" y="150" width="46" height="8" fill="#C9B48A"/><path d="M782 158 l8 10 h30 l8 -10z" fill="#8A7650"/>
<rect x="796" y="70" width="18" height="30" fill="url(#rlb5-tower)"/><rect x="790" y="96" width="30" height="5" fill="#C9B48A"/><path d="M794 72 L805 34 L816 72z" fill="#8A7650"/><path d="M805 34 v-12" stroke="#C9A26A" stroke-width="2"/><circle cx="805" cy="20" r="3" fill="#F2C273"/>
<rect x="798" y="112" width="6" height="16" rx="3" fill="#F2C964" opacity=".8"/><rect x="806" y="206" width="6" height="16" rx="3" fill="#F2C964" opacity=".6"/></g>
<rect x="200" y="200" width="800" height="120" fill="url(#rlb5-stone)"/>
<rect x="196" y="196" width="808" height="10" fill="#E4D2AC"/><path d="M200 206 H1000" stroke="#8A7650" stroke-width="2"/>
''' + _arches + '''
<rect x="0" y="210" width="200" height="110" fill="#8A7650" opacity=".6"/><rect x="1000" y="210" width="200" height="110" fill="#8A7650" opacity=".6"/>
<ellipse cx="600" cy="280" rx="420" ry="80" fill="url(#rlb5-lit)" opacity=".4"/>
<rect x="0" y="318" width="1200" height="102" fill="url(#rlb5-floor)"/>
<g stroke="#C9B48A" stroke-width="1" opacity=".3" fill="none"><path d="M0 340 H1200 M0 368 H1200 M0 400 H1200 M600 318 L200 420 M600 318 L420 420 M600 318 L780 420 M600 318 L1000 420 M600 318 L60 420 M600 318 L1140 420"/></g>
<g><ellipse cx="600" cy="376" rx="104" ry="18" fill="#3A2E20"/><path d="M496 350 h208 v24 q-104 20 -208 0z" fill="url(#rlb5-stone)"/><ellipse cx="600" cy="350" rx="104" ry="16" fill="#C9B48A"/><ellipse cx="600" cy="350" rx="94" ry="12" fill="url(#rlb5-water)"/>
<path d="M530 346 q20 -6 40 0 M630 352 q20 -6 40 0" stroke="#FFF2C4" stroke-width="1.2" fill="none" opacity=".5"/>
<rect x="590" y="306" width="20" height="44" fill="url(#rlb5-tower)"/><ellipse cx="600" cy="306" rx="22" ry="6" fill="#E4D2AC"/><path d="M596 300 q4 -10 8 0" fill="#C9B48A"/>
<g stroke="#FFF2C4" stroke-width="1.6" fill="none" opacity=".7"><path d="M590 312 q-18 4 -24 30 M610 312 q18 4 24 30 M596 300 q-2 -8 4 -12 q6 4 4 12"/></g>
<g fill="#8A6A3A"><rect x="518" y="364" width="6" height="8"/><rect x="552" y="368" width="6" height="8"/><rect x="590" y="370" width="6" height="8"/><rect x="628" y="369" width="6" height="8"/><rect x="664" y="366" width="6" height="8"/></g></g>
<path d="M0 408 H1200 V420 H0z" fill="#050A14" opacity=".5"/>
''')

# ───────────────────────── 6 · Hinduism ─────────────────────────
CREDITS[18] = ('Drawn scene: stone river steps at dawn with small oil lamps floating on the water, '
              'shade umbrellas on the ghats and a curved temple tower rising behind')
_d = [_lg('rlb6-sky', [(0, '#0F2444'), (0.45, '#2A4C78'), (0.8, '#C99A5E'), (1, '#F2C273')]),
      _lg('rlb6-steps', [(0, '#C9B48A'), (1, '#6A5A40')]),
      _lg('rlb6-river', [(0, '#6A7FA0'), (0.2, '#2A4C78'), (1, '#0F2444')]),
      _lg('rlb6-tower', [(0, '#8A7650'), (0.4, '#F7EBD0'), (1, '#8A7650')], 1, 0),
      _glow('rlb6-dawn', '#FFF2C4', 0.85),
      _glow('rlb6-lamp', '#F2C964', 0.9)]
_steps = ''.join('<rect x="0" y="%d" width="1200" height="8" fill="%s"/>' % (y, c) for y, c in
                 zip(range(240, 312, 8), ['#E4D2AC', '#C9B48A', '#D8C49A', '#B8A27A', '#C9B48A', '#A89670', '#B8A27A', '#8A7650', '#9A8660']))
_diyas = ''
for _x, _y, _s in [(300, 344, 1), (540, 378, 1.2), (620, 352, 1), (700, 370, 1.1),
                   (770, 344, .9), (850, 364, 1), (440, 396, 1.3), (660, 400, 1.3)]:
    _diyas += ('<g transform="translate(%d %d) scale(%s)"><path d="M-10 0 q10 8 20 0 q-10 -4 -20 0z" fill="#9A7446"/>'
               '<path d="M-7 -1 q7 4 14 0" stroke="#2E5A4C" stroke-width="2" fill="none"/>'
               '<path d="M0 -2 q-4 -6 0 -12 q4 6 0 12z" fill="#F2C964"/><circle cx="0" cy="-7" r="16" fill="url(#rlb6-lamp)"/>'
               '<path d="M-2 4 v14 M2 6 v10" stroke="#F2C964" stroke-width="1.5" opacity=".45"/></g>' % (_x, _y, _s))
BANNERS[18] = _svg(CREDITS[18], _d, '''
<rect width="1200" height="420" fill="url(#rlb6-sky)"/>
''' + _stars(601, 8, 40, 1160, 6, 70, 0.45) + '''
<ellipse cx="600" cy="240" rx="560" ry="120" fill="url(#rlb6-dawn)" opacity=".6"/>
<g fill="#1C3A62"><rect x="80" y="176" width="100" height="70"/><rect x="190" y="150" width="80" height="96"/><rect x="930" y="160" width="90" height="86"/><rect x="1030" y="184" width="110" height="62"/><rect x="286" y="190" width="120" height="56"/><rect x="800" y="186" width="110" height="60"/></g>
''' + _windows(61, 90, 1140, 164, 240, 26, 0.18, '#F6D98C', 0.7) + '''
<g><rect x="470" y="196" width="80" height="50" fill="#B8A27A"/><path d="M462 198 l48 -34 l48 34z" fill="#A08C64"/><rect x="498" y="210" width="24" height="36" fill="#3A2A18"/><path d="M500 246 v-26 q10 -10 20 0 v26z" fill="#F2C964" opacity=".6"/>
<path d="M552 246 V196 C552 150 566 104 612 70 C658 104 672 150 672 196 V246z" fill="url(#rlb6-tower)"/>
<g stroke="#8A7650" stroke-width="1.5" fill="none" opacity=".7"><path d="M556 226 h112 M556 206 h112 M558 186 h108 M562 166 h100 M568 146 h88 M576 126 h72 M586 106 h52 M598 88 h28"/><path d="M612 70 V246 M584 90 C570 130 566 180 568 246 M640 90 C654 130 658 180 656 246"/></g>
<ellipse cx="612" cy="68" rx="22" ry="7" fill="#C9B48A"/><g stroke="#8A7650" stroke-width="1"><path d="M596 64 v8 M604 62 v10 M612 61 v11 M620 62 v10 M628 64 v8"/></g>
<path d="M606 62 q6 -18 12 0z" fill="#F2C273"/><path d="M612 50 v-26" stroke="#5A3A1E" stroke-width="2"/><path d="M613 24 l22 6 l-22 6z" fill="#E08A3C"/>
<rect x="672" y="204" width="70" height="42" fill="#B8A27A"/><path d="M664 206 l43 -28 l43 28z" fill="#A08C64"/></g>
''' + _steps + '''
<g stroke="#5A4E36" stroke-width="1" opacity=".5"><path d="M160 240 v72 M420 240 v72 M760 240 v72 M1040 240 v72"/></g>
<g><path d="M260 250 v-30" stroke="#3A2A18" stroke-width="2.5"/><path d="M226 222 q34 -26 68 0z" fill="#8A6A3A"/><path d="M226 222 q34 -8 68 0" stroke="#E4D2AC" stroke-width="1" fill="none"/>
<path d="M370 256 v-30" stroke="#3A2A18" stroke-width="2.5"/><path d="M336 228 q34 -26 68 0z" fill="#7A5430"/>
<path d="M860 254 v-30" stroke="#3A2A18" stroke-width="2.5"/><path d="M826 226 q34 -26 68 0z" fill="#8A6A3A"/><path d="M826 226 q34 -8 68 0" stroke="#E4D2AC" stroke-width="1" fill="none"/>
<path d="M960 250 v-30" stroke="#3A2A18" stroke-width="2.5"/><path d="M926 222 q34 -26 68 0z" fill="#7A5430"/></g>
<g fill="#0A1E33"><circle cx="330" cy="264" r="4"/><path d="M325 282 q0 -12 5 -14 q5 2 5 14z"/><circle cx="900" cy="258" r="4"/><path d="M895 276 q0 -12 5 -14 q5 2 5 14z"/></g>
<rect x="0" y="312" width="1200" height="108" fill="url(#rlb6-river)"/>
<g stroke="#F2C964" stroke-width="2" opacity=".35"><path d="M560 322 h100 M580 334 h60 M540 350 h140" /></g>
<g stroke="#F7EBD0" stroke-width="1" opacity=".2"><path d="M60 330 h80 M120 390 h90 M980 330 h70 M1020 380 h90"/></g>
''' + _diyas + '''
<path d="M40 330 q30 10 80 6 l10 -8 q-50 4 -90 2z" fill="#3A2A18"/><path d="M1080 340 q40 12 90 4 l10 -10 q-50 6 -100 6z" fill="#3A2A18"/>
<path d="M0 408 H1200 V420 H0z" fill="#050A14" opacity=".4"/>
''')

# ───────────────────────── 7 · Buddhism ─────────────────────────
CREDITS[19] = ('Drawn scene: a quiet monastery on a hillside at evening with lamplit windows, a bronze '
              'bell hanging under a small roofed frame and a broad bodhi tree with heart-shaped leaves')
_d = [_lg('rlb7-sky', [(0, '#0A1E33'), (0.5, '#1C3A62'), (0.85, '#C99A5E'), (1, '#F2C273')]),
      _lg('rlb7-hill', [(0, '#1C3A62'), (1, '#0A1E33')]),
      _lg('rlb7-bell', [(0, '#6A4A26'), (0.35, '#F2C273'), (1, '#5A3A1E')], 1, 0),
      _lg('rlb7-wall', [(0, '#E4D2AC'), (1, '#A08C64')]),
      _glow('rlb7-lit', '#FFF2C4', 0.85)]
_lv = {}
_r = random.Random(71)
for _k in range(80):
    _x = _r.randint(760, 1050); _y = _r.randint(70, 210)
    if ((_x - 905) / 150.0) ** 2 + ((_y - 140) / 75.0) ** 2 > 1:
        continue
    _c = _r.choice(['#2E5A4C', '#3A6A56', '#24483E', '#4A7A5E'])
    _t = _r.choice(['c-9 -8 -13 8 0 18v6v-6c13 -10 9 -26 0 -18z', 'c-11 -6 -11 10 3 18l2 6l-2 -6c11 -12 5 -26 -3 -18z',
                    'c-5 -10 -13 6 -3 18l-2 6l2 -6c15 -8 13 -24 3 -18z'])
    _lv[_c] = _lv.get(_c, '') + 'M%d %d%s' % (_x, _y, _t)
_leaves = ''.join('<path d="%s" fill="%s"/>' % (v, c) for c, v in sorted(_lv.items()))
BANNERS[19] = _svg(CREDITS[19], _d, '''
<rect width="1200" height="420" fill="url(#rlb7-sky)"/>
''' + _stars(701, 26, 40, 1160, 6, 120, 0.6) + '''
<ellipse cx="520" cy="250" rx="500" ry="110" fill="url(#rlb7-lit)" opacity=".4"/>
<path d="M0 260 q200 -50 360 -40 q140 -80 300 -100 q200 20 320 90 q120 30 220 30 V420 H0z" fill="#1C3A62" opacity=".75"/>
<path d="M0 300 q180 -30 380 -40 q120 -80 260 -96 q180 14 300 80 q160 50 260 60 V420 H0z" fill="url(#rlb7-hill)"/>
<g><rect x="510" y="150" width="200" height="50" fill="url(#rlb7-wall)"/><path d="M488 154 q20 -4 34 -20 h176 q14 16 34 20 q-122 6 -244 0z" fill="#5A3A1E"/>
<rect x="540" y="112" width="140" height="24" fill="url(#rlb7-wall)"/><path d="M522 116 q16 -4 28 -16 h120 q12 12 28 16 q-88 6 -176 0z" fill="#5A3A1E"/><path d="M610 100 v-12" stroke="#C9A26A" stroke-width="3"/><circle cx="610" cy="86" r="3" fill="#F2C273"/>
<g fill="#F2C964"><rect x="530" y="164" width="12" height="22"/><rect x="560" y="164" width="12" height="22"/><rect x="648" y="164" width="12" height="22"/><rect x="678" y="164" width="12" height="22"/><rect x="560" y="118" width="10" height="12"/><rect x="650" y="118" width="10" height="12"/></g>
<rect x="596" y="166" width="28" height="34" fill="#7A3E2E"/><path d="M596 200 v-34 h28 v34" stroke="#F2C273" stroke-width="1.5" fill="none"/>
<circle cx="610" cy="170" r="90" fill="url(#rlb7-lit)" opacity=".5"/>
<rect x="720" y="172" width="70" height="36" fill="url(#rlb7-wall)"/><path d="M710 176 q14 -4 22 -14 h46 q8 10 22 14 q-45 5 -90 0z" fill="#5A3A1E"/><rect x="746" y="182" width="10" height="16" fill="#F2C964"/>
<rect x="440" y="180" width="60" height="30" fill="url(#rlb7-wall)"/><path d="M430 184 q14 -4 22 -12 h36 q8 8 22 12 q-40 5 -80 0z" fill="#5A3A1E"/><rect x="464" y="188" width="10" height="14" fill="#F2C964"/></g>
<path d="M600 200 q-40 24 0 50 q50 26 -30 54 q-60 26 0 56 q30 30 20 60" stroke="#E4D2AC" stroke-width="5" fill="none" opacity=".3" stroke-dasharray="4 6"/>
<g><path d="M330 244 l84 -20 l84 20 q-84 -8 -168 0z" fill="#5A3A1E"/><path d="M322 246 q92 -10 184 0" stroke="#7A5430" stroke-width="4" fill="none"/>
<rect x="344" y="244" width="8" height="98" fill="#3A2A18"/><rect x="476" y="244" width="8" height="98" fill="#3A2A18"/><rect x="340" y="252" width="148" height="6" fill="#3A2A18"/>
<path d="M414 258 v8" stroke="#3A2A18" stroke-width="3"/><path d="M392 270 q0 -8 22 -8 q22 0 22 8 v42 q6 4 6 10 h-56 q0 -6 6 -10z" fill="url(#rlb7-bell)"/>
<g stroke="#5A3A1E" stroke-width="1.2" fill="none" opacity=".7"><path d="M394 282 h40 M394 298 h40"/></g><circle cx="414" cy="306" r="5" fill="none" stroke="#5A3A1E" stroke-width="1.5"/>
<path d="M436 276 h36" stroke="#8A6A3A" stroke-width="6" stroke-linecap="round"/><path d="M450 258 v18 M466 258 v18" stroke="#3A2A18" stroke-width="1"/>
<rect x="330" y="340" width="168" height="10" fill="#5A4E36"/><circle cx="414" cy="290" r="60" fill="url(#rlb7-lit)" opacity=".35"/></g>
<g><path d="M890 350 q6 -60 -2 -110 q-24 -30 -60 -46 M896 250 q24 -30 70 -40 M892 230 q-6 -40 20 -80 M880 244 q-40 -10 -60 -40" stroke="#3A2A18" stroke-width="12" fill="none" stroke-linecap="round"/>
<path d="M866 360 q20 -18 22 -120 h14 q2 102 28 120z" fill="#3A2A18"/><g stroke="#24483E" stroke-width="1">''' + _leaves + '''</g></g>
<path d="M0 404 H1200 V420 H0z" fill="#050A14" opacity=".5"/>
''')

# ───────────────────────── 8 · Confucianism and Daoism ─────────────────────────
CREDITS[20] = ('Drawn scene: a scholar garden at evening, a pavilion with upturned eaves beside flowing '
              'water, a writing table with a brush, an ink stone and a blank sheet of paper, and misty '
              'mountains under a full moon beyond')
_d = [_lg('rlb8-sky', [(0, '#0A1E33'), (0.5, '#1C3A62'), (0.85, '#2A4C78'), (1, '#C99A5E')]),
      _lg('rlb8-water', [(0, '#4A6A94'), (1, '#0F2444')]),
      _lg('rlb8-wood', [(0, '#7A5430'), (1, '#2E2012')]),
      _lg('rlb8-mist', [(0, '#F7EBD0', 0), (0.5, '#F7EBD0', 0.28), (1, '#F7EBD0', 0)], 1, 0),
      _glow('rlb8-moon', '#FFF2C4', 0.9),
      _glow('rlb8-lamp', '#F2C964', 0.8)]
BANNERS[20] = _svg(CREDITS[20], _d, '''
<rect width="1200" height="420" fill="url(#rlb8-sky)"/>
''' + _stars(801, 26, 40, 1160, 6, 110, 0.5) + '''
<circle cx="720" cy="74" r="80" fill="url(#rlb8-moon)" opacity=".6"/><circle cx="720" cy="74" r="26" fill="#FFF2C4"/>
<path d="M140 250 C200 120 230 80 270 60 C300 110 320 150 380 170 C420 90 460 50 500 40 C540 100 560 180 640 210 C700 120 760 100 820 90 C860 150 900 200 1000 190 C1040 130 1080 110 1120 100 L1200 250z" fill="#2A4C78" opacity=".55"/>
<rect x="0" y="170" width="1200" height="40" fill="url(#rlb8-mist)"/>
<path d="M0 270 C80 190 140 150 200 140 C240 200 300 230 380 220 C440 170 480 150 540 160 C600 220 700 240 780 220 C840 160 900 140 960 150 C1020 210 1100 230 1200 220 V300 H0z" fill="#1C3A62" opacity=".85"/>
<path d="M900 150 q10 40 4 100" stroke="#E4D2AC" stroke-width="4" fill="none" opacity=".35"/><path d="M908 152 q6 40 2 96" stroke="#F7EBD0" stroke-width="1.5" fill="none" opacity=".5"/>
<rect x="0" y="230" width="1200" height="44" fill="url(#rlb8-mist)"/>
<path d="M0 300 q300 -40 600 -30 q300 10 600 -20 V330 q-300 30 -600 20 q-300 -10 -600 20z" fill="url(#rlb8-water)"/>
<g stroke="#F7EBD0" stroke-width="1.4" fill="none" opacity=".35"><path d="M60 312 q60 -8 120 0 M300 300 q80 -10 160 0 M640 300 q70 -6 140 4 M900 296 q80 -8 160 -4"/></g>
<path d="M700 296 q20 -4 40 0 M720 308 q16 -2 32 0" stroke="#F2C964" stroke-width="2" opacity=".5"/>
<g><rect x="250" y="260" width="200" height="10" fill="#5A4E36"/><rect x="270" y="190" width="7" height="72" fill="#7A3E2E"/><rect x="330" y="190" width="7" height="72" fill="#7A3E2E"/><rect x="364" y="190" width="7" height="72" fill="#7A3E2E"/><rect x="424" y="190" width="7" height="72" fill="#7A3E2E"/>
<path d="M232 176 q10 12 30 12 h176 q20 0 30 -12 q-6 20 -24 22 h-188 q-18 -2 -24 -22z" fill="#142B4C"/><path d="M262 188 q40 -30 88 -44 q48 14 88 44z" fill="#1C3A62"/><path d="M340 144 h20" stroke="#142B4C" stroke-width="5" stroke-linecap="round"/>
<path d="M276 240 h150" stroke="#7A3E2E" stroke-width="3"/><g stroke="#7A3E2E" stroke-width="1.5"><path d="M290 240 v20 M306 240 v20 M322 240 v20 M378 240 v20 M394 240 v20 M410 240 v20"/></g>
<rect x="282" y="200" width="138" height="38" fill="#F2C964" opacity=".25"/><circle cx="350" cy="222" r="70" fill="url(#rlb8-lamp)" opacity=".6"/></g>
<g><path d="M120 330 q-14 -40 6 -70 q-16 -24 10 -44 q20 -12 30 8 q20 -10 22 20 q14 30 -6 50 q10 30 -14 40z" fill="#5A5A5A" opacity=".75"/><ellipse cx="146" cy="244" rx="6" ry="9" fill="#0A1E33"/><ellipse cx="136" cy="290" rx="5" ry="7" fill="#0A1E33"/></g>
<g stroke="#2E5A4C" stroke-width="3"><path d="M1020 330 v-170 M1040 330 v-190 M1058 330 v-150"/></g>
<g fill="#2E5A4C"><path d="M1020 200 l-26 -8 l26 2z M1040 180 l30 -10 l-30 4z M1040 230 l-28 -6 l28 0z M1058 210 l26 -8 l-26 4z M1020 250 l24 -10 l-24 4z M1058 250 l-24 -8 l24 2z"/></g>
<rect x="0" y="330" width="1200" height="90" fill="#0F2444"/>
<ellipse cx="660" cy="340" rx="300" ry="70" fill="url(#rlb8-lamp)" opacity=".4"/>
<g><rect x="470" y="340" width="380" height="16" fill="url(#rlb8-wood)"/><rect x="470" y="336" width="380" height="6" fill="#9A7446"/><path d="M490 356 v64 M830 356 v64" stroke="#2E2012" stroke-width="10"/>
<rect x="560" y="310" width="140" height="28" fill="#F7EBD0" transform="rotate(-2 630 324)"/><rect x="556" y="328" width="16" height="8" fill="#3A2A18"/><rect x="688" y="324" width="16" height="8" fill="#3A2A18"/>
<rect x="720" y="320" width="60" height="16" rx="3" fill="#1E1E24"/><rect x="728" y="323" width="44" height="8" rx="4" fill="#0A0A10"/><rect x="786" y="326" width="30" height="8" rx="2" fill="#2A2A30"/>
<path d="M500 334 q8 -12 16 -4 q8 -12 16 -2 q8 -12 16 0 v6 h-48z" fill="#5A4E36"/><path d="M500 326 l66 -4" stroke="#C9A26A" stroke-width="4" stroke-linecap="round"/><path d="M566 322 l14 -1" stroke="#1E1E24" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="826" cy="326" rx="10" ry="8" fill="#6A8AA0"/><path d="M826 318 v-4" stroke="#4A6A94" stroke-width="3"/></g>
<path d="M0 406 H1200 V420 H0z" fill="#050A14" opacity=".5"/>
''')

# ───────────────────────── 9 · Sikhism, Jainism, Africa and the Americas ─────────────────────────
CREDITS[21] = ('Drawn scene: a golden-domed temple reflected in a still pool on one side and a baobab '
              'tree under a sky full of stars on the other, joined by a single horizon line at dusk')
_d = [_lg('rlb9-sky', [(0, '#0A1E33'), (0.55, '#1C3A62'), (0.88, '#C99A5E'), (1, '#F2C273')]),
      _lg('rlb9-gold', [(0, '#FFF2C4'), (0.4, '#F2C964'), (1, '#9A7446')]),
      _lg('rlb9-dome', [(0, '#9A7446'), (0.4, '#FFF2C4'), (1, '#9A7446')], 1, 0),
      _lg('rlb9-pool', [(0, '#2A4C78'), (1, '#0A1E33')]),
      _lg('rlb9-land', [(0, '#5A4228'), (1, '#1E140A')]),
      _glow('rlb9-lit', '#FFF2C4', 0.85)]
_temple = ('<rect x="376" y="212" width="148" height="58" fill="url(#rlb9-gold)"/>'
           '<g fill="#7A5430" opacity=".6"><path d="M388 270 v-30 q9 -12 18 0 v30z M418 270 v-30 q9 -12 18 0 v30z M464 270 v-30 q9 -12 18 0 v30z M494 270 v-30 q9 -12 18 0 v30z"/></g>'
           '<path d="M442 270 v-36 q8 -12 16 0 v36z" fill="#5A3A1E" opacity=".7"/>'
           '<rect x="372" y="206" width="156" height="8" fill="#F7EBD0"/><rect x="392" y="176" width="116" height="32" fill="url(#rlb9-gold)"/>'
           '<g fill="#9A7446" opacity=".6"><rect x="402" y="184" width="8" height="16" rx="4"/><rect x="420" y="184" width="8" height="16" rx="4"/><rect x="472" y="184" width="8" height="16" rx="4"/><rect x="490" y="184" width="8" height="16" rx="4"/></g>'
           '<rect x="388" y="172" width="124" height="6" fill="#F7EBD0"/>'
           '<path d="M418 172 q-4 -30 16 -44 q16 -10 16 -26 q0 16 16 26 q20 14 16 44z" fill="url(#rlb9-dome)"/>'
           '<g stroke="#9A7446" stroke-width="1" fill="none" opacity=".7"><path d="M430 172 q-2 -26 20 -58 M442 172 q0 -30 8 -58 M458 172 q0 -30 -8 -58 M470 172 q2 -26 -20 -58"/></g>'
           '<path d="M450 102 v-14" stroke="#F2C273" stroke-width="2"/><circle cx="450" cy="86" r="3" fill="#FFF2C4"/>'
           '<g><rect x="378" y="160" width="20" height="14" fill="url(#rlb9-gold)"/><path d="M376 162 q12 -22 24 0z" fill="url(#rlb9-dome)"/><path d="M388 146 v-6" stroke="#F2C273" stroke-width="1.5"/>'
           '<rect x="502" y="160" width="20" height="14" fill="url(#rlb9-gold)"/><path d="M500 162 q12 -22 24 0z" fill="url(#rlb9-dome)"/><path d="M512 146 v-6" stroke="#F2C273" stroke-width="1.5"/></g>')
BANNERS[21] = _svg(CREDITS[21], _d, '''
<rect width="1200" height="420" fill="url(#rlb9-sky)"/>
''' + _stars(901, 20, 40, 600, 6, 110, 0.5) + _stars(902, 36, 600, 1160, 6, 200, 0.75) + '''
<ellipse cx="450" cy="200" rx="200" ry="110" fill="url(#rlb9-lit)" opacity=".55"/>
<path d="M0 270 V236 h80 v-10 h80 v10 h110 v34z M630 270 V250 h60 v20z" fill="#E4D2AC" opacity=".55"/>
''' + _windows(91, 10, 260, 240, 262, 22, 0.4, '#F6D98C', 0.75) + '''
<rect x="0" y="270" width="640" height="150" fill="url(#rlb9-pool)"/>
<g opacity=".35" transform="translate(0 540) scale(1 -1)">''' + _temple + '''</g>
<g stroke="#F7EBD0" stroke-width="1" opacity=".3"><path d="M360 300 h40 M470 318 h60 M380 350 h90 M440 380 h40 M90 300 h60 M560 330 h50"/></g>
<rect x="240" y="264" width="140" height="8" fill="#E4D2AC"/><g fill="#C9B48A"><rect x="250" y="252" width="3" height="12"/><rect x="280" y="252" width="3" height="12"/><rect x="310" y="252" width="3" height="12"/><rect x="340" y="252" width="3" height="12"/><rect x="370" y="252" width="3" height="12"/></g>
<g fill="#FFF2C4"><circle cx="251" cy="250" r="2.5"/><circle cx="281" cy="250" r="2.5"/><circle cx="311" cy="250" r="2.5"/><circle cx="341" cy="250" r="2.5"/><circle cx="371" cy="250" r="2.5"/></g>
''' + _temple + '''
<path d="M640 270 q200 -6 560 0 V420 H640z" fill="url(#rlb9-land)"/>
<path d="M620 270 q10 30 40 150 H640z" fill="#1E140A" opacity=".5"/>
<g stroke="#8A6A3A" stroke-width="1.5" opacity=".6"><path d="M680 270 l-2 -10 M700 270 l3 -12 M740 272 l-1 -9 M960 272 l2 -10 M1000 270 l-3 -12 M1080 272 l2 -9 M1140 270 l-2 -10"/></g>
<g fill="#0A1E33"><path d="M770 272 q14 -20 12 -110 q-2 -30 10 -40 h56 q12 10 10 40 q-2 90 12 110z"/>
<path d="M794 124 q-30 -20 -60 -18 M794 124 q-14 -30 -40 -44 M806 122 q-4 -34 8 -50 M822 122 q4 -34 -4 -56 M838 122 q18 -30 44 -40 M846 124 q30 -16 64 -12 M784 132 q-40 0 -64 14" stroke="#0A1E33" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M736 106 q-10 -8 -22 -6 M754 80 q-4 -12 -14 -16 M814 72 q-4 -12 4 -20 M818 66 q8 -8 16 -8 M882 82 q10 -6 20 -4 M910 112 q10 2 14 10 M720 146 q-10 -4 -18 0" stroke="#0A1E33" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<path d="M800 272 q10 -60 8 -120" stroke="#2A4C78" stroke-width="2" fill="none" opacity=".5"/>
<path d="M0 270 H1200" stroke="#F2C273" stroke-width="2" opacity=".7"/>
<path d="M0 408 H1200 V420 H0z" fill="#050A14" opacity=".5"/>
''')

# ───────────────────────── 10 · Religion and the World ─────────────────────────
CREDITS[22] = ('Drawn scene: a city skyline at night where a dome, a church steeple, a pagoda roof, the '
               'rounded front of a synagogue and a gurdwara dome stand side by side among apartment '
               'blocks, lit windows everywhere')
_d = [_lg('rlb10-sky', [(0, '#0A1E33'), (0.6, '#0F2444'), (0.9, '#2A4C78'), (1, '#C99A5E')]),
      _lg('rlb10-stone', [(0, '#E4D2AC'), (1, '#8A7650')]),
      _lg('rlb10-gold', [(0, '#9A7446'), (0.4, '#FFF2C4'), (1, '#9A7446')], 1, 0),
      _lg('rlb10-street', [(0, '#142B4C'), (1, '#0A1428')]),
      _glow('rlb10-lit', '#FFF2C4', 0.85)]
BANNERS[22] = _svg(CREDITS[22], _d, '''
<rect width="1200" height="420" fill="url(#rlb10-sky)"/>
''' + _stars(1001, 26, 20, 1180, 6, 130, 0.6) + '''
<circle cx="1000" cy="60" r="16" fill="#F7EBD0" opacity=".85"/>
<g fill="#142B4C"><rect x="0" y="170" width="70" height="200"/><rect x="74" y="140" width="60" height="230"/><rect x="138" y="190" width="80" height="180"/><rect x="964" y="150" width="70" height="220"/><rect x="1038" y="180" width="72" height="190"/><rect x="1114" y="130" width="86" height="240"/></g>
''' + _windows(1011, 6, 214, 150, 360, 20, 0.33, '#F6D98C', 0.7) + _windows(1012, 970, 1196, 140, 360, 20, 0.33, '#F6D98C', 0.7) + '''
<g><rect x="226" y="220" width="120" height="150" fill="url(#rlb10-stone)"/><rect x="246" y="196" width="80" height="26" fill="#C9B48A"/><path d="M246 198 q0 -60 40 -64 q40 4 40 64z" fill="url(#rlb10-stone)"/><path d="M286 134 v-12" stroke="#C9A26A" stroke-width="2.5"/><circle cx="286" cy="120" r="3" fill="#F2C273"/>
<rect x="352" y="150" width="14" height="220" fill="url(#rlb10-stone)"/><path d="M348 150 l11 -40 l11 40z" fill="#A08C64"/><rect x="348" y="190" width="22" height="5" fill="#C9B48A"/></g>
<g><rect x="376" y="236" width="100" height="134" fill="#2A4C78"/><path d="M376 238 l50 -40 l50 40z" fill="#1C3A62"/><rect x="408" y="160" width="36" height="80" fill="#2A4C78"/><path d="M406 162 l20 -62 l20 62z" fill="#1C3A62"/>
<path d="M426 100 v-12" stroke="#C9A26A" stroke-width="2.5"/><circle cx="426" cy="86" r="3" fill="#F2C273"/><path d="M418 232 v-26 q8 -12 16 0 v26z" fill="#F2C964" opacity=".8"/><circle cx="426" cy="182" r="7" fill="#F2C964" opacity=".8"/></g>
<g><rect x="496" y="250" width="90" height="120" fill="#7A3E2E"/><path d="M478 252 q12 6 32 4 h62 q20 2 32 -4 l-10 -14 h-96z" fill="#142B4C"/><rect x="506" y="214" width="70" height="26" fill="#7A3E2E"/>
<path d="M486 216 q12 6 28 4 h54 q16 2 28 -4 l-10 -14 h-80z" fill="#142B4C"/><rect x="516" y="182" width="50" height="22" fill="#7A3E2E"/><path d="M496 184 q12 6 24 4 h42 q12 2 24 -4 l-10 -14 h-70z" fill="#142B4C"/>
<path d="M541 170 v-40" stroke="#C9A26A" stroke-width="3"/><g fill="#C9A26A"><circle cx="541" cy="160" r="3"/><circle cx="541" cy="150" r="3"/><circle cx="541" cy="140" r="3"/></g></g>
<g><rect x="600" y="210" width="130" height="160" fill="url(#rlb10-stone)"/><path d="M600 212 q0 -60 65 -64 q65 4 65 64z" fill="#C9B48A"/><circle cx="665" cy="196" r="16" fill="#F2C964" opacity=".8"/><circle cx="665" cy="196" r="16" fill="none" stroke="#8A7650" stroke-width="3"/>
<path d="M640 370 v-60 q25 -30 50 0 v60z" fill="#5A3A1E"/><path d="M614 280 v-24 q8 -10 16 0 v24z M700 280 v-24 q8 -10 16 0 v24z" fill="#F2C964" opacity=".7"/></g>
<g><rect x="748" y="226" width="130" height="144" fill="#F7EBD0"/><rect x="778" y="200" width="70" height="28" fill="#E4D2AC"/><path d="M780 202 q-6 -30 16 -42 q16 -10 17 -26 q1 16 17 26 q22 12 16 42z" fill="url(#rlb10-gold)"/>
<path d="M813 134 v-14" stroke="#F2C273" stroke-width="2"/><rect x="752" y="206" width="16" height="20" fill="#E4D2AC"/><path d="M750 208 q10 -18 20 0z" fill="url(#rlb10-gold)"/><rect x="858" y="206" width="16" height="20" fill="#E4D2AC"/><path d="M856 208 q10 -18 20 0z" fill="url(#rlb10-gold)"/>
<path d="M796 370 v-50 q17 -20 34 0 v50z" fill="#F2C964" opacity=".8"/><path d="M766 290 v-24 q8 -10 16 0 v24z M844 290 v-24 q8 -10 16 0 v24z" fill="#F2C964" opacity=".7"/></g>
<g fill="#1C3A62"><rect x="886" y="190" width="72" height="180"/></g>''' + _windows(1013, 892, 954, 200, 360, 18, 0.45, '#F6D98C', 0.75) + '''
''' + _windows(1014, 236, 340, 232, 360, 16, 0.4, '#F2C964', 0.8) + _windows(1015, 382, 470, 250, 360, 16, 0.45, '#F2C964', 0.8) + _windows(1016, 502, 580, 262, 360, 16, 0.45, '#F2C964', 0.8) + '''
<ellipse cx="600" cy="330" rx="520" ry="100" fill="url(#rlb10-lit)" opacity=".35"/>
<rect x="0" y="370" width="1200" height="50" fill="url(#rlb10-street)"/>
<g fill="#1C3A62"><rect x="196" y="330" width="5" height="44"/><rect x="596" y="330" width="5" height="44"/><rect x="996" y="330" width="5" height="44"/></g>
<g fill="#FFF2C4"><circle cx="198" cy="328" r="6"/><circle cx="598" cy="328" r="6"/><circle cx="998" cy="328" r="6"/></g>
<circle cx="198" cy="328" r="34" fill="url(#rlb10-lit)" opacity=".7"/><circle cx="598" cy="328" r="34" fill="url(#rlb10-lit)" opacity=".7"/><circle cx="998" cy="328" r="34" fill="url(#rlb10-lit)" opacity=".7"/>
<g stroke="#F2C964" stroke-width="2" opacity=".3"><path d="M180 390 h36 M580 390 h36 M980 390 h36"/></g>
<path d="M0 408 H1200 V420 H0z" fill="#050A14" opacity=".5"/>
''')

# ───────────────────────── 11 · One Question, Many Lenses ─────────────────────────
CREDITS[23] = ('Drawn scene: a single path leading to a crossroads under a starry sky, where it divides '
               'into several branches toward the hills, each lined with small glowing lanterns')
_d = [_lg('rlb11-sky', [(0, '#0A1E33'), (0.6, '#0F2444'), (0.9, '#2A4C78'), (1, '#C99A5E')]),
      _lg('rlb11-land', [(0, '#1C3A62'), (1, '#0A1428')]),
      _lg('rlb11-path', [(0, '#C9B48A', 0.5), (1, '#E4D2AC', 0.85)]),
      _glow('rlb11-lit', '#FFF2C4', 0.95)]
_lan = ''
for _x, _y, _s in [(560, 360, 1.3), (644, 360, 1.3), (470, 290, .8), (330, 272, .6), (220, 262, .45), (520, 262, .55), (660, 260, .55),
                   (756, 282, .75), (880, 268, .55), (990, 262, .45), (430, 256, .4), (760, 256, .4)]:
    _lan += ('<g transform="translate(%d %d) scale(%s)"><path d="M0 0 v-46" stroke="#3A2A18" stroke-width="4"/>'
             '<path d="M0 -46 h10 v6" stroke="#3A2A18" stroke-width="3" fill="none"/><rect x="4" y="-40" width="12" height="16" rx="2" fill="#F2C964"/>'
             '<path d="M3 -40 h14 l-3 -4 h-8z" fill="#3A2A18"/><circle cx="10" cy="-32" r="26" fill="url(#rlb11-lit)"/></g>' % (_x, _y, _s))
BANNERS[23] = _svg(CREDITS[23], _d, '''
<rect width="1200" height="420" fill="url(#rlb11-sky)"/>
<path d="M160 20 q440 60 900 200" stroke="#F7EBD0" stroke-width="50" fill="none" opacity=".035"/>
''' + _stars(1101, 48, 10, 1190, 6, 220, 0.7) + _stars(1102, 16, 200, 1000, 20, 180, 0.95) + '''
<circle cx="600" cy="54" r="2.6" fill="#FFF2C4"/>
<path d="M0 252 q120 -40 260 -20 q120 -40 240 -10 q120 -30 240 -6 q140 -34 260 -4 q120 -10 200 10 V270 H0z" fill="#1C3A62" opacity=".8"/>
<path d="M0 262 q300 -16 600 -8 q300 -8 600 6 V420 H0z" fill="url(#rlb11-land)"/>
<path d="M530 420 L592 300 H608 L670 420z" fill="url(#rlb11-path)"/>
<path d="M594 302 L200 262 L212 260 L602 298z" fill="url(#rlb11-path)" opacity=".8"/>
<path d="M596 300 L420 256 L428 255 L602 296z" fill="url(#rlb11-path)" opacity=".75"/>
<path d="M597 298 L596 254 H604 L603 298z" fill="url(#rlb11-path)" opacity=".7"/>
<path d="M598 296 L772 255 L780 256 L604 300z" fill="url(#rlb11-path)" opacity=".75"/>
<path d="M598 298 L988 260 L1000 262 L606 302z" fill="url(#rlb11-path)" opacity=".8"/>
<g><path d="M600 318 v-54" stroke="#3A2A18" stroke-width="4"/><path d="M600 272 l-30 -4 v10 l30 4z M600 284 l30 -4 v10 l-30 4z" fill="#9A7446"/><path d="M600 262 l-26 4 v-8z" fill="#8A6A3A"/></g>
''' + _lan + '''
<g fill="#0F2444"><path d="M0 330 q60 -30 120 -10 q40 -40 90 -20 q30 20 60 50 V420 H0z M1200 330 q-60 -30 -120 -10 q-40 -40 -90 -20 q-30 20 -60 50 V420 H1200z"/></g>
<path d="M0 406 H1200 V420 H0z" fill="#050A14" opacity=".5"/>
''')

# ───────────────────────── 12 · Capstone: The Sources Speak ─────────────────────────
CREDITS[24] = ('Drawn scene: a long library table at night covered in open books and scrolls, a student '
               'seen from behind writing in a notebook, and a tall window full of stars')
_d = [_lg('rlb12-wall', [(0, '#0A1E33'), (0.6, '#0F2444'), (1, '#1C3A62')]),
      _lg('rlb12-sky', [(0, '#0A1E33'), (0.6, '#1C3A62'), (1, '#2A4C78')]),
      _lg('rlb12-table', [(0, '#C9A26A'), (0.12, '#9A7446'), (1, '#2E2012')]),
      _lg('rlb12-roll', [(0, '#FFF2C4'), (0.5, '#E4D2AC'), (1, '#9A7446')]),
      _glow('rlb12-lamp')]
_win = '<g fill="none" stroke="#2A4C78" stroke-width="6"><path d="M440 236 V100 A160 90 0 0 1 760 100 V236z"/></g><g fill="#2A4C78"><rect x="518" y="10" width="5" height="226"/><rect x="598" y="0" width="5" height="236"/><rect x="678" y="10" width="5" height="226"/><rect x="440" y="120" width="320" height="4"/><rect x="430" y="232" width="340" height="12"/></g>'
BANNERS[24] = _svg(CREDITS[24], _d, '''
<rect width="1200" height="420" fill="url(#rlb12-wall)"/>
<path d="M440 236 V100 A160 90 0 0 1 760 100 V236z" fill="url(#rlb12-sky)"/>
''' + _stars(1201, 30, 452, 748, 40, 228, 0.8) + _stars(1202, 10, 470, 730, 50, 220, 1) + '''
<path d="M470 210 q120 -120 260 -150" stroke="#F7EBD0" stroke-width="18" fill="none" opacity=".06"/>
''' + _win + '''
<g>''' + _spines(21, 130, 380, 120, 46) + _spines(22, 130, 380, 210, 46) + '''</g>
<g>''' + _spines(24, 820, 1070, 120, 46) + _spines(25, 820, 1070, 210, 46) + '''</g>
<rect x="0" y="0" width="140" height="420" fill="#0A1E33" opacity=".55"/><rect x="1060" y="0" width="140" height="420" fill="#0A1E33" opacity=".55"/>
<ellipse cx="600" cy="270" rx="460" ry="160" fill="url(#rlb12-lamp)" opacity=".75"/>
<rect x="0" y="276" width="1200" height="144" fill="url(#rlb12-table)"/><rect x="0" y="276" width="1200" height="4" fill="#E4B860" opacity=".5"/>
<g><path d="M300 272 l14 -48 l12 4 l-10 44z" fill="#3A2A18"/><path d="M296 226 l20 -22 l30 20z" fill="#E4B860"/><circle cx="318" cy="232" r="60" fill="url(#rlb12-lamp)"/>
<path d="M880 272 l14 -48 l12 4 l-10 44z" fill="#3A2A18"/><path d="M876 226 l20 -22 l30 20z" fill="#E4B860"/><circle cx="898" cy="232" r="60" fill="url(#rlb12-lamp)"/></g>
<g><path d="M180 316 q-2 -20 4 -28 q34 -6 58 2 v28 q-30 -6 -62 -2z" fill="#F7EBD0"/><path d="M302 316 q2 -20 -4 -28 q-34 -6 -58 2 v28 q30 -6 62 -2z" fill="#EFE0BE"/>
<path d="M176 318 q34 -6 64 4 q30 -10 66 -4 l2 5 q-36 -4 -68 6 q-32 -10 -64 -6z" fill="#2E5A4C"/>''' + _lines(190, 296, 44, 3, 6, seed=3) + _lines(248, 296, 44, 3, 6, seed=4) + '''</g>
<g><rect x="340" y="300" width="130" height="26" fill="#F7EBD0" transform="rotate(4 405 313)"/><rect x="330" y="292" width="16" height="40" rx="8" fill="url(#rlb12-roll)" transform="rotate(4 405 313)"/><rect x="464" y="292" width="16" height="40" rx="8" fill="url(#rlb12-roll)" transform="rotate(4 405 313)"/>
<g transform="rotate(4 405 313)">''' + _lines(354, 306, 100, 3, 6, seed=5) + '''</g></g>
<g><rect x="700" y="300" width="84" height="56" fill="#F7EBD0" transform="rotate(-8 742 328)"/><rect x="700" y="300" width="84" height="8" fill="#7A3E2E" transform="rotate(-8 742 328)"/>
<g transform="rotate(-8 742 328)">''' + _lines(708, 318, 66, 5, 7, '#1C3A62', 0.5, seed=6) + '''</g><path d="M760 356 l40 -30" stroke="#3A2A18" stroke-width="4" stroke-linecap="round"/><path d="M800 326 l6 -4" stroke="#F2C273" stroke-width="4"/></g>
<g><path d="M840 324 q-2 -22 4 -30 q34 -6 60 2 v30 q-32 -6 -64 -2z" fill="#F7EBD0"/><path d="M968 324 q2 -22 -4 -30 q-34 -6 -60 2 v30 q32 -6 64 -2z" fill="#EFE0BE"/>
<path d="M836 326 q36 -6 68 4 q32 -10 68 -4 l2 5 q-38 -4 -70 6 q-32 -10 -68 -6z" fill="#7A3E2E"/>''' + _lines(852, 302, 44, 3, 6, seed=7) + _lines(912, 302, 44, 3, 6, seed=8) + '''</g>
<g><rect x="990" y="290" width="90" height="12" fill="#1C3A62"/><rect x="994" y="278" width="84" height="12" fill="#8A6A3A"/><rect x="988" y="266" width="88" height="12" fill="#E4D2AC"/></g>
<g><rect x="96" y="300" width="70" height="22" rx="11" fill="url(#rlb12-roll)"/><path d="M110 300 v22 M150 300 v22" stroke="#7A3E2E" stroke-width="2"/></g>
<g fill="#0A1E33"><circle cx="600" cy="298" r="34"/><path d="M496 420 q0 -92 104 -98 q104 6 104 98z"/><path d="M572 272 q28 -22 58 0 q-6 -12 -28 -14 q-22 2 -30 14z" fill="#142B4C"/>
<path d="M680 352 q30 -10 52 -2" stroke="#0A1E33" stroke-width="16" stroke-linecap="round" fill="none"/></g>
<path d="M600 266 q30 4 34 32" stroke="#F2C273" stroke-width="2" fill="none" opacity=".6"/>
<path d="M0 396 H1200 V420 H0z" fill="#1E140A" opacity=".5"/>
''')
