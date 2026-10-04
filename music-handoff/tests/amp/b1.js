/* the amp on the guitar and bass pages: no errors, the panel, the worklet in (live and offline), every sound's C chord
   level against the grand piano, and the heavy sounds really distorted (they hold their level: sustain) */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9961);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(require("path").join(__dirname,"../bandt/measure.inc"),"utf8").replace(/^const MEASURE=/,""));
let pass=0, fail=0; const ok=(c,m)=>{ if(c){ pass++; console.log("PASS", m); } else { fail++; console.log("FAIL", m); } };
(async()=>{
  const b=await pw.chromium.launch();
  for(const inst of ["guitar","bass"]){
    const p=await b.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push(m.text()); });
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9961/music-${inst}.html`); await p.waitForTimeout(800); await p.addScriptTag({content:MEASURE});
    const ui=await p.evaluate(()=>({panel:!!document.querySelector("#ampBox .aogamp"), knobs:document.querySelectorAll("#ampBox input[data-k]").length, pedals:document.querySelectorAll("#ampBox .aa-ped").length,
      bands:document.querySelectorAll("#ampBox input[data-band]").length, sounds:Object.keys(SOUNDS).length}));
    ok(ui.panel && ui.pedals===(inst==="guitar"?19:15) && ui.bands===10, `${inst}: the amp panel is there (${ui.knobs} knobs showing, ${ui.pedals} pedals, ${ui.bands} EQ bands), ${ui.sounds} sounds`);
    const live=await p.evaluate(async()=>{ ctx(); for(let i=0;i<40 && !LIVE_CH.rig.worklet;i++) await new Promise(r=>setTimeout(r,50)); return LIVE_CH.rig.worklet; });
    ok(live, `${inst}: the live engine runs the amp in its worklet`);
    const r=await p.evaluate(async(GTRp)=>{
      const out={};
      for(const id of Object.keys(SOUNDS)){
        S.sound=id; VOICINGS.clear();
        const oc=new OfflineAudioContext(2, 44100*2.6, 44100); await AOGAmp.load(oc); const ch=makeChain(oc);
        ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        if(SOUNDS[id].kind==="pluck") for(let i=0;i<60;i++) await new Promise(r=>setTimeout(r,0));
        const c={off:0,q:"maj"}; let k=0;
        if(GTRp){ shapeFor(c).forEach((f,s)=>{ if(f<0) return; const vc=makeVoice(oc,ch,id,TUNING[s]+f,0.74*(1-0.03*k),0.05+k*0.014,s); if(vc) vc.stop(2.05, vc.tau); k++; }); }
        else { const m=bassRoot(c), cl=cellFor(m), vc=makeVoice(oc,ch,id,m,0.8,0.05,cl?cl.s:null); if(vc) vc.stop(2.05, vc.tau); }
        const buf=await oc.startRendering(), d=buf.getChannelData(0);
        let pk=0, nan=false; for(let i=0;i<d.length;i++){ if(d[i]!==d[i]) nan=true; pk=Math.max(pk,Math.abs(d[i])); }
        const rms=(a,b)=>{ let s=0; for(let i=Math.floor(a*44100);i<Math.floor(b*44100);i++) s+=d[i]*d[i]; return Math.sqrt(s/((b-a)*44100)); };
        out[id]={db:__kw(buf), pk, nan, sus:20*Math.log10((rms(1.7,1.95)+1e-9)/(rms(0.1,0.35)+1e-9)), worklet:ch.rig.worklet, gain:SOUNDS[id].gain};
      }
      return out;
    }, inst==="guitar");
    if(process.env.SHOW) for(const [id,v] of Object.entries(r)) console.log(`  ${inst} ${id.padEnd(9)} C chord ${v.db.toFixed(2)} dB (grand -8.62) peak ${v.pk.toFixed(2)} sustain(1.8 s vs start) ${v.sus.toFixed(1)} dB ${v.worklet?"":"NO WORKLET"} gain ${v.gain} -> x${(v.gain*Math.pow(10,(-8.62-v.db)/20)).toFixed(3)}`);
    ok(Object.values(r).every(v=>!v.nan && v.pk>0.01 && v.worklet), `${inst}: every sound plays through the worklet amp, no NaN, not silent`);
    const off=Object.entries(r).filter(([id,v])=>Math.abs(v.db+8.62)>0.5);
    ok(!off.length, `${inst}: every sound's C chord within 0.5 dB of the grand piano's -8.62 dB ${off.map(([id,v])=>id+" "+v.db.toFixed(2)).join(", ")}`);
    if(inst==="guitar"){ ok(r.metal.sus>-4 && r.clean.sus<-9, `metal holds its level like a distorted amp (${r.metal.sus.toFixed(1)} dB at 1.8 s), clean fades (${r.clean.sus.toFixed(1)} dB)`); }
    ok(!errs.length, `${inst}: no page errors ${errs.slice(0,3).join(" | ")}`);
    await p.close();
  }
  console.log(fail?fail+" FAILED":"ALL PASS"); await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
