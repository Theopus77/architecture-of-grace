# -*- coding: utf-8 -*-
"""AOG-LESSONS-V1 (2026-10-05) — the music labs' lessons and worksheets, from one lesson file per lab.

Jimmy: "make sure all music labs have lessons galore". Each lab that had no lessons gets a lesson file here,
_work/music/lessons_<lab>.py, with one dict LAB:

  LAB = {
    "lab": "pads",                                   # the file names: aog-lessons-pads.js, and the sheet below
    "key": "aog.pads.lessons.v1",                    # where the ticks are kept on the device
    "page": "/beat-lab", "sheet": "beat-lab-lessons.html",
    "name": ("The Beat Lab", "El laboratorio de ritmos"),
    "steps": {"play1": ("Press ▶ Play", "Pulsa ▶ Tocar"), ...},
    "lessons": [{"id": "b1", "t": (en, es), "b": (en, es), "steps": [...], "try": (en, es),
                 "q": (en, es),            # Think about it (the worksheet)
                 "own": (en, es),          # Your turn (the worksheet)
                 "song": True}, ...]       # a song to make, after the skills
  }

This writes, for each lab file given (or every lessons_*.py):
  · aog-deploy/aog-lessons-<lab>.js — window.AOG_LESSON_DATA for aog-lessons.js (the card on the lab itself)
  · aog-deploy/<sheet> — one printable worksheet per lesson, English and Spanish

  python3 _work/music/make_lab_lessons.py                    (from aog-deploy/; every lab)
  python3 _work/music/make_lab_lessons.py lessons_pads.py    (one lab)
"""
import glob, html, importlib.util, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))


def esc(t):
    return html.escape(t, quote=True)


def sp(pair):
    en, es = pair
    return '<span data-en="%s" data-es="%s">%s</span>' % (esc(en), esc(es), esc(en))


def load(path):
    spec = importlib.util.spec_from_file_location("lab", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.LAB


def check(L):
    ids = set(L["steps"])
    seen = set()
    for i, m in enumerate(L["lessons"]):
        assert m["id"] not in seen, "two lessons with the id " + m["id"]
        seen.add(m["id"])
        for s in m["steps"]:
            assert s in ids, "%s: lesson %d uses a step that is not in steps: %s" % (L["lab"], i + 1, s)
        for k in ("t", "b"):
            assert len(m[k]) == 2 and all(m[k]), "%s: lesson %d needs %s in English and Spanish" % (L["lab"], i + 1, k)
    songs = [m.get("song", False) for m in L["lessons"]]
    assert songs == sorted(songs), L["lab"] + ": the songs come after the skills"


def data_js(L):
    d = {"key": L["key"], "sheet": L["sheet"],
         "steps": {k: list(v) for k, v in L["steps"].items()},
         "lessons": []}
    for m in L["lessons"]:
        x = {"id": m["id"], "en": m["t"][0], "es": m["t"][1], "ben": m["b"][0], "bes": m["b"][1], "steps": m["steps"]}
        if m.get("try"):
            x["ten"], x["tes"] = m["try"]
        if m.get("song"):
            x["song"] = True
        d["lessons"].append(x)
    return ("/* AOG-LESSONS-V1 — %s: the lessons for aog-lessons.js. MADE BY _work/music/make_lab_lessons.py FROM "
            "_work/music/lessons_%s.py: edit there, then run it. */\nwindow.AOG_LESSON_DATA=%s;\n"
            % (L["name"][0], L["lab"], json.dumps(d, ensure_ascii=False, separators=(",", ":"))))


SHEET_CSS = """
.ws { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:1rem 1.1rem 1.1rem; margin:0 0 1.2rem;
  break-inside:avoid; page-break-inside:avoid; }
.ws h2 { margin:0 0 .2rem; }
.ws .kind { margin:0; font:800 .72rem/1.2 var(--sans); letter-spacing:.12em; text-transform:uppercase; color:var(--steel); }
.ws .blurb { margin:.1rem 0 .6rem; }
.ws ol { list-style:none; margin:0 0 .6rem; padding:0; display:grid; gap:.4rem; }
.ws li { display:grid; grid-template-columns:auto 1fr; gap:.6rem; align-items:start; }
.ws .box { width:1.3rem; height:1.3rem; border:2px solid var(--ink); border-radius:4px; margin-top:.1rem; }
.ws .try { margin:.4rem 0 .6rem; padding:.45rem .7rem; border-left:4px solid var(--play); background:var(--chip); border-radius:0 8px 8px 0;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.ws h3 { margin:.7rem 0 .2rem; font-size:1rem; }
.ws .line { border-bottom:1.5px solid var(--line); height:1.9rem; }
.toc { columns:2 14rem; margin:0 0 1.6rem; padding-left:1.2rem; }
.toc a { color:var(--ink); }
@media print { .ws { border-color:#bbb; } .toc { display:none; } }
"""

LANG_JS = """<script>
/* AOG-LESSONS-V1 — the page follows the site's EN/ES switch (aog-topbar.js swaps every [data-en]) */
</script>"""


def sheet_html(L):
    src = open(os.path.join(ROOT, "drums-guide.html"), encoding="utf-8").read()
    head = src.split("</head>", 1)[0]
    name_en, name_es = L["name"]
    rep = [("<title>The Drum Machine &mdash; Picture Guide</title>", "<title>%s &mdash; Lessons and worksheets</title>" % esc(name_en)),
           ('<meta name="description" content="The drum machine in pictures. Almost no reading. Print it and keep it next to the machine.">',
            '<meta name="description" content="%s">' % esc("Every lesson for %s, one worksheet each: what to do, a question to think about, and your turn. Print it or use it on screen." % name_en))]
    for a, b in rep:
        assert head.count(a) == 1, a
        head = head.replace(a, b)
    head = re.sub(r"<!-- AOG-DRUMPIC-V1 .*?-->",
                  "<!-- AOG-LESSONS-V1 (2026-10-05) — %s: one worksheet per lesson, English and Spanish. MADE BY\n"
                  "     _work/music/make_lab_lessons.py FROM _work/music/lessons_%s.py: edit there, then run it. -->" % (esc(name_en), L["lab"]),
                  head, count=1, flags=re.S)
    i = head.rfind("</style>")
    head = head[:i] + SHEET_CSS + head[i:]
    les = L["lessons"]
    skills = [m for m in les if not m.get("song")]
    out = ['<div class="wrap">', "", "<header>", '  <a class="brand" href="/">Architecture of Grace</a>', '  <div class="tools">',
           '    <a class="btn" href="%s">%s</a>' % (esc(L["page"]), sp(("← " + name_en, "← " + name_es))),
           '    <button class="btn go" type="button" onclick="window.print()">%s</button>' % sp(("Print this", "Imprimir")),
           "  </div>", "</header>", "",
           "<h1>%s</h1>" % sp(("%s · lessons" % name_en, "%s · lecciones" % name_es)),
           '<p class="lede">%s</p>' % sp(("%d lessons, then %d songs to make. Do the steps on the lab: they tick themselves there. This page is for writing and printing."
                                         % (len(skills), len(les) - len(skills)),
                                         "%d lecciones y luego %d canciones para hacer. Haz los pasos en el laboratorio: allí se marcan solos. Esta página es para escribir e imprimir."
                                         % (len(skills), len(les) - len(skills)))),
           '<ol class="toc noprint">']
    for i, m in enumerate(les):
        out.append('  <li><a href="#l%d">%s</a></li>' % (i + 1, sp(m["t"])))
    out.append("</ol>")
    for i, m in enumerate(les):
        kind = ("A song to make", "Una canción para hacer") if m.get("song") else ("Skill", "Habilidad")
        out.append('<section class="ws" id="l%d">' % (i + 1))
        out.append('  <p class="kind">%s · %s</p>' % (sp(("Lesson %d" % (i + 1), "Lección %d" % (i + 1))), sp(kind)))
        out.append('  <h2>%s</h2>' % sp(m["t"]))
        out.append('  <p class="blurb">%s</p>' % sp(m["b"]))
        out.append("  <ol>")
        for s in m["steps"]:
            out.append('    <li><span class="box" aria-hidden="true"></span><span>%s</span></li>' % sp(L["steps"][s]))
        out.append("  </ol>")
        if m.get("try"):
            out.append('  <p class="try"><b>%s</b> %s</p>' % (sp(("Try this:", "Prueba esto:")), sp(m["try"])))
        if m.get("q"):
            out.append('  <h3>%s</h3><p>%s</p><div class="line"></div><div class="line"></div>' % (sp(("Think about it", "Piénsalo")), sp(m["q"])))
        if m.get("own"):
            out.append('  <h3>%s</h3><p>%s</p><div class="line"></div><div class="line"></div>' % (sp(("Your turn", "Tu turno")), sp(m["own"])))
        out.append("</section>")
    out.append("<footer>%s</footer>" % sp(("%s · Architecture of Grace · your progress stays on this device" % name_en,
                                           "%s · Architecture of Grace · tu progreso se queda en este dispositivo" % name_es)))
    out.append("</div>")
    return head + "</head>\n<body>\n<script src=\"/aog-grace.js\" defer></script>\n" + "\n".join(out) + "\n<script src=\"/aog-topbar.js\"></script>\n</body>\n</html>\n"


def build(path):
    L = load(path)
    check(L)
    js = os.path.join(ROOT, "aog-lessons-%s.js" % L["lab"])
    open(js, "w", encoding="utf-8").write(data_js(L))
    open(os.path.join(ROOT, L["sheet"]), "w", encoding="utf-8").write(sheet_html(L))
    print("%s: %d lessons, %d steps → %s, %s" % (L["lab"], len(L["lessons"]), len(L["steps"]), os.path.basename(js), L["sheet"]))


if __name__ == "__main__":
    files = [os.path.join(HERE, a) if not os.path.isabs(a) else a for a in sys.argv[1:]] or sorted(glob.glob(os.path.join(HERE, "lessons_*.py")))
    for f in files:
        build(f)
