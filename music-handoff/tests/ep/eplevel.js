/* the C-major chord on each piano sound, K-weighted, loudest 400 ms, before the compressor (as AOG-PIANO-V1 leveled them) */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9988);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync("../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9988/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
  const r=await p.evaluate(async()=>{ await loadSet("grand"); const out={};
    for(const id of ["grand","epwarm","epreed","ep80"]){
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,id,m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      out[id]=__kw(await oc.startRendering()); }
    return out; });
  for(const [k,v] of Object.entries(r)) console.log(k.padEnd(7), v.toFixed(2), "dB");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
