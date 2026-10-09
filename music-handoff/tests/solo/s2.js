/* Solo mode under real fingers (touch events through the browser): a bend lands at +200 cents, a hammer-on and a pull-off
   do not pick again, Tap is legato, the squeal, the whammy dives and comes back, the kill switch cuts, feedback blooms
   on a held note through a high-gain amp, Auto vibrato; the bass's slap and pop; then the computer keys. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9923);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(inst, dev, opt)=>{
    const c=await b.newContext(opt||pw.devices[dev]); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9923/music-${inst}.html`); await p.waitForTimeout(1200);
    await p.evaluate(()=>{ AOGSolo.setMode("solo"); S.key=9; S.minor=true; S.fret0=5; buildNeck(); ctx();
      window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,id,m,v,when,s){ if(cx===ac) window.__v.push({m, s, v:+v.toFixed(2)}); return mv.apply(this,arguments); };
      /* a pitch meter on the strings before the amp, and a level meter after the kill switch */
      const an=ac.createAnalyser(); an.fftSize=8192; LIVE_CH.amp.connect(an); window.__an=an;
      const lv=ac.createAnalyser(); lv.fftSize=2048; LIVE_CH.post.connect(lv); window.__lv=lv;
      window.__hz=(near)=>{ const d=new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); const sr=ac.sampleRate, lo=Math.floor(sr/(near*1.2)), hi=Math.ceil(sr/(near/1.2));
        let best=-1, bl=lo; const ac2=[]; for(let L=lo-1;L<=hi+1;L++){ let s=0, e1=0, e2=0; for(let i=0;i+L<d.length;i++){ s+=d[i]*d[i+L]; e1+=d[i]*d[i]; e2+=d[i+L]*d[i+L]; } ac2[L]=s/Math.sqrt(e1*e2+1e-12); }
        for(let L=lo;L<=hi;L++) if(ac2[L]>best){ best=ac2[L]; bl=L; }
        const a=ac2[bl-1], c2=ac2[bl+1], sh=(a-c2)/(2*(a-2*best+c2)); return sr/(bl+(isFinite(sh)?sh:0)); };
      window.__rms=()=>{ const d=new Float32Array(lv.fftSize); lv.getFloatTimeDomainData(d); let s=0; for(const x of d) s+=x*x; return Math.sqrt(s/d.length); };
      window.__rate=(s)=>{ const L=STR_LIVE[s]; return L && L.vc.vc && L.vc.vc.nodes ? L.vc.vc.nodes[0].playbackRate.value : null; }; });
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:q.id||i+1}))});
    const cell=async(s,f)=>{ await p.evaluate(()=>document.getElementById("neck").scrollIntoView({block:"center"})); return p.evaluate(([s,f])=>{ const r=document.getElementById("neck").getBoundingClientRect(), k=r.width/NECK.W;
      const y=NECK.top+s*NECK.rowH+NECK.rowH/2; let x; if(f==="strum") x=NECK.nut+NECK.n*NECK.cw+6+(NECK.W-(NECK.nut+NECK.n*NECK.cw+6))/2; else x=NECK.nut+(f-S.fret0+0.5)*NECK.cw;
      return {x:r.left+x*k, y:r.top+y*k, row:NECK.rowH*k, h:NECK.rows*NECK.rowH*k}; }, [s,f]); };
    return {c, p, errs, T, cell, cdp};
  };
  const cents=(a,b)=>1200*Math.log2(a/b);
  for(const dev of ["iPhone 13","iPad (gen 7)"]){
    const {c, p, errs, T, cell}=await open("guitar", dev); console.log("== guitar · "+dev);
    /* a bend: the G string at fret 7 (D), pushed past a whole step */
    let q=await cell(3,7);
    await T("touchStart",[q]); await p.waitForTimeout(160);
    const r0=await p.evaluate("__rate(3)"), hz0=await p.evaluate("__hz(293.7)");
    for(let i=1;i<=6;i++){ await T("touchMove",[{x:q.x, y:q.y-q.row*1.2*i/6}]); await p.waitForTimeout(18); }
    await p.waitForTimeout(220);
    const r1=await p.evaluate("__rate(3)"), hz1=await p.evaluate("__hz(329.6)"), bent=await p.evaluate(()=>!!document.querySelector("#neck #soBend .so-bent"));
    ok(Math.abs(cents(r1,r0)-200)<=10, `a bend lands at ${cents(r1,r0).toFixed(1)} cents (the string's own rate)`);
    ok(Math.abs(cents(hz1,hz0)-200)<=10, `and the sound itself: ${hz0.toFixed(2)} Hz → ${hz1.toFixed(2)} Hz, ${cents(hz1,hz0).toFixed(1)} cents`);
    ok(bent, "the string is drawn bent while it is pushed");
    await T("touchEnd",[]); await p.waitForTimeout(120);
    ok(await p.evaluate(()=>!document.querySelector("#neck #soBend .so-bent")), "and straight again when the finger lifts");
    /* a hammer-on and a pull-off: one pick only */
    await p.evaluate("__v=[]; muteAll()");
    const a=await cell(2,5), z=await cell(2,7);
    await T("touchStart",[{...a,id:1}]); await p.waitForTimeout(90);
    await T("touchStart",[{...a,id:1},{...z,id:2}]); await p.waitForTimeout(90);
    const h1=await p.evaluate(()=>({n:__v.length, f:STR_LIVE[2]&&STR_LIVE[2].f}));
    ok(h1.n===1 && h1.f===7, `a second finger higher on the ringing string hammers on: ${h1.n} pick, now fret ${h1.f}`);
    await T("touchEnd",[{...z,id:2}]); await p.waitForTimeout(90);   /* CDP lifts the fingers a touchEnd lists: finger 2 lifts, finger 1 stays */
    const h2=await p.evaluate(()=>({n:__v.length, f:STR_LIVE[2]&&STR_LIVE[2].f}));
    ok(h2.n===1 && h2.f===5, `lifting it pulls off to fret ${h2.f}, still ${h2.n} pick`);
    await T("touchEnd",[]); await p.waitForTimeout(60);
    /* Tap: every touch legato */
    await p.evaluate("__v=[]; muteAll(); document.getElementById('soTap').click()");
    const t1=await cell(4,5), t2=await cell(4,8), t3=await cell(4,6);
    for(const q2 of [t1,t2,t3]){ await T("touchStart",[q2]); await p.waitForTimeout(70); await T("touchEnd",[]); await p.waitForTimeout(50); }
    const tp=await p.evaluate(()=>({n:__v.length, v:__v.map(x=>x.v), f:STR_LIVE[4]&&STR_LIVE[4].f, pressed:document.getElementById("soTap").getAttribute("aria-pressed")}));
    ok(tp.pressed==="true" && tp.n===1 && tp.f===6, `Tap: three touches, one soft start (${JSON.stringify(tp.v)}), the rest legato, now fret ${tp.f}`);
    await p.evaluate("document.getElementById('soTap').click()");
    /* the pinch squeal */
    await p.evaluate("muteAll(); document.getElementById('soPinch').click()");
    q=await cell(3,7); await T("touchStart",[q]); await p.waitForTimeout(80);
    ok(await p.evaluate(()=>STR_LIVE[3].vc.parts.some(x=>x.kind==="pinch")), "Pinch squeal adds the high harmonic to the next note");
    await T("touchEnd",[]);
    /* AOG-SOLO-PINCH-STOP-V1 (Jimmy: "The pitch squeal won't stop after you hit it"): the squeal stops when its string is
       picked again, when Mute is pressed, and dies away by itself with the string */
    await p.evaluate(()=>{ window.__pq=STR_LIVE[3].vc.parts.find(x=>x.kind==="pinch"); });
    await T("touchStart",[q]); await p.waitForTimeout(60); await T("touchEnd",[]); await p.waitForTimeout(400);
    const pq1=await p.evaluate(()=>({old:__pq.g.gain.value, now:(STR_LIVE[3].vc.parts.find(x=>x.kind==="pinch")||{g:{gain:{value:-1}}}).g.gain.value}));
    await p.evaluate(()=>{ window.__pq=STR_LIVE[3].vc.parts.find(x=>x.kind==="pinch"); document.getElementById("muteBtn").click(); }); await p.waitForTimeout(400);
    const pq2=await p.evaluate(()=>__pq.g.gain.value);
    await T("touchStart",[q]); await p.waitForTimeout(60); await T("touchEnd",[]);
    await p.evaluate(()=>{ window.__pq=STR_LIVE[3].vc.parts.find(x=>x.kind==="pinch"); }); await p.waitForTimeout(4200);
    const pq3=await p.evaluate(()=>__pq.g.gain.value);
    ok(pq1.old<0.003 && pq1.now>0.02 && pq2<0.003 && pq3<0.006, `the squeal stops: picked again ${pq1.old.toFixed(4)} (the new note's ${pq1.now.toFixed(3)}), Mute ${pq2.toFixed(4)}, by itself after 4 s ${pq3.toFixed(4)}`);
    await p.evaluate("muteAll(); document.getElementById('soPinch').click()");
    /* the whammy: a ringing note dives with the bar and comes back */
    await p.evaluate("muteAll()"); q=await cell(3,7); await T("touchStart",[q]); await p.waitForTimeout(60); await T("touchEnd",[]); await p.waitForTimeout(120);
    const w0=await p.evaluate("__rate(3)"), bar=await cell(1,"strum");
    await T("touchStart",[bar]); for(let i=1;i<=6;i++){ await T("touchMove",[{x:bar.x, y:bar.y+bar.h*0.55*i/6}]); await p.waitForTimeout(18); }
    await p.waitForTimeout(150);
    const w1=await p.evaluate("__rate(3)"), wv=await p.evaluate(()=>document.querySelector("#soWham").getAttribute("aria-valuetext"));
    await T("touchEnd",[]); await p.waitForTimeout(400);
    const w2=await p.evaluate("__rate(3)");
    ok(cents(w1,w0)<-500, `the whammy dives the ringing note ${cents(w1,w0).toFixed(0)} cents ("${wv}")`);
    ok(Math.abs(cents(w2,w0))<5, `and it comes back when let go (${cents(w2,w0).toFixed(1)} cents)`);
    /* the kill switch */
    await p.evaluate("muteAll()"); q=await cell(4,8); await T("touchStart",[q]); await p.waitForTimeout(70); await T("touchEnd",[]); await p.waitForTimeout(150);
    const k0=await p.evaluate("__rms()");
    const kb=await p.evaluate(()=>{ const b=document.getElementById("soKill"); b.scrollIntoView({block:"center"}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; });
    await T("touchStart",[kb]); await p.waitForTimeout(90);
    const k1=await p.evaluate("__rms()"), kp=await p.evaluate(()=>document.getElementById("soKill").getAttribute("aria-pressed"));
    await T("touchEnd",[]); await p.waitForTimeout(90);
    const k2=await p.evaluate("__rms()");
    ok(k0>0.002 && k1<k0*0.02 && kp==="true", `Hold to cut silences the lead (${k0.toFixed(4)} → ${k1.toFixed(5)})`);
    ok(k2>k1*10, `and the sound is back on release (${k2.toFixed(4)})`);
    /* feedback: the lead sound, a note held 1.8 s */
    await p.evaluate("muteAll()"); q=await cell(2,7); await T("touchStart",[q]); await p.waitForTimeout(1900);
    const fb=await p.evaluate(()=>{ const lv=STR_LIVE[2].vc; return {sound:S.sound, fb:!!lv.fb, g:lv.fb?+lv.fb.g.gain.value.toFixed(3):0, blooms:AOGSolo._t.SO.blooms}; });
    ok(fb.sound==="lead" && fb.fb && fb.g>0.02, `a note held on the lead sound blooms into feedback after 1.5 s (${JSON.stringify(fb)})`);
    await T("touchEnd",[]); await p.waitForTimeout(400);
    ok(await p.evaluate(()=>{ const lv=STR_LIVE[2].vc; return !lv.fb; }), "and the bloom lets go with the finger");
    /* Auto vibrato */
    await p.evaluate("muteAll(); document.getElementById('soVib').click()"); q=await cell(4,8); await T("touchStart",[q]); await p.waitForTimeout(650);
    const rates=[]; for(let i=0;i<12;i++){ rates.push(await p.evaluate("__rate(4)")); await p.waitForTimeout(25); }
    const cs=rates.map(r=>cents(r, rates[0])); const span=Math.max(...cs)-Math.min(...cs);
    ok(span>12 && span<45, `Auto vibrato moves a held note gently (${span.toFixed(1)} cents wide)`);
    await T("touchEnd",[]); await p.evaluate("document.getElementById('soVib').click()");
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  /* the bass: a tap slaps, a flick up pops */
  { const {c, p, errs, T, cell}=await open("bass", "iPhone 13"); console.log("== bass · iPhone 13");
    await p.evaluate("__v=[]");
    const q=await cell(1,7); await T("touchStart",[q]); await p.waitForTimeout(60); await T("touchEnd",[]); await p.waitForTimeout(80);
    const s1=await p.evaluate(()=>({v:__v.map(x=>x.v), sound:S.sound}));
    ok(s1.sound==="slap" && s1.v.length===1 && s1.v[0]>=0.8, "a tap is a thumb slap on the slap bass: "+JSON.stringify(s1));
    await p.evaluate("__v=[]"); const q2=await cell(3,7);
    await T("touchStart",[q2]); await p.waitForTimeout(20); await T("touchMove",[{x:q2.x, y:q2.y-8}]); await p.waitForTimeout(16); await T("touchMove",[{x:q2.x, y:q2.y-20}]); await p.waitForTimeout(60); await T("touchEnd",[]);
    const s2=await p.evaluate(()=>({v:__v.map(x=>x.v), pops:AOGSolo._t.SO.pops}));
    ok(s2.pops===1 && s2.v.length===2 && s2.v[1]===1, "a quick flick up pops the string (brighter, louder, with a snap): "+JSON.stringify(s2));
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  /* the computer keys */
  { const {c, p, errs}=await open("guitar", "Desktop", {viewport:{width:1280,height:900}}); console.log("== guitar · keys");
    /* AOG-SOLO-KEYS-CHOICE-V1: by default the letters play like the piano (A is C) */
    await p.evaluate(()=>{ document.activeElement.blur(); __v=[]; });
    await p.keyboard.down("KeyA"); await p.waitForTimeout(120);
    { const c0=await p.evaluate(()=>{ const [s,f]=[...KEYCELLS.values()][0].split(":").map(Number); return (TUNING[s]+f)%12; }); ok(c0===0, "by default A plays C, as on the piano: "+c0); }
    await p.keyboard.up("KeyA"); await p.waitForTimeout(120);
    /* "Only the scale": A plays the lowest lit note, as before */
    await p.click('[data-so-keys="scale"]'); await p.evaluate(()=>{ document.activeElement.blur(); __v=[]; });
    await p.keyboard.down("KeyA"); await p.waitForTimeout(120);
    const k=await p.evaluate(()=>({n:__v.length, cells:[...KEYCELLS.values()], first:AOGSolo._t.keyCells()[0]}));
    ok(k.n===1 && k.cells.length===1 && k.cells[0]===k.first.s+":"+k.first.f, "A plays the lowest lit note, lit gold: "+k.cells[0]);
    const s=k.first.s, r0=await p.evaluate(s=>__rate(s), s);
    await p.keyboard.down("KeyB"); await p.waitForTimeout(350); const r1=await p.evaluate(s=>__rate(s), s);
    await p.keyboard.up("KeyB"); await p.waitForTimeout(300); const r2=await p.evaluate(s=>__rate(s), s);
    ok(Math.abs(cents(r1,r0)-200)<=10 && Math.abs(cents(r2,r0))<=5, `holding B bends it a whole step (${cents(r1,r0).toFixed(1)}) and letting go brings it back (${cents(r2,r0).toFixed(1)})`);
    await p.keyboard.down("KeyM"); await p.waitForTimeout(80); const g1=await p.evaluate(()=>LIVE_CH.post.gain.value);
    await p.keyboard.up("KeyM"); await p.waitForTimeout(80); const g2=await p.evaluate(()=>LIVE_CH.post.gain.value);
    ok(g1<0.01 && g2>0.3, `M cuts the sound while held (${g1.toFixed(3)} → ${g2.toFixed(3)})`);
    await p.keyboard.up("KeyA");
    await p.keyboard.press("Space"); await p.waitForTimeout(400);
    ok(await p.evaluate(()=>AOGSolo._t.BAND.on), "Space starts the band");
    await p.keyboard.press("Space"); await p.waitForTimeout(100);
    ok(await p.evaluate(()=>!AOGSolo._t.BAND.on), "and stops it");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
