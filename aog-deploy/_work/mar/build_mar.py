#!/usr/bin/env python3
"""
AOG-MAR-V1 — The Measured Step, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 17 unit JSON files in five bands →
martial-arts-course.html and mar-u1.html … mar-u17.html.

Run from aog-deploy/:  python3 _work/mar/build_mar.py
Then:                  python3 _work/mar/inject_mar_jump.py   (the The Measured Step jump groups on every page)
Unit JSON comes from assemble.py (history chapters + the Practice section from mar_practice.py).
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_mar import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("martial-arts-course.html", "The Measured Step · Course contents", "")]
        opts += [("mar-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("The Measured Step · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="mar", page="mar-u%d.html", short="mar%d",
    unit_files=available_units(),
    builder="_work/mar/build_mar.py", src="_work/mar/u*.json",
    title="The Measured Step, K–12",
    h1=("The Measured Step", "El paso medido"),
    og_alt="A link card for The Measured Step course at Architecture of Grace.",
    contents_page="martial-arts-course.html", contents_short="martial-arts-course",
    contents_k=("The Interior — Social Studies · The Measured Step", "El Interior — Estudios Sociales · El paso medido"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the history of the martial arts as rooms, codes and institutions — wrestling, judo, karate, taekwondo, capoeira, boxing, kung fu, Southeast Asian arts, Illinois storefront schools — for a public-school classroom: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. History is the spine; each unit ends with Practice the Moves: safe, solo basics you watch in 3D in the Dojo. Original text, free to use." % (ch, les),
    contents_back=("← The Measured Step, the whole course", "← El paso medido, el curso completo"),
    search_ph="Try “judo”, “capoeira” or “Okinawa”",
    hub="martial-arts-hub.html", hub_back=("← The Measured Step, every band", "← El paso medido, cada banda"),
    k_line=("The Interior — Social Studies · The Measured Step", "El Interior — Estudios Sociales · El paso medido"),
    desc_lead=lambda u: "The Measured Step, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · The Measured Step, K–12 · original text; the history of the martial arts, and a safe, solo practice section in every unit · the banner is a pencil drawing, not a photograph.",
          "Architecture of Grace · El paso medido · texto original; la historia de las artes marciales y una sección de práctica segura, a solas, en cada unidad · el banner es un dibujo a lápiz, no una fotografía."),
    teach=('The course teaches the history of the martial arts as rooms, codes and institutions: the mat, the jacket and belt, and a fair start for the youngest readers; wrestling, judo, Okinawa and Korea, capoeira and boxing in 3–5; China, Southeast Asia, who was allowed on the mat and Illinois schools in 6–8; claims of lineage, film, school PE, ownership and comparison in high school. The history lessons teach history, not technique, and bowing and meditation are described, never led. Each unit then ends with Practice the Moves: a safety lesson and two or three basic moves for the band, done alone and into the air, with numbered steps and a button that shows each move in 3D in the Dojo. Every lesson ends with three checks answerable from its reading.',
           'El curso enseña la historia de las artes marciales como espacios, códigos e instituciones: el tapete, la chaqueta y el cinturón, y un comienzo justo para los más pequeños; la lucha, el judo, Okinawa y Corea, la capoeira y el boxeo en 3–5; China, el Sudeste Asiático, quién podía pisar el tapete y las escuelas de Illinois en 6–8; linajes, cine, educación física, propiedad y comparación en la secundaria. Las lecciones de historia enseñan historia, no técnica. Cada unidad termina con Practica los movimientos: una lección de seguridad y dos o tres movimientos básicos para la banda, a solas y al aire, con pasos numerados y un botón que muestra cada movimiento en 3D en el Dojo. Cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="The Measured Step · ", jump_strip="The Measured Step · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
