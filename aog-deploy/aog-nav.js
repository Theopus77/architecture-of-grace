/* ============================================================================
   Architecture of Grace — shared standalone-nav engine
   Powers the toolbar controls on the standalone pages (Start Here, Ecosystem,
   and the "Read online" resource pages) so they behave like the main app:
     • Accessibility menu  — High contrast + Dyslexia-friendly font
     • Theme               — light / dark mode
     • Personalize         — text size (Small / Medium / Large)
   All preferences persist via localStorage and are re-applied on load.
   Language (EN/ES) and Cart are handled separately (see notes in chat).
   This file is loaded by every standalone page; it edits nothing else.
   ========================================================================== */
(function () {
  "use strict";
  var H = document.documentElement;
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- inject all styles once ---------- */
  var css = [
    /* dropdown menus */
    '.aog-pop{position:absolute;top:calc(100% + 10px);right:0;min-width:300px;background:#FCF8F0;border:1px solid #E4DAC5;border-radius:16px;box-shadow:0 22px 50px -18px rgba(10,30,51,.45);padding:14px 16px;z-index:300;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
    '.aog-pop[hidden]{display:none;}',
    '.aog-pop h4{margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8A92A6;}',
    '.aog-row{display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;background:none;border:0;border-top:1px solid #EFE6D2;padding:12px 2px;cursor:pointer;text-align:left;font-family:inherit;}',
    '.aog-row.first{border-top:0;}',
    '.aog-row .t b{display:block;font-size:15px;font-weight:700;color:#0A1E33;}',
    '.aog-row .t span{display:block;font-size:12.5px;color:#46506E;margin-top:2px;}',
    '.aog-sw{flex:none;width:46px;height:27px;border-radius:999px;background:#D9CDB4;position:relative;transition:background .18s;}',
    '.aog-sw::after{content:"";position:absolute;top:3px;left:3px;width:21px;height:21px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.28);transition:transform .18s;}',
    '.aog-row[aria-checked="true"] .aog-sw{background:#3E7C4F;}',
    '.aog-row[aria-checked="true"] .aog-sw::after{transform:translateX(19px);}',
    '.aog-seg{display:flex;gap:6px;margin-top:4px;}',
    '.aog-seg button{flex:1;padding:9px 0;border:1.5px solid #E4DAC5;background:#fff;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;color:#46506E;cursor:pointer;}',
    '.aog-seg button[aria-pressed="true"]{background:#0A1E33;border-color:#0A1E33;color:#fff;}',
    '.aog-wrap{position:relative;display:inline-grid;}',
    '.aognav .uic.active{border-color:#D9A33B;color:#D9A33B;}',
    /* high contrast */
    'html.aog-contrast body{color:#000;}',
    'html.aog-contrast a:not(.pill):not(.uic):not(.nbrand){text-decoration:underline;text-underline-offset:2px;}',
    'html.aog-contrast .card,html.aog-contrast .box,html.aog-contrast .aud,html.aog-contrast .callout,html.aog-contrast .challenge{border-width:2px;}',
    'html.aog-contrast .aognav{border-bottom-width:2px;}',
    /* dyslexia-friendly font */
    'html.aog-dys body,html.aog-dys .aognav,html.aog-dys h1,html.aog-dys h2,html.aog-dys h3,html.aog-dys .bn,html.aog-dys .tagline,html.aog-dys p,html.aog-dys li,html.aog-dys .pill{font-family:"OpenDyslexic","Comic Sans MS","Trebuchet MS",Verdana,sans-serif !important;}',
    'html.aog-dys body{letter-spacing:.02em;word-spacing:.09em;line-height:1.85;}',
    /* text size */
    'html.aog-text-l body{font-size:118%;}',
    'html.aog-text-s body{font-size:90%;}',
    /* ---------- dark theme: remap page vars + hard-coded nav colors ---------- */
    'html.aog-dark{--ink:#E6ECF3;--navy:#C3D6EF;--slate:#B4C0D0;--faint:#8a96a3;--cream:#16242F;--gold:#E2B65A;--gold-dk:#E8C067;--gold-lt:#34465A;--gold-soft:#E2B65A;}',
    'html.aog-dark body{background:#0E1A26 !important;color:#E6ECF3;}',
    'html.aog-dark .aognav{background:#101A24 !important;border-bottom-color:#2B3B4B !important;}',
    'html.aog-dark .aognav .bn{color:#F1F5FA !important;}',
    'html.aog-dark .aognav .bs{color:#9FB0C2 !important;}',
    'html.aog-dark .aognav .pill.back{color:#F1F5FA !important;}',
    'html.aog-dark .aognav .pill.back .arr{color:#E2B65A !important;}',
    'html.aog-dark .aognav .pill.ci{background:#1C3350 !important;border-color:#1C3350 !important;color:#F1F5FA !important;}',
    'html.aog-dark .aognav .pill.ex{background:#2A2415 !important;color:#F1E9D2 !important;border-color:#E2B65A !important;}',
    'html.aog-dark .aognav .uic{border-color:#34465A !important;color:#C3CEDC !important;}',
    'html.aog-dark .aognav .uic.active{border-color:#E2B65A !important;color:#E2B65A !important;}',
    'html.aog-dark .aognav .lang{background:#16242F !important;border-color:#34465A !important;}',
    'html.aog-dark .aognav .lang .on{background:#E2B65A !important;color:#0E1A26 !important;}',
    'html.aog-dark .aognav .lang a{color:#C3CEDC !important;}',
    'html.aog-dark .aognav .exmenu{background:#16242F !important;border-color:#34465A !important;}',
    'html.aog-dark .aognav .exmenu a{color:#E6ECF3 !important;}',
    'html.aog-dark .aognav .exmenu a:hover{background:rgba(226,182,90,.16) !important;}',
    'html.aog-dark .card,html.aog-dark .box,html.aog-dark .page,html.aog-dark .challenge,html.aog-dark .callout,html.aog-dark .aud,html.aog-dark .nudge{background:#16242F !important;border-color:#2C3E4F !important;}',
    'html.aog-dark .aog-pop{background:#16242F;border-color:#34465A;}',
    'html.aog-dark .aog-pop h4{color:#9FB0C2;}',
    'html.aog-dark .aog-row{border-color:#2C3E4F;}',
    'html.aog-dark .aog-row .t b{color:#F1F5FA;}',
    'html.aog-dark .aog-row .t span{color:#A9B6C6;}',
    'html.aog-dark .aog-seg button{background:#1B2A38;border-color:#34465A;color:#C3CEDC;}',
    'html.aog-dark .aog-seg button[aria-pressed="true"]{background:#E2B65A;border-color:#E2B65A;color:#0E1A26;}'
  ].join("\n");
  var styleEl = document.createElement("style");
  styleEl.setAttribute("data-aog-nav", "1");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- helpers ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function wrapInPositioned(node) {
    var w = el("span", "aog-wrap");
    node.parentNode.insertBefore(w, node);
    w.appendChild(node);
    return w;
  }
  var openPop = null;
  function closeOpen() {
    if (openPop) { openPop.menu.setAttribute("hidden", ""); openPop.btn.classList.remove("active"); openPop.btn.setAttribute("aria-expanded", "false"); openPop = null; }
  }
  document.addEventListener("click", function (ev) {
    if (openPop && !openPop.wrap.contains(ev.target)) closeOpen();
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeOpen(); });

  function attachMenu(btn, menu) {
    var wrap = wrapInPositioned(btn);
    wrap.appendChild(menu);
    menu.setAttribute("hidden", "");
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var isOpen = !menu.hasAttribute("hidden");
      closeOpen();
      if (!isOpen) { menu.removeAttribute("hidden"); btn.classList.add("active"); btn.setAttribute("aria-expanded", "true"); openPop = { wrap: wrap, menu: menu, btn: btn }; }
    });
  }
  function toggleRow(label, sub, isOn, onToggle) {
    var row = el("button", "aog-row", '<span class="t"><b>' + label + '</b><span>' + sub + '</span></span><span class="aog-sw" aria-hidden="true"></span>');
    row.setAttribute("type", "button");
    row.setAttribute("role", "menuitemcheckbox");
    row.setAttribute("aria-checked", isOn ? "true" : "false");
    row.addEventListener("click", function () {
      var now = row.getAttribute("aria-checked") !== "true";
      row.setAttribute("aria-checked", now ? "true" : "false");
      onToggle(now);
    });
    return row;
  }

  /* ---------- ACCESSIBILITY ---------- */
  var a11yBtn = document.querySelector('.aognav .uic[title^="Accessibility"]');
  if (a11yBtn) {
    a11yBtn.setAttribute("title", "Accessibility options");
    a11yBtn.setAttribute("href", "#");
    var contrastOn = LS.get("aogA11yContrast", "0") === "1";
    var dysOn = LS.get("aogA11yDys", "0") === "1";
    H.classList.toggle("aog-contrast", contrastOn);
    H.classList.toggle("aog-dys", dysOn);

    var menu = el("div", "aog-pop");
    menu.setAttribute("role", "menu");
    menu.appendChild(el("h4", null, "Accessibility"));
    var r1 = toggleRow("High contrast", "Stronger text &amp; edges", contrastOn, function (on) { H.classList.toggle("aog-contrast", on); LS.set("aogA11yContrast", on ? "1" : "0"); });
    r1.classList.add("first");
    var r2 = toggleRow("Dyslexia-friendly font", "Easier letter shapes &amp; spacing", dysOn, function (on) { H.classList.toggle("aog-dys", on); LS.set("aogA11yDys", on ? "1" : "0"); });
    menu.appendChild(r1); menu.appendChild(r2);
    attachMenu(a11yBtn, menu);
  }

  /* ---------- THEME (light / dark) ---------- */
  var themeBtn = document.querySelector('.aognav .uic[title^="Display"]');
  if (themeBtn) {
    themeBtn.setAttribute("title", "Toggle dark mode");
    themeBtn.setAttribute("href", "#");
    if (LS.get("aogTheme", "light") === "dark") H.classList.add("aog-dark");
    themeBtn.classList.toggle("active", H.classList.contains("aog-dark"));
    themeBtn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var dark = H.classList.toggle("aog-dark");
      LS.set("aogTheme", dark ? "dark" : "light");
      themeBtn.classList.toggle("active", dark);
    });
  }

  /* ---------- PERSONALIZE (text size) ---------- */
  var pzBtn = document.querySelector('.aognav .uic[title^="Personalize"]');
  if (pzBtn) {
    pzBtn.setAttribute("href", "#");
    var size = LS.get("aogTextSize", "m");
    function applySize(s) { H.classList.remove("aog-text-s", "aog-text-l"); if (s === "s") H.classList.add("aog-text-s"); if (s === "l") H.classList.add("aog-text-l"); }
    applySize(size);
    var pm = el("div", "aog-pop");
    pm.setAttribute("role", "menu");
    pm.appendChild(el("h4", null, "Personalize"));
    var lab = el("div"); lab.style.cssText = "font-size:13.5px;font-weight:700;color:#0A1E33;margin:6px 0 2px;"; lab.textContent = "Text size";
    pm.appendChild(lab);
    var seg = el("div", "aog-seg");
    [["s", "Small"], ["m", "Medium"], ["l", "Large"]].forEach(function (o) {
      var b = el("button", null, o[1]); b.setAttribute("type", "button");
      b.setAttribute("aria-pressed", size === o[0] ? "true" : "false");
      b.addEventListener("click", function () {
        size = o[0]; applySize(size); LS.set("aogTextSize", size);
        seg.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
      });
      seg.appendChild(b);
    });
    pm.appendChild(seg);
    attachMenu(pzBtn, pm);
  }

  /* ---------- LANGUAGE (EN / ES) ---------- */
  /* Shared nav-label translations (match the main app's wording).
     Page bodies provide their own strings via window.AOG_I18N (keyed by data-i18n). */
  var NAV_I18N = {
    "nav.back": "Atrás",
    "nav.rn": "Ahora mismo",
    "nav.ci": "Chequeo",
    "nav.explore": "Explorar",
    "nav.start": "Empieza aquí",
    "nav.library": "Biblioteca",
    "nav.tools": "Herramientas de calma y regulación",
    "nav.eco": "Ecosistema",
    "nav.framework": "Marco",
    "nav.dashboard": "Panel",
    "nav.store": "Tienda",
    "nav.sub": ""
  };
  var DICT = {};
  (function () { var k; for (k in NAV_I18N) DICT[k] = NAV_I18N[k]; var p = window.AOG_I18N || {}; for (k in p) DICT[k] = p[k]; })();

  function applyLang(lang) {
    var nodes = document.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(nodes, function (n) {
      var key = n.getAttribute("data-i18n");
      if (!n.hasAttribute("data-en")) n.setAttribute("data-en", n.innerHTML);
      if (lang === "es" && DICT[key] != null) n.innerHTML = DICT[key];
      else n.innerHTML = n.getAttribute("data-en");
    });
    H.setAttribute("lang", lang);
    var box = document.querySelector(".aognav .lang");
    if (box) {
      var en = box.querySelector('[data-lang="en"]'), es = box.querySelector('[data-lang="es"]');
      if (en) en.classList.toggle("on", lang === "en");
      if (es) es.classList.toggle("on", lang === "es");
    }
  }
  function setLang(lang) { applyLang(lang); LS.set("aogLang", lang); }

  var langBox = document.querySelector(".aognav .lang");
  if (langBox) {
    var enEl = langBox.querySelector(".on") || langBox.children[0];
    var esEl = langBox.querySelector("a") || langBox.children[1];
    if (enEl) { enEl.setAttribute("data-lang", "en"); enEl.style.cursor = "pointer"; enEl.addEventListener("click", function (e) { e.preventDefault(); setLang("en"); }); }
    if (esEl) { esEl.setAttribute("data-lang", "es"); esEl.setAttribute("href", "#"); esEl.style.cursor = "pointer"; esEl.addEventListener("click", function (e) { e.preventDefault(); setLang("es"); }); }
  }
  applyLang(LS.get("aogLang", "en"));
})();
