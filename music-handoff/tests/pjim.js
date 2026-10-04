/* Jimmy's three iPad notes: one sound per organ key, no magnifier on the keys and pads, and a MIDI button that answers. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9964);
let fails=0, passes=0; function ok(c,m){ if(c){ passes++; console.log("PASS "+m); } else { fails++; console.log("FAIL "+m); } }
(async()=>{
  const b=await pw.chromium.launch();
  /* 1 · the organs: render one held note and look at its first moments */
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9964/music-piano.html"); await p.waitForTimeout(700);
    const r=await p.evaluate(async()=>{
      const out={};
      for(const id of ["organ","church"]){
        const sr=44100, oc=new OfflineAudioContext(1, sr*1.2, sr), when=0.1;
        const bus=oc.createGain(); bus.connect(oc.destination);
        const vc=makeVoice(oc, {c:oc, bus:bus, org:bus, send:oc.createGain()}, id, 60, 0.9, when); vc.stop(when+0.8, vc.tau);
        const d=(await oc.startRendering()).getChannelData(0);
        /* the sound's edge: how much it changes from one sample to the next (a click or a breath is all edge) */
        const edge=(a,z)=>{ let m=0; for(let i=Math.floor(a*sr)+1;i<Math.floor(z*sr);i++) m=Math.max(m,Math.abs(d[i]-d[i-1])); return m; };
        const peak=(a,z)=>{ let m=0; for(let i=Math.floor(a*sr);i<Math.floor(z*sr);i++) m=Math.max(m,Math.abs(d[i])); return m; };
        out[id]={attack:peak(when,when+0.06), held:peak(when+0.3,when+0.5), edgeStart:edge(when,when+0.03), edgeHeld:edge(when+0.3,when+0.5),
          nodes:typeof noiseBuf};
      }
      return out;
    });
    for(const id of ["organ","church"]){ const x=r[id];
      ok(x.attack<=x.held*1.02, `${id}: the start is no louder than the held note (${x.attack.toFixed(3)} vs ${x.held.toFixed(3)})`);
      ok(x.edgeStart<=x.edgeHeld*1.05, `${id}: no click or breath at the start (sharpest step ${x.edgeStart.toFixed(4)} vs held ${x.edgeHeld.toFixed(4)})`); }
    ok(r.organ.nodes==="undefined", "the noise maker for the click and breath is gone");
    await p.close(); }
  /* 2 · the magnifier: on a touch screen the keys and pads keep the touch, and the page does not select text */
  { const c=await b.newContext({viewport:{width:1024,height:768}, isMobile:true, hasTouch:true}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    const p=await c.newPage(); await p.goto("http://localhost:9964/music-piano.html"); await p.waitForTimeout(900);
    const r=await p.evaluate(()=>{
      const fire=el=>{ const t=new Touch({identifier:1,target:el,clientX:5,clientY:5}); const e=new TouchEvent("touchstart",{bubbles:true,cancelable:true,touches:[t],targetTouches:[t],changedTouches:[t]}); el.dispatchEvent(e); return e.defaultPrevented; };
      const cs=getComputedStyle(document.body);
      return {key:fire(document.querySelector("#kbd .wk")), blackKey:fire(document.querySelector("#kbd .bk")), pad:fire(document.querySelector(".pad")),
        select:fire(document.getElementById("soundSel")), body:cs.webkitUserSelect||cs.userSelect, callout:cs.webkitTouchCallout,
        inputSel:getComputedStyle(document.querySelector("input[type=text],textarea")||document.createElement("input")).webkitUserSelect};
    });
    ok(r.key && r.blackKey && r.pad, "a touch on a white key, a black key or a pad is kept by the piano (no magnifier, no zoom)");
    ok(!r.select, "a touch on the Instrument menu still opens it");
    ok(r.body==="none", "the page does not select text ("+r.body+")");
    ok(r.callout==="none" || r.callout===undefined, "no copy bubble ("+r.callout+")");
    /* and a tap on a key still plays */
    await p.evaluate(()=>document.getElementById("kbd").scrollIntoView({block:"center"}));
    const k=await p.$("#kbd .wk"); const bb=await k.boundingBox();
    await p.touchscreen.tap(bb.x+bb.width/2, bb.y+bb.height*0.6); await p.waitForTimeout(150);
    ok(await p.evaluate(()=>ac && RN.length>0), "a tap on a key still plays a note");
    await c.close(); }
  /* 3 · the MIDI button */
  for(const kind of ["one","none","slow"]){
    const c=await b.newContext({viewport:{width:1024,height:768}}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await c.addInitScript(kind=>{
      const ins=new Map(); if(kind==="one") ins.set("a",{name:"Keystation 49",onmidimessage:null});
      window.__midi={inputs:ins, onstatechange:null};
      navigator.requestMIDIAccess=()=> kind==="slow" ? new Promise(()=>{}) : Promise.resolve(window.__midi);
      localStorage.setItem("aog.lang","en");
    }, kind);
    const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.goto("http://localhost:9964/music-piano.html"); await p.waitForTimeout(900);
    await p.click("#midiBtn"); await p.waitForTimeout(250);
    const r=await p.evaluate(()=>{ const l=document.getElementById("midiLine"), row=document.querySelector(".krow"), kb=document.getElementById("kbd");
      return {text:l.textContent, under:l.getBoundingClientRect().top>=row.getBoundingClientRect().bottom-1 && l.getBoundingClientRect().bottom<=kb.getBoundingClientRect().top+1, sound:!!ac}; });
    if(kind==="one"){
      ok(/ready: Keystation 49/.test(r.text), "with a keyboard plugged in: '"+r.text+"'");
      ok(r.under, "the answer sits right under the buttons, above the keys");
      ok(r.sound, "the sound is started by the tap itself");
      await p.evaluate(()=>{ const i=[...window.__midi.inputs.values()][0]; i.onmidimessage({data:[0x90,60,100]}); });
      await p.waitForTimeout(80);
      ok(await p.evaluate(()=>LIVE.has("m60") && document.querySelector('#kbd [data-m="60"]').classList.contains("down")), "a MIDI key plays and lights its key on the screen");
      await p.evaluate(()=>{ const i=[...window.__midi.inputs.values()][0]; i.onmidimessage({data:[0x80,60,0]}); });
      await p.waitForTimeout(80);
      ok(await p.evaluate(()=>!LIVE.has("m60")), "letting go of the MIDI key ends the note");
    }
    if(kind==="none"){
      ok(/No MIDI keyboard yet/.test(r.text), "with nothing plugged in: '"+r.text+"'");
      await p.evaluate(()=>{ window.__midi.inputs.set("b",{name:"Launchkey 25",onmidimessage:null}); window.__midi.onstatechange && window.__midi.onstatechange({}); });
      await p.waitForTimeout(80);
      ok(await p.evaluate(()=>/ready: Launchkey 25/.test(document.getElementById("midiLine").textContent) && typeof [...window.__midi.inputs.values()][0].onmidimessage==="function"),
        "plugging one in afterwards says so and listens to it");
    }
    if(kind==="slow"){
      ok(/Looking for your MIDI keyboard/.test(r.text), "while the browser decides, the line says so at once: '"+r.text+"'");
      ok(r.sound, "and the sound is already started");
    }
    ok(errs.length===0, kind+": no page errors "+errs.join(" | "));
    await c.close();
  }
  /* the empty line takes no room */
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort()); await p.goto("http://localhost:9964/music-piano.html"); await p.waitForTimeout(600);
    ok(await p.evaluate(()=>getComputedStyle(document.getElementById("midiLine")).display==="none"), "before the button is pressed, the MIDI line takes no room"); await p.close(); }
  console.log((fails?fails+" FAILED, ":"")+passes+" passed");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
