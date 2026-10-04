const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9978);
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const [inst,dev,act] of [["guitar","iPhone 13","pad"],["guitar","iPad (gen 7)","play"],["bass","iPhone 13","play"]]){
    const c=await b.newContext(pw.devices[dev]); const p=await c.newPage();
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9978/music-${inst}.html`); await p.waitForTimeout(1000);
    if(act==="pad") await p.evaluate(()=>{ padDown(3,0.74); padUp(3); });
    else { await p.selectOption("#progSel","pop"); await p.evaluate(()=>start()); await p.waitForTimeout(1300); }
    await p.evaluate(()=>document.getElementById("neckBox").closest(".blk").scrollIntoView({block:"center"}));
    await p.waitForTimeout(250);
    await p.screenshot({path:`strings/look-${inst}-${dev.replace(/\W+/g,"")}.png`});
    await c.close();
  }
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
