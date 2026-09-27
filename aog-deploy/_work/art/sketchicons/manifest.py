#!/usr/bin/env python3
"""Writes the list of drawn pictures (img/sketch/*.webp) into aog-sketch.js (HAVE). Run from aog-deploy/."""
import os, re, json
have = {f[:-5]: 1 for f in os.listdir("img/sketch") if f.endswith(".webp")}
p = "aog-sketch.js"; s = open(p, encoding="utf-8").read()
s = re.sub(r"/\*SKETCH-LIST\*/.*?/\*END\*/", "/*SKETCH-LIST*/" + json.dumps(have, separators=(",", ":")) + "/*END*/", s, flags=re.S)
open(p, "w", encoding="utf-8").write(s); print("pictures listed:", len(have))
