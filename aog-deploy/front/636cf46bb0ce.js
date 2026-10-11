
(function () {
  "use strict";

  var STORE = "aog.practice.remote";
  var MOUNT = "aogPracticeChart";
  var who = null;                 /* the selected student, module-level on purpose:
                                     it survives refreshAdmin and dies with the tab */

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
  function num(v) { return (v === 0 || (v && !isNaN(Number(v)))) ? Number(v) : null; }
  function when(r) { return String(r.date || r.timestamp || "").slice(0, 10); }
  function shortDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? (+m[2]) + "/" + (+m[3]) : (iso || "");
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

  /* A row is chartable only if it has a date, an independent count and a
     denominator. m9 scores in ways produced and has neither — it stays in the
     table and is deliberately absent from every picture rather than being
     flattened onto an axis that does not fit it. */
  function chartable(r) {
    return !!(r && when(r) && num(r.independent) !== null && num(r.itemsTotal));
  }

  /* ⚠ AOG-PCHART-ONEACT-V1 — ONE STUDENT, HOWEVER THEY SIGNED IT. The key was
     the raw signature, so "Jimmy Ramsden" and "Jimmy  Ramsden" were two
     children with two chips and two half-records — which is exactly what the
     sheet warns will happen, and the dashboard had no reason to repeat the
     mistake. Case and runs of whitespace fold; NOTHING ELSE DOES. Two children
     really called the same thing still merge, and that is the honest limit of
     a name as an identifier — a roster code is the fix for that, not a guess.
     The first spelling seen is the label, so the chip reads the way a person
     typed it. The shape returned is unchanged, so the print card merges too. */
  function byStudent() {
    var m = {}, label = {};
    rows().forEach(function (r) {
      var raw = String((r && r.studentId) || "").trim();
      if (!raw) return;
      var k = raw.replace(/\s+/g, " ").toLowerCase();
      var name = label[k] || (label[k] = raw.replace(/\s+/g, " "));
      (m[name] = m[name] || []).push(r);
    });
    return m;
  }

  /* ⚠⚠ AOG-PCHART-ONEACT-V1 — THE SET NUMBER IS THE X AXIS, NOT THE IDENTITY.
     Daily Drafts builds its activityId as dd-<subject>-g<grade>-s<sheet>, and
     this grouped on the WHOLE id — so every sheet became its own activity with
     its own picture and, almost always, a single dot. The page then printed
     "a picture needs two — run the next set and this becomes a line" under it,
     which was the opposite of true: running the next set changed the id and
     started a NEW chart. Jimmy had eleven pictures and one line, and the one
     line only existed because he happened to run set 15 twice.
     The chart already prints "set N" under each point, so the set was always
     meant to be a position, not a name. Trailing -s<N> is stripped from dd- ids
     and from nothing else — a c-series or m-series id is its own activity and
     is left exactly as it is.
     ⚠ SHEETS OF ONE SUBJECT DO NOT SHARE A DENOMINATOR. Sheet 19 may hold 12
     items and sheet 20 nineteen, so raw counts cannot share an axis: 12 of 12
     would sit below 15 of 20. A series with more than one total is drawn as a
     PERCENTAGE, and every point still prints its own ind/tot so the raw truth
     is on the page. A series with one total is drawn in items, as before. */
  function actKey(r) {
    var id = String(r.activityId || r.activityName || "?");
    return /^dd-/i.test(id) ? id.replace(/-s\d+$/i, "") : id;
  }

  /* one series per activity, oldest first; same date + same set = one probe,
     and the later row wins, because a student who taps Send twice has not
     been probed twice */
  function seriesFor(list) {
    var byAct = {};
    list.filter(chartable).forEach(function (r) {
      var id = actKey(r);
      var a = byAct[id] || (byAct[id] = {
        id: id,
        name: String(r.activityName || r.activityId || ""),
        skill: String(r.skill || ""),
        seen: {}, pts: []
      });
      var key = when(r) + "|" + (num(r.setNo) || 0);
      var pt = {
        key: key, d: when(r), set: num(r.setNo),
        ind: num(r.independent), sup: num(r.supported) || 0,
        tot: num(r.itemsTotal), hints: num(r.hintsUsed), conf: num(r.confidence),
        ts: String(r.timestamp || r.date || ""),
        /* AOG-IEP-REC-V1 — carried so an IEP point can say HOW it was earned */
        supports: String(r.supports || ""), stds: String(r.standards || "")
      };
      var had = a.seen[key];
      if (had && String(had.ts) > String(pt.ts)) return;
      if (had) { a.pts[a.pts.indexOf(had)] = pt; a.seen[key] = pt; return; }
      a.seen[key] = pt; a.pts.push(pt);
    });
    return Object.keys(byAct).map(function (k) {
      var a = byAct[k];
      /* two sheets sent the same day read left to right in set order */
      a.pts.sort(function (x, y) {
        return x.d < y.d ? -1 : (x.d > y.d ? 1 : ((x.set || 0) - (y.set || 0)));
      });
      a.tot = a.pts.reduce(function (m, p) { return Math.max(m, p.tot || 0); }, 0);
      var tots = {};
      a.pts.forEach(function (p) { if (p.tot) tots[p.tot] = 1; });
      a.mixed = Object.keys(tots).length > 1;
      a.pts.forEach(function (p) { p.pct = p.tot ? Math.round(p.ind / p.tot * 100) : 0; });
      a.last = a.pts[a.pts.length - 1];
      a.rate = a.tot ? (a.last.ind / a.tot) : 0;
      return a;
    }).sort(function (x, y) { return y.pts.length - x.pts.length; });
  }

  /* ── the picture ─────────────────────────────────────────────────────
     Fixed viewBox, width:100%. Nothing is carried by color alone: every
     value is also printed as a number, so the picture survives a grayscale
     photocopy and a color-blind reader with equal honesty. */
  function svg(a) {
    /* L is far enough right that the first point's value label clears the
       axis numbers — at 40 the two sat on top of each other at value 5 */
    var n = a.pts.length, tot = a.tot || 10;
    var W = 560, H = 178, L = 56, R = 546, TOP = 16, BOT = 122;
    /* AOG-PCHART-PCT-V1 — one activity's sheets can hold 12 items and 19. Raw
       counts on one axis would put 12 of 12 BELOW 15 of 20, which is backwards.
       A mixed series is drawn as a percentage and every point still prints its
       own ind/tot, so nothing is hidden behind the scaling. */
    var mixed = !!a.mixed, top = mixed ? 100 : tot;
    var val    = function (p) { return mixed ? (p.tot ? Math.round(p.ind / p.tot * 100) : 0) : p.ind; };
    var valSup = function (p) {
      return mixed ? (p.tot ? Math.min(100, Math.round((p.ind + p.sup) / p.tot * 100)) : 0)
                   : Math.min(tot, p.ind + p.sup); };
    var lab    = function (p) { return mixed ? (p.ind + "/" + p.tot) : String(p.ind); };
    var x = function (i) { return n === 1 ? (L + R) / 2 : L + (R - L) * (i / (n - 1)); };
    var y = function (v) { return BOT - (BOT - TOP) * (Math.max(0, Math.min(top, v)) / top); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="'
          + esc(mixed
              ? T("Independent as a percentage over " + n + " probe" + (n === 1 ? "" : "s"),
                  "Independiente en porcentaje en " + n + " sondeo" + (n === 1 ? "" : "s"))
              : T("Independent out of " + tot + " over " + n + " probe" + (n === 1 ? "" : "s"),
                  "Independiente de " + tot + " en " + n + " sondeo" + (n === 1 ? "" : "s"))) + '">';

    /* the axis: 0, half, full — three lines and no more */
    [0, top / 2, top].forEach(function (v) {
      var yy = y(v);
      s += '<line x1="' + L + '" y1="' + yy + '" x2="' + R + '" y2="' + yy
         + '" stroke="var(--rule,#E4DAC5)" stroke-width="1"/>'
         + '<text x="' + (L - 8) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="11"'
         + ' fill="var(--ink-faint,#646E86)">' + (Math.round(v * 10) / 10) + (mixed ? "%" : "") + '</text>';
    });

    /* what a hint was still carrying: the band between independent and
       independent+supported, drawn UNDER the line it qualifies */
    if (n > 1) {
      var up = [], dn = [];
      a.pts.forEach(function (p, i) {
        up.push(x(i) + "," + y(valSup(p)));
        dn.unshift(x(i) + "," + y(val(p)));
      });
      s += '<polygon points="' + up.concat(dn).join(" ") + '" fill="var(--gold,#D9A33B)"'
         + ' fill-opacity=".22" stroke="var(--gold-deep,#7E5B18)" stroke-width="1"'
         + ' stroke-dasharray="3 3" stroke-opacity=".7"/>';
      s += '<polyline points="' + a.pts.map(function (p, i) { return x(i) + "," + y(val(p)); }).join(" ")
         + '" fill="none" stroke="var(--green,#2E6B3A)" stroke-width="2.5"'
         + ' stroke-linejoin="round" stroke-linecap="round"/>';
    }

    a.pts.forEach(function (p, i) {
      var px = x(i);
      if (p.sup) {
        s += '<circle cx="' + px + '" cy="' + y(valSup(p)) + '" r="3"'
           + ' fill="var(--gold-deep,#7E5B18)"/>';
      }
      /* ⚠⚠ AOG-PCHART-LABELFIT-V1 — THE VALUE LABEL HAS TO GET OUT OF THE WAY OF
         TWO THINGS. Above the top gridline there is nowhere to put it, and a
         percentage series lives up there: 100% sat on top of the axis's own
         "100%", so a label with no room above its dot goes below it. And the
         end labels ran into the axis numbers on the left and off the plate on
         the right — "17/19" is four characters wider than "21" — so the first
         label starts at its dot and the last one ends at its dot. Only the
         middle ones are centered. */
      var ly = y(val(p)) - 10;
      if (ly < TOP + 6) ly = y(val(p)) + 17;
      var anc = (i === 0 && n > 1) ? "start" : ((i === n - 1 && n > 1) ? "end" : "middle");
      var lx = px + (anc === "start" ? -2 : (anc === "end" ? 2 : 0));
      s += '<circle cx="' + px + '" cy="' + y(val(p)) + '" r="4.5" fill="var(--green,#2E6B3A)"/>'
         + '<text x="' + lx + '" y="' + ly + '" text-anchor="' + anc + '" font-size="12"'
         + ' font-weight="700" fill="var(--ink,#0A1E33)">' + esc(lab(p)) + '</text>'
         + '<text x="' + px + '" y="' + (BOT + 18) + '" text-anchor="middle" font-size="11"'
         + ' fill="var(--ink-soft,#46506E)">' + esc(shortDate(p.d)) + '</text>'
         + (p.set ? '<text x="' + px + '" y="' + (BOT + 32) + '" text-anchor="middle" font-size="10"'
                  + ' fill="var(--ink-faint,#646E86)">' + esc(T("set ", "grupo ")) + p.set + '</text>' : '')
         + (p.hints === null ? '' :
              '<text x="' + px + '" y="' + (BOT + 48) + '" text-anchor="middle" font-size="10"'
            + ' fill="var(--ink-faint,#646E86)">' + p.hints + '</text>');
    });
    s += '<text x="' + (L - 8) + '" y="' + (BOT + 48) + '" text-anchor="end" font-size="10"'
       + ' fill="var(--ink-faint,#646E86)">' + esc(T("hints", "pistas")) + '</text>';
    return s + '</svg>';
  }

  /* ── the read ────────────────────────────────────────────────────────
     Every sentence here is a comparison of numbers that are on the page.
     None of it is a prediction, and a change small enough to be noise is
     named as noise rather than reported as growth. */
  function says(a) {
    var p = a.pts, n = p.length, tot = a.tot, out = [];
    var first = p[0], last = p[n - 1];
    /* AOG-PCHART-PCT-V1 — the sentence uses the unit the PICTURE uses, or it
       would report a rise the line does not show. `noise` is one item on a
       single-total series and five points on a percentage one. */
    var mixed = !!a.mixed;
    var V = function (q) { return mixed ? (q.tot ? Math.round(q.ind / q.tot * 100) : 0) : q.ind; };
    var U = mixed ? "%" : (" out of " + tot);
    var noise = mixed ? 5 : 1;
    if (n === 1) {
      out.push(T("One probe, on " + shortDate(first.d) + ". A picture needs two — run the next set and this becomes a line.",
                 "Un solo sondeo, el " + shortDate(first.d) + ". Una imagen necesita dos — aplica el siguiente grupo y esto se vuelve una línea."));
    } else {
      var delta = V(last) - V(first);
      var seq = p.map(function (q) { return V(q) + (mixed ? "%" : ""); }).join(" → ");
      if (n === 2) {
        /* AOG-PCHART-SAMESAME-V1 — "21 → 21. That is a difference" was on Jimmy's
           screen, and it is not a difference. Two equal probes are the one
           honest thing this sentence could not say. */
        out.push(delta === 0
          ? T("Two probes, both " + V(first) + (mixed ? "%" : U) + ". No change between them yet.",
              "Dos sondeos, ambos " + V(first) + (mixed ? "%" : " de " + tot) + ". Todavía no hay cambio entre ellos.")
          : T("Two probes: " + seq + (mixed ? "" : U) + ". That is a difference, not yet a trend.",
              "Dos sondeos: " + seq + (mixed ? "" : " de " + tot) + ". Eso es una diferencia, todavía no una tendencia."));
      } else if (Math.abs(delta) <= noise) {
        out.push(T(seq + (mixed ? "" : U) + " across " + n + " probes. A difference this small sits inside the noise — it is holding steady, not moving.",
                   seq + (mixed ? "" : " de " + tot) + " en " + n + " sondeos. Una diferencia tan pequeña está dentro del ruido — se mantiene, no se mueve."));
      } else if (delta > 0) {
        var dips = p.some(function (q, i) { return i && V(q) < V(p[i - 1]); });
        out.push(T("Up " + delta + (mixed ? " points" : "") + " across " + n + " probes: " + seq + (mixed ? "" : U) + "."
                   + (dips ? " It has not gone up every single time, which is normal." : ""),
                   "Sube " + delta + (mixed ? " puntos" : "") + " en " + n + " sondeos: " + seq + (mixed ? "" : " de " + tot) + "."
                   + (dips ? " No ha subido todas las veces, lo cual es normal." : "")));
      } else {
        out.push(T("Down " + Math.abs(delta) + (mixed ? " points" : "") + " across " + n + " probes: " + seq + (mixed ? "" : U)
                   + ". Worth asking what changed before changing the teaching.",
                   "Baja " + Math.abs(delta) + (mixed ? " puntos" : "") + " en " + n + " sondeos: " + seq + (mixed ? "" : " de " + tot)
                   + ". Vale la pena preguntar qué cambió antes de cambiar la enseñanza."));
      }
      var h0 = first.hints, h1 = last.hints;
      if (h0 !== null && h1 !== null && h0 > 0) {
        if (h1 === 0) {
          out.push(T("Hints went " + h0 + " → 0. Independent went up while the help went away, which is the shape of a skill becoming their own.",
                     "Las pistas pasaron de " + h0 + " a 0. Lo independiente subió mientras la ayuda desaparecía — esa es la forma de una destreza que se vuelve propia."));
        } else if (h1 > h0) {
          out.push(T("Hints are rising, not falling — " + h0 + " → " + h1 + ".",
                     "Las pistas suben en lugar de bajar — " + h0 + " → " + h1 + "."));
        }
      }
    }
    if (last.sup > last.ind) {
      out.push(T("On the most recent probe more was solved with a hint (" + last.sup + ") than without one (" + last.ind + "). The skill is emerging, not established.",
                 "En el sondeo más reciente se resolvió más con pista (" + last.sup + ") que sin ella (" + last.ind + "). La destreza está emergiendo, no establecida."));
    }
    if (last.conf !== null && tot) {
      var gap = (last.conf / 5) - (last.ind / tot);
      if (gap >= 0.35) {
        out.push(T("Confidence (" + last.conf + " of 5) is well above the result — worth one sentence with the student.",
                   "La confianza (" + last.conf + " de 5) está muy por encima del resultado — vale una frase con el estudiante."));
      } else if (gap <= -0.35) {
        out.push(T("The result is well above the confidence (" + last.conf + " of 5) — they did better than they think, and should be told so.",
                   "El resultado está muy por encima de la confianza (" + last.conf + " de 5) — les fue mejor de lo que creen, y hay que decírselo."));
      }
    }
    return out;
  }

  /* where the next teaching is: the activity whose most recent probe is
     lowest, named only when ONE is lowest and it is not already solid */
  function weakest(list) {
    var real = list.filter(function (a) { return a.tot; });
    if (real.length < 2) return null;
    var lo = real.slice().sort(function (x, y) { return x.rate - y.rate; })[0];
    if (real.filter(function (a) { return a.rate === lo.rate; }).length !== 1) return null;
    if (lo.rate >= 0.9) return null;
    return lo;
  }

  function mount() {
    var card = document.getElementById("aogPracticeCard");
    var host = (window.aogSheetHost && window.aogSheetHost()) || document.getElementById("panel-daily");
    if (!host) return null;
    var c = document.getElementById(MOUNT);
    if (!c) {
      c = document.createElement("div");
      c.id = MOUNT;
      if (card && card.parentNode === host) host.insertBefore(c, card);
      else host.appendChild(c);
    } else if (card && card.parentNode === host && c.nextElementSibling !== card) {
      host.insertBefore(c, card);
    }
    return c;
  }

  function render() {
    var c = mount();
    if (!c) return;
    var m = byStudent();
    var names = Object.keys(m).filter(function (k) { return m[k].some(chartable); })
                  .sort(function (a, b) { return m[b].length - m[a].length || (a < b ? -1 : 1); });
    if (!names.length) { c.hidden = true; c.innerHTML = ""; return; }
    c.hidden = false;
    if (names.indexOf(who) === -1) who = names[0];

    var list = seriesFor(m[who]);
    var h =
      '<div class="gc-ey">' + esc(T("From the Sheet", "Desde la hoja")) + '</div>'
      + '<h3>' + esc(T("Brick by brick", "Ladrillo a ladrillo")) + '</h3>'
      + '<p class="gc-sub">' + esc(T(
          "One graph per activity. The line is what the student got right with no hint. The shaded part above it is what they got with a hint.",
          "Una gráfica por actividad. La línea es lo que el estudiante acertó sin pista. La parte sombreada encima es lo que logró con una pista."))
      + '</p>'
      + '<div class="gc-who"><span class="gc-lb">' + esc(T("Student", "Estudiante")) + '</span>'
      + names.map(function (s) {
          return '<button type="button" class="gc-chip" data-gcwho="' + esc(s) + '" aria-pressed="'
               + (s === who ? "true" : "false") + '">' + esc(s) + '</button>';
        }).join("")
      + '</div>';

    var w = weakest(list);
    if (w) {
      h += '<p class="gc-next">' + esc(T("Next brick: ", "Próximo ladrillo: "))
         + '<b>' + esc(w.name) + '</b>'
         + esc(T(" — " + w.last.ind + " of " + w.tot + " without a hint on " + shortDate(w.last.d)
                 + ", the lowest of the " + list.length + " activities " + who + " has sent.",
                 " — " + w.last.ind + " de " + w.tot + " sin pista el " + shortDate(w.last.d)
                 + ", la más baja de las " + list.length + " actividades que " + who + " ha enviado."))
         + '</p>';
    }

    h += list.map(function (a) {
      return '<div class="gc-act">'
        + '<div class="gc-an">' + esc(a.name) + '</div>'
        + (a.skill ? '<div class="gc-as">' + esc(a.skill) + '</div>' : "")
        + '<div class="gc-grid"><div>' + svg(a)
        +   '<p class="gc-key"><i class="k-ind"></i>' + esc(T("solved with no hint", "resuelto sin pista"))
        +     '&nbsp;&nbsp; <i class="k-sup"></i>' + esc(T("also solved after a hint", "también resuelto tras una pista"))
        +   '</p>'
        + '</div><div><ul class="gc-says">'
        +   says(a).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join("")
        + '</ul></div></div></div>';
    }).join("");

    h += '<p class="gc-hold">' + esc(T(
        "Drawn from rows students chose to send. It is progress-monitoring evidence, not a grade, and an activity a student has never sent has no line here — that is a gap in the record, not in the student.",
        "Dibujado con las filas que los estudiantes eligieron enviar. Es evidencia de monitoreo, no una calificación, y una actividad que un estudiante nunca envió no tiene línea aquí — eso es un hueco en el registro, no en el estudiante.")) + '</p>';

    c.innerHTML = h;
  }

  /* AOG-PRACTICE-FOLD-V1 — open one folded activity. Delegated, because the
     table is rebuilt from scratch on every pull and a bound handler would be
     left on a detached node — the same fault that stopped Daily Drafts
     sending for weeks (AOG-DD-REWIRE-V1). */
  document.addEventListener("click", function (e) {
    var f = e.target && e.target.closest ? e.target.closest("[data-pcfold]") : null;
    if (!f) return;
    var id = f.getAttribute("data-pcfold");
    var open = f.getAttribute("aria-expanded") !== "true";
    f.setAttribute("aria-expanded", open ? "true" : "false");
    var rows = document.querySelectorAll('tr[data-pcsub="' + id + '"]');
    Array.prototype.forEach.call(rows, function (r) {
      if (open) r.removeAttribute("hidden"); else r.setAttribute("hidden", "");
    });
  });

  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-gcwho]") : null;
    if (!b) return;
    var c = document.getElementById(MOUNT);
    if (!c || !c.contains(b)) return;
    who = b.getAttribute("data-gcwho");
    render();
  });

  /* AOG-PRACTICE-PRINT-V1 reads the math, the picture and the read from
     HERE rather than keeping its own. A second copy of seriesFor()/svg()/
     says() plus a drift test would be worse than one copy that cannot drift.
     current() is the chip selection - module-scoped on purpose, and it dies
     with the tab. */
  window.AOG_PRACTICE = {
    rows: rows, byStudent: byStudent, seriesFor: seriesFor, chartable: chartable,
    svg: svg, says: says, weakest: weakest, shortDate: shortDate,
    T: T, esc: esc, isEs: isEs, current: function () { return who; },
    /* ⚠⚠ .30i1 — ONE SELECTION, ONE OWNER. Jimmy: "IN print a practice
       record or the probe I do not see the TESTER at all just the ID NUMBER
       STDUENT." The print card named whoever these chips had selected and
       carried NO WAY TO CHANGE IT — the picker was in a different card
       further down the page, so with three students on the Sheet two of them
       were unreachable from the buttons that print them. The print card now
       has chips of its own and they do NOT keep a second `who`: they set
       THIS one and let the chart repaint, so the two cards can never name
       different children. */
    select: function (s) {
      if (s == null) return who;
      who = String(s);
      try { render(); } catch (e) {}
      return who;
    }
  };

  window.aogRenderPracticeChart = render;

  /* ⚠ CARRY THE OTHER WRAPPERS' FLAGS. Several blocks wrap aogRenderPractice
     and refreshAdmin, each guarding on its own __flag; a wrapper that drops
     the others makes them wrap again on their next retry. */
  function wrap(name, flag) {
    var orig = window[name];
    if (typeof orig !== "function" || orig[flag]) return false;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      try { render(); } catch (e) {}
      return r;
    };
    wrapped[flag] = true;
    try {
      Object.keys(orig).forEach(function (k) {
        if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
      });
    } catch (eF) {}
    window[name] = wrapped;
    return true;
  }
  (function hook() {
    function go() {
      wrap("aogRenderPractice", "__aogPChart");
      wrap("refreshAdmin", "__aogPChartAdmin");
      try { render(); } catch (e) {}
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 1200);
    setTimeout(go, 2800);
  })();
})();
