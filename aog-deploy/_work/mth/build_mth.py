#!/usr/bin/env python3
"""
AOG-MTH-V1 — Mathematics, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 27 unit JSON files in five bands →
math-course.html and mth-u1.html … mth-u27.html.

Run from aog-deploy/:  python3 _work/mth/build_mth.py
Then:                  python3 _work/mth/inject_mth_jump.py   (the five Math jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_mth import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("math-course.html", "Math · Course contents", "")]
        opts += [("mth-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Math · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="mth", page="mth-u%d.html", short="mth%d",
    unit_files=available_units(),
    builder="_work/mth/build_mth.py", src="_work/mth/u*.json",
    title="Mathematics, K–12",
    h1=("Mathematics", "Matemáticas"),
    og_alt="A link card for the K–12 mathematics course at Architecture of Grace.",
    contents_page="math-course.html", contents_short="math-course",
    contents_k=("The Interior — Math · Every band", "El Interior — Matemáticas · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 mathematics course following the Illinois (Common Core) progression: 27 units across five grade bands, %d chapters, %d numbered lessons with worked examples, key words, data, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (ch, les),
    contents_back=("← Math, the whole course", "← Matemáticas, el curso completo"),
    search_ph="Try “fraction”, “slope” or “angle”",
    hub="math-hub.html", hub_back=("← Math, every band", "← Matemáticas, cada banda"),
    k_line=("The Interior — Math", "El Interior — Matemáticas"),
    desc_lead=lambda u: "Mathematics, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("How we figured it out", "Cómo lo descubrimos"),
    foot=("Architecture of Grace · Mathematics, K–12 · original text following the Illinois (Common Core) progression · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Matemáticas, K–12 · texto original que sigue la progresión de Illinois (Common Core) · el banner es una escena dibujada, no una fotografía."),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Math · ", jump_strip="Math · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
