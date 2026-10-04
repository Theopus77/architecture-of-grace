/* How loud is each sound? The same musical moment, rendered offline through the page's own chain, measured with a
   K-weighting-like filter (BS.1770: a high-pass plus a lift above 1.5 kHz), so the low bass does not count for more than
   it sounds. Compared with the piano's warm electric piano, which the piano's sounds were already leveled to. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9973);
const MEASURE=`
window.__kw = function(buf){
  const sr=buf.sampleRate, out=[];
  function rbjq(type,f,Q,dB){ const w=2*Math.PI*f/sr, cw=Math.cos(w), al=Math.sin(w)/(2*Q), A=Math.pow(10,dB/40); let b0,b1,b2,a0,a1,a2;
    if(type==="hp"){ b0=(1+cw)/2; b1=-(1+cw); b2=(1+cw)/2; a0=1+al; a1=-2*cw; a2=1-al; }
    else { const sq=2*Math.sqrt(A)*al; b0=A*((A+1)+(A-1)*cw+sq); b1=-2*A*((A-1)+(A+1)*cw); b2=A*((A+1)+(A-1)*cw-sq); a0=(A+1)-(A-1)*cw+sq; a1=2*((A-1)-(A+1)*cw); a2=(A+1)-(A-1)*cw-sq; }
    return [b0/a0,b1/a0,b2/a0,a1/a0,a2/a0]; }
  const ks=[rbjq("hp",60,0.5,0), rbjq("hs",1500,0.7,4)];
  const sq=new Float64Array(buf.length);
  for(let ch=0; ch<buf.numberOfChannels; ch++){
    const d=Float32Array.from(buf.getChannelData(ch));
    ks.forEach(k=>{ let x1=0,x2=0,y1=0,y2=0; for(let i=0;i<d.length;i++){ const x=d[i], y=k[0]*x+k[1]*x1+k[2]*x2-k[3]*y1-k[4]*y2; x2=x1;x1=x;y2=y1;y1=y; d[i]=y; } });
    for(let i=0;i<d.length;i++) sq[i]+=d[i]*d[i];
  }
  /* the loudest 400 ms (momentary loudness), what the ear takes as "how loud" for a strum */
  const W=Math.floor(0.4*sr), hop=Math.floor(0.05*sr); let best=0;
  for(let a=0;a+W<=sq.length;a+=hop){ let s=0; for(let i=a;i<a+W;i++) s+=sq[i]; best=Math.max(best, s/W); }
  return 10*Math.log10(best+1e-12);
};`;
(async()=>{
  const b=await pw.chromium.launch();
  const res={};
  /* the piano's reference: a C chord (the pads' voicing, root below), held 2 s, warm electric piano */
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9973/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    res.piano=await p.evaluate(async()=>{ const out={};
      for(const id of ["epwarm","grand"]){
        if(id==="grand"){ await loadSet("grand"); }
        const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        const notes=[60,64,67,48]; notes.forEach((m,j)=>{ const vc=makeVoice(oc,ch,id,m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
        out[id]=__kw(await oc.startRendering()); }
      return out; });
    await p.close(); }
  for(const inst of ["guitar","bass"]){
    const p=await b.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9973/music-${inst}.html`); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    res[inst]=await p.evaluate(async()=>{ const out={};
      for(const id of Object.keys(SOUNDS)){
        const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        const c={off:0,q:"maj"};
        if(GTR){ const shp=shapeFor(c); let k=0; shp.forEach((f,s)=>{ if(f<0) return; const vc=makeVoice(oc,ch,id,TUNING[s]+f,0.74*(1-0.03*k),0.05+k*0.014,s); vc.stop(2.05, vc.tau); k++; }); }
        else { [0,1,2,3].forEach(bt=>{ const m=bassRoot(c), cl=cellFor(m); const vc=makeVoice(oc,ch,id,m,0.8,0.05+bt*0.5,cl.s); vc.stop(0.05+bt*0.5+0.46, vc.tau); }); }
        out[id]=__kw(await oc.startRendering());
      }
      return out; });
    if(errs.length) console.log(inst, "ERRORS", errs.join(" | "));
    await p.close();
  }
  const ref=res.piano.epwarm;
  console.log("piano  epwarm", ref.toFixed(2), " grand", res.piano.grand.toFixed(2));
  for(const inst of ["guitar","bass"]) for(const [id,v] of Object.entries(res[inst])) console.log(inst.padEnd(6), id.padEnd(8), v.toFixed(2), " vs piano", (v-ref).toFixed(2), "dB  → gain x", Math.pow(10,(ref-v)/20).toFixed(3));
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
