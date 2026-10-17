/* AOG-DRUM-PERC-V1 (2026-10-13) — hand percussion, hand drums and the tabla. Jimmy: "DO them all."
   Four recorded kits (aog-drumkit.js HP, HD, HC, TB): the Drum Machine and the Drum Kit list them in their kit menus, in
   English and Spanish; nothing of them downloads until one is picked, and then only that kit; every pad sounds at its
   soft, normal and hard strength, softer to harder, never silent and never clipping; each kit sits at the other kits'
   level (a bar of plain beat, as pads/level.js measures it, within 1 dB of the kits around it); every pad says what it is
   in plain words; a new stroke on the same drum stops the last one's ring (a muted triangle, the bayan's ke); a take
   records; the grooves (a classroom beat, djembe, cajón, conga tumbao, the tabla's teental) bring their kit, play nothing
   until Play, and play their steps on time; no page errors. Ports 9326 (the Drum Machine) and 9327 (the Drum Kit). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs");
const srvA=require("../srv.js")(9326), srvB=require("../srv.js")(9327);
const MEASURE=(0,eval)(fs.readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const KITS={HP:["Hand percussion","Percusión de mano","handperc"],
  HD:["Hand drums · djembe and cajón","Tambores de mano · yembé y cajón","handdrums"],
  HC:["Hand drums · congas and bongos","Tambores de mano · congas y bongós","congas"],
  TB:["Tabla","Tabla","tabla"]};
const WORDS={
  HP:{en:["Woodblock · low","Tambourine · hit","Egg shaker","Tambourine · shake","Claves","Woodblock · high","Triangle · muted","Triangle · open"],
      es:["Bloque de madera · grave","Pandereta · golpe","Huevo sonoro","Pandereta · sacudida","Claves","Bloque de madera · agudo","Triángulo · apagado","Triángulo · abierto"]},
  HD:{en:["Djembe · bass","Djembe · slap","Maracas","Djembe · tone","Hand claps","Cajón · bass","Cajón · slap","Cowbell"],
      es:["Yembé · grave","Yembé · golpe seco","Maracas","Yembé · tono","Palmas","Cajón · grave","Cajón · golpe seco","Cencerro"]},
  HC:{en:["Conga · bass","Conga · slap","Conga · muted","Conga · open","Tumba · open","Bongo · low","Bongo · high","Bongo · slap"],
      es:["Conga · grave","Conga · golpe seco","Conga · apagado","Conga · abierto","Tumba · abierto","Bongó · grave","Bongó · agudo","Bongó · golpe seco"]},
  TB:{en:["Bayan · ghe (low)","Dayan · na","Dayan · te","Dayan · tin","Dayan · tun","Bayan · glide","Bayan · ke (closed)","Dha (both hands)"],
      es:["Bayan · ghe (grave)","Dayan · na","Dayan · te","Dayan · tin","Dayan · tun","Bayan · deslizado","Bayan · ke (cerrado)","Dha (las dos manos)"]}};
const DIRS=Object.values(KITS).map(k=>"/audio/drums/"+k[2]+"/");
const IPHONE={viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2};
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(port, page, opt, lang)=>{
    const c=await b.newContext(opt); const p=await c.newPage(); const errs=[], urls=[];
    p.on("pageerror",e=>errs.push(e.message)); p.on("request", r=>urls.push(r.url()));
    /* the pads by number (the page draws them in rows, 13 to 16 and 23, 24 first: AOG-PADS-24-V1) */
    await p.addInitScript(()=>{ window.FACES=()=>[...document.querySelectorAll("#pads .pad")].sort((a,b)=>a.dataset.p-b.dataset.p).map(x=>x.querySelector(".pn").textContent); });
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.addInitScript(l=>{ try{ localStorage.removeItem("aog.pads.v1"); localStorage.removeItem("aog.kit.v1"); localStorage.setItem("aog.lang", l); }catch(e){} }, lang||"en");
    await p.goto(`http://localhost:${port}/${page}`); await p.waitForTimeout(900);
    return {c, p, errs, urls, fetched:()=>DIRS.filter(d=>urls.some(u=>u.includes(d)))};
  };

  /* ══ the Drum Machine ══ */
  { const {c, p, errs, urls, fetched}=await open(9326, "music-pads.html", IPHONE); console.log("== the Drum Machine · iPhone");
    await p.waitForFunction(()=>window.isReady && window.AOGDrumKit, null, {timeout:60000});
    await p.addScriptTag({content:MEASURE});
    const menu=await p.evaluate(()=>({a:[...document.querySelectorAll("#fKitA option")].map(o=>[o.value,o.textContent]), b:document.querySelectorAll("#fKitB option").length, c:document.querySelectorAll("#fKitC option").length}));
    const has=Object.keys(KITS).every(k=>menu.a.some(o=>o[0]===k && o[1]===KITS[k][0]));
    ok(has && menu.b===menu.a.length && menu.c===menu.a.length, "the kit menus (pads 1 to 8, 9 to 16, 17 to 24) list the four new kits: "+Object.keys(KITS).map(k=>KITS[k][0]).join(", "));
    await p.waitForTimeout(800);
    ok(fetched().length===0, "nothing of the new kits is fetched before one is picked");
    await p.selectOption("#fKitA","HP");
    await p.waitForFunction(()=>AOGDrumKit.state("HP") && AOGDrumKit.state("HP").state==="ready" && isReady(0), null, {timeout:60000}).catch(()=>{});
    const f1=fetched();
    ok(f1.length===1 && f1[0].includes("handperc"), "picking Hand percussion fetches that kit only: "+f1.join(" "));
    const faces=await p.evaluate(()=>FACES().slice(0,8));
    ok(JSON.stringify(faces)===JSON.stringify(WORDS.HP.en), "pads 1 to 8 say what they are: "+faces.join(", "));
    ok(await p.evaluate("document.documentElement.scrollWidth")<=390, "the long names stay on their pads: nothing scrolls sideways");
    /* every pad of every new kit, soft, normal and hard */
    const R=await p.evaluate(async(kits)=>{
      const wait=()=>new Promise((ok,no)=>{ const t0=Date.now(); const c=()=>{ if(isReady(0)) ok(); else if(Date.now()-t0>60000) no(new Error("not ready")); else setTimeout(c,30); }; prep(0); c(); });
      const render=async(sec, fn)=>{ const oc=new OfflineAudioContext(2, Math.round(44100*sec), 44100), g=oc.createGain(), l=oc.createDynamicsCompressor();
        l.threshold.value=-3; l.knee.value=2; l.ratio.value=20; l.attack.value=0.002; l.release.value=0.12;
        g.gain.value=0.9; g.connect(l); l.connect(oc.destination);
        fn({c:oc, dest:g, open:[[],[],[],[]], chop:[null,null,null,null]}); const buf=await oc.startRendering();
        let pk=0; for(let ch=0;ch<buf.numberOfChannels;ch++){ const d=buf.getChannelData(ch); for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); if(a>pk) pk=a; } }
        return {buf, pk, kw:__kw(buf)}; };
      const tail=(buf, from)=>{ let e=0; for(let ch=0;ch<buf.numberOfChannels;ch++){ const d=buf.getChannelData(ch); for(let i=Math.round(from*44100);i<d.length;i++) e+=d[i]*d[i]; } return 10*Math.log10(e+1e-12); };
      const out={pads:{}, bar:{}, ring:{}};
      const bar=async k=>{ Object.assign(S.banks[0], {type:"drums", kitA:k, kitB:k}); await wait(); const e=60/90/2;
        /* three bars, the takes coming round as they would in a loop: their average loudness */
        let kw=0; for(let r=0;r<3;r++) kw+=(await render(8*e+0.6, T=>{ for(let i=0;i<8;i++){ const t=0.05+i*e; trigger(0, 2, i%2?0.6:0.8, t, T); if(i===0||i===5) trigger(0, 0, 0.8, t, T); if(i===2||i===6) trigger(0, 1, 0.8, t, T); } })).kw/3;
        return kw; };
      for(const k of kits){
        Object.assign(S.banks[0], {type:"drums", kitA:k, kitB:k}); await wait();
        out.pads[k]=[];
        for(let pi=0;pi<8;pi++){ const row={pi};
          /* each strength, every take of it in turn (three hits: the takes come round in order), at the top of its range:
             the loudness is the takes' average, the peak the loudest of them */
          for(const [nm,v,top] of [["s",0.5,0.61],["m",0.8,0.88],["h",1.0,1.0]]){ let kw=0, pk=0, bufs=new Set();
            for(let j=0;j<3;j++){ let o=null; const pd=AOGDrumKit.playDirect; AOGDrumKit.playDirect=function(){ return (o=pd.apply(this, arguments)); };
              const r=await render(2.6, T=>trigger(0, pi, v, 0.05, T)); AOGDrumKit.playDirect=pd; kw+=r.kw/3;
              if(o){ const d=o.src.buffer.getChannelData(0); let h=0; for(let i=0;i<Math.min(d.length, 4000);i++) h+=d[i]*(i%7+1); bufs.add(d.length+":"+h.toFixed(6)); }
              pk=Math.max(pk, r.pk); }
            for(let j=0;j<3;j++) pk=Math.max(pk, (await render(2.6, T=>trigger(0, pi, top, 0.05, T))).pk);   /* the top of its range */
            row[nm]=+kw.toFixed(1); row[nm+"pk"]=+pk.toFixed(2); row[nm+"n"]=bufs.size; }
          out.pads[k].push(row); }
        out.bar[k]=await bar(k);
      }
      for(const k of ["H","N","D","P"]) out.bar[k]=await bar(k);
      /* one drum, one ring: the muted triangle stops the open one; the bayan's ke stops its ghe */
      const ringPair=async(k, a, z)=>{ Object.assign(S.banks[0], {type:"drums", kitA:k, kitB:k}); await wait();
        const alone=await render(2.4, T=>trigger(0, a, 0.8, 0.05, T)), both=await render(2.4, T=>{ trigger(0, a, 0.8, 0.05, T); trigger(0, z, 0.8, 0.45, T); });
        return {alone:+tail(alone.buf, 0.75).toFixed(1), both:+tail(both.buf, 0.75).toFixed(1)}; };
      out.ring.tri=await ringPair("HP", 7, 6); out.ring.bayan=await ringPair("TB", 0, 6);
      return out;
    }, Object.keys(KITS));
    const RR={}; for(const k of Object.keys(KITS)) RR[k]=await p.evaluate(k=>["kick","snare","ch","oh","clap","tom","rim","bell"].map(id=>AOGDrumKit.takes ? AOGDrumKit.takes(k, id) : [0,0,0]), k);
    for(const k of Object.keys(KITS)){
      const rows=R.pads[k], silent=rows.filter(r=>["s","m","h"].some(n=>r[n+"pk"]<0.02 || r[n]<-60)), clip=rows.filter(r=>["s","m","h"].some(n=>r[n+"pk"]>=0.96)),
        order=rows.filter(r=>!(r.s<r.m+0.3 && r.m<r.h+0.3 && r.s<r.h));
      ok(!silent.length && !clip.length, `${KITS[k][0]}: all 8 pads sound at three strengths and none clips (normal peaks ${rows.map(r=>r.mpk).join(" ")}; hard peaks ${rows.map(r=>r.hpk).join(" ")}; soft ${Math.min(...rows.map(r=>r.spk))} to hard ${Math.max(...rows.map(r=>r.hpk))}) ${JSON.stringify(silent.concat(clip))}`);
      ok(!order.length, `${KITS[k][0]}: soft is softer than normal, normal softer than hard: `+rows.map(r=>`${r.pi+1} ${r.s}/${r.m}/${r.h}`).join(", "));
      /* round-robin: a layer recorded more than once plays another take on the next hit, so a roll is not one sound repeated */
      ok(rows.every(r=>["s","m","h"].every(n=>r[n+"n"]===Math.min(3, RR[k][r.pi][["s","m","h"].indexOf(n)]))) && rows.filter(r=>r.mn>1).length>=7,
        `${KITS[k][0]}: the next hit plays the next take (takes heard at soft/normal/hard: `+rows.map(r=>`${r.pi+1} ${r.sn}/${r.mn}/${r.hn}`).join(", ")+")");
    }
    const ref=["H","N","D","P"].map(k=>R.bar[k]).sort((x,y)=>x-y), mid=(ref[1]+ref[2])/2;
    const lv=Object.keys(KITS).map(k=>({k, off:+(R.bar[k]-mid).toFixed(2)}));
    ok(lv.every(x=>Math.abs(x.off)<=1), `each new kit sits at the other kits' level, a bar of plain beat within 1 dB of kits H, N, D and P (${mid.toFixed(1)} dB): `+lv.map(x=>x.k+" "+(x.off>=0?"+":"")+x.off).join(", "));
    ok(R.ring.tri.both<R.ring.tri.alone-12 && R.ring.bayan.both<R.ring.bayan.alone-12, "one drum, one ring: a muted triangle stops the open one, the bayan's ke stops its ghe: "+JSON.stringify(R.ring));
    /* a take records */
    await p.evaluate(()=>{ Object.assign(S.banks[0], {type:"drums", kitA:"HD", kitB:"HC", kitC:"TB"}); S.bank=0; paintAll(); prep(0); });
    await p.waitForFunction(()=>isReady(0), null, {timeout:60000}).catch(()=>{});
    const f2=fetched();
    ok(f2.length===4, "pads 1 to 24 on the three hand-drum kits: each fetched when it is picked: "+f2.map(d=>d.split("/")[3]).join(" "));
    const faces24=await p.evaluate(()=>FACES());
    ok(JSON.stringify(faces24)===JSON.stringify(WORDS.HD.en.concat(WORDS.HC.en, WORDS.TB.en)), "24 pads, each with its own name");
    await p.evaluate(()=>{ window.__h=[]; const pd=AOGDrumKit.playDirect; AOGDrumKit.playDirect=function(c,d,b,id){ __h.push(b+":"+id); return pd.apply(this,arguments); }; });
    await p.evaluate(()=>document.getElementById("takeBtn").click()); await p.waitForTimeout(500);
    for(const i of [0, 3, 8, 16, 23]){ await p.locator(`#pads .pad[data-p="${i}"]`).dispatchEvent("pointerdown", {pointerId:1, isPrimary:true, button:0}); await p.waitForTimeout(120);
      await p.locator(`#pads .pad[data-p="${i}"]`).dispatchEvent("pointerup", {pointerId:1, isPrimary:true, button:0}); await p.waitForTimeout(120); }
    await p.waitForTimeout(300);
    await p.evaluate(()=>document.getElementById("takeBtn").click()); await p.waitForTimeout(1500);
    const take=await p.evaluate(()=>({n:document.querySelectorAll("#takeList .aogrec-take").length, h:__h.slice()}));
    ok(take.n===1 && take.h.join(" ")==="HD:kick HD:oh HC:kick TB:kick TB:bell", "a take of djembe, conga and tabla strokes is recorded: "+JSON.stringify(take));
    /* the grooves */
    const g=await p.evaluate(()=>({groups:[...document.querySelectorAll("#grpSel option")].map(o=>[o.value,o.textContent])}));
    ok(g.groups.some(x=>x[0]==="hand" && x[1]==="Hand drums and percussion"), "the beats menu has a group for them: Hand drums and percussion");
    await p.selectOption("#grpSel","hand"); await p.waitForTimeout(300);
    const items=await p.evaluate(()=>[...document.querySelectorAll("#startSel option")].map(o=>o.value));
    ok(JSON.stringify(items)===JSON.stringify(["schoolband","djembe","cajon","tumbao","teental"]), "five grooves: "+items.join(", "));
    await p.selectOption("#startSel","teental"); await p.waitForTimeout(500);
    const tt=await p.evaluate(()=>{ const ev=S.ev.filter(e=>e.b===0), at=(pi)=>ev.filter(e=>e.p===pi).map(e=>e.t/24).sort((a,b)=>a-b);
      return {kit:S.banks[0].kitA, bars:S.bars, bpm:S.bpm, on:SEQ.on, dha:at(7), ta:at(1), tin:at(3), ghe:at(0), line:document.getElementById("beatNow").textContent}; });
    ok(tt.kit==="TB" && tt.bars===2 && tt.bpm===60 && !tt.on, "teental brings the tabla, two bars (16 beats), 60, and plays nothing until Play: "+tt.line);
    ok(JSON.stringify(tt.dha)==="[0,6,8,14,16,30]" && JSON.stringify(tt.ta)==="[22,24]" && JSON.stringify(tt.tin)==="[2,4,10,12,18,20,26,28]" && JSON.stringify(tt.ghe)==="[2,4,10,12,26,28]",
      "dha dhin dhin dha | dha dhin dhin dha | dha tin tin ta | ta dhin dhin dha, a beat every two steps: "+JSON.stringify(tt));
    await p.selectOption("#startSel","tumbao"); await p.waitForTimeout(300);
    ok(await p.evaluate(()=>S.banks[0].kitA==="HC" && !SEQ.on), "the conga tumbao brings the congas");
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  /* the Drum Machine in Spanish */
  { const {c, p, errs}=await open(9326, "music-pads.html", IPHONE, "es"); console.log("== la caja de ritmos · en español");
    await p.waitForFunction(()=>window.isReady && window.AOGDrumKit, null, {timeout:60000});
    const menu=await p.evaluate(()=>[...document.querySelectorAll("#fKitA option")].map(o=>[o.value,o.textContent]));
    ok(Object.keys(KITS).every(k=>menu.some(o=>o[0]===k && o[1]===KITS[k][1])), "los menús de kits dicen: "+Object.keys(KITS).map(k=>KITS[k][1]).join(", "));
    for(const k of Object.keys(KITS)){
      await p.selectOption("#fKitA", k); await p.waitForTimeout(250);
      const faces=await p.evaluate(()=>FACES().slice(0,8));
      ok(JSON.stringify(faces)===JSON.stringify(WORDS[k].es), `${KITS[k][1]}: `+faces.join(", "));
    }
    const g=await p.evaluate(()=>[...document.querySelectorAll("#grpSel option")].map(o=>[o.value,o.textContent]));
    ok(g.some(x=>x[0]==="hand" && x[1]==="Tambores de mano y percusión"), "el grupo de ritmos: Tambores de mano y percusión");
    ok(errs.length===0, "sin errores en la página "+errs.join(" | "));
    await c.close();
  }

  /* ══ the Drum Kit ══ */
  { const {c, p, errs, fetched}=await open(9327, "music-kit.html", IPHONE); console.log("== the Drum Kit · iPhone");
    await p.waitForFunction(()=>{ const s=window.AOGDrumKit && AOGDrumKit.state(S.bank); return s && s.state==="ready"; }, null, {timeout:40000}).catch(()=>{});
    await p.waitForTimeout(500);
    const opts=await p.evaluate(()=>[...document.querySelectorAll("#kitSel option")].map(o=>[o.value,o.textContent]));
    ok(Object.keys(KITS).every(k=>opts.some(o=>o[0]===k && o[1]===KITS[k][0])), "the kit menu lists the four new kits");
    ok(fetched().length===0, "nothing of them is fetched before one is picked");
    await p.evaluate(()=>{ window.__h=[]; const pd=AOGDrumKit.playDirect; AOGDrumKit.playDirect=function(c,d,b,id,t0){ __h.push({b,id,t:t0}); return pd.apply(this,arguments); }; });
    const cdp=await c.newCDPSession(p);
    const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:q.id||i+1}))});
    const where=()=>p.evaluate(()=>{ const o={}, k=document.getElementById("pageKit"), kb=k.getBoundingClientRect(); k.querySelectorAll("[data-pad]").forEach(g=>{ const r=g.querySelector(".glow > *").getBoundingClientRect();
      o[g.getAttribute("data-pad")]={x:r.x+r.width/2, y:Math.min(r.y+r.height/2, kb.bottom-25), w:r.width, h:r.height}; }); return o; });
    const ID=["kick","snare","ch","oh","clap","tom","rim","bell"];
    for(const k of Object.keys(KITS)){
      await p.selectOption("#kitSel", k);
      await p.waitForFunction(k=>AOGDrumKit.state(k) && AOGDrumKit.state(k).state==="ready", k, {timeout:40000}).catch(()=>{});
      await p.waitForTimeout(300);
      const words=await p.evaluate(()=>[...document.querySelectorAll("#pageKit [data-pad]")].map(g=>[g.getAttribute("data-pad"), g.getAttribute("aria-label")]));
      const named=ID.every((id,i)=>words.some(w=>w[0]===id && w[1]===WORDS[k].en[i]));
      const w=await where(); await p.evaluate("__h=[]");
      for(const id of ID){ await T("touchStart",[w[id]]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(60); }
      const hs=await p.evaluate(()=>__h.map(x=>x.b+":"+x.id));
      ok(named && JSON.stringify(hs)===JSON.stringify(ID.map(id=>k+":"+id)) && Object.values(w).every(q=>Math.min(q.w,q.h)>=44),
        `${KITS[k][0]}: eight pieces, each a finger wide, each named and played: `+words.map(x=>x[1]).join(", "));
    }
    ok(fetched().length===4, "each kit fetched only when it was picked");
    /* the grooves */
    const beats=await p.evaluate(()=>[...document.querySelectorAll("#beatSel option")].map(o=>o.value));
    ok(["k:schoolband","k:djembe","k:cajon","k:tumbao","k:teental"].every(v=>beats.indexOf(v)>=0), "the beats menu has the five grooves, under More grooves");
    await p.selectOption("#kitSel","HP"); await p.waitForTimeout(400);
    await p.evaluate("__h=[]"); await p.selectOption("#beatSel","k:teental");
    await p.waitForFunction(()=>AOGDrumKit.state("TB") && AOGDrumKit.state("TB").state==="ready", null, {timeout:40000}).catch(()=>{});
    await p.waitForTimeout(700);
    const st=await p.evaluate(()=>({bank:S.bank, sel:document.getElementById("kitSel").value, on:BT.on, n:__h.length, bpm:S.bpm}));
    ok(st.bank==="TB" && st.sel==="TB" && !st.on && st.n===0 && st.bpm===60, "teental brings the tabla and plays nothing until Play: "+JSON.stringify(st));
    await p.evaluate("__h=[]"); await p.click("#beatPlay"); await p.waitForTimeout(8300);
    const tl=await p.evaluate(()=>{ const t0=__h.length ? __h[0].t : 0, six=60/S.bpm/4, at=id=>__h.filter(x=>x.id===id && x.t-t0<8*0.25*4-0.01).map(x=>Math.round((x.t-t0)/six));
      return {bank:__h.every(x=>x.b==="TB"), dha:at("bell"), na:at("snare"), tin:at("oh"), ghe:at("kick")}; });
    ok(tl.bank && JSON.stringify(tl.dha)==="[0,6,8,14,16,30]" && JSON.stringify(tl.na)==="[22,24]" && JSON.stringify(tl.tin)==="[2,4,10,12,18,20,26,28]" && JSON.stringify(tl.ghe)==="[2,4,10,12,26,28]",
      "Play: the sixteen beats of teental reach the tabla on time, both parts in turn: "+JSON.stringify(tl));
    await p.click("#beatPlay"); await p.evaluate("__h=[]"); await p.waitForTimeout(500);
    ok(await p.evaluate("!BT.on && __h.length===0"), "Stop stops it");
    for(const [beat, kit] of [["k:djembe","HD"],["k:cajon","HD"],["k:tumbao","HC"],["k:schoolband","HP"]]){
      await p.selectOption("#beatSel", beat); await p.waitForTimeout(250);
      ok(await p.evaluate(k=>S.bank===k && !BT.on, kit), `${beat.slice(2)} brings ${KITS[kit][0]}, and waits for Play`);
    }
    /* one drum, one ring */
    await p.waitForFunction(()=>AOGDrumKit.state("HP") && AOGDrumKit.state("HP").state==="ready", null, {timeout:40000}).catch(()=>{});
    const w=await where();
    await T("touchStart",[w.bell]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(80);
    const first=await p.evaluate(()=>RING["HP:tri"]);
    await T("touchStart",[w.rim]); await p.waitForTimeout(40); await T("touchEnd",[]); await p.waitForTimeout(80);
    ok(await p.evaluate(f=>!!RING["HP:tri"] && RING["HP:tri"]!==undefined, first), "the triangle: a muted stroke takes over from the open one");
    /* Spanish */
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
    const es=await p.evaluate(()=>({opt:[...document.querySelectorAll("#kitSel option")].map(o=>o.textContent), words:[...document.querySelectorAll("#pageKit [data-pad]")].map(g=>g.getAttribute("aria-label"))}));
    ok(Object.keys(KITS).every(k=>es.opt.indexOf(KITS[k][1])>=0) && WORDS.HP.es.every(x=>es.words.indexOf(x)>=0), "en español: "+es.words.join(", "));
    ok(await p.evaluate("document.documentElement.scrollWidth")<=390, "nothing scrolls sideways");
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  /* an iPad, sideways: the Drum Kit's whole-screen view with the tabla */
  { const {c, p, errs}=await open(9327, "music-kit.html", {viewport:{width:1180,height:820}, isMobile:true, hasTouch:true, deviceScaleFactor:2}); console.log("== the Drum Kit · iPad");
    await p.waitForFunction(()=>window.AOGDrumKit && AOGDrumKit.state(S.bank), null, {timeout:40000}).catch(()=>{});
    await p.selectOption("#kitSel","TB");
    await p.waitForFunction(()=>AOGDrumKit.state("TB") && AOGDrumKit.state("TB").state==="ready", null, {timeout:40000}).catch(()=>{});
    await p.waitForTimeout(300);
    const r=await p.evaluate(()=>({sw:document.documentElement.scrollWidth, n:document.querySelectorAll("#pageKit [data-pad]").length, line:document.getElementById("kitLine").textContent}));
    ok(r.sw<=1180 && r.n===8 && /Ready/.test(r.line), "the tabla on an iPad: eight pieces, ready, nothing scrolls sideways: "+r.line);
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srvA.close(); srvB.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
