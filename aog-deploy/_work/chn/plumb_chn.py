#!/usr/bin/env python3
"""
AOG-CHN-V1 · site plumbing for the Chinese Classics course. Idempotent.
  · (hub page made later by _work/course/make_hubs.py; nothing to plumb here)
  · _redirects — /chinese-classics-course and /chn1 … /chn17
  · sw.js — CACHE bump + the course pages precached
  · sitemap.xml — the 18 pages
Run from aog-deploy/:  python3 _work/chn/plumb_chn.py
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
    if "/chinese-classics-course " not in s: add.append("/chinese-classics-course".ljust(28) + "/chinese-classics-course.html".ljust(42) + "200")
    if "/chinese-classics " not in s: add.append("/chinese-classics".ljust(28) + "/chinese-classics-hub.html".ljust(42) + "200")
    for u in UNITS:
        n = u["n"]
        if "/chn%d " % n not in s: add.append(("/chn%d" % n).ljust(28) + ("/chn-u%d.html" % n).ljust(42) + "200")
    if add:
        if not s.endswith("\n"): s += "\n"
        s += "\n# AOG-CHN-V1 — Chinese Classics, K–12: the course contents and the units\n" + "\n".join(add) + "\n"
        p.write_text(s, encoding="utf-8")
    print("redirects: %d added" % len(add))

def sw():
    p = DEPLOY / "sw.js"; s = p.read_text(encoding="utf-8")
    if "chn-u1.html" in s:
        print("sw: already precaches the course"); return
    m = re.search(r"^const CACHE = '(aog-cache-[0-9.]+)'(.*)$", s, re.M)
    old = m.group(1)
    pre, num = old.rsplit(".", 1)
    new = "%s.%d" % (pre, int(num) + 1)   # always one past whatever is live, never a fixed number
    line = ("const CACHE = '%s'   // CHINESE CLASSICS AS A COURSE. /chinese-classics-course, /chinese-classics and /chn1…: a K–12 course built by _work/chn/build_chn.py; every page's Chinese Classics jump groups list the course first.\n"
            "// previous: const CACHE = '%s'%s" % (new, old, m.group(2)))
    s = s[:m.start()] + line + s[m.end():]
    add = "  './chinese-classics-course.html', " + ", ".join("'./chn-u%d.html'" % u["n"] for u in UNITS) + ",   // AOG-CHN-V1 — the Chinese Classics course\n"
    n = re.search(r"const PRECACHE_LESSONS = \[\n", s).end()
    s = s[:n] + add + s[n:]
    p.write_text(s, encoding="utf-8"); print("sw: CACHE → %s, %d files precached" % (new, len(UNITS) + 1))

def sitemap():
    p = DEPLOY / "sitemap.xml"; s = p.read_text(encoding="utf-8")
    if "/chinese-classics-course<" in s:
        print("sitemap: already listed"); return
    rows = ['  <url><loc>https://architectureofgrace.org/chinese-classics-course</loc><lastmod>%s</lastmod><priority>0.8</priority></url>' % TODAY]
    rows += ['  <url><loc>https://architectureofgrace.org/chn%d</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (u["n"], TODAY) for u in UNITS]
    s = s.replace("</urlset>", "\n".join(rows) + "\n</urlset>")
    p.write_text(s, encoding="utf-8"); print("sitemap: %d added" % (len(UNITS) + 1))

if __name__ == "__main__":
    hub(); redirects(); sw(); sitemap()
