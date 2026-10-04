# -*- coding: utf-8 -*-
"""AOG-BAND-V1 (2026-10-03) — music-band.html: brass and woodwinds, recorded.

Jimmy: "How about horns and wood instruments as well?" — "One tool: The Band", "Recorded".
The page is two files, so each stays easy to read:

  _work/music/band_head.html   the head, the styles and the page itself, up to the script
  _work/music/band_script.js   the script, with @@MANIFEST@@ where the list of recordings goes

The recordings are in audio/band/<instrument>/ (VS Chamber Orchestra: Community Edition, public domain;
see audio/band/CREDITS.txt), and audio/band/manifest.json lists them. Edit the two files above, then:

  python3 _work/music/make_band.py        (from aog-deploy/)
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))


def build():
    with open(os.path.join(HERE, "band_head.html"), encoding="utf-8") as f:
        head = f.read()
    with open(os.path.join(HERE, "band_script.js"), encoding="utf-8") as f:
        script = f.read()
    with open(os.path.join(ROOT, "audio", "band", "manifest.json"), encoding="utf-8") as f:
        man = json.load(f)
    # every file the manifest names must be there, or a note would fall silent
    # (the vibrato players' short notes are the plain player's: "stacDir"; the kit's strokes are named: "hits")
    missing = []
    for inst, m in man.items():
        for kind, key in (("s", "sus"), ("l", "susL"), ("t", "stac")):
            for n in m[key]:
                folder = m.get("stacDir", inst) if kind == "t" else inst
                folder = man.get(folder, {}).get("dir", folder)    # a player made again sits in its own new folder
                p = os.path.join(ROOT, "audio", "band", folder, "%d%s.mp3" % (n, kind))
                if not os.path.exists(p):
                    missing.append(os.path.relpath(p, ROOT))
        for names in m.get("hits", {}).values():
            for h in names:
                p = os.path.join(ROOT, "audio", "band", inst, h + ".mp3")
                if not os.path.exists(p):
                    missing.append(os.path.relpath(p, ROOT))
    if missing:
        raise SystemExit("missing recordings: %s" % ", ".join(missing[:10]))
    if script.count("@@MANIFEST@@") != 1:
        raise SystemExit("band_script.js needs exactly one @@MANIFEST@@")
    out = head.rstrip("\n") + "\n<script>\n" + script.replace(
        "@@MANIFEST@@", json.dumps(man, separators=(",", ":"))).rstrip("\n") + "\n</script>\n</body>\n</html>\n"
    if "@@" in out.replace("@@MANIFEST@@", ""):
        left = sorted(set(w for w in out.split("@@")[1::2] if w.isupper() and len(w) < 20))
        if left:
            raise SystemExit("unfilled: %s" % ", ".join(left))
    path = os.path.join(ROOT, "music-band.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)
    print("wrote", os.path.relpath(path, ROOT), len(out), "bytes")


if __name__ == "__main__":
    build()
