#!/usr/bin/env python3
"""
AOG-HIN-V1 — Hindu Texts, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 17 unit JSON files in five bands →
hindu-texts-course.html and hin-u1.html … hin-u17.html.

Run from aog-deploy/:  python3 _work/hin/build_hin.py
Then:                  python3 _work/hin/inject_hin_jump.py   (the Hindu Texts jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_hin import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("hindu-texts-course.html", "Hindu Texts · Course contents", "")]
        opts += [("hin-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Hindu Texts · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="hin", page="hin-u%d.html", short="hin%d",
    unit_files=available_units(),
    builder="_work/hin/build_hin.py", src="_work/hin/u*.json",
    title="Hindu Texts, K–12",
    h1=("Hindu Texts", "Textos hindúes"),
    og_alt="A link card for the Hindu Texts course at Architecture of Grace.",
    contents_page="hindu-texts-course.html", contents_short="hindu-texts-course",
    contents_k=("The Interior — Hindu Texts · Every band", "El Interior — Textos hindúes · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the Hindu scriptures — the Ramayana and Mahabharata, the Bhagavad Gita, the Vedas and Upanishads, the Puranas and bhakti poets — described for a public-school classroom, with passages in public-domain translation in high school: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← Hindu Texts, the whole course", "← Textos hindúes, el curso completo"),
    search_ph="Try “dharma”, “Upanishad” or “Diwali”",
    hub="hindu-texts-hub.html", hub_back=("← Hindu Texts, every band", "← Textos hindúes, cada banda"),
    k_line=("The Interior — Hindu Texts", "El Interior — Textos hindúes"),
    desc_lead=lambda u: "Hindu Texts, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · Hindu Texts, K–12 · original text; the descriptive study of sacred and classical texts in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Textos hindúes · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course studies the Hindu scriptures in a public school: Ramayana and Krishna stories and the festivals they light for the youngest readers, what the texts are and their key teachings in the middle grades, the Vedas, Upanishads, epics and Puranas as history and genre in 6–8, and close reading of the Gita, the Upanishads and the Rig Veda in public-domain translation in high school — as units, chapters, sections and numbered lessons, in original text at each band’s reading level. Beliefs are attributed (“Hindus believe…”), passages are quoted from public-domain translations or paraphrased plainly, and every lesson ends with three checks answerable from its reading.',
           'El curso estudia las escrituras hindúes en una escuela pública: relatos del Ramayana y de Krishna para los más pequeños, qué son los textos y sus enseñanzas en los grados intermedios, los Vedas, los Upanishads, las epopeyas y los Puranas en 6–8, y lectura atenta del Gita, los Upanishads y el Rig Veda en traducción de dominio público en la secundaria. Las creencias se atribuyen, los pasajes se citan de traducciones de dominio público o se parafrasean, y cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Hindu Texts · ", jump_strip="Hindu Texts · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
