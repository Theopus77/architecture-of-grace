#!/usr/bin/env python3
"""
AOG-BUD-V1 — put the Buddhist Texts course at the head of every page's five
"Buddhist Texts · Grades …" jump-menu groups. The same rules as _work/jump/inject_jump.py:
idempotent, skips a value already present, never duplicates a page's own
`<option value="" selected>` line (matched on the text after the last "·").

Run from aog-deploy/:  python3 _work/bud/inject_bud_jump.py   [paths…]
"""
import os, re, sys, glob
HERE = os.path.dirname(os.path.abspath(__file__))
DEPLOY = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from outline import UNITS, BANDS

NBSP4 = "&nbsp;&nbsp;&nbsp;&nbsp;"
SELECTED_RE = re.compile(r'<option value="" selected>([^<]*)</option>')
OPTION_TAG_RE = re.compile(r'<option value="([^"]*)"')

def tail(text):
    t = text.replace("&nbsp;", " ")
    if "·" in t: t = t.rsplit("·", 1)[1]
    return " ".join(t.split()).strip().lower()

GROUPS = []
for b in BANDS:
    opts = [("buddhist-texts-course.html", "Buddhist Texts · Course contents")]
    opts += [("bud-u%d.html" % u["n"], "%sUnit %d · %s" % (NBSP4, u["n"], u["title"])) for u in UNITS if u["band"] == b["id"]]
    GROUPS.append((re.compile(r'<optgroup label="Buddhist Texts · %s">(.*?)</optgroup>' % re.escape(b["title"]), re.S), opts))

def add_course(html):
    changed = False
    for rx, opts in GROUPS:
        m = rx.search(html)
        if not m: continue
        body = m.group(1)
        present = set(OPTION_TAG_RE.findall(body))
        own = [tail(s) for s in SELECTED_RE.findall(body)]
        lines = ['<option value="%s">%s</option>' % (v, t) for v, t in opts if v not in present and tail(t) not in own]
        if not lines: continue
        new_body = "\n" + "\n".join(lines) + (body if body.startswith("\n") else "\n" + body)
        s, e = m.span(1)
        html = html[:s] + new_body + html[e:]
        changed = True
    return html, changed

def main(argv):
    files = [os.path.abspath(p) for p in argv] if argv else sorted(glob.glob(os.path.join(DEPLOY, "*.html")))
    seen = done = 0
    for p in files:
        html = open(p, encoding="utf-8").read()
        if 'id="jumpSel"' not in html: continue
        seen += 1
        html2, ch = add_course(html)
        if ch:
            open(p, "w", encoding="utf-8").write(html2); done += 1
    print("pages with #jumpSel: %d · Buddhist Texts course added to its group: %d" % (seen, done))

if __name__ == "__main__":
    main(sys.argv[1:])
