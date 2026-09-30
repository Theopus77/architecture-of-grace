#!/usr/bin/env python3
"""
AOG-SPT-V1 — Sports History, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 17 unit JSON files in five bands →
sports-course.html and spt-u1.html … spt-u17.html.

Run from aog-deploy/:  python3 _work/spt/build_spt.py
Then:                  python3 _work/spt/inject_spt_jump.py   (the Sports History jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_spt import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("sports-course.html", "Sports History · Course contents", "")]
        opts += [("spt-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Sports History · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="spt", page="spt-u%d.html", short="spt%d",
    unit_files=available_units(),
    builder="_work/spt/build_spt.py", src="_work/spt/u*.json",
    title="Sports History, K–12",
    h1=("Sports History", "Historia del deporte"),
    og_alt="A link card for the Sports History course at Architecture of Grace.",
    contents_page="sports-course.html", contents_short="sports-course",
    contents_k=("The Interior — Social Studies · Sports History", "El Interior — Estudios Sociales · Historia del deporte"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the history of sports as institutions — fields, rules, leagues, schools, who was let in and who was kept out, Illinois and the IHSA — for a public-school classroom: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. History only; no technique is taught. Original text, free to use." % (ch, les),
    contents_back=("← Sports History, the whole course", "← Historia del deporte, el curso completo"),
    search_ph="Try “IHSA”, “Title IX” or “Naismith”",
    hub="sports-hub.html", hub_back=("← Sports History, every band", "← Historia del deporte, cada banda"),
    k_line=("The Interior — Social Studies · Sports History", "El Interior — Estudios Sociales · Historia del deporte"),
    desc_lead=lambda u: "Sports History, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · Sports History, K–12 · original text; the history of games as institutions, never a playbook · the banner is a pencil drawing, not a photograph.",
          "Architecture of Grace · Historia del deporte · texto original; la historia de los juegos como instituciones, nunca un manual de jugadas · el banner es un dibujo a lápiz, no una fotografía."),
    teach=('The course teaches the history of sports as institutions: kinds of play, fields and fair turns for the youngest readers; how baseball, basketball, football, soccer, track, swimming and tennis got their lines and rules in 3–5; who was written out, the Olympics, Title IX, disability sport and Illinois rooms in 6–8; college sport, media, records, protest, leagues and eligibility in high school. It is history, not PE: no play, drill or technique is taught. Every lesson ends with three checks answerable from its reading.',
           'El curso enseña la historia del deporte como institución: juegos, campos y turnos justos para los más pequeños; cómo el béisbol, el baloncesto, el fútbol americano, el fútbol, el atletismo, la natación y el tenis recibieron sus líneas y reglas en 3–5; quién quedó fuera, los Juegos Olímpicos, el Título IX, el deporte adaptado e Illinois en 6–8; el deporte universitario, los medios, los récords, la protesta, las ligas y la elegibilidad en la secundaria. Es historia, no educación física. Cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Sports History · ", jump_strip="Sports History · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
