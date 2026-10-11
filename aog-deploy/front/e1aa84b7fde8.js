
    /* =====================================================================
       A QUIET SPACE DOOR ON THE CHECK-IN  ·  2026-08-28

       The site header is now hidden while a student is taking the daily
       check-in, which reclaims 148 px on an iPhone. That header carried the
       only link to the Quiet Space, and the check-in is the single screen in
       this product where a student is most likely to need it — it is the one
       that asks how they are arriving and whether something is making today
       harder. Hiding the door on that screen would be the wrong trade.

       Same decision, and the same wording, as the reflection: nobody should
       have to finish or abandon a check-in to reach the regulation tools.
       If a future change removes this, it must put the door somewhere else
       first.

       Re-attached on a MutationObserver because each question replaces the
       section's contents, which takes any child with it.
       ===================================================================== */
    (function () {
      "use strict";
      var SEC = "screen-daily-checkin";

      function isEs() { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
      function label() { return isEs() ? "Espacio Tranquilo" : "Quiet Space"; }

      function css() {
        if (document.getElementById("aog-ci-calm-css")) return;
        var st = document.createElement("style");
        st.id = "aog-ci-calm-css";
        st.textContent = [
          /* ⚠ THIS DOOR WAS DRAWN FOR A NAVY STRIP THAT NO LONGER EXISTS.
             The check-in used to paint its own dark header band, and this
             button was light text on rgba(255,255,255,.10) against it. When
             the two screens became one product language (see <script
             id="aog-ds">) that band became the exit slip's ribbon on paper —
             and light-on-white is invisible, which is the same class of bug
             as writing navy on a dark card. Scope a color to the surface it
             was chosen against; the surface changed, so the color did.

             ⚠ STILL ANCHORED TO .sc-top, NOT THE SECTION. Positioned against
             the section it lands at the bottom of the whole stage — floating
             over nothing, which is where it went on the code-entry screen.
             It belongs on the header row, so the header row is the containing
             block and reserves room for it. It costs no vertical space, which
             was the whole point of hiding the site header. */
          "#" + SEC + " .sc-top{position:relative;}",
          "#" + SEC + " .aog-ci-calm{position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:4;",
          "  display:none;align-items:center;gap:6px;",
          "  font-family:inherit;font-size:12.5px;font-weight:600;line-height:1;",
          "  color:var(--aog-dusk,#4C3F6B);background:var(--aog-pale,#F0ECF7);",
          "  border:1.5px solid var(--rule);border-radius:999px;",
          "  padding:7px 12px;cursor:pointer;}",
          "#" + SEC + " .aog-ci-calm:hover{border-color:var(--aog-dusk,#4C3F6B);}",
          "#" + SEC + " .aog-ci-calm:focus-visible{outline:3px solid var(--aog-dusk,#4C3F6B);outline-offset:2px;}",
          "#" + SEC + " .aog-ci-calm svg{width:13px;height:13px;display:block;}",
          /* Only where the header is actually hidden. On a desktop the topbar
             is still there and still carries the link. */
          "@media (max-width:600px){ body.aog-survey-focus #" + SEC + " .aog-ci-calm{display:inline-flex;} }",
          /* Room for it, so the beat ribbon and the question count stop short
             of the door instead of running underneath it. */
          "@media (max-width:600px){ body.aog-survey-focus #" + SEC + " .sc-top .container,",
          "  body.aog-survey-focus #" + SEC + " .sc-ribbon,",
          "  body.aog-survey-focus #" + SEC + " .sc-meta{padding-right:128px;} }",
          "#" + SEC + "{position:relative;}",
          "@media print{ #" + SEC + " .aog-ci-calm{display:none !important;} }"
        ].join("\n");
        document.head.appendChild(st);
      }

      function attach() {
        var sec = document.getElementById(SEC);
        if (!sec) return;
        /* Only on the question screens. The thank-you and the returning-today
           card are their own thing and already end in real buttons. */
        if (sec.classList.contains("sc-free")) {
          var old = sec.querySelector(".aog-ci-calm");
          if (old) old.remove();
          return;
        }
        if (!sec.querySelector(".sc-top")) return;
        var have = sec.querySelector(".aog-ci-calm");
        if (have) { have.querySelector("span").textContent = label(); return; }

        var top = sec.querySelector(".sc-top");
        var b = document.createElement("button");
        b.type = "button";
        b.className = "aog-ci-calm";
        b.title = isEs() ? "Espacio Tranquilo — una pausa ahora mismo" : "Quiet Space — an in-the-moment reset";
        b.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 3a6 6 0 0 0-6 6c0 4 6 9 6 9s6-5 6-9a6 6 0 0 0-6-6z"/><circle cx="12" cy="9" r="1.5"/></svg>' +
          "<span>" + label() + "</span>";
        b.addEventListener("click", function () {
          if (typeof window.showStationMode === "function") window.showStationMode();
          else if (typeof window.openRightNow === "function") window.openRightNow();
        });
        (top || sec).appendChild(b);
      }

      function init() {
        css();
        attach();
        var sec = document.getElementById(SEC);
        if (sec && window.MutationObserver) {
          try {
            new MutationObserver(function () { attach(); })
              .observe(sec, { childList: true, subtree: false, attributes: true, attributeFilter: ["class"] });
          } catch (e) {}
        }
        try {
          new MutationObserver(function () { attach(); })
            .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
        } catch (e) {}
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 260); });
      else setTimeout(init, 260);
    })();
    