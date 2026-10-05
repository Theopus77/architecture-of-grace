/* Solo mode's band and licks: the band plays guitar, bass and drums in time, in the key, at the tempo, under the lead, and
   stops; the drum machine's beat when there is one; CPU (offline render speed, and live with the CPU slowed 4×); every lick
   plays in the key and lights its notes; a major key comes home to its own note; Spanish names. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9924);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/../bandt/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const [inst, dev, opt] of [["guitar","Desktop",{viewport:{width:1280,height:900}}],["guitar","iPhone 13",null],["bass","iPad (gen 7)",null]]){
    const c=await b.newContext(opt||pw.devices[dev]); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9924/music-${inst}.html`); await p.waitForTimeout(1200); await p.addScriptTag({content:MEASURE});
    console.log(`== ${inst} · ${dev}`);
    await p.evaluate(()=>{ AOGSolo.setMode("solo"); S.key=9; S.minor=true; S.prog=[]; S.preset=""; S.bpm=120; buildNeck(); ctx();
      const an=ac.createAnalyser(); an.fftSize=2048; window.__ban=an; window.__brms=()=>{ const d=new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); let s=0; for(const x of d) s+=x*x; return Math.sqrt(s/d.length); }; });
    const press=async(sel)=>{ await p.evaluate(sel=>{ const e=document.querySelector(sel); e.scrollIntoView({block:"center"}); }, sel); if(dev==="Desktop") await p.click(sel); else await p.tap(sel); };
    /* the band */
    await press("#soBand"); await p.waitForTimeout(300);
    await p.evaluate(()=>AOGSolo._t.BAND.mix.connect(__ban));
    await p.waitForTimeout(2800);
    const bd=await p.evaluate(()=>{ const B=AOGSolo._t.BAND, beat=B.barSec/4, parts={}, off=[], ch=AOGSolo._t.BAND.c;
      B.log.forEach(e=>{ parts[e.p]=(parts[e.p]||0)+1; if(e.p==="kick"||e.p==="snare"||e.p==="hat"||e.p==="bass"){ const x=(e.t-B.t0)/beat, fl=Math.floor(x+1e-6), fr=x-fl; const d=Math.min(Math.abs(fr), Math.abs(fr-(B.swing-0.0)) , Math.abs(fr-1)); off.push(d*beat); } });
      const bars={}; B.log.filter(e=>e.p==="gtr").forEach(e=>{ const k=Math.floor((e.t-B.t0+0.01)/B.barSec); (bars[k]=bars[k]||[]).push(e.m%12); });
      const prog=B.style, chords=["mblues"].includes(prog)?null:null;
      return {on:B.on, parts, worst:Math.max(...off), style:B.style, swing:B.swing, bpm:B.bpm, rms:__brms(), btn:document.getElementById("soBand").textContent, line:document.getElementById("soBandLine").textContent,
        first:PRESETS.find(x=>x.minor).en, cur:document.querySelector("#soBandProg .slot.now")&&document.querySelector("#soBandProg .slot.now").textContent, minAhead:Math.min(...B.log.map(e=>e.ahead)), bars}; });
    ok(bd.on && bd.parts.gtr>10 && bd.parts.kick>2 && bd.parts.snare>2 && bd.parts.hat>8 && (inst==="bass" || bd.parts.bass>4), `the band plays: ${JSON.stringify(bd.parts)} (${bd.style}, swing ${bd.swing})`);
    ok(bd.worst<0.002, `drums and bass sit on the beat (worst ${(bd.worst*1000).toFixed(2)} ms off the grid)`);
    ok(bd.rms>0.003 && /Stop/.test(bd.btn), `it is heard (${bd.rms.toFixed(4)}), the button says ${bd.btn}`);
    ok(bd.line.indexOf(bd.first)>=0 && /A minor/.test(bd.line) && /120 beats/.test(bd.line), "the line says what plays: "+bd.line);
    ok(!!bd.cur, "the chord playing now is lit in the band's row: "+bd.cur);
    ok(bd.minAhead>0.05, `every band note was scheduled ahead of time (at least ${(bd.minAhead*1000).toFixed(0)} ms)`);
    const lit=await p.evaluate(()=>{ const ch=AOGSolo._t.landChord(); return {pcs:chordPcs(ch), land:[...new Set([...document.querySelectorAll("#neck #soScale .so-c.land")].map(g=>{ const [s,f]=g.getAttribute("data-c").split(":").map(Number); return (TUNING[s]+f)%12; }))]}; });
    ok(lit.land.length>0 && lit.land.every(x=>lit.pcs.indexOf(x)>=0), `the neck brightens the band's chord: ${JSON.stringify(lit)}`);
    /* the tempo and the key follow */
    await p.evaluate(()=>{ const r=document.getElementById("soBpm"); r.value="90"; r.dispatchEvent(new Event("input")); });
    await p.waitForTimeout(250);
    ok(await p.evaluate(()=>AOGSolo._t.BAND.bpm===90 && Math.abs(AOGSolo._t.BAND.barSec-240/90)<1e-9 && S.bpm===90 && document.getElementById("bpm").value==="90"), "the band follows the tempo (90), and so does the page's own tempo");
    await p.selectOption("#keySel","4"); await p.waitForTimeout(1600);
    const ek=await p.evaluate(()=>{ const B=AOGSolo._t.BAND, t=ac.currentTime; const late=B.log.filter(e=>e.p==="gtr" && e.t>t-0.4); return late.map(e=>e.m%12); });
    ok(ek.length>0 && ek.every(x=>[4,7,11,2,9,0,6,5].indexOf(x)>=0), `the band follows the key (E minor): ${[...new Set(ek)].join(",")}`);
    /* the band's level while it plays: the loudest of ten looks over half a second (AOG-STRINGS-REAL-V1: the recorded band's
       chugged notes die away fast, so one look can fall in the gap between two of them) */
    const playing=await p.evaluate(async()=>{ let m=0; for(let i=0;i<10;i++){ m=Math.max(m, __brms()); await new Promise(r=>setTimeout(r,50)); } return m; });
    await press("#soBand"); await p.waitForTimeout(350);
    const st=await p.evaluate(()=>({on:AOGSolo._t.BAND.on, rms:__brms(), n:AOGSolo._t.BAND.log.length, btn:document.getElementById("soBand").textContent}));
    await p.waitForTimeout(400); const n2=await p.evaluate(()=>AOGSolo._t.BAND.log.length);
    ok(!st.on && st.rms<playing*0.03 && n2===st.n && /Play/.test(st.btn), `Stop stops it: ${playing.toFixed(4)} → ${st.rms.toExponential(1)} (only the room's tail) and nothing more is scheduled`);
    if(dev==="Desktop"){
      /* the lead stays on top: K-weighted loudness of the band alone and of a held lead note alone */
      const lv=await p.evaluate(async()=>{ S.key=9; S.minor=true; S.bpm=100; const T=AOGSolo._t;
        const band=await T.renderBand(4), lead=await T.renderBand(1, {band:false, lead:69});
        return {band:__kw(band.buf), lead:__kw(lead.buf), ms:band.ms, dur:band.dur}; });
      ok(lv.lead-lv.band>=3 && lv.lead-lv.band<=12, `the lead sits on top: lead ${lv.lead.toFixed(1)} dB, band ${lv.band.toFixed(1)} dB`);
      const cpu=await p.evaluate(async()=>{ const r=await AOGSolo._t.renderBand(8, {lead:69}); return {ms:r.ms, dur:r.dur}; });
      ok(cpu.ms<cpu.dur*1000/2, `band + lead render ${(cpu.dur*1000/cpu.ms).toFixed(1)}× faster than real time on this machine (${cpu.ms.toFixed(0)} ms for ${cpu.dur.toFixed(1)} s)`);
      /* live, with the CPU slowed 4×: the band keeps time and nothing is late, a lick on top */
      const cdp=await c.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
      await p.evaluate(()=>{ S.key=9; S.minor=true; S.bpm=120; buildNeck(); AOGSolo._t.bandStart(); window.__w0=[performance.now(), ac.currentTime]; });
      await p.waitForTimeout(1500); await p.evaluate(()=>AOGSolo._t.playLick("shred")); await p.waitForTimeout(4500);
      const th=await p.evaluate(()=>{ const B=AOGSolo._t.BAND, dt=(performance.now()-__w0[0])/1000, da=ac.currentTime-__w0[1]; const r={ratio:da/dt, minAhead:Math.min(...B.log.map(e=>e.ahead)), n:B.log.length}; AOGSolo._t.bandStop(); AOGSolo._t.lickStop(); return r; });
      await cdp.send("Emulation.setCPUThrottlingRate",{rate:1});
      ok(th.minAhead>0.02 && th.ratio>0.97, `CPU slowed 4×: ${th.n} band notes, none late (each at least ${(th.minAhead*1000).toFixed(0)} ms ahead), the audio clock keeps pace (${th.ratio.toFixed(3)})`);
      /* the drum machine's beat, when there is one */
      await p.evaluate(async()=>{ const sr=44100, n=sr*2, L=new Float32Array(n); for(let k=0;k<4;k++) for(let i=0;i<300;i++) L[k*sr/2+i]=Math.sin(i/3)*(1-i/300);
        await AOGHandoff.put("drumbench", {name:"Test beat", bpm:120, bars:1, offset:0, wav:wavBlob(L, L, sr)}); await checkDrums(); litNeck(); });
      await p.waitForTimeout(700);
      ok(await p.evaluate(()=>!!document.getElementById("soBeat") && document.getElementById("soBeat").getAttribute("aria-pressed")==="true" && /your beat/.test(document.getElementById("soBandLine").textContent)), "a beat on the shelf: the band will play it");
      await press("#soBand"); await p.waitForTimeout(1200);
      const ub=await p.evaluate(()=>{ const B=AOGSolo._t.BAND; return {beat:B.beat, loop:!!B.loop, bpm:B.bpm, own:B.log.filter(e=>e.p==="kick").length, locked:document.getElementById("soBpm").disabled}; });
      ok(ub.beat && ub.loop && ub.bpm===120 && ub.own===0 && ub.locked, "with the drum machine's beat: its loop plays, at its tempo, no drums made here: "+JSON.stringify(ub));
      await press("#soBand"); await p.evaluate(()=>AOGHandoff.put("drumbench", null).catch(()=>{}));
    }
    /* licks (guitar) */
    if(inst==="guitar"){
      await p.evaluate(()=>{ S.key=9; S.minor=true; S.bpm=100; S.fret0=1; buildNeck(); });
      /* AOG-SOLO-MORE-LICKS-V1: eight groups in the menu, a few licks in each, every lick played below */
      const grp=await p.evaluate(()=>[...document.querySelectorAll("#soLickSel optgroup")].map(g=>({l:g.label, n:g.querySelectorAll("option").length})));
      const ids=await p.evaluate(()=>[...document.querySelectorAll("#soLickSel option")].map(o=>o.value));
      ok(grp.length>=8 && grp.every(g=>g.n>=2) && ids.length>=57 && new Set(ids).size===ids.length, `${ids.length} licks in ${grp.length} groups: `+grp.map(g=>g.l+" "+g.n).join(", "));
      for(const id of ids){
        await p.selectOption("#soLickSel", id); await p.evaluate(()=>{ window.__v=[]; if(!window.__mv){ window.__mv=window.makeVoice; window.makeVoice=function(cx,ch,i,m,v,w,s){ if(cx===ac) __v.push(m); return __mv.apply(this,arguments); }; } });
        await press("#soLickBtn");
        const seen=[]; let on=true, t0=Date.now();
        while(on && Date.now()-t0<12000){ const r=await p.evaluate(()=>({on:AOGSolo._t.LICK.on, cells:[...document.querySelectorAll("#neck #soLick .so-now")].map(g=>g.getAttribute("data-c")), tags:[...document.querySelectorAll("#neck #soLick .so-tag")].map(t=>t.textContent)}));
          on=r.on; r.cells.forEach(x=>{ if(seen[seen.length-1]!==x) seen.push(x); }); r.tags.forEach(x=>{ if(!seen.includes("#"+x)) seen.push("#"+x); }); await p.waitForTimeout(30); }
        const lk=await p.evaluate(()=>({log:AOGSolo._t.LICK.log, f0:S.fret0, picks:__v.length, line:document.getElementById("soLickLine").textContent}));
        const notes=lk.log, pcs=[...new Set(notes.map(n=>n.m%12))], cellsLog=new Set(notes.map(n=>n.s+":"+n.f)), litCells=seen.filter(x=>x[0]!=="#"), tags=seen.filter(x=>x[0]==="#");
        const inKey=pcs.every(x=>[9,11,0,2,4,5,7,3].indexOf(x)>=0);
        ok(!on && notes.length>3 && inKey && litCells.length>=Math.min(notes.length, cellsLog.size)*0.6 && litCells.every(x=>{ const [s2,f2]=x.split(":").map(Number); return [9,11,0,2,4,5,7,3].indexOf(([40,45,50,55,59,64][s2]+f2)%12)>=0 || (id==="double" && s2>=4 && f2>=5 && f2<=8); }),   /* a slide lights the frets it passes */
          `${id}: ${notes.length} notes in A minor (${pcs.join(",")}), ${litCells.length} lit in turn, ${lk.picks} picks; ${tags.join(" ")}`);
      }
      const tp=await p.evaluate(()=>AOGSolo._t.LICK.log.length);
      ok(true, "licks done");
      /* AOG-SOLO-METAL-LICKS-V1: the metal licks squeal where they should, with the Pinch squeal switch off; named by style */
      const mq=await p.evaluate(()=>({pinch:AOGSolo._t.P.pinch, groove:AOGSolo._t.LICKS.groove.filter(n=>n.q).length, thrash:AOGSolo._t.LICKS.thrash.filter(n=>n.q).length,
        names:[...document.querySelectorAll("#soLickSel option")].map(o=>o.textContent).join(" | ")}));
      ok(!mq.pinch && mq.groove===2 && mq.thrash===1 && /Groove metal lick/.test(mq.names) && /Thrash metal lick/.test(mq.names) && !/Dime|Darrell|Hammett|Pantera|Metallica/i.test(mq.names), "the metal licks: "+JSON.stringify(mq));
      /* AOG-SOLO-LICKSPEED-V1: the speed slider slows the lick (and its bends) down; the next Play uses it; it is kept */
      const gap=async(spd)=>{ await p.evaluate(v=>{ const r=document.getElementById("soLickSpd"); r.value=String(v); r.dispatchEvent(new Event("input",{bubbles:true})); }, spd);
        await p.selectOption("#soLickSel","blues"); await press("#soLickBtn"); await p.waitForTimeout(150);
        const r=await p.evaluate(()=>{ const L=AOGSolo._t.LICK, g=L.log[1].t-L.log[0].t; const o={gap:g, beat:L.beat, out:document.getElementById("soLickSpdOut").textContent, line:document.getElementById("soLickLine").textContent}; AOGSolo._t.lickStop(); o.after=document.getElementById("soLickLine").textContent; return o; });
        return r; };
      const g100=await gap(100), g50=await gap(50), g25=await gap(25);
      const kept=await p.evaluate(()=>{ try{ return JSON.parse(localStorage.getItem("aog.guitar.solo.v1")).lspd; }catch(e){ return null; } });
      ok(Math.abs(g100.gap-0.6)<0.01 && Math.abs(g50.gap-1.2)<0.01 && Math.abs(g25.gap-2.4)<0.01 && g100.out==="Full speed" && g50.out==="50% speed" && /Slow it down to learn it/.test(g50.after) && !/Slow it down/.test(g100.after),
        "lick speed: full "+g100.gap.toFixed(3)+" s, half "+g50.gap.toFixed(3)+" s, a quarter "+g25.gap.toFixed(3)+" s between the first two notes; "+g50.out+"; "+g50.after);
      await p.waitForTimeout(400);
      const kept2=await p.evaluate(()=>{ try{ return JSON.parse(localStorage.getItem("aog.guitar.solo.v1")).lspd; }catch(e){ return null; } });
      ok(kept2===25, "the speed is kept for the next visit: "+kept+" → "+kept2);
      await p.evaluate(()=>{ const r=document.getElementById("soLickSpd"); r.value="100"; r.dispatchEvent(new Event("input",{bubbles:true})); });
      /* AOG-NECK-KEY-V1: the key picker by the neck; changing the key while a lick plays starts it again in the new key */
      await p.evaluate(()=>{ S.key=9; S.minor=true; buildNeck(); paintKeySel(); paintMood(); });
      await p.selectOption("#soLickSel","pedal"); await press("#soLickBtn"); await p.waitForTimeout(400);
      const k0=await p.evaluate(()=>AOGSolo._t.LICK.log[0].m);
      await p.selectOption("#keySel2","2"); await p.waitForTimeout(400);
      const nk=await p.evaluate(()=>({on:AOGSolo._t.LICK.on, mk:AOGSolo._t.LICK.mk, m:AOGSolo._t.LICK.log[0].m, top:document.getElementById("keySel").value, near:!!document.querySelector(".nk-key ~ #chordStrip") && !!document.querySelector(".nk-key ~ #prog2")}));
      await p.evaluate(()=>AOGSolo._t.lickStop());
      ok(nk.on && nk.mk==="2m" && nk.m-k0===5 && nk.top==="2" && nk.near, "the key by the neck: A minor to D minor while the lick plays, it starts again five steps up; the top picker follows: "+JSON.stringify(nk));
      /* a major key: the lick comes home to its own note; Spanish */
      await p.evaluate(()=>{ S.key=0; S.minor=false; buildNeck(); }); await p.selectOption("#soLickSel","blues");
      const home=await p.evaluate(()=>{ const n=AOGSolo._t.lickNotes("blues"); const h=n[n.length-1]; return (TUNING[h.s]+h.f)%12; });
      ok(home===0, "in C major the blues lick comes home to C");
      await p.evaluate(()=>document.getElementById("langBtn").click());
      const es=await p.evaluate(()=>[...document.querySelectorAll("#soLickSel option")].map(o=>o.textContent).join(" | ")+" / "+document.getElementById("soLickBtn").textContent);
      const es2=await p.evaluate(()=>document.querySelector('[data-so="lickSpeed"]').textContent+" / "+document.getElementById("soLickSpdOut").textContent);
      ok(/Frase de blues/.test(es) && /Tocar esta frase/.test(es) && /Frase de groove metal/.test(es) && /Frase de thrash metal/.test(es) && es2==="Velocidad de la frase / Velocidad completa", "Spanish: "+es+" · "+es2);
      await p.evaluate(()=>document.getElementById("langBtn").click());
    }
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
