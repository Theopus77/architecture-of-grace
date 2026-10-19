/* AOG-BEATS-PERFECT-V1 (2026-10-19) — Jimmy: "I don't necessary need NEW or MORE beats, just the drum beats edited and more
   perfected." The 95 beats (aog-beats.js: ten groups and the eight famous styles; made by
   aog-deploy/_work/music/beats_core/make_beats_core.py). As pads/elite.js does for the Elite beats:
   · the made file matches the family files, and their own check (check_core.js: same ids and names, recorded kits,
     lessons' beats kept on sixteenths) passes; the ten First beats are kept;
   · Drum Machine: every beat loads from the menu with every hit on its pad and on its exact tick (a step is 96/res
     ticks), every bar of it, its tempo, its kit, straight time on a triplet or 32nd grid; one beat of each grid plays;
   · Drum Kit: every beat brings its tempo and its bars are 4 × res steps long; one beat of each grid plays;
   · an iPhone, in Spanish: nothing scrolls sideways; no page errors. Ports 9405 (the Drum Machine), 9406 (the Drum Kit). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const path=require("path"), cp=require("child_process"), fs=require("fs");
const ROOT=path.resolve(__dirname, "../../../aog-deploy"), BP=path.join(ROOT, "_work/music/beats_core");
const srvA=require("../srv.js")(9405), srvB=require("../srv.js")(9406);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const PADS=["kick","snare","ch","oh","clap","tom","rim","bell"];
(async()=>{
  /* the data */
  let chk=""; try{ chk=cp.execFileSync("node", [path.join(BP, "check_core.js")]).toString(); }catch(e){ chk=String(e.stdout||e.message); }
  ok(/ALL PASS/.test(chk), "the family files pass their own check: "+chk.trim().split("\n").slice(-2).join(" · "));
  const fam=[]; ["rockpop","funkhiphop","jazzworld","latincarib","electronic"].forEach(f=>{ const J=JSON.parse(fs.readFileSync(path.join(BP,f+".json"),"utf8")); fam.push(...J.beats, ...(J.styles||[])); });
  global.window={}; require(path.join(ROOT, "aog-beats.js")); const A=window.AOGBeats;
  const P={beats:A.beats.concat(A.styles.map(x=>Object.assign({grp:"styles"}, x)))};
  const same=x=>{ const y=fam.find(q=>q.id===x.id); return y && JSON.stringify(y.map)===JSON.stringify(x.map) && JSON.stringify(y.parts||[])===JSON.stringify(x.parts||[]) && (y.res||4)===(x.res||4) && y.kit===x.kit && y.bpm===x.bpm; };
  ok(P.beats.length===95 && P.beats.every(same) && A.classroom.length===10, `aog-beats.js is made from the family files: ${A.beats.length} beats and ${A.styles.length} styles (run make_beats_core.py after a change); the ten First beats kept`);
  const RES={}; P.beats.forEach(x=>{ const r=x.res||4; RES[r]=RES[r]||x.id; });
  const grpOf=x=>x.grp==="styles" ? "styles" : x.grp;
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(port, page, opt, lang)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[];
    p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.addInitScript(l=>{ try{ localStorage.removeItem("aog.pads.v1"); localStorage.removeItem("aog.kit.v1"); localStorage.setItem("aog.lang", l); }catch(e){} }, lang||"en");
    await p.goto(`http://localhost:${port}/${page}`); await p.waitForTimeout(1200);
    return {c, p, errs};
  };

  /* ══ the Drum Machine ══ */
  { const {c, p, errs}=await open(9405, "music-pads.html", {viewport:{width:1280,height:900}});
    const bad=[];
    for(const x of P.beats){
      await p.selectOption("#grpSel", grpOf(x)).catch(()=>{}); await p.waitForTimeout(60);
      await p.selectOption("#startSel", x.id).catch(()=>{}); await p.waitForTimeout(80);
      const st=await p.evaluate(()=>({id:S.beat&&S.beat.id, kit:S.banks[0].kitA, bpm:S.bpm, swing:S.swing, bars:S.bars, kits:KITS(),
        ev:S.ev.filter(e=>e.b===0).map(e=>e.p+":"+Math.round(e.t)+":"+e.v).sort()}));
      const res=x.res||4, tk=96/res, V={1:0.8,2:1,3:0.45}, bars=[x.map].concat((x.parts||[]).map(q=>q.map)), want=[];
      for(let bar=0; bar<st.bars; bar++) PADS.forEach((pid, pi)=>{ const row=bars[bar%bars.length][pid]; if(!row) return; row.forEach((v,i)=>{ if(v) want.push(pi+":"+Math.round(bar*384+i*tk)+":"+V[v]); }); });
      want.sort();
      const why=[];
      if(st.id!==x.id) why.push("not loaded");
      if(st.bars<bars.length) why.push("bars "+st.bars);
      if(JSON.stringify(st.ev)!==JSON.stringify(want)) why.push(`hits ${st.ev.length} of ${want.length}`);
      if(st.bpm!==x.bpm) why.push("tempo "+st.bpm);
      if(st.kits.includes(x.kit) && st.kit!==x.kit) why.push("kit "+st.kit);
      if(!st.kits.includes(x.kit)) why.push("kit "+x.kit+" is not on the Drum Machine");
      if(res!==4 && st.swing!==50) why.push("swing "+st.swing);
      if(why.length) bad.push(x.id+": "+why.join(", "));
    }
    ok(bad.length===0, `Drum Machine: all ${P.beats.length} beats load from the menu: every hit on its pad and tick, every bar, tempo, kit `+bad.slice(0,4).join(" | "));
    for(const [res, id] of Object.entries(RES)){
      const x=P.beats.find(q=>q.id===id);
      await p.selectOption("#grpSel", grpOf(x)); await p.waitForTimeout(60); await p.selectOption("#startSel", id); await p.waitForTimeout(100);
      const r=await p.evaluate(async()=>{ play(); await new Promise(q=>setTimeout(q, 1500)); const on=SEQ.on; stop(); return {on}; }).catch(e=>({err:e.message}));
      ok(r.on===true && !r.err, `Drum Machine: ${id} (grid ${res}) plays `+(r.err||""));
    }
    ok(errs.length===0, "Drum Machine: no page errors "+errs.join(" | "));
    await c.close();
  }
  { const {c, p, errs}=await open(9405, "music-pads.html", {viewport:{width:390,height:844}, isMobile:true, hasTouch:true}, "es");
    ok(await p.evaluate("document.documentElement.scrollWidth")<=390, "Drum Machine on an iPhone: nothing scrolls sideways");
    ok(errs.length===0, "Drum Machine on an iPhone: no page errors "+errs.join(" | "));
    await c.close();
  }

  /* ══ the Drum Kit ══ */
  { const {c, p, errs}=await open(9406, "music-kit.html", {viewport:{width:1280,height:900}});
    const bad=[];
    for(const x of P.beats){
      await p.selectOption("#beatSel", (x.grp==="styles"?"s:":"b:")+x.id).catch(()=>{}); await p.waitForTimeout(60);
      const st=await p.evaluate(()=>{ const b=beatNow(); return {key:S.beat, bank:S.bank, bpm:S.bpm, kits:KITS(), lens:beatParts(b).map(q=>q.len)}; });
      const res=x.res||4, why=[];
      if(st.key!==(x.grp==="styles"?"s:":"b:")+x.id) why.push("not picked");
      
      if(st.bpm!==Math.max(40, Math.min(220, x.bpm))) why.push("tempo "+st.bpm);
      if(!st.lens.every(n=>n===4*res) || st.lens.length!==1+(x.parts||[]).length) why.push("bars "+st.lens.join(","));
      if(why.length) bad.push(x.id+": "+why.join(", "));
    }
    ok(bad.length===0, `Drum Kit: all ${P.beats.length} beats bring their tempo, each bar 4 × res steps `+bad.slice(0,4).join(" | "));
    for(const [res, id] of Object.entries(RES)){
      { const x=P.beats.find(q=>q.id===id); await p.selectOption("#beatSel", (x.grp==="styles"?"s:":"b:")+id); } await p.waitForTimeout(100);
      const r=await p.evaluate(async()=>{ beatStart(); await new Promise(q=>setTimeout(q, 1200)); const s={on:BT.on, moved:BT.step+BT.part*100}; beatStop(); return s; });
      ok(r.on && r.moved>0, `Drum Kit: ${id} (grid ${res}) plays, the steps move on`);
    }
    ok(errs.length===0, "Drum Kit: no page errors "+errs.join(" | "));
    await c.close();
  }
  { const {c, p, errs}=await open(9406, "music-kit.html", {viewport:{width:390,height:844}, isMobile:true, hasTouch:true}, "es");
    ok(await p.evaluate("document.documentElement.scrollWidth")<=390, "Drum Kit on an iPhone: nothing scrolls sideways");
    ok(errs.length===0, "Drum Kit on an iPhone: no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srvA.close(); srvB.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
