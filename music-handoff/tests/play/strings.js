/* AOG-PLAY-V1: the guitar and the bass played sideways. An iPhone turned on its side (844 × 390) and an iPad (1180 × 820),
   both by touch through the DevTools protocol (several fingers at once): the neck fills the screen, no zoom, no sideways
   scroll; a held fret is silent until the strum strip sounds it, at the right pitch (measured); a chord held with three
   fingers and a swipe sounds every string in the swipe's order, spaced by its speed; a slide and a bend glide; a lifted
   finger mutes; the drawer's chord plays with no fingers; left-handed; Solo mode's whammy on the strip; the bass's
   two-finger plucks and the fretless upright; Spanish; upright (portrait) unchanged; a computer's button. Port 9965. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9965);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const PHONE={viewport:{width:844,height:390}, isMobile:true, hasTouch:true, deviceScaleFactor:3};
const PAD={viewport:{width:1180,height:820}, isMobile:true, hasTouch:true, deviceScaleFactor:2};
const cents=(a,b)=>1200*Math.log2(a/b);
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(inst, opt, pre)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    if(pre) await p.addInitScript(pre);
    await p.goto(`http://localhost:9965/music-${inst}.html`); await p.waitForTimeout(1300);
    await p.evaluate(()=>{ ctx();
      window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,id,m,v,when,s){ if(cx===ac) window.__v.push({m, s, v:+v.toFixed(3), w:+Math.max(when,ac.currentTime).toFixed(4)}); return mv.apply(this,arguments); };
      const an=ac.createAnalyser(); an.fftSize=8192; LIVE_CH.amp.connect(an); window.__an=an;
      window.__hz=(near)=>{ const d=new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); const sr=ac.sampleRate, lo=Math.floor(sr/(near*1.2)), hi=Math.ceil(sr/(near/1.2));
        let best=-1, bl=lo; const a2=[]; for(let L=lo-1;L<=hi+1;L++){ let s=0, e1=0, e2=0; for(let i=0;i+L<d.length;i++){ s+=d[i]*d[i+L]; e1+=d[i]*d[i]; e2+=d[i+L]*d[i+L]; } a2[L]=s/Math.sqrt(e1*e2+1e-12); }
        for(let L=lo;L<=hi;L++) if(a2[L]>best){ best=a2[L]; bl=L; }
        const a=a2[bl-1], c2=a2[bl+1], sh=(a-c2)/(2*(a-2*best+c2)); return sr/(bl+(isFinite(sh)?sh:0)); };
      window.__mtof=m=>440*Math.pow(2,(m-69)/12); });
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:q.id||i+1}))});
    /* a place on the neck in page pixels: a string at a fret (between the frets, or on the line on a fretless), or the strip */
    const at=(s,f,dx)=>p.evaluate(([s,f,dx])=>{ const r=document.getElementById("neck").getBoundingClientRect(), k=r.width/NECK.W;
      let [x,y]=neckXY(s, f==="strum"?0:f); if(f==="strum"){ const sb=neckStrum(); x=sb.x0+sb.w/2; }
      return {x:r.left+(x+(dx||0))*k, y:r.top+y*k, row:NECK.rowH*k}; }, [s,f,dx||0]);
    return {c, p, errs, T, at};
  };

  for(const [dev, opt] of [["iPhone sideways", PHONE], ["iPad sideways", PAD]]){
    const {c, p, errs, T, at}=await open("guitar", opt); console.log("== guitar · "+dev);
    const lay=await p.evaluate(()=>{ const fx=NECK.fx, w=fx.slice(1).map((x,i)=>x-fx[i]);
      return {on:PV.on, play:NECK.play, inView:!!document.querySelector("#playView #neckBox"), page:getComputedStyle(document.querySelector(".wrap")).display,
        zoom:getComputedStyle(document.body).zoom, sw:document.documentElement.scrollWidth, sh:document.scrollingElement.scrollHeight, iw:innerWidth, ih:innerHeight,
        w:w.map(x=>+x.toFixed(1)), n:NECK.n, rows:NECK.rows, low:neckY(0)>neckY(5), nutLeft:NECK.fx[0]<NECK.sx,
        pad:[...document.styleSheets].some(ss=>{ try{ return [...ss.cssRules].some(r=>/#playView/.test(r.selectorText||"") && /safe-area-inset-left/.test(r.cssText) && /safe-area-inset-bottom/.test(r.cssText)); }catch(e){ return false; } }),
        ta:getComputedStyle(document.getElementById("neck")).touchAction, bar:document.getElementById("pvClose").textContent }; });
    ok(lay.on && lay.play && lay.inView && lay.page==="none", "turned sideways, the neck fills the screen and the page steps aside");
    ok(lay.zoom==="1", "the play view is not zoomed (zoom "+lay.zoom+")");
    ok(lay.sw<=lay.iw && lay.sh<=lay.ih+1, `nothing scrolls: ${lay.sw}×${lay.sh} in ${lay.iw}×${lay.ih}`);
    ok(lay.w.every((x,i)=>i===0||x<lay.w[i-1]) && lay.w[lay.w.length-1]>=44, `${lay.n} frets, closer together towards the body: ${lay.w.join(", ")} px`);
    ok(lay.low && lay.nutLeft, "the low string at the bottom, the nut on the left");
    ok(lay.pad, "the play view keeps clear of the notch and the home bar (safe-area padding)");
    ok(lay.ta==="none" && /Close/.test(lay.bar), "the neck takes the touch; the bar reads "+lay.bar);

    /* AOG-CHORDSTRIP-V1: ♪ Notes (the first way): a fret plays the moment it is touched; the chord strip plays a chord */
    const md=await p.evaluate(()=>({tap:PV.tap, notes:document.getElementById("pvTap").getAttribute("aria-pressed"), strip:[...document.querySelectorAll("#pvStrip .cs")].map(b=>b.textContent)}));
    ok(md.tap && md.notes==="true" && md.strip.join(" ")==="C Dm Em F G Am", "♪ Notes is on, and the six chords sit on top of the neck: "+md.strip.join(" "));
    await p.evaluate("muteAll(); __v=[]"); { const q=await at(2,5); await T("touchStart",[q]); await p.waitForTimeout(60); await T("touchEnd",[]); }
    ok(JSON.stringify(await p.evaluate("__v.map(x=>x.m)"))==="[55]", "♪ Notes: a touch on a fret plays it at once (G)");
    await p.evaluate("muteAll(); __v=[]");
    { const b2=await p.evaluate(()=>{ const r=document.querySelector('#pvStrip .cs[data-i="0"]').getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; });
      await T("touchStart",[b2]); await p.waitForTimeout(120); await T("touchEnd",[]); await p.waitForTimeout(40); }
    ok(JSON.stringify(await p.evaluate("__v.map(x=>x.m)"))==="[48,52,55,60,64]", "a tap on C in the strip strums a C chord: "+JSON.stringify(await p.evaluate("__v.map(x=>x.m)")));
    await p.evaluate("muteAll(); S.hand=null; litNeck()");
    await p.click("#pvHold"); await p.waitForTimeout(60);
    ok(await p.evaluate("!PV.tap && document.getElementById('pvHold').getAttribute('aria-pressed')==='true'"), "one tap on ✋ Hold + strum switches to holding the frets");
    /* a held fret is silent; the strip sounds it at the right pitch, on every string */
    for(const [s,f] of [[0,3],[1,2],[2,5],[3,4],[4,1],[5,7]]){
      await p.evaluate("muteAll(); __v=[]");
      const q=await at(s,f), st=await at(s,"strum");
      await T("touchStart",[{...q,id:1}]); await p.waitForTimeout(60);
      const quiet=await p.evaluate("__v.length");
      await T("touchStart",[{...q,id:1},{...st,id:2}]); await p.waitForTimeout(260);
      const m=await p.evaluate(`__v.length?__v[__v.length-1].m:0`), want=await p.evaluate(`TUNING[${s}]+${f}`);
      const hz=await p.evaluate(`__hz(__mtof(${want}))`), c0=cents(hz, await p.evaluate(`__mtof(${want})`));
      ok(quiet===0 && m===want && Math.abs(c0)<20, `string ${s} fret ${f}: silent while held, then MIDI ${m} (want ${want}), heard ${hz.toFixed(1)} Hz, ${c0.toFixed(1)} cents`);
      await T("touchEnd",[]); await p.waitForTimeout(40);
    }

    /* a chord held with three fingers (C), a swipe up the strip from the low string: every string in order, spaced by speed */
    await p.evaluate("muteAll(); __v=[]");
    const C=[[1,3],[2,2],[4,1]]; const fing=[]; for(const [s,f] of C) fing.push({...(await at(s,f)), id:fing.length+1});
    await T("touchStart",fing); await p.waitForTimeout(50);
    const s0=await at(0,"strum"), s5=await at(5,"strum"), sw={x:s0.x, y:s0.y+s0.row*0.45, id:9};
    await T("touchStart",[...fing, sw]);
    for(let i=1;i<=8;i++){ await T("touchMove",[...fing, {...sw, y:sw.y+(s5.y-s0.row*0.45-sw.y)*i/8}]); await p.waitForTimeout(12); }
    await p.waitForTimeout(150);
    const ch=await p.evaluate("__v.map(x=>[x.s,x.m])");
    ok(JSON.stringify(ch)===JSON.stringify([[0,40],[1,48],[2,52],[3,55],[4,60],[5,64]]), "the swipe up sounds E C E G C E, low to high: "+JSON.stringify(ch));
    /* and back down: high to low */
    await p.evaluate("__v=[]"); const yTop=s5.y-s0.row*0.45;
    for(let i=1;i<=3;i++){ await T("touchMove",[...fing, {...sw, y:yTop+(sw.y-yTop)*i/3}]); await p.waitForTimeout(8); }
    await p.waitForTimeout(120);
    const dn=await p.evaluate("__v.map(x=>[x.s,x.v,x.w])");
    ok(dn.map(x=>x[0]).join("")==="543210", "the swipe back sounds high to low: "+dn.map(x=>x[0]).join(" "));
    ok(dn.every((x,i)=>i===0||x[2]>dn[i-1][2]), "each string a moment after the one before (+"+dn.slice(1).map((x,i)=>((x[2]-dn[i][2])*1000).toFixed(1)).join(", +")+" ms)");
    await T("touchEnd",[]); await p.waitForTimeout(60);

    /* a slide: a held, ringing note glides two frets up; a bend: pushed across, it rises a whole step; lifted, it stops */
    await p.evaluate("muteAll(); __v=[]");
    const a5=await at(3,5), a7=await at(3,7), st3=await at(3,"strum");
    await T("touchStart",[{...a5,id:1}]); await T("touchStart",[{...a5,id:1},{...st3,id:2}]); await p.waitForTimeout(40); await T("touchEnd",[{...st3,id:2}]);
    await p.waitForTimeout(200); const h0=await p.evaluate("__hz(__mtof(60))");
    for(let i=1;i<=6;i++){ await T("touchMove",[{x:a5.x+(a7.x-a5.x)*i/6, y:a5.y, id:1}]); await p.waitForTimeout(16); }
    await p.waitForTimeout(220); const h1=await p.evaluate("__hz(__mtof(62))");
    ok(Math.abs(cents(h1,h0)-200)<15 && await p.evaluate("__v.length")===1, `a slide glides, one pluck: ${h0.toFixed(1)} → ${h1.toFixed(1)} Hz (${cents(h1,h0).toFixed(0)} cents)`);
    for(let i=1;i<=6;i++){ await T("touchMove",[{x:a7.x, y:a7.y-a7.row*1.0*i/6, id:1}]); await p.waitForTimeout(16); }
    await p.waitForTimeout(220); const h2=await p.evaluate("__hz(__mtof(64))");
    ok(Math.abs(cents(h2,h1)-200)<15, `pushed across the string, it bends a whole step: ${cents(h2,h1).toFixed(0)} cents`);
    await T("touchMove",[{x:a7.x, y:a7.y-a7.row*0.15, id:1}]); await p.waitForTimeout(200);
    const h3=await p.evaluate("__hz(__mtof(62))");
    ok(Math.abs(cents(h3,h1))<45, `a small push is only a little (vibrato): ${cents(h3,h1).toFixed(0)} cents`);
    await T("touchEnd",[]); await p.waitForTimeout(80);
    ok(await p.evaluate("!STR_LIVE[3]"), "the finger lifted mutes the string");

    /* a hammer-on: a second finger on a ringing string retunes it, no new pluck; lifting it pulls off */
    await p.evaluate("muteAll(); __v=[]");
    const g4=await at(2,4), g6=await at(2,6), st2=await at(2,"strum");
    await T("touchStart",[{...g4,id:1}]); await T("touchStart",[{...g4,id:1},{...st2,id:2}]); await T("touchEnd",[{...st2,id:2}]); await p.waitForTimeout(60);
    await T("touchStart",[{...g4,id:1},{...g6,id:3}]); await p.waitForTimeout(60);
    const hm=await p.evaluate("({n:__v.length, m:STR_LIVE[2]&&STR_LIVE[2].m})");
    await T("touchEnd",[{...g6,id:3}]); await p.waitForTimeout(60);
    const po=await p.evaluate("({n:__v.length, m:STR_LIVE[2]&&STR_LIVE[2].m})");
    ok(hm.n===1 && hm.m===56 && po.m===54 && po.n===1, `hammer-on to ${hm.m}, pull-off to ${po.m}, ${po.n} pluck`);
    await T("touchEnd",[]);

    /* the drawer holds the sounds; a chord from the strip, then a strum with no fingers plays its shape */
    await p.evaluate("muteAll()"); await p.click("#pvMore"); await p.waitForTimeout(80);
    const dr=await p.evaluate(()=>({open:!document.getElementById("pvDrawer").hidden, sound:document.getElementById("pvSound").options.length}));
    ok(dr.open && dr.sound>20, `the drawer opens with ${dr.sound} sounds`);
    await p.click("#pvMore");
    const g=await p.evaluate(()=>{ const b=document.querySelector('#pvStrip .cs[data-i="4"]'), r=b.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; });
    await T("touchStart",[g]); await p.waitForTimeout(60); await T("touchEnd",[]); await p.waitForTimeout(40);
    await p.evaluate("muteAll(); __v=[]");
    await T("touchStart",[{...sw}]); for(let i=1;i<=6;i++){ await T("touchMove",[{...sw, y:sw.y+(yTop-sw.y)*i/6}]); await p.waitForTimeout(12); }
    await T("touchEnd",[]); await p.waitForTimeout(80);
    const gs=await p.evaluate("__v.map(x=>x.m)");
    ok(JSON.stringify(gs)===JSON.stringify([43,47,50,55,59,67]), "with no fingers, the strum plays the G tapped in the strip: "+JSON.stringify(gs));

    /* left-handed: the nut on the right, the strip on the left, the same notes */
    await p.click("#pvMore"); await p.click("#pvLeft"); await p.click("#pvMore");
    const L=await p.evaluate(()=>({flip:NECK.flip, strip:neckStrum().x0, W:NECK.W, x:neckXY(0,3)[0]}));
    await p.evaluate("muteAll(); __v=[]");
    const lq=await at(0,3), ls=await at(0,"strum");
    await T("touchStart",[{...lq,id:1}]); await T("touchStart",[{...lq,id:1},{...ls,id:2}]); await p.waitForTimeout(60); await T("touchEnd",[]);
    const lm=await p.evaluate("__v.map(x=>x.m)");
    ok(L.flip && L.strip===0 && L.x>L.W/2 && JSON.stringify(lm)==="[43]", `left-handed: the strip on the left, the low frets on the right, the same G (${lm})`);
    await p.click("#pvMore"); await p.click("#pvLeft"); await p.click("#pvMore");

    /* Solo mode on the sideways neck: a touch plays at once; the strip is the whammy */
    await p.evaluate("AOGSolo.setMode('solo'); buildNeck(); muteAll(); __v=[]");
    const so=await at(3,7); await T("touchStart",[so]); await p.waitForTimeout(80); await T("touchEnd",[]);
    const sv=await p.evaluate(()=>({n:__v.length, m:__v.length?__v[0].m:0, wham:(()=>{ const r=document.querySelector("#soWham .so-wbox"); return r? +r.getAttribute("x"):-1; })(), sx:NECK.sx, lit:document.querySelectorAll("#soScale .so-c").length}));
    ok(sv.n===1 && sv.m===62 && Math.abs(sv.wham-sv.sx)<3 && sv.lit>10, "Solo mode: a touch plays its note at once (MIDI "+sv.m+"), the whammy sits on the strip, "+sv.lit+" lit scale notes");
    await p.evaluate("AOGSolo.setMode('chords'); buildNeck()");

    /* frets up and down; Close; turned back upright */
    await p.click("#pvUp"); const up=await p.evaluate("[S.fret0, document.getElementById('pvFrets').textContent]"); await p.click("#pvDown");
    ok(up[0]===2 && /2/.test(up[1]), "▶ moves the hand up the neck: "+up[1]);
    await p.click("#pvClose"); await p.waitForTimeout(100);
    const cl=await p.evaluate(()=>({on:PV.on, back:!!document.querySelector("#rig #neckBox"), page:getComputedStyle(document.querySelector(".wrap")).display, play:NECK.play}));
    ok(!cl.on && cl.back && cl.page!=="none" && !cl.play, "Close puts the page back, with its neck");
    await p.setViewportSize({width:opt.viewport.height, height:opt.viewport.width}); await p.waitForTimeout(250);
    await p.setViewportSize(opt.viewport); await p.waitForTimeout(250);
    ok(await p.evaluate("PV.on && NECK.play"), "turned upright and back, it plays sideways again");
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }

  /* upright (portrait): exactly as before, with one quiet line */
  { const {c, p, errs}=await open("guitar", {viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:3}); console.log("== guitar · iPhone upright");
    const u=await p.evaluate(()=>({on:PV.on, play:NECK.play, inRig:!!document.querySelector("#rig #neckBox"), turn:document.getElementById("pvTurn").hidden?"":document.getElementById("pvTurn").textContent,
      big:getComputedStyle(document.getElementById("pvBig")).display, sw:document.documentElement.scrollWidth, n:NECK.n, rowFirst:neckY(0)<neckY(5)}));
    ok(!u.on && !u.play && u.inRig && u.rowFirst, "upright, the neck stays on the page as it was (thick string on top)");
    ok(/sideways/.test(u.turn), "one quiet line: "+u.turn);
    ok(u.big==="none" && u.sw<=390, "no computer button on a phone; no sideways scroll");
    const cs=await p.evaluate(()=>{ const st=document.getElementById("chordStrip"), nk=document.getElementById("neckBox"); return {n:st.querySelectorAll(".cs").length, above:st.getBoundingClientRect().bottom<=nk.getBoundingClientRect().top+1 && nk.getBoundingClientRect().top-st.getBoundingClientRect().bottom<40, w:document.querySelector("#chordStrip .cs").getBoundingClientRect().width}; });
    ok(cs.n===6 && cs.above && cs.w>=44, `upright, the six chords sit right on top of the neck (${Math.round(cs.w)} px each)`);
    await p.setViewportSize({width:844,height:390}); await p.waitForTimeout(300); await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
    ok(await p.evaluate("document.getElementById('pvTurn').hidden"), "once turned, the line does not come back");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }

  /* Spanish */
  { const {c, p, errs}=await open("guitar", PHONE, ()=>{ try{ localStorage.setItem("aog.lang","es"); }catch(e){} }); console.log("== guitar · español");
    const es=await p.evaluate(()=>[...document.querySelectorAll("#playView .pv-bar button, #pvHint, #pvFrets")].map(e=>e.textContent||e.getAttribute("aria-label")).join(" | ")+" | "+document.querySelector("#neck .nk-strumlab").textContent);
    ok(/Cerrar/.test(es) && /Sonidos/.test(es) && /Notas/.test(es) && /Apagar/.test(es) && /Trastes 1/.test(es) && /RASGUEA/.test(es), "en español: "+es);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }

  /* the bass: four strings, two fingers in turn, the fretless upright */
  { const {c, p, errs, T, at}=await open("bass", PAD); console.log("== bass · iPad sideways");
    ok(await p.evaluate("PV.on && NECK.rows===4 && document.querySelector('#neck .nk-strumlab').textContent==='PLUCK'"), "four strings, a PLUCK strip");
    await p.evaluate("muteAll(); __v=[]"); const st=await at(1,"strum");
    for(let i=0;i<4;i++){ await T("touchStart",[st]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(60); }
    const al=await p.evaluate("__v.map(x=>x.v)");
    ok(al.length===4 && al[0]!==al[1] && al[0]===al[2] && al[1]===al[3], "two fingers in turn: "+al.join(" "));
    await p.evaluate("const s=document.getElementById('soundSel'); s.value='upright'; s.onchange()"); await p.waitForTimeout(150);
    const fl=await p.evaluate(()=>({fl:NECK.fl, frets:document.querySelectorAll("#neck .nk-fret").length, dots:document.querySelectorAll("#neck .nk-fl").length, hint:document.getElementById("pvHint").textContent}));
    ok(fl.fl && fl.frets===0 && fl.dots>=4, `the upright: no frets, ${fl.dots} position dots ("${fl.hint}")`);
    /* on the line of fret 5: in tune; a third of the way to fret 6: between; slid on, the note follows */
    await p.evaluate("muteAll(); __v=[]");
    const a5=await at(1,5), a6=await at(1,6), s1=await at(1,"strum");
    await T("touchStart",[{...a5,id:1}]); await T("touchStart",[{...a5,id:1},{...s1,id:2}]); await T("touchEnd",[{...s1,id:2}]); await p.waitForTimeout(200);
    const u0=await p.evaluate("__hz(__mtof(38))");
    ok(Math.abs(cents(u0, 440*Math.pow(2,(38-69)/12)))<20, `on the line of fret 5 the A string plays D: ${u0.toFixed(2)} Hz`);
    const mid={x:a5.x+(a6.x-a5.x)*0.5, y:a5.y, id:1};
    for(let i=1;i<=5;i++){ await T("touchMove",[{...mid, x:a5.x+(mid.x-a5.x)*i/5}]); await p.waitForTimeout(16); }
    await p.waitForTimeout(250); const u1=await p.evaluate("__hz(__mtof(38.5))");
    const mc=cents(u1,u0);
    ok(mc>30 && mc<80, `halfway to the next line the note is between the two: ${mc.toFixed(0)} cents up`);
    for(let i=1;i<=5;i++){ await T("touchMove",[{...mid, x:mid.x+(a6.x-mid.x)*i/5}]); await p.waitForTimeout(16); }
    await p.waitForTimeout(250); const u2=await p.evaluate("__hz(__mtof(39))");
    ok(Math.abs(cents(u2,u0)-100)<15, `on the next line, a half step: ${cents(u2,u0).toFixed(0)} cents, one pluck (${await p.evaluate("__v.length")})`);
    await T("touchEnd",[]);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }

  /* the bass on a sideways iPhone: no scroll, no zoom */
  { const {c, p, errs}=await open("bass", PHONE); console.log("== bass · iPhone sideways");
    const l=await p.evaluate(()=>({on:PV.on, z:getComputedStyle(document.body).zoom, sw:document.documentElement.scrollWidth, n:NECK.n}));
    ok(l.on && l.z==="1" && l.sw<=844, `the bass sideways on a phone: ${l.n} frets, no zoom, no scroll`);
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }

  /* a computer: the same page, with a button for the whole screen */
  { const {c, p, errs, }=await open("guitar", {viewport:{width:1280,height:800}}); console.log("== guitar · computer");
    ok(await p.evaluate("!PV.on && getComputedStyle(document.getElementById('pvBig')).display!=='none'"), "a computer keeps its page, with ⤢ Play on the whole screen");
    await p.click("#pvBig"); await p.waitForTimeout(120);
    ok(await p.evaluate("PV.on && NECK.play && getComputedStyle(document.body).zoom==='1'"), "the button gives the whole-screen neck, not zoomed");
    await p.evaluate("__v=[]"); const q=await p.evaluate(()=>{ const r=document.getElementById("neck").getBoundingClientRect(), k=r.width/NECK.W, [x,y]=neckXY(2,2); return {x:r.left+x*k, y:r.top+y*k}; });
    await p.mouse.click(q.x, q.y); await p.waitForTimeout(60);
    ok(await p.evaluate("__v.length===1 && __v[0].m===52"), "a mouse click on a fret plays it (one finger)");
    await p.keyboard.press("Escape"); await p.waitForTimeout(80);
    ok(await p.evaluate("!PV.on && !!document.querySelector('#rig #neckBox')"), "Esc goes back to the page");
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close(); }

  await b.close();
  console.log(fails? `${fails} FAILED` : "all passed");
  process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH "+e.stack); process.exit(1); });
