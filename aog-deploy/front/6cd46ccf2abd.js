
/* ============================================================================
   THE PRACTICE PAGE GETS A LINK BUILDER  ·  .30dq, 2026-09-01

   Jimmy, from an iPad, with a second Google account, a second Apps Script, a
   second Sheet and a green two-way connection test:

     "I made links on my ipad, sent it to my iphone and the results showed up
      on a different google script account on my computer and not ipad."

   Nothing was misconfigured. The thirty activity pages run a correct ladder —
   ?dest= on the link wins, aog-sync-config.js is second, and with neither
   there is no Send button at all — and `index.html` holds the whole dest=
   machinery: AOG_DEST_PARAM, aogDestEncode_, ELEVEN call sites of
   aogDestParam_(). Not one of them built a practice link. The string "/m1"
   did not appear as a link anywhere in this file.

   ⚠⚠ SO A PRACTICE LINK WAS A BARE SHORT URL A TEACHER COPIED BY HAND, AND A
   HAND-COPIED URL CARRIES NO SCHOOL. Every practice row from every device,
   for every teacher, went to the one Sheet named in the site config. The
   receiving half of the mechanism had been shipped and waiting; the sending
   half was never built.

   This is the sending half. It is deliberately NOT a new destination system:
   it calls aogDestParam_() and aogOrgId_(), the same two functions the
   classroom link, the check-in, the exit slip and the home links already use,
   so a practice link is stamped exactly the way every other link is stamped.

   ⚠ AND IT SAYS, IN WORDS, WHAT THE LINK IS CARRYING. aogDestParam_() returns
   "" unless BOTH a saved Sheet URL and a saved WRITE KEY exist — the passcode
   is the READ key and is never interchangeable — so the common failure is a
   teacher who connected a Sheet, never entered a write key, and would get a
   link that silently points somewhere else. That case gets its own sentence
   naming the missing field. Green when the link carries your Sheet, amber
   when it does not, and never silence.
============================================================================ */
(function () {
  "use strict";
  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function isEs() { try { return T("en", "es") === "es"; } catch (e) { return false; } }

  /* Names taken from the three hubs themselves, EN and ES, so a rename there
     is a rename here — never a second copy of the curriculum's own words. */
  var ACTS = [
    /* AOG-DD-LINK-V1 — the only entry whose id is a ROUTE, not a page id. */
    { i:"drops", en:"Daily Drafts practice", es:"Daily Drafts · práctica K–12" },
    { i:"m1", en:"One-Step Equations", es:"Ecuaciones de un paso" },
    { i:"m2", en:"Where It Goes", es:"Dónde va" },
    { i:"m3", en:"Walk the Line", es:"Camina la recta" },
    { i:"m4", en:"How Far From Zero", es:"Qué tan lejos de cero" },
    { i:"m5", en:"Sign and Size", es:"Signo y tamaño" },
    { i:"m6", en:"Both Ways", es:"En ambos sentidos" },
    { i:"m7", en:"What Goes First", es:"Qué va primero" },
    { i:"m8", en:"Like and Unlike", es:"Semejantes y no semejantes" },
    { i:"m9", en:"Land On It", es:"Cae en él" },
    { i:"m10", en:"Smaller Steps", es:"Pasos más pequeños" },
    { i:"m11", en:"Two Names", es:"Dos nombres" },
    { i:"m12", en:"Name the Move", es:"Nombra el movimiento" },
    { i:"m13", en:"Say It in Math", es:"Dilo en matemáticas" },
    { i:"m14", en:"Last On, First Off", es:"Lo último se quita primero" },
    { i:"c1", en:"Cut It Fair", es:"Córtalo justo" },
    { i:"c2", en:"Top and Bottom", es:"Arriba y abajo" },
    { i:"c3", en:"More Than a Whole?", es:"¿Más que un entero?" },
    { i:"c4", en:"Close To What?", es:"¿Cerca de qué?" },
    { i:"c5", en:"Which Is Bigger?", es:"¿Cuál es más grande?" },
    { i:"c6", en:"Same Amount, New Name", es:"La misma cantidad, otro nombre" },
    { i:"c7", en:"Make It Even", es:"Empareja las torres" },
    { i:"c8", en:"The Middle Number", es:"El número del medio" },
    { i:"c9", en:"The Odd One Out", es:"El que no encaja" },
    { i:"c10", en:"Stems and Leaves", es:"Tallos y hojas" },
    { i:"c11", en:"X Marks the Number", es:"La X marca el número" },
    { i:"c12", en:"Bring It Down", es:"Bájalo" },
    { i:"c13", en:"Trade a Ten", es:"Cambia una decena" },
    { i:"v1", en:"Match the Meaning", es:"Une el significado" },
    { i:"v2", en:"Build the Word", es:"Construye la palabra" },
    { i:"v3", en:"Say It in a Sentence", es:"Dilo en una oración" },
    { i:"v4", en:"Picture It", es:"Dibújalo" },
    { i:"v5", en:"Which One Doesn't Belong", es:"Cuál no encaja" },
    { i:"h1", en:"Order the Story", es:"Ordena la historia" },
    { i:"h2", en:"Because of That", es:"Por eso pasó" },
    { i:"h3", en:"Whose Voice?", es:"¿De quién es la voz?" },
    { i:"h4", en:"The Main Idea", es:"La idea principal" },
    { i:"h5", en:"Words of a New Nation", es:"Palabras de una nación nueva" },
    { i:"h6", en:"Map of a Growing Nation", es:"Mapa de una nación que crece" },
    { i:"h7", en:"Back It Up", es:"Respáldalo" },
    { i:"h8", en:"One Person, Big Ripple", es:"Una persona, gran onda" },
    { i:"h9", en:"The Third Branch", es:"La tercera rama" },
    { i:"h10", en:"The First Branch", es:"La primera rama" },
    { i:"h11", en:"The Second Branch", es:"La segunda rama" },
    { i:"h12", en:"The Blueprint", es:"El plano" },
    { i:"h13", en:"Rights in Writing", es:"Derechos por escrito" },
    { i:"h14", en:"How a Bill Becomes a Law", es:"Cómo un proyecto se vuelve ley" },
    { i:"h15", en:"The Illinois Constitution", es:"La Constitución de Illinois" },
    { i:"h16", en:"Put It All Together", es:"Júntalo Todo" },
    /* .30fg: the Exam Prep units join the link builder — the /prep hub tells a
       teacher to share a unit's address from here, and until now it could not. */
    { i:"b1", en:"Living Things", es:"Los seres vivos" },
    { i:"b2", en:"The Cell System", es:"El sistema celular" },
    { i:"b3", en:"Body Systems", es:"Sistemas del cuerpo" },
    { i:"b4", en:"Reproduction", es:"Reproducción" },
    { i:"b5", en:"Ecosystems", es:"Ecosistemas" },
    { i:"b6", en:"Populations", es:"Poblaciones" },
    { i:"b7", en:"Heredity", es:"Herencia" },
    { i:"b8", en:"Natural Selection", es:"Selección natural" },
    { i:"b9", en:"A More Perfect Union — New Nation", es:"Una Unión Más Perfecta — Nación nueva" },
    { i:"b10", en:"Math — The Fall Skills", es:"Matemáticas — Habilidades del otoño" },
    { i:"b11", en:"English — Grammar", es:"Inglés — Gramática" },
    { i:"b12", en:"Math — 6th Grade Review (Quiz)", es:"Matemáticas — Repaso de 6.º (Quiz)" },
    { i:"b13", en:"Math — 6th Grade Review (In Class & HW)", es:"Matemáticas — Repaso de 6.º (Clase y tarea)" }
  ];
  var GROUPS = [
    /* AOG-DD-LINK-V1 · Daily Drafts is ONE option that stands for 6,480 pages,
       so it cannot be an id in ACTS the way /m1 is. It is a pseudo-activity
       whose id is its own route, and choosing it reveals three more pickers.
       ⚠ It leads the list because it is the page a teacher hands out daily. */
    { k: "d", en: "Daily practice", es: "Práctica diaria" },
    { k: "m", en: "The Interior Mathematics", es: "Matemáticas del Interior" },
    { k: "c", en: "Number Concepts & Data",   es: "Conceptos numéricos y datos" },
    { k: "v", en: "Science Vocabulary",       es: "Vocabulario de ciencias" },
    { k: "h", en: "Social Studies", es: "Estudios Sociales" },
    { k: "b", en: "Exam Prep",      es: "Preparación de exámenes" }
  ];
  var SEL = "aog.practice.link.act";

  /* ══ AOG-DD-LINK-V1 · DAILY DRAFTS ═══════════════════════════════════════
     Subject codes are daily-drops.html's OWN (normSubj): math, ela, write,
     science, social-studies. ⚠ 'write' — not 'writing'. Change one here and
     an old link falls back to math without saying so.
     ⚠ THE PARAMETER IS ?sheet=, NOT ?draft=. The page reads q.sheet. The
     label says Draft because that is what a child is told; the wire name did
     not move, so every link a teacher already wrote on a board still works. */
  var DDSUBJ = [
    { v:"math",           en:"Math",           es:"Matemáticas" },
    { v:"ela",            en:"Language Arts",  es:"Lenguaje" },
    { v:"write",          en:"Writing",        es:"Escritura" },
    { v:"science",        en:"Science",        es:"Ciencias" },
    { v:"social-studies", en:"Social Studies", es:"Estudios Sociales" },
    /* ⚠ AOG-DD-SPANISH-V1 — SUBJECT SIX. Jimmy, 2026-09-19: "It still says k-8
       not k-12 and no spanish. yet". Both were true: this list is the LINK
       BUILDER's own copy of the subjects and it is not the engine's. Adding a
       subject to daily-drops.html does not add it here, and a subject missing
       here cannot be handed to a class at all. THREE PLACES IN THIS FILE:
       ACTS (the label), DDSUBJ (this list) and ddParse's regex. */
    { v:"spanish",        en:"Spanish",        es:"Español" },
    /* AOG-DD-LINK-TEN-V1 (2026-09-23) - subjects seven to ten. Codes are the page's
       own SUBJ keys: 'religion' is SINGULAR there, 'foundry' grades are u1..u30. */
    { v:"facs",           en:"Family & Consumer Sciences", es:"Ciencias de la Familia y del Consumidor" },
    { v:"religion",       en:"World Religions",            es:"Religiones del Mundo" },
    { v:"bible",          en:"The Bible",               es:"La Biblia" },
    { v:"quran",          en:"The Qur’an",               es:"El Corán" },
    { v:"talmud",         en:"The Talmud",               es:"El Talmud" },
    { v:"hindu",          en:"Hindu Texts",                es:"Textos hindúes" },
    { v:"buddhist",       en:"Buddhist Texts",             es:"Textos budistas" },
    { v:"chinese",        en:"Chinese Classics",           es:"Clásicos chinos" },
    { v:"cultures",       en:"World Cultures",             es:"Culturas del mundo" },
    { v:"health",         en:"Medicine & Health",          es:"Medicina y salud" },
    { v:"economics",      en:"Economics",                  es:"Economía" },
    { v:"foundry",        en:"Word Foundry (by unit)",     es:"Word Foundry (por unidad)" }
  ];
  var DDGRADE = ["K","1","2","3","4","5","6","7","8","9-10","11-12","adult"];   /* AOG-DD-ADULT-V1: an Adult level for every subject */   /* AOG-DD-HS-V1: two high-school bands */
  /* AOG-DD-LINK-TEN-V1 - the Grade menu is the SUBJECT's grades, as on the page itself
     (hasGrade there). Religions and Economics exist only in the two high-school bands;
     the Word Foundry goes by class unit. A link to a grade a subject lacks draws nothing. */
  var DDUNITS = (function () { var a = []; for (var i = 1; i <= 30; i++) a.push("u" + i); return a; })();
  function ddGrades(s) {
    if (s === "foundry") return DDUNITS;
    return DDGRADE;
  }
  function ddGradeLabel(g, es) {
    if (g === "adult") return es ? "Adulto" : "Adult";
    if (g === "K") return es ? "Kínder" : "Kindergarten";
    if (/^u\d+$/.test(g)) return (es ? "Unidad " : "Unit ") + g.slice(1);
    if (g.indexOf("-") > 0) return (es ? "Grados " : "Grades ") + g.replace("-", "–");
    return (es ? "Grado " : "Grade ") + g;
  }
  var DDK = { s:"aog.practice.link.dd.subj", g:"aog.practice.link.dd.grade", n:"aog.practice.link.dd.sheet",
              l:"aog.practice.link.dd.lock" };
  function ddGet(k, d) { try { return String(localStorage.getItem(k) || "") || d; } catch (e) { return d; } }
  function ddSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  function ddSubj()  { var v = ddGet(DDK.s, "math");
    for (var i=0;i<DDSUBJ.length;i++) if (DDSUBJ[i].v===v) return v; return "math"; }
  function ddGrade() { var L = ddGrades(ddSubj()), v = ddGet(DDK.g, "3");
    return L.indexOf(v) >= 0 ? v : (L.indexOf("3") >= 0 ? "3" : L[0]); }
  function ddSheet() { var n = parseInt(ddGet(DDK.n, "1"), 10); return (n >= 1 && n <= 180) ? n : 1; }
  function ddSubjName(es) { var v = ddSubj();
    for (var i=0;i<DDSUBJ.length;i++) if (DDSUBJ[i].v===v) return es ? DDSUBJ[i].es : DDSUBJ[i].en;
    return "Math"; }
  /* AOG-DD-LOCK-V1 — ON by default: this builder exists to hand out an
     assignment, and an assignment the class can click away from is not one.
     The teacher's own bookmark is built without the builder, so it is never
     locked. */
  function ddLock() { return ddGet(DDK.l, "1") === "1"; }
  function isDrops() { return chosen() === "drops"; }
  function chosen() {
    try { var v = localStorage.getItem(SEL) || ""; }
    catch (e) { v = ""; }
    for (var i = 0; i < ACTS.length; i++) if (ACTS[i].i === v) return v;
    return "m1";
  }
  function actOf(id) { for (var i = 0; i < ACTS.length; i++) if (ACTS[i].i === id) return ACTS[i]; return ACTS[0]; }

  /* ── the link ───────────────────────────────────────────────────────────
     ⚠ THE SHORT LINK, NOT THE FILENAME. /m1 exists because _redirects
     rewrites it; the query string rides through a 200 rewrite untouched. */
  function base() {
    try {
      if (location.protocol !== "http:" && location.protocol !== "https:") return "";
      return location.origin + "/";
    } catch (e) { return ""; }
  }
  function destParam() {
    try { return (typeof window.aogDestParam_ === "function") ? (window.aogDestParam_() || "") : ""; }
    catch (e) { return ""; }
  }
  function orgId() {
    try { return (typeof window.aogOrgId_ === "function") ? String(window.aogOrgId_() || "") : ""; }
    catch (e) { return ""; }
  }
  function savedUrl() { try { return String(localStorage.getItem("aog.sync.url") || "").trim(); } catch (e) { return ""; } }
  function savedWriteKey() {
    try { return (typeof window.aogOwnWriteKey_ === "function") ? String(window.aogOwnWriteKey_() || "") : ""; }
    catch (e) { return ""; }
  }
  function buildLink(id) {
    var b = base();
    if (!b) return "";
    var u = b + id, q = [], d = destParam(), o = orgId();
    /* ⚠ AOG-DD-LINK-V1 — DAILY DRAFTS ALREADY CARRIES A QUERY STRING, so its
       dest/org must join with & on an existing ?, not open a second one. A
       second '?' is not a bad link, it is a link whose dest is INVISIBLE to
       the page — it would post to the site default and look fine doing it. */
    if (id === "drops") {
      /* AOG-DD-BANDPLUMB-V1 — the band branch is gone. A band used to travel as
         s=/g= because _redirects had no band loader to key subject=/grade= on;
         aog_drops_doors.py generates all eleven grades now. ddClassSetURL and the
         reviewed-copy link in this same file have always written the long form
         for bands — this is the third builder catching up to the two that were
         already right. */
      q.push("subject=" + encodeURIComponent(ddSubj()));
      q.push("grade=" + encodeURIComponent(ddGrade()));
      q.push("sheet=" + String(ddSheet()));
      if (ddLock()) q.push("lock=on");
    }
    if (d) q.push("dest=" + encodeURIComponent(d));
    if (o) q.push("org=" + encodeURIComponent(o));
    return q.length ? (u + "?" + q.join("&")) : u;
  }

  /* ── the sentence that makes it honest ──────────────────────────────── */
  function destState() {
    if (destParam()) return "ok";
    if (savedUrl() && !savedWriteKey()) return "nokey";
    return "none";
  }
  function destLine() {
    var s = destState();
    if (s === "ok") {
      return { c: "var(--green,#2E6B3A)", t: T(
        "✓ This link carries your Sheet. A student can open it on any device — a Chromebook, a phone at home, an account that is not yours — and the summary row posts to the Sheet you connected here.",
        "✓ Este enlace lleva tu Hoja. Un estudiante puede abrirlo en cualquier dispositivo — un Chromebook, un teléfono en casa, una cuenta que no es tuya — y la fila de resumen llega a la Hoja que conectaste aquí.") };
    }
    if (s === "nokey") {
      return { c: "var(--amber,#8A6D1F)", t: T(
        "⚠ You have connected a Sheet but not entered a Write key, and a link cannot carry a destination without one. Rows from this link would go to whatever Sheet this site publishes — not necessarily yours. Add the Write key in Connect & sync, then build the link again. (The Passcode is the READ key and is not the same field.)",
        "⚠ Conectaste una Hoja pero no ingresaste una Clave de escritura, y sin ella un enlace no puede llevar un destino. Las filas de este enlace irían a la Hoja que publique este sitio — no necesariamente la tuya. Agrega la Clave de escritura en Conectar y sincronizar y vuelve a crear el enlace. (El Código de acceso es la clave de LECTURA y no es el mismo campo.)") };
    }
    return { c: "var(--amber,#8A6D1F)", t: T(
      "⚠ This link carries no Sheet of its own, so rows from it land in whatever Sheet this site publishes — not necessarily yours. Connect your Sheet and your Write key in Connect & sync, then build the link again.",
      "⚠ Este enlace no lleva ninguna Hoja propia, así que sus filas llegan a la Hoja que publique este sitio — no necesariamente la tuya. Conecta tu Hoja y tu Clave de escritura en Conectar y sincronizar y vuelve a crear el enlace.") };
  }

  function cardHtml() {
    var id = chosen(), a = actOf(id), es = isEs();
    var opts = GROUPS.map(function (g) {
      var inner = ACTS.filter(function (x) { return x.i.charAt(0) === g.k; }).map(function (x) {
        return '<option value="' + esc(x.i) + '"' + (x.i === id ? " selected" : "") + ">" +
          esc("/" + x.i + " · " + (es ? x.es : x.en)) + "</option>";
      }).join("");
      return '<optgroup label="' + esc(es ? g.es : g.en) + '">' + inner + "</optgroup>";
    }).join("");
    var d = destLine();
    return '<p class="small">' + esc(T(
        "Pick an activity and hand out the link this builds. When a student finishes a set, one summary row goes to your Sheet on its own: how many they got, hints used, confidence, and the name they typed once. No answers, no keystrokes, no names beyond the one they choose to write.",
        "Elige una actividad y reparte el enlace que se crea aquí. Cuando un estudiante termina un grupo, una sola fila de resumen llega a tu Hoja por sí sola: cuántas logró, pistas usadas, confianza y el nombre que escribió una sola vez. Sin respuestas, sin pulsaciones, sin más nombre que el que decida escribir.")) + "</p>" +
      '<div class="welcome-fields" style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:14px 0 6px;">' +
        '<div class="field"><label for="prLgAct">' + esc(T("Which activity?", "¿Cuál actividad?")) + "</label>" +
          '<select id="prLgAct">' + opts + "</select></div>" +
        (id === "drops" ? ddFields(es) : "") +
        '<div class="field"' + (id === "drops" ? ' style="grid-column:1/-1;"' : "") + '><label for="prLgUrl">' +
          esc(T("Shareable link", "Enlace para compartir")) + "</label>" +
          '<input type="text" id="prLgUrl" readonly value="' + esc(buildLink(id)) + '"></div>' +
      "</div>" +
      '<div class="rm-row" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 0;">' +
        '<button type="button" class="btn btn-secondary btn-sm" id="prLgCopy">' + esc(T("Copy link", "Copiar enlace")) + "</button>" +
        '<button type="button" class="btn btn-secondary btn-sm" id="prLgOpen">' + esc(T("Open it", "Abrirlo")) + "</button>" +
        '<span class="small" id="prLgSaid" aria-live="polite" style="font-weight:700;"></span>' +
      "</div>" +
      '<p class="small" id="prLgDest" style="margin:12px 0 0;font-weight:700;line-height:1.6;color:' + d.c + ';">' + esc(d.t) + "</p>" +
      '<p class="small" id="prLgTab" style="margin:8px 0 0;color:var(--ink-faint,#8A92A6);line-height:1.6;">' +
        esc(id === "drops" ? ddTabLine(es) : T(
        "The row arrives under the activity's own name — " + a.en + " here — in the Practice tab of your Sheet.",
        "La fila llega con el nombre de la actividad — aquí " + a.es + " — en la pestaña Practice de tu Hoja.")) + "</p>";
  }

  /* ── AOG-DD-LINK-V1 · the three extra pickers ─────────────────────────────
     ⚠ THEIR STATE LIVES IN localStorage, NOT IN THE NODE. watchLang() rebuilds
     this card with innerHTML on every refreshAdmin, so a value held only in
     the DOM is deleted by the next repaint — the same trap the tab pull bar
     hit. Read them back through ddSubj()/ddGrade()/ddSheet(), never off the
     element, and the card can be rebuilt at any moment without losing a pick. */
  function ddFields(es) {
    var sv = ddSubj(), gv = ddGrade(), nv = ddSheet();
    var so = DDSUBJ.map(function (x) {
      return '<option value="' + esc(x.v) + '"' + (x.v === sv ? " selected" : "") + ">" +
        esc(es ? x.es : x.en) + "</option>"; }).join("");
    var go = ddGrades(sv).map(function (g) {
      return '<option value="' + esc(g) + '"' + (g === gv ? " selected" : "") + ">" +
        esc(ddGradeLabel(g, es)) + "</option>"; }).join("");
    return '<div class="field"><label for="prLgDdSubj">' + esc(T("Subject", "Materia")) + "</label>" +
             '<select id="prLgDdSubj">' + so + "</select></div>" +
           '<div class="field"><label for="prLgDdGrade">' + esc(sv === "foundry" ? T("Unit", "Unidad") : T("Grade", "Grado")) + "</label>" +
             '<select id="prLgDdGrade">' + go + "</select></div>" +
           '<div class="field"><label for="prLgDdSheet">' + esc(T("Which draft? (1–180)", "¿Cuál borrador? (1–180)")) + "</label>" +
             /* AOG-DD-DRAFT-SCROLL-V1 (2026-09-25) — Jimmy: "the which draft should have a
                scroll function like the rest." A number box forced a teacher to delete
                the tens digit to get past 19; a select scrolls like Subject and Grade. */
             '<select id="prLgDdSheet">' + (function () { var o = ""; for (var i = 1; i <= 180; i++) o += '<option value="' + i + '"' + (i === +nv ? " selected" : "") + ">" + esc(T("Draft ", "Borrador ")) + i + "</option>"; return o; })() + "</select></div>" +
           '<div class="field"><label>&nbsp;</label>' +
             '<label style="display:flex;gap:9px;align-items:flex-start;font-weight:600;cursor:pointer;line-height:1.45;">' +
               '<input type="checkbox" id="prLgDdLock"' + (ddLock() ? " checked" : "") +
               ' style="margin-top:3px;width:17px;height:17px;flex:0 0 auto;">' +
               "<span>" + esc(T("Lock the student to this draft",
                                "Fijar al estudiante en este borrador")) + "</span></label>" +
             '<p class="small" style="margin:6px 0 0;line-height:1.5;color:var(--ink-faint,#8A92A6);">' +
               esc(ddLock()
                 ? T("The subject, grade and draft pickers are hidden on their copy — it opens on Draft " + nv +
                     " and stays there. It is a classroom nudge, not a lock: a student who edits the address bar can still change it.",
                     "En su copia se ocultan los selectores de materia, grado y borrador — abre en el borrador " + nv +
                     " y ahí se queda. Es una guía de aula, no un candado: quien edite la barra de direcciones puede cambiarlo.")
                 : T("They can change subject, grade and draft themselves. Draft " + nv +
                     " is the same draft for every student in the room.",
                     "Podrán cambiar materia, grado y borrador. El borrador " + nv +
                     " es el mismo para todos los estudiantes del salón.")) + "</p></div>";
  }

  /* ⚠ SAY WHICH TAB, AND DO NOT PROMISE ONE THAT DOES NOT EXIST. The Apps
     Script routes dd-math and dd-ela to their own Practice tabs; science,
     social-studies and write have no pattern yet and fall through to the
     general Practice tab. Claiming otherwise here would send a teacher
     looking for a tab that was never created. */
  /* ⚠ ALL FIVE SUBJECTS ROUTE AS OF .30j5 — but only in a Sheet whose Apps
     Script has had that update pasted in. The script is the half of this
     product that does NOT ride the Netlify drag, so a teacher can be running
     a current site against a months-old script. The sentence therefore names
     the tab AND names the condition, instead of promising one and being wrong
     for whoever has not pasted. */
  /* AOG-DD-LINK-TEN-V1 - the tab names are the Apps Script's own (TAB_NAMES / PRACTICE_PATTERNS,
     v17). facs, religion and economics have NO route there yet, so they land in the general
     Practice tab - and the sentence says so instead of promising a tab that does not exist. */
  function ddTabLine(es) {
    var s = ddSubj(), nm = ddSubjName(es).replace(/ \((9–12|by unit|por unidad)\)$/, ""),
        gl = ddGradeLabel(ddGrade(), es), TAB = {
      "math": "Practice · Daily Drafts · Math", "ela": "Practice · Daily Drafts · ELA",
      "science": "Practice · Daily Drafts · Science", "social-studies": "Practice · Daily Drafts · Social Studies",
      "write": "Practice · Daily Drafts · Writing", "spanish": "Practice · Daily Drafts · Spanish",
      "foundry": "Practice · Word Foundry"
    }[s];
    if (!TAB) return es
      ? "La fila llega como Daily Drafts — " + nm + " · " + gl + ", en la pestaña Practice general de tu Hoja. " +
        "Tu Apps Script todavía no le da a esta materia una pestaña propia."
      : "The row arrives as Daily Drafts — " + nm + " · " + gl + ", in the general Practice tab of your Sheet. " +
        "Your Apps Script does not give this subject a tab of its own yet.";
    return es
      ? "La fila llega como Daily Drafts — " + nm + " · " + gl + ", en la pestaña " + TAB + " de tu Hoja. " +
        "Si todavía no has pegado la actualización de septiembre en tu Apps Script, llega a la pestaña Practice general."
      : "The row arrives as Daily Drafts — " + nm + " · " + gl + ", in the " + TAB + " tab of your Sheet. " +
        "If you have not yet pasted the September update into your Apps Script, it lands in the general Practice tab instead.";
  }

  function repaintLink() {
    var s = el("prLgAct"); if (!s) return;
    try { localStorage.setItem(SEL, s.value); } catch (e) {}
    /* AOG-DD-LINK-V1 — bank the three pickers BEFORE the link is built. */
    var ss = el("prLgDdSubj"), gg = el("prLgDdGrade"), nn = el("prLgDdSheet");
    if (ss) ddSet(DDK.s, ss.value);
    if (gg) ddSet(DDK.g, gg.value);
    var lk = el("prLgDdLock");
    if (lk) ddSet(DDK.l, lk.checked ? "1" : "0");
    if (nn) {
      var n = parseInt(nn.value, 10);
      if (!(n >= 1 && n <= 180)) { n = ddSheet(); nn.value = n; }   /* never build a link to a draft that does not exist */
      ddSet(DDK.n, n);
    }
    var u = el("prLgUrl"); if (u) u.value = buildLink(s.value);
    var d = destLine(), p = el("prLgDest");
    if (p) { p.style.color = d.c; p.textContent = d.t; }
    var tl = el("prLgTab");
    if (tl) tl.textContent = (s.value === "drops") ? ddTabLine(isEs())
      : T("The row arrives under the activity's own name — " + actOf(s.value).en + " here — in the Practice tab of your Sheet.",
          "La fila llega con el nombre de la actividad — aquí " + actOf(s.value).es + " — en la pestaña Practice de tu Hoja.");
  }
  /* ⚠ CHANGING THE ACTIVITY CHANGES WHICH FIELDS EXIST, so picking Daily
     Drafts must REBUILD the card, not just repaint the link — otherwise the
     three pickers never appear. Rebuild only when the shape actually flips. */
  function onActChange() {
    var s = el("prLgAct"); if (!s) return;
    var was = (el("prLgDdSubj") ? "drops" : "other");
    var now = (s.value === "drops" ? "drops" : "other");
    try { localStorage.setItem(SEL, s.value); } catch (e) {}
    if (was !== now) {
      var c = el("aogPrLgCard");
      if (c) { c.innerHTML = cardHtml(); wire(); repaintLink(); return; }
    }
    repaintLink();
  }
  function wire() {
    var s = el("prLgAct");
    if (s && !s.__aogPrWired) { s.__aogPrWired = 1; s.addEventListener("change", onActChange); }
    /* AOG-DD-LINK-V1 — 'input' as well as 'change' on the draft number, so the
       link is right the moment it is typed rather than on blur. A teacher
       copies before leaving the field. */
    ["prLgDdSubj", "prLgDdGrade", "prLgDdSheet", "prLgDdLock"].forEach(function (k) {
      var e2 = el(k);
      if (e2 && !e2.__aogPrWired) {
        e2.__aogPrWired = 1;
        /* ⚠ the lock checkbox changes the SENTENCE under it, not just the
           link, so it rebuilds the card — repaintLink alone would leave the
           explanation describing the state the teacher just left. */
        /* AOG-DD-LINK-TEN-V1 - so does the SUBJECT: it changes which grades exist. */
        e2.addEventListener("change", (k === "prLgDdLock" || k === "prLgDdSubj") ? function () {
          repaintLink();
          var c = el("aogPrLgCard");
          if (c) { c.innerHTML = cardHtml(); wire(); repaintLink(); }
        } : repaintLink);
        if (k === "prLgDdSheet") e2.addEventListener("input", repaintLink);
      }
    });
    var c = el("prLgCopy");
    if (c && !c.__aogPrWired) {
      c.__aogPrWired = 1;
      c.addEventListener("click", function () {
        var u = el("prLgUrl"), said = el("prLgSaid");
        if (!u) return;
        function ok() { if (said) { said.style.color = "var(--green,#2E6B3A)"; said.textContent = T("Copied.", "Copiado."); setTimeout(function () { said.textContent = ""; }, 2600); } }
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(u.value).then(ok, function () { u.select(); }); return; }
        } catch (e) {}
        try { u.select(); document.execCommand("copy"); ok(); } catch (e2) {}
      });
    }
    var o = el("prLgOpen");
    if (o && !o.__aogPrWired) {
      o.__aogPrWired = 1;
      o.addEventListener("click", function () {
        var u = el("prLgUrl");
        if (u && u.value) window.open(u.value, "_blank", "noopener");
      });
    }
  }

  /* ⚠ THE CARD GOES INTO #panel-distribute ITSELF, NOT INTO A PANE. The tab
     strip re-reads the panel's own children, groups them by .section-head and
     moves each group into its pane; a node appended straight into a pane is
     invisible to that grouping and would never move again. */
  function install() {
    if (el("aogPrLgCard")) return true;
    var panel = el("panel-distribute");
    if (!panel) return false;
    var head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = "<h2>" + esc(T("Practice page link", "Enlace de página de práctica")) + "</h2>";
    var card = document.createElement("div");
    card.id = "aogPrLgCard";
    card.className = "table-card";
    card.style.padding = "24px 28px";
    card.innerHTML = cardHtml();
    panel.appendChild(head);
    panel.appendChild(card);
    wire();
    try { if (typeof window.__aogDistRebuild === "function") window.__aogDistRebuild(); } catch (e) {}
    return true;
  }

  /* ⚠ The dashboard language switch does not touch documentElement.lang, so a
     card built once sits there in the language it was born in. Hang on
     refreshAdmin — and copy every __aog* flag off the function being wrapped,
     or the next wrapper undoes one of theirs. */
  function watchLang() {
    if (typeof window.refreshAdmin !== "function" || window.refreshAdmin.__aogPrDist) return;
    var orig = window.refreshAdmin;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      try {
        var c = el("aogPrLgCard");
        if (c) {
          c.innerHTML = cardHtml();
          wire();
          var hd = c.previousElementSibling;
          if (hd && hd.classList && hd.classList.contains("section-head")) {
            hd.innerHTML = "<h2>" + esc(T("Practice page link", "Enlace de página de práctica")) + "</h2>";
          }
        }
      } catch (e) {}
      return r;
    };
    Object.keys(orig).forEach(function (k) { if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k]; });
    wrapped.__aogPrDist = 1;
    window.refreshAdmin = wrapped;
  }

  /* ⚠ INSTALL IS NOT ENOUGH — THE SENTENCE GOES STALE. install() returns
     early once the card exists, so a teacher who connects their Sheet in the
     Connect & sync tab and then walks two tabs left would read the sentence
     the card was BORN with, over a link built from the same stale state.
     A real Chromium run caught it: the green case measured identical to the
     amber one, because it was still the amber one. Recompute on every boot,
     and boot on the tab strip's own buttons as well as the panel's. */
  function boot() {
    try { install(); } catch (e) {}
    try { watchLang(); } catch (e2) {}
    try { repaintLink(); } catch (e3) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 900);
  setTimeout(boot, 2600);
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest &&
      e.target.closest('.tab[data-tab="distribute"], .dmode, #aogDistTabs button, #aogSyncCard button');
    if (t) setTimeout(boot, 260);
  });

  window.AOGPracticeLinks = {
    acts: function () { return ACTS.slice(); },
    link: buildLink,
    destState: destState,
    /* test seam — the suite drives Daily Drafts without touching the DOM */
    dd: function (s, g, n, lk) { if (s) ddSet(DDK.s, s); if (g) ddSet(DDK.g, g); if (n) ddSet(DDK.n, n);
                             if (lk != null) ddSet(DDK.l, lk ? "1" : "0");
                             return { subj: ddSubj(), grade: ddGrade(), sheet: ddSheet(), lock: ddLock() }; },
    ddTabLine: ddTabLine,
    install: install,
    /* test seam — the suite asserts the sentence without reading pixels */
    __line: destLine
  };
})();
