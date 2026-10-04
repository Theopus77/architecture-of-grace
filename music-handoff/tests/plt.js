/* every lesson step on the piano, done the way a learner does it, then checked */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9940);
let fails=0, passes=0;
function ok(c,m){ if(c){ passes++; } else { fails++; console.log("FAIL "+m); } }
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9940/music-piano.html"); await p.waitForTimeout(1500);
  const done=async ids=>{ const d=await p.evaluate(()=>LS.done); return ids.filter(id=>!d[id]); };
  const expect=async (ids,label)=>{ await p.waitForTimeout(80); const miss=await done(ids); ok(miss.length===0, label+" — not ticked: "+miss.join(", ")); if(!miss.length) console.log("PASS "+label); };
  const key=async (code,ms=60)=>{ await p.keyboard.down(code); await p.waitForTimeout(ms); await p.keyboard.up(code); await p.waitForTimeout(30); };
  const keys=async codes=>{ for(const k of codes) await key(k); };
  const chord=async codes=>{ for(const k of codes){ await p.keyboard.down(k); await p.waitForTimeout(25); } await p.waitForTimeout(80); for(const k of codes) await p.keyboard.up(k); await p.waitForTimeout(40); };
  const pad=async i=>{ await p.click(`.pad[data-i="${i}"]`); await p.waitForTimeout(60); };
  const sel=async (id,v)=>{ await p.selectOption("#"+id, v); await p.waitForTimeout(80); };
  const range=async (id,v)=>{ await p.evaluate(([id,v])=>{ const r=document.getElementById(id); r.value=String(v); r.dispatchEvent(new Event("input",{bubbles:true})); }, [id,v]); await p.waitForTimeout(320); };
  const play=async ()=>{ if(!(await p.evaluate(()=>S.playing))) await p.click("#playBtn"); await p.waitForTimeout(300); };
  const stopIt=async ()=>{ if(await p.evaluate(()=>S.playing)) await p.click("#playBtn"); await p.waitForTimeout(150); };
  const bars=async n=>{ await p.waitForFunction(n=>S.playing && PLAY.cur>=n, n, {timeout:60000}); await p.waitForTimeout(100); };
  const keyAtM=async (m, frac)=>{ const r=await p.evaluate(m=>{ document.getElementById("kbd").scrollIntoView({block:"center"}); const k=document.querySelector(`#kbd [data-m="${m}"]`); if(!k) return null; const b=k.getBoundingClientRect(); return [b.left+b.width/2, b.top, b.height]; }, m);
    if(!r) return false; await p.mouse.move(r[0], r[1]+r[2]*frac); await p.mouse.down(); await p.waitForTimeout(50); await p.mouse.up(); await p.waitForTimeout(40); return true; };
  await p.click("#kbd"); /* wake audio */
  await p.evaluate(()=>{ document.getElementById("kbd").scrollIntoView({block:"center"}); });

  // 1
  await keyAtM(60, 0.6); await pad(0); await sel("progSel","pop"); await play(); await p.waitForTimeout(600); await stopIt();
  await expect(["key1","pad1","pat1","play1","stop1"], "1 Turn it on and play");
  // 2 — C is the key A on a computer (KB.lo is a C)
  const lo=await p.evaluate(()=>KB.lo); ok(lo%12===0, "the keyboard starts on a C ("+lo+")");
  await keys(["KeyA","KeyK"]); await keys(["KeyW","KeyE"]); await keys(["KeyT","KeyY","KeyU"]);
  await expect(["fc","fc2","fb2","fb3"], "2 Find C");
  // 3
  await keys(["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK"]);
  await keys(["KeyK","KeyJ","KeyH","KeyG","KeyF","KeyD","KeyS","KeyA"]);
  await key("KeyX"); await keys(["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK"]);
  await expect(["up8","down8","up8hi"], "3 Seven letters");
  // 4
  await keys(["KeyA","KeyK"]);
  await p.click("#downBtn"); await p.click("#upBtn");
  for(let i=0;i<6;i++) await key("KeyZ"); await key("KeyA");
  for(let i=0;i<8;i++) await key("KeyX"); await keyAtM(await p.evaluate(()=>KB.hi), 0.6);
  await expect(["opair","ohigher","olower","ofar"], "4 Octaves");
  for(let i=0;i<8;i++) await key("KeyZ"); for(let i=0;i<3;i++) await key("KeyX");
  // 5 — touch high on the key for soft, low for loud
  const m5=(await p.evaluate(()=>KB.lo))+4;
  await keyAtM(m5, 0.05); await keyAtM(m5, 0.98);
  for(const f of [0.1,0.35,0.6,0.95]) await keyAtM(m5, f);
  await expect(["vsoft","vloud","vgrow"], "5 Soft and loud");
  // 6
  await chord(["KeyA","KeyD","KeyG"]); await chord(["KeyF","KeyH","KeyK"]); await chord(["KeyS","KeyG","KeyJ"]);
  await sel("keySel","0"); if(await p.evaluate(()=>S.minor)) await p.click("#majBtn"); await pad(0);
  await expect(["hceg","hfac","hgbd","hpad"], "6 A chord by hand");
  // 7
  await chord(["KeyA","KeyE","KeyG"]); await p.click("#minBtn"); await pad(0); await p.click("#majBtn"); await pad(0);
  await expect(["mjr","mnr","mmood","mback"], "7 Major and minor");
  // 8
  for(let i=0;i<6;i++) await pad(i); await pad(4); await pad(0); await pad(1);
  await sel("keySel","7"); for(let i=0;i<6;i++) await pad(i);
  await expect(["p6","p51","pmin","p4key"], "8 The pads");
  await sel("keySel","0");
  // 9 — a fast tempo so the bars go by
  await range("bpm",180); await sel("progSel","pop"); await play(); await bars(8); await sel("progSel","fifties"); await p.waitForTimeout(400); await stopIt();
  await expect(["cpop","cplay","cround","cswap"], "9 A chord pattern");
  // 10
  await play(); for(const r of ["hold","pulse","broken","offbeat"]){ await sel("rhythmSel", r); const c0=await p.evaluate(()=>PLAY.cur); await bars(c0+1); } await stopIt();
  await expect(["rhold","rpulse","rbroken","roff"], "10 Four ways");
  // 11
  await range("bpm",60); await play(); await p.waitForTimeout(500); await stopIt(); await range("bpm",120); await play(); await p.waitForTimeout(500); await stopIt();
  await expect(["t60","t60p","t120","t120p"], "11 Tempo");
  // 12
  await range("bpm",180); await sel("keySel","0"); await play(); await sel("keySel","7"); const c12=await p.evaluate(()=>PLAY.cur); await bars(c12+1); await sel("keySel","2"); await bars(c12+2); await stopIt();
  await expect(["kpat","kg","k3","klive"], "12 Change the key");
  await sel("keySel","0");
  // 13
  await p.click("#clearBtn"); await p.click("#ownBtn"); await pad(3); await pad(4); await pad(5); await pad(0); await p.click("#ownBtn"); await play(); await p.waitForTimeout(400); await stopIt();
  await expect(["own1","own4","ownhome","ownplay"], "13 Your own pattern");
  // 14 — Shift is the pedal
  await p.keyboard.down("ShiftLeft"); await p.waitForTimeout(80); await keys(["KeyA","KeyD","KeyG","KeyK","KeyL"]); await p.keyboard.up("ShiftLeft"); await p.waitForTimeout(120);
  await expect(["son","sring","soff"], "14 The pedal");
  // 15
  for(const s of ["grand","upright","honky","epwarm","epreed","ep80","organ","church"]){ await sel("soundSel", s); await pad(0); }
  await expect(["tgrand","tep","torg","tall"], "15 Eight sounds");
  await sel("soundSel","epwarm");
  // 16 — play the keys that are lit
  await sel("progSel","pop"); await sel("rhythmSel","hold"); await range("bpm",90); await play(); await bars(0);
  const litPlay=async n=>{ for(let i=0;i<n;i++){ const code=await p.evaluate(i=>{ const c=curChord(); if(!c) return null; const pcs=chordPcs(c); const inv={}; Object.keys(KEYMAP).forEach(k=>{ inv[(KB.lo+KEYMAP[k])%12]=inv[(KB.lo+KEYMAP[k])%12]||k; }); return inv[pcs[i%pcs.length]]; }, i); if(code) await key(code, 40); } };
  await litPlay(8); const c16=await p.evaluate(()=>PLAY.cur); await bars(c16+1); await litPlay(3); await stopIt();
  await expect(["lplay","llit","llit8","lchange"], "16 The lit keys");
  // 17 — a beat from the drum machine, put on the shared shelf the way the drum machine does
  await p.evaluate(async()=>{ const sr=44100, n=sr*4, L=new Float32Array(n), R=new Float32Array(n); for(let i=0;i<n;i+=sr/2){ for(let j=0;j<800;j++){ L[i+j]=R[i+j]=Math.sin(j/8)*Math.exp(-j/200)*0.6; } }
    await AOGHandoff.put("drumbench", {name:"Test beat · 120 BPM · 2 bars", bpm:120, bars:2, at:Date.now(), wav:wavBlob(L,R,sr), passSec:4, loops:1, offset:0.03, swing:0.5}); await checkDrums(); });
  await p.waitForSelector("#drumBtn"); await p.click("#drumBtn"); await p.waitForTimeout(150); await play(); await sel("rhythmSel","pulse"); const c17=await p.evaluate(()=>PLAY.cur); await bars(c17+1); await stopIt();
  await expect(["dsend","don","dplay","dpulse"], "17 With the drum machine");
  await p.click("#drumBtn"); await p.waitForTimeout(100);
  // 18
  await range("bpm",180); await sel("progSel","blues"); await sel("soundSel","organ"); await sel("rhythmSel","pulse"); await play(); await bars(12); await stopIt();
  await expect(["bpick","borg","bpulse","b12"], "18 Blues");
  // 19
  await sel("progSel","jazz"); await sel("soundSel","epwarm"); await sel("rhythmSel","broken"); await play(); await p.waitForTimeout(400); await stopIt();
  await chord(["KeyS","KeyF","KeyH","KeyK"]);
  await expect(["jpick","jep","jplay","jhand"], "19 Seventh chords");
  // 20 — the dial: 0 on the slider is 1987
  await sel("soundSel","grand"); await range("era",0); await key("KeyA");
  for(let i=0;i<8;i++) await key("KeyX"); const top=await p.evaluate(()=>KB.hi); await keyAtM(top, 0.6);
  await range("era",100); await keyAtM(top, 0.6); await range("era",50); await key("KeyA");
  await expect(["e87","ehigh","e26","emid"], "20 1987 or 2026");
  for(let i=0;i<8;i++) await key("KeyZ"); for(let i=0;i<3;i++) await key("KeyX"); await range("era",100);
  // 21
  await sel("soundSel","epwarm"); await p.click("#clearBtn"); await p.click("#ownBtn"); for(const i of [0,3,4,0]) await pad(i); await p.click("#ownBtn");
  await p.evaluate(()=>{ LS.pick=20; saveLessons(); paintLessonBox(); });
  await p.fill("#pieceName","My first track"); await p.waitForTimeout(100);
  await p.click("#sendBtn"); await p.waitForFunction(()=>/Sent|Enviado/.test(document.getElementById("sendLine").textContent), null, {timeout:60000});
  const href=await p.getAttribute("#lSheet","href"); ok(href==="piano-lessons.html#l21", "worksheet link for lesson 21 ("+href+")");
  await p.evaluate(()=>{ const a=document.getElementById("lSheet"); a.addEventListener("click", e=>e.preventDefault(), {once:true}); a.click(); });
  await expect(["fown","fname","fsend","fsheet"], "21 Make a track");
  ok((await p.evaluate(()=>lessonNow()))===21, "after the skills, the next lesson is the first song (lesson 22)");

  // songs — a step ticks only while that song is the lesson you picked
  const pick=async n=>{ await p.evaluate(n=>{ LS.pick=n-1; saveLessons(); paintLessonBox(); }, n); await p.waitForTimeout(80); };
  const stepsOf=async n=>p.evaluate(n=>LESSONS[n-1].steps, n);
  // 22 · Frère Jacques
  await pick(22); await sel("keySel","0"); if(await p.evaluate(()=>S.minor)) await p.click("#majBtn"); await range("bpm",100); await sel("soundSel","grand"); await sel("rhythmSel","pulse");
  await p.click("#clearBtn"); await p.click("#ownBtn"); await pad(0); await p.click("#ownBtn");
  await keys(["KeyA","KeyS","KeyD","KeyA","KeyA","KeyS","KeyD","KeyA"]); await keys(["KeyD","KeyF","KeyG","KeyD","KeyF","KeyG"]);
  await keys(["KeyG","KeyH","KeyG","KeyF","KeyD","KeyA","KeyG","KeyH","KeyG","KeyF","KeyD","KeyA"]); await keys(["KeyA","KeyG","KeyA","KeyA","KeyG","KeyA"]);
  await play(); await p.waitForTimeout(400); await stopIt();
  await expect(await stepsOf(22), "22 Song 1 Frère Jacques (all 8 steps)");
  // 23 · Ode to Joy: pads 1 5 1 5 1 5 1 1 and three lines on the keys
  await pick(23); await p.click("#clearBtn"); await p.click("#ownBtn"); for(const i of [0,4,0,4,0,4,0,0]) await pad(i); await p.click("#ownBtn");
  await keys(["KeyD","KeyD","KeyF","KeyG","KeyG","KeyF","KeyD","KeyS"]); await keys(["KeyA","KeyA","KeyS","KeyD","KeyD","KeyS","KeyS"]); await keys(["KeyA","KeyA","KeyS","KeyD","KeyS","KeyA","KeyA"]);
  await play(); await p.waitForTimeout(400); await stopIt();
  await expect(await stepsOf(23), "23 Song 2 Ode to Joy");
  // 25 · Canon: a pattern from the menu
  await pick(25); await sel("keySel","2"); await range("bpm",66); await sel("soundSel","church"); await sel("rhythmSel","broken"); await sel("progSel","canon"); await play(); await p.waitForTimeout(400); await stopIt();
  await expect(await stepsOf(25), "25 Song 4 Canon");
  // a song step must not tick while another lesson is picked
  await pick(26); const s26=await stepsOf(26); await pick(1); await sel("keySel","5"); await range("bpm",96); await sel("soundSel","organ"); await sel("rhythmSel","offbeat"); await sel("progSel","blues");
  ok((await done(s26)).length===s26.length, "song 5 does not tick while lesson 1 is picked");
  await pick(26); await play(); await p.waitForTimeout(400); await stopIt();
  await expect(s26, "26 Song 5 Blues on the organ (ticks once picked)");
  // 30 · reggae: a minor pattern from the menu sets Minor itself
  await pick(30); await sel("keySel","9"); await range("bpm",76); await sel("soundSel","organ"); await sel("rhythmSel","offbeat"); await sel("progSel","minor"); await play(); await p.waitForTimeout(400); await stopIt();
  await expect(await stepsOf(30), "30 Song 9 Reggae (minor)");
  // 31 · cumbia: E minor, pads 1 4 5 1 in the minor set
  await pick(31); await sel("keySel","4"); await p.click("#minBtn"); await range("bpm",94); await sel("soundSel","ep80"); await sel("rhythmSel","offbeat");
  await p.click("#clearBtn"); await p.click("#ownBtn"); for(const i of [0,2,3,0]) await pad(i); await p.click("#ownBtn"); await play(); await p.waitForTimeout(400); await stopIt();
  await expect(await stepsOf(31), "31 Song 10 Cumbia (own minor pattern)");
  await p.click("#majBtn");
  // 33 · black keys: F♯ major, pads 1 4 5 1, ten black keys while it plays
  await pick(33); await sel("keySel","6"); await range("bpm",90); await sel("soundSel","epwarm"); await sel("rhythmSel","broken");
  await p.click("#clearBtn"); await p.click("#ownBtn"); for(const i of [0,3,4,0]) await pad(i); await p.click("#ownBtn"); await play();
  await keys(["KeyW","KeyE","KeyT","KeyY","KeyU","KeyO","KeyP","KeyW","KeyE","KeyT"]); await stopIt();
  await expect(await stepsOf(33), "33 Song 12 Black keys only");
  // 37 · lo-fi: the dial toward 1987
  await pick(37); await sel("keySel","5"); await range("bpm",76); await sel("soundSel","epwarm"); await sel("rhythmSel","hold"); await sel("progSel","jazz"); await range("era",30); await play(); await p.waitForTimeout(400); await stopIt();
  await expect(await stepsOf(37), "37 Song 16 Lo-fi (dial toward 1987)");
  await range("era",100);
  // 38 · the class song: eight chords, four different, ending on 1, played and sent
  await pick(38); await sel("keySel","0"); await p.click("#clearBtn"); await p.click("#ownBtn"); for(const i of [0,5,3,4,0,1,3,0]) await pad(i); await p.click("#ownBtn");
  await play(); await p.waitForTimeout(400); await stopIt();
  await p.click("#sendBtn"); await p.waitForFunction(()=>/Sent|Enviado/.test(document.getElementById("sendLine").textContent) && !document.getElementById("sendBtn").disabled, null, {timeout:60000}); await p.waitForTimeout(200);
  await expect(await stepsOf(38), "38 Song 17 Our class song");

  // the card, the menu and the ladder agree
  const ui=await p.evaluate(()=>({kick:document.getElementById("lKick").textContent, opts:document.querySelectorAll("#lessonRow [data-lesson]").length}));
  ok(/Lessons · \d+\/38/.test(ui.kick) && ui.opts===38, "lesson card and menu: "+JSON.stringify(ui));
  // ticks survive a reload
  const before=await p.evaluate(()=>Object.keys(LS.done).length);
  await p.reload(); await p.waitForTimeout(1200);
  const after=await p.evaluate(()=>Object.keys(LS.done).length);
  ok(before===after && after>80, "ticks are kept after a reload ("+before+" → "+after+")");
  ok(errs.length===0, "no page errors: "+errs.join(" | "));
  console.log((fails?fails+" FAILED, ":"")+passes+" passed");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
