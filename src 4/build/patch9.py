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

# Insert right after the p2-grow section's closing </section>.
anchor_txt = 'See how the whole system connects'
ai = s.index(anchor_txt)
close = s.index('</section>', ai) + len('</section>')
INSERT = ('\n\n      <!-- ===== PRIMARY CTAs — moved directly below "How one answer becomes growth" ===== -->\n'
          '      ' + block + '\n')
s = s[:close] + INSERT + s[close:]

# 2) Localize the top-bar Library / Tools links (keys registered in grace-tools.js)
s = replace_once(s, '<span>Library</span>', '<span data-i18n="aog_lib_nav">Library</span>', "topbar Library")
s = replace_once(s, '<span>Tools</span>', '<span data-i18n="aog_tools_nav">Tools</span>', "topbar Tools")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
