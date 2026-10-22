/* AOG-PLAY-ALONG-V1 (2026-10-22) — Jimmy: "how can we get the drum loops that are made in kit A to be played so I / or the
   person can use the keyboard to make the rest of the tracks or the guitar and bass rooms?" In the Studio:
   · a Drum Machine loop sent to the Mixing Desk is on My Track; in the Piano, ♫ Play along plays it, round and round, and you
     stay in the Piano, which still plays under your fingers; the line says what is happening;
   · going to the Guitar and the Bass keeps it playing; ■ Stop stops it and its sound rests;
   · ● Record stops it first (Record plays My Track itself); ▶ Listen too; nothing to play says so;
   · English and Spanish, an iPhone and an iPad; no page errors. Port 9493. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const path=require("path"), ROOT=path.resolve(__dirname,"../../../aog-deploy"), PORT=9493, srv=require("../srv.js")(PORT);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const [nm, o, lang] of [["iPad", {viewport:{width:1180,height:820}, hasTouch:true}, "en"], ["iPhone", {viewport:{width:390,height:844}, isMobile:true, hasTouch:true}, "es"]]){
    const ctx=await b.newContext({...o, serviceWorkers:"block"}); const errs=[];
    ctx.on("page", x=>x.on("pageerror", e=>errs.push(e.message)));
    await ctx.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await ctx.route(/\/the-studio(\?[^#]*)?$/, r=>r.fulfill({path:path.join(ROOT,"the-studio.html"), contentType:"text/html"}));
    await ctx.addInitScript(l=>{ try{ if(!sessionStorage.getItem("t")){ localStorage.clear(); sessionStorage.setItem("t","1"); } localStorage.setItem("aog.lang", l); }catch(e){} }, lang);
    const p=await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#piano`);
    const A=()=>p.evaluate(()=>AOGStudioShell.along());
    const btn=()=>p.evaluate(()=>{ const b=document.getElementById("tpAlong"); return {t:b.textContent, pressed:b.getAttribute("aria-pressed"), shown:!!b.offsetParent, line:document.getElementById("tpLine").textContent}; });
    const go=async id=>{ await p.evaluate(i=>AOGStudioShell.go(i), id); await W(3500); };
    await W(4000);
    /* nothing on My Track yet */
    await p.click("#tpAlong"); await W(4000);
    let s=await A(), t=await btn();
    ok(t.shown && !s.on && /Nothing to hear|Todavía no hay/.test(t.line), `${nm}: with nothing on My Track, Play along says so: "${t.line}"`);
    /* a loop from the Drum Machine */
    await go("pads");
    const f=p.frames().find(x=>/music-pads/.test(x.url()));
    await f.waitForFunction(()=>document.querySelectorAll("#grpSel option").length>3, null, {timeout:30000});
    await f.evaluate(async()=>{ startBeat("boombap"); document.getElementById("bounceBtn").click(); for(let i=0;i<120 && document.getElementById("bounceAct").hidden;i++) await new Promise(r=>setTimeout(r,250)); document.getElementById("bStudio").click(); });
    await W(2500);
    await go("piano");
    await p.click("#tpAlong"); await W(6000);
    s=await A(); t=await btn();
    ok(s.on && s.loop && s.ac==="running" && t.pressed==="true" && /■/.test(t.t), `${nm}: in the Piano, Play along plays My Track round and round: ${JSON.stringify(s)} "${t.t}"`);
    ok(await p.evaluate(()=>location.hash)==="#piano" && /Play along in any room|Toca encima en cualquier sala/.test(t.line), `${nm}: you stay in the Piano, and the line says: "${t.line}"`);
    await go("guitar"); s=await A(); ok(s.on, `${nm}: going to the Guitar keeps it playing`);
    await go("bass"); s=await A(); ok(s.on, `${nm}: and the Bass`);
    await p.click("#tpAlong"); await W(600); s=await A(); t=await btn();
    ok(!s.on && t.pressed==="false" && s.ac==="suspended", `${nm}: ■ Stop stops it and its sound rests: ${JSON.stringify(s)}`);
    await p.click("#tpAlong"); await W(6000); s=await A(); ok(s.on, `${nm}: Play along again`);
    await p.click("#tpRec"); await W(1500); s=await A();
    ok(!s.on, `${nm}: ● Record stops it first (Record plays My Track itself, after four clicks)`);
    await p.click("#tpRec"); await W(1500);
    ok(errs.length===0, `${nm}: no page errors `+errs.slice(0,3).join(" | "));
    await ctx.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
