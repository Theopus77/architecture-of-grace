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
