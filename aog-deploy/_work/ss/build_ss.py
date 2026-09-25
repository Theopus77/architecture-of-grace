#!/usr/bin/env python3
"""
AOG-SS-V1 — Social Studies, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 24 unit JSON files in five bands →
social-studies-course.html and ssc-u1.html … ssc-u24.html.

Run from aog-deploy/:  python3 _work/ss/build_ss.py
Then:                  python3 _work/jump/inject_jump.py   (the science groups are
                       written by this builder on its own pages; the injector's
                       science block — see _work/ss/plumb_ss.py — adds them elsewhere)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_ss import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    """One block per Social Studies band optgroup: the course contents, then that band's units."""
    out = []
    for b in BANDS:
        opts = [("social-studies-course.html", "Social Studies · Course contents", "")]
        opts += [("ssc-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Social Studies · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="ss", page="ssc-u%d.html", short="ssc%d",
    unit_files=available_units(),
    builder="_work/ss/build_ss.py", src="_work/ss/u*.json",
    title="Social Studies, K–12",
    h1=('Social Studies', 'Estudios Sociales'),
    og_alt="A link card for the K–12 social studies course at Architecture of Grace.",
    contents_page="social-studies-course.html", contents_short="social-studies-course",
    contents_k=("The Interior — Social Studies · Every band", "El Interior — Estudios Sociales · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right. U.S. History for grades 6–8 is its own course, linked from its band.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones. Historia de EE. UU. para grados 6–8 es su propio curso, enlazado desde su banda."),
    contents_desc=lambda ch, les: "A free K–12 social studies course following the Illinois Learning Standards for Social Science: 24 units across five grade bands, %d chapters, %d numbered lessons with readings, key words, sources and data, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (ch, les),
    contents_back=('← Social Studies, the whole course', '← Estudios Sociales, el curso completo'),
    search_ph='Try “Cahokia”, “Constitution” or “tariff”',
    hub="social-studies-hub.html", hub_back=('← Social Studies, every band', '← Estudios Sociales, cada banda'),
    k_line=('The Interior — Social Studies', 'El Interior — Estudios Sociales'),
    desc_lead=lambda u: "Social Studies, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=('When it happened', 'Cuándo ocurrió'),
    foot=("Architecture of Grace · Social Studies, K–12 · original text following the Illinois Learning Standards for Social Science · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Estudios Sociales, K–12 · texto original que sigue los estándares de aprendizaje de Illinois para ciencias sociales · el banner es una escena dibujada, no una fotografía."),
    teach=('The course follows the Illinois Learning Standards for Social Science, band by band — units, chapters, sections, numbered lessons — in original text written at each band’s reading level. Every lesson has a main idea, a reading with key words you can tap, a source, a data table or a scenario to think through, and three checks. U.S. History for grades 6–8 is its own course and is linked from this band.', 'El curso sigue los estándares de aprendizaje de Illinois para ciencias sociales, banda por banda — unidades, capítulos, secciones, lecciones numeradas — en texto original al nivel de lectura de cada banda. Cada lección tiene una idea principal, una lectura con palabras clave, una fuente, una tabla de datos o un escenario, y tres comprobaciones. Historia de EE. UU. para grados 6–8 es su propio curso y está enlazado desde esta banda.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur='Social Studies · ', jump_strip='Social Studies · ',
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
