const {loopFor,runLoop,seeded}=require("./ks.js");
function fft(re, im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let b=n>>1; for(;j&b;b>>=1) j^=b; j^=b; if(i<j){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; } }
  for(let len=2;len<=n;len<<=1){ const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a); for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const ur=re[i+j],ui=im[i+j], vr=re[i+j+len/2]*cr-im[i+j+len/2]*ci, vi=re[i+j+len/2]*ci+im[i+j+len/2]*cr; re[i+j]=ur+vr; im[i+j]=ui+vi; re[i+j+len/2]=ur-vr; im[i+j+len/2]=ui-vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } }
function partialsOf(d, sr, f, a, nh){
  const n=1<<16, re=new Float64Array(n), im=new Float64Array(n);
  for(let i=0;i<n && a+i<d.length;i++){ const w=0.5-0.5*Math.cos(2*Math.PI*i/(n-1)); re[i]=d[a+i]*w; }
  fft(re,im); const mag=k=>Math.log(Math.hypot(re[k],im[k])+1e-20), out=[];
  for(let h=1;h<=nh;h++){ const k0=Math.round(h*f*n/sr); let bk=k0; for(let k=k0-6;k<=k0+6;k++) if(mag(k)>mag(bk)) bk=k;
    const y0=mag(bk-1),y1=mag(bk),y2=mag(bk+1), off=0.5*(y0-y2)/(y0-2*y1+y2); const fh=(bk+off)*sr/n; out.push(1200*Math.log2(fh/(h*f))); }
  return out;
}
const sr=32000; let worst=[0,0,0,0,0];
for(let m=28;m<=88;m+=3){
  const f=440*Math.pow(2,(m-69)/12);
  for(const [T0,Th] of [[6,0.6],[3,0.2],[8,1.5]]){
    const L=loopFor(sr,f,T0,Th), r=seeded(m*7919+1), exc=new Float32Array(L.N); let lp=0; for(let i=0;i<L.N;i++){ lp+=(r()-lp)*0.5; exc[i]=lp; }
    const d=runLoop(L, exc, (1<<16)+sr);
    const p=partialsOf(d,sr,f,Math.floor(0.05*sr),5);
    p.forEach((c,i)=>{ worst[i]=Math.max(worst[i],Math.abs(c)); });
    if(m%12===4) console.log(`m${m} T0=${T0} Th=${Th} N=${L.N} D=${L.D.toFixed(2)} C=${L.C.toFixed(3)} S=${L.S.toFixed(3)} partials (cents): ${p.map(c=>c.toFixed(2)).join(" ")}`);
  }
}
console.log("worst |cents| per harmonic 1..5:", worst.map(x=>x.toFixed(2)).join(" "));
