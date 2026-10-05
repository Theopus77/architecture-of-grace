// pulls the drum machine's beat lists (BEAT_GROUPS, STARTERS, BEATS, PRESETS) out of music-drums.html into aog-beats.js
const fs=require("fs"), path=require("path");
const root=process.argv[2], src=fs.readFileSync(path.join(root,"music-drums.html"),"utf8");
function grab(name){ const a=src.indexOf("const "+name+" = "); if(a<0) throw new Error(name); let i=src.indexOf("=",a)+1, d=0, j=i, start=-1;
  for(;j<src.length;j++){ const ch=src[j]; if(ch==="["||ch==="{"){ if(start<0) start=j; d++; } else if(ch==="]"||ch==="}"){ d--; if(d===0 && start>=0){ j++; break; } } }
  return src.slice(start, j); }
const vals={}; for(const n of ["BEAT_GROUPS","STARTERS","BEATS","PRESETS"]){ vals[n]=eval("("+grab(n)+")"); }
console.log(Object.keys(vals).map(k=>k+":"+(Array.isArray(vals[k])?vals[k].length:Object.keys(vals[k]).length)).join(" "));
const out=`/* AOG-KIT-BEATS-V1 — the drum machine's beats, for the Drum Kit page to play (Jimmy, 2026-10-05: "It would be nifty if the
   whole drum kits could play these pre loaded beats and then have the tempo etc, available on screen to adjust").
   MADE BY music-handoff/tools/drumkits/extract_beats.js FROM music-drums.html (BEAT_GROUPS, STARTERS, BEATS, PRESETS):
   run it again when the drum machine's beats change. 1 = a hit, 2 = an accent, 3 = a soft hit; 16 steps a bar. */
(function(root){ "use strict";
  root.AOGBeats = ${JSON.stringify({groups:vals.BEAT_GROUPS, styles:vals.STARTERS, beats:vals.BEATS, classroom:vals.PRESETS})};
})(typeof window !== "undefined" ? window : this);
`;
fs.writeFileSync(path.join(root,"aog-beats.js"), out); console.log("wrote", out.length);
