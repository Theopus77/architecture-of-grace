/**
 * Architecture of Grace — Somatic Tools Module
 * Runs AFTER the main app + Grace engine. Extends the existing TOOLS registry,
 * PECS library, and screen routing with interoceptive grounding engines.
 */
(function () {
  "use strict";

  // NOTE: the app declares `let lang` (a global lexical binding, NOT a window
  // property), so we must read the bare global, not window.lang.
  function L() {
    try { if (typeof lang === 'string' && lang) return lang === 'es' ? 'es' : 'en'; } catch (e) {}
    try { if (typeof window.lang === 'string') return window.lang === 'es' ? 'es' : 'en'; } catch (e) {}
    return 'en';
  }
  function T(en, es) { return L() === 'es' ? es : en; }
  function reduceMotion() { try { return !!(window.GraceState && window.GraceState.prefersReducedMotion); } catch (e) { return false; } }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  // Cleanup registry so animations/timers stop when the tool modal closes.
  var _cleanups = [];
  function addCleanup(fn) { _cleanups.push(fn); }
  function runCleanups() { _cleanups.forEach(function (f) { try { f(); } catch (e) {} }); _cleanups = []; }
  if (typeof window.toolClose === 'function' && !window.toolClose.__graceWrapped) {
    var _origClose = window.toolClose;
    window.toolClose = function () { runCleanups(); return _origClose.apply(this, arguments); };
    window.toolClose.__graceWrapped = true;
  }

  // =========================================================================
  // A1. PACED BREATHING — clean SVG pacing circle (box 4·4·4·4 / 4·7·8 vagal)
  // =========================================================================
  var BREATH_PATTERNS = {
    box: { label: { en: 'Box · 4·4·4·4', es: 'Caja · 4·4·4·4' }, phases: [['in', 4], ['hold', 4], ['out', 4], ['hold', 4]] },
    v478: { label: { en: 'Vagal · 4·7·8', es: 'Vagal · 4·7·8' }, phases: [['in', 4], ['hold', 7], ['out', 8]] }
  };
  var PHASE_TXT = {
    in: { en: 'Breathe in', es: 'Inhala' },
    hold: { en: 'Hold', es: 'Sostén' },
    out: { en: 'Breathe out', es: 'Exhala' }
  };
  var _bx = { pat: 'box', rounds: 5 };

  function buildBox() {
    var toggle = Object.keys(BREATH_PATTERNS).map(function (k) {
      return '<button type="button" class="gbx-pat' + (k === _bx.pat ? ' active' : '') + '" data-pat="' + k + '">' + esc(BREATH_PATTERNS[k].label[L()]) + '</button>';
    }).join('');
    return '<div class="tool-modal-icon">🫁</div>' +
      '<div class="tool-modal-title">' + T('Paced Breathing', 'Respiración guiada') + '</div>' +
      '<div class="tool-modal-sub">' + T('Follow the circle. It grows as you breathe in, holds, and softens as you breathe out.', 'Sigue el círculo. Crece al inhalar, se sostiene y se suaviza al exhalar.') + '</div>' +
      '<div class="gbx-pats" role="group" aria-label="' + T('Breathing pattern', 'Patrón de respiración') + '">' + toggle + '</div>' +
      '<div class="gbx-stage">' +
        '<svg class="gbx-svg" viewBox="0 0 240 240" aria-hidden="true">' +
          '<circle class="gbx-track" cx="120" cy="120" r="92"/>' +
          '<g class="gbx-breath" id="gbxBreath"><circle cx="120" cy="120" r="92"/></g>' +
        '</svg>' +
        '<div class="gbx-center"><div class="gbx-cue" id="gbxCue" aria-live="polite">' + T('Get ready…', 'Prepárate…') + '</div><div class="gbx-count" id="gbxCount"></div></div>' +
      '</div>' +
      '<div class="gbx-round" id="gbxRound"></div>';
  }

  function initBox() {
    var stage = document.getElementById('gbxBreath');
    var cueEl = document.getElementById('gbxCue');
    var countEl = document.getElementById('gbxCount');
    var roundEl = document.getElementById('gbxRound');
    if (!stage) return;
    var stopped = false, phaseTimer = null, tickTimer = null, round = 0;
    addCleanup(function () { stopped = true; if (phaseTimer) clearTimeout(phaseTimer); if (tickTimer) clearInterval(tickTimer); });

    document.querySelectorAll('.gbx-pat').forEach(function (b) {
      b.addEventListener('click', function () {
        _bx.pat = b.getAttribute('data-pat');
        document.querySelectorAll('.gbx-pat').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        round = 0; runPhase(0);
      });
    });

    function setScale(type, secs) {
      var scale = type === 'in' ? 1 : (type === 'out' ? 0.45 : null);
      if (scale != null && !reduceMotion()) {
        stage.style.transition = 'transform ' + secs + 's cubic-bezier(.37,0,.63,1)';
        stage.style.transform = 'scale(' + scale + ')';
      }
    }
    function runPhase(idx) {
      if (stopped) return;
      var phases = BREATH_PATTERNS[_bx.pat].phases;
      if (idx >= phases.length) {
        round++;
        if (round >= _bx.rounds) { finish(); return; }
        idx = 0;
      }
      if (roundEl) roundEl.textContent = T('Round ', 'Ronda ') + (round + 1) + T(' of ', ' de ') + _bx.rounds;
      var p = phases[idx], type = p[0], secs = p[1];
      if (cueEl) cueEl.textContent = PHASE_TXT[type][L()];
      setScale(type, secs);
      var left = secs;
      if (countEl) countEl.textContent = left;
      if (tickTimer) clearInterval(tickTimer);
      tickTimer = setInterval(function () { left--; if (countEl) countEl.textContent = left > 0 ? left : ''; if (left <= 0) clearInterval(tickTimer); }, 1000);
      phaseTimer = setTimeout(function () { runPhase(idx + 1); }, secs * 1000);
    }
    function finish() {
      if (tickTimer) clearInterval(tickTimer);
      if (cueEl) cueEl.textContent = T('Nicely done', 'Bien hecho');
      if (countEl) countEl.textContent = '✓';
      if (roundEl) roundEl.innerHTML = '<button type="button" class="btn btn-secondary" id="gbxAgain">' + T('Again', 'Otra vez') + '</button>';
      var again = document.getElementById('gbxAgain');
      if (again) again.addEventListener('click', function () { round = 0; runPhase(0); });
      try { if (window.GraceAudio) GraceAudio.playSuccess(); } catch (e) {}
    }
    // small lead-in
    if (cueEl) cueEl.textContent = T('Get ready…', 'Prepárate…');
    stage.style.transform = 'scale(0.45)';
    phaseTimer = setTimeout(function () { runPhase(0); }, 900);
  }

  // =========================================================================
  // A2. SOMATIC TAP PAD — rhythmic tactile anchor with gentle ripples
  // =========================================================================
  function buildTap() {
    return '<div class="tool-modal-icon">👆</div>' +
      '<div class="tool-modal-title">' + T('Tap Pad', 'Almohadilla táctil') + '</div>' +
      '<div class="tool-modal-sub">' + T('Tap slowly, in time with the glow. Let your finger find a steady, calm rhythm.', 'Toca despacio, al ritmo del brillo. Deja que tu dedo encuentre un ritmo calmado.') + '</div>' +
      '<div class="gtap-pad" id="gtapPad" role="button" tabindex="0" aria-label="' + T('Tap pad', 'Almohadilla táctil') + '">' +
        '<div class="gtap-guide" id="gtapGuide"></div>' +
        '<div class="gtap-hint" id="gtapHint">' + T('Tap here', 'Toca aquí') + '</div>' +
      '</div>' +
      '<div class="gtap-count" id="gtapCount"></div>';
  }

  function initTap() {
    var pad = document.getElementById('gtapPad');
    var hint = document.getElementById('gtapHint');
    var countEl = document.getElementById('gtapCount');
    if (!pad) return;
    var taps = 0, stopped = false;
    addCleanup(function () { stopped = true; });

    function ripple(x, y) {
      if (reduceMotion()) return;
      var r = document.createElement('span');
      r.className = 'gtap-ripple';
      var rect = pad.getBoundingClientRect();
      r.style.left = (x - rect.left) + 'px';
      r.style.top = (y - rect.top) + 'px';
      pad.appendChild(r);
      setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 900);
    }
    function onTap(x, y) {
      if (stopped) return;
      taps++;
      if (hint) hint.style.opacity = '0';
      if (countEl) countEl.textContent = taps + ' ' + (taps === 1 ? T('tap', 'toque') : T('taps', 'toques'));
      ripple(x, y);
      if (!reduceMotion()) { pad.classList.remove('gtap-press'); void pad.offsetWidth; pad.classList.add('gtap-press'); }
      try { if (window.GraceAudio) GraceAudio.playPop(); } catch (e) {}
    }
    pad.addEventListener('pointerdown', function (e) { onTap(e.clientX, e.clientY); }, { passive: true });
    pad.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); var rr = pad.getBoundingClientRect(); onTap(rr.left + rr.width / 2, rr.top + rr.height / 2); } });
  }

  // register the two new tools
  if (window.TOOLS) {
    window.TOOLS.boxbreath = { builder: buildBox, init: initBox };
    window.TOOLS.tappad = { builder: buildTap, init: initTap };
  }

  // =========================================================================
  // B. PECS — sensory tracks + full-screen "Show to Teacher" SOS broadcast
  // =========================================================================
  var CAT_LABELS = {
    'Feelings': { en: 'Feelings', es: 'Emociones' },
    'Sensations': { en: 'Sensations', es: 'Sensaciones' },
    'Sensory Needs': { en: 'Sensory Needs', es: 'Apoyos sensoriales' },
    'Needs': { en: 'Needs', es: 'Necesidades' },
    'Actions': { en: 'Actions', es: 'Acciones' },
    'Places': { en: 'Places', es: 'Lugares' },
    'People': { en: 'People', es: 'Personas' }
  };
  function addSensoryCategories() {
    if (!window.PECS_LIBRARY) return;
    var lib = window.PECS_LIBRARY;
    if (!lib['Sensations']) {
      lib['Sensations'] = [
        { i: '🔊', l: 'Too Loud' }, { i: '💡', l: 'Too Bright' }, { i: '🥵', l: 'Too Hot' }, { i: '🥶', l: 'Too Cold' },
        { i: '🌀', l: 'Dizzy' }, { i: '🤢', l: 'Sick' }, { i: '⚡', l: 'It Hurts' }, { i: '😣', l: 'Itchy' },
        { i: '👃', l: 'Bad Smell' }, { i: '🌫️', l: 'Too Much' }
      ];
    }
    if (!lib['Sensory Needs']) {
      lib['Sensory Needs'] = [
        { i: '🎧', l: 'Headphones' }, { i: '🤫', l: 'Quiet Space' }, { i: '🌑', l: 'Dark / Dim' }, { i: '🫂', l: 'Pressure / Squeeze' },
        { i: '🏃', l: 'Movement' }, { i: '🧸', l: 'Fidget' }, { i: '🚪', l: 'Step Out' }, { i: '🪑', l: 'Sit Down' },
        { i: '💧', l: 'Water' }, { i: '⏳', l: 'More Time' }
      ];
    }
    // Reorder so sensory tracks sit near the front (Feelings, Sensations, Sensory Needs, …)
    var order = ['Feelings', 'Sensations', 'Sensory Needs', 'Needs', 'Actions', 'Places', 'People'];
    var reordered = {};
    order.forEach(function (k) { if (lib[k]) reordered[k] = lib[k]; });
    Object.keys(lib).forEach(function (k) { if (!reordered[k]) reordered[k] = lib[k]; });
    window.PECS_LIBRARY = reordered;
  }

  // Localized category tabs. The app's pecsRenderTabs is called internally (not
  // via window.*), so overriding it doesn't help — instead we relocalize the
  // rendered tab labels in place, keeping each button's onclick key intact.
  function relocalizePecsTabs() {
    var t = document.getElementById('pecsTabs'); if (!t) return;
    t.querySelectorAll('.pecs-tab').forEach(function (b) {
      var m = /pecsSetCategory\('([^']+)'\)/.exec(b.getAttribute('onclick') || '');
      if (m && CAT_LABELS[m[1]]) b.textContent = CAT_LABELS[m[1]][L()];
    });
  }
  function installLocalizedTabs() {
    // Re-localize after a tab click re-renders the (English) tab strip.
    if (typeof window.pecsSetCategory === 'function' && !window.pecsSetCategory.__graceLoc) {
      var _ps = window.pecsSetCategory;
      window.pecsSetCategory = function () { var r = _ps.apply(this, arguments); relocalizePecsTabs(); return r; };
      window.pecsSetCategory.__graceLoc = true;
    }
    // Re-localize when the language toggles (applyLang runs on every setLang).
    if (typeof window.applyLang === 'function' && !window.applyLang.__graceTabsLoc) {
      var _al = window.applyLang;
      window.applyLang = function () { var r = _al.apply(this, arguments); relocalizePecsTabs(); return r; };
      window.applyLang.__graceTabsLoc = true;
    }
  }
  window.__graceRelocalizePecsTabs = relocalizePecsTabs;

  // Full-screen SOS: hold the device up; no speech required.
  window.pecsShowToTeacher = function () {
    var strip = (typeof window.pecsStrip !== 'undefined') ? window.pecsStrip : [];
    var overlay = document.createElement('div');
    overlay.className = 'pecs-sos-overlay';
    var head = '<div class="pecs-sos-head"><span class="pecs-sos-badge">' + T('PLEASE READ', 'POR FAVOR LEE') + '</span><button class="pecs-sos-close" aria-label="' + T('Close', 'Cerrar') + '">✕</button></div>';
    var body;
    if (!strip.length) {
      body = '<div class="pecs-sos-empty">' + T('Add cards first, then hold this up.', 'Agrega tarjetas primero y luego muestra esto.') + '</div>';
    } else {
      body = '<div class="pecs-sos-cards" style="--n:' + strip.length + '">' + strip.map(function (c) {
        return '<div class="pecs-sos-card"><span class="pecs-sos-emoji">' + c.i + '</span><span class="pecs-sos-label">' + esc(c.l) + '</span></div>';
      }).join('') + '</div>';
    }
    overlay.innerHTML = head + body;
    overlay.addEventListener('click', function (e) { if (e.target === overlay || e.target.classList.contains('pecs-sos-close')) overlay.remove(); });
    document.body.appendChild(overlay);
    try { if (window.GraceAudio) GraceAudio.playHum && GraceAudio.playHum(); } catch (e) {}
  };

  // =========================================================================
  // C. ADULT-FIRST — 10-second grounding before the tool grid (once / session)
  // =========================================================================
  var GROUND_KEY = 'grace_adult_grounded';
  window.graceAdultGrounding = function (force) {
    if (!force) { try { if (sessionStorage.getItem(GROUND_KEY)) return; } catch (e) {} }
    try { sessionStorage.setItem(GROUND_KEY, '1'); } catch (e) {}
    var ov = document.createElement('div');
    ov.className = 'grace-ground-overlay';
    ov.innerHTML =
      '<div class="grace-ground-card">' +
        '<div class="gg-eyebrow">' + T('Before you help them', 'Antes de ayudarlos') + '</div>' +
        '<h3 class="gg-title">' + T('Ten seconds for you first.', 'Diez segundos para ti primero.') + '</h3>' +
        '<div class="gg-orb-wrap"><div class="gg-orb" id="ggOrb"></div></div>' +
        '<div class="gg-step" id="ggStep">' + T('Settle your feet. One slow belly breath in…', 'Asienta los pies. Una respiración lenta y profunda…') + '</div>' +
        '<div class="gg-actions"><button class="btn" id="ggReady" style="background:var(--gold);color:var(--navy);">' + T('I\'m ready', 'Estoy listo/a') + '</button><button class="btn btn-secondary" id="ggSkip">' + T('Skip', 'Omitir') + '</button></div>' +
        '<div class="gg-why">' + T('Your calm is the intervention — children borrow our nervous systems before our words.', 'Tu calma es la intervención — los niños toman prestado nuestro sistema nervioso antes que nuestras palabras.') + '</div>' +
      '</div>';
    document.body.appendChild(ov);
    var steps = [
      T('Settle your feet. One slow belly breath in…', 'Asienta los pies. Una respiración lenta y profunda…'),
      T('Soften your shoulders. Let them drop.', 'Suaviza los hombros. Déjalos caer.'),
      T('Unclench your jaw. Slow breath out…', 'Relaja la mandíbula. Exhala despacio…'),
      T('You\'re steady. Now you can steady them.', 'Estás firme. Ahora puedes darles calma.')
    ];
    var stepEl = ov.querySelector('#ggStep');
    var i = 0, iv = setInterval(function () { i++; if (i < steps.length && stepEl) stepEl.textContent = steps[i]; if (i >= steps.length - 1) clearInterval(iv); }, 2600);
    function close() { clearInterval(iv); ov.remove(); }
    ov.querySelector('#ggReady').addEventListener('click', close);
    ov.querySelector('#ggSkip').addEventListener('click', close);
  };

  // Hook screen routing: when the tools page opens, gate it once per session.
  function installToolsGate() {
    if (typeof window.showScreen !== 'function' || window.showScreen.__graceGated) return;
    var orig = window.showScreen;
    window.showScreen = function (id) {
      var r = orig.apply(this, arguments);
      if (id === 'screen-teacher-tools') { try { window.graceAdultGrounding(false); } catch (e) {} }
      if (id === 'screen-pecs') { setTimeout(relocalizePecsTabs, 160); }
      return r;
    };
    window.showScreen.__graceGated = true;
  }

  // =========================================================================
  // i18n for new static labels (tool cards + SOS button) + boot
  // =========================================================================
  function registerI18N() {
    try {
      if (typeof I18N_UI === 'undefined' || !I18N_UI) return;
      I18N_UI.gt_box_t = { en: 'Paced Breathing', es: 'Respiración guiada' };
      I18N_UI.gt_box_d = { en: 'Box 4·4·4·4 or 4·7·8 vagal', es: 'Caja 4·4·4·4 o 4·7·8 vagal' };
      I18N_UI.gt_box_b = { en: 'Start', es: 'Comenzar' };
      I18N_UI.gt_tap_t = { en: 'Tap Pad', es: 'Almohadilla táctil' };
      I18N_UI.gt_tap_d = { en: 'Tap a rhythm to steady your heart', es: 'Toca un ritmo para calmar el corazón' };
      I18N_UI.gt_tap_b = { en: 'Open', es: 'Abrir' };
      I18N_UI.pecs_sos_btn = { en: '🙋 Show to Teacher', es: '🙋 Mostrar al maestro' };
      I18N_UI.gt_ground_btn = { en: 'Reset myself (10s)', es: 'Centrarme (10s)' };
      if (typeof applyLang === 'function') applyLang();
    } catch (e) {}
  }

  function boot() {
    addSensoryCategories();
    installLocalizedTabs();
    installToolsGate();
    registerI18N();
    // refresh PECS if the screen is already mounted
    try { if (typeof pecsRenderTabs === 'function' && document.getElementById('pecsTabs')) { pecsRenderTabs(); pecsRenderLibrary(); } } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', function () { addSensoryCategories(); installLocalizedTabs(); installToolsGate(); registerI18N(); });
})();
