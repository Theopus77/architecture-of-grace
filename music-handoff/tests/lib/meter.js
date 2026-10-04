/* Offline meter for the drum machine: renders hits through the page's own engine (the sp12 worklet and the
   same chain as Send to the turntables: output filter, glue compressor, desk EQ, makeup, limiter) and measures
   peak and K-weighted loudness (BS.1770 filters, no gating). Injected into music-drums.html by the test scripts. */
(function(){
  function kCoefs(fs){
    let f0=1681.974450955533, G=3.999843853973347, Q=0.7071752369554196;
    let K=Math.tan(Math.PI*f0/fs), Vh=Math.pow(10,G/20), Vb=Math.pow(Vh,0.4996667741545416);
    let a0=1+K/Q+K*K;
    const s1={b:[(Vh+Vb*K/Q+K*K)/a0, 2*(K*K-Vh)/a0, (Vh-Vb*K/Q+K*K)/a0], a:[2*(K*K-1)/a0, (1-K/Q+K*K)/a0]};
    f0=38.13547087602444; Q=0.5003270373238773; K=Math.tan(Math.PI*f0/fs);
    a0=1+K/Q+K*K;
    const s2={b:[1,-2,1], a:[2*(K*K-1)/a0, (1-K/Q+K*K)/a0]};
    return [s1,s2];
  }
  function biq(x, c){
    const y=new Float64Array(x.length); let x1=0,x2=0,y1=0,y2=0;
    for(let i=0;i<x.length;i++){ const v=c.b[0]*x[i]+c.b[1]*x1+c.b[2]*x2-c.a[0]*y1-c.a[1]*y2; x2=x1; x1=x[i]; y2=y1; y1=v; y[i]=v; }
    return y;
  }
  function kweight(x, fs){ const c=kCoefs(fs); return biq(biq(x,c[0]),c[1]); }
  function lufs(ms){ return -0.691+10*Math.log10(Math.max(1e-12, ms)); }
  function metrics(x, fs, from){
    from=from||0;
    let pk=0; for(let i=from;i<x.length;i++){ const a=Math.abs(x[i]); if(a>pk) pk=a; }
    const k=kweight(x, fs);
    const cs=new Float64Array(k.length+1); for(let i=0;i<k.length;i++) cs[i+1]=cs[i]+k[i]*k[i];
    const W=Math.round(0.4*fs), hop=Math.round(0.01*fs);
    let mmax=0; for(let s=from; s+W<=k.length; s+=hop){ const m=(cs[s+W]-cs[s])/W; if(m>mmax) mmax=m; }
    const integ=(cs[k.length]-cs[from])/Math.max(1,k.length-from);
    return {peak:+(20*Math.log10(Math.max(1e-9,pk))).toFixed(2), mom:+lufs(mmax).toFixed(2), integ:+lufs(integ).toFixed(2)};
  }
  async function render(bank, hits, dur, era){
    const oldBank=S.bank, oldEra=S.era, oldBit=S.bit;
    S.bank=bank; S.era=era; S.bit=era>=0.5;
    try{
      await ensureKit(bank);
      const sr=44100, off=new OfflineAudioContext(2, Math.ceil(dur*sr), sr);
      const url=URL.createObjectURL(new Blob([WORKLET],{type:"application/javascript"}));
      await off.audioWorklet.addModule(url); URL.revokeObjectURL(url);
      const node=new AudioWorkletNode(off,"sp12",{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2]});
      const f=off.createBiquadFilter(); f.type="lowpass"; f.frequency.value=cutoffHz(S.outF); f.Q.value=0.65;
      const glue=off.createDynamicsCompressor();
      glue.threshold.value=-18; glue.knee.value=12; glue.ratio.value=2.6; glue.attack.value=0.004; glue.release.value=0.22;
      const eq=AOGEq.desk(off);
      const lim=off.createDynamicsCompressor();
      lim.threshold.value=-3; lim.knee.value=0; lim.ratio.value=20; lim.attack.value=0.002; lim.release.value=0.09;
      const g=off.createGain(); g.gain.value=2.1;
      node.connect(f); f.connect(glue); glue.connect(eq.input); eq.output.connect(g); g.connect(lim); lim.connect(off.destination);
      VOICES.forEach(v=>{ const m=kitMsg(v.id); if(m[0].type==="kit") node.port.postMessage(m[0], m[1]);
        if(window.AOGDrumKit && AOGDrumKit.post) AOGDrumKit.post(node.port, bank, v.id, src=>cutPad(src, v.id)); });
      hits.forEach(h=>node.port.postMessage(chanMsg(h.id, h.t, h.v)));
      await new Promise(r=>setTimeout(r,80));
      const buf=await off.startRendering();
      return buf.getChannelData(0);
    } finally { S.bank=oldBank; S.era=oldEra; S.bit=oldBit; }
  }
  async function hit(bank, id, vel, era){
    const x=await render(bank, [{id:id, t:0.05, v:vel}], 1.6, era);
    return metrics(x, 44100, Math.round(0.04*44100));
  }
  /* a standard rock beat: kick on 1 and 3 (and the "and" of 3), snare on 2 and 4, closed hat on every eighth */
  const ROCK={kick:[0,8,10], snare:[4,12], ch:[0,2,4,6,8,10,12,14]};
  async function pattern(bank, era, bars, bpm, pat){
    pat=pat||ROCK; bars=bars||4; bpm=bpm||100;
    const six=60/bpm/4, hits=[];
    for(let b=0;b<bars;b++) Object.keys(pat).forEach(id=>pat[id].forEach(st=>hits.push({id:id, t:0.05+(b*16+st)*six, v:1})));
    const dur=0.05+bars*16*six+0.6;
    const x=await render(bank, hits, dur, era);
    return metrics(x, 44100, Math.round(0.04*44100));
  }
  window.__meter={render:render, metrics:metrics, hit:hit, pattern:pattern, ROCK:ROCK};
})();
