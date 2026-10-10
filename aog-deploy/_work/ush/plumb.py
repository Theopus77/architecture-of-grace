#!/usr/bin/env python3
"""
AOG-USH-V1 · site plumbing for the U.S. History course. Idempotent.
  · social-studies-hub.html — band 6–8 leads with the course (ten unit cards),
    every existing card stays below under "More rooms"
  · _redirects — /us-history and /ush1 … /ush10
  · sw.js — CACHE bump + the course pages and the two shared scripts precached
  · sitemap.xml — the eleven pages
Run from aog-deploy/:  python3 _work/ush/plumb.py
"""
import re, html, datetime
from pathlib import Path
DEPLOY = Path(__file__).resolve().parent.parent.parent
E = lambda s: html.escape(s, quote=True)
TODAY = datetime.date.today().isoformat()
UNITS = [(1,"Early Encounters","Beginnings–1650","Primeros encuentros"),
 (2,"English Settlement","1585–1763","Los asentamientos ingleses"),
 (3,"A New Nation","1763–1791","Una nueva nación"),
 (4,"The Early Republic","1789–1844","La primera república"),
 (5,"Pushing National Boundaries","1821–1860","Empujando las fronteras"),
 (6,"Civil War and Reconstruction","1846–1877","Guerra Civil y Reconstrucción"),
 (7,"America on the Move","1860–1920","Un país en movimiento"),
 (8,"Twentieth-Century Crises","1914–1945","Las crisis del siglo XX"),
 (9,"Postwar America","1945–1973","La posguerra"),
 (10,"America in a Changing World","1969–Present","Un mundo que cambia")]
DESC = {1:("First peoples, Cahokia, the voyages, the Columbian Exchange and the Pueblo Revolt.","Primeros pueblos, Cahokia, los viajes, el intercambio colombino y la revuelta pueblo."),
 2:("Roanoke, Jamestown, Plymouth, the thirteen colonies and how they grew.","Roanoke, Jamestown, Plymouth, las trece colonias y cómo crecieron."),
 3:("Taxes and protests, the Revolution, the Articles and the Constitution.","Impuestos y protestas, la Revolución, los Artículos y la Constitución."),
 4:("Washington to Jackson: the first parties, Jefferson, the War of 1812, mills and steamboats.","De Washington a Jackson: los primeros partidos, Jefferson, la guerra de 1812, fábricas y vapores."),
 5:("Jackson, removal, Texas, the trails west, reform and the Gold Rush.","Jackson, el desplazamiento, Texas, los caminos al oeste, las reformas y la fiebre del oro."),
 6:("A broken nation, the war year by year, emancipation, Reconstruction and its end.","Una nación rota, la guerra año a año, la emancipación, la Reconstrucción y su fin."),
 7:("The West, industry, immigration, cities and the Progressive Era.","El Oeste, la industria, la inmigración, las ciudades y la era progresista."),
 8:("The Great War, the twenties, the Depression, the New Deal and World War II.","La Gran Guerra, los años veinte, la Depresión, el New Deal y la Segunda Guerra Mundial."),
 9:("The Cold War, the suburbs, civil rights, Vietnam and expanding rights.","La Guerra Fría, los suburbios, los derechos civiles, Vietnam y la ampliación de derechos."),
 10:("Watergate to the present: new politics, new technology, a changing nation.","De Watergate al presente: nueva política, nueva tecnología, una nación que cambia.")}

def hub():
    p = DEPLOY / "social-studies-hub.html"; s = p.read_text(encoding="utf-8")
    if 'id="course-6-8"' in s:
        print("hub: already has the course block"); return
    cards = []
    for n, t, y, tes in UNITS:
        d_en, d_es = DESC[n]
        cards.append(f'  <div class="unit open course"><div class="un" aria-hidden="true">{n}</div><div class="t" data-en="{E(t)}" data-es="{E(tes)}">{E(t)}</div><div class="yrs">{E(y)}</div><div class="d" data-en="{E(d_en)}" data-es="{E(d_es)}">{E(d_en)}</div><div class="doors"><a class="door" href="/ush{n}" data-en="Open the unit" data-es="Abrir la unidad">Open the unit</a><button class="beam no-print" type="button" data-beam="/ush{n}" data-name="U.S. History · Unit {n} · {E(t)}" data-name-es="Historia de EE. UU. · Unidad {n} · {E(tes)}" data-en="Show on the board" data-es="Mostrar en la pizarra">Show on the board</button></div></div>')
    block = ('<div class="course-lead" id="course-6-8">\n'
             '  <div class="cl-head"><div><span class="cl-k" data-en="The course" data-es="El curso">The course</span>'
             '<h3 data-en="U.S. History, Grades 6–8" data-es="Historia de EE. UU., grados 6–8">U.S. History, Grades 6–8</h3>'
             '<p class="cl-d" data-en="Ten units, 29 chapters, 338 numbered lessons — each with a reading, key words, a source or the numbers, and three checks. Chapter reviews, unit tests, a word match and a writing task." data-es="Diez unidades, 29 capítulos, 338 lecciones numeradas — cada una con una lectura, palabras clave, una fuente o los números, y tres comprobaciones. Repasos por capítulo, exámenes de unidad, un juego de palabras y una tarea de escritura.">Ten units, 29 chapters, 338 numbered lessons — each with a reading, key words, a source or the numbers, and three checks. Chapter reviews, unit tests, a word match and a writing task.</p></div>'
             '<a class="cl-btn" href="/us-history" data-en="Course contents" data-es="Contenido del curso">Course contents</a></div>\n'
             '  <div class="grid">\n' + "\n".join(cards) + '\n  </div>\n'
             '  <p class="more-k" data-en="More rooms on this band" data-es="Más salas de esta banda">More rooms on this band</p>\n'
             '</div>\n')
    # the band's own grid follows the count line
    anchor = re.search(r'(<section class="band" id="6-8"[^>]*>.*?<p class="count"[^>]*>[^<]*</p>\n)', s, re.S)
    assert anchor, "6-8 band not found"
    s = s[:anchor.end()] + block + s[anchor.end():]
    s = s.replace('data-en="7 units open · 0 in the workshop" data-es="7 unidades abiertas · 0 en el taller">7 units open · 0 in the workshop',
                  'data-en="17 units open · 0 in the workshop" data-es="17 unidades abiertas · 0 en el taller">17 units open · 0 in the workshop')
    css = """
/* AOG-USH-V1 — band 6–8 leads with the course */
.course-lead{margin:6px 0 18px;padding:16px 16px 12px;border:1.5px solid var(--acc);border-radius:14px;background:var(--card);box-shadow:var(--shadow)}
.cl-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-bottom:12px}
.cl-k{display:block;font:800 .7rem var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--acc)}
.cl-head h3{font:800 1.4rem/1.15 var(--serif);margin:.1em 0 .2em}
.cl-d{margin:0;font-size:.9rem;color:var(--sub);max-width:60ch}
.cl-btn{display:inline-flex;align-items:center;min-height:48px;padding:0 18px;border-radius:999px;background:var(--ink);color:var(--bg);text-decoration:none;font:700 .92rem var(--sans);flex:0 0 auto}
.cl-btn:hover{background:var(--acc);color:#fff}
.unit.course{position:relative;padding-left:64px}
.unit.course .un{position:absolute;left:14px;top:14px;width:38px;height:38px;border-radius:9px;background:#A8323A;color:#fff;display:flex;align-items:center;justify-content:center;font:800 1.25rem "Avenir Next Condensed","Arial Narrow",var(--sans);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 3px 0 #5A151B}
.unit.course .yrs{font:italic 600 .84rem var(--serif);color:var(--sub);margin-top:-2px}
.more-k{margin:16px 0 -6px;font:800 .72rem var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--sub)}
"""
    s = s.replace("</style>", css + "</style>", 1)
    p.write_text(s, encoding="utf-8"); print("hub: course block added")

def redirects():
    p = DEPLOY / "_redirects"; s = p.read_text(encoding="utf-8")
    add = []
    if "/us-history " not in s: add.append("/us-history                 /us-history.html                          200")
    for n in range(1, 11):
        if "/ush%d " % n not in s: add.append(("/ush%d" % n).ljust(28) + ("/ush-u%d.html" % n).ljust(42) + "200")
    if add:
        if not s.endswith("\n"): s += "\n"
        s += "\n# AOG-USH-V1 — U.S. History, grades 6–8: the course contents and the ten units\n" + "\n".join(add) + "\n"
        p.write_text(s, encoding="utf-8")
    print("redirects: %d added" % len(add))

def sw():
    p = DEPLOY / "sw.js"; s = p.read_text(encoding="utf-8")
    if "ush-u1.html" in s:
        print("sw: already precaches the course"); return
    m = re.search(r"^const CACHE = '(aog-cache-[0-9.]+)'(.*)$", s, re.M)
    old = m.group(1)
    new = "aog-cache-2026.09.24.4380"
    line = ("const CACHE = '%s'   // THE COURSE, THE MENU AND THE CARDS. Jimmy: \"It is time to rehaul and redo the whole social studies [6–8] … follow this format [Units → Chapters → Sections → numbered lessons] … the drop menu looks meh … nothing gets lost, but the face needs a facelift.\" "
            "(1) /us-history and /ush1–/ush10 — the U.S. History course, built from ten JSON units by _work/ush/build_ush.py: banner, intro, big question, timeline, chapters (story → sections → numbered lessons with a reading, key-word pop-ups, a source / a bar chart / a scenario, three checks), a review per chapter, the wrap-up (twelve-word match, fifteen-question test, a writing task), practice rooms, Listen, a contents drawer, print. "
            "(2) aog-jump.js — ONE shared script turns every page's #jumpSel into a styled button and a searchable panel (the select stays as the no-JS fallback); the Social Studies 6–8 group now lists the ten units first. "
            "(3) aog-cards.js — ONE shared script turns the study cards on every lesson page into physical flip cards (a deck, a tier ribbon, swipe, arrows, progress dots) while the page's own reveal/persist code keeps running. Bumped so every page picks up the two scripts.\n"
            "// previous: const CACHE = '%s'%s" % (new, old, m.group(2)))
    s = s[:m.start()] + line + s[m.end():]
    # precache the course and the scripts, best-effort, one at a time (the PRECACHE_LESSONS rule)
    add = "  './aog-jump.js', './aog-cards.js',   // AOG-USH-V1 — the two shared scripts every lesson page now loads\n  './us-history.html', " + ", ".join("'./ush-u%d.html'" % n for n in range(1, 11)) + ",   // the U.S. History course, grades 6–8\n"
    n = re.search(r"const PRECACHE_LESSONS = \[\n", s).end()
    s = s[:n] + add + s[n:]
    p.write_text(s, encoding="utf-8"); print("sw: CACHE → %s, 13 files precached" % new)

def sitemap():
    p = DEPLOY / "sitemap.xml"; s = p.read_text(encoding="utf-8")
    if "/us-history<" in s:
        print("sitemap: already listed"); return
    rows = ['  <url><loc>https://architectureofgrace.com/us-history</loc><lastmod>%s</lastmod><priority>0.8</priority></url>' % TODAY]
    rows += ['  <url><loc>https://architectureofgrace.com/ush%d</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (n, TODAY) for n in range(1, 11)]
    s = s.replace("</urlset>", "\n".join(rows) + "\n</urlset>")
    p.write_text(s, encoding="utf-8"); print("sitemap: 11 added")

if __name__ == "__main__":
    hub(); redirects(); sw(); sitemap()
