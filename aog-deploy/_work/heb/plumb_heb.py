#!/usr/bin/env python3
"""
AOG-HEB-V1 · site plumbing for the Hebrew Bible course. Idempotent.
  · (no hub page for this course — its practice rooms are the Daily Drafts spiral; nothing to plumb)
  · _redirects — /hebrew-bible-course and /heb1 … /heb24
  · sw.js — CACHE bump + the course pages precached
  · sitemap.xml — the 25 pages
Run from aog-deploy/:  python3 _work/heb/plumb_heb.py
"""
import re, html, datetime, sys, os
from pathlib import Path
HERE = Path(__file__).resolve().parent
DEPLOY = HERE.parent.parent
sys.path.insert(0, str(HERE))
from outline import UNITS, BANDS
E = lambda s: html.escape(s, quote=True)
TODAY = datetime.date.today().isoformat()
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}

def desc_of(u):
    return "; ".join(c["title"] for c in u["chapters"]) + "."

def hub():
    print("hub: this course has no hub page (its rooms are the Daily Drafts spiral) — nothing to do")

def redirects():
    p = DEPLOY / "_redirects"; s = p.read_text(encoding="utf-8")
    add = []
    if "/hebrew-bible-course " not in s: add.append("/hebrew-bible-course".ljust(28) + "/hebrew-bible-course.html".ljust(42) + "200")
    if "/hebrew-bible " not in s: add.append("/hebrew-bible".ljust(28) + "/hebrew-bible-course.html".ljust(42) + "200")
    for u in UNITS:
        n = u["n"]
        if "/heb%d " % n not in s: add.append(("/heb%d" % n).ljust(28) + ("/heb-u%d.html" % n).ljust(42) + "200")
    if add:
        if not s.endswith("\n"): s += "\n"
        s += "\n# AOG-HEB-V1 — The Hebrew Bible, K–12: the course contents and the units\n" + "\n".join(add) + "\n"
        p.write_text(s, encoding="utf-8")
    print("redirects: %d added" % len(add))

def sw():
    p = DEPLOY / "sw.js"; s = p.read_text(encoding="utf-8")
    if "heb-u1.html" in s:
        print("sw: already precaches the course"); return
    m = re.search(r"^const CACHE = '(aog-cache-[0-9.]+)'(.*)$", s, re.M)
    old = m.group(1)
    pre, num = old.rsplit(".", 1)
    new = "%s.%d" % (pre, int(num) + 1)   # always one past whatever is live, never a fixed number
    line = ("const CACHE = '%s'   // THE HEBREW BIBLE AS A COURSE. /hebrew-bible-course, /hebrew-bible and /heb1…: a K–12 course built by _work/heb/build_heb.py; every page's The Hebrew Bible jump groups list the course first.\n"
            "// previous: const CACHE = '%s'%s" % (new, old, m.group(2)))
    s = s[:m.start()] + line + s[m.end():]
    add = "  './hebrew-bible-course.html', " + ", ".join("'./heb-u%d.html'" % u["n"] for u in UNITS) + ",   // AOG-HEB-V1 — the Hebrew Bible course\n"
    n = re.search(r"const PRECACHE_LESSONS = \[\n", s).end()
    s = s[:n] + add + s[n:]
    p.write_text(s, encoding="utf-8"); print("sw: CACHE → %s, %d files precached" % (new, len(UNITS) + 1))

def sitemap():
    p = DEPLOY / "sitemap.xml"; s = p.read_text(encoding="utf-8")
    if "/hebrew-bible-course<" in s:
        print("sitemap: already listed"); return
    rows = ['  <url><loc>https://architectureofgrace.org/hebrew-bible-course</loc><lastmod>%s</lastmod><priority>0.8</priority></url>' % TODAY]
    rows += ['  <url><loc>https://architectureofgrace.org/heb%d</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (u["n"], TODAY) for u in UNITS]
    s = s.replace("</urlset>", "\n".join(rows) + "\n</urlset>")
    p.write_text(s, encoding="utf-8"); print("sitemap: %d added" % (len(UNITS) + 1))

if __name__ == "__main__":
    hub(); redirects(); sw(); sitemap()
