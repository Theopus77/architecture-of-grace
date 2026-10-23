/* AOG-DASH-STANDARDS-V1 (2026-10-23) — "Standards shown" on the Educator Dashboard (/dashboard#standards).
   Jimmy: make the curriculum the showstopper for districts, "young to the old".

   dashboard.html loads this file only when the Standards shown view opens, and hands it the rows it already
   pulled (data(): aog.practice.remote plus this device's own sends). No new Sheet request.

   A course row (series "course", or activityId "crs-<course>-u<n>-…") carries course, unit, assessment,
   pctCorrect (first try) and standards (codes joined by "; "), from AOG_IEP.fill. When a row came without
   codes, its unit's codes come from course-data/<course>-plan.json (units[n].std); lesson checks never take
   them, and a spiral review takes each earlier unit's codes with that unit's own score from byStrand
   ("Unit 1 2/3; …"). A standard sits under the unit whose plan lists it. The plan files load only for the
   courses that appear, once, the first time this view opens.

   The label is calm and plain: 3 or more checks averaging 80% or more on the first try = Shown; any check =
   Working on it; never checked = not listed. Print gives white paper, one student per page. */
(function () {
  "use strict";
  if (window.AOG_DSTD) return;

  var PLANS = {}, waiting = 0, again = null;

  function plan(cid) {
    var e = PLANS[cid];
    if (e) return e;
    e = PLANS[cid] = { st: "loading" };
    if (!/^[a-z0-9]{2,6}$/.test(cid)) { e.st = "none"; return e; }
    waiting++;
    fetch("/course-data/" + cid + "-plan.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (p) { e.st = "ok"; e.p = p; e.ix = index(p); }, function () { e.st = "none"; })
      .then(function () { waiting--; if (!waiting && again) { var f = again; again = null; f(); } });
    return e;
  }
  /* code -> its words, and code -> the units whose plan lists it, in plan order */
  function index(p) {
    var ix = { text: {}, units: {}, order: {} }, U = (p && p.units) || {}, i = 0;
    Object.keys(U).map(Number).filter(function (n) { return !isNaN(n); }).sort(function (a, b) { return a - b; }).forEach(function (n) {
      (U[n].std || []).forEach(function (s) {
        var c = String(s && s[0] || "").trim(); if (!c) return;
        if (!(c in ix.text)) { ix.text[c] = String(s[1] || ""); ix.order[c] = i++; }
        (ix.units[c] = ix.units[c] || []).push(n);
      });
    });
    return ix;
  }

  function X(r) { try { return typeof r.extra === "string" ? JSON.parse(r.extra || "{}") : (r.extra || {}); } catch (e) { return {}; } }
  function num(v) { if (v === "" || v == null) return null; var n = +v; return isFinite(n) ? n : null; }
  function score(r) {
    var p = num(r.pctCorrect); if (p != null) return p;
    var c = num(r.correct), t = num(r.total); if (t > 0 && c != null) return 100 * c / t;
    c = num(r.independent); t = num(r.itemsTotal); if (t > 0 && c != null) return 100 * c / t;
    return null;
  }
  function courseOf(r) {
    var m = /^crs-([a-z0-9]+)-u(\d+)-(.+)$/i.exec(String(r.activityId || "")), ex = X(r);
    if (!m && !r.course && ex.series !== "course") return null;
    var c = String(r.course || (m && m[1]) || "").trim().toLowerCase();
    if (!c) return null;
    var u = parseInt(r.unit, 10); if (isNaN(u)) u = m ? +m[2] : parseInt(ex.unit, 10);
    var rid = m ? m[3] : String(ex.review || ""), a = String(r.assessment || "").trim();
    if (!a || a === "practice") a = /^chk-/.test(rid) ? "lesson-check" : /^s\d/.test(rid) ? "spiral" : /^t\d/.test(rid) ? "unit-test" : /^r\d/.test(rid) ? "chapter-review" : a;
    return { c: c, u: isNaN(u) ? 0 : u, a: a };
  }
  function strands(r) {
    var o = {}, re = /Unit\s+(\d+)\s+(\d+)\s*\/\s*(\d+)/gi, m, s = String(r.byStrand || "");
    while ((m = re.exec(s))) { if (+m[3] > 0) o[+m[1]] = 100 * (+m[2]) / (+m[3]); }
    return o;
  }

  /* one student's course rows -> { course: { unit: { code: {n, scored, sum, last} } } } */
  function tally(prs, ctx) {
    var out = {};
    prs.forEach(function (r) {
      var k = courseOf(r); if (!k) return;
      var P = plan(k.c), ix = P.st === "ok" ? P.ix : null, U = (P.p && P.p.units) || {};
      var codes = String(r.standards || "").split(";").map(function (s) { return s.trim(); }).filter(Boolean);
      var st = strands(r), all = score(r);
      if (!codes.length && ix && k.a !== "lesson-check") {
        var from = k.a === "spiral" ? Object.keys(st).map(Number) : [k.u];
        from.forEach(function (n) { ((U[n] && U[n].std) || []).forEach(function (s) { if (s && s[0]) codes.push(String(s[0]).trim()); }); });
      }
      var seen = {};
      codes.forEach(function (code) {
        if (seen[code]) return; seen[code] = 1;
        var lists = ix && ix.units[code], home = k.u;
        if (lists && lists.length && lists.indexOf(k.u) < 0) home = lists[0];
        var sc = (home in st) ? st[home] : all;
        var cu = out[k.c] = out[k.c] || {}, un = cu[home] = cu[home] || {}, e = un[code] = un[code] || { n: 0, scored: 0, sum: 0, last: "" };
        e.n++; if (sc != null) { e.scored++; e.sum += sc; }
        var d = ctx.day(r); if (d > e.last) e.last = d;
      });
    });
    return out;
  }
  function shown(e) { return e.scored >= 3 && e.sum / e.scored >= 80; }

  function pickNames(D, ctx) {
    return Object.keys(D.S).filter(function (n) { return D.S[n].pr.some(function (r) { return !!courseOf(r); }); })
      .sort(function (a, b) { return a.localeCompare(b); });
  }

  function studentBlock(name, s, ctx) {
    var t2 = ctx.t2, esc = ctx.esc, es = t2("en", "es") === "es", T = tally(s.pr, ctx), nS = 0, nW = 0, body = "";
    Object.keys(T).sort(function (a, b) {
      var pa = PLANS[a] && PLANS[a].p, pb = PLANS[b] && PLANS[b].p;
      return String((pa && pa.name) || a).localeCompare(String((pb && pb.name) || b));
    }).forEach(function (cid) {
      var P = PLANS[cid] || {}, p = P.p || {}, ix = P.ix, U = p.units || {};
      var cname = (es && p.namee) || p.name || cid.toUpperCase();
      body += '<div class="dstd-course"><p class="k dstd-cn">' + esc(cname) + (p.fw ? ' <span class="dstd-fw">· ' + esc(p.fw) + '</span>' : '') + '</p>';
      Object.keys(T[cid]).map(Number).sort(function (a, b) { return a - b; }).forEach(function (u) {
        var un = U[u] || {}, ut = (es && un.te) || un.t || "";
        var codes = Object.keys(T[cid][u]).sort(function (a, b) {
          var oa = ix && a in ix.order ? ix.order[a] : 1e9, ob = ix && b in ix.order ? ix.order[b] : 1e9;
          return oa - ob || a.localeCompare(b);
        });
        body += '<p class="dstd-unit">' + t2("Unit", "Unidad") + ' ' + u + (ut ? ' · ' + esc(ut) : '') + '</p>'
          + '<table class="tbl dstd-tbl"><thead><tr><th>' + t2("Standard", "Estándar") + '</th><th>' + t2("Times checked", "Veces revisado") + '</th><th>' + t2("First-try average", "Promedio al primer intento") + '</th><th>' + t2("Latest", "Más reciente") + '</th><th>' + t2("Where it stands", "Cómo va") + '</th></tr></thead><tbody>'
          + codes.map(function (code) {
            var e = T[cid][u][code], ok = shown(e), words = ix && ix.text[code];
            if (ok) nS++; else nW++;
            return '<tr><td><b class="dstd-code">' + esc(code) + '</b>' + (words ? '<span class="dstd-words">' + esc(words) + '</span>' : '') + '</td>'
              + '<td>' + e.n + '</td><td>' + (e.scored ? Math.round(e.sum / e.scored) + '%' : '—') + '</td><td>' + ctx.nice(e.last) + '</td>'
              + '<td><span class="chip dstd-lab' + (ok ? ' good' : '') + '">' + (ok ? t2("Shown", "Demostrado") : t2("Working on it", "Trabajando en ello")) + '</span></td></tr>';
          }).join("") + '</tbody></table>';
      });
      body += '</div>';
    });
    return '<section class="card dstd-stu"><h2 class="dstd-name">' + esc(name) + '</h2><p class="s dstd-sum">'
      + nS + ' ' + t2("shown", "demostrados") + ' · ' + nW + ' ' + t2("working on it", "trabajando en ello") + '</p>' + body + '</section>';
  }

  var CSS = '#dstd .dstd-ctl{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}'
    + '#dstd .dstd-ctl label{display:block;font-weight:700;margin:0 0 4px}'
    + '#dstd .dstd-ctl select{font-size:16px;min-height:44px;min-width:220px;max-width:100%}'
    + '#dstd .dstd-key{margin:0 0 16px}'
    + '#dstd .dstd-stu{margin:0 0 18px}'
    + '#dstd .dstd-name{margin:0 0 2px}'
    + '#dstd .dstd-sum{margin:0 0 6px}'
    + '#dstd .dstd-course{margin-top:14px}'
    + '#dstd .dstd-cn{color:var(--goldInk);margin:0 0 4px}'
    + '#dstd .dstd-fw{font-weight:600;letter-spacing:0;text-transform:none}'
    + '#dstd .dstd-unit{font-weight:700;margin:12px 0 2px;color:var(--ink)}'
    + '#dstd .dstd-code{display:block}'
    + '#dstd .dstd-words{display:block;color:var(--soft);font-size:15px;line-height:1.45;margin-top:2px}'
    + '#dstd .dstd-tbl td:nth-child(n+2){white-space:nowrap}'
    + '@media (min-width:761px){#dstd .dstd-tbl{table-layout:fixed}#dstd .dstd-tbl th:nth-child(2){width:96px}#dstd .dstd-tbl th:nth-child(3){width:120px}#dstd .dstd-tbl th:nth-child(4){width:92px}#dstd .dstd-tbl th:nth-child(5){width:158px}}'
    + '#dstd .dstd-lab{margin:0}'
    + '@media (max-width:760px){#dstd .dstd-tbl td:nth-child(n+2){white-space:normal}#dstd .dstd-ctl select{min-width:0;width:100%}#dstd .dstd-ctl{width:100%}}'
    + '@media print{html,body{background:#fff!important}'
    + '#dstd,#dstd *{color:#1a232c!important;background:transparent!important;box-shadow:none!important}'
    + '#dstd .card{background:#fff!important;border:0!important;padding:0!important}'
    + '#dstd .dstd-words{color:#3d4752!important}#dstd .dstd-cn{color:#5c4410!important}'
    + '#dstd .chip{border:1px solid #888!important}#dstd .dstd-lab.good{border-color:#1E5A38!important;color:#1E5A38!important}'
    + '#dstd .tbl th,#dstd .tbl td{border-color:#ccc!important}'
    + '#dstd .dstd-stu{break-inside:auto}#dstd .dstd-stu~.dstd-stu{break-before:page}'
    + '#dstd .tbl tr{break-inside:avoid}#dstd .dstd-key,#dstd .dstd-ctl{display:none!important}}';
  function css() {
    if (document.getElementById("aog-dstd-css")) return;
    var s = document.createElement("style"); s.id = "aog-dstd-css"; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ctx: {D, t2, esc, nice, day, sel, title, onPage(), rerender()} */
  function html(ctx) {
    css();
    var t2 = ctx.t2, esc = ctx.esc, D = ctx.D, names = pickNames(D, ctx);
    var head = '<div class="hello"><div><h1>' + esc(ctx.title) + '</h1><p>'
      + t2("The standards each student has shown in the course tests and reviews they send.", "Los estándares que cada estudiante ha demostrado en los exámenes y repasos que envía.") + '</p></div>';
    if (!names.length) {
      return '<div id="dstd">' + head + '</div><section class="card"><p class="s" style="margin:0">'
        + t2("When students send a unit test or review from a course, their standards show up here.", "Cuando los estudiantes envían un examen o un repaso de un curso, sus estándares aparecen aquí.") + '</p></section></div>';
    }
    var sel = names.indexOf(ctx.sel) >= 0 ? ctx.sel : "";
    var ctl = '<div class="dstd-ctl"><div><label for="stdStu">' + t2("Show", "Mostrar") + '</label><select id="stdStu"><option value="">' + t2("The whole class", "Toda la clase") + '</option>'
      + names.map(function (n) { return '<option value="' + esc(n) + '"' + (n === sel ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join("")
      + '</select></div><button class="btn" type="button" id="stdPrint">🖨 ' + t2("Print", "Imprimir") + '</button></div></div>';
    var show = sel ? [sel] : names;
    /* the plan files for these courses: fetched once, the page draws again when they are all in */
    show.forEach(function (n) { D.S[n].pr.forEach(function (r) { var k = courseOf(r); if (k) plan(k.c); }); });
    if (waiting) {
      again = function () { if (ctx.onPage()) ctx.rerender(); };
      return '<div id="dstd">' + head + ctl + '<section class="card"><p class="s" style="margin:0">' + t2("Getting the standards’ words…", "Trayendo las palabras de los estándares…") + '</p></section></div>';
    }
    var key = '<p class="s dstd-key"><b>' + t2("Shown", "Demostrado") + '</b>: ' + t2("3 or more checks, 80% or more right on the first try.", "3 o más revisiones, 80% o más bien al primer intento.")
      + ' <b>' + t2("Working on it", "Trabajando en ello") + '</b>: ' + t2("checked at least once.", "revisado al menos una vez.") + '</p>';
    return '<div id="dstd">' + head + ctl + key + show.map(function (n) { return studentBlock(n, D.S[n], ctx); }).join("") + '</div>';
  }

  window.AOG_DSTD = { html: html, _tally: tally, _courseOf: courseOf };
})();
