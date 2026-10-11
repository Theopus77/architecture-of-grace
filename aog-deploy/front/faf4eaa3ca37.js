
/* ============================================================================
   BRING THIS HOME — the Exit Slip's family bridge (build .30cv, 2026-08-31).

   ⚠ THIS IS A BRIDGE, NEVER A REPORT. The slip already holds the most human
   record this product makes — what mattered to one child today, in the words
   they tapped themselves. This layer lets that reflection travel exactly one
   step farther, TO SOMEONE WHO LOVES THEM, and only when the child chooses.
   Nothing here is ever sent automatically, and the teacher is never told
   which way the child chose. The moment this screen starts feeling like
   something a school sent to a parent instead of something a child brought
   home, it has failed — that sentence is the acceptance test.

   ⚠ THE CHILD'S WORDS ARE SACRED. "I kept trying" is never rewritten into
   "student demonstrated persistence". The card quotes the tapped options
   verbatim (translated for a Spanish reader through the slip's own
   trOption/trSubject, the same round-trip the recap uses) and the system
   only CONTEXTUALIZES — one doorway question for the adult, never a
   summary, never a score, never an interpretation.

   ⚠ WHAT NEVER LEAVES: the typed `written` field. Its question names its
   reader — "Anything you want an adult to know?" means the SCHOOL adult
   the slip syncs to (.30cj), and detailText() upholds the same exclusion
   on the teacher's shared packets. A promise about who reads a sentence is
   made at typing time and cannot be widened afterward. `roughMoment` also
   stays off the card: the doorway may say today was hard, but the child
   decides at the kitchen table how much of the hard part to tell.

   ⚠ NO SECOND SCHOOL DASHBOARD. No response rates, no engagement metrics,
   no streaks, no charts, no reminders to share. One store, three canned
   adult responses, one banner. Anything more is surveillance wearing a
   heart emoji. (Same law as the /family destination: home is never school.)

   ⚠ FOUR REGISTERS, ONE ARCHITECTURE — K-2, 3-5, 6-8, 9-12, banded off the
   link's own grade param at CALL time (never at parse — the .30cj lesson;
   everything here runs after submit, long after aog.launch.grade landed).
   The flow, the storage and the choice are identical in all four; only the
   wording moves, exactly as §26 does it for the slip itself. A high
   schooler is offered autonomy in an adult voice; a first grader is
   offered to "show someone at home". Neither is offered pressure.

   The loop this exists for:
     student reflects → student CHOOSES to bring it home → adult gets one
     doorway question → adult (optionally) taps one response on this same
     device → student sees "someone at home saw your day" on tomorrow's
     slip. Student feels seen. That is the product; there is no metric.

   Share is TEXT ONLY, through navigator.share with a clipboard fallback —
   the same primitive as the family hub's sharePrompt(). No links to data,
   no server, nothing to expire because nothing is hosted. The adult
   response lives only in this device's localStorage (aog.exit.home.v1),
   which is exactly as far as it needs to travel.
   ========================================================================= */
(function () {
  "use strict";

  /* ── small helpers, duplicated by design like every module in this file ── */
  function T(en, es) {
    try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function jsave(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function ss(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function codeKey(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
  function isEsNow() {
    try { return (typeof dashLang !== "undefined" && dashLang === "es"); } catch (e) { return false; }
  }

  /* ── the store ──────────────────────────────────────────────────────────
     aog.exit.home.v1 = { v:1, sids: { CODE: { "YYYY-MM-DD": {
       choice: "home" | "private",
       reply:  { k:"saw"|"proud"|"more", at:ISO, seen:bool } | undefined
     } } } }
     Never synced anywhere. Deliberately NOT inside aog.exit.v1 — daily.v1
     taught us that readers of an instrument's own store score what they
     find there, and a family's "I'm proud of you" must never be scoreable. */
  var HKEY = "aog.exit.home.v1";
  function store() {
    var s = jload(HKEY, null);
    if (!s || typeof s !== "object" || !s.sids) s = { v: 1, sids: {} };
    return s;
  }
  function entry(sid, date) {
    var s = store(); sid = codeKey(sid);
    return (s.sids[sid] && s.sids[sid][date]) || null;
  }
  function patchEntry(sid, date, patch) {
    var s = store(); sid = codeKey(sid);
    if (!s.sids[sid]) s.sids[sid] = {};
    if (!s.sids[sid][date]) s.sids[sid][date] = {};
    var e = s.sids[sid][date];
    for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) e[k] = patch[k];
    jsave(HKEY, s);
    return e;
  }

  /* ── the four registers ────────────────────────────────────────────────
     Read from the same launch key the slip's own gradeBand() reads, at call
     time. Absent or unparseable grade falls to 6-8, matching the slip's own
     default register — one product, four registers, no branched flow. */
  /* educatorCard/printMany set this to the RECORD's grade for one synchronous
     build, so a teacher opening cards for many students from one dashboard
     sees each card the way that student's family would have. Null = the
     student path (this device's own launch params). */
  var bandOverride = null;
  function homeBand() {
    var raw = bandOverride;
    if (raw == null) { try { raw = ss("aog.launch.grade") || ""; } catch (e) { raw = ""; } }
    raw = String(raw);
    if (/^\s*k/i.test(raw)) return "k2";
    var n = parseInt(String(raw).replace(/\D/g, ""), 10);
    if (isNaN(n)) return "68";
    if (n <= 2) return "k2";
    if (n <= 5) return "35";
    if (n <= 8) return "68";
    return "912";
  }
  function B(k2, b35, b68, b912) {
    var b = homeBand();
    return b === "k2" ? k2 : b === "35" ? b35 : b === "912" ? (b912 || b68) : b68;
  }

  /* ── reading the record without re-interpreting it ─────────────────────
     Stored values are English (§ the banks' own law); display goes back
     through the slip's exported translators. The escape hatches are answers
     to the SLIP, not things to carry home — "None really stood out today"
     on a family card would read as the system telling on the child. */
  var FAV_SKIP  = { "They were all about the same": 1, "None really stood out today": 1 };
  var HARD_SKIP = { "None were especially challenging": 1, "They were all about the same": 1, "I don’t want to choose": 1 };
  var RESP_SKIP = { "Nothing was especially difficult today": 1 };
  var DAY_SKIP  = { "I’m not sure": 1 };
  var READY_HOME = "I’m ready to go home 😎";
  var HARD_DAYS  = { "Difficult": 1, "Really difficult": 1 };

  function parts(v) {
    return String(v || "").split(" · ").map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function firstReal(v, skip) {
    var p = parts(v);
    for (var i = 0; i < p.length; i++) if (!skip[p[i]]) return p[i];
    return "";
  }
  function realParts(v, skip) {
    return parts(v).filter(function (x) { return !skip[x]; });
  }
  function trOpt(x) {
    try { if (window.AOGExitSlip && AOGExitSlip.tr) return AOGExitSlip.tr(x); } catch (e) {}
    return x;
  }
  function trSub(x) {
    try {
      if (window.AOGExitSlip && AOGExitSlip.trSubject) {
        var t = AOGExitSlip.trSubject(x);
        if (t && t !== x) return t;
      }
    } catch (e) {}
    return trOpt(x);
  }
  /* chips joined " · " read back as a small sentence — "I kept trying.
     I asked for help." — because that is how the child would say it. */
  function sentence(list) {
    return list.map(trOpt).join(". ") + (list.length ? "." : "");
  }

  /* ── one doorway, never five ───────────────────────────────────────────
     The Conversation Path. Priority: persistence beats everything (it is
     the child telling the story of themselves), then a hard day, then a
     hard class, then a favorite, then the 😎 escape, then whatever they
     chose to carry, then one gentle universal. Each returns { lead, quote,
     ask, soft } already localized and banded. `ask` is a question FOR THE
     CHILD, quoted, so the adult can borrow it word for word. */
  function doorway(rec) {
    var resp = realParts(rec.response, RESP_SKIP);
    var hardC = firstReal(rec.hardClass, HARD_SKIP);
    var favC  = firstReal(rec.favClass, FAV_SKIP);
    var closing = parts(rec.closing);
    var day = firstReal(rec.dayWord, DAY_SKIP);
    var soft = T("You don’t have to fix anything. One good question is enough.",
                 "No tienes que arreglar nada. Una buena pregunta es suficiente.");

    if (resp.length) {
      return {
        lead: B(
          T("They kept going when something was tricky today. They said:", "Siguió adelante cuando algo se puso difícil hoy. Dijo:"),
          T("When something got hard today, here’s what they said they did:", "Cuando algo se puso difícil hoy, esto es lo que dijo que hizo:"),
          T("When something was difficult today, they said:", "Cuando algo fue difícil hoy, dijo:"),
          T("When something was difficult today, they said:", "Cuando algo fue difícil hoy, dijo:")),
        quote: sentence(resp),
        ask: B(
          T("What was tricky today?", "¿Qué fue difícil hoy?"),
          T("What happened when it got hard?", "¿Qué pasó cuando se puso difícil?"),
          T("What happened when you got stuck?", "¿Qué pasó cuando te atoraste?"),
          T("What happened when it got hard?", "¿Qué pasó cuando se puso difícil?")),
        soft: soft
      };
    }
    if (HARD_DAYS[day]) {
      return {
        lead: B(
          T("Today felt hard for them.", "Hoy fue un día difícil para él/ella."),
          T("They said today was a hard day.", "Dijo que hoy fue un día difícil."),
          T("They said today was hard.", "Dijo que hoy fue difícil."),
          T("They said today was hard.", "Dijo que hoy fue difícil.")),
        quote: "",
        ask: B(
          T("What was the hard part?", "¿Qué fue lo difícil?"),
          T("What was the hardest part?", "¿Qué fue lo más difícil?"),
          T("What made today feel heavy?", "¿Qué hizo que hoy se sintiera pesado?"),
          T("What kind of hard was today?", "¿Qué clase de difícil fue hoy?")),
        soft: T("Sometimes listening is enough.", "A veces escuchar es suficiente.")
      };
    }
    if (hardC) {
      return {
        lead: T("They said ", "Dijo que ") + trSub(hardC) +
              T(" was the hardest part of their day.", " fue la parte más difícil de su día."),
        quote: "",
        ask: B(
          T("What was hard in ", "¿Qué fue difícil en ") + trSub(hardC) + T("?", "?"),
          T("What part of ", "¿Qué parte de ") + trSub(hardC) + T(" was tricky today?", " estuvo difícil hoy?"),
          T("What made ", "¿Qué hizo que ") + trSub(hardC) + T(" feel difficult today?", " se sintiera difícil hoy?"),
          T("What’s making ", "¿Qué está haciendo que ") + trSub(hardC) + T(" hard right now?", " sea difícil ahora?")),
        soft: soft
      };
    }
    if (favC) {
      return {
        lead: B(
          trSub(favC) + T(" made them happy today.", " le dio alegría hoy."),
          T("They said ", "Dijo que ") + trSub(favC) + T(" was the best part of their day.", " fue la mejor parte de su día."),
          T("They said they enjoyed ", "Dijo que disfrutó ") + trSub(favC) + T(" today.", " hoy."),
          T("They said ", "Dijo que ") + trSub(favC) + T(" was the best part of their day.", " fue la mejor parte de su día.")),
        quote: "",
        ask: B(
          T("What was fun in ", "¿Qué fue divertido en ") + trSub(favC) + T("?", "?"),
          T("What did you like about ", "¿Qué te gustó de ") + trSub(favC) + T(" today?", " hoy?"),
          T("What was happening in ", "¿Qué estaba pasando en ") + trSub(favC) + T(" that you liked?", " que te gustó?"),
          T("What’s going well in ", "¿Qué va bien en ") + trSub(favC) + T("?", "?")),
        soft: soft
      };
    }
    if (closing.indexOf(READY_HOME) !== -1) {
      return {
        lead: T("Home was on their mind today. 😎", "Hoy tenía la casa en mente. 😎"),
        quote: "",
        ask: B(
          T("What do you want to do tonight?", "¿Qué quieres hacer esta noche?"),
          T("What are you looking forward to tonight?", "¿Qué esperas con ganas esta noche?"),
          T("What are you looking forward to tonight?", "¿Qué esperas con ganas esta noche?"),
          T("What are you looking forward to tonight?", "¿Qué esperas con ganas esta noche?")),
        soft: T("Maybe the best response is just: “I’m glad you’re home.”",
                "Quizás la mejor respuesta sea simplemente: “Me alegra que estés en casa”.")
      };
    }
    if (closing.length) {
      return {
        lead: T("They’re taking this with them today:", "Hoy se lleva esto consigo:"),
        quote: sentence(closing.slice(0, 2)),
        ask: B(
          T("What was it?", "¿Qué fue?"),
          T("Tell me more about that?", "¿Me cuentas más de eso?"),
          T("What’s the story there?", "¿Cuál es la historia ahí?"),
          T("What’s the story there?", "¿Cuál es la historia ahí?")),
        soft: soft
      };
    }
    return {
      lead: T("They closed out their day with a quiet one.", "Cerró su día sin decir mucho."),
      quote: "",
      ask: B(
        T("What made you smile today?", "¿Qué te hizo sonreír hoy?"),
        T("What’s one thing that happened today?", "¿Qué es una cosa que pasó hoy?"),
        T("What’s one thing from today I don’t know about?", "¿Qué es algo de hoy que yo no sepa?"),
        T("What’s one thing from today I don’t know about?", "¿Qué es algo de hoy que yo no sepa?")),
      soft: soft
    };
  }

  /* ── the three responses an adult can tap back ─────────────────────────
     Three, canned, warm, unrankable. A free-text field here becomes homework
     for the parent and a moderation surface for us; three hearts cannot. */
  var REPLIES = [
    ["saw",   "❤️", "I saw this",            "Lo vi"],
    ["proud", "😊", "I’m proud of you",       "Estoy orgulloso/a de ti"],
    ["more",  "💬", "Tell me more tonight",   "Cuéntame más esta noche"]
  ];
  function replyLabel(k) {
    for (var i = 0; i < REPLIES.length; i++) {
      if (REPLIES[i][0] === k) return REPLIES[i][1] + " " + T(REPLIES[i][2], REPLIES[i][3]);
    }
    return "";
  }

  /* ── what the card shows ───────────────────────────────────────────────
     Child-voiced rows, chips verbatim, escapes filtered. `written` and
     `roughMoment` are excluded by law (see the header). */
  function cardRows(rec) {
    var rows = [];
    function row(label, val, quote) {
      if (!val) return;
      rows.push('<div class="xh-row"><p class="xh-k">' + esc(label) + '</p><p class="xh-v' +
        (quote ? " xh-quote" : "") + '">' + esc(val) + "</p></div>");
    }
    var favC = firstReal(rec.favClass, FAV_SKIP);
    var hardC = firstReal(rec.hardClass, HARD_SKIP);
    var resp = realParts(rec.response, RESP_SKIP);
    var good = realParts(rec.goodMoment, {});
    var closing = realParts(rec.closing, {});
    var day = firstReal(rec.dayWord, DAY_SKIP);
    row(B(T("I liked", "Me gustó"), T("Today I liked", "Hoy me gustó"),
          T("Today I liked", "Hoy me gustó"), T("Today I liked", "Hoy me gustó")),
        favC ? trSub(favC) : "");
    row(T("The hardest part was", "La parte más difícil fue"), hardC ? trSub(hardC) : "");
    row(T("A good moment", "Un buen momento"), good.length ? sentence(good.slice(0, 2)) : "");
    row(T("When something was hard", "Cuando algo fue difícil"),
        resp.length ? "“" + sentence(resp) + "”" : "", true);
    row(T("I’m taking with me", "Me llevo conmigo"), closing.length ? sentence(closing.slice(0, 2)) : "");
    row(T("My day", "Mi día"), day ? trOpt(day) : "");
    return rows.join("");
  }
  function shareable(rec) {
    return !!(firstReal(rec.favClass, FAV_SKIP) || firstReal(rec.hardClass, HARD_SKIP) ||
      realParts(rec.response, RESP_SKIP).length || realParts(rec.goodMoment, {}).length ||
      parts(rec.closing).length || firstReal(rec.dayWord, DAY_SKIP));
  }

  /* ── the text that travels (Send path) ─────────────────────────────────
     TEXT ONLY, like the family hub's sharePrompt: no link to any data,
     because there is no data anywhere a link could reach. Child-voiced,
     ending with the doorway so the adult holds the question before they
     even see the child. */
  function shareText(rec) {
    var d = doorway(rec);
    var lines = [T("A little piece of my day 💛", "Un pedacito de mi día 💛")];
    var favC = firstReal(rec.favClass, FAV_SKIP);
    var hardC = firstReal(rec.hardClass, HARD_SKIP);
    var resp = realParts(rec.response, RESP_SKIP);
    var closing = realParts(rec.closing, {});
    var day = firstReal(rec.dayWord, DAY_SKIP);
    if (favC) lines.push(T("Today I liked: ", "Hoy me gustó: ") + trSub(favC));
    if (hardC) lines.push(T("The hardest part was: ", "La parte más difícil fue: ") + trSub(hardC));
    if (resp.length) lines.push(T("When something was hard: ", "Cuando algo fue difícil: ") + "“" + sentence(resp) + "”");
    if (closing.length) lines.push(T("I’m taking with me: ", "Me llevo conmigo: ") + sentence(closing.slice(0, 2)));
    if (day) lines.push(T("My day: ", "Mi día: ") + trOpt(day));
    lines.push("");
    lines.push(T("If you want to ask me about it: ", "Si quieres preguntarme: ") + "“" + d.ask + "”");
    lines.push(T("No answer needed. Just wanted you to know. 💛", "No hace falta responder. Solo quería que lo supieras. 💛"));
    lines.push("— architectureofgrace.com/family");
    return lines.join("\n");
  }
  function doShare(rec, noteEl) {
    var text = shareText(rec);
    try {
      if (navigator.share) {
        navigator.share({ text: text }).catch(function () {});
        return;
      }
    } catch (e) {}
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        if (noteEl) noteEl.textContent = T("Copied — paste it into a message if you have one, or ask your teacher to print your card.",
                                           "Copiado — pégalo en un mensaje si tienes uno, o pide a tu maestro/a que imprima tu tarjeta.");
      }
    } catch (e) {}
  }

  /* ── styles: warm, restrained, token-driven, both themes for free ────── */
  function injectCss() {
    if (el("aog-xh-css")) return;
    var s = document.createElement("style");
    s.id = "aog-xh-css";
    s.textContent = [
      "#xsHomeSlot{max-width:560px;margin:18px auto 0;text-align:left;}",
      ".xh-banner{border:1px solid var(--rule);border-left:4px solid var(--aog-dusk);border-radius:12px;",
      "  padding:12px 14px;margin:0 0 14px;font-size:14px;line-height:1.5;color:var(--ink);background:var(--paper);}",
      ".xh-banner b{color:var(--aog-dusk);}",
      ".xh-invite{border:1px solid var(--rule);border-radius:15px;padding:18px 18px 14px;",
      "  background:var(--aog-pale);text-align:center;}",
      ".xh-invite h3{margin:0 0 6px;font-size:17px;line-height:1.35;color:var(--ink);}",
      ".xh-invite .xh-sub{margin:0 0 14px;font-size:13.5px;line-height:1.55;color:var(--ink-soft);}",
      ".xh-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}",
      ".xh-go{background:var(--aog-dusk);color:var(--aog-on);border:0;border-radius:99px;",
      "  padding:11px 20px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;}",
      ".xh-quiet{background:transparent;border:1px solid var(--rule);color:var(--ink);border-radius:99px;",
      "  padding:11px 18px;font-size:14px;cursor:pointer;font-family:inherit;}",
      ".xh-micro{font-size:11.5px;color:var(--ink-soft);margin:10px 0 0;line-height:1.5;}",
      ".xh-state{font-size:14px;color:var(--ink);margin:0 0 8px;}",
      /* the card */
      ".xh-veil{position:fixed;inset:0;background:rgba(20,18,28,.45);z-index:2147483000;",
      "  display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;}",
      ".xh-card{position:relative;background:var(--paper);color:var(--ink);border-radius:18px;",
      "  max-width:480px;width:100%;max-height:92vh;overflow:auto;padding:26px 22px 20px;",
      "  box-shadow:0 18px 60px rgba(0,0,0,.28);text-align:left;}",
      ".xh-x{position:absolute;top:8px;right:10px;border:0;background:transparent;color:var(--ink-faint);",
      "  font-size:26px;line-height:1;cursor:pointer;padding:6px;font-family:inherit;}",
      ".xh-kicker{font-size:19px;font-weight:700;margin:0 0 2px;color:var(--ink);}",
      ".xh-date{font-size:12.5px;color:var(--ink-faint);margin:0 0 16px;}",
      ".xh-row{margin:0 0 12px;}",
      ".xh-k{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--ink-faint);margin:0 0 2px;}",
      ".xh-v{font-size:16px;color:var(--ink);margin:0;line-height:1.45;}",
      ".xh-quote{font-size:17px;font-style:italic;}",
      ".xh-adult{border-top:1px solid var(--rule);margin-top:16px;padding-top:14px;}",
      ".xh-for{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--aog-dusk);",
      "  font-weight:700;margin:0 0 8px;}",
      ".xh-lead{font-size:14px;color:var(--ink);margin:0 0 6px;line-height:1.5;}",
      ".xh-lead .xh-quote{display:block;margin:4px 0 0;}",
      ".xh-ask{font-size:16.5px;color:var(--ink);font-style:italic;margin:0 0 8px;line-height:1.5;}",
      ".xh-nopress{font-size:12.5px;color:var(--ink-faint);margin:0;line-height:1.5;}",
      ".xh-acts{display:flex;gap:10px;margin:16px 0 0;flex-wrap:wrap;justify-content:center;}",
      ".xh-chips{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 0;justify-content:center;}",
      ".xh-chip{border:1px solid var(--rule);border-radius:99px;background:var(--paper);padding:9px 14px;",
      "  font-size:14px;cursor:pointer;color:var(--ink);font-family:inherit;}",
      ".xh-note{font-size:13.5px;color:var(--ink);margin:12px 0 0;text-align:center;line-height:1.5;}",
      ".xh-priv{font-size:11.5px;color:var(--ink-faint);margin:14px 0 0;text-align:center;line-height:1.5;}",
      ".xh-ed{font-size:10.5px;text-transform:uppercase;letter-spacing:.09em;color:var(--ink-faint);margin:0 0 12px;}",
      ".xh-fbr{margin:8px 0 2px;}",
      ".xh-fambtn{border:1px solid var(--rule);border-radius:99px;background:transparent;color:var(--aog-dusk);",
      "  font-weight:600;font-size:12.5px;padding:6px 13px;cursor:pointer;font-family:inherit;}",
      "@media (max-width:520px){.xh-card{padding:22px 16px 16px;}.xh-veil{padding:10px;align-items:flex-end;}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ── the card overlay ──────────────────────────────────────────────────
     Appended to <body>, not into #screen-exit-slip — renderDone repaints
     that section when the sync state flips, and an open card must not be
     torn down mid-conversation by a network reply. */
  function openCard(rec) {
    injectCss();
    closeCard();
    var d = doorway(rec);
    var dateLine = cardDate(rec);
    /* On a managed Chromebook there is no share sheet and usually no one to
       message — Show becomes the primary door and Send steps back to a
       copy control rather than pretending. */
    var canShare = false;
    try { canShare = !!navigator.share; } catch (e) {}
    var veil = document.createElement("div");
    veil.className = "xh-veil";
    veil.id = "xhVeil";
    veil.innerHTML =
      '<div class="xh-card" role="dialog" aria-modal="true" aria-label="' +
        esc(T("A little piece of my day", "Un pedacito de mi día")) + '">' +
        '<button type="button" class="xh-x" id="xhClose" aria-label="' + esc(T("Close", "Cerrar")) + '">×</button>' +
        '<p class="xh-kicker">' + esc(kickerText()) + "</p>" +
        (dateLine ? '<p class="xh-date">' + esc(dateLine) + "</p>" : "") +
        cardRows(rec) +
        adultHtml(d) +
        '<div class="xh-acts">' +
          (canShare
            ? '<button type="button" class="xh-go" id="xhSend">' +
              esc(T("Send it to them", "Envíaselo")) + "</button>"
            : "") +
          '<button type="button" class="' + (canShare ? "xh-quiet" : "xh-go") + '" id="xhShow">' + esc(B(
            T("Show it at home", "Muéstralo en casa"),
            T("Show it at home", "Muéstralo en casa"),
            T("Show it in person", "Muéstralo en persona"),
            T("Show it in person", "Muéstralo en persona"))) + "</button>" +
          (!canShare
            ? '<button type="button" class="xh-quiet" id="xhSend">' +
              esc(T("Copy the words", "Copiar las palabras")) + "</button>"
            : "") +
        "</div>" +
        '<div id="xhReplyZone"></div>' +
        '<p class="xh-note" id="xhShareNote"></p>' +
        '<p class="xh-priv">' + esc(T(
          "This card lives on this device. Sending shares only the words on it — nothing else, never automatically.",
          "Esta tarjeta vive en este dispositivo. Enviar comparte solo las palabras que ves — nada más, nunca automáticamente.")) + "</p>" +
      "</div>";
    document.body.appendChild(veil);
    veil.addEventListener("click", function (ev) { if (ev.target === veil) closeCard(); });
    document.addEventListener("keydown", escClose);
    var x = el("xhClose");
    if (x) x.addEventListener("click", closeCard);
    var send = el("xhSend");
    if (send) send.addEventListener("click", function () { doShare(rec, el("xhShareNote")); });
    var show = el("xhShow");
    if (show) show.addEventListener("click", function () { renderReplyZone(rec); });
  }
  function escClose(ev) { if (ev.key === "Escape") closeCard(); }
  function closeCard() {
    var v = el("xhVeil");
    if (v && v.parentNode) v.parentNode.removeChild(v);
    document.removeEventListener("keydown", escClose);
  }

  /* the hand-the-phone-over moment: the adult taps one of three back */
  function renderReplyZone(rec) {
    var z = el("xhReplyZone");
    if (!z) return;
    var e = entry(rec.studentId, rec.date);
    if (e && e.reply) {
      z.innerHTML = '<p class="xh-note">' + esc(T("They already tapped back: ", "Ya respondieron: ")) +
        esc(replyLabel(e.reply.k)) + "</p>";
      return;
    }
    z.innerHTML =
      '<p class="xh-note">' + esc(B(
        T("Hand this to your grown-up. If you’re the grown-up: tap one back. 💛", "Dale esto a tu adulto. Si tú eres el adulto: toca una respuesta. 💛"),
        T("Hand this to the person you’re sharing with. If that’s you: tap one back.", "Dale esto a la persona con quien compartes. Si eres tú: toca una respuesta."),
        T("If you’re the one being shown this — you can tap one back.", "Si eres la persona a quien le muestran esto — puedes tocar una respuesta."),
        T("If you’re the one being shown this — you can tap one back.", "Si eres la persona a quien le muestran esto — puedes tocar una respuesta."))) + "</p>" +
      '<div class="xh-chips">' +
        REPLIES.map(function (r) {
          return '<button type="button" class="xh-chip" data-xh-reply="' + esc(r[0]) + '">' +
            esc(r[1] + " " + T(r[2], r[3])) + "</button>";
        }).join("") +
      "</div>";
    var chips = z.querySelectorAll("[data-xh-reply]");
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener("click", function (ev) {
        var k = ev.currentTarget.getAttribute("data-xh-reply");
        patchEntry(rec.studentId, rec.date, {
          choice: "home",
          reply: { k: k, at: new Date().toISOString(), seen: false }
        });
        z.innerHTML = '<p class="xh-note">' + esc(B(
          T("They’ll see this next time. 💛", "Lo verá la próxima vez. 💛"),
          T("They’ll see it the next time they close out a day. 💛", "Lo verá la próxima vez que cierre un día. 💛"),
          T("They’ll see it the next time they close out a day. 💛", "Lo verá la próxima vez que cierre un día. 💛"),
          T("They’ll see it the next time they close out a day.", "Lo verá la próxima vez que cierre un día."))) + "</p>";
      });
    }
  }

  /* ── the loop closing: tomorrow's slip says someone saw today's ────────
     Shown once per sid per page load, from a cache, because renderDone
     repaints as the sync state flips and the banner must not vanish
     between "sending" and "sent". Marked seen the moment it is first
     built — a banner that nags is a notification, and this product does
     not do notifications. Same-day replies wait for tomorrow on purpose:
     the reply happens at the kitchen table, after the done screen. */
  var shownReply = {};
  function pendingReplyHtml(sid, today) {
    sid = codeKey(sid);
    if (shownReply[sid] === "") return "";
    if (shownReply[sid]) return shownReply[sid];
    var s = store();
    var days = s.sids[sid] || {};
    var best = "";
    for (var d in days) {
      if (!Object.prototype.hasOwnProperty.call(days, d)) continue;
      var e = days[d];
      if (e && e.reply && e.reply.seen === false && d < today && d > best) best = d;
    }
    if (!best) { shownReply[sid] = ""; return ""; }
    var k = days[best].reply.k;
    days[best].reply.seen = true;
    jsave(HKEY, s);
    var html = '<div class="xh-banner">💛 ' + esc(B(
      T("Someone at home saw your day!", "¡Alguien en casa vio tu día!"),
      T("Someone at home saw the day you shared.", "Alguien en casa vio el día que compartiste."),
      T("Someone at home saw the day you shared.", "Alguien en casa vio el día que compartiste."),
      T("Someone you shared your day with saw it.", "Alguien con quien compartiste tu día lo vio."))) +
      " " + esc(T("They tapped back:", "Te respondieron:")) + " <b>" + esc(replyLabel(k)) + "</b></div>";
    shownReply[sid] = html;
    return html;
  }

  /* ── the invitation on the done screen ───────────────────────────────── */
  function inviteHtml() {
    return '<div class="xh-invite">' +
      "<h3>" + esc(B(
        T("Take a little piece of your day home? 💛", "¿Llevas un pedacito de tu día a casa? 💛"),
        T("Want to take a little piece of your day home?", "¿Quieres llevar un pedacito de tu día a casa?"),
        T("Bring a piece of today home?", "¿Llevas un pedazo de hoy a casa?"),
        T("Take a piece of today with you.", "Llévate un pedazo de hoy contigo."))) + "</h3>" +
      '<p class="xh-sub">' + esc(B(
        T("You can show someone at home what you said. Only if you want to.", "Puedes mostrarle a alguien en casa lo que dijiste. Solo si tú quieres."),
        T("Share this with someone who cares about you — or keep it just for you. You choose.", "Comparte esto con alguien que te quiere — o guárdalo solo para ti. Tú eliges."),
        T("You can share this with someone at home, or keep it to yourself. Nothing goes home unless you choose it.", "Puedes compartir esto con alguien en casa, o guardártelo. Nada va a casa a menos que tú lo elijas."),
        T("Share it with someone who matters to you — or don’t. It’s yours either way.", "Compártelo con alguien que te importe — o no. Es tuyo de cualquier forma."))) + "</p>" +
      '<div class="xh-btns">' +
        '<button type="button" class="xh-go" data-xh="home">' + esc(B(
          T("Take it home 💛", "Llévalo a casa 💛"),
          T("Bring it home 💛", "Llévalo a casa 💛"),
          T("Bring this home", "Llevar esto a casa"),
          T("Share a piece of today", "Compartir un pedazo de hoy"))) + "</button>" +
        '<button type="button" class="xh-quiet" data-xh="private">' + esc(B(
          T("Just for me", "Solo para mí"),
          T("Keep it just for me", "Guardarlo solo para mí"),
          T("Keep it private", "Mantenerlo privado"),
          T("Keep it mine", "Es solo mío"))) + "</button>" +
      "</div>" +
      '<p class="xh-micro">' + esc(T(
        "Either way is a good choice. Your teacher isn’t told which one you pick.",
        "Cualquiera de las dos es una buena elección. A tu maestro/a no se le dice cuál eliges.")) + "</p>" +
    "</div>";
  }
  function chosenHtml(choice) {
    if (choice === "private") {
      return '<div class="xh-invite">' +
        '<p class="xh-state">' + esc(B(
          T("Okay! This one is all yours. 💛", "¡Está bien! Este es todo tuyo. 💛"),
          T("This one stays yours. 💛", "Este se queda contigo. 💛"),
          T("This one stays yours.", "Este se queda contigo."),
          T("This one stays yours.", "Este se queda contigo."))) + "</p>" +
        '<div class="xh-btns"><button type="button" class="xh-quiet" data-xh="home">' +
          esc(T("Changed my mind — bring it home", "Cambié de opinión — llevarlo a casa")) + "</button></div>" +
      "</div>";
    }
    return '<div class="xh-invite">' +
      '<p class="xh-state">' + esc(B(
        T("You took a piece of today home. 💛", "Te llevaste un pedacito de hoy a casa. 💛"),
        T("You brought a piece of today home. 💛", "Llevaste un pedacito de hoy a casa. 💛"),
        T("You brought a piece of today home. 💛", "Llevaste un pedazo de hoy a casa. 💛"),
        T("You took a piece of today with you.", "Te llevaste un pedazo de hoy contigo."))) + "</p>" +
      '<div class="xh-btns"><button type="button" class="xh-quiet" data-xh="open">' +
        esc(T("Open it again", "Ábrelo otra vez")) + "</button></div>" +
    "</div>";
  }

  /* Called by renderDone with the record it just painted and the slot it
     painted for us. Idempotent: renderDone repaints on every sync-state
     flip and this must simply re-arrive at the same picture. */
  function offer(rec, slot) {
    if (!rec || !slot) return;
    injectCss();
    var html = pendingReplyHtml(rec.studentId, rec.date);
    if (shareable(rec)) {
      var e = entry(rec.studentId, rec.date);
      html += (e && e.choice) ? chosenHtml(e.choice) : inviteHtml();
    }
    slot.innerHTML = html;
    slot.onclick = function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest("[data-xh]") : null;
      if (!b) return;
      var act = b.getAttribute("data-xh");
      if (act === "home") {
        patchEntry(rec.studentId, rec.date, { choice: "home" });
        offer(rec, slot);
        openCard(rec);
      } else if (act === "private") {
        patchEntry(rec.studentId, rec.date, { choice: "private" });
        offer(rec, slot);
      } else if (act === "open") {
        openCard(rec);
      }
    };
  }

  /* ── shared builders (one source for the card's chrome) ──────────────── */
  function kickerText() {
    return B(
      T("A little piece of my day 💛", "Un pedacito de mi día 💛"),
      T("A little piece of my day 💛", "Un pedacito de mi día 💛"),
      T("A little piece of my day 💛", "Un pedacito de mi día 💛"),
      T("A piece of my day", "Un pedazo de mi día"));
  }
  function adultHtml(d) {
    return '<div class="xh-adult">' +
      '<p class="xh-for">' + esc(B(
        T("For the grown-up reading this 💛", "Para el adulto que lee esto 💛"),
        T("For the grown-up reading this", "Para el adulto que lee esto"),
        T("For the person reading this", "Para quien lee esto"),
        T("For whoever’s reading this", "Para quien esté leyendo esto"))) + "</p>" +
      '<p class="xh-lead">' + esc(d.lead) +
        (d.quote ? '<span class="xh-quote">“' + esc(d.quote) + '”</span>' : "") + "</p>" +
      '<p class="xh-ask">' + esc(T("Maybe ask: ", "Quizás pregunta: ")) + "“" + esc(d.ask) + "”</p>" +
      '<p class="xh-nopress">' + esc(d.soft) + "</p>" +
    "</div>";
  }
  function cardDate(rec) {
    try {
      var d = new Date(String((rec && rec.date) || "") + "T12:00:00");
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString(isEsNow() ? "es-MX" : "en-US", { weekday: "long", month: "long", day: "numeric" });
    } catch (e) { return ""; }
  }

  /* ══════════════════════════════════════════ THE EDUCATOR'S COPY (.30cw)
     Jimmy's requirement: a copy of the family card for records, whether or
     not the student chose to bring it home — and on his fleet the students
     can neither print nor message from their Chromebooks, so the teacher's
     printer is not a convenience, it is THE BRIDGE: the card goes home on
     paper, in a backpack.

     This stays honest because the card is a PURE RENDERING of the slip
     record the school already holds — nothing new is collected, so the done
     screen's "your teacher isn't told which one you pick" stays true. The
     choice and the tap-back reply never leave the student's device; the
     educator regenerates the card, and does not see what happened to it at
     home.

     Printing opens a DEDICATED WINDOW — the print-window law: three
     in-place repairs each proved real and insufficient. The printed page
     reuses cardRows()'s own markup with a standalone light stylesheet
     (paper has one theme), and dates itself from rec.date only. */
  function bandScoped(rec, fn) {
    bandOverride = (rec && rec.grade != null) ? String(rec.grade) : "";
    try { return fn(); } finally { bandOverride = null; }
  }
  function edNote() {
    return T(
      "Regenerated from this slip’s record. What the student typed and the rough-moment details are never on this card, and whether the family saw it stays on the student’s device.",
      "Regenerada del registro de esta salida. Lo que el estudiante escribió y los detalles del momento difícil nunca están en esta tarjeta, y si la familia la vio se queda en el dispositivo del estudiante.");
  }
  function printHead(title) {
    return "<!doctype html><html><head><meta charset=\"utf-8\"><title>" + esc(title) + "</title>" +
      "<style>" +
      "body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#231f30;max-width:540px;margin:36px auto;padding:0 22px;line-height:1.5;}" +
      ".xh-one{page-break-after:always;}" +
      ".xh-one:last-child{page-break-after:auto;}" +
      ".xh-ed{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:#6f6a82;margin:0 0 16px;}" +
      ".xh-kicker{font-size:20px;font-weight:700;margin:0 0 2px;}" +
      ".xh-date{font-size:12.5px;color:#6f6a82;margin:0 0 18px;}" +
      ".xh-row{margin:0 0 12px;}" +
      ".xh-k{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:#6f6a82;margin:0 0 2px;}" +
      ".xh-v{font-size:15.5px;margin:0;}" +
      ".xh-quote{font-size:16.5px;font-style:italic;}" +
      ".xh-adult{border-top:1px solid #d8d4e2;margin-top:18px;padding-top:13px;}" +
      ".xh-for{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:#4C3F6B;font-weight:700;margin:0 0 8px;}" +
      ".xh-lead{font-size:13.5px;margin:0 0 6px;}" +
      ".xh-lead .xh-quote{display:block;margin:4px 0 0;}" +
      ".xh-ask{font-size:15.5px;font-style:italic;margin:0 0 8px;}" +
      ".xh-nopress{font-size:12px;color:#6f6a82;margin:0;}" +
      ".xh-meta{border-top:1px solid #d8d4e2;margin-top:26px;padding-top:10px;font-size:10.5px;color:#6f6a82;line-height:1.5;}" +
      "</style></head><body>";
  }
  /* One card's printed body. MUST be called inside bandScoped(rec, …). */
  function printBody(rec, d, dateLine) {
    return '<section class="xh-one">' +
      '<p class="xh-ed">Architecture of Grace · ' +
        esc(T("Family card", "Tarjeta familiar")) + " · " + esc(codeKey(rec.studentId)) + "</p>" +
      '<p class="xh-kicker">' + esc(kickerText()) + "</p>" +
      (dateLine ? '<p class="xh-date">' + esc(dateLine) + "</p>" : "") +
      cardRows(rec) +
      adultHtml(d) +
      '<p class="xh-meta">' + esc(edNote()) + "</p>" +
    "</section>";
  }
  function printCard(docHtml) {
    var w = null;
    try { w = window.open("", "_blank", "width=680,height=820"); } catch (e) {}
    if (!w) return;
    try {
      w.document.open();
      w.document.write(docHtml + "</body></html>");
      w.document.close();
      setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 250);
    } catch (e) {}
  }
  /* The whole class in one print job — one card per page, each banded to its
     own student, so a teacher can run the stack once and hand them out at
     the door. This is the path home for a room full of Chromebooks that
     cannot print and cannot message. */
  function printMany(recs) {
    recs = (recs || []).filter(Boolean);
    if (!recs.length) return;
    var doc = printHead(T("Family cards", "Tarjetas familiares"));
    recs.forEach(function (rec) {
      bandScoped(rec, function () {
        doc += printBody(rec, doorway(rec), cardDate(rec));
      });
    });
    printCard(doc);
  }
  function educatorCard(rec) {
    if (!rec) return;
    injectCss();
    closeCard();
    bandScoped(rec, function () {
      var d = doorway(rec);
      var dateLine = cardDate(rec);
      var pHtml = printHead(T("Family card", "Tarjeta familiar") + " · " + codeKey(rec.studentId) + " · " + (rec.date || "")) +
                  printBody(rec, d, dateLine);
      var veil = document.createElement("div");
      veil.className = "xh-veil";
      veil.id = "xhVeil";
      veil.innerHTML =
        '<div class="xh-card" role="dialog" aria-modal="true" aria-label="' +
          esc(T("Family card", "Tarjeta familiar")) + '">' +
          '<button type="button" class="xh-x" id="xhClose" aria-label="' + esc(T("Close", "Cerrar")) + '">×</button>' +
          '<p class="xh-ed">' + esc(T("Educator copy", "Copia del docente")) + " · " + esc(codeKey(rec.studentId)) + "</p>" +
          '<p class="xh-kicker">' + esc(kickerText()) + "</p>" +
          (dateLine ? '<p class="xh-date">' + esc(dateLine) + "</p>" : "") +
          cardRows(rec) +
          adultHtml(d) +
          '<div class="xh-acts">' +
            '<button type="button" class="xh-go" id="xhPrint">' + esc(T("Print — it goes home on paper", "Imprimir — va a casa en papel")) + "</button>" +
            '<button type="button" class="xh-quiet" id="xhEdClose">' + esc(T("Close", "Cerrar")) + "</button>" +
          "</div>" +
          '<p class="xh-priv">' + esc(edNote()) + "</p>" +
        "</div>";
      document.body.appendChild(veil);
      veil.addEventListener("click", function (ev) { if (ev.target === veil) closeCard(); });
      document.addEventListener("keydown", escClose);
      var x = el("xhClose"); if (x) x.addEventListener("click", closeCard);
      var c2 = el("xhEdClose"); if (c2) c2.addEventListener("click", closeCard);
      var pr = el("xhPrint");
      if (pr) pr.addEventListener("click", function () { printCard(pHtml); });
    });
  }
  /* The Family-card buttons the two teacher views emit. The attribute is
     sid|date|timestamp; sid is teacher-authored and COULD contain a pipe,
     so parse from the right, where date and timestamp cannot. */
  function findRec(attr) {
    try {
      var li = attr.lastIndexOf("|");
      var ts = attr.slice(li + 1);
      var rest = attr.slice(0, li);
      var di = rest.lastIndexOf("|");
      var date = rest.slice(di + 1);
      var sid = rest.slice(0, di);
      var all = (window.AOGExitSlip && AOGExitSlip.all) ? AOGExitSlip.all() : null;
      var arr = ((all && all.logs && all.logs[codeKey(sid)]) || {})[date] || [];
      for (var i = 0; i < arr.length; i++) if (ts && arr[i].timestamp === ts) return arr[i];
      return arr[arr.length - 1] || null;
    } catch (e) { return null; }
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("[data-xh-fam]") : null;
    if (!b) return;
    var rec = findRec(String(b.getAttribute("data-xh-fam") || ""));
    if (rec) educatorCard(rec);
  });
  /* Eager, not lazy: the teacher views paint .xh-fambtn before anything
     student-side has run, and an unstyled button reads as a bug. */
  injectCss();

  window.AOGExitHome = {
    offer: offer,
    educatorCard: educatorCard,
    printMany: printMany,
    openCard: openCard,
    band: homeBand,
    doorway: doorway,
    shareText: shareText,
    KEY: HKEY,
    /* test seams */
    __entry: entry,
    __patch: patchEntry
  };
})();
