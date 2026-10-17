/* AOG-CUBE-SHORT-V1 (2026-10-12) — Jimmy: "Let's get Quantum with it … Big leap". The short way: any mixed cube in
   about 20 moves (no cube needs more than 20; experts aim for that). The beginner's way on /cube teaches; this one
   shows how short a solve can be.
   It is Herbert Kociemba's two-phase method. Phase 1 turns the cube until every corner and edge is "facing right"
   and the four middle-layer edges are in the middle layer; from there phase 2 finishes with only the turns that keep
   that true (top and bottom any way, the four sides only twice). Each phase searches deeper and deeper, steered by
   tables that say how far, at least, every position is from its goal. The tables are built the first time (a second
   or two, off the page in a worker); the turns themselves are taken from aog-cube.js, so the two always agree.
     node aog-deploy/aog-cube-short.js test   (solves mixed cubes and checks each one really ends solved) */
(function (root) {
"use strict";
if(typeof importScripts==="function" && typeof window==="undefined" && !root.AOGCube) importScripts("aog-cube.js");   /* in a worker */
const C = (typeof module!=="undefined" && module.exports) ? require("./aog-cube.js") : root.AOGCube;

/* the corners and edges, named and numbered as Kociemba does; the 54 squares numbered U1–U9, R, F, D, L, B */
const CF=[[8,9,20],[6,18,38],[0,36,47],[2,45,11],[29,26,15],[27,44,24],[33,53,42],[35,17,51]];
const CC=[["U","R","F"],["U","F","L"],["U","L","B"],["U","B","R"],["D","F","R"],["D","L","F"],["D","B","L"],["D","R","B"]];
const EF=[[5,10],[7,19],[3,37],[1,46],[32,16],[28,25],[30,43],[34,52],[23,12],[21,41],[50,39],[48,14]];
const EC=[["U","R"],["U","F"],["U","L"],["U","B"],["D","R"],["D","F"],["D","L"],["D","B"],["F","R"],["F","L"],["B","L"],["B","R"]];
const ORDER=["U","R","F","D","L","B"];

/* a cube from aog-cube.js as 54 squares, each named by the side whose center has that color */
function facelets(cube){
  const sideOf={}; ORDER.forEach(f => { sideOf[cube.center(f)]=f; });
  const out=[]; ORDER.forEach(f => C.facelets(f).forEach(([pos,dir]) => out.push(sideOf[cube.colorAt(pos,dir)])));
  return out;
}
/* the squares as corners and edges: where each piece is, and which way it is turned */
function cubie(fl){
  const cp=[], co=[], ep=[], eo=[];
  for(let i=0;i<8;i++){
    let o=0; for(;o<3;o++) if(fl[CF[i][o]]==="U" || fl[CF[i][o]]==="D") break;
    const a=fl[CF[i][(o+1)%3]], b=fl[CF[i][(o+2)%3]];
    for(let j=0;j<8;j++) if(CC[j][1]===a && CC[j][2]===b){ cp[i]=j; co[i]=o%3; break; }
  }
  for(let i=0;i<12;i++) for(let j=0;j<12;j++){
    if(fl[EF[i][0]]===EC[j][0] && fl[EF[i][1]]===EC[j][1]){ ep[i]=j; eo[i]=0; break; }
    if(fl[EF[i][0]]===EC[j][1] && fl[EF[i][1]]===EC[j][0]){ ep[i]=j; eo[i]=1; break; }
  }
  return {cp, co, ep, eo};
}
/* a then b (Kociemba's "replaced by" product) */
function mul(a, b){
  const r={cp:[], co:[], ep:[], eo:[]};
  for(let i=0;i<8;i++){ r.cp[i]=a.cp[b.cp[i]]; r.co[i]=(a.co[b.cp[i]]+b.co[i])%3; }
  for(let i=0;i<12;i++){ r.ep[i]=a.ep[b.ep[i]]; r.eo[i]=(a.eo[b.ep[i]]+b.eo[i])%2; }
  return r;
}
const id=() => ({cp:[0,1,2,3,4,5,6,7], co:[0,0,0,0,0,0,0,0], ep:[0,1,2,3,4,5,6,7,8,9,10,11], eo:[0,0,0,0,0,0,0,0,0,0,0,0]});
/* the 18 turns: U U2 U' R R2 R' F … B', each as a cubie, read straight from aog-cube.js */
let MOVE=null, NAMES=null;
function moves(){
  if(MOVE) return;
  MOVE=[]; NAMES=[];
  ORDER.forEach(f => { const one=cubie(facelets(new C.Cube().move(f))); let m=one; ["", "2", "'"].forEach(s => { MOVE.push(m); NAMES.push(f+s); m=mul(m, one); }); });
}

/* coordinates: a number for each part of the state that matters to a phase */
const Cnk=(n,k) => { if(k<0 || n<k) return 0; let r=1; for(let i=0;i<k;i++) r=r*(n-i)/(i+1); return Math.round(r); };
const getTwist=c => { let t=0; for(let i=0;i<7;i++) t=t*3+c.co[i]; return t; };
const setTwist=(c,t) => { let s=0; for(let i=6;i>=0;i--){ c.co[i]=t%3; s+=c.co[i]; t=Math.floor(t/3); } c.co[7]=(3-s%3)%3; };
const getFlip=c => { let t=0; for(let i=0;i<11;i++) t=t*2+c.eo[i]; return t; };
const setFlip=(c,t) => { let s=0; for(let i=10;i>=0;i--){ c.eo[i]=t%2; s+=c.eo[i]; t=Math.floor(t/2); } c.eo[11]=s%2; };
const getSlice=c => { let a=0, x=0; for(let j=11;j>=0;j--) if(c.ep[j]>=8){ a+=Cnk(11-j, x+1); x++; } return a; };
const setSlice=(c,idx) => { const other=[0,1,2,3,4,5,6,7], sl=[8,9,10,11]; let x=4; c.ep=new Array(12).fill(-1);
  for(let j=0;j<12;j++){ if(x>0 && idx-Cnk(11-j,x)>=0){ c.ep[j]=sl[4-x]; idx-=Cnk(11-j,x); x--; } }
  let k=0; for(let j=0;j<12;j++) if(c.ep[j]<0) c.ep[j]=other[k++]; };
/* a permutation's number (its rank) and back */
const rank=p => { const n=p.length; let r=0; for(let i=0;i<n;i++){ let s=0; for(let j=i+1;j<n;j++) if(p[j]<p[i]) s++; r=r*(n-i)+s; } return r; };
const unrank=(r,n) => { const d=new Array(n); for(let i=n-1;i>=0;i--){ d[i]=r%(n-i); r=Math.floor(r/(n-i)); }
  const left=[...Array(n).keys()], p=[]; for(let i=0;i<n;i++) p.push(left.splice(d[i],1)[0]); return p; };

const P2=[0,1,2,4,7,9,10,11,13,16];   /* the turns phase 2 may use: U U2 U' R2 F2 D D2 D' L2 B2 */
let T=null;
function tables(){
  if(T) return T; moves();
  const N1=2187, N2=2048, N3=495, N4=40320, N5=40320, N6=24;
  const twistM=new Uint16Array(N1*18), flipM=new Uint16Array(N2*18), sliceM=new Uint16Array(N3*18), cpM=new Uint16Array(N4*18), udM=new Uint16Array(N5*18), spM=new Uint8Array(N6*18);
  for(let t=0;t<N1;t++){ const c=id(); setTwist(c,t); for(let m=0;m<18;m++) twistM[t*18+m]=getTwist(mul(c,MOVE[m])); }
  for(let t=0;t<N2;t++){ const c=id(); setFlip(c,t); for(let m=0;m<18;m++) flipM[t*18+m]=getFlip(mul(c,MOVE[m])); }
  for(let t=0;t<N3;t++){ const c=id(); setSlice(c,t); for(let m=0;m<18;m++) sliceM[t*18+m]=getSlice(mul(c,MOVE[m])); }
  for(let t=0;t<N4;t++){ const c=id(); c.cp=unrank(t,8); for(let m=0;m<18;m++) cpM[t*18+m]=rank(mul(c,MOVE[m]).cp); }
  for(let t=0;t<N5;t++){ const c=id(); c.ep=unrank(t,8).concat([8,9,10,11]); for(const m of P2) udM[t*18+m]=rank(mul(c,MOVE[m]).ep.slice(0,8)); }
  for(let t=0;t<N6;t++){ const c=id(); c.ep=[0,1,2,3,4,5,6,7].concat(unrank(t,4).map(v => v+8)); for(const m of P2) spM[t*18+m]=rank(mul(c,MOVE[m]).ep.slice(8).map(v => v-8)); }
  /* how far, at least, from the goal: filled outward from the goal, one turn at a time */
  const prune=(na, nb, ma, mb, list) => { const P=new Int8Array(na*nb).fill(-1); P[0]=0; let done=1, d=0;
    while(done<na*nb){ let any=false; for(let i=0;i<na*nb;i++){ if(P[i]!==d) continue; const a=Math.floor(i/nb), b=i%nb;
        for(const m of list){ const j=ma[a*18+m]*nb+mb[b*18+m]; if(P[j]<0){ P[j]=d+1; done++; any=true; } } }
      if(!any) break; d++; } return P; };
  const ALL=[...Array(18).keys()];
  T={twistM, flipM, sliceM, cpM, udM, spM,
    p1a:prune(N1,N3,twistM,sliceM,ALL), p1b:prune(N2,N3,flipM,sliceM,ALL), p2a:prune(N4,N6,cpM,spM,P2), p2b:prune(N5,N6,udM,spM,P2)};
  return T;
}

/* the short way for a cube from aog-cube.js: a list of turns (U R2 F' …) */
function solve(cube, opts){
  opts=opts||{}; const t0=Date.now(), limit=opts.ms||2500, enough=opts.enough||20;
  const T=tables(), start=cubie(facelets(cube));
  if(start.cp.some(v => v===undefined) || start.ep.some(v => v===undefined)) return null;
  const tw0=getTwist(start), fl0=getFlip(start), sl0=getSlice(start);
  let best=null; const path1=[], path2=[];
  const face=m => Math.floor(m/3), skip=(m,last) => last>=0 && (face(m)===face(last) || face(m)===face(last)-3);
  function phase2(cp, ud, sp, togo, last){
    if(togo===0) return cp===0 && ud===0 && sp===0;
    if(Math.max(T.p2a[cp*24+sp], T.p2b[ud*24+sp])>togo) return false;
    for(const m of P2){ if(skip(m,last)) continue; path2.push(m);
      if(phase2(T.cpM[cp*18+m], T.udM[ud*18+m], T.spM[sp*18+m], togo-1, m)) return true; path2.pop(); }
    return false;
  }
  function phase1(tw, fl, sl, togo, last){
    if(Date.now()-t0>limit || (best && best.length<=enough)) return;
    if(togo===0){
      if(tw || fl || sl) return;
      if(path1.length && P2.includes(path1[path1.length-1])) return;   /* found already, one turn shorter */
      let c=start; path1.forEach(m => { c=mul(c, MOVE[m]); });
      const cp=rank(c.cp), ud=rank(c.ep.slice(0,8)), sp=rank(c.ep.slice(8).map(v => v-8));
      const room=(best ? best.length-1 : 30)-path1.length;
      for(let d=0; d<=Math.min(room, 18); d++){ path2.length=0; if(phase2(cp, ud, sp, d, path1.length ? path1[path1.length-1] : -1)){ best=path1.concat(path2); break; } }
      return;
    }
    if(Math.max(T.p1a[tw*495+sl], T.p1b[fl*495+sl])>togo) return;
    for(let m=0;m<18;m++){ if(skip(m,last)) continue; path1.push(m);
      phase1(T.twistM[tw*18+m], T.flipM[fl*18+m], T.sliceM[sl*18+m], togo-1, m); path1.pop();
      if(Date.now()-t0>limit || (best && best.length<=enough)) return; }
  }
  for(let d=0; d<=(opts.depth||12); d++){ phase1(tw0, fl0, sl0, d, -1); if(Date.now()-t0>limit || (best && best.length<=enough)) break; }
  return best ? best.map(m => NAMES[m]) : null;
}

const api={solve, tables, cubie, facelets};
if(typeof module!=="undefined" && module.exports) module.exports=api;
else root.AOGShort=api;
/* in a worker: {cube: json} in, {moves} out, so the page never waits */
if(typeof importScripts==="function" && typeof window==="undefined" && root.AOGCube){
  root.onmessage=e => { const c=C.Cube.fromJSON(e.data.cube); const m=c ? solve(c, {ms:e.data.ms||2500}) : null; root.postMessage({id:e.data.id, moves:m}); };
}

if(typeof module!=="undefined" && require.main===module && process.argv[2]==="test"){
  const fail=m => { console.log("FAIL", m); process.exit(1); };
  for(let t=0;t<2187;t+=7){ const c=id(); setTwist(c,t); if(getTwist(c)!==t) fail("twist "+t); }
  for(let t=0;t<495;t++){ const c=id(); setSlice(c,t); if(getSlice(c)!==t) fail("slice "+t); }
  for(let t=0;t<40320;t+=97){ if(rank(unrank(t,8))!==t) fail("rank "+t); }
  let t0=Date.now(); tables(); const build=Date.now()-t0;
  let seed=11; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  let total=0, worst=0, ms=0; const N=+process.argv[3]||60;
  for(let i=0;i<N;i++){
    const c=new C.Cube().run(["","y","x2","z' y"][i%4]).run(C.scramble(30, rnd));
    t0=Date.now(); const s=solve(c, {ms:3000}); ms+=Date.now()-t0;
    if(!s) fail("no solution "+i);
    if(!c.clone().run(s).solved()) fail("not solved by "+s.join(" "));
    total+=s.length; worst=Math.max(worst, s.length);
  }
  if(!solve(new C.Cube()) || solve(new C.Cube()).length!==0) fail("a solved cube needs no moves");
  console.log("ok:", N, "cubes, average", (total/N).toFixed(1), "moves, longest", worst, "· tables", build+"ms · solve", Math.round(ms/N)+"ms each");
}
})(typeof window!=="undefined" ? window : this);
