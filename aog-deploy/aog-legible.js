/* ══ AOG-LEGIBLE-V1 (2026-09-25) — NO TEXT YOU CANNOT READ ════════════════════
   Jimmy, on cream text on a white box: "This needs to be fixed immediately
   across all pages and make a permanent command that this doesn't happen
   again." A sweep found ~300 pages with some text below 3:1 against what sits
   behind it — a gold label on a gold box, a grey hint on navy, a light-theme
   colour left behind in dark. Fixing each page by hand fixes today's pages
   only. This runs on every page (aog-grace.js loads it; index.html loads it
   directly): it finds visible text whose colour reads below 4.5:1 against its
   real background and walks that same colour toward black or white until it
   does. The design keeps its hue — a gold label becomes a deep gold — and the
   check re-runs when the theme flips or the page draws something new.
   tools/check-contrast.js is the build-time half of the same rule.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.__aogLegible) return;
  window.__aogLegible = 1;
  var D = document, H = D.documentElement, TARGET = 4.5, FLOOR = 3;
  var NAVY = { r: 10, g: 30, b: 51, a: 1 };

  function px(s) {
    /* color-mix() computes to color(srgb r g b / a) with 0–1 channels */
    var cm = /color\(srgb\s+([^)]+)\)/.exec(s || "");
    if (cm) { var w = cm[1].split(/[\s\/]+/).filter(Boolean).map(Number); return { r: w[0] * 255, g: w[1] * 255, b: w[2] * 255, a: w.length > 3 ? w[3] : 1 }; }
    var m = /rgba?\(([^)]+)\)/.exec(s || ""); if (!m) return null;
    var v = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 };
  }
  function lum(c) {
    function f(x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mix(top, bot) {
    return { r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 };
  }
  function bgOf(el) {
    var layers = [];
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (n.hasAttribute("data-aog-hero")) { layers.push(NAVY); break; }
      /* AOG-LEGIBLE-GRADIENT-V1 (2026-09-26): a gradient used to make the guard
         give up (dark pills on the navy crosswalk banner). In the masthead keep
         walking to the navy; elsewhere use the gradient's first solid colour. */
      if (cs.backgroundImage && cs.backgroundImage !== "none" && !/url\(/.test(cs.backgroundImage)) {
        if (n.closest("[data-aog-hero]")) continue;
        var st = (cs.backgroundImage.match(/(rgba?\([^)]+\)|color\(srgb[^)]+\))/g) || []).map(px).filter(function (c) { return c && c.a >= 0.99; });
        if (!st.length) return null;
        layers.push(st[0]); break;
      }
      var c = px(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 0.99) break; }
    }
    var out = { r: 255, g: 255, b: 255, a: 1 };
    for (var i = layers.length - 1; i >= 0; i--) out = mix(layers[i], out);
    return out;
  }
  function toward(fg, bg) {
    /* the same colour, pushed away from the background until it reads */
    var goDark = lum(bg) > 0.18, end = goDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    for (var t = 0.1; t <= 1.001; t += 0.1) {
      var c = { r: Math.round(fg.r + (end.r - fg.r) * t), g: Math.round(fg.g + (end.g - fg.g) * t), b: Math.round(fg.b + (end.b - fg.b) * t), a: 1 };
      if (ratio(c, bg) >= TARGET) return c;
    }
    return end;
  }
  var hov = null;
  var SKIP = "script,style,noscript,svg,option,[hidden],[aria-hidden=true],.sr-only,.visually-hidden,[data-aog-legible-off]";
  function sweep(root, mark) {
    if (D.hidden) return;
    /* AOG-LEGIBLE-REACH-V1 (2026-09-26): the walk used to stop after 6,000 pieces
       of text, and index.html holds far more than that in screens nobody is
       looking at, so the Framework was never reached. Hidden screens and
       hidden boxes are now skipped whole, and the budget is larger. */
    var w = D.createTreeWalker(root || D.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: function (x) {
      if (x.nodeType === 1) {
        if (x.hidden || (x.classList.contains("screen") && !x.classList.contains("active")) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|svg)$/.test(x.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    } }), seen = [], t, n = 0;
    while ((t = w.nextNode()) && n < 20000) {
      if (!/\S/.test(t.nodeValue)) continue;
      var el = t.parentElement; if (!el || el.__aogL === sweep.gen) continue;
      el.__aogL = sweep.gen; n++;
      if (el.closest(SKIP)) continue;
      if (!el.getClientRects().length) continue;
      if (el.closest(":disabled")) continue;
      seen.push(el);
    }
    for (var i = 0; i < seen.length; i++) {
      var e = seen[i], cs = getComputedStyle(e);
      if (cs.visibility !== "visible" || +cs.opacity < 0.3 || parseFloat(cs.fontSize) < 2) continue;
      if (/text/.test(cs.backgroundClip + " " + cs.webkitBackgroundClip)) continue; // gradient-filled lettering
      var fg = px(cs.color); if (!fg) continue;
      var bg = bgOf(e); if (!bg) continue;
      var shown = mix(fg, bg);
      if (ratio(shown, bg) >= FLOOR) continue;
      var c = toward(shown, bg);
      if (!mark && hov && hov.contains(e)) continue; // the hovered row is judged by hoverCheck
      if (mark) { if (e.hasAttribute("data-aog-legible")) continue; e.setAttribute(mark, e.style.getPropertyValue("color") || ""); }
      else if (!e.hasAttribute("data-aog-legible")) e.setAttribute("data-aog-legible", e.style.getPropertyValue("color") || "");
      e.style.setProperty("color", "rgb(" + c.r + "," + c.g + "," + c.b + ")", "important");
    }
  }
  sweep.gen = 1;
  function reset(attr) {
    /* the theme flipped: every correction was for the old colours */
    attr = attr || "data-aog-legible";
    var fixed = D.querySelectorAll("[" + attr + "]");
    for (var i = 0; i < fixed.length; i++) {
      var old = fixed[i].getAttribute(attr);
      if (old) fixed[i].style.setProperty("color", old); else fixed[i].style.removeProperty("color");
      fixed[i].removeAttribute(attr);
    }
  }
  /* AOG-LEGIBLE-HOVER-V1 (2026-09-26) — Jimmy: a standards row went white
     under cream text when the mouse sat on it. A hover can change what is
     behind the words, so the row under the pointer (or the focused control)
     is checked again, and those fixes are undone when the pointer leaves. */

  function hoverCheck(t) {
    if (!t || t.nodeType !== 1 || t === D.body || t === H) { reset("data-aog-legible-hover"); hov = null; return; }
    /* only a small thing under the pointer (a row, a card, a button) — never a whole
       page section, or the rest of the page would be left out of the main sweep */
    var row = t.closest("tr, li, a, button, label, summary, [role=button], .card");
    if (!row || row.getBoundingClientRect().height > 260) { reset("data-aog-legible-hover"); hov = null; return; }
    if (row === hov) return;
    reset("data-aog-legible-hover"); hov = row;
    setTimeout(function () { if (hov === row) { busy = true; try { sweep.gen++; sweep(row, "data-aog-legible-hover"); } catch (e) {} setTimeout(function () { busy = false; }, 0); } }, 30);
  }
  var timer = 0, busy = false;
  function soon(full) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      busy = true;
      try { if (full) reset(); sweep.gen++; sweep(); } catch (e) {}
      setTimeout(function () { busy = false; }, 0);
    }, full ? 80 : 250);
  }
  /* other layers that repaint a room (aog-chapel.js) ask for a fresh look */
  window.aogLegibleRefresh = function () { soon(true); };
  function start() {
    soon(false);
    window.addEventListener("load", function () { soon(false); setTimeout(function () { soon(false); }, 900); });
    if (window.MutationObserver) {
      new MutationObserver(function () { soon(true); })
        .observe(H, { attributes: true, attributeFilter: ["data-theme", "class"] });
      new MutationObserver(function (list) {
        if (busy) return;
        for (var i = 0; i < list.length; i++) if (list[i].type === "childList" || list[i].attributeName !== "style") { soon(false); return; }
      }).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "open"] });
    }
    D.addEventListener("pointerover", function (e) { hoverCheck(e.target); }, true);
    D.addEventListener("focusin", function (e) { hoverCheck(e.target); }, true);
    try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { soon(true); }); } catch (e) {}
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
})();
