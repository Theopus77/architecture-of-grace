/* The recorded kits P to T (AOG-DRUM-REAL-V1): each loads when picked with a calm line, every pad sounds at soft / normal /
   accent, layers and takes rotate, levels sit with kit A and the other kits, the era dial, TRIM, a user sample and Put the kit
   sounds back, the five new beats (the prog one in two parts, with undo), Send to the turntables, memory untouched, reload,
   Spanish, a phone. Renders go through the page's own engine (lib/meter.js). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path");
const srv=require("./srv.js")(9915);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const URL0="http://localhost:9915/music-drums.html#home";
const NAMES={P:"Kit P · studio session, dry",Q:"Kit Q · big room rock",R:"Kit R · big-band swing",S:"Kit S · prog rock, many toms",T:"Kit T · groove metal"};
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
  const errs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error" && !/favicon/.test(m.text())) errs.push(m.text()); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  let slow=0; await p.route(/\/audio\/drums\//, async r=>{ if(slow) await new Promise(x=>setTimeout(x, slow)); r.continue(); });
  await p.goto(URL0); await p.waitForTimeout(1200);
  await p.addScriptTag({content: fs.readFileSync(path.join(__dirname,"lib/meter.js"),"utf8")});
  ok(await p.evaluate("BANKS.join('')")==="ABCDEFGHIJKLMNOPQRST", "BANKS: A to O built here, then P to T recorded: "+await p.evaluate("BANKS.join('')"));
  const menu=p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel');
  const opts=await menu.locator("option").allTextContents();
  const grp=await menu.locator("optgroup").getAttribute("label").catch(()=>null);
  ok(opts.length===20 && Object.values(NAMES).every(n=>opts.includes(n)) && grp==="Recorded drums", `the Sounds menu lists 20 kits, P to T under "${grp}"`);
  ok(await p.evaluate("Object.keys(ROMK).filter(k=>realKit(k)).length===0") , "nothing recorded is downloaded before a kit is picked");
  await p.click('.sp-pad[data-pad="kick"]'); await p.waitForTimeout(2500);
  const mem0=await p.evaluate("+memUsed().toFixed(3)");
  /* pick each kit from the menu; the first one slowly, to see the line */
  slow=350;
  await menu.selectOption({label:NAMES.P}); await p.waitForTimeout(250);
  const line=await p.evaluate(()=>{ const el=[...document.querySelectorAll("[data-realkit-line]")].find(e=>!e.hidden && e.offsetParent); return el && el.textContent; });
  ok(line==="Getting the recorded drums ready…", "while it loads, one calm line: "+line);
  await p.waitForFunction(()=>AOGDrumKit.ready("P"), null, {timeout:60000});
  await p.waitForTimeout(200);
  ok(await p.evaluate(()=>![...document.querySelectorAll("[data-realkit-line]")].some(e=>!e.hidden)), "the line goes away when the kit is ready");
  slow=0;
  const counts={};
  for(const k of ["P","Q","R","S","T"]){
    if(k!=="P"){ await menu.selectOption({label:NAMES[k]}); await p.waitForFunction(b=>AOGDrumKit.ready(b), k, {timeout:60000}); }
    counts[k]=await p.evaluate(b=>{ const files=VOICES.map(v=>{ const f=AOGDrumKit.files(b,v.id); return f.s.length+f.m.length+f.h.length; }).reduce((a,x)=>a+x,0);
      return {bank:S.bank, files, rom:VOICES.every(v=>ROMK[b][v.id]&&ROMK[b][v.id].length>1000&&HIK[b][v.id]&&HIK[b][v.id].length>1000), names:VOICES.map(v=>padCaption(v)).join(" ")}; }, k);
    ok(counts[k].bank===k && counts[k].rom, `kit ${k} loads: ${counts[k].files} recordings, pads ${counts[k].names}`);
  }
  ok(await p.evaluate("Object.keys(ROMK).filter(k=>realKit(k)).length")<=2, "only the last two recorded kits stay in memory: "+await p.evaluate("Object.keys(ROMK).filter(k=>realKit(k)).join(',')"));
  ok(Math.abs(await p.evaluate("+memUsed().toFixed(3)")-mem0)<0.001, "the recorded kits use none of the 10 s sample memory ("+mem0+" s before and after)");
  /* every pad, three velocities, through the engine (1987 end of the dial) */
  const vel=await p.evaluate(async ()=>{
    const out={};
    for(const b of ["P","Q","R","S","T"]){ out[b]={};
      for(const v of VOICES){ const r={}; for(const [n,x] of [["soft",3],["normal",1],["accent",2]]) r[n]=await __meter.hit(b, v.id, x, 1); out[b][v.id]=r; } }
    return out; });
  let quiet=[], order=[];
  for(const k in vel) for(const id in vel[k]){ const r=vel[k][id];
    ["soft","normal","accent"].forEach(n=>{ if(!(r[n].peak>-45)) quiet.push(k+" "+id+" "+n+" "+r[n].peak); });
    if(!(r.soft.mom<r.normal.mom && r.normal.mom<r.accent.mom+0.5)) order.push(k+" "+id+" "+r.soft.mom+"/"+r.normal.mom+"/"+r.accent.mom); }
  ok(!quiet.length, "every pad of every recorded kit sounds at soft, normal and accent (120 hits) "+quiet.join("; "));
  ok(!order.length, "soft is quieter than normal, accent at least as loud "+order.join("; "));
  /* levels: kick and snare against kit A; a rock beat against the kits built here */
  const lv=await p.evaluate(async ()=>{
    const A={kick:(await __meter.hit("A","kick",1,1)).mom, snare:(await __meter.hit("A","snare",1,1)).mom}, rock={};
    for(const b of BANKS) rock[b]=(await __meter.pattern(b, 1)).integ;
    const k={}; for(const b of ["P","Q","R","S","T"]) k[b]={kick:(await __meter.hit(b,"kick",1,1)).mom, snare:(await __meter.hit(b,"snare",1,1)).mom};
    return {A, rock, k}; });
  const built=Object.keys(lv.rock).filter(x=>x<"P").map(x=>lv.rock[x]).sort((a,b)=>a-b), med=built[Math.floor(built.length/2)];
  for(const k of ["P","Q","R","S","T"]){
    const dk=lv.k[k].kick-lv.A.kick, ds=lv.k[k].snare-lv.A.snare, dr=lv.rock[k]-med;
    ok(Math.abs(dk)<=2.5 && Math.abs(ds)<=3.5 && lv.rock[k]>=built[0]-0.5 && lv.rock[k]<=built[built.length-1] && Math.abs(dr)<=3.5,
      `kit ${k}: kick ${lv.k[k].kick.toFixed(1)} LU (kit A ${lv.A.kick.toFixed(1)}), snare ${lv.k[k].snare.toFixed(1)} (kit A ${lv.A.snare.toFixed(1)}), rock beat ${lv.rock[k].toFixed(1)} (kits A–O ${built[0].toFixed(1)} to ${built[built.length-1].toFixed(1)}, middle ${med.toFixed(1)})`);
  }
  /* the dial, the outputs and the takes */
  await p.evaluate(()=>{ useBank("T"); paint(); window.__m=[]; const pm=engine.port.postMessage.bind(engine.port); engine.port.postMessage=(m,t)=>{ window.__m.push(Object.assign({}, m, {n:m.samples?m.samples.byteLength/4:0})); return pm(m,t); }; });
  await p.waitForTimeout(300);
  await p.locator('#era').fill("100"); await p.locator('#era').dispatchEvent("input");
  const ids=await p.evaluate(()=>{ __m.length=0; const t=ctx().currentTime+0.05; for(let i=0;i<6;i++) hit("kick", t+i*0.02, true, 1); hit("snare", t, true, 2); hit("snare", t, true, 3); hit("clap", t, true, 1); hit("rim", t, true, 2);
    return __m.filter(m=>m.type==="hit").map(m=>m.id+"|"+m.era+"|"+Math.round(m.cutoff)+"|"+(m.raw?1:0)); });
  const kicks=ids.filter(x=>x.startsWith("T:kick:m")).map(x=>x.split("|")[0]);
  ok(new Set(kicks).size===4, "the double-kick takes rotate: "+kicks.join(" "));
  ok(ids.some(x=>x.startsWith("T:snare:h"))&&ids.some(x=>x.startsWith("T:snare:s")), "accent and soft play their own recordings: "+ids.filter(x=>/snare/.test(x)).join(" "));
  ok(ids.every(x=>x.split("|")[1]==="0") && ids.filter(x=>/kick|snare/.test(x)).every(x=>x.endsWith("|1")) && ids.filter(x=>/clap|rim/.test(x)).every(x=>x.split("|")[2]==="18000"),
    "Clean 2026: era 0, pads 1–2 raw, pads 3–8 open to 18 kHz");
  const e26=await p.evaluate(async()=>(await __meter.hit("T","snare",1,0)).peak);
  ok(e26>-30, "a hit at the 2026 end sounds too ("+e26+" dBFS)");
  await p.locator('#era').fill("0"); await p.locator('#era').dispatchEvent("input");
  /* TRIM: the trim page works on a recorded pad, and every take is cut the same */
  const trim=await p.evaluate(()=>{ S.sel="snare"; __m.length=0; trimOf("snare").start=0.3; pushPad("snare");
    const ks=__m.filter(m=>m.type==="kit"&&/^T:snare:/.test(m.id)); return {n:ks.length, lens:ks.map(m=>m.n), full:HIK.T.snare.length, src:!!padSource("snare")}; });
  ok(trim.n===5 && trim.src && trim.lens[0]>1000 && trim.lens.every(n=>Math.abs(n-trim.lens[0])<3) && trim.lens[0]<0.75*Math.round(trim.full*26040/44100), "TRIM cuts all five snare recordings alike: "+trim.lens.join(","));
  await p.evaluate(()=>{ delete S.trim.T.snare; pushPad("snare"); });
  /* a sound of my own on a recorded pad, then the kit sounds back */
  await p.evaluate(async ()=>{ S.sel="tom"; const n=8000, L=new Float32Array(n); for(let i=0;i<n;i++) L[i]=Math.sin(i/6)*Math.exp(-i/1500)*0.8;
    await takeSample(new File([wavBlob(L, L, 26040)], "knock.wav", {type:"audio/wav"})); });
  await p.waitForTimeout(300);
  const own=await p.evaluate(()=>({id:chanMsg("tom",0,1).id, mem:+memUsed().toFixed(2), cap:padCaption(VOICES[5])}));
  ok(own.id==="tom" && own.cap==="KNOCK", "my own sound on pad 6 plays instead of the recording ("+own.cap+", "+own.mem+" s of memory)");
  await p.evaluate(()=>kitSoundsBack()); await p.waitForTimeout(200);
  ok(await p.evaluate(()=>/^T:tom:m/.test(chanMsg("tom",0,1).id) && padCaption(VOICES[5])==="TOM"), "Put the kit sounds back: pad 6 plays the recorded tom again");
  await p.evaluate(()=>kitSoundsUndo()); await p.evaluate(()=>kitSoundsBack());
  /* the five new beats */
  const sel=p.locator('.starter-row .aogdd-sel');
  for(const [label,k] of [["Half-time shuffle","P"],["Big heavy room groove","Q"],["Big-band swing","R"],["Groove metal, double kick","T"]]){
    await sel.selectOption({label}); await p.waitForFunction(b=>S.bank===b && AOGDrumKit.ready(b), k, {timeout:60000});
    const st=await p.evaluate(()=>({bank:S.bank, bpm:S.bpm, hits:hitsIn(S.grid)}));
    ok(st.bank===k && st.hits>=8, `"${label}" loads kit ${k} at ${st.bpm} BPM (${st.hits} hits)`);
  }
  await p.evaluate(()=>{ __m.length=0; start(); }); await p.waitForTimeout(1600); await p.evaluate(()=>stop());
  const played=await p.evaluate(()=>{ const h=__m.filter(m=>m.type==="hit").map(m=>m.id); return {n:h.length, kinds:[...new Set(h.map(x=>x.split(":").slice(0,2).join(":")))].join(" ")}; });
  ok(played.n>=12 && /T:kick/.test(played.kinds) && /T:snare/.test(played.kinds), "the groove-metal beat plays from the recordings: "+played.n+" hits, "+played.kinds);
  await p.evaluate(()=>{ S.segs[1].grid.kick[0]=1; S.segs[1].grid.snare[4]=1; S.segs[1].grid.ch[2]=1; S.segs[1].grid.ch[6]=1; save(); });
  await sel.selectOption({label:"Prog rock in two parts (4, then 7)"}); await p.waitForFunction(()=>S.bank==="S" && AOGDrumKit.ready("S"), null, {timeout:60000});
  const prog=await p.evaluate(()=>({seg:S.seg, track:S.track.join(","), on:S.trackOn, len2:S.segs[S.track[1]].len, hits2:hitsIn(S.segs[S.track[1]].grid), undo:!!S.undo}));
  ok(prog.track===prog.seg+","+(prog.seg+1) && prog.on && prog.len2===14 && prog.hits2>=8 && prog.undo, `the prog beat fills part ${prog.seg+1} and part ${prog.seg+2} (14 steps) and plays them in turn`);
  await p.click('#undoBeat'); await p.waitForTimeout(300);
  const back=await p.evaluate(()=>({bank:S.bank, k:S.segs[1].grid.kick[0], len:S.segs[1].len, on:S.trackOn, n:S.track.length}));
  ok(back.bank==="T" && back.k===1 && back.len===16 && !back.on && back.n===0, "Put my beat back returns the beat, part 2 and the track as they were");
  /* Send to the turntables */
  await p.evaluate(()=>bounceToDecks()); await p.waitForFunction(()=>/SENT|FAILED|NO PATTERN/.test(S.lcdNote||""), null, {timeout:60000});
  ok(await p.evaluate("S.lcdNote")==="SENT TO DECKS", "Send to the turntables works with a recorded kit: "+await p.evaluate("S.lcdNote"));
  /* reload: the kit comes back and loads again */
  await menu.selectOption({label:NAMES.R}); await p.waitForTimeout(1200);
  const before=await p.evaluate(()=>({bank:S.bank, ls:JSON.parse(localStorage.getItem(STORE)||"{}").bank}));
  await p.reload(); await p.waitForTimeout(1800);
  const after=await p.evaluate(()=>({bank:S.bank, ls:JSON.parse(localStorage.getItem(STORE)||"{}").bank}));
  ok(after.bank==="R", "after a reload kit R is still picked (before "+JSON.stringify(before)+", after "+JSON.stringify(after)+")");
  await p.click('.sp-pad[data-pad="snare"]'); await p.waitForFunction(()=>AOGDrumKit.ready("R") && engine && kitReady, null, {timeout:60000});
  ok(await p.evaluate(()=>/^R:snare:m/.test(chanMsg("snare",0,1).id) && padCaption(VOICES[7])==="SIZZLE"), "and its recordings play again (pad 8 SIZZLE)");
  /* Spanish */
  await p.evaluate(()=>{ S.lang="es"; paint(); }); await p.waitForTimeout(300);
  const es=await p.evaluate(()=>{ const s=document.querySelector('.kit-src').parentNode.querySelector('.aogdd-sel'); return {opt:[...s.options].map(o=>o.text).filter(t=>/^Kit [P-T]/.test(t)).join(" | "), grp:(s.querySelector("optgroup")||{}).label, foot:document.getElementById("foot").textContent}; });
  ok(/swing de big band/.test(es.opt) && es.grp==="Batería grabada" && /Karoryfer/.test(es.foot), "in Spanish: "+es.grp+": "+es.opt);
  await p.evaluate(()=>{ S.lang="en"; try{ localStorage.setItem("aog.lang","en"); }catch(e){} paint(); });
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  /* a phone: the menu and the pads */
  const ph=await b.newContext({...pw.devices["iPhone 13"]}); const q=await ph.newPage(); const e2=[]; q.on("pageerror",e=>e2.push(e.message));
  await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await q.goto(URL0); await q.waitForTimeout(1200);
  await q.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel').selectOption({label:NAMES.Q});
  await q.locator('.sp-pad[data-pad="snare"]').tap(); await q.waitForFunction(()=>AOGDrumKit.ready("Q"), null, {timeout:60000});
  const wide=await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
  ok(wide && e2.length===0, "iPhone: kit Q loads and plays, nothing sideways, no errors "+e2.join("|"));
  await q.screenshot({path:path.join(__dirname,"realkit-iphone.png")});
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
