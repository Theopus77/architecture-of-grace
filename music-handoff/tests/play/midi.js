/* AOG-MIDI-V1 (2026-10-11) — Jimmy: "Play it from a real keyboard everywhere." A MIDI keyboard (a fake one: the page's
   navigator.requestMIDIAccess is stubbed, and the test calls the input's onmidimessage) plays every room that has keys or
   strings or pads, through the one shared helper (aog-midi.js):
   · the Piano still plays as before (a key, its light, the pedal);
   · the Band: a key at the strength it is struck, by the player who reaches it; let go, it ends;
   · the Guitar and the Bass: a key at its place on the neck nearest the frets in view, lit there; a chord lands on as many
     strings; let go, the string is damped; the pedal (CC64) lets it ring until lifted; the pitch wheel bends held notes;
   · the Drum Machine: notes 36 to 59 are pads 1 to 24 of the bank in view, the strength is how hard (full strength stays
     full); notes outside do nothing;
   · in every room: the button shows only where the browser has MIDI, nothing asks before it is pressed; the line says when a
     keyboard is ready, when one is unplugged (its notes let go) and when another is plugged in; Spanish words; no page
     errors. Port 9266. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9266);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const FAKE=()=>{ const ins=new Map(); ins.set("a",{id:"a", name:"Keystation 49", onmidimessage:null});
  window.__asked=0; window.__midi={inputs:ins, onstatechange:null};
  navigator.requestMIDIAccess=()=>{ window.__asked++; return Promise.resolve(window.__midi); };
  window.__send=(d)=>{ const i=window.__midi.inputs.get("a"); if(i && i.onmidimessage) i.onmidimessage({data:d}); };
  try{ localStorage.setItem("aog.lang","en"); }catch(e){} };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const open=async(page, init)=>{
    const c=await b.newContext({viewport:{width:1280,height:900}}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await c.addInitScript(init||FAKE);
    const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.goto("http://localhost:9266/"+page); await p.waitForTimeout(1300);
    return {c, p, errs};
  };
  const start=async(p)=>{
    const before=await p.evaluate(()=>({asked:window.__asked, shown:!document.getElementById("midiBtn").hidden && document.getElementById("midiBtn").getBoundingClientRect().width>0, text:document.getElementById("midiBtn").textContent}));
    await p.evaluate(()=>document.getElementById("midiBtn").scrollIntoView({block:"center"}));
    await p.click("#midiBtn"); await p.waitForTimeout(250);
    const line=await p.evaluate(()=>document.getElementById("midiLine").textContent);
    return {before, line};
  };
  const plugs=async(p, name, want)=>{
    /* unplugged: the line says which; plugged in again (another one): it says it is ready */
    await p.evaluate(()=>{ window.__midi.inputs.delete("a"); window.__midi.onstatechange && window.__midi.onstatechange({}); });
    const gone=await p.evaluate(()=>document.getElementById("midiLine").textContent);
    await p.evaluate(()=>{ window.__midi.inputs.set("b",{id:"b", name:"Launchkey 25", onmidimessage:null}); window.__midi.onstatechange && window.__midi.onstatechange({}); });
    const back=await p.evaluate(()=>({line:document.getElementById("midiLine").textContent, hooked:typeof window.__midi.inputs.get("b").onmidimessage==="function"}));
    ok(/Keystation 49 was unplugged/.test(gone) && /ready: Launchkey 25/.test(back.line) && back.hooked, `${name}: unplugged, the line says '${gone}'; another plugged in: '${back.line}'`);
  };

  /* ── the Piano (the shared helper now does its asking) ── */
  { const {c, p, errs}=await open("music-piano.html"); console.log("== piano");
    const st=await start(p);
    ok(st.before.shown && st.before.asked===0 && st.before.text==="Use a MIDI keyboard", "the piano's button shows, and nothing is asked before it is pressed");
    ok(/MIDI keyboard ready: Keystation 49/.test(st.line), "pressed: '"+st.line+"'");
    const r=await p.evaluate(async()=>{ __send([0x90,60,100]); const on=LIVE.has("m60") && document.querySelector('#kbd [data-m="60"]').classList.contains("down");
      __send([0xB0,64,127]); const sus=S.sus; __send([0x80,60,0]); const kept=LIVE.has("m60"); __send([0xB0,64,0]);
      return {on, sus, kept, gone:!LIVE.has("m60") && !S.sus}; });
    ok(r.on && r.sus && r.kept && r.gone, "a key plays and lights; the pedal holds it after it is let go; lifted, it ends "+JSON.stringify(r));
    await p.evaluate(()=>__send([0x90,64,90]));
    await p.evaluate(()=>{ window.__midi.inputs.delete("a"); window.__midi.onstatechange({}); });
    ok(await p.evaluate(()=>!LIVE.has("m64")), "a keyboard unplugged while a key is down lets go of its note");
    await p.evaluate(()=>{ window.__midi.inputs.set("a",{id:"a", name:"Keystation 49", onmidimessage:null}); window.__midi.onstatechange({}); });
    await plugs(p, "piano");
    ok(errs.length===0, "piano: no page errors "+errs.join(" | ")); await c.close(); }

  /* ── the Band ── */
  { const {c, p, errs}=await open("music-band.html"); console.log("== band");
    await p.evaluate(async()=>{ const s=document.getElementById("soundSel"); s.value="trumpet"; s.onchange(); await loadSound("trumpet"); });
    const st=await start(p);
    ok(st.before.shown && st.before.asked===0 && /ready: Keystation 49/.test(st.line), "the Band's button shows; pressed: '"+st.line+"'");
    const r=await p.evaluate(()=>{ __send([0x90,67,127]); const a=LIVE.get("m67"); __send([0x90,72,32]); const z=LIVE.get("m72");
      const lit=document.querySelector('#kbd [data-m="67"]'); const res={hard:a && a.vel, soft:z && z.vel, inst:a && a.inst, lit:!!lit && lit.classList.contains("down")};
      __send([0x80,67,0]); __send([0x90,72,0]); res.off=!LIVE.has("m67") && !LIVE.has("m72") && a.stopped; __send([0x90,20,100]); res.out=!LIVE.has("m20"); return res; });
    ok(Math.abs(r.hard-1)<0.01 && Math.abs(r.soft-32/127)<0.01 && r.inst==="trumpet" && r.lit, `a key plays the trumpet as hard as it is struck (${r.hard.toFixed(2)}, ${r.soft.toFixed(2)}), lit on the keys`);
    ok(r.off && r.out, "let go, it ends (a note-on at strength 0 is a let-go too); a note no player reaches stays quiet");
    await p.evaluate(()=>__send([0x90,64,90]));
    await p.evaluate(()=>{ window.__midi.inputs.delete("a"); window.__midi.onstatechange({}); });
    ok(await p.evaluate(()=>!LIVE.has("m64")), "unplugged while a key is down: its note lets go");
    await p.evaluate(()=>{ window.__midi.inputs.set("a",{id:"a", name:"Keystation 49", onmidimessage:null}); window.__midi.onstatechange({}); });
    await plugs(p, "band");
    await p.evaluate(()=>document.getElementById("langBtn").click());
    const es=await p.evaluate(()=>({btn:document.getElementById("midiBtn").textContent, line:document.getElementById("midiLine").textContent}));
    ok(es.btn==="Usar un teclado MIDI" && /Teclado MIDI listo: Launchkey 25/.test(es.line), "in Spanish: "+JSON.stringify(es));
    ok(errs.length===0, "band: no page errors "+errs.join(" | ")); await c.close(); }

  /* ── the Guitar and the Bass ── */
  for(const [page, name, chord] of [["music-guitar.html","guitar",[52,55,60]],["music-bass.html","bass",[36,43,48]]]){
    const {c, p, errs}=await open(page); console.log("== "+name);
    await p.waitForFunction(()=>typeof REAL!=="undefined" || true); await p.waitForTimeout(1500);
    const st=await start(p);
    ok(st.before.shown && st.before.asked===0 && /ready: Keystation 49/.test(st.line), `the ${name}'s button shows; pressed: '${st.line}'`);
    await p.waitForTimeout(1500);   /* the recordings */
    const r=await p.evaluate(async(chord)=>{
      const res={};
      const at=(m)=>{ const cl=MIDI_HELD.get(m); const L=cl && STR_LIVE[cl.s]; return cl && L ? {s:cl.s, f:cl.f, m:TUNING[cl.s]+cl.f, sounding:!L.vc.stopped, vel:null, inReach:inReach(cl.f)||cl.f===0} : null; };
      __send([0x90,chord[0],100]); res.one=at(chord[0]); res.lit=document.querySelector(`#neck .dot[data-c="${res.one&&res.one.s}:${res.one&&res.one.f}"]`); res.lit=!!res.lit && res.lit.classList.contains("down");
      __send([0x80,chord[0],0]); res.offGone=!MIDI_HELD.has(chord[0]) && (!STR_LIVE[res.one.s] || STR_LIVE[res.one.s].vc.stopped);
      chord.forEach(m=>__send([0x90,m,90])); res.chord=chord.map(at); chord.forEach(m=>__send([0x80,m,0]));
      /* the pedal: let go while it is down, the string rings; lifted, it is damped */
      __send([0xB0,64,127]); __send([0x90,chord[1],100]); const cl=MIDI_HELD.get(chord[1]); __send([0x80,chord[1],0]);
      res.ring=!!cl && STR_LIVE[cl.s] && !STR_LIVE[cl.s].vc.stopped;
      __send([0xB0,64,0]); res.lifted=!STR_LIVE[cl.s] || STR_LIVE[cl.s].vc.stopped;
      /* the pitch wheel: the held note glides up (all the way: a whole step) and back */
      __send([0x90,chord[2],100]); const c2=MIDI_HELD.get(chord[2]), L=STR_LIVE[c2.s], seen=[]; const g0=L.vc.glide; L.vc.glide=(x,t)=>{ seen.push(x); return g0(x,t); };
      __send([0xE0,0x7f,0x7f]); __send([0xE0,0x00,0x40]); __send([0x80,chord[2],0]);
      res.bend=seen.map(x=>Math.round((x-chord[2])*100)/100);
      __send([0x90,10,100]); res.out=!MIDI_HELD.has(10);
      return res; }, chord);
    ok(r.one && r.one.m===chord[0] && r.one.sounding && r.lit, `a key plays its note on the neck (string ${r.one&&r.one.s}, fret ${r.one&&r.one.f}), lit there`);
    ok(r.offGone, "let go, the string is damped");
    const strs=r.chord.map(x=>x && x.s);
    ok(r.chord.every((x,i)=>x && x.m===chord[i] && x.sounding) && new Set(strs).size===chord.length, `a chord ${chord.join(" ")} lands on ${new Set(strs).size} strings (${strs.join(", ")})`);
    ok(r.ring && r.lifted, "the pedal lets a note ring after the key is let go; lifted, the string is damped");
    ok(r.bend.length===2 && Math.abs(r.bend[0]-2)<0.01 && Math.abs(r.bend[1])<0.01, "the pitch wheel bends the held note up a whole step and back: "+r.bend.join(", "));
    ok(r.out, "a note below the lowest string stays quiet");
    await plugs(p, name);
    await p.evaluate(()=>document.getElementById("langBtn").click());
    ok(await p.evaluate(()=>document.getElementById("midiBtn").textContent==="Usar un teclado MIDI"), name+": the button in Spanish");
    ok(errs.length===0, name+": no page errors "+errs.join(" | ")); await c.close();
  }

  /* ── the Drum Machine ── */
  { const {c, p, errs}=await open("music-pads.html", {content:"("+FAKE.toString()+")(); try{ localStorage.removeItem('aog.pads.v1'); }catch(e){}"}); console.log("== drum machine");
    const st=await start(p);
    ok(st.before.shown && st.before.asked===0 && st.before.text==="Use MIDI pads or a keyboard", "the Drum Machine's button shows: '"+st.before.text+"'");
    ok(/MIDI ready: Keystation 49\. Notes 36 to 59 play pads 1 to 24/.test(st.line), "pressed: '"+st.line+"'");
    await p.waitForFunction(()=>isReady(0), null, {timeout:30000});
    const r=await p.evaluate(()=>{ window.__hits=[]; const tr=window.trigger; window.trigger=function(bi,pi,vel){ __hits.push([bi,pi,Math.round(vel*1000)/1000]); return tr.apply(this, arguments); };
      __send([0x90,36,127]); __send([0x80,36,0]); __send([0x90,59,64]); __send([0x80,59,0]); __send([0x90,35,100]); __send([0x90,60,100]);
      const a=__hits.slice(); S.full=true; __hits=[]; __send([0x90,40,20]); __send([0x80,40,0]); const f=__hits.slice(); S.full=false;
      return {a, f, sel:S.sel}; });
    ok(JSON.stringify(r.a)===JSON.stringify([[0,0,1],[0,23,0.504]]), "notes 36 and 59 hit pads 1 and 24 of bank A, as hard as they are struck; 35 and 60 do nothing: "+JSON.stringify(r.a));
    ok(JSON.stringify(r.f)===JSON.stringify([[0,4,1]]), "with full strength on, a soft note hits pad 5 at full strength: "+JSON.stringify(r.f));
    /* the bank in view: bank B's chords, held while the key is held */
    await p.evaluate(()=>{ const s=document.getElementById("bankSel"); s.value="1"; s.onchange(); });
    await p.waitForFunction(()=>isReady(1), null, {timeout:60000});
    const ch=await p.evaluate(()=>new Promise(res=>{ __hits=[]; __send([0x90,38,100]); const held=DOWN.has("m38");
      setTimeout(()=>{ __send([0x80,38,0]); res({hits:__hits.slice(), held, after:DOWN.has("m38")}); }, 120); }));
    ok(ch.hits.length===1 && ch.hits[0][0]===1 && ch.hits[0][1]===2 && ch.held && !ch.after, "on bank B, note 38 holds pad 3's chord while the key is down: "+JSON.stringify(ch));
    await plugs(p, "drum machine");
    await p.evaluate(()=>document.getElementById("langBtn").click());
    const es=await p.evaluate(()=>({btn:document.getElementById("midiBtn").textContent}));
    ok(es.btn==="Usar pads MIDI o un teclado", "in Spanish: "+es.btn);
    ok(errs.length===0, "drum machine: no page errors "+errs.join(" | ")); await c.close(); }

  /* ── a room kept open out of sight (the Studio hides its frame) does not play; the room in view does ── */
  { const c=await b.newContext({viewport:{width:1280,height:900}}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort()); await c.addInitScript(FAKE);
    const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); console.log("== out of sight");
    await p.goto("http://localhost:9266/no-such-page-for-a-frame");
    await p.evaluate(()=>new Promise(ok=>{ const f=document.createElement("iframe"); f.id="room"; f.style.cssText="width:1200px;height:800px;border:0"; f.onload=ok; f.src="/music-band.html"; document.body.appendChild(f); }));
    await p.waitForTimeout(1500); const fr=p.frames().find(f=>/music-band/.test(f.url()));
    await fr.evaluate(async()=>{ await loadSound(S.sound); document.getElementById("midiBtn").click(); }); await p.waitForTimeout(250);
    const seen=await fr.evaluate(()=>{ __send([0x90,67,100]); const a=LIVE.has("m67"); __send([0x80,67,0]); return a; });
    await p.evaluate(()=>{ document.getElementById("room").style.display="none"; });
    const hid=await fr.evaluate(()=>{ __send([0x90,67,100]); const a=LIVE.has("m67"); __send([0x80,67,0]); return a; });
    await p.evaluate(()=>{ document.getElementById("room").style.display=""; });
    const back=await fr.evaluate(()=>{ __send([0x90,67,100]); const a=LIVE.has("m67"); __send([0x80,67,0]); return a && !LIVE.has("m67"); });
    ok(seen && !hid && back, `a room in a frame plays the keyboard (${seen}); hidden, as the Studio keeps a room it left, it stays quiet (${!hid}); shown again, it plays (${back})`);
    ok(errs.length===0, "out of sight: no page errors "+errs.join(" | ")); await c.close(); }

  /* ── AOG-PADS-LAYERS-V1: the Drum Machine's chords and notes keep their room's soft and loud recordings ── */
  { const {c, p, errs}=await open("music-pads.html", {content:"try{ localStorage.removeItem('aog.pads.v1'); }catch(e){}"}); console.log("== drum machine · strengths");
    const r=await p.evaluate(async()=>{
      const use=async(bi, inst)=>{ Object.assign(S.banks[bi], {inst:inst}); prep(bi); const t0=Date.now(); while(!isReady(bi)){ if(Date.now()-t0>60000) throw new Error("not ready "+inst); await new Promise(z=>setTimeout(z,50)); } };
      const hit=(bi, pi, v)=>{ const x=trigger(bi, pi, v, ctx().currentTime); if(x) x.stop(ctx().currentTime+0.05); return x ? x.parts.map(u=>u.split("/").pop()) : null; };
      const o={};
      await use(1, "k:grand"); o.grand=[0.3, 0.6, 0.9].map(v=>hit(1, 0, v));
      await use(1, "g:black"); o.black=[0.4, 0.9, 0.9].map(v=>hit(1, 0, v));
      await use(1, "b:trumpet"); o.trumpet=[0.1, 0.9].map(v=>hit(1, 0, v));
      await use(1, "b:bagpipe"); o.bagpipe=[0.9].map(v=>hit(1, 0, v));
      await use(2, "a:synthbass"); o.synth=[0.1, 0.4, 0.6, 0.9].map(v=>hit(2, 0, v));
      return o; });
    const ends=(list, ch)=>list.every(f=>new RegExp("\\d+"+ch+"\\.mp3$").test(f));
    ok(ends(r.grand[0],"s") && ends(r.grand[1],"m") && ends(r.grand[2],"l"), "the grand's chord: a soft hit plays its soft recordings, a middle one the middle, a hard one the loud (as on the piano): "+r.grand.map(x=>x[0]).join(" · "));
    ok(r.black[0].every(f=>/_v1_/.test(f)) && r.black[1].every(f=>/_v2_/.test(f)) && r.black[1].join()!==r.black[2].join(), "the electric guitar's chord: its own two strengths, and its takes in turn on the same hit: "+r.black.map(x=>x.join(",")).join(" · "));
    ok(r.trumpet.every(x=>x.some(f=>/s\.mp3$/.test(f)) && x.some(f=>/l\.mp3$/.test(f))), "the trumpet's chord blends its soft and loud recordings, as the Band does: "+r.trumpet.map(x=>x.slice(0,2).join("+")).join(" · "));
    ok(r.bagpipe[0].every(f=>/s\.mp3$/.test(f)), "the bagpipes, recorded at one strength, play that one");
    ok(new Set(r.synth.map(x=>x[0].match(/_v(\d)_/)[1])).size===4, "the synth bass's note: four strengths, one for each hit: "+r.synth.map(x=>x[0]).join(" · "));
    /* by touch: the middle of a pad is a hard hit, its edge a softer one, so the touch picks the recording too */
    await p.evaluate(async()=>{ S.bank=1; S.banks[1].inst="k:grand"; paintAll(); prep(1); while(!isReady(1)) await new Promise(z=>setTimeout(z,50)); window.__parts=[]; const tr=window.trigger; window.trigger=function(){ const x=tr.apply(this, arguments); if(x && x.parts) __parts.push(x.parts.map(u=>u.split("/").pop())); return x; }; });
    const pad=await p.evaluate(()=>{ const el=document.querySelector('#pads .pad[data-p="0"]'); el.scrollIntoView({block:"center"}); const r=el.getBoundingClientRect(); return {x:r.x, y:r.y, w:r.width, h:r.height}; });
    await p.mouse.move(pad.x+pad.w/2, pad.y+pad.h/2); await p.mouse.down(); await p.waitForTimeout(60); await p.mouse.up(); await p.waitForTimeout(60);
    await p.mouse.move(pad.x+3, pad.y+3); await p.mouse.down(); await p.waitForTimeout(60); await p.mouse.up(); await p.waitForTimeout(60);
    const tp=await p.evaluate(()=>__parts);
    ok(tp.length===2 && ends(tp[0],"l") && ends(tp[1],"m"), "a tap in the middle of a pad plays the loud recordings, one at its corner the middle ones: "+tp.map(x=>x[0]).join(" · "));
    ok(errs.length===0, "strengths: no page errors "+errs.join(" | ")); await c.close(); }

  /* ── where the browser has no MIDI (an iPhone's Safari): no button, in any room ── */
  { const out={};
    for(const page of ["music-piano.html","music-band.html","music-guitar.html","music-bass.html","music-pads.html"]){
      const {c, p, errs}=await open(page, ()=>{ try{ Object.defineProperty(Navigator.prototype, "requestMIDIAccess", {value:undefined, configurable:true}); }catch(e){} });
      out[page]=await p.evaluate(()=>{ const b=document.getElementById("midiBtn"); return !!b && b.hidden && b.getBoundingClientRect().width===0 && !document.getElementById("midiLine").textContent; });
      if(errs.length) out[page]="errors: "+errs.join(" | ");
      await c.close(); }
    ok(Object.values(out).every(x=>x===true), "without Web MIDI no room shows the button or a line: "+JSON.stringify(out)); }
  console.log(fails ? fails+" FAILED" : "all passed");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
