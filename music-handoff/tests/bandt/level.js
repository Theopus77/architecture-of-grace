/* How loud is The Band? (1) one held note in the middle of each player's reach, so the players can be evened out;
   (2) each sound's C chord, held as a pad holds it, next to the grand piano's (the level every music tool is set to).
   Rendered offline through the page's own chain, before the compressor, K-weighted, loudest 400 ms. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9985);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync("measure.inc","utf8").replace(/^const MEASURE=/,""));
(async()=>{
  const b=await pw.chromium.launch(); const res={};
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9985/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    res.grand=await p.evaluate(async()=>{ await loadSet("grand");
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"grand"); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,"grand",m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); });
    await p.close(); }
  const p=await b.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9985/music-band.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
  const out=await p.evaluate(async()=>{
    const render=async(id, fn)=>{ S.sound=id; const oc=new OfflineAudioContext(2, 44100*2.6, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); fn(oc, ch); return __kw(await oc.startRendering()); };
    const one={}, chord={};
    for(const inst of Object.keys(PLAYER)){ await loadInst(inst);
      const m=MAN[inst].sus[Math.floor(MAN[inst].sus.length/2)];
      one[inst]={m, db:await render(inst,(oc,ch)=>{ const vc=makeVoice(oc,ch,inst,m,0.74,0.05,"sus"); vc.stop(2.05, vc.tau); })}; }
    for(const id of Object.keys(SOUNDS)){ await loadSound(id);
      chord[id]=await render(id,(oc,ch)=>{ const c={off:0,q:"maj"}; S.key=0; chordParts(c, voicing(c,null)).filter(p=>!p.dup).forEach(p=>{ const vc=makeVoice(oc,ch,p.inst,p.m,0.74*(p.bass?0.85:1),0.05,"sus"); vc.stop(2.05, vc.tau); }); }); }
    return {one, chord, player:PLAYER, gain:Object.fromEntries(Object.keys(SOUNDS).map(k=>[k,SOUNDS[k].gain]))};
  });
  console.log("grand C chord", res.grand.toFixed(2), "dB");
  const ones=Object.values(out.one).map(x=>x.db), mean=ones.reduce((a,b)=>a+b,0)/ones.length;
  for(const [k,v] of Object.entries(out.one)) console.log("one note", k.padEnd(9), String(v.m).padStart(3), v.db.toFixed(2), "dB; to the players' mean", (mean-v.db).toFixed(2), "dB  PLAYER now", out.player[k], "-> x", (out.player[k]*Math.pow(10,(mean-v.db)/20)).toFixed(3));
  for(const [k,v] of Object.entries(out.chord)) console.log("C chord ", k.padEnd(9), v.toFixed(2), "dB; to the grand", (res.grand-v).toFixed(2), "dB  gain now", out.gain[k], "-> x", (out.gain[k]*Math.pow(10,(res.grand-v)/20)).toFixed(3));
  if(errs.length) console.log("ERRORS", errs.join(" | "));
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
