
    /* =====================================================================
       THE DESTINATION ID  ·  2026-08-28

       One field, one localStorage key, and the thing that lets more than one
       school use this site without a second copy of it.

       It is NOT a credential. It selects an entry in the published config and
       nothing else; anyone can read it out of a link. What stops a stranger
       posting into a school's Sheet is the same thing that always did — they
       would need a link that was handed to them, and the write key, which is
       already public and already unvalidated. See the security notes in
       aog-sync-config.js. What the id DOES buy is that a link can only ever
       reach the Sheet it names, and a link that names nothing reaches none.

       ⚠ It is deliberately not the School ID from the Distribute card. That
       field is free text a teacher types for their own labeling; routing on
       it would mean a typo could land one district's children in another
       district's spreadsheet. See aogResolveDestination_.
       ===================================================================== */
    (function () {
      "use strict";
      var KEY = "aog.org.id";
      function el(id) { return document.getElementById(id); }
      function isEs() { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
      function T(en, es) { return isEs() ? es : en; }

      function load() { try { return String(localStorage.getItem(KEY) || "").trim(); } catch (e) { return ""; } }
      function save(v) {
        try {
          v = String(v || "").trim().slice(0, 64);
          if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY);
        } catch (e) {}
      }

      /* What this device will actually do, in a sentence a teacher can act on.
         The three states are genuinely different and a vague "connected" would
         hide the one that matters. */
      function note() {
        var host = el("aogOrgIdNote");
        if (!host) return;
        var d = null;
        try { d = (typeof aogResolveDestination_ === "function") ? aogResolveDestination_() : null; } catch (e) {}
        var cfg = window.AOG_SYNC_DEFAULTS;
        var registry = !!(cfg && cfg.destinations);

        if (!registry) {
          host.style.color = "var(--ink-faint)";
          host.textContent = T(
            "This site publishes a single destination, so an ID is not needed here. Leave it blank.",
            "Este sitio publica un único destino, así que no hace falta un identificador. Déjalo en blanco.");
          return;
        }
        if (!d) {
          /* ⚠ Say the consequence, not the state. "No destination" means a
             teacher's class will quietly work and quietly keep everything. */
          host.style.color = "var(--amber,#8A6D1F)";
          host.textContent = load()
            ? T("No destination matches that ID, so nothing will be sent — the reflection and check-in still work and stay on each device. Check the ID with whoever runs this site.",
                "Ningún destino coincide con ese identificador, así que no se enviará nada — la autorreflexión y el registro siguen funcionando y se quedan en cada dispositivo. Confirma el identificador con quien administra este sitio.")
            : T("No ID set, so nothing will be sent — the reflection and check-in still work and stay on each device. Ask whoever runs this site for your school's ID.",
                "Sin identificador no se enviará nada — la autorreflexión y el registro siguen funcionando y se quedan en cada dispositivo. Pide a quien administra este sitio el de tu escuela.");
          return;
        }
        host.style.color = "var(--green,#2E6B3A)";
        host.textContent = T(
          "Links you hand out will reach: " + (d.label || d.orgId) + ".",
          "Los enlaces que repartas llegarán a: " + (d.label || d.orgId) + ".");
      }

      function wire() {
        var i = el("aogOrgId");
        if (!i || i.__wired) return;
        i.__wired = true;
        i.value = load();
        i.addEventListener("input", function () {
          save(i.value);
          /* Re-resolve from scratch: SCHOOL_SYNC_URL may have been set from a
             previous id and must not survive a change of school. */
          try {
            if (typeof SCHOOL_SYNC_URL !== "undefined" && window.AOG_SYNC_SOURCE !== "this device") {
              SCHOOL_SYNC_URL = ""; SCHOOL_SYNC_KEY = "";
            }
            if (typeof aogApplySyncDefaults === "function") aogApplySyncDefaults();
          } catch (e) {}
          note();
          try { if (typeof window.aogSyncNoteRefresh === "function") window.aogSyncNoteRefresh(); } catch (e) {}
        });
        note();
      }

      function init() {
        wire();
        document.addEventListener("click", function (e) {
          var t = e.target && e.target.closest && e.target.closest(".tab[data-tab='distribute'], .dmode[data-mode='setup']");
          if (t) setTimeout(function () { wire(); note(); }, 60);
        });
        try {
          new MutationObserver(function () { note(); })
            .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
        } catch (e) {}
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 200); });
      else setTimeout(init, 200);

      window.AOGOrg = { get: load, set: function (v) { save(v); note(); }, note: note };
    })();
    