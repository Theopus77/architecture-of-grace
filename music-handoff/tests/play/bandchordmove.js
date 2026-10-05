/* AOG-BAND-CHORD-MOVE-V1: a chord held on The Band moves with the board. Sideways on an iPhone: three fingers hold a chord,
   the other hand taps Higher ▶ and the chord rings an octave up under the same fingers (a note no player reaches there
   stops), ◀ Lower brings it back, lifting the fingers stops it; a chord pad on the strip moves each part with its own
   player. On a computer: A D G held, X up, Z back, letting go stops it; nothing held, ◀ ▶ only move the board. Port 9997. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9997);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(opt)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.addInitScript(()=>{ try{ localStorage.removeItem("aog.band.v1"); }catch(e){} });
    await p.goto("http://localhost:9997/music-band.html"); await p.waitForTimeout(1800);
    return {c, p, errs};
  };
  const held=(p, re)=>p.evaluate(re=>[...LIVE.entries()].filter(([k,v])=>v.down && new RegExp(re).test(k)).map(([k])=>k).sort(), re||".");
  /* what the keys should hold after a move: the notes a player reaches there */
  const want=(p, ms, tag)=>p.evaluate(([ms,tag])=>ms.filter(m=>playerFor(m)).map(m=>tag+m).sort(), [ms, tag]);
  { const {c, p, errs}=await open({viewport:{width:844,height:390}, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== band chord move · iPhone sideways");
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map(q=>({x:q.x,y:q.y,id:q.id}))});
    const at=(sel)=>p.evaluate(sel=>{ const r=document.querySelector(sel).getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; }, sel);
    const key=(m)=>p.evaluate(m=>{ const el=document.querySelector(`#kbd [data-m="${m}"]`); if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height*0.85}; }, m);
    ok(await p.evaluate("BP.on"), "the keys fill the screen");
    /* start where there is room to go up */
    await p.evaluate("while(!document.getElementById('bpDown').disabled) moveOct(-1)"); await p.waitForTimeout(150);
    const lo=await p.evaluate("KB.lo"), up=await at("#bpUp"), down=await at("#bpDown");
    let r0=lo; for(let m=lo;m<lo+12;m++){ if(await p.evaluate(m=>!!playerFor(m)&&!!playerFor(m+4)&&!!playerFor(m+7), m)){ r0=m; break; } }
    const ms=[r0, r0+4, r0+7], f=[]; for(let i=0;i<3;i++) f.push({...await key(ms[i]), id:i+1});
    await T("touchStart",f.slice(0,1)); await T("touchStart",f.slice(0,2)); await T("touchStart",f); await p.waitForTimeout(150);
    const h0=await held(p, "^k");
    ok(JSON.stringify(h0)===JSON.stringify(await want(p, ms, "k")) && h0.length===3, "three fingers hold a chord: "+h0.join(" "));
    await T("touchStart",[...f,{...up,id:9}]); await T("touchEnd",[{...up,id:9}]); await p.waitForTimeout(250);
    const h1=await held(p, "^k"), w1=await want(p, ms.map(m=>m+12), "k");
    ok(await p.evaluate("KB.lo")===lo+12, "the other hand taps Higher ▶ while the chord is held, and the board moves up");
    ok(w1.length>0 && JSON.stringify(h1)===JSON.stringify(w1), "the chord moves up an octave and keeps ringing: "+h1.join(" "));
    ok(await p.evaluate(ms=>ms.every(m=>!LIVE.has("k"+m)), ms), "the old notes stop");
    await T("touchStart",[...f,{...down,id:10}]); await T("touchEnd",[{...down,id:10}]); await p.waitForTimeout(250);
    ok(JSON.stringify(await held(p, "^k"))===JSON.stringify(h0) && await p.evaluate("KB.lo")===lo, "◀ Lower brings it back down");
    await T("touchEnd",[]); await p.waitForTimeout(150);
    ok((await held(p)).length===0, "lifting the fingers stops the chord");
    await T("touchStart",[{...f[0]}]); await T("touchEnd",[]); await T("touchStart",[{...up,id:12}]); await T("touchEnd",[]); await p.waitForTimeout(200);
    ok(await p.evaluate("KB.lo")===lo, "a tap on ▶ right after a key is lifted is a slip, as before");
    /* a chord pad on the strip */
    await p.waitForTimeout(800);
    const sp=await at('#pvStrip .cs[data-i="0"]');
    await T("touchStart",[{...sp,id:1}]); await p.waitForTimeout(150);
    const ph=await p.evaluate(()=>[...LIVE.entries()].filter(([k,v])=>v.down).map(([k,v])=>({k, inst:v.inst, m:v.m})));
    const exp=await p.evaluate(ph=>ph.map(o=>{ const x=fitIn(o.m+12, o.inst); return (x==null?o.m:x)+":"+o.inst; }).sort(), ph);
    await T("touchStart",[{...sp,id:1},{...up,id:11}]); await T("touchEnd",[{...up,id:11}]); await p.waitForTimeout(250);
    const ph2=await p.evaluate(()=>[...LIVE.entries()].filter(([k,v])=>v.down).map(([k,v])=>v.m+":"+v.inst).sort());
    const moved=await p.evaluate(ph=>ph.some(o=>fitIn(o.m+12, o.inst)===o.m+12), ph);
    ok(ph.length>=3 && moved && JSON.stringify(ph2)===JSON.stringify(exp), "a chord pad held on the strip moves up, each part with its own player: "+ph.map(o=>o.m).join(",")+" → "+ph2.join(","));
    ok(await p.evaluate(()=>(padHeld[0]||[]).every(k=>LIVE.has(k))), "the pad still knows its moved notes");
    await T("touchEnd",[]); await p.waitForTimeout(150);
    ok((await held(p)).length===0, "letting go of the pad stops it");
    ok(!errs.length, "no errors: "+errs.join(" | "));
    await c.close(); }
  { const {c, p, errs}=await open({viewport:{width:1280,height:900}}); console.log("== band chord move · computer");
    await p.evaluate(()=>{ document.getElementById("kbd").scrollIntoView(); while(!document.getElementById("downBtn").disabled) moveOct(-1); });
    const lo=await p.evaluate("KB.lo"), ms=[lo, lo+4, lo+7];
    await p.keyboard.down("a"); await p.keyboard.down("d"); await p.keyboard.down("g"); await p.waitForTimeout(150);
    const h0=await held(p, "^k");
    ok(h0.length>0 && JSON.stringify(h0)===JSON.stringify(await want(p, ms, "k")), "A D G hold a chord: "+h0.join(" "));
    await p.keyboard.press("x"); await p.waitForTimeout(150);
    const h1=await held(p, "^k");
    ok(h1.length>0 && JSON.stringify(h1)===JSON.stringify(await want(p, ms.map(m=>m+12), "k")) && await p.evaluate("KB.lo")===lo+12, "X moves the board and the chord up an octave: "+h1.join(" "));
    await p.keyboard.press("z"); await p.waitForTimeout(150);
    ok(JSON.stringify(await held(p, "^k"))===JSON.stringify(h0), "Z brings it back");
    await p.keyboard.up("a"); await p.keyboard.up("d"); await p.keyboard.up("g"); await p.waitForTimeout(150);
    ok(await p.evaluate("LIVE.size")===0, "letting go stops it");
    await p.click("#upBtn"); await p.waitForTimeout(100);
    ok(await p.evaluate("KB.lo")===lo+12 && await p.evaluate("LIVE.size")===0, "nothing held: ◀ ▶ only move the board");
    ok(!errs.length, "no errors: "+errs.join(" | "));
    await c.close(); }
  await b.close(); srv.close(); console.log(fails?fails+" FAILED":"all passed"); process.exit(fails?1:0);
})().catch(e=>{ console.log("FAIL crash "+e.stack); process.exit(1); });
