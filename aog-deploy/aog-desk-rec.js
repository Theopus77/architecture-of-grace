"use strict";
/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   AOG-DESK-REC-V1 (2026-10-17) — the Mixing Desk (music-studio.html), recording like a pro. Loaded with defer; names
   begin with dr or DR_. What changes a recording or a song lives in the desk's page (voiceStop, proCleanMore); this is
   the click, the strip on the song, and the panel.
   · the loop (the desk's own: SONG.loopOn, loopFrom, loopTo) shown on the song as a band you can drag by its ends;
   · punch in and out (SONG.punchOn, SONG.punch {a, b} in bars): Record your voice replaces only those bars;
   · a take each time round (SONG.lrec): recorded while the loop plays, each pass is a take of its own (the takes and
     comping of AOG-DESK-TAKES-V1);
   · the click (AOG-DESK-CLICK-V1): on every beat, or every 1/8 or 1/16, with the first beat of each bar stronger, at its
     own level, and the count-in of one or two bars; straight to the speakers, never into the mix, a bounce or a meter;
     kept on this device (aog.studio.click.v1);
   · markers (SONG.marks [{b: bar, w: name}]): named on the song, and Go to one.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const DR_STR={
  drSum:{en:"Loop, punch, click and markers",es:"Bucle, pinchazo, clic y marcas"},
  drShow:{en:"Show",es:"Mostrar"},
  dr_lp:{en:"Loop and punch",es:"Bucle y pinchazo"}, dr_ck:{en:"The click",es:"El clic"}, dr_mk:{en:"Markers",es:"Marcas"},
  lpLine:{en:"Drag the ends of the loop on the song, or pick its bars.",es:"Arrastra los extremos del bucle en la canción o elige sus compases."},
  lpOn:{en:"Loop: On",es:"Bucle: encendido"}, lpOff:{en:"Loop: Off",es:"Bucle: apagado"},
  puOn:{en:"Punch: On",es:"Pinchazo: encendido"}, puOff:{en:"Punch: Off",es:"Pinchazo: apagado"},
  puFrom:{en:"Punch in at",es:"Entrar en"}, puTo:{en:"Punch out after",es:"Salir después de"},
  puLine:{en:"Record your voice changes only bars {a} to {b}. The rest stays.",es:"Grabar tu voz cambia solo los compases {a} a {b}. El resto se queda."},
  lrOn:{en:"A take each time round: On",es:"Una toma en cada vuelta: encendido"}, lrOff:{en:"A take each time round: Off",es:"Una toma en cada vuelta: apagado"},
  lrLine:{en:"While the loop plays, each time round is a take of its own. Pick the best bits in Takes.",es:"Mientras suena el bucle, cada vuelta es una toma propia. Elige los mejores trozos en Tomas."},
  lrNeed:{en:"Turn the loop on to record a take each time round.",es:"Enciende el bucle para grabar una toma en cada vuelta."},
  ckOn:{en:"Click: On",es:"Clic: encendido"}, ckOff:{en:"Click: Off",es:"Clic: apagado"},
  ckLvl:{en:"Click level",es:"Volumen del clic"}, ckAcc:{en:"Strong first beat",es:"Primer pulso fuerte"},
  ckAccOn:{en:"Strong first beat: On",es:"Primer pulso fuerte: encendido"}, ckAccOff:{en:"Strong first beat: Off",es:"Primer pulso fuerte: apagado"},
  ckSub:{en:"Clicks on",es:"Clics en"}, ckSub1:{en:"Every beat",es:"Cada pulso"}, ckSub2:{en:"Every 1/8",es:"Cada 1/8"}, ckSub4:{en:"Every 1/16",es:"Cada 1/16"},
  ckCnt:{en:"Count-in",es:"Cuenta previa"}, ckCnt0:{en:"Off",es:"Apagada"}, ckCnt1:{en:"1 bar",es:"1 compás"}, ckCnt2:{en:"2 bars",es:"2 compases"},
  ckLine:{en:"The click goes to your speakers only. It is never in the mix.",es:"El clic va solo a tus altavoces. Nunca está en la mezcla."},
  mkGo:{en:"Go to",es:"Ir a"}, mkPick:{en:"Pick a marker",es:"Elige una marca"}, mkNone:{en:"No markers yet",es:"Todavía no hay marcas"},
  mkOpt:{en:"Bar {n} · {w}",es:"Compás {n} · {w}"}, mkAdd:{en:"+ Marker at bar {n}",es:"+ Marca en el compás {n}"},
  mkName:{en:"Its name",es:"Su nombre"}, mkDel:{en:"Remove this marker",es:"Quitar esta marca"},
  mkDef:{en:"Marker {n}",es:"Marca {n}"}, mkAt:{en:"Now at bar {n}: {w}.",es:"Ahora en el compás {n}: {w}."},
  mkMade:{en:"Marker at bar {n}.",es:"Marca en el compás {n}."}, mkGone:{en:"The marker is gone.",es:"La marca ya no está."},
  mkAria:{en:"Go to bar {n}: {w}",es:"Ir al compás {n}: {w}"},
  cyLab:{en:"Loop",es:"Bucle"}, cyAria:{en:"The loop, bars {a} to {b}. Drag an end to change it.",es:"El bucle, compases {a} a {b}. Arrastra un extremo para cambiarlo."},
  puAria:{en:"Punch, bars {a} to {b}",es:"Pinchazo, compases {a} a {b}"},
  cySaid:{en:"The loop is bars {a} to {b}.",es:"El bucle son los compases {a} a {b}."},
  puSaid:{en:"The punch is bars {a} to {b}.",es:"El pinchazo son los compases {a} a {b}."}
};
Object.assign(STR, DR_STR);
const DR={open:false, view:"lp", mk:-1, drag:null, mlog:[], mo:[], mwArr:null, say:""};
const DR_CK_KEY="aog.studio.click.v1";
const CK={on:false, lvl:60, acc:true, sub:1, cnt:1};
try{ const v=JSON.parse(localStorage.getItem(DR_CK_KEY)||"null"); if(v && typeof v==="object"){ CK.on=!!v.on; CK.lvl=num(v.lvl,0,100,60); CK.acc=v.acc!==false; CK.sub=[1,2,4].indexOf(v.sub)>=0 ? v.sub : 1; CK.cnt=[1,2].indexOf(v.cnt)>=0 ? v.cnt : 1; } }catch(e){}
try{ const v=localStorage.getItem("aog.studio.dr.v1"); if(["lp","ck","mk"].indexOf(v)>=0) DR.view=v; }catch(e){}
function drCkSave(){ try{ localStorage.setItem(DR_CK_KEY, JSON.stringify(CK)); }catch(e){} }
const DR_CSS=`
.st-dr{margin-top:10px}
.st-dr [hidden]{display:none!important}
.st-dri{display:grid;gap:.7rem;padding:0 12px 12px}
.st-cp .st-dri{padding:0 4px 10px}
.st-dri .st-pick{max-width:24rem}
.st-drp{display:grid;gap:.6rem;padding:.7rem .8rem;border-radius:10px;border:1px solid #0a0a0c;background:linear-gradient(#111215,#191a1e);box-shadow:inset 0 2px 6px rgba(0,0,0,.7)}
.st-drr{display:flex;flex-wrap:wrap;gap:.5rem .7rem;align-items:flex-end}
.st-drr .st-field{flex:1 1 9rem}
.st-drr .st-btn{flex:0 0 auto}
.st-drp .st-sl input{accent-color:#f0c26e}
.st-desk .st-cyr{display:grid;grid-template-columns:var(--lab) minmax(0,1fr);border-bottom:1px solid #2a2d32}
.st-tl.zoomed>.st-cyr{width:calc(var(--lab) + (100cqw - var(--lab)) * var(--z,1))}
.st-desk .st-cyn{min-height:48px;font:700 .68rem/1.1 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:#d8cfbf;display:flex;align-items:center;padding-left:6px}
.st-cyt{position:relative;display:block;min-height:48px;background:#0d0e10}
.st-cyb{position:absolute;top:3px;bottom:3px;border-radius:5px;border:1px solid #5b8fd6;background:rgba(91,143,214,.20);touch-action:pan-y}
.st-cyb b{position:absolute;left:14px;top:50%;transform:translateY(-50%);font:700 .78rem/1 var(--sans);color:#d8e7ff;white-space:nowrap;pointer-events:none}
.st-puc{position:absolute;top:9px;bottom:9px;border-radius:3px;background:rgba(244,163,122,.55);border:1px solid #f4a37a;pointer-events:none}
.st-cyh{position:absolute;top:0;bottom:0;width:22px;cursor:ew-resize;touch-action:none}
.st-cyh::before{content:"";position:absolute;top:22%;bottom:22%;left:50%;width:3px;margin-left:-1.5px;border-radius:2px;background:#9cc0f0}
.st-cyh.a{left:-8px}.st-cyh.b{right:-8px}
.st-mkf{position:absolute;top:2px;bottom:2px;min-width:44px;transform:translateX(-1px);display:flex;align-items:center;padding:0 6px;border:0;border-left:3px solid #f0c26e;border-radius:0 6px 6px 0;
  background:linear-gradient(90deg,rgba(240,194,110,.32),rgba(240,194,110,.10));color:#ffe9b8;font:700 .76rem/1 var(--sans);white-space:nowrap;overflow:hidden;cursor:pointer;touch-action:manipulation}
.st-mkf:focus-visible{outline:3px solid #c9a24b;outline-offset:1px}
`;
function drCss(){ if(document.getElementById("aog-desk-rec-css")) return; const s=document.createElement("style"); s.id="aog-desk-rec-css"; s.textContent=DR_CSS; document.head.appendChild(s); }
function drBtn(id, on, a, b){ return `<button type="button" class="st-btn" id="${id}" aria-pressed="${on ? "true" : "false"}">${esc(t(on ? a : b))}</button>`; }
function drBars(id, lab, lo, hi, sel){ return `<label class="st-field"><span class="st-lab">${esc(t(lab))}</span><select id="${id}">${dmBarOpts(lo, hi, sel)}</select></label>`; }
function drPunch(){ const P=SONG.punch||{a:SONG.loopFrom, b:SONG.loopTo}; return {a:P.a, b:P.b}; }
/* where a marker would go now: the bar the song is playing, else where it starts */
function drHereBar(){ if(PLAY.on && ac){ const pos=songPos(ac.currentTime); if(pos!=null) return Math.max(1, Math.min(MAX_BARS, Math.floor(pos/barSec()+1e-6)+1)); } return SONG.loopOn ? SONG.loopFrom : SONG.startBar; }
function drMkName(m, k){ return m.w || t("mkDef",{n:k+1}); }
function drPane(){
  const v=DR.view, n=tlBars();
  if(v==="lp"){ const P=drPunch();
    return `<p class="st-line" style="margin:0">${esc(t("lpLine"))}</p><div class="st-drr">${drBtn("drLoop", SONG.loopOn, "lpOn", "lpOff")}${drBars("drLf","tkFrom",1,n,SONG.loopFrom)}${drBars("drLt","tkTo",1,n,SONG.loopTo)}</div>`+
      `<div class="st-drr">${drBtn("drPunch", !!SONG.punchOn, "puOn", "puOff")}${drBars("drPa","puFrom",1,n,P.a)}${drBars("drPb","puTo",1,n,P.b)}</div>`+
      (SONG.punchOn ? `<p class="st-line" style="margin:0">${esc(t("puLine",{a:P.a, b:P.b}))}</p>` : "")+
      `<div class="st-drr">${drBtn("drLrec", !!SONG.lrec, "lrOn", "lrOff")}</div><p class="st-line" style="margin:0">${esc(t(SONG.lrec && !SONG.loopOn ? "lrNeed" : "lrLine"))}</p>`; }
  if(v==="ck") return `<div class="st-drr">${drBtn("drCk", CK.on, "ckOn", "ckOff")}${drBtn("drAcc", CK.acc, "ckAccOn", "ckAccOff")}</div>`+
    `<div class="st-drr"><label class="st-field"><span class="st-lab">${esc(t("ckSub"))}</span><select id="drSub">${[1,2,4].map(s=>`<option value="${s}"${CK.sub===s?" selected":""}>${esc(t("ckSub"+s))}</option>`).join("")}</select></label>`+
    `<label class="st-field"><span class="st-lab">${esc(t("ckCnt"))}</span><select id="drCnt">${[0,1,2].map(s=>`<option value="${s}"${(SONG.countIn ? CK.cnt : 0)===s?" selected":""}>${esc(t("ckCnt"+s))}</option>`).join("")}</select></label></div>`+
    `<label class="st-sl" for="drLvl"><span class="st-lab">${esc(t("ckLvl"))}</span><output id="drLvl-o">${esc(volDb(CK.lvl))}</output><input type="range" id="drLvl" min="0" max="100" step="1" value="${CK.lvl}" aria-valuetext="${esc(volDb(CK.lvl))}"></label>`+
    `<p class="st-line" style="margin:0">${esc(t("ckLine"))}</p>`;
  const M=SONG.marks||[], m=M[DR.mk];
  return `<div class="st-drr"><label class="st-field"><span class="st-lab">${esc(t("mkGo"))}</span><select id="drMk"><option value="">${esc(t(M.length ? "mkPick" : "mkNone"))}</option>`+
      M.map((q,k)=>`<option value="${k}"${k===DR.mk?" selected":""}>${esc(t("mkOpt",{n:q.b, w:drMkName(q,k)}))}</option>`).join("")+`</select></label>`+
      `<button type="button" class="st-btn st-go" id="drMkAdd">${esc(t("mkAdd",{n:drHereBar()}))}</button></div>`+
    (m ? `<div class="st-drr"><label class="st-field st-name"><span class="st-lab">${esc(t("mkName"))}</span><input type="text" id="drMkW" maxlength="24" autocomplete="off" enterkeyhint="done" value="${esc(m.w||"")}" placeholder="${esc(drMkName({},DR.mk))}"></label>`+
      drBars("drMkB","startsAt",1,MAX_BARS,m.b)+`<button type="button" class="st-btn st-clear" id="drMkDel">${esc(t("mkDel"))}</button></div>` : "");
}
function drPaint(force){
  const box=document.getElementById("drBox"); if(!box) return;
  drCss();
  let h=`<details class="st-more st-dr" id="drMore"${DR.open?" open":""}><summary>${esc(t("drSum"))}</summary>`;
  if(DR.open) h+=`<div class="st-dri"><label class="st-field st-pick"><span class="st-lab">${esc(t("drShow"))}</span><select id="drView">`+
    ["lp","ck","mk"].map(k=>`<option value="${k}"${k===DR.view?" selected":""}>${esc(t("dr_"+k))}</option>`).join("")+`</select></label><div class="st-drp">${drPane()}</div>`+
    `<p class="st-line" id="drLine" aria-live="polite">${esc(DR.say)}</p></div>`;
  h+=`</details>`;
  if(!force && box._h===h) return;
  const fa=document.activeElement;
  if(!force && fa && box.contains(fa) && (fa.type==="range" || fa.type==="text") && box._v===DR.view+DR.open+DR.mk) return;
  const keep=fa && box.contains(fa) ? fa.id : "";
  box._h=h; box._v=DR.view+DR.open+DR.mk; box.innerHTML=h;
  if(keep){ const el=document.getElementById(keep); if(el) try{ el.focus({preventScroll:true}); }catch(e){} }
}
/* ══ the strip on the song, under the ruler: the loop (its ends dragged, on a bar), the punch, the markers ══ */
function drTlRow(){
  const M=SONG.marks||[];
  if(!SONG.loopOn && !SONG.punchOn && !M.length) return "";
  const W=tlBars()*4, pc=b=>Math.max(0, Math.min(100, b/W*100)).toFixed(4);
  let h=`<div class="st-cyr"><span class="st-ln st-cyn"><span>${esc(t("cyLab"))}</span></span><span class="st-cyt" id="cyStrip">`;
  if(SONG.loopOn){ const a=(SONG.loopFrom-1)*4, b=SONG.loopTo*4;
    h+=`<span class="st-cyb" id="cyBand" style="left:${pc(a)}%;width:${(pc(b)-pc(a)).toFixed(4)}%" role="img" aria-label="${esc(t("cyAria",{a:SONG.loopFrom, b:SONG.loopTo}))}"><i class="st-cyh a" data-cy="a" aria-hidden="true"></i><b aria-hidden="true">${SONG.loopFrom}–${SONG.loopTo}</b><i class="st-cyh b" data-cy="b" aria-hidden="true"></i></span>`; }
  if(SONG.punchOn){ const P=drPunch(), a=(P.a-1)*4, b=P.b*4; h+=`<span class="st-puc" style="left:${pc(a)}%;width:${(pc(b)-pc(a)).toFixed(4)}%" role="img" aria-label="${esc(t("puAria",{a:P.a, b:P.b}))}"></span>`; }
  M.forEach((m,k)=>{ h+=`<button type="button" class="st-mkf" data-mk="${k}" style="left:${pc((m.b-1)*4)}%" aria-label="${esc(t("mkAria",{n:m.b, w:drMkName(m,k)}))}">${esc(drMkName(m,k))}</button>`; });
  return h+`</span></div>`;
}
/* ══ go to a bar: stopped, the song starts there; playing, it carries on from there at once ══ */
function drGo(bar){
  bar=Math.max(1, Math.min(MAX_BARS, Math.round(bar)));
  if(SONG.loopOn && (bar<SONG.loopFrom || bar>SONG.loopTo)){ SONG.loopOn=false; }
  SONG.startBar=bar; save();
  if(PLAY.on){ const was=PLAY.on; stop(); if(was) play(); }
  paintTransport(); paintTimeline();
}
/* ══ AOG-DESK-CLICK-V1 · the click, laid a moment ahead while the song plays (as the song's own sounds are) ══ */
function drCkGain(kind){ const g=0.22*Math.pow(CK.lvl/60, 2); return kind===2 ? g : kind===1 ? g*0.62 : g*0.36; }
function dpClickAt(c, when, kind){
  const o=c.createOscillator(), g=c.createGain(), lv=drCkGain(kind);
  o.frequency.value=kind===2 ? 1760 : kind===1 ? 1320 : 990; g.gain.value=0;
  g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(lv, when+0.002); g.gain.exponentialRampToValueAtTime(Math.max(1e-5, lv*0.0045), when+0.05);
  o.connect(g); g.connect(c.destination); o.start(when); o.stop(when+0.06);   /* straight to the speakers: never the mix, a bounce or a meter */
  DR.mlog.push({when:when, kind:kind, gain:lv}); if(DR.mlog.length>256) DR.mlog.splice(0, DR.mlog.length-256);
  return o;
}
function dpCountBeats(){ return 4*(CK.cnt||1); }
function dpMetro(now){
  if(!CK.on || !PLAY.on || !ac || !LIVE) return;
  /* the song was moved (a change, Go to): the clicks laid for the old place are taken back */
  if(PLAY.wins!==DR.mwArr){ DR.mo.forEach(q=>{ if(q.when>now){ try{ q.o.stop(now); }catch(e){} } }); DR.mo=[]; DR.mwArr=PLAY.wins; }
  const lag=NCOMP*0.006+(LIVE.lag||0), step=songBeat()/CK.sub, perBar=4*CK.sub;
  PLAY.wins.forEach(w=>{
    if(w.ck==null) w.ck=Math.ceil((w.from-1e-6)/step);
    for(;;){ const pos=w.ck*step; if(pos>=w.to-1e-6) break; const when=w.at+(pos-w.from)+lag; if(when>now+1.0) break;
      if(when>=now-0.005){ const kind=w.ck%perBar===0 && CK.acc ? 2 : w.ck%CK.sub===0 ? 1 : 0, o=dpClickAt(ac, when, kind); o._w=when; DR.mo.push({o:o, when:when}); PLAY.clicks.push(o); }
      w.ck++; } });
  DR.mo=DR.mo.filter(q=>q.when>now-0.2);
  if(PLAY.clicks.length>64) PLAY.clicks=PLAY.clicks.filter(o=>o._w==null || o._w>now-0.2);
}
/* ══ wiring ══ */
function drSay(w){ DR.say=w||""; const el=document.getElementById("drLine"); if(el) el.textContent=DR.say; }
function drLoopSet(a, b){ a=Math.max(1, Math.min(MAX_BARS, a)); b=Math.max(a, Math.min(MAX_BARS, b)); SONG.loopFrom=a; SONG.loopTo=b; save(); reschedule(); paintTransport(); paintTimeline(); }
function drInit(){
  drCss();
  const box=document.getElementById("drBox"); if(!box) return;
  box.addEventListener("toggle", e=>{ if(e.target.id!=="drMore") return; DR.open=e.target.open; drPaint(); }, true);
  box.addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("button"); if(!b) return; const id=b.id;
    if(id==="drLoop"){ const lb=document.getElementById("loopBtn"); if(lb) lb.click(); }
    else if(id==="drPunch"){ SONG.punchOn=!SONG.punchOn; if(SONG.punchOn && !SONG.punch) SONG.punch={a:SONG.loopFrom, b:SONG.loopTo}; if(!SONG.punchOn) delete SONG.punchOn; save(); paintTimeline(); }
    else if(id==="drLrec"){ if(SONG.lrec) delete SONG.lrec; else SONG.lrec=true; save(); }
    else if(id==="drCk"){ CK.on=!CK.on; drCkSave(); }
    else if(id==="drAcc"){ CK.acc=!CK.acc; drCkSave(); }
    else if(id==="drMkAdd"){ const n=drHereBar(), M=(SONG.marks||[]).filter(m=>m.b!==n); if(M.length>=32) return; M.push({b:n}); M.sort((p,q)=>p.b-q.b); SONG.marks=M; DR.mk=M.findIndex(m=>m.b===n); save(); drSay(t("mkMade",{n:n})); paintTimeline(); }
    else if(id==="drMkDel"){ const M=SONG.marks||[]; if(!M[DR.mk]) return; M.splice(DR.mk, 1); if(M.length) SONG.marks=M; else delete SONG.marks; DR.mk=-1; save(); drSay(t("mkGone")); paintTimeline(); }
    else return;
    drPaint(true); const n=document.getElementById(id)||document.getElementById("drView"); if(n) try{ n.focus({preventScroll:true}); }catch(er){}
  });
  box.addEventListener("change", e=>{ const el=e.target, id=el.id, v=+el.value;
    if(id==="drView"){ DR.view=el.value; try{ localStorage.setItem("aog.studio.dr.v1", DR.view); }catch(er){} drPaint(); return; }
    if(id==="drLf"){ drLoopSet(v, Math.max(v, SONG.loopTo)); }
    else if(id==="drLt"){ drLoopSet(Math.min(v, SONG.loopFrom), v); }
    else if(id==="drPa" || id==="drPb"){ const P=drPunch(); if(id==="drPa"){ P.a=v; if(P.b<v) P.b=v; } else { P.b=v; if(P.a>v) P.a=v; } SONG.punch=P; save(); paintTimeline(); }
    else if(id==="drSub"){ CK.sub=[1,2,4].indexOf(v)>=0 ? v : 1; drCkSave(); }
    else if(id==="drCnt"){ if(v>0){ CK.cnt=v; SONG.countIn=true; } else SONG.countIn=false; drCkSave(); save(); paintTransport(); }
    else if(id==="drLvl"){ drCkSave(); return; }
    else if(id==="drMk"){ DR.mk=el.value==="" ? -1 : v; const m=(SONG.marks||[])[DR.mk]; if(m){ drGo(m.b); drSay(t("mkAt",{n:m.b, w:drMkName(m, DR.mk)})); } }
    else if(id==="drMkB"){ const M=SONG.marks||[], m=M[DR.mk]; if(!m) return; if(M.some((q,k)=>k!==DR.mk && q.b===v)) return; m.b=v; M.sort((p,q)=>p.b-q.b); DR.mk=M.indexOf(m); save(); paintTimeline(); }
    else if(id==="drMkW"){ return; }
    else return;
    drPaint(true); const n=document.getElementById(id); if(n) try{ n.focus({preventScroll:true}); }catch(er){}
  });
  box.addEventListener("input", e=>{ const el=e.target;
    if(el.id==="drLvl"){ CK.lvl=Math.max(0, Math.min(100, Math.round(+el.value))); const w=volDb(CK.lvl), o=document.getElementById("drLvl-o"); if(o) o.textContent=w; el.setAttribute("aria-valuetext", w); return; }
    if(el.id==="drMkW"){ const m=(SONG.marks||[])[DR.mk]; if(!m) return; const w=String(el.value||"").replace(/[\u0000-\u001f]/g,"").trim().slice(0,24); if(w) m.w=w; else delete m.w; saveSoon();
      const op=document.querySelector(`#drMk option[value="${DR.mk}"]`); if(op) op.textContent=t("mkOpt",{n:m.b, w:drMkName(m, DR.mk)});
      const f=document.querySelector(`#cyStrip [data-mk="${DR.mk}"]`); if(f){ f.textContent=drMkName(m, DR.mk); f.setAttribute("aria-label", t("mkAria",{n:m.b, w:drMkName(m, DR.mk)})); } }
  });
  box.addEventListener("keydown", e=>{ if(e.key==="Enter" && e.target.id==="drMkW"){ e.preventDefault(); e.target.blur(); drPaint(true); } });
  /* on the song: a marker is a button (Go to it); the loop's ends are dragged */
  const tl=document.getElementById("timeline");
  tl.addEventListener("click", e=>{ const f=e.target.closest && e.target.closest(".st-mkf[data-mk]"); if(!f) return; e.stopPropagation(); const k=+f.getAttribute("data-mk"), m=(SONG.marks||[])[k]; if(!m) return; DR.mk=k; drGo(m.b); drSay(t("mkAt",{n:m.b, w:drMkName(m,k)})); drPaint(true); }, true);
  const barAt=(strip, cx)=>{ const r=strip.getBoundingClientRect(); return Math.max(0, Math.min(tlBars(), Math.round((cx-r.left)/Math.max(1, r.width)*tlBars()))); };
  tl.addEventListener("pointerdown", e=>{ const h=e.target.closest && e.target.closest(".st-cyh[data-cy]"); if(!h || (e.pointerType==="mouse" && e.button!==0)) return;
    e.preventDefault(); e.stopPropagation(); DR.drag={edge:h.getAttribute("data-cy"), pid:e.pointerId, strip:document.getElementById("cyStrip"), band:document.getElementById("cyBand"), a:SONG.loopFrom, b:SONG.loopTo};
    try{ h.setPointerCapture(e.pointerId); }catch(er){} }, true);
  tl.addEventListener("pointermove", e=>{ const d=DR.drag; if(!d || e.pointerId!==d.pid) return; e.preventDefault();
    const bar=barAt(d.strip, e.clientX), W=tlBars()*4;
    if(d.edge==="a") d.a=Math.max(1, Math.min(d.b, bar+1)); else d.b=Math.max(d.a, Math.min(MAX_BARS, bar));
    if(d.band){ d.band.style.left=((d.a-1)*4/W*100).toFixed(4)+"%"; d.band.style.width=((d.b-d.a+1)*4/W*100).toFixed(4)+"%"; } }, true);
  const up=e=>{ const d=DR.drag; if(!d || e.pointerId!==d.pid) return; DR.drag=null; e.stopPropagation();
    if(e.type==="pointercancel" || (d.a===SONG.loopFrom && d.b===SONG.loopTo)){ paintTimeline(); return; }
    drLoopSet(d.a, d.b); const s=document.getElementById("tlLine"); if(s) s.textContent=t("cySaid",{a:d.a, b:d.b}); drPaint(true);
    const tl2=document.getElementById("timeline"); tl2._noClick=Date.now(); };
  tl.addEventListener("pointerup", up, true); tl.addEventListener("pointercancel", up, true);
  drPaint(true);
  try{ paintTimeline(); }catch(e){}
}
drInit();
/* for the tests (music-handoff/tests/desk/rec.js) */
window.__aogDeskRec={ DR:DR, CK:CK, drGo:drGo, drPaint:drPaint, drTlRow:drTlRow, dpMetro:dpMetro, drCkSave:drCkSave };
