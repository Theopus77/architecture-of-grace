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
      /* one offline context and chain per pattern, shared by its ways (44 patterns × every way would otherwise build 800+ chains) */
      for(const pr of PRESETS){ const oc=new OfflineAudioContext(2, 44100, 44100), ch=makeChain(oc); for(const rh of RHYTHMS){
        S.preset=pr.id; S.prog=pr.chords.map(c=>({off:c.off,q:c.q})); S.minor=pr.minor; S.rhythm=rh; S.key=pr.minor?9:0;
        let bad=[], count=0; const line=[];
        for(let k=0;k<S.prog.length;k++){
          const vs=scheduleBar(oc, ch, k, k*2, 2, 0.5), chord=S.prog[k], pcs=chordPcs(chord);
          count+=vs.length;
          if(!vs.length) bad.push("bar "+(k+1)+" silent");
          /* AOG-STRINGS-WAYS-V1: every note is in the chord, except a note marked as on the way ("pass") or played early ("ant":
             in the next chord). On the guitar a note on the way is the root's sixth or seventh (the shuffle); on the bass it is a
             step (one or two half steps) from the note before it or after it in the line (checked below) */
          const next=S.prog[(k+1)%S.prog.length], npcs=chordPcs(next), root=pcs[0], iv=(a,b)=>((a-b)%12+12)%12, seen={};
          vs.forEach(v=>{ if(!(v.on<v.off)) bad.push("note ends before it starts");
            const pc=v.m%12;
            if(!GTR) line.push(v);
            if(v.role==="ant"){ if(npcs.indexOf(pc)<0) bad.push("bar "+(k+1)+" early note "+v.m+" not in the next chord "+chordName(next)); }
            else if(v.role==="pass"){ if(GTR && [9,10,11].indexOf(iv(pc,root))<0) bad.push("bar "+(k+1)+" passing note "+v.m+" is not a sixth or seventh of "+chordName(chord)); }
            else if(pcs.indexOf(pc)<0) bad.push("bar "+(k+1)+" "+v.m+" not in "+chordName(chord));
            if(!v.cell) bad.push("no place on the neck for "+v.m);
            else { const id=v.cell.split(":")[0]+"@"+Math.round(v.on*1000); if(seen[id]) bad.push("bar "+(k+1)+" a string started twice at once"); seen[id]=1; } });
          if(GTR){ const per={}; vs.forEach(v=>{ const s=v.cell.split(":")[0]; (per[s]=per[s]||[]).push(v); });
            Object.values(per).forEach(list=>{ list.sort((x,y)=>x.on-y.on); for(let i=1;i<list.length;i++) if(list[i].on<list[i-1].off-0.03) bad.push("bar "+(k+1)+" two notes at once on one string"); }); }
        }
        /* a note on the way sits a step from a neighbour in the line; the last one leads into the bar that comes next (the
           pattern's first chord, as bar number len, since a walking line changes from bar to bar) */
        if(!GTR){ const L=S.prog.length, after=lineEvents(rh, S.prog[0], S.prog[1%L], L).slice().sort((x,y)=>x.t-y.t)[0].m;
          line.sort((x,y)=>x.on-y.on).forEach((v,i)=>{ if(v.role!=="pass") return; const a=i?line[i-1].m:null, z=line[i+1]?line[i+1].m:after;
            if(!(a!=null && Math.abs(v.m-a)<=2) && Math.abs(v.m-z)>2) bad.push("passing note "+v.m+" is not a step from "+a+" or "+z); }); }
        out.push({p:pr.id, rh:rh, n:count, bad:[...new Set(bad)].slice(0,3)});
      } }
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
    /* AOG-STRINGS-KEYS-V3: numbers chords; letters notes as on the piano; the guitar picks its strings on the bottom row */
    if(inst==="guitar"){ for(const k of ["KeyZ","KeyX","KeyC","KeyV","KeyB","KeyN"]) await p.keyboard.press(k);
      ok(JSON.stringify(await p.evaluate("__v"))===JSON.stringify(await p.evaluate("shapeFor(S.hand).map((f,s)=>f>=0?TUNING[s]+f:null).filter(x=>x!=null)")), "Z X C V B N play the six strings of the G chord: "+await p.evaluate("__v.join(',')"));
      await p.evaluate("__v=[]"); }
    for(const k of ["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK"]) await p.keyboard.press(k);
    { const v=await p.evaluate("__v"); ok(v.length===8 && v[7]-v[0]===12 && v.map(m=>m%12).join()==="0,2,4,5,7,9,11,0" && v[0]===(inst==="guitar"?48:36), "A to K are the white keys, C to C, as on the piano: "+v.join(",")); }
    await p.evaluate("__v=[]"); for(const k of ["KeyW","KeyE","KeyT","KeyY","KeyU"]) await p.keyboard.press(k);
    { const v=await p.evaluate("__v"); ok(v.map(m=>m%12).join()==="1,3,6,8,10", "W E T Y U are the black keys between them: "+v.join(",")); }
    { const kl=await p.evaluate(()=>({ caps:[...document.querySelectorAll("#neck .nk-key text")].map(t=>t.textContent).join(""), map:getComputedStyle(document.getElementById("keyMap")).display!=="none" && /Play it on a keyboard/i.test(document.getElementById("keyMap").textContent) }));
      ok(kl.map && kl.caps===(inst==="guitar" ? "ZXCVBN" : ""), "the keys are drawn: a small keyboard picture"+(inst==="guitar" ? ", and Z to N on the strum strip" : "")+": "+kl.caps); }
    await p.keyboard.press("ArrowRight"); ok((await p.evaluate("S.fret0"))===2, "→ moves up the neck"); await p.keyboard.press("ArrowLeft");
    await p.keyboard.press("Space"); await p.waitForTimeout(200); ok(await p.evaluate("S.playing"), "Space starts"); await p.keyboard.press("Space"); await p.waitForTimeout(50); ok(await p.evaluate("!S.playing"), "and stops");
    /* 7. Spanish */
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
    const es=await p.evaluate(()=>({h:document.getElementById("mastH").textContent, pad:document.querySelector(".pad").textContent, open:[...document.querySelectorAll("#neck .nk-name")].map(e=>e.textContent).join(" "),
      menu:[...document.querySelectorAll(".bench-bar select option")].map(o=>o.textContent).join("|"), rh:document.getElementById("rhythmSel").selectedOptions[0].textContent, neckH:document.querySelector("[data-t=neckH]").textContent, lang:document.documentElement.lang}));
    ok(es.lang==="es" && /La guitarra|El bajo/.test(es.h) && /Do/.test(es.pad) && /Mi La Re Sol/.test(es.open), `Spanish: ${es.h}; pad ${es.pad.replace(/\s+/g," ").trim()}; strings ${es.open}`);
    ok(/Trastes y cuerdas/.test(es.neckH) && es.menu==="Caja de ritmos|Batería|Piano|Guitarra|Bajo|Banda|Tocadiscos|Mesa de mezclas", `the words and the tools menu change too: ${es.menu}`);
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(200);
    /* 8. saving */
    await p.selectOption("#soundSel", inst==="guitar"?"nylon":"upright"); await p.selectOption("#keySel", "7"); await p.mouse.click(5, 300); await p.keyboard.press("ArrowRight");
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
function PRESET_COUNT(inst){ return 59*(inst==="guitar"?21:19); }   /* AOG-STRINGS-WAYS-V1: 59 patterns; 21 ways on the guitar, 19 on the bass */
