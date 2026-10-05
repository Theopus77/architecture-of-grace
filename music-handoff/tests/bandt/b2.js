/* The Band: the whole flow — pattern and lights, the drum beat, Send to the turntables, chords for the drum machine,
   computer keys, grey keys, the wheel, Spanish, and saving */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9982);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const dev of ["iPhone 13","iPad (gen 7)","Desktop Chrome"]){
    console.log("== "+dev);
    const c=await b.newContext(pw.devices[dev]); const p=await c.newPage();
    const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9982/music-band.html"); await p.waitForTimeout(600);
    await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:30000});
    /* 1. a pattern, played: the lights follow, Stop stops */
    await p.selectOption("#progSel","pop"); await p.selectOption("#rhythmSel","march");
    await p.click("#playBtn"); await p.waitForTimeout(300);
    let seen=null, maxNow=0, nowKeys=new Set();
    for(let i=0;i<24;i++){ await p.waitForTimeout(100);
      seen=await p.evaluate(()=>({lit:!document.getElementById("litLine").hidden, btn:document.getElementById("playBtn").textContent, keys:[...document.querySelectorAll("#kbd .now")].map(e=>+e.getAttribute("data-m")),
        now:document.querySelectorAll("#kbd .now").length, fit:document.querySelectorAll("#kbd .lit").length, slot:document.querySelectorAll(".slot.now").length, pad:document.querySelectorAll(".pad.now").length, wheel:document.querySelectorAll("#wheel .wd.now").length}));
      maxNow=Math.max(maxNow, seen.now); seen.keys.forEach(k=>nowKeys.add(k)); }
    seen.now=maxNow; seen.keys=[...nowKeys].sort((a,b)=>a-b);
    ok(seen.lit && /Stop/.test(seen.btn) && seen.slot===1 && seen.pad===1 && seen.wheel===1 && seen.now>=1 && seen.now+seen.fit>=3, "playing: the lights line shows, one bar, one pad and one wedge lit, keys lit "+JSON.stringify(seen));
    await p.click("#playBtn"); await p.waitForTimeout(150);
    ok(await p.evaluate(()=>!S.playing && PLAY.voices.length===0 && !document.querySelector("#kbd .now") && !document.querySelector(".slot.now")), "Stop stops it, and the lights go out");
    /* 2. the drum beat from the drum machine's shelf (a made-up one-bar click) */
    await p.evaluate(async()=>{
      const sr=44100, n=sr*2, L=new Float32Array(n); for(let k=0;k<4;k++) for(let i=0;i<300;i++) L[k*sr/2+i]=Math.sin(i/3)*(1-i/300);
      await AOGHandoff.put("drumbench", {name:"Test beat", bpm:120, bars:1, offset:0, wav:wavBlob(L, L, sr)}); await checkDrums(); });
    ok(await p.evaluate(()=>!!document.getElementById("drumBtn")), "a beat on the shelf shows Play with my drum beat");
    await p.click("#drumBtn"); await p.waitForTimeout(100);
    ok(await p.evaluate(()=>S.withDrums && document.getElementById("bpm").disabled && /120/.test(document.getElementById("bpmOut").textContent)), "with it on, the tempo comes from the beat (120)");
    await p.click("#playBtn"); await p.waitForTimeout(700);
    ok(await p.evaluate(()=>!!PLAY.drum && PLAY.voices.length>0), "the band plays with the beat");
    await p.click("#playBtn"); await p.click("#drumBtn"); await p.waitForTimeout(50);
    if(dev==="iPhone 13"){
      /* 3. Send to the turntables: a real recording, not silent, not clipped */
      await p.selectOption("#soundSel","brass"); await p.waitForFunction(()=>soundReady("brass"), null, {timeout:60000});
      await p.click("#sendBtn");
      await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("sendLine").textContent), null, {timeout:60000});
      const sh=await p.evaluate(async()=>{ const x=await AOGHandoff.get("bandbench"); if(!x) return null;
        const c=new OfflineAudioContext(2,1,44100), buf=await c.decodeAudioData(await x.wav.arrayBuffer()), d=buf.getChannelData(0);
        let pk=0, ss=0, hot=0; for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); if(a>pk) pk=a; ss+=d[i]*d[i]; if(a>0.985) hot++; }
        return {name:x.name, bars:x.bars, bpm:x.bpm, secs:+buf.duration.toFixed(1), peak:+pk.toFixed(3), rmsDb:+(10*Math.log10(ss/d.length)).toFixed(1), hot, line:document.getElementById("sendLine").textContent}; });
      ok(sh && sh.bars>=4 && sh.secs>20 && sh.peak>0.2 && sh.hot<50, "Send leaves the band on the \"bandbench\" shelf: "+JSON.stringify(sh));
      /* 4. chords for the drum machine */
      await p.click("#padsBtn");
      await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("padsLine").textContent), null, {timeout:60000});
      const cp=await p.evaluate(async()=>{ const x=await AOGHandoff.get("chordpads"); if(!x) return null;
        return {from:x.from, name:x.name, n:x.pads.length, en:x.pads.map(q=>q.en).join(" "), es:x.pads.map(q=>q.es).join(" "), len:x.pads.map(q=>q.pcm.length), peaks:x.pads.map(q=>{ let m=0; for(const v of q.pcm) m=Math.max(m,Math.abs(v)); return +m.toFixed(2); })}; });
      ok(cp && cp.from==="band" && cp.n===6 && cp.len.every(l=>l===Math.ceil(1.4*26040)) && cp.peaks.every(x=>x===0.8), "six chord pads go to the drum machine, from the band: "+JSON.stringify(cp));
      await p.selectOption("#soundSel","trumpet"); await p.waitForFunction(()=>soundReady("trumpet"), null, {timeout:60000});
    }
    /* 5. the computer keys */
    await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,inst,m){ if(cx===ac) window.__v.push(m); return mv.apply(this,arguments); }; document.activeElement.blur(); allOff(); });
    await p.keyboard.down("Digit5"); await p.waitForTimeout(60);
    ok((await p.evaluate("__v.length"))>=3 && await p.evaluate(()=>document.querySelector('.pad[data-i="4"]').classList.contains("hit")), "key 5 holds pad 5 (G): "+await p.evaluate("__v.join(',')"));
    await p.keyboard.up("Digit5"); await p.waitForTimeout(60);
    ok(await p.evaluate(()=>[...LIVE.values()].length===0), "and letting go lets the chord go");
    await p.evaluate("__v=[]");
    for(const k of ["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK"]) await p.keyboard.press(k);
    const sc=await p.evaluate("__v"), all=await p.evaluate(()=>[0,2,4,5,7,9,11,12].map(i=>KB.lo+i)), want=await p.evaluate(()=>[0,2,4,5,7,9,11,12].map(i=>KB.lo+i).filter(m=>playerFor(m)));
    ok(JSON.stringify(sc)===JSON.stringify(want) && want.length>=6, "A to K play the C major scale, all but the grey keys: "+sc.join(",")+" (grey: "+all.filter(m=>want.indexOf(m)<0).join(",")+")");
    const o1=await p.evaluate("S.oct"); await p.keyboard.press("KeyX"); const o2=await p.evaluate("S.oct"); await p.keyboard.press("KeyZ");
    ok(o2===o1+1 && (await p.evaluate("S.oct"))===o1, "X goes an octave up and Z back down");
    await p.keyboard.press("Space"); await p.waitForTimeout(200); ok(await p.evaluate("S.playing"), "Space starts"); await p.keyboard.press("Space"); await p.waitForTimeout(50); ok(await p.evaluate("!S.playing"), "and stops");
    /* 6. grey keys: the flute, taken as low as it goes */
    await p.selectOption("#soundSel","flute"); await p.waitForFunction(()=>soundReady("flute"), null, {timeout:60000});
    for(let i=0;i<6;i++){ if(await p.evaluate(()=>document.getElementById("downBtn").disabled)) break; await p.click("#downBtn"); }
    const grey=await p.evaluate(()=>({out:[...document.querySelectorAll("#kbd .out")].map(e=>+e.getAttribute("data-m")), lo:KB.lo, hi:KB.hi, range:soundRange("flute"), dis:document.getElementById("downBtn").disabled}));
    ok(grey.dis && grey.out.length>0 && grey.out.every(m=>m<grey.range[0]||m>grey.range[1]), "at the bottom of the flute, the keys it cannot play are grey: "+JSON.stringify(grey));
    await p.evaluate("__v=[]"); await p.locator("#kbd .out").first().scrollIntoViewIfNeeded();
    const ob=await p.locator("#kbd .out").first().boundingBox(); await p.mouse.click(ob.x+ob.width/2, ob.y+ob.height*0.8); await p.waitForTimeout(80);
    ok((await p.evaluate("__v.length"))===0, "and a grey key stays silent");
    for(let i=0;i<8;i++){ if(await p.evaluate(()=>document.getElementById("upBtn").disabled)) break; await p.click("#upBtn"); }
    const top=await p.evaluate(()=>({lo:KB.lo, hi:KB.hi, range:soundRange("flute"), out:document.querySelectorAll("#kbd .out").length}));
    ok(top.hi>=top.range[1]-12, "Higher goes up to the top of the flute: "+JSON.stringify(top));
    /* 7. the wheel: a finger on a wedge holds its chord */
    await p.evaluate("__v=[]"); await p.locator("#wheel").scrollIntoViewIfNeeded();
    const wd=await p.locator('#wheel [data-k="o1"] path').boundingBox();
    await p.mouse.move(wd.x+wd.width/2, wd.y+wd.height/2); await p.mouse.down(); await p.waitForTimeout(80);
    const held=await p.evaluate(()=>({n:__v.length, live:LIVE.size, gold:!!document.querySelector('#wheel [data-k="o1"].hit')}));
    await p.mouse.up(); await p.waitForTimeout(80);
    ok(held.n>=3 && held.live>=3 && held.gold && (await p.evaluate("LIVE.size"))===0, "a wedge holds its chord (G) while pressed, then lets go: "+JSON.stringify(held));
    /* 8. no sideways scroll */
    const w=await p.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth}));
    ok(w.sw<=w.iw, "nothing sticks out sideways "+JSON.stringify(w));
    await p.evaluate(()=>scrollTo(0,0)); await p.screenshot({path:`b2-${dev.replace(/\W+/g,"")}.png`, fullPage:true});
    if(dev==="iPhone 13"){
      /* 9. Spanish */
      await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
      const es=await p.evaluate(()=>({h:document.getElementById("mastH").textContent, pad:document.querySelector(".pad").textContent, sounds:[...document.querySelectorAll("#soundSel option")].map(o=>o.textContent).join("|"),
        groups:[...document.querySelectorAll("#soundSel optgroup")].map(o=>o.label).join("|"), menu:[...document.querySelectorAll(".bench-bar select option")].map(o=>o.textContent).join("|"),
        rh:[...document.querySelectorAll("#rhythmSel option")].map(o=>o.textContent).join("|"), load:document.getElementById("loadLine").textContent, lang:document.documentElement.lang}));
      ok(es.lang==="es" && es.h==="La banda" && /Do/.test(es.pad) && /Trompeta/.test(es.sounds) && es.groups==="Metales|Maderas|Cuerdas|Percusión|Jazz|Bandas|Todos" && /Orquesta · todos tocan/.test(es.sounds), "Spanish: "+JSON.stringify(es));
      ok(/Ritmos\|Batería\|Máquina de pads\|Piano\|Guitarra\|Bajo\|Banda\|Tocadiscos/.test(es.menu), "the tools menu in Spanish: "+es.menu);
      await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(200);
      /* 10. saving */
      await p.selectOption("#soundSel","oboe"); await p.selectOption("#keySel","2"); await p.selectOption("#rhythmSel","fanfare");
      await p.reload(); await p.waitForTimeout(900);
      const back=await p.evaluate(()=>({sound:S.sound, key:S.key, rhythm:S.rhythm, preset:S.preset, sets:Object.keys(SETS).join(), sel:document.getElementById("soundSel").value}));
      ok(back.sound==="oboe" && back.key===2 && back.rhythm==="fanfare" && back.preset==="pop" && back.sel==="oboe", "after a reload: the same instrument, key, rhythm and pattern "+JSON.stringify(back));
      ok(back.sets==="oboe", "only the oboe's recordings are fetched: "+back.sets);
    }
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
