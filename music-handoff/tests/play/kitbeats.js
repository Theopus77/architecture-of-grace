/* AOG-KIT-BEATS-V1: the Drum Kit plays the drum machine's beats on whichever kit is picked, with its speed, swing and
   volume on the screen. Nothing plays until Play is pressed; the beat's own steps reach the kit at the beat's own times
   (a 3-count beat in 12 steps, swing on the second eighth note); a new speed takes hold at once; Stop silences the notes
   not yet heard; leaving the page stops it; the sideways view has its own ▶ Beat; Spanish; an iPhone, an iPad and a
   computer. Port 9969. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9969);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(opt)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.addInitScript(()=>{ try{ localStorage.removeItem("aog.kit.v1"); }catch(e){} });
    await p.goto("http://localhost:9969/music-kit.html");
    await p.waitForFunction(()=>{ const s=AOGDrumKit.state(S.bank); return s && s.state==="ready"; }, null, {timeout:40000}).catch(()=>{});
    await p.waitForTimeout(300);
    await p.evaluate(()=>{ window.__h=[]; const pd=AOGDrumKit.playDirect; AOGDrumKit.playDirect=function(c,d,b,id,t0,acc,lv){ __h.push({b,id,t:t0,acc,lv}); return pd.apply(this,arguments); }; });
    return {c, p, errs};
  };
  /* a computer */
  { const {c, p, errs}=await open({viewport:{width:1280,height:800}}); console.log("== beats · computer");
    const st=await p.evaluate(()=>({n:document.querySelectorAll("#beatSel option").length, groups:[...document.querySelectorAll("#beatSel optgroup")].map(g=>g.label),
      sel:document.getElementById("beatSel").value, bpm:S.bpm, out:document.getElementById("tempoOut").textContent, play:document.getElementById("beatPlay").textContent,
      about:document.getElementById("beatAbout").textContent, on:BT.on, heard:__h.length, sw:document.documentElement.scrollWidth}));
    ok(st.n>=110 && st.groups.length>=12, `${st.n} beats in ${st.groups.length} groups: `+st.groups.join(", "));
    ok(st.sel==="b:rockbasic" && st.bpm===112 && st.out==="112 beats a minute" && /Kick on 1 and 3/.test(st.about), "it starts on the basic rock beat at its own speed, with one line about it");
    await p.waitForTimeout(600);
    ok(!st.on && (await p.evaluate("__h.length"))===0 && st.play==="▶ Play the beat", "nothing plays until Play is pressed");
    ok(st.sw<=1280, "nothing scrolls sideways");
    /* the steps reach the kit at their times */
    await p.evaluate("__h=[]"); await p.click("#beatPlay"); await p.waitForTimeout(1500);
    const r=await p.evaluate(()=>{ const k=__h.filter(x=>x.id==="kick").map(x=>x.t), s=__h.filter(x=>x.id==="snare").map(x=>x.t), six=60/112/4;
      return {on:BT.on, k:k.slice(0,3).map(t=>Math.round((t-k[0])/six*100)/100), s:Math.round((s[0]-k[0])/six*100)/100, lv:__h[0]&&__h[0].lv, bank:__h[0]&&__h[0].b,
        pressed:document.getElementById("beatPlay").getAttribute("aria-pressed"), word:document.getElementById("beatPlay").textContent}; });
    ok(r.on && r.pressed==="true" && r.word==="■ Stop the beat", "Play starts it; the button now stops it");
    ok(JSON.stringify(r.k)==="[0,8,10]" && r.s===4, "kick on steps 1, 9 and 11, snare on 5, as written: "+JSON.stringify(r));
    ok(r.bank===await p.evaluate("S.bank") && Math.abs(r.lv-0.4)<1e-6, "on the kit that is picked, at the beat's volume (taps stay louder)");
    /* a new speed takes hold at once */
    await p.evaluate(()=>{ const e=document.getElementById("tempoR"); e.value=60; e.dispatchEvent(new Event("input")); }); await p.waitForTimeout(300);
    await p.evaluate("__h=[]"); await p.waitForTimeout(2200);
    const gap=await p.evaluate(()=>{ const t=__h.filter(x=>x.id==="ch").map(x=>x.t); let m=9; for(let i=1;i<t.length;i++) m=Math.min(m, t[i]-t[i-1]); return Math.round(m*1000); });
    ok(await p.evaluate("S.bpm")===60 && Math.abs(gap-500)<15 && /60 beats a minute/.test(await p.textContent("#tempoOut")), "the speed slider slows it to 60: hats "+gap+" ms apart");
    await p.click("#tempoUp"); await p.click("#tempoUp");
    ok(await p.evaluate("S.bpm")===62, "+ makes it one beat a minute faster each press");
    /* swing: the second eighth note waits */
    await p.evaluate(()=>{ const e=document.getElementById("swingR"); e.value=67; e.dispatchEvent(new Event("input")); }); await p.waitForTimeout(300);
    await p.evaluate("__h=[]"); await p.waitForTimeout(2500);
    const sw=await p.evaluate(()=>{ const t=__h.filter(x=>x.id==="ch").map(x=>x.t), d=[]; for(let i=1;i<Math.min(t.length,5);i++) d.push(Math.round((t[i]-t[i-1])*1000)); return d; });
    const six=60/62/4*1000;
    ok(sw.length>=3 && sw.some(x=>Math.abs(x-six*2.68)<20) && sw.some(x=>Math.abs(x-six*1.32)<20), "swing 67%: long, short, long, short: "+sw.join(" ")+" ms");
    ok(/67% · Full swing/.test(await p.textContent("#swingOut")), "the swing says what it is: "+await p.textContent("#swingOut"));
    /* the beat's own speed and swing come back */
    await p.click("#beatReset");
    ok(await p.evaluate("S.bpm===112 && S.swing===0.5"), "↺ brings back the beat's own speed and swing");
    /* another beat in 3 */
    await p.evaluate("__h=[]"); await p.selectOption("#beatSel","b:waltz3"); await p.waitForTimeout(4600);
    const w3=await p.evaluate(()=>{ const k=__h.filter(x=>x.id==="kick" && x.t>=__h.filter(y=>y.id==="kick").slice(-3)[0].t-0.001).map(x=>x.t), six=60/S.bpm/4; return k.slice(0,3).map(t=>Math.round((t-k[0])/six)); });
    ok(JSON.stringify(w3)==="[0,12,24]", "a waltz counts in 3: a bar of 12 steps: "+JSON.stringify(w3));
    /* a two-part groove takes turns */
    await p.selectOption("#beatSel","k:prog47"); await p.waitForTimeout(200);
    await p.evaluate(()=>{ const e=document.getElementById("tempoR"); e.value=220; e.dispatchEvent(new Event("input")); });
    const seen=await p.evaluate(()=>new Promise(res=>{ const s=new Set(); const iv=setInterval(()=>s.add(BT.part), 50); setTimeout(()=>{ clearInterval(iv); res([...s].sort()); }, 3000); }));
    ok(JSON.stringify(seen)==="[0,1]", "a groove in two parts plays them in turn: parts "+JSON.stringify(seen));
    /* another kit, same beat */
    await p.selectOption("#kitSel","T"); await p.waitForFunction(()=>AOGDrumKit.state("T") && AOGDrumKit.state("T").state==="ready", null, {timeout:40000}).catch(()=>{});
    await p.evaluate("__h=[]"); await p.waitForTimeout(800);
    ok(await p.evaluate("BT.on && __h.length>0 && __h.every(x=>x.b==='T')"), "a new kit picked while it plays: the beat carries on, on the new kit");
    /* Stop: the notes not yet heard are stopped too */
    await p.click("#beatPlay"); await p.evaluate("__h=[]"); await p.waitForTimeout(500);
    ok(await p.evaluate("!BT.on && __h.length===0 && BT.live.length===0") && (await p.textContent("#beatPlay"))==="▶ Play the beat", "Stop stops it, with nothing left waiting to play");
    /* remembered */
    const sv=await p.evaluate(()=>JSON.parse(localStorage.getItem("aog.kit.v1")));
    ok(sv.beat==="k:prog47" && sv.bpm===220 && sv.bank==="T", "the beat, its speed and the kit are kept for next time");
    /* leaving the page stops it */
    await p.click("#beatPlay"); await p.waitForTimeout(200);
    await p.evaluate(()=>{ Object.defineProperty(document,"hidden",{configurable:true,get:()=>true}); document.dispatchEvent(new Event("visibilitychange")); });
    ok(await p.evaluate("!BT.on"), "switching away stops the beat");
    /* Spanish */
    await p.evaluate(()=>{ Object.defineProperty(document,"hidden",{configurable:true,get:()=>false}); document.getElementById("langBtn").click(); });
    const es=await p.evaluate(()=>({h:document.getElementById("beatH").textContent, p:document.getElementById("beatPlay").textContent, t:document.getElementById("tempoOut").textContent,
      g:[...document.querySelectorAll("#beatSel optgroup")].map(x=>x.label).slice(0,3).join(", "), o:document.getElementById("beatSel").selectedOptions[0].textContent}));
    ok(es.h==="Toca con un ritmo" && es.p==="▶ Tocar el ritmo" && /pulsos por minuto/.test(es.t) && /Listos para tocar/.test(es.g) && /Rock progresivo/.test(es.o), "in Spanish: "+JSON.stringify(es));
    ok(!errs.length, "no errors: "+errs.join(" | "));
    await c.close(); }
  /* an iPhone held upright, then sideways */
  { const {c, p, errs}=await open({viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== beats · iPhone");
    const m=await p.evaluate(()=>{ const r=id=>document.getElementById(id).getBoundingClientRect(); return {sw:document.documentElement.scrollWidth,
      sel:getComputedStyle(document.getElementById("beatSel")).fontSize, play:r("beatPlay").height, dn:r("tempoDn").width, up:r("tempoUp").height,
      kitBottom:r("kitBox").bottom, beatTop:r("beatBox").top}; });
    ok(m.sw<=390 && m.sel==="16px" && m.play>=44 && m.dn>=44 && m.up>=44, "fits the phone; a 16px menu; every button a finger high: "+JSON.stringify(m));
    ok(m.beatTop>=m.kitBottom, "the beat sits under the kit");
    await p.setViewportSize({width:844,height:390}); await p.evaluate("PV.forced=true; pvSync()"); await p.waitForTimeout(500);
    const sv=await p.evaluate(()=>({on:PV.on, btn:document.getElementById("dkBeat").textContent, vis:document.getElementById("dkBeat").getBoundingClientRect().height}));
    ok(sv.on && sv.btn==="▶ Beat" && sv.vis>=40, "sideways: ▶ Beat sits on the bar: "+JSON.stringify(sv));
    await p.evaluate("GUARD.last=0; GUARD.down.clear()"); await p.evaluate("__h=[]"); await p.click("#dkBeat"); await p.waitForTimeout(800);
    ok(await p.evaluate("BT.on && __h.length>0") && (await p.textContent("#dkBeat"))==="■ Beat" && (await p.textContent("#beatPlay"))==="■ Stop the beat", "▶ Beat plays it; both buttons say so");
    await p.evaluate("GUARD.last=0; GUARD.down.clear()"); await p.click("#dkMore"); await p.waitForTimeout(200);
    const dr=await p.evaluate(()=>({n:document.querySelectorAll("#dkBeatSel option").length, t:document.getElementById("dkTempo").textContent}));
    await p.evaluate("GUARD.last=0; GUARD.down.clear()"); await p.click("#dkFast");
    ok(dr.n>=110 && dr.t==="112 a minute" && await p.evaluate("S.bpm")===114, "☰ Menu has the beats and the speed: "+JSON.stringify(dr));
    await p.evaluate("GUARD.last=0; GUARD.down.clear()"); await p.click("#dkBeat"); await p.waitForTimeout(100);
    ok(await p.evaluate("!BT.on"), "■ Beat stops it");
    ok(!errs.length, "no errors: "+errs.join(" | "));
    await c.close(); }
  /* an iPad */
  { const {c, p, errs}=await open({viewport:{width:820,height:1180}, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== beats · iPad");
    const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth, row:document.getElementById("beatPlay").getBoundingClientRect().top-document.getElementById("beatSel").getBoundingClientRect().top}));
    ok(m.sw<=820 && Math.abs(m.row)<40, "fits the iPad; Play sits beside the beat menu: "+JSON.stringify(m));
    ok(!errs.length, "no errors: "+errs.join(" | "));
    await c.close(); }
  await b.close(); srv.close(); console.log(fails?fails+" FAILED":"all passed"); process.exit(fails?1:0);
})().catch(e=>{ console.log("FAIL crash "+e.stack); process.exit(1); });
