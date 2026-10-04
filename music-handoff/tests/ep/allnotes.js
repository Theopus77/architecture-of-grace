/* AOG-PIANO-SOUNDS-V2 — every sound at the edges of the keyboard and across it, offline, through the page's own chain.
   Notes: A0 (21, the lowest a MIDI keyboard sends), C1 (24, the lowest key on screen), C2 … C7 (96, the highest key on screen)
   and C8 (108). One note at full strength (velocity 1), held 1.5 s, then let go. Two taps: before the compressor (where the
   levels are measured) and the page's real output (after the compressor, the limiter and the volume at 0.8).
   Every sound must, on A0, C1, C4, C7 and C8: make a sound (C4 a clear one); have no NaN; peak below 1 at the output; stop
   without a click (no step at the let-go sharper than while held); die away (the last 0.3 s of a 7 s tail, past the room,
   silent). The sounds added in V2 must also peak below 1 before the compressor, and play C4 in tune (within 4 cents; 8 for
   the sounds with a chorus or a wobble of their own). Across C2 … C6 (where chords and the bass play) no note is more than
   9 dB softer or louder than the middle of the range (also V2). Prints each sound's level at every C. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9951);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const NOTES=[21,24,36,48,60,72,84,96,108], EDGE=[21,24,60,96,108], CORE=[36,48,60,72,84];
const OLD=["grand","upright","honky","epwarm","epreed","ep80","organ","church"];
const WOBBLE=["strsynth","choir","strings","tapestr","tapeflute","theatre","gospel","rockorgan","lead","pad","brass","accordion","vibes"];
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9951/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
  const ids=await p.evaluate(()=>Object.keys(SOUNDS));
  const sets=await p.evaluate(()=>{ const o={}; Object.keys(SOUNDS).forEach(id=>o[id]=SOUNDS[id].kind==="sample"?SOUNDS[id].set:""); return o; });
  const seq=[...ids].sort((a,b)=>(sets[a]||"~").localeCompare(sets[b]||"~"));
  const only=process.argv[2]?process.argv[2].split(","):null;
  for(const id of seq){
    if(only && only.indexOf(id)<0) continue;
    const r=await p.evaluate(async([id,NOTES])=>{
      const snd=SOUNDS[id]; if(snd.kind==="sample"){ await loadSet(snd.set); if(!SETS[snd.set].ready) return {err:"set did not load"}; }
      const out={}, sr=44100, T=1.6, LEN=T+7;
      for(const m of NOTES){
        const oc=new OfflineAudioContext(2, Math.ceil(sr*LEN), sr), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
        const mg=oc.createChannelMerger(2); ch.master.disconnect(); ch.pre.connect(mg,0,0); ch.master.connect(mg,0,1); mg.connect(oc.destination);
        const t0=performance.now();
        const vc=makeVoice(oc,ch,id,m,1.0,0.1); vc.stop(T, vc.tau);
        const made=performance.now()-t0;
        const buf=await oc.startRendering(), d=buf.getChannelData(0), o=buf.getChannelData(1);
        let nan=0, pk=0, opk=0; for(let i=0;i<d.length;i++){ const x=d[i], y=o[i]; if(!isFinite(x)||!isFinite(y)) nan++; else { pk=Math.max(pk,Math.abs(x)); opk=Math.max(opk,Math.abs(y)); } }
        const rms=(a,z)=>{ let s=0, n=0; for(let i=Math.floor(a*sr);i<Math.min(d.length,Math.floor(z*sr));i++){ s+=d[i]*d[i]; n++; } return Math.sqrt(s/Math.max(1,n)); };
        const edge=(a,z)=>{ let e=0; for(let i=Math.max(1,Math.floor(a*sr));i<Math.min(d.length,Math.floor(z*sr));i++) e=Math.max(e,Math.abs(d[i]-d[i-1])); return e; };
        let loud=0; for(let a=0.1;a<T-0.05;a+=0.025) loud=Math.max(loud, rms(a,a+0.05));
        const k=(()=>{ const ob=new AudioBuffer({length:Math.floor((T-0.1)*sr), sampleRate:sr, numberOfChannels:1}); ob.getChannelData(0).set(d.subarray(Math.floor(0.1*sr), Math.floor(0.1*sr)+ob.length)); return __kw(ob); })();
        let cents=null;
        if(m===60 && id!=="honky"){   /* the honky-tonk is two copies 11 cents either side, on purpose */
          const N=1<<16, a=Math.floor(0.12*sr), seg=new Float64Array(N); for(let i=0;i<N && a+i<d.length;i++) seg[i]=d[a+i]*(0.5-0.5*Math.cos(2*Math.PI*i/N));
          const f0=440*Math.pow(2,(m-69)/12), mag=f=>{ let re=0, im=0; const w=2*Math.PI*f/sr; for(let i=0;i<N;i+=2){ re+=seg[i]*Math.cos(w*i); im-=seg[i]*Math.sin(w*i); } return re*re+im*im; };
          let best=0, bf=f0; for(let c=-40;c<=40;c+=1){ const f=f0*Math.pow(2,c/1200), v=mag(f); if(v>best){ best=v; bf=f; } }
          /* the pitch centre: power-weighted over 25 cents either side of the strongest partial (a pair a few cents apart, a
             chorus or a tape wobble reads as where it sits, not as one of its edges) */
          let sw=0, sc=0; const cb=1200*Math.log2(bf/f0); for(let c=cb-25;c<=cb+25;c+=0.5){ const v=mag(f0*Math.pow(2,c/1200)); sw+=v; sc+=v*c; }
          cents=sc/sw;
        }
        out[m]={nan:nan, peak:pk, opeak:opk, loud:loud, kw:k, held:edge(0.6,T), let:edge(T,T+0.15), lastRms:rms(LEN-0.3,LEN), made:made, cents:cents};
      }
      return out;
    }, [id,NOTES]);
    if(r.err){ ok(false, id+": "+r.err); continue; }
    const isNew=OLD.indexOf(id)<0, db=x=>(20*Math.log10(x+1e-12)).toFixed(1);
    const bad=[], note=[];
    EDGE.forEach(m=>{ const x=r[m];
      if(x.nan) bad.push(m+" has NaN");
      if(x.opeak>=1) bad.push(m+" peaks at "+x.opeak.toFixed(2)+" at the output");
      if(x.peak>=1) (isNew?bad:note).push(m+" peaks at "+x.peak.toFixed(2)+" before the compressor");
      if(x.loud<(m===60?0.02:0.003)) bad.push(m+" is too quiet ("+db(x.loud)+" dB)");
      if(x.let>Math.max(x.held*1.5, 0.002)) bad.push(m+" clicks when let go (step "+x.let.toFixed(4)+" vs held "+x.held.toFixed(4)+")");
      if(x.lastRms>1e-4) bad.push(m+" does not die away ("+db(x.lastRms)+" dB at the end)");
    });
    const c=r[60].cents, tol=WOBBLE.indexOf(id)>=0?8:4;
    if(c!==null && Math.abs(c)>tol) (isNew?bad:note).push("C4 is "+c.toFixed(1)+" cents off");
    const core=CORE.map(m=>r[m].kw), mid=core.slice().sort((a,b)=>a-b)[2];
    CORE.forEach((m,i)=>{ if(Math.abs(core[i]-mid)>9) (isNew?bad:note).push(m+" is "+(core[i]-mid).toFixed(1)+" dB from the middle of the range"); });
    const lv=NOTES.map(m=>m+":"+r[m].kw.toFixed(1)).join(" ");
    const pks=EDGE.map(m=>r[m].peak.toFixed(2)+"/"+r[m].opeak.toFixed(2)).join(" ");
    ok(bad.length===0, `${id.padEnd(9)} K-dB ${lv} | peaks pre/out ${pks} | C4 ${c===null?"—":(c>=0?"+":"")+c.toFixed(1)+" ct"} | made ${Math.max(...NOTES.map(m=>r[m].made)).toFixed(0)} ms${bad.length?" → "+bad.join("; "):""}${note.length?" (as before: "+note.join("; ")+")":""}`);
  }
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
