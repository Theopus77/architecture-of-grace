#!/usr/bin/env python3
"""
OPTIONAL — only if Jimmy chooses "renumber straight through" (see RELIGION_PLAN.md).
NOT RUN. Renumbers a course's unit and chapter files so the K–8 bands come first.

Reads the course's outline.py (UNITS in band order, with the numbers they carry
now), computes the new contiguous numbers in list order (unit 1 = first K–2
unit, chapter 1 = its first chapter) and:
  · renames ch<old>.json → ch<new>.json, u<old>.json / u<old>_head.json likewise
    (through a temp name so nothing collides), fixing the "n" fields inside;
  · rewrites the n= numbers in outline.py;
  · re-keys LINKS and the banners_<id>_a/_b.py BANNERS/CREDITS dicts.
It does NOT touch built pages, _redirects, sw.js, sitemap.xml or the hub —
those are rebuilt by build_<id>.py / plumb_<id>.py afterwards, and the OLD
/rel1… short links then point at different units (the risk the plan names).
Run from the course folder:  python3 ../course/renumber.py --dry-run   (then without)
"""
import json, os, re, sys, importlib
HERE = os.getcwd()
sys.path.insert(0, HERE)
outline = importlib.import_module("outline")
UNITS = outline.UNITS
dry = "--dry-run" in sys.argv
umap, cmap = {}, {}
un = cn = 0
for u in UNITS:
    un += 1; umap[u["n"]] = un
    for c in u["chapters"]:
        cn += 1; cmap[c["n"]] = cn
print("units:", {k: v for k, v in umap.items() if k != v})
print("chapters:", {k: v for k, v in cmap.items() if k != v})
if all(k == v for k, v in umap.items()) and all(k == v for k, v in cmap.items()):
    print("already contiguous in band order — nothing to do"); sys.exit(0)

def move(old, new):
    if not os.path.exists(old): return
    print("  ", old, "→", new)
    if not dry: os.rename(old, new)

# 1. files, via temp names
tmp = []
for old, new in cmap.items():
    if old != new and os.path.exists(f"ch{old}.json"):
        move(f"ch{old}.json", f"ch{old}.json.tmp"); tmp.append((f"ch{old}.json.tmp", f"ch{new}.json", "ch", new))
for old, new in umap.items():
    if old != new:
        for suf in ("", "_head"):
            if os.path.exists(f"u{old}{suf}.json"):
                move(f"u{old}{suf}.json", f"u{old}{suf}.json.tmp"); tmp.append((f"u{old}{suf}.json.tmp", f"u{new}{suf}.json", "u", new))
for t, final, kind, new in tmp:
    move(t, final)
    if dry: continue
    d = json.load(open(final, encoding="utf-8"))
    if "n" in d: d["n"] = new
    if kind == "u" and "chapters" in d:
        for ch in d["chapters"]: ch["n"] = cmap.get(ch["n"], ch["n"])
    json.dump(d, open(final, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# 2. outline.py: n= inside unit dicts and chapter dicts, and LINKS keys
src = open("outline.py", encoding="utf-8").read()
def fix_unit(m): return "dict(n=%d, band=" % umap[int(m.group(1))]
def fix_ch(m): return "dict(n=%d, title=" % cmap[int(m.group(1))]
src2 = re.sub(r"dict\(n=(\d+), band=", fix_unit, src)
src2 = re.sub(r"dict\(n=(\d+), title=", fix_ch, src2)
def fix_link(m): return "\n %d:" % umap[int(m.group(1))]
src2 = re.sub(r"\n (\d+):", fix_link, src2)
if not dry: open("outline.py", "w", encoding="utf-8").write(src2)
print("outline.py rewritten" if not dry else "outline.py would be rewritten")

# 3. banners: BANNERS[n] / CREDITS[n]
for f in sorted(os.listdir(HERE)):
    if re.match(r"banners_\w+_[ab]\.py$", f):
        b = open(f, encoding="utf-8").read()
        b2 = re.sub(r"\b(BANNERS|CREDITS)\[(\d+)\]", lambda m: "%s[%d]" % (m.group(1), umap.get(int(m.group(2)), int(m.group(2)))), b)
        if not dry: open(f, "w", encoding="utf-8").write(b2)
        print(f, "re-keyed")
print("done" if not dry else "dry run — nothing changed")
