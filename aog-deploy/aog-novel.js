/* ══ AOG-NOVEL-V1 (2026-09-26) — THE NOVEL READER ═════════════════════════════
   One engine for all six books. The page carries <main class="novel"
   data-novel="room-18">; this file fetches /novels/room-18.json (the PDF's
   words, exactly, section by section) and shows one section at a time:

     • a chapter drop-down (a menu, not a wall of buttons — the site rule),
       Previous / Next, Listen (the site bar's human voice), text size, print;
     • ?ch=N in the address, so a chapter can be shared or put on the board;
     • where you left off, remembered per book (aog.novel.<key>.at);
     • text size remembered for every book (aog.novel.size).

   Nothing here changes a word of the book.

   AOG-R36-NOVEL-V1 (2026-10-23) — a book whose <main> carries data-split (Book 3, Room 36) is read one section at a
   time from /novels/<key>/index.json and /novels/<key>/s<i>.json (built by _work/sel/r36/build_novel.py), so a phone
   loads one chapter, not the book. In Spanish it reads /novels/<key>.es/s<i>.json where the chapter exists (else the
   English, with one line saying so) and follows the page's language as it changes. A heavy chapter opens with a calm
   note and the crisis lines; a chapter that goes with a lesson names it. Books without data-split are unchanged. ══ */
(function () {
  "use strict";
  var D = document, H = D.documentElement;
  var main = D.querySelector("main[data-novel]");
  if (!main) return;
  var KEY = main.getAttribute("data-novel");
  var es = function () { return /^es/i.test(H.lang || "") || H.getAttribute("data-lang") === "es"; };
  var T = function (en, sp) { return es() ? sp : en; };
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
             set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  var book = null, at = 0, chapters = [];
  var $ = function (s, r) { return (r || main).querySelector(s); };
  var el = function (tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };

  /* ── build the frame once ─────────────────────────────────────────────── */
  var tools = el("nav", "nv-tools no-print"); tools.setAttribute("aria-label", T("Reading controls", "Controles de lectura"));
  tools.innerHTML =
    '<div class="row">' +
      '<label class="pick"><span>' + T("Chapter", "Capítulo") + '</span><select id="nvPick" aria-label="' + T("Pick a chapter", "Elige un capítulo") + '"></select></label>' +
      '<button class="nv-btn" id="nvPrev" type="button" aria-label="' + T("Previous", "Anterior") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg><span class="lbl">' + T("Previous", "Anterior") + '</span></button>' +
      '<button class="nv-btn" id="nvNext" type="button" aria-label="' + T("Next", "Siguiente") + '"><span class="lbl">' + T("Next", "Siguiente") + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '<button class="nv-btn" id="nvSay" type="button" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7M19 6a9 9 0 010 12"/></svg><span class="lbl">' + T("Listen", "Escuchar") + '</span></button>' +
      '<span class="nv-size" role="group" aria-label="' + T("Text size", "Tamaño del texto") + '"><button type="button" id="nvSmaller" aria-label="' + T("Smaller text", "Letra más pequeña") + '">A</button><button type="button" id="nvBigger" aria-label="' + T("Bigger text", "Letra más grande") + '">A</button></span>' +
      '<button class="nv-btn" id="nvPrint" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z"/></svg><span class="lbl">' + T("Print this chapter", "Imprimir este capítulo") + '</span></button>' +
    '</div>';
  var page = el("article", "nv-page"); page.id = "nvPage"; page.setAttribute("aria-live", "polite");
  var pager = el("nav", "nv-pager no-print"); pager.setAttribute("aria-label", T("Previous and next", "Anterior y siguiente"));
  var foot = el("p", "nv-foot");
  var host = $("#nvHost") || main;
  host.appendChild(tools); host.appendChild(page); host.appendChild(pager); host.appendChild(foot);

  /* text size */
  var SIZES = [0.9, 1, 1.12, 1.26, 1.42], si = 1;
  try { var s0 = parseInt(ls.get("aog.novel.size"), 10); if (s0 >= 0 && s0 < SIZES.length) si = s0; } catch (e) {}
  var applySize = function () { H.style.setProperty("--nv-size", SIZES[si]); ls.set("aog.novel.size", si); };
  applySize();
  $("#nvSmaller").addEventListener("click", function () { if (si > 0) si--; applySize(); });
  $("#nvBigger").addEventListener("click", function () { if (si < SIZES.length - 1) si++; applySize(); });
  $("#nvPrint").addEventListener("click", function () { window.print(); });

  /* ── labels ───────────────────────────────────────────────────────────── */
  var label = function (s, i) {
    var t = s.title;
    if (SPLIT && book) { var j = book.sections.indexOf(s); if (j > -1) t = secTitle(j).title; }
    if (s.kind === "chapter") return T("Chapter", "Capítulo") + " " + s.n + " · " + t;
    if (s.kind === "part") return T("Part", "Parte") + " " + s.n + " · " + t;
    return t;
  };
  var bookTitle = function () { return SPLIT && es() && book.es ? book.es.title : book.title; };
  var bookRoom = function () { return SPLIT && es() && book.es ? book.es.room : book.room; };
  var pretty = function (k) { return String(k || "").toLowerCase().replace(/(^|\s|-)\S/g, function (m) { return m.toUpperCase(); }); };

  /* ── render one section ───────────────────────────────────────────────── */
  /* the book's Contents, as the manuscript has it: every part and chapter a link (AOG-NOVEL-TOC-V1 —
     Jimmy: "They were interactive fyi" — the PDFs' contents pages and outline jump to each chapter) */
  var renderToc = function (push) {
    at = -1; stopSay();
    page.className = "nv-page toc";
    var h = '<p class="kicker">' + esc(bookRoom()) + '</p><h2>' + T("Contents", "Índice") + '</h2><p class="where">' + esc(bookTitle()) + '</p><ol class="toc">';
    for (var i = 0; i < book.sections.length; i++) {
      var s = book.sections[i];
      var tt = SPLIT ? secTitle(i) : s;
      if (s.kind === "part") h += '<li class="part"><a href="?ch=' + i + '" data-go="' + i + '"><span class="k">' + esc(pretty(tt.kicker) || T("Part", "Parte") + " " + s.n) + '</span><span class="t">' + esc(tt.title) + '</span></a></li>';
      else if (s.kind === "chapter") h += '<li><a href="?ch=' + i + '" data-go="' + i + '"><span class="k">' + esc(pretty(tt.kicker) || T("Chapter", "Capítulo") + " " + s.n) + '</span><span class="t">' + esc(tt.title) + '</span></a></li>';
      else h += '<li class="note"><a href="?ch=' + i + '" data-go="' + i + '"><span class="t">' + esc(tt.title) + '</span></a></li>';
    }
    h += "</ol>";
    page.innerHTML = h;
    $("#nvPick").value = "-1";
    pager.innerHTML = '<span></span><button class="nv-btn next primary" type="button" data-go="0"><small>' + T("Begin", "Empezar") + '</small><span class="t">' + esc(label(book.sections[0])) + "</span></button>";
    $("#nvPrev").disabled = true; $("#nvNext").disabled = false;
    ls.set("aog.novel." + KEY + ".at", -1);
    try { var u = new URL(location.href); u.searchParams.set("ch", "toc"); if (push) history.pushState({ ch: -1 }, "", u); else history.replaceState({ ch: -1 }, "", u); } catch (e) {}
    D.title = T("Contents", "Índice") + " · " + book.title + " · Architecture of Grace";
    if (push) window.scrollTo(0, Math.max(0, page.getBoundingClientRect().top + window.pageYOffset - 120));
  };
  var SCENE_ALT = { "12-1": "A pencil drawing of a standing mirror reflecting a window, a small backpack beside it and a leafy plant in a clay pot", "12-2": "A pencil drawing of a watering can, a young sprout in a clay pot and a small garden trowel", "12-3": "A pencil drawing of two small chairs facing each other on a round rug, with a ball between them", "12-4": "A pencil drawing of a picnic blanket with a woven basket of apples and more apples on the cloth", "18-1": "A pencil drawing of a trail stop: a backpack, a compass lying on a rock and a small wooden signpost", "18-2": "A pencil drawing of a lighthouse and a small cottage on a rocky headland above a calm sea", "18-3": "A pencil drawing of a wooden footbridge over a stream, with a lantern post at either end", "18-4": "A pencil drawing of an orchard at harvest: a ladder against an apple tree, a wheelbarrow and a basket of apples", "36-1": "A pencil drawing of a quiet dresser with an oval mirror and a plain calm mask with small eye slits propped up beside it", "36-2": "A pencil drawing of a desk under a window, with a desk lamp, an open notebook and a pencil", "36-3": "A pencil drawing of two chairs facing each other by a tall window, a small lantern on a table between them", "36-4": "A pencil drawing of a garden path between lantern posts, leading to an open gate among trees", "104-1": "A pencil drawing of a dressing-table mirror reflecting a window, a plain half mask resting beside it", "104-2": "A pencil drawing of a backpack set down on a park bench, puddles on the path and a tree behind", "104-3": "A pencil drawing of two empty classroom chairs turned to face each other beside a tall window", "104-4": "A pencil drawing of an arched stone bridge over calm water, with a lantern at each end", "207-1": "A pencil drawing of a brass compass resting on an unrolled map, with a pencil and a star marked in the corner", "207-2": "A pencil drawing of a workbench lamp shining on a mended bowl with seams, tools hung neatly on the wall", "207-3": "A pencil drawing of a lighthouse on a rocky headland above a calm sea, its lamp lit", "207-4": "A pencil drawing of a path between rows of leafy fruit trees hung with fruit, leading toward a low hill" };
  /* AOG-R36-NOVEL-V1: split books fetch one section at a time (English, or Spanish where it exists) */
  var SPLIT = main.hasAttribute("data-split"), cache = {}, wantLang = null;
  var secTitle = function (i) {
    var s = book.sections[i], x = es() && book.es && book.es.sections && book.es.sections[i];
    return { title: (x && x.title) || s.title, kicker: (x && x.kicker) || s.kicker };
  };
  var loadSec = function (i, cb) {
    var lang = es() && book.es && book.es.sections && book.es.sections[i] ? "es" : "en", k = lang + i;
    if (cache[k]) { cb(cache[k], lang); return; }
    var url = lang === "es" ? "/novels/" + KEY + ".es/s" + i + ".json" : "/novels/" + KEY + "/s" + i + ".json";
    fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { cache[k] = j.blocks; cb(j.blocks, lang); })
      .catch(function () { if (lang === "es") { book.es.sections[i] = null; loadSec(i, cb); } else fail(); });
  };
  var render = function (i, push) {
    if (!book) return;
    if (i < 0) return renderToc(push);
    i = Math.max(0, Math.min(book.sections.length - 1, i | 0));
    if (SPLIT && !book.sections[i].blocks) {
      return loadSec(i, function (blocks, lang) { draw(i, push, blocks, lang); });
    }
    draw(i, push, null, "en");
  };
  var draw = function (i, push, blocks, lang) {
    at = i; stopSay();
    var s = book.sections[i];
    if (blocks) { var t0 = SPLIT ? secTitle(i) : s; s = { kind: s.kind, n: s.n, part: s.part, title: t0.title, kicker: t0.kicker, blocks: blocks, note: s.note, with: s["with"] }; }
    page.className = "nv-page" + (s.kind === "part" ? " part" : "");
    var h = "";
    var where = bookRoom() + " · " + bookTitle();
    /* AOG-NOVEL-SCENES-V1 — Jimmy: "enhance what is already there." The lesson pages' drawn
       scene for each unit opens the novel's matching part and heads its chapters. */
    var rm = (KEY.match(/^room-(\d+)$/) || [])[1];
    if (rm && s.part >= 1 && s.part <= 4 && s.kind !== "note") {
      /* AOG-NOVEL-PENCIL-V1 — the pencil drawing (webp, jpg fallback); _work/art/pencil/novel.py */
      var sn = "/novels/scenes/room-" + rm + "-u" + s.part + "-pencil";
      h += '<picture><source srcset="' + sn + '.webp" type="image/webp"><img class="nv-scene' + (s.kind === "part" ? " big" : "") + '" src="' + sn + '.jpg" alt="' + esc(SCENE_ALT[rm + "-" + s.part] || "") + '" width="1200" height="420" loading="eager" decoding="async"></picture>';
    }
    if (s.kicker) h += '<p class="kicker">' + esc(pretty(s.kicker)) + "</p>";
    else if (s.kind === "note") h += '<p class="kicker">' + esc(book.room) + "</p>";
    h += "<h2>" + esc(s.title) + "</h2>";
    h += '<p class="where">' + esc(where) + "</p>";
    if (SPLIT && es() && lang !== "es") h += '<p class="nv-aside">' + esc("Este capítulo todavía no está en español. Aquí está en inglés.") + "</p>";
    if (s.note) h += '<aside class="nv-note" role="note">' + esc(es() ? s.note.es : s.note.en) + "</aside>";
    if (s["with"] && s["with"].length) h += '<p class="nv-with">' + esc(T("Goes with the lesson", "Va con la lección")) + " " +
      s["with"].map(function (w) { return '<a href="/room-36-lessons.html#' + esc(w.id) + '">' + esc(w.code + (w.t ? " · " + w.t : "")) + "</a>"; }).join(", ") + "</p>";
    var body = "";
    for (var b = 0; b < s.blocks.length; b++) {
      var k = s.blocks[b];
      var txt = k.h != null ? k.h : esc(k.t);      /* k.h carries the manuscript's italics as <em> */
      if (k.k === "break") body += "<hr>";
      else if (k.k === "q") h += '<p class="q">' + txt + "</p>";
      else body += '<p class="' + (k.k === "c" ? "c" : k.k === "i" ? "i" : k.k === "sig" ? "sig" : "") + '">' + txt + "</p>";
    }
    h += '<div class="text">' + body + "</div>";
    page.innerHTML = h;
    page.setAttribute("data-lang", lang || "en");
    /* the picker */
    var pick = $("#nvPick"); pick.value = String(i);
    /* the pager */
    var prev = i > 0 ? book.sections[i - 1] : null, next = i < book.sections.length - 1 ? book.sections[i + 1] : null;
    pager.innerHTML =
      (prev ? '<button class="nv-btn prev" type="button" data-go="' + (i - 1) + '"><small>' + T("Previous", "Anterior") + '</small><span class="t">' + esc(label(prev)) + "</span></button>"
            : '<button class="nv-btn prev" type="button" data-go="-1"><small>' + T("Back to", "Volver a") + '</small><span class="t">' + T("Contents", "Índice") + "</span></button>") +
      (next ? '<button class="nv-btn next primary" type="button" data-go="' + (i + 1) + '"><small>' + T("Next", "Siguiente") + '</small><span class="t">' + esc(label(next)) + "</span></button>" : "<span></span>");
    $("#nvPrev").disabled = false; $("#nvNext").disabled = !next;
    ls.set("aog.novel." + KEY + ".at", i);
    try {
      var u = new URL(location.href); u.searchParams.set("ch", i);
      if (push) history.pushState({ ch: i }, "", u); else history.replaceState({ ch: i }, "", u);
    } catch (e) {}
    D.title = label(s) + " · " + book.title + " · Architecture of Grace";
    if (push) { try { window.scrollTo({ top: Math.max(0, page.getBoundingClientRect().top + window.pageYOffset - 120), behavior: "auto" }); } catch (e) { window.scrollTo(0, 0); } }
  };

  /* ── listen: the site bar's voice wrapper picks a human voice ─────────── */
  var S = window.speechSynthesis, saying = false, sayBtn;
  var stopSay = function () {
    saying = false;
    try { if (S) S.cancel(); } catch (e) {}
    if (sayBtn) { sayBtn.classList.remove("on"); sayBtn.setAttribute("aria-pressed", "false"); }
    var r = page.querySelector("p.reading"); if (r) r.classList.remove("reading");
  };
  var say = function () {
    if (!S || !window.SpeechSynthesisUtterance) return;
    var ps = Array.prototype.slice.call(page.querySelectorAll("h2, .q, .text p"));
    if (!ps.length) return;
    saying = true; sayBtn.classList.add("on"); sayBtn.setAttribute("aria-pressed", "true");
    var n = 0;
    var next = function () {
      if (!saying || n >= ps.length) { stopSay(); return; }
      var p = ps[n++];
      var r = page.querySelector("p.reading"); if (r) r.classList.remove("reading");
      p.classList.add("reading");
      try { if (p.getBoundingClientRect().top > window.innerHeight - 80 || p.getBoundingClientRect().top < 100) p.scrollIntoView({ block: "center", behavior: "auto" }); } catch (e) {}
      var u = new SpeechSynthesisUtterance(p.textContent);
      u.lang = (SPLIT && es() && page.getAttribute("data-lang") === "es") ? "es-US" : "en-US"; u.rate = 0.95;
      u.onend = function () { setTimeout(next, 250); };
      u.onerror = function () { stopSay(); };
      S.speak(u);
    };
    try { S.cancel(); } catch (e) {}
    setTimeout(next, 60);
  };
  sayBtn = $("#nvSay");
  sayBtn.addEventListener("click", function () { if (saying) stopSay(); else say(); });
  window.addEventListener("pagehide", stopSay);

  /* ── wiring ───────────────────────────────────────────────────────────── */
  $("#nvPick").addEventListener("change", function () { render(parseInt(this.value, 10), true); });
  $("#nvPrev").addEventListener("click", function () { render(at - 1, true); });
  $("#nvNext").addEventListener("click", function () { render(at + 1, true); });
  pager.addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) render(parseInt(b.getAttribute("data-go"), 10), true); });
  page.addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) { e.preventDefault(); render(parseInt(b.getAttribute("data-go"), 10), true); } });
  window.addEventListener("popstate", function (e) { if (e.state && typeof e.state.ch === "number") render(e.state.ch, false); });
  D.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target; if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
    if (e.key === "ArrowRight") { render(at + 1, true); }
    if (e.key === "ArrowLeft") { render(at - 1, true); }
  });

  /* ── load the book ────────────────────────────────────────────────────── */
  var fail = function () {
    page.className = "nv-msg";
    page.innerHTML = T("This book could not load right now. ", "Este libro no se pudo cargar ahora. ") +
      '<a href="' + esc(main.getAttribute("data-pdf") || "#") + '" target="_blank" rel="noopener">' + T("Open the PDF instead", "Abrir el PDF") + "</a>.";
  };
  var fillPick = function () {
    var pick = $("#nvPick"), h = '<option value="-1">' + T("Contents", "Índice") + "</option>", grp = null;
    for (var j = 0; j < book.sections.length; j++) {
      var sec = book.sections[j], st = SPLIT ? secTitle(j).title : sec.title;
      if (sec.kind === "part") { if (grp) h += "</optgroup>"; grp = sec; h += '<optgroup label="' + esc(T("Part", "Parte") + " " + sec.n + " · " + st) + '">'; }
      h += '<option value="' + j + '">' + esc(sec.kind === "chapter" ? T("Chapter", "Capítulo") + " " + sec.n + " · " + st : (sec.kind === "part" ? T("Part", "Parte") + " " + sec.n + " · " + st : st)) + "</option>";
    }
    if (grp) h += "</optgroup>";
    pick.innerHTML = h; pick.value = String(at);
  };
  /* a split book follows the page's language as it changes (the bar's EN | ES) */
  var relabel = function () {
    var w = function (sel, en, sp) { var e = tools.querySelector(sel); if (e) e.textContent = T(en, sp); };
    w(".pick > span", "Chapter", "Capítulo"); w("#nvPrev .lbl", "Previous", "Anterior"); w("#nvNext .lbl", "Next", "Siguiente");
    w("#nvSay .lbl", "Listen", "Escuchar"); w("#nvPrint .lbl", "Print this chapter", "Imprimir este capítulo");
    if (book) foot.innerHTML = esc(bookTitle()) + " · " + esc(book.author) + ' · <a href="' + esc(book.pdf) + '" target="_blank" rel="noopener">' + T("The whole book (PDF, English)", "El libro entero (PDF, en inglés)") + "</a>";
  };
  if (SPLIT) try { new MutationObserver(function () { if (!book) return; var l = es() ? "es" : "en"; if (l === wantLang) return; wantLang = l; relabel(); fillPick(); render(at, false); }).observe(H, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  var start = function (data) {
    book = data;
    var nc = 0, np = 0;
    chapters = [];
    for (var i = 0; i < book.sections.length; i++) {
      var s = book.sections[i];
      if (s.kind === "chapter") { s.n = ++nc; chapters.push(i); }
      if (s.kind === "part") s.n = ++np;
      s.part = np;                       /* which of the four parts (units) this section sits in */
    }
    fillPick();
    foot.innerHTML = esc(book.title) + " · " + esc(book.author) + ' · <a href="' + esc(book.pdf) + '" target="_blank" rel="noopener">' + T("The whole book (PDF)", "El libro entero (PDF)") + "</a>";
    var want = -1;   /* a first visit opens on the Contents */
    try { var q = new URL(location.href).searchParams.get("ch"); if (q === "toc") want = -1; else if (q != null && q !== "") want = parseInt(q, 10); else { var m = parseInt(ls.get("aog.novel." + KEY + ".at"), 10); if (m >= -1) want = m; } } catch (e) {}
    if (!(want >= -1)) want = -1;
    wantLang = es() ? "es" : "en";
    if (SPLIT) relabel();
    render(want, false);
  };
  try {
    fetch(SPLIT ? "/novels/" + KEY + "/index.json" : "/novels/" + KEY + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(start).catch(fail);
  } catch (e) { fail(); }
})();
