/* the shared menu script, old vs new, on every page that loads it: menus built, a pick works, no errors, the page settles */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path"), http=require("http");
const ROOT=process.env.AOG_ROOT||require("path").resolve(__dirname,"../../aog-deploy"), S=__dirname;
const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith(".html") && fs.readFileSync(path.join(ROOT,f),"utf8").includes("aog-dropdowns.js"));
const T={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".json":"application/json",".jpg":"image/jpeg"};
function server(port, old){ return http.createServer((q,r)=>{ let u=decodeURIComponent(q.url.split("?")[0].split("#")[0]); if(u.endsWith("/")) u+="index.html";
  let f=(old && u==="/aog-dropdowns.js") ? path.join(S,"aog-dropdowns-before.js") : path.join(ROOT,u); if(!fs.existsSync(f)&&fs.existsSync(f+".html")) f+=".html";
  fs.readFile(f,(e,d)=>{ if(e){ r.writeHead(404); return r.end(); } r.writeHead(200,{"content-type":T[path.extname(f)]||"application/octet-stream"}); r.end(d); }); }).listen(port); }
async function run(b, port, page, vp){
  const c=await b.newContext({viewport:vp, isMobile:vp.width<500, hasTouch:vp.width<500}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await c.addInitScript(()=>{ try{ localStorage.setItem("aog.lang","en"); }catch(e){} });
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message.slice(0,90)));
  try{ await p.goto(`http://localhost:${port}/${page}`,{waitUntil:"load", timeout:20000}); }catch(e){ errs.push("load: "+e.message.slice(0,60)); }
  await p.waitForTimeout(1300);
  const r=await p.evaluate(async()=>{
    const menus=()=>[...document.querySelectorAll(".aogdd")];
    const shown=menus().filter(m=>!m.hidden && m.getBoundingClientRect().height>2).length;
    /* idle: count changes for 1.5 s (a loop would keep changing the page) */
    let n=0; const mo=new MutationObserver(l=>{ n+=l.length; }); mo.observe(document.body,{subtree:true,childList:true,attributes:true});
    await new Promise(r=>setTimeout(r,1500)); mo.disconnect();
    /* pick a different option in each menu the page shows */
    let picks=0, kept=0;
    for(const m of menus().filter(m=>!m.hidden && m.getBoundingClientRect().height>2).slice(0,3)){
      const s=m.querySelector("select"); if(!s || s.options.length<2) continue;
      const want=(s.selectedIndex+1)%s.options.length, txt=s.options[want].text; s.selectedIndex=want; s.dispatchEvent(new Event("change",{bubbles:true})); picks++;
      await new Promise(r=>setTimeout(r,350));
      if(location.hash && /^#/.test(location.hash)) { /* a "where to look" menu may change the view: fine */ }
      if([...document.querySelectorAll(".aogdd-sel")].some(x=>x.options[x.selectedIndex] && x.options[x.selectedIndex].text===txt)) kept++;
    }
    return {menus:menus().length, shown, idleChanges:n, picks, kept};
  }).catch(e=>({error:e.message.slice(0,80)}));
  await c.close(); return {...r, errs};
}
(async()=>{
  const b=await pw.chromium.launch(); const sOld=server(9971,true), sNew=server(9972,false);
  let bad=0;
  for(const vp of [{width:390,height:844},{width:1280,height:900}]){
    console.log(`== ${vp.width}px`);
    for(const page of pages){
      const A=await run(b,9971,page,vp), B=await run(b,9972,page,vp);
      const same = A.menus===B.menus && A.shown===B.shown && B.errs.length<=A.errs.length && B.kept>=A.kept && B.idleChanges<=Math.max(20, A.idleChanges*1.5+5);
      if(!same) bad++;
      console.log(`${same?"same ":"DIFF "} ${page.padEnd(26)} old: ${A.menus} menus/${A.shown} shown, ${A.idleChanges} idle changes, picks ${A.kept}/${A.picks}, ${A.errs.length} errors | new: ${B.menus}/${B.shown}, ${B.idleChanges} idle, picks ${B.kept}/${B.picks}, ${B.errs.length} errors ${B.errs.join("; ")}${A.error||B.error?" ERR "+(A.error||"")+" "+(B.error||""):""}`);
    }
  }
  console.log(bad?bad+" pages differ":"every page behaves the same or better");
  await b.close(); sOld.close(); sNew.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
