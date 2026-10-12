#!/usr/bin/env python3
"""python3 assemble.py 3  → reads u3_head.json + the unit's chapter files (in order) + its Practice section (mar_practice.py)
→ u3.json, then validates."""
import json, sys, subprocess, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from outline import UNITS
here = os.path.dirname(os.path.abspath(__file__))
n = int(sys.argv[1])
U = next(u for u in UNITS if u["n"] == n)
head = json.load(open(f"{here}/u{n}_head.json"))
head["n"] = n; head["title"] = U["title"]; head["years"] = U["strand"]; head["band"] = U["band"]
head["chapters"] = []
for c in U["chapters"]:
    ch = json.load(open(f"{here}/ch{c['n']}.json"))
    ch["n"] = c["n"]; ch["title"] = ch.get("title") or c["title"]; ch["years"] = ch.get("years") or c["strand"]
    head["chapters"].append(ch)
# AOG-MAR-PRACTICE-V1 (2026-10-12): the Practice strand — one "Practice the Moves" section after the
# last section of the unit's last chapter (mar_practice.py). History lessons are untouched.
import mar_practice as practice
from collections import Counter
sec = practice.section_for(n, U["band"])
if sec:
    nch = 3 if U["band"] == "k-2" else 4
    pos = Counter()
    def walk(x):
        if isinstance(x, dict):
            if "choices" in x and isinstance(x.get("a"), int): pos[x["a"]] += 1
            for v in x.values(): walk(v)
        elif isinstance(x, list):
            for v in x: walk(v)
    walk(head)
    for l in sec["lessons"]:
        qs = []
        for q in l.pop("checks"):
            a = min(range(nch), key=lambda k: (pos[k], k)); pos[a] += 1   # the least-used position
            ch = list(q["wrong"]); ch.insert(a, q["right"])
            qs.append({"q": q["q"], "choices": ch, "a": a, "why": q["why"]})
        l["check"] = qs
    head["chapters"][-1]["sections"].append(sec)
json.dump(head, open(f"{here}/u{n}.json", "w"), ensure_ascii=False, indent=1)
sys.exit(subprocess.call([sys.executable, f"{here}/validate.py", f"{here}/u{n}.json"]))
