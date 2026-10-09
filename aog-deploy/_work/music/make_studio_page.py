# -*- coding: utf-8 -*-
"""AOG-STUDIO-PAGE-V1 (2026-10-06) — the-studio.html: The Recording Studio, at /the-studio and /music.
AOG-STUDIO-TRANSPORT-V1 (2026-10-09) — Jimmy: "I want the studio to be the RECORDING STUDIO." It is called The Recording
Studio, and one transport runs along the bottom for whatever room you are in: ● Record (the room's own recorder, through
window.AOGStudioRec: aog-recorder.js, the Turntables), + Add to My Track once a take is made, ▶ Listen (My Track at the
Mixing Desk), Mix ›, Send it out (the Mixing Desk's). A phone turned sideways gives the room the whole screen.
AOG-STUDIO-SHELL-V1 (2026-10-09) — the Studio is one house (STUDIO-HANDOFF.md §04–§06, Jimmy's second pick).

The page is a frame, not a list of links:
  - the eight rooms as picture doors, in song order (CLAUDE.md, aog-labdoors.js);
  - the room you are in, playing inside the frame (an iframe of the room's own page). The room knows it is inside the
    Studio (aog-labdoors.js, AOG-STUDIO-SHELL-V1): it hides its own site bar and doors, and a link to another room
    changes the room here instead of opening a page inside the page. Each room is still its own page at its own
    address (/drum-machine, /bass …): nothing that links to a room breaks;
  - My Track along the bottom: one mark per layer. A layer is there when that room has a take in the Mixing Desk's
    list ("studioinbox") or a recording on its shelf (aog-handoff.js); visiting a room marks nothing (§06).
  - "Open in its own tab" keeps Jimmy's earlier ask (2026-10-06): "multiple tabs open and work on them on their own
    page". The rooms still hear each other across tabs (aog-handoff.js, BroadcastChannel "aog-music").
The address says the room (/the-studio#bass), so Back, a bookmark and a shared link all land in the right room.
The page draws at full size on a computer (no 85% zoom): the rooms inside have canvases, and a pen must land under the
finger (CLAUDE.md).

  python3 _work/music/make_studio_page.py        (from aog-deploy/)
"""
import html, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
# id, the room's own address, its page, its picture, name, short name, what it sends to the Mixing Desk (its "from"), its shelf
ROOMS = [
    ("pads", "/drum-machine", "music-pads.html", "music-pads", ("The Drum Machine", "La caja de ritmos"), ("Drum Machine", "Caja de ritmos"), "pads", "padbench"),
    ("kit", "/drum-kit", "music-kit.html", "music-kit", ("The Drum Kit", "La batería"), ("Drum Kit", "Batería"), "drums", "drumtake"),
    ("piano", "/piano", "music-piano.html", "music-piano", ("The Piano", "El piano"), ("Piano", "Piano"), "piano", "keysbench"),
    ("guitar", "/guitar", "music-guitar.html", "music-guitar", ("The Guitar", "La guitarra"), ("Guitar", "Guitarra"), "guitar", "guitarbench"),
    ("bass", "/bass", "music-bass.html", "music-bass", ("The Bass", "El bajo"), ("Bass", "Bajo"), "bass", "bassbench"),
    ("band", "/band", "music-band.html", "music-band", ("The Band", "La banda"), ("Band", "Banda"), "band", "bandbench"),
    ("decks", "/turntables", "music-decks.html", "music-decks", ("The Turntables", "Los tocadiscos"), ("Turntables", "Tocadiscos"), "decks", ""),
    ("studio", "/mixing-desk", "music-studio.html", "music-mixdesk", ("The Mixing Desk", "La mesa de mezclas"), ("Mixing Desk", "Mesa de mezclas"), "", ""),
]
# My Track: the layers, in song order, then Voice (STUDIO-HANDOFF §05). Voice has no room yet: it stays "nothing yet".
LAYERS = [("pads", ("Drums", "Ritmos")), ("kit", ("Kit", "Batería")), ("piano", ("Piano", "Piano")), ("guitar", ("Guitar", "Guitarra")),
          ("bass", ("Bass", "Bajo")), ("band", ("Band", "Banda")), ("decks", ("Turntables", "Tocadiscos")), ("voice", ("Voice", "Voz"))]
def esc(t): return html.escape(t, quote=True)
def sp(pair): return '<span data-en="%s" data-es="%s">%s</span>' % (esc(pair[0]), esc(pair[1]), esc(pair[0]))
CSS = """
/* AOG-STUDIO-SHELL-V1 — one house: the doors, the room, My Track */
body { zoom:1 !important; }   /* full size: the rooms inside draw on canvases (CLAUDE.md, 85% rule) */
.shell { max-width:1400px; margin:0 auto; padding:0 max(.75rem, env(safe-area-inset-right)) 0 max(.75rem, env(safe-area-inset-left)); }
.sh-top { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:.2rem 1rem; padding:.55rem 0 .35rem; }
.sh-top h1 { font-family:var(--display); font-size:1.45rem; line-height:1.15; margin:0; letter-spacing:-.01em; color:var(--ink); }
.sh-tag { margin:0; color:var(--muted); font-size:.95rem; flex:1 1 auto; }
.sh-own { min-height:44px; display:inline-flex; align-items:center; color:var(--steel); font-weight:700; font-size:.92rem; text-decoration:underline; text-underline-offset:3px; }
.sh-doors ul { list-style:none; margin:0; padding:2px 2px 6px; display:grid; grid-auto-flow:column; grid-auto-columns:max-content; gap:6px;
  overflow-x:auto; overscroll-behavior-x:contain; scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch; }
.sh-doors li { scroll-snap-align:start; }
.sh-doors a { display:flex; align-items:center; gap:7px; min-height:44px; padding:3px 12px 3px 3px; text-decoration:none; color:var(--ink);
  background:var(--card); border:1px solid var(--line); border-radius:12px; font:700 .9rem/1.15 var(--sans); white-space:nowrap; }
.sh-doors .pic { display:block; width:52px; height:38px; flex:0 0 auto; border-radius:8px; overflow:hidden; background:#f3eee2; }
.sh-doors img { display:block; width:100%; height:100%; object-fit:cover; object-position:60% 50%; }
.sh-doors a[aria-current="true"] { border:2px solid #c9a24b; box-shadow:inset 0 0 0 1px #c9a24b; }
.sh-doors a:focus-visible, .mt a:focus-visible, .sh-own:focus-visible { outline:3px solid #c9a24b; outline-offset:2px; }
@media (min-width:1100px) { .sh-doors ul { grid-auto-flow:row; grid-template-columns:repeat(8,minmax(0,1fr)); overflow:visible; } .sh-doors a { white-space:normal; } }
.sh-room { display:block; width:100%; height:70vh; border:1px solid var(--line); border-radius:14px; background:var(--bg); }
.mt { margin:0; position:sticky; bottom:0; z-index:5; display:grid; gap:.3rem; padding:.4rem 0 max(.4rem, env(safe-area-inset-bottom)); background:var(--bg); }
.mtrow { display:flex; align-items:center; gap:.5rem; min-width:0; }
/* AOG-STUDIO-TRANSPORT-V1: the studio's transport, the same for every room */
.tp { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
.tp-b { min-height:44px; display:inline-flex; align-items:center; justify-content:center; gap:.35rem; padding:0 .95rem; border-radius:12px;
  border:1px solid #0a0b0d; background:linear-gradient(#3a3e44,#1c1f23); color:#f3efe6; font:800 .95rem/1.1 var(--sans); text-decoration:none; cursor:pointer; white-space:nowrap; }
.tp-b:disabled { opacity:.55; cursor:default; }
.tp-b[hidden] { display:none; }
.tp-rec { background:linear-gradient(#ffe08a,#e09020); color:#2a1a08; min-width:7.2rem; }
.tp-rec[aria-pressed="true"] { background:linear-gradient(#ffb1a4,#c4452a); color:#2a0c08; }
.tp-add { background:linear-gradient(#bfe7c9,#6fbf8b); color:#0d2614; }
.tp-out { border-color:#5b8fd6; }
.tp-line { flex:1 1 12rem; min-width:0; color:var(--ink); font-weight:700; font-size:.92rem; }
.tp-line:empty { display:none; }
.tp-b:focus-visible { outline:3px solid #c9a24b; outline-offset:2px; }
/* an ID, so the site's serif heading rule (aog-grace.css) leaves this small label alone */
#mtH { margin:0; flex:0 0 auto; font:800 .74rem/1.2 var(--sans) !important; letter-spacing:.14em !important; text-transform:uppercase; color:var(--muted); }
.mt ul { list-style:none; margin:0; padding:2px; display:flex; gap:6px; overflow-x:auto; overscroll-behavior-x:contain; flex:1 1 auto; min-width:0; }
.mt a, .mt .lay { display:inline-flex; align-items:center; gap:.35rem; min-height:44px; padding:0 .8rem; border-radius:999px; border:1px solid var(--line);
  background:var(--card); color:var(--ink); font:700 .88rem/1 var(--sans); text-decoration:none; white-space:nowrap; }
.mt .mk { font-weight:800; color:var(--muted); }
.mt .on { border-color:#2c7a4e; }
.mt .on .mk { color:#2c7a4e; }
:root[data-theme="dark"] .mt .on { border-color:#6fbf8b; }
:root[data-theme="dark"] .mt .on .mk { color:#6fbf8b; }
.mt select { flex:0 0 auto; min-height:44px; max-width:11.5rem; font:700 16px/1.2 var(--sans); color:#0A1E33; background:#FFFDF8; border:1.5px solid #C9A24A;
  border-radius:999px; padding:0 .8rem; cursor:pointer; }
.mt a.mix { background:var(--steel); border-color:var(--steel); color:#f4f8f9; }
:root[data-theme="dark"] .mt a.mix { color:#14181e; }
/* a phone: one slim line above the doors, so the room gets the screen */
@media (max-width:699px) {
  .sh-top { flex-wrap:nowrap; align-items:center; padding:.25rem 0 .2rem; }
  .sh-top h1 { font-size:1.15rem; flex:1 1 auto; }
  .sh-tag, .sh-own .long { display:none; }
  .sh-own { white-space:nowrap; }
}
@media (min-width:700px) { .sh-own .short { display:none; } }
/* a phone on its side: the room gets the whole screen, as its own sideways play view expects (LANDSCAPE-HANDOFF.md) */
@media (orientation:landscape) and (max-height:500px) {
  .aogtop, .aogtop-spacer, .sh-top, .sh-doors, .mt { display:none !important; }
  .shell { padding:0; }
  .sh-room { border:0; border-radius:0; }
}
@media (max-width:699px) { .tp { gap:5px; } .tp-b { padding:0 .55rem; font-size:.88rem; } .tp-rec { min-width:5.9rem; } }
@media print { .sh-doors, .mt, .sh-room { display:none; } }
"""
JS = r"""<script src="/aog-handoff.js"></script>
<script>
/* AOG-STUDIO-SHELL-V1 — the doors change the room; My Track marks what each room has sent (see make_studio_page.py) */
(function () {
  "use strict";
  var D = document, ROOMS = __ROOMS__, LAYERS = __LAYERS__;
  var fr = D.getElementById("room"), own = D.getElementById("own"), cur = "", KEY = "aog.studio.room";
  function es() { return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  function room(id) { for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return ROOMS[i]; return null; }
  function first() {
    var h = (location.hash || "").slice(1); if (room(h)) return h;
    try { var s = localStorage.getItem(KEY); if (room(s)) return s; } catch (e) {}
    return "pads";
  }
  function go(id, push) {
    var r = room(id); if (!r) return;
    if (id === cur && fr.getAttribute("src")) return;
    cur = id;
    try { localStorage.setItem(KEY, id); } catch (e) {}
    if (location.hash !== "#" + id) { try { history[push ? "pushState" : "replaceState"](null, "", "#" + id); } catch (e) { location.hash = id; } }
    /* the first room loads; after that the room is swapped in place, so the frame adds no step of its own to Back */
    var url = "/" + r.file; fr.setAttribute("data-file", url);
    if (fr.getAttribute("src") && fr.contentWindow) { try { fr.contentWindow.location.replace(url); } catch (e) { fr.src = url; } }
    else fr.src = url;
    paint();
  }
  function paint() {
    var r = room(cur), e = es(); if (!r) return;
    TP.line = ""; if (typeof paintTp === "function") try { paintTp(); } catch (err) {}
    var name = e ? r.name[1] : r.name[0];
    fr.title = name;
    D.title = (e ? "El estudio de grabación · " : "The Recording Studio · ") + name + " — Architecture of Grace";
    own.href = r.href;
    [].forEach.call(D.querySelectorAll(".sh-doors a"), function (a) {
      if (a.getAttribute("data-room") === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    var ul = D.querySelector(".sh-doors ul"), on = D.querySelector('.sh-doors a[aria-current]');   /* the room you are in, in view */
    if (ul && on && ul.scrollWidth > ul.clientWidth) { var li = on.parentNode; ul.scrollLeft = Math.max(0, li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2); }
    paintTrack();
  }
  /* My Track: a layer is there when its room has a take in the Mixing Desk's list or a recording on its shelf */
  var HAVE = {};
  function paintTrack() {
    var e = es(), ul = D.getElementById("mtList");
    ul.innerHTML = LAYERS.map(function (l) {
      var on = !!HAVE[l.id], nm = e ? l.name[1] : l.name[0];
      var say = nm + ": " + (on ? (e ? "hay una toma" : "a take is ready") : (e ? "todavía nada" : "nothing yet"));
      /* a mark, not a link: the doors and Add a layer are the ways to a room (CLAUDE.md: four or more places, a menu) */
      return '<li><span class="lay' + (on ? " on" : "") + '" data-layer="' + l.id + '" role="img" aria-label="' + say + '"><span>' + nm + '</span><span class="mk" aria-hidden="true">' + (on ? "✓" : "—") + "</span></span></li>";
    }).join("");
    /* + Add a layer: the rooms in song order; a layer already there says so */
    var sel = D.getElementById("mtAdd");
    sel.innerHTML = '<option value="">' + (e ? "+ Añadir una capa" : "+ Add a layer") + "</option>" + LAYERS.filter(function (l) { return room(l.id); }).map(function (l) {
      var R = room(l.id); return '<option value="' + l.id + '">' + (e ? R.name[1] : R.name[0]) + (HAVE[l.id] ? " ✓" : "") + "</option>"; }).join("");
    sel.setAttribute("aria-label", e ? "Añadir una capa: elige una sala" : "Add a layer: pick a room");
  }
  async function refresh() {
    var A = window.AOGHandoff, next = {}; if (!A) return;
    var items = [];
    try { var r = await A.list(A.INBOX); items = (r && r.items) || []; } catch (e) {}
    for (var i = 0; i < LAYERS.length; i++) {
      var l = LAYERS[i], R = room(l.id), from = R ? R.from : l.id, shelf = R ? R.shelf : "";
      var got = items.some(function (x) { return x && x.from === from && x.sec > 0; });
      if (!got && shelf) { try { var s = await A.get(shelf); got = !!(s && s.wav && s.wav.size > 44); } catch (e) {} }
      next[l.id] = got;
    }
    HAVE = next; paintTrack();
  }
  /* ── AOG-STUDIO-TRANSPORT-V1: the transport drives the room you are in ── */
  var TP = { t0: 0, want: "", line: "" };
  function recOf() { try { return fr.contentWindow && fr.contentWindow.AOGStudioRec || null; } catch (e) { return null; } }
  function deskOf() { try { var w = fr.contentWindow; return cur === "studio" && w && w.__aogStudio ? w : null; } catch (e) { return null; } }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function say(k) { TP.line = k; paintTp(); }
  var TPW = {
    rec: ["● Record", "● Grabar"], stop: ["■ Stop", "■ Parar"], add: ["+ Add to My Track", "+ Añadir a mi pista"],
    listen: ["▶ Listen", "▶ Escuchar"], listenStop: ["■ Stop listening", "■ Dejar de escuchar"], mix: ["Mix ›", "Mezclar ›"], out: ["Send it out", "Compártela"],
    added: ["Added to My Track.", "Añadida a mi pista."], noRec: ["Pick a room to record in.", "Elige una sala para grabar."],
    empty: ["Nothing is on the tracks yet. At the Mixing Desk, put a take on a track, then press Listen.", "Todavía no hay nada en las pistas. En la mesa de mezclas, pon una toma en una pista y luego pulsa Escuchar."],
    fail: ["That did not work. Try again.", "No funcionó. Inténtalo otra vez."]
  };
  function tw(k) { return TPW[k][es() ? 1 : 0]; }
  function paintTp() {
    var R = recOf(), on = !!(R && R.on()), rb = D.getElementById("tpRec"), ab = D.getElementById("tpAdd"), lb = D.getElementById("tpListen");
    if (on && !TP.t0) TP.t0 = Date.now(); if (!on) TP.t0 = 0;
    var rt = on ? tw("stop") + " " + clock((Date.now() - TP.t0) / 1000) : tw("rec");
    if (rb.textContent !== rt) rb.textContent = rt;
    rb.setAttribute("aria-pressed", on ? "true" : "false");
    rb.disabled = !R || !!(R.busy && R.busy());
    var last = R && !on ? R.last() : null, showAdd = !!(last && !R.sent());
    ab.hidden = !showAdd; if (ab.textContent !== tw("add")) ab.textContent = tw("add");
    var w = deskOf(), playing = !!(w && w.__aogStudio.PLAY.on), lt = playing ? tw("listenStop") : tw("listen");
    if (lb.textContent !== lt) lb.textContent = lt;
    D.getElementById("tpMix").textContent = tw("mix"); D.getElementById("tpOut").textContent = tw("out");
    var ln = TP.line ? tw(TP.line) : ""; var el = D.getElementById("tpLine"); if (el.textContent !== ln) el.textContent = ln;
  }
  /* an action that needs the Mixing Desk: go there, then do it once the desk has its song back */
  function atDesk(fn) {
    var moved = cur !== "studio"; if (moved) go("studio", true);
    var t0 = Date.now(), k = setInterval(function () {
      var w = deskOf();
      /* a desk just opened gets a moment to put its song back; one already open acts at once */
      if (w && w.document.readyState === "complete" && !w.__aogStudio.S.decoding && (!moved || Date.now() - t0 > 600)) { clearInterval(k); fn(w); paintTp(); }
      else if (Date.now() - t0 > 12000) clearInterval(k);
    }, 150);
  }
  D.getElementById("tpRec").addEventListener("click", function () { var R = recOf(); if (!R) { say("noRec"); return; } TP.line = ""; R.toggle(); setTimeout(paintTp, 60); });
  D.getElementById("tpAdd").addEventListener("click", function () {
    var R = recOf(), b = this; if (!R) return; b.disabled = true;
    Promise.resolve(R.add()).then(function () { b.disabled = false; say(R.sent() ? "added" : "fail"); refresh(); }, function () { b.disabled = false; say("fail"); });
  });
  D.getElementById("tpListen").addEventListener("click", function () {
    TP.line = "";
    atDesk(function (w) {
      var st = w.__aogStudio;
      if (st.PLAY.on) { st.stop(); return; }
      if (!st.SONG.tracks.some(function (x) { return x.clip; })) { say("empty"); return; }
      st.play();
    });
  });
  D.getElementById("tpOut").addEventListener("click", function () {
    TP.line = "";
    atDesk(function (w) { var b = w.document.getElementById("outBtn"); if (!b) return; try { b.scrollIntoView({ block: "center" }); } catch (e) {} if (!b.disabled) b.click(); else b.focus(); });
  });
  setInterval(function () { if (!D.hidden) paintTp(); }, 250);

  /* the frame fills the screen between the doors and My Track */
  function size() {
    var top = fr.getBoundingClientRect().top + (window.scrollY || 0), mt = D.getElementById("mt").offsetHeight;
    fr.style.height = Math.max(window.innerHeight < 760 ? 300 : 420, Math.floor(window.innerHeight - top - mt - 4)) + "px";   /* a phone: the room takes what is left */
  }
  /* a room inside the frame says hello (aog-labdoors.js) and asks for another room by its id */
  window.AOGStudioShell = {
    go: function (id) { go(id, true); },
    arrived: function (id) { if (room(id) && id !== cur) { cur = id; try { history.replaceState(null, "", "#" + id); } catch (e) {} paint(); } size(); }
  };
  D.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-room]"); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); go(a.getAttribute("data-room"), true);
  });
  D.getElementById("mtAdd").addEventListener("change", function () { var v = this.value; this.value = ""; if (v) go(v, true); });
  window.addEventListener("popstate", function () { var h = (location.hash || "").slice(1); if (room(h)) go(h, false); });
  window.addEventListener("hashchange", function () { var h = (location.hash || "").slice(1); if (room(h)) go(h, false); });
  /* the language or the light changes here: the room inside follows (it reads both when it opens) */
  try {
    new MutationObserver(function () {
      paint();
      var cd = fr.contentDocument, d = cd && cd.documentElement;
      if (!d || cd.readyState !== "complete" || cd.location.pathname !== fr.getAttribute("data-file")) return;   /* still loading: it reads both itself */
      var h = D.documentElement;
      if ((d.getAttribute("lang") || "en").slice(0, 2) !== (h.getAttribute("lang") || "en").slice(0, 2) || (d.getAttribute("data-theme") || "light") !== (h.getAttribute("data-theme") || "light"))
        fr.contentWindow.location.reload();
    }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang", "data-theme"] });
  } catch (e) {}
  try { if (window.AOGHandoff) AOGHandoff.listen(function () { refresh(); }); } catch (e) {}
  window.addEventListener("focus", refresh);
  window.addEventListener("resize", size);
  go(first(), false);
  size(); refresh();
  /* the site bar and the fonts arrive a moment later and move the frame down: fit it again whenever the page moves */
  try { new ResizeObserver(function () { size(); }).observe(D.body); } catch (e) { setTimeout(size, 600); setTimeout(size, 2000); }
  window.addEventListener("load", size);
})();
</script>"""
def build():
    src = open(os.path.join(ROOT, "drums-guide.html"), encoding="utf-8").read()
    head = src.split("</head>", 1)[0]
    head = re.sub(r"<title>.*?</title>", "<title>The Recording Studio &mdash; Architecture of Grace</title>", head, count=1, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Every music room in one studio: the drum machine, drum kit, piano, guitar, bass, band, turntables and mixing desk. Play, make, mix and send it out. No account.">', head, count=1)
    head = head.replace('<meta name="robots" content="noindex">\n', "")
    head = re.sub(r"<!-- AOG-DRUMPIC-V1 .*?-->", "<!-- AOG-STUDIO-PAGE-V1 (2026-10-06) · AOG-STUDIO-SHELL-V1 (2026-10-09) — The Studio. MADE BY _work/music/make_studio_page.py: edit there, then run it. -->", head, count=1, flags=re.S)
    i = head.rfind("</style>"); head = head[:i] + CSS + head[i:]
    out = ['<div class="shell">',
           '<div class="sh-top">',
           "  <h1>%s</h1>" % sp(("The Recording Studio", "El estudio de grabación")),
           '  <p class="sh-tag">%s</p>' % sp(("Play · Record · Listen · Mix · Send it out", "Toca · Graba · Escucha · Mezcla · Compártela")),
           '  <a class="sh-own" id="own" href="/drum-machine" target="_blank"><span class="long">%s</span><span class="short">%s</span></a>' % (sp(("Open this room in its own tab ↗", "Abrir esta sala en su propia pestaña ↗")), sp(("Own tab ↗", "Otra pestaña ↗"))),
           "</div>",
           '<nav class="sh-doors" aria-label="Rooms"><ul>']
    for rid, href, f, pic, name, short, frm, shelf in ROOMS:
        out.append('  <li><a href="#%s" data-room="%s"><span class="pic" aria-hidden="true"><picture><source type="image/webp" srcset="/img/banners/%s-pencil-900.webp">'
                   '<img src="/img/banners/%s-pencil-900.jpg" alt="" width="900" height="315" decoding="async"></picture></span>%s</a></li>'
                   % (rid, rid, pic, pic, sp(short)))
    out += ["</ul></nav>",
            '<main><iframe class="sh-room" id="room" title="The Drum Machine" allow="autoplay; fullscreen; clipboard-write"></iframe></main>',
            '<section class="mt" id="mt" aria-label="The studio">'
            '<div class="tp" role="group" aria-label="Transport"><button type="button" class="tp-b tp-rec" id="tpRec" aria-pressed="false"></button>'
            '<button type="button" class="tp-b tp-add" id="tpAdd" hidden></button><button type="button" class="tp-b" id="tpListen"></button>'
            '<a class="tp-b tp-mix" id="tpMix" href="#studio" data-room="studio"></a><button type="button" class="tp-b tp-out" id="tpOut"></button>'
            '<span class="tp-line" id="tpLine" aria-live="polite"></span></div>'
            '<div class="mtrow"><h2 id="mtH">%s</h2><select id="mtAdd"></select><ul id="mtList"></ul></div></section>' % sp(("My Track", "Mi pista")),
            "</div>"]
    rooms = [{"id": r[0], "href": r[1], "file": r[2], "name": list(r[4]), "from": r[6], "shelf": r[7]} for r in ROOMS]
    layers = [{"id": l[0], "name": list(l[1])} for l in LAYERS]
    js = JS.replace("__ROOMS__", json.dumps(rooms, ensure_ascii=False)).replace("__LAYERS__", json.dumps(layers, ensure_ascii=False))
    page = head + "</head>\n<body>\n<script src=\"/aog-grace.js\" defer></script>\n" + "\n".join(out) + "\n" + js + "\n<script src=\"/aog-topbar.js\"></script>\n</body>\n</html>\n"
    open(os.path.join(ROOT, "the-studio.html"), "w", encoding="utf-8").write(page)
    print("the-studio.html written")
if __name__ == "__main__":
    build()
