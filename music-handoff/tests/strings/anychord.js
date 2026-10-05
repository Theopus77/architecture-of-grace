/* AOG-ANYCHORD-V1 — the Any chord menu by the neck, on the guitar and the bass, on an iPhone and an iPad: there and close
   to the neck; 12 roots and the library's 45 kinds in 5 groups; on the guitar every kind on every root has a shape a hand
   can play (one note a string, at most four frets apart, every note in the chord, and the root, the third or the sus
   note, the seventh and the chord's own colour; the 5th, then the 9th, then the 11th may be left out); choosing a chord
   lights it on the neck and plays only its notes; the words in Spanish; no page errors; nothing scrolls sideways. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9943);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const TUN={guitar:[40,45,50,55,59,64], bass:[28,33,38,43]};
/* the notes a guitar shape must have, from the rule (not from the page): every step of the chord, but the 5th may go (unless
   it is the power chord's only other note), the 9th under an 11th or a 13th, and the 11th under a 13th */
function needed(iv){ const top=Math.max(...iv); return iv.filter(i=>!((i===7 && iv.length>2) || (i===14 && top>14) || (i===17 && top>17))).map(i=>i%12); }
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const inst of ["guitar","bass"]) for(const dev of ["iPhone 13","iPad (gen 7)"]){
    console.log(`== ${inst} · ${dev}`);
    const c=await b.newContext(pw.devices[dev]); const p=await c.newPage();
    const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.addInitScript(()=>{ try{ if(!sessionStorage.getItem("ac.set")){ localStorage.setItem("aog.lang","en"); sessionStorage.setItem("ac.set","1"); } }catch(e){} });
    await p.goto(`http://localhost:9943/music-${inst}.html`); await p.waitForTimeout(1200);
    const lib=await p.evaluate(()=>({kinds:Object.fromEntries(Object.entries(AOGChords.KINDS).map(([k,v])=>[k,v.iv])), groups:AOGChords.GROUPS,
      gen:AOGChords.GROUPS.map(g=>AOGChords.group(g[0],"en")), ges:AOGChords.GROUPS.map(g=>AOGChords.group(g[0],"es")),
      len:AOGChords.ids().map(id=>AOGChords.label(id,"en")), les:AOGChords.ids().map(id=>AOGChords.label(id,"es")), sym:AOGChords.ids().map(id=>AOGChords.sym(id)), ids:AOGChords.ids()}));

    /* 1. the menu is there, by the neck */
    const ui=await p.evaluate(()=>{
      const row=document.getElementById("anyRow"), neck=document.getElementById("neck"), strip=document.getElementById("chordStrip"), th=document.querySelector(".nk-theory");
      const r=row.getBoundingClientRect(), n=neck.getBoundingClientRect();
      return {roots:[...document.querySelectorAll("#anyRoot option")].map(o=>o.textContent), groups:[...document.querySelectorAll("#anyKind optgroup")].map(g=>g.label),
        kinds:[...document.querySelectorAll("#anyKind option")].map(o=>({v:o.value, t:o.textContent, g:o.parentNode.label})),
        order:!!(th.compareDocumentPosition(row)&Node.DOCUMENT_POSITION_FOLLOWING) && !!(row.compareDocumentPosition(strip)&Node.DOCUMENT_POSITION_FOLLOWING),
        sameBlock:row.closest(".blk")===neck.closest(".blk"), gap:Math.round(n.top-r.bottom), right:Math.round(r.right), w:innerWidth,
        btn:document.getElementById("anyBtn").textContent, lab:[...row.querySelectorAll(".plab")].map(x=>x.textContent).join(" | ") };
    });
    ok(ui.order && ui.sameBlock, "the Any chord row sits under the pattern and its line, above the chord strip and the neck");
    ok(ui.gap>=0 && ui.gap<420, `the neck starts ${ui.gap}px under it`);
    ok(ui.right<=ui.w, `the row fits the screen (${ui.right} of ${ui.w}px)`);
    ok(ui.roots.length===12 && ui.roots.join(" ")==="C D♭ D E♭ E F F♯ G A♭ A B♭ B", "12 roots: "+ui.roots.join(" "));
    ok(ui.groups.length===5 && ui.groups.join("|")===lib.gen.join("|"), "5 groups: "+ui.groups.join(" | "));
    ok(ui.kinds.length===45 && ui.kinds.map(k=>k.v).join()===lib.ids.join(), `45 kinds, in the library's order (${ui.kinds.length})`);
    const wrongText=ui.kinds.filter((k,i)=>k.t!==(lib.sym[i]?lib.sym[i]+" · ":"")+lib.len[i]);
    ok(!wrongText.length && ui.kinds.find(k=>k.v==="m7b5").t.startsWith("m7♭5 · Half-diminished"), "each kind reads its symbol and its name, e.g. "+ui.kinds.find(k=>k.v==="m7b5").t);
    ok(ui.kinds.every(k=>lib.groups.find(g=>g[1].includes(k.v)) && ui.groups.indexOf(k.g)===lib.groups.findIndex(g=>g[1].includes(k.v))), "each kind sits in its own group");
    ok(/Any chord/.test(ui.lab) && /Play this chord/.test(ui.btn), `plain words: ${ui.lab} · ${ui.btn}`);

    /* 2. every kind on every root (the guitar: a shape a hand can play; the bass: every note in one place) */
    for(const start of [1, 9]){
      const all=await p.evaluate(([start, ids])=>{ const out=[], keep=[S.fret0, S.key];
        for(const key of [0, 5]) for(const id of ids) for(let r=0; r<12; r++){ S.key=key; S.fret0=start; ANY.root=r; ANY.id=id;
          const c=anyChord(), f0=anyPlace(c), n=NECK.n;
          out.push({id, r, key, f0, n, shp:GTR?shapeFor(c).slice():null, bass:GTR?null:anyBassNotes(c)}); }
        [S.fret0, S.key]=keep; ANY.root=null; ANY.id="maj"; return out; }, [start, lib.ids]);
      const bad=[];
      all.forEach(x=>{ const iv=lib.kinds[x.id], pcs=iv.map(i=>(x.r+i)%12), lo=x.f0, hi=x.f0+x.n-1, why=[];
        const reach=f=>f===0 ? lo<=2 : (f>=lo && f<=hi);
        if(inst==="guitar"){
          if(!Array.isArray(x.shp) || x.shp.length!==6 || !x.shp.every(f=>Number.isInteger(f) && f>=-1)) why.push("not one fret (or none) a string");
          const on=x.shp.map((f,s)=>f>=0?{s,f,m:TUN.guitar[s]+f}:null).filter(Boolean), fr=on.filter(o=>o.f>0).map(o=>o.f);
          if(on.length<3) why.push("fewer than 3 strings");
          if(fr.length && Math.max(...fr)-Math.min(...fr)>4) why.push("more than four frets apart");
          if(on.some(o=>!reach(o.f))) why.push("a note off the frets on screen");
          if(on.some(o=>pcs.indexOf(o.m%12)<0)) why.push("a note not in the chord");
          const have=new Set(on.map(o=>((o.m-x.r)%12+12)%12));
          needed(iv).forEach(i=>{ if(!have.has(i)) why.push("no "+i); });
          /* the named parts, said again plainly: root; third or sus note; seventh */
          const third=iv.find(i=>i===3||i===4), sus=iv.find(i=>i===2||i===5), sev=iv.find(i=>i===10||i===11)!=null ? iv.find(i=>i===10||i===11) : (x.id==="dim7"?9:null);
          if(!have.has(0)) why.push("no root");
          if(third!=null ? !have.has(third) : (sus!=null && !have.has(sus))) why.push("no third or sus note");
          if(sev!=null && !have.has(sev)) why.push("no seventh");
        } else {
          const notes=x.bass||[];
          if(!notes.length || notes[0]%12!==x.r) why.push("does not start on the root");
          if(notes.some(m=>pcs.indexOf(m%12)<0)) why.push("a note not in the chord");
          if(new Set(notes.map(m=>m%12)).size!==new Set(pcs).size) why.push("not every note of the chord");
          if(notes.some((m,i)=>i && m<=notes[0])) why.push("a note at or under the root");
          if(new Set(notes).size!==notes.length) why.push("a note twice");
          if(notes.some(m=>{ let best=null; TUN.bass.forEach((o,s)=>{ const f=m-o; if(f>=0 && f<=15 && reach(f)) best=f; }); return best==null; })) why.push("a note off the frets on screen");
        }
        if(why.length) bad.push(`${x.id} on ${x.r} (key ${x.key}, hand at ${start}→${x.f0}): ${JSON.stringify(x.shp||x.bass)} — ${why.join(", ")}`); });
      ok(all.length===45*12*2 && !bad.length, `${all.length} chords (45 kinds × 12 roots × 2 keys), the hand starting at fret ${start}: `+(inst==="guitar"?"every one has a shape a hand can play":"every one plays all its notes in one place")+(bad.length?"\n   "+bad.slice(0,10).join("\n   "):""));
    }

    /* 3. choosing in the menu: lit on the neck, and only the chord's notes play */
    await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,id,m){ if(cx===ac) window.__v.push(m); return mv.apply(this,arguments); }; });
    await p.locator("#anyRoot").scrollIntoViewIfNeeded();
    for(const [root, id] of [[2,"m7b5"],[7,"thirteenb9"],[9,"sus4"],[0,"maj"],[10,"dom7s5s9"],[4,"five"]]){
      await p.evaluate(()=>{ window.__v=[]; });
      await p.selectOption("#anyRoot", String(root)); await p.selectOption("#anyKind", id); await p.waitForTimeout(120);
      const r=await p.evaluate(()=>({hand:S.hand, key:S.key, fit:[...document.querySelectorAll("#neck .dot.fit, #neck .dot.now")].map(g=>g.getAttribute("data-c")),
        roots:[...document.querySelectorAll("#neck .dot.root")].map(g=>g.getAttribute("data-c")), shp:GTR?shapeFor(S.hand):null, played:window.__v.slice(),
        line:document.getElementById("anyLine").textContent, f0:S.fret0, n:NECK.n}));
      const pcs=lib.kinds[id].map(i=>(root+i)%12), tun=TUN[inst], cellPc=c=>{ const [s,f]=c.split(":").map(Number); return (tun[s]+f)%12; };
      const handOk=r.hand && r.hand.q===id && ((r.key+r.hand.off)%12)===root;
      ok(handOk, `${id} on ${root}: the chord is in the hand`);
      if(inst==="guitar"){
        const want=r.shp.map((f,s)=>f>=0?s+":"+f:null).filter(Boolean).sort().join(" ");
        ok(r.fit.slice().sort().join(" ")===want, `  its shape lights on the neck: ${want}`);
        /* the last choice played the strum (the root may have been chosen before the kind: count the last strum only) */
        const last=r.played.slice(-r.shp.filter(f=>f>=0).length);
        ok(last.join()===r.shp.map((f,s)=>f>=0?tun[s]+f:null).filter(x=>x!=null).join(), "  and strums it: "+last.join(","));
      } else {
        ok(r.fit.length>0 && r.fit.every(c=>pcs.indexOf(cellPc(c))>=0) && new Set(r.fit.map(cellPc)).size===new Set(pcs).size, `  every note of it lights on the neck (${r.fit.length} places)`);
        ok(r.roots.length>0 && r.roots.every(c=>cellPc(c)===root), "  its root marked as the root");
        const last=r.played.slice(-new Set(pcs).size);
        ok(last.length && last[0]%12===root && last.every((m,i)=>!i || m>last[0]) && new Set(last.map(m=>m%12)).size===new Set(pcs).size, "  and plays the root, then each note above it: "+last.join(","));
      }
      const ownPlayed=await p.evaluate(()=>{ window.__v=[]; document.getElementById("anyBtn").click(); return window.__v.slice(); });
      ok(ownPlayed.length>0 && ownPlayed.every(m=>pcs.indexOf(m%12)>=0), "  the button plays it again, chord notes only: "+ownPlayed.join(","));
      ok(r.line.length>0 && r.line.indexOf("the notes")>=0, "  its line: "+r.line);
    }
    /* a chord button afterwards puts its own chord in the hand and the line goes */
    await p.evaluate(()=>{ padDown(0, 0.7); padUp(0); });
    ok(await p.evaluate(()=>document.getElementById("anyLine").textContent===""), "a chord button after it: the Any chord line steps aside");
    ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), "nothing scrolls sideways");

    /* 4. in Spanish */
    await p.evaluate(()=>{ try{ localStorage.setItem("aog.lang","es"); }catch(e){} });
    await p.reload(); await p.waitForTimeout(1200);
    const es=await p.evaluate(()=>({roots:[...document.querySelectorAll("#anyRoot option")].map(o=>o.textContent), groups:[...document.querySelectorAll("#anyKind optgroup")].map(g=>g.label),
      kinds:[...document.querySelectorAll("#anyKind option")].map(o=>o.textContent), lab:[...document.querySelectorAll("#anyRow .plab")].map(x=>x.textContent).join(" | "),
      btn:document.getElementById("anyBtn").textContent}));
    ok(es.roots.join(" ")==="Do Re♭ Re Mi♭ Mi Fa Fa♯ Sol La♭ La Si♭ Si", "Spanish roots: "+es.roots.join(" "));
    ok(es.groups.join("|")===lib.ges.join("|"), "Spanish groups: "+es.groups.join(" | "));
    ok(es.kinds.length===45 && es.kinds.every((t,i)=>t===(lib.sym[i]?lib.sym[i]+" · ":"")+lib.les[i]), "Spanish kinds, e.g. "+es.kinds[19]);
    ok(/Cualquier acorde/.test(es.lab) && /Tipo de acorde/.test(es.lab) && /Tocar este acorde/.test(es.btn), `Spanish words: ${es.lab} · ${es.btn}`);
    await p.locator("#anyKind").scrollIntoViewIfNeeded();
    await p.selectOption("#anyKind", "m7"); await p.waitForTimeout(100);
    const esLine=await p.evaluate(()=>document.getElementById("anyLine").textContent);
    ok(/las notas/.test(esLine) && !/the notes/.test(esLine), "Spanish line: "+esLine);
    ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), "nothing scrolls sideways (Spanish)");
    await p.evaluate(()=>{ try{ localStorage.setItem("aog.lang","en"); }catch(e){} });
    ok(!errs.length, "no page errors"+(errs.length?": "+errs.slice(0,3).join(" | "):""));
    await c.close();
  }
  await b.close(); srv.close();
  console.log(fails ? fails+" FAILED" : "ALL PASS");
  process.exit(fails ? 1 : 0);
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
