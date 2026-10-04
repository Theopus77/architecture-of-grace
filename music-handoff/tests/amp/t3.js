/* THD of a sine (0.3) and how much the output grows over 30 dB of input (0.03 → 1.0), per model, at gains 0..10 */
const L=require("./lab.js"), {AMP}=L;
const ids=process.argv.slice(2);
const kinds={guitar:["clean","blues","chime","crunch","lead","high","groove"], bass:["btube","bclean","bdrive","bvint"]};
function lvl(P, f, a){ const sr=48000, x=new Float64Array(sr*0.6); for(let i=0;i<x.length;i++) x[i]=a*Math.sin(2*Math.PI*f*i/sr); const y=L.runCore(P,x,sr); return L.db(L.rms(y, Math.floor(0.3*sr))); }
for(const [kind, list] of Object.entries(kinds)) for(const id of list){ if(ids.length && !ids.includes(id)) continue;
  const f=kind==="bass"?(id==="bdrive"?220:55):110, th=[], cp=[];
  for(const g of [0,2.5,5,7.5,10]){ const P=AMP.coreParams(AMP.normalize({model:id, k:{gain:g}}, kind), kind);
    th.push((100*L.thd(P, f, 0.3)).toFixed(1).padStart(5)); cp.push((lvl(P,f,1.0)-lvl(P,f,0.03)).toFixed(1).padStart(5)); }
  console.log(id.padEnd(7), "THD%", th.join(""), " | out span dB (in span 30)", cp.join("")); }
