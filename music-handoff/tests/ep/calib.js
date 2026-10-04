/* set each V2 sound's gain from the C-chord measurement (the same as allevel.js), write it into music-piano.html, twice over */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9953);
const fs=require("fs"), path=require("path"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
const PAGE=path.join(process.env.AOG_ROOT, "music-piano.html");
const OLD=["grand","upright","honky","epwarm","epreed","ep80","organ","church"];
const only=process.argv[2]?process.argv[2].split(","):null;
async function measure(b){
  const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9953/music-piano.html"); await p.waitForTimeout(500); await p.addScriptTag({content:MEASURE});
  const r=await p.evaluate(async([OLD,only])=>{
    const ids=Object.keys(SOUNDS).filter(id=>id==="grand"||(OLD.indexOf(id)<0&&(!only||only.indexOf(id)>=0)));
    ids.sort((a,b)=>((SOUNDS[a].set||"~")).localeCompare(SOUNDS[b].set||"~"));
    const out={};
    for(const id of ids){
      const snd=SOUNDS[id]; if(snd.kind==="sample") await loadSet(snd.set);
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,id,m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      out[id]={db:__kw(await oc.startRendering()), gain:snd.gain};
    }
    return out; }, [OLD,only]);
  await p.close(); return r;
}
(async()=>{
  const b=await pw.chromium.launch();
  for(let pass=0;pass<3;pass++){
    const r=await measure(b), g=r.grand.db; let html=fs.readFileSync(PAGE,"utf8"), changed=0;
    for(const [id,x] of Object.entries(r)){ if(id==="grand") continue;
      const d=x.db-g; console.log(`pass ${pass} ${id.padEnd(10)} ${x.db.toFixed(2)} dB (${d>=0?"+":""}${d.toFixed(2)}) gain ${x.gain}`);
      if(Math.abs(d)<=0.15) continue;
      const fit=+(x.gain*Math.pow(10,-d/20)).toFixed(3);
      const re=new RegExp("(\\n  "+id+":\\s*\\{[^\\n]*?gain:)([0-9.]+)");
      if(!re.test(html)){ console.log("  cannot find the gain of "+id); continue; }
      html=html.replace(re, "$1"+fit); changed++;
    }
    if(!changed){ console.log("all within 0.15 dB"); break; }
    fs.writeFileSync(PAGE, html); console.log(`pass ${pass}: ${changed} gains written`);
  }
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
