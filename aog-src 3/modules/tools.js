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
  function clearTimers() { for (var i = 0; i < TIMERS.length; i++) { clearTimeout(TIMERS[i]); clearInterval(TIMERS[i]); } TIMERS = []; }
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
      + '<div class="tool-modal-sub">' + t("Cold water on your wrists or face wakes up the body's own calm-down signal.", "El agua fría en las muñecas o la cara activa la señal de calma del cuerpo.") + '</div>'
      + '<div class="aogt-wrap"><div class="cw-stage" id="cwStage">' + CW_SVG + '</div>'
      + '<div class="aogt-cue" id="cwCue">' + t("Press start, then hold your wrists under cool water.", "Pulsa empezar y pon las muñecas bajo agua fresca.") + '</div>'
      + '<div class="aogt-progress" id="cwCount"></div>'
      + '<div class="aogt-controls"><button class="btn" id="cwStart" style="background:var(--gold);color:var(--navy);">' + t("Turn on the cold water", "Abrir el agua fría") + '</button></div>'
      + '<div class="cw-opts"><b>' + t("No sink nearby?", "¿No hay lavabo?") + '</b> '
      + t("Splash your face 3 times, or hold a cold bottle to the back of your neck or wrists. Exhale with each one.", "Salpica tu cara 3 veces, o sostén una botella fría en la nuca o las muñecas. Exhala con cada una.") + '</div></div>';
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
      btn.disabled = true; btn.textContent = t("Flowing…", "Fluyendo…");
      var total = reduce() ? 12 : 30, left = total;
      function tick() {
        if (cnt) cnt.textContent = left + "s";
        if (cue && (total - left) % 7 === 0) { cue.style.opacity = 0; (function (c) { after(function () { cue.textContent = c; cue.style.opacity = 1; }, 160); })(cues[((total - left) / 7) % cues.length | 0]); }
        if (left <= 0) {
          if (stage) stage.classList.remove("flowing");
          if (cue) cue.textContent = t("Off. Notice — a little calmer? That's biology, not willpower. 💧", "Cierra. ¿Un poco más en calma? Es biología, no fuerza de voluntad. 💧");
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
     OVERRIDE + lifecycle
     =================================================================== */
  function override() {
    if (!window.TOOLS) return;
    if (window.TOOLS.pmr) window.TOOLS.pmr = { builder: bsBuilder, init: bsInit };
    if (window.TOOLS.bilateral) window.TOOLS.bilateral = { builder: bhBuilder, init: bhInit };
    if (window.TOOLS.animalyoga) window.TOOLS.animalyoga = { builder: ayBuilder, init: ayInit };
    if (window.TOOLS.coldwater) window.TOOLS.coldwater = { builder: cwBuilder, init: cwInit };
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
