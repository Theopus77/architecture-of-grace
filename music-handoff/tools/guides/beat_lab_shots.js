/* AOG-BEATLAB-GUIDE-V2 (2026-10-19) — the pictures of "Make a hit on the Drum Machine" (beat-lab-guide.html): parts of the
   real Drum Machine, inside the Studio (as people use it), at iPhone width, in English and Spanish (bl-*-es.png).
     node music-handoff/tools/guides/beat_lab_shots.js          (then python3 aog-deploy/_work/music/make_beat_lab_guide.py) */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const path=require("path"), ROOT=path.resolve(__dirname,"../../../aog-deploy"), PORT=9489;
const srv=require(path.resolve(__dirname,"../../tests/srv.js"))(PORT);
const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const lang of ["en","es"]){
    const ctx=await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true, serviceWorkers:"block", colorScheme:"dark"});
    await ctx.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await ctx.route(/\/the-studio(\?[^#]*)?$/, r=>r.fulfill({path:path.join(ROOT,"the-studio.html"), contentType:"text/html"}));
    await ctx.addInitScript(l=>{ try{ localStorage.clear(); localStorage.setItem("aog.lang", l); }catch(e){} }, lang);
    const p=await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#pads`);
    await p.waitForFunction(()=>[...document.querySelectorAll("iframe")].some(f=>{ try{ return f.contentDocument && f.contentDocument.getElementById("grpSel") && f.contentDocument.querySelectorAll("#grpSel option").length>3; }catch(e){ return false; } }), null, {timeout:60000});
    const f=p.frames().find(x=>/music-pads/.test(x.url())); await W(2500);
    const sfx=lang==="es"?"-es":"";
    const shot=async(name, sels, pad=8)=>{
      const boxes=[]; for(const s of sels){ const h=await f.$(s); if(!h){ console.log("missing", name, s); return; } await h.scrollIntoViewIfNeeded().catch(()=>{}); await W(150); }
      for(const s of sels){ const bb=await (await f.$(s)).boundingBox(); if(bb && bb.width && bb.height) boxes.push(bb); }
      if(!boxes.length){ console.log("hidden", name); return; }
      const x0=Math.max(0,Math.min(...boxes.map(q=>q.x))-pad), y0=Math.min(...boxes.map(q=>q.y))-pad, x1=Math.min(390,Math.max(...boxes.map(q=>q.x+q.width))+pad), y1=Math.max(...boxes.map(q=>q.y+q.height))+pad;
      await p.screenshot({path:path.join(ROOT,`bl-${name}${sfx}.png`), clip:{x:x0, y:Math.max(0,y0), width:x1-x0, height:y1-Math.max(0,y0)}, fullPage:false});
      console.log(lang, name, Math.round(x1-x0)+"x"+Math.round(y1-y0));
    };
    const tall=async h=>{ await p.setViewportSize({width:390, height:h}); await W(900); };
    /* bank A with a beat in it: boom bap, the famous style */
    await f.evaluate(()=>{ const g=document.getElementById("grpSel"); g.value="styles"; g.dispatchEvent(new Event("change")); }); await W(500);
    await f.evaluate(()=>{ const s=document.getElementById("startSel"); s.value="boombap"; s.dispatchEvent(new Event("change")); }); await W(800);
    await tall(2400);
    await shot("whole", ["#pads", "#bankSel", ".pm-transport", ".pm-beat"]);
    await shot("bank", ["#bankSel"]);
    await shot("pads", ["#pads"]);
    await shot("play", [".pm-transport"]);
    await shot("start", [".pm-beat"]);
    await shot("tempo", ["label.pm-f.tempo", "#barsSel"]);
    await f.evaluate(()=>{ const d=document.getElementById("padSet"); if(d) d.open=true; }); await W(300);
    await shot("steps", [".stepsec"]);
    await shot("padset", ["#padSet"]);
    /* the file of the loop */
    await f.evaluate(async()=>{ document.getElementById("bounceBtn").click(); for(let i=0;i<120 && document.getElementById("bounceAct").hidden;i++) await new Promise(r=>setTimeout(r,250)); });
    await shot("file", ["#bounceBtn", "#bounceLine", "#bounceAct"]);
    /* More → Timing and repeat: line up, swing, Repeat, click */
    await f.evaluate(()=>{ const s=document.getElementById("aogMoreSel"); s.value="timing"; s.dispatchEvent(new Event("change")); }); await W(600);
    await shot("repeat", ["label:has(#qSel)", "label:has(#swSel)", "#rptBtn", "label:has(#rateSel)", "#clickBtn", "#fullBtn"]);
    await f.evaluate(()=>{ const s=document.getElementById("aogMoreSel"); s.value=""; s.dispatchEvent(new Event("change")); }); await W(300);
    /* banks B, C and D */
    for(const [bank, name] of [["1","chords"],["2","notes"],["3","chops"]]){
      await f.evaluate(v=>{ const s=document.getElementById("bankSel"); s.value=v; s.dispatchEvent(new Event("change")); }, bank); await W(1500);
      await shot(name, ["#bankSel", "#setRow", "#pads"]);
    }
    await ctx.close();
  }
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
