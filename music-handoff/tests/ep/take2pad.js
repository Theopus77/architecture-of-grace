/* AOG-TAKE-TO-PADS-V1 — a take goes from a music tool to a drum pad. In one browser context: record a take on the guitar
   (Record, a chord with playChord, Stop), press Send to the drum machine, open the drum machine, put it on pad 5. Then: USER
   holds it in twelve bits, the pad is named after it, the memory counts it, the pad sounds (the engine gets it, and the
   machine's own engine renders it), TRIM and REV work on it, Put my sounds back undoes it, a reload keeps it. Also: no room
   (MEM FULL and a plain sentence), part room (the first part that fits), Spanish, the piano, the bass and the band send
   theirs, the drum machine's own takes have no such button, and on a phone, in light and dark, the new row and the new
   button are readable and calm. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path");
const srv=require("../srv.js")(9984);
const U="http://localhost:9984/";
const TOOLS=path.join(process.env.AOG_ROOT||path.resolve(__dirname,"../../../aog-deploy"),"..","tools");
const cut=(file,name)=>{ const s=fs.readFileSync(path.join(TOOLS,file),"utf8"), a=s.indexOf("function "+name+"()"), end="\n  return bad;\n}", e=s.indexOf(end,a); return s.slice(a,e+end.length); };
const PROBE=cut("check-contrast.js","probe"), CALM=cut("check-calm.js","calmProbe");
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
async function recordGuitar(p){            /* ● Record, a C chord through the page's own playChord, Stop */
  await p.evaluate(async()=>{ await REC.toggle(); });
  await p.waitForTimeout(250);
  await p.evaluate(()=>playChord(pads()[0], 0.8));
  await p.waitForTimeout(1700);
  const n=await p.evaluate(()=>REC.takes.length);
  await p.evaluate(()=>REC.toggle());
  await p.waitForFunction(k=>REC.takes.length===k+1 && !REC.closing, n, {timeout:6000});
}
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}});
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(p.url().split("/").pop()+": "+e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());

  /* 1. the guitar: a take */
  await p.goto(U+"music-guitar.html"); await p.waitForTimeout(900);
  await p.selectOption("#keySel","0"); await p.evaluate(()=>{ if(S.minor) document.getElementById("majBtn").click(); });
  await recordGuitar(p);
  const acts=await p.evaluate(()=>[...document.querySelectorAll("#takes .aogrec-take a, #takes .aogrec-take button")].map(e=>e.textContent));
  /* AOG-STUDIO-SEND-V1 (2026-10-04): every take now also has Send to the Studio, last in the row (tests/studio/send.js) */
  ok(acts.join(" | ")==="Save as .wav | Send to the turntables | Send to the drum machine | Send to the Studio", "the guitar's take has one more action: "+acts.join(" | "));

  /* 2. Send to the drum machine */
  await p.click('#takes [data-aogrec-drum="1"]');
  await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("recLine").textContent), null, {timeout:10000});
  const line=(await p.textContent("#recLine")).trim(), href=await p.getAttribute("#recLine a","href");
  ok(line==="Sent. On the drum machine, pick a pad for it. The drum machine" && href==="music-drums.html", "the guitar's line says what happened: "+line+" ("+href+")");
  const sh=await p.evaluate(async()=>{ const x=await AOGHandoff.get("drumsample"); if(!x) return null; const d=x.pcm; let pk=0, first=-1;
    for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); if(a>pk) pk=a; if(first<0&&a>0.002) first=i; }
    return {from:x.from, en:x.name.en, es:x.name.es, sec:x.seconds, rate:x.rate, f32:d instanceof Float32Array, len:d.length, peak:+pk.toFixed(3), firstMs:+(first/26.04).toFixed(1), at:typeof x.at, take:+REC.takes[0].sec.toFixed(2)}; });
  ok(sh && sh.from==="guitar" && sh.en==="Guitar take 1" && sh.es==="Toma de guitarra 1" && sh.rate===26040 && sh.f32 && sh.at==="number" && Math.abs(sh.len/26040-sh.sec)<0.006,
    "the \"drumsample\" shelf holds it: "+JSON.stringify(sh));
  ok(sh && sh.sec>1 && sh.sec<=2.5 && sh.firstMs<=2 && Math.abs(sh.peak-0.8)<0.01, `one channel at 26,040 Hz from its first sound (${sh&&sh.firstMs} ms in): ${sh&&sh.sec} s of the ${sh&&sh.take} s take, peak ${sh&&sh.peak}`);

  /* 3. the drum machine, same context */
  await p.goto(U+"music-drums.html"); await p.waitForTimeout(1500);
  const row=await p.evaluate(()=>{ const r=document.querySelector(".sample-row"); return r && {text:r.querySelector("span").textContent+" | "+r.querySelector("b").textContent,
    opts:[...r.querySelectorAll("option")].map(o=>o.textContent), btn:r.querySelector("button").textContent, aria:r.querySelector("select").getAttribute("aria-label"), pick:r.querySelector("select").value}; });
  ok(row && row.text===`From the guitar | Guitar take 1 (${sh.sec.toFixed(1)} s)`, "the drum machine shows the row: "+(row&&row.text));
  ok(row && row.opts.join(",")==="Pad 1 · Kick,Pad 2 · Snare,Pad 3 · Hat C,Pad 4 · Hat O,Pad 5 · Clap,Pad 6 · Tom,Pad 7 · Rim,Pad 8 · Bell" && row.btn==="Put it on this pad" && row.aria==="Which pad" && row.pick==="bell",
    "a menu of this kit's eight pads, named as the pads are (pad 8 picked to start), and the button: "+(row&&row.opts.join(", ")));
  await p.evaluate(async()=>{ ctx(); await bootSampler(); window.__msgs=[]; const pm=engine.port.postMessage.bind(engine.port);
    engine.port.postMessage=(m,t)=>{ window.__msgs.push({type:m.type, id:m.id, len:m.samples?m.samples.byteLength/4:0}); return pm(m,t); }; });
  const before=await p.evaluate(()=>({mem:memUsed(), bank:S.bank, rom:ROM_LEN.clap, user:Object.keys(USER[S.bank]).join(",")}));
  await p.selectOption(".sample-row select","clap");
  await p.click("[data-drumsample]"); await p.waitForTimeout(700);
  const put=await p.evaluate(async()=>{ const u=USER[S.bank].clap, x=await AOGHandoff.get("drumsample"); let same=true, twelve=true;
    for(let i=0;i<u.length;i++){ if(Math.abs(u[i]*2048-Math.round(u[i]*2048))>1e-6) twelve=false; if(Math.abs(u[i]-Math.round(x.pcm[i]*2048)/2048)>1e-6) same=false; }
    const lcd=document.getElementById("lcd").textContent;
    return {len:u.length, shelf:x.pcm.length, twelve, same, name:USER_NAME[S.bank].clap, face:document.querySelector('.sp-pad[data-pad="clap"]').textContent, mem:memUsed(), lcd,
      free:+(lcd.match(/([\d.]+)s\s*$/)||[0,-1])[1], note:(document.querySelector(".sm-note")||{}).textContent, kit:__msgs.filter(m=>m.type==="kit"&&m.id==="clap").pop(),
      sel:S.sel, undo:!!document.querySelector("[data-kitundo]"), chord:!!CHORDPAD[S.bank].clap, holds:(document.querySelector(".machine .simple-note:not(.sm-note)")||{}).textContent}; });
  ok(put.len===put.shelf && put.twelve && put.same, `USER.${before.bank}.clap holds the take in twelve bits (${put.len} samples, ${(put.len/26040).toFixed(2)} s)`);
  ok(put.name==="GTR1" && /GTR1/.test(put.face) && /pad 5 · GTR1/.test(put.holds||""), "the pad is named after the take: \""+put.face.replace(/\s+/g," ").trim()+"\"; "+put.holds);
  ok(Math.abs(put.mem-(before.mem-before.rom+put.len/26040))<0.001 && put.mem<=10, `the memory counts it: ${before.mem.toFixed(2)} → ${put.mem.toFixed(2)} of 10 s (kit A's clap gives back ${before.rom.toFixed(2)} s)`);
  await p.waitForTimeout(2700);
  const lcd2=await p.evaluate(()=>document.getElementById("lcd").textContent);
  const free2=+(lcd2.match(/([\d.]+)s\s*$/)||[0,-1])[1];
  ok(/END \d\.\d\ds/.test(put.lcd) && Math.abs(free2-Math.max(0,10-put.mem))<0.051, "the screen says END "+(put.lcd.match(/END ([\d.]+s)/)||[])[1]+", then "+free2+" s free");
  ok(put.note==="Done. Tap pad 5 to hear it.", "the row says it is done, and where: "+put.note);
  ok(put.kit && put.kit.len===put.len, "the sampler engine gets the take for pad 5 ("+(put.kit&&put.kit.len)+" samples)");
  ok(put.undo && put.sel==="clap" && !put.chord, "Put my sounds back is offered, pad 5 is the selected pad, and it is not a chord pad");
  /* the pad sounds: a tap reaches the engine, and the machine's own engine renders it */
  await p.evaluate(()=>{ __msgs=[]; });
  await p.click('.sp-pad[data-pad="clap"]'); await p.waitForTimeout(250);
  const hits=await p.evaluate(()=>__msgs.filter(m=>m.type==="hit"&&m.id==="clap").length);
  const snd=await p.evaluate(async()=>{
    const render=async(take)=>{ const off=new OfflineAudioContext(2, Math.ceil(44100*1.2), 44100), url=URL.createObjectURL(new Blob([WORKLET],{type:"application/javascript"}));
      await off.audioWorklet.addModule(url); const node=new AudioWorkletNode(off,"sp12",{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2]}); node.connect(off.destination);
      const keep=USER[S.bank].clap; if(!take) delete USER[S.bank].clap;
      const m=kitMsg("clap"), h=chanMsg("clap", 0.02, 2); USER[S.bank].clap=keep;
      node.port.postMessage(m[0], m[1]); node.port.postMessage(h); await new Promise(r=>setTimeout(r,60));
      const d=(await off.startRendering()).getChannelData(0); let pk=0; for(const x of d) pk=Math.max(pk,Math.abs(x));
      const rms=(a,z)=>{ let s=0, n=0; for(let i=Math.floor(a*44100);i<Math.floor(z*44100);i++){ s+=d[i]*d[i]; n++; } return Math.sqrt(s/n); };
      return {peak:+pk.toFixed(3), early:+rms(0.02,0.3).toFixed(4), late:+rms(0.6,1.0).toFixed(4)}; };
    return {take:await render(true), kit:await render(false)}; });
  ok(hits===1 && snd.take.peak>0.1 && snd.take.late>0.01 && snd.take.late>4*snd.kit.late, "pad 5 sounds: a tap reaches the engine, and it rings like the guitar, not the clap: "+JSON.stringify(snd));
  /* TRIM and REV, on the full bench */
  await p.evaluate(()=>{ S.bench="full"; paint(); });
  await p.click('[data-mode="trim"]'); await p.waitForTimeout(200);
  await p.evaluate(()=>{ __msgs=[]; const f=document.querySelector('[data-fader="clap"]'); f.value="0.5"; f.dispatchEvent(new Event("input")); });
  const trimmed=await p.evaluate(()=>(__msgs.filter(m=>m.type==="kit"&&m.id==="clap").pop()||{}).len);
  await p.evaluate(()=>{ __msgs=[]; document.getElementById("revBtn").click(); });
  const rev=await p.evaluate(()=>({len:(__msgs.filter(m=>m.type==="kit"&&m.id==="clap").pop()||{}).len, on:trimOf("clap").rev}));
  await p.evaluate(()=>{ const t=trimOf("clap"); t.start=0; t.rev=false; pushPad("clap"); S.sliderMode="mix"; S.bench="simple"; save(); paint(); });
  ok(Math.abs(trimmed/put.len-0.5)<0.01 && rev.on && rev.len===trimmed, `TRIM works on it as on any sample (start at 50%: ${trimmed} of ${put.len} samples), and so does REV`);
  /* Put my sounds back */
  await p.evaluate(()=>{ __msgs=[]; });
  await p.click("[data-kitundo]"); await p.waitForTimeout(300);
  const un=await p.evaluate(()=>({user:Object.keys(USER[S.bank]).join(","), name:USER_NAME[S.bank].clap||"", mem:memUsed(), face:document.querySelector('.sp-pad[data-pad="clap"]').textContent, kit:(__msgs.filter(m=>m.type==="kit"&&m.id==="clap").pop()||{}).len}));
  ok(un.user===before.user && !un.name && Math.abs(un.mem-before.mem)<1e-6 && /Clap/.test(un.face) && un.kit===Math.round(before.rom*26040),
    "Put my sounds back puts the kit's clap back on pad 5, and its memory ("+un.mem.toFixed(2)+" s), and the engine plays the clap again");
  /* put it back on and reload */
  await p.click("[data-drumsample]"); await p.waitForTimeout(900);
  const sum0=await p.evaluate(()=>{ let s=0; for(const x of USER[S.bank].clap) s+=Math.round(x*2048); return s; });
  await p.reload(); await p.waitForTimeout(1800);
  const re=await p.evaluate(()=>{ const u=USER[S.bank].clap; let s=0; if(u) for(const x of u) s+=Math.round(x*2048);
    return {len:u?u.length:0, sum:s, name:USER_NAME[S.bank].clap, face:document.querySelector('.sp-pad[data-pad="clap"]').textContent, row:!!document.querySelector(".sample-row"), note:!!document.querySelector(".sm-note")}; });
  ok(re.len===put.len && re.sum===sum0 && re.name==="GTR1" && /GTR1/.test(re.face), "after a reload the take is still on pad 5, sample for sample, named GTR1");
  ok(re.row && !re.note, "the row is still offered after the reload, without the old note");

  /* no room, then part room (on kit C, where no built-in sound is counted) */
  const fill=await p.evaluate(async()=>{ await ensureKit("A"); useBank("C"); paint(); window.__fill=[]; const banks=["D","E","F","G","H","I"]; let k=0;
    while(10-memUsed()>0.2){ const b=banks[Math.floor(k/8)], v=VOICES[k%8].id, room=10-memUsed()-0.1; USER[b][v]=new Float32Array(Math.floor(Math.min(2.5,room)*26040)); __fill.push([b,v]); k++; }
    paint(); return +(10-memUsed()).toFixed(2); });
  await p.selectOption(".sample-row select","tom"); await p.click("[data-drumsample]"); await p.waitForTimeout(500);
  const f1=await p.evaluate(()=>({lcd:document.getElementById("lcd").textContent.replace(/\n/g," | "), note:(document.querySelector(".sm-note")||{}).textContent, has:!!USER.C.tom, undo:!!document.querySelector("[data-kitundo]")}));
  ok(/MEM FULL/.test(f1.lcd) && f1.note==="The sampler's memory is full. Put the kit sounds back on another kit, or pick a pad that holds one of your own sounds." && !f1.has,
    `with ${fill} s free: MEM FULL on the screen ("${f1.lcd}"), a plain sentence, and nothing changes`);
  const part=await p.evaluate(()=>{ const [b,v]=__fill.pop(); delete USER[b][v]; let free=10-memUsed();               /* about a second free */
    if(free>1.0){ const [b2,v2]=__fill[__fill.length-1]; USER[b2][v2]=new Float32Array(USER[b2][v2].length+Math.floor((free-1.0)*26040)); } return +(10-memUsed()).toFixed(3); });
  await p.click("[data-drumsample]"); await p.waitForTimeout(500);
  const f2=await p.evaluate(()=>{ const u=USER.C.tom; return {sec:u?+(u.length/26040).toFixed(3):0, end:u?Math.abs(u[u.length-1]):1, mem:+memUsed().toFixed(3), note:(document.querySelector(".sm-note")||{}).textContent}; });
  ok(Math.abs(f2.sec-part)<0.002 && f2.end<0.001 && f2.mem<=10.0005 && f2.note==="Done. The memory had room for the first "+part.toFixed(1)+" seconds. Tap pad 6 to hear it.",
    `with ${part} s free it keeps the first ${f2.sec} s, faded at the cut, and says so: ${f2.note}`);
  await p.evaluate(()=>{ __fill.forEach(([b,v])=>{ delete USER[b][v]; }); delete USER.C.tom; delete USER_NAME.C.tom; S.kitUndo=null; useBank("A"); save(); paint(); });

  /* Spanish */
  await p.evaluate(()=>{ S.lang="es"; try{ localStorage.setItem("aog.lang","es"); }catch(e){} paint(); });
  const es=await p.evaluate(()=>{ const r=document.querySelector(".sample-row"); return {text:r.querySelector("span").textContent+" | "+r.querySelector("b").textContent, opt:r.querySelector('option[value="tom"]').textContent, btn:r.querySelector("button").textContent, aria:r.querySelector("select").getAttribute("aria-label")}; });
  await p.selectOption(".sample-row select","tom"); await p.click("[data-drumsample]"); await p.waitForTimeout(500);
  const es2=await p.evaluate(()=>({note:(document.querySelector(".sm-note")||{}).textContent, name:USER_NAME[S.bank].tom}));
  ok(es.text===`De la guitarra | Toma de guitarra 1 (${sh.sec.toFixed(1)} s)` && es.opt==="Pad 6 · Tom" && es.btn==="Ponerla en este pad" && es.aria==="Qué pad" && es2.note==="Listo. Toca el pad 6 para oírla." && es2.name==="GTR1",
    "in Spanish: "+JSON.stringify(es)+" → "+es2.note);
  await p.evaluate(()=>{ S.lang="en"; try{ localStorage.setItem("aog.lang","en"); }catch(e){} kitSoundsBack(); S.kitUndo=null; paint(); });

  /* the drum machine's own takes: no Send to the drum machine */
  await p.evaluate(async()=>{ await REC.toggle(); }); await p.waitForTimeout(200);
  for(const id of ["kick","snare","kick"]){ await p.click(`.sp-pad[data-pad="${id}"]`); await p.waitForTimeout(220); }
  await p.evaluate(()=>REC.toggle()); await p.waitForFunction(()=>REC.takes.length===1 && !REC.closing, null, {timeout:6000});
  ok(await p.evaluate(()=>document.querySelectorAll("#takeList [data-aogrec-send]").length===1 && document.querySelectorAll("#takeList [data-aogrec-drum]").length===0),
    "the drum machine's own takes go to the turntables only");

  /* two quick taps put it on once: Put my sounds back still brings back the kit's sound */
  const dbl=await p.evaluate(async()=>{ kitSoundsBack(); S.kitUndo=null; useBank("A"); paint(); document.getElementById("smPad").value="rim";
    const b=document.querySelector("[data-drumsample]"); b.click(); b.click(); await new Promise(r=>setTimeout(r,600));
    const on=!!USER.A.rim; kitSoundsUndo(); return {on, back:!USER.A.rim, name:USER_NAME.A.rim||""}; });
  ok(dbl.on && dbl.back && !dbl.name, "two quick taps put it on once, and Put my sounds back still brings back the rim");
  /* a shelf entry at any other rate is not offered */
  const rate=await p.evaluate(async()=>{ const keep=await AOGHandoff.get("drumsample");
    await AOGHandoff.put("drumsample", Object.assign({}, keep, {rate:44100, at:Date.now()})); await checkDrumSample(); const shown=!!document.querySelector(".sample-row");
    await AOGHandoff.put("drumsample", Object.assign({}, keep, {at:Date.now()})); await checkDrumSample(); return {shown, again:!!document.querySelector(".sample-row")}; });
  ok(!rate.shown && rate.again, "a sound at any other rate than 26,040 is not offered; the right one is");
  /* the piano, the bass and the band send theirs too */
  const others=[["piano", async()=>{ await p.selectOption("#soundSel","epwarm"); await p.evaluate(async()=>{ await REC.toggle(); }); await p.waitForTimeout(200);
      await p.evaluate(()=>noteOn("k",60,0.7)); await p.waitForTimeout(900); await p.evaluate(()=>noteOff("k",60)); }, "Piano take 1", "Toma de piano 1", "PIANO1"],
    ["bass", async()=>{ await p.evaluate(async()=>{ await REC.toggle(); }); await p.waitForTimeout(200); await p.evaluate(()=>playChord(pads()[0], 0.8)); await p.waitForTimeout(1200); }, "Bass take 1", "Toma de bajo 1", "BASS1"],
    ["band", async()=>{ await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:30000}); await p.evaluate(async()=>{ await REC.toggle(); }); await p.waitForTimeout(200);
      await p.evaluate(()=>padDown(0, 0.8)); await p.waitForTimeout(900); await p.evaluate(()=>padUp(0)); }, "Band take 1", "Toma de la banda 1", "BAND1"]];
  for(const [inst, play, en, esn, pad] of others){
    await p.goto(U+"music-"+inst+".html"); await p.waitForTimeout(1000);
    await play();
    await p.evaluate(()=>REC.toggle()); await p.waitForFunction(()=>REC.takes.length===1 && !REC.closing, null, {timeout:6000});
    await p.click('#takes [data-aogrec-drum="1"]');
    await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("recLine").textContent), null, {timeout:10000});
    const x=await p.evaluate(async()=>{ const x=await AOGHandoff.get("drumsample"); let pk=0; for(const v of x.pcm) pk=Math.max(pk,Math.abs(v)); return {from:x.from, en:x.name.en, es:x.name.es, sec:x.seconds, peak:+pk.toFixed(2), line:document.getElementById("recLine").textContent}; });
    ok(x.from===inst && x.en===en && x.es===esn && x.sec>0.3 && x.peak===0.8 && /^Sent\./.test(x.line), `the ${inst} sends its take: ${JSON.stringify(x)}`);
    await p.goto(U+"music-drums.html"); await p.waitForTimeout(1300);
    const r=await p.evaluate(()=>document.querySelector(".sample-row span").textContent+" | "+document.querySelector(".sample-row b").textContent);
    await p.selectOption(".sample-row select","bell"); await p.click("[data-drumsample]"); await p.waitForTimeout(500);
    const nm=await p.evaluate(()=>USER_NAME[S.bank].bell);
    ok(r.indexOf("From the "+inst+" | "+en+" (")===0 && nm===pad, `the drum machine: "${r}", and pad 8 reads ${nm}`);
    await p.evaluate(()=>{ kitSoundsBack(); S.kitUndo=null; save(); });
  }
  /* a tab already open hears a new take at once */
  const p2=await c.newPage(); await p2.route(/^https?:\/\/(?!localhost)/, r=>r.abort()); await p2.goto(U+"music-guitar.html"); await p2.waitForTimeout(900);
  await recordGuitar(p2); await p2.click('#takes [data-aogrec-drum="1"]'); await p.waitForTimeout(900);
  ok(await p.evaluate(()=>/Guitar take 1/.test((document.querySelector(".sample-row b")||{}).textContent||"")), "an open drum machine shows a newly sent take without a reload");
  await p2.close();
  ok(errs.length===0, "no page errors "+errs.join(" | "));

  /* phone, light and dark: the new row and the new button are readable and calm */
  for(const theme of ["light","dark"]){
    const c2=await b.newContext({...pw.devices["iPhone 13"], colorScheme:theme});
    await c2.addInitScript(th=>{ try{ localStorage.setItem("aog.grace.navy.v1","1"); localStorage.setItem("aog.theme",th); localStorage.setItem("aog.interior.ws.v1.theme",th); }catch(e){} }, theme);
    const q=await c2.newPage(); const qe=[]; q.on("pageerror",e=>qe.push(e.message)); await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await q.goto(U+"music-guitar.html"); await q.waitForTimeout(900);
    await recordGuitar(q);
    await q.locator("#takes").scrollIntoViewIfNeeded(); await q.waitForTimeout(300);
    const gb=await q.evaluate(()=>{ const b=document.querySelector('#takes [data-aogrec-drum="1"]'), r=b.getBoundingClientRect(); return {h:Math.round(r.height), w:Math.round(r.width), right:Math.round(r.right), iw:innerWidth, sw:document.scrollingElement.scrollWidth}; });
    const gc=await q.evaluate(`(${PROBE})()`), gk=await q.evaluate(`(${CALM})()`);
    ok(gb.h>=44 && gb.right<=gb.iw && gb.sw<=gb.iw && !gc.length && !gk.filter(x=>!/aog-calm/.test(x)).length, `iPhone, ${theme}: the guitar's new button (${gb.w}×${gb.h}) fits, reads (${gc.length} unreadable ${JSON.stringify(gc.slice(0,3))}) and is calm (${gk.join("; ")||"ok"})`);
    await q.screenshot({path:`take2pad-guitar-${theme}.png`});
    await q.click('#takes [data-aogrec-drum="1"]'); await q.waitForTimeout(800);
    await q.goto(U+"music-drums.html"); await q.waitForTimeout(1500);
    await q.selectOption(".sample-row select","clap"); await q.click("[data-drumsample]"); await q.waitForTimeout(700);
    await q.locator(".sample-row").scrollIntoViewIfNeeded(); await q.evaluate(()=>window.scrollBy(0,-120)); await q.waitForTimeout(300);
    const dr=await q.evaluate(()=>{ const r=document.querySelector(".sample-row"), s=r.querySelector("select"), bt=r.querySelector("button"), rr=r.getBoundingClientRect();
      return {sel:{h:Math.round(s.getBoundingClientRect().height), fs:getComputedStyle(s).fontSize, right:Math.round(s.getBoundingClientRect().right)}, btn:Math.round(bt.getBoundingClientRect().height), right:Math.round(rr.right), iw:innerWidth, sw:document.scrollingElement.scrollWidth}; });
    const dc=await q.evaluate(`(${PROBE})()`), dk=await q.evaluate(`(${CALM})()`);
    ok(dr.sel.h>=44 && parseFloat(dr.sel.fs)>=16 && dr.btn>=44 && dr.right<=dr.iw && dr.sel.right<=dr.iw && dr.sw<=dr.iw, `iPhone, ${theme}: the row fits the phone: ${JSON.stringify(dr)}`);
    ok(!dc.length && !dk.length, `iPhone, ${theme}: the drum machine with the row and its note reads (${dc.length} unreadable ${JSON.stringify(dc.slice(0,3))}) and is calm (${dk.join("; ")||"ok"})`);
    await q.screenshot({path:`take2pad-drums-${theme}.png`});
    ok(qe.length===0, `iPhone, ${theme}: no page errors ${qe.join(" | ")}`);
    await c2.close();
  }
  /* iPad and computer: the row, as it sits */
  for(const dev of ["iPad (gen 7)","Desktop Chrome"]){
    const c3=await b.newContext({...pw.devices[dev]}); const q=await c3.newPage(); await q.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await q.goto(U+"music-drums.html"); await q.waitForTimeout(1200);
    await q.evaluate(async()=>{ const n=Math.floor(1.6*26040), pcm=new Float32Array(n); for(let i=0;i<n;i++) pcm[i]=0.8*Math.sin(i*2*Math.PI*220/26040)*Math.exp(-i/20000);
      await AOGHandoff.put("drumsample",{from:"band", name:{en:"Band take 3", es:"Toma de la banda 3"}, seconds:1.6, at:Date.now(), rate:26040, pcm}); });
    await q.waitForTimeout(800);
    const w=await q.evaluate(()=>({row:!!document.querySelector(".sample-row"), sw:document.scrollingElement.scrollWidth, iw:innerWidth, top:Math.round(document.querySelector(".sample-row select").getBoundingClientRect().top-document.querySelector(".sample-row button").getBoundingClientRect().top)}));
    ok(w.row && w.sw<=w.iw, `${dev}: the row shows (from the shelf, without a reload) and nothing sticks out: ${JSON.stringify(w)}`);
    await q.locator(".sample-row").scrollIntoViewIfNeeded(); await q.evaluate(()=>window.scrollBy(0,-160));
    await q.screenshot({path:`take2pad-${dev.split(" ")[0]}.png`}); await c3.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
