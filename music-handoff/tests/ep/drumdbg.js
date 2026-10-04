const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9994);
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext(pw.devices["iPad (gen 7)"]); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text()); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9994/music-drums.html"); await p.waitForTimeout(1500);
  console.log("box:", await p.evaluate(()=>({hidden:document.getElementById("takeBox").hidden, btn:document.getElementById("takeBtn").textContent, prev:(document.getElementById("takeBox").previousElementSibling||{}).className})));
  await p.click("#takeBtn"); await p.waitForTimeout(300);
  console.log("after record:", await p.evaluate(()=>({on:REC.on, node:!!REC.node, nodeType:REC.node&&REC.node.constructor.name, actx:!!actx, lim:!!limiter, state:actx&&actx.state, msg:REC.msg})));
  console.log("pattern steps on:", await p.evaluate(()=>{ try{ return JSON.stringify(S).match(/true/g).length; }catch(e){ return "?"; } }));
  const pads=await p.evaluate(()=>[...document.querySelectorAll(".pad,[data-pad]")].slice(0,4).map(e=>e.className+"|"+(e.getAttribute("data-pad")||"")));
  console.log("pads:", pads.join(" ; "));
  const pad=await p.locator(".sp-pad").first(); await pad.scrollIntoViewIfNeeded(); const bb=await pad.boundingBox();
  for(let i=0;i<4;i++){ await p.touchscreen.tap(bb.x+bb.width/2, bb.y+bb.height/2); await p.waitForTimeout(300); }
  await p.evaluate(()=>document.getElementById("playBtn").click()); await p.waitForTimeout(2200);
  console.log("playing:", await p.evaluate(()=>({playing:S.playing, chunks:REC.chunks.length, frames:REC.frames, peakInt:(()=>{ let m=0; REC.chunks.forEach(x=>{ for(let i=0;i<x.length;i+=7){ const a=Math.abs(x[i]); if(a>m) m=a; } }); return m; })()})));
  await p.evaluate(()=>document.getElementById("playBtn").click());
  await p.click("#takeBtn"); await p.waitForTimeout(1200);
  console.log("end:", await p.evaluate(()=>({takes:REC.takes.length, msg:REC.msg, line:document.getElementById("takeLine").textContent})));
  console.log("errors:", errs.join(" | ")||"none");
  await b.close(); srv.close();
})();
