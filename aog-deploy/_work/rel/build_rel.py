#!/usr/bin/env python3
"""
AOG-REL-V1 — World Religions, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 24 unit JSON files in five bands →
religions-course.html and rel-u1.html … rel-u24.html.

Run from aog-deploy/:  python3 _work/rel/build_rel.py
Then:                  python3 _work/rel/inject_rel_jump.py   (the World Religions jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_rel import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("religions-course.html", "World Religions · Course contents", "")]
        opts += [("rel-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("World Religions · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="rel", page="rel-u%d.html", short="rel%d",
    unit_files=available_units(),
    builder="_work/rel/build_rel.py", src="_work/rel/u*.json",
    title="World Religions, K–12",
    h1=("World Religions", "Religiones del Mundo"),
    og_alt="A link card for the World Religions course at Architecture of Grace.",
    contents_page="religions-course.html", contents_short="religions-course",
    contents_k=("The Interior — World Religions · Every band", "El Interior — Religiones del Mundo · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 World Religions course — the academic, comparative study of religion for a public-school classroom: 24 units across five grade bands, %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← World Religions, the whole course", "← Religiones del Mundo, el curso completo"),
    search_ph="Try “covenant”, “dharma” or “pillar”",
    hub="religions-hub.html", hub_back=("← World Religions, every band", "← Religiones del Mundo, cada banda"),
    k_line=("The Interior — World Religions", "El Interior — Religiones del Mundo"),
    desc_lead=lambda u: "World Religions, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · World Religions, K–12 · original text following an academic, comparative sequence for the study of religion in a public school · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Religiones del Mundo · texto original que sigue una secuencia académica y comparativa del estudio de las religiones · el banner es una escena dibujada, no una fotografía."),
    teach=('The course is the academic study of religion, not the practice of it: how to read a sacred text, then the major traditions through their own texts, then the questions they share — as units, chapters, sections and numbered lessons, in original text written at each band’s reading level. Beliefs are always attributed (“Muslims believe…”, “the Torah teaches…”), traditions are never ranked, and every lesson ends with three checks answerable from its reading.',
           'El curso es el estudio académico de la religión, no su práctica: cómo leer un texto sagrado, luego las grandes tradiciones a través de sus propios textos, y después las preguntas que comparten — en unidades, capítulos, secciones y lecciones numeradas, con texto original al nivel de lectura de cada banda. Las creencias siempre se atribuyen (“los musulmanes creen…”, “la Torá enseña…”), ninguna tradición se clasifica por encima de otra, y cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="World Religions · ", jump_strip="World Religions · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
