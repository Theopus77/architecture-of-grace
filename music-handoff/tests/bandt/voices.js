/* AOG-BAND-VOICES-V1 (2026-10-13) — Jimmy: "GO AHEAD WITH THE VOICES." The Band's four solo singers (VocalSet, CC BY 4.0):
   Voice "aah" / "ooh", a woman and a man, in a Voices group; and the Drum Machine's Voices group (the Choir and the four).
   1 · the menu: a Voices group with the four, in English and Spanish; the credits name VocalSet in both
   2 · each loads only when it is picked: the page opens fetching none of them, and each fetches only its own files
   3 · in tune: low, middle and high notes of each within 10 cents (the page's own voice, rendered offline, YIN as tune.py)
   4 · level: each one's C chord within 0.75 dB of the grand piano's (as bandt/level.js measures)
   5 · hold: every held recording loops; a 12 s note still sounds at 11 s; let go, it fades gently (not cut, gone in 1.5 s)
   6 · a take records (the woman's "aah")
   7 · the Drum Machine: its Voices group lists the Choir and the four, tuned as the Band tunes them, every file there,
       levelled (LEVEL), and its chords and notes banks play them
   8 · no page errors, no failed requests. Port 9334. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9334);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const VOICES=["voice_f_aa","voice_f_uu","voice_m_aa","voice_m_uu"];
/* AOG-BAND-CHOIR-V1 (2026-10-27): the Band's choir on "aah" and "ooh" (six singers a note) joins the four, and the menu ends
   with the two gospel records, which play the choir on the keys and open their samples. The Drum Machine keeps the four. */
const CHOIRS=["choir_aa","choir_uu","choir_oh","choir_eh","choir_ee","choir_w","choir_m"];   /* AOG-BAND-CHOIR-V2: and in the Drum Machine */
const PLAYERS=VOICES.concat(CHOIRS), MENU=PLAYERS.concat(["gospel_choir","jubilee"]);
const PITCH=`
window.__yinWin=function(x,s,m,W,SR){ const f=440*Math.pow(2,(m-69)/12), P=SR/f, lo=Math.floor(P*Math.pow(2,-1.5/12))-1, hi=Math.floor(P*Math.pow(2,1.5/12))+2;
  if(s+W+hi+1>x.length) return null; const d=new Float64Array(hi-lo+1);
  for(let t=lo;t<=hi;t++){ let a=0; for(let i=0;i<W;i++){ const q=x[s+i]-x[s+i+t]; a+=q*q; } d[t-lo]=a; }
  let i=0; for(let k=1;k<d.length;k++) if(d[k]<d[i]) i=k; if(i===0||i===d.length-1) return null;
  let t=lo+i; const den=d[i-1]-2*d[i]+d[i+1]; if(den!==0) t+=0.5*(d[i-1]-d[i+1])/den; return 69+12*Math.log2(SR/t/440); };
window.__windows=function(x,m,a,b,SR){ const P=SR/(440*Math.pow(2,(m-69)/12)), W=Math.floor(Math.max(0.06*SR,3*P)), hi=Math.floor(P*Math.pow(2,1.5/12))+2, out=[];
  let t=a; while(Math.floor(t*SR)+W+hi+1<=x.length && t<=b){ const s=Math.floor(t*SR); let e=0; for(let i=s;i<s+W;i++) e+=x[i]*x[i];
    const v=__yinWin(x,s,m,W,SR); if(v!=null) out.push([v, Math.sqrt(e/W)+1e-12]); t+=0.01; }
  return out; };
window.__held=function(x,m,SR,a,b){ const w=__windows(x,m,a,b,SR); if(w.length<5) return null; const o=w.slice().sort((p,q)=>p[0]-q[0]), tot=o.reduce((s,q)=>s+q[1],0); let cw=0;
  for(const q of o){ cw+=q[1]; if(cw>=tot/2) return (q[0]-m)*100; } return (o[o.length-1][0]-m)*100; };
window.__note=async function(id,m,secs){ const SR=32000; S.sound=id; await loadSound(id);
  const oc=new OfflineAudioContext(1,Math.ceil(SR*secs),SR), g=oc.createGain(); g.connect(oc.destination);
  const vc=makeVoice(oc,{c:oc, bus:g, send:oc.createGain()},id,m,0.74,0.05,"sus"); if(!vc) return null; vc.stop(secs-0.1, vc.tau);
  const d=(await oc.startRendering()).getChannelData(0); let pk=0; for(const q of d) pk=Math.max(pk,Math.abs(q));
  let i=0; while(i<d.length && Math.abs(d[i])<pk*0.03) i++; return d.slice(Math.max(0,i-Math.floor(0.002*SR))); };`;
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  let grand;
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9334/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    grand=await p.evaluate(async()=>{ await loadSet("grand");
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"grand"); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,"grand",m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); });
    await p.close(); }
  const c=await b.newContext({viewport:{width:1280,height:900}});
  await c.addInitScript(()=>{ try{ localStorage.setItem("aog.lang","en"); localStorage.removeItem("aog.band.v1"); localStorage.removeItem("aog.pads.v1"); }catch(e){} });
  const p=await c.newPage();
  const errs=[], bad=[], reqs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text()); });
  p.on("response",r=>{ if(r.status()>=400) bad.push(r.status()+" "+r.url()); });
  p.on("request",r=>{ const u=r.url(); const k=u.indexOf("/audio/band/"); if(k>=0) reqs.push(u.slice(k+12)); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9334/music-band.html"); await p.waitForTimeout(800);
  await p.addScriptTag({content:MEASURE}); await p.addScriptTag({content:PITCH});
  const mine=()=>reqs.filter(u=>PLAYERS.some(f=>u.indexOf(f+"/")===0));
  const take=()=>reqs.splice(0, reqs.length);
  const pick=async(id)=>{ take(); await p.selectOption("#soundSel", id); await p.waitForFunction(id=>soundReady(id) && setsOf(id).every(k=>SETS[k].done===SETS[k].total), id, {timeout:90000}).catch(()=>{});
    await p.waitForTimeout(150); return {ready:await p.evaluate(id=>soundReady(id), id), sets:await p.evaluate(()=>Object.keys(SETS).sort().join(",")), got:take()}; };

  /* 1 · the menu, in English and Spanish */
  await p.waitForFunction(()=>soundReady(S.sound) && setsOf(S.sound).every(k=>SETS[k].done===SETS[k].total), null, {timeout:60000});   /* the trumpet's short notes too, so a busy machine's late ones are not counted as a singer's */
  const menu=()=>p.evaluate(()=>[...document.querySelectorAll("#soundSel optgroup")].map(o=>[o.label, [...o.querySelectorAll("option")].map(x=>[x.value, x.textContent])]));
  let m=await menu(), g=m.find(x=>x[0]==="Voices");
  ok(g && JSON.stringify(g[1].map(x=>x[0]))===JSON.stringify(MENU), "a Voices group holds the four, the choir and the gospel records: "+(g?g[1].map(x=>x[1]).join(" | "):"none"));
  ok(g && g[1].map(x=>x[1]).join("|")==="Voice · “aah”, a woman|Voice · “ooh”, a woman|Voice · “aah”, a man|Voice · “ooh”, a man|Choir · “aah”|Choir · “ooh”|Choir · “oh”|Choir · “eh”|Choir · “ee”|Women’s choir · “aah”|Men’s choir · “oh”|Gospel Choir · 16 samples|Jubilee Voices · 16 samples", "their English names");
  let foot=await p.textContent("#foot");
  ok(/VocalSet by Julia Wilkins, Prem Seetharaman, Alison Wahl and Bryan Pardo \(CC BY 4\.0\)/.test(foot), "the credits name VocalSet and its licence");
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  m=await menu(); g=m.find(x=>x[0]==="Voces");
  ok(g && g[1].map(x=>x[1]).join("|")==="Voz · “aa”, una mujer|Voz · “uu”, una mujer|Voz · “aa”, un hombre|Voz · “uu”, un hombre|Coro · “aa”|Coro · “uu”|Coro · “oh”|Coro · “e”|Coro · “i”|Coro de mujeres · “aa”|Coro de hombres · “oh”|Coro góspel · 16 muestras|Voces del jubileo · 16 muestras", "in Spanish, Voces: "+(g?g[1].map(x=>x[1]).join(" | "):m.map(x=>x[0]).join(", ")));
  foot=await p.textContent("#foot");
  ok(/VocalSet de Julia Wilkins, Prem Seetharaman, Alison Wahl y Bryan Pardo \(CC BY 4\.0\)/.test(foot), "the credits in Spanish name VocalSet and its licence");
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(250);

  /* 2 · loaded only when picked */
  ok(mine().length===0, "the page opens and fetches none of them: "+mine().slice(0,3).join(", "));
  const man=await p.evaluate(()=>MAN);
  for(const id of PLAYERS){ const r=await pick(id), got=new Set(r.got.filter(u=>u.indexOf(id+"/")===0));
    ok(r.ready && r.sets===id && got.size===man[id].sus.length && r.got.every(u=>u.indexOf(id+"/")===0), `${id}: picked, it fetches its own ${got.size} files and nothing else (sets ${r.sets})`);
    const line=await p.textContent("#loadLine"); ok(/^Ready/.test(line), `${id}: the line says "${line}"`); }
  let r=await pick("trumpet"); ok(r.ready && r.sets==="trumpet" && !r.got.some(u=>PLAYERS.some(f=>u.indexOf(f+"/")===0)), "back on the trumpet, none of them is kept or fetched: "+r.sets);

  /* 3 · in tune; the ranges */
  const tun=await p.evaluate(async(PLAYERS)=>{ const out={};
    for(const id of PLAYERS){ const sus=MAN[id].sus, notes=[sus[0], sus[sus.length>>1], sus[sus.length-1], sus[sus.length>>1]+1].filter((m,i,a)=>a.indexOf(m)===i), rows=[];
      for(const m of notes){ const x=await __note(id,m,3.0); rows.push({m, c: x ? +__held(x,m,32000,0.25,2.5).toFixed(1) : null}); }
      out[id]={rows, range:rangeOf(id)}; }
    return out; }, PLAYERS);
  for(const id of PLAYERS){ const rows=tun[id].rows, off=rows.filter(q=>q.c==null || Math.abs(q.c)>10);
    ok(!off.length, `${id}: notes ${rows.map(q=>q.m+" "+q.c+"c").join(", ")} all within 10 cents`); }
  ok(tun.voice_f_aa.range[0]>=55 && tun.voice_f_aa.range[1]<=82 && tun.voice_m_aa.range[0]>=44 && tun.voice_m_aa.range[1]<=67,
    "the woman sings "+tun.voice_f_aa.range.join("-")+", the man "+tun.voice_m_aa.range.join("-")+" (MIDI)");

  /* 4 · as loud as the grand */
  const lv=await p.evaluate(async(ids)=>{ const out={};
    for(const id of ids){ S.sound=id; await loadSound(id); const oc=new OfflineAudioContext(2,44100*2.6,44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); const c={off:0,q:"maj"}; S.key=0;
      chordParts(c, voicing(c,null)).filter(q=>!q.dup).forEach(q=>{ const vc=makeVoice(oc,ch,q.inst,q.m,0.74*(q.bass?0.85:1),0.05,"sus"); if(vc) vc.stop(2.05, vc.tau); });
      out[id]=+__kw(await oc.startRendering()).toFixed(2); }
    return out; }, MENU);
  ok(!Object.keys(lv).filter(k=>Math.abs(lv[k]-grand)>0.75).length, "each C chord within 0.75 dB of the grand's "+grand.toFixed(2)+" dB: "+JSON.stringify(lv));

  /* 5 · hold, and a gentle release */
  const lp=await p.evaluate(async(PLAYERS)=>{ const out={};
    for(const id of PLAYERS){ await loadSound(id); const set=SETS[setKey(id, id)], files=Object.keys(set.buf);
      const SR=44100, m=MAN[id].sus[MAN[id].sus.length>>1]+1, oc=new OfflineAudioContext(1, SR*14, SR), g=oc.createGain(); g.connect(oc.destination); S.sound=id;
      const vc=makeVoice(oc, {c:oc, bus:g, send:oc.createGain()}, id, m, 0.74, 0.05, "sus"); vc.stop(12.2, vc.tau);
      const d=(await oc.startRendering()).getChannelData(0), rms=(x,z)=>{ let e=0; for(let i=Math.floor(x*SR);i<Math.floor(z*SR);i++) e+=d[i]*d[i]; return +(10*Math.log10(e/((z-x)*SR)+1e-12)).toFixed(1); };
      out[id]={files:files.length, loops:files.filter(f=>set.loop[f]).length, held:rms(1,2), late:rms(10.5,11.5), after:rms(12.22,12.27), gone:rms(13.7,13.95), bowed:!!BOWED[id]}; }
    return out; }, PLAYERS);
  for(const id of PLAYERS){ const v=lp[id];
    ok(v.files && v.loops===v.files && v.bowed, `${id}: every held recording loops (${v.loops}/${v.files}) and it lets go as a bow does`);
    ok(v.late>-50 && v.late-v.held>-6 && v.late-v.held<4, `${id}: a 12 s note still sounds at 11 s (${v.late} dB against ${v.held} dB at 1-2 s)`);
    ok(v.after-v.late>-12 && v.gone-v.late<-40, `${id}: let go, it fades gently (${v.after} dB just after, ${v.gone} dB 1.5 s later)`); }

  /* 6 · a take records */
  await pick("voice_f_aa");
  await p.click("#recBtn"); await p.waitForTimeout(300); await p.evaluate(()=>{ noteOn("k66","voice_f_aa",66,0.8); }); await p.waitForTimeout(900); await p.evaluate(()=>noteOff("k66"));
  await p.evaluate(()=>{ noteOn("k69","voice_f_aa",69,0.8); }); await p.waitForTimeout(700); await p.evaluate(()=>noteOff("k69"));
  await p.click("#recBtn"); await p.waitForTimeout(1500);
  const rec=await p.evaluate(async()=>{ const k=REC.takes[0]; if(!k) return null; const buf=await new OfflineAudioContext(2,1,ac.sampleRate).decodeAudioData(await k.blob.arrayBuffer()), d=buf.getChannelData(0); let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x));
    return {sec:+k.sec.toFixed(1), peak:+pk.toFixed(2), notes:(k.notes&&k.notes.ev||[]).map(e=>e.p+e.m).join(" ")}; });
  ok(rec && rec.sec>1 && rec.peak>0.05 && /voice_f_aa66/.test(rec.notes||""), "a take of the woman's \"aah\" records, with its notes: "+JSON.stringify(rec));

  /* 7 · the Drum Machine */
  { const q=await c.newPage(); q.on("pageerror",e=>errs.push("pads: "+e.message)); await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    const preq=[]; q.on("request",r=>{ const u=r.url(), k=u.indexOf("/audio/band/"); if(k>=0) preq.push(u.slice(k+12)); });
    q.on("response",r=>{ if(r.status()>=400) bad.push("pads "+r.status()+" "+r.url()); });
    await q.goto("http://localhost:9334/music-pads.html"); await q.waitForTimeout(1500); await q.addScriptTag({content:MEASURE});
    ok(!preq.some(u=>PLAYERS.some(f=>u.indexOf(f+"/")===0)), "the Drum Machine opens fetching none of them");
    const grp=await q.evaluate(()=>{ const d=new DOMParser().parseFromString("<select>"+instOptions("")+"</select>","text/html");
      const o=[...d.querySelectorAll("optgroup")].find(x=>x.label===t("g_voices")); return o ? {label:o.label, ids:[...o.querySelectorAll("option")].map(x=>x.value)} : null; });
    ok(grp && grp.label==="Voices" && JSON.stringify(grp.ids)===JSON.stringify(["k:choir"].concat(PLAYERS.map(v=>"b:"+v))), "its Voices group lists the Choir, the four and the seven choirs: "+JSON.stringify(grp));
    const pr=await q.evaluate(async(PLAYERS)=>{ const man=await (await fetch("/audio/band/manifest.json")).json(), o={};
      for(const inst of PLAYERS){ const I=INST["b:"+inst], M=man[inst]; if(!I){ o[inst]="missing"; continue; }
        const zs=await zonesOf("b:"+inst), bad=[];
        if(JSON.stringify(I.n)!==JSON.stringify(M.sus)) bad.push("notes");
        zs.forEach(z=>{ if(z.c!==(M.tune[z.m+"s"]||0)) bad.push("tune "+z.m); });
        for(const z of zs){ const r=await fetch(z.url); if(!r.ok) bad.push("file "+z.m); }
        if(typeof LEVEL.inst["b:"+inst]!=="number") bad.push("level");
        o[inst]=bad.length?bad.join(", "):"ok"; }
      return o; }, PLAYERS);
    ok(PLAYERS.every(i=>pr[i]==="ok"), "each is tuned as the Band tunes it, every file there, levelled: "+JSON.stringify(pr));
    const pl=await q.evaluate(async(ids)=>{ const wait=bi=>new Promise((ok,no)=>{ const t0=Date.now(); const c=()=>{ if(isReady(bi)) ok(); else if(READY[bi].state==="failed" || Date.now()-t0>60000) no(new Error("not ready "+bi)); else setTimeout(c,30); }; prep(bi); c(); });
      const render=async(sec, fn)=>{ const oc=new OfflineAudioContext(2, Math.round(44100*sec), 44100), g=oc.createGain(); g.gain.value=0.9; g.connect(oc.destination);
        const T={c:oc, dest:g, open:[[],[],[],[]], chop:[null,null,null,null]}; fn(T); return +__kw(await oc.startRendering()).toFixed(1); };
      const out={};
      for(const id of ids){
        Object.assign(S.banks[1], {type:"chords", inst:id, key:0, scale:"major"}); await wait(1);
        const ch=await render(2.6, T=>{ const v=trigger(1, 0, 0.8, 0.05, T); if(v&&v.stop) v.stop(2.05); });
        Object.assign(S.banks[2], {type:"notes", inst:id, key:0, scale:"major", oct:4}); await wait(2);
        const nt=await render(2.6, T=>{ const v=trigger(2, 0, 0.8, 0.05, T); if(v&&v.stop) v.stop(2.05); });
        out[id]={chord:ch, note:nt}; }
      return out; }, ["k:choir"].concat(PLAYERS.map(v=>"b:"+v)));
    ok(Object.values(pl).every(v=>v.chord>-40 && v.note>-40), "the chords and notes banks play the Choir and each singer: "+Object.keys(pl).map(i=>i+" "+pl[i].chord+"/"+pl[i].note+" dB").join(", "));
    await q.close(); }

  /* 8 · no errors */
  ok(errs.length===0, "no page errors: "+errs.slice(0,5).join(" | "));
  ok(bad.length===0, "no failed requests: "+bad.slice(0,5).join(" | "));
  console.log(fails?fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH",e.stack); process.exit(1); });
