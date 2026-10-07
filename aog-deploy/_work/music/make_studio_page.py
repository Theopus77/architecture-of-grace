# -*- coding: utf-8 -*-
"""AOG-STUDIO-PAGE-V1 (2026-10-06) — the-studio.html: The Studio, every music room on one page, at /the-studio and /music.

Jimmy: "Can the studio and all of its components get its own address? So I can link to them directly instead of going in
the website." Each room already has its own (/drum-machine, /drum-kit, /piano …); the Studio itself had none (it was a door
on the home page, and /studio opens the Mixing Desk). This page is the Studio: the eight rooms in song order (CLAUDE.md),
each with its picture, one line, its lessons, and Copy link, which copies the room's address to send to someone.
Jimmy, then: "I want to be able to have multiple tabs open and work on them on their own page." Each room opens in its own
tab (target=_blank; a link opened that way gets no window.opener in today's browsers), and the rooms already hear each
other across tabs (aog-handoff.js, BroadcastChannel "aog-music").

  python3 _work/music/make_studio_page.py        (from aog-deploy/)
"""
import html, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
SITE = "https://architectureofgrace.org"
ROOMS = [
    ("/drum-machine", "music-pads", ("The Drum Machine", "La caja de ritmos"), ("Sixteen pads and every sound here. Make a beat.", "Dieciséis pads y todos los sonidos de aquí. Haz un ritmo."), "/drum-machine-lessons"),
    ("/drum-kit", "music-kit", ("The Drum Kit", "La batería"), ("A real drum kit to play with your fingers.", "Una batería de verdad para tocar con los dedos."), "/drum-kit-lessons"),
    ("/piano", "music-piano", ("The Piano", "El piano"), ("Chords and keys, with your beat or on their own.", "Acordes y teclas, con tu ritmo o solos."), "/piano-lessons"),
    ("/guitar", "music-guitar", ("The Guitar", "La guitarra"), ("Strum or pick along with your beat.", "Rasguea o puntea con tu ritmo."), "/guitar-lessons"),
    ("/bass", "music-bass", ("The Bass", "El bajo"), ("The low notes that hold a song together.", "Las notas graves que sostienen la canción."), "/bass-lessons"),
    ("/band", "music-band", ("The Band", "La banda"), ("Brass, winds and strings play your chords.", "Metales, vientos y cuerdas tocan tus acordes."), "/band-lessons"),
    ("/turntables", "music-decks", ("The Turntables", "Los tocadiscos"), ("Three decks. Scratch, loop and mix records.", "Tres platos. Raya, repite y mezcla discos."), "/decks-lessons"),
    ("/mixing-desk", "music-mixdesk", ("The Mixing Desk", "La mesa de mezclas"), ("Put your recordings together into one song.", "Junta tus grabaciones en una sola canción."), "/mixing-desk-lessons"),
]
def esc(t): return html.escape(t, quote=True)
def sp(pair): return '<span data-en="%s" data-es="%s">%s</span>' % (esc(pair[0]), esc(pair[1]), esc(pair[0]))
CSS = """
/* AOG-STUDIO-PAGE-V1 */
.rooms { list-style:none; margin:1.2rem 0 1.6rem; padding:0; display:grid; gap:14px; grid-template-columns:repeat(auto-fill,minmax(min(100%,15.5rem),1fr)); }
.room { display:flex; flex-direction:column; background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; color:var(--ink); }
.room a.go { display:flex; flex-direction:column; text-decoration:none; color:var(--ink); }
.room .pic { display:block; aspect-ratio:2/1; background:#f3eee2; overflow:hidden; }
.room .pic img { display:block; width:100%; height:100%; object-fit:cover; object-position:68% 42%; }
.room h2 { margin:.7rem .9rem .15rem; font-size:1.15rem; }
.room p { margin:0 .9rem .6rem; color:var(--muted); font-size:.95rem; line-height:1.4; }
.room .acts { margin:auto .9rem .9rem; display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }
.room .acts a, .room .acts button { min-height:44px; display:inline-flex; align-items:center; padding:0 .9rem; border-radius:999px; border:1px solid var(--line);
  background:var(--card); color:var(--ink); font:700 .92rem/1.2 var(--sans); text-decoration:none; cursor:pointer; }
.room .addr { display:block; margin:0 .9rem .5rem; font:600 .85rem/1.3 var(--sans); color:var(--steel); overflow-wrap:anywhere; }
.copied { min-height:1.4em; margin:0; font-weight:700; color:var(--ink); }
@media print { .room .acts { display:none; } }
"""
JS = """<script>
/* AOG-STUDIO-PAGE-V1 — Copy link: the room's address, ready to paste into a message or a lesson plan */
document.querySelectorAll("[data-copy]").forEach(function (b) {
  b.addEventListener("click", function () {
    var url = b.getAttribute("data-copy"), es = (document.documentElement.lang || "en").indexOf("es") === 0;
    var say = document.getElementById("copied"), done = function (ok) {
      say.textContent = ok ? (es ? "Copiado: " : "Copied: ") + url : (es ? "Mantén pulsada la dirección para copiarla: " : "Press and hold the address to copy it: ") + url; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });
});
</script>"""
def build():
    src = open(os.path.join(ROOT, "drums-guide.html"), encoding="utf-8").read()
    head = src.split("</head>", 1)[0]
    head = re.sub(r"<title>.*?</title>", "<title>The Studio &mdash; Architecture of Grace</title>", head, count=1, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Every music room in one place: the drum machine, drum kit, piano, guitar, bass, band, turntables and mixing desk.">', head, count=1)
    head = head.replace('<meta name="robots" content="noindex">\n', "")
    head = re.sub(r"<!-- AOG-DRUMPIC-V1 .*?-->", "<!-- AOG-STUDIO-PAGE-V1 (2026-10-06) — The Studio. MADE BY _work/music/make_studio_page.py: edit there, then run it. -->", head, count=1, flags=re.S)
    i = head.rfind("</style>"); head = head[:i] + CSS + head[i:]
    out = ['<div class="wrap">', "", "<header>", '  <a class="brand" href="/">Architecture of Grace</a>', "</header>", "",
           "<h1>%s</h1>" % sp(("The Studio", "El estudio")),
           '<p class="lede">%s</p>' % sp(("Every music room in one place. Each opens in its own tab, so you can keep several open and move between them. What you send from one room shows up in the others right away.",
                                          "Todas las salas de música en un solo lugar. Cada una se abre en su propia pestaña, así puedes tener varias abiertas y pasar de una a otra. Lo que envías desde una sala aparece en las otras enseguida.")),
           '<p class="copied" id="copied" role="status" aria-live="polite"></p>',
           '<ul class="rooms">']
    for href, pic, name, line, les in ROOMS:
        url = SITE + href
        out.append('  <li class="room"><a class="go" href="%s" target="_blank"><span class="pic" aria-hidden="true"><picture><source type="image/webp" srcset="/img/banners/%s-pencil-900.webp">'
                   '<img src="/img/banners/%s-pencil-900.jpg" alt="" width="900" height="315" loading="lazy" decoding="async"></picture></span><h2>%s</h2><p>%s</p></a>'
                   '<span class="addr">%s</span><span class="acts"><button type="button" data-copy="%s">%s</button><a href="%s" target="_blank">%s</a></span></li>'
                   % (href, pic, pic, sp(name), sp(line), esc(url.replace("https://", "")), esc(url), sp(("Copy link", "Copiar enlace")), les, sp(("Lessons", "Lecciones"))))
    out.append("</ul>")
    out.append("<footer>%s</footer>" % sp(("The Studio · Architecture of Grace", "El estudio · Architecture of Grace")))
    out.append("</div>")
    page = head + "</head>\n<body>\n<script src=\"/aog-grace.js\" defer></script>\n" + "\n".join(out) + "\n" + JS + "\n<script src=\"/aog-topbar.js\"></script>\n</body>\n</html>\n"
    open(os.path.join(ROOT, "the-studio.html"), "w", encoding="utf-8").write(page)
    print("the-studio.html written")
if __name__ == "__main__":
    build()
