/* How loud is the Beat Lab? (AOG-PADS-LEVEL-V1, 2026-10-05 — Jimmy: "all the instruments don't start at the same volume".)
   Every sound the Beat Lab plays, next to the grand piano's C chord on the piano page (the level every music tool is set
   to): each instrument's C chord as bank B plays it (the basses: a low C held, as bank C plays it), each recorded drum
   kit playing one bar of a plain beat (kick, snare on 2 and 4, eighth-note hi-hats, at 90), and each record's first four
   chops, one after another. Rendered offline through each page's whole sound (the Beat Lab's limiter included), at the
   page's default volume, K-weighted, loudest 400 ms (measure.inc, as bandt/level). A single drum hit is not matched to a
   held chord: its loudest 400 ms is mostly ring, and lifting it that far would only squash it. A bar of beat is.
     node music-handoff/tests/pads/level.js            prints every sound and how far it is from the grand
     node music-handoff/tests/pads/level.js --table    also prints the trims to paste into music-pads.html (LEVEL)
   Exit code 1 if a sound is more than 1 dB from the grand with its trim in place. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9987);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
const TABLE=process.argv.includes("--table");
(async()=>{
  const b=await pw.chromium.launch();
  let ref;
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9987/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    ref=await p.evaluate(async()=>{ await loadSet("grand");
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"grand"); setEra(ch,0,0);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,"grand",m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); });
    await p.close(); }
  const p=await b.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.addInitScript(()=>{ try{ localStorage.removeItem("aog.pads.v1"); }catch(e){} });
  await p.goto("http://localhost:9987/music-pads.html"); await p.waitForTimeout(800); await p.addScriptTag({content:MEASURE});
  await p.waitForFunction(()=>window.isReady && CRATE.length>0, null, {timeout:60000});
  const out=await p.evaluate(async()=>{
    const wait=bi=>new Promise((ok,no)=>{ const t0=Date.now(); const c=()=>{ if(isReady(bi)) ok(); else if(READY[bi].state==="failed" || Date.now()-t0>60000) no(new Error("not ready "+bi)); else setTimeout(c,30); }; prep(bi); c(); });
    /* the Beat Lab's whole sound, as ctx() makes it: the bus at 0.9 into the limiter */
    const render=async(sec, fn)=>{ const oc=new OfflineAudioContext(2, Math.round(44100*sec), 44100), g=oc.createGain(), l=oc.createDynamicsCompressor();
      l.threshold.value=-3; l.knee.value=2; l.ratio.value=20; l.attack.value=0.002; l.release.value=0.12;
      /* measured before the ceiling: its true loudest moment; held at CLEAN, the ceiling never has to touch it */
      g.gain.value=0.9; g.connect(l); l.connect(oc.destination);
      fn({c:oc, dest:g, open:[[],[],[],[]], chop:[null,null,null,null]}); const buf=await oc.startRendering();
      let pk=0; for(let c=0;c<buf.numberOfChannels;c++){ const d=buf.getChannelData(c); for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); if(a>pk) pk=a; } }
      PEAK=Math.max(PEAK, pk); LASTPK=pk; return __kw(buf); };
    let LASTPK=0; const pk={inst:{}, kit:{}, rec:{}};
    let PEAK=0;
    const res={inst:{}, kit:{}, rec:{}};
    for(const id of Object.keys(INST)){
      const low=INST[id].g==="bass";
      if(low){ Object.assign(S.banks[2], {type:"notes", inst:id, key:0, scale:"major", oct:2}); await wait(2);
        res.inst[id]=await render(2.6, T=>{ const v=trigger(2, 0, 0.8, 0.05, T); if(v) v.stop(2.05); }); pk.inst[id]=LASTPK; }
      else { Object.assign(S.banks[1], {type:"chords", inst:id, key:0, scale:"major"}); await wait(1);
        res.inst[id]=await render(2.6, T=>{ const v=trigger(1, 0, 0.8, 0.05, T); if(v) v.stop(2.05); }); pk.inst[id]=LASTPK; }
    }
    for(const k of KITS()){
      Object.assign(S.banks[0], {type:"drums", kitA:k, kitB:k}); await wait(0);
      const e=60/90/2;   /* an eighth note at 90 */
      res.kit[k]=await render(8*e+0.6, T=>{ for(let i=0;i<8;i++){ const t=0.05+i*e; trigger(0, 2, i%2?0.6:0.8, t, T);
        if(i===0||i===5) trigger(0, 0, 0.8, t, T); if(i===2||i===6) trigger(0, 1, 0.8, t, T); } }); pk.kit[k]=LASTPK;
    }
    for(const c of CRATE){
      Object.assign(S.banks[3], {type:"chops", rec:"c:"+c.file, bar:1}); await wait(3);
      const beat=60/c.bpm;
      res.rec[c.file]=await render(4*beat+0.5, T=>{ for(let i=0;i<4;i++) trigger(3, i, 0.8, 0.05+i*beat, T); }); pk.rec[c.file]=LASTPK;
    }
    return {res, pk, peak:PEAK, trim:(typeof LEVEL!=="undefined") ? LEVEL : null};
  });
  const r=out.res; let bad=0; const table={inst:{}, kit:{}, rec:{}};
  /* as loud as the grand, but never lifted past a clean loudest moment (0.9 of full scale): a sound held back by its
     peak is "held" and counts as level (it is as loud as it can be without crackling) */
  const CLEAN=0.8;   /* where the ceiling (music-pads.html) starts rounding: below it, nothing is rounded */
  const TARGET=ref-2;   /* two dB under the grand: room for a beat's hits and a bass under the same ceiling */
  const line=(grp, k, db)=>{ const off=db-TARGET, cur=(out.trim && out.trim[grp] && out.trim[grp][k]) || 0, p=out.pk[grp][k]||0;
    const room=p>0 ? 20*Math.log10(CLEAN/p) : 99, want=-off, step=Math.min(want, room);
    table[grp][k]=Math.round((cur+step)*10)/10;
    const held=want>room+0.3 && room<0.6, flag=Math.abs(off)>1 && !held ? "  OFF" : held ? "  held (peak "+p.toFixed(2)+")" : "";
    if(flag==="  OFF") bad++; if(p>0.98) { bad++; }
    console.log(`${grp.padEnd(5)} ${k.padEnd(24)} ${db.toFixed(2)} dB; to the target ${off>=0?"+":""}${off.toFixed(2)} dB; peak ${p.toFixed(2)}${flag}${p>0.98?"  CLIPS":""}`); };
  console.log(`grand C chord (piano page): ${ref.toFixed(2)} dB; the target, 2 dB under it: ${(ref-2).toFixed(2)} dB`);
  Object.keys(r.inst).forEach(k=>line("inst", k, r.inst[k]));
  Object.keys(r.kit).forEach(k=>line("kit", k, r.kit[k]));
  Object.keys(r.rec).forEach(k=>line("rec", k, r.rec[k]));
  if(TABLE) console.log("LEVEL="+JSON.stringify(table)+";");
  console.log("loudest sample of all: "+out.peak.toFixed(3)+" (1 is full scale)");
  console.log(errs.length ? "page errors: "+errs.join("; ") : "no page errors");
  console.log(bad ? `FAIL ${bad} sound(s) more than 1 dB from the target` : "PASS every sound within 1 dB of the target, or as loud as it can be without crackling");
  await b.close(); srv.close(); process.exit(bad||errs.length ? 1 : 0);
})();
