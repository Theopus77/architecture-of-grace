
/* =====================================================================
   ARCHITECTURE OF GRACE · bling that a 6th–8th grader respects — and works
   for every age. Earned, owned, real. No childish sparkle.

   - A daily word of grace, TONE-PICKED: Calm (real-talk) / Hype / Off
   - Universal ownership: accent color, on-device streak, opt-in sound
   - Earned completion on calm tools: a clean check + "time back" + streak
   - Reactive hero on the landing (pointer/tap accent light)
   - Personalize popover in the header (tone · accent · sound)
   Sound is OFF by default (honors the no-sound default). Reduced-motion respected.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- tiny helpers ---------- */
  function L() {
    try { if (typeof lang !== "undefined" && lang) return lang; } catch (e) {}
    try { if (typeof dashLang !== "undefined" && dashLang) return dashLang; } catch (e) {}
    return "en";
  }
  function t(en, es) { return L() === "es" ? es : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function $(s, r) { return (r || document).querySelector(s); }

  /* ---------- preferences (all on-device, universal) ---------- */
  var K_ACCENT = "aog.accent";      // gold | teal | violet | rose | sky | green
  var K_SOUND = "aog.sound";        // "1" | "0"           (default "0" = off)
  var K_STREAK = "aog.calm.streak"; // integer
  var K_LAST = "aog.calm.last";     // YYYY-MM-DD

  var K_AUD = "aog.grace.audience"; // child | teen | adult   (auto-detects from the tank audience; default teen)
  function audience() {
    var v = lsGet(K_AUD, "");
    if (v === "child" || v === "teen" || v === "adult") return v;
    var tank = lsGet("aog.tank.audience", "");
    if (tank === "child" || tank === "teen" || tank === "adult") return tank;
    return "teen";
  }
  function accent() { return lsGet(K_ACCENT, "gold"); }
  function soundOn() { return lsGet(K_SOUND, "0") === "1"; }

  var ACCENTS = ["gold", "teal", "violet", "rose", "sky", "green"];
  var ACCENT_LABEL = {
    gold: ["Gold", "Dorado"], teal: ["Teal", "Verde azulado"], violet: ["Violet", "Violeta"],
    rose: ["Rose", "Rosa"], sky: ["Sky", "Cielo"], green: ["Green", "Verde"]
  };

  function applyAccent() {
    var a = accent();
    try {
      if (a && a !== "gold" && ACCENTS.indexOf(a) >= 0) document.documentElement.setAttribute("data-accent", a);
      else document.documentElement.removeAttribute("data-accent");
    } catch (e) {}
  }

  /* =====================================================================
     WORDS OF GRACE — tailored by audience (Child / Teen / Adult), EN/ES.
     Date-seeded within the set so it's the same all day, fresh each day.
     ===================================================================== */
  var WORDS = {
    child: [
      ["You are a good friend to yourself today.", "Hoy eres un buen amigo para ti mismo."],
      ["Mistakes help your brain grow.", "Los errores ayudan a crecer tu cerebro."],
      ["It's okay to feel big feelings.", "Está bien sentir emociones grandes."],
      ["You can try again. That is brave.", "Puedes intentarlo otra vez. Eso es valiente."],
      ["You matter just because you are you.", "Importas solo por ser tú."],
      ["Take a slow breath. You've got this.", "Respira despacio. Tú puedes."],
      ["Being kind to yourself is strong.", "Ser amable contigo es ser fuerte."],
      ["You did your best, and that is enough.", "Hiciste tu mejor esfuerzo, y eso basta."],
      ["Your feelings are okay to have.", "Está bien tener tus sentimientos."],
      ["Small tries still count a lot.", "Los intentos pequeños también cuentan mucho."],
      ["Resting helps you feel better.", "Descansar te ayuda a sentirte mejor."],
      ["You are learning, and that is wonderful.", "Estás aprendiendo, y eso es maravilloso."],
      ["Your kindness makes the world brighter.", "Tu amabilidad hace el mundo más brillante."],
      ["It's okay to ask for help.", "Está bien pedir ayuda."],
      ["You are brave even when you feel scared.", "Eres valiente incluso cuando tienes miedo."],
      ["Every day is a chance to begin again.", "Cada día es una oportunidad para empezar de nuevo."],
      ["You are loved exactly as you are.", "Eres amado tal y como eres."],
      ["Your ideas are worth sharing.", "Vale la pena compartir tus ideas."],
      ["Slow and steady helps you learn.", "Despacio y con calma te ayuda a aprender."],
      ["You can be a friend to someone today.", "Hoy puedes ser amigo de alguien."],
      ["Big feelings get smaller when we breathe.", "Las emociones grandes se hacen pequeñas cuando respiramos."],
      ["You are stronger than you think.", "Eres más fuerte de lo que crees."],
      ["It's okay to go at your own pace.", "Está bien ir a tu propio ritmo."],
      ["You bring something special to your class.", "Traes algo especial a tu clase."],
      ["Trying something new is brave.", "Probar algo nuevo es valiente."],
      ["Your heart knows how to be kind.", "Tu corazón sabe ser amable."],
      ["You can do hard things, one step at a time.", "Puedes hacer cosas difíciles, paso a paso."],
      ["A deep breath is always with you.", "Una respiración profunda siempre está contigo."],
      ["You are enough, just like this.", "Eres suficiente, tal como eres."],
      ["Tomorrow is a fresh start.", "Mañana es un nuevo comienzo."]
    ],
    teen: [
      ["You don't have to have it all together right now.", "No tienes que tenerlo todo resuelto ahora mismo."],
      ["A bad moment isn't a bad person.", "Un mal momento no es una mala persona."],
      ["You're allowed to start over today.", "Tienes permiso de empezar de nuevo hoy."],
      ["You're more than your worst grade.", "Eres más que tu peor calificación."],
      ["Messing up means you're trying. Keep going.", "Equivocarte significa que lo intentas. Sigue."],
      ["Talk to yourself like someone you actually like.", "Háblate como a alguien que de verdad aprecias."],
      ["You've done hard things before. Today's no different.", "Ya has hecho cosas difíciles. Hoy no es distinto."],
      ["Resting isn't falling behind.", "Descansar no es quedarse atrás."],
      ["Progress is usually quiet.", "El progreso casi siempre es silencioso."],
      ["You're tougher than the hard part.", "Eres más fuerte que la parte difícil."],
      ["Your feelings make sense. You're not broken.", "Tus emociones tienen sentido. No estás roto."],
      ["One hard day is not the whole story.", "Un día difícil no es toda la historia."],
      ["Your worth isn't up for debate.", "Tu valor no está en discusión."],
      ["You're allowed to take up space.", "Tienes derecho a ocupar tu espacio."],
      ["Comparison is a thief — you're on your own timeline.", "La comparación roba — vas a tu propio ritmo."],
      ["Asking for help is a strength, not a weakness.", "Pedir ayuda es fortaleza, no debilidad."],
      ["You don't owe anyone a perfect version of you.", "No le debes a nadie una versión perfecta de ti."],
      ["Feelings aren't facts, but they still matter.", "Las emociones no son hechos, pero igual importan."],
      ["You can change your mind. That's growth.", "Puedes cambiar de opinión. Eso es crecer."],
      ["Rest is productive too.", "Descansar también es productivo."],
      ["You've survived every hard day so far.", "Has sobrevivido cada día difícil hasta ahora."],
      ["Your pace is not a competition.", "Tu ritmo no es una competencia."],
      ["It's okay to set the boundary.", "Está bien poner el límite."],
      ["You are not behind. You are becoming.", "No estás atrasado. Te estás formando."],
      ["Some days, just showing up is the win.", "Algunos días, solo presentarte ya es ganar."],
      ["You're allowed to be a work in progress.", "Tienes permiso de ser un trabajo en progreso."],
      ["The voice in your head can learn to be kinder.", "La voz en tu cabeza puede aprender a ser más amable."],
      ["You matter beyond what you produce.", "Importas más allá de lo que produces."],
      ["Courage is feeling scared and going anyway.", "El valor es tener miedo y seguir de todos modos."],
      ["This feeling will pass. You will stay.", "Este sentimiento pasará. Tú permanecerás."]
    ],
    adult: [
      ["You can't pour from an empty cup — refill yours too.", "No puedes dar desde una taza vacía — llena la tuya también."],
      ["Rest is not a reward you have to earn.", "El descanso no es un premio que debas ganar."],
      ["You are more than your most exhausting day.", "Eres más que tu día más agotador."],
      ["Grace for others starts with grace for yourself.", "La gracia para otros empieza con la gracia para ti."],
      ["A hard day is not a verdict on your worth.", "Un día difícil no es un veredicto sobre tu valor."],
      ["Be as patient with yourself as you are with them.", "Ten contigo la misma paciencia que tienes con ellos."],
      ["You're allowed to begin again, gently.", "Tienes permiso de empezar de nuevo, con calma."],
      ["Caring for yourself is part of caring for them.", "Cuidarte es parte de cuidarlos."],
      ["Small steps still move the work forward.", "Los pasos pequeños también hacen avanzar el trabajo."],
      ["You're doing more good than you can see.", "Haces más bien del que puedes ver."],
      ["Speak to yourself the way you would a friend.", "Háblate como le hablarías a un amigo."],
      ["Tending to your own calm is not selfish.", "Cuidar tu propia calma no es egoísmo."],
      ["You are allowed to need what you give.", "Tienes derecho a necesitar lo que das."],
      ["Your worth isn't measured in productivity.", "Tu valor no se mide en productividad."],
      ["You can hold high standards and self-compassion at once.", "Puedes tener altos estándares y autocompasión a la vez."],
      ["Setting a boundary is an act of care.", "Poner un límite es un acto de cuidado."],
      ["You don't have to earn your rest.", "No tienes que ganarte el descanso."],
      ["Tending your own nervous system steadies the room.", "Cuidar tu propio sistema nervioso calma la sala."],
      ["You are more than the sum of your to-do list.", "Eres más que la suma de tu lista de tareas."],
      ["It's okay to not be okay, and to keep going.", "Está bien no estar bien, y seguir adelante."],
      ["Your presence matters more than your perfection.", "Tu presencia importa más que tu perfección."],
      ["You can begin again at any hour of the day.", "Puedes empezar de nuevo a cualquier hora del día."],
      ["Compassion fatigue is real — refill, don't run empty.", "La fatiga por compasión es real — recarga, no te vacíes."],
      ["The calm you model is a gift they keep.", "La calma que modelas es un regalo que ellos conservan."],
      ["You are doing sacred, often unseen work.", "Haces un trabajo sagrado, a menudo invisible."],
      ["Lower the bar to the floor on the hard days.", "Baja la vara hasta el suelo en los días difíciles."],
      ["You deserve the patience you extend to others.", "Mereces la paciencia que ofreces a los demás."],
      ["Breathe. You are allowed to slow down.", "Respira. Tienes permiso de ir más despacio."],
      ["Your gentleness is strength under control.", "Tu ternura es fuerza bajo control."],
      ["Be gentle with the person carrying everything — you.", "Sé amable con la persona que carga todo — tú."]
    ]
  };
  function dayIndex(len) {
    var d = new Date();
    var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return ((n % len) + len) % len;
  }
  function todaysWord(setName) {
    var set = WORDS[setName] || WORDS.teen;
    /* Fresh pick on every load/refresh — avoid repeating the immediately previous one */
    var i = Math.floor(Math.random() * set.length);
    if (set.length > 1 && i === todaysWord._last) i = (i + 1) % set.length;
    todaysWord._last = i;
    return esc(set[i][L() === "es" ? 1 : 0]);
  }

  /* ---- daily word of grace on the Tools page (audience-aware, always shown) ---- */
  function placeGraceWord() {
    var scr = document.getElementById("screen-teacher-tools"); if (!scr) return;
    var cont = scr.querySelector(".container") || scr;
    var el = document.getElementById("aogGraceWord");
    if (!el) {
      el = document.createElement("div"); el.id = "aogGraceWord"; el.className = "aog-grace-word";
      var h = cont.querySelector("h1");
      var headBlock = h ? h.parentNode : null;
      if (headBlock && headBlock.parentNode) headBlock.parentNode.insertBefore(el, headBlock.nextSibling);
      else cont.insertBefore(el, cont.firstChild);
    }
    el.className = "aog-grace-word";
    el.innerHTML =
      '<button class="agw-cog" type="button" aria-haspopup="true" aria-label="' + t("Personalize", "Personalizar") + '" title="' + t("Personalize", "Personalizar") + '" data-aog-open-pz="1">'
        + '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="8" x2="20" y2="8"/><circle cx="9" cy="8" r="2.4"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="15" cy="16" r="2.4"/></svg>'
      + '</button>'
      + '<span class="agw-dot" aria-hidden="true"></span>'
      + '<span class="agw-eyebrow">' + t("A word of grace", "Una palabra de gracia") + '</span>'
      + '<span class="agw-text">' + todaysWord(audience()) + '</span>';
    var cog = el.querySelector(".agw-cog");
    if (cog) cog.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); openPz(true); });
  }

  /* ---- daily word of grace on the landing hero (dark-navy variant) ---- */
  function placeGraceWordHero() {
    // Word of Grace now leads the page — injected at the very top of the
    // "One Framework" ecosystem hero (falls back to the old hero if absent).
    var host = document.querySelector("#one-framework .aog-of-in") || document.querySelector("#screen-welcome .hyb-hero");
    if (!host) return;
    var el = document.getElementById("aogGraceWordHero");
    if (!el) {
      el = document.createElement("div"); el.id = "aogGraceWordHero"; el.className = "aog-grace-word--hero";
      host.appendChild(el);   // Word of Grace now sits at the bottom of the hero
    }
    el.innerHTML =
      '<button class="agwh-cog" type="button" aria-haspopup="true" aria-label="' + t("Personalize", "Personalizar") + '" title="' + t("Personalize", "Personalizar") + '" data-aog-open-pz="1">'
        + '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="8" x2="20" y2="8"/><circle cx="9" cy="8" r="2.4"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="15" cy="16" r="2.4"/></svg>'
        + '<span class="agwh-cog-lbl">' + t("Personalize", "Personalizar") + '</span>'
      + '</button>'
      + '<span class="agwh-dot" aria-hidden="true"></span>'
      + '<span class="agwh-eyebrow">' + t("A word of grace", "Una palabra de gracia") + '</span>'
      + '<span class="agwh-text">' + todaysWord(audience()) + '</span>';
    var cog = el.querySelector(".agwh-cog");
    if (cog) cog.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); if (typeof openPz === "function") openPz(true); });
  }
  function refreshGrace() { try { placeGraceWord(); } catch (e) {} try { placeGraceWordHero(); } catch (e) {} }

  /* =====================================================================
     SOUND GATE — make the existing GraceAudio engine respect the opt-in
     preference. Wraps every play* method; default off keeps it silent.
     ===================================================================== */
  function gateAudio() {
    var GA = window.GraceAudio;
    if (!GA || GA.__aogGated) return;
    GA.__aogGated = 1;
    for (var k in GA) {
      try {
        if (typeof GA[k] === "function" && k.indexOf("play") === 0) {
          (function (name, orig) {
            GA[name] = function () { if (!soundOn()) return; try { return orig.apply(this, arguments); } catch (e) {} };
          })(k, GA[k]);
        }
      } catch (e) {}
    }
  }
  function chime() { try { gateAudio(); if (soundOn() && window.GraceAudio && window.GraceAudio.playSuccess) window.GraceAudio.playSuccess(); } catch (e) {} }

  /* =====================================================================
     EARNED COMPLETION — clean check + "time back" + on-device streak.
     Replaces the old sticker-bloom. No gushing praise.
     ===================================================================== */
  var toolStart = 0;
  function markToolStart() { if (!toolStart) toolStart = Date.now(); }
  function clearToolStart() { toolStart = 0; }

  function dstr(d) { function p(n) { return (n < 10 ? "0" : "") + n; } return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
  function bumpStreak() {
    var today = dstr(new Date());
    var last = lsGet(K_LAST, "");
    var count = parseInt(lsGet(K_STREAK, "0"), 10) || 0;
    if (last !== today) {
      var y = new Date(); y.setDate(y.getDate() - 1);
      count = (last === dstr(y)) ? count + 1 : 1;
      lsSet(K_STREAK, String(count));
      lsSet(K_LAST, today);
    }
    return count;
  }
  function timeBackLine() {
    var secs = toolStart ? Math.round((Date.now() - toolStart) / 1000) : 0;
    var mins = Math.max(1, Math.round(secs / 60));
    if (mins <= 1) return t("That's a minute back for you.", "Eso es un minuto para ti.");
    return t("That's about " + mins + " minutes back for you.", "Son unos " + mins + " minutos para ti.");
  }

  function bloom() {
    var modal = document.querySelector("#toolModal .tool-modal") || document.getElementById("toolModalBody");
    if (!modal) return;
    if (modal.querySelector(".aog-bloom") || modal.__aogBlooming) return;
    // Mark immediately so a rapid double-fire can't stack, but hold the visual
    // ~350ms so quick tools (e.g. Take 5) land with a beat instead of snapping.
    modal.__aogBlooming = 1;
    setTimeout(function () { modal.__aogBlooming = 0; renderBloom(modal); }, 350);
  }
  function renderBloom(modal) {
    if (!modal) return;
    try { if (document.contains && !document.contains(modal)) return; } catch (e) {} // tool closed during the delay
    if (modal.querySelector(".aog-bloom")) return;

    var count = bumpStreak();
    var streakHtml = (count >= 2)
      ? '<div class="aog-bloom-streak"><span class="agw-dot" aria-hidden="true"></span>' + esc(count + t("-day streak", " días seguidos")) + '</div>'
      : '';

    var b = document.createElement("div"); b.className = "aog-bloom";
    b.innerHTML =
      '<div class="aog-bloom-ring"></div><div class="aog-bloom-ring d2"></div><div class="aog-bloom-ring d3"></div>'
      + '<div class="aog-bloom-card">'
        + '<div class="aog-bloom-check"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></div>'
        + '<div class="aog-bloom-stat">' + timeBackLine() + '</div>'
        + streakHtml
      + '</div>';
    modal.appendChild(b);
    chime();
    clearToolStart();
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 3200);
  }
  function isDone(node) {
    if (node.nodeType !== 1) return false;
    if (node.id === "gbxAgain" || node.id === "t5Again") return true;
    return !!(node.querySelector && (node.querySelector("#gbxAgain") || node.querySelector("#t5Again")));
  }
  function watch() {
    var body = document.getElementById("toolModalBody");
    if (!body || body.__bloomWatch) return; body.__bloomWatch = 1;
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var add = muts[i].addedNodes; if (!add) continue;
        if (add.length) markToolStart();
        for (var j = 0; j < add.length; j++) { if (isDone(add[j])) { bloom(); return; } }
      }
    });
    obs.observe(body, { childList: true, subtree: true });
  }

  /* =====================================================================
     REACTIVE HERO — accent light follows pointer / tap on the landing
     ===================================================================== */
  function hookHero() {
    var hero = document.querySelector(".hyb-hero");
    if (!hero || hero.__aogHero) return; hero.__aogHero = 1;
    var reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    function setXY(clientX, clientY) {
      var r = hero.getBoundingClientRect();
      var x = ((clientX - r.left) / Math.max(1, r.width)) * 100;
      var y = ((clientY - r.top) / Math.max(1, r.height)) * 100;
      hero.style.setProperty("--aog-mx", x.toFixed(1) + "%");
      hero.style.setProperty("--aog-my", y.toFixed(1) + "%");
    }
    if (!reduce) {
      hero.addEventListener("pointermove", function (e) { hero.classList.add("aog-live"); setXY(e.clientX, e.clientY); });
      hero.addEventListener("pointerleave", function () { hero.classList.remove("aog-live"); });
    }
    hero.addEventListener("pointerdown", function (e) {
      setXY(e.clientX, e.clientY); hero.classList.add("aog-live", "aog-tap");
      setTimeout(function () { hero.classList.remove("aog-tap"); }, 620);
    });
  }

  /* =====================================================================
     PERSONALIZE POPOVER (header) — tone · accent · sound
     ===================================================================== */
  function pzMenuHtml() {
    var aud = audience();
    return ''
      + '<div class="aog-pz-h">' + t("Make it yours", "Hazlo tuyo") + '</div>'
      + '<div class="aog-pz-sub">' + t("Saved on this device only.", "Se guarda solo en este dispositivo.") + '</div>'
      + '<div class="aog-pz-sec">'
        + '<div class="aog-pz-row-t" style="padding:0 4px 8px;">' + t("A word of grace", "Una palabra de gracia") + '</div>'
        + '<div class="aog-seg" role="group" aria-label="' + t("Who is this for", "Para quién es") + '">'
          + '<button type="button" data-aud="child" aria-pressed="' + (aud === "child" ? "true" : "false") + '">' + t("Child", "Niño") + '</button>'
          + '<button type="button" data-aud="teen" aria-pressed="' + (aud === "teen" ? "true" : "false") + '">' + t("Teen", "Adolescente") + '</button>'
          + '<button type="button" data-aud="adult" aria-pressed="' + (aud === "adult" ? "true" : "false") + '">' + t("Adult", "Adulto") + '</button>'
        + '</div>'
      + '</div>';
  }
  function buildPz() {
    if (document.getElementById("aogPzWrap")) return;
    var anchor = document.getElementById("themeToggle");
    if (!anchor || !anchor.parentNode) return;
    var wrap = document.createElement("div"); wrap.className = "aog-pz-wrap"; wrap.id = "aogPzWrap";
    wrap.innerHTML =
      '<button id="aogPzBtn" class="theme-toggle aog-pz-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="' + t("Personalize", "Personalizar") + '" title="' + t("Personalize", "Personalizar") + '">'
        + '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><circle cx="9" cy="7" r="2.3"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="15" cy="17" r="2.3"/></svg>'
      + '</button>'
      + '<div id="aogPzMenu" class="aog-pz-menu" role="menu" aria-label="' + t("Personalize", "Personalizar") + '" hidden></div>';
    anchor.parentNode.insertBefore(wrap, anchor);

    $("#aogPzBtn", wrap).addEventListener("click", function (e) { e.stopPropagation(); togglePz(); });

    var menu = $("#aogPzMenu", wrap);
    menu.addEventListener("click", function (e) {
      // Keep the menu open after a pick: refreshPz() re-renders and detaches the
      // clicked node, which would otherwise trip the document close-on-outside-click.
      e.stopPropagation();
      var tb = e.target.closest ? e.target.closest("[data-aud]") : null;
      var ab = e.target.closest ? e.target.closest("[data-accent]") : null;
      if (tb) { lsSet(K_AUD, tb.getAttribute("data-aud")); refreshGrace(); refreshPz(); }
      else if (ab) { lsSet(K_ACCENT, ab.getAttribute("data-accent")); applyAccent(); refreshPz(); }
    });
  }
  function refreshPz() { var m = document.getElementById("aogPzMenu"); if (m && !m.hidden) m.innerHTML = pzMenuHtml(); }
  /* Accent picker lives in the Accessibility menu (moved from Personalize 2026-06-28). */
  function a11ySwatchHtml() {
    var a = accent(), sw = "";
    for (var i = 0; i < ACCENTS.length; i++) {
      var name = ACCENTS[i];
      sw += '<button type="button" class="aog-sw aog-sw-' + name + '" data-accent="' + name + '" aria-pressed="' + (a === name ? "true" : "false") + '" aria-label="' + esc(ACCENT_LABEL[name][L() === "es" ? 1 : 0]) + '" title="' + esc(ACCENT_LABEL[name][L() === "es" ? 1 : 0]) + '"></button>';
    }
    return sw;
  }
  function renderA11ySwatches() { var box = document.getElementById("aogA11ySwatches"); if (box) box.innerHTML = a11ySwatchHtml(); }
  function buildA11yAccent() {
    var menu = document.getElementById("a11yMenu");
    if (!menu || document.getElementById("aogA11yAccentRow")) return;
    var row = document.createElement("div");
    row.className = "a11y-row";
    row.id = "aogA11yAccentRow";
    row.style.cssText = "cursor:default; display:block;";
    row.innerHTML =
      '<span class="a11y-row-tx" style="display:flex;flex-direction:column;gap:1px;">'
        + '<span class="a11y-row-t" data-i18n="a11y_accent">Accent color</span>'
        + '<span class="a11y-row-s" data-i18n="a11y_accent_s">Recolor the whole app</span>'
      + '</span>'
      + '<div class="aog-swatches" id="aogA11ySwatches" style="margin-top:10px;">' + a11ySwatchHtml() + '</div>';
    menu.appendChild(row);
    row.addEventListener("click", function (e) {
      var ab = e.target.closest ? e.target.closest("[data-accent]") : null;
      if (ab) { lsSet(K_ACCENT, ab.getAttribute("data-accent")); applyAccent(); renderA11ySwatches(); }
    });
  }
  function setPzOpen(open) {
    var m = document.getElementById("aogPzMenu"), b = document.getElementById("aogPzBtn");
    if (!m || !b) return;
    if (open) {
      m.innerHTML = pzMenuHtml(); m.hidden = false; b.setAttribute("aria-expanded", "true"); b.classList.add("active");
      /* Personalize now opens from the word-of-grace pill. Relocate the menu to <body>
         so fixed positioning is reliable, then anchor it right under that pill. */
      try { if (m.parentNode !== document.body) document.body.appendChild(m); } catch (e) {}
      var trig = document.querySelector("#aogGraceWordHero .agwh-cog") || b;
      var r = trig.getBoundingClientRect();
      var mw = Math.min(300, (window.innerWidth || 360) - 24);
      var left = Math.round(r.right - mw); if (left < 12) left = 12;
      m.style.position = "fixed";
      m.style.left = left + "px";
      m.style.right = "auto";
      m.style.width = mw + "px";
      m.style.maxWidth = "none";
      m.style.zIndex = "1300";
      // Open below the trigger when there's room; otherwise flip above so the menu
      // is never clipped (the Word of Grace pill now sits near the bottom of the page).
      var _vh = window.innerHeight || 800;
      var _mh = m.offsetHeight || 320;
      var _below = Math.round(r.bottom + 8);
      if (_below + _mh <= _vh - 12) {
        m.style.top = _below + "px";
      } else {
        var _above = Math.round(r.top - 8 - _mh);
        if (_above < 12) _above = 12;
        m.style.top = _above + "px";
      }
      m.style.bottom = "auto";
    }
    else {
      m.hidden = true; b.setAttribute("aria-expanded", "false"); b.classList.remove("active");
      m.style.position = ""; m.style.top = ""; m.style.left = ""; m.style.right = ""; m.style.bottom = ""; m.style.width = ""; m.style.maxWidth = ""; m.style.zIndex = "";
    }
  }
  function togglePz() { var m = document.getElementById("aogPzMenu"); setPzOpen(!m || m.hidden); }
  function openPz(force) { buildPz(); setPzOpen(force !== false); }
  document.addEventListener("click", function (e) {
    var m = document.getElementById("aogPzMenu");
    if (!m || m.hidden) return;
    var wrap = document.getElementById("aogPzWrap");
    var cog = document.querySelector("#aogGraceWordHero .agwh-cog");
    if ((wrap && wrap.contains(e.target)) || m.contains(e.target) || (cog && cog.contains(e.target))) return;
    setPzOpen(false);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setPzOpen(false); });

  /* =====================================================================
     hooks into the host app
     ===================================================================== */
  function hookShowScreen() {
    if (typeof window.showScreen === "function" && !window.showScreen.__blingWrap) {
      var orig = window.showScreen;
      window.showScreen = function (id) {
        var r = orig.apply(this, arguments);
        try { if (id === "screen-teacher-tools") { placeGraceWord(); if (typeof window.aogSetHash === "function") window.aogSetHash("tools"); } if (id === "screen-welcome") { hookHero(); placeGraceWordHero(); } } catch (e) {}
        return r;
      };
      window.showScreen.__blingWrap = 1;
    }
  }
  function hookApplyLang() {
    if (typeof window.applyLang === "function" && !window.applyLang.__blingWrap) {
      var orig = window.applyLang;
      window.applyLang = function () {
        var r = orig.apply(this, arguments);
        try { refreshGrace(); refreshPz(); renderA11ySwatches(); } catch (e) {}
        return r;
      };
      window.applyLang.__blingWrap = 1;
    }
  }

  function init() {
    applyAccent();
    gateAudio();
    buildPz();
    buildA11yAccent();
    hookShowScreen(); hookApplyLang(); watch(); hookHero();
    try { var s = document.getElementById("screen-teacher-tools"); if (s && s.classList.contains("active")) placeGraceWord(); } catch (e) {}
    try { var w = document.getElementById("screen-welcome"); if (!w || w.classList.contains("active")) placeGraceWordHero(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", function () { try { applyAccent(); gateAudio(); buildPz(); buildA11yAccent(); watch(); hookShowScreen(); hookHero(); placeGraceWordHero(); } catch (e) {} });
})();

