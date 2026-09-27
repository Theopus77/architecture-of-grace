/* AOG banner render kit driver.
   node render.js <scene> [--w 1600] [--h 560] [--ss 2] [--out DIR] [--preview] [--final]
   <scene> is a file in scenes/ without .glsl (e.g. bib-u1). Grade options come from the
   scene's first-line JSON comment:  // @opts {"expo":1.1,"warm":.6}
   --preview : 800x280, ss 1, writes <out>/<scene>-preview.png
   --final   : 1600x560 at ss 2 (supersampled 3200x1120), writes aog-deploy/img/banners/
               <scene>-1600.webp, -900.webp, -900.jpg (and a -1600.png proof in --out)
               stepping WebP quality down until the 1600 file is <= 250 KB. */
const path=require('path'),fs=require('fs');
const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const A=process.argv.slice(2); const scene=A[0]; const arg=(k,d)=>{const i=A.indexOf('--'+k);return i<0?d:A[i+1];};
const final=A.includes('--final'), preview=A.includes('--preview')||!final;
const W=+arg('w',final?1600:800), H=+arg('h',Math.round(W*420/1200)), SS=+arg('ss',final?2:1);
const out=arg('out',path.join(__dirname,'out')); fs.mkdirSync(out,{recursive:true});
const IMG=path.join(__dirname,'../../../img/banners'); fs.mkdirSync(IMG,{recursive:true});
const rd=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const sceneSrc=rd('scenes/'+scene+'.glsl');
const m=sceneSrc.match(/@opts\s*(\{.*\})/); const opts=m?Function("return "+m[1])():{};
const src=sceneSrc.replace(/#include\s+"([a-z_.]+)"/g,(_,f)=>rd(f))+'\n'+rd('main.glsl');
(async()=>{
  const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:800,height:400}});
  p.on('console',x=>console.log('console:',x.text())); p.on('pageerror',e=>console.log('ERR',e.message));
  p.setDefaultTimeout(0);
  await p.goto('file://'+path.join(__dirname,'render.html'));
  console.log(scene, await p.evaluate(([s,W,H,SS,o])=>render(s,W,H,SS,o),[src,W,H,SS,opts]));
  const save=async(file,width,type,q)=>{ const d=await p.evaluate(([w,t,q])=>encode(w,t,q),[width,type,q]);
    const buf=Buffer.from(d.split(',')[1],'base64'); fs.writeFileSync(file,buf); console.log(path.relative(process.cwd(),file),buf.length); return buf.length; };
  if(!final){ await save(path.join(out,scene+'-preview.png'),W,'image/png'); }
  else{
    await save(path.join(out,scene+'-1600.png'),1600,'image/png');
    for(let q=.86;q>.5;q-=.04){ if(await save(path.join(IMG,scene+'-1600.webp'),1600,'image/webp',q)<=250*1024) break; }
    await save(path.join(IMG,scene+'-900.webp'),900,'image/webp',.84);
    await save(path.join(IMG,scene+'-900.jpg'),900,'image/jpeg',.84);
  }
  await b.close();
})();
