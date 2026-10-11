
/* ═══════════════════════════════════════════════════════════════════════════
   THIS IS ME · the student's own page for their own IEP meeting
   Build 2026.08.29be · from the "Living Child Voice" handoff, the part of it
   that was true.

   The handoff asked for a system where the platform collects the evidence,
   THE CHILD OWNS THE VOICE, and the team gains understanding. It also asked
   for LLM endpoints, UUID ledgers and client-side-encrypted sync — things
   this app has deliberately never had. What survives contact with this
   codebase is the center of the idea, and it needs no server to be real:

     · a somatic check BEFORE the child is asked to reflect — regulation
       precedes cognition, and a dysregulated child is offered calm and a
       clean exit, never a form;
     · a ledger of statements where EVERY LINE passed through the child's
       hands — kept, reworded, made private, or taken off the page, and a
       suggestion declined does not come back;
     · deterministic suggestions built ONLY from words this device already
       stores because this student already tapped them (check-in: challenge,
       need · exit slip: goodMoment, hardWhy, roughMoment), each offered with
       its own provenance — which instrument, which day — so "did you say
       this?" is an answerable question. NOTHING IS GENERATED. There is no
       model anywhere in this block; the strongest guarantee against
       manufactured child voice is the absence of the machinery to
       manufacture it;
     · a printed page that renders ONLY lines the child kept, from a
       dedicated window ([[aog-print-window-pattern]]) that doubles as the
       on-screen deck for the meeting itself.

   ⚠ THE FOUR RULES THIS BLOCK MUST NOT BREAK
   ------------------------------------------
   1 · IT NEVER TOUCHES aog.iep.v1. A student building their page must never
       find an IEP goal, an aimline or an adult's record staring back — the
       same teacher-only gate One Story enforces. Goals on the page are what
       the child SAYS they want, typed or picked, never imported.
   2 · A SUGGESTION IS A QUESTION. Every chip is the child's own stored
       phrase offered back with its date. "Not me" is a full answer: the
       phrase goes into a declined map and is not offered again. The chip
       banks are KEYS from the check-in option banks, translated at render
       through AOGCheckinTr like the voice card does.
   3 · PRIVATE MEANS PRIVATE. A line marked private stays in this device's
       store and appears on no page, no print, no count shown to the team.
       The printed page does not even say how many private lines exist.
   4 · THE PAGE PRINTS FROM ITS OWN WINDOW, synchronously inside the click
       (iOS), and the canceled dialog leaves the window as the meeting deck.

   Store: aog.thisisme.v1 · { students: { CODE: { soma, somaAt, no:{},
   entries:[{ id, ts, day, sy, sec, pillar, text, st:'kept'|'private',
   src:{ kind:'chip'|'pick'|'typed', from, field, day, orig } }] } } }
   School year stamped at write time via the fail-open AOGYear contract.
   Delete this block and nothing else changes — the same contract as every
   block. It decorates #panel-iep from outside and rewrites nothing.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var KEY = "aog.thisisme.v1";

  function isEs() {
    try { if (typeof dashLang !== "undefined" && dashLang === "es") return true; } catch (e) {}
    return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es";
  }
  function T(en, es) { return isEs() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function tr(s) { try { return window.AOGCheckinTr ? window.AOGCheckinTr(s) : s; } catch (e) { return s; } }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function todayISO() {
    var d = new Date(), m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function shortD(iso) {
    var p = String(iso || "").slice(0, 10).split("-");
    return p.length === 3 ? (parseInt(p[1], 10) + "/" + parseInt(p[2], 10)) : String(iso || "");
  }

  /* ── AOG-TIM-PURE-START ──────────────────────────────────────────────────
     No DOM, no storage, no clock between these markers — the same testable
     shape as the SID and IEP pure regions. */

  /* The escape-hatch answers, the same set as the voice card's SKIP — THE
     TWO LISTS MOVE TOGETHER, in the same build, always. A student choosing
     "rather not say" answered honestly and is never offered that answer
     back as a fact about themselves.

     Completed in .30ck: the list had drifted (each build added only its own
     strings) and most escape rows leaked through. Lookup is normalized
     (timNorm: curly → straight apostrophe, trim, lowercase) so apostrophe
     spelling can never reopen the leak; keys are written pre-normalized.
     "Numb" stays out on purpose — an honest feeling, not a decline. The
     rough-moment gate rides in both spellings: 😊 before .30cj, bare after. */
  function timNorm(s) {
    return String(s == null ? "" : s).replace(/’/g, "'").trim().toLowerCase();
  }
  var TIM_SKIP = {
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

  function timSplit(v) {
    if (v == null) return [];
    return String(v).split(/\s*[|,]\s*/).map(function (x) { return x.trim(); })
      .filter(function (x) { return x && !TIM_SKIP[timNorm(x)]; });
  }

  /* Which stored field feeds which section of the page. goodMoment is the one
     field a student answered as "went well", so it is the ONLY strengths
     source — the voice card's feelings-are-not-verdicts ruling, kept.
     The exit slip's `response` feeds NOTHING here: "I gave up" offered back
     as growth would be the same mislabel that card already caught twice. */
  var TIM_FIELDS = [
    { sec: "str",  store: "checkin", f: "goodMoment",  fr: "checkin" },
    { sec: "str",  store: "exit",    f: "goodMoment",  fr: "slip" },
    { sec: "help", store: "checkin", f: "need",        fr: "checkin" },
    { sec: "hard", store: "checkin", f: "challenge",   fr: "checkin" },
    { sec: "hard", store: "exit",    f: "hardWhy",     fr: "slip" },
    { sec: "hard", store: "exit",    f: "roughMoment", fr: "slip" }
  ];

  /* rows: [{store:'checkin'|'exit', day:'YYYY-MM-DD', rec:{}}] for ONE student.
     Out: { str:[{text,from,field,day}], help:[…], hard:[…] } — each phrase
     once, wearing the LATEST day it was said, newest first, capped. */
  function timSuggest(rows, declined, cap) {
    cap = cap || 8;
    var bag = { str: {}, help: {}, hard: {} };
    (rows || []).forEach(function (r) {
      TIM_FIELDS.forEach(function (fd) {
        if (fd.store !== r.store) return;
        timSplit(r.rec && r.rec[fd.f]).forEach(function (phrase) {
          var k = fd.sec + "|" + phrase;
          if (declined && declined[k]) return;
          var hit = bag[fd.sec][phrase];
          if (!hit || String(r.day) > String(hit.day)) {
            bag[fd.sec][phrase] = { text: phrase, from: fd.fr, field: fd.f, day: String(r.day || "") };
          }
        });
      });
    });
    var out = {};
    Object.keys(bag).forEach(function (sec) {
      out[sec] = Object.keys(bag[sec]).map(function (p) { return bag[sec][p]; })
        .sort(function (a, b) { return a.day < b.day ? 1 : a.day > b.day ? -1 : (a.text < b.text ? -1 : 1); })
        .slice(0, cap);
    });
    return out;
  }

  /* Two honest facts about the record, for the growth section. Counted, never
     judged — "I checked in 31 mornings" is the child's own persistence and
     nobody's verdict. */
  function timFacts(rows) {
    var days = { checkin: {}, exit: {} };
    (rows || []).forEach(function (r) { if (days[r.store]) days[r.store][r.day] = 1; });
    return { checkin: Object.keys(days.checkin).length, exit: Object.keys(days.exit).length };
  }
  /* ── AOG-TIM-PURE-END ──────────────────────────────────────────────────── */

  /* The child's own rows, read the same way the resolver reads: normalized
     comparison, stored spelling untouched. Reads ONLY the two student-voice
     stores. Nothing here opens aog.iep.v1, aog.daily.v1 or any adult log. */
  function norm(s) { return String(s == null ? "" : s).toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function rowsFor(code) {
    var t = norm(code), out = [];
    [["checkin", "aog.checkin.student.v1"], ["exit", "aog.exit.v1"]].forEach(function (pair) {
      var logs = (jload(pair[1], {}) || {}).logs || {};
      Object.keys(logs).forEach(function (c) {
        if (norm(c) !== t) return;
        var days = logs[c] || {};
        Object.keys(days).forEach(function (d) {
          (days[d] || []).forEach(function (rec) {
            if (rec) out.push({ store: pair[0], day: d, rec: rec });
          });
        });
      });
    });
    return out;
  }

  /* ── the ledger store ── */
  function load() {
    var st = jload(KEY, { students: {} }) || { students: {} };
    if (!st.students) st.students = {};
    return st;
  }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  /* ⚠ .30dj · ONE CHILD, ONE ENTRY, WHATEVER CASE WAS TYPED. The builder opened
     from a link uppercases the code and this card did not, so "jr14" typed by
     the teacher and "JR14" arriving from the student's own device were two
     different children in this store — and the page the student had actually
     sent was invisible on the card the teacher was staring at. That is the same
     hazard the check-in share bug paid for once already. Matched on a
     NORMALIZED COPY; a key already on disk is never rewritten. */
  function timKey(st, code) {
    var want = String(code == null ? "" : code).trim().toUpperCase();
    if (!want) return "";
    var ks = Object.keys((st && st.students) || {});
    for (var i = 0; i < ks.length; i++) {
      if (String(ks[i]).trim().toUpperCase() === want) return ks[i];
    }
    return want;
  }
  function kid(st, code) {
    var k = timKey(st, code);
    var s = st.students[k];
    if (!s) { s = st.students[k] = { soma: "", somaAt: "", no: {}, entries: [] }; }
    if (!s.no) s.no = {};
    if (!s.entries) s.entries = [];
    return s;
  }
  function keptOf(s) { return (s.entries || []).filter(function (e) { return e.st === "kept"; }); }
  function privOf(s) { return (s.entries || []).filter(function (e) { return e.st === "private"; }); }

  /* ── the five sections, each mapped to its pillar the way the handoff maps
        them. The pillar rides on the entry so the ledger speaks the app's
        four-pillar language, and prints as a quiet chip. ── */
  var SECS = [
    { k: "str",  icon: "⭐", pillar: { en: "Identity",        es: "Identidad" },
      h: { en: "My strengths",           es: "Mis fortalezas" },
      sub: { en: "Things I am proud of and love doing", es: "Cosas que me enorgullecen y que me encanta hacer" } },
    { k: "help", icon: "🧰", pillar: { en: "Grace",           es: "Gracia" },
      h: { en: "What helps me learn",    es: "Qué me ayuda a aprender" },
      sub: { en: "Supports that keep me in my calm zone", es: "Apoyos que me mantienen en mi zona de calma" } },
    { k: "hard", icon: "🌧️", pillar: { en: "Grace",           es: "Gracia" },
      h: { en: "What is hard for me",    es: "Qué me cuesta" },
      sub: { en: "Things I need the adults to understand", es: "Cosas que necesito que los adultos entiendan" } },
    { k: "grow", icon: "🌱", pillar: { en: "Forgiveness",     es: "Perdón" },
      h: { en: "How I have grown",       es: "Cómo he crecido" },
      sub: { en: "Hard things I have moved past", es: "Cosas difíciles que ya superé" } },
    { k: "goal", icon: "🎯", pillar: { en: "Self-Compassion", es: "Autocompasión" },
      h: { en: "My goals and questions", es: "Mis metas y preguntas" },
      sub: { en: "What I want to work on next, and what I want to ask my team", es: "En qué quiero trabajar y qué quiero preguntar a mi equipo" } }
  ];
  function secOf(k) { for (var i = 0; i < SECS.length; i++) if (SECS[i].k === k) return SECS[i]; return SECS[0]; }

  /* Offers a child can tap instead of type. Offers, never defaults: nothing
     lands on the page except by the child's own tap. */
  var PICKS = {
    str: [
      { en: "Helping other people",        es: "Ayudar a otras personas" },
      { en: "Making and building things",  es: "Hacer y construir cosas" },
      { en: "Sports and moving my body",   es: "Deportes y mover mi cuerpo" },
      { en: "Drawing and art",             es: "Dibujar y el arte" },
      { en: "Telling stories",             es: "Contar historias" },
      { en: "Music",                       es: "La música" },
      { en: "Being a good friend",         es: "Ser buen amigo/a" }
    ],
    help: [
      { en: "Sitting where it is quieter",          es: "Sentarme donde hay menos ruido" },
      { en: "Headphones when it gets loud",          es: "Audífonos cuando hay mucho ruido" },
      { en: "Extra time to finish",                  es: "Tiempo extra para terminar" },
      { en: "A movement break",                      es: "Una pausa para moverme" },
      { en: "Directions one step at a time",         es: "Instrucciones paso a paso" },
      { en: "Seeing an example first",               es: "Ver un ejemplo primero" },
      { en: "A warning before plans change",         es: "Un aviso antes de que cambien los planes" },
      { en: "A quiet place to reset",                es: "Un lugar tranquilo para calmarme" }
    ],
    hard: [
      { en: "Loud or crowded rooms",       es: "Salones ruidosos o llenos" },
      { en: "Surprises and sudden changes", es: "Sorpresas y cambios repentinos" },
      { en: "Writing fast",                 es: "Escribir rápido" },
      { en: "Long reading",                 es: "Lecturas largas" },
      { en: "Working in big groups",        es: "Trabajar en grupos grandes" },
      { en: "Being rushed",                 es: "Que me apuren" }
    ],
    grow: [
      { en: "Something that was hard in the fall is easier now", es: "Algo que era difícil en otoño ahora es más fácil" },
      { en: "I ask for help more than I used to",                es: "Pido ayuda más que antes" },
      { en: "I use my calm-down plan more",                      es: "Uso más mi plan para calmarme" },
      { en: "I let go of a mistake instead of carrying it",      es: "Solté un error en vez de cargarlo" }
    ],
    goal: [
      { en: "I want to get better at asking for help",             es: "Quiero mejorar en pedir ayuda" },
      { en: "I want to get better at finishing my work",           es: "Quiero mejorar en terminar mi trabajo" },
      { en: "I want to stay calm when plans change",               es: "Quiero mantener la calma cuando cambian los planes" },
      { en: "I want to make more friends",                         es: "Quiero hacer más amigos" },
      { en: "I want my team to ask me before deciding about me",   es: "Quiero que mi equipo me pregunte antes de decidir sobre mí" }
    ]
  };

  /* ── session state. The ledger is on disk; this is only where the child IS. ── */
  var S = { code: "", open: false, step: "soma", sec: "str", chip: "", edit: "", typedFace: "", getMsg: "", home: false };

  /* ═══ THE FACE · one card at the bottom of the IEP panel ═══ */
  function mount() {
    var panel = el("panel-iep");
    if (!panel || el("aogTimCard")) return;
    var d = document.createElement("div");
    d.id = "aogTimCard";
    panel.appendChild(d);
    face();
  }

  /* ═══════════════════════ REMOVING A THIS IS ME PAGE  ·  .30ea
     Jimmy: "CAN YOU MAKE SURE SOMETHING LIKE THAT IS ON EVERYPAGE that
     allows information to be inputted?" This store had no removal at any
     level — not per entry, not per student. A tester page sat in Pages
     received forever.

     ⚠ THE UNIT IS ONE STUDENT'S PAGE, not one line. A line is kept or made
     private BY THE STUDENT inside the builder, and a teacher reaching in to
     delete one of a child's sentences is not a thing this product should be
     able to do. What a teacher may remove is a page that should not be here
     at all — a test, a wrong code, a child who left.

     ⚠⚠ THE TOMBSTONE GUARD DOES NOT LIVE WHERE THE OTHERS DO. A page comes
     back through timIngestRemote, and mergeRemoteIntoDaily hands the row to
     it and RETURNS before reaching the .30dp tombstone check — so a removed
     page would have arrived again on the very next pull. The guard is inside
     timIngestRemote itself. [[aog-removal-map]]

     ⚠ aog.thisisme.removed.v1 is NOT matched by PV_KEEP: the backup carries
     it and Erase everything takes it out. [[aog-backup-symmetry]] */
  var TGONE = "aog.thisisme.removed.v1";
  function timGoneList() { var a = jload(TGONE, []); return (a && a.slice) ? a.slice() : []; }
  function timGoneSet() { var o = {}; timGoneList().forEach(function (k) { o[String(k)] = 1; }); return o; }
  function timGoneSave(a) { try { localStorage.setItem(TGONE, JSON.stringify(a.length > 2000 ? a.slice(a.length - 2000) : a)); } catch (e) {} }
  function timGoneKey(c) { return String(c == null ? "" : c).trim().toUpperCase(); }
  function timRemove(codes) {
    var st = load(), took = [], marks = {};
    (codes || []).forEach(function (c) {
      var k = timKey(st, c);
      if (!k || !st.students[k]) return;
      took.push({ code: k, rec: st.students[k] });
      delete st.students[k];
      marks[timGoneKey(k)] = 1;
    });
    if (!took.length) return took;
    save(st);
    var g = timGoneList(), have = timGoneSet();
    Object.keys(marks).forEach(function (k) { if (!have[k]) { have[k] = 1; g.push(k); } });
    timGoneSave(g);
    return took;
  }
  function timRestore(took) {
    var st = load(), back = 0, undo = {};
    (took || []).forEach(function (t) {
      if (!t || !t.rec || !t.code) return;
      if (!st.students[t.code]) { st.students[t.code] = t.rec; back++; }
      undo[timGoneKey(t.code)] = 1;
    });
    if (back) save(st);
    /* ⚠ A RESTORED PAGE MUST STOP BEING TOMBSTONED, or the next pull refuses
       to bring it back and nobody ever works out why. */
    timGoneSave(timGoneList().filter(function (k) { return !undo[String(k)]; }));
    return back;
  }

  /* ── the Remove control ────────────────────────────────────────────────
     ⚠ THE ARMED STATE IS IN MODULE STATE, NOT ON THE DOM — face() rebuilds
     the whole card on every keystroke, so a data-armed attribute would not
     survive its own first press.
     ⚠ TWO PRESSES, NEVER A BROWSER DIALOG. ⚠ NO RED — this is a child's own
     page and a red control beside it would rank it. */
  var TIMDEL = { armed: "", said: "", last: null, t: 0 };
  function timDelBtn(c) {
    var armed = TIMDEL.armed === timGoneKey(c);
    return ' <button type="button" class="tim-del" data-timdel="' + esc(c) + '"' +
      ' style="font:inherit;font-size:10.5px;font-weight:700;cursor:pointer;border:1px solid var(--rule,#E4DAC5);' +
      'background:var(--card,#fff);color:var(--ink-soft,#5b6675);border-radius:999px;padding:1px 9px;margin-left:4px;">' +
      esc(armed ? T("Press again to remove", "Presiona otra vez para quitar") : T("Remove", "Quitar")) + "</button>";
  }
  /* ⚠ SAY THE SHEET IS UNTOUCHED, every time and in both languages. */
  function timRemovedLine(n) {
    return n === 1
      ? T("Removed 1 page. It will not come back the next time you check for pages. The row in your Google Sheet is untouched — delete it there if you want it gone from the Sheet too.",
          "Se quitó 1 página. No volverá la próxima vez que busques páginas. La fila de tu Hoja de Google queda intacta — bórrala allí si también quieres que desaparezca de la Hoja.")
      : T("Removed " + n + " pages. They will not come back the next time you check for pages. The rows in your Google Sheet are untouched — delete them there if you want them gone from the Sheet too.",
          "Se quitaron " + n + " páginas. No volverán la próxima vez que busques páginas. Las filas de tu Hoja de Google quedan intactas — bórralas allí si también quieres que desaparezcan de la Hoja.");
  }
  function timDelNote() {
    if (!TIMDEL.said) return "";
    return '<div class="tim-status" id="timDelSaid" style="border:1px solid var(--gold,#D9A33B);' +
      'border-radius:9px;background:var(--card,#fff);color:var(--ink,#22303F);padding:9px 12px;line-height:1.6;">' +
      esc(TIMDEL.said) +
      (TIMDEL.last ? ' <button type="button" id="timDelUndo" style="font:inherit;font-size:12px;font-weight:800;' +
        'cursor:pointer;border:1px solid var(--gold,#D9A33B);background:var(--card,#fff);color:var(--ink,#22303F);' +
        'border-radius:999px;padding:2px 12px;margin-left:8px;">' + esc(T("Undo", "Deshacer")) + "</button>" : "") +
      "</div>";
  }
  function timDisarm(repaint) {
    try { clearTimeout(TIMDEL.t); } catch (e) {}
    if (!TIMDEL.armed) return;
    TIMDEL.armed = "";
    if (repaint) { try { face(); } catch (e2) {} }
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#timDelUndo")) {
      var n = 0;
      try { n = timRestore(TIMDEL.last || []); } catch (x) {}
      TIMDEL.last = null;
      TIMDEL.said = n
        ? (n === 1 ? T("Put 1 page back.", "Se devolvió 1 página.")
                   : T("Put " + n + " pages back.", "Se devolvieron " + n + " páginas."))
        : T("Nothing to put back.", "No hay nada que devolver.");
      try { face(); } catch (x2) {}
      return;
    }
    var b = t.closest(".tim-del");
    if (!b) { timDisarm(true); return; }
    e.preventDefault(); e.stopPropagation();
    var c = b.getAttribute("data-timdel");
    if (!c) return;
    if (TIMDEL.armed === timGoneKey(c)) {
      timDisarm(false);
      var took = [];
      try { took = timRemove([c]) || []; } catch (x3) {}
      TIMDEL.last = took.length ? took : null;
      TIMDEL.said = took.length ? timRemovedLine(took.length) : T("Nothing to remove.", "No hay nada que quitar.");
      try { face(); } catch (x4) {}
      return;
    }
    TIMDEL.armed = timGoneKey(c);
    try { clearTimeout(TIMDEL.t); } catch (x5) {}
    TIMDEL.t = setTimeout(function () { timDisarm(true); }, 6000);
    try { face(); } catch (x6) {}
  });


  /* The only way in from outside this closure. The card is the door a teacher
     uses; this is the door the harness and the Remove-records screen use. */
  try {
    window.AOGThisIsMe = {
      remove: timRemove, restore: timRestore, removed: timGoneList,
      pages: function () { var st = load(); return Object.keys(st.students || {}); },
      KEYS: { store: KEY, removed: TGONE },
      __face: function () { try { face(); } catch (e) {} }
    };
  } catch (eX) {}

  function face() {
    var d = el("aogTimCard");
    if (!d) return;
    var st = load();
    var code = timKey(st, S.typedFace);
    var s = code && st.students[code];
    var kept = s ? keptOf(s).length : 0, priv = s ? privOf(s).length : 0;
    var known = false, near = [];
    try {
      if (code && window.AOGStudent) {
        known = !!window.AOGStudent.known(code);
        if (!known) near = window.AOGStudent.near(code) || [];
      }
    } catch (e) {}
    var h = '<h3>🎤 ' + esc(T("This Is Me — the student's own page for the meeting",
                              "Este soy yo — la página del estudiante para su reunión")) + "</h3>"
      + '<p class="tim-sub">' + esc(T(
        "Made from the student’s own words and choices, approved line by line by the student. Nothing goes on the page unless they keep it. Enter the student code, then hand them the device.",
        "Hecho con las propias palabras y elecciones del estudiante, aprobado línea por línea por él. Nada va en la página a menos que lo conserve. Escribe el código del estudiante y luego entrégale el dispositivo.")) + "</p>"
      + '<div class="tim-row">'
      + '<input type="text" id="aogTimCode" autocomplete="off" spellcheck="false" placeholder="' + esc(T("Student code — like JR14", "Código del estudiante — como JR14")) + '" value="' + esc(S.typedFace) + '" aria-label="' + esc(T("Student code", "Código del estudiante")) + '">'
      + '<button type="button" class="tim-btn" data-tim="open"' + (code ? "" : " disabled") + ">"
      + esc(T("Open the builder", "Abrir el constructor")) + "</button>"
      + '<button type="button" class="tim-btn gh" data-tim="link"' + (code ? "" : " disabled") + ">"
      + esc(T("Copy link for their device", "Copiar enlace para su dispositivo")) + "</button>"
      + (kept ? '<button type="button" class="tim-btn gh" data-tim="print">' + esc(T("Print / present the page", "Imprimir / presentar la página")) + "</button>" : "")
      + "</div>";
    if (code && !known && near.length) {
      h += '<div class="tim-near">' + esc(T("No records under this spelling. Did you mean", "No hay registros con esta escritura. ¿Quisiste decir"))
        + " " + near.map(function (c) { return '<button type="button" data-tim="near" data-c="' + esc(c) + '">' + esc(c) + "</button>"; }).join(" ") + "?</div>";
    }
    /* ═══ .30dj · WHAT ACTUALLY ARRIVED ═══
       This card could count lines and could not say where one of them came
       from. A page the student built on their OWN device and sent is the whole
       point of the link, and nothing on this screen ever said one had landed —
       so the only way to answer "did it come through?" was to type a code and
       read a number that would have gone up just the same if the teacher had
       typed the lines here themselves.
       `sentTs` is written by the pull's ingest and by nothing else, so its
       presence IS the answer, and the date beside it is the child's send, not
       this computer's clock. Codes and dates only: no names, and not one word
       of what the page says. The page is read in the builder or on the printed
       sheet, by the person whose page it is. */
    var inbox = [];
    try {
      var all = st.students || {};
      Object.keys(all).forEach(function (c2) {
        var r2 = all[c2];
        /* .30eq · a page sent from the family door is the family's, and it
           lists on the family page (Family → My Voice), not here. Typing
           the code still opens it — it is filed, not hidden. */
        if (r2 && r2.sentTs && r2.sentFrom !== "home") inbox.push({ c: c2, ts: String(r2.sentTs), n: keptOf(r2).length });
      });
      inbox.sort(function (a, b) { return a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0; });
    } catch (eIn) {}
    if (s && s.sentTs) {
      h += '<div class="tim-status">📥 ' + (s.sentFrom === "home"
        ? esc(T("This page was sent to the family and lives on the Family page (Family → My Voice) · ", "Esta página se envió a la familia y vive en la página de Familia (Familia → Mi voz) · ")) + esc(shortD(s.sentTs))
        : esc(T("Received from their own device on ", "Recibido desde su propio dispositivo el "))
          + esc(shortD(s.sentTs)) + " · " + kept + " " + esc(T("lines", "líneas"))) + "</div>";
    }
    h += timDelNote();
    h += '<div class="tim-near">'
      + (inbox.length
          ? esc(T("Pages received: ", "Páginas recibidas: "))
            + inbox.map(function (x) {
                return '<button type="button" data-tim="near" data-c="' + esc(x.c) + '">' + esc(x.c)
                  + " · " + esc(shortD(x.ts)) + " · " + x.n + "</button>" + timDelBtn(x.c);
              }).join(" ")
          : esc(T("No page has come back from a student device yet.",
                  "Todavía no ha llegado ninguna página desde el dispositivo de un estudiante.")))
      + ' <button type="button" data-tim="get">' + esc(T("Check for pages", "Buscar páginas")) + "</button>"
      + (S.getMsg ? '<div class="tim-status">' + esc(S.getMsg) + "</div>" : "")
      + "</div>";
    if (s) {
      h += '<div class="tim-status">' + esc(T("This page so far: ", "Esta página hasta ahora: ")) + kept + " "
        + esc(T("lines kept", "líneas conservadas"))
        + (priv ? " · " + priv + " " + esc(T("private (never printed)", "privadas (nunca se imprimen)")) : "") + "</div>";
    }
    d.innerHTML = h;
    var inp = el("aogTimCode");
    if (inp) inp.addEventListener("input", function () { S.typedFace = inp.value.trim(); face(); keepCaret(inp); });
  }
  function keepCaret(inp) {
    var again = el("aogTimCode");
    if (again && again !== inp) { again.focus(); try { again.setSelectionRange(again.value.length, again.value.length); } catch (e) {} }
  }

  /* ═══ THE SESSION OVERLAY ═══ */
  /* .30db · iOS scrolls the page BEHIND a fixed overlay (rubber-banding it
     sideways when anything inside is a pixel too wide). While the session
     overlay is up, the body is pinned in place and put back exactly where it
     was on close. overscroll-behavior in the CSS covers browsers that honor
     it; this covers the rest. */
  var bodyLockY = 0, bodyLocked = false;
  function lockBody() {
    if (bodyLocked) return; bodyLocked = true;
    try {
      bodyLockY = window.scrollY || window.pageYOffset || 0;
      var s = document.body.style;
      s.position = "fixed"; s.top = (-bodyLockY) + "px";
      s.left = "0"; s.right = "0"; s.width = "100%"; s.overflow = "hidden";
    } catch (e) {}
  }
  function unlockBody() {
    if (!bodyLocked) return; bodyLocked = false;
    try {
      var s = document.body.style;
      s.position = ""; s.top = ""; s.left = ""; s.right = ""; s.width = ""; s.overflow = "";
      window.scrollTo(0, bodyLockY);
    } catch (e) {}
  }
  /* AOG-TIM-WHO-V1 · opens the overlay with no child named yet. */
  function openWho() {
    S.code = ""; S.open = true; S.step = "who"; S.sec = "str"; S.chip = ""; S.edit = "";
    paint();
    setTimeout(function () { var w = el("aogTimWho"); if (w) { try { w.focus(); } catch (e) {} } }, 60);
  }
  /* .30em · the family hub's My Voice chip opens this same who-door
     (AOG-TIM-WHO-V1) — exposed so aog-fam-dest can call it without a
     reload. The overlay paints over whatever page called it and closes
     back onto it, which is what lets /family offer the child's page
     without ever landing anyone on a dashboard. */
  /* .30en · the opener now carries WHERE it was opened from: the family
     hub passes { home: true } and the builder speaks to the parent(s);
     every other door leaves it false and nothing about school changes. */
  try { window.aogTimOpenWho = function (opts) { S.home = !!(opts && opts.home); openWho(); }; } catch (e) {}

  function openSession(code) {
    /* .30dj · the link door already uppercased and this one did not, which is
       half of how one child became two entries. kid() now resolves either
       spelling onto the key already on disk, so nothing existing is stranded. */
    S.code = String(code == null ? "" : code).trim().toUpperCase(); S.open = true; S.step = "soma"; S.sec = "str"; S.chip = ""; S.edit = "";
    paint();
  }

  /* ═══════════ THE LINK DOOR · 2026-08-30 ═══════════
     "It should work like all the rest of the reflections." A This Is Me link
     (?thisisme=1&sid=CODE) opens the builder directly on whatever device
     opens it — a student's own Chromebook, most usefully, where their own
     check-in words already live and feed the suggestion chips. NOTHING ELSE
     CHANGES: the page still lives only on the device that built it, still
     never syncs, and still travels only by the student presenting or
     printing it. The sid arrives through the same layer every other link
     uses (a code in a link is a write credential, never a read one — and the
     builder's did-you-say-this chips honor that by reading only what THIS
     device holds). */
  function linkFlag() {
    try {
      var v = String(new URLSearchParams(location.search).get("thisisme") || "").toLowerCase();
      if (v === "1" || v === "on" || v === "true" || v === "yes") return true;
    } catch (e) {}
    try { return sessionStorage.getItem("aog.launch.thisisme") === "1"; } catch (e) { return false; }
  }
  (function bootFromLink() {
    if (!linkFlag()) return;
    try { sessionStorage.setItem("aog.launch.thisisme", "1"); } catch (e) {}
    var sid = "";
    try { sid = (window.aogLinkedStudent && window.aogLinkedStudent()) || sessionStorage.getItem("aog.launch.sid") || ""; } catch (e) {}
    var go = function () {
      S.home = false;
      if (sid) { openSession(String(sid).trim().toUpperCase()); return; }
      /* .30dt · NO SID ON THE LINK IS NOW A DOOR, NOT A DEAD END. It used to
         fall through to the normal page, which is the teacher's dashboard —
         so the only usable This Is Me link was a per-student one, and
         handing out thirty links meant handing out thirty codes. The student
         types their own code here (AOG-TIM-WHO-V1) and nothing is written
         until they do. A link that names nobody still names nobody. */
      openWho();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(go, 700); });
    else setTimeout(go, 700);
    /* late re-assert: other boot layers may route the tab; the overlay wins */
    setTimeout(function () { if (!S.open) go(); }, 1800);
  })();
  function closeSession() {
    S.open = false;
    var ov = el("aogTimOv");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    unlockBody();
    face();
  }

  function paint() {
    if (!S.open) return;
    var ov = el("aogTimOv");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "aogTimOv";
      lockBody();
      ov.setAttribute("role", "dialog");
      ov.setAttribute("aria-modal", "true");
      ov.setAttribute("aria-label", T("This Is Me builder", "Constructor Este soy yo"));
      document.body.appendChild(ov);
    }
    ov.innerHTML = '<div class="tim-sheet">' + (S.step === "who" ? whoHead() : head()) +
      (S.step === "who" ? who() : S.step === "soma" ? soma() : S.step === "pause" ? pause() : S.step === "page" ? pageView() : build()) + "</div>";
    wire(ov);
  }

  /* ═══ AOG-TIM-WHO-V1 · A LINK THAT NAMES NOBODY  ·  .30dt ═══════════════
     Until this build a This Is Me link had to carry sid=CODE, because a link
     without one opened the app and stopped: bootFromLink had nothing to open
     the builder ONTO. So "send it to anyone" meant building one link per
     child and handing each of them a code — and a code in a link is a write
     credential, so thirty links is thirty credentials in thirty inboxes.

     A sid-less link now opens here instead, and the student types their own
     short code. One link works for a whole class and hands out nothing.

     ⚠ IT ASKS BEFORE THE SOMATIC GATE, NOT AFTER. The gate is the first
     thing the CHILD is asked about themselves; this is the door, and a door
     is not a question. Nothing is written to the store until openSession. */
  function whoHead() {
    return '<div class="tim-head"><h3>🎤 ' + esc(T("This Is Me", "Este soy yo")) + "</h3>"
      + '<span style="display:flex;gap:8px;flex-wrap:wrap;">'
      + '<button type="button" class="tim-x" data-tim="close">' + esc(T("Close", "Cerrar")) + "</button></span></div>";
  }
  function who() {
    return '<p class="tim-quiet">' + esc(T(
        "This page is yours. What is your short code?",
        "Esta página es tuya. ¿Cuál es tu código corto?")) + "</p>"
      + '<div style="margin:14px 0 6px;"><input type="text" id="aogTimWho" autocomplete="off" spellcheck="false"'
      + ' aria-label="' + esc(T("Your short code", "Tu código corto")) + '"'
      + ' placeholder="' + esc(T("for example JR14", "por ejemplo JR14")) + '"'
      /* ⚠⚠ NOT var(--field). IT DOES NOT RESOLVE ON THIS PAGE — the token is
         declared in a :root block this document does not apply, so
         var(--field,#fff) is WHITE IN BOTH THEMES and a source grep for the
         declaration passes while dark mode renders cream text on white at
         1.25:1. [[aog-contrast]] recorded that trap in .30dk against
         --field, --field-2 and --lock, and this build walked into it anyway.
         A real Chromium in dark mode is the only thing that found it.
         The box takes the sheet's own ground and earns its edge from a
         border that themes: --ink and --ink-soft BOTH flip correctly here,
         and both are measured every run by t126. */
      + ' style="font:inherit;font-size:20px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;'
      + 'padding:14px 16px;width:100%;max-width:320px;box-sizing:border-box;border-radius:12px;'
      + 'border:2px solid var(--ink-soft,#4E5A67);background:transparent;color:var(--ink,#16202B);"></div>'
      + '<div style="margin-top:10px;"><button type="button" class="tim-btn" data-tim="whogo">'
      + esc(T("That's me →", "Soy yo →")) + "</button></div>"
      + '<p class="tim-quiet">' + esc(T(
        "It’s the same code you use for your check-in: your initials and seat number. Not your full name.",
        "Es el mismo código de tu registro: tus iniciales y tu número de asiento. No tu nombre completo.")) + "</p>"
      + famList();
  }

  /* ── .30en · the parent's way in. Jimmy: "for the parent in family mode
     there is nowhere to fetch them, is there?" There wasn't. A page a child
     SENT TO THEIR PARENT(S) from this device now lists itself on this same
     door — in family mode only, and only pages whose child tapped Send
     (s.fam, stamped by the tap): a page merely built here is offered to
     nobody. These arrive automatically, cost the parent no code-typing, and
     never sync: the family door reads only what this device already holds. */
  function famList() {
    if (!S.home) return "";
    var st = load(), out = [];
    Object.keys(st.students || {}).forEach(function (c) {
      var s = st.students[c];
      if (!s || !s.fam) return;
      var n = keptOf(s).length;
      if (!n) return;
      out.push({ c: c, n: n, at: String(s.fam).slice(0, 10) });
    });
    out.sort(function (a, b) { return a.at < b.at ? 1 : -1; });
    /* .30er · NO RETAKE. Jimmy, after his three children finished on his iPad
       before .30eq shipped: "So my kids needs to retake it to show on the
       family page." No — the pages are already on this device; they just were
       not stamped as family pages, because the tap that stamps s.fam did not
       exist when they were built. This lists every page on THIS device that
       is not yet on the family page, each with one tap to add it — the child
       does not build anything again. (adopt = a page with kept lines and no
       s.fam. A page that is already family-stamped is in `out` above, not
       here.) */
    var adopt = [];
    Object.keys(st.students || {}).forEach(function (c) {
      var s = st.students[c];
      if (!s || s.fam) return;
      var n = keptOf(s).length;
      if (!n) return;
      adopt.push({ c: c, n: n });
    });
    adopt.sort(function (a, b) { return a.c < b.c ? -1 : 1; });
    if (!out.length && !adopt.length) return "";
    var h = "";
    if (out.length) {
      h += '<div class="tim-offer" style="margin-top:22px;">' + esc(T("Pages shared with this family", "Páginas compartidas con esta familia")) + "</div>"
        + '<div class="tim-chips">' + out.map(function (p) {
          return '<button type="button" class="tim-chip" data-tim="famopen" data-c="' + esc(p.c) + '">🎤 ' + esc(p.c)
            + '<span class="cd">' + esc(p.n + T(p.n === 1 ? " thing · " : " things · ", p.n === 1 ? " cosa · " : " cosas · ") + shortD(p.at)) + "</span></button>";
        }).join("") + "</div>"
        + '<p class="tim-quiet">' + esc(T("These live on this device only. Nothing arrives here from school.",
            "Viven solo en este dispositivo. Nada llega aquí desde la escuela.")) + "</p>";
    }
    if (adopt.length) {
      h += '<div class="tim-offer" style="margin-top:22px;">' + esc(T("A page your child already made", "Una página que tu hijo/a ya hizo")) + "</div>"
        + '<p class="tim-quiet" style="margin:0 0 8px;">' + esc(T(
            "Made on this device before the family page existed. No one has to make it again — add it here.",
            "Hecha en este dispositivo antes de que existiera la página de familia. Nadie tiene que volver a hacerla — agrégala aquí.")) + "</p>"
        + '<div class="tim-chips">' + adopt.map(function (p) {
          return '<button type="button" class="tim-chip" data-tim="famadd" data-c="' + esc(p.c) + '">➕ ' + esc(p.c)
            + '<span class="cd">' + esc(p.n + T(p.n === 1 ? " thing · add to our family page" : " things · add to our family page",
                                                p.n === 1 ? " cosa · agregar a nuestra página" : " cosas · agregar a nuestra página")) + "</span></button>";
        }).join("") + "</div>";
    }
    return h;
  }

  /* ⚠ .30hf OVERRIDES THE OLD RULING — Jimmy, 2026-09-05: "YES flip This
     is ME and daily check in to autosend too." A FINISHED page now sends
     itself: reaching the preview (See my page) or Save & close posts the
     kept lines when they have changed since the last successful send
     (s.autoSig, a cheap hash — set only on "sent", so offline/failed tries
     again at the next finish, never in a loop). What did NOT change: only
     lines they KEPT travel; keep-private lines and deletions never leave
     this device; FAMILY mode stays the child's own tap (that page belongs
     to the family's living room, not the teacher pipeline); and the Send
     button stays — a visible act on top of the automatic one.
     The button exists only once there is something kept to send.
     .30dv · IT LIVES AT THE BOTTOM NOW, not in the header. Jimmy: "The send to
     your teacher should be at the bottom." Sending is the LAST thing a student
     does and the header is the first thing they read, so the top of the sheet
     was offering the end of the task before the task. It is built here and
     rendered by build()'s footer, which is also the only step where a count of
     kept lines means anything. */
  function sendBtn() {
    var kept = 0;
    try { kept = keptOf(kid(load(), S.code)).length; } catch (e) {}
    if (!kept) return "";
    /* .30en · IN FAMILY MODE THE PAGE GOES TO THE PARENT(S). Jimmy: "change
       send to teacher to send to parent(s)." S.home rides in from the family
       hub's chip; the tap is still the child's own act and the pipeline is
       unchanged — what changes is who the sentence honestly names, and that
       in family mode the failure states stay calm, because the parent's copy
       is the local one (s.fam) and it already succeeded. */
    var sendLbl = S.sendState === "sending" ? T("Sending…", "Enviando…")
      : S.sendState === "sent" ? (S.home ? T("Sent to your parent(s) ✓", "Enviado a tus padres ✓") : T("Sent to your teacher ✓", "Enviado a tu maestro ✓"))
      /* .30dj · this state now means NOT DELIVERED, and says so. It used to be
         reachable only when the device knew it was offline; a failed send on a
         device that believes it is online lands here too, and "will send when
         online" would be a second small lie on top of the one just removed. */
      : S.sendState === "offline" ? (S.home ? T("Saved for your parent(s) here — will keep trying to send.", "Guardada aquí para tus padres — seguirá intentando enviarse.") : T("Not sent yet — saved here. Tap to try again.", "Aún no se envió — guardado aquí. Toca para intentar de nuevo."))
      : S.sendState === "rejected" ? (S.home ? T("Saved for your parent(s) on this device ✓", "Guardada para tus padres en este dispositivo ✓") : T("Couldn't send — show or print it instead", "No se pudo enviar — muéstralo o imprímelo"))
      : (S.home ? T("Send to my parent(s)", "Enviar a mis padres") : T("Send to my teacher", "Enviar a mi maestro"));
    return '<button type="button" class="tim-btn" data-tim="send"'
      + (S.sendState === "sending" ? " disabled" : "") + ">📤 " + esc(sendLbl) + "</button>";
  }

  /* ⚠ SAVE & CLOSE IS THE ONLY THING IN THE HEADER, AND IT STAYS THERE ON
     EVERY STEP. It is the way out of the somatic gate, the pause screen and
     the builder alike — the reason "Not today" and "Done for now" could both
     be removed in this build without ever trapping a student. */
  function head() {
    return '<div class="tim-head"><h3>🎤 ' + esc(T("This Is Me", "Este soy yo")) + " · " + esc(S.code) + "</h3>"
      + '<span style="display:flex;gap:8px;flex-wrap:wrap;">'
      + '<button type="button" class="tim-x" data-tim="close">' + esc(T("Save & close", "Guardar y cerrar")) + "</button></span></div>";
  }

  /* ── step 1 · the somatic gate. Regulation precedes cognition; a body that
        is not ready is offered calm and a clean exit, never a form. ── */
  function soma() {
    return '<p class="tim-quiet">' + esc(T(
        "This is your page. Before we start — how is your body right now?",
        "Esta página es tuya. Antes de empezar — ¿cómo está tu cuerpo ahora mismo?")) + "</p>"
      + '<div class="tim-big">'
      + '<button type="button" data-tim="soma" data-v="calm">🌊 ' + esc(T("Calm and ready", "Tranquilo y listo")) + "</button>"
      + '<button type="button" data-tim="soma" data-v="buzzing">⚡ ' + esc(T("Buzzing, fast, or on edge", "Acelerado, inquieto o al límite")) + "</button>"
      + '<button type="button" data-tim="soma" data-v="low">🪨 ' + esc(T("Low, heavy, or tired", "Bajo, pesado o cansado")) + "</button>"
      + "</div>"
      + '<p class="tim-quiet">' + esc(T("There is no wrong answer. This page can wait for you.",
                                        "No hay respuesta incorrecta. Esta página puede esperarte.")) + "</p>";
  }
  function pause() {
    return '<p class="tim-quiet"><strong>' + esc(T("That's real, and it matters more than this page.",
        "Eso es real, y importa más que esta página.")) + "</strong></p>"
      + '<p class="tim-quiet">' + esc(T(
        "Try this first: breathe in slowly while you count 4 … hold for 4 … let it out for 6. Do it three times. Then look around and quietly name three things you can see and one thing you can hear.",
        "Prueba esto primero: inhala lento contando 4 … sostén 4 … suelta en 6. Hazlo tres veces. Luego mira alrededor y nombra en silencio tres cosas que ves y una que escuchas.")) + "</p>"
      /* ⚠⚠ THERE IS NO "NOT TODAY" BUTTON HERE, AND THERE MUST NOT BE · .30dv
         Jimmy, seeing it on the pause screen: "We need to get rid of NOT TODAY
         and that's okay! absolutely not."

         It was built as an honest exit. On the screen it was something else: a
         SECOND EQUAL OFFER — a child who has just said their body is buzzing or
         heavy, shown an invitation to stop in the same size and weight as going
         on. That is not neutrality. Putting the door beside the work, at the
         moment a student is least regulated, is a recommendation.

         ⚠ THE STUDENT IS STILL NOT TRAPPED, and that is why this removal is
         safe: head() renders Save & close on every step including this one, so
         leaving costs one tap and writes nothing. What changed is that leaving
         is no longer OFFERED as the equal of staying. t127 asserts BOTH halves
         — that the button is gone, and that the way out is still there. */
      + '<div class="tim-big">'
      + '<button type="button" data-tim="soma" data-v="calm">🌊 ' + esc(T("I feel more ready now", "Ahora me siento más listo")) + "</button>"
      + "</div>";
  }

  /* ── step 2 · the builder ── */
  function build() {
    var st = load(), s = kid(st, S.code);
    var es = isEs();
    var sec = secOf(S.sec);
    var rows = rowsFor(S.code);
    var sugg = timSuggest(rows, s.no)[S.sec] || [];
    var facts = timFacts(rows);
    var mine = (s.entries || []).filter(function (e) { return e.sec === S.sec; });
    /* ⚠⚠ NOTHING MAY START WITH "OR" WHEN IT IS THE FIRST THING ON THE PAGE.
       .30dv, reading this screen as a 12-year-old would. Three of the four
       offers below were written assuming the one above it had rendered — but
       a student with no check-ins yet gets NEITHER of the first two, so the
       very first words on their page were "OR PICK ONE THAT SOUNDS LIKE YOU."
       Or what? To a seventh grader that is not a subtle copy problem, it reads
       as a page that is broken or missing something they were supposed to get.
       `shown` counts what has actually rendered above; each label asks. */
    var shown = 0;
    function orNot(firstEn, firstEs, orEn, orEs) {
      var f = (shown > 0);
      shown++;
      return T(f ? orEn : firstEn, f ? orEs : firstEs);
    }

    /* .30en · FIVE LOOK-ALIKE PILLS DO NOT SAY "FIVE PARTS" TO A CHILD.
       Jimmy's son, and a few students, never saw that there were five to
       pick from — even told beforehand. Each tab now wears its number, the
       number flips to a gold ✓ once that part has something on it, and the
       line under the row says which part of five this is. */
    var secIdx = 0; SECS.forEach(function (x, i) { if (x.k === S.sec) secIdx = i; });
    var h = '<div class="tim-secs" role="tablist">' + SECS.map(function (x, i) {
      var n = (s.entries || []).filter(function (e) { return e.sec === x.k; }).length;
      return '<button type="button" class="tim-sec" role="tab" aria-selected="' + (x.k === S.sec ? "true" : "false")
        + '" data-tim="sec" data-v="' + x.k + '"><span class="pn' + (n ? " done" : "") + '" aria-hidden="true">' + (n ? "✓" : (i + 1)) + "</span>"
        + x.icon + " " + esc(es ? x.h.es : x.h.en) + "</button>";
    }).join("") + "</div>";

    h += '<div class="tim-secsub"><strong>' + esc(T("Part " + (secIdx + 1) + " of 5", "Parte " + (secIdx + 1) + " de 5"))
      + "</strong> · " + esc(es ? sec.sub.es : sec.sub.en) + "</div>";

    /* the child's page so far, this section */
    if (mine.length) {
      h += '<ul class="tim-mine">' + mine.map(function (e) {
        if (S.edit === e.id) {
          return '<li><div class="t"><textarea id="aogTimEdit">' + esc(e.text) + "</textarea>"
            + '<div class="r" style="margin-top:7px;display:flex;gap:7px;">'
            + '<button type="button" class="tim-btn" data-tim="editsave" data-id="' + esc(e.id) + '">' + esc(T("Save my words", "Guardar mis palabras")) + "</button>"
            + '<button type="button" class="tim-ib" data-tim="editcancel">' + esc(T("Cancel", "Cancelar")) + "</button></div></div></li>";
        }
        var prov = "";
        if (e.src && e.src.kind === "chip") {
          prov = T("From my ", "De mi ") + (e.src.from === "slip" ? T("exit slip", "boleta de salida") : T("check-in", "registro"))
            + (e.src.day ? " · " + shortD(e.src.day) : "");
          if (e.src.orig && e.src.orig !== e.text) prov += " · " + T("reworded by me", "reescrito por mí");
        }
        return "<li><div class=\"t\">" + esc(e.text)
          + (e.st === "private" ? ' <span class="priv">🔒 ' + esc(T("private", "privado")) + "</span>" : "")
          + (prov ? '<span class="prov">' + esc(prov) + "</span>" : "") + "</div>"
          + '<button type="button" class="tim-ib" data-tim="edit" data-id="' + esc(e.id) + '">✏️ ' + esc(T("Reword", "Reescribir")) + "</button>"
          + '<button type="button" class="tim-ib" data-tim="priv" data-id="' + esc(e.id) + '">' + (e.st === "private" ? "🔓 " + esc(T("Put on page", "Poner en la página")) : "🔒 " + esc(T("Keep private", "Mantener privado"))) + "</button>"
          + '<button type="button" class="tim-ib" data-tim="rm" data-id="' + esc(e.id) + '">🗑 ' + esc(T("Take it off", "Quitarlo")) + "</button></li>";
      }).join("") + "</ul>";
    }

    /* your own words from this year — with the "did you say this?" ask */
    if (sugg.length) {
      h += '<div class="tim-offer">' + esc(orNot("Your own words from this year — tap one", "Tus propias palabras de este año — toca una",
                              "Your own words from this year — tap one", "Tus propias palabras de este año — toca una")) + "</div>";
      h += '<div class="tim-chips">' + sugg.map(function (g) {
        var k = S.sec + "|" + g.text;
        return '<button type="button" class="tim-chip" data-tim="chip" data-k="' + esc(k) + '">' + esc(tr(g.text))
          + '<span class="cd">' + esc((g.from === "slip" ? T("exit slip", "boleta") : T("check-in", "registro")) + (g.day ? " · " + shortD(g.day) : "")) + "</span></button>";
      }).join("") + "</div>";
      var open = null;
      sugg.forEach(function (g) { if (S.chip === S.sec + "|" + g.text) open = g; });
      if (open) {
        h += '<div class="tim-ask"><div class="q">' + esc(T("You said this. Does it belong on your page?", "Tú dijiste esto. ¿Va en tu página?"))
          + " <strong>“" + esc(tr(open.text)) + "”</strong></div><div class=\"r\">"
          + '<button type="button" class="tim-btn" data-tim="keep">✓ ' + esc(T("Keep it", "Lo conservo")) + "</button>"
          + '<button type="button" class="tim-btn gh" data-tim="reword">✏️ ' + esc(T("Say it my way", "Decirlo a mi manera")) + "</button>"
          + '<button type="button" class="tim-btn gh" data-tim="notme">✗ ' + esc(T("That's not me", "Eso no soy yo")) + "</button></div></div>";
      }
    }

    /* the growth facts — counted from this device, offered like any chip */
    if (S.sec === "grow" && (facts.checkin || facts.exit)) {
      var fs = [];
      if (facts.checkin) fs.push(T("I checked in " + facts.checkin + " days this year", "Me registré " + facts.checkin + " días este año"));
      if (facts.exit) fs.push(T("I filled out " + facts.exit + " exit slips this year", "Completé " + facts.exit + " boletas de salida este año"));
      h += '<div class="tim-offer">' + esc(orNot("Things that are already true about you", "Cosas que ya son ciertas de ti",
                              "Or things that are already true about you", "O cosas que ya son ciertas de ti")) + "</div><div class=\"tim-chips\">"
        + fs.map(function (f) { return '<button type="button" class="tim-chip" data-tim="fact" data-t="' + esc(f) + '">' + esc(f) + "</button>"; }).join("") + "</div>";
    }

    /* the quick picks */
    var picks = PICKS[S.sec] || [];
    h += '<div class="tim-offer">' + esc(orNot("Pick one that sounds like you", "Elige una que suene como tú",
                              "Or pick one that sounds like you", "O elige una que suene como tú")) + "</div>"
      + '<div class="tim-chips">' + picks.map(function (p) {
        return '<button type="button" class="tim-chip" data-tim="pick" data-t="' + esc(es ? p.es : p.en) + '">' + esc(es ? p.es : p.en) + "</button>";
      }).join("") + "</div>";

    /* free words */
    h += '<div class="tim-offer">' + esc(orNot("Say it in your own words", "Dilo con tus palabras",
                              "Or say it in your own words", "O dilo con tus palabras")) + "</div>"
      + "<textarea id=\"aogTimFree\" placeholder=\"" + esc(T("Type here…", "Escribe aquí…")) + "\"></textarea>"
      + '<div style="margin-top:8px;"><button type="button" class="tim-btn" data-tim="addfree">+ ' + esc(T("Add to my page", "Agregar a mi página")) + "</button></div>";

    /* .30en · the walk. A child who never notices the tabs still reaches
       every part: Next is the biggest thing at the bottom of each one, and on
       part five it becomes the door to the finished page. The tabs stay for
       the child who jumps around; nothing is required, nothing is forced. */
    h += '<div class="tim-step">'
      + (secIdx > 0
          ? '<button type="button" class="tim-btn gh" data-tim="prevsec">← ' + esc(T("Part " + secIdx, "Parte " + secIdx)) + "</button>"
          : "<span></span>")
      + (secIdx < SECS.length - 1
          ? '<button type="button" class="tim-btn" data-tim="nextsec">' + esc(T("Next · Part " + (secIdx + 2) + " of 5", "Siguiente · Parte " + (secIdx + 2) + " de 5")) + " →</button>"
          : '<button type="button" class="tim-btn" data-tim="seepage">' + esc(T("I'm finished — see my page", "Terminé — ver mi página")) + " →</button>")
      + "</div>";

    /* footer */
    var kept = keptOf(s).length, priv = privOf(s).length;
    h += '<div class="tim-foot"><span class="tim-count">'
      /* .30dv · "Your page has 3 lines" is how a writing teacher counts and
         not how a twelve-year-old does. They are THINGS they put there. And
         zero was a dead sentence at the exact moment a student needs a nudge:
         it now says what to do next instead of reporting an absence. */
      + (kept
          ? esc(kept + T(kept === 1 ? " thing on your page." : " things on your page.",
                         kept === 1 ? " cosa en tu página." : " cosas en tu página."))
          : esc(T("Nothing on your page yet — tap one above to start.",
                  "Nada en tu página todavía — toca una de arriba para empezar.")))
      + (priv ? " " + priv + esc(T(" private lines stay on this device only.", " líneas privadas se quedan solo en este dispositivo.")) : "")
      + '</span><span style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
      + '<button type="button" class="tim-btn gh" data-tim="seepage"' + (kept ? "" : " disabled") + ">👀 " + esc(T("See my page", "Ver mi página")) + "</button>"
      /* ⚠⚠ "DONE FOR NOW" IS GONE AND MUST NOT COME BACK · .30dv
         Jimmy: "Got rid of DONE FOR NOW." It was `data-tim="close"` — the
         SAME action as Save & close in the header, so the sheet carried two
         buttons that did one thing and sat them beside the two that do
         different things. A duplicate control is not a convenience; it makes a
         student read four buttons to find the two that matter. The header's
         Save & close is the one way out and it is on every step. */
      + sendBtn()
      + "</span></div>";
    return h;
  }

  /* ── .30en · the page, on the screen it was built on ─────────────────────
     Jimmy: "Once it is finished, the person has no way to view their results"
     and, naming the spec: "a preview page pops up on the device of whoever is
     taking [it] and they would then have the option of saving it, printing it
     etc." See my page used to open the print window — a pop-up, and on iPad a
     print dialog in the child's face. The page is now a step of this overlay:
     the same kept lines, grouped the way the printed sheet groups them, with
     Print and Send beside them and the way back one tap. Saving costs
     nothing: the page is already saved on this device, and the line at the
     bottom says so. Private lines are counted in one quiet sentence and
     never shown — this screen can be turned toward a parent or a teacher. */
  function pageView() {
    var st = load(), s = kid(st, S.code);
    var es = isEs();
    var kept = keptOf(s), priv = privOf(s).length;
    var h = "";
    if (!kept.length) {
      return '<p class="tim-quiet">' + esc(T("Nothing on your page yet — go back and tap or write what is true about you.",
            "Nada en tu página todavía — regresa y toca o escribe lo que es cierto de ti.")) + "</p>"
        + '<div class="tim-step"><span></span><button type="button" class="tim-btn" data-tim="backbuild">← '
        + esc(T("Back to my page", "Volver a mi página")) + "</button></div>";
    }
    h += '<p class="tim-quiet">' + esc(T(
        "This is your page. Every line on it was written, chosen, or approved by you.",
        "Esta es tu página. Cada línea fue escrita, elegida o aprobada por ti.")) + "</p>";
    h += '<div class="tim-page">' + SECS.map(function (x) {
      var lines = kept.filter(function (e) { return e.sec === x.k; });
      if (!lines.length) return "";
      return '<section><div class="sh"><span aria-hidden="true">' + x.icon + "</span><h4>" + esc(es ? x.h.es : x.h.en)
        + '</h4><span class="pil">' + esc(es ? x.pillar.es : x.pillar.en) + "</span></div><ul>"
        + lines.map(function (e) {
            var prov = "";
            if (e.src && e.src.kind === "chip") {
              prov = (es ? "de mi " : "from my ") + (e.src.from === "slip" ? (es ? "boleta de salida" : "exit slip") : (es ? "registro" : "check-in"))
                + (e.src.day ? " · " + shortD(e.src.day) : "");
            }
            return "<li>" + esc(e.text) + (prov ? ' <span class="pv">— ' + esc(prov) + "</span>" : "") + "</li>";
          }).join("") + "</ul></section>";
    }).join("") + "</div>";
    var missing = SECS.filter(function (x) { return !kept.some(function (e) { return e.sec === x.k; }); });
    if (missing.length) {
      h += '<p class="tim-quiet">' + esc(T("Parts with nothing yet: ", "Partes sin nada todavía: "))
        + esc(missing.map(function (x) { return (es ? x.h.es : x.h.en); }).join(" · "))
        + esc(T(". That is allowed — or go back and add to them.", ". Está permitido — o regresa y agrégales algo.")) + "</p>";
    }
    if (priv) {
      h += '<p class="tim-quiet">🔒 ' + esc(priv + T(priv === 1 ? " private line stays on this device and is not on this page."
                                                                : " private lines stay on this device and are not on this page.",
            priv === 1 ? " línea privada se queda en este dispositivo y no está en esta página."
                       : " líneas privadas se quedan en este dispositivo y no están en esta página.")) + "</p>";
    }
    h += '<p class="tim-quiet">💾 ' + esc(T("Your page is saved on this device.", "Tu página está guardada en este dispositivo.")) + "</p>";
    h += '<div class="tim-foot"><span style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
      + '<button type="button" class="tim-btn gh" data-tim="backbuild">← ' + esc(T("Keep building", "Seguir construyendo")) + "</button>"
      + '<button type="button" class="tim-btn gh" data-tim="print">🖨 ' + esc(T("Print my page", "Imprimir mi página")) + "</button></span>"
      + '<span style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' + sendBtn() + "</span></div>";
    return h;
  }

  /* ── entry operations. Every one is the child's own act. ── */
  function addEntry(sec, text, src, day) {
    text = String(text || "").trim();
    if (!text) return;
    var st = load(), s = kid(st, S.code);
    var today = todayISO();
    var sy = ""; try { sy = window.AOGYear ? window.AOGYear(today) : ""; } catch (e) {}
    var p = secOf(sec);
    s.entries.push({
      id: "e" + (new Date()).getTime() + Math.floor(Math.random() * 1e4),
      ts: (new Date()).toISOString(), day: today, sy: sy,
      sec: sec, pillar: p.pillar.en, soma: s.soma || "unchecked",
      text: text, st: "kept",
      src: src || { kind: "typed" }
    });
    save(st);
  }
  function withEntry(id, fn) {
    var st = load(), s = kid(st, S.code), hit = null;
    (s.entries || []).forEach(function (e) { if (e.id === id) hit = e; });
    if (hit) { fn(hit, s); save(st); }
  }

  /* ── the printed page. Its own window, its own stylesheet, synchronous
        inside the click; a canceled dialog leaves it up as the meeting deck.
        Renders ONLY lines the child kept. Private lines do not print and are
        not counted out loud. ── */
  function printDeck(code) {
    var es = isEs();
    var st = load(), s = st.students[code];
    var kept = s ? keptOf(s) : [];
    if (!kept.length) return;
    var w = window.open("", "_blank");
    if (!w) { alert(es ? "Permite las ventanas emergentes para ver la página." : "Please allow pop-ups to see the page."); return; }
    var sy = ""; try { sy = window.AOGYear ? window.AOGYear(todayISO()) : ""; } catch (e) {}
    var secsHtml = SECS.map(function (x) {
      var lines = kept.filter(function (e) { return e.sec === x.k; });
      if (!lines.length) return "";
      return '<section><div class="sh"><span class="ic">' + x.icon + "</span><h2>" + esc(es ? x.h.es : x.h.en)
        + '</h2><span class="pil">' + esc(es ? x.pillar.es : x.pillar.en) + "</span></div>"
        + '<div class="sub">' + esc(es ? x.sub.es : x.sub.en) + "</div><ul>"
        + lines.map(function (e) {
          var prov = "";
          if (e.src && e.src.kind === "chip") {
            prov = (es ? "de mi " : "from my ") + (e.src.from === "slip" ? (es ? "boleta de salida" : "exit slip") : (es ? "registro diario" : "check-in"))
              + (e.src.day ? " · " + shortD(e.src.day) : "");
          }
          return "<li>" + esc(e.text) + (prov ? ' <span class="pv">— ' + esc(prov) + "</span>" : "") + "</li>";
        }).join("") + "</ul></section>";
    }).join("");
    var title = (es ? "Este soy yo — " : "This Is Me — ") + code;
    var doc = '<!doctype html><html lang="' + (es ? "es" : "en") + '"><head><meta charset="utf-8"><title>' + esc(title) + "</title><style>"
      + "*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}"
      + "body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:34px auto;max-width:700px;padding:0 20px;}"
      + ".bh{border-bottom:3px solid #D9A33B;padding-bottom:12px;margin-bottom:6px;}"
      + ".bh h1{margin:0;font-size:30px;letter-spacing:.01em;}"
      + ".bh .who{font-size:13px;color:#46506E;margin-top:4px;}"
      + ".own{font-size:12.5px;color:#46506E;margin:10px 0 22px;max-width:60ch;line-height:1.5;}"
      + "section{margin:0 0 20px;page-break-inside:avoid;}"
      + ".sh{display:flex;align-items:baseline;gap:9px;}"
      + ".sh .ic{font-size:19px;}"
      + ".sh h2{margin:0;font-size:18px;}"
      + ".pil{font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#9a6f24;border:1px solid #D9A33B;border-radius:999px;padding:1px 8px;}"
      + ".sub{font-size:12px;color:#46506E;font-style:italic;margin:2px 0 8px;}"
      + "ul{margin:0;padding-left:22px;}"
      + "li{font-size:15.5px;line-height:1.6;margin-bottom:5px;}"
      + ".pv{font-size:11.5px;color:#8A92A6;}"
      + ".ft{border-top:1.5px solid #E4DAC5;margin-top:26px;padding-top:10px;font-size:11.5px;color:#46506E;line-height:1.5;}"
      + "@media screen{body{font-size:17px;}li{font-size:18px;}}"
      /* ⚠⚠ THE WAY BACK · .30dv · Jimmy: "the SEE MY PAGE doesn't allow you to
         go back." It could not: this deck is document.write-n into a BLANK
         window, so it has NO history entry and the browser's Back button is
         dead on arrival. A student who tapped See my page was simply stranded
         on their own page. These two controls are that way back — and they are
         `@media print` hidden, because the whole point of this window is that
         it doubles as the printed sheet. */
      + "@media print{.timnav{display:none !important;}}"
      + ".timnav{display:flex;gap:10px;margin:0 0 20px;}"
      + ".timnav button{font:inherit;font-size:14px;font-weight:700;cursor:pointer;padding:10px 16px;"
      + "border-radius:999px;border:2px solid #0A1E33;background:#0A1E33;color:#fff;}"
      + ".timnav button.gh{background:transparent;color:#0A1E33;}"
      + "</style></head><body>"
      + '<div class="timnav"><button type="button" id="timBack">← '
      + esc(es ? "Volver a mi página" : "Back to my page") + "</button>"
      + '<button type="button" class="gh" id="timPrint">🖨 '
      + esc(es ? "Imprimir" : "Print") + "</button></div>"
      + '<div class="bh"><h1>' + (es ? "ESTE SOY YO" : "THIS IS ME") + "</h1><div class=\"who\">" + esc(code)
      + (sy ? " · " + esc(sy) : "") + " · " + esc(shortD(todayISO())) + "</div></div>"
      + '<div class="own">' + esc(es
        ? "Cada línea de esta página fue escrita, elegida o aprobada por el estudiante, línea por línea. Las líneas con fecha vienen de sus propios registros de este año. Nada fue agregado por un adulto ni por ningún programa."
        : "Every line on this page was written, chosen, or approved by the student, one line at a time. Lines with a date come from the student's own check-ins this year. Nothing was added by an adult or by any software.") + "</div>"
      + secsHtml
      + '<div class="ft">' + esc(es
        ? "Hecho en Architecture of Grace · esta página vive en el dispositivo del estudiante hasta que el estudiante decide compartirla: leída en voz alta, mostrada en pantalla, impresa, o enviada a su maestro — la página terminada se envía sola, y el botón Enviar sigue siendo el acto propio del estudiante además. Solo las líneas que el estudiante conservó salen del dispositivo."
        : "Made in Architecture of Grace · this page lives on the student's device until the student chooses to share it — read aloud, shown on screen, printed, or sent to their teacher — the finished page sends itself, and the Send button remains the student's own act on top. Only the lines the student kept ever leave the device.") + "</div>"
      + "</body></html>";
    w.document.write(doc); w.document.close(); w.focus();
    /* ⚠ WIRED BEFORE print(), NEVER AFTER. window.print() BLOCKS on the modal,
       so anything queued behind it does not exist while the dialog is up — and
       a canceled dialog is exactly when a student is left looking at this
       window ([[aog-ios-print]]). No inline onclick: this document inherits
       the site's CSP and an inline handler would be refused silently. */
    try {
      var bk = w.document.getElementById("timBack");
      if (bk) bk.onclick = function () { try { w.close(); } catch (e2) {} };
      var pr = w.document.getElementById("timPrint");
      if (pr) pr.onclick = function () { try { w.print(); } catch (e3) {} };
    } catch (e1) {}
    try { w.print(); } catch (e) {}
  }

  /* ── .30hf: the automatic half of Send. djb2 over the kept lines — the
     page re-sends only when its content has actually changed. ── */
  function timHash(str) {
    var h = 5381, i;
    for (i = 0; i < str.length; i++) { h = ((h << 5) + h + str.charCodeAt(i)) | 0; }
    return String(h);
  }
  function timKeptLines(s) {
    return keptOf(s).map(function (e) {
      return { sec: e.sec, pillar: e.pillar || "", text: e.text, day: e.day || "", src: e.src || {} };
    });
  }
  function maybeAutoTim() {
    try {
      if (S.home) return;                    /* family mode stays the child's tap */
      if (S.sendState === "sending") return;
      var st = load(), s = kid(st, S.code);
      var lines = timKeptLines(s);
      if (!lines.length) return;
      var body = JSON.stringify(lines);
      var sig = timHash(body);
      if (s.autoSig === sig) return;         /* nothing new since the last send */
      if (typeof window.aogSendTimRow !== "function") return;
      S.sendState = "sending"; paint();
      window.aogSendTimRow({
        studentId: S.code,
        respondentId: S.code,
        source: "link",
        year: (window.AOGYear ? AOGYear(new Date().toISOString().slice(0, 10)) : ""),
        extraJson: JSON.stringify({ tim: 1, schema: "tim1", home: 0, soma: s.soma || "", n: lines.length, lines: lines })
      }).then(function (res) {
        if (res === "sent") {
          try { var st2 = load(), s2 = kid(st2, S.code); s2.autoSig = sig; save(st2); } catch (e2) {}
        }
        S.sendState = (res === "sent") ? "sent" : (res === "offline") ? "offline" : "rejected";
        paint();                              /* no-op if the overlay closed */
      }, function () { S.sendState = "rejected"; paint(); });
    } catch (e) {}
  }

  /* ── wiring. One delegated listener per paint; ids carried on data-. ── */
  function wire(ov) {
    ov.onclick = function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest("[data-tim]") : null;
      if (!b) return;
      var act = b.getAttribute("data-tim");
      if (act === "close") {
        /* .30hf: leaving IS finishing — kick the auto-send first (its async
           paints no-op once the overlay is gone), then close as always */
        maybeAutoTim();
        closeSession(); return;
      }
      /* AOG-TIM-WHO-V1 · the door. An empty box is not an error message, it
         is a box nobody has typed in yet — the field simply keeps focus. */
      if (act === "whogo") {
        var wi = el("aogTimWho");
        var wv = wi ? String(wi.value || "").trim().toUpperCase() : "";
        if (!wv) { if (wi) wi.focus(); return; }
        openSession(wv); return;
      }
      if (act === "send") {
        if (S.sendState === "sending") return;
        var st6 = load(), s6 = kid(st6, S.code);
        var lines6 = keptOf(s6).map(function (e) {
          return { sec: e.sec, pillar: e.pillar || "", text: e.text, day: e.day || "", src: e.src || {} };
        });
        if (!lines6.length) return;
        /* .30en · the tap lands ON the preview now — "a preview page pops up
           … and they would then have the option of saving it, printing it."
           The child watches Sending… become Sent ✓ next to Print. In family
           mode the same tap stamps s.fam, which is the parent's copy: local,
           automatic, and never synced — the family door lists it from here. */
        if (S.home) { s6.fam = (new Date()).toISOString(); save(st6); }
        S.step = "page";
        if (typeof window.aogSendTimRow !== "function") { S.sendState = "rejected"; paint(); return; }
        S.sendState = "sending"; paint();
        window.aogSendTimRow({
          studentId: S.code,
          respondentId: S.code,
          source: "link",
          year: (window.AOGYear ? AOGYear(new Date().toISOString().slice(0, 10)) : ""),
          /* .30eq · home rides IN the payload, not as a new column — the
             Sheet schema is untouched and old readers ignore it. It is how
             the receiving device knows this page belongs on the family
             door and not the IEP card. */
          extraJson: JSON.stringify({ tim: 1, schema: "tim1", home: S.home ? 1 : 0, soma: s6.soma || "", n: lines6.length, lines: lines6 })
        }).then(function (res) {
          if (res === "sent") {
            /* .30hf: a manual send satisfies the automatic one — same sig */
            try {
              var stS = load(), sS = kid(stS, S.code);
              sS.autoSig = timHash(JSON.stringify(lines6)); save(stS);
            } catch (eS) {}
          }
          S.sendState = (res === "sent") ? "sent" : (res === "offline") ? "offline" : "rejected";
          paint();
        }, function () { S.sendState = "rejected"; paint(); });
        return;
      }
      if (act === "soma") {
        var v = b.getAttribute("data-v");
        var st = load(), s = kid(st, S.code);
        s.soma = v; s.somaAt = (new Date()).toISOString(); save(st);
        S.step = (v === "calm") ? "build" : "pause";
        if (v === "calm") S.step = "build";
        paint(); return;
      }
      if (act === "sec") { S.sec = b.getAttribute("data-v"); S.chip = ""; S.edit = ""; paint(); return; }
      if (act === "nextsec" || act === "prevsec") {
        var ni = 0; SECS.forEach(function (x, i) { if (x.k === S.sec) ni = i; });
        ni += (act === "nextsec" ? 1 : -1);
        if (ni < 0) ni = 0; if (ni > SECS.length - 1) ni = SECS.length - 1;
        S.sec = SECS[ni].k; S.chip = ""; S.edit = "";
        paint();
        try { ov.scrollTop = 0; } catch (e0) {}
        return;
      }
      if (act === "seepage") {
        S.step = "page"; S.chip = ""; S.edit = ""; paint();
        try { ov.scrollTop = 0; } catch (e0b) {}
        maybeAutoTim();                      /* .30hf: the preview is the finish */
        return;
      }
      if (act === "backbuild") { S.step = "build"; paint(); try { ov.scrollTop = 0; } catch (e0c) {} return; }
      if (act === "famadd") {
        /* .30er · adopt a page already on this device onto the family page.
           Stamps s.fam (the same field a family-door Send sets), then opens
           the preview so the parent sees it worked — no rebuild, no retake.
           Nothing is sent and nothing about the page's contents changes. */
        var ac = String(b.getAttribute("data-c") || "").trim().toUpperCase();
        var sta = load(), ka = timKey(sta, ac), sa = sta.students[ka];
        if (sa && keptOf(sa).length) {
          sa.fam = sa.fam || (sa.sentTs || (new Date()).toISOString());
          save(sta);
          S.code = ka; S.home = true; S.step = "page"; S.sec = "str"; S.chip = ""; S.edit = "";
          paint(); try { ov.scrollTop = 0; } catch (e0) {}
        }
        return;
      }
      if (act === "famopen") {
        /* .30en · a parent opening a page the child shared. Straight to the
           preview: the somatic gate is for a child about to reflect, not for
           an adult about to read. */
        S.code = String(b.getAttribute("data-c") || "").trim().toUpperCase();
        S.step = "page"; S.sec = "str"; S.chip = ""; S.edit = "";
        paint(); try { ov.scrollTop = 0; } catch (e0d) {}
        return;
      }
      if (act === "chip") { S.chip = (S.chip === b.getAttribute("data-k")) ? "" : b.getAttribute("data-k"); paint(); return; }
      if (act === "keep" || act === "reword" || act === "notme") {
        var key = S.chip, phrase = key.slice(key.indexOf("|") + 1);
        var sugg = (timSuggest(rowsFor(S.code), (kid(load(), S.code)).no)[S.sec] || []);
        var g = null; sugg.forEach(function (x) { if (x.text === phrase) g = x; });
        if (!g) { S.chip = ""; paint(); return; }
        if (act === "notme") {
          var st2 = load(), s2 = kid(st2, S.code);
          s2.no[key] = 1; save(st2);
        } else if (act === "keep") {
          addEntry(S.sec, tr(g.text), { kind: "chip", from: g.from, field: g.field, day: g.day, orig: g.text });
          var st3 = load(), s3 = kid(st3, S.code); s3.no[key] = 1; save(st3);
        } else {
          addEntry(S.sec, tr(g.text), { kind: "chip", from: g.from, field: g.field, day: g.day, orig: g.text });
          var st4 = load(), s4 = kid(st4, S.code);
          s4.no[key] = 1;
          var last = s4.entries[s4.entries.length - 1];
          save(st4);
          S.edit = last ? last.id : "";
        }
        S.chip = "";
        paint(); return;
      }
      if (act === "fact" || act === "pick") {
        addEntry(S.sec, b.getAttribute("data-t"), { kind: act === "fact" ? "chip" : "pick" });
        paint(); return;
      }
      if (act === "addfree") {
        var ta = el("aogTimFree");
        if (ta && ta.value.trim()) { addEntry(S.sec, ta.value, { kind: "typed" }); paint(); }
        return;
      }
      if (act === "edit") { S.edit = b.getAttribute("data-id"); paint(); return; }
      if (act === "editcancel") { S.edit = ""; paint(); return; }
      if (act === "editsave") {
        var box = el("aogTimEdit");
        var id = b.getAttribute("data-id");
        if (box && box.value.trim()) {
          withEntry(id, function (e) {
            if (!e.src) e.src = { kind: "typed" };
            if (e.src.orig == null && e.src.kind === "chip") e.src.orig = e.text;
            e.text = box.value.trim();
          });
        }
        S.edit = ""; paint(); return;
      }
      if (act === "priv") {
        withEntry(b.getAttribute("data-id"), function (e) { e.st = (e.st === "private") ? "kept" : "private"; });
        paint(); return;
      }
      if (act === "rm") {
        /* "Take it off my page" is child authority, so it is a real delete,
           not an archive the team can dig back up. */
        var st5 = load(), s5 = kid(st5, S.code), id5 = b.getAttribute("data-id");
        s5.entries = s5.entries.filter(function (e) { return e.id !== id5; });
        save(st5);
        paint(); return;
      }
      if (act === "print") { printDeck(S.code); return; }
    };
    ov.onkeydown = function (ev) {
      if (ev.key === "Escape") { closeSession(); return; }
      /* AOG-TIM-WHO-V1 · Enter is what a student presses after typing a code
         into a single box, and there is no form here to do it for them. */
      if (ev.key === "Enter" && S.step === "who" && ev.target && ev.target.id === "aogTimWho") {
        ev.preventDefault();
        var wv2 = String(ev.target.value || "").trim().toUpperCase();
        if (wv2) openSession(wv2);
      }
    };
  }

  /* face-level clicks (outside the overlay) */
  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("#aogTimCard [data-tim]") : null;
    if (!b) return;
    var act = b.getAttribute("data-tim");
    if (act === "near") { S.typedFace = b.getAttribute("data-c") || ""; face(); return; }
    if (act === "open" && S.typedFace) { S.home = false; openSession(S.typedFace); return; }
    if (act === "link" && S.typedFace) {
      var u = "";
      try {
        /* AOG-TIM-LINKDEST-V1 · .30dt · THIS BUTTON USED TO BUILD A LINK WITH
           NO DESTINATION ON IT. A hand-built link carries no school, so a page
           a student sent from their own Chromebook posted to whatever Sheet
           the site config publishes rather than to this teacher's — the same
           fault [[aog-practice-links]] fixed for the thirty activity pages.
           There is now ONE builder (AOG-TIM-LINK-V1, in aog-thisisme-links)
           and both callers use it, so the answer to "what is on a This Is Me
           link" cannot drift between two places. The local fallback keeps this
           block's standing contract: delete the other block and nothing here
           breaks — the link just goes back to carrying no Sheet. */
        if (window.AOGTimLinks && typeof window.AOGTimLinks.link === "function") {
          u = window.AOGTimLinks.link(S.typedFace);
        }
        if (!u) {
          u = ((location.protocol === "http:" || location.protocol === "https:") ? (location.origin + location.pathname) : "")
            + "?thisisme=1&sid=" + encodeURIComponent(String(S.typedFace).trim().toUpperCase());
        }
      } catch (e) {}
      if (!u) return;
      var done = function () { b.textContent = T("Copied ✓", "Copiado ✓"); setTimeout(function () { try { b.textContent = T("Copy link for their device", "Copiar enlace para su dispositivo"); } catch (e) {} }, 1800); };
      try { navigator.clipboard.writeText(u).then(done, function () { window.prompt(T("Copy this:", "Copia esto:"), u); }); }
      catch (e) { window.prompt(T("Copy this:", "Copia esto:"), u); }
      return;
    }
    if (act === "print" && S.typedFace) { printDeck(S.typedFace); return; }
    /* .30dj · Pull lives on the Check-ins door and a case manager opening the
       IEP panel had no reason to go there first, so a page could be sitting in
       the Sheet all week with nothing on this screen suggesting it. Same call
       the Check-ins door makes, same ADMIN_PULL_KEY gate — and the error it
       answers with is shown as written, because "try again later" is a lie when
       the true answer is "this computer has no read passcode". */
    if (act === "get") {
      if (typeof window.aogPullCheckins !== "function") {
        S.getMsg = T("This copy of the site cannot read from a Sheet.",
                     "Esta copia del sitio no puede leer de una hoja.");
        face(); return;
      }
      S.getMsg = T("Checking the Sheet…", "Consultando la hoja…"); face();
      window.aogPullCheckins().then(function (r3) {
        S.getMsg = (r3 && r3.ok)
          ? T("Checked just now.", "Consultado ahora mismo.")
          : ((r3 && r3.error) ? String(r3.error)
                              : T("Couldn't reach the Sheet.", "No se pudo conectar con la hoja."));
        face();
      }, function () {
        S.getMsg = T("Couldn't reach the Sheet.", "No se pudo conectar con la hoja."); face();
      });
      return;
    }
  });

  /* Language and role switches repaint the dashboard around this card, so the
     face re-renders itself shortly after any click lands elsewhere. Cheap: it
     is one small card, and only when the IEP panel is actually visible. */
  var faceTimer = null;
  document.addEventListener("click", function (ev) {
    if (ev.target && ev.target.closest && ev.target.closest("#aogTimCard,#aogTimOv")) return;
    if (faceTimer) clearTimeout(faceTimer);
    faceTimer = setTimeout(function () {
      var d = el("aogTimCard");
      if (d && d.offsetParent !== null && !S.open) face();
      if (!el("aogTimCard")) mount();
    }, 140);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
