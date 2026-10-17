/* AOG-LEVEL-EVEN-V1: the Drum Machine's trims for its notes and chords banks (make.js pads). Every instrument, every note
   its recordings reach, soft, middle and hard (a band player: its soft recordings alone and its loud ones alone), one pad
   at a time through the machine's own sound (rooms.js pads). Each recording is trimmed so its notes sit on the
   instrument's own line: its level where pads/level.js sets it (the C chord's C4 E4 G4; a bass's low C), plus half its
   natural slope (never more than 3 dB down or 1.5 dB up). Written into music-pads.html between the AOG-LEVEL-EVEN-V1 table
   markers (EVENPADS, dB a recording). */
const fs=require("fs"), path=require("path");
const R=require("./rooms.js"), C=require("./curve.js");
const PAGE=path.join(R.ROOT, "music-pads.html");
const pmean=a=>10*Math.log10(a.reduce((s,x)=>s+Math.pow(10,x/10),0)/a.length);
const A="/* AOG-LEVEL-EVEN-V1 table start */\n", Z="\n/* AOG-LEVEL-EVEN-V1 table end */";
function readTable(){ const s=fs.readFileSync(PAGE, "utf8"), i=s.indexOf(A), j=s.indexOf(Z); if(i<0||j<0) throw new Error("no table markers in music-pads.html");
  return JSON.parse(s.slice(i+A.length, j).replace(/^const EVENPADS=/, "").replace(/;\s*$/, "")); }
function writeTable(t){ const s=fs.readFileSync(PAGE, "utf8"), i=s.indexOf(A), j=s.indexOf(Z);
  const body="const EVENPADS={"+Object.keys(t).sort().filter(k=>Object.keys(t[k]).length).map(k=>JSON.stringify(k)+":"+JSON.stringify(t[k])).join(",\n")+"};";
  fs.writeFileSync(PAGE, s.slice(0, i+A.length)+body+s.slice(j)); }
module.exports=async function(PASSES, ONLY, pages){
  const h=await R.open(+(process.env.AOG_LEVELS_PORT||9338));
  let T=readTable();
  for(let pass=1; pass<=PASSES; pass++){
    const t0=Date.now(), m=await R.pads(h, {log:1, only:ONLY, pages});
    if(m.errs.length) console.log("page errors:", m.errs.slice(0,5).join(" | "));
    const res=m.res;
    fs.writeFileSync(path.join(require("os").tmpdir(), `aog-levels-pads-pass${pass}.json`), JSON.stringify(res));
    let moved=0;
    for(const id of Object.keys(res)){
      if(id.startsWith("__") || !Array.isArray(res[id]) || !res[id].length) continue;
      const all=res[id], low=/^a:/.test(id), REF=low ? [36] : [60,64,67], cur=Object.assign({}, T[id]||{}), err={};
      const base=all.filter(r=>r.v===0.6), line=C.robustLine(Object.entries(C.means(base)).map(([x,y])=>[+x,y]));
      const N=x=>Math.max(-3, Math.min(1.5, 0.5*(line(x)-line(REF[0]))));
      for(const v of [...new Set(all.map(r=>r.v))]){ const rows=all.filter(r=>r.v===v), st=C.stats(rows);
        if(st) console.log(`pass ${pass} ${id.padEnd(20)} v${v}  dev ${st.dev.db.toFixed(1)} @${st.dev.m}  jump ${st.jump.db.toFixed(1)} @${st.jump.m}  spread ${st.spread.toFixed(1)}`);
        const ref=rows.filter(r=>REF.indexOf(r.m)>=0); if(!ref.length) continue; const L=pmean(ref.map(r=>r.lufs));
        const by={}; rows.forEach(r=>{ if(r.f.indexOf("+")<0) (by[r.f]=by[r.f]||[]).push(r); });
        Object.keys(by).forEach(f=>{ (err[f]=err[f]||[]).push(pmean(by[f].map(r=>r.lufs))-pmean(by[f].map(r=>L+N(r.m)))); });
      }
      const next=Object.assign({}, cur);
      Object.keys(err).forEach(f=>{ const e=err[f].reduce((a,b)=>a+b,0)/err[f].length; next[f]=Math.max(-6, Math.min(6, (cur[f]||0)-e)); });
      /* where the instrument's level is set stays where it was */
      const keepF=[...new Set(all.filter(r=>REF.indexOf(r.m)>=0 && r.f.indexOf("+")<0).map(r=>r.f))];
      if(keepF.length){ const d=keepF.reduce((s,f)=>s+((next[f]||0)-(cur[f]||0)),0)/keepF.length; Object.keys(next).forEach(f=>{ next[f]-=d; }); }
      Object.keys(next).forEach(f=>{ next[f]=Math.round(next[f]*10)/10; moved=Math.max(moved, Math.abs(next[f]-(cur[f]||0))); if(Math.abs(next[f])<0.15) delete next[f]; });
      T[id]=next;
    }
    if(pass===PASSES){ console.log(`pass ${pass}: measured only`); break; }
    writeTable(T); T=readTable();
    console.log(`pass ${pass}: ${((Date.now()-t0)/60000).toFixed(1)} min, largest change ${moved.toFixed(1)} dB; written music-pads.html (EVENPADS)`);
    if(moved<=0.2){ console.log("settled"); break; }
  }
  await R.close(h); process.exit(0);
};
