/* AOG-MUSIC-TOUCH-V1 — wake Safari's audio on the first touch, every time it sleeps */
(function(){ function wake(){ try{ if(typeof actx!=="undefined"&&actx&&actx.state!=="running") actx.resume(); }catch(e){} }
  ["touchstart","pointerdown","keydown"].forEach(function(t){ document.addEventListener(t, wake, {capture:true, passive:true}); }); })();
/* ══ AOG-DECKS-1210-V1 (2026-10-28) — the 1210's own controls: Reset puts the pitch back on 0 (its light shows when it is
   there), the needle light, and the Start and Brake knobs (how long the platter takes to come up to speed, and to stop;
   kept on the device). Nothing here runs until a hand touches it. ══ */
(function(){
  const KEY = "aog.decks.t12.v1", R = { up:[0.2, 3, 0.5], down:[0.2, 6, 1.3] };   /* seconds: least, most, as it comes */
  let T = {}; try{ T = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }catch(e){ T = {}; }
  const val = (id, w)=>{ const v = T[id] && +T[id][w]; return v > 0 ? v : R[w][2]; };
  const torque = (d)=>send(d, { t:"torque", up:val(d.id, "up")/3, down:val(d.id, "down")/3 });
  decks.forEach(d=>{ if(T[d.id]) torque(d); });
  function led(d){ const el = document.querySelector('[data-pled="'+d.id+'"]'); if(el) el.classList.toggle("on", Math.abs(d.pitch - 1) < 1e-6); }
  function knobs(){
    document.querySelectorAll(".t12-k").forEach(k=>{ const id = k.getAttribute("data-tk"), w = k.getAttribute("data-w"), v = val(id, w), r = R[w];
      k.style.setProperty("--a", (-135 + 270*(v - r[0])/(r[1] - r[0])) + "deg");
      k.setAttribute("aria-valuemin", r[0]); k.setAttribute("aria-valuemax", r[1]); k.setAttribute("aria-valuenow", v); k.setAttribute("aria-valuetext", v.toFixed(1) + " s");
      const o = document.querySelector('[data-tkv="'+id+w+'"]'); if(o && o.textContent !== v.toFixed(1)+" s") o.textContent = v.toFixed(1) + " s"; });
    decks.forEach(led);
  }
  function setK(id, w, v){ const r = R[w]; v = Math.round(Math.max(r[0], Math.min(r[1], v))*10)/10; if(v === val(id, w)) return;
    (T[id] = T[id] || {})[w] = v; try{ localStorage.setItem(KEY, JSON.stringify(T)); }catch(e){}
    const d = decks.find(x=>x.id === id); if(d) torque(d); knobs(); }
  const sp = window.setPitch; if(typeof sp === "function") window.setPitch = function(d){ const r = sp.apply(this, arguments); led(d); return r; };
  const bd = window.bind; if(typeof bd === "function") window.bind = function(){ const r = bd.apply(this, arguments); knobs(); return r; };
  document.addEventListener("click", e=>{
    const b = e.target.closest && e.target.closest("[data-preset],[data-tl],[data-wide]"); if(!b) return;
    if(b.hasAttribute("data-preset")){ const inp = document.querySelector('[data-speed="'+b.getAttribute("data-preset")+'"]'); if(inp){ inp.value = "1"; inp.dispatchEvent(new Event("input")); } }
    else if(b.hasAttribute("data-tl")){ const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); const pl = b.closest(".t12-pl"); if(pl) pl.classList.toggle("lit", on); }
    else { const d = decks.find(x=>x.id === b.getAttribute("data-wide")); if(d) led(d); }
  });
  let drag = null;
  document.addEventListener("pointerdown", e=>{ const k = e.target.closest && e.target.closest(".t12-k"); if(!k) return;
    const id = k.getAttribute("data-tk"), w = k.getAttribute("data-w"); drag = { k, id, w, y:e.clientY, v:val(id, w), p:e.pointerId };
    try{ k.setPointerCapture(e.pointerId); }catch(x){} e.preventDefault(); });
  document.addEventListener("pointermove", e=>{ if(!drag || e.pointerId !== drag.p) return; const r = R[drag.w];
    setK(drag.id, drag.w, drag.v + (drag.y - e.clientY)/140*(r[1] - r[0])); });
  ["pointerup","pointercancel"].forEach(t=>document.addEventListener(t, e=>{ if(drag && e.pointerId === drag.p) drag = null; }));
  document.addEventListener("keydown", e=>{ const k = e.target.closest && e.target.closest(".t12-k"); if(!k) return;
    const d = {ArrowUp:1, ArrowRight:1, ArrowDown:-1, ArrowLeft:-1}[e.key]; if(!d) return; e.preventDefault();
    const id = k.getAttribute("data-tk"), w = k.getAttribute("data-w"); setK(id, w, val(id, w) + d*0.1); });
  knobs();
})();
/* AOG-SOUND-HANDOFF-V1 — a sound sent from the oscilloscope goes into Up next */
(function(){ if(!/[?&]take=1/.test(location.search)||!window.aogHandoffTake) return;
  setTimeout(function(){ window.aogHandoffTake().then(function(v){ if(!v||!v.blob) return; const f=new File([v.blob], v.name||"scope.wav", {type:"audio/wav"});
    CRATE.next.push({ id:crateId(f), name:f.name, blob:f, at:Date.now() }); cratePut("next", CRATE.next); paintCrate(); }); }, 1200); })();
