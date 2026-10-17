/* AOG-LEVEL-EVEN-V1 (2026-10-17) — makes the trims that even out the notes within each sound, room by room, and writes them
   where each room's engine reads them. Jimmy: "I was trying to jam out on the bass and I was playing some notes and some
   scales were higher than others".
     node music-handoff/tools/levels/make.js bass [--passes 3] [--only finger,pick]
     node music-handoff/tools/levels/make.js guitar
   The Guitar and the Bass: every sound, every string at every fret, every take, each strength layer and the muted notes,
   through the sound's own amp and room (rooms.js). Each recording's notes are brought to the level the sound has where
   the room's level is set (the C chord, amp/b1: the guitar's open C shape, the bass's low C), flat across the neck in
   loudness (K-weighted, BS.1770), so the room's starting level stays where it is. The trims go to
   aog-deploy/_work/music/strings_even_<inst>.json (one letter a recording, "O" = 0 dB, 0.1 dB a step, ±4.7 dB at most);
   make_strings.py builds them into the page, and this runs it. A driven amp hears a trim less than 1:1, so it measures
   again and corrects (passes). Ports 9338 (and 9339 for the test). Remake after a set is rebuilt or a sound's amp changes. */
const fs=require("fs"), path=require("path"), cp=require("child_process");
const R=require("./rooms.js"), C=require("./curve.js");
const arg=k=>{ const i=process.argv.indexOf(k); return i>0 ? process.argv[i+1] : null; };
const inst=process.argv[2], PASSES=+(arg("--passes")||3), ONLY=arg("--only") ? arg("--only").split(",") : null;
if(["bass","guitar","piano","band","pads"].indexOf(inst)<0){ console.log("usage: make.js bass|guitar|piano|band|pads [--passes n] [--only a,b]"); process.exit(2); }
if(inst==="pads"){ require("./make_pads.js")(PASSES, ONLY, +(arg("--pages")||3)); return; }
if(inst==="band"){ require("./make_band.js")(PASSES, ONLY, +(arg("--pages")||3)); return; }
if(inst==="piano"){ require("./make_piano.js")(PASSES, ONLY, +(arg("--pages")||3)); return; }
const EVF=path.join(R.ROOT, "_work/music/strings_even_"+inst+".json");
/* tenths of a dB: at most 3 dB either way (the letters reach 4.7). A fuzz, a gate or a resonant synth filter hears a
   trim hardly at all; pushing harder only changes how it plays, so what is left there is the effect's own character */
const MAX=30;
const dec=s=>Array.from(s, ch=>ch.charCodeAt(0)-79);
const enc=a=>a.map(x=>String.fromCharCode(79+Math.max(-MAX, Math.min(MAX, Math.round(x))))).join("");
const pmean=a=>10*Math.log10(a.reduce((s,x)=>s+Math.pow(10,x/10),0)/a.length);
function build(){ cp.execSync("python3 _work/music/make_strings.py", {cwd:R.ROOT, stdio:"pipe"}); }
function summary(res, tag){
  const out={};
  Object.keys(res).filter(k=>!k.startsWith("__")).forEach(id=>{ const rows=res[id]; if(!Array.isArray(rows)) return;
    const st=C.stats(rows.filter(r=>!r.art && Math.abs(r.v-(rows[0].v))<1e-6)); if(!st) return;
    out[id]={dev:st.dev.db, jump:st.jump.db, cell:st.cell.db, spread:st.spread};
    console.log(`${tag} ${id.padEnd(12)} dev ${st.dev.db.toFixed(1).padStart(5)} jump ${st.jump.db.toFixed(1).padStart(5)} one ${st.cell.db.toFixed(1).padStart(5)} spread ${st.spread.toFixed(1)}`); });
  return out;
}
(async()=>{
  const h=await R.open(+(process.env.AOG_LEVELS_PORT||9338));
  let EVEN=fs.existsSync(EVF) ? JSON.parse(fs.readFileSync(EVF, "utf8")) : {};
  /* a driven amp, a compressor or an envelope filter hears a trim less than 1:1: how much each sound's notes moved for
     the trims the pass before gave them (its own sensitivity), so the next step is that much bigger */
  const PREV={};
  for(let pass=1; pass<=PASSES; pass++){
    build();
    const t0=Date.now();
    /* what was measured with these very trims is kept (a run that stops picks up where it was) */
    const key=require("crypto").createHash("md5").update(JSON.stringify(EVEN)).digest("hex").slice(0,10);
    const m=await R.strings(h, inst, {layers:true, mute:true, log:1, only:ONLY, pages:+(arg("--pages")||3), cache:path.join(require("os").tmpdir(), `aog-levels-${inst}-${key}.cache.json`)});
    if(m.errs.length) console.log("page errors:", m.errs.slice(0,5).join(" | "));
    const res=m.res, ref=res.__ref, sets=res.__sets||{}, isRef=r=>ref.some(q=>q.s===r.s && q.m===r.m);
    fs.writeFileSync(path.join(require("os").tmpdir(), `aog-levels-${inst}-pass${pass}.json`), JSON.stringify(res));
    summary(res, `pass ${pass} measured`);
    if(pass===PASSES) break;
    let moved=0;
    for(const id of Object.keys(res)){
      if(id.startsWith("__") || !Array.isArray(res[id]) || !sets[id]) continue;
      const rows=res[id].filter(r=>r.i>=0), {set, n}=sets[id];
      const cur=(EVEN[id] && EVEN[id][0]===set && EVEN[id][1].length===n) ? dec(EVEN[id][1]) : new Array(n).fill(0);
      /* and each note's own trim, from the lowest open string up (what a recording's trim cannot do: an envelope filter
         or a wah that peaks on some notes, a short note that dies faster when sped up) */
      const lo=inst==="bass" ? 28 : 40, NN=Math.max(...rows.map(r=>r.m))-lo+1;   /* TUNING[0], the page's lowest open string */
      const curN=(EVEN[id] && EVEN[id][2] && EVEN[id][2].length===NN) ? dec(EVEN[id][2]) : new Array(NN).fill(0);
      /* the level to bring each group (a strength layer, held or muted) to: its own level at the room's C */
      const key=r=>r.lay+"|"+r.art, Lref={}, by={};
      rows.forEach(r=>{ (by[r.i]=by[r.i]||[]).push(r); });
      const keys=[...new Set(rows.map(key))];
      keys.forEach(k=>{ const rr=rows.filter(r=>key(r)===k && isRef(r)); if(rr.length) Lref[k]=pmean(rr.map(r=>r.lufs)); });
      const next=cur.slice(), now={}; Object.keys(by).forEach(i=>{ now[i]=pmean(by[i].map(r=>r.lufs)); });
      let sens=1; const P=PREV[id];
      if(P){ let sxy=0, sxx=0; Object.keys(now).forEach(i=>{ if(P.lv[i]==null) return; const dt=(cur[i]-P.t[i])/10, dl=now[i]-P.lv[i]; if(Math.abs(dt)>=0.2){ sxy+=dt*dl; sxx+=dt*dt; } });
        if(sxx>0.5) sens=Math.max(0.6, Math.min(1.2, sxy/sxx)); }
      PREV[id]={lv:now, t:cur.slice()};
      const ez={};
      Object.keys(by).forEach(i=>{ const rr=by[i], k=key(rr[0]); if(Lref[k]==null) return;
        const err=now[i]-Lref[k]; ez[i]=err; next[i]=cur[i]-10*err/sens; });
      /* what is left of each note once its recording's own error is taken out: the note's own (half a step a pass) */
      const nres={}; rows.forEach(r=>{ const k=key(r); if(Lref[k]==null || ez[r.i]==null) return; (nres[r.m]=nres[r.m]||[]).push(r.lufs-Lref[k]-ez[r.i]); });
      const nextN=curN.slice();
      Object.keys(nres).forEach(mm=>{ const j=+mm-lo; if(j<0 || j>=NN) return; const a=nres[mm], e=a.reduce((x,y)=>x+y,0)/a.length; nextN[j]=curN[j]-10*0.6*e/sens; });
      const refM=[...new Set(ref.map(q=>q.m))].map(x=>x-lo).filter(j=>j>=0 && j<NN);
      /* the notes' trims carry only the shape (their mean is the recordings' business), so the two never drift apart */
      { const used=Object.keys(nres).map(mm=>+mm-lo).filter(j=>j>=0 && j<NN), mn=used.reduce((x,j)=>x+nextN[j],0)/Math.max(1,used.length); used.forEach(j=>{ nextN[j]-=mn; }); }
      for(let i=0;i<next.length;i++) next[i]=Math.max(-MAX, Math.min(MAX, next[i])); for(let j=0;j<NN;j++) nextN[j]=Math.max(-MAX, Math.min(MAX, nextN[j]));
      /* the C itself stays where it was (the room's level): each group's trims moved together so the C's recordings keep
         theirs on average */
      keys.forEach(k=>{ const rr=rows.filter(r=>key(r)===k && isRef(r)); if(!rr.length) return;
        const idx=[...new Set(rr.map(r=>r.i))], dn=refM.length ? refM.reduce((x,j)=>x+(nextN[j]-curN[j]),0)/refM.length : 0, d=idx.reduce((s,i)=>s+(next[i]-cur[i]),0)/idx.length+dn;
        Object.keys(by).forEach(i=>{ if(key(by[i][0])===k) next[i]-=d; }); });
      moved=Math.max(moved, ...next.map((x,i)=>Math.abs(Math.round(x)-cur[i])), ...nextN.map((x,j)=>Math.abs(Math.round(x)-curN[j])));
      EVEN[id]=[set, enc(next), enc(nextN)];
    }
    fs.writeFileSync(EVF, JSON.stringify(EVEN, null, 0).replace(/\],"/g, '],\n"')+"\n");
    console.log(`pass ${pass}: ${((Date.now()-t0)/60000).toFixed(1)} min, largest change ${(moved/10).toFixed(1)} dB; written ${path.relative(process.cwd(), EVF)}`);
    if(moved<=2){ console.log("settled"); break; }
  }
  build();
  await R.close(h); process.exit(0);
})().catch(e=>{ console.log("CRASH", e); process.exit(1); });
