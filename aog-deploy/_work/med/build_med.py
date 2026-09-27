#!/usr/bin/env python3
"""
AOG-MED-V1 — the configuration for the shared course builder. Run from aog-deploy/:  python3 _work/med/build_med.py
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_med import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("medicine-health-course.html", "Medicine and Health · Course contents", "")]
        opts += [("med-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Medicine and Health · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="med", page="med-u%d.html", short="med%d",
    unit_files=available_units(),
    builder="_work/med/build_med.py", src="_work/med/u*.json",
    title="Medicine and Health, K–12",
    h1=("Medicine and Health", "Medicina y salud"),
    og_alt="A link card for the Medicine and Health course at Architecture of Grace.",
    contents_page="medicine-health-course.html", contents_short="medicine-health-course",
    contents_k=("The Interior — Medicine and Health · Every band", "El Interior — Medicina y salud · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on medicine and health — healthy habits, the body, and the medical traditions of the West, China and India, with what the evidence shows — for a public-school classroom: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use; not medical advice." % (ch, les),
    contents_back=("← Medicine and Health, the whole course", "← Medicina y salud, el curso completo"),
    search_ph="Try “vaccine”, “acupuncture” or “Ayurveda”",
    hub="medicine-health-hub.html", hub_back=("← Medicine and Health, every band", "← Medicina y salud, cada banda"),
    k_line=("The Interior — Medicine and Health", "El Interior — Medicina y salud"),
    desc_lead=lambda u: "Medicine and Health, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · Medicine and Health, K–12 · original text; the descriptive study of sacred and classical texts in a public school, never its practice · the banner is a drawn scene, not a photograph.",
          "Architecture of Grace · Medicina y salud · texto original; el estudio descriptivo de un texto sagrado en una escuela pública, nunca su práctica · el banner es una escena dibujada, no una fotografía."),
    teach=('The course studies health and medicine: healthy habits, germs and helpers for the youngest readers; body systems, first aid and the medical traditions of the West, China and India in the middle grades; the history of medicine from Egypt, Greece, China, India and the Islamic world to antibiotics in 6–8; how science tests a treatment, traditional medicine and the evidence, and global health in 9–10; and health systems, ethics, mental health and a capstone in 11–12. Traditions are described respectfully and the evidence is stated plainly. It is for learning, not medical advice. Every lesson ends with three checks answerable from its reading.',
           'El curso estudia la salud y la medicina: hábitos sanos, microbios y ayudantes para los más pequeños; los sistemas del cuerpo, primeros auxilios y las tradiciones médicas de Occidente, China e India en los grados intermedios; la historia de la medicina en 6–8; cómo la ciencia pone a prueba un tratamiento, la medicina tradicional y la evidencia, y la salud mundial en 9–10; y sistemas de salud, ética, salud mental y un proyecto final en 11–12. Es para aprender, no es consejo médico. Cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Medicine and Health · ", jump_strip="Medicine and Health · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
