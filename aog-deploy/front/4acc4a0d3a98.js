
/* ============================================================ TODAY'S CARRY
   Jimmy, 2026-08-26: "Based on the results can we give them one or two things
   to carry with them throughout the next moment(s) of the day?"

   Two things, never three. ONE MOVE — a thing to do in the next twenty minutes
   — and ONE LINE to carry. Both are chosen from what the student actually
   said, and the card names the answer it came from, so it reads as earned
   rather than as a fortune cookie.

   Three rules this must keep:

     1 · THEIR OWN CHOICE WINS. Question 7 already asks "one thing you can do
         to help yourself today." If they answered it, that IS the move — we
         mirror it back with a concrete how, we do not overrule it, and if they
         typed their own words we print their words, never a rewrite.
     2 · NOTHING IS SCORED, NOTHING IS DIAGNOSED. No bands, no "you seem", no
         advice about who they are. A move and a line.
     3 · A ROUGH MORNING IS NOT ANSWERED WITH CHEER. When somebody asked to
         talk, or wrote something for an adult, the line goes grounding and
         points at a person. The existing gold callout above it still says go
         find an adult now; this must not compete with it.

   The decision table is pure and lives in the AOG-CARRY-PURE region, extracted
   verbatim by AoG-Carry.harness.mjs. Spanish for a student's own answers is
   NOT duplicated here — the check-in layer owns those lists and publishes
   AOGCheckinTr(); copying them would be one more copy of a list this codebase
   has already been bitten by. */
(function () {
  "use strict";

  /* ==== AOG-CARRY-PURE-START (dependency-free — extracted verbatim by AoG-Carry.harness.mjs) ==== */

  /* The five practiced moves of the framework, plus the three plain ones the
     check-in's own Q7 offers. Each carries rotating hows so day 40 does not
     read like day 1 — the rotation is by DATE, so the same student on the same
     morning always gets the same card, on any device. */
  var CARRY_MOVES = {
    pause: { en: "The Pause", es: "La Pausa", domEn: "Regulation", domEs: "Regulación", how: [
      { en: "Before you answer the next thing that gets to you, take three slow breaths and be three seconds late on purpose.",
        es: "Antes de responder a lo próximo que te moleste, respira hondo tres veces y llega tres segundos tarde a propósito." },
      { en: "When your chest goes tight today, put both feet flat on the floor and let one breath out longer than you took it in.",
        es: "Cuando sientas el pecho apretado hoy, apoya los dos pies en el suelo y suelta el aire más lento de lo que lo tomaste." },
      { en: "One pause today, on purpose, before you react to anything. Just one. That is the whole assignment.",
        es: "Una pausa hoy, a propósito, antes de reaccionar a algo. Solo una. Esa es toda la tarea." }
    ] },
    coach: { en: "The Coach Voice", es: "La Voz del Entrenador", domEn: "Self-compassion", domEs: "Autocompasión", how: [
      { en: "The next time you catch yourself thinking something you would never say to a friend, say the friend version instead.",
        es: "La próxima vez que te descubras pensando algo que nunca le dirías a un amigo, dilo como se lo dirías a un amigo." },
      { en: "When you mess something up today, try “that was hard” before you try “I am so stupid.” Same moment, different coach.",
        es: "Cuando te equivoques hoy, prueba con «eso fue difícil» antes de «qué tonto/a soy». El mismo momento, otro entrenador." },
      { en: "Say one true good thing about your own effort today, even if the result was not great.",
        es: "Di una cosa buena y verdadera sobre tu propio esfuerzo hoy, aunque el resultado no haya sido genial." }
    ] },
    charitable: { en: "The Charitable Read", es: "La Lectura Caritativa", domEn: "Grace toward others", domEs: "Gracia hacia los demás", how: [
      { en: "One person is going to annoy you today. Think of three reasons it might not be about you before you decide.",
        es: "Hoy alguien te va a molestar. Piensa en tres razones por las que quizá no sea sobre ti antes de decidir." },
      { en: "Somebody near you is having a harder morning than you are. Find them and make it two degrees easier.",
        es: "Alguien cerca de ti tiene una mañana más difícil que la tuya. Encuéntralo/a y hazla dos grados más fácil." },
      { en: "Give one person the benefit of the doubt today, out loud if you can.",
        es: "Dale a una persona el beneficio de la duda hoy, en voz alta si puedes." }
    ] },
    repair: { en: "The Repair Move", es: "El Acto de Reparación", domEn: "Repair", domEs: "Reparación", how: [
      { en: "One repair today, and it can be eleven words: “Hey — yesterday was on me. I am sorry.”",
        es: "Una reparación hoy, y puede ser de once palabras: «Oye, lo de ayer fue mi culpa. Lo siento»." },
      { en: "Go first. Do not wait for them to bring it up — the person who goes first is the one who ends it.",
        es: "Ve primero. No esperes a que lo saquen ellos — quien va primero es quien lo termina." },
      { en: "Name the thing, not the excuse. “I did X” lands. “I only did X because…” does not.",
        es: "Nombra lo que pasó, no la excusa. «Hice X» aterriza. «Solo hice X porque…» no." }
    ] },
    release: { en: "The Release", es: "El Soltar", domEn: "Boundary", domEs: "Límite", how: [
      { en: "Pick one thing you are carrying that is not yours to fix, and put it down until 3:00.",
        es: "Elige una cosa que cargas y que no te toca arreglar, y déjala en el suelo hasta las 3:00." },
      { en: "You are allowed to say “I cannot get into this right now” to one person today, kindly.",
        es: "Hoy puedes decirle a una persona, con amabilidad: «ahora mismo no puedo con esto»." },
      { en: "Give yourself somewhere to put it: write the thing on paper, fold it, pocket it, come back to it later.",
        es: "Dale un lugar: escribe eso en un papel, dóblalo, guárdalo y vuelve a él más tarde." }
    ] },
    ask: { en: "Ask one person", es: "Pídeselo a una persona", domEn: "Asking for support", domEs: "Pedir apoyo", how: [
      { en: "Name the adult before lunch. Not “someone” — a name, and a time you will catch them.",
        es: "Elige al adulto antes del almuerzo. No «alguien» — un nombre y un momento para encontrarlo/a." },
      { en: "You do not need a speech. “Do you have two minutes?” is the whole thing.",
        es: "No necesitas un discurso. «¿Tienes dos minutos?» es todo." },
      { en: "Ask one person for one specific thing today. Specific is easier to say yes to.",
        es: "Pídele a una persona una cosa concreta hoy. A lo concreto es más fácil decir que sí." }
    ] },
    start: { en: "Start it small", es: "Empieza en pequeño", domEn: "Getting started", domEs: "Empezar", how: [
      { en: "Two minutes on the hard thing. Set a timer. You are allowed to stop when it goes off — you usually will not.",
        es: "Dos minutos en lo difícil. Pon un temporizador. Puedes parar cuando suene — casi nunca vas a querer." },
      { en: "Do the first line only. Not the assignment — the first line. Then look again.",
        es: "Haz solo la primera línea. No la tarea entera — la primera línea. Después vuelve a mirar." },
      { en: "Start with the easiest piece of the hardest thing. Momentum is not the same as motivation.",
        es: "Empieza por la parte más fácil de lo más difícil. El impulso no es lo mismo que la motivación." }
    ] },
    rest: { en: "Take a real break", es: "Toma un descanso de verdad", domEn: "Reset", domEs: "Reinicio", how: [
      { en: "One real break today — water, a walk to the far bathroom, a window. Not a screen.",
        es: "Un descanso de verdad hoy — agua, caminar al baño más lejano, una ventana. No una pantalla." },
      { en: "Move something for sixty seconds between classes. A tired brain is a body problem first.",
        es: "Mueve algo durante sesenta segundos entre clases. Un cerebro cansado es primero un asunto del cuerpo." },
      { en: "Take the break before you have earned it. That is what makes it a break and not a collapse.",
        es: "Toma el descanso antes de «merecerlo». Eso es lo que lo hace un descanso y no un derrumbe." }
    ] },
    own: { en: "Your own move", es: "Tu propio plan", domEn: "Your words", domEs: "Tus palabras", how: [
      { en: "Do it in the first ten minutes, before the day talks you out of it.",
        es: "Hazlo en los primeros diez minutos, antes de que el día te convenza de no hacerlo." },
      { en: "You already named it. Pick the exact moment you will do it, and it happens.",
        es: "Ya lo nombraste. Elige el momento exacto en que lo harás, y sucede." },
      { en: "Small and real beats big and someday. Yours is small and real.",
        es: "Pequeño y real le gana a grande y algún día. El tuyo es pequeño y real." }
    ] }
  };

  /* Q7 — the student's own choice. Nothing here overrules it. */
  var CARRY_AGENCY = {
    "Use the Pause": "pause",
    "Use my Coach Voice": "coach",
    "Ask for help": "ask",
    "Make a repair": "repair",
    "Start the hard thing first": "start",
    "Take a real break": "rest"
  };
  /* Q3 — what they said they need, when Q7 was skipped. */
  var CARRY_NEED = {
    "A quiet minute": "pause",
    "Someone to listen": "ask",
    "A second chance": "repair",
    "To move": "rest",
    "Help getting started": "start",
    "Some space": "release",
    /* §16's additions, 2026-08-27. An option with no entry here is not a
       bug — it falls through to the next signal, which is what "I’m okay"
       and "I’m not sure" should do. Only map a need that genuinely points
       at one move. */
    "A break": "rest",
    "Help": "ask",
    "More time": "start",
    "Clearer directions": "ask",
    "Encouragement": "coach"
  };
  /* Q5 — what is making today harder, when Q3 was skipped or said nothing. */
  var CARRY_CHALLENGE = {
    "Sleep": "rest",
    "Something at home": "release",
    "Something with friends": "charitable",
    "Schoolwork": "start",
    "What's in my head": "pause",
    /* §16's additions, 2026-08-27. */
    "I’m confused": "ask",
    "I’m having trouble": "ask",
    "I’m stuck": "start",
    "I made a mistake": "repair",
    "I’m distracted": "pause",
    "I’m overwhelmed": "pause",
    "I’m worried": "pause",
    "Something happened": "release"
  };
  /* Q2 — what they noticed inside. Last resort before arrival alone. */
  var CARRY_FEEL = {
    "Angry": "pause", "Frustrated": "pause", "Wired": "pause", "Worried": "pause", "Numb": "pause",
    "Embarrassed": "coach", "Sad": "coach",
    "Lonely": "ask",
    "Tired": "rest",
    "Calm": "charitable", "Focused": "charitable", "Hopeful": "charitable", "Proud": "charitable", "Excited": "charitable",
    /* §16's additions, 2026-08-27. */
    "Overwhelmed": "pause",
    "Good": "charitable", "Confident": "charitable", "Happy": "charitable"
  };

  var CARRY_LINES = {
    /* asked to talk, or wrote something for an adult — points at a person */
    urgent: [
      { en: "You told the truth on a hard morning. Now let one person hear it out loud.",
        es: "Dijiste la verdad en una mañana difícil. Ahora deja que una persona la escuche en voz alta.", pEn: "Grace", pEs: "Gracia" },
      { en: "You do not have to carry this by yourself. The next step is a person, not a plan.",
        es: "No tienes que cargar esto solo/a. El siguiente paso es una persona, no un plan.", pEn: "Grace", pEs: "Gracia" }
    ],
    rough: [
      { en: "Rough is a real answer, and you gave it. That took something.",
        es: "«Difícil» es una respuesta real, y la diste. Eso costó algo.", pEn: "Self-compassion", pEs: "Autocompasión" },
      { en: "You do not have to fix the whole morning. The next hour is the only part you have to do right now.",
        es: "No tienes que arreglar toda la mañana. La próxima hora es lo único que tienes que hacer ahora.", pEn: "Self-compassion", pEs: "Autocompasión" }
    ],
    hard: [
      { en: "A hard start is not the whole day.",
        es: "Un comienzo difícil no es todo el día.", pEn: "Self-compassion", pEs: "Autocompasión" },
      { en: "You are allowed to arrive heavy and still be okay by sixth period.",
        es: "Puedes llegar pesado/a y aun así estar bien para la sexta hora.", pEn: "Self-compassion", pEs: "Autocompasión" }
    ],
    alone: [
      { en: "You do not have to be known by everybody. One person is enough for today.",
        es: "No tienes que ser conocido/a por todos. Una persona basta por hoy.", pEn: "Identity", pEs: "Identidad" },
      { en: "Feeling on the outside of a room is not proof that you do not belong in it.",
        es: "Sentirte fuera de un lugar no prueba que no pertenezcas a él.", pEn: "Identity", pEs: "Identidad" }
    ],
    kind: [
      { en: "Talk to yourself the way you would talk to your best friend having this exact day.",
        es: "Háblate como le hablarías a tu mejor amigo/a en este mismo día.", pEn: "Self-compassion", pEs: "Autocompasión" },
      { en: "One bad moment is an event. It is not a description of you.",
        es: "Un mal momento es un suceso. No es una descripción de quién eres.", pEn: "Identity", pEs: "Identidad" }
    ],
    heat: [
      { en: "The first thought is not the verdict.",
        es: "El primer pensamiento no es el veredicto.", pEn: "Forgiveness", pEs: "Perdón" },
      { en: "Three maybes before you decide what somebody meant.",
        es: "Tres «tal vez» antes de decidir qué quiso decir alguien.", pEn: "Forgiveness", pEs: "Perdón" }
    ],
    okay: [
      { en: "Okay is a real answer. Not every day has to be a good one.",
        es: "«Más o menos» es una respuesta real. No todos los días tienen que ser buenos.", pEn: "Identity", pEs: "Identidad" },
      { en: "Steady is underrated. Most of a life gets built on ordinary days.",
        es: "Lo estable está subestimado. Casi toda una vida se construye en días comunes.", pEn: "Identity", pEs: "Identidad" }
    ],
    good: [
      { en: "Good mornings are worth noticing too — that is how you learn what one feels like.",
        es: "Las buenas mañanas también vale la pena notarlas — así aprendes cómo se siente una.", pEn: "Identity", pEs: "Identidad" },
      { en: "You have some to spare today. Spend it on somebody.",
        es: "Hoy te sobra un poco. Gástalo en alguien.", pEn: "Grace", pEs: "Gracia" }
    ],
    base: [
      { en: "Small counts.", es: "Lo pequeño cuenta.", pEn: "Grace", pEs: "Gracia" },
      { en: "You showed up and told the truth. Start there.",
        es: "Viniste y dijiste la verdad. Empieza por ahí.", pEn: "Grace", pEs: "Gracia" }
    ]
  };

  /* Day number from an ISO date, so the rotation is identical on every device
     a student might open and never depends on the clock at render time. */
  function carryDayIndex(iso) {
    var p = String(iso || "").split("-");
    if (p.length < 3) return 0;
    var y = +p[0], m = +p[1], d = +p[2];
    if (!isFinite(y) || !isFinite(m) || !isFinite(d)) return 0;
    return Math.round(Date.UTC(y, m - 1, d) / 86400000);
  }
  function carryPick(list, dayIx) {
    if (!list || !list.length) return null;
    return list[Math.abs(dayIx | 0) % list.length];
  }
  /* Stored answers are comma-joined ENGLISH labels, and the free-text half of a
     chip step rides after " · ". carryChip is the chip; carryText their words. */
  function carryChip(v) {
    var first = String(v == null ? "" : v).split(",")[0] || "";
    return first.split("·")[0].trim();
  }
  function carryText(v) {
    var parts = String(v == null ? "" : v).split("·");
    return parts.length > 1 ? parts.slice(1).join("·").trim() : "";
  }
  function carryList(v) {
    return String(v == null ? "" : v).split(",")
      .map(function (s) { return s.split("·")[0].trim(); }).filter(Boolean);
  }

  function carryMoveFor(rec) {
    rec = rec || {};
    var ag = carryChip(rec.agency), agText = carryText(rec.agency);
    if (ag && CARRY_AGENCY[ag]) return { k: CARRY_AGENCY[ag], why: { k: "chose", v: ag } };
    if (agText) return { k: "own", text: agText, why: { k: "own", v: agText } };
    var nd = carryChip(rec.need);
    if (nd && CARRY_NEED[nd]) return { k: CARRY_NEED[nd], why: { k: "need", v: nd } };
    var ch = carryChip(rec.challenge);
    if (ch && CARRY_CHALLENGE[ch]) return { k: CARRY_CHALLENGE[ch], why: { k: "challenge", v: ch } };
    var feels = carryList(rec.feelingWords);
    for (var i = 0; i < feels.length; i++) {
      if (CARRY_FEEL[feels[i]]) return { k: CARRY_FEEL[feels[i]], why: { k: "feel", v: feels[i] } };
    }
    var a = +rec.arrival;
    if (isFinite(a) && a >= 4) return { k: "charitable", why: { k: "arrival", v: String(a) } };
    return { k: "pause", why: { k: "arrival", v: isFinite(a) ? String(a) : "" } };
  }

  function carryLineKey(rec) {
    rec = rec || {};
    if (!!rec.followUp || !!rec.talk || String(rec.tellAdult || "").trim().length > 0) return "urgent";
    var a = +rec.arrival, c = +rec.connection;
    var feels = carryList(rec.feelingWords);
    function has(w) { return feels.indexOf(w) !== -1; }
    if (a === 1) return "rough";
    if (a === 2) return "hard";
    if (isFinite(c) && c > 0 && c <= 2) return "alone";
    if (has("Embarrassed") || has("Sad")) return "kind";
    if (has("Angry") || has("Frustrated")) return "heat";
    if (a === 3) return "okay";
    if (a >= 4) return "good";
    return "base";
  }

  function aogCarryFor(rec, dayIx) {
    rec = rec || {};
    if (dayIx == null) dayIx = carryDayIndex(rec.date);
    var mv = carryMoveFor(rec);
    var move = CARRY_MOVES[mv.k] || CARRY_MOVES.pause;
    var lk = carryLineKey(rec);
    return {
      moveKey: mv.k,
      move: move,
      ownText: mv.text || "",
      how: carryPick(move.how, dayIx),
      why: mv.why,
      lineKey: lk,
      line: carryPick(CARRY_LINES[lk] || CARRY_LINES.base, dayIx),
      urgent: lk === "urgent"
    };
  }
  /* ==== AOG-CARRY-PURE-END ==== */

  function ES() {
    try { if (typeof dashLang !== "undefined" && dashLang === "es") return true; } catch (e) {}
    try { if (typeof lang !== "undefined" && lang === "es") return true; } catch (e) {}
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) {}
    return false;
  }
  function T(en, es) { return ES() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  /* A student's own answer is stored in English. The check-in layer owns those
     word lists and publishes the lookup; we do not keep a second copy. */
  function tr(en) {
    try { if (typeof window.AOGCheckinTr === "function") return window.AOGCheckinTr(en); } catch (e) {}
    return en;
  }
  function moveTitle(c) {
    if (!c) return "";
    if (c.moveKey === "own" && c.ownText) return c.ownText;
    return T(c.move.en, c.move.es);
  }
  function whyLine(c) {
    var w = (c && c.why) || {};
    if (w.k === "chose") return T("Because you chose it.", "Porque tú lo elegiste.");
    if (w.k === "own")   return T("In your own words.", "En tus propias palabras.");
    if (w.k === "need")  return T("Because you said you need: ", "Porque dijiste que necesitas: ") + tr(w.v);
    if (w.k === "challenge") return T("Because you said this is making today harder: ",
                                      "Porque dijiste que esto hace hoy más difícil: ") + tr(w.v);
    if (w.k === "feel")  return T("From what you noticed inside: ", "Por lo que notaste por dentro: ") + tr(w.v);
    return T("From how you said you are arriving.", "Por cómo dijiste que estás llegando.");
  }

  function injectCss() {
    if (document.getElementById("aog-carry-css")) return;
    var s = document.createElement("style");
    s.id = "aog-carry-css";
    s.textContent = [
      ".cy-wrap{max-width:430px;margin:26px auto 4px;text-align:left;}",
      ".cy-h{font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);text-align:center;margin:0 0 12px;}",
      ".cy-card{background:#FBF8F1;border:1px solid #E4DAC5;border-left:4px solid var(--gold,#D9A33B);border-radius:12px;padding:15px 17px;margin:0 0 11px;}",
      ".cy-k{font-size:9.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#5b6675;margin:0 0 5px;}",
      ".cy-t{font-family:var(--font-serif,Georgia,serif);font-size:20px;font-weight:600;line-height:1.25;color:#0A1E33;margin:0 0 6px;}",
      ".cy-how{font-size:15px;line-height:1.55;color:#22303F;margin:0 0 8px;}",
      ".cy-why{font-size:12px;line-height:1.45;color:#5b6675;margin:0;font-style:italic;}",
      ".cy-q{font-family:var(--font-serif,Georgia,serif);font-size:19px;line-height:1.4;color:#0A1E33;margin:0 0 8px;}",
      ".cy-p{display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#8a6320;background:rgba(217,163,59,.16);border:1px solid #B8893A;border-radius:999px;padding:2px 10px;}",
      ".cy-card.cy-urgent{border-left-color:var(--red,#8B2A2A);}",
      /* .sc-nav is a three-slot grid so Next never moves between questions.
         These two rows are not that row — they are a row of equals. */
      ".sc-nav.cy-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}",
      /* --navy is not remapped for dark mode; --ink is, and in light the two
         are the same color. This button sits OUTSIDE the pinned-light card. */
      ".cy-slip{font:inherit;font-size:14px;font-weight:700;color:var(--ink,#22303F);background:transparent;border:1.5px solid var(--rule,#E4DAC5);border-radius:999px;padding:11px 20px;cursor:pointer;}",
      ".cy-slip:hover{border-color:var(--gold,#D9A33B);}",
      ".sl-tag.cy{color:var(--gold-deep,#9a6f24);background:rgba(217,163,59,.10);border:1px solid var(--rule,#E4DAC5);}",
      "@media print{.cy-card{break-inside:avoid;}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function cardHtml(c) {
    if (!c || !c.how || !c.line) return "";
    injectCss();
    return '<div class="cy-wrap">' +
      '<div class="cy-h">' + esc(T("Carry this", "Llévate esto")) + "</div>" +
      '<div class="cy-card' + (c.urgent ? " cy-urgent" : "") + '">' +
        '<div class="cy-k">' + esc(T("Your move", "Tu movimiento")) + "</div>" +
        '<div class="cy-t">' + esc(moveTitle(c)) + "</div>" +
        '<div class="cy-how">' + esc(T(c.how.en, c.how.es)) + "</div>" +
        '<div class="cy-why">' + esc(whyLine(c)) + "</div>" +
      "</div>" +
      '<div class="cy-card">' +
        '<div class="cy-k">' + esc(T("Your line", "Tu frase")) + "</div>" +
        '<div class="cy-q">&ldquo;' + esc(T(c.line.en, c.line.es)) + '&rdquo;</div>' +
        '<span class="cy-p">' + esc(T(c.line.pEn, c.line.pEs)) + "</span>" +
      "</div>" +
    "</div>";
  }

  /* A slip to fold and pocket. No name, no student code, no answers — just the
     move and the line, so it can sit face-up on a desk. No timer around
     print(): see the iOS print rule. */
  function printSlip(c) {
    if (!c || !c.how || !c.line) return;
    var w = window.open("", "_blank", "width=560,height=520");
    if (!w) return;
    var doc = '<!doctype html><html lang="' + (ES() ? "es" : "en") + '"><head><meta charset="utf-8">' +
      "<title>" + esc(T("Carry this", "Llévate esto")) + "</title><style>" +
      "*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}" +
      "body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:0;padding:34px;}" +
      ".slip{width:4.6in;border:2px dashed #B8893A;border-radius:14px;padding:24px 26px;margin:0 auto 26px;}" +
      ".k{font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#9a6f24;margin:0 0 9px;}" +
      ".t{font-family:Georgia,serif;font-size:22px;font-weight:700;line-height:1.2;margin:0 0 7px;}" +
      ".h{font-size:13.5px;line-height:1.5;color:#22303F;margin:0 0 16px;}" +
      ".q{font-family:Georgia,serif;font-size:16px;line-height:1.4;color:#0A1E33;border-top:1px solid #E4DAC5;padding-top:13px;margin:0 0 7px;}" +
      ".p{font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#9a6f24;}" +
      ".ft{font-size:9.5px;color:#8A92A6;text-align:center;margin:0;}" +
      ".np{text-align:center;margin:22px 0 0;}" +
      "@media print{body{padding:.4in;}.np{display:none;}}" +
      "</style></head><body>" +
      '<div class="slip">' +
        '<p class="k">' + esc(T("Carry this today", "Llévate esto hoy")) + "</p>" +
        '<p class="t">' + esc(moveTitle(c)) + "</p>" +
        '<p class="h">' + esc(T(c.how.en, c.how.es)) + "</p>" +
        '<p class="q">&ldquo;' + esc(T(c.line.en, c.line.es)) + '&rdquo;</p>' +
        '<p class="p">' + esc(T(c.line.pEn, c.line.pEs)) + "</p>" +
      "</div>" +
      '<p class="ft">Architecture of Grace</p>' +
      '<p class="np"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">' +
        esc(T("Print", "Imprimir")) + "</button></p>" +
      "</body></html>";
    w.document.open(); w.document.write(doc); w.document.close(); w.focus();
    try { w.print(); } catch (e) {}
  }

  window.AOGCarry = {
    "for": aogCarryFor,
    cardHtml: cardHtml,
    printSlip: printSlip,
    moveTitle: moveTitle,
    dayIndex: carryDayIndex,
    injectCss: injectCss
  };
})();
