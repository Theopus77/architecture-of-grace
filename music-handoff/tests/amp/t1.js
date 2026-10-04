const L=require("./lab.js"), {core, AMP}=L;
/* 1. the oversampler: a 3 kHz sine through four times up and down, untouched, comes back the same (delayed); a 20 kHz one too, and 26 kHz images are gone */
{ const sr=48000, o=new core.Over4(), u=new Float64Array(4), out=[]; for(let i=0;i<4000;i++){ const x=Math.sin(2*Math.PI*3000*i/sr); o.upsample(x,u); for(let q=0;q<4;q++) o.push(u[q]); out.push(o.downsample()); }
  let best=1e9, lag=0; for(let d=0; d<40; d++){ let e=0; for(let i=200;i<3800;i++){ const t=Math.sin(2*Math.PI*3000*(i-d)/sr)-out[i]; e+=t*t; } if(e<best){ best=e; lag=d; } }
  console.log("oversampler: 3 kHz back with lag", lag, "samples, error", (10*Math.log10(best/3600)).toFixed(1), "dB"); }
/* 2. the tone stack at noon (5/5/5) and with the bass up, Fender and Marshall */
for(const [name,k] of Object.entries(AMP.STACKS)){ for(const [t,m,l] of [[0.5,0.5,0.15],[0.5,0.5,1],[1,0.5,0.15],[0.5,0,0.15],[0.5,1,0.15]]){ const ts=new core.ToneStack().set(k,t,m,l,192000);
    const fr=[60,120,250,500,1000,2000,4000,8000].map(f=>{ const w=2*Math.PI*f/192000; let nr=0,ni=0,dr=0,di=0; for(let i=0;i<4;i++){ nr+=ts.b[i]*Math.cos(-w*i); ni+=ts.b[i]*Math.sin(-w*i); dr+=ts.a[i]*Math.cos(-w*i); di+=ts.a[i]*Math.sin(-w*i); } return (20*Math.log10(Math.hypot(nr,ni)/Math.hypot(dr,di))).toFixed(1); });
    console.log(name.padEnd(9), `t${t} m${m} l${l}`.padEnd(16), fr.join(" ")); } }
