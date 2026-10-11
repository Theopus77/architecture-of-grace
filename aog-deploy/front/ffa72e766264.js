
/* "I don't know" — the Unknown Skill Pathway. A guided route for students who
   cannot name a feeling yet: how the BODY feels (Fast / Calm / Tired) → what
   would help most → a real Quiet Space tool, ending with a Word of Grace.
   It teaches moving from uncertainty to awareness — not an error state.
   PRIVACY: in-the-moment only. The single body choice is held in a local
   variable for the session step; nothing is written to localStorage, no record
   is created, syncRecord() is never called. No scoring, reporting, or MTSS. */
(function () {
  "use strict";
  function IL() { return (typeof lang !== "undefined" && lang === "es") ? "es" : "en"; }
  function T(en, es) { return IL() === "es" ? es : en; }
  function box() { return document.getElementById("rnIdkBox"); }
  var idkBody = null; /* in-memory only; cleared on each new run */

  var BODY = [
    { v: "fast",  ic: "⚡", en: "Fast",  es: "Rápido" },
    { v: "calm",  ic: "🌿", en: "Calm",  es: "Tranquilo" },
    { v: "tired", ic: "🌙", en: "Tired", es: "Cansado" }
  ];
  /* body acknowledgment + a gentle suggestion toward one helper (still free choice) */
  var BODY_ACK = {
    fast:  { en: "It sounds like your body may feel fast right now.",  es: "Parece que tu cuerpo puede sentirse acelerado ahora mismo.",  suggest: "breath",
             sEn: "Bodies that feel fast often settle with a deep breath.", sEs: "Los cuerpos acelerados suelen calmarse con una respiración profunda." },
    calm:  { en: "It sounds like your body may feel calm right now.",  es: "Parece que tu cuerpo puede sentirse en calma ahora mismo.",  suggest: "time",
             sEn: "When your body feels calm, a little time helps you stay there.", sEs: "Cuando tu cuerpo está en calma, un poco de tiempo te ayuda a quedarte ahí." },
    tired: { en: "It sounds like your body may feel tired right now.", es: "Parece que tu cuerpo puede sentirse cansado ahora mismo.", suggest: "quiet",
             sEn: "When your body feels tired, a quiet corner can help.", sEs: "Cuando tu cuerpo está cansado, un rincón tranquilo puede ayudar." }
  };
  /* what would help → route to a real Quiet Space tool, or a gentle in-the-moment cue */
  var HELP = [
    { v: "quiet",    ic: "🤫", en: "Quiet",           es: "Silencio",            tool: "safeplace", tEn: "Open a quiet corner",      tEs: "Abrir un rincón tranquilo" },
    { v: "movement", ic: "🤸", en: "Movement",        es: "Movimiento",          tool: "movement",  tEn: "Open a movement break",    tEs: "Abrir una pausa de movimiento" },
    { v: "water",    ic: "💧", en: "Water",           es: "Agua",                say: { en: "Go take a slow sip of water. Cool water helps your body settle.", es: "Toma un sorbo lento de agua. El agua fresca ayuda a que tu cuerpo se calme." } },
    { v: "breath",   ic: "🫁", en: "Deep Breath",     es: "Respiración profunda", tool: "breathing", tEn: "Open deep breathing",      tEs: "Abrir respiración profunda" },
    { v: "talk",     ic: "💬", en: "Talk to Someone", es: "Hablar con alguien",  say: { en: "Find a trusted adult or friend and tell them one small thing.", es: "Busca a un adulto de confianza o a un amigo y cuéntale una pequeña cosa." } },
    { v: "time",     ic: "⏳", en: "Time",            es: "Tiempo",              say: { en: "Take a few quiet minutes for yourself. There’s no rush — come back when you’re ready.", es: "Tómate unos minutos tranquilos para ti. No hay prisa — vuelve cuando estés listo." } }
  ];
  function helpFor(v) { for (var i = 0; i < HELP.length; i++) { if (HELP[i].v === v) return HELP[i]; } return null; }

  /* Step 1 — reassure + ask how the body feels */
  window.aogRnIdkOpen = function () {
    var b = box(); if (!b) return;
    idkBody = null;
    var res = document.getElementById("rightNowResult"); if (res) res.hidden = true;
    var opts = BODY.map(function (o) {
      return '<span class="tk-pill" role="button" tabindex="0" data-v="' + o.v +
        '" onclick="aogRnIdkBody(\'' + o.v + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();aogRnIdkBody(\'' + o.v + '\');}">' +
        '<span aria-hidden="true">' + o.ic + '</span> ' + T(o.en, o.es) + '</span>';
    }).join("");
    b.innerHTML =
      '<div class="rn-idk-title">' + T("That’s okay.", "Está bien.") + '</div>' +
      '<p class="rn-idk-msg">' + T("Many people aren’t sure right away. Let’s start smaller.", "Muchas personas no están seguras de inmediato. Empecemos con algo más pequeño.") + '</p>' +
      '<div class="rn-idk-q">' + T("How does your body feel right now?", "¿Cómo se siente tu cuerpo ahora mismo?") + '</div>' +
      '<div class="rn-idk-opts" role="group" aria-label="' + T("How your body feels", "Cómo se siente tu cuerpo") + '">' + opts + '</div>';
    b.hidden = false;
    try { b.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  };

  /* Step 2 — acknowledge the body, then ask what would help */
  window.aogRnIdkBody = function (v) {
    var b = box(); if (!b) return;
    var ack = BODY_ACK[v]; if (!ack) return;
    idkBody = v;
    var opts = HELP.map(function (o) {
      var hint = (o.v === ack.suggest) ? ' aog-suggested' : '';
      return '<span class="tk-pill' + hint + '" role="button" tabindex="0" data-v="' + o.v +
        '" onclick="aogRnIdkHelp(\'' + o.v + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();aogRnIdkHelp(\'' + o.v + '\');}">' +
        '<span aria-hidden="true">' + o.ic + '</span> ' + T(o.en, o.es) + '</span>';
    }).join("");
    b.innerHTML =
      '<p class="rn-idk-msg">' + T(ack.en, ack.es) + '</p>' +
      '<div class="rn-idk-q">' + T("What would help most right now?", "¿Qué te ayudaría más ahora mismo?") + '</div>' +
      '<div class="rn-idk-opts" role="group" aria-label="' + T("What would help most", "Qué ayudaría más") + '">' + opts + '</div>' +
      '<p class="rn-idk-suggest">' + T(ack.sEn, ack.sEs) + '</p>';
    try { b.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  };

  /* Step 3 — Word of Grace, then route to the tool (or a gentle cue) */
  window.aogRnIdkHelp = function (v) {
    var b = box(); if (!b) return;
    var h = helpFor(v); if (!h) return;
    var grace =
      '<div class="rn-idk-grace"><div class="rn-idk-grace-ey">' + T("A GRACE NOTE", "UNA NOTA DE GRACIA") + '</div>' +
      '<p>' + T("Not knowing is okay. You started where you were.", "No saber está bien. Empezaste desde donde estabas.") + '</p></div>';
    var action;
    if (h.tool && typeof window.toolOpen === "function") {
      action = '<div class="rn-idk-tools">' +
          '<button type="button" class="btn" onclick="window.toolOpen(\'' + h.tool + '\')">' + T(h.tEn, h.tEs) + '</button>' +
          '<button type="button" class="btn btn-ghost" onclick="aogRnIdkOpen()">' + T("Start over", "Empezar de nuevo") + '</button>' +
        '</div>';
    } else if (h.say) {
      action = '<div class="rn-idk-say">' + T(h.say.en, h.say.es) + '</div>' +
        '<div class="rn-idk-tools"><button type="button" class="btn btn-ghost" onclick="aogRnIdkOpen()">' + T("Start over", "Empezar de nuevo") + '</button></div>';
    } else {
      action = '<div class="rn-idk-tools"><button type="button" class="btn btn-ghost" onclick="aogRnIdkOpen()">' + T("Start over", "Empezar de nuevo") + '</button></div>';
    }
    b.innerHTML = grace + action + '<p class="rn-idk-flag">' + T("Nothing here is saved.", "Nada de esto se guarda.") + '</p>';
    try { b.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  };
})();
