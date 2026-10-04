/* Record on every music tool: a take of what it plays, sent to the turntables, which show it */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9993);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext(pw.devices["iPad (gen 7)"]);
  const T=[["music-piano","recBtn","takes","keysbench","● Record"],["music-guitar","recBtn","takes","guitarbench","● Record"],["music-bass","recBtn","takes","bassbench","● Record"],
           ["music-band","recBtn","takes","bandbench","● Record"],["music-drums","takeBtn","takeList","drumtake","● Record a take"]];
  for(const [pg, btn, list, shelf, label] of T){
    const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9993/${pg}.html`); await p.waitForTimeout(1200);
    if(pg==="music-band") await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:30000});
    if(pg==="music-piano") await p.selectOption("#soundSel","epwarm");
    const lab=await p.evaluate(id=>document.getElementById(id).textContent, btn);
    if(pg!=="music-drums"){ await p.selectOption("#progSel","pop"); }
    await p.locator("#"+btn).scrollIntoViewIfNeeded();
    await p.click("#"+btn); await p.waitForTimeout(200);
    if(pg==="music-drums"){                 /* the machine starts with an empty pattern: play its pads by hand */
      for(const id of ["kick","snare","kick","ch","snare","kick","snare","oh"]){ const pl=p.locator(`.sp-pad[data-pad="${id}"]`); await pl.scrollIntoViewIfNeeded(); const bb=await pl.boundingBox(); await p.touchscreen.tap(bb.x+bb.width/2, bb.y+bb.height/2); await p.waitForTimeout(260); }
    } else { await p.evaluate(()=>document.getElementById("playBtn").click()); await p.waitForTimeout(2200); await p.evaluate(()=>document.getElementById("playBtn").click()); }
    await p.click("#"+btn); await p.waitForTimeout(1200);
    const tk=await p.evaluate(async([list])=>{ const k=REC.takes[0]; if(!k) return null; const buf=await new OfflineAudioContext(2,1,k.blob.size>0?44100:44100).decodeAudioData(await k.blob.arrayBuffer());
      const d=buf.getChannelData(0); let pk=0, flat=0; for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); pk=Math.max(pk,a); if(a>0.99995 && i>0 && Math.abs(d[i-1])>0.99995) flat++; } return {sec:+k.sec.toFixed(2), peak:+pk.toFixed(3), flat, rows:document.querySelectorAll("#"+list+" .aogrec-take").length}; }, [list]);
    ok(lab===label && tk && tk.peak>0.05 && tk.flat===0 && tk.sec>1.5 && tk.rows===1, `${pg}: "${lab}" records what it plays: ${JSON.stringify(tk)}`);
    await p.click(`#${list} [data-aogrec-send="1"]`); await p.waitForTimeout(500);
    const sh=await p.evaluate(async(k)=>{ const x=await AOGHandoff.get(k); return x && {name:x.name, take:x.take, size:x.wav.size}; }, shelf);
    ok(sh && sh.take===true && / · my playing · Take 1 · 0:0\d$/.test(sh.name), `${pg}: Send puts it on the "${shelf}" shelf as "${sh&&sh.name}"`);
    if(pg==="music-drums"){
      const pos=await p.evaluate(()=>({after:document.getElementById("takeBox").previousElementSibling.className, shown:!document.getElementById("takeBox").hidden}));
      const same=await p.evaluate(()=>{ const a=document.getElementById("takeBox"), au=a.querySelector("audio"); paint(); return document.getElementById("takeBox")===a && a.querySelector("audio")===au && !a.hidden; });
      ok(/knobs/.test(pos.after) && pos.shown && same, "the drum machine's take box sits under Tempo and Volume, and a redraw keeps it (and its player) as it was");
      await p.evaluate(()=>{ location.hash="#meet"; }); await p.waitForTimeout(400);
      ok(await p.evaluate(()=>document.getElementById("takeBox").hidden), "on the Meet the drums page it steps out of the way");
      await p.evaluate(()=>{ location.hash=""; }); await p.waitForTimeout(400);
      ok(await p.evaluate(()=>document.getElementById("recBtn").textContent==="REC"), "the machine's own REC (into the pattern) is still there, unchanged");
    }
    ok(errs.length===0, `${pg}: no page errors ${errs.join(" | ")}`);
    await p.close();
  }
  const p=await c.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9993/music-decks.html"); await p.waitForTimeout(1500);
  const rows=await p.evaluate(()=>[...document.querySelectorAll("#bench .take")].map(d=>d.querySelector("b").textContent+" — "+((d.querySelector(".tlen")||{}).textContent||"")));
  ok(["From the piano — Piano · my playing","From the guitar — Guitar · my playing","From the bass — Bass · my playing","From the band — Band · my playing","A take from the drum machine — Drums · my playing"].every(s=>rows.some(r=>r.indexOf(s)===0)), "the turntables show every take:\n   "+rows.join("\n   "));
  await p.evaluate(()=>{ const bn=document.querySelector('#bench [data-take="drumtake"][data-deck="A"]'); bn.click(); }); await p.waitForTimeout(1200);
  const dA=await p.evaluate(()=>{ const d=decks.find(x=>x.id==="A"); return {buf:!!(d.buffer||d.buf), name:d.name||""}; });
  ok(dA.buf && /drumtake/.test(dA.name), "the drum take goes onto deck A: "+JSON.stringify(dA));
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
