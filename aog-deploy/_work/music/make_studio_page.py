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
    changes the room here instead of opening a page inside the page. A link to a room's own address (/drum-machine,
    /bass …) opens the Studio in that room, so nothing that links to a room breaks;
  - My Track along the bottom: one mark per layer. A layer is there when that room has a take in the Mixing Desk's
    list ("studioinbox") or a recording on its shelf (aog-handoff.js); visiting a room marks nothing (§06).
  - AOG-STUDIO-ONLY-V1 (Jimmy, 2026-10-10): "one location for all the instruments … and that is the studio. Have two
    designs and layouts seems sort of silly." A room opened on its own address (/piano, music-piano.html, an old link)
    comes into the Studio, in that room (each room's head script, ?at=). The "own tab" link is gone. Two Studio tabs
    still hear each other (aog-handoff.js, BroadcastChannel "aog-music").
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
          ("bass", ("Bass", "Bajo")), ("band", ("Band", "Banda")), ("decks", ("Turntables", "Tocadiscos")), ("voice", ("Voice", "Voz")),
          ("liveguitar", ("Live guitar", "Guitarra en vivo")), ("livebass", ("Live bass", "Bajo en vivo"))]   # AOG-LIVEINPUT-V1: the one in your hands
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
/* AOG-OVERDUB-V1: record over My Track */
.tp-over[aria-pressed="true"] { border-color:#c9a24b; box-shadow:inset 0 0 0 1px #c9a24b; }
.tp-from { min-height:44px; max-width:11rem; font:700 16px/1.2 var(--sans); color:#0A1E33; background:#FFFDF8; border:1.5px solid #C9A24A; border-radius:12px; padding:0 .6rem; cursor:pointer; }
.song-from[hidden] { display:none; }
.song-from { display:flex; flex-wrap:wrap; align-items:center; gap:.4rem; font-weight:700; color:var(--ink); }
.tp-from:focus-visible { outline:3px solid #c9a24b; outline-offset:2px; }
/* AOG-SONG-V1: the song's tempo and key, one tap from every room */
.tp-song { border-color:#c9a24b; flex:0 0 auto; }
.song-box { display:grid; gap:.55rem; padding:.7rem .8rem; border:1px solid var(--line); border-radius:14px; background:var(--card); color:var(--ink); }
.song-box[hidden] { display:none; }
.song-box h2 { margin:0; font:800 1rem/1.2 var(--sans) !important; letter-spacing:0 !important; color:var(--ink); }
.song-box p { margin:0; color:var(--muted); font-size:.92rem; }
.song-row { display:flex; flex-wrap:wrap; align-items:center; gap:.5rem .7rem; }
.song-row label { font-weight:700; color:var(--ink); }
.song-row input, .song-row select { min-height:44px; font:700 16px/1.2 var(--sans); color:#0A1E33; background:#FFFDF8; border:1.5px solid #C9A24A; border-radius:10px; padding:0 .6rem; }
.song-row input { width:5.2rem; text-align:center; }
.song-b { min-height:44px; min-width:44px; padding:0 .8rem; border-radius:10px; border:1px solid var(--line); background:var(--bg); color:var(--ink); font:800 .95rem/1 var(--sans); cursor:pointer; }
.song-b[aria-pressed="true"] { border:2px solid #c9a24b; }
.song-lat { display:grid; gap:.35rem; border-top:1px solid var(--line); padding-top:.55rem; }
.song-lat h3 { margin:0; font:800 .95rem/1.2 var(--sans) !important; letter-spacing:0 !important; color:var(--ink); }
.song-lat p { margin:0; }
.song-lat .song-b { justify-self:start; }
#latLine { color:var(--ink); font-weight:700; }
#latLine:empty { display:none; }
.song-b:focus-visible, .song-row input:focus-visible, .song-row select:focus-visible { outline:3px solid #c9a24b; outline-offset:2px; }
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
/* AOG-STUDIO-ROOMY-V1 (Jimmy, 2026-10-09, on his iPad: "With the two even three bars the user loses a huge portion of the
   screen"). The name, the doors and Own tab share one slim line; on an iPad or a computer the transport and My Track share
   one bar; a message from the transport floats just above it instead of adding a line. The tag line is said by the transport
   itself, so it is kept for screen readers only. A phone keeps the name on its own slim line, the doors under it. */
.sh-tag { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; margin:0; }
.sh-top { flex-wrap:nowrap; align-items:center; gap:.75rem; padding:.3rem 0; }
.sh-top h1 { flex:0 0 auto; font-size:1.2rem; white-space:nowrap; }
.sh-top .sh-doors { flex:1 1 auto; min-width:0; }
.sh-doors ul { padding:2px; }
.sh-doors a { padding:2px 10px 2px 2px; font-size:.86rem; }
.sh-doors .pic { width:42px; height:32px; }
@media (min-width:1100px) { .sh-doors ul { grid-auto-flow:column; grid-template-columns:none; overflow-x:auto; } .sh-doors a { white-space:nowrap; } }
.sh-own { flex:0 0 auto; white-space:nowrap; }
.sh-own .long { display:none; }
.sh-own .short { display:inline; }
.tp-line { position:absolute; left:0; bottom:100%; margin:0 0 6px; max-width:min(38rem, 100%); padding:.45rem .8rem; border-radius:10px;
  background:var(--card); color:var(--ink); border:1px solid var(--line); box-shadow:0 4px 12px rgba(0,0,0,.14); }
.tp-line:empty { display:none; }
@media (min-width:700px) {
  .mt { display:flex; align-items:center; gap:.75rem; }
  .tp { flex:0 0 auto; flex-wrap:nowrap; }
  .mtrow { flex:1 1 auto; min-width:0; border-left:1px solid var(--line); padding-left:.75rem; }
}
/* AOG-SONG-V1: an iPad held upright has not the width for both: My Track takes its own line under the transport, so
   nothing (the Song button, + Add a layer) runs off the right edge */
@media (min-width:700px) and (max-width:1199px) { #mtAdd { max-width:9.6rem; } }   /* an iPad: room left for My Track's marks */
@media (min-width:700px) and (max-width:1023px) {
  .mt { flex-wrap:wrap; row-gap:.35rem; }
  .mtrow { flex:1 1 100%; border-left:0 !important; box-shadow:none !important; padding-left:0; }
}
@media (max-width:699px) {
  .sh-top { flex-wrap:wrap; row-gap:.15rem; }
  .sh-top h1 { flex:1 1 auto; }
  .sh-top .sh-doors { order:3; flex:1 1 100%; }
}
/* AOG-STUDIO-ART-V1 (Jimmy, 2026-10-09: "THE CEILING IS MUCH MUCH higher in the quality of artistry and details"). The
   Studio's bar is a strip of the same console as the Mixing Desk: a fine grain, buttons like hardware with their own lights,
   My Track's layers named on cream scribble strips, a message on a small paper slip. Dark in light and dark themes alike. */
.sh-top h1 { font-family:"Fraunces", var(--display); font-weight:500; font-size:1.32rem; letter-spacing:-.005em; }
.mt { margin:0 -.35rem; padding:.55rem .7rem max(.55rem, env(safe-area-inset-bottom)); border-radius:16px 16px 0 0; border:1px solid #040405; border-bottom:0;
  background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .055 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>"), linear-gradient(180deg,#26282c 0%,#17181b 70%,#121316 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.09), 0 -8px 22px -10px rgba(40,28,8,.45); }
.tp-b { border:1px solid #050506; border-radius:8px; background:linear-gradient(#36383d,#25262a 60%,#1e1f22); color:#efe6d2;
  font:600 .95rem/1.1 "Fraunces", var(--serif, Georgia, serif); letter-spacing:.01em;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.13), 0 2px 0 #08090a, 0 3px 7px rgba(0,0,0,.5); }
.tp-b:active { transform:translateY(1px); box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 1px 0 #08090a; }
.tp-rec { background:linear-gradient(#4a2620,#331a16 60%,#2a1512); color:#ffd9cf; }
.tp-rec[aria-pressed="true"] { background:linear-gradient(#7a2a1c,#561b12); color:#fff3ee; box-shadow:inset 0 1px 0 rgba(255,255,255,.13), 0 2px 0 #08090a, 0 0 14px rgba(255,90,60,.45); }
.tp-add { background:linear-gradient(#f6e3ad,#e0b85e 60%,#c99a3e); color:#2a1c06; border-color:#5e4512; }
.tp-out { background:linear-gradient(#e9c271,#cf9f45 60%,#b58630); color:#241703; border-color:#5e4512; }
.mt a.tp-b { min-height:44px; padding:0 .95rem; gap:.35rem; border:1px solid #050506; border-radius:8px; background:linear-gradient(#36383d,#25262a 60%,#1e1f22);
  color:#efe6d2; font:600 .95rem/1.1 "Fraunces", var(--serif, Georgia, serif); white-space:nowrap; }
.tp-back { color:#efe6d2; }
.tp-line { background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='.6' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .2  0 0 0 .09 0'/></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>"), linear-gradient(#fbf6ea,#f3ead6); color:#1f1a12; border:0; border-radius:2px;
  font:italic 400 .98rem/1.3 "Fraunces", var(--serif, Georgia, serif); box-shadow:0 6px 14px rgba(40,28,8,.28), 0 1px 1px rgba(0,0,0,.15); transform:rotate(-.5deg); background-color:#f7f0e1; }
#mtH { color:#c2b8a3 !important; text-shadow:0 -1px 0 rgba(0,0,0,.85); }
.mt select { background:#1b1c20; color:#f3d38e; border:1px solid #4b4130; border-radius:8px; font-family:"Fraunces", var(--serif, Georgia, serif); font-weight:500;
  box-shadow:inset 0 1px 3px rgba(0,0,0,.7); }
.mt select option { color:#0A1E33; background:#FFFDF8; }
@media (min-width:700px) { .mtrow { border-left-color:#050506 !important; box-shadow:inset 1px 0 0 rgba(255,255,255,.05); } }
.mt .lay { min-height:44px; gap:.4rem; padding:0 .7rem; border:0; border-radius:2px; background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='.6' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .2  0 0 0 .09 0'/></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>"), linear-gradient(#ece3cf,#dfd3b9); color:#3b3326;
  font:italic 500 .92rem/1 "Fraunces", var(--serif, Georgia, serif); box-shadow:0 1px 2px rgba(0,0,0,.55); background-color:#e6dcc5; }
.mt li:nth-child(odd) .lay { transform:rotate(-.6deg); }
.mt li:nth-child(even) .lay { transform:rotate(.5deg); }
.mt .lay .mk { font:700 .8rem/1 var(--sans); color:#5e5544; }
.mt .lay:not(.on) { background-color:#d2c7ad; background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='.6' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .2  0 0 0 .09 0'/></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>"), linear-gradient(#d8cdb3,#cbbfa3); color:#3d3527; }
.mt .lay.on { opacity:1; background-color:#f6ecd2; background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='.6' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .2  0 0 0 .09 0'/></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>"), linear-gradient(#fbf3dc,#f0e2bf); color:#1f1a12; }
.mt .lay.on .mk { color:#1d6b3f; }
.mt .lay.on::before { content:""; width:7px; height:7px; border-radius:50%; background:radial-gradient(circle at 35% 30%,#fff 0,#3fbf6f 45%); box-shadow:0 0 6px #3fbf6f; }
:root[data-theme="dark"] .mt .on { border-color:transparent; }
:root[data-theme="dark"] .mt .on .mk { color:#1d6b3f; }
.mt .lay { background-color:#e6dcc5; } .mt .lay:not(.on) { background-color:#d2c7ad; } .mt .lay.on { background-color:#f6ecd2; }   /* the paper's own colour, under its grain */
.mt ul { padding:4px 2px; }
@media (max-width:699px) { .mt { margin:0 -.5rem; padding:.45rem .55rem max(.45rem, env(safe-area-inset-bottom)); border-radius:14px 14px 0 0; } .mt a.tp-b { padding:0 .55rem; font-size:.88rem; } }
@media print { .sh-doors, .mt, .sh-room { display:none; } }
/* ══ AOG-STUDIO-ROOM-V1 (Jimmy, 2026-10-09: "DO all three") — the Recording Studio is a control room: dim and warm, a
   lamp's glow from above, faint acoustic slats on the walls. The doors hang like framed drawings; the room you are in is a
   lit window; the transport sits on the dark desk below. The same in light and dark. Nothing moves. ══ */
html, html[data-theme="dark"] { background:#17110c; }
html:root:root body { --room:#17110c; background-color:#17110c !important;
  background-image:radial-gradient(ellipse 80% 38% at 50% -6%, rgba(255,196,122,.20), rgba(255,196,122,0) 70%),
    repeating-linear-gradient(90deg, rgba(255,232,200,.022) 0 1px, rgba(0,0,0,0) 1px 6px, rgba(0,0,0,.10) 6px 7px, rgba(0,0,0,0) 7px 72px),
    linear-gradient(#221a13, #150f0b 60%, #120d09) !important;
  background-attachment:fixed; color:#efe5cf; }
.sh-top h1 { color:#f6e9cc; text-shadow:0 1px 0 rgba(0,0,0,.6); }
.sh-tag { color:#cdbfa3; }
.sh-own { color:#f0c26e; }
/* AOG-STUDIO-APP-V1 (Jimmy, 2026-10-10: "In the studio we should get rid of the AOG top bar menu. Allow a back button"):
   the site bar steps aside (its code stays, so the saved language, theme and reading settings still apply); the Studio's
   own line carries Back and EN | ES. Back leaves the Studio: to the page you came from, or the front page when the
   Studio was opened from its Home Screen icon. */
.aogtop, .aogtop-spacer { display:none !important; }
.sh-back { flex:0 0 auto; display:inline-flex; align-items:center; gap:.3rem; min-height:44px; padding:0 .8rem 0 .55rem; border-radius:999px;
  border:1px solid rgba(240,194,110,.55); background:rgba(0,0,0,.28); color:#f6e9cc; font:700 1rem/1 var(--sans); cursor:pointer; }
.sh-back:hover { background:rgba(240,194,110,.14); }
.sh-lang { flex:0 0 auto; display:inline-flex; gap:2px; padding:3px; border-radius:999px; border:1px solid rgba(240,194,110,.4); background:rgba(0,0,0,.28); }
.sh-lang button { min-height:38px; min-width:44px; padding:0 .7rem; border:0; border-radius:999px; background:transparent; color:#e6d8bb; font:700 .9rem/1 var(--sans); cursor:pointer; }
.sh-lang button[aria-pressed="true"] { background:#f0c26e; color:#1d1608; }
.sh-back:focus-visible, .sh-lang button:focus-visible { outline:3px solid #f0c26e; outline-offset:2px; }
@media (max-width:699px) { .sh-back { padding:0 .6rem 0 .4rem; } .sh-lang button { min-width:40px; padding:0 .5rem; } }
.sh-doors a { background-color:#f1e8d5; color:#1f1a12; border-color:#3a2c1c; box-shadow:0 1px 0 rgba(255,236,200,.08), 0 6px 14px rgba(0,0,0,.45); }
.sh-doors a[aria-current="true"] { border-color:#e0b25a; box-shadow:0 0 0 1px #e0b25a, 0 0 18px rgba(240,194,110,.35), 0 6px 14px rgba(0,0,0,.45); }
.sh-room { background:#17110c; border:1px solid #050403; box-shadow:0 0 0 1px rgba(255,214,160,.06), 0 24px 60px rgba(0,0,0,.65), 0 2px 8px rgba(0,0,0,.5); }
.mt { background:#120d09; box-shadow:0 -1px 0 rgba(255,214,160,.08), 0 -12px 28px rgba(0,0,0,.55); }
.tp-vu { display:inline-flex; flex:0 0 auto; align-items:center; gap:.5rem; }
.tp-vu[hidden] { display:none; }
@media (max-width:699px) { .tp-vu { display:none !important; } }   /* a phone's bar has no room for them; the room's own page shows them */
"""
JS = r"""<script src="/aog-vu.js"></script><script src="/aog-handoff.js"></script>
<script>
/* AOG-STUDIO-SHELL-V1 — the doors change the room; My Track marks what each room has sent (see make_studio_page.py) */
(function () {
  "use strict";
  var D = document, ROOMS = __ROOMS__, LAYERS = __LAYERS__;
  var fr = D.getElementById("room"), cur = "", KEY = "aog.studio.room";
  function es() { return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  function room(id) { for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return ROOMS[i]; return null; }
  /* AOG-STUDIO-ONLY-V1 (Jimmy, 2026-10-10: "one location for all the instruments … and that is the studio"): a room
     opened on its own address comes here as ?at=/music-piano.html#lessons (its head script). The frame opens that exact
     address once, so a lesson, a take or a locker link still lands, and the address bar goes back to /the-studio#room. */
  var AT = null;
  try {
    var at = new URLSearchParams(location.search).get("at");
    if (at) {
      var u = new URL(at, location.href);
      for (var i = 0; i < ROOMS.length; i++) if (u.origin === location.origin && u.pathname === "/" + ROOMS[i].file) AT = { id: ROOMS[i].id, url: u.pathname + u.search + u.hash };
      history.replaceState(null, "", location.pathname + (AT ? "#" + AT.id : location.hash));
    }
  } catch (e) { AT = null; }
  function first() {
    if (AT) return AT.id;
    var h = (location.hash || "").slice(1); if (room(h)) return h;
    try { var s = localStorage.getItem(KEY); if (room(s)) return s; } catch (e) {}
    return "pads";
  }
  var steps = 0;   /* rooms walked through inside the Studio, so Back can leave it in one tap */
  /* AOG-STUDIO-KEEP-V1 (2026-10-11) — Jimmy: "make SURE IT IS the fastest it can be! SUPER MAN SPEED!" A room used to be
     thrown away at every door and built again from nothing on the way back (its page read, its scripts run, its sounds
     made ready: two or three seconds on a phone). Now the last rooms you were in stay open, out of sight, so going back
     is at once and the room is just as you left it. A room out of sight is silent (AOGVU.hush), and wakes as if you had
     come back to it (its own "focus", so it picks up what the other rooms sent while you were away). Three stay open
     (two on a phone, kind to its memory); the one used longest ago closes. */
  var LIVE = {}, RECENT = [], KEEP = Math.min(screen.width || 0, screen.height || 0) < 600 ? 2 : 3;
  function hush(f, on) {
    try { var w = f.contentWindow; if (!w) return;
      if (w.AOGVU && w.AOGVU.hush) w.AOGVU.hush(on);
      else if (w.__aogStudio && w.__aogStudio.AC) {
        try { w.dispatchEvent(new w.CustomEvent("aog-hush", { detail: { on: !!on } })); } catch (e) {}   /* AOG-SILENT-V1 */   /* the Mixing Desk has its own meters, and its own player */
        var ac = w.__aogStudio.AC;
        if (on && ac.state === "running") { ac.suspend(); f.__hushed = true; } else if (!on && f.__hushed) { f.__hushed = false; ac.resume(); }
      }
    } catch (e) {}
  }
  function drop(id) { var f = LIVE[id]; delete LIVE[id]; if (f && f !== fr && f.parentNode) f.parentNode.removeChild(f); }
  /* AOG-STUDIO-KEEP-TAKES-V1 (2026-10-11) — Jimmy: "Do the fixes first." Closing a room used to throw away a take you had
     not added to My Track yet. A room is closed only when nothing in it can be lost: it is not recording, and its takes
     are kept on the device (aog-recorder.js, AOG-REC-KEEP-V1) or already on My Track. A room that cannot say stays open. */
  function safe(id) {
    var f = LIVE[id], R = null; if (!f) return true;
    if (f.__rendering) return false;   /* AOG-NOTES-V1: playing notes for the desk */
    try { R = f.contentWindow && f.contentWindow.AOGStudioRec; } catch (e) { return true; }
    if (!R) return true;
    try {
      if ((R.on && R.on()) || (R.busy && R.busy())) return false;
      if (R.kept) return !!R.kept();
      var l = R.last && R.last(); return !l || !!(R.sent && R.sent());
    } catch (e) { return false; }
  }
  function trim() {
    for (var i = 0; RECENT.length > KEEP && i < RECENT.length;) {
      var id = RECENT[i]; if (id !== cur && safe(id)) { RECENT.splice(i, 1); drop(id); } else i++;
    }
  }
  /* a room left while it records ends the take first (it keeps it), then goes quiet */
  function leave(f) {
    var R = null; try { R = f.contentWindow && f.contentWindow.AOGStudioRec; } catch (e) {}
    if (!R || !R.on || !R.on()) { hush(f, true); return; }
    try { R.toggle(); } catch (e) {}
    var t0 = Date.now(), k = setInterval(function () {
      var done = true; try { done = !R.on() && !(R.busy && R.busy()); } catch (e) {}
      if (done || Date.now() - t0 > 4000) { clearInterval(k); if (f !== fr) hush(f, true); trim(); refresh(); }
    }, 120);
  }
  /* a room kept from before, now in another language or light: it opens again, as it would have */
  function stale(f) {
    try { var d = f.contentDocument.documentElement, h = D.documentElement;
      return (d.getAttribute("lang") || "en").slice(0, 2) !== (h.getAttribute("lang") || "en").slice(0, 2) || (d.getAttribute("data-theme") || "light") !== (h.getAttribute("data-theme") || "light");
    } catch (e) { return false; }
  }
  /* AOG-STUDIO-WARM-V1 (2026-10-11) — Jimmy: "LIGHTING BOLT SPEED!" Once the Studio has been still for a few seconds,
     the rooms not visited yet are fetched quietly, one file at a time with a pause between: each room's page and its
     code (not its sounds, which are large, and nothing is run). The site's helper (sw.js) keeps them, so the first time
     a door is opened nothing has to come over the network. Never on a phone saving data or on a slow connection. */
  var WARM = {}, warmT = 0;
  function warmSoon() { clearTimeout(warmT); warmT = setTimeout(warm, 5000); }
  function warm() {
    var c = navigator.connection; if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ""))) return;
    var next = ROOMS.filter(function (r) { return !WARM[r.id] && !LIVE[r.id]; })[0]; if (!next) return;
    WARM[next.id] = 1;
    var get = function (u) { return fetch(u, { priority: "low", credentials: "same-origin" }); };
    get("/" + next.file).then(function (res) { return res.ok ? res.text() : ""; }).then(function (html) {
      var urls = [], m, re = /<(?:script[^>]*\ssrc|link[^>]*rel="stylesheet"[^>]*\shref)="([^"]+)"/g;
      while ((m = re.exec(html))) { var u = m[1]; if (!/^(https?:)?\/\//.test(u)) urls.push(new URL(u, location.origin + "/").pathname + (u.split("?")[1] ? "?" + u.split("?")[1] : "")); }
      var i = 0, step = function () { if (i >= urls.length) { warmSoon(); return; } get(urls[i++]).then(function (x) { return x.blob(); }, function () {}).then(function () { setTimeout(step, 150); }); };
      step();
    }, function () {});
  }
  function go(id, push) {
    var r = room(id); if (!r) return;
    if (id === cur && fr.getAttribute("src")) return;
    if (push) steps++;
    TP.back = id === "studio" ? (cur && cur !== "studio" ? cur : TP.back) : "";   /* AOG-STUDIO-LISTEN-V1: the way back from the desk */
    cur = id;
    try { localStorage.setItem(KEY, id); } catch (e) {}
    if (location.hash !== "#" + id) { try { history[push ? "pushState" : "replaceState"](null, "", "#" + id); } catch (e) { location.hash = id; } }
    /* a new frame's first page adds no step of its own to Back, so Back still leaves the Studio in one tap */
    var url = "/" + r.file;
    if (AT && AT.id === id) { url = AT.url; drop(id); } AT = null;   /* a link to a place inside the room opens it there */
    var keep = LIVE[id];
    if (fr.getAttribute("src")) leave(fr);
    if (keep) fr = keep;
    else if (!fr.getAttribute("src")) { fr.setAttribute("data-file", "/" + r.file); fr.src = url; LIVE[id] = fr; }
    else { var n = fr.cloneNode(false); n.removeAttribute("id"); n.removeAttribute("src"); n.setAttribute("data-file", "/" + r.file);
      fr.parentNode.appendChild(n); n.src = url; fr = n; LIVE[id] = n; }
    for (var k in LIVE) LIVE[k].style.display = LIVE[k] === fr ? "" : "none";
    /* the room in sight is always #room (anything that looks for the room finds the one you are in) */
    [].forEach.call(D.querySelectorAll("iframe.sh-room"), function (f) { if (f !== fr && f.id === "room") f.removeAttribute("id"); }); fr.id = "room";
    RECENT = RECENT.filter(function (x) { return x !== id; }); RECENT.push(id);
    trim();
    if (keep) {
      if (stale(fr)) { try { fr.contentWindow.location.reload(); } catch (e) {} }
      else { hush(fr, false); try { fr.contentWindow.dispatchEvent(new Event("focus")); } catch (e) {} }
    }
    size(); paint(); warmSoon();
  }
  function paint() {
    var r = room(cur), e = es(); if (!r) return;
    var vb = D.getElementById("tpVu"); if (vb) vb.hidden = cur === "studio";   /* AOG-ROOM-VU-V1: the desk has its own, large */
    var rk = D.querySelector("#tpVu .aogroom"); if (rk) rk.hidden = cur === "decks";
    TP.line = ""; if (typeof paintTp === "function") try { paintTp(); } catch (err) {}
    var name = e ? r.name[1] : r.name[0];
    fr.title = name;
    D.title = (e ? "El estudio de grabación · " : "The Recording Studio · ") + name + " — Architecture of Grace";
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
      var l = LAYERS[i], R = room(l.id), live = /^live/.test(l.id), from = R ? R.from : live ? l.id.slice(4) : l.id, shelf = R ? R.shelf : "";
      /* a take from the real instrument (aog-liveinput.js, "live") marks Live guitar or Live bass, not the on-screen one */
      var got = items.some(function (x) { return x && x.from === from && x.sec > 0 && !!x.live === live; });
      /* Voice: the take on the Mixing Desk's track 8 (AOG-STUDIO-VOICE-V1), read from the desk's own save */
      if (l.id === "voice") { try { var sg = JSON.parse(localStorage.getItem("aog.studio.v1") || "null"), v = sg && sg.tracks && sg.tracks[7] && sg.tracks[7].clip; got = !!(v && v.voice); } catch (e) { got = false; } }
      if (!got && shelf) { try { var s = await A.get(shelf); got = !!(s && s.wav && s.wav.size > 44); } catch (e) {} }
      next[l.id] = got;
    }
    HAVE = next; paintTrack();
  }
  /* ── AOG-STUDIO-TRANSPORT-V1: the transport drives the room you are in ── */
  var TP = { t0: 0, want: "", line: "", back: "", fill: {} };
  function recOf() { try { return fr.contentWindow && fr.contentWindow.AOGStudioRec || null; } catch (e) { return null; } }
  function deskOf() { try { var w = fr.contentWindow; return cur === "studio" && w && w.__aogStudio ? w : null; } catch (e) { return null; } }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function say(k) { TP.line = k; paintTp(); }
  var TPW = {
    rec: ["● Record", "● Grabar"], stop: ["■ Stop", "■ Parar"], add: ["+ Add to My Track", "+ Añadir a mi pista"],
    listen: ["▶ Listen", "▶ Escuchar"], listenStop: ["■ Stop listening", "■ Dejar de escuchar"], mix: ["Mix ›", "Mezclar ›"], out: ["Send it out", "Compártela"],
    added: ["Added to My Track.", "Añadida a mi pista."], noRec: ["Pick a room to record in.", "Elige una sala para grabar."],
    empty: ["Nothing to hear yet. Record in a room, then press + Add to My Track.", "Todavía no hay nada que escuchar. Graba en una sala y luego pulsa + Añadir a mi pista."],
    tap: ["Tap anywhere on the desk to hear it.", "Toca en cualquier parte de la mesa para oírla."],
    /* AOG-LISTEN-FULL-V1 */
    full: ["Not playing, because the seven tracks are full: {names}. To hear one, put it on a track at the Mixing Desk.", "No suenan, porque las siete pistas están llenas: {names}. Para oír una, ponla en una pista de la mesa de mezclas."],
    /* AOG-SONG-V1 */
    song: ["♩ Song", "♩ Canción"], songH: ["The song", "La canción"],
    songSay: ["Every room plays at this tempo and in this key.", "Cada sala toca a este tempo y en esta tonalidad."],
    songNone: ["Not set yet. Your first take sets it, or set it here.", "Todavía sin elegir. Tu primera toma lo elige, o elígelo aquí."],
    songBpmL: ["Tempo (beats a minute)", "Tempo (pulsos por minuto)"], songKeyL: ["Key", "Tonalidad"],
    songMaj: ["Major", "Mayor"], songMin: ["Minor", "Menor"], songDone: ["Done", "Listo"],
    /* AOG-LATENCY-V1 */
    latH: ["Timing check", "Prueba de tiempo"],
    latSay: ["So your voice and a real guitar land in time. Turn the sound up, take off headphones, then press Check. You will hear six clicks.",
      "Para que tu voz y una guitarra de verdad entren a tiempo. Sube el sonido, quítate los audífonos y pulsa Probar. Oirás seis clics."],
    latGo: ["Check", "Probar"], latAgain: ["Check again", "Probar otra vez"], latOn: ["Listening…", "Escuchando…"],
    latDone: ["This device takes {n} ms to play a sound and hear it back. Takes are moved that much, so they line up.",
      "Este aparato tarda {n} ms en tocar un sonido y oírlo de vuelta. Las tomas se mueven eso, para que entren a tiempo."],
    latUnclear: ["The clicks were not heard clearly. Turn the sound up, keep it quiet around you, and try again.",
      "No se oyeron bien los clics. Sube el sonido, que haya silencio alrededor, y vuelve a intentarlo."],
    latNoMic: ["The microphone is off. Allow it for this site in your browser's settings, then try again.",
      "El micrófono está apagado. Permítelo para este sitio en los ajustes del navegador y vuelve a intentarlo."],
    /* AOG-OVERDUB-V1 */
    overH: ["When you record", "Al grabar"], fromL: ["My Track starts", "Mi pista empieza"],
    over: ["♫ Play My Track while I record: On", "♫ Tocar mi pista mientras grabo: Sí"], overOff: ["♫ Play My Track while I record: Off", "♫ Tocar mi pista mientras grabo: No"],
    overAria: ["Play My Track while I record", "Tocar mi pista mientras grabo"],
    fromStart: ["From the start", "Desde el principio"], fromBar: ["From bar {n}", "Desde el compás {n}"],
    fromAria: ["Where My Track starts when you record", "Dónde empieza mi pista al grabar"],
    /* AOG-ADD-LAYER-TAKE-V1 */
    layered: ["Your {room} take is on My Track.", "Tu toma de {room} está en mi pista."],
    fail: ["That did not work. Try again.", "No funcionó. Inténtalo otra vez."]
  };
  function tw(k) { var x = TPW[k][es() ? 1 : 0]; for (var f in TP.fill) x = x.split("{" + f + "}").join(TP.fill[f]); return x; }
  /* the name of a layer as My Track says it, from the desk's name for it ("drums" is the Drum Kit, "bass:live" the live bass) */
  function layerName(k) {
    var over = /:over$/.test(k); k = k.replace(/:over$/, "");   /* AOG-OVERDUB-V1: a take played over the song */
    var id = { drums: "kit", "guitar:live": "liveguitar", "bass:live": "livebass" }[k] || k, l = LAYERS.filter(function (x) { return x.id === id; })[0];
    return (l ? l.name[es() ? 1 : 0] : k) + (over ? (es() ? " (sobre la canción)" : " (over the song)") : "");
  }
  function att(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }   /* AOG-STUDIO-SMOOTH-V1: only what changed */
  function paintTp() {
    var R = recOf(), on = !!(R && R.on()), rb = D.getElementById("tpRec"), ab = D.getElementById("tpAdd"), lb = D.getElementById("tpListen");
    if (on && !TP.t0) TP.t0 = Date.now(); if (!on) TP.t0 = 0;
    var rt = on ? tw("stop") + " " + clock((Date.now() - TP.t0) / 1000) : tw("rec");
    if (rb.textContent !== rt) rb.textContent = rt;
    att(rb, "aria-pressed", on ? "true" : "false");
    var dis = !R || !!(R.busy && R.busy()); if (rb.disabled !== dis) rb.disabled = dis;
    var last = R && !on ? R.last() : null, showAdd = !!(last && !R.sent());
    if (ab.hidden !== !showAdd) ab.hidden = !showAdd; if (ab.textContent !== tw("add")) ab.textContent = tw("add");
    var w = deskOf(), playing = !!(w && w.__aogStudio.PLAY.on), lt = playing ? tw("listenStop") : tw("listen");
    if (lb.textContent !== lt) lb.textContent = lt;
    /* AOG-STUDIO-SMOOTH-V1: this runs four times a second, so it writes only what changed (a write makes the page lay out again) */
    try { songWords(); } catch (err) {}
    [["tpMix", "mix"], ["tpOut", "out"]].forEach(function (p) { var b = D.getElementById(p[0]), t = tw(p[1]); if (b.textContent !== t) b.textContent = t; });
    /* AOG-STUDIO-LISTEN-V1: at the desk, Mix › has nowhere to go; the way back to your room takes its place */
    var bk = D.getElementById("tpBack"), br = cur === "studio" && TP.back ? room(TP.back) : null;
    var mx = D.getElementById("tpMix"); if (mx.hidden !== (cur === "studio")) mx.hidden = cur === "studio"; if (bk.hidden !== !br) bk.hidden = !br;
    if (br) { var bn = es() ? br.short[1] : br.short[0], bt = "‹ " + bn; if (bk.textContent !== bt) bk.textContent = bt;
      att(bk, "aria-label", (es() ? "Volver a: " : "Back to the ") + bn); }
    if (TP.line === "tap" && w && w.__aogStudio.AC && w.__aogStudio.AC.state === "running") TP.line = "";
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
  /* AOG-STUDIO-LISTEN-V1 (STUDIO-HANDOFF §12b): ▶ Listen plays My Track. The takes in My Track that are on no track yet
     go on the desk's empty tracks by themselves (listenFill), so make something, press Listen, hear it; ‹ takes you back. */
  D.getElementById("tpListen").addEventListener("click", function () {
    TP.line = "";
    var w0 = deskOf();
    if (w0 && w0.__aogStudio.PLAY.on) { w0.__aogStudio.stop(); paintTp(); return; }
    /* still inside the tap: wake the desk's sound now, as an iPhone wants */
    try { var a0 = w0 && w0.__aogStudio.AC; if (a0 && a0.state !== "running") a0.resume(); } catch (e) {}
    atDesk(async function (w) {
      var st = w.__aogStudio;
      if (st.PLAY.on) return;
      try { if (st.listenFill) await st.listenFill(); } catch (e) {}
      if (!st.SONG.tracks.some(function (x) { return x.clip; })) { say("empty"); return; }
      st.play(); paintTp();
      var left = (st.listenLeft || []).map(layerName);
      if (left.length) { TP.fill = { names: left.join(", ") }; say("full"); }
      /* a desk opened by Listen may not have its sound yet (iPhone): one tap on it brings it */
      setTimeout(function () { var c = st.AC; if (st.PLAY.on && c && c.state !== "running") say("tap"); }, 500);
    });
  });
  D.getElementById("tpBack").addEventListener("click", function () { var b = TP.back; if (room(b)) go(b, true); });
  /* AOG-OVERDUB-V1 (2026-10-11) — Jimmy's "1": "Record over your song. In any room, press Record and hear My Track playing
     while you play. The new take lands on the right bar." ♫ With My Track (on unless turned off, remembered on this device)
     and From (the bar My Track starts at) sit beside Record. The room's recorder (aog-recorder.js) asks backing(): the
     Mixing Desk, opened out of sight if it is not open, puts My Track together and hands it over (music-studio.html,
     backing()). */
  var OVK = "aog.overdub.v1";
  function overGet() { try { var o = JSON.parse(localStorage.getItem(OVK) || "null") || {}; return { on: o.on !== false, from: o.from >= 1 ? Math.round(o.from) : 1 }; } catch (e) { return { on: true, from: 1 }; } }
  function overSet(p) { var o = overGet(), k; for (k in p) o[k] = p[k]; try { localStorage.setItem(OVK, JSON.stringify(o)); } catch (e) {} paintOver(); }
  function paintOver() {
    var o = overGet(), b = D.getElementById("tpOver"), sel = D.getElementById("tpFrom"), lang = es() ? "es" : "en";
    var bt = o.on ? tw("over") : tw("overOff"); if (b.textContent !== bt) b.textContent = bt;
    att(b, "aria-pressed", o.on ? "true" : "false"); att(b, "aria-label", tw("overAria"));
    [["overH", "overH"], ["fromL", "fromL"]].forEach(function (p) { var el = D.getElementById(p[0]), x = tw(p[1]); if (el.textContent !== x) el.textContent = x; });
    var lab = sel.parentNode; if (lab.hidden !== !o.on) lab.hidden = !o.on;
    if (sel.getAttribute("data-lang") !== lang) {
      var h = '<option value="1">' + tw("fromStart") + "</option>";
      for (var n = 5; n <= 125; n += 4) h += '<option value="' + n + '">' + tw("fromBar").split("{n}").join(n) + "</option>";
      sel.innerHTML = h; sel.setAttribute("data-lang", lang); att(sel, "aria-label", tw("fromAria"));
    }
    if (sel.value !== String(o.from)) sel.value = String(o.from);
  }
  D.getElementById("tpOver").addEventListener("click", function () { overSet({ on: !overGet().on }); });
  D.getElementById("tpFrom").addEventListener("change", function () { overSet({ from: +this.value || 1 }); });
  /* the desk, kept open out of sight if it was not open, so it can put My Track together */
  function deskFrame() {
    if (LIVE.studio) return LIVE.studio;
    var n = fr.cloneNode(false); n.removeAttribute("id"); n.removeAttribute("src"); n.setAttribute("data-file", "/music-studio.html"); n.style.display = "none";
    n.__new = Date.now(); fr.parentNode.appendChild(n); n.src = "/music-studio.html"; LIVE.studio = n; RECENT.unshift("studio");
    return n;
  }
  function backing() {
    var f = deskFrame();
    return new Promise(function (ok, no) {
      var t0 = Date.now(), k = setInterval(function () {
        var w = null; try { w = f.contentWindow; } catch (e) {}
        var ready = w && w.__aogStudio && w.document.readyState === "complete" && !w.__aogStudio.S.decoding && (!f.__new || Date.now() - f.__new > 700);
        if (ready) { clearInterval(k); f.__new = 0; Promise.resolve(w.__aogStudio.backing()).then(ok, no); }
        else if (Date.now() - t0 > 20000) { clearInterval(k); no(new Error("no desk")); }
      }, 120);
    });
  }
  /* AOG-NOTES-V1 (2026-10-11) — Jimmy: "fix a wrong note, change an instrument after recording, or tighten the timing."
     The Mixing Desk's piano-roll (aog-pianoroll.js) plays edited notes through the room they were played in: the room is
     opened out of sight if it is not open (as the desk is for My Track), and its AOGRoomRender makes the sound offline.
     A room busy with that is never closed to make space. */
  function roomFrame(id) {
    var r = room(id); if (!r || id === "studio") return null;
    if (LIVE[id]) return LIVE[id];
    var n = fr.cloneNode(false); n.removeAttribute("id"); n.removeAttribute("src"); n.setAttribute("data-file", "/" + r.file); n.style.display = "none";
    n.__new = Date.now(); fr.parentNode.appendChild(n); n.src = "/" + r.file; LIVE[id] = n; RECENT.unshift(id);
    return n;
  }
  function withRoom(id, fn) {
    var f = roomFrame(id); if (!f) return Promise.reject(new Error("no room"));
    f.__rendering = (f.__rendering || 0) + 1;
    var done = function () { f.__rendering = Math.max(0, (f.__rendering || 1) - 1); trim(); };
    return new Promise(function (ok, no) {
      var t0 = Date.now(), k = setInterval(function () {
        var w = null; try { w = f.contentWindow; } catch (e) {}
        var ready = w && w.AOGRoomRender && w.document.readyState === "complete" && (!f.__new || Date.now() - f.__new > 700);
        if (ready) { clearInterval(k); f.__new = 0; Promise.resolve().then(function () { return fn(w.AOGRoomRender); }).then(ok, no); }
        else if (Date.now() - t0 > 30000) { clearInterval(k); no(new Error("no room")); }
      }, 120);
    }).then(function (r) { done(); return r; }, function (e) { done(); throw e; });
  }
  function renderNotes(id, payload) { return withRoom(id, function (R) { return R.render(payload); }); }
  function roomSounds(id) { return withRoom(id, function (R) { return R.sounds(); }); }
  /* AOG-SONG-V1 (2026-10-11) — Jimmy: "One tempo and key for the song. Set them once in the Studio, and every room opens
     there." ♩ Song opens a small panel: the tempo (− / a number / +) and the key (a home note, Major or Minor). Every room
     follows at once (aog-song.js); a room's own tempo or key changes it too. */
  function songWords() {
    var G = window.AOGSong, s = G && G.get(), b = D.getElementById("tpSong"), nm = G ? G.name(es() ? "es" : "en") : "";
    var narrow = (window.innerWidth || 0) < 1200, sg = G && G.get();   /* a phone or an iPad: the short way, so My Track keeps its room */
    var bt = narrow ? "♩" + (sg && sg.hasBpm ? " " + sg.bpm : "") : tw("song") + (nm ? " · " + nm : ""); if (b.textContent !== bt) b.textContent = bt;
    att(b, "aria-label", tw("song").replace("♩ ", "") + (nm ? ": " + nm : ""));
    [["songH", "songH"], ["songBpmL", "songBpmL"], ["songKeyL", "songKeyL"], ["songMaj", "songMaj"], ["songMin", "songMin"], ["songDone", "songDone"]].forEach(function (p) {
      var el = D.getElementById(p[0]), x = tw(p[1]); if (el.textContent !== x) el.textContent = x; });
    var say = D.getElementById("songSay"), st = s && s.hasBpm ? tw("songSay") : tw("songNone"); if (say.textContent !== st) say.textContent = st;
    if (D.getElementById("songBox").hidden) return;   /* this runs four times a second: the rest only while the panel is open */
    latWords(); paintOver();
    var inp = D.getElementById("songBpm"), iv = s && s.hasBpm ? String(s.bpm) : ""; if (D.activeElement !== inp && inp.value !== iv) inp.value = iv;
    if (inp.placeholder !== "100") inp.placeholder = "100";
    var ks = D.getElementById("songKey"), names = G ? G.NOTES[es() ? "es" : "en"] : [];
    if (ks.options.length !== 12 || ks.getAttribute("data-lang") !== (es() ? "es" : "en")) {
      ks.innerHTML = names.map(function (n, i) { return '<option value="' + i + '">' + n + "</option>"; }).join(""); ks.setAttribute("data-lang", es() ? "es" : "en"); }
    var kv = String(s && s.hasKey ? s.key : 0); if (ks.value !== kv) ks.value = kv;
    att(D.getElementById("songMaj"), "aria-pressed", s && s.hasKey && !s.minor ? "true" : "false");
    att(D.getElementById("songMin"), "aria-pressed", s && s.hasKey && s.minor ? "true" : "false");
  }
  /* AOG-LATENCY-V1 (2026-10-11) — Jimmy's "3": the Timing check, in the Song panel (aog-latency.js) */
  var LAT = { busy: false, msg: "" };
  function latWords() {
    var m = window.AOGLatency && AOGLatency.get();
    [["latH", "latH"], ["latSay", "latSay"]].forEach(function (p) { var el = D.getElementById(p[0]), x = tw(p[1]); if (el.textContent !== x) el.textContent = x; });
    var g = D.getElementById("latGo"), gt = LAT.busy ? tw("latOn") : m ? tw("latAgain") : tw("latGo"); if (g.textContent !== gt) g.textContent = gt; if (g.disabled !== LAT.busy) g.disabled = LAT.busy;
    var ln = LAT.msg ? tw(LAT.msg) : m ? tw("latDone").split("{n}").join(Math.round(m.rt * 1000)) : "";
    var el = D.getElementById("latLine"); if (el.textContent !== ln) el.textContent = ln;
  }
  D.getElementById("latGo").addEventListener("click", function () {
    if (!window.AOGLatency || LAT.busy) return;
    LAT.busy = true; LAT.msg = ""; latWords();
    AOGLatency.measure().then(function () { LAT.msg = ""; }, function (e) { LAT.msg = e && e.code === "nomic" ? "latNoMic" : "latUnclear"; })
      .then(function () { LAT.busy = false; latWords(); });
  });
  function songSet(p) { if (window.AOGSong) AOGSong.set(p); songWords(); }
  function songOpen(on) { var bx = D.getElementById("songBox"); bx.hidden = !on; D.getElementById("tpSong").setAttribute("aria-expanded", on ? "true" : "false"); songWords(); size();
    if (on) D.getElementById("songBpm").focus(); }
  D.getElementById("tpSong").addEventListener("click", function () { songOpen(D.getElementById("songBox").hidden); });
  D.getElementById("songDone").addEventListener("click", function () { songOpen(false); D.getElementById("tpSong").focus(); });
  D.getElementById("songBpm").addEventListener("change", function () { var v = +this.value; if (v > 0) songSet({ bpm: v }); });
  D.getElementById("songDn").addEventListener("click", function () { var s = AOGSong.get(); songSet({ bpm: (s && s.hasBpm ? s.bpm : 100) - 1 }); });
  D.getElementById("songUp").addEventListener("click", function () { var s = AOGSong.get(); songSet({ bpm: (s && s.hasBpm ? s.bpm : 100) + 1 }); });
  D.getElementById("songKey").addEventListener("change", function () { var s = AOGSong.get(); songSet({ key: +this.value, minor: !!(s && s.minor) }); });
  D.getElementById("songMaj").addEventListener("click", function () { songSet({ key: +D.getElementById("songKey").value, minor: false }); });
  D.getElementById("songMin").addEventListener("click", function () { songSet({ key: +D.getElementById("songKey").value, minor: true }); });
  D.getElementById("songBox").addEventListener("keydown", function (e) { if (e.key === "Escape") { songOpen(false); D.getElementById("tpSong").focus(); } });
  if (window.AOGSong) AOGSong.on(songWords);
  /* AOG-ROOM-VU-V1: the small VU meters show the room you are in (its own page's levels), and anything the shell plays */
  if (window.AOGVU) AOGVU.mount(D.getElementById("tpVu"), { source: function () {
    var a = null, b = null; try { var w = fr.contentWindow; a = w && w.AOGVU ? w.AOGVU.levels() : null; } catch (e) {}
    try { b = AOGVU.levels(); } catch (e) {}
    return a && b ? [Math.max(a[0], b[0]), Math.max(a[1], b[1])] : a || b; } });
  /* AOG-STUDIO-ROOM-SOUND-V1: the room knob, shared with every instrument room (the turntables and the desk stay dry) */
  var roomKnob = window.AOGRoom ? AOGRoom.knob(D.getElementById("tpVu")) : null;
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
  /* AOG-STUDIO-KEYS-V1 (Jimmy, 2026-10-09: "At the moment nothing works with the keyboard"). Inside the Studio a tap on a
     door or on the transport leaves the keyboard with the Studio, not with the room in the frame, so no key reached any
     instrument. Now every key goes on to the room, as if the room had been tapped: the room's own keys decide what it
     plays. What stays with the Studio: typing in a box or a menu, Tab to move around, and Space or Enter on one of the
     Studio's own buttons. */
  function keyOn(e) {
    /* AOG-DESK-HANDS-V1: at the Mixing Desk, Undo and Redo (Ctrl/⌘+Z, Ctrl/⌘+Shift+Z, Ctrl+Y) and Alt+← → (a 10 ms nudge) go on to it too */
    if (e.metaKey || e.ctrlKey || e.altKey) {
      var deskKey = cur === "studio" && (((e.metaKey || e.ctrlKey) && !e.altKey && /^[zy]$/i.test(e.key)) || (e.altKey && !e.metaKey && !e.ctrlKey && /^Arrow(Left|Right)$/.test(e.key)));
      if (!deskKey) return;
    }
    var t = e.target, tag = t && t.tagName;
    /* AOG-STRING-TAB-V1: Tab goes on to the room only when nothing in the Studio has the keyboard (the guitar and the bass
       pick a string with it); on one of the Studio's own buttons it moves to the next, as always */
    if (e.key === "Tab" && t && t !== D.body && t !== D.documentElement) return;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || (t && t.isContentEditable)) return;
    if ((e.key === " " || e.key === "Enter") && t && t.closest && t.closest("button, summary, select" + (e.key === "Enter" ? ", a" : ""))) return;
    var w, d; try { w = fr.contentWindow; d = fr.contentDocument; } catch (err) { return; }
    if (!w || !d || !d.body) return;
    var KE = w.KeyboardEvent || KeyboardEvent;
    var ev = new KE(e.type, { key: e.key, code: e.code, repeat: e.repeat, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, bubbles: true, cancelable: true });
    d.body.dispatchEvent(ev);
    if (ev.defaultPrevented) e.preventDefault();
  }
  /* a menu of the Studio (+ Add a layer) lets go of the keyboard once a choice is made, so the next key plays the room */
  D.addEventListener("change", function (e) { var t = e.target; if (t && t.tagName === "SELECT") setTimeout(function () { if (D.activeElement === t) t.blur(); }, 0); }, true);
  D.addEventListener("keydown", keyOn);
  D.addEventListener("keyup", keyOn);
  window.AOGStudioShell = {
    go: function (id) { go(id, true); },
    backing: backing, over: overGet,   /* AOG-OVERDUB-V1 */
    renderNotes: renderNotes, roomSounds: roomSounds,   /* AOG-NOTES-V1 */
    arrived: function (id, w) { if (w && fr.contentWindow !== w) return;   /* AOG-STUDIO-KEEP-V1: a room out of sight never takes the screen */
      if (room(id) && id !== cur) {
        /* the room in sight opened another room in its own frame: the frame is now kept under that room's name */
        for (var k in LIVE) if (LIVE[k] === fr) delete LIVE[k];
        if (LIVE[id]) drop(id);
        LIVE[id] = fr; fr.setAttribute("data-file", "/" + room(id).file);
        RECENT = RECENT.filter(function (x) { return x !== cur && x !== id; }); RECENT.push(id);
        TP.back = id === "studio" ? (cur !== "studio" ? cur : TP.back) : ""; cur = id; try { history.replaceState(null, "", "#" + id); } catch (e) {} paint(); }
      size(); }
  };
  D.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-room]"); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); go(a.getAttribute("data-room"), true);
  });
  /* AOG-ADD-LAYER-TAKE-V1 (2026-10-11, STUDIO-HANDOFF §06: "Add a layer sends the current take … then returns the student
     to the project"): + Add a layer first puts the take you just made in this room on My Track (a take still recording is
     ended first), then opens the room you picked for the next layer. A take already on My Track is not sent twice. */
  function addCurrent() {
    var R = recOf(); if (!R) return Promise.resolve(false);
    var wait = new Promise(function (ok) {
      if (!R.on()) { ok(); return; }
      R.toggle(); var t0 = Date.now(), k = setInterval(function () { if ((!R.on() && !(R.busy && R.busy())) || Date.now() - t0 > 4000) { clearInterval(k); ok(); } }, 120);
    });
    return wait.then(function () {
      var l = R.last && R.last(); if (!l || R.sent()) return false;
      return Promise.resolve(R.add()).then(function () { return !!R.sent(); }, function () { return false; });
    });
  }
  D.getElementById("mtAdd").addEventListener("change", function () {
    var v = this.value, from = room(cur), sel = this; this.value = ""; if (!v) return;
    sel.disabled = true;
    addCurrent().then(function (added) {
      sel.disabled = false; go(v, true);
      if (added && from) { TP.fill = { room: es() ? from.short[1] : from.short[0] }; say("layered"); refresh(); }
    });
  });
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
  window.addEventListener("storage", function (e) { if (!e.key || e.key === "aog.studio.v1") refresh(); });
  window.addEventListener("resize", size);
  go(first(), false);
  size(); refresh();
  /* AOG-STUDIO-APP-V1: Back leaves the Studio; EN | ES works the site's own language switch (in the hidden bar) */
  window.addEventListener("popstate", function () { if (steps > 0) steps--; });
  D.getElementById("shBack").addEventListener("click", function () {
    var same = false; try { same = !!D.referrer && new URL(D.referrer).origin === location.origin && new URL(D.referrer).pathname !== location.pathname; } catch (e) {}
    if (same && history.length > steps + 1) history.go(-(steps + 1)); else location.href = "/";
  });
  function paintLang() { var l = es() ? "es" : "en";
    [].forEach.call(D.querySelectorAll(".sh-lang button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lang") === l ? "true" : "false"); }); }
  [].forEach.call(D.querySelectorAll(".sh-lang button"), function (b) { b.addEventListener("click", function () {
    var v = b.getAttribute("data-lang"), sw = D.getElementById(v === "es" ? "aogLangEs" : "aogLangEn");
    if (sw) sw.click(); else { try { localStorage.setItem("aog.lang", v); } catch (e) {} location.reload(); } }); });
  paintLang();
  try { new MutationObserver(paintLang).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
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
    # AOG-STUDIO-APP-V1 (Jimmy, 2026-10-10: "I also want a direct link … I don't like how I have to go through the main
    # door"): the Studio is its own Home Screen app. Its icon opens /the-studio, full screen, any way up.
    head = re.sub(r'<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#14110d">', head, count=1)
    head += ('<link rel="manifest" href="/studio.webmanifest">\n<link rel="apple-touch-icon" href="/studio-touch-icon.png">\n'
             '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
             '<meta name="apple-mobile-web-app-title" content="Studio">\n<meta name="apple-mobile-web-app-status-bar-style" content="black">\n')
    out = ['<div class="shell">',
           '<div class="sh-top">',
           '  <button type="button" class="sh-back" id="shBack"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>%s</button>' % sp(("Back", "Atrás")),
           "  <h1>%s</h1>" % sp(("The Recording Studio", "El estudio de grabación")),
           '  <p class="sh-tag">%s</p>' % sp(("Play · Record · Listen · Mix · Send it out", "Toca · Graba · Escucha · Mezcla · Compártela")),
           '<nav class="sh-doors" aria-label="Rooms"><ul>']
    for rid, href, f, pic, name, short, frm, shelf in ROOMS:
        out.append('  <li><a href="#%s" data-room="%s"><span class="pic" aria-hidden="true"><picture><source type="image/webp" srcset="/img/banners/%s-pencil-900.webp">'
                   '<img src="/img/banners/%s-pencil-900.jpg" alt="" width="900" height="315" decoding="async"></picture></span>%s</a></li>'
                   % (rid, rid, pic, pic, sp(short)))
    out += ["</ul></nav>",
            '  <div class="sh-lang" role="group" aria-label="Language · Idioma"><button type="button" data-lang="en" lang="en">EN</button><button type="button" data-lang="es" lang="es">ES</button></div>',
            "</div>",
            '<main><iframe class="sh-room" id="room" title="The Drum Machine" allow="autoplay; fullscreen; clipboard-write; microphone"></iframe></main>',
            '<section class="mt" id="mt" aria-label="The studio">'
            '<div class="song-box" id="songBox" hidden role="group" aria-labelledby="songH"><h2 id="songH"></h2><p id="songSay"></p>'
            '<div class="song-row"><label for="songBpm" id="songBpmL"></label><button type="button" class="song-b" id="songDn" aria-label="−1">−</button>'
            '<input id="songBpm" type="number" inputmode="numeric" min="40" max="240" step="1"><button type="button" class="song-b" id="songUp" aria-label="+1">+</button></div>'
            '<div class="song-row"><label for="songKey" id="songKeyL"></label><select id="songKey"></select>'
            '<button type="button" class="song-b" id="songMaj" aria-pressed="false"></button><button type="button" class="song-b" id="songMin" aria-pressed="false"></button>'
            '<button type="button" class="song-b" id="songDone"></button></div>'
            '<div class="song-row song-lat"><h3 id="overH"></h3><button type="button" class="song-b tp-over" id="tpOver" aria-pressed="true"></button>'
            '<label class="song-from"><span id="fromL"></span> <select class="tp-from" id="tpFrom"></select></label></div>'   # AOG-OVERDUB-V1
            '<div class="song-row song-lat"><h3 id="latH"></h3><p id="latSay"></p><button type="button" class="song-b" id="latGo"></button><p id="latLine" aria-live="polite"></p></div></div>'   # AOG-LATENCY-V1
            '<div class="tp" role="group" aria-label="Transport"><button type="button" class="tp-b tp-rec" id="tpRec" aria-pressed="false"></button>'
            '<button type="button" class="tp-b tp-add" id="tpAdd" hidden></button><button type="button" class="tp-b" id="tpListen"></button>'
            '<a class="tp-b tp-mix" id="tpMix" href="#studio" data-room="studio"></a><button type="button" class="tp-b tp-back" id="tpBack" hidden></button>'
            '<button type="button" class="tp-b tp-out" id="tpOut"></button>'
            '<span class="tp-vu" id="tpVu"></span>'   # AOG-ROOM-VU-V1: the room's small VU meters
            '<span class="tp-line" id="tpLine" aria-live="polite"></span></div>'
            '<div class="mtrow"><h2 id="mtH">%s</h2>'
            '<button type="button" class="tp-b tp-song" id="tpSong" aria-expanded="false" aria-controls="songBox"></button>'   # AOG-SONG-V1: the song's tempo and key, beside My Track
            '<select id="mtAdd"></select><ul id="mtList"></ul></div></section>' % sp(("My Track", "Mi pista")),
            "</div>"]
    rooms = [{"id": r[0], "href": r[1], "file": r[2], "name": list(r[4]), "short": list(r[5]), "from": r[6], "shelf": r[7]} for r in ROOMS]
    layers = [{"id": l[0], "name": list(l[1])} for l in LAYERS]
    js = JS.replace("__ROOMS__", json.dumps(rooms, ensure_ascii=False)).replace("__LAYERS__", json.dumps(layers, ensure_ascii=False))
    # AOG-STUDIO-SW-V1 (2026-10-10, Jimmy: the Studio was "lagging … a horrific experience"): the Studio is its own Home
    # Screen app, so it starts the site's helper (sw.js) itself, as the front page does. Without it, a Studio opened only
    # from its icon fetched every shared script from the network on every room.
    SW_REG = ('<script>\n/* AOG-STUDIO-SW-V1: the site helper (sw.js) keeps the shared scripts on this device, so each room opens quickly */\n'
              'if ("serviceWorker" in navigator) window.addEventListener("load", function () {\n'
              '  navigator.serviceWorker.register("/sw.js").catch(function () {});\n'
              '});\n</script>\n')
    page = head + "</head>\n<body>\n<script src=\"/aog-grace.js\" defer></script>\n" + "\n".join(out) + "\n<script src=\"/aog-song.js\"></script>\n<script src=\"/aog-latency.js\"></script>\n" + js + "\n<script src=\"/aog-topbar.js\"></script>\n" + SW_REG + "</body>\n</html>\n"
    open(os.path.join(ROOT, "the-studio.html"), "w", encoding="utf-8").write(page)
    print("the-studio.html written")
if __name__ == "__main__":
    build()
