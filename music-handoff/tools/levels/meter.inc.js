/* AOG-LEVEL-EVEN-V1: injected into a room page by music-handoff/tools/levels/rooms.js. One note's loudness, measured as
   ITU-R BS.1770 does (the K filter: a high shelf near 1.7 kHz and a high pass near 38 Hz, at the buffer's own rate; the
   channels' mean squares added; −0.691 dB), over the note's first 400 ms from its onset, ungated; and its peak.
   window.__lv.kw(buf, t0[, dur]) → {lufs, peak} (peak in dB of full scale). */
(function(){
  function kCoefs(fs){
    let f0=1681.974450955533, G=3.999843853973347, Q=0.7071752369554196;
    let K=Math.tan(Math.PI*f0/fs), Vh=Math.pow(10,G/20), Vb=Math.pow(Vh,0.4996667741545416);
    let a0=1+K/Q+K*K;
    const s1={b:[(Vh+Vb*K/Q+K*K)/a0, 2*(K*K-Vh)/a0, (Vh-Vb*K/Q+K*K)/a0], a:[2*(K*K-1)/a0, (1-K/Q+K*K)/a0]};
    f0=38.13547087602444; Q=0.5003270373238773; K=Math.tan(Math.PI*f0/fs); a0=1+K/Q+K*K;
    const s2={b:[1,-2,1], a:[2*(K*K-1)/a0, (1-K/Q+K*K)/a0]};
    return [s1,s2];
  }
  function biq(x, c){ let x1=0,x2=0,y1=0,y2=0; for(let i=0;i<x.length;i++){ const v=c.b[0]*x[i]+c.b[1]*x1+c.b[2]*x2-c.a[0]*y1-c.a[1]*y2; x2=x1; x1=x[i]; y2=y1; y1=v; x[i]=v; } }
  /* within: the window may start anywhere from t0 to t0+within (every 25 ms), and the loudest is taken: a held note that
     swells (a bow, a breath, a voice) is as loud as its full tone, not its first moment; a struck one's is its first */
  function kw(buf, t0, dur, within){
    const sr=buf.sampleRate, c=kCoefs(sr), W=Math.floor((dur||0.4)*sr), a=Math.max(0, Math.floor(t0*sr)), end=Math.min(buf.length, a+W+Math.floor((within||0)*sr));
    let pk=0; const sq=new Float64Array(end+1);
    for(let ch=0; ch<buf.numberOfChannels; ch++){
      const raw=buf.getChannelData(ch); for(let i=0;i<raw.length;i++){ const v=raw[i]<0?-raw[i]:raw[i]; if(v>pk) pk=v; }
      const d=Float64Array.from(raw.subarray(0, end)); biq(d, c[0]); biq(d, c[1]);
      for(let i=0;i<end;i++) sq[i+1]+=d[i]*d[i];
    }
    for(let i=1;i<=end;i++) sq[i]+=sq[i-1];
    let best=0; const hop=Math.floor(0.025*sr);
    for(let s=a; s+W<=end || s===a; s+=hop){ const e=Math.min(end, s+W), m=(sq[e]-sq[s])/Math.max(1, e-s); if(m>best) best=m; if(!within) break; }
    return {lufs:+(-0.691+10*Math.log10(best+1e-12)).toFixed(2), peak:+(20*Math.log10(pk+1e-9)).toFixed(2)};
  }
  /* several renders at once (each its own OfflineAudioContext), in order of the jobs */
  async function pool(jobs, n){ const out=new Array(jobs.length); let i=0;
    const lane=async()=>{ while(i<jobs.length){ const k=i++; try{ out[k]=await jobs[k](); }catch(e){ out[k]={err:String(e&&e.message||e)}; } } };
    await Promise.all(Array.from({length:n||4}, lane)); return out; }
  window.__lv={kw:kw, pool:pool};
})();
