/* AOG-BAND-FOLK-V1 — Jimmy: "I would like a Harmonica added to the instruments. The fiddle and banjo as well." ... "DO them
   all". The Band's "Folk and country" section: a real harmonica, fiddle and banjo (CC0 recordings); a mandolin (picked and
   tremolo), a Dobro and a pedal steel made here from the Guitar room's recorded guitars; a melodica made by the computer.
   1 · the section lists all eight, in English and in Spanish; the sounds that are not recordings of their own instrument
       say so in the ready line, and the melodica in its name
   2 · silent until chosen: the page opens without fetching any of them; picking one fetches that one's files only
   3 · in tune: a few notes of each (recorded and between recordings), played by the page's own voice and rendered
       offline, within 10 cents
   4 · level: each one's C chord, held as a pad holds it, within 1 dB of the grand piano's (bandt/level.js measures it so)
   5 · hold: the held players (harmonica, fiddle, mandolin tremolo, pedal steel, melodica) loop every held recording and
       still sound at 9 s; the plucked ones (banjo, mandolin, Dobro) ring out by themselves
   6 · the slide: the Dobro and the pedal steel slide into a note (from a semitone below, or from the note before)
   7 · the banjo roll: eight picked notes a bar with the bass on one and three, named in English and Spanish
   8 · a take records the banjo's notes, each with its player
   9 · the Drum Machine: its chords and notes banks play each one, tuned as the Band tunes them, every file there, levelled
   No page errors. Ports 9322 (the Band, the piano) and 9323 (the Drum Machine). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9322), srv2=require("../srv.js")(9323);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const FOLK=["harmonica","fiddle","banjo","mandolin","mandolin_trem","dobro","steel","melodica"];
const EN=["Harmonica","Fiddle","Banjo","Mandolin · picked","Mandolin · tremolo","Dobro (resonator guitar)","Pedal steel","Melodica · made by computer"];
const ES=["Armónica","Violín de folk","Banjo","Mandolina · punteada","Mandolina · trémolo","Dobro (guitarra de resonador)","Pedal steel (guitarra de acero)","Melódica · hecha por computadora"];
const HELD=["harmonica","fiddle","mandolin_trem","steel","melodica"], RINGS=["banjo","mandolin","dobro"];
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const errs=[];
  /* the grand's C chord, the level every music tool is set to */
  let grand;
  { const p=await b.newPage(); p.on("pageerror",e=>errs.push("piano: "+e.message)); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9322/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    grand=await p.evaluate(async()=>{ await loadSet("grand");
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"grand"); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,"grand",m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); });
    await p.close(); }

  const c=await b.newContext({viewport:{width:1280,height:900}});
  await c.addInitScript(()=>{ try{ localStorage.setItem("aog.lang","en"); localStorage.removeItem("aog.band.v1"); }catch(e){} });
  const p=await c.newPage(); p.on("pageerror",e=>errs.push(e.message));
  const got=[]; p.on("request", r=>{ const u=r.url(); if(/\/audio\/band\//.test(u)) got.push(u.replace(/^https?:\/\/[^/]+/,"")); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9322/music-band.html"); await p.waitForTimeout(1500); await p.addScriptTag({content:MEASURE});
  const folkUrls=()=>got.filter(u=>FOLK.some(i=>u.indexOf("/audio/band/"+i+"/")===0));

  /* 1 · the section */
  await p.selectOption("#spKind", { label: "Folk and country" }); await p.waitForTimeout(300);
  const names=await p.evaluate(()=>[...document.getElementById("spSound").options].map(o=>o.textContent));
  ok(JSON.stringify(names)===JSON.stringify(EN), "Folk and country lists all eight: "+names.join(" | "));
  ok(await p.evaluate(F=>F.every(i=>SOUNDS[i] && SOUNDS[i].grp==="grpFolk" && PLAYER[i]>0 && MAN[i] && MAN[i].sus.length>=10), FOLK), "each is a player with its own recordings (ten notes or more) and its own level");

  /* 2 · silent until chosen (picking the section showed its first sound: the harmonica) */
  await p.selectOption("#spSound", "fiddle"); await p.waitForTimeout(1500);
  const before=got.filter(u=>!/\/audio\/band\/fiddle\//.test(u) && FOLK.some(i=>u.indexOf("/audio/band/"+i+"/")===0) && !/\/harmonica\//.test(u));
  const fid=got.filter(u=>/\/audio\/band\/fiddle\//.test(u));
  ok(before.length===0, "nothing of the other folk players is fetched: "+(before.slice(0,3).join(", ")||"none"));
  ok(fid.length===36, "picking the fiddle fetches its 36 files: "+fid.length);
  const r0=await p.evaluate(()=>{ const r=document.getElementById("readyLine")||document.querySelector("[id$=Line]"); return S.sound; });
  ok(r0==="fiddle", "picking it sets the sound");
  { const q=await c.newPage(); const g2=[]; q.on("request", r=>{ const u=r.url(); if(/\/audio\/band\//.test(u)) g2.push(u); });
    await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort()); await q.addInitScript(()=>{ try{ localStorage.removeItem("aog.band.v1"); }catch(e){} });
    await q.goto("http://localhost:9322/music-band.html"); await q.waitForTimeout(1500);
    ok(!g2.some(u=>FOLK.some(i=>u.indexOf("/audio/band/"+i+"/")>=0)), "a fresh visit fetches none of the folk players ("+g2.length+" band files, all the trumpet's)");
    await q.close(); }

  await p.evaluate(()=>{ window.__yin=function(x, sr, want){
    const P=sr/want, lo=Math.floor(P*Math.pow(2,-1.5/12))-1, hi=Math.ceil(P*Math.pow(2,1.5/12))+2, W=Math.round(Math.max(0.06*sr, 3*P)), out=[];
    for(let a=0; a+W+hi+1<x.length; a+=Math.round(0.02*sr)){
      const d=[]; for(let t=lo;t<=hi;t++){ let e=0; for(let i=a;i<a+W;i++){ const q=x[i]-x[i+t]; e+=q*q; } d.push(e); }
      let k=0; for(let i=1;i<d.length;i++) if(d[i]<d[k]) k=i;
      if(k===0 || k===d.length-1) continue;
      const den=d[k-1]-2*d[k]+d[k+1], t=lo+k+(den ? 0.5*(d[k-1]-d[k+1])/den : 0);
      out.push(1200*Math.log2(sr/t/want)); }
    out.sort((u,v)=>u-v); return out.length ? out[out.length>>1] : 999; }; });
  /* 3 · in tune, and 5 · hold, rendered offline by the page's own voice */
  const res=await p.evaluate(async(a)=>{
    const out={pitch:{}, hold:{}, loops:{}};
    const voiceAt=async(inst, m, secs, from, to, v)=>{
      const oc=new OfflineAudioContext(1, 44100*secs, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,inst); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      const vc=makeVoice(oc,ch,inst,m,v||0.74,0.05,"sus"); vc.stop(secs-0.3, vc.tau);
      return {d:(await oc.startRendering()).getChannelData(0), vc};
    };
    /* the pitch as the tools measure it (tune.py): YIN on 60 ms windows (or three waves) every 20 ms, searched within 1.5
       semitones of the note, the middle value (a tremolo's pick or a vibrato's swing does not move it) */
    const pitchOf=(x, want)=>window.__yin(x, 44100, want);
    for(const inst of a.FOLK){
      S.sound=inst; await loadSound(inst); const man=MAN[inst], s=man.sus, mid=s[s.length>>1];
      const notes=[s[0], mid, mid+1, s[s.length-1]];
      out.pitch[inst]=[];
      const plucked=!!PLUCKED[inst];
      for(const m of notes){
        const {d}=await voiceAt(inst, m, 1.6, 0, 0);
        const x=plucked ? d.slice(Math.round(44100*0.15), Math.round(44100*0.75)) : d.slice(Math.round(44100*0.45), Math.round(44100*1.25));
        let r=0; for(const v of x) r+=v*v; r=Math.sqrt(r/x.length);
        out.pitch[inst].push({m, cents:pitchOf(x, 440*Math.pow(2,(m-69)/12)), db:20*Math.log10(r+1e-9)});
      }
      const set=SETS[setKey(inst, inst)], files=Object.keys(set.buf).filter(f=>f.slice(-1)!=="t");
      out.loops[inst]={files:files.length, loops:files.filter(f=>set.loop[f]).length};
      if(a.HELD.indexOf(inst)>=0){ const {d, vc}=await voiceAt(inst, mid, 10.0);
        const rms=(p,q)=>{ let e=0,n=0; for(let i=Math.round(p*44100);i<Math.round(q*44100);i++){ e+=d[i]*d[i]; n++; } return 20*Math.log10(Math.sqrt(e/n)+1e-9); };
        out.hold[inst]={held:rms(1,2), late:rms(8.5,9.3), loop:!!vc.loop}; }
      else { const {d, vc}=await voiceAt(inst, mid, 6.0);
        const rms=(p,q)=>{ let e=0,n=0; for(let i=Math.round(p*44100);i<Math.round(q*44100);i++){ e+=d[i]*d[i]; n++; } return 20*Math.log10(Math.sqrt(e/n)+1e-9); };
        out.hold[inst]={early:rms(0.06,0.5), late:rms(4.5,5.5), loop:!!vc.loop}; }
    }
    return out; }, {FOLK, HELD});
  for(const inst of FOLK){
    const r=res.pitch[inst], worst=Math.max(...r.map(x=>Math.abs(x.cents))), quiet=Math.min(...r.map(x=>x.db));
    ok(worst<=10 && quiet>-50, `${inst}: in tune, ${r.map(x=>x.m+":"+(x.cents>=0?"+":"")+x.cents.toFixed(1)).join(" ")} cents (within 10), none silent (quietest ${quiet.toFixed(1)} dB)`);
  }
  for(const inst of HELD){ const h=res.hold[inst], L=res.loops[inst];
    ok(L.loops===L.files && L.files>0 && h.loop && h.late>h.held-6 && h.late>-50, `${inst}: every held recording loops (${L.loops}/${L.files}); a key held 9 s still sounds (${h.late.toFixed(1)} dB at 9 s, ${h.held.toFixed(1)} dB at 1-2 s)`); }
  for(const inst of RINGS){ const h=res.hold[inst], L=res.loops[inst];
    ok(L.loops===0 && !h.loop && h.late<h.early-30, `${inst}: plucked, it rings out by itself (${h.early.toFixed(1)} dB at first, ${h.late.toFixed(1)} dB at 5 s), no loop`); }

  /* 4 · level: the C chord next to the grand's */
  const lv=await p.evaluate(async(F)=>{ const o={};
    for(const id of F){ S.sound=id; await loadSound(id); const oc=new OfflineAudioContext(2, 44100*2.6, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      const cc={off:0,q:"maj"}; S.key=0; chordParts(cc, voicing(cc,null)).filter(q=>!q.dup).forEach(q=>{ const vc=makeVoice(oc,ch,q.inst,q.m,0.74*(q.bass?0.85:1),0.05,"sus"); if(vc) vc.stop(2.05, vc.tau); });
      o[id]=__kw(await oc.startRendering()); }
    return o; }, FOLK);
  ok(FOLK.every(i=>Math.abs(lv[i]-grand)<=1), "each one's C chord is as loud as the grand's ("+grand.toFixed(1)+" dB): "+FOLK.map(i=>i+" "+(lv[i]-grand>=0?"+":"")+(lv[i]-grand).toFixed(2)).join(", "));

  /* 6 · the slide */
  const sl=await p.evaluate(async()=>{ S.sound="dobro"; await loadSound("dobro");
    const oc=new OfflineAudioContext(1, 44100*1.2, 44100), a=slideFor(oc,"dobro",64,0.1,"sus"), b2=slideFor(oc,"dobro",67,0.6,"sus"), c2=slideFor(oc,"dobro",60,1.0,"sus"), ch2=slideFor(oc,"dobro",64,1.0,"sus"), st=slideFor(oc,"dobro",62,1.3,"stac"), none=slideFor(oc,"banjo",60,0.1,"sus");
    /* the sound itself: its first 50 ms lower than where it settles */
    const o2=new OfflineAudioContext(1, 44100*1.0, 44100), ch=makeChain(o2); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(o2.destination);
    const vc=makeVoice(o2, ch, "dobro", 64, 0.8, 0.0, "sus"); vc.stop(0.9, vc.tau); const d=(await o2.startRendering()).getChannelData(0);
    const want=440*Math.pow(2,(64-69)/12), sr=44100, P=Math.round(sr/want), yin1=(a)=>{ const lo=Math.floor(P*0.85), hi=Math.ceil(P*1.15), W=2*P; let bk=lo, be=1e9;
      for(let t=lo;t<=hi;t++){ let e=0; for(let i=a;i<a+W;i++){ const q=d[i]-d[i+t]; e+=q*q; } if(e<be){ be=e; bk=t; } } return 1200*Math.log2(sr/bk/want); };
    return {a, b2, c2, ch2, st, none, early:yin1(Math.round(0.01*sr)), late:yin1(Math.round(0.4*sr))}; });
  ok(sl.a.from===-1 && sl.b2.from===-3 && sl.c2.from===7 && sl.ch2.from===-1 && !sl.st && !sl.none, "the Dobro slides into a note from a semitone below, or from the note before (64 then 67: from 3 below; then 60: from 7 above; a chord's other note: from a semitone below; short notes and the banjo: no slide): "+JSON.stringify({a:sl.a.from, b:sl.b2.from, c:sl.c2.from, chord:sl.ch2.from, short:sl.st, banjo:sl.none}));
  ok(sl.early<sl.late-30 && Math.abs(sl.late)<15, `and you hear it: 10 ms in, the note is ${sl.early.toFixed(0)} cents from where it settles (${sl.late>=0?"+":""}${sl.late.toFixed(0)} cents at 0.4 s)`);

  /* 7 · the banjo roll */
  const roll=await p.evaluate(()=>{ S.sound="banjo"; S.rhythm="roll"; S.prog=[{off:0,q:"maj"}]; window.AOG_FEEL_OFF=true;
    const ev=barEvents("roll", 3), up=ev.filter(e=>typeof e.w==="number"), bass=ev.filter(e=>e.w==="b"||e.w==="f");
    return {n:up.length, times:up.map(e=>e.t), order:up.map(e=>e.w), bass:bass.map(e=>e.t), en:RHYTHM_WORDS.roll.en, es:RHYTHM_WORDS.roll.es, listed:RHYTHMS.indexOf("roll")>=0, kit:!!KIT_BEATS.roll}; });
  ok(roll.listed && roll.n===8 && JSON.stringify(roll.times)==="[0,0.5,1,1.5,2,2.5,3,3.5]" && JSON.stringify(roll.order)==="[0,1,2,0,1,2,0,2]" && JSON.stringify(roll.bass)==="[0,2]",
    "the banjo roll: eight picked notes a bar, thumb-index-middle forward, the bass on one and three: "+roll.order.join("")+" · "+roll.en+" · "+roll.es);
  const rb=await p.evaluate(async()=>{ await loadSound("banjo"); const oc=new OfflineAudioContext(2, 44100*3, 44100), ch=makeChain(oc);
    const v=scheduleBar(oc, ch, 0, 0.05, 2.4, 0.5, {v:null}); return {n:v.length, insts:[...new Set(v.map(x=>x.inst))]}; });
  ok(rb.n>=9 && rb.insts.join()==="banjo", "a bar of the roll on the banjo schedules its notes ("+rb.n+" voices, all banjo)");
  await p.evaluate(()=>{ window.AOG_FEEL_OFF=false; });

  /* 8 · a take records the banjo */
  await p.selectOption("#spSound", "banjo"); await p.waitForTimeout(800);
  await p.evaluate(()=>{ ctx(); }); await p.evaluate(()=>document.getElementById("recBtn").click()); await p.waitForTimeout(500);
  await p.evaluate(async()=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); for(const m of [55,59,62]){ keyOn(m, 0.8); await sl(250); keyOff(m); await sl(120); } });
  await p.waitForTimeout(400); await p.evaluate(()=>document.getElementById("recBtn").click());
  await p.waitForFunction(()=>window.AOGStudioRec && !AOGStudioRec.on() && !AOGStudioRec.busy() && AOGStudioRec.last(), null, {timeout:15000}).catch(()=>{});
  const tk=await p.evaluate(()=>{ const k=REC.takes[0]; return k ? {sec:k.sec, n:k.notes&&k.notes.ev.length, ps:k.notes?[...new Set(k.notes.ev.map(e=>e.p))]:[], sound:k.notes&&k.notes.sound} : null; });
  ok(tk && tk.n>=3 && tk.ps.join()==="banjo" && tk.sound==="banjo", "a take records the banjo: "+JSON.stringify(tk));

  /* 1 again · the words: the ready line, the credit, Spanish */
  await p.selectOption("#spSound", "melodica");
  /* AOG-BAND-STEADY-V1: the melodica's extra layers come once the keys have been still, so the ready line can take a few seconds */
  await p.waitForFunction(() => /The computer makes this melodica/.test(document.body.innerText), null, { timeout: 15000 }).catch(() => {});
  const txt=await p.evaluate(()=>document.body.innerText);
  ok(/The computer makes this melodica\. It is not a recording\./.test(txt), "the melodica says it is made by the computer, not recorded");
  await p.selectOption("#spSound", "harmonica"); await p.waitForTimeout(1200);
  const txt2=await p.evaluate(()=>document.body.innerText);
  ok(/Every note is a real player/.test(txt2) && !/not a recording/.test(txt2), "the harmonica, a recording, says every note is a real player");
  ok(await p.evaluate(()=>/Hohner Special 20/.test(STR.credit.en) && /itsclipping/.test(STR.credit.en) && /made by the computer/.test(STR.credit.en) && /itsclipping/.test(STR.credit.es) && /la hace la computadora/.test(STR.credit.es)), "the credit names the harmonica, the fiddle and the banjo, and says how the others are made, in English and Spanish");
  await p.evaluate(()=>{ const b=document.getElementById("langBtn"); if(b) b.click(); }); await p.waitForTimeout(600);
  const es=await p.evaluate(()=>({kind:document.getElementById("spKind").selectedOptions[0].textContent, names:[...document.getElementById("spSound").options].map(o=>o.textContent), roll:[...document.getElementById("rhythmSel").options].map(o=>o.textContent).find(x=>/banjo/.test(x))}));
  ok(es.kind==="Folk y country" && JSON.stringify(es.names)===JSON.stringify(ES) && /^Roll de banjo/.test(es.roll||""), "in Spanish: "+es.kind+": "+es.names.join(" | ")+" · "+es.roll);
  await p.selectOption("#spSound", "dobro"); await p.waitForTimeout(1200);
  ok(/Listo\. Este dobro está hecho aquí con una guitarra grabada\./.test(await p.evaluate(()=>document.body.innerText)), "and the Dobro says how it is made, in Spanish");

  /* 9 · the Drum Machine */
  { const q=await b.newPage(); q.on("pageerror",e=>errs.push("pads: "+e.message)); await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await q.addInitScript(()=>{ try{ localStorage.removeItem("aog.pads.v1"); }catch(e){} });
    await q.goto("http://localhost:9323/music-pads.html"); await q.waitForTimeout(1200);
    const pr=await q.evaluate(async(F)=>{ const man=await (await fetch("/audio/band/manifest.json")).json(), o={};
      for(const inst of F){ const I=INST["b:"+inst], M=man[inst]; if(!I){ o[inst]="missing"; continue; }
        const zs=await zonesOf("b:"+inst); let bad=[];
        if(JSON.stringify(I.n)!==JSON.stringify(M.sus)) bad.push("notes");
        if(I.g!=="band" || !I.en || !I.es) bad.push("names");
        zs.forEach(z=>{ if(z.c!==(M.tune[z.m+"s"]||0)) bad.push("tune "+z.m); });
        for(const z of zs){ const r=await fetch(z.url); if(!r.ok) bad.push("file "+z.m); }
        if(!(LEVEL.inst["b:"+inst]>0)) bad.push("level");
        o[inst]=bad.length?bad.join(", "):"ok"; }
      return o; }, FOLK);
    ok(FOLK.every(i=>pr[i]==="ok"), "the Drum Machine has all eight, tuned as the Band, every file there, levelled: "+JSON.stringify(pr));
    /* its chords bank (B) and its notes bank (C) play them */
    const pl=await q.evaluate(async(F)=>{
      const wait=bi=>new Promise((ok,no)=>{ const t0=Date.now(); const c=()=>{ if(isReady(bi)) ok(); else if(READY[bi].state==="failed" || Date.now()-t0>60000) no(new Error("not ready "+bi)); else setTimeout(c,30); }; prep(bi); c(); });
      const render=async(bi)=>{ const oc=new OfflineAudioContext(2, 44100*1.5, 44100), g=oc.createGain(); g.connect(oc.destination);
        const T={c:oc, dest:g, open:[[],[],[],[]], chop:[null,null,null,null]}; const v=trigger(bi, 0, 0.8, 0.05, T); if(v) v.stop(1.0);
        const d=(await oc.startRendering()).getChannelData(0); let e=0; for(let i=0;i<d.length;i++) e+=d[i]*d[i]; return 20*Math.log10(Math.sqrt(e/d.length)+1e-9); };
      const o={};
      for(const inst of F){
        Object.assign(S.banks[1], {type:"chords", inst:"b:"+inst, key:0, scale:"major"}); await wait(1); const ch=await render(1);
        Object.assign(S.banks[2], {type:"notes", inst:"b:"+inst, key:0, scale:"major", oct:4}); await wait(2); const nt=await render(2);
        o[inst]={ch:+ch.toFixed(1), nt:+nt.toFixed(1)}; }
      const html=instOptions("");
      return {o, listed:F.every(i=>html.indexOf(">"+esc(INST["b:"+i].en)+"<")>=0)}; }, FOLK);
    ok(FOLK.every(i=>pl.o[i].ch>-45 && pl.o[i].nt>-50), "its chords bank and its notes bank play each one: "+JSON.stringify(pl.o));
    ok(pl.listed, "and each is in its sound menu");
    await q.close(); }

  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails?fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); srv2.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH",e.stack); process.exit(1); });
