
(function () {
  "use strict";
  if (window.__aogGcx) return; window.__aogGcx = 1;
  var IEPK = "aog.iep.v1";
  var OK_MEASURES = { trials: 1, steps: 1, percent: 1 };
  var open = null;      /* { who, id } of the activity whose IEP panel is open */
  var said = {};        /* last result line per who|id */
  function A() { return window.AOG_PRACTICE || null; }
  function T(en, es) { var a = A(); return a ? a.T(en, es) : en; }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function fold(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim().toLowerCase(); }
  function jload(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function who() { var a = A(); return a && a.current ? a.current() : null; }
  function series() {
    var a = A(), w = who(); if (!a || !w) return [];
    var m = a.byStudent(); return m[w] ? a.seriesFor(m[w]) : [];
  }
  function goalsOf(name) {
    var st = jload(IEPK, {}) || {}, out = [], want = fold(name);
    Object.keys(st.goals || {}).forEach(function (id) {
      var g = st.goals[id]; if (!g || g.archived) return;
      if (fold(g.student) !== want) return;
      out.push({ id: id, g: g });
    });
    return out;
  }
  function measureWord(m) {
    return ({ trials: T("trials", "ensayos"), steps: T("steps", "pasos"), percent: T("percent", "porcentaje"),
      wcpm: T("words per minute", "palabras por minuto"), rating: T("rating", "escala"), duration: T("duration", "duración"),
      latency: T("latency", "latencia"), interval: T("interval", "intervalo") })[m] || String(m || "");
  }
  function goalLabel(g) {
    var t = String(g.title || g.name || g.goal || g.text || g.statement || "").replace(/\s+/g, " ").trim();
    if (t.length > 90) t = t.slice(0, 87) + "…";
    return (t || T("Untitled goal", "Meta sin título")) + " · " + measureWord(g.measure);
  }
  /* one point per day: sets sent the same day are added together */
  function days(act, which) {
    var by = {};
    act.pts.forEach(function (p) {
      var d = String(p.d || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
      var tot = p.tot || act.tot; if (!tot) return;
      var x = by[d] || (by[d] = { d: d, ind: 0, tot: 0, sets: [], sup: [], std: [] });
      x.ind += p.ind || 0; x.tot += tot; if (p.set) x.sets.push(p.set);
      String(p.supports || "").split(/;\s*/).forEach(function (v) { if (v && x.sup.indexOf(v) < 0) x.sup.push(v); });
      String(p.stds || "").split(/;\s*/).forEach(function (v) { if (v && x.std.indexOf(v) < 0) x.std.push(v); });
    });
    var list = Object.keys(by).sort().map(function (k) { return by[k]; });
    return which === "last" ? list.slice(-1) : list;
  }
  function addPoints(goalId, act, which) {
    var st = jload(IEPK, { goals: {}, data: {} }); st.goals = st.goals || {}; st.data = st.data || {};
    var g = st.goals[goalId];
    if (!g || !OK_MEASURES[g.measure]) return { added: 0, skipped: 0 };
    var arr = st.data[goalId] || (st.data[goalId] = []);
    var added = 0, skipped = 0;
    days(act, which).forEach(function (x) {
      if (arr.some(function (p) { return p && String(p.date).slice(0, 10) === x.d; })) { skipped++; return; }
      var pt = { date: x.d, year: (window.AOGYear ? window.AOGYear(x.d) : ""), src: "practice",
        note: T("From student-sent practice · " + act.name + (x.sets.length ? " · set " + x.sets.join(", ") : "") + " · " + x.ind + " of " + x.tot + " without a hint"
                  + (x.sup.length ? " · supports: " + x.sup.join(", ") : " · no supports recorded")
                  + (x.std.length ? " · standards: " + (x.std.length > 6 ? x.std.slice(0, 6).join(", ") + " +" + (x.std.length - 6) : x.std.join(", ")) : ""),
                "De práctica enviada por el estudiante · " + act.name + (x.sets.length ? " · grupo " + x.sets.join(", ") : "") + " · " + x.ind + " de " + x.tot + " sin pista"
                  + (x.sup.length ? " · apoyos: " + x.sup.join(", ") : " · sin apoyos registrados")
                  + (x.std.length ? " · estándares: " + (x.std.length > 6 ? x.std.slice(0, 6).join(", ") + " +" + (x.std.length - 6) : x.std.join(", ")) : "")) };
      if (g.measure === "percent") pt.value = Math.round(x.ind / x.tot * 100);
      else { pt.value = x.ind; pt.total = x.tot; }
      arr.push(pt); added++;
    });
    arr.sort(function (a, b) { return String(a.date) < String(b.date) ? -1 : 1; });
    if (added) { jsave(IEPK, st); try { if (typeof window.aogRenderIep === "function") window.aogRenderIep(); } catch (e) {} }
    return { added: added, skipped: skipped, goal: g };
  }
  function panelHtml(w, act) {
    var gs = goalsOf(w), key = w + "|" + act.id;
    var h = '<div class="gcx-panel" data-gcxpanel="' + esc(act.id) + '">';
    if (!gs.length) {
      h += '<p class="gcx-say">' + esc(T(w + " has nothing under construction on this device yet. Start the build in The Build (the IEP tab of this dashboard), then come back here to lay these bricks on it.",
        w + " aún no tiene nada en construcción en este dispositivo. Empieza la obra en La Obra (la pestaña IEP de este panel) y vuelve aquí para colocar estos ladrillos.")) + '</p>';
      /* AOG-GCX-STARTBUILD-V1 (2026-09-26) — Jimmy: "the option of starting your
         own build right here, right now … embedded in the building process."
         One press starts the goal from this activity (percent solved with no
         hint, from the first day sent to 80% a year on) and lays every brick. */
      var dl0 = days(act, "all");
      if (dl0.length) h += '<p class="gcx-say">' + esc(T("Or start " + w + "’s build right here: a goal for " + act.name + ", measured as the percent solved with no hint, starting from " + dl0[0].d + " (" + Math.round(dl0[0].ind / dl0[0].tot * 100) + "%) and aiming for 80% a year from then. Every day sent becomes a brick. You can change any of it later in The Build.",
        "O empieza la obra de " + w + " aquí mismo: una meta para " + act.name + ", medida como porcentaje resuelto sin pista, desde " + dl0[0].d + " (" + Math.round(dl0[0].ind / dl0[0].tot * 100) + "%) hasta 80% en un año. Cada día enviado se vuelve un ladrillo. Puedes cambiar todo después en La Obra.")) + '</p>';
      return h + '<div class="gcx-row">' + (dl0.length ? '<button type="button" class="gcx-go" data-gcxstart="' + esc(act.id) + '" style="background:#C9A24A;color:#0A1E33;border:2px solid #1E1F22;font-weight:800">' + esc(T("Start " + w + "’s build here and lay these bricks", "Empezar la obra de " + w + " aquí y colocar estos ladrillos")) + '</button>' : "") + '<button type="button" data-gcxclose="1">' + esc(T("Close", "Cerrar")) + '</button></div></div>';
    }
    var ok = gs.filter(function (x) { return OK_MEASURES[x.g.measure]; });
    var no = gs.filter(function (x) { return !OK_MEASURES[x.g.measure]; });
    var dl = days(act, "all"), last = dl[dl.length - 1];
    h += '<label for="gcxGoal">' + esc(T("What they're building (IEP goal)", "Lo que está construyendo (meta del IEP)")) + '</label>';
    if (ok.length) {
      h += '<select id="gcxGoal">' + ok.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(goalLabel(x.g)) + '</option>'; }).join("") + '</select>';
      h += '<label>' + esc(T("Which results", "Qué resultados")) + '</label>'
        + '<span class="gcx-rad"><input type="radio" name="gcxWhich" value="last" checked> ' + esc(T("The latest day only", "Solo el día más reciente"))
        + (last ? ' — ' + esc(last.d) + ': ' + last.ind + ' / ' + last.tot : "") + '</span>'
        + '<span class="gcx-rad"><input type="radio" name="gcxWhich" value="all"> ' + esc(T("Every day sent", "Cada día enviado")) + ' (' + dl.length + ')</span>'
        + '<p class="gcx-say">' + esc(T("Each point is what was solved with no hint. Sets sent on the same day become one point. A day that already has a point on this goal is skipped, never changed. Every point is marked as coming from student-sent practice.",
          "Cada punto es lo resuelto sin pista. Los grupos enviados el mismo día se vuelven un solo punto. Un día que ya tiene un punto en esta meta se omite, nunca se cambia. Cada punto queda marcado como práctica enviada por el estudiante.")) + '</p>'
        + '<div class="gcx-row"><button type="button" class="gcx-go" data-gcxadd="' + esc(act.id) + '" style="background:var(--navy,#0A1E33);color:#fff;border:2px solid var(--gold-deep,#7E5B18)">' + esc(T("Lay them on this build", "Colocarlos en esta obra")) + '</button>'
        + '<button type="button" data-gcxclose="1">' + esc(T("Close", "Cerrar")) + '</button></div>';
    } else {
      h += '<div class="gcx-row"><button type="button" data-gcxclose="1">' + esc(T("Close", "Cerrar")) + '</button></div>';
    }
    if (no.length) {
      h += '<p class="gcx-say">' + esc(T("Not offered: " + no.map(function (x) { return goalLabel(x.g); }).join("; ") + " — a count of items solved without a hint can only fill a goal measured in trials, steps or percent.",
        "No se ofrece: " + no.map(function (x) { return goalLabel(x.g); }).join("; ") + " — un conteo de ítems resueltos sin pista solo puede llenar una meta medida en ensayos, pasos o porcentaje.")) + '</p>';
    }
    if (said[key]) h += '<p class="gcx-say gcx-ok">' + esc(said[key]) + '</p>';
    return h + '</div>';
  }
  var busy = false;
  /* AOG-SUGGEST-GOALS-V1 (2026-09-26) — Jimmy: "compile all the independent data
     and suggest goals to move forward with, based on what the children produced
     in the fall and winter." For the student on screen: every activity they sent,
     what they solved with NO hint in the fall (Aug–Nov) and the winter (Dec–Feb),
     and where they are now. The three lowest that are still under 80% become
     suggested goals, each one press from being started and filled with its bricks.
     A suggestion, never a decision: the team writes the IEP. */
  function season(d) { var m = +String(d).slice(5, 7); return m >= 8 && m <= 11 ? "fall" : (m === 12 || m <= 2) ? "winter" : m >= 3 && m <= 5 ? "spring" : "summer"; }
  function pct(list) { var i = 0, t = 0; list.forEach(function (x) { i += x.ind; t += x.tot; }); return t ? Math.round(i / t * 100) : null; }
  function suggestHtml(w) {
    var have = goalsOf(w).map(function (x) { return String(x.g.title || ""); }).join(" | ");
    var rows = series().map(function (act) {
      var dl = days(act, "all"); if (!dl.length) return null;
      var f = dl.filter(function (x) { return season(x.d) === "fall"; }), wi = dl.filter(function (x) { return season(x.d) === "winter"; });
      var last = dl[dl.length - 1], now = Math.round(last.ind / last.tot * 100);
      return { act: act, fall: pct(f), winter: pct(wi), now: now, last: last, n: dl.length, inBuild: have.indexOf(act.name) >= 0 };
    }).filter(function (r) { return r; }).sort(function (a, b) { return a.now - b.now; });
    rows = rows.filter(function (r) { return r.now < 100; }).slice(0, 3);
    if (!rows.length) return "";
    var h = '<div class="gcx-sugg"><div class="gcx-sugg-h">' + esc(T("Suggested next goals for " + w, "Metas sugeridas para " + w)) + '</div>'
      + '<p class="gcx-say">' + esc(T("From what " + w + " solved with no hint, lowest first. Under 80% aims for 80% or more; already strong work aims a little higher. A starting point for the team, not a decision.", "De lo que " + w + " resolvió sin pista, de menor a mayor. Por debajo de 80% apunta a 80% o más; el trabajo ya fuerte apunta un poco más alto. Un punto de partida para el equipo, no una decisión.")) + '</p>';
    rows.forEach(function (r) {
      var tgt = r.now < 80 ? Math.min(95, Math.max(80, r.now + 25)) : Math.min(100, r.now + 8);
      var trail = [r.fall != null ? T("Fall ", "Otoño ") + r.fall + "%" : "", r.winter != null ? T("Winter ", "Invierno ") + r.winter + "%" : "", T("Now ", "Ahora ") + r.now + "%"].filter(Boolean).join(" → ");
      h += '<div class="gcx-sugg-row"><div><b>' + esc(T("Increase independent accuracy on ", "Aumentar la precisión independiente en ") + r.act.name) + '</b>'
        + '<div class="gcx-sugg-t">' + esc(trail + " · " + T("aim ", "meta ") + tgt + "% " + T("in a year", "en un año") + " · " + r.n + T(" days of work", " días de trabajo")) + '</div></div>'
        + (r.inBuild ? '<span class="gcx-say gcx-ok">' + esc(T("Already in the build", "Ya está en la obra")) + '</span>'
          : '<button type="button" class="gcx-go" data-gcxstart="' + esc(r.act.id) + '" data-base="latest" data-tgt="' + tgt + '">' + esc(T("Start this goal", "Empezar esta meta")) + '</button>') + '</div>';
    });
    return h + '</div>';
  }
  function decorate() {
    var c = document.getElementById("aogPracticeChart");
    if (!c || c.hidden || busy) return;
    var w = who(); if (!w) return;
    busy = true;
    try {
      if (!c.querySelector(".gcx-bar")) {
        var bar = document.createElement("div"); bar.className = "gcx-bar";
        bar.innerHTML = '<button type="button" class="gcx-go" data-gcxprint="' + esc(w) + '">🖨️ ' + esc(T("Print all of " + w + "’s graphs", "Imprimir todas las gráficas de " + w)) + '</button>'
          + '<button type="button" data-gcxprint="*">' + esc(T("Print every student", "Imprimir a todos los estudiantes")) + '</button>'
          + '<a class="gcx-bp" href="turn-ins.html?blueprint=' + encodeURIComponent(w) + '" style="display:inline-flex;align-items:center;padding:0 14px;min-height:40px;border-radius:999px;border:1.5px solid var(--gold-deep,#9a6f24);font-weight:700;text-decoration:none;color:inherit">◎ ' + esc(T("Open " + w + "’s Blueprint", "Abrir el Plano de " + w)) + '</a>';
        var anchor = c.querySelector(".gc-next") || c.querySelector(".gc-who");
        if (anchor && anchor.nextSibling) c.insertBefore(bar, anchor.nextSibling); else c.appendChild(bar);
      }
      if (!c.querySelector(".gcx-sugg-host")) {
        var sh = document.createElement("div"); sh.className = "gcx-sugg-host"; sh.innerHTML = suggestHtml(w);
        var bar2 = c.querySelector(".gcx-bar"); if (bar2 && bar2.nextSibling) c.insertBefore(sh, bar2.nextSibling); else c.appendChild(sh);
      }
      var list = series(), acts = c.querySelectorAll(".gc-act");
      Array.prototype.forEach.call(acts, function (el, i) {
        var act = list[i]; if (!act || el.querySelector(".gcx-act")) return;
        var box = document.createElement("div"); box.className = "gcx-act";
        var isOpen = open && open.who === w && open.id === act.id;
        box.innerHTML = (isOpen ? panelHtml(w, act)
          : '<button type="button" data-gcxone="' + i + '">🖨️ ' + esc(T("Print this graph", "Imprimir esta gráfica")) + '</button> '
            + '<button type="button" data-gcxopen="' + esc(act.id) + '">' + esc(T("Lay these bricks", "Colocar estos ladrillos")) + '</button>'
            + (said[w + "|" + act.id] ? '<span class="gcx-say gcx-ok" style="margin-left:10px">' + esc(said[w + "|" + act.id]) + '</span>' : ""));
        el.appendChild(box);
      });
    } finally { busy = false; }
  }
  function redraw() {
    var c = document.getElementById("aogPracticeChart"); if (!c) return;
    Array.prototype.forEach.call(c.querySelectorAll(".gcx-act, .gcx-sugg-host"), function (n) { n.parentNode.removeChild(n); });
    decorate();
  }
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-gcxprint],[data-gcxone],[data-gcxopen],[data-gcxclose],[data-gcxadd],[data-gcxstart]") : null;
    if (!t) return;
    var c = document.getElementById("aogPracticeChart"); if (!c || !c.contains(t)) return;
    var w = who();
    if (t.hasAttribute("data-gcxprint")) {
      /* synchronous inside the click — iOS Safari */
      if (typeof window.aogPrintPracticeRecord === "function") window.aogPrintPracticeRecord(t.getAttribute("data-gcxprint"));
      return;
    }
    /* AOG-GCX-PRINTONE-V1 (2026-09-25) — Jimmy: "Each graph should get its own
       print box." One graph, on its own sheet: a clone of that activity with the
       student's name above it, printed while everything else is hidden. */
    if (t.hasAttribute("data-gcxone")) {
      var one = c.querySelectorAll(".gc-act")[+t.getAttribute("data-gcxone")]; if (!one) return;
      var sheet = document.getElementById("gcxOnePrint");
      if (!sheet) { sheet = document.createElement("div"); sheet.id = "gcxOnePrint"; document.body.appendChild(sheet); }
      var cl = one.cloneNode(true);
      Array.prototype.forEach.call(cl.querySelectorAll(".gcx-act"), function (n) { n.parentNode.removeChild(n); });
      sheet.innerHTML = '<div class="gcx1-h"><b>' + esc(w) + '</b> · ' + esc(T("Brick by brick", "Ladrillo a ladrillo")) + ' · ' + esc(new Date().toLocaleDateString()) + '</div>';
      sheet.appendChild(cl);
      document.body.classList.add("gcx-one");
      var done = function () { document.body.classList.remove("gcx-one"); window.removeEventListener("afterprint", done); };
      window.addEventListener("afterprint", done);
      window.print();
      setTimeout(done, 1500);
      return;
    }
    if (t.hasAttribute("data-gcxopen")) { open = { who: w, id: t.getAttribute("data-gcxopen") }; redraw(); return; }
    if (t.hasAttribute("data-gcxclose")) { open = null; redraw(); return; }
    if (t.hasAttribute("data-gcxstart")) {
      var sid2 = t.getAttribute("data-gcxstart"), a2 = null;
      series().forEach(function (a) { if (a.id === sid2) a2 = a; });
      var dd = a2 ? days(a2, "all") : []; if (!dd.length) return;
      var st2 = jload(IEPK, { goals: {}, data: {} }); st2.goals = st2.goals || {}; st2.data = st2.data || {};
      var gid = "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      var fromLatest = t.getAttribute("data-base") === "latest", bd = fromLatest ? dd[dd.length - 1] : dd[0];
      var b0 = bd.d, yr = new Date(Date.parse(b0)); yr.setFullYear(yr.getFullYear() + 1);
      var nm = String(a2.name || "");
      var area = /math/i.test(nm) ? "math" : /writ/i.test(nm) ? "writing" : /(ela|language|reading)/i.test(nm) ? "reading" : "other";
      st2.goals[gid] = { student: w, grade: "", area: area, title: T("Increase independent accuracy on ", "Aumentar la precisión independiente en ") + nm,
        measure: "percent", unit: "", baseline: { date: b0, value: Math.round(bd.ind / bd.tot * 100) },
        target: { date: yr.toISOString().slice(0, 10), value: +(t.getAttribute("data-tgt") || 80) }, notes: T("Started from student-sent practice on the Brick by brick screen.", "Iniciada desde la práctica enviada en la pantalla Ladrillo a ladrillo."),
        archived: false, lowerBetter: false, intervalLabel: "", xofy: null };
      st2.data[gid] = [];
      jsave(IEPK, st2);
      var r2 = addPoints(gid, a2, "all");
      said[w + "|" + sid2] = T("Build started: " + w + "’s goal for " + nm + ", with " + r2.added + " bricks laid. Open The Build (IEP tab) to see the aimline.",
        "Obra empezada: la meta de " + w + " para " + nm + ", con " + r2.added + " ladrillos. Abre La Obra (pestaña IEP) para ver la línea meta.");
      try { if (typeof window.aogRenderIep === "function") window.aogRenderIep(); } catch (e) {}
      open = null; redraw(); return;
    }
    if (t.hasAttribute("data-gcxadd")) {
      var id = t.getAttribute("data-gcxadd"), act = null;
      series().forEach(function (a) { if (a.id === id) act = a; });
      var sel = c.querySelector("#gcxGoal"), r = c.querySelector('input[name="gcxWhich"]:checked');
      if (!act || !sel || !sel.value) return;
      var res = addPoints(sel.value, act, r ? r.value : "last");
      said[w + "|" + id] = res.added
        ? T("Added " + res.added + (res.added === 1 ? " brick" : " bricks") + " on the build" + (res.skipped ? " (" + res.skipped + " day" + (res.skipped === 1 ? "" : "s") + " already had a brick and " + (res.skipped === 1 ? "was" : "were") + " skipped)" : "") + ". They show in The Build (IEP tab), marked as student-sent practice.",
            "Se colocaron " + res.added + (res.added === 1 ? " ladrillo" : " ladrillos") + " en la obra" + (res.skipped ? " (" + res.skipped + " día(s) ya tenían un ladrillo y se omitieron)" : "") + ". Aparecen en La Obra (pestaña IEP), marcados como práctica enviada por el estudiante.")
        : T("Nothing laid — every day chosen already has a brick on that build.", "No se colocó nada — cada día elegido ya tiene un ladrillo en esa obra.");
      open = null; redraw();
    }
  });
  var obs = null, watched = null;
  function watch() {
    var c = document.getElementById("aogPracticeChart");
    if (c && c !== watched && window.MutationObserver) {
      if (obs) obs.disconnect();
      obs = new MutationObserver(function () { if (!busy) decorate(); });
      obs.observe(c, { childList: true });
      watched = c;
    }
    decorate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();
  setInterval(watch, 1500);
})();
