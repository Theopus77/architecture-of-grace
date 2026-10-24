"use strict";
/* ════════════════════════════════════════════════════════════════════════════
   AOG-DESK-LOCK-V1 (2026-10-23) — the Locker, in one place.
   The desk calls AOGLock. The rules are these, and only these:
   1. The songs stay in your Drive. The site has no account.
   2. One private link connects a device. The key stays in the script.
   3. A recording is sent once. Later, a save is the song, or one new take.
   4. A save that stopped carries on.
   5. Each song keeps its last three saves.
   6. If both devices changed it, ask. Do not merge.
   7. A take from another device waits. It does not sit on a track.
   8. Disconnect leaves the songs in Drive.
   AoG-Studio-Locker.gs is the Drive side. This file is the desk side.
   ════════════════════════════════════════════════════════════════════════════ */
/* ── your locker ── */
const LOCK_URL_RE=/^https:\/\/script\.google\.com\/(?:a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]{10,200}\/exec$/;
const LOCK_KEY_RE=/^[A-Za-z0-9_-]{8,100}$/;
const LOCK_DID_RE=/^[a-z0-9]{8,40}$/;   /* AOG-LOCKER-V2: this device's own id, kept beside the address and key (so it is kept as they are) */
function lockGet(){ try{ const o=JSON.parse(localStorage.getItem(LOCK_KEY)||"null"); if(o && LOCK_URL_RE.test(o.url) && LOCK_KEY_RE.test(o.key)) return {url:o.url, key:o.key, did:LOCK_DID_RE.test(o.did||"") ? o.did : ""}; }catch(e){} return null; }
function lockSet(o){
  LKN.has.clear();   /* AOG-LOCKER-V3: what this device knows the locker has, for this locker only */
  if(o && !LOCK_DID_RE.test(o.did||"")){ const was=CARRY.lock || lockGet(); o={url:o.url, key:o.key, did:was && LOCK_DID_RE.test(was.did||"") ? was.did : newSid()+newSid()}; }
  try{ if(o) localStorage.setItem(LOCK_KEY, JSON.stringify({url:o.url, key:o.key, did:o.did})); else localStorage.removeItem(LOCK_KEY); }catch(e){} CARRY.lock=o; if(o) lockKeep(); }
/* AOG-STUDIO-LOCKER-KEEP-V1: ask the browser to keep this site's storage, so Safari does not clear the locker after a week away.
   Only Disconnect removes it here; the front page's clear and reset buttons and the dashboard's Delete everything keep it, and the
   dashboard's backup file leaves the key out. */
function lockKeep(){ try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(()=>{}); }catch(e){} }
async function lockPost(body, lk){
  lk=lk||CARRY.lock; if(!lk) throw new Error("none");
  let r;
  try{ r=await fetch(lk.url, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(Object.assign({key:lk.key}, body))}).then(x=>x.json()); }
  catch(e){ const err=new Error("reach"); err.reach=true; throw err; }
  if(!r || !r.ok){ const err=new Error(r && typeof r.error==="string" ? r.error.slice(0,200) : "fail"); err.key=r && r.error==="key"; err.locker=!!(r && typeof r.error==="string"); throw err; }
  return r;
}
function lockState(e, hello){ return e && e.key ? "key" : e && e.reach ? "reach" : (e && e.sheet) || hello ? "sheet" : "reach"; }
function lockErr(e){ return e && e.key ? t("lockWrongKey") : e && e.reach ? t("lockNoReach") : (e && e.locker && e.message && !/^(fail|none)$/.test(e.message) ? e.message : t("fail")); }   /* AOG-LOCKER-V3: only the locker's own words, never a browser's */
function b64Of(blob){ return new Promise((ok,no)=>{ const fr=new FileReader(); fr.onload=()=>{ const s=String(fr.result); ok(s.slice(s.indexOf(",")+1)); }; fr.onerror=()=>no(fr.error); fr.readAsDataURL(blob); }); }
/* a megabyte of text at a time (AOG-LOCKER-V3), so no one step needs a 4 MB string on a phone */
function blobOfB64(b64){ const out=[];
  for(let o=0;o<b64.length;o+=1048576){ const bin=atob(b64.slice(o, o+1048576)), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); out.push(u); }
  return new Blob(out); }
/* AOG-LOCKER-V3 (Jimmy's iPad, 2026-10-23: "The string contains invalid characters." under the locker): WebKit's words when
   atob is handed something that is not base64, here an answer's "data" that was missing. Every piece that comes down is
   checked now: the answer says ok and carries base64 (spaces and line breaks taken out); if not, it is asked for once more,
   and then the open stops with a plain line and carries on next time. */
function cleanB64(d){ const s=typeof d==="string" ? d.replace(/\s+/g,"").replace(/-/g,"+").replace(/_/g,"/") : "";
  return s && s.length%4===0 && /^[A-Za-z0-9+/]+={0,2}$/.test(s) ? s : ""; }
async function lockPiece(body){
  let last=null;
  for(let k=0;k<2;k++){
    try{ const r=await lockPost(body), b=cleanB64(r.data); if(b){ try{ return blobOfB64(b); }catch(e){ last=e; } } else last=new Error("piece"); }
    catch(e){ if(e && e.key) throw e; last=e; }
  }
  const err=new Error("piece"); err.piece=true; err.reach=!!(last && last.reach); throw err;
}
/* pieces that came down are kept on this device ("lkp|<song or recording>|<n>|<when>") until the song is open, so pressing
   Open again carries on; the tidy keeps them 3 days */
const LKP="lkp|";
async function lkpHave(){ const m=new Map(); for(const k of await skeys()) if(typeof k==="string" && k.indexOf(LKP)===0){ const q=k.split("|"); m.set(q[1]+"|"+q[2], k); } return m; }
async function lkpGet(m, src, n){ const k=m.get(src+"|"+n); if(!k) return null; const v=await sget(k); return v && v.b && typeof v.b.size==="number" ? v.b : null; }
function lkpPut(src, n, b){ const k=LKP+src+"|"+n+"|"+Date.now().toString(36); return sput(k, {b:b}).then(()=>k); }
async function lkpDrop(src){ for(const k of await skeys()) if(typeof k==="string" && k.indexOf(LKP)===0 && (!src || k.split("|")[1]===src)) await sdel(k); }
/* n pieces of one thing, those kept here first, the rest 3 at once */
async function lockPieces(src, n, ask, got){
  const m=await lkpHave(), out=new Array(n), todo=[];
  for(let i=0;i<n;i++){ const b=await lkpGet(m, src, i); if(b){ out[i]=b; got(b.size); } else todo.push(i); }
  await lockPool(todo, async i=>{ let b=await lockPiece(ask(i));
    try{ const v=await sget(await lkpPut(src, i, b)); if(v && v.b && v.b.size===b.size) b=v.b; }catch(e){}   /* the stored copy: kept on the device, not in memory */
    out[i]=b; got(b.size); });
  return out;
}
/* AOG-LOCKER-V2: the device link opens the Studio at the Mixing Desk (the-studio.html passes it on); the same link the locker
   script's "link" prints. The part after # never reaches a server. A link to the desk's own address still works. */
function pairLink(){ const lk=CARRY.lock; return lk ? location.origin+"/the-studio#locker="+encodeURIComponent(lk.url)+"&k="+encodeURIComponent(lk.key) : ""; }
/* a link from another device: #locker=<address>&k=<key> */
function lockFromHash(){
  const h=location.hash||""; if(h.indexOf("#locker=")!==0) return false;
  const q=new URLSearchParams(h.slice(1)), url=q.get("locker")||"", key=q.get("k")||"";
  try{ history.replaceState(null, "", location.pathname+location.search); }catch(e){}
  if(!LOCK_URL_RE.test(url) || !LOCK_KEY_RE.test(key)) return false;
  lockSet({url:url, key:key}); return true;
}
/* AOG-LOCKER-V2: the whole device link pasted into the web address box: its address and key go in their boxes */
function lockPasted(){
  const box=$("lkUrl"), v=(box && box.value||"").trim(), m=/#locker=([^&\s#]+)&k=([^&\s#]+)/.exec(v); if(!m) return false;
  let url="", key=""; try{ url=decodeURIComponent(m[1]); key=decodeURIComponent(m[2]); }catch(e){ return false; }
  if(!LOCK_URL_RE.test(url) || !LOCK_KEY_RE.test(key)) return false;
  box.value=url; $("lkKey").value=key; return true;
}
async function lockConnect(){
  lockPasted();
  const line=$("lockLine"), url=($("lkUrl").value||"").trim(), key=($("lkKey").value||"").trim();
  if(!LOCK_URL_RE.test(url)){ line.textContent=t("lockBadUrl"); $("lkUrl").focus(); return; }
  if(!LOCK_KEY_RE.test(key)){ line.textContent=t("lockNoKey"); $("lkKey").focus(); return; }
  /* AOG-STUDIO-LOCKER-LIGHTS-V1: the IEP Sheet's own address is the usual mix-up; it answers "Unknown action" */
  let sheet=""; try{ sheet=localStorage.getItem("aog.sync.url")||""; }catch(e){}
  if(sheet && sheet.trim()===url){ CARRY.st="sheet"; line.textContent=""; paintLocker(); return; }
  line.textContent=t("connecting"); CARRY.busy=true; CARRY.st="wait"; paintLocker();
  try{
    const r=await lockPost({action:"hello"}, {url:url, key:key});
    if(!r.locker){ const err=new Error("sheet"); err.sheet=true; throw err; }
    lockSet({url:url, key:key}); CARRY.ver=r.locker; line.textContent=t("lockOn"); CARRY.busy=false; await lockList(true); lockCheck(true);   /* AOG-LOCKER-V2: one kind line: connected */
  }
  catch(e){ CARRY.st=lockState(e, true); line.textContent=""; CARRY.busy=false; }
  paintLocker();
}
async function lockList(quiet){
  const line=$("lockLine");
  if(!quiet) line.textContent=t("lockChecking");
  if(CARRY.st!=="ok"){ CARRY.st="wait"; paintLocker(); }
  try{ const r=await lockPost({action:"list", v:3}); CARRY.songs=Array.isArray(r.songs) ? r.songs : []; CARRY.st="ok"; CARRY.at=Date.now(); CARRY.ver=Math.max(1, +r.locker||1); CARRY.stale=false; if(!quiet) line.textContent=""; }
  catch(e){ CARRY.st=lockState(e); if(!quiet) line.textContent=""; }
  paintLocker();
}
/* o.auto: the keep-in-locker switch (or Keep mine): quiet, the locker's panel is not drawn again */
async function lockSave(o){
  o=o||{}; const auto=!!o.auto, line=$("lockLine");
  if(!hasClips()){ if(!auto) line.textContent=t("fileNeed"); return; }
  if(CARRY.busy || KEEP.busy){ if(auto) KEEP.wait=true; else line.textContent=t("keepGoing"); return; }
  if(auto){ KEEP.busy=true; KEEP.fail=false; KEEP.failW=""; keepLine(); } else { CARRY.busy=true; paintLocker(); line.textContent=t(lockV3() ? "keepGoing" : "fileMaking"); }   /* AOG-LOCKER-V3: no song file is made for a v3 locker */
  /* AOG-LOCKER-V3: an old script is sent the whole song each time, so the switch never sends a big one there: it says once
     to update the script */
  if(auto && !lockV3()){
    let big=false; try{ big=await songBytes()>OLD_KEEP_MAX; }catch(e){}
    if(big){ KEEP.busy=false; if(!KEEP.old){ KEEP.old=true; paintLocker(); } keepLine(); if(o.mine){ KEEP.note=t("oldBig"); paintNewer(); } return; }   /* Keep mine says why */
    if(KEEP.old){ KEEP.old=false; paintLocker(); }
  }
  const sig=songSig(), sid=SONG.sid, dev=lockDev(), v3=lockV3();   /* AOG-LOCKER-V2: the song as it is now, which song, and this device */
  const P={a:0, b:0, big:false};
  /* the MB words, where they are seen: the locker's line, or under the switch (and, for a big save, on the console) */
  const say=(a,b)=>{ P.a=a; P.b=b; const w=t("lockSaving", mbPair(a,b));
    if(v3 && b>=LOCK_BIG && !P.big){ P.big=true; bigLine(true, auto); }
    if(auto){ KEEP.prog=w; keepLine(); if(P.big){ KEEP.note=w; paintNewer(); } } else line.textContent=w; };
  let ok=false;
  try{
    const name=songTitle(); let r;
    if(v3) r=await lockSave3(name, sid, dev, say);
    else {
      const blob=await songFile(); if(!blob) throw new Error("fail");
      const n=Math.ceil(blob.size/LOCK_PART);
      const b=await lockPost({action:"begin", name:name, size:blob.size, parts:n, sid:sid, dev:dev});
      let done=0; if(n>1) say(0, blob.size);
      await lockPool(Array.from({length:n}, (x,i)=>i), async i=>{ const piece=blob.slice(i*LOCK_PART, (i+1)*LOCK_PART);
        await lockPost({action:"part", id:b.id, n:i, data:await b64Of(piece)}); done+=piece.size; if(n>1) say(done, blob.size); });
      const f=await lockPost({action:"finish", id:b.id});
      r={id:b.id, at:+f.at||Date.now()};
    }
    LK={sid:sid, id:r.id, at:r.at, dev:dev, sig:sig, skip:""}; keepPut(); ok=true;
    if(KEEP.newer && KEEP.newer.sid===sid){ KEEP.newer=null; KEEP.both=false; }
    if(o.mine || (auto && P.big)) KEEP.note=t("keepAt",{d:devWord(dev), t:whenWords(LK.at)});   /* it says it is saved where it said to wait */
    if(!auto){ line.textContent=t("lockSaved",{name:name}); CARRY.busy=false; await lockList(true); }
    else CARRY.stale=true;
  }catch(e){
    /* AOG-LOCKER-V3: a big save cut off (the screen locked, another app, no connection) carries on the next time */
    const w=v3 && e && e.reach && P.b>0 ? t("lockStopped", mbPair(P.a, P.b)) : lockErr(e);
    if(auto){ KEEP.fail=true; KEEP.failW=v3 && e && e.reach && P.b>0 ? w : ""; if(o.mine || P.big) KEEP.note=w; }
    else { line.textContent=w; CARRY.busy=false; }
  }
  if(P.big) bigLine(false, auto);
  if(auto){ KEEP.busy=false; KEEP.prog=""; keepLine(); paintNewer(); } else paintLocker();
  try{ paintInbox(); paintVoice(); }catch(e){}
  if(ok && keepOK() && keepDirty()) keepSoon();   /* it changed while it went up: once more, a little later */
}
/* ══════════════════════════════════════════════════════════════════════════
   AOG-LOCKER-V3 (2026-10-23) — Jimmy's song on his iPhone went up as "4 of 27": 27 pieces of 4 MB, one after another, and
   the switch sent all of it again after every change. Now each recording goes to the locker once, under its content id
   (clip id, size, CRC32 of its bytes: "<id>-<size>-<crc>"), into the locker's Recordings folder; a save is the song itself
   and the list of recordings it uses (songPut). The desk sends only what the locker lacks (have, with begin: it also says
   which pieces of a half-sent recording arrived, so a stopped save carries on), 3 pieces at once, in MB words. What this
   device knows the locker has (LKN) is kept for the session, so moving a fader is one request of a few KB; songPut checks
   it, and names any recording it no longer has. Opening a v3 save fetches only the recordings this device lacks (its own
   content ids are worked out once and kept at "rid|<id>"; any new sound under that id drops it). An old (v1, v2) script
   gets the whole song as before, but the switch never sends a song over 15 MB there: it says once to update the script.
   ══════════════════════════════════════════════════════════════════════════ */
const LOCK_PAR=3, LOCK_BIG=8*1048576, OLD_KEEP_MAX=15*1048576, LOCK_RID_RE=/^c[a-z0-9]{4,40}-[1-9][0-9]{0,9}-[0-9a-f]{8}$/;
const LKN={has:new Set()};
function lockV3(){ return !!CARRY.lock && CARRY.ver>=3; }
function lockKnown(){ return LKN.has; }
/* "34 of 108 MB": whole MB, or tenths under 10 MB */
function mbPair(a, b){ const d=b<10*1048576 ? 1 : 0, f=x=>(Math.max(0, x)/1048576).toFixed(d); return {a:f(Math.min(a, b)), b:f(b)}; }
/* the line to keep the screen open, only while a big save goes up: under the locker's line, and on the console for the switch */
function bigLine(on, auto){
  const el=$("lkBig"); if(el){ const w=on ? t("bigHint") : ""; if(el.textContent!==w) el.textContent=w; el.hidden=!on; }
  if(auto){ KEEP.hint=on; paintNewer(); }
}
/* up to 3 requests at once; the first that fails stops the rest from starting, and is thrown once those running settle */
async function lockPool(jobs, fn){
  let i=0, err=null;
  const lane=async ()=>{ while(!err && i<jobs.length){ const j=jobs[i++]; try{ await fn(j); }catch(e){ if(!err) err=e; } } };
  await Promise.all(Array.from({length:Math.min(LOCK_PAR, jobs.length)}, lane));
  if(err) throw err;
}
/* the song's recordings, in bytes, without reading them */
async function songBytes(){ let n=0; const seen=new Set();
  for(const c of dmAllClips()){ if(seen.has(c.id)) continue; seen.add(c.id); const v=await sget(c.id); if(v && v.wav) n+=v.wav.size; }
  return n; }
/* a recording's content id, worked out once */
async function ridOf(id){
  const v=await sget(id); if(!v || !v.wav || !(v.wav.size>44)) return null;
  const k=await sget("rid|"+id), size=v.wav.size;
  if(k && k.size===size && typeof k.rid==="string" && LOCK_RID_RE.test(k.rid) && k.rid.indexOf(id+"-")===0) return {id:id, rid:k.rid, size:size, wav:v.wav};
  const rid=id+"-"+size+"-"+(await crcBlob(v.wav)).toString(16).padStart(8,"0");
  if(!LOCK_RID_RE.test(rid)) return null;
  await sput("rid|"+id, {rid:rid, size:size});
  return {id:id, rid:rid, size:size, wav:v.wav};
}
/* the recordings the song file would carry: each clip and take once */
async function lockRecs(){ const out=[], seen=new Set();
  for(const c of dmAllClips()){ if(seen.has(c.id)) continue; seen.add(c.id); const r=await ridOf(c.id); if(r) out.push(r); }
  return out; }
/* the recordings the locker lacks, up: it says which it has whole and which pieces of the rest arrived; the rest go, 3 at once */
async function recsUp(list, say){
  if(!list.length) return;
  const h=await lockPost({action:"have", begin:true, recs:list.map(r=>({rid:r.rid, size:r.size, parts:Math.ceil(r.size/LOCK_PART), piece:LOCK_PART}))});
  const have=new Set(Array.isArray(h.have) ? h.have : []), part=h.part && typeof h.part==="object" ? h.part : {}, jobs=[];
  let total=0, done=0;
  for(const r of list){
    if(have.has(r.rid)){ lockKnown().add(r.rid); continue; }
    const n=Math.ceil(r.size/LOCK_PART), got=new Set(Array.isArray(part[r.rid]) ? part[r.rid] : []);
    total+=r.size;
    for(let k=0;k<n;k++){ const len=Math.min(LOCK_PART, r.size-k*LOCK_PART); if(got.has(k)) done+=len; else jobs.push({r:r, k:k, len:len}); }
  }
  if(!jobs.length) return;
  say(done, total);
  await lockPool(jobs, async j=>{
    await lockPost({action:"recPart", rid:j.r.rid, n:j.k, data:await b64Of(j.r.wav.slice(j.k*LOCK_PART, j.k*LOCK_PART+j.len))});
    done+=j.len; say(done, total); });
}
/* a v3 save: the recordings the locker lacks, then the song */
async function lockSave3(name, sid, dev, say){
  const recs=await lockRecs(); if(!recs.length) throw new Error("fail");
  const man=JSON.stringify({kind:"aog-song", v:3, at:Date.now(), app:"The Mixing Desk", song:SONG, clips:recs.map(r=>({id:r.id, size:r.size, rid:r.rid}))});
  const body={action:"songPut", name:name, sid:sid, dev:dev, song:man, recs:recs.map(r=>r.rid)};
  await recsUp(recs.filter(r=>!lockKnown().has(r.rid)), say);
  let p=await lockPost(body);
  if(Array.isArray(p.missing) && p.missing.length){   /* the locker no longer has some (tidied, or the song was removed on another device): once more */
    const miss=new Set(p.missing); miss.forEach(x=>lockKnown().delete(x));
    await recsUp(recs.filter(r=>miss.has(r.rid)), say);
    p=await lockPost(body);
  }
  if(!p.id) throw new Error("fail");
  recs.forEach(r=>lockKnown().add(r.rid));
  return {id:p.id, at:+p.at||Date.now()};
}
/* a v3 save, down: the song, the recordings this device already has (the same to the byte) taken from here, the rest
   fetched 3 pieces at once and checked against their content id; null when it is not a song */
async function lockGet3(sg, say){
  const m=await lockPost({action:"songGet", id:sg.id});
  let h=null; try{ h=JSON.parse(m.song); }catch(e){ return null; }
  if(!h || h.kind!=="aog-song" || h.v!==3 || !Array.isArray(h.clips) || !h.clips.length || h.clips.length>NT*(DM_MAX_TAKES+1)) return null;
  const info=m.recs && typeof m.recs==="object" ? m.recs : {}, wavs=new Map(), local=new Set(), rids=new Map(), need=[];
  for(const c of h.clips){
    if(!c || typeof c.id!=="string" || !/^c[a-z0-9]{4,40}$/.test(c.id) || typeof c.rid!=="string" || !LOCK_RID_RE.test(c.rid) || c.rid.indexOf(c.id+"-")!==0) return null;
    if(wavs.has(c.id) || need.some(x=>x.id===c.id)) continue;
    const size=+c.rid.split("-")[1], mine=await ridOf(c.id);
    if(mine && mine.rid===c.rid){ wavs.set(c.id, mine.wav); local.add(c.id); lockKnown().add(c.rid); continue; }
    const x=Object.prototype.hasOwnProperty.call(info, c.rid) ? info[c.rid] : null, parts=Math.floor(+(x && x.parts)), piece=Math.floor(+(x && x.piece));
    if(!x || +x.size!==size || !(parts>=1 && parts<=200) || !(piece>=1) || Math.ceil(size/piece)!==parts) return null;
    need.push({id:c.id, rid:c.rid, size:size, parts:parts, ps:new Array(parts)});
  }
  const total=need.reduce((a,x)=>a+x.size, 0), jobs=[], kept=need.length ? await lkpHave() : new Map(); let done=0;
  for(const x of need) for(let k=0;k<x.parts;k++){ const b=await lkpGet(kept, x.rid, k); if(b){ x.ps[k]=b; done+=b.size; } else jobs.push({x:x, k:k}); }   /* pieces that came down last time */
  if(total) say(done, total);
  await lockPool(jobs, async j=>{ let b=await lockPiece({action:"recGet", rid:j.x.rid, n:j.k});
    try{ const v=await sget(await lkpPut(j.x.rid, j.k, b)); if(v && v.b && v.b.size===b.size) b=v.b; }catch(e){}
    j.x.ps[j.k]=b; done+=b.size; say(done, total); });
  for(const x of need){
    const blob=new Blob(x.ps, {type:"audio/wav"});
    if(blob.size!==x.size || (await crcBlob(blob)).toString(16).padStart(8,"0")!==x.rid.slice(-8)){ await lkpDrop(x.rid); return null; }   /* every byte as it was saved */
    wavs.set(x.id, blob); rids.set(x.id, {rid:x.rid, size:x.size});
  }
  const song=cleanSong(h.song);
  song.tracks.forEach(x=>{ if(x.clip && !wavs.has(x.clip.id)) x.clip=null; dmTakesHave(x, wavs); });
  if(!song.tracks.some(x=>x.clip)) return null;
  return {song:song, wavs:wavs, local:local, rids:rids};
}

/* a song in the list, or one of its earlier saves */
function lockFind(id){
  for(const s of CARRY.songs||[]){
    if(s.id===id) return {id:s.id, name:s.name, parts:s.parts, size:+s.size||0, v:s.v===3 ? 3 : 0, at:s.at, dev:s.dev, sid:s.sid, top:s.id};
    for(const e of (Array.isArray(s.earlier) ? s.earlier : [])) if(e && e.id===id) return {id:e.id, name:s.name, parts:e.parts, size:+e.size||0, v:e.v===3 ? 3 : 0, at:e.at, dev:e.dev, sid:s.sid, top:s.id};
  }
  return null;
}
async function lockOpen(id){
  const sg=lockFind(id); if(!sg) return;
  askOpen(sg.name, ()=>lockFetch(sg));
}
/* the song's pieces, down, onto the desk; this device now knows it as that save */
async function lockFetch(sg, top){
  const line=$("lockLine");
  CARRY.busy=true; paintLocker();
  try{
    const say=(a,b)=>{ line.textContent=t("lockLoading", mbPair(a,b)); };
    let r=null;
    if(sg.v===3) r=await lockGet3(sg, say);   /* AOG-LOCKER-V3: the song, and only the recordings this device lacks */
    else {
      const n=Math.floor(+sg.parts); let done=0, tot=+sg.size||0;
      if(!(n>=1 && n<=200)) throw new Error("fail");
      if(!(tot>0)) tot=n*LOCK_PART;
      say(0, tot);
      const ps=await lockPieces(sg.id, n, i=>({action:"get", id:sg.id, n:i}), b=>{ done+=b; say(Math.min(done, tot), tot); });
      r=await readSongFile(new Blob(ps));
      if(!r) await lkpDrop(sg.id);   /* not a song after all: fetched afresh next time */
    }
    if(!r){ line.textContent=t("fileBad"); }
    else {
      line.textContent=t("reading"); await applySong(r); lkpDrop();
      if(r.rids) for(const [id, x] of r.rids){ await sput("rid|"+id, x); lockKnown().add(x.rid); }   /* checked as it came: its content id is known */
      line.textContent=t("opened",{name:sg.name});
      /* AOG-LOCKER-V2: an earlier save opened on purpose: the newest is not offered again */
      LK={sid:SONG.sid, id:sg.id, at:+sg.at||0, dev:DEVS.includes(sg.dev) ? sg.dev : "", sig:songSig(), skip:sg.top && sg.top!==sg.id ? sg.top : ""}; keepPut();
      KEEP.newer=null; KEEP.both=false; if(top) KEEP.note=t("opened",{name:sg.name});
    }
  }catch(e){   /* AOG-LOCKER-V3: a plain line, never a browser's words; pressing Open again carries on */
    const w=e && e.key ? t("lockWrongKey") : e && e.locker && !e.piece && !/^(fail|none|bad part|bad song|bad id)$/.test(e.message) ? e.message : t("lockOpenStopped");
    line.textContent=w; if(top) KEEP.note=w; }
  CARRY.busy=false; paintLocker(); paintNewer(); keepLine();
}
async function lockRemove(id){
  const line=$("lockLine"), sg=(CARRY.songs||[]).find(x=>x.id===id); CARRY.rmAsk="";
  if(!sg){ paintLocker(); return; }
  CARRY.busy=true; paintLocker();
  try{ await lockPost({action:"remove", id:id}); CARRY.songs=CARRY.songs.filter(x=>x.id!==id); line.textContent=t("lockRemoved",{name:sg.name});
    if(sg.sid && sg.sid===LK.sid){ LK.id=""; LK.at=0; LK.sig=""; keepPut(); } }   /* AOG-LOCKER-V2: v2 takes every save of it */
  catch(e){ line.textContent=lockErr(e); }
  CARRY.busy=false; paintLocker();
}

/* ══════════════════════════════════════════════════════════════════════════
   AOG-LOCKER-V2 (2026-10-23) — Jimmy has an iPhone, an iPad, computers and his family's; the locker, his no-account way to
   move songs between them, made a showstopper. Needs the v2 locker script (AoG-Studio-Locker.gs); with a v1 script the
   locker says once, plainly, to update it, and works as before.
   - one link: the script's "link" (and Send the link here) opens /the-studio#locker=<address>&k=<key>; the whole link pasted
     into the web address box works too (lockPasted).
   - the song follows you: "Keep this song in my locker" saves quietly about 20 s after the last change (one timer, reset by
     each change; none at rest), and when the page is hidden, if anything changed since the last save. Never while it plays
     or records, or while the desk is out of sight in the Studio; never polls. Each save carries its device and time.
   - when the desk opens or comes back into view, it asks the locker once (check) whether this song (SONG.sid) has a newer save
     from another device: one calm line at the top, Open it / Keep this one, or, when both changed, Open the locker's / Keep
     mine. Nothing is replaced on its own.
   - a single take: Send to my locker on a take in Takes sent here (or the voice take on track 8) → the other device's Takes
     sent here, "from your iPhone". Fetched by the same check, and when Add a recording is opened; removed from the locker
     once received (the script drops it after 7 days). Sent as it is kept: take.json, take.wav and, for a voice, dry.wav.
   - the locker keeps the last 3 saves of a song; Earlier saves opens one.
   This device's own id (did) rides in aog.studio.locker.v1 beside the address and key, so it is kept as they are and is never
   in a backup or a song file. What this device knows of the song in the locker (its last save's id and time, the song as it
   was then) and the switch are in aog.studio.lockkeep.v1.
   ══════════════════════════════════════════════════════════════════════════ */
const KEEP_KEY="aog.studio.lockkeep.v1", KEEP_WAIT=20000, DEVS=["iPhone","iPad","Mac","Windows","Android","computer"];
const DEVW={iPhone:{en:"iPhone",es:"iPhone"}, iPad:{en:"iPad",es:"iPad"}, Mac:{en:"Mac",es:"Mac"}, Windows:{en:"Windows computer",es:"computadora con Windows"},
  Android:{en:"Android",es:"Android"}, computer:{en:"computer",es:"computadora"}};
const VOICE_SNDS=/^(clean|warm|radio|rap|echo|hall|tuned|robot|phone|deep|high|harmony|wide|slap|mega|old|ghost|chop|pop|custom)$/;
const KEEP={on:false, ready:false, timer:0, wait:false, busy:false, fail:false, hushed:false, checking:false, checked:0, newer:null, both:false, note:"", got:new Set(), sending:"", earl:"",
  prog:"", failW:"", hint:false, old:false};   /* AOG-LOCKER-V3: the MB words while it goes up; where a big save stopped; the line to keep the screen open; an old script and a big song */
let LK={sid:"", id:"", at:0, dev:"", sig:"", skip:""};
function keepGet(){ try{ const o=JSON.parse(localStorage.getItem(KEEP_KEY)||"null"); if(!o || typeof o!=="object") return; KEEP.on=o.on===true; const l=o.lk||{};
  LK={sid:typeof l.sid==="string" ? l.sid : "", id:typeof l.id==="string" ? l.id : "", at:+l.at||0, dev:DEVS.includes(l.dev) ? l.dev : "", sig:typeof l.sig==="string" ? l.sig : "", skip:typeof l.skip==="string" ? l.skip : ""}; }catch(e){} }
function keepPut(){ try{ localStorage.setItem(KEEP_KEY, JSON.stringify({on:KEEP.on, lk:LK})); }catch(e){} }
/* the device, from what the browser says it is (an iPad asking for the computer's pages says Macintosh, with a touch screen) */
function lockDev(){ const u=navigator.userAgent||"", tp=navigator.maxTouchPoints||0;
  if(/iPhone|iPod/.test(u)) return "iPhone";
  if(/iPad/.test(u) || (/Macintosh/.test(u) && tp>1)) return "iPad";
  if(/Android/.test(u)) return "Android";
  if(/Windows/.test(u)) return "Windows";
  if(/Macintosh|Mac OS X/.test(u)) return "Mac";
  return "computer"; }
function devWord(d){ return L(DEVW[d]||DEVW.computer); }
function whenWords(at){ const d=new Date(at); return sameDay(d) ? timeOf(d) : dayOf(d)+", "+timeOf(d); }
function lockV2(){ return !!CARRY.lock && CARRY.ver>=2; }
function lockDid(){ const lk=CARRY.lock; if(!lk) return ""; if(!LOCK_DID_RE.test(lk.did||"")) lockSet({url:lk.url, key:lk.key}); return CARRY.lock.did; }
/* the song as it is, short: what is on the tracks and the mix (not which track is picked, nor a level measured later) */
function songSig(){ const s=JSON.stringify(SONG, (k,v)=>k==="sel" || k==="peakDb" ? undefined : v); let h=2166136261>>>0;
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h, 16777619)>>>0; } return s.length.toString(36)+"."+h.toString(36); }
function lockMine(){ return !!LK.sid && LK.sid===SONG.sid; }
function keepDirty(){ return hasClips() && songSig()!==(lockMine() && LK.id ? LK.sig : ""); }
function keepHeld(){ return PLAY.on || VOICE.rec || VOICE.busy || CARRY.busy || KEEP.busy || S.busy || dmNoSave(); }
function keepOK(){ return KEEP.on && lockV2(); }
/* a change: save about 20 s after the last one */
function keepSoon(){
  if(!KEEP.ready || !keepOK()) return;
  clearTimeout(KEEP.timer); KEEP.timer=0;
  if(KEEP.hushed){ KEEP.wait=true; return; }
  KEEP.timer=setTimeout(()=>{ KEEP.timer=0; keepNow(); }, KEEP_WAIT);
}
function keepNow(){
  if(!keepOK()) return;
  if(keepHeld()){ KEEP.wait=true; return; }   /* never while it plays or records: once it stops */
  KEEP.wait=false;
  if(keepDirty()) lockSave({auto:true});
}
function keepAfter(){ if(KEEP.wait && !KEEP.timer) keepSoon(); }
/* the page is hidden: if anything changed, it goes now */
function keepHide(){ clearTimeout(KEEP.timer); KEEP.timer=0; if(KEEP.ready && keepOK() && !keepHeld() && keepDirty()){ KEEP.wait=false; lockSave({auto:true}); } }
function keepLine(){
  const el=$("lkKeepAt"); if(!el) return;
  const n=KEEP.newer && KEEP.newer.sid===SONG.sid ? KEEP.newer : lockMine() && LK.at ? LK : null;
  /* AOG-LOCKER-V3: while recordings go up, the MB words; when only the song changed it is saved at once, so the line simply
     moves on to the new time */
  const w=KEEP.prog ? KEEP.prog : KEEP.fail ? (KEEP.failW || t("keepFail")) : n ? t("keepAt",{d:devWord(n.dev), t:whenWords(n.at)}) : t("keepNot");
  if(el.textContent!==w) el.textContent=w;
}
function keepSwitch(on){
  KEEP.on=!!on; keepPut();
  if(on){ KEEP.ready=true; if(!keepHeld() && keepDirty()) lockSave({auto:true}); }
  else { clearTimeout(KEEP.timer); KEEP.timer=0; KEEP.wait=false; }
  keepLine();
}
/* one question when the desk opens, comes back into view, or Add a recording is opened: is there a newer save of this song
   from another device, and are there takes for this device */
async function lockCheck(force){
  if(!lockV2() || KEEP.checking || KEEP.hushed || CARRY.busy || document.hidden) return;   /* not while a song comes down or goes up */
  const now=Date.now(); if(!force && now-KEEP.checked<15000) return;
  KEEP.checking=true; KEEP.checked=now;
  try{
    const r=await lockPost({action:"check", sid:SONG.sid, did:lockDid(), v:3}), s=r.song;
    KEEP.note="";
    if(s && typeof s.id==="string" && s.id!==LK.id && s.id!==LK.skip && s.sid===SONG.sid && (+s.at||0)>(lockMine() ? LK.at : 0)){
      KEEP.newer={id:s.id, at:+s.at||0, dev:DEVS.includes(s.dev) ? s.dev : "computer", name:String(s.name||"").slice(0,120), parts:+s.parts, size:+s.size||0, v:s.v===3 ? 3 : 0, sid:SONG.sid};
      KEEP.both=lockMine() && !!LK.id && keepDirty();
    } else { KEEP.newer=null; KEEP.both=false; }
    paintNewer(); keepLine();
    if(Array.isArray(r.takes) && r.takes.length) await takesIn(r.takes);
  }catch(e){}
  KEEP.checking=false;
}
function paintNewer(){
  const box=$("lkNew"); if(!box) return;
  const n=KEEP.newer && KEEP.newer.sid===SONG.sid ? KEEP.newer : null;
  if(!n && !KEEP.note){ if(!box.hidden) box.hidden=true; return; }
  const w=n ? t(KEEP.both ? "newerBoth" : "newerOne",{d:devWord(n.dev), t:whenWords(n.at)}) : KEEP.note;
  if($("lkNewT").textContent!==w) $("lkNewT").textContent=w;
  const hh=$("lkNewH"), hw=!n && KEEP.hint ? t("bigHint") : "";   /* AOG-LOCKER-V3: only while a big save goes up */
  if(hh.textContent!==hw) hh.textContent=hw; hh.hidden=!hw;
  const a=$("lkNewOpen"), b=$("lkNewKeep");
  a.hidden=b.hidden=!n; $("lkNewRow").hidden=!n;
  if(n){ a.textContent=t(KEEP.both ? "bothOpen" : "newerOpen"); b.textContent=t(KEEP.both ? "bothKeep" : "newerKeep"); }
  box.hidden=false;
}
function newerOpen(){ const n=KEEP.newer; if(!n) return; KEEP.newer=null; KEEP.both=false; KEEP.note=""; paintNewer(); lockFetch(n, true); }
function newerKeep(){
  const n=KEEP.newer; if(!n) return; const both=KEEP.both; KEEP.newer=null; KEEP.both=false;
  if(both){ KEEP.note=t("keepGoing"); paintNewer(); lockSave({auto:true, mine:true}); }   /* Keep mine: it goes up as the newest */
  else { LK.skip=n.id; keepPut(); KEEP.note=""; paintNewer(); keepLine(); }
}

/* ── a single take between devices ── */
async function takeUp(meta, wav, dry, say){
  const files=[{name:"take.json", data:new TextEncoder().encode(JSON.stringify(Object.assign({kind:"aog-take", v:1}, meta)))},
    {name:"take.wav", data:new Uint8Array(await blobAB(wav))}];
  if(dry) files.push({name:"dry.wav", data:new Uint8Array(await blobAB(dry))});
  const blob=new Blob([zipStore(files)]), n=Math.ceil(blob.size/LOCK_PART);
  const label=typeof meta.name==="string" ? meta.name : L(meta.name)||"";
  const b=await lockPost({action:"takeBegin", size:blob.size, parts:n, dev:lockDev(), did:lockDid(), meta:{name:label.slice(0,120), from:meta.from||"", sec:meta.sec}});
  let done=0; if(n>1) say(t("lockSaving", mbPair(0, blob.size)));   /* AOG-LOCKER-V3: in MB, 3 pieces at once */
  await lockPool(Array.from({length:n}, (x,i)=>i), async i=>{ const piece=blob.slice(i*LOCK_PART, (i+1)*LOCK_PART);
    await lockPost({action:"takePart", id:b.id, n:i, data:await b64Of(piece)}); done+=piece.size; if(n>1) say(t("lockSaving", mbPair(done, blob.size))); });
  await lockPost({action:"takeFinish", id:b.id});
}
async function takeSendInbox(id){
  const x=INBOX.items.find(y=>y.id===id); if(!x || KEEP.sending || !lockV2()) return;
  const line=$("inboxLine"), name=takeLabel(x), say=w=>{ line.textContent=w; };
  KEEP.sending=id; say(t("takeSending",{name:name})); paintInbox();
  try{
    const it=await AOGHandoff.item(INBOX_KEY, id); if(!it || !it.wav || !(it.wav.size>44)) throw new Error("gone");
    const meta={}; ["from","n","name","sec","bpm","at","place","passSec","loops","bars","offset","live","notes","voice","snd","vhead","vbody","vbar"].forEach(k=>{ if(it[k]!=null) meta[k]=it[k]; });
    await takeUp(meta, it.wav, it.voice && it.dry && it.dry.size>44 ? it.dry : null, say);
    say(t("takeSent",{name:name}));
  }catch(e){ say(lockErr(e)); }
  KEEP.sending=""; paintInbox();
}
async function takeSendVoice(){
  const c=SONG.tracks[VOICE_T].clip; if(!c || !c.voice || KEEP.sending || !lockV2()) return;
  const line=$("recLine"), name=c.name||t("voiceH"), say=w=>{ line.textContent=w; };
  KEEP.sending="voice"; say(t("takeSending",{name:name})); paintVoice();
  try{
    const v=await sget(c.id); if(!v || !v.wav) throw new Error("gone");
    const d=c.dry ? await sget(c.dry) : null;
    const meta={from:"vocal", n:c.vn||1, name:{en:"Voice "+(c.vn||1), es:"Voz "+(c.vn||1)}, sec:c.sec, bpm:c.bpm||0, at:c.at||Date.now(), voice:true,
      vhead:c.head, vbody:c.body, vbar:c.startBar};
    if(c.snd) meta.snd=c.snd;
    await takeUp(meta, v.wav, d && d.wav ? d.wav : null, say);
    say(t("takeSent",{name:name}));
  }catch(e){ say(lockErr(e)); }
  KEEP.sending=""; paintVoice();
}
/* a take from the locker, read back and checked: only what a take sent here may hold */
async function takeRead(blob, x){
  const Z=await zipRead(blob); if(!Z || !Z.has("take.json") || !Z.has("take.wav")) return null;
  let h=null; try{ h=JSON.parse(new TextDecoder().decode(await blobAB(Z.get("take.json")))); }catch(e){ return null; }
  if(!h || h.kind!=="aog-take" || h.v!==1) return null;
  const wav=Z.get("take.wav"); if(!(wav.size>44)) return null;
  const it={take:true, from:TOOLS[h.from] ? h.from : "", sec:num(h.sec,0,36000,0), bpm:num(h.bpm,0,400,0), at:num(h.at,0,1e15,Date.now()),
    dev:DEVS.includes(x.dev) ? x.dev : "computer", wav:new Blob([await blobAB(wav)], {type:"audio/wav"})};
  if(!(it.sec>0)) return null;
  if(h.n>0) it.n=Math.round(num(h.n,1,1e6,1));
  const nm=v=>String(v||"").replace(/[\u0000-\u001f]/g,"").slice(0,120);
  if(typeof h.name==="string") it.name=nm(h.name); else if(h.name && typeof h.name==="object") it.name={en:nm(h.name.en), es:nm(h.name.es||h.name.en)};
  const pl=placeOf(h); if(pl) it.place=pl;
  if(h.passSec>0 && h.loops>0){ it.passSec=num(h.passSec,0.01,600,1); it.loops=Math.round(num(h.loops,1,64,1)); it.bars=Math.round(num(h.bars,0,512,0)); it.offset=num(h.offset,0,60,0); }
  if(h.live===true) it.live=true;
  if(h.notes && window.AOGPianoRoll){ const n=AOGPianoRoll.clean(h.notes); if(n) it.notes=n; }
  if(h.voice===true){ it.voice=true; if(VOICE_SNDS.test(h.snd)) it.snd=h.snd;
    it.vhead=num(h.vhead,0,10,0); it.vbody=num(h.vbody,0,36000,0); it.vbar=Math.round(num(h.vbar,1,MAX_BARS,1));
    const d=Z.get("dry.wav"); if(d && d.size>44) it.dry=new Blob([await blobAB(d)], {type:"audio/wav"}); }
  return it;
}
async function takesIn(list){
  let n=0;
  for(const x of list.slice(0,8)){
    if(!x || typeof x.id!=="string" || !/^k[a-z0-9]{6,40}$/.test(x.id) || KEEP.got.has(x.id)) continue;
    const parts=Math.floor(+x.parts); if(!(parts>=1 && parts<=40) || !(+x.size>0 && +x.size<=120*1048576)) continue;
    KEEP.got.add(x.id);
    try{
      const ps=[]; for(let i=0;i<parts;i++) ps.push(await lockPiece({action:"takeGet", id:x.id, n:i}));   /* AOG-LOCKER-V3: checked, asked once more */
      const it=await takeRead(new Blob(ps), x); if(!it) continue;   /* not a take: left for the locker to clear after 7 days */
      await AOGHandoff.add(INBOX_KEY, it, {key:"locker|"+x.id});   /* fetched twice, it is still one take */
      n++;
      await lockPost({action:"takeDone", id:x.id});
    }catch(e){ KEEP.got.delete(x.id); }
  }
  if(n) await refreshInbox();
}
async function lockPair(){
  const line=$("lockLine"), url=pairLink(); if(!url) return;
  try{ if(navigator.share){ await navigator.share({title:t("app"), url:url}); line.textContent=t("lockPairLine"); return; } }
  catch(e){ if(e && e.name==="AbortError") return; }
  try{ await navigator.clipboard.writeText(url); line.textContent=t("lockCopied"); }
  catch(e){ line.textContent=url; }
}
function lockQr(){ CARRY.qr=!CARRY.qr; paintLocker(); }
/* the code is drawn by qrcodejs (as on the dashboard), fetched the first time it is asked for */
function drawQr(){
  const draw=()=>{ const box=$("lkQr"); if(!box || !CARRY.qr || !window.QRCode) return; box.innerHTML="";
    new QRCode(box, {text:pairLink(), width:220, height:220, colorDark:"#000000", colorLight:"#ffffff", correctLevel:QRCode.CorrectLevel.M});
    const img=box.querySelector("img"); if(img) img.alt=t("lockQrAlt"); box.setAttribute("aria-label", t("lockQrAlt")); };
  if(window.QRCode){ draw(); return; }
  if(drawQr.loading) return; drawQr.loading=true;
  const sc=document.createElement("script");
  sc.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"; sc.onload=draw;
  sc.onerror=()=>{ drawQr.loading=false; $("lockLine").textContent=t("lockNoReach"); CARRY.qr=false; paintLocker(); };
  document.head.appendChild(sc);
}
function lockOff(){ lockSet(null); CARRY.songs=null; CARRY.st=""; CARRY.ver=0; CARRY.qr=false; CARRY.rmAsk=""; $("lockLine").textContent=t("lockOffDone");
  clearTimeout(KEEP.timer); KEEP.timer=0; KEEP.wait=false; KEEP.newer=null; KEEP.both=false; KEEP.note=""; paintNewer();   /* AOG-LOCKER-V2 */
  paintLocker(); try{ paintInbox(); paintVoice(); }catch(e){} }
function sizeWords(n){ return t("mbN",{n:(Math.max(0.1, n/1048576)).toFixed(1)}); }
/* AOG-DESK-SONGS-BTN-V1: the console's Your songs button goes straight to saving and opening, the locker's light shows it is on */
function paintSongsBtn(){ const l=$("songsLed"), y=$("songsSay"); if(!l||!y) return; l.classList.toggle("on", !!CARRY.lock); const t2=t(CARRY.lock?"songsOn":"songsOff"); if(y.textContent!==t2) y.textContent=t2; }
function goSongs(){
  const b=$("carryBlk"); if(!b) return; foldOpen(b); b.scrollIntoView({block:"start"});
  const h=b.querySelector("h2"); if(h){ h.setAttribute("tabindex","-1"); try{ h.focus({preventScroll:true}); }catch(e){} }
  if(CARRY.lock){ try{ lockList(true); }catch(e){} }
  else { const d=b.querySelector("#locker details"); if(d) d.open=true; }
}
/* AOG-STUDIO-LOCKER-LIGHTS-V1: one light at the top of the locker, green when it answered, amber when something needs fixing */
function lockLight(){
  const st=CARRY.st, w=(c,h,s,x)=>`<p class="st-lkl ${c}"><i aria-hidden="true"></i><span><b>${esc(h)}</b><small>${esc(s)}</small>${x||""}</span></p>`;
  if(st==="wait") return w("wait", t("ltWait"), t("ltWaitS"));
  if(st==="sheet") return w("warn", t("ltSheet"), t("ltSheetS"));
  if(st==="key") return w("warn", t("ltKey"), t("ltKeyS"));
  if(st==="reach") return w("warn", t("ltReach"), t("ltReachS"));
  if(st==="ok" && CARRY.lock){
    let at=""; try{ at=new Date(CARRY.at).toLocaleTimeString(S.lang==="es"?"es":"en",{hour:"numeric",minute:"2-digit"}); }catch(e){}
    return w("ok", t("ltOk"), t("ltOkS",{v:CARRY.ver||1, n:(CARRY.songs||[]).length, at:at}));
  }
  return CARRY.lock ? w("wait", t("ltWait"), t("ltWaitS")) : w("", t("ltOff"), t("ltOffS"));
}
function paintLocker(){
  try{ paintSongsBtn(); }catch(e){}
  const box=$("locker"), lk=CARRY.lock, dis=CARRY.busy ? " disabled" : "";
  if(!lk){
    const keepU=$("lkUrl") ? $("lkUrl").value : "", keepK=$("lkKey") ? $("lkKey").value : "";
    box.innerHTML=`<div class="st-lk">${lockLight()}<p class="st-info">${esc(t("lockAbout"))}</p>
      <details${CARRY.st==="sheet" ? " open" : ""}><summary class="st-steps">${esc(t("lockSteps"))}</summary>
      <ol class="st-help"><li>${esc(t("lockS1"))}</li><li>${esc(t("lockS2")).replace(esc(t("lockScript")), `<a href="/AoG-Studio-Locker.gs" target="_blank" rel="noopener">${esc(t("lockScript"))}</a>`)}</li>
        <li>${esc(t("lockS3"))}</li><li>${esc(t("lockS4"))}</li><li>${esc(t("lockS5"))}</li></ol></details>
      <label class="st-field"><span class="st-lab">${esc(t("lockUrl"))}</span><input type="url" id="lkUrl" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="url" placeholder="https://script.google.com/macros/s/…/exec"></label>
      <label class="st-field"><span class="st-lab">${esc(t("lockKey"))}</span><input type="password" id="lkKey" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
      <div class="st-row"><button type="button" class="st-btn st-go" id="lkConnect"${dis}>${esc(t("connect"))}</button></div></div>`;
    $("lkUrl").value=keepU; $("lkKey").value=keepK;
    return;
  }
  const songs=CARRY.songs;
  const list=songs==null ? "" : !songs.length ? `<p class="st-info">${esc(t("lockEmpty"))}</p>` : songs.map(x=>{
    /* AOG-LOCKER-V2: which device saved it, and when; its earlier saves one tap away */
    const sub=(DEVS.includes(x.dev) ? [esc(devWord(x.dev)), esc(whenWords(x.at)), esc(sizeWords(x.size))] : [esc(madeWords(x.at)), esc(sizeWords(x.size))]).join(" · ");
    const earl=Array.isArray(x.earlier) ? x.earlier.filter(e=>e && typeof e.id==="string") : [];
    const ear=earl.length && CARRY.rmAsk!==x.id ? `<details class="st-earl" data-earl="${esc(x.id)}"${KEEP.earl===x.id ? " open" : ""}><summary>${esc(t("earlierH"))} (${earl.length})</summary>`+
      earl.map(e=>{ const d=devWord(DEVS.includes(e.dev) ? e.dev : "computer"), w=whenWords(e.at);
        return `<div class="st-erow"><span>${esc(DEVS.includes(e.dev) ? d+" · "+w : madeWords(e.at))}</span><button type="button" class="st-btn" data-lkopen="${esc(e.id)}" aria-label="${esc(t("earlierAria",{d:d, t:w}))}"${dis}>${esc(t("open"))}</button></div>`; }).join("")+`</details>` : "";
    const ask=CARRY.rmAsk===x.id ? `<div class="st-q" role="group" aria-label="${esc(t("lockRemoveAsk",{name:x.name}))}"><p>${esc(t("lockRemoveAsk",{name:x.name}))}</p>`+
      `<button type="button" class="st-btn st-clear" data-lkrmyes="${esc(x.id)}"${dis}>${esc(t("removeYes"))}</button><button type="button" class="st-btn" data-lkrmno="${esc(x.id)}">${esc(t("removeNo"))}</button></div>` : "";
    return `<div class="st-rec"><div class="st-rtx"><b>${esc(x.name)}</b><span class="st-cn">${sub}</span></div>`+
      `<button type="button" class="st-btn st-go" data-lkopen="${esc(x.id)}" aria-label="${esc(t("openAria",{name:x.name}))}"${dis}>${esc(t("open"))}</button>`+
      (CARRY.rmAsk===x.id ? "" : `<button type="button" class="st-btn st-clear" data-lkrm="${esc(x.id)}" aria-label="${esc(t("removeAria",{name:x.name}))}"${dis}>${esc(t("remove"))}</button>`)+ask+ear+`</div>`;
  }).join("");
  /* AOG-LOCKER-V2: the switch, and the last save under it; an old script says once to update it */
  const how=w=>`<div class="st-old"><p class="st-info">${esc(t(w))}</p><details><summary class="st-steps">${esc(t("oldHow"))}</summary><ol class="st-help"><li>${esc(t("oldS1"))}</li><li>${esc(t("oldS2")).replace(esc(t("oldScriptW")), m=>`<a href="/AoG-Studio-Locker.gs" target="_blank" rel="noopener">${m}</a>`)}</li><li>${esc(t("oldS3"))}</li></ol></details></div>`;
  const keep=CARRY.st!=="ok" ? "" : lockV2() ? `<div class="st-keep"><label class="st-ksw"><input type="checkbox" role="switch" id="lkKeep"${KEEP.on ? " checked" : ""}><span>${esc(t("keepSw"))}</span></label><p class="st-info" id="lkKeepAt" aria-live="polite"></p>${KEEP.old && !lockV3() ? how("oldBig") : ""}</div>` :
    how("oldScript");   /* AOG-LOCKER-V3: a v2 script and a big song: the same three steps, said once, under the switch */
  box.innerHTML=`<div class="st-lk">${lockLight()}${keep}
    <div class="st-row"><button type="button" class="st-btn st-go" id="lkSave"${dis}>${esc(t("lockSave"))}</button><button type="button" class="st-btn" id="lkRefresh"${dis}>${esc(t(CARRY.st==="ok" ? "lockRefresh" : "ltAgain"))}</button></div>
    <h3 class="st-h3" style="margin:.4rem 0 0">${esc(t("lockList"))}</h3>
    <div class="st-inb">${list}</div>
    <div class="st-row"><button type="button" class="st-btn" id="lkPair">${esc(t("lockPair"))}</button><button type="button" class="st-btn" id="lkQrBtn" aria-expanded="${CARRY.qr}">${esc(t(CARRY.qr ? "lockQrHide" : "lockQr"))}</button></div>
    <div class="st-qr" id="lkQr" role="img" aria-label="${esc(t("lockQrAlt"))}"${CARRY.qr ? "" : " hidden"}></div>
    ${CARRY.qr ? `<p class="st-info">${esc(t("lockPairLine"))}</p>` : ""}
    <div class="st-row"><button type="button" class="st-btn st-clear" id="lkOff">${esc(t("lockOff"))}</button></div></div>`;
  if(CARRY.qr) drawQr();
  keepLine();
}
window.AOGLock = {
  save: function (o) { return lockSave(o); },
  sendTake: function (id) { return takeSendInbox(id); },
  open: function (id) { return lockOpen(id); },
  paint: function () { return paintLocker(); },
  fromOther: function (take) { return !!(take && take.dev); }
};
