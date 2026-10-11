
(function () {
  "use strict";

  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function jsave(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function shortD(iso) {
    var p = String(iso || "").slice(0, 10).split("-");
    return p.length === 3 ? (parseInt(p[1], 10) + "/" + parseInt(p[2], 10)) : iso;
  }

  var FKEY = "aog.followup.v1";

  var DOMS = [
    { k: "A", norm: "normA", en: "Emotional Regulation & Well-Being", es: "Regulación emocional y bienestar", q: "emotional regulation" },
    { k: "B", norm: "normB", en: "Self-Compassion & Growth Mindset",  es: "Autocompasión y mentalidad de crecimiento", q: "self-compassion" },
    { k: "C", norm: "normC", en: "Social Competency & Repair",        es: "Competencia social y reparación", q: "repair" }
  ];
  function csBand(grade) {
    var g = String(grade == null ? "" : grade).trim().toLowerCase();
    if (g.indexOf("adult") >= 0 || g === "college") return "adult";
    if (g === "k" || g === "kg") return "k2";
    var n = parseInt(g, 10);
    if (isNaN(n)) return "68";
    if (n <= 2) return "k2";
    if (n <= 5) return "35";
    if (n <= 8) return "68";
    return "912";
  }
  function starterFor(domKey, grade, salt) {
    try {
      var D = window.AOG_CS_DATA; if (!D) return null;
      var bank = D[csBand(grade)] || D["68"] || D["35"];
      var items = bank && bank[domKey];
      if (!items || !items.length) return null;
      var d = new Date();
      var day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
      var o = items[(day + (salt || 0)) % items.length];
      return (typeof dashLang !== "undefined" && dashLang === "es") ? (o.es || o.en) : o.en;
    } catch (e) { return null; }
  }

  /* ------------------------------------------------- everything about one kid
     Both check-in stores plus the reflections, oldest first. */
  function history(sid) {
    var out = { student: [], adult: [], reflections: [] };
    var stu = (jload("aog.checkin.student.v1", {}).logs || {})[sid] || {};
    Object.keys(stu).sort().forEach(function (d) { (stu[d] || []).forEach(function (e) { out.student.push(e); }); });
    var ad = (jload("aog.daily.v1", {}).logs || {})[sid] || {};
    Object.keys(ad).sort().forEach(function (d) {
      ((ad[d] || {}).periods || []).forEach(function (p) {
        if (String(p.respondentRole) === "student") return;   /* lives in the other store */
        out.adult.push({ date: d, p: p });
      });
    });
    try {
      out.reflections = ((typeof getAllRecords === "function" ? getAllRecords() : []) || [])
        .filter(function (r) { return r && String(r.studentId).trim() === sid && r.context !== "home"; })
        .sort(function (a, b) { return new Date(a.timestamp) - new Date(b.timestamp); });
    } catch (e) {}
    return out;
  }

  /* ------------------------------------------------------------- the patterns
     Deliberately few, deliberately dull, and each one names its own evidence
     so a teacher can disagree with it. Anything that needs fewer than three
     data points is not a pattern and is not reported. */
  function patterns(sid) {
    var h = history(sid), out = [];
    var num = function (v) { var n = parseInt(v, 10); return isNaN(n) ? null : n; };
    var mean = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; };

    /* — the student's own check-ins — */
    var last5 = h.student.slice(-5);
    [["arrival", T("Arriving", "Cómo llega")],
     ["readiness", T("Readiness to learn", "Disposición para aprender")],
     ["connection", T("Feeling connected", "Sentirse conectado/a")]].forEach(function (pair) {
      var key = pair[0], label = pair[1];
      var vals = last5.map(function (e) { return num(e[key]); }).filter(function (v) { return v != null; });
      if (vals.length < 3) return;
      var low = vals.filter(function (v) { return v <= 2; }).length;
      var said = false;
      if (low >= 3) {
        out.push({ tone: "watch", text: label + " " + T("has been at the low end on ", "ha estado en el extremo bajo en ") +
          low + T(" of the last ", " de los últimos ") + vals.length + T(" check-ins. Worth a conversation.", " registros. Vale una conversación."),
          ask: key === "readiness"
            ? T("“Getting started has looked hard lately. What would make the first step easier?”",
                "«Empezar se ha visto difícil últimamente. ¿Qué haría más fácil el primer paso?»")
            : "" });
        said = true;
      }
      /* One line per measure. A low run and a downward trend on the same
         thing are the same observation twice, and four near-identical
         sentences read as a system straining to sound clever. */
      if (!said && vals.length >= 4) {
        var recent = mean(vals.slice(-2)), before = mean(vals.slice(0, -2));
        if (recent != null && before != null && recent - before >= 0.8) {
          out.push({ tone: "up", text: label + " " + T("has moved up across the last few check-ins.", "ha subido en los últimos registros.") });
        } else if (recent != null && before != null && before - recent >= 0.8) {
          out.push({ tone: "watch", text: label + " " + T("has moved down across the last few check-ins. May be useful to check in.",
            "ha bajado en los últimos registros. Puede ser útil preguntar.") });
        }
      }
    });

    /* The handoff's own example (§28): a support need chosen again and again is
       the most actionable thing on this card, and it is the one place a
       suggested question earns its space. The system describes; the question is
       an offer, not an instruction, and no intervention is triggered by it. */
    var last6 = h.student.slice(-6);
    if (last6.length >= 3) {
      var needCount = {};
      last6.forEach(function (e) {
        String(e.need || "").split(",").forEach(function (raw) {
          var v = raw.split("·")[0].trim();
          if (v && v !== "Nothing right now") needCount[v] = (needCount[v] || 0) + 1;
        });
      });
      var topNeed = Object.keys(needCount).sort(function (a, b) { return needCount[b] - needCount[a]; })[0];
      if (topNeed && needCount[topNeed] >= 3) {
        var ASKS = {
          "Help getting started": ["“Getting started has come up a lot. What would make the first step easier?”",
                                   "«Empezar ha salido mucho. ¿Qué haría más fácil el primer paso?»"],
          "A quiet minute":       ["“A quiet minute keeps coming up. When in the day would it help most?”",
                                   "«Un minuto de calma sigue saliendo. ¿En qué momento del día ayudaría más?»"],
          "Someone to listen":    ["“You have asked for someone to listen a few times. Who would you want that to be?”",
                                   "«Has pedido varias veces que alguien te escuche. ¿Quién te gustaría que fuera?»"],
          "To move":              ["“Moving keeps coming up. Where could that fit in the period?”",
                                   "«Moverte sigue saliendo. ¿Dónde podría entrar eso en el periodo?»"],
          "Some space":           ["“Space keeps coming up. What does having it actually look like for you?”",
                                   "«El espacio sigue saliendo. ¿Cómo se ve tenerlo, en concreto?»"],
          "A second chance":      ["“A second chance keeps coming up. What would you want to try again?”",
                                   "«Una segunda oportunidad sigue saliendo. ¿Qué te gustaría volver a intentar?»"]
        };
        var a2 = ASKS[topNeed];
        out.push({ tone: "watch",
          text: "“" + T(topNeed, (typeof window.AOGCheckinTr === "function" ? window.AOGCheckinTr(topNeed) : topNeed)) + "” " +
                T("was chosen ", "se eligió ") + needCount[topNeed] + T(" of the last ", " de los últimos ") + last6.length +
                T(" check-ins.", " registros."),
          ask: a2 ? T(a2[0], a2[1]) : "" });
      }
    }

    var asks = h.student.slice(-5).filter(function (e) { return e.followUp; }).length +
               h.adult.slice(-5).filter(function (o) { return o.p.followUp; }).length;
    if (asks >= 2) {
      out.push({ tone: "flag", text: T("Someone asked to talk ", "Alguien pidió hablar ") + asks +
        T(" times in the recent entries. Consider following up.", " veces en las entradas recientes. Considera dar seguimiento.") });
    }

    /* — what adults noticed, and whether more than one noticed it — */
    var lastAdult = h.adult.slice(-7);
    if (lastAdult.length >= 3) {
      [["regulated", T("regulating with a Pause", "regularse con una Pausa")],
       ["usedStrategy", T("the Coach Voice", "la Voz del Entrenador")],
       ["connected", T("a Repair Move", "un Acto de Reparación")]].forEach(function (pair) {
        var missBy = {};
        lastAdult.forEach(function (o) { if (!o.p[pair[0]] && o.p.respondentId) missBy[o.p.respondentId] = 1; });
        var who = Object.keys(missBy);
        if (who.length >= 2) {
          out.push({ tone: "watch", text: who.length + T(" different adults did not see ", " adultos distintos no vieron ") +
            pair[1] + T(" in the recent entries — that is a pattern across settings, not one bad period.",
                        " en las entradas recientes — eso es un patrón entre contextos, no un mal periodo.") });
        }
      });
    }

    /* — the reflection, window over window — */
    if (h.reflections.length >= 2) {
      var a = h.reflections[h.reflections.length - 2], b = h.reflections[h.reflections.length - 1];
      DOMS.forEach(function (d) {
        var va = a[d.norm], vb = b[d.norm];
        if (va == null || vb == null) return;
        var band = function (v) { return v >= 75 ? "green" : v >= 50 ? "amber" : "red"; };
        if (band(va) === band(vb) && band(vb) !== "green") {
          out.push({ tone: "watch", text: T(d.en, d.es) + T(" has stayed in the ", " se ha mantenido en ") +
            (typeof tierLabel === "function" ? tierLabel(band(vb) === "red" ? "High Risk" : "Some Risk") : band(vb)) +
            T(" range across two reflection windows.", " en dos ventanas de autorreflexión.") });
        } else if (band(va) !== band(vb) && vb > va + 5) {
          out.push({ tone: "up", text: T(d.en, d.es) + T(" has moved up since the last window.", " ha subido desde la ventana anterior.") });
        } else if (band(va) !== band(vb) && va > vb + 5) {
          out.push({ tone: "watch", text: T(d.en, d.es) + T(" has shifted down since the last window.", " ha bajado desde la ventana anterior.") });
        }
      });
    }

    return { list: out.slice(0, 4), counts: { student: h.student.length, adult: h.adult.length, reflections: h.reflections.length }, h: h };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     HISTORY  (§15 · §16 · §17)

     The question this card exists to answer is not "how is this student doing".
     It is the one a support person actually asks:

         Did this happen once, or has it become a pattern?

     So it is a single chronological list across EVERY source and EVERY adult —
     the student's own check-ins, what each teacher logged in their own period,
     and the reflections — with two filters over the top: how far back, and
     which period. Nothing is averaged and nothing is scored. It is a record.

     §16's multiple-teacher case is not a separate feature; it is what this list
     looks like when four adults have logged the same child. The submitting
     adult is on every row that has one.

     Filters change the list IN PLACE. The report around it does not re-render.
     ══════════════════════════════════════════════════════════════════════════ */
  var HS = { range: "7", period: "" };

  var HS_RANGES = [
    { v: "today",  en: "Today",             es: "Hoy" },
    { v: "week",   en: "This week",         es: "Esta semana" },
    { v: "7",      en: "Last 7 check-ins",  es: "Últimos 7 registros" },
    { v: "30",     en: "Last 30 days",      es: "Últimos 30 días" },
    { v: "term",   en: "This term",         es: "Este periodo escolar" },
    { v: "all",    en: "Everything",        es: "Todo" }
  ];
  function hsRangeLabel(v) {
    for (var i = 0; i < HS_RANGES.length; i++) if (HS_RANGES[i].v === v) return T(HS_RANGES[i].en, HS_RANGES[i].es);
    return v;
  }
  var HS_PERIODS = (function () {
    var out = [{ v: "", en: "All periods", es: "Todos los periodos" },
               { v: "Advisory", en: "Period 0 · Advisory", es: "Periodo 0 · Asesoría" }];
    for (var i = 1; i <= 10; i++) out.push({ v: "Period " + i, en: "Period " + i, es: "Periodo " + i });
    return out;
  })();
  function hsPeriodLabel(v) {
    for (var i = 0; i < HS_PERIODS.length; i++) if (HS_PERIODS[i].v === v) return T(HS_PERIODS[i].en, HS_PERIODS[i].es);
    return v || "";
  }

  function dayISO(d) {
    var m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  /* Monday-start week, so "this week" means the school week a teacher is in. */
  function weekStart() {
    var d = new Date(); var dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow); d.setHours(0, 0, 0, 0);
    return d;
  }
  /* A term boundary the calendar can work out on its own: Aug–Dec, Jan–May,
     Jun–Jul. Deliberately not configurable yet — a wrong guess here is visible
     and harmless, and a settings screen for it would be more machinery than
     the question deserves. */
  function termStart() {
    var d = new Date(), y = d.getFullYear(), m = d.getMonth();
    if (m >= 7) return new Date(y, 7, 1);
    if (m >= 5) return new Date(y, 5, 1);
    return new Date(y, 0, 1);
  }

  /* One list, every source, newest first. */
  function historyRows(sid) {
    var h = history(sid), rows = [];
    h.student.forEach(function (e) {
      rows.push({ kind: "student", ts: e.timestamp || (e.date + "T12:00:00Z"), date: String(e.date || "").slice(0, 10),
                  period: e.period || "", who: "", e: e });
    });
    h.adult.forEach(function (o) {
      rows.push({ kind: "adult", ts: o.p.timestamp || (o.date + "T12:00:00Z"), date: o.date,
                  period: o.p.period || "", who: o.p.respondentId || "", e: o.p });
    });
    h.reflections.forEach(function (r) {
      rows.push({ kind: "reflection", ts: r.timestamp, date: String(r.timestamp || "").slice(0, 10),
                  period: "", who: "", e: r });
    });
    return rows.sort(function (a, b) { return String(b.ts).localeCompare(String(a.ts)); });
  }

  function filterRows(rows) {
    var out = rows;
    if (HS.period) {
      /* A reflection has no period, so a period filter would silently drop it.
         Keep it and say why, rather than making a record look emptier than it
         is. */
      out = out.filter(function (r) { return r.kind === "reflection" || r.period === HS.period; });
    }
    var today = dayISO(new Date());
    if (HS.range === "today") out = out.filter(function (r) { return r.date === today; });
    else if (HS.range === "week") { var w = dayISO(weekStart()); out = out.filter(function (r) { return r.date >= w; }); }
    else if (HS.range === "30") {
      var c = dayISO(new Date(Date.now() - 30 * 86400000));
      out = out.filter(function (r) { return r.date >= c; });
    } else if (HS.range === "term") { var t = dayISO(termStart()); out = out.filter(function (r) { return r.date >= t; }); }
    else if (HS.range === "7") out = out.slice(0, 7);
    return out;
  }

  function rowHtml(r) {
    var when = shortD(r.date);
    var per = r.period ? hsPeriodLabel(r.period) : "";
    var head, body = "", tone = "var(--rule,#E4DAC5)";

    if (r.kind === "student") {
      tone = "var(--gold,#D9A33B)";
      var num = function (v) { var n = parseInt(v, 10); return isNaN(n) ? null : n; };
      var bits = [];
      if (num(r.e.arrival) != null)    bits.push(T("Arriving", "Llega") + " " + num(r.e.arrival) + "/5");
      if (num(r.e.connection) != null) bits.push(T("Connected", "Conectado") + " " + num(r.e.connection) + "/5");
      if (r.e.feelingWords) bits.push(String(r.e.feelingWords).split(",").join(" · "));
      if (r.e.need) bits.push(T("needs ", "necesita ") + r.e.need);
      head = T("Their own check-in", "Su propio registro");
      body = bits.join(" · ");
      if (r.e.tellAdult) body += (body ? "<br>" : "") + "“" + esc(r.e.tellAdult) + "”";
    } else if (r.kind === "adult") {
      tone = "var(--navy,#0A1E33)";
      /* Name what was seen, not just how many. "Saw 2 of 3" tells a support
         person nothing; which two is the entire point when the question is
         what shows up in one room and not another. */
      /* Name what was seen, not just how many. "Saw 2 of 3" tells a support
         person nothing; WHICH two is the entire point when the question is
         what shows up in one room and not in another. Since .29al an adult's
         row carries the sentences themselves, so this reads them; a row
         written before that still reads as its domain names. */
      var seen = [], missed = [];
      var esl = false;
      try { esl = (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) {}
      if (r.e.obs && r.e.obs.length && window.AOG_OBS) {
        r.e.obs.forEach(function (k) { var s = AOG_OBS.shortOf(k, esl); if (s) seen.push(s); });
        (r.e.flags || []).forEach(function (k) { var s = AOG_OBS.shortOf(k, esl); if (s) seen.push(s); });
      } else {
        var SHORT = { regulated: T("Pause / Release", "Pausa / Soltar"),
                      usedStrategy: T("Coach Voice", "Voz del Entrenador"),
                      connected: T("Repair Move", "Acto de Reparación") };
        ["regulated", "usedStrategy", "connected"].forEach(function (k) {
          (r.e[k] ? seen : missed).push(SHORT[k]);
        });
      }
      head = (r.who ? esc(r.who) : T("An adult", "Un adulto")) +
        (r.e.respondentRole && typeof roleLabel === "function"
          ? ' <span style="font-weight:500;color:var(--ink-faint,#8A92A6);">(' + esc(roleLabel(r.e.respondentRole)) + ")</span>" : "");
      /* ⚠ NOT "saw none of the three". There are four domains and twelve
         sentences since .29al, and a period where an adult ticked nothing is
         a period where nothing stood out - which is not a finding about the
         student and must not be worded as one. */
      body = (seen.length
        ? T("Noticed ", "Notó ") + esc(seen.join(" · "))
        : T("Nothing stood out this period", "Nada destacó en este periodo")) +
        (missed.length && seen.length
          ? ' <span style="color:var(--ink-faint,#8A92A6);">· ' + esc(T("not ", "no ") + missed.join(", ")) + "</span>"
          : "");
      if (r.e.note) body += "<br>“" + esc(r.e.note) + "”";
    } else {
      tone = "var(--green,#2E6B3A)";
      head = T("Self-reflection", "Autorreflexión") + (r.e.window ? " · " + esc(r.e.window) : "");
      body = (typeof tierLabel === "function" && r.e.tier ? tierLabel(r.e.tier) : "") +
        (r.e.normComposite != null ? " · " + Math.round(r.e.normComposite) + "/100" : "");
      var words = (r.e.reflections || []).filter(Boolean);
      if (words.length) body += "<br>“" + esc(words[0]) + "”";
    }

    return '<div class="hs-row" style="border-left-color:' + tone + ';">' +
      '<div class="hs-when">' + esc(when) + (per ? '<span class="hs-per">' + esc(per) + "</span>" : "") + "</div>" +
      '<div class="hs-body"><div class="hs-head">' + head +
        (r.e.followUp ? ' <span class="hs-flag">' + esc(T("asked to talk", "pidió hablar")) + "</span>" : "") +
      "</div>" +
      (body ? '<div class="hs-detail">' + body + "</div>" : "") + "</div></div>";
  }

  function historyHtml(sid) {
    var all = historyRows(sid);
    var rows = filterRows(all);

    var adults = {};
    all.forEach(function (r) { if (r.kind === "adult" && r.who) adults[r.who] = 1; });
    var nAdults = Object.keys(adults).length;

    var ctl = '<div class="hs-ctl">' +
      '<select id="hsRange" aria-label="' + esc(T("How far back", "Hasta cuándo")) + '">' +
        HS_RANGES.map(function (o) {
          return '<option value="' + o.v + '"' + (o.v === HS.range ? " selected" : "") + ">" + esc(T(o.en, o.es)) + "</option>";
        }).join("") + "</select>" +
      '<select id="hsPeriod" aria-label="' + esc(T("Which period", "Qué periodo")) + '">' +
        HS_PERIODS.map(function (o) {
          return '<option value="' + esc(o.v) + '"' + (o.v === HS.period ? " selected" : "") + ">" + esc(T(o.en, o.es)) + "</option>";
        }).join("") + "</select>" +
      "</div>";

    var list = rows.length
      ? rows.map(rowHtml).join("")
      : '<p class="nt-none">' + esc(T("Nothing in this range.", "Nada en este rango.")) + "</p>";

    return '<div class="nt-card" id="aogHistoryCard" data-sid="' + esc(sid) + '">' +
      '<p class="nt-lbl">' + esc(T("History", "Historial")) +
        ' <span style="text-transform:none;letter-spacing:normal;font-weight:400;color:var(--ink-faint,#8A92A6);">· ' +
        esc(T("did this happen once, or has it become a pattern?",
              "¿pasó una vez, o se ha vuelto un patrón?")) + "</span></p>" +
      ctl +
      (nAdults >= 2
        ? '<p class="hs-across">' + esc(nAdults + T(" different adults have logged this student.",
            " adultos distintos han registrado a este estudiante.")) + "</p>"
        : "") +
      '<div class="hs-list" id="hsList">' + list + "</div>" +
      '<p class="nt-meta">' + esc(rows.length + T(" of ", " de ") + all.length +
        T(" entries shown · newest first · every source and every adult on one list.",
          " entradas mostradas · más recientes primero · todas las fuentes y todos los adultos en una lista.")) +
        (HS.period ? " " + esc(T("Self-reflections have no period, so they are kept in view rather than filtered out.",
                                 "Las autorreflexiones no tienen periodo, así que se mantienen a la vista.")) : "") +
      "</p></div>";
  }

  function wireHistory(sid) {
    var card = el("aogHistoryCard");
    if (!card) return;
    function redraw() {
      var list = el("hsList");
      var rows = filterRows(historyRows(sid));
      if (list) list.innerHTML = rows.length ? rows.map(rowHtml).join("")
        : '<p class="nt-none">' + esc(T("Nothing in this range.", "Nada en este rango.")) + "</p>";
      var meta = card.querySelector(".nt-meta");
      if (meta) {
        meta.textContent = rows.length + T(" of ", " de ") + historyRows(sid).length +
          T(" entries shown · newest first · every source and every adult on one list.",
            " entradas mostradas · más recientes primero · todas las fuentes y todos los adultos en una lista.") +
          (HS.period ? " " + T("Self-reflections have no period, so they are kept in view rather than filtered out.",
                               "Las autorreflexiones no tienen periodo, así que se mantienen a la vista.") : "");
      }
    }
    var r = el("hsRange"), pd = el("hsPeriod");
    if (r) r.addEventListener("change", function () { HS.range = r.value; redraw(); });
    if (pd) pd.addEventListener("change", function () { HS.period = pd.value; redraw(); });
  }

  /* ------------------------------------------------------------------ styles */
  function injectCss() {
    if (el("aog-nt-css")) return;
    var s = document.createElement("style");
    s.id = "aog-nt-css";
    s.textContent = [
      ".nt-card{border:1px solid var(--rule,#E4DAC5);border-radius:14px;background:var(--card,#fff);padding:18px 20px;margin:16px 0 0;}",
      ".nt-card.lead{border-left:4px solid var(--navy,#0A1E33);}",
      ".nt-lbl{font-size:10.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);margin:0 0 9px;}",
      ".nt-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:9px;}",
      ".nt-item{display:flex;gap:11px;align-items:flex-start;font-size:14.5px;line-height:1.55;color:var(--ink,#22303F);}",
      ".nt-dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto;margin-top:7px;}",
      ".nt-none{font-size:14.5px;line-height:1.6;color:var(--ink-soft,#5b6675);margin:0;}",
      ".nt-meta{font-size:12px;color:var(--ink-faint,#8A92A6);margin:11px 0 0;line-height:1.6;}",
      ".nt-acts{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px;}",
      ".nt-btn{font:inherit;font-size:13px;font-weight:700;color:#fff;background:var(--navy,#0A1E33);border:0;border-radius:999px;padding:9px 17px;cursor:pointer;}",
      ".nt-btn.ghost{color:var(--navy,#0A1E33);background:transparent;border:1px solid var(--rule,#E4DAC5);}",
      ".nt-btn:hover{opacity:.92;}",
      ".nt-do{display:none;margin-top:14px;border-top:1px solid var(--rule-soft,#EFE8DA);padding-top:14px;}",
      ".nt-do.open{display:block;}",
      ".nt-move{border:1px solid var(--rule,#E4DAC5);border-radius:12px;padding:13px 15px;margin-bottom:10px;background:var(--cream,#FBF8F1);}",
      ".nt-move h4{font-family:var(--font-serif,Georgia,serif);font-size:15.5px;font-weight:600;color:var(--navy,#0A1E33);margin:0 0 5px;}",
      ".nt-move p{font-size:13.5px;line-height:1.55;color:var(--ink-soft,#5b6675);margin:0 0 9px;}",
      ".nt-quote{font-family:var(--font-serif,Georgia,serif);font-size:16px;line-height:1.45;color:var(--navy,#0A1E33);margin:0 0 9px;}",
      ".nt-mini{font:inherit;font-size:12.5px;font-weight:700;color:var(--navy,#0A1E33);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:7px 14px;cursor:pointer;margin-right:7px;}",
      ".nt-mini:hover{border-color:var(--gold,#D9A33B);}",
      ".nt-ok{font-size:12.5px;font-weight:700;color:var(--green,#2E6B3A);}",
      ".nt-fu{display:flex;gap:9px;flex-wrap:wrap;align-items:center;}",
      ".nt-fu select{font:inherit;font-size:13.5px;color:var(--navy,#0A1E33);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:9px;padding:8px 11px;}",
      ".nt-chip{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;letter-spacing:.04em;border-radius:999px;padding:4px 12px;background:rgba(217,163,59,.15);color:var(--gold-deep,#9a6f24);border:1px solid var(--gold,#D9A33B);}",
      ".hs-ctl{display:flex;gap:9px;flex-wrap:wrap;margin:0 0 12px;}",
      ".hs-ctl select{font:inherit;font-size:13px;font-weight:600;color:var(--navy,#0A1E33);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:9px;padding:7px 11px;}",
      ".hs-across{font-size:13px;font-weight:700;color:var(--navy,#0A1E33);background:var(--cream,#FBF8F1);border-radius:9px;padding:8px 12px;margin:0 0 12px;}",
      ".hs-list{display:flex;flex-direction:column;gap:8px;max-height:460px;overflow-y:auto;}",
      ".hs-row{display:flex;gap:12px;align-items:flex-start;border-left:3px solid var(--rule,#E4DAC5);padding:8px 0 8px 12px;}",
      ".hs-when{flex:0 0 92px;font-size:12px;font-weight:800;color:var(--ink-soft,#5b6675);line-height:1.5;}",
      ".hs-per{display:block;font-size:10.5px;font-weight:700;color:var(--ink-faint,#8A92A6);}",
      ".hs-body{flex:1;min-width:0;}",
      ".hs-head{font-size:13.5px;font-weight:700;color:var(--navy,#0A1E33);line-height:1.45;}",
      ".hs-detail{font-size:12.5px;color:var(--ink-soft,#5b6675);line-height:1.6;margin-top:2px;word-break:break-word;}",
      ".hs-flag{font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);margin-left:4px;}",
      "@media print{.nt-acts,.nt-fu select,.nt-mini,.hs-ctl{display:none;}.nt-do{display:block;}.hs-list{max-height:none;overflow:visible;}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* --------------------------------------------------------------- follow-up
     Deliberately small. One state and one optional line, on this device, for
     this student. Not a case-management system — §18 asked for a mark, and a
     mark is what this is. */
  var FU_STATES = [
    { v: "",           en: "No follow-up marked",     es: "Sin seguimiento" },
    { v: "needed",     en: "Conversation needed",     es: "Falta una conversación" },
    { v: "done",       en: "Conversation had",        es: "Conversación hecha" },
    { v: "tomorrow",   en: "Check again tomorrow",    es: "Revisar mañana" },
    { v: "thisweek",   en: "Check again this week",   es: "Revisar esta semana" },
    { v: "shared",     en: "Resource shared",         es: "Recurso compartido" }
  ];
  function fuLabel(v) {
    for (var i = 0; i < FU_STATES.length; i++) if (FU_STATES[i].v === v) return T(FU_STATES[i].en, FU_STATES[i].es);
    return "";
  }
  function fuGet(sid) { return (jload(FKEY, {})[sid]) || { state: "", note: "", at: "" }; }
  function fuSet(sid, state, note) {
    var all = jload(FKEY, {});
    if (!state && !note) { delete all[sid]; }
    else { all[sid] = { state: state, note: note || "", at: new Date().toISOString() }; }
    jsave(FKEY, all);
  }
  try { window.aogFollowUp = { get: fuGet, set: fuSet, all: function () { return jload(FKEY, {}); }, label: fuLabel }; } catch (e) {}

  /* --------------------------------------------------------------- the block */
  function blockHtml(rec) {
    var sid = String(rec && rec.studentId || "").trim();
    if (!sid) return "";
    var p = patterns(sid);
    var grade = rec.grade;

    /* the domain a conversation would most likely be about */
    var lowest = DOMS.slice().map(function (d) { return { d: d, v: rec[d.norm] }; })
      .filter(function (o) { return o.v != null; })
      .sort(function (a, b) { return a.v - b.v; })[0];
    var dom = lowest ? lowest.d : DOMS[2];
    var st = starterFor(dom.k, grade, 0);

    var tone = { watch: "var(--gold-deep,#9a6f24)", up: "var(--green,#2E6B3A)", flag: "var(--red,#8B2A2A)" };

    var noticeInner;
    if (p.list.length) {
      /* AT MOST ONE SUGGESTED QUESTION PER CARD. Two related observations —
         "readiness has been low" and "help getting started was chosen 6 of 6" —
         legitimately both point at the same conversation, and printing the same
         question twice makes the card read like a machine repeating itself. The
         observations both stay; only the first question is offered. */
      var askUsed = false;
      noticeInner = '<ul class="nt-list">' + p.list.map(function (x) {
        return '<li class="nt-item"><span class="nt-dot" style="background:' + (tone[x.tone] || tone.watch) + ';"></span>' +
          "<span>" + esc(x.text) +
          /* A question a teacher might ask, offered under the observation it
             came from. It is a conversation starter, never an instruction and
             never an automated intervention. */
          (x.ask && !askUsed ? (askUsed = true,
            '<br><em style="color:var(--ink-soft,#5b6675);font-style:italic;">' + esc(x.ask) + "</em>") : "") +
          "</span></li>";
      }).join("") + "</ul>";
    } else {
      noticeInner = '<p class="nt-none">' + esc(T(
        "Nothing here reads as a pattern yet. That is a real answer, not a gap — a pattern needs at least three points, and this is fewer.",
        "Todavía no hay nada que se lea como un patrón. Eso es una respuesta real, no un vacío — un patrón necesita al menos tres puntos, y aquí hay menos.")) + "</p>";
    }

    var counts = [];
    if (p.counts.reflections) counts.push(p.counts.reflections + " " + T("reflections", "autorreflexiones"));
    if (p.counts.student) counts.push(p.counts.student + " " + T("own check-ins", "registros propios"));
    if (p.counts.adult) counts.push(p.counts.adult + " " + T("adult entries", "entradas de adultos"));

    var fu = fuGet(sid);

    return '<div class="nt-card lead" id="aogNoticeCard" data-sid="' + esc(sid) + '">' +
      '<p class="nt-lbl">' + esc(T("Notice", "Se nota")) +
        (fu.state ? ' <span class="nt-chip" style="text-transform:none;letter-spacing:normal;margin-left:8px;">' + esc(fuLabel(fu.state)) + "</span>" : "") +
      "</p>" +
      noticeInner +
      '<p class="nt-meta">' + esc(T("Read across ", "Leído entre ") + (counts.length ? counts.join(" · ") : T("no history yet", "sin historial aún"))) + ". " +
        esc(T("A pattern is a reason to talk to a student, never a conclusion about them.",
              "Un patrón es una razón para hablar con un estudiante, nunca una conclusión sobre él o ella.")) + "</p>" +
      '<div class="nt-acts">' +
        '<button type="button" class="nt-btn" id="ntDoBtn">' + esc(T("What can I do?", "¿Qué puedo hacer?")) + "</button>" +
      "</div>" +

      '<div class="nt-do" id="ntDo">' +
        '<div class="nt-move"><h4>' + esc(T("A two-minute conversation", "Una conversación de dos minutos")) + "</h4>" +
          (st ? '<p class="nt-quote">“' + esc(st) + '”</p>' : "") +
          '<p>' + esc(T("Open with this, then stop talking. The point is what they say next.",
                        "Empieza con esto y luego calla. Lo importante es lo que digan después.")) + "</p>" +
          (st ? '<button type="button" class="nt-mini" id="ntCopy">' + esc(T("Copy", "Copiar")) + "</button>" : "") +
          '<button type="button" class="nt-mini" id="ntMore">' + esc(T("More starters", "Más iniciadores")) + "</button>" +
          '<span class="nt-ok" id="ntOk" style="display:none;">' + esc(T("Copied", "Copiado")) + "</span>" +
        "</div>" +

        '<div class="nt-move"><h4>' + esc(T("A quick practice", "Una práctica rápida")) + "</h4>" +
          '<p>' + esc(T("Two or three minutes, done together, no explanation needed.",
                        "Dos o tres minutos, hecho en conjunto, sin explicaciones.")) + "</p>" +
          '<button type="button" class="nt-mini" id="ntTool1">' + esc(T("Quiet Space", "Espacio Tranquilo")) + "</button>" +
          '<button type="button" class="nt-mini" id="ntTool2">' + esc(T("Name the feeling", "Nombra la emoción")) + "</button>" +
          '<button type="button" class="nt-mini" id="ntTool3">' + esc(T("Flip the inner critic", "Voltea al crítico interior")) + "</button>" +
        "</div>" +

        '<div class="nt-move"><h4>' + esc(T("The curriculum connection", "La conexión con el currículo")) + "</h4>" +
          '<p>' + esc(T("The lessons and anchor charts that already teach ", "Las lecciones y carteles que ya enseñan ") + T(dom.en, dom.es)) + ".</p>" +
          '<button type="button" class="nt-mini" id="ntLesson">' + esc(T("Find the lesson", "Buscar la lección")) + "</button>" +
          '<button type="button" class="nt-mini" id="ntChart">' + esc(T("Anchor charts", "Carteles de anclaje")) + "</button>" +
        "</div>" +

        '<div class="nt-move"><h4>' + esc(T("Follow-up", "Seguimiento")) + "</h4>" +
          '<p>' + esc(T("A mark for you, on this computer. Nothing is sent and nobody is notified.",
                        "Una nota para ti, en esta computadora. No se envía nada ni se notifica a nadie.")) + "</p>" +
          '<div class="nt-fu">' +
            '<select id="ntFu">' + FU_STATES.map(function (f) {
              return '<option value="' + f.v + '"' + (f.v === fu.state ? " selected" : "") + ">" + esc(T(f.en, f.es)) + "</option>";
            }).join("") + "</select>" +
            '<span class="nt-ok" id="ntFuOk" style="display:none;">' + esc(T("Saved", "Guardado")) + "</span>" +
          "</div>" +
          (fu.at ? '<p class="nt-meta" style="margin-top:8px;">' + esc(T("Marked ", "Marcado ") + shortD(fu.at)) + "</p>" : "") +
        "</div>" +
      "</div></div>";
  }

  function wire(rec) {
    var card = el("aogNoticeCard");
    if (!card) return;
    var sid = card.getAttribute("data-sid");

    var btn = el("ntDoBtn"), pane = el("ntDo");
    if (btn && pane) btn.addEventListener("click", function () {
      var open = pane.classList.toggle("open");
      btn.textContent = open ? T("Hide", "Ocultar") : T("What can I do?", "¿Qué puedo hacer?");
    });

    var copy = el("ntCopy"), ok = el("ntOk");
    if (copy) copy.addEventListener("click", function () {
      var q = card.querySelector(".nt-quote");
      if (!q) return;
      var txt = q.textContent.replace(/^[“"]|[”"]$/g, "");
      var done = function () { if (ok) { ok.style.display = ""; setTimeout(function () { ok.style.display = "none"; }, 1700); } };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
        else done();
      } catch (e) { done(); }
    });

    var open = function (fn) { try { if (window.toolOpen) window.toolOpen(fn); } catch (e) {} };
    if (el("ntMore"))  el("ntMore").addEventListener("click", function () { open("convostarters"); });
    if (el("ntTool1")) el("ntTool1").addEventListener("click", function () {
      try { if (typeof showStationMode === "function") showStationMode(); else open("boxbreath"); } catch (e) { open("boxbreath"); }
    });
    if (el("ntTool2")) el("ntTool2").addEventListener("click", function () { open("feelwheel"); });
    if (el("ntTool3")) el("ntTool3").addEventListener("click", function () { open("harshkind"); });

    var lowest = DOMS.slice().map(function (d) { return { d: d, v: rec[d.norm] }; })
      .filter(function (o) { return o.v != null; }).sort(function (a, b) { return a.v - b.v; })[0];
    if (el("ntLesson")) el("ntLesson").addEventListener("click", function () {
      try {
        if (typeof aogGoConstruct === "function") aogGoConstruct((lowest ? lowest.d.q : "repair"), String(rec.grade || ""));
      } catch (e) {}
    });
    if (el("ntChart")) el("ntChart").addEventListener("click", function () {
      try { if (typeof aogGoCharts === "function") aogGoCharts(); } catch (e) {}
    });

    var fuSel = el("ntFu"), fuOk = el("ntFuOk");
    if (fuSel) fuSel.addEventListener("change", function () {
      fuSet(sid, fuSel.value, "");
      if (fuOk) { fuOk.style.display = ""; setTimeout(function () { fuOk.style.display = "none"; }, 1700); }
      var lbl = el("aogNoticeCard") && el("aogNoticeCard").querySelector(".nt-chip");
      var head = el("aogNoticeCard") && el("aogNoticeCard").querySelector(".nt-lbl");
      if (head) {
        if (lbl) lbl.remove();
        if (fuSel.value) {
          head.insertAdjacentHTML("beforeend",
            ' <span class="nt-chip" style="text-transform:none;letter-spacing:normal;margin-left:8px;">' + esc(fuLabel(fuSel.value)) + "</span>");
        }
      }
    });
  }

  /* Wrap buildHomeReport. The self/child views pass true as the second
     argument and get exactly what they got before — see the warning at the
     top of this block. */
  (function attach() {
    function go() {
      if (typeof window.buildHomeReport !== "function" || window.buildHomeReport.__aogNotice) return;
      var orig = window.buildHomeReport;
      var wrapped = function (rec, isSelf) {
        var html = orig.apply(this, arguments);
        if (isSelf) return html;                       /* student's own report · Family Mode */
        try {
          injectCss();
          var sid = String(rec && rec.studentId || "").trim();
          var extra = blockHtml(rec) + (sid ? historyHtml(sid) : "");
          if (!extra) return html;
          /* Rendered after the report body, then lifted to just under the
             header so a teacher reads the pattern before the item detail.
             If the header is not found it simply stays where it is. */
          setTimeout(function () {
            try {
              var card = el("aogNoticeCard");
              var head = card && card.parentNode && card.parentNode.querySelector(".home-header");
              var hist = el("aogHistoryCard");
              if (card && head && head.parentNode) head.parentNode.insertBefore(card, head.nextSibling);
              /* History follows Notice, so the pattern is read first and the
                 evidence for it is directly underneath. */
              if (hist && card && card.parentNode) card.parentNode.insertBefore(hist, card.nextSibling);
              wire(rec);
              try { wireHistory(String(rec.studentId || "").trim()); } catch (_e) {}
            } catch (e) {}
          }, 0);
          return html + extra;
        } catch (e) { return html; }
      };
      wrapped.__aogNotice = true;
      window.buildHomeReport = wrapped;
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 800);
    setTimeout(go, 2400);
  })();

  window.AOGNotice = { patterns: patterns, history: history, rows: historyRows,
                       followUp: window.aogFollowUp,
                       setRange: function (r, p) { HS.range = r; if (p != null) HS.period = p; } };
})();
