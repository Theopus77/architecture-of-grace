/* AOG-PLAY-V1: The Band sideways. An iPhone on its side (844 × 390) and an iPad (1180 × 820), by touch through the DevTools
   protocol: the keys fill the screen (two octaves on a phone, three on an iPad), not zoomed, nothing scrolls; a chord held
   with three fingers; a finger slid along the keys; the harp as strings tuned to the song's key, swept in order; the
   marimba and the glockenspiel as bars, sharps behind; Close; upright unchanged; Spanish. Port 9968. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9968);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(opt, pre)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    if(pre) await p.addInitScript(pre);
    await p.goto("http://localhost:9968/music-band.html"); await p.waitForTimeout(1300);
    await p.evaluate(()=>{ window.__n=[]; const on=window.noteOn; window.noteOn=function(key,inst,m,v){ __n.push(m); return on.apply(this,arguments); }; });
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:q.id||i+1}))});
    const key=(m)=>p.evaluate(m=>{ const el=document.querySelector(`#kbd [data-m="${m}"]`); if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height*0.8, top:r.y, h:r.height, w:r.width}; }, m);
    const pick=(id)=>p.evaluate(id=>{ const s=document.getElementById("bpSound"); s.value=id; s.onchange(); }, id);
    const press=async(sel)=>{ await p.evaluate("if(typeof GUARD!==\"undefined\"){ GUARD.last=0; GUARD.down.clear(); }"); await p.evaluate(s=>document.querySelector(s).click(), sel); };
    /* AOG-PLAY-TABLET-V1: a tablet starts in the normal page; the big button opens the whole-screen view */
    if(await p.evaluate(()=>Math.min(screen.width,screen.height)>=600)){
      const a=await p.evaluate(()=>({on:BP.on, big:getComputedStyle(document.getElementById("bpBig")).display!=="none"}));
      ok(!a.on && a.big, "a tablet held sideways starts in the normal page, with Play on the whole screen to open it: "+JSON.stringify(a));
      await p.evaluate(()=>{ if(typeof GUARD!=="undefined"){ GUARD.last=0; GUARD.down.clear(); } document.getElementById("bpBig").click(); }); await p.waitForTimeout(400); }
    return {c, p, errs, T, key, pick, press};
  };
  for(const [dev, vp, oc] of [["iPhone sideways",{width:844,height:390},2],["iPad sideways",{width:1180,height:820},3]]){
    const {c, p, errs, T, key, pick, press}=await open({viewport:vp, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== band · "+dev);
    await pick("trumpet"); await p.waitForTimeout(200);
    const st=await p.evaluate(()=>({on:BP.on, inView:!!document.querySelector("#playView #kbd"), page:getComputedStyle(document.querySelector(".wrap")).display,
      z:getComputedStyle(document.body).zoom, sw:document.documentElement.scrollWidth, sh:document.scrollingElement.scrollHeight, iw:innerWidth, ih:innerHeight,
      whites:document.querySelectorAll("#kbd .wk").length, kh:document.getElementById("kbd").getBoundingClientRect().height, lo:KB.lo,
      pad:[...document.styleSheets].some(ss=>{ try{ return [...ss.cssRules].some(r=>/#playView/.test(r.selectorText||"") && /safe-area-inset-left/.test(r.cssText)); }catch(e){ return false; } })}));
    ok(st.on && st.inView && st.page==="none", "turned sideways, the keys fill the screen and the page steps aside");
    ok(st.z==="1" && st.sw<=st.iw && st.sh<=st.ih+1 && st.pad, `not zoomed, nothing scrolls (${st.sw}×${st.sh}), clear of the notch`);
    ok(st.whites===7*oc+1 && st.kh>vp.height*0.7, `${oc} octaves (${st.whites} white keys), ${Math.round(st.kh)} px tall`);
    const kw=await key(st.lo); ok(kw.w>=44, `a white key is ${Math.round(kw.w)} px wide`);
    /* AOG-CHORDSTRIP-V1: the six chords on top of the keys; one tap holds a chord, the next finger a single note */
    const sb=await p.evaluate(()=>{ const b=document.querySelector('#pvStrip .cs[data-i="0"]'), r=b.getBoundingClientRect(), k=document.getElementById("kbd").getBoundingClientRect();
      return {x:r.x+r.width/2, y:r.y+r.height/2, n:document.querySelectorAll("#pvStrip .cs").length, above:r.bottom<=k.top+1}; });
    await p.evaluate("__n=[]"); await T("touchStart",[{x:sb.x,y:sb.y,id:5}]); await p.waitForTimeout(60);
    const chn=await p.evaluate("__n.map(m=>m%12).sort((a,b)=>a-b)"); await T("touchEnd",[]); await p.waitForTimeout(40);
    ok(sb.n===6 && sb.above && chn.length>=3 && [0,4,7].every(pc=>chn.indexOf(pc)>=0), "a tap on C in the chord strip above the keys plays a C chord: "+chn.join(" "));
    /* a chord held with three fingers */
    const lo=await p.evaluate(()=>Math.min(...[...document.querySelectorAll("#kbd .wk:not(.out)")].map(e=>+e.getAttribute("data-m")).filter(m=>m%12===0))), C=await key(lo), E=await key(lo+4), G=await key(lo+7);
    await p.evaluate("__n=[]"); await T("touchStart",[{...C,id:1},{...E,id:2},{...G,id:3}]); await p.waitForTimeout(80);
    const ch=await p.evaluate(()=>({n:__n.slice().sort((a,b)=>a-b), down:[...document.querySelectorAll("#kbd .down")].map(e=>+e.getAttribute("data-m"))}));
    await T("touchEnd",[]);
    ok(JSON.stringify(ch.n)===JSON.stringify([lo,lo+4,lo+7]) && ch.down.length===3, "three fingers, three notes held: "+ch.n.join(" "));
    /* a finger slid along the white keys */
    await p.evaluate("__n=[]"); const F=await key(lo+5);
    await T("touchStart",[C]); for(let i=1;i<=10;i++){ await T("touchMove",[{x:C.x+(F.x-C.x)*i/10, y:C.y}]); await p.waitForTimeout(12); } await T("touchEnd",[]);
    ok(JSON.stringify(await p.evaluate("__n"))===JSON.stringify([lo,lo+2,lo+4,lo+5]), "a finger slid along the keys plays each: "+(await p.evaluate("__n")).join(" "));
    /* the harp: strings in D major, swept low to high */
    await p.evaluate(()=>{ const k=document.getElementById("keySel"); k.value="2"; k.onchange(); }); await pick("harp"); await p.waitForTimeout(200);
    const hp=await p.evaluate(()=>({mode:bpMode(), ms:[...document.querySelectorAll("#kbd .hs")].map(e=>+e.getAttribute("data-m")), c:document.querySelectorAll("#kbd .hs.c").length, f:document.querySelectorAll("#kbd .hs.f").length}));
    ok(hp.mode==="harp" && hp.ms.every(m=>[2,4,6,7,9,11,1].indexOf(m%12)>=0) && hp.ms.length>=7*oc, `the harp: ${hp.ms.length} strings, every one in D major`);
    ok(hp.c>=oc && hp.f>=oc, "its C strings red and F strings blue, as a harpist's");
    const a=await key(hp.ms[0]), z=await key(hp.ms[hp.ms.length-1]);
    await p.evaluate("__n=[]"); await T("touchStart",[{x:a.x, y:a.top+a.h*0.5}]);
    for(let i=1;i<=24;i++){ await T("touchMove",[{x:a.x+(z.x-a.x)*i/24, y:a.top+a.h*0.5}]); await p.waitForTimeout(10); } await T("touchEnd",[]);
    const sw=await p.evaluate("__n");
    ok(JSON.stringify(sw)===JSON.stringify(hp.ms), "a sweep sounds every string, low to high, in order ("+sw.length+")");
    await p.evaluate(()=>document.getElementById("minBtn").click()); await p.waitForTimeout(80);
    ok(await p.evaluate(()=>[...document.querySelectorAll("#kbd .hs")].every(e=>[2,4,5,7,9,10,0].indexOf(+e.getAttribute("data-m")%12)>=0)), "turned to minor, the harp retunes to D minor");
    await p.evaluate(()=>document.getElementById("majBtn").click());
    /* the bars */
    for(const id of ["marimba","glockenspiel"]){
      await pick(id); await p.waitForTimeout(200);
      const bars=await p.evaluate(()=>({mode:bpMode(), lo:KB.lo, w:[...document.querySelectorAll("#kbd .wk")].map(e=>e.getBoundingClientRect()), bk:[...document.querySelectorAll("#kbd .bk")].map(e=>e.getBoundingClientRect())}));
      ok(bars.mode==="bars" && bars.bk.every(r=>r.bottom<=Math.min(...bars.w.map(x=>x.top))+1) && bars.w[0].height>bars.w[bars.w.length-1].height, `${id}: bars, the sharps behind, the low bars longer`);
      const s1=await key(bars.lo+1), n1=await key(bars.lo+2);
      await p.evaluate("__n=[]"); await T("touchStart",[{...s1,id:1},{...n1,id:2}]); await p.waitForTimeout(60); await T("touchEnd",[]);
      ok(JSON.stringify(await p.evaluate("__n.slice().sort((a,b)=>a-b)"))===JSON.stringify([bars.lo+1,bars.lo+2]), `${id}: a sharp and a natural together`);
    }
    await pick("trumpet"); await p.waitForTimeout(150); if(await p.evaluate("document.getElementById('bpUp').disabled")) await press("#bpDown");
    await press("#bpUp"); const up=await p.evaluate("KB.lo"); await press("#bpDown");
    ok(up===await p.evaluate("KB.lo")+12, "▶ moves up an octave");
    /* AOG-PLAY-GUARD-V1: a slip onto the bar while playing is ignored; the bar keeps ☰ Menu and the octave */
    { const k0=await key(await p.evaluate("KB.lo")); await T("touchStart",[k0]); await p.waitForTimeout(40);
      const slip=await p.evaluate(()=>{ document.getElementById("bpMore").click(); return !document.getElementById("bpDrawer").hidden; });
      await T("touchEnd",[]); await p.waitForTimeout(800);
      const real=await p.evaluate(()=>{ document.getElementById("bpMore").click(); return !document.getElementById("bpDrawer").hidden; });
      const bar=await p.evaluate(()=>[...document.querySelectorAll("#playView .bp-bar button")].filter(b=>!b.hidden).map(b=>b.id).join(" "));
      ok(!slip && real && bar==="bpMore bpDown bpUp", "a slip onto ☰ Menu while playing is ignored, a real tap opens it; the bar: "+bar); }
    await p.click("#bpClose"); await p.waitForTimeout(100);
    ok(await p.evaluate(()=>!BP.on && !!document.querySelector("#rig #kbd, .blk #kbd") && getComputedStyle(document.querySelector(".wrap")).display!=="none"), "Close gives the page back, with its keys");
    await p.setViewportSize({width:vp.height, height:vp.width}); await p.waitForTimeout(250); await p.setViewportSize(vp); await p.waitForTimeout(250);
    ok(await p.evaluate("BP.on"), "turned upright and back, it plays sideways again");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close();
  }
  { const {c, p, errs}=await open({viewport:{width:390,height:844}, isMobile:true, hasTouch:true}); console.log("== band · iPhone upright");
    const u=await p.evaluate(()=>({on:BP.on, whites:KB.whites, turn:document.getElementById("bpTurn").hidden?"":document.getElementById("bpTurn").textContent, sw:document.documentElement.scrollWidth}));
    ok(!u.on && u.whites===8 && u.sw<=390, "upright: one octave of keys on the page, as before");
    ok(/sideways/.test(u.turn), "one quiet line: "+u.turn);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  { const {c, p, errs}=await open({viewport:{width:844,height:390}, isMobile:true, hasTouch:true}, ()=>{ try{ localStorage.setItem("aog.lang","es"); }catch(e){} }); console.log("== band · español");
    const es=await p.evaluate(()=>document.getElementById("bpClose").textContent+" | "+document.getElementById("bpRange").textContent+" | "+document.getElementById("bpRec").textContent);
    ok(/Cerrar/.test(es) && / a /.test(es), "en español: "+es);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  { const {c, p, errs}=await open({viewport:{width:1280,height:800}}); console.log("== band · computer");
    ok(await p.evaluate("!BP.on && getComputedStyle(document.getElementById('playView')).display==='none'"), "a computer keeps the page as it is");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  await b.close();
  console.log(fails? `${fails} FAILED` : "all passed");
  process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH "+e.stack); process.exit(1); });
