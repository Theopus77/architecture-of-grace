#!/usr/bin/env python3
"""AOG-FCS-3D-V1 — write practice3d.py's "Watch it in 3D" buttons and lessons into ch*.json.
Idempotent: a lesson that already has a "try" keeps it; a lesson title already in the chapter is not added twice.
Text-level insertion, so the rest of each chapter file stays byte-for-byte as it was.
Run from this folder:  python3 add_3d.py   then  python3 assemble.py <n>  for each unit."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from practice3d import TRY, NEW

def dumps(obj, ind):
    """One lesson or section as JSON, indented to sit inside the chapter file."""
    txt = json.dumps(obj, ensure_ascii=False, indent=1)
    return "\n".join(ind + line for line in txt.split("\n"))

def add_try(s, title, t):
    pat = re.compile(r'^([ \t]*)"title": %s,[ \t]*\n' % re.escape(json.dumps(title, ensure_ascii=False)), re.M)
    hits = list(pat.finditer(s))
    if len(hits) != 1: raise SystemExit("lesson title %r found %d times" % (title, len(hits)))
    m = hits[0]
    # does this lesson object already carry a "try"? look until the next lesson's title
    nxt = re.search(r'^[ \t]*"title": ', s[m.end():], re.M)
    body = s[m.end(): m.end() + (nxt.start() if nxt else len(s))]
    if '"try":' in body: return s, False
    line = '%s"try": %s,\n' % (m.group(1), json.dumps(t, ensure_ascii=False))
    return s[:m.end()] + line + s[m.end():], True

def close_before_review(s):
    """Index of the ']' that closes the sections list, and of the ']' that closes the last section's lessons."""
    i = s.index('"review"')
    j = s.rindex("]", 0, i)            # sections ]
    k = s.rindex("}", 0, j)            # last section }
    l = s.rindex("]", 0, k)            # its lessons ]
    return j, l

def main():
    changed = set()
    for cn, items in TRY.items():
        p = os.path.join(HERE, "ch%d.json" % cn); s = open(p, encoding="utf-8").read()
        for title, link in items:
            from practice3d import try_of
            s, did = add_try(s, title, try_of(link))
            if did: changed.add(cn)
        open(p, "w", encoding="utf-8").write(s)
    for cn, add in NEW.items():
        p = os.path.join(HERE, "ch%d.json" % cn); s = open(p, encoding="utf-8").read()
        ch = json.loads(s)
        have = {l["title"] for sec in ch["sections"] for l in sec["lessons"]}
        if isinstance(add, dict):
            if add["section"] in {sec["title"] for sec in ch["sections"]}: continue
            j, _ = close_before_review(s)
            end = len(s[:j].rstrip())
            s = s[:end] + ",\n" + dumps({"title": add["section"], "lessons": add["lessons"]}, "  ") + s[end:]
        else:
            todo = [l for l in add if l["title"] not in have]
            if not todo: continue
            _, l = close_before_review(s)
            end = len(s[:l].rstrip())
            s = s[:end] + "".join(",\n" + dumps(x, "   ") for x in todo) + s[end:]
        json.loads(s)
        open(p, "w", encoding="utf-8").write(s); changed.add(cn)
    for cn in sorted(TRY):
        json.load(open(os.path.join(HERE, "ch%d.json" % cn), encoding="utf-8"))
    print("chapters changed:", sorted(changed) or "none")

if __name__ == "__main__":
    main()
