
/* ============================================================================
   THE WAY IN, FOR A STUDENT WHO GOT HERE ON THEIR OWN — 2026-08-27.

   ⚠ THIS IS DELIBERATELY QUIETER THAN THE CHECK-IN DOOR ABOVE IT.
   #aogQuickDoor is a gold slab because the person reading it is upset right
   now and should not have to look for anything. The student opening an exit
   slip is not in that state — they are packing up. Two gold slabs would cost
   the first one the thing that makes it work, which is being the only loud
   object on the screen. So this is a line of text under it.

   The direct routes are still better where a teacher can set them up: the
   /exit and /endofday short links, and the classroom link.
============================================================================ */
(function () {
  function el(id) { return document.getElementById(id); }
  function es() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) { return false; } }
  function T(en, esx) { return es() ? esx : en; }

  function injectCss() {
    if (el("aogExitDoorCss")) return;
    var st = document.createElement("style");
    st.id = "aogExitDoorCss";
    st.textContent = [
      "#aogExitDoor{display:block;width:100%;max-width:560px;margin:-14px auto 26px;",
      "  border:0;background:none;padding:8px 6px;cursor:pointer;text-align:center;",
      "  font-family:inherit;font-size:15.5px;font-weight:650;color:var(--ink,#0A1E33);",
      "  text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1.5px;}",
      "#aogExitDoor .ed-s{display:block;font-size:13px;font-weight:500;color:var(--ink-faint,#646E86);",
      "  margin-top:4px;text-decoration:none;}",
      "#aogExitDoor:hover{color:var(--gold-deep,#8A6D1F);}",
      "#aogExitDoor:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:3px;border-radius:8px;}",
      "@media print{#aogExitDoor{display:none;}}"
    ].join("");
    document.head.appendChild(st);
  }
  function paint(b) {
    b.innerHTML = "";
    var t = document.createElement("span");
    t.textContent = T("Heading out? Close out your day \u2192", "\u00bfTe vas? Cierra tu d\u00eda \u2192");
    var sub = document.createElement("span");
    sub.className = "ed-s";
    sub.textContent = T("The end-of-day one. A minute or two.", "La del final del d\u00eda. Uno o dos minutos.");
    b.appendChild(t); b.appendChild(sub);
  }
  function place() {
    var b = el("aogExitDoor");
    if (b) { paint(b); return; }
    /* It rides UNDER the check-in door, so if that door has not been placed
       yet there is nothing to ride under and we wait for the next pass. */
    var above = el("aogQuickDoor");
    if (!above || !above.parentNode) return;
    injectCss();
    b = document.createElement("button");
    b.type = "button";
    b.id = "aogExitDoor";
    paint(b);
    above.parentNode.insertBefore(b, above.nextSibling);
    b.addEventListener("click", function () {
      try { if (typeof window.aogOpenExitSlip === "function") { window.aogOpenExitSlip(); return; } } catch (e) {}
      try { location.hash = "exit-slip"; } catch (e) {}
    });
  }
  function go() { try { place(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  setTimeout(go, 800); setTimeout(go, 2400);
  try {
    new MutationObserver(function () { try { var b = el("aogExitDoor"); if (b) paint(b); } catch (e) {} })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  } catch (e) {}
})();
