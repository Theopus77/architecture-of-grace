/* the eighteen chord patterns: the menu, the chords each one loads (as the manual lists them), playing, the wheel walk, Spanish */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("./srv.js")(9981);
let fails=0, passes=0; function ok(c,m){ if(c){ passes++; console.log("PASS "+m); } else { fails++; console.log("FAIL "+m); } }
const WANT={pop:"C G Am F", fifties:"C Am F G", sadpop:"Am F C G", anime:"F G Em Am", canon:"C G Am Em F C F G", three:"C F G C", fiesta:"C F G F",
  rock:"C B♭ F C", hymn:"C F C G", wheel:"E7 A7 D7 G7 C C", blues:"C7 C7 C7 C7 F7 F7 C7 C7 G7 F7 C7 G7", jazz:"Dm7 G7 Cmaj7 Cmaj7", turn:"Cmaj7 Am7 Dm7 G7",
  mblues:"Am7 Am7 Am7 Am7 Dm7 Dm7 Am7 Am7 E7 Dm7 Am7 E7", minor:"Am F C G", flamenco:"Am G F E", mfolk:"Am Dm E Am", epic:"Am G F G"};
(async()=>{
  const b=await pw.chromium.launch();
  const c=await b.newContext({viewport:{width:1024,height:768}}); await c.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await c.addInitScript(()=>{ if(!sessionStorage.getItem("s")){ sessionStorage.setItem("s","1"); localStorage.setItem("aog.lang","en"); localStorage.setItem("aog.piano.v1", JSON.stringify({sound:"epwarm",key:0,minor:false,prog:[],preset:"",rhythm:"hold",bpm:160,oct:3,era:0,vol:0.8})); } });
  const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:9981/music-piano.html"); await p.waitForTimeout(1000);
  const menu=await p.evaluate(()=>{ const s=document.getElementById("progSel"); return {groups:[...s.querySelectorAll("optgroup")].map(g=>g.label+" ("+g.querySelectorAll("option").length+")"), n:s.querySelectorAll("optgroup option").length, first:s.options[0].text}; });
  ok(menu.n===18, "18 patterns in the menu");
  ok(menu.groups.join(" | ")==="Pop, rock and folk (10) | Blues and jazz (4) | Minor and moody (4)", "in three groups: "+menu.groups.join(" | "));
  ok(menu.first==="Choose a pattern…", "the menu still starts with: "+menu.first);
  for(const id of Object.keys(WANT)){
    const minor=await p.evaluate(id=>PRESETS.find(x=>x.id===id).minor, id);
    await p.selectOption("#keySel", minor?"9":"0"); await p.waitForTimeout(30);
    await p.selectOption("#progSel", id); await p.waitForTimeout(40);
    const r=await p.evaluate(()=>({names:[...document.querySelectorAll("#prog .slot")].map(x=>x.textContent).join(" "), minor:S.minor, preset:S.preset}));
    ok(r.names===WANT[id] && r.preset===id && r.minor===minor, `${id}: ${r.names}${minor?" (A minor)":""}`+(r.names!==WANT[id]?"   wanted: "+WANT[id]:""));
    await p.click("#playBtn"); await p.waitForTimeout(160);
    const played=await p.evaluate(()=>S.playing && PLAY.voices.length>0); await p.click("#playBtn"); await p.waitForTimeout(40);
    if(!played) ok(false, id+" plays");
  }
  ok(true, "every pattern plays");
  /* around the wheel: each bar is one step round the outside of the wheel, back home to C */
  await p.selectOption("#keySel","0"); await p.selectOption("#progSel","wheel"); await p.waitForTimeout(40);
  const walk=await p.evaluate(()=>S.prog.map(c=>wheelKeyOf(c)).join(" "));
  ok(walk==="o4 o3 o2 o1 o0 o0", "Around the wheel lights E, A, D, G, then C: one step at a time ("+walk+")");
  await p.click("#playBtn"); await p.waitForFunction(()=>PLAY.cur===1, null, {timeout:5000}); await p.waitForTimeout(30);
  ok(await p.evaluate(()=>document.querySelector('#wheel .wd.now').getAttribute("data-k"))==="o3", "and while it plays, the orange is on A7 in bar 2");
  await p.click("#playBtn");
  /* the rock pattern's B♭ is outside the key, spelled B♭ and lit on the wheel */
  await p.selectOption("#progSel","rock"); await p.waitForTimeout(30);
  ok(await p.evaluate(()=>wheelKeyOf(S.prog[1])==="o10" && !pads().some(x=>x.off===10)), "Rock's B♭ is not a pad, and it has its own place on the wheel");
  /* Spanish */
  await p.evaluate(()=>{ S.lang="es"; save(); paintText(); }); await p.waitForTimeout(80);
  const es=await p.evaluate(()=>{ const s=document.getElementById("progSel"); return {groups:[...s.querySelectorAll("optgroup")].map(g=>g.label).join(" | "), names:[...s.querySelectorAll("optgroup option")].map(o=>o.text)}; });
  ok(es.groups==="Pop, rock y folk | Blues y jazz | Menor y melancólico", "in Spanish: "+es.groups);
  ok(es.names.includes("Himno y góspel · 1 4 1 5") && es.names.includes("Por la rueda · 3 6 2 5 1") && es.names.includes("Épico"), "the new patterns have Spanish names (the minor ones by name, AOG-PADS-1TO6-V1)");
  ok(errs.length===0, "no page errors "+errs.join(" | "));
  console.log((fails?fails+" FAILED, ":"")+passes+" passed");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
