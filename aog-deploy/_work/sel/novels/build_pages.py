#!/usr/bin/env python3
"""Emit the six novel reader pages. Run from aog-deploy/. Regenerate; never hand-edit one copy."""
import json, html
BOOKS = [
  # key, page, room, book, grades, hub link, hub label
  ("room-12",  "room-12-novel.html",  "Room 12",  "Book 1 · The Foundation", "Grades K–2",   "room-12-lessons.html",  "Room 12, the lessons",  "Salón 12, las lecciones"),
  ("room-18",  "room-18-novel.html",  "Room 18",  "Book 2 · The Framework",  "Grades 3–5",   "room-18-lessons.html",  "Room 18, the lessons",  "Salón 18, las lecciones"),
  ("room-36",  "room-36-novel.html",  "Room 36",  "Book 3 · The Interior",   "Grades 6–8",   "room-36-lessons.html",  "Room 36, the lessons",  "Salón 36, las lecciones"),
  ("room-104", "room-104-novel.html", "Room 104", "Book 4 · The Structure",  "Grades 9–10",  "room-104-lessons.html", "Room 104, the lessons", "Salón 104, las lecciones"),
  ("room-207", "room-207-novel.html", "Room 207", "Book 5 · The Threshold",  "Grades 11–12", "room-207-lessons.html", "Room 207, the lessons", "Salón 207, las lecciones"),
  ("the-dwelling", "the-dwelling.html", "The Dwelling", "Book 6 · The Adult Companion", "Adults", "/#adult", "Grace for adult life", "La gracia en la vida adulta"),
]
ROOMS = [("room-12","Room 12","Grades K–2"),("room-18","Room 18","Grades 3–5"),("room-36","Room 36","Grades 6–8"),("room-104","Room 104","Grades 9–10"),("room-207","Room 207","Grades 11–12")]
COVER_ALT = {
  "room-12": "a first-grade classroom, a green frog puppet at the front and a heart on the board that says I'm here",
  "room-18": "a third-grader at a desk, two tall shadows behind him under a wall of sticky notes",
  "room-36": "a row of purple lockers with two masks hanging on one, a phone on the floor",
  "room-104": "one small figure on a dark hill under a night sky, one bright star overhead",
  "room-207": "an open door pouring light into the dark, three figures walking toward it",
  "the-dwelling": "a small house at night, its windows lit, inside a circle of gold",
}
BOOKNAMES = {"room-12":"Book 1","room-18":"Book 2","room-36":"Book 3","room-104":"Book 4","room-207":"Book 5"}

def jump(key):
    o = ['<optgroup label="SEL · The novels">', '<option value="novels.html">All six novels · The shelf</option>']
    for k, room, g in ROOMS:
        sel = ' selected' if k == key else ''
        o.append(f'<option value="{k}-novel.html"{sel}>{room} · {g} · The novel</option>')
    o.append(f'<option value="the-dwelling.html"{" selected" if key=="the-dwelling" else ""}>The Dwelling · Adults · The novel</option>')
    o.append('</optgroup>')
    if key != "the-dwelling":
        room = key.replace("room-", "")
        o.append(f'<optgroup label="{dict((k,r) for k,r,g in ROOMS)[key]}">')
        o += [f'<option value="{key}-curriculum.html">The curriculum</option>',
              f'<option value="{key}-lessons.html">The Lessons</option>',
              f'<option value="{key}-cards.html">Scenario cards</option>',
              f'<option value="{key}-workbook.html">The companion workbook</option>',
              f'<option value="AoG-Anchor-Charts-{room}.html">Anchor charts</option>' if room != "36" else '<option value="AoG-Anchor-Charts.html">Anchor charts</option>']
        o.append('</optgroup>')
    return "\n".join(o)

for key, page, room, book, grades, hub, hub_en, hub_es in BOOKS:
    data = json.load(open(f"novels/{key}.json", encoding="utf8"))
    title = data["title"]; pdf = data["pdf"]
    nch = sum(1 for s in data["sections"] if s["kind"] == "chapter")
    cover_alt = COVER_ALT[key]
    if key == "the-dwelling":
        k_en = f"The Interior — SEL · {book} · {grades}"; k_es = f"El Interior — SEL · Libro 6 · Adultos"
        deck = f"The sixth book, for the adults the children of Room 12 became. Read it here, one chapter at a time — {nch} chapters."
    else:
        k_en = f"The Interior — SEL · {room} · {book} · {grades}"; k_es = f"El Interior — SEL · Salón {room.split()[1]} · Libro {book.split()[1]} · {grades.replace('Grades','Grados')}"
        deck = f"{room}&rsquo;s novel, one chapter at a time. Pick the chapter your class is reading — {nch} chapters, plus the note before you begin."
    out = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>/* begin in light. Dark only when this device chose it. Same key as the other room pages. */
(function(){{var t="light";try{{if(localStorage.getItem("aog.interior.ws.v1.theme")==="dark")t="dark";}}catch(e){{}}document.documentElement.setAttribute("data-theme",t);}})();</script>
<title>{html.escape(title)} · {html.escape(room)} · Architecture of Grace</title>
<meta name="description" content="{html.escape(title)} — {html.escape(room)}&rsquo;s companion novel, read on the site chapter by chapter.">
<link rel="stylesheet" href="/aog-novel.css">
</head>
<body>
<script src="/aog-topbar.js"></script>
<script src="/aog-grace.js" defer></script>
<div class="wrap">
<header class="mast has-cover">
  <a class="cover" href="/novels.html" aria-label="All six novels, on the shelf"><img src="/novels/cover-{key}.jpg" width="900" height="1350" alt="{html.escape(title)} — the cover: {cover_alt}" loading="eager" decoding="async"></a>
  <div>
    <div class="k"><span data-en="{html.escape(k_en)}" data-es="{html.escape(k_es)}">{html.escape(k_en)}</span></div>
    <h1>{html.escape(title)}</h1>
    <p class="deck">{deck}</p>
    <p class="hubline no-print"><a id="hubLink" href="{hub}"><span data-en="← {html.escape(hub_en)}" data-es="← {html.escape(hub_es)}">← {html.escape(hub_en)}</span></a></p>
  </div>
</header>

<main id="main" class="novel" data-novel="{key}" data-pdf="{pdf}">
<div class="jump no-print"><label><span data-en="Jump to another room" data-es="Ir a otro salón">Jump to another room</span><select id="roomSel">
{jump(key)}</select></label></div>
<div id="nvHost"></div>
<noscript><p class="nv-msg">This reader needs JavaScript. <a href="{pdf}">Open the whole book as a PDF</a>.</p></noscript>
</main>
</div>
<script>
(function(){{var s=document.getElementById("roomSel");if(!s)return;s.addEventListener("change",function(){{if(this.value)location.href=this.value;}});}})();
</script>
<script src="/aog-novel.js" defer></script>
</body>
</html>
'''
    open(page, "w", encoding="utf8").write(out)
    print("wrote", page, nch, "chapters")


# ── the shelf: all six covers, each a door to its reader ──────────────────────
shelf = []
for key, page, room, book, grades, hub, hub_en, hub_es in BOOKS:
    data = json.load(open(f"novels/{key}.json", encoding="utf8"))
    nch = sum(1 for s in data["sections"] if s["kind"] == "chapter")
    shelf.append(f'''  <a class="book" href="/{page}">
    <img src="/novels/cover-{key}.jpg" width="900" height="1350" alt="{html.escape(data["title"])} — the cover: {COVER_ALT[key]}" loading="lazy" decoding="async">
    <span class="who"><span class="r">{html.escape(room)} · {html.escape(grades)}</span><span class="t">{html.escape(data["title"])}</span><span class="n">{book.split(" · ")[0]} · {nch} chapters</span></span>
  </a>''')
open("novels.html", "w", encoding="utf8").write(f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(){{var t="light";try{{if(localStorage.getItem("aog.interior.ws.v1.theme")==="dark")t="dark";}}catch(e){{}}document.documentElement.setAttribute("data-theme",t);}})();</script>
<title>The Novels · Architecture of Grace</title>
<meta name="description" content="The six Architecture of Grace novels, on one shelf — read any of them here, chapter by chapter.">
<link rel="stylesheet" href="/aog-novel.css">
</head>
<body>
<script src="/aog-topbar.js"></script>
<script src="/aog-grace.js" defer></script>
<div class="wrap shelfwrap">
<header class="mast">
  <div>
    <div class="k"><span data-en="The Interior — SEL · The Novels" data-es="El Interior — SEL · Las novelas">The Interior — SEL · The Novels</span></div>
    <h1 data-en="The Novels" data-es="Las novelas">The Novels</h1>
    <p class="deck">Six books, one spine. Books One to Five follow the same ten kids from first grade to graduation, one room a year. Book Six is for the adults they became. Tap a cover to read it here.</p>
  </div>
</header>
<main id="main" class="shelf" aria-label="The six novels">
{chr(10).join(shelf)}
</main>
</div>
</body>
</html>
''')
print("wrote novels.html")
