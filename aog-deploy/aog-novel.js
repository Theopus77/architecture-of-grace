/* ══ AOG-NOVEL-V1 (2026-09-26) — THE NOVEL READER ═════════════════════════════
   One engine for all six books. The page carries <main class="novel"
   data-novel="room-18">; this file fetches /novels/room-18.json (the PDF's
   words, exactly, section by section) and shows one section at a time:

     • a chapter drop-down (a menu, not a wall of buttons — the site rule),
       Previous / Next, Listen (the site bar's human voice), text size, print;
     • ?ch=N in the address, so a chapter can be shared or put on the board;
     • where you left off, remembered per book (aog.novel.<key>.at);
     • text size remembered for every book (aog.novel.size).

   Nothing here changes a word of the book. ═══════════════════════════════ */
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
    if (s.kind === "chapter") return T("Chapter", "Capítulo") + " " + s.n + " · " + s.title;
    if (s.kind === "part") return T("Part", "Parte") + " " + s.n + " · " + s.title;
    return s.title;
  };
  var pretty = function (k) { return String(k || "").toLowerCase().replace(/(^|\s|-)\S/g, function (m) { return m.toUpperCase(); }); };

  /* ── render one section ───────────────────────────────────────────────── */
  /* the book's Contents, as the manuscript has it: every part and chapter a link (AOG-NOVEL-TOC-V1 —
     Jimmy: "They were interactive fyi" — the PDFs' contents pages and outline jump to each chapter) */
  var renderToc = function (push) {
    at = -1; stopSay();
    page.className = "nv-page toc";
    var h = '<p class="kicker">' + esc(book.room) + '</p><h2>' + T("Contents", "Índice") + '</h2><p class="where">' + esc(book.title) + '</p><ol class="toc">';
    for (var i = 0; i < book.sections.length; i++) {
      var s = book.sections[i];
      if (s.kind === "part") h += '<li class="part"><a href="?ch=' + i + '" data-go="' + i + '"><span class="k">' + esc(pretty(s.kicker) || T("Part", "Parte") + " " + s.n) + '</span><span class="t">' + esc(s.title) + '</span></a></li>';
      else if (s.kind === "chapter") h += '<li><a href="?ch=' + i + '" data-go="' + i + '"><span class="k">' + esc(pretty(s.kicker) || T("Chapter", "Capítulo") + " " + s.n) + '</span><span class="t">' + esc(s.title) + '</span></a></li>';
      else h += '<li class="note"><a href="?ch=' + i + '" data-go="' + i + '"><span class="t">' + esc(s.title) + '</span></a></li>';
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
  var SCENE_ALT = { "12-1": "A pencil drawing of a standing mirror reflecting a window, a small backpack beside it and a potted plant", "12-2": "A pencil drawing of a watering can, a young sprout in a clay pot and a small garden trowel", "12-3": "A pencil drawing of two small chairs facing each other on a round rug, with a ball between them", "12-4": "A pencil drawing of a picnic blanket with a woven basket of apples and more apples on the cloth", "18-1": "A pencil drawing of a trail stop: a backpack, a compass lying on a rock and a small wooden signpost", "18-2": "A pencil drawing of a lighthouse and a small cottage on a rocky headland above a calm sea", "18-3": "A pencil drawing of a wooden footbridge over a stream, with a lantern post at either end", "18-4": "A pencil drawing of an orchard at harvest: a ladder against an apple tree, a wheelbarrow and a basket of apples", "36-1": "A pencil drawing of a quiet dresser with an oval mirror and a plain mask resting beside it", "36-2": "A pencil drawing of a desk under a window, with a desk lamp, an open notebook and a pencil", "36-3": "A pencil drawing of two chairs facing each other by a tall window, a small lantern on a table between them", "36-4": "A pencil drawing of a garden path between lantern posts, leading to an open gate among trees", "104-1": "A pencil drawing of a dressing-table mirror reflecting a window, a plain half mask resting beside it", "104-2": "A pencil drawing of a backpack set down on a park bench, puddles on the path and a tree behind", "104-3": "A pencil drawing of two empty classroom chairs turned to face each other beside a tall window", "104-4": "A pencil drawing of a stone footbridge with lanterns crossing a calm river", "207-1": "A pencil drawing of a brass compass resting on an unrolled map, with a pencil and a star marked in the corner", "207-2": "A pencil drawing of a workbench lamp shining on a mended bowl with seams, tools hung neatly on the wall", "207-3": "A pencil drawing of a lighthouse on a rocky headland above a calm sea, its lamp lit", "207-4": "A pencil drawing of a garden path between rows of fruit trees, leading toward a low hill" };
  var render = function (i, push) {
    if (!book) return;
    if (i < 0) return renderToc(push);
    i = Math.max(0, Math.min(book.sections.length - 1, i | 0));
    at = i; stopSay();
    var s = book.sections[i];
    page.className = "nv-page" + (s.kind === "part" ? " part" : "");
    var h = "";
    var where = book.room + " · " + book.title;
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
      u.lang = "en-US"; u.rate = 0.95;
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
    var pick = $("#nvPick"), h = '<option value="-1">' + T("Contents", "Índice") + "</option>", grp = null;
    for (var j = 0; j < book.sections.length; j++) {
      var sec = book.sections[j];
      if (sec.kind === "part") { if (grp) h += "</optgroup>"; grp = sec; h += '<optgroup label="' + esc(T("Part", "Parte") + " " + sec.n + " · " + sec.title) + '">'; }
      h += '<option value="' + j + '">' + esc(sec.kind === "chapter" ? T("Chapter", "Capítulo") + " " + sec.n + " · " + sec.title : (sec.kind === "part" ? T("Part", "Parte") + " " + sec.n + " · " + sec.title : sec.title)) + "</option>";
    }
    if (grp) h += "</optgroup>";
    pick.innerHTML = h;
    foot.innerHTML = esc(book.title) + " · " + esc(book.author) + ' · <a href="' + esc(book.pdf) + '" target="_blank" rel="noopener">' + T("The whole book (PDF)", "El libro entero (PDF)") + "</a>";
    var want = -1;   /* a first visit opens on the Contents */
    try { var q = new URL(location.href).searchParams.get("ch"); if (q === "toc") want = -1; else if (q != null && q !== "") want = parseInt(q, 10); else { var m = parseInt(ls.get("aog.novel." + KEY + ".at"), 10); if (m >= -1) want = m; } } catch (e) {}
    if (!(want >= -1)) want = -1;
    render(want, false);
  };
  try {
    fetch("/novels/" + KEY + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(start).catch(fail);
  } catch (e) { fail(); }
})();
