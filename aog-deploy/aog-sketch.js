/* ═══════════════════════════════════════════════════════════════════════════
   ARCHITECTURE OF GRACE — THE SKETCH PAD.  AOG-SKETCH-PAD-V1 (2026-09-27)
   Jimmy: "Flash cards in the rooms get the sketch pad drawings. The Foundry and
   word study cards get it too."

   One shared pencil filter (graphite hatching in the shaded areas, a soft pencil
   outline, the paper's warm tone) turns every card picture into a pencil sketch,
   and study cards get a sketch-pad look: a spiral binding across the top.
   Still: nothing moves. The picture stays an emoji underneath (screen readers,
   print and copy are unchanged); only its look changes.

   Loaded by aog-cards.js, and by any page that lists it. Add a page's picture
   selector to PICS below to give its cards the pencil.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.__aogSketch) return; window.__aogSketch = 1;
  var D = document;
  var PICS = [
    "#cardHost .em",                              /* study cards in the rooms */
    ".wf-card .em", ".wf-emoji", ".fdy-emoji",    /* Word Foundry cards */
    ".ws-card .em", ".wcard .em", "[data-aog-sketch]" /* word study cards; any page can opt in */
  ].join(",");
  var F = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">'
    + '<filter id="aogPencil" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">'
    + '<feColorMatrix type="matrix" values=".3 .59 .11 0 0 .3 .59 .11 0 0 .3 .59 .11 0 0 0 0 0 1 0" result="g"/>'
    + '<feComponentTransfer in="g" result="dark"><feFuncR type="linear" slope="-1" intercept="1"/><feFuncG type="linear" slope="-1" intercept="1"/><feFuncB type="linear" slope="-1" intercept="1"/></feComponentTransfer>'
    + '<feTurbulence type="fractalNoise" baseFrequency="0.035 0.9" numOctaves="2" seed="5" result="n"/>'
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3 0 0 0 -1.1" result="streak"/>'
    + '<feComposite in="dark" in2="streak" operator="in" result="hatch"/>'
    + '<feComponentTransfer in="g" result="light"><feFuncR type="linear" slope=".5" intercept=".44"/><feFuncG type="linear" slope=".5" intercept=".44"/><feFuncB type="linear" slope=".5" intercept=".44"/></feComponentTransfer>'
    + '<feComposite in="light" in2="hatch" operator="arithmetic" k1="0" k2="1" k3="-.9" k4="0" result="shaded"/>'
    + '<feConvolveMatrix in="g" order="3" kernelMatrix="1 1 1 1 -8 1 1 1 1" preserveAlpha="true" result="e"/>'
    + '<feComponentTransfer in="e" result="ei"><feFuncR type="linear" slope="-3.2" intercept="1"/><feFuncG type="linear" slope="-3.2" intercept="1"/><feFuncB type="linear" slope="-3.2" intercept="1"/></feComponentTransfer>'
    + '<feBlend in="shaded" in2="ei" mode="multiply" result="m"/>'
    + '<feColorMatrix in="m" type="matrix" values=".93 0 0 0 .01 0 .92 0 0 .01 0 0 .88 0 .02 0 0 0 1 0" result="tint"/>'
    + '<feComposite in="tint" in2="SourceAlpha" operator="in" result="body"/>'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="1.1" result="dil"/>'
    + '<feComposite in="dil" in2="SourceAlpha" operator="out" result="ring"/>'
    + '<feColorMatrix in="ring" type="matrix" values="0 0 0 0 .2 0 0 0 0 .19 0 0 0 0 .17 0 0 0 .85 0" result="line"/>'
    + '<feMerge><feMergeNode in="body"/><feMergeNode in="line"/></feMerge></filter></svg>';
  var CSS = [
    PICS.split(",").map(function (s) { return s + "{ filter:url(#aogPencil) !important; }"; }).join("\n"),
    "#cardHost .aogc-card .em{ font-size:3.8rem !important; }",
    /* in dark mode the drawing sits on a small sheet of drawing paper, as it would in a real pad */
    ":root[data-theme=\"dark\"] #cardHost .em{ display:inline-block; align-self:center; padding:8px 14px; border-radius:10px; background:#F4EFE3; box-shadow:0 1px 0 rgba(0,0,0,.35); }",
    "@media (prefers-color-scheme: dark){ :root:not([data-theme=\"light\"]) #cardHost .em{ display:inline-block; align-self:center; padding:8px 14px; border-radius:10px; background:#F4EFE3; box-shadow:0 1px 0 rgba(0,0,0,.35); } }",
    /* the sketch pad: a spiral binding across the top of each study card */
    "#cardHost .aogc-face{ padding-top:34px !important; }",
    "#cardHost .aogc-face::before{ content:\"\"; position:absolute; left:18px; right:18px; top:6px; height:16px; pointer-events:none;",
    "  background:radial-gradient(circle at 50% 70%, rgba(29,39,51,.55) 0 2.6px, transparent 3.2px) 0 0/22px 16px repeat-x,",
    "  radial-gradient(ellipse 5px 8px at 50% 40%, transparent 0 3.2px, #8C939B 3.4px 4.6px, transparent 4.8px) 0 0/22px 16px repeat-x; }",
    "@media print{ #cardHost .aogc-face::before{ display:none; } " + PICS.split(",").map(function (s) { return s; }).join(",") + "{ filter:grayscale(1) !important; } }"
  ].join("\n");
  /* a page can give its own cards the sketch pad: <script src="/aog-sketch.js" data-pad=".stem"> */
  var ME = D.currentScript, PAD = (ME && ME.getAttribute("data-pad")) || "";
  if (PAD) {
    var sel = PAD.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    var LIGHT = function (x) { return 'html:not([data-theme="dark"]) ' + x; };
    CSS += "\n" + sel.map(function (x) { return x + "{ position:relative; padding-top:30px !important; }"; }).join("\n")
      + "\n" + sel.map(function (x) { return LIGHT(x) + "{ background:repeating-linear-gradient(0deg, rgba(29,39,51,.035) 0 1px, transparent 1px 4px), #FBF8F0 !important; }"; }).join("\n")
      + "\n@media (prefers-color-scheme: dark){ " + sel.map(function (x) { return 'html:not([data-theme="light"]) ' + x; }).join(",") + "{ background:revert-layer !important; } }"
      + "\n" + sel.map(function (x) { return x + "::before{ content:\"\"; position:absolute; left:12px; right:12px; top:5px; height:16px; pointer-events:none;"
      + " background:radial-gradient(circle at 50% 70%, rgba(29,39,51,.55) 0 2.4px, transparent 3px) 0 0/20px 16px repeat-x,"
      + " radial-gradient(ellipse 5px 8px at 50% 40%, transparent 0 3px, #8C939B 3.2px 4.4px, transparent 4.6px) 0 0/20px 16px repeat-x; }"; }).join("\n")
      + "\n@media print{ " + sel.map(function (x) { return x + "::before"; }).join(",") + "{ display:none; } }";
  }

  /* AOG-SKETCH-ICONS-V1 — Jimmy: "Get rid of the emojis, make everything sketch worthy." Each card
     picture is swapped for its own pencil drawing (img/sketch/<codepoints>.webp, made by
     _work/art/sketchicons). The emoji is kept only as the fallback if a drawing is missing. */
  function cps(t) { var o = []; for (var ch of t) { var h = ch.codePointAt(0).toString(16); if (h !== "fe0f") o.push(h); } return o.join("-"); }
  var EMO = /^[\s‍️⃣©® -㌀\ud83c-􏰀-\udfff]+$/;
  function swap(el) {
    if (el.getAttribute("data-sk") === "1") return;
    var t = (el.textContent || "").trim();
    if (!t || t.length > 16 || !EMO.test(t) || el.children.length) return;
    el.setAttribute("data-sk", "1");
    var img = D.createElement("img"); img.className = "aog-sk"; img.alt = ""; img.decoding = "async";
    img.src = "/img/sketch/" + cps(t) + ".webp";
    img.onerror = function () { el.textContent = t; el.removeAttribute("data-sk"); el.setAttribute("data-sk-miss", "1"); };
    el.setAttribute("aria-hidden", "true"); el.textContent = ""; el.appendChild(img);
  }
  /* emoji inside running text (the slips' answer choices, Daily Drafts): swapped only where a
     drawing exists (HAVE, written by _work/art/sketchicons/manifest.py); other symbols stay. */
  var HAVE = /*SKETCH-LIST*/{}/*END*/;
  var RUN = /(?:[☀-➿]|[\ud83c-\ud83e][\udc00-\udfff])(?:️)?(?:‍(?:[☀-➿]|[\ud83c-\ud83e][\udc00-\udfff])(?:️)?)*/g;
  var INLINE = (ME && ME.getAttribute("data-inline")) || "";
  function inline(root) {
    if (!INLINE) return;
    var hosts = root.querySelectorAll ? root.querySelectorAll(INLINE) : [];
    for (var i = 0; i < hosts.length; i++) {
      var w = D.createTreeWalker(hosts[i], NodeFilter.SHOW_TEXT, null), t, todo = [];
      while ((t = w.nextNode())) { if (RUN.test(t.nodeValue)) todo.push(t); RUN.lastIndex = 0; }
      todo.forEach(function (tn) {
        var v = tn.nodeValue, frag = D.createDocumentFragment(), last = 0, m, hit = false;
        RUN.lastIndex = 0;
        while ((m = RUN.exec(v))) {
          var k = cps(m[0]); if (!HAVE[k]) continue;
          hit = true; frag.appendChild(D.createTextNode(v.slice(last, m.index)));
          var img = D.createElement("img"); img.className = "aog-sk aog-sk-in"; img.alt = ""; img.src = "/img/sketch/" + k + ".webp";
          img.setAttribute("aria-hidden", "true"); frag.appendChild(img); last = m.index + m[0].length;
        }
        if (!hit) return;
        frag.appendChild(D.createTextNode(v.slice(last))); tn.parentNode.replaceChild(frag, tn);
      });
    }
  }
  CSS += "\n.aog-sk-in{ width:1.5em; height:1.5em; margin:0 .15em .1em 0; }";
  function sweep() { inline(D); var n = D.querySelectorAll(PICS); for (var i = 0; i < n.length; i++) swap(n[i]); }
  CSS += "\n.aog-sk{ display:inline-block; width:1.35em; height:1.35em; object-fit:contain; vertical-align:middle; }"
    + "\n#cardHost .aogc-card .em .aog-sk{ width:96px; height:96px; }"
    + "\n[data-sk=\"1\"]{ filter:none !important; }";
  function boot() {
    if (!D.getElementById("aogPencil")) {
      var w = D.createElement("div"); w.innerHTML = F;
      D.body.insertBefore(w.firstChild, D.body.firstChild);
    }
    if (!D.getElementById("aog-sketch-css")) {
      var st = D.createElement("style"); st.id = "aog-sketch-css"; st.appendChild(D.createTextNode(CSS));
      (D.head || D.documentElement).appendChild(st);
    }
    sweep();
    if (window.MutationObserver) { var sT; new MutationObserver(function () { clearTimeout(sT); sT = setTimeout(sweep, 30); }).observe(D.body, { childList: true, subtree: true }); }
  }
  if (D.body) boot(); else D.addEventListener("DOMContentLoaded", boot);
  /* ── AOG-MAST-SKETCH-V1 — a pencil drawing in the navy masthead of the rooms (exam prep, tests,
     practice), the microscope, the telescope and the worksheets. A room shows the drawing of the
     course unit it practises (aog-room-map.js); if that drawing is not made yet, nothing shows. ── */
  var PAGE = { "science-microscope": "page-microscope", "microscope-guide": "page-microscope", "microscope-lessons": "page-microscope",
    "telescope": "page-telescope", "science-telescope": "page-telescope", "telescope-guide": "page-telescope", "telescope-lessons": "page-telescope",
    "AoG-Interior-Worksheets": "page-worksheets" };
  var MCSS = [
    ".aog-mast-host{ position:relative; overflow:hidden; }",
    ".aog-mast-host > :not(.aog-mast-sketch){ position:relative; z-index:1; }",
    ".aog-mast-sketch{ position:absolute; top:0; right:0; bottom:0; width:min(54%,700px); z-index:0; pointer-events:none; }",
    ".aog-mast-sketch img{ display:block; width:100%; height:100%; object-fit:cover; object-position:80% 42%; filter:brightness(.78) contrast(1.05); }",
    ".aog-mast-sketch{ -webkit-mask-image:linear-gradient(90deg, transparent 0%, rgba(0,0,0,.55) 30%, #000 62%); mask-image:linear-gradient(90deg, transparent 0%, rgba(0,0,0,.55) 30%, #000 62%); }",
    "@media (max-width:720px){ .aog-mast-sketch{ width:100%; opacity:.28; -webkit-mask-image:none; mask-image:none; } }",
    "@media print{ .aog-mast-sketch{ display:none; } }"
  ].join("\n");
  function mast(id) {
    var h = D.querySelector("header.mast") || D.querySelector("main header, body > header:not(.aog-topbar)");
    if (!h || h.querySelector(".aog-mast-sketch")) return;
    var box = D.createElement("span"); box.className = "aog-mast-sketch"; box.setAttribute("aria-hidden", "true");
    var b = "/img/banners/" + id + "-pencil";
    box.innerHTML = '<picture><source type="image/webp" srcset="' + b + '-900.webp 900w, ' + b + '-1600.webp 1600w" sizes="(max-width:720px) 100vw, 54vw">'
      + '<img src="' + b + '-900.jpg" alt="" width="900" height="315" decoding="async" loading="lazy"></picture>';
    box.querySelector("img").onerror = function () { if (box.parentNode) box.parentNode.removeChild(box); h.classList.remove("aog-mast-host"); };
    h.classList.add("aog-mast-host"); h.insertBefore(box, h.firstChild);
    if (!D.getElementById("aog-mast-sketch-css")) { var st = D.createElement("style"); st.id = "aog-mast-sketch-css"; st.appendChild(D.createTextNode(MCSS)); (D.head || D.documentElement).appendChild(st); }
  }
  function mastBoot() {
    var pg = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    if (PAGE[pg]) { mast(PAGE[pg]); return; }
    var tries = 0;
    (function wait() {
      var m = window.AOG_ROOM_MAP, it = m && m[pg];
      if (it && it.unit && /^[a-z]{2,5}-u\d+$/.test(it.unit)) { mast(it.unit); return; }
      if (!m && ++tries < 20) setTimeout(wait, 300);
    })();
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mastBoot); else mastBoot();
})();
