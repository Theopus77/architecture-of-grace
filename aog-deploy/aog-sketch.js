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
    PICS.split(",").map(function (s) { return s + ":not([data-sk=\"1\"]){ filter:url(#aogPencil) !important; }"; }).join("\n"),
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
  var HAVE = /*SKETCH-LIST*/{"1f535":1,"1f9fd":1,"1f5e8":1,"1f375":1,"1f377":1,"1f3e7":1,"25b1":1,"1f610":1,"1f532":1,"1f3db":1,"1f1ee":1,"1f3b1":1,"1f4a5":1,"1f184":1,"1f62d":1,"1f6a4":1,"1f604":1,"1f4be":1,"1f32c":1,"30-20e3":1,"1f521":1,"1f463":1,"2622":1,"1f30c":1,"1faba":1,"1f414":1,"1f502":1,"1f957":1,"262d":1,"1f40b":1,"1f976":1,"1f9f7":1,"1f48d":1,"270c":1,"1f524":1,"1f4af":1,"26ab":1,"1f3a4":1,"1f4d3":1,"1f51a":1,"269b":1,"1f30a":1,"1f4ad":1,"1f931":1,"1f3d7":1,"2638":1,"1fac0":1,"270f":1,"26f5":1,"1f9d1":1,"1f91d":1,"1f42a":1,"1f1ea-1f1f8":1,"1f98e":1,"1f3fa":1,"1f944":1,"1f7e6":1,"1f4c1":1,"1f963":1,"1f7e1":1,"1f3d8":1,"1f99a":1,"261d":1,"270a":1,"1f3af":1,"1f48a":1,"5b-20-5d":1,"1f44d":1,"1f36f":1,"1f4db":1,"1f4dc":1,"2699":1,"1f95e":1,"1fa93":1,"1f9fc":1,"1f9d1-200d-1f393":1,"23ed":1,"1f38e":1,"1f31e-1f319":1,"1f3f4":1,"32-30":1,"1f937":1,"1f96b":1,"1f5f3":1,"1f5fb":1,"1f170":1,"1f3b5":1,"1f39e":1,"1f3ef":1,"271d":1,"1f43a":1,"1f1e6":1,"1f3f9":1,"1f9f6":1,"1f30e":1,"2764":1,"1f5bc":1,"26a1":1,"1f3e0":1,"1f195":1,"1fa82":1,"1f44b":1,"1f6bf":1,"1f7e4":1,"1f396":1,"1f3d6":1,"1f4a8":1,"1f9e0":1,"1f3a1":1,"1f380":1,"1f636":1,"1f331":1,"1f504":1,"1f9ee":1,"1f9b8":1,"1fa79":1,"1f4de":1,"26cf":1,"1f958":1,"2b05":1,"1f33f":1,"1f1ed-1f1f9":1,"1f3a2":1,"1f347":1,"1f3e6":1,"1fae7":1,"1f91a":1,"1f682":1,"1f9e7":1,"1f9e5":1,"1f4d6":1,"31-36":1,"1f4e8":1,"2705":1,"1f473":1,"1f9f8":1,"1f985":1,"1f33e":1,"1f1fa-1f1f8":1,"1f321":1,"1f9f3":1,"1f914":1,"1f449":1,"1f6f0":1,"1f536":1,"1f36c":1,"1f47b":1,"2934":1,"1f3dc":1,"1f69a":1,"1f374":1,"1f7e9":1,"1f9f5":1,"1f570":1,"1f5a5":1,"26e9":1,"1f52e":1,"1f326":1,"1f31e":1,"1f4bb":1,"1f446":1,"1f4f7":1,"26fd":1,"1faa4":1,"1f3a7":1,"2026":1,"1f9d0":1,"1f3ae":1,"1fa9d":1,"1faaa":1,"23f0":1,"1f9f4":1,"1f5d2":1,"1f174":1,"1f969":1,"1f338":1,"1f50d":1,"1f480":1,"1f332":1,"1f6d7":1,"1f386":1,"1f503":1,"1f54c":1,"1f4a1":1,"1f4c9":1,"1f9b5":1,"1f4f1":1,"25ad":1,"1f426":1,"1f96a":1,"1f4cc":1,"1f634":1,"1f418":1,"1f4f0":1,"1faa3":1,"1f1ec-1f1e7":1,"25fc":1,"1f5d1":1,"26d3":1,"1f3d9":1,"1f6e1":1,"2796":1,"1f4fb":1,"1f550":1,"1faf5":1,"1f45a":1,"1fab7":1,"1f30f":1,"1faa8":1,"1f468-200d-1f469-200d-1f467-200d-1f466":1,"1f41a":1,"1f442":1,"1f171":1,"1f6f7":1,"2744":1,"1f6a7":1,"1f194":1,"2716":1,"1f36e":1,"2620":1,"2b06":1,"1f955":1,"1f308":1,"1f4e7":1,"1f32b":1,"1f307":1,"1f526":1,"1f422":1,"1f956":1,"1f46a":1,"26f2":1,"1f507":1,"1f56f":1,"1f98a":1,"1f5fc":1,"1f9cd":1,"1f40e":1,"1f376":1,"1f4ee":1,"26bd":1,"31-31":1,"1f6bb":1,"1f557":1,"25e3":1,"1f4fa":1,"1f1ee-1f1f1":1,"1f3a9":1,"23e2":1,"1f3da":1,"1f333":1,"1f50a":1,"1f34a":1,"1f93c":1,"1f94a":1,"1f475":1,"36-20e3":1,"1f9d1-200d-1f91d-200d-1f9d1":1,"1f983":1,"1f4b0":1,"23e9":1,"1fa86":1,"1f6e3":1,"1f6ec":1,"2712":1,"3a3":1,"1f520":1,"26f0":1,"1f468-200d-1f469-200d-1f467":1,"1f381":1,"1f60a":1,"1f19a":1,"1f61f":1,"1f4d2":1,"1f68c":1,"1f4e4":1,"1f464":1,"1f95a":1,"1f7e3":1,"2754":1,"1f39f":1,"1f343":1,"2225":1,"1f4c4":1,"1f34b":1,"1f45f":1,"1f3dd":1,"1f35e":1,"1f4bc":1,"1f4cf":1,"1f3e2":1,"1f511":1,"1f953":1,"1f330":1,"1f3de":1,"1f64b":1,"2797":1,"1f692":1,"1f50e":1,"1f4c8":1,"1f642":1,"1f392":1,"1f309":1,"1f964":1,"1f4f6":1,"1f551":1,"1f4c5":1,"32-20e3":1,"1f4e1":1,"1f9fa":1,"1f355":1,"1f576":1,"1f342":1,"2714":1,"1f6d6":1,"1f47c":1,"1f4e3":1,"1f6a8":1,"1f3ca":1,"2b50":1,"1f408":1,"270b":1,"1f36b":1,"1f6e4":1,"1fa9b":1,"1f53a":1,"1faa5":1,"1fa99":1,"1f9ba":1,"23f1":1,"2668":1,"1fad8":1,"1f434":1,"1f33d":1,"1f313":1,"1f52d":1,"1f341":1,"1f49b":1,"26a0":1,"1f523":1,"1f55d":1,"1f3ea":1,"1f9c3":1,"221a":1,"1f6f6":1,"1f553":1,"1f927":1,"2692":1,"26d4":1,"1f476":1,"2b21":1,"1f41f":1,"1f468-200d-1f469-200d-1f466":1,"1f981":1,"1f622":1,"1f64f":1,"1f43e":1,"1f52a":1,"37-20e3-30-20e3":1,"1f473-200d-2642":1,"1f518":1,"1f411":1,"1f4d8":1,"1f9cd-200d-2640":1,"1f4d0":1,"1f35a":1,"1f3d3":1,"1f48c":1,"1f366":1,"2708":1,"1f300":1,"1f5c2":1,"1f9f1":1,"1f310":1,"1f6b6":1,"1f3cb":1,"26ea":1,"1f401":1,"2693":1,"1f52c":1,"1f54a":1,"1f97e":1,"1f50c":1,"1f58b":1,"1faa1":1,"1f529":1,"23f9":1,"1f9d8":1,"1f5d3":1,"1f36a":1,"1f43b":1,"1faaf":1,"1f40a":1,"1f437":1,"1f4ac":1,"1f9fb":1,"1f304":1,"2601":1,"1f3b2":1,"1f9ec":1,"1f4ca":1,"1f39a":1,"1f334":1,"1f4b6":1,"1f5fd":1,"1f9c4":1,"1f9d5":1,"1f9d1-200d-1f373":1,"1f3bc":1,"1f9c1":1,"1fab9":1,"1fa9e":1,"1f477":1,"1f4cb":1,"1f6d2":1,"1f573":1,"1fab1":1,"1f34f":1,"1f90f":1,"1f525":1,"2696":1,"1f6d1":1,"1f562":1,"1f4b2":1,"1f9d1-200d-1f527":1,"26c8":1,"1f4dd":1,"1f92b":1,"1f516":1,"23f2":1,"1f33b":1,"1f35b":1,"1f527":1,"1f31f":1,"1f5e3":1,"1f514":1,"1f645":1,"1f49e":1,"1f305":1,"1f193":1,"1f1eb-1f1f7":1,"1f344":1,"34-20e3":1,"2702":1,"5c-55-30-30-30-31-46-34-44-30":1,"1f441":1,"1f7eb":1,"1f6a9":1,"1fa94":1,"1f45c":1,"2604":1,"1f4a7":1,"2721":1,"2b1b":1,"2615":1,"1f58d":1,"1f4a3":1,"1f9f0":1,"1f311":1,"1f3e5":1,"1f501":1,"27a1":1,"1f6a6":1,"22a5":1,"1f941":1,"1f6c3":1,"1f3b8":1,"1f430":1,"1f35c":1,"1f404":1,"1f6bd":1,"1f6cc":1,"1f537":1,"1f3c6":1,"1fa91":1,"1f372":1,"1f4d1":1,"2728":1,"1f3d4":1,"1f9d7":1,"2795":1,"1f3b0":1,"1f431":1,"1f4ec":1,"1f335":1,"1f912":1,"1f3a3":1,"1f30b":1,"1f4d5":1,"1f7e2":1,"1f9ac":1,"1f42b":1,"1f947":1,"1f6bc":1,"1fad9":1,"23ea":1,"1f9d2":1,"1f4b3":1,"1f409":1,"1f320":1,"1f628":1,"1fad2":1,"1f445":1,"1f9f2":1,"1f9e8":1,"2697":1,"1f915":1,"1f590":1,"1f54b":1,"1f6a2":1,"1f388":1,"1f95c":1,"1f3f0":1,"1fa7a":1,"1f3c3":1,"1f554":1,"1f691":1,"1f453":1,"1f51f":1,"1f454":1,"1f948":1,"1f7f0":1,"1f4d7":1,"1f3aa":1,"1fa96":1,"1f35d":1,"1f6de":1,"1f9fe":1,"1f578":1,"1f4da":1,"1f4b5":1,"1f4f8":1,"1fae5":1,"1f389":1,"37-20e3":1,"1fa9c":1,"1f436":1,"1f469-200d-1f3eb":1,"1f3b3":1,"1f3c0":1,"1f697":1,"1f534":1,"1f64c":1,"1f30d":1,"1f41d":1,"1f327":1,"1f17f":1,"1f680":1,"1f37d":1,"2600":1,"1f469-200d-2696":1,"1f44a":1,"1f9a0":1,"1f951":1,"1f9ca":1,"270d":1,"2795-2796":1,"1f4e2":1,"1f9c8":1,"1f69c":1,"1f407":1,"1f9f9":1,"1f9eb":1,"1f560":1,"1f6b0":1,"1f9ef":1,"2194":1,"1f9d1-200d-2696":1,"1f95b":1,"1f3ac":1,"bf":1,"1f438":1,"1f440":1,"bd":1,"1f48e":1,"275d":1,"1f6b7":1,"1f699":1,"1f575":1,"1faf6":1,"1f50b":1,"262a":1,"1f062":1,"1f9ea":1,"1fab5":1,"1f3c1":1,"1fad3":1,"1f324":1,"1f3b7":1,"1f41c":1,"1f3a8":1,"26aa":1,"1f178":1,"2640":1,"1f46b":1,"1f9ed":1,"1f58a":1,"1f382":1,"2709":1,"2753":1,"1f4a4":1,"267b":1,"26fa":1,"1f938":1,"1f966":1,"262f":1,"1f62e":1,"1f53b":1,"1f4b1":1,"21a9":1,"1f9d1-200d-1f3eb":1,"33-20e3":1,"21aa":1,"1f4e6":1,"1f517":1,"1f4c6":1,"39-20e3":1,"1f552":1,"1f5fa":1,"2b1c":1,"1f315":1,"1f9e9":1,"1f932":1,"1f6e0":1,"2198":1,"1f393":1,"1f7e0":1,"1f357":1,"274c":1,"1f39b":1,"1f522":1,"1f319":1,"2757":1,"31-20e3":1,"1f9b6":1,"1f961":1,"1f494":1,"1f3b6":1,"1f4b8":1,"23ee":1,"1f317":1,"1f3ad":1,"267f":1,"2b07":1,"1f9d1-200d-1f4bc":1,"2197":1,"1f3bf":1,"1f3ce":1,"1f457":1,"1f370":1,"1f350":1,"301":1,"1f513":1,"2694":1,"1f17e":1,"1f34e":1,"1f5c3":1,"1f6aa":1,"1f451":1,"1f5dd":1,"1f44f":1,"1f1f4":1,"1f312":1,"2b20":1,"1f318":1,"1fa9f":1,"1f625":1,"1f465":1,"1f916":1,"1f519":1,"1f41b":1,"1f98b":1,"267e":1,"1f4e5":1,"1f373":1,"1f910":1,"1faa2":1,"1f549":1,"26c5":1,"1f3ee":1,"1f46f":1,"1f954":1,"1f500":1,"1f9c5":1,"1f4cd":1,"1f489":1,"1f615":1,"1f6df":1,"260e":1,"2b55":1,"1f455":1,"1fab6":1,"1f3ed":1,"3030":1,"1f9b4":1,"1f9e4":1,"1f3eb":1,"1f3f7":1,"1f9c2":1,"1f306":1,"1f55b":1,"1fa90":1,"1f34c":1,"1f354":1,"1f3ab":1,"1f616":1,"1fac1":1,"1f6cf":1,"1f7e5":1,"1f512":1,"1f37e":1,"1f9d1-200d-1f33e":1,"2195":1,"1f967":1,"1f32a":1,"1f4aa":1,"303d":1,"1f6ab":1,"23f3":1,"1f415":1,"1f998":1,"1f528":1}/*END*/;
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
  CSS += "\n.aog-sk-in{ width:2em; height:2em; margin:0 .15em .1em 0; }";
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
    ".aog-mast-host{ position:relative; }", ".aog-mast-sketch{ overflow:hidden; }",
    ".aog-mast-host > :not(.aog-mast-sketch){ position:relative; z-index:1; }",
    ".aog-mast-sketch{ position:absolute; top:0; right:0; bottom:0; width:min(54%,700px); z-index:0; pointer-events:none; }",
    ".aog-mast-sketch img{ display:block; width:100%; height:100%; object-fit:cover; object-position:80% 42%; filter:brightness(.78) contrast(1.05); }",
    ".aog-mast-sketch{ -webkit-mask-image:linear-gradient(90deg, transparent 0%, rgba(0,0,0,.55) 30%, #000 62%, #000 86%, transparent 100%); mask-image:linear-gradient(90deg, transparent 0%, rgba(0,0,0,.55) 30%, #000 62%, #000 86%, transparent 100%); }",
    "@media (max-width:720px){ .aog-mast-sketch{ width:100%; opacity:.28; -webkit-mask-image:none; mask-image:none; } }",
    "@media print{ .aog-mast-sketch{ display:none; } }"
  ].join("\n");
  function mast(id) {
    var h1 = D.querySelector("main h1") || D.querySelector("h1");
    var h = D.querySelector("header.mast, .mast") || (h1 && h1.closest("header"));
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
    if (/^(music-drums|music-decks|science-waves|daily-drops|slip|word-foundry)$/.test(pg)) return;   /* instruments and tools keep their own faces */
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
