/* The Band's tenor and soprano saxophones (AOG-BAND-SAX2-V1), on an iPhone: they load only when picked (and a sound
   without them never fetches them); every note across their reach plays in tune, within 5 cents, measured on the page's
   own voices the way tune.py measures (YIN on 60 ms windows from 0.25 s to 2.5 s, the middle value, louder windows
   counted more; a short note by finalize.py's window); each new sound's C chord is as loud as the grand's (-8.62 dB,
   within 0.5); the styles differ (the ballad has vibrato, the fusion soprano leans soft, the modal tenor leans loud); the
   tenor joins the big band and both join the orchestra; pads and keys play real notes; Send to the turntables and the
   chord pads render them offline; the menu and the lines in Spanish; nothing sticks out sideways on a phone; no page
   errors and no failed requests. Port 9490. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9490);
const fs=require("fs"), MEASURE=(0,eval)(fs.readFileSync(__dirname+"/measure.inc","utf8").replace(/^const MEASURE=/,""));
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const NEW=["soprano","tenor","tenor_vib","tenor_modal","soprano_fusion"];
const FOLDERS=["tenor","tenor_vib","soprano"];
/* tune.py, in the page: yin_window, windows, wmedian, heard("held") and finalize_yin */
const PITCH=`
window.__yinWin=function(x,s,m,W,SR){ const f=440*Math.pow(2,(m-69)/12), P=SR/f, lo=Math.floor(P*Math.pow(2,-1.5/12))-1, hi=Math.floor(P*Math.pow(2,1.5/12))+2;
  if(s+W+hi+1>x.length) return null; const d=new Float64Array(hi-lo+1);
  for(let t=lo;t<=hi;t++){ let a=0; for(let i=0;i<W;i++){ const q=x[s+i]-x[s+i+t]; a+=q*q; } d[t-lo]=a; }
  let i=0; for(let k=1;k<d.length;k++) if(d[k]<d[i]) i=k; if(i===0||i===d.length-1) return null;
  let t=lo+i; const den=d[i-1]-2*d[i]+d[i+1]; if(den!==0) t+=0.5*(d[i-1]-d[i+1])/den; return 69+12*Math.log2(SR/t/440); };
window.__windows=function(x,m,a,b,SR,floorDb){ const P=SR/(440*Math.pow(2,(m-69)/12)), W=Math.floor(Math.max(0.06*SR,3*P)), hi=Math.floor(P*Math.pow(2,1.5/12))+2, lv=[];
  let t=a; while(Math.floor(t*SR)+W+hi+1<=x.length && t<=b){ const s=Math.floor(t*SR); let e=0; for(let i=s;i<s+W;i++) e+=x[i]*x[i]; lv.push([s, Math.sqrt(e/W)+1e-12]); t+=0.01; }
  if(!lv.length) return []; const top=Math.max(...lv.map(q=>q[1])), out=[];
  lv.forEach(([s,l])=>{ if(floorDb!=null && 20*Math.log10(l/top)<floorDb) return; const v=__yinWin(x,s,m,W,SR); if(v!=null) out.push([v,l]); }); return out; };
window.__heard=function(x,m,SR){ let w=__windows(x,m,0.25,2.5,SR,null); if(w.length<5) w=__windows(x,m,0.02,2.5,SR,-20); if(!w.length) return null;
  const o=w.slice().sort((p,q)=>p[0]-q[0]); const tot=o.reduce((a,q)=>a+q[1],0); let cw=0, c=o[o.length-1][0];
  for(const q of o){ cw+=q[1]; if(cw>=tot/2){ c=q[0]; break; } }
  const sp=Math.sqrt(w.reduce((a,q)=>a+q[1]*(q[0]-c)*(q[0]-c),0)/tot); return {cents:(c-m)*100, spread:sp*100, n:w.length}; };
window.__finalize=function(x,m,SR){ const f=440*Math.pow(2,(m-69)/12), P=SR/f, lo=Math.floor(P*Math.pow(2,-1.5/12))-1, hi=Math.floor(P*Math.pow(2,1.5/12))+2;
  let a=Math.floor(0.06*SR), W=Math.floor(Math.min(0.5*SR, Math.max(4*hi, x.length-a-hi-1))); if(W<2*hi){ a=0; W=x.length-hi-1; }
  const d=new Float64Array(hi-lo+1); for(let t=lo;t<=hi;t++){ let e=0; for(let i=0;i<W;i++){ const q=x[a+i]-x[a+i+t]; e+=q*q; } d[t-lo]=e; }
  let i=0; for(let k=1;k<d.length;k++) if(d[k]<d[i]) i=k; let t=lo+i; if(i>0 && i<d.length-1) t+=0.5*(d[i-1]-d[i+1])/(d[i-1]-2*d[i]+d[i+1]);
  return (69+12*Math.log2(SR/t/440)-m)*100; };
/* one note through the page's own voice (no room: a bare bus), from where it starts (as the files are measured) */
window.__bare=function(oc){ const g=oc.createGain(); g.connect(oc.destination); return {c:oc, bus:g, send:oc.createGain()}; };
window.__note=async function(id,inst,m,v,art,secs){ const SR=32000; S.sound=id; await loadSound(id);
  const oc=new OfflineAudioContext(1,Math.ceil(SR*secs),SR), ch=__bare(oc);
  const vc=makeVoice(oc,ch,inst,m,v,0.05,art); if(!vc || !vc.natural) return null; if(art==="sus") vc.stop(secs-0.1, vc.tau);
  const d=(await oc.startRendering()).getChannelData(0); let pk=0; for(const q of d) pk=Math.max(pk,Math.abs(q));
  let i=0; while(i<d.length && Math.abs(d[i])<pk*0.03) i++; return d.slice(Math.max(0,i-Math.floor(0.002*SR))); };
/* how bright a sound is: its RMS frequency (from the energy of its slope), in Hz */
window.__bright=function(d,SR){ let e=0, s=0; for(let i=1;i<d.length;i++){ e+=d[i]*d[i]; const q=d[i]-d[i-1]; s+=q*q; } return Math.sqrt(s/e)*SR/(2*Math.PI); };`;
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  /* the grand's C chord, the level every music tool is set to (as level.js measures it) */
  let grand;
  { const p=await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto("http://localhost:9490/music-piano.html"); await p.waitForTimeout(600); await p.addScriptTag({content:MEASURE});
    grand=await p.evaluate(async()=>{ await loadSet("grand");
      const oc=new OfflineAudioContext(2, 44100*2.5, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,"grand"); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
      [60,64,67,48].forEach((m,j)=>{ const vc=makeVoice(oc,ch,"grand",m,0.74*(j===3?0.85:1),0.05); vc.stop(2.05, vc.tau); });
      return __kw(await oc.startRendering()); });
    await p.close(); }
  const c=await b.newContext(pw.devices["iPhone 13"]); const p=await c.newPage();
  const errs=[], bad=[], reqs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text()); });
  p.on("response",r=>{ if(r.status()>=400) bad.push(r.status()+" "+r.url()); });
  p.on("request",r=>{ const u=r.url(); const k=u.indexOf("/audio/band/"); if(k>=0) reqs.push(u.slice(k+12)); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9490/music-band.html"); await p.waitForTimeout(800);
  await p.addScriptTag({content:MEASURE}); await p.addScriptTag({content:PITCH});
  const sax=()=>reqs.filter(u=>FOLDERS.some(f=>u.indexOf(f+"/")===0));
  const take=()=>reqs.splice(0, reqs.length);
  const pick=async(id)=>{ take(); await p.selectOption("#soundSel", id); await p.waitForFunction(id=>soundReady(id) && setsOf(id).every(k=>SETS[k].done===SETS[k].total), id, {timeout:90000}).catch(()=>{});
    await p.waitForTimeout(150); return {ready:await p.evaluate(id=>soundReady(id), id), sets:await p.evaluate(()=>Object.keys(SETS).sort().join(",")), got:take()}; };

  /* 1. the menu: the soprano and the tenor sit beside the alto; three jazz styles; named by style, never by a player */
  await p.waitForFunction(()=>soundReady(S.sound), null, {timeout:30000});
  const menu=await p.evaluate(()=>{ const g={}; document.querySelectorAll("#soundSel optgroup").forEach(o=>{ g[o.label]=[...o.querySelectorAll("option")].map(x=>x.value); }); return g; });
  const ww=menu.Woodwinds||[], jz=menu.Jazz||[], names=await p.evaluate(NEW=>NEW.map(id=>soundName(id)), NEW);
  ok(ww.indexOf("sax")>0 && ww[ww.indexOf("sax")-1]==="soprano" && ww[ww.indexOf("sax")+1]==="tenor", "Woodwinds: the soprano, the alto and the tenor side by side: "+ww.join(" "));
  ok(["tenor_vib","tenor_modal","soprano_fusion"].every(id=>jz.indexOf(id)>=0), "Jazz has the three new styles: "+jz.join(" "));
  ok(names.join("|")==="Soprano saxophone|Tenor saxophone|Tenor sax · ballad, warm with vibrato|Tenor sax · modal jazz, big and strong|Soprano sax · jazz fusion, light and airy"
    && !/Coltrane|Shorter|Brett/.test(await p.evaluate(()=>document.body.innerText)), "named by style and instrument, never by a player: "+names.join(" | "));
  ok(await p.evaluate(()=>Object.keys(SOUNDS).length)===51, "The Band has 51 sounds: "+await p.evaluate(()=>Object.keys(SOUNDS).length));

  /* 2. loaded only when picked */
  ok(sax().length===0, "the page opens on the trumpet and fetches no saxophone: "+sax().slice(0,3).join(", "));
  take();
  let r=await pick("violins"); ok(r.ready && r.sets==="violins" && !r.got.some(u=>FOLDERS.some(f=>u.indexOf(f+"/")===0)), "the violins fetch no saxophone: "+r.sets);
  r=await pick("tenor"); const tf=new Set(r.got.filter(u=>u.indexOf("tenor/")===0));
  ok(r.ready && r.sets==="tenor" && tf.size===69 && r.got.every(u=>u.indexOf("tenor/")===0), "the tenor, picked, fetches its own 69 files and nothing else: "+tf.size+" files, sets "+r.sets);
  const ln=await p.textContent("#loadLine"); ok(/^Ready/.test(ln), "the line: "+ln);
  r=await pick("soprano"); const sf=new Set(r.got.filter(u=>u.indexOf("soprano/")===0));
  ok(r.ready && r.sets==="soprano" && sf.size===24 && r.got.every(u=>u.indexOf("soprano/")===0), "the soprano: its 24 files; the tenor is let go: sets "+r.sets);
  r=await pick("tenor_vib"); const vf=new Set(r.got.filter(u=>u.indexOf("tenor_vib/")===0)), vt=r.got.filter(u=>u.indexOf("tenor/")===0);
  const vb=await p.evaluate(()=>({held:Object.keys(SETS.tenor_vib.buf).filter(k=>/s$/.test(k)).length, short:Object.keys(SETS.tenor_vib.buf).filter(k=>/t$/.test(k)).length}));
  ok(r.ready && r.sets==="tenor_vib" && vf.size===19 && vt.every(u=>/t\.mp3$/.test(u)) && vb.held===19 && vb.short===23, "the ballad tenor: its 19 held notes and the tenor's 23 short ones: sets "+r.sets+", "+JSON.stringify(vb));
  r=await pick("tenor_modal"); ok(r.ready && r.sets==="tenor", "the modal tenor plays the tenor's recordings: sets "+r.sets);
  r=await pick("soprano_fusion"); ok(r.ready && r.sets==="soprano", "the fusion soprano plays the soprano's recordings: sets "+r.sets);
  r=await pick("bigband"); ok(r.ready && r.sets==="contrabass_pizz,kit,sax,tenor,trombone,trumpet" && !r.got.some(u=>/^(soprano|tenor_vib)\//.test(u)), "the big band loads the alto and the tenor, no soprano: sets "+r.sets);
  const who=await p.textContent("#loadLine"); ok(/alto and tenor saxes/.test(who), "the big band's line names its saxes: "+who);
  r=await pick("orchestra"); ok(r.ready && /lean:tenor/.test(r.sets) && /lean:soprano/.test(r.sets) && /lean:sax/.test(r.sets) && r.sets.split(",").length===19, "the orchestra has the soprano, alto and tenor, lean, 19 players: "+r.got.filter(u=>/^(tenor|soprano)\//.test(u)).length+" saxophone files");
  r=await pick("trumpet"); ok(r.ready && r.sets==="trumpet" && !r.got.some(u=>FOLDERS.some(f=>u.indexOf(f+"/")===0)), "back on the trumpet, no saxophone is kept or fetched: sets "+r.sets);

  /* 3. in tune across their reach: every semitone a held note (the pad's strength), and each recorded note soft; each
     short note. The test measures the page's own voices, as tune.py measured the files */
  const tun=await p.evaluate(async()=>{ const out={};
    for(const [id,inst] of [["tenor","tenor"],["tenor_vib","tenor_vib"],["soprano","soprano"]]){
      const [lo,hi]=rangeOf(inst), rows=[];
      for(let m=lo;m<=hi;m++){ const x=await __note(id,inst,m,0.74,"sus",2.7); const h=x&&__heard(x,m,32000); rows.push({m, v:0.74, c:h?+h.cents.toFixed(1):null, sp:h?+h.spread.toFixed(1):null}); }
      for(const m of MAN[inst].sus){ const x=await __note(id,inst,m,0.25,"sus",2.7); const h=x&&__heard(x,m,32000); rows.push({m, v:0.25, c:h?+h.cents.toFixed(1):null}); }
      if(inst!=="tenor_vib") for(const m of MAN[inst].stac){ const x=await __note(id,inst,m,0.74,"stac",1.2); rows.push({m, art:"stac", c:x?+__finalize(x,m,32000).toFixed(1):null}); }
      out[inst]=rows; }
    return out; });
  for(const inst of Object.keys(tun)){ const rows=tun[inst], held=rows.filter(q=>!q.art), st=rows.filter(q=>q.art), worst=q=>q.reduce((a,x)=>x.c!=null && Math.abs(x.c)>Math.abs(a)?x.c:a,0);
    const off=rows.filter(q=>q.c==null || Math.abs(q.c)>5), range=held.filter(q=>q.v===0.74).map(q=>q.m);
    ok(off.length===0, `${inst}: ${held.length} held notes (every semitone ${range[0]}-${range[range.length-1]}, and each recording soft) and ${st.length} short ones, all within 5 cents; held from ${Math.min(...held.map(q=>q.c)).toFixed(1)} to ${Math.max(...held.map(q=>q.c)).toFixed(1)}, short worst ${worst(st).toFixed(1)}`+(off.length?": OFF "+JSON.stringify(off.slice(0,6)):"")); }

  /* 4. as loud as the grand: each new sound's C chord, and the big band and the orchestra with them */
  const lv=await p.evaluate(async(ids)=>{ const out={};
    for(const id of ids){ S.sound=id; await loadSound(id); const oc=new OfflineAudioContext(2,44100*2.6,44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
      ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); const c={off:0,q:"maj"}; S.key=0;
      chordParts(c, voicing(c,null)).filter(q=>!q.dup).forEach(q=>{ const vc=makeVoice(oc,ch,q.inst,q.m,0.74*(q.bass?0.85:1),0.05,"sus"); if(vc) vc.stop(2.05, vc.tau); });
      out[id]=+__kw(await oc.startRendering()).toFixed(2); }
    return out; }, NEW.concat(["bigband","orchestra"]));
  ok(Object.values(lv).every(v=>Math.abs(v-grand)<=0.5), "each C chord within 0.5 dB of the grand's "+grand.toFixed(2)+" dB: "+JSON.stringify(lv));

  /* 5. the styles differ: the ballad has vibrato and the plain tenor none; the fusion soprano is darker at the pads'
     strength (it leans on the soft, breathy recording) and the modal tenor brighter at a light touch (it leans on the
     loud one), each by 3% or more */
  const sty=await p.evaluate(async()=>{ const spread=async(id,inst)=>{ const v=[]; for(const m of [52,60,66,72]){ const x=await __note(id,inst,m,0.74,"sus",2.7); v.push(__heard(x,m,32000).spread); } v.sort((a,b)=>a-b); return (v[1]+v[2])/2; };
    const bright=async(id,vel)=>{ S.sound=id; await loadSound(id); const SR=32000, oc=new OfflineAudioContext(1,SR*2,SR), ch=__bare(oc);
      const c={off:0,q:"maj"}; S.key=0; chordParts(c, voicing(c,null)).filter(q=>!q.dup).forEach(q=>{ const vc=makeVoice(oc,ch,q.inst,q.m,vel,0.05,"sus"); if(vc) vc.stop(1.9, vc.tau); });
      return Math.round(__bright((await oc.startRendering()).getChannelData(0), SR)); };
    return {vib:+(await spread("tenor_vib","tenor_vib")).toFixed(1), plain:+(await spread("tenor","tenor")).toFixed(1),
      soprano:await bright("soprano",0.74), fusion:await bright("soprano_fusion",0.74), tenor:await bright("tenor",0.3), modal:await bright("tenor_modal",0.3),
      rev:[SOUNDS.tenor.rev, SOUNDS.tenor_vib.rev, SOUNDS.tenor_modal.rev, SOUNDS.soprano.rev, SOUNDS.soprano_fusion.rev]}; });
  ok(sty.vib>=3 && sty.vib>3*sty.plain, "the ballad tenor sings with vibrato (pitch spread "+sty.vib+" cents), the plain tenor holds still ("+sty.plain+" cents)");
  ok(sty.fusion<0.97*sty.soprano && sty.modal>1.03*sty.tenor, "the fusion soprano is darker than the soprano ("+sty.fusion+" Hz against "+sty.soprano+"), the modal tenor brighter than the tenor ("+sty.modal+" against "+sty.tenor+"); rooms "+sty.rev.join(", "));

  /* 6. pads and keys play real notes; the big band's sax section and the orchestra's saxophones */
  await p.evaluate(()=>{ window.__v=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch,inst,m,v,when,art){ const r=mv.apply(this,arguments); if(cx===ac) window.__v.push({inst, m, real:!!(r&&r.natural)}); return r; }; });
  for(const id of NEW.concat(["bigband","orchestra"])){
    await pick(id); await p.evaluate(()=>{ __v=[]; S.key=0; if(S.minor) document.getElementById("majBtn").click(); lastVoicing=null; padDown(0,0.74); }); await p.waitForTimeout(120); await p.evaluate(()=>padUp(0));
    const v=await p.evaluate("__v"), want=id==="bigband"?["sax","tenor"]:id==="orchestra"?["sax","tenor","soprano"]:[];
    ok(v.length>=3 && v.every(x=>x.real) && want.every(w=>v.some(x=>x.inst===w)), id+": pad C plays "+v.map(x=>x.inst+x.m).join(" "));
  }
  await pick("tenor"); await p.evaluate("__v=[]");
  await p.locator("#kbd").scrollIntoViewIfNeeded(); const keys=await p.locator("#kbd .wk:not(.out)").all();
  for(const k of [keys[0], keys[keys.length-1]]){ const bb=await k.boundingBox(); await p.touchscreen.tap(bb.x+bb.width/2, bb.y+bb.height*0.7); await p.waitForTimeout(120); }
  const kv=await p.evaluate("__v"); ok(kv.length===2 && kv.every(x=>x.real && x.inst==="tenor"), "two keys on the tenor, two real notes: "+kv.map(x=>x.m).join(", ")+" (keys "+await p.textContent("#rangeOut")+")");

  /* 7. offline renders: Send to the turntables with the modal tenor, and chords for the drum machine from the soprano */
  await pick("tenor_modal"); await p.selectOption("#progSel","jazz"); await p.selectOption("#rhythmSel","swell");
  await p.click("#sendBtn"); await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("sendLine").textContent), null, {timeout:90000});
  const sh=await p.evaluate(async()=>{ const x=await AOGHandoff.get("bandbench"); if(!x) return null; const buf=await new OfflineAudioContext(2,1,44100).decodeAudioData(await x.wav.arrayBuffer()), d=buf.getChannelData(0);
    let pk=0, ss=0, hot=0; for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); pk=Math.max(pk,a); ss+=d[i]*d[i]; if(a>0.985) hot++; }
    return {name:x.name, bars:x.bars, secs:+buf.duration.toFixed(1), peak:+pk.toFixed(2), rmsDb:+(10*Math.log10(ss/d.length)).toFixed(1), hot}; });
  ok(sh && /Tenor sax · modal jazz/.test(sh.name) && sh.secs>15 && sh.peak>0.2 && sh.hot<50 && sh.rmsDb>-35, "Send to the turntables renders the modal tenor offline: "+JSON.stringify(sh));
  await pick("soprano"); await p.click("#padsBtn"); await p.waitForFunction(()=>/Sent|did not/.test(document.getElementById("padsLine").textContent), null, {timeout:60000});
  const cp=await p.evaluate(async()=>{ const x=await AOGHandoff.get("padschords"); return x && {from:x.from, inst:x.inst, bank:x.bank}; });   /* AOG-SEND-TO-PADS-V1 */
  ok(cp && cp.from==="band" && cp.inst==="b:soprano" && cp.bank==="chords", "the soprano's chords go to the Drum Machine as the soprano: "+JSON.stringify(cp));

  /* 8. Spanish */
  await pick("bigband");
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  const es=await p.evaluate(NEW=>({names:NEW.map(id=>[...document.querySelectorAll("#soundSel option")].find(o=>o.value===id).textContent), lang:document.documentElement.lang,
    groups:[...document.querySelectorAll("#soundSel optgroup")].map(o=>o.label).join("|"), line:document.getElementById("loadLine").textContent, foot:document.getElementById("foot").textContent}), NEW);
  ok(es.lang==="es" && es.names.join("|")==="Saxofón soprano|Saxofón tenor|Saxo tenor · balada, cálido con vibrato|Saxo tenor · jazz modal, grande y fuerte|Saxo soprano · jazz fusión, ligero y aireado"
    && es.groups==="Metales|Maderas|Cuerdas|Percusión|Jazz|Bandas|Todos", "in Spanish: "+es.names.join(" | "));
  ok(/saxos alto y tenor/.test(es.line) && /Los saxofones tenor y soprano vienen de su Versilian Community Sample Library/.test(es.foot), "the big band's line and the credits in Spanish: "+es.line+" / "+es.foot.slice(0,60)+"…");
  /* 9. a phone: nothing sticks out sideways, in Spanish and in English, on the tenor */
  await pick("tenor");
  let w=await p.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth})); ok(w.sw<=w.iw, "in Spanish on a phone, nothing sticks out sideways "+JSON.stringify(w));
  await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(250);
  w=await p.evaluate(()=>({sw:document.scrollingElement.scrollWidth, iw:innerWidth})); ok(w.sw<=w.iw, "and in English "+JSON.stringify(w));
  const foot=await p.textContent("#foot"); ok(/The tenor and soprano saxophones come from their Versilian Community Sample Library/.test(foot) && /All three are given to everyone/.test(foot), "the credits name the library: "+foot.slice(0,80)+"…");
  await p.evaluate(()=>scrollTo(0,0)); await p.screenshot({path:"sax2-phone.png", fullPage:true});
  /* 10. a reload keeps the tenor and fetches only its files */
  await p.reload(); await p.waitForTimeout(600);
  await p.waitForFunction(()=>soundReady("tenor") && SETS.tenor.done===SETS.tenor.total, null, {timeout:60000}).catch(()=>{});
  const back=await p.evaluate(()=>performance.getEntriesByType("resource").map(e=>e.name).filter(u=>u.indexOf("/audio/band/")>=0 && /\.mp3$/.test(u)).map(u=>u.slice(u.indexOf("/audio/band/")+12)));
  ok(await p.evaluate(()=>S.sound==="tenor" && Object.keys(SETS).join()==="tenor") && back.length===69 && back.every(u=>u.indexOf("tenor/")===0), "after a reload: the tenor again, and only its 69 files: "+back.length);
  ok(errs.length===0, "no page errors: "+errs.slice(0,5).join(" | "));
  ok(bad.length===0, "no failed requests: "+bad.slice(0,5).join(" | "));
  await b.close(); srv.close(); console.log(fails?`${fails} FAILED`:"ALL PASS"); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
