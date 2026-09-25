/* ══ AOG-MINE-V1 (2026-09-25) — WHAT I SENT, KEPT ON MY OWN DEVICE ═══════════
   Jimmy: "There is nothing on Student area in the DASHBOARD. The student /
   individual should be able to access their material in here as well."
   Every activity posts its result to the Sheet and keeps nothing, so a
   learner's own device could never show them their own work. This watches
   those posts (every activity page sends the same JSON: action "checkin") and
   keeps a copy in localStorage "aog.practice.mine" — the same row shape the
   Sheet stores, minus the write key. It never sends anything anywhere.
   The Inbox and My Blueprint read it beside rows pulled from the Sheet. ══ */
(function () {
  "use strict";
  if (window.__aogMine || !window.fetch) return;
  window.__aogMine = 1;
  var KEY = "aog.practice.mine", MAX = 800;
  function keep(p) {
    try {
      if (!p || p.action !== "checkin" || p.checkinType !== "practice" || !p.studentId) return;
      var row = {};
      for (var k in p) if (k !== "_backendAuth" && k !== "action") row[k] = p[k];
      if (typeof row.extra === "string" && row.extra.length > 20000) row.extra = "";
      row.timestamp = row.timestamp || new Date().toISOString();
      row.mine = true;
      var all = JSON.parse(localStorage.getItem(KEY) || "[]");
      var id = row.studentId + "|" + row.timestamp + "|" + (row.activityId || "");
      for (var i = 0; i < all.length; i++) if ((all[i].studentId + "|" + all[i].timestamp + "|" + (all[i].activityId || "")) === id) return;
      all.push(row);
      while (all.length > MAX) all.shift();
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch (e) {}
  }
  /* AOG-TESTRUN-V1 (2026-09-25) — the teacher trying an activity is not a
     student. With Test runs on (localStorage aog.testmode = "1", set from the
     dashboard), every send from any page goes to the Sheet under
     "<name> (test)", so it lands in its own lane and never in a real record. */
  function testOn() { try { return localStorage.getItem("aog.testmode") === "1"; } catch (e) { return false; } }
  var raw = window.fetch;
  window.fetch = function (url, opts) {
    try {
      var u = typeof url === "string" ? url : (url && url.url) || "";
      if (opts && /post/i.test(opts.method || "") && /script\.google(usercontent)?\.com\//.test(u) && typeof opts.body === "string" && opts.body.charAt(0) === "{") {
        var p = JSON.parse(opts.body);
        if (testOn() && p && p.action === "checkin" && p.studentId && !/\(test\)$/.test(String(p.studentId))) {
          p.studentId = String(p.studentId).trim() + " (test)";
          opts = Object.assign({}, opts, { body: JSON.stringify(p) });
          arguments[1] = opts;
        }
        keep(p);
      }
    } catch (e) {}
    return raw.apply(this, arguments);
  };
  /* a tag on every page while it is on, so nobody forgets */
  function badge() {
    if (!testOn() || !document.body || document.getElementById("aogTestBadge")) return;
    var b = document.createElement("button");
    b.id = "aogTestBadge"; b.type = "button";
    b.textContent = "TEST RUN · sends are marked (test) · tap to turn off";
    b.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:99998;background:#B3303F;color:#fff;border:0;border-radius:999px;padding:8px 14px;font:700 12px/1.2 system-ui,sans-serif;letter-spacing:.04em;box-shadow:0 4px 14px #0006;cursor:pointer";
    b.onclick = function () { if (confirm("Turn Test runs off? Sends will go under the real name again.")) { try { localStorage.removeItem("aog.testmode"); } catch (e) {} b.remove(); } };
    document.body.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", badge); else badge();
  window.aogTestBadge = badge;
})();
