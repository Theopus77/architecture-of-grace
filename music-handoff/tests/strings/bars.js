const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9979);
(async()=>{
  const b=await pw.chromium.launch();
  const rows=[];
  for(const [dev,opts] of [["iPhone 13",pw.devices["iPhone 13"]],["iPad",pw.devices["iPad (gen 7)"]],["Desktop",{viewport:{width:1280,height:800}}]]){
    for(const pg of ["music-drums","music-piano","music-guitar","music-bass","music-decks"]){
      const c=await b.newContext(opts); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
      await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
      await p.goto(`http://localhost:9979/${pg}.html`); await p.waitForTimeout(1200);
      const info=await p.evaluate(()=>{ const bar=document.querySelector(".bench-bar"); const r=bar.getBoundingClientRect();
        const sels=[...bar.querySelectorAll("select.aogdd-sel")].map(s=>({label:s.getAttribute("aria-label"), value:s.options[s.selectedIndex]&&s.options[s.selectedIndex].text, n:s.options.length, w:Math.round(s.getBoundingClientRect().width)}));
        return {h:Math.round(r.height), sels:sels, over:document.documentElement.scrollWidth-innerWidth, y:r.top+scrollY}; });
      rows.push(`${dev.padEnd(9)} ${pg.padEnd(13)} bar ${info.h}px  ${info.sels.map(s=>`[${s.label}: ${s.value} (${s.n}) ${s.w}px]`).join(" ")}  over ${info.over}${errs.length?" ERR "+errs.join("|"):""}`);
      await p.screenshot({path:`strings/bar-${dev.replace(/\W/g,"")}-${pg}.png`, clip:{x:0,y:Math.max(0,info.y-4),width:opts.viewport.width,height:info.h+8}});
      await c.close();
    }
  }
  console.log(rows.join("\n"));
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
