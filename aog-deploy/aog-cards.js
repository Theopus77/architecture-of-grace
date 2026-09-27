/* ════════════════════════════════════════════════════════════════════════════
   ARCHITECTURE OF GRACE — STUDY CARDS, MADE PHYSICAL.  ONE FILE, 192 PAGES.

       <script src="/aog-cards.js" defer></script>      (inserted by
       _work/cards/inject_cards.py, right before </body>)

   The lesson pages paint their Study Cards with paintCards(): a flat
   <article class="bc"> per card, one shown at a time by the page's own
   pager. This file watches #cardHost and, every time the page repaints,
   rebuilds each .bc IN PLACE into a real card: card stock with a paper grain,
   a folded tier ribbon, a dog-ear, a deck of ghost cards behind it, and a
   3D flip that shows the answer on the back.

   ── WHAT THIS FILE NEVER DOES ───────────────────────────────────────────────
   ⚠ It does not own the answer. The page's own click handler on .reveal
     toggles .ans[hidden], flips aria-expanded and records d.cardsSeen.
     We MOVE the page's original elements (never clone them) into the two
     faces, so the page's querySelector('[data-ans=ix]') still finds them,
     and we mirror aria-expanded → the flipped state with a MutationObserver.
     A tap anywhere on the card simply clicks that .reveal button.
   ⚠ It does not own the pager. ArrowLeft/Right and swipes CLICK #cPrev and
     #cNext; the dealt-card motion is a throwaway clone that slides off while
     the page swaps data-off underneath it.
   ⚠ It does not translate. The page's paintLang() walks every [data-en] and
     sets textContent — so every span we add with data-en/data-es is a LEAF
     (text only). paintLang then calls paintCards(), which repaints the host,
     and the observer rebuilds the cards in the new language.
   ⚠ Print is the page's business: it hides .reveal and .ans (student packet)
     and shows every card. On paper we flatten the 3D, stack the faces and
     hide cues, dots, deck and the listen button. Nothing of the page's is
     hidden by us.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.__aogCards) return;
  var D = document;
  var host = D.getElementById("cardHost");
  if (!host) return;
  window.__aogCards = 1;

  var CSS = [
"/* ══ AOG STUDY CARDS ══ injected by aog-cards.js. Scoped to #cardHost / .aogc-*. */",
":root{",
"  --aogc-stock:#FBF8F1; --aogc-stock-hi:#FFFFFF; --aogc-stock-lo:#F1ECE1;",
"  --aogc-edge:rgba(29,39,51,.14); --aogc-grain:rgba(29,39,51,.028); --aogc-grain-2:rgba(255,255,255,.55);",
"  --aogc-ghost:#F3EFE6; --aogc-ghost-edge:rgba(29,39,51,.12);",
"  --aogc-ear:#E7E1D4; --aogc-ear-hi:#FFFFFF;",
"  --aogc-shadow:0 1px 1px rgba(29,39,51,.06), 0 6px 10px -4px rgba(29,39,51,.18), 0 22px 36px -18px rgba(29,39,51,.42);",
"  --aogc-shadow-up:0 2px 2px rgba(29,39,51,.06), 0 12px 18px -6px rgba(29,39,51,.2), 0 40px 56px -22px rgba(29,39,51,.5);",
"  --aogc-ribbon-ink:#fff;",
"}",
":root[data-theme=\"dark\"]{",
"  --aogc-stock:#242C37; --aogc-stock-hi:#2B3441; --aogc-stock-lo:#1F262F;",
"  --aogc-edge:rgba(233,238,244,.12); --aogc-grain:rgba(0,0,0,.06); --aogc-grain-2:rgba(255,255,255,.035);",
"  --aogc-ghost:#1B2129; --aogc-ghost-edge:rgba(233,238,244,.1);",
"  --aogc-ear:#171D25; --aogc-ear-hi:#39434F;",
"  --aogc-shadow:0 1px 1px rgba(0,0,0,.3), 0 8px 12px -4px rgba(0,0,0,.45), 0 26px 40px -18px rgba(0,0,0,.9);",
"  --aogc-shadow-up:0 2px 2px rgba(0,0,0,.3), 0 14px 20px -6px rgba(0,0,0,.5), 0 44px 60px -22px rgba(0,0,0,.95);",
"  --aogc-ribbon-ink:#12161C;",
"}",
"@media (prefers-color-scheme: dark){ :root:not([data-theme=\"light\"]){",
"  --aogc-stock:#242C37; --aogc-stock-hi:#2B3441; --aogc-stock-lo:#1F262F;",
"  --aogc-edge:rgba(233,238,244,.12); --aogc-grain:rgba(0,0,0,.06); --aogc-grain-2:rgba(255,255,255,.035);",
"  --aogc-ghost:#1B2129; --aogc-ghost-edge:rgba(233,238,244,.1);",
"  --aogc-ear:#171D25; --aogc-ear-hi:#39434F;",
"  --aogc-shadow:0 1px 1px rgba(0,0,0,.3), 0 8px 12px -4px rgba(0,0,0,.45), 0 26px 40px -18px rgba(0,0,0,.9);",
"  --aogc-shadow-up:0 2px 2px rgba(0,0,0,.3), 0 14px 20px -6px rgba(0,0,0,.5), 0 44px 60px -22px rgba(0,0,0,.95);",
"  --aogc-ribbon-ink:#12161C;",
"} }",
"",
"/* the table: the host holds the deck. Two ghost cards sit behind the live one. */",
"#cardHost.aogc-host{ position:relative; isolation:isolate; padding:0 0 22px; margin-top:6px; }",
"#cardHost.aogc-host::before, #cardHost.aogc-host::after{",
"  content:\"\"; position:absolute; left:0; right:0; top:0; bottom:22px; z-index:0; border-radius:18px;",
"  background:linear-gradient(180deg, var(--aogc-stock), var(--aogc-ghost));",
"  box-shadow:inset 0 0 0 1px var(--aogc-ghost-edge), inset 0 -1px 0 rgba(255,255,255,.4), 0 1px 1px rgba(29,39,51,.08), 0 2px 0 var(--aogc-ghost-edge), 0 12px 20px -12px rgba(29,39,51,.4);",
"  pointer-events:none;",
"}",
"#cardHost.aogc-host::before{ transform:translateY(18px) scale(.955) rotate(-.6deg); }",
"#cardHost.aogc-host::after{ transform:translateY(9px) scale(.978) rotate(.35deg); }",
"#cardHost.aogc-host.aogc-lone::before{ display:none; }",
"",
"/* the card itself: the page's .bc, stripped to a scene */",
"#cardHost > .bc.aogc-card, #cardHost > .bc.aogc-card[data-t], #cardHost > .aogc-deal{",
"  background:transparent; border:0; padding:0; box-shadow:none; border-radius:18px;",
"  position:relative; z-index:1; perspective:1600px; -webkit-perspective:1600px;",
"  cursor:pointer; -webkit-tap-highlight-color:transparent; outline-offset:6px;",
"}",
"#cardHost > .bc.aogc-card:focus-visible{ outline:3px solid var(--focus); }",
"#cardHost > .bc.aogc-card:focus:not(:focus-visible){ outline:none; }",
"/* the shadow lives on the table, not on the card, so it stays put while the card turns */",
".aogc-shadow{ position:absolute; left:6px; right:6px; top:8px; bottom:2px; border-radius:16px; z-index:0;",
"  box-shadow:var(--aogc-shadow); transition:box-shadow .32s ease, transform .32s ease; pointer-events:none; }",
".aogc-card:hover .aogc-shadow, .aogc-card:focus-visible .aogc-shadow{ box-shadow:var(--aogc-shadow-up); transform:translateY(3px); }",
".aogc-inner{ position:relative; z-index:1; display:grid; transform-style:preserve-3d; -webkit-transform-style:preserve-3d;",
"  transform:translateY(0) rotateY(0deg); transition:transform .48s cubic-bezier(.22,.8,.26,1); will-change:transform; }",
".aogc-card:hover .aogc-inner, .aogc-card:focus-visible .aogc-inner{ transform:translateY(-3px) rotateY(0deg); }",
".aogc-card.is-flipped .aogc-inner, .aogc-card.is-flipped:hover .aogc-inner, .aogc-card.is-flipped:focus-visible .aogc-inner{ transform:translateY(0) rotateY(180deg); }",
".aogc-card.is-flipped:hover .aogc-inner, .aogc-card.is-flipped:focus-visible .aogc-inner{ transform:translateY(-3px) rotateY(180deg); }",
"@keyframes aogc-lift{ 0%{transform:translateY(0)} 45%{transform:translateY(-14px)} 100%{transform:translateY(0)} }",
".aogc-card.is-turning{ animation:aogc-lift .48s cubic-bezier(.22,.8,.26,1); }",
"",
"/* card stock: paper grain out of gradients, a soft inner edge, real corners */",
".aogc-face{",
"  grid-area:1/1; min-height:340px; border-radius:18px; padding:26px 26px 22px;",
"  display:flex; flex-direction:column; position:relative; overflow:hidden;",
"  -webkit-backface-visibility:hidden; backface-visibility:hidden;",
"  color:var(--ink);",
"  background:",
"    radial-gradient(140% 90% at 12% -10%, var(--aogc-grain-2) 0%, rgba(255,255,255,0) 58%),",
"    repeating-linear-gradient(0deg, var(--aogc-grain) 0 1px, rgba(0,0,0,0) 1px 3px),",
"    repeating-linear-gradient(90deg, var(--aogc-grain) 0 1px, rgba(0,0,0,0) 1px 5px),",
"    linear-gradient(180deg, var(--aogc-stock-hi) 0%, var(--aogc-stock) 55%, var(--aogc-stock-lo) 100%);",
"  box-shadow:inset 0 0 0 1px var(--aogc-edge), inset 0 1px 0 rgba(255,255,255,.55), inset 0 -1px 0 rgba(0,0,0,.05), inset 0 0 28px rgba(29,39,51,.035);",
"}",
":root[data-theme=\"dark\"] .aogc-face{ box-shadow:inset 0 0 0 1px var(--aogc-edge), inset 0 1px 0 rgba(255,255,255,.06), inset 0 -1px 0 rgba(0,0,0,.4), inset 0 0 28px rgba(0,0,0,.25); }",
"@media (prefers-color-scheme: dark){ :root:not([data-theme=\"light\"]) .aogc-face{ box-shadow:inset 0 0 0 1px var(--aogc-edge), inset 0 1px 0 rgba(255,255,255,.06), inset 0 -1px 0 rgba(0,0,0,.4), inset 0 0 28px rgba(0,0,0,.25); } }",
".aogc-face.back{ transform:rotateY(180deg); justify-content:center; }",
"/* the dog-ear: a corner turned up at the bottom right */",
".aogc-face::after{",
"  content:\"\"; position:absolute; right:0; bottom:0; width:26px; height:26px;",
"  background:linear-gradient(to top left, var(--ground) 0 50%, var(--aogc-ear) 50%, var(--aogc-ear-hi) 100%);",
"  box-shadow:-2px -2px 4px -1px rgba(29,39,51,.18); border-top-left-radius:4px; pointer-events:none;",
"}",
":root[data-theme=\"dark\"] .aogc-face::after{ box-shadow:-2px -2px 4px -1px rgba(0,0,0,.55); }",
"@media (prefers-color-scheme: dark){ :root:not([data-theme=\"light\"]) .aogc-face::after{ box-shadow:-2px -2px 4px -1px rgba(0,0,0,.55); } }",
"",
"/* the tier ribbon: folded over the top-left corner */",
".aogc-corner{ position:absolute; top:0; left:0; width:118px; height:118px; overflow:hidden; border-top-left-radius:18px; pointer-events:none; z-index:2; }",
".aogc-ribbon{",
"  position:absolute; top:28px; left:-46px; width:186px; padding:5px 0 6px; transform:rotate(-45deg);",
"  text-align:center; font-size:10.5px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; line-height:1;",
"  color:var(--aogc-ribbon-ink); background:var(--aogc-tier); ",
"  background-image:linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0) 55%, rgba(0,0,0,.12));",
"  box-shadow:0 1px 0 rgba(255,255,255,.18) inset, 0 -1px 0 rgba(0,0,0,.18) inset, 0 3px 6px -2px rgba(0,0,0,.35);",
"}",
".aogc-ribbon span{ display:inline-block; }",
".aogc-card[data-t=\"1\"]{ --aogc-tier:var(--t1); --aogc-tier-wash:var(--t1-wash); }",
".aogc-card[data-t=\"2\"]{ --aogc-tier:var(--t2); --aogc-tier-wash:var(--t2-wash); }",
".aogc-card[data-t=\"3\"]{ --aogc-tier:var(--t3); --aogc-tier-wash:var(--t3-wash); }",
"",
"/* front face */",
"#cardHost .aogc-card .em{ font-size:3rem; line-height:1; text-align:center; margin:10px 0 12px; filter:drop-shadow(0 2px 2px rgba(29,39,51,.18)); }",
"#cardHost .aogc-card h3{ text-align:center; font-size:1.34rem; letter-spacing:-.01em; margin:0 0 .35em; line-height:1.18; }",
"#cardHost .aogc-card .def{ text-align:center; font-size:1.02rem; color:var(--ink); margin:0 auto .9em; max-width:46ch; line-height:1.5; }",
"#cardHost .aogc-card .fr{",
"  margin:auto 0 0; padding:12px 14px 12px 16px; font-size:.95rem; line-height:1.45; color:var(--ink-soft);",
"  background:var(--aogc-tier-wash); border-radius:10px; border-left:3px solid var(--aogc-tier);",
"  box-shadow:inset 0 1px 0 rgba(255,255,255,.35);",
"}",
".aogc-controls{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:14px; }",
"#cardHost .aogc-card .reveal{",
"  display:inline-flex; align-items:center; justify-content:center; flex:1 1 auto; margin:0; min-height:48px; width:auto;",
"  padding:10px 22px; border:1px solid var(--aogc-tier); border-radius:999px; cursor:pointer; font-weight:700; font-size:.98rem;",
"  color:var(--aogc-ribbon-ink); background:var(--aogc-tier);",
"  background-image:linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,0) 50%, rgba(0,0,0,.1));",
"  box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 3px 0 rgba(0,0,0,.22), 0 6px 12px -6px rgba(0,0,0,.4);",
"  transition:transform .12s ease, box-shadow .12s ease;",
"}",
"#cardHost .aogc-card .reveal:active{ transform:translateY(2px); box-shadow:inset 0 1px 0 rgba(255,255,255,.2), 0 1px 0 rgba(0,0,0,.22), 0 3px 6px -5px rgba(0,0,0,.4); }",
".aogc-cue{ text-align:center; font-size:.78rem; color:var(--ink-faint); letter-spacing:.04em; margin:12px 0 0; }",
".aogc-cue::before{ content:\"↻\"; margin-right:.4em; }",
".aogc-say{",
"  flex:none; width:48px; height:48px; border-radius:999px; border:1px solid var(--rule); background:var(--field);",
"  background-image:linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0));",
"  box-shadow:inset 0 1px 0 rgba(255,255,255,.6), 0 2px 0 rgba(29,39,51,.12), 0 4px 8px -4px rgba(29,39,51,.3);",
"  cursor:pointer; font-size:1.2rem; line-height:1; display:inline-grid; place-items:center; padding:0; color:var(--ink);",
"  transition:transform .12s ease, box-shadow .12s ease;",
"}",
".aogc-say:active, .aogc-say.is-on{ transform:translateY(1px); box-shadow:inset 0 1px 2px rgba(29,39,51,.25), 0 1px 0 rgba(29,39,51,.12); }",
".aogc-say.is-on{ border-color:var(--aogc-tier); color:var(--aogc-tier); }",
".aogc-say .aogc-vh{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }",
"",
"/* back face */",
".aogc-echo{ text-align:center; font-size:.9rem; color:var(--ink-faint); margin:0 0 14px; font-weight:600; }",
".aogc-alab{ font-size:.72rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--aogc-tier); text-align:center; margin:0 0 10px; }",
".aogc-alab::before, .aogc-alab::after{ content:\"\"; display:inline-block; vertical-align:middle; width:28px; height:1px; background:var(--aogc-tier); opacity:.5; margin:0 10px; }",
"#cardHost .aogc-card .ans{",
"  margin:0; padding:0; background:none; border-radius:0; text-align:center;",
"  color:var(--ink); font-weight:700; font-size:1.28rem; line-height:1.35; max-width:44ch; align-self:center;",
"}",
"#cardHost .aogc-card .bang{",
"  margin:18px 0 0; padding:12px 14px; border-top:0; border-radius:10px; font-size:.95rem; font-weight:700; line-height:1.45;",
"  background:var(--good-wash); color:var(--good); border-left:3px solid var(--good); text-align:left;",
"}",
".aogc-face.back .aogc-cue{ margin-top:16px; }",
"",
"/* the dealt card: a throwaway clone that slides off the deck */",
".aogc-deal{ position:absolute; left:0; top:0; width:100%; z-index:3; pointer-events:none; cursor:default; }",
"@keyframes aogc-deal-l{ to{ transform:translateX(-64%) rotate(-7deg); opacity:0 } }",
"@keyframes aogc-deal-r{ to{ transform:translateX(64%) rotate(7deg); opacity:0 } }",
".aogc-deal.to-l{ animation:aogc-deal-l .22s cubic-bezier(.4,0,.8,.6) forwards; }",
".aogc-deal.to-r{ animation:aogc-deal-r .22s cubic-bezier(.4,0,.8,.6) forwards; }",
"@keyframes aogc-land{ from{ transform:translateY(10px) scale(.965); opacity:.4 } to{ transform:translateY(0) scale(1); opacity:1 } }",
".aogc-card.is-landing .aogc-inner{ animation:aogc-land .22s ease-out; }",
"",
"/* progress dots */",
".aogc-dots{ display:flex; flex-wrap:wrap; align-items:center; gap:7px; max-width:640px; margin:2px 0 10px; padding:0 2px; }",
".aogc-dots[hidden]{ display:none; }",
".aogc-dot{ width:9px; height:9px; border-radius:999px; background:var(--field); box-shadow:inset 0 0 0 1.5px var(--rule); transition:transform .2s ease, background .2s ease; }",
".aogc-dot.seen{ background:var(--good); box-shadow:inset 0 0 0 1.5px var(--good); }",
".aogc-dot.now{ transform:scale(1.5); box-shadow:inset 0 0 0 1.5px var(--ink-soft), 0 0 0 3px var(--field); }",
".aogc-dot.now.seen{ box-shadow:inset 0 0 0 1.5px var(--good), 0 0 0 3px var(--field); }",
".aogc-dots .aogc-tally{ margin-left:auto; font-size:.8rem; color:var(--ink-faint); font-weight:700; font-variant-numeric:tabular-nums; white-space:nowrap; }",
"",
"@media (max-width:480px){",
"  .aogc-face{ padding:22px 18px 18px; min-height:320px; }",
"  #cardHost .aogc-card .em{ font-size:2.6rem; }",
"  #cardHost .aogc-card h3{ font-size:1.2rem; }",
"  #cardHost .aogc-card .ans{ font-size:1.14rem; }",
"  .aogc-corner{ width:104px; height:104px; }",
"  .aogc-ribbon{ top:24px; left:-48px; font-size:9.5px; }",
"}",
"",
"@media (prefers-reduced-motion: reduce){",
"  .aogc-inner, .aogc-shadow, .aogc-say, #cardHost .aogc-card .reveal{ transition:none; }",
"  .aogc-card.is-turning, .aogc-card.is-landing .aogc-inner, .aogc-deal{ animation:none; }",
"  .aogc-deal{ display:none; }",
"  .aogc-inner, .aogc-card.is-flipped .aogc-inner, .aogc-card:hover .aogc-inner, .aogc-card.is-flipped:hover .aogc-inner{ transform:none; }",
"  .aogc-face, .aogc-face.back{ transform:none; -webkit-backface-visibility:visible; backface-visibility:visible; transition:opacity .2s ease, visibility .2s; }",
"  .aogc-face.back{ opacity:0; visibility:hidden; }",
"  .aogc-card.is-flipped .aogc-face.front{ opacity:0; visibility:hidden; }",
"  .aogc-card.is-flipped .aogc-face.back{ opacity:1; visibility:visible; }",
"}",
"",
"@media print{",
"  #cardHost.aogc-host{ padding:0; margin:0; }",
"  #cardHost.aogc-host::before, #cardHost.aogc-host::after, .aogc-shadow, .aogc-cue, .aogc-say, .aogc-dots, .aogc-deal, .aogc-alab, .aogc-echo, .aogc-controls{ display:none !important; }",
"  #cardHost > .bc.aogc-card{ perspective:none; border:1px solid #999; border-radius:8px; padding:12px 14px; margin:0 0 12px; background:#fff; }",
"  .aogc-inner{ display:block; transform:none !important; animation:none; }",
"  .aogc-face, .aogc-face.back{ display:block; transform:none; min-height:0; padding:0; background:none; box-shadow:none; opacity:1; visibility:visible; overflow:visible; -webkit-backface-visibility:visible; backface-visibility:visible; }",
"  .aogc-face::after{ display:none; }",
"  .aogc-corner{ position:static; width:auto; height:auto; overflow:visible; }",
"  .aogc-ribbon{ position:static; transform:none; width:auto; display:inline-block; padding:2px 8px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }",
"  #cardHost .aogc-card .em{ text-align:left; font-size:1.5rem; margin:6px 0 4px; filter:none; }",
"  #cardHost .aogc-card h3, #cardHost .aogc-card .def{ text-align:left; margin-left:0; max-width:none; }",
"  #cardHost .aogc-card .ans{ text-align:left; font-size:1rem; }",
"}"
  ].join("\n");

  /* AOG-SKETCH-PAD-V1 — the pencil look for the cards lives in aog-sketch.js */
  if (!D.getElementById("aog-sketch-js")) { var sk = D.createElement("script"); sk.id = "aog-sketch-js"; sk.src = "/aog-sketch.js"; sk.defer = true; (D.head || D.documentElement).appendChild(sk); }
  var st = D.createElement("style");
  st.id = "aog-cards-css";
  st.appendChild(D.createTextNode(CSS));
  (D.head || D.documentElement).appendChild(st);

  /* ── helpers ──────────────────────────────────────────────────────────── */
  var TIER = { "1": ["Foundation", "Base"], "2": ["On-Level", "Nivel"], "3": ["Challenge", "Reto"] };
  function isEs() { return (D.documentElement.getAttribute("lang") || "").slice(0, 2) === "es"; }
  function el(tag, cls) { var e = D.createElement(tag); if (cls) e.className = cls; return e; }
  function leaf(tag, cls, en, es) {
    var e = el(tag, cls);
    e.setAttribute("data-en", en); e.setAttribute("data-es", es);
    e.textContent = isEs() ? es : en;
    return e;
  }
  function q(sel, root) { return (root || D).querySelector(sel); }
  function reduced() {
    try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }
  function pager(id) { return D.getElementById(id); }
  function visible(e) { return !!(e && e.offsetParent !== null); }

  /* ── build one card in place ──────────────────────────────────────────── */
  function upgrade(bc) {
    if (bc.className.indexOf("aogc-card") > -1) return;
    var em = q(".em", bc), h3 = q("h3", bc), def = q(".def", bc), fr = q(".fr", bc),
        rev = q(".reveal", bc), ans = q(".ans", bc), bang = q(".bang", bc);
    if (!rev || !ans) return; /* not a study card we know */

    var t = bc.getAttribute("data-t") || "1", names = TIER[t] || TIER["1"];
    var shadow = el("div", "aogc-shadow");
    var inner = el("div", "aogc-inner");
    var front = el("div", "aogc-face front");
    var back  = el("div", "aogc-face back");

    /* ribbon */
    var corner = el("div", "aogc-corner");
    var ribbon = el("div", "aogc-ribbon");
    ribbon.appendChild(leaf("span", "", names[0], names[1]));
    corner.appendChild(ribbon);
    front.appendChild(corner);

    /* front: the page's own elements, moved */
    if (em) front.appendChild(em);
    if (h3) front.appendChild(h3);
    if (def) front.appendChild(def);
    if (fr) front.appendChild(fr);
    var controls = el("div", "aogc-controls");
    controls.appendChild(rev);
    if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
      var say = el("button", "aogc-say");
      say.type = "button";
      var ico = el("span", ""); ico.setAttribute("aria-hidden", "true"); ico.textContent = "🔊";
      say.appendChild(ico);
      say.appendChild(leaf("span", "aogc-vh", "Listen", "Escuchar"));
      say.addEventListener("click", function (ev) {
        ev.stopPropagation(); ev.preventDefault();
        speak(say, (h3 ? h3.textContent : "") + ". " + (def ? def.textContent : ""));
      });
      controls.appendChild(say);
    }
    front.appendChild(controls);
    front.appendChild(leaf("p", "aogc-cue", "Tap the card to flip it", "Toca la tarjeta para voltearla"));

    /* back */
    if (h3) { var echo = el("p", "aogc-echo"); echo.textContent = (em ? em.textContent + "  " : "") + h3.textContent; back.appendChild(echo); }
    back.appendChild(leaf("p", "aogc-alab", "Answer", "Respuesta"));
    back.appendChild(ans);
    if (bang) back.appendChild(bang);
    back.appendChild(leaf("p", "aogc-cue", "Tap to flip back", "Toca para volver"));

    inner.appendChild(front);
    inner.appendChild(back);
    /* anything else the page put in the card stays on the front, after the controls */
    while (bc.firstChild) front.insertBefore(bc.firstChild, controls);
    bc.appendChild(shadow);
    bc.appendChild(inner);

    bc.className += " aogc-card";
    bc.setAttribute("tabindex", "0");
    bc.setAttribute("role", "button");
    bc.setAttribute("aria-label", (h3 ? h3.textContent : "") + (isEs() ? " — tarjeta de estudio, voltear" : " — study card, flip"));
    syncFlip(bc, false);
  }

  function syncFlip(bc, animate) {
    var rev = q(".reveal", bc);
    var on = rev && rev.getAttribute("aria-expanded") === "true";
    var was = bc.className.indexOf("is-flipped") > -1;
    if (on && !was) bc.className += " is-flipped";
    else if (!on && was) bc.className = bc.className.replace(/\s*\bis-flipped\b/, "");
    if (on) bc.setAttribute("data-aogc-seen", "1");
    if (animate && on !== was && !reduced()) {
      bc.className = bc.className.replace(/\s*\bis-turning\b/, "") + " is-turning";
      setTimeout(function () { bc.className = bc.className.replace(/\s*\bis-turning\b/, ""); }, 500);
    }
    bc.setAttribute("aria-pressed", on ? "true" : "false");
  }

  /* ── speech ───────────────────────────────────────────────────────────── */
  var speaking = null;
  function speak(btn, text) {
    var S = window.speechSynthesis;
    try {
      if (speaking === btn) { S.cancel(); speaking = null; btn.className = btn.className.replace(/\s*\bis-on\b/, ""); return; }
      S.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = isEs() ? "es-ES" : "en-US";
      u.rate = 0.95;
      u.onend = u.onerror = function () { speaking = null; btn.className = btn.className.replace(/\s*\bis-on\b/, ""); };
      speaking = btn; btn.className += " is-on";
      S.speak(u);
    } catch (e) { speaking = null; }
  }

  /* ── progress dots ────────────────────────────────────────────────────── */
  var dots = el("div", "aogc-dots");
  dots.setAttribute("aria-hidden", "true");
  var pg = D.getElementById("cardPager");
  if (pg && pg.parentNode) pg.parentNode.insertBefore(dots, pg.nextSibling);
  else host.parentNode.insertBefore(dots, host.nextSibling);

  function paintDots() {
    var cards = host.querySelectorAll(":scope > .bc.aogc-card");
    var n = cards.length, seen = 0, html = "";
    if (!n) { dots.hidden = true; return; }
    dots.hidden = false;
    while (dots.firstChild) dots.removeChild(dots.firstChild);
    for (var i = 0; i < n; i++) {
      var c = cards[i], rev = q(".reveal", c), ans = q(".ans", c);
      var isSeen = c.getAttribute("data-aogc-seen") === "1" || (rev && rev.getAttribute("aria-expanded") === "true") || (ans && !ans.hidden);
      if (isSeen) seen++;
      var d = el("span", "aogc-dot" + (isSeen ? " seen" : "") + (c.getAttribute("data-off") !== "1" ? " now" : ""));
      dots.appendChild(d);
    }
    var tally = el("span", "aogc-tally");
    tally.appendChild(leaf("span", "", "Studied", "Estudiadas"));
    tally.appendChild(D.createTextNode(" " + seen + " / " + n));
    dots.appendChild(tally);
    host.className = host.className.replace(/\s*\baogc-lone\b/, "") + (n < 2 ? " aogc-lone" : "");
  }

  /* ── observe the host: repaints, aria-expanded, data-off ──────────────── */
  var pending = false;
  function upgradeAll() {
    pending = false;
    var list = host.querySelectorAll(":scope > .bc"), i;
    for (i = 0; i < list.length; i++) upgrade(list[i]);
    paintDots();
  }
  var mo = new MutationObserver(function (recs) {
    var repaint = false, r, i;
    for (i = 0; i < recs.length; i++) {
      r = recs[i];
      if (r.type === "childList" && r.target === host) repaint = true;
      else if (r.type === "attributes") {
        if (r.attributeName === "aria-expanded" && r.target.className.indexOf("reveal") > -1) {
          var bc = r.target; while (bc && bc !== host && bc.className.indexOf("aogc-card") < 0) bc = bc.parentNode;
          if (bc && bc !== host) { syncFlip(bc, true); paintDots(); }
        } else if (r.attributeName === "data-off") { paintDots(); }
      }
    }
    if (repaint && !pending) { pending = true; setTimeout(upgradeAll, 0); }
  });
  mo.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-expanded", "data-off"] });
  if (host.className.indexOf("aogc-host") < 0) host.className += " aogc-host";
  upgradeAll();

  /* ── input: tap, keys, swipe ──────────────────────────────────────────── */
  function cardOf(node) {
    while (node && node !== host) { if (node.className && String(node.className).indexOf("aogc-card") > -1) return node; node = node.parentNode; }
    return null;
  }
  function flip(bc) { var rev = q(".reveal", bc); if (rev) rev.click(); }

  host.addEventListener("click", function (ev) {
    var tgt = ev.target;
    if (tgt.closest && tgt.closest(".reveal, .aogc-say, a, input, textarea, select")) return; /* the page's own handler takes .reveal */
    var bc = cardOf(tgt);
    if (!bc || bc.className.indexOf("aogc-deal") > -1) return;
    if (swiped) { swiped = false; return; }
    flip(bc);
  });

  D.addEventListener("keydown", function (ev) {
    var t = ev.target, tag = t && t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (!visible(host)) return;
    var k = ev.key;
    if (k === "ArrowLeft" || k === "ArrowRight") {
      var b = pager(k === "ArrowLeft" ? "cPrev" : "cNext");
      if (b && !b.disabled && visible(b)) { ev.preventDefault(); b.click(); }
      return;
    }
    var bc = cardOf(t);
    if (bc && (k === " " || k === "Enter" || k === "Spacebar")) { ev.preventDefault(); flip(bc); }
  });

  var tx = 0, ty = 0, tOn = false, swiped = false;
  host.addEventListener("touchstart", function (ev) {
    if (!ev.touches || ev.touches.length !== 1) { tOn = false; return; }
    tx = ev.touches[0].clientX; ty = ev.touches[0].clientY; tOn = true; swiped = false;
  }, { passive: true });
  host.addEventListener("touchend", function (ev) {
    if (!tOn) return; tOn = false;
    var c = ev.changedTouches && ev.changedTouches[0]; if (!c) return;
    var dx = c.clientX - tx, dy = c.clientY - ty;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      var b = pager(dx < 0 ? "cNext" : "cPrev");
      swiped = true; setTimeout(function () { swiped = false; }, 400);
      if (b && !b.disabled) b.click();
    }
  }, { passive: true });

  /* ── the deal: capture the outgoing card before the page swaps data-off ── */
  function deal(dir) {
    if (reduced()) return;
    var cur = host.querySelector(':scope > .bc.aogc-card:not([data-off="1"])');
    if (!cur) return;
    var ghost = cur.cloneNode(true);
    /* not a .bc any more: the page's pager counts "#cardHost .bc", and a 13th card appeared for 220ms */
    ghost.className = ghost.className.replace(/\s*\b(bc|is-turning|is-landing)\b/g, "") + " aogc-deal " + (dir < 0 ? "to-r" : "to-l");
    ghost.removeAttribute("tabindex"); ghost.removeAttribute("role"); ghost.removeAttribute("data-off");
    ghost.setAttribute("aria-hidden", "true");
    var strip = ghost.querySelectorAll("[data-ans],[data-ix],[data-en],[id]"), i;
    for (i = 0; i < strip.length; i++) {
      strip[i].removeAttribute("data-ans"); strip[i].removeAttribute("data-ix");
      strip[i].removeAttribute("data-en"); strip[i].removeAttribute("data-es"); strip[i].removeAttribute("id");
    }
    ghost.style.height = cur.offsetHeight + "px";
    /* appended after the page's own click handler has swapped data-off, never during its count */
    setTimeout(function () {
      host.appendChild(ghost);
      setTimeout(function () { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); }, 260);
      var nxt = host.querySelector(':scope > .bc.aogc-card:not(.aogc-deal):not([data-off="1"])');
      if (!nxt || nxt === cur) return;
      nxt.className = nxt.className.replace(/\s*\bis-landing\b/, "") + " is-landing";
      setTimeout(function () { nxt.className = nxt.className.replace(/\s*\bis-landing\b/, ""); }, 240);
    }, 0);
  }
  var prevB = pager("cPrev"), nextB = pager("cNext");
  if (prevB) prevB.addEventListener("click", function () { if (!prevB.disabled) deal(-1); }, true);
  if (nextB) nextB.addEventListener("click", function () { if (!nextB.disabled) deal(1); }, true);
})();
