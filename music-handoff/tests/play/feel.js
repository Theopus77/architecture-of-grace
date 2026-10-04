/* AOG-FEEL-V1: a pattern plays like a person, not a machine. On the guitar, the bass, the piano and The Band, each note of
   a bar is compared with the same bar on the exact grid (AOG_FEEL_OFF): a few milliseconds early or late, never more than
   a player would be; a little softer or louder; a guitar strum keeps its strings in order; a piano chord rolls up from the
   bottom; two bars are not the same twice; and the same bar played again is the same (seeded). Port 9960. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9960);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const [page, rh, extra] of [["guitar","down",15],["bass","eighths",6],["piano",null,40],["band",null,8]]){
    const c=await b.newContext({viewport:{width:1280,height:800}}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9960/music-${page}.html`); await p.waitForTimeout(1000);
    const r=await p.evaluate(([rh])=>{
      ctx(); S.prog=[{off:0,q:"maj"},{off:5,q:"maj"}]; if(rh) S.rhythm=rh;
      const got=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,id,m,v,when){ got.push({m, v, t:when}); return null; };
      const bar=(k, off)=>{ window.AOG_FEEL_OFF=off; got.length=0; scheduleBar(ac, LIVE_CH, k, 10, 2, 0.5, {v:null}); return got.slice(); };
      const res={grid:bar(0,true), a:bar(0,false), a2:bar(0,false), g2:bar(2,true), b:bar(2,false), rhythm:S.rhythm};
      window.makeVoice=mv; window.AOG_FEEL_OFF=false; return res; }, [rh]);
    console.log(`== ${page} · ${r.rhythm} · ${r.a.length} notes`);
    ok(r.a.length===r.grid.length && r.a.length>2, "the same notes as the grid ("+r.a.length+")");
    const dt=r.a.map((x,i)=>(x.t-r.grid[i].t)*1000), dv=r.a.map((x,i)=>x.v/r.grid[i].v-1), same=r.a.every((x,i)=>x.m===r.grid[i].m);
    const mx=Math.max(...dt.map(Math.abs)), moved=dt.filter(x=>Math.abs(x)>0.3).length;
    ok(same, "every note's pitch unchanged");
    ok(mx<=extra && moved>=r.a.length/2, `each note within ${extra} ms of the beat (most ${mx.toFixed(1)} ms), ${moved} of ${r.a.length} not exactly on it`);
    ok(Math.max(...dv.map(Math.abs))<=0.13 && dv.filter(x=>Math.abs(x)>0.005).length>=r.a.length/2, `a little softer or louder (${Math.min(...dv).toFixed(3)} to ${Math.max(...dv).toFixed(3)})`);
    ok(JSON.stringify(r.a)===JSON.stringify(r.a2), "the same bar played again is the same (seeded)");
    const db=r.b.map((x,i)=>(x.t-r.g2[i].t)*1000);
    ok(db.some((x,i)=>Math.abs(x-dt[i])>0.3), "another bar is not the same twice");
    if(page==="guitar"){ /* a strum's strings stay in order */
      const by={}; r.a.forEach((x,i)=>{ const k=r.grid[i].t.toFixed(2); (by[k]=by[k]||[]).push(x.t); });
      ok(Object.values(by).every(l=>l.every((t,i)=>i===0||t>=l[i-1])), "every strum keeps its strings in order");
    }
    if(page==="piano"){ /* a chord rolls up from the bottom */
      const by={}; r.a.forEach((x,i)=>{ const k=r.grid[i].t.toFixed(3); (by[k]=by[k]||[]).push(x); });
      const ch=Object.values(by).filter(l=>l.length>=3);
      ok(ch.length>0 && ch.every(l=>{ const s=l.slice().sort((a,b)=>a.m-b.m).slice(1); return s.every((x,i)=>i===0||x.t>s[i-1].t) && s[s.length-1].t-s[0].t<0.04; }), `${ch.length} chords roll up from the bottom (the bass on its own), inside 40 ms`);
    }
    ok(errs.length===0, "no page errors "+errs.join(" | ")); await c.close();
  }
  await b.close();
  console.log(fails? `${fails} FAILED` : "all passed");
  process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH "+e.stack); process.exit(1); });
