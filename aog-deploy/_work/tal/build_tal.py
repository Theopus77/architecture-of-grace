#!/usr/bin/env python3
"""
AOG-TAL-V1 — Talmud Study, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 24 unit JSON files in five bands →
talmud-course.html and tal-u1.html … tal-u24.html.

Run from aog-deploy/:  python3 _work/tal/build_tal.py
Then:                  python3 _work/tal/inject_tal_jump.py   (the Talmud Study jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_tal import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("talmud-course.html", "Talmud Study · Course contents", "")]
        opts += [("tal-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Talmud Study · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="tal", page="tal-u%d.html", short="tal%d",
    unit_files=available_units(),
    builder="_work/tal/build_tal.py", src="_work/tal/u*.json",
    title="Talmud Study, K–12",
    h1=("Talmud Study", "Estudio del Talmud"),
    og_alt="A link card for the Talmud Study course at Architecture of Grace.",
    contents_page="talmud-course.html", contents_short="talmud-course",
    contents_k=("The Interior — Talmud Study · Every band", "El Interior — Estudio del Talmud · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the Talmud — Mishnah and Gemara, how a page is read, argument and mercy, famous passages in paraphrase and, in high school, real passages in public-domain translation, described for a public-school classroom: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← Talmud Study, the whole course", "← Estudio del Talmud, el curso completo"),
    search_ph="Try “Mishnah”, “sugya” or “chavruta”",
    hub="talmud-hub.html", hub_back=("← Talmud Study, every band", "← Estudio del Talmud, cada banda"),
    k_line=("The Interior — Talmud Study", "El Interior — Estudio del Talmud"),
    desc_lead=lambda u: "Talmud Study, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · Talmud Study, K–12 · original text; the descriptive study of a sacred text in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Estudio del Talmud · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course studies the Talmud in a public school: its rabbis and their stories for the youngest readers, how the Mishnah and Gemara came to be in the middle grades, how a page is read and how an argument moves in 6–8, and real passages read in public-domain translation in high school — as units, chapters, sections and numbered lessons, in original text at each band’s reading level. Beliefs are attributed (“rabbinic tradition holds…”), passages are quoted from public-domain translations or paraphrased plainly, and every lesson ends with three checks answerable from its reading.',
           'El curso estudia el Talmud en una escuela pública: sus rabinos y sus relatos para los más pequeños, cómo nacieron la Mishná y la Guemará en los grados intermedios, cómo se lee una página y cómo avanza un argumento en 6–8, y pasajes reales en traducción de dominio público en la secundaria. Las creencias se atribuyen, los pasajes se citan de traducciones de dominio público o se parafrasean, y cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Talmud Study · ", jump_strip="Talmud Study · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
