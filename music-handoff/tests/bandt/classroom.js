/* AOG-BAND-CLASSROOM-V1 and AOG-PADS-CLASSROOM-V1 (2026-10-13) — Jimmy: "DO them all." The instruments learners play in
   school music class: the recorder (soprano, and the alto; real, VCSL, CC0), the ukulele (made from FreePats' real nylon
   guitar strings, CC0: no free ukulele recording was found) and boomwhackers (synthesized tubes, C2 to E6).
   The Band, on an iPhone:
     1 · each one is in its section's menu, and its recordings are fetched only when it is picked (nothing on opening);
     2 · in tune: a few notes each (recorded ones and ones between), within 10 cents, measured on the page's own voice;
     3 · as loud as the grand: each one's C chord within 0.5 dB of the grand's;
     4 · the recorders hold a note as long as the key is down (8 s, past the recording's end, at the level they held);
         the ukulele and the tubes ring out by themselves and stop;
     5 · a ukulele chord is strummed, low string to high; a recorder chord starts together;
     6 · the ready line says the ukulele and the tubes are made here, not recorded; the credit names every source;
     7 · a take records;
     8 · Spanish: Flauta dulce, Ukelele, Boomwhackers (tubos sonoros); nothing sticks out sideways.
   The Drum Machine, on an iPhone:
     9 · its sound list has the four, in step with the Band's manifest (notes, tuning, every file there), levelled;
         nothing of theirs is fetched until a bank uses one;
    10 · its banks play them (chords and notes, rendered offline as pads/level.js renders), each as loud as the target
         (2 dB under the grand, within 1 dB, or as loud as its attack allows), and a live tap sounds;
    11 · on the Notes bank, the boomwhackers' pads show the tube colours (C red … B pink), each with its colour's name in
         words and its note, the ink at 4.5:1 or more on the tube, in light and dark, English and Spanish; a plucked
         pad rings out after it is let go.
   No page errors and no failed requests. Ports 9324 (and 9325 for the Guitar room, if a test needs it). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9324);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const NEW=["recorder","recorder_alto","ukulele","boomwhackers"];
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
/* a held note: 0.25 s to 2.5 s, louder windows counted more; a pluck or a hit: from 20 ms while within 20 dB of its loudest */
window.__cents=function(x,m,SR,held){ const w=held ? __windows(x,m,0.25,2.5,SR,null) : __windows(x,m,0.02,0.6,SR,-20); if(!w.length) return null;
  const o=w.slice().sort((p,q)=>p[0]-q[0]); const tot=o.reduce((a,q)=>a+(held?q[1]:1),0); let cw=0, c=o[o.length-1][0];
  for(const q of o){ cw+=held?q[1]:1; if(cw>=tot/2){ c=q[0]; break; } } return (c-m)*100; };
window.__note=async function(id,m,v,art,secs){ const SR=32000; S.sound=id; await loadSound(id);
  const oc=new OfflineAudioContext(1,Math.ceil(SR*secs),SR), g=oc.createGain(); g.connect(oc.destination);
  const vc=makeVoice(oc,{c:oc, bus:g, send:oc.createGain()},id,m,v,0.05,art); if(!vc) return null; if(art==="sus") vc.stop(secs-0.1, vc.tau);
  const d=(await oc.startRendering()).getChannelData(0); let pk=0; for(const q of d) pk=Math.max(pk,Math.abs(q));
  let i=0; while(i<d.length && Math.abs(d[i])<pk*0.03) i++; return {x:d.slice(Math.max(0,i-Math.floor(0.002*SR))), loop:!!vc.loop, natural:vc.natural}; };`;
/* the contrast of two CSS colours (WCAG) */
function lum(c){ const m=c.match(/[\d.]+/g).map(Number).slice(0,3).map(v=>{ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }); return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2]; }
function ratio(a,b){ const x=lum(a), y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); }
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const errs=[], bad=[];
  /* the grand's C chord, the level every music tool is set to */
  let grand;
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9324/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    grand=await p.evaluate(async()=>{ await loadSet("grand");
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"grand"); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,"grand",m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); });
    await p.close(); }
  const man=JSON.parse(fs.readFileSync(__dirname+"/../../../aog-deploy/audio/band/manifest.json","utf8"));

  /* ══ the Band ══ */
  const c=await b.newContext(pw.devices["iPhone 13"]);
  await c.addInitScript(()=>{ try{ localStorage.setItem("aog.lang","en"); localStorage.removeItem("aog.band.v1"); }catch(e){} });
  const p=await c.newPage(); const reqs=[];
  p.on("pageerror",e=>errs.push("band: "+e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push("band console: "+m.text()); });
  p.on("response",r=>{ if(r.status()>=400) bad.push(r.status()+" "+r.url()); });
  p.on("request",r=>{ const u=r.url(), k=u.indexOf("/audio/band/"); if(k>=0) reqs.push(u.slice(k+12)); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9324/music-band.html"); await p.waitForTimeout(900);
  await p.addScriptTag({content:MEASURE}); await p.addScriptTag({content:PITCH});
  await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:30000});
  const ours=()=>reqs.filter(u=>NEW.some(f=>u.indexOf(f+"/")===0));
  /* 1 */
  const menu=await p.evaluate(()=>{ const g={}; document.querySelectorAll("#soundSel optgroup").forEach(o=>{ g[o.label]=[...o.querySelectorAll("option")].map(x=>x.value); }); return g; });
  ok((menu.Woodwinds||[]).includes("recorder") && (menu.Woodwinds||[]).includes("recorder_alto") && (menu.Strings||[]).includes("ukulele") && (menu.Percussion||[]).includes("boomwhackers"),
    "the menus: the recorders in Woodwinds, the ukulele in Strings, the boomwhackers in Percussion");
  ok(await p.evaluate(()=>soundName("recorder")+"|"+soundName("recorder_alto")+"|"+soundName("ukulele")+"|"+soundName("boomwhackers"))==="Recorder|Recorder · alto|Ukulele|Boomwhackers (tuned tubes)", "their names in English");
  ok(ours().length===0, "the page opens on the trumpet and fetches none of them: "+ours().slice(0,3).join(", "));
  const lines={};
  for(const id of NEW){
    reqs.splice(0); await p.selectOption("#soundSel", id);
    await p.waitForFunction(id=>soundReady(id) && setsOf(id).every(k=>SETS[k].done===SETS[k].total), id, {timeout:60000}).catch(()=>{});
    await p.waitForTimeout(200);
    /* its own files; the only others are the trumpet's last ones still arriving, never another classroom instrument's */
    const all=reqs.filter(u=>/\.mp3$/.test(u)), got=new Set(all.filter(u=>u.indexOf(id+"/")===0)), want=man[id].sus.length+man[id].stac.length, own=all.every(u=>u.indexOf(id+"/")===0 || /^trumpet/.test(u));
    const sets=await p.evaluate(()=>Object.keys(SETS).sort().join(","));
    lines[id]=await p.textContent("#loadLine");
    ok(got.size===want && own && sets===id, `${id}, picked: fetches its own ${want} files and nothing else (${got.size}; sets ${sets})`);
  }
  /* 6 · the ready line and the credit */
  ok(/^Ready\. Every note is a real player\./.test(lines.recorder) && /^Ready\./.test(lines.recorder_alto), "the recorders: "+lines.recorder);
  ok(/made here from real nylon guitar strings/.test(lines.ukulele), "the ukulele says it is made: "+lines.ukulele);
  ok(/made here, not recorded/.test(lines.boomwhackers), "the tubes say they are made: "+lines.boomwhackers);
  const foot=await p.textContent("#foot");
  ok(/recorders come from the Versilian Community Sample Library/.test(foot) && /FreePats/.test(foot) && /boomwhackers by synthesis/.test(foot) && /are given to everyone/.test(foot),
    "the credit names the recorders' library, the guitar the ukulele is made from, and the synthesized tubes: "+foot.slice(foot.indexOf("The recorders"), foot.indexOf("The recorders")+90)+"…");
  /* 2 · in tune */
  const TRY={recorder:[[72,"sus"],[73,"sus"],[79,"sus"],[90,"sus"],[96,"sus"],[74,"stac"]], recorder_alto:[[65,"sus"],[71,"sus"],[84,"sus"],[76,"stac"]],
    ukulele:[[60,"sus"],[67,"sus"],[68,"sus"],[69,"sus"],[76,"sus"],[81,"sus"]], boomwhackers:[[36,"sus"],[48,"sus"],[60,"sus"],[67,"sus"],[72,"sus"],[84,"sus"]]};
  const tun=await p.evaluate(async(TRY)=>{ const out={};
    for(const id of Object.keys(TRY)){ out[id]=[];
      for(const [m,art] of TRY[id]){ const r=await __note(id,m,0.74,art,art==="sus"?2.8:1.2); const held=art==="sus" && !PLUCKED[id];
        out[id].push({m, art, c:r ? __cents(r.x,m,32000,held) : null}); } }
    return out; }, TRY);
  for(const id of NEW){ const rows=tun[id], off=rows.filter(r=>r.c==null || Math.abs(r.c)>10);
    ok(!off.length, `${id}: in tune within 10 cents (${rows.map(r=>r.m+(r.art==="stac"?"t":"")+":"+(r.c==null?"?":r.c.toFixed(1))).join(" ")})`); }
  /* 3 · as loud as the grand */
  const lv=await p.evaluate(async(NEW)=>{ const out={};
    for(const id of NEW){ S.sound=id; await loadSound(id); const oc=new OfflineAudioContext(2, 44100*2.6, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); const cc={off:0,q:"maj"}; S.key=0;
      chordParts(cc, voicing(cc,null)).filter(q=>!q.dup).forEach(q=>{ const vc=makeVoice(oc,ch,q.inst,q.m,0.74*(q.bass?0.85:1),0.05,"sus"); if(vc) vc.stop(2.05, vc.tau); });
      out[id]=__kw(await oc.startRendering()); }
    return out; }, NEW);
  ok(NEW.every(id=>Math.abs(lv[id]-grand)<=0.5), "each one's C chord is as loud as the grand's ("+grand.toFixed(2)+" dB): "+NEW.map(id=>id+" "+lv[id].toFixed(2)).join(", "));
  /* 4 · held as long as the key is down; plucks and hits ring out */
  const hold=await p.evaluate(async()=>{ const out={};
    for(const [id,m] of [["recorder",77],["recorder_alto",70]]){ const r=await __note(id,m,0.74,"sus",8.6); const x=r.x, SR=32000;
      const rms=(a,z)=>{ let e=0; for(let i=Math.floor(a*SR);i<Math.floor(z*SR);i++) e+=x[i]*x[i]; return 20*Math.log10(Math.sqrt(e/((z-a)*SR))+1e-9); };
      out[id]={loop:r.loop, early:rms(1,2), late:rms(7,8)}; }
    for(const [id,m] of [["ukulele",64],["boomwhackers",60]]){ const r=await __note(id,m,0.74,"sus",6); const x=r.x, SR=32000;
      const rms=(a,z)=>{ let e=0; for(let i=Math.floor(a*SR);i<Math.floor(z*SR) && i<x.length;i++) e+=x[i]*x[i]; return 20*Math.log10(Math.sqrt(e/((z-a)*SR))+1e-9); };
      out[id]={loop:r.loop, natural:r.natural, early:rms(0,0.3), late:rms(3,4)}; }
    return out; });
  ok(["recorder","recorder_alto"].every(id=>hold[id].loop && Math.abs(hold[id].late-hold[id].early)<3), "the recorders hold an 8 s note at the level they held at 1-2 s: "+JSON.stringify(hold.recorder)+" "+JSON.stringify(hold.recorder_alto));
  ok(["ukulele","boomwhackers"].every(id=>!hold[id].loop && hold[id].natural<4 && hold[id].late<hold[id].early-40), "the ukulele and the tubes ring out by themselves: "+JSON.stringify(hold.ukulele)+" "+JSON.stringify(hold.boomwhackers));
  /* 5 · a ukulele chord is strummed, a recorder chord is not */
  const strum=await p.evaluate(async()=>{ const out={}; const mv=window.makeVoice;
    for(const id of ["ukulele","recorder"]){ S.sound=id; await loadSound(id); const w=[]; window.makeVoice=function(c,ch,inst,m,v,when){ if(c===ac) w.push([m, when]); return mv.apply(this, arguments); };
      ctx(); allOff(); lastVoicing=null; padDown(0, 0.74); padUp(0); window.makeVoice=mv; allOff();
      out[id]=w.map(q=>[q[0], +((q[1]-w[0][1])*1000).toFixed(1)]); }
    return out; });
  const us=strum.ukulele.map(q=>q[1]);
  ok(us.length>=3 && us.every((t,i)=>i===0 || t-us[i-1]>8 && t-us[i-1]<20), "a ukulele chord is strummed, a string every 8-20 ms: "+JSON.stringify(strum.ukulele));
  ok(strum.recorder.length>=3 && strum.recorder.every(q=>Math.abs(q[1])<6), "a recorder chord starts together (within one audio block): "+JSON.stringify(strum.recorder));
  /* 7 · a take records */
  await p.selectOption("#soundSel","ukulele"); await p.waitForFunction(()=>soundReady("ukulele"));
  await p.evaluate(()=>document.getElementById("recBtn").click()); await p.waitForTimeout(400);
  await p.evaluate(()=>{ padDown(0,0.8); }); await p.waitForTimeout(500); await p.evaluate(()=>{ padUp(0); padDown(3,0.8); }); await p.waitForTimeout(700); await p.evaluate(()=>padUp(3));
  await p.waitForTimeout(300); await p.evaluate(()=>document.getElementById("recBtn").click()); await p.waitForTimeout(1500);
  const take=await p.evaluate(async()=>{ const k=REC.takes[0]; if(!k) return null; const buf=await new OfflineAudioContext(2,1,ac.sampleRate).decodeAudioData(await k.blob.arrayBuffer()), d=buf.getChannelData(0); let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x)); return {sec:+k.sec.toFixed(1), peak:+pk.toFixed(2)}; });
  ok(take && take.sec>1 && take.peak>0.05, "Record keeps a take of the ukulele: "+JSON.stringify(take));
  /* 8 · Spanish, and nothing sideways */
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(400);
  const es=await p.evaluate(()=>({names:["recorder","recorder_alto","ukulele","boomwhackers"].map(id=>soundName(id)), foot:document.getElementById("foot").textContent, line:document.getElementById("loadLine").textContent,
    sel:document.getElementById("spSound") ? document.getElementById("spSound").selectedOptions[0].textContent : ""}));
  ok(es.names.join("|")==="Flauta dulce|Flauta dulce · contralto|Ukelele|Boomwhackers (tubos sonoros)", "in Spanish: "+es.names.join(" | "));
  ok(/flautas dulces/.test(es.foot) && /ukelele/.test(es.foot) && /síntesis/.test(es.foot), "the credit in Spanish");
  ok(/Este ukelele está hecho aquí/.test(es.line) && (!es.sel || es.sel==="Ukelele"), "the line and the menu in Spanish: "+es.line+" · "+es.sel);
  const wd=await p.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth})); ok(wd.sw<=wd.iw, "on a phone, nothing sticks out sideways "+JSON.stringify(wd));
  await p.evaluate(()=>document.getElementById("langBtn").click());
  await p.close();

  /* ══ the Drum Machine ══ */
  const q=await c.newPage(); const preq=[];
  q.on("pageerror",e=>errs.push("pads: "+e.message)); q.on("console",m=>{ if(m.type()==="error") errs.push("pads console: "+m.text()); });
  q.on("response",r=>{ if(r.status()>=400) bad.push(r.status()+" "+r.url()); });
  q.on("request",r=>{ const u=r.url(), k=u.indexOf("/audio/band/"); if(k>=0) preq.push(u.slice(k+12)); });
  await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await q.addInitScript(()=>{ try{ localStorage.removeItem("aog.pads.v1"); }catch(e){} });
  await q.goto("http://localhost:9324/music-pads.html"); await q.waitForTimeout(1200); await q.addScriptTag({content:MEASURE});
  /* 9 */
  ok(!preq.some(u=>NEW.some(f=>u.indexOf(f+"/")===0)), "the Drum Machine opens without fetching any of them");
  const pr=await q.evaluate(async(NEW)=>{ const man=await (await fetch("/audio/band/manifest.json")).json(), o={};
    for(const inst of NEW){ const I=INST["b:"+inst], M=man[inst]; if(!I){ o[inst]="missing"; continue; }
      const zs=await zonesOf("b:"+inst); let bad=[];
      if(I.g!=="band") bad.push("group");
      if(JSON.stringify(I.n)!==JSON.stringify(M.sus)) bad.push("notes");
      zs.forEach(z=>{ if(z.c!==(M.tune[z.m+"s"]||0)) bad.push("tune "+z.m); if((I.c&&I.c[z.m]||0)!==(M.tune[z.m+"s"]||0)) bad.push("copy "+z.m); });
      for(const z of zs){ const r=await fetch(z.url, {method:"HEAD"}); if(!r.ok) bad.push("file "+z.m); }
      if(!(LEVEL.inst["b:"+inst]>0)) bad.push("level");
      o[inst]=bad.length?bad.join(", "):"ok"; }
    o.menu=[...new DOMParser().parseFromString("<select>"+instOptions("")+"</select>","text/html").querySelectorAll("optgroup")].find(g=>/band/i.test(g.label)).textContent;
    return o; }, NEW);
  ok(NEW.every(i=>pr[i]==="ok"), "its sound list has all four, in step with the Band (notes, tuning, files), levelled: "+JSON.stringify(Object.fromEntries(NEW.map(i=>[i,pr[i]]))));
  ok(/Recorder/.test(pr.menu) && /Ukulele/.test(pr.menu) && /Boomwhackers/.test(pr.menu), "and its instrument menu lists them under The band");
  /* 10 · the banks play them, levelled */
  const pl=await q.evaluate(async(NEW)=>{
    const wait=bi=>new Promise((ok,no)=>{ const t0=Date.now(); const c=()=>{ if(isReady(bi)) ok(); else if(READY[bi].state==="failed" || Date.now()-t0>60000) no(new Error("not ready "+bi)); else setTimeout(c,30); }; prep(bi); c(); });
    const render=async(sec, fn)=>{ const oc=new OfflineAudioContext(2, Math.round(44100*sec), 44100), g=oc.createGain(), l=oc.createDynamicsCompressor();
      l.threshold.value=-3; l.knee.value=2; l.ratio.value=20; l.attack.value=0.002; l.release.value=0.12; g.gain.value=0.9; g.connect(l); l.connect(oc.destination);
      fn({c:oc, dest:g, open:[[],[],[],[]], chop:[null,null,null,null]}); const buf=await oc.startRendering();
      let pk=0; for(let c=0;c<buf.numberOfChannels;c++){ const d=buf.getChannelData(c); for(let i=0;i<d.length;i++) pk=Math.max(pk, Math.abs(d[i])); } return {db:__kw(buf), pk}; };
    const out={};
    for(const id of NEW){ Object.assign(S.banks[1], {type:"chords", inst:"b:"+id, key:0, scale:"major"}); await wait(1);
      out[id]=await render(2.6, T=>{ const v=trigger(1, 0, 0.8, 0.05, T); if(v) v.stop(2.05); });
      Object.assign(S.banks[2], {type:"notes", inst:"b:"+id, key:0, scale:"major", oct:3}); await wait(2);
      out[id].note=(await render(1.5, T=>{ const v=trigger(2, 4, 0.8, 0.05, T); if(v) v.stop(1.2); })).db; }
    return out; }, NEW);
  const TARGET=-2;   /* pads/level.js: 2 dB under the grand */
  const lvok=id=>{ const off=pl[id].db-(grand+TARGET), room=20*Math.log10(1.05/pl[id].pk); return Math.abs(off)<=1 || (-off>room+0.3 && room<0.6); };
  ok(NEW.every(lvok), "each one's C chord on the Chords bank is at the target ("+(grand+TARGET).toFixed(2)+" dB, within 1 dB, or as loud as its attack allows): "+NEW.map(id=>id+" "+pl[id].db.toFixed(2)+" (peak "+pl[id].pk.toFixed(2)+")").join(", "));
  ok(NEW.every(id=>pl[id].note>-45), "and a note on the Notes bank sounds: "+NEW.map(id=>id+" "+pl[id].note.toFixed(1)).join(", "));
  /* a live tap on a boomwhacker pad sounds, and rings out after it is let go */
  await q.evaluate(()=>{ Object.assign(S.banks[2], {type:"notes", inst:"b:boomwhackers", key:0, scale:"major", oct:3}); S.bank=2; save(); paintAll(); prep(2); });
  await q.waitForFunction(()=>isReady(2), null, {timeout:60000});
  const tap=await q.evaluate(async()=>{ ctx(); if(ac.state!=="running") await ac.resume(); const v=trigger(2, 0, 0.8, 0); const n=RING.length; if(v) v.stop(); await new Promise(r=>setTimeout(r,150));
    const live=RING.filter(x=>!x.done).length, g=RING.length ? RING[RING.length-1].g.gain.value : 0; return {voices:v?v.parts.length:0, ring:n, after:live, gain:+g.toFixed(3)}; });
  ok(tap.voices===1 && tap.after>=1 && tap.gain>0.01, "a tap on a tube pad sounds, and still rings after it is let go: "+JSON.stringify(tap));
  /* 11 · the tube colours, labelled and readable */
  const tubes=async()=>q.evaluate(()=>[...document.querySelectorAll("#pads .pad")].map(el=>{ const d=padDefs(2)[+el.dataset.p], cs=getComputedStyle(el), pn=el.querySelector(".pn"), pc=el.querySelector(".pc");
    return {p:+el.dataset.p, m:d.notes[0], tube:el.classList.contains("tube"), bg:cs.backgroundColor, ink:getComputedStyle(pn).color, word:pc?pc.textContent:"", wink:pc?getComputedStyle(pc).color:"", num:getComputedStyle(el.querySelector(".pi")).color, name:pn.textContent, aria:el.getAttribute("aria-label")}; }));
  const WANT={0:["Red","Rojo"],2:["Orange","Naranja"],4:["Yellow","Amarillo"],5:["Lime","Lima"],7:["Green","Verde"],9:["Purple","Morado"],11:["Pink","Rosa"]};
  for(const scheme of ["light","dark"]){
    await q.emulateMedia({colorScheme:scheme}); await q.waitForTimeout(150);
    for(const lang of ["en","es"]){
      if((await q.evaluate(()=>S0.lang))!==lang){ await q.evaluate(()=>{ const b=document.getElementById("langBtn"); if(b) b.click(); }); await q.waitForTimeout(300); }
      const T=await tubes(), li=lang==="es"?1:0;
      const wrong=T.filter(t=>{ const pc=((t.m%12)+12)%12, w=WANT[pc]; return w ? !(t.tube && t.word===w[li]) : t.tube; });
      const low=T.filter(t=>t.tube).map(t=>Math.min(ratio(t.ink,t.bg), ratio(t.wink,t.bg), ratio(t.num,t.bg))).filter(r=>r<4.5);
      const named=T.filter(t=>t.tube).every(t=>t.name && new RegExp(lang==="es"?"tubo":"tube").test(t.aria));
      ok(T.length===24 && T.filter(t=>t.tube).length===24 && !wrong.length && !low.length && named,
        `${scheme}, ${lang}: all 24 pads show their tube's colour, its name in words (${T.slice(0,8).map(t=>t.name+" "+t.word).join(", ")}…) and the note; the ink reads at 4.5:1 or more`+(wrong.length?" WRONG "+JSON.stringify(wrong.slice(0,3)):"")+(low.length?" LOW "+low.join(","):""));
    }
  }
  const red=(await tubes()).find(t=>t.m%12===0);
  ok(/rgb\(215, 38, 46\)/.test(red.bg), "C is red: "+red.bg);
  /* a sharp (in G major, F♯) is left plain, with its name */
  await q.evaluate(()=>{ S.banks[2].key=7; paintAll(); });
  const g=await tubes(), fs6=g.filter(t=>t.m%12===6);
  ok(fs6.length>0 && fs6.every(t=>!t.tube && t.name), "in G, the F♯ pads are left plain, named: "+fs6.map(t=>t.name).join(", "));
  await q.evaluate(()=>{ S.banks[2].key=0; S.banks[2].inst="a:growly"; paintAll(); });
  ok((await tubes()).every(t=>!t.tube), "another instrument's pads have no tube colours");
  const pw2=await q.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth})); ok(pw2.sw<=pw2.iw, "the Drum Machine on a phone: nothing sticks out sideways "+JSON.stringify(pw2));
  await q.close();

  ok(errs.length===0, "no page errors "+errs.join(" | "));
  ok(bad.length===0, "no failed requests "+bad.slice(0,4).join(" | "));
  console.log(fails?fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH",e.stack); process.exit(1); });
