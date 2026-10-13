#!/usr/bin/env python3
"""
AOG-SKT-V1 · site plumbing for the Skateboarding course (the Skate Lab and the Daily Practice book were removed 2026-10-13). Idempotent.
  · (hub page made by _work/course/make_hubs.py)
  · _redirects — /skateboarding-course, /skateboarding (hub), /skt1 … /skt18
  · sw.js — CACHE bump (the old line kept as a comment) + the course pages precached
  · sitemap.xml — the course, its units and the hub
Run from aog-deploy/:  python3 _work/skt/plumb_skt.py
"""
import re, datetime, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
DEPLOY = HERE.parent.parent
sys.path.insert(0, str(HERE))
from outline import UNITS
TODAY = datetime.date.today().isoformat()

def redirects():
    p = DEPLOY / "_redirects"; s = p.read_text(encoding="utf-8")
    want = [("/skateboarding-course", "/skateboarding-course.html"), ("/skateboarding", "/skateboarding-hub.html"),
            ("/skateboarding-hub", "/skateboarding-hub.html")]
    want += [("/skt%d" % u["n"], "/skt-u%d.html" % u["n"]) for u in UNITS]
    add = [a.ljust(28) + b.ljust(42) + "200" for a, b in want if not re.search(r"^%s\s" % re.escape(a), s, re.M)]
    if add:
        if not s.endswith("\n"): s += "\n"
        s += "\n# AOG-SKT-V1 — Skateboarding, K–12 and Adult: the hub, the course contents, the units\n" + "\n".join(add) + "\n"
        p.write_text(s, encoding="utf-8")
    print("redirects: %d added" % len(add))

def sw():
    p = DEPLOY / "sw.js"; s = p.read_text(encoding="utf-8")
    if "skt-u1.html" in s:
        print("sw: already precaches the course"); return
    m = re.search(r"^const CACHE = '(aog-cache-[0-9.]+\.)([a-z]*)(\d+)'(.*)$", s, re.M)
    old = m.group(0)
    new = "%s%s%d" % (m.group(1), m.group(2), int(m.group(3)) + 1)
    line = ("const CACHE = '%s'   // SKATEBOARDING, K–12 AND ADULT: A COURSE (/skateboarding, /skateboarding-course, /skt1…18: HISTORY, HOW TO DO TRICKS AND GRINDS WITH SAFETY FIRST, AND THE SCIENCE), ITS DAILY PRACTICE BOOK (/drops/skate) AND THE SKATE LAB (/skate: RAMPS AND ENERGY, THE OLLIE, GRINDS, BALANCE, FLIPS, BOARDS THROUGH TIME, A TRICK BOOK) (previous: %s%s)" % (new, m.group(2), m.group(3)))
    s = s[:m.start()] + line + "\n// " + old + s[m.end():]
    add = "  './skateboarding-course.html', './skateboarding-hub.html', " + ", ".join("'./skt-u%d.html'" % u["n"] for u in UNITS) + ",   // AOG-SKT-V1 — Skateboarding\n"
    n = re.search(r"const PRECACHE_LESSONS = \[\n", s).end()
    s = s[:n] + add + s[n:]
    p.write_text(s, encoding="utf-8"); print("sw: CACHE → %s" % new)

def sitemap():
    p = DEPLOY / "sitemap.xml"; s = p.read_text(encoding="utf-8")
    if "/skateboarding-course<" in s:
        print("sitemap: already listed"); return
    rows = ['  <url><loc>https://architectureofgrace.com/%s</loc><lastmod>%s</lastmod><priority>0.8</priority></url>' % (x, TODAY) for x in ("skateboarding", "skateboarding-course")]
    rows += ['  <url><loc>https://architectureofgrace.com/skt%d</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (u["n"], TODAY) for u in UNITS]
    s = s.replace("</urlset>", "\n".join(rows) + "\n</urlset>")
    p.write_text(s, encoding="utf-8"); print("sitemap: %d added" % len(rows))

if __name__ == "__main__":
    redirects(); sw(); sitemap()
