/* the piano's sounds, C chord against the grand (C4 E4 G4 at 0.74, C3 at 0.74*0.85), through the page's chain before the
   compressor, K-weighted, loudest 400 ms: the way AOG-PIANO-V1 levelled them. Prints every sound. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9989);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9989/music-piano.html"); await p.waitForTimeout(800); await p.addScriptTag({content:MEASURE});
  const ids=process.argv.slice(2);
  const r=await p.evaluate(async(ids)=>{ const out={};
    for(const id of (ids.length?ids:Object.keys(SOUNDS))){ const snd=SOUNDS[id];
      if(snd.kind==="sample") await loadSet(snd.set); else if(typeof loadSound==="function"){ try{ await loadSound(id); }catch(e){} }
      if(snd.set && typeof loadSet==="function" && snd.kind!=="sample"){ try{ await loadSet(snd.set); }catch(e){} }
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8);
      if(typeof setSound==="function") setSound(ch,id); else setSendLevel(ch,id);
      setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,id,m,0.74*(j===3?0.85:1),0.05); if(vc) vc.stop(2.05, vc.tau); });
      out[id]=__kw(await oc.startRendering()); }
    return out; }, ids);
  for(const [k,v] of Object.entries(r)) console.log(k.padEnd(10), v.toFixed(2), "dB", (v+8.62>=0?"+":"")+(v+8.62).toFixed(2));
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
