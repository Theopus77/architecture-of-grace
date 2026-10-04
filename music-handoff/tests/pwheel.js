/* the chord wheel: hear any chord, the six pads lit, turn to change key, own patterns, the playing chord, minor, Spanish, keys */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9976);
let fails=0, passes=0; function ok(c,m){ if(c){ passes++; console.log("PASS "+m); } else { fails++; console.log("FAIL "+m); } }
(async()=>{
  const b=await pw.chromium.launch();
  const c=await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true});
  await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await c.addInitScript(()=>{ if(!sessionStorage.getItem("seeded")){ sessionStorage.setItem("seeded","1"); localStorage.setItem("aog.lang","en");
    localStorage.setItem("aog.piano.v1", JSON.stringify({sound:"grand",key:0,minor:false,prog:[{off:0,q:"maj"},{off:7,q:"maj"},{off:9,q:"min"},{off:5,q:"maj"}],preset:"pop",rhythm:"hold",bpm:120,oct:3,era:0,vol:0.8})); } });
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9976/music-piano.html"); await p.waitForTimeout(1200);
  const st=()=>p.evaluate(()=>{ const w=[...document.querySelectorAll("#wheel .wd")];
    const lab=g=>g.querySelector("text").textContent;
    return { fit:w.filter(g=>g.classList.contains("fit")).map(lab).sort(), now:w.filter(g=>g.classList.contains("now")).map(lab), hub:[...document.querySelectorAll("#wheel .hub-k,#wheel .hub-m")].map(x=>x.textContent).join(" "),
      key:S.key, minor:S.minor, pads:[...document.querySelectorAll(".pad")].map(x=>x.childNodes[1]?x.childNodes[1].textContent:x.textContent).join(" "),
      turnL:document.getElementById("turnL").textContent, turnR:document.getElementById("turnR").textContent, wedges:w.length,
      sounding:[...LIVE.keys()].filter(k=>k[0]==="p").map(k=>+k.slice(1)).sort((a,b)=>a-b), prog:S.prog.map(x=>x.off+x.q).join(" ") }; });
  const at=async label=>{ const tb=await p.evaluate(l=>{ const g=[...document.querySelectorAll("#wheel .wd")].find(g=>g.querySelector("text").textContent===l); g.scrollIntoView({block:"center"}); const r=g.querySelector("text").getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }, label); return tb; };
  const press=async label=>{ const tb=await at(label); await p.mouse.move(tb.x,tb.y); await p.mouse.down(); await p.waitForTimeout(40); };
  const lift=async()=>{ await p.mouse.up(); await p.waitForTimeout(40); };
  const tap=async label=>{ await press(label); await lift(); };
  let s=await st();
  ok(s.wedges===24, "24 chords on the wheel: 12 majors outside, 12 minors inside");
  ok(JSON.stringify(s.fit)===JSON.stringify(["Am","C","Dm","Em","F","G"]), "in C the six light chords are the six pads: "+s.fit.join(" "));
  ok(s.hub==="C major", "the middle says the key: "+s.hub);
  ok(s.turnL==="◀ Turn to F" && s.turnR==="Turn to G ▶", "the turn buttons say where they go: "+s.turnL+" / "+s.turnR);
  /* hear chords */
  await press("G"); s=await st();
  ok(JSON.stringify(s.sounding.map(m=>m%12).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b))===JSON.stringify([2,7,11]), "pressing G plays G, B and D ("+s.sounding.join(",")+")");
  await lift(); s=await st(); ok(s.sounding.length===0, "the chord stops when the finger lifts");
  await press("E♭"); s=await st();
  ok(JSON.stringify([...new Set(s.sounding.map(m=>m%12))].sort((a,b)=>a-b))===JSON.stringify([3,7,10]), "a chord outside the key plays too: E♭ is E♭, G and B♭");
  await lift();
  /* make my own, from the wheel */
  await p.click("#clearBtn"); await p.click("#ownBtn"); await p.waitForTimeout(100);
  for(const l of ["C","A♭","B♭","C"]) await tap(l);
  await p.click("#ownBtn"); s=await st();
  ok(s.prog==="0maj 8maj 10maj 0maj", "with Make my own on, wheel taps build the pattern (C A♭ B♭ C): "+s.prog);
  ok(await p.evaluate(()=>[...document.querySelectorAll("#prog .slot")].map(x=>x.textContent).join(" "))==="C A♭ B♭ C", "the pattern shows those chords");
  /* the playing chord turns orange */
  await p.click("#playBtn"); await p.waitForTimeout(300); s=await st();
  ok(s.now.length===1 && s.now[0]==="C", "while it plays, the chord that is playing is orange on the wheel ("+s.now.join(",")+")");
  await p.waitForFunction(()=>PLAY.cur===1, null, {timeout:6000}); await p.waitForTimeout(60); s=await st();
  ok(s.now.length===1 && s.now[0]==="A♭", "the orange moves with the chords: "+s.now.join(","));
  await p.click("#playBtn"); await p.waitForTimeout(150); s=await st(); ok(s.now.length===0, "after Stop nothing is orange");
  /* turn the wheel */
  await p.click("#turnR"); s=await st();
  ok(s.key===7 && JSON.stringify(s.fit)===JSON.stringify(["Am","Bm","C","D","Em","G"]) && s.hub==="G major", "Turn to G: the key is G and the light six move one step ("+s.fit.join(" ")+")");
  ok(await p.evaluate(()=>document.getElementById("keySel").value)==="7", "the Key menu follows the wheel");
  ok(s.turnL==="◀ Turn to C" && s.turnR==="Turn to D ▶", "and the buttons say the next steps: "+s.turnL+" / "+s.turnR);
  await p.click("#turnL"); await p.click("#turnL"); s=await st();
  ok(s.key===5 && s.hub==="F major", "two turns back: F major");
  await p.click("#turnL"); s=await st(); ok(s.key===10 && /B♭/.test(s.hub), "one more: B♭ major ("+s.hub+")");
  /* the Key menu moves the wheel too */
  await p.selectOption("#keySel","2"); await p.waitForTimeout(80); s=await st(); ok(s.hub==="D major" && s.fit.includes("F♯m"), "picking D in the Key menu moves the wheel ("+s.fit.join(" ")+")");
  /* minor */
  await p.selectOption("#keySel","9"); await p.click("#minBtn"); await p.waitForTimeout(80); s=await st();
  ok(s.hub==="A minor" && JSON.stringify(s.fit)===JSON.stringify(["Am","C","Dm","Em","F","G"]), "A minor: the same six chords, home on the inside ("+s.hub+")");
  ok(await p.evaluate(()=>{ const h=document.querySelector("#wheel .home"); return !!h; }), "the home chord has its gold ring");
  ok(s.turnR==="Turn to Em ▶", "in minor the buttons turn to minor keys: "+s.turnR);
  /* keyboard */
  const kb=await p.evaluate(()=>{ const g=[...document.querySelectorAll("#wheel .wd")].find(g=>g.querySelector("text").textContent==="Dm"); g.focus(); return document.activeElement===g; });
  ok(kb, "a chord on the wheel takes keyboard focus");
  await p.keyboard.down("Enter"); await p.waitForTimeout(80); s=await st(); await p.keyboard.up("Enter");
  ok(JSON.stringify([...new Set(s.sounding.map(m=>m%12))].sort((a,b)=>a-b))===JSON.stringify([2,5,9]), "Enter plays it (Dm: D F A)");
  ok(await p.evaluate(()=>document.activeElement && document.activeElement.getAttribute("data-k")==="i11"), "focus stays on that chord after the wheel redraws");
  /* Spanish */
  await p.click("#langBtn").catch(()=>{}); await p.evaluate(()=>{ if(S.lang!=="es"){ S.lang="es"; save(); paintText(); } }); await p.waitForTimeout(150); s=await st();
  ok(s.hub==="La menor" && s.fit.includes("Lam") && s.fit.includes("Do"), "in Spanish: La menor, Lam, Do … ("+s.fit.join(" ")+")");
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log((fails?fails+" FAILED, ":"")+passes+" passed");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
