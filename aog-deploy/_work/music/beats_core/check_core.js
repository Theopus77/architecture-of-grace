/* AOG-BEATS-PERFECT-V1: checks the family files here against the beats they came from (node check_core.js; --pads lists
   each kit's eight pads, which are different sounds on different kits). */
const fs=require("fs"), path=require("path"), DIR=__dirname, ROOT=path.resolve(DIR,"../../..");
global.window={}; require(path.join(ROOT,"aog-drumkit.js")); const DK=window.AOGDrumKit;
const KITS=DK.ids.filter(b=>Object.keys(DK.padNames(b)).every(id=>!DK.made(b,id)));
if(process.argv.includes("--pads")){ KITS.forEach(k=>console.log(k.padEnd(3), DK.label(k,"en")[0].padEnd(36), JSON.stringify(DK.padNames(k)))); process.exit(0); }
const ORIG=JSON.parse(fs.readFileSync(path.join(DIR,"_original.json"),"utf8")), O={}, MOVED=JSON.parse(fs.readFileSync(path.join(DIR,"_moved.json"),"utf8"));   /* AOG-BEATS-GROUPS-V1: beats moved to a new group */ ORIG.beats.concat(ORIG.styles).forEach(b=>O[b.id]=b);
const FAM={rockpop:["rock","pop","metal"], funkhiphop:["funk","hiphop"], jazzworld:["jazz","world"], latincarib:["latin","carib"], electronic:["electronic"]};
/* the Drum Kit's play-along lessons time you against these on 16 sixteenths (music-kit.html beatKind, onStep) */
const SIXTEEN=b=>["rock","funk","jazz","latin"].includes(b.grp) || ["funk","latin"].includes(b.id) && !b.grp || b.id==="militarymarch";
const DRUMS=["kick","snare","ch","oh","clap","tom","rim","bell"];
const NAMES=/\b(dilla|questlove|bonham|purdie|porcaro|stubblefield|metro boomin|timbaland|dr\.? dre|kanye|zaytoven|burial|skrillex|amen break|funky drummer|tony allen|gadd|chad smith|grohl|neil peart|pete rock|premier|alchemist|mustard|tay keith|southside|pharrell|neptunes|aphex|goldie|daft punk|kraftwerk|neu!|bo diddley|motown|gene krupa|elvin|art blakey|ringo|clyde)\b/i;
let fails=0, n=0, upgraded=0; const bad=(f,id,m)=>{ console.log("FAIL "+f+" "+id+": "+m); fails++; };
const words=x=>x && typeof x.en==="string" && x.en.trim() && typeof x.es==="string" && x.es.trim();
for(const [f,gs] of Object.entries(FAM)){
  let J; try{ J=JSON.parse(fs.readFileSync(path.join(DIR,f+".json"),"utf8")); }catch(e){ bad(f,"-","not JSON: "+e.message); continue; }
  const list=J.beats.map(b=>({b, style:false})).concat((J.styles||[]).map(b=>({b, style:true})));
  const want=ORIG.beats.filter(b=>gs.includes(b.grp)).map(b=>b.id).concat(f==="electronic"?ORIG.styles.map(b=>b.id):[]);
  const have=list.map(x=>x.b.id); if(JSON.stringify(have.slice().sort())!==JSON.stringify(want.slice().sort())) bad(f,"-","the beats must be the same ones (same ids): missing "+want.filter(i=>!have.includes(i)).join(",")+" extra "+have.filter(i=>!want.includes(i)).join(","));
  for(const {b, style} of list){ n++; const id=b.id, o=O[id]; if(!o) continue;
    if(b.en!==o.en || b.es!==o.es) bad(f,id,"keep the name (en and es) as it was");
    if((b.grp||"")!==(MOVED[id]||o.grp||"")) bad(f,id,"keep the group (or the one _moved.json gives it)");
    if(!style && (!b.about || !words(b.about))) bad(f,id,"needs about.en and about.es");
    if(style && b.about && !words(b.about)) bad(f,id,"about needs en and es");
    const txt=[b.about&&b.about.en,b.about&&b.about.es].join(" "); if(NAMES.test(txt)) bad(f,id,"a person's, band's or song's name on screen: "+txt.match(NAMES)[0]);
    if(!KITS.includes(b.kit)) bad(f,id,"kit "+b.kit+" can't be brought by the Drum Machine (node check_core.js --pads lists the ones that can)");
    if(!(b.bpm>=60 && b.bpm<=180)) bad(f,id,"bpm 60..180");
    const res=b.res||4; if(![3,4,6,8].includes(res)) bad(f,id,"res 3, 4, 6 or 8");
    if(SIXTEEN(b) && res!==4) bad(f,id,"this beat's lesson counts on sixteenths: keep res 4");
    if(b.swing!=null && (b.swing<0.5||b.swing>0.75)) bad(f,id,"swing 0.5..0.75");
    if(b.swing>0.5 && res!==4) bad(f,id,"swing only with res 4");
    if(b.swing8!=null && (b.swing8!==true || !(b.swing>0.5))) bad(f,id,"swing8 is true, with a swing over 0.5");
    if(b.len && res!==4) bad(f,id,"len (a short bar) only with res 4");
    if((b.parts||[]).length>3) bad(f,id,"at most 3 parts (4 bars)");
    const bars=[{len:b.len, map:b.map}].concat((b.parts||[]).map(p=>({len:p&&p.len||b.len, map:p&&p.map})));
    bars.forEach((bar,bi)=>{ const m=bar.map; if(!m||typeof m!=="object"){ bad(f,id,"bar "+(bi+1)+" has no map"); return; }
      Object.keys(m).forEach(k=>{ if(!DRUMS.includes(k)) bad(f,id,"unknown drum "+k);
        const row=m[k]; if(!Array.isArray(row)||row.length!==4*res) bad(f,id,`bar ${bi+1} ${k}: ${row&&row.length} steps, want ${4*res}`);
        else { if(row.some(v=>![0,1,2,3].includes(v))) bad(f,id,`bar ${bi+1} ${k}: hits are 0..3`); if(bar.len && row.slice(bar.len).some(Boolean)) bad(f,id,`bar ${bi+1} ${k}: a hit past the bar's length ${bar.len}`); } });
      const hits=Object.values(m).reduce((a,r)=>a+(r||[]).filter(Boolean).length,0); if(hits<3) bad(f,id,"bar "+(bi+1)+": almost empty"); });
    if(bars.length===4 && JSON.stringify(bars[3].map)===JSON.stringify(bars[0].map)) bad(f,id,"a 4-bar beat should change in bar 4");
    if((b.parts||[]).length || res!==4 || JSON.stringify(b.map)!==JSON.stringify(o.map)) upgraded++;
  }
}
console.log(`${n} beats checked, ${upgraded} changed from the original`); console.log(fails? fails+" FAILED" : "ALL PASS"); process.exit(fails?1:0);
