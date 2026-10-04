/* the shape of the heavy sounds: octave-band levels of a power chord (E5) through each amp and its cabinet, against the
   loudest band; and how long a held chord keeps its level (sustain) */
const L=require("./lab.js"), {AMP}=L, sr=48000, ctx=L.stubCtx(sr);
const pc=L.chord("metal",[40,47,52],sr,3, 0.8);
function bands(y){ const N=65536, mag=L.spectrum(y, Math.floor(0.1*sr), N, sr), out=[];
  for(const f of [63,125,250,500,1000,2000,4000,8000]){ let e=0; for(let k=Math.floor(f/Math.SQRT2*N/sr); k<Math.ceil(f*Math.SQRT2*N/sr); k++) e+=mag[k]*mag[k]; out.push(10*Math.log10(e+1e-20)); }
  const mx=Math.max(...out); return out.map(v=>(v-mx).toFixed(0).padStart(4)); }
function sustain(y){ const a=L.rms(y, Math.floor(0.05*sr), Math.floor(0.25*sr)), b=L.rms(y, Math.floor(1.8*sr), Math.floor(2.0*sr)); return (L.db(b)-L.db(a)).toFixed(1); }
console.log("bands (dB)            63 125 250 500  1k  2k  4k  8k   sustain 2 s");
const dry=pc; console.log("dry string".padEnd(20), bands(dry).join(""), "  ", sustain(dry));
for(const [name, st] of [["clean",{model:"clean"}],["crunch",{model:"crunch"}],["high",{model:"high",k:{gain:6,mid:5}}],["groove",{model:"groove",k:{gain:6,mid:2.5,bass:6,treble:6}}],
  ["groove + gate",{model:"groove",k:{gain:6,mid:2.5,bass:6,treble:6},fx:{gate:{on:true}}}],["high + TS boost",{model:"high",k:{gain:5},fx:{od:{on:true,drive:0,tone:5,lvl:8}}}]]){
  const s=AMP.normalize(st,"guitar"), M=AMP.MODELS[s.model], P=AMP.coreParams(s,"guitar"); let y=L.runCore(P, pc, sr); const h=AMP.cabIR(ctx, M.cab).getChannelData(0); y=L.conv(y,h);
  console.log(name.padEnd(20), bands(y).join(""), "  ", sustain(y)); }
