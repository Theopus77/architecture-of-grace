/* The Band: a single player's march has its oom-pah; a pad never plays a note twice; one bar of every rhythm on every
   sound schedules notes, with no note started twice at the same moment */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9983);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext(pw.devices["iPhone 13"]); const p=await c.newPage();
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9983/music-band.html"); await p.waitForTimeout(600);
  const res=await p.evaluate(async()=>{
    const out=[];
    for(const id of Object.keys(SOUNDS)){
      S.sound=id; await loadSound(id);
      const oc=new OfflineAudioContext(2, 44100*3, 44100), ch=makeChain(oc);
      for(const pr of ["pop","blues","minor"]){
        S.prog=PRESETS.find(x=>x.id===pr).chords.map(c=>({off:c.off,q:c.q}));
        for(const r of RHYTHMS){ S.rhythm=r; const prev={v:null};
          for(let k=0;k<S.prog.length;k++){
            const v=scheduleBar(oc, ch, k, 0.05, 2.5, 0.5, prev), seen={}; let dbl=0;
            v.forEach(x=>{ const id2=(x.kit?"kit:"+x.kit:x.inst+":"+x.m)+"@"+x.on.toFixed(3); if(seen[id2]) dbl++; seen[id2]=1; });   /* a player (or a drum) twice; two players in unison are an orchestra's doubling */
            const bassNotes=chordParts(S.prog[k], prev.v).filter(p=>p.bass).length;
            if(!v.length || dbl || !bassNotes) out.push(id+" "+pr+" bar "+k+" "+r+": "+v.length+" notes, "+dbl+" twice, bass "+bassNotes);
          }
        }
      }
      /* a pad: every key once */
      for(let i=0;i<6;i++){ const c=pads()[i], keys=holdChord("t"+i, c, 0.7); const u=new Set(keys); if(u.size!==keys.length) out.push(id+" pad "+i+" plays a note twice"); keys.forEach(k=>noteOff(k)); }
    }
    return out;
  });
  ok(res.length===0, "every sound, three patterns, seven rhythms: notes in every bar, a bass in every bar, nothing started twice at once"+(res.length?": "+res.slice(0,8).join(" | "):""));
  /* the march for the trumpet alone: oom (root) on 1, pah (chord) on 2, oom (fifth) on 3, pah on 4 */
  const m=await p.evaluate(async()=>{ S.sound="trumpet"; await loadSound("trumpet"); S.prog=[{off:0,q:"maj"}]; S.rhythm="march"; S.key=0;
    const oc=new OfflineAudioContext(2, 44100*3, 44100), ch=makeChain(oc), v=scheduleBar(oc, ch, 0, 0, 2.4, 0.5, {v:null});
    const by={}; v.forEach(x=>{ const bt=Math.round(x.on/0.6); (by[bt]=by[bt]||[]).push(x.m); }); return by; });
  ok(m[0] && m[0].length===1 && m[0][0]%12===0 && m[1].length>=3 && m[2] && m[2].length===1 && m[2][0]%12===7 && m[3].length>=3, "the trumpet's march: "+JSON.stringify(m));
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
