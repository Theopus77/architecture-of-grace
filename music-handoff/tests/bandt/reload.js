/* reload The Band right after picking a new instrument (its recordings still arriving), ten times; how long does each take? */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9991);
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext(pw.devices["iPhone 13"]); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9991/music-band.html"); await p.waitForTimeout(600);
  const sw=await p.evaluate(async()=>{ try{ const r=await navigator.serviceWorker.getRegistrations(); return r.map(x=>x.active?x.active.scriptURL:"(installing)"); }catch(e){ return "none"; } });
  console.log("service workers:", JSON.stringify(sw));
  const times=[];
  for(let i=0;i<10;i++){
    const inst=["oboe","flute","winds","brass","tuba"][i%5];
    await p.selectOption("#soundSel", inst); await p.selectOption("#keySel", String(i%12));
    const t0=Date.now(); let err="";
    try{ await p.reload({timeout:60000}); }catch(e){ err=e.message.split("\n")[0]; }
    times.push((Date.now()-t0)+"ms"+(err?" "+err:""));
    await p.waitForTimeout(300);
  }
  console.log("reloads:", times.join(", "));
  console.log("errors:", errs.join(" | ")||"none");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
