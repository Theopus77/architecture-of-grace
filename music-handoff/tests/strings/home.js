const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9982);
(async()=>{
  const b=await pw.chromium.launch();
  for(const [dev,opts] of [["phone",pw.devices["iPhone 13"]],["desk",{viewport:{width:1280,height:900}}]]){
    const c=await b.newContext(opts); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9982/index.html"); await p.waitForTimeout(1500);
    const opened=await p.evaluate(()=>{ const btn=document.querySelector('[data-door="bench"]') && document.querySelector('[aria-controls="aogdnList-bench"]'); if(btn){ btn.click(); return "button"; } const l=document.getElementById("aogdnList-bench"); if(l){ l.hidden=false; return "unhid"; } return "none"; });
    await p.waitForTimeout(600);
    const box=await p.evaluate(()=>{ const a=document.querySelector('#aogdnList-bench a[href="/guitar"]'); if(!a) return null; a.scrollIntoView({block:"center"}); const li=a.closest("ul,ol")||a.parentNode; const r=li.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height, n:li.querySelectorAll("a").length}; });
    console.log(dev, opened, JSON.stringify(box), errs.length?"ERR "+errs.join("|"):"");
    if(box){ await p.waitForTimeout(400); await p.screenshot({path:`strings/home-bench-${dev}.png`}); }
    await c.close();
  }
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
