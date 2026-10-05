/* The Band, scales and any chord (AOG-BAND-SCALES-V1), on an iPhone and an iPad, upright and sideways. Port 9947.
   The Scale menu: Off first and by default, all 154 scales in 13 groups; each marks exactly the notes whose pitch class is
   in the scale, the home note ringed and the blue note dark blue, on the keys, and sideways on the keys, the bars and the
   harp's strings (the harp tuned to the scale); a mark never covers a note's letter; the key and the mood move the marks,
   each mood keeps its own choice, a reload remembers it. Any chord: 12 roots, 45 kinds in 5 groups; every kind on a few
   roots plays exactly its notes and lights them gold; a section and the timpani too. Spanish in Spanish; no page errors;
   nothing scrolls sideways. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9947);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const URL0="http://localhost:9947/music-band.html";
/* in the page: every scale picked through the menu in turn, each checked against the library on whatever #kbd shows now */
const SWEEP=(sel)=>{
  const s=document.getElementById(sel), bad=[]; let n=0, keys=0, homes=0, blues=0;
  const ids=[].concat(...AOGScales.GROUPS.map(g=>g[1]));
  for(const id of ids){
    s.value=id; s.dispatchEvent(new Event("change"));
    const sc=AOGScales.SCALES[id], pcs=new Set(sc.iv.map(i=>(S.key+i)%12)), blue=sc.blue!=null?(S.key+sc.blue)%12:-1;
    const els=[...document.querySelectorAll("#kbd [data-m]")];
    els.forEach(el=>{ const pc=(+el.getAttribute("data-m"))%12, want=pcs.has(pc);
      const has=el.classList.contains("sc"), h=el.classList.contains("sc-home"), b=el.classList.contains("sc-blue");
      const dot=el.querySelector(".scd"), shown=dot && getComputedStyle(dot).display!=="none";
      if(has!==want || !!shown!==want || h!==(want && pc===S.key) || b!==(want && pc===blue)) bad.push(id+"@"+el.getAttribute("data-m"));
      if(has){ keys++; if(h) homes++; if(b) blues++; } });
    if(els.length===0) bad.push(id+": no notes");
    n++;
  }
  return {n, keys, homes, blues, bad:bad.slice(0,6), nbad:bad.length};
};
/* the dot sits apart from the letter on every marked note */
const APART=()=>{ let n=0; const over=[];
  document.querySelectorAll("#kbd .sc").forEach(el=>{ const d=el.querySelector(".scd"), t=el.querySelector(".nm"); if(!d || !t || !t.textContent.trim()) return;
    const a=d.getBoundingClientRect(), b=t.getBoundingClientRect(); n++;
    if(a.width<8 || (a.right>b.left && a.left<b.right && a.bottom>b.top && a.top<b.bottom)) over.push(el.getAttribute("data-m")); });
  return {n, over}; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const errs=[];
  const open=async(opt, label)=>{
    const c=await b.newContext(opt); const p=await c.newPage();
    p.on("pageerror",e=>errs.push(label+": "+e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push(label+" console: "+m.text()); });
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(URL0); await p.waitForTimeout(900);
    return {c, p};
  };
  for(const [dev, opt] of [["iPhone",pw.devices["iPhone 13"]],["iPad",pw.devices["iPad (gen 7)"]]]){
    console.log("== "+dev+" upright");
    const {c, p}=await open(opt, dev);
    /* 1. the pickers */
    const ui=await p.evaluate(()=>{ const s=document.getElementById("scaleSel"), r=document.getElementById("anyRoot"), k=document.getElementById("anyKind"), vis=el=>!!el && el.getBoundingClientRect().width>0;
      return {opts:s.options.length, first:s.options[0].value, firstT:s.options[0].textContent, val:s.value, groups:s.querySelectorAll("optgroup").length,
        inGroups:s.querySelectorAll("optgroup option").length, vis:vis(s), say:document.getElementById("scaleSay").textContent,
        roots:r.options.length, kinds:k.options.length, kgroups:k.querySelectorAll("optgroup").length, play:document.getElementById("anyPlay").textContent, anyVis:vis(r)&&vis(k)&&vis(document.getElementById("anyPlay")),
        marks:document.querySelectorAll("#kbd .sc").length, size:parseFloat(getComputedStyle(s).fontSize), kbd:document.getElementById("kbd").getBoundingClientRect().top, row:s.getBoundingClientRect().top}; });
    ok(ui.vis && ui.opts===155 && ui.first==="" && ui.firstT==="Off" && ui.val==="" && ui.groups===13 && ui.inGroups===154, `the Scale menu: Off first and picked, 154 scales in ${ui.groups} groups`);
    ok(ui.marks===0 && /Pick a scale/.test(ui.say), "Off: no marks on the keys; the line: "+ui.say);
    ok(ui.row<ui.kbd && ui.size>=16, `the menu sits over the keys, ${ui.size}px text`);
    ok(ui.anyVis && ui.roots===12 && ui.kinds===45 && ui.kgroups===5 && ui.play==="▶ Play the chord", `Any chord: ${ui.roots} roots, ${ui.kinds} kinds in ${ui.kgroups} groups, "${ui.play}"`);
    /* 2. every scale, on the keys */
    let sw=await p.evaluate(SWEEP, "scaleSel");
    ok(sw.n===154 && sw.nbad===0 && sw.homes>0 && sw.blues>0, `all ${sw.n} scales mark exactly their notes on the keys (${sw.keys} marks, ${sw.homes} home, ${sw.blues} blue)`+(sw.nbad?" bad: "+sw.bad.join(" "):""));
    /* 3. a named scale, its line, the dots apart from the letters */
    await p.evaluate(()=>{ const k=document.getElementById("keySel"); k.value="2"; k.onchange(); });
    await p.selectOption("#scaleSel","dorian");
    const d=await p.evaluate(()=>({say:document.getElementById("scaleSay").textContent, pcs:[...new Set([...document.querySelectorAll("#kbd .sc")].map(e=>+e.getAttribute("data-m")%12))].sort((a,b)=>a-b),
      home:[...document.querySelectorAll("#kbd .sc-home")].map(e=>+e.getAttribute("data-m")%12)}));
    ok(/^D Dorian scale/.test(d.say) && /D, the home note/.test(d.say) && JSON.stringify(d.pcs)==="[0,2,4,5,7,9,11]" && d.home.every(x=>x===2) && d.home.length>0, "D Dorian: C D E F G A B marked, D ringed; the line: "+d.say);
    const ap=await p.evaluate(APART); ok(ap.n>0 && ap.over.length===0, `the dot never covers the letter (${ap.n} marked keys with a letter)`);
    /* the key moves the marks */
    await p.evaluate(()=>{ const k=document.getElementById("keySel"); k.value="7"; k.onchange(); });
    const g=await p.evaluate(()=>({say:document.getElementById("scaleSay").textContent, pcs:[...new Set([...document.querySelectorAll("#kbd .sc")].map(e=>+e.getAttribute("data-m")%12))].sort((a,b)=>a-b)}));
    ok(/^G Dorian/.test(g.say) && JSON.stringify(g.pcs)==="[0,2,4,5,7,9,10]", "the key to G: the marks move to G Dorian: "+g.pcs.join(" "));
    /* the mood: its own choice, Off at first; then each mood keeps its own */
    await p.click("#minBtn");
    const m1=await p.evaluate(()=>({v:document.getElementById("scaleSel").value, n:document.querySelectorAll("#kbd .sc").length}));
    await p.selectOption("#scaleSel","blues");
    const m2=await p.evaluate(()=>({say:document.getElementById("scaleSay").textContent, pcs:[...new Set([...document.querySelectorAll("#kbd .sc")].map(e=>+e.getAttribute("data-m")%12))].sort((a,b)=>a-b),
      blue:[...new Set([...document.querySelectorAll("#kbd .sc-blue")].map(e=>+e.getAttribute("data-m")%12))]}));
    ok(m1.v==="" && m1.n===0, "minor: its own choice, Off at first, no marks");
    ok(/^G blues scale/.test(m2.say) && /the blue note/.test(m2.say) && JSON.stringify(m2.pcs)==="[0,1,2,5,7,10]" && JSON.stringify(m2.blue)==="[1]", "G minor, blues: G B♭ C D♭ D F marked, D♭ the blue note: "+m2.say);
    await p.click("#majBtn");
    const m3=await p.evaluate(()=>document.getElementById("scaleSel").value);
    ok(m3==="dorian", "back to major: Dorian again");
    await p.reload(); await p.waitForTimeout(900);
    const rl=await p.evaluate(()=>({v:document.getElementById("scaleSel").value, n:document.querySelectorAll("#kbd .sc").length, minor:S.minor}));
    ok(rl.v==="dorian" && rl.n>0 && !rl.minor, "a reload remembers the major mood's scale");
    /* 4. Spanish */
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(100);
    const es=await p.evaluate(()=>({lab:document.querySelector('[data-t="scaleLab"]').textContent, off:document.getElementById("scaleSel").options[0].textContent,
      g:document.querySelector("#scaleSel optgroup").label, say:document.getElementById("scaleSay").textContent, any:document.querySelector('[data-t="anyH"]').textContent,
      kind:document.querySelector('[data-t="anyKind"]').textContent, root:document.querySelector('[data-t="anyRoot"]').textContent, play:document.getElementById("anyPlay").textContent,
      kg:document.querySelector("#anyKind optgroup").label, k0:document.getElementById("anyKind").options[0].textContent, r0:document.getElementById("anyRoot").options[0].textContent,
      line:document.getElementById("anyLine").textContent}));
    ok(es.lab==="Escala" && es.off==="Apagada" && es.g==="Pentatónicas y blues" && /^Escala dórica de Sol/.test(es.say) && /Sol, la nota casa/.test(es.say), "Spanish: the menu and the line: "+es.say);
    ok(es.any==="Cualquier acorde" && es.root==="Raíz" && es.kind==="Tipo" && es.play==="▶ Tocar el acorde" && es.kg==="Acordes de tres notas" && es.k0==="Mayor · brillante" && es.r0==="Do", "Spanish: Any chord: "+[es.any,es.root,es.kind,es.play,es.k0,es.line].join(" | "));
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(100);
    /* 5. any chord: every kind on three roots, on the trumpet */
    await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:60000}).catch(()=>{});
    await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,inst,m,v,when,art){ const r=mv.apply(this,arguments); if(cx===ac) window.__v.push({inst, m, real:!!(r&&r.natural)}); return r; }; });
    const run=async(sound, roots, exact)=>{
      await p.selectOption("#soundSel", sound); await p.waitForFunction(id=>soundReady(id), sound, {timeout:90000}).catch(()=>{});
      const bad=[]; let n=0, lit=0;
      for(const r of roots){ await p.selectOption("#anyRoot", String(r));
        for(const k of await p.evaluate(()=>AOGChords.ids())){
          await p.selectOption("#anyKind", k);
          await p.evaluate("__v=[]"); await p.click("#anyPlay");
          const res=await p.evaluate(([r,k])=>{ const want=AOGChords.pcs(r,k).sort((a,b)=>a-b), got=[...new Set(__v.map(x=>x.m%12))].sort((a,b)=>a-b);
            const live=[]; LIVE.forEach((vc,key)=>{ if(vc.down && key[0]==="a") live.push(vc.m); });
            const down=[...document.querySelectorAll("#kbd .down")].map(e=>+e.getAttribute("data-m"));
            const inView=live.filter(m=>document.querySelector(`#kbd [data-m="${m}"]`));
            const line=document.getElementById("anyLine").textContent;
            anyRelease();
            return {want, got, real:__v.every(x=>x.real), litOk:inView.every(m=>down.indexOf(m)>=0) && down.every(m=>want.indexOf(m%12)>=0), lit:down.length, line, held:live.length}; }, [r,k]);
          n++; lit+=res.lit;
          const good=(exact ? JSON.stringify(res.want)===JSON.stringify(res.got) : res.got.length>0 && res.got.every(x=>res.want.indexOf(x)>=0)) && res.real && res.litOk && res.held>0 && res.line.indexOf(":")>0;
          if(!good) bad.push(`${r}/${k}: want ${res.want} got ${res.got} lit ${res.litOk}`);
        } }
      return {n, lit, bad};
    };
    let ar=await run("trumpet", dev==="iPhone" ? [0,3,8] : [1,6,11], true);
    ok(ar.n===135 && ar.bad.length===0 && ar.lit>0, `trumpet: all 45 kinds on three roots play exactly their notes and light them (${ar.n} chords, ${ar.lit} keys lit)`+(ar.bad.length?" bad: "+ar.bad.slice(0,4).join("; "):""));
    if(dev==="iPad"){
      ar=await run("brass", [2], true);
      ok(ar.n===45 && ar.bad.length===0, `the brass section: all 45 kinds on D play exactly their notes (${ar.n})`+(ar.bad.length?" bad: "+ar.bad.slice(0,4).join("; "):""));
      ar=await run("timpani", [9], false);
      ok(ar.n===45 && ar.bad.length===0, `the timpani: the root and the chord's own fifth, never a note outside the chord (${ar.n})`+(ar.bad.length?" bad: "+ar.bad.slice(0,4).join("; "):""));
    }
    /* the line names the chord and its notes */
    await p.selectOption("#anyRoot","3"); await p.selectOption("#anyKind","m7b5");
    ok(/^E♭m7♭5: E♭ G♭ A B♭|^D♯m7♭5: D♯ F♯ A C♯/.test(await p.textContent("#anyLine")), "the line: "+await p.textContent("#anyLine"));
    /* 6. nothing scrolls sideways */
    const sc=await p.evaluate(()=>({sw:document.documentElement.scrollWidth, iw:innerWidth}));
    ok(sc.sw<=sc.iw, `nothing scrolls sideways (${sc.sw} in ${sc.iw})`);
    await c.close();
  }
  /* 7. sideways: the keys, the bars, the harp */
  for(const [dev, vp] of [["iPhone sideways",{width:844,height:390}],["iPad sideways",{width:1180,height:820}]]){
    console.log("== "+dev);
    const {c, p}=await open({viewport:vp, isMobile:true, hasTouch:true, deviceScaleFactor:2}, dev);
    /* AOG-PLAY-TABLET-V1: an iPad starts on the page; Play on the whole screen opens the sideways view */
    if(dev==="iPad sideways"){ ok(await p.evaluate("!BP.on"), "an iPad held sideways starts on the page"); await p.evaluate(()=>{ if(typeof GUARD!=="undefined"){ GUARD.last=0; GUARD.down.clear(); } document.getElementById("bpBig").click(); }); await p.waitForTimeout(400); }
    await p.evaluate(()=>{ const k=document.getElementById("keySel"); k.value="9"; k.onchange(); });
    const pick=(id)=>p.evaluate(id=>{ const s=document.getElementById("bpSound"); s.value=id; s.onchange(); }, id);
    const ds=await p.evaluate(()=>{ const s=document.getElementById("bpScale"); return {on:BP.on, n:s.options.length, g:s.querySelectorAll("optgroup").length, v:s.value}; });
    ok(ds.on && ds.n===155 && ds.g===13 && ds.v==="", "the menu in the sideways view has the Scale menu too, Off");
    for(const [snd, mode] of [["trumpet","keys"],["marimba","bars"],["glockenspiel","bars"],["harp","harp"]]){
      await pick(snd); await p.waitForTimeout(100);
      const m=await p.evaluate(()=>bpMode());
      const r=await p.evaluate(SWEEP, "bpScale");
      ok(m===mode && r.n===154 && r.nbad===0 && r.homes>0 && r.blues>0, `${snd} (${m}): all ${r.n} scales mark exactly their notes (${r.keys} marks)`+(r.nbad?" bad: "+r.bad.join(" "):""));
      await p.evaluate(()=>{ const s=document.getElementById("bpScale"); s.value="mixo"; s.dispatchEvent(new Event("change")); });
      const ap=await p.evaluate(APART); ok(ap.n>0 && ap.over.length===0, `${snd}: the dot never covers the letter (${ap.n})`);
      if(mode==="harp"){
        const h=await p.evaluate(()=>({pcs:[...new Set([...document.querySelectorAll("#kbd .hs")].map(e=>+e.getAttribute("data-m")%12))].sort((a,b)=>a-b),
          all:[...document.querySelectorAll("#kbd .hs")].every(e=>e.classList.contains("sc")), hint:document.getElementById("bpHint").textContent}));
        ok(JSON.stringify(h.pcs)==="[1,2,4,6,7,9,11]" && h.all && /A Mixolydian scale/.test(h.hint), "the harp is tuned to A Mixolydian, every string marked: "+h.hint);
        await p.evaluate(()=>{ const s=document.getElementById("bpScale"); s.value="chromatic"in AOGScales.SCALES?"chromatic":"whole"; s.dispatchEvent(new Event("change")); });
        await p.evaluate(()=>document.getElementById("minBtn").click());
        const hm=await p.evaluate(()=>({pcs:[...new Set([...document.querySelectorAll("#kbd .hs")].map(e=>+e.getAttribute("data-m")%12))].sort((a,b)=>a-b), n:document.querySelectorAll("#kbd .sc").length}));
        ok(JSON.stringify(hm.pcs)==="[0,2,4,5,7,9,11]" && hm.n===0, "minor, Off: the harp goes back to A minor, no marks");
        await p.evaluate(()=>document.getElementById("majBtn").click());
      }
    }
    const sc=await p.evaluate(()=>({sw:document.documentElement.scrollWidth, iw:innerWidth}));
    ok(sc.sw<=sc.iw, `nothing scrolls sideways (${sc.sw} in ${sc.iw})`);
    await c.close();
  }
  ok(errs.length===0, "no page errors: "+errs.slice(0,5).join(" | "));
  await b.close(); srv.close(); console.log(fails?`${fails} FAILED`:"ALL PASS"); process.exit(fails?1:0);
})();
