#!/usr/bin/env python3
"""AOG-BEATS-ELITE-V1: joins the family files here (*.json) into aog-deploy/aog-beats-pro.js.
Run node check_beats.js first. The Drum Machine and the Drum Kit load the made file (defer) and show its groups first."""
import json, os, glob
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "..", "aog-beats-pro.js")
ORDER = ["hiphop", "electronic", "live", "world"]   # the families, in the menu's order
files = sorted(glob.glob(os.path.join(HERE, "*.json")), key=lambda f: (ORDER.index(os.path.basename(f)[:-5]) if os.path.basename(f)[:-5] in ORDER else 99, f))
groups, beats = {}, []
for f in files:
    J = json.load(open(f, encoding="utf-8"))
    groups.update(J.get("groups", {}))
    for b in J.get("beats", []):
        b = dict(b); b["pro"] = 1
        beats.append(b)
data = json.dumps({"groups": groups, "beats": beats}, ensure_ascii=False, separators=(",", ":"))
js = """/* AOG-BEATS-ELITE-V1 (Jimmy, 2026-10-19: "Produce some of the dopest and BEST hitting drum beat out there … we are no
   where near the ceiling"): the newer beats, MADE BY aog-deploy/_work/music/beats_pro/make_beats_pro.py from the family files
   there (never edit this file by hand). A beat may have res steps a beat (3 eighth-note triplets, 4 sixteenths, 6 sixteenth
   triplets, 8 thirty-second notes) and up to four bars (map, then parts). Loaded with defer after aog-beats.js: they join the
   main groups in window.AOGBeats, and "aog-beats-more" tells the page to draw its beat menu again. */
(function(root){ "use strict";
  var P = %s;
  root.AOGBeatsPro = P;
  var A = root.AOGBeats; if (!A || A._pro) return;
  /* AOG-BEATS-GROUPS-V1 (Jimmy, 2026-10-19: "group the drum kits accordingly. They can be mixed together"): these beats join
     the main groups, mixed in, each group slow to fast */
  Object.keys(P.groups || {}).forEach(function(k){ if (!A.groups[k]) A.groups[k] = P.groups[k]; });
  var gi = {}; Object.keys(A.groups).forEach(function(k, i){ gi[k] = i; });
  var all = A.beats.concat(P.beats).map(function(b, i){ return [b, i]; });
  all.sort(function(x, y){ var a = x[0], b = y[0], ga = gi[a.grp] != null ? gi[a.grp] : 99, gb = gi[b.grp] != null ? gi[b.grp] : 99;
    return ga - gb || (a.bpm || 0) - (b.bpm || 0) || x[1] - y[1]; });
  A.beats = all.map(function(x){ return x[0]; }); A._pro = 1;
  try { root.dispatchEvent(new Event("aog-beats-more")); } catch (e) {}
})(typeof window !== "undefined" ? window : this);
""" % data
open(OUT, "w", encoding="utf-8").write(js)
print("aog-beats-pro.js: %d beats in %d groups, %d KB" % (len(beats), len(groups), len(js.encode()) // 1024))
