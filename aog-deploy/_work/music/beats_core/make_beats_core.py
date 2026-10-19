#!/usr/bin/env python3
"""AOG-BEATS-PERFECT-V1: makes aog-deploy/aog-beats.js (window.AOGBeats) from the family files here.
The first drum machine (music-drums.html) is retired, so its beats now live here; never edit aog-beats.js by hand,
and don't run music-handoff/tools/drumkits/extract_beats.js again (it would bring back the old beats).
Run node check_core.js first."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "..", "aog-beats.js")
base = json.load(open(os.path.join(HERE, "_base.json"), encoding="utf-8"))
orig = json.load(open(os.path.join(HERE, "_original.json"), encoding="utf-8"))
byid, styles = {}, None
for f in ["rockpop", "funkhiphop", "jazzworld", "latincarib", "electronic"]:
    J = json.load(open(os.path.join(HERE, f + ".json"), encoding="utf-8"))
    for b in J["beats"]: byid[b["id"]] = b
    if "styles" in J: styles = J["styles"]
# AOG-BEATS-GROUPS-V1 (Jimmy, 2026-10-19: "group the drum kits accordingly. They can be mixed together"): each group slow to fast
gi = {g: i for i, g in enumerate(base["groups"])}
beats = sorted((byid[b["id"]] for b in orig["beats"]), key=lambda b: (gi.get(b["grp"], 99), b.get("bpm", 0)))
data = json.dumps({"groups": base["groups"], "styles": styles, "beats": beats, "classroom": base["classroom"]}, ensure_ascii=False, separators=(",", ":"))
js = """/* AOG-KIT-BEATS-V1, AOG-BEATS-PERFECT-V1 — the drum machine's beats, for the Drum Machine and the Drum Kit.
   MADE BY aog-deploy/_work/music/beats_core/make_beats_core.py from the family files there (Jimmy, 2026-10-19: "just the drum
   beats edited and more perfected"): never edit this file by hand. 1 = a hit, 2 = an accent, 3 = a soft hit (a ghost note);
   res steps a beat (4 sixteenths, the default; 3 and 6 triplets; 8 thirty-second notes); up to four bars (map, then parts). */
(function(root){ "use strict";
  root.AOGBeats = %s;
})(typeof window !== "undefined" ? window : this);
""" % data
open(OUT, "w", encoding="utf-8").write(js)
print("aog-beats.js: %d beats, %d styles, %d KB" % (len(beats), len(styles), len(js.encode()) // 1024))
