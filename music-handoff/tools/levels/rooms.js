/* AOG-LEVEL-EVEN-V1 (2026-10-17) — Jimmy: "I would like all the instruments to be checked for sound levels. I was trying to
   jam out on the bass and I was playing some notes and some scales were higher than others etc.."
   How loud is every note of every sound, room by room? Each room's own sound engine, offline (OfflineAudioContext), through
   the chain a player hears (the room's chain, its amp or finish, pedals off, the Room knob dry, the default volume): every
   playable note, one at a time, held 0.6 s, at a medium strength (and soft and hard where a room has layers), measured as
   BS.1770 does (K-weighted, LUFS) over the note's first 400 ms, and its peak (meter.inc.js).
   Used by music-handoff/tests/levels/even.js (the test) and make.js (which writes the trims). Ports 9338 and 9339 only.
     const R=require("./rooms.js"); const b=await R.open(9338); const bass=await R.strings(b, "bass"); … await R.close(b);
   Each measurer returns {sound id: [{m, s, v, f (the recording used), lufs, peak, kind}]} and its reference level. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path"), http=require("http");
const METER=fs.readFileSync(path.join(__dirname, "meter.inc.js"), "utf8");
/* and the existing level tests' own measure (bandt/measure.inc: K-weighted, the loudest 400 ms), for the starting levels */
const KW400=(0,eval)(fs.readFileSync(path.join(__dirname, "../../tests/bandt/measure.inc"), "utf8").replace(/^const MEASURE=/, ""));
const ROOT=process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TYPES={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".mp3":"audio/mpeg",".m4a":"audio/mp4",".ogg":"audio/ogg",".wav":"audio/wav",".txt":"text/plain",".json":"application/json",".svg":"image/svg+xml",".woff2":"font/woff2",".mjs":"text/javascript",".wasm":"application/wasm",".bin":"application/octet-stream"};
function serve(port){ return http.createServer((q,r)=>{ let u=decodeURIComponent(q.url.split("?")[0].split("#")[0]); if(u.endsWith("/")) u+="index.html"; let f=path.join(ROOT,u);
  if(!fs.existsSync(f) && fs.existsSync(f+".html")) f+=".html";
  fs.readFile(f,(e,d)=>{ if(e){ r.writeHead(404); return r.end(); } r.writeHead(200,{"content-type":TYPES[path.extname(f)]||"application/octet-stream"}); r.end(d); }); }).listen(port); }

/* several pages render side by side: none of them may be slowed as a page in the background is */
const ARGS=["--autoplay-policy=no-user-gesture-required", "--disable-background-timer-throttling", "--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows", "--disable-features=IntensiveWakeUpThrottling", "--js-flags=--expose-gc"];   /* gc: hundreds of offline contexts in a row */
let LAUNCH=null;
/* the browser again if it went away (a long run on a shared machine can lose it): one launch for every page that asks */
async function browser(h){ if(h.b && h.b.isConnected()) return h.b; if(!LAUNCH) LAUNCH=pw.chromium.launch({args:ARGS}).then(b=>{ h.b=b; LAUNCH=null; return b; }); return LAUNCH; }
async function open(port){ const h={srv:serve(port), port, b:null}; await browser(h); return h; }
async function close(h){ try{ if(h.b) await h.b.close(); }catch(e){} try{ h.srv.closeAllConnections(); }catch(e){} h.srv.close(); }
async function page(h, name, init){
  /* its own context, and no service worker: a worker the first page put in would serve the next pages itself (and the
     network beyond this machine), past the routes below */
  const cx=await (await browser(h)).newContext({serviceWorkers:"block"}), p=await cx.newPage(); p.on("close", ()=>{ cx.close().catch(()=>{}); }); const errs=[]; p.on("pageerror", e=>errs.push(e.message));
  if(process.env.AOG_LEVELS_TRACE) p.on("console", m=>{ const t=m.text(); if(/^lv /.test(t)) process.stderr.write(new Date().toISOString().slice(11,19)+" "+t+"\n"); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  /* the room's own address would open the Studio (AOG-STUDIO-ONLY-V1): the checks open each room on its own */
  await p.addInitScript(init || (()=>{}));
  await p.goto(`http://localhost:${h.port}/${name}`); await p.waitForTimeout(900);
  await p.addScriptTag({content:METER}); await p.addScriptTag({content:KW400});
  p.errs=errs; return p;
}

/* several pages at once (each its own renderer, so the renders really run side by side): each page takes the next id
   in turn, one evaluate per id; a page that crashes is opened again and the id tried once more */
async function spread(h, name, ids, n, fn, arg, init){
  const res={}, errs=[], tries={};
  /* arg.cache: a file of the sounds already measured this way (a long run picks up where it stopped) */
  const cache=arg && arg.cache, C0=cache && fs.existsSync(cache) ? JSON.parse(fs.readFileSync(cache, "utf8")) : {};
  const todo=ids.filter(id=>!(C0[id] && C0[id][id]));
  ids.forEach(id=>{ if(C0[id] && C0[id][id]) for(const [k,v] of Object.entries(C0[id])){ if(k==="__sets") Object.assign(res.__sets=res.__sets||{}, v); else res[k]=v; } });
  const worker=async()=>{ let p=null;
    while(todo.length){ const id=todo.shift();
      try{ if(!p || p.isClosed()) p=await Promise.race([page(h, name, init), new Promise((_,no)=>setTimeout(()=>no(new Error("the page did not open in 2 minutes")), 120000))]); const t0=Date.now();
        const r=await Promise.race([p.evaluate(fn, Object.assign({}, arg, {ids:[id]})), new Promise((_,no)=>{ setTimeout(()=>no(new Error("took over "+(+(process.env.AOG_LEVELS_MAXMIN||10))+" minutes")), (+(process.env.AOG_LEVELS_MAXMIN||10))*60000);
          /* a page whose renderer went away (a crash, or a machine that ends other programs' browsers) can leave its
             evaluate waiting for ever: it counts as a failure at once, and the sound is tried again on a new page */
          p.once("crash", ()=>no(new Error("the page crashed"))); p.once("close", ()=>no(new Error("the page closed"))); })]);
        for(const [k,v] of Object.entries(r)){ if(k==="__sets") Object.assign(res.__sets=res.__sets||{}, v); else res[k]=v; }
        if(cache && Array.isArray(r[id])){ const c=fs.existsSync(cache) ? JSON.parse(fs.readFileSync(cache, "utf8")) : {}; c[id]=r; fs.writeFileSync(cache, JSON.stringify(c)); }
        if(arg && arg.log) process.stderr.write(`  ${name} ${id} ${((Date.now()-t0)/1000).toFixed(0)} s\n`);
        /* arg.fresh: a new page for each sound (a room whose every note builds an amp keeps memory it never gives back) */
        if(arg && arg.fresh){ errs.push(...p.errs); try{ await Promise.race([p.close(), new Promise(r=>setTimeout(r,5000))]); }catch(e){} p=null; } }
      catch(e){ errs.push(id+": "+String(e.message).split("\n")[0]); if(process.env.AOG_LEVELS_TRACE) process.stderr.write("  retry "+id+": "+String(e.message).split("\n")[0]+"\n"); try{ if(p) await Promise.race([p.close(), new Promise(r=>setTimeout(r,5000))]); }catch(e2){} p=null;
        tries[id]=(tries[id]||0)+1; if(tries[id]<4) todo.push(id); }
    }
    if(p){ errs.push(...p.errs); try{ await p.close(); }catch(e){} } };
  await Promise.all(Array.from({length:Math.min(n, ids.length)}, worker));
  return {res, errs};
}
/* ── the Guitar and the Bass (strings_page.html): every string at every fret, each take of each recording in turn ── */
const STRINGS_FN=async(opt)=>{
  const res={}; let N=0;
  const one=async(id, m, v, s, o)=>{
    if(opt.trace) console.log("lv one "+id+" "+m+" "+v+" "+s);
    /* each render leaves an amp, its cabinet and a room behind: let them go every few renders, or a page runs out of memory */
    if((++N)%12===0 && window.gc) window.gc();
    const oc=new OfflineAudioContext(2, Math.round(44100*0.46), 44100); await AOGAmp.load(oc);
    S.sound=id; const ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSound(ch, id); setEra(ch, 0, 0);
    const vc=makeVoice(oc, ch, id, m, v, 0.05, s, o); if(!vc) return null;
    const buf=await oc.startRendering(), r=__lv.kw(buf, 0.05), R=vc.rec && REAL.sets[vc.rec.set];
    return {m, s, v, art:(o&&o.art)||"", f:vc.rec?vc.rec.f:null, i:R?R.meta.zones.findIndex(z=>z.f===vc.rec.f):-1, lay:vc.rec?vc.rec.v:null, k:vc.rec?vc.rec.k:null, lufs:r.lufs, peak:r.peak};
  };
  for(const id of opt.ids){
    await loadSound(id);
    if(!soundReady(id)){ res[id]={err:"recordings did not load"}; continue; }
    const R=REAL.sets[recOf(id)], rows=[];
    /* the strengths: the ones asked for, or one in the middle of each of the set's layers (opt.layers) */
    let V=opt.vels||[0.7];
    if(opt.layers && R){ const b=(R.meta.vel||[0]).concat([1]); V=b.slice(0,-1).map((x,i)=>+((x+b[i+1])/2).toFixed(3)); }
    /* opt.mute: the muted way to play too (chugs, the funk and pop patterns), where the set has short notes */
    const arts=[undefined].concat(opt.mute && GTR && R && (R.by.mute||R.by.stac) && !SOUNDS[id].rstac ? [{art:"mute"}] : []);
    /* the recording a note will play, as recVoice picks it (the takes move on in turn: pass keep to leave them where they
       were). A note on another string that plays the same recording at the same pitch sounds the same (but for a slap
       sound's pop on the high strings), so it is measured once and counted for each string */
    const snd=SOUNDS[id], slapS=!!(snd.rslap && R && R.slap && R.slap.length);
    const pick=(m, v, s, o, keep)=>{ if(!R) return null; const save=keep ? JSON.stringify(R.rr) : null;
      let kind=((o && o.art==="mute") || snd.rstac) ? (R.by.mute?"mute":R.by.stac?"stac":"sus") : "sus";
      let pk=recPick(R, kind, m, slapS ? 1 : Math.max(0.05, Math.min(1, v)), s); if(!pk && kind!=="sus") pk=recPick(R, "sus", m, slapS ? 1 : v, s);
      if(keep) R.rr=JSON.parse(save); return pk ? pk.z.f : null; };
    const done=new Map();
    for(const o of arts) for(const v of (o ? [0.74] : V)) for(let s=0; s<TUNING.length; s++) for(let f=0; f<=MAXF; f++){
      /* each take of the recording this note plays, in turn (opt.takes false: only the first) */
      const seen=new Set(), m=TUNING[s]+f;
      for(let k=0;k<4;k++){
        const zf=pick(m, v, s, o, true), key=zf+"|"+m+"|"+v+"|"+((o&&o.art)||"")+"|"+(slapS && s>=2 ? "pop" : "");
        if(zf && done.has(key)){ if(seen.has(zf)) break; pick(m, v, s, o, false); seen.add(zf); rows.push(Object.assign({}, done.get(key), {s})); if(opt.takes===false) break; continue; }
        const r=await one(id, m, v, s, o); if(!r || seen.has(r.f)) break; seen.add(r.f); rows.push(r); if(r.f) done.set(r.f+"|"+m+"|"+v+"|"+((o&&o.art)||"")+"|"+(slapS && s>=2 ? "pop" : ""), r);
        if(!R || opt.takes===false) break; }
    }
    res[id]=rows;
  }
  /* where the room's level is set (amp/b1: the C chord): the guitar's open C shape, the bass's low C where the hand is */
  const c={off:0, q:"maj"};
  res.__sets={}; opt.ids.forEach(id=>{ const R=REAL.sets[recOf(id)]; if(R && R.meta) res.__sets[id]={set:R.id, n:R.meta.zones.length}; });
  res.__ref=GTR ?shapeFor(c).map((f,s)=>f<0?null:{s, f, m:TUNING[s]+f, v:0.74}).filter(Boolean) : [(()=>{ const m=bassRoot(c), cl=cellFor(m); return {s:cl.s, f:cl.f, m, v:0.8}; })()];
  return res;
};
async function strings(h, inst, opt){
  opt=opt||{};
  const p=await page(h, `music-${inst}.html`); const ids=opt.only||await p.evaluate(()=>Object.keys(SOUNDS)); await p.close();
  return spread(h, `music-${inst}.html`, ids, opt.pages||3, STRINGS_FN, Object.assign({fresh:true}, opt));
}

/* each recording of a strings set by itself, as it reaches the amp (its level in the set: its gain over the median of
   its kind and strength, as recVoice sets it; its own pitch; no tone filter), so a recording that stands out from its
   neighbours can be given its own trim (set.json "t", dB). Every take, every string, every strength, the short ones too. */
const ZONES_FN=async(opt)=>{
  const res={};
  for(const set of opt.ids){
    const id=Object.keys(SOUNDS).find(k=>SOUNDS[k].rec===set); await loadSound(id); const R=REAL.sets[set];
    if(!R || R.state!=="ready"){ res[set]={err:"not ready"}; continue; }
    const L=R.lvl, top=R.top, rows=[];
    for(const z of R.meta.zones){ const b=R.buf[z.f]; if(!b) continue; const k=z.k||"sus", lay=z.v||1;
      const amp=(z.g||1)*(k==="sus" ? 1/L.long[lay] : k==="hammer" ? 0.7/(L.hammer[lay]||L.long[top]) : (L.short[top]/L.long[top])/L.mute);
      const oc=new OfflineAudioContext(1, Math.round(44100*0.5), 44100), src=oc.createBufferSource(), g=oc.createGain();
      src.buffer=b; src.playbackRate.value=recRate(z, z.m); g.gain.value=0.2*amp*Math.pow(10,(z.t||0)/20); src.connect(g); g.connect(oc.destination); src.start(0.05, R.at[z.f]);
      const r=__lv.kw(await oc.startRendering(), 0.05, k==="sus"||k==="hammer" ? 0.4 : 0.15);
      rows.push({f:z.f, m:z.m, s:z.s, v:lay, r:z.r||1, k, t:z.t||0, lufs:r.lufs, peak:r.peak}); }
    res[set]=rows;
  }
  return res;
};
async function zones(h, inst, sets){ return spread(h, `music-${inst}.html`, sets, 3, ZONES_FN, {}); }

/* ── the Piano (music-piano.html): every key the keyboard reaches (C1 to C7, with ◀ Lower and Higher ▶), each strength
   layer the sound's set has (soft, middle, loud), through the piano's chain (makeChain: its room, glue and limiter, the
   default volume, the pedals and the Room knob off) ── */
const PIANO_FN=async(opt)=>{
  const res={}, lo=opt.lo||24, hi=opt.hi||96;
  HANDS.rush=1;   /* every layer now, not in quiet moments */
  for(const id of opt.ids){
    const snd=SOUNDS[id];
    if(snd.kind==="sample"){ await loadSet(snd.set); const set=SETS[snd.set]; const t0=Date.now();
      while(set.done<set.total && Date.now()-t0<60000) await new Promise(r=>setTimeout(r,50)); }
    const set=snd.kind==="sample" ? SETS[snd.set] : null, lays=set ? (set.layers||["m","s","l"]) : ["m"];
    const V=opt.vels || (snd.tone==="felt" ? [0.6] : lays.map(l=>({s:0.3, m:0.6, l:0.9})[l]));
    const rows=[];
    /* the keys its recordings reach (three past the lowest and the highest): further out a sound is stretched past what it
       is (a glockenspiel five octaves down), which no trim makes into the instrument */
    const reach=set && !opt.full ? [Math.max(lo, set.notes[0]-3), Math.min(hi, set.notes[set.notes.length-1]+3)] : [lo, hi];
    for(const v of V) for(let m=reach[0]; m<=reach[1]; m++){
      S.sound=id; const oc=new OfflineAudioContext(2, Math.round(44100*1.2), 44100), ch=makeChain(oc);
      ch.master.gain.value=volGain(0.8); setSendLevel(ch, id); setEra(ch, 0, 0);
      const vc=makeVoice(oc, ch, id, m, v, 0.05); if(!vc) continue;
      /* a sound through a moving effect (the spinning speaker, the tremble, the vibraphone's motor, a chorus): its whole
         first second, so where the wobble happens to be when a note starts does not count */
      const r=snd.bus ? __lv.kw(await oc.startRendering(), 0.05, 1.0) : __lv.kw(await oc.startRendering(), 0.05, 0.4, 0.6);
      let n=null, lay=null; if(set && set.ready){ n=nearest(set, m); lay=v<0.42?"s":v<0.78?"m":"l"; if(snd.tone==="felt") lay="m"; if(!set.buf[n+lay]) lay=["m","l","s"].find(l=>set.buf[n+l]); }
      rows.push({m, v, n, lay, f:n!=null?n+lay:null, lufs:r.lufs, peak:r.peak});
    }
    res[id]=rows;
  }
  res.__sets={}; opt.ids.forEach(id=>{ const s=SOUNDS[id]; if(s.kind==="sample") res.__sets[id]={set:s.set, notes:SETS[s.set].notes, layers:SETS[s.set].layers||["m","s","l"]}; });
  return res;
};
async function piano(h, opt){
  opt=opt||{};
  const p=await page(h, "music-piano.html"); const ids=opt.only||await p.evaluate(()=>Object.keys(SOUNDS)); await p.close();
  return spread(h, "music-piano.html", ids, opt.pages||3, PIANO_FN, opt);
}

/* ── the Band (music-band.html): each player by itself, every note of its reach (a step past its lowest and highest
   recordings), held at the softest (its soft recording alone) and the hardest (its loud one alone) and in the middle
   (the two blended, as a key played at medium strength), and short (stac) where it has short notes; through the Band's
   chain, with the player's own sound picked (the solo sound, or the first group it plays in) ── */
const BAND_FN=async(opt)=>{
  const res={}, sets={};
  for(const inst of opt.ids){
    const sid=SOUNDS[inst] && lineup(inst).length===1 ? inst : Object.keys(SOUNDS).find(k=>partsOf(k).indexOf(inst)>=0 && !SOUNDS[k].lean && !SOUNDS[k].mono && !SOUNDS[k].one);
    if(!sid){ res[inst]={err:"no sound plays it alone"}; continue; }
    S.sound=sid; await loadSound(sid); const t0=Date.now();
    while(!soundReady(sid) && Date.now()-t0<60000) await new Promise(r=>setTimeout(r,50));
    const set=SETS[setKey(inst, sid)], man=MAN[inst]; if(!set || !set.ready){ res[inst]={err:"not ready"}; continue; }
    const [lo, hi]=rangeOf(inst), rows=[];
    const ways=(opt.vels||[0.05, 0.6, 1]).map(v=>({v, art:"sus"})).concat(man.stac.length ? [{v:0.6, art:"stac"}] : []);
    for(const w of ways) for(let m=lo; m<=hi; m++){
      const oc=new OfflineAudioContext(2, Math.round(44100*1.2), 44100), ch=makeChain(oc);
      ch.master.gain.value=volGain(0.8); setSendLevel(ch, sid); setEra(ch, 0, 0);
      const vc=makeVoice(oc, ch, inst, m, w.v, 0.05, w.art); if(!vc) continue;
      const r=__lv.kw(await oc.startRendering(), 0.05, w.art==="stac" ? 0.2 : 0.4, w.art==="stac" ? 0 : 0.6);
      /* which recordings it played (as windVoice picks them) */
      let f=null;
      if(w.art==="stac"){ const st=man.stac.filter(q=>set.buf[q+"t"]), n=nearest(st, m); if(Math.abs(n-m)<=4) f=n+"t"; }
      if(!f){ const avail=man.sus.filter(q=>set.buf[q+"s"]||set.buf[q+"l"]), n=nearest(avail.length?avail:man.sus, m);
        f=w.v<=0.1 ? (set.buf[n+"s"] ? n+"s" : n+"l") : w.v>=0.99 ? (set.buf[n+"l"] ? n+"l" : n+"s") : n+"*"; }
      rows.push({m, v:w.v, art:w.art, f, lufs:r.lufs, peak:r.peak});
    }
    res[inst]=rows; sets[inst]={sound:sid, mid:man.sus[Math.floor(man.sus.length/2)]};
  }
  res.__sets=sets;
  return res;
};
async function band(h, opt){
  opt=opt||{};
  const p=await page(h, "music-band.html"); const ids=opt.only||await p.evaluate(()=>Object.keys(PLAYER).filter(k=>k!=="kit" && MAN[k] && MAN[k].sus)); await p.close();
  return spread(h, "music-band.html", ids, opt.pages||3, BAND_FN, opt);
}

/* ── the Drum Machine's notes and chords banks (music-pads.html): every instrument (INST), every note its recordings
   reach (a step past the lowest and highest, C1 to C7 at most), soft, middle and hard, one pad at a time through the
   machine's own sound (the bus at 0.9 into its limiter, as pads/level.js renders it) with the instrument's level (LEVEL) ── */
const PADS_FN=async(opt)=>{
  const res={}, sets={};
  for(const id of opt.ids){
    const zs=await zonesOf(id); const urls=new Set(); zs.forEach(z=>zoneUrls(z).forEach(u=>urls.add(u)));
    await Promise.all([...urls].map(u=>getBuf(u).catch(()=>null)));
    const low=INST[id].g==="bass", bi=low?2:1;
    Object.assign(S.banks[bi], {type:"notes", inst:id, key:0, scale:"major", oct:low?2:4});
    const lo=Math.max(24, zs[0].m-2), hi=Math.min(96, zs[zs.length-1].m+2), rows=[];
    const keep=window.padDefs;
    for(const v of (opt.vels||(INST[id].g==="band" ? [0.01, 0.6, 1] : [0.3, 0.6, 0.9]))) for(let m=lo; m<=hi; m++){
      window.padDefs=()=>Array.from({length:typeof NP==="number"?NP:24}, ()=>({kind:"note", notes:[m], name:""}));   /* every pad this one note, so the page's own drawing finds a pad wherever it looks */
      READY[bi]={sig:sigOf(S.banks[bi]), state:"ready", zones:zs, got:1, total:1};
      const oc=new OfflineAudioContext(2, Math.round(44100*1.2), 44100), g=oc.createGain(), l=oc.createDynamicsCompressor();
      l.threshold.value=-3; l.knee.value=2; l.ratio.value=20; l.attack.value=0.002; l.release.value=0.12;
      g.gain.value=0.9; g.connect(l); l.connect(oc.destination);
      const T={c:oc, dest:g, open:[[],[],[],[]], chop:[null,null,null,null]};
      const vc=trigger(bi, 0, v, 0.05, T); if(!vc || !vc.parts || !vc.parts.length) continue;
      const r=__lv.kw(await oc.startRendering(), 0.05, 0.4, 0.6);
      /* which recordings it played: a band player at the hardest plays its soft one at nothing (cos 90°), so only the loud */
      const parts=vc.parts.length<2 ? vc.parts : v>=0.999 ? vc.parts.slice(1) : v<=0.05 ? vc.parts.slice(0,1) : vc.parts;   /* the softest hit is held to 0.05: its loud recording at 8 %, 22 dB under */
      rows.push({m, v, zm:nearest(zs, m).m, f:parts.map(u=>u.split("/").pop().replace(/\.mp3$/,"")).join("+"), url:parts[0], lufs:r.lufs, peak:r.peak});
    }
    window.padDefs=keep; READY[bi]={};
    res[id]=rows;
  }
  return res;
};
async function pads(h, opt){
  opt=opt||{};
  const init=()=>{ try{ localStorage.removeItem("aog.pads.v1"); }catch(e){} };
  const p=await page(h, "music-pads.html", init); const ids=opt.only||await p.evaluate(()=>Object.keys(INST)); await p.close();
  return spread(h, "music-pads.html", ids, opt.pages||3, PADS_FN, opt, init);
}

/* ── the recorded drum kits (aog-drumkit.js: the Drum Kit's and the Drum Machine's): every pad of every kit, soft, normal
   and accent, every take, one hit at the Drum Kit's level, its first 400 ms and its peak ── */
const KIT_FN=async(opt)=>{
  const res={};
  for(const b of opt.ids){
    await AOGDrumKit.load(b, {}, {}, x=>x, null);
    const rows=[];
    for(const id of Object.keys(AOGDrumKit.padNames(b)||{})) for(const [acc, lay] of [[3,"s"],[0,"m"],[2,"h"]]){
      const seen=[];
      for(let k=0;k<6;k++){
        const oc=new OfflineAudioContext(2, Math.round(44100*1.1), 44100);
        const o=AOGDrumKit.playDirect(oc, oc.destination, b, id, 0.05, acc, 0.46); if(!o) break;
        const d0=o.src.buffer.getChannelData(0), sig=o.src.buffer.length+":"+d0[200]+":"+d0[2000]+":"+d0[9000];   /* each new context has its own copy: the take is known by its samples */
        if(seen.indexOf(sig)>=0){ break; } seen.push(sig);
        const r=__lv.kw(await oc.startRendering(), 0.05, 0.4, 0.6);   /* a long stir or roll: its loudest 400 ms in its first second */
        rows.push({pad:id, name:(AOGDrumKit.padNames(b)||{})[id], lay, take:k+1, lufs:r.lufs, peak:r.peak});
      }
    }
    res[b]=rows;
  }
  return res;
};
async function kits(h, opt){
  opt=opt||{};
  const p=await page(h, "music-kit.html"); const ids=opt.only||await p.evaluate(()=>AOGDrumKit.ids.filter(b=>Object.keys(AOGDrumKit.padNames(b)||{}).every(id=>!AOGDrumKit.made(b,id)))); await p.close();
  return spread(h, "music-kit.html", ids, opt.pages||3, KIT_FN, opt);
}
/* ── the Turntables' starter crate: each record's loudness as the deck sets it (levelMatch: its own loudness brought to
   LEVEL_LUFS, within +9/−12 dB), and as BS.1770 measures the whole record after that trim ── */
const DECKS_FN=async(opt)=>{
  const res={}, dec=new OfflineAudioContext(2, 1, 44100);
  for(const f of opt.ids){
    const ab=await (await fetch("/audio/crate/"+f)).arrayBuffer(), buf=await new Promise((ok,no)=>dec.decodeAudioData(ab, ok, no));
    const L=buf.getChannelData(0), Rr=buf.numberOfChannels>1 ? buf.getChannelData(1) : null, own=AOGDJ.loudness(L, Rr, buf.sampleRate);
    const db=(own!=null && isFinite(own) && own>-60) ? Math.max(-12, Math.min(9, LEVEL_LUFS-own)) : 0;
    const r=__lv.kw(buf, 0, buf.duration);
    res[f]=[{own, trim:db, lufs:+(r.lufs+db).toFixed(2), peak:+(r.peak+db).toFixed(2)}];
  }
  return res;
};
async function decks(h, opt){
  opt=opt||{};
  const p=await page(h, "music-decks.html"); const ids=opt.only||await p.evaluate(async()=>(await (await fetch("/audio/crate/crate.json")).json()).map(c=>c.file)); await p.close();
  return spread(h, "music-decks.html", ids, opt.pages||2, DECKS_FN, opt);
}

/* ── where each sound starts: its C chord, as the room's own level test plays and measures it (before the room's glue,
   K-weighted, the loudest 400 ms: bandt/measure.inc), next to the grand piano's (the level every music tool is set to).
   The Piano as ep/allevel, the Guitar and the Bass as amp/b1 (two takes, their mean), the Band as bandt/level. ── */
const CHORD_FN={
  piano:async(opt)=>{ const res={}; HANDS.rush=1;
    for(const id of opt.ids){ const snd=SOUNDS[id]; if(snd.kind==="sample"){ await loadSet(snd.set); }
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,id,m,0.74*(j===3?0.85:1),0.05); if(vc) vc.stop(2.05, vc.tau); });
      res[id]=[{db:__kw(await oc.startRendering())}]; }
    return res; },
  strings:async(opt)=>{ const res={};
    for(const id of opt.ids){ await loadSound(id);
      const one=async()=>{ S.sound=id; VOICINGS.clear();
        const oc=new OfflineAudioContext(2, 44100*2.6, 44100); await AOGAmp.load(oc); const ch=makeChain(oc);
        ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        const c={off:0,q:"maj"}; let k=0;
        if(GTR){ shapeFor(c).forEach((f,s)=>{ if(f<0) return; const vc=makeVoice(oc,ch,id,TUNING[s]+f,0.74*(1-0.03*k),0.05+k*0.014,s); if(vc) vc.stop(2.05, vc.tau); k++; }); }
        else { const m=bassRoot(c), cl=cellFor(m), vc=makeVoice(oc,ch,id,m,0.8,0.05,cl?cl.s:null); if(vc) vc.stop(2.05, vc.tau); }
        return __kw(await oc.startRendering()); };
      const a=await one(), b=recOf(id) ? await one() : a; res[id]=[{db:(a+b)/2}]; }
    return res; },
  band:async(opt)=>{ const res={};
    for(const id of opt.ids){ S.sound=id; await loadSound(id); const t0=Date.now(); while(!soundReady(id) && Date.now()-t0<60000) await new Promise(r=>setTimeout(r,50));
      const oc=new OfflineAudioContext(2, 44100*2.6, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      const c={off:0,q:"maj"}; S.key=0; chordParts(c, voicing(c,null)).filter(p=>!p.dup).forEach(p=>{ const vc=makeVoice(oc,ch,p.inst,p.m,0.74*(p.bass?0.85:1),0.05,"sus"); if(vc) vc.stop(2.05, vc.tau); });
      res[id]=[{db:__kw(await oc.startRendering())}]; }
    return res; }
};
async function chords(h, room, opt){
  opt=opt||{};
  const name={piano:"music-piano.html", guitar:"music-guitar.html", bass:"music-bass.html", band:"music-band.html"}[room];
  const p=await page(h, name); const ids=opt.only||await p.evaluate(()=>Object.keys(SOUNDS)); await p.close();
  const fn=room==="guitar"||room==="bass" ? CHORD_FN.strings : CHORD_FN[room];
  const r=await spread(h, name, ids, opt.pages||3, fn, opt);
  /* the grand, measured the same way (on the piano page) */
  const g=await spread(h, "music-piano.html", ["grand"], 1, CHORD_FN.piano, {});
  return {res:r.res, grand:g.res.grand[0].db, errs:r.errs.concat(g.errs)};
}

/* ── the Guitar's strums: each chord of the strip by the neck (the six of the key, then the six more), strummed as a tap on
   it strums (16 ms a string, low to high, a little softer each string), through the sound's chain; its loudest 400 ms ── */
const STRUM_FN=async(opt)=>{ const res={};
  for(const id of opt.ids){ await loadSound(id); const rows=[];
    const list=(typeof allPads==="function" ? allPads().filter(Boolean) : null) || [{off:0,q:"maj"},{off:2,q:"min"},{off:4,q:"min"},{off:5,q:"maj"},{off:7,q:"maj"},{off:9,q:"min"}];
    for(const c of list){ S.sound=id; VOICINGS.clear();
      const oc=new OfflineAudioContext(2, Math.round(44100*1.2), 44100); await AOGAmp.load(oc); const ch=makeChain(oc);
      ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0); let k=0;
      shapeFor(c).forEach((f,s)=>{ if(f<0) return; makeVoice(oc,ch,id,TUNING[s]+f,0.74*(1-0.03*k),0.05+k*0.016,s); k++; });
      rows.push({m:k, name:(c.off+"|"+c.q), lufs:__lv.kw(await oc.startRendering(), 0.05, 0.4, 0.3).lufs}); }
    res[id]=rows; }
  return res; };
async function strums(h, opt){
  opt=opt||{};
  const p=await page(h, "music-guitar.html"); const ids=opt.only||await p.evaluate(()=>Object.keys(SOUNDS)); await p.close();
  return spread(h, "music-guitar.html", ids, opt.pages||3, STRUM_FN, opt);
}

module.exports={open, close, page, spread, strings, zones, piano, band, pads, kits, decks, chords, strums, ROOT};
