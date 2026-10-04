const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const http=require("http"),fs=require("fs"),path=require("path");
const root=process.env.AOG_ROOT||require("path").resolve(__dirname,"../../aog-deploy");const port=9270;
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{"content-type":{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(f)]||"application/octet-stream"});r.end(d);});}).listen(port);
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m); if(!c) process.exitCode=1;};
(async()=>{const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
 const c=await b.newContext({viewport:{width:1280,height:900}});
 // an old learner: ladder 2, lessons 1-17 all done incl roll32
 await c.addInitScript(()=>{ if(sessionStorage.getItem("seeded")) return; sessionStorage.setItem("seeded","1");
   const done={}; ["pad","play","stop","bpm80","bpm120","tap","len16","kick4","playgrid","roll32","trapbase","hatroll","playtrap"].forEach(k=>done[k]=true);
   localStorage.setItem("aog.drums.lessons.v1", JSON.stringify({done, pick:11, ladder:2})); });
 const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
 await p.goto(`http://localhost:${port}/music-drums.html#home`); await p.waitForTimeout(1500);
 const names=await p.evaluate(()=>LESSONS.map((m,i)=>(i+1)+" "+lessonName(m)));
 ok(names.length===38, "38 lessons"); console.log("   "+[1,2,7,10,15,20,21,22,38].map(i=>names[i-1]).join("\n   "));
 ok(await p.evaluate("LESSONS.every(m=>m.steps.every(id=>LSTEP[id]&&LSTEP[id].en&&LSTEP[id].es))"), "every step has English and Spanish text");
 ok(await p.evaluate("LS.pick===null && LS.ladder===3"), "old lesson pick resets on the new ladder");
 ok(await p.evaluate("lessonNow()")===1, "an old learner who finished lesson 1 now lands on new Lesson 2");
 ok(await p.evaluate("LESSONS[14].steps.every(id=>LS.done[id]) || (tickLessons(), LESSONS[14].steps.every(id=>LS.done[id]))"), "old trap work (TC 1/32) still counts for the updated trap lesson");
 // Lesson 2 flow
 await p.click('.sp-pad[data-pad="kick"]'); await p.waitForTimeout(3000);
 await p.locator('.starter-row .aogdd-sel').selectOption({label:"Boom bap (90s hip-hop)"}); await p.waitForTimeout(500);
 await p.keyboard.press("Space"); await p.waitForTimeout(300); await p.keyboard.press("Space");
 await p.click('.cell[data-v="rim"][data-step="3"]'); await p.click('.cell[data-v="rim"][data-step="11"]'); await p.waitForTimeout(200);
 await p.keyboard.press("Space"); await p.waitForTimeout(300); await p.keyboard.press("Space");
 ok(await p.evaluate("['starter','playstarter','remix','playremix'].every(k=>LS.done[k])"), "Lesson 2 ticks: pick, play, change two boxes, play");
 // Lesson 7 kits
 await p.keyboard.press("Space"); await p.waitForTimeout(200);
 for(const k of ["Kit F · 808 trap","Kit H · Latin percussion","Kit C · electro"]){ await p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel').selectOption({label:k}); await p.waitForTimeout(400); }
 await p.keyboard.press("Space"); await p.waitForTimeout(200);
 await p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel').selectOption({label:"Kit F · 808 trap"}); await p.waitForTimeout(300);
 await p.keyboard.press("a");
 await p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel').selectOption({label:"Kit H · Latin percussion"}); await p.waitForTimeout(300);
 await p.keyboard.press("d"); await p.keyboard.press("j"); await p.keyboard.press("k");
 await p.keyboard.press("Space"); await p.waitForTimeout(300); await p.keyboard.press("Space");
 ok(await p.evaluate("['kit3','kit808','kitlatin','kitfave'].every(k=>LS.done[k])"), "Lesson 7 ticks: three kits, the 808, the Latin pads, play: "+await p.evaluate("['kit3','kit808','kitlatin','kitfave'].map(k=>k+':'+!!LS.done[k]).join(' ')"));
 // Lesson 10 live
 await p.keyboard.down("a"); await p.keyboard.down("j"); await p.keyboard.up("a"); await p.keyboard.up("j");
 await p.evaluate("S.roll='1/16'; S.rec=true; S.bpm=120"); await p.keyboard.press("Space"); await p.waitForTimeout(500);
 await p.keyboard.down("d"); await p.waitForTimeout(500); await p.keyboard.up("d"); await p.waitForTimeout(200); await p.keyboard.press("Space");
 ok(await p.evaluate("['twohands','recpad','rollhold','rollrec','traproll'].every(k=>LS.done[k])"), "Lesson 10 ticks (and the trap roll): "+await p.evaluate("['twohands','recpad','rollhold','rollrec','traproll'].map(k=>k+':'+!!LS.done[k]).join(' ')"));
 // Lesson 20 era
 await p.evaluate("S.rec=false; S.roll='off'");
 await p.keyboard.press("Space"); await p.waitForTimeout(200); await p.keyboard.press("Space");
 await p.locator('#era').fill("100"); await p.locator('#era').dispatchEvent("input");
 await p.keyboard.press("Space"); await p.waitForTimeout(200); await p.keyboard.press("Space");
 await p.locator('#era').fill("50"); await p.locator('#era').dispatchEvent("input");
 await p.keyboard.press("Space"); await p.waitForTimeout(200); await p.keyboard.press("Space");
 await p.locator('#era').fill("0"); await p.locator('#era').dispatchEvent("input");
 await p.evaluate("S.chan.snare.tune=-4"); await p.keyboard.press("s");
 ok(await p.evaluate("['era87play','era26play','eracrunch','eramid'].every(k=>LS.done[k])"), "Lesson 20 ticks: "+await p.evaluate("['era87play','era26play','eracrunch','eramid'].map(k=>k+':'+!!LS.done[k]).join(' ')"));
 // worksheet link numbering
 await p.evaluate("LS.pick=19; paintLessonBox()");
 ok((await p.getAttribute('#lSheet','href')).endsWith("#l20"), "Lesson 20 links to worksheet 20");
 await p.evaluate("LS.pick=25; paintLessonBox()");
 ok((await p.textContent('#lessonBody')).includes("Song 5 of 17"), "Lesson 26 is Song 5 of 17");
 ok(errs.length===0, "no page errors "+errs.join("|"));
 await b.close(); srv.close();})();
