/* the electric pianos, measured: how much each note wobbles in loudness (beating), how far its pitch sits from true,
   and how much of its sound is not a harmonic of the note (clang) */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9987);
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9987/music-piano.html"); await p.waitForTimeout(600);
  const res=await p.evaluate(async()=>{
    const out=[];
    for(const id of ["epwarm","epreed","ep80"]) for(const m of [48,60,72,84]) for(const v of [0.5,0.9]){
      const sr=48000, oc=new OfflineAudioContext(1, sr*2.5, sr), ch=makeChain(oc); setSendLevel(ch,id); setEra(ch,0,0);
      ch.send.gain.value=0; ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      const vc=makeVoice(oc,ch,id,m,v,0.02); vc.stop(2.2, vc.tau);
      const d=(await oc.startRendering()).getChannelData(0);
      /* loudness every 10 ms from 0.1 s to 1.6 s; a straight line through it in dB is the decay; what is left is the wobble */
      const fr=480, env=[]; for(let i=Math.floor(0.12*sr); i+fr<1.6*sr; i+=fr){ let s=0; for(let j=0;j<fr;j++) s+=d[i+j]*d[i+j]; env.push(10*Math.log10(s/fr+1e-12)); }
      const n=env.length, xs=env.map((_,i)=>i), mx=(n-1)/2, my=env.reduce((a,b)=>a+b,0)/n;
      let sxy=0,sxx=0; xs.forEach((x,i)=>{ sxy+=(x-mx)*(env[i]-my); sxx+=(x-mx)*(x-mx); }); const k=sxy/sxx;
      const res=env.map((e,i)=>e-(my+k*(i-mx))); const wob=Math.max(...res)-Math.min(...res);
      /* spectrum of 0.2-0.6 s: energy on the note's harmonics vs between them */
      const N=16384, a0=Math.floor(0.2*sr), f0=440*Math.pow(2,(m-69)/12); let hs=0, nh=0;
      const re=new Float64Array(N), im=new Float64Array(N);
      for(let i=0;i<N;i++){ const w=0.5-0.5*Math.cos(2*Math.PI*i/N); re[i]=d[a0+i]*w; }
      /* a plain DFT only at the bins we need would be slow; use a simple radix-2 FFT */
      (function fft(re,im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; } }
        for(let len=2;len<=n;len<<=1){ const ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang); for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const ur=re[i+j],ui=im[i+j],vr=re[i+j+len/2]*cr-im[i+j+len/2]*ci, vi=re[i+j+len/2]*ci+im[i+j+len/2]*cr; re[i+j]=ur+vr; im[i+j]=ui+vi; re[i+j+len/2]=ur-vr; im[i+j+len/2]=ui-vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } })(re,im);
      let peakBin=0, peakMag=0;
      for(let i=1;i<N/2;i++){ const f=i*sr/N, mag=re[i]*re[i]+im[i]*im[i]; const h=f/f0, near=Math.abs(h-Math.round(h))*f0<f0*0.04 && Math.round(h)>=1; if(near) hs+=mag; else if(f>f0*0.5) nh+=mag; if(Math.abs(f-f0)<f0*0.06 && mag>peakMag){ peakMag=mag; peakBin=i; } }
      const y0=Math.log(re[peakBin-1]**2+im[peakBin-1]**2), y1=Math.log(peakMag), y2=Math.log(re[peakBin+1]**2+im[peakBin+1]**2), off=0.5*(y0-y2)/(y0-2*y1+y2);
      const fpk=(peakBin+off)*sr/N, cents=1200*Math.log2(fpk/f0);
      out.push({id, m, v, wob:+wob.toFixed(1), clang:+(10*Math.log10(hs/(nh+1e-12))).toFixed(1), cents:+cents.toFixed(1)});
    }
    return out;
  });
  console.log("sound   note vel  wobble dB  harmonic/other dB  pitch cents");
  res.forEach(r=>console.log(r.id.padEnd(7), String(r.m).padStart(4), String(r.v).padStart(4), String(r.wob).padStart(9), String(r.clang).padStart(18), String(r.cents).padStart(12)));
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
