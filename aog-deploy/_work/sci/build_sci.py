#!/usr/bin/env python3
"""
AOG-SCI-V1 — Science, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 27 unit JSON files in five bands →
science-course.html and sci-u1.html … sci-u27.html.

Run from aog-deploy/:  python3 _work/sci/build_sci.py
Then:                  python3 _work/jump/inject_jump.py   (the science groups are
                       written by this builder on its own pages; the injector's
                       science block — see _work/sci/plumb_sci.py — adds them elsewhere)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_sci import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    """One block per Science band optgroup: the course contents, then that band's units."""
    out = []
    for b in BANDS:
        opts = [("science-course.html", "Science · Course contents", "")]
        opts += [("sci-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Science · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="sci", page="sci-u%d.html", short="sci%d",
    unit_files=available_units(),
    builder="_work/sci/build_sci.py", src="_work/sci/u*.json",
    title="Science, K–12",
    h1=("Science", "Ciencias"),
    og_alt="A link card for the K–12 science course at Architecture of Grace.",
    contents_page="science-course.html", contents_short="science-course",
    contents_k=("The Interior — Science · Every band", "El Interior — Ciencias · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 science course following the Illinois (NGSS) storyline: 27 units across five grade bands, %d chapters, %d numbered lessons with readings, key words, sources and data, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (ch, les),
    contents_back=("← Science, the whole course", "← Ciencias, el curso completo"),
    search_ph="Try “magnet”, “cell” or “eclipse”",
    hub="science-hub.html", hub_back=("← Science, every band", "← Ciencias, cada banda"),
    k_line=("The Interior — Science", "El Interior — Ciencias"),
    desc_lead=lambda u: "Science, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("How we figured it out", "Cómo lo descubrimos"),
    foot=("Architecture of Grace · Science, K–12 · original text following the Illinois (NGSS) storyline · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Ciencias, K–12 · texto original que sigue la secuencia de Illinois (NGSS) · el banner es una escena dibujada, no una fotografía."),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Science · ", jump_strip="Science · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
