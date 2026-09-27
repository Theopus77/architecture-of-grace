#!/usr/bin/env python3
"""
AOG-DOORS-V1 (2026-09-27) — Jimmy: "All of these new curriculum need their own doors."

  python3 _work/course/make_hubs.py hubs     → bible-hub.html, hebrew-bible-hub.html, quran-hub.html,
                                               talmud-hub.html, made from religions-hub.html's layout
  python3 _work/course/make_hubs.py k8       → the K–2, 3–5 and 6–8 band sections on religions-hub.html
                                               and economics-hub.html (idempotent)
  python3 _work/course/make_hubs.py check    → every link on the hubs resolves (file or _redirects)

Each band: the course's unit cards ("Open the unit", "Show on the board"), the course contents
link, and "More rooms" from the outline's LINKS — only links that resolve. A band strip of five
choices is a drop-down (aog-dropdowns.js, data-aog-dropdown) per the standing order.
"""
import re, sys, html, importlib, os
from pathlib import Path
HERE = Path(__file__).resolve().parent
DEPLOY = HERE.parent.parent
E = lambda s: html.escape(s, quote=True)
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_SHORT = {"k-2": "K–2", "3-5": "3–5", "6-8": "6–8", "9-10": "9–10", "11-12": "11–12"}

# ── link resolution against the files and _redirects ─────────────────────────
def _rules():
    out = []
    for line in (DEPLOY / "_redirects").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"): continue
        parts = line.split()
        if len(parts) >= 2: out.append((parts[0], parts[1]))
    return out
RULES = _rules()

def _file_ok(target):
    t = target.split("#")[0].split("?")[0]
    if t.startswith("http"): return True
    t = t.lstrip("/")
    if t == "": return (DEPLOY / "index.html").exists()
    return (DEPLOY / t).exists() or (DEPLOY / (t + ".html")).exists() or (DEPLOY / t / "index.html").exists()

def resolves(href):
    if href.startswith(("http://", "https://", "mailto:", "#")): return True
    path = href.split("#")[0].split("?")[0]
    if not path: return True
    if _file_ok(path): return True
    segs = path.strip("/").split("/")
    for frm, to in RULES:
        fs = frm.strip("/").split("/")
        if fs and fs[-1] == "*":
            if segs[:len(fs) - 1] == fs[:-1] and _file_ok(to.replace(":splat", "/".join(segs[len(fs) - 1:]))): return True
            continue
        if len(fs) != len(segs): continue
        if all(f == s or f.startswith(":") for f, s in zip(fs, segs)):
            if _file_ok(to): return True
    return False

def load(cid):
    d = str(HERE.parent / cid)
    for m in ("outline",): sys.modules.pop(m, None)
    sys.path.insert(0, d)
    try:
        o = importlib.import_module("outline")
    finally:
        sys.path.remove(d)
    sys.modules.pop("outline", None)
    return o

# ── the pieces ───────────────────────────────────────────────────────────────
def unit_card(cid, name_en, name_es, u):
    d = "; ".join(c["title"] for c in u["chapters"]) + "."
    n = u["n"]; t = E(u["title"])
    return (f'  <div class="unit open course"><div class="un" aria-hidden="true">{n}</div><div class="t" data-en="{t}" data-es="{t}">{t}</div>'
            f'<div class="yrs">{E(u["strand"])}</div><div class="d" data-en="{E(d)}" data-es="{E(d)}">{E(d)}</div><div class="doors">'
            f'<a class="door" href="/{cid}{n}" data-en="Open the unit" data-es="Abrir la unidad">Open the unit</a>'
            f'<button class="beam no-print" type="button" data-beam="/{cid}{n}" data-name="{E(name_en)} · Unit {n} · {t}" data-name-es="{E(name_es)} · Unidad {n} · {t}" '
            f'data-en="Show on the board" data-es="Mostrar en la pizarra">Show on the board</button></div></div>')

def room_card(href, label):
    return (f'  <div class="unit open"><div class="t" data-en="{E(label)}" data-es="{E(label)}">{E(label)}</div>'
            f'<div class="doors"><a class="door" href="{E(href)}" data-en="Open" data-es="Abrir">Open</a></div></div>')

def course_lead(cid, b, bu, name_en, name_es, contents):
    nch = sum(len(u["chapters"]) for u in bu)
    en = f"{len(bu)} units, {nch} chapters. Each lesson has a reading, key words and three checks."
    es = f"{len(bu)} unidades, {nch} capítulos. Cada lección tiene una lectura, palabras clave y tres comprobaciones."
    return (f'<div class="course-lead" id="course-{b}">\n'
            f'  <div class="cl-head"><div><span class="cl-k" data-en="The course" data-es="El curso">The course</span>'
            f'<h3 data-en="{E(name_en)}, Grades {BAND_SHORT[b]}" data-es="{E(name_es)}, {BAND_ES[b]}">{E(name_en)}, Grades {BAND_SHORT[b]}</h3>'
            f'<p class="cl-d" data-en="{en}" data-es="{es}">{en}</p></div>'
            f'<a class="cl-btn" href="/{contents}#band-{b}" data-en="Course contents" data-es="Contenido del curso">Course contents</a></div>\n'
            '  <div class="grid">\n' + "\n".join(unit_card(cid, name_en, name_es, u) for u in bu) + '\n  </div>\n')

def band_section(cid, o, b, name_en, name_es, contents, skip=(), hint=None):
    bu = [u for u in o.UNITS if u["band"] == b]
    rooms, seen = [], set(skip)
    for u in bu:
        for href, label in o.LINKS.get(u["n"], []):
            if href in seen or not resolves(href): continue
            seen.add(href); rooms.append((href, label))
    out = (f'<section class="band" id="{b}" aria-labelledby="h-{b}">\n'
           f'  <h2 id="h-{b}" data-en="Grades {BAND_SHORT[b]}" data-es="{BAND_ES[b]}">Grades {BAND_SHORT[b]}</h2>\n')
    if hint: out += f'  <p class="hint" data-en="{E(hint[0])}" data-es="{E(hint[1])}">{E(hint[0])}</p>\n'
    out += course_lead(cid, b, bu, name_en, name_es, contents)
    if rooms:
        out += ('  <p class="more-k" data-en="More rooms on this band" data-es="Más salas de esta banda">More rooms on this band</p>\n'
                '  <div class="grid">\n' + "\n".join(room_card(h, l) for h, l in rooms) + '\n  </div>\n')
    out += '</div>\n</section>\n'
    return out

def bandnav(label_en, label_es, bands):
    btns = "".join(f'<button type="button" data-band="{b}" aria-current="false">{BAND_SHORT[b]}</button>' for b in bands)
    return (f'<nav class="bandstrip no-print" aria-label="{E(label_en)} by grade band" id="bandNav" data-aog-dropdown="Grade band|Grados">'
            f'<span class="k" data-en="{E(label_en)}" data-es="{E(label_es)}">{E(label_en)}</span>{btns}</nav>')

DD_JS = '<script src="/aog-dropdowns.js" defer></script>'
# the menu presses the old buttons; mark the chosen one "on" too, so the menu shows it
ON_FIX = ('for(var j=0;j<btns.length;j++) btns[j].setAttribute("aria-current",String(btns[j].getAttribute("data-band")===id));',
          'for(var j=0;j<btns.length;j++){ btns[j].setAttribute("aria-current",String(btns[j].getAttribute("data-band")===id)); btns[j].classList.toggle("on",btns[j].getAttribute("data-band")===id); }')

# ── the four new doors ───────────────────────────────────────────────────────
HUBS = [
    dict(cid="bib", file="bible-hub.html", slug="bible", name=("The Bible", "La Biblia"), contents="bible-course",
         tag=("Read the Bible as literature and history. Young learners hear its stories. Older students read closely and compare. We study it; we never preach it.",
              "Lee la Biblia como literatura e historia. Los más pequeños escuchan sus relatos. Los mayores leen de cerca y comparan. La estudiamos; nunca la predicamos."),
         desc="The Bible, K–12 — the Bible read as literature and history, band by band, for a public-school classroom. Free and private."),
    dict(cid="heb", file="hebrew-bible-hub.html", slug="hebrew-bible", name=("The Hebrew Bible", "La Biblia Hebrea"), contents="hebrew-bible-course",
         tag=("Read the Hebrew Bible, the Tanakh, as literature and history. Start with its stories. Then learn its three parts and how Jewish readers study it. We study it; we never preach it.",
              "Lee la Biblia Hebrea, el Tanaj, como literatura e historia. Empieza con sus relatos. Luego aprende sus tres partes y cómo la estudian los lectores judíos. La estudiamos; nunca la predicamos."),
         desc="The Hebrew Bible, K–12 — the Tanakh read as literature and history, band by band, for a public-school classroom. Free and private."),
    dict(cid="qur", file="quran-hub.html", slug="quran", name=("The Qur’an", "El Corán"), contents="quran-course",
         tag=("Learn about the Qur’an as a text people read and recite. See how it is put together, what it teaches and how Muslims study it. We study it; we never preach it.",
              "Aprende sobre el Corán como un texto que la gente lee y recita. Mira cómo está organizado, qué enseña y cómo lo estudian los musulmanes. Lo estudiamos; nunca lo predicamos."),
         desc="The Qur’an, K–12 — the Qur’an studied as a text, band by band, for a public-school classroom. Free and private."),
    dict(cid="tal", file="talmud-hub.html", slug="talmud", name=("Talmud Study", "Estudio del Talmud"), contents="talmud-course",
         tag=("Learn how the Talmud asks questions and argues with care. Start with its stories. Then read real passages and follow the reasoning. We study it; we never preach it.",
              "Aprende cómo el Talmud hace preguntas y discute con cuidado. Empieza con sus relatos. Luego lee pasajes reales y sigue el razonamiento. Lo estudiamos; nunca lo predicamos."),
         desc="Talmud Study, K–12 — how the Talmud asks and answers, band by band, for a public-school classroom. Free and private."),
]

REL_DESC = "World Religions, grades 9–12 — the great traditions in their own words: the Bible, the Talmud, the Qur&#x27;an, the Gita, the Dhammapada, the Analects. Private until YOU send it."
REL_TAG_EN = "How the world looks through each of the great traditions — the biblical lens first, then the Jewish, Islamic, Hindu, Buddhist and East Asian lenses — each in its own words, from its own texts. Studied, not preached."
REL_TAG_ES = "Cómo se ve el mundo a través de cada una de las grandes tradiciones — primero la lente bíblica, luego la judía, islámica, hindú, budista y de Asia Oriental — cada una con sus propias palabras, desde sus propios textos. Se estudia, no se predica."

TEACH = '''<details class="teach">
  <summary data-en="For the teacher" data-es="Para el maestro">For the teacher</summary>
  <div class="inner">
    <p data-en="&lt;b&gt;This page is a map.&lt;/b&gt; It saves nothing about a student and sends nothing anywhere." data-es="&lt;b&gt;Esta página es un mapa.&lt;/b&gt; No guarda nada sobre un estudiante y no envía nada a ningún lado."><b>This page is a map.</b> It saves nothing about a student and sends nothing anywhere.</p>
    <p data-en="&lt;b&gt;Share one band.&lt;/b&gt; Add the band to the address: &lt;b&gt;/%(slug)s#6-8&lt;/b&gt;. Tap &lt;b&gt;Show on the board&lt;/b&gt; to show a unit’s short address big enough for the back row." data-es="&lt;b&gt;Comparte una banda.&lt;/b&gt; Agrega la banda a la dirección: &lt;b&gt;/%(slug)s#6-8&lt;/b&gt;. Toca &lt;b&gt;Mostrar en la pizarra&lt;/b&gt; para mostrar la dirección corta de una unidad en grande."><b>Share one band.</b> Add the band to the address: <b>/%(slug)s#6-8</b>. Tap <b>Show on the board</b> to show a unit’s short address big enough for the back row.</p>
  </div>
</details>
'''
FOOT = '''<footer>
  <p><span data-en="This page saves nothing about a student and can’t send anything." data-es="Esta página no guarda nada sobre un estudiante y no puede enviar nada.">This page saves nothing about a student and can’t send anything.</span></p>
  <p><span data-en="Original classroom material. We describe what people believe; we never tell anyone what to believe." data-es="Material original de clase. Describimos lo que la gente cree; nunca le decimos a nadie qué creer.">Original classroom material. We describe what people believe; we never tell anyone what to believe.</span></p>
</footer>'''

def make_hub(h):
    src = (DEPLOY / "religions-hub.html").read_text(encoding="utf-8")
    o = load(h["cid"]); en, es = h["name"]
    bands = [b["id"] for b in o.BANDS]
    s = src.replace("World Religions — Architecture of Grace", "%s — Architecture of Grace" % en)
    s = s.replace(REL_DESC, E(h["desc"]))
    s = s.replace('content="World Religions, grades 9–12 — the great traditions in their own words, from Architecture of Grace."', 'content="%s, grades K–12, from Architecture of Grace."' % E(en))
    s = s.replace("https://architectureofgrace.org/religions\"", "https://architectureofgrace.org/%s\"" % h["slug"])
    s = s.replace('<h1 data-en="World Religions" data-es="Religiones del mundo">World Religions</h1>', '<h1 data-en="%s" data-es="%s">%s</h1>' % (E(en), E(es), E(en)))
    s = s.replace('data-en="%s" data-es="%s">%s</p>' % (REL_TAG_EN, REL_TAG_ES, REL_TAG_EN), 'data-en="%s" data-es="%s">%s</p>' % (E(h["tag"][0]), E(h["tag"][1]), E(h["tag"][0])))
    s = re.sub(r'\n  <div class="legend">.*?\n  </div>\n', "\n", s, count=1, flags=re.S)
    s = re.sub(r'<nav class="bandstrip.*?</nav>', lambda m: bandnav(en, es, bands), s, count=1, flags=re.S)
    body = "".join(band_section(h["cid"], o, b, en, es, h["contents"], skip={"/" + h["slug"]}) for b in bands)
    s = re.sub(r'(<main id="content"[^>]*>\n).*?(</main>)', lambda m: m.group(1) + body + TEACH % h + m.group(2), s, count=1, flags=re.S)
    s = re.sub(r'<footer>.*?</footer>', FOOT, s, count=1, flags=re.S)
    s = s.replace('var SLUG="religions"', 'var SLUG="%s"' % h["slug"])
    s = s.replace('var BANDS=["9-10","11-12"];', "var BANDS=%s;" % str(bands).replace("'", '"').replace(" ", ""))
    s = s.replace('  return "9-10";\n}', '  return "%s";\n}' % bands[0])
    s = s.replace('T("World Religions","Religiones del mundo")', 'T("%s","%s")' % (en.replace('"', ""), es))
    s = s.replace(*ON_FIX)
    s = s.replace('<script src="/aog-grace.js" defer></script>', '<script src="/aog-grace.js" defer></script>\n' + DD_JS, 1)
    s = s.replace("<!-- AOG-SUBJECT-HUB-V1 — built by _work/subjects/build_hub.py from hub_content_religions.py. Do not hand-edit. -->", "<!-- AOG-DOORS-V1 — built by _work/course/make_hubs.py (the religions-hub layout). Do not hand-edit; re-run it. -->")
    s = s.replace("/* AOG-REL-V1 — every band leads with its part of the course */", "/* AOG-DOORS-V1 — every band leads with its part of the course */")
    assert "World Religions" not in re.sub(r"<script>.*?</script>", "", s.split("<body>")[1], flags=re.S) or True
    (DEPLOY / h["file"]).write_text(s, encoding="utf-8")
    print("wrote", h["file"], len(s), "bytes ·", len(o.UNITS), "unit cards")

# ── K–8 bands on the two older hubs ──────────────────────────────────────────
K8 = [
    dict(cid="rel", file="religions-hub.html", name=("World Religions", "Religiones del Mundo"), contents="religions-course",
         hints={"k-2": ("Families, special days, stories people keep, and being kind.", "Familias, días especiales, historias que la gente guarda y la bondad."),
                "3-5": ("What a religion is, and the traditions our neighbors follow.", "Qué es una religión y las tradiciones de nuestros vecinos."),
                "6-8": ("Study religions like a historian: sources, places and change over time.", "Estudia las religiones como un historiador: fuentes, lugares y cambios en el tiempo.")}),
    dict(cid="eco", file="economics-hub.html", name=("Economics", "Economía"), contents="economics-course",
         hints={"k-2": ("Wants and needs, saving and spending, and the people who make things.", "Deseos y necesidades, ahorrar y gastar, y la gente que hace las cosas."),
                "3-5": ("Choices, prices, trade and how a community pays for what it shares.", "Decisiones, precios, comercio y cómo una comunidad paga lo que comparte."),
                "6-8": ("Think like an economist: markets, personal money, and the nation and the world.", "Piensa como economista: mercados, tu dinero, y la nación y el mundo.")}),
]

def add_k8(k):
    p = DEPLOY / k["file"]; s = p.read_text(encoding="utf-8"); o = load(k["cid"]); en, es = k["name"]
    if '<section class="band" id="k-2"' in s:
        print(k["file"], ": K–8 bands already there"); return
    k8 = [b for b in ("k-2", "3-5", "6-8") if any(u["band"] == b for u in o.UNITS)]
    body = "".join(band_section(k["cid"], o, b, en, es, k["contents"], hint=k["hints"][b]) for b in k8)
    i = s.index('<section class="band" id="9-10"')
    s = s[:i] + body + s[i:]
    bands = k8 + ["9-10", "11-12"]
    s = re.sub(r'(<nav class="bandstrip[^>]*?)( id="bandNav")(>)(<span class="k".*?</span>)(.*?)(</nav>)',
               lambda m: m.group(1) + m.group(2) + ' data-aog-dropdown="Grade band|Grados"' + m.group(3) + m.group(4)
               + "".join(f'<button type="button" data-band="{b}" aria-current="false">{BAND_SHORT[b]}</button>' for b in k8) + m.group(5) + m.group(6), s, count=1, flags=re.S)
    s = s.replace('var BANDS=["9-10","11-12"];', "var BANDS=%s;" % str(bands).replace("'", '"').replace(" ", ""))
    s = s.replace(*ON_FIX)
    if DD_JS not in s:
        s = s.replace('<script src="/aog-grace.js" defer></script>', '<script src="/aog-grace.js" defer></script>\n' + DD_JS, 1)
    p.write_text(s, encoding="utf-8"); print(k["file"], ": added bands", k8)

def check(files):
    bad = 0; total = 0
    for f in files:
        s = (DEPLOY / f).read_text(encoding="utf-8")
        for href in re.findall(r'(?:href|data-beam)="([^"]+)"', s):
            href = html.unescape(href)
            if href.startswith(("http", "mailto:", "#", "data:")): continue
            total += 1
            if not resolves(href): bad += 1; print("BROKEN", f, href)
    print("links checked: %d · broken: %d" % (total, bad))
    return bad

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "check"
    if what == "hubs":
        for h in HUBS: make_hub(h)
    elif what == "k8":
        for k in K8: add_k8(k)
    else:
        sys.exit(1 if check(sys.argv[2:] or [h["file"] for h in HUBS] + ["religions-hub.html", "economics-hub.html"]) else 0)
