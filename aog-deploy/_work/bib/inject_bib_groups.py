#!/usr/bin/env python3
"""
AOG-BIB-V1 — one-off (idempotent): give every page's #jumpSel the five empty
"The Bible · Grades …" optgroups, so build_bib.py (which only fills groups that
already exist in the lifted s13 menu) and inject_bib_jump.py have somewhere to
put the course. The labels come from build_bib.jump_groups(), so they can never
drift. The groups go after the page's last optgroup, right before </select>.

Run from aog-deploy/:  python3 _work/bib/inject_bib_groups.py   [paths…]
"""
import os, re, sys, glob
HERE = os.path.dirname(os.path.abspath(__file__))
DEPLOY = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "..", "course"))
from build_bib import jump_groups

LABELS = [label for label, _ in jump_groups()]
SEL_RE = re.compile(r'(<select id="jumpSel"[^>]*>)(.*?)(</select>)', re.S)

def add_groups(html):
    m = SEL_RE.search(html)
    if not m: return html, False
    body = m.group(2)
    missing = [l for l in LABELS if ('<optgroup label="%s">' % l) not in body]
    if not missing: return html, False
    add = "".join('<optgroup label="%s">\n</optgroup>\n' % l for l in missing)
    body2 = body.rstrip()
    body2 = body2 + "\n" + add
    return html[:m.start(2)] + body2 + html[m.end(2):], True

def main(argv):
    files = [os.path.abspath(p) for p in argv] if argv else sorted(glob.glob(os.path.join(DEPLOY, "*.html")))
    seen = done = 0
    for p in files:
        html = open(p, encoding="utf-8").read()
        if 'id="jumpSel"' not in html: continue
        seen += 1
        html2, ch = add_groups(html)
        if ch:
            open(p, "w", encoding="utf-8").write(html2); done += 1
    print("pages with #jumpSel: %d · The Bible optgroups added: %d · labels: %s" % (seen, done, " | ".join(LABELS)))

if __name__ == "__main__":
    main(sys.argv[1:])
