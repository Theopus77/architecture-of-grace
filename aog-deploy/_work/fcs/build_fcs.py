#!/usr/bin/env python3
"""
AOG-FCS-V1 — Family & Consumer Sciences, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 20 unit JSON files in five bands →
facs-course.html and fcs-u1.html … fcs-u20.html.

Run from aog-deploy/:  python3 _work/fcs/build_fcs.py
Then:                  python3 _work/fcs/inject_fcs_jump.py   (the Family & Consumer Sciences jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_fcs import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("facs-course.html", "FACS · Course contents", "")]
        opts += [("fcs-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Family &amp; Consumer Sciences · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="fcs", page="fcs-u%d.html", short="fcs%d",
    unit_files=available_units(),
    builder="_work/fcs/build_fcs.py", src="_work/fcs/u*.json",
    title="Family & Consumer Sciences, K–12",
    h1=("Family & Consumer Sciences", "Ciencias de la Familia y el Consumidor"),
    og_alt="A link card for the Family & Consumer Sciences course at Architecture of Grace.",
    contents_page="facs-course.html", contents_short="facs-course",
    contents_k=("The Interior — Family & Consumer Sciences · Every band", "El Interior — Ciencias de la Familia y el Consumidor · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free Family & Consumer Sciences course following the Illinois (Common Core) progression: 27 units across five grade bands, %d chapters, %d numbered lessons with worked examples, key words, data, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (ch, les),
    contents_back=("← FACS, the whole course", "← Ciencias de la Familia y el Consumidor, el curso completo"),
    search_ph="Try “knife”, “budget” or “stitch”",
    hub="facs-hub.html", hub_back=("← FACS, every band", "← Ciencias de la Familia y el Consumidor, cada banda"),
    k_line=("The Interior — Family & Consumer Sciences", "El Interior — Ciencias de la Familia y el Consumidor"),
    desc_lead=lambda u: "Family & Consumer Sciences, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("How people learned it", "Cómo la gente lo aprendió"),
    foot=("Architecture of Grace · Family & Consumer Sciences, K–12 · original text following the Illinois World Languages (ACTFL) progression · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Ciencias de la Familia y el Consumidor · texto original que sigue los estándares nacionales de Ciencias de la Familia y el Consumidor · el banner es una escena dibujada, no una fotografía."),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="FACS · ", jump_strip="FACS · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
