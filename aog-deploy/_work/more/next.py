#!/usr/bin/env python3
"""python3 _work/more/next.py <done course> <done N> [K=1] — take a finished unit off running.txt and put the next K on it (printed)."""
import subprocess, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
rf = HERE / "running.txt"
run = [l for l in rf.read_text().split("\n") if l.strip()] if rf.exists() else []
if len(sys.argv) > 2: run = [l for l in run if l.split() != [sys.argv[1], sys.argv[2]]]
rf.write_text("\n".join(run) + ("\n" if run else ""))
k = int(sys.argv[3]) if len(sys.argv) > 3 else 1
nxt = subprocess.run([sys.executable, str(HERE / "status.py"), "next", str(k)], capture_output=True, text=True).stdout.split("\n")
nxt = [l for l in nxt if l.strip()]
with open(rf, "a") as f:
    for l in nxt: f.write(l + "\n")
print("\n".join(nxt))
