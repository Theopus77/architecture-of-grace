/* AOG-PIANO-SCALES-V1 (2026-10-05): the piano's Scale menu (154 scales and modes, 13 groups, from aog-scales.js) and its
   Any chord menus (45 kinds, from aog-chords.js), on an iPhone and an iPad: every scale marks exactly its keys (the home
   note and the blue note too), the marks follow the key and the mood, every kind of chord plays exactly its notes and
   lights them, Spanish, no page errors, nothing sideways. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9945);
let fails=0, passes=0; function ok(c,m){ if(c){ passes++; console.log("PASS "+m); } else { fails++; console.log("FAIL "+m); } }
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const dev of ["iPhone 13","iPad (gen 7)"]){
    const c=await b.newContext(pw.devices[dev]); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await c.addInitScript(()=>{ if(!sessionStorage.getItem("s")){ sessionStorage.setItem("s","1"); localStorage.clear(); localStorage.setItem("aog.lang","en");
      localStorage.setItem("aog.piano.v1", JSON.stringify({sound:"epwarm",key:0,minor:false,prog:[],preset:"",rhythm:"hold",bpm:90,era:0,vol:0.8})); } });
    const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.goto("http://localhost:9945/music-piano.html"); await p.waitForFunction(()=>window.AOGScales && window.AOGChords && document.querySelectorAll("#scaleSel option").length>100, null, {timeout:20000});
    await p.waitForTimeout(300);
    const D=dev+": ";
    // the two pickers, close to the keys
    const lay=await p.evaluate(()=>{ const r=id=>document.getElementById(id).getBoundingClientRect(), kb=r("kbd"), sc=r("scaleSel"), ap=r("anyPlay");
      return {there:["scaleSel","anyRoot","anyKind","anyPlay"].every(id=>{ const e=document.getElementById(id); return e && e.offsetWidth>0; }),
        gap:Math.round(sc.top-kb.bottom), sw:document.scrollingElement.scrollWidth, iw:innerWidth, btnH:Math.round(ap.height),
        fonts:["scaleSel","anyRoot","anyKind"].map(id=>parseFloat(getComputedStyle(document.getElementById(id)).fontSize))}; });
    ok(lay.there, D+"the Scale menu, the Root and Kind menus and the Play button are on the page");
    ok(lay.gap>=0 && lay.gap<200, D+"the Scale menu sits just under the keys ("+lay.gap+"px)");
    ok(lay.fonts.every(f=>f>=16) && lay.btnH>=44, D+"menus 16px or larger, the button easy to tap ("+lay.fonts.join(",")+"; "+lay.btnH+"px)");
    ok(lay.sw<=lay.iw, D+"nothing scrolls sideways ("+lay.sw+"/"+lay.iw+")");
    // off at first
    const off=await p.evaluate(()=>({v:document.getElementById("scaleSel").value, first:document.getElementById("scaleSel").options[0].text, marks:document.querySelectorAll("#kbd .sc-in").length, say:document.getElementById("scaleSay").textContent}));
    ok(off.v==="off" && off.first==="Off · no scale" && off.marks===0 && off.say==="", D+"Off is first and chosen; no marks, no line ("+JSON.stringify(off)+")");
    // the menu: 154 in 13 groups, in the library's order and words
    const menu=await p.evaluate(()=>{ const s=document.getElementById("scaleSel"), L=window.AOGScales;
      const groups=[...s.querySelectorAll("optgroup")];
      return {n:s.querySelectorAll("optgroup option").length, g:groups.length,
        same:groups.every((g,i)=>g.label===L.WORDS["sg_"+L.GROUPS[i][0]].en && [...g.querySelectorAll("option")].map(o=>o.value).join()===L.GROUPS[i][1].join()
          && [...g.querySelectorAll("option")].every(o=>o.text===L.WORDS["sc_"+o.value].en))}; });
    ok(menu.n===154 && menu.g===13 && menu.same, D+"154 scales in 13 groups, named from the library ("+menu.n+" in "+menu.g+")");
    // every scale marks exactly its keys
    let bad=[];
    const ids=await p.evaluate(()=>[].concat(...window.AOGScales.GROUPS.map(g=>g[1])));
    for(const id of ids){
      await p.selectOption("#scaleSel", id);
      const r=await p.evaluate(id=>{ const sc=window.AOGScales.SCALES[id], key=S.key, want=new Set(sc.iv.map(i=>(key+i)%12)), blue=sc.blue!=null?(key+sc.blue)%12:-1;
        let wrong=0, home=0, bl=0;
        document.querySelectorAll("#kbd [data-m]").forEach(el=>{ const pc=(+el.dataset.m)%12, on=el.classList.contains("sc-in");
          if(on!==want.has(pc)) wrong++;
          if(el.classList.contains("sc-home")!==(pc===key)) wrong++; else if(pc===key) home++;
          if(el.classList.contains("sc-blue")!==(pc===blue)) wrong++; else if(pc===blue) bl++;
          const dot=el.querySelector(".sd"); if(!dot || (getComputedStyle(dot).display==="none")===on) wrong++; });
        return {wrong, home, bl, blue, say:(document.getElementById("scaleName")||{}).textContent||""}; }, id);
      const want=await p.evaluate(id=>"C "+window.AOGScales.WORDS["nm_"+id].en+" scale", id);
      const sayWant=want.replace(/^./,c=>c.toUpperCase());
      if(r.wrong || !r.home || (r.blue>=0 && !r.bl) || r.say!==sayWant) bad.push(id+":"+JSON.stringify(r));
    }
    ok(bad.length===0, D+"each of the "+ids.length+" scales marks exactly its keys, the home note and the blue note, and names itself"+(bad.length?" — wrong: "+bad.slice(0,4).join(" | "):""));
    // marks stay clear of the letter
    await p.selectOption("#scaleSel","dorian");
    const clear=await p.evaluate(()=>{ let hit=0; document.querySelectorAll("#kbd .wk.sc-in").forEach(el=>{ const d=el.querySelector(".sd").getBoundingClientRect(), n=el.querySelector(".nm").getBoundingClientRect();
      if(d.bottom>n.top+0.5 && d.top<n.bottom) hit++; }); return {hit, say:document.getElementById("scaleName").textContent}; });
    ok(clear.hit===0 && clear.say==="C Dorian scale", D+"the dots sit above the letters, never on them; the line says "+clear.say);
    // follows the key
    await p.selectOption("#keySel","2"); await p.waitForTimeout(60);
    const kd=await p.evaluate(()=>({pcs:[...new Set([...document.querySelectorAll("#kbd .sc-in")].map(e=>(+e.dataset.m)%12))].sort((a,b)=>a-b).join(), home:[...document.querySelectorAll("#kbd .sc-home")].every(e=>(+e.dataset.m)%12===2), say:document.getElementById("scaleName").textContent}));
    ok(kd.pcs==="0,2,4,5,7,9,11" && kd.home && kd.say==="D Dorian scale", D+"key of D: the marks move to D Dorian ("+kd.pcs+")");
    ok(await p.evaluate(()=>document.getElementById("anyRoot").value==="2"), D+"until a root is picked, the Any chord root follows the key (D)");
    // follows the mood, one choice for each
    await p.click("#minBtn"); await p.waitForTimeout(60);
    const mn=await p.evaluate(()=>({v:document.getElementById("scaleSel").value, n:document.querySelectorAll("#kbd .sc-in").length}));
    ok(mn.v==="off" && mn.n===0, D+"minor has its own choice (Off so far): no marks");
    await p.selectOption("#scaleSel","blues"); await p.waitForTimeout(40);
    const bl=await p.evaluate(()=>({pcs:[...new Set([...document.querySelectorAll("#kbd .sc-in")].map(e=>(+e.dataset.m)%12))].sort((a,b)=>a-b).join(), blue:[...new Set([...document.querySelectorAll("#kbd .sc-blue")].map(e=>(+e.dataset.m)%12))].join(), lg:document.getElementById("scaleSay").textContent}));
    ok(bl.pcs==="0,2,5,7,8,9" && bl.blue==="8" && /blue note/.test(bl.lg), D+"D minor blues: D F G A♭ A C, A♭ is the blue note ("+bl.pcs+"; "+bl.lg+")");
    await p.click("#majBtn"); await p.waitForTimeout(60);
    ok(await p.evaluate(()=>document.getElementById("scaleSel").value==="dorian" && document.querySelectorAll("#kbd .sc-blue").length===0), D+"back to major: Dorian comes back");
    // kept after a reload
    await p.reload(); await p.waitForFunction(()=>window.AOGScales && document.querySelectorAll("#scaleSel option").length>100); await p.waitForTimeout(200);
    ok(await p.evaluate(()=>document.getElementById("scaleSel").value==="dorian" && document.querySelectorAll("#kbd .sc-in").length>0 && JSON.parse(localStorage.getItem("aog.piano.scales.v1")).min==="blues"), D+"the choices are kept for next time (major: Dorian, minor: blues)");
    // octave buttons keep the marks
    await p.click("#upBtn"); await p.waitForTimeout(60);
    ok(await p.evaluate(()=>document.querySelectorAll("#kbd .sc-in").length>0), D+"moving up an octave keeps the marks");
    await p.click("#downBtn"); await p.selectOption("#keySel","0"); await p.waitForTimeout(60);
    // any chord: menus
    const cm=await p.evaluate(()=>{ const k=document.getElementById("anyKind"), r=document.getElementById("anyRoot"), L=window.AOGChords;
      return {n:k.querySelectorAll("optgroup option").length, g:k.querySelectorAll("optgroup").length, roots:[...r.options].map(o=>o.text).join(" "),
        same:[...k.querySelectorAll("optgroup")].every((g,i)=>g.label===L.group(L.GROUPS[i][0],"en"))}; });
    ok(cm.n===45 && cm.g===5 && cm.same && cm.roots==="C D♭ D E♭ E F F♯ G A♭ A B♭ B", D+"45 kinds in 5 groups; 12 roots: "+cm.roots);
    // every kind, a few roots: exactly its notes, lit on the keys
    bad=[]; let n=0;
    const kinds=await p.evaluate(()=>window.AOGChords.ids());
    for(const root of [0,5,10]){
      await p.selectOption("#anyRoot", String(root));
      for(const id of kinds){
        await p.selectOption("#anyKind", id);
        if(dev.startsWith("iPhone")) await p.tap("#anyPlay"); else await p.click("#anyPlay");
        await p.waitForTimeout(30);
        const r=await p.evaluate(([root,id])=>{ const L=window.AOGChords, want=L.pcs(root,id).slice().sort((a,b)=>a-b).join();
          const ms=[...LIVE.entries()].filter(([k,v])=>k[0]==="p"&&v.down).map(([k])=>+k.slice(1)).sort((a,b)=>a-b);
          const got=[...new Set(ms.map(m=>m%12))].sort((a,b)=>a-b).join(), span=ms[ms.length-1]-ms[0];
          let lit=0, wrong=0; document.querySelectorAll("#kbd [data-m]").forEach(el=>{ const m=+el.dataset.m, d=el.classList.contains("down");
            if(d!==ms.includes(m)) wrong++; else if(d) lit++; });
          const vis=ms.filter(m=>m>=KB.lo&&m<=KB.hi).length;
          return {want, got, span, lo:ms[0], lit, vis, wrong, line:document.getElementById("anyLine").textContent}; }, [root,id]);
        n++;
        if(r.want!==r.got || r.span>19 || r.lo<48 || r.lo>71 || r.wrong || r.lit!==r.vis || !r.line) bad.push(root+" "+id+":"+JSON.stringify(r));
      }
    }
    ok(bad.length===0, D+n+" chords (45 kinds × 3 roots) play exactly their notes, within an octave and a half, and light those keys"+(bad.length?" — wrong: "+bad.slice(0,4).join(" | "):""));
    await p.waitForTimeout(900);
    ok(await p.evaluate(()=>![...LIVE.keys()].some(k=>k[0]==="p") && document.querySelectorAll("#kbd .down").length===0 && !padHeld.any), D+"a moment after the tap, the chord stops and the keys go dark");
    const ln=await p.evaluate(()=>document.getElementById("anyLine").textContent);
    ok(ln==="B♭13♭9: B♭ · D · A♭ · B · G", D+"the line names the chord and its notes: "+ln);
    // the six pads are still there and still play
    ok(await p.evaluate(()=>document.querySelectorAll("#pads .pad").length===6 && document.querySelectorAll("#chordStrip .cs").length===6), D+"the six chord pads and the chord strip are as they were");
    // Spanish
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(100);
    const es=await p.evaluate(()=>{ const L=window.AOGScales, s=document.getElementById("scaleSel");
      return {g:s.querySelector("optgroup").label===L.WORDS["sg_"+L.GROUPS[0][0]].es, o:s.options[1].text===L.WORDS["sc_"+L.GROUPS[0][1][0]].es, off:s.options[0].text,
        say:document.getElementById("scaleName").textContent, play:document.getElementById("anyPlay").textContent,
        kg:document.getElementById("anyKind").querySelector("optgroup").label, root:document.getElementById("anyRoot").options[2].text,
        labs:[...document.querySelectorAll('[data-t="scaleLab"],[data-t="anyRootLab"],[data-t="anyKindLab"]')].map(e=>e.textContent).join(" | ")}; });
    ok(es.g && es.o && es.off==="Apagada · sin escala" && es.say==="Escala dórica de Do" && es.play==="▶ Tocar este acorde" && es.kg==="Acordes de tres notas" && es.root==="Re"
      && es.labs==="Mostrar una escala en las teclas | Cualquier acorde · raíz | Tipo de acorde", D+"en español: "+JSON.stringify(es));
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(60);
    const sw=await p.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth}));
    ok(sw.sw<=sw.iw, D+"still nothing sideways with a scale on ("+sw.sw+"/"+sw.iw+")");
    ok(errs.length===0, D+"no page errors "+errs.join(" | "));
    await c.close();
  }
  await b.close(); srv.close();
  console.log(`${passes} passed, ${fails} failed`); process.exitCode=fails?1:0;
})().catch(e=>{ console.log("CRASH "+e.message); srv.close(); process.exit(1); });
