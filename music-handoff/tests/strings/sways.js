/* AOG-STRINGS-WAYS-V1: the guitar's 21 ways and the bass's 19, and the 44 chord patterns, on both pages (an iPhone 13):
   1. the menus: the ways in four groups, the patterns in five (pop, rock, soul, jazz, minor), English and Spanish; the 18 old
      patterns unchanged; minor patterns go by name;
   2. every way with every pattern, scheduled (straight and swung, the hand at frets 1 and 5): notes in every bar, each in the
      chord (or marked as a step on the way / an early note of the next chord), on frets on screen, no string twice at once,
      never two strings in the same millisecond, one note at a time on a string; on the bass, a note on the way is a step from
      a neighbour in the line;
   3. the same ways worked out for every chord at every place the hand can be (phone, iPad, computer): the strings of every
      strum 15 to 40 ms apart; and every pattern chord in every key has a shape the hand can reach;
   4. a strum is a hand: folk's down strums go low to high and its up strums high to low, and they sound different; the pads
      strum 15 to 40 ms apart; fingerpicking is the thumb, then strings 3, 2, 1;
   5. the bass leaves the root: Walk on a 12-bar blues at 90 has rests and changes bar to bar; Steady, Driving, Root and
      fifth, Octaves as Jimmy asked; the 12-bar patterns loop;
   6. a waltz bar has three beats; swing where it should be; the tempo;
   7. live: each way plays with its orange notes; the bass line's notes light as they come and never glide by themselves;
      Spanish; a reload keeps the way; Send makes a waltz recording. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9978);
let fails=0; const ok=(c,m)=>{ console.log((c?"PASS ":"FAIL ")+m); if(!c) fails++; };
const WANT={guitar:{n:21, groups:[5,4,7,5], es:"Rasgueos | Punteos | Rock y metal | Ritmos del mundo"},
            bass:{n:19, groups:[5,5,4,5], es:"Firmes | Líneas que se mueven | Rock y metal | Ritmos del mundo"}};
/* the eighteen patterns as they were before this change (HEAD 470e18a2), to prove they did not move */
const OLD18=[{"id":"pop","g":"pop","en":"Pop · 1 5 6 4","es":"Pop · 1 5 6 4","minor":false,"chords":[{"off":0,"q":"maj"},{"off":7,"q":"maj"},{"off":9,"q":"min"},{"off":5,"q":"maj"}]},{"id":"fifties","g":"pop","en":"Fifties · 1 6 4 5","es":"Años 50 · 1 6 4 5","minor":false,"chords":[{"off":0,"q":"maj"},{"off":9,"q":"min"},{"off":5,"q":"maj"},{"off":7,"q":"maj"}]},{"id":"sadpop","g":"pop","en":"Sad pop · 6 4 1 5","es":"Pop triste · 6 4 1 5","minor":false,"chords":[{"off":9,"q":"min"},{"off":5,"q":"maj"},{"off":0,"q":"maj"},{"off":7,"q":"maj"}]},{"id":"anime","g":"pop","en":"Anime and J-pop · 4 5 3 6","es":"Anime y J-pop · 4 5 3 6","minor":false,"chords":[{"off":5,"q":"maj"},{"off":7,"q":"maj"},{"off":4,"q":"min"},{"off":9,"q":"min"}]},{"id":"canon","g":"pop","en":"Canon · 8 chords","es":"Canon · 8 acordes","minor":false,"chords":[{"off":0,"q":"maj"},{"off":7,"q":"maj"},{"off":9,"q":"min"},{"off":4,"q":"min"},{"off":5,"q":"maj"},{"off":0,"q":"maj"},{"off":5,"q":"maj"},{"off":7,"q":"maj"}]},{"id":"three","g":"pop","en":"Three chords · 1 4 5 1","es":"Tres acordes · 1 4 5 1","minor":false,"chords":[{"off":0,"q":"maj"},{"off":5,"q":"maj"},{"off":7,"q":"maj"},{"off":0,"q":"maj"}]},{"id":"fiesta","g":"pop","en":"Fiesta · 1 4 5 4","es":"Fiesta · 1 4 5 4","minor":false,"chords":[{"off":0,"q":"maj"},{"off":5,"q":"maj"},{"off":7,"q":"maj"},{"off":5,"q":"maj"}]},{"id":"rock","g":"pop","en":"Rock · 1 ♭7 4 1","es":"Rock · 1 ♭7 4 1","minor":false,"chords":[{"off":0,"q":"maj"},{"off":10,"q":"maj"},{"off":5,"q":"maj"},{"off":0,"q":"maj"}]},{"id":"hymn","g":"pop","en":"Hymn and gospel · 1 4 1 5","es":"Himno y góspel · 1 4 1 5","minor":false,"chords":[{"off":0,"q":"maj"},{"off":5,"q":"maj"},{"off":0,"q":"maj"},{"off":7,"q":"maj"}]},{"id":"wheel","g":"pop","en":"Around the wheel · 3 6 2 5 1","es":"Por la rueda · 3 6 2 5 1","minor":false,"chords":[{"off":4,"q":"dom7"},{"off":9,"q":"dom7"},{"off":2,"q":"dom7"},{"off":7,"q":"dom7"},{"off":0,"q":"maj"},{"off":0,"q":"maj"}]},{"id":"blues","g":"jazz","en":"Blues · 12 bars","es":"Blues · 12 compases","minor":false,"chords":[{"off":0,"q":"dom7"},{"off":0,"q":"dom7"},{"off":0,"q":"dom7"},{"off":0,"q":"dom7"},{"off":5,"q":"dom7"},{"off":5,"q":"dom7"},{"off":0,"q":"dom7"},{"off":0,"q":"dom7"},{"off":7,"q":"dom7"},{"off":5,"q":"dom7"},{"off":0,"q":"dom7"},{"off":7,"q":"dom7"}]},{"id":"jazz","g":"jazz","en":"Jazz · 2 5 1","es":"Jazz · 2 5 1","minor":false,"chords":[{"off":2,"q":"m7"},{"off":7,"q":"dom7"},{"off":0,"q":"maj7"},{"off":0,"q":"maj7"}]},{"id":"turn","g":"jazz","en":"Jazz turnaround · 1 6 2 5","es":"Vuelta de jazz · 1 6 2 5","minor":false,"chords":[{"off":0,"q":"maj7"},{"off":9,"q":"m7"},{"off":2,"q":"m7"},{"off":7,"q":"dom7"}]},{"id":"mblues","g":"jazz","en":"Minor blues · 12 bars","es":"Blues menor · 12 compases","minor":true,"chords":[{"off":0,"q":"m7"},{"off":0,"q":"m7"},{"off":0,"q":"m7"},{"off":0,"q":"m7"},{"off":5,"q":"m7"},{"off":5,"q":"m7"},{"off":0,"q":"m7"},{"off":0,"q":"m7"},{"off":7,"q":"dom7"},{"off":5,"q":"m7"},{"off":0,"q":"m7"},{"off":7,"q":"dom7"}]},{"id":"minor","g":"min","en":"Minor groove","es":"Ritmo menor","minor":true,"chords":[{"off":0,"q":"min"},{"off":8,"q":"maj"},{"off":3,"q":"maj"},{"off":10,"q":"maj"}]},{"id":"flamenco","g":"min","en":"Flamenco","es":"Flamenco","minor":true,"chords":[{"off":0,"q":"min"},{"off":10,"q":"maj"},{"off":8,"q":"maj"},{"off":7,"q":"maj"}]},{"id":"mfolk","g":"min","en":"Minor folk","es":"Folk menor","minor":true,"chords":[{"off":0,"q":"min"},{"off":5,"q":"min"},{"off":7,"q":"maj"},{"off":0,"q":"min"}]},{"id":"epic","g":"min","en":"Epic","es":"Épico","minor":true,"chords":[{"off":0,"q":"min"},{"off":10,"q":"maj"},{"off":8,"q":"maj"},{"off":10,"q":"maj"}]}];
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  for(const inst of ["guitar","bass"]){
    const c=await b.newContext(pw.devices["iPhone 13"]); const p=await c.newPage();
    const errs=[]; p.on("pageerror",e=>errs.push(e.message));
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9978/music-${inst}.html`); await p.waitForTimeout(1000);
    console.log("== "+inst);
    const W=WANT[inst];

    /* 1. the menus */
    const menu=await p.evaluate(()=>{ const gs=[...document.querySelectorAll("#rhythmSel optgroup")];
      return {groups:gs.map(g=>g.label+" ("+g.querySelectorAll("option").length+"): "+[...g.querySelectorAll("option")].map(o=>o.textContent).join(" | ")),
        sizes:gs.map(g=>g.querySelectorAll("option").length), ids:gs.flatMap(g=>[...g.querySelectorAll("option")].map(o=>o.value)), rhythms:RHYTHMS.slice(),
        loose:document.querySelectorAll("#rhythmSel > option").length,
        words:RHYTHMS.filter(r=>!(RHYTHM_WORDS[r] && / · \S/.test(RHYTHM_WORDS[r].en) && / · \S/.test(RHYTHM_WORDS[r].es) && RHYTHM_WORDS[r].en!==RHYTHM_WORDS[r].es)),
        first:RHYTHMS[0]}; });
    ok(menu.ids.length===W.n && new Set(menu.ids).size===W.n && menu.ids.join()===menu.rhythms.join() && menu.loose===0 && menu.sizes.join()===W.groups.join(),
      `${W.n} ways, each once, in 4 groups (${menu.sizes.join("/")}):\n   `+menu.groups.join("\n   "));
    ok(menu.words.length===0, "every way has a name and a short line in English and in Spanish"+(menu.words.length?": missing "+menu.words.join(","):""));
    ok(menu.first===(inst==="guitar"?"hold":"root"), "the first way is still the first: "+menu.first);
    const pm=await p.evaluate((old)=>{ const gs=[...document.querySelectorAll("#progSel optgroup")];
      const same=old.every(o=>{ const n=PRESETS.find(x=>x.id===o.id); return n && JSON.stringify({id:n.id,g:n.g,en:n.en,es:n.es,minor:n.minor,chords:n.chords})===JSON.stringify(o); });
      const fresh=PRESETS.filter(x=>!old.some(o=>o.id===x.id));
      return {n:PRESETS.length, ids:new Set(PRESETS.map(x=>x.id)).size, labels:gs.map(g=>g.label), sizes:gs.map(g=>g.querySelectorAll("option").length),
        opts:document.querySelectorAll("#progSel optgroup option").length, same, fresh:fresh.length,
        minorNames:PRESETS.filter(x=>x.minor && /[♭♯]?\d+m? [♭♯]?\d/.test(x.en+" "+x.es)).map(x=>x.id), words:fresh.filter(x=>!(x.en && x.es)).map(x=>x.id),
        chords:PRESETS.every(x=>x.chords.length>0 && x.chords.every(c=>Q[c.q] && c.off>=0 && c.off<12)),
        groups:PRESETS.map(x=>x.g).filter((g,i,a)=>i===0||a[i-1]!==g).join(",")}; }, OLD18);
    ok(pm.n===44 && pm.ids===44 && pm.fresh===26 && pm.same && pm.opts===44 && pm.labels.join(" | ")==="Pop, rock and folk | Rock and metal | Soul, funk and dance | Blues and jazz | Minor and moody" && pm.groups==="pop,rock,soul,jazz,min",
      `44 chord patterns in 5 groups (${pm.sizes.join("/")}): ${pm.labels.join(" | ")}; the 18 old ones unchanged`);
    ok(pm.minorNames.length===0 && pm.words.length===0 && pm.chords, "minor patterns go by name, not chord numbers; every new one has English and Spanish; every chord is one of the five kinds"+(pm.minorNames.length?": numbered "+pm.minorNames.join(","):"")+(pm.words.length?": words missing "+pm.words.join(","):""));

    /* 2. every way × every pattern, scheduled */
    const mx=await p.evaluate(()=>{
      const keep=[S.preset,S.prog,S.minor,S.rhythm,S.key,S.fret0], out=[], iv=(a,b)=>((a-b)%12+12)%12; let pairs=0, notes=0;
      for(const [f0,sw] of [[1,0.5],[5,0.64]]){
        S.fret0=f0;
        for(const pr of PRESETS){
          const oc=new OfflineAudioContext(2, 44100, 44100), ch=makeChain(oc);
          for(const rh of RHYTHMS){
            S.preset=pr.id; S.prog=pr.chords.map(c=>({off:c.off,q:c.q})); S.minor=pr.minor; S.rhythm=rh; S.key=pr.minor?9:0;
            const bpb=beatsPerBar(), barSec=bpb*0.5, bad=[], all=[]; pairs++;
            for(let k=0;k<S.prog.length;k++){
              const t0=k*barSec, vs=scheduleBar(oc, ch, k, t0, barSec, sw), chord=S.prog[k], next=S.prog[(k+1)%S.prog.length], pcs=chordPcs(chord), npcs=chordPcs(next), seen={}, ms={};
              notes+=vs.length;
              if(!vs.length) bad.push("bar "+(k+1)+" silent");
              vs.forEach(v=>{
                const [s,f]=(v.cell||"-1:-1").split(":").map(Number);
                if(s<0) bad.push("no place on the neck for "+v.m);
                else {
                  if(!(f===0 ? S.fret0<=2 : (f>=S.fret0 && f<=S.fret0+NECK.n-1))) bad.push("fret "+f+" is off the frets on screen");
                  if(TUNING[s]+f!==v.m) bad.push("the place on the neck is not the note");
                  const id=s+"@"+Math.round(v.on*1000); if(seen[id]) bad.push("string "+s+" started twice at once"); seen[id]=1;
                }
                const at=Math.round(v.on*1000); if(ms[at]) bad.push("two strings in the same millisecond"); ms[at]=1;
                if(v.on<t0-1e-6 || v.on>=t0+barSec-1e-6) bad.push("a note starts outside its bar");
                if(!(v.off>v.on)) bad.push("a note ends before it starts");
                const pc=v.m%12;
                if(v.role==="ant"){ if(npcs.indexOf(pc)<0) bad.push("the early note "+v.m+" is not in the next chord"); }
                else if(v.role==="pass"){ if(GTR && [9,10,11].indexOf(iv(pc,pcs[0]))<0) bad.push("the note on the way "+v.m+" is out of place"); }
                else if(pcs.indexOf(pc)<0) bad.push(v.m+" is not in "+chordName(chord));
                all.push({s:s, on:v.on, off:v.off, m:v.m, role:v.role});
              });
            }
            const per={}; all.forEach(x=>(per[x.s]=per[x.s]||[]).push(x));
            Object.values(per).forEach(l=>{ l.sort((a,b)=>a.on-b.on); for(let i=1;i<l.length;i++) if(l[i].on<l[i-1].off-0.03) bad.push("string "+l[i].s+" plays two notes at once"); });
            if(!GTR){ const n0=S.prog.length, after=lineEvents(rh, S.prog[0], S.prog[1%n0], n0).slice().sort((x,y)=>x.t-y.t)[0].m, L=all.slice().sort((a,b)=>a.on-b.on);
              L.forEach((v,i)=>{ if(v.role!=="pass") return; const a=i?L[i-1].m:null, z=L[i+1]?L[i+1].m:after;
                if(!(a!=null && Math.abs(v.m-a)<=2) && Math.abs(v.m-z)>2) bad.push("the note on the way "+v.m+" is not a step from "+a+" or "+z); }); }
            if(bad.length) out.push("fret "+f0+", swing "+sw+", "+pr.id+", "+rh+": "+[...new Set(bad)].slice(0,3).join("; "));
          }
        }
      }
      [S.preset,S.prog,S.minor,S.rhythm,S.key,S.fret0]=keep;
      return {pairs, notes, out};
    });
    ok(mx.pairs===44*W.n*2 && mx.out.length===0, `${mx.pairs} plays (44 patterns × ${W.n} ways × at fret 1 straight and fret 5 swung), ${mx.notes} notes: all in place`+(mx.out.length?"\n   "+mx.out.slice(0,8).join("\n   "):""));

    /* 3. every chord, every place the hand can be, every way (worked out, not played) */
    const sweep=await p.evaluate(()=>{
      const keep=[NECK.n,S.fret0,S.key,S.rhythm,S.sound], out=[], iv=(a,b)=>((a-b)%12+12)%12, shapeBad=new Set(); let checked=0, gaps=0;
      for(const snd of (GTR?["steel","metal"]:[S.sound])) for(const n of (GTR?[4,5,12]:[5,6,12])){ NECK.n=n; S.sound=snd;
        for(let f0=1; f0<=MAXF-n+1; f0++){ S.fret0=f0; const a=f0, z=f0+n-1, reach=f=>f===0 ? a<=2 : (f>=a && f<=z);
          for(let root=0; root<12; root++) for(const q of Object.keys(Q)){ S.key=0; const c={off:root,q:q}, pcs=chordPcs(c);
            for(const nx of [{off:(root+5)%12,q:"maj"},{off:(root+10)%12,q:"min"}]){ const npcs=chordPcs(nx);
              for(const rh of RHYTHMS){ S.rhythm=rh; const bpb=beatsPerBar();
                for(const k of (GTR?[0]:[0,1,2,3])){ checked++; const bad=[];
                if(GTR){
                  const shp=shapeFor(c), plan=strumPlan(shp, rh, c), seen={}, byT={};
                  const shapeOk=shp.every((f,s)=>f<0 || pcs.indexOf((TUNING[s]+f)%12)>=0);
                  if(!shapeOk) shapeBad.add(`${snd} n${n} at ${f0}: ${KEY_NAMES.en[root]}${q} ${shp.map(x=>x<0?"x":x).join("")}`);
                  if(!plan.length) bad.push("nothing to play");
                  plan.forEach(h=>{ const f=h.f!=null?h.f:shp[h.s], m=TUNING[h.s]+f, pc=m%12;
                    if(!(f>=0) || !reach(f)) bad.push("fret "+f+" out of reach");
                    if(h.role==="pass"){ if([9,10,11].indexOf(iv(pc,pcs[0]))<0) bad.push("note on the way "+m); } else if(pcs.indexOf(pc)<0 && (shapeOk || h.f!=null)) bad.push(m+" not in the chord");
                    if(seen[h.s+"@"+h.t]) bad.push("string twice at once"); seen[h.s+"@"+h.t]=1;
                    if(!(h.t>=0 && h.t<bpb && h.end>h.t && h.end<=bpb)) bad.push("outside the bar");
                    (byT[h.t]=byT[h.t]||[]).push(h.off); });
                  /* a strum is a hand: the strings sounding at one moment come 15 to 40 ms apart */
                  Object.values(byT).forEach(o=>{ o.sort((x,y)=>x-y); if(o[0]!==0) bad.push("a moment does not start on time"); for(let i=1;i<o.length;i++){ gaps++; const g=(o[i]-o[i-1])*1000; if(g<14.9 || g>40.1) bad.push("strings "+g.toFixed(1)+" ms apart"); } });
                } else {
                  const evs=lineEvents(rh, c, nx, k).slice().sort((x,y)=>x.t-y.t), nextFirst=lineEvents(rh, nx, c, k+1).slice().sort((x,y)=>x.t-y.t)[0].m, seen={};
                  if(!evs.length) bad.push("nothing to play");
                  evs.forEach((e,i)=>{ const cl=cellFor(e.m), pc=e.m%12;
                    if(!cl || !reach(cl.f)) bad.push("note "+e.m+" off the frets on screen");
                    if(e.role==="ant"){ if(npcs.indexOf(pc)<0) bad.push("early note "+e.m); }
                    else if(e.role==="pass"){ const before=i?evs[i-1].m:null, after=i<evs.length-1?evs[i+1].m:nextFirst;
                      if(!((before!=null && Math.abs(e.m-before)<=2) || Math.abs(e.m-after)<=2)) bad.push("note on the way "+e.m+" is not a step from "+before+" or "+after); }
                    else if(pcs.indexOf(pc)<0) bad.push(e.m+" not in the chord");
                    if(seen[e.t]) bad.push("two notes at once"); seen[e.t]=1;
                    if(!(e.t>=0 && e.t<bpb && e.d>0)) bad.push("outside the bar"); });
                }
                if(bad.length) out.push(`${snd} n${n} at ${f0}: ${KEY_NAMES.en[root]}${q}→${KEY_NAMES.en[nx.off]}${nx.q} ${rh}${GTR?"":" bar "+(k+1)}: ${[...new Set(bad)].slice(0,2).join("; ")}`);
              } } } } } }
      [NECK.n,S.fret0,S.key,S.rhythm,S.sound]=keep; VOICINGS.clear();
      return {checked, gaps, out, shapeBad:[...shapeBad]};
    });
    ok(sweep.out.length===0, `${sweep.checked} chord × place × way plans: every note on the frets on screen, in the chord or marked, no string twice at once`+(GTR(inst)?`, and ${sweep.gaps} string-to-string gaps all 15 to 40 ms`:", each note on the way a step from its neighbour")+(sweep.out.length?"\n   "+sweep.out.slice(0,8).join("\n   "):""));
    /* the chord shapes the ways play (not part of the ways): with the heavy metal sound, a power chord rooted on the D string
       is built as fret f, f+2, f+2 on D, G and B, but the B string sits a third above G, so its top note comes out a half step
       flat (D A C♯). powerFor in strings_page.html; the fix is f+3 on the B string. Reported to the lead, not changed here. */
    if(inst==="guitar") ok(sweep.shapeBad.length===0, `the chord shapes themselves are right (steel and heavy metal, every chord and place)`+(sweep.shapeBad.length?`: ${sweep.shapeBad.length} power chords have a wrong note (powerFor, pre-existing), e.g.\n   `+sweep.shapeBad.slice(0,4).join("\n   "):""));

    /* every chord of every pattern, in every key: a shape the hand can reach (the guitar), with the hand where a phone and a
       computer start (the nut) and up the neck */
    if(inst==="guitar"){
      const ks=await p.evaluate(()=>{ const keep=[NECK.n,S.fret0,S.key,S.minor,S.sound], bad=[]; let n0=0; S.sound="steel";
        for(const n of [4,5,12]) for(const f0 of [1,3,5,8]){ if(f0>MAXF-n+1) continue; NECK.n=n; S.fret0=f0;
          for(const pr of PRESETS) for(let key=0; key<12; key++){ S.key=key; S.minor=pr.minor;
            pr.chords.forEach(c=>{ n0++; const shp=shapeFor(c), pcs=chordPcs(c), notes=shp.map((f,s)=>f<0?null:TUNING[s]+f).filter(x=>x!=null);
              const reach=shp.every(f=>f<0 || (f===0 ? f0<=2 : (f>=f0 && f<=f0+n-1)));
              if(notes.length<3 || !reach || notes.some(m=>pcs.indexOf(m%12)<0)) bad.push(`n${n} at ${f0} ${pr.id} key ${key}: ${chordName(c)} ${shp.join(",")}`); }); } }
        [NECK.n,S.fret0,S.key,S.minor,S.sound]=keep; VOICINGS.clear(); return {n0, bad}; });
      ok(ks.bad.length===0, `every chord of the 44 patterns, in all 12 keys, at frets 1, 3, 5 and 8 on a phone and a computer: ${ks.n0} shapes, each reachable, three strings or more, every note in the chord`+(ks.bad.length?"\n   "+ks.bad.slice(0,6).join("\n   "):""));
    }

    if(inst==="guitar"){
      /* the shuffle: the sixth moves when the hand can reach it (it can, on a computer-wide neck) */
      const sh=await p.evaluate(()=>{ const keep=[NECK.n,S.fret0,S.key]; NECK.n=12; S.fret0=1; S.key=0; const r={};
        for(const [nm,c] of [["E",{off:4,q:"maj"}],["A7",{off:9,q:"dom7"}],["C7",{off:0,q:"dom7"}],["Am",{off:9,q:"min"}]]){
          const pl=strumPlan(shapeFor(c),"shuffle",c); r[nm]=pl.map(h=>[h.t,TUNING[h.s]+h.f,h.role]); }
        [NECK.n,S.fret0,S.key]=keep; VOICINGS.clear(); return r; });
      const up=(nm,root)=>sh[nm].filter((x,i)=>i%2===1).map(x=>((x[1]-root)%12+12)%12).join(" ");
      ok(sh.E.filter(x=>x[0]===0).map(x=>x[1]).join()==="40,47" && up("E",4)==="7 7 9 9 7 7 9 9" && sh.E.filter(x=>x[2]==="pass").every(x=>x[1]===49),
        "the shuffle on E: the open E string with B, B, C♯, C♯ (the C♯ marked as a step on the way): "+sh.E.map(x=>x[1]).join(" "));
      ok(up("A7",9)==="7 7 9 9 10 10 9 9" && up("C7",0)==="7 7 9 9 10 10 9 9" && up("Am",9)==="7 7 9 9 7 7 9 9",
        "on A7 and C7 it climbs to the flat seventh (5 5 6 6 ♭7 ♭7 6 6); on A minor it stays 5 and 6: A7 "+up("A7",9)+" · Am "+up("Am",9));

      /* 4. a strum is a hand, not a stack */
      const hand=await p.evaluate(async()=>{ const keep=[NECK.n,S.fret0,S.key,S.sound,S.minor]; NECK.n=5; S.fret0=1; S.key=0; S.sound="steel"; S.minor=false; VOICINGS.clear();
        const c={off:0,q:"maj"}, shp=shapeFor(c), folk=strumPlan(shp,"folk",c), at=t=>folk.filter(h=>h.t===t).sort((a,b)=>a.off-b.off);
        const dir=t=>{ const l=at(t).map(h=>h.s); return l.every((s,i)=>!i||s>l[i-1]) ? "down" : l.every((s,i)=>!i||s<l[i-1]) ? "up" : "mixed"; };
        const gapsOf=t=>{ const l=at(t); return l.slice(1).map((h,i)=>+((h.off-l[i].off)*1000).toFixed(1)); };
        const r={dirs:[0,1,1.5,2.5,3,3.5].map(t=>t+":"+dir(t)).join(" "), down:at(1).map(h=>h.s).join(""), up:at(1.5).map(h=>h.s).join(""), gd:gapsOf(1), gu:gapsOf(1.5)};
        /* one down strum and one up strum, rendered: the first 15 ms after each starts — the low string's slow wave, or the high one's quick */
        const render=async hits=>{ const oc=new OfflineAudioContext(1, Math.ceil(44100*0.5), 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSound(ch,"steel"); setEra(ch,0,0);
          hits.forEach(h=>{ const vc=makeVoice(oc, ch, "steel", TUNING[h.s]+shp[h.s], h.v, 0.02+h.off, h.s); if(vc) vc.stop(0.45, 0.05); }); return (await oc.startRendering()).getChannelData(0); };
        const dn=await render(at(1)), upw=await render(at(1.5));
        /* how bright the start is: the wave's change from sample to sample against the wave itself (a high string changes faster) */
        const bright=(d,a,b2)=>{ let x=0,y=0; for(let i=Math.floor(a*44100)+1;i<Math.floor(b2*44100);i++){ x+=d[i]*d[i]; y+=(d[i]-d[i-1])*(d[i]-d[i-1]); } return Math.sqrt(y/(x+1e-12)); };
        let sxy=0,sxx=0,syy=0; for(let i=0;i<dn.length;i++){ sxy+=dn[i]*upw[i]; sxx+=dn[i]*dn[i]; syy+=upw[i]*upw[i]; }
        r.brDown=+bright(dn,0.02,0.035).toFixed(3); r.brUp=+bright(upw,0.02,0.035).toFixed(3); r.corr=+(sxy/Math.sqrt(sxx*syy+1e-12)).toFixed(2);
        /* the pad: a strum in the hand */
        window.__w=[]; const mv=window.makeVoice; window.makeVoice=function(cx,ch2,id,m,v,when,s){ if(cx===ac) window.__w.push({s, when}); return mv.apply(this,arguments); };
        padDown(0,0.74); padUp(0); window.makeVoice=mv;
        const w=window.__w; r.pad=w.map(x=>x.s).join(""); r.padGaps=w.slice(1).map((x,i)=>+((x.when-w[i].when)*1000).toFixed(1));
        /* fingerpicking: the thumb on the lowest note, then strings 3, 2, 1 of the shape */
        const on=shp.map((f,s)=>f>=0?s:-1).filter(s=>s>=0), top=on.slice().reverse();
        r.pick=strumPlan(shp,"pick",c).sort((a,b)=>a.t-b.t).map(h=>h.s).join(""); r.pickWant=[on[0],top[2],top[1],top[0]].join("").repeat(2);
        [NECK.n,S.fret0,S.key,S.sound,S.minor]=keep; VOICINGS.clear(); return r; });
      ok(hand.dirs==="0:down 1:down 1.5:up 2.5:up 3:down 3.5:up", "folk goes as its name says: "+hand.dirs);
      ok(hand.down.split("").every((s,i,a)=>!i||+s>+a[i-1]) && hand.up.split("").every((s,i,a)=>!i||+s<+a[i-1]) && hand.gd.concat(hand.gu).every(g=>g>=15&&g<=40),
        `a down strum plays low to high (strings ${hand.down}, ${hand.gd.join("/")} ms apart), an up strum high to low (${hand.up}, ${hand.gu.join("/")} ms)`);
      ok(hand.brUp>hand.brDown*1.1 && hand.corr<0.6, `and they sound different: the up strum starts on the high string, brighter in its first 15 ms (${hand.brUp} against the down strum's ${hand.brDown}); the two sounds match ${hand.corr} of the way`);
      ok(hand.padGaps.length>=4 && hand.padGaps.every(g=>g>=15&&g<=40) && hand.pad.split("").every((s,i,a)=>!i||+s>+a[i-1]), `a pad strums like a hand: strings ${hand.pad}, ${hand.padGaps.join("/")} ms apart`);
      ok(hand.pick===hand.pickWant, `fingerpicking: the thumb on the lowest note, then strings 3, 2, 1 (${hand.pick})`);
    } else {
      /* 5. the bass leaves the root */
      const bl=await p.evaluate(()=>{ const keep=[S.prog,S.rhythm,S.key,S.minor,S.fret0]; S.key=0; S.minor=false; S.fret0=1; const r={};
        const play=(rh, prog, bars, bpm)=>{ S.rhythm=rh; S.prog=prog; const bs=beatsPerBar()*60/bpm, beat=bs/beatsPerBar(), oc=new OfflineAudioContext(2,44100,44100), ch=makeChain(oc), out=[];
          for(let k=0;k<bars;k++) out.push(scheduleBar(oc,ch,k,k*bs,bs,0.5).map(v=>({b:+((v.on-k*bs)/beat).toFixed(2), m:v.m, d:+((v.off-v.on)/beat).toFixed(2), role:v.role})));
          return out; };
        const blues=PRESETS.find(x=>x.id==="blues").chords.map(c=>({off:c.off,q:c.q}));
        const w=play("walk", blues, 12, 90);
        r.walk=w.map(bar=>bar.map(n=>n.b+":"+n.m).join(" "));
        r.rests=w.filter(bar=>!bar.some(n=>n.b===1)).length;
        r.repeats=w.filter((bar,i)=>i && r.walk[i]===r.walk[i-1]).length;
        r.first4=new Set(r.walk.slice(0,4)).size;
        r.walkShape=w.every(bar=>bar.every(n=>[0,1,2,3].indexOf(n.b)>=0));
        const st=play("steady", blues, 4, 90); r.steady=st.map(bar=>bar.map(n=>n.m).join(" "));
        r.steadyOk=st.every((bar,k)=>{ const R=bar[0].m, pcs=chordPcs(blues[k]); return bar.length===4 && bar[2].m===R && new Set(bar.map(n=>n.m)).size>=3 && pcs.indexOf(bar[1].m%12)>=0 && bar[1].m!==R; });
        r.steadyTurns=st[0][1].m!==st[1][1].m;
        const dr=play("eighths", blues, 4, 90); r.driving=dr.map(bar=>bar.map(n=>n.b+":"+n.m).join(" "));
        r.drivingOk=dr.every((bar,k)=>{ const R=bar[0].m, beats=bar.filter(n=>n.b%1===0), offs=bar.filter(n=>n.b%1!==0), ghosts=offs.filter(n=>n.b<3.5);
          return beats.length===4 && beats.every(n=>n.m===R) && ghosts.length>=1 && ghosts.length<3 && ghosts.every(n=>n.d<=0.3) && offs.some(n=>n.b===3.5 && n.role==="pass"); });
        r.ghostVel=[0,1].flatMap(k=>lineEvents("eighths", blues[k], blues[k+1], k).filter(e=>e.t%1!==0 && e.t<3.5).map(e=>e.v));
        const ff=play("fifth", [{off:0,q:"maj"},{off:5,q:"maj"}], 2, 90); r.fifth=ff.map(bar=>bar.map(n=>n.b+":"+n.m).join(" "));
        r.bridge=Math.abs(ff[0][1].m-ff[1][0].m)===2 && ff[0][1].m%12===7;
        const oc8=play("octave", blues, 2, 90); r.octave=oc8[0].map(n=>n.b).join(" "); r.octaveOk=oc8.every(bar=>bar.every(n=>[0,1.5,2,3.5].indexOf(n.b)>=0) && bar.length===4);
        [S.prog,S.rhythm,S.key,S.minor,S.fret0]=keep; return r; });
      ok(bl.rests>=3 && bl.repeats===0 && bl.first4>=3 && bl.walkShape, `Walk on a 12-bar blues at 90: ${bl.rests} bars rest on beat 2, no bar repeats the one before, the four C7 bars are ${bl.first4} different lines:\n   `+bl.walk.join("\n   "));
      ok(bl.steadyOk && bl.steadyTurns, "Steady is no metronome on one pitch: "+bl.steady.join(" | "));
      ok(bl.drivingOk && bl.ghostVel.length>=3 && bl.ghostVel.every(v=>v<=0.4), `Driving: the root on every beat, soft (${bl.ghostVel.join("/")}) short notes or rests between, a step into the next chord last: `+bl.driving.slice(0,2).join(" | "));
      ok(bl.bridge, "Root and fifth into a chord a fourth up: the fifth sits a step above the next root, a bridge: "+bl.fifth.join(" | "));
      ok(bl.octaveOk, "Octaves leave beats 2 and 4 empty: notes at beats "+bl.octave);
    }
    /* the 12-bar patterns go round: bar 13 plays as bar 1 (notes, places and times), every way */
    const loops=await p.evaluate(()=>{ const keep=[S.prog,S.rhythm,S.key,S.minor], bad=[]; let n=0;
      for(const id of ["blues","quick","jazzblues","mblues"]){ const pr=PRESETS.find(x=>x.id===id); S.minor=pr.minor; S.key=pr.minor?9:0; S.prog=pr.chords.map(c=>({off:c.off,q:c.q}));
        for(const rh of RHYTHMS){ S.rhythm=rh; const bs=beatsPerBar()*0.6, oc=new OfflineAudioContext(2,44100,44100), ch=makeChain(oc), L=[];
          for(let k=0;k<24;k++) L.push(JSON.stringify(scheduleBar(oc,ch,k,k*bs,bs,0.5).map(v=>[+(v.on-k*bs).toFixed(4), v.m, v.cell, +(v.off-v.on).toFixed(4)])));
          n++; for(let k=0;k<12;k++) if(L[k]!==L[k+12] || L[k]==="[]"){ bad.push(id+" "+rh+" bar "+(k+1)); break; } } }
      [S.prog,S.rhythm,S.key,S.minor]=keep; return {n, bad}; });
    ok(loops.bad.length===0, `the 12-bar patterns go round: in ${loops.n} plays (4 patterns × every way), bar 13 plays as bar 1, bar 24 as bar 12`+(loops.bad.length?": not "+loops.bad.slice(0,5).join(", "):""));

    /* 6. the waltz: three beats */
    const wz=await p.evaluate(()=>{ const keep=[S.rhythm,S.prog]; S.prog=[{off:0,q:"maj"}];
      S.rhythm="waltz"; const bpb=beatsPerBar(), oc=new OfflineAudioContext(2,44100,44100), ch=makeChain(oc), vs=scheduleBar(oc,ch,0,0,1.5,0.5);
      const beats=[...new Set(vs.map(v=>Math.floor(v.on/0.5+1e-6)))].sort(), last=Math.max(...vs.map(v=>v.on));
      S.rhythm=RHYTHMS[1]; const other=beatsPerBar(); [S.rhythm,S.prog]=keep; return {bpb, beats:beats.join(","), last:+last.toFixed(3), other}; });
    ok(wz.bpb===3 && wz.other===4 && wz.beats===(inst==="guitar"?"0,1,2":"0,2") && wz.last<1.5, `a waltz bar has three beats (${wz.beats} of 0,1,2; last note at ${wz.last} s of 1.5 s); the others have four`);
    await p.selectOption("#progSel","pop"); await p.evaluate(()=>{ S.bpm=120; $("bpm").value="120"; });
    await p.selectOption("#rhythmSel","waltz"); await p.click("#playBtn"); await p.waitForTimeout(500);
    const lv1=await p.evaluate(()=>({sec:PLAY.barSec, playing:S.playing}));
    await p.selectOption("#rhythmSel", inst==="guitar"?"down":"steady"); await p.waitForTimeout(400);
    const lv2=await p.evaluate(()=>({sec:PLAY.barSec, playing:S.playing}));
    await p.selectOption("#rhythmSel","waltz"); await p.waitForTimeout(300);
    const lv3=await p.evaluate(()=>({sec:PLAY.barSec, playing:S.playing}));
    await p.click("#playBtn"); await p.waitForTimeout(100);
    ok(lv1.playing && Math.abs(lv1.sec-1.5)<1e-9 && lv2.playing && Math.abs(lv2.sec-2)<1e-9 && lv3.playing && Math.abs(lv3.sec-1.5)<1e-9,
      `live at 120: a waltz bar lasts ${lv1.sec} s; changing to four beats while it plays starts again on the new count (${lv2.sec} s), and back (${lv3.sec} s)`);

    /* swing */
    const sw=await p.evaluate(async()=>{
      const keep=[S.rhythm,S.prog,S.withDrums,S.bpm]; S.prog=[{off:0,q:"dom7"}]; S.withDrums=false; S.bpm=100;
      /* where each strum or note starts, in beats: the first string of each (a strum's later strings come a moment after) */
      const starts=(rh, swing)=>{ S.rhythm=rh; const oc=new OfflineAudioContext(2,44100,44100), ch=makeChain(oc), vs=scheduleBar(oc,ch,0,0,2,swing).sort((a,b)=>a.on-b.on), out=[];
        vs.forEach(v=>{ const x=v.on/0.5; if(!out.length || x-out[out.length-1]>0.2) out.push(+x.toFixed(3)); }); return out; };
      const r={};
      const own=GTR?"shuffle":"boogie", straight=GTR?"rock":"eighths", six=GTR?"thrash":"sixteen";
      S.rhythm=own; r.ownSwing=curSwing(); r.own=starts(own, curSwing());
      S.rhythm=straight; r.straightSwing=curSwing(); r.straight=starts(straight, curSwing());
      const sr=44100, n=sr*2, L=new Float32Array(n); for(let k=0;k<4;k++) for(let i=0;i<300;i++) L[k*sr/2+i]=Math.sin(i/3)*(1-i/300);
      await AOGHandoff.put("drumbench", {name:"Swung beat", bpm:120, bars:1, offset:0, swing:0.58, wav:wavBlob(L, L, sr)}); await checkDrums();
      S.withDrums=true;
      S.rhythm=straight; r.drumLive=drumsLive(); r.drumSwing=curSwing(); r.drumBpm=curBpm(); r.drumStraight=starts(straight, curSwing());
      S.rhythm=six; r.drumSix=starts(six, curSwing());
      S.rhythm=own; r.drumOwn=curSwing();
      S.rhythm="waltz"; paintDrums(); r.waltzLive=drumsLive(); r.waltzSwing=curSwing(); r.waltzBpm=curBpm(); r.waltzLocked=document.getElementById("bpm").disabled;
      r.waltzLine=document.getElementById("drumBox").textContent.replace(/\s+/g," ").trim();
      S.rhythm=straight; paintDrums(); r.fourLine=document.getElementById("drumBox").textContent.replace(/\s+/g," ").trim(); r.fourLocked=document.getElementById("bpm").disabled;
      [S.rhythm,S.prog,S.withDrums,S.bpm]=keep; paintDrums();
      return r; });
    const offs=a=>a.filter(x=>x%1>0.01).map(x=>+(x%1).toFixed(2));
    ok(sw.ownSwing===0.64 && offs(sw.own).every(x=>Math.abs(x-0.64)<0.011) && offs(sw.own).length>=4, `the ${inst==="guitar"?"shuffle":"boogie-woogie"} swings by itself (64%): its off-beats fall at ${offs(sw.own).join(" ")}`);
    ok(sw.straightSwing===0.5 && offs(sw.straight).every(x=>Math.abs(x-0.5)<0.011) && offs(sw.straight).length>=1, `${inst==="guitar"?"rock":"driving"} stays straight without a drum beat: ${offs(sw.straight).join(" ")}`);
    ok(sw.drumLive && sw.drumSwing===0.58 && sw.drumBpm===120 && offs(sw.drumStraight).every(x=>Math.abs(x-0.58)<0.011) && offs(sw.drumStraight).length>=1, `with a swung drum beat (58%, 120) the off-beats follow it: ${offs(sw.drumStraight).join(" ")}`);
    const s16=[...new Set(sw.drumSix.filter(x=>x<1).map(x=>+x.toFixed(2)))].join(" ");
    ok(s16==="0 0.25 0.58 0.83", `${inst==="guitar"?"thrash":"metal"} sixteenths with it: the third and fourth move together, as on the drum machine (${s16})`);
    ok(sw.drumOwn===0.58, "with the drum beat, the "+(inst==="guitar"?"shuffle":"boogie")+" swings as the beat does ("+sw.drumOwn+")");
    ok(!sw.waltzLive && sw.waltzSwing===0.5 && sw.waltzBpm===100 && !sw.waltzLocked && /counts in threes/.test(sw.waltzLine) && /tempo comes from your drum beat/.test(sw.fourLine) && sw.fourLocked,
      `a waltz plays without the four-beat drum beat, at its own tempo (${sw.waltzBpm}), and says so: "${sw.waltzLine}"`);

    /* the tempo */
    const tp=await p.evaluate(()=>{ const keep=[S.rhythm,S.prog,S.bpm]; S.prog=[{off:0,q:"maj"}]; const r=[];
      for(const rh of [RHYTHMS[2],"waltz"]) for(const bpm of [60,150]){ S.rhythm=rh; S.bpm=bpm; const bs=beatsPerBar()*60/curBpm(), oc=new OfflineAudioContext(2,44100,44100), ch=makeChain(oc), vs=scheduleBar(oc,ch,0,0,bs,0.5);
        r.push({rh, bpm, bs:+bs.toFixed(3), inBar:vs.every(v=>v.on<bs)}); }
      [S.rhythm,S.prog,S.bpm]=keep; return r; });
    ok(tp.every(x=>x.inBar) && tp[0].bs===4 && tp[1].bs===1.6 && tp[2].bs===3 && tp[3].bs===1.2, "the bar follows the tempo: "+tp.map(x=>`${x.rh} at ${x.bpm}: ${x.bs} s`).join(", "));

    /* 7. live: each way plays for a moment; the orange notes walk */
    await p.selectOption("#progSel","blues");
    const silent=[];
    for(const r of await p.evaluate("RHYTHMS")){
      await p.selectOption("#rhythmSel", r); await p.click("#playBtn");
      const st={playing:false, v:0, lit:0};
      for(let i=0;i<14;i++){ await p.waitForTimeout(100);
        const x=await p.evaluate(()=>({playing:S.playing, v:PLAY.voices.length, lit:document.querySelectorAll("#neck .dot.now").length}));
        st.playing=st.playing||x.playing; st.v=Math.max(st.v,x.v); st.lit=Math.max(st.lit,x.lit); }
      await p.click("#playBtn"); await p.waitForTimeout(80);
      if(!(st.playing && st.v>0 && st.lit>0)) silent.push(r+" "+JSON.stringify(st));
    }
    ok(silent.length===0, `every way plays on the blues with its orange notes lit`+(silent.length?": not "+silent.join(", "):""));
    ok(await p.evaluate(()=>!S.playing && PLAY.voices.length===0), "and Stop stops each");
    if(inst==="bass"){
      /* the bass line's notes light as they come, and glide only under a sliding finger */
      await p.selectOption("#rhythmSel","walk"); await p.evaluate(()=>{ S.bpm=90; $("bpm").value="90";
        window.__glides=0; window.__cells=new Set(); const mv=window.makeVoice;
        window.makeVoice=function(cx){ const vc=mv.apply(this,arguments); if(vc && cx===ac){ const g=vc.glide; vc.glide=function(){ window.__glides++; return g.apply(this,arguments); }; } return vc; }; });
      await p.click("#playBtn"); const lit=new Set(); let strayLit=0;
      for(let i=0;i<60;i++){ await p.waitForTimeout(100);
        const x=await p.evaluate(()=>({now:[...document.querySelectorAll("#neck .dot.now")].map(g=>g.getAttribute("data-c")), cells:PLAY.voices.map(v=>v.cell)}));
        x.now.forEach(cl=>{ lit.add(cl); if(x.cells.indexOf(cl)<0) strayLit++; }); }
      await p.click("#playBtn"); await p.waitForTimeout(80);
      const gl=await p.evaluate("__glides");
      ok(lit.size>=6 && strayLit===0 && gl===0, `Walk at 90 on the blues: the line's notes light in turn (${lit.size} places: ${[...lit].join(" ")}), only notes of the line, and none glides by itself (${gl})`);
    }
    /* Spanish, a reload */
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(200);
    const es=await p.evaluate((id)=>[...document.querySelectorAll("#rhythmSel optgroup")].map(g=>g.label).join(" | ")+" · "+document.querySelector(`#rhythmSel option[value="${id}"]`).textContent
      +" · "+[...document.querySelectorAll("#progSel optgroup")].map(g=>g.label).join(" | ")+" · "+document.querySelector('#progSel option[value="metalmarch"]').textContent, inst==="guitar"?"rumba":"tumbao");
    ok(es.indexOf(W.es)===0 && (inst==="guitar"?/Rumba flamenca · España/:/Tumbao · salsa/).test(es) && /Pop, rock y folk \| Rock y metal \| Soul, funk y baile \| Blues y jazz \| Menor y melancólico · Marcha metalera$/.test(es), "in Spanish: "+es);
    await p.evaluate(()=>document.getElementById("langBtn").click()); await p.waitForTimeout(150);
    const keepWay=inst==="guitar"?"breakdown":"motown";
    await p.selectOption("#rhythmSel", keepWay); await p.selectOption("#progSel","neosoul"); await p.reload(); await p.waitForTimeout(900);
    ok(await p.evaluate(w=>S.rhythm===w && document.getElementById("rhythmSel").value===w && S.preset==="neosoul" && document.getElementById("progSel").value==="neosoul", keepWay), `the way of playing (${keepWay}) and a new pattern (Neo-soul) are kept after a reload`);
    /* Send to the turntables, in three */
    await p.selectOption("#progSel","pop"); await p.selectOption("#rhythmSel","waltz"); await p.evaluate(()=>{ S.bpm=120; $("bpm").value="120"; S.withDrums=false; });
    await p.click("#sendBtn");
    await p.waitForFunction(()=>/Sent|Enviado|did not|No funcion/.test(document.getElementById("sendLine").textContent), null, {timeout:60000});
    const shelf=await p.evaluate(async(sh)=>{ const x=await AOGHandoff.get(sh); if(!x) return null; const buf=await new OfflineAudioContext(2,1,44100).decodeAudioData(await x.wav.arrayBuffer());
      return {name:x.name, bars:x.bars, sec:+buf.duration.toFixed(2), line:document.getElementById("sendLine").textContent}; }, inst+"bench");
    ok(shelf && /Sent/.test(shelf.line) && Math.abs(shelf.sec-(0.05+shelf.bars*1.5+3))<0.05, `Send makes a waltz recording of ${shelf&&shelf.bars} bars of three beats (${shelf&&shelf.sec} s): ${shelf&&shelf.name}`);
    ok(errs.length===0, "no page errors "+errs.join(" | "));
    await c.close();
  }
  console.log(fails? fails+" FAILED":"ALL PASS");
  await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
function GTR(inst){ return inst==="guitar"; }
