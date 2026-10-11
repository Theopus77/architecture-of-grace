
/* ============================================================================
   ARCHITECTURE OF GRACE — Self-Reflection & Coping Toolkit Engine
   GraceAudio · InteractiveCard · GraceTransitions
   ============================================================================ */

const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. DYNAMIC SOUND SYNTHESIS ENGINE
const GraceAudio = {
  ctx: null,
  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
  },
  playPop() {
    this.init();
    if (!this.ctx || PREFERS_REDUCED_MOTION) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.08);
  },
  playHum() {
    this.init();
    if (!this.ctx || PREFERS_REDUCED_MOTION) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(170, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(210, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.4);
  },
  playSuccess() {
    this.init();
    if (!this.ctx || PREFERS_REDUCED_MOTION) return;
    [440, 554, 660].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + i * 0.12;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(t); osc.stop(t + 0.3);
    });
  }
};

// 2. TACTILE INTERACTION — Spring Physics & States
class InteractiveCard {
  constructor(element) {
    this.card = element;
    this.button = element.querySelector('.activate-btn');
    this.id = element.dataset.toolId || element.id || '';
    this.init();
  }
  init() {
    if (!PREFERS_REDUCED_MOTION) this.bindTilt();
    this.bindClicks();
  }
  bindTilt() {
    this.card.addEventListener('mousemove', (e) => {
      const rect = this.card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = (y / (rect.height / 2)) * -5;
      const tiltY = (x / (rect.width / 2)) * 5;
      this.card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`;
    });
    this.card.addEventListener('mouseleave', () => {
      this.card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  }
  bindClicks() {
    this.card.addEventListener('click', (e) => {
      if (e.target.closest('.activate-btn')) return;
      GraceAudio.playPop();
    });
    if (this.button) {
      this.button.addEventListener('click', (e) => {
        e.stopPropagation();
        GraceAudio.playHum();
        this.executeAction();
      });
    }
  }
  executeAction() {
    if (!this.button) return;
    const orig = this.button.textContent;
    this.button.classList.add('loading');
    this.button.textContent = 'Anchoring…';
    setTimeout(() => {
      this.button.classList.remove('loading');
      this.button.classList.add('success');
      this.button.textContent = 'Practiced ✓';
      GraceAudio.playSuccess();
      document.dispatchEvent(new CustomEvent('graceMetricLogged', {
        detail: { item: this.id, timestamp: Date.now() }
      }));
      setTimeout(() => {
        this.button.classList.remove('success');
        this.button.textContent = orig;
      }, 2500);
    }, 1200);
  }
}

// 3. FLUID CONTENT TRANSITION COMPOSER
const GraceTransitions = {
  shiftStage(currentStage, nextStage) {
    if (!currentStage || !nextStage) return;
    if (PREFERS_REDUCED_MOTION) {
      currentStage.classList.remove('active');
      nextStage.classList.add('active');
      return;
    }
    currentStage.style.cssText += 'opacity:0;transform:translateY(-8px);transition:opacity .2s ease,transform .2s ease';
    setTimeout(() => {
      currentStage.classList.remove('active');
      nextStage.style.cssText += 'opacity:0;transform:translateY(8px)';
      nextStage.classList.add('active');
      requestAnimationFrame(() => {
        nextStage.style.transition = 'opacity .35s cubic-bezier(.34,1.56,.64,1),transform .35s cubic-bezier(.34,1.56,.64,1)';
        nextStage.style.opacity = '1';
        nextStage.style.transform = 'translateY(0)';
      });
    }, 200);
  }
};

// 4. INIT — wire sounds to existing selectable elements + tool cards
document.addEventListener('DOMContentLoaded', function() {
  // Wire pop sound to all response options, intensity options, mode cards
  document.querySelectorAll('.response-option, .intensity-option, .mode-card, .choice-chip, .tk-pill').forEach(function(el) {
    el.addEventListener('click', function() { GraceAudio.playPop(); });
  });

  // Wire hum to tool card buttons
  document.querySelectorAll('#screen-teacher-tools .tool-card .btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      GraceAudio.playHum();
    }, true);
  });

  // Apply InteractiveCard tilt to all tool cards
  document.querySelectorAll('#screen-teacher-tools .tool-card').forEach(function(card) {
    if (!PREFERS_REDUCED_MOTION) {
      card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        card.style.transform = 'perspective(900px) rotateX(' + ((y / (rect.height/2)) * -4) + 'deg) rotateY(' + ((x / (rect.width/2)) * 4) + 'deg) scale3d(1.02,1.02,1.02)';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    }
  });

  // Log metric events
  document.addEventListener('graceMetricLogged', function(e) {
    console.log('[Grace Dashboard] Tracked Anchor Event:', e.detail);
  });
});

window.GraceAudio = GraceAudio;
window.GraceTransitions = GraceTransitions;
