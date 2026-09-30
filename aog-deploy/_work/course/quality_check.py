"""Quality gate for a course unit, beyond validate.py (2026-09-30).

validate.py checks counts and lengths. This checks what it cannot:
  - sentences repeated in 3+ chapters (filler / padding)
  - looks that cite the course itself (outline, SPEC, "Architecture of Grace")
  - lessons about the course or its rules instead of history
  - data charts with "note" rows
  - timelines holding measurements instead of dates (K–2 step/day sequences are allowed)
  - titles cut mid-word from the outline's topic list

Run from the course folder:  python3 ../course/quality_check.py <unit n>
Prints OK or a list of problems. Fix every problem, then re-run assemble.py.
"""
import collections
import glob
import json
import os
import re
import sys

sys.path.insert(0, os.getcwd())
import outline  # noqa: E402

SELF = re.compile(r"\boutline\b|\bSPEC\b|Architecture of Grace", re.I)
META = re.compile(
    r"\bthis (course|book|lesson|chapter|unit) (does not|will not|won't|never|refuses)\b"
    r"|\bno (dribble|technique|play|strike)s? (lesson|is taught)\b"
    r"|\bthe reading keeps\b|\bstay(s)? on the page\b|\bhistory-only\b",
    re.I,
)


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 30]


def lessons(ch):
    for s in ch["sections"]:
        for l in s["lessons"]:
            yield l


def main():
    n = int(sys.argv[1])
    unit = next(u for u in outline.UNITS if u["n"] == n)
    mine = {c["n"] for c in unit["chapters"]}
    seen = collections.defaultdict(set)
    for f in glob.glob("ch*.json"):
        cn = int(re.findall(r"\d+", f)[0])
        for l in lessons(json.load(open(f))):
            for p in l["reading"]:
                for s in sentences(p):
                    seen[s].add(cn)
    probs = []
    head = json.load(open(f"u{n}_head.json"))
    for t in head["timeline"]:
        if not re.search(r"\d{3,4}|BCE|\bc\.|^(Step|Day|Week|Age|Birth|Monday|Tuesday|Wednesday|Thursday|Friday)\b", t["y"]):
            probs.append(f"timeline: '{t['y']}' is not a date")
    for cn in sorted(mine):
        ch = json.load(open(f"ch{cn}.json"))
        topics = next(c["topics"] for c in unit["chapters"] if c["n"] == cn).lower()
        for l in lessons(ch):
            where = f"ch{cn} '{l['title']}'"
            tl = l["title"].lower().rstrip(".")
            i = topics.find(tl)
            if len(tl) > 20 and i >= 0 and topics[i + len(tl): i + len(tl) + 1].isalpha():
                probs.append(f"{where}: title cut mid-word from the outline topics")
            body = " ".join(l["reading"] + [l["mainIdea"]])
            if META.search(body) or META.search(l["title"]):
                probs.append(f"{where}: talks about the course/its rules instead of history")
            for p in l["reading"]:
                for s in sentences(p):
                    if len(seen[s]) > 2 or sum(1 for q in l["reading"] if s in q) > 1:
                        probs.append(f"{where}: repeated sentence: {s[:70]}")
            lk = l["look"]
            if SELF.search(lk.get("cite", "")):
                probs.append(f"{where}: look cites the course itself")
            if lk["type"] == "data":
                if any(str(r[0]).lower().startswith("note") for r in lk["rows"]):
                    probs.append(f"{where}: chart has a 'note' row")
    probs = list(dict.fromkeys(probs))
    if probs:
        print(f"PROBLEMS · unit {n} · {len(probs)}")
        for p in probs:
            print(" -", p)
        sys.exit(1)
    print(f"QUALITY OK · unit {n}")


if __name__ == "__main__":
    main()
