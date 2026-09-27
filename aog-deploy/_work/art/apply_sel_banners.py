#!/usr/bin/env python3
"""Put the SEL pencil drawings into the SEL room pages (AOG-SEL-PENCIL-V1).

Run from anywhere:   python3 _work/art/apply_sel_banners.py [--root DIR] [--undo-check]

Each SEL room unit (Room 12/18/36/104/207, units 1-4) has one pencil still life,
img/banners/sel<room>-u<n>-pencil-{1600.webp,900.webp,900.jpg}, drawn from
_work/art/kit/scenes/sel<room>-u<n>-still.glsl (see pencil/sel_scenes.py).
The old drawn SVG scene for that unit (its ids start "sb<room>u<n>-") is swapped for the
drawing wherever it appears: the room's lessons page (one scene per unit), its scenario
cards page and the interactive worksheet pages. The swap keeps the scene's own attributes
(data-scene, hidden), adds the navy cover (the same veil as the unit banners) so the cream
title stays readable, and rewrites the credit line to "Pencil drawing, not a photograph: …".
Lesson text is never touched. Safe to re-run: a scene already swapped is regenerated.
"""
import html, json, os, re, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
for i, a in enumerate(sys.argv):
    if a == '--root' and i + 1 < len(sys.argv): ROOT = os.path.abspath(sys.argv[i + 1])
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'pencil'))
from sel_scenes import S                      # uid -> (what the drawing shows, objects)
ALT = {u: 'A pencil drawing of ' + d for u, (d, _) in S.items()}
CREDIT_LEAD = 'Pencil drawing, not a photograph: '
VEIL = '<span class="pencil-veil" aria-hidden="true"></span>'
VEIL_CSS = ('<style id="aog-pencil-veil">.spread .scene .pencil-veil{position:absolute;inset:0;display:block;pointer-events:none;'
            'background:linear-gradient(90deg,rgba(10,30,51,.93) 0%,rgba(10,30,51,.86) 28%,rgba(10,30,51,.6) 42%,rgba(10,30,51,.22) 53%,rgba(10,30,51,0) 61%),'
            'linear-gradient(180deg,rgba(10,30,51,0) 42%,rgba(10,30,51,.86) 78%,rgba(10,30,51,.95) 100%)}'
            '@media (max-width:720px){.spread .scene .pencil-veil{background:linear-gradient(180deg,rgba(10,30,51,.06) 0%,'
            'rgba(10,30,51,.16) 22%,rgba(10,30,51,.76) 35%,rgba(10,30,51,.93) 44%,rgba(10,30,51,.97) 100%)}}</style>')
# an unswapped scene (a drawn SVG) or one this script already swapped
SCENE = re.compile(r'<div class="scene"((?: data-scene="u\d")?(?: hidden)?) aria-hidden="true"(?: data-aog-render="[a-z0-9-]+")?(?: data-aog-style="pencil")?>'
                   r'(<svg\b.*?</svg>|<picture\b.*?</picture>' + re.escape(VEIL) + r')</div>', re.S)
CREDIT = re.compile(r'<div class="credit">(.*?)</div>', re.S)

def picture(uid, attrs, eager):
    b = 'img/banners/' + uid + '-pencil'
    load = ' fetchpriority="high"' if eager else ' loading="lazy"'
    return ('<div class="scene"%s aria-hidden="true" data-aog-render="%s" data-aog-style="pencil"><picture style="display:block;width:100%%;height:100%%">'
            '<source type="image/webp" srcset="%s-900.webp 900w, %s-1600.webp 1600w" sizes="(max-width: 720px) 860px, min(100vw, 1200px)">'
            '<img src="%s-900.jpg" srcset="%s-900.jpg 900w" sizes="(max-width: 720px) 860px, min(100vw, 1200px)" width="1600" height="560" '
            'alt="%s" decoding="async"%s style="display:block;width:100%%;height:100%%;object-fit:cover;object-position:85%% 45%%"></picture>%s</div>'
            % (attrs, uid, b, b, b, b, html.escape(ALT[uid], quote=True), load, VEIL))

def uid_of(inner):
    m = re.search(r'data-aog-render="(sel\d+-u\d)"', inner) or None
    m = re.search(r'\bid="sb(\d+)u(\d)-', inner)
    return 'sel%s-u%s' % m.groups() if m else None

def have(uid):
    d = os.path.join(ROOT, 'img', 'banners', uid + '-pencil')
    return all(os.path.exists(d + s) for s in ('-1600.webp', '-900.webp', '-900.jpg'))

def process(path):
    s = open(path, encoding='utf-8').read(); out = []; pos = 0; n = 0; first = True; got = {}
    for m in SCENE.finditer(s):
        whole = m.group(0)
        r = re.search(r'data-aog-render="(sel\d+-u\d)"', whole)
        uid = r.group(1) if r else uid_of(m.group(2))
        if not uid or uid not in S or not have(uid): continue
        out.append(s[pos:m.start()]); out.append(picture(uid, m.group(1), first)); pos = m.end(); first = False; n += 1; got[m.group(1)] = uid
        c = CREDIT.match(s, pos) or CREDIT.match(s, pos + len(re.match(r'\s*', s[pos:]).group(0)))
        if c:
            out.append(s[pos:c.start()]); out.append('<div class="credit">%s</div>' % html.escape(CREDIT_LEAD + ALT[uid][len('A pencil drawing of '):], quote=False)); pos = c.end()
    if not n: return 0
    out.append(s[pos:]); new = ''.join(out)
    # the lessons page fills its credit line from a CREDITS table, one per unit
    def credits(mm):
        d = json.loads(mm.group(1))
        for k in d:
            u = next((v for a, v in got.items() if ('"%s"' % k) in a), None)
            if u: d[k] = CREDIT_LEAD + ALT[u][len('A pencil drawing of '):]
        return 'CREDITS=' + json.dumps(d, ensure_ascii=False)
    new = re.sub(r'CREDITS=(\{[^}]*\})', credits, new, count=1)
    new = new.replace('the banners are drawn scenes, not photographs.', 'the banners are pencil drawings, not photographs.')
    new = new.replace('los banners son escenas dibujadas, no fotografías.', 'los banners son dibujos a lápiz, no fotografías.')
    new = re.sub(r'<style id="aog-pencil-veil">.*?</style>', '', new, flags=re.S)
    new = new.replace('</head>', VEIL_CSS + '</head>', 1)
    if new != s: open(path, 'w', encoding='utf-8').write(new)
    print('%-40s %d banner(s)' % (os.path.basename(path), n))
    return n

def main():
    total = 0
    for f in sorted(os.listdir(ROOT)):
        if f.endswith('.html') and f not in ('index.html', 'turn-ins.html') and not f.startswith('room-') or re.fullmatch(r'room-(12|18|36|104|207)-(lessons|cards)\.html', f):
            if f.endswith('.html'): total += process(os.path.join(ROOT, f))
    print('SEL pencil scenes swapped:', total)

if __name__ == '__main__':
    main()
