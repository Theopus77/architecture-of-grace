/* AOG-BEATS-ELITE-V1 (2026-10-19) — Jimmy: "Produce some of the dopest and BEST hitting drum beat out there … we are no
   where near the ceiling." The 64 newer beats (aog-beats-pro.js, made by aog-deploy/_work/music/beats_pro/make_beats_pro.py),
   mixed into the main groups since AOG-BEATS-GROUPS-V1 (Jimmy: "I don't like the word ELITE … group the drum kits accordingly"):
   · the made file matches the family files, and their own check (check_beats.js) passes;
   · Drum Machine: the 13 main groups in the beat menu, each newer beat in its group with the older ones, slow to fast, and
     the word Elite nowhere, in English and Spanish; every newer beat
     loads from the menu with every hit on its pad and on its exact tick (a step is 96/res ticks: triplets and 32nd notes),
     every bar of it (1, 2 or 4), its tempo, its kit, straight time on a triplet or 32nd grid; one beat of each grid plays;
   · Drum Kit: the same groups; every newer beat brings its kit and its tempo, and its bars are 4 × res steps long;
     one beat of each grid plays (the steps move on, the drums light);
   · an iPhone: nothing scrolls sideways; no page errors. Ports 9403 (the Drum Machine), 9404 (the Drum Kit). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const path=require("path"), cp=require("child_process"), fs=require("fs");
const ROOT=path.resolve(__dirname, "../../../aog-deploy"), BP=path.join(ROOT, "_work/music/beats_pro");
const srvA=require("../srv.js")(9403), srvB=require("../srv.js")(9404);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const PADS=["kick","snare","ch","oh","clap","tom","rim","bell"];
(async()=>{
  /* the data */
  let chk=""; try{ chk=cp.execFileSync("node", [path.join(BP, "check_beats.js")]).toString(); }catch(e){ chk=String(e.stdout||e.message); }
  ok(/ALL PASS/.test(chk), "the family files pass their own check: "+chk.trim().split("\n").slice(-2).join(" · "));
  const fam={groups:{}, beats:[]}; fs.readdirSync(BP).filter(f=>f.endsWith(".json")).forEach(f=>{ const J=JSON.parse(fs.readFileSync(path.join(BP,f),"utf8")); Object.assign(fam.groups, J.groups); fam.beats.push(...J.beats); });
  global.window={}; require(path.join(ROOT, "aog-beats-pro.js")); const P=window.AOGBeatsPro;
  ok(P.beats.length===fam.beats.length && P.beats.length>=(process.env.ELITE_MIN?+process.env.ELITE_MIN:40) && JSON.stringify(Object.keys(P.groups).sort())===JSON.stringify(Object.keys(fam.groups).sort()),
    `aog-beats-pro.js is made from the family files: ${P.beats.length} beats in ${Object.keys(P.groups).length} groups (run make_beats_pro.py after a change)`);
  const RES={}; P.beats.forEach(x=>{ const r=x.res||4; RES[r]=RES[r]||x.id; });
  ok(Object.keys(RES).length>=3, "the beats use at least three grids: "+JSON.stringify(RES));

  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(port, page, opt, lang)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[];
    p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.addInitScript(l=>{ try{ localStorage.removeItem("aog.pads.v1"); localStorage.removeItem("aog.kit.v1"); localStorage.setItem("aog.lang", l); }catch(e){} }, lang||"en");
    await p.goto(`http://localhost:${port}/${page}`); await p.waitForTimeout(1200);
    return {c, p, errs};
  };
  const BASE=JSON.parse(fs.readFileSync(path.join(ROOT,"_work/music/beats_core/_base.json"),"utf8")).groups;
  const groupsEn=Object.values(BASE).map(g=>g.en), groupsEs=Object.values(BASE).map(g=>g.es);

  /* ══ the Drum Machine ══ */
  { const {c, p, errs}=await open(9403, "music-pads.html", {viewport:{width:1280,height:900}});
    const menu=await p.evaluate(()=>[...document.querySelectorAll("#grpSel option")].map(o=>o.textContent));
    const mixed=await p.evaluate(()=>{ const F=beatFlat(), G=[...new Set(F.map(x=>x.g))]; const bad=[];
      F.filter(x=>x.b.pro).forEach(x=>{ if(!F.some(y=>y.g===x.g && !y.b.pro)) bad.push(x.b.id+" alone in "+x.g); });
      G.forEach(g=>{ const bp=F.filter(x=>x.g===g && AOGBeats.groups[g]).map(x=>x.b.bpm||0); if(bp.some((v,i)=>i && v<bp[i-1])) bad.push(g+" not slow to fast"); });
      return bad; });
    ok(groupsEn.every(g=>menu.includes(g)) && !menu.some(t=>/elite/i.test(t)) && mixed.length===0, "Drum Machine: the 13 groups, each newer beat mixed in with the older ones, slow to fast, no Elite: "+menu.slice(0, 16).join(" | ")+" "+mixed.slice(0,3).join(" | "));
    const bad=[];
    for(const x of P.beats){
      await p.selectOption("#grpSel", x.grp).catch(()=>{}); await p.waitForTimeout(60);
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
    ok(bad.length===0, `Drum Machine: all ${P.beats.length} newer beats load from the menu: every hit on its pad and tick, every bar, tempo, kit `+bad.slice(0,4).join(" | "));
    for(const [res, id] of Object.entries(RES)){
      const x=P.beats.find(q=>q.id===id);
      await p.selectOption("#grpSel", x.grp); await p.waitForTimeout(60); await p.selectOption("#startSel", id); await p.waitForTimeout(100);
      const r=await p.evaluate(async()=>{ play(); await new Promise(q=>setTimeout(q, 1500)); const on=SEQ.on; stop(); return {on}; }).catch(e=>({err:e.message}));
      ok(r.on===true && !r.err, `Drum Machine: ${id} (grid ${res}) plays `+(r.err||""));
    }
    ok(errs.length===0, "Drum Machine: no page errors "+errs.join(" | "));
    await c.close();
  }
  { const {c, p, errs}=await open(9403, "music-pads.html", {viewport:{width:390,height:844}, isMobile:true, hasTouch:true}, "es");
    const menu=await p.evaluate(()=>[...document.querySelectorAll("#grpSel option")].map(o=>o.textContent));
    ok(groupsEs.every(g=>menu.includes(g)) && !menu.some(t=>/[ée]lite/i.test(t)), "Drum Machine en español, sin Élite: "+groupsEs.join(", "));
    ok(await p.evaluate("document.documentElement.scrollWidth")<=390, "Drum Machine on an iPhone: nothing scrolls sideways");
    ok(errs.length===0, "Drum Machine on an iPhone: no page errors "+errs.join(" | "));
    await c.close();
  }

  /* ══ the Drum Kit ══ */
  { const {c, p, errs}=await open(9404, "music-kit.html", {viewport:{width:1280,height:900}});
    const og=await p.evaluate(()=>[...document.querySelectorAll("#beatSel optgroup")].map(g=>g.label));
    ok(groupsEn.every(g=>og.includes(g)) && !og.some(t=>/elite/i.test(t)), "Drum Kit: the 13 groups, no Elite: "+og.slice(0, 16).join(" | "));
    const bad=[];
    for(const x of P.beats){
      await p.selectOption("#beatSel", "b:"+x.id).catch(()=>{}); await p.waitForTimeout(60);
      const st=await p.evaluate(()=>{ const b=beatNow(); return {key:S.beat, bank:S.bank, bpm:S.bpm, kits:KITS(), lens:beatParts(b).map(q=>q.len)}; });
      const res=x.res||4, why=[];
      if(st.key!=="b:"+x.id) why.push("not picked");
      if(st.kits.includes(x.kit) && st.bank!==x.kit) why.push("kit "+st.bank);
      if(st.bpm!==Math.max(40, Math.min(220, x.bpm))) why.push("tempo "+st.bpm);
      if(!st.lens.every(n=>n===4*res) || st.lens.length!==1+(x.parts||[]).length) why.push("bars "+st.lens.join(","));
      if(why.length) bad.push(x.id+": "+why.join(", "));
    }
    ok(bad.length===0, `Drum Kit: all ${P.beats.length} newer beats bring their kit and tempo, each bar 4 × res steps `+bad.slice(0,4).join(" | "));
    for(const [res, id] of Object.entries(RES)){
      await p.selectOption("#beatSel", "b:"+id); await p.waitForTimeout(100);
      const r=await p.evaluate(async()=>{ beatStart(); await new Promise(q=>setTimeout(q, 1200)); const s={on:BT.on, moved:BT.step+BT.part*100}; beatStop(); return s; });
      ok(r.on && r.moved>0, `Drum Kit: ${id} (grid ${res}) plays, the steps move on`);
    }
    ok(errs.length===0, "Drum Kit: no page errors "+errs.join(" | "));
    await c.close();
  }
  { const {c, p, errs}=await open(9404, "music-kit.html", {viewport:{width:390,height:844}, isMobile:true, hasTouch:true}, "es");
    const og=await p.evaluate(()=>[...document.querySelectorAll("#beatSel optgroup")].map(g=>g.label));
    ok(groupsEs.every(g=>og.includes(g)) && !og.some(t=>/[ée]lite/i.test(t)), "Drum Kit en español, sin Élite: "+groupsEs.join(", "));
    ok(await p.evaluate("document.documentElement.scrollWidth")<=390, "Drum Kit on an iPhone: nothing scrolls sideways");
    ok(errs.length===0, "Drum Kit on an iPhone: no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srvA.close(); srvB.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
