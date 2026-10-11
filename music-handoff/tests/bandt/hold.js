/* AOG-BAND-HOLD-V1 and AOG-BAND-SUSTAIN-V1 (2026-10-11) — Jimmy: "the Band's long notes would keep sounding instead of
   stopping when the recording runs out; the Band would get a sustain pedal."
   1 · Every sustaining player (winds, brass, bowed strings, saxophones, bagpipes, drones) has a loop on every held
       recording; plucked and struck players have none.
   2 · A 12-second held note, rendered offline by the page's own voice (on a recorded note and on one a semitone up),
       still sounds at 11 s at about the level it held at 1-2 s, and at every loop seam no sample-to-sample jump is larger
       than the note's own largest one away from the seams (no click). A plucked note still rings out by itself.
   3 · A key held on the live page keeps its note going past the recording's length.
   4 · The pedal: the Hold notes button, Shift, a MIDI keyboard's pedal (CC64): notes let go while it is down keep
       sounding until it is lifted; Spanish words. No page errors. Port 9267. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9267);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}});
  await c.addInitScript(()=>{ try{ localStorage.setItem("aog.lang","en"); localStorage.removeItem("aog.band.v1"); }catch(e){}
    const ins=new Map(); ins.set("a",{id:"a", name:"Keystation 49", onmidimessage:null});
    window.__midi={inputs:ins, onstatechange:null}; navigator.requestMIDIAccess=()=>Promise.resolve(window.__midi); });
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9267/music-band.html"); await p.waitForTimeout(1500);

  /* 1 · the loops */
  const HOLD=["trumpet","trombone","horn","tuba","clarinet","oboe","flute","piccolo","bassoon","sax","tenor","tenor_vib","soprano","bagpipe","bagpipe_drones","violins","violas","cellos","contrabass"];
  const RING=["harp","violins_pizz","contrabass_pizz","timpani","marimba","xylophone","glockenspiel"];
  const lp=await p.evaluate(async(a)=>{
    const out={};
    for(const inst of a.HOLD.concat(a.RING)){ await loadSound(inst); const set=SETS[setKey(inst, inst)]; const files=Object.keys(set.buf).filter(f=>f.slice(-1)!=="t");
      out[inst]={files:files.length, loops:files.filter(f=>set.loop[f]).length, len:files.filter(f=>set.loop[f]).map(f=>set.loop[f][1]-set.loop[f][0])}; }
    return out; }, {HOLD, RING});
  const miss=HOLD.filter(i=>lp[i].loops!==lp[i].files || !lp[i].files);
  ok(!miss.length, "every held recording of every sustaining player has a loop ("+HOLD.map(i=>i+" "+lp[i].loops+"/"+lp[i].files).join(", ")+")");
  const lens=[].concat(...HOLD.map(i=>lp[i].len)); ok(lens.every(x=>x>=0.9 && x<=2.7), "each loop is 0.9 to 2.7 s of the note's steady part (shortest "+Math.min(...lens).toFixed(2)+" s)");
  ok(RING.every(i=>lp[i].loops===0), "plucked and struck players ring out as recorded, no loop: "+RING.join(", "));

  /* 2 · 12 s held notes, rendered offline */
  const TRY=[["trumpet",67],["trumpet",68],["clarinet",65],["violins",69],["cellos",50],["cellos",51],["sax",61],["tenor",60],["bagpipe",76],["bagpipe_drones",52],["tuba",41],["horn",57],["flute",72],["contrabass",40],["tenor_vib",60],["oboe",70]];
  const rr=await p.evaluate(async(TRY)=>{
    const out=[];
    for(const [inst, m] of TRY){
      S.sound=inst; await loadSound(inst);
      for(const v of [0.45, 0.9]){
        const sr=44100, oc=new OfflineAudioContext(1, sr*12.5, sr), g=oc.createGain(); g.connect(oc.destination);
        const vc=makeVoice(oc, {bus:g, send:oc.createGain()}, inst, m, v, 0.05, "sus"); if(!vc){ out.push({inst, m, none:true}); continue; }
        vc.stop(12.2, vc.tau);
        const d=(await oc.startRendering()).getChannelData(0), L=vc.loop;
        const rms=(a,z)=>{ let e=0, n=0; for(let i=Math.floor(a*sr);i<Math.floor(z*sr);i++){ e+=d[i]*d[i]; n++; } return Math.sqrt(e/n); };
        const jump=(a,z)=>{ let x=0; for(let i=Math.max(1,Math.floor(a*sr));i<Math.floor(z*sr);i++) x=Math.max(x, Math.abs(d[i]-d[i-1])); return x; };
        const bend=(a,z)=>{ let x=0; for(let i=Math.max(2,Math.floor(a*sr));i<Math.floor(z*sr);i++) x=Math.max(x, Math.abs(d[i]-2*d[i-1]+d[i-2])); return x; };   /* a kink shows here first */
        if(!L){ out.push({inst, m, v, noloop:true}); continue; }
        const first=L.at+(L.z-L.off)/L.rate, per=(L.z-L.a)/L.rate, seams=[]; for(let t=first; t<12.0; t+=per) seams.push(t);
        /* the note's own largest step, away from any seam: from 0.6 s to just before the first seam, and between seams */
        let norm=jump(0.6, first-0.25), nb=bend(0.6, first-0.25); for(let k=0;k+1<seams.length;k++){ norm=Math.max(norm, jump(seams[k]+0.25, seams[k+1]-0.25)); nb=Math.max(nb, bend(seams[k]+0.25, seams[k+1]-0.25)); }
        const worst=Math.max(...seams.map(t=>jump(t-0.003, t+0.003))), wb=Math.max(...seams.map(t=>bend(t-0.003, t+0.003)));
        out.push({inst, m, v, held:20*Math.log10(rms(1,2)+1e-9), late:20*Math.log10(rms(10.5,11.5)+1e-9), seams:seams.length, norm, worst, nb, wb});
      }
    }
    return out; }, TRY);
  for(const r of rr){
    if(r.none || r.noloop){ ok(false, `${r.inst} ${r.m}: ${r.none?"no voice":"no loop"}`); continue; }
    const drop=r.late-r.held;
    ok(drop>-6 && drop<4 && r.late>-50, `${r.inst} ${r.m} (strength ${r.v}): still sounding at 11 s, ${r.late.toFixed(1)} dB against ${r.held.toFixed(1)} dB at 1-2 s (${drop>=0?"+":""}${drop.toFixed(1)} dB)`);
    ok(r.worst<=r.norm*1.0001 && r.wb<=r.nb*1.0001, `${r.inst} ${r.m} (strength ${r.v}): ${r.seams} seams, the largest step at a seam ${r.worst.toFixed(4)} ≤ the note's own largest ${r.norm.toFixed(4)}, its sharpest bend ${r.wb.toFixed(4)} ≤ ${r.nb.toFixed(4)} (no click)`);
  }
  /* the check itself hears a click: the same trumpet note looped a third of a wave off, with no blend, is caught */
  const ctl=await p.evaluate(async()=>{ S.sound="trumpet"; await loadSound("trumpet");
    const set=SETS[setKey("trumpet")], f="67s", src=set.buf[f], lp=set.loop[f], sr=44100;
    const oc=new OfflineAudioContext(1, sr*8, sr), raw=oc.createBuffer(1, src.length, src.sampleRate); raw.copyToChannel(src.getChannelData(0).slice(), 0);
    const s=oc.createBufferSource(); s.buffer=raw; s.loop=true; s.loopStart=lp[0]; s.loopEnd=lp[1]+1/(3*440*Math.pow(2,(67-69)/12)); s.connect(oc.destination); s.start(0.05, set.start[f]);
    const d=(await oc.startRendering()).getChannelData(0), jump=(a,z)=>{ let x=0; for(let i=Math.floor(a*sr);i<Math.floor(z*sr);i++) x=Math.max(x, Math.abs(d[i]-d[i-1])); return x; };
    const first=0.05+s.loopEnd-set.start[f], per=s.loopEnd-s.loopStart;
    return {norm:jump(0.6, first-0.25), worst:Math.max(jump(first-0.003, first+0.003), jump(first+per-0.003, first+per+0.003))}; });
  ok(ctl.worst>ctl.norm*1.2, `the check hears a click when there is one: a loop a third of a wave off, unblended, jumps ${ctl.worst.toFixed(4)} against ${ctl.norm.toFixed(4)}`);
  /* a plucked note still dies away by itself */
  const pl=await p.evaluate(async()=>{ S.sound="harp"; await loadSound("harp");
    const sr=44100, oc=new OfflineAudioContext(1, sr*9, sr), g=oc.createGain(); g.connect(oc.destination);
    const vc=makeVoice(oc, {bus:g, send:oc.createGain()}, "harp", 60, 0.8, 0.05, "sus"); vc.stop(8.8, vc.tau);
    const d=(await oc.startRendering()).getChannelData(0), rms=(a,z)=>{ let e=0,n=0; for(let i=Math.floor(a*sr);i<Math.floor(z*sr);i++){ e+=d[i]*d[i]; n++; } return Math.sqrt(e/n); };
    return {loop:!!vc.loop, natural:vc.natural, early:20*Math.log10(rms(0.1,0.6)), late:20*Math.log10(rms(8,8.5)+1e-12)}; });
  ok(!pl.loop && isFinite(pl.natural) && pl.late<pl.early-30, `the harp held 9 s rings out as recorded (${pl.early.toFixed(1)} dB at first, ${pl.late.toFixed(1)} dB at 8 s)`);

  /* 3 · live: a key held past the recording */
  await p.evaluate(async()=>{ const s=document.getElementById("soundSel"); s.value="clarinet"; s.onchange(); await loadSound("clarinet"); });
  await p.waitForTimeout(300);
  const lv=await p.evaluate(()=>new Promise(res=>{ ctx(); keyOn(65, 0.7); const vc=LIVE.get("k65"), t0=ac.currentTime;
    setTimeout(()=>{ const v2=LIVE.get("k65"); res({same:v2===vc, loop:!!(vc && vc.loop), nodes:vc ? vc.nodes.every(n=>n.loop) : false, natural:vc && vc.natural, held:ac.currentTime-t0, stopped:vc && vc.stopped}); keyOff(65); }, 600); }));
  ok(lv.same && lv.loop && lv.nodes && lv.natural===Infinity && !lv.stopped, "a key held on the page: its clarinet note loops and lasts until the key is let go "+JSON.stringify(lv));

  /* 4 · the pedal */
  const sb=await p.evaluate(()=>({text:document.getElementById("susBtn").textContent, pressed:document.getElementById("susBtn").getAttribute("aria-pressed"), shown:document.getElementById("susBtn").getBoundingClientRect().width>0}));
  ok(sb.text==="Hold notes (pedal)" && sb.pressed==="false" && sb.shown, "the Band has a pedal button: '"+sb.text+"'");
  const ped=await p.evaluate(async()=>{
    const r={};
    document.getElementById("susBtn").click(); r.on=S.sus && document.getElementById("susBtn").getAttribute("aria-pressed")==="true";
    keyOn(65, 0.7); keyOff(65); const vc=LIVE.get("k65"); r.kept=!!vc && !vc.stopped && !vc.down;
    await new Promise(z=>setTimeout(z,150));
    document.getElementById("susBtn").click(); r.off=!S.sus; r.gone=!LIVE.has("k65") && vc.stopped;
    return r; });
  ok(ped.on && ped.kept && ped.off && ped.gone, "the button: a note let go keeps sounding while it is down, and stops when it is lifted "+JSON.stringify(ped));
  await p.evaluate(()=>{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
  await p.keyboard.down("Shift"); await p.keyboard.down("KeyF"); await p.waitForTimeout(80); await p.keyboard.up("KeyF"); await p.waitForTimeout(80);
  const sh1=await p.evaluate(()=>({sus:S.sus, n:[...LIVE.values()].filter(v=>!v.stopped).length}));
  await p.keyboard.up("Shift"); await p.waitForTimeout(80);
  const sh2=await p.evaluate(()=>({sus:S.sus, n:[...LIVE.values()].filter(v=>!v.stopped).length}));
  ok(sh1.sus && sh1.n===1 && !sh2.sus && sh2.n===0, `Shift held: the F let go keeps sounding (${sh1.n} ringing); Shift up: it stops (${sh2.n})`);
  await p.click("#midiBtn"); await p.waitForTimeout(200);
  const md=await p.evaluate(async()=>{
    const i=[...window.__midi.inputs.values()][0], r={line:document.getElementById("midiLine").textContent};
    i.onmidimessage({data:[0x90,62,90]}); r.on=LIVE.has("m62") && !LIVE.get("m62").stopped;
    i.onmidimessage({data:[0xB0,64,127]}); r.sus=S.sus;
    i.onmidimessage({data:[0x80,62,0]}); r.kept=LIVE.has("m62") && !LIVE.get("m62").stopped;
    const vc=LIVE.get("m62");
    i.onmidimessage({data:[0xB0,64,0]}); r.lift=!S.sus && vc.stopped && !LIVE.has("m62");
    return r; });
  ok(/MIDI keyboard ready: Keystation 49/.test(md.line) && md.on && md.sus && md.kept && md.lift, "a MIDI keyboard's pedal (CC64) holds a note let go, and lifting it lets go "+JSON.stringify(md));
  await p.evaluate(()=>{ document.getElementById("langBtn").click(); });
  const es=await p.evaluate(()=>({sus:document.getElementById("susBtn").textContent, midi:document.getElementById("midiBtn").textContent, line:document.getElementById("midiLine").textContent,
    keys:document.querySelector(".keys-line").textContent}));
  ok(es.sus==="Mantener notas (pedal)" && es.midi==="Usar un teclado MIDI" && /Teclado MIDI listo/.test(es.line) && /Shift/.test(es.keys), "in Spanish: "+JSON.stringify(es));
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails ? fails+" FAILED" : "all passed");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
