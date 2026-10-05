#!/usr/bin/env python3
"""Write the four synthesizer sets' SETS entries (piano_synth_sets.json) into aog-deploy/music-piano.html.
usage: python3 music-handoff/tools/piano_synth_page.py"""
import os, re, json
HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "..", "aog-deploy", "music-piano.html")
MAN = os.path.join(HERE, "piano_synth_sets.json")
PAD = {"lead": "lead:   ", "strsynth": "strsynth:", "pad": "pad:    ", "brass": "brass:  "}

sets = json.load(open(MAN))["sets"]
s = open(PAGE, encoding="utf-8").read()
for name, info in sets.items():
    e = info["sets_entry"]
    ends = ",".join("%s:%s" % (k, ("%.5f" % v).rstrip("0").rstrip(".")) for k, v in e["ends"].items())
    line = ('%s{dir:"%s", layers:["m"], even:true, loop:[%s,%s],\n    ends:{%s}, notes:[%s]},'
            % (PAD[name], e["dir"], ("%.2f" % e["loop"][0]).rstrip("0").rstrip("."), ("%.5f" % e["loop"][1]).rstrip("0"),
               ends, ",".join(str(n) for n in e["notes"])))
    pat = re.compile(r'^  %s\{dir:"/audio/piano/[a-z]+/".*?notes:\[[0-9,]+\]\},?$' % re.escape(PAD[name]), re.M | re.S)
    m = pat.search(s)
    if not m:
        raise SystemExit("no SETS entry for " + name)
    s = s[:m.start()] + "  " + line + s[m.end():]
open(PAGE, "w", encoding="utf-8").write(s)
print("wrote", ", ".join(sets))
