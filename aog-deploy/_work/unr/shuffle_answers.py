#!/usr/bin/env python3
"""python3 shuffle_answers.py N [N…] — move each question's right answer to an evenly spread,
random position (seeded by unit, so reruns are stable). Used where a writer left a repeating
answer pattern a student could learn. Edits the chapter files and u<N>_head.json, then re-assemble."""
import json, random, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from outline import UNITS
here = os.path.dirname(os.path.abspath(__file__))
for n in map(int, sys.argv[1:]):
    random.seed(1000 + n)
    U = next(u for u in UNITS if u["n"] == n)
    files = ["ch%d.json" % c["n"] for c in U["chapters"]] + ["u%d_head.json" % n]
    docs, qs = {}, []
    for f in files:
        d = json.load(open(os.path.join(here, f))); docs[f] = d
        if "sections" in d:
            for s in d["sections"]:
                for l in s["lessons"]: qs += l["check"]
            qs += d["review"]
        else:
            qs += d["wrap"]["test"]
    k = len(qs[0]["choices"])
    pos = [i % k for i in range(len(qs))]; random.shuffle(pos)
    for q, p in zip(qs, pos):
        right = q["choices"][q["a"]]
        wrong = [c for i, c in enumerate(q["choices"]) if i != q["a"]]
        random.shuffle(wrong); wrong.insert(p, right)
        q["choices"], q["a"] = wrong, p
    for f, d in docs.items():
        json.dump(d, open(os.path.join(here, f), "w"), ensure_ascii=False, indent=1)
    print("unit %d: %d questions reshuffled" % (n, len(qs)))
