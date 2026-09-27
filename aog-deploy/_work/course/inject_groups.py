#!/usr/bin/env python3
"""
AOG — give every page's #jumpSel the empty "<Course> · Grades …" optgroups a
course needs (idempotent). Labels come from _work/<id>/build_<id>.jump_groups(),
so they never drift. A missing band group goes right before the course's next
existing band group (so K–8 lands ahead of 9–10), else after the course's last
group, else at the end of the menu.

Run from aog-deploy/:  python3 _work/course/inject_groups.py <id> [paths…]
"""
import os, re, sys, glob, importlib
HERE = os.path.dirname(os.path.abspath(__file__))
DEPLOY = os.path.abspath(os.path.join(HERE, "..", ".."))
cid = sys.argv[1]
sys.path.insert(0, os.path.join(HERE, "..", cid)); sys.path.insert(0, HERE)
LABELS = [l for l, _ in importlib.import_module("build_" + cid).jump_groups()]
SEL_RE = re.compile(r'(<select id="jumpSel"[^>]*>)(.*?)(</select>)', re.S)

def add_groups(html):
    m = SEL_RE.search(html)
    if not m: return html, False
    body = m.group(2); changed = False
    for i, l in enumerate(LABELS):
        tag = '<optgroup label="%s">' % l
        if tag in body: continue
        new = tag + "\n</optgroup>\n"
        later = [body.find('<optgroup label="%s">' % x) for x in LABELS[i + 1:]]
        later = [p for p in later if p >= 0]
        if later:
            p = min(later); body = body[:p] + new + body[p:]
        else:
            earlier = [(body.find('<optgroup label="%s">' % x)) for x in LABELS[:i]]
            earlier = [p for p in earlier if p >= 0]
            if earlier:
                p = body.find("</optgroup>", max(earlier)) + len("</optgroup>")
                body = body[:p] + "\n" + new.rstrip("\n") + body[p:]
            else:
                body = body.rstrip() + "\n" + new
        changed = True
    return html[:m.start(2)] + body + html[m.end(2):], changed

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
    print("pages with #jumpSel: %d · %s optgroups added on: %d · labels: %s" % (seen, cid, done, " | ".join(LABELS)))

if __name__ == "__main__":
    main(sys.argv[2:])
