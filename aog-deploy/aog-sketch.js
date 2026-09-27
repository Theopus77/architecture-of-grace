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

  /* AOG-DRAFTING-TABLE-V1 (2026-09-27) — Jimmy: the interface should feel like a sketch pad; "what does an
     architect use to sketch?" The page is an architect's drafting table: faint graph paper under everything,
     cards drawn as sheets with a pencil edge, and the navy headers stay the blueprint, untouched. Light theme
     only; text and button colours do not change; nothing moves. */
  var SHEETS = ".les, .unit.open, .qcard, #ground, .ground, .sheet, .card, .aog-rstep > article, .pane > article, .dr-card, .dr-unit";
  CSS += "\nhtml:not([data-theme=\"dark\"]) body{ background-image:linear-gradient(rgba(47,99,184,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(47,99,184,.055) 1px, transparent 1px) !important; background-size:22px 22px !important; background-attachment:scroll; }"
    + "\n@media (prefers-color-scheme: dark){ html:not([data-theme=\"light\"]) body{ background-image:none !important; } }"
    + "\nhtml:not([data-theme=\"dark\"]) :is(" + SHEETS + "){ box-shadow:0 0 0 1.2px rgba(42,38,34,.62), 1.5px 2px 0 -0.4px rgba(42,38,34,.32), 0 12px 24px -18px rgba(0,0,0,.35) !important; }"
    + "\n@media print{ body{ background-image:none !important; } }";
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
    var img = D.createElement("img"); img.className = "aog-sk"; img.alt = t; img.decoding = "async"; /* the alt keeps the emoji's meaning for screen readers */
    img.src = "/img/sketch/" + cps(t) + ".webp";
    img.onerror = function () { el.textContent = t; el.removeAttribute("data-sk"); el.setAttribute("data-sk-miss", "1"); };
    el.textContent = ""; el.appendChild(img);
  }
  /* emoji inside running text (the slips' answer choices, Daily Drafts): swapped only where a
     drawing exists (HAVE, written by _work/art/sketchicons/manifest.py); other symbols stay. */
  var HAVE = /*SKETCH-LIST*/{"1f535":1,"1f9fd":1,"1f5e8":1,"1f375":1,"1f377":1,"1f3e7":1,"25b1":1,"1f610":1,"1f532":1,"1f1ea":1,"1f3db":1,"1f1ee":1,"1f3b1":1,"1f4a5":1,"1f9e1":1,"1f623":1,"1f184":1,"1f62d":1,"1f6a4":1,"1f91f":1,"1f604":1,"1f4be":1,"1f32c":1,"30-20e3":1,"1f620":1,"1f521":1,"1f612":1,"1f463":1,"2622":1,"1f30c":1,"1faba":1,"1f414":1,"1f502":1,"1f957":1,"27bf":1,"262d":1,"1f40b":1,"1f976":1,"1f9f7":1,"1f48d":1,"270c":1,"1f524":1,"2715":1,"1f4af":1,"26ab":1,"1f1eb":1,"1f3a4":1,"1f4d3":1,"1f51a":1,"269b":1,"1f30a":1,"1f4ad":1,"1f931":1,"1f3d7":1,"2638":1,"1fac0":1,"270f":1,"26f5":1,"1f9d1":1,"1f91d":1,"1f42a":1,"1f1ea-1f1f8":1,"1f98e":1,"1f3fa":1,"1f944":1,"1f7e6":1,"1f4c1":1,"1f963":1,"1f7e1":1,"1f3d8":1,"1f99a":1,"261d":1,"270a":1,"1f3af":1,"1f48a":1,"1f62c":1,"5b-20-5d":1,"1f44d":1,"1f36f":1,"1f4db":1,"1f4dc":1,"2699":1,"1f95e":1,"1fa93":1,"1f9fc":1,"1f9d1-200d-1f393":1,"23ed":1,"1f38e":1,"1f31e-1f319":1,"1f3f4":1,"32-30":1,"1f937":1,"1f96b":1,"1f5f3":1,"1f5fb":1,"1f170":1,"1f3b5":1,"1f39e":1,"1f3ef":1,"1f9d1-200d-2695":1,"271d":1,"1f43a":1,"1f1e6":1,"1f3f9":1,"1f9f6":1,"1f30e":1,"2764":1,"2611":1,"1f5bc":1,"26a1":1,"1f3e0":1,"1f195":1,"1fa82":1,"1f1e7":1,"1f44b":1,"1f6bf":1,"1f7e4":1,"1f396":1,"1f3d6":1,"1f4a8":1,"1f9e0":1,"1f3a1":1,"1f380":1,"1f636":1,"1f331":1,"1f504":1,"1f9ee":1,"1f9b8":1,"1fa79":1,"1f4de":1,"26cf":1,"1f958":1,"2b05":1,"1f33f":1,"1f1ed-1f1f9":1,"1f3a2":1,"1f347":1,"2718":1,"1f3e6":1,"1fae7":1,"1f91a":1,"1f682":1,"1f9e7":1,"1f9e5":1,"1f4d6":1,"31-36":1,"2726":1,"1f4e8":1,"2705":1,"1f473":1,"1f9f8":1,"1f985":1,"1f33e":1,"1f1fa-1f1f8":1,"1f321":1,"1f9f3":1,"1f914":1,"1f449":1,"1f6f0":1,"1f536":1,"1f36c":1,"1f47b":1,"2934":1,"1f3dc":1,"1f69a":1,"1f374":1,"1f7e9":1,"1f6b9":1,"1f9f5":1,"1f570":1,"1f5a5":1,"26e9":1,"1f52e":1,"1f326":1,"1f31e":1,"1f4bb":1,"1f446":1,"1f4f7":1,"26fd":1,"1faa4":1,"1f3a7":1,"1f60e":1,"2026":1,"1f9d0":1,"1f3ae":1,"1fa9d":1,"1faaa":1,"23f0":1,"1f9f4":1,"1f5d2":1,"1f174":1,"1f969":1,"1f338":1,"1f50d":1,"1f480":1,"1f332":1,"1f6d7":1,"1f386":1,"2639":1,"1f503":1,"1f54c":1,"1f4a1":1,"2606":1,"1f4c9":1,"1f9b5":1,"1f4f1":1,"25ad":1,"1f426":1,"2605":1,"1f96a":1,"1f4cc":1,"1f634":1,"1f418":1,"1f4f0":1,"1f5ce":1,"1faa3":1,"1f1ec-1f1e7":1,"25fc":1,"1f5d1":1,"26d3":1,"1f922":1,"1f3d9":1,"1f1f7":1,"2610":1,"1f6e1":1,"2796":1,"1f4fb":1,"1f550":1,"1faf5":1,"1f45a":1,"1fab7":1,"1f30f":1,"1faa8":1,"1f468-200d-1f469-200d-1f467-200d-1f466":1,"1f41a":1,"1f442":1,"1f171":1,"1f6f7":1,"2744":1,"1f6a7":1,"1f194":1,"2716":1,"1f36e":1,"2717":1,"2620":1,"2b06":1,"1f955":1,"1f308":1,"1f4e7":1,"1f32b":1,"1f307":1,"1f526":1,"1f422":1,"1f956":1,"1f46a":1,"26f2":1,"1f507":1,"1f56f":1,"1f98a":1,"1f5fc":1,"1f9cd":1,"1f40e":1,"1f376":1,"1f4ee":1,"26bd":1,"31-31":1,"1f6bb":1,"1f557":1,"25e3":1,"1f4fa":1,"1f1ee-1f1f1":1,"1f3a9":1,"23e2":1,"1f3da":1,"1f333":1,"1f50a":1,"1f34a":1,"1f93c":1,"1f94a":1,"1f475":1,"36-20e3":1,"1f9d1-200d-1f91d-200d-1f9d1":1,"1f983":1,"1f4b0":1,"23e9":1,"1f423":1,"1fa86":1,"1f3ba":1,"1f6e3":1,"1f6ec":1,"2712":1,"3a3":1,"1f520":1,"26f0":1,"1f468-200d-1f469-200d-1f467":1,"1f381":1,"1f60a":1,"1f19a":1,"1f61f":1,"1f4d2":1,"1f68c":1,"1f4e4":1,"1f464":1,"1f95a":1,"1f7e3":1,"2754":1,"1f39f":1,"1f343":1,"270e":1,"2225":1,"1f4c4":1,"1f34b":1,"1f45f":1,"1f3dd":1,"1f35e":1,"1f4bc":1,"1f4cf":1,"1f3e2":1,"1f511":1,"1f953":1,"1f330":1,"1f3de":1,"1f64b":1,"2797":1,"1f692":1,"1f50e":1,"1f4c8":1,"1f642":1,"1f392":1,"1f309":1,"1f964":1,"1f4f6":1,"1f551":1,"1f4c5":1,"32-20e3":1,"1f4e1":1,"1f92a":1,"1f9fa":1,"23f8":1,"1f355":1,"1f576":1,"1f342":1,"2714":1,"1f6d6":1,"1f47c":1,"1f4e3":1,"1f6a8":1,"1f3ca":1,"2b50":1,"1f408":1,"270b":1,"1f36b":1,"1f6e4":1,"1fa9b":1,"1f1f9":1,"1f53a":1,"1faa5":1,"1fa99":1,"1f9ba":1,"23f1":1,"2668":1,"1fad8":1,"1f434":1,"1f33d":1,"1f313":1,"1f52d":1,"1f341":1,"1f49b":1,"26a0":1,"1f523":1,"1f55d":1,"1f3ea":1,"1f9c3":1,"221a":1,"1f6f6":1,"1f553":1,"1f927":1,"2692":1,"26d4":1,"1f476":1,"2b21":1,"1f41f":1,"1f468-200d-1f469-200d-1f466":1,"1f981":1,"1f622":1,"1f64f":1,"1f43e":1,"2304":1,"1f52a":1,"37-20e3-30-20e3":1,"1f473-200d-2642":1,"1f518":1,"1f411":1,"1f4d8":1,"1f9cd-200d-2640":1,"1fac2":1,"1f4d0":1,"1f975":1,"1f35a":1,"1f3d3":1,"1f48c":1,"1f366":1,"2708":1,"1f300":1,"1f5c2":1,"1f9f1":1,"1f310":1,"1f6b6":1,"1f3cb":1,"26ea":1,"1f401":1,"2693":1,"1f52c":1,"1f54a":1,"1f97e":1,"1f50c":1,"1f58b":1,"1faa1":1,"1f529":1,"23f9":1,"1f9d8":1,"1f5d3":1,"1f36a":1,"1f43b":1,"1faaf":1,"1f40a":1,"1f437":1,"1f4ac":1,"1f9fb":1,"1f9d1-200d-1f4bb":1,"1f304":1,"2601":1,"1f3b2":1,"1f9ec":1,"1f4ca":1,"1f39a":1,"1f334":1,"1f4b6":1,"1f5a8":1,"1f5fd":1,"1f9c4":1,"1f9d5":1,"1f9d1-200d-1f373":1,"1f3bc":1,"1f9c1":1,"1fab9":1,"1fa9e":1,"1f477":1,"1f4cb":1,"1f6d2":1,"1f573":1,"1fab1":1,"1f34f":1,"1f90f":1,"1f525":1,"1f9b7":1,"2696":1,"1f46e":1,"1f641":1,"1f6d1":1,"1f629":1,"1f562":1,"1f4b2":1,"1f9d1-200d-1f527":1,"26c8":1,"1f4dd":1,"1f92b":1,"1f516":1,"23f2":1,"1f33b":1,"1f35b":1,"1f527":1,"1f31f":1,"1f5e3":1,"23cf":1,"1f514":1,"1f645":1,"1f49e":1,"1f305":1,"1f193":1,"1f44e":1,"1f1eb-1f1f7":1,"1f344":1,"34-20e3":1,"2702":1,"5c-55-30-30-30-31-46-34-44-30":1,"1f441":1,"1f7eb":1,"1f6a9":1,"1fa94":1,"1f45c":1,"2604":1,"1f4a7":1,"2721":1,"2b1b":1,"2615":1,"1f58d":1,"1f4a3":1,"1f9f0":1,"1f311":1,"1f3e5":1,"2612":1,"1f501":1,"27a1":1,"1f6a6":1,"22a5":1,"1f941":1,"1f6c3":1,"1f3b8":1,"1f430":1,"1f35c":1,"1f404":1,"1f6bd":1,"1f6cc":1,"1f537":1,"1f3c6":1,"1fa91":1,"1f372":1,"1f4d1":1,"2728":1,"1f3d4":1,"1f9d7":1,"2795":1,"1f3b0":1,"1f431":1,"1f4ec":1,"1f335":1,"1f912":1,"1f3a3":1,"1f30b":1,"1f4d5":1,"1f7e2":1,"1f9ac":1,"1f42b":1,"1f947":1,"1f6bc":1,"1fad9":1,"23ea":1,"1f9d2":1,"1f4b3":1,"1f409":1,"1f320":1,"1f628":1,"1fad2":1,"1f445":1,"1f9f2":1,"1f9e8":1,"2697":1,"1f915":1,"1f590":1,"1f54b":1,"1f6a2":1,"1f388":1,"1f95c":1,"1f3f0":1,"1fa7a":1,"1f3c3":1,"1f554":1,"1f691":1,"1f1f1":1,"1f4ab":1,"1f453":1,"1f539":1,"1f51f":1,"1f454":1,"1f948":1,"1f7f0":1,"1f4d7":1,"1f3aa":1,"1fa96":1,"1f35d":1,"1f6de":1,"1f9fe":1,"1f578":1,"1f4da":1,"1f4b5":1,"1f4f8":1,"1fae5":1,"1f389":1,"37-20e3":1,"1f60c":1,"1fa9c":1,"1f436":1,"1f469-200d-1f3eb":1,"1f3b3":1,"1f3c0":1,"1f697":1,"1f534":1,"1f64c":1,"1f30d":1,"1f41d":1,"1f327":1,"1f17f":1,"1f680":1,"1f37d":1,"2600":1,"1f469-200d-2696":1,"1f44a":1,"1f9a0":1,"1f973":1,"1f951":1,"1f9ca":1,"270d":1,"2795-2796":1,"1f1ec":1,"1f4e2":1,"1f9c8":1,"1f69c":1,"1f407":1,"1f9f9":1,"1f9eb":1,"1f560":1,"1f646":1,"1f6b0":1,"1f9ef":1,"2194":1,"1f1ed":1,"1f9d1-200d-2696":1,"1f95b":1,"1f3ac":1,"bf":1,"1f438":1,"1f440":1,"bd":1,"1f48e":1,"275d":1,"1f6b7":1,"1f699":1,"1f575":1,"1faf6":1,"1f50b":1,"262a":1,"1f062":1,"1f9ea":1,"1fab5":1,"1f3c1":1,"1fad3":1,"1f324":1,"1f3b7":1,"1f1f8":1,"1f41c":1,"1f3a8":1,"26aa":1,"1f178":1,"2640":1,"1f46b":1,"1f9ed":1,"1f58a":1,"1f382":1,"2709":1,"2753":1,"1f4a4":1,"1f621":1,"267b":1,"26fa":1,"1f938":1,"1f966":1,"262f":1,"1f62e":1,"1f53b":1,"1f4b1":1,"21a9":1,"1f9d1-200d-1f3eb":1,"33-20e3":1,"21aa":1,"2713":1,"1f4e6":1,"1f517":1,"1f4c6":1,"39-20e3":1,"1f552":1,"1f5fa":1,"2b1c":1,"1f1fa":1,"1f315":1,"274b":1,"1f9e9":1,"1f932":1,"1f6e0":1,"2198":1,"1f393":1,"1f7e0":1,"1f357":1,"274c":1,"1f39b":1,"1f522":1,"1f319":1,"1f633":1,"2757":1,"31-20e3":1,"1f9b6":1,"1f961":1,"1f494":1,"1f3b6":1,"1f4b8":1,"23ee":1,"1f317":1,"1f3ad":1,"267f":1,"2b07":1,"1f9d1-200d-1f4bc":1,"2197":1,"1f3bf":1,"1f3ce":1,"1f457":1,"1f370":1,"1f350":1,"301":1,"1f513":1,"1f3e1":1,"2694":1,"1f17e":1,"1f34e":1,"1f5c3":1,"1f6aa":1,"1f451":1,"1f5dd":1,"1f44f":1,"1f1f4":1,"1f312":1,"2b20":1,"1f318":1,"1fa9f":1,"1f625":1,"1f465":1,"1f916":1,"1f519":1,"1f443":1,"1f41b":1,"1f98b":1,"267e":1,"1f4e5":1,"1f373":1,"1f910":1,"1faa2":1,"1f549":1,"26c5":1,"1f3ee":1,"1f46f":1,"1f954":1,"1f500":1,"1f9c5":1,"1f624":1,"1f4cd":1,"1f489":1,"1f615":1,"1f6df":1,"260e":1,"2b55":1,"1f455":1,"1fab6":1,"1f3ed":1,"3030":1,"1f9b4":1,"1f9e4":1,"1f3eb":1,"1f3f7":1,"1f9c2":1,"1f306":1,"1f55b":1,"1fa90":1,"1f34c":1,"1f354":1,"1f3ab":1,"1f616":1,"1fac1":1,"1f6cf":1,"1f7e5":1,"1f512":1,"1f37e":1,"1f9d1-200d-1f33e":1,"2195":1,"1f967":1,"1f32a":1,"1f90d":1,"1f4aa":1,"303d":1,"1f6ab":1,"23f3":1,"1f415":1,"1f998":1,"1f528":1}/*END*/;
  var RUN = /(?:[☀-➿⬀-⯿⌀-⏿]|[\ud83c-\ud83e][\udc00-\udfff])(?:️)?(?:‍(?:[☀-➿]|[\ud83c-\ud83e][\udc00-\udfff])(?:️)?)*/g;
  /* AOG-SKETCH-MARKS (2026-09-27) — Jimmy: "everything should look sketched." Typed marks (stars, ticks,
     boxes, crosses, the pencil) become small pencil drawings that sit in the line like a letter. */
  var MARK = { "2605":1, "2606":1, "2b50":1, "2713":1, "2714":1, "2717":1, "2718":1, "2715":1, "2716":1, "2610":1, "2611":1, "2612":1, "270e":1, "2726":1, "2304":1, "23cf":1, "1f5ce":1 };
  var INLINE = (ME && ME.getAttribute("data-inline")) || "body";   /* every page: emoji and typed marks in its text become drawings */
  function inline(root) {
    if (!INLINE) return;
    var hosts = root.querySelectorAll ? root.querySelectorAll(INLINE) : [];
    for (var i = 0; i < hosts.length; i++) {
      var w = D.createTreeWalker(hosts[i], NodeFilter.SHOW_TEXT, null), t, todo = [];
      while ((t = w.nextNode())) { var pe = t.parentElement; if (pe && !pe.closest("textarea,script,style,select,option,code,pre,svg,[contenteditable],title,noscript") && RUN.test(t.nodeValue)) todo.push(t); RUN.lastIndex = 0; }
      todo.forEach(function (tn) {
        var v = tn.nodeValue, frag = D.createDocumentFragment(), last = 0, m, hit = false;
        RUN.lastIndex = 0;
        while ((m = RUN.exec(v))) {
          var k = cps(m[0]); if (!HAVE[k]) continue;
          hit = true; frag.appendChild(D.createTextNode(v.slice(last, m.index)));
          var img = D.createElement("img"); img.className = "aog-sk aog-sk-in"; img.alt = m[0]; img.src = "/img/sketch/" + k + ".webp"; if (MARK[k]) img.className += " aog-sk-mark";
          frag.appendChild(img); last = m.index + m[0].length;
        }
        if (!hit) return;
        frag.appendChild(D.createTextNode(v.slice(last))); tn.parentNode.replaceChild(frag, tn);
      });
    }
  }
  CSS += "\n.aog-sk-in{ width:2em; height:2em; margin:0 .15em .1em 0; }";
  /* the fire mark the books put before a hard question (CSS content, so it is drawn here) */
  CSS += "\n.bc .bang::before{ content:\"\" / \"🔥\" !important; display:inline-block; width:1.15em; height:1.15em; margin-right:.3em; vertical-align:-.2em; background:url(/img/sketch/1f525.webp) center/contain no-repeat; }";
  CSS += "\n.aog-sk-in.aog-sk-mark{ width:1.05em; height:1.05em; margin:0 .08em .12em; vertical-align:middle; }";
  /* a mark on dark ground (the navy masthead, the dark theme) is drawn in light pencil so it stays readable */
  function lum(c) { var m = (c || "").match(/\d+(\.\d+)?/g); if (!m) return 0; return (0.3 * m[0] + 0.59 * m[1] + 0.11 * m[2]) / 255; }
  function tone() { var n = D.querySelectorAll("img.aog-sk-mark"); for (var i = 0; i < n.length; i++) { var pe = n[i].parentElement; if (pe) n[i].classList.toggle("aog-sk-lt", lum(getComputedStyle(pe).color) > .55); } }
  CSS += "\n.aog-sk-mark.aog-sk-lt{ filter:invert(1) brightness(1.9) !important; }";
  /* marks inside drawn diagrams (SVG text): a pencil picture is laid exactly over the mark, and the
     mark itself goes see-through, so screen readers and copy still get it */
  var SVGNS = "http://www.w3.org/2000/svg";
  function svgMarks() {
    var ts = D.querySelectorAll("svg text");
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i], s = t.textContent || "";
      if (t.__sk === s) continue;
      if (t.__skImgs) { t.__skImgs.forEach(function (im) { im.remove(); }); t.__skImgs = null; }
      if (t.children.length && !t.querySelector("tspan[data-sk]")) { t.__sk = s; continue; }
      var hits = [], m; RUN.lastIndex = 0;
      while ((m = RUN.exec(s))) { var k = cps(m[0]); if (HAVE[k]) hits.push({ i: m.index, n: m[0].length, k: k, ch: m[0] }); }
      if (!hits.length) { t.__sk = s; continue; }
      var bb; try { bb = t.getBBox(); } catch (e) { bb = null; }
      if (!bb || !bb.width) continue;                                   /* hidden for now; tried again on the next sweep */
      var boxes = hits.map(function (h) { try { return t.getExtentOfChar(h.i); } catch (e) { return null; } });
      var fr = D.createDocumentFragment(), last = 0;
      hits.forEach(function (h) {
        fr.appendChild(D.createTextNode(s.slice(last, h.i)));
        var sp = D.createElementNS(SVGNS, "tspan"); sp.setAttribute("data-sk", "1"); sp.style.fillOpacity = "0"; sp.textContent = h.ch; fr.appendChild(sp);
        last = h.i + h.n;
      });
      fr.appendChild(D.createTextNode(s.slice(last)));
      var light = lum(getComputedStyle(t).fill) > .55;
      t.textContent = ""; t.appendChild(fr);
      t.__skImgs = [];
      hits.forEach(function (h, j) {
        var b = boxes[j]; if (!b) return;
        var z = Math.max(b.height * .8, 6), im = D.createElementNS(SVGNS, "image");
        im.setAttribute("href", "/img/sketch/" + h.k + ".webp");
        im.setAttribute("x", b.x + b.width / 2 - z / 2); im.setAttribute("y", b.y + b.height / 2 - z / 2);
        im.setAttribute("width", z); im.setAttribute("height", z); im.setAttribute("aria-hidden", "true");
        im.setAttribute("preserveAspectRatio", "xMidYMid meet"); im.style.pointerEvents = "none";
        if (t.getAttribute("transform")) im.setAttribute("transform", t.getAttribute("transform"));
        if (light) im.style.filter = "invert(1) brightness(1.9)";
        t.parentNode.insertBefore(im, t.nextSibling); t.__skImgs.push(im);
      });
      t.__sk = t.textContent;
    }
  }
  function sweep() { inline(D); tone(); try { svgMarks(); } catch (e) {} var n = D.querySelectorAll(PICS); for (var i = 0; i < n.length; i++) swap(n[i]); }
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
    D.addEventListener("click", function () { setTimeout(function () { try { svgMarks(); } catch (e) {} }, 120); }, true);
    if (window.MutationObserver) { new MutationObserver(function () { setTimeout(tone, 60); }).observe(D.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] }); }
    try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { setTimeout(tone, 60); }); } catch (e) {}
    if (window.MutationObserver) { var sT; new MutationObserver(function () { clearTimeout(sT); sT = setTimeout(sweep, 30); }).observe(D.body, { childList: true, subtree: true }); }
  }
  if (D.body) boot(); else D.addEventListener("DOMContentLoaded", boot);
  /* ── AOG-MAST-SKETCH-V1 — a pencil drawing in the navy masthead of the rooms (exam prep, tests,
     practice), the microscope, the telescope and the worksheets. A room shows the drawing of the
     course unit it practises (aog-room-map.js); if that drawing is not made yet, nothing shows. ── */
  var PAGE = { "science-microscope": "page-microscope", "microscope-guide": "page-microscope", "microscope-lessons": "page-microscope",
    "telescope": "page-telescope", "science-telescope": "page-telescope", "telescope-guide": "page-telescope", "telescope-lessons": "page-telescope",
    "AoG-Interior-Worksheets": "page-worksheets",
    "english-hub": "page-english-hub", "math-hub": "page-math-hub", "science-hub": "page-science-hub", "social-studies-hub": "page-social-studies-hub",
    "spanish-hub": "page-spanish-hub", "facs-hub": "page-facs-hub", "dashboard": "page-dashboard", "turn-ins": "page-turn-ins",
    "daily-drops": "page-daily-drops", "quiet-space": "page-quiet-space" };
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
    var h = (h1 && h1.closest("header.mast, .mast, header")) || D.querySelector("header.mast, .mast");   /* the title's own header, never a panel inside a tool */
    if (!h || h.querySelector(".aog-mast-sketch")) return;
    var box = D.createElement("span"); box.className = "aog-mast-sketch"; box.setAttribute("aria-hidden", "true");
    var b = "/img/banners/" + id + "-pencil";
    box.innerHTML = '<picture><source type="image/webp" srcset="' + b + '-900.webp 900w, ' + b + '-1600.webp 1600w" sizes="(max-width:720px) 100vw, 54vw">'
      + '<img src="' + b + '-900.jpg" alt="" width="900" height="315" decoding="async" loading="lazy"></picture>';
    box.querySelector("img").onerror = function () { if (box.parentNode) box.parentNode.removeChild(box); h.classList.remove("aog-mast-host"); };
    h.classList.add("aog-mast-host"); h.insertBefore(box, h.firstChild);
    if (!D.getElementById("aog-mast-sketch-css")) { var st = D.createElement("style"); st.id = "aog-mast-sketch-css"; st.appendChild(D.createTextNode(MCSS)); (D.head || D.documentElement).appendChild(st); }
  }
  /* AOG-HUB-SKETCH-V1 — Jimmy: "Can the rooms get a sketch style look as well?" On the subject hubs every unit
     and room card shows the pencil drawing of the page it opens, on sketch-pad paper with a pencil edge. */
  var SHORT = /*SHORT*/{"/aog-district-admin-view-demo":"AoG-District-Admin-View-Demo","/b1":"b1-living-things","/b11":"b11-grammar","/b12":"b12-sixth-grade-review","/b13":"b13-sixth-grade-practice","/b14":"b14-matter","/b15":"b15-forces-energy-waves","/b16":"b16-earth-systems","/b17":"b17-space-systems","/b18":"b18-forces-motion","/b19":"b19-life-cycles-traits","/b2":"b2-cell-system","/b20":"b20-weather-climate","/b21":"b21-energy","/b22":"b22-changing-surface","/b23":"b23-matter-properties","/b24":"b24-ecosystems","/b25":"b25-earth-in-space","/b26":"b26-pushes-pulls","/b27":"b27-sun-moon-sky","/b28":"b28-living-things-need","/b29":"b29-weather-seasons","/b3":"b3-body-systems","/b30":"b30-light-sound","/b31":"b31-materials-change","/b32":"b32-cells-energy","/b33":"sci-u17","/b33-genetics-evolution.html":"sci-u17","/b34":"b34-ecosystems-human-impact","/b35":"b35-matter-reactions","/b36":"b36-forces-energy-waves-hs","/b37":"b37-earth-space-hs","/b38":"b38-chem-atoms-bonding","/b39":"b39-chem-stoich-solutions","/b4":"b4-reproduction","/b40":"b40-physics-motion-forces","/b41":"b41-physics-energy-waves-electricity","/b42":"b42-environmental-science","/b43":"b43-capstone-evidence","/b5":"b5-ecosystems","/b6":"b6-populations","/b7":"b7-heredity","/b8":"exam-prep","/b8-natural-selection.html":"exam-prep","/b9":"b9-new-nation","/charts104":"AoG-Anchor-Charts-104","/charts12":"AoG-Anchor-Charts-12","/charts18":"AoG-Anchor-Charts-18","/charts207":"AoG-Anchor-Charts-207","/charts36":"AoG-Anchor-Charts","/concepts":"concepts-and-data","/counselor":"counselor-capacity","/decks":"music-decks","/drops":"daily-drops","/drums":"music-drums","/drum-machine":"music-drums","/e1":"e1-sounds-and-letters","/e10":"e10-story-elements","/e11":"e11-text-structure","/e12":"e12-the-paragraph","/e13":"e13-clues-and-word-parts","/e14":"e14-figurative-language","/e15":"e15-tone-and-voice","/e16":"e16-rhetoric","/e17":"e17-punctuation-meaning","/e18":"e18-clauses-parallel-usage","/e19":"e19-literary-devices","/e2":"e2-sight-words","/e20":"e20-diction-and-syntax","/e21":"e21-reasoning-and-fallacies","/e22":"e22-advanced-punctuation","/e23":"e23-concision-and-style","/e24":"e24-capstone","/e3":"e3-a-whole-thought","/e4":"e4-who-where-what","/e5":"e5-beginning-middle-end","/e6":"e6-true-books-story-books","/e7":"e7-word-parts","/e8":"e8-context-clues","/e9":"e9-main-idea","/ec1":"ec1-scarcity-and-choice","/ec2":"ec2-supply-and-demand","/ec3":"ec3-prices-and-market-failure","/ec4":"ec4-competition-and-firms","/ec5":"ec5-measuring-the-economy","/ec6":"ec6-business-cycle-and-fiscal","/ec7":"ec7-money-banking-and-the-fed","/ec8":"ec8-trade-taxes-and-the-world","/economics":"economics-hub","/english":"english-hub","/facs":"facs-hub","/family":"family-letters","/fc1":"fc1-kitchen-safety","/fc10":"fc10-child-development","/fc11":"fc11-independent-living","/fc12":"fc12-capstone","/fc13":"fc13-clean-hands","/fc14":"fc14-hot-cold-sharp","/fc15":"fc15-everyday-sometimes","/fc16":"fc16-job-to-the-end","/fc17":"fc17-measure-it-right","/fc18":"fc18-needle-and-button","/fc19":"fc19-money-and-choices","/fc2":"fc2-knife-skills","/fc20":"fc20-plan-cook-clean","/fc3":"fc3-measuring-recipes","/fc4":"fc4-hand-sewing","/fc5":"fc5-sewing-machine","/fc6":"fc6-fabric-patterns","/fc7":"fc7-cooking-methods","/fc8":"fc8-nutrition","/fc9":"fc9-food-science","/governance":"data-governance","/h10":"h10-the-first-branch","/h11":"h11-the-second-branch","/h12":"h12-the-blueprint","/h13":"h13-rights-in-writing","/h14":"h14-how-a-bill-becomes-a-law","/h15":"h15-the-illinois-constitution","/h16":"h16-put-it-all-together","/h9":"h9-the-third-branch","/interior":"interior-math","/lessons104":"room-104-lessons","/lessons12":"room-12-lessons","/lessons18":"room-18-lessons","/lessons207":"room-207-lessons","/lessons36":"room-36-lessons","/letters":"family-letters","/m1":"m1-one-step-equations","/m10":"m10-smaller-steps","/m11":"m11-two-names","/m12":"m12-name-the-move","/m13":"m13-say-it-in-math","/m14":"m14-last-on-first-off","/m15":"m15-counting-how-many","/m16":"m16-add-subtract-within-20","/m17":"m17-tens-ones-hundreds","/m18":"m18-add-subtract-within-1000","/m19":"m19-length-time-money","/m2":"m2-where-it-goes","/m20":"m20-shapes-equal-shares","/m21":"m21-multiplication-division-meaning","/m22":"m22-multi-digit-multiplication","/m23":"m23-fractions-add-subtract-multiply","/m24":"m24-decimals","/m25":"m25-measurement-area-perimeter-volume","/m26":"m26-geometry-coordinate-plane","/m27":"m27-ratios-rates","/m28":"m28-proportional-percent","/m29":"m29-inequalities","/m3":"m3-walk-the-line","/m30":"m30-area-surface-volume","/m31":"m31-angles-triangles-scale","/m32":"m32-probability-sampling","/m33":"m33-exponents-roots-scinot","/m34":"m34-equations-systems","/m35":"m35-functions-slope","/m36":"m36-transformations","/m37":"m37-pythagorean-theorem","/m38":"m38-alg1-linear-equations-inequalities","/m39":"m39-alg1-functions-linear-models","/m4":"m4-how-far-from-zero","/m40":"m40-alg1-systems","/m41":"m41-alg1-exponents-polynomials-factoring","/m42":"m42-alg1-quadratics","/m43":"m43-geo-proof-congruence-triangles","/m44":"m44-geo-similarity-trig","/m45":"m45-geo-circles-area-volume","/m46":"m46-alg2-polynomial-rational","/m47":"m47-alg2-exponential-logarithmic","/m48":"m48-trigonometric-functions","/m49":"m49-sequences-series","/m5":"m5-sign-and-size","/m50":"m50-statistics-sample-to-claim","/m51":"m51-financial-math","/m52":"m52-capstone-model-it","/m6":"m6-both-ways","/m7":"m7-what-goes-first","/m8":"m8-like-and-unlike","/m9":"m9-land-on-it","/math":"math-hub","/microscope":"science-microscope","/n1":"n1-the-outsiders","/prep":"exam-prep","/quiz":"social-quiz","/r1":"r1-reading-sacred-texts","/r10":"r10-religion-and-the-world","/r11":"r11-one-question-many-lenses","/r12":"r12-capstone","/r2":"r2-hebrew-bible","/r3":"r3-new-testament","/r4":"r4-judaism","/r5":"r5-islam","/r6":"r6-hinduism","/r7":"r7-buddhism","/r8":"r8-confucianism-daoism","/r9":"r9-sikhism-jainism-africa-americas","/roadmap":"evidence","/room104":"room-104-curriculum","/room12":"room-12-curriculum","/room18":"room-18-curriculum","/room207":"room-207-curriculum","/room36":"room-36-curriculum","/s1":"s1-government","/s10":"s10-then-and-now","/s11":"s11-needs-wants-work","/s12":"s12-symbols-stories","/s13":"s13-world-before-1500","/s14":"s14-world-regions","/s15":"s15-reconstruction-to-present","/s16":"s16-empires-and-exchange","/s17":"s17-revolutions-modern-world","/s18":"s18-human-geography","/s19":"s19-civics-rights-power","/s2":"s2-communities-illinois","/s20":"s20-industry-progressive-era","/s21":"s21-world-wars-cold-war","/s22":"s22-civil-rights-to-today","/s23":"s23-government","/s24":"s24-economics","/s25":"s25-capstone-inquiry","/s3":"s3-first-peoples","/s4":"s4-explorers-colonies-nation","/s5":"s5-money-markets-choices","/s6":"s6-maps-us-regions","/s7":"s7-me-family-class","/s8":"s8-rules-fair-choices","/s9":"s9-maps-where-things-are","/schools":"for-schools","/science":"science-hub","/social":"social-studies-hub","/sp1":"sp1-greetings","/sp10":"sp10-subjunctive","/sp11":"sp11-world-register","/sp12":"sp12-capstone","/sp13":"sp13-five-vowels","/sp14":"sp14-colors-numbers","/sp15":"sp15-el-and-la","/sp16":"sp16-one-and-many","/sp17":"sp17-whole-thought","/sp18":"sp18-soy-estoy","/sp19":"sp19-who-where-when","/sp2":"sp2-numbers-time","/sp20":"sp20-first-then-last","/sp3":"sp3-classroom-nouns","/sp4":"sp4-ser-estar","/sp5":"sp5-present-tense","/sp6":"sp6-tener-gustar","/sp7":"sp7-preterite","/sp8":"sp8-imperfect","/sp9":"sp9-pronouns-commands","/spanish":"spanish-hub","/turnins":"turn-ins","/turntables":"music-decks","/units":"wf-units","/vocab":"vocabulary-science","/waves":"science-waves","/oscilloscope":"science-waves","/wb104":"room-104-workbook","/wb12":"room-12-workbook","/wb18":"room-18-workbook","/wb207":"room-207-workbook","/wb36":"room-36-workbook","/novel12":"room-12-novel","/novel18":"room-18-novel","/novel36":"room-36-novel","/novel104":"room-104-novel","/novel207":"room-207-novel","/dwelling":"the-dwelling","/words":"word-foundry","/worksheets":"AoG-Interior-Worksheets","/b10":"b10-interior-math","/c1":"c1-cut-it-fair","/c10":"c10-stems-and-leaves","/c11":"c11-x-marks-the-number","/c12":"c12-bring-it-down","/c13":"c13-trade-a-ten","/c2":"c2-top-and-bottom","/c3":"c3-more-than-a-whole","/c4":"c4-close-to-what","/c5":"c5-which-is-bigger","/c6":"c6-same-amount-new-name","/c7":"c7-make-it-even","/c8":"c8-the-middle-number","/c9":"c9-the-odd-one-out","/h1":"h1-order-the-story","/h2":"h2-because-of-that","/h3":"h3-whose-voice","/h4":"h4-the-main-idea","/h5":"h5-words-of-a-new-nation","/h6":"h6-map-of-a-growing-nation","/h7":"h7-back-it-up","/h8":"h8-one-person-big-ripple","/v1":"v1-match-the-meaning","/v2":"v2-build-the-word","/v3":"v3-say-it-in-a-sentence","/v4":"v4-picture-it","/v5":"v5-which-one-doesnt-belong","/w1":"w1-identity-audit","/w2":"w2-values-under-pressure","/w3":"w3-choice-agency-map","/w4":"w4-letter-to-my-future-self","/w5":"w5-perfectionism-spectrum","/w6":"w6-rewriting-the-script","/w7":"w7-internal-critic-profile","/ush1":"ush-u1","/ush2":"ush-u2","/ush3":"ush-u3","/ush4":"ush-u4","/ush5":"ush-u5","/ush6":"ush-u6","/ush7":"ush-u7","/ush8":"ush-u8","/ush9":"ush-u9","/ush10":"ush-u10","/sci1":"sci-u1","/sci2":"sci-u2","/sci3":"sci-u3","/sci4":"sci-u4","/sci5":"sci-u5","/sci6":"sci-u6","/sci7":"sci-u7","/sci8":"sci-u8","/sci9":"sci-u9","/sci10":"sci-u10","/sci11":"sci-u11","/sci12":"sci-u12","/sci13":"sci-u13","/sci14":"sci-u14","/sci15":"sci-u15","/sci16":"sci-u16","/sci17":"sci-u17","/sci18":"sci-u18","/sci19":"sci-u19","/sci20":"sci-u20","/sci21":"sci-u21","/sci22":"sci-u22","/sci23":"sci-u23","/sci24":"sci-u24","/sci25":"sci-u25","/sci26":"sci-u26","/sci27":"sci-u27","/sci28":"sci-u28","/ssc1":"ssc-u1","/ssc2":"ssc-u2","/ssc3":"ssc-u3","/ssc4":"ssc-u4","/ssc5":"ssc-u5","/ssc6":"ssc-u6","/ssc7":"ssc-u7","/ssc8":"ssc-u8","/ssc9":"ssc-u9","/ssc10":"ssc-u10","/ssc11":"ssc-u11","/ssc12":"ssc-u12","/ssc13":"ssc-u13","/ssc14":"ssc-u14","/ssc15":"ssc-u15","/ssc16":"ssc-u16","/ssc17":"ssc-u17","/ssc18":"ssc-u18","/ssc19":"ssc-u19","/ssc20":"ssc-u20","/ssc21":"ssc-u21","/ssc22":"ssc-u22","/ssc23":"ssc-u23","/ssc24":"ssc-u24","/ela1":"ela-u1","/ela2":"ela-u2","/ela3":"ela-u3","/ela4":"ela-u4","/ela5":"ela-u5","/ela6":"ela-u6","/ela7":"ela-u7","/ela8":"ela-u8","/ela9":"ela-u9","/ela10":"ela-u10","/ela11":"ela-u11","/ela12":"ela-u12","/ela13":"ela-u13","/ela14":"ela-u14","/ela15":"ela-u15","/ela16":"ela-u16","/ela17":"ela-u17","/ela18":"ela-u18","/ela19":"ela-u19","/ela20":"ela-u20","/ela21":"ela-u21","/ela22":"ela-u22","/ela23":"ela-u23","/ela24":"ela-u24","/mth1":"mth-u1","/mth2":"mth-u2","/mth3":"mth-u3","/mth4":"mth-u4","/mth5":"mth-u5","/mth6":"mth-u6","/mth7":"mth-u7","/mth8":"mth-u8","/mth9":"mth-u9","/mth10":"mth-u10","/mth11":"mth-u11","/mth12":"mth-u12","/mth13":"mth-u13","/mth14":"mth-u14","/mth15":"mth-u15","/mth16":"mth-u16","/mth17":"mth-u17","/mth18":"mth-u18","/mth19":"mth-u19","/mth20":"mth-u20","/mth21":"mth-u21","/mth22":"mth-u22","/mth23":"mth-u23","/mth24":"mth-u24","/mth25":"mth-u25","/mth26":"mth-u26","/mth27":"mth-u27","/eco11":"eco-u11","/eco12":"eco-u12","/eco13":"eco-u13","/eco14":"eco-u14","/eco15":"eco-u15","/eco16":"eco-u16","/eco17":"eco-u17","/eco18":"eco-u18","/religions":"religions-hub","/today":"dashboard","/rel13":"rel-u13","/rel14":"rel-u14","/rel15":"rel-u15","/rel16":"rel-u16","/rel17":"rel-u17","/rel18":"rel-u18","/rel19":"rel-u19","/rel20":"rel-u20","/rel21":"rel-u21","/rel22":"rel-u22","/rel23":"rel-u23","/rel24":"rel-u24","/fcs1":"fcs-u1","/fcs2":"fcs-u2","/fcs3":"fcs-u3","/fcs4":"fcs-u4","/fcs5":"fcs-u5","/fcs6":"fcs-u6","/fcs7":"fcs-u7","/fcs8":"fcs-u8","/fcs9":"fcs-u9","/fcs10":"fcs-u10","/fcs11":"fcs-u11","/fcs12":"fcs-u12","/fcs13":"fcs-u13","/fcs14":"fcs-u14","/fcs15":"fcs-u15","/fcs16":"fcs-u16","/fcs17":"fcs-u17","/fcs18":"fcs-u18","/fcs19":"fcs-u19","/fcs20":"fcs-u20","/spa1":"spa-u1","/spa2":"spa-u2","/spa3":"spa-u3","/spa4":"spa-u4","/spa5":"spa-u5","/spa6":"spa-u6","/spa7":"spa-u7","/spa8":"spa-u8","/spa9":"spa-u9","/spa10":"spa-u10","/spa11":"spa-u11","/spa12":"spa-u12","/spa13":"spa-u13","/spa14":"spa-u14","/spa15":"spa-u15","/spa16":"spa-u16","/spa17":"spa-u17","/spa18":"spa-u18","/spa19":"spa-u19","/spa20":"spa-u20","/cards12":"room-12-cards","/cards18":"room-18-cards","/cards36":"room-36-cards","/cards104":"room-104-cards","/cards207":"room-207-cards","/at-home":"grace-at-home","/bible":"bible-hub","/bib1":"bib-u1","/bib2":"bib-u2","/bib3":"bib-u3","/bib4":"bib-u4","/bib5":"bib-u5","/bib6":"bib-u6","/bib7":"bib-u7","/bib8":"bib-u8","/bib9":"bib-u9","/bib10":"bib-u10","/bib11":"bib-u11","/bib12":"bib-u12","/bib13":"bib-u13","/bib14":"bib-u14","/bib15":"bib-u15","/bib16":"bib-u16","/bib17":"bib-u17","/bib18":"bib-u18","/hebrew-bible":"hebrew-bible-hub","/heb1":"heb-u1","/heb2":"heb-u2","/heb3":"heb-u3","/heb4":"heb-u4","/heb5":"heb-u5","/heb6":"heb-u6","/heb7":"heb-u7","/heb8":"heb-u8","/heb9":"heb-u9","/heb10":"heb-u10","/heb11":"heb-u11","/heb12":"heb-u12","/heb13":"heb-u13","/heb14":"heb-u14","/heb15":"heb-u15","/heb16":"heb-u16","/heb17":"heb-u17","/quran":"quran-hub","/qur1":"qur-u1","/qur2":"qur-u2","/qur3":"qur-u3","/qur4":"qur-u4","/qur5":"qur-u5","/qur6":"qur-u6","/qur7":"qur-u7","/qur8":"qur-u8","/qur9":"qur-u9","/qur10":"qur-u10","/qur11":"qur-u11","/qur12":"qur-u12","/qur13":"qur-u13","/qur14":"qur-u14","/qur15":"qur-u15","/qur16":"qur-u16","/qur17":"qur-u17","/talmud":"talmud-hub","/tal1":"tal-u1","/tal2":"tal-u2","/tal3":"tal-u3","/tal4":"tal-u4","/tal5":"tal-u5","/tal6":"tal-u6","/tal7":"tal-u7","/tal8":"tal-u8","/tal9":"tal-u9","/tal10":"tal-u10","/tal11":"tal-u11","/tal12":"tal-u12","/tal13":"tal-u13","/tal14":"tal-u14","/tal15":"tal-u15","/tal16":"tal-u16","/tal17":"tal-u17","/rel1":"rel-u1","/rel2":"rel-u2","/rel3":"rel-u3","/rel4":"rel-u4","/rel5":"rel-u5","/rel6":"rel-u6","/rel7":"rel-u7","/rel8":"rel-u8","/rel9":"rel-u9","/rel10":"rel-u10","/rel11":"rel-u11","/rel12":"rel-u12","/eco1":"eco-u1","/eco2":"eco-u2","/eco3":"eco-u3","/eco4":"eco-u4","/eco5":"eco-u5","/eco6":"eco-u6","/eco7":"eco-u7","/eco8":"eco-u8","/eco9":"eco-u9","/eco10":"eco-u10","/chinese-classics":"chinese-classics-hub","/chn1":"chn-u1","/chn2":"chn-u2","/chn3":"chn-u3","/chn4":"chn-u4","/chn5":"chn-u5","/chn6":"chn-u6","/chn7":"chn-u7","/chn8":"chn-u8","/chn9":"chn-u9","/chn10":"chn-u10","/chn11":"chn-u11","/chn12":"chn-u12","/chn13":"chn-u13","/chn14":"chn-u14","/chn15":"chn-u15","/chn16":"chn-u16","/chn17":"chn-u17","/hindu-texts":"hindu-texts-hub","/hin1":"hin-u1","/hin2":"hin-u2","/hin3":"hin-u3","/hin4":"hin-u4","/hin5":"hin-u5","/hin6":"hin-u6","/hin7":"hin-u7","/hin8":"hin-u8","/hin9":"hin-u9","/hin10":"hin-u10","/hin11":"hin-u11","/hin12":"hin-u12","/hin13":"hin-u13","/hin14":"hin-u14","/hin15":"hin-u15","/hin16":"hin-u16","/hin17":"hin-u17","/buddhist-texts":"buddhist-texts-hub","/bud1":"bud-u1","/bud2":"bud-u2","/bud3":"bud-u3","/bud4":"bud-u4","/bud5":"bud-u5","/bud6":"bud-u6","/bud7":"bud-u7","/bud8":"bud-u8","/bud9":"bud-u9","/bud10":"bud-u10","/bud11":"bud-u11","/bud12":"bud-u12","/bud13":"bud-u13","/bud14":"bud-u14","/bud15":"bud-u15","/bud16":"bud-u16","/bud17":"bud-u17","/world-cultures":"world-cultures-hub","/wcs1":"wcs-u1","/wcs2":"wcs-u2","/wcs3":"wcs-u3","/wcs4":"wcs-u4","/wcs5":"wcs-u5","/wcs6":"wcs-u6","/wcs7":"wcs-u7","/wcs8":"wcs-u8","/wcs9":"wcs-u9","/wcs10":"wcs-u10","/wcs11":"wcs-u11","/wcs12":"wcs-u12","/wcs13":"wcs-u13","/wcs14":"wcs-u14","/wcs15":"wcs-u15","/wcs16":"wcs-u16","/wcs17":"wcs-u17","/medicine-health":"medicine-health-hub","/med1":"med-u1","/med2":"med-u2","/med3":"med-u3","/med4":"med-u4","/med5":"med-u5","/med6":"med-u6","/med7":"med-u7","/med8":"med-u8","/med9":"med-u9","/med10":"med-u10","/med11":"med-u11","/med12":"med-u12","/med13":"med-u13","/med14":"med-u14","/med15":"med-u15","/med16":"med-u16","/med17":"med-u17"}/*END*/;
  function hubCards() {
    var cards = D.querySelectorAll(".unit.open");
    if (!cards.length) return;
    D.documentElement.classList.add("aog-hub-sketch");
    if (!D.getElementById("aog-hub-sketch-css")) { var hs = D.createElement("style"); hs.id = "aog-hub-sketch-css"; hs.appendChild(D.createTextNode(HCSS)); (D.head || D.documentElement).appendChild(hs); }
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i]; if (c.querySelector(".aog-card-sketch")) continue;
      var a = c.querySelector("a.door"); if (!a) continue;
      var h = (a.getAttribute("href") || "").replace(/[?#].*$/, "");
      var id = SHORT[h] || (h.match(/^\/?([A-Za-z0-9-]+)\.html$/) || [])[1]; if (!id) continue;
      var f = D.createElement("span"); f.className = "aog-card-sketch"; f.setAttribute("aria-hidden", "true");
      var im = D.createElement("img"); im.alt = ""; im.loading = "lazy"; im.decoding = "async"; im.src = "/img/banners/" + id + "-pencil-900.webp";
      im.onerror = (function (fr) { return function () { if (fr.parentNode) fr.parentNode.removeChild(fr); }; })(f);
      f.appendChild(im); c.insertBefore(f, c.firstChild);
    }
  }
  var HCSS = "\nhtml:not([data-theme=\"dark\"]).aog-hub-sketch .unit.open{ background:repeating-linear-gradient(0deg, rgba(29,39,51,.03) 0 1px, transparent 1px 5px), #FBF8F0 !important; box-shadow:0 0 0 1px rgba(42,38,34,.55), 1px 2px 0 -0.5px rgba(42,38,34,.35), 0 10px 22px -16px rgba(0,0,0,.4) !important; }"
    + "\n.aog-card-sketch{ display:block; align-self:stretch; margin:0 0 6px; height:92px; overflow:hidden; border-radius:8px; border:1px solid rgba(42,38,34,.4); }"
    + "\n.aog-card-sketch img{ display:block; width:100%; height:100%; object-fit:cover; object-position:78% 42%; transform:scale(1.75); transform-origin:68% 38%; }"
    + "\n@media print{ .aog-card-sketch{ display:none; } }";
  /* AOG-DRAFTING-TABS + AOG-BLUEPRINT-HOME (2026-09-27) — the "Every day" grade buttons are index-card tabs; the
     home page's navy is a real blueprint (a faint white drafting grid) and each door carries a pencil drawing. */
  var TCSS = "html:not([data-theme=\"dark\"]) .daily a.gr{ background:#FBF8F0 !important; border:1.4px solid rgba(42,38,34,.72) !important; border-bottom-width:3px !important; border-radius:12px 12px 3px 3px !important; box-shadow:1.5px 1.5px 0 -0.4px rgba(42,38,34,.3) !important; color:#1D2733 !important; }"
    + "\nhtml body section#one-framework.aog-of, html body #aog-thresholds#aog-thresholds{ background-image:linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px) !important; background-size:88px 88px, 88px 88px, 22px 22px, 22px 22px !important; }"
    + "\n.aog-door-sketch{ display:block; height:120px; margin:0 0 12px; border-radius:10px; overflow:hidden; border:1px solid rgba(242,201,100,.35); }"
    + "\n.aog-door-sketch img{ display:block; width:100%; height:100%; object-fit:cover; object-position:75% 42%; transform:scale(1.6); transform-origin:68% 40%; }"
    + "\n@media print{ .aog-door-sketch{ display:none; } }";
  /* AOG-SKETCHBOOK-PAGES-V1 (2026-09-27) — Jimmy: the curriculum "read from a sketch book … same with the test
     questions." Lessons, chapter reviews, unit tests, writing tasks and the room quizzes become sketchbook
     pages: a spiral binding across the top and a pencil margin line down the left. The words sit on plain paper,
     in the same clear font and dark ink; nothing behind them, nothing moves. Light theme only. */
  var PAGES = ".les, section.review, section.wrap-up, section.write, .qstage";
  TCSS += "\nhtml:not([data-theme=\"dark\"]) :is(" + PAGES + "){ padding-top:34px !important; padding-left:36px !important;"
    + " background-image:radial-gradient(circle at 11px 9px, rgba(29,39,51,.6) 0 2.4px, transparent 2.9px), radial-gradient(ellipse 5px 8px at 11px 7px, transparent 0 3px, #8C939B 3.2px 4.4px, transparent 4.6px), linear-gradient(90deg, transparent 22px, rgba(184,69,70,.42) 22px 23.5px, transparent 23.5px) !important;"
    + " background-size:22px 18px, 22px 18px, 100% 100% !important; background-repeat:repeat-x, repeat-x, no-repeat !important; background-position:12px 4px, 12px 4px, 0 0 !important; }"
    + "\n@media (max-width:720px){ html:not([data-theme=\"dark\"]) :is(" + PAGES + "){ padding-left:30px !important; background-image:radial-gradient(circle at 11px 9px, rgba(29,39,51,.6) 0 2.4px, transparent 2.9px), radial-gradient(ellipse 5px 8px at 11px 7px, transparent 0 3px, #8C939B 3.2px 4.4px, transparent 4.6px), linear-gradient(90deg, transparent 18px, rgba(184,69,70,.42) 18px 19.5px, transparent 19.5px) !important; } }"
    + "\n@media print{ :is(" + PAGES + "){ background-image:none !important; } }";
  function tabsHome() {
    if (!D.getElementById("aog-tabs-css")) { var ts = D.createElement("style"); ts.id = "aog-tabs-css"; ts.appendChild(D.createTextNode(TCSS)); (D.head || D.documentElement).appendChild(ts); }
    var doors = D.querySelectorAll(".aogdr-door");
    for (var i = 0; i < doors.length; i++) {
      var d = doors[i]; if (d.querySelector(".aog-door-sketch")) continue;
      var t = d.textContent || "", id = /Atrium/.test(t) ? "page-door-atrium" : /Front Porch|Porche/.test(t) ? "page-door-porch" : /Religions|Religiones/.test(t) ? "page-door-faith" : "";
      if (!id) continue;
      var f = D.createElement("span"); f.className = "aog-door-sketch"; f.setAttribute("aria-hidden", "true");
      var im = D.createElement("img"); im.alt = ""; im.loading = "lazy"; im.src = "/img/banners/" + id + "-pencil-900.webp";
      im.onerror = (function (fr) { return function () { if (fr.parentNode) fr.parentNode.removeChild(fr); }; })(f);
      f.appendChild(im); d.insertBefore(f, d.firstChild);
    }
  }
  /* any page can ask for a pencil drawing by id: <div data-aog-sketch-id="proj-3"></div> (FACS projects, …) */
  function sketchSlots() {
    var n = D.querySelectorAll("[data-aog-sketch-id]:not([data-sk-done])");
    for (var i = 0; i < n.length; i++) {
      var el = n[i]; el.setAttribute("data-sk-done", "1");
      var im = D.createElement("img"); im.alt = ""; im.loading = "lazy"; im.className = "aog-slot-sketch";
      im.src = "/img/banners/" + el.getAttribute("data-aog-sketch-id") + "-pencil-900.webp";
      im.onerror = (function (e) { return function () { e.style.display = "none"; }; })(el);
      el.appendChild(im);
    }
  }
  TCSS += "\n.aog-slot-sketch{ display:block; width:100%; height:150px; object-fit:cover; object-position:75% 42%; border-radius:10px; border:1px solid rgba(42,38,34,.35); }";
  function mastBoot() { tabsHome(); hubCards(); sketchSlots();
    var pg = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    if (/^(slip)$/.test(pg)) return;   /* instruments and tools keep their own faces */
    if (PAGE[pg]) { mast(PAGE[pg]); return; }
    var tries = 0;
    (function wait() {
      var m = window.AOG_ROOM_MAP, it = m && m[pg];
      if (it && it.unit && /^[a-z]{2,5}-u\d+$/.test(it.unit)) { mast(it.unit); return; }
      if (!m && ++tries < 20) setTimeout(wait, 300);
    })();
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mastBoot); else mastBoot();
  /* AOG-ONE-PAINT-V1 — show the page once, when it is built: after the fonts (or 0.8 s), two frames later */
  (function () {
    var done = false; function show() { if (done) return; done = true; D.documentElement.classList.add("aog-ready"); }
    var go = function () { requestAnimationFrame(function () { requestAnimationFrame(show); }); };
    try { Promise.race([D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve(), new Promise(function (r) { setTimeout(r, 800); })]).then(go, go); } catch (e) { show(); }
    setTimeout(show, 1000);
  })();
})();