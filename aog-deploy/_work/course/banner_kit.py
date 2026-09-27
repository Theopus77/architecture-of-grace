"""AOG banner kit — drawn pieces for the house-style unit banners (1200x420
inline SVG, layered silhouettes, calm colours, nothing moves, no text, no
people). Used by banners_heb_*, banners_qur_*, banners_tal_*. Every id is
made from the prefix the caller passes, so many banners can share a page.
Stdlib only."""
W, H = 1200, 420

def _stop(o, c, a=None):
    return '<stop offset="%s" stop-color="%s"%s/>' % (o, c, "" if a is None else ' stop-opacity="%s"' % a)

def lin(pid, stops, x2=0, y2=1):
    return '<linearGradient id="%s" x1="0" y1="0" x2="%s" y2="%s">%s</linearGradient>' % (pid, x2, y2, "".join(_stop(*s) for s in stops))

def rad(pid, stops):
    return '<radialGradient id="%s" cx=".5" cy=".5" r=".5">%s</radialGradient>' % (pid, "".join(_stop(*s) for s in stops))

def rng(seed):
    x = seed
    while True:
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        yield x

def stars(seed, n, ymax, color="#EEF0FF", op=".85"):
    g = rng(seed); out = []
    for _ in range(n):
        out.append('<circle cx="%d" cy="%d" r="%.1f"/>' % (next(g) % W, next(g) % ymax, .6 + (next(g) % 10) / 10))
    return '<g fill="%s" opacity="%s">%s</g>' % (color, op, "".join(out))

def sky(p, cols):
    """cols: 3 or 4 colours top→horizon. Returns (defs, body)."""
    st = [(round(i / (len(cols) - 1), 2), c) for i, c in enumerate(cols)]
    return lin(p + "sky", st), '<rect width="%d" height="%d" fill="url(#%ssky)"/>' % (W, H, p)

def sun(p, x, y, r=34, core="#FFF6D0", glow="#FFE08A"):
    d = rad(p + "sun", [(0, core, 1), (.35, glow, .6), (1, glow, 0)])
    return d, '<circle cx="%d" cy="%d" r="%d" fill="url(#%ssun)"/><circle cx="%d" cy="%d" r="%d" fill="%s"/>' % (x, y, r * 4, p, x, y, r, core)

def moon(x, y, r=22, c="#F6F2E0"):
    return '<circle cx="%d" cy="%d" r="%d" fill="%s" opacity=".95"/><circle cx="%d" cy="%d" r="%d" fill="%s" opacity=".25"/>' % (x, y, r, c, x, y, r * 2, c)

def clouds(pts, op=".6", c="#FFFFFF"):
    return '<g fill="%s" opacity="%s">%s</g>' % (c, op, "".join(
        '<ellipse cx="%d" cy="%d" rx="%d" ry="%d"/><ellipse cx="%d" cy="%d" rx="%d" ry="%d"/>' % (x, y, w, w // 8 + 4, x + w // 3, y - 6, w // 2, w // 6 + 4) for x, y, w in pts))

def ridge(y, amp, seed, fill, step=150):
    g = rng(seed); d = "M0 %d" % y
    for x in range(step, W + step, step):
        cy = y - amp + next(g) % (amp * 2 + 1)
        d += " Q%d %d %d %d" % (x - step // 2, cy - amp // 2, x, y + (next(g) % (amp + 1)) - amp // 2)
    return '<path d="%s V%d H0z" fill="%s"/>' % (d, H, fill)

def mountains(peaks, fill, shade="#000000"):
    out = ""
    for x, y, w in peaks:
        out += '<path d="M%d %d L%d %d L%d %d z" fill="%s"/><path d="M%d %d L%d %d H%d L%d %d z" fill="%s" opacity=".18"/>' % (
            x - w, 300, x, y, x + w, 300, fill, x, y, x + w, 300, x + w // 3, x, y + 30, shade)
    return out

def water(p, y, top="#A8D0DC", bot="#4F8CA4"):
    d = lin(p + "wat", [(0, top), (1, bot)])
    b = '<path d="M0 %d Q300 %d 600 %d T1200 %d V%d H0z" fill="url(#%swat)"/>' % (y, y - 16, y, y - 4, H, p)
    b += '<g stroke="#FFFFFF" stroke-width="1.5" opacity=".45">%s</g>' % "".join(
        '<path d="M%d %d h%d"/>' % (x, y + 20 + (x * 7) % 40, 40 + x % 50) for x in range(80, 1200, 190))
    return d, b

def ground(y, fill):
    return '<path d="M0 %d Q300 %d 600 %d T1200 %d V%d H0z" fill="%s"/>' % (y, y - 10, y + 2, y - 6, H, fill)

def tree(x, y, s, leaf="#4E7A3C", leaf2="#6E9A50", trunk="#5A3E2A"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-4 0 v-46 M0 -30 l-16 -14 M0 -34 l18 -12" stroke="%s" stroke-width="7" fill="none" stroke-linecap="round"/>'
            '<g fill="%s"><circle cx="0" cy="-72" r="34"/><circle cx="-28" cy="-54" r="24"/><circle cx="30" cy="-56" r="25"/><circle cx="-6" cy="-96" r="22"/></g>'
            '<g fill="%s"><circle cx="-10" cy="-78" r="14"/><circle cx="22" cy="-64" r="11"/></g></g>') % (x, y, s, trunk, leaf, leaf2)

def olive(x, y, s):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M0 0 q-6 -30 4 -50 M2 -36 q14 -10 20 -24" stroke="#6A5440" stroke-width="7" fill="none" stroke-linecap="round"/>'
            '<g fill="#7E8C5A"><ellipse cx="0" cy="-66" rx="40" ry="20"/><ellipse cx="24" cy="-78" rx="26" ry="14"/><ellipse cx="-22" cy="-80" rx="24" ry="13"/></g>'
            '<g fill="#A3AE7C" opacity=".8"><ellipse cx="-6" cy="-72" rx="16" ry="6"/><ellipse cx="20" cy="-84" rx="10" ry="4"/></g></g>') % (x, y, s)

def cypress(x, y, s, c="#2E4A2A"):
    return '<g transform="translate(%d %d) scale(%s)"><path d="M0 0 q-16 -40 -10 -80 q4 -30 10 -50 q6 20 10 50 q6 40 -10 80z" fill="%s"/></g>' % (x, y, s, c)

def palm(x, y, s, lean=0, frond="#4E7A3C"):
    fr = "".join('<path d="M0 -70 q%d %d %d %d" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round"/>' % (dx, dy, dx * 2, dy2, frond)
                 for dx, dy, dy2 in ((-18, -22, 6), (18, -22, 6), (-26, -8, 22), (26, -8, 22), (-8, -30, -20), (8, -30, -20)))
    return ('<g transform="translate(%d %d) scale(%s) rotate(%d)"><path d="M0 0 q4 -36 0 -70" stroke="#7A5A3A" stroke-width="7" fill="none" stroke-linecap="round"/>%s'
            '<circle cx="0" cy="-68" r="6" fill="#8A6A40"/></g>') % (x, y, s, lean, fr)

def tents(pts, c="#C9B08A", dark="#6E5238"):
    out = ""
    for x, y, s in pts:
        out += ('<g transform="translate(%d %d) scale(%s)"><path d="M-60 0 L0 -64 L70 0z" fill="%s"/><path d="M0 -64 L70 0 H40 L0 -40z" fill="%s" opacity=".5"/>'
                '<path d="M-12 0 L0 -36 L12 0z" fill="%s"/></g>') % (x, y, s, c, dark, dark)
    return out

def sheep(pts, c="#F2EEE2"):
    return "".join('<g transform="translate(%d %d)"><ellipse cx="0" cy="0" rx="16" ry="10" fill="%s"/><circle cx="16" cy="-4" r="5" fill="#3A2A1A"/>'
                   '<path d="M-8 8 v8 M8 8 v8" stroke="#3A2A1A" stroke-width="2.5"/></g>' % (x, y, c) for x, y in pts)

def camel(x, y, s=1, c="#8A6A48"):
    return ('<g transform="translate(%d %d) scale(%s)" fill="%s"><path d="M-40 0 q6 -34 30 -36 q12 -16 26 0 q14 -4 20 8 q4 -20 16 -24 q10 -2 12 6 l-6 4 q-8 16 -14 30 h-6 v26 h-6 v-26 h-44 v26 h-6 v-26 h-8 v26 h-6z"/></g>') % (x, y, s, c)

def city(x, y, s, wall="#C9A878", shade="#8A6A48", dome=None):
    """A walled hill town: wall, towers, flat-roofed houses and (optionally) a plain dome. No emblems."""
    d = ('<g transform="translate(%d %d) scale(%s)"><path d="M-160 0 v-40 h320 v40z" fill="%s"/>'
         '<g fill="%s"><rect x="-172" y="-66" width="34" height="66"/><rect x="138" y="-66" width="34" height="66"/><rect x="-20" y="-58" width="40" height="58"/></g>'
         '<path d="M-10 0 v-26 a10 10 0 0 1 20 0 v26z" fill="#3A2A1A"/>'
         '<g fill="%s"><rect x="-130" y="-78" width="50" height="38"/><rect x="-70" y="-96" width="40" height="56"/><rect x="40" y="-86" width="56" height="46"/><rect x="100" y="-72" width="34" height="32"/></g>'
         '<g fill="#3A2A1A" opacity=".55"><rect x="-116" y="-66" width="8" height="10"/><rect x="-56" y="-84" width="8" height="10"/><rect x="56" y="-74" width="8" height="10"/><rect x="76" y="-74" width="8" height="10"/></g>') % (x, y, s, wall, shade, wall)
    if dome:
        d += '<rect x="-30" y="-100" width="60" height="42" fill="%s"/><path d="M-34 -100 a34 34 0 0 1 68 0z" fill="%s"/>' % (wall, dome)
    return d + "</g>"

def arches(x, y, n, w, h, c="#E6D6B6", inner="#0A1E33"):
    """A colonnade of plain round arches (architecture, no symbols)."""
    out = '<g transform="translate(%d %d)"><rect x="0" y="%d" width="%d" height="%d" fill="%s"/>' % (x, y, -h - 20, n * w + 12, h + 20, c)
    for i in range(n):
        ax = 12 + i * w
        out += '<path d="M%d 0 v%d a%d %d 0 0 1 %d 0 v%d z" fill="%s" opacity=".85"/>' % (ax, -h + w // 2, (w - 12) // 2, (w - 12) // 2, w - 12, h - w // 2, inner)
    return out + "</g>"

def geo_pattern(p, x, y, w, h, a="#2E5A88", b="#D9B45A", bg="#F4EAD2", op="1"):
    """An interlaced eight-point star lattice (geometric tilework, no lettering)."""
    d = ('<pattern id="%sgeo" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="%s"/>'
         '<path d="M20 4 L25 15 L36 20 L25 25 L20 36 L15 25 L4 20 L15 15z" fill="%s"/>'
         '<rect x="14" y="14" width="12" height="12" transform="rotate(45 20 20)" fill="%s"/>'
         '<g fill="%s"><circle cx="0" cy="0" r="4"/><circle cx="40" cy="0" r="4"/><circle cx="0" cy="40" r="4"/><circle cx="40" cy="40" r="4"/></g></pattern>') % (p, bg, a, b, a)
    return d, '<rect x="%d" y="%d" width="%d" height="%d" fill="url(#%sgeo)" opacity="%s"/>' % (x, y, w, h, p, op)

def lamp(x, y, s=1, body="#B8864A"):
    """A clay oil lamp with a still flame."""
    return ('<g transform="translate(%d %d) scale(%s)"><ellipse cx="0" cy="0" rx="34" ry="12" fill="%s"/><path d="M26 -4 q20 -4 30 -12 l2 8 q-12 10 -30 12z" fill="%s"/>'
            '<path d="M-34 0 q-12 -4 -14 -14 q8 2 14 6z" fill="%s"/><ellipse cx="0" cy="-6" rx="10" ry="4" fill="#3A2A1A"/>'
            '<ellipse cx="58" cy="-34" rx="16" ry="24" fill="#FFE08A" opacity=".35"/><path d="M58 -16 q-8 -12 0 -30 q8 18 0 30z" fill="#F0923A"/><path d="M58 -18 q-4 -6 0 -16 q4 10 0 16z" fill="#FFF3C0"/></g>') % (x, y, s, body, body, body)

def hanging_lamp(x, y, s=1, glass="#E8B84A"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M0 -120 V-40" stroke="#6A5440" stroke-width="2"/><ellipse cx="0" cy="-10" rx="44" ry="44" fill="#FFE08A" opacity=".18"/>'
            '<path d="M-22 -40 h44 l-8 36 q-14 10 -28 0z" fill="%s" opacity=".9"/><path d="M-26 -40 h52" stroke="#6A5440" stroke-width="4"/><circle cx="0" cy="-20" r="6" fill="#FFF3C0"/></g>') % (x, y, s, glass)

def books(x, y, s=1, cols=("#2E5A88", "#A8323A", "#6E7C22", "#8A5A9A", "#C98A2A")):
    out = '<g transform="translate(%d %d) scale(%s)">' % (x, y, s); bx = 0
    for i, c in enumerate(cols):
        h = 70 + (i * 13) % 30; w = 18 + (i * 5) % 10
        out += '<rect x="%d" y="%d" width="%d" height="%d" rx="2" fill="%s"/><rect x="%d" y="%d" width="%d" height="3" fill="#F2C964" opacity=".7"/>' % (bx, -h, w, h, c, bx + 3, -h + 10, w - 6)
        bx += w + 2
    return out + "</g>"

def shelf(x, y, w, s=1):
    out = '<g transform="translate(%d %d)"><rect x="-10" y="0" width="%d" height="10" fill="#6A4A2C"/>' % (x, y, w + 20)
    for i, bx in enumerate(range(0, w - 60, 130)):
        out += books(bx, 0, s, cols=[("#2E5A88", "#A8323A", "#6E7C22", "#8A5A9A", "#C98A2A", "#4A6A7A")[(i + k) % 6] for k in range(5)])
    return out + "</g>"

def open_book(x, y, s=1, page="#F7EEDC", cover="#7A2E2E"):
    """An open book with only ruled lines — no lettering."""
    lines = "".join('<path d="M%d %d h56 M%d %d h56"/>' % (-66, -44 + i * 9, 10, -44 + i * 9) for i in range(5))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-84 0 q42 -14 84 0 q42 -14 84 0 v-66 q-42 -14 -84 0 q-42 -14 -84 0z" fill="%s"/>'
            '<path d="M-78 -4 q38 -12 78 0 v-66 q-40 -12 -78 0z M78 -4 q-38 -12 -78 0 v-66 q40 -12 78 0z" fill="%s"/>'
            '<g stroke="#B8A078" stroke-width="1.5">%s</g><path d="M0 -70 v66" stroke="#B8A078" stroke-width="1.5"/></g>') % (x, y, s, cover, page, lines)

def book_stand(x, y, s=1, wood="#8A5A34"):
    """A folding X-shaped reading stand holding an open book (lines only)."""
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-70 0 L60 -70 M70 0 L-60 -70" stroke="%s" stroke-width="10" stroke-linecap="round"/>'
            '%s</g>') % (x, y, s, wood, open_book(0, -52, .9, cover="#2E5A5A"))

def scroll(x, y, s=1, paper="#EFE2C2", rod="#6A4A2C"):
    lines = "".join('<path d="M-46 %d h92"/>' % yy for yy in range(-40, 30, 10))
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-60" y="-52" width="120" height="96" fill="%s"/><g stroke="#B8A078" stroke-width="1.5">%s</g>'
            '<rect x="-74" y="-60" width="16" height="112" rx="8" fill="%s"/><rect x="58" y="-60" width="16" height="112" rx="8" fill="%s"/>'
            '<rect x="-70" y="-72" width="8" height="136" rx="3" fill="%s"/><rect x="62" y="-72" width="8" height="136" rx="3" fill="%s"/></g>') % (x, y, s, paper, lines, paper, paper, rod, rod)

def rolled_scrolls(x, y, n=4):
    return "".join('<g transform="translate(%d %d)"><rect x="0" y="-18" width="80" height="18" rx="9" fill="#E3D2A8"/><circle cx="0" cy="-9" r="9" fill="#C9B078"/><circle cx="0" cy="-9" r="3" fill="#8A6A40"/><rect x="36" y="-18" width="6" height="18" fill="#A8323A"/></g>' % (x + (i % 2) * 20, y - i * 18) for i in range(n))

def pen_ink(x, y):
    return '<g transform="translate(%d %d)"><path d="M0 0 h24 v-18 q-12 -8 -24 0z" fill="#2A2A3A"/><path d="M14 -16 l40 -60" stroke="#C9B078" stroke-width="4" stroke-linecap="round"/></g>' % (x, y)

def jar(x, y, s=1, c="#B8704A"):
    return '<g transform="translate(%d %d) scale(%s)"><path d="M-14 0 q-20 -30 -6 -60 h-4 v-8 h48 v8 h-4 q14 30 -6 60z" fill="%s"/><path d="M-12 -50 h24" stroke="#7A4A2A" stroke-width="3"/></g>' % (x, y, s, c)

def table(y, top="#8A5A34", front="#5A3A22"):
    return '<rect x="0" y="%d" width="%d" height="12" fill="%s"/><rect x="0" y="%d" width="%d" height="%d" fill="%s"/>' % (y, W, top, y + 12, W, H - y - 12, front)

def window(p, x, y, w, h, inner_sky=("#F8C890", "#E07A5A", "#5A4A7A"), frame="#E6D6B6"):
    d = lin(p + "win", [(0, inner_sky[2]), (.6, inner_sky[1]), (1, inner_sky[0])])
    b = ('<g transform="translate(%d %d)"><rect x="-10" y="%d" width="%d" height="%d" fill="%s"/>'
         '<path d="M0 0 V%d a%d %d 0 0 1 %d 0 V0z" fill="url(#%swin)"/>'
         '<path d="M0 0 q%d -30 %d -14 q%d -20 %d 0 V0z" fill="#4A3A5A" opacity=".7"/></g>') % (
        x, y, -h - 10, w + 20, h + 20, frame, -h + w // 2, w // 2, w // 2, w, p, w // 3, w // 2, w // 4, w // 2)
    return d, b

def wall(p, top, bot):
    return lin(p + "wall", [(0, top), (1, bot)]), '<rect width="%d" height="%d" fill="url(#%swall)"/>' % (W, H, p)

def candles(x, y, n=2):
    return "".join('<g transform="translate(%d %d)"><rect x="-6" y="-60" width="12" height="60" fill="#F4EAD2"/><ellipse cx="0" cy="-74" rx="12" ry="18" fill="#FFE08A" opacity=".3"/><path d="M0 -62 q-6 -8 0 -18 q6 10 0 18z" fill="#F0923A"/><rect x="-14" y="0" width="28" height="6" fill="#B8A078"/></g>' % (x + i * 40, y) for i in range(n))

def boat(x, y, s=1):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-80 0 q80 30 160 0 l-14 -20 h-132z" fill="#6A4A2C"/><path d="M-60 -20 h120 v-40 h-120z" fill="#8A6A40"/>'
            '<path d="M-40 -60 h80 l-10 -20 h-60z" fill="#6A4A2C"/><rect x="-10" y="-46" width="20" height="14" fill="#3A2A1A"/></g>') % (x, y, s)

def rainbow(cx, cy, r0=150, op=".45"):
    return "".join('<path d="M%d %d a%d %d 0 0 1 %d 0" stroke="%s" stroke-width="9" fill="none" opacity="%s"/>' % (cx - r, cy, r, r, 2 * r, c, op)
                   for r, c in zip(range(r0, r0 - 54, -9), ("#E4573D", "#F0923A", "#F2C964", "#8DBD4C", "#5F9CB4", "#7A6AB8")))

def well(x, y, s=1):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-40 0 v-36 h80 v36z" fill="#A89478"/><g stroke="#7A6A54" stroke-width="2"><path d="M-40 -24 h80 M-40 -12 h80"/></g>'
            '<path d="M-34 -36 v-44 M34 -36 v-44 M-44 -80 h88" stroke="#6A4A2C" stroke-width="6"/><path d="M0 -80 v30" stroke="#3A2A1A" stroke-width="2"/><rect x="-8" y="-52" width="16" height="12" fill="#6A4A2C"/></g>') % (x, y, s)

def shofar(x, y, s=1):
    return '<g transform="translate(%d %d) scale(%s)"><path d="M0 0 q-10 -50 30 -76 q20 -12 40 -6 q-20 10 -30 30 q-12 26 -22 52z" fill="#C9B078"/><path d="M30 -76 q20 -12 40 -6" stroke="#8A7A44" stroke-width="3" fill="none"/></g>' % (x, y, s)

def harp(x, y, s=1):
    strings = "".join('<path d="M%d %d L%d %d"/>' % (12 + i * 9, -8 - i * 2, 12 + i * 9, -50 + i * 4) for i in range(5))
    return '<g transform="translate(%d %d) scale(%s)"><path d="M0 0 q6 -50 40 -64 q26 -8 50 6 q-6 24 -28 34 q-32 12 -62 24z" fill="#8A6A40"/><g stroke="#F2E6C8" stroke-width="1.2">%s</g></g>' % (x, y, s, strings)

def scales(x, y, s=1, c="#B8864A"):
    return ('<g transform="translate(%d %d) scale(%s)" stroke="%s" stroke-width="4" fill="none"><path d="M0 0 v-90 M-60 -80 h120"/>'
            '<path d="M-60 -80 l-20 40 h40z M60 -80 l-20 40 h40z"/><path d="M-30 0 h60" stroke-width="8"/></g>') % (x, y, s, c)

def fountain(x, y, s=1):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-90 0 v-24 h180 v24z" fill="#D8C8A8"/><rect x="-80" y="-22" width="160" height="10" fill="#6FA8C0"/>'
            '<path d="M-10 -24 v-30 h20 v30z" fill="#C8B898"/><ellipse cx="0" cy="-56" rx="30" ry="8" fill="#D8C8A8"/><path d="M0 -60 q-16 -20 -28 4 M0 -60 q16 -20 28 4" stroke="#A8D0DC" stroke-width="3" fill="none"/></g>') % (x, y, s)

def wrap(n, label, defs, body):
    s = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" preserveAspectRatio="xMidYMid slice" role="img" aria-label="%s" focusable="false"><defs>%s</defs>%s</svg>'
         % (W, H, label, defs, body))
    return "\n".join(l.strip() for l in s.splitlines() if l.strip())

def check(banners):
    from xml.dom import minidom
    import re
    for n in sorted(banners):
        minidom.parseString(banners[n])
        assert "--" not in banners[n], "double minus in banner %d" % n
        assert "<text" not in banners[n]
        ids = re.findall(r' id="([^"]+)"', banners[n]); assert len(ids) == len(set(ids)), n
        print(n, len(banners[n].encode("utf-8")), "bytes", "ok")

# ---- more pieces (added for the doors build, 2026-09-27) -------------------

def coins(x, y, n=5, c="#D9B45A", edge="#9A7A2A"):
    """A small stack of plain coins (no faces, no lettering)."""
    return "".join('<ellipse cx="%d" cy="%d" rx="22" ry="7" fill="%s" stroke="%s" stroke-width="2"/>' % (x, y - i * 7, c, edge) for i in range(n))

def house(x, y, s=1, wall="#E6D6B6", roof="#A8523A", door="#5A3A22", win="#F6D98A"):
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-50" y="-60" width="100" height="60" fill="%s"/><path d="M-62 -58 L0 -104 L62 -58z" fill="%s"/>'
            '<rect x="-12" y="-34" width="24" height="34" fill="%s"/><rect x="-40" y="-46" width="18" height="16" fill="%s"/><rect x="22" y="-46" width="18" height="16" fill="%s"/></g>') % (x, y, s, wall, roof, door, win, win)

def stall(x, y, s=1, a="#C8503A", b="#F4EAD2", goods=("#E4573D", "#F2C964", "#8DBD4C")):
    """A market stall with a striped awning and crates of fruit."""
    stripes = "".join('<path d="M%d -110 h20 l-4 30 h-20z" fill="%s"/>' % (-80 + i * 20, a if i % 2 == 0 else b) for i in range(8))
    fruit = "".join('<circle cx="%d" cy="%d" r="7" fill="%s"/>' % (-66 + i * 14, -46 - (i % 2) * 5, goods[i % len(goods)]) for i in range(10))
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-78 -80 v80 M78 -80 v80" stroke="#6A4A2C" stroke-width="5"/>%s'
            '<rect x="-80" y="-44" width="160" height="44" fill="#8A5A34"/><rect x="-80" y="-44" width="160" height="6" fill="#A8744A"/>%s</g>') % (x, y, s, stripes, fruit)

def skyline(y, fill="#2A3A5A", lit="#F6D98A", seed=7):
    g = rng(seed); out = ""; x = 0
    while x < W:
        w = 40 + next(g) % 60; h = 60 + next(g) % 140
        out += '<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (x, y - h, w, h, fill)
        for wy in range(y - h + 12, y - 10, 18):
            for wx in range(x + 8, x + w - 10, 14):
                if next(g) % 3 == 0: out += '<rect x="%d" y="%d" width="6" height="8" fill="%s" opacity=".8"/>' % (wx, wy, lit)
        x += w + 4
    return out

def pagoda(x, y, s=1, c="#8A3A2A", roof="#3A2A2A", tiers=4):
    out = '<g transform="translate(%d %d) scale(%s)">' % (x, y, s)
    for i in range(tiers):
        yy = -i * 40; w = 60 - i * 10
        out += '<rect x="%d" y="%d" width="%d" height="30" fill="%s"/>' % (-w + 12, yy - 30, 2 * w - 24, c)
        out += '<path d="M%d %d Q0 %d %d %d L%d %d H%dz" fill="%s"/>' % (-w - 12, yy - 26, yy - 44, w + 12, yy - 26, w - 6, yy - 40, -w + 6, roof)
    return out + '<path d="M0 %d v-30" stroke="%s" stroke-width="4"/></g>' % (-tiers * 40 + 4, roof)

def lotus(x, y, s=1, c="#E8A0B0"):
    return ('<g transform="translate(%d %d) scale(%s)"><ellipse cx="0" cy="4" rx="40" ry="8" fill="#4E7A3C"/>'
            '<g fill="%s"><path d="M0 0 q-10 -20 0 -40 q10 20 0 40z"/><path d="M0 0 q-28 -8 -30 -30 q22 4 30 30z"/><path d="M0 0 q28 -8 30 -30 q-22 4 -30 30z"/></g></g>') % (x, y, s, c)

def cave_mountain(x, y, s=1, rock="#7A5A4A", shade="#4A3A34"):
    """A rocky mountain with a small dark cave mouth (no figure)."""
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-220 0 L-120 -120 L-60 -150 L0 -210 L50 -170 L120 -130 L220 0z" fill="%s"/>'
            '<path d="M0 -210 L50 -170 L120 -130 L220 0 H40z" fill="%s" opacity=".5"/><path d="M-10 -120 q14 -26 30 0z" fill="#1A1414"/></g>') % (x, y, s, rock, shade)

def domes(x, y, s=1, wall="#E6D6B6", dome="#6FA0B8"):
    """A plain domed hall with arched doors (architecture, no emblems)."""
    return ('<g transform="translate(%d %d) scale(%s)"><rect x="-90" y="-70" width="180" height="70" fill="%s"/><path d="M-60 -70 a60 60 0 0 1 120 0z" fill="%s"/>'
            '<g fill="#3A2A1A" opacity=".6"><path d="M-66 0 v-30 a12 12 0 0 1 24 0 v30z"/><path d="M-12 0 v-40 a12 12 0 0 1 24 0 v40z"/><path d="M42 0 v-30 a12 12 0 0 1 24 0 v30z"/></g></g>') % (x, y, s, wall, dome)

def tower(x, y, s=1, c="#E6D6B6", cap="#6FA0B8"):
    """A slender plain tower."""
    return '<g transform="translate(%d %d) scale(%s)"><rect x="-10" y="-150" width="20" height="150" fill="%s"/><rect x="-15" y="-110" width="30" height="8" fill="%s"/><path d="M-12 -150 L0 -178 L12 -150z" fill="%s"/></g>' % (x, y, s, c, c, cap)

def ship(x, y, s=1, hull="#3A4A5A", cargo=("#C8503A", "#2E5A88", "#D9B45A", "#4E7A3C")):
    boxes = "".join('<rect x="%d" y="%d" width="36" height="18" fill="%s"/>' % (-110 + (i % 6) * 38, -40 - (i // 6) * 20, cargo[i % len(cargo)]) for i in range(12))
    return '<g transform="translate(%d %d) scale(%s)">%s<path d="M-140 -22 H160 l-24 30 H-120z" fill="%s"/><rect x="110" y="-66" width="30" height="44" fill="#E6D6B6"/></g>' % (x, y, s, boxes, hull)

def baobab(x, y, s=1, c="#6A4A34", leaf="#5E7A3C"):
    return ('<g transform="translate(%d %d) scale(%s)"><path d="M-26 0 q-8 -60 6 -110 h40 q14 50 6 110z" fill="%s"/>'
            '<path d="M-20 -110 l-40 -30 M0 -110 l-6 -44 M20 -110 l40 -26" stroke="%s" stroke-width="8" stroke-linecap="round"/>'
            '<g fill="%s"><ellipse cx="-60" cy="-146" rx="30" ry="12"/><ellipse cx="-6" cy="-160" rx="30" ry="12"/><ellipse cx="60" cy="-142" rx="30" ry="12"/></g></g>') % (x, y, s, c, c, leaf)

def lanterns(x, y, n=5, gap=90, cols=("#E4573D", "#F2C964", "#5F9CB4", "#8DBD4C")):
    line = '<path d="M%d %d Q%d %d %d %d" stroke="#6A5440" stroke-width="2" fill="none"/>' % (x, y, x + n * gap / 2, y + 30, x + n * gap, y)
    return line + "".join('<g transform="translate(%d %d)"><path d="M0 0 v10" stroke="#6A5440" stroke-width="2"/><ellipse cx="0" cy="26" rx="14" ry="18" fill="%s"/><ellipse cx="0" cy="26" rx="26" ry="28" fill="#FFE08A" opacity=".18"/></g>'
                          % (x + gap / 2 + i * gap, y + 30 - abs(i - (n - 1) / 2) * 8, cols[i % len(cols)]) for i in range(n))

def glow(p, x, y, r, c="#FFE08A", op=".45"):
    return rad(p + "gl%d" % x, [(0, c, op), (1, c, 0)]), '<circle cx="%d" cy="%d" r="%d" fill="url(#%sgl%d)"/>' % (x, y, r, p, x)

class Scene:
    """Collects defs and body; parts that return (defs, body) tuples are split."""
    def __init__(self, p): self.p, self.d, self.b = p, [], []
    def add(self, *parts):
        for x in parts:
            if isinstance(x, tuple): self.d.append(x[0]); self.b.append(x[1])
            else: self.b.append(x)
        return self
    def svg(self, label): return wrap(0, label, "".join(self.d), "".join(self.b))

def contact_sheet(banners, out_html):
    rows = "".join('<figure style="margin:0"><figcaption>%d</figcaption><div style="width:600px;height:210px">%s</div></figure>' % (n, banners[n].replace("<svg ", '<svg style="width:100%;height:100%" ', 1)) for n in sorted(banners))
    open(out_html, "w").write('<!doctype html><body style="margin:0;background:#0A1E33;color:#fff;font:14px sans-serif;display:flex;flex-wrap:wrap;gap:6px">%s</body>' % rows)
