const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9905);
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m); if(!c) process.exitCode=1;};
(async()=>{const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
 const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
 const errs=[]; p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://localhost:9905/music-piano.html"); await p.waitForFunction(()=>SETS.grand.ready, null, {timeout:30000});
 const live=()=>p.evaluate("[...LIVE.entries()].map(([k,v])=>k+(v.down?'':'~')).sort().join(' ')");
 const center=async(sel)=>{ await p.locator(sel).first().scrollIntoViewIfNeeded(); const r=await p.locator(sel).first().boundingBox(); return {x:r.x+r.width/2, y:r.y+r.height*0.7}; };
 // pads
 let pc=await center('.pad[data-i="0"]'); await p.mouse.move(pc.x,pc.y); await p.mouse.down(); await p.waitForTimeout(150);
 ok((await live())==="p36 p60 p64 p67", "pad 1 (C) held: bass C2 + the chord C4 E4 G4 → "+await live());
 await p.mouse.up(); await p.waitForTimeout(100);
 ok((await live())==="", "letting go of the pad stops the chord");
 // keyboard: press, slide, release
 let k=await center('#kbd .wk[data-m="60"]'); await p.mouse.move(k.x,k.y); await p.mouse.down(); await p.waitForTimeout(80);
 ok((await live())==="k60", "a key press plays C4");
 const k2=await center('#kbd .wk[data-m="64"]'); await p.mouse.move(k2.x,k2.y,{steps:6}); await p.waitForTimeout(80);
 ok((await live())==="k64", "sliding across to E4 moves the note (no stuck notes on the way)");
 await p.mouse.up(); await p.waitForTimeout(60); ok((await live())==="", "letting go stops it");
 // black key lands on the black key
 await p.locator('#kbd .bk[data-m="61"]').scrollIntoViewIfNeeded(); const bk=await p.locator('#kbd .bk[data-m="61"]').boundingBox(); await p.mouse.move(bk.x+bk.width/2, bk.y+bk.height*0.5); await p.mouse.down(); await p.waitForTimeout(60);
 ok((await live())==="k61", "a black key plays its own note (C♯4)"); await p.mouse.up();
 // computer keys
 const lo=await p.evaluate("KB.lo");
 await p.keyboard.down("a"); await p.keyboard.down("a"); await p.waitForTimeout(50);
 ok((await live())==="c"+lo, "A plays the lowest C on screen ("+lo+"), and holding it plays once");
 await p.keyboard.up("a"); await p.waitForTimeout(50); ok((await live())==="", "letting go of A stops it");
 await p.keyboard.down("Shift"); await p.keyboard.press("d"); await p.keyboard.press("g"); await p.waitForTimeout(50);
 ok((await live())==="c"+(lo+4)+"~ c"+(lo+7)+"~", "with Shift held (pedal) the notes keep ringing after the keys come up");
 await p.keyboard.up("Shift"); await p.waitForTimeout(50); ok((await live())==="", "letting go of Shift lets them stop");
 await p.keyboard.press("x"); ok((await p.evaluate("KB.lo"))===lo+12, "X moves the keyboard up an octave"); await p.keyboard.press("z");
 // Space with no pattern
 await p.keyboard.press("Space"); await p.waitForTimeout(100);
 ok(!(await p.evaluate("S.playing")) && (await p.textContent("#ownLine")).includes("chord pattern"), "Space with no pattern says to pick one first");
 // preset + play
 await p.selectOption("#progSel","pop"); await p.waitForTimeout(100);
 ok((await p.locator(".slot").allTextContents()).join(" ")==="C G Am F", "Pop pattern in C: C G Am F");
 await p.evaluate("S.bpm=150"); await p.keyboard.press("Space"); await p.waitForTimeout(3600);
 const st=await p.evaluate("({playing:S.playing, cur:PLAY.cur, bar:PLAY.bar, now:document.querySelectorAll('.slot.now').length, lit:document.querySelectorAll('#kbd .lit').length, voices:PLAY.voices.length})");
 ok(st.playing && st.cur>=1 && st.now===1, "Space plays the pattern; the current chord is marked ("+JSON.stringify(st)+")");
 ok(st.lit>=3, "the keys of the chord that is playing light up on the keyboard");
 // tempo change mid-play keeps going (no restart)
 const barBefore=await p.evaluate("PLAY.bar");
 await p.locator("#bpm").fill("120"); await p.locator("#bpm").dispatchEvent("input"); await p.waitForTimeout(300);
 ok((await p.evaluate("PLAY.bar"))>=barBefore && (await p.evaluate("S.playing")), "changing the tempo while it plays does not start it over");
 await p.keyboard.press("Space"); await p.waitForTimeout(200);
 ok(!(await p.evaluate("S.playing")) && (await p.evaluate("document.querySelectorAll('.slot.now').length"))===0, "Space stops it");
 // make my own
 await p.click("#ownBtn"); for(const i of [0,4,5,3]){ const q=await center('.pad[data-i="'+i+'"]'); await p.mouse.click(q.x,q.y); await p.waitForTimeout(60); }
 ok((await p.locator(".slot").allTextContents()).join(" ")==="C G Am F" && (await p.evaluate("S.preset"))==="", "Make my own: tapping pads 1 5 6 4 builds C G Am F");
 ok((await p.locator("#progSel option").first().textContent())==="My own pattern", "the pattern menu says My own pattern");
 await p.click("#ownBtn");
 // key and mood
 await p.selectOption("#keySel","7"); await p.waitForTimeout(80);
 ok((await p.locator(".pad").allTextContents()).map(x=>x.replace(/^\d/,"").replace(/\d$/,"").trim()).join(" ")==="G Am Bm C D Em", "key of G: G Am Bm C D Em");
 ok((await p.locator(".slot").allTextContents()).join(" ")==="G D Em C", "the pattern moves to the new key too: G D Em C");
 await p.selectOption("#keySel","0"); await p.click("#minBtn"); await p.waitForTimeout(80);
 ok((await p.locator(".pad").allTextContents()).map(x=>x.replace(/^\d/,"").replace(/\d$/,"").trim()).join(" ")==="Cm E♭ Fm Gm A♭ B♭", "C minor uses flats: Cm E♭ Fm Gm A♭ B♭");
 await p.click("#majBtn");
 // every instrument plays
 for(const id of ["epwarm","epreed","ep80","organ","church","grand"]){
   await p.selectOption("#soundSel", id); await p.keyboard.down("f"); await p.waitForTimeout(120);
   const n=await p.evaluate("LIVE.size"); await p.keyboard.up("f"); await p.waitForTimeout(80);
   ok(n===1, id+" plays a note");
 }
 await p.selectOption("#soundSel","upright"); await p.waitForFunction(()=>SETS.upright.ready, null, {timeout:30000});
 ok(await p.evaluate("SETS.grand.state==='idle' && Object.keys(SETS.grand.buf).length===0"), "picking the upright lets go of the grand's memory (one recorded piano at a time)");
 await p.selectOption("#soundSel","honky"); await p.keyboard.down("f"); await p.waitForTimeout(100);
 ok(await p.evaluate("LIVE.get('c'+(KB.lo+5)).nodes.length")===2, "honky-tonk plays the upright twice, a little out of tune");
 await p.keyboard.up("f");
 // era dial
 await p.locator("#era").fill("0"); await p.locator("#era").dispatchEvent("input"); await p.waitForTimeout(400);
 ok(await p.evaluate("S.era===1 && !!LIVE_CH.crunch && Math.abs(LIVE_CH.crunch.parameters.get('era').value-1)<0.05 && LIVE_CH.lp.frequency.value<9000"), "dial on 1987: the twelve-bit crunch and the 1987 filter are on");
 ok((await p.textContent("#eraOut"))==="1987 crunch", "the dial says 1987 crunch");
 await p.locator("#era").fill("100"); await p.locator("#era").dispatchEvent("input");
 // Spanish
 await p.evaluate("document.getElementById('langBtn').click()"); await p.waitForTimeout(100);
 ok((await p.locator(".pad").allTextContents()).map(x=>x.replace(/^\d/,"").replace(/\d$/,"").trim()).join(" ")==="Do Re m Mi m Fa Sol La m", "en español: Do, Re m, Mi m, Fa, Sol, La m");
 ok((await p.textContent("#mastH"))==="El piano" && (await p.evaluate("document.documentElement.lang"))==="es", "the page and its language tag switch to Spanish");
 await p.evaluate("document.getElementById('langBtn').click()");
 ok(errs.length===0, "no page errors "+errs.join(" | "));
 await b.close(); srv.close();})();
