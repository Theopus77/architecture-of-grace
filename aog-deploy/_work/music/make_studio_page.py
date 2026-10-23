# -*- coding: utf-8 -*-
"""AOG-STUDIO-PAGE-V1 (2026-10-06) — the-studio.html: The Recording Studio, at /the-studio and /music.
AOG-STUDIO-TRANSPORT-V1 (2026-10-09) — Jimmy: "I want the studio to be the RECORDING STUDIO." It is called The Recording
Studio, and one transport runs along the bottom for whatever room you are in: ● Record (the room's own recorder, through
window.AOGStudioRec: aog-recorder.js, the Turntables), + Add to My Track once a take is made, ▶ Listen (My Track at the
Mixing Desk), Mix ›, Send it out (the Mixing Desk's). A phone turned sideways gives the room the whole screen.
AOG-STUDIO-SHELL-V1 (2026-10-09) — the Studio is one house (STUDIO-HANDOFF.md §04–§06, Jimmy's second pick).

The page is a frame, not a list of links:
  - the nine rooms as picture doors, in song order (CLAUDE.md, aog-labdoors.js);
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
AOG-STUDIO-SUPREME-V1 (2026-10-17): the frame is one control room in one order (the meter bridge, the doors, the room,
the desk); see the CSS below and STUDIO-HANDOFF.md §33. Test: music-handoff/tests/studio/supreme.js.
AOG-VOCAL-V1 (2026-10-23) — Jimmy: "a vocal studio to record our voice with various effects and eq … better than the SING OR
RAP icon door". The Vocal Booth (music-vocal.html, /vocal-booth) is the ninth door, just before the Mixing Desk, and the
Voice layer of My Track is its room. The red 🎤 Sing or rap key on the top line is gone (aog-micbooth.js is gone; the Vocal Booth, aog-vocal.js, took its place).
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
    ("vocal", "/vocal-booth", "music-vocal.html", "music-vocal", ("The Vocal Booth", "La cabina de voz"), ("Vocal Booth", "Cabina de voz"), "voice", ""),   # AOG-VOCAL-V1
    ("studio", "/mixing-desk", "music-studio.html", "music-mixdesk", ("The Mixing Desk", "La mesa de mezclas"), ("Mixing Desk", "Mesa de mezclas"), "", ""),
]
# My Track: the layers, in song order (STUDIO-HANDOFF §05). A layer whose id is not its room's names the room third:
# AOG-VOCAL-V1: Voice is the Vocal Booth's (its take is on the Mixing Desk's track 8).
LAYERS = [("pads", ("Drums", "Ritmos")), ("kit", ("Kit", "Batería")), ("piano", ("Piano", "Piano")), ("guitar", ("Guitar", "Guitarra")),
          ("bass", ("Bass", "Bajo")), ("band", ("Band", "Banda")), ("decks", ("Turntables", "Tocadiscos")), ("voice", ("Voice", "Voz"), "vocal"),
          ("liveguitar", ("Live guitar", "Guitarra en vivo")), ("livebass", ("Live bass", "Bajo en vivo"))]   # AOG-LIVEINPUT-V1: the one in your hands
def esc(t): return html.escape(t, quote=True)
def sp(pair): return '<span data-en="%s" data-es="%s">%s</span>' % (esc(pair[0]), esc(pair[1]), esc(pair[0]))
CSS = """
/* ══ AOG-STUDIO-SUPREME-V1 (2026-10-17) — Jimmy: "I want the 'presentation or the room' of the studio / mixing board to be
   supreme in its presentation and excellence in its structure and handling." The Recording Studio is one control room made
   of one set of parts, in one order, so you always know where you are:
     1. the meter bridge along the top: Back, the Studio's name, the room's meters and room sound, EN | ES;
     2. the nine doors, in song order, every one a single tap (three rows of three on a phone; one row of nine on an upright
        iPad; a column down the left on an iPad on its side and a computer, where the width is spare and the height is not).
        The room you are in is lit; the Mixing Desk stands a step apart, because it is the control room;
     3. the room's window, as large as the screen allows;
     4. the desk along the bottom: the transport, then My Track (the song's tempo and key, + Add a layer, the layers).
   Every control is the same kind of key; the drawings sit on paper inserts; the layers are paper scribble strips. Dark in
   both themes, as a real control room is. Nothing moves on its own, nothing glows. (Older looks: STUDIO-HANDOFF.md §33.) ══ */
body { zoom:1 !important; }
/* AOG-STEADY-ALL-V1: the site's floating My notes button sat over the room's instrument (a tap there played nothing and
   opened a drawer over the keys); the Studio has no reading of its own, so it has none */
.aog-mkbtn { display:none !important; }   /* full size: the rooms inside draw on canvases (CLAUDE.md, 85% rule) */
:root { --st-wall:#110d0a; --st-key:#2a251f; --st-key2:#1d1915; --st-edge:#050403; --st-ink:#f4ead6; --st-gold:#e2b55c;
  --st-paper:#f4ecdb; --st-paper-ink:#1f1a12; --st-key-font:700 .95rem/1.1 Inter, var(--sans); }
:root { --st-dim:#cdbfa3; }
html, html[data-theme="dark"] { background:#17110c; }
html:root:root body { --room:#17110c; background-color:#17110c !important; color:var(--st-ink);   /* the rooms' own colour: the frame and the room are one space */
  background-image:linear-gradient(180deg, #211a13 0, #17110c 160px) !important; background-attachment:fixed; }
.aogtop, .aogtop-spacer { display:none !important; }   /* AOG-STUDIO-APP-V1: the site bar steps aside (its code stays: language, theme) */
.sh-tag { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; margin:0; }   /* said by the transport itself */
.shell { max-width:1680px; margin:0 auto; padding:0 max(12px, env(safe-area-inset-right)) 0 max(12px, env(safe-area-inset-left));
  display:grid; grid-template-columns:minmax(0,1fr); grid-template-areas:"top" "doors" "room" "mt"; }

/* the keys: one shape for every control in the Studio */
.sh-back, .sh-lang, .tp-b, .mt a.tp-b, #mtAdd, .sh-doors a { -webkit-tap-highlight-color:transparent; }
.sh-back, .tp-b, .mt a.tp-b { min-height:44px; display:inline-flex; align-items:center; justify-content:center; gap:.4rem; padding:0 1rem; border-radius:9px;
  border:1px solid var(--st-edge); background:linear-gradient(#36302a, var(--st-key) 45%, var(--st-key2)); color:var(--st-ink); font:var(--st-key-font);
  letter-spacing:.005em; text-decoration:none; white-space:nowrap; cursor:pointer; touch-action:manipulation;
  box-shadow:inset 0 1px 0 rgba(255,240,215,.13), 0 2px 0 var(--st-edge), 0 3px 6px rgba(0,0,0,.35); }
.sh-back:active, .tp-b:active, .mt a.tp-b:active { transform:translateY(1px); box-shadow:inset 0 1px 0 rgba(255,240,215,.08), 0 1px 0 var(--st-edge); }
.tp-b:disabled { opacity:.6; cursor:default; }
.tp-b[hidden], .mt [hidden], .sh-top [hidden] { display:none !important; }
.sh-back:focus-visible, .sh-lang button:focus-visible, .tp-b:focus-visible, .sh-doors a:focus-visible, #mtAdd:focus-visible, .song-b:focus-visible,
.song-row input:focus-visible, .song-row select:focus-visible, .tp-from:focus-visible { outline:3px solid var(--st-gold); outline-offset:2px; }

/* 1 · the meter bridge */
.sh-top { grid-area:top; display:flex; align-items:center; gap:10px; min-height:54px; padding:5px 0; border-bottom:1px solid rgba(255,236,200,.07); }
.sh-back { flex:0 0 auto; padding:0 .85rem 0 .6rem; gap:.25rem; }
.sh-top h1 { flex:1 1 auto; min-width:0; margin:0; font:500 1.32rem/1.12 "Fraunces", var(--display) !important; letter-spacing:-.005em !important; color:var(--st-ink); }
.sh-bridge { flex:0 0 auto; display:flex; align-items:center; gap:10px; }
.tp-vu { display:inline-flex; flex:0 0 auto; align-items:center; gap:8px; }
.tp-vu[hidden] { display:none; }
.sh-lang { flex:0 0 auto; display:inline-flex; gap:2px; padding:2px; border-radius:10px; border:1px solid var(--st-edge); background:#0b0907;
  box-shadow:inset 0 1px 3px rgba(0,0,0,.8), 0 1px 0 rgba(255,236,200,.07); }
.sh-lang button { min-height:40px; min-width:46px; padding:0 .7rem; border:0; border-radius:8px; background:transparent; color:var(--st-dim); font:700 .92rem/1 Inter, var(--sans); cursor:pointer; }
.sh-lang button[aria-pressed="true"] { background:linear-gradient(#f0cf86,var(--st-gold)); color:#1d1608; }

/* AOG-QUICKSTART-V1: ✦ Start a song, a gold key on the top line (the sheet it opens: aog-quickstart.js) */
.sh-qs { flex:0 0 auto; min-height:44px; display:inline-flex; align-items:center; justify-content:center; padding:0 1rem; border-radius:9px; cursor:pointer;
  border:1px solid #5e4512; background:linear-gradient(#f6e2a8, #e6c06a 50%, #d2a548); color:#231704; font:800 .95rem/1.1 Inter, var(--sans);
  text-align:center; touch-action:manipulation; -webkit-tap-highlight-color:transparent; box-shadow:inset 0 1px 0 rgba(255,255,255,.5), 0 2px 0 var(--st-edge), 0 3px 6px rgba(0,0,0,.35); }
.sh-qs:active { transform:translateY(1px); box-shadow:inset 0 1px 0 rgba(255,255,255,.4), 0 1px 0 var(--st-edge); }
.sh-qs:focus-visible { outline:3px solid var(--st-gold); outline-offset:2px; }
/* the short name a phone shows (drawn by the page, so the heading still says the whole name: "Studio" is not read twice) */
.sh-top h1::after { content:none; }

/* 2 · the doors: dark keys, each with its drawing on a paper insert; the room you are in is lit */
.sh-doors { grid-area:doors; padding:8px 0; }
.sh-doors ul { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
.sh-doors li { min-width:0; display:flex; }
.sh-doors a { position:relative; flex:1 1 auto; min-width:0; display:flex; align-items:center; justify-content:center; gap:8px; min-height:44px; padding:4px 6px;
  border-radius:10px; border:1px solid var(--st-edge); background:linear-gradient(#302a24, #221d18); color:var(--st-ink); text-decoration:none; text-align:center;
  font:700 .86rem/1.15 Inter, var(--sans); box-shadow:inset 0 1px 0 rgba(255,240,215,.1), 0 2px 0 var(--st-edge); }
.sh-doors a > span:last-child { min-width:0; overflow-wrap:anywhere; hyphens:auto; }
.sh-doors .pic { display:none; flex:0 0 auto; border-radius:5px; overflow:hidden; background:#f3eee2; box-shadow:0 0 0 1px var(--st-edge), inset 0 0 0 1px rgba(0,0,0,.08); }
.sh-doors img { display:block; width:100%; height:100%; object-fit:cover; object-position:64% 50%; }
.sh-doors a[aria-current="true"] { background:linear-gradient(#fbf1d8, #efdcae); color:#1d1608; border-color:#7a5a1c;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.55), 0 0 0 2px var(--st-gold), 0 2px 0 var(--st-edge); }
.sh-doors a[aria-current="true"]::after { content:""; position:absolute; top:5px; right:5px; width:7px; height:7px; border-radius:50%;
  background:#c4452a; box-shadow:0 0 0 1px rgba(60,10,0,.5); }   /* the lamp over the door: you are here (a lamp, not a glow) */
.sh-doors li:last-child { position:relative; }

/* 3 · the room's window */
main.sh-main { grid-area:room; min-width:0; margin:0; }
.sh-room { display:block; width:100%; height:70vh; border:0; border-radius:12px; background:#17110c;
  box-shadow:0 0 0 1px var(--st-edge), 0 0 0 4px #2a241d, 0 0 0 5px var(--st-edge), 0 18px 40px rgba(0,0,0,.5); }

/* 4 · the desk: the transport, then My Track */
.mt { grid-area:mt; position:relative; z-index:5; margin:8px calc(-1 * max(12px, env(safe-area-inset-right))) 0 calc(-1 * max(12px, env(safe-area-inset-left)));
  padding:9px max(12px, env(safe-area-inset-right)) max(9px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  display:flex; flex-wrap:wrap; align-items:center; gap:8px 16px; background:linear-gradient(#29231d, #1b1713 55%, #15120f); border-top:1px solid var(--st-edge);
  box-shadow:inset 0 1px 0 rgba(255,236,200,.09); }
.tp { display:flex; align-items:center; gap:6px; flex:0 0 auto; }
.tp-rec { min-width:7.4rem; color:#ffe1d8; background:linear-gradient(#4d2a22, #3a1f19 45%, #2c1713); }
.tp-rec[aria-pressed="true"] { background:linear-gradient(#a8402a, #86301f); color:#fff6f2; border-color:#3b0d05; }
.tp-add { background:linear-gradient(#f6e2a8, #e6c06a 50%, #d2a548); color:#231704; border-color:#5e4512; }
.tp-out { color:#f3d48e; }
.tp-back { color:var(--st-ink); }
/* a message from the transport: a small paper slip just above the desk, not another line */
.tp-say { position:absolute; left:max(12px, env(safe-area-inset-left)); right:max(12px, env(safe-area-inset-right)); bottom:100%; margin:0 0 8px;
  display:flex; flex-wrap:wrap; align-items:center; gap:6px 8px; pointer-events:none; }
.tp-say > * { pointer-events:auto; }
.tp-line { max-width:min(38rem, 100%); padding:.5rem .85rem;
  border-radius:3px; background:var(--st-paper); color:var(--st-paper-ink); font:italic 500 1rem/1.3 "Fraunces", var(--serif, Georgia, serif);
  box-shadow:0 6px 16px rgba(0,0,0,.45), 0 1px 1px rgba(0,0,0,.2); }
.tp-line:empty { display:none; }
/* AOG-LISTENBACK-V1: ▶ Listen back, on My Track's sheet (in the bar on a wide screen), and as a link beside "Added to My Track." */
.tp-lb { color:#f3d48e; }
.tp-lbgo { min-height:44px; padding:0 .9rem; border-radius:3px; border:1px solid #b98f3e; background:var(--st-paper); color:var(--st-paper-ink); font:800 .95rem/1.1 Inter, var(--sans);
  cursor:pointer; touch-action:manipulation; box-shadow:0 6px 16px rgba(0,0,0,.45), 0 1px 1px rgba(0,0,0,.2); }
.tp-lbgo[hidden] { display:none; }
.tp-lbgo:focus-visible { outline:3px solid var(--st-gold); outline-offset:2px; }
@media (min-width:1100px) and (max-width:1279px) { .mtrow .tp-lb { padding:0 .7rem; } #mtAdd { flex-shrink:0; } }   /* an iPad on its side: + Add a layer keeps its words */
.mtrow { display:flex; align-items:center; gap:8px; flex:1 1 36rem; min-width:0; }
/* an ID, so the site's serif heading rule (aog-grace.css) leaves this small label alone */
#mtH { margin:0; flex:0 0 auto; font:800 .72rem/1.15 Inter, var(--sans) !important; letter-spacing:.14em !important; text-transform:uppercase; color:var(--st-dim) !important; }
.tp-song { flex:0 0 auto; color:#f3d48e; padding:0 .85rem; }
#mtAdd { flex:0 1 auto; min-height:44px; max-width:12rem; min-width:0; padding:0 .8rem; border-radius:9px; border:1px solid #4b4130; background:#0d0b09; color:#f3d48e;
  font:600 16px/1.2 Inter, var(--sans); box-shadow:inset 0 1px 3px rgba(0,0,0,.8), 0 1px 0 rgba(255,236,200,.07); cursor:pointer; }
#mtAdd option { color:#0A1E33; background:#FFFDF8; }
/* My Track: the layers, two rows of paper scribble strips; a layer with a take has its lamp on and a ✓ */
.mt ul { list-style:none; margin:0; padding:2px; flex:1 1 auto; min-width:0; display:grid; grid-auto-flow:column; grid-template-rows:repeat(2, 20px); grid-auto-columns:max-content; gap:4px 5px;
  overflow-x:auto; overscroll-behavior-x:contain; scrollbar-width:none; }
.mt ul.more { -webkit-mask-image:linear-gradient(90deg, #000 calc(100% - 26px), transparent); mask-image:linear-gradient(90deg, #000 calc(100% - 26px), transparent); }   /* more strips this way */
.mt ul::-webkit-scrollbar { display:none; }
.mt li { display:flex; min-width:0; }
.mt .lay { flex:1 1 auto; display:inline-flex; align-items:center; gap:.32rem; height:20px; padding:0 .5rem; border-radius:2px; white-space:nowrap;
  background:#d3c8b0; color:#2f2920; font:italic 500 .84rem/1 "Fraunces", var(--serif, Georgia, serif); box-shadow:0 1px 1px rgba(0,0,0,.5); }
.mt .lay::before { content:""; flex:0 0 auto; width:6px; height:6px; border-radius:50%; background:#6f675a; box-shadow:inset 0 1px 1px rgba(0,0,0,.5); }
.mt .lay .mk { font:800 .74rem/1 Inter, var(--sans); color:#1d6b3f; }
.mt .lay.on { background:var(--st-paper); color:var(--st-paper-ink); }
.mt .lay.on::before { background:#2f9e5c; box-shadow:0 0 0 1px rgba(10,50,25,.45); }

/* ♩ Song: a paper sheet over the room, just above the desk; Done, Escape or a tap outside closes it */
.song-box { position:fixed; z-index:40; right:max(12px, env(safe-area-inset-right)); bottom:calc(var(--st-mt, 120px) + 10px); width:min(30rem, calc(100vw - 24px));
  max-height:calc(100dvh - var(--st-mt, 120px) - 24px); overflow:auto; overscroll-behavior:contain;
  display:grid; gap:.6rem; padding:.85rem .95rem; border-radius:6px; background:var(--st-paper); color:var(--st-paper-ink); box-shadow:0 14px 36px rgba(0,0,0,.6), 0 0 0 1px var(--st-edge); }
.song-box[hidden] { display:none; }
.song-box h2 { margin:0; font:600 1.15rem/1.2 "Fraunces", var(--display) !important; letter-spacing:0 !important; color:var(--st-paper-ink); }
.song-box h3 { margin:0; font:800 .95rem/1.2 Inter, var(--sans) !important; letter-spacing:0 !important; color:var(--st-paper-ink); }
.song-box p { margin:0; color:#463c2c; font-size:.94rem; }
.song-row { display:flex; flex-wrap:wrap; align-items:center; gap:.5rem .6rem; }
.song-row label, .song-from { font-weight:700; color:var(--st-paper-ink); }
.song-row input, .song-row select, .tp-from { min-height:44px; font:700 16px/1.2 Inter, var(--sans); color:#0A1E33; background:#FFFDF8; border:1.5px solid #b98f3e; border-radius:9px; padding:0 .6rem; }
.song-row input { width:5.2rem; text-align:center; }
.tp-from { max-width:11rem; cursor:pointer; }
.song-from { display:flex; flex-wrap:wrap; align-items:center; gap:.4rem; }
.song-from[hidden] { display:none; }
.song-b { min-height:44px; min-width:44px; padding:0 .85rem; border-radius:9px; border:1px solid #b9a988; background:#fffaf0; color:var(--st-paper-ink); font:800 .95rem/1 Inter, var(--sans); cursor:pointer; }
.song-b[aria-pressed="true"] { background:#2a251f; color:#f4ead6; border-color:#2a251f; }
#songDone { margin-left:auto; background:#2a251f; color:#f4ead6; border-color:#2a251f; }
.song-lat { display:grid; gap:.4rem; border-top:1px solid #d9ccb2; padding-top:.6rem; }
.song-lat .song-b { justify-self:start; }
.tp-over[aria-pressed="true"] { background:#fffaf0; color:var(--st-paper-ink); border:2px solid #b98f3e; }
#latLine { color:var(--st-paper-ink); font-weight:700; }
#latLine:empty { display:none; }

/* the My Track key: on a phone and an upright iPad, My Track (the song, + Add a layer, the layers) waits one tap away, on a
   sheet just above the desk, so the room keeps the height (Jimmy: "too much scrolling"). Wider screens show it in the bar. */
.tp-mt { display:none; }
.tp-mt .n { display:inline-flex; align-items:center; justify-content:center; min-width:1.35rem; height:1.35rem; padding:0 .3rem; border-radius:999px;
  background:#2f9e5c; color:#04140a; font:800 .78rem/1 Inter, var(--sans); }
.tp-mt .n:empty { display:none; }
@media (max-width:1099px) {
  .tp-mt { display:inline-flex; margin-left:auto; }
  .tp-mt[aria-expanded="true"] { background:linear-gradient(#fbf1d8, #efdcae); color:#1d1608; border-color:#7a5a1c; }
  .mtrow { display:none; position:fixed; z-index:35; left:max(12px, env(safe-area-inset-left)); right:max(12px, env(safe-area-inset-right)); bottom:calc(var(--st-mt, 70px) + 8px);
    flex-wrap:wrap; align-items:center; gap:10px; padding:12px 12px 14px; border-radius:12px; border:1px solid var(--st-edge);
    background:linear-gradient(#2c261f, #1d1915); box-shadow:inset 0 1px 0 rgba(255,236,200,.09), 0 14px 36px rgba(0,0,0,.6); }
  .mt.mt-open .mtrow { display:flex; }
  #mtH { flex:1 1 100%; font-size:.8rem !important; }
  .mtrow .tp-lb { flex:1 1 100%; }   /* AOG-LISTENBACK-V1 */
  #mtAdd { flex:1 1 12rem; max-width:none; }
  .mt ul { flex:1 1 100%; grid-auto-flow:row; grid-template-rows:none; grid-template-columns:repeat(auto-fill, minmax(7.4rem, 1fr)); grid-auto-columns:auto; gap:6px; overflow:visible; }
  .mt ul.more { -webkit-mask-image:none; mask-image:none; }
  .mt .lay { height:30px; font-size:.95rem; padding:0 .6rem; }
}
/* a phone held upright: one slim top line, the doors in three rows of three, the transport in one row */
@media (max-width:699px) {
  .sh-top { min-height:50px; gap:8px; padding:3px 0; }
  .sh-top h1 { font-size:1.08rem !important; line-height:1.1; }
  .sh-back { padding:0 .7rem 0 .45rem; }
  .sh-lang button { min-width:42px; padding:0 .55rem; }
  /* AOG-QUICKSTART-V1: the short name, so ✦ Start a song fits on the line */
  .sh-full { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
  .sh-top h1::after { content:"Studio"; content:"Studio" / ""; }
  html[lang^="es"] .sh-top h1::after { content:"Estudio"; content:"Estudio" / ""; }
  .sh-qs { flex:0 1 auto; min-width:0; max-width:7.6rem; padding:0 .6rem; font-size:.86rem; white-space:normal; }
  .sh-top h1 { flex:1 0 auto; white-space:nowrap; }
  .sh-bridge { display:none; }   /* a phone has no room for the meters; the room keeps its own sound */
  .sh-doors { padding:5px 0 6px; }
  .sh-doors ul { gap:5px; }
  .sh-doors a { font-size:.84rem; padding:2px 5px; }
  .mt { gap:6px; margin-top:6px; padding-top:6px; padding-bottom:max(6px, env(safe-area-inset-bottom)); }
  .tp { flex:1 1 100%; }
  .tp { gap:5px; }
  .tp .tp-b, .mt .tp a.tp-b { flex:1 1 0; min-width:0; padding:0 .25rem; gap:.3rem; font-size:.85rem; letter-spacing:0; }
  .tp .tp-b, .mt .tp a.tp-b { white-space:normal; line-height:1.1; text-align:center; }   /* AOG-PLAY-ALONG-V1: five buttons share a phone's width; a long name takes two lines */
  .tp .tp-add { flex:1 1 100%; order:-1; }
  .tp-rec { min-width:0; }
  /* Mix › and ‹ back to a room say what the doors above already say: on a phone the doors do it */
  .mt .tp #tpMix, .mt .tp #tpBack { display:none !important; }
}
/* AOG-QUICKSTART-V1: a small phone (an iPhone SE, mini): a little less room round each key, so the line still holds them all */
@media (max-width:389px) {
  .sh-top { gap:6px; }
  .sh-back { padding:0 .55rem 0 .3rem; }
  .sh-lang button { min-width:38px; padding:0 .45rem; }
  .sh-qs { padding:0 .45rem; font-size:.8rem; }
}
/* an upright iPad: the doors in one row of nine, each with its drawing above its name; the desk in one row */
@media (min-width:700px) {
  .sh-doors ul { grid-template-columns:repeat(9,minmax(0,1fr)); }
  .sh-doors a { flex-direction:column; gap:3px; padding:4px 4px 5px; font-size:.8rem; }
  .sh-doors .pic { display:block; width:48px; height:32px; }
  .sh-doors li:last-child { margin-left:8px; }
  .sh-doors li:last-child::before { content:""; position:absolute; left:-8px; top:6px; bottom:6px; width:1px; background:rgba(255,236,200,.14); }
}
@media (min-width:700px) and (max-width:1099px) { .sh-doors { padding:6px 0 7px; } .mt { flex-wrap:nowrap; } .tp { flex:1 1 auto; } }
/* a wide screen that is short: one row of nine, each drawing beside its name */
@media (min-width:1100px) {
  .sh-doors a { flex-direction:row; justify-content:flex-start; gap:9px; padding:4px 10px 4px 4px; text-align:left; font-size:.88rem; }
  .sh-doors .pic { width:48px; height:36px; }
}
/* an iPad on its side and a computer: the doors down the left, the room beside them, the desk in one row */
@media (min-width:1100px) and (min-height:700px) {
  .shell { grid-template-columns:172px minmax(0,1fr); grid-template-areas:"top top" "doors room" "mt mt"; column-gap:14px; }
  .sh-doors { padding:7px 0 0; }
  .sh-doors ul { grid-template-columns:minmax(0,1fr); grid-auto-rows:minmax(54px, auto); gap:7px; }
  .sh-doors a { padding:5px 10px 5px 5px; font-size:.9rem; }
  .sh-doors .pic { width:60px; height:44px; }
  .sh-doors li:last-child { margin:10px 0 0; }
  .sh-doors li:last-child::before { left:6px; right:6px; top:-9px; bottom:auto; width:auto; height:1px; }
  main.sh-main { padding-top:7px; }
  .mt { flex-wrap:nowrap; }
  .mt ul { grid-template-rows:repeat(2, 22px); }
  .mt .lay { height:22px; font-size:.88rem; }
  .mtrow { padding-left:16px; border-left:1px solid var(--st-edge); box-shadow:inset 1px 0 0 rgba(255,236,200,.06); }
}
@media (min-width:1100px) and (min-height:700px) and (max-width:1279px) { .tp-b, .mt a.tp-b { padding:0 .75rem; } .tp-rec { min-width:6.6rem; } #mtAdd { max-width:10rem; } }
/* AOG-VOCAL-V1: a short wide screen (700–759 px high): nine doors down the left, each a little slimmer, so the column still fits beside the room */
@media (min-width:1100px) and (min-height:700px) and (max-height:759px) {
  .sh-doors ul { grid-auto-rows:minmax(48px, auto); gap:5px; }
  .sh-doors a { padding:3px 10px 3px 4px; }
  .sh-doors .pic { width:56px; height:40px; }
  .sh-doors li:last-child { margin-top:8px; }
  .sh-doors li:last-child::before { top:-7px; }
}
/* a phone on its side: the room gets the whole screen, as its own sideways play view expects (LANDSCAPE-HANDOFF.md) */
@media (orientation:landscape) and (max-height:500px) {
  .aogtop, .aogtop-spacer, .sh-top, .sh-doors, .mt { display:none !important; }
  .shell { padding:0; display:block; }
  main.sh-main { padding:0; }
  .sh-room { border:0; border-radius:0; box-shadow:none; }
}
/* a phone in Safari (the browser's own bars take the rest): a little less air above the room, so the room keeps most of the screen */
@media (max-width:699px) and (max-height:760px) {
  .sh-top { padding:1px 0 2px; row-gap:3px; }
  .sh-lang button { min-height:38px; }
  .sh-doors { padding:2px 0 3px; }
  .sh-doors ul { gap:3px; }
  .sh-doors a { padding:1px 5px; line-height:1.1; }
  .mt { margin-top:3px; padding-top:3px; padding-bottom:max(3px, env(safe-area-inset-bottom)); }
}
/* AOG-MISSIONS-V1 (2026-10-22): Missions · 3 of 12 (its sheet, the slip and the words: aog-missions.js). On a phone and an upright
   iPad it is the last key on My Track's sheet; on an iPad on its side and a computer My Track is in the bar, which is full, so the
   key sits on the top line instead, beside ✦ Start a song. One key on any screen. */
.tp-ms { color:#f3d48e; }
.sh-ms { display:none; }
@media (max-width:1099px) { .mtrow .tp-ms { flex:1 1 100%; } }
@media (min-width:1100px) {
  .mtrow .tp-ms { display:none !important; }
  .sh-ms { flex:0 0 auto; min-height:44px; display:inline-flex; align-items:center; justify-content:center; padding:0 1rem; border-radius:9px; cursor:pointer;
    border:1px solid var(--st-edge); background:linear-gradient(#36302a, var(--st-key) 45%, var(--st-key2)); color:#f3d48e; font:var(--st-key-font); white-space:nowrap;
    touch-action:manipulation; -webkit-tap-highlight-color:transparent; box-shadow:inset 0 1px 0 rgba(255,240,215,.13), 0 2px 0 var(--st-edge), 0 3px 6px rgba(0,0,0,.35); }
  .sh-ms:active { transform:translateY(1px); }
  .sh-ms:focus-visible { outline:3px solid var(--st-gold); outline-offset:2px; }
}
/* an iPad on its side: the key takes two short lines, and in Spanish the name is the short one (as on a phone), so the line holds */
@media (min-width:1100px) and (max-width:1279px) {
  .sh-ms { flex-direction:column; padding:0 .7rem; line-height:1.1; text-align:center; }
  .sh-ms .d { display:none; }
  html[lang^="es"] .sh-full { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
  html[lang^="es"] .sh-top h1::after { content:"Estudio"; content:"Estudio" / ""; }
}
@media print { .sh-doors, .mt, .sh-room, .sh-bridge, .sh-lang, .sh-back { display:none; } }
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
  function lroom(l) { return room(l.room || l.id); }   /* AOG-VOCAL-V1: a layer's room (Voice is the Vocal Booth's) */
  /* AOG-STUDIO-ONLY-V1 (Jimmy, 2026-10-10: "one location for all the instruments … and that is the studio"): a room
     opened on its own address comes here as ?at=/music-piano.html#lessons (its head script). The frame opens that exact
     address once, so a lesson, a take or a locker link still lands, and the address bar goes back to /the-studio#room. */
  var AT = null;
  /* AOG-SHARE-V1 (2026-10-22): a beat a friend sent (/the-studio?beat=…): read once, and the address bar goes back to
     /the-studio#pads, so a reload never loads it over what was made since. aog-share.js cleans it and opens it (below). */
  var BEAT = null;
  try {
    var bq = new URLSearchParams(location.search).get("beat");
    if (bq !== null) { BEAT = bq.slice(0, 20000); history.replaceState(null, "", location.pathname + "#pads"); }
  } catch (e) { BEAT = null; }
  try {
    var at = BEAT !== null ? null : new URLSearchParams(location.search).get("at");
    if (at) {
      var u = new URL(at, location.href);
      for (var i = 0; i < ROOMS.length; i++) if (u.origin === location.origin && u.pathname === "/" + ROOMS[i].file) AT = { id: ROOMS[i].id, url: u.pathname + u.search + u.hash };
      history.replaceState(null, "", location.pathname + (AT ? "#" + AT.id : location.hash));
    }
  } catch (e) { AT = null; }
  function first() {
    if (BEAT !== null) return "pads";   /* AOG-SHARE-V1 */
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
  /* AOG-STEADY-V1 (2026-10-13) — Jimmy: "after 5 notes, it seems to hit a glitch". "Still" was only the Studio's own
     doors: five seconds after a room opened, the fetching began while the room was being played. Now it waits until no
     sound has started in any room, and nothing was touched, for five seconds (AOGVU.still), and each file waits again,
     in a quiet moment. */
  var WARM = {}, warmT = 0;
  function calm(fn, own) {
    var V = window.AOGVU;
    if (V && V.still && !V.still(5000)) { var t = setTimeout(function () { calm(fn, own); }, 1500); if (own) warmT = t; return; }
    /* AOG-STEADY-ALL-V1: and still once the quiet moment comes (it can come two seconds later, when playing has begun) */
    if (window.requestIdleCallback) requestIdleCallback(function () { if (V && V.still && !V.still(5000)) calm(fn, own); else fn(); }, { timeout: 2000 }); else fn();
  }
  function warmSoon() { clearTimeout(warmT); warmT = setTimeout(function () { calm(warm, true); }, 5000); }
  function warm() {
    var c = navigator.connection; if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ""))) return;
    var next = ROOMS.filter(function (r) { return !WARM[r.id] && !LIVE[r.id]; })[0]; if (!next) return;
    WARM[next.id] = 1;
    var get = function (u) { return fetch(u, { priority: "low", credentials: "same-origin" }); };
    get("/" + next.file).then(function (res) { return res.ok ? res.text() : ""; }).then(function (html) {
      var urls = [], m, re = /<(?:script[^>]*\ssrc|link[^>]*rel="stylesheet"[^>]*\shref)="([^"]+)"/g;
      while ((m = re.exec(html))) { var u = m[1]; if (!/^(https?:)?\/\//.test(u)) urls.push(new URL(u, location.origin + "/").pathname + (u.split("?")[1] ? "?" + u.split("?")[1] : "")); }
      var i = 0, step = function () { if (i >= urls.length) { warmSoon(); return; } get(urls[i++]).then(function (x) { return x.blob(); }, function () {}).then(function () { setTimeout(function () { calm(step); }, 150); }); };
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
    var rk = D.querySelector("#tpVu .aogroom"); if (rk) rk.hidden = cur === "decks" || cur === "vocal";   /* AOG-VOCAL-V1: the booth has its own Room */
    TP.line = ""; if (typeof paintTp === "function") try { paintTp(); } catch (err) {}
    var name = e ? r.name[1] : r.name[0];
    fr.title = name;
    D.title = (e ? "El estudio de grabación · " : "The Recording Studio · ") + name + " — Architecture of Grace";
    [].forEach.call(D.querySelectorAll(".sh-doors a"), function (a) {
      if (a.getAttribute("data-room") === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    var ul = D.querySelector(".sh-doors ul"), on = D.querySelector('.sh-doors a[aria-current]');   /* the room you are in, in view */
    if (ul && on && ul.scrollWidth > ul.clientWidth) { var ur = ul.getBoundingClientRect(), lr = on.getBoundingClientRect(); ul.scrollLeft += (lr.left + lr.width / 2) - (ur.left + ur.width / 2); }
    paintTrack();
  }
  /* AOG-STUDIO-SUPREME-V1: a soft edge on My Track's strips only while more of them are that way */
  function edge() { var ul = D.getElementById("mtList"); if (!ul) return; var m = ul.scrollWidth > ul.clientWidth + 2 && ul.scrollLeft + ul.clientWidth < ul.scrollWidth - 2;
    if (ul.classList.contains("more") !== m) ul.classList.toggle("more", m); }
  D.getElementById("mtList").addEventListener("scroll", edge, { passive: true });
  /* My Track: a layer is there when its room has a take in the Mixing Desk's list or a recording on its shelf */
  var HAVE = {};
  function paintTrack() {
    var e = es(), ul = D.getElementById("mtList");
    ul.innerHTML = LAYERS.map(function (l) {
      var on = !!HAVE[l.id], nm = e ? l.name[1] : l.name[0];
      var say = nm + ": " + (on ? (e ? "hay una toma" : "a take is ready") : (e ? "todavía nada" : "nothing yet"));
      /* a mark, not a link: the doors and Add a layer are the ways to a room (CLAUDE.md: four or more places, a menu) */
      return '<li><span class="lay' + (on ? " on" : "") + '" data-layer="' + l.id + '" role="img" aria-label="' + say + '"><span>' + nm + "</span>" + (on ? '<span class="mk" aria-hidden="true">✓</span>' : "") + "</span></li>";
    }).join("");
    edge();
    /* + Add a layer: the rooms in song order; a layer already there says so */
    var sel = D.getElementById("mtAdd");
    sel.innerHTML = '<option value="">' + (e ? "+ Añadir una capa" : "+ Add a layer") + "</option>" + LAYERS.filter(function (l) { return lroom(l); }).map(function (l) {
      var R = lroom(l); return '<option value="' + R.id + '">' + (e ? R.name[1] : R.name[0]) + (HAVE[l.id] ? " ✓" : "") + "</option>"; }).join("");
    sel.setAttribute("aria-label", e ? "Añadir una capa: elige una sala" : "Add a layer: pick a room");
    /* AOG-STUDIO-SUPREME-V1: the My Track key (a phone, an upright iPad) says how many layers are there */
    var k = D.getElementById("mtOpen"), have = LAYERS.filter(function (l) { return HAVE[l.id]; }).length, kt = e ? "Mi pista" : "My Track", kn = have ? String(have) : "";
    if (k.firstChild.textContent !== kt) k.firstChild.textContent = kt; if (k.lastChild.textContent !== kn) k.lastChild.textContent = kn;
    att(k, "aria-label", kt + (have ? (e ? ": " + have + (have === 1 ? " capa" : " capas") : ": " + have + (have === 1 ? " layer" : " layers")) : ""));
    msPaint();   /* AOG-MISSIONS-V1 */
  }
  /* the My Track sheet opens above the desk; a tap outside it, Escape, or picking a room puts it away */
  function mtOpen(on) { var m = D.getElementById("mt"), k = D.getElementById("mtOpen"); if (m.classList.contains("mt-open") === !!on) return;
    m.classList.toggle("mt-open", !!on); k.setAttribute("aria-expanded", on ? "true" : "false"); }
  D.getElementById("mtOpen").addEventListener("click", function () { mtOpen(!D.getElementById("mt").classList.contains("mt-open")); });
  D.addEventListener("pointerdown", function (e) { if (!D.getElementById("mt").classList.contains("mt-open")) return;
    var t = e.target; if (t && t.closest && t.closest("#mt")) return; mtOpen(false); }, true);
  D.addEventListener("keydown", function (e) { if (e.key === "Escape" && D.getElementById("mt").classList.contains("mt-open") && D.getElementById("songBox").hidden) { mtOpen(false); D.getElementById("mtOpen").focus(); } });
  async function refresh() {
    var A = window.AOGHandoff, next = {}; if (!A) return;
    var items = [];
    try { var r = await A.list(A.INBOX); items = (r && r.items) || []; } catch (e) {}
    for (var i = 0; i < LAYERS.length; i++) {
      var l = LAYERS[i], R = lroom(l), live = /^live/.test(l.id), from = R ? R.from : live ? l.id.slice(4) : l.id, shelf = R ? R.shelf : "";
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
  var PA = { on: false, busy: false, ac: null, src: null, g: null };   /* AOG-PLAY-ALONG-V1: ♫ Play along (below) */
  function recOf() { try { return fr.contentWindow && fr.contentWindow.AOGStudioRec || null; } catch (e) { return null; } }
  function deskOf() { try { var w = fr.contentWindow; return cur === "studio" && w && w.__aogStudio ? w : null; } catch (e) { return null; } }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function say(k) { TP.line = k; paintTp(); }
  var TPW = {
    rec: ["● Record", "● Grabar"], stop: ["■ Stop", "■ Parar"], add: ["+ Add to My Track", "+ Añadir a mi pista"],
    listen: ["▶ Listen", "▶ Escuchar"], listenStop: ["■ Stop listening", "■ Dejar de escuchar"],
    /* AOG-PLAY-ALONG-V1 */
    along: ["♫ Play along", "♫ Toca encima"], alongStop: ["■ Stop", "■ Parar"], alongPrep: ["Getting My Track ready…", "Preparando mi pista…"],
    alongOn: ["My Track is playing. Play along in any room.", "Suena mi pista. Toca encima en cualquier sala."], mix: ["Mix ›", "Mezclar ›"], out: ["Send it out", "Compártela"],
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
    fail: ["That did not work. Try again.", "No funcionó. Inténtalo otra vez."],
    lb: ["▶ Listen back", "▶ Escúchala"]   /* AOG-LISTENBACK-V1 */
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
    var pb = D.getElementById("tpAlong"), pt = PA.on ? tw("alongStop") : tw("along"); if (pb.textContent !== pt) pb.textContent = pt;   /* AOG-PLAY-ALONG-V1 */
    att(pb, "aria-pressed", PA.on ? "true" : "false"); att(pb, "aria-label", PA.on ? tw("alongStop") + " · " + tw("along").replace("♫ ", "") : tw("along").replace("♫ ", ""));
    if (pb.disabled !== !!PA.busy) pb.disabled = !!PA.busy;
    /* AOG-STUDIO-SMOOTH-V1: this runs four times a second, so it writes only what changed (a write makes the page lay out again) */
    try { songWords(); } catch (err) {}
    [["tpMix", "mix"], ["tpOut", "out"]].forEach(function (p) { var b = D.getElementById(p[0]), t = tw(p[1]); if (b.textContent !== t) b.textContent = t; });
    /* AOG-STUDIO-LISTEN-V1: at the desk, Mix › has nowhere to go; the way back to your room takes its place */
    var bk = D.getElementById("tpBack"), br = cur === "studio" && TP.back ? room(TP.back) : null;
    var mx = D.getElementById("tpMix"); if (mx.hidden !== (cur === "studio")) mx.hidden = cur === "studio"; if (bk.hidden !== !br) bk.hidden = !br;
    if (br) { var bn = es() ? br.short[1] : br.short[0], bt = "‹ " + bn; if (bk.textContent !== bt) bk.textContent = bt;
      att(bk, "aria-label", (es() ? "Volver a: " : "Back to the ") + bn); }
    if (TP.line === "tap" && w && w.__aogStudio.AC && w.__aogStudio.AC.state === "running") TP.line = "";
    /* AOG-LISTENBACK-V1: its words, and the link beside "Added to My Track." */
    var lbt = tw("lb"), lm = D.getElementById("mtLb"), lg = D.getElementById("tpLbGo"), lgs = TP.line === "added" || TP.line === "layered";
    if (lm.textContent !== lbt) lm.textContent = lbt; if (lg.textContent !== lbt) lg.textContent = lbt; if (lg.hidden !== !lgs) lg.hidden = !lgs;
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
  /* AOG-PLAY-ALONG-V1 (2026-10-22) — Jimmy: "how can we get the drum loops that are made in kit A to be played so I / or the
     person can use the keyboard to make the rest of the tracks or the guitar and bass rooms?" ♫ Play along plays My Track
     (everything added to it: a Drum Machine loop sent to the Mixing Desk, takes) round and round, from the bar ♫ With My
     Track's From names, while you stay in the room you are in and play over it; nothing is recorded. It is My Track put
     together by the desk out of sight, as ● Record's backing is (backing()), on the Studio's own sound, so moving to another
     room keeps it going. It stops when pressed again, when ● Record starts (Record plays My Track itself, after its four
     clicks), when ▶ Listen plays the song, when the page is hidden or left; then its sound rests (AOG-SILENT-V1). */
  function alongStop() {
    if (!PA.on && !PA.src) return;
    var S0 = PA.src, G0 = PA.g, c = PA.ac; PA.on = false; PA.src = null; PA.g = null;
    try { var now = c.currentTime; G0.gain.setValueAtTime(G0.gain.value, now); G0.gain.linearRampToValueAtTime(0, now + 0.06); S0.stop(now + 0.08); } catch (e) {}
    setTimeout(function () { try { if (!PA.on && c && c.state === "running") c.suspend(); } catch (e) {} }, 200);
    if (TP.line === "alongOn" || TP.line === "alongPrep" || TP.line === "qs") TP.line = "";   /* AOG-QUICKSTART-V1: its line too */
    paintTp();
  }
  function alongAlign(at, barSec) {   /* a room's own playing pattern (a chord pattern, a loop) starts on the bar with it: at, on the Studio's sound clock, becomes the room's */
    try { var w = fr.contentWindow; if (!w || !w.AOGRoomClock || !w.AOGRoomClock.align || !w.AOGVU || !w.AOGVU.ctxs) return;
      var rc = w.AOGVU.ctxs().filter(function (c) { return c.state === "running"; })[0]; if (!rc) return;
      w.AOGRoomClock.align(rc.currentTime + (at - PA.ac.currentTime), barSec); } catch (e) {}
  }
  D.getElementById("tpAlong").addEventListener("click", function () { alongToggle(); });
  function alongToggle() {   /* the bar's button, and a room's own (its whole-screen menu, aog-labdoors.js) */
    if (PA.on) { alongStop(); return; }
    if (PA.busy) return;
    var R = recOf(); if (R && R.on()) return;
    var w0 = deskOf(); if (w0 && w0.__aogStudio.PLAY.on) { w0.__aogStudio.stop(); }
    alongWake(true);   /* still inside the tap: make or wake the sound now, as an iPhone wants */
    if (!PA.ac) return;
    PA.busy = true; say("alongPrep");
    backing().then(function (bk) {
      PA.busy = false;
      if (!bk || !bk.L || !bk.L.length) { say("empty"); return; }
      var c = PA.ac, buf = c.createBuffer(2, bk.L.length, bk.sr);
      buf.copyToChannel(bk.L, 0); buf.copyToChannel(bk.R || bk.L, 1);
      var from = Math.max(1, overGet().from | 0), offs = (from - 1) * bk.barSec; if (offs >= buf.duration - 0.05) offs = 0;
      var src = c.createBufferSource(), g = c.createGain(); src.buffer = buf; src.loop = true; src.loopStart = offs; src.loopEnd = buf.duration;
      src.connect(g); g.connect(c.destination);
      if (c.state !== "running") c.resume();
      var at = c.currentTime + 0.12; src.start(at, offs);
      PA.src = src; PA.g = g; PA.on = true; say("alongOn");
      alongAlign(at, bk.barSec);
    }, function () { PA.busy = false; say("fail"); });
  }
  function alongWake(on) {   /* AOG-QUICKSTART-V1: ✦ Start a song wakes it in its tap, and lets it rest again if nothing came of it */
    try { if (on === false) { if (!PA.on && !PA.busy && PA.ac && PA.ac.state === "running") PA.ac.suspend(); return; }
      if (!PA.ac) { var AC = window.AudioContext || window.webkitAudioContext; PA.ac = new AC(); if (window.AOGVU && AOGVU.own) AOGVU.own(PA.ac); }
      if (PA.ac.state !== "running") PA.ac.resume(); } catch (e) {}
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) alongStop(); });
  window.addEventListener("pagehide", alongStop);
  D.getElementById("tpRec").addEventListener("click", function () { var R = recOf(); if (!R) { say("noRec"); return; } TP.line = ""; if (PA.on && !R.on()) alongStop(); R.toggle(); setTimeout(paintTp, 60); });   /* AOG-PLAY-ALONG-V1: Record plays My Track itself */
  D.getElementById("tpAdd").addEventListener("click", function () {
    var R = recOf(), b = this; if (!R) return; b.disabled = true;
    Promise.resolve(R.add()).then(function () { b.disabled = false; say(R.sent() ? "added" : "fail"); if (R.sent()) did("added"); refresh(); }, function () { b.disabled = false; say("fail"); });   /* AOG-MISSIONS-V1 */
  });
  /* AOG-STUDIO-LISTEN-V1 (STUDIO-HANDOFF §12b): ▶ Listen plays My Track. The takes in My Track that are on no track yet
     go on the desk's empty tracks by themselves (listenFill), so make something, press Listen, hear it; ‹ takes you back. */
  D.getElementById("tpListen").addEventListener("click", function () {
    TP.line = ""; alongStop();   /* AOG-PLAY-ALONG-V1: one song at a time */
    var w0 = deskOf();
    if (w0 && w0.__aogStudio.PLAY.on) { w0.__aogStudio.stop(); paintTp(); return; }
    /* still inside the tap: wake the desk's sound now, as an iPhone wants */
    try { var a0 = w0 && w0.__aogStudio.AC; if (a0 && a0.state !== "running") a0.resume(); } catch (e) {}
    atDesk(async function (w) {
      var st = w.__aogStudio;
      if (st.PLAY.on) return;
      try { if (st.listenFill) await st.listenFill(); } catch (e) {}
      if (!st.SONG.tracks.some(function (x) { return x.clip; })) { say("empty"); return; }
      st.play(); paintTp(); did("listenedback");   /* AOG-MISSIONS-V1 */
      var left = (st.listenLeft || []).map(layerName);
      if (left.length) { TP.fill = { names: left.join(", ") }; say("full"); }
      /* a desk opened by Listen may not have its sound yet (iPhone): one tap on it brings it */
      setTimeout(function () { var c = st.AC; if (st.PLAY.on && c && c.state !== "running") say("tap"); }, 500);
    });
  });
  D.getElementById("tpBack").addEventListener("click", function () { var b = TP.back; if (room(b)) go(b, true); });
  /* AOG-LISTENBACK-V1 (2026-10-22) — the payoff: ▶ Listen back plays My Track on the whole screen, with the song's title and
     the artist's name, like a real release, and Share it sends it to friends. The view lives in aog-listenback.js, fetched the
     first time it is opened. It plays My Track as the desk bounces it out of sight (backing(), as ♫ Play along does) on the
     Studio's own sound, made here inside the tap (an iPhone wants that) and registered with AOGVU.own; the room you are in
     stays where it is, quiet until you come back to it. Nothing on My Track: the line says what to do first. */
  var LBK = { ac: null, js: 0 };
  function savedClips() { try { var sg = JSON.parse(localStorage.getItem("aog.studio.v1") || "null"); return !!(sg && sg.tracks && sg.tracks.some(function (x) { return x && x.clip; })); } catch (e) { return false; } }
  function listenBack() {
    mtOpen(false);
    if (!LAYERS.some(function (l) { return HAVE[l.id]; }) && !savedClips() && !LIVE.studio) { say("empty"); return; }
    TP.line = ""; alongStop();
    var w0 = deskOf(); if (w0 && w0.__aogStudio.PLAY.on) w0.__aogStudio.stop();
    var R = recOf(); try { if (R && R.on()) R.toggle(); } catch (e) {}   /* a take being recorded ends first (it is kept) */
    try { if (!LBK.ac) { var AC = window.AudioContext || window.webkitAudioContext; LBK.ac = new AC(); if (window.AOGVU && AOGVU.own) AOGVU.own(LBK.ac); }
      if (LBK.ac.state !== "running") LBK.ac.resume(); } catch (e) {}
    var api = { es: es, backing: backing, ac: function () { return LBK.ac; },
      desk: function () { try { var f = LIVE.studio, dw = f && f.contentWindow; return dw && dw.__aogStudio ? dw : null; } catch (e) { return null; } },
      room: function (on) { if (fr.getAttribute("src")) hush(fr, on); },
      song: function () { return window.AOGSong ? AOGSong.get() : null; }, notes: function () { return window.AOGSong ? AOGSong.NOTES : null; },
      opener: function () { var k = D.getElementById("mtOpen"), m = D.getElementById("mtLb"); return k.offsetParent ? k : m.offsetParent ? m : D.getElementById("tpListen"); },
      done: function () { paintTp(); } };
    /* AOG-MISSIONS-V1: once it is open, the mission is ticked, and its last line says the next mission */
    var lbOpen = function () { AOGListenBack.open(api); did("listenedback"); msLoad(function (M) { M.lb(); }); };
    if (window.AOGListenBack) { lbOpen(); return; }
    if (LBK.js) return; LBK.js = 1;
    var s = D.createElement("script"); s.src = "/aog-listenback.js";
    s.onload = function () { if (window.AOGListenBack) lbOpen(); };
    s.onerror = function () { LBK.js = 0; say("fail"); };
    D.body.appendChild(s);
  }
  D.getElementById("mtLb").addEventListener("click", listenBack);
  D.getElementById("tpLbGo").addEventListener("click", listenBack);
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
  function withRoom(id, fn, want) {   /* AOG-QUICKSTART-V1: want(w) says when a room is ready for fn(w), for a room with no AOGRoomRender */
    var f = roomFrame(id); if (!f) return Promise.reject(new Error("no room"));
    f.__rendering = (f.__rendering || 0) + 1;
    var done = function () { f.__rendering = Math.max(0, (f.__rendering || 1) - 1); trim(); };
    return new Promise(function (ok, no) {
      var t0 = Date.now(), k = setInterval(function () {
        var w = null; try { w = f.contentWindow; } catch (e) {}
        var ready = w && (want ? (function () { try { return want(w); } catch (e) { return false; } })() : w.AOGRoomRender) && w.document.readyState === "complete" && (!f.__new || Date.now() - f.__new > 700);
        if (ready) { clearInterval(k); f.__new = 0; Promise.resolve().then(function () { return fn(want ? w : w.AOGRoomRender); }).then(ok, no); }
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
    var iw = window.innerWidth || 0, narrow = iw >= 1100 && iw < 1200, sg = G && G.get();   /* an iPad on its side: the short way, so My Track keeps its room (narrower screens show it on My Track's sheet, where there is room) */
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
  function songSet(p) {
    var a = window.AOGSong && AOGSong.get();
    if (window.AOGSong) AOGSong.set(p); songWords();
    var b = window.AOGSong && AOGSong.get();   /* AOG-MISSIONS-V1: the tempo or the key really changed */
    if (b && (!a || a.bpm !== b.bpm || a.key !== b.key || !!a.minor !== !!b.minor || a.hasKey !== b.hasKey || a.hasBpm !== b.hasBpm)) did("songchanged");
  }
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
  /* AOG-STUDIO-SUPREME-V1: the Song sheet lies over the room; a tap above the desk (the doors, the top line) puts it away.
     The desk's own keys leave it open, so you can set From bar 5 and press Record with it in sight. */
  D.addEventListener("pointerdown", function (e) { var bx = D.getElementById("songBox"); if (bx.hidden) return;
    var t = e.target; if (t && t.closest && t.closest("#mt")) return; songOpen(false); }, true);
  /* a tap in the room (the frame takes the focus) puts both sheets away too */
  window.addEventListener("blur", function () { setTimeout(function () { var a = D.activeElement; if (!a || a.tagName !== "IFRAME") return;
    if (!D.getElementById("songBox").hidden) songOpen(false); mtOpen(false); }, 0); });
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
    var me = D.getElementById("mt"), top = fr.getBoundingClientRect().top + (window.scrollY || 0), mt = me.offsetHeight ? me.offsetHeight + (parseFloat(getComputedStyle(me).marginTop) || 0) : 0;
    var mh = mt + "px"; if (D.documentElement.style.getPropertyValue("--st-mt") !== mh) D.documentElement.style.setProperty("--st-mt", mh);   /* AOG-STUDIO-SUPREME-V1: the Song sheet sits just above the desk */
    edge();
    fr.style.height = Math.max(window.innerHeight < 760 ? 300 : 420, Math.floor(window.innerHeight - top - mt - (mt ? 4 : 0))) + "px";   /* a phone: the room takes what is left */
  }
  /* a room inside the frame says hello (aog-labdoors.js) and asks for another room by its id */
  /* AOG-STUDIO-KEYS-V1 (Jimmy, 2026-10-09: "At the moment nothing works with the keyboard"). Inside the Studio a tap on a
     door or on the transport leaves the keyboard with the Studio, not with the room in the frame, so no key reached any
     instrument. Now every key goes on to the room, as if the room had been tapped: the room's own keys decide what it
     plays. What stays with the Studio: typing in a box or a menu, Tab to move around, and Space or Enter on one of the
     Studio's own buttons. */
  function keyOn(e) {
    /* AOG-DESK-HANDS-V1: at the Mixing Desk, Undo and Redo (Ctrl/⌘+Z, Ctrl/⌘+Shift+Z, Ctrl+Y) and Alt+← → (a 10 ms nudge) go on to it too; AOG-DESK-KEYS-V2: and Ctrl/⌘+D (copy the piece after itself) and Ctrl/⌘+E (cut it at the playhead) */
    if (e.metaKey || e.ctrlKey || e.altKey) {
      var deskKey = cur === "studio" && (((e.metaKey || e.ctrlKey) && !e.altKey && /^[zyde]$/i.test(e.key)) || (e.altKey && !e.metaKey && !e.ctrlKey && /^Arrow(Left|Right)$/.test(e.key)));
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
    along: function () { return { on: PA.on, busy: PA.busy, ac: PA.ac && PA.ac.state, loop: !!(PA.src && PA.src.loop), line: TP.line }; },   /* AOG-PLAY-ALONG-V1, read only */
    alongToggle: function () { alongToggle(); },   /* AOG-PLAY-ALONG-V1: a room's own button (its whole-screen menu) */
    listenBack: function () { listenBack(); },   /* AOG-LISTENBACK-V1 */
    renderNotes: renderNotes, roomSounds: roomSounds,   /* AOG-NOTES-V1 */
    withRoom: withRoom, wake: alongWake, line: function (en, es) { TPW.qs = [en, es]; say("qs"); },   /* AOG-QUICKSTART-V1 */
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
  /* AOG-MICBOOTH-V1 (2026-10-22): the desk, ready (desk()), and the room quiet while a voice is recorded (quiet()), for a room
     that records a voice over My Track and hands the take to the desk's track 8. AOG-VOCAL-V1 (2026-10-23): the Vocal Booth
     (a room of its own) took the place of the 🎤 Sing or rap key; the key and its loader (aog-micbooth.js) are gone. */
  function deskReady() {
    var f = deskFrame();
    return new Promise(function (ok, no) {
      var t0 = Date.now(), k = setInterval(function () {
        var w = null; try { w = f.contentWindow; } catch (e) {}
        if (w && w.__aogStudio && w.__aogStudio.voicePut && w.document.readyState === "complete" && !w.__aogStudio.S.decoding && (!f.__new || Date.now() - f.__new > 700)) { clearInterval(k); f.__new = 0; ok(w); }
        else if (Date.now() - t0 > 20000) { clearInterval(k); no(new Error("no desk")); }
      }, 120);
    });
  }
  window.AOGStudioShell.desk = deskReady;
  window.AOGStudioShell.refresh = function () { refresh(); };
  window.AOGStudioShell.quiet = function (on) {
    if (on) { alongStop(); var w = deskOf(); if (w && w.__aogStudio.PLAY.on) w.__aogStudio.stop(); }
    hush(fr, !!on); if (!on) paintTp();
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
    mtOpen(false);
    sel.disabled = true;
    addCurrent().then(function (added) {
      sel.disabled = false; go(v, true);
      if (added && from) { TP.fill = { room: es() ? from.short[1] : from.short[0] }; say("layered"); refresh(); }
    });
  });
  /* AOG-QUICKSTART-V1 (2026-10-22) — Jimmy wants the Studio to be a showstopper for his 13-year-old: open it, tap ✦ Start a song,
     pick a vibe, and in a few seconds a beat, chords and a bass are playing, and the Piano's lit keys all fit. The vibes and the
     sheet are in aog-quickstart.js, fetched the first time the key is pressed (nothing loads before). */
  D.getElementById("qsOpen").addEventListener("click", function () {
    if (window.AOGQuickstart) { AOGQuickstart.press(); return; }
    var s = D.createElement("script"); s.src = "/aog-quickstart.js"; s.onload = function () { if (window.AOGQuickstart) AOGQuickstart.press(); }; D.head.appendChild(s);
  });
  /* AOG-MISSIONS-V1 (2026-10-22) — Jimmy wants the Studio to make his 13-year-old fall in love with making music: a reason to
     come back. Twelve missions tick themselves as the teen does things (aog-missions.js has the words, the sheet and the calm
     line that says a mission is done; it is fetched the first time it is needed, and nothing of it loads before). Here: the
     ticks, kept on the device the moment they happen (aog.studio.missions.v1; only the sheet's "Start the missions again"
     clears them), and the listening. Everything that counts arrives as one window event, aog-studio-did {detail: {what}}:
     the Studio fires it itself (did()), the rooms fire it on their own window (aog-recorder.js: a take, a lick, + Add to My
     Track; aog-song.js: the tempo or key changed in a room) and it is passed on here, and another build may fire it too
     ("shared", "remixopened"). The Studio also listens in each room, cheaply: a tap or a key in the room while ♫ Play along
     plays (playedalong), a step tapped on the Drum Machine (ownbeat), a fader or mute at the Mixing Desk (mixed). */
  var MS = { K: "aog.studio.missions.v1", IDS: ["started", "playedalong", "recorded", "added", "listenedback", "sang", "lick", "songchanged", "ownbeat", "mixed", "shared", "remixopened"], st: null, q: [], js: 0 };
  function msGet() {
    if (MS.st) return MS.st;
    var o = null; try { o = JSON.parse(localStorage.getItem(MS.K) || "null"); } catch (e) {}
    if (!o || typeof o !== "object") o = {}; if (!o.done || typeof o.done !== "object") o.done = {}; if (!o.ch || typeof o.ch !== "object") o.ch = {};
    return (MS.st = o);
  }
  function msPut(o) { MS.st = o; try { localStorage.setItem(MS.K, JSON.stringify(o)); } catch (e) {} msPaint(); }
  function msCount() { var o = msGet(); return { n: MS.IDS.filter(function (k) { return o.done[k]; }).length, t: MS.IDS.length }; }
  function msPaint() {
    if (!MS) return; var c = msCount(), a = es() ? "Misiones" : "Missions", n = (es() ? c.n + " de " : c.n + " of ") + c.t, t = a + " · " + n;
    var o = D.getElementById("msOpen"); if (o && o.textContent !== t) o.textContent = t;
    var k = D.getElementById("msTop");   /* two short lines on an iPad on its side: the words, then the count */
    if (k && k.textContent !== t) k.innerHTML = '<span class="a">' + a + '</span><span class="d"> · </span><span class="b">' + n + "</span>";
  }
  function msLoad(fn) {
    if (window.AOGMissions) { try { fn(AOGMissions); } catch (e) {} return; }
    MS.q.push(fn); if (MS.js) return; MS.js = 1;
    var s = D.createElement("script"); s.src = "/aog-missions.js";
    s.onload = function () { var q = MS.q; MS.q = []; if (!window.AOGMissions) return; AOGMissions.init({ get: msGet, put: msPut, es: es });
      q.forEach(function (f) { try { f(AOGMissions); } catch (e) {} }); };
    s.onerror = function () { MS.js = 0; MS.q = []; };
    D.head.appendChild(s);
  }
  function msDid(what) {
    if (MS.IDS.indexOf(what) < 0) return;
    var o = msGet(); if (o.done[what]) return;
    o.done[what] = Date.now(); msPut(o);
    msLoad(function (M) { M.celebrate(what); });
  }
  function did(what) { try { window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: what } })); } catch (e) { msDid(what); } }
  window.addEventListener("aog-studio-did", function (e) { var x = e && e.detail && e.detail.what; if (typeof x === "string") msDid(x); });
  function msSoon(what) { if (msGet().done[what]) return; setTimeout(function () { did(what); }, 0); }   /* after the room has its tap: never in the way of a note */
  function msHook(f) {
    var w; try { w = f.contentWindow; if (!w || w.__aogMs || !w.document) return; w.__aogMs = 1; } catch (e) { return; }
    var d = w.document, at = function () { try { return w.location.pathname; } catch (e) { return ""; } };
    w.addEventListener("aog-studio-did", function (e) { var x = e && e.detail && e.detail.what; if (typeof x === "string") did(x); });
    var played = function (e) { if (PA.on && f === fr && !(e && e.repeat) && at() !== "/music-studio.html") msSoon("playedalong"); };
    d.addEventListener("pointerdown", played, true); d.addEventListener("keydown", played, true);
    d.addEventListener("click", function (e) { var t = e.target; if (!t || !t.closest) return;
      if (t.closest("#steps .st") && at() === "/music-pads.html") msSoon("ownbeat");
      else if (t.closest("#mixer [data-ms]") && at() === "/music-studio.html") msSoon("mixed"); }, true);
    d.addEventListener("input", function (e) { var t = e.target; if (t && t.matches && t.matches("#mixer input[type=range]") && at() === "/music-studio.html") msSoon("mixed"); }, true);
  }
  D.addEventListener("load", function (e) { var t = e.target; if (t && t.tagName === "IFRAME" && t.classList && t.classList.contains("sh-room")) msHook(t); }, true);
  window.addEventListener("storage", function (e) { if (e.key === MS.K || e.key === null) { MS.st = null; msPaint(); } });
  ["msOpen", "msTop"].forEach(function (id) { D.getElementById(id).addEventListener("click", function () { var b = this; mtOpen(false); msLoad(function (M) { M.press(b); }); }); });
  window.AOGStudioShell.did = did;
  window.AOGStudioShell.missions = { count: msCount, open: function (tab) { msLoad(function (M) { M.open(tab || "m"); }); } };
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
  /* AOG-SHARE-V1: a beat link: aog-share.js (fetched only for it) cleans the beat, sets the song's tempo and key, loads it into
     the Drum Machine and puts its loop on My Track; one line says what to do. Nothing plays until a key is pressed. */
  if (BEAT !== null) {
    var shs = D.createElement("script"); shs.src = "/aog-share.js";
    shs.onload = function () { if (window.AOGShare) AOGShare.arrive(BEAT, window.AOGStudioShell); };
    shs.onerror = function () { say("fail"); };
    D.head.appendChild(shs);
  }
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
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Every music room in one studio: the drum machine, drum kit, piano, guitar, bass, band, turntables, vocal booth and mixing desk. Play, make, mix and send it out. No account.">', head, count=1)
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
           "  <h1><span class=\"sh-full\">%s</span></h1>" % sp(("The Recording Studio", "El estudio de grabación")),
           # AOG-QUICKSTART-V1: ✦ Start a song, the first thing to press (aog-quickstart.js, fetched on the first tap)
           '  <button type="button" class="sh-qs" id="qsOpen" aria-haspopup="dialog">%s</button>' % sp(("✦ Start a song", "✦ Empieza una canción")),
           # AOG-MISSIONS-V1: Missions · 3 of 12 (shown here on an iPad on its side and a computer; on My Track's sheet otherwise)
           '  <button type="button" class="sh-ms" id="msTop" aria-haspopup="dialog" aria-expanded="false"></button>',
           '  <p class="sh-tag">%s</p>' % sp(("Play · Record · Listen · Mix · Send it out", "Toca · Graba · Escucha · Mezcla · Compártela")),
           # AOG-STUDIO-SUPREME-V1: the meter bridge (AOG-ROOM-VU-V1: the room's small VU meters and its room sound)
           '  <div class="sh-bridge"><span class="tp-vu" id="tpVu"></span></div>',
           '  <div class="sh-lang" role="group" aria-label="Language · Idioma"><button type="button" data-lang="en" lang="en">EN</button><button type="button" data-lang="es" lang="es">ES</button></div>',
           "</div>",
           '<nav class="sh-doors" aria-label="Rooms · Salas"><ul>']
    for rid, href, f, pic, name, short, frm, shelf in ROOMS:
        out.append('  <li><a href="#%s" data-room="%s"><span class="pic" aria-hidden="true"><picture><source type="image/webp" srcset="/img/banners/%s-pencil-900.webp">'
                   '<img src="/img/banners/%s-pencil-900.jpg" alt="" width="900" height="315" decoding="async"></picture></span>%s</a></li>'
                   % (rid, rid, pic, pic, sp(short)))
    out += ["</ul></nav>",
            '<main class="sh-main"><iframe class="sh-room" id="room" title="The Drum Machine" allow="autoplay; fullscreen; clipboard-write; microphone"></iframe></main>',
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
            '<button type="button" class="tp-b tp-add" id="tpAdd" hidden></button><button type="button" class="tp-b" id="tpListen"></button><button type="button" class="tp-b tp-along" id="tpAlong" aria-pressed="false"></button>'
            '<a class="tp-b tp-mix" id="tpMix" href="#studio" data-room="studio"></a><button type="button" class="tp-b tp-back" id="tpBack" hidden></button>'
            '<button type="button" class="tp-b tp-out" id="tpOut"></button>'
            '<button type="button" class="tp-b tp-mt" id="mtOpen" aria-expanded="false" aria-controls="mtRow"><span class="t"></span><span class="n"></span></button>'   # AOG-STUDIO-SUPREME-V1
            '<span class="tp-say"><span class="tp-line" id="tpLine" aria-live="polite"></span><button type="button" class="tp-lbgo" id="tpLbGo" hidden></button></span></div>'   # AOG-LISTENBACK-V1
            '<div class="mtrow" id="mtRow"><h2 id="mtH">%s</h2>'
            '<button type="button" class="tp-b tp-lb" id="mtLb"></button>'   # AOG-LISTENBACK-V1
            '<button type="button" class="tp-b tp-song" id="tpSong" aria-expanded="false" aria-controls="songBox"></button>'   # AOG-SONG-V1: the song's tempo and key, beside My Track
            '<select id="mtAdd"></select><ul id="mtList"></ul>'
            '<button type="button" class="tp-b tp-ms" id="msOpen" aria-haspopup="dialog" aria-expanded="false"></button></div></section>' % sp(("My Track", "Mi pista")),   # AOG-MISSIONS-V1
            "</div>"]
    rooms = [{"id": r[0], "href": r[1], "file": r[2], "name": list(r[4]), "short": list(r[5]), "from": r[6], "shelf": r[7]} for r in ROOMS]
    layers = [dict({"id": l[0], "name": list(l[1])}, **({"room": l[2]} if len(l) > 2 else {})) for l in LAYERS]
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
