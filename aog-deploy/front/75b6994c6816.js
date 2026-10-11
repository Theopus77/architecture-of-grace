
/* ============================================================================
   A WAY OUT OF THE READING — 2026-08-25.

   Jimmy: "There is too much on this page, if a student is popping on his
   chromebook to do a check-in. it needs to take him directly to the daily
   in-the-moment check-in… for they are already dysregulated. They are not the
   best readers. They are 12-15 years old."

   screen-checkin is the SELF-REFLECTION's intro — the twice-a-year one. It
   opens with a serif headline, three sentences of italic, a "Before you begin"
   box, a privacy line and a note about how the questions were written. That is
   defensible for a reflection a class sits down to do together. It is the wrong
   thing entirely in front of a kid who is upset right now.

   This does not touch the reflection or its copy. It puts one plain, high-
   contrast door at the very top of that screen: eight words, no italics, and
   it lands on question one of the daily check-in.

   The properly direct routes still exist and are better when a teacher can set
   them up: the student check-in link, and the /checkin and /now short links in
   _redirects. This is for the student who got here on their own.
============================================================================ */
(function () {
  function el(id) { return document.getElementById(id); }
  function es() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0,2) === "es"; } catch (e) { return false; } }
  function T(en, esx) { return es() ? esx : en; }

  function injectCss() {
    if (el("aogQuickDoorCss")) return;
    var st = document.createElement("style");
    st.id = "aogQuickDoorCss";
    st.textContent = [
      "#aogQuickDoor{display:block;width:100%;max-width:560px;margin:0 auto 26px;",
      "border:0;border-radius:16px;padding:20px 24px;cursor:pointer;text-align:center;",
      "background:var(--gold,#D9A33B);color:#0A1E33;font-family:inherit;}",
      "#aogQuickDoor .qd-t{display:block;font-size:21px;font-weight:800;letter-spacing:-.01em;line-height:1.25;}",
      "#aogQuickDoor .qd-s{display:block;font-size:14px;font-weight:600;opacity:.78;margin-top:5px;}",
      "#aogQuickDoor:hover{filter:brightness(1.04);}",
      "#aogQuickDoor:active{transform:translateY(1px);}",
      "@media (max-width:520px){#aogQuickDoor{padding:17px 16px;}#aogQuickDoor .qd-t{font-size:19px;}}",
      "@media print{#aogQuickDoor{display:none;}}",
      "@media (prefers-reduced-motion:reduce){#aogQuickDoor:active{transform:none;}}"
    ].join("");
    document.head.appendChild(st);
  }

  function paint() {
    var b = el("aogQuickDoor"); if (!b) return;
    /* Short words on purpose. This is read by someone who does not want to read. */
    b.querySelector(".qd-t").textContent = T("I just need to check in →", "Solo quiero registrarme →");
    b.querySelector(".qd-s").textContent = T("Quick. About four minutes.", "Rápido. Unos cuatro minutos.");
  }

  function place() {
    var scr = el("screen-checkin");
    if (!scr || el("aogQuickDoor")) { paint(); return; }
    injectCss();
    var b = document.createElement("button");
    b.type = "button";
    b.id = "aogQuickDoor";
    b.innerHTML = '<span class="qd-t"></span><span class="qd-s"></span>';
    paintInto(b);
    /* Above everything, including the headline — the point is not having to
       scroll past the reading to find it. */
    var inner = scr.querySelector(".wrap, .container, section, div") || scr;
    (inner === scr ? scr : inner).insertBefore(b, (inner === scr ? scr : inner).firstChild);
    b.addEventListener("click", function () {
      try { if (typeof window.aogOpenDailyCheckin === "function") { window.aogOpenDailyCheckin(); return; } } catch (e) {}
      try { location.hash = "daily-checkin"; } catch (e) {}
    });
  }
  function paintInto(b) {
    b.querySelector(".qd-t").textContent = T("I just need to check in →", "Solo quiero registrarme →");
    b.querySelector(".qd-s").textContent = T("Quick. About four minutes.", "Rápido. Unos cuatro minutos.");
  }

  function go() { try { place(); paint(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  setTimeout(go, 700); setTimeout(go, 2200);
  try { new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}

  window.AOGQuickDoor = { place: place };
})();
