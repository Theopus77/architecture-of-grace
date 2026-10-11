
(function () {
  var SCREEN = "screen-teacher-tools";

  function es() {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
    catch (e) { return false; }
  }
  function T(p) { return es() ? p[1] : p[0]; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* Gentle, no-equipment tools that suit anyone cold. Deliberately excludes
     the cold-water reset — fine as a deliberate choice, not handed at random. */
  var PICKS = ["breathing", "grounding", "boxbreath", "take5",
               "movement", "pmr", "safeplace", "bilateral", "presspush"];

  /* ─── The eight pathways ──────────────────────────────────────────────────
     kid/kides are the student-mode wording (build .30ce), following the voice
     the aog2 layer already uses on the tool cards. Heads stay the same — the
     words are already small; only the subs get younger. */
  var DOORS = {
    quiet:   { en: ["Quiet",    "Less sound. Less input. More space."],  es: ["Silencio",       "Menos ruido. Menos estímulos. Más espacio."],
               kid: ["Quiet",   "Too much noise? Find some quiet."],     kides: ["Silencio",    "¿Mucho ruido? Busca la calma."] },
    move:    { en: ["Move",     "Get some energy into motion."],         es: ["Moverme",        "Pon la energía en movimiento."],
               kid: ["Move",    "Wiggle the energy out!"],               kides: ["Moverme",     "¡Sacude la energía!"] },
    breathe: { en: ["Breathe",  "Find a rhythm."],                       es: ["Respirar",       "Encuentra un ritmo."],
               kid: ["Breathe", "Breathe slow, like a balloon."],        kides: ["Respirar",    "Respira despacio, como un globo."] },
    ground:  { en: ["Ground",   "Come back to where I am."],             es: ["Volver al ahora","Regresa a donde estás."],
               kid: ["Ground",  "Come back to right now."],              kides: ["Volver al ahora","Vuelve al ahora."] },
    feel:    { en: ["Feel",     "Notice what’s happening inside."], es: ["Sentir",         "Nota lo que pasa por dentro."],
               kid: ["Feel",    "What’s happening inside you?"],    kides: ["Sentir",      "¿Qué pasa dentro de ti?"] },
    focus:   { en: ["Focus",    "Prepare my brain to return."],          es: ["Enfocar",        "Prepara tu mente para volver."],
               kid: ["Focus",   "Get your brain ready to go back."],     kides: ["Enfocar",     "Prepara tu cerebro para volver."] },
    connect: { en: ["Connect",  "Tell someone what I need."],            es: ["Conectar",       "Dile a alguien lo que necesitas."],
               kid: ["Connect", "Show a grown-up what you need."],       kides: ["Conectar",    "Muéstrale a un adulto lo que necesitas."] },
    notsure: { en: ["Not sure", "Help me choose."],                      es: ["No estoy seguro","Ayúdame a elegir."],
               kid: ["Not sure","I’ll help you pick!"],             kides: ["No sé",  "¡Te ayudo a elegir!"] }
  };
  function toolsMode() {
    try { if (typeof window.aogToolsMode === "function") return window.aogToolsMode(); } catch (e) {}
    return "adult";
  }
  var LABELS = {
    pick:    ["Pick one for me", "Elige una por mí"],
    all:     ["Show everything instead", "Mejor muéstrame todo"],
    need:    ["I need to…", "Necesito…"],
    lowstim: ["Low-stimulation mode", "Modo de baja estimulación"],
    helpsSummary: ["Things that help me", "Lo que me ayuda"],
    helpsHint: ["Optional, and only saved on this device — so next time can start where it helped.",
                "Opcional, y se guarda solo en este dispositivo — para que la próxima vez empiece donde ayudó."],
    prevLine: ["You previously chose:", "La última vez elegiste:"]
  };

  /* ─── quietOpen: the tool modal without the practice log ──────────────────
     toolOpen() is wrapped by the Grace engine to count practice and to feed
     the welcome-back card. A chooser is not practice, so choosers replicate
     the tiny base opener instead of riding the wrapped chain. */
  function quietOpen(id) {
    try { if (window._toolTimer) { clearTimeout(window._toolTimer); window._toolTimer = null; } } catch (e) {}
    var modal = document.getElementById("toolModal");
    try { if (modal && modal.parentNode !== document.body) document.body.appendChild(modal); } catch (e) {}
    var tool = window.TOOLS && window.TOOLS[id];
    var body = document.getElementById("toolModalBody");
    if (!modal || !body || !tool) return;
    removeFb();
    body.innerHTML = tool.builder();
    modal.classList.add("open");
    if (typeof tool.init === "function") setTimeout(tool.init, 80);
  }
  function closeModal() { try { if (typeof window.toolClose === "function") window.toolClose(); } catch (e) {} }

  function chip(cat) {
    var all = document.querySelectorAll("#toolFilters .tool-chip");
    for (var i = 0; i < all.length; i++) {
      var oc = all[i].getAttribute("onclick") || "";
      if (oc.indexOf("'" + cat + "'") > -1) return all[i];
    }
    return null;
  }
  function openCatalog(cat) {
    var sc = document.getElementById(SCREEN);
    if (sc) sc.classList.remove("tt-collapsed");
    try {
      if (typeof window.aogToolFilter === "function") window.aogToolFilter(cat, chip(cat));
    } catch (e) {}
    /* Backstop scroll (build .30cg): aogToolFilter scrolls the bar into view,
       but if that ever fails on this heavy page, one corrective, instant
       scrollIntoView after layout settles. scrollIntoView because the screen
       is its own scroll container — window.scrollTo cannot move it. */
    setTimeout(function () {
      try {
        var bar = document.getElementById("toolFilters");
        if (!bar) return;
        var r = bar.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight - 80) bar.scrollIntoView({ block: "start" });
      } catch (e) {}
    }, 700);
  }
  function openStation() {
    closeModal();
    if (typeof window.showStationMode === "function") { try { window.showStationMode(); return; } catch (e) {} }
    openCatalog("ground");
  }

  /* ─── Actions a suggestion can carry ──────────────────────────────────── */
  function act(kind, id) {
    if (kind === "tool")    { window.toolOpen && window.toolOpen(id); }
    else if (kind === "quiet")   { quietOpen(id); }
    else if (kind === "station") { openStation(); }
    else if (kind === "pecs")    { closeModal(); if (typeof showScreen === "function") showScreen("screen-pecs"); }
    else if (kind === "cat")     { closeModal(); openCatalog(id); }
    else if (kind === "lowstim") { closeModal(); setLowStim(true); }
  }

  /* ─── One card catalog for everything this module suggests ────────────── */
  var CARDS = {
    breathing:  { n: ["4-7-8 Breathing", "Respiración 4-7-8"],      s: ["Follow the orb, three rounds", "Sigue la esfera, tres rondas"],       d: "90 s",  k: "tool" },
    boxbreath:  { n: ["Paced Breathing", "Respiración guiada"],     s: ["A steady 4·4·4·4 rhythm", "Un ritmo constante 4·4·4·4"], d: "60 s", k: "tool" },
    take5:      { n: ["Take 5", "Toma 5"],                               s: ["Trace your hand, breath by breath", "Traza tu mano, respiro a respiro"], d: "60 s",  k: "tool" },
    grounding:  { n: ["5-4-3-2-1", "5-4-3-2-1"],                         s: ["Come back through your senses", "Vuelve a través de tus sentidos"], d: "90 s",  k: "tool" },
    movement:   { n: ["Movement Break", "Pausa de movimiento"],          s: ["Get up, shake it off", "Levántate, sacúdelo"],               d: "60 s",  k: "tool" },
    presspush:  { n: ["Press & Push", "Empuja y presiona"],              s: ["Strong, steady input", "Estímulo firme y constante"],             d: "30 s",  k: "tool" },
    tappad:     { n: ["Tap Pad", "Panel de ritmo"],                      s: ["Tap a rhythm to steady yourself", "Marca un ritmo para estabilizarte"], d: "60 s",  k: "tool" },
    safeplace:  { n: ["Safe Place", "Lugar seguro"],                     s: ["A guided visualization", "Una visualización guiada"],             d: "2 min", k: "tool" },
    pmr:        { n: ["Body Scan", "Escaneo corporal"],                  s: ["Tense and release, head to toe", "Tensa y suelta, de pies a cabeza"],  d: "2 min", k: "tool" },
    bilateral:  { n: ["Bilateral Tapping", "Toques bilaterales"],        s: ["The butterfly hug", "El abrazo de mariposa"],                          d: "60 s",  k: "tool" },
    calmjar:    { n: ["Calm Down Jar", "Frasco de la calma"],            s: ["Shake it, watch it settle", "Agítalo y míralo asentarse"],   d: "1 min", k: "tool" },
    fidget:     { n: ["Visual Fidget", "Fidget visual"],                 s: ["Something for your eyes and hands", "Algo para tus ojos y manos"],     d: "1 min", k: "tool" },
    coldwater:  { n: ["Cool-Water Reset", "Reinicio con agua fría"],s: ["A guide to a cool reset", "Una guía para un reinicio fresco"],    d: "1 min", k: "tool" },
    emotion:    { n: ["Emotion Wheel", "Rueda de emociones"],            s: ["Name it to tame it", "Nómbralo para calmarlo"],                   d: "1 min", k: "tool" },
    feelwheel:  { n: ["Feelings Wheel", "Rueda de sentimientos"],        s: ["Tap a feeling, hear it named", "Toca una emoción y escúchala"], d: "1 min", k: "tool" },
    bodymap:    { n: ["Body Map", "Mapa del cuerpo"],                    s: ["Where do you notice something?", "¿Dónde notas algo?"],      d: "1 min", k: "tool" },
    beyondfine: { n: ["Beyond “Fine”", "Más allá de “bien”"], s: ["Questions that get past “how was your day?”", "Preguntas que van más allá de “¿cómo te fue?”"], d: "", k: "tool" },
    tellsomeone:{ n: ["I need to tell someone", "Necesito decirle a alguien"], s: ["Ready-made words to show or say", "Frases listas para mostrar o decir"], d: "30 s", k: "quiet" },
    quiet:      { n: ["Quiet Space", "Espacio tranquilo"],               s: ["Less input, more room", "Menos estímulo, más espacio"],      d: "",      k: "station" },
    justlisten: { n: ["Just listen", "Solo escuchar"],                   s: ["Find the sounds already there", "Encuentra los sonidos que ya están ahí"], d: "1 min", k: "tool" },
    rainbow:    { n: ["Rainbow Breathing", "Respiración arcoíris"], s: ["Breathe in every color", "Respira cada color"],         d: "90 s",  k: "tool" },
    pecscards:  { n: ["PECS Cards", "Tarjetas PECS"],                    s: ["Build it with pictures — no words needed", "Constrúyelo con imágenes — sin palabras"], d: "", k: "pecs" }
  };
  function cardBtn(id) {
    var c = CARDS[id]; if (!c) return "";
    return '<button type="button" class="ttx-opt" data-act="' + c.k + '" data-id="' + (c.k === "cat" ? id : (c.k === "tool" || c.k === "quiet" ? id : "")) + '">'
      + '<span class="ttx-opt-main"><b>' + esc(T(c.n)) + '</b><span>' + esc(T(c.s)) + '</span></span>'
      + (c.d ? '<span class="ttx-opt-d">' + c.d + '</span>' : '')
      + '</button>';
  }
  function bindCards(root) {
    root.querySelectorAll(".ttx-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-act"), id = b.getAttribute("data-id");
        if (k === "tool" && id) { removeFb(); window.toolOpen && window.toolOpen(id); }
        else act(k, id);
      });
    });
  }

  /* ─── Grace Lens lines — one quiet sentence, never a paragraph ────────── */
  var LENS = {
    move:    ["Your body is allowed to move.", "Tu cuerpo tiene permiso de moverse."],
    breathe: ["We aren’t trying to make the feeling disappear. We’re making a little room around it.", "No intentamos que el sentimiento desaparezca. Le hacemos un poco de espacio."],
    ground:  ["Wherever you went, you’re allowed to come back slowly.", "A donde hayas ido, puedes volver despacio."],
    feel:    ["You don’t have to name it to notice it.", "No tienes que nombrarlo para notarlo."],
    focus:   ["Coming back is allowed to be gradual.", "Volver puede ser gradual."],
    connect: ["You don’t need perfect words to deserve support.", "No necesitas palabras perfectas para merecer apoyo."],
    quiet:   ["Needing less input isn’t doing something wrong.", "Necesitar menos estímulo no es hacer algo mal."],
    touch:   ["If this kind of input feels good to you, that’s information.", "Si este tipo de estímulo te sienta bien, eso es información."]
  };
  function lensHtml(key) {
    return LENS[key] ? '<p class="ttx-lens">🕊️ ' + esc(T(LENS[key])) + '</p>' : "";
  }

  /* ─── Pathway modals: every door opens a ROOM (build .30cg) ────────────────
     Jimmy, on the doors that used to expand the catalog in place: "Some of
     the doors don't open to another room." Real — openCatalog un-collapses a
     grid two screens below the doors, which reads as nothing happening. So
     Breathe and Ground got panels of their own (Move reuses the sensemove
     panel), each with a see-all link into the full catalog for whoever wants
     the grid. */
  var PATHS = {
    breathe: {
      icon: "🫁",
      t: ["Breathe", "Respirar"],
      sub: ["Slow is a skill. Pick a rhythm to follow.", "Ir despacio es una habilidad. Elige un ritmo para seguir."],
      opts: ["breathing", "boxbreath", "rainbow", "take5"],
      all: ["breathe", ["See all breathing tools", "Ver todas las herramientas para respirar"]]
    },
    ground: {
      icon: "🌿",
      t: ["Ground", "Volver al ahora"],
      sub: ["Come back to where you are, one sense at a time.", "Vuelve a donde estás, un sentido a la vez."],
      opts: ["grounding", "safeplace", "bilateral", "calmjar"],
      all: ["ground", ["See all grounding tools", "Ver todas las herramientas de anclaje"]]
    },
    feel: {
      icon: "🫀",
      t: ["Feel", "Sentir"],
      sub: ["You don’t have to know what it is yet. Start by noticing.", "No tienes que saber qué es todavía. Empieza por notar."],
      opts: ["bodymap", "emotion", "feelwheel"]
    },
    focus: {
      icon: "🎯",
      t: ["Focus", "Enfocar"],
      sub: ["A short reset before returning to what’s next.", "Un breve reinicio antes de volver a lo que sigue."],
      opts: ["take5", "boxbreath", "grounding"]
    },
    connect: {
      icon: "🫂",
      t: ["Connect", "Conectar"],
      sub: ["Regulation doesn’t have to happen alone.", "La regulación no tiene que ocurrir a solas."],
      opts: ["tellsomeone", "pecscards", "beyondfine"]
    }
  };
  function pathBuilder(key) {
    return function () {
      var p = PATHS[key];
      return '<div class="tool-modal-icon">' + p.icon + '</div>'
        + '<div class="tool-modal-title">' + esc(T(p.t)) + '</div>'
        + '<div class="tool-modal-sub">' + esc(T(p.sub)) + '</div>'
        + '<div class="ttx-opts" id="ttxPath">' + p.opts.map(cardBtn).join("") + '</div>'
        + lensHtml(key)
        + (p.all ? '<button type="button" class="ttx-back" id="ttxPathAll" data-cat="' + p.all[0] + '">' + esc(T(p.all[1])) + ' →</button>' : '');
    };
  }
  function pathInit() {
    var r = document.getElementById("ttxPath");
    if (r) bindCards(r);
    var a = document.getElementById("ttxPathAll");
    if (a) a.addEventListener("click", function () { act("cat", a.getAttribute("data-cat")); });
  }

  /* ─── The Not-Sure chooser ────────────────────────────────────────────────
     Three tiny questions, then one to three possibilities. The language is
     "might be worth trying" — never "this is what you need". */
  var NS = { input: null, sounds: null, energy: null, step: 1 };
  function nsBuilder() {
    NS = { input: null, sounds: null, energy: null, step: 1 };
    return '<div class="tool-modal-icon">🧭</div>'
      + '<div class="tool-modal-title">' + esc(T(["Help me choose", "Ayúdame a elegir"])) + '</div>'
      + '<div class="tool-modal-sub">' + esc(T(["Not knowing what you need is a fine place to start.", "No saber lo que necesitas es un buen punto de partida."])) + '</div>'
      + '<div id="ttxNs"></div>';
  }
  function nsQ(q, opts) {
    return '<p class="ttx-q">' + esc(T(q)) + '</p>'
      + '<div class="ttx-grid">' + opts.map(function (o) {
          return '<button type="button" class="ttx-choice" data-v="' + o[0] + '">' + esc(T(o[1])) + '</button>';
        }).join("") + '</div>'
      + (NS.step > 1 ? '<button type="button" class="ttx-back" id="ttxNsBack">← ' + esc(T(["Back", "Atrás"])) + '</button>' : '');
  }
  function nsSuggest() {
    var bySound = {
      move:    ["movement", "presspush", "tappad"],
      still:   ["safeplace", "pmr", "calmjar"],
      breathe: ["breathing", "boxbreath", "take5"],
      touch:   ["fidget", "calmjar", "bilateral"],
      listen:  ["justlisten", "quiet", "tappad"],
      look:    ["calmjar", "fidget", "safeplace"],
      talk:    ["tellsomeone", "feelwheel", "beyondfine"]
    };
    var out = (bySound[NS.sounds] || []).slice();
    if (!out.length) {
      if (NS.energy === "lot" || NS.energy === "waytoo") out = ["presspush", "movement", "grounding"];
      else if (NS.energy === "vlittle") out = ["breathing", "safeplace", "quiet"];
      else out = ["grounding", "breathing", "quiet"];
    }
    if (NS.input === "less" && out.indexOf("quiet") < 0) out.unshift("quiet");
    if ((NS.energy === "lot" || NS.energy === "waytoo") && out.indexOf("presspush") < 0 && out.indexOf("movement") < 0) out.unshift("presspush");
    if (NS.energy === "vlittle") out = out.filter(function (id) { return id !== "movement" && id !== "presspush"; });
    if (!out.length) out = ["breathing", "quiet"];
    return out.slice(0, 3);
  }
  function nsRender() {
    var r = document.getElementById("ttxNs"); if (!r) return;
    if (NS.step === 1) {
      r.innerHTML = nsQ(["Do you want more input or less input?", "¿Quieres más estímulo o menos?"], [
        ["more", ["More", "Más"]], ["less", ["Less", "Menos"]], ["ns", ["Not sure", "No sé"]]
      ]);
    } else if (NS.step === 2) {
      r.innerHTML = nsQ(["What sounds best?", "¿Qué te llama más?"], [
        ["move", ["Move", "Moverme"]], ["still", ["Be still", "Quedarme quieto"]],
        ["breathe", ["Breathe", "Respirar"]], ["touch", ["Touch something", "Tocar algo"]],
        ["listen", ["Listen", "Escuchar"]], ["look", ["Look", "Mirar"]],
        ["talk", ["Talk", "Hablar"]], ["dk", ["I don’t know", "No lo sé"]]
      ]);
    } else if (NS.step === 3) {
      r.innerHTML = nsQ(["How much energy is in your body?", "¿Cuánta energía hay en tu cuerpo?"], [
        ["vlittle", ["Very little", "Muy poca"]], ["some", ["Some", "Algo"]],
        ["lot", ["A lot", "Mucha"]], ["waytoo", ["Way too much", "Demasiada"]],
        ["ns", ["Not sure", "No sé"]]
      ]);
    } else {
      var picks = nsSuggest();
      r.innerHTML = '<p class="ttx-q">' + esc(T(["Based on what you chose, these might be worth trying.", "Según lo que elegiste, quizá valga la pena probar esto."])) + '</p>'
        + '<div class="ttx-opts">' + picks.map(cardBtn).join("") + '</div>'
        + '<p class="ttx-note">' + esc(T(["If one isn’t for you, that’s information too — try something else.", "Si una no es para ti, eso también es información — prueba otra cosa."])) + '</p>'
        + '<button type="button" class="ttx-back" id="ttxNsBack">← ' + esc(T(["Back", "Atrás"])) + '</button>'
        + '<button type="button" class="ttx-back" id="ttxNsAll">' + esc(T(["Show me everything instead", "Mejor muéstrame todo"])) + '</button>';
      bindCards(r);
    }
    r.querySelectorAll(".ttx-choice").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-v");
        if (NS.step === 1) NS.input = v;
        else if (NS.step === 2) NS.sounds = (v === "dk" ? null : v);
        else if (NS.step === 3) NS.energy = (v === "ns" ? null : v);
        NS.step++;
        nsRender();
      });
    });
    var back = document.getElementById("ttxNsBack");
    if (back) back.addEventListener("click", function () { NS.step = Math.max(1, NS.step - 1); nsRender(); });
    var all = document.getElementById("ttxNsAll");
    if (all) all.addEventListener("click", function () { closeModal(); openCatalog("all"); });
  }

  /* ─── Press & Push — proprioceptive input, guided, never forced ───────── */
  var PP = {
    wall:    { n: ["Wall push", "Empuja la pared"], steps: [
                 [["Find a wall. Both palms flat against it.", "Busca una pared. Pon las dos palmas sobre ella."], 5],
                 [["Push. Steady and strong — the wall can take it.", "Empuja. Firme y fuerte — la pared aguanta."], 10],
                 [["Rest your arms.", "Descansa los brazos."], 5],
                 [["One more push. Slow and strong.", "Un empujón más. Lento y fuerte."], 10]] },
    palms:   { n: ["Palm press", "Palmas juntas"], steps: [
                 [["Press your palms together in front of you.", "Junta las palmas frente a ti y presiona."], 10],
                 [["Release. Let your hands rest.", "Suelta. Deja descansar las manos."], 5],
                 [["Press again — steady.", "Presiona otra vez — constante."], 10]] },
    squeeze: { n: ["Hand squeeze", "Aprieta las manos"], steps: [
                 [["Make fists. Squeeze tight…", "Cierra los puños. Aprieta fuerte…"], 5],
                 [["…and let go.", "…y suelta."], 3],
                 [["Squeeze again…", "Aprieta otra vez…"], 5],
                 [["…and let go.", "…y suelta."], 3]] },
    feet:    { n: ["Ground your feet", "Pies al suelo"], steps: [
                 [["Both feet flat. Press them into the floor.", "Los dos pies planos. Presíonalos contra el suelo."], 10],
                 [["Notice the floor pressing back.", "Nota cómo el suelo responde."], 5]] },
    stretch: { n: ["Slow stretch", "Estiramiento lento"], steps: [
                 [["Reach both arms up — slowly.", "Estira los brazos hacia arriba — despacio."], 8],
                 [["Let them float back down.", "Déjalos bajar flotando."], 5]] }
  };
  var _ppTimer = null, _ppLeft = 0, _ppPaused = false;
  function ppStop() { if (_ppTimer) { clearInterval(_ppTimer); _ppTimer = null; } }
  function ppBuilder() {
    return '<div class="tool-modal-icon">🫂</div>'
      + '<div class="tool-modal-title">' + esc(T(["Press & Push", "Empuja y presiona"])) + '</div>'
      + '<div class="tool-modal-sub">' + esc(T(["Strong, steady input. If your body likes pressure or resistance, try one — you can stop any time.", "Estímulo firme y constante. Si a tu cuerpo le gusta la presión o la resistencia, prueba una — puedes parar cuando quieras."])) + '</div>'
      + '<div id="ttxPp"></div>';
  }
  function ppMenu() {
    ppStop();
    var r = document.getElementById("ttxPp"); if (!r) return;
    r.innerHTML = '<p class="ttx-q">' + esc(T(["Want more pressure or more movement?", "¿Quieres más presión o más movimiento?"])) + '</p>'
      + '<div class="ttx-grid">'
      + Object.keys(PP).map(function (k) {
          return '<button type="button" class="ttx-choice" data-pp="' + k + '">' + esc(T(PP[k].n)) + '</button>';
        }).join("")
      + '<button type="button" class="ttx-choice" data-pp="__move">' + esc(T(["More movement →", "Más movimiento →"])) + '</button>'
      + '</div>' + lensHtml("touch");
    r.querySelectorAll(".ttx-choice").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-pp");
        if (k === "__move") { removeFb(); window.toolOpen && window.toolOpen("movement"); return; }
        ppRun(k, 0);
      });
    });
  }
  function ppRun(key, idx) {
    ppStop();
    var r = document.getElementById("ttxPp"); if (!r) return;
    var sc = PP[key];
    if (idx >= sc.steps.length) {
      r.innerHTML = '<p class="ttx-big">' + esc(T(["Notice: does anything feel different?", "Nota: ¿algo se siente distinto?"])) + '</p>'
        + '<p class="ttx-note">' + esc(T(["Nothing has to be different. Noticing is the practice.", "Nada tiene que ser distinto. Notar ya es la práctica."])) + '</p>'
        + '<div class="ttx-grid"><button type="button" class="ttx-choice" id="ppAgain">' + esc(T(["Again", "Otra vez"])) + '</button>'
        + '<button type="button" class="ttx-choice" id="ppBack">' + esc(T(["Other options", "Otras opciones"])) + '</button></div>';
      var a = document.getElementById("ppAgain"); if (a) a.addEventListener("click", function () { ppRun(key, 0); });
      var k = document.getElementById("ppBack"); if (k) k.addEventListener("click", ppMenu);
      return;
    }
    var st = sc.steps[idx];
    _ppLeft = st[1]; _ppPaused = false;
    r.innerHTML = '<p class="ttx-big">' + esc(T(st[0])) + '</p>'
      + '<div class="ttx-count" id="ppCount">' + _ppLeft + '</div>'
      + '<div class="ttx-grid">'
      + '<button type="button" class="ttx-choice" id="ppPause">' + esc(T(["Pause", "Pausa"])) + '</button>'
      + '<button type="button" class="ttx-choice" id="ppStopB">' + esc(T(["Stop", "Parar"])) + '</button>'
      + '</div>';
    var count = document.getElementById("ppCount");
    _ppTimer = setInterval(function () {
      if (_ppPaused) return;
      _ppLeft--;
      if (count) count.textContent = Math.max(0, _ppLeft);
      if (_ppLeft <= 0) { ppStop(); ppRun(key, idx + 1); }
    }, 1000);
    var p = document.getElementById("ppPause");
    if (p) p.addEventListener("click", function () {
      _ppPaused = !_ppPaused;
      p.textContent = _ppPaused ? T(["Resume", "Seguir"]) : T(["Pause", "Pausa"]);
    });
    var s = document.getElementById("ppStopB"); if (s) s.addEventListener("click", ppMenu);
  }

  /* ─── Body Map — noticing before naming ───────────────────────────────── */
  var BM_PARTS = {
    head:      ["your head", "tu cabeza"],
    jaw:       ["your jaw", "tu mandíbula"],
    shoulders: ["your shoulders", "tus hombros"],
    chest:     ["your chest", "tu pecho"],
    stomach:   ["your stomach", "tu estómago"],
    hands:     ["your hands", "tus manos"],
    legs:      ["your legs", "tus piernas"]
  };
  function bmBuilder() {
    return '<div class="tool-modal-icon">🧍</div>'
      + '<div class="tool-modal-title">' + esc(T(["Where do you notice something?", "¿Dónde notas algo?"])) + '</div>'
      + '<div class="tool-modal-sub">' + esc(T(["Tap the body. You don’t have to name the feeling yet.", "Toca el cuerpo. No tienes que nombrar lo que sientes todavía."])) + '</div>'
      + '<svg class="ttx-bm" viewBox="0 0 200 340" role="group" aria-label="' + esc(T(["Body map", "Mapa del cuerpo"])) + '">'
      +   '<circle  data-part="head"      cx="100" cy="42"  r="26"/>'
      +   '<rect    data-part="jaw"       x="88"  y="62"  width="24" height="12" rx="6"/>'
      +   '<rect    data-part="shoulders" x="52"  y="82"  width="96" height="18" rx="9"/>'
      +   '<rect    data-part="chest"     x="64"  y="104" width="72" height="44" rx="12"/>'
      +   '<rect    data-part="stomach"   x="68"  y="152" width="64" height="40" rx="12"/>'
      +   '<rect    data-part="hands"     x="28"  y="100" width="18" height="86" rx="9"/>'
      +   '<rect    data-part="hands"     x="154" y="100" width="18" height="86" rx="9"/>'
      +   '<rect    data-part="legs"      x="68"  y="198" width="26" height="112" rx="12"/>'
      +   '<rect    data-part="legs"      x="106" y="198" width="26" height="112" rx="12"/>'
      + '</svg>'
      + '<div class="ttx-grid ttx-bm-extra">'
      +   '<button type="button" class="ttx-choice" data-bm="everywhere">' + esc(T(["Everywhere", "En todas partes"])) + '</button>'
      +   '<button type="button" class="ttx-choice" data-bm="nowhere">' + esc(T(["Nowhere", "En ninguna"])) + '</button>'
      +   '<button type="button" class="ttx-choice" data-bm="dk">' + esc(T(["I don’t know", "No lo sé"])) + '</button>'
      + '</div>'
      + '<div id="ttxBmOut" aria-live="polite"></div>';
  }
  function bmRespond(html) { var o = document.getElementById("ttxBmOut"); if (o) { o.innerHTML = html; o.scrollIntoView({ block: "nearest" }); } }
  function bmNextBtns() {
    return '<div class="ttx-grid">'
      + '<button type="button" class="ttx-choice" data-bmn="notice">' + esc(T(["Just notice it", "Solo notarlo"])) + '</button>'
      + '<button type="button" class="ttx-choice" data-bmn="name">' + esc(T(["Name it", "Nombrarlo"])) + '</button>'
      + '<button type="button" class="ttx-choice" data-bmn="tool">' + esc(T(["Find a tool", "Buscar una herramienta"])) + '</button>'
      + '</div>';
  }
  function bmBind() {
    var svg = document.querySelector(".ttx-bm"); if (!svg) return;
    svg.querySelectorAll("[data-part]").forEach(function (el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", T(BM_PARTS[el.getAttribute("data-part")]));
      function pick() {
        svg.querySelectorAll("[data-part]").forEach(function (x) { x.classList.remove("on"); });
        svg.querySelectorAll('[data-part="' + el.getAttribute("data-part") + '"]').forEach(function (x) { x.classList.add("on"); });
        bmRespond('<p class="ttx-big">' + esc(T(["You noticed something in ", "Notaste algo en "])) + esc(T(BM_PARTS[el.getAttribute("data-part")])) + '.</p>'
          + '<p class="ttx-note">' + esc(T(["That’s enough for now. You don’t have to name it.", "Con eso basta por ahora. No tienes que nombrarlo."])) + '</p>' + bmNextBtns());
        bmNextBind();
      }
      el.addEventListener("click", pick);
      el.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(); } });
    });
    document.querySelectorAll(".ttx-bm-extra .ttx-choice").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-bm");
        if (v === "everywhere") {
          bmRespond('<p class="ttx-big">' + esc(T(["That’s real. When it’s everywhere, less input sometimes helps.", "Es real. Cuando está en todas partes, a veces ayuda menos estímulo."])) + '</p>'
            + '<div class="ttx-opts">' + cardBtn("quiet") + cardBtn("grounding") + '</div>');
          bindCards(document.getElementById("ttxBmOut"));
        } else if (v === "nowhere") {
          bmRespond('<p class="ttx-big">' + esc(T(["That’s okay. You don’t have to feel something to be here.", "Está bien. No tienes que sentir algo para estar aquí."])) + '</p>' + bmNextBtns());
          bmNextBind();
        } else {
          bmRespond('<p class="ttx-big">' + esc(T(["Not knowing is a fine place to start.", "No saberlo es un buen punto de partida."])) + '</p>'
            + '<div class="ttx-opts">' + cardBtn("grounding") + '</div>'
            + '<button type="button" class="ttx-back" data-bmn="tool">' + esc(T(["Help me choose", "Ayúdame a elegir"])) + '</button>');
          bindCards(document.getElementById("ttxBmOut"));
          bmNextBind();
        }
      });
    });
  }
  function bmNextBind() {
    document.querySelectorAll("[data-bmn]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-bmn");
        if (v === "notice") {
          bmRespond('<p class="ttx-note">' + esc(T(["Put a hand there, if that feels okay. Is it big or small? Still or moving? That’s all — noticing is enough.", "Pon una mano ahí, si te parece bien. ¿Es grande o pequeño? ¿Quieto o en movimiento? Eso es todo — notar ya es suficiente."])) + '</p>');
        } else if (v === "name") { removeFb(); window.toolOpen && window.toolOpen("feelwheel"); }
        else if (v === "tool") { quietOpen("notsure"); }
      });
    });
  }

  /* ─── "I need to tell someone" — regulation through communication ─────── */
  var TS_MSGS = [
    ["I need a break.", "Necesito una pausa."],
    ["It’s too loud.", "Hay demasiado ruido."],
    ["I need less talking.", "Necesito menos conversación."],
    ["I need movement.", "Necesito moverme."],
    ["I need help.", "Necesito ayuda."],
    ["I don’t know what’s wrong.", "No sé qué me pasa."],
    ["I need someone nearby.", "Necesito a alguien cerca."],
    ["I need space.", "Necesito espacio."],
    ["I need somewhere quieter.", "Necesito un lugar más tranquilo."]
  ];
  function tsBuilder() {
    return '<div class="tool-modal-icon">💬</div>'
      + '<div class="tool-modal-title">' + esc(T(["I need to tell someone", "Necesito decirle a alguien"])) + '</div>'
      + '<div class="tool-modal-sub">' + esc(T(["Pick the words. Then show them, say them, or print them — whatever works.", "Elige las palabras. Luego muéstralas, dilas o imprímelas — lo que funcione."])) + '</div>'
      + '<div id="ttxTs"></div>' + lensHtml("connect");
  }
  function tsMenu() {
    var r = document.getElementById("ttxTs"); if (!r) return;
    r.innerHTML = '<div class="ttx-grid ttx-ts-grid">'
      + TS_MSGS.map(function (m, i) { return '<button type="button" class="ttx-choice" data-ts="' + i + '">' + esc(T(m)) + '</button>'; }).join("")
      + '</div>'
      + '<button type="button" class="ttx-back" id="ttxTsPecs">' + esc(T(["Build it with pictures instead → PECS cards", "Mejor constrúyelo con imágenes → tarjetas PECS"])) + '</button>';
    r.querySelectorAll("[data-ts]").forEach(function (b) {
      b.addEventListener("click", function () { tsShow(parseInt(b.getAttribute("data-ts"), 10)); });
    });
    var p = document.getElementById("ttxTsPecs"); if (p) p.addEventListener("click", function () { act("pecs"); });
  }
  function tsShow(i) {
    var r = document.getElementById("ttxTs"); if (!r) return;
    var m = TS_MSGS[i];
    r.innerHTML = '<div class="ttx-ts-big" role="img" aria-label="' + esc(T(m)) + '">' + esc(T(m))
      + '<span class="ttx-ts-alt">' + esc(es() ? m[0] : m[1]) + '</span></div>'
      + '<div class="ttx-grid">'
      + '<button type="button" class="ttx-choice" id="tsSpeak">🔊 ' + esc(T(["Say it out loud", "Decirlo en voz alta"])) + '</button>'
      + '<button type="button" class="ttx-choice" id="tsCopy">' + esc(T(["Copy", "Copiar"])) + '</button>'
      + '<button type="button" class="ttx-choice" id="tsPrint">🖨 ' + esc(T(["Print", "Imprimir"])) + '</button>'
      + '<button type="button" class="ttx-choice" id="tsBack">← ' + esc(T(["Other words", "Otras frases"])) + '</button>'
      + '</div>'
      + '<p class="ttx-note">' + esc(T(["Holding the screen up counts as telling someone.", "Mostrar la pantalla también cuenta como decirlo."])) + '</p>';
    var sp = document.getElementById("tsSpeak");
    if (sp) sp.addEventListener("click", function () {
      try {
        var u = new SpeechSynthesisUtterance(T(m));
        u.lang = es() ? "es-ES" : "en-US";
        window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      } catch (e) {}
    });
    var cp = document.getElementById("tsCopy");
    if (cp) cp.addEventListener("click", function () {
      try { navigator.clipboard.writeText(T(m)); cp.textContent = "✓ " + T(["Copied", "Copiado"]); } catch (e) {}
    });
    var pr = document.getElementById("tsPrint");
    if (pr) pr.addEventListener("click", function () {
      /* Print from a DEDICATED WINDOW — the pattern every other print on this
         site converged on after three in-place repairs each proved real and
         insufficient. */
      try {
        var w = window.open("", "_blank", "width=700,height=500");
        if (!w) return;
        w.document.write('<!doctype html><title>Architecture of Grace</title>'
          + '<body style="font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;height:90vh;margin:0;">'
          + '<div style="text-align:center;"><div style="font-size:44px;font-weight:700;color:#0A1E33;max-width:12em;line-height:1.25;">' + esc(T(m)) + '</div>'
          + '<div style="font-size:20px;color:#5b6478;margin-top:18px;">' + esc(es() ? m[0] : m[1]) + '</div></div></body>');
        w.document.close(); w.focus();
        setTimeout(function () { try { w.print(); } catch (e) {} }, 250);
      } catch (e) {}
    });
    var bk = document.getElementById("tsBack"); if (bk) bk.addEventListener("click", tsMenu);
  }

  /* ─── Sensory Toolkit modals: Sound · Light & visual · Touch ──────────────
     Realistic environmental suggestions. The site does not pretend to control
     headphones, volume, or the room — it says you are allowed to ask. */
  function senseBuilder(key) {
    return function () {
      var t, sub, rows;
      if (key === "sensesound") {
        t = ["Sound", "Sonido"];
        sub = ["When sound feels like too much — none of this is doing it wrong.", "Cuando el sonido es demasiado — nada de esto es hacer algo mal."];
        rows = '<div class="ttx-opts" id="ttxSense">'
          + '<button type="button" class="ttx-opt" data-s="tell"><span class="ttx-opt-main"><b>' + esc(T(["Ask for less talking", "Pide menos conversación"])) + '</b><span>' + esc(T(["Ready-made words to show or say", "Frases listas para mostrar o decir"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="station"><span class="ttx-opt-main"><b>' + esc(T(["Open the Quiet Space", "Abre el Espacio tranquilo"])) + '</b><span>' + esc(T(["One screen, less of everything", "Una pantalla, menos de todo"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="tappad"><span class="ttx-opt-main"><b>' + esc(T(["A steady rhythm instead", "Mejor un ritmo constante"])) + '</b><span>' + esc(T(["Predictable sound you control", "Sonido predecible que tú controlas"])) + '</span></span></button>'
          + '<div class="ttx-row">' + esc(T(["Noise-reducing headphones, if you have them — or hands over ears. Both are allowed.", "Audífonos que reducen el ruido, si los tienes — o las manos sobre los oídos. Ambos están permitidos."])) + '</div>'
          + '<div class="ttx-row">' + esc(T(["This page can’t quiet the room — but you’re allowed to ask for somewhere quieter.", "Esta página no puede silenciar el salón — pero puedes pedir un lugar más tranquilo."])) + '</div>'
          + '</div>' + lensHtml("quiet");
      } else if (key === "sensesight") {
        t = ["Light & visual", "Luz y vista"];
        sub = ["When there is too much to look at, looking at less is a real tool.", "Cuando hay demasiado que mirar, mirar menos es una herramienta real."];
        rows = '<div class="ttx-opts" id="ttxSense">'
          + '<button type="button" class="ttx-opt" data-s="lowstim"><span class="ttx-opt-main"><b>' + esc(T(["Turn on Low-stimulation mode", "Activa el modo de baja estimulación"])) + '</b><span>' + esc(T(["This page gets quieter too", "Esta página también se calma"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="calmjar"><span class="ttx-opt-main"><b>' + esc(T(["Watch one thing settle", "Mira una sola cosa asentarse"])) + '</b><span>' + esc(T(["The calm jar — one thing to look at", "El frasco de la calma — una sola cosa que mirar"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="station"><span class="ttx-opt-main"><b>' + esc(T(["Open the Quiet Space", "Abre el Espacio tranquilo"])) + '</b><span>' + esc(T(["One screen, less of everything", "Una pantalla, menos de todo"])) + '</span></span></button>'
          + '<div class="ttx-row">' + esc(T(["Rest your eyes — closed, or soft focus on one fixed point, for about twenty seconds.", "Descansa los ojos — cerrados, o con la mirada suave en un punto fijo, unos veinte segundos."])) + '</div>'
          + '</div>' + lensHtml("quiet");
      } else if (key === "sensemove") {
        /* Added after Jimmy clicked Movement and "nothing opened" (2026-08-30):
           this card used to expand and filter the catalog two screens below —
           real, but invisible from here. Every sensory card opens a panel now. */
        t = ["Movement", "Movimiento"];
        sub = ["Not every body settles by being still. Moving IS regulating.", "No todos los cuerpos se calman quedándose quietos. Moverse TAMBIÉN es regularse."];
        rows = '<div class="ttx-opts" id="ttxSense">'
          + '<button type="button" class="ttx-opt" data-s="movement"><span class="ttx-opt-main"><b>' + esc(T(["Shake it out", "Sacúdelo"])) + '</b><span>' + esc(T(["A short, timed movement break", "Una pausa breve de movimiento"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="presspush"><span class="ttx-opt-main"><b>' + esc(T(["Strong and slow", "Fuerte y lento"])) + '</b><span>' + esc(T(["Press & push — resistance instead of speed", "Empuja y presiona — resistencia en vez de velocidad"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="tappad"><span class="ttx-opt-main"><b>' + esc(T(["Move to a rhythm", "Muévete con un ritmo"])) + '</b><span>' + esc(T(["Tap a steady beat", "Marca un pulso constante"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="animalyoga"><span class="ttx-opt-main"><b>' + esc(T(["Stretch and pose", "Estírate y posa"])) + '</b><span>' + esc(T(["Simple grounding poses", "Posturas sencillas para conectar"])) + '</span></span></button>'
          + '<div class="ttx-row">' + esc(T(["Walking counts too — changing rooms is regulation, if you’re allowed to right now.", "Caminar también cuenta — cambiar de lugar es regularse, si te lo permiten en este momento."])) + '</div>'
          + '<div class="ttx-row">' + esc(T(["Big movement or small movement — both count. So does slow.", "Movimiento grande o pequeño — ambos cuentan. Lento también."])) + '</div>'
          + '</div>' + lensHtml("move")
          + '<button type="button" class="ttx-back" data-s="__cat_move">' + esc(T(["See all movement tools", "Ver todas las herramientas de movimiento"])) + ' →</button>';
      } else {
        t = ["Touch", "Tacto"];
        sub = ["If this kind of input feels good to you…", "Si este tipo de estímulo te sienta bien…"];
        rows = '<div class="ttx-opts" id="ttxSense">'
          + '<button type="button" class="ttx-opt" data-s="presspush"><span class="ttx-opt-main"><b>' + esc(T(["Press & push", "Empuja y presiona"])) + '</b><span>' + esc(T(["Palms, wall, fists — strong steady input", "Palmas, pared, puños — estímulo firme"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="fidget"><span class="ttx-opt-main"><b>' + esc(T(["A visual fidget", "Un fidget visual"])) + '</b><span>' + esc(T(["Something for your eyes and hands", "Algo para tus ojos y manos"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="take5"><span class="ttx-opt-main"><b>' + esc(T(["Trace your hand", "Traza tu mano"])) + '</b><span>' + esc(T(["Take 5 — breath by breath", "Toma 5 — respiro a respiro"])) + '</span></span></button>'
          + '<button type="button" class="ttx-opt" data-s="coldwater"><span class="ttx-opt-main"><b>' + esc(T(["Hold something cool", "Sostén algo fresco"])) + '</b><span>' + esc(T(["The cool-water reset guide", "La guía del reinicio con agua"])) + '</span></span></button>'
          + '<div class="ttx-row">' + esc(T(["A texture in your pocket, a smooth stone, the seam of a sleeve — whatever your hands already reach for.", "Una textura en el bolsillo, una piedra lisa, la costura de una manga — lo que tus manos ya buscan."])) + '</div>'
          + '</div>' + lensHtml("touch");
      }
      return '<div class="tool-modal-icon">' + (key === "sensesound" ? "👂" : key === "sensesight" ? "👁️" : key === "sensemove" ? "🏃" : "✋") + '</div>'
        + '<div class="tool-modal-title">' + esc(T(t)) + '</div>'
        + '<div class="tool-modal-sub">' + esc(T(sub)) + '</div>' + rows;
    };
  }
  function senseInit() {
    var r = document.getElementById("toolModalBody"); if (!r) return;
    r.querySelectorAll("[data-s]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-s");
        if (v === "tell") quietOpen("tellsomeone");
        else if (v === "station") openStation();
        else if (v === "lowstim") act("lowstim");
        else if (v.indexOf("__cat_") === 0) act("cat", v.slice(6));
        else { removeFb(); window.toolOpen && window.toolOpen(v); }
      });
    });
  }

  /* ─── Just listen — guided listening, no audio of its own ─────────────────
     Honors the no-sound default: the room already has sounds; this only asks
     you to find them. Slow steps, no timer, Back always available. */
  var JL_STEPS = [
    ["Get comfortable. You can close your eyes, or let them rest low.", "Ponte cómodo/a. Puedes cerrar los ojos o dejar la mirada baja."],
    ["Find the farthest-away sound you can hear. Stay with it a moment.", "Encuentra el sonido más lejano que puedas oír. Quédate con él un momento."],
    ["Now find the closest sound. It might be your own breath.", "Ahora encuentra el sonido más cercano. Puede ser tu propia respiración."],
    ["That’s it. You just listened. The room can stay exactly as it is.", "Eso es todo. Solo escuchaste. El lugar puede quedarse tal como está."]
  ];
  function jlBuilder() {
    return '<div class="tool-modal-icon">👂</div>'
      + '<div class="tool-modal-title">' + esc(T(["Just listen", "Solo escuchar"])) + '</div>'
      + '<div class="tool-modal-sub">' + esc(T(["No sound comes from this screen. The sounds are already there.", "Esta pantalla no emite sonido. Los sonidos ya están ahí."])) + '</div>'
      + '<div id="ttxJl"></div>';
  }
  function jlRender(i) {
    var r = document.getElementById("ttxJl"); if (!r) return;
    i = i || 0;
    r.innerHTML = '<p class="ttx-big">' + esc(T(JL_STEPS[i])) + '</p>'
      + '<div class="ttx-grid">'
      + (i > 0 ? '<button type="button" class="ttx-choice" id="jlPrev">← ' + esc(T(["Back", "Atrás"])) + '</button>' : '')
      + (i < JL_STEPS.length - 1
          ? '<button type="button" class="ttx-choice" id="jlNext">' + esc(T(["Next", "Siguiente"])) + ' →</button>'
          : '<button type="button" class="ttx-choice" id="jlDone">' + esc(T(["Done", "Listo"])) + '</button>')
      + '</div>'
      + '<p class="ttx-note">' + esc(T(["Go as slowly as you like.", "Ve tan despacio como quieras."])) + '</p>';
    var p = document.getElementById("jlPrev"); if (p) p.addEventListener("click", function () { jlRender(i - 1); });
    var nx = document.getElementById("jlNext"); if (nx) nx.addEventListener("click", function () { jlRender(i + 1); });
    var d = document.getElementById("jlDone"); if (d) d.addEventListener("click", closeModal);
  }
  function jlInit() { jlRender(0); }

  /* ─── Just be — a screen with nothing to do on it, on purpose ─────────────
     No instructions, no timer, no task, no feedback footer, no practice log.
     The one thing Quiet Space should be able to say: you don't have to do
     anything right now. */
  function jbBuilder() {
    return '<div class="ttx-jb">'
      + '<div class="ttx-jb-orb" aria-hidden="true"></div>'
      + '<p class="ttx-jb-line">' + esc(T(["There’s nothing to do here.", "Aquí no hay nada que hacer."])) + '</p>'
      + '<p class="ttx-jb-sub">' + esc(T(["You can stay as long as you need. Being here is enough.", "Puedes quedarte el tiempo que necesites. Estar aquí es suficiente."])) + '</p>'
      + '</div>';
  }

  /* ─── Register the new experiences with the existing tool system ──────── */
  function reg() {
    if (!window.TOOLS) return;
    window.TOOLS.notsure     = { builder: nsBuilder, init: nsRender };
    window.TOOLS.presspush   = { builder: ppBuilder, init: ppMenu };
    window.TOOLS.bodymap     = { builder: bmBuilder, init: bmBind };
    window.TOOLS.tellsomeone = { builder: tsBuilder, init: tsMenu };
    window.TOOLS.pathbreathe = { builder: pathBuilder("breathe"), init: pathInit };
    window.TOOLS.pathground  = { builder: pathBuilder("ground"),  init: pathInit };
    window.TOOLS.pathfeel    = { builder: pathBuilder("feel"),    init: pathInit };
    window.TOOLS.pathfocus   = { builder: pathBuilder("focus"),   init: pathInit };
    window.TOOLS.pathconnect = { builder: pathBuilder("connect"), init: pathInit };
    window.TOOLS.sensesound  = { builder: senseBuilder("sensesound"), init: senseInit };
    window.TOOLS.sensesight  = { builder: senseBuilder("sensesight"), init: senseInit };
    window.TOOLS.sensetouch  = { builder: senseBuilder("sensetouch"), init: senseInit };
    window.TOOLS.sensemove   = { builder: senseBuilder("sensemove"), init: senseInit };
    window.TOOLS.justlisten  = { builder: jlBuilder, init: jlInit };
    window.TOOLS.justbe      = { builder: jbBuilder, init: function () {} };
  }

  /* ─── "Was that helpful?" — navigation, not a score ───────────────────── */
  var FB_IDS = ["breathing", "boxbreath", "rainbow", "take5", "movement", "animalyoga",
                "tappad", "grounding", "safeplace", "pmr", "bilateral", "coldwater",
                "calmjar", "fidget", "presspush", "justlisten"];
  var _fbCur = null;
  function removeFb() {
    var f = document.getElementById("aogToolFb"); if (f) f.remove();
    ppStop();
  }
  function pickAlt(cur) {
    var pool = PICKS.filter(function (id) { return id !== cur; });
    return pool[Math.floor(Math.random() * pool.length)] || "breathing";
  }
  function fbStage(msgPair, btns) {
    var f = document.getElementById("aogToolFb"); if (!f) return;
    f.innerHTML = '<span class="ttfb-msg">' + esc(T(msgPair)) + '</span>'
      + btns.map(function (b, i) { return '<button type="button" class="ttfb-b" data-i="' + i + '">' + esc(T(b[0])) + '</button>'; }).join("");
    f.querySelectorAll(".ttfb-b").forEach(function (el) {
      el.addEventListener("click", function () { btns[parseInt(el.getAttribute("data-i"), 10)][1](); });
    });
  }
  function addFb() {
    var modal = document.querySelector("#toolModal .tool-modal");
    if (!modal || document.getElementById("aogToolFb")) return;
    var f = document.createElement("div");
    f.id = "aogToolFb";
    modal.appendChild(f);
    fbStage(["Was that helpful?", "¿Te ayudó?"], [
      [["Yes", "Sí"], function () {
        fbStage(["You found something that helped a little.", "Encontraste algo que ayudó un poco."], [
          [["Stay here", "Quedarme aquí"], removeFb],
          [["Try another", "Probar otra"], function () { window.toolOpen && window.toolOpen(pickAlt(_fbCur)); }]
        ]);
      }],
      [["A little", "Un poco"], function () {
        fbStage(["Sometimes a small shift is enough.", "A veces un pequeño cambio es suficiente."], [
          [["Try again", "Otra vez"], function () { var c = _fbCur; removeFb(); window.toolOpen && window.toolOpen(c); }],
          [["Try something else", "Probar otra cosa"], function () { window.toolOpen && window.toolOpen(pickAlt(_fbCur)); }]
        ]);
      }],
      [["Not really", "La verdad, no"], function () {
        fbStage(["That’s okay. Different bodies need different things.", "Está bien. Cuerpos distintos necesitan cosas distintas."], [
          [["Try something else", "Probar otra cosa"], function () { window.toolOpen && window.toolOpen(pickAlt(_fbCur)); }],
          [["Help me choose", "Ayúdame a elegir"], function () { quietOpen("notsure"); }]
        ]);
      }]
    ]);
  }
  function wrapToolOpen() {
    if (typeof window.toolOpen !== "function" || window.toolOpen.__ttxWrapped) return;
    var orig = window.toolOpen;
    window.toolOpen = function (type) {
      removeFb();
      _fbCur = type;
      orig.apply(this, arguments);
      if (FB_IDS.indexOf(type) > -1) setTimeout(addFb, 120);
    };
    window.toolOpen.__ttxWrapped = true;
    if (typeof window.toolClose === "function" && !window.toolClose.__ttxWrapped) {
      var oc = window.toolClose;
      window.toolClose = function () { removeFb(); return oc.apply(this, arguments); };
      window.toolClose.__ttxWrapped = true;
    }
  }

  /* ─── Low-Stimulation Mode ────────────────────────────────────────────── */
  var LS_KEY = "aog.lowstim.v1";
  function setLowStim(on) {
    try { document.documentElement.setAttribute("data-aog-lowstim", on ? "1" : "0"); } catch (e) {}
    try { on ? localStorage.setItem(LS_KEY, "1") : localStorage.removeItem(LS_KEY); } catch (e) {}
    var b = document.getElementById("ttLowStim");
    if (b) b.setAttribute("aria-pressed", on ? "true" : "false");
  }
  function lowStimOn() { try { return localStorage.getItem(LS_KEY) === "1"; } catch (e) { return false; } }
  window.aogLowStim = setLowStim;

  /* ─── "Things that help me" — private, local, optional ────────────────── */
  var HELPS_KEY = "aog.helps.v1";
  var HELP_ITEMS = [
    ["quiet",      ["Quiet", "Silencio"],            function () { openStation(); }],
    ["movement",   ["Movement", "Movimiento"],       function () { openCatalog("move"); }],
    ["pressure",   ["Pressure", "Presión"],     function () { window.toolOpen && window.toolOpen("presspush"); }],
    ["breathing",  ["Breathing", "Respiración"],function () { openCatalog("breathe"); }],
    ["music",      ["Music", "Música"],          null],
    ["drawing",    ["Drawing", "Dibujar"],           null],
    ["alone",      ["Being alone", "Estar a solas"], function () { openStation(); }],
    ["nearby",     ["Someone nearby", "Alguien cerca"], function () { quietOpen("tellsomeone"); }],
    ["talking",    ["Talking", "Hablar"],            function () { quietOpen("pathconnect"); }],
    ["nottalking", ["Not talking", "No hablar"],     function () { quietOpen("tellsomeone"); }]
  ];
  function readHelps() { try { return JSON.parse(localStorage.getItem(HELPS_KEY)) || []; } catch (e) { return []; } }
  function writeHelps(a) { try { localStorage.setItem(HELPS_KEY, JSON.stringify(a)); } catch (e) {} }
  function helpItem(id) { for (var i = 0; i < HELP_ITEMS.length; i++) if (HELP_ITEMS[i][0] === id) return HELP_ITEMS[i]; return null; }
  function paintHelps() {
    var grid = document.getElementById("ttHelpsGrid");
    var chosen = readHelps();
    if (grid) {
      grid.innerHTML = HELP_ITEMS.map(function (it) {
        var on = chosen.indexOf(it[0]) > -1;
        return '<label><input type="checkbox" data-h="' + it[0] + '"' + (on ? " checked" : "") + '> ' + esc(T(it[1])) + '</label>';
      }).join("");
      grid.querySelectorAll("input").forEach(function (inp) {
        inp.addEventListener("change", function () {
          var a = readHelps(), id = inp.getAttribute("data-h"), ix = a.indexOf(id);
          if (inp.checked && ix < 0) a.push(id);
          if (!inp.checked && ix > -1) a.splice(ix, 1);
          writeHelps(a);
          paintPrevLine();
        });
      });
    }
    paintPrevLine();
  }
  function paintPrevLine() {
    var line = document.getElementById("ttHelpsLine"); if (!line) return;
    var chosen = readHelps().slice(0, 4);
    if (!chosen.length) { line.hidden = true; line.innerHTML = ""; return; }
    line.hidden = false;
    line.innerHTML = '<span>' + esc(T(LABELS.prevLine)) + '</span>'
      + chosen.map(function (id) {
          var it = helpItem(id); if (!it) return "";
          return '<button type="button" class="tt-prev-chip" data-h="' + id + '"' + (it[2] ? "" : ' disabled style="opacity:.65;cursor:default;"') + '>' + esc(T(it[1])) + '</button>';
        }).join("");
    line.querySelectorAll(".tt-prev-chip").forEach(function (b) {
      b.addEventListener("click", function () {
        var it = helpItem(b.getAttribute("data-h"));
        if (it && it[2]) it[2]();
      });
    });
  }

  /* ─── Deep links: #tools/<pathway> ────────────────────────────────────── */
  window.aogToolsRoute = function (sub) {
    sub = String(sub || "").toLowerCase();
    /* Pathway deep links open the pathway's ROOM (build .30cg), same as the
       doors; only the explicitly grid-shaped destinations open the catalog. */
    if (sub === "breathe") { quietOpen("pathbreathe"); return; }
    if (sub === "ground")  { quietOpen("pathground"); return; }
    if (sub === "move")    { quietOpen("sensemove"); return; }
    if (sub === "express" || sub === "printables" || sub === "all") { openCatalog(sub); return; }
    if (sub === "quiet" || sub === "quietspace") { openStation(); return; }
    if (sub === "feel")    { quietOpen("pathfeel"); return; }
    if (sub === "focus")   { quietOpen("pathfocus"); return; }
    if (sub === "connect") { quietOpen("pathconnect"); return; }
    if (sub === "notsure" || sub === "choose") { quietOpen("notsure"); return; }
    if (sub === "communicate" || sub === "tell") { quietOpen("tellsomeone"); return; }
    if (sub === "pecs") { act("pecs"); return; }
    if (sub === "body" || sub === "bodymap") { window.toolOpen && window.toolOpen("bodymap"); return; }
    if (sub === "pressure" || sub === "press") { window.toolOpen && window.toolOpen("presspush"); return; }
    if (sub === "sensory" || sub === "senses") {
      var s = document.getElementById("ttSense");
      if (s) { try { s.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { s.scrollIntoView(); } }
      return;
    }
  };

  /* ─── Localize the static skeleton ────────────────────────────────────── */
  function paint() {
    var set = function (id, pair) { var el = document.getElementById(id); if (el) el.textContent = T(pair); };
    set("ttPickLabel", LABELS.pick);
    set("ttAll", LABELS.all);
    set("ttOr", LABELS.need);
    set("ttLowStimLabel", LABELS.lowstim);
    set("ttHelpsSummary", LABELS.helpsSummary);
    set("ttHelpsHint", LABELS.helpsHint);
    var kid = toolsMode() === "kid";
    var doors = document.querySelectorAll("#ttDoors .tt-door");
    for (var i = 0; i < doors.length; i++) {
      var c = doors[i].getAttribute("data-cat"), d = DOORS[c];
      if (!d) continue;
      var pairT = kid ? (es() ? (d.kides || d.es) : (d.kid || d.en))
                      : (es() ? d.es : d.en);
      var b = doors[i].querySelector("b"), s = doors[i].querySelector("span");
      if (b) b.textContent = pairT[0];
      if (s) s.textContent = pairT[1];
    }
    /* Student mode hides the adult-facing furniture around the doors — the
       Calming Corner setup panel, the Grace Lens circle-time reference and
       the adult Quick Reset. The aog2 layer already hides the staff CARDS;
       this class covers the panels that layer never knew about. */
    var sc = document.getElementById(SCREEN);
    if (sc) sc.classList.toggle("tt-kid", kid);
    paintHelps();
  }

  /* ─── Modal + widget styles (self-contained) ──────────────────────────── */
  function injectCss() {
    if (document.getElementById("aog-ttx-css")) return;
    var st = document.createElement("style");
    st.id = "aog-ttx-css";
    st.textContent =
      '.ttx-opts{display:flex;flex-direction:column;gap:10px;margin:16px 0 4px;}' +
      '.ttx-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;' +
        'padding:14px 16px;border:1.5px solid var(--rule,#E4DAC5);border-left:5px solid var(--gold,#D9A33B);' +
        'border-radius:12px;background:var(--paper,#fff);cursor:pointer;font:inherit;color:inherit;text-align:left;}' +
      '.ttx-opt:hover{border-color:var(--gold,#D9A33B);}' +
      '.ttx-opt-main{display:flex;flex-direction:column;gap:2px;}' +
      '.ttx-opt-main b{font-family:var(--font-serif,Georgia,serif);font-size:16.5px;font-weight:600;color:var(--navy,#1B3A5F);}' +
      '.ttx-opt-main span{font-size:12.5px;color:var(--ink-soft,#5b6478);line-height:1.35;}' +
      '.ttx-opt-d{flex:none;font-size:11.5px;font-weight:700;color:var(--ink-faint,#8A93A6);border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:3px 9px;}' +
      '.ttx-row{font-size:13px;color:var(--ink-soft,#5b6478);line-height:1.5;padding:10px 4px;border-top:1px dashed var(--rule,#E4DAC5);text-align:left;}' +
      '.ttx-lens{font-family:Georgia,serif;font-style:italic;font-size:13.5px;color:var(--ink-faint,#8A93A6);margin:14px 0 0;text-align:center;}' +
      '.ttx-q{font-size:16px;font-weight:600;color:var(--navy,#1B3A5F);margin:14px 0 10px;text-align:center;}' +
      '.ttx-grid{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin:8px 0;}' +
      '.ttx-choice{font:inherit;font-size:14px;font-weight:700;cursor:pointer;border:1.5px solid var(--gold,#D9A33B);' +
        'background:transparent;color:var(--navy,#1B3A5F);border-radius:999px;padding:10px 18px;min-height:44px;}' +
      '.ttx-choice:hover{background:rgba(217,163,59,.14);}' +
      '.ttx-back{display:inline-block;margin:10px 6px 0;background:none;border:0;cursor:pointer;font:inherit;' +
        'font-size:13.5px;color:var(--ink-soft,#5b6478);text-decoration:underline;text-underline-offset:3px;padding:5px 8px;}' +
      '.ttx-note{font-size:12.5px;color:var(--ink-faint,#8A93A6);margin:10px 0 0;text-align:center;}' +
      '.ttx-big{font-family:var(--font-serif,Georgia,serif);font-size:21px;font-weight:600;color:var(--navy,#1B3A5F);' +
        'text-align:center;line-height:1.35;margin:18px 0 8px;}' +
      '.ttx-count{font-size:52px;font-weight:800;color:var(--gold,#B8893A);text-align:center;margin:6px 0;font-variant-numeric:tabular-nums;}' +
      '.ttx-bm{display:block;max-width:190px;margin:14px auto 4px;}' +
      '.ttx-bm [data-part]{fill:rgba(217,163,59,.18);stroke:var(--navy,#1B3A5F);stroke-width:2;cursor:pointer;}' +
      '.ttx-bm [data-part]:hover{fill:rgba(217,163,59,.4);}' +
      '.ttx-bm [data-part].on{fill:var(--gold,#D9A33B);}' +
      '.ttx-bm [data-part]:focus-visible{outline:none;stroke:var(--gold,#D9A33B);stroke-width:4;}' +
      '.ttx-ts-grid .ttx-choice{flex:1 1 44%;}' +
      '.ttx-ts-big{font-family:var(--font-serif,Georgia,serif);font-size:34px;font-weight:700;color:var(--navy,#0A1E33);' +
        'text-align:center;line-height:1.3;padding:26px 14px;margin:12px 0;background:var(--paper,#FBF7EC);' +
        'border:2px solid var(--gold,#D9A33B);border-radius:16px;display:flex;flex-direction:column;gap:8px;}' +
      '.ttx-ts-alt{font-size:16px;font-weight:400;color:var(--ink-soft,#5b6478);}' +
      '#aogToolFb{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:9px;' +
        'margin:16px -4px 0;padding:13px 8px 2px;border-top:1px solid var(--rule,#E4DAC5);}' +
      '#aogToolFb .ttfb-msg{font-size:13.5px;font-weight:600;color:var(--ink-soft,#5b6478);}' +
      '#aogToolFb .ttfb-b{font:inherit;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid var(--rule,#E4DAC5);' +
        'background:transparent;color:var(--navy,#1B3A5F);border-radius:999px;padding:7px 14px;}' +
      '#aogToolFb .ttfb-b:hover{border-color:var(--gold,#D9A33B);background:rgba(217,163,59,.12);}' +
      ':root[data-theme="dark"] .ttx-opt-main b,:root[data-theme="dark"] .ttx-q,:root[data-theme="dark"] .ttx-big,' +
      ':root[data-theme="dark"] .ttx-choice,:root[data-theme="dark"] #aogToolFb .ttfb-b{color:var(--cream,#F4ECDA);}' +
      ':root[data-theme="dark"] .ttx-ts-big{color:var(--cream,#F4ECDA);background:#13212E;}' +
      ':root[data-theme="dark"] .ttx-bm [data-part]{stroke:var(--cream,#F4ECDA);}' +
      /* Just be — one slow orb, nothing else. Still under reduced-motion/low-stim. */
      '.ttx-jb{text-align:center;padding:34px 10px 22px;}' +
      '.ttx-jb-orb{width:110px;height:110px;border-radius:50%;margin:0 auto 26px;' +
        'background:radial-gradient(circle at 38% 32%, var(--gold-soft,#F2C964), var(--gold,#D9A33B));' +
        'opacity:.85;animation:ttxJbBreathe 9s ease-in-out infinite;}' +
      '@keyframes ttxJbBreathe{0%,100%{transform:scale(.94)}50%{transform:scale(1.04)}}' +
      '@media (prefers-reduced-motion:reduce){.ttx-jb-orb{animation:none;}}' +
      'html[data-aog-lowstim="1"] .ttx-jb-orb{animation:none;}' +
      '.ttx-jb-line{font-family:var(--font-serif,Georgia,serif);font-size:24px;font-weight:600;' +
        'color:var(--navy,#1B3A5F);margin:0 0 10px;line-height:1.3;}' +
      ':root[data-theme="dark"] .ttx-jb-line{color:var(--cream,#F4ECDA);}' +
      '.ttx-jb-sub{font-size:14.5px;color:var(--ink-soft,#5b6478);margin:0;line-height:1.5;}' +
      /* Student mode: the adult-facing furniture steps out of the room. */
      '#screen-teacher-tools.tt-kid .aog-corner-panel,' +
      '#screen-teacher-tools.tt-kid .aog-glref,' +
      '#screen-teacher-tools.tt-kid .gg-reset-btn{display:none !important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  var n = 0;
  try { n = Math.floor(Math.random() * PICKS.length); } catch (e) {}

  function wire() {
    var sc = document.getElementById(SCREEN);
    if (!sc || sc.dataset.ttWired) return;
    sc.dataset.ttWired = "1";
    sc.classList.add("tt-collapsed");
    injectCss();
    reg();
    wrapToolOpen();
    if (lowStimOn()) setLowStim(true);
    paint();

    var pick = document.getElementById("ttPick");
    if (pick) pick.addEventListener("click", function () {
      var id = PICKS[n % PICKS.length]; n++;
      if (typeof window.toolOpen === "function") { window.toolOpen(id); }
      else { openCatalog("breathe"); }
    });

    var doors = document.getElementById("ttDoors");
    if (doors) doors.addEventListener("click", function (ev) {
      var d = ev.target.closest(".tt-door");
      if (!d) return;
      var cat = d.getAttribute("data-cat");
      if (cat === "quiet") openStation();
      else if (cat === "move") quietOpen("sensemove");
      else if (cat === "breathe" || cat === "ground" ||
               cat === "feel" || cat === "focus" || cat === "connect") quietOpen("path" + cat);
      else if (cat === "notsure") quietOpen("notsure");
      else openCatalog(cat);
    });

    var all = document.getElementById("ttAll");
    if (all) all.addEventListener("click", function () { openCatalog("all"); });

    var ls = document.getElementById("ttLowStim");
    if (ls) ls.addEventListener("click", function () { setLowStim(ls.getAttribute("aria-pressed") !== "true"); });

    /* Quiet Space modes (build .30ce). The row lives inside #aog-station,
       which re-roots itself to <body> when it opens — listeners travel with
       the node, so binding once here is enough. */
    var stModes = document.getElementById("aogStModes");
    if (stModes) stModes.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-stmode]");
      if (!b) return;
      var m = b.getAttribute("data-stmode");
      if (m === "breathe")     { window.toolOpen && window.toolOpen("breathing"); }
      else if (m === "move")   { window.toolOpen && window.toolOpen("movement"); }
      else if (m === "notice") { window.toolOpen && window.toolOpen("bodymap"); }
      else if (m === "listen") { window.toolOpen && window.toolOpen("justlisten"); }
      else if (m === "look")   { window.toolOpen && window.toolOpen("calmjar"); }
      else if (m === "be")     { quietOpen("justbe"); }   /* being is not a task, so it is not practice */
    });

    /* Student/adult presentation (build .30ce): repaint when the aog2 layer's
       toggle changes mode, so the doors change wording with the cards. */
    try { document.addEventListener("aog:toolsmode", function () { paint(); }); } catch (e) {}

    var sense = document.querySelector("#ttSense .tt-sense-grid");
    if (sense) sense.addEventListener("click", function (ev) {
      var c = ev.target.closest(".tt-sense-card");
      if (!c) return;
      var k = c.getAttribute("data-sense");
      if (k === "sound") quietOpen("sensesound");
      else if (k === "sight") quietOpen("sensesight");
      else if (k === "touch") quietOpen("sensetouch");
      else if (k === "pressure") { window.toolOpen && window.toolOpen("presspush"); }
      else if (k === "movement") quietOpen("sensemove");
      else if (k === "body") { window.toolOpen && window.toolOpen("bodymap"); }
    });

    try {
      document.addEventListener("click", function (ev) {
        if (ev.target && ev.target.closest && ev.target.closest(".lang-toggle")) setTimeout(paint, 60);
      }, true);
    } catch (e) {}

    /* The click listener above misses a programmatic setLang (links carrying
       ?lang=es, the dashboard's language plumbing). Ride setLang itself, so
       the doors always speak the same language as the page around them. */
    try {
      if (typeof window.setLang === "function" && !window.setLang.__ttxWrapped) {
        var oSet = window.setLang;
        window.setLang = function () { var r = oSet.apply(this, arguments); try { paint(); } catch (e) {} return r; };
        window.setLang.__ttxWrapped = true;
      }
    } catch (e) {}

    /* ═══ THE SCREEN TRAIL (build .30cg) ═══════════════════════════════════
       On file:// — how Jimmy reviews the deploy folder — history.pushState
       throws on the opaque origin, so aogSetHash() has been silently no-oping
       and goBack() has never had an aogIdx to walk: its fallback sent every
       Back press to the welcome screen. Reported on the Talk It Out board and
       the Anchor Charts. This keeps a tiny in-app trail of screen ids that
       goBack() can pop when the history is unusable. On https the history
       path still wins and this list is never consulted. */
    try {
      if (typeof window.showScreen === "function" && !window.showScreen.__ttxTrail) {
        var oShow = window.showScreen;
        window.showScreen = function (id) {
          var prev = null;
          try { var a = document.querySelector(".screen.active"); prev = a ? a.id : null; } catch (e) {}
          var r = oShow.apply(this, arguments);
          try {
            if (!window.__aogTrailNav && prev && prev !== id) {
              var t = window.__aogScreenTrail = window.__aogScreenTrail || [];
              if (t[t.length - 1] !== prev) t.push(prev);
              if (t.length > 24) t.shift();
            }
          } catch (e) {}
          return r;
        };
        window.showScreen.__ttxTrail = true;
      }
    } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
  setTimeout(wire, 500);
})();
