const {loopFor,runLoop,seeded}=require("./ks.js");
/* measure the pitch: zero-padded FFT-free method — autocorrelation peak with parabolic refinement over 0.4 s after 0.1 s */
function pitch(d, sr, fguess){
  const a=Math.floor(0.1*sr), n=Math.floor(0.4*sr), P=sr/fguess;
  let best=-1, bl=0; const lo=Math.floor(P*0.9), hi=Math.ceil(P*1.1);
  const ac=l=>{ let s=0; for(let i=a;i<a+n;i++) s+=d[i]*d[i+l]; return s; };
  for(let l=lo;l<=hi;l++){ const v=ac(l); if(v>best){best=v;bl=l;} }
  const y0=ac(bl-1), y1=ac(bl), y2=ac(bl+1), off=0.5*(y0-y2)/(y0-2*y1+y2);
  return sr/(bl+off);
}
const sr=32000; let worst=0;
for(let m=28;m<=88;m+=3){
  const f=440*Math.pow(2,(m-69)/12);
  for(const [T0,Th] of [[6,0.6],[3,0.2],[8,8]]){
    const L=loopFor(sr,f,T0,Th), r=seeded(m*7919+1), exc=new Float32Array(L.N); for(let i=0;i<L.N;i++) exc[i]=r();
    const d=runLoop(L, exc, Math.floor(sr*0.6));
    const p=pitch(d,sr,f), cents=1200*Math.log2(p/f); worst=Math.max(worst,Math.abs(cents));
    if(Math.abs(cents)>0.5 || m%12===4) console.log(`m${m} f=${f.toFixed(2)} T0=${T0} Th=${Th}  N=${L.N} S=${L.S.toFixed(3)} rho=${L.rho.toFixed(6)} C=${L.C.toFixed(3)}  measured ${p.toFixed(3)}  ${cents.toFixed(2)} cents`);
  }
}
console.log("worst tuning error (cents):", worst.toFixed(3));
