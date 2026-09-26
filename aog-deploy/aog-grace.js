/* ════════════════════════════════════════════════════════════════════════════
   ARCHITECTURE OF GRACE — THE HOME PAGE'S HERO, ON EVERY PAGE. (the engine)

   One line in <body>, right after the site bar:

       <script src="/aog-grace.js" defer></script>

   It loads /aog-grace.css and the two home-page faces (Fraunces, Inter),
   finds this page's masthead and stamps it data-aog-hero. The stylesheet
   does the rest. Nothing in the page's own markup is moved, renamed or
   removed, and a page with no masthead (404, hall, the connection check)
   simply keeps its sheet and gains the type.

   ── WHAT COUNTS AS THE MASTHEAD ──────────────────────────────────────────────
   The first real <h1> on the page — not the site bar's, not the sticky
   .wmbar strip the worksheets carry — and the nearest header-shaped ancestor
   around it: <header>, .mast, header.page, .hero. The Anchor Charts toolbar
   (header.bar) is a toolbar, not a masthead, and is left alone. The math
   activity pages put their title in a <p class="mast-h1"> under a hidden h1,
   so header.mast is the fallback when no h1 qualifies.

   ── TWO MEASUREMENTS THE CSS CANNOT MAKE ─────────────────────────────────────
   --aog-vw   the viewport width WITHOUT the scrollbar (100vw counts it and
              would put a sideways scroll on every page).
   --aog-pull the gap between whatever sits above the masthead (the site bar's
              spacer, usually) and the masthead itself — the wrap's top
              padding. The band reaches up by that much so navy meets the bar.
   Both are re-measured on resize and once the fonts have settled.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.__aogGrace) return;
  window.__aogGrace = 1;

  var D = document, H = D.documentElement;
  /* AOG-LEGIBLE-V1 — every page that carries this file also gets the text guard */
  try { var lg = D.createElement("script"); lg.src = "/aog-legible.js"; lg.defer = true; (D.head || H).appendChild(lg); } catch (e) {}
  /* AOG-CALM-V1 — the stillness rules, on every page that carries this file */
  try { if (!D.querySelector('link[href$="aog-calm.css"]')) { var cl = D.createElement("link"); cl.rel = "stylesheet"; cl.href = "/aog-calm.css"; (D.head || H).appendChild(cl); } } catch (e) {}
  /* AOG-GLASS-ROOMS-V1 — the fourteen rooms behind the doors get the stained glass */
  try {
    var ROOMS = { "math-hub":"#2F63B8", "science-hub":"#2E8B57", "social-studies-hub":"#A8323E", "english-hub":"#B87A12",
      "spanish-hub":"#B8457A", "facs-hub":"#7B4FA0", "economics-hub":"#6E7C22", "religions-hub":"#3F4AA6",
      "room-12-curriculum":"#2E8B57", "room-18-curriculum":"#B87A12", "room-36-curriculum":"#2F63B8",
      "room-104-curriculum":"#A8323E", "room-207-curriculum":"#7B4FA0",
      "math":"#2F63B8", "science":"#2E8B57", "social":"#A8323E", "english":"#B87A12", "spanish":"#B8457A",
      "facs":"#7B4FA0", "economics":"#6E7C22", "religions":"#3F4AA6",
      "room12":"#2E8B57", "room18":"#B87A12", "room36":"#2F63B8", "room104":"#A8323E", "room207":"#7B4FA0" };
    var slug = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    if (ROOMS[slug]) {
      H.classList.add("aog-glass-rooms"); H.style.setProperty("--room", ROOMS[slug]);
      var gl = D.createElement("link"); gl.rel = "stylesheet"; gl.href = "/aog-glass-rooms.css"; (D.head || H).appendChild(gl);
      /* AOG-HUB-FOLDS-V1 (2026-09-26) — Jimmy: "Can all the old tabs get a drop
         down menu tab instead of having one big scroll." Each unit card shows its
         name and its buttons; the long description drops down when the name is
         tapped. Screen only: a printed hub still shows everything. */
      var foldUnits = function () {
        var us = D.querySelectorAll(".unit:not([data-aogfold])");
        for (var i = 0; i < us.length; i++) {
          var u = us[i], t = u.querySelector(".t"), d = u.querySelector(".d");
          u.setAttribute("data-aogfold", "1");
          if (!t || !d) continue;
          var b = D.createElement("button");
          b.type = "button"; b.className = "aog-ufold"; b.setAttribute("aria-expanded", "false");
          b.setAttribute("aria-label", (/^es/i.test(H.lang || "") ? "Ver la descripci\u00f3n" : "Show the description"));
          b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
          t.appendChild(b); u.classList.add("aog-shut");
          (function (u, b) {
            var flip = function (e) { if (e.target.closest("a, .doors")) return; var open = u.classList.toggle("aog-shut") === false; b.setAttribute("aria-expanded", open ? "true" : "false"); };
            t.addEventListener("click", flip); t.style.cursor = "pointer";
          })(u, b);
        }
      };
      if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", foldUnits); else foldUnits();
      setTimeout(foldUnits, 1000);
    }
  } catch (e) {}
  /* AOG-PRACTICE-GLASS-V1 (2026-09-26) — the practice pages (c1…, h1…, m1…,
     v1…) get the same glass tiles and pictures as the check-in. */
  try {
    var ps = (location.pathname.split("/").pop() || "");
    if (/^[chmv]\d+-/.test(ps)) {
      var pl = D.createElement("link"); pl.rel = "stylesheet"; pl.href = "/aog-practice.css"; (D.head || H).appendChild(pl);
      var pj = D.createElement("script"); pj.src = "/aog-practice.js"; pj.defer = true; (D.head || H).appendChild(pj);
    }
  } catch (e) {}
  /* AOG-MINE-V1 — a private copy of what this learner sends, for their own Blueprint */
  try { var mn = D.createElement("script"); mn.src = "/aog-mine.js"; (D.head || H).appendChild(mn); } catch (e) {}
  var FONTS = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..700&family=Inter:wght@300;400;500;600;700;800&display=optional";

  /* ── 0 ── navy, the whole page ─────────────────────────────────────────
     Jimmy: "I wanted the whole page like this, not just the top." The home
     page is navy from edge to edge. Every other page has a dark theme of its
     own, so the page is put into it once and the stylesheet re-tints that
     dark theme navy. The site bar keeps the theme toggle: a reader who
     flips to light gets the cream sheet and is left alone after that. */
  var NAVY_KEY = "aog.grace.navy.v1";
  try {
    if (!localStorage.getItem(NAVY_KEY)) {
      localStorage.setItem("aog.theme", "dark");
      localStorage.setItem("aog.interior.ws.v1.theme", "dark");
      localStorage.setItem(NAVY_KEY, "1");
      H.setAttribute("data-theme", "dark");
    }
  } catch (e) { if (!H.getAttribute("data-theme")) H.setAttribute("data-theme", "dark"); }

  /* ── 1 ── the faces and the sheet ─────────────────────────────────────── */
  function link(rel, href, extra) {
    var l = D.createElement("link");
    l.rel = rel; l.href = href;
    if (extra) for (var k in extra) l.setAttribute(k, extra[k]);
    (D.head || H).appendChild(l);
    return l;
  }
  var hasFonts = false;
  try { hasFonts = !!D.querySelector('link[href*="family=Fraunces"]'); } catch (e) {}
  if (!hasFonts) {
    link("preconnect", "https://fonts.googleapis.com");
    link("preconnect", "https://fonts.gstatic.com", { crossorigin: "" });
    link("stylesheet", FONTS);
  }
  var sheet = link("stylesheet", "/aog-grace.css", { "data-aog-grace": "1" });

  /* ── 2 ── find the masthead ───────────────────────────────────────────── */
  function visible(el) {
    if (!el || el.nodeType !== 1) return false;
    var cs;
    try { cs = getComputedStyle(el); } catch (e) { return false; }
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    if (cs.position === "fixed" || cs.position === "absolute") return false;
    var r = el.getBoundingClientRect();
    return r.height > 0 || r.width > 0;
  }
  function closestHost(el) {
    var n = el;
    while (n && n !== D.body) {
      if (n.tagName === "HEADER") return n;
      var c = " " + (n.className && typeof n.className === "string" ? n.className : "") + " ";
      if (c.indexOf(" mast ") > -1 || c.indexOf(" hero ") > -1) return n;
      if (c.indexOf(" page ") > -1 && n.tagName === "HEADER") return n;
      n = n.parentElement;
    }
    return null;
  }
  function isToolbar(host) {
    var c = " " + (host.className || "") + " ";
    if (c.indexOf(" bar ") > -1 || c.indexOf(" aogtop ") > -1 || c.indexOf(" wmbar ") > -1 || c.indexOf(" r36top ") > -1) return true;
    /* a masthead has words in it; a toolbar has buttons */
    var btns = host.querySelectorAll("button").length;
    var text = (host.textContent || "").replace(/\s+/g, " ").trim().length;
    return btns > 4 && text < 240;
  }
  function tooBig(host) {
    /* a masthead is the top of a page, not the page: a wrapper that holds
       most of the document's words is not it */
    var mine = (host.textContent || "").length, all = (D.body.textContent || "").length;
    return mine > 1200 && mine > all * 0.4;
  }
  function small(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim().length < 90;
  }
  function ledeLike(el) {
    if (!el || el.nodeType !== 1) return false;
    var t = el.tagName, c = " " + (el.className || "") + " ";
    if (t === "P" || t === "HR") return true;
    return /\s(lede|deck|tag|tagline|sub|say|rule|mats|legend)\s/.test(c);
  }
  function kickerLike(el) {
    if (!el || el.nodeType !== 1) return false;
    var t = el.tagName, c = " " + (el.className || "") + " ";
    if (t === "SCRIPT" || t === "STYLE" || t === "NAV" || t === "H2" || t === "H3") return false;
    if (/\s(brandrow|brand|eyebrow|kicker|crumb|k|mark|row|top)\s/.test(c)) return true;
    return small(el) && (t === "DIV" || t === "SPAN" || t === "P" || t === "SMALL");
  }
  function synthesize(h1) {
    /* the title stands bare in the column: gather it, the little line above
       it and the lede below it into one masthead of our own */
    var parent = h1.parentElement;
    if (!parent) return null;
    /* only in a plain column: a flex or grid parent lays its children out
       by position, and a wrapper would shuffle them */
    try { var pd = getComputedStyle(parent).display; if (pd !== "block" && pd !== "flow-root") return null; } catch (e) { return null; }
    var first = h1, last = h1, p;
    p = h1.previousElementSibling;
    var n = 0;
    while (p && n < 2 && kickerLike(p)) { first = p; p = p.previousElementSibling; n++; }
    p = h1.nextElementSibling;
    n = 0;
    while (p && n < 3 && ledeLike(p)) {
      /* the lede is a line or two; a long paragraph after it is the body */
      if (n > 0 && (p.textContent || "").length > 200) break;
      last = p; p = p.nextElementSibling; n++;
    }
    var box = D.createElement("div");
    box.className = "aog-hero-made";
    parent.insertBefore(box, first);
    var cur = first, stop = last.nextSibling;
    while (cur && cur !== stop) { var nx = cur.nextSibling; box.appendChild(cur); cur = nx; }
    return box;
  }
  function inCard(h1) {
    /* a title inside <main>, a <section>, an <article> or a card belongs to
       that card, not to the page */
    var n = h1.parentElement;
    while (n && n !== D.body) {
      var t = n.tagName, c = " " + (n.className || "") + " ";
      if (t === "MAIN" || t === "SECTION" || t === "ARTICLE" || t === "ASIDE" || t === "NAV" || t === "FORM") return true;
      if (/\s(sheet|card|panel|quiz|stage|modal|dialog|drawer|rail)\s/.test(c)) return true;
      n = n.parentElement;
    }
    return false;
  }
  function realH1s() {
    var out = [], h1s = D.getElementsByTagName("h1");
    for (var i = 0; i < h1s.length; i++) {
      var h = h1s[i];
      var c = " " + (h.className || "") + " ";
      if (c.indexOf(" wm-nm ") > -1) continue;
      if (h.closest && (h.closest(".aogtop") || h.closest(".wmbar") || h.closest(".r36top"))) continue;
      if (!visible(h)) continue;
      out.push(h);
    }
    return out;
  }
  function findHero() {
    var hs = realH1s(), i, host;
    /* 1 · a title inside a real masthead */
    for (i = 0; i < hs.length; i++) {
      host = closestHost(hs[i]);
      if (host && !isToolbar(host) && !tooBig(host)) return host;
    }
    /* 2 · a masthead whose title is not an h1 (the math activities put it in
       a <p class="mast-h1">, or write it in later) */
    var m = D.querySelector("header.mast, .mast");
    if (m && !isToolbar(m) && !tooBig(m) && m.querySelector(".mast-h1, h1, .name, .deck")) return m;
    /* 3 · a bare title in the column: build the masthead around it */
    for (i = 0; i < hs.length; i++) {
      if (inCard(hs[i])) continue;
      var made = synthesize(hs[i]);
      if (made) return made;
    }
    return null;
  }

  /* ── 3 ── measure ─────────────────────────────────────────────────────── */
  var hero = null;
  function edgeAbove(el) {
    /* the bottom of the nearest visible thing in flow above the masthead,
       walking up through its ancestors; 0 when nothing sits above it */
    var n = el;
    while (n && n !== D.body) {
      var p = n.previousElementSibling;
      while (p) {
        if (visible(p)) return p.getBoundingClientRect().bottom;
        p = p.previousElementSibling;
      }
      n = n.parentElement;
      if (n && n !== D.body) {
        var cs = getComputedStyle(n);
        /* a parent that paints its own box (a card) is a wall, not a window */
        if (cs.position === "fixed" || cs.position === "absolute") return null;
      }
    }
    return 0;
  }
  function measure() {
    try {
      H.style.setProperty("--aog-vw", H.clientWidth + "px");
      if (!hero) return;
      /* AOG-GRACE-STILL-V1 (2026-09-26) — Jimmy: pages "look all jittery" on load.
         The pull was measured AFTER the last pull had moved the masthead, so
         every measure undid the one before and the page bounced 39px up and
         down. Measure where the masthead would sit with no pull, and only
         write when the answer changes. */
      var prev = parseFloat(hero.style.getPropertyValue("--aog-pull")) || 0;
      var top = hero.getBoundingClientRect().top + prev;
      var above = edgeAbove(hero);
      var pull = above === null ? 0 : Math.max(0, Math.round(top - above));
      /* never reach up more than a comfortable margin; a page that stacks
         things above its masthead keeps them */
      if (pull > 160) pull = 0;
      if (pull !== prev) hero.style.setProperty("--aog-pull", pull + "px");
    } catch (e) {}
  }

  /* ── 4 ── cards inside the masthead ───────────────────────────────────── */
  /* A few mastheads carry a white box (a share list, a how-to note). Cream
     text on white is unreadable, so any descendant that paints its own light
     ground is stamped data-aog-card and the stylesheet gives it ink again.
     Re-run whenever the theme flips: in dark mode the same box may be dark. */
  function luma(rgb) {
    var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?/.exec(rgb || "");
    if (!m) return null;
    var a = m[4] === undefined ? 1 : parseFloat(m[4]);
    if (a < 0.5) return null;
    return (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255;
  }
  function markCards() {
    if (!hero) return;
    var all = hero.querySelectorAll("*"), n = 0, i, el, skip = null;
    for (i = 0; i < all.length; i++) {
      el = all[i];
      if (skip && skip.contains(el)) continue;
      /* AOG-GRACE-CARDTAGS-V1 (2026-09-25) — a <p class="note"> painted white
         used to be skipped because it is a P, and kept cream text on white.
         Any tag that paints its own light ground is a card. */
      var l = luma(getComputedStyle(el).backgroundColor);
      if (l !== null && l > 0.55) { el.setAttribute("data-aog-card", "1"); skip = el; }
      else el.removeAttribute("data-aog-card");
      if (++n > 3000) break;
    }
    /* AOG-GRACE-INK-V1 (2026-09-26) — Jimmy: "The words are WHITED OUT …
       MAKE IT A PERMANENT FIX." A page's own stylesheet can give text dark ink
       (the crosswalk pills did), and on the navy masthead that disappears.
       Any text outside a card that still reads dark is stamped data-aog-ink
       and the stylesheet turns it cream. */
    for (i = 0; i < all.length && i < 3000; i++) {
      el = all[i];
      if (el.closest("[data-aog-card]")) { el.removeAttribute("data-aog-ink"); continue; }
      el.removeAttribute("data-aog-ink");
      var c = luma(getComputedStyle(el).color);
      if (c !== null && c < 0.45) el.setAttribute("data-aog-ink", "1");
    }
  }

  /* ── 4b ── the lede, two lines ────────────────────────────────────────── */
  var LEDE = ".deck, .tag, .tagline, .lede, .say, p.sub, :scope > p, :scope > div > p";
  function clampLedes() {
    if (!hero) return;
    var els;
    try { els = hero.querySelectorAll(LEDE); } catch (e) { els = hero.querySelectorAll(".deck, .tag, .tagline, .lede, .say, p.sub"); }
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest("[data-aog-card]") || el.querySelector("input, button, select") || el.classList.contains("aog-clamp") || el.hasAttribute("data-aog-fits")) continue;
      if ((el.textContent || "").replace(/\s+/g, " ").trim().length < 140) continue;
      el.classList.add("aog-clamp");
      var more = D.createElement("button");
      more.type = "button"; more.className = "aog-more no-print";
      more.setAttribute("aria-expanded", "false");
      more.innerHTML = '<span data-en="More" data-es="M\u00e1s">More</span>';
      more.addEventListener("click", (function (p, b) { return function () {
        var open = p.classList.toggle("is-open");
        b.classList.toggle("is-open", open);
        b.setAttribute("aria-expanded", open ? "true" : "false");
        var sp = b.firstChild;
        sp.setAttribute("data-en", open ? "Less" : "More");
        sp.setAttribute("data-es", open ? "Menos" : "M\u00e1s");
        sp.textContent = sp.getAttribute(/^es/i.test(H.lang || "") ? "data-es" : "data-en");
      }; })(el, more));
      el.parentNode.insertBefore(more, el.nextSibling);
      /* only keep the link when there is something to open */
      (function (p, b) { setTimeout(function () { if (p.scrollHeight <= p.clientHeight + 2) { b.remove(); p.classList.remove("aog-clamp"); p.setAttribute("data-aog-fits", "1"); /* AOG-GRACE-STILL-V1: never clamp it again — that loop made pages jitter */ } }, 50); })(el, more);
    }
  }

  /* ── 5 ── mount ───────────────────────────────────────────────────────── */
  function mount() {
    hero = findHero();
    if (hero) hero.setAttribute("data-aog-hero", "1");
    H.classList.add("aog-grace");
    markCards();
    clampLedes();
    measure();
    var again = function () { measure(); };
    if (window.MutationObserver && hero) {
      try {
        new MutationObserver(function () { setTimeout(markCards, 30); })
          .observe(H, { attributes: true, attributeFilter: ["data-theme", "class", "data-accent"] });
        /* content a page renders later (the Inbox's cards, a pulled list) is checked too */
        var mt = 0;
        new MutationObserver(function () { clearTimeout(mt); mt = setTimeout(markCards, 60); })
          .observe(hero, { childList: true, subtree: true });
      } catch (e) {}
    }
    if (sheet) sheet.addEventListener("load", function () { setTimeout(markCards, 30); setTimeout(clampLedes, 60); });
    window.addEventListener("resize", again);
    window.addEventListener("load", again);
    if (sheet) sheet.addEventListener("load", function () { again(); setTimeout(again, 60); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(again, again);
    setTimeout(again, 400);
    setTimeout(again, 1500);
    if (window.ResizeObserver && hero) {
      try { new ResizeObserver(again).observe(hero); } catch (e) {}
    }
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
