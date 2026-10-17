/* AOG-LEVEL-EVEN-V1: the Piano's trims (make.js piano). Every key C1–C7, each strength layer, through the piano's chain
   (rooms.js piano). Each recording is trimmed so its notes sit on the sound's own line: its level at middle C's chord (C3,
   C4, E4, G4: where the room's level is set, ep/allevel), plus half the sound's natural slope across the keyboard (never
   more than 3 dB down to the top or 1.5 dB up). Each layer keeps its own level at that chord, so soft stays soft. Written
   into music-piano.html between the AOG-LEVEL-EVEN-V1 table markers (EVENP). */
const fs=require("fs"), path=require("path");
const R=require("./rooms.js"), C=require("./curve.js");
const PAGE=path.join(R.ROOT, "music-piano.html"), REF=[48,60,64,67], MAX=47;
/* tenths of a dB, kept as letters of 0.2 dB each ("O" = 0, ±9.4 dB) */
const dec=s=>Array.from(s, ch=>2*(ch.charCodeAt(0)-79));
const enc=a=>a.map(x=>String.fromCharCode(79+Math.max(-MAX, Math.min(MAX, Math.round(x/2))))).join("");
const pmean=a=>10*Math.log10(a.reduce((s,x)=>s+Math.pow(10,x/10),0)/a.length);
const A="/* AOG-LEVEL-EVEN-V1 table start */\n", Z="\n/* AOG-LEVEL-EVEN-V1 table end */";
function readTable(){ const s=fs.readFileSync(PAGE, "utf8"), i=s.indexOf(A), j=s.indexOf(Z); if(i<0||j<0) throw new Error("no table markers in music-piano.html");
  return JSON.parse(s.slice(i+A.length, j).replace(/^const EVENP=/, "").replace(/;\s*$/, "")); }
function writeTable(t){ const s=fs.readFileSync(PAGE, "utf8"), i=s.indexOf(A), j=s.indexOf(Z);
  const keys=Object.keys(t).sort(), body="const EVENP={"+keys.map(k=>JSON.stringify(k)+":"+JSON.stringify(t[k])).join(",\n")+"};";
  fs.writeFileSync(PAGE, s.slice(0, i+A.length)+body+s.slice(j)); }
/* the line a sound's notes should sit on, for one layer: its level at the C chord plus half its own slope */
function target(rows, all){
  const mid=all.filter(r=>r.lay==="m"), base=mid.length ? mid : all, line=C.robustLine(Object.entries(C.means(base)).map(([m,y])=>[+m,y]));
  const ref=rows.filter(r=>REF.indexOf(r.m)>=0), L=pmean(ref.map(r=>r.lufs));
  return m=>L+Math.max(-3, Math.min(1.5, 0.5*(line(m)-line(60))));
}
module.exports=async function(PASSES, ONLY, pages){
  const h=await R.open(+(process.env.AOG_LEVELS_PORT||9338));
  let T=readTable();
  for(let pass=1; pass<=PASSES; pass++){
    const t0=Date.now(), m=await R.piano(h, {log:1, only:ONLY, pages});
    if(m.errs.length) console.log("page errors:", m.errs.slice(0,5).join(" | "));
    const res=m.res, sets=res.__sets||{};
    fs.writeFileSync(path.join(require("os").tmpdir(), `aog-levels-piano-pass${pass}.json`), JSON.stringify(res));
    let moved=0;
    for(const id of Object.keys(res)){
      if(id.startsWith("__") || !Array.isArray(res[id]) || !sets[id]) continue;
      const all=res[id].filter(r=>r.f), {notes, layers}=sets[id];
      const cur={}, curk={}; layers.forEach(l=>{ cur[l]=(T[id] && T[id][l] && T[id][l].length===notes.length) ? dec(T[id][l]) : new Array(notes.length).fill(0);
        curk[l]=(T[id] && T[id][l+"k"] && T[id][l+"k"].length===notes.length) ? Array.from(T[id][l+"k"], ch=>ch.charCodeAt(0)-79) : new Array(notes.length).fill(0); });
      const next={}, nextk={}; layers.forEach(l=>{ next[l]=cur[l].slice(); nextk[l]=curk[l].slice(); });
      const vs=[...new Set(all.map(r=>r.v))];
      for(const v of vs){ const rows=all.filter(r=>r.v===v); if(!rows.some(r=>REF.indexOf(r.m)>=0)) continue;
        const tg=target(rows, all), st=C.stats(rows);
        console.log(`pass ${pass} ${id.padEnd(10)} v${v}  dev ${st.dev.db.toFixed(1)} @${st.dev.m}  jump ${st.jump.db.toFixed(1)} @${st.jump.m}  spread ${st.spread.toFixed(1)}`);
        const by={}; rows.forEach(r=>{ (by[r.f]=by[r.f]||[]).push(r); });
        for(const f of Object.keys(by)){ const rr=by[f], n=rr[0].n, l=rr[0].lay, i=notes.indexOf(n); if(i<0 || !next[l]) continue;
          /* how far off its notes are, and how that changes as it is played higher or lower than recorded: a straight line
             through (shift, error), where its notes spread over three semitones or more; else only its level */
          const pts=rr.map(r=>[r.m-n, r.lufs-tg(r.m)]), xs=new Set(pts.map(q=>q[0]));
          if(pts.length>=4 && Math.max(...xs)-Math.min(...xs)>=3){ const ln=C.line(pts), a0=ln(0), b0=ln(1)-a0; next[l][i]=cur[l][i]-10*a0; nextk[l][i]=Math.max(-47, Math.min(47, curk[l][i]-b0/0.02)); }
          else next[l][i]=cur[l][i]-10*(pmean(rr.map(r=>r.lufs))-pmean(rr.map(r=>tg(r.m)))); }
        /* the chord's recordings keep their level on average (the room's level stays where it is) */
        const refF=[...new Set(rows.filter(r=>REF.indexOf(r.m)>=0).map(r=>r.f))], lay=rows[0].lay;
        if(next[lay]){ const d=refF.reduce((s,f)=>{ const i=notes.indexOf(+f.slice(0,-1)); return s+(next[lay][i]-cur[lay][i]); },0)/Math.max(1,refF.length);
          next[lay]=next[lay].map((x,i)=>x-d); }
      }
      layers.forEach(l=>{ moved=Math.max(moved, ...next[l].map((x,i)=>Math.abs(Math.round(x)-cur[l][i]))); });
      T[id]=Object.fromEntries(layers.flatMap(l=>[[l, enc(next[l])], [l+"k", nextk[l].map(x=>String.fromCharCode(79+Math.round(x))).join("")]]));
    }
    if(pass===PASSES){ console.log(`pass ${pass}: measured only`); break; }
    writeTable(T); T=readTable();
    console.log(`pass ${pass}: ${((Date.now()-t0)/60000).toFixed(1)} min, largest change ${(moved/10).toFixed(1)} dB; written music-piano.html (EVENP)`);
    if(moved<=2){ console.log("settled"); break; }
  }
  await R.close(h); process.exit(0);
};
