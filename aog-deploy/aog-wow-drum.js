/* AOG-IOS-CACHE-V1
   iPhone Safari holds the service worker cache hard. After any kit or layout change:
   1. Bump the CACHE name in sw.js (aog-cache-YYYY.MM.DD.tag).
   2. Tell the user to hard-refresh, or close the tab and reopen.
   3. If still stale: Settings → Safari → Advanced → Website Data → remove architectureofgrace.com.
   The kits live in aog-drumkit.js. A change there is invisible until the cache name changes.
*/
/* AOG-WOW-PERMANENT-V1
   Permanent constraints for this file and the Drum Machine:
   1. Morph bar must stay compact (max-height ~72px, flex:0 0 auto). Never let it grow to fill the screen.
   2. Pattern slots (P1-P8) sit in a second row under the slider; keep them capped so they cannot push the pads off.
   3. Per-pad shape (Decay/Tone/Drive/Echo/Verb/Chance/Micro) is injected into the pad panel. On small screens it uses a 2-column grid.
   4. Audio nodes created per hit (filter, drive, delay, verb) MUST be pushed to the extras array and disconnected in unplug(). Never leave them connected.
   5. Never use continue inside a forEach callback (the sequencer uses forEach). Use return to skip a hit.
   6. The master chain is: bus → high-pass (28 Hz) → effects → glue compressor → limiter → ceiling. Do not remove the high-pass or glue.
   7. Loop Stack Boom Bap kit id is "LS" and is registered in AOGDrumKit.ids.
   These rules exist because earlier versions froze the page or hid the pads. Keep them.
*/
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
    injectTransport(box);
  }

  function injectTransport(morph) {
    if (document.getElementById("pmQuick")) return;
    const row = document.createElement("div");
    row.id = "pmQuick";
    row.className = "pm-quick";
    row.innerHTML = `
      <button type="button" class="pm-q" id="qPlay">▶</button>
      <button type="button" class="pm-q" id="qStop">■</button>
      <button type="button" class="pm-q rec" id="qRec">●</button>
      <button type="button" class="pm-q" id="qDown">−</button>
      <span class="pm-qtempo" id="qTempo">90</span>
      <button type="button" class="pm-q" id="qUp">+</button>
    `;
    morph.parentNode.insertBefore(row, morph.nextSibling);
    setTimeout(() => {
      const play = document.getElementById("playBtn");
      const rec = document.getElementById("loopRec");
      const tempo = document.getElementById("tempo");
      const down = document.getElementById("tDown");
      const up = document.getElementById("tUp");
      const qPlay = document.getElementById("qPlay");
      const qRec = document.getElementById("qRec");
      const qTempo = document.getElementById("qTempo");
      const qDown = document.getElementById("qDown");
      const qUp = document.getElementById("qUp");
      if (qPlay && play) qPlay.onclick = () => play.click();
      const qStop = document.getElementById("qStop");
      if (qStop && play) qStop.onclick = () => { if (window.SEQ && window.SEQ.on) play.click(); };
      if (qRec && rec) qRec.onclick = () => rec.click();
      if (qDown && down) qDown.onclick = () => down.click();
      if (qUp && up) qUp.onclick = () => up.click();
      const sync = () => { if (tempo && qTempo) qTempo.textContent = tempo.value || "90"; };
      sync();
      if (tempo) tempo.addEventListener("change", sync);
      setInterval(sync, 500);
    }, 200);
  }

  function injectStyles() {
    if (document.getElementById("aog-wow-styles")) return;
    const style = document.createElement("style");
    style.id = "aog-wow-styles";
    style.textContent = `
      .pm {
        background: repeating-linear-gradient(90deg, rgba(255,255,255,.015) 0 1px, transparent 1px 3px),
                    linear-gradient(180deg, #3e4249 0%, #2c2e33 35%, #1c1e22 100%) !important;
        border: 2px solid #08090a !important;
        border-radius: 16px !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.1), inset 0 -4px 0 rgba(0,0,0,.4),
                    0 16px 32px rgba(0,0,0,.6), 0 2px 0 #0a0b0d !important;
      }
      .pm-lcd {
        background: linear-gradient(165deg, rgba(255,255,255,.2) 0%, transparent 25%),
                    repeating-linear-gradient(0deg, rgba(0,0,0,.03) 0 1px, transparent 1px 2px),
                    radial-gradient(ellipse at 50% 35%, #e0eec0 0%, #c8d898 50%, #b0c480 100%) !important;
        border: 4px solid #050607 !important;
        border-radius: 6px !important;
        box-shadow: inset 0 3px 8px rgba(0,0,0,.4), inset 0 0 0 1px rgba(0,0,0,.2),
                    0 1px 0 rgba(255,255,255,.05) !important;
        font-family: ui-monospace, "SF Mono", Menlo, monospace !important;
      }
      #pads .pad:not(.hit):not(.down) {
        background: radial-gradient(140% 110% at 50% 0%, #5a5d64 0%, #3e4148 45%, #2c2e33 100%) !important;
        border: 1px solid #0a0b0d !important;
        border-radius: 12px !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -3px 5px rgba(0,0,0,.45),
                    0 3px 0 #08090a, 0 0 0 1px #121316, 0 4px 8px rgba(0,0,0,.3) !important;
      }
      #pads .pad .pn { font-weight: 700; letter-spacing: .04em; }

      .pm-knob {
        background: radial-gradient(circle at 50% 50%, transparent 0 30px, #0a0b0d 30px 31px, transparent 31px),
                    repeating-conic-gradient(from -135deg, #9aa0a8 0 1.2deg, #6a6e76 1.2deg 2deg, transparent 2deg 26deg) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.15) !important;
      }
      .pm-knob::before {
        background: radial-gradient(circle at 35% 28%, #6a6e76, #2e3036 50%, #141518) !important;
        box-shadow: 0 3px 6px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.2), inset 0 -1px 2px rgba(0,0,0,.4) !important;
      }
      #ampBox, #pedalsNear {
        background: linear-gradient(180deg, #2a2c30, #1a1c20);
        border-radius: 10px;
        padding: 8px;
        border: 1px solid #0d0f12;
      }
      #ampBox .pedal, #pedalsNear .pedal {
        background: repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px),
                    linear-gradient(180deg, #3a3d44, #25272c);
        border: 1px solid #0a0b0d;
        border-radius: 8px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 3px 6px rgba(0,0,0,.4);
      }
      .pm-morph {
        display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 6px 0 4px;
        padding: 6px 10px; background: linear-gradient(180deg, #22252b, #1a1c20);
        border-radius: 10px; border: 1px solid #0d0f12;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
        flex: 0 0 auto; width: 100%; box-sizing: border-box;
      }
      .pm-morph label { flex: 0 0 auto; }
      .pm-morph input[type=range] { flex: 1 1 80px; min-width: 60px; }
      .pm-morph button { flex: 0 0 auto; font-size: 11px; padding: 5px 8px; min-height: 32px; }
      .pm-quick { display: flex; align-items: center; gap: 6px; margin: 4px 0 6px; padding: 4px 8px;
        background: #1a1c20; border-radius: 8px; border: 1px solid #0d0f12; }
      .pm-q, .pm-b, .pm-morph button {
        min-width: 36px; min-height: 34px; border-radius: 6px; border: 1px solid #0a0b0d;
        background: linear-gradient(180deg, #3a3d44, #25272c); color: #e8e0d0;
        font-weight: 700; box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 1px 0 #08090a;
      }
      .pm-q:active, .pm-b:active { transform: translateY(1px); }
      #ampBox select, .pm-sel {
        background: linear-gradient(180deg, #2a2c31, #1a1c20); color: #e8e0d0;
        border: 1px solid #0d0f12; border-radius: 8px;
      }
      .pm-q { min-width: 36px; min-height: 32px; border-radius: 6px; border: 1px solid #0a0b0d;
        background: #2a2c31; color: #e8e0d0; font-weight: 700; }
      .pm-q.rec { color: #ff6a5a; }
      .pm-qtempo { font: 700 14px/1 ui-monospace, monospace; color: #ffd36b; min-width: 36px; text-align: center; }
      
      
      
      
      
      @media (max-width: 400px) {
        .pm-morph { gap: 4px; }
        .pm-morph button { font-size: 10px; padding: 4px 6px; }
      }
      #patSlots { display: flex !important; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
      .pm-morph label { color: #e8dfc9; letter-spacing: .14em; }
      .pm-morph .morph-val { color: #ffd36b; font-weight: 700; }
      #pads .pad { transition: none; }
      #pads .pad.sel { box-shadow: 0 0 0 2px #ffd36b, inset 0 1px 0 rgba(255,255,255,.1) !important; }
      
      @media (max-width: 520px) {
        #shapeRow, #extraRow { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        #shapeRow .pm-f, #extraRow .pm-f { min-width: 0; }
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

  let waits = 0;
  const wait = setInterval(() => {
    if (++waits > 50) { clearInterval(wait); return; }
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
        if (o) out[pi] = { vol: o.vol == null ? 100 : o.vol, tune: o.tune || 0, pan: o.pan || 0, decay: o.decay == null ? 100 : o.decay, tone: o.tone == null ? 100 : o.tone, drive: o.drive || 0, echo: o.echo || 0, verb: o.verb || 0, chance: o.chance == null ? 100 : o.chance, micro: o.micro || 0, alt: o.alt || 0 };
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
        const a = stateA.pads[pi] || { vol: 100, tune: 0, pan: 0, decay: 100, tone: 100, drive: 0, echo: 0, verb: 0, chance: 100, micro: 0, alt: 0 };
        const b = stateB.pads[pi] || { vol: 100, tune: 0, pan: 0, decay: 100, tone: 100, drive: 0, echo: 0, verb: 0, chance: 100, micro: 0, alt: 0 };
        const k = bank + ":" + pi;
        const vol = Math.round(lerp(a.vol, b.vol, ease) / 5) * 5;
        const tune = Math.round(lerp(a.tune, b.tune, ease));
        const pan = Math.round(lerp(a.pan, b.pan, ease) / 10) * 10;
        const decay = Math.round(lerp(a.decay, b.decay, ease));
        const tone = Math.round(lerp(a.tone, b.tone, ease));
        const drive = Math.round(lerp(a.drive, b.drive, ease));
        const echo = Math.round(lerp(a.echo, b.echo, ease));
        const verb = Math.round(lerp(a.verb, b.verb, ease));
        const chance = Math.round(lerp(a.chance, b.chance, ease));
        const micro = Math.round(lerp(a.micro, b.micro, ease));
        const alt = ease > 0.5 ? b.alt : a.alt;
        if (vol === 100 && tune === 0 && pan === 0 && decay === 100 && tone === 100 && drive === 0 && echo === 0 && verb === 0 && chance === 100 && micro === 0 && !alt) {
          if (S.pads[k]) delete S.pads[k];
        } else {
          S.pads[k] = { vol: vol, tune: tune, pan: pan, decay: decay, tone: tone, drive: drive, echo: echo, verb: verb, chance: chance, micro: micro, alt: alt };
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

/* AOG-FULL-V1: pattern slots, probability, microtiming, alt, Morph filter/sends */
(function(){
  setTimeout(function(){
    // Pattern slots
    if (!document.getElementById("patSlots")) {
      const morph = document.getElementById("pmMorph");
      if (morph) {
        const row = document.createElement("div");
        row.id = "patSlots";
        row.style.cssText = "display:flex;gap:4px;margin-top:6px;flex-wrap:wrap";
        for (let i = 0; i < 8; i++) {
          const b = document.createElement("button");
          b.type = "button"; b.className = "pm-b"; b.textContent = "P" + (i+1);
          b.style.cssText = "font-size:11px;padding:3px 6px";
          b.dataset.slot = i;
          row.appendChild(b);
        }
        morph.appendChild(row);
        const slots = new Array(8).fill(null);
        row.addEventListener("click", e => {
          const b = e.target.closest("button");
          if (!b) return;
          const i = +b.dataset.slot;
          const S = window.S;
          if (!S) return;
          if (e.shiftKey || slots[i] == null) {
            slots[i] = S.ev.map(x => ({b:x.b,p:x.p,t:x.t,v:x.v,len:x.len||0}));
            b.textContent = "P" + (i+1) + "✓";
            setTimeout(() => b.textContent = "P" + (i+1), 600);
          } else {
            S.ev = slots[i].map(x => ({b:x.b,p:x.p,t:x.t,v:x.v,len:x.len||0}));
            if (typeof window.paintSteps === "function") window.paintSteps();
          }
        });
      }
    }

    // Extra pad controls: Echo, Verb, Chance, Micro, Alt
    if (!document.getElementById("extraRow") && document.getElementById("shapeRow")) {
      const shape = document.getElementById("shapeRow");
      const row = document.createElement("div");
      row.className = "pm-row";
      row.id = "extraRow";
      row.style.marginTop = "8px";
      row.innerHTML = `
        <label class="pm-f"><span>Echo · <span class="pm-val" id="echoVal">0</span></span><input class="pm-range" id="echo" type="range" min="0" max="100" step="5" value="0"></label>
        <label class="pm-f"><span>Verb · <span class="pm-val" id="verbVal">0</span></span><input class="pm-range" id="verb" type="range" min="0" max="100" step="5" value="0"></label>
        <label class="pm-f"><span>Chance · <span class="pm-val" id="chanceVal">100</span></span><input class="pm-range" id="chance" type="range" min="0" max="100" step="5" value="100"></label>
        <label class="pm-f"><span>Micro · <span class="pm-val" id="microVal">0</span></span><input class="pm-range" id="micro" type="range" min="-15" max="15" step="1" value="0"></label>
        <label class="pm-f"><span>Alt</span><input type="checkbox" id="altPad"></label>
      `;
      shape.parentNode.insertBefore(row, shape.nextSibling);
      function bind(id, key, isCheck) {
        const el = document.getElementById(id);
        const val = document.getElementById(id + "Val");
        if (!el) return;
        const fn = () => {
          const S = window.S; if (!S) return;
          const k = S.bank + ":" + S.sel;
          const o = Object.assign({}, S.pads[k] || {});
          o[key] = isCheck ? (el.checked ? 1 : 0) : +el.value;
          S.pads[k] = o;
          if (val && !isCheck) val.textContent = el.value;
          if (typeof window.paintPadSet === "function") window.paintPadSet();
        };
        el.addEventListener(isCheck ? "change" : "input", fn);
      }
      bind("echo", "echo");
      bind("verb", "verb");
      bind("chance", "chance");
      bind("micro", "micro");
      bind("altPad", "alt", true);
    }
  }, 300);
})();

/* AOG-IDLE-V1: stop work when the page is hidden or nothing is playing */
(function(){
  let idleT = 0;
  function rest(){
    try {
      if (window.SEQ && !window.SEQ.on && window.ac && window.ac.state === "running") {
        window.ac.suspend();
      }
    } catch(e) {}
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(idleT);
      rest();
    }
  });
  document.addEventListener("pointerdown", () => {
    clearTimeout(idleT);
    idleT = setTimeout(rest, 8000);
  }, {passive: true});
})();

/* AOG-PADS-SAFETY: if the pad grid is empty after load, ask the page to paint it */
setTimeout(function(){
  var pads = document.getElementById("pads");
  if (pads && !pads.children.length && typeof window.paintPads === "function") {
    try { window.paintPads(); } catch(e) {}
  }
  if (typeof window.paintAll === "function") {
    try { window.paintAll(); } catch(e) {}
  }
}, 500);

