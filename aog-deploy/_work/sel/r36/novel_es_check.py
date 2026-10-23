#!/usr/bin/env python3
"""python3 _work/sel/r36/novel_es_check.py 3 4 … — the Spanish sections of Book 3 match the English shape."""
import json, re, sys
from pathlib import Path
D = Path(__file__).resolve().parents[3]
EN = json.load(open(D / "novels/room-36.json", encoding="utf-8"))["sections"]
bad = 0
for a in sys.argv[1:]:
    i = int(a); p = D / "novels/room-36.es" / ("s%d.json" % i); errs = []
    try: S = json.load(open(p, encoding="utf-8"))
    except Exception as e: print("s%d: %s" % (i, e)); bad += 1; continue
    E = EN[i]
    if S.get("kind") != E["kind"]: errs.append("kind differs")
    for k in ("title", "kicker"):
        if E.get(k) and not (S.get(k) or "").strip(): errs.append(k + " missing")
    b, eb = S.get("blocks") or [], E["blocks"]
    if len(b) != len(eb): errs.append("blocks: %d, English has %d" % (len(b), len(eb)))
    for j, (x, y) in enumerate(zip(b, eb)):
        if x.get("k") != y["k"]: errs.append("block %d: k %s, English %s" % (j, x.get("k"), y["k"])); continue
        if y["k"] == "break": continue
        if not (x.get("t") or "").strip(): errs.append("block %d: no text" % j)
        tags = lambda h: sorted(re.findall(r"</?[a-z]+", h or ""))
        if tags(x.get("h")) != tags(y.get("h")): errs.append("block %d: tags differ from English" % j)
        if y.get("t") and len(x.get("t", "")) < 0.6 * len(y["t"]) and len(y["t"]) > 40: errs.append("block %d: much shorter than English" % j)
        if re.search(r"\b(the|and|was|with|that)\b", x.get("t", "")) and len(re.findall(r"\b(the|and|was|with|that)\b", x.get("t", ""))) > 2: errs.append("block %d: reads as English" % j)
    if errs: bad += 1; print("s%d:\n  " % i + "\n  ".join(errs[:30]))
    else: print("s%d OK (%d blocks)" % (i, len(b)))
sys.exit(1 if bad else 0)
