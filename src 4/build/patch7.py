#!/usr/bin/env python3
SRC = "index_v6.html"
OUT = "index_v7.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# 1) Library: remove the two top featured novel previews (duplicated below in the
#    "Free to read & download" shelf). Delete from the FEATURED NOVEL PREVIEW
#    comment up to (but not including) the CONSOLIDATED FREE SHELF comment.
A = '<!-- ============ FEATURED NOVEL PREVIEW ============ -->'
B = '<!-- ============ CONSOLIDATED FREE SHELF ============ -->'
if s.count(A) != 1 or s.count(B) != 1:
    raise SystemExit("[FAIL] library markers not unique")
a_idx = s.index(A); a_line = s.rfind('\n', 0, a_idx) + 1
b_idx = s.index(B); b_line = s.rfind('\n', 0, b_idx) + 1
s = s[:a_line] + s[b_line:]

# 2) Tools page: drop the "FOR CLASSROOM AIDES" eyebrow (tools are universal now).
s = replace_once(s,
    '      <div class="eyebrow">FOR CLASSROOM AIDES</div>\n',
    '',
    "remove tools eyebrow")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
