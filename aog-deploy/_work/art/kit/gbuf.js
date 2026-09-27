/* node gbuf.js <scene> <outdir> [W H] — writes <scene>-n.png and <scene>-d.png (see gbuf.glsl). */
const path=require('path'),fs=require('fs');
const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const [scene,out,W0,H0]=process.argv.slice(2); const W=+(W0||1600),H=+(H0||560);
const rd=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const base=rd('scenes/'+scene+'.glsl').replace(/#include\s+"([a-z_.]+)"/g,(_,f)=>rd(f));
(async()=>{
  const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage(); p.setDefaultTimeout(0); p.on('pageerror',e=>console.log('ERR',e.message));
  await p.setContent('<canvas id=c></canvas>');
  const modes=/toneAlb/.test(base)?[0,1,2,3]:[0,1];
  for(const mode of modes){
    const src='#version 300 es\nprecision highp float; out vec4 o;\n#define GMODE '+mode+'\n'+base+'\n'+rd('gbuf.glsl');
    const url=await p.evaluate(([src,W,H])=>{
      const cv=document.getElementById('c'); cv.width=W; cv.height=H;
      const gl=cv.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false});
      const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x;};
      const P=gl.createProgram(); gl.attachShader(P,sh(gl.VERTEX_SHADER,'#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0,1);}'));
      gl.attachShader(P,sh(gl.FRAGMENT_SHADER,src)); gl.bindAttribLocation(P,0,'p'); gl.linkProgram(P); gl.useProgram(P);
      const vb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
      gl.viewport(0,0,W,H); gl.uniform2f(gl.getUniformLocation(P,'R'),W,H);
      gl.enable(gl.SCISSOR_TEST); for(let y=0;y<H;y+=16){ gl.scissor(0,y,W,16); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); gl.finish(); }
      return cv.toDataURL('image/png');
    },[src,W,H]);
    fs.writeFileSync(path.join(out,scene+['-n','-d','-photo','-t'][mode]+'.png'),Buffer.from(url.split(',')[1],'base64'));
    await p.evaluate(()=>{const c=document.getElementById('c');const n=document.createElement('canvas');n.id='c';c.replaceWith(n);});
  }
  await b.close(); console.log(scene,'done');
})();
