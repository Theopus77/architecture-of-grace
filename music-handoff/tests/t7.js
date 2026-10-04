const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const http=require("http"),fs=require("fs"),path=require("path");
const root="/home/user/architecture-of-grace/aog-deploy";const port=9770;
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{"content-type":{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(f)]||"application/octet-stream"});r.end(d);});}).listen(port);
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m); if(!c) process.exitCode=1;};
(async()=>{const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
 const c=await b.newContext({viewport:{width:1280,height:900}}); await c.addInitScript(()=>{ if(!sessionStorage.getItem("s")){ sessionStorage.setItem("s","1"); localStorage.setItem("aog.drums.bench","full"); } });
 const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
 await p.goto(`http://localhost:${port}/music-drums.html#home`); await p.waitForTimeout(1500);
 await p.click('.sp-pad[data-pad="snare"]'); await p.waitForTimeout(2500);
 ok(!(await p.isVisible('#kitBackBtn')), "no 'Put the kit sounds back' while the kit is all kit sounds");
 const load=async(pad,name)=>{ await p.evaluate(async ([pad,name])=>{ S.sel=pad; const n=8000, L=new Float32Array(n); for(let i=0;i<n;i++) L[i]=Math.sin(i/6)*Math.exp(-i/1500)*0.8;
     await takeSample(new File([wavBlob(L, L, 26040)], name, {type:"audio/wav"})); }, [pad,name]); await p.waitForTimeout(500); };
 await load("snare","myclap.wav");
 ok(await p.evaluate("!!USER[S.bank].snare"), "a sound of my own is on pad 2 of kit "+await p.evaluate("S.bank"));
 ok(await p.isVisible('#kitBackBtn'), "Full bench shows PUT THE KIT SOUNDS BACK next to the Sounds menu");
 ok((await p.textContent('.sp-pad[data-pad="snare"]')).toUpperCase().includes("MYCLAP"), "the pad shows my sound's name");
 await p.click('#kitBackBtn'); await p.waitForTimeout(300);
 ok(await p.evaluate("!USER[S.bank].snare && !Object.keys(USER[S.bank]).length"), "pressing it takes my sound off this kit");
 ok(!(await p.isVisible('#kitBackBtn')) && await p.isVisible('#kitUndoBtn'), "the key steps aside and PUT MY SOUNDS BACK appears");
 ok(!(await p.textContent('.sp-pad[data-pad="snare"]')).toUpperCase().includes("MYCLAP"), "the pad shows the kit sound's name again");
 // the engine got the kit sound back: hit message goes to rom
 await p.click('#kitUndoBtn'); await p.waitForTimeout(300);
 ok(await p.evaluate("!!USER[S.bank].snare && USER_NAME[S.bank].snare==='MYCLAP'"), "PUT MY SOUNDS BACK restores my sound and its name");
 ok(await p.isVisible('#kitBackBtn') && !(await p.isVisible('#kitUndoBtn')), "and the reset key is back, the undo gone");
 // undo is cancelled by a new sound
 await p.click('#kitBackBtn'); await p.waitForTimeout(200);
 await load("tom","knock.wav");
 ok(!(await p.isVisible('#kitUndoBtn')) && await p.evaluate("S.kitUndo===null"), "loading another sound ends the undo (nothing old can come back over it)");
 // other kits untouched
 await p.evaluate("useBank('C'); paint()"); await p.waitForTimeout(200);
 ok(!(await p.isVisible('#kitBackBtn')), "kit C has none of my sounds, so no reset key there");
 await p.evaluate("useBank('A'); paint()"); await p.waitForTimeout(200);
 // simple bench
 await p.click('[data-bench="simple"]'); await p.waitForTimeout(300);
 const simpleBtn=p.locator('.simple-row [data-resetkit]');
 ok(await simpleBtn.isVisible(), "the Simple bench still has it too");
 await simpleBtn.click(); await p.waitForTimeout(300);
 ok(await p.locator('.simple-row [data-kitundo]').isVisible(), "the Simple bench gets the undo as well");
 const ids=await p.evaluate(()=>{const a=[...document.querySelectorAll('[id]')].map(e=>e.id); return a.filter((x,i)=>a.indexOf(x)!==i);});
 ok(ids.length===0, "no duplicate ids "+ids.join(","));
 await p.click('[data-bench="full"]'); await p.waitForTimeout(300);
 await p.screenshot({path:"kitback.png", clip: await (async()=>{const r=await p.locator('.sp-banks').first().boundingBox(); return {x:r.x-6,y:r.y-6,width:r.width+12,height:r.height+12};})()});
 ok(errs.length===0, "no page errors "+errs.join("|"));
 await b.close(); srv.close();})();
