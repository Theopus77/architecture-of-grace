"use strict";
/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   AOG-DESK-PRO-V1 (2026-10-17) — the Mixing Desk (music-studio.html), Jimmy: "Make it surpass the ceiling … DAW to the
   max". Loaded with defer, so it runs once the desk's own code has run; every name here begins with dp or DP_, and the
   desk calls it only where it is there (typeof). What changes the sound lives in the desk's page itself (proMaster,
   proClean …), so a mix is the same whether or not this file has arrived; this file is the panels and the hands.
   1 · AOG-DESK-MASTER-V1: more for the whole song — the Room and Echo returns' levels; the EQ with a Low cut and a
       drawn curve; the Glue's threshold, ratio and make-up with its meter; the limiter; a stereo meter and a spectrum
       that move only while the song plays; and AOG-DESK-GROUPS-V1: track groups whose faders move together.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const DP_STR={
  pmSum:{en:"More for the whole song",es:"Más para toda la canción"},
  pmShow:{en:"Show",es:"Mostrar"},
  pm_rt:{en:"Room and Echo returns",es:"Retornos de sala y eco"},
  pm_eq:{en:"EQ and Low cut",es:"Ecualizador y corte de graves"},
  pm_gl:{en:"Glue",es:"Unión"},
  pm_lim:{en:"Limiter",es:"Limitador"},
  pm_mt:{en:"Stereo and spectrum",es:"Estéreo y espectro"},
  pm_gp:{en:"Groups",es:"Grupos"},
  pm_ab:{en:"Compare with a song (A/B)",es:"Comparar con una canción (A/B)"}, pmReady:{en:"Getting it ready…",es:"Preparándolo…"},
  rtLine:{en:"Each track's Room and Echo knobs send here, after its fader.",es:"Las perillas Sala y Eco de cada pista envían aquí, después de su fader."},
  rvRet:{en:"Room return",es:"Retorno de sala"}, dlRet:{en:"Echo return",es:"Retorno de eco"},
  onOff:{en:"{w}: On",es:"{w}: encendido"}, offOn:{en:"{w}: Off",es:"{w}: apagado"},
  eqW:{en:"EQ",es:"Ecualizador"}, glW:{en:"Glue",es:"Unión"}, limW:{en:"Limiter",es:"Limitador"},
  lcLab:{en:"Low cut",es:"Corte de graves"}, lcOff:{en:"Off",es:"Apagado"}, lcHz:{en:"Below {n} Hz",es:"Debajo de {n} Hz"},
  eqLine:{en:"The line shows what the EQ does, from deep (left) to bright (right).",es:"La línea muestra lo que hace el ecualizador, de grave (izquierda) a brillante (derecha)."},
  eqAria:{en:"The EQ's curve",es:"La curva del ecualizador"},
  glAmt:{en:"Amount",es:"Cantidad"}, glThr:{en:"Starts at",es:"Empieza en"}, glRatio:{en:"Ratio",es:"Proporción"}, glMk:{en:"Make-up",es:"Compensar"},
  glHand:{en:"Set by hand. The Glue knob rests.",es:"Ajustado a mano. La perilla Unión descansa."},
  glKnob:{en:"Use the Glue knob again",es:"Volver a la perilla Unión"},
  glLine:{en:"Glue brings the loudest moments a little closer to the rest.",es:"La unión acerca un poco los momentos más fuertes al resto."},
  limLine:{en:"It keeps the loudest moments just under the top.",es:"Mantiene los momentos más fuertes justo por debajo del tope."},
  grRest2:{en:"Holding back now: —",es:"Reduciendo ahora: —"}, grNow2:{en:"Holding back now: {n} dB",es:"Reduciendo ahora: {n} dB"},
  mtLine:{en:"They move only while the song plays.",es:"Se mueven solo mientras suena la canción."},
  stLab:{en:"Stereo",es:"Estéreo"}, stAria:{en:"How alike the left and right speakers are",es:"Qué tan parecidos son el altavoz izquierdo y el derecho"},
  stRest:{en:"—",es:"—"}, stMono:{en:"{n} · almost the same in both",es:"{n} · casi igual en los dos"}, stWide:{en:"{n} · wide",es:"{n} · amplio"},
  stCancel:{en:"{n} · the sides cancel. Check it in mono.",es:"{n} · los lados se anulan. Escúchalo en mono."},
  spLab:{en:"Spectrum",es:"Espectro"}, spAria:{en:"How loud the deep, middle and bright sounds are",es:"Qué tan fuertes suenan los graves, los medios y los agudos"},
  spLo:{en:"Deep",es:"Graves"}, spHi:{en:"Bright",es:"Agudos"},
  gpLine:{en:"Tracks in the same group move their faders together.",es:"Las pistas del mismo grupo mueven sus faders juntas."},
  gpNone:{en:"No group",es:"Sin grupo"}, gp_drums:{en:"Drums",es:"Batería"}, gp_vocals:{en:"Vocals",es:"Voces"}, gp_inst:{en:"Instruments",es:"Instrumentos"},
  gpAria:{en:"Group for track {n}",es:"Grupo de la pista {n}"},
  gpMoves:{en:"{g} moves together: {list}.",es:"{g} se mueve junto: {list}."}
};
Object.assign(STR, DP_STR);
const DP={open:false, view:"rt", gb:null, at:0, grAt:0, l:null, r:null, corr:null, cs:0, draws:0, spec:null, sbuf:null, eqc:null, msg:""};
const PM_VIEWS=["rt","eq","gl","lim","mt","gp","ab"];
try{ const v=localStorage.getItem("aog.studio.pm.v1"); if(PM_VIEWS.indexOf(v)>=0) DP.view=v; }catch(e){}
const DP_CSS=`
.st-pm{margin-top:12px}
.st-pm [hidden]{display:none!important}
.st-pmi{display:grid;gap:.7rem;padding:0 12px 12px}
.st-pmi .st-pick{max-width:24rem}
.st-pmp{display:grid;gap:.6rem;padding:.7rem .8rem;border-radius:10px;border:1px solid #0a0a0c;background:linear-gradient(#111215,#191a1e);box-shadow:inset 0 2px 6px rgba(0,0,0,.7)}
.st-pmk{display:grid;gap:.25rem .9rem;grid-template-columns:repeat(auto-fit,minmax(10.5rem,1fr))}
.st-pmk .st-sl input{accent-color:#f0c26e}
.st-pmr{display:flex;flex-wrap:wrap;gap:.5rem .7rem;align-items:flex-end}
.st-pmr .st-field{flex:1 1 12rem}
.st-pmr .st-btn{flex:0 0 auto}
.st-eqc{display:block;width:100%;height:auto;max-height:150px;border-radius:8px;background:#0b0c0e}
.st-eqc .g{stroke:#3a3e45;stroke-width:1;vector-effect:non-scaling-stroke}
.st-eqc .z{stroke:#6b6f76;stroke-width:1;vector-effect:non-scaling-stroke}
.st-eqc .c{fill:none;stroke:#f0c26e;stroke-width:2.2;vector-effect:non-scaling-stroke}
.st-eqc text{fill:#d8cfbf;font:700 9px var(--sans)}
.st-stm{position:relative;height:28px;border-radius:8px;background:linear-gradient(90deg,#3a1f1b 0,#3a1f1b 50%,#1c3326 50%,#1c3326 100%);box-shadow:inset 0 2px 5px rgba(0,0,0,.7)}
.st-stm i{position:absolute;top:3px;bottom:3px;width:4px;margin-left:-2px;border-radius:2px;background:#ffe2a8;left:50%}
.st-stm i[hidden]{display:none}
.st-stl{display:flex;justify-content:space-between;font:700 .78rem/1.2 var(--sans);color:#d8cfbf}
.st-spc{display:block;width:100%;height:110px;border-radius:8px;background:#0b0c0e}
.st-gtag{display:block;margin:.3rem 0 0;padding:0 .2rem;font:800 .66rem/1.2 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:#e3c98d;min-height:1.2em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-gpr{display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))}
`;
function dpCss(){ if(document.getElementById("aog-desk-pro-css")) return; const s=document.createElement("style"); s.id="aog-desk-pro-css"; s.textContent=DP_CSS; document.head.appendChild(s); }
function dpNum(v, d){ const s=(+v).toFixed(d); return S.lang==="es" ? s.replace(".", ",") : s; }
function dpDb(v){ const s=(v>0 ? "+" : v<0 ? "−" : "")+dpNum(Math.abs(v), Math.abs(v)%1 ? 1 : 0)+" dB"; return s; }
/* a slider of the panel: k, its words, lo, hi, step, value, the words for its value */
function dpSl(id, lab, lo, hi, st, v, w, cls){
  return `<label class="st-sl ${cls||""}" for="${id}"><span class="st-lab">${esc(t(lab))}</span><output id="${id}-o">${esc(w)}</output>`+
    `<input type="range" id="${id}" data-pm="${id.slice(3)}" min="${lo}" max="${hi}" step="${st}" value="${v}" aria-valuetext="${esc(w)}"></label>`;
}
function dpOnBtn(id, w, on){ return `<button type="button" class="st-btn" id="${id}" aria-pressed="${on ? "true" : "false"}">${esc(t(on ? "onOff" : "offOn", {w:t(w)}))}</button>`; }
/* the words for each of the panel's sliders */
const DP_K={
  rvRet:{lo:0, hi:100, st:1, get:m=>m.rvRet==null ? 80 : m.rvRet, w:v=>volDb(v)},
  dlRet:{lo:0, hi:100, st:1, get:m=>m.dlRet==null ? 80 : m.dlRet, w:v=>volDb(v)},
  low:{lo:-12, hi:12, st:1, get:m=>m.low, w:v=>dpDb(v), cls:"eq"}, mid:{lo:-12, hi:12, st:1, get:m=>m.mid, w:v=>dpDb(v), cls:"eq"}, high:{lo:-12, hi:12, st:1, get:m=>m.high, w:v=>dpDb(v), cls:"eq"},
  glue:{lo:0, hi:100, st:1, get:m=>m.glue, w:v=>String(Math.round(v)), cls:"pu"},
  thr:{lo:-40, hi:0, st:0.5, get:m=>glueEff(m).thr, w:v=>dpDb(v), cls:"pu"},
  ratio:{lo:1, hi:10, st:0.1, get:m=>glueEff(m).ratio, w:v=>dpNum(v, 1)+" : 1", cls:"pu"},
  mk:{lo:0, hi:12, st:0.5, get:m=>glueEff(m).mk, w:v=>dpDb(Math.round(v*2)/2), cls:"pu"}
};
function dpK(k, lab){ const K=DP_K[k], m=SONG.master, v=K.get(m), r=Math.round(v/K.st)*K.st; return dpSl("pm-"+k, lab, K.lo, K.hi, K.st, +r.toFixed(2), K.w(v), K.cls); }
function dpPane(){
  const m=SONG.master, v=DP.view;
  if(v==="rt") return `<p class="st-line" style="margin:0">${esc(t("rtLine"))}</p><div class="st-pmk">${dpK("rvRet","rvRet")}${dpK("dlRet","dlRet")}</div>`;
  if(v==="eq") return `<div class="st-pmr">${dpOnBtn("pmEqOn","eqW",!m.eqOff)}<label class="st-field"><span class="st-lab">${esc(t("lcLab"))}</span><select id="pmLc">`+
      LCUTS.map(h=>`<option value="${h}"${(m.lc||0)===h?" selected":""}>${esc(h ? t("lcHz",{n:h}) : t("lcOff"))}</option>`).join("")+`</select></label></div>`+
    `<div class="st-pmk">${dpK("low","low")}${dpK("mid","mid")}${dpK("high","high")}</div>`+
    `<svg class="st-eqc" id="pmEqC" viewBox="0 0 300 100" preserveAspectRatio="none" role="img" aria-label="${esc(t("eqAria"))}">${dpEqSvg()}</svg><p class="st-line" style="margin:0">${esc(t("eqLine"))}</p>`;
  if(v==="gl"){ const e=glueEff(m);
    return `<div class="st-pmr">${dpOnBtn("pmGlOn","glW",!m.glueOff)}<button type="button" class="st-btn" id="pmGlKnob"${e.hand ? "" : " hidden"}>${esc(t("glKnob"))}</button></div>`+
      `<div class="st-pmk">${dpK("glue","glAmt")}${dpK("thr","glThr")}${dpK("ratio","glRatio")}${dpK("mk","glMk")}</div>`+
      `<p class="st-line" style="margin:0" id="pmGlW">${esc(e.hand ? t("glHand") : t("glLine"))}</p><p class="st-gr" id="pmGr" aria-live="off">${esc(t("grRest2"))}</p>`; }
  if(v==="lim") return `<div class="st-pmr">${dpOnBtn("pmLimOn","limW",!m.limOff)}</div><p class="st-line" style="margin:0">${esc(t("limLine"))}</p><p class="st-gr" id="pmLr" aria-live="off">${esc(t("grRest2"))}</p>`;
  if(v==="mt") return `<p class="st-line" style="margin:0">${esc(t("mtLine"))}</p>`+
    `<div><span class="st-lab">${esc(t("stLab"))}</span><div class="st-stm" id="pmSt" role="img" aria-label="${esc(t("stAria"))}"><i id="pmStI" hidden></i></div><div class="st-stl" aria-hidden="true"><span>−1</span><span>0</span><span>+1</span></div><p class="st-gr" id="pmStW" aria-live="off">${esc(t("stRest"))}</p></div>`+
    `<div><span class="st-lab">${esc(t("spLab"))}</span><canvas class="st-spc" id="pmSp" role="img" aria-label="${esc(t("spAria"))}"></canvas><div class="st-stl" aria-hidden="true"><span>${esc(t("spLo"))}</span><span>${esc(t("spHi"))}</span></div></div>`;
  if(v==="gp"){ const by={}; SONG.tracks.forEach((x,i)=>{ if(x.grp) (by[x.grp]=by[x.grp]||[]).push(t("trackN",{n:i+1})); });
    const say=GROUPS.filter(g=>by[g] && by[g].length>1).map(g=>t("gpMoves",{g:t("gp_"+g), list:andList(by[g])})).join(" ");
    return `<p class="st-line" style="margin:0">${esc(t("gpLine"))}</p><div class="st-gpr">`+SONG.tracks.map((x,i)=>`<label class="st-field"><span class="st-lab">${esc(t("trackN",{n:i+1})+" · "+laneName(i))}</span><select id="pmG${i}" data-gp="${i}" aria-label="${esc(t("gpAria",{n:i+1}))}">`+
      [""].concat(GROUPS).map(g=>`<option value="${g}"${(x.grp||"")===g?" selected":""}>${esc(g ? t("gp_"+g) : t("gpNone"))}</option>`).join("")+`</select></label>`).join("")+`</div>`+
      (say ? `<p class="st-line" style="margin:0">${esc(say)}</p>` : ""); }
  if(v==="ab"){ if(window.AOGDeskRef) return `<div id="refPane">${AOGDeskRef.html()}</div>`; dpRefLoad(); return `<div id="refPane"><p class="st-gr">${esc(t("pmReady"))}</p></div>`; }
  return "";
}
/* AOG-DESK-REF-V1: Compare with a song is fetched the first time it is opened */
let DP_REFP=null;
function dpRefLoad(){ if(window.AOGDeskRef || DP_REFP) return; DP_REFP=true; const s=document.createElement("script"); s.src="/aog-desk-ref.js"; s.async=true; s.onerror=()=>{ DP_REFP=null; }; document.head.appendChild(s); }
/* AOG-DESK-LOOK-V2: each mixer strip says its group under its name (every strip keeps the line while any track has one) */
function dpGroupTags(){
  const any=SONG.tracks.some(x=>x.grp);
  document.querySelectorAll("#mixer .st-strip").forEach(el=>{ const i=+el.getAttribute("data-tr"), g=SONG.tracks[i] && SONG.tracks[i].grp; let tag=el.querySelector(".st-gtag");
    if(!any){ if(tag) tag.remove(); return; }
    if(!tag){ tag=document.createElement("span"); tag.className="st-gtag"; const sh=el.querySelector(".st-sh"); if(sh) sh.insertAdjacentElement("afterend", tag); else el.prepend(tag); }
    const w=g ? t("gp_"+g) : "\u00a0"; if(tag.textContent!==w) tag.textContent=w; });
}
function dpPaint(force){
  const box=document.getElementById("proMaster"); if(!box) return;
  dpCss(); dpGroupTags();
  let h=`<details class="st-more st-pm" id="pmBox"${DP.open?" open":""}><summary>${esc(t("pmSum"))}</summary>`;
  if(DP.open) h+=`<div class="st-pmi"><label class="st-field st-pick"><span class="st-lab">${esc(t("pmShow"))}</span><select id="pmView">`+
    PM_VIEWS.map(k=>`<option value="${k}"${k===DP.view?" selected":""}>${esc(t("pm_"+k))}</option>`).join("")+`</select></label><div class="st-pmp">${dpPane()}</div></div>`;
  h+=`</details>`;
  /* a slider being moved keeps its place: only its words change (dpSync) */
  if(!force && box._h===h) return;
  const fa=document.activeElement;
  if(!force && fa && box.contains(fa) && fa.type==="range" && box._v===DP.view+DP.open){ dpSync(); return; }
  const keep=fa && box.contains(fa) ? fa.id : "";
  box._h=h; box._v=DP.view+DP.open; box.innerHTML=h;
  if(keep){ const el=document.getElementById(keep); if(el) try{ el.focus({preventScroll:true}); }catch(e){} }
  if(DP.view==="mt") dpRest();
}
/* the panel's sliders, after a change somewhere else (the master strip, Undo) */
function dpSync(){
  Object.keys(DP_K).forEach(k=>{ const r=document.getElementById("pm-"+k); if(!r || document.activeElement===r) return; const K=DP_K[k], v=K.get(SONG.master);
    if(Math.abs(+r.value-v)>1e-9) r.value=String(v); const o=document.getElementById(r.id+"-o"), w=K.w(v); if(o && o.textContent!==w) o.textContent=w; r.setAttribute("aria-valuetext", w); });
  const c=document.getElementById("pmEqC"); if(c) c.innerHTML=dpEqSvg();
  const hand=!!SONG.master.gc, kb=document.getElementById("pmGlKnob"), gw=document.getElementById("pmGlW");
  if(kb) kb.hidden=!hand; if(gw){ const w=t(hand ? "glHand" : "glLine"); if(gw.textContent!==w) gw.textContent=w; }
  const box=document.getElementById("proMaster"); if(box) box._h=null;   /* the panel was changed in place: the next paint builds it again */
}
/* ══ the EQ's curve: what the four filters do together, worked out by the browser's own filters (never played) ══ */
function dpEqSvg(){
  const m=SONG.master, N=120, F=new Float32Array(N), mag=new Float32Array(N), ph=new Float32Array(N), tot=new Float32Array(N).fill(1);
  for(let i=0;i<N;i++) F[i]=20*Math.pow(1000, i/(N-1));
  try{
    if(!DP.eqc){ const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext, c=new OC(1, 128, MIX_SR), B=(ty,f,q)=>{ const b=c.createBiquadFilter(); b.type=ty; b.frequency.value=f; if(q!=null) b.Q.value=q; return b; };
      DP.eqc={lc:B("highpass",30,Math.SQRT1_2), lo:B("lowshelf",120), mi:B("peaking",1000,0.8), hi:B("highshelf",7000)}; }
    const E=DP.eqc, on=!m.eqOff;
    E.lo.gain.value=on ? m.low : 0; E.mi.gain.value=on ? m.mid : 0; E.hi.gain.value=on ? m.high : 0; E.lc.frequency.value=m.lc||30;
    const L=[E.lo, E.mi, E.hi]; if(on && m.lc>0) L.push(E.lc);
    L.forEach(b=>{ b.getFrequencyResponse(F, mag, ph); for(let i=0;i<N;i++) tot[i]*=mag[i]; });
  }catch(e){}
  const y=db=>50-Math.max(-24, Math.min(24, db))*50/24*0.9;
  let d=""; for(let i=0;i<N;i++){ const x=i/(N-1)*300; d+=(i?"L":"M")+x.toFixed(1)+" "+y(20*Math.log10(tot[i]||1e-6)).toFixed(1); }
  const gx=f=>(Math.log(f/20)/Math.log(1000)*300).toFixed(1);
  return [100,1000,10000].map(f=>`<line class="g" x1="${gx(f)}" y1="0" x2="${gx(f)}" y2="100"/><text x="${+gx(f)+3}" y="96">${f>=1000 ? f/1000+"k" : f}</text>`).join("")+
    `<line class="z" x1="0" y1="50" x2="300" y2="50"/><path class="c" d="${d}"/>`;
}
/* ══ while the song plays: the Glue's and the limiter's holding back, the stereo meter and the spectrum. Twice a second on a
   touch screen or with "reduce motion" (as the loudness meter), about 30 times a second on a computer; never while stopped ══ */
function dpFrame(now){
  if(!DP.open || !LIVE) return;
  const pn=performance.now(), slow=stillMeter();
  if(pn-DP.grAt>=500){ DP.grAt=pn;
    const g=document.getElementById("pmGr"), l=document.getElementById("pmLr");
    if(g){ const w=SONG.master.glueOff ? t("grRest2") : t("grNow2",{n:dpNum(Math.abs(LIVE.glue.reduction||0), 1)}); if(g.textContent!==w) g.textContent=w; }
    if(l){ const w=SONG.master.limOff ? t("grRest2") : t("grNow2",{n:dpNum(Math.abs(LIVE.lim.reduction||0), 1)}); if(l.textContent!==w) l.textContent=w; } }
  if(DP.view!=="mt" || pn-DP.at<(slow ? 500 : 33)) return; DP.at=pn;
  dpStereo(slow); dpSpectrum();
}
function dpStereo(slow){
  const A=window.__aogStudio && __aogStudio.AN; if(!A) return;
  const n=A.a[0].fftSize; if(!DP.l || DP.l.length!==n){ DP.l=new Float32Array(n); DP.r=new Float32Array(n); }
  A.a[0].getFloatTimeDomainData(DP.l); A.a[1].getFloatTimeDomainData(DP.r);
  let lr=0, ll=0, rr=0; for(let i=0;i<n;i++){ const a=DP.l[i], b=DP.r[i]; lr+=a*b; ll+=a*a; rr+=b*b; }
  const c=(ll>1e-9 && rr>1e-9) ? lr/Math.sqrt(ll*rr) : (ll+rr>1e-9 ? 0 : null);
  if(c==null) return;
  DP.corr=DP.corr==null || slow ? c : DP.corr*0.7+c*0.3; DP.cs++;
  const i=document.getElementById("pmStI"), w=document.getElementById("pmStW"), v=DP.corr;
  if(i){ i.hidden=false; i.style.left=((v+1)/2*100).toFixed(1)+"%"; }
  if(w){ const n2=(v>=0 ? "+" : "−")+dpNum(Math.abs(v), 2), s=t(v>0.9 ? "stMono" : v>=0 ? "stWide" : "stCancel", {n:n2}); if(w.textContent!==s) w.textContent=s; }
}
function dpSpectrum(){
  const cv=document.getElementById("pmSp"); if(!cv || !ac || !LIVE) return;
  if(!DP.spec){ try{ const a=ac.createAnalyser(), z=ac.createGain(); a.fftSize=4096; a.smoothingTimeConstant=0.7; z.gain.value=0; LIVE.out.connect(a); a.connect(z); z.connect(ac.destination); DP.spec=a; DP.sbuf=new Float32Array(a.frequencyBinCount); }catch(e){ return; } }
  DP.spec.getFloatFrequencyData(DP.sbuf);
  const r=cvRect(cv), dpr=Math.min(2, window.devicePixelRatio||1), W=Math.max(1, Math.round(r.width*dpr)), H=Math.max(1, Math.round(r.height*dpr));
  if(cv.width!==W || cv.height!==H){ cv.width=W; cv.height=H; }
  const g=cv.getContext("2d"), nb=48, sr=ac.sampleRate, bins=DP.sbuf.length; g.clearRect(0,0,W,H);
  g.fillStyle="#f0c26e";
  for(let k=0;k<nb;k++){
    const f0=30*Math.pow(16000/30, k/nb), f1=30*Math.pow(16000/30, (k+1)/nb), i0=Math.max(1, Math.floor(f0/sr*2*bins)), i1=Math.max(i0+1, Math.ceil(f1/sr*2*bins));
    let m=-140; for(let i=i0;i<i1 && i<bins;i++) if(DP.sbuf[i]>m) m=DP.sbuf[i];
    const h=Math.max(0, Math.min(1, (m+96)/84))*H, bw=W/nb;
    g.fillRect(Math.round(k*bw)+1, H-h, Math.max(1, Math.round(bw)-2), h);
  }
  DP.draws++;
}
/* stopped: the meters rest, still */
function dpRest(){
  const g=document.getElementById("pmGr"), l=document.getElementById("pmLr"), i=document.getElementById("pmStI"), w=document.getElementById("pmStW"), cv=document.getElementById("pmSp");
  [g, l].forEach(el=>{ if(el) el.textContent=t("grRest2"); });
  if(i) i.hidden=true; if(w) w.textContent=t("stRest"); DP.corr=null;
  if(cv){ const r=cv.getBoundingClientRect(), dpr=Math.min(2, window.devicePixelRatio||1); cv.width=Math.max(1, Math.round(r.width*dpr)); cv.height=Math.max(1, Math.round(r.height*dpr)); }
}
/* ══ AOG-DESK-GROUPS-V1 · a group's faders move together: each one by the same number of decibels as the one you move
   (each keeps its balance with the others), from where they all were when the move began. One Undo for all of them. ══ */
function dpGroupMove(i, v){
  const x=SONG.tracks[i], g=x.grp; if(!g) return;
  const now=Date.now();
  if(!DP.gb || DP.gb.i!==i || now-DP.gb.t>1500) DP.gb={i:i, base:SONG.tracks.map(y=>y.vol)};
  DP.gb.t=now;
  const b0=DP.gb.base[i];
  SONG.tracks.forEach((y,j)=>{ if(j===i || y.grp!==g || lineOf(j,"vol")) return;
    const bj=DP.gb.base[j]; let nv=b0>0 ? bj*v/b0 : bj+(v-b0); nv=Math.round(Math.max(0, Math.min(100, nv)));
    if(nv===y.vol) return; y.vol=nv; liveApply(E=>applyTrack(E,j)); const r=document.getElementById("t"+j+"-vol"); if(r) syncSlider(r, nv); });
}
/* ══ wiring ══ */
function dpSet(fn, tag){ dmRemember("mix", SONG.sel, tag||""); fn(SONG.master); save(); liveApply(applyMaster); paintMixer(); dpPaint(); }
function dpInit(){
  dpCss();
  const box=document.getElementById("proMaster"); if(!box) return;
  box.addEventListener("toggle", e=>{ if(e.target.id!=="pmBox") return; DP.open=e.target.open; dpPaint(); }, true);
  box.addEventListener("change", e=>{ const el=e.target;
    if(el.id==="pmView"){ DP.view=el.value; try{ localStorage.setItem("aog.studio.pm.v1", DP.view); }catch(er){} dpPaint(); return; }
    if(el.id==="pmLc"){ const h=+el.value; dpSet(m=>{ if(h>0) m.lc=h; else delete m.lc; }); return; }
    if(el.hasAttribute("data-gp")){ const i=+el.getAttribute("data-gp"), g=el.value; if(GROUPS.indexOf(g)>=0) SONG.tracks[i].grp=g; else delete SONG.tracks[i].grp; DP.gb=null; save(); dpPaint(true); return; }
    if(el.type==="range") DP.gb=null;
  });
  box.addEventListener("input", e=>{ const el=e.target, k=el.getAttribute && el.getAttribute("data-pm"); if(!k || !DP_K[k]) return;
    const K=DP_K[k], v=Math.max(K.lo, Math.min(K.hi, +el.value)), m=SONG.master;
    dmRemember("mix", SONG.sel, "pm|"+k);
    if(k==="rvRet" || k==="dlRet"){ if(Math.round(v)===80) delete m[k]; else m[k]=Math.round(v); }
    else if(k==="low" || k==="mid" || k==="high"){ m[k]=Math.round(v); }
    else if(k==="glue"){ m.glue=Math.round(v); delete m.gc; }
    else { const e2=glueEff(m), gc={thr:e2.thr, ratio:e2.ratio, mk:Math.round(e2.mk*2)/2}; gc[k]=v; m.gc={thr:Math.round(gc.thr*2)/2, ratio:Math.round(gc.ratio*10)/10, mk:Math.round(gc.mk*2)/2}; }
    const o=document.getElementById(el.id+"-o"), w=K.w(K.get(m)); if(o) o.textContent=w; el.setAttribute("aria-valuetext", w);
    liveApply(applyMaster); saveSoon();
    ["low","mid","high","glue"].forEach(q=>{ const r=document.getElementById("m-"+q); if(r) syncSlider(r, m[q]); });
    dpSync();
  });
  box.addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("button"); if(!b) return;
    if(b.id==="pmEqOn") dpSet(m=>{ if(m.eqOff) delete m.eqOff; else m.eqOff=true; });
    else if(b.id==="pmGlOn") dpSet(m=>{ if(m.glueOff) delete m.glueOff; else m.glueOff=true; });
    else if(b.id==="pmLimOn") dpSet(m=>{ if(m.limOff) delete m.limOff; else m.limOff=true; });
    else if(b.id==="pmGlKnob") dpSet(m=>{ delete m.gc; });
    const n=document.getElementById(b.id); if(n) try{ n.focus({preventScroll:true}); }catch(er){}
  });
  /* the master strip's own knobs: the panel follows */
  const ms=document.getElementById("master"); if(ms) ms.addEventListener("input", ()=>dpSync());
  /* a fader let go: the next move of a group starts from where they all are */
  document.addEventListener("change", e=>{ if(e.target && e.target.type==="range") DP.gb=null; }, true);
  document.addEventListener("pointerup", ()=>{ DP.gb=null; }, true);
  dpPaint(true);
  dpKeys();
}
/* ══ AOG-DESK-KEYS-V2 (2026-10-17) · more keys on a computer: R records your voice, L turns the loop on or off, ← → nudge
   the piece 10 ms (Shift: a beat), Ctrl/⌘ + D copies the piece after itself, Ctrl/⌘ + E cuts it at the playhead. A key
   presses what a finger would, so the desk's own rules and Undo follow. Typing in a box keeps its keys. ══ */
/* AOG-DESK-LOOK-V2 (2026-10-17, Jimmy: faders and knobs that "double-tap to reset"): a double tap (or a double click) puts a
   fader or knob back where it starts; it moves the slider itself, so the desk's own rules and Undo follow */
const DP_HOME={vol:80, pan:0, low:0, mid:0, high:0, punch:0, room:0, echo:0};
function dpHomeOf(r){
  const id=r.id||"", k=r.getAttribute("data-k"), pm=r.getAttribute("data-pm");
  if(pm) return {rvRet:80, dlRet:80, low:0, mid:0, high:0, glue:30}[pm];
  if(r.closest("#master")) return k==="glue" ? 30 : k==="vol" ? 80 : DP_HOME[k];
  if(r.hasAttribute("data-fv") || id==="cv-vol") return 80;
  if(id==="drLvl") return 60;
  return k ? DP_HOME[k] : undefined;
}
function dpHome(r){ const v=dpHomeOf(r); if(v==null || r.disabled) return; r.value=String(v); r.dispatchEvent(new Event("input", {bubbles:true})); r.dispatchEvent(new Event("change", {bubbles:true})); DP.homed=(DP.homed||0)+1; }
function dpTwoTaps(){
  document.addEventListener("dblclick", e=>{ const r=e.target; if(r && r.type==="range" && r.closest("#desk")) dpHome(r); }, true);
  /* a finger: two taps on the same slider within 350 ms, close together (a touch ends with touchend; a pen with pointerup) */
  let last={el:null, t:0, x:0, y:0};
  const tap=(r, x, y)=>{ if(!r || r.type!=="range" || !r.closest("#desk")) return; const now=performance.now();
    if(now-last.t<20 && last.el===r) return;   /* the same tap, told twice */
    if(last.el===r && now-last.t<350 && Math.hypot(x-last.x, y-last.y)<24){ last={el:null, t:now, x:x, y:y}; dpHome(r); } else last={el:r, t:now, x:x, y:y}; };
  document.addEventListener("touchend", e=>{ const p=e.changedTouches && e.changedTouches[0]; if(p) tap(e.target, p.clientX, p.clientY); }, {capture:true, passive:true});
  document.addEventListener("pointerup", e=>{ if(e.pointerType==="pen") tap(e.target, e.clientX, e.clientY); }, true);
}
function dpKeys(){
  dpTwoTaps();
  document.addEventListener("keydown", e=>{
    const el=e.target, tg=el && el.tagName;
    if(tg==="INPUT" || tg==="SELECT" || tg==="TEXTAREA" || (el && el.isContentEditable)) return;
    if(window.AOGPianoRoll && AOGPianoRoll.isOpen && AOGPianoRoll.isOpen()) return;
    const mod=(e.ctrlKey || e.metaKey) && !e.altKey, i=SONG.sel, c=SONG.tracks[i] && SONG.tracks[i].clip, keys=()=>document.documentElement.classList.add("aog-keys");
    if(mod && !e.shiftKey && (e.code==="KeyD" || e.code==="KeyE")){ e.preventDefault(); keys(); if(e.repeat || !c) return;
      if(e.code==="KeyD") clipAct("copy"); else dmSplit();
      const tl=document.getElementById("tlLine"); if(tl && S.edMsg) tl.textContent=S.edMsg; return; }
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    if(e.code==="KeyR"){ e.preventDefault(); keys(); if(!e.repeat && window.AOGStudioRec) AOGStudioRec.toggle(); return; }
    if(e.code==="KeyL"){ e.preventDefault(); keys(); if(!e.repeat){ const b=document.getElementById("loopBtn"); if(b) b.click(); } return; }
    if(e.code==="ArrowLeft" || e.code==="ArrowRight"){ e.preventDefault(); keys(); if(c) clipAct((e.shiftKey ? "beat" : "nudge")+(e.code==="ArrowLeft" ? "-" : "+")); return; }
  });
}
dpInit();
/* for the tests (music-handoff/tests/desk/) */
window.__aogDeskPro={ DP:DP, dpPaint:dpPaint, dpGroupMove:dpGroupMove, dpEqSvg:dpEqSvg, dpRest:dpRest };
