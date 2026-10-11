
(function () {
  var MOUNT = "aogFamilyDest";

  function es() {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
    catch (e) { return false; }
  }
  function T(p) { return es() ? p[1] : p[0]; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function el(id) { return document.getElementById(id); }
  function setHash(h) { try { if (typeof window.aogSetHash === "function") window.aogSetHash(h); } catch (e) {} }
  function motion() { try { return !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return true; } }

  /* ─── One Small Thing · four small banks, one offering per visit ──────── */
  var OST = {
    q: [
      ["What took more energy today than anyone probably realized?", "¿Qué te costó hoy más energía de lo que los demás se imaginan?"],
      ["When did you feel most like yourself today?", "¿En qué momento de hoy te sentiste más tú?"],
      ["What helped today, even a little?", "¿Qué te ayudó hoy, aunque fuera un poquito?"],
      ["What do you need more of tomorrow?", "¿Qué necesitas más mañana?"],
      ["Who made today a little easier?", "¿Quién hizo que hoy fuera un poco más fácil?"]
    ],
    s: [
      ["“You don’t have to explain it perfectly. I’m listening.”", "«No tienes que explicarlo perfecto. Te escucho.»"],
      ["“I’m on your side, even when we disagree.”", "«Estoy de tu lado, incluso cuando no estamos de acuerdo.»"],
      ["“That sounds heavy. Thank you for telling me.”", "«Eso suena pesado. Gracias por contármelo.»"],
      ["“We can figure this out together.”", "«Podemos resolverlo juntos.»"]
    ],
    a: [
      ["Sit together for two minutes without fixing anything.", "Siéntense juntos dos minutos sin arreglar nada."],
      ["Let them pick the music on the next car ride.", "Deja que elija la música en el próximo viaje en auto."],
      ["Make something warm to drink, and share it.", "Preparen algo calientito y compártanlo."],
      ["Say goodnight one beat slower than usual.", "Da las buenas noches un poco más despacio que de costumbre."]
    ],
    g: [
      ["We can try again tomorrow.", "Podemos intentarlo de nuevo mañana."],
      ["Nobody in this house has to be perfect tonight.", "Nadie en esta casa tiene que ser perfecto esta noche."],
      ["A hard day doesn’t mean a hard family.", "Un día difícil no significa una familia difícil."],
      ["Being here counts.", "Estar aquí ya cuenta."]
    ]
  };
  var ostShift = 0;
  function daySeed() {
    var d = new Date();
    return d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  }
  function ostPick() {
    var s = daySeed() + ostShift;
    return {
      q: OST.q[s % OST.q.length], s: OST.s[(s + 1) % OST.s.length],
      a: OST.a[(s + 2) % OST.a.length], g: OST.g[(s + 3) % OST.g.length]
    };
  }

  /* ─── Conversation Tonight · the curated deck, then the age bank ──────── */
  var TONIGHT = [
    ["What’s something that took more energy today than people probably realized?", "¿Qué fue algo que hoy costó más energía de lo que la gente se imagina?"],
    ["What was one moment today when you felt like yourself?", "¿Cuál fue un momento de hoy en que te sentiste tú mismo?"],
    ["What helped today?", "¿Qué ayudó hoy?"],
    ["Was there a moment you wish you could do over?", "¿Hubo un momento que quisieras repetir de otra manera?"],
    ["What do you need more of tomorrow?", "¿Qué necesitas más mañana?"],
    ["Who made today a little easier?", "¿Quién hizo que hoy fuera un poco más fácil?"]
  ];
  var BANDS = [["k2", "K–2"], ["35", "3–5"], ["68", "6–8"], ["912", "9–12"], ["adult", ["Adult", "Adultos"]]];
  var talkBand = null, talkIdx = 0, talkPool = null;
  function bandDefault() {
    try {
      if (window.__aogFamCsBand) return window.__aogFamCsBand;
    } catch (e) {}
    return "35";
  }
  function bankItems(band) {
    var D = window.AOG_CS_DATA, out = [];
    if (!D || !D[band]) return out;
    ["A", "B", "C"].forEach(function (k) {
      (D[band][k] || []).forEach(function (o) { if (o && o.en) out.push([o.en, o.es || o.en]); });
    });
    return out;
  }
  function talkDeck() {
    var deck = TONIGHT.concat(bankItems(talkBand || bandDefault()));
    return deck.length ? deck : TONIGHT;
  }
  function talkCurrent() { var d = talkDeck(); return d[talkIdx % d.length]; }

  /* ─── Saved conversations · aog.family.saved.v1 · device-only ─────────── */
  function savedAll() { try { return JSON.parse(localStorage.getItem("aog.family.saved.v1") || "[]"); } catch (e) { return []; } }
  function savedWrite(a) { try { localStorage.setItem("aog.family.saved.v1", JSON.stringify(a.slice(0, 30))); } catch (e) {} }

  /* ─── Words for the Hard Moment ───────────────────────────────────────── */
  var WORDS = [
    ["“You don’t have to solve this right now.”", "«No tienes que resolver esto ahora mismo.»"],
    ["“I’m listening.”", "«Te escucho.»"],
    ["“We can come back to this.”", "«Podemos volver a esto después.»"],
    ["“I believe you.”", "«Te creo.»"],
    ["“I don’t understand yet, but I want to.”", "«Todavía no lo entiendo, pero quiero entenderlo.»"],
    ["“We can repair this.”", "«Podemos reparar esto.»"],
    ["“You are not the mistake you made.”", "«No eres el error que cometiste.»"],
    ["“You don’t have to earn your way back to me.”", "«No tienes que ganarte mi cariño de nuevo.»"]
  ];

  /* ─── What Can I Say? · instead → try ─────────────────────────────────── */
  var SAY = [
    { t: ["My child made a mistake", "Mi hijo cometió un error"],
      i: ["Why did you do that?", "¿Por qué hiciste eso?"],
      y: [["“Help me understand what happened.”", "«Ayúdame a entender qué pasó.»"],
          ["“You are not the mistake you made.”", "«No eres el error que cometiste.»"]] },
    { t: ["My child is angry", "Mi hijo está enojado"],
      i: ["Calm down.", "Cálmate."],
      y: [["“I can be with you while this feels big.”", "«Puedo acompañarte mientras esto se siente enorme.»"],
          ["“Do you want space, or company?”", "«¿Quieres espacio o compañía?»"]] },
    { t: ["My child is shutting down", "Mi hijo se está cerrando"],
      i: ["Talk to me.", "Háblame."],
      y: [["“You don’t have to talk yet.”", "«Todavía no tienes que hablar.»"],
          ["“Do you want me nearby, or a little farther away?”", "«¿Me quieres cerca o un poco más lejos?»"]],
      link: "wonttalk" },
    { t: ["My child is anxious about school", "Mi hijo está ansioso por la escuela"],
      i: ["You’ll be fine.", "Vas a estar bien."],
      y: [["“What part feels biggest right now?”", "«¿Qué parte se siente más grande ahora?»"],
          ["“Do you want help with a plan, or just a listen?”", "«¿Quieres ayuda con un plan, o solo que te escuche?»"]] },
    { t: ["My child hurt someone", "Mi hijo lastimó a alguien"],
      i: ["Say you’re sorry.", "Pide perdón."],
      y: [["“What happened for you?”", "«¿Qué pasó dentro de ti?»"],
          ["“What might it have felt like for them?”", "«¿Cómo crees que se sintió la otra persona?»"]],
      link: "repair" },
    { t: ["My child was hurt", "Lastimaron a mi hijo"],
      i: ["Are you sure it happened like that?", "¿Seguro que fue así?"],
      y: [["“I believe you.”", "«Te creo.»"],
          ["“You don’t have to carry this alone.”", "«No tienes que cargar esto a solas.»"]] },
    { t: ["We had a fight", "Tuvimos una pelea"],
      i: ["Let’s just forget it.", "Mejor olvidémoslo."],
      y: [["“I don’t like how I spoke to you. Can I try again?”", "«No me gustó cómo te hablé. ¿Puedo intentarlo de nuevo?»"],
          ["“We can repair this.”", "«Podemos reparar esto.»"]],
      link: "repair" }
  ];

  /* ─── Today Was Hard · one small next step each, never ten resources ──── */
  var HARD = [
    { t: ["My child is overwhelmed", "Mi hijo está abrumado"],
      s: ["You might try a quieter environment first — fewer words, less input, more space. Talking can come later.",
          "Prueba primero un entorno más tranquilo — menos palabras, menos estímulos, más espacio. Hablar puede venir después."],
      act: ["Open Quiet Space →", "Abrir el Espacio de Calma →"], go: "quiet" },
    { t: ["My child has too much energy", "Mi hijo tiene demasiada energía"],
      s: ["A body that’s buzzing usually needs to move before it can talk. Two minutes of motion changes the conversation.",
          "Un cuerpo acelerado suele necesitar moverse antes de poder hablar. Dos minutos de movimiento cambian la conversación."],
      act: ["Try Movement →", "Probar Movimiento →"], go: "move" },
    { t: ["We had an argument", "Tuvimos una discusión"],
      s: ["Arguments don’t need a winner. They need a repair — and a grown-up going first counts double.",
          "Las discusiones no necesitan un ganador. Necesitan una reparación — y que el adulto dé el primer paso cuenta doble."],
      act: ["Start a repair →", "Iniciar una reparación →"], go: "repair" },
    { t: ["My child won’t talk", "Mi hijo no quiere hablar"],
      s: ["Silence isn’t failure. There are ways to stay connected that don’t need words yet.",
          "El silencio no es un fracaso. Hay maneras de seguir conectados que todavía no necesitan palabras."],
      act: ["See what to try →", "Ver qué probar →"], go: "wonttalk" },
    { t: ["My child can’t explain what’s wrong", "Mi hijo no puede explicar qué le pasa"],
      s: ["Showing is allowed. Picture cards let a child point before they can name.",
          "Mostrar también vale. Las tarjetas con imágenes permiten señalar antes de poder nombrar."],
      act: ["Open picture cards →", "Abrir tarjetas con imágenes →"], go: "pecs" },
    { t: ["I don’t know what to say", "No sé qué decir"],
      s: ["You don’t need perfect words. Borrow one of ours until yours come back.",
          "No necesitas palabras perfectas. Toma prestada una de las nuestras hasta que vuelvan las tuyas."],
      act: ["Words for the hard moment →", "Palabras para el momento difícil →"], go: "words" },
    { t: ["I think I made things worse", "Creo que empeoré las cosas"],
      s: ["Repair is a parent’s move too. Going first doesn’t lose authority — it teaches the one skill that matters most.",
          "Reparar también le toca al adulto. Dar el primer paso no resta autoridad — enseña la habilidad más importante de todas."],
      act: ["Start a repair →", "Iniciar una reparación →"], go: "repair" },
    { t: ["Something happened at school", "Algo pasó en la escuela"],
      s: ["Try the shared language: “Where did you feel like you had to wear a mask today?” School and home can use the same words.",
          "Prueba el lenguaje compartido: «¿Dónde sentiste hoy que tenías que ponerte una máscara?» La escuela y la casa pueden usar las mismas palabras."],
      act: ["Home ↔ School →", "Hogar ↔ Escuela →"], go: "homeschool" }
  ];

  /* ─── My Child Won’t Talk ─────────────────────────────────────────────── */
  var WONT = [
    ["“You don’t have to talk yet.”", "«Todavía no tienes que hablar.»"],
    ["“Do you want me nearby, or a little farther away?”", "«¿Me quieres cerca o un poco más lejos?»"],
    ["“Would you rather show me?”", "«¿Prefieres mostrármelo?»"],
    ["“Do you want quiet, or company?”", "«¿Quieres silencio o compañía?»"],
    ["“Would you like me to just sit here?”", "«¿Quieres que simplemente me quede aquí?»"]
  ];

  /* ─── After the Rupture · the guided repair ───────────────────────────── */
  var REPAIR_STEPS = [
    { h: ["Something went wrong.", "Algo salió mal."],
      b: ["That’s not the end of the story — it’s the middle. Repair is how a family gets somewhere new. Take this one small step at a time; skip anything that doesn’t fit.",
          "Ese no es el final de la historia — es la mitad. Reparar es la manera en que una familia llega a un lugar nuevo. Ve paso a paso, y salta lo que no encaje."] },
    { h: ["Pause.", "Pausa."],
      b: ["Before any words: one slow breath each. If a body is still in a big place, a calming tool first is not a delay — it’s the beginning.",
          "Antes de las palabras: una respiración lenta cada uno. Si un cuerpo todavía está muy alterado, una herramienta de calma primero no es una demora — es el comienzo."] },
    { h: ["What happened?", "¿Qué pasó?"],
      b: ["Each person says what happened as they experienced it. Start with “I…”, and let the other person finish without correcting them.",
          "Cada persona cuenta lo que pasó tal como lo vivió. Empieza con «Yo…», y deja que la otra persona termine sin corregirla."] },
    { h: ["What were we feeling?", "¿Qué estábamos sintiendo?"],
      b: ["Under anger there’s usually something softer — worry, embarrassment, feeling unseen. Name yours. Don’t assign theirs.",
          "Debajo del enojo suele haber algo más suave — preocupación, vergüenza, sentirse invisible. Nombra lo tuyo. No asignes lo del otro."] },
    { h: ["What do we wish had gone differently?", "¿Qué quisiéramos que hubiera sido distinto?"],
      b: ["Not blame — a wish. “I wish I had…” counts double when a grown-up goes first.",
          "No es culpa — es un deseo. «Ojalá yo hubiera…» cuenta doble cuando el adulto lo dice primero."] },
    { h: ["What do we need now?", "¿Qué necesitamos ahora?"],
      b: ["Space? Reassurance? A do-over? Help? Time? Needing something isn’t a demand — it’s information.",
          "¿Espacio? ¿Consuelo? ¿Volver a intentarlo? ¿Ayuda? ¿Tiempo? Necesitar algo no es una exigencia — es información."] },
    { h: ["What can we repair?", "¿Qué podemos reparar?"],
      b: ["Take responsibility for your part — even a small part. Repair can be words, an action, or simply staying.",
          "Asume tu parte — aunque sea pequeña. La reparación puede ser con palabras, con una acción, o simplemente quedándote."] },
    { h: ["Return.", "Regresar."],
      b: ["Ready to try again? Repair doesn’t erase what happened. It gives the relationship somewhere to go next.",
          "¿Listos para intentarlo de nuevo? Reparar no borra lo que pasó. Le da a la relación un lugar adonde ir."] }
  ];
  var repairStep = 0;

  /* ─── The Four Pillars at Home ────────────────────────────────────────── */
  var PILLARS = [
    { c: "#1C5499", t: ["Identity", "Identidad"], q: ["Who am I becoming?", "¿En quién me estoy convirtiendo?"],
      p: [["“What’s something about yourself you hope never changes?”", "«¿Qué es algo de ti que esperas que nunca cambie?»"],
          ["“What’s something you’re still figuring out?”", "«¿Qué es algo que todavía estás descubriendo?»"]] },
    { c: "#356B25", t: ["Self-Compassion", "Autocompasión"], q: ["How do I talk to myself when things go wrong?", "¿Cómo me hablo cuando algo sale mal?"],
      p: [["“If your best friend made the same mistake, what would you say to them?”", "«Si tu mejor amigo cometiera el mismo error, ¿qué le dirías?»"],
          ["“Would you say that to yourself?”", "«¿Te dirías eso a ti mismo?»"]] },
    { c: "#9a6f24", t: ["Forgiveness", "Perdón"], q: ["What do we do after something goes wrong?", "¿Qué hacemos después de que algo sale mal?"],
      p: [["“Is there anything from today that still needs repairing?”", "«¿Hay algo de hoy que todavía necesite reparación?»"]], cycle: true },
    { c: "#523C9E", t: ["Grace", "Gracia"], q: ["How can we meet each other with understanding?", "¿Cómo podemos tratarnos con comprensión?"],
      p: [["“What might I not know about what someone else is carrying today?”", "«¿Qué podría no saber yo sobre lo que otra persona está cargando hoy?»"]] }
  ];

  /* ─── Home ↔ School · shared language, never shared surveillance ──────── */
  var HS_PAIRS = [
    { n: ["Mask vs. Mirror", "Máscara y espejo"],
      sc: ["The class talks about the difference between the self we show and the self we are.", "La clase habla de la diferencia entre el yo que mostramos y el yo que somos."],
      hm: ["“Where did you feel like you had to wear a mask today?”", "«¿Dónde sentiste hoy que tenías que ponerte una máscara?»"] },
    { n: ["Rupture & Repair", "Ruptura y reparación"],
      sc: ["The class learns that relationships break a little and can be repaired on purpose.", "La clase aprende que las relaciones se quiebran un poco y pueden repararse a propósito."],
      hm: ["“Is there anything from today that still needs repairing?”", "«¿Hay algo de hoy que todavía necesite reparación?»"] },
    { n: ["The Four Pillars", "Los cuatro pilares"],
      sc: ["Identity, Self-Compassion, Forgiveness, Grace — named and practiced in lessons.", "Identidad, autocompasión, perdón y gracia — se nombran y practican en las lecciones."],
      hm: ["“Which pillar did today lean on?”", "«¿De cuál pilar dependió el día de hoy?»"] }
  ];

  /* ─── Navigation ──────────────────────────────────────────────────────── */
  var view = "hub";
  var HASHES = {
    hub: "family", checkin: "family/check-in", talk: "family/conversation", repair: "family/repair", grow: "family/grow",
    pillars: "family/pillars", say: "family/what-can-i-say", wonttalk: "family/wont-talk",
    hardday: "family/hard-day", five: "family/five-minutes", words: "family/words",
    homeschool: "family/home-school"
  };
  function nav(v, push) {
    if (v === "onesmall") { showHub(push !== false); scrollOst(); return; }
    view = HASHES[v] ? v : "hub";
    if (push !== false) setHash(HASHES[view] || "family");
    if (view === "repair") repairStep = 0;
    if (view === "checkin") ckReset();
    render();
    if (view !== "hub") focusPanel();
  }
  function showHub(push) {
    view = "hub";
    if (push !== false) setHash("family");
    render();
  }
  function focusPanel() {
    try {
      var m = el(MOUNT); if (!m) return;
      var tb = document.querySelector(".topbar");
      var off = (tb ? tb.offsetHeight : 70) + 14;
      var y = m.getBoundingClientRect().top + window.pageYOffset - off;
      window.scrollTo({ top: Math.max(0, y), behavior: motion() ? "smooth" : "auto" });
      var h = m.querySelector(".fdx-h2");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    } catch (e) {}
  }
  function scrollFamilyMode() {
    try {
      var a = el("famModeAnchor");
      if (a) a.scrollIntoView({ behavior: motion() ? "smooth" : "auto", block: "start" });
    } catch (e) {}
  }
  function scrollOst() {
    try {
      var a = el("fdxOst");
      if (a) a.scrollIntoView({ behavior: motion() ? "smooth" : "auto", block: "center" });
    } catch (e) {}
  }
  function goTool(kind) {
    if (kind === "quiet") {
      if (typeof window.showStationMode === "function") { try { window.showStationMode(); return; } catch (e) {} }
      location.hash = "#tools/quiet"; return;
    }
    if (kind === "move") { location.hash = "#tools/move"; return; }
    if (kind === "pecs") { if (typeof window.showScreen === "function") { window.showScreen("screen-pecs"); setHash("pecs"); } return; }
    if (kind === "tell") { location.hash = "#tools/tell"; return; }
    if (kind === "myvoice") {
      /* .30em · the child's own voice. The This Is Me who-door
         (AOG-TIM-WHO-V1), opened in place over the family page — closing
         it lands back home, never on a dashboard. Nothing is sent unless
         the child taps Send; a device with no connection and no link dest
         fails closed on Send and can still build and print. */
      if (typeof window.aogTimOpenWho === "function") { try { window.aogTimOpenWho({ home: true }); return; } catch (e) {} }
      location.href = location.origin + location.pathname + "?thisisme=1"; return;
    }
    if (kind === "tools") { location.hash = "#tools"; return; }
  }

  /* Deep links: #family/<pathway>. Anything unrecognized lands on the hub. */
  window.aogFamilyRoute = function (sub) {
    sub = String(sub || "").toLowerCase().replace(/[^a-z-]/g, "");
    var map = {
      "check-in": "checkin", "checkin": "checkin",
      "conversation": "talk", "talk": "talk", "tonight": "talk",
      "repair": "repair", "after": "repair", "rupture": "repair",
      "grow": "grow", "toolkit": "grow",
      "pillars": "pillars", "four-pillars": "pillars",
      "what-can-i-say": "say", "say": "say",
      "wont-talk": "wonttalk", "wonttalk": "wonttalk", "quiet-child": "wonttalk",
      "hard-day": "hardday", "hardday": "hardday", "today-was-hard": "hardday", "hard": "hardday",
      "five-minutes": "five", "five": "five",
      "words": "words", "hard-moment": "words",
      "one-small-thing": "onesmall", "onesmallthing": "onesmall", "small": "onesmall",
      "home-school": "homeschool", "homeschool": "homeschool", "bridge": "homeschool"
    };
    if (sub === "grace-at-home" || sub === "graceathome") { if (typeof window.aogOpenEco === "function") window.aogOpenEco("home"); return; }
    if (sub === "parents" || sub === "caregivers") { if (typeof window.aogOpenEco === "function") window.aogOpenEco("parents"); return; }
    if (sub === "tools") { goTool("tools"); return; }
    if (sub === "my-voice" || sub === "myvoice" || sub === "voice") { goTool("myvoice"); return; }
    var routed = map[sub] || "hub";
    nav(routed, false);
    /* Keep the pathway in the address bar: openFamily() has already written
       #family by the time a deep link routes, and a parent who copies the
       address should copy the door they are standing in. */
    if (HASHES[routed] && routed !== "hub") setHash(HASHES[routed]);
  };

  /* ─── Print · a window of its own (the .29bb lesson) ──────────────────── */
  function printDoc(title, inner) {
    var w = null;
    try { w = window.open("", "_blank", "width=800,height=900"); } catch (e) {}
    if (!w) { try { window.print(); } catch (e2) {} return; }
    var css =
      "@page{size:Letter;margin:16mm}body{font-family:Georgia,'Times New Roman',serif;color:#1d2733;margin:0;padding:24px}" +
      "h1{font-size:22px;color:#0A1E33;margin:0 0 4px}" +
      ".sub{font-size:12px;color:#667;margin:0 0 18px}" +
      ".card{border:1.5px solid #C9BFa6;border-left:5px solid #D9A33B;border-radius:10px;padding:14px 18px;margin:0 0 12px;font-size:16px;line-height:1.5;page-break-inside:avoid}" +
      ".foot{font-size:11px;color:#889;margin-top:20px;border-top:1px solid #ddd;padding-top:8px}";
    w.document.write("<!doctype html><html><head><meta charset='utf-8'><title>" + esc(title) + "</title><style>" + css + "</style></head><body>" +
      "<h1>" + esc(title) + "</h1><p class='sub'>Architecture of Grace · architectureofgrace.com/family</p>" + inner +
      "<p class='foot'>" + (es() ? "Recorta las tarjetas para el refrigerador, el auto o la mesa de noche." : "Cut the cards apart for the fridge, the car, or the bedside.") + "</p>" +
      "</body></html>");
    w.document.close();
    try { w.focus(); w.print(); } catch (e) {}
  }
  function printCards(title, texts) {
    printDoc(title, texts.map(function (t) { return "<div class='card'>" + esc(t) + "</div>"; }).join(""));
  }

  /* ─── Share exactly one prompt — text only, never answers or history ──── */
  function sharePrompt(text) {
    var payload = text + " — architectureofgrace.com/family";
    try {
      if (navigator.share) { navigator.share({ text: payload }).catch(function () {}); return; }
    } catch (e) {}
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload);
        var n = el("fdxShareNote");
        if (n) { n.textContent = es() ? "Copiado — pégalo donde quieras." : "Copied — paste it anywhere."; }
      }
    } catch (e) {}
  }

  /* ─── Small render helpers ────────────────────────────────────────────── */
  function backBtn() {
    return '<button type="button" class="fdx-back" data-nav="hub">&larr; ' + (es() ? "Volver a Familia" : "Back to Family") + '</button>';
  }
  function privLine(extra) {
    return '<p class="fdx-note">' + (es() ? "Privado en este dispositivo. Nada se comparte automáticamente." : "Private to this device. Nothing is shared automatically.") + (extra ? " " + extra : "") + '</p>';
  }

  /* ─── Let's check in · a shared moment, never a survey ────────────────
     Jimmy, 2026-08-30, on the hub's Check-in door opening the seasonal
     Family Mode instrument: "I don't think it should be the seasonal
     assessment." This flow is the handoff's sections 08-11: who's checking
     in, a feeling named, a need answered with ONE small step. Nothing is
     scored, nothing is saved, nothing is sent - the growth-over-time layer
     stays below as Family Mode, linked at the end for families who want it. */
  var ck = { step: 0, who: null, feels: [], need: null };
  function ckReset() { ck = { step: 0, who: null, feels: [], need: null }; }
  var CK_FEEL_BIG = [
    ["Calm", "Tranquilo"], ["Tired", "Cansado"], ["Worried", "Preocupado"],
    ["Excited", "Emocionado"], ["Frustrated", "Frustrado"], ["Okay", "Bien"],
    ["Sad", "Triste"], ["Overwhelmed", "Abrumado"], ["Proud", "Orgulloso"],
    ["Lonely", "Solo"], ["Hopeful", "Con esperanza"], ["Stretched thin", "Al l\u00edmite"]
  ];
  var CK_FEEL_KID = [
    ["Happy", "Feliz"], ["Sad", "Triste"], ["Mad", "Enojado"], ["Tired", "Cansado"],
    ["Silly", "Juguet\u00f3n"], ["Worried", "Preocupado"], ["Excited", "Emocionado"],
    ["Calm", "Tranquilo"], ["Not so great", "No muy bien"], ["Big feelings", "Sentimientos grandes"]
  ];
  var CK_NEEDS = [
    { t: ["Quiet", "Silencio"], r: ["A quieter space first \u2014 words can wait.", "Primero un espacio m\u00e1s tranquilo \u2014 las palabras pueden esperar."], act: ["Open Quiet Space \u2192", "Abrir el Espacio de Calma \u2192"], go: "quiet" },
    { t: ["To move", "Moverme"], r: ["Two minutes of motion changes everything that comes after.", "Dos minutos de movimiento cambian todo lo que sigue."], act: ["Try Movement \u2192", "Probar Movimiento \u2192"], go: "move" },
    { t: ["To talk", "Hablar"], r: ["Here is one door you could open together:", "Aqu\u00ed hay una puerta que podr\u00edan abrir juntos:"], act: ["More conversations \u2192", "M\u00e1s conversaciones \u2192"], go: "talk", prompt: true },
    { t: ["Help with something", "Ayuda con algo"], r: ["You don't have to find the words alone.", "No tienes que encontrar las palabras a solas."], act: ["I need to tell someone \u2192", "Necesito decirle a alguien \u2192"], go: "tell" },
    { t: ["A do-over", "Volver a empezar"], r: ["Something still stings. That's what repair is for.", "Algo todav\u00eda duele. Para eso existe la reparaci\u00f3n."], act: ["Start a repair \u2192", "Iniciar una reparaci\u00f3n \u2192"], go: "repair" },
    { t: ["Company", "Compa\u00f1\u00eda"], r: ["Then stay close. Sitting together counts \u2014 nothing needs fixing right now.", "Entonces qu\u00e9dense cerca. Estar juntos ya cuenta \u2014 nada necesita arreglarse ahora."], act: null, go: null },
    { t: ["Nothing \u2014 just this", "Nada \u2014 solo esto"], r: ["Noticing is enough. That was the whole thing.", "Notarlo es suficiente. Eso era todo."], act: null, go: null }
  ];
  function ckFeelBank() { return ck.who === "child" ? CK_FEEL_KID : CK_FEEL_BIG; }
  function ckStepBack() {
    return '<button type="button" class="fdx-back" data-act="ck-back">&larr; ' + (es() ? "Atr\u00e1s" : "Back") + '</button> ';
  }
  function vCheckin() {
    var out = backBtn();
    if (ck.step === 0) {
      out += '<h3 class="fdx-h2">' + (es() ? "Vamos a registrarnos." : "Let\u2019s check in.") + '</h3>' +
        '<p class="fdx-sub">' + (es() ? "No necesitan tener las palabras correctas. No necesitan estar de acuerdo. Solo empiecen donde est\u00e1n." : "You don\u2019t need to have the right words. You don\u2019t need to agree. Just start where you are.") + '</p>' +
        '<button type="button" class="fdx-opt" data-ckwho="parent"><span style="flex:1;"><b>' + (es() ? "Soy madre, padre o cuidador" : "I\u2019m a parent or caregiver") + '</b></span><span class="fdx-arr">&rarr;</span></button>' +
        '<button type="button" class="fdx-opt" data-ckwho="child"><span style="flex:1;"><b>' + (es() ? "Soy ni\u00f1o o joven" : "I\u2019m a child or young person") + '</b></span><span class="fdx-arr">&rarr;</span></button>' +
        '<button type="button" class="fdx-opt" data-ckwho="together"><span style="flex:1;"><b>' + (es() ? "Nos registramos juntos" : "We\u2019re checking in together") + '</b></span><span class="fdx-arr">&rarr;</span></button>' +
        '<p class="fdx-note">' + (es() ? "Nada se punt\u00faa. Nada se guarda ni se env\u00eda." : "Nothing is scored. Nothing is saved or sent.") + '</p>';
      return out;
    }
    if (ck.step === 1) {
      var bank = ckFeelBank();
      var chips = bank.map(function (f, i) {
        var on = ck.feels.indexOf(i) > -1;
        return '<button type="button" class="fdx-chip" data-ckfeel="' + i + '" aria-pressed="' + (on ? "true" : "false") + '"' +
          (on ? ' style="background:var(--gold,#D9A33B);border-color:var(--gold,#D9A33B);"' : '') + '>' + T(f) + '</button>';
      }).join("");
      out += ckStepBack() +
        '<h3 class="fdx-h2">' + (es() ? "\u00bfC\u00f3mo est\u00e1s ahora mismo?" : "How are you, right now?") + '</h3>' +
        '<p class="fdx-sub">' + (es() ? "Toca lo que m\u00e1s se parezca. No hay respuesta correcta, y saltarlo tambi\u00e9n vale." : "Tap whatever is closest. There\u2019s no right answer, and skipping is allowed too.") +
        (ck.who === "together" ? " " + (es() ? "T\u00farnense \u2014 y respuestas distintas est\u00e1n permitidas. De eso se trata." : "Take turns \u2014 and different answers are allowed. That\u2019s the point.") : "") + '</p>' +
        '<div class="fdx-row" style="justify-content:flex-start;">' + chips + '</div>' +
        '<div class="fdx-row" style="justify-content:flex-start;margin-top:12px;">' +
          '<button type="button" class="fdx-btn solid" data-act="ck-next">' + (es() ? "Seguir" : "Continue") + '</button>' +
        '</div>';
      return out;
    }
    if (ck.step === 2) {
      out += ckStepBack() +
        '<h3 class="fdx-h2">' + (es() ? "\u00bfQu\u00e9 necesitas ahora?" : "What do you need right now?") + '</h3>' +
        '<p class="fdx-sub">' + (es() ? "Necesitar algo no es una exigencia \u2014 es informaci\u00f3n." : "Needing something isn\u2019t a demand \u2014 it\u2019s information.") + '</p>' +
        CK_NEEDS.map(function (n, i) {
          return '<button type="button" class="fdx-opt" data-ckneed="' + i + '"><span style="flex:1;"><b>' + T(n.t) + '</b></span><span class="fdx-arr">&rarr;</span></button>';
        }).join("");
      return out;
    }
    var n = CK_NEEDS[ck.need] || CK_NEEDS[CK_NEEDS.length - 1];
    var bank2 = ckFeelBank();
    var said = ck.feels.map(function (i) { return bank2[i] ? T(bank2[i]) : null; }).filter(Boolean).join(" \u00b7 ");
    out += ckStepBack() +
      '<h3 class="fdx-h2">' + (es() ? "Gracias por decirlo." : "Thank you for saying it.") + '</h3>' +
      (said ? '<p class="fdx-sub">' + (es() ? "Dijiste: " : "You said: ") + esc(said) + '.</p>' : "") +
      '<div class="fdx-card"><p class="fdx-prompt" style="margin:6px;font-size:19px;text-align:left;">' + T(n.r) + '</p>' +
      (n.prompt ? '<p class="fdx-prompt" style="margin:10px 6px;">' + esc(T(TONIGHT[daySeed() % TONIGHT.length])) + '</p>' : "") +
      (n.act ? '<div class="fdx-row" style="justify-content:flex-start;"><button type="button" class="fdx-btn" data-ckgo="' + n.go + '">' + T(n.act) + '</button></div>' : "") +
      '</div>' +
      (ck.who === "together" ? '<div class="fdx-row" style="justify-content:flex-start;"><button type="button" class="fdx-btn" data-act="ck-again">' + (es() ? "Turno de la siguiente persona \u2192" : "Next person\u2019s turn \u2192") + '</button></div>' : "") +
      '<div class="fdx-callout" style="margin-top:14px;">' + (es() ? "Eso fue un registro. Nada se puntu\u00f3. Nada se guard\u00f3 ni se envi\u00f3." : "That was a check-in. Nothing was scored. Nothing was saved or sent.") + '</div>' +
      '<div class="fdx-row" style="justify-content:flex-start;">' +
        '<button type="button" class="fdx-btn solid" data-act="ck-done">' + (es() ? "Listo" : "Done") + '</button>' +
        '<button type="button" class="fdx-btn" data-act="ck-track">' + (es() ? "La p\u00e1gina de nuestra familia (Modo Familia) \u2193" : "Our family page (Family Mode) \u2193") + '</button>' +
      '</div>';
    return out;
  }

  /* ─── Views ───────────────────────────────────────────────────────────── */
  function vHub() {
    var o = ostPick();
    var doors =
      '<div class="fdx-doors" role="list">' +
        door("checkin", "t-checkin", [["Check in", "Registrarnos"], ["How are we doing?", "¿Cómo estamos?"]]) +
        door("talk", "t-talk", [["Talk", "Conversar"], ["What do we need to say?", "¿Qué necesitamos decirnos?"]]) +
        door("repair", "t-repair", [["Repair", "Reparar"], ["Something went wrong?", "¿Algo salió mal?"]]) +
        door("grow", "t-grow", [["Grow", "Crecer"], ["What are we learning about ourselves?", "¿Qué estamos aprendiendo de nosotros?"]]) +
      '</div>';
    function door(navTo, cls, pair) {
      return '<button type="button" class="fdx-door ' + cls + '" data-nav="' + navTo + '" role="listitem">' +
        "<b>" + T(pair[0]) + "</b><span>" + T(pair[1]) + "</span>" +
        '<span class="fdx-go" aria-hidden="true">&rarr;</span></button>';
    }
    var quiet =
      '<div class="fdx-quiet">' +
        chip("hardday", ["Today was hard", "Hoy fue difícil"]) +
        chip("say", ["What can I say?", "¿Qué puedo decir?"]) +
        chip("words", ["Words for the hard moment", "Palabras para el momento difícil"]) +
        chip("five", ["We have five minutes", "Tenemos cinco minutos"]) +
        chip("homeschool", ["Home ↔ School", "Hogar ↔ Escuela"]) +
        '<button type="button" class="fdx-chip" data-tool="myvoice">' + (es() ? "Mi voz — con sus propias palabras" : "My Voice — in their own words") + '</button>' +
        '<button type="button" class="fdx-chip" data-tool="tools">' + (es() ? "¿Necesitan un respiro? Herramientas" : "Need a reset? Tools") + '</button>' +
      '</div>';
    function chip(navTo, pair) {
      return '<button type="button" class="fdx-chip" data-nav="' + navTo + '">' + T(pair) + '</button>';
    }
    var ost =
      '<div class="fdx-ost" id="fdxOst">' +
        '<div class="fdx-eyebrow">' + (es() ? "Una cosa pequeña" : "One small thing") + '</div>' +
        '<div class="fdx-ost-grid">' +
          '<div><p class="fdx-ost-k">' + (es() ? "Una pregunta" : "One question") + '</p><p class="fdx-ost-v">' + T(o.q) + '</p></div>' +
          '<div><p class="fdx-ost-k">' + (es() ? "Una frase" : "One sentence") + '</p><p class="fdx-ost-v">' + T(o.s) + '</p></div>' +
          '<div><p class="fdx-ost-k">' + (es() ? "Una acción" : "One small action") + '</p><p class="fdx-ost-v">' + T(o.a) + '</p></div>' +
          '<div><p class="fdx-ost-k">' + (es() ? "Un momento de gracia" : "One moment of grace") + '</p><p class="fdx-ost-v">' + T(o.g) + '</p></div>' +
        '</div>' +
        '<div class="fdx-row" style="justify-content:flex-start;">' +
          '<button type="button" class="fdx-btn" data-act="ost-another">' + (es() ? "Otra" : "Another") + '</button>' +
        '</div>' +
      '</div>';
    return '<div class="fdx-eyebrow">' + (es() ? "Bienvenidos a casa" : "Welcome home") + '</div>' +
      '<h2 class="fdx-q">' + (es() ? "¿Qué necesitan ahora mismo?" : "What do you need right now?") + '</h2>' +
      doors + quiet + ost;
  }

  function vTalk() {
    var band = talkBand || bandDefault();
    var cur = talkCurrent();
    var chips = BANDS.map(function (b) {
      var label = Array.isArray(b[1]) ? T(b[1]) : b[1];
      return '<button type="button" class="fdx-chip' + (b[0] === band ? '" style="background:var(--gold,#D9A33B);border-color:var(--gold,#D9A33B);' : '') + '" data-band="' + b[0] + '">' + label + '</button>';
    }).join("");
    var saved = savedAll();
    var savedHtml = saved.length ?
      '<div class="fdx-saved"><div class="fdx-eyebrow">' + (es() ? "Guardadas" : "Saved") + '</div>' +
        saved.map(function (p, i) {
          return '<div class="fdx-saved-item"><p>' + esc(es() ? p.es : p.en) + '</p>' +
            '<button type="button" class="fdx-x" data-unsave="' + i + '" aria-label="' + (es() ? "Quitar" : "Remove") + '">&times;</button></div>';
        }).join("") + '</div>' : "";
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "Una conversación para esta noche" : "One conversation for tonight") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "Una puerta, no un examen. Ábrela en la mesa, en el auto, o antes de dormir — y deja que la conversación vaya adonde quiera ir." : "A door, not a test. Open it at the table, in the car, or at bedtime — then let the conversation go where it wants to go.") + '</p>' +
      '<div class="fdx-row" style="justify-content:flex-start;">' + chips + '</div>' +
      '<p class="fdx-prompt" id="fdxPrompt">' + esc(T(cur)) + '</p>' +
      '<div class="fdx-row">' +
        '<button type="button" class="fdx-btn solid" data-act="talk-another">' + (es() ? "Otra" : "Try another") + '</button>' +
        '<button type="button" class="fdx-btn" data-act="talk-save">' + (es() ? "Guardar esta" : "Save this one") + '</button>' +
        '<button type="button" class="fdx-btn" data-act="talk-print">' + (es() ? "Imprimir unas cuantas" : "Print a few") + '</button>' +
        '<button type="button" class="fdx-btn" data-act="talk-share">' + (es() ? "Compartir" : "Share") + '</button>' +
      '</div>' +
      '<p class="fdx-note" id="fdxShareNote">' + (es() ? "Compartir envía solo el texto de esta pregunta — nunca respuestas ni historial." : "Share sends only this question’s text — never answers, never history.") + '</p>' +
      savedHtml + privLine();
  }

  function vRepair() {
    var st = REPAIR_STEPS[repairStep];
    var dots = REPAIR_STEPS.map(function (_, i) { return "<i" + (i <= repairStep ? ' class="on"' : "") + "></i>"; }).join("");
    var body = '<p class="fdx-prompt" style="text-align:left;font-size:19px;margin:10px 2px 14px;">' + T(st.b) + '</p>';
    var extra = "";
    if (repairStep === 0) {
      extra = '<div class="fdx-callout">' +
        (es() ? "<b>No tenemos que estar de acuerdo.</b> Dos personas pueden vivir el mismo momento de maneras distintas. Nadie tiene que estar equivocado para que las dos historias sean reales. La meta es entender — no decidir quién tiene la razón."
              : "<b>We don’t have to agree.</b> Two people can experience the same moment differently. Nobody has to be wrong for both stories to be real. The goal is understanding — not deciding who’s right.") + '</div>';
    }
    if (repairStep === 1) {
      extra = '<div class="fdx-row" style="justify-content:flex-start;"><button type="button" class="fdx-btn" data-tool="quiet">' +
        (es() ? "Abrir una herramienta de calma" : "Open a calming tool") + '</button></div>';
    }
    var last = repairStep === REPAIR_STEPS.length - 1;
    var save = "";
    if (last) {
      var who = null;
      try { who = window._familySel || null; } catch (e) {}
      if (who) {
        save = '<div class="fdx-card" style="margin-top:14px;">' +
          '<div class="fdx-eyebrow">' + (es() ? "Opcional · guardar este momento" : "Optional · keep this moment") + '</div>' +
          '<textarea id="fdxRepairNote" rows="2" style="width:100%;box-sizing:border-box;border:1px solid var(--rule,#E6DCC4);border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;background:var(--card,#fff);color:var(--ink,#1d2733);" placeholder="' +
          (es() ? "¿Qué pasó, y cómo lo repararon juntos?" : "What happened, and how did you repair it together?") + '"></textarea>' +
          '<div class="fdx-row" style="justify-content:flex-start;margin-top:8px;">' +
            '<button type="button" class="fdx-btn" data-act="repair-save">' + (es() ? "Guardar en momentos de reparación" : "Save to repair moments") + '</button>' +
          '</div>' + privLine() + '</div>';
      }
    }
    var nextLabel = last ? (es() ? "Terminar" : "Done") : (es() ? "Siguiente" : "Next");
    return backBtn() +
      '<h3 class="fdx-h2">' + T(st.h) + '</h3>' +
      '<div class="fdx-step-dots" aria-hidden="true">' + dots + '</div>' +
      body + extra + save +
      '<div class="fdx-row">' +
        (repairStep > 0 ? '<button type="button" class="fdx-btn" data-act="repair-prev">' + (es() ? "Atrás" : "Back") + '</button>' : "") +
        '<button type="button" class="fdx-btn solid" data-act="' + (last ? "repair-done" : "repair-next") + '">' + nextLabel + '</button>' +
      '</div>';
  }

  function vGrow() {
    function opt(attr, t, s) {
      return '<button type="button" class="fdx-opt" ' + attr + '><span style="flex:1;"><b>' + T(t) + '</b><span>' + T(s) + '</span></span><span class="fdx-arr">&rarr;</span></button>';
    }
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "Crecer juntos" : "Growing together") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "No necesitas dar lecciones. Notar, preguntar, escuchar, reparar — con eso basta." : "You don’t need to deliver lessons. Notice, ask, listen, repair — that’s the whole job.") + '</p>' +
      opt('data-eco="home"', ["Grace at Home", "La Gracia en Casa"], ["A simple weekly rhythm — one idea, one question, one small practice.", "Un ritmo semanal sencillo — una idea, una pregunta, una práctica pequeña."]) +
      opt('data-nav="pillars"', ["The Four Pillars at Home", "Los cuatro pilares en casa"], ["Identity · Self-Compassion · Forgiveness · Grace, as kitchen-table questions.", "Identidad · Autocompasión · Perdón · Gracia, como preguntas de sobremesa."]) +
      opt('data-nav="homeschool"', ["Home ↔ School", "Hogar ↔ Escuela"], ["One shared language, so nobody has to translate between two worlds.", "Un solo lenguaje compartido, para que nadie tenga que traducir entre dos mundos."]) +
      opt('data-eco="parents"', ["For Parents & Caregivers", "Para madres, padres y cuidadores"], ["Your own reflection and pathway — you don’t need perfect words, just somewhere to start.", "Tu propia reflexión y camino — no necesitas palabras perfectas, solo un lugar donde empezar."]) +
      opt('data-act="grow-rhythms"', ["Gentle rhythms", "Ritmos suaves"], ["Small repeated moments — morning, after school, dinner, bedtime. No streaks, ever.", "Pequeños momentos repetidos — mañana, después de clases, cena, antes de dormir. Sin rachas, nunca."]) +
      opt('data-act="grow-print"', ["Printables", "Imprimibles"], ["The Four Pillars at Home one-pager, and conversation cards for the fridge.", "El resumen de los cuatro pilares en casa, y tarjetas de conversación para el refrigerador."]);
  }

  function vPillars() {
    var cards = PILLARS.map(function (p) {
      var cyc = p.cycle ?
        '<div class="fdx-cycle"><b>' + (es() ? "ruptura" : "rupture") + '</b><span>&rarr;</span><b>' + (es() ? "reflexión" : "reflection") + '</b><span>&rarr;</span><b>' + (es() ? "reparación" : "repair") + '</b><span>&rarr;</span><b>' + (es() ? "regreso" : "return") + '</b></div>' : "";
      return '<div class="fdx-pillar" style="border-left-color:' + p.c + ';">' +
        "<h4>" + T(p.t) + "</h4>" +
        '<p class="q">' + T(p.q) + '</p>' +
        p.p.map(function (pr) { return '<div class="fdx-phrase" style="border-left-color:' + p.c + ';">' + T(pr) + '</div>'; }).join("") +
        cyc + '</div>';
    }).join("");
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "Los cuatro pilares en casa" : "The Four Pillars at Home") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "Las mismas cuatro ideas que se nombran en la escuela, como preguntas que caben en una cena." : "The same four ideas named at school, as questions that fit inside a dinner.") + '</p>' +
      cards +
      '<div class="fdx-row" style="justify-content:flex-start;">' +
        '<a class="fdx-btn" style="text-decoration:none;display:inline-flex;align-items:center;" href="AoG-Four-Pillars-at-Home' + (es() ? "-ES" : "") + '.pdf" target="_blank" rel="noopener">' + (es() ? "Imprimible de una página (PDF)" : "One-page printable (PDF)") + '</a>' +
      '</div>';
  }

  function vSay() {
    var cards = SAY.map(function (s, i) {
      var pairs = s.y.map(function (y) {
        return '<div class="try"><span class="fdx-lab">' + (es() ? "Prueba" : "Try") + '</span>' + T(y) + '</div>';
      }).join("");
      var link = s.link ?
        '<div class="fdx-row" style="justify-content:flex-start;padding:0 15px 12px;"><button type="button" class="fdx-btn" data-nav="' + s.link + '" style="min-height:38px;padding:7px 14px;font-size:13px;">' +
        (s.link === "repair" ? (es() ? "Iniciar una reparación →" : "Start a repair →") : (es() ? "Cuando no quiere hablar →" : "When they won’t talk →")) + '</button></div>' : "";
      return '<div class="fdx-pair">' +
        '<div style="padding:11px 15px 0;"><b style="font-family:var(--font-serif,Georgia,serif);font-size:17px;color:var(--navy,#0A1E33);">' + T(s.t) + '</b></div>' +
        '<div class="in"><span class="fdx-lab">' + (es() ? "En vez de" : "Instead of") + '</span><s>' + T(s.i) + '</s></div>' +
        pairs + link + '</div>';
    }).join("");
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "¿Qué puedo decir?" : "What can I say?") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "No eres un mal padre por quedarte sin palabras. Esto solo te presta otra frase cuando las tuyas no llegan." : "You’re not a bad parent for running out of words. This just lends you another sentence when yours aren’t available.") + '</p>' + cards;
  }

  function vWords() {
    var cards = WORDS.map(function (w) { return '<div class="fdx-phrase">' + T(w) + '</div>'; }).join("");
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "Palabras para el momento difícil" : "Words for the hard moment") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "Frases listas para usar, en el idioma de esta casa. Tómalas prestadas hasta que vuelvan las tuyas." : "Ready-to-use phrases, in this house’s language. Borrow them until your own come back.") + '</p>' +
      cards +
      '<div class="fdx-row" style="justify-content:flex-start;">' +
        '<button type="button" class="fdx-btn" data-act="words-print">' + (es() ? "Imprimir las tarjetas" : "Print the cards") + '</button>' +
      '</div>';
  }

  function vHardday() {
    var open = vHardday._open;
    var cards = HARD.map(function (h, i) {
      var body = (open === i) ?
        '<div style="padding:2px 15px 13px;">' +
          '<p style="font-size:14.5px;line-height:1.55;color:var(--ink,#1d2733);margin:0 0 10px;">' + T(h.s) + '</p>' +
          '<button type="button" class="fdx-btn" data-hard-go="' + i + '" style="min-height:40px;">' + T(h.act) + '</button>' +
        '</div>' : "";
      return '<div class="fdx-pair" style="background:var(--card,#fff);">' +
        '<button type="button" class="fdx-opt" style="border:0;border-radius:0;margin:0;" data-hard="' + i + '" aria-expanded="' + (open === i ? "true" : "false") + '">' +
          '<span style="flex:1;"><b>' + T(h.t) + '</b></span><span class="fdx-arr">' + (open === i ? "&minus;" : "+") + '</span></button>' + body + '</div>';
    }).join("");
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "Hoy fue difícil." : "Today was hard.") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "No llegaste tarde y no lo arruinaste. Elige lo que más se parezca, y toma un solo paso pequeño." : "You’re not late, and you haven’t ruined it. Pick whichever fits, and take one small step.") + '</p>' + cards;
  }
  vHardday._open = null;

  function vWonttalk() {
    var cards = WONT.map(function (w) { return '<div class="fdx-phrase">' + T(w) + '</div>'; }).join("");
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "Mi hijo no quiere hablar" : "My child won’t talk") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "En lugar de «dime cómo te sientes», prueba una de estas — y deja que el silencio también sea una respuesta." : "Instead of “tell me how you feel,” try one of these — and let silence be an answer too.") + '</p>' +
      cards +
      '<div class="fdx-callout">' + (es() ? "El silencio no es un fracaso. Quedarte cerca ya es una respuesta." : "Silence isn’t failure. Staying nearby is already an answer.") + '</div>' +
      '<div class="fdx-row" style="justify-content:flex-start;">' +
        '<button type="button" class="fdx-btn" data-tool="pecs">' + (es() ? "Prefiere mostrar → tarjetas con imágenes" : "Rather show → picture cards") + '</button>' +
        '<button type="button" class="fdx-btn" data-tool="quiet">' + (es() ? "Silencio juntos → Espacio de Calma" : "Quiet together → Quiet Space") + '</button>' +
      '</div>';
  }

  function vFive() {
    function opt(attr, t, s) {
      return '<button type="button" class="fdx-opt" ' + attr + '><span style="flex:1;"><b>' + T(t) + '</b><span>' + T(s) + '</span></span><span class="fdx-arr">&rarr;</span></button>';
    }
    var grat = vFive._grat ?
      '<div class="fdx-card"><p class="fdx-prompt" style="margin:6px;font-size:19px;">' +
        (es() ? "Cada quien nombra una cosa buena de hoy. Lo pequeño cuenta." : "Everyone names one good thing from today. Small counts.") + '</p>' +
        '<p class="fdx-note">' + (es() ? "Eso fue todo. De verdad." : "That was it. Really.") + '</p></div>' : "";
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "Tenemos cinco minutos." : "We have five minutes.") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "Suficiente. Elige una sola cosa, y al terminar, terminaron." : "That’s enough. Pick exactly one thing — and when it’s done, you’re done.") + '</p>' +
      opt('data-nav="talk"', ["One question", "Una pregunta"], ["Open one conversation door.", "Abre una puerta de conversación."]) +
      opt('data-nav="checkin"', ["One check-in", "Un registro"], ["How are we doing?", "¿Cómo estamos?"]) +
      opt('data-nav="repair"', ["One repair", "Una reparación"], ["Something small that still stings.", "Algo pequeño que todavía duele."]) +
      opt('data-act="five-grat"', ["One thing we’re grateful for", "Una cosa que agradecemos"], ["Small counts.", "Lo pequeño cuenta."]) +
      grat;
  }
  vFive._grat = false;

  function vHomeschool() {
    var pairs = HS_PAIRS.map(function (p) {
      return '<div class="fdx-hs-pair">' +
        '<div class="fdx-hs-cell"><span class="fdx-lab">' + (es() ? "En la escuela · " : "At school · ") + T(p.n) + '</span><p style="font-family:var(--font-sans,Inter,sans-serif);font-size:13.5px;color:var(--ink-soft,#5b6478);">' + T(p.sc) + '</p></div>' +
        '<div class="fdx-hs-cell"><span class="fdx-lab">' + (es() ? "En casa, puedes preguntar" : "At home, you can ask") + '</span><p>' + T(p.hm) + '</p></div>' +
      '</div>';
    }).join("");
    return backBtn() +
      '<h3 class="fdx-h2">' + (es() ? "Hogar ↔ Escuela" : "Home ↔ School") + '</h3>' +
      '<p class="fdx-sub">' + (es() ? "Tu hijo no debería tener que aprender dos idiomas emocionales distintos. Mismas palabras allá y acá — eso es todo el puente." : "Your child shouldn’t have to learn two different emotional languages. The same words there and here — that’s the whole bridge.") + '</p>' +
      pairs +
      '<div class="fdx-callout">' + (es() ? "<b>Lenguaje compartido, nunca vigilancia compartida.</b> Nada de lo que tu familia hace en esta página se envía a la escuela — y las reflexiones privadas de tu hijo en la escuela no se muestran aquí."
        : "<b>Shared language, never shared surveillance.</b> Nothing your family does on this page is sent to school — and your child’s private reflections at school are not shown here.") + '</div>' +
      '<div class="fdx-card">' +
        '<div class="fdx-eyebrow">' + (es() ? "¿Docente? ¿Enviando esto a casa?" : "Educator? Sending this home?") + '</div>' +
        '<p style="font-size:14px;line-height:1.55;color:var(--ink,#1d2733);margin:0;">' +
        (es() ? "Comparte <b>architectureofgrace.com/family</b> — abre esta página directamente. El concepto de esta semana en clase puede volverse una sola pregunta en la mesa esta noche."
              : "Share <b>architectureofgrace.com/family</b> — it opens this page directly. This week’s classroom concept can become one question at the table tonight.") + '</p>' +
      '</div>' +
      '<div class="fdx-row" style="justify-content:flex-start;">' +
        '<button type="button" class="fdx-btn" data-eco="bridge">' + (es() ? "La guía completa del puente →" : "The full bridge guide →") + '</button>' +
        '<button type="button" class="fdx-btn" data-eco="educators">' + (es() ? "Para educadores →" : "For educators →") + '</button>' +
      '</div>';
  }

  /* ─── Render + wire ───────────────────────────────────────────────────── */
  function render() {
    var m = el(MOUNT);
    if (!m) return;
    var html = "";
    if (view === "hub") html = vHub();
    else if (view === "checkin") html = vCheckin();
    else if (view === "talk") html = vTalk();
    else if (view === "repair") html = vRepair();
    else if (view === "grow") html = vGrow();
    else if (view === "pillars") html = vPillars();
    else if (view === "say") html = vSay();
    else if (view === "words") html = vWords();
    else if (view === "hardday") html = vHardday();
    else if (view === "wonttalk") html = vWonttalk();
    else if (view === "five") html = vFive();
    else if (view === "homeschool") html = vHomeschool();
    else html = vHub();
    m.innerHTML = view === "hub" ? html : '<div class="fdx-panel">' + html + '</div>';
    try {
      var sc = document.getElementById("screen-family");
      if (sc) sc.classList.toggle("fdx-panel-open", view !== "hub");
    } catch (e) {}
  }

  function onClick(e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-nav],[data-act],[data-band],[data-unsave],[data-eco],[data-tool],[data-hard],[data-hard-go],[data-ckwho],[data-ckfeel],[data-ckneed],[data-ckgo]") : null;
    if (!b) return;
    var m = el(MOUNT);
    if (!m || !m.contains(b)) return;
    var v;
    if ((v = b.getAttribute("data-nav"))) { nav(v, true); return; }
    if ((v = b.getAttribute("data-eco"))) { if (typeof window.aogOpenEco === "function") window.aogOpenEco(v); return; }
    if ((v = b.getAttribute("data-tool"))) { goTool(v); return; }
    if ((v = b.getAttribute("data-band"))) { talkBand = v; talkIdx = 0; render(); return; }
    if ((v = b.getAttribute("data-hard")) != null && v !== "") {
      vHardday._open = (vHardday._open === +v) ? null : +v; render(); return;
    }
    if ((v = b.getAttribute("data-hard-go")) != null && v !== "") {
      var h = HARD[+v]; if (!h) return;
      if (h.go === "quiet" || h.go === "move" || h.go === "pecs") { goTool(h.go); return; }
      nav(h.go, true); return;
    }
    if ((v = b.getAttribute("data-unsave")) != null && v !== "") {
      var a = savedAll(); a.splice(+v, 1); savedWrite(a); render(); return;
    }
    if ((v = b.getAttribute("data-ckwho"))) { ck.who = v; ck.step = 1; render(); focusPanel(); return; }
    if ((v = b.getAttribute("data-ckfeel")) != null && v !== "") {
      var fi = +v, fpos = ck.feels.indexOf(fi);
      if (fpos > -1) ck.feels.splice(fpos, 1); else ck.feels.push(fi);
      render(); return;
    }
    if ((v = b.getAttribute("data-ckneed")) != null && v !== "") { ck.need = +v; ck.step = 3; render(); focusPanel(); return; }
    if ((v = b.getAttribute("data-ckgo"))) {
      if (v === "talk" || v === "repair") { nav(v, true); } else { goTool(v); }
      return;
    }
    v = b.getAttribute("data-act");
    if (v === "ck-next") { ck.step = 2; render(); focusPanel(); return; }
    if (v === "ck-back") { ck.step = Math.max(0, ck.step - 1); if (ck.step < 3) ck.need = null; render(); return; }
    if (v === "ck-again") { ck.feels = []; ck.need = null; ck.step = 1; render(); focusPanel(); return; }
    if (v === "ck-done") { showHub(true); return; }
    if (v === "ck-track") { showHub(true); scrollFamilyMode(); return; }
    if (v === "ost-another") { ostShift++; render(); return; }
    if (v === "talk-another") { talkIdx++; var p = el("fdxPrompt"); if (p) p.textContent = T(talkCurrent()); else render(); return; }
    if (v === "talk-save") {
      var cur = talkCurrent(), all = savedAll();
      if (!all.some(function (x) { return x.en === cur[0]; })) { all.unshift({ en: cur[0], es: cur[1] }); savedWrite(all); }
      render(); return;
    }
    if (v === "talk-share") { sharePrompt(T(talkCurrent())); return; }
    if (v === "talk-print") {
      var deck = talkDeck(), curP = talkCurrent(), list = [T(curP)];
      savedAll().forEach(function (x) { var t = es() ? x.es : x.en; if (list.indexOf(t) === -1) list.push(t); });
      for (var i = 1; list.length < 6 && i < deck.length; i++) {
        var t2 = T(deck[(talkIdx + i) % deck.length]);
        if (list.indexOf(t2) === -1) list.push(t2);
      }
      printCards(es() ? "Conversaciones para esta noche" : "Conversations for tonight", list);
      return;
    }
    if (v === "words-print") {
      printCards(es() ? "Palabras para el momento difícil" : "Words for the hard moment",
        WORDS.map(function (w) { return T(w); }));
      return;
    }
    if (v === "repair-next") { repairStep = Math.min(repairStep + 1, REPAIR_STEPS.length - 1); render(); focusPanel(); return; }
    if (v === "repair-prev") { repairStep = Math.max(repairStep - 1, 0); render(); focusPanel(); return; }
    if (v === "repair-done") { showHub(true); return; }
    if (v === "repair-save") {
      var ta = el("fdxRepairNote"), who = null;
      try { who = window._familySel || null; } catch (e2) {}
      if (!ta || !who) return;
      var note = (ta.value || "").trim();
      if (!note) return;
      try {
        var allR = JSON.parse(localStorage.getItem("aog.repair.v1") || "{}");
        (allR[who] = allR[who] || []).unshift({ d: new Date().toISOString(), n: note.slice(0, 500) });
        localStorage.setItem("aog.repair.v1", JSON.stringify(allR));
        ta.value = "";
        var n2 = document.createElement("p"); n2.className = "fdx-note";
        n2.textContent = es() ? "Guardado en los momentos de reparación de " + who + "." : "Saved to " + who + "’s repair moments.";
        ta.parentNode.appendChild(n2);
      } catch (e3) {}
      return;
    }
    if (v === "five-grat") { vFive._grat = !vFive._grat; render(); return; }
    if (v === "grow-rhythms") {
      showHub(true); scrollFamilyMode();
      try { var r = el("aogRhythmsFam"); if (r) r.scrollIntoView({ behavior: motion() ? "smooth" : "auto", block: "start" }); } catch (e4) {}
      return;
    }
    if (v === "grow-print") {
      try { window.open("AoG-Four-Pillars-at-Home" + (es() ? "-ES" : "") + ".pdf", "_blank", "noopener"); } catch (e5) {}
      return;
    }
  }

  function boot() {
    var m = el(MOUNT);
    if (!m) return;
    render();
    document.addEventListener("click", onClick);
    /* Repaint when the language flips — same pattern as every other module. */
    try {
      new MutationObserver(function () { render(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch (e) {}
    /* Arriving at the Family screen from anywhere resets the hub, so the page
       always opens as a place, not as whatever panel was left open last. */
    if (typeof window.openFamily === "function" && !window.openFamily.__fdxWrapped) {
      var oF = window.openFamily;
      window.openFamily = function () {
        var r = oF.apply(this, arguments);
        try { view = "hub"; render(); } catch (e) {}
        return r;
      };
      window.openFamily.__fdxWrapped = true;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
