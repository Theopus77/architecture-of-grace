/* AOG-STRINGS-REAL-V1 — the recorded guitars and basses (audio/<guitar|bass>/<set>/), through the page's own engine:
   1  a set downloads only when a sound that uses it is picked; two stay in memory; a sound made on the page loads nothing
   2  until a set is in, the string made on the page plays (the calm line says so, in English and Spanish); then the recordings
   3  every held note of every set is in tune within ±5 cents once the page applies its c, measured as its builder measured
      it (the guitars: YIN over 0.12–0.7 s; the basses: tools/bass's own measure); the short notes too
   4  no click: where a note starts, where it ends by itself, where it is let go, and where the hand's sound comes in; the
      hand's sound plays when a held note is let go, under the note
   5  a harder pluck plays the louder layer, and it is louder; the takes of a note come in turn; muted notes are short
   6  a bend glides the recorded note (the sound itself, 200 ± 10 cents); a hammer-on makes no new pick; a tap starts without
      one (its first 3 ms have neither the pick's click nor the pluck's jump of a picked note, over four notes);
      a picked bass sound (the recorded bass is played with the fingers) starts with the pick's click, a hammer-on on it without;
      the hand's sound when a note is let go sits under the note, through every sound's own amp (8 dB or more)
   7  every note lands on time whatever the decoder does with the MP3's gapless header (a decoder that keeps the encoder's
      lead-in, as one that ignores the header would: the note still starts at the same moment)
   8  a phone (390 px): no sideways scroll, the line fits
  10  the slap sounds: a slap starts with a sharp low thump (the recorded thumb), a pop with a bright snap that dies fast
      (the bass's own fret clank); a fretless slide sings over longer than a fretted one and lands in tune
  11  the synth sounds on the recorded organ: every note in tune, a held note keeps sounding (its loop, with no click where
      it comes round), the filter still closes (the growl) and the thump is there
   9  Solo mode's band: its sets come down only when Play is pressed, with one calm line; the made strings play until they
      are in; the guitar plays the green set, the bass (guitar page) the recorded bass, unless the device has room for two
      sets only and three would be needed (then the made bass); out of Solo mode its sets go; on the recordings the band is
      as loud as the made band in every style; each set's decoded memory
   Run: node strings/real.js   (AOG_ROOT=<a worktree>/aog-deploy to test another copy) */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9917);
const MEASURE=(0,eval)(require("fs").readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const LIB=`
window.__T={
  yin(d,sr,t,f0){ const P0=sr/f0, lo=Math.floor(P0/1.08), hi=Math.ceil(P0*1.08), W=Math.ceil(P0*3), a=Math.floor(t*sr); if(a+W+hi+2>d.length) return NaN;
    const D=new Float64Array(hi+2); for(let tau=1;tau<=hi+1;tau++){ let s=0; for(let j=0;j<W;j++){ const e=d[a+j]-d[a+j+tau]; s+=e*e; } D[tau]=s; }
    const C=new Float64Array(hi+2); let run=0; C[0]=1; for(let tau=1;tau<=hi+1;tau++){ run+=D[tau]; C[tau]=D[tau]*tau/(run||1e-20); }
    let best=lo; for(let tau=lo;tau<=hi;tau++) if(C[tau]<C[best]) best=tau; const y0=C[best-1], y1=C[best], y2=C[best+1], den=y0-2*y1+y2, off=den>0?0.5*(y0-y2)/den:0; return sr/(best+off); },
  cents(d,sr,f0,t0,t1,step){ const c=[]; for(let t=t0;t<=t1+1e-9;t+=step){ const f=this.yin(d,sr,t,f0); if(f===f) c.push(1200*Math.log2(f/f0)); } c.sort((a,b)=>a-b); return c.length?c[c.length>>1]:NaN; },
  rms(d,sr,a,b){ const s0=Math.floor(a*sr), s1=Math.min(d.length,Math.floor(b*sr)); let s=0; for(let i=s0;i<s1;i++) s+=d[i]*d[i]; return Math.sqrt(s/Math.max(1,s1-s0)); },
  db(x){ return 20*Math.log10(x+1e-12); },
  fft(re, im, inv){ const N=re.length;
    for(let i=1,j=0;i<N;i++){ let bb=N>>1; for(;j&bb;bb>>=1) j^=bb; j^=bb; if(i<j){ let t=re[i]; re[i]=re[j]; re[j]=t; t=im[i]; im[i]=im[j]; im[j]=t; } }
    for(let len=2;len<=N;len<<=1){ const ang=(inv?2:-2)*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang);
      for(let i=0;i<N;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const p=i+j,q=p+len/2, vr=re[q]*cr-im[q]*ci, vi=re[q]*ci+im[q]*cr; re[q]=re[p]-vr; im[q]=im[p]-vi; re[p]+=vr; im[p]+=vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } }
    if(inv) for(let i=0;i<N;i++){ re[i]/=N; im[i]/=N; } },
  /* YIN on one frame as the bass sets were measured (tools/bass/build_bass_sets.py yin_frame): threshold 0.15, the dip's
     bottom, parabolic; returns [Hz, how unclear] */
  yinB(y, s, W, tmin, tmax, sr){
    const n=W+tmax+1; let mean=0; for(let i=0;i<n;i++) mean+=y[s+i]; mean/=n;
    const N=1<<Math.ceil(Math.log2(n+W)), ar=new Float64Array(N), ai=new Float64Array(N), br=new Float64Array(N), bi=new Float64Array(N), c=new Float64Array(n+1);
    for(let i=0;i<n;i++){ ar[i]=y[s+i]-mean; c[i+1]=c[i]+ar[i]*ar[i]; } for(let i=0;i<W;i++) br[i]=ar[W-1-i];
    this.fft(ar,ai,false); this.fft(br,bi,false);
    for(let k=0;k<N;k++){ const r=ar[k]*br[k]-ai[k]*bi[k], q=ar[k]*bi[k]+ai[k]*br[k]; ar[k]=r; ai[k]=q; }
    this.fft(ar,ai,true);
    const d=new Float64Array(tmax+1); for(let tau=1;tau<=tmax;tau++) d[tau]=c[W]+(c[tau+W]-c[tau])-2*ar[W-1+tau];
    const dp=new Float64Array(tmax+1).fill(1); let cm=0; for(let tau=1;tau<=tmax;tau++){ cm+=d[tau]; dp[tau]=d[tau]*tau/Math.max(cm,1e-30); }
    let t=-1; for(let k=Math.max(tmin,2);k<tmax;k++){ if(dp[k]<0.15){ while(k+1<tmax && dp[k+1]<dp[k]) k++; t=k; break; } }
    if(t<0){ let b=Math.max(tmin,2); for(let k=b+1;k<tmax;k++) if(dp[k]<dp[b]) b=k; t=b; }
    const den=d[t-1]-2*d[t]+d[t+1], off=den!==0?0.5*(d[t-1]-d[t+1])/den:0;
    return [sr/(t+off), dp[t]]; },
  /* cents off f0 as the bass sets were measured (pitch_cents): from the pluck (the first sample within 40 dB of the
     loudest), low-passed at 6× the note (4 kHz at most), every 10 ms over the steady part (held 0.3–2 s, short 0.04–0.4 s,
     ending once the note is 30 or 15 dB down), the median of the clear frames */
  centsB(x, sr, f0, kind){
    let pk=0; for(let i=0;i<x.length;i++) pk=Math.max(pk,Math.abs(x[i])); let on=0; while(on<x.length && Math.abs(x[on])<pk*0.01) on++;
    const fc=Math.min(6*f0,4000), w=2*Math.PI*fc/sr, al=Math.sin(w)/Math.SQRT2, cw=Math.cos(w);
    const b0=(1-cw)/2/(1+al), b1=(1-cw)/(1+al), a1=-2*cw/(1+al), a2=(1-al)/(1+al), y=new Float64Array(x.length);
    { let x1=0,x2=0,y1=0,y2=0; for(let i=0;i<x.length;i++){ const v=b0*x[i]+b1*x1+b0*x2-a1*y1-a2*y2; x2=x1; x1=x[i]; y2=y1; y1=v; y[i]=v; } }
    const [ta,tm,drop]=kind==="sus"?[0.3,2.0,30]:[0.04,0.4,15], fw=Math.round(0.02*sr), nf=Math.floor((x.length-on)/fw), e=[];
    for(let k=0;k<nf;k++){ let q=0; for(let i=on+k*fw;i<on+(k+1)*fw;i++) q+=x[i]*x[i]; e.push(20*Math.log10(Math.sqrt(q/fw)+1e-12)); }
    const top=Math.max(...e); let tb=Math.min(nf*0.02,tm); for(let k=Math.round(ta/0.02);k<nf;k++) if(e[k]<top-drop){ tb=Math.min(k*0.02,tm); break; }
    const fmin=f0*Math.pow(2,-4/12), fmax=f0*Math.pow(2,4/12), tmax=Math.ceil(sr/fmin), tmin=Math.floor(sr/fmax), W=Math.ceil(2.5*sr/fmin), res=[];
    for(let s=on+Math.round(ta*sr), last=on+Math.round(tb*sr); s<=last && s+W+tmax+1<=y.length; s+=Math.round(0.01*sr)) res.push(this.yinB(y, s, W, tmin, tmax, sr));
    let good=res.filter(r=>r[1]<0.2).map(r=>r[0]); if(good.length<5) good=res.slice().sort((a,b)=>a[1]-b[1]).slice(0,5).filter(r=>r[1]<0.5).map(r=>r[0]);
    if(!good.length) return NaN; const c=good.map(f=>1200*Math.log2(f/f0)).sort((a,b)=>a-b), h=c.length>>1;
    return c.length%2 ? c[h] : (c[h-1]+c[h])/2; },
  /* where a note has dropped drop dB under its loudest (20 ms steps), from t0 on */
  alive(d,sr,t0,drop){ const w=Math.round(0.02*sr), n=Math.floor(d.length/w), e=[]; for(let k=0;k<n;k++){ let s=0; for(let i=k*w;i<(k+1)*w;i++) s+=d[i]*d[i]; e.push(10*Math.log10(s/w+1e-24)); }
    const top=Math.max(...e); for(let k=Math.round(t0/0.02);k<n;k++) if(e[k]<top-drop) return k*0.02; return n*0.02; },
  /* a note's first 3 ms (it starts at 0.05 s) against what follows: the highs over 2 kHz (a pick's click), and the peak (a
     pluck's jump) */
  onTr(d){ return this.hf(d,44100,0.05,0.053,2000,true)-this.hf(d,44100,0.06,0.08,2000,true); },
  onPk(d){ return this.db(this.peak(d,2205,2337)/(this.peak(d,2646,3969)||1e-9)); },
  peak(d,a,b){ let p=0; for(let i=a;i<b;i++) p=Math.max(p,Math.abs(d[i])); return p; },
  step(d,a,b){ let p=0; for(let i=Math.max(1,a);i<b;i++) p=Math.max(p,Math.abs(d[i]-d[i-1])); return p; },
  onset(d,frac){ let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x)); for(let i=0;i<d.length;i++) if(Math.abs(d[i])>=pk*(frac||0.01)) return i; return -1; },
  hf(d,sr,a,b,fc,abs){ const s0=Math.floor(a*sr), L=Math.floor((b-a)*sr), N=1<<Math.ceil(Math.log2(L)), re=new Float64Array(N), im=new Float64Array(N);
    for(let i=0;i<L;i++) re[i]=(d[s0+i]||0)*(0.5-0.5*Math.cos(2*Math.PI*(i+0.5)/L));
    for(let i=1,j=0;i<N;i++){ let bb=N>>1; for(;j&bb;bb>>=1) j^=bb; j^=bb; if(i<j){ let t=re[i]; re[i]=re[j]; re[j]=t; t=im[i]; im[i]=im[j]; im[j]=t; } }
    for(let len=2;len<=N;len<<=1){ const ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang); for(let i=0;i<N;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const p=i+j,q=p+len/2, vr=re[q]*cr-im[q]*ci, vi=re[q]*ci+im[q]*cr; re[q]=re[p]-vr; im[q]=im[p]-vi; re[p]+=vr; im[p]+=vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } }
    let s=0, t=0; for(let k=1;k<N/2;k++){ const e=re[k]*re[k]+im[k]*im[k]; t+=e; if(k*sr/N>=fc) s+=e; } return abs ? 10*Math.log10(s/(L*L)+1e-30) : 10*Math.log10(s/(t||1e-30)+1e-12); },
  /* one or more voices on their own (no amp, no room), offline; fn(oc, ch) schedules them and returns what it made */
  async solo(fn, dur, sr){ sr=sr||44100; const oc=new OfflineAudioContext(1, Math.ceil(dur*sr), sr), g=oc.createGain(); g.connect(oc.destination);
    const out=fn(oc, {amp:g, bus:g}); const d=(await oc.startRendering()).getChannelData(0); return {d, out}; }
};`;
async function open(b, inst, opt){
  const c=await b.newContext(opt||{viewport:{width:1280,height:900}}); const p=await c.newPage(); const errs=[], audio=[];
  p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push(m.text()); });
  p.on("request",q=>{ const m=q.url().match(/\/audio\/(guitar|bass)\/([^/]+)\//); if(m) audio.push(m[2]); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  return {c, p, errs, audio};
}
const sets=a=>[...new Set(a)].sort().join(",");
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const BY={guitar:{green:"clean", black:"metal", steel:"steel", nylon:"nylon"}, bass:{growly:"finger", upright:"upright", ergo:"fretless"}};
  for(const inst of ["guitar","bass"]){
    /* ── 1 · only when picked ── */
    { const {c, p, errs, audio}=await open(b, inst);
      await p.goto(`http://localhost:9917/music-${inst}.html`); await p.addScriptTag({content:LIB});
      const first=await p.evaluate(()=>({sound:S.sound, rec:SOUNDS[S.sound].rec||"", recs:[...new Set(Object.values(SOUNDS).map(s=>s.rec).filter(Boolean))]}));
      await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:30000});
      ok(sets(audio)===first.rec, `${inst}: on opening, only the picked sound's set comes down (${first.sound}: ${sets(audio)}; the page has ${first.recs.join(", ")})`);
      ok(await p.evaluate(()=>/real|de verdad/.test(document.getElementById("loadLine").textContent)), `${inst}: once in, the line says it is a real ${inst}: "${await p.textContent("#loadLine")}"`);
      const made=await p.evaluate(()=>Object.keys(SOUNDS).find(id=>!SOUNDS[id].rec && SOUNDS[id].kind==="pluck") || Object.keys(SOUNDS).find(id=>!SOUNDS[id].rec));
      if(made){ const before=audio.length; await p.selectOption("#soundSel", made); await p.waitForTimeout(400);
        ok(audio.length===before && /built on the page|se crea en esta página/.test(await p.textContent("#loadLine")), `${inst}: a sound made on the page (${made}) loads nothing, and says so`); }
      const order=Object.keys(BY[inst]).filter(s=>s!==first.rec);
      for(const set of order){ const id=BY[inst][set]; await p.selectOption("#soundSel", id); await p.waitForFunction(id=>soundReady(id), id, {timeout:30000}); }
      const kept=await p.evaluate(()=>Object.keys(REAL.sets).filter(k=>REAL.sets[k].state==="ready"));
      ok(sets(audio)===sets([first.rec].concat(order)) && kept.length<=2, `${inst}: picking sounds brings each set once (${sets(audio)}), and only two stay in memory (${kept.join(", ")})`);
      ok(!errs.length, `${inst}: no page errors ${errs.slice(0,3).join(" | ")}`);
      await c.close(); }

    /* ── 2 · the made string while a set loads; the line in English and Spanish ── */
    for(const lang of ["en","es"]){
      const {c, p, errs}=await open(b, inst, {viewport:{width:1280,height:900}});
      let hold=true; const waiting=[];
      await p.route(/\/audio\/(guitar|bass)\/.*\.mp3/, async r=>{ while(hold) await new Promise(ok=>setTimeout(ok,50)); r.continue(); });
      await p.addInitScript(l=>{ try{ localStorage.setItem("aog.lang", l); }catch(e){} }, lang);
      await p.goto(`http://localhost:9917/music-${inst}.html`); await p.waitForTimeout(500);
      const id=Object.values(BY[inst])[0];
      await p.selectOption("#soundSel", id); await p.waitForTimeout(300);
      const during=await p.evaluate(id=>{ ctx(); pluckCell(1, 3, 0.74); const vc=STR_LIVE[1].vc; return {rec:!!vc.rec, line:document.getElementById("loadLine").textContent, ready:soundReady(id)}; }, id);
      const want=inst==="guitar" ? (lang==="es"?"Preparando la guitarra grabada…":"Getting the recorded guitar ready…") : (lang==="es"?"Preparando el bajo grabado…":"Getting the recorded bass ready…");
      ok(!during.ready && !during.rec && during.line===want, `${inst} (${lang}): while the set loads, a note plays on the made string and the line says "${during.line}"`);
      hold=false; await p.waitForFunction(id=>soundReady(id), id, {timeout:30000});
      const after=await p.evaluate(()=>{ pluckCell(1, 3, 0.74); return {rec:STR_LIVE[1].vc.rec, line:document.getElementById("loadLine").textContent}; });
      ok(!!after.rec, `${inst} (${lang}): once it is in, the next note is the recording (${after.rec&&after.rec.f}); the line: "${after.line}"`);
      ok(!errs.length, `${inst} (${lang}): no page errors ${errs.slice(0,3).join(" | ")}`);
      await c.close(); }

    /* ── 3 to 6, on every set ── */
    { const {c, p, errs}=await open(b, inst);
      await p.goto(`http://localhost:9917/music-${inst}.html`); await p.waitForTimeout(400); await p.addScriptTag({content:LIB});
      for(const [set, id] of Object.entries(BY[inst])){
        const r=await p.evaluate(async([set,id])=>{
          const T=__T, out={}; await loadSound(id); const R=REAL.sets[set]; if(!R || R.state!=="ready") return {err:"did not load"};
          /* 3 · tuning */
          out.tune=[];
          for(const z of R.meta.zones){ const buf=R.buf[z.f]; if(!buf) continue; const k=z.k||"sus", f0=440*Math.pow(2,(z.m-69)/12);
            const {d}=await T.solo((oc,ch)=>{ const s=oc.createBufferSource(); s.buffer=buf; s.playbackRate.value=recRate(z, z.m); s.connect(ch.amp); s.start(0, R.at[z.f]); }, Math.min(2.2, buf.duration), 44100);
            /* as each set's builder measured it: the guitar's held notes over 0.12–0.7 s and short ones over 0.06–0.16 s
               (tools/strings), the bass's with its own measure (tools/bass: centsB) */
            const dur=buf.duration-R.at[z.f], W=k==="sus" ? [0.12,0.7,0.02] : [0.06,0.16,0.01];
            const c=R.meta.instrument==="bass" ? T.centsB(d,44100,f0,k) : T.cents(d,44100,f0,W[0],Math.min(W[1],T.alive(d,44100,W[0],k==="sus"?30:15),dur-0.12),W[2]);
            out.tune.push({f:z.f, k, c:+c.toFixed(1)}); }
          /* 4 · clicks: a note's start, its own end, a let-go with the hand's sound */
          const sus=R.by.sus, z0=sus.find(z=>(z.v||1)===R.top) || sus[0], m0=z0.m, s0=z0.s==null?null:z0.s;
          const n1=await T.solo((oc,ch)=>{ const vc=makeVoice(oc,ch,id,m0,0.8,0.1,s0); return vc; }, 7, 44100), d1=n1.d, on=Math.round(0.1*44100), nat=Math.round(n1.out.natural*44100);
          const atk=T.step(d1, on+Math.round(0.0005*44100), on+Math.round(0.02*44100));
          out.start={first:T.step(d1, on-2, on+Math.round(0.0005*44100))/(atk||1e-9), before:T.peak(d1, 0, on-2)};
          out.end={tail:T.db(T.peak(d1, Math.max(on,nat-441), Math.min(d1.length,nat+441))/(T.peak(d1,on,on+44100)||1e-9)), after:T.peak(d1, Math.min(d1.length-1,nat+441), d1.length)};
          const n2=await T.solo((oc,ch)=>{ const vc=makeVoice(oc,ch,id,m0,0.8,0.1,s0); vc.stop(0.9, 0.02); return vc; }, 2.2, 44100), d2=n2.d, t9=Math.round(0.9*44100);
          const body=T.step(d2, t9-Math.round(0.2*44100), t9-Math.round(0.01*44100));
          out.letgo={jump:T.step(d2, t9-44, t9+Math.round(0.004*44100))/(body||1e-9), noise:R.noise.length, gone:T.db(T.rms(d2,44100,0.9+0.15,0.9+0.25)/(T.rms(d2,44100,0.75,0.85)||1e-9))};
          /* let go with the hand's sound: a recording comes in at the let-go, and none of the set's noises comes in with a click */
          const n3=await T.solo((oc,ch)=>{ const vc=makeVoice(oc,ch,id,m0,0.8,0.1,s0); vc.stop(0.9, 0.02, {rel:true}); return vc; }, 2.2, 44100);
          { const dh=new Float32Array(n3.d.length); for(let i=0;i<dh.length;i++) dh[i]=n3.d[i]-d2[i];
            out.letgo.hand=T.db(T.rms(dh,44100,0.9,1.1)/(T.rms(d2,44100,0.8,0.89)||1e-9)); }
          out.noiseIn=0;
          for(const n of R.noise){ const nb=R.buf[n.f]; const {d}=await T.solo((oc,ch)=>{ const s=oc.createBufferSource(); s.buffer=nb; s.connect(ch.amp); s.start(0.05, R.at[n.f]); }, 0.4, 44100);
            const st=Math.round(0.05*44100); out.noiseIn=Math.max(out.noiseIn, T.step(d, st-2, st+22)/(T.step(d, st+22, st+Math.round(0.03*44100))||1e-9)); }
          /* 5 · layers, takes, mutes */
          if(R.layers.length>1){ const lo=Math.max(0.05,(R.meta.vel[1]||0.5)-0.2), hi=0.95, a=[], recs=[];
            for(const v of [lo,hi]){ const n=await T.solo((oc,ch)=>makeVoice(oc,ch,id,m0,v,0.05,s0), 0.6, 44100); a.push(T.rms(n.d,44100,0.06,0.31)); recs.push(n.out.rec.v); }
            out.layers={soft:+T.db(a[0]).toFixed(1), hard:+T.db(a[1]).toFixed(1), v:recs, files:[+T.db(R.lvl.long[R.layers[0]]).toFixed(1), +T.db(R.lvl.long[R.top]).toFixed(1)]}; }
          { const takes=[]; await T.solo((oc,ch)=>{ for(let i=0;i<4;i++){ const vc=makeVoice(oc,ch,id,m0,0.8,0.05+i*0.2,s0); takes.push(vc.rec.r); vc.stop(0.2+i*0.2,0.02); } }, 1.0, 44100); out.takes=takes; }
          if(R.by.stac||R.by.mute){ const n=await T.solo((oc,ch)=>makeVoice(oc,ch,id,m0,0.7,0.05,s0,{art:"mute"}), 1.2, 44100);
            const pk=T.rms(n.d,44100,0.05,0.09); out.mute={k:n.out.rec.k, len:+(R.buf[n.out.rec.f].duration).toFixed(2), down:+T.db(T.rms(n.d,44100,0.3,0.35)/(pk||1e-9)).toFixed(1)}; }
          /* 6 · a bend glides the recording (the sound itself); a tap starts without the pick */
          { const zb=sus.find(z=>z.m>=45 && z.m<=60 && (z.v||1)===R.top) || z0, f0=440*Math.pow(2,(zb.m-69)/12);
            const n=await T.solo((oc,ch)=>{ const vc=makeVoice(oc,ch,id,zb.m,0.8,0.05,zb.s==null?null:zb.s); vc.glide(zb.m+2, 0.6); return vc; }, 1.4, 44100);
            out.bend={rec:!!n.out.rec, before:T.cents(n.d,44100,f0,0.3,0.5,0.02), after:T.cents(n.d,44100,f0*Math.pow(2,2/12),0.85,1.2,0.02)}; }
          { const ms=(GTR?[45,50,55,59]:[36,40,45,50]), H={tr:[],pk:[]}, F={tr:[],pk:[]}; let rec=true;
            for(const m of ms){ const hard=await T.solo((oc,ch)=>makeVoice(oc,ch,id,m,0.62,0.05,null), 0.5, 44100), soft=await T.solo((oc,ch)=>makeVoice(oc,ch,id,m,0.62,0.05,null,{soft:true}), 0.5, 44100);
              rec=rec && !!hard.out.rec && !!soft.out.rec; H.tr.push(T.onTr(hard.d)); H.pk.push(T.onPk(hard.d)); F.tr.push(T.onTr(soft.d)); F.pk.push(T.onPk(soft.d)); }
            const mean=a=>+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
            out.tap={rec, hardTr:mean(H.tr), softTr:mean(F.tr), hardPk:mean(H.pk), softPk:mean(F.pk)}; }
          return out; }, [set, id]);
        if(r.err){ ok(false, `${inst} ${set}: ${r.err}`); continue; }
        const sus=r.tune.filter(x=>x.k==="sus"), short=r.tune.filter(x=>x.k!=="sus"), off=x=>Math.abs(x.c)>5||x.c!==x.c;
        ok(!sus.some(off), `${inst} ${set}: all ${sus.length} held notes in tune within ±5 cents (worst ${sus.reduce((a,x)=>Math.abs(x.c)>Math.abs(a.c)?x:a,{c:0}).c} c)${sus.filter(off).map(x=>" "+x.f+" "+x.c).join("")}`);
        if(short.length) ok(!short.some(off), `${inst} ${set}: all ${short.length} short notes in tune within ±5 cents over their first moment (worst ${short.reduce((a,x)=>Math.abs(x.c)>Math.abs(a.c)?x:a,{c:0}).c} c)${short.filter(off).map(x=>" "+x.f+" "+x.c).join("")}`);
        ok(r.start.before===0 && r.start.first<=1, `${inst} ${set}: a note starts with no click (silent before; its first half millisecond no steeper than its pluck: ${r.start.first.toFixed(2)})`);
        ok(r.end.tail<=-30 && r.end.after<1e-4, `${inst} ${set}: a note left to ring ends by itself without a click (${r.end.tail.toFixed(1)} dB at its end, then silence)`);
        ok(r.letgo.jump<=1.5 && r.letgo.gone<=-20, `${inst} ${set}: let go, it stops without a click (step ×${r.letgo.jump.toFixed(2)} of the note's own) and is gone (${r.letgo.gone.toFixed(1)} dB)`);
        if(r.letgo.noise) ok(r.letgo.hand>=-35 && r.letgo.hand<=-3 && r.noiseIn<=1.5, `${inst} ${set}: let go, the hand's sound plays, under the note it stops (${r.letgo.hand.toFixed(1)} dB), and none of its ${r.letgo.noise} noises comes in with a click (×${r.noiseIn.toFixed(2)})`);
        if(r.layers) ok(r.layers.v[0]<r.layers.v[1] && r.layers.hard-r.layers.soft>=3 && r.layers.files[1]>r.layers.files[0], `${inst} ${set}: a harder pluck plays the louder layer (layers ${r.layers.v.join(" → ")}; ${r.layers.soft} → ${r.layers.hard} dB; the recordings' own step ${r.layers.files.join(" → ")} dB)`);
        ok(new Set(r.takes).size>1 ? r.takes.every((x,i)=>i===0||x!==r.takes[i-1]) : true, `${inst} ${set}: the takes of a note come in turn: ${r.takes.join(" ")}`);
        if(r.mute) ok(/stac|mute/.test(r.mute.k) && r.mute.len<=1.2 && r.mute.down<=-12, `${inst} ${set}: a muted note plays a short recording (${r.mute.k}, ${r.mute.len} s) and dies fast (${r.mute.down} dB after 0.25 s)`);
        ok(r.bend.rec && Math.abs(r.bend.after-r.bend.before)<=10, `${inst} ${set}: a bend glides the recorded note up a whole step (${(200+r.bend.after-r.bend.before).toFixed(1)} cents; ${r.bend.before.toFixed(1)} c before, ${r.bend.after.toFixed(1)} c from the bent note after)`);
        ok(r.tap.rec && (r.tap.softTr<=r.tap.hardTr-6 || r.tap.softPk<=r.tap.hardPk-6), `${inst} ${set}: a tap or hammer-on starts without the pick: its first 3 ms against what follows, picked → tapped, the highs ${r.tap.hardTr} → ${r.tap.softTr} dB, the peak ${r.tap.hardPk} → ${r.tap.softPk} dB (four notes)`);
      }
      /* 6 · a picked bass sound on the fingered recordings: the pick's click at the pluck, none on a hammer-on */
      if(inst==="bass"){ const pc=await p.evaluate(async()=>{ const T=__T, id=Object.keys(SOUNDS).find(k=>SOUNDS[k].rclick); if(!id) return null; await loadSound(id);
          const one=async(sid, m, o)=>(await T.solo((oc,ch)=>makeVoice(oc,ch,sid,m,0.8,0.05,null,o), 0.5, 44100));
          const A={tr:[],pk:[]}, Fg={tr:[],pk:[]}, Sf={tr:[],pk:[]}; let rec=true;
          for(const m of [36,40,45,50]){ const a=await one(id,m), f=await one("finger",m), s=await one(id,m,{soft:true}); rec=rec && !!(a.out.rec && f.out.rec && s.out.rec);
            for(const [X,d] of [[A,a.d],[Fg,f.d],[Sf,s.d]]){ X.tr.push(T.onTr(d)); X.pk.push(T.onPk(d)); } }
          const mean=a=>+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
          return {id, pick:mean(A.tr), finger:mean(Fg.tr), soft:mean(Sf.tr), pickPk:mean(A.pk), softPk:mean(Sf.pk), rec, n:Object.keys(SOUNDS).filter(k=>SOUNDS[k].rclick).join(", ")}; });
        ok(pc && pc.rec && pc.pick>=pc.finger+6 && (pc.soft<=pc.pick-6 || pc.softPk<=pc.pickPk-6), `bass: a picked sound (${pc&&pc.n}) plays the fingered recordings with the pick's click at the pluck (the highs of the first 3 ms, fingers → pick: ${pc&&pc.finger} → ${pc&&pc.pick} dB), and a hammer-on on it without (${pc&&pc.soft} dB; the peak ${pc&&pc.pickPk} → ${pc&&pc.softPk} dB; four notes)`); }
      /* 10 · the slap sounds and the fretless slide (bass) */
      if(inst==="bass"){ const sl=await p.evaluate(async()=>{ const T=__T, out={};
          const band=(d,a,b,lo,hi)=>{ const s0=Math.floor(a*44100), L=Math.floor((b-a)*44100), N=1<<Math.ceil(Math.log2(L)), re=new Float64Array(N), im=new Float64Array(N);
            for(let i=0;i<L;i++) re[i]=(d[s0+i]||0)*(0.5-0.5*Math.cos(2*Math.PI*(i+0.5)/L)); T.fft(re,im,false);
            let q=0; for(let k=1;k<N/2;k++){ const f=k*44100/N; if(f>=lo && f<hi) q+=re[k]*re[k]+im[k]*im[k]; } return 10*Math.log10(q/(L*L)+1e-30); };
          const meas=async(id, m, s)=>{ await loadSound(id); let th=0, sn=0, fa=0, rec=true; for(let k=0;k<2;k++){ const n=await T.solo((oc,ch)=>makeVoice(oc,ch,id,m,0.8,0.05,s), 0.6, 44100); rec=rec && !!(n.out && n.out.rec);
              th+=band(n.d,0.05,0.065,30,300)-band(n.d,0.08,0.13,30,300); sn+=band(n.d,0.05,0.08,2000,20000)-band(n.d,0.1,0.2,20,20000); fa+=band(n.d,0.08,0.11,2000,20000)-band(n.d,0.05,0.08,2000,20000); }
            return {thump:+(th/2).toFixed(1), snap:+(sn/2).toFixed(1), fall:+(fa/2).toFixed(1), rec}; };
          const ids=Object.keys(SOUNDS).filter(k=>SOUNDS[k].rslap);
          out.ids=ids; out.finger={low:await meas("finger",36,0), high:await meas("finger",48,2)}; out.slap={};
          for(const id of ids) out.slap[id]={low:await meas(id,36,0), high:await meas(id,48,2)};
          /* a slide from A2 to D3 starting at 0.6 s: how far below the new note it still is 30 ms in, and where it lands */
          const slide=async(id)=>{ await loadSound(id); const n=await T.solo((oc,ch)=>{ const vc=makeVoice(oc,ch,id,45,0.8,0.05,null); vc.glide(50, 0.6); return vc; }, 1.4, 44100), f0=440*Math.pow(2,(50-69)/12);
            return {mid:+T.cents(n.d,44100,f0,0.625,0.635,0.005).toFixed(0), end:+T.cents(n.d,44100,f0,0.9,1.2,0.02).toFixed(1), rec:!!n.out.rec}; };
          out.slide={fretless:await slide("fretless"), finger:await slide("finger")};
          return out; });
        const bad=sl.ids.filter(id=>{ const r=sl.slap[id]; return !(r.low.rec && r.high.rec && r.low.thump>=sl.finger.low.thump+5 && r.high.snap>=sl.finger.high.snap+8 && r.high.fall<=-8); });
        ok(sl.ids.length===4 && !bad.length, `bass: the slap sounds (${sl.ids.join(", ")}) slap with a sharp low thump (the low end of the first 15 ms against what follows: fingers ${sl.finger.low.thump} dB, ${sl.ids.map(id=>id+" "+sl.slap[id].low.thump).join(", ")}) and pop with a bright snap that dies fast (the highs of the first 30 ms against the note: fingers ${sl.finger.high.snap} dB, ${sl.ids.map(id=>id+" "+sl.slap[id].high.snap+" then "+sl.slap[id].high.fall).join(", ")})${bad.length?" not: "+bad.join(" "):""}`);
        ok(sl.slide.fretless.rec && Math.abs(sl.slide.fretless.end)<=8 && Math.abs(sl.slide.finger.end)<=8 && sl.slide.fretless.mid<=sl.slide.finger.mid-60,
          `bass: a fretless slide sings over longer than a fretted one (30 ms in: ${sl.slide.fretless.mid} c from the new note, against ${sl.slide.finger.mid} c) and lands in tune (${sl.slide.fretless.end} c; fretted ${sl.slide.finger.end} c)`); }
      /* 11 · the synth sounds on the recorded organ (bass) */
      if(inst==="bass"){ const sy=await p.evaluate(async()=>{ const T=__T, out={tune:[]}; await loadSound("synth"); const R=REAL.sets.cosmo; if(!R || R.state!=="ready") return {err:1};
          for(const z of R.meta.zones){ const buf=R.buf[z.f], f0=440*Math.pow(2,(z.m-69)/12);
            const {d}=await T.solo((oc,ch)=>{ const s=oc.createBufferSource(); s.buffer=buf; s.playbackRate.value=recRate(z, z.m); s.connect(ch.amp); s.start(0, R.at[z.f]); }, Math.min(2.2, buf.duration), 44100);
            out.tune.push({f:z.f, c:+T.centsB(d,44100,f0,"sus").toFixed(1)}); }
          for(const id of ["synth","acid"]){ const m=36, n=await T.solo((oc,ch)=>{ const vc=makeVoice(oc,ch,id,m,0.8,0.05,null); vc.stop(6.2, 0.05); return vc; }, 6.6, 44100), d=n.d;
            const zl=R.meta.zones.find(z=>z.f===n.out.rec.f), per=(zl.lp[1]-zl.lp[0])/recRate(zl, m), seams=[];
            for(let t=0.05+(zl.lp[1]-R.at[zl.f]+R.lead[zl.f])/recRate(zl,m); t<6; t+=per) seams.push(t);
            let own=0; for(let i=Math.round(2*44100);i<Math.round(2.5*44100);i++) own=Math.max(own, Math.abs(d[i]-d[i-1]));
            let jump=0; seams.forEach(t=>{ const c=Math.round(t*44100); for(let i=c-30;i<c+30;i++) jump=Math.max(jump, Math.abs(d[i]-d[i-1])); });
            const cen=(a,b)=>{ const s0=Math.floor(a*44100), L=Math.floor((b-a)*44100), N=1<<Math.ceil(Math.log2(L)), re=new Float64Array(N), im=new Float64Array(N); for(let i=0;i<L;i++) re[i]=d[s0+i]*(0.5-0.5*Math.cos(2*Math.PI*(i+0.5)/L)); T.fft(re,im,false); let q=0,w=0; for(let k=1;k<N/2;k++){ const e=re[k]*re[k]+im[k]*im[k]; q+=e; w+=e*k*44100/N; } return w/q; };
            /* the thump: the octave under the note (G2), in the first 100 ms against later */
            const band=(x,a,b,lo,hi)=>{ const s0=Math.floor(a*44100), L=Math.floor((b-a)*44100), N=1<<Math.ceil(Math.log2(L)), re=new Float64Array(N), im=new Float64Array(N);
              for(let i=0;i<L;i++) re[i]=(x[s0+i]||0)*(0.5-0.5*Math.cos(2*Math.PI*(i+0.5)/L)); T.fft(re,im,false);
              let q=0; for(let k=1;k<N/2;k++){ const f=k*44100/N; if(f>=lo && f<hi) q+=re[k]*re[k]+im[k]*im[k]; } return 10*Math.log10(q/(L*L)+1e-30); };
            const g2=await T.solo((oc,ch)=>{ const vc=makeVoice(oc,ch,id,43,0.8,0.05,null); vc.stop(1.2,0.05); return vc; }, 1.4, 44100), fg=440*Math.pow(2,(43-69)/12);
            const thump=+(band(g2.d,0.05,0.15,15,0.75*fg)-band(g2.d,0.4,0.5,15,0.75*fg)).toFixed(1);
            out[id]={thump, rec:!!n.out.rec, loop:!!n.out.rec.loop, held:+T.db(T.rms(d,44100,4.8,5.8)/(T.rms(d,44100,0.8,1.8)||1e-9)).toFixed(1), seams:seams.length, jump:+(jump/(own||1e-9)).toFixed(2),
              growl:+(cen(0.05,0.09)/cen(0.4,0.6)).toFixed(2), sub:+T.db(T.rms(d,44100,0.05,0.08)/(T.rms(d,44100,0.4,0.6)||1e-9)).toFixed(1)}; }
          return out; });
        const off=(sy.tune||[]).filter(x=>!(Math.abs(x.c)<=5));
        ok(!sy.err && sy.tune.length===38 && !off.length, `bass cosmo: all ${sy.tune&&sy.tune.length} organ notes in tune within ±5 cents ${off.map(x=>x.f+" "+x.c).join(" ")}`);
        for(const id of ["synth","acid"]){ const r=sy[id]||{};
          ok(r.rec && r.loop && Math.abs(r.held)<=3 && r.seams>=1 && r.jump<=1.5 && r.growl>=1.2 && (id!=="synth" || r.thump>=10), `bass ${id}: plays the recorded organ, a held note keeps sounding (${r.held} dB at 5 s against 1 s), its loop comes round ${r.seams} times with no click (×${r.jump} of its own steps), and the filter still closes (the first 40 ms ×${r.growl} brighter)${id==="synth"?"; it thumps (the octave under the note "+r.thump+" dB stronger in its first 100 ms than later)":""}`); } }
      /* 6 · the hand's sound sits under the note it stops, through each sound's own amp (a driven amp lifts it as much as the
         notes; rrel keeps it down): the mean over the set's noises, the same take of the note each time */
      { const hs=await p.evaluate(async()=>{ const T=__T, out=[];
          const render=async(id, rel, k)=>{ S.sound=id; const R=REAL.sets[recOf(id)], N=R.noise.length; R.rr={}; if(N) R.rr.rel=((k||0)-1+N)%N;
            const sr=44100, oc=new OfflineAudioContext(2, sr*1.6, sr); await AOGAmp.load(oc); const ch=makeChain(oc);
            ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0); ch.send.gain.value=0; ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
            const m=GTR?52:bassRoot({off:0,q:"maj"}), cl=GTR?{s:1}:cellFor(m), vc=makeVoice(oc,ch,id,m,0.8,0.05,cl.s); vc.stop(0.65, 0.02, rel?{rel:true}:undefined);
            const bb=await oc.startRendering(), L=bb.getChannelData(0), Rr=bb.getChannelData(1), d=new Float32Array(L.length); for(let i=0;i<d.length;i++) d[i]=(L[i]+Rr[i])/2; return d; };
          for(const id of Object.keys(SOUNDS).filter(k=>SOUNDS[k].rec)){ await loadSound(id); const R=REAL.sets[recOf(id)]; if(!R || R.state!=="ready"){ out.push({id, err:1}); continue; }
            const N=R.noise.length; if(!N) continue;
            const a=await render(id, false), at=T.db(T.rms(a,44100,0.55,0.64)); let s=0;
            for(let k=0;k<N;k++){ const h=await render(id, true, k), n=new Float32Array(a.length); for(let i=0;i<a.length;i++) n[i]=h[i]-a[i]; s+=T.db(T.rms(n,44100,0.65,0.85))-at; }
            out.push({id, rel:+(s/N).toFixed(1)}); }
          return out; });
        const loud=hs.filter(x=>x.err || x.rel>-7.5), top=hs.reduce((a,x)=>x.rel>a.rel?x:a, {rel:-99});
        ok(hs.length && !loud.length, `${inst}: let go, the hand's sound sits under the note on all ${hs.length} recorded sounds with one, through their own amps (loudest: ${top.id} ${top.rel} dB)${loud.map(x=>" "+x.id+" "+(x.err?"did not load":x.rel+" dB")).join("")}`); }
      /* 6 · Solo mode: a hammer-on on a ringing recorded note is no new pick */
      const hm=await p.evaluate(async()=>{ if(!window.AOGSolo) return null; AOGSolo.setMode("solo");
        if(!SOUNDS[S.sound].rec){ const sel=document.getElementById("soundSel"); sel.value=Object.keys(SOUNDS).find(k=>SOUNDS[k].rec); sel.onchange(); }   /* the bass's lead sound (slap) is made on the page */
        await loadSound(S.sound); ctx();
        window.__n=[]; const mv=window.makeVoice; window.makeVoice=function(cx){ const vc=mv.apply(this,arguments); if(cx===ac) window.__n.push(vc&&vc.vc?vc.vc.rec:vc&&vc.rec); return vc; };
        const F=AOGSolo._t.FING, s=GTR?2:1, f=5, e1={pointerId:91, clientY:0}, e2={pointerId:92, clientY:0};
        AOGSolo.down(e1, {zone:"fret", s, f}); await new Promise(r=>setTimeout(r,60));
        AOGSolo.down(e2, {zone:"fret", s, f:f+2}); await new Promise(r=>setTimeout(r,60));
        const res={picks:__n.length, rec:!!(__n[0]), fret:STR_LIVE[s]&&STR_LIVE[s].f, sound:S.sound};
        AOGSolo.up(e2); AOGSolo.up(e1); window.makeVoice=mv; AOGSolo.setMode("chords"); return res; });
      if(hm) ok(hm.picks===1 && hm.rec && hm.fret===7, `${inst}: Solo mode (${hm.sound}, recorded): a second finger higher on the ringing string hammers on, no new pick (${hm.picks} pick, now fret ${hm.fret})`);
      ok(!errs.length, `${inst}: no page errors ${errs.slice(0,3).join(" | ")}`);
      await c.close(); }

    /* ── 7 · every note on time, whatever the decoder does with the gapless header ── */
    { const results={};
      for(const mode of ["read","ignored"]){
        const {c, p, errs}=await open(b, inst);
        await p.goto(`http://localhost:9917/music-${inst}.html`); await p.waitForTimeout(300); await p.addScriptTag({content:LIB});
        results[mode]=await p.evaluate(async([mode,id])=>{
          await loadSound(id); delete REAL.sets[SOUNDS[id].rec];          /* each run decodes the set afresh (the page may have loaded it already) */
          if(mode==="ignored"){
            /* as a decoder that does not read the header: the encoder's lead-in (delay + 529 samples, with the pluck's own
               pre-echo in it, here as loud as -23 dB under the note) in front, the padding behind */
            const dw=window.decodeWith; window.__leads=[];
            window.decodeWith=async function(dec, ab){ const gl=mp3Gapless(ab), bb=await dw(dec, ab); if(!gl) return bb;
              const lead=gl.delay+529, tail=Math.max(0, gl.pad-529), d0=bb.getChannelData(0); let pk=0; for(const x of d0) pk=Math.max(pk,Math.abs(x));
              const nb=new AudioBuffer({length:bb.length+lead+tail, numberOfChannels:1, sampleRate:bb.sampleRate}), d=nb.getChannelData(0), r=seeded(lead+bb.length);
              for(let i=0;i<lead;i++) d[i]=r()*pk*0.07*Math.pow(i/lead, 3);
              d.set(d0, lead); window.__leads.push(lead); return nb; };
          }
          const T=__T; await loadSound(id); const R=REAL.sets[SOUNDS[id].rec]; if(!R || R.state!=="ready") return {err:"did not load"};
          const ats=Object.values(R.at), times=[];
          for(const z of R.by.sus.filter((z,i)=>i%3===0)){ const n=await T.solo((oc,ch)=>makeVoice(oc,ch,id,z.m,0.8,0.1,z.s==null?null:z.s), 0.4, 44100); times.push(T.onset(n.d, 0.02)); }
          return {ats:[Math.min(...ats), Math.max(...ats)], times, leads:window.__leads?[Math.min(...window.__leads), Math.max(...window.__leads)]:null}; }, [mode, Object.values(BY[inst])[0]]);
        ok(!errs.length, `${inst} (${mode}): no page errors ${errs.slice(0,3).join(" | ")}`);
        await c.close(); }
      const a=results.read, z=results.ignored;
      ok(!a.err && !z.err && a.times.length && a.times.every((t,i)=>Math.abs(t-z.times[i])<=1),
        `${inst}: every note lands on the same sample whether the decoder reads the gapless header or keeps its ${z.leads&&z.leads[0]}-sample lead-in (onsets ${a.times.slice(0,6).join(",")} vs ${z.times.slice(0,6).join(",")}; the page starts the files at ${(a.ats[0]*1000).toFixed(1)}–${(a.ats[1]*1000).toFixed(1)} ms vs ${(z.ats[0]*1000).toFixed(1)}–${(z.ats[1]*1000).toFixed(1)} ms)`);
      ok(!a.err && a.times.every(t=>t>=0.1*44100-1 && t<=0.1*44100+Math.round(0.004*44100)), `${inst}: and on time: each pluck sounds within 4 ms after it was asked for (${a.times.map(t=>((t/44100-0.1)*1000).toFixed(1)).slice(0,8).join(", ")} ms)`); }

    /* ── 8 · a phone ── */
    { const {c, p, errs}=await open(b, inst, {viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:3});
      await p.route(/\/audio\/(guitar|bass)\/.*\.mp3/, async r=>{ await new Promise(ok=>setTimeout(ok,1500)); r.continue(); });
      await p.addInitScript(()=>{ try{ localStorage.setItem("aog.lang","es"); }catch(e){} });
      await p.goto(`http://localhost:9917/music-${inst}.html`); await p.waitForTimeout(600);
      const lay=await p.evaluate(()=>{ const l=document.getElementById("loadLine"), r=l.getBoundingClientRect(); return {over:document.documentElement.scrollWidth-innerWidth, right:r.right, w:innerWidth, text:l.textContent}; });
      ok(lay.over<=1 && lay.right<=lay.w, `${inst}: on a 390 px phone, no sideways scroll (${lay.over} px) and the line fits ("${lay.text}")`);
      ok(!errs.length, `${inst} (phone): no page errors ${errs.slice(0,3).join(" | ")}`);
      await c.close(); }

    /* ── 9 · Solo mode's band on the recorded sets ── */
    for(const prof of inst==="guitar" ? ["roomy","phone"] : ["roomy"]){
      const lang=inst==="bass" ? "es" : "en", {c, p, errs}=await open(b, inst), got=[];
      p.on("request", q=>{ const m=q.url().match(/\/audio\/(guitar|bass)\/([^/]+)\//); if(m) got.push(m[1]+"/"+m[2]); });
      await p.addInitScript(([dm, l])=>{ try{ Object.defineProperty(Navigator.prototype, "deviceMemory", {get:()=>dm, configurable:true}); }catch(e){} try{ localStorage.setItem("aog.lang", l); }catch(e){} }, [prof==="phone"?2:8, lang]);
      let hold=false; await p.route(/\/audio\/(guitar|bass)\/.*\.mp3/, async r=>{ while(hold) await new Promise(ok=>setTimeout(ok,50)); r.continue(); });
      await p.goto(`http://localhost:9917/music-${inst}.html`); await p.waitForTimeout(500);
      /* Solo mode; on the phone, a lead on the other guitar (black): its set, the band's guitar and its bass would be three */
      const lead=await p.evaluate(async(prof)=>{
        if(prof==="phone"){ const sel=document.getElementById("soundSel"); sel.value="shred"; sel.onchange(); }
        AOGSolo.setMode("solo"); await loadSound(S.sound); return {sound:S.sound, set:recOf(S.sound), room:REAL.room}; }, prof);
      await p.waitForTimeout(300);
      const before=[...new Set(got)];
      hold=true; await p.click("#soBand"); await p.waitForTimeout(400);
      const during=await p.evaluate(()=>{ const X=AOGSolo._t, el=document.getElementById("soBandLoad"), vs=X.BAND.voices.filter(v=>v.kind);
        return {line:el.hidden?"":el.textContent, plan:X.BAND.plan, made:{gtr:vs.filter(v=>v.kind==="gtr" && !v.rec).length, bass:vs.filter(v=>v.kind==="bass" && !v.rec).length},
          rec:{gtr:vs.filter(v=>v.kind==="gtr" && v.rec).length, bass:vs.filter(v=>v.kind==="bass" && v.rec).length}}; });
      hold=false;
      await p.waitForFunction(()=>{ const pl=AOGSolo._t.BAND.plan; return pl && [pl.gtr, pl.bass].filter(Boolean).every(id=>REAL.sets[id] && REAL.sets[id].state==="ready"); }, null, {timeout:60000});
      await p.waitForTimeout(3500);
      const after=await p.evaluate(()=>{ const X=AOGSolo._t, now=ac.currentTime, vs=X.BAND.voices.filter(v=>v.kind && v.end>now), el=document.getElementById("soBandLoad");
        return {gtrRec:vs.filter(v=>v.kind==="gtr" && v.rec).length, gtrMade:vs.filter(v=>v.kind==="gtr" && !v.rec).length, bassRec:vs.filter(v=>v.kind==="bass" && v.rec).length, bassMade:vs.filter(v=>v.kind==="bass" && !v.rec).length,
          line:el.hidden?"":el.textContent, sets:Object.keys(REAL.sets).filter(k=>REAL.sets[k].state==="ready")}; });
      await p.evaluate(()=>{ AOGSolo._t.bandStop(); AOGSolo.setMode("chords"); }); await p.waitForTimeout(300);
      const left=await p.evaluate(()=>({sets:Object.keys(REAL.sets), pin:REAL.pin.length}));
      const want=lang==="es" ? "Preparando la banda grabada…" : "Getting the recorded band ready…", bassSet=inst==="guitar" && prof==="roomy" ? "bass/growly" : null;
      const gset=(inst==="guitar"?"":"guitar/")+"green", fetched=[...new Set(got)], bandOnly=inst==="bass"||prof==="phone" ? ["guitar/green"] : ["bass/growly"];
      ok(bandOnly.every(x=>before.indexOf(x)<0 && fetched.indexOf(x)>=0) && (prof==="phone" ? fetched.indexOf("bass/growly")<0 : true),
        `${inst} (${prof}, room for ${lead.room} sets): the band's sets come down only when Play is pressed (before: ${before.join(", ")}; then: ${fetched.filter(x=>before.indexOf(x)<0).join(", ")||"none new"}), the lead on ${lead.sound} (${lead.set||"made"})`);
      ok(during.plan && during.plan.gtr===gset && during.plan.bass===bassSet, `${inst} (${prof}): the band's guitar plays the green set${inst==="guitar"?(bassSet?", its bass the recorded bass":", its bass the made string (three sets would not fit)"):""} (${JSON.stringify(during.plan)})`);
      ok(during.line===want && (during.made.gtr+during.made.bass)>0, `${inst} (${prof}, ${lang}): while they load, the made strings play (${during.made.gtr} guitar, ${during.made.bass} bass notes) and one calm line says "${during.line}"`);
      ok(after.gtrRec>0 && after.line==="" && (bassSet ? after.bassRec>0 : after.bassRec===0) && after.sets.length<=lead.room,
        `${inst} (${prof}): once in, the band plays them (guitar ${after.gtrRec} recorded, ${after.gtrMade} made; bass ${after.bassRec} recorded, ${after.bassMade} made), the line is gone, ${after.sets.length} sets in memory (${after.sets.join(", ")})`);
      ok(left.pin===0 && left.sets.indexOf("bass/growly")<0 && left.sets.indexOf("guitar/green")<0, `${inst} (${prof}): out of Solo mode the band's sets are let go (left: ${left.sets.join(", ")})`);
      ok(!errs.length, `${inst} (${prof}, band): no page errors ${errs.slice(0,3).join(" | ")}`);
      await c.close(); }
    /* the band on the recordings sits where the made band did (each style, the whole band, K-weighted), and each set's
       decoded memory */
    { const {c, p, errs}=await open(b, inst);
      await p.goto(`http://localhost:9917/music-${inst}.html`); await p.waitForTimeout(500);
      await p.addScriptTag({content:MEASURE});
      const lv=await p.evaluate(async(inst)=>{ const X=AOGSolo._t, out={styles:{}, mem:{}};
        for(const style of ["straight","minor","rock","boogie","mblues","metal"]){ const a=await X.renderBand(2, {style}), r=await X.renderBand(2, {style, real:true});
          out.styles[style]={made:+__kw(a.buf).toFixed(2), rec:+__kw(r.buf).toFixed(2), recNotes:r.rec}; }
        for(const id of inst==="guitar" ? ["green","black","steel","nylon","bass/growly"] : ["growly","upright","ergo","cosmo"]){ await recLoad(id); const R=REAL.sets[id]; out.mem[id]=R && R.state==="ready" ? +(recBytes(R)/1048576).toFixed(1) : null; }
        return out; }, inst);
      const bad=Object.entries(lv.styles).filter(([k,x])=>Math.abs(x.rec-x.made)>1 || !x.recNotes);
      ok(!bad.length, `${inst}: the band on the recordings is as loud as the made band, within 1 dB, in every style (${Object.entries(lv.styles).map(([k,x])=>k+" "+x.made+" → "+x.rec).join("; ")} dB)`);
      console.log(`     ${inst}: each set's decoded memory: ${Object.entries(lv.mem).map(([k,v])=>k+" "+v+" MB").join(", ")}`);
      ok(Object.values(lv.mem).every(v=>v>0 && v<45), `${inst}: every set decodes, each under 45 MB`);
      ok(!errs.length, `${inst} (band levels): no page errors ${errs.slice(0,3).join(" | ")}`);
      await c.close(); }
  }
  console.log(fails?fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
