/* ══ AOG-LABDOORS-V1 (2026-10-05) — the music labs' doors, across the top of every lab ══════════════════════════════════
   Jimmy: "maybe for the different labs, small doors should be across the top of the page … moving from room to room
   easier." Eight small doors, each the lab's own pencil drawing (the Studio door's pictures) and its name, in the Studio's
   order; the lab you are in is marked (aria-current) and the others are one tap away. On a phone the row slides
   sideways inside itself (the page stays still) as a slim row of small pictures beside their names, a finger
   high, so the lab below stays on the screen; on a wide screen all eight fit, as picture doors. It sits just above the lab's bar.
   An exception to the drop-down rule (CLAUDE.md, "Drop-down menus"), asked for by Jimmy on 2026-10-05.
   A lab loads it with  <script src="/aog-labdoors.js" defer></script>. ═════════════════════════════════════════════ */
(function () {
  "use strict";
  var D = document;
  /* AOG-LABDOORS-V2 (Jimmy, 2026-10-05): the old drum machine is retired (it stays at /drums for the lessons that use it,
     off the doors); the Beat Lab is now The Drum Machine. The order makes a song: a beat, the instruments, the band, the
     records, then the mix. */
  var LABS = [
    { id: "pads", href: "/drum-machine", pic: "music-pads", en: "Drum Machine", es: "Caja de ritmos", m: /^(music-pads|drum-machine|beat-lab|beatlab|pads|pad-machine)$/ },
    { id: "kit", href: "/drum-kit", pic: "music-kit", en: "Drum Kit", es: "Batería", m: /^(music-kit|drum-kit|kit)$/ },
    { id: "piano", href: "/piano", pic: "music-piano", en: "Piano", es: "Piano", m: /^(music-piano|piano|keys)$/ },
    { id: "guitar", href: "/guitar", pic: "music-guitar", en: "Guitar", es: "Guitarra", m: /^(music-guitar|guitar)$/ },
    { id: "bass", href: "/bass", pic: "music-bass", en: "Bass", es: "Bajo", m: /^(music-bass|bass)$/ },
    { id: "band", href: "/band", pic: "music-band", en: "Band", es: "Banda", m: /^(music-band|band)$/ },
    { id: "decks", href: "/turntables", pic: "music-decks", en: "Turntables", es: "Tocadiscos", m: /^(music-decks|turntables|decks)$/ },
    { id: "studio", href: "/mixing-desk", pic: "music-mixdesk", en: "Mixing Desk", es: "Mesa de mezclas", m: /^(music-studio|studio|mixing-desk)$/ }
  ];
  var CSS = [
    ".labdoors{margin:.2rem 0 .6rem;padding:0}",
    ".labdoors ul{list-style:none;margin:0;padding:2px 2px 6px;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(88px,1fr);gap:8px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}",
    ".labdoors li{scroll-snap-align:start}",
    ".labdoors a{display:flex;flex-direction:column;align-items:stretch;gap:4px;min-height:44px;text-decoration:none;color:var(--ink,#1a232c);background:var(--card,#fffcf7);border:1px solid var(--line,#ddd8cc);border-radius:12px;padding:4px 4px 6px}",
    ".labdoors .ld-pic{display:block;aspect-ratio:4/3;border-radius:8px;overflow:hidden;background:#f3eee2}",
    ".labdoors img{display:block;width:100%;height:100%;object-fit:cover;object-position:68% 42%}",
    ".labdoors .ld-n{font:700 .82rem/1.15 var(--sans,system-ui,sans-serif);text-align:center;padding:0 2px;color:var(--ink,#1a232c)}",
    ".labdoors a[aria-current=page]{border:2px solid #c9a24b;box-shadow:inset 0 0 0 1px #c9a24b}",
    ".labdoors a[aria-current=page] .ld-n{font-weight:800}",
    ".labdoors a:focus-visible{outline:3px solid #c9a24b;outline-offset:2px}",
    "@media (min-width:900px){.labdoors ul{overflow:visible;grid-auto-flow:row;grid-template-columns:repeat(8,minmax(0,1fr))}}",
    /* a phone: one slim row, a small picture beside the name, a finger high, so the lab below stays on the screen */
    "@media (max-width:699px){.labdoors{margin:.1rem 0 .3rem}.labdoors ul{grid-auto-columns:max-content;gap:6px;padding:2px 2px 4px}.labdoors a{flex-direction:row;align-items:center;gap:6px;padding:3px 10px 3px 3px;min-height:44px}.labdoors .ld-pic{width:44px;height:34px;aspect-ratio:auto;flex:0 0 auto}.labdoors .ld-n{white-space:nowrap;font-size:.86rem}}",
    /* the doors say where the labs are, so the old Music tools menu (aog-dropdowns.js, drawn just before #navTools) steps
       aside: said once (CLAUDE.md). It stays in the page, so anything that still reaches for it works. */
    "html.has-labdoors label.aogdd:has(+ #navTools),html.has-labdoors .sisters>label.aogdd:last-child{display:none!important}",
    "@media print{.labdoors{display:none}}"
  ].join("\n");
  function here() {
    var f = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    for (var i = 0; i < LABS.length; i++) if (LABS[i].m.test(f)) return LABS[i].id;
    return "";
  }
  function lang() { return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0 ? "es" : "en"; }
  function paint(nav) {
    var es = lang() === "es", cur = here();
    nav.setAttribute("aria-label", es ? "Laboratorios de música" : "Music labs");
    nav.innerHTML = "<ul>" + LABS.map(function (l) {
      return '<li><a href="' + l.href + '"' + (l.id === cur ? ' aria-current="page"' : "") + '>' +
        '<span class="ld-pic" aria-hidden="true"><picture><source type="image/webp" srcset="/img/banners/' + l.pic + '-pencil-900.webp">' +
        '<img src="/img/banners/' + l.pic + '-pencil-900.jpg" alt="" width="900" height="315" loading="lazy" decoding="async"></picture></span>' +
        '<span class="ld-n">' + (es ? l.es : l.en) + "</span></a></li>";
    }).join("") + "</ul>";
    var on = nav.querySelector("[aria-current]");
    if (on && on.parentNode && nav.firstChild.scrollWidth > nav.firstChild.clientWidth) {
      var ul = nav.firstChild, li = on.parentNode;
      ul.scrollLeft = Math.max(0, li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2);   /* the lab you are in, in view */
    }
  }
  function start() {
    if (D.getElementById("labdoors")) return;
    var bar = D.querySelector(".wrap > .bench-bar") || D.querySelector(".bench-bar"); if (!bar) return;
    if (!D.getElementById("labdoors-css")) { var st = D.createElement("style"); st.id = "labdoors-css"; st.textContent = CSS; D.head.appendChild(st); }
    var nav = D.createElement("nav"); nav.id = "labdoors"; nav.className = "labdoors no-print";
    bar.parentNode.insertBefore(nav, bar);
    D.documentElement.classList.add("has-labdoors");
    paint(nav);
    var last = lang();
    try { new MutationObserver(function () { if (lang() !== last) { last = lang(); paint(nav); } }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  }
  /* AOG-STUDIO-SHELL-V1 (2026-10-09, STUDIO-HANDOFF §04–§05) — inside the Studio (/the-studio holds this lab in its
     frame) the Studio draws the doors and the site bar, so the lab hides its own; a link to another lab changes the room
     in the Studio instead of opening a page inside the page, and any other page opens over the Studio. A lab opened on
     its own address is untouched. */
  var shell = null;
  try { if (window.parent && window.parent !== window && window.parent.AOGStudioShell) shell = window.parent.AOGStudioShell; } catch (e) { shell = null; }
  if (shell) {
    D.documentElement.classList.add("in-studio");
    var ss = D.createElement("style"); ss.id = "in-studio-css";
    /* the Studio's doors already name the room (and show its drawing), so the room's own banner steps aside and the
       instrument gets the screen: on a phone first, and since AOG-STUDIO-ROOMY-V1 on an iPad and a computer too (Jimmy,
       2026-10-09: the bars were taking "a huge portion of the screen") */
    ss.textContent = "html.in-studio .labdoors,html.in-studio .aogtop,html.in-studio .aogtop-spacer{display:none!important}" +
      "html.in-studio [data-aog-hero]{display:none!important}" +
      /* AOG-STEADY-ALL-V1 (2026-10-17) — Jimmy: "after a certain number of notes are played, it freezes up for a note or
         two". The floating My notes button sat on top of the instrument (the highest keys, the strum strip): a finger
         landing there played nothing and opened the notes drawer, and the next taps landed on the drawer. Inside the
         Studio the instrument has the screen. */
      "html.in-studio .aog-mkbtn{display:none!important}";
    (D.head || D.documentElement).appendChild(ss);
    D.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || a.hasAttribute("download") || (a.target && a.target !== "_self") || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      var u; try { u = new URL(a.getAttribute("href"), location.href); } catch (err) { return; }
      if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
      if (u.pathname === location.pathname) return;   /* a place on this page */
      var f = (u.pathname.split("/").pop() || "").replace(/\.html$/, "");
      e.preventDefault();
      for (var i = 0; i < LABS.length; i++) if (LABS[i].m.test(f)) { shell.go(LABS[i].id); return; }
      window.top.location.href = u.href;
    });
    try { shell.arrived(here(), window); } catch (e) {}   /* AOG-STUDIO-KEEP-V1: which room says it */
    /* AOG-STUDIO-FIRST-V1 (STUDIO-HANDOFF §08, Jimmy's "3"): inside the Studio a room opens on its instrument. What
       teaches about the room (the course box, the guide, the lesson menu, the bench switch) waits in one closed
       "Lessons and more" below the instrument, and the sound and kit menus sit under the thing you play. Nothing is
       taken out: every control is still in the page, one tap away. A room on its own address is untouched. */
    ss.textContent += "html.in-studio .aog-krow-top .pbtn{white-space:nowrap}" +
      "html.in-studio .aog-learn{margin:1rem 0;border:1px solid var(--line,#ddd8cc);border-radius:12px;background:var(--card,#fffcf7);color:var(--ink,#1a232c)}" +
      "html.in-studio .aog-learn>summary{min-height:44px;display:flex;align-items:center;gap:.5rem;padding:0 14px;cursor:pointer;font:700 1rem/1.2 var(--sans,system-ui,sans-serif);color:var(--ink,#1a232c);list-style:none}" +
      "html.in-studio .aog-learn>summary::-webkit-details-marker{display:none}" +
      "html.in-studio .aog-learn>summary::before{content:'\\25B8';font-size:.85em}html.in-studio .aog-learn[open]>summary::before{content:'\\25BE'}" +
      "html.in-studio .pm #pads+.pm-row,html.in-studio #rig #pads+.row{margin-top:.8rem}" +
      "html.in-studio .aog-learn>.aog-learn-in{padding:0 12px 12px}html.in-studio .aog-learn .bench-bar{margin:0;position:static}" +
      /* the course box and the guide line wait out of sight until they are in Lessons and more (no jump on the screen) */
      "html.in-studio .aog-course-band:not(.aog-learn *),html.in-studio .pm-guide:not(.aog-learn *),html.in-studio .bench-bar[data-empty]{display:none!important}";
  }
  function firstSurface() {
    var view = D.getElementById("view"), id = here();
    if (!D.body) return;
    /* 1 · the instrument first: rooms with a rig put the playing blocks before the sound menu and the chord wheel */
    var rig = D.getElementById("rig");
    if (rig && !rig.hasAttribute("data-first")) {
      var blk = function (sel) { var e = rig.querySelector(sel); while (e && e.parentNode !== rig) e = e.parentNode; return e; };
      var choose = blk("#soundSel"), chords = blk("#pads"), wheel = D.getElementById("wheelBlk"), out = blk("#era"),
        play = blk("h2[data-t=keysH]") || blk("h2[data-t=neckH]"), amp = D.getElementById("ampBlk"), live = D.getElementById("liveBlk"),
        learn = D.getElementById("learnBlk");   /* AOG-LEARN-V1: Learn a song, closed, right after the instrument */
      if (choose === play || choose === chords) choose = null;   /* AOG-SOUNDPICK-V1: the instrument choice already sits by the instrument */
      /* AOG-ROOM-PEDALS-V1: the piano's and the band's pedals and amp come after the playing, as the guitar's do */
      var order = id === "piano" ? [play, learn, chords, choose, wheel, amp, out]
        : id === "band" ? [choose, play, chords, wheel, amp, out]
        : (id === "guitar" || id === "bass") ? [play, learn, chords, choose, wheel, amp, live, out] : null;   /* AOG-STUDIO-FIRST-V2: the instrument first */
      if (order && order.every(function (e) { return !e || e.parentNode === rig; })) {
        order.forEach(function (e) { if (e) rig.appendChild(e); });
        rig.setAttribute("data-first", "1");
      }
    }
    /* AOG-STUDIO-FIRST-V2 (Jimmy, 2026-10-09: "1, 3, 2, 4" — 4: each room's first screen like the drawings). Inside the
       Studio a room opens on the thing you play: the keys or the neck right under the room's name, its sound menus by it
       (the Band's above its keys, as in its drawing), then the room's one line on how to play it as a paper slip, then the
       chord pads and the buttons. The line is the room's own (the touch line on a tablet, the keys line on a computer). */
    var inst = (id === "guitar" || id === "bass") ? D.getElementById("neckBox") : (id === "piano" || id === "band") ? D.getElementById("kbd") : null,
      pblk = inst && inst.parentNode;
    if (inst && pblk && pblk.parentNode === rig && !inst.hasAttribute("data-first2")) {
      var kid = function (sel) { return [].filter.call(pblk.children, function (e) { return e.matches(sel); }); };
      /* AOG-CHORDS-BY-NECK-V1 (Jimmy, 2026-10-09: "I want to be able to see / press the chords — they should sit above or
         below the neck"): the chord buttons sit right above the instrument, so they show with it on the first screen */
      var sp0 = kid(".sp-wrap")[0], slips = kid(".touch-line,.keys-line"), strip = D.getElementById("chordStrip"),
        lead = id === "band" && !(window.matchMedia && matchMedia("(max-width:699px)").matches) ? [sp0, strip, inst] : [strip, inst, sp0];   /* on a phone the keys come first, the menus under them */
      /* AOG-KROW-TOP-V1 (Jimmy, 2026-10-10: "Can the octave button be higher on the phone … The lower to higher should
         sit right above the chords"): Lower and Higher get their own row right above the chords, so they show on a phone
         held upright */
      var krow = kid(".krow")[0], recRow = null;
      if (krow) {   /* only Lower, the range and Higher (and a tablet's big-screen button) go up; the rest (the room's own
                       Record, the pedal, MIDI, mute) stay further down, so the keys stay near the top on a small phone */
        var up = /^(downBtn|upBtn|rangeOut|fretsOut|bpBig|pvBig)$/;
        recRow = D.createElement("div"); recRow.className = "krow aog-krow-rec";
        [].slice.call(krow.children).forEach(function (e) { if (!up.test(e.id || "")) recRow.appendChild(e); });
        if (!recRow.children.length) recRow = null;
      }
      /* AOG-ANY-ROOTS-V1 (Jimmy, 2026-10-14: "CAN THE root chords be more up"): Any chord stays right under the chord strip */
      var anyR = D.getElementById("anyRoots"), anyB = anyR && anyR.closest(".any");
      if (anyB && anyB.parentNode === pblk && strip) { var sa = lead.indexOf(strip); if (sa >= 0) lead.splice(sa + 1, 0, anyB); }
      /* AOG-AMP-NEAR-V1: the guitar's and bass's "Pedals on" strip stays right under the neck */
      var pn = D.getElementById("pedalsNear");
      if (pn && pn.parentNode === pblk) { var at = lead.indexOf(inst); if (at >= 0) lead.splice(at + 1, 0, pn); }
      var seq = lead.concat(slips, [recRow]).filter(function (e) { return e && (e === recRow || e.parentNode === pblk); });
      var h2 = kid("h2")[0], mark = D.createComment("first");
      pblk.insertBefore(mark, h2 ? h2.nextSibling : pblk.firstChild);
      seq.forEach(function (e) { pblk.insertBefore(e, mark); }); pblk.removeChild(mark);
      if (krow) {   /* Lower / Higher on their own row, right above the chords (Jimmy, 2026-10-10) */
        var top = strip && strip.parentNode === pblk ? strip : lead.filter(function (e) { return e && e.parentNode === pblk; })[0];
        pblk.insertBefore(krow, top || (h2 ? h2.nextSibling : pblk.firstChild)); krow.classList.add("aog-krow-top");
      }
      slips.forEach(function (e) { e.classList.add("aog-slip"); });
      inst.setAttribute("data-first2", "1");
    }
    /* the chord pads straight under their one line; the key and the mood under the pads */
    /* AOG-STUDIO-LESSONS-LAST-V1 (Jimmy, 2026-10-10, on the Drum Machine: "The worksheets lessons should not be above the
       looping information and sending it over"): in every room the lessons card comes after the playing, recording and
       sending, just above Lessons and more. A card already below it stays where it is. */
    var lessons = D.getElementById("lessons"), learn = D.getElementById("aogLearn");
    if (lessons && learn && learn.parentNode && !learn.contains(lessons) &&
        (lessons.compareDocumentPosition(learn) & Node.DOCUMENT_POSITION_FOLLOWING) && lessons.nextElementSibling !== learn) {
      learn.parentNode.insertBefore(lessons, learn);
    }
    var cpads = rig && rig.querySelector("#pads"), keySel = D.getElementById("keySel"), keyRow = keySel && keySel.closest(".row");
    if (cpads && keyRow && keyRow.parentNode === cpads.parentNode && !keyRow.hasAttribute("data-first")) {
      cpads.parentNode.insertBefore(keyRow, cpads.nextSibling); keyRow.setAttribute("data-first", "1");
    }
    /* the Drum Machine: the pads first, the bank and the kit menus under them (as Jimmy's drawing has the banks along the
       bottom); the Drum Kit's kit menu under the kit */
    var pads = D.getElementById("pads"), bankSel = D.getElementById("bankSel"), bankRow = bankSel && bankSel.closest(".pm-row");
    if (id === "pads" && pads && bankRow && bankRow.parentNode === pads.parentNode && !bankRow.hasAttribute("data-first")) {
      var at = pads.nextSibling;
      [bankRow, D.getElementById("setRow"), D.getElementById("guideRow")].forEach(function (e) { if (e && e.parentNode === pads.parentNode) pads.parentNode.insertBefore(e, at); });
      bankRow.setAttribute("data-first", "1");
    }
    var kitBox = D.getElementById("kitBox"), kitSel = D.getElementById("kitSel"), kitRow = kitSel && kitSel.closest(".kp-row");
    if (id === "kit" && kitBox && kitRow && !kitRow.hasAttribute("data-first") && kitRow.parentNode === kitBox.parentNode) {
      kitBox.parentNode.insertBefore(kitRow, kitBox.nextSibling); kitRow.setAttribute("data-first", "1");
    }
    /* 2 · Lessons and more: one closed row below the instrument */
    /* a bench bar is worth a place only when something in it can still be used (the doors replace the old tools menu) */
    var usable = function (bar) { return [].some.call(bar.querySelectorAll("a[href],button,select"), function (c) {
      if (c.closest(".aogdd-src")) return false;   /* the buttons a drop-down presses (aog-dropdowns.js) are out of sight */
      for (var e = c; e && e !== bar; e = e.parentNode) if (e.hidden || getComputedStyle(e).display === "none") return false; return true; }); };
    /* AOG-STUDIO-SMOOTH-V1: look at every bar first, then mark the empty ones; a mark made between two looks makes the
       whole page work its styles out again, and these pages are big */
    var empty = [], parts = [].slice.call(D.querySelectorAll("body .bench-bar, body .aog-course-band, body .pm-guide")).filter(function (e) {
      if (e.closest(".aog-learn")) return false;
      if (e.classList.contains("bench-bar") && !usable(e)) { empty.push(e); return false; }
      return true; });
    empty.forEach(function (e) { if (e.getAttribute("data-empty") !== "1") e.setAttribute("data-empty", "1"); });
    if (!parts.length) return;
    var box = D.getElementById("aogLearn");
    if (!box) {
      box = D.createElement("details"); box.id = "aogLearn"; box.className = "aog-learn no-print";
      box.innerHTML = '<summary></summary><div class="aog-learn-in"></div>';
      var les = D.getElementById("lessons");
      if (view && view.parentNode) view.parentNode.insertBefore(box, view.nextSibling);
      else if (les && les.parentNode) les.parentNode.insertBefore(box, les);
      else { var w = D.querySelector(".wrap") || D.body; w.appendChild(box); }
      var say = function () { var s = box.firstChild, t = lang() === "es" ? "Lecciones y más" : "Lessons and more"; if (s.textContent !== t) s.textContent = t; };
      say();
      try { new MutationObserver(say).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    }
    var inn = box.lastChild;
    parts.forEach(function (e) { inn.appendChild(e); });
  }
  /* ══ AOG-ROOMS-COMPACT-V1 (Jimmy, 2026-10-17: "I feel like there is A LOT of scrolling on the studio pages … the guitar
     page … but it could be for all"). Inside the Studio a room fits its first screen: the instrument and what you play it
     with (the sound, the chords and the key, Record and Send). Everything else waits behind one More menu right under them
     (CLAUDE.md: four or more places to look are a drop-down): pick a part and it opens there; Close folds it away. Nothing
     is taken out and nothing moves house: a part out of sight is only hidden, so every page's own code still finds it.
     Any chord folds behind one button by the chords. What is open is remembered on this device; a first visit shows the
     instrument with everything else closed. Duplicates step aside (said once): the key and the chord pattern by the neck
     repeat the ones in the chords. The Mixing Desk is left as it is. ══ */
  var CW = {
    more: ["More", "Más"], choose: ["Choose…", "Elige…"], close: ["Close", "Cerrar"], any: ["Any chord", "Cualquier acorde"],
    how: ["How to play", "Cómo tocar"], patterns: ["Chord patterns and tempo", "Patrones de acordes y tempo"],
    scale: ["Scales", "Escalas"], wheel: ["Chord wheel", "Rueda de acordes"], amp: ["Amp and pedals", "Amplificador y pedales"],
    live: ["Plug in and tune", "Conecta y afina"], dials: ["Sound and volume", "Sonido y volumen"], learn: ["Learn a song", "Aprende una canción"],
    lessons: ["Lessons", "Lecciones"], timing: ["Timing and repeat", "Tiempo y repetición"], beat: ["Play along with a beat", "Toca con un ritmo"],
    fx: ["Effects", "Efectos"], loopfile: ["The loop as a file", "El bucle como archivo"], records: ["Records", "Discos"], bars: ["Bars to rap", "Rimas para rapear"]
  };
  var MORE_KEY = "aog.studio.more.v1", ANY_KEY = "aog.studio.any.v1";
  function kept(k) { try { var o = JSON.parse(localStorage.getItem(k) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } }
  function keep(k, room, v) { try { var o = kept(k); if (v) o[room] = v; else delete o[room]; localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function $(i) { return D.getElementById(i); }
  /* where an element lives in the page, even while its instrument plays on the whole screen (a comment marks its place) */
  function homeOf(el) {
    if (!el) return null; if (!el.closest("#pvNeck,#bpMain,#pvGrid,.pv,.bp")) return el;
    var w = D.createTreeWalker(D.body, NodeFilter.SHOW_COMMENT), n; while ((n = w.nextNode())) if (n.nodeValue === el.id) return n;
    return null;
  }
  function blkOf(el, rig) { while (el && el.parentNode && el.parentNode !== rig) el = el.parentNode; return el && el.parentNode === rig ? el : null; }
  /* a part's name in the menu: its own heading, as the page wrote it (so it is said once, in the page's language) */
  function nameOf(s, es) {
    var h = s.head && s.head(), t = h && (h.textContent || "").replace(/\s+/g, " ").trim().replace(/[:：]$/, "");
    if (t && t.length < 48) return t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t;
    return CW[s.w || s.k][es ? 1 : 0];
  }
  function compactSpec(id) {
    var q = function (sel, root) { return (root || D).querySelector(sel); }, row = function (el) { return el && el.closest(".row,.pm-row,.kp-row"); };
    if (/^(piano|guitar|bass|band)$/.test(id)) {
      var rig = $("rig"); if (!rig) return null;
      var strings = id === "guitar" || id === "bass", inst = $(strings ? "neckBox" : "kbd"), h2 = q("h2[data-t=neckH],h2[data-t=keysH]", rig);
      var pblk = h2 && blkOf(h2, rig), at = homeOf(inst); if (!pblk || !at || !pblk.contains(at)) return null;
      var pads = q("#pads", rig), cblk = pads && blkOf(pads, rig), keyRow = row($("keySel")), sendRow = row($("sendBtn")),
        recB = $("recBtn"), recRow = recB && recB.closest(".aog-krow-rec"), dials = blkOf($("era"), rig);
      var kids = function (sel) { return [].filter.call(pblk.querySelectorAll(sel), function (e) { return !e.closest(".aog-ctl"); }); };
      var sp0 = q(".sp-wrap", rig);
      /* the Band's section and instrument menus stay above its keys (its drawing); on a phone, where they come under the
         keys, they lead the row of controls as in the other rooms */
      var spAfter = sp0 && at && at !== sp0 && !!(at.compareDocumentPosition(sp0) & Node.DOCUMENT_POSITION_FOLLOWING);
      var ctl = [[id === "band" && !spAfter ? null : sp0, keyRow, $("pedalsNear")], [recRow, sendRow]];
      /* AOG-SOLO-LICKS-PV-V1: Solo's licks sit right under the neck (aog-solo.js); a room fitted again (the iPad turned, the
         screen resized) keeps them there and puts its controls after them */
      var lk = strings && q(".so-licks.so-near", rig), after = at;
      /* the sound picker's row can land between them as the room opens with Solo already on: the licks go back first */
      if (lk && lk.parentNode === at.parentNode) { if (lk.previousSibling !== at) at.parentNode.insertBefore(lk, at.nextSibling); after = lk; }
      return {
        host: pblk, after: after, ctl: ctl, lines: [$("loadLine"), $("sendLine"), $("padsLine")],
        dup: strings ? [q(".row.nk-key", pblk), q(".row.nk-pat", pblk), $("prog2")] : [],
        any: $("anyRoots") && $("anyRoots").closest(".any"), krow: q(".aog-krow-top", pblk), toKrow: strings ? [$("soloMode")] : [],
        bar: pblk,
        secs: [
          { k: "how", el: kids(".touch-line,.keys-line:not([aria-live])").concat([$("pvTurn"), $("bpTurn")]) },   /* a line that answers a key stays */
          { k: "scale", el: id === "band" ? [$("scaleRow"), $("scaleSay")] : [q(".sc-row", pblk)], head: function () { return q(".sc-row .plab"); } },
          { k: "patterns", el: [cblk, q(".nk-theory", pblk)] },
          { k: "wheel", el: [$("wheelBlk")], head: function () { return q("#wheelBlk>h2"); } },
          { k: "amp", el: [$("ampBlk")], head: function () { return q("#ampBlk>h2"); } },
          { k: "live", el: [$("liveBlk")], head: function () { return q("#liveBlk h2"); } },
          { k: "dials", el: [dials] },
          { k: "learn", el: [$("learnBlk")], head: function () { return q("#lgBox>summary"); }, open: "#lgBox" },
          { k: "lessons", el: [$("lessons"), $("aogLearn"), $("pgPanel")] }
        ]
      };
    }
    if (id === "pads") {
      var cols = q(".pm-cols"), right = cols && cols.children[1]; if (!right) return null;
      return {
        /* the loop's file and the take sit at the foot of the sequencer, so record and send show with the pads */
        moves: [[q(".pm-rec"), right, "end"], [$("bigBtn") && $("bigBtn").parentNode, $("line"), "before"]],
        barAfter: cols,
        secs: [
          { k: "timing", el: [row($("qSel")), row($("rptBtn"))] },
          { k: "fx", el: [$("ampBlk")], head: function () { return $("fxH"); } },
          { k: "loopfile", el: [$("loopFile")] },   /* AOG-PADS-LOOP-ADD-V1: Save as .wav and Send to the turntables */
          { k: "lessons", el: [$("lessons"), $("aogLearn")] }
        ]
      };
    }
    if (id === "kit") {
      var rec = q(".kp-rec"), pn = $("pedalsNear"), kb = $("kitBox"); if (!rec || !kb) return null;
      return {
        moves: [[rec, pn && pn.parentNode === kb.parentNode ? pn : kb, "after"]],
        barAfter: rec,
        secs: [
          { k: "how", el: [$("kpTurn")] },
          { k: "beat", el: [$("beatBox")], head: function () { return $("beatH"); } },
          { k: "fx", el: [$("ampBlk")], head: function () { return $("fxH"); } },
          { k: "lessons", el: [$("lessons"), $("aogLearn")] }
        ]
      };
    }
    if (id === "decks") {
      var mixer = $("mixer"); if (!mixer || !$("decks")) return null;
      return {
        barAfter: mixer,
        secs: [
          { k: "how", el: [$("padHint")] },
          { k: "records", el: [$("made"), $("crate")], head: function () { return q("#made>h3"); } },
          { k: "bars", el: [$("bars")], head: function () { return q("#bars>h3"); } },
          { k: "lessons", el: [$("aogLearn"), $("lessons"), $("tagLong"), $("pgPanel")] }
        ]
      };
    }
    return null;
  }
  function compact() {
    var id = here(); if (!shell || !id || id === "studio" || !D.body) return;
    var sp = compactSpec(id); if (!sp) return;
    var es = lang() === "es", W = function (k) { return CW[k][es ? 1 : 0]; };
    D.documentElement.classList.add("aog-compact");
    /* 1 · the controls you play with, in one row under the instrument */
    if (sp.ctl) {
      var ctl = sp.host.querySelector(".aog-ctl");
      if (!ctl) {
        ctl = D.createElement("div"); ctl.className = "aog-ctl";
        sp.ctl.forEach(function () { var r = D.createElement("div"); r.className = "aog-ctl-row"; ctl.appendChild(r); });
      }
      if (ctl.parentNode !== sp.host || ctl.previousSibling !== sp.after) sp.host.insertBefore(ctl, sp.after.nextSibling);
      sp.ctl.forEach(function (list, i) { var r = ctl.children[i];
        list.forEach(function (e) { if (e && e.parentNode !== r) r.appendChild(e); }); });
      var tail = ctl;
      (sp.lines || []).forEach(function (e) { if (e) { if (tail.nextSibling !== e) sp.host.insertBefore(e, tail.nextSibling); tail = e; } });
    }
    (sp.moves || []).forEach(function (m) {
      var e = m[0], r = m[1]; if (!e || !r || e === r || e.contains(r)) return;
      if (m[2] === "end") { if (e.parentNode !== r || r.lastElementChild !== e) r.appendChild(e); }
      else if (m[2] === "before") { if (e.nextSibling !== r) r.parentNode.insertBefore(e, r); }
      else if (r.nextSibling !== e) r.parentNode.insertBefore(e, r.nextSibling);
    });
    if (sp.krow) (sp.toKrow || []).forEach(function (e) { if (e && e.parentNode !== sp.krow) sp.krow.appendChild(e); });
    (sp.dup || []).forEach(function (e) { if (e && !e.hasAttribute("data-aog-dup")) e.setAttribute("data-aog-dup", ""); });
    /* 2 · Any chord, folded behind one button beside Lower and Higher */
    if (sp.any) {
      var ab = $("aogAnyBtn"), open = !!kept(ANY_KEY)[id];
      if (!ab) {
        ab = D.createElement("button"); ab.type = "button"; ab.id = "aogAnyBtn"; ab.className = "pbtn aog-anyb";
        if (sp.any.id) ab.setAttribute("aria-controls", sp.any.id);
        ab.addEventListener("click", function () {
          var on = ab.getAttribute("aria-expanded") !== "true"; keep(ANY_KEY, id, on ? 1 : 0);
          ab.setAttribute("aria-expanded", on ? "true" : "false"); sp.any.classList.toggle("aog-shut", !on); hwSoon();
        });
        ab.setAttribute("aria-expanded", open ? "true" : "false"); sp.any.classList.toggle("aog-shut", !open);
      }
      if (sp.krow) { if (ab.parentNode !== sp.krow) sp.krow.appendChild(ab); }
      else if (!ab.parentNode) sp.any.parentNode.insertBefore(ab, sp.any);
      if (ab.textContent !== W("any")) ab.textContent = W("any");
    }
    /* 3 · More: one menu, then the part you picked */
    var bar = $("aogMore");
    if (!bar) {
      bar = D.createElement("div"); bar.id = "aogMore"; bar.className = "aog-more no-print";
      bar.innerHTML = '<label class="aog-more-in"><span class="aog-more-l"></span><select id="aogMoreSel"></select></label>';
      bar.querySelector("select").addEventListener("change", function () { moreShow(this.value, true); });
    }
    /* in a room with a row of controls, More is the last of them (labelled like the others); elsewhere a row of its own */
    var bh = (sp.ctl && sp.host.querySelector(".aog-ctl>.aog-ctl-row:last-child")) || sp.bar;
    if (sp.barAfter) { if (sp.barAfter.nextSibling !== bar) sp.barAfter.parentNode.insertBefore(bar, sp.barAfter.nextSibling); }
    else if (bar.parentNode !== bh || bh.lastElementChild !== bar) bh.appendChild(bar);
    /* a part the page itself keeps hidden (a line only a tablet shows) is not offered */
    var secs = sp.secs.map(function (s) { s.el = s.el.filter(Boolean); return s; }).filter(function (s) { return s.el.some(function (e) { return !e.hidden; }); });
    secs.forEach(function (s) { s.el.forEach(function (e) { if (e.getAttribute("data-aog-sec") !== s.k) e.setAttribute("data-aog-sec", s.k); }); });
    var want = bar.hasAttribute("data-set") ? (bar.getAttribute("data-on") || "") : (kept(MORE_KEY)[id] || "");
    if (!secs.some(function (s) { return s.k === want; })) want = "";
    var sel = bar.querySelector("select"), opts = [["", ""]].concat(secs.map(function (s) { return [s.k, nameOf(s, es)]; }));
    var sig = (es ? "es|" : "en|") + opts.map(function (o) { return o.join("="); }).join("|");
    if (sel.getAttribute("data-sig") !== sig) {
      sel.innerHTML = opts.map(function (o) { var e = D.createElement("option"); e.value = o[0]; e.textContent = o[1]; return e.outerHTML; }).join("");
      sel.setAttribute("data-sig", sig);
    }
    var lab = bar.querySelector(".aog-more-l"); if (lab.textContent !== W("more")) lab.textContent = W("more");
    if (sel.getAttribute("aria-label") !== W("more")) sel.setAttribute("aria-label", W("more"));
    MORE = { id: id, bar: bar, sel: sel, secs: secs, W: W };
    moreShow(want, false);
  }
  var MORE = null;
  function moreShow(k, byHand) {
    var M = MORE; if (!M) return;
    var bar = M.bar, sel = M.sel;
    if (byHand) { bar.setAttribute("data-set", ""); keep(MORE_KEY, M.id, k); }
    if (bar.getAttribute("data-on") !== k) bar.setAttribute("data-on", k);
    if (sel.value !== k) sel.value = k;
    var first = sel.options[0], fw = M.W(k ? "close" : "choose"); if (first && first.textContent !== fw) first.textContent = fw;
    var shown = null;
    M.secs.forEach(function (s) { s.el.forEach(function (e) {
      var on = s.k === k; if (on !== e.hasAttribute("data-aog-on")) { if (on) e.setAttribute("data-aog-on", ""); else e.removeAttribute("data-aog-on"); }
      if (on && !shown && e.getClientRects().length) shown = e; }); });
    if (!byHand) return;
    var s = M.secs.filter(function (x) { return x.k === k; })[0];
    if (s && s.open) { var d = D.querySelector(s.open); if (d && !d.open) d.open = true; }
    hwSoon();
    try { window.dispatchEvent(new Event("resize")); } catch (e) {}
    /* when the part opens low on the screen (or above it), the page brings its top into sight, at once (no gliding) */
    if (shown) { var r = shown.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * 0.7) window.scrollBy(0, r.top - Math.round(innerHeight * 0.15)); }
  }
  /* AOG-KEYS-AFTER-MENU-V1 (Jimmy, 2026-10-09, on his iPad: "I am trying the church organs and other instruments and they
     don't work using the iPad keyboard"). After a menu is used (the sound, the key, a pattern), an iPad leaves the keyboard
     with that menu, and the instruments rightly ignore keys typed into a menu, so no key played. Once a choice is made the
     menu lets go, and the next key plays the instrument. (Tab still carries on from the menu.) */
  /* Someone stepping through a menu with the arrow keys on a computer keeps it: the change came from a key pressed on the
     menu itself, so it is left alone. */
  var selKeyAt = 0;
  D.addEventListener("keydown", function (e) { var t = e.target; if (t && t.tagName === "SELECT") selKeyAt = Date.now(); }, true);
  D.addEventListener("change", function (e) {
    var t = e.target; if (!t || t.tagName !== "SELECT" || t.multiple) return;
    if (Date.now() - selKeyAt < 600) return;
    setTimeout(function () { if (D.activeElement === t) t.blur(); }, 0);
  }, true);
  /* ══ AOG-ROOMS-ROOM-V1 (Jimmy, 2026-10-09: "1, 3, 2, 4" — first, every room in the control room). Inside the Recording
     Studio a room sits in the same dim, warm room as the Mixing Desk, not on paper: its page takes the room's colour and the
     instrument is the lit thing in it. And in every room, on its own page too, a menu on a dark panel is the desk's dark
     window with gold type (class aog-hw), not a cream box. A menu on a light card keeps its own look. ══ */
  if (shell) ss.textContent += "html.in-studio,html.in-studio:root:root body{background-color:#17110c!important;background-image:none!important}" +
    "html.in-studio .aog-learn{border-color:#3a2c1c!important;box-shadow:0 10px 24px rgba(0,0,0,.45)}" +
    /* AOG-STUDIO-FIRST-V2: the room's how-to line on a paper slip under the instrument */
    "html.in-studio .aog-slip{max-width:36rem;margin:.9rem 0 .8rem;padding:.75rem 1.1rem;border-radius:2px;background-color:#f7f0e1;" +
    "background-image:linear-gradient(#fbf6ea,#f1e7d1);color:#1f1a12!important;font:italic 400 1.02rem/1.4 Fraunces,Georgia,serif!important;" +
    "box-shadow:0 8px 16px rgba(0,0,0,.45),0 1px 1px rgba(0,0,0,.2);transform:rotate(-.4deg)}" +
    "@media (prefers-reduced-motion:reduce){html.in-studio .aog-slip{transform:none}}";
  /* AOG-ROOMS-COMPACT-V1: a part out of sight, a duplicate, a folded Any chord; the row of controls; the More menu */
  if (shell) ss.textContent += "html.in-studio [data-aog-sec]:not([data-aog-on]),html.in-studio [data-aog-dup],html.in-studio .any.aog-shut{display:none!important}" +
    "html.in-studio.aog-compact #rig .blk>h2[data-t=neckH],html.in-studio.aog-compact #rig .blk>h2[data-t=keysH]{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:0!important}" +
    "html.in-studio.aog-compact #rig>.plate{display:none}html.in-studio.aog-compact #rig{padding-top:12px}" +   /* the doors name the room: said once */
    "html.in-studio .aog-ctl{margin:.75rem 0 .1rem}html.in-studio .aog-ctl-row{display:flex;flex-wrap:wrap;gap:.6rem .8rem;align-items:flex-end}" +
    "html.in-studio .aog-ctl-row+.aog-ctl-row{margin-top:.6rem}html.in-studio .aog-ctl-row:empty{display:none}html.in-studio .aog-ctl-row>*{margin:0!important;min-width:0}" +
    "html.in-studio .aog-ctl .sp-wrap{flex:1 1 21rem}html.in-studio .aog-ctl .sp-row{flex-wrap:nowrap}html.in-studio .aog-ctl .sp-row .field{flex:1 1 0}" +
    "html.in-studio .aog-ctl-row>.row{flex:0 1 auto;flex-wrap:nowrap;gap:.6rem}html.in-studio .aog-ctl-row>.row>.field{flex:0 1 8rem}html.in-studio .aog-ctl-row>.row>.field.small{flex:0 0 auto}" +
    "html.in-studio .aog-ctl .seg{display:flex;flex-wrap:nowrap}html.in-studio .aog-ctl-row>.row:has(#sendBtn){flex-wrap:wrap}" +
    "html.in-studio .aog-krow-top #soloMode{display:flex;flex-wrap:nowrap;gap:.4rem;margin:0}html.in-studio .aog-krow-top #soloMode>*{margin:0}" +
    "html.in-studio .aog-ctl .krow{flex:0 1 auto;margin:0}" +
    "@media (max-width:699px){html.in-studio .aog-ctl #pedalsNear{order:-1}html.in-studio .aog-ctl-row>.row{flex-wrap:wrap}html.in-studio .aog-ctl-row>.row>.field{flex:0 0 6rem}html.in-studio .aog-ctl .sp-wrap{flex-basis:100%}}" +
    "html.in-studio .aog-ctl #pedalsNear{flex:1 1 100%}html.in-studio .aog-ctl #pedalsNear:has(.aa-none){flex:1 1 13rem}" +
    "html.in-studio .aog-ctl #pedalsNear .aa-near{margin:0}html.in-studio .aog-ctl #pedalsNear .aa-none{display:none}" +
    "html.in-studio .aog-ctl #pedalsNear:has(.aa-none) .aa-near{padding:0;border:0;background:none}" +
    "html.in-studio .aog-ctl #pedalsNear:has(.aa-none) .aa-nearh{margin:0;display:grid;gap:0}html.in-studio .aog-ctl #pedalsNear:has(.aa-none) .aa-nearh select{width:100%}" +
    "html.in-studio .aog-ctl #pedalsNear:has(.aa-none) .aa-nearh b{font-size:.72rem;letter-spacing:.12em;margin:0 0 .35rem}" +
    "html.in-studio.aog-compact #pedalsNear .aa-none{display:none}html.in-studio.aog-compact #pedalsNear:has(.aa-none) .aa-near{padding:0;border:0;background:none;margin:.4rem 0}" +
    "html.in-studio.aog-compact #pedalsNear:has(.aa-none) .aa-nearh{margin:0}" +
    "html.in-studio .aog-ctl~.line:empty{margin:0}html.in-studio .aog-ctl+.line{margin-top:.45rem}" +
    "html.in-studio.aog-compact #rig{margin-top:.5rem}" +
    "html.in-studio .aog-anyb::after{content:' \\25BE'}html.in-studio .aog-anyb[aria-expanded=true]::after{content:' \\25B4'}" +
    "html.in-studio .aog-more{margin:.9rem 0 .2rem;padding:.8rem 0 0;border-top:1px solid #2f3339}" +
    "html.in-studio .aog-ctl-row>.aog-more{margin:0 0 0 auto!important;padding:0;border:0;flex:0 1 15rem}" +
    "html.in-studio .aog-more-in{display:grid;gap:.35rem;margin:0;max-width:24rem}" +
    "html.in-studio .aog-more-l{font:800 .72rem/1.2 var(--sans,system-ui,sans-serif);letter-spacing:.14em;text-transform:uppercase;color:#e3dac9}" +
    "html.in-studio .aog-more select{width:100%;min-width:0;min-height:48px;font-size:16px}" +
    /* a phone held upright: Lower, the frets and Higher on one line, the ways to play under them */
    "@media (max-width:699px){html.in-studio .aog-krow-top{gap:.4rem .5rem;margin-bottom:.45rem}html.in-studio.aog-compact #rig{margin-top:.2rem;padding-top:9px}html.in-studio .aog-krow-top .range{min-width:0;flex:1 1 auto}" +
    "html.in-studio .aog-krow-top .pbtn{padding-left:.7rem;padding-right:.7rem}html.in-studio .aog-krow-top #soloMode{margin-right:auto}}" +
    /* the Drum Machine: the whole-screen button beside the ready line; on a phone on its side the pads and the sequencer
       side by side, the pads as big as the screen's height allows */
    "@media (min-width:700px){html.in-studio.aog-compact .pm-bigrow{float:right;margin:0 0 6px .7rem}html.in-studio.aog-compact .pm-cols #pads{clear:both}}" +
    /* a phone held upright: six pads across, each a finger wide, never over each other */
    /* AOG-PAD-NAME-CLEAR-V1 (2026-10-19): on a phone a two-line pad name (Open hat, Cross-stick) sat over the pad number; the top padding keeps it under */
    "@media (max-width:699px){html.in-studio.aog-compact .pm-cols .pad{min-height:0;padding:13px 2px 2px}html.in-studio.aog-compact .pm-cols .pad .pn{font-size:11px;overflow-wrap:normal;max-width:100%;overflow:hidden}html.in-studio.aog-compact .pm-cols .pad .pn.long{font-size:10px;overflow-wrap:anywhere}}" +
    "@media (orientation:landscape) and (max-height:500px){html.in-studio.aog-compact .pm-cols{grid-template-columns:min(58%,calc((100vh - 112px) * 1.5)) minmax(0,1fr);align-items:start}" +
    "html.in-studio.aog-compact .pm-cols #pads{max-width:none;margin:0}html.in-studio.aog-compact .pm-cols .pad{min-height:0}html.in-studio.aog-compact .pm-cols .pad .pn{font-size:13px}html.in-studio.aog-compact .pm-cols .pad .pn.long{font-size:11px}" +
    "html.in-studio.aog-compact .pm-cols>div:first-child{display:flex;flex-direction:column}html.in-studio.aog-compact .pm-cols>div:first-child>*{order:3}" +
    "html.in-studio.aog-compact .pm-cols>div:first-child>.pm-line,html.in-studio.aog-compact .pm-cols>div:first-child>.pm-now{order:0;margin:.1rem 0 .3rem;font-size:.9rem}" +
    "html.in-studio.aog-compact .pm-cols>div:first-child>#pads{order:1}html.in-studio.aog-compact .pm-cols .pm-bigrow{order:2;float:none;justify-content:flex-start;margin:8px 0 0}}" +
    /* the Drum Kit: the kit as big as the screen allows, with its menu, Record and More under it */
    /* the Turntables: a card with nothing open in it steps aside; on a short screen the record is a little smaller, with
       REV beside it, and the pitch on one line; on a phone on its side the record and Start come first */
    "html.in-studio.aog-compact #cratecard:not(:has([data-aog-on])){display:none!important}" +
    "@media (max-width:700px){html.in-studio.aog-compact .deck .platter-wrap{width:min(190px,64%);margin:.3rem auto;position:relative}html.in-studio.aog-compact .deck .platter-wrap .platter{width:100%}" +
    "html.in-studio.aog-compact .deck .platter-wrap .revc{position:absolute;left:calc(100% + 10px);bottom:0;margin:0}html.in-studio.aog-compact .deck .wave{height:40px}}" +
    "@media (min-width:701px) and (max-height:860px){html.in-studio.aog-compact .decks .deck .platter-wrap{width:min(172px,100%);position:relative;margin:.35rem auto .3rem}" +
    "html.in-studio.aog-compact .decks .deck .platter-wrap .revc{position:absolute;left:calc(100% + 14px);bottom:0;margin:0}html.in-studio.aog-compact .deck .wave{height:40px}" +
    "html.in-studio.aog-compact .deck>label.knob{display:grid;grid-template-columns:auto auto auto minmax(0,1fr);align-items:center;gap:.5rem}html.in-studio.aog-compact .deck>label.knob input{margin:0}}" +
    "@media (orientation:landscape) and (max-height:500px){html.in-studio.aog-compact .deck{display:flex;flex-direction:column}html.in-studio.aog-compact .deck>*{order:3}" +
    "html.in-studio.aog-compact .deck>.dhead{order:0}html.in-studio.aog-compact .decks .deck>.platter-wrap{order:1;width:min(128px,100%);margin:.2rem auto}html.in-studio.aog-compact .deck>.row:has([data-play]){order:2}" +
    "html.in-studio.aog-compact .wrap{padding-top:.4rem}html.in-studio.aog-compact .pairbar{margin-top:0}" +
    "html.in-studio.aog-compact .xfade.xf-top{position:relative;padding:.1rem 2.6rem;margin:0 0 .5rem}html.in-studio.aog-compact .xf-top .xends{position:absolute;left:.8rem;right:.8rem;top:50%;transform:translateY(-50%);pointer-events:none}" +
    "html.in-studio.aog-compact .xf-top .xends>:not(:first-child):not(:last-child){visibility:hidden}}" +
    "html.in-studio.aog-compact .deck>label.knob input{width:100%}" +
    "html.in-studio.aog-compact #kitBox>svg.kit{width:auto;height:auto;max-width:100%;max-height:max(240px,calc(100vh - 270px));margin:0 auto}";
  var HW = D.createElement("style"); HW.id = "aog-hw-css";
  HW.textContent = "html select.aog-hw{color:#f6e3b4!important;background-color:#121316!important;border:1px solid #5b4a24!important;border-radius:9px!important;" +
    "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e0b25a' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\"),linear-gradient(#0b0c0e,#17181c)!important;" +
    "background-repeat:no-repeat,no-repeat!important;background-position:right 12px center,0 0!important;background-size:16px,100% 100%!important;" +
    "box-shadow:inset 0 2px 5px rgba(0,0,0,.85),0 1px 0 rgba(255,255,255,.07)!important;-webkit-appearance:none;appearance:none;padding-right:38px!important}" +
    "html select.aog-hw:focus-visible{border-color:#f0c26e!important}html select.aog-hw option,html select.aog-hw optgroup{background:#17181c;color:#f1ebdf}";
  (D.head || D.documentElement).appendChild(HW);
  function rgbOf(str) { var m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(str || ""); return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] } : null; }
  function lum(c) { var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); }
  /* what is behind an element: the first ancestor with a solid colour, or the first colour of its gradient */
  function behind(el) {
    for (var n = el.parentElement; n && n !== D.documentElement; n = n.parentElement) {
      var cs = getComputedStyle(n), c = rgbOf(cs.backgroundColor);
      if (c && c.a > 0.5) return c;
      if (cs.backgroundImage && cs.backgroundImage !== "none") { var g = rgbOf(cs.backgroundImage); if (g && g.a > 0.5) return g; }
    }
    var hb = rgbOf(getComputedStyle(D.documentElement).backgroundColor);   /* the page itself, or paper when it is see-through */
    return hb && hb.a > 0.5 ? hb : { r: 247, g: 242, b: 230, a: 1 };
  }
  function hardware() {
    /* AOG-STUDIO-SMOOTH-V1: every menu is looked at first and marked after, so the page works its styles out once */
    var marks = [];
    [].forEach.call(D.querySelectorAll("select:not(.aog-hw):not(.aog-hw-no)"), function (s) {
      if (s.closest(".sp-keep,.aogtop,.aog-learn")) { marks.push([s, "aog-hw-no"]); return; }
      if (!s.offsetParent && s.getClientRects().length === 0) return;   /* not drawn yet: looked at again later */
      marks.push([s, lum(behind(s)) < 0.12 ? "aog-hw" : "aog-hw-no"]);
    });
    marks.forEach(function (m) { m[0].classList.add(m[1]); });
  }
  var hwT = 0, hwSoon = function () { clearTimeout(hwT); hwT = setTimeout(hardware, 120); };
  function hwStart() { hardware(); try { new MutationObserver(hwSoon).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open"] }); } catch (e) {} window.addEventListener("load", hwSoon); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", hwStart); else hwStart();

  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
  /* after the doors and the menus are drawn; the course box arrives later (aog-grace.js), so it is watched for a while */
  if (shell) {
    /* AOG-STUDIO-SMOOTH-V1: a burst of changes while the room loads asks once, just before the screen is drawn again,
       not once per change (and never shows the room half moved) */
    var surface = function () { firstSurface(); try { compact(); } catch (e) {} };   /* AOG-ROOMS-COMPACT-V1 */
    var fsT = 0, fsSoon = function () { if (!fsT) fsT = requestAnimationFrame(function () { fsT = 0; surface(); }); };
    var later = function () {
      surface();
      try { var mo = new MutationObserver(function () { if (!fsT && D.querySelector(".aog-course-band:not(.aog-learn *),.pm-guide:not(.aog-learn *)")) fsSoon(); });
        mo.observe(D.body, { childList: true, subtree: true }); setTimeout(function () { mo.disconnect(); }, 15000); } catch (e) {}
      window.addEventListener("load", surface);
      /* a phone turned back upright brings its instrument home from the whole-screen view: the room is fitted again */
      var rzT = 0; window.addEventListener("resize", function () { clearTimeout(rzT); rzT = setTimeout(fsSoon, 250); });
      try { new MutationObserver(function () { setTimeout(fsSoon, 60); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}   /* More's words follow the language */
    };
    if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", later); else later();
  }

  /* AOG-AUDIO-WARM-V1 (2026-10-11) — Jimmy: "the studio and all its instruments should be lighting fast in their reaction
     time!!!!" The first tap in a room used to build its whole sound engine (the context, the chain, the room's echo)
     before the note could sound: up to 0.4 s on a phone, on the very first note. Now, once a room is open and the page
     is quiet, its engine is built and waits, silent and paused (nothing plays and nothing is heard). The first tap only
     wakes it, as every later tap does. A room's engine is its own ctx(), the same one its taps call. */
  (function () {
    var id = here(); if (!/^(pads|kit|piano|guitar|bass|band)$/.test(id)) return;
    var done = false;
    function go() { if (done || D.hidden) return; done = true; try { if (typeof window.ctx === "function") window.ctx(); } catch (e) {} }
    function soon() { if (window.requestIdleCallback) window.requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 900); }
    if (D.readyState === "complete") setTimeout(soon, 300); else window.addEventListener("load", function () { setTimeout(soon, 300); });
    D.addEventListener("visibilitychange", function () { if (!D.hidden && !done) soon(); });
  })();
})();
