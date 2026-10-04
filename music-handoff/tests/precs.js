/* AOG-PIANO-REAL-V1 — the piano's sounds that became recordings (music-handoff/tools/piano_vcsl_sets.py): the '80s electric
   piano, the church organ, the glockenspiel, the vibraphone, the bells, the harpsichord, the kalimba and the tape flute; and
   (AOG-PIANO-REAL-V2) the warm electric piano, whose notes' tails were made from their own loops.
   For each one:
   · its recordings download only when it is picked (none at page load, none for the others), and until they arrive the
     version built on the page plays, with a line that says so;
   · every recorded note, and the notes between them, play in tune (within 5 cents) across its range, measured the way the
     build measured them (a row of partials; a bar's lowest partial; a bell's strike note, half its fourth partial);
   · its C chord is as loud as the grand's (within half a decibel, the method of bandt/measure.inc);
   · the held notes (organ, flute) loop with no swell, dip or click;
   · the offline renders use the recordings: Send to the turntables, Send chords to the drum machine, and ● Record;
   · Spanish words; a phone with no sideways scroll; no page errors.
   Port 9370. Run: AOG_ROOT=<checkout>/aog-deploy node music-handoff/tests/precs.js */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs");
const srv=require("./srv.js")(9370);
const U="http://localhost:9370/music-piano.html";
const MEASURE=(0,eval)(fs.readFileSync(__dirname+"/bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0, passes=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(c) passes++; else fails++; };
const REAL={ep80:"fmpiano", church:"pipeorgan", glock:"glockenspiel", vibes:"vibraphone", bells:"bells", harpsi:"harpsichord", kalimba:"kalimba", tapeflute:"flute",
  epwarm:"rhodes"};   /* AOG-PIANO-REAL-V2: the warm electric piano */
/* how each set's pitch is measured, and over which part of the note (seconds after it starts) */
const HOW={fmpiano:["harm",0.05,1.0], pipeorgan:["harm",0.6,2.6], harpsichord:["harm",0.05,0.8], flute:["harm",0.6,2.6],
  vibraphone:["bar",0.04,0.6], glockenspiel:["bar",0.04,0.6], kalimba:["bar",0.02,0.4], bells:["bell",0.05,1.0], rhodes:["harm",0.05,1.0]};
/* where each warm electric piano note's own loop began in its recording (seconds; piano_vcsl_sets.py prints them): from there
   on, the note is that loop repeated, fading on */
const RHODES_LOOP={29:4.92, 35:4.25, 40:5.85, 45:6.35, 50:5.39, 55:5.76, 59:4.84, 62:6.08, 65:5.34, 71:4.43, 76:3.09, 81:3.80, 86:3.53, 91:1.53, 96:0.65};
/* the pitch meter, in the page: an FFT, a peak found to a fraction of a bin, and the three ways of reading a note */
const PITCH=`
window.__fft=function(re,im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let b=n>>1; for(;j&b;b>>=1) j^=b; j^=b; if(i<j){ let t=re[i]; re[i]=re[j]; re[j]=t; t=im[i]; im[i]=im[j]; im[j]=t; } }
  for(let len=2;len<=n;len<<=1){ const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a), h=len>>1;
    for(let i=0;i<n;i+=len){ let cr=1, ci=0; for(let k=0;k<h;k++){ const p=i+k, q=p+h, xr=re[q]*cr-im[q]*ci, xi=re[q]*ci+im[q]*cr; re[q]=re[p]-xr; im[q]=im[p]-xi; re[p]+=xr; im[p]+=xi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } };
window.__cents=function(d, sr, midi, how, a, z){
  let pk=0; for(let i=0;i<d.length;i++) pk=Math.max(pk,Math.abs(d[i])); let on=0; while(on<d.length && Math.abs(d[on])<pk*0.03) on++;
  const s0=on+Math.floor(a*sr), s1=Math.min(d.length, on+Math.floor(z*sr)), L=s1-s0; let n=1; while(n<8*L && n<(1<<19)) n<<=1;
  const re=new Float64Array(n), im=new Float64Array(n); for(let i=0;i<L;i++) re[i]=d[s0+i]*(0.5-0.5*Math.cos(2*Math.PI*i/(L-1)));
  __fft(re,im); const S=new Float64Array(n/2); for(let i=0;i<n/2;i++) S[i]=Math.hypot(re[i],im[i]);
  const near=(f,c)=>{ const lo=Math.floor(f*Math.pow(2,-c/1200)*n/sr), hi=Math.floor(f*Math.pow(2,c/1200)*n/sr)+1; if(hi>=S.length-1||lo<1) return null;
    let i=lo; for(let k=lo;k<hi;k++) if(S[k]>S[i]) i=k; const al=Math.log(S[i-1]+1e-15), be=Math.log(S[i]+1e-15), ga=Math.log(S[i+1]+1e-15), den=al-2*be+ga;
    return [(i+(den?0.5*(al-ga)/den:0))*sr/n, S[i]]; };
  const f=440*Math.pow(2,(midi-69)/12);
  if(how==="bar"){ const r=near(f,80); return r?1200*Math.log2(r[0]/f):NaN; }
  if(how==="bell"){ const r=near(2*f,100); return r?1200*Math.log2(r[0]/(2*f)):NaN; }
  const est=[]; for(let k=1;k<=6;k++){ const r=near(k*f,60); if(!r) break; est.push([r[0]/k, r[1]]); }
  const mx=Math.max(...est.map(e=>e[1])), e2=est.filter(e=>e[1]>0.08*mx).sort((x,y)=>x[0]-y[0]), tot=e2.reduce((s,e)=>s+e[1],0);
  let c=0; for(const e of e2){ c+=e[1]; if(c>=tot/2) return 1200*Math.log2(e[0]/f); } return NaN; };
/* one note, alone, offline: no room, no effect bus (the tape's wobble and the vibraphone's pulse are not the recording) */
window.__note=async function(id, m, v, dur){
  const oc=new OfflineAudioContext(1, Math.ceil(44100*dur), 44100), bus=oc.createGain(); bus.connect(oc.destination);
  const ch={c:oc, bus:bus, org:bus, send:oc.createGain()}, snd=Object.assign({}, SOUNDS[id], {bus:null});
  const vc=sampleVoice(oc, ch, snd, m, v, 0.02); if(!vc) return null;
  return (await oc.startRendering()).getChannelData(0); };
/* which kind of voice the page made: a recording's, or a built one */
window.__calls={sample:0, made:0};
{ const sv=sampleVoice, bv=buildVoice, yv=synthVoice;
  window.sampleVoice=function(){ __calls.sample++; return sv.apply(this, arguments); };
  window.buildVoice=function(){ __calls.made++; return bv.apply(this, arguments); };
  window.synthVoice=function(){ __calls.made++; return yv.apply(this, arguments); }; }`;

(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}});
  await c.addInitScript(()=>{ if(!sessionStorage.getItem("precs")){ sessionStorage.setItem("precs","1"); localStorage.setItem("aog.lang","en"); localStorage.removeItem("aog.piano.v1"); } });
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  /* every request for a piano recording, by folder */
  const got={}; let slow=null;
  p.on("request", r=>{ const m=r.url().match(/\/audio\/piano\/([a-z]+)\//); if(m) got[m[1]]=(got[m[1]]||0)+1; });
  await p.route(/\/audio\/piano\/[a-z]+\/\d+m\.mp3$/, async r=>{ if(slow && r.request().url().indexOf("/audio/piano/"+slow+"/")>=0) await new Promise(x=>setTimeout(x,180)); r.continue(); });
  await p.goto(U); await p.waitForTimeout(2500);
  await p.addScriptTag({content:PITCH}); await p.addScriptTag({content:MEASURE});

  /* ── 1 · nothing new downloads at page load ── */
  ok(Object.values(REAL).every(s=>!got[s]), "at page load none of the new recordings download (asked for: "+Object.keys(got).join(", ")+")");

  /* ── 2 · each one downloads only when picked; the built version plays meanwhile, and the line says so ── */
  for(const [id,set] of Object.entries(REAL)){
    const before=Object.assign({}, got);
    ok(!got[set], id+": nothing of "+set+"/ downloaded before it is picked");
    slow=set;
    await p.selectOption("#soundSel", id);
    await p.waitForFunction(s=>SETS[s].state==="loading", set, {timeout:20000});
    const during=await p.evaluate(([id,s])=>{
      const oc=new OfflineAudioContext(1,4410,44100), bus=oc.createGain(), ch={c:oc, bus:bus, org:bus, send:oc.createGain()}, k={...__calls};
      const vc=makeVoice(oc, ch, id, 60, 0.7, 0);
      return {line:document.getElementById("loadLine").textContent, ready:SETS[s].ready, made:__calls.made-k.made, sample:__calls.sample-k.sample, voice:!!vc}; }, [id,set]);
    ok(!during.ready && during.voice && during.made===1 && during.sample===0 && /^Getting the .+ ready… \d+ of \d+ Until then you hear a version made on this page\.$/.test(during.line),
      id+": while it loads, its built version plays: \""+during.line+"\"");
    await p.waitForFunction(s=>SETS[s].state==="ready" && SETS[s].done>=SETS[s].total, set, {timeout:60000});
    slow=null;
    const after=await p.evaluate(([id,s])=>({line:document.getElementById("loadLine").textContent, n:SETS[s].notes.length,
      others:Object.keys(SETS).filter(k=>k!==s && SETS[k].state!=="idle")}), [id,set]);
    const fresh=Object.keys(got).filter(k=>(got[k]||0)!==(before[k]||0));
    ok(got[set]===after.n && fresh.join()===set && after.others.length===0,
      `${id}: picked, it downloads its ${after.n} notes from ${set}/ and nothing else (${fresh.join(", ")}); one recording kept at a time`);
    ok(/^Ready\. (Every note is a real |This is a real flute)/.test(after.line), id+": then \""+after.line+"\"");
  }
  /* picked away while it loads: its downloads stop and it keeps nothing; stepping through several leaves only the last */
  { await p.selectOption("#soundSel","grand"); await p.waitForFunction(()=>SETS.grand.state==="ready", null, {timeout:60000});
    slow="harpsichord"; const h0=got.harpsichord||0;
    await p.selectOption("#soundSel","harpsi"); await p.waitForTimeout(450);
    await p.selectOption("#soundSel","bells"); await p.waitForTimeout(300); const h1=got.harpsichord||0;
    await p.waitForFunction(()=>SETS.bells.state==="ready", null, {timeout:60000}); await p.waitForTimeout(800); slow=null;
    const h2=got.harpsichord||0, st=await p.evaluate(()=>({state:SETS.harpsichord.state, bufs:Object.keys(SETS.harpsichord.buf).length, done:SETS.harpsichord.done}));
    ok(h1-h0>0 && h1-h0<28 && h2===h1 && st.state==="idle" && st.bufs===0 && st.done===0,
      `picked away while loading, the harpsichord stops after ${h1-h0} of 28 downloads and keeps nothing (${JSON.stringify(st)})`);
    for(const id of ["ep80","church","glock","grand","upright"]){ await p.selectOption("#soundSel", id); await p.waitForTimeout(120); }
    await p.waitForFunction(()=>SETS.upright.state==="ready", null, {timeout:60000}); await p.waitForTimeout(1500);
    const left=await p.evaluate(()=>Object.keys(SETS).filter(k=>k!=="upright" && (SETS[k].state!=="idle" || Object.keys(SETS[k].buf).length)));
    ok(left.length===0, "stepping quickly through five sounds leaves only the last one's recordings ("+(left.join(", ")||"nothing else")+")"); }
  /* a sound still built on the page downloads nothing */
  { const k=Object.assign({}, got); await p.selectOption("#soundSel","toy"); await p.waitForTimeout(800);
    ok(JSON.stringify(k)===JSON.stringify(got) && /built on the page/.test(await p.textContent("#loadLine")), "a sound built on the page (toy piano) downloads nothing"); }

  /* ── 3 · in tune across the range, and as loud as the grand ── */
  const levels=await p.evaluate(async ids=>{
    const one=async(id)=>{ const snd=SOUNDS[id]; if(snd.kind==="sample"){ await loadSet(snd.set); if(!SETS[snd.set].ready) return null; }
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,id,m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); };
    const out={grand:await one("grand")}; for(const id of ids) out[id]=await one(id); return out; }, Object.keys(REAL));
  for(const [id,set] of Object.entries(REAL)){
    const [how,a,z]=HOW[set];
    const r=await p.evaluate(async([id,s,how,a,z])=>{
      await loadSet(s); const notes=SETS[s].notes, ms=[];
      notes.forEach((n,i)=>{ ms.push(n); if(i<notes.length-1 && notes[i+1]-n>1) ms.push(n+Math.round((notes[i+1]-n)/2)); });
      const out=[]; for(const m of ms){ const d=await __note(id, m, 0.74, z+0.6); out.push([m, d ? __cents(d, 44100, m, how, a, z) : NaN]); }
      return out; }, [id,set,how,a,z]);
    const bad=r.filter(x=>!(Math.abs(x[1])<=5)), cs=r.map(x=>x[1]);
    ok(bad.length===0, `${id}: ${r.length} notes from ${r[0][0]} to ${r[r.length-1][0]} in tune, ${Math.min(...cs).toFixed(1)} to ${Math.max(...cs).toFixed(1)} cents`+(bad.length?" (off: "+bad.map(x=>x[0]+" "+x[1].toFixed(1)).join(", ")+")":""));
    const d=levels[id]-levels.grand;
    ok(levels[id]!=null && Math.abs(d)<=0.5, `${id}: its C chord ${levels[id].toFixed(2)} dB, ${(d>=0?"+":"")+d.toFixed(2)} against the grand's ${levels.grand.toFixed(2)}`);
  }

  /* ── 4 · the held notes loop smoothly: held 7 s, a note's loudness moves no more through its loops than the recording
     itself moves before its loop (an organ's pipes beat slowly; that is the instrument), and the seam has no click ── */
  for(const [id,set,ms] of [["church","pipeorgan",[36,48,60,72,84]],["tapeflute","flute",[60,72,84]]]){
    const r=await p.evaluate(async([id,s,ms])=>{
      await loadSet(s); const out=[];
      /* loudness every 250 ms, as the distance from its middle value; the largest distance */
      const swing=(x, sr, a, z)=>{ const W=Math.floor(0.25*sr), lv=[]; for(let i=Math.floor(a*sr); i+W<=Math.floor(z*sr); i+=W){ let q=0; for(let k=i;k<i+W;k++) q+=x[k]*x[k]; lv.push(10*Math.log10(q/W+1e-20)); }
        const mid=lv.slice().sort((u,v)=>u-v)[lv.length>>1]; return Math.max(...lv.map(v=>Math.abs(v-mid))); };
      for(const m of ms){
        const d=await __note(id, m, 0.74, 7.3), sr=44100;
        const n=SETS[s].notes.reduce((best,x)=>Math.abs(x-m)<Math.abs(best-m)?x:best), rate=Math.pow(2,(m-n)/12), st=SETS[s].start[n+"m"], A=SETS[s].loop[0], Z=loopEnd(SETS[s],n);
        const raw=SETS[s].buf[n+"m"], own=swing(raw.getChannelData(0), raw.sampleRate, 1.0, Z-0.5);       /* the recording before its loop's fade */
        /* the sharpest step around every pass through the loop's seam, against the sharpest in the held part before the first */
        const step=(a,z)=>{ let x=0; for(let i=Math.max(1,Math.floor(a*sr));i<Math.min(d.length,Math.floor(z*sr));i++) x=Math.max(x,Math.abs(d[i]-d[i-1])); return x; };
        const first=0.02+(Z-st)/rate; let seam=0, k=0; for(let t=first; t<7.0; t+=(Z-A)/rate, k++) seam=Math.max(seam, step(t-0.01,t+0.01));
        out.push({m:m, all:swing(d, sr, 1.0, 7.0), own:own, seam:seam, held:step(1.0, first-0.05), seams:k});
      }
      return out; }, [id,set,ms]);
    for(const x of r) ok(x.all<=x.own+1.0 && x.seam<=x.held*1.05 && x.seams>=2,
      `${id} ${x.m} held 7 s, ${x.seams} loops: its loudness moves ${x.all.toFixed(2)} dB (the recording itself ${x.own.toFixed(2)}); the seam's sharpest step ${x.seam.toFixed(4)} (before it: ${x.held.toFixed(4)})`);
  }

  /* ── 4b · the warm electric piano: each note's tail, made from its own loop, fades smoothly (no click at a repeat, no
     pulsing: its loudness falls along a straight line in decibels), and how hard a key is played changes the tone ── */
  { const r=await p.evaluate(async LOOP=>{
      await loadSet("rhodes"); const out=[], sr=44100;
      for(const m of Object.keys(LOOP).map(Number)){
        const buf=SETS.rhodes.buf[m+"m"], dur=buf.duration, st=SETS.rhodes.start[m+"m"], d=await __note("epwarm", m, 0.74, dur+0.2);
        const at=t=>0.02+t-st;                              /* where a moment of the file lands in this rendering */
        const a=at(LOOP[m]+0.1), z=at(dur-1.2);           /* the tail, before the file's last fade */
        const step=(x,y)=>{ let q=0; for(let i=Math.max(1,Math.floor(x*sr)); i<Math.min(d.length,Math.floor(y*sr)); i++) q=Math.max(q,Math.abs(d[i]-d[i-1])); return q; };
        const W=Math.floor(0.05*sr), tt=[], lv=[];
        for(let i=Math.floor(a*sr); i+W<=Math.floor(z*sr); i+=W){ let q=0; for(let k=i;k<i+W;k++) q+=d[k]*d[k]; tt.push((i+W/2)/sr); lv.push(10*Math.log10(q/W+1e-20)); }
        const n=tt.length, mt=tt.reduce((s,x)=>s+x,0)/n, ml=lv.reduce((s,x)=>s+x,0)/n;
        let sxy=0, sxx=0; for(let i=0;i<n;i++){ sxy+=(tt[i]-mt)*(lv[i]-ml); sxx+=(tt[i]-mt)*(tt[i]-mt); }
        const k=sxy/sxx, off=Math.max(...lv.map((x,i)=>Math.abs(x-(ml+k*(tt[i]-mt)))));
        out.push({m:m, tail:+(z-a).toFixed(2), rate:+k.toFixed(1), off:+off.toFixed(2), seam:step(a,z), before:step(at(LOOP[m]-0.6), at(LOOP[m]-0.1))});
      }
      /* soft and hard: how bright middle C is (its energy above 1 kHz, against all of it, in dB) in its first 0.3 s, and the
         hard note a second later */
      const bright=(d,a,z)=>{ const s0=Math.floor(a*sr), L=Math.floor((z-a)*sr); let N=1; while(N<L) N<<=1; const re=new Float64Array(N), im=new Float64Array(N);
        for(let i=0;i<L;i++) re[i]=d[s0+i]*(0.5-0.5*Math.cos(2*Math.PI*i/(L-1))); __fft(re,im); let hi=0, s=0;
        for(let i=1;i<N/2;i++){ const P=re[i]*re[i]+im[i]*im[i]; s+=P; if(i*sr/N>1000) hi+=P; } return 10*Math.log10(hi/s); };
      const soft=await __note("epwarm", 60, 0.3, 2.2), hard=await __note("epwarm", 60, 1.0, 2.2);
      return {notes:out, soft:bright(soft,0.02,0.32), hard:bright(hard,0.02,0.32), hardLate:bright(hard,1.3,1.6)}; }, RHODES_LOOP);
    for(const x of r.notes) ok(x.tail>=0.5 && x.off<=1.0 && x.seam<=x.before*1.05,
      `epwarm ${x.m}: its ${x.tail} s tail fades at ${x.rate} dB/s, never more than ${x.off} dB off a smooth fade; sharpest step ${x.seam.toFixed(4)} (before the loop: ${x.before.toFixed(4)})`);
    ok(r.hard>=r.soft+6 && r.hard>=r.hardLate+1, `epwarm: played hard (at least 6 dB more above 1 kHz; the built warm sound had 13.5), middle C's attack is brighter (${r.hard.toFixed(1)} dB above 1 kHz) than played softly (${r.soft.toFixed(1)} dB), and settles (${r.hardLate.toFixed(1)} dB a second later)`);
  }

  /* ── 5 · the offline renders use the recordings ── */
  await p.selectOption("#progSel","pop"); await p.selectOption("#rhythmSel","pulse");
  for(const [id,set] of Object.entries(REAL)){
    await p.selectOption("#soundSel", id);
    await p.waitForFunction(s=>SETS[s].state==="ready", set, {timeout:60000});
    await p.evaluate(()=>{ __calls.sample=0; __calls.made=0; document.getElementById("sendLine").textContent=""; document.getElementById("padsLine").textContent=""; });
    await p.click("#sendBtn");
    await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("sendLine").textContent), null, {timeout:120000});
    const send=await p.evaluate(async()=>{ const x=await AOGHandoff.get("keysbench"); const k={...__calls}; if(!x) return null;
      const buf=await new OfflineAudioContext(2,1,44100).decodeAudioData(await x.wav.arrayBuffer()), d=buf.getChannelData(0); let pk=0, nan=0; for(const v of d){ if(!isFinite(v)) nan++; else pk=Math.max(pk,Math.abs(v)); }
      return {name:x.name, sec:buf.duration, peak:pk, nan:nan, calls:k}; });
    await p.evaluate(()=>{ __calls.sample=0; __calls.made=0; });
    await p.click("#padsBtn");
    await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("padsLine").textContent), null, {timeout:120000});
    const pads=await p.evaluate(async()=>{ const x=await AOGHandoff.get("chordpads"); return x && {n:x.pads.length, rms:Math.min(...x.pads.map(q=>{ let s=0; for(const v of q.pcm) s+=v*v; return Math.sqrt(s/q.pcm.length); })), calls:{...__calls}}; });
    ok(send && send.sec>=22 && send.peak>0.05 && send.peak<1 && !send.nan && send.calls.sample>0 && send.calls.made===0,
      `${id}: Send to the turntables renders the recordings (${send&&send.calls.sample} recorded voices, ${send&&send.calls.made} built) — "${send&&send.name}", ${send&&send.sec.toFixed(1)} s`);
    ok(pads && pads.n===6 && pads.rms>0.02 && pads.calls.sample>0 && pads.calls.made===0, `${id}: Send chords to the drum machine renders the recordings (${pads&&pads.calls.sample} recorded voices, ${pads&&pads.calls.made} built)`);
  }
  /* ● Record keeps what the recordings play */
  for(const id of ["harpsi","church"]){
    await p.selectOption("#soundSel", id); await p.waitForFunction(s=>SETS[s].state==="ready", REAL[id], {timeout:60000});
    const n=await p.evaluate(async()=>{ __calls.sample=0; __calls.made=0; await REC.toggle(); return REC.takes.length; });
    await p.waitForTimeout(250); await p.evaluate(()=>{ noteOn("k",60,0.8); noteOn("k",64,0.8); noteOn("k",67,0.8); }); await p.waitForTimeout(900);
    await p.evaluate(()=>{ noteOff("k",60); noteOff("k",64); noteOff("k",67); }); await p.waitForTimeout(500);
    await p.evaluate(()=>REC.toggle()); await p.waitForFunction(k=>REC.takes.length===k+1 && !REC.closing, n, {timeout:8000});
    const t=await p.evaluate(async()=>{ const k=REC.takes[0], buf=await new OfflineAudioContext(2,1,44100).decodeAudioData(await k.blob.arrayBuffer()), d=buf.getChannelData(0); let pk=0; for(const v of d) pk=Math.max(pk,Math.abs(v)); return {peak:pk, calls:{...__calls}}; });
    ok(t.peak>0.05 && t.calls.sample===3 && t.calls.made===0, `${id}: ● Record keeps the recorded notes (3 recorded voices, ${t.calls.made} built, peak ${t.peak.toFixed(2)})`);
  }

  /* ── 6 · Spanish ── */
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(200);
  await p.selectOption("#soundSel","grand"); await p.waitForFunction(()=>SETS.grand.state!=="loading", null, {timeout:60000});
  slow="kalimba"; await p.selectOption("#soundSel","kalimba");
  await p.waitForFunction(()=>SETS.kalimba.state==="loading" && SETS.kalimba.done>0, null, {timeout:20000});
  const esLoad=await p.textContent("#loadLine");
  await p.waitForFunction(()=>SETS.kalimba.state==="ready", null, {timeout:60000}); slow=null;
  const esReady=await p.textContent("#loadLine");
  ok(/^Preparando la kalimba… \d+ de \d+ Mientras tanto suena una versión hecha en esta página\.$/.test(esLoad) && esReady==="Listo. Cada nota es una kalimba de verdad.",
    "en español: \""+esLoad+"\" → \""+esReady+"\"");
  await p.selectOption("#soundSel","bells"); await p.waitForFunction(()=>SETS.bells.state==="ready", null, {timeout:60000});
  ok((await p.textContent("#loadLine"))==="Listo. Cada nota es una campana tubular de verdad.", "en español, las campanas: \""+await p.textContent("#loadLine")+"\"");
  await p.evaluate(()=>{ location.hash="#meet"; }); await p.waitForTimeout(400);
  const meet=await p.evaluate(()=>({harpsi:document.querySelector('.mcard[data-id="harpsi"] p').textContent, vibes:document.querySelector('.mcard[data-id="vibes"] p').textContent, foot:document.getElementById("foot").textContent}));
  ok(/Cada nota aquí es una grabación de un clavecín de verdad\.$/.test(meet.harpsi) && /la página agrega el latido del motor\.$/.test(meet.vibes) && /Versilian Community Sample Library/.test(meet.foot),
    "Conoce los sonidos y los créditos dicen qué es grabación: \""+meet.harpsi.slice(-60)+"\"");
  await p.evaluate(()=>{ location.hash="#home"; document.getElementById("langBtn").click(); }); await p.waitForTimeout(200);

  /* ── 7 · a phone: no sideways scroll, in the bench and in Meet the sounds ── */
  { const c2=await b.newContext(pw.devices["iPhone 13"]); await c2.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    const p2=await c2.newPage(); p2.on("pageerror",e=>errs.push("phone: "+e.message));
    await p2.goto(U); await p2.waitForTimeout(900);
    await p2.selectOption("#soundSel","church"); await p2.waitForFunction(()=>SETS.pipeorgan.state==="ready", null, {timeout:60000});
    const w1=await p2.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth, line:document.getElementById("loadLine").textContent}));
    await p2.evaluate(()=>{ location.hash="#meet"; }); await p2.waitForTimeout(500);
    const w2=await p2.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth}));
    ok(w1.sw<=w1.iw && w2.sw<=w2.iw && /real church organ/.test(w1.line), `iPhone 13: nothing sticks out sideways (bench ${w1.sw}/${w1.iw}, Meet the sounds ${w2.sw}/${w2.iw}); "${w1.line}"`);
    await c2.close(); }

  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log((fails? fails+" FAILED, ":"ALL PASS, ")+passes+" passed");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
