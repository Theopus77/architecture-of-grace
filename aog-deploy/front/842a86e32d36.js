
/* ═══ THE STUDENT EVIDENCE DOOR · build .30eu ═══════════════════════════════
   One quiet link under each IEP student header to /student-evidence.html —
   the standalone Student Evidence page: one student's whole record on one
   page (timeline, goal connections, kept student voice, Meeting Mode, the
   Evidence Brief, and the district-template Case Manager Report). That page
   reads this device's stores READ-ONLY and re-derives no decision rules;
   this door's only act is setting the student-in-focus seam (AOGFocus, the
   adult-only default that travels between doors) so the page opens on the
   same student. Additive and fail-open: the same .iep-student-h anchor walk
   as the evidence loop and the Meeting Brief, painted behind their hosts;
   deleting this block costs the link and breaks nothing. */
(function () {
  "use strict";
  function T(en, es) {
    try { if (typeof dashLang !== "undefined" && dashLang === "es") return es; } catch (e) {}
    return en;
  }
  function css() {
    if (document.getElementById("aog-evd-css")) return;
    var st = document.createElement("style"); st.id = "aog-evd-css";
    st.textContent =
      "#panel-iep .evd-strip{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px;}" +
      "#panel-iep .evd-link{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:var(--navy,#0A1E33);text-decoration:none;border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:7px 15px;background:var(--card,#fff);white-space:nowrap;}" +
      "#panel-iep .evd-link:hover{border-color:var(--gold,#D9A33B);color:var(--gold-deep,#9a6f24);}" +
      ':root[data-theme="dark"] #panel-iep .evd-link{color:var(--cream,#F4EEE2);}' +
      ':root[data-theme="dark"] #panel-iep .evd-link:hover{color:var(--gold,#E7B85E);}' +
      "#panel-iep .evd-sub{font-size:11.5px;color:var(--ink-faint,#646E86);}" +
      "@media print{ #panel-iep .evd-strip{display:none !important;} }";
    document.head.appendChild(st);
  }
  /* Set the focus seam, then let the anchor navigate. Fail-open: a missing
     AOGFocus still opens the page — it just opens on its own default. */
  window.aogEvdOpen = function (sid) {
    try { if (window.AOGFocus && AOGFocus.set) AOGFocus.set(sid, "iep-evidence-door"); } catch (e) {}
    return true;
  };
  function stripHTML(sid) {
    var attr = encodeURIComponent(String(sid == null ? "" : sid));
    return '<div class="evd-strip">' +
      '<a class="evd-link" href="/student-evidence.html" ' +
      'onclick="return aogEvdOpen(decodeURIComponent(\'' + attr + '\'))">' +
      '\u25C8 ' + T("Student Evidence", "Evidencia del estudiante") +
      ' <span aria-hidden="true">\u2192</span></a>' +
      '<span class="evd-sub">' +
      T("The whole record on one page \u2014 timeline, goals, kept voice, Meeting Mode, Case Manager Report.",
        "Todo el expediente en una p\u00E1gina \u2014 l\u00EDnea de tiempo, metas, voz conservada, modo reuni\u00F3n, informe del case manager.") +
      "</span></div>";
  }
  function paint() {
    try {
      var body = document.getElementById("aogIepBody"); if (!body) return;
      css();
      var heads = body.querySelectorAll(".iep-student-h");
      for (var i = 0; i < heads.length; i++) {
        var hd = heads[i], sid = "";
        try { sid = String((hd.childNodes[0] && hd.childNodes[0].textContent) || "").trim(); } catch (e1) {}
        if (!sid || /^\(/.test(sid)) continue;
        /* paint after the evidence-loop and Meeting-Brief hosts, in that order */
        var anchor = hd, sib = hd.nextElementSibling;
        while (sib && sib.classList && (sib.classList.contains("evl-host") || sib.classList.contains("imb-host"))) {
          anchor = sib; sib = sib.nextElementSibling;
        }
        var host = anchor.nextElementSibling;
        if (!(host && host.classList && host.classList.contains("evd-host"))) {
          host = null;
          try {
            var probe = hd.parentNode ? hd.parentNode.querySelector('.evd-host[data-evdsid="' + (window.CSS && CSS.escape ? CSS.escape(sid) : sid) + '"]') : null;
            if (probe) host = probe;
          } catch (e2) {}
        }
        if (!host) {
          host = document.createElement("div");
          host.className = "evd-host";
          host.setAttribute("data-evdsid", sid);
          if (anchor.nextSibling) anchor.parentNode.insertBefore(host, anchor.nextSibling);
          else anchor.parentNode.appendChild(host);
        }
        var html = stripHTML(sid);
        if (host.__evdHTML !== html) { host.innerHTML = html; host.__evdHTML = html; }
      }
    } catch (e) {}
  }
  var rafQ = false;
  function queuePaint() {
    if (rafQ) return; rafQ = true;
    var done = false;
    function go() { if (done) return; done = true; rafQ = false; paint(); }
    try { if (window.requestAnimationFrame) requestAnimationFrame(go); } catch (e) {}
    setTimeout(go, 250);
  }
  function init() {
    try {
      var body = document.getElementById("aogIepBody");
      if (body && window.MutationObserver) {
        new MutationObserver(queuePaint).observe(body, { childList: true, subtree: true });
      }
      queuePaint();
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  try { window.AOGEvdDoor = { paint: paint, strip: stripHTML }; } catch (eX) {}
})();
