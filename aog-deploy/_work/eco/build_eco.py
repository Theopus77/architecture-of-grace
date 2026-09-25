#!/usr/bin/env python3
"""
AOG-ECO-V1 — Economics, Grades 9–12. The configuration for the shared course builder
(_work/course/build_course.py): 8 unit JSON files in five bands →
economics-course.html and eco-u1.html … eco-u8.html.

Run from aog-deploy/:  python3 _work/eco/build_eco.py
Then:                  python3 _work/eco/inject_eco_jump.py   (the Economics jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_eco import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("economics-course.html", "Economics · Course contents", "")]
        opts += [("eco-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Economics · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="eco", page="eco-u%d.html", short="eco%d",
    unit_files=available_units(),
    builder="_work/eco/build_eco.py", src="_work/eco/u*.json",
    title="Economics, Grades 9–12",
    h1=("Economics", "Economía"),
    og_alt="A link card for the Economics course at Architecture of Grace.",
    contents_page="economics-course.html", contents_short="economics-course",
    contents_k=("The Interior — Economics · Every band", "El Interior — Economía · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free Economics course following the Illinois (Common Core) progression: 27 units across five grade bands, %d chapters, %d numbered lessons with worked examples, key words, data, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (ch, les),
    contents_back=("← Economics, the whole course", "← Economía, el curso completo"),
    search_ph="Try “scarcity”, “demand” or “GDP”",
    hub="economics-hub.html", hub_back=("← Economics, every band", "← Economía, cada banda"),
    k_line=("The Interior — Economics", "El Interior — Economía"),
    desc_lead=lambda u: "Economics, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("How the ideas came about", "Cómo surgieron las ideas"),
    foot=("Architecture of Grace · Economics, Grades 9–12 · original text following the Illinois World Languages (ACTFL) progression · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Economía · texto original que sigue los estándares de economía de Illinois y los estándares nacionales de economía · el banner es una escena dibujada, no una fotografía."),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Economics · ", jump_strip="Economics · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
