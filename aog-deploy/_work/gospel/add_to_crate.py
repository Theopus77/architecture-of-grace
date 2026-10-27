# AOG-GOSPEL-V1: puts the two gospel records' entries (gospel-choir.json from make_choir.py, jubilee-voices.json from
# make_jubilee.py) into ../../audio/crate/crate.json, replacing them where they are; every other record stays as it was.
# ../crate/make_crate.py adds them too when the whole crate is made again.
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); CRATE = os.path.join(HERE, "..", "..", "audio", "crate", "crate.json")
new = [json.load(open(os.path.join(HERE, f))) for f in ("gospel-choir.json", "jubilee-voices.json")]
d = [x for x in json.load(open(CRATE)) if x["file"] not in {e["file"] for e in new}] + new
open(CRATE, "w").write(json.dumps(d, ensure_ascii=False, indent=1))
print(len(d), "records in the crate")
