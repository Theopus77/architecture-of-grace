/* AOG-BAND-WORLD-V1 and AOG-PADS-WORLD-V1 (2026-10-13) — Jimmy: "DO them all." The Band's world instruments and solo voice:
   Sitar · India (and with meend), Koto · Japan (computer-made), Erhu · China (and with slides), Pan flute · the Andes
   (computer-made), Didgeridoo · Aboriginal Australia (and with a rhythm), and Voice "aah" / "ooh", a woman and a man.
   1 · the menu: a World group and a Voices group, before Everyone, named with the place each tradition comes from;
       the computer-made two say so in their names and their ready line
   2 · each loads only when it is picked: the page opens fetching none of them, and each fetches only its own files
   3 · in tune: low, middle and high notes of every player within 10 cents (the page's own voice, rendered offline, measured
       as tune.py measures); the glides land on the note; the erhu's vibrato swings around it; the drone holds its home
       note for 8 s, and every chord of a key gives it that key's home note
   4 · level: each sound's C chord within 0.75 dB of the grand piano's (as bandt/level.js and sax2 measure)
   5 · hold: every held recording of the bowed, blown and sung players has a loop; a 12 s note still sounds at 11 s; the
       plucked ones ring out with no loop
   6 · a take records (the sitar)
   7 · the Drum Machine: each is in its sound list, tuned as the Band tunes it, its files there, levelled (LEVEL); its notes
       and chords banks play them, each note moved into the instrument's reach, the didgeridoo one note per chord
   8 · Spanish: names, groups, the ready line and the credits. 9 · no page errors, no failed requests. Ports 9328, 9329. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9328), srv2=require("../srv.js")(9329);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const WORLD=["sitar","sitar_meend","koto","erhu","erhu_slide","panflute","didgeridoo","didgeridoo_rhythm"];
const VOICES=["voice_f_aa","voice_f_uu","voice_m_aa","voice_m_uu"];
const PLAYERS=["sitar","koto","erhu","panflute","didgeridoo","didgeridoo_rhythm"].concat(VOICES);
const HOLDING=["erhu","panflute","didgeridoo","didgeridoo_rhythm"].concat(VOICES), RINGING=["sitar","koto"];
/* tune.py in the page: YIN within 1.5 semitones of the note, 60 ms (or three cycles) every 10 ms; held notes from a to
   b s, the middle value with louder windows counted more; plucks from 20 ms while within 20 dB of the loudest, to 0.6 s */
const PITCH=`
window.__yinWin=function(x,s,m,W,SR){ const f=440*Math.pow(2,(m-69)/12), P=SR/f, lo=Math.floor(P*Math.pow(2,-1.5/12))-1, hi=Math.floor(P*Math.pow(2,1.5/12))+2;
  if(s+W+hi+1>x.length) return null; const d=new Float64Array(hi-lo+1);
  for(let t=lo;t<=hi;t++){ let a=0; for(let i=0;i<W;i++){ const q=x[s+i]-x[s+i+t]; a+=q*q; } d[t-lo]=a; }
  let i=0; for(let k=1;k<d.length;k++) if(d[k]<d[i]) i=k; if(i===0||i===d.length-1) return null;
  let t=lo+i; const den=d[i-1]-2*d[i]+d[i+1]; if(den!==0) t+=0.5*(d[i-1]-d[i+1])/den; return 69+12*Math.log2(SR/t/440); };
window.__windows=function(x,m,a,b,SR,floorDb){ const P=SR/(440*Math.pow(2,(m-69)/12)), W=Math.floor(Math.max(0.06*SR,3*P)), hi=Math.floor(P*Math.pow(2,1.5/12))+2, lv=[];
  let t=a; while(Math.floor(t*SR)+W+hi+1<=x.length && t<=b){ const s=Math.floor(t*SR); let e=0; for(let i=s;i<s+W;i++) e+=x[i]*x[i]; lv.push([s, Math.sqrt(e/W)+1e-12]); t+=0.01; }
  if(!lv.length) return []; const top=Math.max(...lv.map(q=>q[1])), out=[];
  lv.forEach(([s,l])=>{ if(floorDb!=null && 20*Math.log10(l/top)<floorDb) return; const v=__yinWin(x,s,m,W,SR); if(v!=null) out.push([v,l]); }); return out; };
window.__wmed=function(w){ const o=w.slice().sort((p,q)=>p[0]-q[0]); const tot=o.reduce((a,q)=>a+q[1],0); let cw=0;
  for(const q of o){ cw+=q[1]; if(cw>=tot/2) return q[0]; } return o[o.length-1][0]; };
window.__held=function(x,m,SR,a,b){ const w=__windows(x,m,a,b,SR,null); if(w.length<5) return null; return (__wmed(w)-m)*100; };
window.__pluck=function(x,m,SR){ const w=__windows(x,m,0.02,0.6,SR,-20); if(!w.length) return null; const v=w.map(q=>q[0]).sort((p,q)=>p-q); return (v[v.length>>1]-m)*100; };
window.__spread=function(x,m,SR,a,b){ const w=__windows(x,m,a,b,SR,null); if(!w.length) return null; const v=w.map(q=>q[0]).sort((p,q)=>p-q); return (v[Math.floor(v.length*0.9)]-v[Math.floor(v.length*0.1)])*100; };
window.__bare=function(oc){ const g=oc.createGain(); g.connect(oc.destination); return {c:oc, bus:g, send:oc.createGain()}; };
window.__note=async function(id,inst,m,v,art,secs){ const SR=32000; S.sound=id; await loadSound(id);
  const oc=new OfflineAudioContext(1,Math.ceil(SR*secs),SR), ch=__bare(oc);
  const vc=makeVoice(oc,ch,inst,m,v,0.05,art); if(!vc) return null; if(art==="sus") vc.stop(secs-0.1, vc.tau);
  const d=(await oc.startRendering()).getChannelData(0); let pk=0; for(const q of d) pk=Math.max(pk,Math.abs(q));
  let i=0; while(i<d.length && Math.abs(d[i])<pk*0.03) i++; return d.slice(Math.max(0,i-Math.floor(0.002*SR))); };`;
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  let grand;
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9328/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    grand=await p.evaluate(async()=>{ await loadSet("grand");
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"grand"); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,"grand",m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); });
    await p.close(); }
  const c=await b.newContext({viewport:{width:1280,height:900}});
  await c.addInitScript(()=>{ try{ localStorage.setItem("aog.lang","en"); localStorage.removeItem("aog.band.v1"); }catch(e){} });
  const p=await c.newPage();
  const errs=[], bad=[], reqs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text()); });
  p.on("response",r=>{ if(r.status()>=400) bad.push(r.status()+" "+r.url()); });
  p.on("request",r=>{ const u=r.url(); const k=u.indexOf("/audio/band/"); if(k>=0) reqs.push(u.slice(k+12)); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9328/music-band.html"); await p.waitForTimeout(800);
  await p.addScriptTag({content:MEASURE}); await p.addScriptTag({content:PITCH});
  const mine=()=>reqs.filter(u=>PLAYERS.some(f=>u.indexOf(f+"/")===0));
  const take=()=>reqs.splice(0, reqs.length);
  const pick=async(id)=>{ take(); await p.selectOption("#soundSel", id); await p.waitForFunction(id=>soundReady(id) && setsOf(id).every(k=>SETS[k].done===SETS[k].total), id, {timeout:90000}).catch(()=>{});
    await p.waitForTimeout(150); return {ready:await p.evaluate(id=>soundReady(id), id), sets:await p.evaluate(()=>Object.keys(SETS).sort().join(",")), got:take()}; };

  /* 1 · the menu */
  await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:30000});
  const menu=await p.evaluate(()=>{ const g=[]; document.querySelectorAll("#soundSel optgroup").forEach(o=>g.push([o.label, [...o.querySelectorAll("option")].map(x=>x.value)])); return g; });
  const labels=menu.map(g=>g[0]), world=(menu.find(g=>g[0]==="World")||[])[1]||[], voices=(menu.find(g=>g[0]==="Voices")||[])[1]||[];
  ok(JSON.stringify(world)===JSON.stringify(WORLD) && JSON.stringify(voices)===JSON.stringify(VOICES), "World holds "+world.join(" ")+"; Voices holds "+voices.join(" "));
  ok(labels.indexOf("World")>=0 && labels.indexOf("Voices")===labels.indexOf("World")+1 && labels[labels.length-1]==="Everyone", "the groups: "+labels.join(" | "));
  const names=await p.evaluate(ids=>ids.map(id=>soundName(id)), WORLD.concat(VOICES));
  ok(names[0]==="Sitar · India" && names[2]==="Koto · Japan (computer-made)" && names[3]==="Erhu · China" && names[5]==="Pan flute · the Andes (computer-made)"
    && names[6]==="Didgeridoo · Aboriginal Australia (hold the home note)" && names[8]==="Voice · “aah”, a woman" && names[11]==="Voice · “ooh”, a man", "named with each tradition's place: "+names.join(" | "));

  /* 2 · loaded only when picked */
  ok(mine().length===0, "the page opens on the trumpet and fetches none of them: "+mine().slice(0,3).join(", "));
  const man=await p.evaluate(()=>MAN);
  for(const id of WORLD.concat(VOICES)){
    const r=await pick(id), inst=id==="sitar_meend"?"sitar":id==="erhu_slide"?"erhu":id, want=man[inst].sus.length+man[inst].stac.length, got=new Set(r.got.filter(u=>u.indexOf(inst+"/")===0));
    ok(r.ready && r.sets===inst && (got.size===want || (id!==inst && got.size===0)) && r.got.every(u=>u.indexOf(inst+"/")===0),
      `${id}: picked, it ${id!==inst && !got.size ? "plays the "+inst+"'s files, already here" : "fetches its own "+got.size+" files"} and nothing else (sets ${r.sets})`);
    const line=await p.textContent("#loadLine");
    ok(/^Ready/.test(line) && (/computer makes/.test(line) === !!(id==="koto"||id==="panflute")), `${id}: the line says "${line}"`);
  }
  let r=await pick("trumpet"); ok(r.ready && r.sets==="trumpet" && !r.got.some(u=>PLAYERS.some(f=>u.indexOf(f+"/")===0)), "back on the trumpet, none of them is kept or fetched: "+r.sets);

  /* 3 · in tune */
  const tun=await p.evaluate(async(PLAYERS)=>{ const out={}, SR=32000;
    const plucked=i=>!!PLUCKED[i];
    for(const inst of PLAYERS){ const sus=MAN[inst].sus, notes=[sus[0], sus[sus.length>>1], sus[sus.length-1], sus[sus.length>>1]+1].filter((m,i,a)=>a.indexOf(m)===i), rows=[];
      for(const m of notes){ const x=await __note(inst,inst,m,0.74,"sus",plucked(inst)?2.0:3.0);
        rows.push({m, c: x ? +(plucked(inst) ? __pluck(x,m,SR) : __held(x,m,SR,0.25,2.5)).toFixed(1) : null}); }
      out[inst]=rows; }
    /* the glides land on the note: the meend's sitar and the erhu's slide, after their glide */
    for(const [id,inst,m] of [["sitar_meend","sitar",60],["erhu_slide","erhu",69]]){ const x=await __note(id,inst,m,0.74,"sus",2.5);
      out[id]=[{m, start:+__held(x,m-2,SR,0.0,0.06).toFixed(0), c:+__held(x,m,SR,0.6,1.8).toFixed(1)}]; }
    /* the erhu's vibrato swings around the note; the plain erhu with it, a voice without */
    { const x=await __note("erhu","erhu",69,0.74,"sus",3.0), y=await __note("voice_f_aa","voice_f_aa",66,0.74,"sus",3.0);
      out.vib={erhu:+__spread(x,69,SR,0.9,2.5).toFixed(0), voice:+__spread(y,66,SR,0.9,2.5).toFixed(0)}; }
    /* the drone: 8 s on its home note */
    { const x=await __note("didgeridoo","didgeridoo",38,0.74,"sus",8.6); out.drone=[[0.5,2],[3,4.5],[6,7.5]].map(([a,b])=>+__held(x,38,SR,a,b).toFixed(1)); }
    /* every chord of a key gives the drone the key's home note (D: 38) */
    { S.sound="didgeridoo"; S.key=2; S.minor=false; const homes=pads().map(c=>chordParts(c, voicing(c,null)).map(q=>q.m)); out.home=homes; S.key=0; }
    return out; }, PLAYERS);
  for(const inst of PLAYERS){ const rows=tun[inst], off=rows.filter(q=>q.c==null || Math.abs(q.c)>10);
    ok(!off.length, `${inst}: notes ${rows.map(q=>q.m+" "+q.c+"c").join(", ")} all within 10 cents`); }
  ok(tun.sitar_meend[0].start<-120 && Math.abs(tun.sitar_meend[0].c)<=10, "the sitar's meend starts low ("+tun.sitar_meend[0].start+" cents) and lands on the note ("+tun.sitar_meend[0].c+")");
  ok(tun.erhu_slide[0].start<-120 && Math.abs(tun.erhu_slide[0].c)<=10, "the erhu's slide starts low ("+tun.erhu_slide[0].start+" cents) and lands on the note ("+tun.erhu_slide[0].c+")");
  ok(tun.vib.erhu>=25 && tun.vib.voice<tun.vib.erhu/2, "the erhu sings with vibrato (spread "+tun.vib.erhu+" cents), the voice holds straight ("+tun.vib.voice+")");
  ok(tun.drone.every(c=>Math.abs(c)<=10), "the didgeridoo holds its home note for 8 s: "+tun.drone.join(", ")+" cents");
  ok(tun.home.every(h=>h.length===1 && h[0]===38), "in D every chord gives the didgeridoo D2, one note: "+JSON.stringify(tun.home));

  /* 4 · as loud as the grand */
  const lv=await p.evaluate(async(ids)=>{ const out={};
    for(const id of ids){ S.sound=id; await loadSound(id); const oc=new OfflineAudioContext(2,44100*2.6,44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); const c={off:0,q:"maj"}; S.key=0;
      chordParts(c, voicing(c,null)).filter(q=>!q.dup).forEach(q=>{ const vc=makeVoice(oc,ch,q.inst,q.m,0.74*(q.bass?0.85:1),0.05,"sus"); if(vc) vc.stop(2.05, vc.tau); });
      out[id]=+__kw(await oc.startRendering()).toFixed(2); }
    return out; }, WORLD.concat(VOICES));
  const far=Object.keys(lv).filter(k=>Math.abs(lv[k]-grand)>0.75);
  ok(!far.length, "each C chord within 0.75 dB of the grand's "+grand.toFixed(2)+" dB: "+JSON.stringify(lv));

  /* 5 · hold */
  const lp=await p.evaluate(async(a)=>{ const out={};
    for(const inst of a.HOLDING.concat(a.RINGING)){ await loadSound(inst); const set=SETS[setKey(inst, inst)]; const files=Object.keys(set.buf).filter(f=>f.slice(-1)!=="t");
      out[inst]={files:files.length, loops:files.filter(f=>set.loop[f]).length}; }
    const long={}, SR=44100;
    for(const [inst,m] of [["erhu",69],["panflute",72],["didgeridoo",38],["didgeridoo_rhythm",38],["voice_f_aa",63],["voice_m_uu",51]]){
      S.sound=inst; await loadSound(inst);
      const oc=new OfflineAudioContext(1, SR*12.5, SR), g=oc.createGain(); g.connect(oc.destination);
      const vc=makeVoice(oc, {bus:g, send:oc.createGain()}, inst, m, 0.74, 0.05, "sus"); vc.stop(12.2, vc.tau);
      const d=(await oc.startRendering()).getChannelData(0), rms=(x,z)=>{ let e=0; for(let i=Math.floor(x*SR);i<Math.floor(z*SR);i++) e+=d[i]*d[i]; return 10*Math.log10(e/((z-x)*SR)+1e-12); };
      long[inst]={held:+rms(1,2).toFixed(1), late:+rms(10.5,11.5).toFixed(1)}; }
    return {out, long}; }, {HOLDING, RINGING});
  const miss=HOLDING.filter(i=>!lp.out[i].files || lp.out[i].loops!==lp.out[i].files);
  ok(!miss.length, "every held recording of the bowed, blown and sung players loops: "+HOLDING.map(i=>i+" "+lp.out[i].loops+"/"+lp.out[i].files).join(", "));
  ok(RINGING.every(i=>lp.out[i].files && lp.out[i].loops===0), "the sitar and the koto ring out with no loop");
  for(const [k,v] of Object.entries(lp.long)) ok(v.late>-50 && v.late-v.held>-6 && v.late-v.held<4, `${k}: a 12 s note still sounds at 11 s (${v.late} dB against ${v.held} dB at 1-2 s)`);

  /* 6 · a take records (the sitar) */
  await pick("sitar");
  await p.click("#recBtn"); await p.waitForTimeout(300); await p.evaluate(()=>{ noteOn("k60","sitar",60,0.8); }); await p.waitForTimeout(900); await p.evaluate(()=>noteOff("k60"));
  await p.evaluate(()=>{ noteOn("k64","sitar",64,0.8); }); await p.waitForTimeout(700); await p.evaluate(()=>noteOff("k64"));
  await p.click("#recBtn"); await p.waitForTimeout(1500);
  const rec=await p.evaluate(async()=>{ const k=REC.takes[0]; if(!k) return null; const buf=await new OfflineAudioContext(2,1,ac.sampleRate).decodeAudioData(await k.blob.arrayBuffer()), d=buf.getChannelData(0); let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x));
    return {sec:+k.sec.toFixed(1), peak:+pk.toFixed(2), notes:(k.notes&&k.notes.ev||[]).map(e=>e.p+e.m).join(" ")}; });
  ok(rec && rec.sec>1 && rec.peak>0.05 && /sitar60/.test(rec.notes||""), "a take of the sitar records, with its notes: "+JSON.stringify(rec));

  /* 7 · the Drum Machine */
  { const q=await b.newPage(); q.on("pageerror",e=>errs.push("pads: "+e.message)); await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    const preq=[]; q.on("request",r=>{ const u=r.url(), k=u.indexOf("/audio/band/"); if(k>=0) preq.push(u.slice(k+12)); });
    q.on("response",r=>{ if(r.status()>=400) bad.push("pads "+r.status()+" "+r.url()); });
    await q.addInitScript(()=>{ try{ localStorage.removeItem("aog.pads.v1"); }catch(e){} });
    await q.goto("http://localhost:9329/music-pads.html"); await q.waitForTimeout(1500); await q.addScriptTag({content:MEASURE});
    ok(!preq.some(u=>PLAYERS.some(f=>u.indexOf(f+"/")===0)), "the Drum Machine opens fetching none of them");
    const pr=await q.evaluate(async(PLAYERS)=>{ const man=await (await fetch("/audio/band/manifest.json")).json(), o={};
      for(const inst of PLAYERS){ const I=INST["b:"+inst], M=man[inst]; if(!I){ o[inst]="missing"; continue; }
        const zs=await zonesOf("b:"+inst); let bad=[];
        if(JSON.stringify(I.n)!==JSON.stringify(M.sus)) bad.push("notes");
        Object.keys(I.c||{}).forEach(k=>{ if(I.c[k]!==(M.tune[k+"s"]||0)) bad.push("c "+k); });
        zs.forEach(z=>{ if(z.c!==(M.tune[z.m+"s"]||0)) bad.push("tune "+z.m); });
        for(const z of zs){ const r=await fetch(z.url); if(!r.ok) bad.push("file "+z.m); }
        if(typeof LEVEL.inst["b:"+inst]!=="number") bad.push("level");
        if(!I.r || I.r[0]!==M.sus[0]-1 || I.r[1]!==M.sus[M.sus.length-1]+1) bad.push("reach");
        o[inst]=bad.length?bad.join(", "):"ok"; }
      return o; }, PLAYERS);
    ok(PLAYERS.every(i=>pr[i]==="ok"), "the Drum Machine has each, tuned as the Band, every file there, levelled, its reach: "+JSON.stringify(pr));
    const pl=await q.evaluate(async(PLAYERS)=>{ const wait=bi=>new Promise((ok,no)=>{ const t0=Date.now(); const c=()=>{ if(isReady(bi)) ok(); else if(READY[bi].state==="failed" || Date.now()-t0>60000) no(new Error("not ready "+bi)); else setTimeout(c,30); }; prep(bi); c(); });
      const render=async(sec, fn)=>{ const oc=new OfflineAudioContext(2, Math.round(44100*sec), 44100), g=oc.createGain(), l=oc.createDynamicsCompressor();
        l.threshold.value=-3; l.knee.value=2; l.ratio.value=20; l.attack.value=0.002; l.release.value=0.12; g.gain.value=0.9; g.connect(l); l.connect(oc.destination);
        const T={c:oc, dest:g, open:[[],[],[],[]], chop:[null,null,null,null]}; const v=fn(T); return {db:__kw(await oc.startRendering()), parts:v&&v.parts||[]}; };
      const out={};
      for(const inst of PLAYERS){ const id="b:"+inst;
        Object.assign(S.banks[1], {type:"chords", inst:id, key:0, scale:"major"}); await wait(1);
        const ch=await render(2.6, T=>{ const v=trigger(1, 0, 0.8, 0.05, T); if(v) v.stop(2.05); return v; });
        Object.assign(S.banks[2], {type:"notes", inst:id, key:0, scale:"major", oct:2}); await wait(2);
        const nt=await render(2.6, T=>{ const v=trigger(2, 0, 0.8, 0.05, T); if(v) v.stop(2.05); return v; });
        out[inst]={chord:+ch.db.toFixed(1), chordNotes:ch.parts.length, note:+nt.db.toFixed(1), noteAt:foldIn(id, scaleNotes(S.banks[2])[0]), reach:INST[id].r}; }
      return out; }, PLAYERS);
    ok(PLAYERS.every(i=>pl[i].chord>-40 && pl[i].note>-40), "the chords and notes banks play each: "+PLAYERS.map(i=>i+" "+pl[i].chord+"/"+pl[i].note+" dB").join(", "));
    ok(PLAYERS.every(i=>pl[i].noteAt>=pl[i].reach[0] && pl[i].noteAt<=pl[i].reach[1]), "the notes bank's low C moves into each one's reach: "+PLAYERS.map(i=>i+" "+pl[i].noteAt).join(", "));
    ok(pl.didgeridoo.chordNotes===1 && pl.didgeridoo_rhythm.chordNotes===1 && pl.sitar.chordNotes===3, "the didgeridoo plays one note a chord, the sitar three");
    await q.close(); }

  /* 8 · Spanish */
  await pick("koto");
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  const es=await p.evaluate(ids=>({names:ids.map(id=>[...document.querySelectorAll("#soundSel option")].find(o=>o.value===id).textContent),
    groups:[...document.querySelectorAll("#soundSel optgroup")].map(o=>o.label).join("|"), line:document.getElementById("loadLine").textContent, foot:document.getElementById("foot").textContent}), WORLD.concat(VOICES));
  ok(es.names[0]==="Sitar · India" && es.names[2]==="Koto · Japón (hecho por computadora)" && es.names[3]==="Erhu · China" && es.names[5]==="Flauta de pan · los Andes (hecha por computadora)"
    && es.names[6]==="Didgeridoo · Australia aborigen (mantén la nota de casa)" && es.names[8]==="Voz · “aa”, una mujer" && es.names[9]==="Voz · “uu”, una mujer", "in Spanish: "+es.names.join(" | "));
  ok(/Del mundo\|Voces\|Todos$/.test(es.groups), "the groups in Spanish: "+es.groups);
  ok(/computadora hace este sonido/.test(es.line), "the ready line in Spanish: "+es.line);
  ok(/Narayan Bhagawan Raikar/.test(es.foot) && /VocalSet/.test(es.foot) && /CC BY 4\.0/.test(es.foot) && /menos el koto y la flauta de pan/.test(es.foot), "the credits in Spanish name the players and VocalSet's licence");
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(250);
  const foot=await p.textContent("#foot");
  ok(/except the koto and the pan flute/.test(foot) && /Julia Wilkins, Prem Seetharaman, Alison Wahl and Bryan Pardo \(CC BY 4\.0\)/.test(foot) && /D\. Smolken/.test(foot) && /All four are given to everyone/.test(foot), "the credits in English: "+foot.slice(-260));

  /* 9 · no errors */
  ok(errs.length===0, "no page errors: "+errs.slice(0,5).join(" | "));
  ok(bad.length===0, "no failed requests: "+bad.slice(0,5).join(" | "));
  console.log(fails?fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); srv2.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH",e.stack); process.exit(1); });
