/* AOG-BAND-LICKS-V1 (2026-10-19) — Jimmy: "start some agents on the piano and band licks as well that follow the same style
   of the guitar and bass licks." AOG-LICKS-SONG-V1 (Jimmy, 2026-10-19: "I could use them … in making a song without much
   modification of my own").

   The Band's licks ("Licks to try", music-band.html), loaded only the first time someone opens them. One line at a time,
   played on the instrument picked in the Band, in a range that player really reaches, with the horns' own ways: a scoop
   into a note, a fall or a doit off the end, a shake, a trill, a smear up from the note before, short stabs, and rests
   to breathe. Like the guitar's and the bass's licks (aog-guitar-licks.js, aog-bass-licks.js), each is written against
   chords, so it follows the song's key and major or minor and lands on the chord's own notes:

     chords: "1 4 5 1*1"  a chord a bar (4 beats) unless *n says how many beats. The number is the step of the key's
             scale it is built on (major or natural minor); b or # in front counts from the major scale (b7 is the flat
             seven chord in both). After it: m M 7 m7 M7 d7 (dominant 7) o (diminished) m7b5; none = the key's own chord.
             cm: another chord line for a minor key; nm: another note line for a minor key.
     notes:  each note is how it sits on the chord, how long, and how it is played:
             1 3 5 7 = the chord's root, third, fifth and seventh; 2 4 6 9 = the key's scale above the root; 8 = the octave;
             b3 #4 b7 … = that many steps from the root counted on the major scale (blue notes, passing notes);
             , = an octave down, ' = an octave up; r = a rest (a breath);
             < and > = a half step below or above the next note; [ and ] = the key's scale note below or above the next;
             w h q e s t f = whole, half, quarter, eighth, sixteenth, triplet eighth, triplet sixteenth (. adds half);
             the length carries on to the next note.
             How: / scoop up into it, \ fall off the end, ^ doit (up off the end), ~ shake (a lip trill up to the chord's
             next note), T trill (to the key's note above), S smear up from the note before, v vibrato, g a ghost note
             (soft), A accent, - short, _ held its whole length, * a section stab (a section plays the chord under it),
             ! a passing note on purpose.
   Every lick starts on beat 1 and lasts whole bars, so it repeats (Repeat 1, 2, 4) with no gap at the seam.
   compile() places a lick in the key on one player: the whole lick moved by octaves into that player's reach (reach()),
   or, with fit (a chord a bar: "Fit to my chords"), each note keeping its part on the song's chords. check() tests the
   numbers: inside the reach, the chord's notes on beats 1 and 3, the key's notes everywhere else unless a note passes by a
   half or whole step on purpose, a breath at least every two bars (and before the repeat), no wider than SPANMAX, whole
   bars from beat 1, and the last note on its chord's root. */
(function(root){
"use strict";
const MAJ=[0,2,4,5,7,9,11], MIN=[0,2,3,5,7,8,10], MAJINT=[0,2,4,5,7,9,11,12,14];
const MIX=[0,2,4,5,7,9,10], DOR=[0,2,3,5,7,9,10];
const QT={maj:[0,4,7], min:[0,3,7], dim:[0,3,6], dom7:[0,4,7,10], maj7:[0,4,7,11], m7:[0,3,7,10], m7b5:[0,3,6,10]};
const DUR={w:4, h:2, q:1, e:0.5, s:0.25, t:1/3, f:1/6};
/* the longest a player blows without a breath (beats), the shortest rest that is a breath, the widest a lick may reach */
const BREATH=8, GULP=0.5, SPANMAX=14, WIDE=SPANMAX+11;

/* ══ where each player sounds well (MIDI, as it sounds): the middle of its real range, inside its recordings. A player
   not named here uses its recordings' own reach. Sounds that hold one note (drones, the timpani, the bagpipe's nine-note
   chanter) play no licks. ══ */
const REACH={
  trumpet:[54,82], trumpet_vib:[54,82], trumpet_harmon:[58,81], trumpet_straight:[58,81],
  trombone:[40,65], trombone_vib:[41,63], horn:[41,77], horn_mute:[46,77], tuba:[29,58],
  piccolo:[79,100], flute:[60,93], flute_vib:[60,93], clarinet:[50,88], oboe:[58,88], oboe_vib:[58,88],
  bassoon:[34,72], bassoon_vib:[43,72], sax:[49,80], tenor:[44,77], tenor_vib:[46,77], soprano:[58,87],
  recorder:[72,96], recorder_alto:[65,88], harmonica:[60,93], melodica:[53,89], panflute:[55,88],
  voice_f_aa:[57,81], voice_f_uu:[57,81], voice_m_aa:[45,66], voice_m_uu:[45,66]
};
const NO_LICKS={kit:1, timpani:1, didgeridoo:1, didgeridoo_rhythm:1, bagpipe_drones:1, bagpipe:1};
/* the notes a player is given a lick in: its REACH inside its recordings (sus: the recorded notes, low to high) */
function reach(inst, sus){
  if(NO_LICKS[inst] || !sus || !sus.length) return null;
  /* a recording is played up to two half steps above or below its own note (three at the very most) */
  const A=sus[0]-3, Z=sus[sus.length-1]+3;
  let lo=sus[0]-2, hi=sus[sus.length-1]+2; const r=REACH[inst]; if(r){ lo=Math.max(lo, r[0]); hi=Math.min(hi, r[1]); }
  /* wide enough for every lick in every key: the widest lick and an octave less a half step to move it in */
  while(hi-lo<WIDE && (lo>A || hi<Z)){ if(lo>A && (hi>=Z || lo-A>=Z-hi)) lo--; else hi++; }
  return hi-lo>=WIDE ? [lo, hi] : null;
}

/* ══ chords ═══════════════════════════════════════════════════════════════════════════════════════════════════════ */
function parseChords(spec, minor){
  const SC=minor?MIN:MAJ, out=[]; let t=0;
  spec.trim().split(/\s+/).forEach(tok=>{
    const m=/^([b#]?)([1-7])(m7b5|M7|m7|d7|7|m|M|o)?(?:\*([\d.]+))?$/.exec(tok); if(!m) throw new Error("chord "+tok);
    const d=+m[2]-1, rt=m[1] ? (MAJ[d]+(m[1]==="b"?-1:1)+12)%12 : SC[d], idx=SC.indexOf(rt);
    const dia=k=>(SC[(idx+k)%7]-SC[idx]+12)%12;
    const tri=idx<0 ? "maj" : dia(2)===4 ? "maj" : dia(4)===6 ? "dim" : "min";
    let q=tri;
    switch(m[3]){
      case "m": q="min"; break; case "M": q="maj"; break; case "m7": q="m7"; break; case "M7": q="maj7"; break;
      case "d7": q="dom7"; break; case "o": q="dim"; break; case "m7b5": q="m7b5"; break;
      case "7": q=idx<0 ? "dom7" : tri==="maj" ? (dia(6)===11?"maj7":"dom7") : tri==="min" ? "m7" : "m7b5"; break;
    }
    const len=m[4]!=null ? +m[4] : 4;
    /* what the Band's own chords play under it (they have no half-diminished: its minor third's chord) */
    const band=(q==="m7b5") ? {off:(rt+3)%12, q:"min"} : {off:rt, q};
    out.push({t0:t, t1:t+len, root:rt, q, idx, tones:QT[q], band}); t+=len;
  });
  return out;
}
function chordAt(chs, t){ let c=chs[0]; for(const x of chs){ if(x.t0<=t+1e-6) c=x; } return c; }
/* a step of the key's scale above the chord's root (k = 0 is the root); a root outside the key: Mixolydian or Dorian */
function step(c, k, minor){
  if(c.idx>=0){ const SC=minor?MIN:MAJ, i=c.idx+k; return SC[i%7]+12*Math.floor(i/7)-SC[c.idx]; }
  const T=c.tones[1]===3 ? DOR : MIX; return T[k%7]+12*Math.floor(k/7);
}
/* a chord of the Band's own (a chord pattern's: off = steps above the key's home note, q = its kind), as a lick's chord */
const BQ={maj:"maj", min:"min", dom7:"dom7", maj7:"maj7", m7:"m7", dim:"dim"};
function bandChord(c, t0, minor){
  const SC=minor?MIN:MAJ, rt=((c.off%12)+12)%12, q=BQ[c.q]||"maj";
  return {t0, t1:t0+4, root:rt, q, idx:SC.indexOf(rt), tones:QT[q], band:{off:rt, q}};
}

/* ══ notes ════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const TOK=/^(r|<|>|\[|\]|[b#]?[1-9])([,']*)([whqestf]\.?)?([-_\/\\^~TvgAS!*]*)$/;
function parseNotes(spec){
  const out=[]; let t=0, dur=0.5;
  spec.trim().split(/\s+/).forEach(tok=>{
    if(tok==="|") return;
    const m=TOK.exec(tok); if(!m) throw new Error("note "+tok);
    if(m[3]){ dur=DUR[m[3][0]]*(m[3].length>1?1.5:1); }
    const p=m[1], oct=(m[2].match(/'/g)||[]).length-(m[2].match(/,/g)||[]).length, mods=m[4]||"";
    if(p==="r" && mods) throw new Error("a rest is played no way: "+tok);
    const e={t:+t.toFixed(6), slot:dur, p, oct, mods};
    if(p!=="r") out.push(e);
    t+=dur;
  });
  return {list:out, beats:+t.toFixed(6)};
}
function scaleBelow(rel, minor, dir){
  const SC=minor?MIN:MAJ; for(let i=1;i<=2;i++){ const r=rel+dir*i; if(SC.indexOf(((r%12)+12)%12)>=0) return r; } return rel+dir;
}
/* the lick in the key: each note's pitch above the key's home note (rel), its chord. fit: the chords to play it over
   instead of its own, one a bar (AOG-LICKS-SONG-V1, "Fit to my chords"): each note keeps its part (the root, the third, a
   step of the scale, a note leaning into the next) on the new chord; a note that would no longer belong (not the chord's
   on beats 1 and 3, outside the key elsewhere) moves to the nearest one that does */
function resolve(def, minor, fit, bar0){
  const P=parseNotes(minor && def.nm ? def.nm : def.n), L=P.list;
  let chs;
  if(fit && fit.length){ const bars=Math.max(1, Math.round(P.beats/4)); chs=[];
    for(let j=0;j<bars;j++) chs.push(bandChord(fit[((bar0||0)+j)%fit.length], 4*j, minor)); }
  else chs=parseChords(minor && def.cm ? def.cm : def.ch, minor);
  const chordBeats=chs[chs.length-1].t1;
  if(chs[chs.length-1].t1<P.beats) chs[chs.length-1].t1=P.beats;
  const SC=minor?MIN:MAJ, pcOf=r=>((r%12)+12)%12;
  const tone=(c, r)=>c.tones.some(x=>(c.root+x)%12===pcOf(r)), inKey=r=>SC.indexOf(pcOf(r))>=0;
  L.forEach((e,i)=>{
    const c=chordAt(chs, e.t); e.chord=c;
    const has=x=>e.mods.indexOf(x)>=0;
    e.pass=has("!"); e.short=has("-"); e.full=has("_"); e.ghost=has("g"); e.acc=has("A"); e.stab=has("*");
    e.fx=has("/")?"scoop":has("\\")?"fall":has("^")?"doit":has("~")?"shake":has("T")?"trill":has("S")?"smear":"";
    e.vib=has("v"); e.strong=Math.abs(e.t/2-Math.round(e.t/2))<1e-6;
    if(e.fx==="smear" && !i) throw new Error("a smear needs a note before it");
    if(/^[<>\[\]]$/.test(e.p)){ e.appr=e.p; return; }
    const n=+e.p.slice(-1), acc=e.p.length>1?e.p[0]:"";
    let iv;
    if(acc) iv=MAJINT[n-1]+(acc==="b"?-1:1);
    else if(n===1) iv=0; else if(n===8) iv=12;
    else if(n===3) iv=(c.tones[1]===3||c.tones[1]===4) ? c.tones[1] : step(c, 2, minor);
    else if(n===5) iv=c.tones[2];
    else if(n===7) iv=c.tones[3]!=null ? c.tones[3] : step(c, 6, minor);
    else if(n===9) iv=step(c, 1, minor)+12;
    else iv=step(c, n-1, minor);
    e.rel=c.root+iv+12*e.oct;
  });
  /* fitted: each bar in the octave that moves least from the bar before (the first bar, from where the lick's own first
     bar sits), so the line stays as close together as the lick was written */
  if(fit && fit.length){
    const own=resolve(def, minor).L, bars={};
    L.forEach((e,i)=>{ if(e.rel==null) return; const b=Math.floor(e.t/4+1e-9); (bars[b]=bars[b]||[]).push(i); });
    let prev=null;
    Object.keys(bars).map(Number).sort((a,b)=>a-b).forEach(b=>{
      const ix=bars[b]; let best=0, bc=Infinity;
      for(const s of [0,-12,12,-24,24]){
        const c=prev==null ? ix.reduce((a,i)=>a+Math.abs(L[i].rel+s-(own[i].rel!=null?own[i].rel:L[i].rel)), 0)/ix.length : Math.abs(L[ix[0]].rel+s-prev);
        if(c<bc-1e-9){ bc=c; best=s; } }
      ix.forEach(i=>{ L[i].rel+=best; }); prev=L[ix[ix.length-1]].rel;
    });
  }
  const near=(r, ok)=>{ for(const d of [0,-1,1,-2,2,-3,3,-4,4,-5,5,-6,6]) if(ok(r+d)) return r+d; return r; };
  if(fit && fit.length) L.forEach(e=>{ if(e.appr) return;
    if(e.strong) e.rel=near(e.rel, r=>tone(e.chord, r));
    else if(!e.pass) e.rel=near(e.rel, r=>inKey(r)||tone(e.chord, r)); });
  /* fitted: a bar that sticks out of the line moves an octave toward the rest, until the lick is as narrow as one written */
  if(fit && fit.length){
    const ix=L.map((e,i)=>i).filter(i=>L[i].rel!=null), barOf=i=>Math.floor(L[i].t/4+1e-9);
    const span=()=>{ const r=ix.map(i=>L[i].rel); return Math.max(...r)-Math.min(...r); };
    for(let k=0;k<16 && span()>SPANMAX-2;k++){
      const r=ix.map(i=>L[i].rel), lo=Math.min(...r), hi=Math.max(...r), was=span(); let done=false;
      for(const [want, s] of [[hi,-12],[lo,12]]){
        const b=barOf(ix.find(i=>L[i].rel===want)), mine=ix.filter(i=>barOf(i)===b);
        mine.forEach(i=>{ L[i].rel+=s; }); if(span()<was){ done=true; break; } mine.forEach(i=>{ L[i].rel-=s; });
      }
      if(!done) break;
    }
    /* then a single note that still sticks out moves an octave (it keeps its part on the chord) */
    for(let k=0;k<32 && span()>SPANMAX-2;k++){
      const r=ix.map(i=>L[i].rel), lo=Math.min(...r), hi=Math.max(...r), was=span(); let done=false;
      for(const [want, s] of [[hi,-12],[lo,12]]){
        const all=ix.filter(j=>L[j].rel===want); all.forEach(i=>{ L[i].rel+=s; }); if(span()<was){ done=true; break; } all.forEach(i=>{ L[i].rel-=s; });
      }
      if(!done) break;
    }
  }
  /* the leaning notes, from the note after them */
  for(let i=L.length-1;i>=0;i--){ const e=L[i]; if(!e.appr) continue;
    const nx=L[i+1]; if(!nx || nx.rel==null) throw new Error("approach at the end");
    e.rel = e.appr==="<" ? nx.rel-1 : e.appr===">" ? nx.rel+1 : scaleBelow(nx.rel, minor, e.appr==="[" ? -1 : 1);
    e.rel+=12*e.oct; }
  /* a passing note on purpose that no longer passes by step (fitted) lands on the key instead */
  if(fit && fit.length) L.forEach((e,i)=>{ const nx=L[i+1];
    if(e.pass && !inKey(e.rel) && !tone(e.chord, e.rel) && (!nx || Math.abs(nx.rel-e.rel)>2)){ e.rel=near(e.rel, r=>inKey(r)||tone(e.chord, r)); e.pass=false; } });
  /* a trill goes to the key's note above; a shake, up to the chord's next note (a lip slur) */
  L.forEach(e=>{
    if(e.fx==="trill") e.up=scaleBelow(e.rel, minor, 1)-e.rel;
    if(e.fx==="shake"){ const c=e.chord, pcs=c.tones.map(x=>(c.root+x)%12); let u=2; while(u<6 && pcs.indexOf(pcOf(e.rel+u))<0) u++; e.up=u; }
  });
  return {chs, L, beats:P.beats, chordBeats};
}

/* ══ the lick in a key, for one player: the notes playLick() plays (t, d in beats; m the MIDI note, as it sounds).
   o: key, minor, range [lo, hi] (the player's reach), fit (a chord a bar, the Band's own: {off, q}), bar0 (the first of
   them), times (Repeat: 1, 2 or 4, back to back, a whole number of bars each) ══ */
function compile(def, o){
  o=o||{}; const key=((o.key||0)%12+12)%12, minor=!!o.minor, R0=o.range||[55,82], times=Math.max(1, Math.min(8, o.times|0||1));
  const fit=o.fit && o.fit.length ? o.fit : null, reps=[];
  const bars=Math.max(1, Math.round(parseNotes(minor && def.nm ? def.nm : def.n).beats/4));
  for(let k=0;k<times;k++){ reps.push(resolve(def, minor, fit, (o.bar0||0)+k*bars)); if(!fit) break; }
  while(reps.length<times) reps.push(reps[0]);
  /* the octave: every note inside the player's reach, the lick's middle nearest the middle of it (a little above) */
  const want=R0[0]+(R0[1]-R0[0])*0.52;
  const pick=rels=>{ const lo=Math.min(...rels), hi=Math.max(...rels), mid=(lo+hi)/2; let best=null;
    for(let base=key-120; base<=key+120; base+=12){
      if(base+lo<R0[0] || base+hi>R0[1]) continue;
      const d=Math.abs(base+mid-want); if(!best || d<best.d-1e-9) best={base, d};
    }
    return best; };
  /* fitted and repeated: each time round in the octave nearest the first; if the whole will not fit, each its own */
  const relsOf=R=>[].concat(...R.L.map(e=>e.up ? [e.rel, e.rel+e.up-2] : [e.rel])), midOf=R=>{ const r=relsOf(R); return (Math.min(...r)+Math.max(...r))/2; };
  const shift=reps.map((R,k)=>{ if(!k || R===reps[0]) return 0; let s0=0, bd=Infinity; for(const s of [0,-12,12]){ const d=Math.abs(midOf(R)+s-midOf(reps[0])); if(d<bd){ bd=d; s0=s; } } return s0; });
  let whole=pick([].concat(...reps.map((R,k)=>relsOf(R).map(r=>r+shift[k]))));
  const bases=reps.map((R,k)=>{ if(whole) return whole.base+shift[k]; const b=pick(relsOf(R)); return b ? b.base : null; });
  if(bases.some(b=>b==null)) return null;
  const best={base:bases[0]};
  const one=reps[0].beats, sw=def.sw||0, warp=x=>{ if(!sw) return x; const b=Math.floor(x+1e-9), fr=x-b; return b+(fr<=0.5 ? fr/0.5*sw : sw+(fr-0.5)/0.5*(1-sw)); };
  const notes=[], chords=[];
  reps.forEach((R, k)=>{
    const off=k*one, L=R.L, c0=chords.length;
    R.chs.forEach(c=>chords.push({t0:c.t0+off, t1:c.t1+off, root:c.root, q:c.q, tones:c.tones.slice(), band:c.band}));
    L.forEach((e,i)=>{
      const nx=L[i+1], gap=nx ? nx.t-(e.t+e.slot) : 1;
      /* tongued notes leave a little air; a short one is half its length; a held one (and one into a smear) its whole */
      const frac=e.short ? 0.5 : (e.full || !nx || gap>1e-6 || (nx && nx.fx==="smear")) ? 1 : 0.9;
      const t0=warp(e.t), t1=warp(e.t+e.slot*frac), d=+(t1-t0).toFixed(4);
      const n={t:+(t0+off).toFixed(4), d, tb:+(e.t+off).toFixed(6), slot:e.slot, m:bases[k]+e.rel, rel:e.rel, chord:c0+R.chs.indexOf(e.chord)};
      if(e.fx) n.fx=e.fx; if(e.up) n.up=e.up; if(e.vib) n.vib=1; if(e.short) n.short=1; if(e.ghost) n.ghost=1; if(e.acc) n.acc=1;
      if(e.stab) n.stab=1; if(e.pass) n.pass=1; if(e.appr) n.appr=e.appr;
      notes.push(n);
    });
  });
  return {id:def.id, notes, chords, beats:one*times, one, times, chordBeats:reps[0].chordBeats*times, key, minor, range:R0.slice(), base:best.base, sw, fit:!!fit};
}

/* ══ the numbers: what a lick must be in every key, on every player ═════════════════════════════════════════════════ */
function check(C){
  const bad=[];
  if(!C){ return ["does not fit the player's reach"]; }
  const R0=C.range;
  if(Math.abs(C.chordBeats-C.beats)>1e-6) bad.push(`the notes last ${C.beats} beats, the chords ${C.chordBeats}`);
  if(Math.abs(C.one/4-Math.round(C.one/4))>1e-6) bad.push(`it lasts ${C.one} beats, not whole bars`);
  if(!C.notes.length || C.notes[0].tb!==0) bad.push("it does not start on beat 1");
  const SC=C.minor?MIN:MAJ;
  let run=0, from=0;
  C.notes.forEach((n,i)=>{
    if(n.m<R0[0] || n.m>R0[1]) bad.push(`note ${i} out of reach (${n.m}, ${R0[0]} to ${R0[1]})`);
    if(n.fx==="trill" || n.fx==="shake"){ if(n.m+n.up>R0[1]+2) bad.push(`note ${i} shakes too high`); }
    const c=C.chords[n.chord], pc=((n.m-C.key)%12+12)%12, chordPcs=c.tones.map(x=>(c.root+x)%12);
    const inKey=SC.indexOf(pc)>=0, isTone=chordPcs.indexOf(pc)>=0;
    const strong=Math.abs(n.tb/2-Math.round(n.tb/2))<1e-6;
    if(strong && !isTone) bad.push(`note ${i} at beat ${n.tb} is not in the chord`);
    if(!inKey && !isTone){
      const nx=C.notes[i+1];
      if(!(n.pass||n.appr)) bad.push(`note ${i} (${n.m}) is outside the key and the chord`);
      else if(!nx || Math.abs(nx.m-n.m)>2) bad.push(`note ${i} passes to nothing near it`);
    }
    if(n.appr && strong) bad.push(`note ${i} leans on a strong beat`);
    /* a breath: a rest of half a beat or more; never more than BREATH beats without one */
    const pv=C.notes[i-1];
    if(pv && n.tb-(pv.tb+pv.slot)>=GULP-1e-6) from=n.tb;
    run=Math.max(run, n.tb+n.slot-from);
  });
  if(run>BREATH+1e-6) bad.push(`${run} beats without a breath`);
  const last=C.notes[C.notes.length-1], lc=C.chords[last.chord];
  if(((last.m-C.key-lc.root)%12+12)%12!==0) bad.push("it does not end on its chord's root");
  for(let k=0;k<(C.times||1);k++){ const ms=C.notes.filter(n=>Math.floor(n.tb/C.one+1e-9)===k).map(n=>n.m), span=Math.max(...ms)-Math.min(...ms);
    if(span>SPANMAX) bad.push(`it reaches ${span} half steps (at most ${SPANMAX})`); }
  return bad;
}

/* ══ the licks: [id, group, chords, notes, extra] ══════════════════════════════════════════════════════════════════ */
const SW={sw:0.64};
const RAW=[
/* blues: blue notes passing by step, scoops, falls, a shout riff, a turnaround */
["w_blcry","blues","1d7 1d7","8q/ 7e 6e 5q b5e! 4e | 3q 1hv rq",{cm:"1m7 1m7", sw:0.64}],
["w_blfall","blues","1d7 4d7","5q 7e 8e 7q 5q | 3q 1q\\ rh",{cm:"1m7 4m7", sw:0.64}],
["w_blshout","blues","1d7 1d7","1e b3! 3 5 7q 5q | 8e- 7- 5- 3- 1q rq",{cm:"1m7 1m7", sw:0.64}],
["w_blturn","blues","1d7*2 4d7*2 1d7*2 5d7*2","8e 7 5 3 | 1 3 5 6 | 8 7 5 3 | 1q rq",{cm:"1m7*2 4m7*2 1m7*2 5d7*2", sw:0.64}],
["w_bllazy","blues","1d7 4d7","1q./ 3e 5q 6e 5e | 1h.v rq",{cm:"1m7 4m7", sw:0.64}],
["w_bltrill","blues","1d7 1d7","5hT 7q 5q | 3q 1h rq",{cm:"1m7 1m7"}],
["w_bldoit","blues","1d7 4d7 1d7","1q 3q 5h^ | 7,q 5,q 3,q\\ rq | 1h rh",{cm:"1m7 4m7 1m7", sw:0.64}],
/* jazz and bebop: two-five-one lines, enclosures, runs */
["w_jzbop","jazz","27 5d7 17","5,e 7, 1 2 3 2 1 7, | 3, 5, 7, 1 3,q 1e re | 3q 1q rh",SW],
["w_jzenc","jazz","27 5d7 17","5q 2e <e 1q 3q | 7,q 5,e 3,e 1,q re 2,e | 3h 1q rq",SW],
["w_jzrun","jazz","1M7 1M7","1s 2 3 4 5 6 7 8 7 6 5 4 3e 5e | 8q 5e 3e 1q rq",{cm:"1m7 1m7"}],
["w_jzbebop","jazz","5d7 1M7","8,e > 7, 6, 5, 4, 3, 2, | 1q 3q 1q rq",{cm:"5d7 1m7", sw:0.64}],
["w_jzarp","jazz","1M7 6m7","1e 3 5 7 5q rq | 1,e 3, 5, 7, 1q rq",{cm:"1m7 b6M7", sw:0.64}],
["w_jzbounce","jazz","1*2 6m*2 2m*2 5d7*2","3e 4 5 < | 1 3 5 3 | 1 3 5 < | 1q rq",{cm:"1m*2 b6*2 2o*2 5d7*2", sw:0.64}],
["w_jztrip","jazz","17 5d7","1t 2 3 5q 7q 5q | 1h rh",{cm:"1m7 5d7"}],
/* swing and big band: shout choruses, sax riffs, falls, kicks, doits */
["w_swshout","swing","1d7 4d7","5q-A 5q-A re 5e 6q | 8q\\ re 5e 1q rq",{cm:"1m7 4m7", sw:0.64}],
["w_swriff","swing","1 1","1e 3 5 6 5 3 1q | 1e 3 5 6 5 3 1e re",SW],
["w_swfall","swing","1 5 1","8q 7e 6e 5q 3q | 1q 2e 3e 5q\\ rq | 1h rh",SW],
["w_swbg","swing","1 6 2 5","3w | 1h rh | 3h 1h | 1h rh",{cm:"1 b6 4 5"}],
["w_swstab","swing","1 4","5e-A* re re 5e-* re 5e-* 5q-A* | 8e-A* re 6e-* re 8q-* rq",SW],
["w_swdoit","swing","1 4 1","1q 3q 5q^ rq | 1q 3q 5q^ rq | 8h rh",SW],
["w_swtrade","swing","1d7 1d7 4d7 1d7","1e 3 5 7 5q 3e 1e | 3h rh | 5,e 7, 1 3 1q 7,e 5,e | 1h rh",{cm:"1m7 1m7 4m7 1m7", sw:0.64}],
/* cool and modal jazz: soft, long, floating */
["w_clsoft","cool","1M7 4M7","3h 5q 7q | 3h 1q rq",{cm:"1m7 4m7"}],
["w_clmodal","cool","1 4","1q 2e 3e 5q 4e 3e | 5q 3q 1q rq",{cm:"1m7 4"}],
["w_clfloat","cool","1M7 6m7","7h 5q 3q | 1h. rq",{cm:"1m7 b6M7"}],
["w_clmute","cool","2m7 5d7 1M7","5q 3e 1e 7,q rq | 7,q 5,e 3,e 1,q rq | 3h 1q rq",{cm:"2m7b5 5d7 1m7", sw:0.6}],
["w_cldorian","cool","2m7 2m7","1e 2 3 4 5q 7q | 5e 4 3 2 1q rq",{cm:"1m7 1m7", sw:0.6}],
["w_clecho","cool","1M7 1M7","3q 5e 3e 1h | 3q 5e 3e 1q rq",{cm:"1m7 1m7", sw:0.6}],
["w_clopen","cool","1 4","1q 5q 8h | 5h 1q rq"],
/* funk horns: tight sixteenths, stabs, ghost notes, shakes */
["w_fkstab","funk","1d7 1d7","8s-A* rs rs 7s-* re 8s-* rs 5e-A* re 7q-* | 8s-A* rs rs 7s-* re 8s-* rs 5e-* re 1e-A* re",{cm:"1m7 1m7"}],
["w_fkline","funk","1d7 1d7","1s 1 b3! 3 5e 1s 7, 1e re 5s 4 b3! 2 | 1s 1 b3! 3 5e 7s 8 7e 5e 1e re",{cm:"1m7 1m7"}],
["w_fkghost","funk","1d7 1d7","5e 5sg 5s 7e 5e 8e. 7s 5e 3e | 1e 1sg 1s 3e 5e 1q rq",{cm:"1m7 1m7"}],
["w_fkshake","funk","1d7 1d7","8h~ 7e 5e 3e 1e | 8q\\ rq 7e 5e 1e re",{cm:"1m7 1m7"}],
["w_fkpush","funk","1d7 4d7","1e. 3s 5e 7e re 8e re 7e | 1e. 3s 5e 3e re 5e re 1e",{cm:"1m7 4m7"}],
["w_fkrise","funk","1d7 1d7","1s 2 3 5 6 5 3 2 1e re 5e re | 1s 2 3 5 6 5 3 5 8q rq",{cm:"1m7 1m7"}],
["w_fkhit","funk","1d7 1d7","8q-A* re 7e 5e 3e 1e 3e | 1q-A* rq rh",{cm:"1m7 1m7"}],
/* Motown and soul */
["w_mohook","motown","1 4","1q 3e 5e 5q 6q | 1q 3e 2e 1q rq"],
["w_mostax","motown","1d7 4d7","1e-A* re 1e-* 3e 5e-* re 3q | 1e-A* re 1e-* 3e 5e-* re 1q",{cm:"1m7 4m7"}],
["w_mopads","motown","1 6 4 5","3h/ 5h | 3h 1q rq | 3h 5h | 1h rh",{cm:"1 b6 4 5"}],
["w_moanswer","motown","1 1","5e 6e 8q 8e 6e 5q | 3q 1q rh"],
["w_mogroove","motown","1 6 2 5","1e 3 5 3 1q rq | 1,e 3, 5, 3, 1,q rq | 1e 3 5 3 1q rq | 1,e 3, 5, 3, 1,q rq",{cm:"1 b6 b3 b7"}],
["w_moclimb","motown","4 5 1","1e 2 3 4 5q 3q | 1e 2 3 4 5q rq | 8h rh"],
["w_mobright","motown","1 1","8q 8e 7e 8q 5q | 3q re 2e 1q rq"],
/* R&B and hip-hop */
["w_rbsmooth","rnb","1M7 4M7","7q/ 5e 3e 1q 2e 3e | 3h 1q rq",{cm:"1m7 4m7"}],
["w_rbloop","rnb","6 4","1q-A* 1e-* 3e-* 5q 3q | 3q 2e 1e 1q rq",{cm:"1 b6"}],
["w_rbhit","rnb","6 6","1e-A* re re 1s* 1s* 3e-* re 5e-* re | 1q-A* rq rh",{cm:"1 1"}],
["w_rbneo","rnb","1M7 4M7","8q 9e 8e 7q 5q | 5q 3e 2e 1q rq",{cm:"1m7 4m7"}],
["w_rbsigh","rnb","1 4","5h\\ 3q 2q | 1hv rh"],
["w_rbtrap","rnb","6 4","1t 1 1 3q 5q 3q | 1t 1 1 3q 1q rq",{cm:"1 b6"}],
["w_rbrun","rnb","1 1","8s 7 6 5 3 2 1e 3q 5q | 1h. rq"],
/* gospel */
["w_gsshout","gospel","1 1 1","1e 3 5 6 8q 6e 5e | 3e 5 6 5 3q rq | 1h rh"],
["w_gsamen","gospel","4 1","3h.v 2q | 3h 1q rq",{cm:"4m 1m"}],
["w_gsrun","gospel","1 1","8s 7 6 5 4 3 2 1 3e 5e 8q | 1h. rq"],
["w_gscall","gospel","1 4 1 5","5q 5e 6e 8q 5q | rq 1e 3e 5q 3q | 5q 5e 6e 8q 5q | rq 5e 3e 1q rq"],
["w_gsclimb","gospel","4*2 #4o*2 5*4","1q 3q 1q 3q 1h rh"],
["w_gshold","gospel","1 1","1q/ 3q 5hv | 8h. rq"],
["w_gsturn","gospel","1*2 3d7*2 6m*2 5d7*2","1e 3 5 < | 1 3 5 7 | 3 1 5, < | 1q rq",{cm:"1*2 b3*2 4m*2 5d7*2"}],
/* New Orleans and the second line */
["w_nltrad","nola","1 5d7 1","1q 3q 5q 6q | 1,q 3,e 5,e 7,q rq | 3h 1q rq",SW],
["w_nlclar","nola","1 1","8t 7 6 5q 3t 4 5 8q | 5q 3e 2e 1q rq"],
["w_nltail","nola","1 4","5,h 1qS rq | 5,h 1qS rq"],
["w_nlsecond","nola","1 5d7","1e 3 5 6 5 3 1q | 1e 2 3 5 3 2 1e re",SW],
["w_nlstop","nola","1 1","1q-A* rq 5q-A* rq | 8e 7 5 3 1q rq",SW],
["w_nlwail","nola","1 1","8h.v 7e 6e | 5q 3e 2e 1q rq",SW],
["w_nlbrass","nola","1 5d7","1e-A 1- 3- 5- 5q 3q | 7,e- 7,- 5,- 3,- 1,q rq",SW],
/* ska and reggae */
["w_skaline","ska","1 4","1e 3 5 3 8q 5q | 1e 3 5 3 1q rq"],
["w_skaoff","ska","1 4","1e-* 5-* 1-* 5-* 1-* 5-* 3q | 1e-* 5-* 1-* 5-* 1-* 5-* 1-* re"],
["w_skatwo","ska","1 6 4 5","3q 5q 8q 5q | 1h. rq | 3q 5q 8q 5q | 1h. rq",{cm:"1 b6 4 5"}],
["w_rgdub","ska","1 4","8qv rq 5q rq | 1hv rh"],
["w_rgroots","ska","1 4 5 1","1q. 3e 5q rq | 1q. 3e 5q rq | 1q. 3e 5q rq | 1h rh"],
["w_rgfall","ska","1 4","5h\\ 3q 1q | 3h\\ 1q rq"],
["w_skarun","ska","1 5","1s 2 3 4 5e 5 3e 1e 3q | 1s 2 3 4 5e 5 1q rq"],
/* Latin: salsa, mambo, bolero, cumbia, bossa */
["w_ltmambo","latin","1 5d7","1e-A* re 3e-* 5e-* re 3e-* 5q* | 7,e-A* re 2,e-* 4,e-* re 2,e-* 1,q*",{cm:"1 5d7"}],
["w_ltsalsa","latin","1 5d7","5e 5 6 5 5 3 1q | 7,e 7, 5, 7, 1,q rq"],
["w_ltmontuno","latin","1*2 4*2 5*2 4*2","1e 3 5 3 | 1 3 5 3 | 1 3 5 3 | 1q rq"],
["w_ltbolero","latin","1 5d7 1","5q. 6e 5q 3q | 7,q. 6,e 5,q rq | 1h rh"],
["w_ltcumbia","latin","1 5","3e 4 5 3 1q 5,q | 3,e 4, 5, 3, 1,q rq"],
["w_ltbossa","latin","2m7 5d7 1M7","5q. 3e 1h | 7,q. 5,e 3,q rq | 3h 1q rq",{cm:"2m7b5 5d7 1m7"}],
["w_ltcha","latin","1 5d7","1q 3q 5e 5e 5q | 7,q 5,e 3,e 1,q rq"],
/* Afrobeat */
["w_afhorn","afro","1d7 1d7","1e 1 b3! 3 5q 7q | 5e 3 1 7, 1q rq",{cm:"1m7 1m7"}],
["w_afstab","afro","1d7 4d7","8e-A* re re 7e-* re 5e-* 8q-* | 8e-A* re re 7e-* re 5e-* 1q-*",{cm:"1m7 4m7"}],
["w_afriff","afro","1d7 1d7 1d7 1d7","1e 3 5 1 rq 7,e 1e | 1e 3 5 1 rq 7,e 1e | 1e 3 5 1 rq 7,e 1e | 1e 3 5 1 rh",{cm:"1m7 1m7 1m7 1m7"}],
["w_afanswer","afro","1d7 4d7","5q 7q 8h | rq 3e 5e 1q rq",{cm:"1m7 4m7"}],
["w_aflow","afro","1d7 1d7","1,e 1, 5,q 7,e 1q. | 1,e 1, 5,q 7,e 1q re",{cm:"1m7 1m7"}],
["w_aftrill","afro","1d7 1d7","5hT 3e 5e 7q | 8q 7e 5e 1q rq",{cm:"1m7 1m7"}],
["w_afspace","afro","1d7 4d7","1q-A* rq rq 5q-* | 1q-A* rq 5,q-* 1q-*",{cm:"1m7 4m7"}],
/* disco */
["w_dsrunup","disco","1 1","1s 2 3 4 5 6 7 8 8q 5q | 8s 7 6 5 4 3 2 1 1q rq"],
["w_dshits","disco","1 4","8e-A* 8e-* re 7e-* 8q-* 5q* | 1e-A* 1e-* re 7,e-* 1q-* rq"],
["w_dsoct","disco","1 1","1e 8 1 8 3 5 8q | 1e 8 1 8 5 3 1 re"],
["w_dsswell","disco","6 4 1 5","5h./ rq | 5h. rq | 5h. rq | 1h. rq",{cm:"1 b6 b3 b7"}],
["w_dsriff","disco","1 4","1e 3 5 6 5 3 1 3 | 1e 3 5 6 5 3 1 re"],
["w_dssax","disco","1 4","8q/ 7e 5e 5q 6q | 1e 3 5 6 1q rq"],
["w_dsfall","disco","1 4","8h\\ 5h\\ | 1h\\ rh"],
/* pop */
["w_pohook","pop","1 5 6 4","1q 3e 5e 3q rq | 3,q 5,e 1e 5,q rq | 1,q 3,e 5,e 3,q rq | 5,q 1e 3e 1q rq",{cm:"1 b6 b7 1"}],
["w_pobright","pop","1 4","5e 6 5 3 1q 2q | 3e 2 1 2 1q rq"],
["w_posax","pop","6 4","1q/ 3e 5e 5q 3q | 3q 2e 1e 1q rq",{cm:"1 b6"}],
["w_polift","pop","4 5 1","1e 2 3 5 3q 1q | 1e 2 3 5 3q rq | 3h 1q rq"],
["w_poballad","pop","1 5 6 4","3h. rq | 3h. rq | 3h. rq | 1h. rq",{cm:"1 b7 b6 4"}],
["w_pobounce","pop","1 1","1e. 3s 5e 3e 1e. 3s 5q | 5e. 6s 5e 3e 1q rq"],
["w_potrill","pop","1 4","8hT 5q 3q | 1hT rh"],
/* rock horns */
["w_rkriff","rock","1 b7 4 1","1q 1e 3e 5q rq | 1,q 1,e 3,e 5,q rq | 1,q 1,e 3,e 5,q rq | 1h rh",{cm:"1 b7 b6 1"}],
["w_rkpower","rock","1 4","1q-A* 1q-* re 1e-* 1q-* | 1q-A* 1q-* re 1e-* 1q-*"],
["w_rkwail","rock","1d7 4d7","8q/ 8e 7e 5q b5e! 4e | 3q 1h\\ rq",{cm:"1m7 4m7"}],
["w_rkchug","rock","1 b6 b7 1","1e- 1- 1- 1- 1- 1- 3- re | 1e- 1- 1- 1- 1- 1- 3- re | 1e- 1- 1- 1- 1- 1- 3- re | 1e- 1- 1- 1- 1q rq"],
["w_rkanthem","rock","1 5 4 1","5q 5e 6e 5q 3q | 3h 1q rq | 5q 5e 6e 5q 3q | 1h rh"],
["w_rkfall","rock","1 1","1q 3q 5q 8q | 8h\\ rh"],
["w_rkboogie","rock","1d7 4d7","1e 3 5 6 7 6 5 3 | 1e 3 5 6 5 3 1 re",{cm:"1m7 4m7", sw:0.64}],
/* country and folk */
["w_cnwhistle","country","1 1","5q~ 3q 5q~ 3q | 1hv rh"],
["w_cnfiddle","country","1 5","1e 2 3 2 1 2 3 5 | 1 7, 5, 7, 1q rq"],
["w_cnstep","country","1 4 1","1q 3q 5q 3q | 1q 3q 5q rq | 3h 1q rq"],
["w_cnsteel","country","1 4","1h 3hS | 1h rh"],
["w_cnhoedown","country","1 5d7","1s 1 3 3 5 5 3 3 1e 1e 3q | 1s 1 3 3 5 5 3 3 1q rq"],
["w_cnfolk","country","1 4 5 1","3q 2e 1e 3q 5q | 1h rh | 3q 2e 1e 3q 5q | 1h rh"],
["w_cnrun","country","1 1","1e 2 b3! 3 5 6 5 3 | 1q 5,q 1q rq"],
/* slow and singing */
["w_bdlong","ballad","1 6 4 5","3h.v 2q | 3h.v rq | 1h.v 2q | 1h.v rq",{cm:"1 b6 4 5"}],
["w_bdlull","ballad","1 4 1 5","5h 3h | 5h 3q rq | 5h 3h | 1h rh"],
["w_bdcry","ballad","6 4","5h/v 3q 1q | 3hv 1q rq",{cm:"1 b6"}],
["w_bdhymn","ballad","1 4 5 1","1q 3q 5q 3q | 1h 3q rq | 3q 2q 1q 3q | 1h rh"],
["w_bdswell","ballad","1 1","5wv | 3h 1q rq"],
["w_bdsigh","ballad","1 4","8q 7q 5h | 3q 2q 1q rq"],
["w_bdend","ballad","4 5 1","1h. 3q | 1h. rq | 1hv rh"],
/* classical */
["w_csalberti","classical","1 5 1","1e 5 3 5 1 5 3 5 | 1e 5 3 5 1q rq | 1h rh"],
["w_cstrill","classical","1 5 1","3q 4q 5q 3q | 5hT 3q rq | 1h rh"],
["w_csscale","classical","1 1","1e 2 3 4 5 6 7 8 | 8 7 6 5 3 2 1 re"],
["w_csminuet","classical","1 5","5q 4e 3e 5q 8q | 5q 4e 3e 1q rq"],
["w_cschorale","classical","1 4 5 1","5h 3h | 5h 1q rq | 5h 3h | 1h rh"],
["w_csgrace","classical","1 1","5q ]s! 5e. 3q 1q | 3q ]s! 3e. 1q rq"],
["w_csseq","classical","1*2 4*2 5*2 1*2","3e 2 1 2 | 3 2 1 2 | 3 2 1 2 | 1q rq"],
/* marches and fanfares */
["w_mrfanfare","march","1 1","1t 1 1 5q 5t 5 5 8q | 5q 3q 1q rq"],
["w_mrstreet","march","1 5 1","1q. 1e 3q 5q | 1q. 1e 3q rq | 1h rh"],
["w_mrbugle","march","1 1","1e. 3s 5q 8q 5q | 3e. 5s 1q 1q rq"],
["w_mrtrio","march","4 1 5 1","1q 3q 5h | 5h 3q rq | 1q 3q 5h | 1h rh"],
["w_mrpiccolo","march","1 1","8s 7 8 7 8 9 8 7 5q 8q | 5s 4 5 4 5 6 5 4 3q 1e re"],
["w_mroompah","march","1 5 1","1q-A 5,q- 1q- 5,q- | 1q- 5,q- 1q- rq | 1h rh"],
["w_mrending","march","4 5 1","1,q 3,q 5,q 1q | 5,q 3,q 1,q rq | 1h. rq"],
/* section stabs and backgrounds */
["w_stpunch","stabs","1 4","8q-A* rq rh | 8q-A* rq rh"],
["w_stsync","stabs","1 4","5e-A* re re 5e-* re 5e-* re 5e-* | 1e-A* re re 1e-* re 1e-* rq"],
["w_stbg","stabs","1 6 2 5","5w | 5h. rq | 5w | 1h. rq",{cm:"1 b6 4 5"}],
["w_stswell","stabs","1 4","5h/* 3h* | 1h.\\* rq"],
["w_stfill","stabs","1 4","8e-A* 7e-* 5e-* re rh | 3e-A* 2e-* 1e-* re rh"],
["w_stcount","stabs","1 1","1q-A* 1q-* 1q-* 1q-* | 8q-A* rq rh"],
["w_strise","stabs","4 5 1","1q* 3q* 5h* | 1q* 3q* 5q* rq | 8h* rh"],
/* call and response */
["w_crcall","call","1 1","1q 3q 5q rq | 5q 3q 1q rq"],
["w_crhigh","call","1 4","8q 7e 5e 8q rq | 1q 3e 5e 1q rq"],
["w_crblues","call","1d7 4d7","5e 7 8 7 5q rq | 3e 5 1 3 1q rq",{cm:"1m7 4m7", sw:0.64}],
["w_crtrade","call","1 5 1 5","1e 2 3 5 3q rq | 3e 2 1 2 1q rq | 5e 6 8 6 5q rq | 1h rh"],
["w_crecho","call","1 1","5q 6e 5e 3q rq | 5q 6e 5e 1q rq"],
["w_crchoir","call","1 4 1 1","1e 3 5 6 5q rq | 1h.v rq | 5e 6 8 6 5q rq | 1h. rq"],
["w_crcoro","call","1 5d7","3e 5 8q 5q rq | 7e 5 3q 1q rq"],
/* fills and turnarounds */
["w_fiup","fills","1 1","1q rq 1s 2 3 4 5 6 7 8 | 8h rh"],
["w_fidown","fills","1 1","8s 7 6 5 4 3 2 1 3q 2q | 1h rh"],
["w_fiturn","fills","1*2 6m*2 2m*2 5*2","8e 7 5 3 | 5, 1 3 < | 1 3 5 < | 1q rq",{cm:"1*2 b6*2 4*2 5*2"}],
["w_fishake","fills","1 1","5h~ 3q 5q | 8h\\ rh"],
["w_fibreak","fills","1 1","1e-A* re 3e-* re 5e-* 6e-* 7e-* 8e-* | 8q-A* rq rh"],
["w_fiblues","fills","1d7 1d7","8e 7 6 b6! 5 b5! 4 3 | 1h. rq",{cm:"1m7 1m7"}],
["w_fistop","fills","1 1","8q-A* rq 5q-* rq | 1h\\ rh"]
];

const GROUP_IDS=["blues","jazz","swing","cool","funk","motown","rnb","gospel","nola","ska","latin","afro","disco","pop","rock","country","ballad","classical","march","stabs","call","fills"];
const GROUPS=GROUP_IDS.map(g=>[g, RAW.filter(r=>r[1]===g).map(r=>r[0])]);
const ORDER=[].concat(...GROUPS.map(g=>g[1]));
const LICKS={}; RAW.forEach(([id, g, ch, n, x])=>{ LICKS[id]=Object.assign({id, g, ch, n}, x||{}); });

/* ══ the words: the groups, each lick's name and its one line, English and Spanish ══════════════════════════════════ */
const W={
  lgw_blues:["Blues","Blues"], lgw_jazz:["Jazz and bebop","Jazz y bebop"], lgw_swing:["Swing and big band","Swing y big band"],
  lgw_cool:["Cool and modal jazz","Cool jazz y jazz modal"], lgw_funk:["Funk horns","Metales de funk"], lgw_motown:["Motown and soul","Motown y soul"],
  lgw_rnb:["R&B and hip-hop","R&B y hip-hop"], lgw_gospel:["Gospel","Gospel"], lgw_nola:["New Orleans and second line","Nueva Orleans y second line"],
  lgw_ska:["Ska and reggae","Ska y reggae"], lgw_latin:["Latin: salsa and mambo","Latino: salsa y mambo"], lgw_afro:["Afrobeat","Afrobeat"],
  lgw_disco:["Disco","Disco"], lgw_pop:["Pop","Pop"], lgw_rock:["Rock horns","Metales de rock"], lgw_country:["Country and folk","Country y folk"],
  lgw_ballad:["Slow and singing","Lentas y cantadas"], lgw_classical:["Classical","Clásica"], lgw_march:["Marches and fanfares","Marchas y fanfarrias"],
  lgw_stabs:["Section hits and backgrounds","Golpes de sección y fondos"], lgw_call:["Call and response","Pregunta y respuesta"],
  lgw_fills:["Fills and turnarounds","Rellenos y vueltas"],
  w_blcry:["Crying blues line","Línea de blues que llora","Slide up to the high home note, step down past the blue note, then rest on home.","Sube deslizando a la nota casa aguda, baja pasando por la nota blue y descansa en casa."],
  w_blfall:["Blues fall","Caída de blues","Up to the high home note and back, then let the last note fall away.","Sube a la nota casa aguda y vuelve; luego deja caer la última nota."],
  w_blshout:["Shout riff","Riff de shout","Up through the blue note to the seventh, then short notes down home.","Sube por la nota blue hasta la séptima y baja a casa con notas cortas."],
  w_blturn:["Blues turnaround","Vuelta de blues","Down one chord, up the next, two beats each, ending on the five chord.","Baja por un acorde y sube por el siguiente, dos tiempos cada uno, y termina en el acorde cinco."],
  w_bllazy:["Lazy shuffle","Shuffle tranquilo","A slow scoop into home, a small turn, then one long note.","Entra deslizando a casa, da una vuelta pequeña y toca una nota larga."],
  w_bltrill:["Blues trill","Trino de blues","Wiggle fast between two notes, then walk down home.","Alterna rápido entre dos notas y luego baja a casa."],
  w_bldoit:["Doit and fall","Doit y caída","Bend the end of a note up, then bend another one down.","Sube el final de una nota y luego baja el de otra."],
  w_jzbop:["Bebop line","Línea de bebop","Eighth notes over two, five, one, landing on the chord's notes.","Corcheas sobre dos, cinco, uno, cayendo en las notas de cada acorde."],
  w_jzenc:["Enclosure","Rodeo","Circle the home note from above and below before you land on it.","Rodea la nota casa por arriba y por abajo antes de llegar a ella."],
  w_jzrun:["Fast scale run","Escala rápida","Fast notes up the scale and back, then a calm finish.","Notas rápidas por la escala, arriba y abajo, y un final tranquilo."],
  w_jzbebop:["Bebop scale down","Escala bebop hacia abajo","Down the scale with one extra half step, so the chord notes land on the beat.","Baja por la escala con un semitono de más, así las notas del acorde caen en el tiempo."],
  w_jzarp:["Up the chords","Por los acordes","Climb each chord from the bottom: root, third, fifth, seventh.","Sube cada acorde desde abajo: raíz, tercera, quinta, séptima."],
  w_jzbounce:["Bebop bounce","Rebote de bebop","Four quick chords, with a half step leaning into each one.","Cuatro acordes rápidos, con un semitono que se apoya en cada uno."],
  w_jztrip:["Triplet start","Salida en tresillo","Three quick notes, then up the chord to the seventh.","Tres notas rápidas y luego sube por el acorde hasta la séptima."],
  w_swshout:["Shout chorus","Coro de shout","Loud repeated notes, a fall, then home. The whole band plays it together.","Notas fuertes repetidas, una caída y a casa. Toda la banda la toca junta."],
  w_swriff:["Sax section riff","Riff de saxos","A short swinging riff, played twice. Saxes play riffs like this behind a solo.","Un riff corto con swing, dos veces. Los saxos tocan riffs así detrás de un solo."],
  w_swfall:["Big fall-off","Gran caída","Down from the top, up again, and a long fall at the end.","Baja desde arriba, sube otra vez y una caída larga al final."],
  w_swbg:["Soft backgrounds","Fondos suaves","Long, quiet notes behind a singer. One note for each chord.","Notas largas y suaves detrás de un cantante. Una nota para cada acorde."],
  w_swstab:["Kicks and stabs","Golpes y acentos","Short, sharp notes that hit with the drums.","Notas cortas y fuertes que caen con la batería."],
  w_swdoit:["Doits","Doits","Up the chord, and bend the last note up at the end.","Sube por el acorde y dobla la última nota hacia arriba al final."],
  w_swtrade:["Trading fours","Intercambio de cuatro","Up the chord and back, rest, then the same on the four chord.","Sube por el acorde y vuelve, descansa, y lo mismo en el acorde cuatro."],
  w_clsoft:["Soft and cool","Suave y tranquila","Few notes, played softly. The seventh gives it a cool color.","Pocas notas, tocadas suave. La séptima le da un color tranquilo."],
  w_clmodal:["Modal vamp","Vamp modal","Small steps on one chord, then home on the four chord.","Pasos pequeños en un acorde y luego a casa en el acorde cuatro."],
  w_clfloat:["Floating line","Línea que flota","Start on the seventh and float down the chord.","Empieza en la séptima y baja flotando por el acorde."],
  w_clmute:["Muted whisper","Susurro con sordina","Quiet and close, down each chord of two, five, one.","Suave y cerca, bajando por cada acorde de dos, cinco, uno."],
  w_cldorian:["Dorian climb","Subida dórica","Up the scale to the seventh, then back down.","Sube por la escala hasta la séptima y vuelve a bajar."],
  w_clecho:["Echo phrase","Frase en eco","Say a short phrase, then say it again.","Di una frase corta y luego repítela."],
  w_clopen:["Open fifths","Quintas abiertas","Wide jumps: root, fifth, high root. It sounds open and calm.","Saltos amplios: raíz, quinta, raíz aguda. Suena abierto y tranquilo."],
  w_fkstab:["Funk stabs","Golpes de funk","Very short hits with gaps between. Keep them tight.","Golpes muy cortos con huecos entre ellos. Que sean precisos."],
  w_fkline:["Funk unison line","Línea de funk al unísono","A busy line with the blue note, played by all the horns together.","Una línea movida con la nota blue, que tocan todos los metales juntos."],
  w_fkghost:["Ghost notes","Notas fantasma","Soft, quick notes between the strong ones. Barely there.","Notas suaves y rápidas entre las fuertes. Casi no se oyen."],
  w_fkshake:["Shake and fall","Sacudida y caída","Shake a high note fast, walk down, then a fall.","Sacude rápido una nota aguda, baja caminando y luego una caída."],
  w_fkpush:["Push and punch","Empuje y golpe","A pickup into each beat, with short gaps to breathe.","Una nota de entrada en cada tiempo, con huecos cortos para respirar."],
  w_fkrise:["Rising sixteenths","Semicorcheas que suben","Fast notes up and down, then up to the high home note.","Notas rápidas arriba y abajo, y luego a la nota casa aguda."],
  w_fkhit:["Hit on the one","Golpe en el uno","A big hit on beat one, a walk down, and one more hit.","Un golpe fuerte en el tiempo uno, una bajada y otro golpe."],
  w_mohook:["Soul horn hook","Gancho de soul","A short, happy hook that is easy to sing.","Un gancho corto y alegre, fácil de cantar."],
  w_mostax:["Memphis punches","Golpes de Memphis","Short punches with a rest after each one.","Golpes cortos con un descanso después de cada uno."],
  w_mopads:["Long soul pads","Fondos largos de soul","Slide into long notes that hold up the singer.","Entra deslizando a notas largas que sostienen al cantante."],
  w_moanswer:["Answer the singer","Responder al cantante","Up to the high home note and down, like an answer.","Sube a la nota casa aguda y baja, como una respuesta."],
  w_mogroove:["Soul groove","Groove de soul","The same small shape on four chords.","La misma figura pequeña en cuatro acordes."],
  w_moclimb:["Climb to the chorus","Subida al estribillo","Up the scale on the four chord, then the five, then home.","Sube por la escala en el acorde cuatro, luego el cinco, y a casa."],
  w_mobright:["Bright soul line","Línea brillante de soul","Start high and bright, then step down home.","Empieza aguda y brillante y luego baja a casa."],
  w_rbsmooth:["Smooth R&B","R&B suave","Slide into the seventh and float down. Relaxed.","Entra deslizando a la séptima y baja flotando. Relajada."],
  w_rbloop:["Sampled horn loop","Loop de metales","A short line that repeats, like a sample in a beat.","Una línea corta que se repite, como un sample en un ritmo."],
  w_rbhit:["Hip-hop brass hit","Golpe de metales de hip-hop","Two quick hits, then the big one.","Dos golpes rápidos y luego el grande."],
  w_rbneo:["Neo-soul ninth","Novena de neo-soul","Touch the ninth above the root for a warm color.","Toca la novena encima de la raíz para un color cálido."],
  w_rbsigh:["Slow sigh","Suspiro lento","A long note that falls, then steps down home.","Una nota larga que cae y luego baja a casa."],
  w_rbtrap:["Trap horn","Metales de trap","Three fast notes, then up the chord.","Tres notas rápidas y luego sube por el acorde."],
  w_rbrun:["R&B run","Carrera de R&B","A quick run down from the top, then up the chord.","Una carrera rápida desde arriba y luego sube por el acorde."],
  w_gsshout:["Shout praise","Alabanza de shout","Up to the high home note and around it, full of joy.","Sube a la nota casa aguda y da vueltas, llena de alegría."],
  w_gsamen:["Amen ending","Final de amén","The four chord, then home. The sound of an amen.","El acorde cuatro y luego a casa. El sonido de un amén."],
  w_gsrun:["Gospel run","Carrera de gospel","A fast run down the scale, then up the chord.","Una carrera rápida por la escala hacia abajo y luego sube por el acorde."],
  w_gscall:["Call to the choir","Llamada al coro","A call on beat one, then an answer after a rest.","Una llamada en el tiempo uno y luego una respuesta tras un descanso."],
  w_gsclimb:["Church climb","Subida de iglesia","Four, sharp four, five: each chord one step higher.","Cuatro, cuatro sostenido, cinco: cada acorde un paso más alto."],
  w_gshold:["Hallelujah hold","Aleluya sostenido","Up the chord and hold the top with a gentle wobble.","Sube por el acorde y sostén la nota de arriba con un vibrato suave."],
  w_gsturn:["Gospel turnaround","Vuelta de gospel","Up each chord, leaning into the next by a half step.","Sube por cada acorde y entra al siguiente por medio tono."],
  w_nltrad:["Dixieland lead","Melodía de Dixieland","A bright trumpet tune, up the chord and home.","Una melodía brillante de trompeta, sube por el acorde y a casa."],
  w_nlclar:["Clarinet curls","Rizos de clarinete","Quick turns in threes, around the top of the chord.","Vueltas rápidas de tres en tres, alrededor de la parte de arriba del acorde."],
  w_nltail:["Trombone smear","Smear de trombón","Slide up from the low fifth to the root, like a trombone.","Desliza desde la quinta grave hasta la raíz, como un trombón."],
  w_nlsecond:["Second line riff","Riff de second line","A street parade riff, on the home chord and the five chord.","Un riff de desfile, en el acorde casa y en el acorde cinco."],
  w_nlstop:["Stop-time hits","Golpes con paradas","Two hits with space, then a walk down home.","Dos golpes con espacio y luego una bajada a casa."],
  w_nlwail:["Clarinet wail","Lamento de clarinete","A long high note with vibrato, then down home.","Una nota larga y aguda con vibrato y luego a casa."],
  w_nlbrass:["Brass band march","Marcha de brass band","Short notes up, short notes down, like a street band.","Notas cortas que suben y bajan, como una banda en la calle."],
  w_skaline:["Ska horn line","Línea de ska","A quick, happy line up the chord, twice.","Una línea rápida y alegre por el acorde, dos veces."],
  w_skaoff:["Ska skank","Skank de ska","Short notes that bounce between the root and the fifth.","Notas cortas que rebotan entre la raíz y la quinta."],
  w_skatwo:["Two-tone melody","Melodía two-tone","Up to the high home note and back, on four chords.","Sube a la nota casa aguda y vuelve, en cuatro acordes."],
  w_rgdub:["Dub echo","Eco de dub","A few notes with lots of space, like an echo.","Pocas notas con mucho espacio, como un eco."],
  w_rgroots:["Roots reggae horns","Metales de reggae roots","The same small line on each chord, with a rest to breathe.","La misma línea pequeña en cada acorde, con un descanso para respirar."],
  w_rgfall:["Lazy reggae falls","Caídas de reggae","Long notes that fall away slowly.","Notas largas que caen despacio."],
  w_skarun:["Ska run up","Carrera de ska","A fast run up to the fifth, then down the chord.","Una carrera rápida hasta la quinta y luego baja por el acorde."],
  w_ltmambo:["Mambo horn riff","Riff de mambo","Short, punchy notes that dance around the beat.","Notas cortas y fuertes que bailan alrededor del tiempo."],
  w_ltsalsa:["Salsa trumpets","Trompetas de salsa","A bright line on the home chord, answered on the five chord.","Una línea brillante en el acorde casa, con respuesta en el acorde cinco."],
  w_ltmontuno:["Montuno line","Línea de montuno","The same small shape that moves with the chords.","La misma figura pequeña que se mueve con los acordes."],
  w_ltbolero:["Bolero","Bolero","Slow and tender, with a small turn on each chord.","Lento y tierno, con una vuelta pequeña en cada acorde."],
  w_ltcumbia:["Cumbia clarinet","Clarinete de cumbia","Up and down the chord in steady eighths.","Arriba y abajo por el acorde en corcheas parejas."],
  w_ltbossa:["Bossa line","Línea de bossa","Long and gentle over two, five, one.","Larga y suave sobre dos, cinco, uno."],
  w_ltcha:["Cha-cha answer","Respuesta de chachachá","Up the chord, three short notes, then an answer.","Sube por el acorde, tres notas cortas y luego una respuesta."],
  w_afhorn:["Afrobeat horn line","Línea de metales de afrobeat","A strong line through the blue note, played by all the horns.","Una línea fuerte por la nota blue, que tocan todos los metales."],
  w_afstab:["Afrobeat stabs","Golpes de afrobeat","Short hits that lock with the drums.","Golpes cortos que encajan con la batería."],
  w_afriff:["Long repeating riff","Riff largo que se repite","One short riff, four times. Breathe in each gap.","Un riff corto, cuatro veces. Respira en cada hueco."],
  w_afanswer:["Horns answer the voice","Los metales responden a la voz","A call up to the high root, then a short answer.","Una llamada hasta la raíz aguda y luego una respuesta corta."],
  w_aflow:["Low baritone riff","Riff grave de barítono","A low riff with the seventh just below the root.","Un riff grave con la séptima justo debajo de la raíz."],
  w_aftrill:["Trill and drive","Trino y empuje","A long trill, then up the chord and down home.","Un trino largo, luego sube por el acorde y baja a casa."],
  w_afspace:["Space and punch","Espacio y golpe","A few short hits with a lot of space.","Pocos golpes cortos con mucho espacio."],
  w_dsrunup:["Disco string run","Carrera de cuerdas disco","A fast run up the scale, then a fast run down.","Una carrera rápida por la escala hacia arriba y luego hacia abajo."],
  w_dshits:["Disco horn hits","Golpes de metales disco","Short, bright hits on the home chord and the four chord.","Golpes cortos y brillantes en el acorde casa y en el acorde cuatro."],
  w_dsoct:["Octave jumps","Saltos de octava","Jump between the low and high root, then up the chord.","Salta entre la raíz grave y la aguda y luego sube por el acorde."],
  w_dsswell:["Disco swell","Crecida disco","One long note on each chord, sliding into the first.","Una nota larga en cada acorde, entrando deslizando a la primera."],
  w_dsriff:["Four-on-the-floor riff","Riff de cuatro en el piso","Steady eighths up and down the chord.","Corcheas parejas arriba y abajo por el acorde."],
  w_dssax:["Disco sax","Saxo disco","Slide up high, then up the four chord.","Sube deslizando a lo agudo y luego sube por el acorde cuatro."],
  w_dsfall:["Mirror-ball falls","Caídas de bola de espejos","Three long notes, each one falling away.","Tres notas largas, cada una cae al final."],
  w_pohook:["Pop horn hook","Gancho de pop","The same short hook on four chords.","El mismo gancho corto en cuatro acordes."],
  w_pobright:["Bright pop line","Línea brillante de pop","Small steps around the chord. Happy and simple.","Pasos pequeños alrededor del acorde. Alegre y sencilla."],
  w_posax:["Pop sax","Saxo pop","Slide in, climb the chord, then walk down home.","Entra deslizando, sube por el acorde y baja a casa."],
  w_polift:["Chorus lift","Subida al estribillo","Up the scale on two chords, then land home.","Sube por la escala en dos acordes y aterriza en casa."],
  w_poballad:["Pop ballad tones","Notas de balada pop","One long note on each chord, with a breath between.","Una nota larga en cada acorde, con una respiración entre ellas."],
  w_pobounce:["Bouncy pop","Pop saltarín","Short, bouncy notes up the chord and back.","Notas cortas y saltarinas por el acorde, arriba y abajo."],
  w_potrill:["Sparkle trill","Trino brillante","Two trills, high and then low.","Dos trinos, uno agudo y uno grave."],
  w_rkriff:["Rock horn riff","Riff de metales de rock","The same riff on four chords, strong and steady.","El mismo riff en cuatro acordes, fuerte y firme."],
  w_rkpower:["Power hits","Golpes potentes","Loud, short hits on the root.","Golpes fuertes y cortos en la raíz."],
  w_rkwail:["Blues-rock wail","Lamento de blues rock","Slide up high, down past the blue note, and fall at the end.","Sube deslizando, baja pasando por la nota blue y cae al final."],
  w_rkchug:["Horn chug","Golpeteo de metales","Fast short notes on the root of each chord.","Notas cortas y rápidas en la raíz de cada acorde."],
  w_rkanthem:["Stadium anthem","Himno de estadio","A big, simple tune everyone can sing.","Una melodía grande y sencilla que todos pueden cantar."],
  w_rkfall:["Big rock fall","Gran caída de rock","Up the chord to the top, then one long fall.","Sube por el acorde hasta arriba y luego una caída larga."],
  w_rkboogie:["Boogie horns","Metales de boogie","Up and down the chord with a swing.","Arriba y abajo por el acorde con swing."],
  w_cnwhistle:["Train whistle","Silbato de tren","Shake a note, step down, shake it again.","Sacude una nota, baja un paso y sacúdela otra vez."],
  w_cnfiddle:["Fiddle tune","Melodía de violín","Small steps around home, then down the five chord.","Pasos pequeños alrededor de casa y luego baja por el acorde cinco."],
  w_cnstep:["Two-step melody","Melodía de two-step","Up and down the chord, steady as a dance.","Arriba y abajo por el acorde, firme como un baile."],
  w_cnsteel:["Pedal-steel sigh","Suspiro de pedal steel","A long note, then glide up to the next one.","Una nota larga y luego desliza hasta la siguiente."],
  w_cnhoedown:["Hoedown","Hoedown","Fast pairs of notes up the chord, like a square dance.","Pares de notas rápidas por el acorde, como un baile de granero."],
  w_cnfolk:["Folk tune","Melodía folk","A simple tune that rests on the four chord and on home.","Una melodía sencilla que descansa en el acorde cuatro y en casa."],
  w_cnrun:["Bluegrass run","Carrera de bluegrass","A quick run up through the blue note, then home.","Una carrera rápida por la nota blue y luego a casa."],
  w_bdlong:["Long singing line","Línea larga que canta","Long notes with vibrato, one step at a time.","Notas largas con vibrato, un paso a la vez."],
  w_bdlull:["Lullaby","Canción de cuna","Gentle notes that rock back and forth.","Notas suaves que se mecen de un lado a otro."],
  w_bdcry:["Crying ballad","Balada que llora","Slide into a long note, then down home.","Entra deslizando a una nota larga y luego baja a casa."],
  w_bdhymn:["Hymn tune","Himno","A simple, steady tune on four chords.","Una melodía sencilla y firme en cuatro acordes."],
  w_bdswell:["Long held note","Nota larga sostenida","One long note with vibrato, then home.","Una nota larga con vibrato y luego a casa."],
  w_bdsigh:["Gentle sighs","Suspiros suaves","Two small steps down, like a sigh.","Dos pasos pequeños hacia abajo, como un suspiro."],
  w_bdend:["Ballad ending","Final de balada","Three long notes on the four, five and home chords.","Tres notas largas en los acordes cuatro, cinco y casa."],
  w_csalberti:["Broken chords","Acordes partidos","Root, fifth, third, fifth: the chord in a steady pattern.","Raíz, quinta, tercera, quinta: el acorde en un patrón parejo."],
  w_cstrill:["Classical trill","Trino clásico","Up the scale, a trill on the five chord, then home.","Sube por la escala, un trino en el acorde cinco y luego a casa."],
  w_csscale:["Scale up and down","Escala arriba y abajo","The whole scale up and back down.","Toda la escala hacia arriba y de vuelta hacia abajo."],
  w_csminuet:["Minuet","Minueto","A graceful dance tune in small steps.","Una melodía de baile elegante en pasos pequeños."],
  w_cschorale:["Chorale","Coral","Slow notes, like a choir singing together.","Notas lentas, como un coro que canta junto."],
  w_csgrace:["Grace notes","Notas de adorno","A tiny quick note just before the main note.","Una nota pequeña y rápida justo antes de la nota principal."],
  w_csseq:["Falling sequence","Secuencia que baja","The same small turn on four chords.","La misma vuelta pequeña en cuatro acordes."],
  w_mrfanfare:["Royal fanfare","Fanfarria real","Three quick notes, twice, then up to the top.","Tres notas rápidas, dos veces, y luego hasta arriba."],
  w_mrstreet:["Street march","Marcha de calle","A steady march tune, strong on every beat.","Una melodía de marcha firme, fuerte en cada tiempo."],
  w_mrbugle:["Bugle call","Toque de corneta","Only the chord's notes, like a bugle.","Solo las notas del acorde, como una corneta."],
  w_mrtrio:["March trio","Trío de marcha","A calm, singing tune from the middle of a march.","Una melodía tranquila y cantada del centro de una marcha."],
  w_mrpiccolo:["Piccolo part","Parte de flautín","Quick high notes that dance above the band.","Notas agudas y rápidas que bailan encima de la banda."],
  w_mroompah:["Oom-pah","Oom-pah","Root and low fifth in turn, like a tuba.","Raíz y quinta grave por turnos, como una tuba."],
  w_mrending:["Grand ending","Gran final","Up the four chord, down the five, and home.","Sube por el acorde cuatro, baja por el cinco y a casa."],
  w_stpunch:["Punches on the one","Golpes en el uno","One big hit at the start of each bar.","Un golpe grande al principio de cada compás."],
  w_stsync:["Off-beat hits","Golpes a contratiempo","Short hits between the beats.","Golpes cortos entre los tiempos."],
  w_stbg:["Long backgrounds","Fondos largos","Long, soft notes behind a solo.","Notas largas y suaves detrás de un solo."],
  w_stswell:["Swell hits","Golpes que crecen","Slide into a held chord note, then let it fall.","Entra deslizando a una nota larga y luego déjala caer."],
  w_stfill:["Answer fills","Rellenos de respuesta","Three short notes down, twice.","Tres notas cortas hacia abajo, dos veces."],
  w_stcount:["Count-off hits","Golpes de cuenta","Four hits on the beat, then one high hit.","Cuatro golpes en el tiempo y luego uno agudo."],
  w_strise:["Rising section line","Línea de sección que sube","Up each chord together, then a big high note.","Suben juntos por cada acorde y luego una nota aguda grande."],
  w_crcall:["Call and answer","Llamada y respuesta","Up the chord, rest, then down the chord.","Sube por el acorde, descansa y luego baja por el acorde."],
  w_crhigh:["Call high, answer on the four","Llamada aguda, respuesta en el cuatro","A high call, then the same idea on the four chord.","Una llamada aguda y luego la misma idea en el acorde cuatro."],
  w_crblues:["Blues call and answer","Llamada y respuesta de blues","A call around the seventh, then an answer on the four chord.","Una llamada alrededor de la séptima y luego una respuesta en el acorde cuatro."],
  w_crtrade:["Two-bar trade","Intercambio de dos compases","Two short phrases ask, two short phrases answer.","Dos frases cortas preguntan y dos frases cortas responden."],
  w_crecho:["Echo answer","Respuesta en eco","Play a phrase, then answer it almost the same.","Toca una frase y luego respóndela casi igual."],
  w_crchoir:["Preacher and choir","Predicador y coro","A call, then a long held answer, twice.","Una llamada y luego una respuesta larga, dos veces."],
  w_crcoro:["Coro answer","Respuesta de coro","A call up the chord, then an answer on the five chord.","Una llamada por el acorde y luego una respuesta en el acorde cinco."],
  w_fiup:["Run up into the chorus","Carrera hacia el estribillo","One note, a rest, then a fast run up to the top.","Una nota, un descanso y luego una carrera rápida hasta arriba."],
  w_fidown:["Run down home","Carrera hacia casa","A fast run down the scale, then home.","Una carrera rápida por la escala hacia abajo y luego a casa."],
  w_fiturn:["Turnaround fill","Relleno de vuelta","Four chords, two beats each, leaning into each new one.","Cuatro acordes de dos tiempos, apoyándose en cada uno nuevo."],
  w_fishake:["Shake into the next","Sacudida hacia lo siguiente","Shake a note, step around it, then fall.","Sacude una nota, da una vuelta y luego cae."],
  w_fibreak:["Break fill","Relleno de corte","Short notes climbing to the top, then one hit.","Notas cortas que suben hasta arriba y luego un golpe."],
  w_fiblues:["Blues ending","Final de blues","Down by half steps from the top, then home.","Baja por semitonos desde arriba y luego a casa."],
  w_fistop:["Stop and fall","Parada y caída","Two hits, then a long fall home.","Dos golpes y luego una caída larga a casa."]
};
const WORDS={};
Object.keys(W).forEach(k=>{ const v=W[k];
  if(v.length===2) WORDS[k]={en:v[0], es:v[1]};
  else { WORDS["lk_"+k]={en:v[0], es:v[1]}; WORDS["ld_"+k]={en:v[2], es:v[3]}; } });

const API={GROUPS, ORDER, LICKS, WORDS, REACH, NO_LICKS, SPANMAX, reach, compile, check, parseChords, _resolve:resolve};
if(typeof module!=="undefined" && module.exports) module.exports=API; else root.AOGBandLicks=API;
})(typeof window!=="undefined"?window:this);
