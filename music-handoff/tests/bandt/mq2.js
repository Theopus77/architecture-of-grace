const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9984);
(async()=>{ const b=await pw.chromium.launch();
  for(const page of ["music-band.html","music-piano.html","music-guitar.html"]){
    const c=await b.newContext(pw.devices["iPhone 13"]); const p=await c.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9984/"+page); await p.waitForTimeout(1200);
    console.log(page, await p.evaluate(()=>{ const q=s=>{ const e=document.querySelector(s); return e?getComputedStyle(e).display:"-"; };
      return {keysLine:q(".keys-line"), touchLine:q(".touch-line"), kc:q(".kc"), padKbd:q(".pad kbd"), fine:matchMedia("(hover:hover) and (pointer:fine)").matches}; }));
    await c.close(); }
  await b.close(); srv.close(); })();
