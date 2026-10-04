/* all 17 songs, each set up from its own lesson data the way a class would, then every step checked */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9942);
let fails=0, passes=0;
function ok(c,m){ if(c){ passes++; console.log("PASS "+m); } else { fails++; console.log("FAIL "+m); } }
(async()=>{
  const b=await pw.chromium.launch();
  const c=await b.newContext({viewport:{width:1280,height:900}}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9942/music-piano.html"); await p.waitForTimeout(1500);
  await p.click("#kbd");
  const key=async (code)=>{ await p.keyboard.down(code); await p.waitForTimeout(45); await p.keyboard.up(code); await p.waitForTimeout(25); };
  const sel=async (id,v)=>{ await p.selectOption("#"+id, String(v)); await p.waitForTimeout(60); };
  const range=async (id,v)=>{ await p.evaluate(([id,v])=>{ const r=document.getElementById(id); r.value=String(v); r.dispatchEvent(new Event("input",{bubbles:true})); }, [id,v]); await p.waitForTimeout(300); };
  const pad=async i=>{ await p.click(`.pad[data-i="${i}"]`); await p.waitForTimeout(50); };
  const songs=await p.evaluate(()=>LESSONS.map((m,i)=>m.song?{i:i, n:m.song.n, k:m.song.k, en:m.en, steps:m.steps, song:m.song}:null).filter(Boolean));
  ok(songs.length===17, "17 songs");
  for(const s of songs){
    const sg=s.song;
    await p.evaluate(i=>{ LS.pick=i; saveLessons(); paintLessonBox(); }, s.i);
    if(sg.free){
      await sel("keySel",0); await p.click("#clearBtn"); await p.click("#ownBtn"); for(const i of [0,5,3,4,0,1,3,0]) await pad(i); await p.click("#ownBtn");
    } else {
      await sel("keySel", sg.key);
      const minorNow=await p.evaluate(()=>S.minor); if(minorNow!==sg.minor) await p.click(sg.minor?"#minBtn":"#majBtn");
      await range("bpm", sg.bpm); await sel("soundSel", sg.sound); await sel("rhythmSel", sg.rhythm);
      if(sg.preset){ await sel("progSel", sg.preset); }
      else {
        await p.click("#clearBtn"); await p.click("#ownBtn");
        /* each chord of the song is the pad with the same chord in this mood */
        const idx=await p.evaluate(prog=>prog.map(c=>pads().findIndex(x=>x.off===c.off && x.q===c.q)), sg.prog);
        for(const i of idx) await pad(i);
        await p.click("#ownBtn");
      }
      await range("era", sg.era?30:100);
      /* the tune, on the letter keys: each note is the letter for that note in the keyboard's first octave */
      for(const c of sg.checks.filter(c=>c.k==="mel")){
        const codes=await p.evaluate(pcs=>{ const inv={}; Object.keys(KEYMAP).forEach(k=>{ const pc=(KB.lo+KEYMAP[k])%12; if(!(pc in inv) && KEYMAP[k]<12) inv[pc]=k; }); return pcs.map(pc=>inv[pc]); }, c.pcs);
        for(const code of codes) await key(code);
      }
    }
    await p.click("#playBtn"); await p.waitForTimeout(350);
    if(sg.checks.some(c=>c.k==="black")) for(const code of ["KeyW","KeyE","KeyT","KeyY","KeyU","KeyO","KeyP","KeyW","KeyE","KeyT"]) await key(code);
    await p.click("#playBtn"); await p.waitForTimeout(150);
    if(sg.checks.some(c=>c.k==="send")){ await p.click("#sendBtn"); await p.waitForFunction(()=>!document.getElementById("sendBtn").disabled && /Sent|Enviado/.test(document.getElementById("sendLine").textContent), null, {timeout:60000}); }
    await p.waitForTimeout(100);
    const miss=await p.evaluate(ids=>ids.filter(id=>!LS.done[id]), s.steps);
    ok(miss.length===0, `${s.n} · Song ${s.k} · ${s.en}`+(miss.length?" — not ticked: "+miss.map(id=>id+" ("+0+")").join(", "):""));
  }
  const total=await p.evaluate(()=>LESSONS.filter(m=>m.song && m.steps.every(id=>LS.done[id])).length);
  ok(total===17, "every song is done ("+total+"/17)");
  ok(errs.length===0, "no page errors: "+errs.join(" | "));
  console.log((fails?fails+" FAILED, ":"")+passes+" passed");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
