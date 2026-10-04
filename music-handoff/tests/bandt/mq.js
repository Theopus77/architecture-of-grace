const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
(async()=>{ const b=await pw.chromium.launch(); const c=await b.newContext(pw.devices["iPhone 13"]); const p=await c.newPage();
  await p.setContent("<p>x</p>"); console.log("iPhone 13 emulation:", await p.evaluate(()=>({fine:matchMedia("(pointer:fine)").matches, hover:matchMedia("(hover:hover)").matches, coarse:matchMedia("(pointer:coarse)").matches})));
  const cdp=await c.newCDPSession(p); await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"pointer",value:"coarse"},{name:"hover",value:"none"}]}).catch(e=>console.log("no", e.message));
  console.log("after asking for a touch screen:", await p.evaluate(()=>({fine:matchMedia("(pointer:fine)").matches, hover:matchMedia("(hover:hover)").matches})));
  await b.close(); })();
