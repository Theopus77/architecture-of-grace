/* Playing: every pattern with every way of playing it (scheduled offline, notes checked), then the real player with
   its lights, the drum beat from the shared shelf, Send to the turntables, the computer keys, Spanish, and saving. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9977);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const inst of ["guitar","bass"]){
    const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
    const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9977/music-${inst}.html`); await p.waitForTimeout(1000);
    console.log("== "+inst);
    /* 1. every pattern × every way of playing: one pass of the pattern, scheduled on an offline context */
    const sch=await p.evaluate(()=>{
      const out=[]; const keep=[S.preset,S.prog,S.minor,S.rhythm,S.key];
      for(const pr of PRESETS) for(const rh of RHYTHMS){
        S.preset=pr.id; S.prog=pr.chords.map(c=>({off:c.off,q:c.q})); S.minor=pr.minor; S.rhythm=rh; S.key=pr.minor?9:0;
        const oc=new OfflineAudioContext(2, 44100, 44100), ch=makeChain(oc); let bad=[], count=0;
        for(let k=0;k<S.prog.length;k++){
          const vs=scheduleBar(oc, ch, k, k*2, 2, 0.5), chord=S.prog[k], pcs=chordPcs(chord);
          count+=vs.length;
          if(!vs.length) bad.push("bar "+(k+1)+" silent");
          vs.forEach(v=>{ if(!(v.on<v.off)) bad.push("note ends before it starts");
            if(GTR && pcs.indexOf(v.m%12)<0) bad.push("bar "+(k+1)+" "+v.m+" not in "+chordName(chord));
            if(!v.cell) bad.push("no place on the neck for "+v.m); });
          if(!GTR && rh!=="walk"){ const bass=vs.map(v=>v.m%12); if(bass.some(x=>pcs.indexOf(x)<0)) bad.push("bar "+(k+1)+" bass note outside "+chordName(chord)); }
          if(GTR){ const per={}; vs.forEach(v=>{ const s=v.cell.split(":")[0]; (per[s]=per[s]||[]).push(v); });
            Object.values(per).forEach(list=>{ list.sort((x,y)=>x.on-y.on); for(let i=1;i<list.length;i++) if(list[i].on<list[i-1].off-0.03) bad.push("bar "+(k+1)+" two notes at once on one string"); }); }
        }
        out.push({p:pr.id, rh:rh, n:count, bad:[...new Set(bad)].slice(0,3)});
      }
      [S.preset,S.prog,S.minor,S.rhythm,S.key]=keep;
      return out;
    });
    const badOnes=sch.filter(x=>x.bad.length);
    ok(sch.length===PRESET_COUNT(inst) && badOnes.length===0, `${sch.length} pattern × playing pairs scheduled, all notes right${badOnes.length?": "+JSON.stringify(badOnes.slice(0,4)):""}`);
    const per=sch.reduce((a,x)=>{ a[x.rh]=(a[x.rh]||0)+x.n; return a; },{});
    console.log("     notes per way of playing:", JSON.stringify(per));
    /* 2. the real player: Pop, folk strum or walking bass; the lights follow */
    await p.selectOption("#progSel", "pop"); await p.selectOption("#rhythmSel", inst==="guitar"?"folk":"walk");
    await p.evaluate(()=>{ S.bpm=120; $("bpm").value="120"; });
    await p.click("#playBtn"); await p.waitForTimeout(300);
    const seen={now:new Set(), fit:0, slots:new Set(), pads:new Set(), wheel:new Set()};
    for(let i=0;i<70;i++){
      const st=await p.evaluate(()=>({now:[...document.querySelectorAll("#neck .dot.now")].map(g=>g.getAttribute("data-c")), fit:document.querySelectorAll("#neck .dot.fit").length,
        slot:[...document.querySelectorAll(".slot.now")].map(e=>e.textContent).join(), pad:[...document.querySelectorAll(".pad.now")].map(e=>e.getAttribute("data-i")).join(),
        wheel:[...document.querySelectorAll("#wheel .wd.now")].map(e=>e.getAttribute("data-k")).join(), lit:!document.getElementById("litLine").hidden, btn:document.getElementById("playBtn").textContent}));
      st.now.forEach(x=>seen.now.add(x)); seen.fit=Math.max(seen.fit, st.fit); seen.slots.add(st.slot); seen.pads.add(st.pad); seen.wheel.add(st.wheel); seen.lit=seen.lit||st.lit; seen.btn=st.btn;
      await p.waitForTimeout(100);
    }
    ok(seen.now.size>=(inst==="guitar"?8:4), `orange notes walk across the neck while it plays (${seen.now.size} places): ${[...seen.now].slice(0,14).join(" ")}`);
    ok([...seen.slots].filter(Boolean).length>=3, "the pattern's chords take turns lighting: "+[...seen.slots].filter(Boolean).join(" → "));
    ok([...seen.pads].filter(Boolean).length>=3 && [...seen.wheel].filter(Boolean).length>=3, "the pads and the wheel follow the chords");
    ok(seen.lit && /Stop|Parar/.test(seen.btn), "the line about the lights shows, and Play became Stop");
    await p.click("#playBtn"); await p.waitForTimeout(150);
    ok(await p.evaluate(()=>!S.playing && PLAY.voices.length===0 && !document.querySelector("#neck .dot.now")), "Stop stops it, and the orange goes out");
    /* 3. the window moves while a chord is in the hand: the shape follows */
    if(inst==="guitar"){
      const sh=await p.evaluate(()=>{ S.hand={off:0,q:"maj"}; const a=shapeFor(S.hand).join(); S.fret0=8; buildNeck(); const b=shapeFor(S.hand).join(); const dots=[...document.querySelectorAll("#neck .dot.fit")].map(g=>g.getAttribute("data-c")); S.fret0=1; buildNeck(); return {a,b,dots}; });
      ok(sh.a!==sh.b && sh.dots.every(d=>+d.split(":")[1]>=8), `C near the nut ${sh.a}, up at fret 8 ${sh.b}; its dots move with it: ${sh.dots.join(" ")}`);
    }
    /* 4. the drum beat from the drum machine's shelf (a made-up one-bar click track) */
    await p.evaluate(async()=>{
      const sr=44100, n=sr*2, L=new Float32Array(n); for(let k=0;k<4;k++) for(let i=0;i<300;i++) L[k*sr/2+i]=Math.sin(i/3)*(1-i/300);
      const blob=wavBlob(L, L, sr); await AOGHandoff.put("drumbench", {name:"Test beat", bpm:120, bars:1, offset:0, wav:blob}); await checkDrums(); });
    ok(await p.evaluate(()=>!!document.getElementById("drumBtn")), "a beat on the shelf shows Play with my drum beat");
    await p.click("#drumBtn"); await p.waitForTimeout(100);
    ok(await p.evaluate(()=>S.withDrums && document.getElementById("bpm").disabled && /120/.test(document.getElementById("bpmOut").textContent)), "with it on, the tempo comes from the beat (120)");
    await p.click("#playBtn"); await p.waitForTimeout(700);
    ok(await p.evaluate(()=>!!PLAY.drum && PLAY.voices.length>0), "the chords play with the beat");
    await p.click("#playBtn"); await p.click("#drumBtn"); await p.waitForTimeout(50);
    /* 5. Send to the turntables */
    await p.click("#sendBtn");
    await p.waitForFunction(()=>/Sent|Enviado|did not|No funcion/.test(document.getElementById("sendLine").textContent), null, {timeout:20000});
    const shelf=await p.evaluate(async(sh)=>{ const x=await AOGHandoff.get(sh); return x?{name:x.name, bars:x.bars, bpm:x.bpm, size:x.wav.size, line:document.getElementById("sendLine").textContent}:null; }, inst+"bench");
    ok(shelf && shelf.size>44100*4*10 && shelf.bars>=4, `Send leaves a recording on the "${inst}bench" shelf: ${shelf&&shelf.name} (${shelf&&Math.round(shelf.size/1024)} KB)`);
    /* 6. the computer keys */
    await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,id,m,v,when,s){ if(cx===ac) window.__v.push(m); return mv.apply(this,arguments); }; document.activeElement.blur(); muteAll(); });
    await p.keyboard.press("Digit5"); await p.waitForTimeout(50);
    ok((await p.evaluate("__v.length"))>=1 && (await p.evaluate("S.hand.off"))===7, "key 5 plays pad 5 (G)");
    await p.evaluate("__v=[]");
    if(inst==="guitar"){ for(const k of ["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH"]) await p.keyboard.press(k);
      ok(JSON.stringify(await p.evaluate("__v"))===JSON.stringify(await p.evaluate("shapeFor(S.hand).map((f,s)=>f>=0?TUNING[s]+f:null).filter(x=>x!=null)")), "A S D F G H play the six strings of the G chord: "+await p.evaluate("__v.join(',')")); }
    else { for(const k of ["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK"]) await p.keyboard.press(k);
      const v=await p.evaluate("__v"); ok(v.length===8 && v[7]-v[0]===12 && v.map(m=>m%12).join()==="0,2,4,5,7,9,11,0", "A to K play the C major scale: "+v.join(",")); }
    await p.keyboard.press("KeyX"); ok((await p.evaluate("S.fret0"))===2, "X moves up the neck"); await p.keyboard.press("KeyZ");
    await p.keyboard.press("Space"); await p.waitForTimeout(200); ok(await p.evaluate("S.playing"), "Space starts"); await p.keyboard.press("Space"); await p.waitForTimeout(50); ok(await p.evaluate("!S.playing"), "and stops");
    /* 7. Spanish */
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
    const es=await p.evaluate(()=>({h:document.getElementById("mastH").textContent, pad:document.querySelector(".pad").textContent, open:[...document.querySelectorAll("#neck .nk-name")].map(e=>e.textContent).join(" "),
      menu:[...document.querySelectorAll(".bench-bar select option")].map(o=>o.textContent).join("|"), rh:document.getElementById("rhythmSel").selectedOptions[0].textContent, neckH:document.querySelector("[data-t=neckH]").textContent, lang:document.documentElement.lang}));
    ok(es.lang==="es" && /La guitarra|El bajo/.test(es.h) && /Do/.test(es.pad) && /Mi La Re Sol/.test(es.open), `Spanish: ${es.h}; pad ${es.pad.replace(/\s+/g," ").trim()}; strings ${es.open}`);
    ok(/Trastes y cuerdas/.test(es.neckH) && es.menu==="Ritmos|Piano|Guitarra|Bajo|Banda|Tocadiscos", `the words and the tools menu change too: ${es.menu}`);
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(200);
    /* 8. saving */
    await p.selectOption("#soundSel", inst==="guitar"?"nylon":"upright"); await p.selectOption("#keySel", "7"); await p.keyboard.press("KeyX");
    await p.reload(); await p.waitForTimeout(800);
    const back=await p.evaluate(()=>({sound:S.sound, key:S.key, fret0:S.fret0, sets:Object.keys(SETS).join()}));
    ok(back.sound===(inst==="guitar"?"nylon":"upright") && back.key===7 && back.fret0===2, "after a reload: the same instrument, key and place on the neck "+JSON.stringify(back));
    ok(back.sets===back.sound, "only that instrument's notes are made: "+back.sets);
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
function PRESET_COUNT(inst){ return 18*(inst==="guitar"?7:6); }   /* the guitar has Chug and Gallop too (AOG-GUITAR-METAL-V1) */
