/* AOG-WOW-MORPH-V6 — Full morph: hits + pad character
   Snap A/B stores the sequencer events and the per-pad volume, tune, and pan.
   The slider crossfades both, so the sound character changes with the pattern.
   Light: no heavy CSS, no paint on every frame unless the value moved.
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
  setTimeout(injectShape, 150);

  function injectShape() {
    if (document.getElementById("shapeRow")) return;
    const padSet = document.getElementById("padSet");
    if (!padSet) return;
    const row = document.createElement("div");
    row.className = "pm-row";
    row.id = "shapeRow";
    row.style.marginTop = "8px";
    row.innerHTML = `
      <label class="pm-f"><span>Decay · <span class="pm-val" id="decayVal">100</span></span><input class="pm-range" id="decay" type="range" min="20" max="100" step="5" value="100"></label>
      <label class="pm-f"><span>Tone · <span class="pm-val" id="toneVal">100</span></span><input class="pm-range" id="tone" type="range" min="0" max="100" step="5" value="100"></label>
      <label class="pm-f"><span>Drive · <span class="pm-val" id="driveVal">0</span></span><input class="pm-range" id="drive" type="range" min="0" max="40" step="2" value="0"></label>
    `;
    const firstRow = padSet.querySelector(".pm-row");
    if (firstRow && firstRow.nextSibling) firstRow.parentNode.insertBefore(row, firstRow.nextSibling);
    else padSet.appendChild(row);

    function bind(id, key) {
      const el = document.getElementById(id);
      const val = document.getElementById(id + "Val");
      if (!el) return;
      el.addEventListener("input", () => {
        const S = window.S;
        if (!S) return;
        const k = S.bank + ":" + S.sel;
        const o = Object.assign({}, S.pads[k] || {});
        o[key] = +el.value;
        S.pads[k] = o;
        if (val) val.textContent = el.value;
        if (typeof window.paintPadSet === "function") window.paintPadSet();
      });
    }
    bind("decay", "decay");
    bind("tone", "tone");
    bind("drive", "drive");
  }

  const wait = setInterval(() => {
    const slider = document.getElementById("morphSlider");
    const valEl = document.getElementById("morphVal");
    if (!slider || !valEl) return;
    clearInterval(wait);

    let stateA = null;
    let stateB = null;
    let originalEv = null;
    let originalPads = null;
    let lastT = -1;

    function getEv() {
      try { return window.S && Array.isArray(window.S.ev) ? window.S.ev : null; } catch(e) { return null; }
    }

    function getPads(bank) {
      const S = window.S;
      if (!S || !S.pads) return {};
      const out = {};
      for (let pi = 0; pi < 24; pi++) {
        const k = bank + ":" + pi;
        const o = S.pads[k];
        if (o) out[pi] = { vol: o.vol == null ? 100 : o.vol, tune: o.tune || 0, pan: o.pan || 0, decay: o.decay == null ? 100 : o.decay, tone: o.tone == null ? 100 : o.tone, drive: o.drive || 0 };
      }
      return out;
    }

    function cloneEv(arr) {
      return arr.map(e => ({ b: e.b, p: e.p, t: e.t, v: e.v, len: e.len || 0 }));
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    function applyMorph(t) {
      const S = window.S;
      if (!S || !stateA || !stateB || t === lastT) return;
      lastT = t;
      const ease = t * t * (3 - 2 * t);
      const aGain = 1 - ease;
      const bGain = ease;

      // Events
      const blended = [];
      for (let i = 0; i < stateA.ev.length; i++) {
        const e = stateA.ev[i];
        const v = (e.v == null ? 0.8 : e.v) * aGain;
        if (v > 0.015) blended.push({ b: e.b, p: e.p, t: e.t, v: v, len: e.len || 0 });
      }
      for (let i = 0; i < stateB.ev.length; i++) {
        const e = stateB.ev[i];
        const v = (e.v == null ? 0.8 : e.v) * bGain;
        if (v > 0.015) blended.push({ b: e.b, p: e.p, t: e.t, v: v, len: e.len || 0 });
      }
      S.ev = blended;

      // Pad character (vol, tune, pan) for the current bank
      const bank = S.bank;
      for (let pi = 0; pi < 24; pi++) {
        const a = stateA.pads[pi] || { vol: 100, tune: 0, pan: 0, decay: 100, tone: 100, drive: 0 };
        const b = stateB.pads[pi] || { vol: 100, tune: 0, pan: 0, decay: 100, tone: 100, drive: 0 };
        const k = bank + ":" + pi;
        const vol = Math.round(lerp(a.vol, b.vol, ease) / 5) * 5;
        const tune = Math.round(lerp(a.tune, b.tune, ease));
        const pan = Math.round(lerp(a.pan, b.pan, ease) / 10) * 10;
        const decay = Math.round(lerp(a.decay, b.decay, ease));
        const tone = Math.round(lerp(a.tone, b.tone, ease));
        const drive = Math.round(lerp(a.drive, b.drive, ease));
        if (vol === 100 && tune === 0 && pan === 0 && decay === 100 && tone === 100 && drive === 0) {
          if (S.pads[k]) delete S.pads[k];
        } else {
          S.pads[k] = { vol: vol, tune: tune, pan: pan, decay: decay, tone: tone, drive: drive };
        }
      }

      if (typeof window.paintSteps === "function") window.paintSteps();
      if (typeof window.paintPadSet === "function") window.paintPadSet();
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
        const bank = window.S ? window.S.bank : 0;
        if (!originalEv) originalEv = cloneEv(ev);
        if (!originalPads) originalPads = getPads(bank);
        stateA = { ev: cloneEv(ev), pads: getPads(bank) };
        btnA.textContent = "A ✓";
        setTimeout(() => btnA.textContent = "Snap A", 800);
      });
      btnB.addEventListener("click", () => {
        const ev = getEv();
        if (!ev) return;
        const bank = window.S ? window.S.bank : 0;
        if (!originalEv) originalEv = cloneEv(ev);
        if (!originalPads) originalPads = getPads(bank);
        stateB = { ev: cloneEv(ev), pads: getPads(bank) };
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
      raf = requestAnimationFrame(() => applyMorph(t));
    });

    slider.addEventListener("change", () => {
      if (+slider.value === 0 && originalEv && window.S) {
        window.S.ev = cloneEv(originalEv);
        if (originalPads) {
          const bank = window.S.bank;
          for (let pi = 0; pi < 24; pi++) {
            const k = bank + ":" + pi;
            const p = originalPads[pi];
            if (p) window.S.pads[k] = { vol: p.vol, tune: p.tune, pan: p.pan };
            else if (window.S.pads[k]) delete window.S.pads[k];
          }
        }
        lastT = -1;
        if (typeof window.paintSteps === "function") window.paintSteps();
        if (typeof window.paintPadSet === "function") window.paintPadSet();
      }
    });
  }, 200);
})();
