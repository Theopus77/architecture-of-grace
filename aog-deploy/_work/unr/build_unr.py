#!/usr/bin/env python3
"""
AOG-UNR-V1 — The Unseen Realm, K–12. The configuration for the shared course builder
(_work/course/build_course.py): 17 unit JSON files in five bands →
unseen-realm-course.html and unr-u1.html … unr-u17.html.

Run from aog-deploy/:  python3 _work/unr/build_unr.py
Then:                  python3 _work/unr/inject_unr_jump.py   (the The Unseen Realm jump groups on every page)
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "course"))
from outline import UNITS, BANDS, LINKS
try:
    from banners_unr import CREDITS, banner
except Exception:
    CREDITS, banner = {}, None
import build_course

IND = "&nbsp;&nbsp;&nbsp;&nbsp;"
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_TITLE = {b["id"]: b["title"] for b in BANDS}

def jump_groups():
    out = []
    for b in BANDS:
        opts = [("unseen-realm-course.html", "The Unseen Realm · Course contents", "")]
        opts += [("unr-u%d.html" % u["n"], "Unit %d · %s" % (u["n"], u["title"]), IND) for u in UNITS if u["band"] == b["id"]]
        out.append(("The Unseen Realm · %s" % b["title"], opts))
    return out

def available_units():
    return [HERE / ("u%d.json" % u["n"]) for u in UNITS if (HERE / ("u%d.json" % u["n"])).exists()]

COURSE = dict(
    id="unr", page="unr-u%d.html", short="unr%d",
    unit_files=available_units(),
    builder="_work/unr/build_unr.py", src="_work/unr/u*.json",
    title="The Unseen Realm, K–12",
    h1=("The Unseen Realm", "El reino invisible"),
    og_alt="A link card for The Unseen Realm course at Architecture of Grace.",
    contents_page="unseen-realm-course.html", contents_short="unseen-realm-course",
    contents_k=("The Interior — The Unseen Realm · Every band", "El Interior — El reino invisible · Cada banda"),
    contents_deck=("The whole course on one page, band by band: every unit with its chapters, sections and numbered lessons. Tap a lesson to open it. A tick means you got all three checks right.",
                   "Todo el curso en una página, banda por banda: cada unidad con sus capítulos, secciones y lecciones numeradas. Toca una lección para abrirla. Una marca significa que acertaste las tres comprobaciones."),
    contents_desc=lambda ch, les: "A free K–12 course on the work of Bible scholar Michael S. Heiser — the divine council, Enoch and the Watchers, the giants, the gods of the nations, angels, demons and what his book Reversing Hermon calls the forgotten mission of Jesus — studied from his books and the ancient texts he read: %d chapters, %d numbered lessons with readings, key words, sources, checks, chapter reviews and unit tests. Heiser's ideas are described, with other readings beside them. Original text, free to use." % (ch, les),
    contents_back=("← The Unseen Realm, the whole course", "← El reino invisible, el curso completo"),
    search_ph="Try “Watchers”, “Hermon” or “divine council”",
    hub="unseen-realm-hub.html", hub_back=("← The Unseen Realm, every band", "← El reino invisible, cada banda"),
    k_line=("The Interior — The Unseen Realm", "El Interior — El reino invisible"),
    desc_lead=lambda u: "The Unseen Realm, %s" % BAND_TITLE.get(u.get("band"), "K–12").lower(),
    tl_label=("When it happened", "Cuándo ocurrió"),
    foot=("Architecture of Grace · The Unseen Realm, K–12 · original text; a study of Michael Heiser's reading of the Bible, with other readings beside it · the banner is a pencil drawing, not a photograph.",
          "Architecture of Grace · El reino invisible · texto original; un estudio de cómo Michael Heiser leía la Biblia, con otras lecturas al lado · el banner es un dibujo a lápiz, no una fotografía."),
    teach=('The course studies the work of Michael S. Heiser (1963–2023), a scholar of the Hebrew Bible, on what he called the Bible’s unseen realm: God’s heavenly family, Eden, Noah and Babel told gently for the youngest readers; the divine council, the three rebellions, angels and the Angel of the LORD in 3–5; 1 Enoch and the Watchers, the giant clans, Deuteronomy 32 and the Dead Sea Scrolls, the satan and demons in 6–8; Reversing Hermon, Enoch in the New Testament and angels up close in 9–10; his method, his critics, the end of the story and his legacy in 11–12. Heiser’s ideas are described in our own words, never taught as true or false, with other readings beside them; passages are quoted from public-domain translations; every lesson ends with three checks answerable from its reading.',
           'El curso estudia la obra de Michael S. Heiser (1963–2023), estudioso de la Biblia hebrea, sobre lo que llamó el reino invisible de la Biblia: la familia celestial de Dios, el Edén, Noé y Babel contados con calma para los más pequeños; el concilio divino, las tres rebeliones y los ángeles en 3–5; 1 Enoc y los Vigilantes, los gigantes, Deuteronomio 32 y los Rollos del Mar Muerto en 6–8; Revertir el Hermón, Enoc en el Nuevo Testamento y los ángeles en 9–10; su método, sus críticos y su legado en 11–12. Las ideas de Heiser se describen, nunca se enseñan como verdaderas o falsas, con otras lecturas al lado. Cada lección termina con tres comprobaciones.'),
    bands=[dict(id=b["id"], title=b["title"], es=BAND_ES[b["id"]]) for b in BANDS],
    band_title=lambda b: BAND_TITLE[b],
    jump_groups=jump_groups(),
    jump_cur="The Unseen Realm · ", jump_strip="The Unseen Realm · ",
    links=LINKS, credits=CREDITS, banner=banner,
)

if __name__ == "__main__":
    print("units available:", len(COURSE["unit_files"]))
    build_course.build(COURSE)
