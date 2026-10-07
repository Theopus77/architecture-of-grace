/* AOG-SEND-TO-PADS-V1 (2026-10-07) — Jimmy: "I want them to be sent to the new drum machine!" The piano, the guitar, the
   bass and the band send to the Drum Machine (music-pads), not the classic one (music-drums):
   · Send chords: the Drum Machine's chords bank (B) takes the instrument, the key and the mood; the bass sends its low
     notes to the notes bank (C), low.
   · A take's Send to the Drum Machine: the take joins the Studio's inbox and goes on the chops bank (D), cut across the pads.
   · The Drum Machine says what arrived, opens the bank, uses each send once (a reload does not repeat it), in English and
     Spanish, and the pads play. Replaces strings/pads and ep/take2pad, which tested the classic drum machine's shelves. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9961);
const U="http://localhost:9961/";
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const FAKE=()=>{ const sr=44100,n=sr, h=new ArrayBuffer(44), v=new DataView(h), s=(q,x)=>{for(let k=0;k<x.length;k++)v.setUint8(q+k,x.charCodeAt(k));};
  const d=new Int16Array(n*2); for(let i=0;i<n;i++){ const y=Math.round(8000*Math.sin(i*2*Math.PI*220/sr)); d[2*i]=y; d[2*i+1]=y; }
  s(0,"RIFF");v.setUint32(4,36+n*4,true);s(8,"WAVE");s(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);s(36,"data");v.setUint32(40,n*4,true);
  const blob=new Blob([h,d],{type:"audio/wav"}); REC.takes.unshift({n:1,sec:1,blob:blob,url:URL.createObjectURL(blob),at:Date.now(),bpm:90}); REC.paint(); };
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1024,height:900}}); const errs=[];
  const page=async(f)=>{ const p=await c.newPage(); p.on("pageerror",e=>errs.push(f+": "+e.message)); await p.goto(U+f); await p.waitForTimeout(1500); return p; };
  const pads=await page("music-pads.html");
  const st=()=>pads.evaluate(()=>({bank:S.bank, B:{inst:S.banks[1].inst,key:S.banks[1].key,scale:S.banks[1].scale}, C:{inst:S.banks[2].inst,key:S.banks[2].key,scale:S.banks[2].scale,oct:S.banks[2].oct}, D:S.banks[3].rec, line:document.getElementById("inLine").textContent}));
  /* 1. the piano's chords */
  const pi=await page("music-piano.html");
  const btn=await pi.locator("#padsBtn").textContent();
  await pi.evaluate(()=>{ S.key=7; S.minor=true; S.sound="epwarm"; document.getElementById("padsBtn").click(); }); await pi.waitForTimeout(800);
  const pl=await pi.locator("#padsLine").innerText(), href=await pi.locator("#padsLine a").getAttribute("href");
  ok(btn==="Send chords to the Drum Machine" && /^Sent\./.test(pl) && href==="music-pads.html", `the piano: "${btn}" → "${pl}" (${href})`);
  let s=await st();
  ok(s.bank===1 && s.B.inst==="k:epwarm" && s.B.key===7 && s.B.scale==="minor" && /piano.*bank B/.test(s.line), "the Drum Machine puts them on bank B, in G minor, warm electric piano: "+JSON.stringify(s));
  /* 2. a guitar take */
  const gt=await page("music-guitar.html");
  await gt.evaluate(FAKE); await gt.waitForTimeout(300);
  const acts=await gt.evaluate(()=>[...document.querySelectorAll("[data-aogrec-drum]")].map(x=>x.textContent));
  await gt.locator("[data-aogrec-drum]").first().click(); await gt.waitForTimeout(1500);
  s=await st();
  ok(acts[0]==="Send to the Drum Machine" && /^t:/.test(s.D) && s.bank===3 && /take is on bank D/.test(s.line), "a guitar take goes to bank D, cut across the pads: "+JSON.stringify({acts, D:s.D, bank:s.bank, line:s.line}));
  const chops=await pads.evaluate(async()=>{ const buf=await recBuf(S.banks[3].rec); return chopsOf(S.banks[3], buf).length; });
  ok(chops===16, "its sixteen chops are ready: "+chops);
  /* 3. the bass's low notes, the band's chords */
  const bs=await page("music-bass.html");
  const bb=await bs.locator("#padsBtn").textContent();
  await bs.evaluate(()=>{ S.key=2; S.minor=false; document.getElementById("padsBtn").click(); }); await bs.waitForTimeout(1200);
  s=await st();
  ok(bb==="Send the low notes to the Drum Machine" && s.bank===2 && s.C.inst==="a:growly" && s.C.key===2 && s.C.scale==="major" && s.C.oct===2, `the bass: "${bb}" → bank C, D major, low, fingered bass: `+JSON.stringify(s.C));
  const bd=await page("music-band.html");
  await bd.evaluate(()=>{ S.key=5; S.minor=false; S.sound="soprano"; document.getElementById("padsBtn").click(); }); await bd.waitForTimeout(1200);
  s=await st();
  ok(s.bank===1 && s.B.inst==="b:soprano" && s.B.key===5 && /band/.test(s.line), "the band's chords go to bank B as the soprano sax: "+JSON.stringify(s.B));
  /* 4. once only; Spanish; the pads play */
  await pads.reload(); await pads.waitForTimeout(2000);
  s=await st(); ok(s.line==="", "a reload does not send them again: "+JSON.stringify(s.line));
  await pi.evaluate(()=>{ document.getElementById("langBtn").click(); }); await pi.waitForTimeout(300);
  const es=await pi.evaluate(()=>{ document.getElementById("padsBtn").click(); return document.getElementById("padsBtn").textContent; }); await pi.waitForTimeout(1000);
  const esl=await pi.locator("#padsLine").innerText();
  ok(es==="Enviar acordes a la caja de ritmos" && /^Enviado\./.test(esl), `in Spanish: "${es}" → "${esl}"`);
  const played=await pads.evaluate(async()=>{ S.bank=1; await prep(1); let n=0; const o=window.playPad||null; return isReady(1); });
  ok(played, "bank B is ready to play");
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  await b.close(); console.log(fails ? fails+" FAILED" : "ALL PASS"); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH "+e.message); process.exit(1); });
