const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9980);
(async()=>{
  const b=await pw.chromium.launch();
  const c=await b.newContext(pw.devices["iPhone 13"]); const p=await c.newPage();
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9980/music-drums.html"); await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    const sel=document.querySelector("#navTools").previousElementSibling.querySelector("select");
    const cs=getComputedStyle(sel), box=sel.closest(".aogdd"), bcs=getComputedStyle(box), sis=sel.closest(".sisters"), scs=getComputedStyle(sis);
    /* every rule that sets a width on the select */
    const hits=[]; for(const sh of document.styleSheets){ let rules; try{ rules=sh.cssRules; }catch(e){ continue; } const walk=rs=>{ for(const ru of rs){ if(ru.cssRules) walk(ru.cssRules); else if(ru.selectorText && sel.matches(ru.selectorText) && /width|flex/.test(ru.style.cssText)) hits.push((sh.href||"inline").split("/").pop()+" :: "+ru.selectorText+" { "+ru.style.cssText.slice(0,160)+" }"); } }; walk(rules); }
    return {w:sel.getBoundingClientRect().width, width:cs.width, minW:cs.minWidth, maxW:cs.maxWidth, flex:cs.flex, boxW:box.getBoundingClientRect().width, boxFlex:bcs.flex, boxMax:bcs.maxWidth, sisW:sis.getBoundingClientRect().width, sisMax:scs.maxWidth, hits};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close(); srv.close();
})();
