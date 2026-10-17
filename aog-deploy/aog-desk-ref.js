"use strict";
/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   AOG-DESK-REF-V1 (2026-10-17) — the Mixing Desk (music-studio.html): compare your mix with a song you like (A/B).
   Fetched the first time "Compare with a song" opens (aog-desk-pro.js). The song is read on this device from a file
   you choose and kept only while the page is open: never saved with your song, never sent anywhere.
   · its loudness (LUFS, integrated, as the desk's own meter: kPow and lufsInt, worked out in a Worker) and your mix's
     (the song bounced as Make the mix does, measured the same way), so with Same loudness on the reference plays turned
     up or down to your mix's loudness: the comparison is fair, louder never wins;
   · one tap switches what you hear while the song plays (a 15 ms fade, no click): A your mix, B the reference, at the
     same place in the song (the reference starts with the song's bar 1, follows the loop and Go to);
   · straight to the speakers, past the desk (so it is never in a mix); it rests when the song stops.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
(function(){
const W={
  abLine:{en:"Compare your mix with a song you like. It stays on this device and is never saved or sent.",es:"Compara tu mezcla con una canción que te guste. Se queda en este aparato y nunca se guarda ni se envía."},
  abPick:{en:"Choose a song to compare",es:"Elegir una canción para comparar"}, abPick2:{en:"Choose another song",es:"Elegir otra canción"},
  abHint:{en:"On an iPad or iPhone, pick Choose File, then your song.",es:"En un iPad o iPhone, toca Elegir archivo y luego tu canción."},
  abReading:{en:"Reading the song…",es:"Leyendo la canción…"}, abBad:{en:"That file did not open as a song. Try another one.",es:"Ese archivo no se abrió como canción. Prueba otro."},
  abMeasure:{en:"Measuring your mix…",es:"Midiendo tu mezcla…"},
  abA:{en:"Hearing A: your mix. Tap for B.",es:"Oyes A: tu mezcla. Toca para B."}, abB:{en:"Hearing B: the reference. Tap for A.",es:"Oyes B: la referencia. Toca para A."},
  abSame:{en:"Same loudness: On",es:"Misma sonoridad: encendido"}, abSameOff:{en:"Same loudness: Off",es:"Misma sonoridad: apagado"},
  abRm:{en:"Remove the reference",es:"Quitar la referencia"},
  abRef:{en:"The reference: {name} · {l} LUFS",es:"La referencia: {name} · {l} LUFS"},
  abMix:{en:"Your mix: {l} LUFS",es:"Tu mezcla: {l} LUFS"},
  abMatch:{en:"With Same loudness, the reference plays {d} dB {w}, so both sound as loud.",es:"Con Misma sonoridad, la referencia suena {d} dB {w}, así las dos suenan igual de fuerte."},
  abDown:{en:"quieter",es:"más baja"}, abUp:{en:"louder",es:"más alta"}, abEven:{en:"Both are already as loud.",es:"Las dos ya suenan igual de fuerte."},
  abPlay:{en:"Press Play, then tap A/B as it plays.",es:"Pulsa Tocar y luego toca A/B mientras suena."},
  abNoMix:{en:"Put a recording on a track to compare.",es:"Pon una grabación en una pista para comparar."},
  abGone:{en:"The reference is gone.",es:"La referencia ya no está."}
};
Object.assign(STR, W);
const R={buf:null, name:"", lufs:null, mix:null, mixSig:"", busy:"", on:"a", same:true, gain:1, out:null, g:null, srcs:[], seen:new WeakSet(), arr:null, log:[], err:""};
/* on an iPhone or iPad only exact audio types, so Photos and the camera are not offered (as the Turntables, AOG-DJ-AUDIO-ONLY-V2) */
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
const ACCEPT=IOS ? "audio/mpeg,audio/mp3,audio/x-m4a,audio/m4a,audio/aac,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff,audio/flac,audio/x-caf" : "audio/*,.mp3,.m4a,.aac,.wav,.aif,.aiff,.flac,.ogg";
/* the loudness, worked out in a Worker made from the desk's own meter (the very same steps) */
let LW=null, LN=0; const LQ=new Map();
function lufsOf(chs, sr){
  if(typeof Worker==="undefined") return Promise.resolve(lufsInt(kPow(chs, sr)));
  if(!LW){ const src=[kCoef, kPow, luOf, lufsInt].map(f=>f.toString()).join("\n")+"\nself.onmessage=e=>{const d=e.data;let v=null;try{v=lufsInt(kPow(d.ch,d.sr));}catch(x){}self.postMessage({id:d.id,v:v});};";
    try{ LW=new Worker(URL.createObjectURL(new Blob([src], {type:"text/javascript"}))); }catch(e){ return Promise.resolve(lufsInt(kPow(chs, sr))); }
    LW.onmessage=e=>{ const f=LQ.get(e.data.id); if(f){ LQ.delete(e.data.id); f(e.data.v); } if(!LQ.size){ try{ LW.terminate(); }catch(er){} LW=null; } }; }
  const id=++LN, ch=chs.map(a=>Float32Array.from(a));
  return new Promise(ok=>{ LQ.set(id, v=>ok(v==null ? -Infinity : v)); LW.postMessage({id:id, ch:ch, sr:sr}, ch.map(a=>a.buffer)); });
}
function num1(v){ return isFinite(v) ? (v<0 ? "−" : "")+Math.abs(v).toFixed(1).replace(".", S.lang==="es" ? "," : ".") : "—"; }
function sig(){ try{ return JSON.stringify([SONG.tracks, SONG.master, songBpm()]); }catch(e){ return String(Date.now()); } }
async function measureMix(){
  if(!hasClips()) return null;
  const s=sig(); if(R.mix!=null && R.mixSig===s) return R.mix;
  R.busy="mix"; paint();
  try{ const r=await renderSong(null); R.mix=await lufsOf([r.Lc, r.Rc], MIX_SR); R.mixSig=s; }catch(e){ R.mix=null; }
  R.busy=""; setGain(); paint(); return R.mix;
}
function matchDb(){ return (R.same && isFinite(R.mix) && isFinite(R.lufs)) ? Math.max(-30, Math.min(12, R.mix-R.lufs)) : 0; }
function setGain(){ R.gain=Math.pow(10, matchDb()/20); apply(); }
/* what you hear: A the desk, B the reference */
function apply(){
  if(!LIVE || !ac) return; const now=ac.currentTime, b=R.on==="b" && !!R.buf;
  try{ LIVE.out.gain.cancelScheduledValues(now); LIVE.out.gain.setTargetAtTime(b ? 0 : 1, now, 0.005); }catch(e){}
  if(R.g){ try{ R.g.gain.cancelScheduledValues(now); R.g.gain.setTargetAtTime(b ? R.gain : 0, now, 0.005); }catch(e){} }
}
function nodes(){ if(R.out || !ac) return; R.g=ac.createGain(); R.g.gain.value=0; R.out=ac.createGain(); R.g.connect(R.out); R.out.connect(ac.destination); }
/* while the song plays: the reference laid along the same windows as the song (from the desk's pump) */
function pump(now){
  if(!R.buf || !PLAY.on || !ac) return;
  nodes();
  if(PLAY.wins!==R.arr){ R.srcs.forEach(q=>{ try{ q.s.stop(now+0.02); }catch(e){} }); R.srcs=[]; R.arr=PLAY.wins; R.seen=new WeakSet(); apply(); paint(); }
  const lag=NCOMP*0.006+(LIVE.lag||0);
  PLAY.wins.forEach(w=>{ if(R.seen.has(w)) return; R.seen.add(w);
    const off=w.from, dur=Math.min(w.to, R.buf.duration)-off; if(!(dur>0.01)) return;
    const s=ac.createBufferSource(); s.buffer=R.buf; s.connect(R.g);
    const sr=ac.sampleRate, when=Math.round(Math.max(now, w.at+lag)*sr)/sr, o2=Math.max(0, off+(when-(w.at+lag)));   /* on a sample, so the reference is played as it is (a start between samples would be blended) */
    s.start(when, o2, dur-(when-(w.at+lag))); R.srcs.push({s:s, end:when+dur}); R.log.push({when:when, off:o2, at:w.at, from:w.from, lag:lag}); if(R.log.length>32) R.log.shift(); });
  R.srcs=R.srcs.filter(q=>q.end>now-0.5);
}
function stop(){ const now=ac ? ac.currentTime : 0; R.srcs.forEach(q=>{ try{ q.s.stop(now); }catch(e){} }); R.srcs=[]; R.arr=null;
  if(LIVE && ac){ try{ LIVE.out.gain.cancelScheduledValues(now); LIVE.out.gain.setValueAtTime(1, now); }catch(e){} } if(R.g && ac){ try{ R.g.gain.cancelScheduledValues(now); R.g.gain.setValueAtTime(0, now); }catch(e){} } }
async function load(file){
  if(!file) return;
  R.busy="read"; R.err=""; paint();
  try{
    const c=live(), ab=await file.arrayBuffer(), buf=await new Promise((ok, no)=>{ const p=c.decodeAudioData(ab, ok, no); if(p && p.then) p.then(ok, no); });
    const chs=[]; for(let k=0;k<Math.min(2, buf.numberOfChannels);k++) chs.push(buf.getChannelData(k)); if(chs.length<2) chs.push(chs[0]);
    R.lufs=await lufsOf(chs, buf.sampleRate); R.buf=buf; R.name=String(file.name||"").replace(/\.[a-z0-9]{2,5}$/i,"").slice(0,60); R.on="a"; R.busy="";
    await measureMix(); setGain();
  }catch(e){ R.busy=""; R.err="abBad"; }
  paint();
}
function toggle(){
  if(!R.buf) return;
  R.on=R.on==="a" ? "b" : "a";
  if(R.on==="b" && R.mixSig!==sig()) measureMix().then(()=>setGain());
  apply(); paint();
  const b=document.getElementById("abBtn"); if(b) try{ b.focus({preventScroll:true}); }catch(e){}
}
function html(){
  const has=!!R.buf, m=matchDb();
  let h=`<p class="st-line" style="margin:0">${esc(t("abLine"))}</p><div class="st-pmr"><button type="button" class="st-btn" id="abPick">${esc(t(has ? "abPick2" : "abPick"))}</button>`+
    `<input type="file" id="refIn" accept="${ACCEPT}" hidden>`+(has ? `<button type="button" class="st-btn st-clear" id="abRm">${esc(t("abRm"))}</button>` : "")+`</div><p class="st-line" style="margin:0">${esc(t("abHint"))}</p>`;
  if(R.busy) h+=`<p class="st-gr" aria-live="polite">${esc(t(R.busy==="read" ? "abReading" : "abMeasure"))}</p>`;
  if(R.err) h+=`<p class="st-line note" style="margin:0">${esc(t(R.err))}</p>`;
  if(has){
    h+=`<div class="st-pmr"><button type="button" class="st-btn st-go" id="abBtn" aria-pressed="${R.on==="b"}">${esc(t(R.on==="b" ? "abB" : "abA"))}</button>`+
      `<button type="button" class="st-btn" id="abSame" aria-pressed="${R.same}">${esc(t(R.same ? "abSame" : "abSameOff"))}</button></div>`+
      `<p class="st-line" style="margin:0">${esc(t("abRef",{name:R.name, l:num1(R.lufs)}))}${isFinite(R.mix) ? " · "+esc(t("abMix",{l:num1(R.mix)})) : ""}</p>`+
      (!hasClips() ? `<p class="st-line" style="margin:0">${esc(t("abNoMix"))}</p>` : R.same && isFinite(R.mix) ? `<p class="st-line" style="margin:0">${esc(Math.abs(m)<0.05 ? t("abEven") : t("abMatch",{d:num1(Math.abs(m)), w:t(m<0 ? "abDown" : "abUp")}))}</p>` : "")+
      (!PLAY.on && hasClips() ? `<p class="st-line" style="margin:0">${esc(t("abPlay"))}</p>` : "");
  }
  return h;
}
function paint(){ const el=document.getElementById("refPane"); if(!el) return; const h=html(); if(el._h===h) return;
  const fa=document.activeElement, keep=fa && el.contains(fa) ? fa.id : ""; el._h=h; el.innerHTML=h; if(keep){ const n=document.getElementById(keep); if(n) try{ n.focus({preventScroll:true}); }catch(e){} } }
document.addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("#refPane button"); if(!b) return;
  if(b.id==="abPick"){ const i=document.getElementById("refIn"); if(i){ i.value=""; i.click(); } }
  else if(b.id==="abBtn") toggle();
  else if(b.id==="abSame"){ R.same=!R.same; setGain(); paint(); }
  else if(b.id==="abRm"){ stop(); R.buf=null; R.name=""; R.lufs=null; R.on="a"; paint(); const s=document.getElementById("pmView"); if(s) s.focus(); dpSay2(t("abGone")); } });
document.addEventListener("change", e=>{ if(e.target && e.target.id==="refIn"){ const f=e.target.files && e.target.files[0]; load(f); } });
function dpSay2(w){ const el=document.querySelector("#refPane .st-line"); if(el) el.textContent=w; }
window.AOGDeskRef={ R:R, html:html, paint:paint, pump:pump, stop:stop, load:load, toggle:toggle, measureMix:measureMix, lufsOf:lufsOf, get out(){ return R.out; } };
try{ dpPaint(true); }catch(e){}
})();
