#!/usr/bin/env python3
"""
AOG-BIB-V1 — The Bible, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 24 unit JSON files in five bands →
bible-course.html and bib-u1.html … bib-u24.html.

Run from aog-deploy/:  python3 _work/bib/build_bib.py
Then:                  python3 _work/bib/inject_bib_jump.py   (the The Bible jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_bib import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("bible-course.html", "The Bible · Course contents", "")]
        opts += [("bib-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("The Bible · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="bib", page="bib-u%d.html", short="bib%d",
    unit_files=available_units(),
    builder="_work/bib/build_bib.py", src="_work/bib/u*.json",
    title="The Bible, K–12",
    h1=("The Bible", "La Biblia"),
    og_alt="A link card for the The Bible course at Architecture of Grace.",
    contents_page="bible-course.html", contents_short="bible-course",
    contents_k=("The Interior — The Bible · Every band", "El Interior — La Biblia · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the Bible as literature and history — the Old and New Testaments read from public-domain translations, described (never preached) for a public-school classroom: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← The Bible, the whole course", "← La Biblia, el curso completo"),
    search_ph="Try “covenant”, “parable” or “psalm”",
    hub="daily-drops.html?subject=bible", hub_back=("← Daily Drafts — The Bible", "← Borradores diarios — La Biblia"),
    k_line=("The Interior — The Bible", "El Interior — La Biblia"),
    desc_lead=lambda u: "The Bible, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · The Bible, K–12 · original text; the descriptive study of a sacred text in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · La Biblia · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course reads the Bible as literature and history in a public school: its stories for the youngest readers, its big story in the middle grades, its genres and its world in 6–8, and close reading and interpretation in high school — as units, chapters, sections and numbered lessons, in original text written at each band’s reading level. Beliefs are always attributed (“Christians believe…”, “Jewish tradition reads…”), the text is quoted from public-domain translations or paraphrased in plain words, and every lesson ends with three checks answerable from its reading.',
           'El curso lee la Biblia como literatura e historia en una escuela pública: sus relatos para los más pequeños, su gran historia en los grados intermedios, sus géneros y su mundo en 6–8, y la lectura atenta y la interpretación en la secundaria — en unidades, capítulos, secciones y lecciones numeradas, con texto original al nivel de lectura de cada banda. Las creencias siempre se atribuyen, el texto se cita de traducciones de dominio público o se parafrasea con palabras sencillas, y cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="The Bible · ", jump_strip="The Bible · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
