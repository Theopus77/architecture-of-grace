/* AOG-DRUM-MORE-V1 (2026-10-18) — more drum kits. Jimmy: "Can we get more drum kits produced?", then "Choose them all!"
   For every new kit (NEW below) on the Drum Machine and the Drum Kit:
   · it is listed in its group of the kit menus (Drum sets, Electronic, World, Orchestra and marching, Hand percussion),
     in English and Spanish, and nothing of it is fetched until it is picked; then only its own folder;
   · every pad sounds at soft, normal and hard, each louder than the one below, and no hit clips;
   · a strength recorded more than once plays the next take on the next hit;
   · each pad says what it is, in English and in Spanish;
   · the kit sits at its level on the Drum Machine: a bar of plain beat within 0.1 dB of pads/level.js's target (or as
     loud as its peaks allow, "held");
   · on the Drum Kit every kit, old and new, plays a bar of plain beat within 0.5 dB of the kits' middle level, through
     its own trim (KIT_LEVEL, AOG-KIT-LEVEL-V1);
   · each kit's grooves bring the kit and wait for Play; no page errors.
     node music-handoff/tests/pads/morekits.js              the checks
     node music-handoff/tests/pads/morekits.js --table      also prints the new kits' LEVEL.kit trims for music-pads.html
     node music-handoff/tests/pads/morekits.js --kittable   also prints KIT_LEVEL for music-kit.html (every kit)
     node music-handoff/tests/pads/morekits.js OR,SB        only these new kits (the Drum Kit's level check still covers all)
   Ports 9400 (the Drum Machine), 9401 (the Drum Kit), 9402 (the piano, for the target). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs");
const srvA=require("../srv.js")(9400), srvB=require("../srv.js")(9401), srvC=require("../srv.js")(9402);
const MEASURE=(0,eval)(fs.readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
const TABLE=process.argv.includes("--table"), KTABLE=process.argv.includes("--kittable");
const ONLY=(process.argv.slice(2).find(a=>/^[A-Z0-9]{2}(,[A-Z0-9]{2})*$/.test(a))||"").split(",").filter(Boolean);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
/* the new kits: id → its folder and its group */
const ALLNEW={OR:["orchestra","orch"], ME:["mideast","world"]};
const NEW=Object.fromEntries(Object.entries(ALLNEW).filter(([k])=>!ONLY.length || ONLY.includes(k)));
const IDS=Object.keys(NEW), DIRS=Object.fromEntries(Object.entries(ALLNEW).map(([k,v])=>[k,"/audio/drums/"+v[0]+"/"]));
const GROUP_EN={drums:"Drum sets", electronic:"Electronic", world:"World", orch:"Orchestra and marching", hand:"Hand percussion"};
const GROUP_ES={drums:"Baterías", electronic:"Electrónica", world:"Del mundo", orch:"Orquesta y banda de marcha", hand:"Percusión de mano"};
const PADS=["kick","snare","ch","oh","clap","tom","rim","bell"];
const IPHONE={viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2};
/* the Drum Machine's whole sound, as pads/level.js renders it: the bus at 0.9 into the limiter */
const RENDER=`window.__render=async(sec, fn)=>{ const oc=new OfflineAudioContext(2, Math.round(44100*sec), 44100), g=oc.createGain(), l=oc.createDynamicsCompressor();
  l.threshold.value=-3; l.knee.value=2; l.ratio.value=20; l.attack.value=0.002; l.release.value=0.12;
  g.gain.value=0.9; g.connect(l); l.connect(oc.destination);
  fn({c:oc, dest:g, open:[[],[],[],[]], chop:[null,null,null,null]}); const buf=await oc.startRendering();
  let pk=0; for(let ch=0;ch<buf.numberOfChannels;ch++){ const d=buf.getChannelData(ch); for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); if(a>pk) pk=a; } }
  return {buf, pk, kw:__kw(buf)}; };
window.__wait=bi=>new Promise((ok,no)=>{ const t0=Date.now(); const c=()=>{ if(isReady(bi)) ok(); else if(Date.now()-t0>90000) no(new Error("not ready")); else setTimeout(c,30); }; prep(bi); c(); });
/* one bar of plain beat at 90: eighth-note hats, kick on 1 and the "and" of 3, snare on 2 and 4 (pads/level.js) */
window.__bar=T=>{ const e=60/90/2; for(let i=0;i<8;i++){ const t=0.05+i*e; trigger(0, 2, i%2?0.6:0.8, t, T); if(i===0||i===5) trigger(0, 0, 0.8, t, T); if(i===2||i===6) trigger(0, 1, 0.8, t, T); } };`;
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(port, page, opt, lang)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[], urls=[];
    p.on("pageerror",e=>errs.push(e.message)); p.on("request", r=>urls.push(r.url()));
    await p.addInitScript(()=>{ window.FACES=()=>[...document.querySelectorAll("#pads .pad")].sort((a,b)=>a.dataset.p-b.dataset.p).map(x=>x.querySelector(".pn").textContent); });
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.addInitScript(l=>{ try{ localStorage.removeItem("aog.pads.v1"); localStorage.removeItem("aog.kit.v1"); localStorage.setItem("aog.lang", l); }catch(e){} }, lang||"en");
    await p.goto(`http://localhost:${port}/${page}`); await p.waitForTimeout(900);
    return {c, p, errs, urls, fetched:()=>Object.keys(DIRS).filter(k=>urls.some(u=>u.includes(DIRS[k])))};
  };
  /* the target: the grand piano's C chord on the piano page, 2 dB under it, a kit 6 dB under that (pads/level.js) */
  let ref;
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9402/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    ref=await p.evaluate(async()=>{ await loadSet("grand");
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"grand"); setEra(ch,0,0);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,"grand",m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); });
    await p.close(); }
  const TARGET=ref-2-6, KIT_CLEAN=1.25;

  /* ══ the Drum Machine ══ */
  if(IDS.length){ const {c, p, errs, fetched}=await open(9400, "music-pads.html", IPHONE); console.log("== the Drum Machine · iPhone");
    await p.waitForFunction(()=>window.isReady && window.AOGDrumKit, null, {timeout:60000});
    await p.addScriptTag({content:MEASURE}); await p.addScriptTag({content:RENDER});
    const menu=await p.evaluate(()=>[...document.querySelectorAll("#fKitA optgroup")].map(g=>[g.label, [...g.querySelectorAll("option")].map(o=>[o.value,o.textContent])]));
    for(const k of IDS){ const g=menu.find(x=>x[0]===GROUP_EN[NEW[k][1]]), en=await p.evaluate(k=>AOGDrumKit.label(k)[0], k);
      ok(!!g && g[1].some(o=>o[0]===k && o[1]===en), `${k} "${en}" is in the kit menu under ${GROUP_EN[NEW[k][1]]}`); }
    ok(menu.map(x=>x[0]).join("|")===Object.values(GROUP_EN).filter(g=>menu.some(x=>x[0]===g)).join("|") && menu.length>=4, "the kit menus are in groups, in order: "+menu.map(x=>x[0]+" ("+x[1].length+")").join(", "));
    const same=await p.evaluate(()=>["#fKitB","#fKitC"].every(s=>document.querySelectorAll(s+" option").length===document.querySelectorAll("#fKitA option").length));
    ok(same, "pads 9 to 16 and 17 to 24 offer the same kits");
    await p.waitForTimeout(600);
    ok(fetched().length===0, "nothing of the new kits is fetched before one is picked");
    const lv={}, held={}, peak={}, R={};
    for(const k of IDS){
      const before=fetched().length;
      await p.selectOption("#fKitA", k);
      await p.waitForFunction(k=>AOGDrumKit.state(k) && AOGDrumKit.state(k).state==="ready" && isReady(0), k, {timeout:90000}).catch(()=>{});
      const f=fetched();
      ok(f.includes(k) && f.length===before+1, `picking ${k} fetches its own folder only (${DIRS[k]})`);
      const out=await p.evaluate(async(k)=>{
        Object.assign(S.banks[0], {type:"drums", kitA:k, kitB:k}); await __wait(0);
        const bar=await __render(8*(60/90/2)+0.6, __bar);
        const trim=(LEVEL.kit && LEVEL.kit[k]) || 0;
        const faces=FACES().slice(0,8), words=["kick","snare","ch","oh","clap","tom","rim","bell"].map(id=>[AOGDrumKit.padWord(k,id,"en"), AOGDrumKit.padWord(k,id,"es")]);
        const pads=[];
        for(let pi=0;pi<8;pi++){ const row={pi};
          for(const [nm,v,top] of [["s",0.5,0.61],["m",0.8,0.88],["h",1.0,1.0]]){ let kw=0, pk=0; const bufs=new Set();
            for(let j=0;j<3;j++){ let o=null; const pd=AOGDrumKit.playDirect; AOGDrumKit.playDirect=function(){ return (o=pd.apply(this, arguments)); };
              const r=await __render(2.6, T=>trigger(0, pi, v, 0.05, T)); AOGDrumKit.playDirect=pd; kw+=r.kw/3; pk=Math.max(pk, r.pk);
              if(o){ const d=o.src.buffer.getChannelData(0); let h=0; for(let i=0;i<Math.min(d.length, 4000);i++) h+=d[i]*(i%7+1); bufs.add(d.length+":"+h.toFixed(6)); } }
            for(let j=0;j<3;j++) pk=Math.max(pk, (await __render(2.6, T=>trigger(0, pi, top, 0.05, T))).pk);
            row[nm]=+kw.toFixed(1); row[nm+"pk"]=+pk.toFixed(2); row[nm+"n"]=bufs.size; }
          pads.push(row); }
        return {bar:bar.kw, pk:bar.pk, trim, faces, words, takes:["kick","snare","ch","oh","clap","tom","rim","bell"].map(id=>AOGDrumKit.takes(k,id)), pads};
      }, k);
      R[k]=out;
      const name=(await p.evaluate(k=>AOGDrumKit.label(k)[0], k));
      ok(out.words.every(w=>w[0] && w[1]) && JSON.stringify(out.faces)===JSON.stringify(out.words.map(w=>w[0])), `${name}: pads 1 to 8 say what they are: `+out.faces.join(", "));
      const rows=out.pads, silent=rows.filter(r=>["s","m","h"].some(n=>r[n+"pk"]<0.02 || r[n]<-60)), clip=rows.filter(r=>["s","m","h"].some(n=>r[n+"pk"]>=0.96));
      ok(!silent.length && !clip.length, `${name}: all 8 pads sound at three strengths and none clips (hard peaks ${rows.map(r=>r.hpk).join(" ")}) ${JSON.stringify(silent.concat(clip))}`);
      const order=rows.filter(r=>!(r.s<r.m+0.3 && r.m<r.h+0.3 && r.s<r.h));
      ok(!order.length, `${name}: soft is softer than normal, normal softer than hard: `+rows.map(r=>`${r.pi+1} ${r.s}/${r.m}/${r.h}`).join(", "));
      ok(rows.every(r=>["s","m","h"].every(n=>r[n+"n"]===Math.min(3, out.takes[r.pi][["s","m","h"].indexOf(n)]))) && rows.filter(r=>r.mn>1).length>=4,
        `${name}: the next hit plays the next take (takes heard at soft/normal/hard: `+rows.map(r=>`${r.pi+1} ${r.sn}/${r.mn}/${r.hn}`).join(", ")+")");
      /* the level, as pads/level.js reckons it */
      const off=out.bar-TARGET, room=out.pk>0 ? 20*Math.log10(KIT_CLEAN/out.pk) : 99, want=-off, step=Math.min(want, room);
      lv[k]=Math.round((out.trim+step)*10)/10; peak[k]=out.pk; held[k]=want>room+0.3 && room<0.6;
      ok((Math.abs(off)<=0.1 || held[k]) && out.pk<=KIT_CLEAN+0.03, `${name}: a bar of plain beat is ${off>=0?"+":""}${off.toFixed(2)} dB from the Drum Machine's kit target${held[k]?" (held by its peak "+out.pk.toFixed(2)+")":""}; peak ${out.pk.toFixed(2)}`);
    }
    if(TABLE) console.log("LEVEL.kit "+JSON.stringify(lv));
    /* the grooves */
    const grooves=await p.evaluate(ids=>AOGDrumKit.starters.filter(s=>ids.includes(s.kit)).map(s=>({id:s.id, kit:s.kit, grp:s.grp})), IDS);
    ok(IDS.every(k=>grooves.some(g=>g.kit===k)), "every new kit has a groove of its own: "+grooves.map(g=>g.id).join(", "));
    for(const g of grooves){
      await p.evaluate(()=>{ S.banks[0].kitA="P"; });
      const gl=await p.evaluate(gr=>[...document.querySelectorAll("#grpSel option")].some(o=>o.value===gr), g.grp);
      await p.selectOption("#grpSel", g.grp).catch(()=>{}); await p.waitForTimeout(150);
      await p.selectOption("#startSel", g.id).catch(()=>{}); await p.waitForTimeout(300);
      const st=await p.evaluate(()=>({kit:S.banks[0].kitA, on:SEQ.on, n:S.ev.filter(e=>e.b===0).length, beat:S.beat&&S.beat.id}));
      ok(gl && st.kit===g.kit && !st.on && st.n>0 && st.beat===g.id, `the groove ${g.id} sits in its group, brings ${g.kit} and waits for Play`);
    }
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  /* the Drum Machine in Spanish */
  if(IDS.length){ const {c, p, errs}=await open(9400, "music-pads.html", IPHONE, "es"); console.log("== la caja de ritmos · en español");
    await p.waitForFunction(()=>window.isReady && window.AOGDrumKit, null, {timeout:60000});
    const menu=await p.evaluate(()=>[...document.querySelectorAll("#fKitA optgroup")].map(g=>g.label));
    ok(menu.join("|")===Object.values(GROUP_ES).filter(g=>menu.includes(g)).join("|") && menu.length>=4, "los grupos del menú de kits: "+menu.join(", "));
    for(const k of IDS){
      await p.selectOption("#fKitA", k); await p.waitForTimeout(250);
      const r=await p.evaluate(k=>({faces:FACES().slice(0,8), es:["kick","snare","ch","oh","clap","tom","rim","bell"].map(id=>AOGDrumKit.padWord(k,id,"es")), name:AOGDrumKit.label(k)[1], opt:[...document.querySelectorAll("#fKitA option")].find(o=>o.value===k).textContent}), k);
      ok(JSON.stringify(r.faces)===JSON.stringify(r.es) && r.opt===r.name, `${r.name}: `+r.faces.join(", "));
    }
    ok(errs.length===0, "sin errores en la página "+errs.join(" | "));
    await c.close();
  }

  /* ══ the Drum Kit ══ */
  { const {c, p, errs, fetched}=await open(9401, "music-kit.html", IPHONE); console.log("== the Drum Kit · iPhone");
    await p.waitForFunction(()=>{ const s=window.AOGDrumKit && AOGDrumKit.state(S.bank); return s && s.state==="ready"; }, null, {timeout:60000}).catch(()=>{});
    await p.addScriptTag({content:MEASURE});
    const menu=await p.evaluate(()=>[...document.querySelectorAll("#kitSel optgroup")].map(g=>[g.label, [...g.querySelectorAll("option")].map(o=>o.value)]));
    ok(menu.map(x=>x[0]).join("|")===Object.values(GROUP_EN).filter(g=>menu.some(x=>x[0]===g)).join("|") && IDS.every(k=>menu.some(g=>g[0]===GROUP_EN[NEW[k][1]] && g[1].includes(k))),
      "the kit menu is in groups, each new kit in its own: "+menu.map(x=>x[0]+" ("+x[1].length+")").join(", "));
    ok(fetched().length===0, "nothing of the new kits is fetched before one is picked");
    /* every kit, old and new: a bar of plain beat through this page's own sound and the kit's trim */
    const all=await p.evaluate(()=>KITS());
    const kl={};
    for(const k of all){
      kl[k]=await p.evaluate(async k=>{
        await AOGDrumKit.load(k, {}, {}, x=>x, null, {hiOnly:true});
        const oc=new OfflineAudioContext(2, Math.round(44100*(8*(60/90/2)+0.6)), 44100), m=makeChain(oc);
        if(m.rig && m.rig.ready) await m.rig.ready();
        const e=60/90/2, d=trimTo(oc, m.bus, k);
        for(let i=0;i<8;i++){ const t=0.05+i*e; AOGDrumKit.playDirect(oc, d, k, "ch", t, i%2?3:0, 0.5);
          if(i===0||i===5) AOGDrumKit.playDirect(oc, d, k, "kick", t, 0, 0.5); if(i===2||i===6) AOGDrumKit.playDirect(oc, d, k, "snare", t, 0, 0.5); }
        const buf=await oc.startRendering(); let pk=0; for(let ch=0;ch<2;ch++){ const x=buf.getChannelData(ch); for(let i=0;i<x.length;i++) pk=Math.max(pk, Math.abs(x[i])); }
        return {kw:__kw(buf), trim:KIT_LEVEL[k]||0, pk};
      }, k);
    }
    const vals=all.map(k=>kl[k].kw).sort((x,y)=>x-y), mid=vals[Math.floor(vals.length/2)];
    const far=all.filter(k=>Math.abs(kl[k].kw-mid)>0.5);
    ok(!far.length, `every kit plays a bar of plain beat within 0.5 dB of the kits' middle level (${mid.toFixed(1)} dB): `+all.map(k=>k+" "+(kl[k].kw-mid>=0?"+":"")+(kl[k].kw-mid).toFixed(1)).join(", "));
    if(KTABLE){ const t={}; all.forEach(k=>{ const v=Math.round(((kl[k].trim)+(mid-kl[k].kw))*10)/10; if(v) t[k]=v; }); console.log("KIT_LEVEL "+JSON.stringify(t)); }
    for(const k of IDS){
      await p.selectOption("#kitSel", k);
      await p.waitForFunction(k=>AOGDrumKit.state(k) && AOGDrumKit.state(k).state==="ready", k, {timeout:90000}).catch(()=>{});
      await p.waitForTimeout(250);
      const r=await p.evaluate(k=>({words:[...document.querySelectorAll("#pageKit [data-pad]")].map(g=>g.getAttribute("aria-label")), want:["kick","snare","ch","oh","clap","tom","rim","bell"].map(id=>AOGDrumKit.padWord(k,id,"en")), line:document.getElementById("kitLine").textContent}), k);
      ok(r.want.every(w=>r.words.includes(w)) && /Ready/.test(r.line), `${k} on the Drum Kit: eight pieces, each named, ready: `+r.words.join(", "));
    }
    /* each new kit's grooves bring it and wait for Play */
    const beats=await p.evaluate(ids=>AOGDrumKit.starters.filter(s=>ids.includes(s.kit)).map(s=>["k:"+s.id, s.kit]), IDS);
    for(const [beat, kit] of beats){
      await p.selectOption("#kitSel", "P"); await p.waitForTimeout(150);
      await p.selectOption("#beatSel", beat); await p.waitForTimeout(250);
      ok(await p.evaluate(k=>S.bank===k && !BT.on, kit), `${beat.slice(2)} brings ${kit} on the Drum Kit, and waits for Play`);
    }
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
    const es=await p.evaluate(()=>({groups:[...document.querySelectorAll("#kitSel optgroup")].map(g=>g.label)}));
    ok(es.groups.join("|")===Object.values(GROUP_ES).filter(g=>es.groups.includes(g)).join("|") && es.groups.length>=4, "en español: "+es.groups.join(", "));
    ok(await p.evaluate("document.documentElement.scrollWidth")<=390, "nothing scrolls sideways");
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srvA.close(); srvB.close(); srvC.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
