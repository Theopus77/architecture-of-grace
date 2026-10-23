#!/usr/bin/env python3
"""AOG-MORE-V1 — where the writing stands.  python3 _work/more/status.py [next K]
Lists done / started / to-do units; with `next K`, prints the next K units to hand to writers (skipping any named in
_work/more/running.txt, one "<course> <N>" per line)."""
import subprocess, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
ORDER = ["mth", "sci", "ela", "ss", "ush", "wcs", "fcs", "spa", "eco", "med", "rel", "spt", "mar", "skt",
         "bib", "heb", "qur", "tal", "hin", "bud", "chn", "unr", "sec"]
units = [(l.split()[0], int(l.split()[1])) for l in (HERE / "pages.txt").read_text().split("\n") if l.strip()]
units.sort(key=lambda x: (ORDER.index(x[0]) if x[0] in ORDER else 99, x[1]))
running = set()
rf = HERE / "running.txt"
if rf.exists(): running = {(l.split()[0], int(l.split()[1])) for l in rf.read_text().split("\n") if l.strip()}
done, started, todo = [], [], []
for c, n in units:
    d = HERE / c
    files = list(d.glob("u%d.*.json" % n)) if d.exists() else []
    if files and subprocess.run([sys.executable, str(HERE / "validate.py"), c, str(n)], capture_output=True).returncode == 0: done.append((c, n))
    elif files: started.append((c, n))
    else: todo.append((c, n))
if len(sys.argv) > 2 and sys.argv[1] == "next":
    k = int(sys.argv[2])
    for c, n in [x for x in started + todo if x not in running][:k]: print(c, n)
else:
    print("done %d · started %d · to do %d · running %d (of %d)" % (len(done), len(started), len(todo), len(running), len(units)))
    if started: print("started:", " ".join("%s%d" % x for x in started))
