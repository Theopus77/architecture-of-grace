/* Solo mode, the panel and the lit scale: A minor blues, C major pentatonic, the window, Spanish, layout, errors,
   and the solo panel's text contrast (light and dark), on an iPhone, an iPad and a computer, guitar and bass. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9921);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const SHOTS=__dirname+"/shots"; require("fs").mkdirSync(SHOTS,{recursive:true});
const DEVS=[["iPhone 13",null],["iPad (gen 7)",null],["Desktop",{viewport:{width:1280,height:900}}]];
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const inst of ["guitar","bass"]) for(const [dev,opt] of DEVS){
    const c=await b.newContext(opt||pw.devices[dev]); const p=await c.newPage();
    const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9921/music-${inst}.html`); await p.waitForTimeout(1000);
    console.log(`== ${inst} · ${dev}`);
    ok(await p.evaluate(()=>!!window.AOGSolo && document.getElementById("soloTop").hidden && !document.querySelector("#neck #soScale")), "Chords mode first: the solo panel is hidden, nothing extra on the neck");
    const tap=async(sel)=>{ const l=p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); if(dev==="Desktop") await l.click(); else await l.tap(); await p.waitForTimeout(80); };
    await tap('#soloMode [data-so-mode="solo"]');
    const st=await p.evaluate(()=>({on:AOGSolo.isOn(), pressed:document.querySelector('#soloMode [data-so-mode="solo"]').getAttribute("aria-pressed"), top:!document.getElementById("soloTop").hidden, sound:S.sound}));
    ok(st.on && st.pressed==="true" && st.top, "Solo mode opens");
    ok(st.sound===(inst==="guitar"?"lead":"slap"), "and puts on a lead sound: "+st.sound);
    /* A minor */
    await p.selectOption("#keySel","9"); await tap("#minBtn");
    const am=await p.evaluate(()=>{ const cells=[...document.querySelectorAll("#neck #soScale .so-c")].map(g=>{ const [s,f]=g.getAttribute("data-c").split(":").map(Number); return {s,f,pc:(TUNING[s]+f)%12, cls:g.getAttribute("class")}; });
      const want=[]; const fr=[]; if(S.fret0<=2) fr.push(0); for(let i=0;i<NECK.n;i++) fr.push(S.fret0+i);
      TUNING.forEach((o,s)=>fr.forEach(f=>{ if([9,0,2,3,4,7].indexOf((o+f)%12)>=0) want.push(s+":"+f); }));
      return {cells, want, say:document.getElementById("soSay").textContent, sel:document.getElementById("soScaleSel").value, a:S.fret0, b:S.fret0+NECK.n-1}; });
    ok(am.sel==="blues", "in a minor key the scale is the blues");
    ok(am.cells.length===am.want.length && am.cells.every(x=>am.want.indexOf(x.s+":"+x.f)>=0), `A minor blues: ${am.cells.length} lit places, all of A C D E♭ E G (expected ${am.want.length})`);
    ok(am.cells.filter(x=>/blue/.test(x.cls)).every(x=>x.pc===3) && am.cells.some(x=>/blue/.test(x.cls)) , "the blue note (E♭) is marked blue");
    ok(am.cells.filter(x=>/root/.test(x.cls)).every(x=>x.pc===9) && am.cells.some(x=>/root/.test(x.cls)), "the roots (A) are ringed");
    ok(am.cells.filter(x=>/land/.test(x.cls)).every(x=>[9,0,4].indexOf(x.pc)>=0), "the A minor chord's notes are the brighter ones");
    ok(/^A minor blues scale, frets \d+ to \d+\.$/.test(am.say) && am.say.indexOf("frets "+am.a+" to "+am.b)>=0, "a screen reader hears: "+am.say);
    await p.locator("#soloMode").scrollIntoViewIfNeeded(); await p.evaluate(()=>document.getElementById("soloMode").scrollIntoView({block:"start"})); await p.screenshot({path:`${SHOTS}/s1am-${inst}-${dev.replace(/\W+/g,"")}.png`});
    /* the window moves: the light follows */
    await tap("#upBtn"); await tap("#upBtn");
    const mv=await p.evaluate(()=>({f0:S.fret0, cells:[...document.querySelectorAll("#neck #soScale .so-c")].map(g=>+g.getAttribute("data-c").split(":")[1]), say:document.getElementById("soSay").textContent}));
    ok(mv.cells.every(f=>f>=mv.f0 && f<=mv.f0+20) && mv.say.indexOf("frets "+mv.f0)>=0, `the light follows the hand to fret ${mv.f0}: ${mv.say}`);
    /* C major */
    await p.selectOption("#keySel","0"); await tap("#majBtn");
    const cm=await p.evaluate(()=>({pcs:[...new Set([...document.querySelectorAll("#neck #soScale .so-c")].map(g=>{ const [s,f]=g.getAttribute("data-c").split(":").map(Number); return (TUNING[s]+f)%12; }))].sort((a,b)=>a-b),
      blue:document.querySelectorAll("#neck #soScale .so-c.blue").length, roots:[...document.querySelectorAll("#neck #soScale .so-c.root")].length, say:document.getElementById("soSay").textContent, sel:document.getElementById("soScaleSel").value}));
    ok(cm.sel==="majpent" && JSON.stringify(cm.pcs)==="[0,2,4,7,9]" && cm.blue===0 && cm.roots>0, `C major pentatonic: ${JSON.stringify(cm.pcs)}, no blue note, roots ringed — "${cm.say}"`);
    /* another scale from the menu */
    await p.selectOption("#soScaleSel","mixo");
    ok(await p.evaluate(()=>[...document.querySelectorAll("#neck #soScale .so-c")].every(g=>{ const [s,f]=g.getAttribute("data-c").split(":").map(Number); return [0,2,4,5,7,9,10].indexOf((TUNING[s]+f)%12)>=0; })), "the Mixolydian menu choice lights its seven notes");
    /* AOG-SOLO-SCALES-MORE-V1: every scale in the menu, in groups, lights exactly its own notes and is named aloud */
    const allsc=await p.evaluate(()=>({ids:[...document.querySelectorAll("#soScaleSel option")].map(o=>o.value), groups:document.querySelectorAll("#soScaleSel optgroup").length}));
    const scBad=[];
    for(const id of allsc.ids){ await p.selectOption("#soScaleSel", id);
      const r=await p.evaluate(()=>{ const want=new Set(AOGSolo._t.scalePcs()), fr=[]; if(S.fret0<=2) fr.push(0); for(let i=0;i<NECK.n;i++) fr.push(S.fret0+i);
        const lit=[...document.querySelectorAll("#neck #soScale .so-c")].map(g=>{ const [s2,f]=g.getAttribute("data-c").split(":").map(Number); return s2+":"+f; });
        const exp=[]; TUNING.forEach((o,s2)=>fr.forEach(f=>{ if(want.has((o+f)%12)) exp.push(s2+":"+f); }));
        return {ok:lit.length===exp.length && lit.every(x=>exp.indexOf(x)>=0), say:document.getElementById("soSay").textContent, n:want.size}; });
      if(!r.ok || !/ scale, frets /.test(r.say) || /nm_|sc_/.test(r.say)) scBad.push(id+": "+r.say); }
    ok(allsc.ids.length>=53 && allsc.groups>=7 && new Set(allsc.ids).size===allsc.ids.length && scBad.length===0, `${allsc.ids.length} scales in ${allsc.groups} groups, each lights exactly its own notes and is named`+(scBad.length?": "+scBad.slice(0,4).join(" | "):""));
    await p.selectOption("#soScaleSel","majpent");
    if(inst==="bass") ok(await p.evaluate(()=>document.querySelectorAll("#neck #soScale .so-five").length>0), "the bass shows root–fifth–octave shapes");
    else ok(await p.evaluate(()=>!!document.querySelector("#neck #soWham[role=slider]")), "the guitar shows the whammy bar (a slider) at the strum strip");
    /* layout, then a picture */
    const lay=await p.evaluate(()=>({over:document.documentElement.scrollWidth-innerWidth}));
    ok(lay.over<=2, "no sideways scrolling ("+lay.over+" px)");
    await p.locator("#soloMode").scrollIntoViewIfNeeded(); await p.screenshot({path:`${SHOTS}/s1-${inst}-${dev.replace(/\W+/g,"")}.png`, fullPage:false});
    /* Spanish */
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(80);
    const es=await p.evaluate(()=>({mode:[...document.querySelectorAll("#soloMode button")].map(b=>b.textContent).join("|"), say:document.getElementById("soSay").textContent, band:document.getElementById("soBand").textContent, scale:document.querySelector("#soScaleSel option:checked").textContent}));
    ok(es.mode==="Acordes|Solo" && /^Escala pentatónica mayor de Do, trastes \d+ a \d+\.$/.test(es.say) && /Tocar la banda/.test(es.band) && /Pentatónica mayor/.test(es.scale), "Spanish: "+JSON.stringify(es));
    /* contrast of the solo panel's words, light and dark */
    for(const th of ["light","dark"]){
      await p.evaluate(th=>{ const h=document.documentElement; h.setAttribute("data-theme",th); h.classList.toggle("dark",th==="dark"); }, th);
      const bad=await p.evaluate(()=>{ const px=s=>{ const m=/rgba?\(([^)]+)\)/.exec(s||""); if(!m) return null; const v=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return {r:v[0],g:v[1],b:v[2],a:v.length>3?v[3]:1}; };
        const lum=c=>{ const f=x=>{ x/=255; return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4); }; return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
        const mix=(t,b)=>({r:t.r*t.a+b.r*(1-t.a),g:t.g*t.a+b.g*(1-t.a),b:t.b*t.a+b.b*(1-t.a),a:1});
        const bg=el=>{ for(let n=el;n;n=n.parentElement){ const cs=getComputedStyle(n); if(cs.backgroundImage&&cs.backgroundImage!=="none"){ const st=(cs.backgroundImage.match(/rgba?\([^)]+\)/g)||[]).map(px).filter(c=>c&&c.a>=0.99); if(st.length) return st[0]; } const c=px(cs.backgroundColor); if(c&&c.a>=0.99) return c; } return {r:255,g:255,b:255,a:1}; };
        const out=[]; document.querySelectorAll("#soloMode *, #soloTop *, #soloBottom *").forEach(el=>{ if(!el.childNodes.length || ![...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim())) return; if(el.closest("option,[hidden],[aria-hidden=true]")) return; const r=el.getBoundingClientRect(); if(r.width<2) return;
          const fg=px(getComputedStyle(el).color), b=bg(el); const x=lum(mix(fg,b)), y=lum(b), k=(Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); if(k<3) out.push(el.tagName+" "+k.toFixed(2)+" "+el.textContent.slice(0,30)); });
        return out; });
      ok(bad.length===0, `${th}: every word in the solo panel reads at 3:1 or better ${bad.slice(0,3).join(" | ")}`);
    }
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(80);
    await tap('#soloMode [data-so-mode="chords"]');
    ok(await p.evaluate(()=>!AOGSolo.isOn() && document.getElementById("soloTop").hidden && !document.querySelector("#neck #soScale") && S.sound===(GTR?"steel":"finger")), "back to Chords: the panel and the light go, and the first sound comes back");
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
