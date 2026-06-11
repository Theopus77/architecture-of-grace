/**
 * Architecture of Grace — World-Class Regulation Engine
 * Integrated framework for high-fidelity sensory interactions, AAC, and crisis triage.
 * Bridged to the existing toolOpen()/TOOLS system; styled with AoG design tokens.
 */
(function () {
  "use strict";

  function graceToday() { return new Date().toISOString().slice(0, 10); }
  function readJSON(k, fb) { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch (e) { return fb; } }

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
    // original object and would throw on every triage tap. Added a low, grounding
    // hum to mark the start of a crisis intervention.
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
        { name: 'Angry', color: '#f87171', zone: 'START' }, { name: 'Frustrated', color: '#fca5a5', zone: 'START' },
        { name: 'Scared', color: '#fbbf24', zone: 'OPEN' }, { name: 'Anxious', color: '#fde047', zone: 'OPEN' },
        { name: 'Sad', color: '#60a5fa', zone: 'GUIDE' }, { name: 'Lonely', color: '#93c5fd', zone: 'GUIDE' },
        { name: 'Calm', color: '#34d399', zone: 'PEACE' }, { name: 'Happy', color: '#6ee7b7', zone: 'PEACE' },
        { name: 'Tired', color: '#a78bfa', zone: 'REST' }
      ];
      if (this.container) this.render();
    }
    render() {
      var size = 300, center = size / 2, radius = 130, step = (Math.PI * 2) / this.emotions.length;
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
          + '<text x="' + tx + '" y="' + ty + '" transform="rotate(' + ((ta * 180 / Math.PI) + 90) + ', ' + tx + ', ' + ty + ')" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#1e293b">' + emo.name + '</text></g>';
      });
      svg += '<circle cx="' + center + '" cy="' + center + '" r="35" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>';
      svg += '<text x="' + center + '" y="' + center + '" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="700" fill="#64748b">FEEL</text></svg>';
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
      // 1. History (bounded so localStorage cannot grow without limit).
      GraceState.sessionHistory.push({ toolId: toolId, timestamp: Date.now() });
      if (GraceState.sessionHistory.length > 200) GraceState.sessionHistory = GraceState.sessionHistory.slice(-200);
      localStorage.setItem('grace_session_history', JSON.stringify(GraceState.sessionHistory));
      localStorage.setItem('grace_last_used_tool', toolId);

      // 2. Daily counters — FIX: original reset to 0 on every page load, so the
      // "today" count and Passport could never persist. Now keyed to the date.
      var stored = readJSON('grace_today_v1', null);
      if (stored && stored.date !== graceToday()) { GraceState.todayPracticedCount = 0; GraceState.todayDistinctTools = []; }
      GraceState.todayPracticedCount++;
      if (GraceState.todayDistinctTools.indexOf(toolId) === -1) GraceState.todayDistinctTools.push(toolId);
      localStorage.setItem('grace_today_v1', JSON.stringify({ date: graceToday(), count: GraceState.todayPracticedCount, tools: GraceState.todayDistinctTools }));
      this.updateDashboardCounters();

      // 3. Passport: three DISTINCT tools, awarded at most once per day.
      if (GraceState.todayDistinctTools.length >= 3 && localStorage.getItem('grace_passport_date') !== graceToday()) {
        localStorage.setItem('grace_passport_date', graceToday());
        GracePassport.triggerPassportAward();
      }
    },
    updateDashboardCounters: function () {
      var el = document.getElementById('grace-practiced-banner');
      if (el && GraceState.todayPracticedCount > 0) {
        var n = GraceState.todayPracticedCount;
        el.innerHTML = 'Quietly practiced <strong>' + n + ' tool' + (n === 1 ? '' : 's') + '</strong> today ✓';
        el.classList.add('visible-banner');
      }
    },
    surfacePersistentRec: function () {
      var last = localStorage.getItem('grace_last_used_tool');
      var c = document.getElementById('persistent-history-anchor');
      if (!last || !c) return;
      c.innerHTML = '<div class="history-memory-card" role="button" tabindex="0">'
        + '<p><span>✨ Welcome back:</span> Last time you found relief with <strong>' + last.replace(/-/g, ' ') + '</strong>. Start again?</p></div>';
      var card = c.querySelector('.history-memory-card');
      if (card) card.addEventListener('click', function () { GraceModal.launch(last); });
    }
  };

  // ========================================================================
  // 4. CRISIS MANAGEMENT — AIDE "QUICK-PICK" TRIAGE
  // ========================================================================
  var GraceCrisisTriage = {
    init: function () {
      var w = document.getElementById('aide-triage-wrapper');
      if (!w || w.dataset.graceBound) return;
      w.dataset.graceBound = '1';
      w.innerHTML = '<div class="triage-panel">'
        + '<button class="triage-btn cant-calm" data-target="breathing-orb"><span>CAN&#39;T CALM DOWN</span></button>'
        + '<button class="triage-btn shutting-down" data-target="feet-floor"><span>SHUTTING DOWN</span></button>'
        + '<button class="triage-btn needs-move" data-target="hand-warming"><span>NEEDS TO MOVE</span></button></div>';
      w.querySelectorAll('.triage-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          GraceAudio.playHum();
          GraceModal.launch(btn.dataset.target, true); // high-priority override
        });
      });
    }
  };

  // ========================================================================
  // 5. AAC SENTENCE STRIP SPEAKER (reusable; PECS speak is upgraded in place)
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
      u.rate = 0.85; u.pitch = 1.2; // child-appropriate pacing
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
      overlay.innerHTML = '<div class="passport-award-card"><h3>🌟 Regulation Passport Earned!</h3>'
        + '<p>Incredible effort. You safely moved through 3 regulation tools today.</p>'
        + '<canvas id="passport-canvas" width="400" height="250"></canvas>'
        + '<div class="passport-actions"><button id="download-passport-btn">Save Image ↓</button><button id="close-passport-btn">Return</button></div></div>';
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
      // Frame (AoG palette).
      ctx.fillStyle = '#FCF8F0'; ctx.fillRect(0, 0, 400, 250);
      ctx.lineWidth = 6; ctx.strokeStyle = '#F1DFA8'; ctx.strokeRect(3, 3, 394, 244);
      ctx.lineWidth = 1; ctx.strokeStyle = '#D9A33B'; ctx.strokeRect(10, 10, 380, 230);
      // Text.
      ctx.fillStyle = '#0A1E33'; ctx.font = 'bold 20px Georgia, serif'; ctx.fillText('REGULATION PASSPORT', 30, 45);
      ctx.fillStyle = '#46506E'; ctx.font = '14px sans-serif'; ctx.fillText('Architecture of Grace · Sanctuary', 30, 65);
      ctx.fillStyle = '#0A1E33'; ctx.font = 'bold 16px sans-serif'; ctx.fillText('Holder: Verified Self-Regulator', 30, 120);
      ctx.fillStyle = '#2E6B3A'; ctx.font = '13px sans-serif';
      ctx.fillText('✓ Completed 3 tools rooted in grace', 30, 160);
      ctx.fillText('Date: ' + new Date().toLocaleDateString(), 30, 190);
      // Verification badge.
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
    // Crisis quick-pick targets mapped to the real, already-built tools.
    BRIDGE: { 'breathing-orb': 'breathing', 'feet-floor': 'grounding', 'hand-warming': 'movement' },
    launch: function (toolId, isCrisis) {
      var key = this.BRIDGE[toolId] || toolId;
      // Preferred path: open the REAL existing tool. The toolOpen wrapper logs practice.
      if (window.TOOLS && Object.prototype.hasOwnProperty.call(window.TOOLS, key) && typeof window.toolOpen === 'function') {
        var ts = document.getElementById('screen-teacher-tools');
        if (typeof showScreen === 'function' && ts && !ts.classList.contains('active')) showScreen('screen-teacher-tools');
        window.toolOpen(key);
        var modal = document.getElementById('toolModal');
        if (modal) { if (isCrisis) modal.classList.add('crisis-priority-override'); else modal.classList.remove('crisis-priority-override'); }
        return;
      }
      // Fallback: dynamic placeholder modal for tools that are not built yet.
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
      if ((e.touches[0].clientY - this.startY) > 120) this.close(); // swipe-down to dismiss
    },
    createDynamicModal: function (toolId) {
      var div = document.createElement('div');
      div.id = 'modal-' + toolId;
      div.className = 'grace-universal-modal-overlay';
      div.innerHTML = '<div class="modal-surface-card"><div class="mobile-swipe-handle"></div>'
        + '<div class="modal-body-viewport">Container placeholder for ' + toolId + '</div>'
        + '<button class="mobile-bottom-close-btn" onclick="GraceModal.close()">Return to Sanctuary</button></div>';
      document.body.appendChild(div);
      return div;
    }
  };

  // ---- Register the richer Feelings Wheel as a first-class tool -----------
  function registerFeelWheel() {
    if (!window.TOOLS) return;
    window.TOOLS.feelwheel = {
      builder: function () {
        return '<div class="tool-modal-icon">🎡</div><div class="tool-modal-title">Feelings Wheel</div>'
          + '<div class="tool-modal-sub">Tap the feeling closest to right now — it will be named out loud.</div>'
          + '<div id="grace-feelwheel-mount"></div><div class="feelwheel-readout" id="grace-feelwheel-readout">Tap a color to begin.</div>';
      },
      init: function () {
        new GraceEmotionWheel('grace-feelwheel-mount', function (emo) {
          var r = document.getElementById('grace-feelwheel-readout');
          if (r) r.innerHTML = 'You chose <strong style="color:' + emo.color + '">' + emo.name + '</strong>. That makes sense. You are allowed to feel it.';
          if ('speechSynthesis' in window) { var u = new SpeechSynthesisUtterance('You feel ' + emo.name); u.rate = 0.9; u.pitch = 1.1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); }
        });
      }
    };
  }

  // ---- Wrap existing toolOpen so EVERY tool open logs practice -----------
  function wrapToolOpen() {
    if (typeof window.toolOpen !== 'function' || window.toolOpen.__graceWrapped) return;
    var original = window.toolOpen;
    window.toolOpen = function (type) { original.apply(this, arguments); try { GraceTracker.logToolPractice(type); } catch (e) {} };
    window.toolOpen.__graceWrapped = true;
  }

  // ---- Expose globally (bridges + inline handlers need these) ------------
  window.GraceAudio = GraceAudio;
  window.GraceTracker = GraceTracker;
  window.GracePassport = GracePassport;
  window.GraceModal = GraceModal;
  window.GraceCrisisTriage = GraceCrisisTriage;
  window.GraceEmotionWheel = GraceEmotionWheel;
  window.GraceSentenceStrip = GraceSentenceStrip;
  window.GraceState = GraceState;

  // ========================================================================
  // 8. UNIFIED BOOTSTRAP INITIALIZER
  // ========================================================================
  function graceBoot() {
    wrapToolOpen();
    registerFeelWheel();
    GraceTracker.surfacePersistentRec();
    GraceTracker.updateDashboardCounters();
    GraceCrisisTriage.init();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', graceBoot);
  else graceBoot();
  // Re-bind in case screen markup is injected after the engine parses.
  window.addEventListener('load', function () { GraceCrisisTriage.init(); GraceTracker.surfacePersistentRec(); GraceTracker.updateDashboardCounters(); });
})();
