/* AOG-STRINGS-PRO-V1 (2026-10-23) — held notes that ring as real ones do, and acoustics that never repeat a strum.
   Every number is rendered offline through the room's own engine and chain (makeChain: its amp, pedals and room), at the
   default volume, as amp/b1 and levels/even play them; a note's level is its 50 ms RMS against its loudest 50 ms.
   1  decay: a clean electric (clean) is 60 dB down at 8 to 12 s (the median of four notes up the neck; each 7 to 22 s),
      every other clean or crunchy electric still rings at 7 s; an acoustic (steel, twelve, warmtwelve, nylon) at 5 s or
      more; every recorded bass sound (but the short, muted ones and the synths) 8 s or more (a gated sound 6 s: its gate
      closes the note as it was set to). Before: steel −74 dB at 3 s, clean −58 dB at 3 s, finger bass −65 dB at 6 s.
   2  high gain (lead, shred, metal, and every sound hotSound calls high-gain): a held note still within 15 dB of its peak at
      6 s, and it lets go by itself (60 dB down by 20 s)
   3  feedback bloom (shred, lead, metal): nothing at all for the first 3 s a finger holds the note (the render matches one
      never held); by 6 s a harmonic of the note has grown (its band 4 dB or more over the note alone) while the whole stays
      within 4 dB of the note alone and at most 1.5 dB over the note in its first second (subtle), and it moves smoothly
      (its 100 ms level steps no more than 1 dB beyond the note alone's own); let go, its harmonic is back where a note never
      held has it within half a second; a clean sound never blooms; a note nobody holds never blooms
   4  loops click-free: at every loop of every set the jump back is no bigger than the sample steps around it (1.25 times the
      largest within 10 ms on either side) and the level holds across it (within 1.5 dB); a long held note rendered through
      the chain shows no step in its 10 ms level at the loop points
   5  acoustics never repeat: four strums of a chord in a row on steel, twelve and nylon, each string plays a different
      recording or a different take from the strum before, and each strum's sound differs from the one before (the
      difference 25 dB or less under the strum), at the same level (within 0.6 dB); a note picked twice in a row differs too
   6  levels: every take of an acoustic (the nearest recording, the same one a hair apart, the neighbouring one) within 1.5 dB
      of the nearest recording's level (levels/even allows any one take 2 dB), at every fret of every string (K-weighted, first 400 ms, as levels/even)
   7  light: no new file: a set downloads its set.json and its MP3s only; each set's size is printed (the first play needs the
      whole set, as before); finding a set's loops takes 3 ms or less a recording here (a phone, about four times slower,
      stays inside the 12 ms slice CLAUDE.md asks for)
   8  iPhone and iPad (English and Spanish): the Guitar and the Bass open without errors and without sideways scroll; a fret
      held with a finger plays a looped note that rings past 8 s; on a high-gain sound the held finger arms the feedback and
      lifting it lets it go
   Run: node strings/sustain.js   (AOG_ROOT=<a worktree>/aog-deploy to test another copy). Port 9926. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path");
const ROOT=process.env.AOG_ROOT||path.resolve(__dirname,"../../../aog-deploy");
const srv=require("../srv.js")(9926);
const ONLY=process.argv.slice(2), want=k=>!ONLY.length || ONLY.indexOf(k)>=0;   /* node strings/sustain.js [decay bloom loops acoustic light devices] */
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; return c; };
const LIB=`
window.__S={
  env(buf, w){ const sr=buf.sampleRate, W=Math.round((w||0.05)*sr), n=Math.floor(buf.length/W), e=new Float64Array(n);
    for(let ch=0; ch<buf.numberOfChannels; ch++){ const d=buf.getChannelData(ch); for(let k=0;k<n;k++){ let s=0; for(let i=k*W;i<(k+1)*W;i++) s+=d[i]*d[i]; e[k]+=s/W; } }
    return Array.from(e, x=>10*Math.log10(x+1e-20)); },
  pk(env){ return Math.max(...env); },
  at(env, t, w){ return env[Math.min(env.length-1, Math.round(t/(w||0.05)))]-this.pk(env); },
  t60(env, w){ const p=this.pk(env); for(let i=env.length-1;i>=0;i--) if(env[i]-p>-60) return (i+1)*(w||0.05); return 0; },
  band(buf, f, a, b){ const sr=buf.sampleRate, d=buf.getChannelData(0), s0=Math.floor(a*sr), s1=Math.floor(b*sr); let re=0, im=0, n=0;
    for(let i=s0;i<s1;i++){ const w=0.5-0.5*Math.cos(2*Math.PI*(i-s0)/(s1-s0)), ph=2*Math.PI*f*i/sr; re+=d[i]*w*Math.cos(ph); im+=d[i]*w*Math.sin(ph); n++; }
    return 20*Math.log10(Math.sqrt(re*re+im*im)/n+1e-12); },
  /* the strongest of the bins around f (within 3 %: the bloom's vibrato and a bend move it a little) */
  bandMax(buf, f, a, b){ let m=-1e9; for(let k=-6;k<=6;k++) m=Math.max(m, this.band(buf, f*(1+k*0.005), a, b)); return m; },
  rms(buf, a, b){ const sr=buf.sampleRate; let s=0, n=0; for(let ch=0; ch<buf.numberOfChannels; ch++){ const d=buf.getChannelData(ch); for(let i=Math.floor(a*sr);i<Math.min(d.length, Math.floor(b*sr));i++){ s+=d[i]*d[i]; n++; } } return 10*Math.log10(s/Math.max(1,n)+1e-20); },
  diff(x, y, a, b){ const sr=x.sampleRate; let s=0, e=0; for(let ch=0; ch<x.numberOfChannels; ch++){ const p=x.getChannelData(ch), q=y.getChannelData(ch);
    for(let i=Math.floor(a*sr);i<Math.min(p.length, Math.floor(b*sr));i++){ const dd=p[i]-q[i]; s+=dd*dd; e+=q[i]*q[i]; } } return 10*Math.log10(s/(e+1e-20)+1e-20); },
  kw(buf){ const sr=buf.sampleRate;
    function rbjq(type,f,Q,dB){ const w=2*Math.PI*f/sr, cw=Math.cos(w), al=Math.sin(w)/(2*Q), A=Math.pow(10,dB/40); let b0,b1,b2,a0,a1,a2;
      if(type==="hp"){ b0=(1+cw)/2; b1=-(1+cw); b2=(1+cw)/2; a0=1+al; a1=-2*cw; a2=1-al; }
      else { const sq=2*Math.sqrt(A)*al; b0=A*((A+1)+(A-1)*cw+sq); b1=-2*A*((A-1)+(A+1)*cw); b2=A*((A+1)+(A-1)*cw-sq); a0=(A+1)-(A-1)*cw+sq; a1=2*((A-1)-(A+1)*cw); a2=(A+1)-(A-1)*cw-sq; }
      return [b0/a0,b1/a0,b2/a0,a1/a0,a2/a0]; }
    const ks=[rbjq("hp",60,0.5,0), rbjq("hs",1500,0.7,4)], sq=new Float64Array(buf.length);
    for(let ch=0; ch<buf.numberOfChannels; ch++){ const d=Float32Array.from(buf.getChannelData(ch));
      ks.forEach(k=>{ let x1=0,x2=0,y1=0,y2=0; for(let i=0;i<d.length;i++){ const x=d[i], y=k[0]*x+k[1]*x1+k[2]*x2-k[3]*y1-k[4]*y2; x2=x1;x1=x;y2=y1;y1=y; d[i]=y; } });
      for(let i=0;i<d.length;i++) sq[i]+=d[i]*d[i]; }
    const W=Math.floor(0.4*sr), hop=Math.floor(0.05*sr); let best=0;
    for(let a=0;a+W<=sq.length;a+=hop){ let s=0; for(let i=a;i<a+W;i++) s+=sq[i]; best=Math.max(best, s/W); }
    return 10*Math.log10(best+1e-12); },
  /* one held note through the room's own chain (o: v, hold, letGo, rr: the takes' turn to start from) */
  async note(id, m, s, dur, o){ o=o||{}; await loadSound(id); const R=REAL.sets[recOf(id)]; if(R && o.rr!==false) R.rr={};
    const oc=new OfflineAudioContext(2, Math.round(44100*dur), 44100); await AOGAmp.load(oc); S.sound=id; const ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0);
    FORCE_Z=null; const vc=makeVoice(oc,ch,id,m,o.v||0.76,0.05,s,o.o);
    if(o.hold!=null && vc.hold) vc.hold(o.hold); if(o.letGo!=null && vc.letGo) vc.letGo(o.letGo);
    return {buf:await oc.startRendering(), vc:vc}; }
};`;
const f1=x=>(x>=0?"+":"")+x.toFixed(1);
(async()=>{
  const b=await pw.chromium.launch();
  const open=async(inst, ctxo)=>{ const c=await b.newContext(Object.assign({serviceWorkers:"block"}, ctxo||{})), p=await c.newPage(); const errs=[], files=[];
    p.on("pageerror",e=>errs.push(e.message)); p.on("request", r=>{ const u=r.url(); if(/\/audio\//.test(u)) files.push(u.replace(/^https?:\/\/[^/]+/,"").split("?")[0]); });
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9926/music-${inst}.html`); await p.waitForTimeout(900); await p.addScriptTag({content:LIB}); p.errs=errs; p.files=files; p.ctx=c; return p; };

  /* ── 1, 2: decay ── */
  if(want("decay")) { const p=await open("guitar");
    const r=await p.evaluate(async()=>{ const T=__S, out={};
      const ids=Object.keys(SOUNDS).filter(k=>SOUNDS[k].rec);
      const one=async(id, m, s, dur)=>{ const n=await T.note(id, m, s, dur), e=T.env(n.buf); return {m, t60:T.t60(e), at3:T.at(e,3), at6:T.at(e,6), end:T.at(e,dur-0.3), loop:!!(n.vc.rec && n.vc.rec.loop)}; };
      out.hot=ids.filter(id=>hotSound(id)); out.clean=[]; out.other=[]; out.ac=[]; out.hot3=[]; out.hotAll=[];
      for(const [s,f] of [[0,3],[2,5],[4,5],[5,12]]) out.clean.push(await one("clean", TUNING[s]+f, s, 18));
      for(const id of ids.filter(id=>!hotSound(id) && ["steel","nylon"].indexOf(SOUNDS[id].rec)<0 && id!=="clean")) out.other.push(Object.assign({id}, await one(id, 55, 2, 12)));
      for(const id of ["steel","twelve","warmtwelve","nylon"]) for(const [s,f] of [[0,3],[2,5],[4,5]]) out.ac.push(Object.assign({id}, await one(id, TUNING[s]+f, s, 12)));
      for(const id of ["lead","shred","metal"]) for(const [s,f] of [[0,3],[2,5],[4,5],[5,12]]) out.hot3.push(Object.assign({id}, await one(id, TUNING[s]+f, s, 20)));
      for(const id of out.hot.filter(x=>["lead","shred","metal"].indexOf(x)<0)) out.hotAll.push(Object.assign({id, amp:["lead","high","groove"].indexOf(rigFor(id).model)>=0}, await one(id, 55, 2, 12)));
      return out; });
    const cl=r.clean.map(x=>x.t60), med=cl.slice().sort((a,b)=>a-b), md=(med[1]+med[2])/2;
    ok(md>=8 && md<=12 && cl.every(t=>t>=7 && t<=22) && r.clean.every(x=>x.loop), `guitar clean: 60 dB down at ${r.clean.map(x=>x.m+" "+x.t60.toFixed(1)+" s").join(", ")} (median ${md.toFixed(1)} s; was 3.9 s at 55, −58 dB at 3 s), at 3 s ${r.clean.map(x=>f1(x.at3)).join(" / ")} dB`);
    const ob=r.other.filter(x=>!(x.t60>=7));
    ok(!ob.length, `guitar: every other clean or crunchy recorded electric rings past 7 s at 55 (shortest ${r.other.reduce((a,x)=>x.t60<a.t60?x:a).id} ${Math.min(...r.other.map(x=>x.t60)).toFixed(1)} s, ${r.other.length} sounds)${ob.length?" — "+ob.map(x=>x.id+" "+x.t60.toFixed(1)).join(", "):""}`);
    const ab=r.ac.filter(x=>!(x.t60>=5 && x.t60<=16 && x.loop));
    ok(!ab.length, `guitar acoustics ring 5 s or more: ${r.ac.map(x=>x.id+"@"+x.m+" "+x.t60.toFixed(1)).join(", ")} (was steel 3.3 s, nylon 3.9 s at 55)${ab.length?" — off: "+ab.map(x=>x.id+"@"+x.m).join(", "):""}`);
    const hb=r.hot3.filter(x=>!(x.at6>=-15 && x.end<=-60));
    ok(!hb.length, `guitar high gain sustains and lets go by itself: at 6 s ${r.hot3.map(x=>x.id+"@"+x.m+" "+f1(x.at6)).join(", ")} dB; at 19.7 s ${Math.max(...r.hot3.map(x=>x.end)).toFixed(0)} dB or less (was shred −60 dB at 5 s, metal −46 dB at 3 s)${hb.length?" — off: "+hb.map(x=>x.id+"@"+x.m+" "+f1(x.at6)+"/"+f1(x.end)).join(", "):""}`);
    /* a lead, high-gain or groove amp holds like the three above; a crunch amp, a fuzz or a drive in front (hot enough for
       the feedback) rings on as the clean and crunchy sounds do */
    const ha=r.hotAll.filter(x=>x.amp), hc=r.hotAll.filter(x=>!x.amp), hb2=ha.filter(x=>!(x.at6>=-15)), hb3=hc.filter(x=>!(x.t60>=8));
    ok(!hb2.length, `guitar: every other sound on a high-gain amp (${ha.map(x=>x.id).join(", ")}) within 15 dB of its peak at 6 s (lowest ${ha.length?Math.min(...ha.map(x=>x.at6)).toFixed(1):"-"} dB)${hb2.length?" — "+hb2.map(x=>x.id+" "+f1(x.at6)).join(", "):""}`);
    ok(!hb3.length, `guitar: every other driven sound (${hc.length}) rings past 8 s at 55 (shortest ${hc.length?Math.min(...hc.map(x=>x.t60)).toFixed(1):"-"} s)${hb3.length?" — "+hb3.map(x=>x.id+" "+x.t60.toFixed(1)).join(", "):""}`);
    ok(!p.errs.length, `guitar: no page errors ${p.errs.slice(0,3).join(" | ")}`);
    await p.ctx.close(); }
  if(want("decay")) { const p=await open("bass");
    const r=await p.evaluate(async()=>{ const T=__S, out=[];
      for(const id of Object.keys(SOUNDS).filter(k=>SOUNDS[k].rec && SOUNDS[k].kind!=="synth" && !SOUNDS[k].rstac)){
        const st=rigFor(id), gated=!!(st.fx && st.fx.gate && st.fx.gate.on);
        for(const [s,f] of [[0,3],[1,3],[2,10]]){ const n=await T.note(id, TUNING[s]+f, s, 14), e=T.env(n.buf); out.push({id, m:TUNING[s]+f, t60:T.t60(e), at6:T.at(e,6), gated, loop:!!(n.vc.rec && n.vc.rec.loop)}); } }
      return out; });
    const bad=r.filter(x=>!(x.t60>=(x.gated?6:8) && x.loop)), ids=[...new Set(r.map(x=>x.id))];
    const fin=r.filter(x=>x.id==="finger");
    ok(!bad.length, `bass: every recorded bass sound rings 8 s or more (gated 6 s), ${ids.length} sounds at 31, 36, 48: shortest ${Math.min(...r.filter(x=>!x.gated).map(x=>x.t60)).toFixed(1)} s; finger ${fin.map(x=>x.t60.toFixed(1)+" s ("+f1(x.at6)+" dB at 6 s)").join(", ")} (was −65 dB at 6 s)${bad.length?" — off: "+bad.map(x=>x.id+"@"+x.m+" "+x.t60.toFixed(1)).join(", "):""}`);
    ok(!p.errs.length, `bass: no page errors ${p.errs.slice(0,3).join(" | ")}`);
    await p.ctx.close(); }

  /* ── 3: the feedback bloom ── */
  if(want("bloom")) { const p=await open("guitar");
    const r=await p.evaluate(async()=>{ const T=__S, out=[];
      for(const [id,s,f] of [["shred",2,5],["lead",3,7],["metal",4,5],["clean",2,5]]){ const m=TUNING[s]+f, f0=440*Math.pow(2,(m-69)/12), h=m<50?3:(m>=76?1:2);
        const a=await T.note(id, m, s, 9), b=await T.note(id, m, s, 9, {hold:0.05}), c=await T.note(id, m, s, 9, {hold:0.05, letGo:6.5});
        /* smooth: the held note's 100 ms level moves no more than the note alone's does (a recording has its own small
           swells), plus 1 dB; at most 1.5 dB over the note in its first second (a cranked amp holds its level) */
        const ea=T.env(a.buf, 0.1), eb=T.env(b.buf, 0.1); let sa=0, sb=0; for(let i=Math.round(3/0.1);i<Math.round(8.5/0.1);i++){ sa=Math.max(sa, Math.abs(ea[i+1]-ea[i])); sb=Math.max(sb, Math.abs(eb[i+1]-eb[i])); }
        const first=Math.max(...eb.slice(0, 10)), over=Math.max(...eb.slice(30, 85))-first;
        out.push({id, m, held:!!b.vc.hold, early:T.diff(b.buf, a.buf, 0, 3.0), harm:T.bandMax(b.buf, f0*h, 6, 8.5)-T.bandMax(a.buf, f0*h, 6, 8.5),
          whole:T.rms(b.buf, 6, 8.5)-T.rms(a.buf, 6, 8.5), step:sb-sa, sa, sb, over, gone:T.diff(c.buf, a.buf, 7.0, 8.5), goneHarm:T.bandMax(c.buf, f0*h, 7.0, 8.5)-T.bandMax(a.buf, f0*h, 7.0, 8.5), harmHeld:T.bandMax(b.buf, f0*h, 7.0, 8.5)-T.bandMax(a.buf, f0*h, 7.0, 8.5)}); }
      return out; });
    /* let go at 6.5 s: from half a second later its harmonic is back where a note never held has it (the sound's own echo
       or room may carry a trace a moment longer: the whole is reported) */
    for(const x of r.filter(x=>x.id!=="clean")) ok(x.held && x.early<=-60 && x.harm>=4 && x.whole<=4 && x.over<=1.5 && x.step<=1 && x.goneHarm<=1.5,
      `bloom ${x.id}@${x.m}: none for 3 s (${x.early.toFixed(0)} dB from never held), by 6 s its harmonic ${f1(x.harm)} dB, the whole ${f1(x.whole)} dB and at most 1.5 dB over its first second (${f1(x.over)} dB), smooth (largest 100 ms step ${x.sb.toFixed(2)} dB, the note alone ${x.sa.toFixed(2)}); let go: its harmonic ${f1(x.goneHarm)} dB from never held (still held: ${f1(x.harmHeld)} dB), the whole ${x.gone.toFixed(0)} dB from never held`);
    const c=r.find(x=>x.id==="clean"); ok(c && !c.held && c.early<=-60 && Math.abs(c.whole)<0.05, `bloom: a clean sound never blooms (held: ${c.held}, difference ${c.early.toFixed(0)} dB)`);
    await p.ctx.close(); }

  /* ── 4: loops click-free ── */
  if(want("loops")) for(const inst of ["guitar","bass"]){ const p=await open(inst);
    const r=await p.evaluate(async()=>{ const T=__S, out={sets:{}, worst:null, lvl:null, ren:[]};
      const sets=[...new Set(Object.keys(SOUNDS).filter(k=>SOUNDS[k].rec && SOUNDS[k].kind!=="synth").map(k=>SOUNDS[k].rec))];
      for(const set of sets){ const id=Object.keys(SOUNDS).find(k=>SOUNDS[k].rec===set); await loadSound(id); const R=REAL.sets[set]; let n=0, worst={r:0}, lw={d:0}, t=0;
        for(const z of R.meta.zones){ const L=R.loop[z.f]; if(!L) continue; n++; const B=R.buf[z.f], c=B.getChannelData(0), sr=B.sampleRate, A=Math.round(L.a*sr), Z=Math.round(L.z*sr), w=Math.round(0.01*sr);
          let nb=0; for(let i=Z-w;i<Z-1;i++) nb=Math.max(nb, Math.abs(c[i+1]-c[i])); for(let i=A;i<A+w;i++) nb=Math.max(nb, Math.abs(c[i+1]-c[i]));
          const j=Math.abs(c[A]-c[Z-1]), ratio=j/(nb+1e-12); if(ratio>worst.r) worst={r:ratio, f:z.f};
          const rm=(a,b)=>{ let s=0; for(let i=a;i<b;i++) s+=c[i]*c[i]; return 10*Math.log10(s/(b-a)+1e-20); }, dl=rm(Z-Math.round(0.05*sr), Z)-rm(A, A+Math.round(0.05*sr)); if(Math.abs(dl)>Math.abs(lw.d)) lw={d:dl, f:z.f};
        }
        const sus=R.meta.zones.filter(z=>(z.k||"sus")==="sus").length;
        out.sets[set]={n, sus, worst, lw};
        /* one long note through the chain: its 10 ms level around each pass of the loop */
        const zz=R.meta.zones.find(z=>(z.k||"sus")==="sus" && R.loop[z.f] && z.m>=48)||R.meta.zones.find(z=>R.loop[z.f]);
        const nt=await T.note(id, zz.m, null, 9, {o:undefined}), L=R.loop[nt.vc.rec.f];
        if(L){ const e=T.env(nt.buf, 0.01), off=R.at[nt.vc.rec.f], first=0.05+(L.a-off), len=L.z-L.a; let st=0;
          for(let t=first+len; t<8.5; t+=len){ const i=Math.round(t/0.01); if(i+3>=e.length) break; const d=Math.abs((e[i+2]+e[i+3])/2-(e[i-3]+e[i-2])/2); const slope=Math.abs((e[i+8]-e[i-8])/16*5); st=Math.max(st, d-slope); }
          out.ren.push({set, f:nt.vc.rec.f, step:st}); } }
      return out; });
    for(const [set,v] of Object.entries(r.sets)) ok(v.n===v.sus && v.worst.r<=1.25 && Math.abs(v.lw.d)<=1.5,
      `${inst} ${set}: ${v.n} of ${v.sus} held recordings looped; the jump back at most ${v.worst.r.toFixed(2)} times the steps around it (${v.worst.f||"-"}); level across it within ${Math.abs(v.lw.d).toFixed(2)} dB`);
    for(const x of r.ren) ok(x.step<=1.0, `${inst} ${x.set}: a long note through the chain (${x.f}) holds its level at every pass of the loop (largest step ${x.step.toFixed(2)} dB)`);
    await p.ctx.close(); }

  /* ── 5, 6: the acoustics never repeat; every take as loud ── */
  if(want("acoustic")) { const p=await open("guitar");
    const r=await p.evaluate(async()=>{ const T=__S, out={strums:[], notes:[], takes:[]};
      for(const id of ["steel","twelve","nylon"]){ await loadSound(id); const R=REAL.sets[recOf(id)]; R.rr={};
        const shp=shapeFor({off:0,q:"maj"}), bufs=[], picks=[], lv=[];
        for(let k=0;k<4;k++){ const oc=new OfflineAudioContext(2, 44100*2, 44100); await AOGAmp.load(oc); S.sound=id; const ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0);
          const pk=[]; let j=0; shp.forEach((f,s)=>{ if(f<0) return; const vc=makeVoice(oc,ch,id,TUNING[s]+f,0.74,0.05+j*0.016,s); pk.push(vc.rec.f+"#"+vc.rec.vr); j++; });
          const b=await oc.startRendering(); bufs.push(b); picks.push(pk); lv.push(T.kw(b)); }
        let same=0; for(let k=1;k<4;k++) picks[k].forEach((x,i)=>{ if(x===picks[k-1][i]) same++; });
        const df=[1,2,3].map(k=>T.diff(bufs[k], bufs[k-1], 0.05, 1.5));
        out.strums.push({id, same, df, lv:Math.max(...lv)-Math.min(...lv), picks:picks.map(x=>x.join(" "))});
        /* one note twice */
        R.rr={}; const a=await T.note(id, 57, 3, 1.5, {rr:false}), b=await T.note(id, 57, 3, 1.5, {rr:false});
        out.notes.push({id, a:a.vc.rec.f+"#"+a.vc.rec.vr, b:b.vc.rec.f+"#"+b.vc.rec.vr, df:T.diff(b.buf, a.buf, 0.05, 1.4)}); }
      for(const id of ["steel","nylon"]){ const R=REAL.sets[recOf(id)]; let worst={d:0}, n=0;
        for(let s=0;s<TUNING.length;s++) for(let f=0;f<=12;f++){ const m=TUNING[s]+f; R.rr={}; const lv=[], fs=[];
          for(let k=0;k<3;k++){ const n0=await T.note(id, m, s, 0.46, {rr:false}); lv.push(T.kw(n0.buf)); fs.push(n0.vc.rec.f+"#"+n0.vc.rec.vr); }
          for(let k=1;k<3;k++){ n++; if(Math.abs(lv[k]-lv[0])>Math.abs(worst.d)) worst={d:lv[k]-lv[0], m, s, t:fs[k]}; } }
        out.takes.push({id, n, worst}); }
      return out; });
    for(const x of r.strums) ok(x.same===0 && x.lv<=0.6 && x.df.every(d=>d>=-25),
      `${x.id}: four C strums in a row, no string repeats its sound (${x.same} repeats; ${x.picks[0]} → ${x.picks[1]}); each strum differs from the one before by ${x.df.map(d=>d.toFixed(0)).join(", ")} dB; level within ${x.lv.toFixed(2)} dB`);
    for(const x of r.notes) ok(x.a!==x.b && x.df>-25, `${x.id}: the same note twice plays ${x.a} then ${x.b} (difference ${x.df.toFixed(0)} dB)`);
    for(const x of r.takes) ok(Math.abs(x.worst.d)<=1.5, `${x.id}: every take within 1.5 dB of the nearest recording at every fret 0–12 of every string (${x.n} takes; worst ${f1(x.worst.d)} dB, ${x.worst.t||"-"} at ${x.worst.m})`);
    await p.ctx.close(); }

  /* ── 7: light ── */
  if(want("light")) { const sizes=[];
    for(const inst of ["guitar","bass"]){ const p=await open(inst);
      const r=await p.evaluate(async()=>{ const out=[]; const sets=[...new Set(Object.keys(SOUNDS).filter(k=>SOUNDS[k].rec && SOUNDS[k].rec.indexOf("/")<0).map(k=>SOUNDS[k].rec))];
        for(const set of sets){ const id=Object.keys(SOUNDS).find(k=>SOUNDS[k].rec===set); const t0=performance.now(); await loadSound(id); const R=REAL.sets[set];
          /* each recording's own time, the best of five (a garbage collection or a busy machine in between is not the loop's) */
          let tm=0, mx=0; for(const z of R.meta.zones.filter(z=>(z.k||"sus")==="sus" && !z.lp && R.meta.play!=="straight")){ const B=R.buf[z.f]; let d=1e9;
            for(let k=0;k<5;k++){ const c=new AudioBuffer({length:B.length, sampleRate:B.sampleRate, numberOfChannels:1}); c.copyToChannel(B.getChannelData(0).slice(), 0);
              const a=performance.now(); strLoop(c, R.at[z.f], z.m); d=Math.min(d, performance.now()-a); }
            tm+=d; if(d>mx){ mx=d; var mf=z.f; } }
          out.push({set, files:R.meta.zones.length+recRel(R.meta).length+recSlaps(R.meta).length, tm, mx, mf:typeof mf==="string"?mf:"", ...(mf=undefined, {})}); }
        return out; });
      /* (the page loads a set's held and short notes, its release noises and its slaps: the files recLoad asks for) */
      for(const x of r){ const dir=path.join(ROOT, "audio", inst, x.set), fl=p.files.filter(u=>u.indexOf(`/audio/${inst}/${x.set}/`)===0), byt=fs.readdirSync(dir).reduce((a,f)=>a+fs.statSync(path.join(dir,f)).size, 0);
        const extra=fl.filter(u=>!/\.mp3$|set\.json$/.test(u));
        sizes.push(`${inst}/${x.set} ${(byt/1e6).toFixed(2)} MB`);
        const nm=new Set(fl.filter(u=>/\.mp3$/.test(u))).size;
        ok(!extra.length && nm===x.files && x.mx<=3, `${inst} ${x.set}: downloads set.json and its ${x.files} MP3s only (${nm} fetched${extra.length?", and "+extra.join(" "):""}; ${(byt/1e6).toFixed(2)} MB, the whole set before the first note, as before); loops found in ${x.tm.toFixed(0)} ms, ${x.mx.toFixed(2)} ms the longest recording (${x.mf})`); }
      await p.ctx.close(); }
    console.log("sizes: "+sizes.join(", ")); }

  /* ── 8: iPhone and iPad ── */
  if(want("devices")) for(const [name, vp] of [["iPhone", {viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:3}], ["iPad", {viewport:{width:820,height:1180}, isMobile:true, hasTouch:true, deviceScaleFactor:2}]])
  for(const inst of ["guitar","bass"]) for(const lang of ["en","es"]){
    const p=await open(inst, vp);
    await p.evaluate(l=>{ try{ localStorage.setItem("aog.lang", l); }catch(e){} }, lang); await p.reload(); await p.waitForTimeout(900); await p.addScriptTag({content:LIB});
    const id=inst==="guitar" ? "shred" : "finger";
    await p.evaluate(async(id)=>{ const ss=document.getElementById("soundSel"); ss.value=id; ss.onchange(); await loadSound(id); }, id);
    const box=await p.evaluate(()=>{ const svg=document.getElementById("neck"); svg.scrollIntoView({block:"center"}); const r=svg.getBoundingClientRect(); const s=Math.min(1, TUNING.length-1);
      const x=r.left+(NECK.nut+2.5*NECK.cw)*r.width/NECK.W, y=r.top+(NECK.top+s*NECK.rowH+NECK.rowH/2)*r.height/NECK.H; return {x, y, s}; });
    await p.mouse.move(box.x, box.y); await p.mouse.down(); await p.waitForTimeout(250);
    const on=await p.evaluate(s=>{ const L=STR_LIVE[s]; return L && L.vc ? {loop:!!(L.vc.rec && L.vc.rec.loop), ring:L.vc.natural-L.at, bloom:L.vc.blooming ? L.vc.blooming() : null, lang:S.lang} : null; }, box.s);
    await p.mouse.up(); await p.waitForTimeout(150);
    const off=await p.evaluate(s=>{ const L=STR_LIVE[s]; return L && L.vc ? {bloom:L.vc.blooming ? L.vc.blooming() : null, stopped:L.vc.stopped} : null; }, box.s);
    const wide=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    const hot=inst==="guitar";
    ok(on && on.loop && on.ring>8 && (!hot || (on.bloom===true && off && off.bloom===false)) && wide<=0 && !p.errs.length && on.lang===lang,
      `${name} ${inst} (${lang}): a held fret plays a looped note that rings ${on?on.ring.toFixed(1):"?"} s${hot?`; the held finger arms the feedback (${on&&on.bloom}), lifting it lets it go (${off&&off.bloom})`:""}; no sideways scroll (${wide}); no errors ${p.errs.slice(0,2).join(" | ")}`);
    await p.ctx.close(); }

  await b.close(); srv.close();
  console.log(fails ? `${fails} FAILED` : "all passed"); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack||e.message); process.exit(1); });
