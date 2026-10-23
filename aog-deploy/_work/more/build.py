#!/usr/bin/env python3
"""AOG-MORE-V1 — publish the Spanish lessons and the three ways in.

    python3 _work/more/build.py              every unit that passes validate.py
    python3 _work/more/build.py wcs          one course
    python3 _work/more/build.py wcs 3        one unit

For each unit whose files in _work/more/<course>/ pass validate.py, writes
    course-data/<course>-u<N>.lv.json   English Shorter and More, by lesson id
    course-data/<course>-u<N>.es.json   the unit in Spanish (ids as on the page), with its own Shorter and More
and puts <script src="/aog-course-more.js" data-more="es lv" data-v="…" defer> on the unit's page (the line
marked AOG-MORE-V1), so the page offers what exists. The ids are the ones build_course.py writes: lessons
l<ch>-<k>, checks l<ch>-<k>-c<j>, reviews r<ch>-<j>, the unit test t<N>-<j>, the spiral review s<N>-<j>.
Then bump CACHE in sw.js and run the contrast and calm checks on the pages it names."""
import hashlib, json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORK = HERE.parent
DEPLOY = WORK.parent
OUT = DEPLOY / "course-data"
sys.path.insert(0, str(WORK / "course"))
import build_course  # spiral_items: the same five earlier-unit questions the page shows

LV_ONLY = {"spa"}
TAG_RE = re.compile(r'<script src="/aog-course-more\.js[^"]*"[^>]*></script><!-- AOG-MORE-V1 -->\n?')

def pages():
    m = {}
    for line in (HERE / "pages.txt").read_text().split("\n"):
        p = line.split()
        if len(p) == 3: m[(p[0], int(p[1]))] = p[2]
    return m

def units_of(cid):
    out = []
    for f in sorted((WORK / cid).glob("u*.json")):
        if re.fullmatch(r"u\d+\.json", f.name): out.append(json.load(open(f, encoding="utf-8")))
    return sorted(out, key=lambda u: u["n"])

def valid(cid, n):
    r = subprocess.run([sys.executable, str(HERE / "validate.py"), cid, str(n)], capture_output=True, text=True)
    return r.returncode == 0

def load(p): return json.load(open(p, encoding="utf-8"))

def q3(q): return [q["q"], q["choices"], q["why"]]

def unit_data(cid, U, all_units, heads):
    n = U["n"]; src = HERE / cid
    chs = {c["n"]: load(src / ("u%d.ch%d.json" % (n, c["n"]))) for c in U["chapters"]}
    lv, es_l, es_lv, es_q, es_ch = {}, {}, {}, {}, {}
    for c in U["chapters"]:
        X = chs[c["n"]]; num = 0
        for si, (s, se) in enumerate(zip(X["sections"], c["sections"])):
            for l, le in zip(s["lessons"], se["lessons"]):
                num += 1
                lid = "l%d-%d" % (c["n"], num)
                lv[lid] = {"s": l["short"], "m": l["more"]}
                if cid in LV_ONLY: continue
                lk = l.get("look") or {}
                look = {"t": lk.get("title"), "p": lk.get("prompt")}
                if le["look"].get("type") == "data":
                    look["rows"] = lk.get("rows")
                    if lk.get("unit"): look["un"] = lk["unit"]
                else: look["x"] = lk.get("text")
                es_l[lid] = {"t": l["title"], "m": l["mainIdea"], "r": l["reading"], "w": [[w["w"], w["d"]] for w in l["words"]], "lk": look}
                es_lv[lid] = {"s": l["short_es"], "m": l["more_es"]}
                for j, q in enumerate(l["check"]): es_q["%s-c%d" % (lid, j)] = q3(q)
        if cid in LV_ONLY: continue
        st = X["story"]
        es_ch[str(c["n"])] = {"t": X["title"], "y": X["years"], "bq": X["bigQuestion"],
                              "st": {"t": st["title"], "k": st["kicker"], "p": st["paragraphs"], "th": st["think"]},
                              "s": [s["title"] for s in X["sections"]]}
        for j, q in enumerate(X["review"]): es_q["r%d-%d" % (c["n"], j)] = q3(q)
    lvj = {"v": 1, "c": cid, "u": n, "l": lv}
    if cid in LV_ONLY: return lvj, None
    Hd = heads[n]
    for j, q in enumerate(Hd["wrap"]["test"]): es_q["t%d-%d" % (n, j)] = q3(q)
    for j, (x, q) in enumerate(build_course.spiral_items(U, all_units)):
        h = heads.get(x["n"])
        if not h: continue
        k = x["wrap"]["test"].index(q)
        e = h["wrap"]["test"][k]
        es_q["s%d-%d" % (n, j)] = ["(Unidad %d) %s" % (x["n"], e["q"]), e["choices"], e["why"]]
    esj = {"v": 1, "c": cid, "n": n, "ch": es_ch, "l": es_l, "q": es_q, "lv": es_lv}
    esj["u"] = {"t": Hd["title"], "y": Hd["years"], "intro": Hd["intro"], "bq": Hd["bigQuestion"],
                "tl": [t["t"] for t in Hd["timeline"]], "ww": [[w["w"], w["d"]] for w in Hd["wrap"]["words"]],
                "wp": Hd["wrap"]["write"]["prompt"], "wt": Hd["wrap"]["write"]["tips"]}
    return lvj, esj

def dump(p, obj):
    s = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    p.write_text(s, encoding="utf-8")
    return hashlib.sha1(s.encode()).hexdigest()[:8]

def tag_page(page, kinds, v):
    p = DEPLOY / page
    s = p.read_text(encoding="utf-8")
    s = TAG_RE.sub("", s)
    tag = '<script src="/aog-course-more.js" data-more="%s" data-v="%s" defer></script><!-- AOG-MORE-V1 -->\n' % (" ".join(kinds), v)
    anchor = '<script src="/aog-jump.js" defer></script>'
    if anchor in s: s = s.replace(anchor, tag + anchor, 1)
    else: s = s.replace("</body>", tag + "</body>", 1)
    p.write_text(s, encoding="utf-8")

PLUS = '<script src="/aog-course-plus.js" defer></script><!-- AOG-COURSE-PLUS-V1 -->\n'
def tag_plus(page):
    """AOG-COURSE-PLUS-V1 on every unit page (build_course.py writes it on a rebuild)."""
    p = DEPLOY / page
    s = p.read_text(encoding="utf-8")
    if "AOG-COURSE-PLUS-V1" in s: return False
    anchor = '<script src="/aog-jump.js" defer></script>'
    s = s.replace(anchor, PLUS + anchor, 1) if anchor in s else s.replace("</body>", PLUS + "</body>", 1)
    p.write_text(s, encoding="utf-8")
    return True

def titles(cid, all_units, done_units):
    """course-data/<course>-titles.json: the Spanish names its contents page shows, for every finished unit."""
    J = {"v": 1, "c": cid, "u": {}, "ch": {}, "l": {}}
    for U in all_units:
        n = U["n"]
        if n not in done_units: continue
        H = load(HERE / cid / ("u%d.head.json" % n))
        J["u"][str(n)] = {"t": H["title"], "y": H["years"]}
        for c in U["chapters"]:
            X = load(HERE / cid / ("u%d.ch%d.json" % (n, c["n"])))
            J["ch"]["%d:%d" % (n, c["n"])] = {"t": X["title"], "y": X["years"], "st": "%s — %s" % (X["story"]["title"], X["story"]["kicker"]),
                                              "s": [s["title"] for s in X["sections"]]}
            num = 0
            for s in X["sections"]:
                for l in s["lessons"]:
                    num += 1
                    J["l"]["%d:l%d-%d" % (n, c["n"], num)] = [l["title"], l["mainIdea"]]
    return J

def tag_contents(cid, v):
    try: page = json.load(open(OUT / ("%s-plan.json" % cid), encoding="utf-8"))["contents"]
    except Exception: return None
    p = DEPLOY / page
    if not p.exists(): return None
    s = TAG_RE.sub("", p.read_text(encoding="utf-8"))
    tag = '<script src="/aog-course-more.js" data-course="%s" data-v="%s" defer></script><!-- AOG-MORE-V1 -->\n' % (cid, v)
    anchor = '<script src="/aog-jump.js" defer></script>'
    s = s.replace(anchor, tag + anchor, 1) if anchor in s else s.replace("</body>", tag + "</body>", 1)
    p.write_text(s, encoding="utf-8")
    return page

def main(argv):
    OUT.mkdir(exist_ok=True)
    pg = pages()
    plus = [page for page in pg.values() if tag_plus(page)]
    if plus: print("course-plus tag added to %d pages" % len(plus))
    courses = [argv[0]] if argv else sorted({c for c, _ in pg})
    done = []
    for cid in courses:
        all_units = units_of(cid)
        ok = {u["n"] for u in all_units if (not argv[1:] or u["n"] == int(argv[1])) and (HERE / cid).exists() and valid(cid, u["n"])}
        if not ok: continue
        heads = {}
        if cid not in LV_ONLY:
            for u in all_units:   # every finished head, so a spiral review can borrow an earlier unit's Spanish
                hp = HERE / cid / ("u%d.head.json" % u["n"])
                if hp.exists() and (u["n"] in ok or valid(cid, u["n"])): heads[u["n"]] = load(hp)
        for U in all_units:
            if U["n"] not in ok: continue
            lvj, esj = unit_data(cid, U, all_units, heads)
            v = dump(OUT / ("%s-u%d.lv.json" % (cid, U["n"])), lvj)
            kinds = ["lv"]
            if esj:
                v = hashlib.sha1((v + dump(OUT / ("%s-u%d.es.json" % (cid, U["n"])), esj)).encode()).hexdigest()[:8]
                kinds = ["es", "lv"]
            page = pg.get((cid, U["n"]))
            if page: tag_page(page, kinds, v); done.append(page)
            print("built %s u%d → %s (%s)" % (cid, U["n"], page, " ".join(kinds)))
        if cid not in LV_ONLY and heads:
            v = dump(OUT / ("%s-titles.json" % cid), titles(cid, all_units, set(heads)))
            cp = tag_contents(cid, v)
            if cp: done.append(cp)
    if done: print("pages:", " ".join(done))

if __name__ == "__main__":
    main(sys.argv[1:])
