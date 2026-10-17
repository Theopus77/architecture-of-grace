/* AOG-BAND-KEYS-FOLD-V1 (2026-10-17) — Jimmy said yes to "every key always makes a sound". On the Band's keys a key beyond
   the sound's real range (the erhu starts at D4) played nothing. Now it plays the same note an octave (or more) into the
   range, the nearest first; the key pressed is the one that lights, and its lift stops the note.
   1 · erhu: the keyboard's low C (60, below its range) sounds as a C inside the range and key 90 an octave down; the key pressed lights; lifting it stops the note
   2 · erhu: a key inside the range still plays itself, unchanged
   3 · mariachi: a key still plays its two lead players (trumpet and violins)
   No page errors. Port 9390. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9390);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const p=await b.newPage(); const errs=[]; p.on("pageerror", e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9390/music-band.html"); await p.waitForTimeout(800);
  const pick=async id=>{ await p.selectOption("#soundSel", id);
    await p.waitForFunction(id=>soundReady(id) && setsOf(id).every(k=>SETS[k].done===SETS[k].total), id, {timeout:90000}).catch(()=>{}); };
  await pick("erhu");
  const r=await p.evaluate(()=>{ const rg=rangeOf("erhu"); keyOn(60, 0.7); const vc=LIVE.get("k60");
    const lit=!!document.querySelector('#kbd [data-m="60"].down'), litOther=!!(vc && document.querySelector('#kbd [data-m="'+vc.m+'"].down'));
    const out={rg, has:!!vc, m:vc&&vc.m, inst:vc&&vc.inst, lit, litOther};
    keyOff(60); out.after=!!(LIVE.get("k60") && LIVE.get("k60").down); keyOn(90, 0.7); const v3=LIVE.get("k90"); out.hiM=v3&&v3.m; keyOff(90);
    keyOn(rg[0]+5, 0.7); const v2=LIVE.get("k"+(rg[0]+5)); out.inM=v2&&v2.m; out.inK=rg[0]+5; keyOff(rg[0]+5); return out; });
  ok(r.has && r.inst==="erhu", `erhu: the keyboard's low C (60, below its range) sounds (${r.inst})`);
  ok(r.has && r.m>=r.rg[0] && r.m<=r.rg[1] && (r.m-60)%12===0, `erhu: it plays as C ${r.m}, inside the erhu's range ${r.rg}`);
  ok(r.lit && !r.litOther, "erhu: the key pressed (60) is the one that lights");
  ok(r.hiM>=r.rg[0] && r.hiM<=r.rg[1] && (r.hiM-90)%12===0, `erhu: a high key (90, above its range) sounds as ${r.hiM}`);
  ok(!r.after, "erhu: lifting the key stops the note");
  ok(r.inM===r.inK, `erhu: a key inside the range plays itself (${r.inK} → ${r.inM})`);
  await pick("mariachi");
  const q=await p.evaluate(()=>{ keyOn(67, 0.7); const a=[LIVE.get("k67"), LIVE.get("k67~1")].filter(Boolean).map(v=>v.inst+":"+v.m); keyOff(67); return a; });
  ok(q.length===2 && q.every(s=>s.endsWith(":67")), `mariachi: a key plays its two lead players (${q.join(", ")})`);
  ok(!errs.length, "no page errors" + (errs.length ? ": " + errs.slice(0,3).join(" | ") : ""));
  await b.close(); srv.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch(e=>{ console.log("CRASH " + e.message); process.exit(1); });
