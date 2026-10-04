/* render notes of the given sounds to WAV files (for looking at, and for spectrograms): node renders.js id1,id2 [notes] [outdir] */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9952);
const fs=require("fs"), path=require("path");
const ids=(process.argv[2]||"").split(",").filter(Boolean), notes=(process.argv[3]||"36,60,84").split(",").map(Number), out=process.argv[4]||path.join(__dirname,"..","wav");
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9952/music-piano.html"); await p.waitForTimeout(600);
  for(const id of ids){
    for(const m of notes){
      const b64=await p.evaluate(async([id,m])=>{
        const snd=SOUNDS[id]; if(snd.kind==="sample") await loadSet(snd.set);
        const sr=44100, T=1.8, LEN=T+1.6, oc=new OfflineAudioContext(1, Math.ceil(sr*LEN), sr), ch=makeChain(oc);
        ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        if(m<0){ [60,64,67,48].forEach((n,j)=>{ const vc=makeVoice(oc,ch,id,n,0.74*(j===3?0.85:1),0.05); vc.stop(T, vc.tau); }); }
        else { const vc=makeVoice(oc,ch,id,m,0.74,0.05); vc.stop(T, vc.tau); }
        const d=(await oc.startRendering()).getChannelData(0), n=d.length, ab=new ArrayBuffer(44+n*2), v=new DataView(ab);
        const str=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
        str(0,"RIFF"); v.setUint32(4,36+n*2,true); str(8,"WAVE"); str(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
        v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); str(36,"data"); v.setUint32(40,n*2,true);
        for(let i=0;i<n;i++){ const x=Math.max(-1,Math.min(1,d[i])); v.setInt16(44+i*2, x<0?x*0x8000:x*0x7fff, true); }
        let s=""; const u=new Uint8Array(ab); for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null, u.subarray(i,i+0x8000)); return btoa(s);
      }, [id,m]);
      fs.writeFileSync(path.join(out, `${id}-${m<0?"chord":m}.wav`), Buffer.from(b64,"base64"));
    }
    console.log("rendered", id);
  }
  if(errs.length) console.log("page errors:", errs.join(" | "));
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
