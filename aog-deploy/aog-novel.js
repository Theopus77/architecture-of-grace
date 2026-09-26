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
  var render = function (i, push) {
    if (!book) return;
    i = Math.max(0, Math.min(book.sections.length - 1, i | 0));
    at = i; stopSay();
    var s = book.sections[i];
    page.className = "nv-page" + (s.kind === "part" ? " part" : "");
    var h = "";
    var where = book.room + " · " + book.title;
    if (s.kicker) h += '<p class="kicker">' + esc(pretty(s.kicker)) + "</p>";
    else if (s.kind === "note") h += '<p class="kicker">' + esc(book.room) + "</p>";
    h += "<h2>" + esc(s.title) + "</h2>";
    h += '<p class="where">' + esc(where) + "</p>";
    var body = "";
    for (var b = 0; b < s.blocks.length; b++) {
      var k = s.blocks[b];
      if (k.k === "break") body += "<hr>";
      else if (k.k === "q") h += '<p class="q">' + esc(k.t) + "</p>";
      else body += '<p class="' + (k.k === "c" ? "c" : "") + '">' + esc(k.t) + "</p>";
    }
    h += '<div class="text">' + body + "</div>";
    page.innerHTML = h;
    /* the picker */
    var pick = $("#nvPick"); pick.value = String(i);
    /* the pager */
    var prev = i > 0 ? book.sections[i - 1] : null, next = i < book.sections.length - 1 ? book.sections[i + 1] : null;
    pager.innerHTML =
      (prev ? '<button class="nv-btn prev" type="button" data-go="' + (i - 1) + '"><small>' + T("Previous", "Anterior") + '</small><span class="t">' + esc(label(prev)) + "</span></button>" : "<span></span>") +
      (next ? '<button class="nv-btn next primary" type="button" data-go="' + (i + 1) + '"><small>' + T("Next", "Siguiente") + '</small><span class="t">' + esc(label(next)) + "</span></button>" : "<span></span>");
    $("#nvPrev").disabled = !prev; $("#nvNext").disabled = !next;
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
    }
    var pick = $("#nvPick"), h = "", grp = null;
    for (var j = 0; j < book.sections.length; j++) {
      var sec = book.sections[j];
      if (sec.kind === "part") { if (grp) h += "</optgroup>"; grp = sec; h += '<optgroup label="' + esc(T("Part", "Parte") + " " + sec.n + " · " + sec.title) + '">'; }
      h += '<option value="' + j + '">' + esc(sec.kind === "chapter" ? T("Chapter", "Capítulo") + " " + sec.n + " · " + sec.title : (sec.kind === "part" ? T("Part", "Parte") + " " + sec.n + " · " + sec.title : sec.title)) + "</option>";
    }
    if (grp) h += "</optgroup>";
    pick.innerHTML = h;
    foot.innerHTML = esc(book.title) + " · " + esc(book.author) + ' · <a href="' + esc(book.pdf) + '" target="_blank" rel="noopener">' + T("The whole book (PDF)", "El libro entero (PDF)") + "</a>";
    var want = 0;
    try { var q = new URL(location.href).searchParams.get("ch"); if (q != null && q !== "") want = parseInt(q, 10); else { var m = parseInt(ls.get("aog.novel." + KEY + ".at"), 10); if (m >= 0) want = m; } } catch (e) {}
    if (!(want >= 0)) want = 0;
    render(want, false);
  };
  try {
    fetch("/novels/" + KEY + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(start).catch(fail);
  } catch (e) { fail(); }
})();
