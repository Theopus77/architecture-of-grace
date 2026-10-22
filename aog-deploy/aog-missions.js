/* AOG-MISSIONS-V1 (2026-10-22) — Missions, remix challenges and "Why it works", in the Recording Studio (the-studio.html, made by
   _work/music/make_studio_page.py). Jimmy wants the Studio to make his 13-year-old fall in love with making music: a reason to come
   back. Nothing is ever locked.

   · Twelve missions, in order, each an "I can…" line in English and Spanish. Each ticks itself when the teen does the thing, in any
     order. The Studio page (the shell) hears it as a window event, `aog-studio-did` with {detail: {what}}, and keeps the tick on the
     device (aog.studio.missions.v1) before this file is even fetched; rooms fire the same event on their own window and the Studio
     passes it on. The ids are the "what"s: started, playedalong, recorded, added, listenedback, sang, lick, songchanged, ownbeat,
     mixed, shared, remixopened. Another build may fire any of them, e.g.
       window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: "shared" } }));
   · A mission done shows one warm line on a paper slip just above the desk (inside the vocal booth when it is open; as the last line
     of ▶ Listen back when that is open): a small tick, "Mission done: …", and what to try next. No confetti, no sound, nothing moves;
     it stays until it is tapped away or the next Studio key is pressed.
   · Six remix challenges, ticked by hand ("I did it ✓"; honest, nothing checks).
   · Every mission and challenge has one "Why it works" line: a producer's tip in plain words.
   · The sheet (Missions and challenges) opens from My Track's sheet, the ✦ Start a song sheet and the slip. Its last key, Start the
     missions again, is the only thing that clears the ticks.
   This file is fetched the first time it is needed (a mission done, the Missions key, ▶ Listen back); nothing of it loads before.
   Test: music-handoff/tests/studio/missions.js. */
(function () {
  "use strict";
  if (window.AOGMissions) return;
  var D = document, A = null;
  var MISSIONS = [
    { id: "started", can: ["I can start a song.", "Puedo empezar una canción."],
      how: ["Press ✦ Start a song and pick a vibe.", "Pulsa ✦ Empieza una canción y elige un estilo."],
      did: ["you started a song.", "empezaste una canción."],
      why: ["A tempo, a key and a beat are the floor a song stands on. Every part you add sits on them.", "Un tempo, una tonalidad y un ritmo son el suelo de la canción. Todo lo que añades se apoya en ellos."] },
    { id: "playedalong", can: ["I can play over my beat.", "Puedo tocar encima de mi ritmo."],
      how: ["Turn on ♫ Play along, then play a few notes in any room.", "Activa ♫ Toca encima y toca unas notas en cualquier sala."],
      did: ["you played over your beat.", "tocaste encima de tu ritmo."],
      why: ["The loop keeps time for you, so your hands are free to try ideas.", "El bucle lleva el tiempo por ti, y tus manos quedan libres para probar ideas."] },
    { id: "recorded", can: ["I can record a take.", "Puedo grabar una toma."],
      how: ["In a room, press ● Record, play, then press ■ Stop.", "En una sala, pulsa ● Grabar, toca y luego pulsa ■ Parar."],
      did: ["you recorded a take.", "grabaste una toma."],
      why: ["A take is one try. Producers record many and keep the best one, so a mistake costs nothing.", "Una toma es un intento. Los productores graban muchas y se quedan con la mejor, así que equivocarse no cuesta nada."] },
    { id: "added", can: ["I can add a take to My Track.", "Puedo añadir una toma a mi pista."],
      how: ["After a take, press + Add to My Track.", "Después de una toma, pulsa + Añadir a mi pista."],
      did: ["your take is on My Track.", "tu toma está en mi pista."],
      why: ["Songs are built in layers. Each layer has one job: the beat, the chords or the tune.", "Las canciones se hacen por capas. Cada capa tiene un trabajo: el ritmo, los acordes o la melodía."] },
    { id: "listenedback", can: ["I can listen back to my song.", "Puedo escuchar mi canción."],
      how: ["Open My Track and press ▶ Listen back.", "Abre mi pista y pulsa ▶ Escúchala."],
      did: ["you listened back to your song.", "escuchaste tu canción."],
      why: ["When your hands are still, your ears do the judging. You hear what to keep and what to change.", "Con las manos quietas, tus oídos juzgan. Oyes qué guardar y qué cambiar."] },
    { id: "sang", can: ["I can record my voice.", "Puedo grabar mi voz."],
      how: ["Press 🎤 Sing or rap, then ● Record.", "Pulsa 🎤 Canta o rapea y luego ● Grabar."],
      did: ["you recorded your voice.", "grabaste tu voz."],
      why: ["A voice is the part people remember. Headphones keep the beat out of the mic, so your voice stays clear.", "La voz es lo que la gente recuerda. Con audífonos el ritmo no entra al micrófono y tu voz se oye clara."] },
    { id: "lick", can: ["I can record a lick (a short tune that fits the chords).", "Puedo grabar una frase (una melodía corta que encaja con los acordes)."],
      how: ["Under the Piano, Guitar, Bass or Band, open Licks to try, then press ● Record this lick.", "Bajo el piano, la guitarra, el bajo o la banda, abre Frases para probar y pulsa ● Grabar esta frase."],
      did: ["you recorded a lick.", "grabaste una frase."],
      why: ["Players learn a style by borrowing a lick, then changing a note or two until it is theirs.", "Los músicos aprenden un estilo tomando una frase y cambiando una o dos notas hasta que es suya."] },
    { id: "songchanged", can: ["I can change the tempo or the key.", "Puedo cambiar el tempo o la tonalidad."],
      how: ["Press ♩ Song on My Track, then change the tempo or the key.", "Pulsa ♩ Canción en mi pista y cambia el tempo o la tonalidad."],
      did: ["you changed the song's tempo or key.", "cambiaste el tempo o la tonalidad."],
      why: ["Tempo is how fast the beats come; the key is the home note. Change one and the same song gets a new mood.", "El tempo es lo rápido que llegan los pulsos; la tonalidad es la nota de casa. Cambia uno y la misma canción tiene otro ánimo."] },
    { id: "ownbeat", can: ["I can make my own beat.", "Puedo hacer mi propio ritmo."],
      how: ["In the Drum Machine, tap the steps under the pads to add or take away hits.", "En la caja de ritmos, toca los pasos bajo los pads para poner o quitar golpes."],
      did: ["you made your own beat.", "hiciste tu propio ritmo."],
      why: ["A kick on beats 1 and 3 and a snare on 2 and 4 is the heartbeat of most songs. Move one hit and the feel changes.", "Un bombo en los pulsos 1 y 3 y una caja en el 2 y el 4 son el latido de casi todas las canciones. Mueve un golpe y cambia la sensación."] },
    { id: "mixed", can: ["I can change a level on the Mixing Desk.", "Puedo cambiar un volumen en la mesa de mezclas."],
      how: ["At the Mixing Desk, move a track's fader (its volume slider) up or down.", "En la mesa de mezclas, mueve el fader de una pista (su control de volumen) arriba o abajo."],
      did: ["you changed a level on the Mixing Desk.", "cambiaste un volumen en la mesa de mezclas."],
      why: ["When one part is a little lower, the others have room to be heard. Mixing is making space.", "Cuando una parte baja un poco, las otras tienen espacio para oírse. Mezclar es hacer espacio."] },
    { id: "shared", can: ["I can send my song to a friend.", "Puedo enviar mi canción a un amigo."],
      how: ["Press ▶ Listen back, then ✉ Send to a friend.", "Pulsa ▶ Escúchala y luego ✉ Enviar a un amigo."],
      did: ["you sent your song to a friend.", "enviaste tu canción a un amigo."],
      why: ["A friend hears your song with fresh ears. The part they hum back is the part that works.", "Un amigo oye tu canción con oídos nuevos. La parte que tararea después es la que funciona."] },
    { id: "remixopened", can: ["I can open a friend's beat and add to it.", "Puedo abrir el ritmo de un amigo y añadirle algo."],
      how: ["Open a beat link a friend sent you, then add a layer of your own.", "Abre el enlace de un ritmo que te envió un amigo y añádele una capa tuya."],
      did: ["you opened a friend's beat to add to it.", "abriste el ritmo de un amigo para añadirle algo."],
      why: ["Remixing is how music grows. You keep what works and add your own voice.", "Remezclar es como crece la música. Te quedas con lo que funciona y añades tu voz."] }
  ];
  var CHALLENGES = [
    { id: "newkit", t: ["Same chords, a new drum kit", "Mismos acordes, otra batería"],
      how: ["In the Drum Machine, pick another drum kit. Keep your chords.", "En la caja de ritmos, elige otra batería. Deja tus acordes."],
      why: ["The drums set the style. The same chords over a new kit can turn pop into rock.", "La batería marca el estilo. Los mismos acordes con otra batería pueden pasar del pop al rock."] },
    { id: "halftime", t: ["Half as fast, and sing over it", "La mitad de rápido, y canta encima"],
      how: ["In ♩ Song, halve the tempo (120 becomes 60). Then press 🎤 Sing or rap.", "En ♩ Canción, baja el tempo a la mitad (120 pasa a 60). Luego pulsa 🎤 Canta o rapea."],
      why: ["A slow beat leaves gaps, and gaps are room for words. Half time feels heavy and big.", "Un ritmo lento deja huecos, y los huecos son espacio para las palabras. A mitad de tiempo suena pesado y grande."] },
    { id: "three", t: ["Only three sounds", "Solo tres sonidos"],
      how: ["Make a beat with just three sounds, like a kick, a snare and a hi-hat.", "Haz un ritmo con solo tres sonidos, como bombo, caja y charles."],
      why: ["With fewer sounds, each one is clear. Many great beats use only three or four.", "Con menos sonidos, cada uno se oye claro. Muchos grandes ritmos usan solo tres o cuatro."] },
    { id: "minor", t: ["Make it minor", "Hazla menor"],
      how: ["In ♩ Song, press Minor, then listen back.", "En ♩ Canción, pulsa Menor y luego escúchala."],
      why: ["Minor lowers a few notes of the scale by a half step. That small change makes the same tune feel darker.", "El modo menor baja medio tono algunas notas de la escala. Ese cambio pequeño hace que la misma melodía suene más oscura."] },
    { id: "lockin", t: ["Kick and bass together", "Bombo y bajo juntos"],
      how: ["Put a bass note on every kick drum hit.", "Pon una nota de bajo en cada golpe de bombo."],
      why: ["When the kick and bass land together, the low end sounds like one big sound.", "Cuando el bombo y el bajo caen juntos, los graves suenan como un solo sonido grande."] },
    { id: "drop", t: ["Take it out, bring it back", "Quítalo y vuelve a meterlo"],
      how: ["Take the drums out for one bar, then bring them back.", "Quita la batería durante un compás y luego vuelve a meterla."],
      why: ["A short silence makes the return hit harder. Producers call it a break or a drop.", "Un silencio corto hace que la vuelta pegue más fuerte. Los productores lo llaman break o drop."] }
  ];
  var W = {
    h: ["Missions and challenges", "Misiones y retos"],
    sayM: ["Do them in any order. Each one ticks itself when you do it.", "Hazlas en el orden que quieras. Cada una se marca sola cuando la haces."],
    sayC: ["Change your song in a new way. Tick it when you have done it.", "Cambia tu canción de una forma nueva. Márcalo cuando lo hayas hecho."],
    tabM: ["Missions · {n} of {t}", "Misiones · {n} de {t}"], tabC: ["Remix challenges · {n} of {t}", "Retos de remezcla · {n} de {t}"],
    tabs: ["Missions or remix challenges", "Misiones o retos de remezcla"],
    close: ["Done", "Listo"], how: ["How:", "Cómo:"], why: ["Why it works:", "Por qué funciona:"], next: ["Next", "Siguiente"], doneSr: ["Done:", "Hecha:"],
    didIt: ["I did it ✓", "Lo hice ✓"], didDone: ["✓ Done", "✓ Hecho"],
    chDone: ["Nice work. Challenge done: {t}.", "Buen trabajo. Reto cumplido: {t}."], chUndo: ["Unticked: {t}.", "Sin marcar: {t}."],
    reset: ["Start the missions again", "Empezar las misiones otra vez"],
    resetAsk: ["Clear every tick, missions and challenges, on this device? Your songs stay as they are.", "¿Borrar todas las marcas, misiones y retos, de este aparato? Tus canciones se quedan como están."],
    resetYes: ["Yes, start again", "Sí, empezar otra vez"], resetNo: ["Keep my ticks", "Dejar mis marcas"],
    resetDone: ["Cleared. Your first mission is ready.", "Borradas. Tu primera misión está lista."],
    doneP: ["Mission done:", "Misión cumplida:"], nextP: ["Next:", "Siguiente:"], nextM: ["Next mission:", "Siguiente misión:"],
    allDone: ["That is all {t} missions. You make songs now. Try a remix challenge.", "Son las {t} misiones. Ya haces canciones. Prueba un reto de remezcla."],
    key: ["Missions · {n} of {t}", "Misiones · {n} de {t}"], x: ["Close", "Cerrar"]
  };
  function es() { return A && A.es ? A.es() : (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  function L(p) { return p[es() ? 1 : 0]; }
  function w(k, f) { var x = L(W[k]); for (var n in (f || {})) x = x.split("{" + n + "}").join(f[n]); return x; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function st() {
    var o = A && A.get ? A.get() : null;
    if (!o) { try { o = JSON.parse(localStorage.getItem("aog.studio.missions.v1") || "null"); } catch (e) { o = null; } }
    if (!o || typeof o !== "object") o = {}; if (!o.done || typeof o.done !== "object") o.done = {}; if (!o.ch || typeof o.ch !== "object") o.ch = {};
    return o;
  }
  function save(o) { if (A && A.put) A.put(o); else { try { localStorage.setItem("aog.studio.missions.v1", JSON.stringify(o)); } catch (e) {} } }
  function byId(id) { return MISSIONS.filter(function (m) { return m.id === id; })[0] || null; }
  function nDone() { var o = st(); return MISSIONS.filter(function (m) { return o.done[m.id]; }).length; }
  function nCh() { var o = st(); return CHALLENGES.filter(function (c) { return o.ch[c.id]; }).length; }
  function next() { var o = st(); return MISSIONS.filter(function (m) { return !o.done[m.id]; })[0] || null; }
  function counts() { return { n: nDone(), t: MISSIONS.length }; }

  var CSS = [
    /* the slip: paper, like the transport's line; a small green tick; nothing moves */
    "#msDone{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;max-width:min(40rem,100%);padding:.45rem .5rem .45rem .65rem;border-radius:4px;",
    "  background:#f4ecdb;color:#1f1a12;box-shadow:0 6px 16px rgba(0,0,0,.45),0 1px 1px rgba(0,0,0,.2);cursor:pointer;animation:none;transition:none}",
    "#msDone[hidden]{display:none}",
    "#msDone .ms-tk{flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:#1d6b3f;color:#ffffff;display:inline-flex;align-items:center;justify-content:center;font:800 1rem/1 Inter,system-ui,sans-serif}",
    "#msDoneT{flex:1 1 13rem;min-width:0;margin:0;font:500 1rem/1.35 Inter,system-ui,sans-serif;color:#1f1a12;text-align:left;overflow-wrap:anywhere}",
    "#msDoneT b{font-weight:800;color:#1f1a12}",
    "#msDoneT span{display:block;color:#3b3224}",
    "#msDone .ms-k{flex:0 0 auto;min-height:44px;min-width:44px;padding:0 .8rem;border-radius:9px;border:1px solid #b9a988;background:#fffaf0;color:#1f1a12;",
    "  font:800 .92rem/1.1 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}",
    "#msDone .ms-k:focus-visible,#msSheet button:focus-visible{outline:3px solid #b9822a;outline-offset:2px}",
    ".mb-in #msDone{grid-column:1/-1;max-width:none}",
    /* the line at the end of ▶ Listen back (dark, like the view) */
    "#msLb{margin:2px 0 0;padding-top:10px;border-top:1px solid rgba(255,236,200,.14);font:500 .98rem/1.35 Inter,system-ui,sans-serif;color:#efe2c6;text-align:inherit}",
    "#msLb[hidden]{display:none}",
    "#msLb b{color:#f3d48e;font-weight:800}",
    "#msLb .ms-tk{color:#7fd6a0;font-weight:800}",
    "@media (max-width:699px) and (max-height:760px),(orientation:landscape) and (max-height:519px){#msLb{display:none}}",
    /* the sheet: paper, like ✦ Start a song's */
    "#msSheet{position:fixed;z-index:46;top:calc(max(0px,env(safe-area-inset-top)) + 58px);left:50%;transform:translateX(-50%);width:min(42rem,calc(100vw - 24px));",
    "  max-height:calc(100dvh - 72px);overflow:auto;overscroll-behavior:contain;box-sizing:border-box;padding:.9rem 1rem 1rem;border-radius:8px;",
    "  background:#f4ecdb;color:#1f1a12;box-shadow:0 14px 36px rgba(0,0,0,.6),0 0 0 1px #050403}",
    "#msSheet[hidden]{display:none}",
    "#msSheet .ms-top{display:flex;align-items:flex-start;gap:.75rem}",
    "#msSheet .ms-top>div{flex:1 1 auto;min-width:0}",
    "#msH{margin:0;font:600 1.3rem/1.2 \"Fraunces\",Georgia,serif!important;letter-spacing:0!important;color:#1f1a12!important}",
    "#msSay{margin:.25rem 0 0;font:500 1rem/1.35 Inter,system-ui,sans-serif;color:#3b3224!important}",
    "#msClose{flex:0 0 auto;min-height:44px;min-width:44px;padding:0 .9rem;border-radius:9px;border:1px solid #2a251f;background:#2a251f;color:#f4ead6;",
    "  font:800 .95rem/1 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}",
    "#msSheet .ms-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:.75rem 0 0}",
    "#msSheet .ms-tab{min-height:44px;min-width:0;padding:.3rem .6rem;border-radius:9px;border:1.5px solid #b9a988;background:#fffaf0;color:#1f1a12;",
    "  font:800 .92rem/1.15 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation;overflow-wrap:anywhere}",
    "#msSheet .ms-tab[aria-pressed=\"true\"]{background:#2a251f;border-color:#2a251f;color:#f3d48e}",
    "#msSheet ol{list-style:none;margin:.75rem 0 0;padding:0;display:grid;gap:8px}",
    "#msSheet .ms-it{display:flex;align-items:flex-start;gap:.65rem;padding:.6rem .7rem;border-radius:8px;background:#fffaf0;border:1px solid #d9ccb2}",
    "#msSheet .ms-it.ms-next{border:2px solid #b98f3e}",
    "#msSheet .ms-mk{flex:0 0 auto;width:30px;height:30px;margin-top:1px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;",
    "  border:1.5px solid #8d7d5f;background:#fffaf0;color:#3b3224;font:800 .9rem/1 Inter,system-ui,sans-serif}",
    "#msSheet .ms-done .ms-mk{background:#1d6b3f;border-color:#1d6b3f;color:#ffffff}",
    "#msSheet .ms-tx{flex:1 1 auto;min-width:0;display:grid;gap:3px}",
    "#msSheet .ms-tx p{margin:0}",
    "#msSheet .ms-can{font:700 1.02rem/1.3 Inter,system-ui,sans-serif;color:#1f1a12}",
    "#msSheet .ms-tag{display:inline-block;margin-left:.4rem;padding:.1rem .45rem;border-radius:999px;background:#2a251f;color:#f3d48e;font:800 .78rem/1.3 Inter,system-ui,sans-serif;vertical-align:1px}",
    "#msSheet .ms-how{font:500 .95rem/1.35 Inter,system-ui,sans-serif;color:#3b3224}",
    "#msSheet .ms-why{font:italic 500 .95rem/1.35 \"Fraunces\",Georgia,serif;color:#463c2c}",
    "#msSheet .ms-why b,#msSheet .ms-how b{font:800 .9rem/1.3 Inter,system-ui,sans-serif;font-style:normal;color:#3b3224}",
    "#msSheet .ms-ch{justify-self:start;margin-top:4px;min-height:44px;min-width:44px;padding:0 .9rem;border-radius:9px;border:1.5px solid #2a251f;background:#fffaf0;color:#1f1a12;",
    "  font:800 .95rem/1.1 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}",
    "#msSheet .ms-ch[aria-pressed=\"true\"]{background:#1d6b3f;border-color:#1d6b3f;color:#ffffff}",
    "#msLine{margin:.7rem 0 0;font:700 1rem/1.35 Inter,system-ui,sans-serif;color:#1f1a12}",
    "#msLine:empty{display:none}",
    "#msSheet .ms-foot{margin:.8rem 0 0;padding-top:.7rem;border-top:1px solid #d9ccb2;display:flex;flex-wrap:wrap;align-items:center;gap:8px}",
    "#msSheet .ms-foot p{flex:1 1 100%;margin:0;font:600 .98rem/1.35 Inter,system-ui,sans-serif;color:#1f1a12}",
    "#msSheet .ms-fb{min-height:44px;min-width:44px;padding:0 .9rem;border-radius:9px;border:1px solid #b9a988;background:#fffaf0;color:#1f1a12;font:700 .95rem/1.1 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}",
    "#msSheet .ms-fb.ms-yes{background:#7a2a1b;border-color:#7a2a1b;color:#ffffff}",
    ".ms-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    "@media (min-width:700px){#msSheet{top:66px}}",
    "@media (orientation:landscape) and (max-height:500px){#msSheet{top:8px;max-height:calc(100dvh - 16px)}}",
    "@media print{#msSheet,#msDone{display:none!important}}"
  ].join("\n");
  function css() { if (D.getElementById("msCss")) return; var s = D.createElement("style"); s.id = "msCss"; s.textContent = CSS; D.head.appendChild(s); }

  /* ── the slip: one warm line when a mission is done ── */
  var slip = null, cur = null;   /* cur: {kind: "done"|"next", id} */
  function where() {
    var lb = D.getElementById("lbDlg"); if (lb && lb.open) return "lb";
    var mb = D.getElementById("aogMicBooth"); if (mb && !mb.hidden) return "booth";
    return "bar";
  }
  function lbRoom() { try { return !matchMedia("(max-width:699px) and (max-height:760px), (orientation:landscape) and (max-height:519px)").matches; } catch (e) { return true; } }
  function nextText() { var n = next(); return n ? L(n.how) : w("allDone", { t: MISSIONS.length }); }
  function slipBuild() {
    if (slip) return slip;
    css();
    slip = D.createElement("div"); slip.id = "msDone"; slip.hidden = true; slip.setAttribute("role", "status");
    slip.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button");
      if (b && b.id === "msDoneSee") { dismiss(); open("m", key()); return; }
      dismiss();   /* a tap on the slip (or its ✕) puts it away */
    });
    /* the next Studio key pressed puts it away too (a tap in the room, where you play, leaves it). On the click, not the press:
       in the booth the line is in the flow, and taking it away on the press would move the key under the finger. */
    D.addEventListener("click", function (e) { if (!slip || slip.hidden) return; var t = e.target; if (t && t.closest && t.closest("#msDone")) return; dismiss(); }, true);
    D.addEventListener("keydown", function (e) { if (e.key === "Escape" && slip && !slip.hidden && (!box || box.hidden)) dismiss(); });
    return slip;
  }
  function lbLine() {
    var show = D.getElementById("lbShow"); if (!show) return null;
    var p = D.getElementById("msLb");
    if (!p) { css(); p = D.createElement("p"); p.id = "msLb"; p.setAttribute("aria-live", "polite"); show.appendChild(p); }
    return p;
  }
  function paintSlip() {
    if (!cur) return;
    var m = cur.kind === "done" ? byId(cur.id) : null, h = where();
    if (h === "lb") {
      if (slip) slip.hidden = true;
      /* a phone in Safari (short) or on its side: Listen back has no room for another line. A mission done there is said
         just above the desk once Listen back closes. */
      if (!lbRoom()) {
        var dl = D.getElementById("lbDlg"), q = D.getElementById("msLb"); if (q) q.hidden = true;
        if (m && dl && !dl.__msWait) { dl.__msWait = 1; dl.addEventListener("close", function () { dl.__msWait = 0; if (cur && cur.kind === "done") paintSlip(); }, { once: true }); }
        return;
      }
      var p = lbLine(); if (!p) return;
      p.innerHTML = m ? '<span class="ms-tk" aria-hidden="true">✓ </span><b>' + esc(w("doneP")) + "</b> " + esc(L(m.did)) + " " + esc(w("nextP")) + " " + esc(nextText())
        : (next() ? "<b>" + esc(w("nextM")) + "</b> " + esc(nextText()) : esc(nextText()));
      p.hidden = false;
      return;
    }
    if (!m) return;   /* "Next mission" is said only in Listen back; elsewhere the slip says a mission is done */
    var s = slipBuild(), c = counts();
    var host = h === "booth" ? D.querySelector("#aogMicBooth .mb-in") : D.querySelector("#mt .tp-say");
    if (!host) host = D.body;
    if (s.parentNode !== host) host.appendChild(s);
    s.innerHTML = '<span class="ms-tk" aria-hidden="true">✓</span><p id="msDoneT"><b>' + esc(w("doneP")) + "</b> " + esc(L(m.did)) +
      "<span>" + esc(next() ? w("nextP") + " " + nextText() : nextText()) + "</span></p>" +
      (h === "bar" ? '<button type="button" class="ms-k" id="msDoneSee">' + esc(w("key", c)) + "</button>" : "") +
      '<button type="button" class="ms-k" id="msDoneX" aria-label="' + esc(w("x")) + '">✕</button>';
    s.hidden = false;
  }
  function celebrate(id) {
    if (!byId(id)) return;
    cur = { kind: "done", id: id, at: Date.now() };
    var lb = D.getElementById("msLb"); if (lb && where() !== "lb") lb.hidden = true;
    paintSlip();
    if (box && !box.hidden) paint();
  }
  /* ▶ Listen back opened: its last line says the next mission (or the one just done, when it was this) */
  function lb() {
    if (where() !== "lb") return;
    if (cur && cur.kind === "done" && Date.now() - cur.at < 1500) { paintSlip(); return; }
    cur = { kind: "next", at: Date.now() }; paintSlip();
  }
  function dismiss() { cur = null; if (slip) slip.hidden = true; }

  /* ── the sheet: the missions and the remix challenges ── */
  var box = null, tab = "m", ask = false, line = "", opener = null;
  function build() {
    if (box) return box;
    css();
    box = D.createElement("div"); box.id = "msSheet"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-labelledby", "msH");
    D.body.appendChild(box);
    box.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button"); if (!b) return;
      if (b.id === "msClose") { close(); return; }
      var t = b.getAttribute("data-tab"); if (t) { tab = t; ask = false; line = ""; paint(); focus('[data-tab="' + t + '"]'); return; }
      var c = b.getAttribute("data-ch"); if (c) { tick(c); return; }
      if (b.id === "msReset") { ask = true; line = ""; paint(); focus("#msNo"); return; }
      if (b.id === "msNo") { ask = false; paint(); focus("#msReset"); return; }
      if (b.id === "msYes") { save({ done: {}, ch: {} }); ask = false; line = "resetDone"; dismiss(); paint(); focus("#msReset"); }
    });
    box.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); close(); } });
    D.addEventListener("pointerdown", function (e) { if (!box || box.hidden) return; var t = e.target;
      if (t && t.closest && (t.closest("#msSheet") || t.closest("#msOpen") || t.closest("#msTop") || t.closest("#msDone") || t.closest("#qsMs"))) return; close(true); }, true);
    window.addEventListener("blur", function () { setTimeout(function () { var a = D.activeElement; if (box && !box.hidden && a && a.tagName === "IFRAME") close(true); }, 0); });
    try { new MutationObserver(function () { if (box && !box.hidden) paint(); if (slip && !slip.hidden) paintSlip(); var p = D.getElementById("msLb"); if (p && !p.hidden && cur) paintSlip(); })
      .observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    return box;
  }
  function focus(sel) { var f = box && box.querySelector(sel); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }
  function tick(id) {
    var c = CHALLENGES.filter(function (x) { return x.id === id; })[0]; if (!c) return;
    var o = st(); if (o.ch[id]) delete o.ch[id]; else o.ch[id] = Date.now(); save(o);
    line = o.ch[id] ? "ch:" + id : "un:" + id; paint(); focus('[data-ch="' + id + '"]');
  }
  function paint() {
    var o = st(), nx = next(), c = counts();
    var sayK = tab === "m" ? "sayM" : "sayC";
    var h = '<div class="ms-top"><div><h2 id="msH">' + esc(w("h")) + '</h2><p id="msSay">' + esc(w(sayK)) + '</p></div>' +
      '<button type="button" id="msClose">' + esc(w("close")) + "</button></div>" +
      '<div class="ms-tabs" role="group" aria-label="' + esc(w("tabs")) + '">' +
      '<button type="button" class="ms-tab" data-tab="m" aria-pressed="' + (tab === "m") + '">' + esc(w("tabM", c)) + "</button>" +
      '<button type="button" class="ms-tab" data-tab="c" aria-pressed="' + (tab === "c") + '">' + esc(w("tabC", { n: nCh(), t: CHALLENGES.length })) + "</button></div>";
    if (tab === "m") {
      h += '<ol class="ms-list" id="msList">' + MISSIONS.map(function (m, i) {
        var dn = !!o.done[m.id], isN = nx && nx.id === m.id;
        return '<li class="ms-it' + (dn ? " ms-done" : "") + (isN ? " ms-next" : "") + '" data-m="' + m.id + '"><span class="ms-mk" aria-hidden="true">' + (dn ? "✓" : i + 1) + "</span>" +
          '<div class="ms-tx"><p class="ms-can">' + (dn ? '<span class="ms-sr">' + esc(w("doneSr")) + " </span>" : "") + esc(L(m.can)) +
          (isN ? '<span class="ms-tag">' + esc(w("next")) + "</span>" : "") + "</p>" +
          (dn ? "" : '<p class="ms-how"><b>' + esc(w("how")) + "</b> " + esc(L(m.how)) + "</p>") +
          '<p class="ms-why"><b>' + esc(w("why")) + "</b> " + esc(L(m.why)) + "</p></div></li>";
      }).join("") + "</ol>";
    } else {
      h += '<ol class="ms-list" id="msList">' + CHALLENGES.map(function (x) {
        var dn = !!o.ch[x.id];
        return '<li class="ms-it' + (dn ? " ms-done" : "") + '" data-c="' + x.id + '"><span class="ms-mk" aria-hidden="true">' + (dn ? "✓" : "★") + "</span>" +
          '<div class="ms-tx"><p class="ms-can">' + esc(L(x.t)) + "</p>" +
          '<p class="ms-how"><b>' + esc(w("how")) + "</b> " + esc(L(x.how)) + "</p>" +
          '<p class="ms-why"><b>' + esc(w("why")) + "</b> " + esc(L(x.why)) + "</p>" +
          '<button type="button" class="ms-ch" data-ch="' + x.id + '" aria-pressed="' + dn + '">' + esc(dn ? w("didDone") : w("didIt")) + "</button></div></li>";
      }).join("") + "</ol>";
    }
    var ln = "";
    if (line === "resetDone") ln = w("resetDone");
    else if (/^(ch|un):/.test(line)) { var cx = CHALLENGES.filter(function (x) { return x.id === line.slice(3); })[0]; if (cx) ln = w(line.slice(0, 2) === "ch" ? "chDone" : "chUndo", { t: L(cx.t) }); }
    h += '<p id="msLine" role="status" aria-live="polite">' + esc(ln) + "</p>";
    h += '<div class="ms-foot">' + (ask
      ? "<p>" + esc(w("resetAsk")) + '</p><button type="button" class="ms-fb ms-yes" id="msYes">' + esc(w("resetYes")) + '</button><button type="button" class="ms-fb" id="msNo">' + esc(w("resetNo")) + "</button>"
      : '<button type="button" class="ms-fb" id="msReset">' + esc(w("reset")) + "</button>") + "</div>";
    box.innerHTML = h;
  }
  function open(t, from) {
    build(); if (t === "m" || t === "c") tab = t;
    ask = false; line = ""; opener = from || D.activeElement || null;
    paint(); box.hidden = false; box.scrollTop = 0;
    keys(true);
    focus('[data-tab="' + tab + '"]');
  }
  function close(quiet) {
    if (!box || box.hidden) return;
    box.hidden = true; ask = false;
    keys(false);
    if (!quiet) { var o = opener && opener.offsetParent ? opener : key(); if (o) try { o.focus({ preventScroll: true }); } catch (e) {} }
  }
  /* the Missions key on this screen: the top line's (an iPad on its side, a computer) or My Track's sheet's */
  function key() { var a = D.getElementById("msTop"), b = D.getElementById("msOpen"); return a && a.offsetParent ? a : b && b.offsetParent ? b : null; }
  function keys(on) { ["msOpen", "msTop"].forEach(function (id) { var k = D.getElementById(id); if (k) k.setAttribute("aria-expanded", on ? "true" : "false"); }); }
  function press(from) { if (box && !box.hidden) close(); else open(null, from); }
  window.AOGMissions = {
    init: function (api) { A = api || null; },
    celebrate: celebrate, lb: lb, dismiss: dismiss, open: open, close: close, press: press, counts: counts,
    MISSIONS: MISSIONS, CHALLENGES: CHALLENGES,
    /* read only, for the Studio's tests (music-handoff/tests/studio/missions.js) */
    state: function () {
      var o = st();
      return { open: !!(box && !box.hidden), tab: tab, done: MISSIONS.filter(function (m) { return o.done[m.id]; }).map(function (m) { return m.id; }),
        ch: CHALLENGES.filter(function (c) { return o.ch[c.id]; }).map(function (c) { return c.id; }),
        slip: slip && !slip.hidden ? { text: slip.textContent, host: slip.parentNode && slip.parentNode.className } : null,
        lb: (function () { var p = D.getElementById("msLb"); return p && !p.hidden ? p.textContent : ""; })(), cur: cur && cur.id || "" };
    }
  };
})();
