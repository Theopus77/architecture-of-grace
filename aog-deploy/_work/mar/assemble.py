#!/usr/bin/env python3
"""python3 assemble.py 3  → reads u3_head.json + the unit's chapter files (in order) → u3.json, then validates."""
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
json.dump(head, open(f"{here}/u{n}.json", "w"), ensure_ascii=False, indent=1)
sys.exit(subprocess.call([sys.executable, f"{here}/validate.py", f"{here}/u{n}.json"]))
