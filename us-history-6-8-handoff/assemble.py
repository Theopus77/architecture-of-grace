#!/usr/bin/env python3
"""python3 assemble.py 3  → reads u3_head.json + ch5.json ch6.json ch7.json (the unit's chapters, in order) → u3.json, then validates."""
import json, sys, subprocess, os
from outline import UNITS
here = os.path.dirname(os.path.abspath(__file__))
n = int(sys.argv[1])
U = next(u for u in UNITS if u["n"] == n)
head = json.load(open(f"{here}/u{n}_head.json"))
head["n"] = n; head["title"] = U["title"]; head["years"] = U["years"]
head["chapters"] = [json.load(open(f"{here}/ch{c['n']}.json")) for c in U["chapters"]]
json.dump(head, open(f"{here}/u{n}.json", "w"), ensure_ascii=False, indent=1)
sys.exit(subprocess.call([sys.executable, f"{here}/validate.py", f"{here}/u{n}.json"]))
