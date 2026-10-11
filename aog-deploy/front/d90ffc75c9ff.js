
/* =====================================================================
   THE TEAM TAB · build 2026.08.29an

   What the other adults around ONE student sent in, and who saw what.

   ⚠ IT IS NOT A FILTERED DAILY LOG, and that was Jimmy's call. The Daily Log
   is one adult logging periods. This is the thing the Daily Log can never be:
   the same child seen from several rooms by several people, with each
   observation still attached to the person who made it.

   ⚠ NOTHING HERE COUNTS TOWARD ANYTHING. It reports how many entries, how
   many adults and how many periods exist, and names WHICH sentences each
   adult ticked. There is no percentage, no average, no ranking and no derived
   flag - the same rule the exit slip, the home observation and the unscored
   group all keep. A blank is never rendered as a finding: "not noted yet"
   means nobody ticked it, which is a different claim from it not happening,
   and the screen says that out loud rather than leaving it to be inferred.

   ⚠ NO NEW STORE, NO NEW WIRE, NO NEW SHEET COLUMN. It reads aog.daily.v1 -
   where saveEntry has always put these rows - and stops.
   ===================================================================== */
(function () {
  "use strict";
  var DKEY = "aog.daily.v1";
  function TX(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function isEs() { try { return (typeof DT === "function") && DT("en", "es") === "es"; } catch (e) { return false; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function el(id) { return document.getElementById(id); }
  function load() { try { return JSON.parse(localStorage.getItem(DKEY) || "{}") || {}; } catch (e) { return {}; } }
  function shortD(iso) { var p = String(iso || "").split("-"); return p.length === 3 ? (parseInt(p[1], 10) + "/" + parseInt(p[2], 10)) : iso; }
  function roleOf(v) { try { if (v && typeof window.aogRoleLabel === "function") return window.aogRoleLabel(v); } catch (e) {} return ""; }

  /* ⚠ WHAT MAKES A ROW A TEAM ROW: SOMEBODY SIGNED IT.
     Not `source === "link"` and not `checkinType === "support"` - a specialist
     can open the adult form from their own dashboard and that is still
     somebody else's observation once their name is on it. Jimmy's own Daily
     Log entries carry no respondentId at all, so this is the honest
     discriminator and the one that reads correctly on every row ever
     written, including rows pulled back from the Sheet. */
  function isTeam(p) { return !!(p && String(p.respondentId || "").trim()); }

  function students() {
    var logs = (load().logs) || {}, out = [];
    Object.keys(logs).forEach(function (sid) {
      var n = 0, days = logs[sid] || {};
      Object.keys(days).forEach(function (d) {
        ((days[d] || {}).periods || []).forEach(function (p) { if (isTeam(p)) n++; });
      });
      if (n) out.push({ id: sid, n: n });
    });
    return out.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  }

  function entriesFor(sid) {
    var days = ((load().logs) || {})[sid] || {}, out = [];
    Object.keys(days).forEach(function (d) {
      ((days[d] || {}).periods || []).forEach(function (p) { if (isTeam(p)) out.push({ date: d, p: p, sid: sid }); });
    });
    /* newest first - a support person opens this to see what just happened */
    return out.sort(function (a, b) {
      var x = String(a.p.timestamp || a.date), y = String(b.p.timestamp || b.date);
      return x < y ? 1 : (x > y ? -1 : 0);
    });
  }

  function sawGrid(rows, es) {
    var D = (window.AOG_OBS ? AOG_OBS.domains() : []);
    if (!D.length) return "";
    var body = D.map(function (d) {
      var who = {};
      rows.forEach(function (r) { if (r.p[d.key]) who[String(r.p.respondentId).trim()] = 1; });
      var names = Object.keys(who);
      return '<div class="tv-row"><div class="tv-dom">' + esc(es ? d.es : d.en) + "</div>" +
        '<div class="tv-who">' + (names.length
          ? names.map(function (n) { return '<span class="tv-name">' + esc(n) + "</span>"; }).join("")
          : '<span class="tv-none">' + esc(TX("Not noted yet", "Aún no se ha marcado")) + "</span>") +
        "</div></div>";
    }).join("");
    return '<div class="tv-card"><p class="tv-h">' + esc(TX("Who saw what", "Quién vio qué")) + "</p>" +
      '<div class="tv-grid">' + body + "</div>" +
      '<p class="tv-foot">' + esc(TX(
        "A blank means nobody ticked it. That is not the same as it not happening.",
        "Una casilla en blanco significa que nadie la marcó. No es lo mismo que no haya ocurrido.")) + "</p></div>";
  }

  /* ── Remove, on the Team tab  ·  .30dy ─────────────────────────────────
     Jimmy: "Please add a delete button on the page like that was just added
     to the EXIT SLIPS page. CAN YOU MAKE SURE SOMETHING LIKE THAT IS ON
     EVERYPAGE that allows information to be inputted?"

     ⚠ THE SAME CONTRACT, FOR THE FOURTH TIME, AND DELIBERATELY NOT A FOURTH
     ENGINE. This view reads aog.daily.v1, which AOGCheckins.remove already
     owns: undoable, tombstoned on the key mergeRemoteIntoDaily de-duplicates
     on, and it takes the unsent queue row with it. All this adds is the
     control and the sentence.
     ⚠ TWO PRESSES, NEVER A BROWSER DIALOG. ⚠ NO RED — these are a
     colleague's own words about a child, and a red control beside one would
     rank it. */
  var TVDEL = { said: "", last: null, t: 0 };
  function tvKey(r) {
    return String((r && r.sid) || "").trim().toUpperCase() + "|" + String((r && r.p && r.p.timestamp) || "");
  }
  function tvDelBtn(r) {
    return ' <button type="button" class="tv-del" data-tvdel="' + esc(tvKey(r)) + '"' +
      ' style="font:inherit;font-size:10.5px;font-weight:700;cursor:pointer;border:1px solid var(--rule,#E4DAC5);' +
      'background:var(--card,#fff);color:var(--ink-soft,#5b6675);border-radius:999px;padding:1px 9px;margin-left:8px;">' +
      esc(TX("Remove", "Quitar")) + "</button>";
  }
  /* ⚠ SAY THAT THE SHEET IS UNTOUCHED, every time. A teacher who thinks this
     cleared the Google Sheet will go looking for a row that is still there. */
  function tvRemovedLine(n) {
    return n === 1
      ? TX("Removed 1 entry. It will not come back the next time you pull. The row in your Google Sheet is untouched — delete it there if you want it gone from the Sheet too.",
           "Se quitó 1 entrada. No volverá la próxima vez que traigas datos. La fila de tu Hoja de Google queda intacta — bórrala allí si también quieres que desaparezca de la Hoja.")
      : TX("Removed " + n + " entries. They will not come back the next time you pull. The rows in your Google Sheet are untouched — delete them there if you want them gone from the Sheet too.",
           "Se quitaron " + n + " entradas. No volverán la próxima vez que traigas datos. Las filas de tu Hoja de Google quedan intactas — bórralas allí si también quieres que desaparezcan de la Hoja.");
  }
  function tvDelNote() {
    if (!TVDEL.said) return "";
    return '<p id="tvDelSaid" style="margin:0 0 14px;padding:9px 12px;border:1px solid var(--gold,#D9A33B);' +
      'border-radius:9px;background:var(--card,#fff);color:var(--ink,#22303F);font-size:12.5px;line-height:1.6;">' +
      esc(TVDEL.said) +
      (TVDEL.last ? ' <button type="button" id="tvDelUndo" style="font:inherit;font-size:12px;font-weight:800;' +
        'cursor:pointer;border:1px solid var(--gold,#D9A33B);background:var(--card,#fff);color:var(--ink,#22303F);' +
        'border-radius:999px;padding:2px 12px;margin-left:8px;">' + esc(TX("Undo", "Deshacer")) + "</button>" : "") +
      "</p>";
  }
  function tvDisarm() {
    try { clearTimeout(TVDEL.t); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll(".tv-del[data-armed]"), function (o) {
      var was = o.getAttribute("data-was");
      o.removeAttribute("data-armed");
      if (was != null) { o.textContent = was; o.removeAttribute("data-was"); }
    });
  }
  function tvRepaint() { try { window.aogRenderTeam(); } catch (e) {} }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#tvDelUndo")) {
      var n = 0;
      try { n = (window.AOGCheckins && AOGCheckins.restore(TVDEL.last || [])) || 0; } catch (x) {}
      TVDEL.last = null;
      TVDEL.said = n
        ? (n === 1 ? TX("Put 1 entry back.", "Se devolvió 1 entrada.")
                   : TX("Put " + n + " entries back.", "Se devolvieron " + n + " entradas."))
        : TX("Nothing to put back.", "No hay nada que devolver.");
      tvRepaint();
      return;
    }
    var b = t.closest(".tv-del");
    if (!b) { tvDisarm(); return; }
    e.preventDefault(); e.stopPropagation();
    var key = b.getAttribute("data-tvdel");
    if (!key) return;
    if (b.getAttribute("data-armed")) {
      tvDisarm();
      var took = [];
      try { took = (window.AOGCheckins && AOGCheckins.remove([key])) || []; } catch (x2) {}
      TVDEL.last = took.length ? took : null;
      TVDEL.said = took.length ? tvRemovedLine(took.length) : TX("Nothing to remove.", "No hay nada que quitar.");
      tvRepaint();
      return;
    }
    tvDisarm();
    b.setAttribute("data-was", b.textContent);
    b.setAttribute("data-armed", "1");
    b.textContent = TX("Press again to remove", "Presiona otra vez para quitar");
    try { clearTimeout(TVDEL.t); } catch (x3) {}
    TVDEL.t = setTimeout(tvDisarm, 6000);
  });

  function entryHtml(r, es) {
    var p = r.p, seen = [], flags = [];
    if (p.obs && p.obs.length && window.AOG_OBS) {
      p.obs.forEach(function (k) { var s = AOG_OBS.shortOf(k, es); if (s) seen.push(s); });
    } else {
      /* a row written before .29al carries domains but no sentences */
      (window.AOG_OBS ? AOG_OBS.domains() : []).forEach(function (d) {
        if (p[d.key]) seen.push(es ? d.s_es : d.s_en);
      });
    }
    (p.flags || []).forEach(function (k) { var s = window.AOG_OBS ? AOG_OBS.shortOf(k, es) : ""; if (s) flags.push(s); });
    return '<div class="tv-entry"><div class="tv-when">' + esc(shortD(r.date)) +
        (p.period ? '<span class="tv-per">' + esc(p.period) + "</span>" : "") + "</div>" +
      '<div class="tv-ebody">' +
        '<div class="tv-head">' + esc(String(p.respondentId).trim()) +
          (roleOf(p.respondentRole) ? ' <span class="tv-role">' + esc(roleOf(p.respondentRole)) + "</span>" : "") +
          (p.followUp ? ' <span class="tv-ask">' + esc(TX("asked to talk", "pidió hablar")) + "</span>" : "") +
        tvDelBtn(r) +
        "</div>" +
        '<div class="tv-saw">' + (seen.length ? esc(seen.join(" · "))
          : '<span class="tv-none">' + esc(TX("Nothing stood out this period", "Nada destacó en este periodo")) + "</span>") + "</div>" +
        (flags.length ? '<div class="tv-share">' + esc(TX("Worth passing on: ", "Vale la pena compartir: ") + flags.join(" · ")) + "</div>" : "") +
        (p.note ? '<div class="tv-note">“' + esc(p.note) + '”</div>' : "") +
      "</div></div>";
  }

  function emptyHtml() {
    return '<div class="tv-wrap"><h2 class="tv-h1">' + esc(TX("Team", "Equipo")) + "</h2>" +
      '<p class="tv-lede">' + esc(TX(
        "What the other adults around one student sent in. Nothing has arrived yet.",
        "Lo que enviaron los demás adultos alrededor de un estudiante. Todavía no ha llegado nada.")) + "</p>" +
      '<div class="tv-card"><p class="tv-empty">' + esc(TX(
        "Notes show up here when someone answers the Adult team check-in link. Make one in Set up ▸ Distribute ▸ Adult team check-in and send it to the adults who work with this student.",
        "Las notas aparecen aquí cuando alguien responde el enlace del registro del equipo de adultos. Créalo en Configurar ▸ Distribuir ▸ Registro del equipo y envíalo a los adultos que trabajan con este estudiante.")) + "</p>" +
      '<button type="button" class="tv-btn" id="tvGo">' + esc(TX("Go to Distribute", "Ir a Repartir")) + "</button></div></div>";
  }

  var ST = { s: "" };

  window.aogRenderTeam = function () {
    var host = el("panel-support");
    if (!host) return;
    css();
    var es = isEs();
    var list = students();
    if (!list.length) { host.innerHTML = emptyHtml(); wireEmpty(); return; }
    if (!ST.s || !list.some(function (x) { return x.id === ST.s; })) ST.s = list[0].id;

    var rows = entriesFor(ST.s), adults = {}, periods = {};
    rows.forEach(function (r) {
      adults[String(r.p.respondentId).trim()] = 1;
      if (r.p.period) periods[r.p.period] = 1;
    });
    var nA = Object.keys(adults).length, nP = Object.keys(periods).length;
    function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

    host.innerHTML =
      '<div class="tv-wrap">' +
        '<h2 class="tv-h1">' + esc(TX("Team", "Equipo")) + "</h2>" +
        '<p class="tv-lede">' + esc(TX(
          "What the other adults around this student sent in through the Adult team check-in. Entries you typed yourself stay on the Daily Log tab.",
          "Lo que enviaron los demás adultos alrededor de este estudiante por el Registro del equipo de adultos. Las entradas que escribiste tú siguen en el Registro diario.")) + "</p>" +
        '<div class="tv-controls"><label for="tvStudent">' + esc(TX("Student", "Estudiante")) + "</label>" +
          '<select id="tvStudent">' + list.map(function (x) {
            return '<option value="' + esc(x.id) + '"' + (x.id === ST.s ? " selected" : "") + ">" +
              esc(x.id) + " · " + plural(x.n, TX("entry", "entrada"), TX("entries", "entradas")) + "</option>";
          }).join("") + "</select></div>" +
        /* ⚠ COUNTS OF WHAT EXISTS, NEVER A SCORE. No percentage, no average,
           no x-of-y - three plain facts about how much of a picture there is. */
        '<p class="tv-sum">' + esc(
          plural(rows.length, TX("entry", "entrada"), TX("entries", "entradas")) + " · " +
          plural(nA, TX("adult", "adulto"), TX("adults", "adultos")) + " · " +
          plural(nP, TX("period", "periodo"), TX("periods", "periodos"))) + "</p>" +
        sawGrid(rows, es) +
        /* EACH DAY FOLDS - Jimmy, first night in production: "will these
           eventually fold up in an accordion?" Yes: the newest day is open,
           every earlier day is one summary line until tapped, and a day
           holding a talk request wears the flag on its CLOSED fold - a
           student who asked for an adult is never foldable out of sight. */
        tvDelNote() +
        '<div class="tv-card"><p class="tv-h">' + esc(TX("Every entry", "Cada entrada")) + "</p>" +
          (function () {
            var order = [], byDay = {};
            rows.forEach(function (r) {
              if (!byDay[r.date]) { byDay[r.date] = []; order.push(r.date); }
              byDay[r.date].push(r);
            });
            return order.map(function (d, di) {
              var dayRows = byDay[d];
              var who2 = {}, talk = false;
              dayRows.forEach(function (r) {
                if (r.p && r.p.followUp) talk = true;
                var w = String((r.p && r.p.respondentId) || "").trim(); if (w) who2[w] = 1;
              });
              var na2 = Object.keys(who2).length;
              var mm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
              var dl = mm ? (parseInt(mm[2], 10) + "/" + parseInt(mm[3], 10)) : d;
              var meta2 = plural(dayRows.length, TX("entry", "entrada"), TX("entries", "entradas"))
                + (na2 ? " · " + plural(na2, TX("adult", "adulto"), TX("adults", "adultos")) : "");
              return '<details' + (di === 0 ? " open" : "") + ' class="tv-dayfold" style="margin:0 0 8px;">' +
                '<summary style="cursor:pointer;font-size:12.5px;font-weight:800;color:var(--ink,#22303F);padding:7px 0;border-top:1px solid var(--rule,#E4DAC5);">' +
                esc(dl) + ' <span style="font-weight:600;color:var(--ink-soft,#5b6675);">· ' + esc(meta2) + "</span>" +
                (talk ? ' <span style="font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);border:1px solid var(--gold,#D9A33B);border-radius:999px;padding:1px 8px;">' + esc(TX("asked to talk", "pidió hablar")) + "</span>" : "") +
                "</summary>" +
                dayRows.map(function (r) { return entryHtml(r, es); }).join("") +
                "</details>";
            }).join("");
          })() + "</div>" +
        '<p class="tv-priv">' + esc(TX(
          "These are staff observations, not the student's own words. They are on this device and in your Sheet, and nothing here is shown to the student.",
          "Son observaciones del personal, no las palabras del estudiante. Están en este dispositivo y en tu Hoja, y nada de esto se le muestra al estudiante.")) + "</p>" +
      "</div>";

    var sel = el("tvStudent");
    if (sel) sel.addEventListener("change", function () { ST.s = sel.value; window.aogRenderTeam(); });
  };

  function wireEmpty() {
    var b = el("tvGo");
    if (b) b.addEventListener("click", function () {
      try { localStorage.setItem("aog.dist.tab", "support"); } catch (e) {}
      try { if (window.aogSetDashMode) window.aogSetDashMode("setup"); } catch (e) {}
    });
  }

  function css() {
    if (el("aog-tv-css")) return;
    var s = document.createElement("style");
    s.id = "aog-tv-css";
    /* ⚠ --ink AND --ink-soft, NEVER --navy FOR TEXT. .29al painted four group
       headings navy onto the dark theme's navy ground and no suite saw it. */
    s.textContent = [
      "#panel-support .tv-wrap{max-width:980px;}",
      "#panel-support .tv-h1{font-family:var(--font-serif,Georgia,serif);font-size:26px;font-weight:600;color:var(--ink,#22303F);margin:0 0 6px;}",
      "#panel-support .tv-lede{font-size:14px;line-height:1.65;color:var(--ink-soft,#46506E);max-width:72ch;margin:0 0 16px;}",
      "#panel-support .tv-controls{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;max-width:340px;}",
      "#panel-support .tv-controls label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft,#46506E);}",
      "#panel-support select{font:inherit;font-size:15px;color:var(--ink,#22303F);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:10px;padding:10px 12px;}",
      "#panel-support .tv-sum{font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);margin:0 0 14px;}",
      "#panel-support .tv-card{background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:14px;padding:18px 20px;margin-bottom:16px;}",
      "#panel-support .tv-h{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink,#22303F);margin:0 0 12px;padding-bottom:6px;border-bottom:2px solid var(--gold,#D9A33B);}",
      "#panel-support .tv-row{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--rule,rgba(10,30,51,.1));}",
      "#panel-support .tv-row:last-child{border-bottom:0;}",
      "#panel-support .tv-dom{flex:0 0 190px;font-size:13px;font-weight:700;color:var(--ink,#22303F);}",
      "#panel-support .tv-who{flex:1 1 220px;display:flex;flex-wrap:wrap;gap:6px;}",
      "#panel-support .tv-name{font-size:12px;font-weight:700;color:var(--ink,#22303F);background:rgba(217,163,59,.16);border-radius:999px;padding:2px 10px;}",
      "#panel-support .tv-none{font-size:12.5px;color:var(--ink-soft,#46506E);font-style:italic;}",
      "#panel-support .tv-foot{font-size:12px;line-height:1.55;color:var(--ink-soft,#46506E);margin:12px 0 0;}",
      "#panel-support .tv-entry{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--rule,rgba(10,30,51,.1));}",
      "#panel-support .tv-entry:last-child{border-bottom:0;}",
      "#panel-support .tv-when{flex:0 0 92px;font-size:12px;font-weight:700;color:var(--ink-soft,#46506E);}",
      "#panel-support .tv-per{display:block;font-weight:500;}",
      "#panel-support .tv-ebody{flex:1 1 auto;min-width:0;}",
      "#panel-support .tv-head{font-size:14px;font-weight:800;color:var(--ink,#22303F);}",
      "#panel-support .tv-role{font-weight:500;color:var(--ink-soft,#46506E);}",
      "#panel-support .tv-ask{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);border:1px solid var(--gold,#D9A33B);border-radius:999px;padding:0 7px;margin-left:6px;vertical-align:middle;}",
      "#panel-support .tv-saw{font-size:13.5px;line-height:1.55;color:var(--ink,#22303F);margin-top:2px;}",
      "#panel-support .tv-share{font-size:12.5px;line-height:1.5;color:var(--gold-deep,#9a6f24);font-weight:700;margin-top:3px;}",
      "#panel-support .tv-note{font-size:13px;line-height:1.55;color:var(--ink-soft,#46506E);margin-top:3px;}",
      "#panel-support .tv-empty{font-size:14px;line-height:1.65;color:var(--ink-soft,#46506E);margin:0 0 14px;}",
      "#panel-support .tv-btn{font:inherit;font-size:14.5px;font-weight:800;color:#fff;background:var(--navy,#0A1E33);border:0;border-radius:999px;padding:11px 22px;cursor:pointer;}",
      "#panel-support .tv-priv{font-size:12.5px;line-height:1.6;color:var(--ink-soft,#46506E);border-top:1px solid var(--rule,#E4DAC5);padding-top:12px;}",
      "@media (max-width:560px){#panel-support .tv-dom{flex:1 1 100%;}#panel-support .tv-entry{flex-direction:column;gap:4px;}#panel-support .tv-when{flex:none;}#panel-support .tv-per{display:inline;margin-left:8px;}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ⚠ WRAPPERS ON refreshAdmin MUST CARRY EACH OTHER'S FLAGS. Six already wrap
     it; one that drops their properties makes them wrap AGAIN on their next
     retry - the .29k double-card bug. Copy every own property across. */
  function wrapRefresh() {
    var f = window.refreshAdmin;
    if (typeof f !== "function" || f.__aogTeam) return;
    var w = function () {
      var r = f.apply(this, arguments);
      try {
        var p = el("panel-support");
        if (p && p.classList.contains("active")) window.aogRenderTeam();
      } catch (e) {}
      return r;
    };
    for (var k in f) { try { w[k] = f[k]; } catch (e) {} }
    w.__aogTeam = true;
    window.refreshAdmin = w;
  }

  function init() {
    wrapRefresh();
    if (!window.refreshAdmin || !window.refreshAdmin.__aogTeam) setTimeout(wrapRefresh, 700);
    try { var p = el("panel-support"); if (p && p.classList.contains("active")) window.aogRenderTeam(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
