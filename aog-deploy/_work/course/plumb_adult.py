#!/usr/bin/env python3
"""
AOG-ADULT-BANDS-V1 — the site plumbing for units added to a course that is already live (its new Adult band).
Each course's own plumb_<id>.py stops early once the course is in sw.js and the sitemap, so new units would never be
precached or listed. This script fills in only what is missing, for every unit in the course's outline:
  · _redirects  — a short link per unit (/<short>N → /<page>), from build_<id>.py's COURSE page/short patterns
  · sw.js       — the unit pages added to the course's PRECACHE_LESSONS line, and one CACHE bump (old line kept as a comment)
  · sitemap.xml — a row per short link
Idempotent: a second run changes nothing. See _work/course/HANDOFF-ADULT-BANDS.md.

Run from aog-deploy/:  python3 _work/course/plumb_adult.py <id> [--dry]
"""
import ast, datetime, re, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
import os
DEPLOY = Path(os.environ.get("AOG_DEPLOY") or HERE.parent.parent)   # AOG_DEPLOY: test on a copy
cid = sys.argv[1]; DRY = "--dry" in sys.argv
sys.path.insert(0, str(HERE.parent / cid))
from outline import UNITS   # noqa: E402

def course_patterns():
    t = ast.parse((HERE.parent / cid / ("build_%s.py" % cid)).read_text(encoding="utf-8"))
    for n in ast.walk(t):
        if isinstance(n, ast.Call) and getattr(n.func, "id", "") == "dict":
            kw = {k.arg: k.value for k in n.keywords}
            if "page" in kw and "short" in kw:
                return ast.literal_eval(kw["page"]), ast.literal_eval(kw["short"])
    sys.exit("no COURSE page/short in build_%s.py" % cid)

PAGE, SHORT = course_patterns()
TODAY = datetime.date.today().isoformat()
changed = []

def write(p, s, what):
    changed.append(what)
    if not DRY: p.write_text(s, encoding="utf-8")

# _redirects
p = DEPLOY / "_redirects"; s = p.read_text(encoding="utf-8")
add = []
for u in UNITS:
    short, page = "/" + SHORT % u["n"], "/" + PAGE % u["n"]
    if not (DEPLOY / (PAGE % u["n"])).exists(): continue          # a unit not built yet gets no link
    if not re.search(r"^%s\s" % re.escape(short), s, re.M): add.append(short.ljust(28) + page.ljust(42) + "200")
if add:
    s = s.rstrip("\n") + "\n\n# AOG-ADULT-BANDS-V1 — %s: units added later\n" % cid + "\n".join(add) + "\n"
    write(p, s, "redirects +%d" % len(add))

# sw.js
p = DEPLOY / "sw.js"; s = p.read_text(encoding="utf-8")
pages = ["'./%s'" % (PAGE % u["n"]) for u in UNITS if (DEPLOY / (PAGE % u["n"])).exists()]
missing = [x for x in pages if x not in s]
if missing:
    first = "'./%s'" % (PAGE % UNITS[0]["n"])
    i = s.find(first)
    if i < 0: sys.exit("sw.js does not precache %s yet: run the course's own plumb_%s.py first" % (first, cid))
    j = s.index("\n", i)
    line = s[s.rfind("\n", 0, i) + 1:j]
    k = line.rfind("'") + 1                                     # after the last quoted file on that line
    s = s[:s.rfind("\n", 0, i) + 1] + line[:k] + ", " + ", ".join(missing) + line[k:] + s[j:]
    m = re.search(r"^const CACHE = '(aog-cache-[0-9.]+\.)([a-z]*)(\d+)'(.*)$", s, re.M)
    new = "%s%s%d" % (m.group(1), m.group(2), int(m.group(3)) + 1)
    s = (s[:m.start()] + "const CACHE = '%s'   // %s: NEW UNITS (THE ADULT BAND) PRECACHED: %s (previous: %s%s)" % (
        new, cid.upper(), ", ".join(x.strip("'./") for x in missing), m.group(2), m.group(3)) + "\n// " + m.group(0) + s[m.end():])
    write(p, s, "sw.js +%d pages, CACHE → %s" % (len(missing), new))

# sitemap.xml
p = DEPLOY / "sitemap.xml"; s = p.read_text(encoding="utf-8")
rows = ['  <url><loc>https://architectureofgrace.com/%s</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (SHORT % u["n"], TODAY)
        for u in UNITS if (DEPLOY / (PAGE % u["n"])).exists() and ("/%s<" % (SHORT % u["n"])) not in s]
if rows:
    s = s.replace("</urlset>", "\n".join(rows) + "\n</urlset>")
    write(p, s, "sitemap +%d" % len(rows))

print(("would change: " if DRY else "changed: ") + ("; ".join(changed) if changed else "nothing (all in place)"))
