/* Chord pads: the piano, the guitar and the bass send the six chords of their key; the drum machine puts them on pads 3 to 8,
   they choke each other, Put my sounds back undoes it, and a reload keeps them. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9983);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  for(const [inst, want] of [["piano","C,Dm,Em,F,G,Am"],["guitar","C,Dm,Em,F,G,Am"],["bass","C,D,E,F,G,A"],["band","C,Dm,Em,F,G,Am"]]){
    await p.goto(`http://localhost:9983/music-${inst}.html`); await p.waitForTimeout(900);
    if(inst==="piano") await p.selectOption("#soundSel","epwarm");
    await p.selectOption("#keySel","0"); await p.evaluate(()=>{ if(S.minor) document.getElementById("majBtn").click(); });
    const label=await p.textContent("#padsBtn");
    await p.click("#padsBtn");
    await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("padsLine").textContent), null, {timeout:30000});
    const tk=await p.evaluate(async()=>{ const x=await AOGHandoff.get("chordpads"); return x && {from:x.from, en:x.pads.map(q=>q.en).join(","), es:x.pads.map(q=>q.es).join(","), lens:x.pads.map(q=>q.pcm.length), peaks:x.pads.map(q=>{ let m=0; for(let i=0;i<q.pcm.length;i++) m=Math.max(m,Math.abs(q.pcm[i])); return +m.toFixed(2); }), rms:x.pads.map(q=>{ let s=0; for(let i=0;i<q.pcm.length;i++) s+=q.pcm[i]*q.pcm[i]; return +Math.sqrt(s/q.pcm.length).toFixed(3); })}; });
    ok(tk && tk.from===inst && tk.en===want && tk.lens.every(n=>n===Math.ceil(1.4*26040)) && tk.peaks.every(x=>x>0.75&&x<0.85) && tk.rms.every(x=>x>0.02),
      `${inst}: "${label}" leaves six pads (${tk&&tk.en} / ${tk&&tk.es}), each 1.4 s at 26,040 Hz, peaks ${tk&&tk.peaks}, rms ${tk&&tk.rms}`);
    /* the drum machine */
    await p.goto("http://localhost:9983/music-drums.html"); await p.waitForTimeout(1500);
    const row=await p.evaluate(()=>{ const r=document.querySelector(".chord-row"); return r && r.textContent.replace(/\s+/g," ").trim(); });
    ok(row && row.indexOf(want.split(",").join(" · "))>=0 && row.indexOf("From the "+inst)===0, `${inst}: the drum machine shows the row: ${row}`);
    const before=await p.evaluate(()=>({mem:+memUsed().toFixed(2), bank:S.bank, user:Object.keys(USER[S.bank]).join(","), chord:Object.keys(CHORDPAD[S.bank]).join(",")}));
    await p.click('[data-chordpads]'); await p.waitForTimeout(400);
    const after=await p.evaluate(()=>({mem:+memUsed().toFixed(2), names:VOICES.map(v=>USER_NAME[S.bank][v.id]||"").join(","), chord:Object.keys(CHORDPAD[S.bank]).join(","), lens:VOICES.slice(2).map(v=>+(USER[S.bank][v.id].length/26040).toFixed(2)), note:(document.querySelector(".chord-row + .simple-note")||{}).textContent, lcd:document.getElementById("lcd").textContent,
      choke3:chanMsg("ch",0,false).choke, choke6:chanMsg("tom",0,false).choke, choke1:chanMsg("kick",0,false).choke, faces:[...document.querySelectorAll(".pad")].map(e=>e.textContent.trim().split(/\s+/)[0]).slice(0,8).join(",")}));
    ok(after.names===",,"+want && after.chord==="ch,oh,clap,tom,rim,bell" && after.mem<=10.001, `pads 3-8 hold ${after.names.split(",").slice(2).join(" ")} (each ${after.lens[0]} s; memory ${before.mem} → ${after.mem} of 10 s)`);
    ok(after.choke3===2 && after.choke6===2 && after.choke1===0, "the chord pads choke each other (group 2); the kick does not");
    ok(/pads 3 to 8/.test(after.note||"") && /CHORDS/.test(after.lcd), "the row says where they went: "+after.note);
    /* undo */
    await p.click('[data-kitundo]'); await p.waitForTimeout(300);
    const undone=await p.evaluate(()=>({user:Object.keys(USER[S.bank]).join(","), chord:Object.keys(CHORDPAD[S.bank]).join(",")}));
    ok(undone.user===before.user && undone.chord===before.chord, "Put my sounds back puts back what was there ("+(undone.user||"no samples")+")");
    /* put them back on, then reload: they stay, named as chords */
    await p.click('[data-chordpads]'); await p.waitForTimeout(600);
    await p.reload(); await p.waitForTimeout(1800);
    const re=await p.evaluate(()=>({names:VOICES.map(v=>USER_NAME[S.bank][v.id]||"").join(","), chord:Object.keys(CHORDPAD[S.bank]).join(",")}));
    ok(re.names===",,"+want && re.chord==="ch,oh,clap,tom,rim,bell", "after a reload the chords are still there, still chords: "+re.names);
    await p.evaluate(()=>{ kitSoundsBack(); }); await p.waitForTimeout(700);
  }
  /* Spanish */
  await p.evaluate(()=>{ S.lang="es"; try{ localStorage.setItem("aog.lang","es"); }catch(e){} paint(); });
  const es=await p.evaluate(()=>{ const r=document.querySelector(".chord-row"); return r && r.textContent.replace(/\s+/g," ").trim(); });
  ok(/De la banda/.test(es) && /Do · Rem · Mim · Fa · Sol · Lam/.test(es) && /Ponerlos en los pads 3 a 8/.test(es), "in Spanish (the band sent last): "+es);
  await p.evaluate(()=>{ try{ localStorage.setItem("aog.lang","en"); }catch(e){} });
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
