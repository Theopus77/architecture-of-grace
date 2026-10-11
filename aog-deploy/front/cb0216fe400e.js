
/* =====================================================================
   STUDENTS ARE TELLING US…   ·   handoff v3 §05
   =====================================================================

   The one genuinely new idea in the third handoff, and the audit's first
   build item. Nothing on this dashboard led with what students SAID.
   Today's Picture leads with counts and the most noticeable area, which is
   the right second thing.

   ⚠ IT COLLECTS NOTHING NEW. Every phrase on this card is a string a
   student already tapped and this device already stores:

       aog.checkin.student.v1 → challenge · challengeImpact · need · feelingWords · tellAdult
       aog.exit.v1            → hardWhy · roughMoment · response · goodMoment · written

   The option banks were built as KEYS on purpose (see the ⚠ over FEELINGS
   in the check-in layer). This card is the first reader that treats them
   as keys. Rename one there and this card silently splits a theme in two.

   ⚠ THE FOUR RULES THIS CARD MUST NOT BREAK
   -----------------------------------------
   1 · NO STUDENT IS NAMED, and nothing here ranks anybody. Same rule
       Today's Picture holds. A sentence renders without its code; WHO said
       it is the Students door's job, and the card says so out loud. A
       teacher with this on a projector must not be able to out a child.
   2 · WHAT A STUDENT TYPED NEVER TRAVELS. Typed text is withheld from
       every share packet by design — a printed or copied record carries a
       count and where to read it, never the words. This card renders those
       words on screen for the teacher and adds NOTHING to any packet, and
       it is behind one tap so it does not paint on a projected screen.
   3 · NOTHING SAID ONCE IS A THEME. Two students, minimum, or the phrase
       is not listed — and with nothing over the floor the card says that
       is a real answer, not a gap, in NOTICE's own words. It never invents
       a pattern to have something to show.
   4 · EVERY LINE NAMES ITS OWN EVIDENCE. Which question it answers and
       which instrument it came from, so a teacher can disagree with it.
       A count off a morning check-in and a count off an end-of-day slip
       are not the same claim and are never merged into one unlabeled
       number.

   ⚠ IT SITS BELOW TODAY'S PICTURE, NOT ABOVE IT. §05 asks for voice to
   lead, and that is right, but Today's Picture being the first thing on
   the tab is the fix for a P0 finding — the answer was below the fold.
   Pushing it down to satisfy a handoff would re-open that. This card goes
   directly under it. One line in mount() moves it if that call changes.
   ===================================================================== */
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
  function tr(s) { try { return window.AOGCheckinTr ? window.AOGCheckinTr(s) : s; } catch (e) { return s; } }

  function todayISO() {
    var d = new Date(), m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function daysAgoISO(n) {
    var d = new Date(); d.setDate(d.getDate() - n);
    var m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }

  /* Eleven periods, 0 through 10, 0 is Advisory. Mirrors PICK_PERIODS in
     Today's Picture; if you add a period there, add it here. */
  var PERIODS = (function () {
    var out = [{ v: "", en: "All periods", es: "Todos los periodos" },
               { v: "Advisory", en: "Period 0 · Advisory", es: "Periodo 0 · Asesoría" }];
    for (var i = 1; i <= 10; i++) out.push({ v: "Period " + i, en: "Period " + i, es: "Periodo " + i });
    return out;
  })();

  var RANGES = [
    { v: "today", en: "Today",        es: "Hoy",              back: 0 },
    { v: "week",  en: "Last 7 days",  es: "Últimos 7 días",   back: 6 },
    { v: "month", en: "Last 30 days", es: "Últimos 30 días",  back: 29 }
  ];

  /* ⚠ MINIMUM TWO. One student saying a thing is that student's morning,
     not the group's. Same discipline as NOTICE's three-point floor, set
     one lower because this counts people rather than points in time. */
  var FLOOR = 2;
  var MAX_LINES = 5;
  var MAX_WORDS = 6;

  var V = { range: "week", period: "", open: false, showWho: false };

  /* ---------------------------------------------------------------
     THE TWO QUESTIONS THIS CARD ANSWERS, AND WHERE EACH COMES FROM.
     A bucket never mixes instruments silently — src travels with the
     count and is printed beside it.
     --------------------------------------------------------------- */
  /* ⚠ A FEELING IS NOT A VERDICT, AND IT IS NEVER FILED UNDER GOING WELL.
     The first cut of this card put feelingWords in a bucket headed "What is
     going well" — which rendered "Overwhelmed 2" and "Tired 2" underneath
     it. That is not a cosmetic mislabel: it tells a teacher the product
     cannot read its own data, and it is the exact thing §31's language
     system exists to prevent. Feelings get their own neutral heading and
     are never sorted into good and bad; "going well" is the exit slip's
     goodMoment, which is the one field a student answered that way. */
  var BUCKETS = [
    {
      k: "way",
      en: "What is getting in the way", es: "Qué se está interponiendo",
      fields: [
        { store: "checkin", f: "challenge",   src: "checkin" },
        { store: "exit",    f: "hardWhy",     src: "slip" },
        { store: "exit",    f: "roughMoment", src: "slip" }
      ]
    },
    {
      k: "help",
      en: "What students say would help", es: "Qué dicen que ayudaría",
      fields: [
        { store: "checkin", f: "need", src: "checkin" }
      ]
    },
    /* ⚠ SAME RULE AS FEELINGS, CAUGHT THE SAME WAY (a screenshot, 2026-08-28).
       The exit slip's `response` is what a student DID when it got hard —
       "I kept trying", "I gave up" — and the first cut filed it under "would
       help", which rendered "I gave up · 9" as something students say would
       help. Only invisible until a demo (or a classroom) had exit slips.
       What they did is its own honest heading, never a request and never a
       verdict. */
    {
      k: "did",
      en: "What students did when it got hard", es: "Qué hicieron cuando se puso difícil",
      fields: [
        { store: "exit", f: "response", src: "slip" }
      ]
    },
    {
      k: "arrive",
      en: "How students are arriving", es: "Cómo están llegando",
      fields: [
        { store: "checkin", f: "feelingWords", src: "checkin" }
      ]
    },
    {
      k: "well",
      en: "What is going well", es: "Qué está yendo bien",
      fields: [
        { store: "exit", f: "goodMoment", src: "slip" }
      ]
    }
  ];

  /* The escape-hatch answers. A student choosing "rather not say" has given
     an honest answer and it is not a theme about the group. Counted in the
     response total, never listed as something students are telling us.

     ⚠ COMPLETED IN .30ck — the list had grown by accretion, each build
     adding only its own strings, so most escape rows leaked through as
     "themes" ("Nothing today · 12" under What is getting in the way).
     Every escape string from every bank that feeds this card is here now.
     THE PROMISE THIS LIST SERVES is the one written above it: an escape
     answer is counted in the response total and never listed as something
     students are telling us. If a bank gains an escape option, IT GOES
     HERE AND IN TIM_SKIP IN THE SAME BUILD.

     Lookup is normalized (skipNorm: curly → straight apostrophe, trim,
     lowercase) so the two apostrophe spellings that once needed doubled
     entries — and any future quote drift — cannot reopen the leak. Keys
     below are written pre-normalized.

     ⚠ "Numb" STAYS OUT ON PURPOSE. It sits in the FEELINGS escape row for
     layout (always visible), but it is an honest feeling, not a decline —
     a class where four students tapped Numb is a fact a teacher should
     see under How students are arriving.

     The rough-moment gate rides in BOTH spellings: records before .30cj
     stored it with the 😊, records after store it bare. Same answer, same
     rule — a "no" is never a theme. TIM_SKIP carries the same set. */
  function skipNorm(s) {
    return String(s == null ? "" : s).replace(/’/g, "'").trim().toLowerCase();
  }
  var SKIP = {
    "nothing right now": 1, "not sure": 1, "i'd rather not say": 1,
    "rather not say": 1, "none of these": 1,
    "nothing": 1, "skip": 1, "": 1,
    "😊 no — not really.": 1, "no — not really.": 1,
    "i'm not sure": 1, "i'm not sure yet": 1,
    "i don't know": 1, "i don't want to say": 1,
    "nothing today": 1, "something else": 1, "nothing specific": 1,
    "i just had a good moment": 1,
    "nothing was especially difficult today": 1
  };

  function splitVals(v) {
    if (v == null) return [];
    return String(v).split(/\s*[|,]\s*/).map(function (x) { return x.trim(); })
      .filter(function (x) { return x && !SKIP[skipNorm(x)]; });
  }

  /* ---------------------------------------------------------------
     READ. Both stores share a shape: { logs: { CODE: { date: [ rec ] } } }.
     --------------------------------------------------------------- */
  function recordsIn(range, period) {
    var back = 0;
    RANGES.forEach(function (r) { if (r.v === range) back = r.back; });
    var from = back === 0 ? todayISO() : daysAgoISO(back);
    var out = [];
    [["checkin", "aog.checkin.student.v1"], ["exit", "aog.exit.v1"]].forEach(function (pair) {
      var logs = (jload(pair[1], {}) || {}).logs || {};
      Object.keys(logs).forEach(function (code) {
        var days = logs[code] || {};
        Object.keys(days).forEach(function (d) {
          if (String(d) < from) return;
          (days[d] || []).forEach(function (rec) {
            if (!rec) return;
            if (period && String(rec.period || "") !== period) return;
            out.push({ store: pair[0], code: code, day: d, rec: rec });
          });
        });
      });
    });
    return out;
  }

  /* ⚠ COUNTS ARE STUDENTS, NOT ANSWERS. A student who checks in every
     morning for a week and taps "Schoolwork" each time is one student
     saying one thing, not five students saying it. Counting rows would
     turn a single child's hard week into a class-wide theme. */
  function tally(rows) {
    var out = {};
    BUCKETS.forEach(function (b) { out[b.k] = {}; });

    rows.forEach(function (r) {
      BUCKETS.forEach(function (b) {
        b.fields.forEach(function (fd) {
          if (fd.store !== r.store) return;
          splitVals(r.rec[fd.f]).forEach(function (phrase) {
            var bag = out[b.k];
            var hit = bag[phrase] || (bag[phrase] = { phrase: phrase, who: {}, src: {}, hard: {} });
            hit.who[r.code] = 1;
            hit.src[fd.src] = 1;
            /* Schoolwork alone is a label; Schoolwork, a whole lot is a
               signal. The impact rides on the challenge question, so it is
               only meaningful on the field it was asked beside. */
            if (fd.f === "challenge" && parseInt(r.rec.challengeImpact, 10) >= 4) hit.hard[r.code] = 1;
          });
        });
      });
    });

    var res = {};
    BUCKETS.forEach(function (b) {
      res[b.k] = Object.keys(out[b.k]).map(function (p) {
        var h = out[b.k][p];
        return {
          phrase: p,
          n: Object.keys(h.who).length,
          hard: Object.keys(h.hard).length,
          src: Object.keys(h.src)
        };
      }).filter(function (x) { return x.n >= FLOOR; })
        .sort(function (a, b2) { return b2.n - a.n || (a.phrase < b2.phrase ? -1 : 1); })
        .slice(0, MAX_LINES);
    });
    return res;
  }

  /* ⚠ WHAT A STUDENT TYPED. Rendered here and nowhere else — this never
     enters a packet, a print, a copied link or a QR. No code travels with
     the sentence: WHO is the Students door's job. */
  function typedWords(rows) {
    var out = [];
    rows.forEach(function (r) {
      var t = String((r.store === "checkin" ? r.rec.tellAdult : r.rec.written) || "").trim();
      if (!t) return;
      out.push({ text: t, day: r.day, store: r.store, ts: String(r.rec.timestamp || r.day) });
    });
    out.sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
    return out;
  }

  /* ⚠ WHO, NOT JUST HOW MANY. The button said "2 asked for an adult — see
     who" and then opened the Students list, which is not seeing who: it is
     being handed everybody. Worse, it could MISS the child who asked —
     that list is built from reflection records, so a student who has only
     ever done a check-in is not on it at all (the same gap the check-ins
     picker exists for).

     ⚠ AND IT IS NOT A BREACH OF THIS CARD'S FIRST RULE. Rule 1 is that no
     student is NAMED IN A THEME — a count of who is struggling must never
     become a roster. A follow-up flag is not a theme and not a finding: it
     is a MESSAGE A CHILD ADDRESSED TO AN ADULT. Showing the typed sentence
     while hiding who sent it is not privacy, it is a dropped message. It
     rides behind the same one tap as the words, is hidden in print, and
     never enters a packet. */
  function askedToTalk(rows) {
    var who = {}, out = [];
    rows.forEach(function (r) {
      if (!r.rec || !r.rec.followUp) return;
      if (who[r.code]) {
        if (r.day > who[r.code].day) { who[r.code].day = r.day; who[r.code].store = r.store; }
        return;
      }
      who[r.code] = { code: r.code, day: r.day, store: r.store };
      out.push(who[r.code]);
    });
    out.sort(function (a, b) { return a.day < b.day ? 1 : (a.day > b.day ? -1 : (a.code < b.code ? -1 : 1)); });
    return out;
  }

  function respondents(rows) {
    var who = {};
    rows.forEach(function (r) { who[r.code] = 1; });
    return Object.keys(who).length;
  }

  /* ---------------------------------------------------------------
     CSS. ⚠ --navy is an INK for a light ground and --cream is a GROUND
     for dark ink; NEITHER is remapped for dark. That single fact was
     seven contrast failures on Today's Picture (team review item 15).
     Every use of one here has a dark override at the end of this block.
     --------------------------------------------------------------- */
  function injectCss() {
    if (el("aog-voice-css")) return;
    var s = document.createElement("style");
    s.id = "aog-voice-css";
    s.textContent = [
      "#aogVoice{border:1px solid var(--rule,#E4DAC5);border-left:4px solid var(--aog-dusk,#6E7FA6);border-radius:14px;background:var(--card,#fff);padding:20px 22px;margin:0 0 22px;}",
      "#aogVoice .vc-top{display:flex;align-items:baseline;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:2px;}",
      "#aogVoice .vc-kicker{font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--aog-dusk,#5c6c92);margin:0;}",
      "#aogVoice .vc-count{font-size:12.5px;color:var(--ink-faint,#8A92A6);font-weight:600;}",
      "#aogVoice .vc-lead{font-family:var(--font-serif,Georgia,serif);font-size:20px;line-height:1.3;font-weight:600;color:var(--navy,#0A1E33);margin:4px 0 14px;}",
      "#aogVoice .vc-ctl{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:0 0 16px;}",
      "#aogVoice .vc-ctl label{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);}",
      "#aogVoice select{font:inherit;font-size:13.5px;font-weight:600;color:var(--navy,#0A1E33);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:9px;padding:8px 11px;}",
      "#aogVoice .vc-sec{border-top:1px solid var(--rule-soft,#EFE8DA);padding-top:13px;margin-top:13px;}",
      "#aogVoice .vc-sec:first-of-type{border-top:0;padding-top:0;margin-top:0;}",
      "#aogVoice .vc-lbl{font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);margin:0 0 9px;}",
      "#aogVoice .vc-row{display:flex;align-items:baseline;gap:11px;padding:7px 0;border-bottom:1px solid var(--rule-soft,#EFE8DA);}",
      "#aogVoice .vc-row:last-child{border-bottom:0;}",
      "#aogVoice .vc-n{font-size:19px;font-weight:800;color:var(--navy,#0A1E33);min-width:1.9em;text-align:right;font-variant-numeric:tabular-nums;flex:0 0 auto;}",
      "#aogVoice .vc-ph{font-size:15.5px;line-height:1.45;color:var(--ink,#22303F);flex:1 1 auto;min-width:0;}",
      "#aogVoice .vc-meta{display:block;font-size:11.5px;line-height:1.5;color:var(--ink-faint,#8A92A6);font-weight:600;margin-top:1px;}",
      "#aogVoice .vc-hard{color:var(--gold-deep,#9a6f24);}",
      "#aogVoice .vc-note{font-size:12.5px;line-height:1.6;color:var(--ink-soft,#5b6675);margin:9px 0 0;}",
      "#aogVoice .vc-empty{font-size:15px;line-height:1.65;color:var(--ink,#22303F);margin:0;}",
      "#aogVoice .vc-empty b{color:var(--navy,#0A1E33);}",
      "#aogVoice .vc-empty ul{margin:9px 0 0;padding-left:19px;}",
      "#aogVoice .vc-empty li{margin:0 0 4px;font-size:14px;color:var(--ink-soft,#5b6675);}",
      "#aogVoice .vc-words{background:var(--cream,#FBF8F1);border:1px solid var(--rule-soft,#EFE8DA);border-radius:12px;padding:15px 17px;margin-top:14px;}",
      "#aogVoice .vc-q{font-family:var(--font-serif,Georgia,serif);font-size:16.5px;line-height:1.5;color:var(--navy,#0A1E33);margin:0 0 11px;padding-left:13px;border-left:3px solid var(--aog-dusk,#6E7FA6);}",
      "#aogVoice .vc-q:last-of-type{margin-bottom:0;}",
      "#aogVoice .vc-q .vc-when{display:block;font-family:inherit;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);margin-top:4px;}",
      /* \u26a0 THE SAME TOKEN-ON-THE-WRONG-GROUND BUG, ONE MORE TIME.
         --ink-faint is legible on --card and measures 4.41:1 on --cream,
         which is a FAIL for text this size. The .vc-words block is the only
         cream ground on this card, so the two small labels inside it step up
         to --ink-soft. axe: 3 serious contrast violations before, 0 after. */
      "#aogVoice .vc-words .vc-lbl,#aogVoice .vc-q .vc-when{color:var(--ink-soft,#5b6675);}",
      "#aogVoice .vc-acts{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px;}",
      "#aogVoice .vc-btn{font:inherit;font-size:13px;font-weight:700;color:#fff;background:var(--navy,#0A1E33);border:0;border-radius:999px;padding:9px 17px;cursor:pointer;}",
      "#aogVoice .vc-btn.ghost{color:var(--navy,#0A1E33);background:transparent;border:1px solid var(--rule,#E4DAC5);}",
      "#aogVoice .vc-btn:hover{opacity:.9;}",
      "#aogVoice .vc-btn:focus-visible{outline:2px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#aogVoice .vc-foot{font-size:11.5px;line-height:1.6;color:var(--ink-faint,#8A92A6);margin:16px 0 0;padding-top:11px;border-top:1px solid var(--rule-soft,#EFE8DA);}",
      "@media (max-width:560px){#aogVoice{padding:16px 15px;}#aogVoice .vc-lead{font-size:18px;}#aogVoice .vc-words{padding:13px 13px;}}",
      /* Typed words are for the person at the keyboard, never for paper. */
      "@media print{#aogVoice .vc-acts,#aogVoice .vc-words,#aogVoice #vcWhoList,#aogVoice select{display:none;}}",
      ":root[data-theme=\"dark\"] #aogVoice .vc-lead,",
      ":root[data-theme=\"dark\"] #aogVoice .vc-n,",
      ":root[data-theme=\"dark\"] #aogVoice .vc-empty b,",
      ":root[data-theme=\"dark\"] #aogVoice select,",
      ":root[data-theme=\"dark\"] #aogVoice .vc-btn.ghost{color:var(--ink,#ECE5D6);}",
      ":root[data-theme=\"dark\"] #aogVoice .vc-kicker{color:var(--aog-dusk,#9BAAD0);}",
      ":root[data-theme=\"dark\"] #aogVoice .vc-hard{color:var(--gold,#E7B85E);}",
      ":root[data-theme=\"dark\"] #aogVoice .vc-words{background:var(--paper,#152331);border-color:var(--rule,#2B3B4B);}",
      ":root[data-theme=\"dark\"] #aogVoice .vc-q{color:var(--ink,#ECE5D6);}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ---------------------------------------------------------------
     RENDER
     --------------------------------------------------------------- */
  function srcWord(src) {
    if (src.length > 1) return T("check-in and exit slip", "registro y boleta de salida");
    return src[0] === "slip" ? T("exit slip", "boleta de salida") : T("check-in", "registro diario");
  }

  /* The section heading is directly above every row it owns, so repeating it
     in the row's own meta line is noise. What the meta line is FOR is naming
     the instrument the count came off. */
  function rowHtml(item) {
    var meta = srcWord(item.src);
    var hard = item.hard >= FLOOR
      ? ' <span class="vc-hard">· ' + esc(T(item.hard + " said it hit a lot or more",
                                            item.hard + " dijeron que afectó mucho o más")) + "</span>"
      : "";
    return '<div class="vc-row">' +
      '<span class="vc-n">' + item.n + "</span>" +
      '<span class="vc-ph">' + esc(tr(item.phrase)) +
      '<span class="vc-meta">' + esc(meta) + hard + "</span>" +
      "</span></div>";
  }

  function render() {
    var host = el("panel-overview");
    if (!host) return;
    injectCss();

    var card = el("aogVoice");
    if (!card) {
      card = document.createElement("div");
      card.id = "aogVoice";
      mount(host, card);
    }

    var rows = recordsIn(V.range, V.period);
    var t = tally(rows);
    var words = typedWords(rows);
    var people = respondents(rows);
    var talkWho = askedToTalk(rows);
    var talk = talkWho.length;

    var ctl =
      '<div class="vc-ctl">' +
        '<label for="vcRange">' + esc(T("Range", "Periodo de tiempo")) + "</label>" +
        '<select id="vcRange">' + RANGES.map(function (r) {
          return '<option value="' + esc(r.v) + '"' + (r.v === V.range ? " selected" : "") + ">" +
                 esc(T(r.en, r.es)) + "</option>";
        }).join("") + "</select>" +
        '<label for="vcPeriod">' + esc(T("Period", "Periodo")) + "</label>" +
        '<select id="vcPeriod">' + PERIODS.map(function (p) {
          return '<option value="' + esc(p.v) + '"' + (p.v === V.period ? " selected" : "") + ">" +
                 esc(T(p.en, p.es)) + "</option>";
        }).join("") + "</select>" +
      "</div>";

    var head =
      '<div class="vc-top">' +
        '<p class="vc-kicker">' + esc(T("Students are telling us", "Los estudiantes nos dicen")) + "</p>" +
        '<span class="vc-count">' + esc(
          people === 1 ? T("1 student answered", "1 estudiante respondió")
                       : T(people + " students answered", people + " estudiantes respondieron")) +
        "</span>" +
      "</div>";

    /* §25 — an empty state that teaches. This is the first screen a teacher
       who has set nothing up is looking at, and "No data" would tell them
       the product is empty rather than that it is ready. */
    if (!rows.length) {
      card.innerHTML = head +
        '<p class="vc-lead">' + esc(T("Nothing has come in for this range yet.",
                                      "Todavía no ha llegado nada en este periodo.")) + "</p>" +
        ctl +
        '<div class="vc-empty"><p style="margin:0">' +
          esc(T("When students do a check-in or exit slip, this fills in with what they chose, in their words, not as a score:",
                "Cuando los estudiantes hacen un registro o una boleta de salida, esto se llena con lo que eligieron, en sus palabras, no como puntaje:")) +
        "</p><ul>" +
          "<li>" + esc(T("what is getting in the way, and how hard it hit",
                         "qué se está interponiendo, y cuánto les afectó")) + "</li>" +
          "<li>" + esc(T("what they say would help", "qué dicen que ayudaría")) + "</li>" +
          "<li>" + esc(T("what is going well", "qué está yendo bien")) + "</li>" +
          "<li>" + esc(T("anything they typed for an adult to read",
                         "lo que hayan escrito para que un adulto lo lea")) + "</li>" +
        "</ul></div>" +
        '<div class="vc-acts">' +
          '<button class="vc-btn" id="vcLink" type="button">' +
            esc(T("Hand out a link", "Repartir un enlace")) + "</button>" +
        "</div>" +
        '<p class="vc-foot">' + esc(T("These numbers count students, not answers. No student is named.",
                                      "Estos números cuentan estudiantes, no respuestas. No se nombra a ningún estudiante.")) + "</p>";
      wire();
      return;
    }

    var any = BUCKETS.some(function (b) { return t[b.k].length; });

    var body = "";
    if (any) {
      BUCKETS.forEach(function (b) {
        if (!t[b.k].length) return;
        body += '<div class="vc-sec"><p class="vc-lbl">' + esc(T(b.en, b.es)) + "</p>" +
          t[b.k].map(function (it) { return rowHtml(it); }).join("") + "</div>";
      });
    } else {
      /* ⚠ NOTICE's sentence, on purpose. A card that manufactures a theme
         out of one answer teaches a teacher to distrust every other line
         on it. */
      body = '<div class="vc-sec"><p class="vc-empty">' +
        esc(T("Nothing has been said by two different students yet. That is a real answer, not a gap — a theme needs at least two people, and this is fewer.",
              "Todavía no hay algo que hayan dicho dos estudiantes distintos. Eso es una respuesta real, no un vacío: un tema necesita al menos dos personas, y aquí hay menos.")) +
        "</p></div>";
    }

    var lead = any
      ? T("Here is what students chose, most often first.",
          "Esto es lo que eligieron los estudiantes, lo más frecuente primero.")
      : T("They have answered — there is just not a group pattern in it yet.",
          "Ya respondieron — todavía no hay un patrón de grupo.");

    var wordsBlock = "";
    if (words.length) {
      wordsBlock =
        '<div class="vc-acts">' +
          '<button class="vc-btn ghost" id="vcToggle" type="button" aria-expanded="' + (V.open ? "true" : "false") +
            '" aria-controls="vcWords">' +
            esc(V.open ? T("Hide what students wrote", "Ocultar lo que escribieron")
                       : (words.length === 1
                          ? T("Show what 1 student wrote", "Ver lo que escribió 1 estudiante")
                          : T("Show what " + words.length + " students wrote",
                              "Ver lo que escribieron " + words.length + " estudiantes"))) +
          "</button>" +
          (talk ? '<button class="vc-btn ghost" id="vcWho" type="button" aria-expanded="' + (V.showWho ? "true" : "false") +
            '" aria-controls="vcWhoList">' +
            esc(V.showWho
                ? T("Hide who asked", "Ocultar quién pidió")
                : (talk === 1 ? T("1 asked for an adult — see who", "1 pidió hablar con un adulto — ver quién")
                              : T(talk + " asked for an adult — see who",
                                  talk + " pidieron hablar con un adulto — ver quién"))) + "</button>" : "") +
        "</div>";
      if (talk && V.showWho) {
        wordsBlock +=
          '<div class="vc-words" id="vcWhoList">' +
            '<p class="vc-lbl">' + esc(T("Asked for an adult", "Pidieron hablar con un adulto")) + "</p>" +
            talkWho.map(function (w) {
              return '<p class="vc-q" style="font-family:inherit;font-size:15px;">' + esc(w.code) +
                '<span class="vc-when">' + esc(w.day) + " · " +
                esc(w.store === "exit" ? T("exit slip", "boleta de salida")
                                       : T("check-in", "registro diario")) + "</span></p>";
            }).join("") +
            '<p class="vc-note">' + esc(
              T("A request, not a finding — they asked, so this names them to you and to nobody else. It is not printed, not copied and not in any link. Open Students for the whole record.",
                "Una petición, no una conclusión — lo pidieron, así que esto te los nombra a ti y a nadie más. No se imprime, no se copia y no va en ningún enlace. Abre Estudiantes para el registro completo.")) +
            "</p>" +
            '<div class="vc-acts"><button class="vc-btn ghost" id="vcOpenStu" type="button">' +
              esc(T("Open Students", "Abrir Estudiantes")) + "</button></div>" +
          "</div>";
      }
      if (V.open) {
        wordsBlock +=
          '<div class="vc-words" id="vcWords">' +
            '<p class="vc-lbl">' + esc(T("In their own words", "En sus propias palabras")) + "</p>" +
            words.slice(0, MAX_WORDS).map(function (w) {
              return '<p class="vc-q">“' + esc(w.text) + "”" +
                '<span class="vc-when">' + esc(w.day) + " · " +
                esc(w.store === "exit" ? T("exit slip", "boleta de salida")
                                       : T("check-in", "registro diario")) + "</span></p>";
            }).join("") +
            '<p class="vc-note">' + esc(
              T("Shown on this screen only. Typed words are never added to a printed report, a copied link or a QR code — and no student code is shown here. Open Students to see whose words these are.",
                "Solo en esta pantalla. Lo que se escribe nunca se agrega a un informe impreso, a un enlace copiado ni a un código QR — y aquí no se muestra ningún código de estudiante. Abre Estudiantes para ver de quién son.")) +
            "</p>" +
          "</div>";
      }
    }

    card.innerHTML = head +
      '<p class="vc-lead">' + esc(lead) + "</p>" +
      ctl + body + wordsBlock +
      /* ⚠ THIS LINE HAD TO CHANGE THE DAY "see who" STARTED NAMING PEOPLE.
         It used to end "and no student is named on this card", which stopped
         being true the moment the follow-up list rendered two codes directly
         above it. The distinction is the real one and is worth saying: a
         THEME never names anybody; a REQUEST names the child who made it,
         because they asked. */
      '<p class="vc-foot">' + esc(
        T("Counts are students, not answers — one student saying a thing every morning is counted once. No theme here names anybody, and none of it is a finding about any one child. The only place a student is named is where one asked for an adult, because that is a message to you.",
          "Los conteos son estudiantes, no respuestas: quien repite algo cada mañana se cuenta una vez. Ningún tema nombra a nadie, y nada aquí es una conclusión sobre un estudiante. El único lugar donde se nombra a alguien es donde pidió hablar con un adulto, porque eso es un mensaje para ti.")) +
      "</p>";

    wire();
  }

  /* ⚠ BELOW TODAY'S PICTURE. See the header note — moving this above it
     re-opens a fixed P0 finding. */
  function mount(host, card) {
    var tp = el("aogTodaysPicture");
    if (tp && tp.parentNode === host) host.insertBefore(card, tp.nextSibling);
    else host.insertBefore(card, host.firstChild);
  }

  function wire() {
    var r = el("vcRange");
    if (r) r.addEventListener("change", function () { V.range = r.value; render(); });
    var p = el("vcPeriod");
    if (p) p.addEventListener("change", function () { V.period = p.value; render(); });
    var tg = el("vcToggle");
    if (tg) tg.addEventListener("click", function () { V.open = !V.open; render(); });
    var who = el("vcWho");
    if (who) who.addEventListener("click", function () { V.showWho = !V.showWho; render(); });
    var os = el("vcOpenStu");
    if (os) os.addEventListener("click", function () { goStudents(); });
    var lk = el("vcLink");
    if (lk) lk.addEventListener("click", function () {
      try { if (typeof window.aogQsTab === "function") window.aogQsTab("distribute"); } catch (e) {}
    });
  }

  function goStudents() {
    try { if (typeof window.aogQsTab === "function") { window.aogQsTab("home"); return; } } catch (e) {}
    try {
      var b = document.querySelector('#screen-admin .tab[data-tab="home"]');
      if (b) b.click();
    } catch (e2) {}
  }

  /* The card is part of the Overview, so it refreshes when the Overview does.
     Same boot as Today's Picture, including the two late retries — the panel
     is built by a script that may not have run yet on a cold load. */
  (function boot() {
    function attach() {
      if (typeof window.refreshAdmin === "function" && !window.refreshAdmin.__aogVoice) {
        var orig = window.refreshAdmin;
        var wrapped = function () {
          var res = orig.apply(this, arguments);
          try { render(); } catch (e) {}
          return res;
        };
        wrapped.__aogVoice = true;
        /* Carry the other layers' flags; see #aog-one-story. */
        try {
          Object.keys(orig).forEach(function (k) {
            if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
          });
        } catch (eF) {}
        window.refreshAdmin = wrapped;
      }
      if (el("panel-overview")) { try { render(); } catch (e) {} }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
    else attach();
    setTimeout(attach, 900);
    setTimeout(attach, 2400);
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="overview"]');
      if (t) setTimeout(function () { try { render(); } catch (_e) {} }, 80);
    });
  })();

  window.AOGVoice = {
    render: render,
    rows: recordsIn,
    themes: function (range, period) { return tally(recordsIn(range || V.range, period || V.period)); },
    words: function (range, period) { return typedWords(recordsIn(range || V.range, period || V.period)); },
    FLOOR: FLOOR
  };
})();
