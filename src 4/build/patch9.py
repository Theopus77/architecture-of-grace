#!/usr/bin/env python3
import re
SRC = "index_v8.html"
OUT = "index_v9.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# 1) Move the 3 hero CTA "doors" to directly below the "How one answer becomes
#    growth" framework-in-motion section (currently they sit at the bottom of the
#    hero, after the four pillars + statement). Both spots are inside .hyb-hero,
#    so the move is a structurally safe reorder.
m = re.search(r'\n[ \t]*<div class="hyb-cta-row">.*?</div>', s, re.S)
if not m:
    raise SystemExit("[FAIL] hyb-cta-row block not found")
block = m.group(0).strip('\n')
s = s[:m.start()] + s[m.end():]   # remove from old position

# Insert right BEFORE the "How one answer becomes growth" (p2-grow) section, so
# the primary doors come first (right under the hero) and the walkthrough plays
# afterwards as the supporting "here's how it all connects" beat.
open_anchor = '<section class="p2-grow reveal" aria-labelledby="p2GrowH">'
oi = s.index(open_anchor)
line_start = s.rfind('\n', 0, oi) + 1   # start of the <section> line, keep indent
INSERT = ('      <!-- ===== PRIMARY CTAs — placed above "How one answer becomes growth" ===== -->\n'
          '      ' + block + '\n\n')
s = s[:line_start] + INSERT + s[line_start:]

# 2) Localize the top-bar Library / Tools links (keys registered in grace-tools.js)
s = replace_once(s, '<span>Library</span>', '<span data-i18n="aog_lib_nav">Library</span>', "topbar Library")
s = replace_once(s, '<span>Tools</span>', '<span data-i18n="aog_tools_nav">Tools</span>', "topbar Tools")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
