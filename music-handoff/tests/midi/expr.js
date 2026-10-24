/* AOG-MIDI-EXPR-V1 (2026-10-23) — Jimmy wants the Studio pro-grade everywhere. A keyboard's other controls, through the
   shared helper (aog-midi.js), with a fake navigator.requestMIDIAccess (the test calls the input's onmidimessage):
   · the helper: CC1, CC2, CC11, CC64 as it moves (a half-pedal is a value) and channel aftertouch reach a room as events
     (MIDI.on), with their values; other CCs as "cc"; notes with their channel; a room out of sight hears none of them;
   · the Band: until a keyboard moves anything its swell stage is a straight wire (gain 1, a 0 dB shelf); CC11, CC2 and
     aftertouch move the held players' level and brightness, CC1 their vibrato, on the live page; rendered offline through
     the page's own chain, a held note's level glides from one level to the next in 10 to 30 ms (no step, no zipper: no
     sample-to-sample jump at the change larger than the note's own away from it), it is darker when the pedal is back
     (the treble above 4 kHz falls further than the level), pressure adds about 3 dB, the mod wheel brings vibrato (the
     pitch swings), and a plucked player or a short note is untouched;
   · the Drum Kit: General MIDI drum notes play the kit's matching pieces (36 kick, 38 snare, 42 closed hat, 46 open hat,
     49 crash, 51 ride, 45 48 50 toms …), harder hits louder and the loud recording, softer the soft one, lit on the kit;
     a note that is not a drum does nothing; every kit has a piece for each of those notes;
   · the Turntables: C3 starts and stops the left deck, C#3 cues it while held, D3 and D#3 the right deck, the mod wheel
     moves the crossfader (the mix follows); the help says so (English and Spanish);
   · an iPhone (no Web MIDI): nothing about MIDI shows in the Band, the Drum Kit or the Turntables.
   No page errors. Port 9461. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9461);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const FAKE=()=>{ const ins=new Map(); ins.set("a",{id:"a", name:"Keystation 49", onmidimessage:null});
  window.__asked=0; window.__midi={inputs:ins, onstatechange:null};
  navigator.requestMIDIAccess=()=>{ window.__asked++; return Promise.resolve(window.__midi); };
  window.__send=(d)=>{ const i=window.__midi.inputs.get("a"); if(i && i.onmidimessage) i.onmidimessage({data:d}); };
  try{ localStorage.setItem("aog.lang","en"); localStorage.removeItem("aog.band.v1"); }catch(e){} };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(page, init, dev)=>{
    const c=await b.newContext(dev||{viewport:{width:1280,height:900}}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await c.addInitScript(init||FAKE);
    const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.goto("http://localhost:9461/"+page); await p.waitForTimeout(1300);
    return {c, p, errs};
  };
  const press=async(p)=>{ await p.evaluate(()=>document.getElementById("midiBtn").scrollIntoView({block:"center"})); await p.click("#midiBtn"); await p.waitForTimeout(250);
    return p.evaluate(()=>document.getElementById("midiLine").textContent); };

  /* ── the helper's events ── */
  { const {c, p, errs}=await open("music-band.html"); console.log("== aog-midi.js");
    await press(p);
    const r=await p.evaluate(()=>{ const got=[]; ["mod","breath","expression","pedal","pressure","cc","note"].forEach(k=>MIDI.on(k, (a,b,c)=>got.push([k,a,b,c].filter(x=>x!==undefined))));
      __send([0xB0,1,127]); __send([0xB0,2,0]); __send([0xB0,11,64]); __send([0xB0,64,63]); __send([0xD0,100]); __send([0xB0,74,32]); __send([0x99,36,127]); __send([0x89,36,0]);
      const stop=MIDI.on("mod", ()=>got.push(["again"])); stop(); __send([0xB0,1,0]);
      return got; });
    const want=[["mod",1],["breath",0],["expression",64/127],["pedal",63/127],["pressure",100/127],["cc",74,32/127],["note",36,1,9],["mod",0]];
    const same=r.length===want.length && want.every((w,i)=>w.length===r[i].length && w.every((x,j)=>typeof x==="string" ? x===r[i][j] : Math.abs(x-r[i][j])<1e-9));
    ok(same, "CC1, CC2, CC11, CC64 as it moves (a half-pedal: "+(63/127).toFixed(2)+"), aftertouch, any other CC and a drum note on channel 10 reach the room with their values; a listener taken off hears nothing "+JSON.stringify(r));
    const sus=await p.evaluate(()=>{ __send([0xB0,64,63]); const a=S.sus; __send([0xB0,64,64]); const b2=S.sus; __send([0xB0,64,0]); return [a, b2, S.sus]; });
    ok(!sus[0] && sus[1] && !sus[2], "the Band's pedal still holds from the middle of its travel (63 up, 64 down) "+JSON.stringify(sus));
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }

  /* ── the Band ── */
  { const {c, p, errs}=await open("music-band.html"); console.log("== the Band");
    await p.evaluate(async()=>{ const s=document.getElementById("soundSel"); s.value="trumpet"; s.onchange(); await loadSound("trumpet"); });
    await press(p);
    const z=await p.evaluate(()=>{ ctx(); const e=LIVE_CH.expr; return {gain:e.gain.gain.value, shelf:e.shelf.gain.value, type:e.shelf.type, vib:!!LIVE_CH.vib}; });
    ok(z.gain===1 && z.shelf===0 && z.type==="highshelf" && !z.vib, "before a keyboard moves anything the swell is a straight wire (gain 1, a 0 dB shelf) and no vibrato oscillator exists "+JSON.stringify(z));
    const live=await p.evaluate(async()=>{
      __send([0x90,67,100]); const vc=LIVE.get("m67"), routed=!!vc && vc.swells;
      __send([0xB0,11,64]); const at0=LIVE_CH.expr.gain.gain.value;
      await new Promise(r=>setTimeout(r,120)); const g1=LIVE_CH.expr.gain.gain.value, s1=LIVE_CH.expr.shelf.gain.value;
      __send([0xB0,2,127]); await new Promise(r=>setTimeout(r,120)); const g2=LIVE_CH.expr.gain.gain.value;
      __send([0xD0,127]); await new Promise(r=>setTimeout(r,120)); const g3=LIVE_CH.expr.gain.gain.value, s3=LIVE_CH.expr.shelf.gain.value;
      __send([0xD0,0]); __send([0xB0,1,127]); await new Promise(r=>setTimeout(r,120)); const vib=LIVE_CH.vib ? LIVE_CH.vib.gain.value : null;
      __send([0xB0,1,0]); __send([0x80,67,0]); await new Promise(r=>setTimeout(r,120));
      return {routed, at0, g1, s1, g2, g3, s3, vib, vib0:LIVE_CH.vib.gain.value}; });
    const e=64/127;
    ok(live.routed && live.at0>0.9, "a held trumpet note goes through the swell; the level does not jump at the moment CC11 arrives ("+live.at0.toFixed(3)+")");
    ok(Math.abs(live.g1-e*e)<0.01 && Math.abs(live.s1+15*(1-e))<0.1, `CC11 at 64: the level glides to ${live.g1.toFixed(3)} (half way is 12 dB down) and the shelf to ${live.s1.toFixed(1)} dB (darker)`);
    ok(Math.abs(live.g2-1)<0.01, "the breath controller (CC2) at the top: back to full ("+live.g2.toFixed(3)+")");
    ok(Math.abs(live.g3-1.41)<0.02 && Math.abs(live.s3-3)<0.1, `pressure on the keys (aftertouch) adds about 3 dB (${live.g3.toFixed(2)}) and brightness (${live.s3.toFixed(1)} dB)`);
    ok(Math.abs(live.vib-35)<0.5 && Math.abs(live.vib0)<0.5, `the mod wheel: vibrato ${live.vib.toFixed(1)} cents at the top, ${live.vib0.toFixed(1)} back at the bottom`);
    /* offline, through the page's own chain */
    const off=await p.evaluate(async()=>{
      const sr=44100, out={};
      const render=async(inst, art, fn, secs)=>{ S.sound=inst; await loadSound(inst);
        const oc=new OfflineAudioContext(2, sr*secs, sr), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch, inst); setEra(ch,0,0); ch.send.gain.value=0;
        EXPR.e=1; EXPR.at=0; EXPR.mod=0;
        const vc=makeVoice(oc, ch, inst, 67, 0.7, 0.05, art); vc.stop(secs-0.3, vc.tau);
        const swells=vc.swells; fn(ch, oc);
        /* the players before the compressor (as bandt/level.js measures), so the glide itself is what is measured */
        ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        const buf=await oc.startRendering(); return {d:buf.getChannelData(0), swells}; };
      const rms=(d,a,z)=>{ let e=0,n=0; for(let i=Math.floor(a*sr);i<Math.floor(z*sr);i++){ e+=d[i]*d[i]; n++; } return Math.sqrt(e/n); };
      const jump=(d,a,z)=>{ let x=0; for(let i=Math.max(1,Math.floor(a*sr));i<Math.floor(z*sr);i++) x=Math.max(x, Math.abs(d[i]-d[i-1])); return x; };
      /* treble: the share of the energy above 4 kHz, by a one-pole split */
      const hiShare=(d,a,z)=>{   /* two high-pass biquads at 4 kHz (24 dB an octave) */
        const w=2*Math.PI*4000/sr, al=Math.sin(w)/(2*0.707), cw=Math.cos(w), a0=1+al, b0=(1+cw)/2/a0, b1=-(1+cw)/a0, a1=-2*cw/a0, a2=(1-al)/a0;
        const st=[[0,0,0,0],[0,0,0,0]]; let eh=0, et=0;
        for(let i=0;i<Math.floor(z*sr);i++){ let x=d[i]; for(const s of st){ const y=b0*x+b1*s[0]+b0*s[1]-a1*s[2]-a2*s[3]; s[1]=s[0]; s[0]=x; s[3]=s[2]; s[2]=y; x=y; }
          if(i>=Math.floor(a*sr)){ eh+=x*x; et+=d[i]*d[i]; } } return eh/et; };
      /* the level, every 1 ms, from 50 ms before the change to 80 ms after */
      const steps=(d,t)=>{ const o=[]; for(let k=-50;k<=80;k++){ const a=t+k/1000; o.push(rms(d,a-0.004,a+0.004)); } return o; };
      { const r=await render("trumpet","sus",(ch,oc)=>{ EXPR.e=64/127; exprAt(ch, 1.5); EXPR.e=1; exprAt(ch, 2.5); EXPR.at=1; exprAt(ch, 3.2); },4.0);
        const d=r.d, before=rms(d,1.2,1.45), after=rms(d,1.65,1.9), back=rms(d,2.25,2.45), full=rms(d,2.65,2.9), press=rms(d,3.35,3.6);
        const env=steps(d,1.5), lo=env[0], hi=env[env.length-1], need=lo+(hi-lo)*0.9; let t90=-1; for(let k=0;k<env.length;k++){ if((hi<lo ? env[k]<=need : env[k]>=need)){ t90=k-50; break; } }
        const norm=Math.max(jump(d,1.0,1.45), jump(d,1.6,2.45), jump(d,2.6,3.15)), atChange=Math.max(jump(d,1.49,1.53), jump(d,2.49,2.53));
        out.held={swells:r.swells, drop:20*Math.log10(after/before), back:20*Math.log10(full/before), press:20*Math.log10(press/full), t90, norm, atChange,
          hiBefore:hiShare(d,1.2,1.45), hiAfter:hiShare(d,1.65,1.9)}; }
      /* a zipper, plainly: a steady 997 Hz tone through the swell stage, the pedal back and forward. A glide's steps are far
         smaller than the tone's own from sample to sample; the same changes made as steps jump far past them (the check
         hears a zipper when there is one) */
      const tone=async(fn)=>{ const oc=new OfflineAudioContext(1, sr*3.2, sr), ch=makeChain(oc); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); ch.send.gain.value=0;
        const o=oc.createOscillator(); o.frequency.value=1000.5;   /* at 1.5 s and 2.5 s it is at its peak, where a step jumps most */ const g=oc.createGain(); g.gain.value=0.3; o.connect(g); g.connect(ch.expr.input); o.start(0); EXPR.e=1; EXPR.at=0; EXPR.mod=0; fn(ch);
        const d=(await oc.startRendering()).getChannelData(0); return {norm:Math.max(jump(d,0.5,1.45), jump(d,1.6,2.45), jump(d,2.6,3.1)), atChange:Math.max(jump(d,1.495,1.53), jump(d,2.495,2.53))}; };
      out.toneGlide=await tone(ch=>{ EXPR.e=64/127; exprAt(ch, 1.5); EXPR.e=1; exprAt(ch, 2.5); });
      out.toneStep=await tone(ch=>{ const p=ch.expr.gain.gain; p.setValueAtTime(1, 0); p.setValueAtTime((64/127)**2, 1.5); p.setValueAtTime(1, 2.5); });
      { const r=await render("trumpet","sus",(ch,oc)=>{ EXPR.mod=1; exprAt(ch, 1.0); },3.0); const d=Float32Array.from(r.d);
        { const w=2*Math.PI*500/sr, al=Math.sin(w)/(2*0.707), cw=Math.cos(w), a0=1+al, b0=(1-cw)/2/a0, b1=(1-cw)/a0, a1=-2*cw/a0, a2=(1-al)/a0; let x1=0,x2=0,y1=0,y2=0;   /* the fundamental alone */
          for(let i=0;i<d.length;i++){ const x=d[i], y=b0*x+b1*x1+b0*x2-a1*y1-a2*y2; x2=x1; x1=x; y2=y1; y1=y; d[i]=y; } }
        /* the pitch every 40 ms (the autocorrelation's peak within two semitones of G4, interpolated) from 0.4 to 0.95 s and
           from 1.4 to 2.4 s: its swing in cents */
        const freq=(a,z)=>{ const i0=Math.floor(a*sr), W=Math.floor((z-a)*sr)-130, P=sr/392, lo=Math.floor(P/1.13), hi=Math.ceil(P*1.13), r=[];
          for(let L=lo-1;L<=hi+1;L++){ let s=0; for(let i=0;i<W;i++) s+=d[i0+i]*d[i0+i+L]; r.push(s); }
          let k=1; for(let j=1;j<r.length-1;j++) if(r[j]>r[k]) k=j;
          const den=r[k-1]-2*r[k]+r[k+1], off=den ? 0.5*(r[k-1]-r[k+1])/den : 0; return sr/(lo-1+k+off); };
        const swing=(a,z)=>{ const f=[]; for(let t=a;t+0.04<=z;t+=0.04) f.push(freq(t,t+0.04)); const mid=f.slice().sort((x,y)=>x-y)[f.length>>1]; return Math.max(...f.map(x=>Math.abs(1200*Math.log2(x/mid)))); };
        out.vib={still:swing(0.4,0.95), moving:swing(1.4,2.4)}; }
      { const r=await render("harp","sus",(ch,oc)=>{ EXPR.e=0; exprAt(ch, 0.6); },1.4); out.harp={swells:r.swells, level:20*Math.log10(rms(r.d,0.9,1.0)+1e-9)}; }
      { const r=await render("trumpet","stac",(ch,oc)=>{ EXPR.e=0; exprAt(ch, 0.1); },1.0); out.stac={swells:r.swells}; }
      EXPR.e=1; EXPR.at=0; EXPR.mod=0;
      return out; });
    const h=off.held;
    const gdrop=20*Math.log10((64/127)**2);   /* the level's own part, -11.9 dB; the darker tone takes a little more */
    ok(h.swells && h.drop<=gdrop+0.5 && h.drop>=gdrop-4 && Math.abs(h.back)<0.5, `rendered through the chain: CC11 at 64 brings a held note ${h.drop.toFixed(1)} dB down (${gdrop.toFixed(1)} dB by the level, the rest by the darker tone), the pedal forward brings it back (${h.back.toFixed(1)} dB)`);
    ok(h.t90>=5 && h.t90<=30, `the change glides: 90 % of the way after ${h.t90} ms (a ramp of 15 ms, never a step)`);
    ok(h.atChange<=h.norm*1.0001, `no zipper or click: the largest sample-to-sample step at a change ${h.atChange.toFixed(4)} ≤ the note's own largest away from it ${h.norm.toFixed(4)}`);
    const slope=0.3*(1-(64/127)**2)/(0.015*44100);   /* the most a 15 ms glide itself can add from one sample to the next */
    ok(off.toneGlide.atChange<=off.toneGlide.norm+slope*1.01, `a steady tone through the swell, the pedal back and forward: its largest step at a change ${off.toneGlide.atChange.toFixed(4)} ≤ its own ${off.toneGlide.norm.toFixed(4)} plus the glide's own slope ${slope.toFixed(4)} (no zipper)`);
    ok(off.toneStep.atChange>off.toneStep.norm*1.5, `the check hears a zipper when there is one: the same changes made as steps jump ${off.toneStep.atChange.toFixed(4)} against ${off.toneStep.norm.toFixed(4)}`);
    ok(h.hiAfter<h.hiBefore*0.6, `darker with the pedal back: the share above 4 kHz falls from ${(100*h.hiBefore).toFixed(2)} % to ${(100*h.hiAfter).toFixed(2)} %`);
    ok(Math.abs(h.press-3)<0.6, `pressure adds ${h.press.toFixed(1)} dB`);
    ok(off.vib.still<6 && off.vib.moving>20, `the mod wheel brings vibrato: the pitch swings ${off.vib.still.toFixed(1)} cents before, ${off.vib.moving.toFixed(1)} cents after`);
    ok(!off.harp.swells && off.harp.level>-60 && !off.stac.swells, `a plucked harp and a short trumpet note do not swell (the harp still sounds at ${off.harp.level.toFixed(1)} dB with the pedal all the way back)`);
    ok(errs.length===0, "band: no page errors "+errs.join(" | ")); await c.close(); }

  /* ── the Drum Kit ── */
  { const {c, p, errs}=await open("music-kit.html"); console.log("== the Drum Kit");
    await p.evaluate(async()=>{ for(let i=0;i<100 && !ready();i++) await new Promise(r=>setTimeout(r,100)); });
    const st=await (async()=>{ const before=await p.evaluate(()=>({asked:window.__asked, shown:!document.getElementById("midiBtn").hidden, row:!document.getElementById("midiRow").hidden, text:document.getElementById("midiBtn").textContent}));
      return {before, line:await press(p)}; })();
    ok(st.before.shown && st.before.row && st.before.asked===0 && st.before.text==="Use MIDI drums or a keyboard", "the kit's button shows on a computer; nothing is asked before it is pressed "+JSON.stringify(st.before));
    ok(/MIDI ready: Keystation 49\. Its drum notes play these drums/.test(st.line), "pressed: '"+st.line+"'");
    const r=await p.evaluate(()=>{
      const log=[], real=AOGDrumKit.playDirect; AOGDrumKit.playDirect=function(ac,dest,b,id,t0,acc,lev){ log.push({b,id,acc,lev}); return real.apply(this, arguments); };
      const names=AOGDrumKit.padNames(S.bank), res={};
      for(const [n,v] of [[36,100],[38,100],[42,100],[46,100],[49,100],[51,100],[45,100],[48,100],[50,100],[36,127],[36,30],[60,100]]){ log.length=0; __send([0x99,n,v]);
        const lit=log[0] && document.querySelector(`[data-pad="${log[0].id}"]`); res[n+"/"+v]=log[0] ? {id:log[0].id, name:names[log[0].id], acc:log[0].acc, lev:log[0].lev, lit:!!lit && lit.classList.contains("hit")} : null; }
      log.length=0; __send([0x89,36,0]); res.off=log.length;
      AOGDrumKit.playDirect=real; return {res, bank:S.bank}; });
    const R=r.res, nm=k=>R[k] && R[k].name;
    ok(nm("36/100")==="KICK" && nm("38/100")==="SNARE" && nm("42/100")==="HAT" && nm("46/100")==="OPEN" && nm("49/100")==="CRASH" && nm("51/100")==="RIDE",
      `kit ${r.bank}: 36 kick, 38 snare, 42 closed hat, 46 open hat, 49 crash, 51 ride play those pieces `+["36/100","38/100","42/100","46/100","49/100","51/100"].map(k=>k+" "+nm(k)).join(", "));
    ok(["45/100","48/100","50/100"].every(k=>R[k] && /TOM|FLOOR/.test(R[k].name)), "45, 48 and 50 play its toms: "+["45/100","48/100","50/100"].map(k=>k+" "+nm(k)).join(", "));
    ok(R["36/127"].acc===2 && R["36/30"].acc===3 && R["36/100"].acc===2 && R["36/127"].lev>R["36/100"].lev && R["36/100"].lev>R["36/30"].lev, `velocity: a hard hit picks the loud recording and plays louder (${R["36/127"].lev.toFixed(2)}), a soft one the soft recording, quieter (${R["36/30"].lev.toFixed(2)})`);
    ok(Object.keys(R).filter(k=>k!=="off" && k!=="60/100").every(k=>R[k] && R[k].lit), "each hit lights its drum");
    ok(R["60/100"]===null && R.off===0, "a note that is not a drum, and a let-go, play nothing");
    /* every kit: a piece for each of those notes */
    const all=await p.evaluate(()=>KITS().map(b=>({b, miss:[36,38,42,46,49,51,45,48,50].filter(n=>!gmPad(b,n))})).filter(x=>x.miss.length));
    ok(all.length===0, "every kit has a piece for 36 38 42 46 49 51 45 48 50 "+JSON.stringify(all));
    await p.evaluate(()=>document.getElementById("langBtn").click());
    const es=await p.evaluate(()=>({btn:document.getElementById("midiBtn").textContent, line:document.getElementById("midiLine").textContent}));
    ok(es.btn==="Usar batería MIDI o un teclado" && /MIDI listo: Keystation 49/.test(es.line), "in Spanish: "+JSON.stringify(es));
    ok(errs.length===0, "kit: no page errors "+errs.join(" | ")); await c.close(); }

  /* ── the Turntables ── */
  { const {c, p, errs}=await open("music-decks.html"); console.log("== the Turntables");
    const before=await p.evaluate(()=>({asked:window.__asked, row:!document.getElementById("midiRow").hidden, help:document.getElementById("midiHelp").textContent}));
    ok(before.row && before.asked===0 && /MIDI: the C below middle C starts and stops the left deck/.test(before.help) && /mod wheel moves the crossfader/.test(before.help), "the MIDI line shows on a computer, nothing asked yet: '"+before.help+"'");
    await press(p);
    const r=await p.evaluate(()=>{
      const sh=dkShown(), L=sh[0], R=sh[sh.length-1], log=[];
      const watch=(sel, tag)=>{ const el=document.querySelector(sel); ["click","keydown","keyup"].forEach(t=>el.addEventListener(t, ()=>log.push(tag+":"+t), true)); };
      watch(`[data-play="${L}"]`,"Lplay"); watch(`[data-cue="${L}"]`,"Lcue"); watch(`[data-play="${R}"]`,"Rplay"); watch(`[data-cue="${R}"]`,"Rcue");
      __send([0x90,48,100]); __send([0x80,48,0]); __send([0x90,49,100]); __send([0x80,49,0]); __send([0x90,50,100]); __send([0x90,51,90]); __send([0x80,51,0]); __send([0x90,60,100]);
      const xf=document.getElementById("xf"); __send([0xB0,1,0]); const x0=+xf.value, g0=decks.map(d=>d.xgv); __send([0xB0,1,127]); const x1=+xf.value, g1=decks.map(d=>d.xgv); __send([0xB0,1,64]); const x2=+xf.value;
      return {L, R, log, x0, x1, x2, g0, g1, sides:decks.map(d=>d.side)}; });
    const want=["Lplay:click","Lcue:keydown","Lcue:keyup","Rplay:click","Rcue:keydown","Rcue:keyup"];
    ok(JSON.stringify(r.log)===JSON.stringify(want), `C3 starts and stops deck ${r.L}, C#3 cues it while held; D3 and D#3 the same for deck ${r.R}; another note does nothing `+JSON.stringify(r.log));
    const li=r.sides.indexOf("L"), ri=r.sides.indexOf("R");
    ok(r.x0===0 && r.x1===1 && Math.abs(r.x2-0.5)<0.01 && r.g0[li]>0.99 && r.g0[ri]<0.01 && r.g1[ri]>0.99 && r.g1[li]<0.01, `the mod wheel moves the crossfader (0 → ${r.x0}, 127 → ${r.x1}, 64 → ${r.x2}) and the mix follows`);
    await p.evaluate(()=>document.getElementById("langBtn").click());
    const es=await p.evaluate(()=>document.getElementById("midiHelp").textContent);
    ok(/^MIDI: el Do debajo del Do central/.test(es) && /rueda de modulación mueve el crossfader/.test(es), "in Spanish: '"+es+"'");
    ok(errs.length===0, "decks: no page errors "+errs.join(" | ")); await c.close(); }

  /* ── an iPhone: no Web MIDI, nothing about it ── */
  { const NONE=()=>{ try{ delete Navigator.prototype.requestMIDIAccess; }catch(e){} try{ Object.defineProperty(navigator, "requestMIDIAccess", {value:undefined}); }catch(e){} try{ localStorage.setItem("aog.lang","en"); }catch(e){} };
    for(const page of ["music-band.html","music-kit.html","music-decks.html"]){
      const {c, p, errs}=await open(page, NONE, Object.assign({}, pw.devices["iPhone 13"]));
      const r=await p.evaluate(()=>{ const vis=el=>!!el && !el.hidden && el.getClientRects().length>0 && getComputedStyle(el).display!=="none";
        const words=[...document.querySelectorAll("body *")].filter(el=>el.children.length===0 && /MIDI/.test(el.textContent) && vis(el) && !el.closest("[hidden]") && el.offsetParent!==null).map(el=>el.id||el.tagName+":"+el.textContent.slice(0,40));
        return {api:!!navigator.requestMIDIAccess, btn:vis(document.getElementById("midiBtn")), row:document.getElementById("midiRow") ? vis(document.getElementById("midiRow")) : false, words}; });
      ok(!r.api && !r.btn && !r.row && r.words.length===0, `${page} on an iPhone: no MIDI button, line or words `+JSON.stringify(r));
      ok(errs.length===0, `${page} on an iPhone: no page errors `+errs.join(" | ")); await c.close(); }
  }
  console.log(fails ? fails+" FAILED" : "all passed");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
