/* AOG-LEVEL-EVEN-V1: the Band's trims (make.js band). Each player by itself across its reach, its soft recordings alone,
   its loud ones alone and its short ones (rooms.js band). Each recording is trimmed so its notes sit on the player's own
   line: its level at the middle of its reach (the note bandt/level sets the player by), plus half the player's natural
   slope (never more than 3 dB down or 1.5 dB up). Written to audio/band/manifest.json ("lvl": dB a file), which
   make_band.py builds into the page; this runs it. */
const fs=require("fs"), path=require("path"), cp=require("child_process");
const R=require("./rooms.js"), C=require("./curve.js");
const MANF=path.join(R.ROOT, "audio/band/manifest.json");
const WORLD=["sitar","koto","erhu","panflute","didgeridoo","didgeridoo_rhythm"];   /* AOG-BAND-WORLD-V1: checked by bandt/world.js */
const pmean=a=>10*Math.log10(a.reduce((s,x)=>s+Math.pow(10,x/10),0)/a.length);
function build(){ cp.execSync("python3 _work/music/make_band.py", {cwd:R.ROOT, stdio:"pipe"}); }
module.exports=async function(PASSES, ONLY, pages){
  const h=await R.open(+(process.env.AOG_LEVELS_PORT||9338));
  for(let pass=1; pass<=PASSES; pass++){
    build();
    const t0=Date.now(), m=await R.band(h, {log:1, only:ONLY, pages});
    if(m.errs.length) console.log("page errors:", m.errs.slice(0,5).join(" | "));
    const res=m.res, sets=res.__sets||{}, MAN=JSON.parse(fs.readFileSync(MANF, "utf8"));
    fs.writeFileSync(path.join(require("os").tmpdir(), `aog-levels-band-pass${pass}.json`), JSON.stringify(res));
    let moved=0;
    for(const inst of Object.keys(res)){
      if(inst.startsWith("__") || !Array.isArray(res[inst]) || !sets[inst] || !MAN[inst]) continue;
      if(WORLD.indexOf(inst)>=0) continue;   /* evened when they were made, by their own rule (bandt/world.js) */
      const rows=res[inst], mid=sets[inst].mid, man=MAN[inst], cur=Object.assign({}, man.lvl||{}), curk=Object.assign({}, man.lvk||{}), err={}, errk={};
      const base=rows.filter(r=>r.art==="sus" && r.v===0.6), line=C.robustLine(Object.entries(C.means(base)).map(([m,y])=>[+m,y]));
      const N=x=>Math.max(-3, Math.min(1.5, 0.5*(line(x)-line(mid))));
      const groups=[...new Set(rows.map(r=>r.art+"|"+r.v))];
      for(const g of groups){ const rr=rows.filter(r=>r.art+"|"+r.v===g);
        const st=C.stats(rr); if(st) console.log(`pass ${pass} ${inst.padEnd(16)} ${g.padEnd(9)} dev ${st.dev.db.toFixed(1)} @${st.dev.m}  jump ${st.jump.db.toFixed(1)} @${st.jump.m}  spread ${st.spread.toFixed(1)}`);
        const near=rr.filter(r=>Math.abs(r.m-mid)<=2); if(!near.length) continue;
        const L=pmean(near.map(r=>r.lufs));
        /* the blend (a medium touch: both recordings at once): each note's own trim there, n+"b", worth sin(π·0.6) of
           itself at this strength */
        if(g.startsWith("sus|0.6")){ const byn={}; rr.forEach(r=>{ const n=parseInt(r.f); if(isFinite(n)) (byn[n]=byn[n]||[]).push(r); });
          Object.keys(byn).forEach(n=>{ const e=pmean(byn[n].map(r=>r.lufs))-pmean(byn[n].map(r=>L+N(r.m))); (err[n+"b"]=err[n+"b"]||[]).push(e/Math.sin(Math.PI*0.6)); });
          continue; }
        const by={}; rr.forEach(r=>{ if(r.f && r.f.slice(-1)!=="*") (by[r.f]=by[r.f]||[]).push(r); });
        /* each recording: how far off its notes are, and (where they spread over three semitones or more) how that changes as
           it is played above or below its own note: a straight line through (shift, error) */
        Object.keys(by).forEach(f=>{ const n=parseInt(f), pts=by[f].map(r=>[r.m-n, r.lufs-(L+N(r.m))]), xs=pts.map(q=>q[0]);
          if(pts.length>=4 && Math.max(...xs)-Math.min(...xs)>=3){ const ln=C.line(pts); (err[f]=err[f]||[]).push(ln(0)); (errk[f]=errk[f]||[]).push(ln(1)-ln(0)); }
          else (err[f]=err[f]||[]).push(pmean(by[f].map(r=>r.lufs))-pmean(by[f].map(r=>L+N(r.m)))); });
      }
      const next=Object.assign({}, cur);
      Object.keys(err).forEach(f=>{ const e=err[f].reduce((a,b)=>a+b,0)/err[f].length; next[f]=Math.max(-6, Math.min(6, Math.round(((cur[f]||0)-e)*10)/10)); });
      /* the middle note's recordings keep their level (bandt/level sets the player there) */
      /* (the recordings by themselves, and the blends, each kept so) */
      for(const blend of [false, true]){ const mine=f=>(f.slice(-1)==="b")===blend, keep=Object.keys(next).filter(f=>mine(f) && Math.abs(parseInt(f)-mid)<=1);
        if(keep.length){ const d=keep.reduce((s,f)=>s+(next[f]-(cur[f]||0)),0)/keep.length; Object.keys(next).forEach(f=>{ if(mine(f)) next[f]=Math.round((next[f]-d)*10)/10; }); } }
      Object.keys(next).forEach(f=>{ moved=Math.max(moved, Math.abs(next[f]-(cur[f]||0))); if(next[f]===0) delete next[f]; });
      if(Object.keys(next).length) man.lvl=next; else delete man.lvl;
      const nextk=Object.assign({}, curk);
      Object.keys(errk).forEach(f=>{ const e=errk[f].reduce((a,b)=>a+b,0)/errk[f].length; nextk[f]=Math.max(-1, Math.min(1, Math.round(((curk[f]||0)-e)*100)/100)); if(nextk[f]===0) delete nextk[f]; });
      if(Object.keys(nextk).length) man.lvk=nextk; else delete man.lvk;
    }
    if(pass===PASSES){ console.log(`pass ${pass}: measured only`); break; }
    fs.writeFileSync(MANF, JSON.stringify(MAN));
    console.log(`pass ${pass}: ${((Date.now()-t0)/60000).toFixed(1)} min, largest change ${moved.toFixed(1)} dB; written audio/band/manifest.json`);
    if(moved<=0.2){ console.log("settled"); break; }
  }
  build();
  await R.close(h); process.exit(0);
};
