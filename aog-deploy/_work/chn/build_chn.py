#!/usr/bin/env python3
"""
AOG-CHN-V1 — Chinese Classics, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 17 unit JSON files in five bands →
chinese-classics-course.html and chn-u1.html … chn-u17.html.

Run from aog-deploy/:  python3 _work/chn/build_chn.py
Then:                  python3 _work/chn/inject_chn_jump.py   (the Chinese Classics jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_chn import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("chinese-classics-course.html", "Chinese Classics · Course contents", "")]
        opts += [("chn-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Chinese Classics · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="chn", page="chn-u%d.html", short="chn%d",
    unit_files=available_units(),
    builder="_work/chn/build_chn.py", src="_work/chn/u*.json",
    title="Chinese Classics, K–12",
    h1=("Chinese Classics", "Clásicos chinos"),
    og_alt="A link card for the Chinese Classics course at Architecture of Grace.",
    contents_page="chinese-classics-course.html", contents_short="chinese-classics-course",
    contents_k=("The Interior — Chinese Classics · Every band", "El Interior — Clásicos chinos · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the Chinese classics — the Analects of Confucius and the Daodejing, with Mencius and the Zhuangzi, read as philosophy and ethics — described for a public-school classroom, with passages in public-domain translation in high school: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← Chinese Classics, the whole course", "← Clásicos chinos, el curso completo"),
    search_ph="Try “ren”, “wu wei” or “Mencius”",
    hub="chinese-classics-hub.html", hub_back=("← Chinese Classics, every band", "← Clásicos chinos, cada banda"),
    k_line=("The Interior — Chinese Classics", "El Interior — Clásicos chinos"),
    desc_lead=lambda u: "Chinese Classics, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · Chinese Classics, K–12 · original text; the descriptive study of sacred and classical texts in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Clásicos chinos · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course studies the Analects and the Daodejing, with Mencius and the Zhuangzi, as philosophy and ethics in a public school: stories of Confucius, Laozi and Zhuangzi for the youngest readers, what the classics are and their key teachings in the middle grades, the Hundred Schools and the canon’s history in 6–8, and close reading in public-domain translation in high school — as units, chapters, sections and numbered lessons, in original text at each band’s reading level. Teachings and beliefs are attributed (“Confucius taught…”, “Daoists practice…”), passages are quoted from public-domain translations or paraphrased plainly, and every lesson ends with three checks answerable from its reading.',
           'El curso estudia las Analectas y el Daodejing, con Mencio y el Zhuangzi, como filosofía y ética en una escuela pública: relatos de Confucio, Laozi y Zhuangzi para los más pequeños, qué son los clásicos y sus enseñanzas en los grados intermedios, las Cien Escuelas y la historia del canon en 6–8, y lectura atenta en traducción de dominio público en la secundaria. Las enseñanzas y creencias se atribuyen, y cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Chinese Classics · ", jump_strip="Chinese Classics · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
