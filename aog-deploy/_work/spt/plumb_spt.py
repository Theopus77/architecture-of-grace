#!/usr/bin/env python3
"""
AOG-SPT-V1 · site plumbing for the Sports History course. Idempotent.
  · (hub page made later by _work/course/make_hubs.py; nothing to plumb here)
  · _redirects — /sports-course and /spt1 … /spt17
  · sw.js — CACHE bump + the course pages precached
  · sitemap.xml — the 18 pages
Run from aog-deploy/:  python3 _work/spt/plumb_spt.py
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
    print("hub: made by _work/course/make_hubs.py — nothing to do here")

def redirects():
    p = DEPLOY / "_redirects"; s = p.read_text(encoding="utf-8")
    add = []
    if "/sports-course " not in s: add.append("/sports-course".ljust(28) + "/sports-course.html".ljust(42) + "200")
    if "/sports " not in s: add.append("/sports".ljust(28) + "/sports-hub.html".ljust(42) + "200")
    for u in UNITS:
        n = u["n"]
        if "/spt%d " % n not in s: add.append(("/spt%d" % n).ljust(28) + ("/spt-u%d.html" % n).ljust(42) + "200")
    if add:
        if not s.endswith("\n"): s += "\n"
        s += "\n# AOG-SPT-V1 — Sports History, K–12: the course contents and the units\n" + "\n".join(add) + "\n"
        p.write_text(s, encoding="utf-8")
    print("redirects: %d added" % len(add))

def sw():
    p = DEPLOY / "sw.js"; s = p.read_text(encoding="utf-8")
    if "spt-u1.html" in s:
        print("sw: already precaches the course"); return
    m = re.search(r"^const CACHE = '(aog-cache-[0-9.]+\.)([a-z]*)(\d+)'(.*)$", s, re.M)
    oldtag = m.group(2) + m.group(3)
    new = "%s%s%d" % (m.group(1), m.group(2), int(m.group(3)) + 1)   # always one past whatever is live
    line = ("const CACHE = '%s'   // SPORTS HISTORY AS A COURSE. /sports-course, /sports and /spt1…: a K–12 course built by _work/spt/build_spt.py; every page's Sports History jump groups list the course first. previous: %s%s" % (new, oldtag, m.group(4)))
    s = s[:m.start()] + line + s[m.end():]
    add = "  './sports-course.html', " + ", ".join("'./spt-u%d.html'" % u["n"] for u in UNITS) + ",   // AOG-SPT-V1 — the Sports History course\n"
    n = re.search(r"const PRECACHE_LESSONS = \[\n", s).end()
    s = s[:n] + add + s[n:]
    p.write_text(s, encoding="utf-8"); print("sw: CACHE → %s, %d files precached" % (new, len(UNITS) + 1))

def sitemap():
    p = DEPLOY / "sitemap.xml"; s = p.read_text(encoding="utf-8")
    if "/sports-course<" in s:
        print("sitemap: already listed"); return
    rows = ['  <url><loc>https://architectureofgrace.com/sports-course</loc><lastmod>%s</lastmod><priority>0.8</priority></url>' % TODAY]
    rows += ['  <url><loc>https://architectureofgrace.com/spt%d</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (u["n"], TODAY) for u in UNITS]
    s = s.replace("</urlset>", "\n".join(rows) + "\n</urlset>")
    p.write_text(s, encoding="utf-8"); print("sitemap: %d added" % (len(UNITS) + 1))

if __name__ == "__main__":
    hub(); redirects(); sw(); sitemap()
