#!/usr/bin/env python3
"""AOG-TEACH-V1 — the data behind /teach (Teach it tomorrow: a one-page plan for any course unit).

    python3 _work/more/make_plans.py        (from aog-deploy/; run again after a course or its standards change)

Writes course-data/<course>-plan.json for every course in pages.txt: each unit's title, band, big question,
standards (code and words, from _work/standards/<course>.json), key words, chapters with their big question,
story prompt and sections (lesson titles), the writing prompt and the practice rooms. teach.html turns one unit into
a day-by-day plan. Spanish titles come from _work/more when a unit has them (AOG-MORE-V1)."""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORK = HERE.parent
DEPLOY = WORK.parent
OUT = DEPLOY / "course-data"

def course_names(page):
    """The course's name, English and Spanish, from its contents page (the unit page's hub link)."""
    s = (DEPLOY / page).read_text(encoding="utf-8")
    m = re.search(r'id="hubLink" href="([^"]+)"', s)
    contents = m.group(1) if m else ""
    en = es = ""
    if contents and (DEPLOY / contents).exists():
        c = (DEPLOY / contents).read_text(encoding="utf-8")
        h = re.search(r'<h1 data-en="([^"]*)" data-es="([^"]*)"', c)
        if h: en, es = h.group(1), h.group(2)
    import html
    return html.unescape(en), html.unescape(es), contents

def links_of(cid):
    sys.path.insert(0, str(WORK / cid))
    try:
        import importlib
        if "outline" in sys.modules: del sys.modules["outline"]
        o = importlib.import_module("outline")
        return getattr(o, "LINKS", {}) or {}
    except Exception:
        return {}
    finally:
        sys.path.pop(0)

def main():
    OUT.mkdir(exist_ok=True)
    pages = {}
    for line in (HERE / "pages.txt").read_text().split("\n"):
        p = line.split()
        if len(p) == 3: pages.setdefault(p[0], {})[int(p[1])] = p[2]
    for cid, upages in sorted(pages.items()):
        std = {}
        sf = WORK / "standards" / ("%s.json" % cid)
        fw = {}
        if sf.exists():
            j = json.load(open(sf, encoding="utf-8"))
            fw = j.get("framework", {})
            for x in j.get("units", []): std[x["n"]] = [[s.get("code", ""), s.get("text", "")] for s in x.get("standards", [])]
        links = links_of(cid)
        en, es, contents = course_names(upages[min(upages)])
        units = {}
        for n, page in sorted(upages.items()):
            uf = WORK / cid / ("u%d.json" % n)
            if not uf.exists(): continue
            U = json.load(open(uf, encoding="utf-8"))
            hd = WORK / "more" / cid / ("u%d.head.json" % n)
            H = json.load(open(hd, encoding="utf-8")) if hd.exists() else {}
            chs = []
            for c in U["chapters"]:
                cf = WORK / "more" / cid / ("u%d.ch%d.json" % (n, c["n"]))
                X = json.load(open(cf, encoding="utf-8")) if cf.exists() else {}
                num, secs = 0, []
                for si, s in enumerate(c["sections"]):
                    xs = (X.get("sections") or [{}] * len(c["sections"]))[si] if X.get("sections") else {}
                    les = []
                    for li, l in enumerate(s["lessons"]):
                        num += 1
                        xl = (xs.get("lessons") or [])[li] if xs.get("lessons") else {}
                        les.append({"id": "l%d-%d" % (c["n"], num), "t": l["title"], "te": xl.get("title", ""),
                                    "look": l["look"].get("prompt", "")})
                    secs.append({"t": s["title"], "te": xs.get("title", ""), "l": les})
                chs.append({"n": c["n"], "t": c["title"], "te": X.get("title", ""), "bq": c["bigQuestion"], "bqe": X.get("bigQuestion", ""),
                            "talk": c["story"]["think"], "talke": (X.get("story") or {}).get("think", ""),
                            "story": c["story"]["title"], "s": secs, "rev": len(c["review"])})
            units[n] = {"page": page, "t": U["title"], "te": H.get("title", ""), "band": U.get("band") or "6-8",
                        "bq": U["bigQuestion"], "bqe": H.get("bigQuestion", ""),
                        "std": std.get(n, []), "words": [w["w"] for w in U["wrap"]["words"]],
                        "wordse": [w["w"] for w in (H.get("wrap") or {}).get("words", [])],
                        "write": U["wrap"]["write"]["prompt"], "writee": ((H.get("wrap") or {}).get("write") or {}).get("prompt", ""),
                        "test": len(U["wrap"]["test"]), "rooms": [[h, lab] for h, lab in links.get(n, [])], "ch": chs}
        obj = {"v": 1, "c": cid, "name": en, "namee": es, "contents": contents,
               "fw": fw.get("short") or fw.get("name", ""), "fwnote": fw.get("note", ""), "units": units}
        (OUT / ("%s-plan.json" % cid)).write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print("plan", cid, len(units), "units")

if __name__ == "__main__":
    main()
