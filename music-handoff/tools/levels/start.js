/* AOG-LEVEL-EVEN-V1: the last step after make.js — each sound's starting level put back where the room's level test keeps
   it (its C chord as loud as the grand piano's: ep/allevel, amp/b1, bandt/level). Evening a sound's notes moves them along
   their own line; this moves the whole line back, by the same dB on every one of the sound's trims, so no note's place
   against its neighbours changes. Any sound more than 0.3 dB off is moved.
     node music-handoff/tools/levels/start.js piano|bass|guitar|band [--dry]
   The Band: a player is moved by its own solo sound's chord (every group it plays in follows). Ports 9338 (or
   AOG_LEVELS_PORT). */
const fs=require("fs"), path=require("path"), cp=require("child_process");
const R=require("./rooms.js");
const room=process.argv[2], DRY=process.argv.indexOf("--dry")>0;
if(["piano","bass","guitar","band"].indexOf(room)<0){ console.log("usage: start.js piano|bass|guitar|band [--dry]"); process.exit(2); }
const shiftChars=(s, steps)=>Array.from(s, ch=>String.fromCharCode(Math.max(32, Math.min(126, ch.charCodeAt(0)+steps)))).join("");
(async()=>{
  const h=await R.open(+(process.env.AOG_LEVELS_PORT||9338));
  const c=await R.chords(h, room, {pages:3});
  if(c.errs.length) console.log("page errors:", c.errs.slice(0,3).join(" | "));
  const off={}; Object.entries(c.res).forEach(([id,v])=>{ if(Array.isArray(v)) off[id]=v[0].db-c.grand; });
  console.log("grand", c.grand.toFixed(2), Object.entries(off).filter(([k,d])=>Math.abs(d)>0.3).map(([k,d])=>k+" "+(d>=0?"+":"")+d.toFixed(1)).join(", ")||"(every sound within 0.3 dB)");
  if(!DRY){
    if(room==="piano"){
      const P=path.join(R.ROOT, "music-piano.html"), A="/* AOG-LEVEL-EVEN-V1 table start */\n", Z="\n/* AOG-LEVEL-EVEN-V1 table end */";
      let s=fs.readFileSync(P,"utf8"); const i=s.indexOf(A), j=s.indexOf(Z), T=JSON.parse(s.slice(i+A.length, j).replace(/^const EVENP=/,"").replace(/;\s*$/,""));
      Object.entries(off).forEach(([id,d])=>{ if(Math.abs(d)<=0.3 || !T[id]) return; Object.keys(T[id]).forEach(l=>{ if(l.length===1) T[id][l]=shiftChars(T[id][l], -Math.round(d/0.2)); }); });
      const body="const EVENP={"+Object.keys(T).sort().map(k=>JSON.stringify(k)+":"+JSON.stringify(T[k])).join(",\n")+"};";
      fs.writeFileSync(P, s.slice(0, i+A.length)+body+s.slice(j));
    } else if(room==="band"){
      const M=path.join(R.ROOT, "audio/band/manifest.json"), man=JSON.parse(fs.readFileSync(M,"utf8"));
      Object.entries(off).forEach(([id,d])=>{ if(Math.abs(d)<=0.3 || !man[id]) return;   /* a player's own solo sound */
        const L=man[id].lvl=man[id].lvl||{}; new Set(Object.keys(L).concat(man[id].sus.map(n=>n+"s"), man[id].susL.map(n=>n+"l"), man[id].stac.map(n=>n+"t"))).forEach(k=>{ if(k.slice(-1)==="b") return; L[k]=Math.round(((L[k]||0)-d)*10)/10; }); });
      fs.writeFileSync(M, JSON.stringify(man));
      cp.execSync("python3 _work/music/make_band.py", {cwd:R.ROOT, stdio:"pipe"});
    } else {
      const F=path.join(R.ROOT, "_work/music/strings_even_"+room+".json"), E=JSON.parse(fs.readFileSync(F,"utf8"));
      Object.entries(off).forEach(([id,d])=>{ if(Math.abs(d)<=0.3 || !E[id]) return; E[id][1]=shiftChars(E[id][1], -Math.round(d/0.1)); });
      fs.writeFileSync(F, JSON.stringify(E).replace(/\],"/g, '],\n"')+"\n");
      cp.execSync("python3 _work/music/make_strings.py", {cwd:R.ROOT, stdio:"pipe"});
    }
    console.log("moved; written");
  }
  await R.close(h); process.exit(0);
})().catch(e=>{ console.log("CRASH", e); process.exit(1); });
