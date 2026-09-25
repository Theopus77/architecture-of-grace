#!/usr/bin/env python3
"""
AOG-ELA-V1 — English Language Arts, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 24 unit JSON files in five bands →
english-course.html and ela-u1.html … ela-u24.html.

Run from aog-deploy/:  python3 _work/ela/build_ela.py
Then:                  python3 _work/jump/inject_jump.py   (the science groups are
                       written by this builder on its own pages; the injector's
                       science block — see _work/ela/plumb_ela.py — adds them elsewhere)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_ela import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    """One block per English band optgroup: the course contents, then that band's units."""
    out = []
    for b in BANDS:
        opts = [("english-course.html", "English · Course contents", "")]
        opts += [("ela-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("English · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="ela", page="ela-u%d.html", short="ela%d",
    unit_files=available_units(),
    builder="_work/ela/build_ela.py", src="_work/ela/u*.json",
    title="English Language Arts, K–12",
    h1=('English', 'Inglés'),
    og_alt="A link card for the K–12 english course at Architecture of Grace.",
    contents_page="english-course.html", contents_short="english-course",
    contents_k=("The Interior — English · Every band", "El Interior — Inglés · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 English language arts course following the Illinois Learning Standards for ELA: 24 units across five grade bands, %d chapters, %d numbered lessons with readings, key words, model texts, checks, chapter reviews and unit tests. Original text, built for students with IEPs and English learners." % (ch, les),
    contents_back=('← English, the whole course', '← Inglés, el curso completo'),
    search_ph='Try “theme”, “comma” or “thesis”',
    hub="english-hub.html", hub_back=('← English, every band', '← Inglés, cada banda'),
    k_line=('The Interior — English', 'El Interior — Inglés'),
    desc_lead=lambda u: "English, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=('The steps', 'Los pasos'),
    foot=("Architecture of Grace · English Language Arts, K–12 · original text following the Illinois Learning Standards for ELA · every quoted text is in the public domain · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Lengua y Literatura en Inglés, K–12 · texto original que sigue los estándares de aprendizaje de Illinois para ELA · todo texto citado es de dominio público · el banner es una escena dibujada, no una fotografía."),
    teach=('The course follows the Illinois Learning Standards for English Language Arts, band by band — units, chapters, sections, numbered lessons — in original text written at each band’s reading level. Every lesson has a main idea, a reading with key words you can tap, a model text, a source or a scenario to think through, and three checks. Every quoted text is in the public domain.', 'El curso sigue los estándares de aprendizaje de Illinois para lengua y literatura en inglés, banda por banda — unidades, capítulos, secciones, lecciones numeradas — en texto original al nivel de lectura de cada banda. Cada lección tiene una idea principal, una lectura con palabras clave, un texto modelo, una fuente o un escenario, y tres comprobaciones. Todo texto citado es de dominio público.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur='English · ', jump_strip='English · ',
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
