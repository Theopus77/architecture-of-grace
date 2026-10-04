/* how hard the core works: seconds of CPU per second of sound, at 48 kHz */
const L=require("./lab.js"), {AMP}=L, sr=48000, x=L.chord("clean",[48,52,55,60,64],sr,4);
for(const [name, st] of [["clean amp",{model:"clean"}],["high gain, 4 stages",{model:"high"}],["high gain + gate + overdrive",{model:"high", fx:{gate:{on:true}, od:{on:true}}}],
  ["everything in the worklet on",{model:"high", fx:{gate:{on:true}, comp:{on:true}, wah:{on:true}, oct:{on:true}, od:{on:true}, ds:{on:true}, fz:{on:true}}}],["no amp, no pedals",{model:"none"}]]){
  const P=AMP.coreParams(AMP.normalize(st,"guitar"),"guitar"); L.runCore(P,x.subarray(0,sr),sr);
  const t0=process.hrtime.bigint(); L.runCore(P,x,sr); const dt=Number(process.hrtime.bigint()-t0)/1e9;
  console.log(name.padEnd(32), (dt/4*100).toFixed(2)+"% of one core"); }
