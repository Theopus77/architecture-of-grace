# -*- coding: utf-8 -*-
"""AOG-STRINGS-V1 (2026-10-03) — music-guitar.html and music-bass.html, from one page.

Jimmy: "CAN THE same engine be applied to the GUitar and the bass guitar?" — "Two new tools", "Built on the page".
The two instruments share everything but their strings, their sounds and a few words, so they are one page,
_work/music/strings_page.html. Edit that page, then build both:

  python3 _work/music/make_strings.py        (from aog-deploy/)
"""
import html, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))

PAGES = {
    "guitar": {
        "TITLE": "The Guitar",
        "DESC": "Acoustic, classical and electric guitars, with an amp and pedals. Tap a chord, strum the strings, or play the frets. Works on a phone, a tablet and a computer.",
        "OGDESC": "Tap a chord. Strum. No login.",
        "PLATE": "SIX-STRING GUITAR",
        "PLATESMALL": "ACOUSTIC · ELECTRIC · AMP · PEDALS",
    },
    "bass": {
        "TITLE": "The Bass",
        "DESC": "Electric, upright and synth bass, with an amp and pedals. Tap a chord to hear its low note, or play the frets. Works on a phone, a tablet and a computer.",
        "OGDESC": "Tap a chord. Pluck. No login.",
        "PLATE": "FOUR-STRING BASS",
        "PLATESMALL": "FINGERS · PICK · AMP · PEDALS",
    },
}


def build():
    with open(os.path.join(HERE, "strings_page.html"), encoding="utf-8") as f:
        src = f.read()
    for inst, words in PAGES.items():
        out = src.replace("@@INST@@", inst).replace("@@SLUG@@", inst)
        for k, v in words.items():
            out = out.replace("@@%s@@" % k, html.escape(v, quote=True))
        left = [w for w in out.split("@@")[1::2] if w.isupper() and len(w) < 20]
        if left:
            raise SystemExit("unfilled: %s" % ", ".join(sorted(set(left))))
        path = os.path.join(ROOT, "music-%s.html" % inst)
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
        print("wrote", os.path.relpath(path, ROOT), len(out), "bytes")


if __name__ == "__main__":
    build()
