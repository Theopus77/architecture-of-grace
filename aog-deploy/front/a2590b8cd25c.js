
/* ============================================================
   DISTRIBUTE — remember the Classroom Link Generator fields
   The five inputs were already editable, but they reset on every
   reload, so a Class / Room ID had to be retyped each time. They
   now persist on this device and rebuild the link on any change.
   Nothing here is transmitted; the link still carries only
   district / school / grade / class / window.
   ============================================================ */
(function () {
  var IDS = ["lgDistrictId", "lgSchoolId", "lgGrade", "lgClassId", "lgWindow", "lgMode"];
  var KEY = "aog.lg.fields";
  function save() {
    var o = {};
    IDS.forEach(function (id) { var el = document.getElementById(id); if (el) o[id] = el.value; });
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }
  function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.value && typeof saved[id] === "string" && saved[id]) el.value = saved[id];
    });
  }
  function relink() {
    try { if (typeof renderClassroomLink === "function") renderClassroomLink(); } catch (e) {}
    syncNote();
  }
  /* Module-scoped, and the one line on this screen that makes a promise about
     where a child's answers go. Exported so it can be re-run and read back. */
  try { window.aogSyncNoteRefresh = function () { try { syncNote(); } catch (e) {} }; } catch (e) {}
  /* Says, right under the link, whether a link with THIS School ID will
     actually reach the Sheet. A School ID that is not on the deployed
     allowlist (or left blank) syncs nothing, and used to fail silently. */
  function syncNote() {
    try {
      var host = document.getElementById("lgCopyMsg");
      if (!host || !host.parentNode) return;
      var el = document.getElementById("lgSyncNote");
      if (!el) {
        el = document.createElement("div");
        el.id = "lgSyncNote";
        el.className = "small";
        el.style.cssText = "margin-top:4px;line-height:1.5;font-weight:600;";
        host.parentNode.insertBefore(el, host.nextSibling);
      }
      var d = window.AOG_SYNC_DEFAULTS;
      var sid = ((document.getElementById("lgSchoolId") || {}).value || "").trim();
      var saved = false;
      try { saved = !!localStorage.getItem("aog.sync.url"); } catch (e) {}

      /* ⚠ REWRITTEN 2026-08-28, for two reasons.
         · The registry: with several schools on one site, "your Sheet" is a
           question this note has to actually answer.
         · Team review item 8: this line went green and said "your Sheet"
           whenever the site published ANY destination, so a teacher who had
           connected nothing read it as confirmation that their own Sheet was
           receiving. It never was. Name the destination or admit you cannot. */
      var dest = null;
      try { dest = (typeof aogResolveDestination_ === "function") ? aogResolveDestination_() : null; } catch (e) {}
      var registry = !!(d && d.destinations);

      /* .29ai \u2014 answered FIRST because it is the strongest case and the one
         the other branches would describe wrongly. This computer has a Sheet
         AND a write key, so the link being generated carries the destination
         with it: nothing has to be published site-wide, and nothing has to be
         sent to anyone. The old text below said a student\u2019s phone would not
         sync, which stopped being true here. */
      var carries = "";
      try { carries = (typeof aogDestParam_ === "function") ? aogDestParam_() : ""; } catch (e) {}
      if (carries) {
        var _cu = ""; try { _cu = localStorage.getItem("aog.sync.url") || ""; } catch (e) {}
        el.style.color = "var(--green,#2E6B3A)";
        el.textContent = "\u2713 This link carries your own Sheet with it (" + aogSyncHost_(_cu) +
          "), so a student Chromebook or a family phone that has never opened this dashboard still syncs. Hand the link out the way you would hand out the key itself.";
        return;
      }

      if (registry) {
        if (dest) {
          el.style.color = "var(--green,#2E6B3A)";
          el.textContent = "\u2713 This link syncs to: " + (dest.label || dest.orgId) + ".";
        } else {
          el.style.color = "var(--amber,#8A6D1F)";
          el.textContent = "\u26A0 No Destination ID is set for this computer, so this link will NOT sync \u2014 answers stay on each device. Set it under Connect your Sheet.";
        }
        return;
      }

      if (!d || !d.url) {
        el.style.color = "var(--ink-faint)";
        el.textContent = saved
          ? "This device is connected, so it syncs \u2014 but a student\u2019s phone will not. Add your write key under Connect your Sheet and the links you hand out will carry the destination with them."
          : "No Sheet is connected. Responses stay on each device.";
        return;
      }
      var names = d.schools || [];
      var list = names.map(function (v) { return String(v).trim().toLowerCase(); });
      var anyId = list.indexOf("*") !== -1;
      if (anyId || (sid && list.indexOf(sid.toLowerCase()) !== -1)) {
        el.style.color = "var(--green,#2E6B3A)";
        /* Whose Sheet, plainly. In legacy mode there is exactly one, and it
           belongs to whoever runs this site \u2014 which is only "yours" if that
           is you. */
        el.textContent = saved
          ? "\u2713 Anyone who opens this link syncs to the Sheet this site publishes."
          : "\u2713 Anyone who opens this link syncs to the Sheet this site publishes \u2014 which is not necessarily your own. This computer has no connection saved, so you cannot read those answers back here.";
      } else if (sid) {
        el.style.color = "var(--amber,#8A6D1F)";
        el.textContent = "\u26A0 School ID \u201C" + sid + "\u201D is not on the sync list (" + names.join(", ") + "), so this link will NOT reach the Sheet.";
      } else {
        el.style.color = "var(--amber,#8A6D1F)";
        el.textContent = "\u26A0 School ID is blank, so this link will NOT sync. Use one of: " + names.join(", ") + ".";
      }
    } catch (e) {}
  }
  /* The Destination ID field re-runs this after a change. */
  try { window.aogSyncNoteRefresh = syncNote; } catch (e) {}
  function bind() {
    IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.getAttribute("data-lg-bound")) return;
      el.setAttribute("data-lg-bound", "1");
      ["input", "change", "blur"].forEach(function (ev) {
        el.addEventListener(ev, function () { save(); relink(); });
      });
    });
    load();
    relink();
  }
  function boot() {
    bind();
    var tab = document.querySelector('.tab[data-tab="distribute"]');
    if (tab && !tab.getAttribute("data-lg-tab")) {
      tab.setAttribute("data-lg-tab", "1");
      tab.addEventListener("click", function () { setTimeout(bind, 40); });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1500);
})();
