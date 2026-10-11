
(function () {
  /* LIGHT BY DEFAULT, DARK BY CHOICE — 2026-08-29. The site used to follow
     the device's own appearance when nobody had chosen, which meant every
     dark-set phone and Mac opened the dashboard and the reflections dark on
     sight ("the dashboard starts in dark mode", "a lot of the reflections
     start on dark mode for my students"). Print, contrast and legibility all
     default better in light; dark stays one tap away on the sun/moon toggle.
     The choice now lives in localStorage — the same ruling as the a11y
     preferences below: a preference should survive across sessions, not
     evaporate when the tab closes (it was sessionStorage, which is why the
     toggle never seemed to stick past a day). */
  var _0x6324bc = "light";
  try {
    var _0x567069 = localStorage.getItem("aog.theme") || sessionStorage.getItem("aog.theme");
    if (_0x567069 === "dark" || _0x567069 === "light") {
      _0x6324bc = _0x567069;
    }
  } catch (_0x54efd3) {}
  document.documentElement.setAttribute("data-theme", _0x6324bc);
})();
/* Item 6: apply saved accessibility preferences before first paint so there's no
   flash of un-adjusted UI. High-contrast and dyslexia-friendly font persist in
   localStorage (accessibility settings should survive across sessions). */
(function () {
  try {
    var de = document.documentElement;
    if (localStorage.getItem("aog.a11y.contrast") === "1") de.classList.add("a11y-contrast");
    if (localStorage.getItem("aog.a11y.dyslexic") === "1") de.classList.add("a11y-dyslexic");
    if (localStorage.getItem("aog.a11y.readaloud") === "1") de.classList.add("a11y-read");
    if (localStorage.getItem("aog.a11y.pictures") === "1") de.classList.add("a11y-pictures");
  } catch (_e) {}
})();
function applyTheme(_0x29d9d3) {
  document.documentElement.setAttribute("data-theme", _0x29d9d3 === "dark" ? "dark" : "light");
}
function toggleTheme() {
  var _0x53711b = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  var _0x524d5c = _0x53711b === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("aog.theme", _0x524d5c);
    sessionStorage.setItem("aog.theme", _0x524d5c);
  } catch (_0x9d0fe5) {}
  applyTheme(_0x524d5c);
}
