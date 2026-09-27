/* node render.js [size] [outdir] — renders render.html headless and writes webp/jpg/png */
const path=require('path'),fs=require('fs');
const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
  const S=+(process.argv[2]||3200), out=process.argv[3]||path.join(__dirname,'out');
  fs.mkdirSync(out,{recursive:true});
  const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:800,height:800}});
  p.on('console',m=>console.log('console:',m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+path.join(__dirname,'render.html')+'?s='+S);
  const t=Date.now(); console.log(await p.evaluate(()=>render()),(Date.now()-t)/1000+'s');
  const save=async(n,size,type,q)=>{ const d=await p.evaluate(([s,t,q])=>encode(s,t,q),[size,type,q]); const buf=Buffer.from(d.split(',')[1],'base64'); fs.writeFileSync(path.join(out,n),buf); console.log(n,buf.length); };
  await save('preview.png',Math.min(1600,S),'image/png');
  for(const a of process.argv.slice(4)){ const [n,s,t,q]=a.split(':'); await save(n,+s,t,+q); }
  await b.close();
})();
