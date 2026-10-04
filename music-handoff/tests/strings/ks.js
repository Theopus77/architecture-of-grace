/* the plucked-string renderer, standalone, to check tuning and decay before it goes into the pages */
function seeded(seed){ let x=seed|0||0x2f6b1a3d; return ()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return ((x>>>0)/4294967296)*2-1; }; }
function lossDelay(S, w){ return Math.atan2(S*Math.sin(w), (1-S)+S*Math.cos(w))/w; }
function apDelay(C, w){ const pn=Math.atan2(-Math.sin(w), C+Math.cos(w)), pd=Math.atan2(-C*Math.sin(w), 1+C*Math.cos(w)); let ph=pn-pd; while(ph>0) ph-=2*Math.PI; while(ph<=-2*Math.PI) ph+=2*Math.PI; return -ph/w; }
function apFor(D, w){ let lo=-0.95, hi=0.995; for(let i=0;i<50;i++){ const mid=(lo+hi)/2; if(apDelay(mid,w)>D) lo=mid; else hi=mid; } return (lo+hi)/2; }
/* one string: f0 its pitch, T0 seconds for the fundamental to fall 60 dB, Th the same at 3 kHz (smaller = darker as it rings) */
function loopFor(sr, f0, T0, Th){
  const w0=2*Math.PI*f0/sr, P=sr/f0, wh=2*Math.PI*Math.min(3000, sr*0.4)/sr;
  const a0=Math.pow(0.001, 1/(f0*T0)), ah=Math.pow(0.001, 1/(f0*Math.min(Th,T0)));
  const A=1-Math.cos(wh), B=1-Math.cos(w0), r2=(ah/a0)*(ah/a0);
  let k=(1-r2)/(2*(A-r2*B)); k=Math.max(0, Math.min(0.25, k));
  const S=(1-Math.sqrt(1-4*k))/2, G0=Math.sqrt(1-2*k*B), rho=Math.min(0.999995, a0/G0);
  const tl=lossDelay(S,w0); const N=Math.max(2, Math.floor(P-tl-0.5)), D=P-tl-N, Cc=apFor(D,w0);
  return {N,S,rho,C:Cc,D,tl,P};
}
function runLoop(L, exc, n){
  const dl=new Float32Array(L.N); for(let i=0;i<L.N;i++) dl[i]=exc[i]||0;
  const out=new Float32Array(n); let idx=0, prev=0, ax=0, ay=0; const S=L.S, rho=L.rho, C=L.C, a=1-S;
  for(let i=0;i<n;i++){
    const x=dl[idx]; out[i]=x;
    const l=rho*(a*x+S*prev); prev=x;
    const y=C*l+ax-C*ay; ax=l; ay=y;
    dl[idx]=y; idx++; if(idx===L.N) idx=0;
  }
  return out;
}
module.exports={seeded,loopFor,runLoop,lossDelay,apDelay};
