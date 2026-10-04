const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9962);
(async()=>{
  const b=await pw.chromium.launch();
  for(const [name, vp, mob, theme, inst, snd] of [["phone",{width:390,height:844},true,"light","guitar","metal"],["phone-dark",{width:390,height:844},true,"dark","guitar","metal"],["ipad",{width:810,height:1080},true,"light","guitar","modern"],["desk-bass",{width:1280,height:900},false,"dark","bass","metal"]]){
    const c=await b.newContext({viewport:vp, isMobile:mob, hasTouch:mob, deviceScaleFactor:mob?2:1, colorScheme:theme});
    await c.addInitScript(([t,i,s])=>{ try{ localStorage.setItem("aog.interior.ws.v1.theme", t); localStorage.setItem("aog.theme.lightstart.v1","1"); localStorage.setItem("aog."+i+".v1", JSON.stringify({sound:s})); }catch(e){} }, [theme, inst, snd]);
    const p=await c.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9962/music-${inst}.html`); await p.waitForTimeout(1200);
    /* turn on the overdrive so a pedal shows its knobs */
    await p.evaluate(()=>{ const b=document.querySelector('#ampBox button[data-fs="od"]'); if(b && b.getAttribute("aria-pressed")!=="true") b.click(); });
    const el=await p.$("#ampBlk"); await el.screenshot({path:`amp-${name}.png`});
  }
  await b.close(); srv.close();
})();
