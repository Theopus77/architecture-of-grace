#!/usr/bin/env python3
"""AOG-R36-V1 — apply the exact old → new edits that the Room 36 agents wrote.

    python3 _work/sel/r36/apply_edits.py <edits/*.md> <file.html> [--dry]       (from aog-deploy/)

Reads every "## <file>" part of the edits file(s) (or, when a file has no such headings, every edit whose heading names
the target file) and, in order, replaces each Old block (~~~ fenced, after "Old:") with its New block. An edit applies
only when its Old text occurs exactly once; otherwise it is reported and skipped (nothing is half-applied inside one
edit). --dry reports without writing. Prints one line per edit."""
import re, sys
from pathlib import Path

def parse(md, target):
    text = Path(md).read_text(encoding="utf-8")
    parts = re.split(r"^## +", text, flags=re.M)
    out = []
    for p in parts[1:]:
        head = p.split("\n", 1)[0].strip()
        if target not in head.split()[0:1] and not head.startswith(target): continue
        for m in re.finditer(r"^### +(.*?)$(.*?)(?=^### |\Z)", p, flags=re.S | re.M):
            title, body = m.group(1).strip(), m.group(2)
            old = re.search(r"Old[^\n]*:\s*\n+(~~~|```)[^\n]*\n(.*?)\n\1", body, re.S)
            new = re.search(r"New[^\n]*:\s*\n+(~~~|```)[^\n]*\n(.*?)\n\1", body, re.S)
            if old and new: out.append((title, old.group(2), new.group(2)))
            else: out.append((title, None, None))
    return out

def main(argv):
    dry = "--dry" in argv
    argv = [a for a in argv if a != "--dry"]
    target = argv[-1]; mds = argv[:-1]
    p = Path(target); s = p.read_text(encoding="utf-8")
    ok = bad = 0
    for md in mds:
        for title, old, new in parse(md, target):
            if old is None: print("SKIP (no Old/New blocks):", Path(md).name, title); bad += 1; continue
            n = s.count(old)
            if n == 1: s = s.replace(old, new); ok += 1; print("ok  ", Path(md).name, title)
            elif n == 0 and s.count(new) == 1: print("done", Path(md).name, title, "(already applied)")
            else: print("FAIL (%d matches)" % n, Path(md).name, title); bad += 1
    if not dry: p.write_text(s, encoding="utf-8")
    print("%s: %d applied, %d not" % (target, ok, bad))
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
