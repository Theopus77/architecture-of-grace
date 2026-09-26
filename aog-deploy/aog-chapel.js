/* ══ AOG-CHAPEL-V1 (2026-09-26) — THE ROOMS NOBODY HAD TOUCHED ═══════════════
   Jimmy: "The FRAMEWORK ROOMS ALL NEED A FACELIFT. REDUCE WRITTEN LOAD.
   FACELIFT TO THE CEILING … EVERYTHING THAT HAS NOT BEEN TOUCHED!" and, on the
   home page's pale lower half: it doesn't need to be so blunt.
   These rooms now sit on the same night-navy chapel ground as the dashboard:
     · every light box inside them becomes a leaded-glass pane (dark glass,
       dark lead, a gold hairline, a band of colour along the top);
     · long runs of reading fold away: the first paragraph shows, the rest
       waits behind "Read more". Nothing is deleted — one tap brings it back;
     · aog-legible.js then lifts any leftover dark ink to read on the glass.
   Screen only; nothing moves. Rooms: the Framework, the self-reflection start,
   "Who's checking in?", and the home page's "Where it began".            */
(function () {
  "use strict";
  var D = document, H = D.documentElement;
  var ROOMS = "#screen-framework, #screen-checkin, #screen-choose, #aog-origin, #screen-workplace, #screen-adult, #screen-starthere, #screen-ecosystem, #screen-words, #screen-eco-home, #screen-eco-bridge, #screen-eco-parents, #screen-eco-educators, #screen-eco-adult, #screen-eco-overview, #screen-about, #screen-guide, #screen-library, #screen-curriculum, #screen-teacher-tools, #screen-myresults, #screen-thanks, #screen-closing, #screen-farewell, #screen-charts";
  var BANDS = ["#2F63B8", "#B8457A", "#2E8B57", "#B87A12", "#7B4FA0", "#1F8080"];
  function es() { return /^es/i.test(H.lang || ""); }
  function lum(s) {
    var cm = /color\(srgb\s+([^)]+)\)/.exec(s || "");
    if (cm) { var w = cm[1].split(/[\s\/]+/).filter(Boolean).map(Number); if (w.length > 3 && w[3] < 0.5) return null; return 0.2126 * w[0] + 0.7152 * w[1] + 0.0722 * w[2]; }
    var m = /rgba?\(([^)]+)\)/.exec(s || ""); if (!m) return null;
    var v = m[1].split(/[\s,\/]+/).map(Number); if (v.length > 3 && v[3] < 0.5) return null;
    return (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255;
  }
  var n = 0, changed = 0, seenScreen = "";
  function panes(root) {
    var all = root.querySelectorAll("div, section, article, aside, details, li, blockquote, figure, form, fieldset, p, button, a, span, label");
    for (var i = 0; i < all.length && i < 40000; i++) {
      var el = all[i];
      var wasInk = el.hasAttribute("data-aog-inkdark");
      if (wasInk) el.removeAttribute("data-aog-inkdark");
      if (el.hasAttribute("data-aog-pane") || el.closest("svg, canvas, .aogtop, [data-aog-nopane]")) continue;
      var cs = getComputedStyle(el), l = lum(cs.backgroundColor);
      if (l === null && cs.backgroundImage && cs.backgroundImage !== "none") { var m1 = /rgba?\([^)]+\)/.exec(cs.backgroundImage); if (m1) l = lum(m1[0]); }
      if (l === null || l < 0.6) { if (wasInk) changed++; continue; }
      var r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; /* hidden now: judged when it shows */
      /* small light things (a pill, a loop node, a white button) keep their light face and get dark ink */
      if (r.width < 120 || r.height < 36 || (/^(BUTTON|A|SPAN|LABEL)$/.test(el.tagName) && !(r.width >= 220 && r.height >= 70))) { el.setAttribute("data-aog-inkdark", "1"); if (!wasInk) changed++; continue; }
      el.setAttribute("data-aog-pane", "1"); changed++;
      el.style.setProperty("--pane", BANDS[(n++) % BANDS.length]);
    }
  }
  function fold(root) {
    /* runs of plain reading: three or more paragraphs in one box, or two long ones */
    var boxes = root.querySelectorAll("div, section, article");
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      if (b.hasAttribute("data-aog-folded") || b.closest("[data-aog-readmore], .aogtop, form")) continue;
      var ps = Array.prototype.filter.call(b.children, function (c) { return c.tagName === "P" && !c.querySelector("input, button, select, textarea"); });
      if (ps.length < 2) continue;
      var rest = ps.slice(1), chars = rest.reduce(function (a, p) { return a + (p.textContent || "").length; }, 0);
      if (chars < 260 || (ps.length < 3 && chars < 420)) continue;
      b.setAttribute("data-aog-folded", "1"); changed++;
      var d = D.createElement("details"); d.className = "aog-readmore"; d.setAttribute("data-aog-readmore", "1");
      var s = D.createElement("summary");
      s.innerHTML = '<span data-en="Read more" data-es="Leer más">' + (es() ? "Leer más" : "Read more") + "</span>";
      d.appendChild(s);
      rest[0].parentNode.insertBefore(d, rest[0]);
      rest.forEach(function (p) { d.appendChild(p); });
    }
  }
  /* a long intro under a title: its first sentence shows, the rest waits behind Read more */
  function trimLedes(root) {
    root.querySelectorAll("p.lede, .lede > p, p.sub, p.deck").forEach(function (p) {
      if (p.hasAttribute("data-aog-trim") || p.closest(".aog-readmore")) return;
      var tx = (p.textContent || "").trim(); if (tx.length < 220) return;
      var m = /^(.{40,220}?[.!?])\s/.exec(tx); if (!m) return;
      p.setAttribute("data-aog-trim", "1"); changed++;
      var full = p.innerHTML;
      var d = D.createElement("details"); d.className = "aog-readmore aog-lede-more"; d.setAttribute("data-aog-readmore", "1");
      d.innerHTML = '<summary><span>' + (es() ? "Leer más" : "Read more") + '</span></summary><p class="aog-lede-rest"></p>';
      d.querySelector(".aog-lede-rest").textContent = tx.slice(m[1].length).trim();
      p.textContent = m[1];
      p.parentNode.insertBefore(d, p.nextSibling);
    });
  }
  var css = D.createElement("style"); css.id = "aog-chapel";
  css.textContent = "@media screen{" +
    ROOMS.split(",").map(function (r) { return r.trim() + ".active, " + r.trim(); }).filter(function (x, i) { return i < 3 ? true : true; }).join(",").replace(/#aog-origin\.active, /, "") +
    "{background:radial-gradient(40% 30% at 12% 10%,rgba(47,99,184,.22),transparent 70%),radial-gradient(34% 28% at 90% 18%,rgba(184,69,122,.14),transparent 70%)," +
    "radial-gradient(40% 32% at 80% 85%,rgba(46,139,87,.14),transparent 70%),linear-gradient(180deg,#0B2036,#081828)!important;color:#F4EEE2}" +
    "[data-aog-pane]{background-color:#13314F!important;background-image:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,0) 90px)!important;" +
    "border:2px solid #1E1F22!important;border-radius:18px!important;box-shadow:0 0 0 1px rgba(242,201,100,.4),inset 0 5px 0 var(--pane,#C9A24A),0 18px 40px -26px rgba(0,0,0,.85)!important;color:#F4EEE2!important}" +
    ROOMS.split(",").map(function (x) { x = x.trim(); return x + " :is(h1,h2,h3,.display)"; }).join(",") + "{color:#F4EEE2!important}" +
    ".aog-lede-more{text-align:inherit}.aog-lede-more .aog-lede-rest{font:inherit;margin-top:.6em}" +
    /* the words in these rooms: cream on the glass (buttons that paint their own light face keep their ink) */
    ROOMS.split(",").map(function (x) { return x.trim(); }).map(function (r) {
      return r + " :is(p,li,span,small,em,strong,b,i,td,th,label,dd,dt,h4,h5,h6,figcaption,blockquote):not(button *):not([class*=\"btn\"] *):not([data-aog-inkdark]):not([data-aog-inkdark] *)";
    }).join(",") + "{color:#EDE7DA!important}" +
    /* every word on a glass pane is cream, unless it sits on a small light face of its own */
    "[data-aog-pane] :is(div,p,span,li,h1,h2,h3,h4,h5,small,em,strong,b,i,label,dt,dd,td,th):not([data-aog-inkdark]):not([data-aog-inkdark] *){color:#EDE7DA!important}" +
    "[data-aog-pane] :is(.eyebrow,.kicker,[class*=eyebrow],[class*=kicker]):not([data-aog-inkdark] *){color:#E7C46A!important}" +
    "[data-aog-pane] a:not([data-aog-inkdark]):not([class*=btn]){color:#F2C964!important}" +
    ROOMS.split(",").map(function (x) { return x.trim() + " :is(.wp-personal-t,.wp-personal-s,.wp-personal-tx *)"; }).join(",") + "{color:#EDE7DA!important}" +
    "[data-aog-inkdark],[data-aog-inkdark] *{color:#0A1E33!important}" +
    ROOMS.split(",").map(function (x) { x = x.trim(); return x + " [data-aog-inkdark]," + x + " [data-aog-inkdark] *"; }).join(",") + "{color:#0A1E33!important}" +
    ROOMS.split(",").map(function (x) { x = x.trim(); return x + " :is(.eyebrow,.ey,[class*=eyebrow],.fwl-proof-h,[class*=kicker],[class*=-kick]):not([data-aog-inkdark]):not([data-aog-inkdark] *)"; }).join(",") + "{color:#E7C46A!important}" +
    ROOMS.split(",").map(function (x) { x = x.trim(); return x + " :is(.small,.ed-s,small):not([data-aog-inkdark] *)"; }).join(",") + "{color:#C8D4E2!important}" +
    ROOMS.split(",").map(function (x) { x = x.trim(); return x + " a:not([class*=btn]):not([data-aog-inkdark]):not([data-aog-inkdark] *):not(.aogtop *)"; }).join(",") + "{color:#F2C964!important}" +
    ROOMS.split(",").map(function (x) { x = x.trim(); return x + " [class*=btn] *"; }).join(",") + "{color:inherit!important}" +
    ROOMS.split(",").map(function (x) { return x.trim() + " button:not([data-aog-inkdark]):not([class*=btn]):not(.fw-tab)"; }).join(",") + "{color:#EDE7DA!important;opacity:1!important}" +
    /* tab rows and quiet links inside the rooms: cream, the chosen one gold */
    ROOMS.split(",").map(function (x) { return x.trim() + " :is([role=tab],.tab,.gtab,.seg button,[class*=tab]:is(button,a)):not([data-aog-inkdark])"; }).join(",") + "{color:#EDE7DA!important;opacity:1!important}" +
    ROOMS.split(",").map(function (x) { return x.trim() + " :is([role=tab][aria-selected=true],.tab.active,.active[class*=tab])"; }).join(",") + "{color:#F2C964!important}" +
    ROOMS.split(",").map(function (x) { return x.trim() + " :is(.found-tag,.eco-chip,.pill)"; }).join(",") + "{color:#0A1E33!important;font-family:Inter,system-ui,sans-serif!important;letter-spacing:.08em}" +
    ROOMS.split(",").map(function (x) { return x.trim() + " .btn-secondary"; }).join(",") + "{background:transparent!important;color:#F2C964!important;border:2px solid #C9A24A!important}" +
    ":is(#screen-checkin,#screen-framework,#screen-choose,#screen-workplace,#screen-adult) :is(.mode-card,.mode-card *,.mode-desc,.pv-strip a,.qd-s,.mode-name,h1,h2,h3,h4):not([data-aog-inkdark]):not([data-aog-inkdark] *){color:#F4EEE2!important}" +
    ":is(#screen-checkin,#screen-framework,#screen-choose) :is(.mode-kicker,.mode-eyebrow,.mode-time){color:#E7C46A!important}" +
    "#screen-checkin .btn:not(.btn-secondary){background:#C9A24A!important;color:#0A1E33!important;border:2px solid #1E1F22!important}#screen-checkin .btn:not(.btn-secondary) *{color:#0A1E33!important}" +
    "#screen-framework .fw-tab:not(.active):not([aria-selected=true]){color:#F4EEE2!important}" +
    "#screen-framework .fw-tab:not(.active):not([aria-selected=true]) *{color:inherit!important}" +
    ".aog-readmore{margin:.4em 0 .8em}.aog-readmore>summary{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:999px;" +
    "border:1.5px solid #C9A24A;color:#F2C964;font:700 14px/1 Inter,system-ui,sans-serif;cursor:pointer;list-style:none}" +
    ".aog-readmore>summary::-webkit-details-marker{display:none}.aog-readmore>summary::after{content:'\\25BE';font-size:12px}" +
    ".aog-readmore[open]>summary::after{content:'\\25B4'}.aog-readmore[open]>summary span::after{content:''}" +
    "}@media print{.aog-readmore>summary{display:none}}";
  function run() {
    changed = 0;
    /* AOG-CHAPEL-SAFE-V1 (2026-09-26) — the colours only switch on AFTER every light
       box in the room has been found and turned into a dark pane, and they are
       measured with the chapel colours off. Before, Safari could paint the cream
       words before the boxes turned dark: cream on cream. Now a room is either
       fully chapel or fully its original self — readable either way. */
    if (css.sheet) css.sheet.disabled = true;
    var act = Array.prototype.map.call(D.querySelectorAll(ROOMS.replace(/,/g, ".active,") + ".active"), function (x) { return x.id; }).join();
    if (act !== seenScreen) { seenScreen = act; changed++; }
    D.querySelectorAll(ROOMS).forEach(function (r) {
      if (r.id === "aog-origin" || r.classList.contains("active")) { panes(r); fold(r); trimLedes(r); }
    });
    if (css.sheet) css.sheet.disabled = false;
    /* only when this layer actually repainted something — a steady page is never re-swept (no flicker) */
    if (changed) try { if (window.aogLegibleRefresh) window.aogLegibleRefresh(); } catch (e) {}
  }
  var t = 0;
  function soon() { clearTimeout(t); t = setTimeout(run, 120); }
  /* AOG-BACK-RESCUE-V1 (2026-09-26) — Jimmy: pressing Back sometimes left a blank
     page ("the stoppage … THESE ALL HAVE THE BACK ISSUE"). After any Back, Forward
     or return from the browser's page cache: if no room is showing words, route
     the address again; if still nothing, go home. And never leave the page
     scrolled past the end of a shorter room. */
  function rescue() {
    var act = D.querySelector("section.screen.active");
    var empty = !act || act.offsetHeight < 80 || (act.innerText || "").replace(/\s+/g, "").length < 20;
    if (empty) {
      try { if (typeof window.aogRouteFromHash === "function") window.aogRouteFromHash(); } catch (e) {}
      setTimeout(function () {
        var a2 = D.querySelector("section.screen.active");
        if ((!a2 || (a2.innerText || "").replace(/\s+/g, "").length < 20) && typeof window.showScreen === "function") { try { window.showScreen("screen-welcome"); } catch (e) {} }
      }, 300);
    }
    var maxY = Math.max(0, D.documentElement.scrollHeight - window.innerHeight);
    if (window.scrollY > maxY - 2 || empty) window.scrollTo(0, 0);
  }
  window.addEventListener("popstate", function () { setTimeout(rescue, 350); });
  window.addEventListener("hashchange", function () { setTimeout(rescue, 350); });
  window.addEventListener("pageshow", function (e) { if (e.persisted) setTimeout(rescue, 350); });
  function start() {
    D.head.appendChild(css); run();
    /* the rooms are drawn a moment after load and on every page switch: look again then */
    window.addEventListener("load", function () { setTimeout(run, 300); setTimeout(run, 1500); });
    window.addEventListener("hashchange", function () { setTimeout(run, 250); setTimeout(run, 900); });
    D.addEventListener("click", function () { setTimeout(soon, 200); setTimeout(run, 700); setTimeout(run, 1600); }, true);
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) { var x = list[i].target; if (x.closest && x.closest(".aog-readmore")) continue; soon(); return; }
    }).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
})();
