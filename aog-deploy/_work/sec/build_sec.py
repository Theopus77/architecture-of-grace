#!/usr/bin/env python3
"""
AOG-SEC-V1 — Secret Societies, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 17 unit JSON files in five bands →
secret-societies-course.html and sec-u1.html … sec-u17.html.

Run from aog-deploy/:  python3 _work/sec/build_sec.py
Then:                  python3 _work/sec/inject_sec_jump.py   (the Secret Societies jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_sec import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("secret-societies-course.html", "Secret Societies · Course contents", "")]
        opts += [("sec-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("Secret Societies · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="sec", page="sec-u%d.html", short="sec%d",
    unit_files=available_units(),
    builder="_work/sec/build_sec.py", src="_work/sec/u*.json",
    title="Secret Societies, K–12",
    h1=("Secret Societies", "Sociedades secretas"),
    og_alt="A link card for the Secret Societies course at Architecture of Grace.",
    contents_page="secret-societies-course.html", contents_short="secret-societies-course",
    contents_k=("The Interior — Social Studies · Secret Societies", "El Interior — Estudios Sociales · Sociedades secretas"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on secret societies from the record: clubs, codes and safe secrets; ancient mystery rites, the Knights Templar and the Freemasons; lodges and initiation societies around the world; the real Illuminati; the Klan and the Mafia and the people who fought them; forgeries, real government secrets and how to test a claim. %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Original text, free to use." % (ch, les),
    contents_back=("← Secret Societies, the whole course", "← Sociedades secretas, el curso completo"),
    search_ph="Try “Templars”, “cipher” or “Illuminati”",
    hub="secret-societies-hub.html", hub_back=("← Secret Societies, every band", "← Sociedades secretas, cada banda"),
    k_line=("The Interior — Social Studies · Secret Societies", "El Interior — Estudios Sociales · Sociedades secretas"),
    desc_lead=lambda u: "Secret Societies, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · Secret Societies, K–12 · original text; history from the record, with legends named as legends · the banner is a pencil drawing, not a photograph.",
          "Architecture of Grace · Sociedades secretas · texto original; historia según los documentos, y las leyendas se llaman leyendas · el banner es un dibujo a lápiz, no una fotografía."),
    teach=('The course studies secret societies from the record. The youngest readers learn about clubs, codes and symbols, and which secrets are safe to keep and which must be told to a trusted grown-up. Grades 3–5 meet ancient mystery rites, the Knights Templar, American lodges and codebreaking. Grades 6–8 study Freemasonry, initiation societies around the world, America\'s fear of secret groups, and the Black Hand in Chicago. High school studies the real Illuminati and the legend after it, the Klan and the people who fought it, the Mafia on trial, forgeries, real government secrets, and Bill Cooper. Students sort each claim as documented, disputed or shown false. Crime and hate groups are taught only in grades 6–12, with victims and resisters at the center. Every lesson ends with three checks answerable from its reading.',
           'El curso estudia las sociedades secretas según los documentos. Los más pequeños aprenden sobre clubes, códigos y símbolos, y qué secretos se pueden guardar y cuáles hay que contar a un adulto de confianza. En 3–5: ritos antiguos, los templarios, las logias de Estados Unidos y los códigos. En 6–8: la masonería, sociedades de iniciación del mundo, el miedo a los grupos secretos y la Mano Negra en Chicago. En la secundaria: los Illuminati reales y la leyenda posterior, el Klan y quienes lo combatieron, la Mafia ante la justicia, las falsificaciones, los secretos reales de gobierno y Bill Cooper. Los estudiantes clasifican cada afirmación: documentada, discutida o falsa. Los grupos criminales y de odio se estudian solo en 6–12. Cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="Secret Societies · ", jump_strip="Secret Societies · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
