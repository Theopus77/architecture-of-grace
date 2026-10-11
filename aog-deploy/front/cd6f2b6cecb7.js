
/* ============================================================================
   HOME ↔ SCHOOL  ·  IEP GOAL CONTINUITY LAYER          2026-08-28
   ----------------------------------------------------------------------------
   THE GOAL STAYS THE GOAL. THE ENVIRONMENT CHANGES.

   This is a BRIDGE, not a second IEP system. It adds nothing to the legal
   record, decides nothing, and replaces nothing. The IEP Progress Monitor
   above it — goals, baseline, target, aimline, the four-state signal, the
   chart, meeting paperwork, CSV — is untouched and remains the source of the
   goal. This layer only lets an existing goal ALSO be expressed in words a
   family can use, and lets what they notice at home sit BESIDE the school's
   measurements without ever being mistaken for them.

   ⚠ FIVE RULES THAT MUST NOT BE "IMPROVED"

   1 · PROVENANCE IS NEVER ERASED. School measurements live in aog.iep.v1 and
       are not touched by anything here. Home observations live in their own
       store and their own Sheet tab. §18's "merge" is a VIEW that combines
       them for interpretation; the records stay separate for ever. If you
       find yourself pushing a home tap into st.data[id], stop.

   2 · A HOME OBSERVATION IS NEVER A SCORE. No percentage, no rating, no
       pass, no flag derived from a tap. The family sees counts and plain
       sentences and never a number about their child. §11.

   3 · NOTHING RANKS THE OPTIONS. "Could not get started" is drawn in the
       same type, weight and color as "Did it on their own" — the same rule
       the exit slip keeps (§12 there), and for the same reason. The handoff
       sketched a red-amber-green ramp; this build deliberately does not use
       one. It is the same call the Daily Check-In's scale disc already made,
       and it is written down for Jimmy to overrule. See THE THREE CALLS at
       the foot of this block.

   4 · THE FOLLOW-UP FLAG IS A REQUEST, NEVER A DIAGNOSIS. It is raised by
       exactly two things: the family typed something, or the family tapped
       "Please get in touch". NOT by a hard day, NOT by "needed help", NOT by
       a run of them. A system that reads every difficult answer as an alert
       is how a family learns to stop answering honestly.

   5 · NOBODY IS TOLD THEY ARE BEHIND. No "you haven't submitted", no missing
       -data warning, no participation score, no streak. A quiet week reads
       "No home observations this week." and stops. §17, §28.

   ⚠ WHAT TRAVELS, AND WHAT NEVER DOES
   A home link carries: an opaque per-goal key, the student's pseudonymous
   code, the plain-language skill, the question, and which scale to draw.
   It NEVER carries a name, a disability, a diagnosis, the IEP goal text, the
   Sheet address or any passcode. The code-to-name list stays on the
   teacher's paper, exactly as it does everywhere else here. §25.

   Reads: [[aog-signed-iep-rule]] [[aog-progress-signal]] [[aog-backup-symmetry]]
   ============================================================================ */
(function () {
  "use strict";

  var KEY   = "aog.iep.home.v1";     /* NOT matched by PV_KEEP → backed up and
                                        deleted with everything else. */
  var IEPK  = "aog.iep.v1";
  var PARAM = "home";

  function el(id) { return document.getElementById(id); }
  function isEs() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) { return false; } }
  function T(en, es) { return isEs() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function code(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
  function todayISO() { var d = new Date(); function p(n){ return (n<10?"0":"")+n; } return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()); }
  function daysAgoISO(n) { var d = new Date(); d.setDate(d.getDate()-n); function p(x){ return (x<10?"0":"")+x; } return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()); }
  function clockNow() { try { return new Date().toLocaleTimeString(isEs()?"es":"en",{hour:"numeric",minute:"2-digit"}); } catch(e){ return ""; } }

  function jload(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return (v===null||v===undefined)?d:v; } catch (e) { return d; } }
  function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function store() { var s = jload(KEY, {}) || {}; if (!s.cfg) s.cfg = {}; if (!s.obs) s.obs = {}; if (!s.pulled) s.pulled = {}; return s; }
  function put(s) { jsave(KEY, s); }
  function iep() { var s = jload(IEPK, {}) || {}; if (!s.goals) s.goals = {}; if (!s.data) s.data = {}; return s; }

  function mint() {
    /* Opaque, unguessable enough that a stray link is not a directory, and
       short enough to live in a QR beside a class name. Not a credential for
       reading anything — see gateReads below. */
    var a = "abcdefghjkmnpqrstuvwxyz23456789", o = "";
    try {
      var b = new Uint8Array(10); crypto.getRandomValues(b);
      for (var i=0;i<10;i++) o += a[b[i] % a.length];
      return o;
    } catch (e) {}
    for (var j=0;j<10;j++) o += a[Math.floor(Math.random()*a.length)];
    return o;
  }

  /* ═══════════════════════════════════════════════ §07 · THE SHARED SKILL
     The formal goal stays exactly as written. This is a SECOND, plainer
     expression of the same underlying skill, and the teacher can always
     overwrite it. Every suggestion below is a phrase a 12-year-old and their
     grown-up would both recognize — no jargon, no percentages, no "given a
     structured task".

     ⚠ These are SUGGESTIONS, offered against the goal's area. They are never
     applied without the teacher choosing one. A tool that auto-translates an
     IEP goal into a home instruction is doing the team's job for it. */
  var SKILLS = {
    reading: [
      ["Reading on their own",       "How independently did the reading go?"],
      ["Telling you what happened",  "After reading, how did explaining it go?"],
      ["Sticking with a hard page",  "When the reading got hard, how did it go?"]
    ],
    writing: [
      ["Starting a piece of writing","How did getting started go?"],
      ["Getting the idea down",      "How did putting the idea into words go?"]
    ],
    math: [
      ["Working through a problem",  "How independently did the problem-solving go?"],
      ["Sticking with a hard one",   "When it got hard, how did it go?"]
    ],
    exec: [
      ["Getting started",            "How did getting started go today?"],
      ["Gathering what they need",   "How did getting their things together go?"],
      ["Finishing what they started","How did finishing go?"],
      ["Keeping track of time",      "How did keeping to the time go?"]
    ],
    behavior: [
      ["Handling a hard moment",     "When something got frustrating, how did it go?"],
      ["Taking a break on purpose",  "How did taking a break go?"],
      ["Coming back after upset",    "How did coming back afterwards go?"]
    ],
    social: [
      ["Asking for help",            "When they needed help, how did asking go?"],
      ["Sorting things out",         "When something went wrong with someone, how did it go?"],
      ["Joining in",                 "How did joining in go?"]
    ],
    speech: [
      ["Saying what they mean",      "How did getting the words out go?"],
      ["Asking for what they need",  "How did asking for what they needed go?"]
    ],
    ot: [
      ["Doing it themselves",        "How did doing it on their own go?"]
    ],
    pt: [
      ["Moving through the day",     "How did getting around go?"]
    ],
    tr_emp: [
      ["Doing a job start to finish","How did the job go, start to finish?"]
    ],
    tr_edu: [
      ["Working without a reminder", "How did working on their own go?"]
    ],
    tr_ind: [
      ["Doing the routine",          "How did the routine go?"],
      ["Getting themselves ready",   "How did getting ready go?"]
    ],
    other: [
      ["Doing it on their own",      "How did it go today?"]
    ]
  };
  var SKILLS_ES = {
    "Reading on their own": ["Leer por su cuenta", "¿Cómo fue la lectura por su cuenta?"],
    "Telling you what happened": ["Contar lo que pasó", "Después de leer, ¿cómo fue explicarlo?"],
    "Sticking with a hard page": ["Seguir con una página difícil", "Cuando la lectura se puso difícil, ¿cómo fue?"],
    "Starting a piece of writing": ["Empezar a escribir", "¿Cómo fue empezar?"],
    "Getting the idea down": ["Poner la idea por escrito", "¿Cómo fue poner la idea en palabras?"],
    "Working through a problem": ["Resolver un problema", "¿Cómo fue resolverlo por su cuenta?"],
    "Sticking with a hard one": ["Seguir con uno difícil", "Cuando se puso difícil, ¿cómo fue?"],
    "Getting started": ["Empezar", "¿Cómo fue empezar hoy?"],
    "Gathering what they need": ["Reunir sus cosas", "¿Cómo fue juntar sus cosas?"],
    "Finishing what they started": ["Terminar lo que empezó", "¿Cómo fue terminar?"],
    "Keeping track of time": ["Manejar el tiempo", "¿Cómo fue cumplir con el tiempo?"],
    "Handling a hard moment": ["Manejar un momento difícil", "Cuando algo lo frustró, ¿cómo fue?"],
    "Taking a break on purpose": ["Tomar un descanso a propósito", "¿Cómo fue tomar un descanso?"],
    "Coming back after upset": ["Volver después de molestarse", "¿Cómo fue volver después?"],
    "Asking for help": ["Pedir ayuda", "Cuando necesitó ayuda, ¿cómo fue pedirla?"],
    "Sorting things out": ["Arreglar las cosas", "Cuando algo salió mal con alguien, ¿cómo fue?"],
    "Joining in": ["Participar", "¿Cómo fue participar?"],
    "Saying what they mean": ["Decir lo que quiere decir", "¿Cómo fue encontrar las palabras?"],
    "Asking for what they need": ["Pedir lo que necesita", "¿Cómo fue pedir lo que necesitaba?"],
    "Doing it themselves": ["Hacerlo por su cuenta", "¿Cómo fue hacerlo solo?"],
    "Moving through the day": ["Moverse durante el día", "¿Cómo fue desplazarse?"],
    "Doing a job start to finish": ["Hacer una tarea de principio a fin", "¿Cómo fue la tarea, de principio a fin?"],
    "Working without a reminder": ["Trabajar sin recordatorio", "¿Cómo fue trabajar por su cuenta?"],
    "Doing the routine": ["Hacer la rutina", "¿Cómo fue la rutina?"],
    "Getting themselves ready": ["Alistarse", "¿Cómo fue alistarse?"],
    "Doing it on their own": ["Hacerlo por su cuenta", "¿Cómo fue hoy?"]
  };
  function trSkill(en) { var r = SKILLS_ES[en]; return (isEs() && r) ? r[0] : en; }
  function trAsk(en, askEn) { var r = SKILLS_ES[en]; return (isEs() && r) ? r[1] : askEn; }

  /* ═════════════════════════════════════ §02 · §07 · THE HOME SCALES
     Four scales, one shape. The FIFTH option on every one of them is the
     escape hatch — "It didn't come up today" — and it is never behind a
     fold, never a failure, and ends the tap immediately (§15, §16).

     ⚠ THE ENGLISH LABEL IS THE STORED VALUE. Spanish is display only, the
     same contract the check-in and the exit slip keep. `k` is a KEY, not a
     rank: do not sort it, average it or paint it. */
  var SCALES = {
    independence: [
      ["own",      "Did it on their own",     "Lo hizo por su cuenta"],
      ["reminder", "Needed a reminder",       "Necesitó un recordatorio"],
      ["help",     "Needed some help",        "Necesitó ayuda"],
      ["hard",     "It was a hard one",       "Fue difícil"],
      ["na",       "It didn't come up today", "No surgió hoy"]
    ],
    regulation: [
      ["own",      "Handled it themselves",   "Lo manejó por su cuenta"],
      ["reminder", "Used something after a nudge", "Usó algo tras un recordatorio"],
      ["help",     "Needed an adult",         "Necesitó a un adulto"],
      ["hard",     "It was a hard one",       "Fue difícil"],
      ["na",       "It didn't come up today", "No surgió hoy"]
    ],
    communication: [
      ["own",      "Said it themselves",      "Lo dijo por su cuenta"],
      ["reminder", "Said it after a nudge",   "Lo dijo tras un recordatorio"],
      ["help",     "An adult said it for them", "Un adulto lo dijo por él/ella"],
      ["hard",     "It stayed unsaid",        "Se quedó sin decir"],
      ["na",       "It didn't come up today", "No surgió hoy"]
    ],
    transition: [
      ["own",      "Moved on when it was time", "Cambió cuando tocaba"],
      ["reminder", "Needed a reminder",       "Necesitó un recordatorio"],
      ["help",     "Needed some help",        "Necesitó ayuda"],
      ["hard",     "It was a hard one",       "Fue difícil"],
      ["na",       "It didn't come up today", "No surgió hoy"]
    ]
  };
  var SCALE_LBL = {
    independence:  ["How independently it went", "Qué tan solo lo hizo"],
    regulation:    ["How the hard moment went",  "Cómo fue el momento difícil"],
    communication: ["How saying it went",        "Cómo fue decirlo"],
    transition:    ["How the change went",       "Cómo fue el cambio"]
  };
  /* Which scale a goal starts on. The teacher can change it; this only
     removes a decision from the thirty seconds §27 allows. */
  var AREA_SCALE = {
    behavior: "regulation", social: "communication", speech: "communication",
    reading: "independence", writing: "independence", math: "independence",
    exec: "independence", ot: "independence", pt: "independence",
    tr_emp: "independence", tr_edu: "independence", tr_ind: "independence",
    other: "independence"
  };
  function scaleOf(k) { return SCALES[k] ? k : "independence"; }
  function levelsFor(k) { return SCALES[scaleOf(k)]; }
  function levelLabel(sk, key) {
    var r = null;
    levelsFor(sk).forEach(function (x) { if (x[0] === key) r = x; });
    return r ? T(r[1], r[2]) : "";
  }
  function levelEn(sk, key) {
    var r = "";
    levelsFor(sk).forEach(function (x) { if (x[0] === key) r = x[1]; });
    return r;
  }

  /* ═══════════════════════════════════════════ §14 · OPTIONAL CONTEXT
     Behind one tap, never in the way. The default experience is a single
     tap and done; this exists for the family who wants to say more, and it
     is explicitly NOT a behavior-analysis system. Three short lists, all
     optional, all skippable, none of them ever required. */
  var CTX = {
    when: [["Morning","Mañana"],["Afternoon","Tarde"],["Evening","Noche"]],
    what: [["Homework","Tarea"],["Getting ready","Alistarse"],["A change of activity","Un cambio de actividad"],
           ["Reading","Lectura"],["A chore","Un quehacer"],["Out and about","Fuera de casa"],["Something else","Otra cosa"]],
    helped: [["A reminder","Un recordatorio"],["A choice","Una opción"],["Someone alongside","Alguien al lado"],
           ["A break first","Un descanso primero"],["Something to look at","Algo visual"],["Nothing — just them","Nada — solo él/ella"]]
  };

  /* ══════════════════ THE SAME QUESTION, ASKED WHERE THE PERSON IS
     ⚠ A COLLEAGUE WAS BEING OFFERED THE FAMILY'S CONTEXT LIST. .29ac built
     the colleague screen by reusing the family screen whole, which was right
     for the instrument and wrong for these three chips: a general education
     teacher was asked whether it happened during "Homework", "A chore" or
     "Out and about", in a classroom, about a child in her fourth period.

     Only `when` and `what` differ. `helped` was already school-shaped and is
     deliberately SHARED — a reminder is a reminder in both places, and two
     lists that say the same thing drift apart, which is the fault this
     project keeps catching.

     ⚠ ADDITIVE. Rows already written store the English string they were
     tapped with and render it back verbatim, so every observation collected
     before this build reads exactly as it did. Nothing is remapped and
     nothing is repaired on a guess. */
  var CTX_STAFF = {
    when: [["Morning","Mañana"],["Midday","Mediodía"],["Afternoon","Tarde"]],
    what: [["Whole-group instruction","Instrucción con todo el grupo"],["Small group","Grupo pequeño"],
           ["Independent work","Trabajo independiente"],["A transition","Una transición"],
           ["Unstructured time","Tiempo no estructurado"],["Something else","Otra cosa"]],
    helped: CTX.helped
  };
  function ctxList(n) {
    var C = (HS && HS.who === "staff") ? CTX_STAFF : CTX;
    return n === "when" ? C.when : n === "what" ? C.what : C.helped;
  }

  /* ═══════════════════════ THE SECOND RESPONDENT · WHO IS ANSWERING
     `respondentRole` has been a column on this tab since the first day of
     this layer and has only ever held one value. A colleague answering about
     the same goal is THE SAME INSTRUMENT WITH A DIFFERENT PERSON HOLDING IT,
     so it writes the same row into the same tab with a different value in
     that column — never a second store, never a second Sheet tab, never a
     second implementation of "how is this skill going".

     ⚠ A COLLEAGUE'S OBSERVATION IS NOT A MEASUREMENT. Nothing here is pushed
     into aog.iep.v1. It sits BESIDE the aimline exactly as a home
     observation does, and a person reads it. Rule 1 of this block applies to
     classroom rows word for word. Accepting a colleague's count onto the
     chart is a SEPARATE feature that does not exist yet, and when it is
     built it must stamp provenance the way the benchmark generator does and
     require the case manager to accept each point — see the signed-IEP rule.

     ⚠ THE COUNTS RIDE IN `extra`, the column the Sheet already reserves for
     "room for a future question". No Apps Script change, no re-paste, no
     SCRIPT_VERSION bump. Additive, exactly like slipType was. */
  var STAFF_ROLES = [
    ["gened",       "General education teacher",  "Docente de educación general"],
    ["sped",        "Special educator",           "Educador/a especial"],
    ["related",     "Related-service provider",   "Proveedor/a de servicios relacionados"],
    ["support",     "Social worker / counselor",  "Trabajador/a social o consejero/a"],
    ["para",        "Paraprofessional",           "Paraprofesional"],
    ["other_staff", "Other staff",                "Otro personal"]
  ];
  function staffRole(v) {
    v = String(v == null ? "" : v);
    for (var i = 0; i < STAFF_ROLES.length; i++) if (STAFF_ROLES[i][0] === v) return v;
    return "";
  }
  function staffRoleLabel(v) {
    for (var i = 0; i < STAFF_ROLES.length; i++) if (STAFF_ROLES[i][0] === v) return T(STAFF_ROLES[i][1], STAFF_ROLES[i][2]);
    return T("A colleague", "Un/a colega");
  }
  /* ONE PREDICATE, EVERYWHERE. A row with no respondentRole at all is a
     family row — which is every row written before this build. */
  function isStaffRow(r) {
    var v = String((r && r.respondentRole) || "family");
    return v !== "family" && v !== "";
  }
  /* ⚠ A LINK NEVER SHOWS BACK WHAT SOMEONE ELSE SAID. A colleague opening a
     link on the dashboard computer — which HAS pulled the whole tab — would
     otherwise read the family's observations straight off the intro screen.
     Scope every read on these screens by who is holding the link, in BOTH
     directions: the family does not see the classroom rows either. */
  function obsForWho(key, who) {
    return obsFor(key).filter(function (r) { return (who === "staff") === isStaffRow(r); });
  }
  function xPack(a) {
    var o = {};
    if (a && a.opps) o.opps = a.opps;
    if (a && a.indep !== "" && a.indep != null) o.indep = a.indep;
    return Object.keys(o).length ? JSON.stringify(o) : "";
  }
  function xNum(rawx, k) {
    try {
      var o = JSON.parse(String(rawx == null ? "" : rawx) || "{}");
      var v = o[k];
      return (v === 0 || v) ? +v : "";
    } catch (e) { return ""; }
  }

  /* ═══════════════════════════════════════════════════ THE LINK CODEC
     Everything the family's phone needs rides in the URL, because there is
     no server in this product and there is not going to be one. The payload
     is COMPACT and it is not a secret — it is base64url so it survives a
     copy-paste and a QR, not because it is hiding anything.

     ⚠ WHAT IS IN IT: key, student code, skill, question, scale, and the
     class context the Sheet needs. WHAT IS NOT: the child's name, the goal,
     the area, the disability, the Sheet address, any passcode. §25. */
  function b64u(s) {
    try { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
    catch (e) { return ""; }
  }
  function unb64u(s) {
    try {
      s = String(s||"").replace(/-/g,"+").replace(/_/g,"/");
      while (s.length % 4) s += "=";
      return decodeURIComponent(escape(atob(s)));
    } catch (e) { return ""; }
  }
  /* ⚠ TWO LINK KINDS, ONE CONFIG. `who` is a property of the LINK, never of
     the goal: one connected goal issues a family link and a colleague link,
     and the row each one writes says which. An older link has no `r` at all
     and decodes as "family", so every link already on a phone keeps working
     exactly as it did. */
  function payloadOf(c, who, ro) {
    var o = {
      k: c.key, c: c.code, s: c.skill, a: c.ask, sc: c.scale,
      d: c.districtId || "", h: c.schoolId || "", i: c.classId || "",
      g: c.grade || "", t: c.term || "", o: c.org || ""
    };
    if (who === "staff") { o.r = "s"; if (staffRole(ro)) o.ro = staffRole(ro); }
    return b64u(JSON.stringify(o));
  }
  function decodePayload(raw) {
    var j = unb64u(raw);
    if (!j) return null;
    var o = null; try { o = JSON.parse(j); } catch (e) { return null; }
    if (!o || !o.k || !o.s) return null;
    return { key: String(o.k), code: code(o.c || ""), skill: String(o.s), ask: String(o.a || ""),
             scale: scaleOf(o.sc), districtId: o.d || "", schoolId: o.h || "", classId: o.i || "",
             grade: o.g || "", term: o.t || "", org: o.o || "",
             who: (o.r === "s" ? "staff" : "family"), role: staffRole(o.ro) };
  }
  function baseUrl() {
    try {
      if (location.protocol === "http:" || location.protocol === "https:") return location.origin + location.pathname;
    } catch (e) {}
    return "";
  }
  function linkFor(c, who, ro) {
    /* Its own door. This link is not a Distribute instrument, which is why it
       was left out of the first pass — and it is the one most likely to be
       read on a phone, by a family, from a text message. */
    var b = (typeof aogShareBase_ === "function" && aogShareBase_("goal")) || baseUrl();
    if (!b) return "";
    /* A family phone has never seen this dashboard either. Same reasoning as
       the classroom links -- see THE DESTINATION CAN RIDE ON THE LINK. */
    var dp = "";
    try { dp = (typeof aogDestParam_ === "function") ? aogDestParam_() : ""; } catch (e) {}
    return b + "?" + PARAM + "=" + payloadOf(c, who, ro) + (isEs() ? "&lang=es" : "") +
           (dp ? "&" + AOG_DEST_PARAM + "=" + dp : "");
  }

  /* ══════════════════════════════════════════════════════ THE CONFIG API */
  function cfgFor(goalId) { return (store().cfg || {})[goalId] || null; }
  function cfgByKey(k) {
    var s = store(), out = null;
    Object.keys(s.cfg || {}).forEach(function (id) { if (s.cfg[id] && s.cfg[id].key === k) out = s.cfg[id]; });
    return out;
  }
  function goalIdByKey(k) {
    var s = store(), out = "";
    Object.keys(s.cfg || {}).forEach(function (id) { if (s.cfg[id] && s.cfg[id].key === k) out = id; });
    return out;
  }
  function saveCfg(goalId, c) {
    var s = store();
    s.cfg[goalId] = c;
    put(s);
    return c;
  }
  function connect(goalId, opts) {
    var g = (iep().goals || {})[goalId];
    if (!g) return null;
    var prev = cfgFor(goalId) || {};
    var area = g.area || "other";
    var sug = (SKILLS[area] || SKILLS.other)[0];
    var c = {
      on: opts && opts.fit === "no" ? false : true,
      fit: (opts && opts.fit) || "optional",
      skill: (opts && opts.skill) || prev.skill || sug[0],
      ask:   (opts && opts.ask)   || prev.ask   || sug[1],
      scale: scaleOf((opts && opts.scale) || prev.scale || AREA_SCALE[area]),
      /* ⚠ THE KEY IS MINTED ONCE AND KEPT. Re-minting it on every edit would
         silently orphan every link already on a family's phone. */
      key:   prev.key || mint(),
      code:  code((opts && opts.code) || prev.code || ""),
      since: prev.since || todayISO(),
      districtId: (opts && opts.districtId) || prev.districtId || "",
      schoolId:   (opts && opts.schoolId)   || prev.schoolId   || "",
      classId:    (opts && opts.classId)    || prev.classId    || "",
      grade:      (opts && opts.grade)      || prev.grade      || (g.grade || ""),
      term:       (opts && opts.term)       || prev.term       || ""
    };
    return saveCfg(goalId, c);
  }
  function disconnect(goalId) {
    var s = store();
    if (s.cfg[goalId]) { s.cfg[goalId].on = false; put(s); }
    /* ⚠ THE OBSERVATIONS ARE NOT DELETED HERE. Turning the bridge off is not
       the same act as destroying what a family already told you, and a
       control that quietly did both would be the worst kind of surprise.
       Removing them is the Remove-records screen's job, where it is named,
       listed and backed up first. */
  }

  /* ══════════════════════════════════════════════════ THE OBSERVATIONS */
  function obsFor(key) { return ((store().obs || {})[key] || []).slice(); }
  function inLast(list, days) {
    var from = daysAgoISO(days - 1);
    return list.filter(function (r) { return String(r.date || "") >= from; });
  }
  function addObs(key, rec) {
    var s = store();
    if (!s.obs[key]) s.obs[key] = [];
    s.obs[key].push(rec);
    put(s);
    return rec;
  }
  function countBy(list) {
    var m = { own:0, reminder:0, help:0, hard:0, na:0 };
    list.forEach(function (r) { if (m[r.levelKey] != null) m[r.levelKey]++; });
    return m;
  }
  /* Everything the rules read EXCLUDES "it didn't come up". A day the
     opportunity never arose is not a data point about the skill, and letting
     it into a denominator is the "Nothing today was counted as a barrier"
     mistake all over again. */
  function counted(list) { return list.filter(function (r) { return r.levelKey !== "na"; }); }

  /* ═══════════════════════════════════════ §11 · WHAT A FAMILY IS TOLD
     Counts and sentences. Never a percentage, never "below", never a trend
     line about their child. If you cannot say it without a number, say less. */
  function familyRead(key, sk) {
    var all = counted(inLast(obsForWho(key, "family"), 7));
    if (!all.length) return T("Nothing noted this week — that is completely fine.",
                              "Nada anotado esta semana — está perfectamente bien.");
    var m = countBy(all), n = all.length;
    function times(k) { return T(k + (k === 1 ? " time" : " times"), k + (k === 1 ? " vez" : " veces")); }
    if (m.own >= 1 && m.own >= m.reminder && m.own >= m.help + m.hard) {
      return T("You noticed " + times(m.own) + " this week when they did it on their own.",
               "Notaste " + times(m.own) + " esta semana en que lo hizo por su cuenta.");
    }
    if (m.reminder >= m.help + m.hard && m.reminder > 0) {
      return T("Most of the times you noticed this week, a reminder was what helped.",
               "La mayoría de las veces que lo notaste esta semana, un recordatorio fue lo que ayudó.");
    }
    return T("You noticed this " + times(n) + " this week. Thank you — that is genuinely useful.",
             "Lo notaste " + times(n) + " esta semana. Gracias — eso es realmente útil.");
  }

  /* ═════════════════════════════════ §13 · THE SAME SKILL, TWO PLACES
     ⚠ THIS IS A VIEW, NOT A MERGE (§18). It reads two stores and prints two
     rows. Nothing is combined into one number, nothing is averaged, and the
     source of every count is named on the row it is on.

     The school row is deliberately NOT the same shape as the home row —
     school measurements are a value against an aimline, home observations
     are taps — so this compares the ONE thing they honestly share: how many
     observations exist, over what span, in each place. Anything more would
     be inventing a common unit that does not exist. */
  /* The colleague's version of the same sentence. Counts, no percentage, no
     trend, and — rule 5 — not one word about how often they have answered. */
  function staffRead(key) {
    var all = counted(inLast(obsForWho(key, "staff"), 7));
    /* ⚠ AN EMPTY WEEK SAYS NOTHING AT ALL. It returned "Nothing noted here
       this week", which on a first visit was the largest, boldest line on the
       screen — a colleague opening the link was met by an absence where the
       ask should be. It is not an obligation word, so rule 5 held and every
       assertion passed; it was still the wrong first sentence. Let the ask
       lead, not the absence. The callers omit the line when this is "". */
    if (!all.length) return "";
    var m = countBy(all), n = all.length;
    return T(n + (n === 1 ? " note" : " notes") + " this week — " +
             m.own + " on their own, " + m.reminder + " with a reminder, " + (m.help + m.hard) + " with support.",
             n + (n === 1 ? " nota" : " notas") + " esta semana — " +
             m.own + " por su cuenta, " + m.reminder + " con recordatorio, " + (m.help + m.hard) + " con apoyo.");
  }
  function whoRead(key, sk, who) { return who === "staff" ? staffRead(key) : familyRead(key, sk); }

  function envSnapshot(goalId) {
    var g = (iep().goals || {})[goalId], c = cfgFor(goalId);
    if (!g) return null;
    var pts = (iep().data || {})[goalId] || [];
    /* ⚠ SORTED, BECAUSE THE CALLER PRINTS A SPAN. from/to below are
       list[0] and list[n-1], which describe a range only if the list is in
       date order — and this store is in INSERTION order. The classroom row
       printed "8/27 to 8/25" on a screenshot. A pull from the Sheet can
       arrive in any order, so this was not only a seeding artefact. */
    function byDay(x, y) {
      var p = String(x.date || ""), q = String(y.date || "");
      return p < q ? -1 : (p > q ? 1 : 0);
    }
    var home = c ? counted(obsForWho(c.key, "family")).slice().sort(byDay) : [];
    /* ⚠ THREE NAMED COUNTS, NEVER ADDED. School, classroom and home are three
       sources with three different meanings; a total across them is a number
       nothing in the world corresponds to. The same rule §14 already kept for
       two, kept for three. */
    var klass = c ? counted(obsForWho(c.key, "staff")).slice().sort(byDay) : [];
    var m = countBy(home), km = countBy(klass);
    return {
      school: { n: pts.length, from: pts.length ? pts[0].date : "", to: pts.length ? pts[pts.length-1].date : "" },
      home:   { n: home.length, from: home.length ? home[0].date : "", to: home.length ? home[home.length-1].date : "", by: m },
      klass:  { n: klass.length, from: klass.length ? klass[0].date : "", to: klass.length ? klass[klass.length-1].date : "", by: km },
      skill:  c ? c.skill : "", scale: c ? c.scale : "independence"
    };
  }

  /* ══════════════════════════════════════════════════════════════ THE WIRE
     Identical discipline to the exit slip's, for identical reasons: cors
     first so the reply can be read; a CORS failure means the POST WAS
     delivered and only the reply was blocked, so it is never re-sent (that
     is the only way to make a duplicate row); genuinely offline keeps it
     queued. Nothing here is new machinery. */
  var QKEY = "aog.home.queue";
  var PULLED = "aog.home.pulled";

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
  function deviceReadKey() {
    try { return localStorage.getItem("aog.sync.key") || ""; } catch (e) { return ""; }
  }
  function queueGet() { return jload(QKEY, []) || []; }
  function queuePush(r) { var q = queueGet(); q.push(r); jsave(QKEY, q); }
  function queueDrop(r) {
    jsave(QKEY, queueGet().filter(function (x) {
      return !(x.timestamp === r.timestamp && x.homeKey === r.homeKey);
    }));
  }
  function sync(rec) {
    var d = destination();
    if (!d.url || !d.key) return Promise.resolve("local");
    var p = { action: "home", passcode: d.key, _backendAuth: d.key };
    Object.keys(rec).forEach(function (k) { p[k] = rec[k] == null ? "" : rec[k]; });
    return fetch(d.url, {
      method: "POST", mode: "cors", redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(p)
    }).then(function (r) { return r.text(); }).then(function (txt) {
      var out = null; try { out = JSON.parse(txt); } catch (e) {}
      if (out && out.ok) { queueDrop(rec); return "sent"; }
      /* The script answered and said no — almost always an Apps Script that
         predates the HomeObservations branch. Waiting will not fix that. */
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
    return q.reduce(function (p, r) { return p.then(function () { return sync(r); }); }, Promise.resolve());
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

  window.aogPullHome = function () {
    var d = destination(), key = deviceReadKey();
    if (!d.url) return Promise.resolve({ ok: false, error: T(
      "This is a local-only copy — no central sheet is configured.",
      "Esta es una copia solo local — no hay hoja central configurada.") });
    if (!key) return Promise.resolve({ ok: false, error: T(
      "This computer isn’t connected for reading yet. Set up ▸ Connect your Sheet, and put your ADMIN_PULL_KEY in the Passcode box.",
      "Esta computadora aún no está conectada para leer. Configurar ▸ Conecta tu Hoja y pon tu ADMIN_PULL_KEY en el campo de contraseña.") });
    return fetch(d.url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "pullHome", passcode: key })
    }).then(function (r) { return r.json(); }).then(function (out) {
      if (out && out.error) return { ok: false, error: String(out.error) };
      if (!out || !("homeObs" in out)) {
        return { ok: false, error: T(
          "This Sheet’s script can’t send home observations back yet. Paste the updated Apps Script, redeploy it as a NEW version, then try again.",
          "El script de esta hoja aún no puede devolver las observaciones. Pega el Apps Script actualizado, vuelve a desplegarlo como NUEVA versión e inténtalo otra vez.") };
      }
      var added = merge(out.homeObs || []);
      try { localStorage.setItem(PULLED, new Date().toISOString()); } catch (e) {}
      return { ok: true, added: added, total: (out.homeObs || []).length };
    }).catch(function (e) {
      return { ok: false, error: String((e && e.message) || e) };
    });
  };
  window.aogHomeLastPulled = function () { try { return localStorage.getItem(PULLED) || ""; } catch (e) { return ""; } };

  /* De-dup on the same three things the exit slip's pull uses: the row is
     the same row if it is the same key at the same instant. */
  /* ══════════════════════════════ REMOVING AN OBSERVATION  ·  .30dq
     The third and last instrument to get one. The exit slip got it in
     `.30dl`, the daily check-in in `.30dp`, and this layer — the one holding
     what a FAMILY told you about their own child — still had no way to take
     a tester row out. `disconnect()` deliberately does not delete, and it is
     right not to; Set up ▸ Export can sweep a whole code, without an undo and
     without a tombstone. Neither answers "this one row is a test."

     Same three rules, a third time, because they are the same three faults:

     1 — IT IS UNDOABLE. remove() hands back the exact records with the key
         and the index each sat at; restore() puts them back there.
     2 — IT SURVIVES THE NEXT PULL, via a tombstone on `homeKey|timestamp` —
         the very key merge() already de-duplicates on. ⚠ NOTHING IN THE
         SHEET IS TOUCHED, and the screen says so.
     3 — IT TAKES THE QUEUED COPY WITH IT, so a row that never reached the
         Sheet is not uploaded after a teacher removed it.

     ⚠ ONE STORE, TWO KINDS OF ROW. `s.obs[key]` holds family rows and staff
     rows together and `isStaffRow` tells them apart; removal is deliberately
     blind to that distinction. A tester is a tester whoever filed it, and a
     control that quietly refused half the rows it appeared beside would be
     the same lie `.30dp` was written to end.

     ⚠ aog.home.removed.v1 is NOT matched by PV_KEEP, so the backup carries it
     and Erase everything takes it out — [[aog-backup-symmetry]]. */
  var HGONE = "aog.home.removed.v1";
  function hCode(x) { return String(x == null ? "" : x).trim().toUpperCase(); }
  function goneListH() { var a = jload(HGONE, []); return (a && a.slice) ? a.slice() : []; }
  function goneSetH() { var o = {}; goneListH().forEach(function (k) { o[String(k)] = 1; }); return o; }
  function goneSaveH(a) { jsave(HGONE, a.length > 4000 ? a.slice(a.length - 4000) : a); }
  /* ⚠ BOTH SPELLINGS. The bucket is the homeKey as this store filed it; the
     row carries whatever the Sheet had. Normalized COMPARE, original kept. */
  function hKeys(key, r) {
    var ts = String((r && r.timestamp) || "");
    var a = hCode(key) + "|" + ts, b = hCode(r && r.homeKey) + "|" + ts;
    return a === b ? [a] : [a, b];
  }
  function removeObs(keys) {
    var want = {};
    (keys || []).forEach(function (k) { if (k) want[String(k)] = 1; });
    var s = store(), took = [], marks = {};
    Object.keys(s.obs || {}).forEach(function (k) {
      var keep = [];
      (s.obs[k] || []).forEach(function (r, i) {
        var ks = hKeys(k, r);
        if (ks.some(function (x) { return want[x]; })) {
          took.push({ key: k, at: i, row: r });
          ks.forEach(function (x) { marks[x] = 1; });
        } else keep.push(r);
      });
      if (keep.length) s.obs[k] = keep; else delete s.obs[k];
    });
    if (!took.length) return took;
    put(s);
    var g = goneListH(), have = goneSetH();
    Object.keys(marks).forEach(function (k) { if (!have[k]) { have[k] = 1; g.push(k); } });
    goneSaveH(g);
    try {
      jsave(QKEY, (queueGet() || []).filter(function (r) {
        return !hKeys(r && r.homeKey, r).some(function (x) { return marks[x]; });
      }));
    } catch (e) {}
    return took;
  }
  function restoreObs(took) {
    var s = store(), back = 0, undo = {};
    if (!s.obs) s.obs = {};
    (took || []).slice().sort(function (a, b) { return (a.at || 0) - (b.at || 0); })
      .forEach(function (t) {
        if (!t || !t.row) return;
        var arr = s.obs[t.key] || (s.obs[t.key] = []);
        var ks = hKeys(t.key, t.row);
        var dup = arr.some(function (r) { return hKeys(t.key, r).some(function (x) { return ks.indexOf(x) > -1; }); });
        if (!dup) { arr.splice(Math.min(t.at == null ? arr.length : t.at, arr.length), 0, t.row); back++; }
        ks.forEach(function (x) { undo[x] = 1; });
      });
    if (back) put(s);
    /* ⚠ A RESTORED ROW MUST STOP BEING TOMBSTONED. */
    goneSaveH(goneListH().filter(function (k) { return !undo[String(k)]; }));
    return back;
  }
  function keysForHomeKey(key) {
    var want = hCode(key), out = [], s = store();
    Object.keys(s.obs || {}).forEach(function (k) {
      if (hCode(k) !== want) return;
      (s.obs[k] || []).forEach(function (r) { hKeys(k, r).forEach(function (x) { out.push(x); }); });
    });
    return out;
  }

  function merge(rows) {
    var s = store(), added = 0;
    var seen = {};
    /* .30dq — a row a teacher removed on purpose must not come back down. */
    var goneH = goneSetH();
    Object.keys(s.obs || {}).forEach(function (k) {
      (s.obs[k] || []).forEach(function (r) { seen[k + "|" + r.timestamp] = 1; });
    });
    (rows || []).forEach(function (r) {
      var k = String(r.homeKey || "").trim(), ts = String(r.timestamp || "");
      if (!k || !ts) return;
      if (seen[k + "|" + ts]) return;
      if (goneH[hCode(k) + "|" + ts]) return;   /* .30dq — removed on purpose */
      if (!s.obs[k]) s.obs[k] = [];
      s.obs[k].push({
        timestamp: ts, date: String(r.date || "").slice(0, 10),
        year: String(r.year || ""),
        homeKey: k, skill: r.skill || "", level: r.level || "",
        levelKey: String(r.levelKey || "").trim(),
        studentId: code(r.studentId || ""),
        timeOfDay: r.timeOfDay || "", activity: r.activity || "", support: r.support || "",
        note: r.note || "", followUp: !!r.followUp,
        /* ⚠ WITHOUT THIS EVERY PULLED CLASSROOM ROW COMES BACK AS A FAMILY
           ROW. The column has been on the tab since day one and merge() had
           never read it, which was harmless while it only ever said
           "family". It is load-bearing now. */
        respondentRole: String(r.respondentRole || "family"),
        extra: r.extra || "",
        opps: xNum(r.extra, "opps"), indep: xNum(r.extra, "indep"),
        source: "sheet", _remote: true
      });
      seen[k + "|" + ts] = 1;
      added++;
    });
    Object.keys(s.obs).forEach(function (k) {
      s.obs[k].sort(function (a, b) { return String(a.timestamp) < String(b.timestamp) ? -1 : 1; });
    });
    put(s);
    return added;
  }

  /* ═════════════════════════════════════════════════ §08 · THE FAMILY SCREEN
     Target: ten to twenty seconds, one-handed, standing in a kitchen. Big
     targets, no typing required anywhere, no jargon, no percentages, no
     literacy demand beyond the sentence itself, both languages, and an
     honest way out on every screen.

     ⚠ IT IS CALLED "Skills We're Working On", NEVER "Parent data collection"
     and never "IEP". §09.  */
  var HS = null;   /* {cfg, step, a:{}, done:false} */

  function css() {
    if (el("aogHsCss")) return;
    var s = document.createElement("style");
    s.id = "aogHsCss";
    s.textContent = [
      /* The stage. Same shape as the exit slip's, deliberately: one screen,
         nothing below the fold, the site header out of the way. */
      "#screen-home-skills{display:none;}",
      /* ⚠ border-box, and svh not vh. Without box-sizing the 52px of padding
         is ADDED to the 100vh and the family's phone scrolls by exactly that
         much on every screen — measured at 918 against an 844 viewport. svh
         is the visible height with the mobile browser's own chrome counted,
         the same correction the exit-slip stage makes. */
      "#screen-home-skills.active{display:flex;align-items:flex-start;justify-content:center;",
      "  box-sizing:border-box;min-height:100svh;padding:22px 16px 30px;background:var(--paper,#FBF8F1);}",
      "@supports not (height:100svh){#screen-home-skills.active{min-height:100vh;}}",
      /* ⚠ AND THE GLOBAL FOOTER GOES. #aogGlobalFoot is 74px and sits after
         #aog-main inside .stage, so a section that is exactly one viewport
         tall still leaves the page 74px longer than the screen — measured
         918 against 844. The exit slip absorbs this by SHRINKING its own
         stage (fitStage / --xs-vh); this screen has no measured stage and
         does not need one, so it hides the footer the same way the welcome
         screen already does at :has(#screen-welcome.active). A parent who
         followed a text message did not come for the site footer. */
      "body:has(#screen-home-skills.active) #aogGlobalFoot{display:none;}",
      "#screen-home-skills .hs-wrap{width:100%;max-width:560px;}",
      "#screen-home-skills .hs-eyebrow{font-size:12px;font-weight:800;letter-spacing:.10em;",
      "  text-transform:uppercase;color:var(--aog-dusk,#4A5578);margin-bottom:6px;}",
      "#screen-home-skills h1{font-size:26px;line-height:1.2;margin:0 0 6px;color:var(--ink,#0A1E33);font-weight:800;}",
      "#screen-home-skills .hs-sub{font-size:15px;line-height:1.6;color:var(--ink-soft,#46506E);margin:0 0 18px;}",
      "#screen-home-skills .hs-card{background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);",
      "  border-radius:16px;padding:20px 18px;margin-bottom:14px;}",
      "#screen-home-skills .hs-skill{font-size:21px;font-weight:800;line-height:1.25;color:var(--ink,#0A1E33);margin:0 0 8px;}",
      "#screen-home-skills .hs-q{font-size:19px;font-weight:750;line-height:1.3;color:var(--ink,#0A1E33);margin:0 0 14px;}",
      "#screen-home-skills .hs-note{font-size:13.5px;line-height:1.6;color:var(--ink-faint,#646E86);margin:10px 0 0;}",
      /* ⚠ ONE COLOR. Every option is drawn identically — see rule 3 at the
         top of this block. No ramp, no traffic light, no ranking. */
      "#screen-home-skills .hs-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;",
      "  background:var(--card,#fff);border:1.5px solid var(--rule,#E4DAC5);border-radius:13px;",
      "  padding:15px 16px;margin-bottom:9px;font-family:inherit;font-size:16.5px;font-weight:650;",
      "  line-height:1.35;color:var(--ink,#0A1E33);cursor:pointer;min-height:56px;}",
      "#screen-home-skills .hs-opt:hover{border-color:var(--aog-dusk,#4A5578);}",
      "#screen-home-skills .hs-opt:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#screen-home-skills .hs-opt .hs-mark{flex:0 0 auto;width:22px;height:22px;border-radius:50%;",
      "  border:2px solid var(--aog-dusk,#4A5578);background:var(--aog-pale,#EEF0F6);}",
      "#screen-home-skills .hs-opt.on{border-color:var(--aog-dusk,#4A5578);background:var(--aog-pale,#EEF0F6);}",
      "#screen-home-skills .hs-opt.on .hs-mark{background:var(--aog-dusk,#4A5578);box-shadow:inset 0 0 0 3px var(--aog-pale,#EEF0F6);}",
      "#screen-home-skills .hs-esc{margin-top:12px;padding-top:12px;border-top:1px solid var(--rule,#E4DAC5);}",
      "#screen-home-skills .hs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;",
      "  border:0;border-radius:12px;padding:15px 22px;font-family:inherit;font-size:16.5px;font-weight:750;",
      "  cursor:pointer;background:var(--aog-dusk,#4A5578);color:var(--aog-on,#fff);min-height:52px;}",
      "#screen-home-skills .hs-btn.ghost{background:transparent;color:var(--ink,#0A1E33);",
      "  border:1.5px solid var(--rule,#E4DAC5);}",
      "#screen-home-skills .hs-btn:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#screen-home-skills .hs-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:8px;}",
      "#screen-home-skills .hs-more{background:none;border:0;font-family:inherit;font-size:14.5px;font-weight:700;",
      "  color:var(--ink,#0A1E33);text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:8px 2px;}",
      "#screen-home-skills textarea{width:100%;min-height:78px;border:1.5px solid var(--rule,#E4DAC5);",
      "  border-radius:12px;padding:12px;font-family:inherit;font-size:16px;line-height:1.5;",
      "  background:var(--card,#fff);color:var(--ink,#0A1E33);}",
      "#screen-home-skills .hs-chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 4px;}",
      "#screen-home-skills .hs-chip{border:1.5px solid var(--rule,#E4DAC5);background:var(--card,#fff);",
      "  border-radius:999px;padding:9px 14px;font-family:inherit;font-size:14.5px;font-weight:650;",
      "  color:var(--ink,#0A1E33);cursor:pointer;min-height:42px;}",
      "#screen-home-skills .hs-chip.on{background:var(--aog-pale,#EEF0F6);border-color:var(--aog-dusk,#4A5578);}",
      "#screen-home-skills .hs-chl{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;",
      "  color:var(--ink-faint,#646E86);margin:14px 0 2px;}",
      "#screen-home-skills .hs-said{font-size:16px;line-height:1.6;color:var(--ink,#0A1E33);font-weight:650;}",
      "#screen-home-skills .hs-fine{font-size:12.5px;line-height:1.6;color:var(--ink-faint,#646E86);margin-top:16px;}",
      "@media (max-width:430px){",
      "  #screen-home-skills h1{font-size:23px;}",
      "  #screen-home-skills .hs-opt{font-size:16px;padding:14px 14px;}",
      "}",
      /* ⚠ --paper / --card / --ink / --rule / --ink-faint ARE remapped for
         dark. --navy and --cream are NOT — writing either here is the exact
         bug that made the whole Daily Check-In unreadable for weeks. */
      ":root[data-theme=\"dark\"] #screen-home-skills .hs-opt .hs-mark{border-color:var(--aog-pale,#EEF0F6);}",
      /* The role line and the two number rows. Same ink, same weight and the
         same target size as every other control on these screens \u2014 rule 3
         says nothing ranks the options, and a number is an option. */
      "#screen-home-skills .hs-role{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;}",
      "#screen-home-skills .hs-role label{font-size:13px;font-weight:700;color:var(--ink-soft,#46506E);}",
      "#screen-home-skills .hs-role select{flex:1 1 200px;min-height:44px;font:inherit;font-size:15px;",
      "  padding:8px 10px;border:1px solid var(--rule,#E4DAC5);border-radius:10px;",
      "  background:var(--paper,#FBF8F1);color:var(--ink,#0A1E33);}",
      "#screen-home-skills .hs-role select:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#screen-home-skills .hs-opps{margin-top:6px;}",
      "#screen-home-skills .hs-nums{display:flex;gap:8px;flex-wrap:wrap;}",
      "#screen-home-skills .hs-num{min-width:48px;min-height:48px;font:inherit;font-size:17px;font-weight:750;",
      "  border:1px solid var(--rule,#E4DAC5);border-radius:12px;background:var(--paper,#FBF8F1);",
      "  color:var(--ink,#0A1E33);cursor:pointer;}",
      "#screen-home-skills .hs-num.on{background:var(--aog-pale,#EEF0F6);border-color:var(--aog-dusk,#4A5578);",
      "  box-shadow:inset 0 0 0 1px var(--aog-dusk,#4A5578);}",
      "#screen-home-skills .hs-num:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "@media print{#screen-home-skills{display:none !important;}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function ensureScreen() {
    var s = el("screen-home-skills");
    if (s) return s;
    css();
    s = document.createElement("section");
    s.id = "screen-home-skills";
    s.className = "screen";
    s.setAttribute("aria-label", "Skills We're Working On");
    /* ⚠ IT GOES WHERE THE OTHER SCREENS GO, NOT ON document.body. `.stage`
       holds every section and keeps its own full-viewport height; a screen
       appended AFTER it lands below a blank 100vh of stage and the family's
       phone opens on an empty page they have to scroll past. Measured:
       scrollHeight 1688 on an 844 viewport, all of it above the question. */
    var sib = document.querySelector(".screen");
    if (sib && sib.parentNode) sib.parentNode.appendChild(s);
    else document.body.appendChild(s);
    return s;
  }

  /* ------------------------------------------- screen 1, for a colleague
     ⚠ A SEPARATE SCREEN, NOT A FORKED ONE. The family's intro is written for
     a kitchen and says out loud that the school does the measuring; a
     colleague IS the school. Threading W(family, staff) through eight
     sentences would have left one shared line to get wrong later. What the
     two screens share is the machinery under them, which is the part that
     has to stay one thing.

     ⚠ RULE 5 APPLIES HERE TOO. Not one word about what is owed, overdue or
     outstanding. A colleague who never opens this is told nothing at all,
     and the case manager's side answers the question the other way round —
     what the GOAL is missing, never who owes it. */
  function renderIntroStaff() {
    var sec = ensureScreen(), c = HS.cfg;
    sec.innerHTML =
      '<div class="hs-wrap">' +
        '<p class="hs-eyebrow">' + esc(T("Team contribution", "Aporte del equipo")) + "</p>" +
        "<h1>" + esc(trSkill(c.skill)) + "</h1>" +
        '<p class="hs-sub">' + esc(T(
          "One skill a student is working on, in plain language. Note how it went in your setting the last time it came up \u2014 there is nothing to prepare and nothing to look up.",
          "Una habilidad en la que un estudiante est\u00e1 trabajando, en lenguaje sencillo. Anota c\u00f3mo fue en tu entorno la \u00faltima vez que surgi\u00f3: no hay nada que preparar ni que buscar.")) + "</p>" +
        '<div class="hs-card">' +
          (staffRead(c.key) ? ('<p class="hs-said">' + esc(staffRead(c.key)) + "</p>") : "") +
          '<div class="hs-role">' +
            '<label for="hsWho">' + esc(T("You are answering as", "Respondes como")) + "</label>" +
            '<select id="hsWho">' + STAFF_ROLES.map(function (r) {
              return '<option value="' + r[0] + '"' + (HS.role === r[0] ? " selected" : "") + ">" + esc(T(r[1], r[2])) + "</option>";
            }).join("") + "</select>" +
          "</div>" +
          '<div class="hs-row" style="margin-top:14px;">' +
            '<button type="button" class="hs-btn" id="hsGo">' + esc(T("Add what you saw", "Agregar lo que viste")) + "</button>" +
          "</div>" +
        "</div>" +
        '<p class="hs-fine"><b>' + esc(T("This sits beside the measurements, not inside them.",
                                         "Esto va junto a las mediciones, no dentro de ellas.")) + "</b> " +
          esc(T("Nothing entered here changes the goal, the baseline, the target, or a single charted measurement. The case manager reads it alongside everything else the team knows.",
                "Nada de lo que se escriba aqu\u00ed cambia la meta, la l\u00ednea base, el objetivo ni ninguna medici\u00f3n graficada. La persona que coordina el caso lo lee junto con todo lo dem\u00e1s que el equipo sabe.")) + "</p>" +
        '<p class="hs-fine">' + esc(T(
          "No names are sent from this page \u2014 only a code the school already uses. This link does not show you the student's goal, their area of need, or anything anyone else has said.",
          "Esta p\u00e1gina no env\u00eda ning\u00fan nombre: solo un c\u00f3digo que la escuela ya usa. Este enlace no te muestra la meta del estudiante, su \u00e1rea de necesidad, ni nada de lo que haya dicho otra persona.")) + "</p>" +
      "</div>";
    show(sec);
    var w = el("hsWho");
    if (w) w.addEventListener("change", function () { HS.role = staffRole(w.value); });
    var g = el("hsGo");
    if (g) g.addEventListener("click", function () { if (w) HS.role = staffRole(w.value); HS.step = 1; render(); });
  }

  /* ═══ §05's OPPORTUNITY COUNT — and only for a colleague.
     ⚠ IT IS NOT ON THE FAMILY SCREEN AND MUST NOT BE. Rule 2 of this block:
     a home observation is never a score, and a denominator is the first half
     of one. A colleague is being asked a professional question, and "four of
     five" is the unit an IEP goal is actually written in.

     ⚠ NOTHING IS CLAMPED. The second row only offers 0..opportunities, so an
     impossible pair cannot be entered at all — rather than being silently
     corrected afterwards, which is the lie a clamp tells. */
  function numsHtml() {
    var opps = HS.a.opps || 0;
    function row(name, from, to, cur, lbl) {
      var h = '<p class="hs-chl">' + esc(lbl) + '</p><div class="hs-nums">';
      for (var i = from; i <= to; i++) {
        h += '<button type="button" class="hs-num' + (cur === i ? " on" : "") + '" data-n="' + name + '" data-v="' + i + '"' +
             ' aria-pressed="' + (cur === i ? "true" : "false") + '">' + i + ((i === 6 && name === "opps") ? "+" : "") + "</button>";
      }
      return h + "</div>";
    }
    return '<div class="hs-opps">' +
      row("opps", 1, 6, HS.a.opps || 0, T("Out of how many chances?", "\u00bfDe cu\u00e1ntas oportunidades?")) +
      (opps ? row("indep", 0, opps, (HS.a.indep === 0 ? 0 : (HS.a.indep || -1)),
                  T("How many on their own?", "\u00bfCu\u00e1ntas por su cuenta?")) : "") +
      '<p class="hs-why" style="margin-top:8px;">' + esc(T(
        "Optional. A count is a proposal, not a measurement \u2014 it sits beside the chart, and the case manager decides whether it belongs on it.",
        "Opcional. Un conteo es una propuesta, no una medici\u00f3n: va junto a la gr\u00e1fica, y quien coordina el caso decide si pertenece a ella.")) + "</p>" +
      "</div>";
  }

  /* --------------------------------------------------------- §10 · screen 1 */
  function renderIntro() {
    var sec = ensureScreen(), c = HS.cfg;
    var read = familyRead(c.key, c.scale);
    sec.innerHTML =
      '<div class="hs-wrap">' +
        '<p class="hs-eyebrow">' + esc(T("Skills we’re working on", "Habilidades en las que trabajamos")) + "</p>" +
        "<h1>" + esc(trSkill(c.skill)) + "</h1>" +
        '<p class="hs-sub">' + esc(T(
          "School is working on this. At home you can simply notice how it goes when it comes up on its own — there is nothing to set up and nothing to practice.",
          "En la escuela están trabajando en esto. En casa solo puedes fijarte en cómo va cuando surge por sí solo — no hay nada que preparar ni que practicar.")) + "</p>" +
        '<div class="hs-card">' +
          '<p class="hs-said">' + esc(read) + "</p>" +
          '<div class="hs-row" style="margin-top:14px;">' +
            '<button type="button" class="hs-btn" id="hsGo">' + esc(T("Check in", "Registrar")) + "</button>" +
            '<button type="button" class="hs-more" id="hsPause">' + esc(T("Pause or turn these off", "Pausar o desactivar")) + "</button>" +
          "</div>" +
        "</div>" +
        /* §09 · said out loud, every time, not buried in a help page. */
        '<p class="hs-fine"><b>' + esc(T("This is optional.", "Esto es opcional.")) + "</b> " +
          esc(T("You are not responsible for measuring anything. The school does the measuring. What you notice at home just fills in part of the picture the team would otherwise never see.",
                "No eres responsable de medir nada. La escuela hace la medición. Lo que notas en casa solo completa una parte del panorama que el equipo no vería de otro modo.")) + "</p>" +
        '<p class="hs-fine">' + esc(T(
          "No names are sent from this page — only a code the school already uses.",
          "Esta página no envía ningún nombre — solo un código que la escuela ya usa.")) + "</p>" +
      "</div>";
    show(sec);
    var g = el("hsGo");
    if (g) g.addEventListener("click", function () { HS.step = 1; render(); });
    var p = el("hsPause");
    if (p) p.addEventListener("click", function () { HS.step = 99; render(); });
  }

  /* ------------------------------------------------------- §08 · the one tap */
  function renderTap() {
    var sec = ensureScreen(), c = HS.cfg;
    var lv = levelsFor(c.scale);
    var body = lv.slice(0, 4), escape = lv[4];
    function opt(x) {
      return '<button type="button" class="hs-opt' + (HS.a.levelKey === x[0] ? " on" : "") + '" data-lv="' + x[0] + '"' +
        ' aria-pressed="' + (HS.a.levelKey === x[0] ? "true" : "false") + '">' +
        '<span class="hs-mark" aria-hidden="true"></span><span>' + esc(T(x[1], x[2])) + "</span></button>";
    }
    sec.innerHTML =
      '<div class="hs-wrap">' +
        '<p class="hs-eyebrow">' + esc(trSkill(c.skill)) + "</p>" +
        '<p class="hs-q">' + esc(trAsk(c.skill, c.ask)) + "</p>" +
        '<div>' + body.map(opt).join("") +
          /* ⚠ THE WAY OUT IS NEVER BEHIND A FOLD. A family opening this on a
             day the moment never happened must be able to say so in one tap
             — the same rule the exit slip keeps for a student. */
          '<div class="hs-esc">' + opt(escape) + "</div>" +
        "</div>" +
        '<div class="hs-row" style="margin-top:16px;">' +
          '<button type="button" class="hs-btn ghost" id="hsBack">' + esc(T("Back", "Atrás")) + "</button>" +
        "</div>" +
      "</div>";
    show(sec);
    sec.querySelectorAll("[data-lv]").forEach(function (b) {
      b.addEventListener("click", function () {
        HS.a.levelKey = b.getAttribute("data-lv");
        /* §15 · "It didn't come up" ends it immediately. No follow-up, no
           confirmation, no are-you-sure — and it is a complete answer. */
        if (HS.a.levelKey === "na") { finish(); return; }
        HS.step = 2; render();
      });
    });
    var bk = el("hsBack");
    if (bk) bk.addEventListener("click", function () { HS.step = 0; render(); });
  }

  /* ------------------------------------------------- §14 · optional, and last
     ⚠ WRITING IS A DOOR, NOT A FIELD. An always-open textarea says "explain
     yourself" whatever the placeholder claims — the same call the Daily
     Check-In made, for the same reason. */
  function renderExtra() {
    var sec = ensureScreen(), c = HS.cfg;
    function chips(name, list) {
      return '<div class="hs-chips">' + list.map(function (x, i) {
        var on = HS.a[name] === x[0];
        return '<button type="button" class="hs-chip' + (on ? " on" : "") + '" data-c="' + name + '" data-v="' + i + '"' +
          ' aria-pressed="' + (on ? "true" : "false") + '">' + esc(T(x[0], x[1])) + "</button>";
      }).join("") + "</div>";
    }
    sec.innerHTML =
      '<div class="hs-wrap">' +
        '<p class="hs-eyebrow">' + esc(trSkill(c.skill)) + "</p>" +
        "<h1>" + esc(HS.who === "staff"
            ? T("Anything else worth adding?", "¿Algo más que valga la pena agregar?")
            : T("That’s it — thank you.", "Listo — gracias.")) + "</h1>" +
        '<p class="hs-sub">' + esc(HS.who === "staff"
            ? T("Your answer is ready to send. Everything below is optional.",
                "Tu respuesta está lista para enviar. Todo lo de abajo es opcional.")
            : T("You can stop here. Anything below is optional.",
                "Puedes parar aquí. Todo lo de abajo es opcional.")) + "</p>" +
        '<div class="hs-card">' +
          /* ⚠ FOR A COLLEAGUE THE COUNT COMES BEFORE THE SEND BUTTON. Under
             it, the screen read: that is it, thank you, Send it — and then two
             questions nobody had answered yet. A screenshot caught what 91
             green assertions could not. */
          (HS.who === "staff" ? numsHtml() : "") +
          '<div class="hs-row">' +
            '<button type="button" class="hs-btn" id="hsDone">' + esc(T("Send it", "Enviar")) + "</button>" +
            '<button type="button" class="hs-more" id="hsAdd">' +
              esc(HS.open ? T("Hide the extra bits", "Ocultar lo opcional")
                          : (HS.who === "staff" ? T("Add context and a note", "Agregar contexto y una nota")
                                                : T("Add something for the teacher", "Agregar algo para el maestro"))) + "</button>" +
          "</div>" +
          (HS.open ?
            ('<p class="hs-chl">' + esc(T("When", "Cuándo")) + "</p>" + chips("when", ctxList("when")) +
             '<p class="hs-chl">' + esc(T("What was happening", "Qué estaba pasando")) + "</p>" + chips("what", ctxList("what")) +
             '<p class="hs-chl">' + esc(T("What helped", "Qué ayudó")) + "</p>" + chips("helped", ctxList("helped")) +
             '<p class="hs-chl">' + esc(HS.who === "staff"
                 ? T("Anything worth telling the case manager", "Algo que valga la pena decirle a quien coordina el caso")
                 : T("Anything worth telling the teacher", "Algo que valga la pena contar")) + "</p>" +
             '<textarea id="hsNote" rows="3" placeholder="' + esc(T("One line is plenty.", "Una línea basta.")) + '">' + esc(HS.a.note || "") + "</textarea>" +
             /* ⚠ THE FOLLOW-UP FLAG IS A REQUEST, NEVER A DIAGNOSIS. This
                checkbox and the note box are the ONLY two things that raise
                it. A hard day never does. */
             '<label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;font-size:15px;line-height:1.5;cursor:pointer;">' +
               '<input type="checkbox" id="hsAsk" style="width:20px;height:20px;margin-top:2px;"' + (HS.a.followUp ? " checked" : "") + ">" +
               "<span>" + esc(T("Please get in touch with me about this.", "Por favor comuníquense conmigo sobre esto.")) + "</span></label>")
            : "") +
        "</div>" +
        '<div class="hs-row"><button type="button" class="hs-btn ghost" id="hsBack2">' + esc(T("Back", "Atrás")) + "</button></div>" +
      "</div>";
    show(sec);
    var a = el("hsAdd");
    if (a) a.addEventListener("click", function () { keep(); HS.open = !HS.open; render(); });
    var d = el("hsDone");
    if (d) d.addEventListener("click", function () { keep(); finish(); });
    var b = el("hsBack2");
    if (b) b.addEventListener("click", function () { keep(); HS.step = 1; render(); });
    sec.querySelectorAll("[data-n]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        keep();
        var nm = btn.getAttribute("data-n"), v = +btn.getAttribute("data-v");
        if (HS.a[nm] === v) HS.a[nm] = (nm === "opps") ? 0 : "";
        else HS.a[nm] = v;
        /* Lowering the chances can orphan an independent count above it. */
        if (nm === "opps" && HS.a.indep !== "" && HS.a.indep != null && +HS.a.indep > (HS.a.opps || 0)) HS.a.indep = "";
        render();
      });
    });
    sec.querySelectorAll("[data-c]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        keep();
        var n = btn.getAttribute("data-c"), i = +btn.getAttribute("data-v");
        var list = ctxList(n);
        HS.a[n] = (HS.a[n] === list[i][0]) ? "" : list[i][0];
        render();
      });
    });
  }
  function keep() {
    var t = el("hsNote"); if (t) HS.a.note = t.value;
    var k = el("hsAsk");  if (k) HS.a.followUp = !!k.checked;
  }

  /* --------------------------------------------------------- §11 · the close */
  function renderDone() {
    var sec = ensureScreen(), c = HS.cfg;
    /* the letter's promise, every audience: after a completed submission,
       the once-ever home-screen offer */
    try { if (window.aogOfferA2HS) setTimeout(window.aogOfferA2HS, 900); } catch (e) {}
    sec.innerHTML =
      '<div class="hs-wrap">' +
        '<p class="hs-eyebrow">' + esc(trSkill(c.skill)) + "</p>" +
        "<h1>" + esc(T("Got it. Thank you.", "Recibido. Gracias.")) + "</h1>" +
        '<div class="hs-card">' + (whoRead(c.key, c.scale, HS.who)
            ? ('<p class="hs-said">' + esc(whoRead(c.key, c.scale, HS.who)) + "</p>") : "") +
          '<p class="hs-note">' + esc(HS.sent === "sent"
            ? T("Sent to school.", "Enviado a la escuela.")
            : HS.sent === "local"
              ? T("Saved on this phone. Your school has not connected a sheet yet, so nothing was sent anywhere.",
                  "Guardado en este teléfono. Tu escuela aún no ha conectado una hoja, así que no se envió a ningún lado.")
              : HS.sent === "offline"
                ? T("Saved. It will send itself when you are back online.",
                    "Guardado. Se enviará solo cuando vuelvas a tener conexión.")
                : T("Saved on this phone. It could not reach the school’s sheet — nothing is lost.",
                    "Guardado en este teléfono. No pudo llegar a la hoja de la escuela — no se perdió nada.")) + "</p>" +
        "</div>" +
        '<div class="hs-row">' +
          '<button type="button" class="hs-btn ghost" id="hsAgain">' + esc(T("Note another one", "Anotar otra")) + "</button>" +
          '<button type="button" class="hs-more" id="hsPause2">' + esc(T("Pause or turn these off", "Pausar o desactivar")) + "</button>" +
        "</div>" +
        '<p class="hs-fine">' + esc(T(
          "Nothing here is a score, and nobody is counting how often you check in. A quiet week is a quiet week.",
          "Nada de esto es una calificación, y nadie cuenta cuántas veces respondes. Una semana sin notas es solo eso.")) + "</p>" +
      "</div>";
    show(sec);
    var a = el("hsAgain");
    /* ⚠ done MUST be cleared. render() reads it before it reads step, so
       leaving it set made "Note another one" re-draw the closing screen and
       nothing else — a dead button on the one screen that has to work. */
    if (a) a.addEventListener("click", function () {
      HS.done = false; HS.step = 1; HS.a = {}; HS.open = false; HS.sent = ""; render();
    });
    var p = el("hsPause2");
    if (p) p.addEventListener("click", function () { HS.step = 99; render(); });
  }

  /* ------------------------------------------------------------ §17 · choice */
  var PAUSEK = "aog.home.paused";
  function paused(key) { try { return (jload(PAUSEK, {}) || {})[key] || ""; } catch (e) { return ""; } }
  function setPause(key, v) { var o = jload(PAUSEK, {}) || {}; if (v) o[key] = v; else delete o[key]; jsave(PAUSEK, o); }

  function renderChoice() {
    var sec = ensureScreen(), c = HS.cfg, st = paused(c.key);
    sec.innerHTML =
      '<div class="hs-wrap">' +
        "<h1>" + esc(T("Your choice, always", "Tú decides, siempre")) + "</h1>" +
        /* ⚠ §28 · not one word that reads as an obligation, INCLUDING inside
           a negation. "Nothing here is required" still puts the word
           "required" on a family's screen, and that is the word they take
           away from it. Say what is true without it. */
        '<p class="hs-sub">' + esc(T(
          "Any of these is a fine choice. Turning it off changes nothing about your child’s school plan or about what school is doing.",
          "Cualquiera de estas opciones está bien. Desactivarlo no cambia nada del plan escolar de tu hijo/a ni de lo que hace la escuela.")) + "</p>" +
        '<div class="hs-card">' +
          '<button type="button" class="hs-opt' + (!st ? " on" : "") + '" data-p=""><span class="hs-mark" aria-hidden="true"></span><span>' +
            esc(T("Keep checking in when it suits me", "Seguir registrando cuando me acomode")) + "</span></button>" +
          '<button type="button" class="hs-opt' + (st === "pause" ? " on" : "") + '" data-p="pause"><span class="hs-mark" aria-hidden="true"></span><span>' +
            esc(T("Pause for now", "Pausar por ahora")) + "</span></button>" +
          '<button type="button" class="hs-opt' + (st === "off" ? " on" : "") + '" data-p="off"><span class="hs-mark" aria-hidden="true"></span><span>' +
            esc(T("Turn these off", "Desactivar")) + "</span></button>" +
        "</div>" +
        '<div class="hs-row"><button type="button" class="hs-btn ghost" id="hsBack3">' + esc(T("Back", "Atrás")) + "</button></div>" +
        '<p class="hs-fine">' + esc(T(
          "This only changes this page on this phone. Tell your child’s teacher if you would rather they stopped sending the link.",
          "Esto solo cambia esta página en este teléfono. Avísale al maestro/a si prefieres que dejen de enviarte el enlace.")) + "</p>" +
      "</div>";
    show(sec);
    sec.querySelectorAll("[data-p]").forEach(function (b) {
      b.addEventListener("click", function () { setPause(c.key, b.getAttribute("data-p")); render(); });
    });
    var bk = el("hsBack3");
    if (bk) bk.addEventListener("click", function () { HS.step = 0; render(); });
  }

  function show(sec) {
    /* ⚠ SHOW BEFORE ANYTHING MEASURES. The exit slip and the check-in both
       shipped a bug where a display:none section measured zero. Nothing here
       measures yet — but the order is the order. */
    try { if (typeof showScreen === "function") showScreen("screen-home-skills"); else sec.classList.add("active"); }
    catch (e) { sec.classList.add("active"); }
  }

  function render() {
    if (!HS || !HS.cfg) return;
    if (HS.step === 99) return renderChoice();
    if (HS.done) return renderDone();
    if (HS.step === 2) return renderExtra();
    if (HS.step === 1) return renderTap();
    return HS.who === "staff" ? renderIntroStaff() : renderIntro();
  }

  function finish() {
    var c = HS.cfg;
    var rec = {
      timestamp: new Date().toISOString(),
      date: todayISO(),
      year: window.AOGYear ? AOGYear(todayISO()) : "",
      slipType: "home",
      homeKey: c.key,
      skill: c.skill,                        /* the ENGLISH label always */
      level: levelEn(c.scale, HS.a.levelKey),
      levelKey: HS.a.levelKey || "",
      districtId: c.districtId || "", schoolId: c.schoolId || "",
      classId: c.classId || "", grade: c.grade || "", term: c.term || "",
      studentId: c.code || "",
      /* ═══ THE SECOND VALUE. "family" for a family link, the colleague's
         ROLE for a colleague link — never a name, never an email, never a
         staff id. The link is what says which; nobody types it. */
      respondentRole: (HS.who === "staff" ? (staffRole(HS.role) || "other_staff") : "family"),
      timeOfDay: HS.a.when || "", activity: HS.a.what || "", support: HS.a.helped || "",
      note: (HS.a.note || "").trim(),
      /* Kept top-level for this device's own rendering; the Sheet takes them
         inside `extra`, because the .gs writes only the columns row 1 names. */
      opps:  HS.who === "staff" ? (HS.a.opps || "") : "",
      indep: HS.who === "staff" ? (HS.a.indep === 0 ? 0 : (HS.a.indep || "")) : "",
      extra: HS.who === "staff" ? xPack(HS.a) : "",
      /* ⚠ EXACTLY TWO THINGS RAISE THIS. Not a hard day. Not "needed help". */
      followUp: !!(HS.a.note && HS.a.note.trim()) || !!HS.a.followUp,
      source: "link",
      submitTime: clockNow()
    };
    addObs(c.key, rec);
    queuePush(rec);
    HS.done = true;
    HS.sent = "";
    render();
    sync(rec).then(function (r) { HS.sent = r; if (HS.done) render(); });
  }

  /* ----------------------------------------------------------- the way in */
  function openFromLink(cfg) {
    HS = { cfg: cfg, step: 0, a: {}, open: false, done: false, sent: "",
           who: (cfg && cfg.who === "staff") ? "staff" : "family",
           role: staffRole(cfg && cfg.role) };
    css();
    render();
  }

  /* ══════════════════════════════════════════════════ §06 · THE TEACHER SIDE
     ⚠ NOTHING IN #aog-iep-js IS TOUCHED. This decorates the rendered goal
     card from outside, the same way the per-student links decorate the class
     panel. The IEP Progress Monitor keeps every line it had; if this block
     were deleted tomorrow the monitor would be exactly what it was.

     §27's test: connect an existing goal to home in under thirty seconds.
     So the whole flow is one inline panel on the card — no modal, no wizard,
     no second screen — with everything pre-filled and a real way to say no. */
  function tcss() {
    if (el("aogHsTeacherCss")) return;
    var s = document.createElement("style");
    s.id = "aogHsTeacherCss";
    s.textContent = [
      ".hs-strip{margin-top:14px;padding-top:12px;border-top:1px solid var(--rule,#E4DAC5);}",
      ".hs-strip .hs-lead{background:none;border:0;padding:6px 2px;font-family:inherit;font-size:13.5px;",
      "  font-weight:750;color:var(--aog-dusk,#4A5578);cursor:pointer;text-decoration:underline;text-underline-offset:3px;}",
      ".hs-strip .hs-lead:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;border-radius:6px;}",
      ".hs-on{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:12.5px;}",
      ".hs-badge{display:inline-flex;align-items:center;gap:6px;background:var(--aog-pale,#EEF0F6);",
      "  color:var(--aog-deep,#333C57);border-radius:999px;padding:4px 11px;font-weight:800;",
      "  font-size:11px;letter-spacing:.06em;text-transform:uppercase;}",
      ".hs-skillname{font-weight:750;color:var(--ink,#0A1E33);font-size:13.5px;}",
      ".hs-count{color:var(--ink-faint,#646E86);}",
      ".hs-sync{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:9px;font-size:12px;}",
      ".hs-dot{width:8px;height:8px;border-radius:50%;background:var(--ink-faint,#646E86);flex:0 0 auto;}",
      ".hs-dot.on{background:var(--green,#2E6B3A);}",
      ".hs-sl{color:var(--ink-soft,#46506E);font-weight:650;}",
      ".hs-sl.dim{color:var(--ink-faint,#646E86);font-weight:400;}",
      ".hs-said{font-weight:700;color:var(--green,#2E6B3A);}",
      ".hs-period{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin:0 0 9px;font-size:12.5px;}",
      ".hs-perl{font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft,#46506E);}",
      ".hs-perb{color:var(--ink-soft,#46506E);}",
      /* ⚠ WEIGHT, NOT COLOR. --ink-faint measures 3.08:1 here and this panel's
         standing rule is that color is never the information. */
      ".hs-period.bare .hs-perb{font-weight:750;color:var(--ink,#0A1E33);}",
      ".hs-team{margin-top:14px;padding-top:12px;border-top:1px dashed var(--rule,#E4DAC5);}",
      ".hs-team .hs-l{margin-top:8px;}",
      ".hs-team select{min-height:38px;font:inherit;font-size:14px;padding:6px 9px;",
      "  border:1px solid var(--rule,#E4DAC5);border-radius:8px;background:var(--paper,#FBF8F1);",
      "  color:var(--ink,#0A1E33);max-width:320px;}",
      ".hs-said.bad{color:var(--amber,#8A6D1F);}",
      ".hs-panel{margin-top:12px;background:var(--card-soft,rgba(74,85,120,.05));border:1px solid var(--rule,#E4DAC5);",
      "  border-radius:12px;padding:14px 15px;}",
      ".hs-panel h4{margin:0 0 4px;font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-soft,#46506E);}",
      ".hs-panel p.hs-why{margin:0 0 12px;font-size:12.5px;line-height:1.6;color:var(--ink-soft,#46506E);}",
      ".hs-fits{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}",
      ".hs-fit{border:1.5px solid var(--rule,#E4DAC5);background:var(--card,#fff);border-radius:999px;",
      "  padding:7px 14px;font-family:inherit;font-size:12.5px;font-weight:700;color:var(--ink,#0A1E33);cursor:pointer;}",
      ".hs-fit.on{background:var(--aog-pale,#EEF0F6);border-color:var(--aog-dusk,#4A5578);}",
      ".hs-panel label.hs-l{display:block;font-size:11.5px;font-weight:800;letter-spacing:.05em;",
      "  text-transform:uppercase;color:var(--ink-faint,#646E86);margin:10px 0 4px;}",
      ".hs-panel input[type=text],.hs-panel select{width:100%;max-width:460px;padding:9px 11px;border:1px solid var(--rule,#E4DAC5);",
      "  border-radius:8px;font-family:inherit;font-size:13.5px;background:var(--card,#fff);color:var(--ink,#0A1E33);}",
      ".hs-sug{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px;}",
      ".hs-sugb{border:1px solid var(--rule,#E4DAC5);background:var(--card,#fff);border-radius:999px;padding:5px 11px;",
      "  font-family:inherit;font-size:12px;font-weight:650;color:var(--ink-soft,#46506E);cursor:pointer;}",
      ".hs-prev{margin-top:12px;padding:12px 13px;border-left:3px solid var(--aog-dusk,#4A5578);",
      "  background:var(--card,#fff);border-radius:0 8px 8px 0;}",
      ".hs-prev .p1{font-size:11.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-faint,#646E86);}",
      ".hs-prev .p2{font-size:15px;font-weight:750;color:var(--ink,#0A1E33);margin-top:3px;}",
      ".hs-prev .p3{font-size:12.5px;color:var(--ink-soft,#46506E);margin-top:5px;line-height:1.55;}",
      ".hs-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center;}",
      ".hs-url{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--ink-faint,#646E86);",
      "  user-select:all;word-break:break-all;max-width:100%;display:block;margin-top:8px;}",
      ".hs-qr{width:132px;height:132px;background:#fff;border:1px solid var(--rule,#E4DAC5);border-radius:8px;",
      "  display:flex;align-items:center;justify-content:center;margin-top:10px;}",
      ".hs-qr img,.hs-qr canvas{width:120px;height:120px;display:block;}",
      /* §13 · the two-environment view */
      ".hs-env{margin-top:12px;border:1px solid var(--rule,#E4DAC5);border-radius:12px;overflow:hidden;}",
      ".hs-env h4{margin:0;padding:10px 14px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;",
      "  color:var(--ink-soft,#46506E);background:var(--card-soft,rgba(74,85,120,.05));}",
      ".hs-erow{display:flex;gap:12px;align-items:baseline;padding:11px 14px;border-top:1px solid var(--rule,#E4DAC5);flex-wrap:wrap;}",
      ".hs-esrc{flex:0 0 132px;font-size:12px;font-weight:800;color:var(--ink,#0A1E33);}",
      ".hs-ewhat{flex:1;min-width:180px;font-size:12.5px;color:var(--ink-soft,#46506E);line-height:1.55;}",
      /* §13 · the side-by-side table. Numbers right-aligned and tabular so a
         tie reads as a tie at a glance; no cell ever gets a color. */
      ".hs-cmpt{border-collapse:collapse;margin:0 0 7px;font-variant-numeric:tabular-nums;}",
      ".hs-cmpt td,.hs-cmpt th{padding:3px 0;font-size:12.5px;text-align:left;font-weight:400;color:var(--ink-soft,#46506E);}",
      ".hs-cmpt thead th{font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--ink,#0A1E33);text-align:right;padding-left:26px;}",
      ".hs-cmpt tbody th{padding-right:8px;}",
      ".hs-cmpt tbody td{font-weight:750;color:var(--ink,#0A1E33);text-align:right;padding-left:26px;}",
      ".hs-cmpn{font-weight:650;color:var(--ink-faint,#646E86);}",
      ".hs-ask{padding:11px 14px;border-top:1px solid var(--rule,#E4DAC5);font-size:12.5px;line-height:1.7;color:var(--ink-soft,#46506E);}",
      ".hs-ask b{color:var(--ink,#0A1E33);}",
      ".hs-note-pro{padding:11px 14px;border-top:1px solid var(--rule,#E4DAC5);font-size:11.5px;line-height:1.6;color:var(--ink-faint,#646E86);}",
      ".hs-who{border-top:1px solid var(--rule,#E4DAC5);}",
      ".hs-who>summary{padding:11px 14px;font-size:12.5px;font-weight:750;color:var(--ink,#0A1E33);cursor:pointer;list-style:revert;}",
      ".hs-who>summary:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:-3px;}",
      ".hs-wholist{margin:0;padding:0 14px 12px 14px;list-style:none;}",
      ".hs-whoitem{display:block;padding:9px 0;border-top:1px dotted var(--rule,#E4DAC5);}",
      ".hs-wholist>.hs-whoitem:first-child{border-top:0;}",
      ".hs-whohead{display:block;font-size:12.5px;font-weight:750;color:var(--ink,#0A1E33);}",
      ".hs-whosaid{display:block;font-size:12.5px;color:var(--ink-soft,#46506E);margin-top:2px;}",
      ".hs-whoctx{display:block;font-size:12px;color:var(--ink-soft,#46506E);margin-top:2px;}",
      ".hs-whonote{display:block;font-size:12.5px;color:var(--ink,#0A1E33);margin-top:4px;line-height:1.55;}",
      ".hs-whomore{margin:0;padding:0 14px 12px;font-size:11.5px;color:var(--ink-soft,#46506E);}",
      "@media print{.hs-strip .hs-lead,.hs-acts,.hs-qr{display:none !important;}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  var OPEN = {};   /* which goal's connect panel is unfolded */

  function goalArea(g) { return (g && g.area) || "other"; }

  /* ═══════════════════ WHAT THIS GOAL IS MISSING, IN ONE LINE
     Shape B, the call Jimmy made on 2026-08-29: the question is what the GOAL
     is short of, never who owes anybody data. Three counts and a date; no
     name, no pending column, nothing overdue.

     ⚠ THE PERIOD COMES FROM THE MONITOR, AND THIS BLOCK NEVER INVENTS ONE.
     With no report date set in the IEP door, this returns "" and the card is
     exactly what it was.

     ⚠ IT READS DATES AS STRINGS. Every date in both stores is YYYY-MM-DD, so
     lexical order is chronological — the same comparison inLast() already
     makes. No day-number arithmetic, and nothing to disagree with the
     monitor's own window. */
  function isoMinusDays(iso, n) {
    try {
      var p = String(iso || "").split("-");
      if (p.length !== 3) return "";
      var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
      d.setUTCDate(d.getUTCDate() - n);
      return d.toISOString().slice(0, 10);
    } catch (e) { return ""; }
  }
  function reportPeriod() {
    var st = iep(), rep = st && st.report;
    if (!rep || !rep.due) return null;
    var w = parseInt(rep.weeks, 10); if (!isFinite(w) || w < 1 || w > 52) w = 9;
    var from = isoMinusDays(rep.due, w * 7);
    if (!from) return null;
    return { from: from, to: String(rep.due), weeks: w };
  }
  function inWindow(list, per, key) {
    return (list || []).filter(function (x) {
      var d = String((x && x[key || "date"]) || "");
      return d && d >= per.from && d <= per.to;
    });
  }
  function periodHtml(goalId, c) {
    var per = reportPeriod();
    if (!per) return "";
    var pts = inWindow((iep().data || {})[goalId] || [], per).length;
    var bits = [];
    bits.push(pts
      ? T(pts + (pts === 1 ? " school measurement" : " school measurements"),
          pts + (pts === 1 ? " medición escolar" : " mediciones escolares"))
      : T("no school measurements", "sin mediciones escolares"));
    var askable = false;
    if (c && c.on) {
      /* ⚠ SCOPED THE SAME WAY EVERY OTHER READ IS. Classroom and home are two
         perspectives with two meanings and they are never added together —
         the rule §14 kept for two and .29ac kept for three. */
      var kn = inWindow(counted(obsForWho(c.key, "staff")), per).length;
      var hn = inWindow(counted(obsForWho(c.key, "family")), per).length;
      askable = !kn;
      bits.push(kn
        ? T(kn + (kn === 1 ? " classroom observation" : " classroom observations"),
            kn + (kn === 1 ? " observación en clase" : " observaciones en clase"))
        : T("no classroom observations", "sin observaciones en clase"));
      bits.push(hn
        ? T(hn + (hn === 1 ? " at home" : " at home"), hn + (hn === 1 ? " en casa" : " en casa"))
        : T("none at home", "ninguna en casa"));
    }
    /* Emphasis only on the one that stops a report being written at all. */
    return '<div class="hs-period' + (pts ? "" : " bare") + '">' +
      '<span class="hs-perl">' + esc(T("This reporting period", "Este período de informe")) + "</span>" +
      '<span class="hs-perb">' + esc(bits.join(" · ") + ".") + "</span>" +
      (askable ? ('<button type="button" class="hs-lead" data-hsopen="' + esc(goalId) + '">' +
        esc(T("Ask a colleague →", "Pedirle a un/a colega →")) + "</button>") : "") +
      "</div>";
  }

  function stripHtml(goalId, g) {
    var c = cfgFor(goalId);
    var open = !!OPEN[goalId];
    var h = '<div class="hs-strip" data-hs="' + esc(goalId) + '">';
    h += periodHtml(goalId, c);

    if (c && c.on) {
      /* ⚠ SCOPED, BECAUSE THE LABEL SAYS WHICH KIND. This read was
         `counted(obsFor(c.key))` — unscoped — and printed as "N home
         observations", so three classroom observations and nothing from home
         read as "3 home observations" directly above a card whose home row
         correctly said "No home observations yet". obsForWho exists exactly
         so these two kinds of row are never read as each other. */
      var nh = counted(obsForWho(c.key, "family")).length;
      var nk = counted(obsForWho(c.key, "staff")).length;
      var n = nh + nk;
      var countTxt = nh
        ? T(nh + (nh === 1 ? " home observation" : " home observations"), nh + (nh === 1 ? " observación en casa" : " observaciones en casa"))
        : T("No home observations yet", "Aún no hay observaciones en casa");
      /* Named separately and never added into the line above — three sources,
         three sentences, one stop, the same rule the card below keeps. */
      if (nk) countTxt += T(" · " + nk + (nk === 1 ? " from a colleague" : " from colleagues"),
                            " · " + nk + (nk === 1 ? " de un/a colega" : " de colegas"));
      h += '<div class="hs-on">' +
        '<span class="hs-badge">' + esc(T("Home", "Casa")) + "</span>" +
        '<span class="hs-skillname">' + esc(trSkill(c.skill)) + "</span>" +
        '<span class="hs-count">' + esc(countTxt) + "</span>" +
        '<button type="button" class="hs-lead" data-hsopen="' + esc(goalId) + '">' +
          esc(open ? T("Close", "Cerrar") : T("Send it home · Edit · Turn off", "Enviar a casa · Editar · Desactivar")) + "</button>" +
        "</div>" + syncHtml(goalId);
      if (n) h += envHtml(goalId);
    } else if (c && c.fit === "no") {
      /* §16 · "Not appropriate" is a real answer and stays visible as one,
         so nobody re-asks the question every time they open the card. */
      h += '<div class="hs-on"><span class="hs-count">' +
        esc(T("Home connection: not appropriate for this goal.", "Conexión con casa: no corresponde para esta meta.")) + "</span>" +
        '<button type="button" class="hs-lead" data-hsopen="' + esc(goalId) + '">' + esc(T("Change", "Cambiar")) + "</button></div>";
    } else {
      h += '<button type="button" class="hs-lead" data-hsopen="' + esc(goalId) + '">' +
        esc(open ? T("Close", "Cerrar") : T("Connect this goal to home →", "Conectar esta meta con la casa →")) + "</button>";
    }

    if (open) h += panelHtml(goalId, g, c);
    return h + "</div>";
  }

  /* ⚠ WITHOUT THIS THE LAYER DOES NOT WORK FOR THE TEACHER IT WAS BUILT FOR.
     A family taps on their own phone; that row reaches the school's Sheet and
     stops there. `aogPullHome` existed from the first build and nothing on any
     screen called it, so the observations were reachable only from a console.
     Same strip, same wording and same honesty as the exit slip's §14 line:
     say whether sync is on, say when it last ran, and put the button where
     the person looking for those observations is already looking.

     ⚠ ONE PULL BRINGS BACK EVERY CONNECTED GOAL, not this one — pressing it
     on a card and having it silently mean something wider is the kind of
     surprise this product does not do, so the button says so. */
  function syncHtml(goalId) {
    var can = false, last = "";
    try { can = !!(destination().url && deviceReadKey()); } catch (e) {}
    try {
      var lp = window.aogHomeLastPulled ? window.aogHomeLastPulled() : "";
      if (lp) last = new Date(lp).toLocaleTimeString(isEs() ? "es" : "en", { hour: "numeric", minute: "2-digit" });
    } catch (e) {}
    return '<div class="hs-sync">' +
      '<span class="hs-dot' + (can ? " on" : "") + '" aria-hidden="true"></span>' +
      '<span class="hs-sl">' + esc(T("School sync", "Sincronización") + " · " +
        (can ? T("On", "Activada") : T("Off", "Desactivada"))) + "</span>" +
      (last ? '<span class="hs-sl dim">' + esc(T("Last pulled: ", "Última vez: ") + last) + "</span>" : "") +
      '<button type="button" class="iep-mini" data-hspull="' + esc(goalId) + '"' + (can ? "" : " disabled") + ">" +
        esc(T("Bring home notes down", "Traer notas de casa")) + "</button>" +
      '<span class="hs-sl dim">' + esc(T("for every connected goal", "para todas las metas conectadas")) + "</span>" +
      '<span class="hs-said" id="hsPull_' + esc(goalId) + '" role="status" aria-live="polite"></span>' +
      "</div>";
  }

  function panelHtml(goalId, g, c) {
    var area = goalArea(g);
    var sug = SKILLS[area] || SKILLS.other;
    var skill = (c && c.skill) || sug[0][0];
    var ask   = (c && c.ask)   || sug[0][1];
    var scale = scaleOf((c && c.scale) || AREA_SCALE[area]);
    var fit   = (c && c.fit) || "optional";
    var link  = c && c.on ? linkFor(c) : "";

    var h = '<div class="hs-panel">' +
      "<h4>" + esc(T("Connect this goal to home", "Conectar esta meta con la casa")) + "</h4>" +
      '<p class="hs-why">' + esc(T(
        "The goal stays the goal — nothing below changes the IEP, the baseline, the target or a single measurement. It only creates a plain-language version of the same underlying skill that a family can notice at home.",
        "La meta sigue siendo la meta — nada de esto cambia el IEP, la línea base, la meta ni ninguna medición. Solo crea una versión en lenguaje sencillo de la misma habilidad que una familia puede notar en casa.")) + "</p>" +

      /* §16 · DO NOT FORCE EVERY GOAL INTO HOME. "Not appropriate" is offered
         first-class, in the same row, at the same size as yes. */
      '<label class="hs-l">' + esc(T("Does this one belong at home?", "¿Esta corresponde en casa?")) + "</label>" +
      '<div class="hs-fits">' +
        ["recommended", "optional", "no"].map(function (k) {
          var w = k === "recommended" ? T("Recommended", "Recomendada")
                : k === "optional"    ? T("Optional", "Opcional")
                                      : T("Not appropriate", "No corresponde");
          return '<button type="button" class="hs-fit' + (fit === k ? " on" : "") + '" data-hsfit="' + goalId + "|" + k + '"' +
            ' aria-pressed="' + (fit === k ? "true" : "false") + '">' + esc(w) + "</button>";
        }).join("") + "</div>";

    if (fit === "no") {
      h += '<p class="hs-why">' + esc(T(
        "Nothing goes home for this goal. That is a complete answer — some goals only make sense under educational conditions, and the point of this layer is useful continuity, not more data.",
        "Nada se envía a casa para esta meta. Es una respuesta completa — algunas metas solo tienen sentido en condiciones educativas, y el objetivo aquí es continuidad útil, no más datos.")) + "</p>" +
        '<div class="hs-acts"><button type="button" class="iep-mini" data-hssave="' + esc(goalId) + '">' +
        esc(T("Save", "Guardar")) + "</button></div></div>";
      return h;
    }

    h += '<label class="hs-l" for="hsSkill_' + esc(goalId) + '">' +
        esc(T("The skill, in words a family would use", "La habilidad, en palabras que una familia usaría")) + "</label>" +
      '<input type="text" id="hsSkill_' + esc(goalId) + '" value="' + esc(skill) + '" maxlength="60">' +
      '<div class="hs-sug">' + sug.map(function (x, i) {
        return '<button type="button" class="hs-sugb" data-hssug="' + goalId + "|" + i + '">' + esc(trSkill(x[0])) + "</button>";
      }).join("") + "</div>" +

      '<label class="hs-l" for="hsAsk_' + esc(goalId) + '">' +
        esc(T("What a family will be asked", "Lo que se le preguntará a la familia")) + "</label>" +
      '<input type="text" id="hsAsk_' + esc(goalId) + '" value="' + esc(ask) + '" maxlength="120">' +

      '<label class="hs-l" for="hsScale_' + esc(goalId) + '">' +
        esc(T("How they answer", "Cómo responden")) + "</label>" +
      '<select id="hsScale_' + esc(goalId) + '">' +
        Object.keys(SCALES).map(function (k) {
          return '<option value="' + k + '"' + (scale === k ? " selected" : "") + ">" +
            esc(T(SCALE_LBL[k][0], SCALE_LBL[k][1])) + "</option>";
        }).join("") + "</select>" +

      '<label class="hs-l" for="hsCode_' + esc(goalId) + '">' +
        esc(T("Student code for the sheet", "Código del estudiante para la hoja")) +
        ' <span style="text-transform:none;letter-spacing:normal;font-weight:400;">' +
        esc(T("(optional — the same opaque code you already use. Never a name.)",
              "(opcional — el mismo código opaco que ya usas. Nunca un nombre.)")) + "</span></label>" +
      '<input type="text" id="hsCode_' + esc(goalId) + '" value="' + esc((c && c.code) || "") + '" maxlength="24" placeholder="A104">' +

      /* Shown exactly as the family will read it, before it is sent. */
      '<div class="hs-prev"><div class="p1">' + esc(T("What they will see", "Lo que verán")) + "</div>" +
        '<div class="p2" id="hsPv_' + esc(goalId) + '">' + esc(ask) + "</div>" +
        '<div class="p3">' + esc(levelsFor(scale).map(function (x) { return T(x[1], x[2]); }).join(" · ")) + "</div></div>" +

      '<div class="hs-acts">' +
        '<button type="button" class="iep-mini" data-hssave="' + esc(goalId) + '">' +
          esc(c && c.on ? T("Save changes", "Guardar cambios") : T("Turn it on and make a link", "Activar y crear un enlace")) + "</button>" +
        (c && c.on ? '<button type="button" class="iep-mini" data-hscopy="' + esc(goalId) + '">' + esc(T("Copy the family link", "Copiar el enlace")) + "</button>" +
                     '<button type="button" class="iep-mini" data-hsmsg="' + esc(goalId) + '">' + esc(T("Copy a message to send", "Copiar un mensaje")) + "</button>" +
                     '<button type="button" class="iep-mini" data-hsoff="' + esc(goalId) + '">' + esc(T("Turn off", "Desactivar")) + "</button>" : "") +
        '<span class="hs-said" id="hsSaid_' + esc(goalId) + '" role="status" aria-live="polite" style="font-size:12px;font-weight:700;color:var(--green,#2E6B3A);"></span>' +
      "</div>" +
      (link ? ('<code class="hs-url">' + esc(link.length > 220 ? link.slice(0, 200) + "…" : link) + "</code>" +
               '<div class="hs-qr" data-hsqr="' + esc(link) + '"></div>') : "") +

      /* ═══ THE SECOND LINK. The same connected goal, handed to a colleague
         instead of a family. No QR: a colleague gets this in an email, not
         off a wall, and a second QR on this card is one more thing to
         explain. The ROLE is chosen here, so the row knows who answered
         without anyone typing a name. */
      (c && c.on ? ('<div class="hs-team">' +
        "<h4>" + esc(T("Ask a colleague", "Pedirle a un/a colega")) + "</h4>" +
        '<p class="hs-why">' + esc(T(
          "The same skill, sent to someone else on this student\u2019s team. What comes back sits beside the measurements the same way a home observation does \u2014 it is not added to them, and nothing arrives on the chart on its own.",
          "La misma habilidad, enviada a otra persona del equipo de este estudiante. Lo que regrese va junto a las mediciones igual que una observaci\u00f3n de casa: no se suma a ellas, y nada llega a la gr\u00e1fica por su cuenta.")) + "</p>" +
        '<label class="hs-l" for="hsRole_' + esc(goalId) + '">' + esc(T("Who are you asking?", "\u00bfA qui\u00e9n le pides?")) + "</label>" +
        '<select id="hsRole_' + esc(goalId) + '">' + STAFF_ROLES.map(function (r) {
          return '<option value="' + r[0] + '">' + esc(T(r[1], r[2])) + "</option>";
        }).join("") + "</select>" +
        '<div class="hs-acts" style="margin-top:10px;">' +
          '<button type="button" class="iep-mini" data-hstcopy="' + esc(goalId) + '">' + esc(T("Copy the colleague link", "Copiar el enlace del colega")) + "</button>" +
          '<button type="button" class="iep-mini" data-hstmsg="' + esc(goalId) + '">' + esc(T("Copy a message to send", "Copiar un mensaje")) + "</button>" +
        "</div>" +
        '<p class="hs-why" style="margin-top:10px;">' + esc(T(
          "A colleague link carries one more thing than the family link and nothing else: which role is answering. It still carries no name, no goal text, no area of need, no sheet address and no passcode \u2014 and it still cannot read anything back.",
          "El enlace de un colega lleva una cosa m\u00e1s que el de la familia y nada m\u00e1s: qu\u00e9 funci\u00f3n responde. Sigue sin llevar nombre, ni el texto de la meta, ni el \u00e1rea de necesidad, ni la direcci\u00f3n de la hoja, ni ninguna contrase\u00f1a \u2014 y sigue sin poder leer nada de vuelta.")) + "</p>" +
        "</div>") : "") +
      '<p class="hs-why" style="margin-top:12px;">' + esc(T(
        "The link carries an opaque key, the code above, and the two sentences you just wrote. It does not carry your student’s name, the goal, the disability, the sheet address or any passcode.",
        "El enlace lleva una clave opaca, el código de arriba y las dos frases que escribiste. No lleva el nombre del estudiante, la meta, la discapacidad, la dirección de la hoja ni ninguna contraseña.")) + "</p>" +
      "</div>";
    return h;
  }

  /* ═════════════════════════════════ §13 · SAME SKILL, TWO ENVIRONMENTS
     ⚠ THE TWO ROWS ARE NEVER COMBINED INTO ONE NUMBER, and the label on each
     says what it is. §12: the graph must never imply that home data and
     school data are interchangeable, so this is not a graph. It is two
     sentences that name their own source, and then a question.

     ⚠ IT NEVER SAYS WHY. §13's list is offered as things that MIGHT be true,
     phrased as possibilities, and the tool stops there. If you find yourself
     writing "because", delete the sentence. */
  /* ═══════════════════════════════ §11 · WHO SAW WHAT
     "Do not flatten all evidence into anonymous numbers. The source of
     evidence is meaningful." The row above this one says "3 observations
     · 2 on their own · 1 with a reminder, from colleagues on the team" — true,
     and it cannot answer the only question a case manager actually has, which
     is WHICH colleague, WHEN, and doing WHAT.

     ⚠ CLASSROOM ROWS ONLY. The family's rows keep the treatment they already
     have — counts, and a follow-up flag when they typed something. Opening a
     family's individual words onto the goal card is a separate call and this
     build does not make it quietly. To extend: pass "family" to obsForWho and
     give the summary its own count.

     ⚠ A ROLE, NEVER A NAME. respondentRole is the only identity these rows
     carry, on purpose — the link never asked for a name and this must not
     become the screen that makes someone want one.

     ⚠ IT IS BEHIND A DISCLOSURE AND CLOSED BY DEFAULT. The standing problem
     with this product is that too much is visible at once. A case manager who
     wants the detail opens it; a case manager reading the card does not have
     to step over it.

     ⚠ NOTHING HERE IS A MEASUREMENT and nothing here is added to anything.
     Rule 1 and Rule 2 of the home–school layer apply to classroom rows word
     for word; the professional note at the foot of this card still says so. */
  /* ⚠ envHtml's own fdate() is NESTED INSIDE IT and is not in scope here.
     Same three lines, at block scope, so both callers keep one format. */
  function shortDate(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return String(iso || "");
    return (+p[1]) + "/" + (+p[2]);
  }
  function whoLine(r) {
    var bits = [];
    var lv = levelLabel(r.skill, r.levelKey) || r.level || "";
    if (lv) bits.push(lv);
    /* The counts a colleague gave, printed as the pair they were entered as
       and NEVER as a percentage. §11 again: a denominator is the first half
       of a score, and this row is not a score. */
    var op = (r.opps === 0 || r.opps) ? +r.opps : xNum(r.extra, "opps");
    var ip = (r.indep === 0 || r.indep) ? +r.indep : xNum(r.extra, "indep");
    if (op !== "" && isFinite(op) && op > 0 && ip !== "" && isFinite(ip)) {
      bits.push(T(ip + " of " + op + " chances", ip + " de " + op + " oportunidades"));
    }
    return bits.join(" · ");
  }
  /* ── the Remove control  ·  .30dq ───────────────────────────────────────
     ⚠ TWO PRESSES, NEVER A BROWSER DIALOG, and ⚠ NO RED — the same contract
     the slip and the check-in carry. This list is a colleague's own sentence
     about a child; a red control beside it would rank it. */
  var HSDEL = { said: "", last: null, t: 0 };
  function hsDelBtn(key, r) {
    return ' <button type="button" class="hs-del" data-hsdel="' + esc(hKeys(key, r)[0]) + '"' +
      ' style="font:inherit;font-size:10.5px;font-weight:700;cursor:pointer;border:1px solid var(--rule,#E4DAC5);' +
      'background:var(--card,#fff);color:var(--ink-soft,#5b6675);border-radius:999px;padding:1px 9px;margin-left:8px;">' +
      esc(T("Remove", "Quitar")) + "</button>";
  }
  function hsRemovedLine(n) {
    return n === 1
      ? T("Removed 1 observation. It will not come back the next time you pull. The row in your Google Sheet is untouched — delete it there if you want it gone from the Sheet too.",
          "Se quitó 1 observación. No volverá la próxima vez que traigas datos. La fila de tu Hoja de Google queda intacta — bórrala allí si también quieres que desaparezca de la Hoja.")
      : T("Removed " + n + " observations. They will not come back the next time you pull. The rows in your Google Sheet are untouched — delete them there if you want them gone from the Sheet too.",
          "Se quitaron " + n + " observaciones. No volverán la próxima vez que traigas datos. Las filas de tu Hoja de Google quedan intactas — bórralas allí si también quieres que desaparezcan de la Hoja.");
  }
  function hsDelNote() {
    if (!HSDEL.said) return "";
    return '<p id="hsDelSaid" style="margin:10px 0 8px;padding:9px 12px;border:1px solid var(--gold,#D9A33B);' +
      'border-radius:9px;background:var(--card,#fff);color:var(--ink,#22303F);font-size:12.5px;line-height:1.6;">' +
      esc(HSDEL.said) +
      (HSDEL.last ? ' <button type="button" id="hsDelUndo" style="font:inherit;font-size:12px;font-weight:800;' +
        'cursor:pointer;border:1px solid var(--gold,#D9A33B);background:var(--card,#fff);color:var(--ink,#22303F);' +
        'border-radius:999px;padding:2px 12px;margin-left:8px;">' + esc(T("Undo", "Deshacer")) + "</button>" : "") +
      "</p>";
  }
  function hsDisarm() {
    try { clearTimeout(HSDEL.t); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll(".hs-del[data-armed]"), function (o) {
      var was = o.getAttribute("data-was");
      o.removeAttribute("data-armed");
      if (was != null) { o.textContent = was; o.removeAttribute("data-was"); }
    });
  }
  function hsRepaint() { try { paint(); } catch (e) {} }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#hsDelUndo")) {
      var n = 0;
      try { n = restoreObs(HSDEL.last || []); } catch (x) {}
      HSDEL.last = null;
      HSDEL.said = n
        ? (n === 1 ? T("Put 1 observation back.", "Se devolvió 1 observación.")
                   : T("Put " + n + " observations back.", "Se devolvieron " + n + " observaciones."))
        : T("Nothing to put back.", "No hay nada que devolver.");
      hsRepaint();
      return;
    }
    var b = t.closest(".hs-del");
    if (!b) { hsDisarm(); return; }
    /* ⚠ The list lives inside a <details>; a click on a control in there must
       not also toggle the disclosure it sits in. */
    e.preventDefault(); e.stopPropagation();
    var key = b.getAttribute("data-hsdel");
    if (!key) return;
    if (b.getAttribute("data-armed")) {
      hsDisarm();
      var took = [];
      try { took = removeObs([key]) || []; } catch (x2) {}
      HSDEL.last = took.length ? took : null;
      HSDEL.said = took.length ? hsRemovedLine(took.length) : T("Nothing to remove.", "No hay nada que quitar.");
      hsRepaint();
      return;
    }
    hsDisarm();
    b.setAttribute("data-was", b.textContent);
    b.setAttribute("data-armed", "1");
    b.textContent = T("Press again to remove", "Presiona otra vez para quitar");
    try { clearTimeout(HSDEL.t); } catch (x3) {}
    HSDEL.t = setTimeout(hsDisarm, 6000);
  });

  function obsWhoHtml(goalId) {
    var c = cfgFor(goalId);
    if (!c) return "";
    var rows = counted(obsForWho(c.key, "staff")).slice();
    if (!rows.length) return "";
    rows.sort(function (x, y) {
      var a = String(x.date || ""), b = String(y.date || "");
      return a < b ? 1 : (a > b ? -1 : 0);          /* newest first */
    });
    var CAP = 12, shown = rows.slice(0, CAP), more = rows.length - shown.length;
    var body = shown.map(function (r) {
      var ctx = [];
      if (r.timeOfDay) ctx.push(r.timeOfDay);
      if (r.activity) ctx.push(r.activity);
      /* Labeled, not glued into a sentence — "helped by a reminder" reads
         fine in English and ungrammatically in Spanish, and this line has to
         be right in both. */
      if (r.support) ctx.push(T("what helped: ", "qué ayudó: ") + r.support);
      var head = shortDate(r.date) + " · " + staffRoleLabel(r.respondentRole);
      var said = whoLine(r);
      return '<li class="hs-whoitem"><span class="hs-whohead">' + esc(head) + hsDelBtn(c.key, r) + "</span>" +
        (said ? '<span class="hs-whosaid">' + esc(said) + "</span>" : "") +
        (ctx.length ? '<span class="hs-whoctx">' + esc(ctx.join(" · ")) + "</span>" : "") +
        /* The colleague's own sentence, verbatim and unsummarized. It is the
           reason the note field exists and the case manager is who it was
           written to. */
        (r.note ? '<span class="hs-whonote">“' + esc(r.note) + "”</span>" : "") +
        "</li>";
    }).join("");
    var n = rows.length;
    return hsDelNote() + '<details class="hs-who"><summary>' +
      esc(T("Who saw what — " + n + (n === 1 ? " classroom observation" : " classroom observations"),
            "Quién vio qué — " + n + (n === 1 ? " observación en clase" : " observaciones en clase"))) +
      "</summary><ul class=\"hs-wholist\">" + body + "</ul>" +
      (more > 0 ? '<p class="hs-whomore">' + esc(T(
        "The " + shown.length + " most recent are shown. " + more + " older " + (more === 1 ? "observation is" : "observations are") + " in the record.",
        "Se muestran las " + shown.length + " más recientes. Hay " + more + (more === 1 ? " observación más antigua" : " observaciones más antiguas") + " en el registro.")) + "</p>" : "") +
      "</details>";
  }

  /* ═══════════════════════ §13 · THE TWO COLUMNS, FINALLY SIDE BY SIDE
     Item 4 of the August handoff. This layer's founding rule — the goal stays
     the goal and the environment changes — is a comparison, and until .29ay
     nothing drew it: classroom and home rendered as two sentences a reader had
     to hold in their head at once. This is the same counts, set beside each
     other, and nothing more.
     ⚠ COUNTS, NEVER AVERAGES, AND A TIE IS TWO EQUAL NUMBERS the reader can
     see — no winner is picked, no gap is named, no cell is highlighted.
     ⚠ ONLY THE SIBLING INSTRUMENTS ARE COMPARED. The classroom and home rows
     answer the SAME question on the SAME scale, so their counts can share a
     table. The school's measurements are a different instrument; they stay in
     their own row above, and a table that put a percentage beside a tap would
     be inventing a comparison the data does not contain.
     ⚠ ZERO ROWS STAY. "0 at home" on a level a colleague sees daily can be
     the most useful cell on the card; hiding the row would render an absence
     as if it were not information. */
  function cmpHtml(s) {
    if (!s || !s.klass || !s.klass.n || !s.home.n) return "";
    var lv = levelsFor(s.scale).filter(function (x) { return x[0] !== "na"; });
    var rows = lv.map(function (x) {
      return '<tr><th scope="row">' + esc(T(x[1], x[2])) + "</th>" +
        "<td>" + (s.klass.by[x[0]] || 0) + "</td>" +
        "<td>" + (s.home.by[x[0]] || 0) + "</td></tr>";
    }).join("");
    return '<div class="hs-erow"><span class="hs-esrc">' + esc(T("Side by side", "Lado a lado")) + "</span>" +
      '<span class="hs-ewhat"><table class="hs-cmpt"><thead><tr><td></td>' +
        '<th scope="col">' + esc(T("Classroom", "En clase")) + ' <span class="hs-cmpn">· ' + s.klass.n + "</span></th>" +
        '<th scope="col">' + esc(T("Home", "Casa")) + ' <span class="hs-cmpn">· ' + s.home.n + "</span></th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table>" +
        esc(T("The same question about the same skill, answered from two places — the counts are the whole of what this panel says.",
              "La misma pregunta sobre la misma habilidad, respondida desde dos lugares — los conteos son todo lo que dice este panel.")) +
      "</span></div>";
  }

  function envHtml(goalId) {
    var s = envSnapshot(goalId);
    if (!s) return "";
    var m = s.home.by, hn = s.home.n;
    function span(a, b) {
      if (!a) return "";
      return T(" · " + fdate(a) + (b && b !== a ? " to " + fdate(b) : ""),
               " · " + fdate(a) + (b && b !== a ? " a " + fdate(b) : ""));
    }
    function fdate(iso) {
      var p = String(iso || "").split("-");
      if (p.length !== 3) return String(iso || "");
      return (+p[1]) + "/" + (+p[2]);
    }
    var homeWords = hn
      ? T(m.own + " on their own · " + m.reminder + " with a reminder · " + (m.help + m.hard) + " with support",
          m.own + " por su cuenta · " + m.reminder + " con recordatorio · " + (m.help + m.hard) + " con apoyo")
      : T("Nothing noted yet.", "Nada anotado todavía.");

    /* §13's interpretation prompts, offered as possibilities. Which ones are
       shown depends only on the COUNTS — never on a judgement about them. */
    var asks = [];
    if (!s.school.n || !hn) {
      asks.push(T("There is not enough from both places yet to compare anything.",
                  "Todavía no hay suficiente de ambos lugares para comparar nada."));
    } else {
      asks.push(T("The skill may be showing up in both settings.", "La habilidad puede estar apareciendo en ambos entornos."));
      /* ⚠ IF YOU FIND YOURSELF WRITING "because", DELETE THE SENTENCE. This
         line said "it may look different because the settings are different"
         — a hedge with a cause inside it, which is the exact thing §13 says
         the tool must not supply. The setting is named; the link is not. */
      asks.push(T("The setting itself may be part of what is different.", "El entorno mismo puede ser parte de lo que cambia."));
      asks.push(T("Different supports may be producing different outcomes.", "Distintos apoyos pueden estar produciendo distintos resultados."));
      asks.push(T("More information may simply be needed.", "Quizá solo haga falta más información."));
    }

    return '<div class="hs-env"><h4>' + /* ⚠ NO NUMBER IN A HEADING. This said "in two places" and heads three
        named rows since .29ac. Two PLACES is still literally true — school and
        home — and three SOURCES is true too, which is exactly why a counted
        heading is a heading the next build breaks. The hero's "three short
        reflections" went stale the same way when a fifth instrument shipped. */
     esc(T("The same skill, in more than one place", "La misma habilidad, en más de un lugar")) + "</h4>" +
      '<div class="hs-erow"><span class="hs-esrc">' + esc(T("School data", "Datos de la escuela")) + "</span>" +
        '<span class="hs-ewhat">' + esc(s.school.n
          ? T(s.school.n + (s.school.n === 1 ? " measurement" : " measurements") + span(s.school.from, s.school.to) + ", recorded under educational conditions and charted against the aimline above.",
              s.school.n + (s.school.n === 1 ? " medición" : " mediciones") + span(s.school.from, s.school.to) + ", registradas en condiciones educativas y graficadas arriba.")
          : T("No measurements recorded yet.", "Aún no hay mediciones.")) + "</span></div>" +
      /* ⚠ THE THIRD ROW NAMES ITSELF LIKE THE OTHER TWO AND IS NEVER ADDED TO
         THEM. A classroom observation is not a measurement and it is not a
         home observation either; three sources, three sentences, one stop. */
      (s.klass && s.klass.n ? ('<div class="hs-erow"><span class="hs-esrc">' + esc(T("Classroom observations", "Observaciones en clase")) + "</span>" +
        '<span class="hs-ewhat">' + esc(T(
          s.klass.n + (s.klass.n === 1 ? " observation" : " observations") + span(s.klass.from, s.klass.to) + " — " +
            s.klass.by.own + " on their own \u00b7 " + s.klass.by.reminder + " with a reminder \u00b7 " + (s.klass.by.help + s.klass.by.hard) + " with support, from colleagues on the team.",
          s.klass.n + (s.klass.n === 1 ? " observaci\u00f3n" : " observaciones") + span(s.klass.from, s.klass.to) + " — " +
            s.klass.by.own + " por su cuenta \u00b7 " + s.klass.by.reminder + " con recordatorio \u00b7 " + (s.klass.by.help + s.klass.by.hard) + " con apoyo, de colegas del equipo.")) + "</span></div>") : "") +
      '<div class="hs-erow"><span class="hs-esrc">' + esc(T("Home observations", "Observaciones en casa")) + "</span>" +
        '<span class="hs-ewhat">' + esc(hn
          ? T(hn + (hn === 1 ? " observation" : " observations") + span(s.home.from, s.home.to) + " — " + homeWords + ".",
              hn + (hn === 1 ? " observación" : " observaciones") + span(s.home.from, s.home.to) + " — " + homeWords + ".")
          : homeWords) + "</span></div>" +
      cmpHtml(s) +
      obsWhoHtml(goalId) +
      '<div class="hs-ask"><b>' + esc(T("What might this tell us?", "¿Qué podría decirnos esto?")) + "</b><br>" +
        asks.map(function (a) { return esc(a); }).join("<br>") + "</div>" +
      /* §19 · this sentence is built into the interface, not documented
         somewhere a reader will never look. */
      '<div class="hs-note-pro">' + esc(T(
        /* ⚠ IT NAMES BOTH. This sentence said "Home observations" and was
           written when this card had two rows. .29ac added a third — the
           classroom row — and left the note alone, so the card's own statement
           of what may not be concluded covered only one of the two sources it
           was showing. */
        "Home and classroom observations are supplementary contextual information. They are not progress-monitoring data, they are not equivalent to it, and they should be interpreted by the IEP Team alongside the formal measurements above and everything else the team knows. Nothing on this card determines whether a goal has been met.",
        "Las observaciones en casa y en clase son información contextual complementaria. No son datos de monitoreo de progreso ni equivalen a ellos, y el Equipo del IEP debe interpretarlas junto con las mediciones formales de arriba y todo lo demás que el equipo sabe. Nada en esta tarjeta determina si una meta se ha cumplido.")) + "</div>" +
      "</div>";
  }

  /* ═══════════════════════════ §19 · THE ENVIRONMENT SNAPSHOT, ON PAPER
     What `aogIepMeeting` and `aogIepPrintGoal` call. Returns "" for a goal
     that was never connected to home, so neither document grows an empty
     section, and neither of them has to know anything about this layer.

     ⚠ INLINE LIGHT HEX, NEVER A TOKEN. Both callers open a NEW WINDOW with
     its own stylesheet and its own light palette; a `var(--ink)` here
     resolves to nothing there and the text renders black-on-black or not at
     all. The printed chart already follows this rule — see [[aog-iep-chart]].

     ⚠ IT DESCRIBES AND STOPS. §19's sketch has rows like "School pattern:
     increasing independence" — that is an interpretation, and interpretation
     on the one copy that leaves the building becomes a finding. What goes on
     paper is the count, the span, what was actually tapped, the same list of
     possibilities the screen offers, and the professional note. §20: the
     IEP Team determines whether a goal has been met. This page does not. */
  window.aogHomeMeetingBlock = function (goalId, es) {
    var c = cfgFor(goalId);
    if (!c) return "";
    var s = envSnapshot(goalId);
    if (!s) return "";
    /* ⚠ SCOPED. This was `counted(obsFor(c.key))` — unscoped — and it feeds
       three things below: the home line's count, countBy(home) (so a
       colleague's "on their own" was reported as a HOME level), and `asks`.
       With three classroom observations and nothing from home this page
       printed "The skill may be showing up in both settings" — a claim about
       home built entirely from classroom data, on the copy that leaves the
       building. .29ap fixed this read on the strip and in envSnapshot and
       missed it here. ⚠ When you scope a read, grep every caller of the
       unscoped function. */
    var home = counted(obsForWho(c.key, "family"));
    /* A goal connected but never used says so in one line rather than
       printing an empty table — and never as a shortfall. */
    var m = countBy(home);

    function E(x) { return String(x == null ? "" : x).replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }
    function d(iso) {
      var p = String(iso || "").split("-");
      return p.length === 3 ? ((+p[1]) + "/" + (+p[2]) + "/" + String(p[0]).slice(2)) : String(iso || "");
    }
    function span(a, b) { return a ? (d(a) + (b && b !== a ? (es ? " a " : " to ") + d(b) : "")) : (es ? "—" : "—"); }

    var LB = "font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#46506E;";
    var ROW = "display:flex;gap:12px;align-items:baseline;padding:8px 0;border-top:1px solid #E4DAC5;flex-wrap:wrap;";
    var SRC = "flex:0 0 150px;font-size:11.5px;font-weight:800;color:#0A1E33;";
    var WHAT = "flex:1;min-width:190px;font-size:12.5px;line-height:1.5;color:#46506E;";

    var schoolLine = s.school.n
      ? (es ? (s.school.n + (s.school.n === 1 ? " medición" : " mediciones") + " · " + span(s.school.from, s.school.to) +
               " · registradas en condiciones educativas y graficadas contra la línea objetivo.")
            : (s.school.n + (s.school.n === 1 ? " measurement" : " measurements") + " · " + span(s.school.from, s.school.to) +
               " · recorded under educational conditions and charted against the aimline."))
      : (es ? "Sin mediciones registradas." : "No measurements recorded.");

    var homeLine = home.length
      ? (es ? (home.length + (home.length === 1 ? " observación" : " observaciones") + " · " + span(s.home.from, s.home.to) + " · " +
               m.own + " por su cuenta, " + m.reminder + " con recordatorio, " + (m.help + m.hard) + " con apoyo.")
            : (home.length + (home.length === 1 ? " observation" : " observations") + " · " + span(s.home.from, s.home.to) + " · " +
               m.own + " on their own, " + m.reminder + " with a reminder, " + (m.help + m.hard) + " with support."))
      : (es ? "Conectada con la casa, sin observaciones todavía." : "Connected to home; no observations yet.");

    /* ⚠ ON PAPER TOO, AND NEVER SUMMED. §19 stays what it is: the count, the
       span, what was actually observed, and a stop. */
    var klass = counted(obsForWho(c.key, "staff"));
    var kmm = countBy(klass);

    /* ═══════════════════════ §15 · EVIDENCE SOURCES, ON PAPER
       "Who contributed the evidence?" is a question a team asks out loud and
       this page could not answer it — the Data sources row ticked KINDS.
       Roles with counts, most-seen first.
       ⚠ ROLES, NEVER NAMES, and ⚠ NEVER THE NOTES. Each colleague's sentence
       is on the screen, where the case manager reads it and decides what to
       bring. A page that prints everything it holds walks an unreviewed
       sentence into a due-process file. */
    function roleRoll(rows) {
      var order = [], n = {};
      rows.forEach(function (r) {
        var k = String(r.respondentRole || "other_staff");
        if (n[k] == null) { n[k] = 0; order.push(k); }
        n[k]++;
      });
      order.sort(function (x, y) { return n[y] - n[x]; });
      return order.map(function (k) { return staffRoleLabel(k) + " \u00d7" + n[k]; }).join(" \u00b7 ");
    }
    /* ⚠ CLASSROOM CONTEXTS ONLY. The family's contexts are Homework, A chore,
       Out and about — a description of a household, and no part of what this
       page is for. */
    function ctxRoll(rows) {
      var seen = {}, out = [];
      rows.forEach(function (r) {
        var v = String(r.activity || "").trim();
        if (!v || seen[v]) return;
        seen[v] = 1; out.push(v);
      });
      return out.slice(0, 6).join(" \u00b7 ");
    }
    var kRoles = klass.length ? roleRoll(klass) : "";
    var kCtx   = klass.length ? ctxRoll(klass) : "";
    var klassLine = klass.length
      ? (es ? (klass.length + (klass.length === 1 ? " observaci\u00f3n" : " observaciones") + " \u00b7 " + span(s.klass.from, s.klass.to) + " \u00b7 " +
               kmm.own + " por su cuenta, " + kmm.reminder + " con recordatorio, " + (kmm.help + kmm.hard) + " con apoyo \u00b7 aportadas por colegas del equipo.")
            : (klass.length + (klass.length === 1 ? " observation" : " observations") + " \u00b7 " + span(s.klass.from, s.klass.to) + " \u00b7 " +
               kmm.own + " on their own, " + kmm.reminder + " with a reminder, " + (kmm.help + kmm.hard) + " with support \u00b7 contributed by colleagues on the team."))
      : "";

    var asks = (!s.school.n || !home.length)
      ? [es ? "Todavía no hay suficiente de ambos lugares para comparar nada."
            : "There is not enough from both places yet to compare anything."]
      : [ es ? "La habilidad puede estar apareciendo en ambos entornos." : "The skill may be showing up in both settings.",
          es ? "El entorno mismo puede ser parte de lo que cambia." : "The setting itself may be part of what is different.",
          es ? "Distintos apoyos pueden estar produciendo distintos resultados." : "Different supports may be producing different outcomes.",
          es ? "Quizá solo haga falta más información." : "More information may simply be needed." ];

    return '<div style="margin:14px 0 0;border:1px solid #E4DAC5;border-radius:10px;padding:12px 14px 13px;background:#FBF8F1;page-break-inside:avoid;break-inside:avoid;">' +
      '<span style="' + LB + 'display:block;margin:0 0 3px;">' + E(es ? "Panorama por entorno" : "Environment snapshot") + "</span>" +
      '<div style="font-size:13.5px;font-weight:700;color:#0A1E33;margin:0 0 6px;">' +
        E((es ? "Habilidad compartida: " : "Shared skill: ") + (es ? trSkill(c.skill) : c.skill)) + "</div>" +
      '<div style="' + ROW + '"><span style="' + SRC + '">' + E(es ? "Datos de la escuela" : "School data") + "</span>" +
        '<span style="' + WHAT + '">' + E(schoolLine) + "</span></div>" +
      (klassLine ? ('<div style="' + ROW + '"><span style="' + SRC + '">' + E(es ? "Observaciones en clase" : "Classroom observations") + "</span>" +
        '<span style="' + WHAT + '">' + E(klassLine) + "</span></div>") : "") +
      '<div style="' + ROW + '"><span style="' + SRC + '">' + E(es ? "Observaciones en casa" : "Home observations") + "</span>" +
        '<span style="' + WHAT + '">' + E(homeLine) + "</span></div>" +
      /* §19 · the data sources, named and ticked, so nobody reading this
         page has to work out which of the two rows above they are looking at. */
      '<div style="' + ROW + '"><span style="' + SRC + '">' + E(es ? "Fuentes" : "Data sources") + "</span>" +
        '<span style="' + WHAT + '">&#9745; ' + E(es ? "Mediciones escolares (este registro)" : "School measurements (this record)") +
        /* Each tick now carries WHO, not just what kind. A tick beside a source
           nobody used said the same thing as a tick beside one three people
           answered. */
        /* ⚠ THE WORDING OF THE TICKS DOES NOT CHANGE — "optional" is what keeps
           an absence from reading as a shortfall on a page a team is looking
           at, which is Rule 5. The WHO is appended to it, never instead of it.
           t77 failed on this string and was right to. */
        "<br>&#9745; " + E(es ? "Observaciones familiares (opcionales)" : "Home observations (family, optional)") +
        (home.length ? E(" \u2014 \u00d7" + home.length) : "") +
        (klassLine ? ("<br>&#9745; " + E(es ? "Observaciones de colegas (opcionales)" : "Colleague observations (staff, optional)") +
                      E(" \u2014 " + kRoles)) : "") +
        (kCtx ? ('<br><span style="color:#646E86;">' + E((es ? "Contextos observados en clase: " : "Classroom contexts observed: ") + kCtx) + "</span>") : "") +
        "</span></div>" +
      '<div style="margin:10px 0 0;padding-top:9px;border-top:1px solid #E4DAC5;">' +
        '<span style="' + LB + 'display:block;margin:0 0 4px;">' + E(es ? "¿Qué podría decirnos esto?" : "What might this tell us?") + "</span>" +
        '<span style="font-size:12.5px;line-height:1.6;color:#46506E;">' + asks.map(E).join("<br>") + "</span></div>" +
      /* §19's professional note, printed rather than documented. */
      '<div style="margin:10px 0 0;padding-top:9px;border-top:1px solid #E4DAC5;font-size:11px;line-height:1.55;color:#46506E;">' +
        E(es ? "Las observaciones en casa y en clase son información contextual complementaria. No son datos de monitoreo de progreso ni equivalen a ellos, y el Equipo del IEP debe interpretarlas junto con las mediciones formales de esta página y todo lo demás que el equipo sabe. Nada aquí determina si una meta se ha cumplido."
             : "Home and classroom observations are supplementary contextual information. They are not progress-monitoring data, they are not equivalent to it, and they should be interpreted by the IEP Team alongside the formal progress-monitoring data on this page and other relevant information. Nothing here determines whether a goal has been met.") +
      "</div></div>";
  };

  /* ---------------------------------------------------------- the QR, if any */
  function drawQr(root) {
    var boxes = (root || document).querySelectorAll(".hs-qr[data-hsqr]");
    if (!boxes.length) return;
    function fallback() {
      boxes.forEach(function (b) {
        if (b.getAttribute("data-done")) return;
        b.setAttribute("data-done", "1");
        /* ⚠ INLINE HEX, NEVER A TOKEN — the .hs-qr box paints its own WHITE
           ground so a code stays scannable, and var(--ink-faint) is LIGHT in
           dark mode: axe measured this at 2.01:1. Exactly the rule the printed
           chart and the meeting block already keep, in a third place nobody had
           looked. 10px was also below the small-text threshold on its own. */
        b.innerHTML = '<span style="font-size:11px;line-height:1.45;color:#46506E;padding:6px;text-align:center;">' +
          esc(T("The link above still works.", "El enlace de arriba sí funciona.")) + "</span>";
      });
    }
    var p = null;
    try { p = (typeof ensureQrLib === "function") ? ensureQrLib() : null; } catch (e) {}
    if (!p) { fallback(); return; }
    p.then(function (ok) {
      if (!ok || !window.QRCode) { fallback(); return; }
      boxes.forEach(function (b) {
        if (b.getAttribute("data-done")) return;
        try { new QRCode(b, { text: b.getAttribute("data-hsqr"), width: 120, height: 120, correctLevel: QRCode.CorrectLevel.L }); b.setAttribute("data-done", "1"); } catch (e) {}
      });
      fallback();
    }, fallback);
  }

  function said(goalId, msg) {
    var s = el("hsSaid_" + goalId);
    if (!s) return;
    s.textContent = msg;
    setTimeout(function () { if (s) s.textContent = ""; }, 2600);
  }
  function copy(text, goalId) {
    function fell() { said(goalId, T("Press ⌘C", "Presiona ⌘C")); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { said(goalId, T("Copied", "Copiado")); }, fell);
        return;
      }
    } catch (e) {}
    fell();
  }
  function messageFor(c) {
    var link = linkFor(c);
    return T(
      "Hi — at school we're working on “" + c.skill + "”.\n\n" +
      "If you'd like, this link lets you note how it goes at home when it happens on its own. It takes about ten seconds and it's completely optional — you're not being asked to measure anything or to teach anything.\n\n" + link,
      "Hola — en la escuela estamos trabajando en «" + trSkill(c.skill) + "».\n\n" +
      "Si quieres, este enlace te permite anotar cómo va en casa cuando surge por sí solo. Toma unos diez segundos y es totalmente opcional — no se te pide medir ni enseñar nada.\n\n" + link);
  }

  /* ⚠ IT NAMES THE STUDENT BY CODE OR NOT AT ALL. The message a case manager
     pastes into an email is the one place a name would be easiest to add and
     hardest to take back out — the code-to-name list stays on paper, exactly
     as it does everywhere else in this product. */
  function messageForStaff(c, ro) {
    var link = linkFor(c, "staff", ro);
    var who = c.code ? (isEs() ? "el/la estudiante " + c.code : "student " + c.code) : (isEs() ? "un/a estudiante" : "a student");
    return T(
      "Hi \u2014 I am gathering progress evidence for " + who + " on \u201c" + c.skill + "\u201d.\n\n" +
      "This link takes under a minute: one tap for how it went in your setting, and an optional count if you have one. It is not a form and there is nothing to look up.\n\n" + link,
      "Hola \u2014 estoy reuniendo evidencia de progreso para " + who + " sobre \u00ab" + trSkill(c.skill) + "\u00bb.\n\n" +
      "Este enlace toma menos de un minuto: un toque para indicar c\u00f3mo fue en tu entorno y, si lo tienes, un conteo opcional. No es un formulario y no hay nada que buscar.\n\n" + link);
  }

  /* ------------------------------------------------------- read the panel back */
  function readPanel(goalId) {
    function v(p) { var e = el(p + "_" + goalId); return e ? e.value : null; }
    return {
      skill: (v("hsSkill") || "").trim(),
      ask:   (v("hsAsk")   || "").trim(),
      scale: v("hsScale") || "",
      code:  code(v("hsCode") || "")
    };
  }
  function ctxFromClasses(cIn) {
    /* Class context so the row lands in the right destination, taken from
       the population layer if the student's code is in a class there. */
    var out = { schoolId: "", classId: "", grade: cIn.grade || "", term: "", districtId: "" };
    if (!cIn.code) return out;
    try {
      (window.AOGPop.classes() || []).forEach(function (k) {
        if (out.schoolId) return;
        if ((k.members || []).some(function (m) { return code(m) === cIn.code; })) {
          out.schoolId = k.schoolId || ""; out.classId = k.classId || "";
          out.grade = out.grade || k.grade || ""; out.term = k.term || "";
        }
      });
    } catch (e) {}
    return out;
  }

  function wire(card, goalId) {
    card.querySelectorAll("[data-hsopen]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-hsopen");
        OPEN[id] = !OPEN[id];
        paint();
      });
    });
    card.querySelectorAll("[data-hsfit]").forEach(function (b) {
      b.addEventListener("click", function () {
        var parts = b.getAttribute("data-hsfit").split("|");
        var id = parts[0], k = parts[1];
        var cur = cfgFor(id) || {};
        var live = readPanel(id);
        var next = connect(id, {
          fit: k,
          skill: live.skill || cur.skill, ask: live.ask || cur.ask,
          scale: live.scale || cur.scale, code: live.code || cur.code
        });
        if (k === "no" && next) { next.on = false; saveCfg(id, next); }
        paint();
      });
    });
    card.querySelectorAll("[data-hssug]").forEach(function (b) {
      b.addEventListener("click", function () {
        var parts = b.getAttribute("data-hssug").split("|");
        var id = parts[0], i = +parts[1];
        var g = (iep().goals || {})[id];
        var list = SKILLS[goalArea(g)] || SKILLS.other;
        var pick = list[i]; if (!pick) return;
        var sEl = el("hsSkill_" + id), aEl = el("hsAsk_" + id), pv = el("hsPv_" + id);
        if (sEl) sEl.value = pick[0];
        if (aEl) aEl.value = pick[1];
        if (pv) pv.textContent = pick[1];
      });
    });
    var askIn = card.querySelector("#hsAsk_" + goalId);
    if (askIn) askIn.addEventListener("input", function () {
      var pv = el("hsPv_" + goalId); if (pv) pv.textContent = askIn.value;
    });
    card.querySelectorAll("[data-hssave]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-hssave");
        var live = readPanel(id);
        var cur = cfgFor(id) || {};
        var fit = cur.fit || "optional";
        var ctx = ctxFromClasses({ code: live.code, grade: (iep().goals[id] || {}).grade });
        var c = connect(id, {
          fit: fit, skill: live.skill, ask: live.ask, scale: live.scale, code: live.code,
          schoolId: ctx.schoolId, classId: ctx.classId, grade: ctx.grade, term: ctx.term
        });
        if (c && fit !== "no") { c.on = true; saveCfg(id, c); }
        paint();
        said(id, T("Saved", "Guardado"));
      });
    });
    card.querySelectorAll("[data-hscopy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-hscopy"), c = cfgFor(id);
        if (!c) return;
        var u = linkFor(c);
        if (!u) { said(id, T("Only on the live site", "Solo en el sitio publicado")); return; }
        copy(u, id);
      });
    });
    card.querySelectorAll("[data-hsmsg]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-hsmsg"), c = cfgFor(id);
        if (!c) return;
        if (!baseUrl()) { said(id, T("Only on the live site", "Solo en el sitio publicado")); return; }
        copy(messageFor(c), id);
      });
    });
    function teamRole(id) { var e = el("hsRole_" + id); return staffRole(e ? e.value : "") || "gened"; }
    card.querySelectorAll("[data-hstcopy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-hstcopy"), c = cfgFor(id);
        if (!c) return;
        var u = linkFor(c, "staff", teamRole(id));
        if (!u) { said(id, T("Only on the live site", "Solo en el sitio publicado")); return; }
        copy(u, id);
      });
    });
    card.querySelectorAll("[data-hstmsg]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-hstmsg"), c = cfgFor(id);
        if (!c) return;
        if (!baseUrl()) { said(id, T("Only on the live site", "Solo en el sitio publicado")); return; }
        copy(messageForStaff(c, teamRole(id)), id);
      });
    });
    card.querySelectorAll("[data-hspull]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-hspull");
        var out = el("hsPull_" + id);
        if (out) { out.className = "hs-said"; out.textContent = T("Checking…", "Consultando…"); }
        b.disabled = true;
        window.aogPullHome().then(function (r) {
          b.disabled = false;
          if (!out) return;
          if (!r.ok) {
            out.className = "hs-said bad";
            out.textContent = r.error || T("Could not read the sheet.", "No se pudo leer la hoja.");
            return;
          }
          out.className = "hs-said";
          /* Say what came back, including nothing. "You are up to date" is a
             real answer and is what a teacher usually needs to hear. */
          out.textContent = r.added
            ? T(r.added + (r.added === 1 ? " new note" : " new notes"), r.added + (r.added === 1 ? " nota nueva" : " notas nuevas"))
            : T("You’re up to date.", "Todo al día.");
          paint();
        }, function () {
          b.disabled = false;
          if (out) { out.className = "hs-said bad"; out.textContent = T("Could not read the sheet.", "No se pudo leer la hoja."); }
        });
      });
    });
    card.querySelectorAll("[data-hsoff]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-hsoff");
        disconnect(id);
        OPEN[id] = false;
        paint();
      });
    });
    drawQr(card);
  }

  /* The IEP body is re-rendered wholesale on every keystroke elsewhere in a
     goal's entry row, so this repaints rather than binding once — the same
     shape the class panel's decorators use. */
  var painting = false;
  function paint() {
    if (painting) return;
    painting = true;
    try {
      tcss();
      var body = el("aogIepBody");
      if (!body) return;
      var goals = iep().goals || {};
      body.querySelectorAll(".iep-card").forEach(function (card) {
        var id = String(card.id || "").replace(/^iepCard_/, "");
        if (!id || !goals[id]) return;
        var have = card.querySelector('.hs-strip[data-hs="' + id + '"]');
        var html = stripHtml(id, goals[id]);
        if (have) {
          var tmp = document.createElement("div");
          tmp.innerHTML = html;
          if (have.outerHTML === tmp.firstChild.outerHTML) return;   /* nothing moved */
          have.parentNode.replaceChild(tmp.firstChild, have);
        } else {
          card.insertAdjacentHTML("beforeend", html);
        }
        wire(card.querySelector('.hs-strip[data-hs="' + id + '"]'), id);
      });
    } catch (e) {} finally { painting = false; }
  }

  function watch() {
    var body = el("aogIepBody");
    if (!body || !window.MutationObserver) return;
    try {
      new MutationObserver(function () { setTimeout(paint, 0); })
        .observe(body, { childList: true, subtree: false });
    } catch (e) {}
  }

  /* ------------------------------------------------------------- the way in */
  function fromUrl() {
    var raw = "";
    try { raw = new URLSearchParams(location.search).get(PARAM) || ""; } catch (e) {}
    if (!raw) return null;
    var payload = decodePayload(raw);
    if (!payload) return null;
    /* ⚠ A LINK IS A WRITE CREDENTIAL, NEVER A READ ONE — the same rule the
       student links keep. Everything the family screen shows is either in
       the link itself or is what THIS phone has noted; it never reads the
       school's measurements, another child, or anything from the Sheet. */
    return payload;
  }

  window.AOGHome = {
    cfg: cfgFor, cfgByKey: cfgByKey, goalIdByKey: goalIdByKey,
    connect: connect, disconnect: disconnect,
    link: linkFor, message: messageFor,
    obs: obsFor, obsForWho: obsForWho, isStaffRow: isStaffRow,
    /* .30dq — removal. Same contract as AOGExitSlip and AOGCheckins: remove()
       hands back what it took so the screen can offer Undo, and restore() is
       the only way a tombstone is lifted. __merge is the test seam. */
    remove: removeObs, restore: restoreObs, keysFor: keysForHomeKey,
    removed: goneListH, __merge: merge,
    KEYS: { obs: KEY, queue: QKEY, removed: HGONE },
    add: addObs, counted: counted, countBy: countBy,
    staffLink: function (c, ro) { return linkFor(c, "staff", ro); },
    staffRoles: STAFF_ROLES, staffRoleLabel: staffRoleLabel,
    snapshot: envSnapshot, familyRead: familyRead,
    /* ⚠ THE TABLE, NOT trSkill(). trSkill decides language from
       documentElement.lang, which the DASHBOARD's language switch does not
       touch — so a caller on a dashboard screen must pick with its own DTx.
       See the six Distribute strings that stayed English until .29l. */
    scales: SCALES, skills: SKILLS, skillsEs: SKILLS_ES, decode: decodePayload, payload: payloadOf,
    open: function (goalId) { var c = cfgFor(goalId); if (c) openFromLink(c); },
    paint: paint, pull: function () { return window.aogPullHome(); }
  };

  function init() {
    var p = fromUrl();
    if (p) { css(); openFromLink(p); return; }   /* a family's phone stops here */
    tcss();
    paint();
    watch();
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="iep"], .dmode[data-mode="iep"]');
      if (t) setTimeout(paint, 260);
    });
    try {
      new MutationObserver(function () { setTimeout(paint, 0); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch (e) {}
    try { flush(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 340); });
  else setTimeout(init, 340);
  setTimeout(function () { try { if (!el("screen-home-skills")) { tcss(); paint(); watch(); } } catch (e) {} }, 2200);

  /* ══════════════════════════════════════════════════════ THE THREE CALLS
     Written down so Jimmy can overrule any of them without archaeology.

     1 · NO RED-AMBER-GREEN. §08 of the handoff sketches 🟢🟡🟠🔴 on the
         family's four options. This build draws all five identically. Two
         reasons: the product already made this exact call once — the Daily
         Check-In's scale disc deliberately lost its red-to-green ramp — and
         a red dot on "Could not get started" is a deficit score in color
         form, which §11 forbids in words on the very next page. To bring the
         ramp back, color .hs-opt by data-lv; nothing else needs touching.

     2 · THE FAMILY NEVER SEES A GRAPH. §12 and §13 are teacher-side only.
         A family gets counts and one sentence. Adding a chart to the family
         screen would take about twenty lines and would, on the first bad
         fortnight, turn a kitchen into a data review.

     3 · TURNING IT OFF DOES NOT DELETE ANYTHING. disconnect() stops the
         link working and leaves the observations where they are. Destroying
         what a family already said is the Remove-records screen's job,
         where it is named, listed and backed up first ([[aog-backup-symmetry]]).
     ══════════════════════════════════════════════════════════════════════ */
})();
