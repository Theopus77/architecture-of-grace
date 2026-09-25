#!/usr/bin/env python3
"""
AOG-USH-V1 — U.S. History, Grades 6–8. The configuration for the shared course
builder (_work/course/build_course.py): ten unit JSON files → us-history.html
and ush-u1.html … ush-u10.html.

Run from aog-deploy/:  python3 _work/ush/build_ush.py
Then:                  python3 _work/jump/inject_jump.py
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import LINKS
from banners import CREDITS, banner
import build_course

UNIT_SHORT = {1:"Early Encounters",2:"English Settlement",3:"A New Nation",4:"The Early Republic",
              5:"Pushing National Boundaries",6:"Civil War and Reconstruction",7:"America on the Move",
              8:"Twentieth-Century Crises",9:"Postwar America",10:"America in a Changing World"}
IND = "&nbsp;&nbsp;&nbsp;&nbsp;"

COURSE = dict(
    id="ush", page="ush-u%d.html", short="ush%d",
    unit_files=[HERE / ("u%d.json" % i) for i in range(1, 11)],
    builder="_work/ush/build_ush.py", src="_work/ush/u*.json",
    title="U.S. History, Grades 6–8",
    h1=("U.S. History", "Historia de EE. UU."),
    og_alt="A link card for the grades 6–8 U.S. History course at Architecture of Grace.",
    contents_page="us-history.html", contents_short="us-history",
    contents_k=("The Interior — Social Studies · Grades 6–8", "El Interior — Estudios Sociales · Grados 6–8"),
    contents_deck=("The whole course on one page: ten units, each with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página: diez unidades, cada una con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free U.S. history course for grades 6–8: ten units, %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (ch, les),
    contents_back=("← U.S. History, the whole course", "← Historia de EE. UU., el curso completo"),
    search_ph="Try “Constitution” or “railroad”",
    hub="social-studies-hub.html", hub_back=("← Social Studies, every band", "← Estudios Sociales, cada banda"),
    k_line=("The Interior — Social Studies · U.S. History 6–8", "El Interior — Estudios Sociales · Historia de EE. UU. 6–8"),
    desc_lead=lambda u: "U.S. History, grades 6–8",
    tl_label=("On the timeline", "En la línea del tiempo"),
    foot=("Architecture of Grace · U.S. History, Grades 6–8 · original text following the arc of a standard course · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Historia de EE. UU., grados 6–8 · texto original que sigue el arco de un curso estándar · el banner es una escena dibujada, no una fotografía."),
    bands=None, band_title=lambda b: "",
    jump_groups=[("Social Studies · Grades 6–8",
                  [("us-history.html", "U.S. History · Course contents", "")] +
                  [("ush-u%d.html" % k, "Unit %d · %s" % (k, UNIT_SHORT[k]), IND) for k in range(1, 11)])],
    jump_cur="U.S. History 6–8 · ", jump_strip="U.S. History · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    build_course.build(COURSE)
