#!/usr/bin/env python3
"""
AOG-SS-V1 · site plumbing for the Social Studies course. Idempotent.
  · social-studies-hub.html — every band leads with its part of the course (unit
    cards), every existing card stays below under "More rooms"
  · _redirects — /social-studies-course and /ssc1 … /ssc24
  · sw.js — CACHE bump + the course pages precached
  · sitemap.xml — the 25 pages
Run from aog-deploy/:  python3 _work/ss/plumb_ss.py
"""
import re, html, datetime, sys, os
from pathlib import Path
HERE = Path(__file__).resolve().parent
DEPLOY = HERE.parent.parent
sys.path.insert(0, str(HERE))
from outline import UNITS, BANDS
E = lambda s: html.escape(s, quote=True)
TODAY = datetime.date.today().isoformat()
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
EN, ES = "Social Studies", "Estudios Sociales"

def desc_of(u):
    return "; ".join(c["title"] for c in u["chapters"]) + "."

def hub():
    p = DEPLOY / "social-studies-hub.html"; s = p.read_text(encoding="utf-8")
    if 'id="ss-k-2"' in s:
        print("hub: already has the course blocks"); return
    for b in BANDS:
        bu = [u for u in UNITS if u["band"] == b["id"]]
        cards = []
        for u in bu:
            d = desc_of(u)
            cards.append(f'  <div class="unit open course"><div class="un" aria-hidden="true">{u["n"]}</div><div class="t" data-en="{E(u["title"])}" data-es="{E(u["title"])}">{E(u["title"])}</div><div class="yrs">{E(u["strand"])}</div><div class="d" data-en="{E(d)}" data-es="{E(d)}">{E(d)}</div><div class="doors"><a class="door" href="/ssc{u["n"]}" data-en="Open the unit" data-es="Abrir la unidad">Open the unit</a><button class="beam no-print" type="button" data-beam="/ssc{u["n"]}" data-name="{EN} · Unit {u["n"]} · {E(u["title"])}" data-name-es="{ES} · Unidad {u["n"]} · {E(u["title"])}" data-en="Show on the board" data-es="Mostrar en la pizarra">Show on the board</button></div></div>')
        nch = sum(len(u["chapters"]) for u in bu)
        lead = (f'<div class="course-lead" id="ss-{b["id"]}">\n'
                f'  <div class="cl-head"><div><span class="cl-k" data-en="The course" data-es="El curso">The course</span>'
                f'<h3 data-en="{EN}, {E(b["title"])}" data-es="{ES}, {E(BAND_ES[b["id"]])}">{EN}, {E(b["title"])}</h3>'
                f'<p class="cl-d" data-en="{len(bu)} units, {nch} chapters, numbered lessons — each with a reading, key words, a source or the numbers, and three checks. Chapter reviews, unit tests, a word match and a writing task." data-es="{len(bu)} unidades, {nch} capítulos, lecciones numeradas — cada una con una lectura, palabras clave, una fuente o los números, y tres comprobaciones. Repasos por capítulo, exámenes de unidad, un juego de palabras y una tarea de escritura.">{len(bu)} units, {nch} chapters, numbered lessons — each with a reading, key words, a source or the numbers, and three checks. Chapter reviews, unit tests, a word match and a writing task.</p></div>'
                f'<a class="cl-btn" href="/social-studies-course#band-{b["id"]}" data-en="Course contents" data-es="Contenido del curso">Course contents</a></div>\n'
                '  <div class="grid">\n' + "\n".join(cards) + '\n  </div>\n'
                '  <p class="more-k" data-en="More rooms on this band" data-es="Más salas de esta banda">More rooms on this band</p>\n'
                '</div>\n')
        anchor = re.search(r'(<section class="band" id="%s"[^>]*>.*?<p class="count"[^>]*>[^<]*</p>\n)' % re.escape(b["id"]), s, re.S)
        if not anchor:
            anchor = re.search(r'(<section class="band" id="%s"[^>]*>.*?</h2>\n(?:\s*<p class="hint"[^>]*>.*?</p>\n)?)' % re.escape(b["id"]), s, re.S)
        assert anchor, "band %s not found" % b["id"]
        s = s[:anchor.end()] + lead + s[anchor.end():]
    css = """
/* AOG-SS-V1 — every band leads with its part of the course */
.course-lead{margin:6px 0 18px;padding:16px 16px 12px;border:1.5px solid var(--acc,var(--navy,#1B3A5F));border-radius:14px;background:var(--card);box-shadow:var(--shadow)}
.cl-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-bottom:12px}
.cl-k{display:block;font:800 .7rem var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--acc,var(--navy,#1B3A5F))}
.cl-head h3{font:800 1.4rem/1.15 var(--serif);margin:.1em 0 .2em}
.cl-d{margin:0;font-size:.9rem;color:var(--sub);max-width:60ch}
.cl-btn{display:inline-flex;align-items:center;min-height:48px;padding:0 18px;border-radius:999px;background:var(--ink);color:var(--bg);text-decoration:none;font:700 .92rem var(--sans);flex:0 0 auto}
.cl-btn:hover{background:var(--acc,var(--navy,#1B3A5F));color:#fff}
.unit.course{position:relative;padding-left:64px}
.unit.course .un{position:absolute;left:14px;top:14px;width:38px;height:38px;border-radius:9px;background:#1B4F72;color:#fff;display:flex;align-items:center;justify-content:center;font:800 1.25rem "Avenir Next Condensed","Arial Narrow",var(--sans);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 3px 0 rgba(0,0,0,.35)}
.unit.course .yrs{font:italic 600 .84rem var(--serif);color:var(--sub);margin-top:-2px}
.more-k{margin:16px 0 -6px;font:800 .72rem var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--sub)}
"""
    if ".unit.course{" not in s:
        s = s.replace("</style>", css + "</style>", 1)
    p.write_text(s, encoding="utf-8"); print("hub: course blocks added to 5 bands")

def redirects():
    p = DEPLOY / "_redirects"; s = p.read_text(encoding="utf-8")
    add = []
    if "/social-studies-course " not in s: add.append("/social-studies-course".ljust(28) + "/social-studies-course.html".ljust(42) + "200")
    for u in UNITS:
        n = u["n"]
        if "/ssc%d " % n not in s: add.append(("/ssc%d" % n).ljust(28) + ("/ssc-u%d.html" % n).ljust(42) + "200")
    if add:
        if not s.endswith("\n"): s += "\n"
        s += "\n# AOG-SS-V1 — Social Studies, K–12: the course contents and the 24 units\n" + "\n".join(add) + "\n"
        p.write_text(s, encoding="utf-8")
    print("redirects: %d added" % len(add))

def sw():
    p = DEPLOY / "sw.js"; s = p.read_text(encoding="utf-8")
    if "ssc-u1.html" in s:
        print("sw: already precaches the course"); return
    m = re.search(r"^const CACHE = '(aog-cache-[0-9.]+)'(.*)$", s, re.M)
    old = m.group(1)
    new = "aog-cache-2026.09.26.4401"
    line = ("const CACHE = '%s'   // SOCIAL STUDIES, K-12, ONE COURSE. Jimmy: can social studies be applied across the whole K-12 spectrum, one course across K-12 like Science. /social-studies-course and /ssc1-/ssc24: 24 units, 55 chapters, built by _work/ss/build_ss.py through the shared course builder. U.S. History 6-8 stays its own course beside it.\n"
            "// previous: const CACHE = '%s'%s" % (new, old, m.group(2)))
    s = s[:m.start()] + line + s[m.end():]
    add = "  './social-studies-course.html', " + ", ".join("'./ssc-u%d.html'" % u["n"] for u in UNITS) + ",   // AOG-SS-V1 — the Social Studies course, K–12\n"
    n = re.search(r"const PRECACHE_LESSONS = \[\n", s).end()
    s = s[:n] + add + s[n:]
    p.write_text(s, encoding="utf-8"); print("sw: CACHE → %s, 25 files precached" % new)

def sitemap():
    p = DEPLOY / "sitemap.xml"; s = p.read_text(encoding="utf-8")
    if "/social-studies-course<" in s:
        print("sitemap: already listed"); return
    rows = ['  <url><loc>https://architectureofgrace.org/social-studies-course</loc><lastmod>%s</lastmod><priority>0.8</priority></url>' % TODAY]
    rows += ['  <url><loc>https://architectureofgrace.org/ssc%d</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (u["n"], TODAY) for u in UNITS]
    s = s.replace("</urlset>", "\n".join(rows) + "\n</urlset>")
    p.write_text(s, encoding="utf-8"); print("sitemap: 25 added")

if __name__ == "__main__":
    hub(); redirects(); sw(); sitemap()
