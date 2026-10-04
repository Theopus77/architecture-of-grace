/* the amp in Node: the core and the model mapping, without a browser. Helpers shared by the measurements. */
const path=(process.env.AOG_ROOT||require("path").resolve(__dirname,"../../../aog-deploy"))+"/";
const core=require(path+"aog-amp-worklet.js"), AMP=require(path+"aog-amp.js"), fs=require("fs");
/* the guitar's own string, taken from the page (renderNote and what it needs) */
const page=fs.readFileSync(path+"_work/music/strings_page.html","utf8");
function grab(name){ const i=page.indexOf("function "+name+"("); if(i<0) throw new Error("no "+name); let d=0, j=page.indexOf("{",i); for(let k=j;k<page.length;k++){ if(page[k]==="{") d++; else if(page[k]==="}"){ d--; if(d===0) return page.slice(i,k+1); } } }
const src=["seeded","lossDelay","apDelay","stringLoop","runLoop","rbj","biq","renderNote"].map(grab).join("\n")+"\nfunction mtof(m){ return 440*Math.pow(2,(m-69)/12); }";
const vm=require("vm"), box={Math, Float32Array, Float64Array}; vm.createContext(box); vm.runInContext(src, box);
function soundParams(id){
  const m=page.match(new RegExp("\\n\\s*"+id+":\\s*\\{")); if(!m) throw new Error("no sound "+id);
  const i=page.indexOf("s:{", m.index); let d=0, j=i+2;
  for(let k=j;k<page.length;k++){ if(page[k]==="{") d++; else if(page[k]==="}"){ d--; if(d===0) return vm.runInContext("("+page.slice(j,k+1)+")", box); } }
}
/* a chord at rate sr: notes (midi) strummed 14 ms apart, each note rendered by the page's string, resampled linearly */
function chord(id, notes, sr, dur, vel){
  const P=soundParams(id), out=new Float64Array(Math.ceil(sr*dur));
  notes.forEach((m,k)=>{ const d=vm.runInContext(`renderNote(${m}, ${JSON.stringify(P)}, ${(m*7919)^0x51a7})`, box), r=P.sr/sr, t0=Math.floor((0.02+k*0.014)*sr), v=Math.pow(0.3+0.7*(vel||0.74)*(1-0.03*k),1.5);
    for(let i=0;i+t0<out.length;i++){ const x=i*r, j=Math.floor(x); if(j+1>=d.length) break; out[i+t0]+=(d[j]+(d[j+1]-d[j])*(x-j))*v; } });
  return out;
}
function runCore(P, x, sr){ const c=new core.AmpCore(sr); c.set(P); const y=new Float64Array(x.length), B=128, ib=new Float32Array(B), ob=new Float32Array(B);
  for(let i=0;i<x.length;i+=B){ const n=Math.min(B,x.length-i); for(let k=0;k<n;k++) ib[k]=x[i+k]; c.process(ib, ob, n); for(let k=0;k<n;k++) y[i+k]=ob[k]; } return y; }
function stubCtx(sr){ return {sampleRate:sr, createBuffer:(ch,len,r)=>{ const d=[...Array(ch)].map(()=>new Float32Array(len)); return {length:len, sampleRate:r, numberOfChannels:ch, getChannelData:i=>d[i]}; }}; }
function conv(x, h){ const y=new Float64Array(x.length); for(let i=0;i<x.length;i++){ let s=0; const m=Math.min(h.length, i+1); for(let k=0;k<m;k++) s+=h[k]*x[i-k]; y[i]=s; } return y; }
function rms(x, a, b){ let s=0; a=a||0; b=b||x.length; for(let i=a;i<b;i++) s+=x[i]*x[i]; return Math.sqrt(s/Math.max(1,b-a)); }
function db(v){ return 20*Math.log10(v+1e-12); }
function spectrum(x, a, N, sr){ const re=new Float64Array(N), im=new Float64Array(N); for(let i=0;i<N;i++){ const w=0.5-0.5*Math.cos(2*Math.PI*i/N); re[i]=(x[a+i]||0)*w; }
  AMP._fft ? 0 : 0; fftR(re,im); const mag=new Float64Array(N/2); for(let k=0;k<N/2;k++) mag[k]=Math.hypot(re[k],im[k]); return mag; }
function fftR(re, im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; } }
  for(let len=2;len<=n;len<<=1){ const ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang); for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const a=i+j,b=a+len/2,vr=re[b]*cr-im[b]*ci,vi=re[b]*ci+im[b]*cr; re[b]=re[a]-vr; im[b]=im[a]-vi; re[a]+=vr; im[a]+=vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } }
/* THD of a sine at f through P: the harmonics' energy against the fundamental's, from 0.5 s in */
function thd(P, f, amp, sr){ sr=sr||48000; const N=16384, x=new Float64Array(sr), y0=0; for(let i=0;i<x.length;i++) x[i]=amp*Math.sin(2*Math.PI*f*i/sr);
  const y=runCore(P, x, sr), mag=spectrum(y, Math.floor(0.5*sr), N, sr), bin=f*N/sr; let h1=0, hs=0;
  for(let h=1;h<=20;h++){ const b=Math.round(bin*h); if(b+2>=N/2) break; let e=0; for(let k=b-2;k<=b+2;k++) e+=mag[k]*mag[k]; if(h===1) h1=e; else hs+=e; }
  return Math.sqrt(hs/h1); }
module.exports={core, AMP, chord, runCore, stubCtx, conv, rms, db, spectrum, thd, soundParams};
