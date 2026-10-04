const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9984);
(async()=>{
  const b=await pw.chromium.launch();
  for(const [label,opts] of [["phone",pw.devices["iPhone 13"]],["desk",{viewport:{width:1280,height:900}}]]){
   for(const bench of ["simple","full"]){
    const c=await b.newContext(opts); const p=await c.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await c.addInitScript(b=>{ try{ localStorage.setItem("aog.drums.bench", b); }catch(e){} }, bench);
    await p.goto("http://localhost:9984/music-piano.html"); await p.waitForTimeout(700);
    await p.evaluate(()=>{ document.getElementById("soundSel").value="epwarm"; document.getElementById("soundSel").onchange(); });
    await p.evaluate(()=>sendPads()); await p.waitForTimeout(300);
    await p.goto("http://localhost:9984/music-drums.html"); await p.waitForTimeout(1500);
    const r=await p.evaluate(()=>{
      const lum=c=>{ const m=c.match(/[\d.]+/g).map(Number); const f=v=>{ v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); }; return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]); };
      const bg=el=>{ for(let e=el;e;e=e.parentElement){ const s=getComputedStyle(e); if(s.backgroundImage && s.backgroundImage!=="none"){ const m=s.backgroundImage.match(/rgba?\([^)]*\)/); if(m) return m[0]; } const bc=s.backgroundColor; if(bc && !/rgba\(0, 0, 0, 0\)|transparent/.test(bc)) return bc; } return "rgb(255,255,255)"; };
      const ratio=(a,b)=>{ const x=lum(a), y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
      const els=[...document.querySelectorAll(".chord-row span,.chord-row .cp-list,.chord-row .s-chords")];
      return els.map(e=>({t:e.textContent.trim().slice(0,30), fg:getComputedStyle(e).color, bg:bg(e), r:+ratio(getComputedStyle(e).color,bg(e)).toFixed(2), w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height)}));
    });
    console.log(label, bench, JSON.stringify(r));
    const row=await p.$(".chord-row"); if(row){ await row.scrollIntoViewIfNeeded(); await p.waitForTimeout(150); const bx=await row.boundingBox(); await p.screenshot({path:`strings/chordrow-${label}-${bench}.png`, clip:{x:0,y:Math.max(0,bx.y-60),width:opts.viewport.width,height:bx.height+140}}); }
    await c.close();
   }
  }
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
