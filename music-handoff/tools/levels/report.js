/* AOG-LEVEL-EVEN-V1: print how even each sound is, from a measurement file (rooms.js output: {sound: [rows]}).
     node music-handoff/tools/levels/report.js measured.json [velocity]
   One line a sound: its notes' range, the note furthest from the smooth curve, the biggest step between neighbours,
   the single take or string that stands out most, the spread (loudest note − softest) and the curve's slope. */
const fs=require("fs"), C=require("./curve.js");
function lines(res, vel){
  const out=[];
  for(const [id, rows0] of Object.entries(res)){
    if(!Array.isArray(rows0)){ out.push({id, err:JSON.stringify(rows0)}); continue; }
    const rows=vel==null ? rows0 : rows0.filter(r=>Math.abs(r.v-vel)<1e-6);
    const st=C.stats(rows); if(!st) continue;
    out.push({id, st, rows});
  }
  return out;
}
function fmt(x){ return (x>=0?"+":"")+x.toFixed(1); }
function print(res, vel){
  const L=lines(res, vel);
  L.forEach(({id, st, err})=>{
    if(err){ console.log(id.padEnd(14), err); return; }
    const c=st.cell.r||{};
    console.log(`${id.padEnd(14)} ${st.lo}-${st.hi}  dev ${fmt(st.dev.db)} @${st.dev.m}  jump ${fmt(st.jump.db)} @${st.jump.m}  cell ${fmt(st.cell.db)} @${c.m}${c.s!=null?"/s"+c.s:""}${c.f?" "+c.f:""}  spread ${st.spread.toFixed(1)}  slope ${fmt(st.slope)}  at ${st.fit(st.lo).toFixed(1)}`);
  });
  return L;
}
module.exports={lines, print, fmt};
if(require.main===module){
  const res=JSON.parse(fs.readFileSync(process.argv[2], "utf8")), v=process.argv[3]!=null ? +process.argv[3] : null;
  print(res, v);
}
