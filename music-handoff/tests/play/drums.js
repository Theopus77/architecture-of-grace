/* AOG-PLAY-V1: the drum machine sideways. An iPhone on its side (844 × 390) and an iPad (1180 × 820), by touch through the
   DevTools protocol: a drum kit from the drummer's seat fills the screen (kick and hi-hat low, snare in the middle, the
   cymbals at the top), not zoomed, nothing scrolls; every piece plays its own voice, the rim around the snare too; two
   fingers at once are two hits; Play the beat; Close; the Lessons view stays a page; upright unchanged; Spanish. Port 9967. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9967);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(opt, hash, pre)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    if(pre) await p.addInitScript(pre);
    await p.goto("http://localhost:9967/music-drums.html"+(hash||"")); await p.waitForTimeout(1300);
    await p.evaluate(()=>{ window.__h=[]; const h=window.hit; window.hit=function(id,t,fromSeq){ if(!fromSeq) __h.push(id); return h.apply(this,arguments); }; });
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:q.id||i+1}))});
    const where=()=>p.evaluate(()=>{ const o={}; document.querySelectorAll("#dkKit [data-pad]").forEach(g=>{ const sh=g.querySelector(".glow > *"), r=sh.getBoundingClientRect();   /* the piece's own outline (its glow) */ const kb=document.getElementById("dkKit").getBoundingClientRect(); o[g.getAttribute("data-pad")]={x:r.x+r.width/2, y:Math.min(r.y+r.height/2, kb.bottom-30) /* the kick shows only its top half */, top:r.y, left:r.x, w:r.width, h:r.height}; }); return o; });
    const press=async(sel)=>{ await p.evaluate("if(typeof GUARD!==\"undefined\"){ GUARD.last=0; GUARD.down.clear(); }"); await p.evaluate(s=>document.querySelector(s).click(), sel); };
    return {c, p, errs, T, where, press};
  };
  for(const [dev, vp] of [["iPhone sideways",{width:844,height:390}],["iPad sideways",{width:1180,height:820}]]){
    const {c, p, errs, T, where, press}=await open({viewport:vp, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== drums · "+dev);
    /* AOG-PLAY-TABLET-V1: a tablet stays on the drum machine when turned sideways (its whole-screen kit is the Drum Kit page) */
    if(dev==="iPad sideways"){ ok(await p.evaluate("!DK.on && getComputedStyle(document.querySelector('.wrap')).display!=='none' && document.getElementById('dkTurn').hidden"), "an iPad held sideways stays on the drum machine"); ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); continue; }
    const st=await p.evaluate(()=>({on:DK.on, shown:getComputedStyle(document.getElementById("kitView")).display, page:getComputedStyle(document.querySelector(".wrap")).display,
      z:getComputedStyle(document.body).zoom, sw:document.documentElement.scrollWidth, sh:document.scrollingElement.scrollHeight, iw:innerWidth, ih:innerHeight,
      pad:[...document.styleSheets].some(ss=>{ try{ return [...ss.cssRules].some(r=>/#kitView/.test(r.selectorText||"") && /safe-area-inset-left/.test(r.cssText)); }catch(e){ return false; } })}));
    ok(st.on && st.shown==="flex" && st.page==="none", "turned sideways, the kit fills the screen");
    /* AOG-KIT-REAL-V1's drawing once took the name realKit, so every made kit played as a recorded one ("new noise") */
    ok(await p.evaluate("realKit('A')===false && realKit('L')===false && realKit('P')===true && typeof drawKit==='function'"), "the made kits play as made kits again (realKit is the page's own)");
    /* AOG-PLAY-ZOOM-V1: the page holds still while the kit fills the screen */
    ok(await p.evaluate("/maximum-scale=1/.test(document.querySelector('meta[name=viewport]').content) && getComputedStyle(document.documentElement).touchAction==='manipulation'"), "sideways, the page cannot zoom (viewport held at 1, no double-tap zoom)");
    /* AOG-KIT-LOOKS-V1: every kit in one menu, each drawn as its own kind of kit */
    const looks=[]; for(const k of ["A","J","K","P"]){ await p.selectOption("#dkKitSel", k); await p.waitForTimeout(250);
      looks.push(await p.evaluate(()=>({b:S.bank, sh:[...document.querySelectorAll("#dkKit linearGradient[id$=wine] stop")].map(x=>x.getAttribute("stop-color")).join(), mesh:!!document.querySelector("#dkKit pattern[id$=head]")}))); }
    ok(await p.evaluate("document.getElementById('dkKitSel').options.length")>=25 && looks.map(x=>x.b).join("")==="AJKP", "the kit menu holds every kit and picks it: "+looks.map(x=>x.b).join(" "));
    ok(looks[0].mesh && !looks[1].mesh && new Set(looks.map(x=>x.sh)).size>=3, "each kind of kit looks its own (an electronic kit with mesh heads; blue, pearl, maple shells)");
    await p.selectOption("#dkKitSel", "A"); await p.waitForTimeout(250);
    ok(st.z==="1" && st.sw<=st.iw && st.sh<=st.ih+1 && st.pad, `not zoomed, nothing scrolls (${st.sw}×${st.sh}), clear of the notch`);
    const w=await where();
    ok(w.kick.y>w.snare.y && w.ch.y>w.snare.y && w.snare.y>w.oh.y && w.snare.y>w.bell.y && w.tom.y<w.snare.y, "the drummer's seat: kick and hi-hat low, snare in the middle, tom above, cymbals at the top");
    const kitBox=await p.evaluate(()=>{ const r=document.getElementById("dkKit").getBoundingClientRect(); return {w:r.width, h:r.height}; });
    const used=Math.max(...Object.values(w).map(q=>q.left+q.w))-Math.min(...Object.values(w).map(q=>q.left));
    ok(used>kitBox.w*0.8, `the kit spreads across the screen (${Math.round(used)} of ${Math.round(kitBox.w)} px)`);
    ok(Object.values(w).every(q=>Math.min(q.w,q.h)>=44), "every piece is at least a finger wide");
    for(const id of ["kick","snare","ch","oh","clap","tom","bell"]){
      await p.evaluate("__h=[]"); await T("touchStart",[w[id]]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(40);
      const h=await p.evaluate("__h"); ok(h.length===1 && h[0]===id, `${id}: ${JSON.stringify(h)}`);
    }
    /* the rim: the metal ring around the snare's head */
    await p.evaluate("__h=[]"); await T("touchStart",[{x:w.rim.x, y:w.rim.top+6}]); await p.waitForTimeout(40); await T("touchEnd",[]);
    ok(JSON.stringify(await p.evaluate("__h"))==='["rim"]', "the ring around the snare is the rim");
    /* two hands at once */
    await p.evaluate("__h=[]"); await T("touchStart",[{...w.kick,id:1},{...w.ch,id:2}]); await p.waitForTimeout(40); await T("touchEnd",[]);
    const two=await p.evaluate("__h.slice().sort()");
    ok(JSON.stringify(two)==='["ch","kick"]', "kick and hi-hat together: "+JSON.stringify(two));
    const lit=await p.evaluate(()=>{ document.querySelector('#dkKit [data-pad="snare"]').classList.remove("hit"); flashVoice("snare"); return document.querySelector('#dkKit [data-pad="snare"]').classList.contains("hit"); });
    await p.waitForTimeout(200);
    ok(lit && await p.evaluate(()=>!document.querySelector('#dkKit [data-pad="snare"]').classList.contains("hit")), "a piece lights while it is hit, then goes still");
    /* Play the beat */
    await press("#dkMore"); await p.click("#dkRun"); await p.waitForTimeout(150);
    const run=await p.evaluate(()=>({p:S.playing, t:document.getElementById("dkRun").textContent}));
    await p.click("#dkRun"); await p.waitForTimeout(80);
    /* AOG-PLAY-GUARD-V1: the bar keeps ☰ Menu and the kit; a slip onto it while playing is ignored */
    await press("#dkMore");
    const barIds=await p.evaluate(()=>[...document.querySelectorAll("#kitView .dk-bar button")].filter(b=>!b.hidden).map(b=>b.id).join(" "));
    { const w3=await where(); await T("touchStart",[w3.snare]); await p.waitForTimeout(40);
      const slip=await p.evaluate(()=>{ document.getElementById("dkMore").click(); return !document.getElementById("dkDrawer").hidden; });
      await T("touchEnd",[]); await p.waitForTimeout(800);
      const real=await p.evaluate(()=>{ document.getElementById("dkMore").click(); return !document.getElementById("dkDrawer").hidden; });
      ok(barIds==="dkMore" && !slip && real, "the bar keeps ☰ Menu (and the kit menu); a slip onto it while playing is ignored, a real tap opens it"); }
    ok(run.p && /Stop/.test(run.t) && await p.evaluate("!S.playing"), "Play the beat starts and stops the pattern ("+run.t+")");
    ok(await p.evaluate("!!document.getElementById('dkTake').textContent"), "Record a take is one tap away");
    if(await p.evaluate("document.getElementById('dkDrawer').hidden")) await press("#dkMore");
    await p.click("#dkClose"); await p.waitForTimeout(150);
    ok(await p.evaluate(()=>!DK.on && getComputedStyle(document.querySelector(".wrap")).display!=="none"), "Close gives the page back");
    await p.waitForTimeout(700);
    ok(await p.evaluate("!/maximum-scale/.test(document.querySelector('meta[name=viewport]').content)"), "and the page can be zoomed again");
    await p.setViewportSize({width:vp.height, height:vp.width}); await p.waitForTimeout(250); await p.setViewportSize(vp); await p.waitForTimeout(250);
    ok(await p.evaluate("DK.on"), "turned upright and back, the kit is back");
    await p.evaluate("__h=[]"); const w2=await where(); await T("touchStart",[w2.tom]); await p.waitForTimeout(40); await T("touchEnd",[]);
    ok(JSON.stringify(await p.evaluate("__h"))==='["tom"]', "and it still plays");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close();
  }
  /* AOG-KIT-PAGE-V1: the drum kit is its own page now; an old link to the kit here goes there */
  { const {c, p, errs}=await open({viewport:{width:390,height:844}, isMobile:true, hasTouch:true}, "#kit"); console.log("== drums · #kit");
    ok(/music-kit\.html$/.test(p.url()), "an old link to the drum machine's kit opens the Drum Kit page: "+p.url().split("/").pop());
    await c.close(); }
  { const {c, p, errs}=await open({viewport:{width:844,height:390}, isMobile:true, hasTouch:true}, "#lessons"); console.log("== drums · lessons sideways");
    ok(await p.evaluate("!DK.on && getComputedStyle(document.querySelector('.wrap')).display!=='none'"), "the Lessons view stays a page to read");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  { const {c, p, errs}=await open({viewport:{width:390,height:844}, isMobile:true, hasTouch:true}); console.log("== drums · iPhone upright");
    const u=await p.evaluate(()=>({on:DK.on, pads:document.querySelectorAll(".sp-pad").length, turn:document.getElementById("dkTurn").hidden?"":document.getElementById("dkTurn").textContent, sw:document.documentElement.scrollWidth}));
    ok(!u.on && u.pads===8 && u.sw<=390, "upright: the drum machine as before, eight pads");
    ok(/sideways/.test(u.turn), "one quiet line: "+u.turn);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  { const {c, p, errs}=await open({viewport:{width:844,height:390}, isMobile:true, hasTouch:true}, "", ()=>{ try{ localStorage.setItem("aog.lang","es"); }catch(e){} }); console.log("== drums · español");
    const es=await p.evaluate(()=>[...document.querySelectorAll("#kitView .dk-b, #dkHint, #dkKit text")].map(e=>e.textContent).join(" | "));
    ok(/Cerrar/.test(es) && /Tocar el ritmo/.test(es) && /Bombo/.test(es) && /Caja/.test(es) && /dos manos/.test(es), "en español: "+es);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  { const {c, p, errs}=await open({viewport:{width:1280,height:800}}); console.log("== drums · computer");
    ok(await p.evaluate("!DK.on && getComputedStyle(document.getElementById('kitView')).display==='none'"), "a computer keeps the drum machine as it is");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  await b.close();
  console.log(fails? `${fails} FAILED` : "all passed");
  process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH "+e.stack); process.exit(1); });
