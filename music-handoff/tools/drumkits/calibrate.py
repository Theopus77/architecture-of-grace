"""Move each pad's file loudness (levels.json) by how far the machine's measurement (calib.js) is from its TARGET.
usage: python3 calibrate.py <measured.json> [--apply]     (without --apply it only reports)"""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from kits import TARGET

meas = json.load(open(sys.argv[1]))
apply = "--apply" in sys.argv
lv = json.load(open(os.path.join(HERE, "levels.json")))
worst = 0.0
for key, row in sorted(meas.items()):
    era, kid = key.split(":")
    if era != "1" or kid not in TARGET:
        continue
    out = []
    for pid, tg in TARGET[kid].items():
        if tg is None:
            continue
        got = row["pads"][pid]["1"]["mom"]
        err = tg - got
        worst = max(worst, abs(err))
        out.append(f"{pid} {got:6.1f}->{tg:6.1f} ({err:+.1f})")
        if apply:
            lv[kid][pid] = round(lv[kid][pid] + err, 2)
    print(kid, " | ".join(out))
print("largest error %.2f dB" % worst)
if apply:
    json.dump(lv, open(os.path.join(HERE, "levels.json"), "w"), indent=1, sort_keys=True)
    print("levels.json moved")
