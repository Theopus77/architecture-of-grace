
    /* =====================================================================
       PER-STUDENT LINKS  ·  2026-08-28

       The last piece of the code problem. Every scheme for "what should a
       student type" was a workaround for one constraint — that they have to
       remember it. Remove the constraint and the code is free to be what it
       should have been all along: opaque, stable for years, meaningless
       outside the school's own paper list, and re-issuable if it leaks.

       A student opens THEIR link. The code is already there. They never type
       one, never invent one, never use a name, and the code that reaches the
       Sheet is the same one next March.

       ⚠ THE RULE THIS LAYER IS BUILT ON:
           A CODE IN A LINK IS A WRITE CREDENTIAL, NEVER A READ ONE.

       Anyone holding the link can submit a check-in as that student — which
       is exactly as true as it was before, because anyone could always type
       any code into the box. The link removes friction; it does not lower a
       bar. What it must NOT do is let the holder READ that student back: no
       history, no carry card from a previous day, no mirror. Those still
       require the code to be typed by the person it belongs to.

       So `linked` is tracked separately from `SD.studentId`, and everything
       that displays a student's PAST is gated on it. See gateReads().

       The machinery downstream already existed and was never wired: the
       check-in reads window.AOG_PLACEMENT.studentId through lockedStudent(),
       and renderStudent() skips the code screen the moment it returns
       something. Nothing in the file ever set it. This sets it.
       ===================================================================== */
    (function () {
      "use strict";

      var PARAM = "sid";
      var SKEY  = "aog.launch.sid";

      function el(id) { return document.getElementById(id); }
      function isEs() { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
      function T(en, es) { return isEs() ? es : en; }
      function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      }
      function code(s) { return String(s == null ? "" : s).trim().toUpperCase(); }

      /* ---------------------------------------------------------- the link
         Read once, at boot, before the check-in renders. Kept in
         sessionStorage so a reload inside the same tab does not drop the
         student back to a code box, and NOT in localStorage so a shared
         Chromebook does not hand the next child the last one's identity. */
      var linked = "";
      (function readParam() {
        try {
          var p = new URLSearchParams(window.location.search);
          var v = code(p.get(PARAM) || "");
          /* AOG-SID-SAVED-V1 (2026-09-26) — Jimmy: "They are still making us do a code name." A slip
             opened on the device where a student already typed their name under Your work today
             (dashboard, aog.dash2.student) uses that name when the link itself names nobody. */
          if (!v && (p.has("checkin") || p.has("exit") || p.has("slip"))) {
            try { var sv = JSON.parse(localStorage.getItem("aog.dash2.student") || '""'); v = code(sv || localStorage.getItem("aog.drops.who") || ""); } catch (e0) { v = ""; }
          }
          if (v && v.length <= 24) {
            sessionStorage.setItem(SKEY, v);
          } else if (p.has("checkin") || p.has("exit") || p.has("slip")) {
            /* ⚠ A CHECK-IN LINK THAT NAMES NOBODY MUST NAME NOBODY.
               sessionStorage survives navigation inside a tab, which is what
               makes a reload keep the student signed in — and what would
               otherwise hand the NEXT child the last one's identity on a
               shared cart. One student opens their card, finishes, puts the
               Chromebook down; the next picks it up and opens the plain class
               link; without this they would submit as the first. Arriving by
               a link that carries no sid clears any sid still in the tab. */
            sessionStorage.removeItem(SKEY);
          }
        } catch (e) {}
        try { linked = code(sessionStorage.getItem(SKEY) || ""); } catch (e) {}
        if (linked) {
          /* The hook the check-in has always read and nobody ever filled. */
          try {
            window.AOG_PLACEMENT = window.AOG_PLACEMENT || {};
            if (!window.AOG_PLACEMENT.studentId) window.AOG_PLACEMENT.studentId = linked;
          } catch (e) {}
        }
      })();

      window.aogLinkedStudent = function () { return linked; };

      /* ------------------------------------------------- write, never read
         Everything that shows a student their own past is removed when the
         code arrived by link rather than by being typed. The buttons are
         taken out of the DOM rather than hidden, so nothing is one devtools
         toggle away from another child's fortnight.

         `#scMine` — "See my last few weeks" on the thank-you screen.
         `.sc-carry` / the returning-today card — the carry line and move
             they left with, from a check-in they did earlier today. */
      function gateReads() {
        if (!linked) return;
        var sec = el("screen-daily-checkin");
        if (!sec) return;
        var mine = sec.querySelector("#scMine");
        if (mine) mine.remove();
        sec.querySelectorAll("[data-mirror], .sc-mirror-btn").forEach(function (b) { b.remove(); });
      }

      /* The section is re-rendered on every question and on every terminal
         screen, so the gate is re-applied rather than run once. */
      function watchGate() {
        var sec = el("screen-daily-checkin");
        if (!sec || !window.MutationObserver) return;
        try {
          new MutationObserver(function () { gateReads(); })
            .observe(sec, { childList: true, subtree: true });
        } catch (e) {}
      }

      /* ============================================================ THE CARDS
         One link per student, generated from the class list. The teacher
         hands out a card; the child scans or clicks it; nobody types a code.

         The code is opaque on purpose — it means nothing to anyone without
         the teacher's own paper list, which is the whole point and is what
         keeps "pseudonymous by design" literally true. */

      function linkFor(cls, sid) {
        var base = "";
        try { base = (window.AOGPop && window.AOGPop.linkFor) ? window.AOGPop.linkFor(cls) : ""; } catch (e) {}
        if (!base) return "";
        return base + (base.indexOf("?") > -1 ? "&" : "?") + PARAM + "=" + encodeURIComponent(code(sid));
      }

      function css() {
        if (el("aog-slink-css")) return;
        var s = document.createElement("style");
        s.id = "aog-slink-css";
        s.textContent = [
          "#panel-classes .pc-links{margin-top:12px;padding-top:12px;border-top:1px solid var(--rule);}",
          "#panel-classes .sl-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12.5px;}",
          "#panel-classes .sl-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;min-width:74px;}",
          "#panel-classes .sl-url{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-faint);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;}",
          /* --- the printable sheet --- */
          "#aogSlinkSheet{display:none;}",
          "#aogSlinkSheet.on{display:block;margin-top:16px;}",
          "#aogSlinkSheet .sl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;}",
          "#aogSlinkSheet .sl-card{border:1px solid var(--rule);border-radius:10px;padding:14px;text-align:center;background:var(--paper);break-inside:avoid;}",
          "#aogSlinkSheet .sl-card .qr{width:120px;height:120px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;}",
          "#aogSlinkSheet .sl-card .qr img,#aogSlinkSheet .sl-card .qr canvas{width:120px;height:120px;display:block;}",
          "#aogSlinkSheet .sl-card .who{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:19px;letter-spacing:.04em;}",
          "#aogSlinkSheet .sl-card .cls{font-size:11.5px;color:var(--ink-faint);margin-top:2px;}",
          "#aogSlinkSheet .sl-card .note{font-size:10.5px;color:var(--ink-faint);margin-top:7px;line-height:1.4;}",
          "@media print{",
          "  body * {visibility:hidden !important;}",
          "  #aogSlinkSheet, #aogSlinkSheet * {visibility:visible !important;}",
          /* ⚠ display, NOT visibility. The rules above hide the app by
             visibility; the APP-WIDE isolation rule hides .stage by DISPLAY,
             and a display:none ancestor removes this subtree from layout no
             matter what its descendants say. Restore the marked path, then
             prune each marked element's unmarked children so the cards do not
             print surrounded by empty space. Marked by selector rather than by
             a hard-coded ancestor chain, so re-parenting the sheet cannot
             silently blank it again. */
          /* ⚠ SCOPED TO THE BODY CLASS FOR SPECIFICITY, NOT FOR TIDINESS.
             A bare [data-sl-printpath] is (0,1,0) — the same weight as the
             `.bar, .console, .stage, .sheet{display:none!important}` rule in a
             <style> further down the body, and a tie goes to whichever comes
             later in the document. Runtime CSS is appended to <head>, so the
             bare selector LOST and the sheet still printed blank. */
          "  body.aog-cards-open [data-sl-printpath]{display:block !important;}",
          /* ⚠ :not(#aogSlinkSheet) ON THE PARENT SIDE. The sheet is the innermost
             marked element, so without this the rule pruned the sheet's OWN
             children — the grid of cards included — and it printed 1144 x 0.
             Stop pruning AT the destination. */
          "  body.aog-cards-open [data-sl-printpath]:not(#aogSlinkSheet) > *:not([data-sl-printpath]):not(#aogSlinkSheet){display:none !important;}",
          "  #aogSlinkSheet{position:static;width:100%;display:block !important;}",
          "  #aogSlinkSheet .sl-noprint{display:none !important;}",
          "  #aogSlinkSheet .sl-grid{grid-template-columns:repeat(3,1fr);gap:10px;}",
          "  #aogSlinkSheet .sl-card{border:1px solid #999;}",
          "}"
        ].join("\n");
        document.head.appendChild(s);
      }
      /* ═══════════════════ WHAT MAKES THE CARDS ACTUALLY PRINT
         Defined once and called by both card sheets — "Hand out links" and
         "Exit-slip cards" render into the SAME #aogSlinkSheet host, so there is
         one mechanism, not two that drift.
         ⚠ SYNCHRONOUS, inside the click. iOS silently drops a print that has
         left the user-gesture chain. [[aog-ios-print]] The timer below is a
         CLEANUP floor, never the thing that prints. */
      window.aogSlPrintCards = function () {
        var h = document.getElementById("aogSlinkSheet");
        if (!h) { try { window.print(); } catch (e) {} return; }
        var n = h;
        while (n && n !== document.body) { n.setAttribute("data-sl-printpath", ""); n = n.parentElement; }
        document.body.classList.add("aog-cards-open");
        function clean() {
          document.body.classList.remove("aog-cards-open");
          var marked = document.querySelectorAll("[data-sl-printpath]");
          for (var i = 0; i < marked.length; i++) marked[i].removeAttribute("data-sl-printpath");
        }
        window.addEventListener("afterprint", function once() {
          window.removeEventListener("afterprint", once); clean();
        });
        setTimeout(clean, 60000);
        try { window.print(); } catch (e) {}
      };

      function sheetHost() {
        var p = el("panel-classes");
        if (!p) return null;
        var h = el("aogSlinkSheet");
        if (!h) { h = document.createElement("div"); h.id = "aogSlinkSheet"; p.appendChild(h); }
        return h;
      }

      function buildSheet(cls) {
        var host = sheetHost();
        if (!host || !cls) return;
        var title = "";
        try { title = window.AOGPop.classTitle(cls); } catch (e) { title = cls.course || ""; }
        var members = (cls.members || []).slice();

        host.className = "on";
        host.innerHTML =
          '<div class="section-head sl-noprint" style="margin-top:22px;"><h2>' +
            esc(T("Cards for ", "Tarjetas para ") + title) + "</h2>" +
            '<div class="small">' + esc(T(
              "One card per student. Hand them out once; the child scans or clicks their own and never types a code again. Keep the paper list of which code is which child — that list is the only place the two are connected, and it belongs to you, not to this site.",
              "Una tarjeta por estudiante. Repártelas una vez; cada quien escanea o abre la suya y nunca vuelve a escribir un código. Guarda la lista en papel de qué código es de quién — esa lista es el único lugar donde se conectan, y es tuya, no de este sitio.")) + "</div></div>" +
          '<div class="pd-acts sl-noprint" style="margin-bottom:14px;">' +
            '<button type="button" class="aog-pop-btn primary" id="slPrint">' + esc(T("Print these cards", "Imprimir estas tarjetas")) + "</button>" +
            '<button type="button" class="aog-pop-btn" id="slClose">' + esc(T("Close", "Cerrar")) + "</button>" +
          "</div>" +
          '<div class="sl-grid">' + members.map(function (m) {
            var u = linkFor(cls, m);
            /* "Scans or clicks" — the QR is also a link to the URL it encodes. */
            return '<div class="sl-card"><a class="qr" style="display:block;" data-url="' + esc(u) + '" href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + esc(T("Open this student’s check-in", "Abrir el registro de este estudiante")) + '"></a>' +
              '<div class="who">' + esc(code(m)) + "</div>" +
              '<div class="cls">' + esc(title) + "</div>" +
              '<div class="note">' + esc(T("Open this to check in. It is yours — please do not pass it on.",
                                            "Abre esto para tu registro. Es tuyo — por favor no lo compartas.")) + "</div></div>";
          }).join("") + "</div>";

        /* ⚠ print() is called straight from the click, never behind a timer —
           iOS drops a deferred print silently. The QR images are drawn first,
           on this earlier gesture, so the teacher sees the cards before the
           dialog and the print handler stays synchronous. */
        var pb = el("slPrint");
        if (pb) pb.addEventListener("click", function () { if (window.aogSlPrintCards) window.aogSlPrintCards(); else window.print(); });
        var cb = el("slClose");
        if (cb) cb.addEventListener("click", function () { host.className = ""; host.innerHTML = ""; });

        drawQr(host);
        try { host.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (e) {}
      }

      function drawQr(host) {
        var boxes = host.querySelectorAll(".qr[data-url]");
        if (!boxes.length) return;
        function fallback() {
          boxes.forEach(function (b) {
            if (b.getAttribute("data-done")) return;
            b.setAttribute("data-done", "1");
            b.innerHTML = '<span style="font-size:10.5px;color:var(--ink-faint);line-height:1.35;word-break:break-all;">' +
              esc(b.getAttribute("data-url") || "") + "</span>";
          });
        }
        var p = null;
        try { p = (typeof ensureQrLib === "function") ? ensureQrLib() : null; } catch (e) {}
        if (!p) { fallback(); return; }
        p.then(function (ok) {
          if (!ok || !window.QRCode) { fallback(); return; }
          boxes.forEach(function (b) {
            var u = b.getAttribute("data-url");
            if (!u) { return; }
            try { new QRCode(b, { text: u, width: 120, height: 120, correctLevel: QRCode.CorrectLevel.M }); b.setAttribute("data-done", "1"); }
            catch (e) {}
          });
          fallback();   /* anything QRCode refused still gets its URL in text */
        }, fallback);
      }

      /* ------------------------------------------------ the button on a class
         #panel-classes is re-rendered wholesale by the population layer, so
         the button is re-attached on mutation rather than bound once. */
      function decorate() {
        var panel = el("panel-classes");
        if (!panel || !window.AOGPop) return;
        panel.querySelectorAll(".pc-card").forEach(function (card) {
          var acts = card.querySelector(".pd-acts");
          if (!acts || acts.querySelector("[data-links]")) return;
          var edit = acts.querySelector("[data-edit]");
          var id = edit && edit.getAttribute("data-edit");
          if (!id) return;
          var cls = null;
          try { cls = window.AOGPop.classById(id); } catch (e) {}
          if (!cls || !(cls.members || []).length) return;   /* nothing to hand out */
          var b = document.createElement("button");
          b.type = "button";
          b.className = "aog-pop-btn";
          b.setAttribute("data-links", id);
          b.textContent = T("Hand out links", "Repartir enlaces");
          b.addEventListener("click", function () {
            var c = null;
            try { c = window.AOGPop.classById(id); } catch (e) {}
            if (c) buildSheet(c);
          });
          acts.insertBefore(b, acts.firstChild);
        });
      }

      function watchPanel() {
        var panel = el("panel-classes");
        if (!panel || !window.MutationObserver) return;
        try {
          new MutationObserver(function () { decorate(); })
            .observe(panel, { childList: true, subtree: true });
        } catch (e) {}
      }

      /* ------------------------------------------------------------- public */
      window.AOGStudentLinks = {
        linkFor: linkFor,
        forClass: function (idOrCls) {
          var c = idOrCls;
          if (typeof idOrCls === "string") { try { c = window.AOGPop.classById(idOrCls); } catch (e) { c = null; } }
          if (!c) return [];
          return (c.members || []).map(function (m) { return { code: code(m), url: linkFor(c, m) }; });
        },
        linked: function () { return linked; },
        /* The exit slip asks for `locked()`; it had been falling through to a
           raw sessionStorage read that happened to use the same key. Two
           modules agreeing by coincidence is not an interface. */
        locked: function () { return linked; },
        param: PARAM
      };

      function init() {
        css();
        gateReads();
        watchGate();
        decorate();
        watchPanel();
        document.addEventListener("click", function (e) {
          var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="classes"], .dmode[data-mode="setup"]');
          if (t) setTimeout(decorate, 120);
        });
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 300); });
      else setTimeout(init, 300);
    })();
    