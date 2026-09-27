#!/usr/bin/env python3
"""Swap drawn SVG unit banners for rendered pictures (AOG-RENDERED-BANNERS-V1).

Run after any course build:   python3 _work/art/apply_banners.py   (from aog-deploy/)

For every unit <id> (e.g. bib-u1) that has img/banners/<id>-1600.webp, -900.webp and
-900.jpg, this replaces the banner scene
    <div class="scene" aria-hidden="true"><svg ...>...</svg></div>
on the unit page (<id>.html, the top banner: loads eagerly) and on its course contents
page (the spread whose "Open the unit" link points at <id>.html: loads lazily) with a
<picture>, and rewrites that spread's credit line to "Rendered scene, not a photograph: …".
The SVG is dropped. Alt text comes from _work/art/banners.json, else from the old SVG's
aria-label. Idempotent: a scene already swapped (data-aog-render) is regenerated in place.
Never touches index.html or turn-ins.html.
"""
import html, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SKIP = {'index.html', 'turn-ins.html'}
MAN = json.load(open(os.path.join(os.path.dirname(__file__), 'banners.json')))

def rendered():
    d = os.path.join(ROOT, 'img', 'banners'); out = set()
    if not os.path.isdir(d): return out
    for f in os.listdir(d):
        m = re.fullmatch(r'([a-z]+-u\d+)-1600\.webp', f)
        if m and all(os.path.exists(os.path.join(d, m.group(1) + s)) for s in ('-900.webp', '-900.jpg')):
            out.add(m.group(1))
    return out

SCENE = re.compile(r'<div class="scene" aria-hidden="true"(?: data-aog-render="([a-z]+-u\d+)")?>(.*?)</div>', re.S)
CREDIT = re.compile(r'<div class="credit">(.*?)</div>', re.S)

def label_of(inner):
    m = re.search(r'aria-label="([^"]*)"', inner) or re.search(r'<title>(.*?)</title>', inner, re.S)
    if not m: m = re.search(r'\balt="([^"]*)"', inner)
    t = html.unescape(m.group(1)) if m else ''
    return re.sub(r'^(Drawn|Rendered) scene(, not a photograph)?:\s*', '', t).strip()

def picture(uid, alt, eager):
    b = 'img/banners/' + uid
    load = ' fetchpriority="high"' if eager else ' loading="lazy"'
    return ('<div class="scene" aria-hidden="true" data-aog-render="%s"><picture style="display:block;width:100%%;height:100%%">'
            '<source type="image/webp" srcset="%s-900.webp 900w, %s-1600.webp 1600w" sizes="(max-width: 720px) 860px, min(100vw, 1200px)">'
            '<img src="%s-900.jpg" srcset="%s-900.jpg 900w" sizes="(max-width: 720px) 860px, min(100vw, 1200px)" width="1600" height="560" '
            'alt="%s" decoding="async"%s style="display:block;width:100%%;height:100%%;object-fit:cover;object-position:50%% 45%%"></picture></div>'
            % (uid, b, b, b, b, html.escape(alt, quote=True), load))

def process(path, done):
    name = os.path.basename(path)
    s = open(path, encoding='utf-8').read(); out = []; pos = 0; n = 0
    for m in SCENE.finditer(s):
        inner = m.group(2)
        if m.group(1) is None and not inner.lstrip().startswith('<svg'): continue
        # which unit: the unit page itself, or the spread's "Open the unit" link
        nxt = SCENE.search(s, m.end()); stop = nxt.start() if nxt else len(s)
        link = re.search(r'class="enter" href="([a-z]+-u\d+)\.html"', s[m.end():stop])
        if re.fullmatch(r'[a-z]+-u\d+\.html', name): uid = name[:-5]
        else: uid = link.group(1) if link else None
        if uid is None or uid not in done: continue
        old = label_of(inner)
        alt = MAN.get(uid, {}).get('alt') or old
        unit_page = (name == uid + '.html')
        out.append(s[pos:m.start()]); out.append(picture(uid, alt, eager=unit_page)); pos = m.end()
        # credit line in this spread (first credit before the next scene)
        c = CREDIT.search(s, m.end(), stop)
        if c:
            out.append(s[pos:c.start()])
            out.append('<div class="credit">%s</div>' % html.escape('Rendered scene, not a photograph: ' + alt, quote=False))
            pos = c.end()
        n += 1
    if n:
        out.append(s[pos:]); new = ''.join(out)
        if new != s: open(path, 'w', encoding='utf-8').write(new)
        print('%-28s %d banner(s)' % (name, n))
    return n

def main():
    done = rendered()
    if not done: print('no rendered banners in img/banners'); return
    total = 0
    for f in sorted(os.listdir(ROOT)):
        if f.endswith('.html') and f not in SKIP:
            total += process(os.path.join(ROOT, f), done)
    print('rendered units:', ' '.join(sorted(done)), '| scenes swapped:', total)

if __name__ == '__main__':
    main()
