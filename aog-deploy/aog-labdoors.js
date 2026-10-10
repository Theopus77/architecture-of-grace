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
      "html.in-studio [data-aog-hero]{display:none!important}";
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
    try { shell.arrived(here()); } catch (e) {}
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
        play = blk("h2[data-t=keysH]") || blk("h2[data-t=neckH]"), amp = D.getElementById("ampBlk"), live = D.getElementById("liveBlk");
      if (choose === play || choose === chords) choose = null;   /* AOG-SOUNDPICK-V1: the instrument choice already sits by the instrument */
      var order = id === "piano" ? [play, chords, choose, wheel, out]
        : id === "band" ? [choose, play, chords, wheel, out]
        : (id === "guitar" || id === "bass") ? [play, chords, choose, wheel, amp, live, out] : null;   /* AOG-STUDIO-FIRST-V2: the instrument first */
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
    var parts = [].slice.call(D.querySelectorAll("body .bench-bar, body .aog-course-band, body .pm-guide")).filter(function (e) {
      if (e.closest(".aog-learn")) return false;
      if (e.classList.contains("bench-bar") && !usable(e)) { e.setAttribute("data-empty", "1"); return false; }
      return true; });
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
    [].forEach.call(D.querySelectorAll("select:not(.aog-hw):not(.aog-hw-no)"), function (s) {
      if (!s.offsetParent && s.getClientRects().length === 0) return;   /* not drawn yet: looked at again later */
      if (s.closest(".sp-keep,.aogtop,.aog-learn")) { s.classList.add("aog-hw-no"); return; }
      s.classList.add(lum(behind(s)) < 0.12 ? "aog-hw" : "aog-hw-no");
    });
  }
  var hwT = 0, hwSoon = function () { clearTimeout(hwT); hwT = setTimeout(hardware, 120); };
  function hwStart() { hardware(); try { new MutationObserver(hwSoon).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open"] }); } catch (e) {} window.addEventListener("load", hwSoon); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", hwStart); else hwStart();

  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
  /* after the doors and the menus are drawn; the course box arrives later (aog-grace.js), so it is watched for a while */
  if (shell) {
    var later = function () {
      firstSurface();
      try { var mo = new MutationObserver(function () { if (D.querySelector(".aog-course-band:not(.aog-learn *),.pm-guide:not(.aog-learn *)")) firstSurface(); });
        mo.observe(D.body, { childList: true, subtree: true }); setTimeout(function () { mo.disconnect(); }, 15000); } catch (e) {}
      window.addEventListener("load", firstSurface);
    };
    if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", later); else later();
  }
})();
