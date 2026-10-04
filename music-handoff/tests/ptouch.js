const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9907);
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m); if(!c) process.exitCode=1;};
(async()=>{const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
 for(const dev of ["iPhone 13","iPad (gen 7)"]){
 const c=await b.newContext(pw.devices[dev]); const p=await c.newPage();
 const errs=[]; p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://localhost:9907/music-piano.html"); await p.waitForTimeout(1200);
 await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(c,ch,id,m,v){ if(c===ac) window.__v.push([m,+v.toFixed(2)]); return mv.apply(this,arguments); }; });
 const cdp=await c.newCDPSession(p);
 const live=()=>p.evaluate("[...LIVE.entries()].map(([k,v])=>k+(v.down?'':'~')).sort().join(' ')");
 const pt=async(sel,fy)=>{ const l=p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); const r=await l.boundingBox(); return {x:r.x+r.width/2, y:r.y+r.height*(fy==null?0.7:fy)}; };
 const T=(type,pts)=>cdp.send("Input.dispatchTouchEvent",{type, touchPoints:pts.map((q,i)=>({x:q.x,y:q.y,id:q.id||i+1}))});
 console.log("== "+dev);
 // pad on finger-down
 const pd=await pt('.pad[data-i="4"]'); await T("touchStart",[pd]); await p.waitForTimeout(60);
 ok((await live()).split(" ").length===4 && (await live()).startsWith("p"), "a pad (G) sounds as the finger lands: "+await live());
 await T("touchEnd",[]); await p.waitForTimeout(120); ok((await live())==="", "lifting the finger stops it");
 // two fingers on two keys
 const lo=await p.evaluate("KB.lo");
 const a=await pt('#kbd .wk[data-m="'+lo+'"]'), e=await pt('#kbd .wk[data-m="'+(lo+4)+'"]');
 await T("touchStart",[{...a,id:1},{...e,id:2}]); await p.waitForTimeout(60);
 ok((await live())==="k"+lo+" k"+(lo+4), "two fingers play two keys at once: "+await live());
 await T("touchEnd",[]); await p.waitForTimeout(60); ok((await live())==="", "both stop when the fingers lift");
 // glide
 const g1=await pt('#kbd .wk[data-m="'+(lo+2)+'"]'), g2=await pt('#kbd .wk[data-m="'+(lo+7)+'"]');
 await T("touchStart",[g1]); await p.waitForTimeout(40);
 for(let i=1;i<=8;i++){ await T("touchMove",[{x:g1.x+(g2.x-g1.x)*i/8, y:g1.y}]); await p.waitForTimeout(25); }
 ok((await live())==="k"+(lo+7), "a finger sliding from D to G ends on G with nothing left stuck: "+await live());
 const glided=await p.evaluate("__v.map(x=>x[0])"); ok(glided.length>=3, "the slide played the keys on the way: "+glided.join(","));
 await T("touchEnd",[]); await p.waitForTimeout(60);
 // velocity by position
 await p.evaluate("__v=[]");
 const top=await pt('#kbd .wk[data-m="'+lo+'"]',0.66), bot=await pt('#kbd .wk[data-m="'+lo+'"]',0.97);
 await T("touchStart",[top]); await T("touchEnd",[]); await p.waitForTimeout(60);
 await T("touchStart",[bot]); await T("touchEnd",[]); await p.waitForTimeout(60);
 const vs=await p.evaluate("__v.map(x=>x[1])"); ok(vs.length===2 && vs[1]>vs[0]+0.15, "a press near the bottom of a key is louder: "+vs.join(" → "));
 // layout
 const lay=await p.evaluate(()=>({over:document.documentElement.scrollWidth-innerWidth, minKey:Math.min(...[...document.querySelectorAll('#kbd .wk')].map(e=>e.getBoundingClientRect().width)), keys:KB.whites, kc:getComputedStyle(document.querySelector('#kbd .kc')||document.body).display}));
 ok(lay.over<=2, "no sideways scrolling ("+lay.over+"px)");
 ok(lay.minKey>=38, "white keys are "+Math.round(lay.minKey)+" px wide ("+lay.keys+" white keys)");
 ok(lay.kc==="none", "no computer-key letters on a touch screen");
 ok(errs.length===0, "no page errors "+errs.join("|"));
 await c.close();
 }
 await b.close(); srv.close();})();
