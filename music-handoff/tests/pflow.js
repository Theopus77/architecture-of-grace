const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9908);
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m); if(!c) process.exitCode=1;};
(async()=>{const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
 const c=await b.newContext({viewport:{width:1280,height:900}});
 const errs=[]; c.on("page", pg=>pg.on("pageerror",e=>errs.push(pg.url().split("/").pop()+": "+e.message)));
 // 1 · a beat on the drum machine
 const d=await c.newPage(); d.on("pageerror",e=>errs.push("drums: "+e.message));
 await d.goto("http://localhost:9908/music-drums.html#home"); await d.waitForTimeout(1500);
 await d.click('.sp-pad[data-pad="kick"]'); await d.waitForTimeout(2500);
 await d.locator('.starter-row .aogdd-sel').selectOption({label:"Boom bap (90s hip-hop)"}); await d.waitForTimeout(500);
 await d.evaluate("bounceToDecks()"); await d.waitForTimeout(3000);
 const take=await d.evaluate("AOGHandoff.get('drumbench').then(x=>x&&({bpm:x.bpm,bars:x.bars,passSec:x.passSec,loops:x.loops,offset:x.offset,swing:x.swing,size:x.wav.size}))");
 ok(take && take.passSec>0 && take.loops>0 && take.offset===0.03 && take.swing===0.58, "the drum machine's bounce now says its pass length, passes, offset and swing: "+JSON.stringify(take));
 // 2 · the piano finds it
 const p=await c.newPage(); p.on("pageerror",e=>errs.push("piano: "+e.message));
 await p.addInitScript(()=>{ window.AOG_FEEL_OFF=true; });   /* AOG-FEEL-V1: the grid itself (play/feel.js checks the feel) */ await p.goto("http://localhost:9908/music-piano.html"); await p.waitForFunction(()=>SETS.grand.ready, null, {timeout:30000}); await p.waitForTimeout(500);
 ok(await p.isVisible("#drumBtn"), "the piano shows Play with my drum beat");
 ok((await p.textContent("#drumBox")).includes("Drum machine · 90 BPM"), "and names the beat: "+(await p.textContent("#drumBox")).trim().slice(0,90));
 await p.click("#drumBtn"); await p.waitForTimeout(150);
 ok(await p.evaluate("curBpm()===90 && document.getElementById('bpm').disabled && curSwing()===0.58"), "with the beat on, the tempo locks to the beat (90) and its swing (58%)");
 // 3 · play over it
 await p.selectOption("#progSel","sadpop"); await p.selectOption("#rhythmSel","broken");
 await p.click("#playBtn"); await p.waitForTimeout(1500);
 const pl=await p.evaluate("({drum:!!PLAY.drum, ls:PLAY.drum&&PLAY.drum.loopStart, le:PLAY.drum&&PLAY.drum.loopEnd, t0:PLAY.t0, barSec:PLAY.barSec, playing:S.playing})");
 ok(pl.drum && Math.abs(pl.ls-0.03)<1e-6 && Math.abs(pl.le-(0.03+take.passSec*take.loops))<1e-6, "the beat loops exactly on its own passes: "+JSON.stringify(pl));
 ok(Math.abs(pl.barSec-(4*60/90))<1e-6, "one chord per bar at 90 BPM ("+pl.barSec.toFixed(3)+" s)");
 // off-beats lean with the swing: check the scheduled start times of a broken bar
 const times=await p.evaluate(()=>{ const oc=new OfflineAudioContext(2,44100,44100), ch=makeChain(oc), got=[]; const mv=makeVoice;
   window.makeVoice=function(c,chh,id,m,v,when){ got.push(+when.toFixed(4)); return mv.apply(this,arguments); };
   scheduleBar(oc, ch, 0, 0, 4*60/90, 0.58, {v:null}); window.makeVoice=mv; return [...new Set(got)].sort((a,b)=>a-b); });
 const beat=60/90, expect=[0, 0.5*beat+0.08*beat, 1*beat, 1.5*beat+0.08*beat];
 ok(expect.every((x,i)=>Math.abs(times[i]-x)<0.002), "the piano's off-beats lean back with the drum's swing: "+times.slice(0,4).map(x=>x.toFixed(3)).join(", "));
 await p.click("#playBtn"); await p.waitForTimeout(200);
 ok(!(await p.evaluate("S.playing")) && !(await p.evaluate("PLAY.drum")), "Stop stops the chords and the beat");
 // 4 · send to the turntables
 await p.click("#sendBtn"); await p.waitForFunction(()=>/Sent|Enviado/.test(document.getElementById("sendLine").textContent), null, {timeout:60000});
 const kt=await p.evaluate(async()=>{ const x=await AOGHandoff.get("keysbench"); const ab=await x.wav.arrayBuffer(); const a=new OfflineAudioContext(2,1,44100); const bf=await a.decodeAudioData(ab);
   const ch=bf.getChannelData(0); let s=0; for(let i=0;i<ch.length;i++) s+=ch[i]*ch[i]; return {name:x.name, bpm:x.bpm, bars:x.bars, secs:+bf.duration.toFixed(1), rms:+(10*Math.log10(s/ch.length)).toFixed(1)}; });
 ok(kt.bars>=8 && kt.secs>20 && kt.rms>-30, "Send to the turntables made a "+kt.secs+" s recording with chords and beat ("+JSON.stringify(kt)+")");
 // 5 · the turntables show it and load it
 const t=await c.newPage(); t.on("pageerror",e=>errs.push("decks: "+e.message));
 await t.goto("http://localhost:9908/music-decks.html"); await t.waitForTimeout(1500);
 const rows=await t.locator("#bench .take b").allTextContents();
 ok(rows.join("|")==="From the classic drum machine|From the piano", "the turntables list both: "+rows.join(" + "));
 ok(await t.isVisible('#navPiano'), "the turntables link to the piano");
 await t.click('[data-keys="A"]'); await t.waitForTimeout(1500);
 ok(errs.length===0, "loading the piano onto deck A works, and no errors on any page "+errs.join(" | "));
 await b.close(); srv.close();})();
