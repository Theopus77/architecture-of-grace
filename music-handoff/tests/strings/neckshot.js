const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9972);
(async()=>{
  const b=await pw.chromium.launch();
  for(const inst of ["guitar","bass"]){
    for(const [label,vp] of [["phone",{width:390,height:844}],["desk",{width:1280,height:900}]]){
      const ctx=await b.newContext({viewport:vp, hasTouch:label!=="desk", isMobile:label==="phone"});
      const p=await ctx.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
      await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
      await p.goto(`http://localhost:9972/music-${inst}.html`); await p.waitForTimeout(1200);
      await p.evaluate(()=>{ padDown(0,0.74); padUp(0); });
      await p.waitForTimeout(200);
      const blk=await p.$("#neckBox"); await blk.scrollIntoViewIfNeeded();
      const box=await p.evaluate(()=>{ const r=document.getElementById("neckBox").closest(".blk").getBoundingClientRect(); return {x:r.x,y:r.y+scrollY,w:r.width,h:r.height}; });
      await p.screenshot({path:`strings/${inst}-${label}-neck-C.png`, clip:{x:box.x,y:box.y,width:box.w,height:box.h}, fullPage:true});
      /* a chord with a skipped string (D: x x 0 2 3 2), then a minor key pattern playing */
      await p.evaluate(()=>{ padDown(1,0.74); padUp(1); });
      await p.waitForTimeout(150);
      await p.screenshot({path:`strings/${inst}-${label}-neck-Dm.png`, clip:{x:box.x,y:box.y,width:box.w,height:box.h}, fullPage:true});
      console.log(inst, label, errs.length?"ERRORS "+errs.join(" | "):"ok");
      await ctx.close();
    }
  }
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
