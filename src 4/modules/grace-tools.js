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
    v478: { label: { en: 'Vagal · 4·7·8', es: 'Vagal · 4·7·8' }, phases: [['in', 4], ['hold', 7], ['out', 8]] },
    calm: { label: { en: 'Calm · 4·2·6·2', es: 'Calma · 4·2·6·2' }, phases: [['in', 4], ['hold', 2], ['out', 6], ['hold', 2]] },
    focus: { label: { en: 'Balanced · 5·5', es: 'Equilibrio · 5·5' }, phases: [['in', 5], ['out', 5]] }
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

  // =========================================================================
  // A3. TAKE 5 — trace-your-hand breathing (breathe in up a finger, out down)
  // =========================================================================
  // Each finger: [baseX, baseY, tipX, tipY] in a 200x230 viewBox.
  var T5_FINGERS = [
    [60, 168, 34, 120],   // thumb
    [80, 150, 76, 52],    // index
    [102, 148, 102, 40],  // middle
    [124, 150, 128, 54],  // ring
    [145, 156, 156, 92]   // pinky
  ];
  function buildTake5() {
    var fingers = T5_FINGERS.map(function (f) {
      return '<line x1="' + f[0] + '" y1="' + f[1] + '" x2="' + f[2] + '" y2="' + f[3] + '" class="t5-finger" stroke-linecap="round"/>';
    }).join('');
    return '<div class="tool-modal-icon">🖐️</div>' +
      '<div class="tool-modal-title">' + T('Take 5', 'Toma 5') + '</div>' +
      '<div class="tool-modal-sub">' + T('Trace your hand. Breathe in as you slide up a finger, out as you slide down the other side.', 'Traza tu mano. Inhala al subir por un dedo y exhala al bajar por el otro lado.') + '</div>' +
      '<div class="t5-stage">' +
        '<svg class="t5-svg" viewBox="0 0 200 230" aria-hidden="true">' +
          '<path class="t5-palm" d="M58 168 Q50 210 88 214 L120 214 Q156 210 148 168 Z"/>' +
          fingers +
          '<circle class="t5-tracer" id="t5Tracer" cx="102" cy="148" r="9"/>' +
        '</svg>' +
        '<div class="t5-cue" id="t5Cue" aria-live="polite">' + T('Get ready…', 'Prepárate…') + '</div>' +
      '</div>' +
      '<div class="gbx-round" id="t5Count"></div>';
  }
  function initTake5() {
    var tracer = document.getElementById('t5Tracer');
    var cueEl = document.getElementById('t5Cue');
    var countEl = document.getElementById('t5Count');
    if (!tracer) return;
    var IN = 4, OUT = 4, stopped = false, raf = null, t = null;
    addCleanup(function () { stopped = true; if (raf) cancelAnimationFrame(raf); if (t) clearTimeout(t); });
    function moveTo(x, y) { tracer.setAttribute('cx', x); tracer.setAttribute('cy', y); }
    function phase(fi, going) { // going: 'up' (in) or 'down' (out)
      if (stopped) return;
      if (fi >= T5_FINGERS.length) { finish(); return; }
      var f = T5_FINGERS[fi];
      var from = going === 'up' ? [f[0], f[1]] : [f[2], f[3]];
      var to = going === 'up' ? [f[2], f[3]] : [f[0], f[1]];
      if (cueEl) cueEl.textContent = going === 'up' ? PHASE_TXT.in[L()] : PHASE_TXT.out[L()];
      if (countEl) countEl.textContent = T('Finger ', 'Dedo ') + (fi + 1) + T(' of 5', ' de 5');
      var dur = (going === 'up' ? IN : OUT) * 1000;
      if (reduceMotion()) { moveTo(to[0], to[1]); t = setTimeout(function () { nxt(fi, going); }, dur); return; }
      var start = performance.now();
      (function step(now) {
        if (stopped) return;
        var p = Math.min(1, (now - start) / dur);
        moveTo(from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p);
        if (p < 1) { raf = requestAnimationFrame(step); } else { nxt(fi, going); }
      })(start);
    }
    function nxt(fi, going) {
      if (going === 'up') phase(fi, 'down');
      else phase(fi + 1, 'up');
    }
    function finish() {
      if (cueEl) cueEl.textContent = T('Nicely done', 'Bien hecho');
      if (countEl) countEl.innerHTML = '<button type="button" class="btn btn-secondary" id="t5Again">' + T('Again', 'Otra vez') + '</button>';
      var again = document.getElementById('t5Again');
      if (again) again.addEventListener('click', function () { phase(0, 'up'); });
      try { if (window.GraceAudio && window.GraceAudio.playSuccess) window.GraceAudio.playSuccess(); } catch (e) {}
    }
    moveTo(T5_FINGERS[0][0], T5_FINGERS[0][1]);
    t = setTimeout(function () { phase(0, 'up'); }, 900);
  }

  // =========================================================================
  // A4. BODY CHECK — "How does your body feel?" routes to the right real tool
  // =========================================================================
  // Four skies (blue/green/yellow/red — the familiar color framework, in the AoG
  // "weather" voice), each routing to real tools already on the page.
  var ZONES = [
    { key: 'blue', color: '#3b82f6',
      sky: { en: 'Low & slow', es: 'Bajo y lento' },
      feel: { en: 'sad · tired · bored · sick · lonely', es: 'triste · cansado · aburrido · enfermo · solo' },
      d: { en: 'Running low or heavy — let’s gently lift and reconnect.', es: 'Con poca energía o pesado — vamos a animarnos y reconectar con calma.' },
      tools: [['movement', { en: 'Movement Break', es: 'Pausa de movimiento' }], ['soundscape', { en: 'Soundscapes', es: 'Paisajes sonoros' }], ['coreg', { en: 'Co-Regulation', es: 'Corregulación' }]] },
    { key: 'green', color: '#22c55e',
      sky: { en: 'Calm & ready', es: 'Tranquilo y listo' },
      feel: { en: 'calm · happy · focused · proud', es: 'tranquilo · feliz · concentrado · orgulloso' },
      d: { en: 'You’re steady — a good place to be. Savor it, or keep it going.', es: 'Estás equilibrado — un buen lugar. Disfrútalo o mantenlo.' },
      tools: [['feelwheel', { en: 'Feelings Wheel', es: 'Rueda de emociones' }], ['calmjar', { en: 'Calm Down Jar', es: 'Frasco de la calma' }], ['safeplace', { en: 'Safe Place', es: 'Lugar seguro' }]] },
    { key: 'yellow', color: '#eab308',
      sky: { en: 'Bright & buzzy', es: 'Brillante e inquieto' },
      feel: { en: 'worried · frustrated · silly · excited · wiggly', es: 'preocupado · frustrado · juguetón · emocionado · inquieto' },
      d: { en: 'Revved up — let’s slow the engine and find focus.', es: 'Acelerado — bajemos las revoluciones y encontremos enfoque.' },
      tools: [['boxbreath', { en: 'Paced Breathing', es: 'Respiración guiada' }], ['grounding', { en: '5-4-3-2-1 Grounding', es: 'Anclaje 5-4-3-2-1' }], ['take5', { en: 'Take 5', es: 'Toma 5' }]] },
    { key: 'red', color: '#ef4444',
      sky: { en: 'Stormy', es: 'Tormenta' },
      feel: { en: 'angry · panicked · overwhelmed · out of control', es: 'enojado · en pánico · sobrepasado · sin control' },
      d: { en: 'Big storm. Strong, steadying tools first — and you don’t have to do it alone.', es: 'Gran tormenta. Primero herramientas fuertes y calmantes — y no tienes que hacerlo solo/a.' },
      tools: [['breathing', { en: '4-7-8 Breathing', es: 'Respiración 4-7-8' }], ['coldwater', { en: 'Cold Water Reset', es: 'Reinicio con agua fría' }], ['coreg', { en: 'Co-Regulation', es: 'Corregulación' }]] }
  ];
  function buildBody() {
    var zones = ZONES.map(function (z, i) {
      return '<button type="button" class="zc-zone" data-i="' + i + '" style="--zc:' + z.color + '">' +
        '<span class="zc-dot" style="background:' + z.color + '"></span>' +
        '<span class="zc-sky">' + esc(z.sky[L()]) + '</span></button>';
    }).join('');
    return '<div class="tool-modal-icon">⛅</div>' +
      '<div class="tool-modal-title">' + T('How’s your weather?', '¿Cómo está tu clima?') + '</div>' +
      '<div class="tool-modal-sub">' + T('Pick the sky that fits right now — we’ll point you to something that helps.', 'Elige el cielo que encaje ahora — te mostraremos algo que ayuda.') + '</div>' +
      '<div class="zc-zones">' + zones + '</div>' +
      '<div class="bc-result" id="bcResult"></div>';
  }
  function initBody() {
    var res = document.getElementById('bcResult');
    document.querySelectorAll('.zc-zone').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.zc-zone').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var z = ZONES[+btn.getAttribute('data-i')];
        try { if (window.GraceAudio && window.GraceAudio.playPop) window.GraceAudio.playPop(); } catch (e) {}
        var btns = z.tools.map(function (tp) {
          return '<button type="button" class="bc-tool" onclick="toolOpen(\'' + tp[0] + '\')">' + esc(tp[1][L()]) + ' →</button>';
        }).join('');
        if (res) res.innerHTML = '<div class="bc-card" style="border-left-color:' + z.color + '">' +
          '<div class="zc-feel" style="color:' + z.color + '">' + esc(z.feel[L()]) + '</div>' +
          '<p class="bc-card-d">' + esc(z.d[L()]) + '</p>' +
          '<div class="bc-card-h">' + T('Try one of these', 'Prueba una de estas') + '</div>' +
          '<div class="bc-tools">' + btns + '</div></div>';
      });
    });
  }

  // =========================================================================
  // ICON SET — custom monochrome line icons that replace the tool-card emoji.
  // Keyed by tool. Each value is the inner markup of a 24x24 stroke SVG.
  // =========================================================================
  var ICONS = {
    breathing: '<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M2 12h15a3 3 0 1 1-3 3"/><path d="M3 16h9a2.5 2.5 0 1 1-2.5 2.5"/>',
    boxbreath: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="3"/>',
    take5: '<path d="M7 12V7a1.5 1.5 0 0 1 3 0v4"/><path d="M10 11V5a1.5 1.5 0 0 1 3 0v6"/><path d="M13 11V6.5a1.5 1.5 0 0 1 3 0V12"/><path d="M16 12.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-2a5 5 0 0 1-4.2-2.3L6 16.5a1.5 1.5 0 0 1 2.5-1.6L9 15"/>',
    grounding: '<circle cx="12" cy="5" r="2"/><path d="M12 7v13"/><path d="M5 12a7 7 0 0 0 14 0"/><path d="M3 12h2M19 12h2"/>',
    rainbow: '<path d="M4 17a8 8 0 0 1 16 0"/><path d="M7 17a5 5 0 0 1 10 0"/><path d="M10 17a2 2 0 0 1 4 0"/>',
    movement: '<path d="M22 12h-4l-3 8L9 4l-3 8H2"/>',
    tappad: '<circle cx="12" cy="12" r="2"/><path d="M7.8 12a4.2 4.2 0 0 1 8.4 0"/><path d="M4.5 12a7.5 7.5 0 0 1 15 0"/>',
    safeplace: '<path d="M3 11l9-8 9 8"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>',
    pmr: '<path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 12h8"/>',
    bilateral: '<path d="M12 6v12"/><path d="M12 8C9 3.5 3.5 4.5 3.5 9c0 3.8 4.8 4.8 8.5 3"/><path d="M12 8c3-4.5 8.5-3.5 8.5 1 0 3.8-4.8 4.8-8.5 3"/>',
    animalyoga: '<circle cx="6.5" cy="11" r="1.6"/><circle cx="10" cy="7" r="1.6"/><circle cx="14" cy="7" r="1.6"/><circle cx="17.5" cy="11" r="1.6"/><path d="M8.5 16.5c0-2.2 1.6-3.5 3.5-3.5s3.5 1.3 3.5 3.5S14 20.5 12 20.5s-3.5-1.8-3.5-4z"/>',
    emotion: '<circle cx="12" cy="12" r="9"/><path d="M12 12V3"/><path d="M12 12l7.8 4.5"/><path d="M12 12l-7.8 4.5"/>',
    feelwheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    coldwater: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
    calmjar: '<path d="M8 3h8"/><path d="M9 3v3L7 9v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9l-2-3V3"/><path d="M7.5 13h9"/>',
    coreg: '<path d="M19 13.5c1.6-1.6 3-3.6 3-6A4 4 0 0 0 15 5l-3 2.5L9 5a4 4 0 0 0-7 2.5c0 2.4 1.4 4.4 3 6l7 6.5z"/>',
    soundscape: '<path d="M4 9v6M8 6v12M12 3v18M16 7v10M20 10v4"/>',
    safeplace2: '',
    pecs: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15.5l-4.5-4.5L6 21.5"/>',
    bodycheck: '<circle cx="8" cy="8" r="3"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M4.3 4.3l1 1M11.7 4.3l-1 1"/><path d="M17.5 13a3.5 3.5 0 0 1 0 7H9a4 4 0 0 1-1-7.87"/>'
  };
  function upgradeToolIcons() {
    var grid = document.querySelector('#screen-teacher-tools .tools-grid');
    if (!grid) return;
    grid.querySelectorAll('.tool-card').forEach(function (card) {
      // BUGFIX: the app's original InteractiveCard binds a button click handler
      // that runs a fake "Practiced ✓" animation + stopPropagation but never
      // opens the tool — so Start/Open/Guide buttons did nothing (only the card
      // body worked). Replace the button with a clean clone (drops all those
      // interfering listeners) and wire it straight to the card's action.
      var btn = card.querySelector('.btn');
      if (btn && !btn.dataset.graceWired) {
        var clean = btn.cloneNode(true);
        clean.dataset.graceWired = '1';
        clean.addEventListener('click', function (ev) {
          ev.stopPropagation();
          try { if (typeof card.onclick === 'function') card.onclick.call(card); } catch (e) {}
        });
        if (btn.parentNode) btn.parentNode.replaceChild(clean, btn);
      }
      // Custom monochrome icon swap.
      var oc = card.getAttribute('onclick') || '';
      var m = oc.match(/toolOpen\('([^']+)'\)/);
      var key = m ? m[1] : (/screen-pecs/.test(oc) ? 'pecs' : null);
      if (!key || !ICONS[key]) return;
      var ic = card.querySelector('.tool-icon');
      if (!ic || ic.dataset.iconUpgraded) return;
      ic.dataset.iconUpgraded = '1';
      ic.classList.add('tool-icon-svg');
      ic.removeAttribute('style'); // drop inline emoji font-size
      ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[key] + '</svg>';
    });
  }
  window.__graceUpgradeIcons = upgradeToolIcons;

  // register the new tools
  if (window.TOOLS) {
    window.TOOLS.take5 = { builder: buildTake5, init: initTake5 };
    window.TOOLS.bodycheck = { builder: buildBody, init: initBody };
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

  // Full Spanish deck. Keyed by "Category|EnglishLabel" (category names are
  // stable strings we control, which avoids fragile emoji-key matching and the
  // label collisions, e.g. Sick = Enfermo in Feelings but Con náuseas in Sensations).
  var CARD_ES = {
    'Feelings|Happy': 'Feliz', 'Feelings|Sad': 'Triste', 'Feelings|Angry': 'Enojado', 'Feelings|Scared': 'Asustado', 'Feelings|Confused': 'Confundido', 'Feelings|Hurt': 'Lastimado', 'Feelings|Tired': 'Cansado', 'Feelings|Sick': 'Enfermo', 'Feelings|Excited': 'Emocionado', 'Feelings|Calm': 'Tranquilo',
    'Sensations|Too Loud': 'Muy fuerte', 'Sensations|Too Bright': 'Muy brillante', 'Sensations|Too Hot': 'Mucho calor', 'Sensations|Too Cold': 'Mucho frío', 'Sensations|Dizzy': 'Mareado', 'Sensations|Sick': 'Con náuseas', 'Sensations|It Hurts': 'Me duele', 'Sensations|Itchy': 'Con comezón', 'Sensations|Bad Smell': 'Mal olor', 'Sensations|Too Much': 'Demasiado',
    'Sensory Needs|Headphones': 'Audífonos', 'Sensory Needs|Quiet Space': 'Lugar tranquilo', 'Sensory Needs|Dark / Dim': 'Oscuro / tenue', 'Sensory Needs|Pressure / Squeeze': 'Presión / apretón', 'Sensory Needs|Movement': 'Movimiento', 'Sensory Needs|Fidget': 'Juguete', 'Sensory Needs|Step Out': 'Salir', 'Sensory Needs|Sit Down': 'Sentarse', 'Sensory Needs|Water': 'Agua', 'Sensory Needs|More Time': 'Más tiempo',
    'Needs|Bathroom': 'Baño', 'Needs|Water': 'Agua', 'Needs|Food': 'Comida', 'Needs|Break': 'Descanso', 'Needs|Help': 'Ayuda', 'Needs|Quiet': 'Silencio', 'Needs|Read': 'Leer', 'Needs|Work': 'Trabajo', 'Needs|Play': 'Jugar', 'Needs|Rest': 'Descansar',
    'Actions|Yes': 'Sí', 'Actions|No': 'No', 'Actions|Stop': 'Parar', 'Actions|Go': 'Ir', 'Actions|Talk': 'Hablar', 'Actions|More': 'Más', 'Actions|Done': 'Terminé', 'Actions|Again': 'Otra vez', 'Actions|That': 'Eso', 'Actions|Together': 'Juntos',
    'Places|Class': 'Clase', 'Places|Bathroom': 'Baño', 'Places|Gym': 'Gimnasio', 'Places|Lunch': 'Almuerzo', 'Places|Library': 'Biblioteca', 'Places|Home': 'Casa', 'Places|Outside': 'Afuera', 'Places|Office': 'Oficina', 'Places|Nurse': 'Enfermería', 'Places|Bus': 'Autobús',
    'People|Teacher': 'Maestro', 'People|Friend': 'Amigo', 'People|Family': 'Familia', 'People|Nurse': 'Enfermero', 'People|Helper': 'Ayudante', 'People|Aide': 'Asistente'
  };
  function cardLabel(c) { return (L() === 'es' && c && c.es) ? c.es : (c ? c.l : ''); }
  function augmentPecsEs() {
    if (!window.PECS_LIBRARY) return;
    Object.keys(window.PECS_LIBRARY).forEach(function (cat) {
      window.PECS_LIBRARY[cat].forEach(function (c) { c.es = CARD_ES[cat + '|' + c.l] || c.l; });
    });
  }
  // Language-aware re-renders that fully replace the app's English PECS output.
  function gPecsRenderTabs() {
    var t = document.getElementById('pecsTabs'); if (!t || !window.PECS_LIBRARY) return;
    var active = window.pecsActiveCategory || Object.keys(window.PECS_LIBRARY)[0];
    t.innerHTML = Object.keys(window.PECS_LIBRARY).map(function (cat) {
      var lbl = CAT_LABELS[cat] ? CAT_LABELS[cat][L()] : cat;
      return '<button class="pecs-tab' + (cat === active ? ' active' : '') + '" onclick="pecsSetCategory(\'' + cat + '\')">' + esc(lbl) + '</button>';
    }).join('');
  }
  function gPecsRenderLibrary() {
    var lib = document.getElementById('pecsLibrary'); if (!lib || !window.PECS_LIBRARY) return;
    var cat = window.pecsActiveCategory || Object.keys(window.PECS_LIBRARY)[0];
    var cards = window.PECS_LIBRARY[cat] || [];
    lib.innerHTML = cards.map(function (c, idx) {
      var lbl = cardLabel(c);
      return '<button class="pecs-card" onclick="gPecsAdd(\'' + cat + '\',' + idx + ')" aria-label="' + esc(lbl) + '"><span class="pecs-card-icon">' + c.i + '</span><span class="pecs-card-label">' + esc(lbl) + '</span></button>';
    }).join('');
  }
  function gPecsRenderStrip() {
    var s = document.getElementById('pecsStrip'); if (!s) return;
    var strip = window.pecsStrip || [];
    if (!strip.length) { s.innerHTML = '<span class="pecs-empty-strip">' + T('Tap cards below to build a message ↓', 'Toca las tarjetas para crear un mensaje ↓') + '</span>'; return; }
    s.innerHTML = strip.map(function (c, i) {
      var lbl = cardLabel(c);
      return '<div class="pecs-strip-card"><button class="remove-btn" onclick="gPecsRemove(' + i + ')" aria-label="' + T('Remove', 'Quitar') + ' ' + esc(lbl) + '">✕</button><span class="pecs-card-icon" style="font-size:28px">' + c.i + '</span><span class="pecs-card-label">' + esc(lbl) + '</span></div>';
    }).join('');
  }
  function gPecsRenderAll() { augmentPecsEs(); gPecsRenderTabs(); gPecsRenderLibrary(); gPecsRenderStrip(); }

  window.gPecsAdd = function (cat, idx) {
    var c = window.PECS_LIBRARY && window.PECS_LIBRARY[cat] && window.PECS_LIBRARY[cat][idx];
    if (!c) return;
    window.pecsStrip = window.pecsStrip || [];
    window.pecsStrip.push({ i: c.i, l: c.l, es: c.es });
    try { if (window.GraceAudio) GraceAudio.playPop(); } catch (e) {}
    gPecsRenderStrip();
  };
  window.gPecsRemove = function (i) { (window.pecsStrip || []).splice(i, 1); gPecsRenderStrip(); };

  function installLocalizedTabs() {
    window.pecsSetCategory = function (cat) { window.pecsActiveCategory = cat; gPecsRenderTabs(); gPecsRenderLibrary(); };
    window.pecsAddToStrip = function (icon, label) {
      var es = label;
      if (window.PECS_LIBRARY) {
        Object.keys(window.PECS_LIBRARY).some(function (cat) {
          var f = window.PECS_LIBRARY[cat].filter(function (x) { return x.i === icon && x.l === label; })[0];
          if (f) { es = f.es || label; return true; } return false;
        });
      }
      window.pecsStrip = window.pecsStrip || [];
      window.pecsStrip.push({ i: icon, l: label, es: es });
      gPecsRenderStrip();
    };
    window.pecsRemove = function (i) { (window.pecsStrip || []).splice(i, 1); gPecsRenderStrip(); };
    window.pecsClearStrip = function () { window.pecsStrip = []; gPecsRenderStrip(); };
    window.pecsSpeakStrip = function () {
      var strip = window.pecsStrip || [];
      if (!strip.length || !('speechSynthesis' in window)) return;
      var cards = document.querySelectorAll('#pecsStrip .pecs-strip-card');
      var u = new SpeechSynthesisUtterance(strip.map(function (c) { return cardLabel(c); }).join('. '));
      u.rate = 0.85; u.pitch = 1.1; u.lang = (L() === 'es' ? 'es-ES' : 'en-US');
      var wi = 0;
      u.onboundary = function (ev) { if (ev.name && ev.name !== 'word') return; cards.forEach(function (c) { c.classList.remove('speaking-highlight'); }); if (cards[wi]) cards[wi].classList.add('speaking-highlight'); wi++; };
      u.onend = function () { cards.forEach(function (c) { c.classList.remove('speaking-highlight'); }); try { if (window.GraceAudio) GraceAudio.playSuccess(); } catch (e) {} };
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    };
    window.pecsPrintStrip = function () {
      var strip = window.pecsStrip || [];
      if (!strip.length) { alert(T('Add cards to the strip first.', 'Agrega tarjetas primero.')); return; }
      var win = window.open(''); if (!win) return;
      var cards = strip.map(function (c) {
        return '<div style="display:inline-flex;flex-direction:column;align-items:center;border:2px solid #D9A33B;border-radius:8px;padding:10px 8px;margin:6px;min-width:70px;font-family:sans-serif;"><span style="font-size:32px">' + c.i + '</span><span style="font-size:11px;font-weight:600;margin-top:4px;">' + esc(cardLabel(c)) + '</span></div>';
      }).join('');
      win.document.write('<html><body style="font-family:sans-serif;padding:20px;"><h2 style="color:#0A1E33">' + T('My Message', 'Mi mensaje') + '</h2><div style="display:flex;flex-wrap:wrap;">' + cards + '</div></body></html>');
    };
    // Re-render the localized PECS whenever the language toggles.
    if (typeof window.applyLang === 'function' && !window.applyLang.__gracePecsEs) {
      var _al = window.applyLang;
      window.applyLang = function () { var r = _al.apply(this, arguments); if (document.getElementById('pecsTabs')) gPecsRenderAll(); try { if (window.__aogFlowRefresh) window.__aogFlowRefresh(); } catch (e) {} return r; };
      window.applyLang.__gracePecsEs = true;
    }
  }
  window.__gracePecsRenderAll = gPecsRenderAll;

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
        return '<div class="pecs-sos-card"><span class="pecs-sos-emoji">' + c.i + '</span><span class="pecs-sos-label">' + esc(cardLabel(c)) + '</span></div>';
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
      if (id === 'screen-teacher-tools') { try { window.graceAdultGrounding(false); } catch (e) {} setTimeout(upgradeToolIcons, 50); }
      if (id === 'screen-pecs') { setTimeout(gPecsRenderAll, 160); }
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
      I18N_UI.gt_box_d = { en: 'Box, vagal, calming & balanced patterns', es: 'Patrones: caja, vagal, calma y equilibrio' };
      I18N_UI.gt_box_b = { en: 'Start', es: 'Comenzar' };
      I18N_UI.gt_tap_t = { en: 'Tap Pad', es: 'Almohadilla táctil' };
      I18N_UI.gt_tap_d = { en: 'Tap a rhythm to steady your heart', es: 'Toca un ritmo para calmar el corazón' };
      I18N_UI.gt_tap_b = { en: 'Open', es: 'Abrir' };
      I18N_UI.gt_t5_t = { en: 'Take 5', es: 'Toma 5' };
      I18N_UI.gt_t5_d = { en: 'Trace your hand, breath by breath', es: 'Traza tu mano, respiración a respiración' };
      I18N_UI.gt_t5_b = { en: 'Start', es: 'Comenzar' };
      I18N_UI.gt_body_t = { en: 'How’s your weather?', es: '¿Cómo está tu clima?' };
      I18N_UI.gt_body_d = { en: 'Find your sky — blue, green, yellow or red — then a tool that fits', es: 'Encuentra tu cielo — azul, verde, amarillo o rojo — y una herramienta que ayude' };
      I18N_UI.gt_body_b = { en: 'Check in', es: 'Empezar' };
      I18N_UI.p2g_replay = { en: '↻ Watch it again', es: '↻ Verlo otra vez' };
      I18N_UI.pecs_sos_btn = { en: '🙋 Show to Teacher', es: '🙋 Mostrar al maestro' };
      I18N_UI.gt_ground_btn = { en: 'Reset myself (10s)', es: 'Centrarme (10s)' };
      I18N_UI.pecs_eyebrow = { en: 'Communication Support', es: 'Apoyo a la comunicación' };
      I18N_UI.pecs_h1 = { en: 'PECS Cards', es: 'Tarjetas PECS' };
      I18N_UI.pecs_lede = { en: 'Tap a card to add it to your sequence. Build your message, then share it.', es: 'Toca una tarjeta para agregarla a tu secuencia. Crea tu mensaje y compártelo.' };
      I18N_UI.pecs_clear = { en: '🗑️ Clear', es: '🗑️ Borrar' };
      I18N_UI.pecs_print = { en: '🖨️ Print Strip', es: '🖨️ Imprimir' };
      I18N_UI.pecs_speak = { en: '🔊 Speak', es: '🔊 Hablar' };
      I18N_UI.aog_lib_nav = { en: 'Library', es: 'Biblioteca' };
      I18N_UI.aog_tools_nav = { en: 'Tools', es: 'Herramientas' };
      // Educator "Inside a lesson" sample package
      I18N_UI.edu_s_ey = { en: 'See it first · Free', es: 'Míralo primero · Gratis' };
      I18N_UI.edu_s_h = { en: 'Inside a lesson', es: 'Por dentro de una lección' };
      I18N_UI.edu_s_lead = { en: 'Every lesson ships as a small package — anchor charts, scenario cards, worksheets, and drawing activities. Open any sampler below; no code, no sign-up.', es: 'Cada lección viene como un pequeño paquete — carteles de anclaje, tarjetas de escenario, hojas de trabajo y actividades de dibujo. Abre cualquier muestra abajo; sin código, sin registro.' };
      I18N_UI.edu_s_anchor_t = { en: 'Anchor Charts', es: 'Carteles de anclaje' };
      I18N_UI.edu_s_anchor_s = { en: 'The visual that anchors the lesson', es: 'El visual que ancla la lección' };
      I18N_UI.edu_s_scenario_t = { en: 'Scenario Cards', es: 'Tarjetas de escenario' };
      I18N_UI.edu_s_scenario_s = { en: 'Real moments to talk through', es: 'Momentos reales para conversar' };
      I18N_UI.edu_s_worksheet_t = { en: 'Worksheets', es: 'Hojas de trabajo' };
      I18N_UI.edu_s_worksheet_s = { en: 'Reflect, practice, apply', es: 'Reflexionar, practicar, aplicar' };
      I18N_UI.edu_s_drawing_t = { en: 'Drawing Activities', es: 'Actividades de dibujo' };
      I18N_UI.edu_s_drawing_s = { en: 'Make the idea their own', es: 'Hacer la idea suya' };
      I18N_UI.edu_s_open = { en: 'Open PDF ↗', es: 'Abrir PDF ↗' };
      I18N_UI.edu_s_cta = { en: 'Open a full free sample lesson · PDF →', es: 'Abre una lección de muestra gratis · PDF →' };
      if (typeof applyLang === 'function') applyLang();
    } catch (e) {}
  }

  // =========================================================================
  // "How one answer becomes growth" — PICK an answer, watch its real journey
  // travel the framework. Every journey is drawn from the real curriculum:
  // the actual check-in items + the resource-index→book mapping in the app.
  //   stages = [check-in, result, resource index, lesson & story, practice, growth]
  // =========================================================================
  // Grade bands → the real book for that band (from the app's aogBandBook map).
  var BANDS = [
    { label: 'K–2', book: { en: 'Book 1 · The Year We Met Sammy', es: 'Libro 1 · The Year We Met Sammy' } },
    { label: '3–5', book: { en: 'Book 2 · The Year of the Inner Critic', es: 'Libro 2 · The Year of the Inner Critic' } },
    { label: '6–8', book: { en: 'Book 3 · The Year of Two Voices', es: 'Libro 3 · The Year of Two Voices' } },
    { label: '9–10', book: { en: 'Book 4 · The Year We Looked Up', es: 'Libro 4 · The Year We Looked Up' } },
    { label: '11–12', book: { en: 'Book 5 · The Year We Walked Out', es: 'Libro 5 · The Year We Walked Out' } }
  ];
  // The three domains (A/B/C) — answer + the universal result/resource/practice/
  // growth, drawn from the app's real domain focus map (aogTeachNextStudentMap).
  var DOMAINS = [
    { answer: { en: 'Feeling overwhelmed', es: 'Me siento sobrepasado/a' },
      checkin: { en: '“I feel overwhelmed and don’t know what to do about it.”', es: '“Me siento sobrepasado/a y no sé qué hacer.”' },
      result: { en: 'Big feelings outrunning the tools — a gentle flag', es: 'Emociones grandes que superan las herramientas — una señal suave' },
      ri: { en: 'Maps it to the regulation toolkit', es: 'Lo conecta con el kit de regulación' },
      practice: { en: 'The Window of Tolerance, a body reset, a calm-down plan', es: 'La Window of Tolerance, un reinicio corporal, un plan de calma' },
      growth: { en: 'The next check-in: a tool ready before the wave', es: 'El próximo chequeo: una herramienta lista antes de la ola' } },
    { answer: { en: 'A harsh inner voice', es: 'Una voz interior dura' },
      checkin: { en: '“A voice in my head says I’m not good enough.”', es: '“Una voz en mi cabeza dice que no soy suficiente.”' },
      result: { en: 'A loud inner critic — a gentle flag', es: 'Un crítico interior fuerte — una señal suave' },
      ri: { en: 'Maps it to the Kind Coach work', es: 'Lo conecta con el trabajo del Kind Coach' },
      practice: { en: 'The Kind Coach drawing, a Self-Compassion Letter, a reflection', es: 'El dibujo del Kind Coach, una Self-Compassion Letter, una reflexión' },
      growth: { en: 'The next check-in: the critic quieter, the coach louder', es: 'El próximo chequeo: el crítico más callado, el coach más fuerte' } },
    { answer: { en: 'Assuming the worst', es: 'Asumo lo peor' },
      checkin: { en: '“When someone hurts my feelings, I assume the worst about them.”', es: '“Cuando alguien me lastima, asumo lo peor de esa persona.”' },
      result: { en: 'Jumping to the worst — a gentle flag', es: 'Saltar a lo peor — una señal suave' },
      ri: { en: 'Maps it to perspective-taking & repair', es: 'Lo conecta con la toma de perspectiva y la reparación' },
      practice: { en: 'The Three Sides protocol, a scenario card, a reflection', es: 'El protocolo Three Sides, una tarjeta de escenario, una reflexión' },
      growth: { en: 'The next check-in: a pause before the worst-case', es: 'El próximo chequeo: una pausa antes del peor caso' } }
  ];
  var _flowBand = 1, _flowDom = 1; // default: 3–5 · inner critic
  function initFlowAnimation() {
    var track = document.querySelector('.aogf-track');
    if (!track || track.dataset.flowInit) return;
    track.dataset.flowInit = '1';
    var chips = [].slice.call(track.querySelectorAll('.aogf-chip'));
    var arrows = [].slice.call(track.querySelectorAll('.aogf-arrow'));
    if (chips.length < 2) return;
    var reduce = reduceMotion();
    var spark = document.createElement('div');
    spark.className = 'aogf-spark';
    track.appendChild(spark);

    // --- Two-level picker (grade band → answer), inserted above the track ---
    var picker = document.createElement('div');
    picker.className = 'aogf-picker';
    var hBand = document.createElement('div');
    hBand.className = 'aogf-picker-h';
    picker.appendChild(hBand);
    var bandWrap = document.createElement('div');
    bandWrap.className = 'aogf-band-btns';
    var bandBtns = BANDS.map(function (bd, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aogf-band' + (i === _flowBand ? ' active' : '');
      btn.textContent = bd.label;
      btn.addEventListener('click', function () { _flowBand = i; refreshFlowText(); play(); });
      bandWrap.appendChild(btn);
      return btn;
    });
    picker.appendChild(bandWrap);
    var hDom = document.createElement('div');
    hDom.className = 'aogf-picker-h aogf-picker-h2';
    picker.appendChild(hDom);
    var domWrap = document.createElement('div');
    domWrap.className = 'aogf-picker-btns';
    var domBtns = DOMAINS.map(function (dm, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aogf-pick' + (i === _flowDom ? ' active' : '');
      btn.addEventListener('click', function () { _flowDom = i; refreshFlowText(); play(); });
      domWrap.appendChild(btn);
      return btn;
    });
    picker.appendChild(domWrap);
    if (track.parentNode) track.parentNode.insertBefore(picker, track);

    // Apply the current (band × domain) journey's localized text everywhere.
    function refreshFlowText() {
      hBand.textContent = T('1 · Pick a grade band', '1 · Elige una banda de grado');
      hDom.textContent = T('2 · Pick a check-in answer — watch it travel', '2 · Elige una respuesta — míralo viajar');
      bandBtns.forEach(function (b, i) { b.classList.toggle('active', i === _flowBand); });
      domBtns.forEach(function (b, i) { b.textContent = DOMAINS[i].answer[L()]; b.classList.toggle('active', i === _flowDom); });
      var d = DOMAINS[_flowDom], bk = BANDS[_flowBand].book;
      var stages = [d.checkin, d.result, d.ri, bk, d.practice, d.growth];
      chips.forEach(function (c, i) {
        var v = c.querySelector('.c-v');
        if (v && stages[i]) { v.removeAttribute('data-i18n'); v.removeAttribute('data-i18n-html'); v.textContent = stages[i][L()]; }
      });
    }
    window.__aogFlowRefresh = refreshFlowText;
    refreshFlowText();

    // "Watch it again" control, placed just after the track.
    var ctrl = document.createElement('button');
    ctrl.type = 'button';
    ctrl.className = 'aogf-replay';
    ctrl.setAttribute('data-i18n', 'p2g_replay');
    ctrl.textContent = '↻ ' + T('Watch it again', 'Verlo otra vez');
    if (track.parentNode) track.parentNode.insertBefore(ctrl, track.nextSibling);
    var timer = null;
    function moveSpark(chip) {
      var tr = track.getBoundingClientRect(), cr = chip.getBoundingClientRect();
      var inset = 18; // sit in the top-right corner, away from the text
      spark.style.left = (cr.left - tr.left + cr.width - inset) + 'px';
      spark.style.top = (cr.top - tr.top + inset) + 'px';
    }
    function reset() {
      chips.forEach(function (c) { c.classList.remove('aogf-seen', 'aogf-current', 'aogf-pulse'); });
      arrows.forEach(function (a) { a.classList.remove('aogf-lit'); });
    }
    function play() {
      if (timer) clearTimeout(timer);
      track.classList.add('aogf-anim');
      reset();
      if (reduce) {
        chips.forEach(function (c) { c.classList.add('aogf-seen'); });
        arrows.forEach(function (a) { a.classList.add('aogf-lit'); });
        return;
      }
      spark.classList.add('on');
      moveSpark(chips[0]);
      var i = 0;
      function step() {
        if (i > 0) { chips[i - 1].classList.remove('aogf-current'); chips[i - 1].classList.add('aogf-seen'); }
        if (i >= chips.length) { finish(); return; }
        chips[i].classList.add('aogf-current');
        if (i > 0 && arrows[i - 1]) arrows[i - 1].classList.add('aogf-lit');
        moveSpark(chips[i]);
        i++;
        timer = setTimeout(step, 2300);
      }
      timer = setTimeout(step, 260);
    }
    function finish() {
      var last = chips[chips.length - 1];
      last.classList.remove('aogf-current');
      last.classList.add('aogf-seen', 'aogf-pulse');
      timer = setTimeout(function () { spark.classList.remove('on'); }, 450);
    }
    ctrl.addEventListener('click', play);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); setTimeout(play, 350); } });
      }, { threshold: 0.35 });
      io.observe(track);
    } else { setTimeout(play, 700); }
  }

  function boot() {
    addSensoryCategories();
    augmentPecsEs();
    installLocalizedTabs();
    installToolsGate();
    registerI18N();
    // refresh PECS if the screen is already mounted
    try { if (document.getElementById('pecsTabs')) gPecsRenderAll(); } catch (e) {}
    try { upgradeToolIcons(); } catch (e) {}
    try { initFlowAnimation(); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', function () { addSensoryCategories(); installLocalizedTabs(); installToolsGate(); registerI18N(); try { upgradeToolIcons(); } catch (e) {} });
})();
