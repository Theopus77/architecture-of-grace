#!/usr/bin/env python3
"""
AOG-SKT-V1 — Skateboarding: History, Tricks and the Science of Balance, K–12 and Adult. The configuration for the
shared course builder (_work/course/build_course.py): 18 unit JSON files in six bands (K–2 … 11–12 and Adult) →
skateboarding-course.html and skt-u1.html … skt-u18.html.

Run from aog-deploy/:  python3 _work/skt/build_skt.py
Then:                  python3 _work/skt/inject_skt_jump.py   (the Skateboarding jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_skt import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12", "adult": "Adultos"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("skateboarding-course.html", "Skateboarding · Course contents", "")]
        opts += [("skt-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Skateboarding · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="skt", page="skt-u%d.html", short="skt%d",
    unit_files=available_units(),
    builder="_work/skt/build_skt.py", src="_work/skt/u*.json",
    title="Skateboarding, K–12 and Adult",
    h1=("Skateboarding", "Skateboarding"),
    og_alt="A link card for the Skateboarding course at Architecture of Grace.",
    contents_page="skateboarding-course.html", contents_short="skateboarding-course",
    contents_k=("The Interior — Skateboarding · Every band", "El Interior — Skateboarding · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free course on skateboarding for grades K–12 and adults: its history from sidewalk surfing to the Olympics, how to do tricks and grinds step by step with safety first, and the science of balance, friction, energy, torque and spin: %d chapters, %d numbered lessons with readings, key words, worked examples, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← Skateboarding, the whole course", "← Skateboarding, el curso completo"),
    search_ph="Try “ollie”, “friction” or “Patti McGee”",
    hub="skateboarding-hub.html", hub_back=("← Skateboarding, every band", "← Skateboarding, cada banda"),
    k_line=("The Interior — Skateboarding", "El Interior — Skateboarding"),
    desc_lead=lambda u: "Skateboarding, %s" % (BAND_TITLE.get(u.get("band"), "K–12").lower() if u.get("band") != "adult" else "for adults"),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · Skateboarding, K–12 and Adult · original text; history, how-to with safety first, and the science underneath · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Skateboarding · texto original; historia, cómo se hace con la seguridad primero, y la ciencia debajo · el banner es una escena dibujada, no una fotografía."),
    teach=('The course teaches skateboarding three ways at every level: its history (sidewalk surfing, the urethane wheel, pools and parks, the ollie, the street and video era, the X Games and the Olympics, and the people who opened its doors), how to skate (stance, pushing, stopping, kickturns, manuals, dropping in, the ollie, flip tricks, grinds and slides, taught step by step with a helmet, pads and a safe place first), and the science underneath (forces, friction, energy, levers and torque, center of mass, turning and rotation, with worked examples from grade 6 up). K–2 through 11–12 and an Adult band. Every lesson ends with three checks answerable from its reading. Practise the physics in the Skate Lab (/skate).',
           'El curso enseña el skate de tres maneras en cada nivel: su historia (el surf en la acera, la rueda de uretano, piscinas y parques, el ollie, la era de la calle y los videos, los X Games y los Juegos Olímpicos, y quienes abrieron sus puertas), cómo patinar (postura, empujar, frenar, kickturns, manuals, entrar a la rampa, el ollie, flips, grinds y slides, paso a paso con casco, protecciones y un lugar seguro primero) y la ciencia de fondo (fuerzas, fricción, energía, palancas y torque, centro de masa, giros y rotación, con ejemplos resueltos desde 6.º). De K–2 a 11–12 y una banda para adultos. Cada lección termina con tres comprobaciones. Practica la física en el Laboratorio de Skate (/skate).'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Skateboarding · ", jump_strip="Skateboarding · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
