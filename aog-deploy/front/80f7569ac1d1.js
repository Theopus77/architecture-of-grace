
/* =========================================================================
   THE TEACHER'S SIDE OF THE EXIT SLIP  ·  §23, §24, §25

   ⚠ THE THREE SENTENCES THIS WHOLE PANEL IS BUILT AROUND (§25):

       "I was tired"          does NOT mean a sleep problem.
       "Math was difficult"   does NOT mean a math deficit.
       "Someone upset me"     does NOT mean a behavioral incident.

   The exit slip is student voice data. It is context. Human beings
   interpret context. Nothing in this file may turn a selection into a
   verdict, a score, a risk level or a color that ranks a child.

   ⚠ AND THE WORDING RULE (§23): a repeated selection says
       PATTERN EMERGING
   and never
       PROBLEM DETECTED.
   Every read here states WHAT IT COUNTED, offers ONE question, and stops.
   If you find yourself writing "because", delete the sentence.

   ⚠ NOT A WALL OF ESSAYS (§24). The slips are one collapsed line each.
   The point of this screen is that a teacher can see what their students
   are experiencing in thirty seconds, not that they have another pile of
   data to read.
   ========================================================================= */
(function () {
  "use strict";

  function el(id) { return document.getElementById(id); }
  function isEs() {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
    catch (e) { return false; }
  }
  function T(en, es) { return isEs() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function tr(en) {
    try { return (window.AOGExitSlip && window.AOGExitSlip.tr) ? window.AOGExitSlip.tr(en) : en; }
    catch (e) { return en; }
  }
  function todayISO() {
    var d = new Date(), m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function daysAgoISO(n) {
    var d = new Date(); d.setDate(d.getDate() - n);
    var m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  /* ⚠ NEVER PRINT "Invalid Date" TO A TEACHER. Google Sheets silently
     coerces a written "2026-08-27" or "3:10 PM" into its own date/time
     value, and a TIME-only cell comes back as a Date on the 1899-12-30
     epoch. Pulled rows were rendering as
         Invalid Date · 1899-12-31T00:28:00.000Z
     on Jimmy's own screen. The write side is being taught not to let that
     happen (the .gs pins those columns to plain text), but a sheet that has
     ALREADY been filled still holds the coerced cells, so the read side has
     to cope for ever. A date that is not a real school day prints nothing —
     an empty slot is honest, "Invalid Date" is just noise a teacher has to
     work out. */
  function sane(d) {
    return d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() > 1970 && d.getFullYear() < 2100;
  }
  function asDate(v) {
    if (!v) return null;
    var p = String(v).slice(0, 10).split("-");
    if (p.length === 3) {
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      if (sane(d)) return d;
    }
    var t = new Date(v);
    return sane(t) ? t : null;
  }
  function prettyDate(iso) {
    var d = asDate(iso);
    if (!d) return "";
    try { return d.toLocaleDateString(isEs() ? "es" : "en", { weekday: "short", month: "short", day: "numeric" }); }
    catch (e) { return ""; }
  }
  /* A clock time, or nothing. "1899-12-31T00:28:00.000Z" is a Sheets time
     serial that has already been through a timezone and cannot be trusted
     back to a wall clock, so it is not shown at all. */
  function prettyClock(rec) {
    var t = String((rec && rec.submitTime) || "").trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?(\s?[AaPp]\.?[Mm]\.?)?$/.test(t)) return t;

    /* ⚠ THIS FALLBACK USED asDate() AND COULD THEREFORE NEVER RETURN A TIME.
       Reported 2026-08-28: every slip in the list read "12:00 AM". asDate()
       is a DAY parser — it does String(v).slice(0,10) and builds a local
       midnight, which is exactly right for prettyDate and for the range
       math, and useless here: the hours and minutes were thrown away one
       line before they were formatted, so every row without a usable
       submitTime printed midnight. Not a Sheet bug and not a clock bug — a
       day parser asked for a time.

       Parse the stamp itself. And when the stamp genuinely carries no time,
       say NOTHING rather than midnight — the rule this function's own
       comment already stated about Sheets time serials, applied to the other
       way a time goes missing. A row pulled from a Sheet whose columns were
       not forced to text comes back as a plain date, and a fabricated
       12:00 AM on a child's record is worse than a blank. */
    var raw = String((rec && rec.timestamp) || "").trim();
    if (!/\d{1,2}:\d{2}/.test(raw)) return "";                      /* date only */
    if (/T00:00:00(\.0+)?(Z|[+-]\d{2}:?\d{2})?$/i.test(raw)) return "";  /* a date that went through a Sheet */
    var d = new Date(raw);
    if (!d || isNaN(d.getTime())) return "";
    try { return d.toLocaleTimeString(isEs() ? "es" : "en", { hour: "numeric", minute: "2-digit" }); }
    catch (e) { return ""; }
  }
  /* One label for a row, wherever it renders: the day, and the clock only if
     there honestly is one. */
  function whenLabel(r) {
    var d = prettyDate(r && r.date), c = prettyClock(r);
    return d ? (c ? (d + " · " + c) : d) : c;
  }

  /* ------------------------------------------------------------ the window
     Days, not "last N slips". A teacher thinks in school days and a student
     who did three slips on Tuesday has not used up their week. */
  var RANGES = [
    { k: "1",  en: "Today",          es: "Hoy" },
    { k: "7",  en: "Last 7 days",    es: "Últimos 7 días" },
    { k: "30", en: "Last 30 days",   es: "Últimos 30 días" },
    { k: "0",  en: "All of it",      es: "Todo" }
  ];
  var VIEW = { range: "1", open: {}, pullSaid: "", pullBad: false };

  /* The link a student types off the board. Read from the page's own origin so
     a staging copy, a local file or a district's own domain each hand out the
     address that will actually work — hard-coding architectureofgrace.com here
     would tell a teacher on any other host to send their class somewhere else. */
  var SLIP_URL = (function () {
    try {
      var o = location.origin || "";
      if (/^https?:/.test(o)) return o.replace(/^https?:\/\//, "").replace(/\/$/, "") + "/exit";
    } catch (e) {}
    return "architectureofgrace.com/exit";
  })();

  function slips() {
    var out = [];
    try {
      var logs = ((window.AOGExitSlip && window.AOGExitSlip.all()) || {}).logs || {};
      Object.keys(logs).forEach(function (sid) {
        Object.keys(logs[sid] || {}).forEach(function (d) {
          (logs[sid][d] || []).forEach(function (r) { out.push(r); });
        });
      });
    } catch (e) {}
    out.sort(function (a, b) { return String(b.timestamp) < String(a.timestamp) ? -1 : 1; });
    return out;
  }
  function inWindow(all) {
    var n = parseInt(VIEW.range, 10);
    if (!n) return all.slice();
    var from = n === 1 ? todayISO() : daysAgoISO(n - 1);
    return all.filter(function (r) { return String(r.date || "") >= from; });
  }

  /* Count a " · " joined multi-answer field across a set of slips. */
  function tally(rows, key) {
    var m = {};
    rows.forEach(function (r) {
      String(r[key] || "").split(" · ").forEach(function (v) {
        v = v.trim();
        if (v) m[v] = (m[v] || 0) + 1;
      });
    });
    return Object.keys(m).map(function (k) { return { k: k, n: m[k] }; })
      .sort(function (a, b) { return b.n - a.n || (a.k < b.k ? -1 : 1); });
  }

  /* ⚠ NOT SCORED, NOT RANKED, NOT COLORED BY VALENCE. A bar is a count
     against the number of slips that answered that question — a real
     denominator a teacher can name, not a guess at how many children are
     in the room. Every bar on this screen is the same color on purpose;
     the moment "difficult" turns amber, this is a compliance report. */
  function barsHtml(list, denom, cap) {
    var top = list.slice(0, cap || 5);
    if (!top.length) return '<p class="xv-none">' + esc(T("Nothing chosen yet.", "Nada elegido todavía.")) + "</p>";
    var max = top[0].n || 1;
    return '<ul class="xv-bars">' + top.map(function (o) {
      var pct = denom ? Math.round((o.n / denom) * 100) : 0;
      return "<li>" +
        '<span class="xv-bl">' + esc(tr(o.k)) + "</span>" +
        '<span class="xv-bw"><i style="width:' + Math.round((o.n / max) * 100) + '%"></i></span>' +
        '<span class="xv-bn">' + o.n + (denom ? ' <em>' + pct + "%</em>" : "") + "</span>" +
        "</li>";
    }).join("") + "</ul>";
  }

  /* ================================================================ §23
     THE PATTERN READS.

     Deterministic counting against a stated threshold. No sentiment
     scoring, no profiling, no risk classification, nothing run over a
     student's free text. Each read prints what it counted and ONE
     question, and at most one read per student per card — two
     observations pointing at the same conversation must not print the
     same question twice. Same rule as the check-in's NOTICE layer. */
  var MIN_SLIPS = 3;     /* never read a pattern out of one or two days */
  var HIT = 3;           /* how many times the same thing has to appear */
  var OF  = 5;           /* out of how many of that student's recent slips */

  function patterns(rows) {
    var by = {};
    rows.forEach(function (r) {
      var k = String(r.studentId || "").toUpperCase();
      if (!k) return;
      (by[k] = by[k] || []).push(r);
    });
    var out = [];
    Object.keys(by).forEach(function (sid) {
      var mine = by[sid].slice(0, OF);
      if (mine.length < MIN_SLIPS) return;
      var said = [];

      /* the same class named as most challenging */
      var cls = tally(mine, "hardClass").filter(function (o) {
        return o.n >= HIT && o.k !== "None were especially challenging" &&
               o.k !== "They were all about the same" && o.k !== "I don’t want to choose";
      })[0];
      if (cls) said.push({
        what: T(cls.k + " has been their most challenging class " + cls.n + " of the last " + mine.length + " slips.",
                cls.k + " ha sido su clase más difícil en " + cls.n + " de sus últimas " + mine.length + " salidas."),
        ask: T("Worth asking what that class feels like from their seat.",
               "Vale la pena preguntar cómo se siente esa clase desde su asiento.")
      });

      /* the same reason, whichever class it was attached to */
      var why = tally(mine, "hardWhy").filter(function (o) { return o.n >= HIT; })[0];
      if (why) said.push({
        what: T("They have chosen “" + why.k + "” " + why.n + " times in the last " + mine.length + ".",
                "Han elegido «" + tr(why.k) + "» " + why.n + " veces en las últimas " + mine.length + "."),
        ask: T("One question, not a plan: what would make that easier?",
               "Una pregunta, no un plan: ¿qué lo haría más fácil?")
      });

      /* asked for help, more than once */
      var help = mine.filter(function (r) { return /I need help with this/.test(r.response || ""); }).length;
      if (help >= 2) said.push({
        what: T("They have tapped “I need help with this” " + help + " times.",
                "Han tocado «Necesito ayuda con esto» " + help + " veces."),
        ask: T("This one is a request. It is worth answering out loud.",
               "Esto es una petición. Vale la pena responderla en voz alta.")
      });

      /* ⚠ AND ONE READ THAT IS NOT ABOUT DIFFICULTY. A screen that only
         ever surfaces the hard things teaches the teacher to read this
         product as a problem list, which is the exact thing §29 forbids
         and the exact thing the students are being asked not to do with
         their own days. */
      var good = tally(mine, "goodMoment").filter(function (o) { return o.n >= HIT; })[0];
      if (good) said.push({
        good: true,
        what: T("“" + good.k + "” has shown up in " + good.n + " of their last " + mine.length + ".",
                "«" + tr(good.k) + "» ha aparecido en " + good.n + " de sus últimas " + mine.length + "."),
        ask: T("Something is working. Worth naming to them.",
               "Algo está funcionando. Vale la pena decírselo.")
      });

      /* ⚠ AT MOST TWO READS, AND IF THERE IS A GOOD ONE IT IS ALWAYS ONE OF
         THEM. A first cut took the first two off the list, which are both
         about difficulty — so a student with a repeated hard class never
         had the working thing surfaced, and the card quietly became a
         problem list. That is §29's failure mode, and it is the same thing
         the students are being asked NOT to do with their own days. */
      if (said.length) {
        var good = said.filter(function (r) { return r.good; });
        var hard = said.filter(function (r) { return !r.good; });
        var reads = good.length ? [hard[0], good[0]].filter(Boolean) : hard.slice(0, 2);
        out.push({ sid: sid, n: mine.length, reads: reads });
      }
    });
    return out.sort(function (a, b) { return a.sid < b.sid ? -1 : 1; });
  }

  /* --------------------------------------------------------------- the CSS */
  function injectCss() {
    if (el("aog-xv-css")) return;
    var st = document.createElement("style");
    st.id = "aog-xv-css";
    st.textContent = [
      /* One palette (see #aog-ds). This panel kept its own
         literal copy of the dusk, which is exactly how two things that are
         meant to match stop matching. */
      "#panel-exitslip{--xv-dusk:var(--aog-dusk,#4C3F6B);}",
      ".xv-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:12px 18px;margin:0 0 6px;}",
      ".xv-head h2{margin:0;font-size:22px;color:var(--ink);font-weight:650;}",
      ".xv-head .xv-n{font-size:14px;color:var(--ink-faint);}",
      ".xv-head .xv-share{margin-left:auto;align-self:center;}",
      "@media print{.xv-share{display:none;}}",
      /* ⚠ THE READING SCREEN MUST ALSO BE THE HANDING-OUT SCREEN.
         Shipped without this and Jimmy could not find the form from the
         panel that talks about it — the empty state named a URL and gave
         him nothing to press. A screen that says "hand out the link" and
         then makes you retype it is not finished. */
      ".xv-hand{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:12px 0 4px;}",
      ".xv-hb{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:99px;",
      "  border:1.5px solid var(--xv-dusk);background:var(--xv-dusk);color:#fff;font-size:14.5px;",
      "  font-weight:650;font-family:inherit;cursor:pointer;}",
      /* ⚠ :not(.ghost). The dark ink is for the FILLED button, which sits on a
         pale dusk fill. Applying it to the bare class also hit the outline
         button, whose background is transparent — dark ink on the dark page,
         1.05:1, and axe caught it. Scope a color to the surface it was
         chosen against. */
      ':root[data-theme="dark"] .xv-hb:not(.ghost){color:#14121C;}',
      ".xv-hb.ghost{background:transparent;color:var(--ink);border-color:var(--rule);font-weight:600;}",
      ".xv-hb.ghost:hover{border-color:var(--xv-dusk);}",
      ".xv-hb:focus-visible{outline:3px solid var(--xv-dusk);outline-offset:2px;}",
      /* ⚠ OFF THE SCREEN BY DEFAULT — Jimmy's call, 2026-08-28: he crossed
         the printed address out on his own panel. It is NOT deleted, and
         that matters. The .28f lesson stands — a screen that says HAND OUT
         THE LINK and then makes you retype it is not finished — so the
         address is still in the DOM and still `user-select:all`, and it
         REVEALS ITSELF the moment a copy fails. On a page served over plain
         http, or in a school-managed browser that refuses the clipboard,
         selecting it is the only way a teacher gets the link at all.
         Two buttons carry the job; the text appears only when they cannot. */
      ".xv-url{display:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14.5px;",
      "  color:var(--ink);background:var(--rule-soft,var(--rule));border-radius:8px;padding:7px 11px;",
      "  user-select:all;}",
      ".xv-url.show{display:inline-block;}",
      ".xv-said{font-size:13.5px;color:var(--xv-dusk);font-weight:650;}",
      ".xv-said.bad{color:var(--ink);font-weight:600;}",
      /* §14 · PULL IS A FIRST-CLASS EDUCATOR ACTION, so it gets its own row
         with the sync state beside it — not a link under a fold. */
      ".xv-sync{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:8px 0 4px;padding:10px 12px;",
      "  border:1px solid var(--rule);border-radius:12px;background:var(--aog-pale,#F0ECF7);}",
      ".xv-dot{width:9px;height:9px;border-radius:50%;background:var(--rule);flex:0 0 auto;}",
      ".xv-dot.on{background:var(--xv-dusk);}",
      ".xv-sl{font-size:13.5px;color:var(--ink);font-weight:650;}",
      ".xv-sl.dim{color:var(--ink-faint);font-weight:600;}",
      ".xv-sync .xv-hb{margin-left:auto;}",
      /* .30dl · Remove. NO NEW COLOR: at rest it is the same ghost pill the
         family card wears, and armed it is the body ink at 2px. Both tokens
         are ones this panel already paints with, in both themes. */
      ".xv-del{color:var(--ink);margin-left:8px;}",
      '.xv-del[data-armed="1"]{border:2px solid var(--ink);font-weight:700;}',
      ".xv-del:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      ".xv-undo{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:10px 0 0;",
      "  padding:11px 13px;border:1px solid var(--rule);border-radius:12px;background:var(--paper);}",
      ".xv-undo span{flex:1 1 240px;font-size:13.5px;line-height:1.5;color:var(--ink);}",
      ".xv-undo .xv-hb{padding:7px 14px;font-size:13.5px;}",
      "@media print{.xv-del,.xv-undo{display:none;}}",
      ".xv-range{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 18px;}",
      ".xv-r{padding:7px 14px;border-radius:99px;border:1.5px solid var(--rule);background:transparent;",
      "  color:var(--ink);font-size:14px;font-family:inherit;cursor:pointer;}",
      ".xv-r.on{background:var(--xv-dusk);border-color:var(--xv-dusk);color:#fff;}",
      ':root[data-theme="dark"] .xv-r.on{color:#14121C;}',
      ".xv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-bottom:16px;}",
      ".xv-card{border:1px solid var(--rule);border-radius:14px;padding:15px 17px;background:var(--paper);}",
      ".xv-card h3{margin:0 0 3px;font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;",
      "  color:var(--ink-faint);}",
      ".xv-card .xv-den{margin:0 0 12px;font-size:12.5px;color:var(--ink-faint);}",
      ".xv-bars{list-style:none;margin:0;padding:0;}",
      ".xv-bars li{display:grid;grid-template-columns:1fr 62px auto;align-items:center;gap:10px;padding:5px 0;}",
      ".xv-bl{font-size:14.5px;color:var(--ink);line-height:1.3;}",
      ".xv-bw{display:block;height:7px;border-radius:99px;background:var(--rule-soft,var(--rule));overflow:hidden;}",
      ".xv-bw i{display:block;height:100%;border-radius:99px;background:var(--xv-dusk);}",
      ".xv-bn{font-size:13px;color:var(--ink-faint);font-variant-numeric:tabular-nums;white-space:nowrap;}",
      /* ⚠ NO OPACITY ON TEXT. --ink-faint clears 4.5:1 against --paper on its
         own; knocking it back to .72 took the percentage to 2.83:1 and axe
         found 22 nodes of it. Dim text is the easiest AA failure to ship. */
      ".xv-bn em{font-style:normal;}",
      ".xv-none{margin:0;font-size:14px;color:var(--ink-faint);}",
      ".xv-pat{border:1px solid var(--rule);border-radius:14px;padding:15px 17px;margin-bottom:16px;background:var(--paper);}",
      ".xv-pat h3{margin:0 0 3px;font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-faint);}",
      ".xv-pat .xv-den{margin:0 0 12px;font-size:12.5px;color:var(--ink-faint);}",
      ".xv-p{padding:11px 0;border-top:1px solid var(--rule-soft,var(--rule));}",
      ".xv-p:first-of-type{border-top:0;}",
      ".xv-p .who{font-size:13px;font-weight:700;letter-spacing:.05em;color:var(--xv-dusk);}",
      ".xv-p p{margin:4px 0 0;font-size:14.5px;line-height:1.45;color:var(--ink);}",
      ".xv-p p.ask{color:var(--ink-faint);font-style:italic;}",
      ".xv-ask{border:1px solid var(--rule);border-left:4px solid var(--xv-dusk);border-radius:12px;",
      "  padding:13px 16px;margin-bottom:16px;background:var(--paper);}",
      ".xv-ask h3{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-faint);}",
      ".xv-ask .row{padding:7px 0;font-size:14.5px;color:var(--ink);border-top:1px solid var(--rule-soft,var(--rule));}",
      ".xv-ask .row:first-of-type{border-top:0;}",
      ".xv-ask .row b{color:var(--xv-dusk);}",
      ".xv-ask .row .said{display:block;margin-top:3px;color:var(--ink-faint);font-size:14px;}",
      ".xv-list{border:1px solid var(--rule);border-radius:14px;background:var(--paper);overflow:hidden;}",
      ".xv-list h3{margin:0;padding:15px 17px 3px;font-size:12px;font-weight:700;letter-spacing:.09em;",
      "  text-transform:uppercase;color:var(--ink-faint);}",
      ".xv-list .xv-den{margin:0;padding:0 17px 10px;font-size:12.5px;color:var(--ink-faint);}",
      ".xv-row{width:100%;display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 12px;padding:11px 17px;",
      "  border-top:1px solid var(--rule-soft,var(--rule));background:none;border-left:0;border-right:0;",
      "  border-bottom:0;text-align:left;font-family:inherit;cursor:pointer;color:var(--ink);}",
      ".xv-row:hover{background:var(--rule-soft,var(--rule));}",
      ".xv-row .sid{font-size:13.5px;font-weight:700;letter-spacing:.05em;color:var(--xv-dusk);min-width:62px;}",
      ".xv-row .when{font-size:12.5px;color:var(--ink-faint);min-width:112px;}",
      ".xv-row .gist{font-size:14.5px;flex:1 1 220px;}",
      ".xv-row .flag{font-size:12px;font-weight:700;color:var(--xv-dusk);}",
      ".xv-det{padding:2px 17px 15px;border-top:1px solid var(--rule-soft,var(--rule));background:var(--paper);}",
      ".xv-det .rr{display:flex;gap:12px;padding:7px 0;}",
      ".xv-det .rk{flex:0 0 96px;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;",
      "  color:var(--ink-faint);padding-top:3px;}",
      ".xv-det .rv{flex:1 1 auto;font-size:14.5px;line-height:1.45;color:var(--ink);}",
      ".xv-foot{margin:16px 0 0;font-size:13px;line-height:1.55;color:var(--ink-faint);}",
      ".xv-foot b{color:var(--ink);font-weight:650;}",
      "@media (max-width:560px){",
      "  .xv-bars li{grid-template-columns:1fr auto;}",
      "  .xv-bw{grid-column:1 / -1;}",
      "  .xv-row .when{min-width:0;}",
      "}",
      "@media print{.xv-range,.xv-row{display:none;}}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ------------------------------------------------------------ the render */
  function gist(r) {
    var bits = [];
    if (r.favClass) bits.push(T("liked ", "le gustó ") + tr(r.favClass));
    if (r.hardClass) bits.push(T("hardest ", "más difícil ") + tr(r.hardClass));
    if (r.dayWord) bits.push(tr(r.dayWord).toLowerCase());
    return bits.join(" · ") || T("skipped through", "pasó de largo");
  }
  /* ⚠ ONE SOURCE FOR WHAT A SLIP SAYS. `detail` draws it, `detailText`
     writes it into a shared or printed record, and both read this. Two
     lists would be two places for a field to go missing, and the one that
     went missing would be the one that left the building. */
  function detailRows(r) {
    return [
      ["Enjoyed", "Disfrutó", r.favClass, 0], ["Because", "Porque", r.favWhy, 0],
      ["Hardest", "Más difícil", r.hardClass, 0], ["Because", "Porque", r.hardWhy, 0],
      ["Good moment", "Momento bueno", r.goodMoment, 0], ["Rough moment", "Momento difícil", r.roughMoment, 0],
      ["They did", "Hizo", r.response, 0], ["Carrying", "Se lleva", r.closing, 0],
      ["Their day", "Su día", r.dayWord, 0], ["They wrote", "Escribió", r.written, 1]
    ].filter(function (x) { return x[2]; }).map(function (x) {
      return [T(x[0], x[1]), String(x[2]).split(" · ").map(tr).join(" · "), x[3]];
    });
  }
  function detail(r) {
    var html = detailRows(r).map(function (x) {
      return '<div class="rr"><div class="rk">' + esc(x[0]) + '</div><div class="rv">' + esc(x[1]) + "</div></div>";
    }).join("");
    return html || '<p class="xv-none">' + esc(T("They opened it and left everything blank. That is an answer too.",
      "Lo abrió y dejó todo en blanco. Eso también es una respuesta.")) + "</p>";
  }
  /* ⚠ TYPED TEXT DOES NOT LEAVE THE BUILDING BY DEFAULT — THE PRODUCT RULE.

     What a student CHOSE off a list and what a student TYPED are not the
     same kind of thing. The options are a vocabulary an educator handed
     them; the box is the one channel where a child says something nobody
     offered — including, sometimes, something about home. A record that a
     teacher can hand to a parent in two taps must not carry that by
     accident, and "the teacher will remember to check" is not a safeguard.

     So: the screen shows it, unchanged, to the educator who is responsible
     for it. A printed or shared record leaves it out AND SAYS SO, with a
     count and where to read it, because a page that quietly omits a child's
     own words is its own kind of dishonest.

     The same rule is kept on the daily check-in for `tellAdult`. If Jimmy
     wants a deliberate "include what they wrote" tick on the share sheet,
     that is a switch, not a default — do not flip this one instead. */
  function detailText(r) {
    var rows = detailRows(r).filter(function (x) { return !x[2]; });
    if (!rows.length) return T("Opened and left blank — which is an answer too.", "Abierta y dejada en blanco — que también es una respuesta.");
    return rows.map(function (x) { return x[0] + ": " + x[1]; }).join("  ·  ");
  }
  function typedCount(rows) {
    return rows.filter(function (r) { return String(r.written || "").trim(); }).length;
  }
  function typedNote(n) {
    if (!n) return "";
    return T(n + (n === 1 ? " slip in this record has something the student typed in their own words. It is not printed here and is not carried in a shared link — it is on the teacher’s own screen, in the Exit slips panel."
                          : " slips in this record have something the student typed in their own words. It is not printed here and is not carried in a shared link — it is on the teacher’s own screen, in the Exit slips panel."),
             n + (n === 1 ? " salida de este registro tiene algo que el estudiante escribió con sus propias palabras. No se imprime aquí ni viaja en un enlace compartido — está en la pantalla del docente, en el panel de Salidas."
                          : " salidas de este registro tienen algo que el estudiante escribió con sus propias palabras. No se imprime aquí ni viaja en un enlace compartido — está en la pantalla del docente, en el panel de Salidas."));
  }

  /* ══════════════════════════════════════════ REMOVING A SLIP  ·  .30dl
     Jimmy: "How can we delete some of the exit slips. The tester and etx
     should not stay there and they are off the google sheet."

     ⚠ TWO PRESSES, NEVER A BROWSER DIALOG. confirm() blocks the page, is
     painted by the browser rather than by this product, and reads as an
     error rather than as a question. The button arms itself instead, says
     in words what it is about to take, and disarms after six seconds if
     nobody meant it.
     ⚠ AND AN UNDO, because on this device the row is the only copy. What
     came out is held in LAST until the next removal.
     ⚠ NO NEW COLOR AND NO RED. A red control here would be the one thing
     this whole panel is written not to do -- rank a record. */
  var LAST = null;
  function ckey(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
  function slipRef(r) { return ckey(r && r.studentId) + "|" + String((r && r.timestamp) || ""); }
  function delBtn(r) {
    return '<button type="button" class="xh-fambtn xv-del" data-xvdel="' + esc(slipRef(r)) + '">' +
      esc(T("Remove this slip", "Quitar esta salida")) + "</button>";
  }
  function armLabel(n) {
    return n === 1
      ? T("Press again to remove 1 slip", "Presiona otra vez para quitar 1 salida")
      : T("Press again to remove " + n + " slips", "Presiona otra vez para quitar " + n + " salidas");
  }
  /* ⚠ SAY THAT THE SHEET IS UNTOUCHED, on the screen, every time. A teacher
     who thinks this deleted the Google Sheet row will go looking for a row
     that is still there; a teacher who thinks it did not will leave one
     they meant to remove. Neither guess is acceptable. */
  function doRemove(keys, who) {
    var took = [];
    try { took = (window.AOGExitSlip && window.AOGExitSlip.remove(keys)) || []; } catch (e) {}
    LAST = took.length ? took : null;
    if (!took.length) {
      VIEW.delSaid = T("Nothing to remove.", "No hay nada que quitar.");
    } else if (took.length === 1) {
      VIEW.delSaid = T(
        "Removed 1 slip. It will not come back the next time you pull. The row in your Google Sheet is untouched — delete it there if you want it gone from the Sheet too.",
        "Se quitó 1 salida. No volverá la próxima vez que traigas datos. La fila de tu Hoja de Google queda intacta — bórrala allí si también quieres que desaparezca de la Hoja.");
    } else {
      var n = took.length;
      VIEW.delSaid = T(
        "Removed " + n + " slips" + (who ? (" from " + who) : "") +
          ". They will not come back the next time you pull. The rows in your Google Sheet are untouched — delete them there if you want them gone from the Sheet too.",
        "Se quitaron " + n + " salidas" + (who ? (" de " + who) : "") +
          ". No volverán la próxima vez que traigas datos. Las filas de tu Hoja de Google quedan intactas — bórralas allí si también quieres que desaparezcan de la Hoja.");
    }
    render();
  }
  function disarmAll() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-armed]"), function (o) {
      var was = o.getAttribute("data-was");
      o.removeAttribute("data-armed");
      if (was != null) { o.textContent = was; o.removeAttribute("data-was"); }
    });
  }

  function render() {
    var host = el("panel-exitslip");
    if (!host) return;
    injectCss();
    var all = slips(), rows = inWindow(all);

    var canPull = false, lastPull = "";
    try { canPull = !!(window.AOGExitSlip && window.AOGExitSlip.canPull && window.AOGExitSlip.canPull()); } catch (e) {}
    try {
      var lp = (window.AOGExitSlip && window.AOGExitSlip.lastPulled) ? window.AOGExitSlip.lastPulled() : "";
      if (lp) lastPull = new Date(lp).toLocaleTimeString(isEs() ? "es" : "en", { hour: "numeric", minute: "2-digit" });
    } catch (e) {}

    var answered = function (k) { return rows.filter(function (r) { return r[k]; }).length; };
    var asked = rows.filter(function (r) { return r.followUp; });
    var pats = patterns(rows);

    host.innerHTML =
      '<div class="xv-head"><h2>' + esc(T("Exit slips", "Salidas del día")) + "</h2>" +
        '<span class="xv-n">' + esc(rows.length + T(rows.length === 1 ? " slip" : " slips", rows.length === 1 ? " salida" : " salidas") +
          " · " + new Set(rows.map(function (r) { return r.studentId; })).size +
          T(" students", " estudiantes")) + "</span>" +
        /* ⚠ PLAIN MARKUP, NOT AOGHandoff.button(). The handoff layer loads
           after this one, and a control that renders only when another module
           happens to have finished is a control that is missing on the first
           paint. A data attribute is picked up by its delegated listener
           whenever that listener arrives. */
        (rows.length
          ? '<button type="button" class="xv-hb ghost xv-share" data-hdshare="exit:class">' +
            esc(T("Print / Share", "Imprimir / Compartir")) + "</button>"
          : "") +
      "</div>" +

      '<div class="xv-hand">' +
        '<button type="button" class="xv-hb" id="xvOpen">' + esc(T("Open the exit slip", "Abrir la salida")) + "</button>" +
        '<button type="button" class="xv-hb ghost" id="xvCopy">' + esc(T("Copy the student link", "Copiar el enlace")) + "</button>" +
        '<code class="xv-url">' + esc(SLIP_URL) + "</code>" +
        '<span class="xv-said" id="xvSaid" role="status" aria-live="polite"></span>' +
      "</div>" +

      /* §14 · "School sync · On   Last pulled: 4:51 PM   [ Pull ]" — said
         plainly, on the screen, where a teacher looking for their class's
         slips will actually look for it. */
      '<div class="xv-sync">' +
        '<span class="xv-dot' + (canPull ? " on" : "") + '" aria-hidden="true"></span>' +
        '<span class="xv-sl">' + esc(T("School sync", "Sincronización") + " · " +
          (canPull ? T("On", "Activada") : T("Off", "Desactivada"))) + "</span>" +
        (lastPull ? '<span class="xv-sl dim">' + esc(T("Last pulled: ", "Última vez: ") + lastPull) + "</span>" : "") +
        /* ⚠ DRAWN ONLY WHEN THE DEPLOYED SHEET SCRIPT IS BEHIND, and never as
           an error. This is the screen a teacher is looking at when a pull
           quietly returns nothing, so it is the one place the staleness has
           to be visible — but a strip that gains a chip on every render would
           break the steady-layout rule, so it says nothing when there is
           nothing to say. Owned by #aog-script-version. */
        (function () {
          try {
            var sv = window.AOGScriptVersion && window.AOGScriptVersion.state();
            if (!sv || !sv.stale || !sv.connected) return "";
            return '<span class="xv-sl warn">' + esc(sv.short || T("Sheet script is out of date", "El script está desactualizado")) +
                   " · " + esc(T("Set up ▸ Connect your Sheet", "Configurar ▸ Conectar la Hoja")) + "</span>";
          } catch (e) { return ""; }
        })() +
        '<button type="button" class="xv-hb" id="xvPull"' + (canPull ? "" : " disabled") + ">" +
          esc(T("Pull slips from the sheet", "Traer salidas de la hoja")) + "</button>" +
        '<span class="xv-said' + (VIEW.pullBad ? " bad" : "") + '" id="xvPullMsg" role="status" aria-live="polite">' +
          esc(VIEW.pullSaid || "") + "</span>" +
      "</div>" +

      (VIEW.delSaid
        ? '<div class="xv-undo" role="status" aria-live="polite"><span>' + esc(VIEW.delSaid) + "</span>" +
          ((LAST && LAST.length)
            ? '<button type="button" class="xv-hb ghost" id="xvUndo">' + esc(T("Undo", "Deshacer")) + "</button>"
            : "") +
          '<button type="button" class="xv-hb ghost" id="xvDelDone">' + esc(T("Dismiss", "Descartar")) + "</button>" +
          "</div>"
        : "") +

      '<div class="xv-range" role="group" aria-label="' + esc(T("Time range", "Rango de tiempo")) + '">' +
        RANGES.map(function (r) {
          return '<button type="button" class="xv-r' + (VIEW.range === r.k ? " on" : "") + '" data-r="' + r.k +
            '" aria-pressed="' + (VIEW.range === r.k ? "true" : "false") + '">' + esc(T(r.en, r.es)) + "</button>";
        }).join("") + "</div>" +

      (!rows.length
        ? '<div class="xv-card"><h3>' + esc(T("Nothing here yet", "Nada aquí todavía")) + "</h3>" +
          '<p class="xv-none">' + esc(T("Tap Copy the student link and share it where your class will see it at the end of the day, or tap Open the exit slip to try it yourself first. Slips done on this device show here right away; slips from students’ phones go to your Sheet — tap Pull to bring them in.",
            "Toca Copiar el enlace del estudiante y compártelo donde tu clase lo vea al final del día, o toca Abrir la boleta para probarla tú primero. Las boletas hechas en este dispositivo aparecen aquí al instante; las de los teléfonos van a tu Hoja: toca Traer para verlas.")) + "</p></div>"
        :
        /* ---------------------------------------------- §24 · at a glance */
        '<div class="xv-grid">' +
          '<div class="xv-card"><h3>' + esc(T("Most enjoyed classes", "Clases más disfrutadas")) + "</h3>" +
            '<p class="xv-den">' + esc(T("of " + answered("favClass") + " who named one", "de " + answered("favClass") + " que nombraron una")) + "</p>" +
            barsHtml(tally(rows, "favClass"), answered("favClass")) + "</div>" +
          '<div class="xv-card"><h3>' + esc(T("Most challenging classes", "Clases más difíciles")) + "</h3>" +
            '<p class="xv-den">' + esc(T("of " + answered("hardClass") + " who named one", "de " + answered("hardClass") + " que nombraron una")) + "</p>" +
            barsHtml(tally(rows, "hardClass"), answered("hardClass")) + "</div>" +
          '<div class="xv-card"><h3>' + esc(T("What made it challenging", "Qué la hizo difícil")) + "</h3>" +
            '<p class="xv-den">' + esc(T("of " + answered("hardWhy") + " who said why", "de " + answered("hardWhy") + " que dijeron por qué")) + "</p>" +
            barsHtml(tally(rows, "hardWhy"), answered("hardWhy")) + "</div>" +
          '<div class="xv-card"><h3>' + esc(T("Good moments", "Momentos buenos")) + "</h3>" +
            '<p class="xv-den">' + esc(T("of " + answered("goodMoment") + " who named one", "de " + answered("goodMoment") + " que nombraron uno")) + "</p>" +
            barsHtml(tally(rows, "goodMoment"), answered("goodMoment")) + "</div>" +
          '<div class="xv-card"><h3>' + esc(T("When something was hard, they…", "Cuando algo fue difícil…")) + "</h3>" +
            '<p class="xv-den">' + esc(T("no answer here is better than another", "ninguna respuesta es mejor que otra")) + "</p>" +
            barsHtml(tally(rows, "response"), answered("response")) + "</div>" +
          '<div class="xv-card"><h3>' + esc(T("How they described the day", "Cómo describieron el día")) + "</h3>" +
            '<p class="xv-den">' + esc(T("a perception, not a measurement", "una percepción, no una medición")) + "</p>" +
            barsHtml(tally(rows, "dayWord"), answered("dayWord"), 7) + "</div>" +
        "</div>" +

        /* ------------------------------------------- the request, not a flag */
        (asked.length
          ? '<div class="xv-ask"><h3>' + esc(T("Asked for something", "Pidieron algo")) + "</h3>" +
            asked.slice(0, 12).map(function (r) {
              return '<div class="row"><b>' + esc(r.studentId) + "</b> · " + esc(prettyDate(r.date)) +
                '<span class="said">' + esc(r.written ? r.written.slice(0, 220) :
                  T("Tapped “I need help with this.”", "Tocó «Necesito ayuda con esto».")) + "</span></div>";
            }).join("") + "</div>"
          : "") +

        /* ------------------------------------------------- §23 · patterns */
        (pats.length
          ? '<div class="xv-pat"><h3>' + esc(T("Pattern emerging", "Patrón que aparece")) + "</h3>" +
            '<p class="xv-den">' + esc(T("Counted, not concluded. Each of these is a reason to ask, never a finding.",
              "Contado, no concluido. Cada uno es motivo para preguntar, nunca un hallazgo.")) + "</p>" +
            pats.map(function (p) {
              return '<div class="xv-p"><span class="who">' + esc(p.sid) + "</span>" +
                p.reads.map(function (rd) {
                  return "<p>" + esc(rd.what) + '</p><p class="ask">' + esc(rd.ask) + "</p>";
                }).join("") + "</div>";
            }).join("") + "</div>"
          : "") +

        /* -------------------------------------- §24 · one line per slip */
        '<div class="xv-list"><h3>' + esc(T("The slips", "Las salidas")) + "</h3>" +
          '<p class="xv-den">' + esc(T("One line each. Open one only when you want to.",
            "Una línea cada una. Ábrela solo si quieres.")) + "</p>" +
          (rows.length
            ? '<p class="xh-fbr"><button type="button" class="xh-fambtn" id="xvFamAll">💛 ' +
              esc(T("Print family cards — everyone here", "Imprimir tarjetas familiares — todos")) + "</button></p>"
            : "") +
          rows.slice(0, 200).map(function (r, i) {
            var id = "xvr" + i, open = !!VIEW.open[id];
            return '<button type="button" class="xv-row" data-x="' + id + '" aria-expanded="' + (open ? "true" : "false") +
              '" aria-controls="' + id + 'd">' +
                '<span class="sid">' + esc(r.studentId) + "</span>" +
                '<span class="when">' + esc(whenLabel(r)) + "</span>" +
                '<span class="gist">' + esc(gist(r)) + "</span>" +
                (r.followUp ? '<span class="flag">' + esc(T("asked", "pidió")) + "</span>" : "") +
              "</button>" +
              '<div class="xv-det" id="' + id + 'd"' + (open ? "" : " hidden") + ">" + detail(r) +
                /* .30cw — the educator's copy of the family card: for records,
                   and for the printer that is the actual bridge home on a
                   fleet that can't print or message. Delegated listener and
                   renderer live in #aog-exit-home. */
                '<p class="xh-fbr"><button type="button" class="xh-fambtn" data-xh-fam="' +
                  esc(String(r.studentId || "") + "|" + String(r.date || "") + "|" + String(r.timestamp || "")) +
                  '">💛 ' + esc(T("Family card", "Tarjeta familiar")) + "</button>" + delBtn(r) + "</p></div>";
          }).join("") +
        "</div>" +

        /* ⚠ §25, said on the screen and not only in this file. A teacher who
           reads this panel without this paragraph is being handed something
           that looks like a diagnosis. */
        '<p class="xv-foot"><b>' + esc(T("What this is.", "Qué es esto.")) + "</b> " +
          esc(T("These are the words students chose about their own day. “I was tired” is not a sleep problem, “Math was difficult” is not a math deficit, and “Someone upset me” is not an incident. It is context, and you are the one who interprets it.",
            "Son las palabras que los estudiantes eligieron sobre su propio día. «Estaba cansado» no es un problema de sueño, «Matemáticas fue difícil» no es una carencia, y «Alguien me molestó» no es un incidente. Es contexto, y tú eres quien lo interpreta.")) + "</p>" +
        '<p class="xv-foot">' + esc(T("Slips finished on this device are here. Slips from a student’s own phone reach your Sheet, not this screen.",
          "Las salidas terminadas en este dispositivo están aquí. Las del teléfono de un estudiante llegan a tu Hoja, no a esta pantalla.")) + "</p>" +

        /* Only when some row on screen genuinely has no clock, so a teacher
           is not left wondering where the times went. */
        (rows.slice(0, 200).some(function (r) { return !prettyClock(r); })
          ? '<p class="xv-foot">' + esc(T(
              "Some of these show a day and no time. That means the row came back from your Sheet without one — a Sheet whose columns were not set to plain text stores the stamp as a date and the clock is lost on the way in. Re-pasting the Apps Script and redeploying it fixes it for slips from then on; rows already in the Sheet keep what they were stored as. A time is never guessed here.",
              "Algunas muestran el día y ninguna hora. Eso significa que la fila volvió de tu Hoja sin ella: una Hoja cuyas columnas no están en texto plano guarda la marca como fecha y la hora se pierde al entrar. Volver a pegar el Apps Script y redesplegarlo lo arregla para las salidas siguientes; las filas que ya están en la Hoja conservan lo que se guardó. Aquí nunca se adivina una hora.")) + "</p>"
          : "")
      );

    var famAll = el("xvFamAll");
    if (famAll) famAll.addEventListener("click", function () {
      try { if (window.AOGExitHome && window.AOGExitHome.printMany) window.AOGExitHome.printMany(rows.slice(0, 200)); } catch (e) {}
    });
    var openB = el("xvOpen");
    if (openB) openB.addEventListener("click", function () {
      try {
        if (typeof window.aogOpenExitSlip === "function") { window.aogOpenExitSlip(); return; }
      } catch (e) {}
      try { location.hash = "exit-slip"; } catch (e) {}
    });
    var copyB = el("xvCopy"), said = el("xvSaid");
    if (copyB) copyB.addEventListener("click", function () {
      var url = "https://" + SLIP_URL;
      function done(okd) {
        if (!said) return;
        said.textContent = okd ? T("Copied", "Copiado") : T("Press ⌘C", "Presiona ⌘C");
        setTimeout(function () { if (said) said.textContent = ""; }, 2600);
      }
      /* navigator.clipboard is undefined on a page served over plain http and
         refuses without a user gesture on some school-managed browsers, so the
         selection fallback is not optional. */
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () { done(true); }, function () { selectUrl(); done(false); });
          return;
        }
      } catch (e) {}
      selectUrl(); done(false);
    });
    function selectUrl() {
      try {
        var code = host.querySelector(".xv-url");
        if (!code) return;
        /* It is hidden until this moment, and this is the moment. */
        code.className = "xv-url show";
        var r = document.createRange();
        r.selectNodeContents(code);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      } catch (e) {}
    }

    /* §14 · the pull. It always re-renders, so the counts on the six cards
       and the message underneath can never disagree about what just
       arrived — and the message is read off VIEW rather than written onto a
       node the re-render is about to replace. */
    var pb = el("xvPull");
    if (pb) pb.addEventListener("click", function () {
      pb.disabled = true;
      VIEW.pullSaid = T("Pulling…", "Trayendo…");
      VIEW.pullBad = false;
      var m = el("xvPullMsg");
      if (m) { m.className = "xv-said"; m.textContent = VIEW.pullSaid; }
      var run;
      try { run = window.AOGExitSlip.pull(); }
      catch (e) { run = Promise.resolve({ ok: false, error: T("Exit slips aren’t loaded on this page.", "Las salidas no están cargadas en esta página.") }); }
      run.then(function (r) {
        if (!r || !r.ok) {
          VIEW.pullBad = true;
          VIEW.pullSaid = (r && r.error) || T("Couldn’t pull.", "No se pudo traer.");
        } else {
          VIEW.pullBad = false;
          VIEW.pullSaid = r.added
            ? (r.added === 1
                ? T("1 new submission pulled.", "1 envío nuevo.")
                : T(r.added + " new submissions pulled.", r.added + " envíos nuevos."))
            : T("You’re up to date.", "Estás al día.");
        }
        render();
      });
    });

    var ub = el("xvUndo");
    if (ub) ub.addEventListener("click", function () {
      var n = 0;
      try { n = (window.AOGExitSlip && window.AOGExitSlip.restore(LAST || [])) || 0; } catch (e) {}
      LAST = null;
      VIEW.delSaid = n
        ? T(n === 1 ? "1 slip put back." : n + " slips put back.",
            n === 1 ? "1 salida devuelta." : n + " salidas devueltas.")
        : T("Nothing to put back.", "No hay nada que devolver.");
      render();
    });
    var db = el("xvDelDone");
    if (db) db.addEventListener("click", function () { VIEW.delSaid = ""; LAST = null; render(); });

    Array.prototype.forEach.call(host.querySelectorAll(".xv-r"), function (b) {
      b.addEventListener("click", function () {
        VIEW.range = b.getAttribute("data-r");
        VIEW.pullSaid = ""; VIEW.pullBad = false;
        render();
      });
    });
    Array.prototype.forEach.call(host.querySelectorAll(".xv-row"), function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-x");
        var open = !VIEW.open[id];
        VIEW.open[id] = open;
        var d = el(id + "d");
        if (d) d.hidden = !open;
        b.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ------------------------------------------------------------- the wiring
     refreshAdmin is WRAPPED, never replaced, and the wrapper returns the
     original's return value. Same idiom as the population layer, for the
     same reason: several blocks hang off that one function. */
  function wrapRefresh() {
    if (typeof window.refreshAdmin !== "function" || window.refreshAdmin.__xv) return false;
    var orig = window.refreshAdmin;
    window.refreshAdmin = function () {
      var r = orig.apply(this, arguments);
      try { if (el("panel-exitslip")) render(); } catch (e) {}
      return r;
    };
    window.refreshAdmin.__xv = true;
    return true;
  }
  function init() {
    if (!wrapRefresh()) {
      var tries = 0, iv = setInterval(function () { if (wrapRefresh() || ++tries > 40) clearInterval(iv); }, 120);
    }
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="exitslip"], .dmode[data-mode="exit"]');
      if (t) setTimeout(render, 0);
    });
    /* .30dl · Remove — delegated on the document, because this panel is
       re-rendered wholesale by the range chips, by every pull, by the
       language switch and by the student view's own repaint. A listener
       bound to a button is a listener bound to a node that is about to be
       replaced. Capture phase, so nothing else acts on the click first. */
    document.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest("[data-xvdel],[data-xsdel]") : null;
      if (!b) return;
      ev.preventDefault();
      ev.stopPropagation();
      var one = b.getAttribute("data-xvdel");
      var sid = b.getAttribute("data-xsdel");
      var keys = [];
      if (one) keys = [one];
      else { try { keys = (window.AOGExitSlip && window.AOGExitSlip.keysFor(sid)) || []; } catch (e) { keys = []; } }
      if (b.getAttribute("data-armed") === "1") {
        doRemove(keys, one ? "" : String(sid || ""));
        return;
      }
      /* Only ever one thing armed at a time. */
      disarmAll();
      b.setAttribute("data-was", b.textContent);
      b.setAttribute("data-armed", "1");
      b.textContent = one ? armLabel(1) : armLabel(keys.length);
      setTimeout(function () {
        if (b.getAttribute("data-armed") !== "1") return;
        var was = b.getAttribute("data-was");
        b.removeAttribute("data-armed");
        if (was != null) { b.textContent = was; b.removeAttribute("data-was"); }
      }, 6000);
    }, true);
    try {
      new MutationObserver(function () { try { if (el("panel-exitslip")) render(); } catch (e) {} })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch (e) {}
    setTimeout(render, 240);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 260); });
  else setTimeout(init, 260);

  /* ⚠ EXPORTED SO THE PER-STUDENT VIEW USES THESE AND NOT A SECOND COPY.
     `gist`, `detail` and `barsHtml` each carry §-rules — nothing ranked,
     every bar one color, the denominator named on the card. A second
     implementation of any of them is a second place for those rules to
     quietly stop being true. See [[aog-exit-student]]. */
  /* ==================================================== THE SHARED RECORD
     What this screen hands to #aog-handoff when a teacher
     presses Print / Share. DATA ONLY — never markup, because this object
     travels inside a link and the viewer that draws it must be able to
     assume nothing.

     ⚠ EVERY NUMBER HERE IS THE SAME CALL THE CARD ON SCREEN MAKES. tally,
     the denominators, the pattern reads: a printed record and the screen
     can never disagree, because there is only one arithmetic.

     ⚠ §25 GOES FIRST, NOT LAST. On the screen the "what this is"
     paragraph sits under the data, where a teacher who has already been
     taught the rule will find it. On a page that leaves the building it has
     to be read BEFORE the counts, because the reader may be a parent
     meeting this instrument for the first time. */
  var SHARE_CARDS = [
    { k: "favClass",   en: "Most enjoyed classes",             es: "Clases más disfrutadas",   d: 1 },
    { k: "hardClass",  en: "Most challenging classes",         es: "Clases más difíciles",     d: 1 },
    { k: "hardWhy",    en: "What made it challenging",         es: "Qué la hizo difícil",      d: 2 },
    { k: "goodMoment", en: "Good moments",                     es: "Momentos buenos",          d: 1 },
    { k: "response",   en: "When something was hard, they…",   es: "Cuando algo fue difícil…", d: 3 },
    { k: "dayWord",    en: "How they described the day",       es: "Cómo describieron el día",  d: 4, cap: 7 }
  ];
  function denomLine(kind, n) {
    if (kind === 1) return T("of " + n + " who named one", "de " + n + " que nombraron una");
    if (kind === 2) return T("of " + n + " who said why", "de " + n + " que dijeron por qué");
    if (kind === 3) return T("no answer here is better than another", "ninguna respuesta es mejor que otra");
    return T("a perception, not a measurement", "una percepción, no una medición");
  }
  var WHAT_THIS_IS = [
    "These are the words students chose about their own day. “I was tired” is not a sleep problem, “Math was difficult” is not a math deficit, and “Someone upset me” is not an incident. It is context, and the educator is the one who interprets it. Nothing on this page is a score, a rating or a ranking — an exit slip has no number in it.",
    "Son las palabras que los estudiantes eligieron sobre su propio día. «Estaba cansado» no es un problema de sueño, «Matemáticas fue difícil» no es una carencia, y «Alguien me molestó» no es un incidente. Es contexto, y el educador es quien lo interpreta. Nada en esta página es un puntaje ni una clasificación — una salida no tiene números."
  ];
  function rangeLabel() {
    var r = RANGES.filter(function (x) { return x.k === VIEW.range; })[0];
    return r ? T(r.en, r.es) : "";
  }
  function packet() {
    var rows = inWindow(slips());
    var answered = function (k) { return rows.filter(function (r) { return r[k]; }).length; };
    var b = [{ y: "note", h: T("What this is", "Qué es esto"), p: T(WHAT_THIS_IS[0], WHAT_THIS_IS[1]) }];
    b.push({ y: "kv", h: T("At a glance", "De un vistazo"), i: [
      [T("Slips", "Salidas"), String(rows.length)],
      [T("Students", "Estudiantes"), String(new Set(rows.map(function (r) { return r.studentId; })).size)],
      [T("Asked for something", "Pidieron algo"), String(rows.filter(function (r) { return r.followUp; }).length)]
    ] });
    SHARE_CARDS.forEach(function (c) {
      var n = answered(c.k);
      b.push({ y: "bars", h: T(c.en, c.es), d: denomLine(c.d, n), n: n,
               i: tally(rows, c.k).slice(0, c.cap || 5).map(function (o) { return [tr(o.k), o.n]; }) });
    });
    var pats = patterns(rows);
    if (pats.length) {
      b.push({ y: "note", h: T("Pattern emerging", "Patrón que aparece"),
               p: T("Counted, not concluded. Each of these is a reason to ask, never a finding. A pattern is never read from fewer than " + MIN_SLIPS + " slips.",
                    "Contado, no concluido. Cada uno es motivo para preguntar, nunca un hallazgo. Nunca se lee un patrón con menos de " + MIN_SLIPS + " salidas.") });
      pats.forEach(function (p) {
        b.push({ y: "rows", h: p.sid, i: p.reads.map(function (rd) { return ["", rd.what, rd.ask]; }) });
      });
    }
    if (rows.length) {
      b.push({ y: "rows", h: T("The slips", "Las salidas"),
               i: rows.slice(0, 200).map(function (r) {
                 return [String(r.studentId || "") + (whenLabel(r) ? ("  ·  " + whenLabel(r)) : ""), gist(r), detailText(r)];
               }),
               p: T("Slips finished on a teacher device and slips pulled down from your Sheet, in one list.",
                    "Salidas terminadas en un dispositivo del docente y salidas traídas de tu Hoja, en una sola lista.") });
    }
    var tn = typedCount(rows);
    if (tn) b.push({ y: "note", h: T("What is not on this page", "Lo que no está en esta página"), p: typedNote(tn) });
    return {
      v: 1, k: "exit",
      t: T("Exit slips · the class", "Salidas del día · la clase"),
      s: "", c: "", r: rangeLabel(),
      g: new Date().toISOString(), b: b
    };
  }

  window.AOGExitView = {
    render: render, patterns: patterns, tally: tally, view: VIEW,
    slips: slips, gist: gist, detail: detail, detailText: detailText, barsHtml: barsHtml,
    prettyDate: prettyDate, whenLabel: whenLabel, packet: packet,
    typedNote: typedNote, typedCount: typedCount,
    inWindow: inWindow, rangeLabel: rangeLabel, denomLine: denomLine,
    shareCards: SHARE_CARDS, whatThisIs: WHAT_THIS_IS,
    limits: { MIN_SLIPS: MIN_SLIPS, HIT: HIT, OF: OF }
  };
})();
