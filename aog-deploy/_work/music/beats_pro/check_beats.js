/* AOG-BEATS-ELITE-V1: checks every family file in this folder (node check_beats.js; --kits lists the kits) */
const fs=require("fs"), path=require("path"), DIR=__dirname, ROOT=path.resolve(DIR,"../../..");
global.window={}; require(path.join(ROOT,"aog-beats.js")); require(path.join(ROOT,"aog-drumkit.js"));
const OLD=window.AOGBeats, DK=window.AOGDrumKit;
const KITS=new Set(DK.ids.filter(b=>Object.keys(DK.padNames(b)).every(id=>!DK.made(b,id))));   // every pad recorded: the kits the Drum Machine can bring (not L, M)
if(process.argv.includes("--kits")){ [...KITS].forEach(k=>console.log(k.padEnd(3), DK.label(k,"en")[0])); process.exit(0); }
const DRUMS=["kick","snare","ch","oh","clap","tom","rim","bell"], RES=[3,4,6,8];
const oldIds=new Set([].concat(OLD.classroom,OLD.styles,OLD.beats,DK.starters||[]).map(b=>b.id));
let fails=0, n=0; const seen=new Set(), names=new Set();
const bad=(f,id,m)=>{ console.log("FAIL "+f+" "+id+": "+m); fails++; };
const words=x=>x && typeof x.en==="string" && x.en.trim() && typeof x.es==="string" && x.es.trim();
const NAMES=/\b(dilla|questlove|bonham|purdie|porcaro|stubblefield|metro boomin|timbaland|dre|kanye|travis|zaytoven|burial|skrillex|amen|funky drummer|tony allen|gadd|chad smith|dave grohl|lars|neil peart|j dilla|pete rock|premier|alchemist|mustard|tay keith|southside|808 mafia|pharrell|neptunes|aphex|goldie|calvin|daft punk|kerri)\b/i;
const files=fs.readdirSync(DIR).filter(f=>f.endsWith(".json")).sort();
for(const f of files){
  let J; try{ J=JSON.parse(fs.readFileSync(path.join(DIR,f),"utf8")); }catch(e){ bad(f,"-","not JSON: "+e.message); continue; }
  const G=J.groups||{}; for(const [g,w] of Object.entries(G)){ if(!/^el[a-z]+$/.test(g)) bad(f,g,"group id must be el<letters>"); if(!words(w)) bad(f,g,"group needs en and es"); }
  for(const b of J.beats||[]){ n++; const id=b.id||"?";
    if(!/^el_[a-z0-9]+_[a-z0-9]+$/.test(id)) bad(f,id,"id must be el_<family>_<word>");
    if(seen.has(id)||oldIds.has(id)) bad(f,id,"id used twice"); seen.add(id);
    if(!G[b.grp]) bad(f,id,"grp not in this file's groups");
    if(!words(b)) bad(f,id,"needs en and es names"); else { if(names.has(b.en)) bad(f,id,"name used twice: "+b.en); names.add(b.en); }
    if(!b.about || !words(b.about)) bad(f,id,"needs about.en and about.es");
    const txt=[b.en,b.es,b.about&&b.about.en,b.about&&b.about.es].join(" "); if(NAMES.test(txt)) bad(f,id,"a person's or song's name on screen: "+txt.match(NAMES)[0]);
    if(!KITS.has(b.kit)) bad(f,id,"unknown kit "+b.kit);
    if(!(b.bpm>=60 && b.bpm<=180)) bad(f,id,"bpm 60..180 (the Drum Machine's range)");
    const res=b.res||4; if(!RES.includes(res)) bad(f,id,"res must be 3, 4, 6 or 8");
    if(b.swing!=null && (b.swing<0.5||b.swing>0.75)) bad(f,id,"swing 0.5..0.75");
    if(b.swing && b.swing>0.5 && res!==4) bad(f,id,"swing only with res 4 (write triplets with res 3 or 6)");
    const bars=[b.map].concat((b.parts||[]).map(p=>p&&p.map));
    if((b.parts||[]).length>3) bad(f,id,"at most 3 parts (4 bars)");
    bars.forEach((m,bi)=>{ if(!m||typeof m!=="object"){ bad(f,id,"bar "+(bi+1)+" has no map"); return; }
      const keys=Object.keys(m); if(!keys.length) bad(f,id,"bar "+(bi+1)+" is empty");
      keys.forEach(k=>{ if(!DRUMS.includes(k)) bad(f,id,"unknown drum "+k);
        const row=m[k]; if(!Array.isArray(row)||row.length!==4*res) bad(f,id,`bar ${bi+1} ${k}: ${row&&row.length} steps, want ${4*res}`);
        else if(row.some(v=>![0,1,2,3].includes(v))) bad(f,id,`bar ${bi+1} ${k}: hits are 0, 1, 2 or 3`); });
      const hits=keys.reduce((a,k)=>a+(m[k]||[]).filter(Boolean).length,0); if(hits<4) bad(f,id,"bar "+(bi+1)+": fewer than 4 hits");
      if(!(m.kick||[]).some(Boolean) && !(m.tom||[]).some(Boolean) && !(m.rim||[]).some(Boolean)) bad(f,id,"bar "+(bi+1)+": no kick, tom or rim (nothing low)"); });
    if(bars.length===4 && JSON.stringify(bars[3])===JSON.stringify(bars[0])) bad(f,id,"a 4-bar beat should change in bar 4 (a fill)");
  }
}
console.log(`${n} beats in ${files.length} files`); console.log(fails? fails+" FAILED" : "ALL PASS"); process.exit(fails?1:0);
