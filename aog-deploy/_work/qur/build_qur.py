#!/usr/bin/env python3
"""
AOG-QUR-V1 — The Qur’an, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 24 unit JSON files in five bands →
quran-course.html and qur-u1.html … qur-u24.html.

Run from aog-deploy/:  python3 _work/qur/build_qur.py
Then:                  python3 _work/qur/inject_qur_jump.py   (the The Qur’an jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_qur import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("quran-course.html", "The Qur’an · Course contents", "")]
        opts += [("qur-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("The Qur’an · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="qur", page="qur-u%d.html", short="qur%d",
    unit_files=available_units(),
    builder="_work/qur/build_qur.py", src="_work/qur/u*.json",
    title="The Qur’an, K–12",
    h1=("The Qur’an", "El Corán"),
    og_alt="A link card for the The Qur’an course at Architecture of Grace.",
    contents_page="quran-course.html", contents_short="quran-course",
    contents_k=("The Interior — The Qur’an · Every band", "El Interior — El Corán · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the Qur'an — its structure, surahs, themes and recitation tradition, with the Prophet's life as context, read from public-domain translations and described (“Muslims believe…”) for a public-school classroom: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← The Qur’an, the whole course", "← El Corán, el curso completo"),
    search_ph="Try “surah”, “tajwid” or “tafsir”",
    hub="daily-drops.html?subject=quran", hub_back=("← Daily Drafts — The Qur’an", "← Borradores diarios — El Corán"),
    k_line=("The Interior — The Qur’an", "El Interior — El Corán"),
    desc_lead=lambda u: "The Qur’an, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · The Qur’an, K–12 · original text; the descriptive study of a sacred text in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · El Corán · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course studies the Qur’an in a public school: what the book is and the stories it tells for the youngest readers, its shape and the Prophet’s life as context in the middle grades, its structure, themes and recitation tradition in 6–8, and close reading of surahs with the commentators in high school — as units, chapters, sections and numbered lessons, in original text at each band’s reading level. Beliefs are always attributed (“Muslims believe…”), verses are quoted from public-domain translations or paraphrased plainly, and every lesson ends with three checks answerable from its reading.',
           'El curso estudia el Corán en una escuela pública: qué es el libro y sus relatos para los más pequeños, su forma y la vida del Profeta como contexto en los grados intermedios, su estructura, temas y tradición de recitación en 6–8, y la lectura atenta de las suras con los comentaristas en la secundaria. Las creencias siempre se atribuyen (“los musulmanes creen…”), los versículos se citan de traducciones de dominio público o se parafrasean, y cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="The Qur’an · ", jump_strip="The Qur’an · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
