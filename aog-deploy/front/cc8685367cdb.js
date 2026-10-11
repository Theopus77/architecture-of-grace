
/* ===================================================================
   IN-THE-MOMENT CLASS TOOLS — Whole-Class Reset & Co-Regulation
   (teacher), Inner Coach & Make It Right (student). Each ends with paid
   breadcrumbs: the lesson (Resource Index) + a free novel chapter.
   Registered into window.TOOLS so toolOpen() opens them anywhere.
   =================================================================== */
(function () {
  function L(en, es) { return (typeof lang !== "undefined" && lang === "es") ? es : en; }

  window.aogToolBreadcrumb = function (kind, query) {
    try {
      var m = document.getElementById("toolModal");
      if (m) { if (typeof window.toolClose === "function") { window.toolClose(); } else { m.classList.remove("open"); } }
    } catch (e) {}
    setTimeout(function () {
      if (kind === "lesson" && window.aogGoConstruct) { window.aogGoConstruct(query || ""); }
      else if (window.aogGoLibrary) { window.aogGoLibrary(); }
    }, 90);
  };
  function crumbs(query, novelPath, novelTitle) {
    var novel = novelPath
      ? '<a class="tc-crumb" href="' + novelPath + '" target="_blank" rel="noopener">' + L("See it in the story", "Vélo en la historia") + ' — “' + novelTitle + '” →</a>'
      : '<button type="button" class="tc-crumb" onclick="aogToolBreadcrumb(\'novel\')">' + L("See it in the story — read a chapter", "Vélo en la historia — lee un capítulo") + ' →</button>';
    return '<div class="tc-crumbs">' +
      '<div class="tc-crumbs-h">' + L("Go further", "Profundiza") + '</div>' +
      '<button type="button" class="tc-crumb" onclick="aogToolBreadcrumb(\'lesson\',\'' + query + '\')">' + L("Teach it — the lesson", "Enséñalo — la lección") + ' →</button>' +
      novel +
      '</div>';
  }

  /* ---- Circle Time / Community Circle hub (teacher, projectable) ----
     Audience-adaptive umbrella name: "Circle Time" for the Child audience,
     "Community Circle" for Teen / Adult (reads in advisory + secondary rooms).
     Five flagship activities, each projectable, bilingual, and ending in the
     standard paid breadcrumbs. Renders into #toolModalBody and swaps content
     in place. The classreset key + every existing entry point are unchanged. */
  function ctAud() { return window.aogRightNowAudience || "adult"; }
  function ctIsChild() { return ctAud() === "child"; }
  function ctHubName() { return ctIsChild() ? L("Circle Time", "Momento en círculo") : L("Community Circle", "Círculo comunitario"); }
  function ctBody() { return document.getElementById("toolModalBody"); }
  function ctBackBar() {
    return '<button type="button" class="ct-back" onclick="aogCtBack()" style="background:none;border:none;color:var(--navy);font-family:var(--font-sans);font-weight:800;font-size:13px;cursor:pointer;padding:2px 0;margin:0 0 6px;display:inline-flex;align-items:center;gap:6px;">← ' + ctHubName() + '</button>';
  }
  window.aogCtBack = function () { var b = ctBody(); if (!b) return; b.innerHTML = buildClassReset(); setTimeout(initClassReset, 30); };
  window.aogCtGo = function (key) {
    var A = CT_ACT[key], b = ctBody(); if (!A || !b) return;
    b.innerHTML = ctBackBar() + A.build();
    if (A.init) setTimeout(A.init, 30);
  };

  /* Rotating content for the discussion circles */
  var CT_STATE = {};
  /* Feelings Go-Round prompts, by grade band (K-2 / 3-5 / 6-8 / 9-12). The teacher
     picks the band; "New prompt" rotates within it. CT_STEMS stays as a flat default. */
  var CT_STEMS_BANDS = {
    k2: [
      { en: "Right now I feel ___.", es: "Ahora mismo me siento ___." },
      { en: "Today I'm like a ___ animal.", es: "Hoy soy como un animal ___." },
      { en: "My color today is ___.", es: "Mi color de hoy es ___." },
      { en: "My weather inside is ___ (sunny, cloudy, stormy).", es: "Mi clima por dentro es ___ (soleado, nublado, tormentoso)." },
      { en: "One thing I'm happy about is ___.", es: "Una cosa que me pone feliz es ___." },
      { en: "Right now my body feels ___.", es: "Ahora mismo mi cuerpo se siente ___." }
    ],
    "35": [
      { en: "Right now my energy is ___.", es: "Ahora mismo mi energía es ___." },
      { en: "One word for how I'm arriving is ___.", es: "Una palabra para cómo llego es ___." },
      { en: "Something I'm bringing into this room is ___.", es: "Algo que traigo a este salón es ___." },
      { en: "A feeling I noticed today is ___.", es: "Un sentimiento que noté hoy es ___." },
      { en: "Something I'm looking forward to is ___.", es: "Algo que espero con ganas es ___." },
      { en: "Today I am arriving as a ___ (weather, animal, or color).", es: "Hoy llego como un/a ___ (clima, animal o color)." }
    ],
    "68": [
      { en: "Right now I feel ___, and that's okay.", es: "Ahora mismo me siento ___, y está bien." },
      { en: "One word for my headspace today is ___.", es: "Una palabra para mi mente hoy es ___." },
      { en: "Something on my mind lately is ___.", es: "Algo que ronda mi mente últimamente es ___." },
      { en: "Today I could use a little more ___.", es: "Hoy me vendría bien un poco más de ___." },
      { en: "One thing that would make today better is ___.", es: "Una cosa que mejoraría hoy es ___." },
      { en: "The energy I'm bringing in is ___.", es: "La energía que traigo es ___." }
    ],
    "912": [
      { en: "Right now I'm carrying ___.", es: "Ahora mismo estoy cargando ___." },
      { en: "One word for where I'm at is ___.", es: "Una palabra para dónde estoy es ___." },
      { en: "Something I'm navigating right now is ___.", es: "Algo que estoy manejando ahora es ___." },
      { en: "What I need from this space today is ___.", es: "Lo que necesito de este espacio hoy es ___." },
      { en: "One thing I'm setting down before we start is ___.", es: "Una cosa que dejo de lado antes de empezar es ___." },
      { en: "Today I'm showing up at about ___ out of 10.", es: "Hoy llego más o menos a ___ de 10." }
    ]
  };
  var CT_BANDS = [
    { k: "k2",  label: { en: "K-2",  es: "K-2" } },
    { k: "35",  label: { en: "3-5",  es: "3.º-5.º" } },
    { k: "68",  label: { en: "6-8",  es: "6.º-8.º" } },
    { k: "912", label: { en: "9-12", es: "9.º-12.º" } }
  ];
  function ctFeelBand() { return CT_STATE.feelBand || "k2"; }
  function ctStems() { return CT_STEMS_BANDS[ctFeelBand()] || CT_STEMS_BANDS.k2; }
  var CT_STEMS = CT_STEMS_BANDS.k2;
  var CT_SCEN = [
    { en: "Someone laughed at a classmate's answer and the room went quiet.", es: "Alguien se rió de la respuesta de un compañero y el salón se quedó en silencio." },
    { en: "Two people grabbed the same materials and one walked off upset.", es: "Dos personas tomaron los mismos materiales y una se fue molesta." },
    { en: "A group left someone out of the activity on purpose.", es: "Un grupo dejó a alguien fuera de la actividad a propósito." },
    { en: "Words got sharp during a disagreement and feelings got hurt.", es: "Las palabras se pusieron duras en un desacuerdo y alguien salió herido." }
  ];
  var CT_STR = [
    { en: "Name one strength you used this week.", es: "Nombra una fortaleza que usaste esta semana." },
    { en: "Tell the person on your right one thing they're good at.", es: "Dile a la persona a tu derecha algo en lo que es buena." },
    { en: "Name one thing that went right today — yours or someone else's.", es: "Nombra algo que salió bien hoy — tuyo o de alguien más." },
    { en: "Finish: “Something I'm proud of lately is ___.”", es: "Completa: “Algo de lo que estoy orgulloso/a últimamente es ___.”" }
  ];
  function ctRotate(list, elId, key) {
    CT_STATE[key] = ((CT_STATE[key] || 0) + 1) % list.length;
    var el = document.getElementById(elId);
    if (el) el.textContent = L(list[CT_STATE[key]].en, list[CT_STATE[key]].es);
  }

  /* Grace Lens — a collapsible "why we do this" frame beneath each circle.
     Teacher-facing intention, not a script to read aloud. Bilingual. */
  function ctGraceLens(key) {
    var LENS = {
      reset:     { en: "Our goal is not perfect focus. Our goal is arriving together.", es: "Nuestra meta no es la concentración perfecta. Nuestra meta es llegar juntos." },
      feelings:  { en: "Every feeling belongs. No feeling earns more value than another.", es: "Cada sentimiento tiene un lugar. Ningún sentimiento vale más que otro." },
      coach:     { en: "We speak to ourselves the way we would speak to a friend.", es: "Nos hablamos como le hablaríamos a un amigo." },
      repair:    { en: "Repair is not punishment. Repair is how trust grows.", es: "Reparar no es castigo. Reparar es cómo crece la confianza." },
      strengths: { en: "We notice strengths so people can see themselves more clearly.", es: "Notamos las fortalezas para que las personas se vean con más claridad." }
    };
    var t = LENS[key];
    if (!t) return "";
    return '<details class="ct-grace-lens" style="max-width:520px;margin:16px auto 4px;border:1px solid rgba(217,163,59,.5);border-radius:12px;background:#FBF7EC;overflow:hidden;">' +
        '<summary style="cursor:pointer;list-style:none;padding:11px 15px;font-family:var(--font-sans);font-weight:800;font-size:13px;letter-spacing:.02em;color:var(--navy);display:flex;align-items:center;gap:8px;">' +
          '<span aria-hidden="true">🕊️</span>' + L("Grace Lens", "La lente de la gracia") +
        '</summary>' +
        '<div style="padding:0 15px 14px;font-family:var(--font-serif);font-size:16px;line-height:1.5;color:var(--navy);font-style:italic;">“' + L(t.en, t.es) + '”</div>' +
      '</details>';
  }

  /* Hub menu — the landing screen for classreset */
  function buildClassReset() {
    var cards = CT_MENU.map(function (m) {
      return '<button type="button" onclick="aogCtGo(\'' + m.key + '\')" style="display:flex;gap:12px;align-items:flex-start;width:100%;text-align:left;background:#fff;border:1.5px solid rgba(0,0,0,.10);border-radius:14px;padding:13px 15px;cursor:pointer;font-family:var(--font-sans);margin:0;transition:border-color .15s,transform .15s;" onmouseover="this.style.borderColor=\'var(--gold)\';this.style.transform=\'translateY(-1px)\';" onmouseout="this.style.borderColor=\'rgba(0,0,0,.10)\';this.style.transform=\'none\';">' +
        '<span style="font-size:22px;line-height:1.2;">' + m.icon + '</span>' +
        '<span style="display:block;"><span style="display:block;font-weight:800;color:var(--navy);font-size:15px;">' + m.name() + '</span>' +
        '<span style="display:block;color:var(--ink);opacity:.8;font-size:12.5px;line-height:1.45;margin-top:2px;">' + m.desc() + '</span></span>' +
        '</button>';
    }).join("");
    return '<div class="tool-modal-icon">⭕</div>' +
      '<div class="tool-modal-title">' + ctHubName() + '</div>' +
      '<div class="tool-modal-sub">' + (ctIsChild()
        ? L("Pick a circle to do together. Each one is made to project, and takes just a few minutes.", "Elige un círculo para hacer juntos. Cada uno se proyecta y toma solo unos minutos.")
        : L("Pick a circle to run with your group — works for advisory or a class meeting. Each is projectable and takes a few minutes.", "Elige un círculo para tu grupo — sirve para tutoría o reunión de clase. Cada uno se proyecta y toma unos minutos.")) + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;max-width:520px;margin:14px auto 4px;">' + cards + '</div>';
  }
  function initClassReset() { /* hub is static; nothing to wire */ }

  /* ===== Activity 1 · Reset Together (group breathing) ===== */
  function buildReset() {
    return '<div class="tool-modal-icon">🌬️</div>' +
      '<div class="tool-modal-title">' + L("Reset Together", "Reinicio juntos") + '</div>' +
      '<div class="tool-modal-sub">' + (ctIsChild()
        ? L("Everyone breathes together for one minute — after recess, or when the room needs to land.", "Todos respiran juntos por un minuto — después del recreo, o cuando el salón necesita calmarse.")
        : L("Everyone breathes together for one minute — before a test, after a tough transition, or when the room needs to land.", "Todos respiran juntos por un minuto — antes de un examen, tras una transición difícil, o cuando el grupo necesita calmarse.")) + '</div>' +
      '<div class="cr-stage"><div class="cr-orb" id="crOrb"></div></div>' +
      '<div class="cr-cue" id="crCue" aria-live="polite">' + L("Press start. Eyes on the circle, or closed.", "Pulsa empezar. Mira el círculo, o cierra los ojos.") + '</div>' +
      '<div class="cr-round" id="crRound" aria-live="polite"></div>' +
      '<div class="aogt-controls"><button class="btn" id="crStart" style="background:var(--gold);border-color:var(--gold);color:var(--navy);">' + L("Start — together", "Empezar — juntos") + '</button></div>' +
      ctGraceLens("reset") +
      crumbs("window of tolerance");
  }
  function initReset() {
    var orb = document.getElementById("crOrb"), cue = document.getElementById("crCue"), btn = document.getElementById("crStart"), round = document.getElementById("crRound");
    if (!orb || !btn) return;
    var IN = L("Breathe in…", "Inhala…"), HOLD = L("Hold", "Sostén"), OUT = L("Breathe out…", "Exhala…"), DONE = L("Nice. Welcome back, everyone.", "Bien. Bienvenidos de vuelta.");
    var reduce = false; try { reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches; } catch (e) {}
    btn.onclick = function () {
      btn.disabled = true; btn.textContent = L("Breathing…", "Respirando…");
      var seq = [], i;
      for (i = 0; i < 5; i++) { seq.push([IN, 1, 4000]); seq.push([HOLD, 1, 2000]); seq.push([OUT, 0.55, 6000]); }
      seq.push([DONE, 0.75, 0]);
      (function run(idx) {
        if (idx >= seq.length) { btn.disabled = false; btn.textContent = L("Again", "Otra vez"); if (round) round.textContent = ""; return; }
        var s = seq[idx];
        if (round && idx < 15 && idx % 3 === 0) { round.textContent = L("Round ", "Ronda ") + (idx / 3 + 1) + L(" of 5", " de 5"); }
        cue.textContent = s[0];
        orb.style.transition = "transform " + (reduce ? 0 : s[2] / 1000) + "s ease-in-out";
        orb.style.transform = "scale(" + s[1] + ")";
        setTimeout(function () { run(idx + 1); }, s[2]);
      })(0);
    };
  }

  /* ===== Activity 2 · Feelings Go-Round (self-reflection) ===== */
  function buildFeelings() {
    return '<div class="tool-modal-icon">💬</div>' +
      '<div class="tool-modal-title">' + L("Feelings Go-Round", "Ronda de sentimientos") + '</div>' +
      '<div class="tool-modal-sub">' + (ctIsChild()
        ? L("Go around the circle. Each person says one word for how they feel — no fixing, no questions. You go first.", "Da la vuelta al círculo. Cada quien dice una palabra de cómo se siente — sin arreglar, sin preguntas. Tú empiezas.")
        : L("Go around the group. One word each for how you're arriving — “pass” is always allowed. Model it first.", "Da la vuelta al grupo. Una palabra cada uno de cómo llegas — “paso” siempre vale. Modélalo tú primero.")) + '</div>' +
      '<div id="ctStemBand" style="display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin:2px auto 12px;">' +
        CT_BANDS.map(function (b) { var on = b.k === ctFeelBand(); return '<button type="button" class="ct-band" data-b="' + b.k + '" onclick="aogCtFeelBand(\'' + b.k + '\')" style="border:1px solid var(--rule);border-radius:999px;padding:6px 14px;font-family:var(--font-sans);font-size:13px;font-weight:' + (on ? '800' : '600') + ';color:var(--navy);background:' + (on ? 'var(--gold)' : '#fff') + ';cursor:pointer;">' + L(b.label.en, b.label.es) + '</button>'; }).join('') +
      '</div>' +
      '<div id="ctStem" style="font-family:var(--font-serif);font-size:22px;line-height:1.4;color:var(--navy);text-align:center;background:#FBF7EC;border-radius:14px;padding:20px 18px;margin:6px auto 12px;max-width:520px;">' + L(ctStems()[0].en, ctStems()[0].es) + '</div>' +
      '<div class="aogt-controls"><button class="btn" id="ctStemBtn" style="background:var(--gold);border-color:var(--gold);color:var(--navy);">' + L("New prompt", "Otra frase") + '</button></div>' +
      '<div style="font-family:var(--font-sans);font-size:12.5px;color:var(--ink);opacity:.75;text-align:center;max-width:520px;margin:10px auto 0;">' + L("Stuck? Words that help: calm, tired, nervous, excited, frustrated, okay, hopeful, worn out, ready.", "¿Atascado? Palabras que ayudan: tranquilo, cansado, nervioso, emocionado, frustrado, bien, esperanzado, agotado, listo.") + '</div>' +
      ctGraceLens("feelings") +
      crumbs("self-awareness");
  }
  function initFeelings() { var b = document.getElementById("ctStemBtn"); if (b) b.onclick = function () { ctRotate(ctStems(), "ctStem", "feelings"); }; }
  /* switch grade band: highlight the chosen pill, reset rotation, show a fresh prompt for that band */
  window.aogCtFeelBand = function (band) {
    if (!CT_STEMS_BANDS[band]) return;
    CT_STATE.feelBand = band; CT_STATE.feelings = 0;
    document.querySelectorAll("#ctStemBand .ct-band").forEach(function (btn) {
      var on = btn.getAttribute("data-b") === band;
      btn.style.background = on ? "var(--gold)" : "#fff";
      btn.style.fontWeight = on ? "800" : "600";
    });
    var el = document.getElementById("ctStem");
    if (el) el.textContent = L(ctStems()[0].en, ctStems()[0].es);
  };

  /* ===== Activity 3 · Coach the Critic (group reframe) ===== */
  function buildCoach() {
    var first = (typeof IC_LINES !== "undefined" && IC_LINES[0]) ? IC_LINES[0] : { c: "", k: "" };
    return '<div class="tool-modal-icon">🧭</div>' +
      '<div class="tool-modal-title">' + L("Coach the Critic", "Guía al crítico") + '</div>' +
      '<div class="tool-modal-sub">' + (ctIsChild()
        ? L("The Critic is the mean voice in our heads. Read it out loud, then let the class flip it into what a kind Coach would say.", "El crítico es la voz dura en nuestra cabeza. Léela en voz alta y deja que la clase la convierta en lo que diría un guía amable.")
        : L("Project what the Critic says. As a group, flip it into a Coach's voice. Reveal one version — but hear the room's first.", "Proyecta lo que dice el crítico. En grupo, conviértelo en la voz de un guía. Revela una versión — pero escucha primero al grupo.")) + '</div>' +
      '<div id="ctCritic" style="font-family:var(--font-serif);font-size:22px;line-height:1.4;color:#8a2b2b;text-align:center;background:#FBEFEF;border-radius:14px;padding:20px 18px;margin:6px auto 10px;max-width:520px;">' + first.c + '</div>' +
      '<div id="ctCoachBox" hidden style="font-family:var(--font-sans);font-size:15.5px;line-height:1.55;color:var(--navy);text-align:center;background:#EAF3EC;border-radius:14px;padding:16px;margin:0 auto 12px;max-width:520px;"></div>' +
      '<div class="aogt-controls" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
        '<button class="btn" id="ctCoachBtn" style="background:var(--gold);border-color:var(--gold);color:var(--navy);">' + L("Reveal a coach response", "Revelar respuesta del guía") + '</button>' +
        '<button class="btn" id="ctCoachNext" style="background:#fff;border-color:var(--navy);color:var(--navy);">' + L("Next thought", "Siguiente pensamiento") + '</button>' +
      '</div>' +
      ctGraceLens("coach") +
      crumbs("inner critic");
  }
  function initCoach() {
    CT_STATE.coach = 0;
    var rev = document.getElementById("ctCoachBtn"), nxt = document.getElementById("ctCoachNext"), crit = document.getElementById("ctCritic"), box = document.getElementById("ctCoachBox");
    if (typeof IC_LINES === "undefined" || !crit) return;
    if (rev) rev.onclick = function () { var o = IC_LINES[CT_STATE.coach]; if (!o || !box) return; box.hidden = false; box.textContent = o.k; };
    if (nxt) nxt.onclick = function () { CT_STATE.coach = (CT_STATE.coach + 1) % IC_LINES.length; crit.textContent = IC_LINES[CT_STATE.coach].c; if (box) { box.hidden = true; box.textContent = ""; } };
  }

  /* ===== Activity 4 · Repair Circle (group repair practice) ===== */
  function buildRepair() {
    return '<div class="tool-modal-icon">🤝</div>' +
      '<div class="tool-modal-title">' + L("Repair Circle", "Círculo de reparación") + '</div>' +
      '<div class="tool-modal-sub">' + (ctIsChild()
        ? L("Project a pretend situation. As a class, say the four repair steps out loud — so they're ready when something real happens.", "Proyecta una situación de práctica. En clase, digan los cuatro pasos en voz alta — para tenerlos listos cuando pase algo real.")
        : L("Project a low-stakes scenario. As a group, walk the four repair steps out loud — rehearsing repair makes it usable when it counts.", "Proyecta un caso de bajo riesgo. En grupo, recorran los cuatro pasos en voz alta — ensayar la reparación la hace usable cuando importa.")) + '</div>' +
      '<div id="ctScen" style="font-family:var(--font-serif);font-size:20px;line-height:1.45;color:var(--navy);text-align:center;background:#FBF7EC;border-radius:14px;padding:18px;margin:6px auto 12px;max-width:520px;">' + L(CT_SCEN[0].en, CT_SCEN[0].es) + '</div>' +
      '<ol style="font-family:var(--font-sans);font-size:14.5px;line-height:1.5;color:var(--ink);max-width:520px;margin:0 auto 6px;text-align:left;padding-left:22px;">' +
        '<li><b>' + L("Own it.", "Reconócelo.") + '</b> ' + L("“I'm sorry I ___.” Name it, no excuses.", "“Perdón por ___.” Nómbralo, sin excusas.") + '</li>' +
        '<li><b>' + L("Name the impact.", "Nombra el impacto.") + '</b> ' + L("“That probably made you feel ___.”", "“Eso probablemente te hizo sentir ___.”") + '</li>' +
        '<li><b>' + L("Make it right.", "Repáralo.") + '</b> ' + L("“To make it better, I could ___.”", "“Para mejorarlo, podría ___.”") + '</li>' +
        '<li><b>' + L("Reset.", "Reinicia.") + '</b> ' + L("“Next time, I'll ___.” Then let it go.", "“La próxima vez, ___.” Luego suéltalo.") + '</li>' +
      '</ol>' +
      '<div class="aogt-controls"><button class="btn" id="ctScenBtn" style="background:var(--gold);border-color:var(--gold);color:var(--navy);">' + L("New scenario", "Otro caso") + '</button></div>' +
      ctGraceLens("repair") +
      crumbs("repair");
  }
  function initRepair() { var b = document.getElementById("ctScenBtn"); if (b) b.onclick = function () { ctRotate(CT_SCEN, "ctScen", "repair"); }; }

  /* ===== Activity 5 · Strengths Circle (affirmation go-round) ===== */
  function buildStrengths() {
    return '<div class="tool-modal-icon">✨</div>' +
      '<div class="tool-modal-title">' + L("Strengths Circle", "Círculo de fortalezas") + '</div>' +
      '<div class="tool-modal-sub">' + (ctIsChild()
        ? L("Go around the circle and answer together. Saying good things out loud helps them stick.", "Da la vuelta al círculo y respondan juntos. Decir cosas buenas en voz alta ayuda a que se queden.")
        : L("Go around the group with the prompt below — “pass” is allowed. Naming strengths out loud builds the muscle.", "Da la vuelta al grupo con la frase de abajo — “paso” vale. Nombrar fortalezas en voz alta entrena el músculo.")) + '</div>' +
      '<div id="ctStr" style="font-family:var(--font-serif);font-size:21px;line-height:1.4;color:var(--navy);text-align:center;background:#FBF7EC;border-radius:14px;padding:20px 18px;margin:6px auto 12px;max-width:520px;">' + L(CT_STR[0].en, CT_STR[0].es) + '</div>' +
      '<div class="aogt-controls"><button class="btn" id="ctStrBtn" style="background:var(--gold);border-color:var(--gold);color:var(--navy);">' + L("New prompt", "Otra frase") + '</button></div>' +
      '<div style="font-family:var(--font-sans);font-size:12.5px;color:var(--ink);opacity:.75;text-align:center;max-width:520px;margin:10px auto 0;">' + L("Strength words: kind, brave, patient, funny, careful, loyal, curious, steady, generous, determined.", "Palabras de fortaleza: amable, valiente, paciente, gracioso, cuidadoso, leal, curioso, firme, generoso, determinado.") + '</div>' +
      ctGraceLens("strengths") +
      crumbs("self-compassion");
  }
  function initStrengths() { var b = document.getElementById("ctStrBtn"); if (b) b.onclick = function () { ctRotate(CT_STR, "ctStr", "strengths"); }; }

  /* Menu + activity registry */
  var CT_MENU = [
    { key: "reset",     icon: "🌬️", name: function () { return L("Reset Together", "Reinicio juntos"); },        desc: function () { return L("One minute of breathing to land the room.", "Un minuto de respiración para calmar el salón."); } },
    { key: "feelings",  icon: "💬", name: function () { return L("Feelings Go-Round", "Ronda de sentimientos"); }, desc: function () { return L("One word each — how everyone's arriving.", "Una palabra cada uno — cómo llega cada quien."); } },
    { key: "coach",     icon: "🧭", name: function () { return L("Coach the Critic", "Guía al crítico"); },        desc: function () { return L("Flip a harsh thought into a coach's voice, together.", "Convierte un pensamiento duro en la voz de un guía, juntos."); } },
    { key: "repair",    icon: "🤝", name: function () { return L("Repair Circle", "Círculo de reparación"); },     desc: function () { return L("Practice the four repair steps on a pretend slip-up.", "Practica los cuatro pasos de reparación con un caso de práctica."); } },
    { key: "strengths", icon: "✨", name: function () { return L("Strengths Circle", "Círculo de fortalezas"); },  desc: function () { return L("A quick go-round naming strengths and wins.", "Una ronda rápida nombrando fortalezas y logros."); } }
  ];
  var CT_ACT = {
    reset:     { build: buildReset,     init: initReset },
    feelings:  { build: buildFeelings,  init: initFeelings },
    coach:     { build: buildCoach,     init: initCoach },
    repair:    { build: buildRepair,    init: initRepair },
    strengths: { build: buildStrengths, init: initStrengths }
  };

  /* ---- Inner Coach in the Moment (student, Domain B) ---- */
  /* ===== Shared grade-band system, reused by the engagement tools ===== */
  var AOG_BANDS = [
    { k: "k2",    l: { en: "K-2",   es: "K-2" } },
    { k: "35",    l: { en: "3-5",   es: "3-5" } },
    { k: "68",    l: { en: "6-8",   es: "6-8" } },
    { k: "912",   l: { en: "9-12",  es: "9-12" } },
    { k: "adult", l: { en: "Adult", es: "Adulto" } }
  ];
  function aogBandChips(wrapId, fn, cur, bands) {
    bands = bands || AOG_BANDS;
    return '<div id="' + wrapId + '" style="display:inline-flex;flex-wrap:wrap;gap:6px;justify-content:center;background:var(--cream-deep,#F4ECDA);border-radius:999px;padding:4px;margin:0 auto 14px;">' +
      bands.map(function (b) {
        var on = b.k === cur;
        return '<button type="button" class="bf-aud" data-a="' + b.k + '" onclick="' + fn + '(\'' + b.k + '\')" style="border:none;border-radius:999px;padding:7px 13px;font-family:var(--font-sans);font-size:13px;font-weight:' + (on ? '800' : '600') + ';color:var(--navy);background:' + (on ? 'var(--gold)' : '#fff') + ';cursor:pointer;">' + L(b.l.en, b.l.es) + '</button>';
      }).join("") +
    '</div>';
  }
  function aogBandSet(wrapId, b) {
    document.querySelectorAll("#" + wrapId + " .bf-aud").forEach(function (x) {
      var on = x.getAttribute("data-a") === b;
      x.style.background = on ? "var(--gold)" : "#fff"; x.style.fontWeight = on ? "800" : "600";
    });
  }

  var IC_STATE = { band: "35" };
  var IC_BANDS = {
    k2: [
      { c: L("“I can't do it.”", "“No puedo.”"), k: L("Not yet! What's one tiny part you CAN try?", "¡Todavía no! ¿Qué parte pequeñita SÍ puedes intentar?") },
      { c: L("“I'm bad at this.”", "“Soy malo/a en esto.”"), k: L("You're still learning. Learning takes lots of tries.", "Todavía estás aprendiendo. Aprender toma muchos intentos.") },
      { c: L("“Nobody likes me.”", "“Nadie me quiere.”"), k: L("That's a sad feeling, not the whole truth. Who is happy you're here?", "Eso es un sentimiento triste, no toda la verdad. ¿Quién se alegra de que estés aquí?") },
      { c: L("“I messed up.”", "“Me equivoqué.”"), k: L("Everybody messes up. You can try again.", "Todos se equivocan. Puedes intentar de nuevo.") },
      { c: L("“I'm so mad at me.”", "“Estoy enojado/a conmigo.”"), k: L("Be kind to you. Let's take one big breath.", "Sé amable contigo. Respiremos grande una vez.") }
    ],
    "35": [
      { c: L("“I always mess everything up.”", "“Siempre arruino todo.”"), k: L("Always? One hard moment isn't every moment. Name one thing that went okay.", "¿Siempre? Un momento difícil no es todos los momentos. Nombra una cosa que salió bien.") },
      { c: L("“I'm so stupid.”", "“Soy tan tonto/a.”"), k: L("You made a mistake — that's being human, not being stupid.", "Cometiste un error — eso es ser humano, no ser tonto/a.") },
      { c: L("“I'll never get it.”", "“Nunca lo voy a entender.”"), k: L("Not yet. Hard things take practice, and you're practicing.", "Todavía no. Las cosas difíciles toman práctica, y la estás haciendo.") },
      { c: L("“Nobody wants to play with me.”", "“Nadie quiere jugar conmigo.”"), k: L("That's the feeling talking. One person glad you're around is ___.", "Eso es el sentimiento hablando. Una persona que se alegra de tenerte cerca es ___.") },
      { c: L("“It's all my fault.”", "“Todo es mi culpa.”"), k: L("Some is mine, some isn't. What part is really mine to own?", "Una parte es mía, otra no. ¿Qué parte me toca de verdad?") }
    ],
    "68": [
      { c: L("“I'm such a failure.”", "“Soy un fracaso.”"), k: L("A setback isn't who you are. What would you tell a friend here?", "Un tropiezo no es quién eres. ¿Qué le dirías a un amigo aquí?") },
      { c: L("“Everyone's better than me.”", "“Todos son mejores que yo.”"), k: L("You're comparing your behind-the-scenes to their highlight reel. What are you getting better at?", "Comparas tu detrás de cámaras con sus mejores momentos. ¿En qué estás mejorando?") },
      { c: L("“I can't do this.”", "“No puedo con esto.”"), k: L("Not yet — different from never. What's the smallest next step?", "Todavía no — distinto de nunca. ¿Cuál es el paso más pequeño?") },
      { c: L("“Nobody actually likes me.”", "“En realidad nadie me quiere.”"), k: L("A feeling, not a fact. Who's one person glad you're around?", "Un sentimiento, no un hecho. ¿Quién se alegra de tenerte cerca?") },
      { c: L("“I'm too much.”", "“Soy demasiado.”"), k: L("Big feelings are information, not a flaw. What's this one telling you?", "Las emociones grandes son información, no un defecto. ¿Qué te dice esta?") }
    ],
    "912": [
      { c: L("“I'm worthless.”", "“No valgo nada.”"), k: L("Your worth isn't decided by a bad day. Name one thing you value in yourself.", "Tu valor no lo decide un mal día. Nombra algo que valoras en ti.") },
      { c: L("“I ruin every relationship.”", "“Arruino todas mis relaciones.”"), k: L("One pattern isn't a life sentence. What could you try differently?", "Un patrón no es una condena. ¿Qué podrías intentar distinto?") },
      { c: L("“I should have this figured out by now.”", "“Ya debería tener esto resuelto.”"), k: L("Growth isn't a schedule. You're allowed to still be learning.", "Crecer no tiene horario. Tienes permiso de seguir aprendiendo.") },
      { c: L("“Everyone's judging me.”", "“Todos me están juzgando.”"), k: L("Most people are busy in their own heads. Whose opinion actually matters?", "Casi todos están en lo suyo. ¿La opinión de quién importa de verdad?") },
      { c: L("“It's pointless to even try.”", "“No tiene caso ni intentarlo.”"), k: L("The critic loves 'pointless.' One small effort still counts.", "Al crítico le encanta 'sin caso'. Un pequeño esfuerzo igual cuenta.") }
    ],
    adult: [
      { c: L("“I'm failing at all of this.”", "“Estoy fallando en todo esto.”"), k: L("All of it? Name one thing you handled today. The critic exaggerates.", "¿En todo? Nombra una cosa que manejaste hoy. El crítico exagera.") },
      { c: L("“I'm not good enough.”", "“No soy suficiente.”"), k: L("By whose standard? You're allowed to be a work in progress.", "¿Según quién? Tienes permiso de ser un trabajo en proceso.") },
      { c: L("“I should be handling this better.”", "“Debería manejar esto mejor.”"), k: L("You're carrying a lot. What would you say to a friend in your shoes?", "Cargas con mucho. ¿Qué le dirías a un amigo en tu lugar?") },
      { c: L("“I'm letting everyone down.”", "“Estoy decepcionando a todos.”"), k: L("Some you can address, some isn't yours. What's actually yours to own?", "Algo puedes atender, otra parte no es tuya. ¿Qué es realmente tuyo?") },
      { c: L("“I have nothing left to give.”", "“No me queda nada que dar.”"), k: L("That's depletion talking. What's one small way to refill, even a little?", "Eso es el agotamiento hablando. ¿Una forma pequeña de recargar, aunque sea poco?") }
    ]
  };
  function icListHtml() {
    var pool = IC_BANDS[IC_STATE.band] || IC_BANDS["35"];
    return pool.map(function (o, i) {
      return '<button type="button" class="ic-line" onclick="aogIcReveal(this,' + i + ')">' + o.c + '</button>';
    }).join("");
  }
  window.aogIcBand = function (b) {
    if (!IC_BANDS[b]) b = "35";
    IC_STATE.band = b; aogBandSet("icBand", b);
    var l = document.getElementById("icList"); if (l) l.innerHTML = icListHtml();
    var box = document.getElementById("icCoach"); if (box) { box.hidden = true; box.innerHTML = ""; }
  };
  function buildInnerCoach() {
    return '<div class="tool-modal-icon">🧭</div>' +
      '<div class="tool-modal-title">' + L("Your Inner Coach", "Tu Guía Interior") + '</div>' +
      aogBandChips("icBand", "aogIcBand", IC_STATE.band) +
      '<div class="tool-modal-sub">' + L("The loud voice in your head isn't the truth — it's just loud. Tap what it's saying, and hear your Coach answer it.", "La voz fuerte en tu cabeza no es la verdad — solo es fuerte. Toca lo que dice y escucha a tu Guía responder.") + '</div>' +
      '<div class="ic-lines" id="icList">' + icListHtml() + '</div>' +
      '<div class="ic-coach" id="icCoach" hidden></div>' +
      crumbs("inner critic");
  }
  window.aogIcReveal = function (el, i) {
    var box = document.getElementById("icCoach"); if (!box) return;
    var pool = IC_BANDS[IC_STATE.band] || IC_BANDS["35"];
    var o = pool[i]; if (!o) return;
    try {
      var lines = document.querySelectorAll(".ic-lines .ic-line");
      for (var j = 0; j < lines.length; j++) { lines[j].classList.remove("sel"); }
      if (el && el.classList) { el.classList.add("sel"); }
    } catch (e) {}
    box.hidden = false;
    box.innerHTML = '<div class="ic-coach-h">' + L("Your Coach says…", "Tu Guía dice…") + '</div><p>' + o.k + '</p>';
    try { box.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {}
  };
  function initInnerCoach() {}

  /* ---- Make It Right (student, Domain C — repair) — grade-banded ---- */
  var MR_STATE = { band: "35" };
  var OWN = { en: "Own it.", es: "Reconócelo." }, IMP = { en: "Name the impact.", es: "Nombra el impacto." }, MK = { en: "Make it right.", es: "Repáralo." }, RST = { en: "Reset.", es: "Reinicia." };
  var MR_BANDS = {
    k2: { sub: { en: "Did you hurt someone, even by accident? You can fix it. Four little steps:", es: "¿Lastimaste a alguien, sin querer? Puedes arreglarlo. Cuatro pasitos:" },
      steps: [
        { b: OWN, t: { en: "“I'm sorry I ___.” Say what you did.", es: "“Perdón por ___.” Di lo que hiciste." } },
        { b: IMP, t: { en: "“That made you feel ___.”", es: "“Eso te hizo sentir ___.”" } },
        { b: MK,  t: { en: "“I can ___ to help.”", es: "“Puedo ___ para ayudar.”" } },
        { b: RST, t: { en: "“Next time I'll ___.” Then it's okay.", es: "“La próxima vez ___.” Y ya está bien." } }
      ] },
    "35": { sub: { en: "Hurt someone — even by accident? Repair is a skill, not a punishment. Four steps:", es: "¿Lastimaste a alguien — sin querer? Reparar es una habilidad, no un castigo. Cuatro pasos:" },
      steps: [
        { b: OWN, t: { en: "“I'm sorry I ___.” Name it, no excuses.", es: "“Perdón por ___.” Nómbralo, sin excusas." } },
        { b: IMP, t: { en: "“That probably made you feel ___.”", es: "“Eso probablemente te hizo sentir ___.”" } },
        { b: MK,  t: { en: "“To make it better, I could ___.” Ask what would help.", es: "“Para mejorarlo, podría ___.” Pregunta qué ayudaría." } },
        { b: RST, t: { en: "“Next time, I'll ___.” Then let it go.", es: "“La próxima vez, ___.” Luego suéltalo." } }
      ] },
    "68": { sub: { en: "Hurt someone, even by accident? Repair is a skill — honest beats perfect. Four steps:", es: "¿Lastimaste a alguien, sin querer? Reparar es una habilidad — ser honesto vale más que ser perfecto. Cuatro pasos:" },
      steps: [
        { b: OWN, t: { en: "“I'm sorry I ___.” Own your part without a 'but'.", es: "“Perdón por ___.” Asume tu parte sin 'pero'." } },
        { b: IMP, t: { en: "“That probably made you feel ___.” Guess, then listen.", es: "“Eso probablemente te hizo sentir ___.” Adivina y luego escucha." } },
        { b: MK,  t: { en: "“To make it right, I could ___.” Ask what would actually help.", es: "“Para repararlo, podría ___.” Pregunta qué ayudaría de verdad." } },
        { b: RST, t: { en: "“Next time, I'll ___.” Guilt is about what you did, not who you are.", es: "“La próxima vez, ___.” La culpa es por lo que hiciste, no por quién eres." } }
      ] },
    "912": { sub: { en: "Hurt someone, even by accident? Repair rebuilds trust — you don't have to be perfect, just honest. Four steps:", es: "¿Lastimaste a alguien, sin querer? Reparar reconstruye la confianza — no tienes que ser perfecto/a, solo honesto/a. Cuatro pasos:" },
      steps: [
        { b: OWN, t: { en: "“I'm sorry I ___.” Name the specific thing; drop the excuses and the 'but'.", es: "“Perdón por ___.” Nombra lo específico; deja las excusas y el 'pero'." } },
        { b: IMP, t: { en: "“That probably made you feel ___.” Name the impact, then actually listen to theirs.", es: "“Eso probablemente te hizo sentir ___.” Nombra el impacto y luego escucha el suyo." } },
        { b: MK,  t: { en: "“To make it right, I could ___.” Offer a concrete repair and ask what would help.", es: "“Para repararlo, podría ___.” Ofrece algo concreto y pregunta qué ayudaría." } },
        { b: RST, t: { en: "“Next time, I'll ___.” Then set the guilt down — it's about the action, not your worth.", es: "“La próxima vez, ___.” Luego suelta la culpa — es por la acción, no por tu valor." } }
      ] },
    adult: { sub: { en: "Repair is a skill, not a performance. Owning impact (not just intent) rebuilds trust. Four steps:", es: "Reparar es una habilidad, no una actuación. Asumir el impacto (no solo la intención) reconstruye la confianza. Cuatro pasos:" },
      steps: [
        { b: OWN, t: { en: "“I'm sorry I ___.” Name it plainly; resist explaining it away.", es: "“Perdón por ___.” Nómbralo con claridad; evita justificarlo." } },
        { b: IMP, t: { en: "“That likely left you feeling ___.” Lead with their impact over your intent.", es: "“Eso probablemente te dejó sintiendo ___.” Pon su impacto por delante de tu intención." } },
        { b: MK,  t: { en: "“To repair it, I could ___.” Offer something concrete and ask what they need.", es: "“Para repararlo, podría ___.” Ofrece algo concreto y pregunta qué necesitan." } },
        { b: RST, t: { en: "“Going forward, I'll ___.” Then release the shame spiral — accountability, not self-punishment.", es: "“De aquí en adelante, ___.” Luego suelta la espiral de vergüenza — responsabilidad, no autocastigo." } }
      ] }
  };
  function mrBodyHtml() {
    var d = MR_BANDS[MR_STATE.band] || MR_BANDS["35"];
    return '<p style="font-size:13.5px;color:var(--ink-soft);margin:0 0 12px;line-height:1.5;">' + L(d.sub.en, d.sub.es) + '</p>' +
      '<ol class="mr-steps">' + d.steps.map(function (s) { return '<li><b>' + L(s.b.en, s.b.es) + '</b> ' + L(s.t.en, s.t.es) + '</li>'; }).join("") + '</ol>';
  }
  window.aogMrBand = function (b) {
    if (!MR_BANDS[b]) b = "35";
    MR_STATE.band = b; aogBandSet("mrBand", b);
    var el = document.getElementById("mrBody"); if (el) el.innerHTML = mrBodyHtml();
  };
  function buildMakeRight() {
    return '<div class="tool-modal-icon">🤝</div>' +
      '<div class="tool-modal-title">' + L("Make It Right", "Reparar") + '</div>' +
      aogBandChips("mrBand", "aogMrBand", MR_STATE.band) +
      '<div class="tool-modal-sub">' + L("Repair is a skill, not a punishment — honest beats perfect.", "Reparar es una habilidad, no un castigo — la honestidad vale más que la perfección.") + '</div>' +
      '<div id="mrBody" style="text-align:left;max-width:520px;margin:0 auto;">' + mrBodyHtml() + '</div>' +
      crumbs("repair");
  }
  function initMakeRight() {}

  /* ---- Co-Regulation cheat-card (teacher) — bilingual rewrite of the legacy English-only tool ---- */
  function buildCoreg() {
    return '<div class="tool-modal-icon">🧡</div>' +
      '<div class="tool-modal-title">' + L("Co-Regulation Reminder", "Recordatorio de co-regulación") + '</div>' +
      '<div class="tool-modal-sub" style="font-size:15px;line-height:1.7;text-align:left;margin-top:14px;">' +
        '<p style="font-family:var(--font-serif);font-style:italic;font-size:18px;margin-bottom:14px;">' + L("Before you regulate the student, regulate yourself.", "Antes de regular al estudiante, regúlate tú.") + '</p>' +
        '<p><strong>1. ' + L("Check your breath.", "Revisa tu respiración.") + '</strong> ' + L("Take one slow breath right now, before you say anything.", "Toma una respiración lenta ahora, antes de decir nada.") + '</p>' +
        '<p><strong>2. ' + L("Relax your jaw.", "Relaja la mandíbula.") + '</strong> ' + L("Most people don’t notice they’ve been clenching. Drop it.", "La mayoría no nota que la aprieta. Suéltala.") + '</p>' +
        '<p><strong>3. ' + L("Lower your shoulders.", "Baja los hombros.") + '</strong> ' + L("They’ve crept up. Let them fall.", "Se subieron. Déjalos caer.") + '</p>' +
        '<p><strong>4. ' + L("Soften your voice.", "Suaviza la voz.") + '</strong> ' + L("One full tone quieter than you think you need.", "Un tono más bajo de lo que crees necesitar.") + '</p>' +
        '<p><strong>5. ' + L("Check your face.", "Revisa tu cara.") + '</strong> ' + L("A calm, warm face helps an upset student feel safe.", "Una cara tranquila y cálida ayuda a un estudiante alterado a sentirse seguro.") + '</p>' +
        '<p style="font-family:var(--font-serif);font-style:italic;font-size:16px;margin-top:18px;color:var(--gold-deep,#9a6f24);">' + L("Your calm is the intervention. Everything else is secondary.", "Tu calma es la intervención. Todo lo demás es secundario.") + '</p>' +
      '</div>' +
      crumbs("window of tolerance");
  }

  /* ===== Beyond "Fine" — everyday parent conversation deck =====
     Beats the "How was your day?" -> "fine" wall: bite-size, open-ended
     questions by vibe, plus a short strip coaching the adult on HOW to ask.
     Reuses the global Copy / Print / Take-home QR handlers from the Bridge card. */
  var BF_STATE = { aud: "35", cat: "all", last: -1 };
  var BF_CATS = [
    { k: "all",      label: function () { return L("All", "Todas"); } },
    { k: "silly",    label: function () { return L("Silly", "Divertidas"); } },
    { k: "feelings", label: function () { return L("Feelings", "Sentimientos"); } },
    { k: "friends",  label: function () { return L("Friends", "Amigos"); } },
    { k: "school",   label: function () { return L("School", "Escuela"); } },
    { k: "wins",     label: function () { return L("Wins", "Logros"); } },
    { k: "hard",     label: function () { return L("Hard stuff", "Lo difícil"); } }
  ];
  var BF_Q = {
    silly: {
      k2: [ { en: "If today were an animal, which one?", es: "Si hoy fuera un animal, ¿cuál sería?" }, { en: "What made you giggle today?", es: "¿Qué te hizo reír hoy?" }, { en: "What food should NOT exist?", es: "¿Qué comida NO debería existir?" }, { en: "If our pet could talk, what would it say?", es: "Si nuestra mascota hablara, ¿qué diría?" } ],
      "35": [ { en: "What's the silliest thing that happened today?", es: "¿Qué fue lo más gracioso que pasó hoy?" }, { en: "If you could rename today, what would you call it?", es: "Si pudieras renombrar hoy, ¿cómo lo llamarías?" }, { en: "What sound describes your day?", es: "¿Qué sonido describe tu día?" }, { en: "What superpower would have helped today?", es: "¿Qué superpoder te habría servido hoy?" } ],
      "68": [ { en: "If today had a soundtrack, what song was it?", es: "Si hoy tuviera banda sonora, ¿qué canción sería?" }, { en: "What's the most chaotic thing you saw today?", es: "¿Qué fue lo más caótico que viste hoy?" }, { en: "What meme describes your day?", es: "¿Qué meme describe tu día?" }, { en: "What's an unpopular opinion you stand by?", es: "¿Qué opinión impopular defiendes?" } ],
      "912": [ { en: "What's the dumbest thing that made you laugh today?", es: "¿Qué tontería te hizo reír hoy?" }, { en: "If you could swap lives with anyone for a day, who?", es: "Si cambiaras de vida con alguien por un día, ¿con quién?" }, { en: "What's a hill you'd (jokingly) die on?", es: "¿Qué idea defenderías (en broma) hasta el final?" }, { en: "What would the title of today's episode be?", es: "¿Cuál sería el título del episodio de hoy?" } ],
      adult: [ { en: "If today were a movie genre, what was it?", es: "Si hoy fuera un género de película, ¿cuál?" }, { en: "What absurd small thing got you today?", es: "¿Qué pequeñez absurda te pasó hoy?" }, { en: "What was your pettiest win today?", es: "¿Cuál fue tu victoria más insignificante de hoy?" }, { en: "What would your day's status update say?", es: "¿Qué diría tu estado de hoy?" } ]
    },
    feelings: {
      k2: [ { en: "What color matches your mood right now?", es: "¿Qué color va con tu ánimo ahora?" }, { en: "A happy moment and a not-so-happy moment today?", es: "¿Un momento feliz y uno no tan feliz de hoy?" }, { en: "When did you feel proud today?", es: "¿Cuándo te sentiste orgulloso/a hoy?" }, { en: "What made you feel calm today?", es: "¿Qué te hizo sentir tranquilo/a hoy?" } ],
      "35": [ { en: "Was there a moment you felt nervous? What happened?", es: "¿Hubo un momento de nervios? ¿Qué pasó?" }, { en: "Did anything frustrate you today?", es: "¿Algo te frustró hoy?" }, { en: "What feeling did you have more than once today?", es: "¿Qué sentimiento tuviste más de una vez hoy?" }, { en: "What helped when a feeling got big?", es: "¿Qué ayudó cuando un sentimiento se hizo grande?" } ],
      "68": [ { en: "When did you feel most like yourself today?", es: "¿Cuándo te sentiste más tú mismo/a hoy?" }, { en: "Was there a moment today that stressed you?", es: "¿Hubo un momento hoy que te estresó?" }, { en: "What's been on your mind lately?", es: "¿Qué te ha rondado la cabeza últimamente?" }, { en: "What gave you energy, and what drained it?", es: "¿Qué te dio energía y qué te la quitó?" } ],
      "912": [ { en: "On a 1-10, how was today — what moved the number?", es: "Del 1 al 10, ¿cómo estuvo hoy — qué movió el número?" }, { en: "What are you looking forward to, even a little?", es: "¿Qué esperas con ganas, aunque sea poco?" }, { en: "What feeling are you carrying that's hard to name?", es: "¿Qué sentimiento cargas que es difícil de nombrar?" }, { en: "When did you feel genuinely okay today?", es: "¿Cuándo te sentiste de verdad bien hoy?" } ],
      adult: [ { en: "What's been quietly taking up space in your head?", es: "¿Qué ha estado ocupando espacio en tu mente?" }, { en: "Where did you feel most steady today?", es: "¿Dónde te sentiste más estable hoy?" }, { en: "What drained your tank today, and what refilled it?", es: "¿Qué vació tu tanque hoy y qué lo llenó?" }, { en: "What feeling are you pretending not to have?", es: "¿Qué sentimiento finges no tener?" } ]
    },
    friends: {
      k2: [ { en: "Who made you smile today?", es: "¿Quién te hizo sonreír hoy?" }, { en: "Who did you sit with at lunch?", es: "¿Con quién te sentaste en el almuerzo?" }, { en: "What kind thing did a friend do?", es: "¿Qué cosa amable hizo un amigo/a?" }, { en: "Who do you want to play with tomorrow?", es: "¿Con quién quieres jugar mañana?" } ],
      "35": [ { en: "Did anyone need help today? Did you help?", es: "¿Alguien necesitó ayuda hoy? ¿Ayudaste?" }, { en: "Was anyone left out today?", es: "¿Alguien quedó excluido hoy?" }, { en: "Who's easy to be around, and why?", es: "¿Con quién es fácil estar, y por qué?" }, { en: "Did you and a friend disagree? What happened?", es: "¿Tú y un amigo/a no estuvieron de acuerdo? ¿Qué pasó?" } ],
      "68": [ { en: "Who'd you end up talking to today?", es: "¿Con quién terminaste hablando hoy?" }, { en: "Did anyone surprise you today — good or bad?", es: "¿Alguien te sorprendió hoy — para bien o para mal?" }, { en: "Who makes school easier to get through?", es: "¿Quién hace la escuela más llevadera?" }, { en: "Is anyone you know going through something hard?", es: "¿Alguien que conoces está pasando por algo difícil?" } ],
      "912": [ { en: "Who's someone you'd want to hang out with more?", es: "¿Con quién te gustaría pasar más tiempo?" }, { en: "Any drama you can tell me about?", es: "¿Algún drama que me puedas contar?" }, { en: "Who's been a good influence on you lately?", es: "¿Quién ha sido buena influencia para ti últimamente?" }, { en: "Who do you feel fully yourself around?", es: "¿Con quién te sientes completamente tú?" } ],
      adult: [ { en: "Who energized you today, and who drained you?", es: "¿Quién te dio energía hoy y quién te la quitó?" }, { en: "Who did you mean to reach out to but didn't?", es: "¿A quién quisiste contactar pero no lo hiciste?" }, { en: "Who showed up for you this week?", es: "¿Quién estuvo para ti esta semana?" }, { en: "Whose support do you need to ask for?", es: "¿A quién necesitas pedir apoyo?" } ]
    },
    school: {
      k2: [ { en: "What's one thing you learned today?", es: "¿Qué aprendiste hoy?" }, { en: "What was easy today? What was hard?", es: "¿Qué fue fácil hoy? ¿Qué fue difícil?" }, { en: "What's the best thing in your classroom?", es: "¿Qué es lo mejor de tu salón?" }, { en: "If you were the teacher, what would you do?", es: "Si fueras el maestro/a, ¿qué harías?" } ],
      "35": [ { en: "What surprised you in class today?", es: "¿Qué te sorprendió en clase hoy?" }, { en: "What are you working on that's tricky?", es: "¿En qué trabajas que sea complicado?" }, { en: "What question do you wish someone asked you?", es: "¿Qué pregunta te gustaría que te hicieran?" }, { en: "What part of today would you redo?", es: "¿Qué parte de hoy repetirías?" } ],
      "68": [ { en: "What class actually held your attention today?", es: "¿Qué clase de verdad te mantuvo atento/a?" }, { en: "What are you stuck on right now?", es: "¿En qué estás atascado/a ahora?" }, { en: "What's a teacher doing that works for you?", es: "¿Qué hace algún maestro/a que te funciona?" }, { en: "What felt pointless today — and why?", es: "¿Qué se sintió sin sentido hoy — y por qué?" } ],
      "912": [ { en: "If you could drop one assignment, which and why?", es: "Si eliminaras una tarea, ¿cuál y por qué?" }, { en: "What's something you aced, or almost, lately?", es: "¿En qué te fue genial, o casi, últimamente?" }, { en: "What's stressing you about what's coming up?", es: "¿Qué te estresa de lo que viene?" }, { en: "What do you actually want to get better at?", es: "¿En qué quieres de verdad mejorar?" } ],
      adult: [ { en: "What part of work today actually felt meaningful?", es: "¿Qué parte del trabajo hoy se sintió significativa?" }, { en: "What's stuck on your plate right now?", es: "¿Qué tienes atascado en tu lista ahora?" }, { en: "What went better than expected today?", es: "¿Qué salió mejor de lo esperado hoy?" }, { en: "What's one thing you want to set down today?", es: "¿Qué cosa quieres soltar hoy?" } ]
    },
    wins: {
      k2: [ { en: "What's a tiny win from today?", es: "¿Cuál fue un pequeño logro de hoy?" }, { en: "What hard thing did you do anyway?", es: "¿Qué cosa difícil hiciste de todos modos?" }, { en: "What did you try that was new?", es: "¿Qué cosa nueva probaste?" }, { en: "Did you make someone's day better?", es: "¿Le alegraste el día a alguien?" } ],
      "35": [ { en: "What did you get a little better at?", es: "¿En qué mejoraste un poquito?" }, { en: "What are you proud of, even if small?", es: "¿De qué estás orgulloso/a, aunque sea pequeño?" }, { en: "What did you keep trying at today?", es: "¿En qué seguiste intentando hoy?" }, { en: "What kindness did you do today?", es: "¿Qué acto amable hiciste hoy?" } ],
      "68": [ { en: "What did you handle today that you're proud of?", es: "¿Qué manejaste hoy de lo que estás orgulloso/a?" }, { en: "What's a small win nobody noticed but you?", es: "¿Qué logro pequeño solo tú notaste?" }, { en: "What did you push through today?", es: "¿Qué superaste hoy?" }, { en: "What risk did you take, even a small one?", es: "¿Qué riesgo tomaste, aunque pequeño?" } ],
      "912": [ { en: "What did you do today 'past you' couldn't?", es: "¿Qué hiciste hoy que el 'tú de antes' no podía?" }, { en: "What are you genuinely getting better at?", es: "¿En qué estás mejorando de verdad?" }, { en: "What did you follow through on today?", es: "¿En qué cumpliste hoy?" }, { en: "What's a win you'd downplay but shouldn't?", es: "¿Qué logro minimizarías pero no deberías?" } ],
      adult: [ { en: "What did you get done that you'll forget to credit yourself for?", es: "¿Qué lograste que olvidarás reconocerte?" }, { en: "What did you handle with more grace than usual?", es: "¿Qué manejaste con más calma de lo usual?" }, { en: "What boundary did you hold today?", es: "¿Qué límite mantuviste hoy?" }, { en: "What small thing went right today?", es: "¿Qué cosa pequeña salió bien hoy?" } ]
    },
    hard: {
      k2: [ { en: "Did anything worry you today?", es: "¿Algo te preocupó hoy?" }, { en: "Was there a moment that felt unfair?", es: "¿Hubo un momento que se sintió injusto?" }, { en: "Was there a time you felt sad or left out?", es: "¿Hubo un momento en que te sentiste triste o excluido/a?" }, { en: "What do you need help with?", es: "¿En qué necesitas ayuda?" } ],
      "35": [ { en: "What do you wish had gone differently?", es: "¿Qué te gustaría que hubiera salido distinto?" }, { en: "Is there something hard you haven't told me?", es: "¿Hay algo difícil que no me has contado?" }, { en: "What felt too big to handle alone today?", es: "¿Qué se sintió demasiado grande para ti solo/a hoy?" }, { en: "What would have made today easier?", es: "¿Qué habría hecho hoy más fácil?" } ],
      "68": [ { en: "What's been weighing on you?", es: "¿Qué te ha estado pesando?" }, { en: "What moment today would you redo?", es: "¿Qué momento de hoy repetirías?" }, { en: "What's something you need from me this week?", es: "¿Qué necesitas de mí esta semana?" }, { en: "Is anything making tomorrow feel hard?", es: "¿Algo hace que mañana se sienta difícil?" } ],
      "912": [ { en: "What's feeling heavy right now, even a little?", es: "¿Qué se siente pesado ahora, aunque sea poco?" }, { en: "What have you meant to tell me but haven't?", es: "¿Qué has querido decirme pero no lo has hecho?" }, { en: "What are you dreading, and what's underneath it?", es: "¿Qué temes, y qué hay detrás?" }, { en: "Where do you need support but haven't asked?", es: "¿Dónde necesitas apoyo pero no lo has pedido?" } ],
      adult: [ { en: "What's the thing you keep not saying out loud?", es: "¿Qué es eso que sigues sin decir en voz alta?" }, { en: "What's draining you that you keep tolerating?", es: "¿Qué te agota que sigues tolerando?" }, { en: "Where are you running on empty right now?", es: "¿Dónde estás funcionando en vacío ahora?" }, { en: "What support do you need to ask for this week?", es: "¿Qué apoyo necesitas pedir esta semana?" } ]
    }
  };
  function bfPool() {
    var aud = BF_STATE.aud, cat = BF_STATE.cat;
    if (cat && cat !== "all") return (BF_Q[cat] && BF_Q[cat][aud]) || [];
    var all = []; Object.keys(BF_Q).forEach(function (k) { all = all.concat(BF_Q[k][aud] || []); }); return all;
  }
  function bfRender() {
    var pool = bfPool(); if (!pool.length) return;
    var idx;
    if (pool.length === 1) idx = 0;
    else { do { idx = Math.floor(Math.random() * pool.length); } while (idx === BF_STATE.last); }
    BF_STATE.last = idx;
    var el = document.getElementById("bfQ"); if (el) el.textContent = L(pool[idx].en, pool[idx].es);
    var qr = document.querySelector("#beyondFineCard .aog-bridge-qr"); if (qr) { qr.style.display = "none"; qr.innerHTML = ""; }
  }
  window.aogBfNext = function () { bfRender(); };
  window.aogBfBand = function (b) {
    if (!BF_Q.silly[b]) b = "35";
    BF_STATE.aud = b; BF_STATE.last = -1;
    aogBandSet("bfBand", b);
    bfRender();
  };
  window.aogBfCat = function (c) {
    BF_STATE.cat = c; BF_STATE.last = -1;
    document.querySelectorAll("#bfCats .bf-chip").forEach(function (b) { var on = b.getAttribute("data-c") === c; b.style.background = on ? "var(--navy)" : "#fff"; b.style.color = on ? "#fff" : "var(--navy)"; });
    bfRender();
  };
  function buildBeyondFine() {
    var tips =
      '<div style="background:#fff;border:1px solid var(--rule,#D9CBA8);border-radius:12px;padding:12px 14px;margin:0 auto 14px;max-width:560px;text-align:left;">' +
      '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);margin-bottom:7px;">' + L("How to get past “fine”", "Cómo pasar de “bien”") + '</div>' +
      '<div style="font-family:var(--font-sans);font-size:13px;line-height:1.55;color:var(--ink,#2C3A47);">' +
        '• ' + L("Ask about a <b>moment</b>, not the whole day.", "Pregunta por un <b>momento</b>, no por todo el día.") + '<br>' +
        '• ' + L("Keep it to <b>one small question</b> — then listen.", "Haz <b>una sola pregunta pequeña</b> — luego escucha.") + '<br>' +
        '• ' + L("<b>Silence is okay.</b> Give them a few seconds.", "<b>El silencio está bien.</b> Dales unos segundos.") + '<br>' +
        '• ' + L("<b>Go first</b> — share a bit of your day to model it.", "<b>Empieza tú</b> — comparte algo de tu día para dar el ejemplo.") +
      '</div></div>';
    var auds = aogBandChips("bfBand", "aogBfBand", BF_STATE.aud);
    var chips = '<div id="bfCats" style="display:flex;gap:7px;flex-wrap:wrap;justify-content:center;max-width:560px;margin:0 auto 14px;">';
    BF_CATS.forEach(function (c) {
      var on = c.k === BF_STATE.cat;
      chips += '<button type="button" class="bf-chip" data-c="' + c.k + '" onclick="aogBfCat(\'' + c.k + '\')" style="border:1.5px solid var(--navy);border-radius:999px;padding:6px 13px;font-family:var(--font-sans);font-size:12.5px;font-weight:700;cursor:pointer;background:' + (on ? "var(--navy)" : "#fff") + ';color:' + (on ? "#fff" : "var(--navy)") + ';">' + c.label() + '</button>';
    });
    chips += '</div>';
    var gold = "border:1.5px solid var(--gold);background:var(--gold,#B8893A);color:var(--navy);border-radius:999px;padding:8px 15px;font-family:var(--font-sans);font-size:13px;font-weight:800;cursor:pointer;";
    var ghost = "border:1.5px solid var(--rule,#D9CBA8);background:#fff;color:var(--navy);border-radius:999px;padding:8px 15px;font-family:var(--font-sans);font-size:13px;font-weight:700;cursor:pointer;";
    var card =
      '<div class="aog-bridge" id="beyondFineCard" style="margin:0 auto;max-width:560px;border:1.5px solid var(--gold);background:var(--cream,#FBF3DF);border-radius:14px;padding:18px;">' +
      '<p class="aog-bridge-q" id="bfQ" style="font-family:var(--font-serif);font-size:21px;line-height:1.4;color:var(--ink);margin:0 0 14px;text-align:center;">&nbsp;</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">' +
        '<button type="button" onclick="aogBfNext()" style="' + gold + '">' + L("Another", "Otra") + '</button>' +
        '<button type="button" onclick="aogBridgeCopy(this)" style="' + ghost + '">' + L("Copy", "Copiar") + '</button>' +
        '<button type="button" onclick="aogBridgePrint(this)" style="' + ghost + '">' + L("Print card", "Imprimir tarjeta") + '</button>' +
        '<button type="button" onclick="aogBridgeQr(this)" style="' + ghost + '">' + L("Take-home QR", "QR para casa") + '</button>' +
      '</div>' +
      '<div class="aog-bridge-qr" style="display:none;margin-top:14px;text-align:center;"></div>' +
      '</div>';
    return '<div class="tool-modal-icon">💬</div>' +
      '<div class="tool-modal-title">' + L("Beyond “Fine”", "Más allá de “bien”") + '</div>' +
      auds +
      '<div class="tool-modal-sub">' + L("Turn “How was your day?” → “fine” into a real conversation. Pick a lane, ask one small question, and let them lead.", "Convierte “¿Cómo te fue?” → “bien” en una conversación real. Elige un tema, haz una pregunta pequeña y deja que ellos guíen.") + '</div>' +
      tips + chips + card +
      crumbs("self-awareness");
  }
  function initBeyondFine() { BF_STATE.last = -1; bfRender(); }

  /* ===== Harsh -> Kind — self-compassion reframes =====
     The loud voice in our heads isn't the truth; it's just loud. Shows a harsh
     line and the kinder coach version beside it — a reference for modeling kind
     self-talk with a child (Pillar: Self-Compassion). Bilingual, child/teen. */
  var HK_STATE = { aud: "35", last: -1 };
  var HK_PAIRS = {
    k2: [
      { h: { en: "“I can't do it.”", es: "“No puedo.”" }, k: { en: "Not yet. What's one tiny first step?", es: "Todavía no. ¿Cuál es un primer pasito?" } },
      { h: { en: "“I'm bad at this.”", es: "“Soy malo/a en esto.”" }, k: { en: "I'm still learning. Learning takes tries.", es: "Sigo aprendiendo. Aprender toma intentos." } },
      { h: { en: "“I always mess up.”", es: "“Siempre me equivoco.”" }, k: { en: "Not always. I can try again.", es: "Siempre no. Puedo intentar otra vez." } },
      { h: { en: "“Nobody likes me.”", es: "“Nadie me quiere.”" }, k: { en: "Someone is glad I'm here. One is ___.", es: "Alguien se alegra de que esté aquí. Uno es ___." } },
      { h: { en: "“I'm dumb.”", es: "“Soy tonto/a.”" }, k: { en: "I made a mistake. That's being human.", es: "Cometí un error. Eso es ser humano." } },
      { h: { en: "“I can't do anything right.”", es: "“No hago nada bien.”" }, k: { en: "I did one thing okay today: ___.", es: "Hoy hice bien una cosa: ___." } }
    ],
    "35": [
      { h: { en: "“I'm so stupid.”", es: "“Soy tan tonto/a.”" }, k: { en: "I made a mistake — that's human, not stupid. What can I learn?", es: "Cometí un error — eso es humano, no tonto/a. ¿Qué puedo aprender?" } },
      { h: { en: "“I always mess everything up.”", es: "“Siempre arruino todo.”" }, k: { en: "One hard moment isn't every moment. One thing that went okay was ___.", es: "Un momento difícil no es todos los momentos. Una cosa que salió bien fue ___." } },
      { h: { en: "“I'll never get it.”", es: "“Nunca lo voy a entender.”" }, k: { en: "Not yet. Hard things take practice, and I'm practicing.", es: "Todavía no. Las cosas difíciles toman práctica, y la estoy haciendo." } },
      { h: { en: "“Nobody wants to play with me.”", es: "“Nadie quiere jugar conmigo.”" }, k: { en: "That's the feeling, not the whole truth. One kind thing I can try is ___.", es: "Eso es el sentimiento, no toda la verdad. Una cosa amable que puedo intentar es ___." } },
      { h: { en: "“It's all my fault.”", es: "“Todo es mi culpa.”" }, k: { en: "Some is mine, some isn't. What part is really mine?", es: "Una parte es mía, otra no. ¿Qué parte es de verdad mía?" } },
      { h: { en: "“I'm the worst.”", es: "“Soy lo peor.”" }, k: { en: "I'm having a hard time — that's different from being bad.", es: "Estoy pasando un momento difícil — eso es distinto de ser malo/a." } }
    ],
    "68": [
      { h: { en: "“I'm such a failure.”", es: "“Soy un fracaso.”" }, k: { en: "A setback isn't an identity. What would I tell a friend here?", es: "Un tropiezo no es una identidad. ¿Qué le diría a un amigo/a aquí?" } },
      { h: { en: "“Everyone's better than me.”", es: "“Todos son mejores que yo.”" }, k: { en: "I'm on my own path. I'm getting better at ___.", es: "Voy por mi propio camino. Estoy mejorando en ___." } },
      { h: { en: "“I can't do this.”", es: "“No puedo con esto.”" }, k: { en: "I can't do this yet. The smallest next step is ___.", es: "No puedo con esto todavía. El paso más pequeño es ___." } },
      { h: { en: "“Nobody actually likes me.”", es: "“En realidad nadie me quiere.”" }, k: { en: "A feeling, not a fact. Who's glad I'm around?", es: "Un sentimiento, no un hecho. ¿Quién se alegra de tenerme cerca?" } },
      { h: { en: "“It's all my fault.”", es: "“Todo es mi culpa.”" }, k: { en: "Some is mine, some isn't. What's actually mine to own?", es: "Una parte es mía, otra no. ¿Qué es realmente mío para reconocer?" } },
      { h: { en: "“I'm too much.”", es: "“Soy demasiado.”" }, k: { en: "Big feelings are information, not a flaw. What's this one saying?", es: "Las emociones grandes son información, no un defecto. ¿Qué dice esta?" } }
    ],
    "912": [
      { h: { en: "“I'm worthless.”", es: "“No valgo nada.”" }, k: { en: "My worth isn't decided by a bad day. One thing I value in me is ___.", es: "Mi valor no lo decide un mal día. Algo que valoro en mí es ___." } },
      { h: { en: "“I ruin every relationship.”", es: "“Arruino todas mis relaciones.”" }, k: { en: "One pattern isn't a sentence. What could I try differently?", es: "Un patrón no es una condena. ¿Qué podría intentar distinto?" } },
      { h: { en: "“Everyone's judging me.”", es: "“Todos me están juzgando.”" }, k: { en: "Most people are in their own heads. Whose opinion matters here?", es: "Casi todos están en lo suyo. ¿La opinión de quién importa aquí?" } },
      { h: { en: "“I'm so far behind everyone.”", es: "“Estoy muy atrás de todos.”" }, k: { en: "Comparison is a trap. My timeline is mine.", es: "Compararse es una trampa. Mi ritmo es mío." } },
      { h: { en: "“It's pointless to even try.”", es: "“No tiene caso ni intentarlo.”" }, k: { en: "The critic loves 'pointless.' One small effort still counts.", es: "Al crítico le encanta 'sin caso'. Un pequeño esfuerzo igual cuenta." } },
      { h: { en: "“I should have this figured out.”", es: "“Ya debería tener esto resuelto.”" }, k: { en: "Growth isn't a schedule. I'm allowed to still be learning.", es: "Crecer no tiene horario. Tengo permiso de seguir aprendiendo." } }
    ],
    adult: [
      { h: { en: "“I'm failing at all of this.”", es: "“Estoy fallando en todo esto.”" }, k: { en: "All of it? Name one thing I handled today. The critic exaggerates.", es: "¿En todo? Nombra una cosa que manejé hoy. El crítico exagera." } },
      { h: { en: "“I'm not good enough.”", es: "“No soy suficiente.”" }, k: { en: "By whose standard? I'm allowed to be a work in progress.", es: "¿Según quién? Tengo permiso de ser un trabajo en proceso." } },
      { h: { en: "“I should be handling this better.”", es: "“Debería manejar esto mejor.”" }, k: { en: "I'm carrying a lot. What would I tell a friend in my shoes?", es: "Cargo con mucho. ¿Qué le diría a un amigo en mi lugar?" } },
      { h: { en: "“I'm letting everyone down.”", es: "“Estoy decepcionando a todos.”" }, k: { en: "Some I can address, some isn't mine. What's actually mine to own?", es: "Algo puedo atender, otra parte no es mía. ¿Qué es realmente mío?" } },
      { h: { en: "“I have nothing left to give.”", es: "“No me queda nada que dar.”" }, k: { en: "That's depletion, not failure. One small way to refill is ___.", es: "Eso es agotamiento, no fracaso. Una forma pequeña de recargar es ___." } },
      { h: { en: "“I'm a burden.”", es: "“Soy una carga.”" }, k: { en: "Needing support is human, not a burden. Who's safe to lean on?", es: "Necesitar apoyo es humano, no una carga. ¿En quién puedo apoyarme con confianza?" } }
    ]
  };
  function hkRender() {
    var pool = HK_PAIRS[HK_STATE.aud] || HK_PAIRS["35"]; if (!pool.length) return;
    var idx;
    if (pool.length === 1) idx = 0;
    else { do { idx = Math.floor(Math.random() * pool.length); } while (idx === HK_STATE.last); }
    HK_STATE.last = idx;
    var p = pool[idx];
    var hEl = document.getElementById("hkHarsh"); if (hEl) hEl.textContent = L(p.h.en, p.h.es);
    var kEl = document.getElementById("hkKind"); if (kEl) kEl.textContent = L(p.k.en, p.k.es);
    var qr = document.querySelector("#harshKindCard .aog-bridge-qr"); if (qr) { qr.style.display = "none"; qr.innerHTML = ""; }
  }
  /* Reserve the tallest height each line needs across the whole pool, so the card
     and the mirror icon above it never jump when you tap "Another". */
  function hkStabilize() {
    var pool = HK_PAIRS[HK_STATE.aud] || HK_PAIRS["35"];
    function maxH(el, texts) {
      if (!el) return 0;
      var w = el.clientWidth || el.offsetWidth; if (!w) return 0;
      var cs = window.getComputedStyle(el);
      var probe = document.createElement("p");
      probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;margin:0;padding:0;box-sizing:border-box;width:" + w + "px;";
      probe.style.fontFamily = cs.fontFamily; probe.style.fontSize = cs.fontSize;
      probe.style.fontWeight = cs.fontWeight; probe.style.lineHeight = cs.lineHeight; probe.style.fontStyle = cs.fontStyle;
      document.body.appendChild(probe);
      var m = 0;
      for (var i = 0; i < texts.length; i++) { probe.textContent = texts[i] || ""; if (probe.offsetHeight > m) m = probe.offsetHeight; }
      if (probe.parentNode) probe.parentNode.removeChild(probe);
      return m;
    }
    var hEl = document.getElementById("hkHarsh"), kEl = document.getElementById("hkKind");
    var hMax = maxH(hEl, pool.map(function (p) { return L(p.h.en, p.h.es); }));
    var kMax = maxH(kEl, pool.map(function (p) { return L(p.k.en, p.k.es); }));
    if (hEl && hMax) hEl.style.minHeight = hMax + "px";
    if (kEl && kMax) kEl.style.minHeight = kMax + "px";
  }
  window.aogHkNext = function () { hkRender(); };
  window.aogHkBand = function (b) {
    if (!HK_PAIRS[b]) b = "35";
    HK_STATE.aud = b; HK_STATE.last = -1;
    aogBandSet("hkBand", b);
    hkRender(); hkStabilize();
  };
  function buildHarshKind() {
    var auds = aogBandChips("hkBand", "aogHkBand", HK_STATE.aud);
    var gold = "border:1.5px solid var(--gold);background:var(--gold,#B8893A);color:var(--navy);border-radius:999px;padding:8px 15px;font-family:var(--font-sans);font-size:13px;font-weight:800;cursor:pointer;";
    var ghost = "border:1.5px solid var(--rule,#D9CBA8);background:#fff;color:var(--navy);border-radius:999px;padding:8px 15px;font-family:var(--font-sans);font-size:13px;font-weight:700;cursor:pointer;";
    var card =
      '<div class="aog-bridge" id="harshKindCard" style="margin:0 auto;max-width:560px;border:1.5px solid var(--gold);background:var(--cream,#FBF3DF);border-radius:14px;padding:18px;">' +
      '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8a2b2b;margin-bottom:4px;">' + L("The Critic says", "El crítico dice") + '</div>' +
      '<p id="hkHarsh" style="font-family:var(--font-serif);font-size:18px;line-height:1.4;color:#8a2b2b;margin:0 0 12px;">&nbsp;</p>' +
      '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2E6B3A;margin-bottom:4px;">' + L("The Coach says", "El guía dice") + '</div>' +
      '<p class="aog-bridge-q" id="hkKind" style="font-family:var(--font-serif);font-size:20px;line-height:1.42;color:var(--ink);margin:0 0 14px;">&nbsp;</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button type="button" onclick="aogHkNext()" style="' + gold + '">' + L("Another", "Otra") + '</button>' +
        '<button type="button" onclick="aogBridgeCopy(this)" style="' + ghost + '">' + L("Copy the kind line", "Copiar la frase amable") + '</button>' +
        '<button type="button" onclick="aogBridgePrint(this)" style="' + ghost + '">' + L("Print card", "Imprimir tarjeta") + '</button>' +
        '<button type="button" onclick="aogBridgeQr(this)" style="' + ghost + '">' + L("Take-home QR", "QR para casa") + '</button>' +
      '</div>' +
      '<div class="aog-bridge-qr" style="display:none;margin-top:14px;text-align:center;"></div>' +
      '</div>';
    return '<div class="tool-modal-icon">🪞</div>' +
      '<div class="tool-modal-title">' + L("Harsh → Kind", "Duro → Amable") + '</div>' +
      auds +
      '<div class="tool-modal-sub">' + L("The loud voice in our heads isn't the truth — it's just loud. Here's how to flip it. Great for modeling kind self-talk with a child.", "La voz fuerte en nuestra cabeza no es la verdad — solo es fuerte. Así se le da la vuelta. Ideal para modelar el habla interna amable con un niño/a.") + '</div>' +
      card +
      crumbs("inner critic");
  }
  function initHarshKind() { HK_STATE.last = -1; hkRender(); hkStabilize(); setTimeout(hkStabilize, 40); }

  /* ===== Think It → Say It — some thoughts are for inside; flip a blunt thought
     into kinder out-loud words. A sibling of Harsh → Kind for the Social & Repair side. ===== */
  var TS_STATE = { aud: "35", last: -1 };
  var TS_PAIRS = {
    k2: [
      { t: { en: "“That's wrong.”", es: "“Eso está mal.”" }, s: { en: "“I see it differently — can I show you?”", es: "“Yo lo veo distinto — ¿te muestro?”" } },
      { t: { en: "“You're too slow.”", es: "“Eres muy lento/a.”" }, s: { en: "“I can wait — take your time.”", es: "“Puedo esperar — tómate tu tiempo.”" } },
      { t: { en: "“I hate this game.”", es: "“Odio este juego.”" }, s: { en: "“Can we play something else next?”", es: "“¿Podemos jugar otra cosa después?”" } },
      { t: { en: "“Go away.”", es: "“Vete.”" }, s: { en: "“I need a little space, please.”", es: "“Necesito un poco de espacio, por favor.”" } },
      { t: { en: "“That's mine!”", es: "“¡Eso es mío!”" }, s: { en: "“Can I have a turn when you're done?”", es: "“¿Me toca cuando termines?”" } }
    ],
    "35": [
      { t: { en: "“That's so easy — why don't you get it?”", es: "“Es súper fácil — ¿por qué no entiendes?”" }, s: { en: "“Want to do it together?”", es: "“¿Lo hacemos juntos/as?”" } },
      { t: { en: "“Your drawing looks weird.”", es: "“Tu dibujo se ve raro.”" }, s: { en: "“Mine looks different — yours is yours!”", es: "“El mío se ve distinto — ¡el tuyo es tuyo!”" } },
      { t: { en: "“You always mess up.”", es: "“Siempre te equivocas.”" }, s: { en: "“Everybody misses sometimes — try again!”", es: "“Todos fallan a veces — ¡inténtalo de nuevo!”" } },
      { t: { en: "“You cheated!”", es: "“¡Hiciste trampa!”" }, s: { en: "“Can we check the rules together?”", es: "“¿Revisamos las reglas juntos/as?”" } },
      { t: { en: "“This is boring.”", es: "“Esto es aburrido.”" }, s: { en: "“Can we do something different?”", es: "“¿Podemos hacer algo diferente?”" } }
    ],
    "68": [
      { t: { en: "“That's a stupid idea.”", es: "“Qué idea más tonta.”" }, s: { en: "“I'm not sure about that — can you explain?”", es: "“No estoy seguro/a de eso — ¿me explicas?”" } },
      { t: { en: "“You're wrong.”", es: "“Estás equivocado/a.”" }, s: { en: "“I see it differently. Can I show you why?”", es: "“Yo lo veo distinto. ¿Te muestro por qué?”" } },
      { t: { en: "“Why are you so slow?”", es: "“¿Por qué eres tan lento/a?”" }, s: { en: "“No rush — want a hand?”", es: "“Sin prisa — ¿te ayudo?”" } },
      { t: { en: "“Nobody asked you.”", es: "“Nadie te preguntó.”" }, s: { en: "“I've got a different take.”", es: "“Yo lo veo de otra forma.”" } },
      { t: { en: "“You always do this.”", es: "“Siempre haces lo mismo.”" }, s: { en: "“This is the second time — can we fix it?”", es: "“Es la segunda vez — ¿lo resolvemos?”" } }
    ],
    "912": [
      { t: { en: "“This is pointless.”", es: "“Esto no tiene sentido.”" }, s: { en: "“I'm not seeing the point yet — what's the goal?”", es: "“Todavía no le veo el sentido — ¿cuál es la meta?”" } },
      { t: { en: "“You never listen.”", es: "“Nunca escuchas.”" }, s: { en: "“I don't feel heard right now. Can we slow down?”", es: "“No me siento escuchado/a ahora. ¿Podemos ir más despacio?”" } },
      { t: { en: "“Whatever, I don't care.”", es: "“Da igual, no me importa.”" }, s: { en: "“I'm frustrated and need a minute.”", es: "“Estoy frustrado/a y necesito un minuto.”" } },
      { t: { en: "“That outfit is ugly.”", es: "“Esa ropa es fea.”" }, s: { en: "“Not my style, but you do you.”", es: "“No es mi estilo, pero tú a lo tuyo.”" } },
      { t: { en: "“You ruined it.”", es: "“Lo arruinaste.”" }, s: { en: "“I'm really disappointed about how this went.”", es: "“Estoy muy decepcionado/a de cómo salió esto.”" } }
    ],
    adult: [
      { t: { en: "“That's a dumb question.”", es: "“Qué pregunta más tonta.”" }, s: { en: "“Good question — I wasn't sure either.”", es: "“Buena pregunta — yo tampoco estaba seguro/a.”" } },
      { t: { en: "“You're being annoying.”", es: "“Estás siendo molesto/a.”" }, s: { en: "“I need some quiet for a bit.”", es: "“Necesito un poco de silencio un rato.”" } },
      { t: { en: "“That's not my problem.”", es: "“Ese no es mi problema.”" }, s: { en: "“I'm tapped out right now, but I hear you.”", es: "“Estoy agotado/a ahora, pero te escucho.”" } },
      { t: { en: "“Just stop talking.”", es: "“Deja de hablar.”" }, s: { en: "“I need a pause before we keep going.”", es: "“Necesito una pausa antes de seguir.”" } },
      { t: { en: "“Why are you even here?”", es: "“¿Y tú qué haces aquí?”" }, s: { en: "“I was hoping to handle this solo — can we talk later?”", es: "“Esperaba resolverlo solo/a — ¿hablamos después?”" } }
    ]
  };
  function tsRender() {
    var pool = TS_PAIRS[TS_STATE.aud] || TS_PAIRS["35"]; if (!pool.length) return;
    var idx;
    if (pool.length === 1) idx = 0;
    else { do { idx = Math.floor(Math.random() * pool.length); } while (idx === TS_STATE.last); }
    TS_STATE.last = idx;
    var p = pool[idx];
    var tEl = document.getElementById("tsThink"); if (tEl) tEl.textContent = L(p.t.en, p.t.es);
    var sEl = document.getElementById("tsSay"); if (sEl) sEl.textContent = L(p.s.en, p.s.es);
    var qr = document.querySelector("#thinkSayCard .aog-bridge-qr"); if (qr) { qr.style.display = "none"; qr.innerHTML = ""; }
  }
  function tsStabilize() {
    var pool = TS_PAIRS[TS_STATE.aud] || TS_PAIRS["35"];
    function maxH(el, texts) {
      if (!el) return 0;
      var w = el.clientWidth || el.offsetWidth; if (!w) return 0;
      var cs = window.getComputedStyle(el);
      var probe = document.createElement("p");
      probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;margin:0;padding:0;box-sizing:border-box;width:" + w + "px;";
      probe.style.fontFamily = cs.fontFamily; probe.style.fontSize = cs.fontSize;
      probe.style.fontWeight = cs.fontWeight; probe.style.lineHeight = cs.lineHeight; probe.style.fontStyle = cs.fontStyle;
      document.body.appendChild(probe);
      var m = 0;
      for (var i = 0; i < texts.length; i++) { probe.textContent = texts[i] || ""; if (probe.offsetHeight > m) m = probe.offsetHeight; }
      if (probe.parentNode) probe.parentNode.removeChild(probe);
      return m;
    }
    var tEl = document.getElementById("tsThink"), sEl = document.getElementById("tsSay");
    var tMax = maxH(tEl, pool.map(function (p) { return L(p.t.en, p.t.es); }));
    var sMax = maxH(sEl, pool.map(function (p) { return L(p.s.en, p.s.es); }));
    if (tEl && tMax) tEl.style.minHeight = tMax + "px";
    if (sEl && sMax) sEl.style.minHeight = sMax + "px";
  }
  window.aogTsNext = function () { tsRender(); };
  window.aogTsBand = function (b) {
    if (!TS_PAIRS[b]) b = "35";
    TS_STATE.aud = b; TS_STATE.last = -1;
    aogBandSet("tsBand", b);
    tsRender(); tsStabilize();
  };
  function buildThinkSay() {
    var auds = aogBandChips("tsBand", "aogTsBand", TS_STATE.aud);
    var gold = "border:1.5px solid var(--gold);background:var(--gold,#B8893A);color:var(--navy);border-radius:999px;padding:8px 15px;font-family:var(--font-sans);font-size:13px;font-weight:800;cursor:pointer;";
    var ghost = "border:1.5px solid var(--rule,#D9CBA8);background:#fff;color:var(--navy);border-radius:999px;padding:8px 15px;font-family:var(--font-sans);font-size:13px;font-weight:700;cursor:pointer;";
    var card =
      '<div class="aog-bridge" id="thinkSayCard" style="margin:0 auto;max-width:560px;border:1.5px solid var(--gold);background:var(--cream,#FBF3DF);border-radius:14px;padding:18px;">' +
      '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#5a6472;margin-bottom:4px;">' + L("I'm thinking…", "Estoy pensando…") + '</div>' +
      '<p id="tsThink" style="font-family:var(--font-serif);font-size:18px;line-height:1.4;color:#5a6472;margin:0 0 12px;">&nbsp;</p>' +
      '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2E6B3A;margin-bottom:4px;">' + L("I could say…", "Podría decir…") + '</div>' +
      '<p class="aog-bridge-q" id="tsSay" style="font-family:var(--font-serif);font-size:20px;line-height:1.42;color:var(--ink);margin:0 0 14px;">&nbsp;</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button type="button" onclick="aogTsNext()" style="' + gold + '">' + L("Another", "Otra") + '</button>' +
        '<button type="button" onclick="aogBridgeCopy(this)" style="' + ghost + '">' + L("Copy the kind line", "Copiar la frase amable") + '</button>' +
        '<button type="button" onclick="aogBridgePrint(this)" style="' + ghost + '">' + L("Print card", "Imprimir tarjeta") + '</button>' +
        '<button type="button" onclick="aogBridgeQr(this)" style="' + ghost + '">' + L("Take-home QR", "QR para casa") + '</button>' +
      '</div>' +
      '<div class="aog-bridge-qr" style="display:none;margin-top:14px;text-align:center;"></div>' +
      '<div style="margin-top:14px;padding-top:12px;border-top:1px dashed var(--rule,#D9CBA8);font-size:13px;line-height:1.5;color:var(--ink-soft);">' +
        '<strong>' + L("Already slipped out?", "¿Ya se te escapó?") + '</strong> ' +
        L("Repair it: “That came out sharper than I meant — what I meant was ___.”", "Repáralo: “Eso sonó más duro de lo que quería — lo que quise decir fue ___.”") +
      '</div>' +
      '</div>';
    return '<div class="tool-modal-icon">💬</div>' +
      '<div class="tool-modal-title">' + L("Think It → Say It", "Pensarlo → Decirlo") + '</div>' +
      auds +
      '<div class="tool-modal-sub">' + L("Some thoughts are just for inside. This flips a blunt thought into words that land kinder — and shows a quick way to fix it if it already slipped out.", "Algunos pensamientos son solo para adentro. Esto convierte un pensamiento brusco en palabras más amables — y muestra cómo repararlo si ya se te escapó.") + '</div>' +
      card +
      crumbs("inner critic");
  }
  function initThinkSay() { TS_STATE.last = -1; tsRender(); tsStabilize(); setTimeout(tsStabilize, 40); }

  /* ===== "When a Student…" — teacher scenario cards, embedded. Each card names the
     framework lens, a script, a repair line, and links straight to the right tool. ===== */
  var SCEN_CARDS = [
    { title:{en:"Shuts down, then blames you", es:"Se bloquea y luego te culpa"},
      looks:{en:"Work gets hard → they go silent or say “you didn’t even explain it.”", es:"El trabajo se pone difícil → se queda en silencio o dice “ni siquiera me lo explicaste”."},
      happening:{en:"Shame, dressed as blame. “I don’t get this” becomes “I’m dumb,” so they push it onto you. The shutdown is a freeze response — they’re out of their thinking window.", es:"Vergüenza disfrazada de culpa. “No entiendo esto” se vuelve “soy tonto”, así que te lo echa a ti. El bloqueo es una respuesta de congelamiento — está fuera de su ventana de pensamiento."},
      tryit:{en:"Regulate before you reason. Lower your voice, get alongside them (not across from them), then shrink the task to one step.", es:"Regula antes de razonar. Baja la voz, ponte a su lado (no enfrente), y reduce la tarea a un solo paso."},
      say:{en:"“This part’s tricky. Let’s just do the first step together.”", es:"“Esta parte es complicada. Hagamos solo el primer paso juntos.”"},
      repair:{en:"“You’re not in trouble — your brain hit overwhelm. What’s the one part you’re stuck on?”", es:"“No estás en problemas — tu cerebro se saturó. ¿Cuál es la única parte donde te atascas?”"},
      reach:[{l:{en:"Harsh → Kind",es:"Duro → Amable"},k:"harshkind"},{l:{en:"Quiet Space",es:"Espacio Tranquilo"},k:"__quietspace__"}] },
    { title:{en:"Thoughts come out as “mean”", es:"Sus pensamientos salen como “groseros”"},
      looks:{en:"Blunt, sharp comments that land as rude — but aren’t aimed to wound.", es:"Comentarios bruscos y cortantes que suenan groseros — pero no buscan herir."},
      happening:{en:"Impact vs. intent. Their inner monitor isn’t catching thoughts before they leave their mouth. It’s a filter/impulse gap, not malice.", es:"Impacto vs. intención. Su filtro interno no atrapa los pensamientos antes de que salgan. Es un tema de filtro/impulso, no de maldad."},
      tryit:{en:"Assume good intent out loud. Teach that some thoughts are “inside thoughts,” and give them a fast repair line they can reuse.", es:"Asume buena intención en voz alta. Enséñale que algunos pensamientos son “para adentro”, y dale una frase de reparación rápida que pueda reutilizar."},
      say:{en:"“I don’t think you meant that the way it landed. Want to try it again?”", es:"“No creo que lo hayas dicho como sonó. ¿Quieres intentarlo de nuevo?”"},
      repair:{en:"“That came out sharper than I meant — what I meant was ___.”", es:"“Eso sonó más duro de lo que quería — lo que quise decir fue ___.”"},
      reach:[{l:{en:"Think It → Say It",es:"Pensarlo → Decirlo"},k:"thinksay"}] },
    { title:{en:"“I’m so stupid” — harsh self-talk", es:"“Soy un tonto” — autocrítica dura"},
      looks:{en:"Hits a mistake → turns it on themselves, hard and fast.", es:"Comete un error → se ataca a sí mismo/a, fuerte y rápido."},
      happening:{en:"Identity collapse: a behavior (“I missed it”) becomes an identity (“I’m stupid”). The inner critic is loud, not true.", es:"Colapso de identidad: una conducta (“me equivoqué”) se vuelve identidad (“soy tonto”). El crítico interior es fuerte, no verdadero."},
      tryit:{en:"Separate the deed from the self. Name it as the critic, then model the coach voice out loud.", es:"Separa el acto de la persona. Nómbralo como el crítico y modela en voz alta la voz del guía."},
      say:{en:"“A hard moment isn’t who you are. Let’s hear the coach voice.”", es:"“Un momento difícil no es quien eres. Escuchemos la voz del guía.”"},
      repair:{en:"Let them fill it in: “I made a mistake — that’s human. What can I learn?”", es:"Deja que lo complete: “Me equivoqué — eso es humano. ¿Qué puedo aprender?”"},
      reach:[{l:{en:"Harsh → Kind",es:"Duro → Amable"},k:"harshkind"}] },
    { title:{en:"About to blow — big feelings", es:"A punto de estallar — emociones grandes"},
      looks:{en:"Voice rising, body tight, right on the edge of a meltdown.", es:"Sube la voz, cuerpo tenso, al borde de un colapso."},
      happening:{en:"Dysregulation — out of the window of tolerance. No lesson lands here; the body has to settle first.", es:"Desregulación — fuera de la ventana de tolerancia. Aquí no entra ninguna lección; primero el cuerpo debe calmarse."},
      tryit:{en:"Be the calm they borrow. Lower your voice, slow your own body, and breathe together before any words.", es:"Sé la calma que toma prestada. Baja la voz, calma tu cuerpo y respiren juntos antes de cualquier palabra."},
      say:{en:"“I’m right here. Let’s breathe first — words after.”", es:"“Aquí estoy. Primero respiremos — las palabras después.”"},
      repair:{en:"Once settled: “That was a big wave. What helped it pass?”", es:"Ya calmados: “Fue una ola grande. ¿Qué ayudó a que pasara?”"},
      reach:[{l:{en:"Co-Regulation",es:"Co-regulación"},k:"coreg"},{l:{en:"Breathing",es:"Respiración"},k:"breathing"}] },
    { title:{en:"Withdrawn — “I’m fine” (but isn’t)", es:"Retraído — “Estoy bien” (pero no)"},
      looks:{en:"Flat, quiet, an “I’m fine” that clearly isn’t.", es:"Apagado, callado, un “estoy bien” que claramente no lo es."},
      happening:{en:"Masking. Naming feelings is hard, and pressure makes it harder. Silence is information, not defiance.", es:"Enmascaramiento. Nombrar emociones es difícil, y la presión lo empeora. El silencio es información, no desafío."},
      tryit:{en:"Low pressure. Offer options, not an interrogation — and a way to point instead of explain.", es:"Poca presión. Ofrece opciones, no un interrogatorio — y una forma de señalar en vez de explicar."},
      say:{en:"“You don’t have to talk. Want to point to how you feel?”", es:"“No tienes que hablar. ¿Quieres señalar cómo te sientes?”"},
      repair:{en:"“I’m glad you showed me. We can just sit a minute.”", es:"“Me alegra que me lo mostraras. Podemos solo sentarnos un minuto.”"},
      reach:[{l:{en:"Beyond “Fine”",es:"Más allá de “bien”"},k:"beyondfine"},{l:{en:"Feelings Wheel",es:"Rueda de emociones"},k:"feelwheel"},{l:{en:"Emotion Wheel",es:"Rueda de emociones"},k:"emotion"}] },
    { title:{en:"Hurt someone, won’t take responsibility", es:"Lastimó a alguien y no asume la responsabilidad"},
      looks:{en:"Did something, denies or deflects, won’t say sorry.", es:"Hizo algo, niega o desvía, no quiere disculparse."},
      happening:{en:"Shame blocks repair. If “I did a bad thing” means “I am bad,” owning it feels unsurvivable. Forgiveness makes room to grow.", es:"La vergüenza bloquea la reparación. Si “hice algo malo” significa “soy malo”, admitirlo se siente insoportable. El perdón abre espacio para crecer."},
      tryit:{en:"Protect the identity so the behavior can be owned. Keep the repair small and concrete.", es:"Protege la identidad para que pueda asumir la conducta. Mantén la reparación pequeña y concreta."},
      say:{en:"“You’re a good kid who did a hard thing. What’s one way to make it right?”", es:"“Eres alguien bueno que hizo algo difícil. ¿Cuál es una forma de repararlo?”"},
      repair:{en:"Name the impact, agree on one repair action — then let it be done.", es:"Nombra el impacto, acuerden una acción de reparación — y deja que quede resuelto."},
      reach:[{l:{en:"Make It Right",es:"Repararlo"},k:"makeitright"}] },
    { title:{en:"Digs in — “my way or shutdown”", es:"Se planta — “a mi manera o nada”"},
      looks:{en:"Gets redirected → shuts down and won’t do the assigned work (calm, not defiant). Fine again the moment the demand lifts.", es:"Lo rediriges → se bloquea y no hace el trabajo asignado (tranquilo, no desafiante). Vuelve a estar bien en cuanto se quita la demanda."},
      happening:{en:"Often a skill gap, not a “won’t.” Starting can be a real barrier (weak task-initiation), and a demand — even a kind redirect — can land as lost control or sensory overload, tipping them into shutdown. For some it’s trauma: control means safety. Reward charts stall because the reward is one more demand they still can’t initiate.", es:"A menudo es una falta de habilidad, no un “no quiero”. Empezar puede ser una barrera real (iniciación débil), y una demanda — incluso una redirección amable — puede sentirse como perder el control o sobrecarga sensorial, y los lleva al bloqueo. Para algunos es trauma: el control es seguridad. Los premios fallan porque el premio es una demanda más que aún no pueden iniciar."},
      tryit:{en:"Scaffold the start — don’t just reward the finish. Do the first step together, chunk it to one visible step, offer real choice in how and order, use declarative language, and regulate the body first.", es:"Anda el inicio — no solo premies el final. Hagan juntos el primer paso, divídelo en un paso visible, ofrece opciones reales de cómo y en qué orden, usa lenguaje declarativo y regula el cuerpo primero."},
      say:{en:"“Hmm, this one looks tricky — I’m not even sure where I’d start. Want to pick which two we try?”", es:"“Mmm, esta se ve complicada — ni yo sé por dónde empezar. ¿Quieres elegir cuáles dos intentamos?”"},
      repair:{en:"Treat the “no” as communication, not defiance. Teach a break/help card they can hand you instead of shutting down. Plan together at the start, and let them signal when they’re ready.", es:"Toma el “no” como comunicación, no como desafío. Enséñale una tarjeta de descanso/ayuda que pueda darte en vez de bloquearse. Planeen juntos al inicio y deja que avise cuando esté listo/a."},
      reach:[{l:{en:"Quiet Space",es:"Espacio Tranquilo"},k:"__quietspace__"},{l:{en:"Beyond “Fine”",es:"Más allá de “bien”"},k:"beyondfine"}] }
  ];
  function scenReach(items) {
    return items.map(function (it) {
      var on = it.k === "__quietspace__"
        ? "if(window.toolClose)toolClose(); if(window.showStationMode){showStationMode();}"
        : "if(window.toolOpen)toolOpen('" + it.k + "')";
      return '<button type="button" onclick="' + on + '" style="border:1.5px solid var(--gold);background:var(--gold,#B8893A);color:var(--navy);border-radius:999px;padding:6px 13px;font-family:var(--font-sans);font-size:12.5px;font-weight:800;cursor:pointer;margin:0 6px 6px 0;">' + L(it.l.en, it.l.es) + '</button>';
    }).join("");
  }
  function scenCard(cd, i) {
    function row(label, text, lcolor, tstyle) {
      return '<div style="margin-top:9px;"><div style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:' + lcolor + ';margin-bottom:3px;">' + label + '</div><div style="' + tstyle + '">' + text + '</div></div>';
    }
    var bodyT = "font-size:13.5px;line-height:1.5;color:var(--ink);";
    var sayT = "font-family:var(--font-serif);font-style:italic;font-size:14.5px;line-height:1.45;color:var(--navy);";
    var repT = "font-style:italic;font-size:13.5px;line-height:1.5;color:var(--ink);";
    return '<div style="border:1.5px solid var(--rule,#E3D9BE);border-radius:14px;overflow:hidden;margin:0 0 16px;background:#fff;">' +
      '<div style="background:var(--navy,#0A1E33);color:#fff;padding:10px 16px;display:flex;align-items:center;gap:10px;">' +
        '<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--gold);color:var(--navy);font-weight:800;font-size:12px;flex:0 0 auto;">' + (i + 1) + '</span>' +
        '<span style="font-family:var(--font-serif);font-weight:800;font-size:16px;">' + L(cd.title.en, cd.title.es) + '</span>' +
      '</div>' +
      '<div style="padding:14px 16px;">' +
        '<div style="font-style:italic;color:var(--ink-soft);font-size:13.5px;line-height:1.45;margin-bottom:2px;">' + L(cd.looks.en, cd.looks.es) + '</div>' +
        row(L("What’s likely happening", "Qué está pasando"), L(cd.happening.en, cd.happening.es), "#7a5a12", bodyT) +
        row(L("Try this", "Prueba esto"), L(cd.tryit.en, cd.tryit.es), "#7a5a12", bodyT) +
        row(L("Say", "Di"), L(cd.say.en, cd.say.es), "#0A1E33", sayT) +
        row(L("Repair / next step", "Reparación / siguiente paso"), L(cd.repair.en, cd.repair.es), "#2E6B3A", repT) +
        '<div style="margin-top:12px;padding-top:11px;border-top:1px dashed var(--rule,#E3D9BE);">' +
          '<div style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#7a5a12;margin-bottom:7px;">' + L("Reach for", "Usa") + '</div>' +
          scenReach(cd.reach) +
        '</div>' +
      '</div>' +
    '</div>';
  }
  var SCEN_SHORT = [
    { en:"Shuts down & blames", es:"Se bloquea y culpa" },
    { en:"Sounds “mean”",       es:"Suena “grosero”" },
    { en:"Harsh self-talk",     es:"Autocrítica dura" },
    { en:"About to blow",       es:"A punto de estallar" },
    { en:"Withdrawn",           es:"Retraído" },
    { en:"Won’t own it",        es:"No lo asume" },
    { en:"Refuses the work",    es:"Se niega a trabajar" }
  ];
  window.aogScnShow = function (i) {
    var d = document.getElementById("scnDetail"); if (!d) return;
    d.innerHTML = scenCard(SCEN_CARDS[i], i);
    var chips = document.querySelectorAll("#scnPicker .scn-chip");
    for (var j = 0; j < chips.length; j++) {
      var on = parseInt(chips[j].getAttribute("data-i"), 10) === i;
      chips[j].style.background = on ? "var(--gold,#B8893A)" : "#fff";
      chips[j].style.fontWeight = on ? "800" : "600";
      chips[j].setAttribute("aria-pressed", on ? "true" : "false");
    }
  };
  function scnPicker() {
    return '<div id="scnPicker" style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin:0 auto 14px;max-width:560px;">' +
      SCEN_CARDS.map(function (cd, i) {
        return '<button type="button" class="scn-chip" data-i="' + i + '" aria-pressed="false" onclick="aogScnShow(' + i + ')" style="border:1.5px solid var(--gold,#B8893A);background:#fff;color:var(--navy);border-radius:999px;padding:7px 13px;font-family:var(--font-sans);font-size:12.5px;font-weight:600;cursor:pointer;">' + L(SCEN_SHORT[i].en, SCEN_SHORT[i].es) + '</button>';
      }).join("") +
    '</div>';
  }
  function buildScenarios() {
    return '<div class="tool-modal-icon">🗂️</div>' +
      '<div class="tool-modal-title">' + L("When a Student…", "Cuando un estudiante…") + '</div>' +
      '<div class="tool-modal-sub">' + L("Pick a situation — what’s likely happening, what to say, and the tool to reach for. A flag, not a diagnosis.", "Elige una situación — qué está pasando, qué decir y la herramienta que puedes usar. Una señal, no un diagnóstico.") + '</div>' +
      scnPicker() +
      '<div id="scnDetail" style="max-width:600px;margin:0 auto;text-align:left;"></div>';
  }
  function initScenarios() { window.aogScnShow(0); }

  /* ===== "Find the Function" — the FBA → BIP logic, generalized for any teacher.
     Behavior is communication: name what it's getting or avoiding, then match the
     antecedent support, a replacement behavior, and the right tool. No PII, no labels. ===== */
  var FN_CARDS = [
    { title:{en:"Escape / avoid", es:"Escapar / evitar"},
      looks:{en:"Refuses, stalls, shuts down, leaves, or “acts up” right when a task, demand, or setting ramps up.", es:"Se niega, demora, se bloquea, se va o “se porta mal” justo cuando sube una tarea, demanda o entorno."},
      getting:{en:"Avoiding something — a hard/boring task, a transition, a sensory load, or social pressure. It works because it makes the demand go away.", es:"Evita algo — una tarea difícil/aburrida, una transición, carga sensorial o presión social. Funciona porque hace que la demanda desaparezca."},
      antecedent:{en:"Lower and scaffold the demand before it triggers escape: chunk it, do the first step together, give choice, pre-warn transitions, and regulate the body first.", es:"Baja y anda la demanda antes de que dispare el escape: divídela, hagan juntos el primer paso, da opciones, avisa las transiciones y regula el cuerpo primero."},
      replacement:{en:"Teach a break card or help card they can hand you — a legitimate way to get a pause without melting down.", es:"Enseña una tarjeta de descanso o de ayuda que puedan darte — una forma legítima de pausar sin colapsar."},
      reach:[{l:{en:"Quiet Space",es:"Espacio Tranquilo"},k:"__quietspace__"},{l:{en:"Beyond “Fine”",es:"Más allá de “bien”"},k:"beyondfine"}] },
    { title:{en:"Control / autonomy", es:"Control / autonomía"},
      looks:{en:"“My way or nothing.” Digs in, negotiates everything, refuses unless it’s on their terms.", es:"“A mi manera o nada”. Se planta, negocia todo, se niega salvo que sea a su manera."},
      getting:{en:"A sense of control. Being told what to do feels like losing self — common with trauma or autism, where predictability and control mean safety.", es:"Una sensación de control. Que le digan qué hacer se siente como perderse — común con trauma o autismo, donde la previsibilidad y el control son seguridad."},
      antecedent:{en:"Hand back real control: choice in how, what order, and format; plan together at the start; declarative language instead of directives.", es:"Devuelve control real: opciones de cómo, en qué orden y formato; planeen juntos al inicio; lenguaje declarativo en vez de órdenes."},
      replacement:{en:"Teach choosing within limits — a choice board, or “pick two of these four” — so control is built in, not fought for.", es:"Enseña a elegir dentro de límites — un tablero de opciones, o “elige dos de estas cuatro” — para que el control venga incluido, no se pelee."},
      reach:[{l:{en:"Beyond “Fine”",es:"Más allá de “bien”"},k:"beyondfine"},{l:{en:"Quiet Space",es:"Espacio Tranquilo"},k:"__quietspace__"}] },
    { title:{en:"Sensory", es:"Sensorial"},
      looks:{en:"Chewing, fidgeting, humming, rocking, covering ears, seeking movement — or melting down in loud/bright/busy spaces.", es:"Mastica, se mueve, tararea, se mece, se tapa los oídos, busca movimiento — o colapsa en lugares ruidosos/brillantes/llenos."},
      getting:{en:"Regulating sensory input — seeking what the body needs (movement, pressure, mouth input) or escaping too much of it.", es:"Regular la entrada sensorial — busca lo que el cuerpo necesita (movimiento, presión, input oral) o escapa del exceso."},
      antecedent:{en:"Build sensory regulation in: movement/heavy-work breaks, a sensory tool kit, adaptive seating, and lower the input (noise, visual clutter).", es:"Incluye regulación sensorial: descansos de movimiento/trabajo pesado, kit sensorial, asiento adaptado, y baja el input (ruido, desorden visual)."},
      replacement:{en:"Offer an appropriate outlet for the same input — a chewable, a fidget, a wobble seat — so the need is met without disrupting.", es:"Ofrece una salida apropiada para el mismo input — un mordedor, un fidget, un asiento móvil — para satisfacer la necesidad sin interrumpir."},
      reach:[{l:{en:"Quiet Space",es:"Espacio Tranquilo"},k:"__quietspace__"},{l:{en:"Breathing",es:"Respiración"},k:"breathing"}] },
    { title:{en:"Connection / attention", es:"Conexión / atención"},
      looks:{en:"Behavior reliably pulls adult or peer attention — calling out, clowning, arguing, or needing you right now.", es:"La conducta atrae atención de adultos o compañeros — gritar, payasear, discutir, o necesitarte ya."},
      getting:{en:"Connection or attention. Even a correction is contact. It works because it gets a person to engage.", es:"Conexión o atención. Hasta una corrección es contacto. Funciona porque logra que alguien se involucre."},
      antecedent:{en:"Front-load positive attention before the behavior: greet, check in, give a role or job, and connect before you correct.", es:"Adelanta atención positiva antes de la conducta: salúdalo, conecta, dale un rol o trabajo, y conecta antes de corregir."},
      replacement:{en:"Teach how to ask for attention or help appropriately — a signal, a phrase, a check-in routine — and reward that.", es:"Enseña a pedir atención o ayuda de forma apropiada — una señal, una frase, una rutina de check-in — y reconócelo."},
      reach:[{l:{en:"Circle Time",es:"Círculo"},k:"classreset"},{l:{en:"Beyond “Fine”",es:"Más allá de “bien”"},k:"beyondfine"},{l:{en:"Co-Regulation",es:"Co-regulación"},k:"coreg"}] },
    { title:{en:"Not-yet-skill (skill deficit)", es:"Aún no es habilidad (déficit)"},
      looks:{en:"Looks like “won’t,” but it’s “can’t (yet)” — can’t start, can’t calm, can’t find the words, can’t read the room.", es:"Parece “no quiere”, pero es “aún no puede” — no puede empezar, calmarse, encontrar las palabras o leer el ambiente."},
      getting:{en:"Nothing — there’s no payoff. The expected skill (initiation, regulation, language, social) just isn’t reliable yet. This is the FBA’s “skill deficit.”", es:"Nada — no hay recompensa. La habilidad esperada (iniciación, regulación, lenguaje, social) aún no es confiable. Es el “déficit de habilidad” del FBA."},
      antecedent:{en:"Stop incentivizing and start teaching: prime, model, scaffold the first step, and provide the skill until it’s learned.", es:"Deja de incentivar y empieza a enseñar: prepara, modela, anda el primer paso y provee la habilidad hasta que se aprenda."},
      replacement:{en:"Directly teach the missing skill, prompted, then fade support — not a reward for a skill they don’t have yet.", es:"Enseña directamente la habilidad que falta, con apoyo, y retíralo poco a poco — no un premio por una habilidad que aún no tienen."},
      reach:[{l:{en:"Inner Coach",es:"Guía Interior"},k:"innercoach"},{l:{en:"Make It Right",es:"Reparar"},k:"makeitright"},{l:{en:"Think → Say",es:"Pensar → Decir"},k:"thinksay"}] }
  ];
  var FN_SHORT = [
    { en:"Escape / avoid", es:"Escapar" },
    { en:"Control", es:"Control" },
    { en:"Sensory", es:"Sensorial" },
    { en:"Connection", es:"Conexión" },
    { en:"Not-yet-skill", es:"Falta de habilidad" }
  ];
  function fnCard(cd) {
    function row(label, text, lcolor) {
      return '<div style="margin-top:9px;"><div style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:' + lcolor + ';margin-bottom:3px;">' + label + '</div><div style="font-size:13.5px;line-height:1.5;color:var(--ink);">' + text + '</div></div>';
    }
    return '<div style="border:1.5px solid var(--rule,#E3D9BE);border-radius:14px;overflow:hidden;margin:0 0 16px;background:#fff;">' +
      '<div style="background:var(--navy,#0A1E33);color:#fff;padding:10px 16px;font-family:var(--font-serif);font-weight:800;font-size:16px;">' + L(cd.title.en, cd.title.es) + '</div>' +
      '<div style="padding:14px 16px;">' +
        '<div style="font-style:italic;color:var(--ink-soft);font-size:13.5px;line-height:1.45;margin-bottom:2px;">' + L(cd.looks.en, cd.looks.es) + '</div>' +
        row(L("Usually getting / avoiding", "Suele obtener / evitar"), L(cd.getting.en, cd.getting.es), "#7a5a12") +
        row(L("Antecedent move", "Estrategia antecedente"), L(cd.antecedent.en, cd.antecedent.es), "#7a5a12") +
        row(L("Replacement to teach", "Conducta de reemplazo"), L(cd.replacement.en, cd.replacement.es), "#2E6B3A") +
        '<div style="margin-top:12px;padding-top:11px;border-top:1px dashed var(--rule,#E3D9BE);"><div style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#7a5a12;margin-bottom:7px;">' + L("Reach for", "Usa") + '</div>' + scenReach(cd.reach) + '</div>' +
      '</div>' +
    '</div>';
  }
  window.aogFnShow = function (i) {
    var d = document.getElementById("fnDetail"); if (!d) return;
    d.innerHTML = fnCard(FN_CARDS[i]);
    var chips = document.querySelectorAll("#fnPicker .scn-chip");
    for (var j = 0; j < chips.length; j++) {
      var on = parseInt(chips[j].getAttribute("data-i"), 10) === i;
      chips[j].style.background = on ? "var(--gold,#B8893A)" : "#fff";
      chips[j].style.fontWeight = on ? "800" : "600";
      chips[j].setAttribute("aria-pressed", on ? "true" : "false");
    }
  };
  function fnPicker() {
    return '<div id="fnPicker" style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin:0 auto 14px;max-width:560px;">' +
      FN_CARDS.map(function (cd, i) {
        return '<button type="button" class="scn-chip" data-i="' + i + '" aria-pressed="false" onclick="aogFnShow(' + i + ')" style="border:1.5px solid var(--gold,#B8893A);background:#fff;color:var(--navy);border-radius:999px;padding:7px 13px;font-family:var(--font-sans);font-size:12.5px;font-weight:600;cursor:pointer;">' + L(FN_SHORT[i].en, FN_SHORT[i].es) + '</button>';
      }).join("") +
    '</div>';
  }
  function buildFindFunction() {
    return '<div class="tool-modal-icon">🔎</div>' +
      '<div class="tool-modal-title">' + L("Find the Function", "Encuentra la función") + '</div>' +
      '<div class="tool-modal-sub">' + L("Behavior is communication. Spot what it’s getting or avoiding, then match the support. A flag, not a diagnosis — and never a substitute for your team’s FBA/BIP.", "La conducta es comunicación. Identifica qué obtiene o evita, y empareja el apoyo. Una señal, no un diagnóstico — y nunca un sustituto del FBA/BIP de tu equipo.") + '</div>' +
      fnPicker() +
      '<div id="fnDetail" style="max-width:600px;margin:0 auto;text-align:left;"></div>';
  }
  function initFindFunction() { window.aogFnShow(0); }

  /* Language-aware printable opener: serves the ES PDF when the site is in Spanish. */
  window.aogOpenPrintable = function (ev, which) {
    try {
      var es = (typeof lang !== "undefined" && lang === "es");
      var map = {
        home: ["AoG-Four-Pillars-at-Home.pdf", "AoG-Four-Pillars-at-Home-ES.pdf"],
        cls:  ["AoG-Four-Pillars-in-the-Classroom.pdf", "AoG-Four-Pillars-in-the-Classroom-ES.pdf"]
      };
      var f = map[which]; if (!f) return true;
      window.open(es ? f[1] : f[0], "_blank", "noopener");
      if (ev && ev.preventDefault) ev.preventDefault();
      return false;
    } catch (e) { return true; }
  };

  /* ============================================================
     CONVERSATION STARTERS — standalone, browse-by-age. No check-in
     required. Grouped by the three domains; reworded per band.
     ============================================================ */
  var CS_STATE = { band: "35" };
  function csIcon(k) {
    var p = {
      A: '<path d="M3 12h3l2-6 4 12 2-6h7"/>',
      B: '<path d="M19 13.5c1.5-1.5 3-3.1 3-5.3A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.2c0 2.2 1.5 3.8 3 5.3l7 6.5z"/>',
      C: '<circle cx="9" cy="7" r="3.2"/><path d="M3.5 20v-1.5A4 4 0 0 1 7.5 14.5h3a4 4 0 0 1 4 4V20"/><path d="M16 4.2a3.2 3.2 0 0 1 0 6"/><path d="M17.5 14.7a4 4 0 0 1 3 3.8V20"/>'
    }[k] || "";
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  var CS_DATA = {
    k2: {
      A: [
        { en: "What made your heart feel happy today? What made it feel grumpy?", es: "¿Qué hizo que tu corazón se sintiera feliz hoy? ¿Qué lo hizo sentir gruñón?" },
        { en: "When you get really mad, what helps your body feel calm again?", es: "Cuando te enojas mucho, ¿qué ayuda a que tu cuerpo se calme?" },
        { en: "Where do you feel a big feeling — in your tummy, your hands, or your face?", es: "¿Dónde sientes un sentimiento grande — en la pancita, las manos o la cara?" },
        { en: "What color would your feeling be right now? Why that color?", es: "¿De qué color sería tu sentimiento ahora mismo? ¿Por qué ese color?" },
        { en: "Can you show me a big feeling with your face or your hands?", es: "¿Puedes mostrarme un sentimiento grande con tu cara o tus manos?" },
        { en: "When you feel wiggly or upset, would a hug, a quiet spot, or a big breath help more?", es: "Cuando te sientes inquieto/a o molesto/a, ¿ayudaría más un abrazo, un lugar tranquilo o una respiración grande?" },
        { en: "If your feeling had a size — tiny, middle, or huge — how big is it right now?", es: "Si tu sentimiento tuviera un tamaño — chiquito, mediano o enorme — ¿de qué tamaño es ahora?" },
        { en: "What helps your body feel cozy and safe when you're scared?", es: "¿Qué ayuda a que tu cuerpo se sienta acogido y seguro cuando tienes miedo?" },
        { en: "Can we take three big balloon breaths together right now?", es: "¿Podemos tomar juntos tres respiraciones de globo grandes ahora mismo?" },
        { en: "What is a happy thing that happened today, even a tiny one?", es: "¿Qué cosa feliz pasó hoy, aunque sea chiquita?" },
        { en: "When you feel mad, does stomping, squeezing, or resting help more?", es: "Cuando te sientes enojado/a, ¿ayuda más pisar fuerte, apretar o descansar?" },
        { en: "Where in your body do you feel happy? Where do you feel grumpy?", es: "¿En qué parte del cuerpo sientes la alegría? ¿Dónde sientes el enojo?" }
      ],
      B: [
        { en: "When something is hard, what could you say to yourself to feel brave?", es: "Cuando algo es difícil, ¿qué podrías decirte para sentirte valiente?" },
        { en: "What's something you couldn't do before but you can do now? How did you learn it?", es: "¿Qué es algo que antes no podías hacer y ahora sí? ¿Cómo lo aprendiste?" },
        { en: "If you make a mistake, are you kind to yourself or a little mean? What could you say instead?", es: "Si cometes un error, ¿eres amable contigo o un poco duro/a? ¿Qué podrías decir en cambio?" },
        { en: "What are you really good at? What makes you, you?", es: "¿En qué eres muy bueno/a? ¿Qué te hace ser tú?" },
        { en: "If your toy could talk when you tried something hard, what kind thing would it say?", es: "Si tu juguete pudiera hablar cuando intentas algo difícil, ¿qué cosa amable te diría?" },
        { en: "Everybody makes mistakes — even grown-ups. What did you try hard at today?", es: "Todos cometen errores — hasta los grandes. ¿En qué te esforzaste mucho hoy?" },
        { en: "What is something kind you could say to yourself, like you would say to a friend?", es: "¿Qué cosa amable podrías decirte, como se la dirías a un amigo?" },
        { en: "What do you love about being you?", es: "¿Qué te encanta de ser tú?" },
        { en: "When something is tricky, can you say 'I can't do it YET'?", es: "Cuando algo es difícil, ¿puedes decir 'no puedo hacerlo TODAVÍA'?" },
        { en: "What is something brave you did, even if it felt scary?", es: "¿Qué cosa valiente hiciste, aunque diera un poco de miedo?" },
        { en: "If you spill or drop something, are you gentle with yourself?", es: "Si derramas o se te cae algo, ¿eres amable contigo?" },
        { en: "What is your body really good at — running, hugging, drawing?", es: "¿En qué es muy bueno tu cuerpo — correr, abrazar, dibujar?" }
      ],
      C: [
        { en: "Who did you play with today? What did you do together?", es: "¿Con quién jugaste hoy? ¿Qué hicieron juntos?" },
        { en: "If you and a friend both want the same toy, what could you do?", es: "Si tú y un amigo quieren el mismo juguete, ¿qué podrían hacer?" },
        { en: "If you hurt a friend's feelings, what helps you say sorry?", es: "Si lastimas los sentimientos de un amigo, ¿qué ayuda a pedir perdón?" },
        { en: "What makes someone a good friend? Are you that kind of friend?", es: "¿Qué hace que alguien sea un buen amigo? ¿Eres ese tipo de amigo?" },
        { en: "Who helped you today? Did you help anybody?", es: "¿Quién te ayudó hoy? ¿Ayudaste a alguien?" },
        { en: "If a friend feels sad, what could you do to help them feel better?", es: "Si un amigo está triste, ¿qué podrías hacer para que se sienta mejor?" },
        { en: "How can you tell when a friend is feeling sad?", es: "¿Cómo te das cuenta de que un amigo se siente triste?" },
        { en: "What is a way to share when two people want a turn?", es: "¿Cómo se puede compartir cuando dos personas quieren un turno?" },
        { en: "Who is on your family team, and what do you love to do together?", es: "¿Quién está en el equipo de tu familia, y qué les encanta hacer juntos?" },
        { en: "If you and I had a bumpy moment, how can we make it better?", es: "Si tú y yo tuvimos un momento difícil, ¿cómo lo podemos mejorar?" },
        { en: "What does a kind helper do? Were you a kind helper today?", es: "¿Qué hace un ayudante amable? ¿Fuiste un ayudante amable hoy?" },
        { en: "When someone says sorry, how does your heart feel?", es: "Cuando alguien pide perdón, ¿cómo se siente tu corazón?" }
      ]
    },
    "35": {
      A: [
        { en: "What was the best part and the hardest part of your day?", es: "¿Cuál fue la mejor parte y la parte más difícil de tu día?" },
        { en: "When you're upset, what actually helps you settle down? Does anything help every time?", es: "Cuando estás molesto/a, ¿qué te ayuda de verdad a calmarte? ¿Hay algo que ayude siempre?" },
        { en: "Is there a feeling that's hard to name? What's it like?", es: "¿Hay algún sentimiento difícil de nombrar? ¿Cómo es?" },
        { en: "If today were a weather report, what would it be — sunny, stormy, foggy?", es: "Si hoy fuera un reporte del clima, ¿cuál sería — soleado, tormentoso, con niebla?" },
        { en: "What's something that worried you this week? Is it still worrying you now?", es: "¿Qué te preocupó esta semana? ¿Todavía te preocupa ahora?" },
        { en: "When a feeling gets really big, what's one thing that helps it get smaller?", es: "Cuando un sentimiento se vuelve muy grande, ¿qué ayuda a hacerlo más pequeño?" },
        { en: "If your feelings had a volume knob, where is it turned right now?", es: "Si tus sentimientos tuvieran un control de volumen, ¿en qué punto está ahora?" },
        { en: "What is one thing that always helps you reset after a hard moment?", es: "¿Qué es algo que siempre te ayuda a reiniciar después de un momento difícil?" },
        { en: "Is there a worry that visits you at bedtime? What is it?", es: "¿Hay una preocupación que te visita a la hora de dormir? ¿Cuál es?" },
        { en: "When you're frustrated, do you need a break, a talk, or a little space?", es: "Cuando estás frustrado/a, ¿necesitas un descanso, hablar o un poco de espacio?" },
        { en: "What does calm feel like in your body?", es: "¿Cómo se siente la calma en tu cuerpo?" },
        { en: "What is a feeling you had today that surprised you?", es: "¿Qué sentimiento tuviste hoy que te sorprendió?" }
      ],
      B: [
        { en: "When you mess up, what does the voice in your head say? Is it kind or harsh?", es: "Cuando te equivocas, ¿qué dice la voz en tu cabeza? ¿Es amable o dura?" },
        { en: "What's something you're getting better at? What helped you improve?", es: "¿En qué estás mejorando? ¿Qué te ayudó a mejorar?" },
        { en: "If your best friend made the same mistake you did, what would you tell them?", es: "Si tu mejor amigo cometiera el mismo error que tú, ¿qué le dirías?" },
        { en: "What's something you're proud of that nobody noticed?", es: "¿De qué estás orgulloso/a que nadie notó?" },
        { en: "What's something hard you haven't given up on yet?", es: "¿Qué cosa difícil todavía no has abandonado?" },
        { en: "If 'I can't do it' had a 'yet' on the end, what would change?", es: "Si 'no puedo hacerlo' tuviera un 'todavía' al final, ¿qué cambiaría?" },
        { en: "What would you tell a younger kid who was scared to try something new?", es: "¿Qué le dirías a un niño más pequeño que tuviera miedo de intentar algo nuevo?" },
        { en: "What is something about you that makes you proud to be you?", es: "¿Qué hay en ti que te hace sentir orgulloso/a de ser tú?" },
        { en: "When the voice in your head is harsh, what is a kinder thing it could say?", es: "Cuando la voz en tu cabeza es dura, ¿qué cosa más amable podría decir?" },
        { en: "What is a mistake that ended up teaching you something?", es: "¿Qué error terminó enseñándote algo?" },
        { en: "What is hard for you now that was once hard for someone you admire?", es: "¿Qué es difícil para ti ahora que también lo fue para alguien que admiras?" },
        { en: "If you were a little kinder to yourself this week, how would that look?", es: "Si fueras un poco más amable contigo esta semana, ¿cómo se vería?" }
      ],
      C: [
        { en: "Did anything happen with friends today that felt tricky?", es: "¿Pasó algo con tus amigos hoy que se sintiera complicado?" },
        { en: "When you and someone disagree, how do you work it out?", es: "Cuando tú y alguien no están de acuerdo, ¿cómo lo resuelven?" },
        { en: "Has someone ever forgiven you? How did that feel?", es: "¿Alguien te ha perdonado alguna vez? ¿Cómo se sintió?" },
        { en: "Was anyone left out today? What could have helped?", es: "¿Alguien quedó excluido hoy? ¿Qué podría haber ayudado?" },
        { en: "When is it hard to say sorry — and when is it easy?", es: "¿Cuándo es difícil pedir perdón — y cuándo es fácil?" },
        { en: "Who in your life is always on your team?", es: "¿Quién en tu vida siempre está de tu lado?" },
        { en: "What makes you feel like you really belong with your friends?", es: "¿Qué te hace sentir que de verdad perteneces con tus amigos?" },
        { en: "When a friend is upset with you, what is a good first thing to say?", es: "Cuando un amigo está molesto contigo, ¿qué es bueno decir primero?" },
        { en: "Is there someone you would like to say sorry to? What is stopping you?", es: "¿Hay alguien a quien te gustaría pedir perdón? ¿Qué te detiene?" },
        { en: "What is the difference between tattling and asking for help?", es: "¿Cuál es la diferencia entre acusar y pedir ayuda?" },
        { en: "Who in our family can you always go to? Why them?", es: "¿A quién de nuestra familia puedes acudir siempre? ¿Por qué a esa persona?" },
        { en: "When you forgive someone, what changes for you?", es: "Cuando perdonas a alguien, ¿qué cambia para ti?" }
      ]
    },
    "68": {
      A: [
        { en: "What's been on your mind lately that you haven't had a chance to say out loud?", es: "¿Qué has tenido en mente últimamente que no has podido decir en voz alta?" },
        { en: "When stress builds up, where do you feel it, and what helps you let it out?", es: "Cuando el estrés se acumula, ¿dónde lo sientes y qué te ayuda a soltarlo?" },
        { en: "Is there a feeling lately that's been hard to put into words?", es: "¿Hay un sentimiento reciente que te ha costado poner en palabras?" },
        { en: "On a scale of running-on-empty to fully charged, where's your tank today?", es: "En una escala de 'sin batería' a 'carga completa', ¿cómo está tu tanque hoy?" },
        { en: "What's something that stresses you out that adults might not realize?", es: "¿Qué te estresa que los adultos quizás no se dan cuenta?" },
        { en: "When you're overwhelmed, do you want space, a distraction, or someone to just listen?", es: "Cuando te sientes abrumado/a, ¿quieres espacio, una distracción o que alguien solo te escuche?" },
        { en: "What is something you've been overthinking lately?", es: "¿En qué has estado pensando demasiado últimamente?" },
        { en: "When your mind is racing, what slows it down?", es: "Cuando tu mente va a mil, ¿qué la desacelera?" },
        { en: "Is there a feeling you've been hiding behind 'I'm fine'?", es: "¿Hay un sentimiento que has escondido detrás de 'estoy bien'?" },
        { en: "What drains your energy, and what gives it back?", es: "¿Qué te quita energía, y qué te la devuelve?" },
        { en: "When you're stressed, what is your go-to — and does it actually help?", es: "Cuando estás estresado/a, ¿qué haces primero — y de verdad ayuda?" },
        { en: "If your mood today were a song, what would it be?", es: "Si tu ánimo de hoy fuera una canción, ¿cuál sería?" }
      ],
      B: [
        { en: "Whose 'highlight reel' do you find yourself comparing your real life to?", es: "¿Con los 'mejores momentos' de quién comparas tu vida real?" },
        { en: "When you're hard on yourself, what does that inner voice say? Would you say it to a friend?", es: "Cuando eres duro/a contigo, ¿qué dice esa voz interior? ¿Se lo dirías a un amigo?" },
        { en: "What's something you used to believe you couldn't do, but you've changed your mind about?", es: "¿Qué es algo que creías que no podías hacer, pero ya cambiaste de opinión?" },
        { en: "What's one thing you like about who you're becoming?", es: "¿Qué es algo que te gusta de la persona en que te estás convirtiendo?" },
        { en: "When you fail at something, how long does it stick to you?", es: "Cuando fallas en algo, ¿cuánto tiempo se te queda pegado?" },
        { en: "Where do you feel like you have to be perfect? Says who?", es: "¿Dónde sientes que tienes que ser perfecto/a? ¿Quién lo dice?" },
        { en: "Whose opinion of you do you give too much power to?", es: "¿A la opinión de quién le das demasiado poder sobre ti?" },
        { en: "What is a strength of yours that doesn't show up on a report card?", es: "¿Cuál es una fortaleza tuya que no aparece en un boletín de notas?" },
        { en: "When you compare yourself to others, who is it usually with — and is it fair?", es: "Cuando te comparas con otros, ¿con quién suele ser — y es justo?" },
        { en: "What would you try this year if you weren't afraid of looking silly?", es: "¿Qué intentarías este año si no tuvieras miedo de parecer tonto/a?" },
        { en: "What is something you're harder on yourself about than anyone else would be?", es: "¿En qué eres más duro/a contigo que cualquier otra persona?" },
        { en: "When you mess up, how long before you can be kind to yourself again?", es: "Cuando te equivocas, ¿cuánto tardas en volver a ser amable contigo?" }
      ],
      C: [
        { en: "Is there anything going on with friends that's felt complicated?", es: "¿Hay algo con tus amigos que se haya sentido complicado?" },
        { en: "When someone lets you down, how do you decide whether to talk it out or let it go?", es: "Cuando alguien te decepciona, ¿cómo decides si hablarlo o dejarlo pasar?" },
        { en: "Is there a relationship you'd want to repair if you knew how to start?", es: "¿Hay una relación que te gustaría reparar si supieras cómo empezar?" },
        { en: "Have you ever gone along with the group when it didn't feel right? What happened?", es: "¿Alguna vez seguiste al grupo cuando no se sentía bien? ¿Qué pasó?" },
        { en: "What makes you trust someone — and what breaks it?", es: "¿Qué hace que confíes en alguien — y qué lo rompe?" },
        { en: "When you've been wrong, what makes it easier to admit it?", es: "Cuando te has equivocado, ¿qué hace más fácil admitirlo?" },
        { en: "Is there a friendship that's changed lately? How do you feel about it?", es: "¿Hay una amistad que haya cambiado últimamente? ¿Cómo te sientes al respecto?" },
        { en: "When someone apologizes, what makes it feel real?", es: "Cuando alguien se disculpa, ¿qué hace que se sienta sincero?" },
        { en: "Have you ever stayed quiet to fit in? What did it cost you?", es: "¿Alguna vez te callaste para encajar? ¿Qué te costó?" },
        { en: "Who do you owe a kinder reading than you've been giving them?", es: "¿A quién le debes una interpretación más amable de la que le has estado dando?" },
        { en: "What does a good apology actually include?", es: "¿Qué incluye de verdad una buena disculpa?" },
        { en: "Who makes you feel safe enough to be wrong sometimes?", es: "¿Quién te hace sentir lo suficientemente seguro/a como para equivocarte a veces?" }
      ]
    },
    "912": {
      A: [
        { en: "What's something you're carrying right now that nobody's really asked you about?", es: "¿Qué es algo que cargas ahora mismo que nadie te ha preguntado de verdad?" },
        { en: "When everything feels like too much, what helps you come back to yourself?", es: "Cuando todo se siente demasiado, ¿qué te ayuda a volver a ti mismo/a?" },
        { en: "Are there feelings you tend to push down? What would it be like to let one surface?", es: "¿Hay sentimientos que sueles reprimir? ¿Cómo sería dejar que uno salga?" },
        { en: "What's the gap between how you seem and how you actually feel lately?", es: "¿Cuál es la diferencia entre cómo te ves y cómo te sientes de verdad últimamente?" },
        { en: "When did you last feel genuinely okay? What was different?", es: "¿Cuándo te sentiste genuinamente bien por última vez? ¿Qué era diferente?" },
        { en: "What do you do with stress that helps — and what do you do that doesn't?", es: "¿Qué haces con el estrés que ayuda — y qué haces que no?" },
        { en: "What is the weight you're carrying that you make look effortless?", es: "¿Cuál es el peso que cargas y que haces parecer fácil?" },
        { en: "When did you last let yourself fall apart a little — and was it safe to?", es: "¿Cuándo fue la última vez que te permitiste desmoronarte un poco — y fue seguro hacerlo?" },
        { en: "What helps you come back to baseline when anxiety spikes?", es: "¿Qué te ayuda a volver a tu base cuando la ansiedad sube de golpe?" },
        { en: "Which emotion feels 'not allowed' for you to show?", es: "¿Qué emoción sientes que 'no tienes permitido' mostrar?" },
        { en: "What are you pretending not to feel right now?", es: "¿Qué estás fingiendo no sentir ahora mismo?" },
        { en: "What does rest look like for you — real rest, not just scrolling?", es: "¿Cómo se ve el descanso para ti — descanso real, no solo mirar la pantalla?" }
      ],
      B: [
        { en: "What does your inner critic say on a bad day — and whose voice does it sound like?", es: "¿Qué dice tu crítico interno en un mal día — y a la voz de quién se parece?" },
        { en: "Where do you feel pressure to 'have it figured out'? Who decided that timeline?", es: "¿Dónde sientes presión por 'tenerlo todo resuelto'? ¿Quién decidió ese plazo?" },
        { en: "What would change if you treated yourself with the same grace you give your friends?", es: "¿Qué cambiaría si te trataras con la misma gracia que les das a tus amigos?" },
        { en: "What's a mistake you're still punishing yourself for? Has it earned that?", es: "¿Qué error sigues castigándote? ¿Se lo ha ganado?" },
        { en: "Where does your sense of worth come from — and is that a fair source?", es: "¿De dónde viene tu sentido de valor — y es una fuente justa?" },
        { en: "What would you attempt if you knew you wouldn't judge yourself for failing?", es: "¿Qué intentarías si supieras que no te juzgarías por fallar?" },
        { en: "Where did you learn that you had to earn your worth?", es: "¿Dónde aprendiste que tenías que ganarte tu valor?" },
        { en: "What would you pursue if no one was watching or grading it?", es: "¿Qué perseguirías si nadie estuviera mirando ni calificándolo?" },
        { en: "What is a label you got stuck with that doesn't fit who you actually are?", es: "¿Qué etiqueta te quedó pegada que no encaja con quien realmente eres?" },
        { en: "When you fail, what story do you tell yourself about what it means?", es: "Cuando fallas, ¿qué historia te cuentas sobre lo que significa?" },
        { en: "What does being kind to yourself look like on your worst day?", es: "¿Cómo se ve ser amable contigo en tu peor día?" },
        { en: "Whose voice is your inner critic — and do they deserve that much say?", es: "¿De quién es la voz de tu crítico interno — y merece tanto poder de decisión?" }
      ],
      C: [
        { en: "Is there a friendship or relationship that's felt heavy lately?", es: "¿Hay una amistad o relación que se haya sentido pesada últimamente?" },
        { en: "When you've hurt someone, what makes it hard to own it — and what helps?", es: "Cuando has lastimado a alguien, ¿qué hace difícil reconocerlo — y qué ayuda?" },
        { en: "Forgiveness and trust aren't the same. Is there a line you're trying to figure out with someone?", es: "Perdonar y confiar no son lo mismo. ¿Hay un límite que intentas definir con alguien?" },
        { en: "Is there a relationship you're outgrowing, and how do you feel about that?", es: "¿Hay una relación de la que estás creciendo más allá, y cómo te sientes con eso?" },
        { en: "When you've been hurt, where is the line between protecting yourself and shutting people out?", es: "Cuando te han herido, ¿dónde está el límite entre protegerte y cerrarte a los demás?" },
        { en: "Who deserves an apology that your pride keeps getting in the way of?", es: "¿Quién merece una disculpa que tu orgullo sigue estorbando?" },
        { en: "What is a more generous way to read someone who frustrated you this week?", es: "¿Cuál es una manera más generosa de interpretar a alguien que te frustró esta semana?" },
        { en: "Who shows up for you in a way you might be taking for granted?", es: "¿Quién está presente para ti de una manera que quizás das por sentada?" },
        { en: "Where might setting a boundary actually be the kindest thing for everyone?", es: "¿Dónde poner un límite podría ser en realidad lo más amable para todos?" },
        { en: "Is there someone you owe an apology — or someone you're waiting on one from?", es: "¿Hay alguien a quien le debes una disculpa — o alguien de quien esperas una?" },
        { en: "Who do you feel most yourself around? What do they do that makes that true?", es: "¿Con quién te sientes más tú mismo/a? ¿Qué hace esa persona que lo logra?" },
        { en: "When is walking away the healthy choice, and when is it avoiding the work?", es: "¿Cuándo alejarse es la opción sana, y cuándo es evitar el trabajo?" }
      ]
    },
    adult: {
      A: [
        { en: "What have you been feeling this week that you haven't said out loud to anyone?", es: "¿Qué has sentido esta semana que no le has dicho en voz alta a nadie?" },
        { en: "When you're depleted, what actually refills you — and when did you last make room for it?", es: "Cuando estás agotado/a, ¿qué te recarga de verdad — y cuándo le hiciste espacio por última vez?" },
        { en: "Which emotion do you tend to talk yourself out of feeling?", es: "¿Qué emoción sueles convencerte de no sentir?" },
        { en: "What's the feeling under the busyness right now, if you slow down enough to notice?", es: "¿Cuál es el sentimiento debajo del ajetreo ahora mismo, si te detienes lo suficiente para notarlo?" },
        { en: "Where are you running on fumes and calling it 'fine'?", es: "¿Dónde estás funcionando con las últimas fuerzas y llamándolo 'bien'?" },
        { en: "When did you last feel genuinely rested — not just not-working?", es: "¿Cuándo descansaste de verdad por última vez — no solo dejar de trabajar?" },
        { en: "What feeling have you been managing instead of actually feeling?", es: "¿Qué sentimiento has estado gestionando en lugar de sentirlo de verdad?" },
        { en: "Where in your body do you store the stress you don't talk about?", es: "¿En qué parte del cuerpo guardas el estrés del que no hablas?" },
        { en: "When did you last do something purely because it restored you?", es: "¿Cuándo fue la última vez que hiciste algo solo porque te restauraba?" },
        { en: "What would change if you named how tired you actually are?", es: "¿Qué cambiaría si nombraras lo cansado/a que realmente estás?" },
        { en: "What is the emotion underneath your irritability lately?", es: "¿Cuál es la emoción debajo de tu irritabilidad últimamente?" },
        { en: "If a close friend felt the way you do now, what would you notice in them?", es: "Si un amigo cercano se sintiera como tú ahora, ¿qué notarías en él?" }
      ],
      B: [
        { en: "What does your inner critic say when you fall short — and would you ever say it to someone you love?", es: "¿Qué dice tu crítico interno cuando te quedas corto/a — y se lo dirías a alguien que amas?" },
        { en: "Where are you holding yourself to a standard you'd never expect of a friend?", es: "¿Dónde te exiges un estándar que nunca esperarías de un amigo?" },
        { en: "What would self-compassion look like in the part of your life that's hardest right now?", es: "¿Cómo se vería la autocompasión en la parte de tu vida que es más difícil ahora?" },
        { en: "What are you still carrying guilt for that you'd forgive in anyone else?", es: "¿Qué culpa sigues cargando que perdonarías en cualquier otra persona?" },
        { en: "Whose approval are you still chasing — and is it worth the cost?", es: "¿La aprobación de quién sigues persiguiendo — y vale el costo?" },
        { en: "What would 'enough' actually look like, and who decided it wasn't enough?", es: "¿Cómo se vería 'suficiente' de verdad, y quién decidió que no lo era?" },
        { en: "What standard are you measuring yourself against that you never agreed to?", es: "¿Con qué estándar te mides que nunca aceptaste?" },
        { en: "Where are you confusing your worth with your productivity?", es: "¿Dónde estás confundiendo tu valor con tu productividad?" },
        { en: "What would you forgive in a friend that you won't forgive in yourself?", es: "¿Qué perdonarías en un amigo que no te perdonas a ti?" },
        { en: "What part of your story do you still narrate as a failure?", es: "¿Qué parte de tu historia sigues contando como un fracaso?" },
        { en: "When did you last speak to yourself the way you'd want your child spoken to?", es: "¿Cuándo fue la última vez que te hablaste como querrías que le hablaran a tu hijo/a?" },
        { en: "What is one expectation you could set down without the world ending?", es: "¿Qué expectativa podrías soltar sin que el mundo se acabe?" }
      ],
      C: [
        { en: "Is there a relationship that needs a repair you've been putting off?", es: "¿Hay una relación que necesita una reparación que has estado posponiendo?" },
        { en: "When someone disappoints you, how do you tell the difference between forgiving and re-trusting?", es: "Cuando alguien te decepciona, ¿cómo distingues entre perdonar y volver a confiar?" },
        { en: "Who are you reading uncharitably right now — and what's the kinder possible story?", es: "¿A quién estás interpretando sin caridad ahora mismo — y cuál es la historia más amable posible?" },
        { en: "Is there a conversation you keep avoiding? What's the cost of staying silent?", es: "¿Hay una conversación que sigues evitando? ¿Cuál es el costo de callar?" },
        { en: "Who in your life pours into you the way you pour into others?", es: "¿Quién en tu vida te llena como tú llenas a los demás?" },
        { en: "Where is a boundary actually an act of grace — for both of you?", es: "¿Dónde un límite es en realidad un acto de gracia — para ambos?" },
        { en: "Which relationship would change most if you led with grace instead of being right?", es: "¿Qué relación cambiaría más si lideraras con gracia en vez de tener la razón?" },
        { en: "Who are you withholding forgiveness from — and what is it costing you?", es: "¿A quién le estás negando el perdón — y qué te está costando?" },
        { en: "What is the charitable version of the story you've been telling about them?", es: "¿Cuál es la versión más caritativa de la historia que has estado contando sobre esa persona?" },
        { en: "Where do you need to repair, and what is the first small step?", es: "¿Dónde necesitas reparar, y cuál es el primer paso pequeño?" },
        { en: "Who fills your cup the way you fill others' — and have you told them?", es: "¿Quién llena tu copa como tú llenas la de los demás — y se lo has dicho?" },
        { en: "What boundary would protect the relationship rather than end it?", es: "¿Qué límite protegería la relación en lugar de terminarla?" }
      ]
    }
  };
  CS_DATA = {
    "k2": {
      A: [
        { en: "What was the silliest thing that happened today?", es: "¿Qué fue lo más chistoso que pasó hoy?" },
        { en: "What was the hardest part of your day — the part that felt too big?", es: "¿Cuál fue la parte más difícil de tu día — la que se sintió demasiado grande?" },
        { en: "If your day was an animal, what animal would it be?", es: "Si tu día fuera un animal, ¿qué animal sería?" },
        { en: "When you felt upset today, what helped you feel safe again?", es: "Cuando te sentiste mal hoy, ¿qué te ayudó a sentirte seguro/a otra vez?" },
        { en: "What made you say 'NO FAIR!' today?", es: "¿Qué te hizo decir '¡NO ES JUSTO!' hoy?" },
        { en: "Is there a worried feeling still hiding in your tummy right now?", es: "¿Hay una preocupación escondida en tu pancita ahora mismo?" },
        { en: "If today had a color, what color was it and why?", es: "Si tu día tuviera un color, ¿de qué color sería y por qué?" },
        { en: "What's something you wanted to say to someone today but didn't?", es: "¿Qué quisiste decirle a alguien hoy pero no lo dijiste?" },
        { en: "What made you laugh so hard your tummy hurt?", es: "¿Qué te hizo reír tanto que te dolió la panza?" },
        { en: "When you're scared, who do you want close to you?", es: "Cuando tienes miedo, ¿a quién quieres cerca de ti?" }
      ],
      B: [
        { en: "What are you the BOSS of in this house?", es: "¿De qué eres el/la JEFE en esta casa?" },
        { en: "When you make a mistake, are you gentle with yourself or a little mean?", es: "Cuando cometes un error, ¿eres amable contigo o un poco duro/a?" },
        { en: "Show me your best silly dance move!", es: "¡Muéstrame tu mejor paso de baile chistoso!" },
        { en: "What's something hard you kept trying today even when you wanted to quit?", es: "¿Qué cosa difícil seguiste intentando hoy aunque querías rendirte?" },
        { en: "If you had a superpower for a day, what would you fix first?", es: "Si tuvieras un superpoder por un día, ¿qué arreglarías primero?" },
        { en: "What do you love most about being you?", es: "¿Qué es lo que más te gusta de ser tú?" },
        { en: "What food would only YOU invent that's actually amazing?", es: "¿Qué comida solo TÚ inventarías que en realidad está increíble?" },
        { en: "What's something you couldn't do before but can do now?", es: "¿Qué es algo que antes no podías hacer y ahora sí?" },
        { en: "What are you way better at now than when you were a baby?", es: "¿En qué eres mucho mejor ahora que cuando eras bebé?" },
        { en: "What kind thing could you say to yourself, like you'd say to a friend?", es: "¿Qué cosa amable podrías decirte, como se la dirías a un amigo?" }
      ],
      C: [
        { en: "Who made you laugh today, and what did they do?", es: "¿Quién te hizo reír hoy, y qué hicieron?" },
        { en: "Did anyone hurt your feelings today? What happened?", es: "¿Alguien lastimó tus sentimientos hoy? ¿Qué pasó?" },
        { en: "If our family were a team, what would our team name be?", es: "Si nuestra familia fuera un equipo, ¿cómo se llamaría?" },
        { en: "Who did you help today, and how did it feel?", es: "¿A quién ayudaste hoy, y cómo se sintió?" },
        { en: "Who has the best snacks in your class?", es: "¿Quién tiene los mejores snacks en tu clase?" },
        { en: "If a friend was sad today, what did you do — or wish you'd done?", es: "Si un amigo estaba triste hoy, ¿qué hiciste — o qué te hubiera gustado hacer?" },
        { en: "Who would you want on your team in a pillow fight?", es: "¿A quién querrías en tu equipo en una guerra de almohadas?" },
        { en: "Is there someone you need to say sorry to?", es: "¿Hay alguien a quien necesitas pedir perdón?" },
        { en: "If you could trade places with someone in our family, who?", es: "Si pudieras cambiar de lugar con alguien de nuestra familia, ¿con quién?" },
        { en: "Who makes you feel safe, and why them?", es: "¿Quién te hace sentir seguro/a, y por qué esa persona?" }
      ]
    },
    "35": {
      A: [
        { en: "On a scale of 'meh' to 'best day ever,' where'd today land?", es: "En una escala de 'ahí nomás' a 'el mejor día', ¿dónde cayó hoy?" },
        { en: "What's a worry that's been sitting with you lately?", es: "¿Qué preocupación te ha estado acompañando últimamente?" },
        { en: "If today got a laugh track, when would it play?", es: "Si tu día tuviera risas grabadas, ¿cuándo sonarían?" },
        { en: "When a feeling gets really big, what helps it get smaller?", es: "Cuando un sentimiento se hace muy grande, ¿qué ayuda a hacerlo más pequeño?" },
        { en: "What tiny thing annoyed you way more than it should have?", es: "¿Qué cosita te molestó mucho más de lo que debería?" },
        { en: "Is there something you've been feeling but haven't had words for?", es: "¿Hay algo que has estado sintiendo pero no has podido poner en palabras?" },
        { en: "What was today's plot twist?", es: "¿Cuál fue el giro inesperado de hoy?" },
        { en: "What's something you wish a grown-up understood about your day?", es: "¿Qué te gustaría que un adulto entendiera sobre tu día?" },
        { en: "If your mood were weather, what's the forecast?", es: "Si tu ánimo fuera el clima, ¿cuál es el pronóstico?" },
        { en: "When you're frustrated, do you need a break, a talk, or space?", es: "Cuando estás frustrado/a, ¿necesitas un descanso, hablar o espacio?" }
      ],
      B: [
        { en: "If you had a wrestler intro, what's your entrance line?", es: "Si tuvieras una presentación de luchador, ¿cuál es tu frase de entrada?" },
        { en: "When you mess up, is the voice in your head kind or harsh?", es: "Cuando te equivocas, ¿la voz en tu cabeza es amable o dura?" },
        { en: "What are you weirdly, surprisingly good at?", es: "¿En qué eres raramente, sorprendentemente bueno/a?" },
        { en: "What's something you're proud of that nobody noticed?", es: "¿De qué estás orgulloso/a que nadie notó?" },
        { en: "If you started a channel tomorrow, what's it about?", es: "Si abrieras un canal mañana, ¿de qué sería?" },
        { en: "What would you tell a friend who felt like giving up?", es: "¿Qué le dirías a un amigo que sintiera ganas de rendirse?" },
        { en: "What's the most 'you' thing you did today?", es: "¿Qué fue lo más 'tú' que hiciste hoy?" },
        { en: "What's something hard you haven't quit on yet?", es: "¿Qué cosa difícil todavía no has abandonado?" },
        { en: "What opinion do you have that everyone thinks is wrong?", es: "¿Qué opinión tienes que todos creen que está mal?" },
        { en: "What's one kind thing you could say to yourself tonight?", es: "¿Qué cosa amable podrías decirte esta noche?" }
      ],
      C: [
        { en: "Who at school is basically a cartoon character?", es: "¿Quién en la escuela es prácticamente un personaje de caricatura?" },
        { en: "Did anything happen with friends today that felt tricky?", es: "¿Pasó algo con tus amigos hoy que se sintiera complicado?" },
        { en: "If our family swapped jobs, who'd be worst at yours?", es: "Si la familia cambiara de tareas, ¿quién sería el peor en la tuya?" },
        { en: "Was anyone left out today? What could have helped?", es: "¿Alguien quedó afuera hoy? ¿Qué podría haber ayudado?" },
        { en: "Who made you laugh the hardest today?", es: "¿Quién te hizo reír más fuerte hoy?" },
        { en: "Is there someone you'd like to say sorry to? What's stopping you?", es: "¿Hay alguien a quien te gustaría pedir perdón? ¿Qué te detiene?" },
        { en: "Who would you invite to dinner if you could pick anyone?", es: "¿A quién invitarías a cenar si pudieras elegir a cualquiera?" },
        { en: "Who in your life always has your back?", es: "¿Quién en tu vida siempre te apoya?" },
        { en: "Any drama today? You don't have to name names.", es: "¿Algún drama hoy? No tienes que decir nombres." },
        { en: "When someone forgives you, how does it feel?", es: "Cuando alguien te perdona, ¿cómo se siente?" }
      ]
    },
    "68": {
      A: [
        { en: "What's the most middle-school thing that happened today?", es: "¿Qué fue lo más de secundaria que pasó hoy?" },
        { en: "What's a feeling you've been hiding behind 'I'm fine'?", es: "¿Qué sentimiento has escondido detrás de 'estoy bien'?" },
        { en: "If today were a group chat, what's the last message?", es: "Si hoy fuera un chat grupal, ¿cuál es el último mensaje?" },
        { en: "What's something you've been overthinking lately?", es: "¿En qué has estado pensando de más últimamente?" },
        { en: "What tiny inconvenience made you want to move countries?", es: "¿Qué pequeña molestia te dio ganas de mudarte de país?" },
        { en: "When your mind won't slow down, what actually helps?", es: "Cuando tu mente no se desacelera, ¿qué ayuda de verdad?" },
        { en: "What song matched your mood today?", es: "¿Qué canción combinó con tu ánimo hoy?" },
        { en: "What's stressing you that you haven't told anyone?", es: "¿Qué te está estresando que no le has contado a nadie?" },
        { en: "What's the pettiest reason something annoyed you today?", es: "¿Cuál fue la razón más insignificante por la que algo te molestó hoy?" },
        { en: "When you're overwhelmed, do you want space, distraction, or someone to listen?", es: "Cuando te sientes abrumado/a, ¿quieres espacio, distracción o que alguien escuche?" }
      ],
      B: [
        { en: "Whose 'highlight reel' are you comparing your real life to?", es: "¿Con los 'mejores momentos' de quién comparas tu vida real?" },
        { en: "When you're hard on yourself, would you say those words to a friend?", es: "Cuando eres duro/a contigo, ¿le dirías esas palabras a un amigo?" },
        { en: "What's a W you had today you didn't post?", es: "¿Qué logro tuviste hoy que no publicaste?" },
        { en: "What's a strength of yours no report card measures?", es: "¿Cuál es una fortaleza tuya que ningún boletín mide?" },
        { en: "What take would start an argument at this table?", es: "¿Qué opinión empezaría una discusión en esta mesa?" },
        { en: "Where do you feel like you HAVE to be perfect — and who said so?", es: "¿Dónde sientes que TIENES que ser perfecto/a — y quién lo dijo?" },
        { en: "What can you do now that would blow your 8-year-old self's mind?", es: "¿Qué puedes hacer ahora que dejaría a tu yo de 8 años con la boca abierta?" },
        { en: "What's something you're afraid you're not good enough at?", es: "¿En qué tienes miedo de no ser lo suficientemente bueno/a?" },
        { en: "What's the most 'you' opinion you hold?", es: "¿Cuál es la opinión más 'tú' que tienes?" },
        { en: "Whose opinion of you do you give too much power?", es: "¿A la opinión de quién le das demasiado poder sobre ti?" }
      ],
      C: [
        { en: "Who's the most sitcom-worthy person at school?", es: "¿Quién es la persona más digna de una comedia en la escuela?" },
        { en: "When you and a friend clash, how does it really get fixed?", es: "Cuando tú y un amigo chocan, ¿cómo se arregla de verdad?" },
        { en: "Who would survive longest in a zombie apocalypse in this family?", es: "¿Quién sobreviviría más en un apocalipsis zombie en esta familia?" },
        { en: "Is there someone you owe an apology but your pride's in the way?", es: "¿Hay alguien a quien le debes una disculpa pero tu orgullo se interpone?" },
        { en: "Any drama today? Rate it 1 to 10.", es: "¿Algún drama hoy? Puntúalo del 1 al 10." },
        { en: "Who's someone you could call at 2am, no questions asked?", es: "¿Quién es alguien a quien podrías llamar a las 2am, sin preguntas?" },
        { en: "What's a group-chat unwritten rule everyone just knows?", es: "¿Cuál es una regla no escrita de los chats grupales que todos saben?" },
        { en: "Did anyone get left out today — were you the fix or the problem?", es: "¿Alguien quedó afuera hoy — fuiste la solución o el problema?" },
        { en: "Who made your day better without even trying?", es: "¿Quién mejoró tu día sin siquiera intentarlo?" },
        { en: "What's something you wish you could tell a friend but haven't?", es: "¿Qué te gustaría poder decirle a un amigo pero no lo has hecho?" }
      ]
    },
    "912": {
      A: [
        { en: "What was today's main-character moment?", es: "¿Cuál fue el momento de 'protagonista' de hoy?" },
        { en: "What did you say 'I'm fine' about today when you weren't?", es: "¿Sobre qué dijiste 'estoy bien' hoy cuando no lo estabas?" },
        { en: "On a scale of 'thriving' to 'held together by vibes,' how are you?", es: "En una escala de 'prosperando' a 'sostenido por pura vibra', ¿cómo estás?" },
        { en: "What's a feeling you can't quite name right now?", es: "¿Qué sentimiento no puedes nombrar del todo ahora mismo?" },
        { en: "What's the dumbest thing that stressed you out today?", es: "¿Cuál fue la cosa más tonta que te estresó hoy?" },
        { en: "What have you been avoiding instead of dealing with?", es: "¿Qué has estado evitando en lugar de enfrentarlo?" },
        { en: "If today were a Netflix episode, what's the title?", es: "Si hoy fuera un episodio de Netflix, ¿cuál sería el título?" },
        { en: "What's something heavy you've been carrying alone?", es: "¿Qué carga pesada has estado llevando en soledad?" },
        { en: "What's the last thing that genuinely made you laugh?", es: "¿Qué fue lo último que te hizo reír de verdad?" },
        { en: "When you're maxed out, do you want space, distraction, or someone to listen?", es: "Cuando estás al límite, ¿quieres espacio, distracción o que alguien escuche?" }
      ],
      B: [
        { en: "What's a hot take you'd defend to the death at this table?", es: "¿Qué opinión polémica defenderías a muerte en esta mesa?" },
        { en: "Whose approval are you chasing that isn't worth it?", es: "¿La aprobación de quién persigues que no vale la pena?" },
        { en: "What are you low-key really good at?", es: "¿En qué eres secretamente muy bueno/a?" },
        { en: "What's something you're proud of that you've never said out loud?", es: "¿De qué estás orgulloso/a que nunca has dicho en voz alta?" },
        { en: "If your life had a narrator, what would they say about you?", es: "Si tu vida tuviera un narrador, ¿qué diría sobre ti?" },
        { en: "Where are you being a perfectionist for no reason — and why?", es: "¿Dónde estás siendo perfeccionista sin razón — y por qué?" },
        { en: "What version of yourself are you glad you outgrew?", es: "¿Qué versión de ti mismo/a te alegra haber superado?" },
        { en: "What's the kindest thing you could say to yourself right now — and would you believe it?", es: "¿Qué es lo más amable que podrías decirte ahora — y te lo creerías?" },
        { en: "If you gave a TED talk tomorrow, what's it on?", es: "Si dieras una charla TED mañana, ¿de qué sería?" },
        { en: "What are you afraid you're falling behind on?", es: "¿En qué tienes miedo de estar quedándote atrás?" }
      ],
      C: [
        { en: "Who's the most sitcom-character person in your life right now?", es: "¿Quién es la persona más de 'personaje de comedia' en tu vida ahora?" },
        { en: "Is there an apology you owe that your ego keeps blocking?", es: "¿Hay una disculpa que debes y que tu ego sigue bloqueando?" },
        { en: "Who's your 'call at 2am, no questions' person?", es: "¿Quién es tu persona de 'llámame a las 2am, sin preguntas'?" },
        { en: "When you and someone fall out, do you fix it or let it ghost?", es: "Cuando te peleas con alguien, ¿lo arreglas o lo dejas desaparecer?" },
        { en: "Any friend drama this week? Keep it vague if you want.", es: "¿Algún drama de amigos esta semana? Sé vago/a si quieres." },
        { en: "Who do you need to reconnect with but keep putting off?", es: "¿Con quién necesitas reconectar pero sigues posponiendo?" },
        { en: "Who in this family would you actually want as a roommate?", es: "¿A quién de esta familia querrías de verdad como compañero de cuarto?" },
        { en: "What's a boundary you wish you were better at holding?", es: "¿Qué límite te gustaría poder mantener mejor?" },
        { en: "What's the most chaotic group-chat moment recently?", es: "¿Cuál fue el momento más caótico de un chat grupal recientemente?" },
        { en: "Who made your week better without knowing it — did you tell them?", es: "¿Quién mejoró tu semana sin saberlo — se lo dijiste?" }
      ]
    },
    "adult": {
      A: [
        { en: "If today were a sitcom episode, what's the title and guest star?", es: "Si hoy fuera un episodio de comedia, ¿cuál es el título y la estrella invitada?" },
        { en: "What did you say 'I'm fine' about today when you very much weren't?", es: "¿Sobre qué dijiste 'estoy bien' hoy cuando claramente no lo estabas?" },
        { en: "On a scale of yelling 'PIVOT!' to Bob-Ross-calm, how was your day?", es: "En una escala de 'gritando de estrés' a 'tranquilo como Bob Ross', ¿cómo estuvo tu día?" },
        { en: "What have you been carrying that you haven't set down in a while?", es: "¿Qué has estado cargando que no has soltado en un buen rato?" },
        { en: "What tiny thing made you feel personally victimized today?", es: "¿Qué cosita te hizo sentir personalmente atacado/a hoy?" },
        { en: "When did your social battery hit zero — and what drained it?", es: "¿Cuándo se te acabó la batería social — y qué la agotó?" },
        { en: "If your mood had a theme song, what's playing?", es: "Si tu ánimo tuviera una canción, ¿cuál sonaría?" },
        { en: "What's something you needed today that you didn't ask for?", es: "¿Qué necesitaste hoy que no pediste?" },
        { en: "What'll be funny later but was NOT funny today?", es: "¿Qué será chistoso después pero HOY no tuvo gracia?" },
        { en: "When you're overwhelmed, do you actually let anyone see it?", es: "Cuando te sientes abrumado/a, ¿de verdad dejas que alguien lo vea?" }
      ],
      B: [
        { en: "What's a hill you're prepared to die on at this dinner table?", es: "¿Cuál es la postura que defenderías hasta el final en esta mesa?" },
        { en: "Whose approval are you still chasing that you should've dropped years ago?", es: "¿La aprobación de quién sigues persiguiendo que debiste soltar hace años?" },
        { en: "What are you genuinely good at that never makes a resume?", es: "¿En qué eres realmente bueno/a que nunca aparece en un currículum?" },
        { en: "What's something you're proud of that no one claps for?", es: "¿De qué estás orgulloso/a que nadie aplaude?" },
        { en: "If your week got a 'previously on…' recap, what are the three clips?", es: "Si tu semana tuviera un resumen de 'anteriormente…', ¿cuáles son los tres clips?" },
        { en: "Where are you holding yourself to a standard nobody asked for?", es: "¿Dónde te estás exigiendo un estándar que nadie pidió?" },
        { en: "What version of you from ten years ago are you glad got a series finale?", es: "¿Qué versión de ti de hace diez años te alegra que haya tenido su final?" },
        { en: "What would you tell a friend who did exactly what you did today?", es: "¿Qué le dirías a un amigo que hizo exactamente lo que tú hiciste hoy?" },
        { en: "What win would you have put on the fridge as a kid?", es: "¿Qué logro habrías pegado en el refri de niño/a?" },
        { en: "What's one kind thing you'd say to yourself if you were your own best friend?", es: "¿Qué cosa amable te dirías si fueras tu propio mejor amigo?" }
      ],
      C: [
        { en: "Who in your life is running a whole sitcom right now?", es: "¿Quién en tu vida está protagonizando toda una comedia ahora mismo?" },
        { en: "Who do you owe an apology that your pride keeps rescheduling?", es: "¿A quién le debes una disculpa que tu orgullo sigue posponiendo?" },
        { en: "Which family member would be the breakout fan-favorite of our show?", es: "¿Qué miembro de la familia sería el favorito sorpresa de nuestro programa?" },
        { en: "Who's your ride-or-die, and when did you last actually tell them?", es: "¿Quién es tu persona incondicional, y cuándo se lo dijiste por última vez?" },
        { en: "Any low-grade drama you're monitoring like it's your job?", es: "¿Algún drama de bajo nivel que vigilas como si fuera tu trabajo?" },
        { en: "Who did you have less patience with today than they deserved?", es: "¿Con quién tuviste menos paciencia hoy de la que merecía?" },
        { en: "If we rebooted a night out from your twenties, who's invited and what goes wrong?", es: "Si repitiéramos una salida de tus veintes, ¿quién viene y qué sale mal?" },
        { en: "What friendship do you keep meaning to rekindle — what's really stopping you?", es: "¿Qué amistad sigues queriendo reavivar — qué te detiene de verdad?" },
        { en: "Is there a text you've left on 'I'll reply later' for way too long?", es: "¿Hay un mensaje que dejaste en 'respondo después' por demasiado tiempo?" },
        { en: "Who made your week better and doesn't even know it?", es: "¿Quién mejoró tu semana y ni siquiera lo sabe?" }
      ]
    }
  };
  try { window.AOG_CS_DATA = CS_DATA; } catch (e) {}
  function csListHtml() {
    var band = CS_DATA[CS_STATE.band] ? CS_STATE.band : "35";
    var doms = [
      { k: "A", c: "#C45A3B", t: L("Feelings & calming down", "Sentimientos y calmarse") },
      { k: "B", c: "#2E6B3A", t: L("Being kind to yourself", "Ser amable contigo") },
      { k: "C", c: "#2B4D7A", t: L("Friends, family & repair", "Amigos, familia y reparación") }
    ];
    return doms.map(function (d) {
      var items = CS_DATA[band][d.k] || [];
      return '<div style="margin-bottom:18px; text-align:left;">' +
        '<div style="display:flex; align-items:center; gap:9px; margin-bottom:9px;">' +
          '<span style="width:30px; height:30px; border-radius:8px; display:grid; place-items:center; background:' + d.c + '; flex-shrink:0;">' + csIcon(d.k) + '</span>' +
          '<span style="font-family:var(--font-serif); font-size:17px; font-weight:600; color:var(--ink);">' + d.t + '</span>' +
        '</div>' +
        items.map(function (o) {
          return '<div style="background:var(--paper,#fff); border:1px solid var(--rule); border-left:3px solid ' + d.c + '; border-radius:10px; padding:11px 14px; margin-bottom:8px; font-size:14px; line-height:1.5; color:var(--ink);">' + L(o.en, o.es) + '</div>';
        }).join("") +
      '</div>';
    }).join("");
  }
  function buildConvoStarters() {
    return '<div class="tool-modal-icon">💬</div>' +
      '<div class="tool-modal-title">' + L("Conversation starters", "Iniciadores de conversación") + '</div>' +
      aogBandChips("csBand", "aogCsBand", CS_STATE.band) +
      '<div class="tool-modal-sub">' + L("Pick an age, then a starter. These aren't a test — they're doors. Open one when the moment feels right, and ask gently. No need to do them all at once.", "Elige una edad y luego un iniciador. No son un examen — son puertas. Abre una cuando el momento se sienta bien, y pregunta con suavidad. No hace falta hacerlas todas de una vez.") + '</div>' +
      '<div id="csList">' + csListHtml() + '</div>';
  }
  window.aogCsBand = function (b) {
    if (!CS_DATA[b]) b = "35";
    CS_STATE.band = b; aogBandSet("csBand", b);
    var l = document.getElementById("csList"); if (l) l.innerHTML = csListHtml();
  };
  function initConvoStarters() {}

  function register() {
    if (!window.TOOLS) return;
    window.TOOLS.classreset  = { builder: buildClassReset, init: initClassReset };
    window.TOOLS.innercoach  = { builder: buildInnerCoach, init: initInnerCoach };
    window.TOOLS.makeitright = { builder: buildMakeRight,  init: initMakeRight };
    window.TOOLS.coreg       = { builder: buildCoreg,       init: function () {} };
    window.TOOLS.beyondfine  = { builder: buildBeyondFine,  init: initBeyondFine };
    window.TOOLS.harshkind   = { builder: buildHarshKind,   init: initHarshKind };
    window.TOOLS.thinksay    = { builder: buildThinkSay,    init: initThinkSay };
    window.TOOLS.scenarios   = { builder: buildScenarios,   init: initScenarios };
    window.TOOLS.findfunction = { builder: buildFindFunction, init: initFindFunction };
    window.TOOLS.convostarters = { builder: buildConvoStarters, init: initConvoStarters };
  }
  if (window.TOOLS) { register(); } else { window.addEventListener("load", register); }
})();
