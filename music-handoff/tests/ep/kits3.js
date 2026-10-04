/* AOG-DRUM-KITS-V3 — kits J to O. The Sounds menu lists A to O on both benches, in English and Spanish; each new kit's eight
   pads sound (1987 and 2026 copies), sit at the older kits' levels, never clip and are never cut off; the pads show the kit's
   names; and everything that walks BANKS keeps working: a sample of your own on a new kit is counted in the memory, kept in
   the session across a reload, written to a bench file and read back, Put the kit sounds back and its undo work there, an
   old bench file (kits A to I only) still opens, and a beat on a new kit goes to the turntables. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9986);
const U="http://localhost:9986/";
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const NEW={J:["Kit J · rock arena","Kit J · rock de estadio","KICK,SNARE,HAT,OPEN,CLAPS,TOM,STOMP,CRASH"],
  K:["Kit K · jazz brushes","Kit K · jazz con escobillas","KICK,BRUSH,CHICK,SWISH,SLAP,TOM,RIDE,BASS"],
  L:["Kit L · 909 house","Kit L · house 909","909,SNARE,HAT,OPEN,CLAP,TOM,RIDE,STAB"],
  M:["Kit M · reggae and dub","Kit M · reggae y dub","KICK,SNARE,HAT,OPEN,SYNTOM,TOM,XSTICK,SKANK"],
  N:["Kit N · afrobeat","Kit N · afrobeat","KICK,SNARE,SHAKER,OPEN,TALK,CONGA,STICKS,BELL"],
  O:["Kit O · marching band","Kit O · banda de marcha","BASS,SNARE,CLICK,CYMBAL,ROLL,TENOR,RIM,BELLS"]};
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}});
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto(U+"music-drums.html#home"); await p.waitForTimeout(1500);
  /* the menus */
  const kitSel=p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel');
  const opts=await kitSel.locator("option").allTextContents();
  ok(opts.length===20 && opts[0]==="Kit A · the classic" && Object.keys(NEW).every(k=>opts.indexOf(NEW[k][0])>=0) && opts.slice(9,15).join("|")===Object.keys(NEW).map(k=>NEW[k][0]).join("|"),
    "the Simple bench's Sounds menu lists A to O, the new ones last: "+opts.slice(9).join(", "));
  await p.evaluate(()=>{ S.lang="es"; paint(); }); await p.waitForTimeout(250);
  const esOpts=await p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel').locator("option").allTextContents();
  ok(esOpts.slice(9,15).join("|")===Object.keys(NEW).map(k=>NEW[k][1]).join("|"), "and in Spanish: "+esOpts.slice(9).join(", "));
  await p.evaluate(()=>{ S.lang="en"; S.bench="full"; paint(); }); await p.waitForTimeout(250);
  const fullOpts=await p.locator('.bank-src').locator('xpath=..').locator('.aogdd-sel').locator("option").allTextContents();
  ok(fullOpts.length===20 && fullOpts.slice(9,15).join("|")===Object.keys(NEW).map(k=>NEW[k][0]).join("|"), "the Full bench's kit menu lists them too");
  await p.evaluate(()=>{ S.bench="simple"; paint(); });
  /* every new kit: picked from the menu, its pads named, its sounds rendered and level */
  await p.click('.sp-pad[data-pad="kick"]'); await p.waitForTimeout(3500);
  for(const k of Object.keys(NEW)){
    await p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel').selectOption({label:NEW[k][0]}); await p.waitForTimeout(350);
    const r=await p.evaluate(async(k)=>{ await ensureKit(k);
      const faces=VOICES.map(v=>document.querySelector('.sp-pad[data-pad="'+v.id+'"]').childNodes[1].nodeValue.trim()).join(",");
      const tail=KIT_TAIL[k]||0.62, lo=romFor(k), hi=hiFor(k), st=[];
      for(const v of VOICES){ const d=lo[v.id], h=hi[v.id]; let pk=0, hp=0; for(const x of d) pk=Math.max(pk,Math.abs(x)); for(const x of h) hp=Math.max(hp,Math.abs(x));
        let endPk=0; for(let i=d.length-260;i<d.length;i++) endPk=Math.max(endPk,Math.abs(d[i]));
        st.push({id:v.id, pk:+pk.toFixed(2), hp:+hp.toFixed(2), len:+(d.length/26040).toFixed(2), cut:endPk>pk*0.05}); }
      return {bank:S.bank, faces, st, tail}; }, k);
    const bad=r.st.filter(x=>x.pk<0.05||x.pk>0.8||x.hp<0.05||x.hp>0.95||x.cut);
    ok(r.bank===k && r.faces===NEW[k][2] && !bad.length, `kit ${k}: pads ${r.faces.toLowerCase()}; every sound plays (peaks ${r.st.map(x=>x.pk).join(" ")}), none clips or is cut off ${JSON.stringify(bad)}`);
  }
  /* the new kits sit at the older kits' levels, pad for pad */
  const lv=await p.evaluate(()=>{ const pk=b=>VOICES.map(v=>{ let m=0; for(const x of romFor(b)[v.id]) m=Math.max(m,Math.abs(x)); return m; });
    const old=["A","C","D","E","F","G","H","I"].map(pk), nu=["J","K","L","M","N","O"].map(pk), out=[];
    VOICES.forEach((v,i)=>{ const lo=Math.min(...old.map(r=>r[i])), hi=Math.max(...old.map(r=>r[i])), n=nu.map(r=>r[i]); out.push({id:v.id, lo:+lo.toFixed(2), hi:+hi.toFixed(2), min:+Math.min(...n).toFixed(2), max:+Math.max(...n).toFixed(2)}); });
    return out; });
  ok(lv.every(x=>x.min>=x.lo*0.5 && x.max<=Math.max(0.75, x.hi*1.5)), "pad for pad, the new kits are as loud as the old ones: "+lv.map(x=>`${x.id} ${x.min}-${x.max} (old ${x.lo}-${x.hi})`).join(", "));
  /* a sample of my own on kit O: memory, session, reload */
  const own=await p.evaluate(async()=>{ await ensureKit("A"); useBank("O"); S.sel="ch"; paint();
    const m0=memUsed(), n=8000, L=new Float32Array(n); for(let i=0;i<n;i++) L[i]=Math.sin(i/6)*Math.exp(-i/1500)*0.8;
    await takeSample(new File([wavBlob(L, L, 26040)], "whistle.wav", {type:"audio/wav"}));
    trimOf("ch").start=0.25; save();
    return {m0, m1:memUsed(), has:!!USER.O.ch, name:USER_NAME.O.ch, len:USER.O.ch.length, face:document.querySelector('.sp-pad[data-pad="ch"]').textContent}; });
  ok(own.has && own.name==="WHISTL" && Math.abs(own.m1-own.m0-own.len/26040)<1e-6 && /WHISTL/.test(own.face), `a sound of my own on kit O pad 3 is named WHISTL and counted (${own.m0.toFixed(2)} → ${own.m1.toFixed(2)} s)`);
  await p.waitForTimeout(600);
  await p.reload(); await p.waitForTimeout(1800);
  const re=await p.evaluate(()=>({bank:S.bank, has:!!(USER.O&&USER.O.ch), len:USER.O&&USER.O.ch?USER.O.ch.length:0, name:USER_NAME.O&&USER_NAME.O.ch, trim:(S.trim.O&&S.trim.O.ch||{}).start, kit:(document.querySelector('.kit-src').parentNode.querySelector(".aogdd-sel")||{}).value}));
  ok(re.bank==="O" && re.has && re.len===own.len && re.name==="WHISTL" && re.trim===0.25, "after a reload kit O is still the kit, with my sound and its trim: "+JSON.stringify(re));
  /* a bench file: written with kit O in it, and read back */
  const file=await p.evaluate(()=>{ const o=sessionObject(); return {banks:Object.keys(o.samples), json:JSON.stringify(Object.assign({}, o, {samples:{O:{ch:{name:o.samples.O.ch.name, pcm:u8ToB64(new Uint8Array(o.samples.O.ch.pcm)), chord:0}}}}))}; });
  const back=await p.evaluate(async(json)=>{ kitSoundsBack(); S.kitUndo=null; useBank("A"); const gone=!USER.O.ch;
    await openWorkFile(new File([json], "bench.json", {type:"application/json"})); return {gone, has:!!USER.O.ch, name:USER_NAME.O.ch, bank:S.bank}; }, file.json);
  ok(file.banks.join(",")==="O" && back.gone && back.has && back.name==="WHISTL" && back.bank==="O", "a bench file carries kit O's sound out and back in: "+JSON.stringify(back));
  /* Put the kit sounds back, and its undo, on kit O */
  await p.click("[data-resetkit]"); await p.waitForTimeout(250);
  const r1=await p.evaluate(()=>({has:!!USER.O.ch, face:document.querySelector('.sp-pad[data-pad="ch"]').textContent}));
  await p.click("[data-kitundo]"); await p.waitForTimeout(250);
  const r2=await p.evaluate(()=>({has:!!USER.O.ch, name:USER_NAME.O.ch}));
  ok(!r1.has && /CLICK/.test(r1.face) && r2.has && r2.name==="WHISTL", "on kit O, Put the kit sounds back brings back CLICK, and Put my sounds back brings back my sound");
  /* an old bench file, from before kits J to O, still opens */
  const old=await p.evaluate(async()=>{ const o={aog:"drum-bench", v:2, bpm:100, bank:"I", samples:{C:{kick:{name:"OLD", pcm:u8ToB64(packI16(new Float32Array(2000).fill(0.25))), chord:0}}}, trim:{A:{},B:{},C:{},D:{},E:{},F:{},G:{},H:{},I:{}}};
    await openWorkFile(new File([JSON.stringify(o)], "old.json", {type:"application/json"}));
    return {bank:S.bank, c:!!USER.C.kick, o:!!USER.O.ch, trimO:typeof S.trim.O, lcd:document.getElementById("lcd").textContent.split("\n")[0]}; });
  ok(old.bank==="I" && old.c && !old.o && old.trimO==="object", "an old bench file (kits A to I) opens: "+JSON.stringify(old));
  /* a beat on a new kit goes to the turntables */
  await p.evaluate(()=>{ kitSoundsBack(); S.kitUndo=null; useBank("L"); const sg=segNow(); sg.grid=emptyGrid(); useSeg(S.seg); S.grid.kick=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; S.grid.clap=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; S.grid.bell=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]; save(); paint(); });
  await p.evaluate(()=>bounceToDecks()); await p.waitForTimeout(500);
  const bounce=await p.evaluate(async()=>{ const x=await AOGHandoff.get("drumbench"); if(!x) return null; const buf=await new OfflineAudioContext(2,1,44100).decodeAudioData(await x.wav.arrayBuffer());
    const d=buf.getChannelData(0); let pk=0; for(const v of d) pk=Math.max(pk,Math.abs(v)); return {bank:x.bank, sec:+buf.duration.toFixed(1), peak:+pk.toFixed(2)}; });
  ok(bounce && bounce.bank==="L" && bounce.peak>0.1 && bounce.sec>15, "a house beat on kit L goes to the turntables: "+JSON.stringify(bounce));
  /* the kits lesson counts the new kits too */
  await p.evaluate(()=>{ LS.kp={}; });
  for(const k of ["J","M","O"]){ await p.evaluate(k=>{ useBank(k); paint(); }, k); await p.keyboard.press("Space"); await p.waitForTimeout(250); await p.keyboard.press("Space"); }
  ok(await p.evaluate(()=>!!(LS.kp && LS.kp.J && LS.kp.M && LS.kp.O)), "playing a beat on kits J, M and O counts for the kits lesson");
  ok(await p.evaluate(()=>LESSONS.find(m=>m.id==="lkits").en==="Same beat, new sounds: the kits" && /twenty kits/.test(STR.tag.en) && /veinte kits/.test(STR.tag.es) && /Kits C to O/.test(STR.hear.en)), "the words that count the kits say fifteen, or no number");
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
