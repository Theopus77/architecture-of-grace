
/* ═══════════════════════════════════════════════════════════════════════════
   ONE OBSERVATION, THREE STATES · build 2026.08.29av

   Saw it · Did not see it · No opportunity — for ONE observation, on ONE goal,
   for ONE student, and only when a case manager has asked for it.

   ⚠ "NO OPPORTUNITY" IS THE WHOLE FEATURE. Without it, an unticked box means
   three different things and every denominator built on it is a fiction.
   ⚠ A DAY IS A PROPOSAL. Nothing reaches the aimline until a person accepts it,
   one day at a time, and what lands is stamped so it can be told apart from a
   measurement a teacher took. [[aog-signed-iep-rule]]
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var KEY  = "aog.iep.track.v1";
  var IEPK = "aog.iep.v1";
  var DAILY = "aog.daily.v1";

  function isEs() {
    try { if (typeof dashLang !== "undefined" && dashLang === "es") return true; } catch (e) {}
    return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es";
  }
  function T(en, es) { return isEs() ? es : en; }
  function esc(x) {
    return String(x == null ? "" : x).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function jload(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return (v == null) ? d : v; } catch (e) { return d; } }
  function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function shortD(iso) { var p = String(iso || "").slice(0, 10).split("-"); return p.length === 3 ? ((+p[1]) + "/" + (+p[2])) : String(iso || ""); }  /* .30cy: slice first — full-ISO dates from the Sheet printed 8/NaN */

  function store() { var s = jload(KEY, {}) || {}; if (!s.cfg) s.cfg = {}; return s; }
  function cfgFor(goalId) { return (store().cfg || {})[goalId] || null; }
  function setCfg(goalId, k) {
    var s = store();
    if (!k) delete s.cfg[goalId]; else s.cfg[goalId] = { k: k, on: true };
    jsave(KEY, s); return cfgFor(goalId);
  }
  function iep() { var v = jload(IEPK, {}) || {}; if (!v.goals) v.goals = {}; if (!v.data) v.data = {}; return v; }
  function goalOf(id) { return iep().goals[id] || null; }

  /* ⚠ trials and steps ONLY. Their value/total pair is precisely what a day of
     three-state answers produces. A percent or a words-per-minute goal cannot
     be filled from a tally and is told so rather than quietly offered a number
     that means something else. */
  function acceptable(g) { return !!g && (g.measure === "trials" || g.measure === "steps"); }

  function obsItems() {
    try {
      var band = "68";
      try { band = (localStorage.getItem("aog.checkin.band") || "68"); } catch (e) {}
      return (window.AOG_OBS.items(band, isEs()) || []);
    } catch (e) { return []; }
  }
  function obsLabel(k) {
    var hit = obsItems().filter(function (i) { return i.k === k; })[0];
    return hit ? hit.q : k;
  }

  /* ── which goal, if any, a student is tracked on ───────────────────────── */
  function forStudent(sid) {
    sid = String(sid == null ? "" : sid).trim();
    if (!sid) return null;
    var st = iep(), cfg = store().cfg || {}, out = null;
    Object.keys(cfg).forEach(function (gid) {
      if (out) return;
      var g = st.goals[gid];
      if (!g || g.archived) return;
      if (String(g.student || "").trim().toLowerCase() !== sid.toLowerCase()) return;
      out = { goalId: gid, k: cfg[gid].k, g: g };
    });
    return out;
  }

  /* ═════════════════════════ THE FORM, on the support check-in */
  var STATES = [
    { v: "saw",   en: "Saw it",            es: "Lo vi" },
    { v: "no",    en: "Did not see it",    es: "No lo vi" },
    { v: "noopp", en: "No opportunity",    es: "No hubo ocasión" }
  ];
  function formHtml(sid) {
    var t = forStudent(sid);
    if (!t) return "";
    return '<div class="iept" data-goal="' + esc(t.goalId) + '" data-k="' + esc(t.k) + '">' +
      '<p class="iept-head">' + esc(T("One thing this student's team is tracking",
                                      "Una cosa que el equipo de este estudiante está siguiendo")) + "</p>" +
      '<p class="iept-q">' + esc(obsLabel(t.k)) + "</p>" +
      '<div class="iept-btns">' + STATES.map(function (st) {
        return '<button type="button" class="iept-b" data-iept="' + st.v + '">' + esc(T(st.en, st.es)) + "</button>";
      }).join("") + "</div>" +
      /* ⚠ THE SENTENCE THAT MAKES THE DENOMINATOR HONEST. Without it an adult
         reads "Did not see it" as a judgement and leaves it blank, and the
         ambiguity this whole feature exists to remove walks straight back in. */
      '<p class="iept-say">' + esc(T(
        "“No opportunity” means the moment never came up — it is not a blank and it is not a negative. It is the answer that keeps the count honest, and it is counted out, not counted against.",
        "“No hubo ocasión” significa que el momento no se presentó — no es un vacío ni algo negativo. Es la respuesta que mantiene el conteo honesto, y se excluye, no se cuenta en contra.")) + "</p>" +
      "</div>";
  }
  /* Read by the check-in's save path. Returns null unless a state was chosen. */
  function readForm() {
    var box = document.querySelector("#aogIepTrackSlot .iept");
    if (!box) return null;
    var on = box.querySelector(".iept-b.on");
    if (!on) return null;
    return { goalId: box.getAttribute("data-goal"), k: box.getAttribute("data-k"), state: on.getAttribute("data-iept") };
  }

  function paintForm() {
    var slot = el("aogIepTrackSlot");
    if (!slot) return;
    var sel = el("ciStudent"), typed = el("ciStudentTyped");
    var sid = (sel && sel.value && sel.value !== "_typed" ? sel.value : "") || (typed ? typed.value.trim() : "");
    var html = formHtml(sid);
    if (slot.getAttribute("data-for") === sid && slot.innerHTML) return;
    slot.setAttribute("data-for", sid);
    slot.innerHTML = html;
    slot.querySelectorAll("[data-iept]").forEach(function (b) {
      b.addEventListener("click", function () {
        var was = b.classList.contains("on");
        slot.querySelectorAll("[data-iept]").forEach(function (x) { x.classList.remove("on"); });
        if (!was) b.classList.add("on");   /* tapping the chosen one clears it */
      });
    });
  }

  /* ═════════════════════════ THE TALLY — a day at a time, never a total */
  function tally(goalId) {
    var st = iep(), g = st.goals[goalId];
    if (!g) return [];
    var sid = String(g.student || "").trim();
    var logs = (jload(DAILY, {}).logs || {})[sid] || {};
    var byDay = {};
    Object.keys(logs).forEach(function (date) {
      ((logs[date] || {}).periods || []).forEach(function (p) {
        var go = p.goalObs;
        if (!go || go.goalId !== goalId || !go.state) return;
        var d = byDay[date] || (byDay[date] = { date: date, saw: 0, no: 0, noopp: 0, roles: {} });
        if (go.state === "saw") d.saw++;
        else if (go.state === "no") d.no++;
        else if (go.state === "noopp") d.noopp++;
        var r = String(p.respondentRole || "").trim();
        if (r && go.state !== "noopp") d.roles[r] = (d.roles[r] || 0) + 1;
      });
    });
    /* ⚠ "No opportunity" IS EXCLUDED FROM THE DENOMINATOR. That is the whole
       point of asking for it. A day where the moment never arose contributes
       nothing rather than contributing a zero. */
    var already = {};
    (st.data[goalId] || []).forEach(function (p) { if (p && p.date) already[p.date] = true; });
    return Object.keys(byDay).sort().map(function (d) {
      var row = byDay[d];
      row.total = row.saw + row.no;
      row.accepted = !!already[d];
      row.adults = Object.keys(row.roles).length;
      return row;
    }).filter(function (r) { return r.total > 0; });
  }

  /* ═════════════════════════ ACCEPT — one day, by a person, stamped */
  function accept(goalId, date) {
    var st = iep(), g = st.goals[goalId];
    if (!g || !acceptable(g)) return false;
    var row = tally(goalId).filter(function (r) { return r.date === date; })[0];
    if (!row || !row.total) return false;
    if (!st.data[goalId]) st.data[goalId] = [];
    if (st.data[goalId].some(function (p) { return p && p.date === date; })) return false;
    st.data[goalId].push({
      date: date, value: row.saw, total: row.total,
      year: (window.AOGYear ? AOGYear(date) : ""),
      /* ⚠ THE STAMP. A point assembled from other adults' answers must be
         tellable from one a teacher measured, everywhere it renders. */
      src: "team",
      note: T("From the support check-in · " + row.saw + " of " + row.total + " opportunities · " + row.adults + (row.adults === 1 ? " adult" : " adults"),
              "Del registro de apoyo · " + row.saw + " de " + row.total + " ocasiones · " + row.adults + (row.adults === 1 ? " adulto" : " adultos"))
    });
    st.data[goalId].sort(function (a, b) { return String(a.date) < String(b.date) ? -1 : 1; });
    jsave(IEPK, st);
    try { if (typeof window.aogRenderIep === "function") window.aogRenderIep(); } catch (e) {}
    paint();
    return true;
  }

  /* ═════════════════════════ THE GOAL CARD */
  function cardHtml(goalId) {
    var g = goalOf(goalId);
    if (!g || g.archived) return "";
    var c = cfgFor(goalId);
    var items = obsItems();
    var opts = ['<option value="">' + esc(T("Not tracked here", "No se sigue aquí")) + "</option>"]
      .concat(items.map(function (i) {
        return '<option value="' + esc(i.k) + '"' + (c && c.k === i.k ? " selected" : "") + ">" + esc(i.q) + "</option>";
      })).join("");

    var body = '<div class="iept-row"><span class="iept-lbl">' +
        esc(T("Track on the support check-in", "Seguir en el registro de apoyo")) + "</span>" +
        '<select class="iept-sel" data-ieptsel="' + esc(goalId) + '">' + opts + "</select></div>";

    if (c) {
      if (!acceptable(g)) {
        body += '<p class="iept-say">' + esc(T(
          "Adults can answer this, and it will show below as context — but this goal is not measured in trials or steps, so a day of answers cannot become a data point on it. Change the measure, or read these as context.",
          "Los adultos pueden responder y aparecerá abajo como contexto — pero esta meta no se mide en ensayos ni pasos, así que un día de respuestas no puede convertirse en un dato. Cambia la medida o léelo como contexto.")) + "</p>";
      }
      var rows = tally(goalId);
      if (!rows.length) {
        body += '<p class="iept-say">' + esc(T(
          "No days answered yet. Adults will see this one question on the support check-in for this student.",
          "Aún no hay días respondidos. Los adultos verán esta pregunta en el registro de apoyo de este estudiante.")) + "</p>";
      } else {
        body += '<p class="iept-say">' + esc(T(
          "Each day is a proposal until you accept it. “No opportunity” is left out of the count on purpose.",
          "Cada día es una propuesta hasta que la aceptes. “No hubo ocasión” se excluye del conteo a propósito.")) + "</p>";
        body += '<ul class="iept-days">' + rows.slice(-8).reverse().map(function (r) {
          var says = shortD(r.date) + " — " + r.saw + T(" of ", " de ") + r.total +
            T(" opportunities", " ocasiones") + " · " + r.adults + T(r.adults === 1 ? " adult" : " adults", r.adults === 1 ? " adulto" : " adultos") +
            (r.noopp ? (" · " + r.noopp + T(" with no opportunity", " sin ocasión")) : "");
          return "<li>" + '<span class="iept-day">' + esc(says) + "</span>" +
            (r.accepted
              ? '<span class="iept-done">' + esc(T("on the chart", "en la gráfica")) + "</span>"
              : (acceptable(g)
                  ? '<button type="button" class="iept-acc" data-ieptacc="' + esc(goalId) + "|" + esc(r.date) + '">' +
                      esc(T("Accept as a data point", "Aceptar como dato")) + "</button>"
                  : "")) + "</li>";
        }).join("") + "</ul>";
      }
    }
    return '<div class="iept-card" data-ieptcard="' + esc(goalId) + '"><h4>' +
      esc(T("Tracked on the support check-in", "Seguimiento en el registro de apoyo")) + "</h4>" + body + "</div>";
  }

  function css() {
    if (el("aogIeptCss")) return;
    var st = document.createElement("style");
    st.id = "aogIeptCss";
    st.textContent = [
      ".iept-card{margin-top:12px;border:1px solid var(--rule,#E4DAC5);border-radius:12px;overflow:hidden;}",
      ".iept-card h4{margin:0;padding:10px 14px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;",
      "  color:var(--ink,#0A1E33);background:var(--card-soft,rgba(74,85,120,.05));}",
      ".iept-row{display:flex;gap:12px;align-items:center;padding:11px 14px;border-top:1px solid var(--rule,#E4DAC5);flex-wrap:wrap;}",
      ".iept-lbl{font-size:12px;font-weight:800;color:var(--ink,#0A1E33);}",
      ".iept-sel{min-height:38px;font:inherit;font-size:13px;padding:6px 9px;border:1px solid var(--rule,#E4DAC5);",
      "  border-radius:8px;background:var(--paper,#FBF8F1);color:var(--ink,#0A1E33);max-width:100%;flex:1;min-width:200px;}",
      ".iept-say{margin:0;padding:10px 14px;border-top:1px solid var(--rule,#E4DAC5);font-size:11.5px;line-height:1.6;color:var(--ink-soft,#46506E);}",
      ".iept-days{margin:0;padding:4px 14px 12px;list-style:none;}",
      ".iept-days li{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:7px 0;border-top:1px dotted var(--rule,#E4DAC5);}",
      ".iept-day{flex:1;min-width:200px;font-size:12.5px;color:var(--ink,#0A1E33);}",
      ".iept-done{font-size:11.5px;font-weight:750;color:var(--green,#2E6B3A);}",
      ".iept-acc{font:inherit;font-size:12px;font-weight:750;min-height:34px;padding:6px 12px;cursor:pointer;",
      "  border:1px solid var(--aog-dusk,#4A5578);border-radius:8px;background:var(--paper,#FBF8F1);color:var(--ink,#0A1E33);}",
      ".iept-acc:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      /* the form, on the support check-in */
      ".iept{margin:14px 0 0;border:1px solid var(--gold,#D9A33B);border-radius:12px;padding:12px 14px;background:var(--paper,#FBF8F1);}",
      ".iept-head{margin:0 0 2px;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft,#46506E);}",
      ".iept-q{margin:0 0 10px;font-size:14.5px;font-weight:700;color:var(--ink,#0A1E33);line-height:1.4;}",
      ".iept-btns{display:flex;gap:8px;flex-wrap:wrap;}",
      ".iept-b{font:inherit;font-size:13px;font-weight:650;min-height:44px;padding:8px 14px;cursor:pointer;",
      "  border:1px solid var(--rule,#E4DAC5);border-radius:10px;background:var(--card,#fff);color:var(--ink,#0A1E33);}",
      ".iept-b.on{border-color:var(--aog-dusk,#4A5578);border-width:2px;font-weight:800;}",
      ".iept-b:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}"
    ].join("\n");
    document.head.appendChild(st);
  }

  var painting = false;
  function paint() {
    if (painting) return;
    painting = true;
    try {
      css();
      paintForm();
      var body = el("aogIepBody");
      if (!body) return;
      body.querySelectorAll(".iep-card").forEach(function (card) {
        var id = String(card.id || "").replace(/^iepCard_/, "");
        if (!id) return;
        var html = cardHtml(id);
        var have = card.querySelector('[data-ieptcard="' + id + '"]');
        if (!html) { if (have) have.parentNode.removeChild(have); return; }
        var tmp = document.createElement("div");
        tmp.innerHTML = html;
        if (have) {
          if (have.outerHTML === tmp.firstChild.outerHTML) return;
          have.parentNode.replaceChild(tmp.firstChild, have);
        } else card.appendChild(tmp.firstChild);
      });
    } catch (e) {} finally { painting = false; }
  }

  function wire() {
    document.addEventListener("change", function (e) {
      var sel = e.target && e.target.closest ? e.target.closest("[data-ieptsel]") : null;
      if (sel) { setCfg(sel.getAttribute("data-ieptsel"), sel.value); paint(); return; }
      if (e.target && (e.target.id === "ciStudent" || e.target.id === "ciStudentTyped")) setTimeout(paintForm, 0);
    });
    document.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("[data-ieptacc]") : null;
      if (!b) { setTimeout(paint, 80); return; }
      var parts = b.getAttribute("data-ieptacc").split("|");
      var g = goalOf(parts[0]);
      var row = tally(parts[0]).filter(function (r) { return r.date === parts[1]; })[0];
      if (!g || !row) return;
      /* ⚠ ONE DAY, NAMED, AND NEVER "ACCEPT ALL". The confirm says exactly what
         is about to become a data point and where it came from. */
      var msg = T(
        "Add " + row.saw + " of " + row.total + " for " + shortD(row.date) + " to this goal?\n\nIt was assembled from " +
          row.adults + (row.adults === 1 ? " adult" : " adults") + " answering the support check-in, and it will be marked on the chart and in every export as coming from the team rather than from a measurement you took.",
        "¿Agregar " + row.saw + " de " + row.total + " del " + shortD(row.date) + " a esta meta?\n\nSe armó con " +
          row.adults + (row.adults === 1 ? " adulto" : " adultos") + " respondiendo el registro de apoyo, y se marcará en la gráfica y en cada exportación como proveniente del equipo y no de una medición tuya.");
      if (!window.confirm(msg)) return;
      accept(parts[0], parts[1]);
    }, true);
  }

  function watch() {
    var body = el("aogIepBody");
    if (body) { try { new MutationObserver(function () { setTimeout(paint, 0); }).observe(body, { childList: true, subtree: true }); } catch (e) {} }
    var sc = el("screen-staff-checkin");
    if (sc) { try { new MutationObserver(function () { setTimeout(paintForm, 0); }).observe(sc, { childList: true, subtree: true }); } catch (e) {} }
  }

  function init() { paint(); wire(); watch(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.AOGIepTrack = {
    cfg: cfgFor, set: setCfg, forStudent: forStudent,
    formHtml: formHtml, readForm: readForm,
    tally: tally, accept: accept, acceptable: acceptable, paint: paint
  };
})();
