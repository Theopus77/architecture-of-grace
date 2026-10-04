/* Every chord (12 roots × 5 kinds) at every place the hand can be, for the guitar's shapes and the bass's roots:
   right notes, root and third present, every fretted note inside the frets on screen, at least three strings. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9975);
(async()=>{
  const b=await pw.chromium.launch();
  let pass=0, fail=0; const ok=(c,m)=>{ if(c) pass++; else { fail++; console.log("FAIL", m); } };
  for(const inst of ["guitar","bass"]){
    const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9975/music-${inst}.html`); await p.waitForTimeout(400);
    const r=await p.evaluate(()=>{
      const bad=[], stats={}; let checked=0; const saveN=NECK.n, save0=S.fret0, saveKey=S.key;
      for(const n of (GTR?[4,5,11,12]:[5,11,12])){
        NECK.n=n;
        for(let f0=1; f0<=MAXF-n+1; f0++){
          S.fret0=f0;
          for(let root=0; root<12; root++) for(const q of Object.keys(Q)){
            S.key=0; VOICINGS.clear(); const c={off:root, q:q}, pcs=chordPcs(c); checked++;
            if(GTR){
              const shp=shapeFor(c), notes=shp.map((f,s)=>f<0?null:TUNING[s]+f).filter(x=>x!=null);
              const why=[];
              if(notes.length<3) why.push("fewer than 3 strings");
              if(notes.some(m=>pcs.indexOf(m%12)<0)) why.push("wrong note");
              if(notes.map(m=>m%12).indexOf(pcs[0])<0) why.push("no root");
              if(notes.map(m=>m%12).indexOf(pcs[1])<0) why.push("no third");
              shp.forEach(f=>{ if(f>0 && (f<f0 || f>f0+n-1)) why.push("fret "+f+" outside "+f0+"-"+(f0+n-1)); if(f===0 && f0>2) why.push("open string up the neck"); });
              const on=shp.map((f,s)=>f>=0?s:-1).filter(s=>s>=0); if(on.length && on[on.length-1]-on[0]+1!==on.length && !shapesFor(c).some(sh=>sh.f.join()===shp.join())) why.push("gap in the strings");
              stats[notes.length]=(stats[notes.length]||0)+1; if(notes.length && Math.min(...notes)%12!==pcs[0]) stats.inv=(stats.inv||0)+1;
              if(why.length) bad.push(`n${n} at ${f0}: ${KEY_NAMES.en[root]}${q} ${JSON.stringify(shp)} — ${why.join(", ")}`);
            } else {
              const R=bassRoot(c), cl=cellFor(R);
              const why=[];
              if(R%12!==pcs[0]) why.push("root is wrong note");
              if(!cl || !inReach(cl.f)) why.push("root not in reach");
              /* AOG-STRINGS-WAYS-V1: every way of playing, and every note on the frets on screen */
              RHYTHMS.forEach(rh=>[0,1,2,3].forEach(k=>{ lineEvents(rh, c, {off:(root+5)%12,q:"maj"}, k).forEach(ev=>{ const cc=cellFor(ev.m); if(!cc) why.push(rh+" note "+ev.m+" has no place"); else if(!inReach(cc.f)) why.push(rh+" bar "+(k+1)+" note "+ev.m+" off the frets on screen (fret "+cc.f+")"); }); }));
              if(why.length) bad.push(`n${n} at ${f0}: ${KEY_NAMES.en[root]}${q} root ${R} — ${why.join(", ")}`);
            }
          }
        }
      }
      NECK.n=saveN; S.fret0=save0; S.key=saveKey;
      return {checked:checked, bad:bad, stats:stats};
    });
    console.log(inst, "checked", r.checked, "chord placements;", r.bad.length, "problems", JSON.stringify(r.stats));
    r.bad.slice(0,30).forEach(x=>console.log("   ", x));
    ok(r.bad.length===0, inst+" shapes");
    await p.close();
  }
  console.log(pass, "pass,", fail, "fail");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
