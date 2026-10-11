
/* ============================================================================
   REMOVE ONE STUDENT FROM THIS DEVICE — build .30cy, 2026-08-31.

   Jimmy's ask, verbatim: "How can I remove people from this or other pages?"
   — after test codes (some of them this project's own) polluted the exit-slip
   picker. Until now the only door was "Clear my data on this device", which
   is a building demolition when what's needed is one room.

   ⚠ THIS IS A DELIBERATE DOOR, NOT A CONVENIENT ONE. It lives in Set up →
   Export beside the backup panel ("download a backup first, then delete if
   you need to" — that page's own words). It itemizes exactly what it found,
   in counts, before anything is touched; the button stays disabled until
   the person says they understand; and it never pretends to reach farther
   than it does: rows still in the school's Sheet come back on the next
   pull, and the card says so every time.

   ⚠ MATCH BY NORM, NEVER BY ===. The stores disagree about casing —
   aog.exit.v1 uppercases through codeKey, aog.daily.v1 and
   aog.checkin.student.v1 keep what was typed — so "jr14" and "JR14" are the
   same child. AOGStudent.norm (uppercase, strip non-alphanumerics) is the
   arbiter, same as the identity resolver uses everywhere else.

   ⚠ DELETE ORDER MATTERS IN THE IEP STORES. aog.iepdocs.v1 goalMeta,
   aog.iep.track.v1 cfg and aog.iep.home.v1 cfg/obs are keyed by goalId (and
   obs by an opaque minted link token) — the student's name is only on the
   goal in aog.iep.v1. Goal ids and mint keys are captured FIRST, then the
   satellites are cleaned, then the goals themselves.

   ⚠ FAMILY-SIDE STORES ARE NOT TOUCHED. aog.repair.v1 and aog.family.v1
   are keyed by family child ids — a different identity space from school
   codes, owned by the family's own device. A school-side removal door has
   no business in them.

   Home check-ins go through AOGHomeCi.removeStudent() — the one-student
   seam that module built for exactly this screen (its own comment names
   the Remove-records screen it was waiting for).
   ========================================================================= */
(function () {
  "use strict";

  function T(en, es) {
    try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function jload(k, fb) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } }
  function jsave(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function norm(c) {
    try { if (window.AOGStudent && AOGStudent.norm) return AOGStudent.norm(c); } catch (e) {}
    return String(c == null ? "" : c).toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  /* ── the sweep ─────────────────────────────────────────────────────────
     One function, two modes. dry=true counts and names; dry=false deletes.
     Every store is wrapped in its own try/catch so one malformed store
     cannot stop the rest, and every branch counts BEFORE it deletes so the
     summary reports what actually happened. Returns [{label, n}] with the
     matched key variants in .variants. */
  function sweep(raw, dry) {
    var t = norm(raw);
    var items = [];
    var variants = {};
    function seenKey(k) { variants[String(k)] = 1; }
    function add(label, n) { if (n > 0) items.push({ label: label, n: n }); }

    /* the three log stores — days, the grain the restore panel speaks */
    /* ⚠⚠ .30hj — A DELETE A REFRESH CAN UNDO IS NOT A DELETE, IT IS A HIDE.
       Until this build the sweep deleted the rows and wrote NO TOMBSTONE, so
       the very next "Pull check-ins from the sheet" merged every one of them
       straight back down. That is exactly what Jimmy saw, twice, and why he
       said "I thought I did" — he HAD, and the pull undid it.
       ⚠ EACH LIST HAS ITS OWN KEY FORMAT and they are not interchangeable.
       tcode() is trim+uppercase — the casing the removal engines use —
       and is DELIBERATELY NOT norm(), which also strips non-alphanumerics
       and would build a key no merge would ever match. */
    var TOMB = { ci: [], ex: [], pr: [] };
    function tcode(x) { return String(x == null ? "" : x).trim().toUpperCase(); }
    function pushGone(key, keys) {
      if (!keys.length) return;
      try {
        var g = jload(key, []); if (!g || !g.slice) g = [];
        var have = {}; g.forEach(function (k) { have[String(k)] = 1; });
        keys.forEach(function (k) { if (k && !have[k]) { have[k] = 1; g.push(k); } });
        jsave(key, g.length > 4000 ? g.slice(g.length - 4000) : g);
      } catch (e) {}
    }
    function ciTomb(id, r) {
      var ts = String((r && r.timestamp) || "");
      var a = tcode(id) + "|" + ts, b = tcode(r && r.studentId) + "|" + ts;
      TOMB.ci.push(a); if (b !== a) TOMB.ci.push(b);
    }
    function exTomb(id, r) {
      var ts = String((r && r.timestamp) || "");
      var a = tcode(id) + "|" + ts, b = tcode(r && r.studentId) + "|" + ts;
      TOMB.ex.push(a); if (b !== a) TOMB.ex.push(b);
    }
    function logStore(key, collect) {
      var n = 0;
      try {
        var s = jload(key, {}); var logs = s.logs || {};
        Object.keys(logs).forEach(function (id) {
          if (norm(id) !== t) return;
          seenKey(id);
          n += Object.keys(logs[id] || {}).length;
          /* ⚠ TWO DAY SHAPES: aog.daily.v1 wraps its rows in {periods:[…]},
             aog.exit.v1 and aog.checkin.student.v1 store a bare array. */
          if (collect) {
            Object.keys(logs[id] || {}).forEach(function (d) {
              var day = logs[id][d];
              var rows = (day && day.periods) ? day.periods
                       : (Object.prototype.toString.call(day) === "[object Array]" ? day : []);
              rows.forEach(function (r) { collect(id, r); });
            });
          }
          if (!dry) delete logs[id];
        });
        if (!dry && n) jsave(key, s);
      } catch (e) {}
      return n;
    }
    var ciDays = logStore("aog.checkin.student.v1", ciTomb) + logStore("aog.daily.v1", ciTomb);
    add(T("Check-in days", "Días de registros"), ciDays);
    add(T("Exit-slip days", "Días de salidas"), logStore("aog.exit.v1", exTomb));

    /* flat maps keyed by code */
    function mapStore(key, sub, label) {
      var n = 0;
      try {
        var s = jload(key, {}); var m = sub ? (s[sub] || {}) : s;
        Object.keys(m).forEach(function (id) {
          if (norm(id) !== t) return;
          seenKey(id); n++;
          if (!dry) delete m[id];
        });
        if (!dry && n) jsave(key, s);
      } catch (e) {}
      if (label) add(label, n);
      return n;
    }
    mapStore("aog.exit.sched.v1", null, T("Saved class schedules", "Horarios guardados"));
    mapStore("aog.exit.home.v1", "sids", T("Family-card records", "Registros de tarjeta familiar"));
    mapStore("aog.thisisme.v1", "students", T("This Is Me pages", "Páginas de Así soy yo"));
    mapStore("aog.iepmeet.v1", "students", T("Meeting decisions", "Decisiones de reunión"));
    /* ⚠ TEAM BUILD. subs is keyed by CODE; asks is keyed by askId and holds
       the code in a field, so it is swept explicitly rather than by key.
       Both leave with the student or the store is asymmetric. */
    var tbN = mapStore("aog.iepteam.v1", "subs", 0);
    try {
      var tb = jload("aog.iepteam.v1", {}); tb.asks = tb.asks || {}; tb.seen = tb.seen || {};
      Object.keys(tb.asks).forEach(function (aid) {
        if (norm((tb.asks[aid] || {}).student) !== t) return;
        seenKey(tb.asks[aid].student); tbN++;
        if (!dry) delete tb.asks[aid];
      });
      Object.keys(tb.seen).forEach(function (k) {
        var parts = String(k).split("|");
        if (parts.length > 1 && norm(parts[1]) === t && !dry) delete tb.seen[k];
      });
      if (!dry) jsave("aog.iepteam.v1", tb);
    } catch (e) {}
    add(T("Team contributions", "Aportaciones del equipo"), tbN);
    mapStore("aog.followup.v1", null, 0);
    mapStore("aog.mtss.pm.v1", null, 0);
    var evN = mapStore("aog.evclass.v1", "logs", 0) +
              mapStore("aog.sched.v1", "students", 0) +
              mapStore("aog.milestone.v1", "students", 0);
    add(T("Evidence records (class checks, schedule, milestones)", "Registros de evidencia (clases, horario, hitos)"), evN);

    /* queues + pulled mirrors — arrays of records with .studentId.
       aog.checkin.remote is overwritten wholesale on the next pull, but it
       is cleaned anyway so the screen is honest RIGHT NOW; the Sheet note
       below is the real answer. */
    var qN = 0;
    ["aog.checkin.queue", "aog.exit.queue", "aog.home.queue", "aog.checkin.remote"].forEach(function (key) {
      try {
        var arr = jload(key, null);
        if (!Array.isArray(arr)) return;
        var keep = arr.filter(function (r) {
          var hit = r && norm(r.studentId) === t;
          if (hit) { qN++; seenKey(r.studentId); }
          return !hit;
        });
        if (!dry && keep.length !== arr.length) jsave(key, keep);
      } catch (e) {}
    });
    /* ⚠⚠ .30hj — aog.practice.remote WAS NOT IN THAT LIST, so a removed
       student's finished worksheets and workbook survived the sweep whole.
       Its key format is its own: CODE|activityId|date(10)|setNo. */
    try {
      var pr = jload("aog.practice.remote", null);
      if (Object.prototype.toString.call(pr) === "[object Array]") {
        var pKeep = pr.filter(function (r) {
          var hit = r && norm(r.studentId) === t;
          if (hit) {
            qN++; seenKey(r.studentId);
            TOMB.pr.push([tcode(r.studentId), String(r.activityId || ""),
                          String(r.date || r.timestamp || "").slice(0, 10),
                          String(r.setNo == null ? "" : r.setNo)].join("|"));
          }
          return !hit;
        });
        if (!dry && pKeep.length !== pr.length) jsave("aog.practice.remote", pKeep);
      }
    } catch (e) {}
    add(T("Queued / mirrored rows", "Filas en cola o reflejadas"), qN);

    /* home check-ins — through the module's own one-student seam */
    var hcN = 0;
    try {
      var hs = jload("aog.home.checkin.v1", {}); var obs = hs.obs || {};
      Object.keys(obs).forEach(function (id) {
        if (norm(id) === t) { seenKey(id); hcN += (obs[id] || []).length; }
      });
      if (!dry && hcN) {
        if (window.AOGHomeCi && AOGHomeCi.removeStudent) {
          Object.keys(obs).forEach(function (id) { if (norm(id) === t) AOGHomeCi.removeStudent(id); });
        } else {
          Object.keys(obs).forEach(function (id) { if (norm(id) === t) delete obs[id]; });
          jsave("aog.home.checkin.v1", hs);
        }
      }
    } catch (e) {}
    add(T("Home check-ins", "Registros del hogar"), hcN);

    /* IEP — capture goal ids and mint keys BEFORE deleting anything */
    try {
      var iep = jload("aog.iep.v1", {}); iep.goals = iep.goals || {}; iep.data = iep.data || {};
      var gids = Object.keys(iep.goals).filter(function (id) {
        return norm(iep.goals[id].student) === t;
      });
      var ptN = 0;
      gids.forEach(function (id) { seenKey(iep.goals[id].student); ptN += (iep.data[id] || []).length; });

      var docs = jload("aog.iepdocs.v1", {}); docs.docs = docs.docs || {}; docs.goalMeta = docs.goalMeta || {};
      var docIds = Object.keys(docs.docs).filter(function (id) { return norm(docs.docs[id].student) === t; });
      var metaIds = gids.filter(function (id) { return !!docs.goalMeta[id]; });

      var trk = jload("aog.iep.track.v1", {}); trk.cfg = trk.cfg || {};
      var home = jload("aog.iep.home.v1", {}); home.cfg = home.cfg || {}; home.obs = home.obs || {};
      var paused = jload("aog.home.paused", {});
      var mints = [];
      Object.keys(home.cfg).forEach(function (gid) {
        var c = home.cfg[gid] || {};
        if (gids.indexOf(gid) !== -1 || norm(c.code) === t) {
          if (c.key) mints.push(c.key);
          if (!dry) delete home.cfg[gid];
        }
      });
      var homeObsN = 0;
      mints.forEach(function (mk) {
        homeObsN += (home.obs[mk] || []).length;
        if (!dry) { delete home.obs[mk]; if (paused && typeof paused === "object") delete paused[mk]; }
      });

      if (!dry) {
        gids.forEach(function (id) { delete iep.goals[id]; delete iep.data[id]; });
        docIds.forEach(function (id) { delete docs.docs[id]; });
        metaIds.forEach(function (id) { delete docs.goalMeta[id]; });
        gids.forEach(function (id) { delete trk.cfg[id]; });
        if (gids.length || ptN) jsave("aog.iep.v1", iep);
        if (docIds.length || metaIds.length) jsave("aog.iepdocs.v1", docs);
        if (gids.length) jsave("aog.iep.track.v1", trk);
        jsave("aog.iep.home.v1", home);
        if (paused && typeof paused === "object") jsave("aog.home.paused", paused);
      }
      if (gids.length || ptN) {
        items.push({ label: T("IEP goals", "Metas del IEP"), n: gids.length,
          extra: ptN + T(" data points", " datos") + (metaIds.length ? T(" and benchmark sets", " y referencias") : "") });
      }
      add(T("Family answers on IEP goals", "Respuestas familiares en metas"), homeObsN);
      if (docIds.length) add(T("IEP paperwork drafts", "Borradores de papeleo IEP"), docIds.length);
    } catch (e) {}

    /* screener */
    try {
      var scr = jload("aogScreener.v2.results", null);
      if (Array.isArray(scr)) {
        var keepS = scr.filter(function (r) {
          var hit = r && norm(r.studentId) === t;
          if (hit) seenKey(r.studentId);
          return !hit;
        });
        add(T("Self-reflection results", "Resultados de la autorreflexión"), scr.length - keepS.length);
        if (!dry && keepS.length !== scr.length) jsave("aogScreener.v2.results", keepS);
      }
    } catch (e) {}

    /* class rosters + per-member private notes + handed-out assignments */
    try {
      var pop = jload("aog.population.v1", {}); var rosterN = 0;
      (pop.classes || []).forEach(function (c) {
        var before = (c.members || []).length;
        var kept = (c.members || []).filter(function (m) {
          var hit = norm(m) === t; if (hit) seenKey(m); return !hit;
        });
        rosterN += before - kept.length;
        if (!dry) c.members = kept;
      });
      if (!dry && rosterN) jsave("aog.population.v1", pop);
      add(T("Class roster spots", "Lugares en listas de clase"), rosterN);
    } catch (e) {}
    try {
      var priv = jload("aog.pop.private.v1", {}); var privN = 0;
      Object.keys(priv).forEach(function (k) {
        if (norm(String(k).split("#")[0]) === t) { privN++; if (!dry) delete priv[k]; }
      });
      if (!dry && privN) jsave("aog.pop.private.v1", priv);
      add(T("Private notes", "Notas privadas"), privN);
    } catch (e) {}
    try {
      /* defensive shallow walk: assignment rows carry the code under
         studentId / sid / code — filter them wherever they sit one or two
         levels deep, and touch nothing whose shape isn't recognized */
      var asg = jload("aog.assign.v1", null); var asgN = 0;
      function filterArr(arr) {
        return arr.filter(function (r) {
          var id = r && (r.studentId || r.sid || r.code || r.student);
          var hit = id != null && norm(id) === t;
          if (hit) asgN++;
          return !hit;
        });
      }
      if (Array.isArray(asg)) asg = filterArr(asg);
      else if (asg && typeof asg === "object") {
        Object.keys(asg).forEach(function (k) {
          if (Array.isArray(asg[k])) asg[k] = filterArr(asg[k]);
          else if (asg[k] && typeof asg[k] === "object") {
            Object.keys(asg[k]).forEach(function (k2) {
              if (Array.isArray(asg[k][k2])) asg[k][k2] = filterArr(asg[k][k2]);
            });
          }
        });
      }
      if (!dry && asgN) jsave("aog.assign.v1", asg);
      add(T("Handed-out records", "Registros entregados"), asgN);
    } catch (e) {}

    /* small traces: the focus default, the remembered IEP tab, home-school
       code links, the last-used code */
    var traceN = 0;
    try {
      var links = jload("aog.tj.links", {}); var lk = 0;
      Object.keys(links).forEach(function (k) {
        if (norm(k) === t || norm(links[k]) === t) { lk++; if (!dry) delete links[k]; }
      });
      if (!dry && lk) jsave("aog.tj.links", links);
      traceN += lk;
    } catch (e) {}
    ["aog.tj.lastschool", "aog.iep.tab"].forEach(function (key) {
      try {
        if (norm(localStorage.getItem(key)) === t) { traceN++; if (!dry) localStorage.removeItem(key); }
      } catch (e) {}
    });
    try {
      var foc = jload("aog.student.focus", null);
      if (foc && norm(foc.code) === t) { traceN++; if (!dry) localStorage.removeItem("aog.student.focus"); }
    } catch (e) {}
    add(T("Small traces (focus, remembered tabs, code links)", "Rastros pequeños (enfoque, pestañas, enlaces de código)"), traceN);

    /* ⚠ THE TOMBSTONES ARE WRITTEN LAST, and only on a real run. A dry run
       itemizes counts for the confirm card and must leave no trace. */
    if (!dry) {
      pushGone("aog.checkin.removed.v1", TOMB.ci);
      pushGone("aog.exit.removed.v1", TOMB.ex);
      pushGone("aog.practice.removed.v1", TOMB.pr);
    }

    return { items: items, variants: Object.keys(variants) };
  }

  /* ── the card ────────────────────────────────────────────────────────── */
  function css() {
    if (el("aog-rm-css")) return;
    var s = document.createElement("style");
    s.id = "aog-rm-css";
    s.textContent = [
      "#aogRmCard .rm-list{margin:10px 0;padding:0;list-style:none;}",
      "#aogRmCard .rm-list li{padding:5px 0;border-bottom:1px solid var(--rule,#ddd);font-size:14px;display:flex;justify-content:space-between;gap:12px;}",
      "#aogRmCard .rm-list li b{font-variant-numeric:tabular-nums;}",
      "#aogRmCard .rm-danger{background:#8f2f3b;color:#fff;border:0;border-radius:9px;padding:10px 16px;font-weight:700;cursor:pointer;font-family:inherit;}",
      "#aogRmCard .rm-danger[disabled]{opacity:.45;cursor:not-allowed;}",
      "#aogRmCard .rm-note{font-size:12.5px;color:var(--ink-faint,#777);line-height:1.55;margin:10px 0 0;}",
      "#aogRmCard .rm-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0 0;}",
      "#aogRmCard input[type=text]{padding:9px 12px;border:1px solid var(--rule,#ccc);border-radius:9px;font-size:14px;min-width:180px;font-family:inherit;background:var(--paper,#fff);color:var(--ink,#222);}",
      "#aogRmCard .rm-ok{font-size:14px;line-height:1.55;}",
      "#aogRmCard label.rm-ack{display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.5;margin:12px 0;cursor:pointer;}"
    ].join("\n");
    document.head.appendChild(s);
  }

  var FOUND = null;   /* the last dry-run: {code, items, variants} */

  function sheetNote() {
    return T("This device only. If this student’s rows are still in your Sheet, they will come back on the next pull — delete them there too.",
             "Solo este dispositivo. Si las filas de este estudiante siguen en tu Hoja, volverán con la próxima descarga — bórralas también allí.");
  }

  function baseHtml() {
    return '<div class="section-head" style="margin-top:34px;"><h2>' +
        esc(T("Remove one student from this device", "Quitar a un estudiante de este dispositivo")) + "</h2></div>" +
      '<div class="table-card">' +
        '<p class="small">' + esc(T(
          "For a code that shouldn’t be here, like a test or a student who moved. This removes that one code from this device and nothing else. Not sure? Download a backup first.",
          "Para un código que no debería estar aquí, como una prueba o un estudiante que se fue. Esto quita solo ese código de este dispositivo. ¿No estás seguro? Descarga un respaldo primero.")) + "</p>" +
        '<div class="rm-row">' +
          '<input type="text" id="aogRmCode" list="aogRmList" placeholder="' +
            esc(T("Student code", "Código del estudiante")) + '" autocomplete="off">' +
          '<datalist id="aogRmList"></datalist>' +
          '<button type="button" class="btn btn-secondary btn-sm" id="aogRmFind">' +
            esc(T("Find their records", "Buscar sus registros")) + "</button>" +
        "</div>" +
        '<div id="aogRmOut"></div>' +
      "</div>";
  }

  function renderFound() {
    var out = el("aogRmOut");
    if (!out || !FOUND) return;
    if (!FOUND.items.length) {
      out.innerHTML = '<p class="rm-note">' + esc(T(
        "Nothing on this device is stored under that code.",
        "No hay nada en este dispositivo bajo ese código.")) + "</p>";
      return;
    }
    var who = FOUND.variants.length ? FOUND.variants.join(", ") : FOUND.code;
    out.innerHTML =
      '<p class="rm-ok" style="margin-top:14px;"><b>' + esc(who) + "</b> — " +
        esc(T("this is everything stored on this device:", "esto es todo lo guardado en este dispositivo:")) + "</p>" +
      '<ul class="rm-list">' + FOUND.items.map(function (it) {
        return "<li><span>" + esc(it.label) + (it.extra ? ' <span class="rm-note" style="margin:0;">· ' + esc(it.extra) + "</span>" : "") +
          "</span><b>" + it.n + "</b></li>";
      }).join("") + "</ul>" +
      '<label class="rm-ack"><input type="checkbox" id="aogRmAck"> ' + esc(T(
        "I understand these records will be removed from this device and cannot be brought back except from a backup.",
        "Entiendo que estos registros se quitarán de este dispositivo y solo un respaldo podría recuperarlos.")) + "</label>" +
      '<button type="button" class="rm-danger" id="aogRmGo" disabled>' + esc(T(
        "Remove these records", "Quitar estos registros")) + "</button>" +
      '<p class="rm-note">' + esc(sheetNote()) + "</p>";
    var ack = el("aogRmAck"), go = el("aogRmGo");
    if (ack) ack.addEventListener("change", function () { if (go) go.disabled = !ack.checked; });
    if (go) go.addEventListener("click", function () {
      var res = sweep(FOUND.code, false);
      try { if (window.AOGStudent && AOGStudent.forget) AOGStudent.forget(); } catch (e) {}
      var total = res.items.reduce(function (a, it) { return a + it.n; }, 0);
      out.innerHTML =
        '<p class="rm-ok" style="margin-top:14px;">✔ ' + esc(T(
          "Removed from this device — " + total + " record" + (total === 1 ? "" : "s") + " under ",
          "Quitado de este dispositivo — " + total + " registro" + (total === 1 ? "" : "s") + " bajo ")) +
          "<b>" + esc(FOUND.variants.join(", ") || FOUND.code) + "</b>.</p>" +
        '<p class="rm-note">' + esc(sheetNote()) + "</p>" +
        '<p class="rm-note">' + esc(T(
          "Panels refresh the next time you open them.",
          "Los paneles se actualizan la próxima vez que los abras.")) + "</p>";
      FOUND = null;
    });
  }

  function install() {
    var panel = el("panel-export");
    if (!panel || el("aogRmCard")) return;
    css();
    var host = document.createElement("div");
    host.id = "aogRmCard";
    host.innerHTML = baseHtml();
    panel.appendChild(host);
    var input = el("aogRmCode"), find = el("aogRmFind");
    if (input) input.addEventListener("focus", function () {
      var dl = el("aogRmList");
      if (!dl || dl.children.length) return;
      try {
        var codes = (window.AOGStudent && AOGStudent.codes) ? AOGStudent.codes() : [];
        dl.innerHTML = codes.map(function (c) { return '<option value="' + esc(c) + '">'; }).join("");
      } catch (e) {}
    });
    if (find) find.addEventListener("click", function () {
      var v = input ? input.value : "";
      if (!norm(v)) return;
      var res = sweep(v, true);
      FOUND = { code: v, items: res.items, variants: res.variants };
      renderFound();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.AOGRemoveStudent = { sweep: sweep, install: install };
})();
