/* the pads count 1 to 6 in a major and a minor key, on all four tools, and the wheel's numbers match the pads */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9989);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const pg of ["music-piano","music-guitar","music-bass","music-band"]){
    const c=await b.newContext(pw.devices["iPad (gen 7)"]); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9989/${pg}.html`); await p.waitForTimeout(900);
    await p.selectOption("#keySel","9");                                    /* A minor, as on Jimmy's iPad */
    await p.evaluate(()=>{ if(!S.minor) document.getElementById("minBtn").click(); }); await p.waitForTimeout(100);
    const min=await p.evaluate(()=>({nums:[...document.querySelectorAll(".pad small")].map(e=>e.textContent).join(""), names:[...document.querySelectorAll(".pad")].map(e=>e.textContent.replace(/\s+/g," ").trim().split(" ")[1]).join(" "),
      wheel:[...document.querySelectorAll("#wheel .wd.fit")].map(g=>{ const pn=g.querySelector(".pn"); return pn ? g.querySelector("text").textContent+"="+pn.textContent : null; }).filter(Boolean).sort((a,b)=>a.split("=")[1]-b.split("=")[1]).join(" "),
      step:!!document.getElementById("stepLine")}));
    ok(min.nums==="123456" && !min.step, `${pg}: A minor pads count ${min.nums}: ${min.names}`);
    ok(min.wheel==="Am=1 C=2 Dm=3 Em=4 F=5 G=6", `${pg}: the wheel's numbers match: ${min.wheel}`);
    await p.evaluate(()=>document.getElementById("majBtn").click()); await p.waitForTimeout(100);
    const maj=await p.evaluate(()=>[...document.querySelectorAll(".pad small")].map(e=>e.textContent).join(""));
    ok(maj==="123456", `${pg}: a major key's pads count ${maj}`);
    const pats=await p.evaluate(()=>[...document.querySelectorAll("#progSel option")].map(o=>o.textContent).filter(x=>/Minor groove|Flamenco|Minor folk|Epic/.test(x)).join(" | "));
    ok(pats==="Minor groove | Flamenco | Minor folk | Epic", `${pg}: the minor patterns, by name: ${pats}`);
    ok(errs.length===0, `${pg}: no page errors ${errs.join(" | ")}`);
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS"); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
