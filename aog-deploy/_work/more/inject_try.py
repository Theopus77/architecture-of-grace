#!/usr/bin/env python3
"""AOG-TRY-V1 — Try it: a lesson's button that opens the one lab moment that shows it.

    python3 _work/more/inject_try.py          (from aog-deploy/; after _work/more/try/<course>.json changes)

The picks live in _work/more/try/<course>.json, made by curator agents from try/CATALOG.md:
    {"<unit>:<lesson id>": {"href": "/microscope?slide=onion", "en": "…", "es": "…"}}
Each pick becomes <a class="lbtn try" data-aog-try …> in that lesson's button row on the unit page, in the same form
build_course.py writes for a lesson's own "try" (a lesson that already has one keeps it). Running it again replaces the
earlier picks; build_course.py writes the same button from the same file when it rebuilds a page."""
import html, json, re
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEPLOY = HERE.parent.parent
E = lambda s: html.escape(str(s), quote=True)
OLD = re.compile(r'<a class="lbtn try" data-aog-try href="[^"]*"><span data-en="[^"]*" data-es="[^"]*">[^<]*</span> ›</a>')
SAFE = re.compile(r"^/(telescope\?target=[a-z0-9]+|microscope\?slide=[a-z0-9]+|waves\?l=\d+#lessons|dojo#[a-z0-9-]+|kitchen-lab#(skill-)?[a-z-]+|"
                  r"sewing-lab#[a-z-]+|drum-machine|piano|guitar|bass|band|turntables|mixing-desk|piano-lessons|guitar-lessons|bass-lessons|"
                  r"cube|drops/foundry|telescope|microscope|waves|telescope-lessons|microscope-lessons)$")

def main():
    pages = {}
    for l in (HERE / "pages.txt").read_text().split("\n"):
        p = l.split()
        if len(p) == 3: pages[(p[0], int(p[1]))] = p[2]
    total = 0
    for f in sorted((HERE / "try").glob("*.json")):
        cid = f.stem
        picks = json.load(open(f, encoding="utf-8"))
        byu = {}
        for k, v in picks.items():
            u, lid = k.split(":")
            if not SAFE.match(v.get("href", "")): print("skip (not in the catalog):", cid, k, v.get("href")); continue
            byu.setdefault(int(u), {})[lid] = v
        for (c, n), page in pages.items():
            if c != cid: continue
            p = DEPLOY / page
            s = OLD.sub("", p.read_text(encoding="utf-8"))
            for lid, v in byu.get(n, {}).items():
                m = re.search(r'<article class="les" id="%s"[^>]*>.*?</article>' % re.escape(lid), s, re.S)
                if not m: print("no lesson", cid, n, lid); continue
                art = m.group(0)
                if 'class="lbtn try"' in art: continue                     # the lesson's own Try it stays
                btn = '<a class="lbtn try" data-aog-try href="%s"><span data-en="%s" data-es="%s">%s</span> ›</a>' % (E(v["href"]), E(v["en"]), E(v["es"]), E(v["en"]))
                art2 = re.sub(r'(<button type="button" class="lbtn listen"[^>]*>.*?</button>)', lambda mm: mm.group(1) + btn, art, count=1, flags=re.S)
                if art2 != art: s = s.replace(art, art2, 1); total += 1
            p.write_text(s, encoding="utf-8")
    print("Try it buttons:", total)

if __name__ == "__main__":
    main()
