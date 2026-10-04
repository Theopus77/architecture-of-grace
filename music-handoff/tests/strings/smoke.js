const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9971);
(async()=>{
  const b=await pw.chromium.launch();
  for(const inst of ["guitar","bass"]){
    for(const [label,vp] of [["phone",{width:390,height:844}],["ipad",{width:820,height:1180}],["desk",{width:1280,height:900}]]){
      const ctx=await b.newContext({viewport:vp, hasTouch:label!=="desk", isMobile:label==="phone"});
      const p=await ctx.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text()); });
      await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
      await p.goto(`http://localhost:9971/music-${inst}.html`); await p.waitForTimeout(1500);
      const info=await p.evaluate(()=>({n:NECK.n, W:NECK.W, H:NECK.H, fret0:S.fret0, sets:Object.keys(SETS).map(k=>k+":"+Object.keys(SETS[k].buf).length), notes:SAMPLE_NOTES.join(","),
        scrollW:document.documentElement.scrollWidth, innerW:innerWidth}));
      console.log(inst, label, JSON.stringify(info), errs.length?"ERRORS: "+errs.join(" | "):"no errors");
      await p.screenshot({path:`strings/${inst}-${label}.png`, fullPage:true});
      await ctx.close();
    }
  }
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
