/* AOG-PIANO-SOUNDS-V2 — can a phone play it? A busy pattern for every sound: the 12-bar blues (four-note seventh chords and the
   bass), Eight a bar, 160 beats a minute, eight bars, rendered offline through the whole chain. Reports how many times faster
   than real time it renders here, the most voices sounding at once, and the audio nodes they use; each V2 sound must render at
   least 0.5× as fast as the slowest of the eight sounds the piano already had (a phone that plays those plays these) and stay
   under 60 voices at once. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9956);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const OLD=["grand","upright","honky","epwarm","epreed","ep80","organ","church"];
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9956/music-piano.html"); await p.waitForTimeout(600);
  const ids=await p.evaluate(()=>Object.keys(SOUNDS));
  const out={};
  for(const id of ids){
    out[id]=await p.evaluate(async(id)=>{
      const snd=SOUNDS[id]; if(snd.kind==="sample") await loadSet(snd.set);
      const pre=PRESETS.find(x=>x.id==="blues"); S.prog=pre.chords.map(c=>({off:c.off,q:c.q})); S.key=0; S.minor=false; S.rhythm="eighths"; S.sound=id;
      const bpm=160, barSec=4*60/bpm, bars=8, sr=44100, dur=bars*barSec+3;
      /* warm the made notes first, as the page does in the background */
      const oc0=new OfflineAudioContext(1,128,sr); for(let m=36;m<=84;m++) if(MAKERS[snd.kind]) madeBuf(oc0, snd.kind, m);
      const oc=new OfflineAudioContext(2, Math.ceil(dur*sr), sr), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      const prev={v:null}; let voices=[];
      for(let k=0;k<bars;k++) voices=voices.concat(scheduleBar(oc, ch, k, 0.05+k*barSec, barSec, 0.5, prev));
      /* the most voices alive at once (from start to stop plus seven release times) */
      let most=0; for(let t=0;t<dur;t+=0.02){ let n=0; voices.forEach(v=>{ if(v.on<=t && (v.end||v.off+7*v.tau)>t) n++; }); most=Math.max(most,n); }
      const nodes=voices.reduce((a,v)=>a+(v.nodes?v.nodes.length:0),0)/Math.max(1,voices.length);
      const t0=performance.now(); const buf=await oc.startRendering(); const ms=performance.now()-t0;
      let pk=0; const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) pk=Math.max(pk,Math.abs(d[i]));
      return {x:dur*1000/ms, most:most, src:nodes, peak:pk, count:voices.length};
    }, id);
  }
  const floor=Math.min(...OLD.map(id=>out[id].x));
  console.log("the eight first sounds render at", OLD.map(id=>id+" "+out[id].x.toFixed(1)+"×").join(", "));
  for(const id of ids){ const r=out[id], line=`${id.padEnd(10)} ${r.x.toFixed(1).padStart(6)}× real time | ${String(r.most).padStart(3)} voices at most | ${r.src.toFixed(1)} sources a voice | ${r.count} notes | output peak ${r.peak.toFixed(2)}`;
    if(OLD.indexOf(id)>=0) console.log("     "+line+"  (as before)"); else ok(r.x>=0.5*floor && r.most<60 && r.peak<1, line); }
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
