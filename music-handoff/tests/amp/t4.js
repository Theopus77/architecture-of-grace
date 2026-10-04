/* loudness of each amp (with its own cabinet) at gains 0..10, from a real chord: K-weighted, loudest 400 ms.
   Prints out (to even the models at gain 5) and lvl (to even the gain knob, three quarters of the way). */
const L=require("./lab.js"), {AMP}=L;
function kw(x, sr){ const k=[["hp",60,0.5,0],["hs",1500,0.7,4]].map(([t,f,q,d])=>new L.core.Biquad().set(t==="hp"?"hp":"hs",f,q,d,sr)); const y=Float64Array.from(x).map(v=>k[1].run(k[0].run(v)));
  const W=Math.floor(0.4*sr), hop=Math.floor(0.05*sr); let best=0; for(let a=0;a+W<=y.length;a+=hop){ let s=0; for(let i=a;i<a+W;i++) s+=y[i]*y[i]; best=Math.max(best,s/W); } return 10*Math.log10(best+1e-12); }
const sr=48000, ctx=L.stubCtx(sr);
const REF={guitar:L.chord("clean",[48,52,55,60,64],sr,2.2), bass:L.chord("finger",[36],sr,2.2)};
const out={};
for(const id of Object.keys(AMP.MODELS)){ const M=AMP.MODELS[id]; if(id==="none") continue; const kind=M.kind;
  const cab=AMP.cabIR(ctx, M.cab), h=cab?cab.getChannelData(0):null, row=[];
  for(const g of [0,2.5,5,7.5,10]){ const st=AMP.normalize({model:id, cab:M.cab, k:{gain:g}}, kind), P=AMP.coreParams(st, kind); P.level=1;
    let y=L.runCore(P, REF[kind], sr); if(h) y=L.conv(y, h); row.push(kw(y, sr)); }
  out[id]=row; console.log(id.padEnd(7), row.map(v=>v.toFixed(1).padStart(6)).join(""));
}
const ref=out.clean[2], refB=out.btube[2];
console.log("\nput in MODELS:");
for(const [id,row] of Object.entries(out)){ const r0=AMP.MODELS[id].kind==="bass"?refB:ref, o=Math.pow(10,(r0-row[2])/20), lvl=row.map(v=>+((v-row[2])*0.75).toFixed(1));
  console.log(id.padEnd(7), "out:"+o.toFixed(3)+", lvl:["+lvl.join(",")+"]"); }
console.log("clean @5 =", ref.toFixed(2), "dB; btube @5 =", refB.toFixed(2), "dB; dry guitar chord", kw(REF.guitar,sr).toFixed(2), "dB; dry bass note", kw(REF.bass,sr).toFixed(2));
