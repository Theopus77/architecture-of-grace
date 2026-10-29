/* AOG-WOW-MORPH-V2 — Full pattern A/B state storage and visual crossfade
   Jimmy Project: Morph that hardware can't match for fluidity.
   Stores current step grid as State A or B, then blends them on the Morph slider.
*/
(function(){
  const slider = document.getElementById("morphSlider");
  const valEl = document.getElementById("morphVal");
  const stepsContainer = document.getElementById("steps");
  if (!slider || !valEl || !stepsContainer) return;

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

      // Visual crossfade: opacity and brightness based on blend
      const intensity = 0.55 + (t * 0.45);
      st.style.opacity = intensity.toFixed(2);
      st.style.filter = `brightness(${0.85 + t * 0.3})`;

      // Prefer B when t is high, A when low; soft threshold for pressed
      const showPressed = t > 0.5 ? b.pressed : a.pressed;
      if (showPressed) {
        st.setAttribute("aria-pressed", "true");
      } else {
        st.removeAttribute("aria-pressed");
      }
    });
  }

  // Snapshot buttons (injected if missing)
  function ensureButtons() {
    if (document.getElementById("morphSnapA")) return;
    const morphBox = document.getElementById("pmMorph");
    if (!morphBox) return;
    const btnA = document.createElement("button");
    btnA.id = "morphSnapA";
    btnA.type = "button";
    btnA.className = "pm-b";
    btnA.textContent = "Snap A";
    btnA.style.marginLeft = "8px";
    btnA.style.fontSize = "11px";
    btnA.style.padding = "4px 8px";
    const btnB = document.createElement("button");
    btnB.id = "morphSnapB";
    btnB.type = "button";
    btnB.className = "pm-b";
    btnB.textContent = "Snap B";
    btnB.style.fontSize = "11px";
    btnB.style.padding = "4px 8px";
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

  // Auto-snapshot current as A on load
  setTimeout(() => {
    ensureButtons();
    stateA = snapshot();
    stateB = snapshot(); // start identical so morph is neutral until user snaps different states
  }, 600);

  // Initial
  valEl.textContent = "0%";
})();
