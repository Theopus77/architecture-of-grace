/* AOG-LEVEL-EVEN-V1 (2026-10-17) — Jimmy: "I would like all the instruments to be checked for sound levels. I was trying to jam
   out on the bass and I was playing some notes and some scales were higher than others etc.."
   Every note of every sound, room by room, rendered offline through the room's own engine and chain (as a player hears it:
   the room's chain, its amp or finish, pedals off, the Room knob dry, the default volume), one at a time, its first 400 ms
   measured as BS.1770 does (K-weighted loudness; music-handoff/tools/levels). For each sound:
     · no note more than 1.5 dB off the smooth curve through its notes (the instrument's own register shape: a parabola,
       fitted so one odd note cannot bend it, the Band's world players' rule, bandt/world_even.inc), and no step between
       neighbouring notes more than 1.5 dB beyond the curve's;
     · no single take, string or recording more than 2 dB off that curve;
     · from its softest note to its loudest at most 4 dB (the Guitar and the Bass) or 5 dB (the Piano, the Band and the
       Drum Machine, whose instruments keep half their natural slope);
     · where its strength layers change (soft to loud recordings), no jump over 1.5 dB beyond what the strength itself
       adds; the Bass's scales played up the neck (C major, A minor pentatonic) as even as its notes;
     · its C chord within 1 dB of the grand piano's (each room's own level test's way of playing and measuring it).
   The recorded drum kits: every take of a pad within 1.5 dB of its other takes, and soft < normal < accent. The
   Turntables' starter crate: every record within 1 dB of the others once the deck has set its level.
     node music-handoff/tests/levels/even.js                  every room (long: an hour or more on a busy machine)
     node music-handoff/tests/levels/even.js bass guitar      just these (bass guitar piano band pads kit decks)
   Ports 9338 and 9339. Exit code 1 on any failure. */
const R=require("../../tools/levels/rooms.js"), C=require("../../tools/levels/curve.js");
const ALLROOMS=["bass","guitar","piano","band","pads","kit","decks"];
const ROOMS=process.argv.slice(2).filter(a=>ALLROOMS.indexOf(a)>=0); if(!ROOMS.length) ROOMS.push(...ALLROOMS);
const LIM={dev:1.5, jump:1.5, one:2.0, spread:{bass:4, guitar:4, piano:5, band:5, pads:5}, layer:1.5, start:1.0, take:1.5, crate:1.0};
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; return c; };
const f1=x=>(x>=0?"+":"")+x.toFixed(1);
/* one sound's notes: the checks above, one line */
function even(room, id, rows, what){
  const st=C.stats(rows); if(!st) return ok(false, `${room} ${id}${what?" "+what:""}: nothing measured`);
  const sp=LIM.spread[room], c=st.cell.r||{};
  const bad=[]; if(Math.abs(st.dev.db)>LIM.dev) bad.push(`note ${st.dev.m} ${f1(st.dev.db)} dB off the line`);
  if(Math.abs(st.jump.db)>LIM.jump) bad.push(`a step of ${f1(st.jump.db)} dB into ${st.jump.m}`);
  if(Math.abs(st.cell.db)>LIM.one) bad.push(`one recording ${f1(st.cell.db)} dB off (${c.m}${c.s!=null?" string "+c.s:""}${c.f?" "+c.f:""})`);
  if(st.spread>sp) bad.push(`${st.spread.toFixed(1)} dB from softest to loudest`);
  return ok(!bad.length, `${room} ${id}${what?" "+what:""}: ${st.lo}–${st.hi}, worst note ${f1(st.dev.db)} dB, step ${f1(st.jump.db)}, one take ${f1(st.cell.db)}, spread ${st.spread.toFixed(1)} dB${bad.length?" — "+bad.join("; "):""}`);
}
function starts(room, ch){
  const off=Object.entries(ch.res).filter(([id,v])=>Array.isArray(v) && Math.abs(v[0].db-ch.grand)>LIM.start).map(([id,v])=>`${id} ${f1(v[0].db-ch.grand)}`);
  ok(!off.length && !ch.errs.length, `${room}: every sound's C chord within ${LIM.start} dB of the grand piano's (${ch.grand.toFixed(2)} dB)${off.length?" — off: "+off.join(", "):""}${ch.errs.length?" errors: "+ch.errs.slice(0,3).join(" | "):""}`);
}
(async()=>{
  const h=await R.open(+(process.env.AOG_LEVELS_PORT||9338)), t0=Date.now();   /* 9339 for a second half run beside it */
  for(const room of ROOMS){
    const t1=Date.now(); console.log(`== ${room}`);
    if(room==="bass" || room==="guitar"){
      const m=await R.strings(h, room, {layers:true, pages:3});   /* in the middle of each strength layer the sound's set has */
      ok(!m.errs.length, `${room}: no page errors ${m.errs.slice(0,3).join(" | ")}`);
      const ids=Object.keys(m.res).filter(k=>!k.startsWith("__"));
      for(const id of ids){ const rows=m.res[id]; if(!Array.isArray(rows)){ ok(false, `${room} ${id}: ${JSON.stringify(rows)}`); continue; }
        const vs=[...new Set(rows.map(r=>r.v))]; vs.forEach(v=>even(room, id, rows.filter(r=>r.v===v), vs.length>1 ? "at "+v : "")); }
      /* the strength layers: just under and just over each change, at a few notes up the neck */
      const x=await R.spread(h, `music-${room}.html`, ids, 3, async(opt)=>{ const res={};
        for(const id of opt.ids){ await loadSound(id); const Rs=REAL.sets[recOf(id)]; if(!Rs) continue; const b=(Rs.meta.vel||[0]).slice(1), out=[];
          for(const v of b) for(const s of [0, TUNING.length-1]) for(const f of [1, 7, 12]){ const lv=[];
            for(const vv of [v-0.01, v+0.01]){ const oc=new OfflineAudioContext(2, 22050, 44100); await AOGAmp.load(oc); S.sound=id; const ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSound(ch,id); setEra(ch,0,0);
              FORCE_Z=null; const vc=makeVoice(oc,ch,id,TUNING[s]+f,vv,0.05,s); lv.push(vc ? __lv.kw(await oc.startRendering(), 0.05).lufs : NaN); }
            out.push({v, s, f, d:lv[1]-lv[0]-20*Math.log10(velAmp(v+0.01)/velAmp(v-0.01))}); }
          res[id]=out; }
        return res; }, {});
      const lay=Object.entries(x.res).filter(([k])=>!k.startsWith("__")).map(([id,a])=>[id, a.reduce((w,q)=>Math.abs(q.d)>Math.abs(w.d)?q:w, {d:0})]);
      const lbad=lay.filter(([id,q])=>Math.abs(q.d)>LIM.layer);
      ok(!lbad.length, `${room}: soft to loud recordings cross smoothly (worst ${lay.length?f1(Math.max(...lay.map(([i,q])=>Math.abs(q.d)))):"0"} dB)${lbad.length?" — "+lbad.map(([id,q])=>`${id} ${f1(q.d)} at ${q.v} (string ${q.s}, fret ${q.f})`).join(", "):""}`);
      if(room==="bass"){
        /* the scales as the keys play them (scaleNote: where the hand is), up and back */
        const sc=await R.spread(h, "music-bass.html", ["finger"], 1, async()=>{ const c={off:0,q:"maj"}, root=bassRoot(c);
          return {maj:[0,2,4,5,7,9,11,12].map(i=>cellFor(root+i)), pent:[0,3,5,7,10,12,15].map(i=>cellFor(root+9-12+i)).filter(Boolean)}; }, {});
        const OPEN=[28,33,38,43], sbad=[]; let worst=0, wspan=0;
        for(const id of ids){ const rows=m.res[id]; if(!Array.isArray(rows)) continue;
          for(const [nm, cells] of Object.entries({"C major":sc.res.maj, "A minor pentatonic":sc.res.pent})){
            const lv=cells.filter(Boolean).map(cl=>{ const r=rows.filter(q=>q.v===rows[0].v && q.s===cl.s && q.m===OPEN[cl.s]+cl.f); return r.length ? 10*Math.log10(r.reduce((a,q)=>a+Math.pow(10,q.lufs/10),0)/r.length) : NaN; }).filter(isFinite);
            const st=Math.max(...lv.slice(1).map((y,i)=>Math.abs(y-lv[i]))), span=Math.max(...lv)-Math.min(...lv);
            worst=Math.max(worst, st); wspan=Math.max(wspan, span);
            if(!(st<=LIM.jump && span<=3)) sbad.push(`${id} ${nm}: a step of ${st.toFixed(1)} dB, ${span.toFixed(1)} dB softest to loudest`);
          } }
        ok(!sbad.length, `bass: the C major and A minor pentatonic scales as the keys play them, every sound: biggest step ${worst.toFixed(1)} dB, at most ${wspan.toFixed(1)} dB from softest to loudest note${sbad.length?" — "+sbad.join("; "):""}`);
      }
      starts(room, await R.chords(h, room, {pages:3}));
      if(room==="guitar"){
        /* the strip's twelve chords, strummed: each within 3 dB of the others (a chord on four strings is a little softer than
           one on six, as on a real guitar) */
        const s=await R.strums(h, {pages:3}), bad=[]; let worst=0;
        for(const [id, rows] of Object.entries(s.res)){ if(!Array.isArray(rows) || !rows.length) continue; const lv=rows.map(r=>r.lufs), sp=Math.max(...lv)-Math.min(...lv);
          worst=Math.max(worst, sp); if(sp>3) bad.push(`${id} ${sp.toFixed(1)} dB (${rows.map(r=>r.name+" "+r.lufs.toFixed(1)).join(", ")})`); }
        ok(!bad.length && !s.errs.length, `guitar: the strip's chords, strummed, within 3 dB of each other on every sound (widest ${worst.toFixed(1)} dB)${bad.length?" — "+bad.join("; "):""}`);
      }
    }
    if(room==="piano"){
      const m=await R.piano(h, {pages:3});
      ok(!m.errs.length, `piano: no page errors ${m.errs.slice(0,3).join(" | ")}`);
      for(const id of Object.keys(m.res).filter(k=>!k.startsWith("__"))){ const rows=m.res[id]; if(!Array.isArray(rows)){ ok(false, `piano ${id}: ${JSON.stringify(rows)}`); continue; }
        for(const v of [...new Set(rows.map(r=>r.v))]) even("piano", id, rows.filter(r=>r.v===v), "at "+v); }
      starts("piano", await R.chords(h, "piano", {pages:3}));
    }
    if(room==="band"){
      const m=await R.band(h, {pages:3});
      ok(!m.errs.length, `band: no page errors ${m.errs.slice(0,3).join(" | ")}`);
      for(const id of Object.keys(m.res).filter(k=>!k.startsWith("__"))){ const rows=m.res[id]; if(!Array.isArray(rows)){ ok(false, `band ${id}: ${JSON.stringify(rows)}`); continue; }
        for(const g of [...new Set(rows.map(r=>r.art+" "+r.v))]) even("band", id, rows.filter(r=>r.art+" "+r.v===g), g==="sus 0.6"?"":g.replace("sus 0.05","softest").replace("sus 1","loudest").replace("stac 0.6","short")); }
      starts("band", await R.chords(h, "band", {pages:3}));
    }
    if(room==="pads"){
      const m=await R.pads(h, {pages:3});
      ok(!m.errs.length, `pads: no page errors ${m.errs.slice(0,3).join(" | ")}`);
      for(const id of Object.keys(m.res).filter(k=>!k.startsWith("__"))){ const rows=m.res[id]; if(!Array.isArray(rows)){ ok(false, `pads ${id}: ${JSON.stringify(rows)}`); continue; }
        for(const v of [...new Set(rows.map(r=>r.v))]) even("pads", id, rows.filter(r=>r.v===v), "at "+v); }
      console.log("     (each instrument's starting level: music-handoff/tests/pads/level.js)");
    }
    if(room==="kit"){
      const m=await R.kits(h, {pages:3});
      ok(!m.errs.length, `kit: no page errors ${m.errs.slice(0,3).join(" | ")}`);
      for(const [b, rows] of Object.entries(m.res)){ if(!Array.isArray(rows)) continue; const bad=[];
        const pads=[...new Set(rows.map(r=>r.pad))];
        pads.forEach(id=>{ const lv={};
          ["s","m","h"].forEach(l=>{ const t=rows.filter(r=>r.pad===id && r.lay===l).map(r=>r.lufs); if(!t.length) return; lv[l]=10*Math.log10(t.reduce((a,x)=>a+Math.pow(10,x/10),0)/t.length);
            const sp=Math.max(...t)-Math.min(...t); if(sp>LIM.take) bad.push(`${id} ${l} takes ${sp.toFixed(1)} dB apart`); });
          if(lv.s!=null && lv.m!=null && lv.s>lv.m+0.5) bad.push(`${id} soft over normal (${f1(lv.s-lv.m)})`);
          if(lv.h!=null && lv.m!=null && lv.h<lv.m-0.5) bad.push(`${id} accent under normal (${f1(lv.h-lv.m)})`); });
        ok(!bad.length, `kit ${b}: ${pads.length} pads, every take of a pad alike, soft < normal < accent${bad.length?" — "+bad.join("; "):""}`); }
    }
    if(room==="decks"){
      const m=await R.decks(h, {pages:2});
      /* the deck's own loudness (gated, as streaming services measure it: a speech's pauses do not count) brought to
         LEVEL_LUFS; and, as a second look, the whole record ungated (BS.1770 without the gate), which a speech reads lower */
      const lv=Object.entries(m.res).map(([f,a])=>[f, a[0]]), set=lv.map(([f,x])=>[f, x.own+x.trim]);
      const off=set.filter(([f,x])=>Math.abs(x-(-15))>LIM.crate), ug=lv.map(([f,x])=>x.lufs), us=Math.max(...ug)-Math.min(...ug);
      ok(lv.length>0 && !off.length && !m.errs.length && us<=2, `decks: ${lv.length} starter records, each brought to the deck's level (−15 LUFS) within ${LIM.crate} dB; ungated, all within ${us.toFixed(1)} dB of each other${off.length?" — off: "+off.map(([f,x])=>f+" "+f1(x+15)).join(", "):""}`);
    }
    console.log(`   ${room}: ${((Date.now()-t1)/60000).toFixed(1)} min`);
  }
  await R.close(h);
  console.log(fails ? `FAIL ${fails} check(s) failed (${((Date.now()-t0)/60000).toFixed(0)} min)` : `PASS every note of every sound is even (${((Date.now()-t0)/60000).toFixed(0)} min)`);
  process.exit(fails ? 1 : 0);
})().catch(e=>{ console.log("CRASH", e && e.stack || e); process.exit(1); });
