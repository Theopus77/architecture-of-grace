#!/usr/bin/env python3
"""
AOG-HEB-V1 — The Hebrew Bible, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 24 unit JSON files in five bands →
hebrew-bible-course.html and heb-u1.html … heb-u24.html.

Run from aog-deploy/:  python3 _work/heb/build_heb.py
Then:                  python3 _work/heb/inject_heb_jump.py   (the The Hebrew Bible jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_heb import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("hebrew-bible-course.html", "The Hebrew Bible · Course contents", "")]
        opts += [("heb-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("The Hebrew Bible · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="heb", page="heb-u%d.html", short="heb%d",
    unit_files=available_units(),
    builder="_work/heb/build_heb.py", src="_work/heb/u*.json",
    title="The Hebrew Bible, K–12",
    h1=("The Hebrew Bible", "La Biblia Hebrea"),
    og_alt="A link card for the The Hebrew Bible course at Architecture of Grace.",
    contents_page="hebrew-bible-course.html", contents_short="hebrew-bible-course",
    contents_k=("The Interior — The Hebrew Bible · Every band", "El Interior — La Biblia Hebrea · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the Hebrew Bible — the Tanakh: Torah, Nevi'im and Ketuvim, read from the public-domain 1917 JPS translation with the Jewish reading traditions, described for a public-school classroom: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← The Hebrew Bible, the whole course", "← La Biblia Hebrea, el curso completo"),
    search_ph="Try “Torah”, “parashah” or “midrash”",
    hub="daily-drops.html?subject=bible", hub_back=("← Daily Drafts — The Hebrew Bible", "← Borradores diarios — La Biblia Hebrea"),
    k_line=("The Interior — The Hebrew Bible", "El Interior — La Biblia Hebrea"),
    desc_lead=lambda u: "The Hebrew Bible, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · The Hebrew Bible, K–12 · original text; the descriptive study of a sacred text in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · La Biblia Hebrea · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course reads the Tanakh — Torah, Prophets and Writings — as Jewish tradition has read it and as historians and literary readers read it, in a public school: its stories for the youngest readers, the shape of the book and its big story in the middle grades, the parts and the ways of reading in 6–8, and close reading with the commentators in high school. Beliefs are attributed (“Jewish tradition teaches…”), the text is quoted from the public-domain JPS 1917 translation or paraphrased plainly, and every lesson ends with three checks answerable from its reading.',
           'El curso lee el Tanaj — Torá, Profetas y Escritos — como lo ha leído la tradición judía y como lo leen los historiadores y los lectores literarios, en una escuela pública. Las creencias se atribuyen, el texto se cita de la traducción JPS 1917 de dominio público o se parafrasea, y cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="The Hebrew Bible · ", jump_strip="The Hebrew Bible · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
