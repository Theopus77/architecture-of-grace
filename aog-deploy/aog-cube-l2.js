/* AOG-CUBE-L2-V1 (2026-10-12) — Jimmy: "DO the short way first and everything else as well." Level 2, the faster way:
   the way most speedcubers solve, in four steps instead of seven.
     1. The white cross in one go (no daisy): each white edge straight down to its place.
     2. Pairs: each white corner meets its middle edge on top, and the two go in together (F2L).
     3. The yellow top in two looks: the yellow cross, then the yellow corners, one set of moves each.
     4. The last layer in two looks: the corners, then the edges, one set of moves each.
   Every move is one a learner can read and do by hand. plan2(cube) gives the same shape as aog-cube.js's plan():
   stages of parts, each part a note (what it does), its colors, and its moves.
     node aog-deploy/aog-cube-l2.js test   (solves mixed cubes and checks every step) */
(function (root) {
"use strict";
const C = (typeof module!=="undefined" && module.exports) ? require("./aog-cube.js") : root.AOGCube;
const W="W", Y="Y";

/* a single piece followed through turns: where it is, and which way one of its stickers faces */
const MV={};
["U","D","R","L","F","B"].forEach(f => ["", "2", "'"].forEach(s => { const m=C.parse(f+s); MV[f+s]={n:m.n, sel:m.sel, R:C.rotQ(m.n, m.q), face:f}; }));
const turn=(st, m) => { const M=MV[m]; if(C.dot(st[0], M.n)!==M.sel) return st; return [C.mulV(M.R, st[0]), C.mulV(M.R, st[1])]; };
const key=st => st[0].join(",")+"/"+st[1].join(",");
function stateOf(c, p){ const f=Object.keys(p.cols).sort()[0]; return [c.pos(p), C.mulV(p.M, C.FACES[f])]; }
/* where a piece belongs now: its home, turned the way the whole cube has been turned (the centers show how) */
function turnOfCube(c){
  const u=c.pos(c.P.find(q => q.kind===1 && C.eqV(q.home,[0,1,0]))), f=c.pos(c.P.find(q => q.kind===1 && C.eqV(q.home,[0,0,1])));
  const x=[u[1]*f[2]-u[2]*f[1], u[2]*f[0]-u[0]*f[2], u[0]*f[1]-u[1]*f[0]];
  return [x[0],u[0],f[0], x[1],u[1],f[1], x[2],u[2],f[2]];
}
function homeOf(c, p){ const f=Object.keys(p.cols).sort()[0], M=turnOfCube(c); return [C.mulV(M, p.home), C.mulV(M, C.FACES[f])]; }
/* how far, at least, a piece (or a pair) is from home, with these turns: filled outward from home */
function table(homes, moves){
  const D=new Map(), start=homes, q=[start]; D.set(start.map(key).join("|"), 0);
  while(q.length){ const s=q.shift(), d=D.get(s.map(key).join("|"));
    for(const m of moves){ const t=s.map(x => turn(x, m)), k=t.map(key).join("|"); if(!D.has(k)){ D.set(k, d+1); q.push(t); } } }
  return D;
}
const ALL18=Object.keys(MV), RUF=["U","U'","U2","R","R'","R2","F","F'"];
const sameFace=(a,b) => b && MV[a].face===MV[b].face;
const opp={U:"D",D:"U",R:"L",L:"R",F:"B",B:"F"};
/* the shortest turns that bring `move` pieces home and keep `keep` pieces home */
function search(states, homes, keepIdx, moves, tables, maxDepth, cap){
  const hk=homes.map(key); let nodes=0, path=[];
  const h=s => { let m=0; tables.forEach(([idx, T]) => { const d=T.get(idx.map(i => key(s[i])).join("|")); m=Math.max(m, d===undefined ? 99 : d); }); return m; };
  const at=s => s.every((x,i) => key(x)===hk[i]);
  function dfs(s, g, bound, last){
    const f=h(s); if(g+f>bound) return g+f; if(at(s)) return true; if(++nodes>cap) return Infinity;
    let min=Infinity;
    for(const m of moves){ if(last && (MV[m].face===MV[last].face || (opp[MV[m].face]===MV[last].face && MV[m].face<MV[last].face))) continue;
      path.push(m); const r=dfs(s.map(x => turn(x, m)), g+1, bound, m); if(r===true) return true; if(r<min) min=r; path.pop(); }
    return min;
  }
  let bound=h(states);
  while(bound<=maxDepth){ path=[]; const r=dfs(states, 0, bound, null); if(r===true) return path; if(r===Infinity) return null; bound=r; }
  return null;
}
let EDGE18=null, PAIR=null;

function plan2(start){
  const c=start.clone(), stages=[]; let stage=null;
  const begin=k => { stage={key:k, parts:[]}; stages.push(stage); };
  const part=(note, vars, seq) => { const moves=C.simplify(C.split(seq)); if(!moves.length) return; c.run(moves); stage.parts.push({note, vars:vars||{}, moves}); };
  const colorsOf=p => Object.values(p.cols).filter(x => x!==W && x!==Y);

  /* hold it: white on the bottom */
  if(c.center("D")!==W){ begin("hold"); part("holdWhite", {}, ["x","x'","x2","z","z'"].find(t => c.clone().run(t).center("D")===W)); }

  /* 1 · the white cross in one go: one edge at a time, the fewest turns, the edges already down kept down */
  if(!C.GOALS.cross(c)){
    begin("cross");
    const edges=c.P.filter(p => p.kind===2 && Object.values(p.cols).includes(W));
    if(!EDGE18){ EDGE18=new Map(); }
    const placed=[];
    for(let n=0;n<4;n++){
      /* the edge that is quickest to place next */
      let best=null;
      for(const p of edges){ if(placed.includes(p) || c.pieceOk(p)) continue;
        const ps=placed.concat([p]), st=ps.map(q => stateOf(c,q)), hm=ps.map(q => homeOf(c,q));
        const tbs=ps.map((q,i) => { const kk=hm[i].map(String).join(";"); if(!EDGE18.has(kk)) EDGE18.set(kk, table([hm[i]], ALL18)); return [[i], EDGE18.get(kk)]; });
        const path=search(st, hm, null, ALL18, tbs, 9, 200000);
        if(path && (!best || path.length<best.path.length)) best={p, path};
      }
      if(!best) break;
      part("crossOne", {c:colorsOf(best.p)[0]}, best.path.join(" "));
      placed.push(best.p);
      edges.filter(p => !placed.includes(p) && c.pieceOk(p)).forEach(p => placed.push(p));
      if(C.GOALS.cross(c)) break;
    }
  }

  /* 2 · pairs: hold the empty slot at the front right; bring the corner and its edge together on top and put them in */
  if(!C.GOALS.middle(c)){
    begin("f2l");
    if(!PAIR) PAIR=new Map();
    for(let n=0;n<4 && !C.GOALS.middle(c);n++){
      const slots=[];   /* each unfinished pair, with the turn of the whole cube that brings its slot to the front right */
      for(const yt of ["","y","y2","y'"]){
        const t=c.clone().run(yt);
        /* the pair that belongs at the front right after this turn: its colors are the front and right centers */
        const a=t.center("F"), b=t.center("R");
        const pc=t.P.find(p => p.kind===3 && [W,a,b].every(x => Object.values(p.cols).includes(x)));
        const pe=t.P.find(p => p.kind===2 && [a,b].every(x => Object.values(p.cols).includes(x)));
        if(t.pieceOk(pc) && t.pieceOk(pe)) continue;
        slots.push({yt, t, pc, pe, a, b});
      }
      let best=null;
      for(const sl of slots){
        const t=sl.t, keep=t.P.filter(p => p!==sl.pc && p!==sl.pe && p.kind>1 && !Object.values(p.cols).includes(Y) && t.pieceOk(p));
        /* a piece stuck in another slot comes out first: that slot to the front right, the right side up and down */
        let pre="", tt=t, pc=sl.pc, pe=sl.pe;
        const inOtherSlot=p => { const pos=tt.pos(p); return pos[1]<=0 && !(pos[0]===1 && pos[2]===1); };
        for(let k=0;k<2 && (inOtherSlot(pc) || inOtherSlot(pe));k++){
          const stuck=inOtherSlot(pc) ? pc : pe;
          const yy=["y","y2","y'"].find(r => { const ps=tt.clone().run(r).pos(tt.clone().run(r).P.find(x => x.home===stuck.home)); return ps[0]===1 && ps[2]===1; });
          pre+=" "+yy+" R U R' "+C.invertSeq(C.split(yy)).join(" ");
          tt=t.clone().run(pre);
          pc=tt.P.find(p => p.home===sl.pc.home); pe=tt.P.find(p => p.home===sl.pe.home);
        }
        const kp=keep.map(p => tt.P.find(q => q.home===p.home));
        const all=[pc, pe].concat(kp), st=all.map(p => stateOf(tt,p)), hm=all.map(p => homeOf(tt,p));
        const pk=hm[0].map(String).join(";")+"|"+hm[1].map(String).join(";");
        if(!PAIR.has(pk)) PAIR.set(pk, table([hm[0], hm[1]], RUF));
        /* each piece already home has its own "how far" too, so a path that knocks one out is dropped early */
        const tbs=[[[0,1], PAIR.get(pk)]].concat(hm.slice(2).map((h,i) => { const kk="1:"+h.map(String).join(";"); if(!PAIR.has(kk)) PAIR.set(kk, table([h], RUF)); return [[i+2], PAIR.get(kk)]; }));
        const path=search(st, hm, null, RUF, tbs, 14, 400000);
        if(!path) continue;
        const total=C.simplify(C.split(pre)).length+path.length;
        if(!best || total<best.total) best={sl, pre, path, total};
      }
      if(!best) break;
      if(best.sl.yt) part("pairHold", {a:best.sl.a, b:best.sl.b}, best.sl.yt);
      if(best.pre) part("pairOut", {a:best.sl.a, b:best.sl.b}, C.simplify(C.split(best.pre)).join(" "));
      part("pairIn", {a:best.sl.a, b:best.sl.b}, best.path.join(" "));
    }
  }

  /* 3 · the yellow top in two looks */
  const U4=["","U","U2","U'"];
  const yEdgesUp=t => t.P.filter(p => p.kind===2 && Object.values(p.cols).includes(Y)).every(p => t.stickers(p).U===Y);
  const yAllUp=t => t.P.filter(p => p.kind>1 && Object.values(p.cols).includes(Y)).every(p => t.stickers(p).U===Y);
  if(C.GOALS.middle(c) && !yAllUp(c)){
    begin("oll");
    if(!yEdgesUp(c)){
      const E=[["ycrossLine","F R U R' U' F'"],["ycrossEll","F U R U' R' F'"]];
      let best=null;
      for(const a of U4) for(const [n1,s1] of E){ const one=a+" "+s1; if(yEdgesUp(c.clone().run(one))){ const L=C.simplify(C.split(one)).length; if(!best || L<best.L) best={L, parts:[[n1, one]]}; } }
      if(!best) for(const a of U4) for(const [n1,s1] of E) for(const b of U4) for(const [n2,s2] of E){ const t=c.clone().run(a+" "+s1+" "+b+" "+s2); if(yEdgesUp(t)){ const L=C.simplify(C.split(a+" "+s1+" "+b+" "+s2)).length; if(!best || L<best.L) best={L, parts:[["ycrossDot", a+" "+s1], [n2, b+" "+s2]]}; } }
      if(best) best.parts.forEach(([n,s]) => part(n, {}, s));
    }
    if(!yAllUp(c)){
      const OC=[["sune","R U R' U R U2 R'"],["antisune","R U2 R' U' R U' R'"],["ollH","R U R' U R U' R' U R U2 R'"],["ollPi","R U2 R2 U' R2 U' R2 U2 R"],
        ["ollU","R2 D R' U2 R D' R' U2 R'"],["ollT","R M' U R' U' R' M F R F'"],["ollL","F R' F' R M' U R U' R' M"]];
      let best=null;
      for(const a of U4) for(const [n,s] of OC){ const seq=a+" "+s; if(yAllUp(c.clone().run(seq))){ const L=C.simplify(C.split(seq)).length; if(!best || L<best.L) best={L, n, seq}; } }
      if(best) part(best.n, {}, best.seq);
      else { let k=0; while(!yAllUp(c) && k++<4){ let b2=null; for(const a of U4){ const t=c.clone().run(a+" "+OC[0][1]); const sc=t.P.filter(p => p.kind===3 && Object.values(p.cols).includes(Y) && t.stickers(p).U===Y).length; if(!b2 || sc>b2.sc) b2={sc, a}; } part("sune", {}, b2.a+" "+OC[0][1]); } }
    }
  }

  /* 4 · the last layer in two looks: corners, then edges */
  const cornersOk=t => U4.some(a => { const u=t.clone().run(a); return u.P.filter(p => p.kind===3 && Object.values(p.cols).includes(Y)).every(p => u.pieceOk(p)); });
  if(!c.solved()){
    begin("pll");
    if(!cornersOk(c)){
      const PC=[["pllA","R' F R' B2 R F' R' B2 R2"],["pllA2","R2 B2 R F R' B2 R F' R"],["pllT","R U R' U' R' F R2 U' R' U' R U R' F'"],["pllY","F R U' R' U' R U R' F' R U R' U' R' F R F'"]];
      let best=null;
      for(const a of U4) for(const [n,s] of PC){ const seq=a+" "+s; if(cornersOk(c.clone().run(seq))){ const L=C.simplify(C.split(seq)).length; if(!best || L<best.L) best={L, n, seq}; } }
      if(best) part(best.n, {}, best.seq);
    }
    if(!c.solved()){
      const PE=[["pllUa","R U' R U R U R U' R' U' R2"],["pllUb","R2 U R U R' U' R' U' R' U R'"],["pllH","M2 U M2 U2 M2 U M2"],["pllZ","M' U M2 U M2 U M' U2 M2"]];
      let best=null;
      for(const a of U4){ if(c.clone().run(a).solved()){ best={L:a?1:0, n:"lineUp", seq:a}; break; } }
      if(!best) for(const a of U4) for(const [n,s] of PE) for(const b of U4){ const seq=a+" "+s+" "+b; if(c.clone().run(seq).solved()){ const L=C.simplify(C.split(seq)).length; if(!best || L<best.L) best={L, n, seq}; } }
      if(best) part(best.n, {}, best.seq);
    }
  }
  return {stages, solved:c.solved()};
}
/* the four steps, and how far a cube has come through them */
const STAGES2=["cross","f2l","oll","pll"];
const GOALS2={cross:C.GOALS.cross, f2l:C.GOALS.middle, oll:C.GOALS.yface, pll:c => c.solved()};
function stageOf2(c){ for(let i=0;i<STAGES2.length;i++) if(!GOALS2[STAGES2[i]](c)) return i; return STAGES2.length; }

const api={plan2, STAGES2, GOALS2, stageOf2};
if(typeof module!=="undefined" && module.exports) module.exports=api;
else root.AOGCubeL2=api;

if(typeof module!=="undefined" && require.main===module && process.argv[2]==="test"){
  let seed=5; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const N=+process.argv[3]||200; let total=0, worst=0, ms=0; const per={}; const used={};
  for(let i=0;i<N;i++){
    const c=new C.Cube().run(["","x","z'","x2 y"][i%4]).run(C.scramble(25,rnd));
    const t0=Date.now(), r=plan2(c); ms+=Date.now()-t0;
    if(!r.solved){ console.log("FAIL not solved", i, JSON.stringify(r.stages.map(s=>s.key))); process.exit(1); }
    const t=c.clone(); let n=0;
    for(const st of r.stages){ st.parts.forEach(p => { t.run(p.moves); n+=p.moves.length; per[st.key]=(per[st.key]||0)+p.moves.length; used[p.note]=(used[p.note]||0)+1; });
      if(st.key!=="hold" && stageOf2(t)<=STAGES2.indexOf(st.key)){ console.log("FAIL stage", st.key, "left unfinished", i); process.exit(1); } }
    total+=n; worst=Math.max(worst,n);
  }
  console.log("ok:", N, "cubes · average", (total/N).toFixed(1), "moves · longest", worst, "· per step", JSON.stringify(Object.fromEntries(Object.entries(per).map(([k,v]) => [k, +(v/N).toFixed(1)]))), "·", Math.round(ms/N)+"ms each");
  console.log("cases:", JSON.stringify(used));
}
})(typeof window!=="undefined" ? window : this);
