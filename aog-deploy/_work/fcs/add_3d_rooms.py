#!/usr/bin/env python3
"""AOG-FCS-3D-V1 (2026-10-12, at the owner's request) — a calm "Watch it in 3D" block on the FACS room pages
(fc*.html, right after the Start here card) and two doors on The Kitchen & the Sewing Table (fcs-shop.html),
into the 3D Kitchen (/kitchen-lab) and the 3D Sewing Room (/sewing-lab). Adds only; changes nothing else.
Idempotent: a page that already has the block is rewritten in place with the current links.

Run from aog-deploy/:  python3 _work/fcs/add_3d_rooms.py
"""
import html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
DEPLOY = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from practice3d import k, r, s, PLUG, KITCHEN, SEWING

E = lambda t: html.escape(t, quote=True)
MARK = "AOG-FCS-3D-V1"

KSAFE = ("Safety first: clean hands, hair tied back, and a grown-up near the stove, the oven and sharp knives.",
         "Primero la seguridad: manos limpias, el pelo recogido y una persona adulta cerca de la estufa, el horno y los cuchillos.")
SSAFE = ("Safety first: pins and needles go in the pincushion, never in your mouth. Pass scissors closed, handle first.",
         "Primero la seguridad: los alfileres y las agujas van en el alfiletero, nunca en la boca. Pasa las tijeras cerradas, por el mango.")
KLEAD = ("A cook shows each step. It moves only when you start it.", "Una persona cocinera muestra cada paso. Solo se mueve cuando tú lo empiezas.")
SLEAD = ("A person shows each stitch, one step at a time. It moves only when you start it.", "Una persona muestra cada puntada, paso a paso. Solo se mueve cuando tú lo empiezas.")

# room page → (heading EN, ES), links, kitchen or sewing
ROOMS = {
 "fc1-kitchen-safety.html": (("Watch safe habits", "Mira hábitos seguros"), [k("wash-hands"), k("check-temp"), k("bake"), k("wipe-clean")], "k"),
 "fc2-knife-skills.html": (("Watch the four cuts", "Mira los cuatro cortes"), [k("chop"), k("slice"), k("dice"), k("mince")], "k"),
 "fc3-measuring-recipes.html": (("Watch measuring, then cook a recipe", "Mira cómo se mide y prepara una receta"), [k("measure-dry"), k("measure-liquid"), r("quick-bread"), PLUG], "k"),
 "fc4-hand-sewing.html": (("Watch the hand stitches", "Mira las puntadas a mano"), [s("thread-needle"), s("tie-knot"), s("running-stitch"), s("backstitch"), s("whipstitch"), s("slip-stitch"), s("blanket-stitch"), s("sew-button"), s("tie-off")], "s"),
 "fc5-sewing-machine.html": (("Watch the sewing machine", "Mira la máquina de coser"), [s("machine-parts"), s("wind-bobbin"), s("thread-machine"), s("straight-seam"), s("backstitch-machine"), s("pivot-corner"), s("seam-allowance"), s("press-seam")], "s"),
 "fc6-fabric-patterns.html": (("Watch a pattern pinned, marked and cut", "Mira cómo se prende, marca y corta un patrón"), [s("pin-pattern"), s("mark-fabric"), s("cut-fabric")], "s"),
 "fc7-cooking-methods.html": (("Watch heat at work", "Mira el calor en acción"), [k("saute"), k("boil"), k("simmer"), k("bake"), k("check-temp"), r("veggie-stir-fry")], "k"),
 "fc8-nutrition.html": (("Watch a balanced meal made", "Mira cómo se prepara una comida equilibrada"), [r("fruit-salad"), r("yogurt-parfait"), r("veggie-stir-fry"), r("tomato-pasta")], "k"),
 "fc9-food-science.html": (("Watch food science happen", "Mira la ciencia de los alimentos"), [r("scrambled-eggs"), r("quick-bread"), r("pizza-dough"), k("knead"), r("vinaigrette"), k("whisk")], "k"),
 "fc12-capstone.html": (("Rehearse your project", "Ensaya tu proyecto"), [PLUG, k("plate"), s("straight-seam"), s("press-seam")], "k"),
 "fc13-clean-hands.html": (("Watch clean hands", "Mira cómo lavarse las manos"), [k("wash-hands")], "k"),
 "fc14-hot-cold-sharp.html": (("Watch safe hands in the kitchen", "Mira manos seguras en la cocina"), [k("spread"), k("bake"), k("boil"), k("chop")], "k"),
 "fc15-everyday-sometimes.html": (("Watch a colorful snack made", "Mira cómo se prepara un bocadillo de colores"), [r("fruit-salad"), r("yogurt-parfait")], "k"),
 "fc16-job-to-the-end.html": (("Watch the clean-up", "Mira cómo se limpia"), [k("wash-dishes"), k("wipe-clean")], "k"),
 "fc17-measure-it-right.html": (("Watch measuring, then cook a recipe", "Mira cómo se mide y prepara una receta"), [k("measure-dry"), k("measure-liquid"), r("pancakes"), PLUG], "k"),
 "fc18-needle-and-button.html": (("Watch the needle and the button", "Mira la aguja y el botón"), [s("thread-needle"), s("tie-knot"), s("running-stitch"), s("backstitch"), s("sew-button"), s("tie-off")], "s"),
 "fc20-plan-cook-clean.html": (("Watch a meal from start to clean", "Mira una comida de principio a fin"), [k("wash-hands"), k("tie-hair"), r("scrambled-eggs"), k("wash-dishes"), k("wipe-clean")], "k"),
}

def sp(tag, en, es, attrs=""):
    return '<%s%s data-en="%s" data-es="%s">%s</%s>' % (tag, attrs, E(en), E(es), E(en), tag)

ROOM_CSS = ('<style id="aog-watch3d">/* %s — the "Watch it in 3D" card: the Start here card\'s look, tokens only */'
            '.watch3d{background:var(--field);border:1px solid var(--rule);border-radius:14px;padding:18px 18px 16px;margin:16px 0;box-shadow:var(--lift-sm)}'
            '.watch3d h2{margin:.1em 0 .35em}.watch3d .w3-lead{color:var(--ink-soft);max-width:60ch;margin:0 0 12px}'
            '.w3-links{display:flex;flex-wrap:wrap;gap:8px}'
            '.w3-links a{display:inline-flex;align-items:center;min-height:48px;padding:10px 16px;border-radius:12px;border:1px solid var(--rule);background:var(--field-2);color:var(--ink);font-weight:700;text-decoration:none}'
            '.w3-links a:hover{border-color:var(--ink-soft)}'
            '.watch3d .w3-safe{color:var(--ink-soft);font-size:.92rem;margin:12px 0 0}'
            '@media print{.watch3d{display:none}}</style>' % MARK)

def room_block(head, links, kind):
    lead, safe = (KLEAD, KSAFE) if kind == "k" else (SLEAD, SSAFE)
    kinds = {"s" if h.startswith(SEWING) else "k" for h, _, _ in links}
    place = {"k": ("Opens the 3D Kitchen", "Abre la cocina en 3D"), "s": ("Opens the 3D Sewing Room", "Abre el cuarto de costura en 3D")}.get(
        kinds.pop() if len(kinds) == 1 else "", ("Opens the 3D Kitchen or the 3D Sewing Room", "Abre la cocina o el cuarto de costura en 3D"))
    a = "".join('<a href="%s" data-en="%s" data-es="%s">%s</a>' % (E(h), E(en), E(es), E(en)) for h, en, es in links)
    return ('<!-- %s: Watch it in 3D -->\n'
            '  <article class="watch3d no-print" id="watch3d" aria-labelledby="watch3dH">\n'
            '    %s\n    %s\n    %s\n'
            '    <div class="w3-links" role="group" aria-label="%s" data-es-label="%s">%s</div>\n'
            '    %s\n  </article>\n<!-- /%s -->\n') % (
        MARK, sp("div", "Watch it in 3D", "Míralo en 3D", ' class="ts-k"'), sp("h2", head[0], head[1], ' id="watch3dH"'),
        sp("p", lead[0], lead[1], ' class="w3-lead"'), E(place[0]), E(place[1]), a, sp("p", safe[0], safe[1], ' class="w3-safe"'), MARK)

BLOCK_RE = re.compile(r'<!-- %s: Watch it in 3D -->.*?<!-- /%s -->\n' % (MARK, MARK), re.S)

def do_room(name, spec):
    p = os.path.join(DEPLOY, name); t = open(p, encoding="utf-8").read()
    blk = room_block(*spec)
    if BLOCK_RE.search(t):
        t = BLOCK_RE.sub(lambda m: blk, t, count=1)
    else:
        i = t.index('<article class="ground" id="ground">')
        j = t.index("\n  </article>\n", i) + len("\n  </article>\n")
        t = t[:j] + "\n  " + blk + t[j:]
    if 'id="aog-watch3d"' not in t:
        h = t.index("</head>"); t = t[:h] + ROOM_CSS + t[h:]
    open(p, "w", encoding="utf-8").write(t); print("room:", name)

# ── The Kitchen & the Sewing Table (fcs-shop.html): two doors. Its words switch with <html lang>, which its own
#    paint() sets, so both languages sit in the page and CSS shows one.
SHOP_CSS = ('<style id="aog-watch3d">/* %s — two doors into the 3D rooms; html[lang] picks the language */'
            '.w3-doors{margin:.9rem 0 0;padding:.85rem 1rem 1rem;color:var(--ink)}'
            '.w3-doors h2{margin:.1rem 0 .6rem;font-size:1.08rem;font-family:var(--display);color:var(--ink)}'
            '.w3-row{display:grid;grid-template-columns:1fr;gap:.6rem}@media (min-width:640px){.w3-row{grid-template-columns:1fr 1fr}}'
            '.w3-door{display:block;min-height:44px;padding:.8rem .9rem;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);text-decoration:none}'
            '.w3-door:hover{border-color:var(--steel)}.w3-door b{display:block;font-size:1rem;color:var(--ink)}.w3-door span.w3-d{display:block;margin-top:.15rem;color:var(--muted);font-size:.92rem}'
            'html[lang="es"] .w3-en{display:none}html:not([lang="es"]) .w3-es{display:none}'
            '@media print{.w3-doors{display:none}}</style>' % MARK)

def two(en, es, tag="span", cls=""):
    c = (" " + cls) if cls else ""
    return '<%s class="w3-en%s" lang="en">%s</%s><%s class="w3-es%s" lang="es">%s</%s>' % (tag, c, E(en), tag, tag, c, E(es), tag)

def shop_block():
    doors = [
     (KITCHEN, ("The 3D Kitchen", "La cocina en 3D"),
      ("Watch a cook make a recipe, or type in your own.", "Mira a una persona cocinar una receta, o escribe la tuya.")),
     (SEWING, ("The 3D Sewing Room", "El cuarto de costura en 3D"),
      ("Watch hand stitches, a button and the sewing machine, step by step.", "Mira puntadas a mano, un botón y la máquina de coser, paso a paso.")),
    ]
    a = "".join('<a class="w3-door" href="%s">%s%s</a>' % (h, two(t[0], t[1], "b"), two(d[0], d[1], "span", "w3-d")) for h, t, d in doors)
    return ('<!-- %s: Watch it in 3D -->\n'
            '  <section class="card w3-doors no-print" aria-label="Watch it in 3D">\n'
            '    <p class="kicker">%s</p>\n    <h2>%s</h2>\n    <div class="w3-row">%s</div>\n'
            '  </section>\n<!-- /%s -->\n') % (MARK, two("Watch it in 3D", "Míralo en 3D"),
            two("See a person do it, one step at a time", "Mira a una persona hacerlo, paso a paso"), a, MARK)

def do_shop():
    p = os.path.join(DEPLOY, "fcs-shop.html"); t = open(p, encoding="utf-8").read()
    blk = shop_block()
    if BLOCK_RE.search(t):
        t = BLOCK_RE.sub(lambda m: blk, t, count=1)
    else:
        i = t.index('<section class="lessons no-print" id="lessons"')
        j = t.index("</section>\n", i) + len("</section>\n")
        t = t[:j] + "  " + blk + t[j:]
    if 'id="aog-watch3d"' not in t:
        h = t.index("</head>"); t = t[:h] + SHOP_CSS + t[h:]
    open(p, "w", encoding="utf-8").write(t); print("shop: fcs-shop.html")

if __name__ == "__main__":
    for name, spec in ROOMS.items(): do_room(name, spec)
    do_shop()
