
/* =====================================================================
   ARCHITECTURE OF GRACE · tools.js
   Rich, animated replacements for four calm tools. Overrides TOOLS so the
   originals stay intact. ES5, defensive, reduced-motion aware, no libraries.
     · Body Scan  — glowing scan-line travels the body, cues soften each part
     · Feelings Wheel — a real spinning wheel that lands and reads the feeling
     · Bilateral Tapping — animated butterfly hug you tap along with
     · Animal Yoga — animated poses with a hold-and-breathe timer
   ===================================================================== */
(function () {
  'use strict';
  function L() { try { if (typeof lang !== "undefined" && lang) return lang; } catch (e) {} return "en"; }
  function t(en, es) { return L() === "es" ? es : en; }
  function $(id) { return document.getElementById(id); }
  function reduce() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }

  /* Pick the warmest, most human voice the device offers (voices load async). */
  function pickVoice(langPrefix) {
    try {
      var vs = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      if (!vs || !vs.length) return null;
      var pool = vs.filter(function (v) { return (v.lang || "").toLowerCase().indexOf(langPrefix) === 0; });
      if (!pool.length) pool = vs;
      // preference order: high-quality/natural names first
      var prefs = ["natural", "google", "samantha", "karen", "aria", "jenny", "libby", "sonia", "ava", "allison", "nicky", "moira", "tessa", "daniel", "alex"];
      for (var i = 0; i < prefs.length; i++) {
        for (var j = 0; j < pool.length; j++) { if ((pool[j].name || "").toLowerCase().indexOf(prefs[i]) >= 0) return pool[j]; }
      }
      // else first local voice, else first
      for (var k = 0; k < pool.length; k++) { if (pool[k].localService) return pool[k]; }
      return pool[0];
    } catch (e) { return null; }
  }
  function speakWarm(text, langPrefix) {
    try {
      if (!('speechSynthesis' in window)) return;
      var go = function () {
        var u = new SpeechSynthesisUtterance(text);
        var v = pickVoice(langPrefix); if (v) u.voice = v;
        u.lang = langPrefix === "es" ? "es-ES" : "en-US";
        u.rate = 0.9; u.pitch = 1.0; u.volume = 1;
        window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      };
      var have = window.speechSynthesis.getVoices();
      if (have && have.length) { go(); }
      else { window.speechSynthesis.onvoiceschanged = function () { window.speechSynthesis.onvoiceschanged = null; go(); }; window.speechSynthesis.getVoices(); after(go, 250); }
    } catch (e) {}
  }

  var TIMERS = [];
  var CANCELS = [];
  function clearTimers() { for (var i = 0; i < TIMERS.length; i++) { clearTimeout(TIMERS[i]); clearInterval(TIMERS[i]); } TIMERS = []; for (var j = 0; j < CANCELS.length; j++) { try { CANCELS[j](); } catch (e) {} } CANCELS = []; }
  function reduceMotion() { try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function reflow(el) { try { void el.getBoundingClientRect(); } catch (e) {} }
  function after(fn, ms) { var id = setTimeout(fn, ms); TIMERS.push(id); return id; }
  function every(fn, ms) { var id = setInterval(fn, ms); TIMERS.push(id); return id; }

  /* ===================================================================
     BODY SCAN
     =================================================================== */
  function bsRegions() {
    return [
      { reg: "face", cy: 30, cue: t("Let your face go soft. Unclench your jaw.", "Suaviza tu cara. Afloja la mandíbula.") },
      { reg: "shoulders", cy: 66, cue: t("Let your shoulders drop down, away from your ears.", "Deja caer los hombros, lejos de las orejas.") },
      { reg: "arms", cy: 98, cue: t("Let your arms grow heavy. Open your hands.", "Deja los brazos pesados. Abre las manos.") },
      { reg: "belly", cy: 120, cue: t("Let your belly rise and fall. Nothing to hold.", "Deja que la barriga suba y baje. Nada que sostener.") },
      { reg: "legs", cy: 176, cue: t("Let your legs feel heavy and loose.", "Siente las piernas pesadas y sueltas.") },
      { reg: "feet", cy: 228, cue: t("Let your feet rest. You're all the way down — take one slow breath.", "Deja descansar los pies. Llegaste hasta abajo — respira lento.") }
    ];
  }
  var BS_SVG =
    '<svg class="bs-body" viewBox="0 0 120 250" width="100%" role="img" aria-label="Body figure">'
    + '<circle data-reg="face" class="bs-region" cx="60" cy="30" r="19"/>'
    + '<rect data-reg="shoulders" class="bs-region" x="30" y="52" width="60" height="17" rx="8"/>'
    + '<rect data-reg="arms" class="bs-region" x="20" y="60" width="12" height="64" rx="6"/>'
    + '<rect data-reg="arms" class="bs-region" x="88" y="60" width="12" height="64" rx="6"/>'
    + '<rect data-reg="belly" class="bs-region" x="40" y="66" width="40" height="58" rx="14"/>'
    + '<rect data-reg="legs" class="bs-region" x="45" y="122" width="13" height="92" rx="6"/>'
    + '<rect data-reg="legs" class="bs-region" x="62" y="122" width="13" height="92" rx="6"/>'
    + '<rect data-reg="feet" class="bs-region" x="42" y="214" width="18" height="13" rx="5"/>'
    + '<rect data-reg="feet" class="bs-region" x="60" y="214" width="18" height="13" rx="5"/>'
    + '<g class="bs-beam"><rect x="4" y="-6" width="112" height="12" rx="6" fill="var(--gold-soft,#F2C964)" opacity="0.55"/></g>'
    + '</svg>';
  function bsBuilder() {
    return '<div class="tool-modal-icon">🧘</div>'
      + '<div class="tool-modal-title">' + t("Body Scan", "Escaneo corporal") + '</div>'
      + '<div class="tool-modal-sub">' + t("Watch the light travel down. Soften each part as it glows.", "Mira la luz bajar. Suaviza cada parte cuando brille.") + '</div>'
      + '<div class="aogt-wrap"><div class="bs-stage">' + BS_SVG + '</div>'
      + '<div class="aogt-cue" id="bsCue">' + t("Press start when you're ready.", "Pulsa empezar cuando estés listo.") + '</div>'
      + '<div class="aogt-progress" id="bsProg"></div>'
      + '<div class="aogt-controls"><button class="btn" id="bsStart" style="background:var(--gold);color:var(--navy);">' + t("Start the scan", "Empezar el escaneo") + '</button></div></div>';
  }
  function bsHi(reg) {
    var nodes = document.querySelectorAll(".bs-body .bs-region");
    for (var i = 0; i < nodes.length; i++) { nodes[i].classList.toggle("on", nodes[i].getAttribute("data-reg") === reg); }
  }
  function bsInit() {
    clearTimers();
    var btn = $("bsStart"); if (!btn) return;
    btn.onclick = function () {
      var regs = bsRegions(), beam = document.querySelector(".bs-beam rect"), i = 0;
      var dwell = reduce() ? 3200 : 5200;
      btn.disabled = true; btn.textContent = t("Scanning…", "Escaneando…");
      function step() {
        if (i >= regs.length) {
          bsHi(null);
          var cue = $("bsCue"); if (cue) cue.textContent = t("Done. Your whole body just got a little softer. 💛", "Listo. Todo tu cuerpo se suavizó un poco. 💛");
          var prog = $("bsProg"); if (prog) prog.textContent = "";
          btn.disabled = false; btn.textContent = t("Scan again", "Escanear otra vez");
          return;
        }
        var r = regs[i];
        bsHi(r.reg);
        if (beam) beam.setAttribute("transform", "translate(0," + r.cy + ")");
        var cue = $("bsCue"); if (cue) { cue.style.opacity = 0; after(function () { cue.textContent = r.cue; cue.style.opacity = 1; }, 180); }
        var prog = $("bsProg"); if (prog) prog.textContent = t("Part ", "Parte ") + (i + 1) + t(" of ", " de ") + regs.length;
        i++; after(step, dwell);
      }
      step();
    };
  }

  /* ===================================================================
     FEELINGS WHEEL
     =================================================================== */
  function feelings() {
    return [
      { n: t("Happy", "Feliz"), c: "#E6A817", d: t("A warm, light feeling — things feel good right now.", "Un sentimiento cálido y ligero — todo se siente bien."), tip: t("Share it with someone — happy grows when you do.", "Compártelo con alguien — la alegría crece al hacerlo.") },
      { n: t("Calm", "Tranquilo"), c: "#2BA199", d: t("Settled and easy, like still water. Nothing to rush.", "En calma, como agua quieta. Nada de prisa."), tip: t("Notice it. This is what safe feels like.", "Nótalo. Así se siente estar a salvo.") },
      { n: t("Sad", "Triste"), c: "#2E7CD6", d: t("A heavy, quiet feeling. Something feels like a loss.", "Un sentimiento pesado y callado. Algo se siente como una pérdida."), tip: t("It's okay to feel it. Tell someone you trust.", "Está bien sentirlo. Dile a alguien de confianza.") },
      { n: t("Angry", "Enojado"), c: "#D85A30", d: t("A hot, strong feeling — something felt unfair.", "Un sentimiento fuerte y caliente — algo se sintió injusto."), tip: t("Take one slow breath before you act. You're the boss of it.", "Respira lento antes de actuar. Tú mandas sobre el enojo.") },
      { n: t("Scared", "Asustado"), c: "#7C5CD6", d: t("A jumpy feeling — your body thinks something might be wrong.", "Un sentimiento nervioso — tu cuerpo cree que algo anda mal."), tip: t("You're safe right now. Find one grown-up or one safe spot.", "Ahora estás a salvo. Busca un adulto o un lugar seguro.") },
      { n: t("Worried", "Preocupado"), c: "#4F9E3A", d: t("Your mind keeps circling a what-if that hasn't happened.", "Tu mente da vueltas a un \"y si\" que no ha pasado."), tip: t("Name the worry out loud — it shrinks when you do.", "Di la preocupación en voz alta — se hace pequeña.") },
      { n: t("Excited", "Emocionado"), c: "#D4537E", d: t("A buzzy, can't-wait feeling — big energy inside.", "Un sentimiento vibrante — mucha energía por dentro."), tip: t("Wiggle it out, then take a breath to steady it.", "Sacúdela, luego respira para calmarla.") },
      { n: t("Tired", "Cansado"), c: "#888780", d: t("Low and slow — your body or mind needs a rest.", "Bajo y lento — tu cuerpo o mente necesita descansar."), tip: t("Rest isn't lazy. Give yourself a quiet minute.", "Descansar no es pereza. Date un minuto de calma.") }
    ];
  }
  function fwPolar(cx, cy, r, a) { var rad = (a - 90) * Math.PI / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]; }
  function fwWedge(cx, cy, r, a0, a1) {
    var p0 = fwPolar(cx, cy, r, a0), p1 = fwPolar(cx, cy, r, a1);
    return "M" + cx + " " + cy + " L" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " A" + r + " " + r + " 0 0 1 " + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " Z";
  }
  function fwBuilder() {
    var F = feelings(), n = F.length, seg = 360 / n, cx = 140, cy = 140, r = 132, g = "";
    for (var i = 0; i < n; i++) {
      var a0 = i * seg, a1 = a0 + seg, mid = a0 + seg / 2;
      g += '<path d="' + fwWedge(cx, cy, r, a0, a1) + '" fill="' + F[i].c + '" stroke="#fff" stroke-width="2"/>';
      var lp = fwPolar(cx, cy, 88, mid);
      g += '<text x="' + lp[0].toFixed(1) + '" y="' + lp[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-family="var(--font-sans,system-ui)" font-size="14" font-weight="800" fill="#fff" transform="rotate(' + mid + ' ' + lp[0].toFixed(1) + ' ' + lp[1].toFixed(1) + ')">' + esc(F[i].n) + '</text>';
    }
    return '<div class="tool-modal-icon">🎡</div>'
      + '<div class="tool-modal-title">' + t("Feelings Wheel", "Rueda de emociones") + '</div>'
      + '<div class="tool-modal-sub">' + t("Give it a spin — then meet the feeling it lands on.", "Gírala — y conoce el sentimiento donde se detenga.") + '</div>'
      + '<div class="aogt-wrap"><div class="fw2-stage"><div class="fw2-pointer"></div>'
      + '<svg class="fw2-wheel" id="fw2Wheel" viewBox="0 0 280 280" width="100%" height="100%" style="display:block" role="img" aria-label="Feelings wheel">' + g + '</svg>'
      + '<div class="fw2-hub">🎡</div></div>'
      + '<div class="fw2-readout" id="fw2Read"><div class="fw2-desc">' + t("Press spin to begin.", "Pulsa girar para empezar.") + '</div></div>'
      + '<div class="aogt-controls"><button class="btn" id="fw2Spin" style="background:var(--gold);color:var(--navy);">' + t("Spin the wheel", "Girar la rueda") + '</button></div></div>';
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  var _fwRot = 0;
  function fwInit() {
    clearTimers(); _fwRot = 0;
    var wheel = $("fw2Wheel"), btn = $("fw2Spin"); if (!wheel || !btn) return;
    var F = feelings(), n = F.length, seg = 360 / n;
    btn.onclick = function () {
      btn.disabled = true;
      var i = Math.floor(Math.random() * n);
      var base = ((360 - (i * seg + seg / 2)) % 360 + 360) % 360;
      var jitter = (Math.random() - 0.5) * (seg * 0.5);
      var turns = reduce() ? 1 : 4;
      var target = _fwRot - (_fwRot % 360) + turns * 360 + base + jitter;
      while (target <= _fwRot + 360) target += 360;
      _fwRot = target;
      wheel.style.transform = "rotate(" + target.toFixed(1) + "deg)";
      var wait = reduce() ? 500 : 4300;
      after(function () {
        var f = F[i], read = $("fw2Read");
        if (read) {
          read.style.background = "color-mix(in srgb, " + f.c + " 16%, var(--cream-deep,#EDE6D6))";
          read.innerHTML = '<div class="fw2-feel" style="color:' + f.c + '">' + esc(f.n) + '</div>'
            + '<div class="fw2-desc">' + esc(f.d) + '</div><div class="fw2-tip">' + esc(f.tip) + '</div>';
        }
        speakWarm(f.n + ". " + f.d, L() === "es" ? "es" : "en");
        btn.disabled = false; btn.textContent = t("Spin again", "Girar otra vez");
      }, wait);
    };
  }

  /* ===================================================================
     BILATERAL TAPPING — Butterfly Hug
     =================================================================== */
  var BH_SVG =
    '<svg class="bh-fig" viewBox="0 0 200 180" width="100%" role="img" aria-label="Butterfly hug figure">'
    + '<circle cx="100" cy="34" r="22" fill="var(--gold-pale,#F1DFA8)" stroke="var(--navy,#0A1E33)" stroke-width="2.5"/>'
    + '<path d="M64 150 Q64 78 100 78 Q136 78 136 150 Z" fill="var(--gold-soft,#F2C964)" stroke="var(--navy,#0A1E33)" stroke-width="2.5"/>'
    + '<path d="M132 96 Q108 104 86 120" fill="none" stroke="var(--navy,#0A1E33)" stroke-width="6" stroke-linecap="round"/>'
    + '<path d="M68 96 Q92 104 114 120" fill="none" stroke="var(--navy,#0A1E33)" stroke-width="6" stroke-linecap="round"/>'
    + '<circle class="bh-glow" id="bhGlowL" cx="86" cy="120" r="20" fill="var(--gold,#D9A33B)" opacity="0"/>'
    + '<circle class="bh-glow" id="bhGlowR" cx="114" cy="120" r="20" fill="var(--gold,#D9A33B)" opacity="0"/>'
    + '<circle class="bh-hand" id="bhLeft" cx="86" cy="120" r="13" fill="#fff" stroke="var(--navy,#0A1E33)" stroke-width="2.5"/>'
    + '<circle class="bh-hand" id="bhRight" cx="114" cy="120" r="13" fill="#fff" stroke="var(--navy,#0A1E33)" stroke-width="2.5"/>'
    + '</svg>';
  function bhBuilder() {
    return '<div class="tool-modal-icon">🦋</div>'
      + '<div class="tool-modal-title">' + t("Butterfly Hug", "Abrazo de mariposa") + '</div>'
      + '<div class="tool-modal-sub">' + t("Cross your arms, hands on your shoulders. Tap along — left, right, left, right.", "Cruza los brazos, manos en los hombros. Toca al ritmo — izquierda, derecha.") + '</div>'
      + '<div class="aogt-wrap"><div class="bh-stage">' + BH_SVG + '</div>'
      + '<div class="bh-beat" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>'
      + '<div class="aogt-cue" id="bhCue">' + t("Press start and tap with the glow.", "Pulsa empezar y toca con el brillo.") + '</div>'
      + '<div class="aogt-controls"><button class="btn" id="bhStart" style="background:var(--gold);color:var(--navy);">' + t("Start tapping", "Empezar a tocar") + '</button></div></div>';
  }
  function bhInit() {
    clearTimers();
    var btn = $("bhStart"); if (!btn) return;
    var running = false, side = 0, count = 0;
    var cues = [
      t("Right… left… right… left.", "Derecha… izquierda…"),
      t("Slow and steady. Let your shoulders drop.", "Lento y constante. Baja los hombros."),
      t("Breathe in… and out… keep tapping.", "Inhala… exhala… sigue tocando."),
      t("You're doing great. Calm is coming.", "Lo haces muy bien. La calma llega.")
    ];
    function beat() {
      var hand = $(side ? "bhRight" : "bhLeft"), glow = $(side ? "bhGlowR" : "bhGlowL");
      var beats = document.querySelectorAll(".bh-beat span");
      if (hand) { hand.classList.remove("tap"); void hand.offsetWidth; hand.classList.add("tap"); }
      if (glow) { glow.classList.add("on"); after(function () { glow.classList.remove("on"); }, 220); }
      if (beats.length) { for (var b = 0; b < beats.length; b++) beats[b].classList.toggle("on", b === count % beats.length); }
      try { if (window.GraceAudio && window.GraceAudio.playPop) window.GraceAudio.playPop(); } catch (e) {}
      side ^= 1; count++;
      var cue = $("bhCue"); if (cue && count % 8 === 0) cue.textContent = cues[(count / 8) % cues.length | 0];
      if (count >= 40 && !reduce()) { stop(true); }
    }
    function stop(done) {
      running = false; clearTimers();
      btn.disabled = false; btn.textContent = done ? t("Again", "Otra vez") : t("Start tapping", "Empezar a tocar");
      var cue = $("bhCue"); if (cue && done) cue.textContent = t("Rest your hands. Notice — a little calmer? That's your body resetting. 💛", "Descansa las manos. ¿Un poco más en calma? Tu cuerpo se reinicia. 💛");
    }
    btn.onclick = function () {
      if (running) { stop(false); return; }
      running = true; side = 0; count = 0;
      btn.textContent = t("Pause", "Pausa");
      beat(); every(beat, reduce() ? 1100 : 760);
    };
  }

  /* ===================================================================
     ANIMAL YOGA
     =================================================================== */
  function poses() {
    return [
      { e: "🦋", cls: "go-butterfly", n: t("Butterfly", "Mariposa"), d: t("Sit tall, feet together, and flap your knees like wings.", "Siéntate derecho, pies juntos, y mueve las rodillas como alas.") },
      { e: "🐱", cls: "go-cat", n: t("Cat", "Gato"), d: t("On hands and knees — arch your back up, then round it down.", "En cuatro patas — arquea la espalda y luego redondéala.") },
      { e: "🦁", cls: "go-lion", n: t("Lion", "León"), d: t("Take a big breath, open wide, and let out a roar!", "Respira hondo, abre grande, ¡y suelta un rugido!") },
      { e: "🐶", cls: "go-dog", n: t("Dog", "Perro"), d: t("Hands and feet down, hips up high — Downward Dog!", "Manos y pies abajo, cadera arriba — ¡perro boca abajo!") },
      { e: "🐸", cls: "go-frog", n: t("Frog", "Rana"), d: t("Squat down low, then spring up — hop like a frog!", "Agáchate y salta — ¡brinca como una rana!") },
      { e: "🐻", cls: "go-bear", n: t("Bear", "Oso"), d: t("Stand tall and sway side to side, slow and strong.", "Ponte de pie y balancéate de lado a lado, lento y fuerte.") }
    ];
  }
  function ayBuilder() {
    var P = poses(), thumbs = "";
    for (var i = 0; i < P.length; i++) thumbs += '<button class="ay-thumb" data-i="' + i + '">' + P[i].e + '</button>';
    return '<div class="tool-modal-icon">🦁</div>'
      + '<div class="tool-modal-title">' + t("Animal Yoga", "Yoga animal") + '</div>'
      + '<div class="tool-modal-sub">' + t("Pick an animal and copy the pose. Hold and breathe!", "Elige un animal y copia la pose. ¡Sostén y respira!") + '</div>'
      + '<div class="aogt-wrap"><div class="ay-stage">'
      + '<svg class="ay-ring" id="ayRing" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="var(--rule,#E4DAC5)" stroke-width="7"/>'
      + '<circle id="ayRingFill" cx="60" cy="60" r="54" fill="none" stroke="var(--gold,#D9A33B)" stroke-width="7" stroke-linecap="round" stroke-dasharray="339.3" stroke-dashoffset="339.3" transform="rotate(-90 60 60)"/></svg>'
      + '<div class="ay-animal" id="ayAnimal">🦋</div></div>'
      + '<div class="ay-name" id="ayName"></div><div class="ay-do" id="ayDo"></div><div class="ay-hold" id="ayHold"></div>'
      + '<div class="aogt-controls"><button class="btn" id="ayStart" style="background:var(--gold);color:var(--navy);">' + t("Start the hold", "Empezar a sostener") + '</button></div>'
      + '<div class="ay-thumbs" id="ayThumbs">' + thumbs + '</div></div>';
  }
  function ayInit() {
    clearTimers();
    var P = poses(), animal = $("ayAnimal"), nameEl = $("ayName"), doEl = $("ayDo"), holdEl = $("ayHold"),
      ring = $("ayRingFill"), startBtn = $("ayStart"), thumbs = document.querySelectorAll(".ay-thumb");
    var C = 339.3, cur = 0;
    function ready(i) {
      clearTimers(); cur = i;
      var p = P[i];
      if (animal) { animal.className = "ay-animal " + p.cls; animal.textContent = p.e; }
      if (nameEl) nameEl.textContent = p.n;
      if (doEl) doEl.textContent = p.d;
      if (ring) ring.setAttribute("stroke-dashoffset", C);
      if (holdEl) holdEl.textContent = t("Get into the pose — then press Start.", "Ponte en la pose — luego pulsa Empezar.");
      if (startBtn) { startBtn.disabled = false; startBtn.textContent = t("Start the hold", "Empezar a sostener"); }
      for (var k = 0; k < thumbs.length; k++) thumbs[k].classList.toggle("on", k === i);
    }
    function startHold() {
      clearTimers();
      if (startBtn) { startBtn.disabled = true; startBtn.textContent = t("Holding…", "Sosteniendo…"); }
      var total = reduce() ? 8 : 16, left = total;
      function tick() {
        if (ring) ring.setAttribute("stroke-dashoffset", (C * (1 - left / total)).toFixed(1));
        var phase = Math.floor((total - left) / 2) % 2;
        if (holdEl) holdEl.textContent = (left <= 0) ? t("Nice. Shake it out! 🌟", "¡Bien hecho. Sacúdete! 🌟") : (phase === 0 ? t("Breathe in…", "Inhala…") : t("Breathe out…", "Exhala…")) + "  " + left;
        if (left <= 0) { if (ring) ring.setAttribute("stroke-dashoffset", 0); if (startBtn) { startBtn.disabled = false; startBtn.textContent = t("Hold again", "Sostener otra vez"); } return; }
        left--; after(tick, 1000);
      }
      tick();
    }
    if (startBtn) startBtn.onclick = startHold;
    for (var i = 0; i < thumbs.length; i++) (function (idx) { thumbs[idx].onclick = function () { ready(idx); }; })(i);
    ready(0);
  }

  /* ===================================================================
     COLD WATER RESET
     =================================================================== */
  var CW_SVG =
    '<svg class="cw-fig" viewBox="0 0 160 200" width="100%" role="img" aria-label="Faucet and cupped hands">'
    + '<rect x="8" y="12" width="22" height="11" rx="3" fill="var(--ink-soft,#46506E)"/>'
    + '<path d="M19 22 L19 42 Q19 46 23 46 L80 46 L80 56" fill="none" stroke="var(--ink-soft,#46506E)" stroke-width="9" stroke-linecap="round"/>'
    + '<g class="cw-stream">'
    + '<circle class="cw-drop" cx="80" cy="60" r="4.2" fill="#5BB8E8"/>'
    + '<circle class="cw-drop" cx="80" cy="60" r="3.4" fill="#84CDF0"/>'
    + '<circle class="cw-drop" cx="80" cy="60" r="4.2" fill="#5BB8E8"/>'
    + '<circle class="cw-drop" cx="80" cy="60" r="3.2" fill="#84CDF0"/>'
    + '<circle class="cw-drop" cx="80" cy="60" r="4.2" fill="#5BB8E8"/>'
    + '</g>'
    + '<ellipse class="cw-ripple" cx="80" cy="132" rx="30" ry="8" fill="none" stroke="#5BB8E8" stroke-width="2.5"/>'
    + '<path d="M40 122 Q80 158 120 122 Q120 142 80 148 Q40 142 40 122 Z" fill="var(--gold-pale,#F1DFA8)" stroke="var(--navy,#0A1E33)" stroke-width="2.5"/>'
    + '</svg>';
  function cwBuilder() {
    return '<div class="tool-modal-icon">💧</div>'
      + '<div class="tool-modal-title">' + t("Cold Water Reset", "Reinicio con agua fría") + '</div>'
      + '<div class="tool-modal-sub">' + t("Cold on your skin flips your body’s calm-down switch (the vagus nerve). A cold water bottle works great — no sink needed.", "El frío en la piel activa el interruptor de calma del cuerpo (el nervio vago). Una botella de agua fría funciona muy bien — sin lavabo.") + '</div>'
      + '<div class="aogt-wrap"><div class="cw-stage" id="cwStage">' + CW_SVG + '</div>'
      + '<div class="aogt-cue" id="cwCue">' + t("Press start, then press your cold bottle to your wrists or neck — or take a slow, cold sip.", "Pulsa empezar y presiona tu botella fría en las muñecas o el cuello — o toma un sorbo lento y frío.") + '</div>'
      + '<div class="aogt-progress" id="cwCount"></div>'
      + '<div class="aogt-controls"><button class="btn" id="cwStart" style="background:var(--gold);color:var(--navy);">' + t("Start", "Empezar") + '</button></div>'
      + '<div class="cw-opts"><b>' + t("At your desk:", "En tu escritorio:") + '</b> '
      + t("Hold your cold water bottle to your wrists, the back of your neck, or your cheeks for 20–30 seconds — or take slow, cold sips. Breathe out each time. <b>Near a sink?</b> Cool water over your wrists, or splash your face 3 times.", "Sostén tu botella de agua fría en las muñecas, la nuca o las mejillas por 20–30 segundos — o toma sorbos lentos y fríos. Exhala cada vez. <b>¿Cerca de un lavabo?</b> Agua fresca sobre las muñecas, o salpica tu cara 3 veces.") + '</div></div>';
  }
  function cwInit() {
    clearTimers();
    var stage = $("cwStage"), btn = $("cwStart"), cue = $("cwCue"), cnt = $("cwCount"); if (!btn) return;
    var cues = [
      t("Feel the cold on your skin.", "Siente el frío en tu piel."),
      t("Breathe out — slow and long.", "Exhala — lento y largo."),
      t("Let your shoulders drop.", "Deja caer los hombros."),
      t("Your body is getting the calm signal.", "Tu cuerpo recibe la señal de calma.")
    ];
    btn.onclick = function () {
      clearTimers();
      if (stage) stage.classList.add("flowing");
      btn.disabled = true; btn.textContent = t("Holding…", "Sosteniendo…");
      var total = reduce() ? 12 : 30, left = total;
      function tick() {
        if (cnt) cnt.textContent = left + "s";
        if (cue && (total - left) % 7 === 0) { cue.style.opacity = 0; (function (c) { after(function () { cue.textContent = c; cue.style.opacity = 1; }, 160); })(cues[((total - left) / 7) % cues.length | 0]); }
        if (left <= 0) {
          if (stage) stage.classList.remove("flowing");
          if (cue) cue.textContent = t("Done. Notice — a little calmer? That's biology, not willpower. 💧", "Listo. ¿Un poco más en calma? Es biología, no fuerza de voluntad. 💧");
          if (cnt) cnt.textContent = "";
          btn.disabled = false; btn.textContent = t("Again", "Otra vez");
          return;
        }
        left--; after(tick, 1000);
      }
      tick();
    };
  }

  /* ===================================================================
     EMOTION WHEEL — drill-down "name it to tame it"
     =================================================================== */
  function emoCores() {
    return [
      { k: t("Mad", "Enojo"), c: "#D85A30", subs: [["Frustrated", "Frustrado"], ["Annoyed", "Molesto"], ["Jealous", "Celoso"], ["Let down", "Decepcionado"], ["Furious", "Furioso"]],
        say: t("Anger means something that matters to you felt threatened. Take one breath before you act — what do you actually need?", "El enojo significa que algo importante para ti se sintió amenazado. Respira antes de actuar — ¿qué necesitas en realidad?") },
      { k: t("Sad", "Tristeza"), c: "#2E7CD6", subs: [["Lonely", "Solo"], ["Hurt", "Herido"], ["Disappointed", "Desilusionado"], ["Gloomy", "Apagado"], ["Grieving", "En duelo"]],
        say: t("Sadness is a signal of loss or longing. You don't have to push it away — is there one person you could tell?", "La tristeza es señal de pérdida o anhelo. No tienes que apartarla — ¿hay alguien a quien podrías contarle?") },
      { k: t("Scared", "Miedo"), c: "#7C5CD6", subs: [["Worried", "Preocupado"], ["Nervous", "Nervioso"], ["Anxious", "Ansioso"], ["Unsure", "Inseguro"], ["Overwhelmed", "Abrumado"]],
        say: t("Fear is your body trying to protect you. Slow your breath — what is one thing that's safe right now?", "El miedo es tu cuerpo intentando protegerte. Respira lento — ¿qué es algo que está a salvo ahora?") },
      { k: t("Joyful", "Alegría"), c: "#E6A817", subs: [["Happy", "Feliz"], ["Excited", "Emocionado"], ["Proud", "Orgulloso"], ["Grateful", "Agradecido"], ["Hopeful", "Esperanzado"]],
        say: t("This one is worth savoring. What's one small thing that helped you feel it? Do more of that.", "Esta vale la pena saborearla. ¿Qué cosa pequeña te ayudó a sentirla? Hazla más.") },
      { k: t("Calm", "Calma"), c: "#2BA199", subs: [["Peaceful", "En paz"], ["Relaxed", "Relajado"], ["Content", "A gusto"], ["Safe", "Seguro"], ["Rested", "Descansado"]],
        say: t("Notice this — it's what safe and steady feel like. Let your body remember it.", "Nótalo — así se siente estar a salvo y firme. Deja que tu cuerpo lo recuerde.") },
      { k: t("Meh", "Indiferente"), c: "#888780", subs: [["Tired", "Cansado"], ["Bored", "Aburrido"], ["Numb", "Insensible"], ["Blah", "Sin ánimo"], ["Shut down", "Bloqueado"]],
        say: t("Flat is a signal too — often 'too much' or 'not enough rest.' Be gentle. What's one small kindness for yourself?", "La indiferencia también es señal — a menudo 'demasiado' o 'poco descanso.' Sé amable. ¿Qué pequeña amabilidad te darías?") }
    ];
  }
  function donutSector(cx, cy, rIn, rOut, a0, a1) {
    var oS = fwPolar(cx, cy, rOut, a0), oE = fwPolar(cx, cy, rOut, a1), iE = fwPolar(cx, cy, rIn, a1), iS = fwPolar(cx, cy, rIn, a0);
    var lg = (a1 - a0) > 180 ? 1 : 0;
    return "M" + oS[0].toFixed(1) + " " + oS[1].toFixed(1) + " A" + rOut + " " + rOut + " 0 " + lg + " 1 " + oE[0].toFixed(1) + " " + oE[1].toFixed(1)
      + " L" + iE[0].toFixed(1) + " " + iE[1].toFixed(1) + " A" + rIn + " " + rIn + " 0 " + lg + " 0 " + iS[0].toFixed(1) + " " + iS[1].toFixed(1) + " Z";
  }
  function emoBuilder() {
    return '<div class="tool-modal-icon">🎭</div>'
      + '<div class="tool-modal-title">' + t("Emotion Wheel", "Rueda de emociones") + '</div>'
      + '<div class="tool-modal-sub">' + t("Name it to tame it. Pick the closest feeling — then the exact word.", "Nómbralo para calmarlo. Elige el sentimiento más cercano — luego la palabra exacta.") + '</div>'
      + '<div class="aogt-wrap"><div class="emo-stage"><svg id="emoSvg" viewBox="0 0 280 280" width="100%" role="img" aria-label="Emotion wheel">'
      + '<g id="emoWedges"></g><circle cx="140" cy="140" r="54" fill="var(--paper,#fff)" stroke="var(--rule,#E4DAC5)" stroke-width="2"/><g id="emoCenter" style="cursor:pointer"></g>'
      + '</svg></div><div class="emo-read" id="emoRead"><div class="emo-say">' + t("How do you feel? Tap the closest one.", "¿Cómo te sientes? Toca el más cercano.") + '</div></div></div>';
  }
  function emoInit() {
    clearTimers();
    var cores = emoCores(), svg = $("emoSvg"); if (!svg) return;
    var W = $("emoWedges"), CEN = $("emoCenter"), READ = $("emoRead");
    var cx = 140, cy = 140, rIn = 56, rOut = 126, lr = 91;
    function label(txt, mid, color) {
      var p = fwPolar(cx, cy, lr, mid), rot = (mid > 90 && mid < 270) ? mid - 180 : mid;
      return '<text class="emo-lbl" x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-size="12.5" transform="rotate(' + rot.toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')">' + esc(txt) + '</text>';
    }
    function drawCores() {
      var n = cores.length, seg = 360 / n, g = "";
      for (var i = 0; i < n; i++) { var a0 = i * seg, a1 = a0 + seg, mid = a0 + seg / 2;
        g += '<path class="emo-wedge" data-core="' + i + '" d="' + donutSector(cx, cy, rIn, rOut, a0, a1) + '" fill="' + cores[i].c + '" stroke="#fff" stroke-width="2"/>' + label(cores[i].k, mid, cores[i].c);
      }
      W.innerHTML = g;
      CEN.innerHTML = '<text x="140" y="134" text-anchor="middle" font-family="var(--font-sans,system-ui)" font-size="12" font-weight="800" fill="var(--ink-soft,#46506E)">' + t("How do", "¿Cómo") + '</text><text x="140" y="150" text-anchor="middle" font-family="var(--font-sans,system-ui)" font-size="12" font-weight="800" fill="var(--ink-soft,#46506E)">' + t("you feel?", "te sientes?") + '</text>';
      CEN.onclick = null;
      var ws = W.querySelectorAll('[data-core]');
      for (var k = 0; k < ws.length; k++) (function (idx) { ws[idx].onclick = function () { drawSubs(idx); }; })(k);
    }
    function shade(hex, i, total) { return "color-mix(in srgb, " + hex + " " + (92 - i * (46 / total)).toFixed(0) + "%, #ffffff)"; }
    function drawSubs(ci) {
      var core = cores[ci], n = core.subs.length, seg = 360 / n, g = "";
      for (var i = 0; i < n; i++) { var a0 = i * seg, a1 = a0 + seg, mid = a0 + seg / 2, nm = core.subs[i][L() === "es" ? 1 : 0];
        g += '<path class="emo-wedge" data-sub="' + i + '" d="' + donutSector(cx, cy, rIn, rOut, a0, a1) + '" fill="' + shade(core.c, i, n) + '" stroke="#fff" stroke-width="2"/>' + label(nm, mid, core.c);
      }
      W.innerHTML = g;
      CEN.innerHTML = '<text x="140" y="136" text-anchor="middle" font-family="var(--font-serif,Georgia,serif)" font-size="15" font-weight="700" fill="' + core.c + '">' + esc(core.k) + '</text><text x="140" y="153" text-anchor="middle" font-family="var(--font-sans,system-ui)" font-size="10" font-weight="700" fill="var(--ink-faint,#8A92A6)">' + t("← back", "← volver") + '</text>';
      CEN.onclick = function () { drawCores(); if (READ) READ.innerHTML = '<div class="emo-say">' + t("Now choose the exact word.", "Ahora elige la palabra exacta.") + '</div>'; };
      if (READ) READ.innerHTML = '<div class="emo-say">' + t("Closer. Now tap the word that fits best.", "Más cerca. Ahora toca la palabra que mejor encaje.") + '</div>';
      var ws = W.querySelectorAll('[data-sub]');
      for (var k = 0; k < ws.length; k++) (function (idx) { ws[idx].onclick = function () { named(core, idx); }; })(k);
    }
    function named(core, si) {
      var nm = core.subs[si][L() === "es" ? 1 : 0];
      if (READ) READ.innerHTML = '<div class="emo-named">' + t("You named it: ", "Lo nombraste: ") + '<b style="color:' + core.c + '">' + esc(nm) + '</b></div>'
        + '<div class="emo-kind">' + t("a kind of ", "un tipo de ") + esc(core.k) + '</div>'
        + '<div class="emo-say">' + esc(core.say) + '</div>';
      try { if (window.GraceAudio && window.GraceAudio.playSuccess) window.GraceAudio.playSuccess(); } catch (e) {}
    }
    drawCores();
  }

  /* ===================================================================
     5-4-3-2-1 GROUNDING — sense icons + tap-to-name tally
     =================================================================== */
  var GND_EYE = '<path d="M3 32C14 18 50 18 61 32 50 46 14 46 3 32Z" fill="none"/><circle cx="32" cy="32" r="10"/><circle cx="32" cy="32" r="3.4" fill="currentColor" stroke="none"/>';
  var GND_TOUCH = '<circle cx="32" cy="35" r="4"/><path d="M22 35a10 10 0 0 1 20 0" fill="none"/><path d="M16 35a16 16 0 0 1 32 0" fill="none"/><path d="M30 51a18 18 0 0 0 8-17" fill="none"/>';
  var GND_EAR = '<path d="M24 46c0 4 3 6 7 6s7-3 7-8c0-6 6-7 6-15a14 14 0 0 0-28 0" fill="none"/><path d="M28 31a6 6 0 0 1 10 3" fill="none"/><path d="M47 22a11 11 0 0 1 0 19" fill="none"/><path d="M51 16a18 18 0 0 1 0 31" fill="none"/>';
  var GND_NOSE = '<path d="M35 13c-2 9-3 13-8 21-3 6 2 11 7 9" fill="none"/><path d="M34 43c5 2 9-1 9-7" fill="none"/><path d="M45 16c3 2 3 5 0 7s-3 5 0 7" fill="none"/>';
  var GND_MOUTH = '<path d="M12 30c10-9 34-9 44 0-7 9-14 11-22 11S19 39 12 30Z" fill="none"/><path d="M27 39c0 6 10 6 10 0v-7H27Z" fill="currentColor" stroke="none"/>';
  function gndSteps() {
    return [
      { n: "5", sense: t("SEE", "VER"), q: t("Name 5 things you can see right now.", "Nombra 5 cosas que puedas ver ahora."), ex: t("A door, a window, a pencil, the floor, a chair.", "Una puerta, una ventana, un lápiz, el piso, una silla."), c: "#2E7CD6", icon: GND_EYE },
      { n: "4", sense: t("TOUCH", "TOCAR"), q: t("Name 4 things you can physically feel.", "Nombra 4 cosas que puedas sentir físicamente."), ex: t("Your feet on the floor. The chair. Your clothes. The air on your face.", "Tus pies en el piso. La silla. Tu ropa. El aire en tu cara."), c: "#2BA199", icon: GND_TOUCH },
      { n: "3", sense: t("HEAR", "OÍR"), q: t("Name 3 things you can hear right now.", "Nombra 3 cosas que puedas oír ahora."), ex: t("Breathing. A clock. A sound outside the room.", "La respiración. Un reloj. Un sonido afuera."), c: "#7C5CD6", icon: GND_EAR },
      { n: "2", sense: t("SMELL", "OLER"), q: t("Name 2 things you can smell — or like the smell of.", "Nombra 2 cosas que puedas oler — o cuyo olor te guste."), ex: t("Fresh air. Something from lunch. Something clean.", "Aire fresco. Algo del almuerzo. Algo limpio."), c: "#E6A817", icon: GND_NOSE },
      { n: "1", sense: t("TASTE", "GUSTO"), q: t("Name 1 thing you can taste, or like the taste of.", "Nombra 1 cosa que puedas saborear, o cuyo sabor te guste."), ex: t("Water. A favorite food. Something sweet.", "Agua. Una comida favorita. Algo dulce."), c: "#D85A30", icon: GND_MOUTH }
    ];
  }
  function gndBuilder() {
    var steps = gndSteps();
    var dots = steps.map(function (s, i) { return '<span class="gnd-dot' + (i === 0 ? " on" : "") + '" id="gnddot' + i + '"></span>'; }).join("");
    return '<div class="tool-modal-icon">🌿</div>'
      + '<div class="tool-modal-title">' + t("5-4-3-2-1 Grounding", "Anclaje 5-4-3-2-1") + '</div>'
      + '<div class="tool-modal-sub">' + t("Come back to your senses, one at a time. Tap each thing as you name it.", "Vuelve a tus sentidos, uno a uno. Toca cada cosa al nombrarla.") + '</div>'
      + '<div class="gnd-prog">' + dots + '</div>'
      + '<div class="gnd-stage"><svg id="gndSvg" viewBox="0 0 120 120" width="128" role="img" aria-label="sense">'
      + '<circle id="gndHalo" cx="60" cy="60" r="50" stroke-width="2"/><g id="gndIcon" transform="translate(28,28)" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></g></svg></div>'
      + '<div class="gnd-sense" id="gndSense"></div>'
      + '<div class="gnd-q" id="gndQ"></div>'
      + '<div class="gnd-chips" id="gndChips"></div>'
      + '<div class="gnd-ex" id="gndEx"></div>'
      + '<div class="aogt-controls"><button class="btn btn-secondary" id="gndBack" style="display:none">' + t("← Back", "← Atrás") + '</button>'
      + '<button class="btn" id="gndNext" style="background:var(--gold);border-color:var(--gold);color:var(--navy)">' + t("Next →", "Siguiente →") + '</button></div>';
  }
  function gndInit() {
    clearTimers();
    var steps = gndSteps(), idx = 0;
    var halo = $("gndHalo"), ico = $("gndIcon"), svg = $("gndSvg"), senseEl = $("gndSense"), qEl = $("gndQ"), exEl = $("gndEx"), chips = $("gndChips"), back = $("gndBack"), next = $("gndNext");
    if (!ico) return;
    function paint() {
      var s = steps[idx];
      svg.style.color = s.c;
      halo.setAttribute("stroke", s.c);
      halo.setAttribute("fill", "color-mix(in srgb, " + s.c + " 12%, transparent)");
      ico.innerHTML = s.icon; ico.setAttribute("stroke", s.c);
      senseEl.innerHTML = '<span class="gnd-num" style="color:' + s.c + '">' + s.n + '</span><span class="gnd-lbl">' + esc(s.sense) + '</span>';
      qEl.textContent = s.q; exEl.textContent = s.ex;
      var nN = parseInt(s.n, 10), c = "";
      for (var k = 0; k < nN; k++) c += '<button class="gnd-chip" data-k="' + k + '">' + (k + 1) + '</button>';
      chips.innerHTML = c;
      chips.querySelectorAll(".gnd-chip").forEach(function (ch) {
        ch.onclick = function () {
          if (ch.classList.contains("on")) return;
          ch.classList.add("on"); ch.style.background = s.c; ch.style.borderColor = s.c; ch.innerHTML = "✓";
          try { if (window.GraceAudio && window.GraceAudio.playPop) window.GraceAudio.playPop(); } catch (e) {}
        };
      });
      if (!reduceMotion()) { ico.classList.remove("gnd-pop"); reflow(ico); ico.classList.add("gnd-pop"); }
      steps.forEach(function (_, i) { var d = $("gnddot" + i); if (d) d.classList.toggle("on", i <= idx); });
      back.style.display = idx > 0 ? "" : "none";
      next.textContent = idx >= steps.length - 1 ? t("Done ✓", "Listo ✓") : t("Next →", "Siguiente →");
    }
    next.onclick = function () { if (idx >= steps.length - 1) { if (window.toolClose) window.toolClose(); return; } idx++; paint(); };
    back.onclick = function () { if (idx > 0) { idx--; paint(); } };
    paint();
  }

  /* ===================================================================
     TAKE 5 — trace-your-hand breathing (elite, gated Begin)
     =================================================================== */
  var T5F = [
    { b: [70, 184], t: [42, 138] },
    { b: [88, 154], t: [82, 52] },
    { b: [109, 150], t: [109, 40] },
    { b: [130, 152], t: [136, 54] },
    { b: [150, 162], t: [166, 98] }
  ];
  function t5Builder() {
    var hand = '<path class="t5-palm2" d="M60 176 Q52 232 110 234 Q168 232 158 176 Q150 150 110 150 Q70 150 60 176 Z"/>';
    T5F.forEach(function (f, i) { hand += '<line class="t5-fin" id="t5fin' + i + '" x1="' + f.b[0] + '" y1="' + f.b[1] + '" x2="' + f.t[0] + '" y2="' + f.t[1] + '" stroke-linecap="round"/>'; });
    return '<div class="tool-modal-icon">🖐️</div>'
      + '<div class="tool-modal-title">' + t("Take 5", "Toma 5") + '</div>'
      + '<div class="tool-modal-sub">' + t("Trace your hand — breathe in gliding up a finger, out coming down the other side.", "Traza tu mano — inhala subiendo por un dedo, exhala bajando por el otro lado.") + '</div>'
      + '<div class="t5-wrap"><svg class="t5-svg2" viewBox="0 0 220 250" width="200" role="img" aria-label="' + t("Trace your hand breathing", "Traza tu mano") + '">'
      + '<g id="t5hand">' + hand + '</g>'
      + '<circle class="t5-ring2" id="t5ring" cx="110" cy="150" r="16"/>'
      + '<circle class="t5-tracer2" id="t5dot" cx="110" cy="150" r="8"/>'
      + '</svg>'
      + '<div class="t5-read"><div class="t5-phase" id="t5phase">' + t("Ready when you are.", "Cuando estés listo.") + '</div><div class="t5-secs" id="t5secs"></div><div class="t5-finc" id="t5finc"></div></div>'
      + '<div class="aogt-controls"><button class="btn" id="t5start" style="background:var(--gold);border-color:var(--gold);color:var(--navy)">' + t("Begin", "Comenzar") + '</button></div>'
      + '</div>';
  }
  function t5Init() {
    clearTimers();
    var dot = $("t5dot"), ring = $("t5ring"), ph = $("t5phase"), sc = $("t5secs"), fc = $("t5finc"), btn = $("t5start");
    if (!dot) return;
    var IN = 4, OUT = 4, stopped = false, raf = null;
    CANCELS.push(function () { stopped = true; if (raf) cancelAnimationFrame(raf); });
    function lerp(a, b, p) { return a + (b - a) * p; }
    function ease(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
    function setFin(i, on) { var e = $("t5fin" + i); if (e) e.classList.toggle("on", on); }
    function move(x, y) { dot.setAttribute("cx", x.toFixed(1)); dot.setAttribute("cy", y.toFixed(1)); ring.setAttribute("cx", x.toFixed(1)); ring.setAttribute("cy", y.toFixed(1)); }
    function phase(fi, going, cb) {
      if (stopped) return;
      var f = T5F[fi], from = going === "up" ? f.b : f.t, to = going === "up" ? f.t : f.b;
      ph.textContent = going === "up" ? t("Breathe in", "Inhala") : t("Breathe out", "Exhala");
      fc.textContent = t("Finger ", "Dedo ") + (fi + 1) + t(" of 5", " de 5");
      setFin(fi, true);
      var dur = (going === "up" ? IN : OUT) * 1000;
      if (reduceMotion()) {
        move(to[0], to[1]); var rem = Math.round(dur / 1000); sc.textContent = rem;
        var iv = setInterval(function () { rem--; sc.textContent = rem > 0 ? rem : ""; if (rem <= 0) { clearInterval(iv); if (cb) cb(); } }, 1000);
        TIMERS.push(iv); return;
      }
      var t0 = performance.now();
      function stepFn(now) {
        if (stopped) return;
        var p = Math.min(1, (now - t0) / dur), e = ease(p);
        move(lerp(from[0], to[0], e), lerp(from[1], to[1], e));
        var rs = going === "up" ? lerp(1, 2.0, e) : lerp(2.0, 1, e);
        ring.setAttribute("r", (12 * rs).toFixed(1));
        ring.style.opacity = (going === "up" ? lerp(0.55, 0.12, e) : lerp(0.12, 0.55, e)).toFixed(2);
        sc.textContent = Math.max(1, Math.ceil(dur / 1000 - (now - t0) / 1000));
        if (p < 1) { raf = requestAnimationFrame(stepFn); } else if (cb) { cb(); }
      }
      raf = requestAnimationFrame(stepFn);
    }
    function run(fi) {
      if (stopped) return;
      if (fi >= T5F.length) { done(); return; }
      phase(fi, "up", function () { setFin(fi, false); phase(fi, "down", function () { run(fi + 1); }); });
    }
    function done() {
      ph.textContent = t("Beautiful — five slow breaths.", "Hermoso — cinco respiraciones lentas.");
      sc.textContent = ""; fc.textContent = ""; ring.style.opacity = "0";
      T5F.forEach(function (_, i) { setFin(i, false); });
      btn.style.display = ""; btn.textContent = t("Again", "Otra vez");
    }
    btn.onclick = function () { btn.style.display = "none"; stopped = false; run(0); };
  }

  /* ===================================================================
     OVERRIDE + lifecycle
     =================================================================== */
  function override() {
    if (!window.TOOLS) return;
    if (window.TOOLS.pmr) window.TOOLS.pmr = { builder: bsBuilder, init: bsInit };
    if (window.TOOLS.bilateral) window.TOOLS.bilateral = { builder: bhBuilder, init: bhInit };
    if (window.TOOLS.animalyoga) window.TOOLS.animalyoga = { builder: ayBuilder, init: ayInit };
    if (window.TOOLS.coldwater) window.TOOLS.coldwater = { builder: cwBuilder, init: cwInit };
    if (window.TOOLS.emotion) window.TOOLS.emotion = { builder: emoBuilder, init: emoInit };
    if (window.TOOLS.grounding) window.TOOLS.grounding = { builder: gndBuilder, init: gndInit };
    if (window.TOOLS.take5) window.TOOLS.take5 = { builder: t5Builder, init: t5Init };
    window.TOOLS.feelwheel = { builder: fwBuilder, init: fwInit };
  }
  function wrapOpen() {
    if (typeof window.toolOpen === "function") {
      if (!window.toolOpen.__aogtWrap) {
        var o = window.toolOpen;
        window.toolOpen = function () { try { override(); clearTimers(); } catch (e) {} return o.apply(this, arguments); };
        window.toolOpen.__aogtWrap = 1;
      }
    } else { setTimeout(wrapOpen, 200); }
  }
  function wrapClose() {
    if (typeof window.toolClose === "function") {
      if (!window.toolClose.__aogtWrap) {
        var o = window.toolClose;
        window.toolClose = function () { try { clearTimers(); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {} return o.apply(this, arguments); };
        window.toolClose.__aogtWrap = 1;
      }
    } else { setTimeout(wrapClose, 200); }
  }
  function boot() { override(); wrapOpen(); wrapClose(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.addEventListener("load", function () { override(); setTimeout(override, 500); });
})();

