/* Every note on both necks, through the real voice (sample + playback rate), rendered offline: is it in tune?
   Also how bright each sound is (spectral centroid, first 0.3 s), how long it rings (time to fall 20 dB) and how long
   making all of an instrument's notes takes. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9974);
(async()=>{
  const b=await pw.chromium.launch();
  for(const inst of ["guitar","bass"]){
    const p=await b.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9974/music-${inst}.html`); await p.waitForTimeout(500);
    const r=await p.evaluate(async()=>{
      const out={render:{}, tune:{}, color:{}};
      /* how long it takes to make every note of each sound */
      for(const id of Object.keys(SOUNDS)){ if(SOUNDS[id].kind!=="pluck") continue; delete SETS[id]; const t0=performance.now(); SAMPLE_NOTES.forEach(n=>noteBuf(id,n)); out.render[id]=Math.round(performance.now()-t0); }
      const pitch=(d,sr,f)=>{ const a=Math.floor(0.12*sr), n=Math.floor(0.3*sr), P=sr/f, lo=Math.floor(P*0.94), hi=Math.ceil(P*1.06);
        const ac=l=>{ let s=0; for(let i=a;i<a+n;i++) s+=d[i]*d[i+l]; return s; }; let best=-1e9, bl=lo;
        for(let l=lo;l<=hi;l++){ const v=ac(l); if(v>best){best=v;bl=l;} }
        const y0=ac(bl-1),y1=ac(bl),y2=ac(bl+1), off=0.5*(y0-y2)/(y0-2*y1+y2); return sr/(bl+off); };
      const lo=TUNING[0], hi=TUNING[TUNING.length-1]+MAXF;
      for(const id of Object.keys(SOUNDS)){
        let worst=0, wm=0;
        for(let m=lo; m<=hi; m++){
          const sr=44100, oc=new OfflineAudioContext(1, Math.floor(sr*0.55), sr), bus=oc.createGain(); bus.connect(oc.destination);
          const ch={c:oc, bus:bus, amp:bus, send:oc.createGain()};
          const vc=makeVoice(oc, ch, id, m, 0.74, 0, null); vc.stop(0.5, 0.02);
          const d=(await oc.startRendering()).getChannelData(0), f=mtof(m), pf=pitch(d,sr,f), c=1200*Math.log2(pf/f);
          if(Math.abs(c)>Math.abs(worst)){ worst=c; wm=m; }
        }
        out.tune[id]={worstCents:+worst.toFixed(2), at:wm};
        /* colour: centroid over the first 0.3 s of A (A2 guitar, A1 bass); ring: time to fall 20 dB below the peak */
        const m=GTR?45:33, sr=44100, oc=new OfflineAudioContext(1, sr*4, sr), chn=makeChain(oc); setSound(chn,id); chn.send.gain.value=0; chn.pre.disconnect(); chn.master.disconnect(); chn.pre.connect(oc.destination);
        const vc=makeVoice(oc, chn, id, m, 0.74, 0, null); vc.stop(3.9, 0.02);
        const d=(await oc.startRendering()).getChannelData(0);
        const N=8192, re=new Float64Array(N), im=new Float64Array(N); for(let i=0;i<N;i++) re[i]=d[i+Math.floor(0.02*sr)]*(0.5-0.5*Math.cos(2*Math.PI*i/N));
        /* a plain DFT on the bins we need would be slow; a radix-2 FFT */
        (function fft(re,im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let bb=n>>1; for(;j&bb;bb>>=1) j^=bb; j^=bb; if(i<j){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; } }
          for(let len=2;len<=n;len<<=1){ const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a); for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const ur=re[i+j],ui=im[i+j], vr=re[i+j+len/2]*cr-im[i+j+len/2]*ci, vi=re[i+j+len/2]*ci+im[i+j+len/2]*cr; re[i+j]=ur+vr; im[i+j]=ui+vi; re[i+j+len/2]=ur-vr; im[i+j+len/2]=ui-vi; const tt=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=tt; } } } })(re,im);
        let sw=0, s=0; for(let k=1;k<N/2;k++){ const mg=re[k]*re[k]+im[k]*im[k]; sw+=mg*k*sr/N; s+=mg; }
        const env=[]; const W=Math.floor(0.05*sr); for(let a=0;a+W<d.length;a+=W){ let e=0; for(let i=a;i<a+W;i++) e+=d[i]*d[i]; env.push(10*Math.log10(e/W+1e-12)); }
        const pk=Math.max(...env), pi=env.indexOf(pk); let t20=null; for(let i=pi;i<env.length;i++) if(env[i]<pk-20){ t20=i*0.05; break; }
        let peak=0; for(let i=0;i<d.length;i++) peak=Math.max(peak,Math.abs(d[i]));
        out.color[id]={centroidHz:Math.round(sw/s), fall20dB:t20==null?">3.9":t20.toFixed(2)+"s", firstSample:+d[0].toFixed(4), peak:+peak.toFixed(3)};
      }
      return out;
    });
    console.log("==", inst, errs.length?"ERRORS "+errs.join(" | "):"");
    console.log("  making all notes (ms):", JSON.stringify(r.render));
    for(const id of Object.keys(r.tune)) console.log("  "+id.padEnd(8), "worst tuning", String(r.tune[id].worstCents).padStart(6), "cents at", r.tune[id].at, "| centroid", r.color[id].centroidHz, "Hz | falls 20 dB in", r.color[id].fall20dB, "| peak", r.color[id].peak);
    await p.close();
  }
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
