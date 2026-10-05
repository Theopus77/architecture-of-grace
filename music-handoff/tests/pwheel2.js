/* the chord wheel, v2: instant at the touch, held while pressed, and lit by every chord the fingers play */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9980);
let fails=0, passes=0; function ok(c,m){ if(c){ passes++; console.log("PASS "+m); } else { fails++; console.log("FAIL "+m); } }
(async()=>{
  const b=await pw.chromium.launch();
  const c=await b.newContext({viewport:{width:768,height:1024}, deviceScaleFactor:1, hasTouch:true});
  await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await c.addInitScript(()=>{ if(!sessionStorage.getItem("seeded")){ sessionStorage.setItem("seeded","1"); localStorage.setItem("aog.lang","en");
    localStorage.setItem("aog.piano.v1", JSON.stringify({sound:"epwarm",key:0,minor:false,prog:[{off:0,q:"maj"},{off:7,q:"maj"},{off:9,q:"min"},{off:5,q:"maj"}],preset:"pop",rhythm:"hold",bpm:120,oct:3,era:0,vol:0.8})); } });
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9980/music-piano.html"); await p.waitForTimeout(1200);
  const cdp=await c.newCDPSession(p);
  const where=label=>p.evaluate(l=>{ const g=[...document.querySelectorAll("#wheel .wd")].find(g=>g.querySelector("text").textContent===l); g.scrollIntoView({block:"center"}); const r=g.querySelector("text").getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }, label);
  const look=()=>p.evaluate(()=>{ const w=[...document.querySelectorAll("#wheel .wd")], lab=g=>g.querySelector("text").textContent;
    return { hit:w.filter(g=>g.classList.contains("hit")).map(lab), now:w.filter(g=>g.classList.contains("now")).map(lab),
      sounding:[...new Set([...LIVE.keys()].filter(k=>k[0]==="p").map(k=>(+k.slice(1))%12))].sort((a,b)=>a-b), prog:S.prog.map(x=>x.off+x.q).join(" ") }; });
  /* 1 · a finger lands on G: sound and gold at once, before it lifts */
  let pt=await where("G");
  await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:pt.x,y:pt.y,id:1}]});
  let s=await look();
  ok(JSON.stringify(s.sounding)==="[2,7,11]" && s.hit.join()==="G", "the moment a finger lands on G, G sounds and turns gold (no waiting for the lift): "+s.sounding+" / "+s.hit);
  await p.waitForTimeout(600); s=await look(); ok(s.sounding.length===3, "it keeps sounding while the finger stays down");
  await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]}); await p.waitForTimeout(40); s=await look();
  ok(s.sounding.length===0 && s.hit.length===0, "the finger lifts: the chord stops and the gold goes");
  /* 2 · a pad lights its chord on the wheel */
  const pad=await p.$('.pad[data-i="4"]'); await pad.scrollIntoViewIfNeeded(); const pb=await pad.boundingBox();
  await p.mouse.move(pb.x+pb.width/2, pb.y+pb.height/2); await p.mouse.down(); s=await look();
  ok(s.hit.join()==="G", "pad 5 (G) is down: G is gold on the wheel ("+s.hit+")");
  await p.mouse.up(); await p.waitForTimeout(30); s=await look(); ok(s.hit.length===0, "the pad lifts: the wheel lets go");
  const pad6=await p.$('.pad[data-i="5"]'); const p6=await pad6.boundingBox(); await p.mouse.move(p6.x+p6.width/2, p6.y+p6.height/2); await p.mouse.down(); s=await look();
  ok(s.hit.join()==="Am", "pad 6 (Am) lights Am, on the inside ring");
  await p.mouse.up();
  /* 3 · the number keys */
  await p.evaluate(()=>{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
  await p.keyboard.down("Digit4"); s=await look(); ok(s.hit.join()==="F", "key 4 plays pad 4 and lights F ("+s.hit+")");
  await p.keyboard.up("Digit4"); await p.waitForTimeout(950); s=await look(); ok(s.hit.length===0, "and lets go after ("+s.hit+")");
  /* 4 · a chord held on the keys */
  const codes=await p.evaluate(pcs=>{ const inv={}; Object.keys(KEYMAP).forEach(k=>{ const pc=(KB.lo+KEYMAP[k])%12; if(!(pc in inv) && KEYMAP[k]<12) inv[pc]=k; }); return pcs.map(pc=>inv[pc]); }, [0,4,7]);
  for(const k of codes) await p.keyboard.down(k);
  s=await look(); ok(s.hit.join()==="C", "C, E and G held on the keys: C lights on the wheel ("+s.hit+")");
  await p.keyboard.up(codes[1]); s=await look(); ok(s.hit.length===0, "let go of one: no chord, no gold");
  for(const k of [codes[0],codes[2]]) await p.keyboard.up(k);
  const am=await p.evaluate(pcs=>{ const inv={}; Object.keys(KEYMAP).forEach(k=>{ const pc=(KB.lo+KEYMAP[k])%12; if(!(pc in inv) && KEYMAP[k]<12) inv[pc]=k; }); return pcs.map(pc=>inv[pc]); }, [9,0,4]);
  for(const k of am) await p.keyboard.down(k); s=await look(); ok(s.hit.join()==="Am", "A, C and E held: Am lights ("+s.hit+")");
  for(const k of am) await p.keyboard.up(k);
  /* 5 · while the pattern plays: orange stays on the playing chord, gold shows your own */
  await p.click("#playBtn"); await p.waitForTimeout(250); s=await look(); ok(s.now.join()==="C", "playing: C is orange");
  pt=await where("Dm"); await p.mouse.move(pt.x,pt.y); await p.mouse.down(); s=await look();
  ok(s.hit.join()==="Dm" && s.now.join()==="C", "press Dm while it plays: Dm is gold and C stays orange");
  await p.mouse.up(); await p.click("#playBtn"); await p.waitForTimeout(100);
  /* 6 · make my own from the wheel, at the touch */
  await p.click("#clearBtn"); await p.click("#ownBtn");
  for(const l of ["C","A♭","B♭","C"]){ pt=await where(l); await p.mouse.move(pt.x,pt.y); await p.mouse.down(); await p.mouse.up(); }
  await p.click("#ownBtn"); s=await look();
  ok(s.prog==="0maj 8maj 10maj 0maj", "Make my own: four presses on the wheel make C A♭ B♭ C ("+s.prog+")");
  /* 7 · the keyboard: Enter held */
  await p.evaluate(()=>{ const g=[...document.querySelectorAll("#wheel .wd")].find(g=>g.querySelector("text").textContent==="Em"); g.focus(); });
  await p.keyboard.down("Enter"); s=await look(); ok(s.hit.join()==="Em" && s.sounding.join()==="4,7,11", "Enter on Em: sounds and lights while held");
  await p.keyboard.up("Enter"); await p.waitForTimeout(40); s=await look(); ok(s.sounding.length===0 && s.hit.length===0, "Enter up: it stops");
  /* 8 · the drawing is not rebuilt for colours (the same wedges stay) */
  const same=await p.evaluate(()=>{ const a=document.querySelector('#wheel .wd[data-k="o1"]'); a.__mark=1; padDown(4,0.7); padUp(4); return document.querySelector('#wheel .wd[data-k="o1"]').__mark===1; });
  ok(same, "lighting only changes colours: the wheel is not redrawn");
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log((fails?fails+" FAILED, ":"")+passes+" passed");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
