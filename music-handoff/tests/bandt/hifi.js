/* AOG-BAND-HIFI-V1 (2026-10-23) — every Band player made again from its original recordings at 44.1 kHz
   (music-handoff/tools/band/hifi.py). Each recording the page plays, played at its own note with the page's tuning
   correction, rendered offline through the Band's own chain (the room, the tone, the compressor, the limiter):
   · the page fetches it from its new folder (<dir>/hq) and decodes it at 44.1 kHz, stereo where the source is;
   · treble (the room dry, before the master compressor and limiter, the recording at its own speed): where the source's
     sound within 60 dB of its strongest reaches 16.5 kHz, the rendered note's sound (within 75 dB) reaches past 16 kHz
     and no lower than the old file's; where the source has less up there, the note is not cut short of the source's own
     plain treble (the old 32 kHz files stopped at 13.5 to 15 kHz, and could not pass 16);
   · tuning: within ±2 cents of its note, measured as the builders measure (tune.py, by hifi_tune.py), before the master
     compressor (it rides a pluck's decay, which moves where tune.py's windows fall);
   · loops: every held recording's loop, played round twice, has no sample-to-sample jump at a seam larger than the note's
     own largest away from the seams, on either channel (no click), and loops 0.9 to 2.7 s of its steady part;
   · levels: each recording within 0.5 dB of the file it replaces (K-weighted, loudest 400 ms, before the compressor, as
     bandt/level.js measures, under 15.5 kHz where the old file has sound too: the treble added is the gain, not a change
     of level), so every trim the page holds stays true; a player's notes within 0.25 dB in the middle;
   · nothing else moved: the hq folder has exactly the files the old one had, each about as long;
   · the bagpipes are left as they were (their source is a 128 kbps preview).
     node music-handoff/tests/bandt/hifi.js [player,player]     Port 9462. About 10 minutes for all. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path"), os=require("os"), cp=require("child_process");
const srv=require("../srv.js")(9462);
const MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
const ROOT=process.env.AOG_ROOT||path.resolve(__dirname,"../../../aog-deploy");
const REP=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../tools/band/hifi_report.json"),"utf8"));
const MAN=JSON.parse(fs.readFileSync(path.join(ROOT,"audio/band/manifest.json"),"utf8"));
const ONLY=process.argv[2] ? process.argv[2].split(",") : null;
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const PLAYERS=Object.keys(MAN).filter(p=>/\/hq$/.test(MAN[p].dir||"") && (!ONLY || ONLY.indexOf(p)>=0));
const SRC={}; REP.notes.forEach(r=>{ SRC[r.player+"/"+r.key]=r; });
const REACH=16500;   /* a source whose sound within 60 dB of its strongest reaches this high (hifi_report.json src_air): plain treble, which an
                       MP3 at 128 kbps a channel keeps past 16 kHz (fainter air, 60 to 75 dB down, the encoder may leave out as unheard) */
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),"aog-hifi-"));
/* where the treble stops: the highest frequency at which the long-term spectrum (8192-point frames, half overlapped, Hann)
   is within 75 dB of its strongest part, each channel on its own, the higher of the two (hifi.py's treble()); and how much
   sound there is from 16 to 20 kHz, in dB against 1 to 8 kHz, the channels together (a 32 kHz file has none: only what
   resampling leaves, far down) */
const TREBLE=`
window.__treble=function(buf){
  const N=8192, sr=buf.sampleRate, L=buf.length, chs=buf.numberOfChannels;
  const win=new Float64Array(N); for(let i=0;i<N;i++) win[i]=0.5-0.5*Math.cos(2*Math.PI*i/(N-1));
  const re=new Float64Array(N), im=new Float64Array(N), f=k=>k*sr/N; let t=0, lo=0, hi=0;
  const fft=(re,im)=>{ const n=re.length; for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; } }
    for(let len=2;len<=n;len<<=1){ const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a); for(let i=0;i<n;i+=len){ let cr=1, ci=0; for(let k=0;k<len/2;k++){ const ur=re[i+k], ui=im[i+k], vr=re[i+k+len/2]*cr-im[i+k+len/2]*ci, vi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;
      re[i+k]=ur+vr; im[i+k]=ui+vi; re[i+k+len/2]=ur-vr; im[i+k+len/2]=ui-vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } };
  for(let c=0;c<chs;c++){ const d=buf.getChannelData(c), m=new Float64Array(Math.max(L,N)), P=new Float64Array(N/2+1); m.set(d);
    for(let a=0;a+N<=m.length;a+=N/2){ for(let i=0;i<N;i++){ re[i]=m[a+i]*win[i]; im[i]=0; } fft(re,im); for(let k=0;k<=N/2;k++) P[k]+=re[k]*re[k]+im[k]*im[k]; }
    let top=-1e30; for(let k=0;k<=N/2;k++){ if(f(k)>40 && P[k]>top) top=P[k]; if(f(k)>=1000 && f(k)<8000) lo+=P[k]; if(f(k)>=16000 && f(k)<20000) hi+=P[k]; }
    for(let k=N/2;k>=0;k--) if(f(k)>40 && P[k]>top*Math.pow(10,-7.5)){ t=Math.max(t, f(k)); break; } }
  return {top:t, band:10*Math.log10((hi+1e-30)/(lo+1e-30))};
};`;
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}});
  await c.addInitScript(()=>{ try{ localStorage.setItem("aog.lang","en"); localStorage.removeItem("aog.band.v1"); localStorage.removeItem("aog.band.fx.v1"); }catch(e){} });
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.exposeFunction("__save", (name, b64)=>{ fs.writeFileSync(path.join(TMP, name), Buffer.from(b64, "base64")); });
  await p.goto("http://localhost:9462/music-band.html"); await p.waitForTimeout(1200);
  await p.addScriptTag({content:MEASURE}); await p.addScriptTag({content:TREBLE});
  ok(await p.evaluate(()=>/new OC\(1, 1, 44100\)/.test(loadInst.toString())), "the page decodes the Band's recordings at 44.1 kHz");
  ok(!PLAYERS.includes("bagpipe") && !/hq/.test(MAN.bagpipe.dir||"") && !/hq/.test(MAN.bagpipe_drones.dir||""), "the bagpipes are left as they were (their source is a 128 kbps preview)");
  const index=[], rows={};
  for(const inst of PLAYERS){
    const man=MAN[inst], dir=man.dir, old=dir.replace(/\/hq$/,"");
    /* the same files, each about as long */
    const have=fs.readdirSync(path.join(ROOT,"audio/band",dir)).filter(f=>f.endsWith(".mp3")).sort(), was=fs.readdirSync(path.join(ROOT,"audio/band",old)).filter(f=>f.endsWith(".mp3")).sort();
    ok(JSON.stringify(have)===JSON.stringify(was), `${inst}: ${dir} holds exactly the ${was.length} files ${old} had`);
    const r=await p.evaluate(async({inst, old})=>{
      performance.setResourceTimingBufferSize(20000); performance.clearResourceTimings();
      Object.keys(SETS).forEach(k=>delete SETS[k]);   /* fetched afresh: a group loaded before (the percussion) may hold this player */
      const sound=inst==="kit" ? "percussion" : inst; S.sound=sound; await loadSound(sound);
      const set=SETS[setKey(inst, sound)], keys=Object.keys(set.buf).sort(), sr=44100, out={keys, notes:{}, left:leftOnly(setKey(inst, sound))};
      out.urls=performance.getEntriesByType("resource").map(e=>e.name).filter(u=>u.indexOf("/audio/band/")>=0).map(u=>u.slice(u.indexOf("/audio/band/")+12));
      const OC=window.OfflineAudioContext, dec=new OC(1,1,44100);
      /* the file it replaces (a vibrato player's short notes are the plain player's: stacDir) */
      const oldDir=k=>k.slice(-1)==="t" && MAN[inst].stacDir ? MAN[MAN[inst].stacDir].dir.replace(/\/hq$/,"") : old;
      const oldBuf=async(k)=>{ const ab=await (await fetch("/audio/band/"+oldDir(k)+"/"+k+".mp3")).arrayBuffer(); return decodeWith(dec, ab); };
      const rateOf=k=>Math.pow(2, -((MAN[inst].tune||{})[k]||0)/1200);
      /* one recording through the chain, the Room knob dry (as levels/even.js plays): "tune" the whole chain with the page's
         tuning correction, from the file's own first sample (so tune.py reads the very samples the builder read: a short
         note's pitch moves in its first moments, and where the windows fall moves its reading); "treble" the room's sound
         before the master compressor and limiter, the recording at its own speed (Web Audio's own resampling, which every
         browser does its own way, is not the recording's); "level" before the compressor (bandt/level.js) */
      const render=async(buf, k, how, secs)=>{
        const oc=new OC(2, Math.ceil(sr*secs), sr), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch, sound); setEra(ch,0,0);
        if(how==="level"){ ch.pre.disconnect(); ch.master.disconnect();   /* under 15.5 kHz (an eighth-order Butterworth), where the old file has sound too */
          let at=ch.pre; [0.5098,0.6013,0.9000,2.5629].forEach(q=>{ const f=new BiquadFilterNode(oc, {type:"lowpass", frequency:15500, Q:20*Math.log10(q)});   /* a lowpass's Q is in dB in Web Audio */ at.connect(f); at=f; }); at.connect(oc.destination); }
        ch.send.gain.value=0;
        if(how==="treble" || how==="tune"){ ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); }   /* the room's sound before its master compressor and limiter, which add overtones of their own and ride a pluck's decay (where tune.py's windows fall) */
        const s=oc.createBufferSource(); s.buffer=buf; s.playbackRate.value=how==="treble" ? 1 : rateOf(k); const g=oc.createGain(); g.gain.value=0.6; s.connect(g); g.connect(ch.bus); g.connect(ch.send);
        s.start(0.05, how==="treble" ? (set.start[k]||0) : 0); return oc.startRendering(); };
      const i16=(d,n)=>{ const a=new Int16Array(n); for(let i=0;i<n;i++) a[i]=Math.max(-32767, Math.min(32767, Math.round(d[i]*32767))); let s=""; const u=new Uint8Array(a.buffer); for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null, u.subarray(i,i+0x8000)); return btoa(s); };
      for(const k of keys){
        const buf=set.buf[k], kind=k.slice(-1), secs=kind==="t" ? 1.2 : 3.0, o={sr:buf.sampleRate, ch:buf.numberOfChannels, dur:buf.duration};
        const full=await render(buf, k, "tune", secs), ob=await oldBuf(k);
        o.treble=__treble(await render(buf, k, "treble", secs)); o.trebleOld=__treble(await render(ob, k, "treble", secs));
        /* the first 2.6 s (0.8 s of a short note), each channel the note has, for tune.py */
        const n=Math.min(full.length, Math.floor(sr*(kind==="t" ? 0.8 : 2.6))), off=Math.floor(0.05*sr), files=[];
        for(let c2=0;c2<buf.numberOfChannels;c2++){ const nm=inst+"_"+k+"_"+c2+".i16"; await window.__save(nm, i16(full.getChannelData(c2).subarray(off), n-off)); files.push(nm); }
        o.files=files;
        /* the level as hifi.py matched it: the loudest 400 ms of the first 2.6 s from the file's own start */
        const cut=b=>{ const n=Math.min(b.length, Math.floor(sr*2.65)), c2=new AudioBuffer({numberOfChannels:b.numberOfChannels, length:n, sampleRate:sr}); for(let i=0;i<b.numberOfChannels;i++) c2.copyToChannel(b.getChannelData(i).subarray(0,n), i); return c2; };
        o.kw=__kw(cut(await render(buf, k, "level", secs))); o.kwOld=__kw(cut(await render(ob, k, "level", secs))); o.oldDur=ob.duration;
        /* the loop, round twice, on its own (straight out, no chain: a click shows plainest there) */
        const lp=set.loop[k];
        if(lp && (set.start[k]||0)<lp[0]){
          const per=lp[1]-lp[0], first=0.05+(lp[1]-(set.start[k]||0)), len=first+2*per+0.3;
          const oc=new OC(buf.numberOfChannels, Math.ceil(sr*len), sr), s=oc.createBufferSource(); s.buffer=buf; s.loop=true; s.loopStart=lp[0]; s.loopEnd=lp[1]; s.connect(oc.destination); s.start(0.05, set.start[k]||0);
          const rb=await oc.startRendering(), seams=[first, first+per], res=[];
          for(let c2=0;c2<rb.numberOfChannels;c2++){ const d=rb.getChannelData(c2);
            const jump=(a,z)=>{ let x=0; for(let i=Math.max(1,Math.floor(a*sr));i<Math.min(d.length,Math.floor(z*sr));i++) x=Math.max(x, Math.abs(d[i]-d[i-1])); return x; };
            const bend=(a,z)=>{ let x=0; for(let i=Math.max(2,Math.floor(a*sr));i<Math.min(d.length,Math.floor(z*sr));i++) x=Math.max(x, Math.abs(d[i]-2*d[i-1]+d[i-2])); return x; };
            const norm=Math.max(jump(0.6, first-0.25), jump(first+0.25, first+per-0.25)), nb=Math.max(bend(0.6, first-0.25), bend(first+0.25, first+per-0.25));
            res.push({norm, nb, worst:Math.max(...seams.map(t=>jump(t-0.003, t+0.003))), wb:Math.max(...seams.map(t=>bend(t-0.003, t+0.003)))}); }
          o.loop={len:per, ch:res};
        }
        out.notes[k]=o;
      }
      return out; }, {inst, old});
    rows[inst]=r;
    const ns=Object.values(r.notes), src={}; r.keys.forEach(k=>{ src[inst+"/"+k]=SRC[inst+"/"+k] || (man.stacDir && SRC[man.stacDir+"/"+k]) || {}; });
    const mine=r.urls.filter(u=>u.indexOf(dir+"/")===0 || u.indexOf(old+"/")===0);
    ok(mine.length>0 && mine.every(u=>u.indexOf(dir+"/")===0) && !r.urls.some(u=>Object.keys(MAN).some(q=>/\/hq$/.test(MAN[q].dir||"") && u.indexOf(MAN[q].dir.replace(/\/hq$/,"")+"/")===0 && u.indexOf(MAN[q].dir+"/")!==0)),
      `${inst}: every recording comes from ${dir}/, none from an old folder (${mine.length} files)`);
    const stereo=REP.notes.filter(x=>x.player===inst).some(x=>x.ch===2);
    ok(ns.every(o=>o.sr===44100) && ns.every(o=>o.ch===(stereo && !r.left ? 2 : 1)), `${inst}: decoded at 44.1 kHz, ${stereo?"stereo":"one channel"} as its source`);
    const LONG=/^voice_/.test(inst) ? 0.15 : 0.06;   /* the voices are made again by PSOLA, whose grains fall elsewhere at 44.1 kHz (hifi.py REMADE) */
    ok(r.keys.every(k=>Math.abs(r.notes[k].dur-r.notes[k].oldDur)<LONG), `${inst}: every recording as long as before (within ${LONG*1000} ms)`);
    /* treble */
    const tb=r.keys.map(k=>{ const s0=src[inst+"/"+k]||{}; return {k, t:r.notes[k].treble.top, was:Math.min(16000, r.notes[k].trebleOld.top), band:r.notes[k].treble.band, bandOld:r.notes[k].trebleOld.band, s:s0.src_treble||0, air:s0.src_air||0}; });
    tb.forEach(x=>{ x.gain=x.band-x.bandOld; });
    const reach=tb.filter(x=>x.air>=REACH), short=tb.filter(x=>x.air<REACH);
    const bad=reach.filter(x=>x.t<16000 || x.t<x.was-200).concat(short.filter(x=>x.t<Math.min(x.air,16000)-2000));
    const med=a=>a.length ? a.slice().sort((x,y)=>x-y)[a.length>>1] : 0;
    ok(bad.length===0, `${inst}: through the chain, past 16 kHz on all ${reach.length} notes whose source has plain treble (within 60 dB) past ${REACH/1000} kHz (median ${Math.round(med(reach.map(x=>x.t)))} Hz, the old file ${Math.round(med(reach.map(x=>x.was)))} Hz; 16 to 20 kHz ${med(reach.map(x=>x.band)).toFixed(0)} dB against 1 to 8 kHz, the old file ${med(reach.map(x=>x.bandOld)).toFixed(0)})`+(short.length ? `; ${short.length} whose source has less up there keep the source's plain treble (median ${Math.round(med(short.map(x=>x.t)))} Hz, the source's within 60 dB ${Math.round(med(short.map(x=>x.air)))} Hz)` : "")+(bad.length ? " BAD "+JSON.stringify(bad.slice(0,6).map(x=>({k:x.k, t:Math.round(x.t), was:Math.round(x.was), band:+x.band.toFixed(1), src:x.s, air:x.air}))) : ""));
    /* levels */
    const dl=r.keys.map(k=>({k, d:r.notes[k].kw-r.notes[k].kwOld}));
    const worst=dl.reduce((a,x)=>Math.abs(x.d)>Math.abs(a.d)?x:a, {d:0}), mid=med(dl.map(x=>x.d));
    ok(Math.abs(worst.d)<=0.5 && Math.abs(mid)<=0.25, `${inst}: every recording within 0.5 dB of the file it replaces (widest ${worst.k||"-"} ${worst.d.toFixed(2)} dB, middle ${mid.toFixed(2)} dB)`);
    /* loops */
    const lps=r.keys.filter(k=>r.notes[k].loop), clicks=lps.filter(k=>r.notes[k].loop.ch.some(x=>x.worst>x.norm*1.0001 || x.wb>x.nb*1.0001));
    const lens=lps.map(k=>r.notes[k].loop.len);
    if(lps.length) ok(!clicks.length && lens.every(x=>x>=0.9 && x<=2.7), `${inst}: ${lps.length} loops, each played round twice: no click at a seam on any channel; each ${Math.min(...lens).toFixed(2)} to ${Math.max(...lens).toFixed(2)} s`+(clicks.length ? " CLICKS "+clicks.slice(0,6).map(k=>k+" "+JSON.stringify(r.notes[k].loop.ch.map(x=>[x.worst.toFixed(4), x.norm.toFixed(4)]))).join("; ") : ""));
    r.keys.forEach(k=>{ const o=r.notes[k]; if(o.files) index.push({name:inst+"/"+k, player:inst, key:k, files:o.files}); });
  }
  /* tuning, measured as the builders measure */
  fs.writeFileSync(path.join(TMP,"index.json"), JSON.stringify(index));
  const cents=JSON.parse(cp.execFileSync("python3", ["-I", path.join(__dirname,"hifi_tune.py"), TMP], {maxBuffer:64<<20}).toString());
  for(const inst of PLAYERS){
    const ks=Object.keys(cents).filter(n=>n.split("/")[0]===inst && cents[n]!=null), off=ks.filter(n=>Math.abs(cents[n])>2);
    const w=ks.reduce((a,n)=>Math.abs(cents[n])>Math.abs(a[1])?[n,cents[n]]:a, ["-",0]);
    if(ks.length) ok(!off.length, `${inst}: every note within ±2 cents of its note through the chain (${ks.length} notes; widest ${w[0]} ${(+w[1]).toFixed(2)} cents)`+(off.length ? " OFF "+off.slice(0,8).map(n=>n+" "+cents[n].toFixed(1)).join(", ") : ""));
    else ok(inst==="kit" || inst==="boomwhackers", `${inst}: no pitched notes to tune (it is ${inst==="kit"?"the unpitched kit":"made at its exact pitch"})`);
  }
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  fs.rmSync(TMP, {recursive:true, force:true});
  console.log(fails ? fails+" FAILED" : "all passed");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.message); try{ fs.rmSync(TMP, {recursive:true, force:true}); }catch(x){} process.exit(1); });
