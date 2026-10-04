/* AOG-PIANO-SOUNDS-V2 — every sound's C chord against the grand piano's: C4 E4 G4 at 0.74 and C3 at 0.74×0.85, as a pad plays
   it, rendered offline through the page's own chain, before the compressor (ch.pre straight to the destination), K-weighted,
   the loudest 400 ms (bandt/measure.inc). Every sound added in V2 must land within ±0.5 dB of the grand. Prints the gain that
   would land each one exactly (gain × 10^((grand − dB)/20)). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9950);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
/* AOG-PIANO-REAL-V1: the '80s electric piano and the church organ are recordings now, so they are checked like the rest */
const OLD=["grand","upright","honky","epwarm","epreed","organ"];
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9950/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
  const ids=await p.evaluate(()=>Object.keys(SOUNDS));
  /* the recorded ones grouped by their recordings, so each set is loaded once */
  const sets=await p.evaluate(()=>{ const o={}; Object.keys(SOUNDS).forEach(id=>o[id]=SOUNDS[id].kind==="sample"?SOUNDS[id].set:""); return o; });
  const seq=[...ids].sort((a,b)=>(sets[a]||"~").localeCompare(sets[b]||"~"));
  const out={};
  for(const id of seq){
    out[id]=await p.evaluate(async(id)=>{
      const snd=SOUNDS[id]; if(snd.kind==="sample"){ await loadSet(snd.set); if(!SETS[snd.set].ready) return {err:"set did not load"}; }
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,id,m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      const buf=await oc.startRendering(); let pk=0; for(let c=0;c<2;c++){ const d=buf.getChannelData(c); for(let i=0;i<d.length;i++) pk=Math.max(pk,Math.abs(d[i])); }
      return {db:__kw(buf), gain:snd.gain, rev:snd.rev, peak:pk};
    }, id);
  }
  const g=out.grand.db;
  console.log("grand", g.toFixed(2), "dB (the reference)");
  for(const id of ids){
    const r=out[id]; if(r.err){ ok(false, id+": "+r.err); continue; }
    const d=r.db-g, fit=r.gain*Math.pow(10,(g-r.db)/20);
    const line=`${id.padEnd(10)} ${r.db.toFixed(2).padStart(7)} dB  ${(d>=0?"+":"")+d.toFixed(2)} vs grand  gain ${r.gain} → ${fit.toFixed(3)}  rev ${r.rev}  peak ${r.peak.toFixed(2)}`;
    if(OLD.indexOf(id)>=0) console.log("     "+line+"  (unchanged sound)");
    else ok(Math.abs(d)<=0.5, line);
  }
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
