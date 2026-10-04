const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const http=require("http"),fs=require("fs"),path=require("path");
const root=process.env.AOG_ROOT||require("path").resolve(__dirname,"../../aog-deploy");const port=9970;
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{"content-type":{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(f)]||"application/octet-stream"});r.end(d);});}).listen(port);
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m); if(!c) process.exitCode=1;};
(async()=>{
 const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
 const c=await b.newContext({viewport:{width:1280,height:900}});
 const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
 await p.goto(`http://localhost:${port}/music-drums.html#home`); await p.waitForTimeout(1500);
 await p.evaluate(()=>{window.__msgs=[];});
 // start engine with a tap, wait for kits
 await p.click('.sp-pad[data-pad="kick"]'); await p.waitForTimeout(4000);
 ok(await p.evaluate("!!engine && kitReady"), "sampler engine running");
 /* AOG-DRUM-KITS-V3: fifteen kits take longer to build in the background on a busy machine; wait until they are all built (up to 30 s more).
    AOG-DRUM-REAL-V1: the recorded kits P to T load only when picked, so the built ones are checked here (realkit.js checks the others) */
 await p.waitForFunction(()=>BANKS.filter(b=>!realKit(b)).every(b=>{const r=romFor(b), h=hiFor(b); return VOICES.every(v=>r[v.id]&&h[v.id]);}), null, {timeout:30000}).catch(()=>{});
 const kits=await p.evaluate(()=>BANKS.filter(b=>!realKit(b)).map(b=>{const r=romFor(b), h=hiFor(b); return b+":"+VOICES.filter(v=>r[v.id]&&r[v.id].length&&h[v.id]&&h[v.id].length).length;}).join(" "));
 ok(!/:[0-7]\b/.test(kits), "all 15 built kits rendered, 1987 + 2026 copies: "+kits);
 const loud=await p.evaluate(()=>BANKS.filter(b=>b!=="B"&&!realKit(b)).map(b=>b+":"+VOICES.map(v=>{const d=romFor(b)[v.id];let m=0;for(const x of d)m=Math.max(m,Math.abs(x));return m.toFixed(2)}).join(",")).join(" | "));
 console.log("   peak per pad:", loud);
 ok(!/0\.0[0-4]/.test(loud), "every new sound makes a sound (peak > 0.05)");
 // spy on engine messages
 await p.evaluate(()=>{const pm=engine.port.postMessage.bind(engine.port); engine.port.postMessage=(m,t)=>{window.__msgs.push(m); return pm(m,t);};});
 // starter via the dropdown select
 const sel=p.locator('.starter-row .aogdd-sel'); ok(await sel.count()===1, "Start-from-a-beat is a drop-down");
 const opts=await sel.locator("option").allTextContents(); ok(opts.length===1+13+10 && opts[0].startsWith("Choose"), "menu: placeholder + 13 styles (5 for the recorded kits) + 10 classroom patterns ("+opts.length+")");
 await sel.selectOption({label:"Trap"}); await p.waitForTimeout(700);
 ok(await p.evaluate("S.bank==='F' && S.bpm===140 && S.grid.clap[8]===2"), "Trap loads kit F, 140 BPM, clap on beat 3");
 ok(await p.isHidden('#undoBeat'), "no undo when the part was empty");
 await p.locator('.starter-row .aogdd-sel').selectOption({label:"Lo-fi study beat"}); await p.waitForTimeout(700);
 ok(await p.evaluate("S.bank==='G' && S.bpm===78"), "Lo-fi loads kit G at 78");
 ok(await p.isVisible('#undoBeat'), "'Put my beat back' appears");
 await p.click('#undoBeat'); await p.waitForTimeout(500);
 ok(await p.evaluate("S.bank==='F' && S.bpm===140 && S.grid.clap[8]===2"), "undo brings back the Trap beat, kit and tempo");
 // kit menu
 const kitSel=p.locator('.kit-src').locator('xpath=..').locator('.aogdd-sel');
 ok((await kitSel.locator("option").count())===20, "Sounds menu lists 20 kits");   /* A to O built here, P to T recorded */
 await kitSel.selectOption({label:"Kit H · Latin percussion"}); await p.waitForTimeout(600);
 ok(await p.evaluate("S.bank==='H'"), "picking a kit switches to it");
 ok((await p.textContent('.sp-pad[data-pad="ch"]')).includes("GUIRO"), "pads show the kit's names (GUIRO)");
 // era dial
 await p.evaluate("__msgs=[]");
 await p.locator('#era').fill("100"); await p.locator('#era').dispatchEvent("input");
 ok(await p.evaluate("S.era===0") && (await p.textContent('#eraOut'))==="Clean 2026", "dial at the right = Clean 2026");
 await p.keyboard.press("a"); await p.waitForTimeout(100);
 const m=await p.evaluate("__msgs.filter(x=>x.type==='hit').pop()");
 ok(m && m.era===0 && m.cutoff>1500, "a hit carries era 0 and an open filter (cutoff "+(m&&Math.round(m.cutoff))+")");
 await p.locator('#era').fill("0"); await p.locator('#era').dispatchEvent("input");
 // roll: hold a key for ~0.5s at 1/16, 120 bpm → ~4 extra hits
 await p.evaluate("S.bpm=120");
 await p.click('[data-simple-press="rollBtn"]'); await p.click('[data-simple-press="rollBtn"]'); await p.waitForTimeout(200);
 ok(await p.evaluate("S.roll==='1/16'"), "Roll steps off → 1/8 → 1/16");
 ok((await p.textContent('.simple-line')).includes("hold a pad"), "a line explains how to roll");
 await p.evaluate("__msgs=[]");
 await p.keyboard.down("d"); await p.waitForTimeout(520); await p.keyboard.up("d"); await p.waitForTimeout(250);
 const n=await p.evaluate("__msgs.filter(x=>x.type==='hit'&&x.id==='ch').length");
 ok(n>=4 && n<=7, "holding D for 0.5 s at 1/16 (120 BPM) gives a roll of "+n+" hits");
 const gaps=await p.evaluate("(()=>{const w=__msgs.filter(x=>x.type==='hit').map(x=>x.when);return w.slice(2).map((t,i)=>+(t-w[i+1]).toFixed(3))})()");
 ok(gaps.every(g=>Math.abs(g-0.125)<0.002), "repeats are evenly spaced at 1/16: "+JSON.stringify(gaps));
 await p.evaluate("__msgs=[]"); await p.waitForTimeout(400);
 ok(await p.evaluate("__msgs.length")===0, "letting go stops the roll");
 // roll with mouse hold
 await p.evaluate("__msgs=[]");
 const bx=await p.locator('.sp-pad[data-pad="tom"]').boundingBox();
 await p.mouse.move(bx.x+20,bx.y+20); await p.mouse.down(); await p.waitForTimeout(520); await p.mouse.up(); await p.waitForTimeout(300);
 const nm=await p.evaluate("__msgs.filter(x=>x.type==='hit'&&x.id==='tom').length");
 ok(nm>=4 && nm<=7, "holding a pad with the mouse rolls too: "+nm);
 // roll + REC while playing records into the grid
 await p.evaluate("S.grid.rim=Array(16).fill(0); S.rec=true;");
 await p.keyboard.press("Space"); await p.waitForTimeout(600);
 await p.keyboard.down("l"); await p.waitForTimeout(600); await p.keyboard.up("l"); await p.waitForTimeout(150);
 await p.keyboard.press("Space");
 const rec=await p.evaluate("S.grid.rim.filter(Boolean).length");
 ok(rec>=3, "a held roll with REC on writes "+rec+" steps into the grid");
 ok(errs.length===0, "no page errors "+errs.join(" | "));
 // persistence
 await p.reload(); await p.waitForTimeout(1200);
 ok(await p.evaluate("S.roll==='1/16' && S.era===1 && S.bank==='H'"), "roll, dial and kit survive a reload");
 await b.close(); srv.close();
})();
