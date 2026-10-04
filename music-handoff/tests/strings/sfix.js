/* AOG-STRINGS-V2 acceptance, through the page's own chain (voices → rig → room off, before the compressor), offline:
   1 pitch of the open E (guitar E2, bass E1), at 44.1 and 48 kHz: in tune and steady (YIN every 50 ms)
   2 the pick is a click at the start, not a buzz through the note
   3 steel against nylon (the C pad's strum), 4 fingers against pick (the C pad's low note)
   5 the synth's low G: no resonant peak standing out; a thump at the start
   6 a held pad draws its shape; on the metal sounds the power chord (no third), wherever the hand is, on a narrow phone too
   Run: node strings/sfix.js (AOG_ROOT=<a worktree>/aog-deploy to test another copy)   (OLD=1 also prints the pages at 63d8440a for comparison) */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), srv=require("../srv.js")(9916), OLDDIR=__dirname+"/oldpages/";
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const LIB=`
window.__A={
  bq(type,f,Q,sr){ const w=2*Math.PI*f/sr, cw=Math.cos(w), al=Math.sin(w)/(2*Q); let b0,b1,b2,a0=1+al,a1=-2*cw,a2=1-al;
    if(type==="hp"){ b0=(1+cw)/2; b1=-(1+cw); b2=(1+cw)/2; } else { b0=(1-cw)/2; b1=1-cw; b2=(1-cw)/2; } return [b0/a0,b1/a0,b2/a0,a1/a0,a2/a0]; },
  run(d,k){ const y=new Float64Array(d.length); let x1=0,x2=0,y1=0,y2=0; for(let i=0;i<d.length;i++){ const x=d[i], v=k[0]*x+k[1]*x1+k[2]*x2-k[3]*y1-k[4]*y2; x2=x1;x1=x;y2=y1;y1=v; y[i]=v; } return y; },
  rms(d,sr,t0,t1){ const a=Math.floor(t0*sr), b=Math.min(d.length,Math.floor(t1*sr)); let s=0; for(let i=a;i<b;i++) s+=d[i]*d[i]; return Math.sqrt(s/Math.max(1,b-a)); },
  db(x){ return 20*Math.log10(x+1e-12); },
  hf(d,sr,t0,t1,f){ const a=Math.floor(t0*sr), b=Math.floor(t1*sr), y=this.run(d.slice(a,b), this.bq("hp",f,0.7071,sr)); let s=0; for(let i=0;i<y.length;i++) s+=y[i]*y[i]; return 10*Math.log10(s/y.length+1e-20); },
  fft(re,im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let b=n>>1; for(;j&b;b>>=1) j^=b; j^=b; if(i<j){ let t=re[i]; re[i]=re[j]; re[j]=t; t=im[i]; im[i]=im[j]; im[j]=t; } }
    for(let len=2;len<=n;len<<=1){ const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a); for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const p=i+j,q=p+len/2, vr=re[q]*cr-im[q]*ci, vi=re[q]*ci+im[q]*cr; re[q]=re[p]-vr; im[q]=im[p]-vi; re[p]+=vr; im[p]+=vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } },
  spec(d,sr,t0,t1,pad){ const a=Math.floor(t0*sr), L=Math.floor((t1-t0)*sr), N=1<<Math.ceil(Math.log2(L*(pad||1))), re=new Float64Array(N), im=new Float64Array(N);
    for(let i=0;i<L;i++) re[i]=(d[a+i]||0)*(0.5-0.5*Math.cos(2*Math.PI*(i+0.5)/L)); this.fft(re,im); const p=new Float64Array(N/2); for(let k=0;k<N/2;k++) p[k]=re[k]*re[k]+im[k]*im[k]; return {p, N}; },
  centroid(d,sr,t0,t1){ const {p,N}=this.spec(d,sr,t0,t1); let s=0,w=0; for(let k=1;k<p.length;k++){ s+=p[k]; w+=p[k]*k*sr/N; } return w/s; },
  harm(d,sr,t0,t1,f0,nh){ const {p,N}=this.spec(d,sr,t0,t1,4), out=[]; for(let h=1;h<=nh;h++){ const k0=Math.round(h*f0*N/sr), r=Math.max(2,Math.round(0.3*f0*N/sr)); let s=0; for(let k=k0-r;k<=k0+r;k++) s+=p[k]||0; out.push(10*Math.log10(s+1e-30)); } return out; },
  yin(d,sr,t,f0){ const P0=sr/f0, lo=Math.floor(P0/1.08), hi=Math.ceil(P0*1.08), W=Math.ceil(P0*3), a=Math.floor(t*sr); if(a+W+hi+2>d.length) return NaN;
    const D=new Float64Array(hi+2); for(let tau=1;tau<=hi+1;tau++){ let s=0; for(let j=0;j<W;j++){ const e=d[a+j]-d[a+j+tau]; s+=e*e; } D[tau]=s; }
    const C=new Float64Array(hi+2); let run=0; C[0]=1; for(let tau=1;tau<=hi+1;tau++){ run+=D[tau]; C[tau]=D[tau]*tau/(run||1e-20); }
    let best=lo; for(let tau=lo;tau<=hi;tau++) if(C[tau]<C[best]) best=tau; const y0=C[best-1], y1=C[best], y2=C[best+1], den=y0-2*y1+y2, off=den>0?0.5*(y0-y2)/den:0; return sr/(best+off); }
};
/* the page's chain, dry (no room), before the compressor; events [{m,v,t,s}]. AOG-STRINGS-REAL-V1: the string made on the
   page unless real is true (then the sound's recordings, loaded first) */
window.__render=async function(id, events, dur, sr, dry, real){
  if(typeof REAL!=="undefined"){ REAL.on=!!real; if(real){ await loadSound(id); if(!soundReady(id)) throw new Error(id+": the recordings did not load"); } }
  S.sound=id; VOICINGS.clear();
  const oc=new OfflineAudioContext(2, Math.ceil(sr*dur), sr); await AOGAmp.load(oc); const ch=makeChain(oc);
  ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0); ch.send.gain.value=0; ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
  if(dry){ ch.amp.disconnect(); ch.amp.connect(ch.post); }
  let rec=0; events.forEach(e=>{ const vc=makeVoice(oc,ch,id,e.m,e.v,e.t,e.s==null?null:e.s); if(vc){ vc.stop(dur-0.06, vc.tau); if(vc.rec) rec++; } });
  if(!!real!==(rec>0)) throw new Error(id+(real?": the recordings did not play":": a recording played where the made string should"));
  if(typeof REAL!=="undefined") REAL.on=true;
  const b=await oc.startRendering(), L=b.getChannelData(0), R=b.getChannelData(1), d=new Float32Array(L.length); for(let i=0;i<d.length;i++) d[i]=(L[i]+R[i])/2; return d;
};
window.__padStrum=function(c){ const ev=[]; let k=0; shapeFor(c).forEach((f,s)=>{ if(f<0) return; ev.push({m:TUNING[s]+f, v:0.74*(1-0.03*k), t:0.05+k*0.014, s:s}); k++; }); return ev; };`;
async function open(b, inst, ver, dev){
  const c=await b.newContext(dev||{viewport:{width:1280,height:900}}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  if(ver==="old") await p.route(new RegExp("/music-"+inst+"\\.html$"), r=>r.fulfill({status:200, contentType:"text/html", body:fs.readFileSync(OLDDIR+"music-"+inst+".html","utf8")}));
  await p.goto(`http://localhost:9916/music-${inst}.html`); await p.waitForTimeout(700); await p.addScriptTag({content:LIB});
  return {c, p, errs};
}
(async()=>{
  const b=await pw.chromium.launch(); const vers=process.env.OLD?["old","new"]:["new"]; const R={};
  for(const ver of vers){
    /* ── the guitar ── */
    { const {c,p,errs}=await open(b, "guitar", ver);
      R[ver+"g"]=await p.evaluate(async()=>{ const A=__A, out={};
        /* 1 pitch: the open E through steel (no amp) and clean (its amp), at 44.1 and 48 kHz */
        out.pitch={};
        for(const id of ["steel","clean","metal"]) for(const sr of [44100,48000]){ const d=await __render(id,[{m:40,v:0.74,t:0.05,s:0}],1.7,sr), f0=mtof(40), c=[];
          for(let t=0.15;t<=1.5;t+=0.05){ const f=A.yin(d,sr,t,f0); if(f===f) c.push(1200*Math.log2(f/f0)); }
          out.pitch[id+"@"+sr]={mean:c.reduce((a,b)=>a+b,0)/c.length, min:Math.min(...c), max:Math.max(...c), n:c.length}; }
        /* 2 the click: one A2 on steel, nylon, clean */
        out.note={};
        for(const id of ["steel","nylon","clean"]){ const sr=44100, d=await __render(id,[{m:45,v:0.74,t:0,s:1}],1.2,sr), lv=(a,b)=>A.db(A.rms(d,sr,a,b));
          out.note[id]={hfStart:A.hf(d,sr,0,0.03,4000)-lv(0.01,0.26), hfTail:A.hf(d,sr,0.15,0.5,4000)-lv(0.15,0.5), drop:A.hf(d,sr,0,0.03,4000)-A.hf(d,sr,0.15,0.5,4000),
            c40:A.centroid(d,sr,0,0.04), cTail:A.centroid(d,sr,0.04,0.5)}; }
        /* 3 the C pad's strum, steel against nylon (and the twelve-string, clean, jazz) */
        out.chord={};
        for(const id of ["steel","nylon","twelve","clean","jazz"]){ const sr=44100, d=await __render(id, __padStrum({off:0,q:"maj"}), 1.2, sr), lv=(a,b)=>A.db(A.rms(d,sr,a,b));
          out.chord[id]={c05:A.centroid(d,sr,0.05,0.55), c70:A.centroid(d,sr,0.05,0.12), hf2k:A.hf(d,sr,0.05,0.12,2000)-lv(0.05,0.55), atk:lv(0.05,0.12)-lv(0.12,0.55)}; }
        /* AOG-STRINGS-REAL-V1: the same, on the recordings: the open E of a recorded string (it drifts a few cents as it rings,
           as a real string does), and the recorded steel string against the recorded nylon one */
        if(typeof REAL!=="undefined"){
          out.rpitch={};
          for(const id of ["steel","nylon","clean","lead"]) for(const sr of [44100,48000]){ const d=await __render(id,[{m:40,v:0.74,t:0.05,s:0}],1.7,sr,false,true), f0=mtof(40), c=[];
            for(let t=0.15;t<=1.5;t+=0.05){ const f=A.yin(d,sr,t,f0); if(f===f) c.push(1200*Math.log2(f/f0)); }
            out.rpitch[id+"@"+sr]={mean:c.reduce((a,b)=>a+b,0)/c.length, min:Math.min(...c), max:Math.max(...c), n:c.length}; }
          out.rchord={};
          for(const id of ["steel","nylon"]){ const sr=44100, d=await __render(id, __padStrum({off:0,q:"maj"}), 1.2, sr, false, true), lv=(a,b)=>A.db(A.rms(d,sr,a,b));
            out.rchord[id]={c05:A.centroid(d,sr,0.05,0.55), hf2k:A.hf(d,sr,0.05,0.55,2000)-lv(0.05,0.55)}; }
        }
        return out; });
      ok(!errs.length, `guitar (${ver}): no page errors ${errs.join(" | ")}`);
      /* 6 held pads (new only) */
      if(ver==="new"){
        const shp=async(dev)=>{ const cc=await b.newContext(dev); const pg=await cc.newPage(); const er=[]; pg.on("pageerror",e=>er.push(e.message)); await pg.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
          await pg.goto("http://localhost:9916/music-guitar.html"); await pg.waitForTimeout(800); return {cc, pg, er}; };
        const dots=(pg)=>pg.evaluate(()=>[...document.querySelectorAll("#neck .dot.fit")].map(g=>g.getAttribute("data-c")).sort().join(" "));
        const notesOf=(cells)=>cells.split(" ").filter(Boolean).map(x=>{ const [s,f]=x.split(":").map(Number); return [40,45,50,55,59,64][s]+f; });
        for(const dev of ["iPhone 13", "narrow"]){
          const {cc, pg, er}=await shp(dev==="narrow" ? {viewport:{width:320,height:640}, isMobile:true, hasTouch:true, deviceScaleFactor:2} : pw.devices[dev]);
          const n=await pg.evaluate(()=>NECK.n);
          /* steel: the C pad shows the C shape while it is held, × on the string it skips */
          await pg.selectOption("#soundSel","steel"); await pg.evaluate(()=>{ S.fret0=1; buildNeck(); });
          await pg.evaluate(()=>padDown(0,0.74)); await pg.waitForTimeout(80);
          const want=await pg.evaluate(()=>shapeFor({off:0,q:"maj"}).map((f,s)=>f<0?null:s+":"+f).filter(Boolean).sort().join(" "));
          const got=await dots(pg), xs=await pg.evaluate(()=>[...document.querySelectorAll("#neck .nk-x")].filter(x=>x.style.display!=="none").map(x=>x.getAttribute("data-s")).join(","));
          ok(got===want && notesOf(got).some(m=>m%12===4), `${dev} (${n} frets): steel, the held C pad shows the C shape ${got} (× on string ${xs})`);
          await pg.evaluate(()=>padUp(0));
          /* switch to metal with C still in the hand: the neck changes to the power chord without another tap */
          await pg.selectOption("#soundSel","metal"); await pg.waitForTimeout(80);
          const pw1=await dots(pg), n1=notesOf(pw1);
          ok(n1.length>=2 && n1.every(m=>m%12===0||m%12===7) && n1.some(m=>m%12===7), `${dev}: picking Heavy metal redraws C as a power chord at once: ${pw1} (notes ${n1.join(",")})`);
          /* metal, wherever the hand is: every pad, every window, no third drawn and none played */
          const r=await pg.evaluate(async()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,id,m,v,when,s){ if(cx===ac) window.__v.push(m); return mv.apply(this,arguments); };
            const bad=[]; let checked=0;
            for(let f0=1; f0<=MAXF-NECK.n+1; f0++){ S.fret0=f0; buildNeck();
              for(let i=0;i<6;i++){ const c=pads()[i], pcs=chordPcs(c); window.__v=[]; muteAll(); padDown(i,0.74);
                const cells=[...document.querySelectorAll("#neck .dot.fit")].map(g=>g.getAttribute("data-c").split(":").map(Number)), drawn=cells.map(([s,f])=>TUNING[s]+f);
                checked++; if(!drawn.length || drawn.some(m=>m%12===pcs[1]) || window.__v.some(m=>m%12===pcs[1]) || window.__v.length===0) bad.push(f0+":"+i+" drawn "+drawn.join(",")+" played "+window.__v.join(","));
                padUp(i); } }
            window.makeVoice=mv; S.fret0=1; buildNeck(); return {checked, bad}; });
          ok(r.bad.length===0, `${dev}: metal, ${r.checked} pad × window placements: no third drawn or played ${r.bad.slice(0,3).join(" | ")}`);
          ok(!er.length, `${dev}: no page errors ${er.join(" | ")}`);
          await cc.close();
        }
        /* while the pattern plays, a held pad shows its own shape; let go and the pattern's chord comes back */
        { const {cc, pg, er}=await shp({viewport:{width:1280,height:900}});
          await pg.selectOption("#soundSel","steel"); await pg.selectOption("#progSel","pop"); await pg.click("#playBtn"); await pg.waitForTimeout(400);
          await pg.evaluate(()=>padDown(3,0.74)); await pg.waitForTimeout(150);
          /* a place lit orange (the pattern sounding there) is not also pale: the shape is the pale dots and the orange ones */
          await pg.evaluate(()=>{ window.__look=(c)=>{ const want=shapeFor(c).map((f,s)=>f<0?null:s+":"+f).filter(Boolean), fit=[...document.querySelectorAll("#neck .dot.fit")].map(g=>g.getAttribute("data-c")),
            lit=[...document.querySelectorAll("#neck .dot.fit, #neck .dot.now")].map(g=>g.getAttribute("data-c")); return {ok:lit.length>0 && fit.every(x=>want.includes(x)) && want.every(x=>lit.includes(x)), want:want.join(" "), fit:fit.join(" "), lit:lit.join(" ")}; }; });
          const during=await pg.evaluate(()=>__look(pads()[3]));
          await pg.evaluate(()=>{ padUp(3); litNeck(); }); await pg.waitForTimeout(100);
          const after=await pg.evaluate(()=>__look(curChord()));
          await pg.click("#playBtn");
          ok(during.ok && after.ok, `while Pop plays, the held F pad shows F (${during.want}; pale ${during.fit}); let go, the pattern's chord comes back (${after.want}; lit ${after.lit})`);
          ok(!er.length, "playing: no page errors "+er.join(" | ")); await cc.close(); }
      }
      await c.close(); }
    /* ── the bass ── */
    { const {c,p,errs}=await open(b, "bass", ver);
      R[ver+"b"]=await p.evaluate(async()=>{ const A=__A, out={pitch:{}, note:{}};
        for(const id of ["finger","pick","upright"]) for(const sr of [44100,48000]){ const d=await __render(id,[{m:28,v:0.8,t:0.05,s:0}],1.7,sr), f0=mtof(28), c=[];
          for(let t=0.15;t<=1.5;t+=0.05){ const f=A.yin(d,sr,t,f0); if(f===f) c.push(1200*Math.log2(f/f0)); }
          out.pitch[id+"@"+sr]={mean:c.reduce((a,b)=>a+b,0)/c.length, min:Math.min(...c), max:Math.max(...c), n:c.length}; }
        /* 4 the C pad's low note: fingers, pick, upright, through each one's rig */
        for(const id of ["finger","pick","upright"]){ const sr=44100, m=bassRoot({off:0,q:"maj"}), cl=cellFor(m), d=await __render(id,[{m, v:0.8, t:0, s:cl.s}],1.6,sr), lv=(a,b)=>A.db(A.rms(d,sr,a,b));
          out.note[id]={m, c05:A.centroid(d,sr,0,0.5), c40:A.centroid(d,sr,0,0.04), hf2k:A.hf(d,sr,0,0.03,2000)-lv(0.01,0.26), hfStart:A.hf(d,sr,0,0.03,4000)-lv(0.01,0.26),
            drop:A.hf(d,sr,0,0.03,4000)-A.hf(d,sr,0.15,0.5,4000), low:A.db(A.rms(A.run(d.slice(0,Math.floor(0.04*sr)),A.bq("lp",150,0.7071,sr)),sr,0,0.04))-A.db(A.rms(A.run(d.slice(Math.floor(0.1*sr),Math.floor(0.3*sr)),A.bq("lp",150,0.7071,sr)),sr,0,0.2)),
            end:lv(1.0,1.2)-lv(0.05,0.25)};
          const dd=await __render(id,[{m, v:0.8, t:0, s:cl.s}],1.6,sr,true); out.note[id].dryEnd=A.db(A.rms(dd,sr,1.0,1.2))-A.db(A.rms(dd,sr,0.05,0.25)); }
        /* 5 the synth's low G: the even harmonics (the saw's alone, no beating) with the saw's own slope taken out show the filter */
        out.synth={};
        for(const id of ["synth","acid"]){ const sr=44100, f0=mtof(31), d=await __render(id,[{m:31,v:0.8,t:0.02,s:0}],1.4,sr);
          const H=A.harm(d,sr,0.55,1.15,f0,24), E=[]; for(let h=2;h<=24;h+=2) E.push(H[h-1]+20*Math.log10(h));
          const dd=await __render(id,[{m:31,v:0.8,t:0.02,s:0}],0.6,sr,true), h0=A.harm(dd,sr,0.02,0.22,f0/2,2), sub=h0[0]-h0[1];
          out.synth[id]={peak:Math.max(...E)-E[0], at:2+2*E.indexOf(Math.max(...E)), sub, c0:A.centroid(d,sr,0.02,0.07), c1:A.centroid(d,sr,0.1,0.25), c2:A.centroid(d,sr,0.5,1.0), sit:A.db(A.rms(d,sr,0.6,1.0))-A.db(A.rms(d,sr,0.02,0.07))}; }
        return out; });
      ok(!errs.length, `bass (${ver}): no page errors ${errs.join(" | ")}`);
      await c.close(); }
  }
  const f=(x,w)=>(x>=0?" ":"")+x.toFixed(w==null?1:w);
  for(const ver of vers){ const g=R[ver+"g"], bb=R[ver+"b"]; console.log(`\n== ${ver==="old"?"BEFORE (63d8440a)":"AFTER"}`);
    for(const [k,v] of Object.entries(Object.assign({}, g.pitch, bb.pitch))) console.log(`  pitch ${k.padEnd(14)} mean ${f(v.mean,2)} c, ${f(v.min,2)}..${f(v.max,2)} c over ${v.n} frames`);
    for(const [k,v] of Object.entries(g.note)) console.log(`  A2 ${k.padEnd(7)} HF>4k first 30 ms ${f(v.hfStart)} dB, tail ${f(v.hfTail)} dB (re the note); drop ${f(v.drop)} dB; centroid 0-40 ms ${v.c40.toFixed(0)} Hz, 40-500 ms ${v.cTail.toFixed(0)} Hz`);
    for(const [k,v] of Object.entries(g.chord)) console.log(`  C pad ${k.padEnd(7)} centroid 0-0.5 s ${v.c05.toFixed(0)} Hz, first 70 ms ${v.c70.toFixed(0)} Hz; HF>2k first 70 ms ${f(v.hf2k)} dB; attack ${f(v.atk)} dB`);
    for(const [k,v] of Object.entries(bb.note)) console.log(`  bass C ${k.padEnd(7)} (m${v.m}) centroid 0-0.5 s ${v.c05.toFixed(0)} Hz, 0-40 ms ${v.c40.toFixed(0)} Hz; HF>2k first 30 ms ${f(v.hf2k)} dB, >4k ${f(v.hfStart)} dB; HF drop ${f(v.drop)} dB; low thump ${f(v.low)} dB; at 1.1 s ${f(v.end)} dB (the string alone ${f(v.dryEnd)} dB)`);
    for(const [k,v] of Object.entries(bb.synth)) console.log(`  low G ${k.padEnd(6)} filter peak over the low harmonics ${f(v.peak)} dB (at harmonic ${v.at}); the octave-down sine ${f(v.sub)} dB against the note in the first 0.2 s (before the amp); centroid ${v.c0.toFixed(0)} → ${v.c1.toFixed(0)} → ${v.c2.toFixed(0)} Hz; sits ${f(v.sit)} dB under the start`);
  }
  /* the checks (after) */
  const g=R.newg, bb=R.newb;
  const pit=Object.entries(Object.assign({}, g.pitch, bb.pitch)).filter(([k])=>!/metal/.test(k));
  ok(pit.every(([k,v])=>Math.abs(v.min)<=3 && Math.abs(v.max)<=3 && v.max-v.min<=2), `open E (guitar E2, bass E1) in tune within ±3 cents and steady (spread ≤ 2 cents): ${pit.map(([k,v])=>k+" "+v.min.toFixed(2)+".."+v.max.toFixed(2)).join("; ")}`);
  ok(g.note.steel.drop>=18 && g.note.steel.hfTail<=-22, `steel's pick is a click: HF>4k falls ${g.note.steel.drop.toFixed(1)} dB after the first 30 ms; the tail's HF share ${g.note.steel.hfTail.toFixed(1)} dB`);
  ok(bb.note.pick.drop>=18 && bb.note.pick.hfStart-bb.note.finger.hfStart>=10, `bass pick: a click (HF drop ${bb.note.pick.drop.toFixed(1)} dB), ${(bb.note.pick.hfStart-bb.note.finger.hfStart).toFixed(1)} dB more click than fingers`);
  const sv=g.chord.steel, nv=g.chord.nylon;
  ok(sv.c05/nv.c05>=1.6 && sv.hf2k-nv.hf2k>=10 && g.note.steel.hfStart-g.note.nylon.hfStart>=10, `steel against nylon, the C pad: centroid ${sv.c05.toFixed(0)} vs ${nv.c05.toFixed(0)} Hz (×${(sv.c05/nv.c05).toFixed(2)}), HF>2k in the strum ${(sv.hf2k-nv.hf2k).toFixed(1)} dB apart, the pick click ${(g.note.steel.hfStart-g.note.nylon.hfStart).toFixed(1)} dB over nylon's`);
  const fi=bb.note.finger, pk=bb.note.pick, up=bb.note.upright;
  ok(pk.c05/fi.c05>=1.5 && pk.hf2k-fi.hf2k>=10 && pk.dryEnd<=fi.dryEnd-1.5, `fingers against pick: centroid ${fi.c05.toFixed(0)} vs ${pk.c05.toFixed(0)} Hz (×${(pk.c05/fi.c05).toFixed(2)}), HF>2k at the start ${(pk.hf2k-fi.hf2k).toFixed(1)} dB apart, the pick's string dies sooner (${fi.dryEnd.toFixed(1)} vs ${pk.dryEnd.toFixed(1)} dB at 1.1 s; through each rig, the pick's with its compressor pedal: ${fi.end.toFixed(1)} vs ${pk.end.toFixed(1)})`);
  ok(up.c05<=fi.c05 && up.hf2k<=-25 && up.low>=4, `upright: darker (${up.c05.toFixed(0)} Hz), no fret click (HF>2k ${up.hf2k.toFixed(1)} dB), a soft thump (lows ${up.low.toFixed(1)} dB up at the start)`);
  ok(bb.synth.synth.peak<=2.5 && bb.synth.synth.sub>=bb.synth.acid.sub+10 && bb.synth.synth.c0>bb.synth.synth.c2, `synth low G: no resonant peak standing out (${bb.synth.synth.peak.toFixed(1)} dB over the low harmonics), a thump (the octave-down sine ${bb.synth.synth.sub.toFixed(1)} dB against the note at the start; acid, without it, ${bb.synth.acid.sub.toFixed(1)}), the filter closes (${bb.synth.synth.c0.toFixed(0)} → ${bb.synth.synth.c2.toFixed(0)} Hz)`);
  /* AOG-STRINGS-REAL-V1: the recordings (the checks above stay on the strings made on the page, which play while a set loads) */
  if(g.rpitch){
    const rp=Object.entries(g.rpitch);
    for(const [k,v] of rp) console.log(`  recorded pitch ${k.padEnd(12)} mean ${f(v.mean,2)} c, ${f(v.min,2)}..${f(v.max,2)} c over ${v.n} frames`);
    for(const [k,v] of Object.entries(g.rchord)) console.log(`  recorded C pad ${k.padEnd(6)} centroid ${v.c05.toFixed(0)} Hz, HF>2k ${f(v.hf2k)} dB`);
    ok(rp.every(([k,v])=>Math.abs(v.mean)<=5 && v.max-v.min<=20), `recorded guitars: the open E in tune within ±5 cents on average; over 1.5 s it glides no more than 20 cents (a plucked string starts a little sharp and settles flat as it rings): ${rp.map(([k,v])=>k+" "+v.mean.toFixed(1)+" ("+v.min.toFixed(1)+".."+v.max.toFixed(1)+")").join("; ")}`);
    ok(g.rchord.steel.c05>g.rchord.nylon.c05 && g.rchord.steel.hf2k>g.rchord.nylon.hf2k, `recorded steel strings brighter than the recorded nylon ones: centroid ${g.rchord.steel.c05.toFixed(0)} vs ${g.rchord.nylon.c05.toFixed(0)} Hz, HF>2k ${g.rchord.steel.hf2k.toFixed(1)} vs ${g.rchord.nylon.hf2k.toFixed(1)} dB`);
  }
  console.log(fails?fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
