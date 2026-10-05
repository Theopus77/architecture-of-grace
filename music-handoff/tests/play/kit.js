/* AOG-KIT-PAGE-V1: the Drum Kit, its own page (music-kit.html, /drum-kit), apart from the drum machine. Only recorded
   kits (every pad a recording), each drawn with its own instruments; a tap plays the pad, the middle of a drum harder
   than its edge; a closed hi-hat stops a ringing open one; two hands at once; Kit T's hard kicks never go over full
   scale; a take recorded, deleted, brought back; sideways on an iPhone and an iPad (no zoom, no scroll, ☰ Menu and the
   kit only, a slip onto the bar ignored); Spanish; every music menu leads here. Port 9958. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9958);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(opt, pre)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    if(pre) await p.addInitScript(pre);
    await p.goto("http://localhost:9958/music-kit.html");
    await p.waitForFunction(()=>{ const s=AOGDrumKit.state(S.bank); return s && s.state==="ready"; }, null, {timeout:40000}).catch(()=>{});
    await p.waitForTimeout(300);
    await p.evaluate(()=>{ window.__h=[]; const pd=AOGDrumKit.playDirect; AOGDrumKit.playDirect=function(c,d,b,id,t0,acc,lv){ __h.push({b,id,acc}); return pd.apply(this,arguments); }; });
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:q.id||i+1}))});
    const where=(svg)=>p.evaluate(svg=>{ const o={}, k=document.getElementById(svg), kb=k.getBoundingClientRect(); k.querySelectorAll("[data-pad]").forEach(g=>{ const r=g.querySelector(".glow > *").getBoundingClientRect();
      o[g.getAttribute("data-pad")]={x:r.x+r.width/2, y:Math.min(r.y+r.height/2, kb.bottom-25), w:r.width, h:r.height, edge:r.x+r.width*0.07}; }); return o; }, svg);
    const press=async(sel)=>{ await p.evaluate("GUARD.last=0; GUARD.down.clear()"); await p.evaluate(s=>document.querySelector(s).click(), sel); };
    /* AOG-PLAY-TABLET-V1: a tablet starts in the normal page; the big button opens the whole-screen view */
    if(await p.evaluate(()=>Math.min(screen.width,screen.height)>=600 && matchMedia("(pointer: coarse)").matches)){
      const a=await p.evaluate(()=>({on:PV.on, big:getComputedStyle(document.getElementById("kpBig")).display!=="none"}));
      ok(!a.on && a.big, "a tablet held sideways starts in the normal page, with Play on the whole screen to open it: "+JSON.stringify(a));
      await p.evaluate(()=>{ if(typeof GUARD!=="undefined"){ GUARD.last=0; GUARD.down.clear(); } document.getElementById("kpBig").click(); }); await p.waitForTimeout(400); }
    return {c, p, errs, T, where, press};
  };
  /* an iPhone held upright */
  { const {c, p, errs, T, where}=await open({viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== drum kit · iPhone upright");
    const st=await p.evaluate(()=>({kits:KITS(), all:AOGDrumKit.ids, made:KITS().some(b=>Object.keys(AOGDrumKit.padNames(b)).some(id=>AOGDrumKit.made(b,id))), bank:S.bank,
      mast:document.getElementById("mastH").textContent, sw:document.documentElement.scrollWidth, ready:AOGDrumKit.state(S.bank).state, opts:document.getElementById("kitSel").options.length,
      tools:[...document.querySelectorAll("#navTools a")].map(a=>a.getAttribute("href")).join(" "), turn:document.getElementById("kpTurn").hidden?"":document.getElementById("kpTurn").textContent}));
    ok(st.mast==="The Drum Kit" && st.ready==="ready" && st.sw<=390, "its own page, the kit ready, nothing scrolls sideways");
    ok(st.kits.length>=15 && !st.made && st.opts===st.kits.length && st.kits.indexOf("A")<0, `${st.kits.length} recorded kits, every pad a recording (the drum machine's made kits stay there)`);
    ok(/music-kit\.html/.test(st.tools) && /music-drums\.html/.test(st.tools), "the music tools menu has both: the drum machine and the drum kit");
    ok(/sideways/.test(st.turn), "one quiet line: "+st.turn);
    const w=await where("pageKit");
    ok(Object.keys(w).length===8 && Object.values(w).every(q=>Math.min(q.w,q.h)>=44), "eight pieces, each at least a finger wide");
    await p.evaluate("__h=[]"); await T("touchStart",[w.snare]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(40);
    await T("touchStart",[{x:w.snare.edge, y:w.snare.y}]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(40);
    const hs=await p.evaluate("__h.map(x=>x.id+':'+x.acc)");
    ok(JSON.stringify(hs)==='["snare:2","snare:3"]', "the middle of the snare plays harder, its edge softer: "+hs.join(" "));
    /* the drawing follows the kit: kit P's rim pad is a ride cymbal, its tom a floor tom */
    const words=await p.evaluate(()=>[...document.querySelectorAll("#pageKit text")].map(x=>x.textContent).join(","));
    ok(/Ride/.test(words) && /Floor tom/.test(words) && /Cross-stick/.test(words), "each kit drawn with its own instruments: "+words);
    /* the hi-hat: closed stops a ringing open hat */
    await p.evaluate("__h=[]"); await T("touchStart",[w.oh]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(60);
    const op=await p.evaluate("OPEN.length"); await T("touchStart",[w.ch]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(60);
    ok(op===1 && await p.evaluate("OPEN.length")===0, "a closed hi-hat stops the open one, as on a real kit");
    /* two hands */
    await p.evaluate("__h=[]"); await T("touchStart",[{...w.kick,id:1},{...w.ch,id:2}]); await p.waitForTimeout(40); await T("touchEnd",[]);
    ok(JSON.stringify(await p.evaluate("__h.map(x=>x.id).sort()"))==='["ch","kick"]', "kick and hi-hat together");
    /* another kit */
    await p.selectOption("#kitSel","T"); await p.waitForFunction(()=>AOGDrumKit.state("T") && AOGDrumKit.state("T").state==="ready", null, {timeout:40000}).catch(()=>{});
    await p.waitForTimeout(300);
    const tk=await p.evaluate(()=>({b:S.bank, words:[...document.querySelectorAll("#pageKit text")].map(x=>x.textContent).join(",")}));
    ok(tk.b==="T" && /China/.test(tk.words), "Kit T, groove metal, with its china: "+tk.words);
    /* record, delete, bring back */
    const w2=await where("pageKit");
    await p.evaluate(()=>document.getElementById("takeBtn").click()); await p.waitForTimeout(400);
    await T("touchStart",[w2.kick]); await p.waitForTimeout(60); await T("touchEnd",[]); await p.waitForTimeout(250);
    await T("touchStart",[w2.snare]); await p.waitForTimeout(60); await T("touchEnd",[]); await p.waitForTimeout(400);
    await p.evaluate(()=>document.getElementById("takeBtn").click()); await p.waitForTimeout(1300);
    const t1=await p.evaluate(()=>document.querySelectorAll("#takeList .aogrec-take").length);
    if(t1) await p.evaluate(()=>document.querySelector("#takeList [data-aogrec-del]").click()); await p.waitForTimeout(100);
    const t2=await p.evaluate(()=>({n:document.querySelectorAll("#takeList .aogrec-take").length, line:document.getElementById("takeLine").textContent}));
    if(t1) await p.evaluate(()=>document.querySelector("#takeLine button").click()); await p.waitForTimeout(100);
    const t3=await p.evaluate(()=>document.querySelectorAll("#takeList .aogrec-take").length);
    ok(t1===1 && t2.n===0 && /deleted/.test(t2.line) && t3===1, `a take is recorded (${t1}), deleted ("${t2.line}") and brought back (${t3})`);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  /* sideways */
  for(const [dev, vp] of [["iPhone sideways",{width:844,height:390}],["iPad sideways",{width:1180,height:820}]]){
    const {c, p, errs, T, where, press}=await open({viewport:vp, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== drum kit · "+dev);
    const st=await p.evaluate(()=>({on:PV.on, z:getComputedStyle(document.body).zoom, sw:document.documentElement.scrollWidth, sh:document.scrollingElement.scrollHeight, ih:innerHeight, iw:innerWidth,
      bar:[...document.querySelectorAll("#kitView .dk-bar button")].filter(b=>!b.hidden).map(b=>b.id).join(" "), meta:document.querySelector('meta[name=viewport]').content}));
    ok(st.on && st.z==="1" && st.sw<=st.iw && st.sh<=st.ih+1 && /maximum-scale=1/.test(st.meta), "sideways, the kit fills the screen: not zoomed, nothing scrolls, the page held at its size");
    ok(st.bar==="dkMore", "the bar keeps ☰ Menu and the kit menu only");
    const w=await where("sideKit");
    await p.evaluate("__h=[]"); await T("touchStart",[w.snare]); await p.waitForTimeout(40);
    const slip=await p.evaluate(()=>{ document.getElementById("dkMore").click(); return !document.getElementById("dkDrawer").hidden; });
    await T("touchEnd",[]); await p.waitForTimeout(800);
    const real=await p.evaluate(()=>{ document.getElementById("dkMore").click(); return !document.getElementById("dkDrawer").hidden; });
    ok(await p.evaluate("__h.length")===1 && !slip && real, "the sideways kit plays; a slip onto ☰ Menu while playing is ignored, a real tap opens it");
    await p.click("#dkClose"); await p.waitForTimeout(150);
    ok(await p.evaluate("!PV.on && getComputedStyle(document.querySelector('.wrap')).display!=='none'"), "Close gives the page back");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close();
  }
  /* Spanish */
  { const {c, p, errs}=await open({viewport:{width:390,height:844}, isMobile:true, hasTouch:true}, ()=>{ try{ localStorage.setItem("aog.lang","es"); }catch(e){} }); console.log("== drum kit · español");
    const es=await p.evaluate(()=>document.getElementById("mastH").textContent+" | "+document.getElementById("kitLine").textContent+" | "+[...document.querySelectorAll("#pageKit text")].map(x=>x.textContent).join(","));
    ok(/La batería/.test(es) && /Lista/.test(es) && /Bombo/.test(es) && /Caja/.test(es), "en español: "+es);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  /* Kit T's hard kicks (Jimmy: "a screwed kick drum noise"): no recording of the kit goes over full scale */
  { const fs=require("fs"), path=require("path"), cp=require("child_process"), root=process.env.AOG_ROOT||path.resolve(__dirname,"../../../aog-deploy");
    const dir=path.join(root,"audio/drums/groovemetal"), over=[];
    fs.readdirSync(dir).filter(f=>/\.mp3$/.test(f)).forEach(f=>{ const raw=cp.execSync(`ffmpeg -v error -i "${path.join(dir,f)}" -ac 1 -f f32le -`, {maxBuffer:1<<26});
      const a=new Float32Array(raw.buffer, raw.byteOffset, raw.length>>2); let pk=0; for(const v of a){ const q=Math.abs(v); if(q>pk) pk=q; } if(pk>0.99) over.push(f+" "+pk.toFixed(3)); });
    ok(over.length===0, "Kit T: no recording goes over full scale "+over.join(", ")); }
  await b.close();
  console.log(fails? `${fails} FAILED` : "all passed");
  process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH "+e.stack); process.exit(1); });
