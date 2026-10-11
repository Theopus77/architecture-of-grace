
/* =========================================================================
   WHICH SHEET SCRIPT IS ACTUALLY DEPLOYED          built 2026-08-29 (.29e)

   Jimmy: "If we use google script, and change the backend code would it not
   work then?"

   The answer is no, and the reason is the point of this block. A deployed
   Apps Script Web App runs a PINNED VERSION — editing the file changes
   nothing until someone redeploys, and redeploying by editing the existing
   deployment keeps the same /exec URL. So a backend change can never break
   a school that has not taken it.

   ⚠ WHICH MEANS THE FAILURE MODE HERE IS SILENT STALENESS, NOT BREAKAGE.
   A school runs a year-old script, watches Pull quietly return nothing, and
   concludes the product is broken. Nothing could tell them otherwise.

   So the script now stamps its version onto EVERY reply, and this block
   reads it off traffic that already happens — a save, a pull, a Test
   connection — and says, in the Connect panel, whether the deployed script
   is the one this site expects.

   ⚠ THREE RULES.

   1 · NOTHING IS EVER GATED ON THE VERSION. An old script keeps working in
       both directions: a field it does not know is ignored, a field it
       expects but does not get is written blank. This block reports; it
       never blocks, never disables, never withholds.
   2 · A REPLY WITH NO `v` IS NOT AN ERROR. It means version 5 or older —
       the exact case this exists to surface — and it must read as "here is
       what to do", not as a fault.
   3 · IT COSTS NO REQUEST. Learning the version by firing our own probe
       would add a call that can fail on its own, on every dashboard load,
       for a diagnostic. The version rides on replies we already receive.
   ========================================================================= */
(function () {
  "use strict";

  /* ⚠ KEEP IN STEP WITH SCRIPT_VERSION IN AoG-Sheet-Sync-Code.gs.
     Bump both in the same edit, or this line starts lying. */
  /* ⚠⚠ BUMPED IN THE SAME EDIT AS SCRIPT_VERSION, ALWAYS — AND IT WAS NOT.
     Build .30k3, 2026-09-08. This line sat at 10 while the script reached
     15, so for five versions the sentence above it — "or this line starts
     lying" — was simply true. Nobody on v10 through v14 was ever told they
     were behind, because to this file they were not.

     WHAT THOSE FIVE VERSIONS CARRY, WHICH IS WHY THE SILENCE COST SOMETHING:
       v11  Release 2.0, the hardening pass — formula escape on every written
            string, body and field caps, unknown actions REJECTED instead of
            falling through to the screener write, a per-key rate limiter
       v12  teamEvidence / pullTeam. ⚠ THIS SITE'S OWN contribute door needs
            it. A colleague on v10 or v11 was told they were current while
            the feature they had been sent a link for could not write.
       v13  Daily Drafts routing
       v14  Daily Drafts routes all five subjects, and the Daily Drops tab
            names migrate
       v15  the composed `extra` JSON gets its own cap and is never sliced —
            the truncation that SILENTLY EMPTIED Science and Social Studies
            rows. A school below v15 loses those answers and is told nothing.
       v16  Spanish is subject six — dd-spanish files into its own Practice
            tab. A school below v16 still RECEIVES Spanish rows; they land in
            the plain Practice tab, which says honestly that they are not
            filed yet. Nothing is lost at v15, only untidy.

     ⚠ Raising this number turns the "out of date" notice back on for every
     school below 16, which is the entire point of the check and is why it
     must never be left to drift again. The ladder still fails open: an older
     script keeps writing and keeps pulling, it is only told what it is
     missing.
     ⚠⚠ IT DRIFTED ANYWAY, ON 2026-09-19. SCRIPT_VERSION in the .gs was
     raised to 16 and THIS was left at 15, so the card told Jimmy "v15 — up to
     date" about a script that was one behind, and would have called a correct
     v16 script "newer than this site expects". BUMP BOTH IN THE SAME EDIT.
     The .gs line to match is `var SCRIPT_VERSION = ` near its line 135. */
  var EXPECTED = 20;   /* v20 (2026-09-30): every tab made up front. v19: every course and Daily Drafts book gets its own tab; later courses file themselves. v17: Word Foundry tab */
  /* ⚠⚠ AOG-GS-FILENAME-V1 — THE DOWNLOAD NAMES ITS OWN VERSION, FROM HERE.
     Jimmy had NINE `AoG-Sheet-Sync-Code.gs` files in Downloads — (1), (2),
     (3), (4), _1, _2, -2 — spanning v8 to v15, and the only way to tell them
     apart was to open each one and read line 135. Chrome dedupes by adding
     "(4)", not by saying what changed, so the newest copy is not the one with
     the highest number. Publishing the version IN THE FILENAME is the fix.
     ⚠ It reads EXPECTED, the same constant the "out of date" banner uses, so
     it can never drift from the version this site actually ships — there is
     one number to bump, not two. */
  try { window.AOG_GS_VERSION = EXPECTED; } catch (e) {}
  var KEY = "aog.sync.scriptv";

  function isEs() {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
    catch (e) { return false; }
  }
  function T(en, es) { return isEs() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function load() {
    try { var o = JSON.parse(localStorage.getItem(KEY) || "null"); return (o && typeof o === "object") ? o : null; }
    catch (e) { return null; }
  }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  /* Deliberately NOT on the delete keep-list. It is a diagnostic about a
     connection, not a record of anything, and it is re-learned on the next
     save or pull. Wiping a device should take it. */

  var HOW = [
    "Open your Sheet, then Extensions ▸ Apps Script. Paste in the current Code.gs (downloadable from this panel), then Deploy ▸ Manage deployments ▸ the pencil ▸ Version: New version ▸ Deploy.",
    "Abre tu Hoja, luego Extensiones ▸ Apps Script. Pega el Code.gs actual (se descarga en este panel) y luego Implementar ▸ Administrar implementaciones ▸ el lápiz ▸ Versión: Nueva versión ▸ Implementar."
  ];
  var TRAP = [
    "⚠ Edit the deployment you already have. Choosing “New deployment” instead gives you a different /exec address, and every link and device you have handed out still points at the old one.",
    "⚠ Edita la implementación que ya tienes. Elegir «Nueva implementación» te da una dirección /exec distinta, y todos los enlaces y dispositivos que repartiste seguirán apuntando a la anterior."
  ];

  /* What we know, and what it means. `stale` is the only thing any other
     screen should branch on. */
  function state() {
    var rec = load();
    var connected = false;
    try { connected = !!(typeof syncDestinationConfigured === "function" && syncDestinationConfigured()); } catch (e) {}
    if (!rec || rec.v == null) {
      return { k: "unseen", connected: connected, expected: EXPECTED, stale: false,
               msg: T("Sheet script version — not seen yet. Press Test connection above, or pull once, and it will appear here.",
                      "Versión del script — aún no se ha visto. Presiona Probar conexión arriba, o trae datos una vez, y aparecerá aquí.") };
    }
    var v = +rec.v;
    if (!isFinite(v) || v <= 0) {
      return { k: "legacy", connected: connected, expected: EXPECTED, stale: true,
               short: T("Sheet script is out of date", "El script de la Hoja está desactualizado"),
               msg: T("Your Sheet script does not report a version, which means it is version 5 or older. Nothing is broken — it will keep saving — but anything added since then, including pulling exit slips back and the Invalid Date fix, will quietly do nothing. " + HOW[0],
                      "Tu script no informa su versión, así que es la 5 o anterior. Nada está roto — seguirá guardando — pero lo añadido desde entonces no hará nada. " + HOW[1]),
               trap: T(TRAP[0], TRAP[1]) };
    }
    if (v === EXPECTED) {
      return { k: "current", connected: connected, expected: EXPECTED, v: v, stale: false,
               msg: T("Sheet script v" + v + " — up to date.", "Script de la Hoja v" + v + " — al día.") };
    }
    if (v > EXPECTED) {
      return { k: "ahead", connected: connected, expected: EXPECTED, v: v, stale: false,
               msg: T("Sheet script v" + v + " — newer than this site expects (v" + EXPECTED + "). Nothing is wrong; the site will catch up.",
                      "Script de la Hoja v" + v + " — más nuevo de lo que este sitio espera (v" + EXPECTED + "). No pasa nada; el sitio se pondrá al día.") };
    }
    var behind = EXPECTED - v;
    return { k: "behind", connected: connected, expected: EXPECTED, v: v, stale: true,
             short: T("Sheet script v" + v + " · " + behind + (behind === 1 ? " version behind" : " versions behind"),
                      "Script de la Hoja v" + v + " · " + behind + (behind === 1 ? " versión atrás" : " versiones atrás")),
             msg: T("Sheet script v" + v + " — " + behind + (behind === 1 ? " version" : " versions") + " behind v" + EXPECTED + ". Nothing is broken and nothing is lost; anything added since v" + v + " will quietly do nothing until it is updated. " + HOW[0],
                    "Script de la Hoja v" + v + " — " + behind + (behind === 1 ? " versión" : " versiones") + " por detrás de la v" + EXPECTED + ". Nada está roto ni se pierde; lo añadido desde la v" + v + " no hará nada hasta actualizar. " + HOW[1]),
             trap: T(TRAP[0], TRAP[1]) };
  }

  /* ------------------------------------------------------------- learning
     Public, so anything that parses a reply can feed this without going
     near the wrapper below. */
  function note(v, vDate) {
    var n = +v;
    var rec = { v: isFinite(n) ? n : 0, d: String(vDate || "").slice(0, 10), at: new Date().toISOString() };
    var was = load();
    save(rec);
    if (!was || was.v !== rec.v) paint();
    return rec;
  }
  window.aogNoteScriptVersion = note;

  /* ⚠ A READ-ONLY WRAPPER ON fetch, AND IT MUST STAY READ-ONLY.
     It clones the response and looks at it; it never alters, delays or
     consumes the one the caller gets. Every step is inside try/catch and a
     failure means we simply do not learn the version this time.

     Why a wrapper rather than a call at each site: there are six places
     that parse a reply from the script (save, three pulls, the home pull,
     Test connection) and the one somebody forgets to update is exactly the
     path a stale school is sitting on.

     ⚠ clone() must happen BEFORE the caller reads the body. Our handler is
     attached here, before the promise is returned, so it runs first. */
  (function wrapFetch() {
    try {
      if (typeof window.fetch !== "function" || window.fetch.__aogVer) return;
      var real = window.fetch;
      var wrapped = function (input, init) {
        var p = real.apply(this, arguments);
        try {
          var url = String((input && input.url) || input || "");
          if (url.indexOf("script.google.com") > -1 && p && p.then) {
            p.then(function (res) {
              try {
                res.clone().text().then(function (txt) {
                  try {
                    var o = JSON.parse(txt);
                    if (o && typeof o === "object") {
                      /* a reply with no v at all IS the signal — v5 or older */
                      note(("v" in o) ? o.v : (("version" in o) ? o.version : 0), o.vDate || o.versionDate || "");
                    }
                  } catch (e) {}
                }, function () {});
              } catch (e) {}
            }, function () {});
          }
        } catch (e) {}
        return p;
      };
      wrapped.__aogVer = true;
      window.fetch = wrapped;
    } catch (e) {}
  })();

  /* ---------------------------------------------------------------- paint
     One line under the Connect panel's own status line. Anchored to
     #aogSyncCfgStatus's PARENT rather than to the panel, because
     aog-distribute-tabs moves the whole card into a pane — the status line
     travels with it, the panel does not. */
  function css() {
    if (document.getElementById("aog-scriptver-css")) return;
    var st = document.createElement("style");
    st.id = "aog-scriptver-css";
    st.textContent = [
      "#aogScriptVer{margin:10px 0 0;padding:10px 12px;border-radius:8px;line-height:1.55;",
        "font-size:12.5px;border:1px solid var(--rule,#E4DAC5);background:var(--card,#fff);color:var(--ink-soft,#46506E);}",
      "#aogScriptVer b{color:var(--ink,#16202B);}",
      "#aogScriptVer.stale{border-color:var(--amber,#B4802A);border-left:3px solid var(--amber,#B4802A);}",
      "#aogScriptVer .vtrap{display:block;margin-top:7px;color:var(--ink-faint,#6C7686);}",
      ":root[data-theme=\"dark\"] #aogScriptVer{background:#13202C;}",
      /* the quiet line on the exit panel — only ever drawn when behind */
      "#panel-exitslip .xv-sl.warn{color:var(--amber-deep,#8A6212);font-weight:700;}",
      ":root[data-theme=\"dark\"] #panel-exitslip .xv-sl.warn{color:#DDB05C;}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(st);
  }

  function paint() {
    try {
      var anchor = document.getElementById("aogSyncCfgStatus");
      if (!anchor || !anchor.parentNode) return;
      css();
      var st = state();
      var line = document.getElementById("aogScriptVer");
      if (!line) {
        line = document.createElement("p");
        line.id = "aogScriptVer";
        line.setAttribute("role", "status");
        anchor.parentNode.insertBefore(line, anchor.nextSibling);
      }
      line.className = st.stale ? "stale" : "";
      line.innerHTML = "<b>" + esc(T("Deployed script", "Script implementado")) + ".</b> " + esc(st.msg) +
        (st.trap ? '<span class="vtrap">' + esc(st.trap) + "</span>" : "");
    } catch (e) {}
  }

  /* No observer: the Connect card is static markup that only moves once,
     and a debounced repaint after any click inside the dashboard catches a
     tab switch without watching a subtree that re-renders on a keystroke. */
  var t = null;
  function schedule() { if (t) clearTimeout(t); t = setTimeout(function () { t = null; paint(); }, 320); }
  function init() {
    paint();
    try {
      document.addEventListener("click", function (e) {
        var s = document.getElementById("screen-admin");
        if (s && s.contains && e.target && s.contains(e.target)) schedule();
      }, true);
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 400); });
  else setTimeout(init, 400);

  window.AOGScriptVersion = {
    expected: EXPECTED,
    state: state,
    note: note,
    seen: load,
    paint: paint
  };
})();
