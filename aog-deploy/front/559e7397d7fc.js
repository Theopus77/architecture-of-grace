
/* ===================================================================
   ITEM 6 · ACCESSIBILITY toggles — menu open/close + persistent state
   =================================================================== */
(function () {
  function de(){ return document.documentElement; }
  function syncRows(){
    var c = de().classList.contains("a11y-contrast");
    var d = de().classList.contains("a11y-dyslexic");
    var r = de().classList.contains("a11y-read");
    var p = de().classList.contains("a11y-pictures");
    var cr = document.getElementById("a11yContrastRow");
    var dr = document.getElementById("a11yDyslexicRow");
    var rr = document.getElementById("a11yReadRow");
    var pr = document.getElementById("a11yPicRow");
    if (cr) cr.setAttribute("aria-checked", c ? "true" : "false");
    if (dr) dr.setAttribute("aria-checked", d ? "true" : "false");
    if (rr) rr.setAttribute("aria-checked", r ? "true" : "false");
    if (pr) pr.setAttribute("aria-checked", p ? "true" : "false");
    var btn = document.getElementById("a11yBtn");
    if (btn) btn.classList.toggle("active", c || d || r || p);
  }
  window.aogToggleContrast = function () {
    var on = de().classList.toggle("a11y-contrast");
    try { localStorage.setItem("aog.a11y.contrast", on ? "1" : "0"); } catch (e) {}
    syncRows();
  };
  window.aogToggleDyslexic = function () {
    var on = de().classList.toggle("a11y-dyslexic");
    try { localStorage.setItem("aog.a11y.dyslexic", on ? "1" : "0"); } catch (e) {}
    syncRows();
  };
  window.aogToggleReadAloud = function () {
    var on = de().classList.toggle("a11y-read");
    try { localStorage.setItem("aog.a11y.readaloud", on ? "1" : "0"); } catch (e) {}
    if (!on && "speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    if (typeof window.aogA11yEnhance === "function") window.aogA11yEnhance();
    syncRows();
  };
  window.aogTogglePictures = function () {
    var on = de().classList.toggle("a11y-pictures");
    try { localStorage.setItem("aog.a11y.pictures", on ? "1" : "0"); } catch (e) {}
    if (typeof window.aogA11yEnhance === "function") window.aogA11yEnhance();
    syncRows();
  };
  window.aogToggleA11yMenu = function (ev) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    var menu = document.getElementById("a11yMenu");
    var btn = document.getElementById("a11yBtn");
    if (!menu) return;
    var open = menu.hasAttribute("hidden");
    if (open) {
      menu.removeAttribute("hidden");
      /* On phones the menu is fixed-positioned (see CSS) — anchor its top under the button */
      if (btn && window.matchMedia && window.matchMedia("(max-width:600px)").matches) {
        var r = btn.getBoundingClientRect(); menu.style.top = Math.round(r.bottom + 8) + "px";
      } else { menu.style.top = ""; }
    } else { menu.setAttribute("hidden", ""); menu.style.top = ""; }
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    syncRows();
  };
  /* close on outside click or Escape */
  document.addEventListener("click", function (e) {
    var menu = document.getElementById("a11yMenu");
    if (!menu || menu.hasAttribute("hidden")) return;
    var wrap = e.target.closest && e.target.closest(".a11y-wrap");
    if (!wrap) { menu.setAttribute("hidden", ""); var b = document.getElementById("a11yBtn"); if (b) b.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var menu = document.getElementById("a11yMenu");
      if (menu && !menu.hasAttribute("hidden")) { menu.setAttribute("hidden", ""); var b = document.getElementById("a11yBtn"); if (b){ b.setAttribute("aria-expanded","false"); b.focus(); } }
    }
  });
  if (document.readyState !== "loading") syncRows();
  else window.addEventListener("load", syncRows);
})();
