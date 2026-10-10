# stamp.py — puts the site's first-paint head line (AOG-ONE-PAINT-V1 + light start) into Adult pages
# that carry the @@FIRSTPAINT@@ placeholder. Usage: python3 adult-build/stamp.py aog-deploy/adult-*.html
import sys, io, os
HERE = os.path.dirname(os.path.abspath(__file__))
line = io.open(os.path.join(HERE, "head_firstpaint.txt"), encoding="utf-8").read().rstrip("\n")
for f in sys.argv[1:]:
    s = io.open(f, encoding="utf-8").read()
    if "@@FIRSTPAINT@@" in s:
        io.open(f, "w", encoding="utf-8").write(s.replace("@@FIRSTPAINT@@", line, 1)); print("stamped", f)
