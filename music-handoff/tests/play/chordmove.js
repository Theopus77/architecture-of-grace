/* AOG-PIANO-CHORD-MOVE-V1: a chord held on the piano moves with the board. Sideways on an iPhone: three fingers hold C E G,
   the other hand taps Higher ▶, and the chord rings an octave up under the same fingers (the old notes stop), then ◀ Lower
   brings it back; lifting the fingers stops it. A chord pad held on the chord strip moves too. On a computer: A D G held
   (C E G), X moves the chord up, letting go of the keys stops it. A note only ringing on the pedal stays put. Port 9970. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9970);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(opt)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.addInitScript(()=>{ try{ localStorage.removeItem("aog.piano.v1"); }catch(e){} });
    await p.goto("http://localhost:9970/music-piano.html"); await p.waitForTimeout(1500);
    return {c, p, errs};
  };
  const held=(p)=>p.evaluate(()=>[...LIVE.entries()].filter(([k,v])=>v.down).map(([k])=>k).sort());
  /* an iPhone on its side, by touch */
  { const {c, p, errs}=await open({viewport:{width:844,height:390}, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== chord move · iPhone sideways");
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map(q=>({x:q.x,y:q.y,id:q.id}))});
    const at=(sel)=>p.evaluate(sel=>{ const r=document.querySelector(sel).getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; }, sel);
    const key=(m)=>p.evaluate(m=>{ const el=document.querySelector(`#kbd [data-m="${m}"]`); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height*0.85}; }, m);
    ok(await p.evaluate("BP.on"), "the keys fill the screen");
    const lo=await p.evaluate("KB.lo"), up=await at("#bpUp"), down=await at("#bpDown");
    const f=[{...await key(lo),id:1},{...await key(lo+4),id:2},{...await key(lo+7),id:3}];
    await T("touchStart",f.slice(0,1)); await T("touchStart",f.slice(0,2)); await T("touchStart",f); await p.waitForTimeout(150);
    const h0=await held(p);
    ok(JSON.stringify(h0)===JSON.stringify(["k"+lo,"k"+(lo+4),"k"+(lo+7)]), "three fingers hold C E G: "+h0.join(" "));
    await T("touchStart",[...f,{...up,id:9}]); await T("touchEnd",[{...up,id:9}]); await p.waitForTimeout(250);
    const h1=await held(p), o1=await p.evaluate("KB.lo");
    ok(o1===lo+12, "the other hand taps Higher ▶ while the chord is held, and the board moves up");
    ok(JSON.stringify(h1)===JSON.stringify(["k"+(lo+12),"k"+(lo+16),"k"+(lo+19)]), "the chord moves up an octave and keeps ringing: "+h1.join(" "));
    ok(await p.evaluate(lo=>!LIVE.has("k"+lo) && [...document.querySelectorAll("#kbd .on, #kbd .lit, #kbd [class*=lit]")].length>=0, lo), "the old notes stop");
    /* a finger moves a little on its key: the same note, nothing new */
    await p.evaluate("window.__n=0; const on=noteOn; window.noteOn=function(){ __n++; return on.apply(this,arguments); }");
    await T("touchMove",[{...f[0],x:f[0].x+2},f[1],f[2]]); await p.waitForTimeout(100);
    ok(await p.evaluate("__n")===0, "the fingers still sit on the moved chord: a small slide plays nothing new");
    await T("touchStart",[...f,{...down,id:10}]); await T("touchEnd",[{...down,id:10}]); await p.waitForTimeout(250);
    const h2=await held(p);
    ok(JSON.stringify(h2)===JSON.stringify(["k"+lo,"k"+(lo+4),"k"+(lo+7)]) && await p.evaluate("KB.lo")===lo, "◀ Lower brings the chord back down: "+h2.join(" "));
    await T("touchEnd",[]); await p.waitForTimeout(150);
    ok((await held(p)).length===0, "lifting the fingers stops the chord");
    /* a slip: a tap on the bar just after playing, with no finger held, is still ignored */
    await T("touchStart",[{...f[0]}]); await T("touchEnd",[]); await T("touchStart",[{...up,id:12}]); await T("touchEnd",[]); await p.waitForTimeout(200);
    ok(await p.evaluate("KB.lo")===lo, "a tap on ▶ right after a key is lifted is a slip, as before");
    /* a chord pad on the strip */
    await p.waitForTimeout(800);
    const sp=await at('#pvStrip .cs[data-i="0"]');
    await T("touchStart",[{...sp,id:1}]); await p.waitForTimeout(150);
    const ph=(await held(p)).map(k=>+k.slice(1));
    await T("touchStart",[{...sp,id:1},{...up,id:11}]); await T("touchEnd",[{...up,id:11}]); await p.waitForTimeout(250);
    const ph2=(await held(p)).map(k=>+k.slice(1));
    ok(ph.length>=3 && JSON.stringify(ph.map(m=>m+12).sort((a,b)=>a-b))===JSON.stringify(ph2.sort((a,b)=>a-b)), "a chord pad held on the strip moves up too: "+ph.join(",")+" → "+ph2.join(","));
    await T("touchEnd",[]); await p.waitForTimeout(150);
    ok((await held(p)).length===0, "letting go of the pad stops it");
    ok(!errs.length, "no errors: "+errs.join(" | "));
    await c.close(); }
  /* a computer */
  { const {c, p, errs}=await open({viewport:{width:1280,height:900}}); console.log("== chord move · computer");
    await p.evaluate(()=>document.getElementById("kbd").scrollIntoView());
    const lo=await p.evaluate("KB.lo");
    await p.keyboard.down("a"); await p.keyboard.down("d"); await p.keyboard.down("g"); await p.waitForTimeout(150);
    ok(JSON.stringify(await held(p))===JSON.stringify(["c"+lo,"c"+(lo+4),"c"+(lo+7)]), "A D G hold C E G");
    await p.keyboard.press("x"); await p.waitForTimeout(150);
    ok(JSON.stringify(await held(p))===JSON.stringify(["c"+(lo+12),"c"+(lo+16),"c"+(lo+19)]) && await p.evaluate("KB.lo")===lo+12, "X moves the board and the chord up an octave");
    await p.keyboard.press("z"); await p.waitForTimeout(150);
    ok(JSON.stringify(await held(p))===JSON.stringify(["c"+lo,"c"+(lo+4),"c"+(lo+7)]), "Z brings it back");
    await p.keyboard.up("a"); await p.keyboard.up("d"); await p.keyboard.up("g"); await p.waitForTimeout(150);
    ok((await held(p)).length===0 && await p.evaluate("LIVE.size")===0, "letting go stops it");
    /* the pedal: a note let go stays where it rang; the held one moves */
    await p.evaluate("setSus(true)"); await p.keyboard.down("a"); await p.keyboard.up("a"); await p.keyboard.down("g"); await p.waitForTimeout(100);
    await p.click("#upBtn"); await p.waitForTimeout(150);
    const ped=await p.evaluate(()=>[...LIVE.entries()].map(([k,v])=>k+(v.down?"*":"")).sort());
    ok(ped.indexOf("c"+lo)>=0 && ped.indexOf("c"+(lo+19)+"*")>=0 && ped.indexOf("c"+(lo+7)+"*")<0, "with the pedal: the let-go note rings on where it was, the held one moves up: "+ped.join(" "));
    await p.keyboard.up("g"); await p.evaluate("setSus(false)"); await p.waitForTimeout(100);
    ok(await p.evaluate("LIVE.size")===0, "pedal off: all quiet");
    /* nothing held: Higher ▶ only moves the board, as before */
    await p.click("#downBtn"); await p.waitForTimeout(100);
    ok(await p.evaluate("KB.lo")===lo && await p.evaluate("LIVE.size")===0, "nothing held: ◀ ▶ only move the board");
    ok(!errs.length, "no errors: "+errs.join(" | "));
    await c.close(); }
  await b.close(); srv.close(); console.log(fails?fails+" FAILED":"all passed"); process.exit(fails?1:0);
})().catch(e=>{ console.log("FAIL crash "+e.stack); process.exit(1); });
