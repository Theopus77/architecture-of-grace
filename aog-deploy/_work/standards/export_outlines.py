#!/usr/bin/env python3
"""Dump every course outline (units, bands, chapters, topics) to outlines.json for the
standards writers and build_standards.py.  Run from aog-deploy/."""
import importlib.util, json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
def load(path):
    spec = importlib.util.spec_from_file_location("m", path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
META = {"sci": "Science, K–12", "ss": "Social Studies, K–12", "ela": "English Language Arts, K–12", "mth": "Mathematics, K–12",
        "spa": "Spanish, K–12", "ush": "U.S. History, Grades 6–8", "eco": "Economics, Grades 9–12", "rel": "World Religions, Grades 9–12",
        "fcs": "Family & Consumer Sciences, K–12"}
out = {}
for k, name in META.items():
    p = os.path.join(ROOT, "_work", k, "outline.py")
    if not os.path.exists(p): continue
    m = load(p)
    out[k] = {"name": name, "units": [{"n": u["n"], "band": u.get("band", ""), "title": u["title"], "strand": u.get("strand", ""), "years": u.get("years", ""),
              "chapters": [{"n": c["n"], "title": c["title"], "strand": c.get("strand", ""), "topics": c.get("topics", "")[:600]} for c in u["chapters"]]} for u in m.UNITS]}
    print(" %-4s %2d units %3d chapters" % (k, len(out[k]["units"]), sum(len(u["chapters"]) for u in out[k]["units"])))
json.dump(out, open(os.path.join(HERE, "outlines.json"), "w"), indent=1, ensure_ascii=False)
