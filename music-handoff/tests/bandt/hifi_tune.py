# AOG-BAND-HIFI-V1 — the tuning half of bandt/hifi.js: each note the page rendered (16-bit, 44.1 kHz, one channel per file,
# a stereo note as two) is measured the way the Band's builders measure (music-handoff/tools/band/tune.py, through
# hifi.py's cents()), and printed as JSON: {name: cents from the note}.
#   python3 -I hifi_tune.py <folder with index.json>
import os, sys, json, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(HERE, "..", "..", "tools", "band")))
sys.argv = [sys.argv[0]] + sys.argv[1:]
import hifi
d = sys.argv[1]
idx = json.load(open(os.path.join(d, "index.json")))
out = {}
for r in idx:
    chans = [np.frombuffer(open(os.path.join(d, f), "rb").read(), dtype=np.int16).astype(np.float64) / 32768 for f in r["files"]]
    n = min(len(c) for c in chans)
    x = np.stack([c[:n] for c in chans], axis=1)
    k = hifi.kind_of(r["player"], r["key"])
    out[r["name"]] = None if k is None else hifi.cents(x, int(r["key"][:-1]), k, r["player"])
print(json.dumps(out))
