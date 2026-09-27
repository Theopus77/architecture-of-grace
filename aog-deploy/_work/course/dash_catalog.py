#!/usr/bin/env python3
"""Rebuild the dashboard's course-unit catalog (dashboard.html: CAT.units and UNITNAME)
from the unit pages that exist, so every course built on the site can be handed out as an
Assignment -> Course unit (its lessons, worksheets, chapter reviews and unit test).
Run from aog-deploy/:  python3 _work/course/dash_catalog.py   (safe to re-run)."""
import re, glob, json
COURSES = [  # id, English, Spanish — in menu order
 ("mth","Math","Matemáticas"),("sci","Science","Ciencias"),("ssc","Social Studies","Estudios Sociales"),
 ("ush","U.S. History","Historia de EE. UU."),("ela","English","Inglés"),("spa","Spanish","Español"),
 ("fcs","Family & Consumer Sciences","Ciencias de la Familia"),("eco","Economics","Economía"),
 ("rel","World Religions","Religiones del Mundo"),("bib","The Bible","La Biblia"),
 ("heb","The Hebrew Bible","La Biblia hebrea"),("qur","The Qur’an","El Corán"),("tal","Talmud Study","Estudio del Talmud"),
 ("hin","Hindu Texts","Textos hindúes"),("bud","Buddhist Texts","Textos budistas"),("chn","Chinese Classics","Clásicos chinos")]
units, names = {}, {}
for cid, en, es in COURSES:
    rows = []
    for f in glob.glob("%s-u*.html" % cid):
        m = re.fullmatch(r"%s-u(\d+)\.html" % cid, f)
        if not m: continue
        s = open(f, encoding="utf-8").read()
        t = re.search(r'window\.AOG_COURSE\s*=\s*\{[^}]*title:"([^"]*)"', s)
        if not t: continue
        n = int(m.group(1)); rows.append([n, "Unit %d · %s" % (n, t.group(1)), f])
    if rows:
        units[cid] = sorted(rows); names[cid] = [en, es]
# AOG-DASH-ALL-V1 — Jimmy: "This should go for the core and remaining curriculum as well."
# Everything else a class can do is listed too, grouped the way the site groups it: each
# subject hub's rooms, then SEL, the novels and the bench tools. Same item shape (a page).
import os
RED = {}
for l in open("_redirects", encoding="utf-8"):
    q = l.split()
    if len(q) >= 2 and q[0].startswith("/"): RED[q[0]] = q[1]
def title(f):
    try: t = re.search(r"<title>([^<]*)</title>", open(f, encoding="utf-8").read())
    except Exception: return None
    return re.sub(r"\s*[—|–·-]\s*Architecture of Grace.*$", "", t.group(1)).strip() if t else None
def resolve(h):
    h = h.split("#")[0].split("?")[0]
    if not h or h.startswith(("http", "mailto", "tel", "javascript")): return None
    h = RED.get(h, h); f = h.lstrip("/")
    if f and not f.endswith(".html") and os.path.exists(f + ".html"): f += ".html"
    return f if f.endswith(".html") and os.path.exists(f) and "/" not in f else None
SKIP = re.compile(r"^([a-z]{2,5}-u\d+|.*-hub|.*-course|index|dashboard|turn-ins|404|offline)\.html$")
HUBS = [("r-math","Math rooms","Salas de matemáticas","math-hub.html"),("r-sci","Science rooms","Salas de ciencias","science-hub.html"),
 ("r-ss","Social Studies rooms","Salas de estudios sociales","social-studies-hub.html"),("r-ela","English rooms","Salas de inglés","english-hub.html"),
 ("r-spa","Spanish rooms","Salas de español","spanish-hub.html"),("r-facs","FACS rooms","Salas de FACS","facs-hub.html"),
 ("r-eco","Economics rooms","Salas de economía","economics-hub.html"),("r-rel","World Religions rooms","Salas de religiones","religions-hub.html")]
taken = set()
for gid, en, es, hub in HUBS:
    if not os.path.exists(hub): continue
    rows = []
    for h in re.findall(r'href="([^"]+)"', open(hub, encoding="utf-8").read()):
        f = resolve(h)
        if not f or f in taken or SKIP.match(f) or f == hub: continue
        t = title(f)
        if t: rows.append([len(rows) + 1, t, f]); taken.add(f)
    if rows: units[gid] = rows; names[gid] = [en, es]
def group(gid, en, es, files):
    rows = []
    for f in files:
        if os.path.exists(f) and f not in taken:
            t = title(f)
            if t: rows.append([len(rows) + 1, t, f]); taken.add(f)
    if rows: units[gid] = rows; names[gid] = [en, es]
import glob as G
sel = []
for r in ("12", "18", "36", "104", "207"):
    sel += ["room-%s-lessons.html" % r, "room-%s-workbook.html" % r, "room-%s-cards.html" % r, "AoG-Anchor-Charts-%s.html" % r]
    sel += sorted(G.glob("w%s-*.html" % r), key=lambda x: [int(n) if n.isdigit() else n for n in re.split(r"(\d+)", x)])
sel += sorted(x for x in G.glob("w[0-9]*-*.html") if not re.match(r"w(12|18|36|104|207)-", x))
group("sel", "SEL lessons and worksheets", "Lecciones y hojas SEL", sel)
group("nov", "Novels", "Novelas", ["room-12-novel.html","room-18-novel.html","room-36-novel.html","room-104-novel.html","room-207-novel.html","the-dwelling.html"] + sorted(G.glob("n[0-9]*-*.html")))
group("bench", "Bench tools and their lessons", "Herramientas y sus lecciones",
      ["science-microscope.html","science-telescope.html","science-waves.html","waves-lessons.html","music-drums.html","drums-lessons.html","music-decks.html","decks-lessons.html","mastering-drums.html","mastering-turntables.html"])
p = "dashboard.html"; s = open(p, encoding="utf-8").read()
m = re.search(r'const CAT=(\{.*?\});\n', s, re.S); cat = json.loads(m.group(1)); cat["units"] = units
s = s[:m.start(1)] + json.dumps(cat, ensure_ascii=False) + s[m.end(1):]
un = "{" + ",".join('%s:%s' % (k if re.match(r'^[a-z]+$', k) else json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in names.items()) + "}"
s = re.sub(r'const UNITNAME=\{[^;]*\};', lambda _: "const UNITNAME=" + un + ";", s, count=1)
open(p, "w", encoding="utf-8").write(s)
print({k: len(v) for k, v in units.items()})
