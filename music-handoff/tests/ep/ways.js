/* the piano's eleven ways to play the chords: the menu, one bar of each (notes and times), playing each, a reload, Send */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9990);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext(pw.devices["iPad (gen 7)"]); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9990/music-piano.html"); await p.waitForTimeout(900);
  const menu=await p.evaluate(()=>({groups:[...document.querySelectorAll("#rhythmSel optgroup")].map(g=>g.label+": "+[...g.querySelectorAll("option")].map(o=>o.textContent).join(" | ")), n:document.querySelectorAll("#rhythmSel option").length}));
  ok(menu.n===16 && menu.groups.length===4, "the menu: 16 ways in 4 groups\n   "+menu.groups.join("\n   "));
  /* one bar of each, on the warm electric piano (built on the page, so nothing to wait for) */
  const bars=await p.evaluate(()=>{ S.sound="epwarm"; S.key=0; const out={};
    const chords={C:{off:0,q:"maj"}, C7:{off:0,q:"dom7"}, Am:{off:9,q:"min"}};
    for(const r of RHYTHMS) for(const [nm,ch] of Object.entries(chords)){
      S.rhythm=r; S.prog=[ch];
      const oc=new OfflineAudioContext(2, 44100*3, 44100), cht=makeChain(oc), prev={v:null};
      const v=scheduleBar(oc, cht, 0, 0, 2.4, curSwing(), prev), seen={}; let dbl=0;
      v.forEach(x=>{ const k=x.m+"@"+x.on.toFixed(3); if(seen[k]) dbl++; seen[k]=1; });
      const bt=2.4/beatsPerBar(); out[r+" "+nm]={n:v.length, dbl, ev:v.map(x=>[+(x.on/bt).toFixed(3), x.m]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]), lo:Math.min(...v.map(x=>x.m)), hi:Math.max(...v.map(x=>x.m)), len:+Math.max(...v.map(x=>x.off)).toFixed(2)};
    }
    return out; });
  for(const [k,v] of Object.entries(bars)) if(k.endsWith(" C")) console.log("   "+k.padEnd(14), v.n, "notes, from", v.lo, "to", v.hi, "| beat:note", v.ev.map(e=>e[0]+":"+e[1]).join(" "));
  Object.entries(bars).forEach(([k,v])=>{ if(!(v.n>0 && v.dbl===0 && v.lo>=21 && v.hi<=108 && (v.len<=2.45 || /^broken /.test(k)))) console.log("   NOT OK", k, JSON.stringify({n:v.n,dbl:v.dbl,lo:v.lo,hi:v.hi,len:v.len})); });
  ok(Object.entries(bars).every(([k,v])=>v.n>0 && v.dbl===0 && v.lo>=21 && v.hi<=108 && (v.len<=2.45 || /^broken /.test(k))), "every way, on C, C7 and Am: notes in the bar, none started twice at once, all on the keyboard, none past the bar (Broken has always let its last note ring into the next)");
  const bo=bars["boogie C7"].ev.filter(e=>e[1]<52).map(e=>e[1]).join(","), boa=bars["boogie Am"].ev.filter(e=>e[1]<57 && e[0]%1!==0 || e[1]<57).map(e=>e[1]);
  ok(bo==="36,40,43,45,46,45,43,40", "boogie-woogie walks C E G A B♭ A G E under C7: "+bo);
  ok(bars["boogie Am"].ev.filter(e=>e[1]<=55).map(e=>e[1]).join(",")==="45,48,52,54,55,54,52,48", "and A C E F♯ G F♯ E C under A minor: "+bars["boogie Am"].ev.filter(e=>e[1]<=55).map(e=>e[1]).join(","));
  const sw=bars["boogie C"].ev.filter(e=>e[1]<52).map(e=>e[0]);
  ok(Math.abs(sw[1]-0.64)<0.01 && Math.abs(sw[2]-1)<0.01, "boogie-woogie swings by itself: its notes fall at beats "+sw.join(" "));
  const sp=bars["sweep C"].ev; ok(sp.every((e,i)=>i===0 || e[1]>sp[i-1][1]) && sp.every((e,i)=>Math.abs(e[0]-i*0.125)<0.001), "the sweep goes straight up, an eighth of a beat apart: "+sp.map(e=>e[1]).join(" "));
  const op=bars["oompah C"].ev; ok(op[0][1]===36 && op.some(e=>e[0]===2 && e[1]===31) && op.filter(e=>e[0]===1||e[0]===3).length>=6, "oom-pah: C on 1, the G below on 3, the chord on 2 and 4");
  const ts=[...new Set(bars["tresillo C"].ev.map(e=>e[0]))].join(" "); ok(ts==="0 1.5 3", "three-three-two lands on beats "+ts);
  const ch=[...new Set(bars["charleston C"].ev.map(e=>e[0]))].join(" "); ok(/^0 1\.6\d* 2 3\.6\d*$/.test(ch), "the Charleston hits 1, the swung and of 2, 3 and the swung and of 4: "+ch);
  const wz=bars["waltz C"].ev, tr=[...new Set(bars["triplets C"].ev.map(e=>e[0]))], dz=bars["disco C"].ev.filter(e=>e[1]<52);
  ok(wz.length===7 && wz[0][0]===0 && wz.some(e=>e[0]===1) && wz.some(e=>e[0]===2) && !wz.some(e=>e[0]>=3), "the waltz: the bass on 1, the chord on 2 and 3, in a bar of three beats");
  ok(tr.length===12 && Math.abs(tr[1]-1/3)<0.01, "triplets: a chord on every third of a beat: "+tr.slice(0,4).join(" ")+" …");
  ok(dz.map(e=>e[1]).join(",")==="36,48,36,48,36,48,36,48", "disco: the low C bounces between two octaves: "+dz.map(e=>e[1]).join(","));
  /* the waltz with a drum beat waits for no drum: its tempo stays the page's own */
  const wd=await p.evaluate(async()=>{ const sr=44100, n=sr*2, L=new Float32Array(n); for(let k=0;k<4;k++) for(let i=0;i<300;i++) L[k*sr/2+i]=Math.sin(i/3)*(1-i/300);
    await AOGHandoff.put("drumbench", {name:"Test beat", bpm:120, bars:1, offset:0, wav:wavBlob(L, L, sr)}); await checkDrums(); S.withDrums=true; S.bpm=90;
    S.rhythm="waltz"; paintDrums(); const a={live:drumsLive(), bpm:curBpm(), locked:document.getElementById("bpm").disabled, line:document.getElementById("drumBox").textContent.replace(/\s+/g," ")};
    S.rhythm="pulse"; paintDrums(); const b2={live:drumsLive(), bpm:curBpm()}; S.withDrums=false; paintDrums(); return {a, b:b2}; });
  ok(!wd.a.live && wd.a.bpm===90 && !wd.a.locked && /counts in threes/.test(wd.a.line) && wd.b.live && wd.b.bpm===120, "with a drum beat on, the waltz says it plays without it and keeps its own tempo; four-beat ways follow the beat: "+JSON.stringify(wd));
  /* play each one for a moment; the keys light */
  await p.selectOption("#soundSel","epwarm"); await p.selectOption("#progSel","blues");
  for(const r of await p.evaluate("RHYTHMS")){
    await p.selectOption("#rhythmSel", r); await p.click("#playBtn"); await p.waitForTimeout(1100);
    const st=await p.evaluate(()=>({playing:S.playing, v:PLAY.voices.length, lit:document.querySelectorAll("#kbd .now, #kbd .lit").length}));
    await p.click("#playBtn"); await p.waitForTimeout(120);
    ok(st.playing && st.v>0 && st.lit>0, `${r}: plays (${st.v} notes on their way), ${st.lit} keys lit`);
  }
  /* Spanish, a reload, Send */
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(200);
  const es=await p.evaluate(()=>[...document.querySelectorAll("#rhythmSel optgroup")].map(g=>g.label).join(" | ")+" · "+document.querySelector('#rhythmSel option[value="tresillo"]').textContent);
  ok(/Firmes \| Fluidos \| Para bailar \| Ritmos del mundo/.test(es) && /Tres-tres-dos/.test(es), "in Spanish: "+es);
  await p.evaluate(()=>document.getElementById("langBtn").click());
  await p.selectOption("#rhythmSel","charleston"); await p.reload(); await p.waitForTimeout(900);
  ok(await p.evaluate(()=>S.rhythm==="charleston" && document.getElementById("rhythmSel").value==="charleston"), "the way of playing is kept after a reload");
  await p.selectOption("#rhythmSel","boogie"); await p.click("#sendBtn");
  await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("sendLine").textContent), null, {timeout:60000});
  const sh=await p.evaluate(async()=>{ const x=await AOGHandoff.get("keysbench"); return x && {name:x.name, size:x.wav.size}; });
  ok(sh && sh.size>500000, "Send to the turntables works with boogie-woogie: "+JSON.stringify(sh));
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
