#!/usr/bin/env python3
"""
AOG-BUD-V1 — Buddhist Texts, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 17 unit JSON files in five bands →
buddhist-texts-course.html and bud-u1.html … bud-u17.html.

Run from aog-deploy/:  python3 _work/bud/build_bud.py
Then:                  python3 _work/bud/inject_bud_jump.py   (the Buddhist Texts jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_bud import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("buddhist-texts-course.html", "Buddhist Texts · Course contents", "")]
        opts += [("bud-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Buddhist Texts · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="bud", page="bud-u%d.html", short="bud%d",
    unit_files=available_units(),
    builder="_work/bud/build_bud.py", src="_work/bud/u*.json",
    title="Buddhist Texts, K–12",
    h1=("Buddhist Texts", "Textos budistas"),
    og_alt="A link card for the Buddhist Texts course at Architecture of Grace.",
    contents_page="buddhist-texts-course.html", contents_short="buddhist-texts-course",
    contents_k=("The Interior — Buddhist Texts · Every band", "El Interior — Textos budistas · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the Buddhist scriptures — the Buddha's life as the texts tell it, the Jataka tales, the Three Baskets, the Dhammapada, the suttas and the Mahayana sutras — described for a public-school classroom, with passages in public-domain translation in high school: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← Buddhist Texts, the whole course", "← Textos budistas, el curso completo"),
    search_ph="Try “Dhammapada”, “Jataka” or “Vesak”",
    hub="buddhist-texts-hub.html", hub_back=("← Buddhist Texts, every band", "← Textos budistas, cada banda"),
    k_line=("The Interior — Buddhist Texts", "El Interior — Textos budistas"),
    desc_lead=lambda u: "Buddhist Texts, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · Buddhist Texts, K–12 · original text; the descriptive study of sacred and classical texts in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Textos budistas · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course studies the Buddhist scriptures in a public school: the Buddha’s story and the Jataka tales for the youngest readers, the Three Baskets, the key teachings and the festivals in the middle grades, history, schools and genres in 6–8, and close reading of the suttas, the Dhammapada and the Jatakas in public-domain translation in high school — as units, chapters, sections and numbered lessons, in original text at each band’s reading level. Beliefs are attributed (“Buddhists believe…”), meditation is described and never led, passages are quoted from public-domain translations or paraphrased plainly, and every lesson ends with three checks answerable from its reading.',
           'El curso estudia las escrituras budistas en una escuela pública: la historia del Buda y los cuentos Jataka para los más pequeños, las Tres Canastas, las enseñanzas y las fiestas en los grados intermedios, la historia, las escuelas y los géneros en 6–8, y lectura atenta de los suttas, el Dhammapada y los Jatakas en traducción de dominio público en la secundaria. Las creencias se atribuyen, la meditación se describe y nunca se dirige, y cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Buddhist Texts · ", jump_strip="Buddhist Texts · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
