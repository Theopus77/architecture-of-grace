#!/usr/bin/env python3
"""AOG-UNR-V1 — run after `make_hubs.py doors unr`: give unseen-realm-hub.html its own pencil
drawing (img/banners/unseen-realm-hub-pencil-*) as the single hero tile, and the hero-ink style
the other pencil hubs carry (Buddhist, Chinese, Hindu), so the hero words are dark ink on paper.
Copies both from chinese-classics-hub.html. Idempotent.  Run from aog-deploy/."""
import json, html, re
c = open('chinese-classics-hub.html', encoding='utf-8').read()
i = c.index('<div class="dr-collage">'); tile = c[i:c.index('</div></div>', i) + 12]
alt = json.load(open('_work/art/pencil/alt_unr_a.json'))['unseen-realm-hub']
tile = tile.replace('chinese-classics-hub-pencil', 'unseen-realm-hub-pencil')
tile = re.sub(r'alt="[^"]*"', 'alt="%s"' % html.escape(alt, quote=True), tile, count=1)
k = c.index('<style id="aog-dr-hero-ink">'); ink = c[k:c.index('</style>', k) + 8]
p = 'unseen-realm-hub.html'; s = open(p, encoding='utf-8').read()
a = s.index('<div class="dr-collage"'); depth = 0
for m in re.finditer(r'<div\b|</div>', s[a:]):
    depth += 1 if m.group() == '<div' else -1
    if depth == 0: e = a + m.end(); break
s = s[:a] + tile + s[e:]
if 'id="aog-dr-hero-ink"' not in s:
    h = s.index('</head>'); s = s[:h] + ink + '\n' + s[h:]
open(p, 'w', encoding='utf-8').write(s)
print('hub art: tile + hero ink ->', p)
