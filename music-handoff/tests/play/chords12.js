/* AOG-CHORDS-12-V1 and AOG-ANY-ROOTS-V1 (2026-10-14) — Jimmy: "CAN WE GET MORE CHORDS FOR THE BAND AND OTHER INSTRUMENTS
   MAKE IT 10 OR MORE TO SELECT ONE AT A TIME", and "CAN THE root chords be more up and can we figure out a easier / quicker
   way to switch chord roots?" In the Band, the Piano, the Guitar and the Bass: the chord strip has twelve chords (the six
   pads, unchanged, then six more), named for the key and the mood, in English and Spanish; each of the six more plays its
   own notes. Any chord sits right under the strip: twelve roots and six quick kinds, each a tap that plays at once.
   An iPhone upright and sideways, an iPad (inside the Studio too) and a computer: 44 px or more, nothing sideways. Port 9335. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const PORT=9335, U="http://localhost:"+PORT+"/";
const srv=require("../srv.js")(PORT);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const ROOMS=[
  {id:"band", file:"music-band.html"},
  {id:"piano", file:"music-piano.html"},
  {id:"guitar", file:"music-guitar.html"},
  {id:"bass", file:"music-bass.html"}
];
const MAJ_C="C Dm Em F G Am Bdim G7 B♭ Fm D A♭", MIN_A="Am C Dm Em F G E E7 Bdim D B♭ G♯dim", MAJ_G="G Am Bm C D Em F♯dim D7 F Cm A E♭";
const ES_C="Do Re m Mi m Fa Sol La m Si dim Sol7 Si♭ Fa m Re La♭";
/* the strip's names, without a computer key's letter */
const names=(f, sel)=>f.evaluate(sel=>[...document.querySelectorAll(sel+" .cs")].map(b=>{ const k=b.querySelector("kbd"); return (k ? b.textContent.slice(0,-k.textContent.length) : b.textContent).trim(); }).join(" "), sel||"#chordStrip");
/* every pitch a room sends out while a function runs */
const HOOK=`window.__pcs=[]; (function(){
  if(typeof pluckCell==="function"){ const o=pluckCell; window.pluckCell=function(s,f){ __pcs.push(((TUNING[s]+f)%12+12)%12); return o.apply(this,arguments); }; }
  else if(typeof holdChord==="function"){ const o=noteOn; window.noteOn=function(k,i,m){ __pcs.push(((m%12)+12)%12); return o.apply(this,arguments); }; }
  else { const o=noteOn; window.noteOn=function(t,m){ __pcs.push(((m%12)+12)%12); return o.apply(this,arguments); }; } })();`;
async function press(p, sel, ms, after){
  const r=await p.evaluate(sel=>{ const e=document.querySelector(sel); e.scrollIntoView({block:"center"}); const b=e.getBoundingClientRect(); return {x:b.x+b.width/2, y:b.y+b.height/2}; }, sel);
  await p.evaluate("__pcs=[]"); await p.mouse.move(r.x, r.y); await p.mouse.down(); await p.waitForTimeout(ms||160);
  const during=await p.evaluate("[...new Set(__pcs)].sort((a,b)=>a-b)"); await p.mouse.up(); await p.waitForTimeout(after?300:120);
  return after ? await p.evaluate("[...new Set(__pcs)].sort((a,b)=>a-b)") : during;
}
const same=(a,b)=>JSON.stringify([...a].sort((x,y)=>x-y))===JSON.stringify([...new Set(b)].sort((x,y)=>x-y));
/* what a room plays for chord pcs: everything (a guitar shape may leave a note out, never adds one); the bass plays its root */
const right=(id, got, pcs)=> id==="bass" ? same(got,[pcs[0]]) : id==="guitar" ? got.length>=2 && got.every(x=>pcs.indexOf(x)>=0) && got.indexOf(pcs[0])>=0 : same(got,pcs);
const anyRight=(id, got, pcs)=> id==="guitar" ? got.length>=2 && got.every(x=>pcs.indexOf(x)>=0) && got.indexOf(pcs[0])>=0 : same(got,pcs);
/* buttons in a box: count, rows, columns, the smallest size, any whose words do not fit */
const boxInfo=(f, sel)=>f.evaluate(sel=>{ const bs=[...document.querySelectorAll(sel)].filter(b=>b.getBoundingClientRect().width>0); const rs=bs.map(b=>b.getBoundingClientRect());
  return {n:bs.length, rows:new Set(rs.map(r=>Math.round(r.top))).size, cols:new Set(rs.map(r=>Math.round(r.left))).size,
    w:Math.min(...rs.map(r=>r.width)), h:Math.min(...rs.map(r=>r.height)), clip:bs.filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.textContent),
    side:document.documentElement.scrollWidth>innerWidth+1}; }, sel);
(async()=>{
  const B=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const ctxOf=async(opt)=>{ const c=await B.newContext(opt); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await c.route(/\/the-studio(\?[^#]*)?$/, r=>r.fulfill({path:require("path").resolve(__dirname,"../../../aog-deploy/the-studio.html"), contentType:"text/html"}));
    await c.addInitScript(()=>{ try{ if(!sessionStorage.getItem("__c12")){ localStorage.clear(); sessionStorage.setItem("__c12","1"); } }catch(e){} }); return c; };
  for(const R of ROOMS){
    /* ── a computer: the names, the sounds, the six pads, Any chord ── */
    { const c=await ctxOf({viewport:{width:1280,height:900}}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
      await p.goto(U+R.file); await p.waitForTimeout(1800); console.log("== "+R.id+" · computer");
      await p.evaluate(HOOK);
      ok(await p.evaluate(()=>document.querySelectorAll("#chordStrip .cs").length)===12, R.id+": twelve chord buttons on the strip");
      ok(await names(p)===MAJ_C, R.id+": in C major: "+await names(p));
      /* AOG-PIANO-12PADS-V1 (2026-10-24): the Piano now shows the strip's twelve as pads; the first six stay the same six */
      const np=R.id==="piano" ? 12 : 6;
      ok(await p.evaluate(np=>JSON.stringify(pads().slice(0,6))==='[{"n":1,"off":0,"q":"maj"},{"n":2,"off":2,"q":"min"},{"n":3,"off":4,"q":"min"},{"n":4,"off":5,"q":"maj"},{"n":5,"off":7,"q":"maj"},{"n":6,"off":9,"q":"min"}]'
        && document.querySelectorAll("#pads .pad").length===np, np), R.id+": the first six pads are the same six, in the same order"+(np===12?", and the Piano shows all twelve":""));
      const si=await boxInfo(p, "#chordStrip .cs");
      ok(si.rows===1 && si.w>=44 && !si.clip.length && !si.side, R.id+`: one row of twelve on a computer (${Math.round(si.w)} px each)`);
      /* each of the six more plays its own notes */
      for(let i=6;i<12;i++){ const want=await p.evaluate(i=>chordPcs(allPads()[i]), i), got=await press(p, `#chordStrip .cs[data-i="${i}"]`);
        ok(right(R.id, got, want), `${R.id}: ${await p.evaluate(i=>chordName(allPads()[i]), i)} plays ${got.join(",")} (wants ${want.join(",")})`); }
      ok(await p.evaluate(()=>!Object.keys(padHeld).filter(k=>k!=="any").length), R.id+": letting go lets the chord go");
      /* a pad still plays as before */
      { const want=await p.evaluate(()=>chordPcs(pads()[3])), got=await press(p, '#chordStrip .cs[data-i="3"]'); ok(right(R.id, got, want), R.id+": the F pad still plays F A C: "+got.join(",")); }
      /* Any chord, right under the strip */
      const pos=await p.evaluate(()=>{ const s=document.getElementById("chordStrip").getBoundingClientRect(), a=document.getElementById("anyRoots").closest(".any").getBoundingClientRect(); return {gap:a.top-s.bottom}; });
      ok(pos.gap>=0 && pos.gap<=24, R.id+`: Any chord sits right under the chord strip (${Math.round(pos.gap)} px)`);
      const ri=await boxInfo(p, "#anyRoots .ar");
      ok(ri.n===12 && ri.rows===1 && ri.w>=44 && !ri.clip.length, R.id+`: twelve roots in one row (${Math.round(ri.w)} px each)`);
      ok(await p.evaluate(()=>[...document.querySelectorAll("#anyRoots .ar")].map(b=>b.textContent).join(" ")===[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>rootName(i,"maj")).join(" ")), R.id+": the roots are spelled as the room spells chords: "+await p.evaluate(()=>[...document.querySelectorAll("#anyRoots .ar")].map(b=>b.textContent).join(" ")));
      ok(await p.evaluate(()=>!document.getElementById("anyRoot") && !!document.getElementById("anyKind")), R.id+": the Root menu is gone; the Kind menu stays for the rest");
      ok(await p.evaluate(()=>[...document.querySelectorAll("#anyKinds .ak")].map(b=>b.getAttribute("data-k")).join(" "))==="maj min dom7 maj7 m7 sus4", R.id+": six quick kinds: "+await p.evaluate(()=>[...document.querySelectorAll("#anyKinds .ak")].map(b=>b.textContent).join(" ")));
      { const got=await press(p, '#anyRoots .ar[data-r="2"]', 200);
        ok(anyRight(R.id, got, [2,6,9]), R.id+": a tap on D plays D major at once: "+got.join(","));
        ok(await p.evaluate(()=>document.querySelector('#anyRoots .ar[data-r="2"]').getAttribute("aria-pressed")==="true" && document.querySelectorAll('#anyRoots .ar[aria-pressed="true"]').length===1), R.id+": D is lit"); }
      { const got=await press(p, '#anyKinds .ak[data-k="min"]', 200); ok(anyRight(R.id, got, [2,5,9]), R.id+": Minor plays D minor: "+got.join(",")); }
      { const got=await press(p, '#anyKinds .ak[data-k="m7"]', 200); ok(anyRight(R.id, got, [2,5,9,0]), R.id+": m7 plays Dm7: "+got.join(","));
        ok(await p.evaluate(()=>document.getElementById("anyKind").value==="m7" && document.querySelector('#anyKinds .ak[data-k="m7"]').getAttribute("aria-pressed")==="true"), R.id+": m7 is lit, and the Kind menu says so"); }
      { const got=await press(p, '#anyRoots .ar[data-r="7"]', 200); ok(anyRight(R.id, got, [7,10,2,5]), R.id+": then G plays Gm7 (the kind stays): "+got.join(",")); }
      if(R.id==="band"||R.id==="piano"){ ok(await p.evaluate(R=>R==="band" ? SC.hold===null : !padHeld.any, R.id), R.id+": letting go of a root lets its chord go"); }
      { const got=await press(p, (R.id==="guitar"||R.id==="bass") ? "#anyBtn" : "#anyPlay", 200, true); ok(anyRight(R.id, got, [7,10,2,5]), R.id+": Play the chord plays it again: "+got.join(",")); }
      /* the key and the mood */
      await p.click("#minBtn"); await p.selectOption("#keySel","9"); await p.waitForTimeout(250);
      ok(await names(p)===MIN_A, R.id+": in A minor: "+await names(p));
      for(let i=6;i<12;i++){ const want=await p.evaluate(i=>chordPcs(allPads()[i]), i), got=await press(p, `#chordStrip .cs[data-i="${i}"]`);
        ok(right(R.id, got, want), `${R.id}: ${await p.evaluate(i=>chordName(allPads()[i]), i)} plays ${got.join(",")} (wants ${want.join(",")})`); }
      await p.click("#majBtn"); await p.selectOption("#keySel","7"); await p.waitForTimeout(250);
      ok(await names(p)===MAJ_G, R.id+": the names follow a key change (G major): "+await names(p));
      await p.selectOption("#keySel","5"); await p.waitForTimeout(200);
      ok(await p.evaluate(()=>document.querySelector('#anyRoots .ar[data-r="10"]').textContent==="B♭"), R.id+": in F the roots say B♭");
      await p.selectOption("#keySel","0"); await p.waitForTimeout(200);
      await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
      ok(await names(p)===ES_C, R.id+": in Spanish: "+await names(p));
      ok(await p.evaluate(()=>{ const r=[...document.querySelectorAll("#anyRoots .ar")].map(b=>b.textContent), k=[...document.querySelectorAll("#anyKinds .ak")].map(b=>b.textContent);
        return r[0]==="Do" && r[7]==="Sol" && k[0]==="Mayor" && k[1]==="Menor" && /toca una raíz/.test(document.querySelector("#anyRoots").closest(".any").querySelector(".plab").textContent); }), R.id+": the roots and kinds in Spanish");
      ok(!errs.length, R.id+": no page errors: "+errs.join(" | "));
      await c.close(); }
    /* ── an iPhone upright, then sideways ── */
    { const c=await ctxOf({viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:3}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
      await p.goto(U+R.file); await p.waitForTimeout(1800); console.log("== "+R.id+" · iPhone");
      for(const lang of ["en","es"]){
        const s=await boxInfo(p, "#chordStrip .cs"), r=await boxInfo(p, "#anyRoots .ar"), k=await boxInfo(p, "#anyKinds .ak");
        ok(s.n===12 && s.rows===2 && s.cols===6 && s.w>=44 && s.h>=44 && !s.clip.length && !s.side, `${R.id} (${lang}): upright, two rows of six chords (${Math.round(s.w)}×${Math.round(s.h)} px) ${s.clip.join(",")}`);
        ok(r.n===12 && r.rows===2 && r.w>=44 && r.h>=44 && !r.clip.length && k.n===6 && k.rows===1 && k.w>=44 && k.h>=44 && !k.clip.length, `${R.id} (${lang}): roots two rows of six (${Math.round(r.w)} px), kinds one row (${Math.round(k.w)} px) ${r.clip.concat(k.clip).join(",")}`);
        const gap=await p.evaluate(()=>document.getElementById("anyRoots").closest(".any").getBoundingClientRect().top-document.getElementById("chordStrip").getBoundingClientRect().bottom);
        ok(gap>=0 && gap<=24, `${R.id} (${lang}): Any chord right under the strip (${Math.round(gap)} px)`);
        if(lang==="en"){ await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300); }
      }
      ok(!errs.length, R.id+": no page errors on the iPhone: "+errs.join(" | "));
      await c.close(); }
    { const c=await ctxOf({viewport:{width:844,height:390}, isMobile:true, hasTouch:true, deviceScaleFactor:3}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
      await p.goto(U+R.file); await p.waitForTimeout(1800); console.log("== "+R.id+" · iPhone sideways");
      const v=await boxInfo(p, "#pvStrip .cs"), strings=R.id==="guitar"||R.id==="bass";
      ok(v.n===12 && (strings ? v.cols===2 : v.rows===1) && v.w>=44 && v.h>=(strings?40:44) && !v.clip.length && !v.side,
        `${R.id}: sideways, the twelve chords ${strings?"in two columns by the nut":"in one row, so the keys keep their height"} (${Math.round(v.w)}×${Math.round(v.h)} px)`);
      ok(!errs.length, R.id+": no page errors sideways: "+errs.join(" | "));
      await c.close(); }
    /* ── an iPad, inside the Studio ── */
    { const c=await ctxOf({viewport:{width:820,height:1180}, isMobile:true, hasTouch:true, deviceScaleFactor:2}); const p=await c.newPage(); const errs=[]; c.on("page",()=>{}); p.on("pageerror",e=>errs.push(e.message));
      await p.goto(U+"the-studio#"+R.id); let f=null;
      for(let t=0;t<40 && !f;t++){ await p.waitForTimeout(250); f=p.frames().find(x=>x.url().indexOf(R.file)>=0) || null; if(f && !(await f.evaluate(()=>document.querySelectorAll("#chordStrip .cs").length===12).catch(()=>false))) f=null; }
      console.log("== "+R.id+" · iPad in the Studio");
      ok(!!f && await f.evaluate(()=>document.documentElement.classList.contains("in-studio")), R.id+": the room is open inside the Studio");
      if(f){ /* AOG-ROOMS-COMPACT-V1: in the Studio Any chord is folded behind one button by Lower and Higher: open it, as a person would */
        const ab=await f.$("#aogAnyBtn"); if(ab && await ab.getAttribute("aria-expanded")!=="true"){ await ab.click(); await p.waitForTimeout(200); }
        await f.evaluate(()=>{ const s=document.getElementById("chordStrip"); window.scrollTo(0, s.getBoundingClientRect().top+scrollY-8); }); await p.waitForTimeout(150);
        const s=await boxInfo(f, "#chordStrip .cs"), r=await boxInfo(f, "#anyRoots .ar");
        ok(s.n===12 && s.rows<=2 && s.w>=44 && s.h>=44 && !s.clip.length && !s.side, `${R.id}: iPad, the chords in ${s.rows} row(s), ${Math.round(s.w)} px each, nothing sideways`);
        ok(r.n===12 && r.w>=44 && r.h>=44 && !r.clip.length, `${R.id}: iPad, the roots ${Math.round(r.w)} px each`);
        const vis=await f.evaluate(()=>{ const s=document.getElementById("chordStrip").getBoundingClientRect(), k=document.getElementById("anyKinds").getBoundingClientRect(); return {s:s.top>=0, k:k.bottom<=innerHeight, gap:document.getElementById("anyRoots").closest(".any").getBoundingClientRect().top-s.bottom}; });
        ok(vis.s && vis.k && vis.gap>=0 && vis.gap<=24, R.id+`: iPad in the Studio, the strip and Any chord show together without scrolling (gap ${Math.round(vis.gap)} px)`); }
      ok(!errs.length, R.id+": no page errors in the Studio: "+errs.join(" | "));
      await c.close(); }
  }
  /* an iPad sideways (the room on its own): a row of twelve if it fits, else two of six */
  { const c=await ctxOf({viewport:{width:1180,height:820}, isMobile:true, hasTouch:true, deviceScaleFactor:2}); const p=await c.newPage();
    await p.goto(U+"music-band.html"); await p.waitForTimeout(1800);
    const s=await boxInfo(p, "#chordStrip .cs"); ok(s.n===12 && s.rows===1 && s.w>=44 && !s.clip.length && !s.side, `band: iPad sideways, one row of twelve (${Math.round(s.w)} px each)`);
    await c.close(); }
  await B.close(); srv.close && srv.close();
  console.log(fails ? fails+" FAILED" : "all passed"); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH "+(e&&e.stack||e)); process.exit(1); });
