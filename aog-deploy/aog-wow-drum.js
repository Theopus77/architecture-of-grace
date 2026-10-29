/* AOG-WOW-MORPH-V3 — Self-injecting Morph control + full A/B crossfade
   Jimmy Project. Injects the Morph UI if missing, then handles Snap A/B and blending.
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
    const stepsContainer = document.getElementById("steps");
    if (!slider || !valEl || !stepsContainer) return;
    clearInterval(wait);

    let stateA = null;
    let stateB = null;

    function snapshot() {
      const steps = Array.from(stepsContainer.querySelectorAll(".st"));
      return steps.map(st => ({
        pressed: st.getAttribute("aria-pressed") === "true",
        accent: st.classList.contains("h"),
        quiet: st.classList.contains("q")
      }));
    }

    function applyBlend(t) {
      if (!stateA || !stateB || stateA.length !== stateB.length) return;
      const steps = Array.from(stepsContainer.querySelectorAll(".st"));
      steps.forEach((st, i) => {
        const a = stateA[i];
        const b = stateB[i];
        if (!a || !b) return;
        const intensity = 0.55 + (t * 0.45);
        st.style.opacity = intensity.toFixed(2);
        st.style.filter = `brightness(${0.85 + t * 0.3})`;
        const showPressed = t > 0.5 ? b.pressed : a.pressed;
        if (showPressed) st.setAttribute("aria-pressed", "true");
        else st.removeAttribute("aria-pressed");
      });
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
        stateA = snapshot();
        btnA.textContent = "A ✓";
        setTimeout(() => btnA.textContent = "Snap A", 800);
      });
      btnB.addEventListener("click", () => {
        stateB = snapshot();
        btnB.textContent = "B ✓";
        setTimeout(() => btnB.textContent = "Snap B", 800);
      });
    }

    slider.addEventListener("input", function() {
      const p = +this.value;
      const t = p / 100;
      valEl.textContent = p + "%";
      document.documentElement.style.setProperty("--morph", t.toFixed(3));
      applyBlend(t);
    });

    setTimeout(() => {
      ensureButtons();
      stateA = snapshot();
      stateB = snapshot();
    }, 400);
  }, 150);
})();
/* Morph deploy trigger 2026-10-29T21:12:16Z */
