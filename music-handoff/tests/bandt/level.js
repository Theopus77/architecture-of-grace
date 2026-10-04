/* How loud is The Band? (1) one held note in the middle of each player's reach, so the players can be evened out (with
   the sound's own gain taken out, as PLAYER was set: the first nine players sit at their mean); (2) each sound's C chord,
   held as a pad holds it, next to the grand piano's (the level every music tool is set to); (3) one stroke of each
   unpitched piece, next to the players' notes.
   Rendered offline through the page's own chain, before the compressor, K-weighted, loudest 400 ms.
   AOG-BAND-MORE-V1: the gain is divided out of (1), new players are matched to the first nine's mean, and (3) is new. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9985);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
const FIRST=["trumpet","trombone","horn","tuba","flute","clarinet","oboe","bassoon","sax"];
const ONLY=process.argv[2] ? process.argv[2].split(",") : null;
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
  const out=await p.evaluate(async(ONLY)=>{
    const render=async(id, fn)=>{ S.sound=id; const oc=new OfflineAudioContext(2, 44100*2.6, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); fn(oc, ch); return __kw(await oc.startRendering()); };
    const one={}, chord={}, kit={};
    for(const inst of Object.keys(PLAYER)){ if(inst==="kit" || (ONLY && ONLY.indexOf(inst)<0 && ["trumpet","trombone","horn","tuba","flute","clarinet","oboe","bassoon","sax"].indexOf(inst)<0)) continue;
      await loadSound(inst);
      const m=MAN[inst].sus[Math.floor(MAN[inst].sus.length/2)];
      const db=await render(inst,(oc,ch)=>{ const vc=makeVoice(oc,ch,inst,m,0.74,0.05,"sus"); vc.stop(2.05, vc.tau); });
      one[inst]={m, db, free:db-20*Math.log10(SOUNDS[inst].gain)}; }
    /* the unpitched pieces: one stroke each, with PLAYER.kit, the mix and the gain all at 1 */
    if(!ONLY || ONLY.indexOf("kit")>=0){
      await loadSound("percussion"); const keep={p:PLAYER.kit, g:SOUNDS.percussion.gain, mix:Object.assign({},KIT_MIX)};
      PLAYER.kit=1; SOUNDS.percussion.gain=1; Object.keys(KIT_MIX).forEach(k=>KIT_MIX[k]=1);
      for(const piece of Object.keys(MAN.kit.hits)) kit[piece]=await render("percussion",(oc,ch)=>{ const vc=kitVoice(oc,ch,piece,0.85,0.05,piece==="roll"?1.5:0); vc.stop(2.05, vc.tau); });
      PLAYER.kit=keep.p; SOUNDS.percussion.gain=keep.g; Object.assign(KIT_MIX, keep.mix); }
    for(const id of Object.keys(SOUNDS)){ if(ONLY && ONLY.indexOf(id)<0) continue; await loadSound(id);
      chord[id]=await render(id,(oc,ch)=>{ const c={off:0,q:"maj"}; S.key=0; chordParts(c, voicing(c,null)).filter(p=>!p.dup).forEach(p=>{ const vc=makeVoice(oc,ch,p.inst,p.m,0.74*(p.bass?0.85:1),0.05,"sus"); if(vc) vc.stop(2.05, vc.tau); }); }); }
    return {one, chord, kit, player:PLAYER, mix:KIT_MIX, gain:Object.fromEntries(Object.keys(SOUNDS).map(k=>[k,SOUNDS[k].gain]))};
  }, ONLY);
  console.log("grand C chord", res.grand.toFixed(2), "dB");
  const first=FIRST.map(k=>out.one[k]).filter(Boolean).map(x=>x.free), mean=first.reduce((a,b)=>a+b,0)/first.length;
  console.log("the first nine players' mean, one note, gain taken out:", mean.toFixed(2), "dB");
  for(const [k,v] of Object.entries(out.one)) console.log("one note", k.padEnd(17), String(v.m).padStart(3), v.free.toFixed(2), "dB; to the mean", (mean-v.free).toFixed(2), "dB  PLAYER now", out.player[k], "-> x", (out.player[k]*Math.pow(10,(mean-v.free)/20)).toFixed(3));
  for(const [k,v] of Object.entries(out.kit)) console.log("kit stroke", k.padEnd(6), v.toFixed(2), "dB at 1; to the players' mean", (mean-v).toFixed(2), "dB (mix now", out.mix[k], ")");
  for(const [k,v] of Object.entries(out.chord)) console.log("C chord ", k.padEnd(17), v.toFixed(2), "dB; to the grand", (res.grand-v).toFixed(2), "dB  gain now", out.gain[k], "-> x", (out.gain[k]*Math.pow(10,(res.grand-v)/20)).toFixed(3));
  if(errs.length) console.log("ERRORS", errs.join(" | "));
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
