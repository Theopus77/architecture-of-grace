/* AOG-HAND-LIT-V1 (Jimmy, 2026-10-05: "When I am playing a chord on the guitar, I am unsure what notes are playing. Can they be
   highlighted like the piano?"): a string played by hand lights orange on the neck while it rings, then goes dark. Port 9944. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9944);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const lit=p=>p.evaluate(()=>[...document.querySelectorAll("#neck .dot.now")].map(g=>g.getAttribute("data-c")).sort().join(" "));
  for(const inst of ["guitar","bass"]){
    /* upright: a chord button, one fret, Mute */
    { const c=await b.newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
      await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
      await p.goto(`http://localhost:9944/music-${inst}.html`); await p.waitForTimeout(1500); console.log("== "+inst+" · iPhone upright");
      await p.evaluate(()=>{ S.key=0; S.minor=false; S.fret0=1; buildNeck(); paintPads(); });
      const pad=await p.$('#chordStrip .cs[data-i="4"]'); await pad.scrollIntoViewIfNeeded(); await pad.tap(); await p.waitForTimeout(150);
      const want=await p.evaluate(()=>{ const out=[]; if(GTR){ shapeFor(S.hand).forEach((f,s)=>{ if(f>=0) out.push(s+":"+f); }); } else { STR_LIVE.forEach((L,s)=>{ if(L) out.push(s+":"+L.f); }); } return out.sort().join(" "); });
      const a=await lit(p);
      ok(a.length>0 && a===want, `a chord button lights the notes it plays, orange: ${a} (${want})`);
      await p.waitForTimeout(3300);
      ok((await lit(p))==="", "once they have died away, the neck is quiet again");
      const q=await p.evaluate(()=>{ const r=document.getElementById("neck").getBoundingClientRect(), k=r.width/NECK.W, [x,y]=neckXY(1,3); return {x:r.left+x*k, y:r.top+y*k}; });
      await p.evaluate(()=>{ S.hand=null; litNeck(); }); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(150);
      ok((await lit(p))==="1:3", "one fret tapped lights that note: "+await lit(p));
      await p.evaluate(()=>muteAll()); await p.waitForTimeout(250);
      ok((await lit(p))==="", "Mute darkens it at once");
      ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  }
  /* sideways on a phone: a strum lights every string it sounds */
  { const c=await b.newContext({viewport:{width:844,height:390}, isMobile:true, hasTouch:true}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9944/music-guitar.html"); await p.waitForTimeout(1500); console.log("== guitar · iPhone sideways");
    const cdp=await c.newCDPSession(p); const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:i+1}))});
    const g=await p.evaluate(()=>{ const r=document.querySelector('#pvStrip .cs[data-i="4"]').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
    await T("touchStart",[g]); await p.waitForTimeout(60); await T("touchEnd",[]); await p.waitForTimeout(100);
    await p.evaluate(()=>muteAll()); await p.waitForTimeout(150);
    const sw=await p.evaluate(()=>{ const r=document.getElementById("neck").getBoundingClientRect(), k=r.width/NECK.W, s=neckStrum(); return {x:r.left+(s.x0+s.w/2)*k, y0:r.top+Math.min(neckY(0),neckY(5))*k-10, y1:r.top+Math.max(neckY(0),neckY(5))*k+10}; });
    await T("touchStart",[{x:sw.x,y:sw.y0}]); for(let i=1;i<=6;i++){ await T("touchMove",[{x:sw.x,y:sw.y0+(sw.y1-sw.y0)*i/6}]); await p.waitForTimeout(10); } await T("touchEnd",[]);
    await p.waitForTimeout(150);
    const a=await lit(p), want=await p.evaluate(()=>shapeFor(S.hand).map((f,s)=>f>=0?s+":"+f:null).filter(Boolean).sort().join(" "));
    ok(a===want, `a strum lights each string it sounds: ${a}`);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  await b.close();
  console.log(fails? fails+" FAILED" : "ALL PASS"); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH "+e.stack); process.exit(1); });
