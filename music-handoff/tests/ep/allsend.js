/* AOG-PIANO-SOUNDS-V2 — the offline paths, from the page's own buttons, for every sound added in V2: pick it in the Instrument
   menu, pick Pop · 1 5 6 4, press Send to the turntables (a recording made offline through the whole chain, the recorded sets
   loaded first) and Send chords to the drum machine (six chord pads at 26,040 Hz). The recording must be about 22 s or more,
   have sound in every bar and no NaN; the six pads must each have sound. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9957);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const OLD=["grand","upright","honky","epwarm","epreed","ep80","organ","church"];
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9957/music-piano.html"); await p.waitForTimeout(900);
  await p.selectOption("#progSel","pop"); await p.selectOption("#rhythmSel","pulse");
  const ids=(await p.evaluate(()=>Object.keys(SOUNDS))).filter(id=>OLD.indexOf(id)<0);
  const only=process.argv[2]?process.argv[2].split(","):null;
  for(const id of ids){
    if(only && only.indexOf(id)<0) continue;
    await p.selectOption("#soundSel", id);
    await p.evaluate(()=>{ document.getElementById("sendLine").textContent=""; document.getElementById("padsLine").textContent=""; });
    await p.click("#sendBtn");
    await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("sendLine").textContent), null, {timeout:120000});
    const sent=await p.textContent("#sendLine");
    const rec=await p.evaluate(async()=>{ const x=await AOGHandoff.get("keysbench"); if(!x) return null;
      const ab=await x.wav.arrayBuffer(), oc=new OfflineAudioContext(2,1,44100), buf=await oc.decodeAudioData(ab), d=buf.getChannelData(0), sr=buf.sampleRate;
      let nan=0, pk=0; for(let i=0;i<d.length;i++){ if(!isFinite(d[i])) nan++; else pk=Math.max(pk,Math.abs(d[i])); }
      const barSec=4*60/S.bpm, bars=[]; for(let k=0;k<x.bars;k++){ let s=0, n=0; for(let i=Math.floor((0.05+k*barSec)*sr);i<Math.floor((0.05+(k+1)*barSec)*sr)&&i<d.length;i++){ s+=d[i]*d[i]; n++; } bars.push(Math.sqrt(s/Math.max(1,n))); }
      return {name:x.name, sec:buf.duration, nan:nan, peak:pk, quiet:Math.min(...bars), bars:x.bars}; });
    await p.click("#padsBtn");
    await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("padsLine").textContent), null, {timeout:120000});
    const pads=await p.evaluate(async()=>{ const x=await AOGHandoff.get("chordpads"); return x && {name:x.name, rms:x.pads.map(q=>{ let s=0; for(let i=0;i<q.pcm.length;i++) s+=q.pcm[i]*q.pcm[i]; return Math.sqrt(s/q.pcm.length); }), nan:x.pads.some(q=>q.pcm.some(v=>!isFinite(v)))}; });
    const good=/Sent/.test(sent) && rec && rec.sec>=22 && !rec.nan && rec.quiet>0.005 && rec.peak<1 && pads && pads.rms.length===6 && pads.rms.every(r=>r>0.02) && !pads.nan;
    ok(good, `${id.padEnd(10)} turntables: "${rec&&rec.name}" ${rec?rec.sec.toFixed(1):"?"} s, quietest bar ${rec?(20*Math.log10(rec.quiet)).toFixed(1):"?"} dB, peak ${rec?rec.peak.toFixed(2):"?"} | drum pads: ${pads?pads.rms.map(r=>r.toFixed(3)).join(" "):"none"}`);
  }
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
