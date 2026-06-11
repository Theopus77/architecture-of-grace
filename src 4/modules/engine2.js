/**
 * Architecture of Grace — World-Class Regulation Engine
 * Integrated framework for high-fidelity sensory interactions, AAC, and crisis triage.
 * Bridged to the existing toolOpen()/TOOLS system; styled with AoG design tokens.
 * Bilingual (EN/ES): reads the app's global `lang` and re-localizes on language switch.
 */
(function () {
  "use strict";

  function graceToday() { return new Date().toISOString().slice(0, 10); }
  function readJSON(k, fb) { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch (e) { return fb; } }

  // ---- Language helpers (piggyback on the app's global `lang`) ------------
  function curLang() {
    try { if (typeof window.lang === 'string') return window.lang; } catch (e) {}
    try { if (typeof lang !== 'undefined' && typeof lang === 'string') return lang; } catch (e) {}
    return 'en';
  }
  function speechLang() { return curLang() === 'es' ? 'es-ES' : 'en-US'; }

  // All engine-generated copy, EN/ES.
  var GI18N = {
    triage_lead:   { en: 'In a hard moment right now? Start here.', es: '¿Un momento difícil ahora mismo? Empieza aquí.' },
    t_cant:        { en: "CAN'T CALM DOWN", es: 'NO ME CALMO' },
    t_shut:        { en: 'SHUTTING DOWN', es: 'ME ESTOY BLOQUEANDO' },
    t_move:        { en: 'NEEDS TO MOVE', es: 'NECESITO MOVERME' },
    banner_pre:    { en: 'Quietly practiced', es: 'Practicaste en silencio' },
    banner_one:    { en: 'tool', es: 'herramienta' },
    banner_many:   { en: 'tools', es: 'herramientas' },
    banner_post:   { en: 'today ✓', es: 'hoy ✓' },
    wb_label:      { en: '✨ Welcome back:', es: '✨ Bienvenido de nuevo:' },
    wb_pre:        { en: 'Last time you found relief with', es: 'La última vez encontraste alivio con' },
    wb_post:       { en: '. Start again?', es: '. ¿Empezar otra vez?' },
    fw_title:      { en: 'Feelings Wheel', es: 'Rueda de emociones' },
    fw_sub:        { en: 'Tap the feeling closest to right now — it will be named out loud.', es: 'Toca la emoción más cercana a este momento — se nombrará en voz alta.' },
    fw_prompt:     { en: 'Tap a color to begin.', es: 'Toca un color para empezar.' },
    fw_chose_a:    { en: 'You chose', es: 'Elegiste' },
    fw_chose_b:    { en: '. That makes sense. You are allowed to feel it.', es: '. Tiene sentido. Está bien sentirlo.' },
    fw_speak:      { en: 'You feel', es: 'Te sientes' },
    pp_title:      { en: '🌟 Regulation Passport Earned!', es: '🌟 ¡Pasaporte de Regulación obtenido!' },
    pp_body:       { en: 'Incredible effort. You safely moved through 3 regulation tools today.', es: 'Esfuerzo increíble. Hoy recorriste con calma 3 herramientas de regulación.' },
    pp_save:       { en: 'Save Image ↓', es: 'Guardar imagen ↓' },
    pp_return:     { en: 'Return', es: 'Volver' },
    pp_c_title:    { en: 'REGULATION PASSPORT', es: 'PASAPORTE DE REGULACIÓN' },
    pp_c_holder:   { en: 'Holder: Verified Self-Regulator', es: 'Titular: Autorregulación verificada' },
    pp_c_line:     { en: '✓ Completed 3 tools rooted in grace', es: '✓ 3 herramientas completadas con gracia' },
    pp_c_date:     { en: 'Date: ', es: 'Fecha: ' },
    dm_return:     { en: 'Return to Sanctuary', es: 'Volver al refugio' },
    dm_placeholder:{ en: 'Container placeholder for', es: 'Contenedor para' }
  };
  function gT(key) { var e = GI18N[key]; if (!e) return key; return e[curLang()] || e.en; }

  // Friendly tool names for the "welcome back" card.
  var TOOL_NAME = {
    breathing:  { en: 'breathing', es: 'respiración' },
    grounding:  { en: 'grounding', es: 'anclaje' },
    movement:   { en: 'a movement break', es: 'una pausa de movimiento' },
    rainbow:    { en: 'rainbow breathing', es: 'respiración arcoíris' },
    pmr:        { en: 'a body scan', es: 'un escaneo corporal' },
    bilateral:  { en: 'a butterfly hug', es: 'un abrazo de mariposa' },
    safeplace:  { en: 'your safe place', es: 'tu lugar seguro' },
    coreg:      { en: 'co-regulation', es: 'corregulación' },
    coldwater:  { en: 'a cold-water reset', es: 'un reinicio con agua fría' },
    soundscape: { en: 'a soundscape', es: 'un paisaje sonoro' },
    fidget:     { en: 'a visual fidget', es: 'un fidget visual' },
    animalyoga: { en: 'animal yoga', es: 'yoga de animales' },
    calmjar:    { en: 'the calm jar', es: 'el frasco de la calma' },
    emotion:    { en: 'the emotion wheel', es: 'la rueda de emociones' },
    feelwheel:  { en: 'the feelings wheel', es: 'la rueda de emociones' }
  };
  function toolName(key) {
    var e = TOOL_NAME[key];
    if (e) return e[curLang()] || e.en;
    return String(key).replace(/-/g, ' ');
  }

  // ---- Global state (date-aware: "today" actually resets at midnight) ----
  var _today = readJSON('grace_today_v1', null);
  var _fresh = !_today || _today.date !== graceToday();
  var GraceState = {
    sessionHistory: readJSON('grace_session_history', []),
    todayPracticedCount: _fresh ? 0 : (_today.count || 0),
    todayDistinctTools: _fresh ? [] : (_today.tools || []),
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // ========================================================================
  // 1. EXTENDED HAPTIC & AUDIO GENERATOR
  // ========================================================================
  var GraceAudio = {
    ctx: null,
    init: function () {
      if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
      if (this.ctx && this.ctx.state === 'suspended') { this.ctx.resume(); }
    },
    _tone: function (freq, type, t0, dur, peak) {
      var o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.ctx.destination); o.start(t0); o.stop(t0 + dur);
    },
    playPop: function () {
      this.init(); if (!this.ctx || GraceState.prefersReducedMotion) return;
      var o = this.ctx.createOscillator(), g = this.ctx.createGain(), t = this.ctx.currentTime;
      o.type = 'triangle';
      o.frequency.setValueAtTime(340, t);
      o.frequency.exponentialRampToValueAtTime(140, t + 0.08);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(t + 0.08);
    },
    playSuccess: function () {
      this.init(); if (!this.ctx || GraceState.prefersReducedMotion) return;
      var now = this.ctx.currentTime, self = this;
      // Harmonious major triad (C5, E5, G5) resolving upward for psychological reward.
      [523.25, 659.25, 783.99].forEach(function (f, i) { self._tone(f, 'sine', now + (i * 0.08), 0.4 - (i * 0.08), 0.06); });
    },
    playJarTinkle: function () {
      this.init(); if (!this.ctx || GraceState.prefersReducedMotion) return;
      // High-frequency procedural chimes for the calm-jar shimmer.
      for (var i = 0; i < 4; i++) { this._tone(1500 + Math.random() * 800, 'sine', this.ctx.currentTime + (i * 0.05), 0.12, 0.03); }
    },
    // FIX: GraceCrisisTriage called playHum(), which did not exist on the
    // original object and would throw on every triage tap. Added a low, grounding hum.
    playHum: function () {
      this.init(); if (!this.ctx || GraceState.prefersReducedMotion) return;
      var t = this.ctx.currentTime;
      var o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(196, t);
      o.frequency.linearRampToValueAtTime(174.61, t + 0.5);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(t + 0.6);
    }
  };

  // ========================================================================
  // 2. PLUTCHIK-INSPIRED SVG EMOTION WHEEL CONSTRUCTOR
  // ========================================================================
  class GraceEmotionWheel {
    constructor(containerId, onSelect) {
      this.container = (typeof containerId === 'string') ? document.getElementById(containerId) : containerId;
      this.onSelect = onSelect;
      this.emotions = [
        { name: 'Angry', es: 'Enojado', color: '#f87171', zone: 'START' }, { name: 'Frustrated', es: 'Frustrado', color: '#fca5a5', zone: 'START' },
        { name: 'Scared', es: 'Asustado', color: '#fbbf24', zone: 'OPEN' }, { name: 'Anxious', es: 'Ansioso', color: '#fde047', zone: 'OPEN' },
        { name: 'Sad', es: 'Triste', color: '#60a5fa', zone: 'GUIDE' }, { name: 'Lonely', es: 'Solo', color: '#93c5fd', zone: 'GUIDE' },
        { name: 'Calm', es: 'Tranquilo', color: '#34d399', zone: 'PEACE' }, { name: 'Happy', es: 'Feliz', color: '#6ee7b7', zone: 'PEACE' },
        { name: 'Tired', es: 'Cansado', color: '#a78bfa', zone: 'REST' }
      ];
      if (this.container) this.render();
    }
    label(emo) { return curLang() === 'es' && emo.es ? emo.es : emo.name; }
    render() {
      var self = this;
      var size = 300, center = size / 2, radius = 130, step = (Math.PI * 2) / this.emotions.length;
      var hub = curLang() === 'es' ? 'SIENTE' : 'FEEL';
      var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" height="100%" class="emotion-wheel-svg">';
      svg += '<circle cx="' + center + '" cy="' + center + '" r="' + (radius + 15) + '" fill="none" stroke="#e2e8f0" stroke-width="2"/>';
      this.emotions.forEach(function (emo, i) {
        var a0 = i * step - Math.PI / 2, a1 = (i + 1) * step - Math.PI / 2;
        var x1 = center + radius * Math.cos(a0), y1 = center + radius * Math.sin(a0);
        var x2 = center + radius * Math.cos(a1), y2 = center + radius * Math.sin(a1);
        var large = (a1 - a0) > Math.PI ? 1 : 0;
        var d = 'M ' + center + ' ' + center + ' L ' + x1 + ' ' + y1 + ' A ' + radius + ' ' + radius + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z';
        var ta = a0 + step / 2, tx = center + (radius * 0.65) * Math.cos(ta), ty = center + (radius * 0.65) * Math.sin(ta);
        svg += '<g class="wheel-wedge" data-emotion="' + emo.name + '" style="cursor:pointer;">'
          + '<path d="' + d + '" fill="' + emo.color + '" opacity="0.8" stroke="#ffffff" stroke-width="3" class="wedge-path"/>'
          + '<text x="' + tx + '" y="' + ty + '" transform="rotate(' + ((ta * 180 / Math.PI) + 90) + ', ' + tx + ', ' + ty + ')" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#1e293b">' + self.label(emo) + '</text></g>';
      });
      svg += '<circle cx="' + center + '" cy="' + center + '" r="35" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>';
      svg += '<text x="' + center + '" y="' + center + '" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="700" fill="#64748b">' + hub + '</text></svg>';
      this.container.innerHTML = svg;
      this.bindEvents();
    }
    bindEvents() {
      var self = this;
      this.container.querySelectorAll('.wheel-wedge').forEach(function (wedge) {
        wedge.addEventListener('click', function () {
          var name = wedge.dataset.emotion;
          GraceAudio.playPop();
          var path = wedge.querySelector('.wedge-path');
          path.style.opacity = '1'; path.style.transform = 'scale(1.06)';
          setTimeout(function () { path.style.transform = 'scale(1)'; path.style.opacity = '0.8'; }, 200);
          if (self.onSelect) self.onSelect(self.emotions.find(function (e) { return e.name === name; }));
        });
      });
    }
  }

  // ========================================================================
  // 3. PERSISTENT MEMORY & PROGRESS METRIC LOGGING
  // ========================================================================
  var GraceTracker = {
    logToolPractice: function (toolId) {
      if (!toolId) return;
      GraceState.sessionHistory.push({ toolId: toolId, timestamp: Date.now() });
      if (GraceState.sessionHistory.length > 200) GraceState.sessionHistory = GraceState.sessionHistory.slice(-200);
      localStorage.setItem('grace_session_history', JSON.stringify(GraceState.sessionHistory));
      localStorage.setItem('grace_last_used_tool', toolId);

      // Daily counters — FIX: original reset to 0 on every page load; now date-keyed.
      var stored = readJSON('grace_today_v1', null);
      if (stored && stored.date !== graceToday()) { GraceState.todayPracticedCount = 0; GraceState.todayDistinctTools = []; }
      GraceState.todayPracticedCount++;
      if (GraceState.todayDistinctTools.indexOf(toolId) === -1) GraceState.todayDistinctTools.push(toolId);
      localStorage.setItem('grace_today_v1', JSON.stringify({ date: graceToday(), count: GraceState.todayPracticedCount, tools: GraceState.todayDistinctTools }));
      this.updateDashboardCounters();

      // Passport: three DISTINCT tools, awarded at most once per day.
      if (GraceState.todayDistinctTools.length >= 3 && localStorage.getItem('grace_passport_date') !== graceToday()) {
        localStorage.setItem('grace_passport_date', graceToday());
        GracePassport.triggerPassportAward();
      }
    },
    updateDashboardCounters: function () {
      var el = document.getElementById('grace-practiced-banner');
      if (el && GraceState.todayPracticedCount > 0) {
        var n = GraceState.todayPracticedCount;
        var unit = (n === 1) ? gT('banner_one') : gT('banner_many');
        el.innerHTML = gT('banner_pre') + ' <strong>' + n + ' ' + unit + '</strong> ' + gT('banner_post');
        el.classList.add('visible-banner');
      }
    },
    surfacePersistentRec: function () {
      var last = localStorage.getItem('grace_last_used_tool');
      var c = document.getElementById('persistent-history-anchor');
      if (!last || !c) return;
      c.innerHTML = '<div class="history-memory-card" role="button" tabindex="0">'
        + '<p><span>' + gT('wb_label') + '</span> ' + gT('wb_pre') + ' <strong>' + toolName(last) + '</strong>' + gT('wb_post') + '</p></div>';
      var card = c.querySelector('.history-memory-card');
      if (card) card.addEventListener('click', function () { GraceModal.launch(last); });
    }
  };

  // ========================================================================
  // 4. CRISIS MANAGEMENT — AIDE "QUICK-PICK" TRIAGE
  // ========================================================================
  var GraceCrisisTriage = {
    render: function () {
      var w = document.getElementById('aide-triage-wrapper');
      if (!w) return;
      w.innerHTML = '<div class="triage-panel">'
        + '<button class="triage-btn cant-calm" data-target="breathing-orb"><span>' + gT('t_cant') + '</span></button>'
        + '<button class="triage-btn shutting-down" data-target="feet-floor"><span>' + gT('t_shut') + '</span></button>'
        + '<button class="triage-btn needs-move" data-target="hand-warming"><span>' + gT('t_move') + '</span></button></div>';
      w.querySelectorAll('.triage-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          GraceAudio.playHum();
          GraceModal.launch(btn.dataset.target, true); // high-priority override
        });
      });
    },
    init: function () { this.render(); }
  };

  // ========================================================================
  // 5. AAC SENTENCE STRIP SPEAKER (reusable; PECS speak upgraded separately)
  // ========================================================================
  class GraceSentenceStrip {
    constructor(stripContainerId) {
      this.container = document.getElementById(stripContainerId);
      this.activeCards = [];
      if (this.container) this.renderBaseStructure();
    }
    renderBaseStructure() {
      this.container.innerHTML = '<div class="aac-sentence-strip-wrapper"><div class="sentence-display-line" id="aac-line-target"></div><button class="aac-speak-btn" id="aac-speak-trigger">🔊 Speak</button></div>';
      var self = this;
      this.container.querySelector('#aac-speak-trigger').addEventListener('click', function () { self.speakSentence(); });
    }
    addCardToStrip(cardData) { GraceAudio.playPop(); this.activeCards.push(cardData); this.refreshStripUI(); }
    refreshStripUI() {
      var target = this.container.querySelector('#aac-line-target');
      target.innerHTML = this.activeCards.map(function (card, i) {
        return '<div class="aac-strip-item" data-index="' + i + '"><img src="' + card.imgUrl + '" alt="' + card.text + '"/><span>' + card.text + '</span></div>';
      }).join('');
    }
    speakSentence() {
      if (this.activeCards.length === 0 || !('speechSynthesis' in window)) return;
      var u = new SpeechSynthesisUtterance(this.activeCards.map(function (c) { return c.text; }).join(' '));
      u.rate = 0.85; u.pitch = 1.2; u.lang = speechLang();
      var items = this.container.querySelectorAll('.aac-strip-item'), wi = 0;
      u.onboundary = function (event) {
        if (event.name === 'word' && items[wi]) {
          items.forEach(function (it) { it.classList.remove('speaking-highlight'); });
          items[wi].classList.add('speaking-highlight'); wi++;
        }
      };
      u.onend = function () { items.forEach(function (it) { it.classList.remove('speaking-highlight'); }); GraceAudio.playSuccess(); };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }

  // ========================================================================
  // 6. VISUAL PASSPORT REWARD GENERATION ENGINE
  // ========================================================================
  var GracePassport = {
    triggerPassportAward: function () {
      GraceAudio.playSuccess();
      var overlay = document.createElement('div');
      overlay.className = 'passport-modal-overlay';
      overlay.innerHTML = '<div class="passport-award-card"><h3>' + gT('pp_title') + '</h3>'
        + '<p>' + gT('pp_body') + '</p>'
        + '<canvas id="passport-canvas" width="400" height="250"></canvas>'
        + '<div class="passport-actions"><button id="download-passport-btn">' + gT('pp_save') + '</button><button id="close-passport-btn">' + gT('pp_return') + '</button></div></div>';
      overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
      this.drawPassportCanvas();
      document.getElementById('download-passport-btn').addEventListener('click', function () { GracePassport.downloadPng(); });
      document.getElementById('close-passport-btn').addEventListener('click', function () { overlay.remove(); });
    },
    drawPassportCanvas: function () {
      var canvas = document.getElementById('passport-canvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FCF8F0'; ctx.fillRect(0, 0, 400, 250);
      ctx.lineWidth = 6; ctx.strokeStyle = '#F1DFA8'; ctx.strokeRect(3, 3, 394, 244);
      ctx.lineWidth = 1; ctx.strokeStyle = '#D9A33B'; ctx.strokeRect(10, 10, 380, 230);
      ctx.fillStyle = '#0A1E33'; ctx.font = 'bold 20px Georgia, serif'; ctx.fillText(gT('pp_c_title'), 30, 45);
      ctx.fillStyle = '#46506E'; ctx.font = '14px sans-serif'; ctx.fillText('Architecture of Grace · Sanctuary', 30, 65);
      ctx.fillStyle = '#0A1E33'; ctx.font = 'bold 16px sans-serif'; ctx.fillText(gT('pp_c_holder'), 30, 120);
      ctx.fillStyle = '#2E6B3A'; ctx.font = '13px sans-serif';
      ctx.fillText(gT('pp_c_line'), 30, 160);
      ctx.fillText(gT('pp_c_date') + new Date().toLocaleDateString(), 30, 190);
      ctx.beginPath(); ctx.arc(330, 170, 30, 0, Math.PI * 2); ctx.fillStyle = '#D9A33B'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('✓', 321, 179);
    },
    downloadPng: function () {
      var canvas = document.getElementById('passport-canvas');
      if (!canvas) return;
      var link = document.createElement('a');
      link.download = 'Grace-Regulation-Passport.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // ========================================================================
  // 7. SWIPE-DOWN MODAL CONTROLLER — bridged to existing toolOpen()
  // ========================================================================
  var GraceModal = {
    activeModalElement: null,
    startY: 0,
    BRIDGE: { 'breathing-orb': 'breathing', 'feet-floor': 'grounding', 'hand-warming': 'movement' },
    launch: function (toolId, isCrisis) {
      var key = this.BRIDGE[toolId] || toolId;
      if (window.TOOLS && Object.prototype.hasOwnProperty.call(window.TOOLS, key) && typeof window.toolOpen === 'function') {
        var ts = document.getElementById('screen-teacher-tools');
        if (typeof showScreen === 'function' && ts && !ts.classList.contains('active')) showScreen('screen-teacher-tools');
        window.toolOpen(key);
        var modal = document.getElementById('toolModal');
        if (modal) { if (isCrisis) modal.classList.add('crisis-priority-override'); else modal.classList.remove('crisis-priority-override'); }
        return;
      }
      this.activeModalElement = document.getElementById('modal-' + toolId) || this.createDynamicModal(toolId);
      this.activeModalElement.classList.add('active-modal-viewport');
      if (isCrisis) this.activeModalElement.classList.add('crisis-priority-override');
      var self = this;
      this.activeModalElement.addEventListener('touchstart', function (e) { self.startY = e.touches[0].clientY; }, { passive: true });
      this.activeModalElement.addEventListener('touchmove', function (e) { self.handleTouchMove(e); }, { passive: true });
      GraceTracker.logToolPractice(toolId);
    },
    close: function () {
      if (!this.activeModalElement) return;
      this.activeModalElement.classList.remove('active-modal-viewport');
      this.activeModalElement = null;
    },
    handleTouchMove: function (e) {
      if (!this.activeModalElement) return;
      if ((e.touches[0].clientY - this.startY) > 120) this.close();
    },
    createDynamicModal: function (toolId) {
      var div = document.createElement('div');
      div.id = 'modal-' + toolId;
      div.className = 'grace-universal-modal-overlay';
      div.innerHTML = '<div class="modal-surface-card"><div class="mobile-swipe-handle"></div>'
        + '<div class="modal-body-viewport">' + gT('dm_placeholder') + ' ' + toolId + '</div>'
        + '<button class="mobile-bottom-close-btn" onclick="GraceModal.close()">' + gT('dm_return') + '</button></div>';
      document.body.appendChild(div);
      return div;
    }
  };

  // ---- Register the richer Feelings Wheel as a first-class tool -----------
  function registerFeelWheel() {
    if (!window.TOOLS) return;
    window.TOOLS.feelwheel = {
      builder: function () {
        return '<div class="tool-modal-icon">🎡</div><div class="tool-modal-title">' + gT('fw_title') + '</div>'
          + '<div class="tool-modal-sub">' + gT('fw_sub') + '</div>'
          + '<div id="grace-feelwheel-mount"></div><div class="feelwheel-readout" id="grace-feelwheel-readout">' + gT('fw_prompt') + '</div>';
      },
      init: function () {
        new GraceEmotionWheel('grace-feelwheel-mount', function (emo) {
          var label = (curLang() === 'es' && emo.es) ? emo.es : emo.name;
          var r = document.getElementById('grace-feelwheel-readout');
          if (r) r.innerHTML = gT('fw_chose_a') + ' <strong style="color:' + emo.color + '">' + label + '</strong>' + gT('fw_chose_b');
          if ('speechSynthesis' in window) { var u = new SpeechSynthesisUtterance(gT('fw_speak') + ' ' + label); u.rate = 0.9; u.pitch = 1.1; u.lang = speechLang(); window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); }
        });
      }
    };
  }

  // ---- Register the new tool card's i18n keys with the app's dictionary ---
  function registerCardI18N() {
    try {
      if (typeof I18N_UI === 'undefined' || !I18N_UI) return;
      I18N_UI.gw_card_t = { en: 'Feelings Wheel', es: 'Rueda de emociones' };
      I18N_UI.gw_card_d = { en: 'Tap a feeling, hear it named', es: 'Toca una emoción y escúchala' };
      I18N_UI.gw_card_btn = { en: 'Spin', es: 'Girar' };
      I18N_UI.gw_triage_lead = { en: 'In a hard moment right now? Start here.', es: '¿Un momento difícil ahora mismo? Empieza aquí.' };
      // Hero CTA + renamed/merged doors (Jun-11 update)
      I18N_UI.hyb_cta_tools = { en: 'Calm & Regulation Tools', es: 'Herramientas de calma y regulación' };
      I18N_UI.ch_tools_t = { en: 'Calm & Regulation Tools', es: 'Herramientas de calma y regulación' };
      I18N_UI.ch_tools_s = { en: 'De-regulation tools, PECS cards, breathing guides — for anyone who needs a calm moment: students, teachers, aides, and families.', es: 'Herramientas de desregulación, tarjetas PECS y guías de respiración — para quien necesite un momento de calma: estudiantes, docentes, asistentes y familias.' };
      I18N_UI.ch_grown_t = { en: 'For grown-ups & teams', es: 'Para adultos y equipos' };
      I18N_UI.ch_grown_s = { en: 'For everyone who holds others — educators, nurses, leaders, parents, caregivers. Take it for yourself or your team. You can’t co-regulate from an empty cup.', es: 'Para quienes sostienen a otros — docentes, enfermeros, líderes, padres y cuidadores. Hazlo para ti o para tu equipo. No puedes corregular con la taza vacía.' };
      I18N_UI.wp_personal_t = { en: 'Just checking in on yourself?', es: '¿Solo quieres revisarte a ti?' };
      I18N_UI.wp_personal_s = { en: 'Take the private adult check-in — just for you, not your team.', es: 'Haz el chequeo personal para adultos — solo para ti, no para tu equipo.' };
      I18N_UI.wp_personal_btn = { en: 'Personal check-in →', es: 'Chequeo personal →' };
      if (typeof applyLang === 'function') applyLang();
    } catch (e) {}
  }

  // ---- Wrap existing toolOpen so EVERY tool open logs practice -----------
  function wrapToolOpen() {
    if (typeof window.toolOpen !== 'function' || window.toolOpen.__graceWrapped) return;
    var original = window.toolOpen;
    window.toolOpen = function (type) { original.apply(this, arguments); try { GraceTracker.logToolPractice(type); } catch (e) {} };
    window.toolOpen.__graceWrapped = true;
  }

  // ---- Re-localize engine-rendered UI when the app switches language ------
  function graceRelocalize() {
    try { GraceCrisisTriage.render(); } catch (e) {}
    try { GraceTracker.surfacePersistentRec(); } catch (e) {}
    try { GraceTracker.updateDashboardCounters(); } catch (e) {}
  }
  function wrapApplyLang() {
    if (typeof window.applyLang !== 'function' || window.applyLang.__graceWrapped) return;
    var original = window.applyLang;
    window.applyLang = function () { var r = original.apply(this, arguments); graceRelocalize(); return r; };
    window.applyLang.__graceWrapped = true;
  }

  // ---- Expose globally ---------------------------------------------------
  window.GraceAudio = GraceAudio;
  window.GraceTracker = GraceTracker;
  window.GracePassport = GracePassport;
  window.GraceModal = GraceModal;
  window.GraceCrisisTriage = GraceCrisisTriage;
  window.GraceEmotionWheel = GraceEmotionWheel;
  window.GraceSentenceStrip = GraceSentenceStrip;
  window.GraceState = GraceState;
  window.graceRelocalize = graceRelocalize;

  // ========================================================================
  // 8. UNIFIED BOOTSTRAP INITIALIZER
  // ========================================================================
  function graceBoot() {
    wrapToolOpen();
    wrapApplyLang();
    registerFeelWheel();
    registerCardI18N();
    GraceTracker.surfacePersistentRec();
    GraceTracker.updateDashboardCounters();
    GraceCrisisTriage.init();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', graceBoot);
  else graceBoot();
  window.addEventListener('load', function () { wrapApplyLang(); registerCardI18N(); GraceCrisisTriage.init(); GraceTracker.surfacePersistentRec(); GraceTracker.updateDashboardCounters(); });
})();
