# -*- coding: utf-8 -*-
"""AOG-PIANO-LESSONS-V1 — build the piano's lessons from piano_lessons_data.py.

  python3 _work/music/make_piano_lessons.py        (from aog-deploy/)

Writes two things, and nothing else:
  1. the lesson data in music-piano.html, between AOG-PIANO-LESSONS-DATA:BEGIN and :END
  2. piano-lessons.html, one worksheet per lesson. The page around the sheets is the drum machine's
     worksheet page (drums-lessons.html): the same worksheet engine, saving, printing and FINISHED
     station, so the three music tools behave the same.
"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import piano_lessons_data as D

TOTAL = len(D.SKILLS) + len(D.SONGS)
NSKILL = len(D.SKILLS)


def esc(t):
    return html.escape(t, quote=True)


def sp(en, es=None):
    """a bilingual span: aog-topbar.js swaps it with the site's EN/ES switch"""
    if es is None:
        en, es = en
    return '<span data-en="%s" data-es="%s">%s</span>' % (esc(en), esc(es), esc(en))


# ── music names, the same rules as music-piano.html ──────────────────────────────────────────
def flats(key, minor):
    major = (key + 3) % 12 if minor else key
    return major in (5, 10, 3, 8, 1)


def pc_name(pc, key, minor, lang):
    s = "flat" if flats(key, minor) else "sharp"
    return (D.SOLFA if lang == "es" else D.NAMES)[s][pc % 12]


def chord_name(off, q, key, minor, lang):
    return pc_name(key + off, key, minor, lang) + (D.SUF_ES if lang == "es" else D.SUF)[q]


DEG_MAJ = {0: 1, 2: 2, 4: 3, 5: 4, 7: 5, 9: 6, 11: 7}
DEG_MIN = {0: 1, 2: 2, 3: 3, 5: 4, 7: 5, 8: 6, 10: 7}


def song_chords(sg):
    if sg.get("preset"):
        return D.PRESETS[sg["preset"]][2]
    pads = D.PADS_MINOR if sg["minor"] else D.PADS_MAJOR
    return [pads[n] for n in sg["pads"]]


def song_steps(sg):
    """[(kind, extra, en, es)] in the order the learner does them"""
    n = sg["n"]
    out = []
    if sg.get("free"):
        out.append(("own8", None, "Make my own: a pattern of eight chords", "Hacer el mío: un patrón de ocho acordes"))
        out.append(("own4d", None, "Use at least four different chords", "Usa por lo menos cuatro acordes distintos"))
        out.append(("ownend", None, "End the pattern on pad 1", "Termina el patrón en el pad 1"))
        out.append(("play", None, "Press Play the chords and play the whole class song", "Pulsa Tocar los acordes y toca toda la canción de la clase"))
        out.append(("send", None, "Press Send to the turntables", "Pulsa Enviar a los platos"))
        return out
    key, minor = sg["key"], sg["minor"]
    out.append(("set", None,
                "Key %s · %s · Tempo %d" % (D.KEY_NAMES["en"][key], "Minor" if minor else "Major", sg["bpm"]),
                "Tono %s · %s · Tempo %d" % (D.KEY_NAMES["es"][key], "Menor" if minor else "Mayor", sg["bpm"])))
    out.append(("sound", None,
                "Instrument: %s. How the chords play: %s" % (D.SOUND_NAMES[sg["sound"]][0], D.RHYTHM_NAMES[sg["rhythm"]][0]),
                "Instrumento: %s. Cómo suenan los acordes: %s" % (D.SOUND_NAMES[sg["sound"]][1], D.RHYTHM_NAMES[sg["rhythm"]][1])))
    ch = song_chords(sg)
    if sg.get("preset"):
        lab = D.PRESETS[sg["preset"]][0]
        out.append(("chords", None, "Pick the pattern %s" % lab[0], "Elige el patrón %s" % lab[1]))
    else:
        names_en = ", ".join(chord_name(o, q, key, minor, "en") for o, q in ch)
        names_es = ", ".join(chord_name(o, q, key, minor, "es") for o, q in ch)
        if len(sg["pads"]) == 1:
            out.append(("chords", None,
                        "Press Clear, then Make my own and tap pad 1 once: %s. The whole song fits one chord" % names_en,
                        "Pulsa Borrar, luego Hacer el mío y toca el pad 1 una vez: %s. Toda la canción cabe en un acorde" % names_es))
        else:
            pads = " ".join(str(p) for p in sg["pads"])
            out.append(("chords", None,
                        "Press Clear, then Make my own and tap pads %s: %s" % (pads, names_en),
                        "Pulsa Borrar, luego Hacer el mío y toca los pads %s: %s" % (pads, names_es)))
    if sg.get("era"):
        out.append(("era", None, "Turn the Sound dial toward 1987: Mostly 1987 or more", "Gira el dial de Sonido hacia 1987: Casi todo 1987 o más"))
    for (txt, pcs) in sg.get("mel", []):
        en, es = txt
        out.append(("mel", pcs, "On the keys, play " + en[0].lower() + en[1:], "En las teclas, toca la " + es[0].lower() + es[1:]))
    if sg.get("mel"):
        out.append(("play", None, "Press Play the chords and sing or hum the tune", "Pulsa Tocar los acordes y canta o tararea la melodía"))
    else:
        out.append(("play", None, "Press Play the chords and listen", "Pulsa Tocar los acordes y escucha"))
    if sg.get("black"):
        out.append(("black", None, "While it plays, play ten black keys in a row, in any order", "Mientras suena, toca diez teclas negras seguidas, en cualquier orden"))
    return out


# ══ 1 · the data block inside music-piano.html ══════════════════════════════════════════════
def js_block():
    lessons, lstep = [], {}
    for L in D.SKILLS:
        lessons.append(dict(id=L["id"], en=L["t"][0], es=L["t"][1], blurb_en=L["blurb"][0], blurb_es=L["blurb"][1], steps=L["steps"]))
    for k, v in D.LSTEP.items():
        lstep[k] = {"en": v[0], "es": v[1]}
    for i, sg in enumerate(D.SONGS):
        steps = song_steps(sg)
        ids = ["s%d_%d" % (sg["n"], j + 1) for j in range(len(steps))]
        checks = []
        for (kind, extra, en, es), sid in zip(steps, ids):
            lstep[sid] = {"en": en, "es": es}
            c = {"k": kind}
            if kind == "mel":
                c["pcs"] = extra
            checks.append(c)
        song = {"n": sg["n"], "k": i + 1, "checks": checks}
        if sg.get("free"):
            song["free"] = True
        else:
            song.update(key=sg["key"], minor=sg["minor"], bpm=sg["bpm"], sound=sg["sound"], rhythm=sg["rhythm"],
                        prog=[{"off": o, "q": q} for o, q in song_chords(sg)])
            if sg.get("preset"):
                song["preset"] = sg["preset"]
            if sg.get("era"):
                song["era"] = True
        lessons.append(dict(id="s%d" % sg["n"], en=sg["t"][0], es=sg["t"][1], blurb_en=sg["blurb"][0], blurb_es=sg["blurb"][1],
                            tog_en=sg["tog"][0], tog_es=sg["tog"][1], steps=ids, song=song))
    j = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    return ("/* AOG-PIANO-LESSONS-DATA:BEGIN — made by _work/music/make_piano_lessons.py from piano_lessons_data.py. Edit there, then run it. */\n"
            "const LESSONS=" + j(lessons) + ";\n"
            "const LSTEP=" + j(lstep) + ";\n"
            "/* AOG-PIANO-LESSONS-DATA:END */")


def write_js_block():
    p = os.path.join(ROOT, "music-piano.html")
    s = open(p, encoding="utf-8").read()
    m = re.search(r"/\* AOG-PIANO-LESSONS-DATA:BEGIN.*?AOG-PIANO-LESSONS-DATA:END \*/", s, re.S)
    if not m:
        print("music-piano.html has no AOG-PIANO-LESSONS-DATA markers; the data block was not written")
        return
    s = s[:m.start()] + js_block() + s[m.end():]
    open(p, "w", encoding="utf-8").write(s)
    print("music-piano.html: lesson data written (%d lessons)" % TOTAL)


# ══ 2 · piano-lessons.html ═════════════════════════════════════════════════════════════════
KEYS_EN = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C"]
KEYS_ES = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si", "Do"]
BLACK_COLS = {1, 3, 6, 8, 10}


def inp(f, label, maxlen):
    cls = "gc nm" + ("" if maxlen <= 2 else " mid" if maxlen <= 6 else " wide" if maxlen <= 20 else " xwide")
    return '<input class="%s" type="text" maxlength="%d" data-f="%s" aria-label="%s" autocomplete="off">' % (cls, maxlen, f, esc(label))


def table(head, rows):
    """head: [(en, es) or None]; rows: [(label(en,es), [cell html])]"""
    th = "<th></th>" + "".join('<th scope="col"%s>%s</th>' % (h[1] if len(h) > 1 and isinstance(h[1], str) and h[1].startswith(" class") else "", h[0]) for h in head)
    body = "".join('<tr><th scope="row">%s</th>%s</tr>' % (sp(lab), "".join("<td>%s</td>" % c for c in cells)) for lab, cells in rows)
    return '<div class="tbl-scroll"><table class="pat"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (th, body)


def try_block(n, T, title=("Try it", "Pruébalo")):
    kind = T["kind"]
    out = ['<div class="blk tryit"><span class="lab">%s</span>' % sp(title), '    <p class="hint">%s</p>' % sp(T["hint"])]
    if kind == "notes":
        head = [(str(i), "") for i in range(1, T["n"] + 1)]
        cells = [inp("n%d" % i, "Note %d" % i, 4) for i in range(1, T["n"] + 1)]
        out.append("    " + table(head, [(("Note", "Nota"), cells)]))
    elif kind == "keys":
        head = [(sp(KEYS_EN[c], KEYS_ES[c]), ' class="bkh"' if c in BLACK_COLS else "") for c in range(13)]
        rows = []
        for r, lab in enumerate(T["rows"]):
            rows.append((lab, [inp("k%d_%d" % (r + 1, c + 1), "%s, %s" % (lab[0], KEYS_EN[c]), 1) for c in range(13)]))
        out.append("    " + table(head, rows))
    elif kind == "table":
        head = [(sp(c), "") for c in T["cols"]]
        rows = []
        for r, R in enumerate(T["rows"]):
            cells = []
            for c, cell in enumerate(R["cells"]):
                if cell[0] == "in":
                    cells.append(inp("t%d_%d" % (r + 1, c + 1), "%s, %s" % (R["label"][0], T["cols"][c][0]), cell[1]))
                else:
                    en, es = cell[1]
                    cells.append('<span class="%s">%s</span>' % ("cx" if len(en) <= 8 else "tx", sp(en, es)))
            rows.append((R["label"], cells))
        out.append("    " + table(head, rows))
    out[-1] += "</div>"
    return "\n".join(out)


def ta(n, f, rows=2):
    lines = "".join("<i></i>" for _ in range(rows))
    return ('<div class="pen"><textarea class="fld" id="fld-piano-L%d-%s" data-f="%s" rows="%d"></textarea></div>'
            '<div class="blank-lines" aria-hidden="true">%s</div>' % (n, f, f, rows, lines))


def sheet(n, head_k, title, blurb, body_top, do, kw, kw_hint, q1, q2, tryhtml, refl, links, active):
    name = "The Piano — Lesson %d · %s" % (n, title[0])
    parts = ['<section class="sheet%s" id="sh-piano-L%d" data-id="piano-L%d" data-name="%s" role="tabpanel">' % (" is-active" if active else "", n, n, esc(name)),
             '  <div class="sheet-head">',
             '    <span class="k">%s</span>' % sp(head_k),
             '    <h2>%s</h2>' % sp(title),
             '    <p class="say">%s</p>' % sp(blurb),
             '  </div>',
             '  <div class="blk who"><div class="two">',
             '    <div><label class="lab" for="fld-piano-L%d-name">%s</label><input class="fld line" id="fld-piano-L%d-name" type="text" data-f="name" autocomplete="off"></div>' % (n, sp("Name", "Nombre"), n),
             '    <div><label class="lab" for="fld-piano-L%d-date">%s</label><input class="fld line" id="fld-piano-L%d-date" type="text" data-f="date" autocomplete="off"></div>' % (n, sp("Date", "Fecha"), n),
             '  </div></div>']
    parts += body_top.get("before", [])
    parts.append('  <div class="blk"><span class="lab">%s</span>' % sp("On the piano", "En el piano"))
    parts.append('    <ol class="dosteps">%s</ol>' % "".join("<li>%s</li>" % sp(a, b) for a, b in do))
    parts.append('    <p class="hint no-print"><a href="music-piano.html#home">%s</a></p></div>' % sp("Open the piano", "Abrir el piano"))
    parts += body_top.get("after", [])
    parts.append('  <div class="blk"><span class="lab">%s</span>' % sp("Key words", "Palabras clave"))
    parts.append('    <p class="kws">%s</p>' % "".join('<span class="kw" data-en="%s" data-es="%s">%s</span>' % (esc(a), esc(b), esc(a)) for a, b in kw))
    parts.append('    <label class="hint" for="fld-piano-L%d-kw">%s</label>' % (n, sp(kw_hint)))
    parts.append('    ' + ta(n, "kw") + '</div>')
    parts.append('  <div class="blk"><label class="lab" for="fld-piano-L%d-main">%s</label>' % (n, sp("The main idea, in my own words", "La idea principal, con mis palabras")))
    parts.append('    ' + ta(n, "main") + '</div>')
    parts.append('  <div class="blk"><span class="lab">%s</span>' % sp("Short answers", "Respuestas cortas"))
    parts.append('    <div class="two">')
    for i, q in ((1, q1), (2, q2)):
        parts.append('      <div class="pane"><label class="lab" for="fld-piano-L%d-q%d">%d</label><p class="hint">%s</p>%s</div>' % (n, i, i, sp(q), ta(n, "q%d" % i, 3)))
    parts.append('    </div></div>')
    parts.append('  ' + tryhtml)
    parts.append('  <div class="blk"><label class="lab" for="fld-piano-L%d-refl">%s</label>' % (n, sp("3 · Reflection", "3 · Reflexión")))
    parts.append('    <p class="hint">%s</p>' % sp(refl))
    parts.append('    ' + ta(n, "refl") + '</div>')
    parts.append('  <div class="blk more"><span class="lab">%s</span>' % sp("More to explore", "Para explorar más"))
    parts.append('    <ul class="morelist">%s</ul></div>' % "".join('<li><a href="%s" target="_blank" rel="noopener">%s</a></li>' % (esc(u), esc(t)) for t, u in links))
    parts.append('  <div class="sheet-foot no-print">')
    parts.append('    <button class="btn btn-accent" type="button" data-print="filled">%s</button>' % sp("Print my copy", "Imprimir mi copia"))
    parts.append('    <button class="btn" type="button" data-print="blank">%s</button>' % sp("Print it blank", "Imprimir en blanco"))
    parts.append('    <button class="btn btn-danger" type="button" data-erase>%s</button>' % sp("Erase this sheet", "Borrar esta hoja"))
    parts.append('    <span class="saved" data-saved><span class="dot"></span><span data-savedtext>Saved on this computer</span></span>')
    parts.append('  </div>')
    parts.append('</section>')
    return "\n".join(parts)


def skill_sheet(i, L):
    n = i + 1
    return sheet(n, ("Lesson %d of %d" % (n, TOTAL), "Lección %d de %d" % (n, TOTAL)), L["t"], L["blurb"], {}, L["do"], L["kw"],
                 ("Pick one key word. What does it mean on the piano?", "Elige una palabra clave. ¿Qué significa en el piano?"),
                 L["q1"], L["q2"], try_block(n, L["tryit"]), L["refl"], L["links"], n == 1)


def song_sheet(i, sg):
    n, k = sg["n"], i + 1
    steps = song_steps(sg)
    do = [("On the piano, pick Lesson %d (Song %d)." % (n, k), "En el piano, elige la Lección %d (Canción %d)." % (n, k))]
    do += [(en + ".", es + ".") for (_, _, en, es) in steps]
    before, after = [], []
    if sg.get("free"):
        setline = ("Key, mood, tempo and sound: your class chooses.", "Tono, ánimo, tempo y sonido: los elige tu clase.")
    else:
        key, minor = sg["key"], sg["minor"]
        en = "Key %s · %s · Tempo %d · %s · %s" % (D.KEY_NAMES["en"][key], "Minor" if minor else "Major", sg["bpm"], D.SOUND_NAMES[sg["sound"]][0], D.RHYTHM_NAMES[sg["rhythm"]][0])
        es = "Tono %s · %s · Tempo %d · %s · %s" % (D.KEY_NAMES["es"][key], "Menor" if minor else "Mayor", sg["bpm"], D.SOUND_NAMES[sg["sound"]][1], D.RHYTHM_NAMES[sg["rhythm"]][1])
        if sg.get("era"):
            en += " · Sound dial toward 1987"
            es += " · Dial de Sonido hacia 1987"
        setline = (en, es)
    before.append('  <div class="blk"><span class="lab">%s</span>\n    <p class="setline">%s</p></div>' % (sp("Set the piano", "Prepara el piano"), sp(setline)))
    if not sg.get("free"):
        key, minor = sg["key"], sg["minor"]
        ch = song_chords(sg)
        deg = DEG_MIN if minor else DEG_MAJ
        head = [(str(b + 1), "") for b in range(len(ch))]
        rows = [(("Step", "Paso"), ['<span class="cx">%d</span>' % deg[o] for o, q in ch]),
                (("Chord", "Acorde"), ['<span class="cx">%s</span>' % sp(chord_name(o, q, key, minor, "en"), chord_name(o, q, key, minor, "es")) for o, q in ch])]
        blk = ['  <div class="blk"><span class="lab">%s</span>' % sp("The song", "La canción"),
               '    <p class="chartcap">%s</p>' % sp("The chords, one for each bar", "Los acordes, uno por compás"),
               '    ' + table(head, rows)]
        if sg.get("mel"):
            blk.append('    <p class="chartcap">%s</p>' % sp("The tune, on the keys", "La melodía, en las teclas"))
            for (txt, pcs) in sg["mel"]:
                blk.append('    <p class="setline">%s</p>' % sp(txt))
        blk[-1] += "</div>"
        after.append("\n".join(blk))
    after.append('  <div class="blk"><span class="lab">%s</span>\n    <p class="setline">%s</p></div>' % (sp("Together", "Juntos"), sp(sg["tog"])))
    # try it: copy the chords (the class song: each group writes its two chords)
    if sg.get("free"):
        T = '<div class="blk tryit"><span class="lab">%s</span>\n    <p class="hint">%s</p>\n    %s</div>' % (
            sp("Try it · write the chords", "Pruébalo · escribe los acordes"),
            sp("Each group writes its two chords here, in order: pad number and chord name.", "Cada grupo escribe aquí sus dos acordes, en orden: número de pad y nombre del acorde."),
            table([(str(b), "") for b in range(1, 9)], [(("Pad", "Pad"), [inp("p%d" % b, "Pad, bar %d" % b, 1) for b in range(1, 9)]),
                                                        (("Chord", "Acorde"), [inp("c%d" % b, "Chord, bar %d" % b, 6) for b in range(1, 9)])]))
    else:
        nb = len(song_chords(sg))
        T = '<div class="blk tryit"><span class="lab">%s</span>\n    <p class="hint">%s</p>\n    %s</div>' % (
            sp("Try it · write the chords", "Pruébalo · escribe los acordes"),
            sp("Copy the chords from the chart, from memory if you can.", "Copia los acordes de la tabla, de memoria si puedes."),
            table([(str(b), "") for b in range(1, nb + 1)], [(("Chord", "Acorde"), [inp("c%d" % b, "Chord, bar %d" % b, 6) for b in range(1, nb + 1)])]))
    return sheet(n, ("Lesson %d of %d · Songs we make · Song %d" % (n, TOTAL, k), "Lección %d de %d · Canciones que hacemos · Canción %d" % (n, TOTAL, k)),
                 sg["t"], sg["blurb"], {"before": before, "after": after}, do, sg["kw"],
                 ("Pick one key word. What does it mean in this song?", "Elige una palabra clave. ¿Qué significa en esta canción?"),
                 sg["q1"], sg["q2"], T,
                 ("One thing our class did well together on this song:", "Algo que nuestra clase hizo bien junta en esta canción:"),
                 sg["links"], False)


PIANO_CSS = """
/* AOG-PIANO-LESSONS-V1: the piano's charts — a keyboard row (black keys dark), chord names, filled cells */
table.pat th.bkh{background:#2b2f35;color:#f4f1ea}
.gc.nm{text-transform:none}
.gc.mid{width:4.4rem;min-width:4.4rem;font-size:17px}
.gc.wide{width:100%;min-width:10rem;text-align:left;padding:0 8px;font-size:16px;font-weight:600}
.gc.xwide{width:100%;min-width:16rem;text-align:left;padding:0 8px;font-size:16px;font-weight:600}
.cx{display:grid;place-items:center;min-width:3.6rem;height:40px;padding:0 6px;font-weight:800;font-size:15px;color:var(--a);white-space:nowrap}
.tx{display:block;padding:6px 10px;font-size:14.5px;line-height:1.35;color:var(--ink);min-width:12rem}
@media print{
  table.pat th.bkh{background:#000 !important;color:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .cx{color:#000;height:28px;min-width:0} .tx{color:#000;min-width:0}
}
"""


def build_page():
    src = open(os.path.join(ROOT, "drums-lessons.html"), encoding="utf-8").read()
    head, rest = src.split("</head>", 1)
    # the page head: the drum page's skin, with this page's name
    rep = [
        ("<title>Drum Machine Lessons — Architecture of Grace</title>", "<title>Piano Lessons — Architecture of Grace</title>"),
        ('content="Thirty-eight worksheets for the drum machine, one per lesson and song. Type it here or print it. Saves on this computer; turn it in to your teacher when you finish."',
         'content="Thirty-eight worksheets for the piano, one per lesson and song. Type it here or print it. Saves on this computer; turn it in to your teacher when you finish."'),
        ('href="https://architectureofgrace.com/drums-lessons"', 'href="https://architectureofgrace.com/piano-lessons"'),
        ('content="Drum Machine Lessons — Architecture of Grace"', 'content="Piano Lessons — Architecture of Grace"'),
        ('content="Thirty-eight worksheets for the drum machine, one per lesson and song."', 'content="Thirty-eight worksheets for the piano, one per lesson and song."'),
        ('content="https://architectureofgrace.com/drums-lessons"', 'content="https://architectureofgrace.com/piano-lessons"'),
    ]
    for a, b in rep:
        assert head.count(a) == 1, a
        head = head.replace(a, b)
    head = re.sub(r"<!-- AOG-DRUM-LESSONS-V1 .*?-->",
                  "<!-- AOG-PIANO-LESSONS-V1 (2026-10-03) — Jimmy: \"May I also have the same type of lessons and worksheets and pages\n"
                  "     within where it lives?\" One worksheet per piano lesson, the drum machine's worksheet page with only the\n"
                  "     content changed. Built by _work/music/make_piano_lessons.py from piano_lessons_data.py; edit there.\n"
                  "     The lesson menu on music-piano.html links here with #lN. -->", head, count=1, flags=re.S)
    i = head.rfind("</style>", 0, head.find('<script src="/aog-iep.js">'))
    head = head[:i] + PIANO_CSS + head[i:]

    body_open, after_wrap = rest.split('<div class="wrap">', 1)
    scripts = rest[rest.index("</main>"):]
    scripts = scripts[scripts.index("<script>"):]

    # the worksheet engine, for piano sheets: no drum ladder moves; letter boxes jump on only within a row
    blend = re.search(r"  /\* AOG-DRUM-BLEND-V1 \(2026-09-27\) — the ladder was rebuilt.*?\n  var sheets = ", scripts, re.S)
    assert blend, "migration block"
    scripts = scripts[:blend.start()] + "  var sheets = " + scripts[blend.end():]
    a = 'c.addEventListener("input", function(){ if(c.value.length >= 1 && cells[i+1] && (i+1) % 16 !== 0) cells[i+1].focus(); });'
    assert scripts.count(a) == 1
    scripts = scripts.replace(a, 'c.addEventListener("input", function(){ var nx = cells[i+1]; if(c.maxLength === 1 && c.value.length >= 1 && nx && nx.closest("tr") === c.closest("tr")) nx.focus(); });')
    a = '    /* the pattern grid: typing a letter jumps to the next box, so a bar is 16 taps */'
    assert scripts.count(a) == 1
    scripts = scripts.replace(a, '    /* the one-letter boxes: typing a letter jumps to the next box in the same row */')
    a = '    for(var o=5;o<=17;o++) wipe("drums-old-L"+o);   /* AOG-DRUM-BLEND-V1: the kept-aside answers too */\n'
    assert scripts.count(a) == 1
    scripts = scripts.replace(a, "")
    for a, b in [('"Erase every drum lesson sheet on this computer? This cannot be undone."', '"Erase every piano lesson sheet on this computer? This cannot be undone."'),
                 ('"drums-L1", name: s ? s.getAttribute("data-name") : "Drum Machine — Lesson 1"', '"piano-L1", name: s ? s.getAttribute("data-name") : "The Piano — Lesson 1"'),
                 ('AOG-DRUM-LESSONS-V1: seventeen sheets share one station, so CFG is read\n   from the sheet that is open (id "drums-L1" … name "Drum Machine — Lesson N · title").',
                  'AOG-PIANO-LESSONS-V1: the sheets share one station, so CFG is read\n   from the sheet that is open (id "piano-L1" … name "The Piano — Lesson N · title").')]:
        assert scripts.count(a) == 1, a
        scripts = scripts.replace(a, b)
    scripts = scripts.replace("drums-L", "piano-L").replace('"drums-lesson"', '"piano-lesson"').replace("AOG_DRUM_LESSON", "AOG_PIANO_LESSON")
    assert "drum" not in scripts.lower(), [m.start() for m in re.finditer("drum", scripts.lower())][:5]

    opts = []
    for i, L in enumerate(D.SKILLS):
        opts.append((i + 1, L["t"]))
    for i, sg in enumerate(D.SONGS):
        opts.append((sg["n"], ("Song %d: %s" % (i + 1, sg["t"][0]), "Canción %d: %s" % (i + 1, sg["t"][1]))))
    options = "\n".join('<option value="%d" data-en="%s" data-es="%s">%s</option>' % (n, esc("%d · %s" % (n, t[0])), esc("%d · %s" % (n, t[1])), esc("%d · %s" % (n, t[0]))) for n, t in opts)

    sheets = [skill_sheet(i, L) for i, L in enumerate(D.SKILLS)]
    sheets.append("<!-- the songs we make together: lessons %d–%d, one sheet per song -->" % (NSKILL + 1, TOTAL))
    sheets += [song_sheet(i, sg) for i, sg in enumerate(D.SONGS)]

    page = (head + "</head>" + body_open + '<div class="wrap">\n'
            '<header class="cmast">\n  <div>\n'
            '    <div class="k">%s</div>\n' % sp("The Piano · Lessons", "El piano · Lecciones") +
            '    <h1>%s</h1>\n' % sp("Piano Worksheets", "Hojas del piano") +
            '    <p class="cdeck">%s</p>\n' % sp("One sheet for each of the %d lessons: %d skills, then %d songs we make together. Type it here, or print it and use a pen. Both count." % (TOTAL, NSKILL, len(D.SONGS)),
                                               "Una hoja por cada una de las %d lecciones: %d destrezas y luego %d canciones que hacemos juntos. Escríbela aquí, o imprímela y usa un lápiz. Las dos valen." % (TOTAL, NSKILL, len(D.SONGS))) +
            '    <p class="hubline no-print"><a href="music-piano.html#lessons">%s</a></p>\n' % sp("← The piano, where the lessons are", "← El piano, donde están las lecciones") +
            '  </div>\n</header>\n'
            '<div class="cjump no-print"><label>%s<select id="lessonSel">\n%s\n</select></label>\n' % (sp("Which lesson?", "¿Qué lección?"), options) +
            '<div class="lnav"><button class="btn" type="button" id="lessonBack">%s</button><span class="lpos" id="lessonPos" aria-live="polite">1 / %d</span><button class="btn" type="button" id="lessonNext">%s</button></div></div>\n'
            % (sp("← Back", "← Atrás"), TOTAL, sp("Next →", "Siguiente →")) +
            '</div>\n\n<main class="sheets wrap">\n' + "\n\n".join(sheets) + "\n"
            '  <div class="lock-acts no-print" aria-label="Page controls">\n'
            '    <button class="btn btn-lock" type="button" id="eraseAll">%s</button>\n' % sp("Erase everything on this computer", "Borrar todo en esta computadora") +
            '    <button class="btn" type="button" id="themeBtn" aria-live="polite">Switch to dark</button>\n'
            '  </div>\n</main>\n\n'
            '<footer class="foot wrap no-print">\n'
            '  <p><b>Architecture of Grace · The Piano.</b> %s</p>\n' % sp("Thirty-eight lessons, thirty-eight sheets.", "Treinta y ocho lecciones, treinta y ocho hojas.") +
            '  <p>This page loads no fonts, scripts, or images from the internet and sends nothing out — it works with the network off. Your writing is stored in this browser only.</p>\n'
            '  <p class="foot-home"><a href="music-piano.html">%s</a> · <a href="/" rel="noopener">Architecture of Grace</a></p>\n' % sp("Back to the piano", "Volver al piano") +
            '</footer>\n\n' + scripts)
    open(os.path.join(ROOT, "piano-lessons.html"), "w", encoding="utf-8").write(page)
    print("piano-lessons.html: %d sheets" % TOTAL)


if __name__ == "__main__":
    assert TOTAL == 38, TOTAL
    write_js_block()
    build_page()
