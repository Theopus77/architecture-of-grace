/* the piano's Record button: a take of what you play, its length and sound, the Volume not mattering, Send, Save, the limit */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9992);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext(pw.devices["iPad (gen 7)"]); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9992/music-piano.html"); await p.waitForTimeout(900);
  await p.selectOption("#soundSel","epwarm");
  ok(await p.evaluate(()=>document.getElementById("recBtn").textContent==="● Record" && document.getElementById("recTime").hidden), "the Keys row has ● Record");
  /* a take: wait a moment, then three keys by touch */
  const take=async(vol, notes)=>{
    await p.evaluate(v=>{ const r=document.getElementById("vol"); r.value=String(v); r.oninput(); }, vol);
    await p.click("#recBtn"); await p.waitForTimeout(700);
    const during=await p.evaluate(()=>({btn:document.getElementById("recBtn").textContent, pressed:document.getElementById("recBtn").getAttribute("aria-pressed"), time:!document.getElementById("recTime").hidden, line:document.getElementById("recLine").textContent}));
    await p.locator("#kbd").scrollIntoViewIfNeeded();
    for(const m of notes){ const k=await p.locator(`#kbd [data-m="${m}"]`).boundingBox(); await p.touchscreen.tap(k.x+k.width/2, k.y+k.height*0.8); await p.waitForTimeout(250); }
    await p.waitForTimeout(600);
    await p.click("#recBtn"); await p.waitForTimeout(1200);
    return during;
  };
  const d1=await take(80, [60,64,67]);
  ok(d1.btn==="■ Stop recording" && d1.pressed==="true" && d1.time && /never a microphone/.test(d1.line), "while it records: ■ Stop recording, the time, and the line: "+d1.line);
  const t1=await p.evaluate(async()=>{ const k=REC.takes[0]; if(!k) return null; const buf=await new OfflineAudioContext(2,1,ac.sampleRate).decodeAudioData(await k.blob.arrayBuffer());
    const d=buf.getChannelData(0); let pk=0, first=-1; for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); if(a>pk) pk=a; if(first<0 && a>0.002) first=i; }
    return {n:k.n, sec:+k.sec.toFixed(2), dur:+buf.duration.toFixed(2), ch:buf.numberOfChannels, sr:buf.sampleRate, peak:+pk.toFixed(3), firstMs:Math.round(first/buf.sampleRate*1000),
      row:document.querySelector(".aogrec-take").textContent.replace(/\s+/g," ").trim(), save:document.querySelector(".aogrec-take a[download]").getAttribute("download"), href:document.querySelector(".aogrec-take a[download]").href.slice(0,5), line:document.getElementById("recLine").textContent}; });
  ok(t1 && t1.ch===2 && t1.peak>0.05 && t1.sec>1.2 && t1.sec<2.4 && t1.firstMs>=30 && t1.firstMs<=80, "a take of the three keys: "+JSON.stringify(t1));
  ok(t1 && t1.save==="piano-take-1.wav" && t1.href==="blob:" && /stay on this device/.test(t1.line), "it can be saved as piano-take-1.wav, and the line says takes stay on this device");
  /* the same three keys with the Volume at 10: the take is just as strong */
  await take(10, [60,64,67]);
  const t2=await p.evaluate(async()=>{ const k=REC.takes[0]; const buf=await new OfflineAudioContext(2,1,ac.sampleRate).decodeAudioData(await k.blob.arrayBuffer()); const d=buf.getChannelData(0); let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x)); return {n:k.n, peak:+pk.toFixed(3)}; });
  ok(t2.n===2 && Math.abs(20*Math.log10(t2.peak/t1.peak))<1.5, `with the Volume at 10 the take is as strong: peak ${t2.peak} vs ${t1.peak}`);
  await p.evaluate(()=>{ const r=document.getElementById("vol"); r.value="80"; r.oninput(); });
  /* Send to the turntables */
  await p.click('[data-aogrec-send="2"]'); await p.waitForTimeout(500);
  const sh=await p.evaluate(async()=>{ const x=await AOGHandoff.get("keysbench"); return x && {name:x.name, size:x.wav.size, line:document.getElementById("recLine").textContent}; });
  ok(sh && /Piano · my playing · Take 2 · 0:0\d/.test(sh.name) && /Sent/.test(sh.line), "Send puts the take on the turntables' shelf: "+JSON.stringify(sh));
  /* the pattern is recorded too */
  await p.selectOption("#progSel","pop"); await p.click("#playBtn"); await p.waitForTimeout(300);
  await p.click("#recBtn"); await p.waitForTimeout(2000); await p.click("#recBtn"); await p.waitForTimeout(900); await p.click("#playBtn");
  const t3=await p.evaluate(async()=>{ const k=REC.takes[0]; const buf=await new OfflineAudioContext(2,1,ac.sampleRate).decodeAudioData(await k.blob.arrayBuffer()); const d=buf.getChannelData(0); let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x)); return {n:k.n, sec:+k.sec.toFixed(2), peak:+pk.toFixed(3), shown:document.querySelectorAll(".aogrec-take").length}; });
  ok(t3.n===3 && t3.peak>0.05 && t3.sec>2, "a take while Play the chords runs keeps the chords: "+JSON.stringify(t3));
  /* nothing played (after the chords' echo has died away) */
  await p.waitForTimeout(4000);
  await p.click("#recBtn"); await p.waitForTimeout(800); await p.click("#recBtn"); await p.waitForTimeout(900);
  ok(await p.evaluate(()=>REC.takes.length===3 && REC.takes[0].n===3 && /Nothing was played/.test(document.getElementById("recLine").textContent)), "a take with nothing played is left out, and the line says so");
  /* a fourth take: only the last three stay */
  await take(80, [62]);
  ok(await p.evaluate(()=>REC.takes.map(k=>k.n).join(",")==="4,3,2" && document.querySelectorAll(".aogrec-take").length===3), "only the last three takes stay: "+await p.evaluate(()=>REC.takes.map(k=>"Take "+k.n).join(", ")));
  /* the limit (made short here) */
  await p.evaluate(()=>{ REC.max=1.5; }); await p.click("#recBtn"); await p.waitForTimeout(300);
  await p.evaluate(()=>{ noteOn("k",60,0.7); }); await p.waitForTimeout(2600);
  ok(await p.evaluate(()=>!REC.on && /limit/.test(document.getElementById("recLine").textContent) && REC.takes[0].n===5), "at the limit it stops by itself, keeps the take, and says why");
  await p.evaluate(()=>{ noteOff("k",60); REC.max=300; });
  /* Spanish */
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(250);
  const es=await p.evaluate(()=>({btn:document.getElementById("recBtn").textContent, row:document.querySelector(".aogrec-take").textContent.replace(/\s+/g," ").trim(), save:document.querySelector(".aogrec-take a[download]").getAttribute("download")}));
  ok(es.btn==="● Grabar" && /^Toma 5/.test(es.row) && /Guardar como \.wav/.test(es.row) && es.save==="piano-toma-5.wav", "in Spanish: "+JSON.stringify(es));
  await p.evaluate(()=>document.getElementById("langBtn").click());
  /* leaving the page while recording keeps the take */
  await p.click("#recBtn"); await p.evaluate(()=>noteOn("k",64,0.7)); await p.waitForTimeout(600);
  await p.evaluate(()=>{ Object.defineProperty(document,"hidden",{value:true,configurable:true}); document.dispatchEvent(new Event("visibilitychange")); });
  await p.waitForTimeout(1200);
  ok(await p.evaluate(()=>!REC.on && REC.takes[0].n===6), "switching away while recording ends the take and keeps it");
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  await p.evaluate(()=>{ Object.defineProperty(document,"hidden",{value:false,configurable:true}); });
  for(const [dev,f] of [["iPhone 13","rec-phone.png"],["Desktop Chrome","rec-desk.png"]]){
    const c2=await b.newContext(pw.devices[dev]); const p2=await c2.newPage(); await p2.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p2.goto("http://localhost:9992/music-piano.html"); await p2.waitForTimeout(900); await p2.selectOption("#soundSel","epwarm");
    await p2.click("#recBtn"); await p2.evaluate(()=>noteOn("k",60,0.7)); await p2.waitForTimeout(900); await p2.evaluate(()=>noteOff("k",60)); await p2.click("#recBtn"); await p2.waitForTimeout(1200);
    await p2.locator("#takes").scrollIntoViewIfNeeded(); await p2.evaluate(()=>window.scrollBy(0,-260));
    const w=await p2.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth}));
    ok(w.sw<=w.iw, dev+": nothing sticks out sideways "+JSON.stringify(w));
    await p2.screenshot({path:f}); await c2.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
