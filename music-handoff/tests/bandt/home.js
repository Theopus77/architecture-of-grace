/* Home: The Band sits in the Explore menu under the bass, and on the Lab Bench with its pencil drawing; /band opens it */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9986);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch();
  for(const [dev,opts] of [["phone",pw.devices["iPhone 13"]],["desk",{viewport:{width:1280,height:900}}]]){
    const c=await b.newContext(opts); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9986/index.html"); await p.waitForTimeout(1500);
    const ex=await p.evaluate(()=>[...document.querySelectorAll('a.topbar-lib[href]')].map(a=>a.getAttribute("href")).filter(h=>/^\/(drums|turntables|piano|guitar|bass|band|kitchen)$/.test(h)).join(" "));
    ok(/\/bass \/band \/kitchen/.test(ex), dev+": the Explore menu lists The Band after the bass: "+ex);
    await p.evaluate(()=>{ const btn=document.querySelector('[aria-controls="aogdnList-bench"]'); if(btn) btn.click(); else { const l=document.getElementById("aogdnList-bench"); if(l) l.hidden=false; } });
    await p.waitForTimeout(600);
    const card=await p.evaluate(async()=>{ const a=document.querySelector('#aogdnList-bench a[href="/band"]'); if(!a) return null; a.scrollIntoView({block:"center"});
      const img=a.querySelector("img"); await new Promise(r=>setTimeout(r,800)); const prev=a.closest("li").previousElementSibling;
      return {text:a.textContent.trim(), img:img&&img.currentSrc.split("/").pop(), w:img&&img.naturalWidth, after:prev&&prev.querySelector("a").getAttribute("href")}; });
    ok(card && card.text==="The Band" && card.w===900 && card.after==="/bass", dev+": the Lab Bench shows The Band with its drawing, after the bass: "+JSON.stringify(card));
    if(card){ await p.screenshot({path:`home-bench-${dev}.png`}); }
    ok(errs.length===0, dev+": no page errors "+errs.join(" | "));
    await c.close();
  }
  /* the short link and the science hub */
  const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9986/science-hub.html"); await p.waitForTimeout(800);
  const cards=await p.evaluate(()=>document.querySelectorAll('.unit a.door[href="/band"]').length); ok(cards===5, "the science hub has The Band in all five levels: "+cards);
  await b.close(); srv.close(); console.log(fails?fails+" FAILED":"ALL PASS"); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
