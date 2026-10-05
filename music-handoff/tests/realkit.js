/* The recorded kits (AOG-DRUM-REAL-V1: P to T; AOG-DRUM-REAL-V2: the kits D, E, G to K and M to O that used to be made on
   the page, and the five new kits U to Y): each loads when picked with a calm line, every pad sounds at soft / normal / accent,
   layers and takes rotate, levels sit with kit A (new kits) or where the page-made kit sat (rebuilt kits), the era dial, TRIM,
   a user sample and Put the kit sounds back, kit M's synth tom still drawn by the page, the beats that come with the recorded
   kits (the prog and the 1970s ones in two parts, with undo), Send to the turntables, memory untouched, reload, Spanish, a phone.
   Renders go through the page's own engine (lib/meter.js). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path");
const srv=require("./srv.js")(9915);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const URL0="http://localhost:9915/music-drums.html#home";
const NAMES={P:"Kit P · studio session, dry",Q:"Kit Q · big room rock",R:"Kit R · big-band swing",S:"Kit S · prog rock, many toms",T:"Kit T · groove metal",
  /* AOG-DRUM-REAL-V2 */
  D:"Kit D · dusty breaks",E:"Kit E · boom bap",G:"Kit G · lo-fi",H:"Kit H · Latin percussion",I:"Kit I · live drums",J:"Kit J · rock arena",K:"Kit K · jazz brushes",
  L:"Kit L · 909 house",M:"Kit M · reggae and dub",N:"Kit N · afrobeat",O:"Kit O · marching band",
  U:"Kit U · jazz club",V:"Kit V · brush ballad",W:"Kit W · studio funk",X:"Kit X · 1970s vintage",Y:"Kit Y · hip-hop break"};
const REAL=["D","E","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y"];
const NEWKITS=["P","Q","R","S","T","U","V","W","X","Y"];          /* made new as recordings: kick and snare at kit A's level */
const REBUILT=["D","E","G","H","I","J","K","L","M","N","O"];   /* AOG-DRUM-909-V1: and L, a real TR-909 */            /* were made on the page: each pad where the page-made pad sat */
/* the page-made kits through the same meter, the day they were rebuilt (K-weighted, era 1987, a normal hit) */
const PAGE={D:[-25.9,-37.4,-54.8,-43.1,-44.7,-28.8,-36.7,-30.6],E:[-22.7,-35.6,-56.4,-46.5,-39.5,-24.6,-41.9,-42.7],G:[-23.7,-37.6,-46.4,-44.6,-44.3,-26.7,-37.9,-28.7],
  H:[-21.9,-30.0,-44.0,-49.4,-36.1,-26.6,-32.5,-31.7],I:[-22.8,-33.7,-65.5,-47.5,-40.8,-23.1,-42.0,-31.3],J:[-21.5,-32.9,-65.7,-48.0,-38.8,-22.7,-27.1,-28.8],
  K:[-23.7,-42.3,-63.4,-35.4,-37.5,-26.3,-38.5,-23.5],L:[-19.9,-38.8,-67.2,-56.3,-38.3,-25.3,-51.5,-33.8],M:[-21.9,-38.5,-59.2,-48.0,-26.7,-26.6,-40.0,-41.4],N:[-24.6,-38.3,-46.3,-48.9,-25.6,-28.3,-36.4,-32.6],
  O:[-20.6,-40.8,-42.6,-35.4,-47.4,-26.9,-40.2,-26.5]};
/* where each rebuilt pad was set (music-handoff/tools/drumkits/kits.py TARGET): the page-made level, except closed hats no
   quieter than -54 (the page-made ones were nearly silent), and J's hats, K's hi-hat foot and O's roll lifted so their normal hit
   still peaks at 0.05 or more in the 1987 memory */
const LIFT={I:{ch:-54.0},J:{ch:-51.0,oh:-46.7},K:{ch:-49.0},L:{ch:-51.5,oh:-45.5,rim:-41.5},M:{ch:-54.0},O:{clap:-43.3}};
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
  const errs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error" && !/favicon/.test(m.text())) errs.push(m.text()); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  let slow=0; await p.route(/\/audio\/drums\//, async r=>{ if(slow) await new Promise(x=>setTimeout(x, slow)); r.continue(); });
  await p.goto(URL0); await p.waitForTimeout(1200);
  await p.addScriptTag({content: fs.readFileSync(path.join(__dirname,"lib/meter.js"),"utf8")});
  ok(await p.evaluate("BANKS.join('')")==="ABCDEFGHIJKLMNOPQRSTUVWXY", "BANKS: A to Y: "+await p.evaluate("BANKS.join('')"));
  const menu=p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel');
  const opts=await menu.locator("option").allTextContents();
  const grps=await menu.locator("optgroup").evaluateAll(gs=>gs.map(g=>({label:g.label, n:g.children.length, first:g.children[0]&&g.children[0].text})));
  const top=opts.slice(0,5).map(t=>t.split(" · ")[0].slice(4)).join("");
  ok(opts.length===25 && Object.values(NAMES).every(n=>opts.includes(n)) && grps.length===1 && grps[0].label==="Recorded drums" && grps[0].n===20 && top==="ABCFL",
    `the Sounds menu lists 25 kits: the drum-machine kits ${top} first, then the twenty recorded ones under "${grps[0]&&grps[0].label}" (${grps[0]&&grps[0].n})`);
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
  for(const k of ["P"].concat(REAL.filter(x=>x!=="P"))){          /* P was loaded just above, slowly */
    if(k!=="P"){ await menu.selectOption({label:NAMES[k]}); await p.waitForFunction(b=>AOGDrumKit.ready(b), k, {timeout:60000}); }
    counts[k]=await p.evaluate(b=>{ const files=VOICES.map(v=>{ const f=AOGDrumKit.files(b,v.id); return f.s.length+f.m.length+f.h.length; }).reduce((a,x)=>a+x,0);
      return {bank:S.bank, files, rom:VOICES.every(v=>ROMK[b][v.id]&&ROMK[b][v.id].length>1000&&HIK[b][v.id]&&HIK[b][v.id].length>1000), names:VOICES.map(v=>padCaption(v)).join(" ")}; }, k);
    ok(counts[k].bank===k && counts[k].rom, `kit ${k} loads: ${counts[k].files} recordings, pads ${counts[k].names}`);
  }
  ok(await p.evaluate("Object.keys(ROMK).filter(k=>realKit(k)).length")<=2, "only the last two recorded kits stay in memory: "+await p.evaluate("Object.keys(ROMK).filter(k=>realKit(k)).join(',')"));
  ok(Math.abs(await p.evaluate("+memUsed().toFixed(3)")-mem0)<0.001, "the recorded kits use none of the 10 s sample memory ("+mem0+" s before and after)");
  /* every pad, three velocities, through the engine (1987 end of the dial) */
  const vel=await p.evaluate(async (REAL)=>{
    const out={};
    for(const b of REAL){ out[b]={};
      for(const v of VOICES){ const r={}; for(const [n,x] of [["soft",3],["normal",1],["accent",2]]) r[n]=await __meter.hit(b, v.id, x, 1); out[b][v.id]=r; } }
    return out; }, REAL);
  let quiet=[], order=[];
  for(const k in vel) for(const id in vel[k]){ const r=vel[k][id];
    ["soft","normal","accent"].forEach(n=>{ if(!(r[n].peak>-45)) quiet.push(k+" "+id+" "+n+" "+r[n].peak); });
    if(!(r.soft.mom<r.normal.mom && r.normal.mom<r.accent.mom+0.5)) order.push(k+" "+id+" "+r.soft.mom+"/"+r.normal.mom+"/"+r.accent.mom); }
  ok(!quiet.length, `every pad of every recorded kit sounds at soft, normal and accent (${REAL.length*24} hits) `+quiet.join("; "));
  ok(!order.length, "soft is quieter than normal, accent at least as loud "+order.join("; "));
  /* levels: kick and snare of the new kits against kit A; a rock beat against the kits A to O */
  const lv=await p.evaluate(async (NEWKITS)=>{
    const A={kick:(await __meter.hit("A","kick",1,1)).mom, snare:(await __meter.hit("A","snare",1,1)).mom}, rock={};
    for(const b of BANKS) rock[b]=(await __meter.pattern(b, 1)).integ;
    const k={}; for(const b of NEWKITS) k[b]={kick:(await __meter.hit(b,"kick",1,1)).mom, snare:(await __meter.hit(b,"snare",1,1)).mom};
    return {A, rock, k}; }, NEWKITS);
  const built=Object.keys(lv.rock).filter(x=>x<"P").map(x=>lv.rock[x]).sort((a,b)=>a-b), med=built[Math.floor(built.length/2)];
  for(const k of NEWKITS){
    const dk=lv.k[k].kick-lv.A.kick, ds=lv.k[k].snare-lv.A.snare, dr=lv.rock[k]-med;
    ok(Math.abs(dk)<=2.5 && Math.abs(ds)<=3.5 && lv.rock[k]>=built[0]-0.5 && lv.rock[k]<=built[built.length-1] && Math.abs(dr)<=3.5,
      `kit ${k}: kick ${lv.k[k].kick.toFixed(1)} LU (kit A ${lv.A.kick.toFixed(1)}), snare ${lv.k[k].snare.toFixed(1)} (kit A ${lv.A.snare.toFixed(1)}), rock beat ${lv.rock[k].toFixed(1)} (kits A–O ${built[0].toFixed(1)} to ${built[built.length-1].toFixed(1)}, middle ${med.toFixed(1)})`);
  }
  /* AOG-DRUM-REAL-V2: a rebuilt kit keeps its balance: each pad within 1 LU of where it was set, never quieter than its page-made sound */
  const ids=["kick","snare","ch","oh","clap","tom","rim","bell"];
  for(const k of REBUILT){
    const off=[], lifts=[];
    ids.forEach((id,i)=>{ const want=(LIFT[k]&&LIFT[k][id]!=null)?LIFT[k][id]:PAGE[k][i], got=vel[k][id].normal.mom;
      if(LIFT[k]&&LIFT[k][id]!=null) lifts.push(`${id} ${PAGE[k][i]}→${want}`);
      if(!(Math.abs(got-want)<=1.0 && want>=PAGE[k][i])) off.push(`${id} ${got.toFixed(1)} (set ${want}, page-made ${PAGE[k][i]})`); });
    ok(!off.length, `kit ${k} sits where its page-made kit sat, pad for pad (±1 LU)${lifts.length?"; lifted: "+lifts.join(", "):""} ${off.join("; ")}`);
  }
  /* kit M: its synth tom is still drawn by the page (an electronic drum), the rest are recordings */
  await menu.selectOption({label:NAMES.M}); await p.waitForFunction(()=>AOGDrumKit.ready("M") && engine && kitReady, null, {timeout:60000});
  const syn=await p.evaluate(async()=>{ const m=chanMsg("clap",0,1), s=chanMsg("snare",0,1); return {id:m.id, cut:Math.round(m.cutoff), sid:s.id, made:AOGDrumKit.made("M","clap"), face:padCaption(VOICES[4]), pk:(await __meter.hit("M","clap",1,1)).peak}; });
  ok(syn.made && syn.id==="clap" && syn.cut<8500 && /^M:snare:m/.test(syn.sid) && syn.face==="SYNTOM" && syn.pk>-30,
    `kit M: the synth tom is drawn here (${syn.id}, its own filter at ${syn.cut} Hz, ${syn.pk} dBFS), the snare is a recording (${syn.sid})`);
  /* the dial, the outputs and the takes */
  await p.evaluate(()=>{ useBank("T"); paint(); window.__m=[]; const pm=engine.port.postMessage.bind(engine.port); engine.port.postMessage=(m,t)=>{ window.__m.push(Object.assign({}, m, {n:m.samples?m.samples.byteLength/4:0})); return pm(m,t); }; });
  await p.waitForFunction(()=>AOGDrumKit.ready("T"), null, {timeout:60000}); await p.waitForTimeout(300);
  await p.locator('#era').fill("100"); await p.locator('#era').dispatchEvent("input");
  const hits=await p.evaluate(()=>{ __m.length=0; const t=ctx().currentTime+0.05; for(let i=0;i<6;i++) hit("kick", t+i*0.02, true, 1); hit("snare", t, true, 2); hit("snare", t, true, 3); hit("clap", t, true, 1); hit("rim", t, true, 2);
    return __m.filter(m=>m.type==="hit").map(m=>m.id+"|"+m.era+"|"+Math.round(m.cutoff)+"|"+(m.raw?1:0)); });
  const kicks=hits.filter(x=>x.startsWith("T:kick:m")).map(x=>x.split("|")[0]);
  ok(new Set(kicks).size===4, "the double-kick takes rotate: "+kicks.join(" "));
  ok(hits.some(x=>x.startsWith("T:snare:h"))&&hits.some(x=>x.startsWith("T:snare:s")), "accent and soft play their own recordings: "+hits.filter(x=>/snare/.test(x)).join(" "));
  ok(hits.every(x=>x.split("|")[1]==="0") && hits.filter(x=>/kick|snare/.test(x)).every(x=>x.endsWith("|1")) && hits.filter(x=>/clap|rim/.test(x)).every(x=>x.split("|")[2]==="18000"),
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
  /* the beats that came with the recorded kits (P to Y), and the older beats whose kits are recordings now */
  const sel=p.locator('.starter-row .aogdd-sel');
  for(const [label,k] of [["Half-time shuffle","P"],["Big heavy room groove","Q"],["Big-band swing","R"],["Fast swing (bebop)","U"],["Brush ballad","V"],["Funk with ghost notes","W"],
                          ["Break from an old record","Y"],["Boom bap (90s hip-hop)","E"],["Lo-fi study beat","G"],["Latin groove","H"],["Funk break","I"],["Groove metal, double kick","T"]]){
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
  /* AOG-DRUM-REAL-V2: the 1970s beat has its tom fill in a second part */
  await sel.selectOption({label:"1970s rock with a tom fill"}); await p.waitForFunction(()=>S.bank==="X" && AOGDrumKit.ready("X"), null, {timeout:60000});
  const r70=await p.evaluate(()=>{ const g2=S.segs[S.track[1]].grid; return {track:S.track.length, on:S.trackOn, bpm:S.bpm, fill:g2.clap.filter(Boolean).length+g2.tom.filter(Boolean).length, hits:hitsIn(S.grid)}; });
  ok(r70.track===2 && r70.on && r70.bpm===92 && r70.fill===4 && r70.hits>=8, "the 1970s rock beat: kit X, a groove, then the groove with a fill on the toms ("+JSON.stringify(r70)+")");
  await p.click('#undoBeat'); await p.waitForTimeout(300);
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
  const es=await p.evaluate(()=>{ const s=document.querySelector('.kit-src').parentNode.querySelector('.aogdd-sel'); return {opt:[...s.options].map(o=>o.text).filter(t=>/^Kit [D-Y]/.test(t)).join(" | "), grp:(s.querySelector("optgroup")||{}).label, foot:document.getElementById("foot").textContent}; });
  ok(/swing de big band/.test(es.opt) && /club de jazz/.test(es.opt) && /balada con escobillas/.test(es.opt) && /funk de estudio/.test(es.opt) && /vintage de los años 70/.test(es.opt) && /break de hip-hop/.test(es.opt)
    && /percusión latina/.test(es.opt) && es.grp==="Batería grabada" && /Karoryfer/.test(es.foot) && /Versilian/.test(es.foot), "in Spanish: "+es.grp+": "+es.opt);
  await p.evaluate(()=>{ S.lang="en"; try{ localStorage.setItem("aog.lang","en"); }catch(e){} paint(); });
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  /* a phone: the menu and the pads */
  const ph=await b.newContext({...pw.devices["iPhone 13"]}); const q=await ph.newPage(); const e2=[]; q.on("pageerror",e=>e2.push(e.message));
  await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await q.goto(URL0); await q.waitForTimeout(1200);
  for(const k of ["Q","V"]){
    await q.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel').selectOption({label:NAMES[k]});
    await q.locator('.sp-pad[data-pad="snare"]').tap(); await q.waitForFunction(b=>AOGDrumKit.ready(b), k, {timeout:60000});
  }
  const wide=await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
  ok(wide && e2.length===0, "iPhone: kits Q and V load and play, nothing sideways, no errors "+e2.join("|"));
  await q.screenshot({path:path.join(__dirname,"realkit-iphone.png")});
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
