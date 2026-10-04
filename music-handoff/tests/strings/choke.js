/* the drum engine on its own (Node): two chord pads in choke group 2; the first fades out in a few ms with no jump */
const fs=require("fs"); const s=fs.readFileSync(process.argv[2],"utf8"); const i=s.indexOf("const WORKLET"), a=s.indexOf("`",i), b=s.indexOf("`;",a+1);
let P=null; const AWP=class{ constructor(){ this.port={onmessage:null}; } };
new Function("AudioWorkletProcessor","registerProcessor","sampleRate","currentTime", s.slice(a+1,b)+"\n")(AWP, (n,c)=>{P=c;}, 48000, 0);
const e=new P(); const sr=48000;
/* two "chords": steady sines, so any click shows as a jump */
const mk=f=>{ const d=new Float32Array(26040*1.4); for(let k=0;k<d.length;k++) d[k]=0.6*Math.sin(2*Math.PI*f*k/26040); return d; };
e.kit=e.kit||{}; e.kit.ch={v:mk(261.6), h:null, hr:26040}; e.kit.oh={v:mk(329.6), h:null, hr:26040};
e.rate=26040;
const base={bit:false, era:0, tune:0, decay:1, level:1, cutoff:18000, reso:0, raw:true};
e.start(Object.assign({id:"ch", choke:2}, base));
const out=[]; function run(n){ const L=new Float32Array(n), R=new Float32Array(n); e.process([], [[L,R]]); for(const x of L) out.push(x); }
for(let k=0;k<20;k++) run(128);
const before=e.active.length;
e.start(Object.assign({id:"oh", choke:2}, base));
const at=out.length; for(let k=0;k<20;k++) run(128);
let maxJump=0; for(let k=at-200;k<at+400;k++) maxJump=Math.max(maxJump, Math.abs(out[k]-out[k-1]));
let steadyJump=0; for(let k=200;k<at-10;k++) steadyJump=Math.max(steadyJump, Math.abs(out[k]-out[k-1]));
console.log(JSON.stringify({voicesBefore:before, voicesAfter:e.active.length, ids:e.active.map(v=>v.id), maxJumpAtChange:+maxJump.toFixed(4), normalJump:+steadyJump.toFixed(4)}));
console.log(e.active.length===1 && e.active[0].id==="oh" && maxJump<steadyJump*2.5 ? "PASS the first chord fades out, no click" : "FAIL");
