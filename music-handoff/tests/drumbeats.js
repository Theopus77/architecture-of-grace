/* AOG-DRUM-BEATS-V1 (2026-10-05) — Jimmy: "a plethora of drum beats". The drum machine's Start-from-a-beat menu: every beat
   loads from the menu (its kit, tempo, swing, length and every box), plays one bar with each hit on the right pad, on its step,
   at its tempo, with no page errors; every beat has English and Spanish words (name and a one-line "what it is"); no id is used
   twice; the new beats sit under their ten group headings; Spanish; an iPhone (nothing scrolls sideways). Port 9949. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9949);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const URL0="http://localhost:9949/music-drums.html#home";
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(opt, lang)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    if(lang) await p.addInitScript(l=>{ try{ localStorage.setItem("aog.lang", l); }catch(e){} }, lang);
    await p.goto(URL0); await p.waitForTimeout(1500);
    return {c, p, errs};
  };
  const {p, errs}=await open({viewport:{width:1280,height:900}});
  /* the list itself */
  const L=await p.evaluate(()=>{
    const all=STARTERS.map(x=>x.id).concat(PRESETS.map(x=>x.id)), ids=new Set(all);
    const bad=[];
    BEATS.forEach(x=>{
      const words=[x.en, x.es, x.about&&x.about.en, x.about&&x.about.es];
      if(!words.every(w=>typeof w==="string" && w.trim().length>2)) bad.push(x.id+": words");
      if(x.about && x.about.en===x.about.es) bad.push(x.id+": about not in Spanish");
      if(!BEAT_GROUPS[x.grp]) bad.push(x.id+": group");
      if(BANKS.indexOf(x.kit)<0) bad.push(x.id+": kit "+x.kit);
      if(!(x.bpm>=40 && x.bpm<=240)) bad.push(x.id+": tempo");
      if(SWINGS.indexOf(x.swing)<0) bad.push(x.id+": swing");
      const len=x.len||16;
      Object.keys(x.map).forEach(k=>{ const r=x.map[k];
        if(!VOICES.some(v=>v.id===k)) bad.push(x.id+": pad "+k);
        if(r.length!==16 || r.some(v=>[0,1,2,3].indexOf(v)<0) || r.slice(len).some(v=>v)) bad.push(x.id+": row "+k); });
      if(!Object.values(x.map).some(r=>r.some(v=>v))) bad.push(x.id+": empty");
    });
    const g={}; BEATS.forEach(x=>{ g[x.grp]=(g[x.grp]||0)+1; });
    return {n:BEATS.length, all:all.length, uniq:ids.size, inStarters:BEATS.every(x=>STARTERS.includes(x)), bad, groups:g,
      labels:new Set(STARTERS.concat(PRESETS).map(x=>x.en)).size, nLabels:STARTERS.length+PRESETS.length};
  });
  ok(L.n>=60, `${L.n} new beats (60 or more)`);
  ok(L.uniq===L.all && L.inStarters, `every id is used once (${L.all} beats in all)`);
  ok(L.labels===L.nLabels, "every beat has its own name in the menu");
  ok(L.bad.length===0, "every beat has English and Spanish words, a group, a kit, a tempo, a swing and rows on real pads "+L.bad.slice(0,6).join(" | "));
  ok(Object.keys(L.groups).length===10 && Object.values(L.groups).every(n=>n>=5), "ten groups, five beats or more in each: "+JSON.stringify(L.groups));
  /* the menu: a drop-down, the groups as headings */
  const sel=p.locator('.starter-row .aogdd-sel');
  ok(await sel.count()===1, "Start from a beat is a drop-down");
  const menu=await p.evaluate(()=>{ const s=document.querySelector(".starter-row").parentNode.querySelector(".aogdd-sel") || document.querySelector('.starter-row .aogdd-sel');
    return {groups:[...s.querySelectorAll("optgroup")].map(g=>({label:g.label, n:g.querySelectorAll("option").length})), opts:s.options.length}; });
  const want=await p.evaluate(()=>Object.keys(BEAT_GROUPS).map(k=>({label:BEAT_GROUPS[k].en, n:BEATS.filter(x=>x.grp===k).length})));
  const got=menu.groups.map(g=>g.label);
  ok(want.every(w=>menu.groups.some(g=>g.label===w.label && g.n===w.n)), "the menu shows each group as a heading with its beats: "+got.join(" · "));
  ok(got[0]==="Styles" && got[got.length-1]==="Classroom patterns" && new Set(got).size===got.length, "the style beats stay first, the classroom patterns last, each heading once");
  ok(menu.opts===1+L.nLabels, `every beat is in the menu (${menu.opts} choices)`);
  /* every beat: load, then play one bar */
  await p.evaluate(()=>{ window.__h=[]; const h=window.hit; window.hit=function(id,t,fromSeq){ if(fromSeq) __h.push({id, t, s:S.liveStep}); return h.apply(this,arguments); }; });
  const beats=await p.evaluate(()=>BEATS.map(x=>({id:x.id, en:x.en, kit:x.kit, bpm:x.bpm, len:x.len||16})));
  const loadBad=[], playBad=[], aboutBad=[];
  for(const x of beats){
    await sel.selectOption({label:x.en}); await p.waitForTimeout(150);
    const st=await p.evaluate(id=>{ const q=BEATS.find(y=>y.id===id);
      const same=VOICES.every(v=>{ const want=(q.map[v.id]||new Array(16).fill(0)), have=S.grid[v.id]; return want.every((n,i)=>(have[i]||0)===n); });
      const ab=document.querySelector(".starter-about");
      return {starter:S.starter, bank:S.bank, bpm:S.bpm, swing:S.swing, len:segLen(), same, about:ab?ab.textContent:"", want:q.about.en, sw:snapSwing(q.swing)}; }, x.id);
    if(!(st.starter===x.id && st.bank===x.kit && st.bpm===x.bpm && st.len===x.len && st.swing===st.sw && st.same)) loadBad.push(x.id+" "+JSON.stringify(st).slice(0,120));
    if(st.about!==st.want) aboutBad.push(x.id);
    await p.evaluate(()=>{ __h.length=0; start(); });
    const bar=x.len*60/x.bpm/4;
    await p.waitForFunction(n=>__h.length && ctx().currentTime>__h[0].t+n, bar+0.2, {timeout:8000}).catch(()=>{});
    await p.evaluate(()=>stop());
    const r=await p.evaluate(id=>{ const q=BEATS.find(y=>y.id===id), L=q.len||16, six=60/q.bpm/4, lean=(snapSwing(q.swing)-0.5)*six*4;
      /* the first pass of the bar (steps go up, then start again) */
      const first=[]; let last=-1; for(const h of __h){ if(h.s<last) break; last=h.s; first.push(h); }
      const want=[]; Object.keys(q.map).forEach(k=>{ q.map[k].slice(0,L).forEach((v,i)=>{ if(v && padOut(k)) want.push(i+":"+k); }); });
      const have=first.map(h=>h.s+":"+h.id);
      const sameHits=want.length===have.length && want.every(w=>have.includes(w));
      const at=s=>s*six+((s%4===2||s%4===3)?lean:0);
      const t0=first.length ? first[0].t-at(first[0].s) : 0;
      const off=first.reduce((m,h)=>Math.max(m, Math.abs(h.t-t0-at(h.s))), 0);
      return {sameHits, off:+off.toFixed(4), n:have.length, w:want.length, six:+S.sixteenth.toFixed(5), want6:+six.toFixed(5), miss:want.filter(w=>!have.includes(w)).slice(0,3)};
    }, x.id);
    if(!(r.sameHits && r.off<0.003 && Math.abs(r.six-r.want6)<1e-4)) playBad.push(x.id+" "+JSON.stringify(r));
  }
  ok(loadBad.length===0, `all ${beats.length} beats load from the menu: kit, tempo, swing, length and every box `+loadBad.slice(0,3).join(" | "));
  ok(aboutBad.length===0, "each beat says what it is, under the menu "+aboutBad.slice(0,5).join(" "));
  ok(playBad.length===0, `all ${beats.length} beats play one bar: every hit on its pad and step, at its tempo `+playBad.slice(0,3).join(" | "));
  /* a beat in three: 12 steps, and Put my beat back gives the old part back */
  await sel.selectOption({label:"Basic rock beat"}); await p.waitForTimeout(150);
  await sel.selectOption({label:"Waltz"}); await p.waitForTimeout(150);
  const w3=await p.evaluate(()=>({len:segLen(), st:S.starter}));
  await p.click("#undoBeat"); await p.waitForTimeout(200);
  const w4=await p.evaluate(()=>({len:segLen(), st:S.starter, k:S.grid.kick.join("")}));
  ok(w3.len===12 && w3.st==="waltz3" && w4.len===16 && w4.k==="2000000020100000", "a waltz is 12 steps; Put my beat back returns the rock beat at 16");
  /* the beats that were already here are unchanged */
  ok(await p.evaluate(()=>STARTERS[0].id==="boombap" && STARTERS[2].id==="trap" && STARTERS[2].bpm===140 && PRESETS[0].id==="four" && PRESETS.length===10 && STARTERS.findIndex(x=>x.id==="break70s")===17 && STARTERS[18]===BEATS[0]), "the earlier beats keep their places; the new ones come after them");
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  /* Spanish */
  { const {p:q, errs:e2}=await open({viewport:{width:1280,height:900}}, "es");
    const es=await q.evaluate(()=>{ const s=document.querySelector('.starter-row .aogdd-sel'); return {groups:[...s.querySelectorAll("optgroup")].map(g=>g.label), opts:[...s.options].map(o=>o.textContent)}; });
    const wantEs=await q.evaluate(()=>({g:Object.values(BEAT_GROUPS).map(x=>x.es), n:BEATS.map(x=>x.es)}));
    ok(wantEs.g.every(g=>es.groups.includes(g)) && wantEs.n.every(n=>es.opts.includes(n)), "in Spanish, the groups and every beat's name are in Spanish: "+es.groups.slice(1,5).join(" · "));
    await q.locator('.starter-row .aogdd-sel').selectOption({label:"Samba"}); await q.waitForTimeout(200);
    const ab=await q.evaluate(()=>document.querySelector(".starter-about").textContent);
    ok(/carnaval de Brasil/.test(ab), "and the line under the menu too: "+ab);
    ok(e2.length===0, "no page errors in Spanish "+e2.join(" | "));
  }
  /* an iPhone: nothing scrolls sideways, with the longest line showing */
  { const {p:q, errs:e3}=await open({...pw.devices["iPhone 13"]});
    const long=await q.evaluate(()=>BEATS.slice().sort((a,b)=>b.about.en.length-a.about.en.length)[0].en);
    await q.locator('.starter-row .aogdd-sel').selectOption({label:long}); await q.waitForTimeout(300);
    const m=await q.evaluate(()=>{ const s=document.querySelector('.starter-row .aogdd-sel').getBoundingClientRect(), a=document.querySelector(".starter-about").getBoundingClientRect();
      return {sw:document.documentElement.scrollWidth, iw:innerWidth, sel:s.right<=innerWidth+1, ab:a.right<=innerWidth+1 && a.width>0}; });
    ok(m.sw<=m.iw+1 && m.sel && m.ab, `iPhone: nothing scrolls sideways (${m.sw} of ${m.iw}), the menu and the line fit`);
    ok(e3.length===0, "no page errors on the iPhone "+e3.join(" | "));
  }
  /* AOG-SOLO-DRUMFEELS-V1: Solo mode's band, guitar and bass pages: its drum feels in a menu (the band's own beat first, as
     before), each plays its kick, snare and hi-hat on the right sixteenths, ids once, English and Spanish names */
  for(const [inst, opt] of [["guitar",{viewport:{width:1280,height:900}}],["bass",pw.devices["iPhone 13"]]]){
    const c=await b.newContext(opt); const q=await c.newPage(); const e4=[]; q.on("pageerror",e=>e4.push(e.message));
    await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await q.goto(`http://localhost:9949/music-${inst}.html`); await q.waitForTimeout(1200);
    await q.evaluate(()=>{ AOGSolo.setMode("solo"); S.key=9; S.minor=true; S.prog=[]; S.preset=""; S.bpm=120; buildNeck(); ctx(); });
    await q.waitForTimeout(300);
    const F=await q.evaluate(()=>{ const L=AOGSolo._t.DRUM_FEELS, sel=document.getElementById("soDrumSel");
      return {n:L.length, uniq:new Set(L.map(x=>x.id)).size, first:L[0].id, words:L.every(x=>x.en && x.es), opts:sel?sel.options.length:0, val:sel&&sel.value,
        rows:L.slice(1).every(x=>[x.k,x.s,x.h].every(r=>typeof r==="string" && r.length===16 && /^[Xxo.]+$/.test(r)))}; });
    ok(F.n>=15 && F.uniq===F.n && F.first==="auto" && F.words && F.rows && F.opts===F.n && F.val==="auto", `${inst}: the band's drum menu, ${F.n} feels (the band's own beat first), each id once, English and Spanish`);
    const bad=[];
    for(const id of await q.evaluate(()=>AOGSolo._t.DRUM_FEELS.slice(1).map(x=>x.id))){
      await q.selectOption("#soDrumSel", id);
      const r=await q.evaluate(async id=>{ const f=AOGSolo._t.DRUM_FEELS.find(x=>x.id===id), B=AOGSolo._t.BAND;
        await AOGSolo._t.bandStart(); await new Promise(r=>setTimeout(r, 700));
        const beat=B.barSec/4, sw=B.swing, got={kick:[], snare:[], hat:[]};
        B.log.forEach(e=>{ if(!got[e.p]) return; const x=(e.t-B.t0)/beat, bar=Math.floor((x+0.01)/4); if(bar!==0) return;
          let q4=Math.round(x*4); const lean=(sw-0.5); if(Math.abs(x*4-q4)>0.02){ q4=Math.round((x-lean)*4); } got[e.p].push(q4); });
        AOGSolo._t.bandStop();
        const want=r=>[...r].map((c,i)=>c!=="."?i:-1).filter(i=>i>=0).join(",");
        const line=document.getElementById("soBandLine").textContent;
        return {ok:want(f.k)===got.kick.join(",") && want(f.s)===got.snare.join(",") && want(f.h)===got.hat.join(","), feel:B.feel&&B.feel.id, sw:B.swing, want:f.sw||null, line:line.indexOf(f.en)>=0, got}; }, id);
      if(!(r.ok && r.feel===id && r.line && (r.want==null || r.sw===r.want))) bad.push(id+" "+JSON.stringify(r).slice(0,160));
    }
    ok(bad.length===0, `${inst}: every feel plays its kick, snare and hi-hat on its boxes, and the line names it `+bad.slice(0,2).join(" | "));
    await q.selectOption("#soDrumSel", "auto");
    const au=await q.evaluate(async()=>{ const B=AOGSolo._t.BAND; await AOGSolo._t.bandStart(); await new Promise(r=>setTimeout(r, 500)); const r={feel:B.feel, k:B.log.filter(e=>e.p==="kick").length, line:document.getElementById("soBandLine").textContent}; AOGSolo._t.bandStop(); return r; });
    ok(au.feel==null && au.k>0 && /made here/.test(au.line), `${inst}: the band's own beat plays as before: `+au.line);
    await q.evaluate(()=>document.getElementById("langBtn").click());
    await q.waitForTimeout(400);
    const es=await q.evaluate(()=>[...document.getElementById("soDrumSel").options].map(o=>o.textContent).slice(0,3).join(" · "));
    ok(/El ritmo propio/.test(es), `${inst}: in Spanish: `+es);
    ok(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), `${inst}: nothing scrolls sideways`);
    ok(e4.length===0, `${inst}: no page errors `+e4.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
  process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
