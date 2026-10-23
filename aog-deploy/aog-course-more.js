/* ══ AOG-MORE-V1 (2026-10-23) — Spanish lessons and three ways in, on every course unit page ═══════════════════════
   Jimmy: "DO them all, start with Spanish and three ways in." "This should be showstopper for the young to the old."

   A course unit page (build_course.py) is English inside; only its buttons and headings switch. This file adds:
   - Spanish for everything a learner reads in the unit (stories, readings, words, looks, checks, reviews, the test,
     the word match, the writing task, the contents drawer). It follows the page's language however it changes (the
     page's own switch, the bar's EN | ES, a reload): it watches <html lang>.
   - Three ways in to every reading: Shorter · Just right · More. The choice is one row in each lesson, applies to
     every lesson, and is remembered on this device for every course (aog.course.level.v1).

   Silent until used: the words live in /course-data/<course>-u<N>.es.json (Spanish, with its own Shorter and More)
   and .lv.json (English Shorter and More), fetched only when Spanish or a length other than Just right is chosen.
   No timer, no loop. Built by _work/more/build.py, which also writes this file's <script> tag with data-more="es lv"
   naming the files that exist. The English that was on the page is kept and comes back on English / Just right. */
(function () {
  "use strict";
  var S = document.currentScript, CO = window.AOG_COURSE || {};
  if (S && S.getAttribute("data-course")) { contents(S); return; }
  if (!S || !CO.id || !CO.unit) return;
  var have = (S.getAttribute("data-more") || "").split(/\s+/), ver = S.getAttribute("data-v") || "";
  var HAS_ES = have.indexOf("es") > -1, HAS_LV = have.indexOf("lv") > -1;
  if (!HAS_ES && !HAS_LV) return;
  var D = document, H = D.documentElement, K_LV = "aog.course.level.v1";
  var BASE = "/course-data/" + CO.id + "-u" + CO.unit;
  var level = "";
  try { level = localStorage.getItem(K_LV) || ""; } catch (e) {}
  if (level !== "short" && level !== "more") level = "";

  function lang() { return (H.getAttribute("lang") || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en"; }
  function $$(sel, root) { return Array.prototype.slice.call((root || D).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ── the data: fetched once, on the first need ── */
  var data = {}, waiting = {};
  function get(kind, cb) {
    if (data[kind]) { cb(data[kind]); return; }
    if (waiting[kind]) { waiting[kind].push(cb); return; }
    waiting[kind] = [cb];
    fetch(BASE + "." + kind + ".json" + (ver ? "?v=" + ver : ""), { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { data[kind] = j; var w = waiting[kind]; waiting[kind] = null; w.forEach(function (f) { f(j); }); })
      .catch(function () { waiting[kind] = null; });
  }

  /* ── key words, as the builder writes them: *word* → a button carrying its meaning ── */
  function fold(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function near(a, b) {   /* a key word and its form in the text: generación / generaciones */
    a = fold(a); b = fold(b);
    if (a.indexOf(b) > -1 || b.indexOf(a) > -1) return true;
    var n = 0, m = Math.min(a.length, b.length); while (n < m && a.charAt(n) === b.charAt(n)) n++;
    return n >= 5 && n >= 0.7 * m;
  }
  function kw(text, words) {
    return esc(text).replace(/\*([^*]+)\*/g, function (_, w) {
      var lw = w.toLowerCase(), d = null, k;
      for (k in words) if (k === lw) { d = words[k]; break; }
      if (d == null) for (k in words) if (near(k, lw)) { d = words[k]; break; }
      return d == null ? "<em>" + w + "</em>" : '<button type="button" class="kw" data-def="' + d + '">' + w + "</button>";
    }).replace(/&#x27;/g, "’");
  }
  function wordMap(pairs) { var m = {}; (pairs || []).forEach(function (p) { m[String(p[0]).toLowerCase()] = esc(p[1]); }); return m; }

  /* ── every lesson's reading, as the page has it in English ── */
  var LES = $$("article.les[data-lid]").map(function (a) {
    var rd = a.querySelector(".reading");
    var words = $$(".words dt", a).map(function (dt) { return [dt.textContent, dt.nextElementSibling ? dt.nextElementSibling.textContent : ""]; });
    return { lid: a.getAttribute("data-lid"), el: a, rd: rd, en: rd ? rd.innerHTML : "", words: words };
  });

  function paras(list, words) { return (list || []).map(function (p) { return "<p>" + kw(p, words) + "</p>"; }).join(""); }
  function moreBox(list, words, l) {
    if (!list || !list.length) return "";
    return '<div class="aog-more-x"><span class="k">' + (l === "es" ? "Algo más" : "One more thing") + "</span>" + paras(list, words) + "</div>";
  }
  function paintReadings() {
    var l = lang(), ES = l === "es" && data.es, src = ES ? data.es.lv || {} : (data.lv || {}).l || {};
    LES.forEach(function (x) {
      if (!x.rd) return;
      var esl = ES ? (data.es.l || {})[x.lid] : null, lv = src[x.lid] || {};
      var words = wordMap(esl ? esl.w : x.words);
      var html;
      if (level === "short" && lv.s) html = paras(lv.s, words);
      else {
        html = esl ? paras(esl.r, words) : x.en;
        if (level === "more" && lv.m) html += moreBox(lv.m, words, ES ? "es" : "en");
      }
      if (x.rd.innerHTML !== html) x.rd.innerHTML = html;
    });
    paintPicker();
  }

  /* ── Shorter · Just right · More: one row in each lesson, one choice for all ── */
  var CHOICES = [["short", "Shorter", "Más corto"], ["", "Just right", "Normal"], ["more", "More", "Más"]];
  function paintPicker() {
    var l = lang();
    $$(".aog-lv").forEach(function (g) { g.setAttribute("aria-label", l === "es" ? "Cuánto leer" : "How much to read"); });
    $$(".aog-lv button").forEach(function (b) {
      var on = b.getAttribute("data-lv") === level;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var t = b.getAttribute(l === "es" ? "data-es" : "data-en");
      if (b.textContent !== t) b.textContent = t;
    });
  }
  if (HAS_LV) {
    var st = D.createElement("style");
    st.textContent = ".aog-lv{display:flex;flex-wrap:wrap;gap:6px;align-items:center;flex-basis:100%}" +
      ".aog-lv .k{flex-basis:100%;font:700 .7rem var(--sans,sans-serif);letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft,#57626F)}" +
      ".aog-more-x{margin-top:.7em;padding-top:.5em;border-top:1px dashed var(--rule,rgba(29,39,51,.16))}" +
      ".aog-more-x .k{display:block;font:700 .68rem var(--sans,sans-serif);letter-spacing:.16em;text-transform:uppercase;color:var(--acc,#7A5230)}" +
      "@media print{.aog-lv{display:none!important}}";
    D.head.appendChild(st);
    LES.forEach(function (x) {
      var row = x.el.querySelector(".lbtns"); if (!row) return;
      var g = D.createElement("span");
      g.className = "aog-lv"; g.setAttribute("role", "group");
      g.setAttribute("aria-label", "How much to read");
      g.innerHTML = '<span class="k" data-en="How much to read" data-es="Cuánto leer">How much to read</span>' + CHOICES.map(function (c) {
        return '<button type="button" class="lbtn" data-lv="' + c[0] + '" data-en="' + c[1] + '" data-es="' + c[2] + '" aria-pressed="false">' + c[1] + "</button>";
      }).join("");
      row.insertBefore(g, row.firstChild);
    });
    D.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest(".aog-lv button"); if (!b) return;
      level = b.getAttribute("data-lv") || "";
      try { if (level) localStorage.setItem(K_LV, level); else localStorage.removeItem(K_LV); } catch (e) {}
      need(function () {
        paintReadings();
        var les = b.closest(".les"); if (les && les.getBoundingClientRect().top < 0) les.scrollIntoView({ block: "start" });
      });
    });
  }

  /* ── Spanish for everything else a learner reads: slots that remember their English ── */
  var slots = null;
  function firstText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return n;
    return null;
  }
  function slot(el, es, how) {
    if (!el || es == null || es === "") return;
    how = how || "text";
    var s = { el: el, how: how, es: es };
    if (how === "text") s.en = el.textContent;
    else if (how === "html") s.en = el.innerHTML;
    else if (how === "tail") { var t = firstText(el); if (!t) return; s.node = t; s.en = t.nodeValue; s.es = (/^\s/.test(t.nodeValue) ? " " : "") + es; }
    else if (how === "ph") s.en = el.getAttribute("placeholder");
    else if (how === "data-es") { s.en = null; el.setAttribute("data-es", es); s.how = "data-es"; }
    slots.push(s);
  }
  function makeSlots(J) {
    slots = [];
    var u = J.u || {}, n = CO.unit;
    var h1 = D.querySelector("header.mast h1");
    if (h1 && u.t) slot(h1, "Unidad " + n + " · " + u.t, "data-es");
    slot(D.querySelector(".spread h2.ut"), u.t); slot(D.querySelector(".spread .years"), u.y);
    slot(D.querySelector(".wrap-up .wh h2"), u.t);
    $$(".intro .lead p").forEach(function (p, i) { slot(p, (u.intro || [])[i]); });
    slot(D.querySelector(".bigq p"), u.bq);
    $$(".tl .pin .t").forEach(function (p, i) { slot(p, (u.tl || [])[i]); });
    (u.ww || []).forEach(function (w, i) {
      slot(D.querySelector('#match .mt.w[data-k="' + i + '"]'), w[0]);
      slot(D.querySelector('#match .mt.d[data-k="' + i + '"]'), w[1]);
    });
    slot(D.querySelector("#write .wp"), u.wp);
    $$("#write ul li").forEach(function (li, i) { slot(li, (u.wt || [])[i]); });
    slot(D.getElementById("writeBox"), "Empieza con tu idea principal…", "ph");
    var dcs = $$(".drawer nav .dc"), dss = $$(".drawer nav .ds"), di = 0;
    $$("section.chap[id^=ch]").forEach(function (sec, ci) {
      var cn = sec.id.slice(2), c = (J.ch || {})[cn]; if (!c) { di += $$(".sec", sec).length; return; }
      slot(sec.querySelector(".chead h2"), c.t); slot(sec.querySelector(".chead .yrs"), c.y);
      slot(sec.querySelector(".cq"), c.bq, "tail");
      var stc = c.st || {}, story = sec.querySelector(".story");
      if (story) {
        slot(story.querySelector("h3"), stc.t); slot(story.querySelector(".kick"), stc.k);
        $$("p.sp", story).forEach(function (p, i) { slot(p, (stc.p || [])[i]); });
        slot(story.querySelector(".think"), stc.th, "tail");
      }
      $$(".sec", sec).forEach(function (s, si) {
        var t = (c.s || [])[si];
        slot(s.querySelector(".sh h3"), t);
        if (dss[di] && t) slot(dss[di], (si + 1) + " · " + t, "tail");
        di++;
      });
      if (dcs[ci]) slot(dcs[ci], c.t, "tail");
    });
    var L = J.l || {};
    LES.forEach(function (x) {
      var e = L[x.lid]; if (!e) return;
      var a = x.el;
      slot(a.querySelector(".lh h4"), e.t);
      slot(a.querySelector(".main-idea"), e.m, "tail");
      if (e.w) slot(a.querySelector(".words dl"), e.w.map(function (w) { return "<dt>" + esc(w[0]) + "</dt><dd>" + esc(w[1]) + "</dd>"; }).join(""), "html");
      var lk = e.lk || {}, look = a.querySelector(".look");
      if (look) {
        slot(look.querySelector("h5"), lk.t);
        slot(look.querySelector("blockquote") || look.querySelector("p.sc"), lk.x);
        slot(look.querySelector(".prompt"), lk.p);
        var cite = look.querySelector("cite"); if (cite && lk.x) slot(cite, cite.textContent + " · traducción al español");
        var tx = $$("svg.chart text:not(.val)", look);
        if (lk.rows && tx.length) { lk.rows.forEach(function (r, i) { slot(tx[i], r); }); if (lk.un) slot(tx[tx.length - 1], lk.un); }
      }
      var dl = D.querySelector('.drawer nav a[data-lid="' + x.lid + '"]'); if (dl) slot(dl, e.t, "tail");
    });
    var Q = J.q || {};
    $$(".q[data-q]").forEach(function (q) {
      var e = Q[q.getAttribute("data-q")]; if (!e) return;
      slot(q.querySelector(".qq"), e[0], "tail");
      (e[1] || []).forEach(function (c, j) { slot(q.querySelector('.opt[data-i="' + j + '"] span:last-child'), c); });
      slot(q.querySelector(".why"), e[2], "tail");
    });
  }
  function paintSlots() {
    if (!slots) return;
    var es = lang() === "es";
    slots.forEach(function (s) {
      var v = es ? s.es : s.en;
      if (s.how === "text") { if (s.el.textContent !== v) s.el.textContent = v; }
      else if (s.how === "html") { if (s.el.innerHTML !== v) s.el.innerHTML = v; }
      else if (s.how === "tail") { if (s.node.nodeValue !== v) s.node.nodeValue = v; }
      else if (s.how === "ph") s.el.setAttribute("placeholder", v);
      else if (s.how === "data-es" && es) { if (s.el.textContent !== s.es) s.el.textContent = s.es; }
    });
  }

  /* ── what the page needs now, fetched if it is missing ── */
  function need(done) {
    var l = lang(), k = 0, want = [];
    if (l === "es" && HAS_ES && !data.es) want.push("es");
    if (level && HAS_LV && !data.lv && !(l === "es" && HAS_ES)) want.push("lv");
    if (!want.length) { done(); return; }
    want.forEach(function (kind) { get(kind, function () { if (++k === want.length) done(); }); });
  }
  function paintAll() {
    if (data.es && !slots) { makeSlots(data.es); pagerLabels(data.es); }
    paintSlots(); paintReadings();
    try { D.dispatchEvent(new CustomEvent("aog-words")); } catch (e) {}
  }
  /* the page-at-a-time bar (aog-pages.js) names each page; give it the Spanish names */
  function pagerLabels(J) {
    $$("section.chap[id^=ch]").forEach(function (sec) {
      var c = (J.ch || {})[sec.id.slice(2)]; if (!c) return;
      var h = sec.querySelector(":scope > .chead"); if (h && c.t) h.setAttribute("data-aog-es-label", "Capítulo: " + c.t);
      $$(":scope > .sec", sec).forEach(function (s, i) { if ((c.s || [])[i]) s.setAttribute("data-aog-es-label", c.s[i]); });
    });
    $$("#wrap > section, #wrap > div").forEach(function (s) {
      var e = s.querySelector("h2 [data-es], h3 [data-es]"); if (e) s.setAttribute("data-aog-es-label", e.getAttribute("data-es"));
    });
  }
  var lastLang = null;
  function onLang() {
    var l = lang(); if (l === lastLang) return; lastLang = l;
    need(paintAll);
  }
  try { new MutationObserver(onLang).observe(H, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  if (lang() === "es" || level) onLang(); else { lastLang = lang(); paintPicker(); }
  /* ── a course's contents page (<script … data-course="wcs">): unit, chapter, section and lesson names in Spanish,
     from /course-data/<course>-titles.json, fetched the first time Spanish is chosen. Search finds both languages. ── */
  function contents(S) {
    var D = document, H = D.documentElement, cid = S.getAttribute("data-course"), ver = S.getAttribute("data-v") || "", J = null, slots = null, busy = false;
    function es() { return (H.getAttribute("lang") || "en").toLowerCase().indexOf("es") === 0; }
    function all(sel, root) { return Array.prototype.slice.call((root || D).querySelectorAll(sel)); }
    function put(el, v, tail) {
      if (!el || !v) return;
      var node = el;
      if (tail) { node = null; for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) { node = n; } if (!node) return; }
      slots.push({ n: node, tail: tail, en: tail ? node.nodeValue : node.textContent, es: v });
    }
    function make() {
      slots = [];
      all(".unit-spread[data-unit]").forEach(function (u) {
        var n = u.getAttribute("data-unit"), U = (J.u || {})[n]; if (!U) return;
        put(u.querySelector("h2.ut"), U.t); put(u.querySelector(".spread .years"), U.y);
        all(".cchap", u).forEach(function (c) {
          var a = c.querySelector(".ch h3 a"), m = a && /#ch(\d+)/.exec(a.getAttribute("href")), C = m && (J.ch || {})[n + ":" + m[1]];
          if (!C) return;
          put(a, C.t); put(c.querySelector(".ch .yrs"), C.y); put(c.querySelector("p.st"), C.st, true);
          all(".csec .sn span:not([data-en])", c).forEach(function (sp, i) { put(sp, (C.s || [])[i]); });
        });
        all("a.lrow", u).forEach(function (a) {
          var m = /#(l\d+-\d+)$/.exec(a.getAttribute("href")), L = m && (J.l || {})[n + ":" + m[1]]; if (!L) return;
          put(a.querySelector(".t"), L[0]);
          var ds = a.getAttribute("data-s") || ""; if (ds.indexOf(L[0].toLowerCase()) < 0) a.setAttribute("data-s", ds + " " + (L[0] + " " + (L[1] || "")).toLowerCase());
        });
      });
    }
    function paint() {
      if (!slots) return;
      var e = es();
      slots.forEach(function (x) { var v = e ? (x.tail ? x.es : x.es) : x.en; if (x.tail) { if (x.n.nodeValue !== v) x.n.nodeValue = v; } else if (x.n.textContent !== v) x.n.textContent = v; });
    }
    function go() {
      if (!es() || J || busy) { paint(); return; }
      busy = true;
      fetch("/course-data/" + cid + "-titles.json" + (ver ? "?v=" + ver : "")).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) { J = j; make(); paint(); }).catch(function () { busy = false; });
    }
    try { new MutationObserver(go).observe(H, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    if (es()) go();
  }
})();
