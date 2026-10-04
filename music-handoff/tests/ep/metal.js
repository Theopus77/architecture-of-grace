/* the heavy metal guitar, measured: how loud its C chord is next to the grand piano (and the other guitars), its power
   chords, how much of it is very high (fizz), and the chug and gallop */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9995);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync("../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9995/music-guitar.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
  const r=await p.evaluate(async()=>{ const out={};
    for(const id of ["clean","crunch","metal"]){
      S.sound=id; VOICINGS.clear();
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      const c={off:0,q:"maj"}, shp=shapeFor(c); let k=0;
      shp.forEach((f,s)=>{ if(f<0) return; const vc=makeVoice(oc,ch,id,TUNING[s]+f,0.74*(1-0.03*k),0.05+k*0.014,s); vc.stop(2.05, vc.tau); k++; });
      const buf=await oc.startRendering(), d=buf.getChannelData(0);
      /* the share of energy above 6 kHz, from a 1 s stretch */
      const N=32768, a0=Math.floor(0.3*44100), re=new Float64Array(N), im=new Float64Array(N);
      for(let i=0;i<N;i++){ const w=0.5-0.5*Math.cos(2*Math.PI*i/N); re[i]=(d[a0+i]||0)*w; }
      (function fft(re,im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; } }
        for(let len=2;len<=n;len<<=1){ const ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang); for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const ur=re[i+j],ui=im[i+j],vr=re[i+j+len/2]*cr-im[i+j+len/2]*ci, vi=re[i+j+len/2]*ci+im[i+j+len/2]*cr; re[i+j]=ur+vr; im[i+j]=ui+vi; re[i+j+len/2]=ur-vr; im[i+j+len/2]=ui-vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } })(re,im);
      let hi=0, all=0, cen=0; for(let i=1;i<N/2;i++){ const f=i*44100/N, m=re[i]*re[i]+im[i]*im[i]; all+=m; cen+=f*m; if(f>6000) hi+=m; }
      out[id]={db:+__kw(buf).toFixed(2), shape:shp.join(","), hiPct:+(100*hi/all).toFixed(2), centroid:Math.round(cen/all)};
    }
    /* power chords for every chord of C major and A minor, with the hand at the nut and up at fret 5 */
    S.sound="metal"; const shapes={};
    for(const fret0 of [1,5]){ S.fret0=fret0; VOICINGS.clear(); shapes["frets "+fret0+"-"+(fret0+NECK.n-1)]=[{off:0,q:"maj"},{off:2,q:"min"},{off:4,q:"min"},{off:5,q:"maj"},{off:7,q:"maj"},{off:9,q:"min"}].map(c=>chordName(c)+"="+shapeFor(c).map(x=>x<0?"x":x).join("")).join(" "); }
    S.fret0=1; VOICINGS.clear();
    /* chug and gallop on C */
    const plans={}; for(const rh of ["chug","gallop"]){ const pl=strumPlan(shapeFor({off:0,q:"maj"}), rh); plans[rh]=pl.length+" string hits at beats "+[...new Set(pl.map(x=>x.t))].join(" ")+", each "+[...new Set(pl.map(x=>x.end-x.t))].join("/")+" beat"; }
    return {out, shapes, plans};
  });
  for(const [k,v] of Object.entries(r.out)) console.log(k.padEnd(7), "C chord", v.db, "dB (grand -8.62)", "shape", v.shape, "| above 6 kHz", v.hiPct+"%", "centroid", v.centroid, "Hz");
  for(const [k,v] of Object.entries(r.shapes)) console.log("power chords,", k+":", v);
  for(const [k,v] of Object.entries(r.plans)) console.log(k+":", v);
  console.log("errors:", errs.join(" | ")||"none");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
