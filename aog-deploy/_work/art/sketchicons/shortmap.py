#!/usr/bin/env python3
"""Writes the short-link → page map (from _redirects) into aog-sketch.js (SHORT), so a hub card can find the
pencil drawing of the unit or room it opens. Run from aog-deploy/ after adding pages."""
import re, json
m = {}
for line in open("_redirects", encoding="utf-8"):
    p = line.split()
    if len(p) >= 2 and p[0].startswith("/") and ":" not in p[0] and "*" not in p[0]:
        t = re.fullmatch(r"/([A-Za-z0-9-]+)\.html", p[1])
        if t and t.group(1) != p[0][1:]: m[p[0]] = t.group(1)
s = open("aog-sketch.js", encoding="utf-8").read()
s = re.sub(r"/\*SHORT\*/.*?/\*END\*/", "/*SHORT*/" + json.dumps(m, separators=(",", ":")) + "/*END*/", s, flags=re.S)
open("aog-sketch.js", "w", encoding="utf-8").write(s); print("short links:", len(m))
