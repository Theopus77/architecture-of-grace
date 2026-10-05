/* The guitar and the bass under real fingers (touch events through the browser): pads, frets, slides, the strum strip,
   two fingers, the window of frets, the mute, the wheel, and the layout on an iPhone, an iPad and a small iPhone. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9976);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const inst of ["guitar","bass"]) for(const dev of ["iPhone 13","iPad (gen 7)","iPhone SE"]){
    const c=await b.newContext(pw.devices[dev]); const p=await c.newPage();
    const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9976/music-${inst}.html`); await p.waitForTimeout(1200);
    await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,id,m,v,when,s){ if(cx===ac) window.__v.push({m:m, s:s, v:+v.toFixed(2)}); return mv.apply(this,arguments); }; });
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:q.id||i+1}))});
    const box=async(sel)=>{ const l=p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); return l.boundingBox(); };
    /* the middle of a place on the neck, on screen: string s (0 = the thick one, on top), fret f, or the strum strip */
    const cell=async(s,f)=>{ await box("#neck"); return p.evaluate(([s,f])=>{ const r=document.getElementById("neck").getBoundingClientRect(), k=r.width/NECK.W;
      const y=NECK.top+s*NECK.rowH+NECK.rowH/2; let x;
      if(f==="strum") x=NECK.nut+NECK.n*NECK.cw+6+(NECK.W-(NECK.nut+NECK.n*NECK.cw+6))/2; else if(f===0) x=(NECK.nut-4)/2; else x=NECK.nut+(f-S.fret0+0.5)*NECK.cw;
      return {x:r.left+x*k, y:r.top+y*k}; }, [s,f]); };
    const live=()=>p.evaluate(()=>STR_LIVE.map((x,s)=>x&&!x.vc.stopped?s+":"+x.f:null).filter(Boolean).join(" "));
    console.log(`== ${inst} · ${dev}`);
    const n=await p.evaluate(()=>NECK.n);
    ok(n>=(inst==="bass"?5:4), `the neck shows ${n} frets`);
    /* a pad, as the finger lands */
    await p.evaluate("__v=[]");
    const pd=await box('.pad[data-i="0"]'); await T("touchStart",[{x:pd.x+pd.width/2, y:pd.y+pd.height*0.6}]); await p.waitForTimeout(80);
    const v1=await p.evaluate("__v");
    if(inst==="guitar"){
      const shp=await p.evaluate("shapeFor({off:0,q:'maj'})"), want=shp.filter(f=>f>=0).length;
      ok(v1.length===want, `pad C strums ${v1.length} strings (the shape has ${want}): ${v1.map(x=>x.m).join(",")}`);
      ok(v1.every((x,i)=>i===0 || x.s>v1[i-1].s), "the strum goes from the thick string to the thin one");
    } else ok(v1.length===1 && v1[0].m%12===0, `pad C plays one low C: ${v1.map(x=>x.m).join(",")}`);
    ok(await p.evaluate(()=>document.querySelector('.pad[data-i="0"]').classList.contains("hit")), "the pad lights while the finger is down");
    ok(await p.evaluate(()=>document.querySelector('#wheel [data-k="o0"]').classList.contains("hit")), "the wheel's C lights gold at once");
    await T("touchEnd",[]); await p.waitForTimeout(80);
    ok((await live()).length>0, "the strings ring on after the finger lifts: "+await live());
    ok(await p.evaluate(()=>!document.querySelector('.pad[data-i="0"]').classList.contains("hit")), "the pad goes dark when the finger lifts");
    const dots=await p.evaluate(()=>[...document.querySelectorAll("#neck .dot.fit, #neck .dot.now")].map(g=>g.getAttribute("data-c")).join(" "));
    ok(dots.length>0, "the chord shows on the neck: "+dots);
    /* a fret, then a slide along the string, then over to the next string */
    await p.evaluate("__v=[]");
    const f0=await p.evaluate("S.fret0");
    const a=await cell(1, f0), z=await cell(1, f0+2), other=await cell(2, f0+2);
    await T("touchStart",[a]); await p.waitForTimeout(50);
    ok((await p.evaluate("__v.length"))===1 && (await live()).split(" ").includes("1:"+f0), "a tap on string 2, fret "+f0+" plays it: "+await live());
    ok(await p.evaluate(([s,f])=>document.querySelector(`#neck .dot[data-c="${s}:${f}"]`).classList.contains("down"), [1,f0]), "and lights gold under the finger");
    for(let i=1;i<=6;i++){ await T("touchMove",[{x:a.x+(z.x-a.x)*i/6, y:a.y}]); await p.waitForTimeout(25); }
    ok((await p.evaluate("__v.length"))===1, "sliding along the string glides, without plucking again");
    ok((await live()).split(" ").includes("1:"+(f0+2)), "the string now sounds two frets higher: "+await live());
    await T("touchMove",[other]); await p.waitForTimeout(40);
    ok((await p.evaluate("__v.length"))===2, "moving onto the next string plucks it");
    await T("touchEnd",[]); await p.waitForTimeout(60);
    ok(await p.evaluate(()=>!document.querySelector("#neck .dot.down")), "nothing stays gold after the finger lifts");
    /* two fingers on two strings */
    await p.evaluate("__v=[]");
    const t1=await cell(0, f0+1), t2=await cell(2, f0+1);
    await T("touchStart",[{...t1,id:1},{...t2,id:2}]); await p.waitForTimeout(60);
    ok((await p.evaluate("__v.length"))===2, "two fingers pluck two strings at once");
    await T("touchEnd",[]); await p.waitForTimeout(40);
    /* one note at a time on a string */
    await p.evaluate("__v=[]; muteAll()");
    const q1=await cell(0, f0), q2=await cell(0, f0+1);
    await T("touchStart",[q1]); await T("touchEnd",[]); await p.waitForTimeout(40);
    await T("touchStart",[q2]); await T("touchEnd",[]); await p.waitForTimeout(40);
    ok((await live())==="0:"+(f0+1), "a string plays one note at a time: "+await live());
    if(inst==="guitar"){
      /* the strum strip: a finger drawn down across the six strings */
      await p.evaluate("__v=[]; S.hand={off:7,q:'maj'}; litNeck()");
      const top=await cell(0,"strum"), bot=await cell(5,"strum");
      await T("touchStart",[{x:top.x, y:top.y-10}]); await p.waitForTimeout(30);
      for(let i=1;i<=10;i++){ await T("touchMove",[{x:top.x, y:top.y-10+(bot.y-top.y+20)*i/10}]); await p.waitForTimeout(18); }
      await T("touchEnd",[]); await p.waitForTimeout(60);
      const st=await p.evaluate("__v.map(x=>x.s).join('')"), shp=await p.evaluate("shapeFor({off:7,q:'maj'})");
      ok(st==="012345" || st===shp.map((f,s)=>f>=0?s:"").join(""), `a finger down the strum strip plays every string once, thick to thin: ${st} (G shape ${JSON.stringify(shp)})`);
      const notes=await p.evaluate("__v.map(x=>x.m)"), wantN=shp.map((f,s)=>f>=0?[40,45,50,55,59,64][s]+f:null).filter(x=>x!=null);
      ok(JSON.stringify(notes)===JSON.stringify(wantN), "with the G chord in the hand: "+notes.join(","));
      /* and back up */
      await p.evaluate("__v=[]");
      await T("touchStart",[{x:bot.x, y:bot.y+10}]);
      for(let i=1;i<=10;i++){ await T("touchMove",[{x:bot.x, y:bot.y+10-(bot.y-top.y+20)*i/10}]); await p.waitForTimeout(18); }
      await T("touchEnd",[]); await p.waitForTimeout(60);
      ok((await p.evaluate("__v.map(x=>x.s).join('')"))==="543210", "and back up plays them thin to thick: "+await p.evaluate("__v.map(x=>x.s).join('')"));
      /* a string the shape skips is muted by the strum, not played */
      await p.evaluate("__v=[]; S.hand={off:2,q:'maj'}; muteAll(); STR_LIVE[0]=null; litNeck()");
      await T("touchStart",[{x:top.x, y:top.y-10}]);
      for(let i=1;i<=10;i++){ await T("touchMove",[{x:top.x, y:top.y-10+(bot.y-top.y+20)*i/10}]); await p.waitForTimeout(18); }
      await T("touchEnd",[]); await p.waitForTimeout(60);
      const dsh=await p.evaluate("shapeFor({off:2,q:'maj'})");
      ok((await p.evaluate("__v.length"))===dsh.filter(f=>f>=0).length, `the D chord strums only its ${dsh.filter(f=>f>=0).length} strings (${JSON.stringify(dsh)})`);
      ok(await p.evaluate(()=>[...document.querySelectorAll("#neck .nk-x")].filter(x=>x.style.display!=="none").length)===dsh.filter(f=>f<0).length, "and the skipped strings show ×");
    }
    /* the mute */
    await p.evaluate("pluckCell(0,3,0.7); pluckCell(1,3,0.7)");
    const mb=await box("#muteBtn"); await p.touchscreen.tap(mb.x+mb.width/2, mb.y+mb.height/2); await p.waitForTimeout(60);
    ok((await live())==="", "✋ Mute the strings stops every string");
    /* the window: higher, then lower */
    const up=await box("#upBtn"); await p.touchscreen.tap(up.x+up.width/2, up.y+up.height/2); await p.waitForTimeout(60);
    const w1=await p.evaluate(()=>[S.fret0, document.getElementById("fretsOut").textContent, [...document.querySelectorAll("#neck .nk-num")].map(e=>e.textContent).join(",")]);
    ok(w1[0]===f0+1 && w1[1].indexOf(String(f0+1))>=0, "Higher ▶ moves the hand up one fret: "+w1[1]+" ("+w1[2]+")");
    const dn=await box("#downBtn"); await p.touchscreen.tap(dn.x+dn.width/2, dn.y+dn.height/2); await p.waitForTimeout(60);
    ok((await p.evaluate("S.fret0"))===f0, "◀ Lower moves it back");
    ok(await p.evaluate(()=>document.getElementById("downBtn").disabled), "◀ Lower rests at the nut");
    /* the wheel: tap F */
    await p.evaluate("__v=[]");
    const wf=await p.evaluate(()=>{ const g=document.querySelector('#wheel [data-k="o11"] path'); g.scrollIntoView({block:"center"}); const r=g.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; });
    await T("touchStart",[wf]); await p.waitForTimeout(60);
    ok(await p.evaluate(()=>document.querySelector('#wheel [data-k="o11"]').classList.contains("hit")), "a wheel chord lights gold at the touch");
    ok((await p.evaluate("__v.length"))>=1 && (await p.evaluate("S.hand && S.hand.off===5 && S.hand.q==='maj'")), "and plays F, which is now the chord in the hand");
    await T("touchEnd",[]); await p.waitForTimeout(40);
    /* layout */
    const lay=await p.evaluate(()=>({over:document.documentElement.scrollWidth-innerWidth, cw:NECK.cw*document.getElementById("neck").getBoundingClientRect().width/NECK.W, rh:NECK.rowH*document.getElementById("neck").getBoundingClientRect().width/NECK.W}));
    ok(lay.over<=2, "no sideways scrolling ("+lay.over+" px)");
    ok(lay.cw>=40 && lay.rh>=40, `each place on the neck is ${Math.round(lay.cw)} × ${Math.round(lay.rh)} px`);
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
