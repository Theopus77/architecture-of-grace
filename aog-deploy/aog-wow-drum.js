/* AOG-WOW-MORPH-V4 — Morph blends the actual audio
   Snap A/B stores the real sequencer events. The slider crossfades their
   velocities so both patterns play at once, with A fading out and B fading in.
*/
(function(){
  function injectMorph() {
    if (document.getElementById("pmMorph")) return;
    const lcd = document.getElementById("pmLcd");
    if (!lcd) return;
    const box = document.createElement("div");
    box.className = "pm-morph";
    box.id = "pmMorph";
    box.innerHTML = `
      <label for="morphSlider">Morph</label>
      <input type="range" id="morphSlider" min="0" max="100" value="0" step="1" aria-label="Morph between A and B states">
      <span class="morph-val" id="morphVal">0%</span>
    `;
    lcd.parentNode.insertBefore(box, lcd.nextSibling);
  }

  function injectStyles() {
    if (document.getElementById("aog-wow-styles")) return;
    const style = document.createElement("style");
    style.id = "aog-wow-styles";
    style.textContent = `
      #pads .pad.hit {
        background: radial-gradient(circle at 50% 40%, #ffe9a8 0%, #ffd36b 40%, #e8a020 100%) !important;
        box-shadow: inset 0 0 22px rgba(255, 211, 107, 0.85), 0 0 20px #ffd36b, 0 0 36px rgba(255, 211, 107, 0.45) !important;
        color: #1a1204 !important;
      }
      #pads .pad.hit .pn, #pads .pad.hit .pi, #pads .pad.hit .pk { color: #1a1204 !important; }
      .pm-morph {
        display: flex; align-items: center; gap: 12px; margin: 10px 0 6px;
        padding: 8px 14px; background: #1a1c20; border-radius: 8px; border: 1px solid #0d0f12;
      }
      .pm-morph label { font: 700 12px/1 var(--sans); letter-spacing: .12em; color: #c9bfae; text-transform: uppercase; }
      .pm-morph input[type=range] { flex: 1; accent-color: #ffd36b; height: 6px; }
      .pm-morph .morph-val { font: 700 14px/1 ui-monospace, monospace; color: #ffd36b; min-width: 40px; text-align: right; }
    `;
    document.head.appendChild(style);
  }

  injectStyles();
  setTimeout(injectMorph, 100);

  const wait = setInterval(() => {
    const slider = document.getElementById("morphSlider");
    const valEl = document.getElementById("morphVal");
    if (!slider || !valEl) return;
    clearInterval(wait);

    let stateA = null;
    let stateB = null;
    let originalEv = null;

    function getEv() {
      try { return window.S && Array.isArray(window.S.ev) ? window.S.ev : null; } catch(e) { return null; }
    }

    function cloneEv(arr) {
      return arr.map(e => ({ b: e.b, p: e.p, t: e.t, v: e.v, len: e.len || 0 }));
    }

    function applyAudioBlend(t) {
      const S = window.S;
      if (!S || !stateA || !stateB) return;
      // Ease the crossfade so the change feels continuous
      const ease = t * t * (3 - 2 * t); // smoothstep
      const aGain = 1 - ease;
      const bGain = ease;
      const blended = [];
      stateA.forEach(e => {
        const v = (e.v == null ? 0.8 : e.v) * aGain;
        if (v > 0.015) blended.push({ b: e.b, p: e.p, t: e.t, v: v, len: e.len || 0 });
      });
      stateB.forEach(e => {
        const v = (e.v == null ? 0.8 : e.v) * bGain;
        if (v > 0.015) blended.push({ b: e.b, p: e.p, t: e.t, v: v, len: e.len || 0 });
      });
      S.ev = blended;
      if (typeof window.paintSteps === "function") window.paintSteps();
    }

    function ensureButtons() {
      if (document.getElementById("morphSnapA")) return;
      const morphBox = document.getElementById("pmMorph");
      if (!morphBox) return;
      const btnA = document.createElement("button");
      btnA.id = "morphSnapA"; btnA.type = "button"; btnA.className = "pm-b";
      btnA.textContent = "Snap A"; btnA.style.cssText = "margin-left:8px;font-size:11px;padding:4px 8px";
      const btnB = document.createElement("button");
      btnB.id = "morphSnapB"; btnB.type = "button"; btnB.className = "pm-b";
      btnB.textContent = "Snap B"; btnB.style.cssText = "font-size:11px;padding:4px 8px";
      morphBox.appendChild(btnA);
      morphBox.appendChild(btnB);

      btnA.addEventListener("click", () => {
        const ev = getEv();
        if (!ev) return;
        if (!originalEv) originalEv = cloneEv(ev);
        stateA = cloneEv(ev);
        btnA.textContent = "A ✓";
        setTimeout(() => btnA.textContent = "Snap A", 800);
      });
      btnB.addEventListener("click", () => {
        const ev = getEv();
        if (!ev) return;
        if (!originalEv) originalEv = cloneEv(ev);
        stateB = cloneEv(ev);
        btnB.textContent = "B ✓";
        setTimeout(() => btnB.textContent = "Snap B", 800);
      });
    }

    ensureButtons();

    let raf = 0;
    slider.addEventListener("input", () => {
      const t = slider.value / 100;
      valEl.textContent = slider.value + "%";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => applyAudioBlend(t));
    });

    // Restore original pattern when slider returns to 0 if we have a snapshot
    slider.addEventListener("change", () => {
      if (+slider.value === 0 && originalEv && window.S) {
        window.S.ev = cloneEv(originalEv);
        if (typeof window.paintSteps === "function") window.paintSteps();
      }
    });
  }, 200);
})();
