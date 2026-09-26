#!/usr/bin/env python3
"""Check every sel-paths/room-N.json against the inventory: all 28 lessons, only real steps, totals 25 / 40."""
import json, glob, sys
inv = json.load(open("_work/sel/paths/inventory.json"))
bad = 0
for f in sorted(glob.glob("sel-paths/room-*.json")):
    r = f.split("room-")[1].split(".")[0]; d = json.load(open(f)); lessons = inv[r]
    miss = [k for k in lessons if k not in d]
    for lid, e in d.items():
        steps = {s["n"] for s in lessons.get(lid, {"steps": []})["steps"]}
        for pk, want in (("p25", 25), ("p40", 40)):
            p = e.get(pk) or {}
            tot = sum(p.get("steps", {}).values()) + int(p.get("cards", 0)) + int(p.get("exit", 0))
            unknown = [n for n in p.get("steps", {}) if n not in steps]
            if tot != want or unknown or not p.get("steps") or len((p.get("note") or "").split()) > 26:
                bad += 1; print(f"  ✗ room {r} {lid} {pk}: total {tot}, unknown steps {unknown}, note words {len((p.get('note') or '').split())}")
    print(f"room {r}: {len(d)} lessons, missing {miss}")
sys.exit(1 if bad else 0)
