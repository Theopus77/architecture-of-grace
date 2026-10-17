"use strict";
/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   AOG-DESK-ARRANGE-V1 (2026-10-17) — the Mixing Desk (music-studio.html), clip looping and the arrangement. Loaded
   with defer; names begin with da or DA_.
   · AOG-DESK-CLIPLOOP-V1: drag a piece's right end along its lane to repeat it (whole times, then a part of one when
     it is let go between them, on the beat with Snap on), or back to make it shorter; one Undo;
   · repeat a section N times after itself (the sections of AOG-DESK-SECTIONS-V1; one Undo for all of them);
   · add or take out bars across every track: every piece, take, drawn line, chosen take, section, marker, the loop and
     the punch after that bar move along (a piece across it is cut there);
   · sections that follow the markers (SONG.secMk): each marker starts a section, named after it.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const DA_STR={
  daSum:{en:"Arrange: repeat, add or take out bars",es:"Arreglo: repetir, añadir o quitar compases"},
  daShow:{en:"Show",es:"Mostrar"}, da_rp:{en:"Repeat a section",es:"Repetir una sección"}, da_br:{en:"Add or take out bars",es:"Añadir o quitar compases"}, da_mk:{en:"Sections from the markers",es:"Secciones de las marcas"},
  daTip:{en:"Drag a piece's right end along its lane to repeat it.",es:"Arrastra el extremo derecho de una parte por su carril para repetirla."},
  daSec:{en:"Section",es:"Sección"}, daNoSec:{en:"Mark a section first (Sections, above).",es:"Primero marca una sección (Secciones, arriba)."},
  daTimes:{en:"How many more times",es:"Cuántas veces más"}, daRep:{en:"Repeat it",es:"Repetirla"},
  daRepd:{en:"{name} now plays {n} more times after itself.",es:"{name} suena ahora {n} veces más después de sí misma."},
  daAt:{en:"At bar",es:"En el compás"}, daN:{en:"How many bars",es:"Cuántos compases"}, daAdd:{en:"Add bars",es:"Añadir compases"}, daDel:{en:"Take out bars",es:"Quitar compases"},
  daBrLine:{en:"Everything after moves along, on every track.",es:"Todo lo que viene después se mueve, en todas las pistas."},
  daAdded:{en:"{n} empty bars added at bar {b}.",es:"{n} compases vacíos añadidos en el compás {b}."},
  daAdded1:{en:"1 empty bar added at bar {b}.",es:"1 compás vacío añadido en el compás {b}."},
  daGone:{en:"Bars {a} to {b} are taken out. What came after moved up.",es:"Los compases {a} a {b} se quitaron. Lo que venía después subió."},
  daGone1:{en:"Bar {a} is taken out. What came after moved up.",es:"El compás {a} se quitó. Lo que venía después subió."},
  daFull:{en:"Track {n} has too many pieces for that.",es:"La pista {n} tiene demasiadas partes para eso."},
  daRoom:{en:"There is no room for that in 128 bars.",es:"No hay espacio para eso en 128 compases."},
  daMkOn:{en:"Sections follow the markers: On",es:"Las secciones siguen las marcas: encendido"}, daMkOff:{en:"Sections follow the markers: Off",es:"Las secciones siguen las marcas: apagado"},
  daMkLine:{en:"Each marker starts a section, named after it, until the next marker.",es:"Cada marca empieza una sección, con su nombre, hasta la marca siguiente."},
  daMkNeed:{en:"Add markers first (Loop, punch, click and markers).",es:"Primero añade marcas (Bucle, pinchazo, clic y marcas)."},
  lpSaid:{en:"Piece {n} now plays {w}, to bar {b}.",es:"La parte {n} suena ahora {w}, hasta el compás {b}."},
  lpOnce:{en:"once",es:"una vez"}, lpTimes:{en:"{n} times",es:"{n} veces"}, lpBit:{en:"{w} and a part",es:"{w} y un trozo"}, lpShort:{en:"shorter",es:"más corta"},
  lphAria:{en:"Drag to repeat this piece",es:"Arrastra para repetir esta parte"}
};
Object.assign(STR, DA_STR);
const DA={open:false, view:"rp", sec:0, times:1, at:1, n:1, drag:null, say:""};
try{ const v=localStorage.getItem("aog.studio.da.v1"); if(["rp","br","mk"].indexOf(v)>=0) DA.view=v; }catch(e){}
/* Undo for an arrangement change: every track's pieces, takes, chosen takes and lines, the sections, the markers, the loop and the punch */
DM_SNAPS.arr={ get:()=>JSON.stringify({s:DM_SNAPS.song.get(), m:SONG.marks||null, lp:[SONG.loopFrom, SONG.loopTo], pu:SONG.punch||null, sm:!!SONG.secMk}),
  set:j=>{ const o=JSON.parse(j); DM_SNAPS.song.set(o.s); if(o.m) SONG.marks=o.m; else delete SONG.marks; SONG.loopFrom=o.lp[0]; SONG.loopTo=o.lp[1];
    if(o.pu) SONG.punch=o.pu; else delete SONG.punch; if(o.sm) SONG.secMk=true; else delete SONG.secMk; } };
const DA_CSS=`
.st-da{margin-top:10px}
.st-da [hidden]{display:none!important}
.st-dai{display:grid;gap:.7rem;padding:0 12px 12px}
.st-dai .st-pick{max-width:24rem}
.st-dap{display:grid;gap:.6rem;padding:.7rem .8rem;border-radius:10px;border:1px solid #0a0a0c;background:linear-gradient(#111215,#191a1e);box-shadow:inset 0 2px 6px rgba(0,0,0,.7)}
.st-dar{display:flex;flex-wrap:wrap;gap:.5rem .7rem;align-items:flex-end}
.st-dar .st-field{flex:1 1 9rem}
.st-dar .st-btn{flex:0 0 auto}
.st-lph{position:absolute;top:0;bottom:0;right:-2px;width:22px;cursor:ew-resize;touch-action:none;z-index:2}
.st-lph::before{content:"";position:absolute;top:24%;bottom:24%;right:5px;width:4px;border-radius:2px;background:rgba(255,246,224,.85);box-shadow:0 0 0 1px rgba(20,16,8,.55)}
.st-clip.lpg{outline:2px dashed #f0c26e;outline-offset:-2px}
`;
function daCss(){ if(document.getElementById("aog-desk-arrange-css")) return; const s=document.createElement("style"); s.id="aog-desk-arrange-css"; s.textContent=DA_CSS; document.head.appendChild(s); }
function daSay(w){ DA.say=w||""; const el=document.getElementById("daLine"); if(el) el.textContent=DA.say; }
function daOpts(L, cur, f){ return L.map(v=>`<option value="${v}"${v===cur?" selected":""}>${esc(f(v))}</option>`).join(""); }
/* ══ a piece's end, dragged: whole times through, then a part of one ══ */
function daLoopPieces(c, p, total){
  const r=ratio(c), len=(p.b-p.a)*r, x={}; if(p.g) x.g=p.g; if(p.rev) x.rev=1;
  total=Math.max(0.25, total);
  if(total<len-1e-6){ const b=p.rev ? null : p.a+total/r; return [p.rev ? Object.assign({a:p.b-total/r, b:p.b, at:p.at, n:1}, x) : Object.assign({a:p.a, b:b, at:p.at, n:1}, x)]; }
  let n=Math.min(16, Math.floor(total/len+1e-6)), fr=total-n*len; if(n>=16) fr=0;
  const out=[Object.assign({a:p.a, b:p.b, at:p.at, n:n}, x)];
  if(fr>=0.25-1e-9) out.push(Object.assign(p.rev ? {a:p.b-fr/r, b:p.b} : {a:p.a, b:p.a+fr/r}, {at:p.at+n*len, n:1}, x));
  return out;
}
function daLoopWords(c, parts, k){
  const p=parts[0], len=(p.b-p.a)*ratio(c), endB=parts.reduce((m,q)=>Math.max(m, dmPieceEnd(c,q)), 0), bar=Math.ceil(endB/4-1e-6);
  let w=parts.length===1 && parts[0].n===1 ? t("lpOnce") : t("lpTimes",{n:parts[0].n}); if(parts.length>1) w=t("lpBit",{w:w});
  return t("lpSaid",{n:k+1, w:w, b:Math.max(1, bar)});
}
/* ══ add or take out bars ══ */
function daCutAll(c, A){ const out=[]; pcs(c).forEach(q=>dmCutAt(c, Object.assign({}, q), A).forEach(u=>out.push(u))); return out; }
function daInsPieces(c, A, n){ return daCutAll(c, A).map(u=>u.at>=A-1e-6 ? Object.assign({}, u, {at:u.at+n}) : u); }
function daDelPieces(c, A, B){ const out=[], n=B-A;
  daCutAll(c, A).forEach(u=>dmCutAt(c, u, B).forEach(v=>{ const s=v.at, e=dmPieceEnd(c, v); if(s>=A-1e-6 && e<=B+1e-6) return; out.push(s>=B-1e-6 ? Object.assign({}, v, {at:v.at-n}) : v); }));
  return out; }
function daLineIns(Ln, A, n){ const vl=Math.round(drawnAt(Ln, A-1e-7)), vr=Math.round(drawnAt(Ln, A)), out=[];
  Ln.forEach(p=>{ if(p[0]<A-1e-9) out.push(p.slice()); }); out.push([A, vl], [A+n, vl], [A+n, vr]);
  Ln.forEach(p=>{ if(p[0]>=A-1e-9) out.push([p[0]+n, p[1]]); }); return daDedupe(out); }
function daLineDel(Ln, A, B){ const n=B-A, out=[];
  Ln.forEach(p=>{ if(p[0]<A-1e-9) out.push(p.slice()); }); out.push([A, Math.round(drawnAt(Ln, A-1e-7))], [A, Math.round(drawnAt(Ln, B))]);
  Ln.forEach(p=>{ if(p[0]>B+1e-9) out.push([p[0]-n, p[1]]); }); return daDedupe(out); }
function daDedupe(L){ const M=[]; L.forEach(p=>{ const l=M[M.length-1]; if(l && Math.abs(l[0]-p[0])<1e-9 && l[1]===p[1]) return; M.push(p); }); return M; }
const daMapIns=(x, A, n)=>x>=A-1e-9 ? x+n : x, daMapDel=(x, A, B)=>x<=A ? x : x>=B ? x-(B-A) : A;
/* n beats at A (n > 0 adds; a negative n takes out beats A to A − n) */
function daBars(A, n){
  const del=n<0, B=del ? A-n : A, room=del ? true : dmEndBeat()+n<=MAX_BARS*4;
  if(!room){ daSay(t("daRoom")); return false; }
  const plan=[];
  for(let i=0;i<NT;i++){ const x=SONG.tracks[i];
    for(const c of [x.clip].concat(x.takes||[]).filter(Boolean)){ const P=cleanPieces(del ? daDelPieces(c, A, B) : daInsPieces(c, A, n));
      if(P && P.length>64){ daSay(t("daFull",{n:i+1})); return false; } plan.push({c:c, P:P}); } }
  dmRemember("arr", SONG.sel, "");
  plan.forEach(o=>{ if(o.P){ o.c.pieces=o.P; o.c.psel=0; tidyPieces(o.c); } else { o.c.pieces=[{a:0, b:0.25, at:0, n:1}]; o.c.gone=1; } });
  /* a recording whose every piece was taken out leaves the track (it stays for Undo) */
  SONG.tracks.forEach(x=>{ if(x.takes){ x.takes=x.takes.filter(c=>!c.gone); dmTakesTidy(x); } if(x.clip && x.clip.gone){ delete x.clip.gone; x.clip=null; dmPromoteTake(x); }
    if(x.lines){ AUTO_KEYS.forEach(k=>{ const L=x.lines[k]; if(L && L.length) x.lines[k]=del ? daLineDel(L, A, B) : daLineIns(L, A, n); }); const c=cleanLines(x.lines); if(c) x.lines=c; else delete x.lines; }
    if(x.comp){ x.comp=x.comp.map(r=>del ? [daMapDel(r[0],A,B), daMapDel(r[1],A,B), r[2]] : [daMapIns(r[0],A,n), r[1]>A+1e-9 ? r[1]+n : r[1], r[2]]).filter(r=>r[1]-r[0]>=0.25-1e-9); if(!x.comp.length) delete x.comp; } });
  if(SONG.sections){ const S2=SONG.sections.map(s=>del ? {a:daMapDel(s.a,A,B), b:daMapDel(s.b,A,B), n:s.n, w:s.w} : {a:daMapIns(s.a,A,n), b:s.b>A+1e-9 ? s.b+n : s.b, n:s.n, w:s.w}); const c=dmCleanSecs(S2); if(c) SONG.sections=c; else delete SONG.sections; }
  if(SONG.marks){ const M=[]; SONG.marks.forEach(m=>{ const b=(m.b-1)*4; if(del && b>=A-1e-9 && b<B-1e-9) return; const nb=del ? daMapDel(b,A,B) : daMapIns(b,A,n); const o=Object.assign({}, m, {b:Math.round(nb/4)+1}); if(o.b>=1 && o.b<=MAX_BARS && !M.some(q=>q.b===o.b)) M.push(o); });
    if(M.length) SONG.marks=M; else delete SONG.marks; }
  const bar=(v, end)=>{ const b=end ? v*4 : (v-1)*4, nb=del ? daMapDel(b,A,B) : (end ? (b>A+1e-9 ? b+n : b) : daMapIns(b,A,n)); return Math.max(1, Math.min(MAX_BARS, end ? Math.round(nb/4) : Math.round(nb/4)+1)); };
  const lf=bar(SONG.loopFrom,false), lt=bar(SONG.loopTo,true); SONG.loopFrom=lf; SONG.loopTo=Math.max(lf, lt);
  if(SONG.punch){ const a=bar(SONG.punch.a,false), b=bar(SONG.punch.b,true); SONG.punch={a:a, b:Math.max(a, b)}; }
  if(SONG.secMk) daSecFromMarks(true);
  songChanged(); stretchAll();
  return true;
}
/* ══ sections that follow the markers ══ */
function daSecName(w){ const s=String(w||"").trim().toLowerCase(); if(!s) return null; for(const k of DM_SEC_KEYS){ if([STR["sec_"+k].en, STR["sec_"+k].es].some(x=>x.toLowerCase()===s)) return k; } return null; }
function daSecFromMarks(quiet){
  const M=(SONG.marks||[]).slice().sort((p,q)=>p.b-q.b); if(!M.length){ if(!quiet) daSay(t("daMkNeed")); return; }
  const end=Math.max(dmEndBeat(), (M[M.length-1].b-1)*4+4), L=[];
  M.forEach((m,k)=>{ const a=(m.b-1)*4, b=k+1<M.length ? (M[k+1].b-1)*4 : Math.max(end, a+4); if(b-a<4) return; const key=daSecName(m.w);
    L.push(key ? {a:a, b:b, n:key} : {a:a, b:b, w:m.w || t("mkDef",{n:k+1})}); });
  const c=dmCleanSecs(L); if(c) SONG.sections=c; else delete SONG.sections; DM.sec=-1;
}
/* the markers changed (aog-desk-rec.js): the sections follow, when that is on */
function daMarksChanged(){ if(!SONG.secMk) return; daSecFromMarks(true); save(); paintTimeline(); daPaint(); }
/* ══ the panel ══ */
function daPane(){
  const v=DA.view, L=SONG.sections||[], n=tlBars();
  if(v==="rp"){ if(!L.length) return `<p class="st-line" style="margin:0">${esc(t("daNoSec"))}</p>`;
    if(DA.sec>=L.length) DA.sec=0;
    return `<div class="st-dar"><label class="st-field"><span class="st-lab">${esc(t("daSec"))}</span><select id="daSec">${L.map((s,k)=>`<option value="${k}"${k===DA.sec?" selected":""}>${esc(t("secOpt",{name:dmSecName(s), a:s.a/4+1, b:s.b/4}))}</option>`).join("")}</select></label>`+
      `<label class="st-field"><span class="st-lab">${esc(t("daTimes"))}</span><select id="daTimes">${daOpts([1,2,3,4,5,6,7,8], DA.times, String)}</select></label>`+
      `<button type="button" class="st-btn st-go" id="daRep">${esc(t("daRep"))}</button></div>`; }
  if(v==="br") return `<p class="st-line" style="margin:0">${esc(t("daBrLine"))}</p><div class="st-dar"><label class="st-field"><span class="st-lab">${esc(t("daAt"))}</span><select id="daAt">${dmBarOpts(1, n, Math.min(DA.at, n))}</select></label>`+
    `<label class="st-field"><span class="st-lab">${esc(t("daN"))}</span><select id="daN">${daOpts([1,2,4,8], DA.n, String)}</select></label>`+
    `<button type="button" class="st-btn" id="daAdd">${esc(t("daAdd"))}</button><button type="button" class="st-btn st-clear" id="daDel">${esc(t("daDel"))}</button></div>`;
  return `<p class="st-line" style="margin:0">${esc(t((SONG.marks||[]).length ? "daMkLine" : "daMkNeed"))}</p><div class="st-dar"><button type="button" class="st-btn" id="daMk" aria-pressed="${SONG.secMk ? "true" : "false"}">${esc(t(SONG.secMk ? "daMkOn" : "daMkOff"))}</button></div>`;
}
function daPaint(force){
  const box=document.getElementById("daBox"); if(!box) return; daCss();
  let h=`<details class="st-more st-da" id="daMore"${DA.open?" open":""}><summary>${esc(t("daSum"))}</summary>`;
  if(DA.open) h+=`<div class="st-dai"><p class="st-line" style="margin:0">${esc(t("daTip"))}</p><label class="st-field st-pick"><span class="st-lab">${esc(t("daShow"))}</span><select id="daView">`+
    ["rp","br","mk"].map(k=>`<option value="${k}"${k===DA.view?" selected":""}>${esc(t("da_"+k))}</option>`).join("")+`</select></label><div class="st-dap">${daPane()}</div><p class="st-line" id="daLine" aria-live="polite">${esc(DA.say)}</p></div>`;
  h+=`</details>`;
  if(!force && box._h===h) return;
  const fa=document.activeElement, keep=fa && box.contains(fa) ? fa.id : "";
  box._h=h; box.innerHTML=h;
  if(keep){ const el=document.getElementById(keep); if(el) try{ el.focus({preventScroll:true}); }catch(e){} }
}
function daInit(){
  daCss();
  const box=document.getElementById("daBox"); if(!box) return;
  box.addEventListener("toggle", e=>{ if(e.target.id!=="daMore") return; DA.open=e.target.open; daPaint(); }, true);
  box.addEventListener("change", e=>{ const el=e.target, v=+el.value;
    if(el.id==="daView"){ DA.view=el.value; try{ localStorage.setItem("aog.studio.da.v1", DA.view); }catch(er){} daPaint(); return; }
    if(el.id==="daSec") DA.sec=v; else if(el.id==="daTimes") DA.times=v; else if(el.id==="daAt") DA.at=v; else if(el.id==="daN") DA.n=v; });
  box.addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("button"); if(!b || b.disabled) return; const id=b.id;
    if(id==="daRep"){ const L=SONG.sections||[], s=L[DA.sec]; if(!s) return; const u0=UNDO.length; dmRemember("arr", SONG.sel, "");
      let k=0; for(;k<DA.times;k++){ DM.sec=DA.sec; const before=JSON.stringify(SONG.sections); dmSecCopy(false); if(JSON.stringify(SONG.sections)===before) break; }
      UNDO.splice(u0+1); try{ paintTools(); }catch(er){}
      if(SONG.secMk){ delete SONG.secMk; save(); }   /* the sections are your own now */
      DM.sec=DA.sec; if(k) daSay(t("daRepd",{name:dmSecName(s), n:k})); else daSay(document.getElementById("secLine").textContent);
      paintTimeline(); }
    else if(id==="daAdd" || id==="daDel"){ const A=(DA.at-1)*4, n=DA.n*4;
      if(daBars(A, id==="daAdd" ? n : -n)) daSay(id==="daAdd" ? (DA.n===1 ? t("daAdded1",{b:DA.at}) : t("daAdded",{n:DA.n, b:DA.at})) : (DA.n===1 ? t("daGone1",{a:DA.at}) : t("daGone",{a:DA.at, b:DA.at+DA.n-1}))); }
    else if(id==="daMk"){ dmRemember("arr", SONG.sel, ""); if(SONG.secMk) delete SONG.secMk; else { SONG.secMk=true; daSecFromMarks(false); } save(); paintTimeline(); }
    else return;
    daPaint(true); const n=document.getElementById(id); if(n) try{ n.focus({preventScroll:true}); }catch(er){}
  });
  /* a piece's right end, dragged along its lane */
  const tl=document.getElementById("timeline");
  tl.addEventListener("pointerdown", e=>{ const h=e.target.closest && e.target.closest(".st-lph[data-lph]"); if(!h || (e.pointerType==="mouse" && e.button!==0)) return;
    const lane=h.closest(".st-lane"), blk=h.closest(".st-clip"); if(!lane || !blk) return;
    const i=+lane.getAttribute("data-sel"), c=SONG.tracks[i] && SONG.tracks[i].clip, j=+h.getAttribute("data-lph"); if(!c || !pcs(c)[j]) return;
    e.preventDefault(); e.stopPropagation(); try{ h.setPointerCapture(e.pointerId); }catch(er){}
    const lt=lane.querySelector(".st-lt"), r=lt.getBoundingClientRect(), p=Object.assign({}, pcs(c)[j]);
    DA.drag={i:i, j:j, c:c, p:p, pid:e.pointerId, lt:lt, blk:blk, per:tlBars()*4/Math.max(1, r.width), left:r.left, total:p.n*(p.b-p.a)*ratio(c)};
    blk.classList.add("lpg"); }, true);
  tl.addEventListener("pointermove", e=>{ const d=DA.drag; if(!d || e.pointerId!==d.pid) return; e.preventDefault(); e.stopPropagation();
    let end=(e.clientX-d.left)*d.per; if(VIEW.snap) end=Math.round(end); end=Math.max(d.p.at+0.25, Math.min(MAX_BARS*4, end));
    d.total=end-d.p.at; const W=tlBars()*4; d.blk.style.width=Math.max(0.6, d.total/W*100).toFixed(4)+"%"; }, true);
  const up=e=>{ const d=DA.drag; if(!d || e.pointerId!==d.pid) return; DA.drag=null; e.stopPropagation(); d.blk.classList.remove("lpg"); tl._noClick=Date.now();
    const was=d.p.n*(d.p.b-d.p.a)*ratio(d.c);
    if(e.type==="pointercancel" || Math.abs(d.total-was)<1e-6){ paintTimeline(); return; }
    const parts=daLoopPieces(d.c, d.p, d.total), P=own(d.c), k=P.findIndex(q=>q.at===d.p.at && q.a===d.p.a && q.b===d.p.b); if(k<0){ paintTimeline(); return; }
    remember(d.i, ++UG); P.splice(k, 1, ...parts); d.c.psel=k; tidyPieces(d.c);
    const w=daLoopWords(d.c, parts, k); S.edMsg=w; S.edAt="cut"; const tl2=document.getElementById("tlLine"); if(tl2) tl2.textContent=w;
    if(SONG.sel!==d.i) SONG.sel=d.i;
    songChanged(); stretchAll(); if(tl2) tl2.textContent=w; };
  tl.addEventListener("pointerup", up, true); tl.addEventListener("pointercancel", up, true);
  daPaint(true);
}
daInit();
/* for the tests (music-handoff/tests/desk/arrange.js) */
window.__aogDeskArrange={ DA:DA, daBars:daBars, daLoopPieces:daLoopPieces, daSecFromMarks:daSecFromMarks, daPaint:daPaint };
