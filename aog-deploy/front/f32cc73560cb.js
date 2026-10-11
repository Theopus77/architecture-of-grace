
/* ============================================================
   CLASSROOM LINK LOCKS  (2026-08-23)
   A synced classroom link fixes the terms of the check-in and takes
   the student straight to it. Three things used to be open to them:
   the Window and Grade dropdowns (only pre-filled, so a Fall link
   could be answered as Spring), the At-home context toggle (which
   silently stops the row syncing at all), and Quick vs Thorough.
   A student sent a link by their teacher is not choosing any of
   that — and every extra choice is somewhere to wander instead of
   answering. Anything the link specifies becomes a fixed line or
   disappears; anything the teacher left open stays a real choice.
   ============================================================ */
(function () {
  var KEYS = { grade: "aog.launch.grade", window: "aog.launch.window", mode: "aog.launch.mode" };
  function ss(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function es() {
    try { return (typeof lang !== "undefined" && lang === "es")
      || (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) { return false; }
  }
  function syncedLink() { return ss("aog.launch.sync") === "on"; }
  function setByTeacher() { return es() ? "Definido por tu docente" : "Set by your teacher"; }

  function optionLabel(sel, value) {
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === value || sel.options[i].text === value) return sel.options[i].text;
    }
    return value;
  }
  function lockSelect(id, value) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var match = null;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === value || sel.options[i].text === value) { match = sel.options[i].value; break; }
    }
    /* A value this dropdown does not offer would strand the student on a screen
       they cannot complete. Leave the control free in that case. */
    if (match === null) return;
    sel.value = match;

    var fixed = document.getElementById(id + "Fixed");
    if (!fixed) {
      fixed = document.createElement("div");
      fixed.id = id + "Fixed";
      fixed.className = "aog-fixed-field";
      /* Two stacked lines, not a flex row: on a phone the value and the tag
         collided into "8SET BY YOUR TEACHER". Blocks cannot do that. */
      fixed.style.cssText = "padding:11px 13px;border:1px solid var(--rule,#E4DAC5);border-radius:8px;"
        + "background:var(--cream,#FBF8F1);";
      sel.parentNode.insertBefore(fixed, sel.nextSibling);
    }
    /* Idempotent: rewriting identical content on every pass re-fires any
       observer watching this subtree, which is how the first version of this
       code spun the page into a loop. */
    if (fixed.getAttribute("data-v") === match && fixed.getAttribute("data-l") === (es() ? "es" : "en")) {
      if (sel.style.display !== "none") { sel.style.display = "none"; }
      if (fixed.style.display === "none") { fixed.style.display = ""; }
      return;
    }
    fixed.setAttribute("data-v", match);
    fixed.setAttribute("data-l", es() ? "es" : "en");
    fixed.innerHTML = "";
    var v = document.createElement("div");
    v.style.cssText = "font-size:15.5px;font-weight:600;color:var(--ink,#26303f);line-height:1.3;";
    v.textContent = optionLabel(sel, match);
    var n = document.createElement("div");
    n.style.cssText = "margin-top:4px;font-size:10.5px;font-weight:700;letter-spacing:.09em;"
      + "text-transform:uppercase;color:var(--gold-deep,#9a6f24);line-height:1.3;";
    n.textContent = setByTeacher();
    fixed.appendChild(v); fixed.appendChild(n);

    sel.style.display = "none";
    sel.setAttribute("aria-hidden", "true");
    sel.setAttribute("tabindex", "-1");
    fixed.style.display = "";
  }
  function unlockSelect(id) {
    var sel = document.getElementById(id), fixed = document.getElementById(id + "Fixed");
    if (fixed) fixed.style.display = "none";
    if (sel && sel.getAttribute("aria-hidden") === "true") {
      sel.style.display = "";
      sel.removeAttribute("aria-hidden");
      sel.removeAttribute("tabindex");
    }
  }
  /* Home mode hides #window entirely and stamps today's date instead, so the
     lock stands down there or the screen would show two answers at once. */
  function homeMode() { try { return typeof context !== "undefined" && context === "home"; } catch (e) { return false; } }

  /* Quick vs Thorough: when the teacher has decided, the whole section goes.
     A student does not need to see a choice that was already made for them. */
  var _modeLocked = "";
  function lockMode(v) {
    if (v !== "rapid" && v !== "depth") { return false; }
    /* Always re-assert the value: startCheckin() and the reset path both put
       the chooser back and can move `mode`. Only the card repaint is guarded. */
    try { if (typeof mode !== "undefined" && mode !== v) mode = v; } catch (e) {}
    if (_modeLocked !== v) {
      _modeLocked = v;
      try {
        document.querySelectorAll("#modeGrid .mode-card").forEach(function (c) {
          var on = c.dataset.mode === v;
          c.classList.toggle("selected", on);
          c.setAttribute("aria-checked", on ? "true" : "false");
        });
      } catch (e) {}
    }
    ["modeChooseHead", "modeGrid"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.style.display !== "none") { el.style.display = "none"; }
    });
    return true;
  }

  var _inApply = false;
  function apply() {
    if (_inApply) { return; }
    _inApply = true;
    try {
      var g = ss(KEYS.grade), w = ss(KEYS.window), m = ss(KEYS.mode);
      if (g) { lockSelect("grade", g); } else { unlockSelect("grade"); }
      if (w && !homeMode()) { lockSelect("window", w); } else { unlockSelect("window"); }
      if (m) { lockMode(m); }

      /* A synced link is a school reflection. Letting a student switch to
         "At home" would keep the answers on the phone and send nothing. */
      if (syncedLink()) {
        try {
          if (typeof context !== "undefined" && context !== "school") {
            context = "school";
            if (typeof applyContext === "function") applyContext();
          }
        } catch (e) {}
        var blk = document.getElementById("ctxBlock");
        if (blk && blk.style.display !== "none") blk.style.display = "none";
      }
    } catch (e) {}
    _inApply = false;
  }
  try { window.aogApplyLaunchLocks = apply; } catch (e) {}

  /* Land on the reflection itself, not the "Who's checking in?" fork. A student
     handed a classroom link has no business choosing between the student
     reflection and the grown-ups' one — and picking wrong files their answers
     as an adult's. */
  var _landed = false;
  function goStraightToReflection() {
    if (_landed || !syncedLink()) return;
    var h = (location.hash || "").replace("#", "");
    if (h && h !== "checkin" && h !== "student") return;   // an explicit destination wins
    _landed = true;
    try { if (typeof startCheckin === "function") startCheckin(); } catch (e) {}
    setTimeout(apply, 60);
    setTimeout(apply, 400);
  }

  function boot() {
    apply();
    goStraightToReflection();
    try {
      var w = document.getElementById("screen-checkin") || document.getElementById("screen-welcome");
      if (w && window.MutationObserver) {
        /* attributes only. Watching childList/subtree here means apply()'s own
           DOM writes wake the observer that calls apply(). */
        new MutationObserver(function () { apply(); })
          .observe(w, { attributes: true, attributeFilter: ["class"] });
      }
    } catch (e) {}
    try { document.addEventListener("click", function () { setTimeout(apply, 60); }, true); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1200);
})();
