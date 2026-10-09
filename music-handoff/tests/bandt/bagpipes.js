/* AOG-BAND-BAGPIPES-V1 — Jimmy: "I don't believe we have the BAG PIPES as a musical option do we?" … "1." The Band has a
   real Great Highland bagpipe (IowaSpaceWizard, Freesound, CC0): "Bagpipes · the chanter" and "Bagpipes · the drones",
   in Woodwinds. Every chanter note and every drone plays in tune with the band (the page's own voice, rendered offline,
   its pitch measured), none is silent; the chanter's reach is its own (the keys past it are grey); the credit names it;
   Spanish. No page errors. Port 9263. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9263);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9263/music-band.html"); await p.waitForTimeout(1500); await p.addScriptTag({content:MEASURE});
  /* in the menus: Woodwinds, both */
  await p.selectOption("#spKind", { label: "Woodwinds" }); await p.waitForTimeout(400);
  const names=await p.evaluate(()=>[...document.getElementById("spSound").options].map(o=>o.textContent));
  ok(names.includes("Bagpipes · the chanter") && names.includes("Bagpipes · the drones (hold the home note)"), "Woodwinds lists the bagpipes: "+names.filter(n=>/Bagpipe/.test(n)).join(" / "));
  /* every recorded note, played by the page's own voice, rendered offline: its pitch, and that it sounds */
  const res=await p.evaluate(async()=>{
    const out={};
    for(const inst of ["bagpipe","bagpipe_drones"]){
      S.sound=inst; await loadSound(inst); out[inst]=[];
      for(const m of MAN[inst].sus){
        const oc=new OfflineAudioContext(1, 44100*2, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,inst); setEra(ch,0,0);
        ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        const vc=makeVoice(oc,ch,inst,m,0.74,0.05,"sus"); vc.stop(1.9, vc.tau);
        const buf=await oc.startRendering(), x=buf.getChannelData(0).slice(44100*0.6, 44100*1.6);
        let r=0; for(const v of x) r+=v*v; r=Math.sqrt(r/x.length);
        /* the pitch: the strongest peak near the note (within a semitone), with the window's fine shape */
        /* the drones' loudest sound is an octave above the note (the tenor drones' octave; one drone sits a little flat, as recorded) */
        const want=440*Math.pow(2,(m-69)/12)*(inst==="bagpipe_drones"?2:1), N=x.length; let best=0, bf=0;
        for(let f=want*0.94; f<=want*1.06; f+=0.25){ let re=0, im=0; for(let i=0;i<N;i+=1){ const w=0.5-0.5*Math.cos(2*Math.PI*i/N), a=2*Math.PI*f*i/44100; re+=x[i]*w*Math.cos(a); im+=x[i]*w*Math.sin(a); } const e=re*re+im*im; if(e>best){ best=e; bf=f; } if(inst==="bagpipe_drones" && Math.abs(1200*Math.log2(f/want))<40){ (x.__w=x.__w||[0,0]); x.__w[0]+=e*f; x.__w[1]+=e; } }
        if(inst==="bagpipe_drones" && x.__w) bf=x.__w[0]/x.__w[1];   /* two drones beat a little: the middle of their sound */
        out[inst].push({m, db:20*Math.log10(r+1e-9), cents:1200*Math.log2(bf/want)});
      }
    }
    return out;
  });
  for(const inst of Object.keys(res)){
    const worst=Math.max(...res[inst].map(r=>Math.abs(r.cents))), quiet=Math.min(...res[inst].map(r=>r.db));
    ok(worst<8 && quiet>-45, `${inst}: ${res[inst].length} notes, each within ${worst.toFixed(1)} cents of its note, the quietest at ${quiet.toFixed(1)} dB (${res[inst].map(r=>r.m+":"+r.cents.toFixed(0)).join(" ")})`);
  }
  /* the chanter's reach: Low G to High A, so the keys past it are grey */
  const reach=await p.evaluate(()=>rangeOf("bagpipe"));
  ok(reach[0]===67 && reach[1]===84, "the chanter reaches from its Low G to its High A (MIDI "+reach.join(" to ")+")");
  /* picking it plays it; the credit names it */
  await p.selectOption("#spSound", "bagpipe"); await p.waitForTimeout(800);
  ok(await p.evaluate(()=>S.sound==="bagpipe"), "picking it sets the sound");
  ok(await p.evaluate(()=>/IowaSpaceWizard/.test(STR.credit.en) && /IowaSpaceWizard/.test(STR.credit.es)), "the credit names the recording, in English and Spanish");
  await p.evaluate(()=>{ const b=document.getElementById("langBtn"); if(b) b.click(); }); await p.waitForTimeout(600);
  ok(await p.evaluate(()=>document.getElementById("spSound").selectedOptions[0].textContent)==="Gaita · el puntero", "in Spanish: Gaita · el puntero");
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails?fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH",e.stack); process.exit(1); });
