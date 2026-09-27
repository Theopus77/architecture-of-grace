#!/usr/bin/env python3
"""
AOG-WCS-V1 — the configuration for the shared course builder. Run from aog-deploy/:  python3 _work/wcs/build_wcs.py
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_wcs import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("world-cultures-course.html", "World Cultures · Course contents", "")]
        opts += [("wcs-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("World Cultures · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="wcs", page="wcs-u%d.html", short="wcs%d",
    unit_files=available_units(),
    builder="_work/wcs/build_wcs.py", src="_work/wcs/u*.json",
    title="World Cultures and Societies, K–12",
    h1=("World Cultures and Societies", "Culturas y sociedades del mundo"),
    og_alt="A link card for the World Cultures course at Architecture of Grace.",
    contents_page="world-cultures-course.html", contents_short="world-cultures-course",
    contents_k=("The Interior — World Cultures · Every band", "El Interior — Culturas del mundo · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on world cultures and societies — families and customs, social class through history in Europe, Asia and the Americas, and political ideas from left to right, extremes included — described fairly for a public-school classroom: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← World Cultures, the whole course", "← Culturas del mundo, el curso completo"),
    search_ph="Try “feudalism”, “caste” or “fascism”",
    hub="world-cultures-hub.html", hub_back=("← World Cultures, every band", "← Culturas del mundo, cada banda"),
    k_line=("The Interior — World Cultures", "El Interior — Culturas del mundo"),
    desc_lead=lambda u: "World Cultures, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · World Cultures, K–12 · original text; the descriptive study of sacred and classical texts in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Culturas del mundo · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course studies how people live together around the world: families, customs and fairness for the youngest readers; the continents, rich and poor and kinds of government in the middle grades; social class through history in Europe, Asia and the Americas in 6–8; the political spectrum from left to right, extremes included, in 9–10; and comparison, propaganda and a capstone in 11–12. Every ideology is described with what its supporters and its critics say, and the course never tells a student which side to take. Every lesson ends with three checks answerable from its reading.',
           'El curso estudia cómo vive la gente en el mundo: familias, costumbres y justicia para los más pequeños; continentes, ricos y pobres y formas de gobierno en los grados intermedios; las clases sociales en la historia de Europa, Asia y América en 6–8; el espectro político de izquierda a derecha, con sus extremos, en 9–10; y comparación, propaganda y un proyecto final en 11–12. Cada ideología se describe con lo que dicen sus partidarios y sus críticos. Cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="World Cultures · ", jump_strip="World Cultures · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
