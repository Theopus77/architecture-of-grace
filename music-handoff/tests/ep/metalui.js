/* the heavy metal guitar in the page: pick it, tap a pad (a power chord), play Chug and Gallop, record a take */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9996);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const dev of ["iPhone 13","iPad (gen 7)"]){
    const c=await b.newContext(pw.devices[dev]); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9996/music-guitar.html"); await p.waitForTimeout(900);
    const opts=await p.evaluate(()=>[...document.querySelectorAll("#soundSel option")].map(o=>o.textContent));
    await p.selectOption("#soundSel","metal"); await p.waitForTimeout(400);
    ok(opts.indexOf("Heavy metal · groove")>=0, dev+": the sound list has Heavy metal · groove");
    await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,id,m,v,when,s){ if(cx===ac) window.__v.push({m, s}); return mv.apply(this,arguments); }; });
    await p.evaluate(()=>{ padDown(0,0.74); }); await p.waitForTimeout(150); await p.evaluate(()=>padUp(0));
    const v=await p.evaluate("__v"), shp=await p.evaluate(()=>shapeFor({off:0,q:"maj"}).join(","));
    ok(v.length===3 && v[1].m-v[0].m===7 && v[2].m-v[0].m===12, `${dev}: pad C plays a power chord, ${v.map(x=>x.m).join(" ")} (shape ${shp})`);
    const dots=await p.evaluate(()=>[...document.querySelectorAll("#neck .dot.fit")].map(g=>g.getAttribute("data-c")).join(" "));
    ok(dots.split(" ").filter(Boolean).length>=3, dev+": the neck shows it: "+dots);
    /* AOG-STRINGS-WAYS-V1: the ways are in groups now; Chug and Gallop are in Rock and metal */
    const rh=await p.evaluate(()=>{ const g=[...document.querySelectorAll("#rhythmSel optgroup")].find(x=>x.label==="Rock and metal"); return g?[...g.querySelectorAll("option")].map(o=>o.textContent).join(" | "):""; });
    ok(/Chug/.test(rh) && /Gallop/.test(rh), dev+": the Rock and metal group has Chug and Gallop: "+rh);
    await p.selectOption("#progSel","epic");
    for(const r of ["chug","gallop"]){
      await p.selectOption("#rhythmSel", r); await p.evaluate("__v=[]");
      await p.click("#playBtn"); await p.waitForTimeout(1500); await p.click("#playBtn"); await p.waitForTimeout(100);
      const n=await p.evaluate("__v.length"); ok(n>=12, `${dev}: ${r} plays (${n} string hits in 1.5 s)`);
    }
    /* a take of it */
    await p.locator("#recBtn").scrollIntoViewIfNeeded(); await p.click("#recBtn"); await p.waitForTimeout(150);
    await p.evaluate(()=>document.getElementById("playBtn").click()); await p.waitForTimeout(1600); await p.evaluate(()=>document.getElementById("playBtn").click());
    await p.click("#recBtn"); await p.waitForTimeout(1200);
    const tk=await p.evaluate(async()=>{ const k=REC.takes[0]; if(!k) return null; const buf=await new OfflineAudioContext(2,1,44100).decodeAudioData(await k.blob.arrayBuffer()); const d=buf.getChannelData(0); let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x)); return {sec:+k.sec.toFixed(2), peak:+pk.toFixed(2)}; });
    ok(tk && tk.peak>0.1, dev+": a take of the gallop: "+JSON.stringify(tk));
    ok(errs.length===0, dev+": no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
