
/* ============================================================
   GRACE COMPASS REPORT RENDERER (Block C)
   Thin convenience wrapper around the live window.aogGraceCompass engine.
   Does NOT replace the engine; just renders it into a target container.
   ============================================================ */
function renderGraceCompassReport(rec, targetId, opts) {
  targetId = targetId || "grace-compass-report";
  var container = document.getElementById(targetId);
  if (!container) { console.warn("Grace Compass target element not found:", targetId); return; }
  var html = "";
  if (typeof window.aogGraceCompass === "function") {
    try { html = window.aogGraceCompass(rec, opts || {}); } catch (e) { html = ""; }
  }
  if (!html) {
    html = '<div class="aog-gc"><p style="color:#8B2A2A;">Grace Compass engine not available for this record.</p></div>';
  }
  container.innerHTML = html;
}

/* Call this when a check-in is completed to surface + scroll to the report. */
function showGraceCompassAfterCheckin(rec) {
  var target = document.getElementById("grace-compass-report");
  if (!target) {
    target = document.createElement("div");
    target.id = "grace-compass-report";
    document.body.appendChild(target);
  }
  renderGraceCompassReport(rec, "grace-compass-report");
  setTimeout(function () { try { target.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {} }, 300);
}

window.renderGraceCompassReport = renderGraceCompassReport;
window.showGraceCompassAfterCheckin = showGraceCompassAfterCheckin;
