/* The Band, more ways to sound (AOG-BAND-MORE-V1, -PERC-V1, -ORCH-V1), on an iPad (AOG-BAND-SAX2-V1: the orchestra has
   19 players now, the tenor and soprano saxophones with the alto):
   the orchestra loads lean with a players' count, a pad has a note from all five families, its waltz and oom-pah bars
   give each part its place, its C chord is as loud as the grand's, Send to the turntables and Record carry it; each
   percussion choice loads and plays, the section's beat follows a march and a waltz; every new sound plays a chord
   offline that is not silent; no errors, no failed requests. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9987);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const FAM={brass:["tuba","trombone","horn","trumpet"], woodwinds:["flute","clarinet","oboe","bassoon","sax","tenor","soprano"], strings:["violins","violas","cellos","contrabass"], harp:["harp"], percussion:["timpani","glockenspiel"]};
const NEW=["trumpet_vib","trumpet_harmon","trumpet_straight","trombone_vib","horn_mute","brass_mute","piccolo","flute_vib","oboe_vib","bassoon_vib","winds_choir",
  "violins","violins_pizz","violas","violas_pizz","cellos","cellos_pizz","contrabass","contrabass_pizz","harp","strings","strings_pizz",
  "timpani","marimba","xylophone","glockenspiel","percussion","bigband","marching","mariachi","orchestra","trumpet_bebop","sax_bebop","bebop","cooljazz"];
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext(pw.devices["iPad (gen 7)"]); const p=await c.newPage();
  const errs=[], bad=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text()); });
  p.on("response",r=>{ if(r.status()>=400) bad.push(r.status()+" "+r.url()); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9987/music-band.html"); await p.waitForTimeout(800); await p.addScriptTag({content:MEASURE});
  /* the menu */
  const menu=await p.evaluate(()=>({groups:[...document.querySelectorAll("#soundSel optgroup")].map(g=>g.label).join("|"), last:[...document.querySelectorAll("#soundSel optgroup")].pop().textContent, plate:document.querySelector(".plate small").textContent}));
  ok(menu.groups==="Brass|Woodwinds|Strings|Percussion|Jazz|Bands|Everyone" && menu.last==="Orchestra · everyone plays" && menu.plate==="BRASS · WOODWINDS · STRINGS · PERCUSSION", "the menu's groups, the orchestra alone under Everyone, the plate: "+JSON.stringify(menu));
  /* 1. the orchestra: picked, it loads two players at a time, the line counting players; each plays when it is ready */
  await p.selectOption("#soundSel","orchestra");
  const lines=new Set(); let early=null;
  for(let i=0;i<200 && !(await p.evaluate(()=>soundReady("orchestra")));i++){ lines.add(await p.textContent("#loadLine"));
    if(!early) early=await p.evaluate(()=>{ const ready=Object.keys(SETS).filter(k=>SETS[k].ready); if(!ready.length || ready.length===Object.keys(SETS).length) return null;
      S.key=0; const c={off:0,q:"maj"}, vo=voicing(c,null), oc=new OfflineAudioContext(2,44100,44100), ch=makeChain(oc); let real=0, none=0;
      chordParts(c,vo).forEach(q=>{ const v=makeVoice(oc,ch,q.inst,q.m,0.7,0,"sus"); if(v&&v.natural) real++; else if(!v) none++; });
      return {ready:ready.length, real, waiting:none}; });
    await p.waitForTimeout(150); }
  lines.add(await p.textContent("#loadLine"));
  const ls=[...lines], st=await p.evaluate(()=>({sets:Object.keys(SETS).length, files:Object.values(SETS).reduce((a,s)=>a+s.total,0), lean:Object.keys(SETS).every(k=>k.indexOf("lean:")===0)}));
  ok(await p.evaluate(()=>soundReady("orchestra")) && st.lean && st.sets===19 && ls.some(l=>/· \d+ of 19 players/.test(l)) && /^Ready: every player in the band/.test(ls[ls.length-1]), "the orchestra loads lean, "+st.sets+" players, "+st.files+" files; the line: "+ls.slice(0,2).join(" / ")+" … "+ls[ls.length-1]);
  ok(!early || (early.real>0 && early.waiting>0), "while it loads, the ready players already play and the others wait (no stand-in): "+JSON.stringify(early));
  /* 2. one pad: a note from every family */
  await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,inst,m,v,when,art){ const r=mv.apply(this,arguments); if(cx===ac) window.__v.push({inst, m, real:!!(r&&r.natural)}); return r; }; });
  await p.evaluate(()=>{ S.key=0; if(S.minor) document.getElementById("majBtn").click(); lastVoicing=null; padDown(0,0.74); }); await p.waitForTimeout(200);
  const pad=await p.evaluate("__v"); await p.evaluate(()=>padUp(0));
  const fams=Object.keys(FAM).filter(f=>pad.some(x=>x.real && FAM[f].indexOf(x.inst)>=0));
  ok(fams.length===5 && pad.every(x=>x.real), "pad C on the orchestra: "+pad.length+" real notes from "+fams.join(", ")+": "+pad.map(x=>x.inst+x.m).join(" "));
  ok(await p.evaluate(()=>ALL.length<=VOICE_CAP && VOICE_CAP<=32), "the voices sounding at once stay under the cap: "+await p.evaluate(()=>ALL.length+" of "+VOICE_CAP));
  /* 3. a waltz bar and an oom-pah bar */
  const bars=await p.evaluate(async()=>{ const res={};
    for(const rh of ["waltz","march"]){ S.rhythm=rh; S.prog=[{off:0,q:"maj"}]; S.key=0;
      const oc=new OfflineAudioContext(2,44100*3,44100), ch=makeChain(oc), beat=0.6, v=scheduleBar(oc,ch,0,0.05,beatsPerBar()*beat,0.5,{v:null}), by={};
      v.forEach(x=>{ const bt=Math.round((x.on-0.05)/beat); (by[bt]=by[bt]||[]).push(x.kit?"*"+x.kit:x.inst+(x.held?"~":"")); });
      res[rh]={beats:beatsPerBar(), by}; }
    return res; });
  const low=["contrabass","tuba","timpani","cellos","bassoon","harp"], mid=["trombone","horn","sax","tenor","soprano","clarinet","trumpet","oboe","flute","glockenspiel"];
  const has=(arr,list)=>list.every(x=>arr.indexOf(x)>=0), none=(arr,list)=>list.every(x=>arr.indexOf(x)<0);
  const w=bars.waltz.by, m=bars.march.by;
  ok(bars.waltz.beats===3 && has(w[0],low) && has(w[0],["violins~","violas~","*cy"]) && none(w[0],mid) && has(w[1],mid) && has(w[2],mid) && none(w[1],low) && none(w[2],low) && !w[3],
    "orchestra, a waltz bar: oom (bass, timpani, harp; strings held; cymbal) then pah, pah (winds and brass): "+JSON.stringify(w));
  ok(bars.march.beats===4 && has(m[0],low) && has(m[2],low.filter(x=>x!=="harp"||m[2].indexOf("harp")>=0)) && has(m[1],mid) && has(m[3],mid) && none(m[1],low) && none(m[3],low),
    "orchestra, an oom-pah bar: bass on 1 and 3, chord on 2 and 4: "+JSON.stringify(m));
  /* 4. as loud as the grand (its C chord, the level measure: -8.62 dB, within 0.5) */
  const lv=await p.evaluate(async()=>{ S.sound="orchestra"; const oc=new OfflineAudioContext(2,44100*2.6,44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"orchestra"); setEra(ch,0,0);
    ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); const c={off:0,q:"maj"}; S.key=0;
    chordParts(c, voicing(c,null)).filter(q=>!q.dup).forEach(q=>{ const vc=makeVoice(oc,ch,q.inst,q.m,0.74*(q.bass?0.85:1),0.05,"sus"); if(vc) vc.stop(2.05, vc.tau); });
    return __kw(await oc.startRendering()); });
  ok(Math.abs(lv+8.62)<=0.5, "the orchestra's C chord: "+lv.toFixed(2)+" dB (the grand: -8.62)");
  /* 5. Send to the turntables carries it */
  await p.selectOption("#progSel","pop"); await p.selectOption("#rhythmSel","waltz");
  await p.click("#sendBtn"); await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("sendLine").textContent), null, {timeout:120000});
  const sh=await p.evaluate(async()=>{ const x=await AOGHandoff.get("bandbench"); if(!x) return null;
    const buf=await new OfflineAudioContext(2,1,44100).decodeAudioData(await x.wav.arrayBuffer()), d=buf.getChannelData(0); let pk=0, ss=0;
    for(let i=0;i<d.length;i++){ pk=Math.max(pk,Math.abs(d[i])); ss+=d[i]*d[i]; } return {name:x.name, bars:x.bars, secs:+buf.duration.toFixed(1), peak:+pk.toFixed(2), rmsDb:+(10*Math.log10(ss/d.length)).toFixed(1)}; });
  ok(sh && /Orchestra/.test(sh.name) && sh.secs>15 && sh.peak>0.2 && sh.rmsDb>-35, "Send leaves the orchestra's waltz on the shelf: "+JSON.stringify(sh));
  /* 6. Record carries it */
  await p.click("#recBtn"); await p.waitForTimeout(300); await p.click("#playBtn"); await p.waitForTimeout(2600); await p.click("#playBtn"); await p.waitForTimeout(300);
  await p.click("#recBtn"); await p.waitForTimeout(1500);
  const rec=await p.evaluate(async()=>{ const k=REC.takes[0]; if(!k) return null; const buf=await new OfflineAudioContext(2,1,ac.sampleRate).decodeAudioData(await k.blob.arrayBuffer()), d=buf.getChannelData(0); let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x)); return {sec:+k.sec.toFixed(1), peak:+pk.toFixed(2), live:ALL.length}; });
  ok(rec && rec.sec>2 && rec.peak>0.1, "Record keeps a take of the orchestra playing: "+JSON.stringify(rec));
  /* 7. the percussion: each choice loads and plays; the section keeps the beat of a march and a waltz */
  for(const id of ["timpani","marimba","xylophone","glockenspiel","percussion"]){
    await p.selectOption("#soundSel", id); await p.waitForFunction(id=>soundReady(id), id, {timeout:60000}).catch(()=>{});
    await p.evaluate("__v=[]"); await p.evaluate(()=>{ lastVoicing=null; padDown(4,0.74); }); await p.waitForTimeout(120); await p.evaluate(()=>padUp(4));
    const v=await p.evaluate("__v");
    ok(await p.evaluate(id=>soundReady(id), id) && v.length>=2 && v.every(x=>x.real), id+": loads; pad G plays "+v.map(x=>x.inst[0]+x.m).join(" "));
  }
  const kb=await p.evaluate(()=>{ const res={}; S.sound="percussion";
    for(const rh of ["march","waltz"]){ S.rhythm=rh; S.prog=[{off:0,q:"maj"},{off:7,q:"maj"}]; S.key=0; const oc=new OfflineAudioContext(2,44100*6,44100), ch=makeChain(oc), beat=0.6, prev={v:null}, r={};
      for(let k=0;k<2;k++) scheduleBar(oc,ch,k,0.05+k*beatsPerBar()*beat,beatsPerBar()*beat,0.5,prev).forEach(x=>{ if(!x.kit) return; const bt=k+":"+Math.round((x.on-0.05-k*beatsPerBar()*beat)/beat*100)/100; (r[bt]=r[bt]||[]).push(x.kit); });
      res[rh]=r; }
    return res; });
  ok(JSON.stringify(kb.march)===JSON.stringify({"0:0":["bd","cy"],"0:1":["sn"],"0:2":["bd"],"0:3":["sn"],"1:0":["bd"],"1:1":["sn"],"1:2":["bd"],"1:3":["sn"]}), "the section's march: bass drum on 1 and 3, snare on 2 and 4, a cymbal opening the phrase: "+JSON.stringify(kb.march));
  ok(JSON.stringify(kb.waltz)===JSON.stringify({"0:0":["bd","cy"],"0:1":["tri"],"0:2":["tri"],"1:0":["bd"],"1:1":["tri"],"1:2":["tri"]}), "the section's waltz: bass drum on 1, triangle on 2 and 3: "+JSON.stringify(kb.waltz));
  const tp=await p.evaluate(()=>{ S.sound="timpani"; S.key=0; const c={off:0,q:"maj"}; return chordParts(c, voicing(c,null)).map(q=>q.m%12); });
  ok(tp.length===2 && tp[0]===0 && tp[1]===7, "the timpani play the root and the fifth: "+tp);
  /* 8. jazz (AOG-BAND-JAZZ-V1): each style plays a pad; the groups give trumpet and alto the top of the chord, and the
     swing big band and the bebop quintet have drums on the beat */
  for(const id of ["trumpet_vib","trumpet_bebop","trumpet_harmon","sax_bebop","bebop","cooljazz","bigband"]){
    await p.selectOption("#soundSel", id); await p.waitForFunction(id=>soundReady(id), id, {timeout:60000}).catch(()=>{});
    await p.evaluate("__v=[]"); await p.evaluate(()=>{ lastVoicing=null; padDown(0,0.74); }); await p.waitForTimeout(120); await p.evaluate(()=>padUp(0));
    const v=await p.evaluate("__v");
    ok(await p.evaluate(id=>soundReady(id), id) && v.length>=3 && v.every(x=>x.real), id+" ("+await p.evaluate(id=>soundName(id), id)+"): pad C plays "+v.map(x=>x.inst+x.m).join(" "));
  }
  const jz=await p.evaluate(()=>{ const out={}; S.key=0; const c={off:0,q:"maj"}, vo=voicing(c,null);
    for(const id of ["bebop","cooljazz","bigband"]){ S.sound=id; const parts=chordParts(c,vo).filter(q=>!q.bass).sort((a,b)=>b.m-a.m); out[id]=parts.slice(0,2).map(q=>q.inst+q.m).join(" "); }
    S.sound="bigband"; S.rhythm="march"; S.prog=[{off:0,q:"maj"}]; const oc=new OfflineAudioContext(2,44100*3,44100), ch=makeChain(oc), r={};
    scheduleBar(oc,ch,0,0.05,2.4,0.5,{v:null}).forEach(x=>{ if(x.kit){ const bt=Math.round((x.on-0.05)/0.6); (r[bt]=r[bt]||[]).push(x.kit); } });
    out.drums=JSON.stringify(r); return out; });
  ok(/^trumpet\d+ sax\d+$/.test(jz.bebop.replace(/sax(\d+) trumpet(\d+)/,"trumpet$2 sax$1")) && /trumpet_harmon/.test(jz.cooljazz) && jz.drums==='{"0":["bd","cy"],"1":["sn"],"2":["bd"],"3":["sn"]}', "jazz groups: the top two notes, bebop "+jz.bebop+", cool "+jz.cooljazz+", big band "+jz.bigband+"; the big band's march drums "+jz.drums);
  /* 9. every new sound: a chord, offline, not silent */
  const quiet=await p.evaluate(async(NEW)=>{ const out=[];
    for(const id of NEW){ S.sound=id; await loadSound(id); const oc=new OfflineAudioContext(2,44100*2,44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      const c={off:5,q:"maj"}; S.key=0; chordParts(c, voicing(c,null)).filter(q=>!q.dup).forEach(q=>{ const vc=makeVoice(oc,ch,q.inst,q.m,0.74,0.05,"sus"); if(vc) vc.stop(1.5, vc.tau); });
      const d=(await oc.startRendering()).getChannelData(0); let pk=0, nan=0; for(let i=0;i<d.length;i++){ if(d[i]!==d[i]) nan++; pk=Math.max(pk,Math.abs(d[i])); }
      out.push(id+":"+pk.toFixed(2)+(nan?" NaN":"")); }
    return out; }, NEW);
  ok(quiet.every(s=>!/NaN/.test(s) && +s.split(":")[1]>0.05), "every new sound's F chord, offline, is heard: "+quiet.join(" "));
  ok(errs.length===0, "no page errors: "+errs.slice(0,5).join(" | "));
  ok(bad.length===0, "no failed requests: "+bad.slice(0,5).join(" | "));
  await b.close(); srv.close(); console.log(fails?`${fails} FAILED`:"ALL PASS"); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
