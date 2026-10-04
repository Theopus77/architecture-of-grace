/* The guitar and the bass send to the turntables; the turntables show "From the guitar" and "From the bass" and put
   them on a deck. The five music tools' menus go where they say. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9981);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  for(const inst of ["guitar","bass","band"]){
    await p.goto(`http://localhost:9981/music-${inst}.html`); await p.waitForTimeout(700);
    if(inst==="band") await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:30000});
    await p.selectOption("#progSel","blues"); await p.click("#sendBtn");
    await p.waitForFunction(()=>/Sent|Enviado|did not/.test(document.getElementById("sendLine").textContent), null, {timeout:30000});
    ok(/Sent/.test(await p.textContent("#sendLine")), inst+": Send says Sent");
  }
  await p.goto("http://localhost:9981/music-decks.html"); await p.waitForTimeout(1500);
  const shelves=await p.evaluate(()=>[...document.querySelectorAll("#bench .take")].map(d=>d.querySelector("b").textContent+" — "+(d.querySelector(".tlen")||{}).textContent));
  ok(shelves.some(s=>/From the guitar — Guitar · .*12 bars/.test(s)) && shelves.some(s=>/From the bass — Bass · .*12 bars/.test(s)) && shelves.some(s=>/From the band — Band · .*12 bars/.test(s)), "the turntables show all three shelves: "+shelves.join(" | "));
  await p.evaluate(()=>{ const bn=document.querySelector('#bench [data-take="guitar"][data-deck="A"]'); bn.click(); });
  await p.waitForTimeout(1500);
  const deckA=await p.evaluate(()=>{ const d=decks.find(x=>x.id==="A"); return {buf:!!(d.buffer||d.buf), name:(d.name||d.title||""), dur:d.buffer?d.buffer.duration:(d.buf?d.buf.duration:0)}; });
  ok(deckA.buf && deckA.dur>15, "Onto deck A puts the guitar recording on deck A ("+deckA.dur.toFixed(1)+" s, "+deckA.name+")");
  await p.evaluate(()=>{ const bn=document.querySelector('#bench [data-take="bass"][data-deck="B"]'); bn.click(); });
  await p.waitForTimeout(1500);
  const deckB=await p.evaluate(()=>{ const d=decks.find(x=>x.id==="B"); return {buf:!!(d.buffer||d.buf), dur:d.buffer?d.buffer.duration:(d.buf?d.buf.duration:0)}; });
  ok(deckB.buf && deckB.dur>15, "and the bass onto deck B ("+deckB.dur.toFixed(1)+" s)");
  await p.evaluate(()=>{ const bn=document.querySelector('#bench [data-take="band"][data-deck="A"]'); bn.click(); });
  await p.waitForTimeout(1500);
  const deckA2=await p.evaluate(()=>{ const d=decks.find(x=>x.id==="A"); return {buf:!!(d.buffer||d.buf), name:(d.name||d.title||""), dur:d.buffer?d.buffer.duration:(d.buf?d.buf.duration:0)}; });
  ok(deckA2.buf && /band/.test(deckA2.name) && deckA2.dur>15, "and the band onto deck A ("+deckA2.dur.toFixed(1)+" s, "+deckA2.name+")");
  /* the menus */
  for(const [pg, pick, want] of [["music-drums","Guitar","music-guitar.html"],["music-piano","Bass","music-bass.html"],["music-decks","Piano","music-piano.html"],["music-guitar","Turntables","music-decks.html"],["music-bass","Drums","music-drums.html"],["music-drums","Band","music-band.html"],["music-decks","Band","music-band.html"],["music-band","Guitar","music-guitar.html"]]){
    await p.goto(`http://localhost:9981/${pg}.html`); await p.waitForTimeout(900);
    const sel=await p.evaluateHandle(()=>document.getElementById("navTools").previousElementSibling.querySelector("select"));
    const opts=await p.evaluate(s=>[...s.options].map(o=>o.text).join(","), sel);
    const shown=await p.evaluate(s=>s.options[s.selectedIndex].text, sel);
    await Promise.all([p.waitForNavigation({timeout:8000}), p.evaluate(([s,label])=>{ s.selectedIndex=[...s.options].findIndex(o=>o.text===label); s.dispatchEvent(new Event("change")); }, [sel, pick])]);
    ok(p.url().endsWith(want) && opts==="Drums,Drum kit,Piano,Guitar,Bass,Band,Turntables,Mixing desk", `${pg}: the tools menu (${opts}, showing ${shown}) → ${pick} opens ${p.url().split("/").pop()}`);
  }
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
