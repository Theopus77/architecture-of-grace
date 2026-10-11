
(function () {
  "use strict";

  var STORE = "aog.practice.remote";

  function isEs() {
    try { if (typeof dashLang !== "undefined") return dashLang === "es"; } catch (e) {}
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
    catch (e2) { return false; }
  }
  function T(en, es) { return isEs() ? es : en; }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function rows() {
    try {
      var a = JSON.parse(localStorage.getItem(STORE) || "[]");
      a = Object.prototype.toString.call(a) === "[object Array]" ? a : [];
      /* a removed row never comes back — not here, not on the next pull */
      try { if (window.aogPracticeDel) a = window.aogPracticeDel.live(a); } catch (eDel) {}
      return a;
    } catch (e) { return []; }
  }
  function when(r) {
    var v = String(r.date || r.timestamp || "");
    return v ? v.slice(0, 10) : "";
  }
  /* newest first; a blank date sorts last rather than to the top */
  function sorted(list) {
    return list.slice().sort(function (a, b) {
      var x = String(a.timestamp || a.date || ""), y = String(b.timestamp || b.date || "");
      if (!x) return 1;
      if (!y) return -1;
      return y < x ? -1 : (y > x ? 1 : 0);
    });
  }
  function num(v) { return (v === 0 || (v && !isNaN(Number(v)))) ? Number(v) : null; }

  /* ── Remove, on the practice card  ·  .30ej ────────────────────────────
     Jimmy: "The science sheets have no place for a delete." The .30dy rule —
     a Remove wherever information can land — reaches the last pulled surface
     that was still missing its control. ⚠ DELIBERATELY NOT A SEVENTH ENGINE:
     aogPracticeDel (.30ec) already owns the store, the tombstones and the
     re-pull immunity; this adds only the button and the sentence, exactly as
     the Team tab did over AOGCheckins in .30dy.
     ⚠ TWO PRESSES, NEVER A BROWSER DIALOG — the button arms itself, says in
     words what it is about to do, and disarms after six seconds.
     ⚠ NO RED AND NO NEW COLOR. A red control beside a probe row would rank
     it, and this panel exists not to do that.
     ⚠ ONE KEY CAN BE TWO ROWS: a student who tapped Send twice made two
     copies of the same probe (same student|activity|date|set), and both go
     together — the sentence counts what was actually taken. */
  var PDEL = { said: "", last: null, t: 0 };
  function pdelKey(r) {
    try { return window.aogPracticeDel ? window.aogPracticeDel.keyOf(r) : ""; }
    catch (e) { return ""; }
  }
  function pdelBtn(r) {
    var k = pdelKey(r);
    if (!k) return "";
    return '<button type="button" class="pc-del" data-pcdel="' + esc(k) + '"' +
      ' style="font:inherit;font-size:10.5px;font-weight:700;cursor:pointer;border:1px solid var(--rule,#E4DAC5);' +
      'background:var(--card,#fff);color:var(--ink-soft,#5b6675);border-radius:999px;padding:1px 9px;">' +
      esc(T("Remove", "Quitar")) + "</button>";
  }
  /* ⚠ SAY THAT THE SHEET IS UNTOUCHED, on the screen, every time — the same
     sentence as every other Remove on this dashboard, for the same reason. */
  function pdelLine(n) {
    return n === 1
      ? T("Removed 1 row. It will not come back the next time you pull. The row in your Google Sheet is untouched — delete it there if you want it gone from the Sheet too.",
          "Se quitó 1 fila. No volverá la próxima vez que traigas datos. La fila de tu Hoja de Google queda intacta — bórrala allí si también quieres que desaparezca de la Hoja.")
      : T("Removed " + n + " rows. They will not come back the next time you pull. The rows in your Google Sheet are untouched — delete them there if you want them gone from the Sheet too.",
          "Se quitaron " + n + " filas. No volverán la próxima vez que traigas datos. Las filas de tu Hoja de Google quedan intactas — bórralas allí si también quieres que desaparezcan de la Hoja.");
  }
  /* ⚠ --card, --ink, --gold and --rule all carry dark values; --cream does
     not — the .30dp lesson about a notice that inverted with the theme. */
  function pdelNote() {
    if (!PDEL.said) return "";
    return '<div id="pcDelSaid" style="margin:12px 0 0;padding:9px 12px;border:1px solid var(--gold,#D9A33B);' +
      'border-radius:9px;background:var(--card,#fff);color:var(--ink,#22303F);font-size:12.5px;line-height:1.6;">' +
      esc(PDEL.said) +
      (PDEL.last
        ? ' <button type="button" id="pcDelUndo" style="font:inherit;font-size:12px;font-weight:800;cursor:pointer;' +
          'border:1px solid var(--gold,#D9A33B);background:var(--card,#fff);color:var(--ink,#22303F);' +
          'border-radius:999px;padding:2px 12px;margin-left:8px;">' + esc(T("Undo", "Deshacer")) + "</button>"
        : "") +
      "</div>";
  }
  function pdelDisarm() {
    try { clearTimeout(PDEL.t); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll(".pc-del[data-armed]"), function (o) {
      var was = o.getAttribute("data-was");
      o.removeAttribute("data-armed");
      if (was != null) { o.textContent = was; o.removeAttribute("data-was"); }
    });
  }
  /* Delegated, because the card sets its own innerHTML on every render — a
     listener bound to a button would not survive its own click. Note that
     aogPracticeDel.remove/restore already repaint the card, the chart and
     the print bar; render() runs once more AFTER the state is set so the
     notice actually appears. */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#pcDelUndo")) {
      var n = 0;
      try { n = (window.aogPracticeDel && window.aogPracticeDel.restore(PDEL.last || [])) || 0; } catch (x) {}
      PDEL.last = null;
      PDEL.said = n
        ? (n === 1 ? T("Put 1 row back.", "Se devolvió 1 fila.")
                   : T("Put " + n + " rows back.", "Se devolvieron " + n + " filas."))
        : T("Nothing to put back.", "No hay nada que devolver.");
      render();
      return;
    }
    var b = t.closest(".pc-del");
    if (!b) { pdelDisarm(); return; }
    e.preventDefault();
    var key = b.getAttribute("data-pcdel");
    if (!key) return;
    if (b.getAttribute("data-armed")) {
      pdelDisarm();
      var took = [];
      try { took = (window.aogPracticeDel && window.aogPracticeDel.remove([key])) || []; } catch (x2) {}
      PDEL.last = took.length ? took : null;
      PDEL.said = took.length ? pdelLine(took.length) : T("Nothing to remove.", "No hay nada que quitar.");
      render();
      return;
    }
    pdelDisarm();
    b.setAttribute("data-was", b.textContent);
    b.setAttribute("data-armed", "1");
    b.textContent = T("Press again to remove", "Presiona otra vez para quitar");
    try { clearTimeout(PDEL.t); } catch (x3) {}
    PDEL.t = setTimeout(pdelDisarm, 6000);
  });

  function card() {
    var host = (window.aogSheetHost && window.aogSheetHost()) || document.getElementById("panel-daily");
    if (!host) return null;
    var c = document.getElementById("aogPracticeCard");
    if (!c) {
      c = document.createElement("div");
      c.id = "aogPracticeCard";
      /* the panel opens with its own <style>; sit after it, above the log */
      var first = host.firstElementChild;
      while (first && first.tagName === "STYLE") first = first.nextElementSibling;
      if (first) host.insertBefore(c, first); else host.appendChild(c);
    }
    return c;
  }

  function render() {
    var c = card();
    if (!c) return;
    var all = sorted(rows());
    var CAP = 40;
    var show = all.slice(0, CAP);

    var head =
      '<div class="pc-top"><div>'
      + '<div class="pc-ey">' + esc(T("From the Sheet", "Desde la hoja")) + '</div>'
      + '<h3>' + esc(T("Practice", "Práctica")) + '</h3>'
      + '</div><div class="pc-count">' + all.length + ' '
      + esc(all.length === 1 ? T("row", "fila") : T("rows", "filas")) + '</div></div>'
      + '<p class="pc-sub">' + esc(T(
          "One row per activity, newest first. Open a row to see every send, each with its own Remove. Independent means solved with no hint; supported means solved after a hint. Both count. Confidence is the student’s own rating, not a score.",
          "Una fila por actividad, la más reciente primero. Abre una fila para ver cada envío, cada uno con su Quitar. Independiente significa resuelto sin pista; con apoyo, resuelto tras una pista. Ambos cuentan. La confianza es la calificación del propio estudiante, no un puntaje."))
      + '</p>';

    if (!all.length) {
      /* pdelNote here too: removing the LAST row lands on this branch, and
         the Undo must not vanish with the table it undoes. */
      c.innerHTML = head + '<div class="pc-empty">' + esc(T(
        "Nothing yet. When a student finishes an activity, it goes to the Practice tab of your Sheet. Tap Pull from sheet above to bring it here.",
        "Nada todavía. Cuando un estudiante termina una actividad, va a la pestaña Practice de tu Hoja. Toca Traer de la hoja arriba para verla aquí.")) + '</div>'
        + pdelNote();
      return;
    }

    /* ══ AOG-PRACTICE-FOLD-V1 (2026-09-19) ═══════════════════════════════
       ONE ROW PER ACTIVITY, NOT ONE PER SEND. Jimmy had eleven Daily Drafts
       rows for one child and one subject, because every sheet sent its own
       row and the table listed each one. The growth chart above had the same
       fault and was fixed first; this is the same two rules applied to the
       table, so the two halves of the card can never disagree about what
       counts as one activity:
         · the SET NUMBER IS NOT THE IDENTITY — dd-<subject>-g<grade>-s<sheet>
           folds to dd-<subject>-g<grade>, and nothing else is touched
         · "Jimmy Ramsden" and "Jimmy  Ramsden" are one student
       ⚠ A GROUP OF ONE IS NOT FOLDED. Putting a disclosure triangle on a
       single send would be noise pretending to be structure.
       ⚠ THE SENDS ARE STILL ALL THERE, one tap down, each with its own
       Remove. Nothing is summarized away — the summary row carries the
       NEWEST send, and says how many are underneath it. */
    function foldAct(r) {
      var id = String(r.activityId || r.activityName || "?");
      return /^dd-/i.test(id) ? id.replace(/-s\d+$/i, "") : id;
    }
    function foldWho(r) {
      return String(r.studentId || "").replace(/\s+/g, " ").trim().toLowerCase();
    }
    function cells(r, sub) {
      var ind = num(r.independent), sup = num(r.supported), tot = num(r.itemsTotal);
      var res;
      if (ind === null && sup === null) {
        /* a module that scores in its own currency says so rather than
           showing a blank where a count should be */
        res = '<span class="pc-dim">' + esc(T("counted its own way", "contado a su manera")) + '</span>';
      } else {
        res = '<span class="pc-ind">' + (ind === null ? "—" : ind) + '</span>'
            + (tot ? '<span class="pc-dim"> / ' + tot + '</span>' : '')
            + ' <span class="pc-dim">' + esc(T("indep.", "indep.")) + '</span>'
            + (sup ? ' · <span class="pc-sup">' + sup + '</span> <span class="pc-dim">'
                     + esc(T("supp.", "apoy.")) + '</span>' : '');
      }
      var conf = num(r.confidence), hints = num(r.hintsUsed);
      return { res: res, hints: (hints === null ? "—" : hints),
               conf: (conf === null ? "—" : conf + " / 5"),
               when: esc(when(r)) + (num(r.setNo)
                 ? ' <span class="pc-dim">· ' + esc(T("set ", "grupo ")) + num(r.setNo) + '</span>' : '') };
    }

    var groups = [], seenG = {};
    show.forEach(function (r) {
      var k = foldWho(r) + "|" + foldAct(r);
      if (!seenG[k]) { seenG[k] = { k: k, rows: [] }; groups.push(seenG[k]); }
      seenG[k].rows.push(r);
    });

    var body = groups.map(function (g, gi) {
      var top = g.rows[0], n = g.rows.length, c0 = cells(top);
      var act = '<td class="pc-act">' + esc(top.activityName || top.activityId || "")
              + (top.skill ? '<span class="pc-skill">' + esc(top.skill) + '</span>' : '') + '</td>';
      if (n === 1) {
        return '<tr>'
          + '<td class="pc-sid">' + esc(top.studentId) + '</td>' + act
          + '<td class="pc-n">' + c0.res + '</td>'
          + '<td class="pc-n pc-dim">' + c0.hints + '</td>'
          + '<td class="pc-n pc-dim">' + c0.conf + '</td>'
          + '<td class="pc-n pc-dim">' + c0.when + '</td>'
          + '<td class="pc-n">' + pdelBtn(top) + '</td></tr>';
      }
      var gid = "pcg" + gi;
      var head = '<tr class="pc-grp">'
        + '<td class="pc-sid">' + esc(top.studentId) + '</td>'
        + '<td class="pc-act">' + esc(top.activityName || top.activityId || "")
        +   (top.skill ? '<span class="pc-skill">' + esc(top.skill) + '</span>' : '')
        +   '<button type="button" class="pc-fold" data-pcfold="' + gid + '" aria-expanded="false">'
        +     '<span class="pc-caret">▸</span> '
        +     esc(n + " " + T(n === 1 ? "send" : "sends", n === 1 ? "envío" : "envíos"))
        +   '</button>'
        + '</td>'
        + '<td class="pc-n">' + c0.res
        +   '<span class="pc-skill">' + esc(T("newest of " + n, "el más reciente de " + n)) + '</span></td>'
        + '<td class="pc-n pc-dim">' + c0.hints + '</td>'
        + '<td class="pc-n pc-dim">' + c0.conf + '</td>'
        + '<td class="pc-n pc-dim">' + c0.when + '</td>'
        + '<td class="pc-n"></td></tr>';
      return head + g.rows.map(function (r) {
        var c = cells(r, true);
        return '<tr class="pc-sub" data-pcsub="' + gid + '" hidden>'
          + '<td class="pc-sid"></td>'
          + '<td class="pc-act pc-dim">↳ ' + esc(T("send", "envío")) + '</td>'
          + '<td class="pc-n">' + c.res + '</td>'
          + '<td class="pc-n pc-dim">' + c.hints + '</td>'
          + '<td class="pc-n pc-dim">' + c.conf + '</td>'
          + '<td class="pc-n pc-dim">' + c.when + '</td>'
          + '<td class="pc-n">' + pdelBtn(r) + '</td></tr>';
      }).join("");
    }).join("");

    c.innerHTML = head
      + '<div class="pc-scroll"><table><thead><tr>'
      + '<th>' + esc(T("Student", "Estudiante")) + '</th>'
      + '<th>' + esc(T("Activity", "Actividad")) + '</th>'
      + '<th>' + esc(T("Result", "Resultado")) + '</th>'
      + '<th>' + esc(T("Hints", "Pistas")) + '</th>'
      + '<th>' + esc(T("Confidence", "Confianza")) + '</th>'
      + '<th>' + esc(T("When", "Cuándo")) + '</th>'
      /* the Remove column: the buttons name themselves, the header stays quiet */
      + '<th aria-hidden="true"></th>'
      + '</tr></thead><tbody>' + body + '</tbody></table></div>'
      + pdelNote()
      + (all.length > CAP
          ? '<p class="pc-more">' + esc(T("Showing the newest " + CAP + " of " + all.length + ". The rest are in the Practice tab of your Sheet.",
                                          "Mostrando las " + CAP + " más recientes de " + all.length + ". El resto está en la pestaña Practice de tu hoja.")) + '</p>'
          : "");
  }

  window.aogRenderPractice = render;

  /* ⚠ THE DASHBOARD'S LANGUAGE SWITCH DOES NOT TOUCH documentElement.lang —
     applyDashLang sets dashLang and calls refreshAdmin, so that is what to
     hang on. And CARRY THE OTHER WRAPPERS' FLAGS: several blocks wrap
     refreshAdmin, each guarding on its own, and a wrapper that drops the
     others makes them wrap again on their next retry. */
  (function hook() {
    function go() {
      if (typeof window.refreshAdmin !== "function" || window.refreshAdmin.__aogPractice) {
        try { render(); } catch (e) {}
        return;
      }
      var orig = window.refreshAdmin;
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        try { render(); } catch (e) {}
        return r;
      };
      wrapped.__aogPractice = true;
      try {
        Object.keys(orig).forEach(function (k) {
          if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
        });
      } catch (eF) {}
      window.refreshAdmin = wrapped;
      try { render(); } catch (e2) {}
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 1200);
    setTimeout(go, 2800);
  })();
})();
