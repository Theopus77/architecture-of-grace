
/* Bring the Personalize (accessibility) menu into the Quiet Space station, which hides
   the top bar. Reuses the one real menu (toggles + voice picker), then returns it home
   when the station closes so the top-bar button keeps working. */
window.aogStationA11y = function (ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  var menu = document.getElementById("a11yMenu");
  var wrap = document.getElementById("aogStA11yWrap");
  var btn = document.getElementById("aogStA11yBtn");
  if (!menu || !wrap) return;
  var willOpen = menu.hasAttribute("hidden");
  if (willOpen) {
    if (menu.parentNode !== wrap) wrap.appendChild(menu);
    menu.removeAttribute("hidden"); menu.style.top = "";
    try { if (window.aogPopulateVoices) window.aogPopulateVoices(); } catch (e) {}
  } else {
    menu.setAttribute("hidden", "");
  }
  if (btn) btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
};
function aogA11yMenuHome() {
  try {
    var menu = document.getElementById("a11yMenu");
    var home = document.getElementById("a11yBtn");
    if (menu && home && home.parentNode && menu.parentNode !== home.parentNode) home.parentNode.appendChild(menu);
    if (menu) menu.setAttribute("hidden", "");
    var sb = document.getElementById("aogStA11yBtn"); if (sb) sb.setAttribute("aria-expanded", "false");
  } catch (e) {}
}
(function () {
  function wrapClose() {
    if (typeof window.closeStationMode === "function" && !window.closeStationMode.__a11yWrapped) {
      var _c = window.closeStationMode;
      window.closeStationMode = function () { aogA11yMenuHome(); return _c.apply(this, arguments); };
      window.closeStationMode.__a11yWrapped = true;
    }
  }
  if (document.readyState !== "loading") wrapClose(); else document.addEventListener("DOMContentLoaded", wrapClose);
  window.addEventListener("load", wrapClose);
})();
