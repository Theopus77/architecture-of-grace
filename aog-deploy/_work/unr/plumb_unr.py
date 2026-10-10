#!/usr/bin/env python3
"""
AOG-UNR-V1 · site plumbing for The Unseen Realm course. Idempotent.
  · (hub page made later by _work/course/make_hubs.py; nothing to plumb here)
  · _redirects — /unseen-realm-course and /unr1 … /unr17
  · sw.js — CACHE bump + the course pages precached
  · sitemap.xml — the 18 pages
Run from aog-deploy/:  python3 _work/unr/plumb_unr.py
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
    if "/unseen-realm-course " not in s: add.append("/unseen-realm-course".ljust(28) + "/unseen-realm-course.html".ljust(42) + "200")
    if "/unseen-realm " not in s: add.append("/unseen-realm".ljust(28) + "/unseen-realm-hub.html".ljust(42) + "200")
    for u in UNITS:
        n = u["n"]
        if "/unr%d " % n not in s: add.append(("/unr%d" % n).ljust(28) + ("/unr-u%d.html" % n).ljust(42) + "200")
    if add:
        if not s.endswith("\n"): s += "\n"
        s += "\n# AOG-UNR-V1 — The Unseen Realm, K–12: the course contents and the units\n" + "\n".join(add) + "\n"
        p.write_text(s, encoding="utf-8")
    print("redirects: %d added" % len(add))

def sw():
    p = DEPLOY / "sw.js"; s = p.read_text(encoding="utf-8")
    if "unr-u1.html" in s:
        print("sw: already precaches the course"); return
    m = re.search(r"^const CACHE = '(aog-cache-[0-9.]+\.)([a-z]*)(\d+)'(.*)$", s, re.M)
    oldtag = m.group(2) + m.group(3)
    new = "%s%s%d" % (m.group(1), m.group(2), int(m.group(3)) + 1)   # always one past whatever is live
    line = ("const CACHE = '%s'   // THE UNSEEN REALM AS A COURSE. /unseen-realm-course, /unseen-realm and /unr1…: a K–12 course built by _work/unr/build_unr.py; every page's The Unseen Realm jump groups list the course first. previous: %s%s" % (new, oldtag, m.group(4)))
    s = s[:m.start()] + line + s[m.end():]
    add = "  './unseen-realm-course.html', " + ", ".join("'./unr-u%d.html'" % u["n"] for u in UNITS) + ",   // AOG-UNR-V1 — The Unseen Realm course\n"
    n = re.search(r"const PRECACHE_LESSONS = \[\n", s).end()
    s = s[:n] + add + s[n:]
    p.write_text(s, encoding="utf-8"); print("sw: CACHE → %s, %d files precached" % (new, len(UNITS) + 1))

def sitemap():
    p = DEPLOY / "sitemap.xml"; s = p.read_text(encoding="utf-8")
    if "/unseen-realm-course<" in s:
        print("sitemap: already listed"); return
    rows = ['  <url><loc>https://architectureofgrace.com/unseen-realm-course</loc><lastmod>%s</lastmod><priority>0.8</priority></url>' % TODAY]
    rows += ['  <url><loc>https://architectureofgrace.com/unr%d</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (u["n"], TODAY) for u in UNITS]
    s = s.replace("</urlset>", "\n".join(rows) + "\n</urlset>")
    p.write_text(s, encoding="utf-8"); print("sitemap: %d added" % (len(UNITS) + 1))

if __name__ == "__main__":
    hub(); redirects(); sw(); sitemap()
