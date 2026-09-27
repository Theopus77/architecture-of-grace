// Render each card emoji large on transparent, for the pencil pass (make_sketch.py).
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
const list=JSON.parse(fs.readFileSync(path.join(__dirname,'emoji.json'),'utf8')); const out=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:300,height:300}});
await p.setContent('<html><body style="margin:0;background:transparent"><div id=e style="width:300px;height:300px;display:flex;align-items:center;justify-content:center;font:220px/1 \'Noto Color Emoji\'"></div></body></html>');
for(const e of list){const cp=[...e].map(c=>c.codePointAt(0).toString(16)).filter(h=>h!=='fe0f').join('-');
 await p.evaluate(t=>document.getElementById('e').textContent=t,e);
 await p.screenshot({path:path.join(out,cp+'.png'),omitBackground:true});}
await b.close();console.log('rendered',list.length);})();
