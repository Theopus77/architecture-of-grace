#!/usr/bin/env python3
"""
AOG-SPA-V1 — Spanish, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 20 unit JSON files in five bands →
spanish-course.html and spa-u1.html … spa-u20.html.

Run from aog-deploy/:  python3 _work/spa/build_spa.py
Then:                  python3 _work/spa/inject_spa_jump.py   (the five Spanish jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_spa import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("spanish-course.html", "Spanish · Course contents", "")]
        opts += [("spa-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Spanish · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="spa", page="spa-u%d.html", short="spa%d",
    unit_files=available_units(),
    builder="_work/spa/build_spa.py", src="_work/spa/u*.json",
    title="Spanish, K–12",
    h1=("Spanish", "Español"),
    og_alt="A link card for the K–12 Spanish course at Architecture of Grace.",
    contents_page="spanish-course.html", contents_short="spanish-course",
    contents_k=("The Interior — Spanish · Every band", "El Interior — Español · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 Spanish course following the Illinois (Common Core) progression: 27 units across five grade bands, %d chapters, %d numbered lessons with worked examples, key words, data, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (ch, les),
    contents_back=("← Spanish, the whole course", "← Español, el curso completo"),
    search_ph="Try “ser”, “preterite” or “colors”",
    hub="spanish-hub.html", hub_back=("← Spanish, every band", "← Español, cada banda"),
    k_line=("The Interior — Spanish", "El Interior — Español"),
    desc_lead=lambda u: "Spanish, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("The story of the language", "La historia del idioma"),
    foot=("Architecture of Grace · Spanish, K–12 · original text following the Illinois World Languages (ACTFL) progression · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Español, K–12 · texto original que sigue la progresión de Illinois para idiomas (ACTFL) · el banner es una escena dibujada, no una fotografía."),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Spanish · ", jump_strip="Spanish · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
