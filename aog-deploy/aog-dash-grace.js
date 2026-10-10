/* ════════════════════════════════════════════════════════════════════════════
   ARCHITECTURE OF GRACE — THE DASHBOARD, IN THE HOME PAGE'S NAVY.

   Jimmy: "Can we upgrade the dashboard? A facelift like we have been doing.
   The dashboard is what I love too."

   The educator dashboard (#screen-admin on index.html) is drawn by a few
   dozen scripts, tab by tab, on a cream sheet. Restyling 250 class names by
   hand would break the next time any of those scripts changed. So this file
   re-tints the dashboard the way a photographer re-lights a room: after every
   render it walks the dashboard, finds every light surface and every dark
   line of text, and gives each one its navy-and-gold counterpart. Semantic
   colors (a red risk flag, a green "on track") keep their hue and are only
   lifted to read on navy. Nothing about the markup, the data or the behaviour
   is touched.

   It also redraws the dashboard's lock screen (the code prompt) in the same
   language: a navy card, the gold mark, a proper six-digit code field.

   One line in index.html, after the site bar:
       <script src="/aog-dash-grace.js" defer></script>
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.__aogDashGrace) return;
  window.__aogDashGrace = 1;
  var D = document;

  /* ── palette ─────────────────────────────────────────────────────────── */
  var NAVY = "#0A1E33", CARD = "#13314F", CARD2 = "#0F2A45", FIELD = "#0B2239";
  var CREAM = "#F4EEE2", CREAM_SOFT = "#C8D4E2", CREAM_FAINT = "#9DB1C6";
  var GOLD = "#F2C964", RULE = "rgba(244,238,226,.16)";

  /* ── the sheet: the parts a rule can reach ────────────────────────────── */
  var CSS = [
    "html.aog-dash-navy #screen-admin{color:" + CREAM + ";background:" + NAVY + ";min-height:100vh;}",
    "html.aog-dash-navy #screen-admin .container-wide{background:transparent;}",
    /* type: the home page's faces */
    "html.aog-dash-navy #screen-admin h1,html.aog-dash-navy #screen-admin h2,html.aog-dash-navy #screen-admin h3,html.aog-dash-navy #screen-admin .serif{font-family:\"Fraunces\",\"Cormorant Garamond\",Georgia,serif;}",
    "html.aog-dash-navy #screen-admin .kpi-label,html.aog-dash-navy #screen-admin .xw-k,html.aog-dash-navy #screen-admin .xa-k{color:" + GOLD + " !important;letter-spacing:.14em;text-transform:uppercase;font-weight:800;}",
    "html.aog-dash-navy #screen-admin .kpi-value{color:" + CREAM + " !important;font-family:\"Fraunces\",Georgia,serif;}",
    /* controls */
    "html.aog-dash-navy #screen-admin input:not([type=checkbox]):not([type=radio]):not([type=range]),html.aog-dash-navy #screen-admin select,html.aog-dash-navy #screen-admin textarea{background:" + FIELD + " !important;color:" + CREAM + " !important;border-color:" + RULE + " !important;color-scheme:dark;}",
    "html.aog-dash-navy #screen-admin input::placeholder,html.aog-dash-navy #screen-admin textarea::placeholder{color:" + CREAM_FAINT + ";opacity:1;}",
    "html.aog-dash-navy #screen-admin .tab{color:" + CREAM_SOFT + ";}",
    "html.aog-dash-navy #screen-admin .tab.active{color:" + GOLD + ";border-color:" + GOLD + ";}",
    "html.aog-dash-navy #screen-admin .btn-secondary{border-color:rgba(242,201,100,.55) !important;}",
    "html.aog-dash-navy #screen-admin a{color:" + GOLD + ";}",
    "html.aog-dash-navy #screen-admin hr{border-color:" + RULE + ";}",
    "html.aog-dash-navy #screen-admin ::selection{background:rgba(217,163,59,.32);}",
    /* the "not locked" chip */
    "html.aog-dash-navy #aogDashNotLocked{color:" + GOLD + ";background:rgba(242,201,100,.14);}",

    /* ── the lock screen ─────────────────────────────────────────────── */
    "body #aogDashLock{background:radial-gradient(60% 120% at 88% -10%, rgba(242,201,100,.16), transparent 62%),radial-gradient(125% 150% at 50% 0%, #244D75 0%, #143049 55%, #07151F 100%);}",
    "body #aogDashLock .dl-card{background:" + CARD2 + ";border:1px solid rgba(242,201,100,.28);border-radius:20px;padding:34px 36px 30px;box-shadow:0 30px 80px -20px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.06);max-width:460px;position:relative;}",
    "body #aogDashLock .dl-card::before{content:\"A\";position:absolute;top:-22px;left:34px;width:44px;height:44px;border-radius:11px;display:grid;place-items:center;font-family:\"Fraunces\",Georgia,serif;font-weight:600;font-size:24px;color:" + NAVY + ";background:linear-gradient(176deg,#FBEFC9 0%,#F2CE7E 28%,#DCAB4C 58%,#B5821F 100%);box-shadow:0 8px 18px -6px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.55);}",
    "body #aogDashLock .dl-k{color:" + GOLD + ";font-size:11px;letter-spacing:.3em;font-weight:700;margin:6px 0 10px;}",
    "body #aogDashLock h2{font-family:\"Fraunces\",\"Cormorant Garamond\",Georgia,serif;font-size:30px;line-height:1.05;letter-spacing:-.02em;color:" + CREAM + ";margin:0 0 12px;font-weight:600;}",
    "body #aogDashLock p{color:" + CREAM_SOFT + ";font-size:14.5px;line-height:1.6;}",
    "body #aogDashLock input{background:" + NAVY + ";border:1px solid rgba(242,201,100,.45);border-radius:14px;color:" + GOLD + ";font-size:30px;letter-spacing:.55em;text-indent:.55em;padding:14px 12px;font-family:\"Fraunces\",Georgia,serif;box-shadow:inset 0 2px 6px rgba(0,0,0,.45);}",
    "body #aogDashLock input:focus{outline:none;border-color:" + GOLD + ";box-shadow:inset 0 2px 6px rgba(0,0,0,.45), 0 0 0 4px rgba(242,201,100,.18);}",
    "body #aogDashLock .dl-go{background:" + GOLD + ";color:" + NAVY + ";font-weight:800;padding:12px 24px;}",
    "body #aogDashLock .dl-go:hover{background:#FBEFC9;}",
    "body #aogDashLock .dl-ghost{color:" + CREAM + ";border:1.5px solid rgba(242,201,100,.6);background:transparent;padding:11px 20px;}",
    "body #aogDashLock .dl-ghost:hover{background:rgba(242,201,100,.14);}",
    "body #aogDashLock .dl-msg{color:#F0A07C;}",
    "body #aogDashLock .dl-fine{color:" + CREAM_FAINT + ";border-top:1px solid " + RULE + ";}",
    "body #aogDashLock .dl-link{color:" + GOLD + ";}",
    "@media (max-width:480px){body #aogDashLock .dl-card{padding:30px 22px 24px;}body #aogDashLock h2{font-size:26px;}}"
  ].join("\n");

  /* ── color maths ─────────────────────────────────────────────────────── */
  function parse(c) {
    var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?/.exec(c || "");
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
    /* Chrome reports some computed colors as color(srgb r g b / a) with 0–1 channels */
    m = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/.exec(c || "");
    if (m) return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a: m[4] === undefined ? 1 : +m[4] };
    return null;
  }
  function hsl(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) {
      var d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0); else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: h, s: s, l: l };
  }
  function css(h, s, l, a) { return "hsla(" + Math.round(h * 360) + "," + Math.round(s * 100) + "%," + Math.round(l * 100) + "%," + (a == null ? 1 : a) + ")"; }
  function lum(c) { return (c.r * .2126 + c.g * .7152 + c.b * .0722) / 255; }
  function chroma(c) { return (Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b)) / 255; }
  /* the lightest opaque stop of a gradient, or null */
  function gradStop(bi) {
    if (!/gradient/.test(bi || "")) return null;
    var stops = bi.match(/rgba?\([^)]*\)|color\(srgb[^)]*\)/g) || [], best = null, i, c;
    for (i = 0; i < stops.length; i++) { c = parse(stops[i]); if (c && c.a >= .5 && (!best || lum(c) > lum(best))) best = c; }
    return best;
  }

  /* ── the walk ────────────────────────────────────────────────────────── */
  var pseq = 0, pseudoCss = [], pseudoStyle = null;
  function flushPseudo() {
    if (!pseudoCss.length) return;
    if (!pseudoStyle) { pseudoStyle = D.createElement("style"); pseudoStyle.id = "aogDashGracePseudo"; (D.head || D.documentElement).appendChild(pseudoStyle); }
    pseudoStyle.textContent += pseudoCss.join("\n") + "\n"; pseudoCss = [];
  }
  var SKIP = { SCRIPT: 1, STYLE: 1, SVG: 1, PATH: 1, CANVAS: 1, IMG: 1, OPTION: 1, VIDEO: 1, IFRAME: 1 };
  function hasText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
      /* an emoji already drawn in pencil (aog-sketch.js) is still a word in the line: its colour decides the pencil's */
      if (n.nodeType === 1 && n.tagName === "IMG" && n.classList.contains("aog-sk")) return true;
    }
    return false;
  }
  function tint(root) {
    var all = root.querySelectorAll("*"), i, el, cs, bg, c, k, n = 0;
    for (i = 0; i < all.length; i++) {
      el = all[i];
      if (SKIP[el.tagName] || el.closest("svg")) continue;
      if (el.getAttribute("data-aog-tinted") === "1") continue;
      cs = getComputedStyle(el);
      /* backgrounds */
      bg = parse(cs.backgroundColor);
      var grad = false;
      if (!bg || bg.a < .5 || lum(bg) <= .55) {
        var stop = gradStop(cs.backgroundImage);
        if (stop) { bg = stop; grad = true; }
      }
      var ground = null;
      if (bg && bg.a >= .5) ground = lum(bg) > .55 ? "light" : "dark";
      if (bg && bg.a >= .5 && lum(bg) > .55) {
        ground = "dark";
        k = hsl(bg);
        var boxed = (cs.borderTopWidth !== "0px" && parse(cs.borderTopColor) && parse(cs.borderTopColor).a > 0) || parseFloat(cs.borderTopLeftRadius) > 0 || (cs.boxShadow && cs.boxShadow !== "none");
        var tag = el.tagName;
        if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || tag === "BUTTON") {
          if (tag === "BUTTON" && k.s > .35) { ground = "light"; /* a gold or colored button: keep it */ }
          else el.style.setProperty("background-color", tag === "BUTTON" ? "rgba(255,255,255,.06)" : FIELD, "important");
        } else if (chroma(bg) > .3 && k.l > .45 && k.l < .8 && !grad) {
          ground = "light"; /* a solid gold or colored chip: keep it */
        } else if (chroma(bg) < .16) {
          el.style.setProperty("background-color", boxed ? CARD : "transparent", "important");
        } else {
          el.style.setProperty("background-color", css(k.h, Math.min(k.s, .55), .22, 1), "important");
        }
        if (ground === "dark") el.style.setProperty("background-image", "none", "important");
      }
      if (ground) el.setAttribute("data-aog-ground", ground);
      /* borders */
      var sides = ["Top", "Right", "Bottom", "Left"];
      for (var s = 0; s < 4; s++) {
        var bc = parse(cs["border" + sides[s] + "Color"]);
        if (bc && bc.a > 0 && cs["border" + sides[s] + "Width"] !== "0px" && lum(bc) > .5 && hsl(bc).s < .3) {
          el.style.setProperty("border-" + sides[s].toLowerCase() + "-color", RULE, "important");
        }
      }
      /* text */
      if (hasText(el) || el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
        c = parse(cs.color);
        var g = el.closest("[data-aog-ground]");
        var onLight = g && g.getAttribute("data-aog-ground") === "light";
        if (c && lum(c) < .5 && !onLight) {
          k = hsl(c);
          if (k.s < .3) el.style.setProperty("color", k.l < .3 ? CREAM : CREAM_SOFT, "important");
          else el.style.setProperty("color", css(k.h, Math.max(k.s, .45), .72, 1), "important");
        }
      }
      /* light ::before / ::after paint (the fold rows draw a white sheet this way) */
      try {
        var pseudo = ["::before", "::after"], q;
        for (q = 0; q < 2; q++) {
          var pc = getComputedStyle(el, pseudo[q]);
          if (!pc || pc.content === "none" || pc.content === "normal") continue;
          var pb = parse(pc.backgroundColor), pg = gradStop(pc.backgroundImage);
          var light = (pb && pb.a >= .5 && lum(pb) > .55) || (pg && pg.a >= .5 && lum(pg) > .55);
          if (!light) continue;
          var pid = el.getAttribute("data-aog-p");
          if (!pid) { pid = String(++pseq); el.setAttribute("data-aog-p", pid); }
          pseudoCss.push('html.aog-dash-navy #screen-admin [data-aog-p="' + pid + '"]' + pseudo[q] + "{background-color:" + CARD + " !important;background-image:" + (pg ? "linear-gradient(rgba(19,49,79,0)," + CARD + ")" : "none") + " !important;}");
        }
      } catch (e) {}
      el.setAttribute("data-aog-tinted", "1");
      n++;
    }
    return n;
  }

  /* ── wiring ──────────────────────────────────────────────────────────── */
  var root = null, timer = null, writing = false;
  /* AOG-DASH-GRACE-LATER-V1 (2026-10-10) — Jimmy: "I want the whole website not to lag". The front page carries the
     whole dashboard, out of sight, and looking at the colours of its 2,800 parts cost a phone seconds on every visit.
     Now they are looked at when the dashboard is shown: the moment it gets a size, before it is drawn, so it never
     appears untinted. */
  var watching = false;
  function later() {
    if (watching || !window.ResizeObserver) return false;
    watching = true;
    new ResizeObserver(function () { if (root.getClientRects().length) run(); }).observe(root);
    return true;
  }
  function run() {
    timer = null;
    if (!root) root = D.getElementById("screen-admin");
    if (!root) return;
    if (!root.getClientRects().length && (watching || later())) return;   /* out of sight: when it is shown */
    writing = true;
    var made = 0;
    try { made = tint(root); flushPseudo(); } catch (e) {}
    /* the colours changed: the pencil marks (aog-sketch.js) look again, so a mark on navy is drawn in light pencil */
    if (made) try { D.dispatchEvent(new Event("aog-recolored")); } catch (e) {}
    /* the observer sees our writes on the next tick; let it ignore them */
    setTimeout(function () { writing = false; }, 0);
  }
  function untint(el) {
    if (el.nodeType !== 1) return;
    el.removeAttribute("data-aog-tinted"); el.removeAttribute("data-aog-ground");
    var kids = el.querySelectorAll("[data-aog-tinted]");
    for (var i = 0; i < kids.length; i++) { kids[i].removeAttribute("data-aog-tinted"); kids[i].removeAttribute("data-aog-ground"); }
  }
  function schedule() { if (timer) return; timer = setTimeout(run, 40); }
  function mount() {
    var st = D.createElement("style"); st.id = "aogDashGraceCss"; st.textContent = CSS;
    (D.head || D.documentElement).appendChild(st);
    D.documentElement.classList.add("aog-dash-navy");
    root = D.getElementById("screen-admin");
    if (!root) return;
    run();
    if (window.MutationObserver) {
      try {
        new MutationObserver(function (muts) {
          if (writing) return;            /* our own inline styles */
          var any = false;
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === "childList" && (m.addedNodes.length || m.removedNodes.length)) any = true;
            else if (m.type === "attributes") { untint(m.target); any = true; }   /* the app restyled it: look again */
          }
          if (any) schedule();
        }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
      } catch (e) {}
    }
    /* a re-render often replaces nodes wholesale; a late pass catches stragglers */
    setTimeout(run, 400); setTimeout(run, 1500);
    /* theme flips re-tint from scratch */
    try {
      new MutationObserver(function () {
        root.querySelectorAll("[data-aog-tinted]").forEach(function (el) { el.removeAttribute("data-aog-tinted"); });
        schedule();
      }).observe(D.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    } catch (e) {}
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mount); else mount();
})();
