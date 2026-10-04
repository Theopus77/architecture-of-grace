/* The Band, first look: loads, no errors, the recordings arrive, pads, keys, sections, every rhythm */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9981);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext(pw.devices["iPhone 13"]); const p=await c.newPage();
  const errs=[], bad=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text()); });
  p.on("response",r=>{ if(r.status()>=400) bad.push(r.status()+" "+r.url()); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9981/music-band.html"); await p.waitForTimeout(800);
  ok(await p.evaluate(()=>S.sound==="trumpet"), "starts on the trumpet");
  console.log("load line:", await p.textContent("#loadLine"));
  await p.waitForFunction(()=>SETS.trumpet && SETS.trumpet.state==="ready", null, {timeout:30000}).catch(()=>{});
  const st=await p.evaluate(()=>({state:SETS.trumpet.state, done:SETS.trumpet.done, total:SETS.trumpet.total, bufs:Object.keys(SETS.trumpet.buf).length}));
  ok(st.state==="ready" && st.bufs===st.total, "the trumpet's recordings all load: "+JSON.stringify(st));
  console.log("load line:", await p.textContent("#loadLine"));
  await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,inst,m,v,when,art){ const r=mv.apply(this,arguments); if(cx===ac) window.__v.push({inst, m, v:+(+v).toFixed(2), art, real:!!(r&&r.natural)}); return r; }; });
  /* a pad */
  await p.locator('.pad[data-i="0"]').scrollIntoViewIfNeeded(); const pd=await p.locator('.pad[data-i="0"]').boundingBox();
  await p.touchscreen.tap(pd.x+pd.width/2, pd.y+pd.height/2); await p.waitForTimeout(200);
  let v=await p.evaluate("__v"); console.log("pad C:", JSON.stringify(v));
  ok(v.length>=3 && v.every(x=>x.real), "pad C plays the trumpet's own notes ("+v.map(x=>x.m).join(",")+")");
  /* a key */
  await p.evaluate("__v=[]");
  await p.locator('#kbd').scrollIntoViewIfNeeded(); const k=await p.locator('#kbd .wk:not(.out)').first().boundingBox();
  await p.touchscreen.tap(k.x+k.width/2, k.y+k.height*0.7); await p.waitForTimeout(150);
  v=await p.evaluate("__v"); ok(v.length===1 && v[0].real, "a key plays one real note: "+JSON.stringify(v));
  const outKeys=await p.evaluate(()=>document.querySelectorAll("#kbd .out").length); console.log("grey keys on screen:", outKeys, "range", await p.textContent("#rangeOut"));
  /* each sound: load, then a pad */
  for(const id of Object.keys(await p.evaluate("SOUNDS"))){
    await p.selectOption("#soundSel", id);
    await p.waitForFunction((id)=>soundReady(id), id, {timeout:60000}).catch(()=>{});
    const ready=await p.evaluate((id)=>soundReady(id), id);
    await p.evaluate("__v=[]");
    await p.evaluate(()=>{ padDown(0,0.74); }); await p.waitForTimeout(120); await p.evaluate(()=>padUp(0));
    v=await p.evaluate("__v");
    const kept=await p.evaluate(()=>Object.keys(SETS).join(","));
    const roots=await p.evaluate(id=>!!SOUNDS[id].roots, id);   /* the timpani play the root and the fifth only */
    ok(ready && (roots ? v.length===2 : v.length>=3) && v.every(x=>x.real), `${id}: ready ${ready}, pad C plays ${v.map(x=>x.inst[0]+x.m).join(" ")}; sets kept: ${kept}; keys ${await p.textContent("#rangeOut")}`);
  }
  /* every rhythm with a pattern, briefly, on the brass section */
  await p.selectOption("#soundSel", "brass"); await p.waitForFunction(()=>soundReady("brass"), null, {timeout:60000});
  await p.selectOption("#progSel", "pop");
  for(const r of await p.evaluate("RHYTHMS")){
    await p.selectOption("#rhythmSel", r);
    await p.evaluate("__v=[]"); await p.click("#playBtn"); await p.waitForTimeout(2600);
    const n=await p.evaluate(()=>PLAY.voices.length), lit=await p.evaluate(()=>document.querySelectorAll("#kbd .now, #kbd .lit").length);
    const arts=await p.evaluate(()=>[...new Set(PLAY.voices.map(x=>x.tau))].join(","));
    await p.click("#playBtn"); await p.waitForTimeout(150);
    ok(n>0, `rhythm ${r}: ${n} notes scheduled, ${lit} keys lit, release times ${arts}`);
  }
  ok(errs.length===0, "no page errors: "+errs.slice(0,5).join(" | "));
  ok(bad.length===0, "no failed requests: "+bad.slice(0,5).join(" | "));
  await p.screenshot({path:"b1-phone.png", fullPage:true});
  await b.close(); srv.close(); console.log(fails?`${fails} FAILED`:"ALL PASS"); process.exit(fails?1:0);
})();
