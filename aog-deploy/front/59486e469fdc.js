
/* =========================================================================
   THE SCHOOL-DAY EXIT SLIP  ·  built 2026-08-27 from Jimmy's world-elite
   product handoff. Grades 6-8, a junior high.

   ⚠ THIS IS NOT A SECOND CHECK-IN. The 10th Period Daily Check-In asks
   "How am I doing right now?" and is answered in the morning. This asks
   "What was my day?" and is answered on the way out. They are stored
   separately, they sync to separate tabs, and they must never be merged
   into one score. A student can arrive at a 2 and leave a day that had a
   good moment in it; averaging those two is how both facts disappear.

   ⚠ CHOICE-FIRST IS THE WHOLE PRODUCT (handoff §02, §16, §31). A student
   must be able to finish this without typing a single character. There is
   no long-answer question anywhere in the core flow, no screen requires a
   selection to leave, and no selection ever has to be explained. If a
   future change adds a required text field, it has broken the feature.

   ⚠ NEVER SHAME A CHOICE (§12). "I gave up" is a complete, useful answer.
   Nothing here corrects, ranks, scores or reframes what a student picked.

   Structure: GOOD -> HARD -> GOOD (§19). Never called a positive sandwich
   in the interface; the student just sees Look back, Notice the hard part,
   Close the day.
   ========================================================================= */
(function () {
  "use strict";

  /* ------------------------------------------------------------- basics */
  var XKEY   = "aog.exit.v1";           /* the slips themselves */
  var XQ     = "aog.exit.queue";        /* rows that have not reached the Sheet */
  var XSCHED = "aog.exit.sched.v1";     /* a code's remembered class list */

  function T(en, es) {
    try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function todayISO() {
    var d = new Date(), m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function clockNow() {
    var d = new Date(), h = d.getHours(), mi = d.getMinutes();
    var ap = h < 12 ? "AM" : "PM", hh = h % 12; if (!hh) hh = 12;
    return hh + ":" + (mi < 10 ? "0" + mi : mi) + " " + ap;
  }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function jsave(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function ss(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function isEs() {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
    catch (e) { return false; }
  }
  function uniq(a) {
    var seen = {}, out = [];
    (a || []).forEach(function (x) { var k = String(x); if (x && !seen[k]) { seen[k] = 1; out.push(x); } });
    return out;
  }
  function codeKey(s) { return String(s == null ? "" : s).trim().toUpperCase(); }

  /* The sync destination — asked of the same resolver everything else asks,
     so a narrowed school list applies here too. Same lesson the check-in
     learned when it read window.AOG_SYNC_DEFAULTS.url straight off the
     object and posted where a reflection would not. */
  function destination() {
    var url = "", key = "";
    try { if (typeof SCHOOL_SYNC_URL !== "undefined") { url = SCHOOL_SYNC_URL || ""; key = SCHOOL_SYNC_KEY || ""; } } catch (e) {}
    if (!url) {
      var d = null;
      try { d = (typeof aogResolveDestination_ === "function") ? aogResolveDestination_() : null; } catch (e) {}
      if (d) { url = d.url || ""; key = d.key || ""; }
    }
    return { url: url, key: key };
  }
  function anAdultWillSeeThis() {
    try { if (typeof syncDestinationConfigured === "function") return !!syncDestinationConfigured(); } catch (e) {}
    return !!destination().url;
  }

  /* ===================================================================
     §05 · THE JUNIOR-HIGH SUBJECT ARCHITECTURE

     ⚠ THIS IS THE FALLBACK, NOT THE STUDENT'S VISIBLE LIST (§05, last
     paragraph). It is what the one-time picker offers when no schedule
     is known. Where a schedule IS known it drives the screen and this
     list is never seen. Do not hard-code it into the class questions.
     =================================================================== */
  var SUBJECTS = [
    { g: "core",   en: "English / Language Arts",  es: "Inglés / Lengua y Literatura" },
    { g: "core",   en: "Math",                     es: "Matemáticas" },
    { g: "core",   en: "Science",                  es: "Ciencias" },
    { g: "core",   en: "Social Studies",           es: "Estudios Sociales" },
    { g: "encore", en: "Art",                      es: "Arte" },
    { g: "encore", en: "Physical Education",       es: "Educación Física" },
    { g: "encore", en: "Health",                   es: "Salud" },
    { g: "encore", en: "Spanish",                  es: "Español" },
    { g: "encore", en: "Technology",               es: "Tecnología" },
    { g: "encore", en: "Foods / Family & Consumer", es: "Cocina / Familia y Consumo" },
    { g: "encore", en: "Band",                     es: "Banda" },
    { g: "encore", en: "Choir / Vocal Music",      es: "Coro / Música Vocal" },
    { g: "encore", en: "Advisory",                 es: "Asesoría" },
    { g: "encore", en: "Other Encore / Elective",  es: "Otra materia optativa" },

    /* ⚠ SUPPORT PERIODS ARE THEIR OWN GROUP, NOT ELECTIVES. Jimmy, 2026-08-28,
       looking at the picker beside his own Google Classroom list: "A resource
       period should be included as well." He teaches LR7 Learning Resource 7
       and SK6 Study Skills — real periods on a real junior-high schedule, and until now
       a student in either had to call them "Other Encore / Elective", which is
       the one thing they are not. A student does not CHOOSE resource, so filing
       it under electives asks them to mis-describe their own day on the screen
       that exists to let them describe it accurately.

       ⚠ THE LABEL IS "LEARNING RESOURCE", NOT "RESOURCE" AND NOT A SLASHED
       PAIR. It shipped for ten minutes as "Resource / Learning Resource" on the
       guess that the building used both names; Jimmy, asked which word to use,
       answered "Learning resource". THE BUILDING'S OWN WORD WINS OVER A TIDY
       GUESS -- a student reads this chip looking for the name on their own
       schedule, and a name they have to translate is a name they may skip. */
    { g: "support", en: "Learning Resource",             es: "Clase de Recursos" },
    { g: "support", en: "Study Skills",                 es: "Destrezas de Estudio" }
  ];
  var SUBJ_ES = {};
  SUBJECTS.forEach(function (s) { SUBJ_ES[s.en] = s.es; });
  /* A record always stores the ENGLISH label. Anything that has to show a
     stored label back to a Spanish reader asks here rather than keeping a
     second copy of the list. */
  function trSubject(en) { return SUBJ_ES[en] ? T(en, SUBJ_ES[en]) : en; }

  /* ===================================================================
     §04 · WHERE THE SCHEDULE COMES FROM — three tiers, in this order

     1 · THE TEACHER'S OWN CLASSES (window.AOGPop). Truth if it exists.
     2 · THE LINK (?sched=ELA|Math|Science). Zero student setup.
     3 · REMEMBERED AGAINST THE CODE. The student picked once, ever.

     ⚠ TIER 1 NEEDS THREE COURSES OR IT IS NOT A SCHEDULE. A code
     usually belongs to exactly ONE class on a teacher's device — their
     own. Handing "Which class did you enjoy most today?" a list of one
     is worse than handing it nothing, so a population lookup that finds
     fewer than three distinct courses falls through to the next tier.
     =================================================================== */
  var SCHED_MIN = 3;

  function popSchedule(sid) {
    var want = codeKey(sid);
    if (!want) return null;
    try {
      var cls = (window.AOGPop && typeof window.AOGPop.classes === "function") ? (window.AOGPop.classes() || []) : [];
      var mine = cls.filter(function (c) {
        return (c && c.members || []).some(function (m) { return codeKey(m) === want; });
      });
      mine.sort(function (a, b) {
        var pa = parseInt(String(a.period).replace(/\D/g, ""), 10);
        var pb = parseInt(String(b.period).replace(/\D/g, ""), 10);
        if (isNaN(pa)) pa = 99; if (isNaN(pb)) pb = 99;
        return pa - pb;
      });
      var courses = uniq(mine.map(function (c) { return String(c.course || "").trim(); }).filter(Boolean));
      return courses.length >= SCHED_MIN ? courses : null;
    } catch (e) { return null; }
  }

  function linkSchedule() {
    var raw = ss("aog.launch.sched");
    if (!raw) return null;
    var list = uniq(String(raw).split(/[|,]/).map(function (x) { return x.trim(); }).filter(Boolean)).slice(0, 12);
    return list.length >= 2 ? list : null;
  }

  function savedSchedule(sid) {
    var all = jload(XSCHED, {}) || {};
    var list = all[codeKey(sid)];
    return (list && list.length >= 2) ? list.slice() : null;
  }
  function saveSchedule(sid, list) {
    var all = jload(XSCHED, {}) || {};
    all[codeKey(sid)] = uniq(list).slice(0, 12);
    jsave(XSCHED, all);
  }
  function forgetSchedule(sid) {
    var all = jload(XSCHED, {}) || {};
    delete all[codeKey(sid)];
    jsave(XSCHED, all);
  }
  function scheduleFor(sid) {
    return popSchedule(sid) || linkSchedule() || savedSchedule(sid) || null;
  }
  function scheduleSource(sid) {
    if (popSchedule(sid)) return "classes";
    if (linkSchedule()) return "link";
    if (savedSchedule(sid)) return "student";
    return "";
  }

  /* Read ?sched= off the URL the same way the check-in reads its own keys —
     by WRAPPING parseLaunchParams, never by editing it. */
  function readSlipParams() {
    var p; try { p = new URLSearchParams(window.location.search); } catch (e) { return; }
    var s = p.get("sched") || p.get("schedule");
    if (s) ssSet("aog.launch.sched", String(s).slice(0, 240));
    var x = p.get("exit") || p.get("slip");
    if (x) ssSet("aog.launch.exitSlip", String(x).slice(0, 16).toLowerCase());
  }
  (function wrapLaunch() {
    if (typeof window.parseLaunchParams === "function" && !window.parseLaunchParams.__aogExitSlip) {
      var orig = window.parseLaunchParams;
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        try { readSlipParams(); } catch (e) {}
        return r;
      };
      wrapped.__aogExitSlip = true;
      window.parseLaunchParams = wrapped;
    }
    readSlipParams();
  })();
  function isSlipLink() {
    var v = ss("aog.launch.exitSlip");
    return v === "1" || v === "exit" || v === "on" || v === "true" || v === "yes";
  }

  /* A per-student link already fixes the code (see aog-student-links). If it
     did, the student never sees a code box on this screen either. */
  function lockedStudent() {
    try {
      if (window.AOGStudentLinks && typeof window.AOGStudentLinks.locked === "function") {
        return window.AOGStudentLinks.locked() || "";
      }
    } catch (e) {}
    try { return sessionStorage.getItem("aog.launch.sid") || ""; } catch (e) { return ""; }
  }

  /* Did this code arrive on a LINK rather than being typed? Only the link
     case is gated — see offerTodays(). */
  function linkedArrival() {
    try {
      if (window.AOGStudentLinks && typeof window.AOGStudentLinks.linked === "function") {
        return !!window.AOGStudentLinks.linked();
      }
    } catch (e) {}
    try { return !!sessionStorage.getItem("aog.launch.sid"); } catch (e) { return false; }
  }

  /* §26 · AGE ADAPTATION. The architecture is identical for all three
     grades; a handful of prompts soften for 6th and firm up for 8th. Do
     NOT branch the flow, the options or the storage on this — one product,
     three registers. */
  function gradeBand() {
    var g = "";
    try { g = ss("aog.launch.grade") || ""; } catch (e) {}
    /* .30cv — the whole K-12 span maps onto the three registers instead of
       everyone outside 6 and 8 falling into the middle one: a K-6 link gets
       the plainer wording, a 9-12 link gets the adult phrasing. Same flow,
       same options, same storage — only the words move (§26). */
    if (/^\s*k/i.test(g)) return "6";
    g = String(g).replace(/\D/g, "");
    var n = parseInt(g, 10);
    if (!isNaN(n)) {
      if (n <= 6) return "6";
      if (n >= 8) return "8";
    }
    return "7";
  }
  function W(six, seven, eight) {
    var b = gradeBand();
    return b === "6" ? six : b === "8" ? (eight || seven) : seven;
  }

  /* ===================================================================
     THE OPTION BANKS

     Every bank has two parts:

       groups[] — headed sets of real answers, revealed progressively (§17)
       escape[] — None / Not sure / Other, ALWAYS VISIBLE (§18)

     ⚠ THE ESCAPE HATCH IS NEVER BEHIND "More choices". It is the option
     a student needs when they do not want to be here, and burying it one
     tap deeper is how a screen starts feeling like a form that wants
     something from them. It renders last, in its own quiet row, on the
     first paint of every screen.

     ⚠ THE ENGLISH STRING IS THE STORED VALUE. Spanish is display only.
     =================================================================== */

  /* §07 — what made that class enjoyable */
  var FAV_WHY = {
    groups: [
      { h: ["Learning", "Aprendizaje"], o: [
        ["I understood it", "Lo entendí"],
        ["I learned something new", "Aprendí algo nuevo"],
        ["I figured something out", "Descubrí algo por mi cuenta"],
        ["I felt successful", "Me sentí capaz"],
        ["I made progress", "Avancé"],
        ["I was proud of my work", "Estuve orgulloso/a de mi trabajo"],
        ["It was easier than I expected", "Fue más fácil de lo que esperaba"]
      ] },
      { h: ["Interest", "Interés"], o: [
        ["The topic was interesting", "El tema era interesante"],
        ["It was fun", "Fue divertido"],
        ["I liked the activity", "Me gustó la actividad"],
        ["We did something different", "Hicimos algo diferente"],
        ["I got to be creative", "Pude ser creativo/a"],
        ["It made me think", "Me hizo pensar"],
        ["It connected to something I like", "Se conectó con algo que me gusta"]
      ] },
      { h: ["People", "Personas"], o: [
        ["My teacher helped me", "Mi maestro/a me ayudó"],
        ["My teacher encouraged me", "Mi maestro/a me animó"],
        ["I liked working with classmates", "Me gustó trabajar con compañeros"],
        ["Someone helped me", "Alguien me ayudó"],
        ["I got to help someone", "Pude ayudar a alguien"],
        ["I felt included", "Me sentí incluido/a"]
      ] },
      { h: ["How I felt", "Cómo me sentí"], o: [
        ["I felt confident", "Me sentí seguro/a"],
        ["I felt comfortable", "Me sentí cómodo/a"],
        ["I felt calm", "Me sentí tranquilo/a"],
        ["I felt proud", "Me sentí orgulloso/a"],
        ["I felt like I was good at something", "Sentí que soy bueno/a en algo"]
      ] }
    ],
    escape: [
      ["Something unexpected made it enjoyable", "Algo inesperado lo hizo agradable"],
      ["I just liked it today", "Simplemente me gustó hoy"],
      ["Nothing specific", "Nada en particular"]
    ]
  };

  /* §09 — what made it challenging */
  var HARD_WHY = {
    groups: [
      { h: ["The work", "El trabajo"], o: [
        ["I didn’t understand it", "No lo entendí"],
        ["It was difficult", "Fue difícil"],
        ["I needed more explanation", "Necesitaba más explicación"],
        ["I needed more practice", "Necesitaba más práctica"],
        ["I didn’t know where to start", "No sabía por dónde empezar"],
        ["The directions were confusing", "Las instrucciones eran confusas"],
        ["There was a lot to do", "Había mucho que hacer"],
        ["I ran out of time", "Se me acabó el tiempo"],
        ["I made mistakes", "Cometí errores"]
      ] },
      { h: ["Focus", "Concentración"], o: [
        ["I couldn’t concentrate", "No me pude concentrar"],
        ["I was distracted", "Estaba distraído/a"],
        ["I was tired", "Estaba cansado/a"],
        ["My mind was somewhere else", "Mi mente estaba en otra parte"],
        ["It was hard to stay motivated", "Fue difícil mantener las ganas"]
      ] },
      { h: ["Feelings", "Sentimientos"], o: [
        ["I got frustrated", "Me frustré"],
        ["I felt overwhelmed", "Me sentí abrumado/a"],
        ["I felt nervous", "Me sentí nervioso/a"],
        ["I felt embarrassed", "Me sentí avergonzado/a"],
        ["I felt discouraged", "Me sentí desanimado/a"],
        ["I wasn’t confident", "No me sentí seguro/a"]
      ] },
      { h: ["People", "Personas"], o: [
        ["Working with others was difficult", "Trabajar con otros fue difícil"],
        ["I had a disagreement", "Tuve un desacuerdo"],
        ["I felt left out", "Me sentí excluido/a"],
        ["Someone bothered me", "Alguien me molestó"],
        ["I had trouble asking for help", "Me costó pedir ayuda"]
      ] },
      { h: ["My day", "Mi día"], o: [
        ["I was already having a hard day", "Ya estaba teniendo un día difícil"],
        ["Something happened earlier", "Pasó algo más temprano"],
        ["Something outside of school was on my mind", "Tenía algo de fuera de la escuela en la cabeza"],
        ["I needed a break", "Necesitaba un descanso"],
        ["I wasn’t feeling like myself", "No me sentía como yo mismo/a"]
      ] }
    ],
    escape: [
      ["I’m not sure", "No estoy seguro/a"],
      ["I don’t know", "No sé"],
      ["Something else", "Otra cosa"]
    ]
  };

  /* §10 — a good moment */
  var GOOD = {
    groups: [
      { h: ["I felt…", "Me sentí…"], o: [
        ["Proud", "Orgulloso/a"], ["Happy", "Feliz"], ["Calm", "Tranquilo/a"],
        ["Confident", "Seguro/a"], ["Included", "Incluido/a"], ["Supported", "Apoyado/a"],
        ["Successful", "Capaz"], ["Appreciated", "Valorado/a"], ["Comfortable", "Cómodo/a"],
        ["Excited", "Emocionado/a"]
      ] },
      { h: ["Something happened…", "Pasó algo…"], o: [
        ["Someone encouraged me", "Alguien me animó"],
        ["Someone helped me", "Alguien me ayudó"],
        ["I helped someone", "Ayudé a alguien"],
        ["I understood something", "Entendí algo"],
        ["I learned something", "Aprendí algo"],
        ["I made progress", "Avancé"],
        ["I solved something", "Resolví algo"],
        ["I tried something difficult", "Intenté algo difícil"],
        ["I handled something well", "Manejé algo bien"],
        ["I had fun", "Me divertí"],
        ["Someone made me laugh", "Alguien me hizo reír"],
        ["I made someone laugh", "Hice reír a alguien"],
        ["I received a compliment", "Recibí un cumplido"],
        ["I had a good conversation", "Tuve una buena conversación"],
        ["Something made me smile", "Algo me hizo sonreír"],
        ["I made a good choice", "Tomé una buena decisión"]
      ] }
    ],
    escape: [
      ["I just had a good moment", "Simplemente tuve un buen momento"],
      ["Nothing specific", "Nada en particular"]
    ]
  };

  /* §11 — a rough moment. The gate is the loudest thing on this screen.

     ⚠ THE GATE LOST ITS 😊 (build .30cj). A smiley on "No" made "no" the
     answer that earns the happy face, on the one question where
     under-reporting matters most — §12's never-shame rule, breached from
     the other side. The words alone are the permission; the sub-line
     ("You never have to have one.") already carries the warmth.

     ⚠ THIS STRING IS A STORED VALUE. Records written before .30cj hold
     "😊 No — not really." and records after hold the bare wording, so BOTH
     variants sit in the language-bucket SKIP list and TIM_SKIP — a "no" is
     an answer, never a theme. If this wording ever moves again, move those
     four entries with it. */
  var ROUGH_GATE = ["No — not really.", "No — la verdad que no."];
  /* ⚠ §11 GIVES THESE AS ONE FLAT LIST OF TWENTY-ONE. They are grouped
     here and NOT ONE IS DROPPED — twenty-one chips in a single wall is
     exactly the "visually overwhelming student experience" §17 exists to
     prevent, and the first fold has to be seven, not twenty-one. The
     headings are the only thing added; the wording of every option is
     the handoff's own. */
  var ROUGH = {
    groups: [
      { h: ["In the moment", "En el momento"], o: [
        ["I got frustrated", "Me frustré"],
        ["I made a mistake", "Cometí un error"],
        ["I didn’t understand something", "No entendí algo"],
        ["I couldn’t concentrate", "No me pude concentrar"],
        ["I couldn’t get something to work", "No logré que algo funcionara"],
        ["I didn’t know what to do", "No sabía qué hacer"],
        ["I was tired", "Estaba cansado/a"]
      ] },
      { h: ["With people", "Con otras personas"], o: [
        ["Someone upset me", "Alguien me molestó"],
        ["I had an argument", "Tuve una discusión"],
        ["I felt left out", "Me sentí excluido/a"],
        ["Something happened with a friend", "Pasó algo con un/a amigo/a"],
        ["I had trouble asking for help", "Me costó pedir ayuda"]
      ] },
      { h: ["How I felt", "Cómo me sentí"], o: [
        ["I felt embarrassed", "Me sentí avergonzado/a"],
        ["I felt misunderstood", "Me sentí incomprendido/a"],
        ["I felt overwhelmed", "Me sentí abrumado/a"],
        ["I felt worried", "Me sentí preocupado/a"],
        ["I felt disappointed", "Me sentí decepcionado/a"],
        ["I felt discouraged", "Me sentí desanimado/a"]
      ] },
      { h: ["Looking at it now", "Viéndolo ahora"], o: [
        ["I wish I had handled it differently", "Ojalá lo hubiera manejado distinto"],
        ["Something outside school affected my day", "Algo de fuera de la escuela afectó mi día"],
        ["I just had a bad moment", "Simplemente tuve un mal momento"]
      ] }
    ],
    escape: [
      ["I’m not sure", "No estoy seguro/a"],
      ["I don’t want to say", "Prefiero no decirlo"]
    ]
  };

  /* §12 — how did I respond. ⚠ THERE IS NO CORRECT ANSWER HERE.
     "I gave up" sits in the same type, the same weight and the same color
     as "I kept trying". Nothing in this file may rank them. */
  var RESPONSE = {
    groups: [
      { h: ["What I did", "Lo que hice"], o: [
        ["I kept trying", "Seguí intentando"],
        ["I tried again", "Lo intenté otra vez"],
        ["I asked for help", "Pedí ayuda"],
        ["I took a break", "Tomé un descanso"],
        ["I talked to someone", "Hablé con alguien"],
        ["I figured it out", "Lo resolví"],
        ["I moved on", "Seguí adelante"],
        ["I let it go", "Lo dejé pasar"],
        ["I handled it better than I expected", "Lo manejé mejor de lo que esperaba"]
      ] },
      { h: ["Or…", "O…"], o: [
        ["I didn’t know what to do", "No supe qué hacer"],
        ["I got upset", "Me enojé"],
        ["I gave up", "Me rendí"],
        ["I need help with this", "Necesito ayuda con esto"],
        ["I’m still figuring it out", "Todavía lo estoy resolviendo"]
      ] }
    ],
    escape: [
      ["Nothing was especially difficult today", "Nada fue especialmente difícil hoy"]
    ]
  };

  /* §13 — close the day */
  var CLOSE = {
    groups: [
      { h: ["Looking back", "Mirando atrás"], o: [
        ["Something I’m proud of", "Algo de lo que estoy orgulloso/a"],
        ["Something I learned", "Algo que aprendí"],
        ["Something I did well", "Algo que hice bien"],
        ["Something I figured out", "Algo que descubrí"],
        ["Something that made me laugh", "Algo que me hizo reír"],
        ["Something that made me smile", "Algo que me hizo sonreír"]
      ] },
      { h: ["People", "Personas"], o: [
        ["Someone who helped me", "Alguien que me ayudó"],
        ["Someone I helped", "Alguien a quien ayudé"],
        ["Someone I’m thankful for", "Alguien a quien agradezco"],
        ["Someone who encouraged me", "Alguien que me animó"],
        ["Someone who made today better", "Alguien que mejoró mi día"]
      ] },
      { h: ["Tomorrow", "Mañana"], o: [
        ["Something I’m looking forward to", "Algo que espero con ganas"],
        ["Something I want to try tomorrow", "Algo que quiero intentar mañana"],
        ["Something I want to do differently tomorrow", "Algo que quiero hacer distinto mañana"],
        ["Something I want to keep doing", "Algo que quiero seguir haciendo"],
        ["Something I want to remember", "Algo que quiero recordar"]
      ] },
      { h: ["Grace", "Gracia"], o: [
        ["I did my best today", "Hoy hice lo mejor que pude"],
        ["I made it through a hard moment", "Superé un momento difícil"],
        ["I handled something better than I expected", "Manejé algo mejor de lo que esperaba"],
        ["I can learn from today", "Puedo aprender de hoy"],
        ["Tomorrow is another chance", "Mañana es otra oportunidad"],
        ["One moment doesn’t define my day", "Un momento no define mi día"],
        ["One day doesn’t define me", "Un día no me define"]
      ] }
    ],
    /* §13 keeps this on purpose. It gives the feature some humanity and stops
       it reading as therapy. Do not remove it to make the screen tidier. */
    escape: [
      ["I’m ready to go home 😎", "Estoy listo/a para irme a casa 😎"]
    ]
  };

  /* §14 — the optional overall day. A PERCEPTION QUESTION, not a clinical
     mood assessment, and nothing downstream may treat it as one. */
  var DAYWORDS = [
    ["🌟", "Great", "Genial"],
    ["🙂", "Pretty good", "Bastante bien"],
    ["😐", "Okay", "Normal"],
    /* 🌦 not 🔄 — the arrows read as refresh/loading; sun-behind-rain says
       "mixed day" literally. The emoji is display-only (dayHtml stores d[1],
       the word), so it can move; the WORD cannot without a migration. */
    ["🌦", "A mix of good and hard moments", "Una mezcla de momentos buenos y difíciles"],
    ["😕", "Difficult", "Difícil"],
    ["😣", "Really difficult", "Muy difícil"],
    ["🤷", "I’m not sure", "No estoy seguro/a"]
  ];

  /* The class questions' own escape hatches (§06, §08). These ride WITH the
     student's real classes and are never hidden behind More choices. */
  var FAV_EXTRA = [
    ["They were all about the same", "Todas estuvieron parecidas"],
    ["None really stood out today", "Ninguna destacó hoy"]
  ];
  var HARD_EXTRA = [
    ["None were especially challenging", "Ninguna fue especialmente difícil"],
    ["They were all about the same", "Todas estuvieron parecidas"],
    ["I don’t want to choose", "Prefiero no elegir"]
  ];
  var NO_FAV  = "None really stood out today";
  var NO_HARD = "None were especially challenging";
  var NO_PICK = "I don’t want to choose";

  /* ===================================================================
     THE FLOW

     Ten screens at most, and two of them delete themselves: a student
     who says no class stood out is not then asked what was good about
     it (§16 — a selection never has to be explained, and a follow-up to
     a "none" is an explanation demand wearing a friendly hat).

     `phase` drives the three-moment ribbon. §19 is the heart of this
     feature and the ribbon is the only place the student sees it, so it
     is named in the student's own words — Look back, Good, Hard, End
     well. ⚠ NEVER call it a positive sandwich in the interface.
     =================================================================== */
  var PHASES = [
    { k: "look",  en: "Look back", es: "Mirar atrás" },
    { k: "good",  en: "Good",      es: "Bueno" },
    { k: "hard",  en: "Hard",      es: "Difícil" },
    { k: "close", en: "End well",  es: "Cerrar bien" }
  ];

  var STEPS = [
    { k: "favClass", phase: "look", kind: "class", max: 1, extra: FAV_EXTRA,
      q: ["Which class did you enjoy the most today?", "¿Qué clase disfrutaste más hoy?"],
      sub: ["Tap one. There is no wrong pick.", "Toca una. No hay elección incorrecta."] },

    { k: "favWhy", phase: "look", kind: "groups", bank: FAV_WHY, max: 4,
      q: ["What made that class enjoyable?", "¿Qué hizo agradable esa clase?"],
      /* "Pick as many as are true." over-promised: the cap is four, and
         hitting it silently un-picks the oldest choice. The sub-line now
         tells the truth the check-in's already told ("Pick up to three"). */
      sub: ["Pick any that are true — up to four.", "Elige las que sean ciertas — hasta cuatro."],
      /* ⚠ XS.a values are ALWAYS arrays — even the max:1 ones. Comparing
         one to a string is always false, which is how this screen once
         survived a "none" answer and asked a student to explain a class
         they had just said did not stand out. */
      skipIf: function (a) { return (a.favClass || []).indexOf(NO_FAV) !== -1; } },

    { k: "hardClass", phase: "look", kind: "class", max: 1, extra: HARD_EXTRA,
      q: ["Which class was most challenging today?", "¿Qué clase fue la más difícil hoy?"],
      sub: ["Challenging is not the same as bad.", "Difícil no significa mala."] },

    { k: "hardWhy", phase: "look", kind: "groups", bank: HARD_WHY, max: 4,
      q: ["What made it challenging?", "¿Qué la hizo difícil?"],
      /* "Pick as many as are true." over-promised: the cap is four, and
         hitting it silently un-picks the oldest choice. The sub-line now
         tells the truth the check-in's already told ("Pick up to three"). */
      sub: ["Pick any that are true — up to four.", "Elige las que sean ciertas — hasta cuatro."],
      skipIf: function (a) {
        var v = a.hardClass || [];
        return v.indexOf(NO_HARD) !== -1 || v.indexOf(NO_PICK) !== -1;
      } },

    { k: "goodMoment", phase: "good", kind: "groups", bank: GOOD, max: 3,
      q: ["What was one good or encouraging moment today?", "¿Cuál fue un momento bueno o alentador de hoy?"],
      sub: ["Small counts. It always counts.", "Lo pequeño cuenta. Siempre cuenta."] },

    { k: "roughMoment", phase: "hard", kind: "groups", bank: ROUGH, max: 3, gate: ROUGH_GATE,
      q: ["Did you have a rough or frustrating moment today?",
          "¿Tuviste un momento difícil o frustrante hoy?"],
      sub: ["You never have to have one.", "Nunca tienes que tener uno."] },

    { k: "response", phase: "hard", kind: "groups", bank: RESPONSE, max: 2,
      q: ["When something was difficult today, what did you do?",
          "Cuando algo fue difícil hoy, ¿qué hiciste?"],
      /* ⚠ This sub-line is load-bearing. It is the sentence that makes
         "I gave up" safe to tap, and the whole question is worthless
         without it. Do not trim it for space. */
      sub: ["There is no right answer to this one.", "Aquí no hay respuesta correcta."] },

    { k: "closing", phase: "close", kind: "groups", bank: CLOSE, max: 2,
      q: ["What’s one good thing you want to end your day with?",
          "¿Con qué cosa buena quieres terminar tu día?"],
      sub: ["This is the one you take home.", "Esta es la que te llevas a casa."] },

    { k: "dayWord", phase: "close", kind: "day", max: 1,
      q: ["How would you describe your day?", "¿Cómo describirías tu día?"],
      sub: ["Your day. Not your week, not you.", "Tu día. No tu semana, no tú."] },

    /* "Want to tell us anything else?" was the one vague audience in the
       whole product — everything else names who reads what, and on a
       disconnected device "us" was literally false. The check-in's own
       wording, borrowed exactly: one product language, one honest reader. */
    { k: "tell", phase: "close", kind: "tell",
      q: ["Anything you want an adult to know?", "¿Algo que quieras que un adulto sepa?"],
      sub: ["", ""] }
  ];

  /* §26 · the three registers. Sixth graders get shorter, plainer prompts;
     eighth graders get the adult phrasing. Same keys, same options, same
     storage — the wording is the only thing that moves.

     ⚠ ADAPT AGAIN AFTER DOMContentLoaded, NOT ONLY AT PARSE (build .30cj).
     On a student's FIRST arrival by link, aog.launch.grade lands in
     sessionStorage after this block has parsed, so the parse-time run saw
     band 7 and every 6th and 8th grader got the default wording on the one
     visit that mattered. Caught on the check-in's twin of this block and
     fixed in both. The re-call is idempotent; nobody is past question 1
     that early, so every question renders from the adapted STEPS. */
  function ageAdapt() {
    var b = gradeBand();
    if (b === "6") {
      STEPS[0].q = ["Which class did you like best today?", "¿Qué clase te gustó más hoy?"];
      STEPS[2].q = ["Which class was hardest today?", "¿Qué clase fue la más difícil hoy?"];
      STEPS[4].q = ["What was one good thing that happened today?", "¿Qué cosa buena pasó hoy?"];
      STEPS[6].q = ["When something was hard today, what did you do?", "Cuando algo fue difícil hoy, ¿qué hiciste?"];
      STEPS[7].q = ["What is one good thing to end your day with?", "¿Con qué cosa buena quieres terminar el día?"];
    } else if (b === "8") {
      STEPS[4].q = ["What was one genuinely good moment today?", "¿Cuál fue un momento realmente bueno hoy?"];
      STEPS[7].q = ["What do you want to carry out of today?", "¿Qué quieres llevarte de hoy?"];
    }
  }
  ageAdapt();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ageAdapt);
  else ageAdapt();

  var XS = { step: 0, studentId: "", a: {}, sched: null, open: {} };

  function visibleSteps() {
    return STEPS.filter(function (st) { return !(st.skipIf && st.skipIf(XS.a)); });
  }
  function stepAt(i) { var v = visibleSteps(); return v[Math.max(0, Math.min(i, v.length - 1))]; }
  function stepCount() { return visibleSteps().length; }

  /* =============================================================== the skin
     Its own identity, the same bones. The Daily Check-In is morning light;
     this is the end of the day, so the accent is dusk rather than gold.

     ⚠ EVERY COLOR HERE IS A REMAPPED TOKEN OR IS DEFINED TWICE.
     --navy and --cream are NOT remapped for dark mode; --ink, --paper,
     --rule and --ink-faint are. Writing navy text on a dark card is the
     exact bug that made the entire Daily Check-In unreadable in dark mode
     for weeks (34 axe nodes). The dusk values below are declared once for
     light and again under :root[data-theme="dark"], so neither theme
     inherits the other's. */
  function injectCss() {
    if (el("aog-xs-css")) return;
    var s = document.createElement("style");
    s.id = "aog-xs-css";
    s.textContent = [
      /* ⚠ THE LOOK IS NOT HERE ANY MORE — IT IS IN #aog-ds.
         Chips, cards, buttons, the ribbon, the escape hatch, the fold
         control, the closing screen and EVERY responsive step for them now
         live in the shared design-system block, worn by this screen and by
         the Daily Check-In from one source (handoff §00, §21). Two things
         follow, and both matter:

           · Restyling a chip there changes both screens. That is the point.
           · Do NOT re-add an .xs-chip rule here "just for the slip". Those
             selectors are ID-scoped in the DS block, so a class-only rule
             added here would lose the cascade and look like a browser bug.

         WHAT STAYS HERE IS THE STAGE — the one-viewport machinery that was
         measured and phone-verified on this screen specifically. Jimmy's
         call was "shared tokens, kept mechanics": look is shared, stage is
         not, and that line runs exactly here. */

      /* ⚠ THE LAYOUT BELONGS TO .active, NOT TO THE BARE ID.
         `.screen{display:none}` is a CLASS rule and an ID rule outranks it,
         so `#screen-exit-slip{display:flex}` would leave this section laid
         out on every other page of the site — a full-viewport blank below
         the footer that nothing on those pages explains. `.active` is
         ID+class, which beats `.screen.active` and stays off until the
         student is actually here. */
      "#screen-exit-slip.active{display:flex;flex-direction:column;min-height:var(--xs-vh,100svh);",
      "  max-height:var(--xs-vh,none);overflow:hidden;padding:0;}",

      /* the terminal screens release the cap — same contract as the
         check-in's sc-free, and for the same reason: a done screen is not
         a measured question and 587px of it inside a 360px stage is
         clipped with nothing to scroll to. */
      "#screen-exit-slip.active.xs-free{display:block;min-height:0;max-height:none;overflow:visible;padding:0 0 40px;}",
      /* ⚠ THE SAME RESET AS sc-free — see the note there. Wheel gestures over
         a terminal screen must reach the document. */
      "#screen-exit-slip.xs-free .xs-wrap{display:block;min-height:0;overflow:visible;overscroll-behavior:auto;}",
      "#screen-exit-slip.xs-free .xs-body{min-height:0;overflow:visible;overscroll-behavior:auto;}",
      /* The same blanket release — see the note in the check-in's injectCss. */
      "#screen-exit-slip.xs-free, #screen-exit-slip.xs-free *{overscroll-behavior:auto;}",

      "#screen-exit-slip .xs-wrap{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;}",
      "#screen-exit-slip .xs-head{flex:0 0 auto;min-height:var(--xs-head,auto);padding-top:18px;}",
      "#screen-exit-slip .xs-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;margin-top:16px;",
      "  overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}",
      "#screen-exit-slip .xs-body>*:last-child{margin-bottom:0;}",
      "#screen-exit-slip .xs-ta{min-height:120px;}",

      /* Stage-only responsive. The look side of these breakpoints lives in
         the DS block; what is left here is head padding and body offset,
         which belong to this screen's own measured stage. */
      "@media (max-width:768px){",
      "  #screen-exit-slip .xs-head{padding-top:14px;}",
      "  #screen-exit-slip .xs-body{margin-top:13px;}",
      "}",
      "@media (max-width:430px){",
      "  #screen-exit-slip .xs-head{padding-top:12px;}",
      "  #screen-exit-slip .xs-body{margin-top:11px;}",
      "}",
      "@media (max-height:740px){",
      "  #screen-exit-slip .xs-head{padding-top:10px;}",
      "  #screen-exit-slip .xs-body{margin-top:9px;}",
      "}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ============================================================ the stage
     Lifted from the Daily Check-In's one-screen work, deliberately
     DUPLICATED rather than shared: that code lives inside its own IIFE and
     exports none of it, and prising it out to share would put a shipped,
     phone-verified screen at risk to save eighty lines here.

     ⚠ visualViewport, not innerHeight. iOS reports the height with its
     toolbars COLLAPSED while the student is looking at the height with
     them showing — an 89px lie on an iPhone X, and a stage 89px too tall
     makes every question scroll a little, which is exactly what "there is
     a lot of scrolling" feels like. */
  function ensureScreen() {
    if (el("screen-exit-slip")) return el("screen-exit-slip");
    var host = el("screen-welcome");
    if (!host || !host.parentNode) return null;
    var sec = document.createElement("section");
    sec.id = "screen-exit-slip";
    sec.className = "screen";
    host.parentNode.appendChild(sec);
    return sec;
  }
  function stageFree(sec, free) {
    if (!sec || !sec.classList) return;
    if (free) sec.classList.add("xs-free");
    else { sec.classList.remove("xs-free"); fitStage(sec); }
  }
  function fitStage(sec) {
    if (!sec) return;
    if (sec.classList && sec.classList.contains("xs-free")) return;
    try {
      var vh = window.innerHeight;
      try {
        if (window.visualViewport && window.visualViewport.height) {
          vh = Math.min(vh, Math.round(window.visualViewport.height));
        }
      } catch (e) {}
      var top = sec.getBoundingClientRect().top + (window.scrollY || 0);
      var h = Math.max(360, Math.round(vh - top));
      sec.style.setProperty("--xs-vh", h + "px");
      var pass = function () {
        var over = document.documentElement.scrollHeight - window.innerHeight;
        if (over > 0) sec.style.setProperty("--xs-vh", Math.max(360, h - over) + "px");
      };
      if (window.requestAnimationFrame) window.requestAnimationFrame(pass); else setTimeout(pass, 0);
    } catch (e) {}
  }
  (function () {
    var t = null;
    function again() {
      clearTimeout(t);
      t = setTimeout(function () {
        var x = el("screen-exit-slip");
        if (!x || !x.classList.contains("active")) return;
        /* A rotation or a keyboard changes how much fits, so the fold has to
           be recomputed, not just the stage. render() is cheap and every
           answer lives in XS.a, so nothing a student has tapped is lost. */
        if (!x.classList.contains("xs-free") && XS.studentId && XS.sched) render();
        else fitStage(x);
      }, 140);
    }
    window.addEventListener("resize", again);
    window.addEventListener("orientationchange", again);
    try {
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", again);
        window.visualViewport.addEventListener("scroll", again);
      }
    } catch (e) {}
  })();

  /* ⚠ ONLY THE QUESTION BLOCK IS MEASURED, and that is on purpose.
     The check-in pins its ANSWER block too because it predates the flex
     stage. Here .xs-body is flex:1 1 auto inside a stage of known height,
     so every answer block is already exactly the same height and the nav
     already sits at the same pixel on all ten screens. Pinning the head
     is what stops the answers starting 30px lower on the two-line
     questions. Measure at the real CONTENT width — leaving .xs-wrap's own
     20px padding on the ghost makes the ghost's text column wider than
     the real one, the longest question wraps to fewer lines, and the
     measured maximum comes in short. That bug shipped once already. */
  var MEASURED = { w: 0, lang: "" };
  function measureHeads(sec) {
    var wrap = sec.querySelector(".xs-wrap");
    if (!wrap) return;
    var w = Math.round(wrap.clientWidth);
    var lang = isEs() ? "es" : "en";
    if (!w || (MEASURED.w === w && MEASURED.lang === lang)) return;
    var cs = window.getComputedStyle(wrap);
    var inner = Math.max(120, w - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0));
    var ghost = document.createElement("div");
    ghost.setAttribute("aria-hidden", "true");
    ghost.className = "xs-wrap";
    ghost.style.cssText = "position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;" +
      "width:" + inner + "px;max-width:none;padding:0;margin:0;";
    sec.appendChild(ghost);
    var max = 0;
    STEPS.forEach(function (st) {
      ghost.innerHTML = '<div class="xs-head">' + headHtml(st) + "</div>";
      max = Math.max(max, ghost.firstChild.offsetHeight);
    });
    sec.removeChild(ghost);
    sec.style.setProperty("--xs-head", max + "px");
    MEASURED.w = w; MEASURED.lang = lang;
  }
  function holdFloor(sec) {
    var h = sec.querySelector(".xs-head");
    if (!h) return;
    var have = parseFloat(sec.style.getPropertyValue("--xs-head")) || 0;
    if (h.offsetHeight > have + 0.5) sec.style.setProperty("--xs-head", h.offsetHeight + "px");
  }

  /* ------------------------------------------------------------ answers */
  function pick(k) { var v = XS.a[k]; return Array.isArray(v) ? v : (v ? [v] : []); }
  function setPick(k, arr) { XS.a[k] = arr; }
  function has(k, v) { return pick(k).indexOf(v) !== -1; }
  function toggle(k, v, max) {
    var arr = pick(k), at = arr.indexOf(v);
    if (at !== -1) arr.splice(at, 1);
    else {
      arr.push(v);
      /* Hitting the max un-picks the OLDEST rather than refusing the tap.
         A control that ignores a finger reads as broken; one that trades
         reads as a rule. Same decision as the check-in's chips. */
      while (arr.length > (max || 3)) arr.shift();
    }
    setPick(k, arr);
    return arr;
  }
  function joined(k) { return pick(k).join(" · "); }

  /* --------------------------------------------------------- the ribbon */
  function ribbonHtml(st) {
    var here = PHASES.map(function (p) { return p.k; }).indexOf(st.phase);
    return '<div class="xs-ribbon" role="presentation">' +
      PHASES.map(function (p, i) {
        var cls = i < here ? "done" : i === here ? "now" : "";
        return '<div class="xs-beat ' + cls + '"><b>' + esc(T(p.en, p.es)) + "</b><i></i></div>";
      }).join("") + "</div>";
  }
  function headHtml(st) {
    return '<h1 class="xs-q">' + esc(T(st.q[0], st.q[1])) + "</h1>" +
      (st.sub && st.sub[0] ? '<p class="xs-sub">' + esc(T(st.sub[0], st.sub[1])) + "</p>" : "");
  }

  /* --------------------------------------------------------- the bodies */
  function chipHtml(k, en, es, extraCls) {
    var on = has(k, en);
    return '<button type="button" class="xs-chip' + (on ? " on" : "") + (extraCls ? " " + extraCls : "") +
      '" data-k="' + esc(k) + '" data-v="' + esc(en) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
      esc(T(en, es)) + "</button>";
  }

  /* §17 · progressive disclosure. Show the first group, and keep adding
     groups while the running total is still under eight options. A group
     is never split across the fold — half a heading is worse than nine
     choices. §18's escape hatch is appended AFTER, outside the fold, and
     is on screen from the first paint. */
  /* ⚠ THE FOLD IS MEASURED AGAINST THE BOX, NOT GUESSED — 2026-08-27, after
     Jimmy: "I don't like how I have to scroll for some of the answers."

     Two earlier rules both failed for the same reason: they counted OPTIONS
     when the thing that runs out is PIXELS. Measured on the real screens,
     the guessed fold left 9 of 10 questions overflowing on an iPhone X's
     635px viewport, worst 221px, while the same fold was fine on an iPhone
     14 and an iPad. No option count can be right across a 292px answer box
     and an 800px one.

     So `bankHtml` now renders EVERY group, and `fitFold()` moves trailing
     content into the More fold until the box stops overflowing. The promise
     it buys is worth stating plainly:

         A STUDENT NEVER SCROLLS TO SEE THE CHOICES THEY WERE HANDED.
         Scrolling happens only after they ask for more.

     §17's "about 6-8 initially" is honored in spirit and beaten in fact:
     on a roomy screen the fold is larger than 8 because it fits, and on a
     cramped one it is smaller because it has to be. */
  function fitFold(sec) {
    var body = sec.querySelector(".xs-body");
    var groups = el("xsGroups"), box = el("xsMoreBox"), btn = el("xsMore");
    if (!body || !groups || !box) return;

    /* Fit against the CLOSED state, whatever the student left open — an
       expanded fold is allowed to scroll, a fresh screen is not. */
    var wasOpen = !box.hidden;
    box.hidden = true;
    if (btn) btn.hidden = true;

    var over = function () { return body.scrollHeight - body.clientHeight; };
    var moved = false, guard = 0;
    function reserve() {
      /* The More button costs height too, so it goes on the moment anything
         moves — otherwise the last group is trimmed to fit a box that then
         grows by 40px and overflows again. */
      if (moved && btn && btn.hidden) btn.hidden = false;
    }

    /* whole groups first, last one back — a heading is never orphaned */
    while (over() > 1 && groups.children.length > 1 && guard++ < 40) {
      box.insertBefore(groups.lastElementChild, box.firstChild);
      moved = true; reserve();
    }

    /* then, inside whatever single group is left, trailing chips — under a
       copy of that group's own heading so the fold still reads as itself */
    if (over() > 1 && groups.children.length === 1) {
      var g = groups.firstElementChild;
      var chips = g.querySelector(".xs-chips");
      var head = g.querySelector(".xs-gh");
      var spill = null;
      /* > 1, not > 2. On a 460px screen two chips plus a heading plus the
         escape row is still too tall, and stopping early means the student
         scrolls — which is the thing this exists to prevent. One chip and a
         More button is an honest screen; a cut-off one is not. */
      while (over() > 1 && chips && chips.children.length > 1 && guard++ < 120) {
        if (!spill) {
          spill = document.createElement("div");
          spill.className = "xs-g";
          if (head) {
            var h = document.createElement("div");
            h.className = "xs-gh";
            h.textContent = head.textContent;
            spill.appendChild(h);
          }
          var wrap = document.createElement("div");
          wrap.className = "xs-chips";
          spill.appendChild(wrap);
          box.insertBefore(spill, box.firstChild);
        }
        spill.querySelector(".xs-chips").insertBefore(chips.lastElementChild, spill.querySelector(".xs-chips").firstChild);
        moved = true; reserve();
      }
    }

    var has = box.children.length > 0;
    if (btn) {
      btn.hidden = !has;
      btn.setAttribute("aria-expanded", (has && wasOpen) ? "true" : "false");
      var lab = btn.querySelector(".mt");
      if (lab) lab.textContent = (has && wasOpen) ? T("Fewer choices", "Menos opciones") : T("More choices", "Más opciones");
    }
    box.hidden = !(has && wasOpen);
    XS.open[XS.foldKey] = !!(has && wasOpen);
  }
  function groupHtml(k, g) {
    return '<div class="xs-gh">' + esc(T(g.h[0], g.h[1])) + "</div>" +
      '<div class="xs-chips">' + g.o.map(function (o) { return chipHtml(k, o[0], o[1]); }).join("") + "</div>";
  }
  function bankHtml(st) {
    var k = st.k, bank = st.bank, open = !!XS.open[k];
    XS.foldKey = k;
    return '<div id="xsGroups">' +
        (bank.groups || []).map(function (g) { return '<div class="xs-g">' + groupHtml(k, g) + "</div>"; }).join("") +
      "</div>" +
      '<div id="xsMoreBox"' + (open ? "" : " hidden") + "></div>" +
      '<button type="button" class="xs-more" id="xsMore" hidden aria-expanded="false" aria-controls="xsMoreBox">' +
        '<span class="mt">' + esc(T("More choices", "Más opciones")) + "</span>" +
        '<span class="cv" aria-hidden="true">▾</span></button>' +
      (bank.escape && bank.escape.length
        ? '<div class="xs-esc"><div class="xs-chips">' +
          bank.escape.map(function (o) { return chipHtml(k, o[0], o[1]); }).join("") + "</div></div>"
        : "");
  }
  function gateHtml(st) {
    var on = has(st.k, st.gate[0]);
    return '<button type="button" class="xs-gate' + (on ? " on" : "") + '" id="xsGate" aria-pressed="' +
      (on ? "true" : "false") + '">' + esc(T(st.gate[0], st.gate[1])) + "</button>" +
      '<div class="xs-orline">' + esc(T("or, if you did", "o, si lo tuviste")) + "</div>" +
      '<div id="xsGated"' + (on ? ' class="xs-dim"' : "") + ">" + bankHtml(st) + "</div>";
  }
  function classHtml(st) {
    var k = st.k, list = XS.sched || [];
    var rows = list.map(function (c, i) {
      var on = has(k, c);
      return '<button type="button" class="xs-cls' + (on ? " on" : "") + '" data-k="' + esc(k) +
        '" data-v="' + esc(c) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        '<span class="pd" aria-hidden="true">' + (i + 1) + "</span>" +
        "<span>" + esc(trSubject(c)) + "</span></button>";
    }).join("");
    var extras = (st.extra || []).map(function (o) {
      var on = has(k, o[0]);
      return '<button type="button" class="xs-cls alt' + (on ? " on" : "") + '" data-k="' + esc(k) +
        '" data-v="' + esc(o[0]) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        "<span>" + esc(T(o[0], o[1])) + "</span></button>";
    }).join("");
    return '<div class="xs-classes">' + rows + extras + "</div>";
  }
  /* ⚠ §18 · EVERY QUESTION NEEDS A MARKED WAY OUT. This screen had one all
     along — "I'm not sure" — but it was rendered as just another day word, so
     it read as a seventh opinion about the day rather than as the option for a
     student who does not want to give one. It is dashed now, like every other
     escape hatch in the flow, and the harness checks for it by that class. */
  function dayHtml(st) {
    return '<div class="xs-days">' + DAYWORDS.map(function (d) {
      var on = has(st.k, d[1]);
      var out = /not sure/i.test(d[1]) ? " alt" : "";
      return '<button type="button" class="xs-day' + out + (on ? " on" : "") + '" data-k="' + esc(st.k) +
        '" data-v="' + esc(d[1]) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        '<span class="em" aria-hidden="true">' + d[0] + "</span><span>" + esc(T(d[1], d[2])) + "</span></button>";
    }).join("") + "</div>";
  }
  /* §15 · writing is a door, not a step. "Not today" ends the experience
     immediately: no follow-up, no confirmation, no "are you sure". */
  function tellHtml() {
    var open = !!XS.open.tell;
    return '<div class="xs-tellrow">' +
      '<button type="button" class="xs-ghost" id="xsWrite">' + esc(T("I’ll write something", "Quiero escribir algo")) + "</button>" +
      '<button type="button" class="xs-next" id="xsNotToday">' + esc(T("Not today", "Hoy no")) + "</button>" +
      "</div>" +
      (open ? '<textarea class="xs-ta" id="xsTa" placeholder="' +
        esc(T("Anything you want to say. Or nothing.", "Lo que quieras decir. O nada.")) + '">' +
        esc(XS.a.written || "") + "</textarea>" : "");
  }
  function bodyHtml(st) {
    if (st.kind === "class")  return classHtml(st);
    if (st.kind === "day")    return dayHtml(st);
    if (st.kind === "tell")   return tellHtml(st);
    if (st.gate)              return gateHtml(st);
    return bankHtml(st);
  }

  /* =========================================================== rendering */
  function render() {
    var sec = ensureScreen();
    if (!sec) return;
    injectCss();
    /* ⚠ SHOW BEFORE MEASURING. The stage, the pinned question block and the
       one-screen fit are all read off getBoundingClientRect, and a section
       that is still display:none measures zero — question 1 came out 312px
       short and its buttons sat a third of the way up the screen while
       every later question was correct. Showing first also means the site
       header is already hidden (body.aog-survey-focus) when the stage is
       measured, which is the other half of the same 312px. */
    if (!sec.classList.contains("active") && typeof showScreen === "function") showScreen("screen-exit-slip");
    stageFree(sec, false);

    var locked = lockedStudent();
    if (locked) XS.studentId = locked;
    if (!XS.studentId) { renderId(sec); return; }
    if (!XS.sched) XS.sched = scheduleFor(XS.studentId);
    if (!XS.sched) { renderPicker(sec); return; }

    var v = visibleSteps();
    if (XS.step >= v.length) XS.step = v.length - 1;
    if (XS.step < 0) XS.step = 0;
    var st = v[XS.step];
    var last = XS.step === v.length - 1;

    sec.innerHTML =
      '<div class="xs-top">' + ribbonHtml(st) +
        '<div class="xs-meta"><span>' + esc(T("School-day exit slip", "Salida del día escolar")) + "</span>" +
        '<span class="xs-count">' + esc(T("Question ", "Pregunta ") + (XS.step + 1) + T(" of ", " de ") + v.length) +
        "</span></div></div>" +
      '<div class="xs-wrap">' +
        '<div class="xs-head">' + headHtml(st) + "</div>" +
        '<div class="xs-body">' + bodyHtml(st) + "</div>" +
        '<div class="xs-nav">' +
          '<button type="button" class="xs-back" id="xsBack"' +
            (XS.step > 0 ? "" : ' style="visibility:hidden;" tabindex="-1" aria-hidden="true"') + ">← " +
            esc(T("Back", "Atrás")) + "</button>" +
          '<button type="button" class="xs-next" id="xsNext" style="margin-left:auto;' +
            (st.kind === "tell" ? 'visibility:hidden;" tabindex="-1" aria-hidden="true"' : '"') + ">" +
            esc(last ? T("Finish", "Terminar") : T("Next", "Siguiente")) + "</button>" +
        "</div>" +
      "</div>";

    measureHeads(sec);
    holdFloor(sec);
    fitStage(sec);
    wire(st);
    /* ⚠ THE FOLD CANNOT BE A ONE-SHOT. fitStage sets --xs-vh and then corrects
       it once more inside a requestAnimationFrame, so a fitFold called on the
       same tick measures a box that is about to get shorter — it folds to a
       height that does not exist, and the screen ends up overflowing by
       exactly the correction. Measured: 74px on question 2 at 375×635, with
       fitFold having run and believing it was done.

       So the fold is driven by the box instead of by the render: once after
       layout settles, and after that whenever .xs-body actually changes
       height — a rotation, iOS collapsing its toolbars, the keyboard. */
    /* ⚠ MORE THAN ONE PASS, ON PURPOSE. A web font arriving, iOS collapsing
       its toolbars, the stage's own shrink-only correction — each changes the
       box after the first fold and none of them fires on a predictable tick.
       fitFold is idempotent and costs a layout read, so it runs a few times
       and stops mattering. Cheaper than being wrong on a 460px screen. */
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { fitFold(sec); });
    else setTimeout(function () { fitFold(sec); }, 0);
    [120, 420].forEach(function (ms) {
      setTimeout(function () {
        var x = el("screen-exit-slip");
        if (x && x.classList.contains("active") && !x.classList.contains("xs-free")) fitFold(x);
      }, ms);
    });
    watchBox(sec);
  }

  /* Removing content does not change .xs-body's height — it is flex:1 1 auto
     inside a stage of known height — so this cannot feed itself. The guard is
     belt and braces for a browser that disagrees. */
  var BOXOBS = null, FOLDING = false;
  function watchBox(sec) {
    try {
      if (!window.ResizeObserver) return;
      var body = sec.querySelector(".xs-body");
      if (!body) return;
      if (BOXOBS) BOXOBS.disconnect();
      BOXOBS = new ResizeObserver(function () {
        if (FOLDING) return;
        FOLDING = true;
        try { fitFold(sec); } catch (e) {}
        FOLDING = false;
      });
      BOXOBS.observe(body);
    } catch (e) {}
  }

  /* The code screen. ⚠ ONE CONVENTION IN THIS PRODUCT, NOT TWO: initials
     and a seat number, the same one every time, never a full name. This is
     the reflection's own fallback and the check-in's, word for word. A dead
     end in front of a text box is how a thirteen-year-old ends up typing
     their name into a field that says not to. */
  function renderId(sec) {
    stageFree(sec, true);
    sec.innerHTML =
      '<div class="xs-top"><div class="xs-meta"><span>' +
        esc(T("School-day exit slip", "Salida del día escolar")) + "</span><span></span></div></div>" +
      '<div class="xs-wrap"><div class="xs-head">' +
        '<h1 class="xs-q">' + esc(T("What’s your student code?", "¿Cuál es tu código de estudiante?")) + "</h1>" +
        '<p class="xs-sub">' + esc(T("Use the same code as your check-in. No code yet? Use your initials and seat number, like JR12, every time. Not your full name.",
          "Usa el mismo código de tu registro. ¿Aún no tienes? Usa tus iniciales y tu número de asiento, como JR12, siempre. No tu nombre completo.")) + "</p>" +
      "</div>" +
      '<div class="xs-body"><input class="xs-ta" style="min-height:0;padding:13px 15px;font-size:17px;" id="xsId" autocomplete="off" placeholder="' +
        esc(T("Your code", "Tu código")) + '" value="' + esc(XS.studentId || "") + '"></div>' +
      '<div class="xs-nav"><button type="button" class="xs-next" id="xsIdGo" style="margin-left:auto;">' +
        esc(T("Start", "Comenzar")) + "</button></div></div>";
    var go = el("xsIdGo"), inp = el("xsId");
    function start() {
      var val = (inp ? inp.value : "").trim();
      if (!val) { if (inp) inp.focus(); return; }
      XS.studentId = val;
      XS.sched = scheduleFor(val);
      XS.step = 0;
      render();
    }
    if (go) go.addEventListener("click", start);
    if (inp) inp.addEventListener("keydown", function (e) { if (e.key === "Enter") start(); });
  }

  /* §04, tier 3 · THE ONE-TIME PICKER. Only ever seen by a student whose
     teacher has not built a class and whose link carries no schedule. It
     is asked ONCE per code and remembered on this device, so the cost of
     having no roster feed is thirty seconds in the first week and zero
     every day after. The §05 category list is what it offers. */
  function renderPicker(sec) {
    stageFree(sec, true);
    var chosen = XS.pick || [];
    var groups = [
      { h: ["Core classes", "Clases principales"], g: "core" },
      { h: ["Specials, electives and encore", "Optativas y encore"], g: "encore" },
      /* Third group, added with the support periods above. `groups` was already
         data-driven, so this is one entry and no new markup -- and Advisory
         deliberately STAYS in encore: it is homeroom time, not a service. */
      { h: ["Learning Resource and study skills", "Clase de Recursos y destrezas de estudio"], g: "support" }
    ];
    sec.innerHTML =
      '<div class="xs-top"><div class="xs-meta"><span>' +
        esc(T("School-day exit slip", "Salida del día escolar")) + "</span><span></span></div></div>" +
      '<div class="xs-wrap"><div class="xs-head">' +
        '<h1 class="xs-q">' + esc(T("Which classes do you have?", "¿Qué clases tienes?")) + "</h1>" +
        '<p class="xs-sub">' + esc(T("Tap yours. You only do this once — after today the exit slip already knows.",
          "Toca las tuyas. Solo lo haces una vez — después la salida ya las sabrá.")) + "</p>" +
      "</div>" +
      '<div class="xs-body">' +
        groups.map(function (grp) {
          return '<div class="xs-gh">' + esc(T(grp.h[0], grp.h[1])) + "</div>" +
            '<div class="xs-chips">' + SUBJECTS.filter(function (s) { return s.g === grp.g; }).map(function (s) {
              var on = chosen.indexOf(s.en) !== -1;
              return '<button type="button" class="xs-chip xs-pk' + (on ? " on" : "") + '" data-v="' + esc(s.en) +
                '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(T(s.en, s.es)) + "</button>";
            }).join("") + "</div>";
        }).join("") +
      "</div>" +
      '<div class="xs-nav">' +
        '<span class="xs-sub" id="xsPkN">' + esc(pickCount(chosen.length)) + "</span>" +
        '<button type="button" class="xs-next" id="xsPkGo" style="margin-left:auto;"' +
          (chosen.length < 2 ? " disabled" : "") + ">" + esc(T("That’s my day", "Ese es mi día")) + "</button>" +
      "</div></div>";
    var go = el("xsPkGo"), n = el("xsPkN");
    Array.prototype.forEach.call(sec.querySelectorAll(".xs-pk"), function (b) {
      b.addEventListener("click", function () {
        var val = b.getAttribute("data-v");
        var arr = XS.pick || (XS.pick = []);
        var at = arr.indexOf(val);
        if (at !== -1) arr.splice(at, 1); else if (arr.length < 12) arr.push(val);
        var on = arr.indexOf(val) !== -1;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
        if (n) n.textContent = pickCount(arr.length);
        if (go) go.disabled = arr.length < 2;
      });
    });
    if (go) go.addEventListener("click", function () {
      var arr = XS.pick || [];
      if (arr.length < 2) return;
      /* Keep the order the §05 list is written in, which is core first —
         it reads like a schedule rather than like the order they tapped. */
      var ordered = SUBJECTS.map(function (s) { return s.en; }).filter(function (e) { return arr.indexOf(e) !== -1; });
      saveSchedule(XS.studentId, ordered);
      XS.sched = ordered;
      XS.step = 0;
      render();
    });
  }
  function pickCount(n) {
    if (!n) return T("Pick at least two.", "Elige al menos dos.");
    return n + " " + (n === 1 ? T("class", "clase") : T("classes", "clases"));
  }

  /* ============================================================== wiring
     Nothing re-renders on a tap. A choice is painted in place, exactly as
     the check-in does it, because rebuilding the screen under a finger is
     what makes a page feel like it is moving. */
  function wire(st) {
    var back = el("xsBack"), next = el("xsNext");
    if (back) back.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    var gate = el("xsGate"), gated = el("xsGated");
    function paintGate() {
      if (!gate) return;
      var on = has(st.k, st.gate[0]);
      gate.classList.toggle("on", on);
      gate.setAttribute("aria-pressed", on ? "true" : "false");
      if (gated) gated.classList.toggle("xs-dim", on);
    }
    if (gate) gate.addEventListener("click", function () {
      var on = has(st.k, st.gate[0]);
      /* Exclusive both ways. Saying "no, not really" clears whatever was
         picked; picking something clears the no. Neither is ever refused. */
      setPick(st.k, on ? [] : [st.gate[0]]);
      Array.prototype.forEach.call(document.querySelectorAll("#screen-exit-slip .xs-chip"), function (b) {
        b.classList.remove("on"); b.setAttribute("aria-pressed", "false");
      });
      paintGate();
    });

    var sel = "#screen-exit-slip .xs-chip, #screen-exit-slip .xs-cls, #screen-exit-slip .xs-day";
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (b) {
      if (b.classList.contains("xs-pk")) return;
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-k"), val = b.getAttribute("data-v");
        if (!k) return;
        if (st.gate && has(st.k, st.gate[0])) setPick(st.k, []);   /* leaving the no */
        var arr = toggle(k, val, st.max || 3);
        Array.prototype.forEach.call(document.querySelectorAll(sel), function (o) {
          if (o.classList.contains("xs-pk")) return;
          var on = arr.indexOf(o.getAttribute("data-v")) !== -1;
          o.classList.toggle("on", on);
          o.setAttribute("aria-pressed", on ? "true" : "false");
        });
        paintGate();
      });
    });

    var more = el("xsMore"), box = el("xsMoreBox");
    if (more && box) more.addEventListener("click", function () {
      var open = box.hidden;
      XS.open[st.k] = open;
      box.hidden = !open;
      more.setAttribute("aria-expanded", open ? "true" : "false");
      var lab = more.querySelector(".mt");
      if (lab) lab.textContent = open ? T("Fewer choices", "Menos opciones") : T("More choices", "Más opciones");
      /* Opening is the student ASKING for more, so this is the one place the
         box may scroll — and it should land them at the top of what they
         just asked to see rather than wherever the box happened to be. */
      if (open) { try { box.scrollIntoView({ block: "nearest" }); } catch (e) {} }
    });

    var write = el("xsWrite"), notToday = el("xsNotToday");
    if (write) write.addEventListener("click", function () {
      XS.open.tell = true;
      render();
      var ta = el("xsTa");
      if (ta) { ta.focus(); }
      var nx = el("xsNext");
      if (nx) { nx.style.visibility = "visible"; nx.removeAttribute("aria-hidden"); nx.removeAttribute("tabindex"); nx.textContent = T("Finish", "Terminar"); }
    });
    /* §15 · immediately ends. No follow-up. No guilt. No are-you-sure. */
    if (notToday) notToday.addEventListener("click", function () { XS.a.written = ""; finish(); });
    var ta = el("xsTa");
    if (ta) ta.addEventListener("input", function () { XS.a.written = ta.value.slice(0, 1200); });
  }

  function go(d) {
    var ta = el("xsTa");
    if (ta) XS.a.written = ta.value.slice(0, 1200);
    var v = visibleSteps();
    if (d > 0 && XS.step >= v.length - 1) { finish(); return; }
    XS.step = Math.max(0, XS.step + d);
    render();
    try { var b = document.querySelector("#screen-exit-slip .xs-body"); if (b) b.scrollTop = 0; } catch (e) {}
  }

  /* ============================================================ the record
     §22 · the student experience is simple; the record is structured. Every
     field is a stored ENGLISH label or a plain count. Nothing here is a
     score, a percentage or a rating, because §25 is the rule this feature
     lives or dies on:

       "I was tired" does not mean the student has a sleep problem.
       "Math was difficult" does not mean a math deficit.
       "Someone upset me" does not mean a behavioral incident.

     This is student voice data. It is context. Human beings interpret it,
     and nothing downstream may turn a selection into a verdict. */
  function store() { return jload(XKEY, { logs: {} }); }
  function todaysSlips(sid) {
    var days = (store().logs || {})[codeKey(sid)] || {};
    return (days[todayISO()] || []).slice();
  }
  function allSlips(sid) {
    var days = (store().logs || {})[codeKey(sid)] || {}, out = [];
    Object.keys(days).forEach(function (d) { out = out.concat(days[d] || []); });
    out.sort(function (a, b) { return String(a.timestamp) < String(b.timestamp) ? -1 : 1; });
    return out;
  }

  var HELP_ASK = "I need help with this";

  function buildRecord() {
    var written = (XS.a.written || "").trim();
    return {
      timestamp:        new Date().toISOString(),
      date:             todayISO(),
      year:             (window.AOGYear ? AOGYear(todayISO()) : ""),
      submitTime:       clockNow(),
      slipType:         "exit",
      districtId:       ss("aog.launch.districtId"),
      schoolId:         ss("aog.launch.schoolId"),
      classId:          ss("aog.launch.classId"),
      grade:            ss("aog.launch.grade"),
      period:           ss("aog.launch.period"),
      term:             ss("aog.launch.term"),
      assignmentId:     ss("aog.launch.assignmentId"),
      trackingGroup:    ss("aog.launch.trackingGroup"),
      studentId:        XS.studentId,
      respondentId:     XS.studentId,
      respondentRole:   "student",
      classesAvailable: (XS.sched || []).join(" | "),
      scheduleSource:   scheduleSource(XS.studentId) || "student",
      favClass:         joined("favClass"),
      favWhy:           joined("favWhy"),
      hardClass:        joined("hardClass"),
      hardWhy:          joined("hardWhy"),
      goodMoment:       joined("goodMoment"),
      roughMoment:      joined("roughMoment"),
      response:         joined("response"),
      closing:          joined("closing"),
      dayWord:          joined("dayWord"),
      written:          written,
      /* ⚠ A FOLLOW-UP FLAG IS A REQUEST, NEVER A DIAGNOSIS. It is raised by
         exactly two things: the student typed something, or the student
         tapped "I need help with this". It is NOT raised by a rough moment,
         by "I gave up", or by a difficult day — treating those as alerts is
         §29's "a system that interprets every negative response as an
         alert", and it is how a child learns not to answer honestly. */
      followUp:         !!written || has("response", HELP_ASK),
      source:           "link"
    };
  }

  function finish() {
    var rec = buildRecord();
    var s = store();
    if (!s.logs) s.logs = {};
    var key = codeKey(rec.studentId);
    if (!s.logs[key]) s.logs[key] = {};
    if (!s.logs[key][rec.date]) s.logs[key][rec.date] = [];
    s.logs[key][rec.date].push(rec);
    jsave(XKEY, s);
    queuePush(rec);
    window.__xsLastRec = rec;
    renderDone(rec, "sending");
    sync(rec).then(function (state) { renderDone(rec, state); })
             .catch(function () { renderDone(rec, "offline"); });
  }

  /* ================================================= §28 · the last screen
     One of the emotional signatures of the feature. The arc is the three
     moments the student just walked: up, down, up. It is drawn, not
     animated — §27 rules out excessive animation, and a reflection ritual
     that performs at you is a different product. */
  function arcSvg() {
    return '<svg class="arc" width="188" height="62" viewBox="0 0 188 62" fill="none" aria-hidden="true">' +
      /* ⚠ THE SHAPE IS THE ARGUMENT. Good is HIGH, hard is LOW, good is HIGH
         again — §19's GOOD → HARD → GOOD, drawn. A first cut put all three
         dots on one line with the curve wandering between them, which reads
         as up-then-down: the hard part first and the good part after, which
         is the opposite claim. */
      '<path d="M14 18 C 44 18, 62 46, 94 46 C 126 46, 144 18, 174 18" stroke="var(--rule)" stroke-width="2" ' +
      'stroke-linecap="round" fill="none"/>' +
      '<circle cx="14" cy="18" r="6" fill="var(--xs-dusk)"/>' +
      '<circle cx="94" cy="46" r="6" fill="var(--xs-dusk)"/>' +
      '<circle cx="174" cy="18" r="6" fill="var(--xs-dusk)"/>' +
      "</svg>";
  }
  function recapRow(k, label, val) {
    if (!val) return "";
    var parts = String(val).split(" · ").map(function (x) {
      return SUBJ_ES[x] ? trSubject(x) : trOption(x);
    }).join(" · ");
    return '<div class="rr"><div class="rk">' + esc(label) + '</div><div class="rv">' + esc(parts) + "</div></div>";
  }
  /* Records store English. Showing a Spanish reader their own answer asks
     here rather than keeping a second copy of every list. */
  var ALL_OPTS = null;
  function trOption(en) {
    if (!ALL_OPTS) {
      ALL_OPTS = {};
      [FAV_WHY, HARD_WHY, GOOD, ROUGH, RESPONSE, CLOSE].forEach(function (bank) {
        (bank.groups || []).forEach(function (g) { g.o.forEach(function (o) { ALL_OPTS[o[0]] = o[1]; }); });
        (bank.escape || []).forEach(function (o) { ALL_OPTS[o[0]] = o[1]; });
      });
      [FAV_EXTRA, HARD_EXTRA].forEach(function (l) { l.forEach(function (o) { ALL_OPTS[o[0]] = o[1]; }); });
      DAYWORDS.forEach(function (d) { ALL_OPTS[d[1]] = d[2]; });
      ALL_OPTS[ROUGH_GATE[0]] = ROUGH_GATE[1];
    }
    return ALL_OPTS[en] ? T(en, ALL_OPTS[en]) : en;
  }

  /* ── .30ep · print/save the slip — the same option the This Is Me
     preview got in .30en, for the same sentence of Jimmy's: "a preview
     page pops up … and they would then have the option of saving it,
     printing it etc." The done screen's recap IS the preview and was
     already here; this is the way to keep it. Its own window, controls
     wired BEFORE print() and hidden @media print — the .29bb pattern.
     It prints only what the done screen already shows plus the student's
     own written line: their words, their device, their tap. Nothing here
     sends anything anywhere. */
  function printSlip(rec) {
    var es = isEs();
    var w = window.open("", "_blank");
    if (!w) { try { alert(T("Please allow pop-ups to print your slip.", "Permite las ventanas emergentes para imprimir tu salida.")); } catch (e0) {} return; }
    var rows =
      recapRow("fav", T("Enjoyed", "Disfrutaste"), rec.favClass) +
      recapRow("hard", T("Hardest", "Más difícil"), rec.hardClass) +
      recapRow("good", T("Good", "Bueno"), rec.goodMoment) +
      recapRow("rough", T("Hard", "Difícil"), rec.roughMoment) +
      recapRow("resp", T("You did", "Hiciste"), rec.response) +
      recapRow("close", T("Carrying", "Te llevas"), rec.closing) +
      recapRow("word", T("Your word for today", "Tu palabra de hoy"), rec.dayWord);
    var title = (es ? "Mi salida del día — " : "My Exit Slip — ") + String(rec.studentId || "");
    var doc = '<!doctype html><html lang="' + (es ? "es" : "en") + '"><head><meta charset="utf-8"><title>' + esc(title) + "</title><style>"
      + "*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}"
      + "body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:34px auto;max-width:640px;padding:0 20px;}"
      + ".bh{border-bottom:3px solid #D9A33B;padding-bottom:12px;margin-bottom:14px;}"
      + ".bh h1{margin:0;font-size:26px;letter-spacing:.01em;}"
      + ".bh .who{font-size:13px;color:#46506E;margin-top:4px;}"
      + ".rr{display:flex;gap:14px;padding:9px 0;border-bottom:1px solid #E4DAC5;}"
      + ".rk{width:130px;flex:none;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#9a6f24;padding-top:3px;}"
      + ".rv{flex:1;font-size:15px;line-height:1.55;}"
      + ".wr{margin-top:16px;padding:12px 14px;border:1.5px solid #E4DAC5;border-left:5px solid #D9A33B;border-radius:10px;font-size:14.5px;line-height:1.6;}"
      + ".wr .wk{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#9a6f24;margin-bottom:4px;}"
      + ".lines{margin-top:20px;font-size:13.5px;color:#46506E;line-height:1.8;}"
      + ".ft{border-top:1.5px solid #E4DAC5;margin-top:26px;padding-top:10px;font-size:11.5px;color:#46506E;line-height:1.5;}"
      + "@media screen{body{font-size:16px;}}"
      + "@media print{.xsnav{display:none !important;}}"
      + ".xsnav{display:flex;gap:10px;margin:0 0 20px;}"
      + ".xsnav button{font:inherit;font-size:14px;font-weight:700;cursor:pointer;padding:10px 16px;"
      + "border-radius:999px;border:2px solid #0A1E33;background:#0A1E33;color:#fff;}"
      + ".xsnav button.gh{background:transparent;color:#0A1E33;}"
      + "</style></head><body>"
      + '<div class="xsnav"><button type="button" id="xsPBack">← '
      + esc(es ? "Volver" : "Back") + "</button>"
      + '<button type="button" class="gh" id="xsPGo">🖨 '
      + esc(es ? "Imprimir" : "Print") + "</button></div>"
      + '<div class="bh"><h1>' + (es ? "MI SALIDA DEL DÍA" : "MY EXIT SLIP") + "</h1><div class=\"who\">"
      + esc(String(rec.studentId || "")) + " · " + esc(String(rec.date || "")) + (rec.submitTime ? " · " + esc(rec.submitTime) : "") + "</div></div>"
      + rows
      + (String(rec.written || "").trim()
          ? '<div class="wr"><div class="wk">' + esc(es ? "En mis palabras" : "In my own words") + "</div>" + esc(String(rec.written).trim()) + "</div>"
          : "")
      + '<div class="lines">' + esc(T("Good moments count. Hard moments count. And neither one defines you.",
          "Los momentos buenos cuentan. Los momentos difíciles cuentan. Y ninguno de los dos te define.")) + "</div>"
      + '<div class="ft">' + esc(es
        ? "Hecho en Architecture of Grace · esta salida es la voz del estudiante — contexto, nunca un veredicto."
        : "Made in Architecture of Grace · this slip is the student's own voice — context, never a verdict.") + "</div>"
      + "</body></html>";
    w.document.write(doc); w.document.close(); w.focus();
    try {
      var bk = w.document.getElementById("xsPBack");
      if (bk) bk.onclick = function () { try { w.close(); } catch (e2) {} };
      var pg = w.document.getElementById("xsPGo");
      if (pg) pg.onclick = function () { try { w.print(); } catch (e3) {} };
    } catch (e1) {}
    try { w.print(); } catch (e4) {}
  }

  function renderDone(rec, state) {
    var sec = el("screen-exit-slip");
    if (!sec) return;
    stageFree(sec, true);
    var seen;
    if (!anAdultWillSeeThis()) {
      seen = T("This stayed on this device. Nothing was sent.",
               "Esto se quedó en este dispositivo. No se envió nada.");
    } else if (state === "sending") {
      seen = T("Sending…", "Enviando…");
    } else if (state === "sent") {
      seen = T("Your teacher will see it.", "Tu maestro/a lo verá.");
    } else if (state === "rejected") {
      seen = T("It’s saved here. Your school’s sheet isn’t ready for exit slips yet — tell your teacher.",
               "Está guardado aquí. La hoja de tu escuela aún no está lista para las salidas — dile a tu maestro/a.");
    } else {
      seen = T("It’s saved here and will send itself when this device is back online.",
               "Está guardado aquí y se enviará solo cuando este dispositivo vuelva a estar en línea.");
    }

    var recap =
      recapRow("fav", T("Enjoyed", "Disfrutaste"), rec.favClass) +
      recapRow("hard", T("Hardest", "Más difícil"), rec.hardClass) +
      recapRow("good", T("Good", "Bueno"), rec.goodMoment) +
      recapRow("rough", T("Hard", "Difícil"), rec.roughMoment) +
      recapRow("resp", T("You did", "Hiciste"), rec.response) +
      recapRow("close", T("Carrying", "Te llevas"), rec.closing);

    sec.innerHTML =
      '<div class="xs-wrap"><div class="xs-done">' +
        arcSvg() +
        "<h2>" + esc(T("You made it through today.", "Lograste pasar el día de hoy.")) + "</h2>" +
        '<div class="xs-lines">' +
          "<p>" + esc(T("Good moments count.", "Los momentos buenos cuentan.")) + "</p>" +
          "<p>" + esc(T("Hard moments count.", "Los momentos difíciles cuentan.")) + "</p>" +
          '<p class="neither">' + esc(T("And neither one defines you.", "Y ninguno de los dos te define.")) + "</p>" +
        "</div>" +
        '<p class="xs-see">' + esc(T("See you tomorrow.", "Nos vemos mañana.")) + "</p>" +
        (recap ? '<div class="xs-recap">' + recap + "</div>" : "") +
        '<div id="xsHomeSlot"></div>' +
        '<p class="xs-seen">' + esc(seen) + "</p>" +
        (rec.followUp
          ? '<div class="xs-hand"><p>' +
            esc(anAdultWillSeeThis()
              ? T("What you wrote goes to your teacher with this slip, and they will read it the next time they open them — not the second you tap Done.",
                  "Lo que escribiste va a tu maestro/a junto con esta salida, y lo leerá la próxima vez que las abra — no en el segundo en que toques Listo.")
              : T("This device isn’t connected to your school, so nothing was sent and nobody has been told yet. Show them this screen, or just say it out loud.",
                  "Este dispositivo no está conectado a tu escuela, así que no se envió nada y nadie lo sabe todavía. Muéstrales esta pantalla, o díselo en voz alta.")) + "</p>" +
            '<p class="now">' + esc(T("If you need help right now: tell an adult near you, or go to the office. Don’t wait for this to be read.",
              "Si necesitas ayuda ahora mismo: dile a un adulto cerca de ti, o ve a la oficina. No esperes a que lean esto.")) + "</p></div>"
          : "") +
        '<div class="xs-nav" style="justify-content:center;border-top:0;gap:10px;flex-wrap:wrap;">' +
          '<button type="button" class="xs-next" id="xsDone">' + esc(T("Done", "Listo")) + "</button>" +
          '<button type="button" class="xs-ghost" id="xsPrint">🖨 ' + esc(T("Print / save my slip", "Imprimir / guardar mi salida")) + "</button>" +
        "</div>" +
        '<p class="xs-seen" style="margin-top:6px;"><button type="button" class="xs-back" id="xsEditSched">' +
          esc(T("My classes changed", "Mis clases cambiaron")) + "</button></p>" +
      "</div></div>";

    var d = el("xsDone");
    if (d) d.addEventListener("click", function () {
      if (typeof resetToStart === "function") resetToStart();
      else if (typeof showScreen === "function") showScreen("screen-welcome");
    });
    var pr = el("xsPrint");
    if (pr) pr.addEventListener("click", function () { printSlip(rec); });
    var ed = el("xsEditSched");
    if (ed) ed.addEventListener("click", function () {
      forgetSchedule(XS.studentId);
      XS.sched = null; XS.pick = (XS.sched || []).slice(); XS.step = 0; XS.a = {}; XS.open = {};
      render();
    });
    /* Bring This Home (build .30cv). The family bridge renders into its own
       slot, and the card overlay lives on <body> over in #aog-exit-home —
       so this screen's repaints on sync-state flips (sending → sent) can
       re-arrive at the same picture without tearing down an open card. */
    try { if (window.AOGExitHome) window.AOGExitHome.offer(rec, el("xsHomeSlot")); } catch (e) {}
  }

  /* Coming back to the same link after finishing shows what they left with
     rather than restarting nine questions. Doing another slip is one tap —
     a student who had a second thought is not a duplicate to be prevented. */
  function offerTodays(sid) {
    var arr = todaysSlips(sid);
    if (!arr.length) return false;
    var rec = arr[arr.length - 1];
    var sec = ensureScreen();
    if (!sec) return false;
    injectCss();
    stageFree(sec, true);
    sec.innerHTML =
      '<div class="xs-wrap"><div class="xs-done">' + arcSvg() +
        "<h2>" + esc(T("You already closed out today.", "Ya cerraste el día de hoy.")) + "</h2>" +
        '<p class="xs-seen">' + esc(T("Finished at ", "Terminado a las ") + (rec.submitTime || "")) + "</p>" +
        /* ⚠ A CODE IN A LINK IS A WRITE CREDENTIAL, NEVER A READ ONE.
           This recap is the student's own words from earlier today. When the
           code was TYPED by the person it belongs to, showing it back is the
           whole point. When it arrived on a link, whoever is holding that
           link is not necessarily that child — so the words do not render.
           Same rule, same reason as gateReads() in aog-student-links; this
           screen had never been given it, and the quiet exit-slip door on
           the check-in reached it with a linked code already. */
        (linkedArrival()
          ? '<p class="xs-seen">' + esc(T("Add another if today had more in it.",
              "Agrega otra si el d\u00eda tuvo m\u00e1s.")) + "</p>"
          : '<div class="xs-recap">' +
              recapRow("good", T("Good", "Bueno"), rec.goodMoment) +
              recapRow("close", T("Carrying", "Te llevas"), rec.closing) +
            "</div>") +
        '<div class="xs-nav" style="justify-content:center;border-top:0;gap:10px;flex-wrap:wrap;">' +
          '<button type="button" class="xs-next" id="xsAgain">' + esc(T("Add another", "Agregar otra")) + "</button>" +
          '<button type="button" class="xs-ghost" id="xsBye">' + esc(T("Done", "Listo")) + "</button>" +
        "</div>" +
      "</div></div>";
    if (typeof showScreen === "function") showScreen("screen-exit-slip");
    /* the letter's promise, every audience: after a completed submission,
       the once-ever home-screen offer */
    try { if (window.aogOfferA2HS) setTimeout(window.aogOfferA2HS, 900); } catch (e) {}
    var ag = el("xsAgain");
    if (ag) ag.addEventListener("click", function () {
      XS.step = 0; XS.a = {}; XS.open = {};
      render();
    });
    var by = el("xsBye");
    if (by) by.addEventListener("click", function () {
      if (typeof resetToStart === "function") resetToStart();
      else if (typeof showScreen === "function") showScreen("screen-welcome");
    });
    return true;
  }

  /* ================================================================ the wire
     Same discipline as the check-in's, for the same reasons: cors first so
     the reply can be read; a CORS failure means the POST WAS delivered and
     only the reply was blocked, so it is never re-sent — re-sending is the
     only way to make a duplicate row; genuinely offline keeps it queued. */
  function queueGet() { return jload(XQ, []); }
  function queuePush(rec) { var q = queueGet(); q.push(rec); jsave(XQ, q); }
  function queueDrop(rec) {
    jsave(XQ, queueGet().filter(function (r) {
      return !(r.timestamp === rec.timestamp && r.studentId === rec.studentId);
    }));
  }
  function payloadFor(rec) {
    var d = destination();
    var p = { action: "exitslip", passcode: d.key, _backendAuth: d.key };
    Object.keys(rec).forEach(function (k) { p[k] = rec[k] == null ? "" : rec[k]; });
    return p;
  }
  function sync(rec) {
    var d = destination();
    if (!d.url || !d.key) return Promise.resolve(false);
    return fetch(d.url, {
      method: "POST", mode: "cors", redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payloadFor(rec))
    }).then(function (r) { return r.text(); }).then(function (txt) {
      var out = null;
      try { out = JSON.parse(txt); } catch (e) {}
      if (out && out.ok) { queueDrop(rec); return "sent"; }
      /* The script answered and said no — almost always an Apps Script that
         predates the exit-slip branch. Waiting for the network will not fix
         that, so do not tell the teacher that it will. */
      return "rejected";
    }).catch(function () {
      /* ⚠⚠ .30dj · THIS USED TO ANSWER "sent" AND DELETE THE ROW IN THE SAME
         BREATH. The reasoning was that a rejected fetch means the POST was
         delivered and only the CORS reply was blocked, so a re-send could only
         make a duplicate. That is ONE cause out of many and not the common one
         on a school network: a filtered host, a captive portal, a proxy that
         drops the redirect to script.googleusercontent.com, a reset connection
         and a DNS failure all reject in exactly the same shape — and
         navigator.onLine is TRUE for every one of them, because it means "this
         device has a network interface", never "the internet answered". So a
         student read "Sent to your teacher ✓" for a row no Sheet ever received,
         and the only copy of it was deleted as it was read.
         It stays queued now and is retried. A retry that duplicates is
         survivable — every pull path merges on studentId + timestamp, and the
         timestamp is fixed when the record is MADE, not when it is sent, so a
         second copy of the same row lands on the same key and is dropped. A
         row that was thrown away is not survivable. Keep the row. */
      return "offline";
    });
  }
  function flush() {
    if (navigator.onLine === false) return Promise.resolve();
    var q = queueGet();
    if (!q.length) return Promise.resolve();
    return q.reduce(function (p, rec) {
      return p.then(function () { return sync(rec); });
    }, Promise.resolve());
  }
  window.addEventListener("online", function () { try { flush(); } catch (e) {} });
  /* .30dj · A DEVICE THAT NEVER WENT OFFLINE NEVER FIRES "online". Now that a
     failed send stays queued, the only thing that emptied this queue was a
     transition a Chromebook on a flaky-but-connected network has no reason to
     make, so a held row would have waited for ever. Retry when the tab comes
     back to the front, which is what actually happens between one period and
     the next. Cheap: it returns immediately on an empty queue. */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") { try { flush(); } catch (e) {} }
  });

  /* =============================================================== the way in */
  function open(freshOnly) {
    XS = { step: 0, studentId: lockedStudent() || "", a: {}, sched: null, open: {} };
    if (XS.studentId) {
      XS.sched = scheduleFor(XS.studentId);
      if (!freshOnly && offerTodays(XS.studentId)) {
        if (typeof aogSetHash === "function") aogSetHash("exit-slip");
        return;
      }
    }
    render();
    if (typeof showScreen === "function") showScreen("screen-exit-slip");
    if (typeof aogSetHash === "function") aogSetHash("exit-slip");
  }
  window.aogOpenExitSlip = function () { open(false); };

  function routeHash() {
    var h = (location.hash || "").replace(/^#/, "").trim().toLowerCase();
    if (h === "exit-slip" || h === "exitslip" || h === "exit") {
      if (!el("screen-exit-slip") || !XS.studentId) open(false);
      else { render(); if (typeof showScreen === "function") showScreen("screen-exit-slip"); }
      return true;
    }
    return false;
  }
  window.addEventListener("hashchange", routeHash);

  function boot() {
    readSlipParams();
    if (isSlipLink()) open(false);
    else routeHash();
    flush();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  /* The original boot code reads sync=on + classId as "a student is
     arriving" and answers with startChoose(). This listener is registered
     later in the document so it runs after that one; the re-assert covers
     a late re-render. Same trick, same reason, as the check-in. */
  setTimeout(function () {
    if (isSlipLink() && !document.querySelector("#screen-exit-slip.active")) boot();
  }, 260);

  /* The public surface. The teacher view and the harness both read through
     this; nothing else reaches into the store directly. */
  /* ===================================================================
     §13 · §14 · PULLING SLIPS BACK FROM THE SHEET        2026-08-27

     Until this existed the teacher panel read THIS DEVICE ONLY, and said
     so honestly — but honest is not the same as useful. A class that
     finishes the slip on their own phones produced a panel that was
     correct and empty, and §14 is blunt about what that costs:

         PULL MUST BE A FIRST-CLASS EDUCATOR ACTION. Do not bury it.

     ⚠ READING IS GATED BY ADMIN_PULL_KEY, NEVER BY THE WRITE KEY. The
     write key is published inside a page every student loads; if it
     could also read, any child with the developer tools open could
     download every classmate's day. Same rule, same gate, same reason as
     the screener pull and the check-in pull. This is not a place to be
     convenient.

     ⚠ PULLING TWICE MUST NOT MAKE A SECOND COPY. Rows are keyed on
     studentId + timestamp — the same key the check-in merge uses — so a
     teacher can press it as often as they like. §24's counts are read
     straight off these records; a duplicate would not look like a bug,
     it would look like a student who said the same thing twice.
     =================================================================== */
  function deviceReadKey() {
    try { return (localStorage.getItem("aog.sync.key") || "").trim(); } catch (e) { return ""; }
  }

  function mergeRemoteSlips(rows) {
    var st = store();
    if (!st.logs) st.logs = {};
    var seen = {};
    Object.keys(st.logs).forEach(function (sid) {
      Object.keys(st.logs[sid] || {}).forEach(function (d) {
        (st.logs[sid][d] || []).forEach(function (r) {
          /* .30dl -- NORMALIZED, because the incoming side of this compare
             already is (codeKey, below) and a bucket written in another case
             could never have matched it. The stored key is not rewritten. */
          seen[codeKey(sid) + "|" + String(r.timestamp || "")] = 1;
        });
      });
    });
    /* .30dl -- a slip the teacher removed does not come back down. */
    var forget = goneSet();
    var added = 0;
    (rows || []).forEach(function (r) {
      var sid = codeKey(r && r.studentId);
      if (!sid || sid === "SELFTEST") return;
      var k = sid + "|" + String(r.timestamp || "");
      if (seen[k] || forget[k]) return;
      seen[k] = 1;
      var date = String(r.date || "").slice(0, 10) || todayISO();
      /* .30cy — normalize the record's own date, not only the bucket key:
         a Sheet cell serialized as a full ISO timestamp otherwise walks
         into every reader downstream (the goal card printed 8/NaN off
         one). Same family as the 1899 trap. */
      r.date = date;
      if (!st.logs[sid]) st.logs[sid] = {};
      if (!st.logs[sid][date]) st.logs[sid][date] = [];
      /* Marked so a reader can always tell a row that came back from the
         Sheet from one this device wrote. Nothing renders differently on
         it today; the flag is there so that when something needs to, the
         answer is already in the record rather than guessed later. */
      r.pulled = true;
      st.logs[sid][date].push(r);
      added++;
    });
    if (added) jsave(XKEY, st);
    return added;
  }

  var XPULLED = "aog.exit.pulled";
  function lastPulled() { try { return localStorage.getItem(XPULLED) || ""; } catch (e) { return ""; } }
  function markPulled() { try { localStorage.setItem(XPULLED, new Date().toISOString()); } catch (e) {} }

  window.aogPullExitSlips = function () {
    var d = destination();
    var key = deviceReadKey();
    if (!d.url) {
      return Promise.resolve({ ok: false, error: T(
        "This is a local-only copy — no central sheet is configured.",
        "Esta es una copia solo local — no hay hoja central configurada.") });
    }
    if (!key) {
      return Promise.resolve({ ok: false, error: T(
        "This computer isn’t connected for reading yet. Set up ▸ Connect your Sheet, and put your ADMIN_PULL_KEY in the Passcode box.",
        "Esta computadora aún no está conectada para leer. Configurar ▸ Conecta tu Hoja y pon tu ADMIN_PULL_KEY en el campo de contraseña.") });
    }
    return fetch(d.url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "pullExitSlips", passcode: key })
    }).then(function (r) { return r.json(); }).then(function (out) {
      if (out && out.error) return { ok: false, error: String(out.error) };
      /* ⚠ AN OLDER SCRIPT ANSWERS 200 WITH NOTHING USEFUL. Say which thing
         is out of date and exactly what fixes it — "try again later" is a
         lie when the answer is "paste the new .gs and redeploy". */
      if (!out || !("exitSlips" in out)) {
        return { ok: false, error: T(
          "This Sheet’s script can’t send exit slips back yet. Paste the updated Apps Script, redeploy it as a NEW version, then try again.",
          "El script de esta hoja aún no puede devolver las salidas. Pega el Apps Script actualizado, vuelve a desplegarlo como NUEVA versión e inténtalo otra vez.") };
      }
      var rows = out.exitSlips || [];
      var added = mergeRemoteSlips(rows);
      markPulled();
      return { ok: true, count: rows.length, added: added };
    }).catch(function () {
      return { ok: false, error: T(
        "Couldn’t reach the sheet. Confirm the Web App is deployed to “Anyone” and try again.",
        "No se pudo conectar con la hoja. Confirma que la Web App esté desplegada para “Cualquiera” e inténtalo de nuevo.") };
    });
  };

  /* ===================================================================
     §14b · REMOVING A SLIP                                  2026-09-01

     Jimmy, looking at his own panel: "How can we delete some of the exit
     slips. The tester and etx should not stay there and they are off the
     google sheet."

     A panel that can only ever grow is a panel a teacher stops reading.
     TESTER VERSION 2.0, TEST2, THS1 and REG1 are not children -- and every
     number on this screen is read straight off these rows, so a demo run
     does not merely clutter the list, it moves the six cards, every
     denominator and the pattern read with it.

     THREE RULES, and each one is a fault this project already paid for
     somewhere else:

     1 - IT IS UNDOABLE. removeSlips hands back the exact records it took,
         with the day and the position each sat at, and restoreSlips puts
         them back there. [[aog-send-lied]] is blunt about the asymmetry:
         a duplicate is survivable, a deleted row is not.

     2 - IT SURVIVES THE NEXT PULL. A row still sitting in the Sheet would
         otherwise come straight back down, and the button would look
         broken. So a removal leaves a TOMBSTONE -- studentId|timestamp,
         the very key mergeRemoteSlips already de-duplicates on -- and the
         merge skips a key it has been told to forget. ⚠ NOTHING IN THE
         SHEET IS TOUCHED. This product has no business reaching into
         somebody else's spreadsheet; a teacher who wants the row gone
         from there deletes it there, and the panel says so in words.

     3 - IT TAKES THE QUEUED COPY WITH IT. A slip that has not reached the
         Sheet yet would otherwise be uploaded AFTER the teacher removed
         it -- the one direction nothing here can undo. Same shape as
         AOGHomeCi.removeStudent. ⚠ THIS IS NOT THE .30dj FAULT: that was
         a row deleted because a fetch REJECTED, on a guess about the
         network. A row deleted because a human pressed Remove twice is a
         decision, and the difference is the whole point.

     ⚠ aog.exit.removed.v1 is NOT matched by PV_KEEP, so the full backup
     already carries it and Erase everything already takes it out --
     [[aog-backup-symmetry]] exists because a store that quietly escapes
     both is how a delete stops meaning delete.
     =================================================================== */
  var XGONE = "aog.exit.removed.v1";
  function goneList() { var a = jload(XGONE, []); return (a && a.slice) ? a.slice() : []; }
  function goneSet() { var s = {}; goneList().forEach(function (k) { s[String(k)] = 1; }); return s; }
  function goneSave(a) {
    /* A tombstone is a key and not a record, but a list that only ever grows
       is still a list that only ever grows. */
    jsave(XGONE, a.length > 4000 ? a.slice(a.length - 4000) : a);
  }
  /* ⚠ BOTH SPELLINGS, ALWAYS. The bucket a row lives in was uppercased on
     the way in while the row's own studentId keeps whatever the Sheet had,
     so a comparison that picks one of them is how one child became two
     entries in .30dj. Nothing is ever rewritten; only the compare is
     normalized. */
  function slipKeys(sid, r) {
    var ts = String((r && r.timestamp) || "");
    var a = codeKey(sid) + "|" + ts, b = codeKey(r && r.studentId) + "|" + ts;
    return a === b ? [a] : [a, b];
  }

  function removeSlips(keys) {
    var want = {};
    (keys || []).forEach(function (k) { if (k) want[String(k)] = 1; });
    var st = store(), took = [], marks = {};
    if (!st || !st.logs) return took;
    Object.keys(st.logs).forEach(function (sid) {
      var byDate = st.logs[sid] || {};
      Object.keys(byDate).forEach(function (d) {
        var keep = [];
        (byDate[d] || []).forEach(function (r, i) {
          var ks = slipKeys(sid, r);
          if (ks.some(function (k) { return want[k]; })) {
            took.push({ sid: sid, date: d, at: i, row: r });
            ks.forEach(function (k) { marks[k] = 1; });
          } else keep.push(r);
        });
        if (keep.length) byDate[d] = keep; else delete byDate[d];
      });
      if (!Object.keys(byDate).length) delete st.logs[sid];
    });
    if (!took.length) return took;
    jsave(XKEY, st);
    var g = goneList(), have = goneSet();
    Object.keys(marks).forEach(function (k) { if (!have[k]) { have[k] = 1; g.push(k); } });
    goneSave(g);
    /* rule 3 -- the copy that has not been uploaded yet goes too. */
    try {
      jsave(XQ, queueGet().filter(function (r) {
        return !slipKeys(r && r.studentId, r).some(function (k) { return marks[k]; });
      }));
    } catch (e) {}
    return took;
  }

  function restoreSlips(took) {
    var st = store(), back = 0, undo = {};
    if (!st.logs) st.logs = {};
    /* Lowest recorded position first, so an index taken before its
       neighbors were removed still lands where it was. */
    (took || []).slice().sort(function (a, b) { return (a.at || 0) - (b.at || 0); })
      .forEach(function (t) {
        if (!t || !t.row) return;
        if (!st.logs[t.sid]) st.logs[t.sid] = {};
        var arr = st.logs[t.sid][t.date] || (st.logs[t.sid][t.date] = []);
        var ks = slipKeys(t.sid, t.row);
        var dup = arr.some(function (r) {
          return slipKeys(t.sid, r).some(function (k) { return ks.indexOf(k) > -1; });
        });
        if (!dup) {
          arr.splice(Math.min(t.at == null ? arr.length : t.at, arr.length), 0, t.row);
          back++;
        }
        ks.forEach(function (k) { undo[k] = 1; });
      });
    if (back) jsave(XKEY, st);
    /* ⚠ A RESTORED SLIP MUST STOP BEING TOMBSTONED, or the next pull would
       take it away again and nobody would ever work out why. */
    goneSave(goneList().filter(function (k) { return !undo[String(k)]; }));
    return back;
  }

  function keysForStudent(sid) {
    var st = store(), want = codeKey(sid), out = [];
    Object.keys((st && st.logs) || {}).forEach(function (s) {
      if (codeKey(s) !== want) return;
      Object.keys(st.logs[s] || {}).forEach(function (d) {
        (st.logs[s][d] || []).forEach(function (r) {
          slipKeys(s, r).forEach(function (k) { out.push(k); });
        });
      });
    });
    return out;
  }

  window.AOGExitSlip = {
    open: window.aogOpenExitSlip,
    steps: function () { return visibleSteps().slice(); },
    stepCount: stepCount,
    all: function () { return store(); },
    forStudent: allSlips,
    today: todaysSlips,
    scheduleFor: scheduleFor,
    scheduleSource: scheduleSource,
    setSchedule: saveSchedule,
    forgetSchedule: forgetSchedule,
    subjects: function () { return SUBJECTS.slice(); },
    tr: trOption,
    trSubject: trSubject,
    flush: flush,
    pull: window.aogPullExitSlips,
    lastPulled: lastPulled,
    canPull: function () { return !!destination().url; },
    __merge: mergeRemoteSlips,
    /* .30dl -- removal. The teacher panel calls these; nothing else reaches
       into the store. remove() hands back what it took so the panel can
       offer Undo, and restore() is the only way a tombstone is lifted. */
    remove: removeSlips,
    restore: restoreSlips,
    keysFor: keysForStudent,
    removed: goneList,
    KEYS: { slips: XKEY, queue: XQ, schedules: XSCHED, removed: XGONE },
    /* test seams — the harness drives the flow without a mouse, and asserts
       the fold against the real box rather than against a guessed count */
    __state: function () { return XS; },
    __fitFold: function () { var x = el("screen-exit-slip"); if (x) fitFold(x); },
    __overflow: function () {
      var b = document.querySelector("#screen-exit-slip .xs-body");
      return b ? b.scrollHeight - b.clientHeight : 0;
    }
  };
})();
