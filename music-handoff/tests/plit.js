/* Jimmy's set-up on an iPad: key of A, Canon pattern, Broken · one note at a time, keys C4 to C7. Watch the keys every frame. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9973);
let fails=0, passes=0; function ok(c,m){ if(c){ passes++; console.log("PASS "+m); } else { fails++; console.log("FAIL "+m); } }
(async()=>{
  const b=await pw.chromium.launch();
  for(const rhythm of ["broken","hold","pulse"]){
    const c=await b.newContext({viewport:{width:768,height:1024}, deviceScaleFactor:2, isMobile:true, hasTouch:true, colorScheme:"dark"});   /* an iPad held upright: sideways, a touch screen opens the play view (AOG-PLAY-V1), tested in play/piano */
    await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await c.addInitScript(r=>{ localStorage.setItem("aog.lang","en");
      localStorage.setItem("aog.piano.v1", JSON.stringify({sound:"epwarm",key:9,minor:false,prog:[{off:0,q:"maj"},{off:7,q:"maj"},{off:9,q:"min"},{off:4,q:"min"},{off:5,q:"maj"},{off:0,q:"maj"},{off:5,q:"maj"},{off:7,q:"maj"}],preset:"canon",rhythm:r,bpm:97,oct:3,era:0,vol:0.8})); }, rhythm);
    const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.goto("http://localhost:9973/music-piano.html"); await p.waitForTimeout(1200);
    /* keys C4 to C7, as in the picture */
    await p.evaluate(()=>{ while(KB.lo<60 && !document.getElementById("upBtn").disabled) document.getElementById("upBtn").click(); });
    const range=await p.evaluate(()=>document.getElementById("rangeOut").textContent);
    await p.click("#playBtn");
    const r=await p.evaluate(async()=>{
      const name=m=>["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][m%12]+(Math.floor(m/12)-1);
      const frames=[]; const t0=performance.now();
      while(performance.now()-t0<2600){ await new Promise(r=>requestAnimationFrame(r));
        if(PLAY.cur!==0) continue;   /* the first bar: the A chord */
        const now=[...document.querySelectorAll("#kbd .now")].map(e=>+e.getAttribute("data-m")).sort((a,b)=>a-b);
        const pale=[...document.querySelectorAll("#kbd .lit")].map(e=>+e.getAttribute("data-m"));
        const snd=[...sounding()].sort((a,b)=>a-b);
        frames.push({now, pale, sounding:snd}); }
      const everNow=[...new Set(frames.flatMap(f=>f.now))].sort((a,b)=>a-b).map(name);
      const everSound=[...new Set(frames.flatMap(f=>f.sounding))].sort((a,b)=>a-b).map(name);
      const paleNames=[...new Set(frames.flatMap(f=>f.pale).map(m=>["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][m%12]))].sort();
      const maxNow=Math.max(...frames.map(f=>f.now.length)), distinct=new Set(frames.map(f=>f.now.join(","))).size;
      const pc=new Set(); frames.forEach(f=>f.pale.concat(f.now).forEach(m=>pc.add(m%12)));
      const allAOnScreen=[...document.querySelectorAll("#kbd [data-m]")].map(e=>+e.getAttribute("data-m")).filter(m=>m%12===9);
      const aLitEver=allAOnScreen.every(m=>frames.some(f=>f.pale.includes(m)||f.now.includes(m)));
      return {frames:frames.length, everNow, everSound, paleNames, maxNow, distinct, aLitEver, line:!document.getElementById("litLine").hidden, lineText:document.getElementById("litLine").textContent};
    });
    console.log(`== ${rhythm} (${range}): sounding ${r.everSound.join(" ")} | orange on screen ${r.everNow.join(" ")} | pale ${r.paleNames.join(" ")} | most orange at once ${r.maxNow}, ${r.distinct} different moments`);
    ok(r.frames>20, rhythm+": watched the first bar ("+r.frames+" frames)");
    ok(JSON.stringify(r.paleNames)===JSON.stringify(["A","C#","E"]), rhythm+": every A, C# and E on screen is pale while the A chord plays");
    ok(r.aLitEver, rhythm+": the A keys on screen light up, though this chord's A notes play below C4");
    ok(r.everNow.every(n=>r.everSound.includes(n)), rhythm+": a key is orange only while that very note is sounding");
    if(rhythm==="broken") ok(r.maxNow<=2 && r.distinct>=3, rhythm+": one note at a time walks across the keys (at most "+r.maxNow+" orange at once, "+r.distinct+" different moments)");
    if(rhythm==="hold") ok(r.distinct<=2, rhythm+": a held chord stays lit, no blinking ("+r.distinct+" states)");
    if(rhythm==="pulse") ok(r.distinct<=3, rhythm+": a steady chord does not blink between beats ("+r.distinct+" states)");
    ok(r.line && /Pale keys fit the chord/.test(r.lineText), rhythm+": the line says what the two shades mean while the chords play");
    if(rhythm==="broken"){ await p.waitForTimeout(300); await p.screenshot({path:__dirname+"/lit-broken.png", clip:await p.evaluate(()=>{ const k=document.getElementById("kbd"); k.scrollIntoView({block:"center"}); const r=k.getBoundingClientRect(); return {x:r.left-4,y:r.top-60,width:r.width+8,height:r.height+110}; })}); }
    await p.click("#playBtn"); await p.waitForTimeout(250);
    ok(await p.evaluate(()=>document.getElementById("litLine").hidden && !document.querySelector("#kbd .now, #kbd .lit")), rhythm+": after Stop the keys go plain and the line goes away");
    ok(errs.length===0, rhythm+": no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log((fails?fails+" FAILED, ":"")+passes+" passed");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
