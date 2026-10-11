
(function () {
  "use strict";

  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function dayISO(d) {
    var m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function weekStart() {
    var d = new Date(), dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow); d.setHours(0, 0, 0, 0);
    return d;
  }

  function injectCss() {
    if (document.getElementById("aog-sl-css")) return;
    var s = document.createElement("style");
    s.id = "aog-sl-css";
    s.textContent = [
      ".aog-fhide{display:none !important;}",
      ".sl-bar{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin:0 0 14px;}",
      ".sl-bar label{font-size:10.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);}",
      ".sl-bar select{font:inherit;font-size:13px;font-weight:600;color:var(--navy,#0A1E33);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:9px;padding:7px 11px;}",
      ".sl-bar .sl-n{font-size:12.5px;color:var(--ink-soft,#5b6675);font-weight:600;}",
      ".sl-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px;}",
      ".sl-tag{font-size:10.5px;font-weight:700;border-radius:999px;padding:2px 9px;white-space:nowrap;}",
      ".sl-tag.ci{color:var(--navy,#0A1E33);background:var(--cream,#FBF8F1);border:1px solid var(--rule,#E4DAC5);}",
      ".sl-tag.fu{color:var(--gold-deep,#9a6f24);background:rgba(217,163,59,.15);border:1px solid var(--gold,#D9A33B);}",
      ".sl-tag.talk{color:var(--red,#8B2A2A);background:rgba(139,42,42,.10);border:1px solid var(--red,#8B2A2A);}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* Last check-in per student, from both stores, plus whether anyone recently
     asked to talk. One pass, cached per render. */
  function checkinIndex() {
    var idx = {};
    var today = dayISO(new Date());
    function note(sid, date, talk, rec) {
      if (!sid || !date) return;
      var e = idx[sid] || (idx[sid] = { last: "", talk: false, today: null });
      if (date > e.last) e.last = date;
      if (talk) e.talk = true;
      /* the LAST check-in of today is the one they walked out with */
      if (rec && date === today) e.today = rec;
    }
    var stu = jload("aog.checkin.student.v1", {}).logs || {};
    Object.keys(stu).forEach(function (sid) {
      Object.keys(stu[sid] || {}).forEach(function (d) {
        (stu[sid][d] || []).forEach(function (x) { note(sid, d, !!x.followUp, x); });
      });
    });
    var ad = jload("aog.daily.v1", {}).logs || {};
    Object.keys(ad).forEach(function (sid) {
      Object.keys(ad[sid] || {}).forEach(function (d) {
        ((ad[sid][d] || {}).periods || []).forEach(function (x) { note(sid, d, !!x.followUp); });
      });
    });
    return idx;
  }

  function whenWord(date) {
    if (!date) return "";
    var today = dayISO(new Date());
    var y = dayISO(new Date(Date.now() - 86400000));
    if (date === today) return T("today", "hoy");
    if (date === y) return T("yesterday", "ayer");
    var p = date.split("-");
    return p.length === 3 ? (parseInt(p[1], 10) + "/" + parseInt(p[2], 10)) : date;
  }

  var SL = { filter: "latest" };
  var SL_FILTERS = [
    /* One card per student — their newest reflection; earlier windows are one
       filter away under Everyone. The list stays unranked and rosterless. */
    { v: "latest", en: "Latest for each student",    es: "Lo más reciente de cada estudiante" },
    { v: "",       en: "Everyone",                   es: "Todos" },
    { v: "convo",  en: "Worth a conversation or more", es: "Vale una conversación o más" },
    { v: "fu",     en: "Follow-up marked",           es: "Con seguimiento" },
    { v: "week",   en: "Checked in this week",       es: "Registró esta semana" },
    { v: "talk",   en: "Asked to talk",              es: "Pidió hablar" }
  ];

  function decorate(host) {
    if (!host) return;
    injectCss();
    var rows = host.querySelectorAll(".fam-row");
    if (!rows.length) return;

    var idx = checkinIndex();
    var fu = (window.aogFollowUp && window.aogFollowUp.all) ? window.aogFollowUp.all() : {};
    var wk = dayISO(weekStart());

    Array.prototype.forEach.call(rows, function (row) {
      if (row.dataset.aogSl === "1") return;      /* decorate once per render */
      row.dataset.aogSl = "1";
      var name = row.getAttribute("data-name") || "";
      /* data-name is lowercased; the stores are keyed by the real code. */
      var sid = Object.keys(idx).concat(Object.keys(fu))
        .filter(function (k) { return String(k).toLowerCase() === name; })[0] || "";
      var ci = sid ? idx[sid] : null;
      var mark = sid ? fu[sid] : null;

      row.dataset.aogLast = (ci && ci.last) || "";
      row.dataset.aogFu = (mark && mark.state) || "";
      row.dataset.aogTalk = (ci && ci.talk) ? "1" : "";

      var tags = [];
      if (ci && ci.last) {
        tags.push('<span class="sl-tag ci">' + esc(T("Checked in ", "Registró ") + whenWord(ci.last)) + "</span>");
      } else {
        tags.push('<span class="sl-tag ci" style="opacity:.65;">' + esc(T("No check-ins yet", "Sin registros aún")) + "</span>");
      }
      if (ci && ci.talk) tags.push('<span class="sl-tag talk">' + esc(T("asked to talk", "pidió hablar")) + "</span>");
      /* What they are carrying out of today's check-in, so an adult can ask
         about it at the door. Computed from answers already on this device —
         nothing extra is stored and nothing extra is sent. */
      if (ci && ci.today && window.AOGCarry) {
        try {
          var cy = window.AOGCarry["for"](ci.today);
          var ttl = window.AOGCarry.moveTitle(cy);
          if (ttl) {
            window.AOGCarry.injectCss();
            tags.push('<span class="sl-tag cy">' + esc(T("carrying: ", "lleva: ") + ttl) + "</span>");
          }
        } catch (e) {}
      }
      if (mark && mark.state && window.aogFollowUp) {
        tags.push('<span class="sl-tag fu">' + esc(window.aogFollowUp.label(mark.state)) + "</span>");
      }

      var main = row.querySelector(".fr-focus") || row.querySelector(".fr-date") || row;
      var box = document.createElement("div");
      box.className = "sl-tags";
      box.innerHTML = tags.join("");
      if (main.parentNode) main.parentNode.insertBefore(box, main.nextSibling);
      else row.appendChild(box);
    });

    applyFilter(host);
    ensureBar(host);
  }

  function applyFilter(host) {
    var wk = dayISO(weekStart());
    var rows = host.querySelectorAll(".fam-row");
    var shown = 0;
    var seenName = {};
    Array.prototype.forEach.call(rows, function (row) {
      var hide = false;
      if (SL.filter === "latest") {
        /* aogReportList sorts by student, newest first — the first row of each
           data-name IS that student's latest. 279 cards became one per student. */
        var nm = row.getAttribute("data-name") || "";
        hide = !!seenName[nm];
        seenName[nm] = 1;
      } else if (SL.filter === "convo") {
        /* The band pill's own class carries the band. Reading the class means
           this never has to know the internal key names. */
        hide = !row.querySelector(".pill-amber, .pill-red");
      } else if (SL.filter === "fu")   hide = !row.dataset.aogFu;
      else if (SL.filter === "week")   hide = !(row.dataset.aogLast && row.dataset.aogLast >= wk);
      else if (SL.filter === "talk")   hide = !row.dataset.aogTalk;
      /* A class, not inline display — the search box above uses inline style,
         and the two must be able to hide a row independently. */
      row.classList.toggle("aog-fhide", hide);
      if (!hide) shown++;
    });
    var n = host.querySelector(".sl-n");
    if (n) n.textContent = shown + T(" shown", " visibles") + (SL.filter ? T(" of ", " de ") + rows.length : "");
  }

  function ensureBar(host) {
    if (host.querySelector(".sl-bar")) { applyFilter(host); return; }
    var card = host.querySelector(".table-card");
    var list = host.querySelector(".aog-report-rows");
    if (!card || !list) return;
    var bar = document.createElement("div");
    bar.className = "sl-bar";
    bar.innerHTML = '<label for="slFilter">' + esc(T("Show", "Mostrar")) + "</label>" +
      '<select id="slFilter">' + SL_FILTERS.map(function (f) {
        return '<option value="' + f.v + '"' + (f.v === SL.filter ? " selected" : "") + ">" + esc(T(f.en, f.es)) + "</option>";
      }).join("") + "</select>" +
      '<span class="sl-n"></span>' +
      '<span class="sl-n" style="opacity:.75;">· ' + esc((window.aogPopListNote && window.aogPopListNote(T)) || T(
        "no ranking, and no “missing” filter — this site keeps no roster, on purpose",
        "sin clasificación, y sin filtro de “faltantes” — este sitio no guarda listas, a propósito")) + "</span>";
    card.insertBefore(bar, list);
    var sel = bar.querySelector("#slFilter");
    if (sel) sel.addEventListener("change", function () { SL.filter = sel.value; applyFilter(host); });
    applyFilter(host);
  }

  /* aogReportList sets host.innerHTML, so decorate after it returns. */
  (function attach() {
    function go() {
      if (typeof window.aogReportList !== "function" || window.aogReportList.__aogSl) return;
      var orig = window.aogReportList;
      var wrapped = function (opts) {
        var r = orig.apply(this, arguments);
        try {
          var host = document.getElementById(opts && opts.hostId);
          if (host) setTimeout(function () { try { decorate(host); } catch (e) {} }, 0);
        } catch (e) {}
        return r;
      };
      wrapped.__aogSl = true;
      window.aogReportList = wrapped;
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 800);
    setTimeout(go, 2400);
  })();

  window.AOGStudentList = { decorate: decorate, index: checkinIndex,
                            setFilter: function (v) { SL.filter = v; } };
})();
