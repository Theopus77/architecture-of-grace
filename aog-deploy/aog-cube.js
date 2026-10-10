/* AOG-CUBE-ENGINE-V1 (2026-10-10) — Jimmy: "a step by step 3d interactive engine … instructions on how to
   make and finish a rubric cube." The puzzle itself, with no drawing in it: the 26 pieces, the turns, and a
   teacher that solves any mixed cube the same way the lessons on /cube teach it (the layer-by-layer method:
   daisy, white cross, white corners, middle layer, yellow cross, yellow face, yellow corners, yellow edges).
   Every move it gives is one a learner can read and do by hand.
   Coordinates: x to the right (R), y up (U), z toward you (F). White is on the bottom, yellow on top, green
   in front. A piece keeps its home spot and a turn matrix M; where it is now is M·home.
   tools: node aog-deploy/aog-cube.js test   (solves thousands of mixed cubes and checks every step) */
(function (root) {
"use strict";

const FACES = {U:[0,1,0], D:[0,-1,0], R:[1,0,0], L:[-1,0,0], F:[0,0,1], B:[0,0,-1]};
const HOME_COLOR = {U:"Y", D:"W", F:"G", B:"B", R:"O", L:"R"};
const FACE_NAMES = ["U","D","R","L","F","B"];

const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mulV = (M,v) => [M[0]*v[0]+M[1]*v[1]+M[2]*v[2], M[3]*v[0]+M[4]*v[1]+M[5]*v[2], M[6]*v[0]+M[7]*v[1]+M[8]*v[2]];
const mulM = (A,B) => { const C=new Array(9); for(let r=0;r<3;r++) for(let c=0;c<3;c++) C[r*3+c]=A[r*3]*B[c]+A[r*3+1]*B[3+c]+A[r*3+2]*B[6+c]; return C; };
const eqV = (a,b) => a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2];
const ID = [1,0,0, 0,1,0, 0,0,1];
const faceOf = v => FACE_NAMES.find(f => eqV(FACES[f], v));

/* rotation about a unit axis by an angle (radians), right-handed */
function rot(a, th){
  const c=Math.cos(th), s=Math.sin(th), t=1-c, [x,y,z]=a;
  return [t*x*x+c, t*x*y-s*z, t*x*z+s*y,
          t*x*y+s*z, t*y*y+c, t*y*z-s*x,
          t*x*z-s*y, t*y*z+s*x, t*z*z+c];
}
const rotQ = (a, q) => rot(a, -q*Math.PI/2).map(Math.round);   // q quarter turns clockwise, seen from the end of a

/* every move a learner can make: the face turns, the middle slices, and turning the whole cube */
const MOVES = {
  U:{n:FACES.U, sel:1}, D:{n:FACES.D, sel:1}, R:{n:FACES.R, sel:1}, L:{n:FACES.L, sel:1}, F:{n:FACES.F, sel:1}, B:{n:FACES.B, sel:1},
  M:{n:FACES.L, sel:0}, E:{n:FACES.D, sel:0}, S:{n:FACES.F, sel:0},
  x:{n:FACES.R, sel:"all"}, y:{n:FACES.U, sel:"all"}, z:{n:FACES.F, sel:"all"}
};
function parse(tok){
  const m=/^([UDRLFBMESxyz])(2|')?$/.exec(tok); if(!m) return null;
  const q = m[2]==="2"?2 : m[2]==="'"?-1 : 1;
  return {base:m[1], q, n:MOVES[m[1]].n, sel:MOVES[m[1]].sel};
}
const inLayer = (mv, p) => mv.sel==="all" || dot(p, mv.n)===mv.sel;
const invert = tok => tok.endsWith("2") ? tok : tok.endsWith("'") ? tok.slice(0,-1) : tok+"'";
const invertSeq = seq => seq.slice().reverse().map(invert);
const split = s => (Array.isArray(s) ? s : String(s).trim().split(/\s+/)).filter(Boolean);

/* ── the cube ── */
function solvedPieces(){
  const P=[];
  for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++){
    if(!x&&!y&&!z) continue;
    const home=[x,y,z], cols={};
    FACE_NAMES.forEach(f => { const d=FACES[f]; if(dot(home,d)===1) cols[f]=HOME_COLOR[f]; });
    P.push({home, M:ID.slice(), cols, kind:Object.keys(cols).length});   // kind 1 centre · 2 edge · 3 corner
  }
  return P;
}
class Cube {
  constructor(pieces){ this.P = pieces || solvedPieces(); }
  clone(){ return new Cube(this.P.map(p => ({home:p.home, M:p.M.slice(), cols:p.cols, kind:p.kind}))); }
  pos(p){ return mulV(p.M, p.home); }
  move(tok){
    const mv = typeof tok==="string" ? parse(tok) : tok; if(!mv) return this;
    const R = rotQ(mv.n, mv.q);
    for(const p of this.P){ if(inLayer(mv, this.pos(p))) p.M = mulM(R, p.M); }
    return this;
  }
  run(seq){ split(seq).forEach(t => this.move(t)); return this; }
  /* the colour seen at a spot, looking in from the side `dir` */
  colorAt(pos, dir){
    for(const p of this.P){
      if(!eqV(this.pos(p), pos)) continue;
      for(const f in p.cols){ if(eqV(mulV(p.M, FACES[f]), dir)) return p.cols[f]; }
      return null;
    }
    return null;
  }
  center(face){ return this.colorAt(FACES[face], FACES[face]); }
  faceOfColor(col){ return FACE_NAMES.find(f => this.center(f)===col); }
  /* the stickers of a piece as {worldFace: colour} */
  stickers(p){ const o={}; for(const f in p.cols) o[faceOf(mulV(p.M, FACES[f]))]=p.cols[f]; return o; }
  find(colors){ const want=colors.slice().sort().join(""); return this.P.find(p => Object.values(p.cols).sort().join("")===want); }
  /* a piece is home when each sticker faces the centre of its own colour */
  pieceOk(p){ const s=this.stickers(p); return Object.keys(s).every(f => this.center(f)===s[f]); }
  solved(){ return this.P.every(p => this.pieceOk(p)); }
  faceletKey(){ return FACE_NAMES.map(f => facelets(f).map(([pos,dir]) => this.colorAt(pos,dir)||"?").join("")).join("/"); }
  toJSON(){ return this.P.map(p => p.M.join("")).join("|"); }
  static fromJSON(s){ const c=new Cube(); const parts=String(s||"").split("|"); if(parts.length!==c.P.length) return null;
    for(let i=0;i<parts.length;i++){ const m=parts[i].match(/-?\d/g); if(!m||m.length!==9) return null; c.P[i].M=m.map(Number); } return c; }
}

/* the nine spots on one face, read in the usual order (top row first, left to right, as you look at the face) */
function facelets(f){
  const n=FACES[f], out=[];
  const up = (f==="U") ? [0,0,-1] : (f==="D") ? [0,0,1] : [0,1,0];
  const right = [up[1]*n[2]-up[2]*n[1], up[2]*n[0]-up[0]*n[2], up[0]*n[1]-up[1]*n[0]];
  for(let r=1;r>=-1;r--) for(let c=-1;c<=1;c++)
    out.push([[n[0]+up[0]*r+right[0]*c, n[1]+up[1]*r+right[1]*c, n[2]+up[2]*r+right[2]*c], n]);
  return out;
}

/* ── tidy a list of moves: U U → U2, U U' → nothing ── */
function simplify(seq){
  const out=[];
  for(const tok of seq){
    const m=parse(tok); if(!m) continue;
    const last = out.length ? parse(out[out.length-1]) : null;
    if(last && last.base===m.base){
      out.pop();
      const q=((last.q+m.q)%4+4)%4;
      if(q===1) out.push(m.base); else if(q===2) out.push(m.base+"2"); else if(q===3) out.push(m.base+"'");
    } else out.push(tok);
  }
  return out;
}

/* ── the stages, as the lessons name them ── */
const W="W", Y="Y";
const isWhiteEdge = (c,p) => p.kind===2 && Object.values(p.cols).includes(W);
const isWhiteCorner = (c,p) => p.kind===3 && Object.values(p.cols).includes(W);
const isMidEdge = (c,p) => p.kind===2 && !Object.values(p.cols).includes(W) && !Object.values(p.cols).includes(Y);
const isYellowEdge = (c,p) => p.kind===2 && Object.values(p.cols).includes(Y);
const isYellowCorner = (c,p) => p.kind===3 && Object.values(p.cols).includes(Y);
const yellowFace = c => c.faceOfColor(Y);
function yellowUpCount(c, test){
  const yf=yellowFace(c); let n=0;
  for(const p of c.P){ if(!test(c,p)) continue; const s=c.stickers(p); if(s[yf]===Y) n++; }
  return n;
}
/* corners of the yellow layer sit right next to each other, whatever the top layer's turn */
function topCornersRelative(c){
  for(let k=0;k<4;k++){
    const t=c.clone().run(k? (["","U","U2","U'"][k]) : "");
    if(t.P.filter(p => isYellowCorner(t,p)).every(p => t.pieceOk(p))) return true;
  }
  return false;
}
const GOALS = {
  cross:    c => c.P.filter(p => isWhiteEdge(c,p)).every(p => c.pieceOk(p)),
  corners:  c => GOALS.cross(c) && c.P.filter(p => isWhiteCorner(c,p)).every(p => c.pieceOk(p)),
  middle:   c => GOALS.corners(c) && c.P.filter(p => isMidEdge(c,p)).every(p => c.pieceOk(p)),
  ycross:   c => GOALS.middle(c) && yellowUpCount(c, isYellowEdge)===4,
  yface:    c => GOALS.ycross(c) && yellowUpCount(c, isYellowCorner)===4,
  ycorners: c => GOALS.yface(c) && topCornersRelative(c),
  done:     c => c.solved()
};
const STAGES = ["cross","corners","middle","ycross","yface","ycorners","done"];
function stageOf(c){ for(let i=0;i<STAGES.length;i++){ if(!GOALS[STAGES[i]](c)) return i; } return STAGES.length; }

/* ── the teacher ── */
const ALG = {
  sexy: "R U R' U'",
  midRight: "U R U' R' U' F' U F",
  midLeft: "U' L' U L U F U' F'",
  ycross: "F R U R' U' F'",
  sune: "R U R' U R U2 R'",
  aperm: "R' F R' B2 R F' R' B2 R2",
  uperm: "R2 U R U R' U' R' U' R' U R'"
};
const Y_TURNS = ["", "y", "y2", "y'"];
const U_TURNS = ["", "U", "U2", "U'"];

/* a tiny search for one piece: which few turns lift a white edge to the top, white side up, and keep the others there */
function daisyMoves(c, edge, keep){
  const yf=yellowFace(c), n=FACES[yf];
  const all=[]; ["U","D","R","L","F","B"].forEach(f => all.push(f, f+"'", f+"2"));
  const track=[edge].concat(keep).map(p => ({pos:c.pos(p), w:mulV(p.M, FACES[Object.keys(p.cols).find(f=>p.cols[f]===W)])}));
  const ok = t => t.every(s => dot(s.pos,n)===1 && eqV(s.w,n));
  const step = (t, mv) => { const R=rotQ(mv.n,mv.q); return t.map(s => inLayer(mv,s.pos) ? {pos:mulV(R,s.pos), w:mulV(R,s.w)} : s); };
  for(let depth=0; depth<=6; depth++){
    const path=[];
    const dfs = (t, d, lastBase) => {
      if(d===0) return ok(t);
      for(const tok of all){
        const mv=parse(tok); if(mv.base===lastBase) continue;
        path.push(tok); if(dfs(step(t,mv), d-1, mv.base)) return true; path.pop();
      }
      return false;
    };
    if(dfs(track, depth, null)) return path;
  }
  return null;
}

/* plan(cube) → the whole solve as stages → parts → moves. Each part carries a note key and words to fill in. */
function plan(start){
  const c=start.clone(), stages=[];
  let stage=null;
  const begin = key => { stage={key, parts:[]}; stages.push(stage); };
  const part = (note, vars, seq) => { const moves=simplify(split(seq)); if(!moves.length && note!=="already") return; c.run(moves); stage.parts.push({note, vars:vars||{}, moves}); };
  const guard = () => { if(++guard.n>400) throw new Error("stuck"); };
  guard.n=0;
  const colorsOf = p => Object.values(p.cols).filter(x => x!==W && x!==Y);

  /* hold it: white on the bottom */
  if(c.center("D")!==W){
    begin("hold");
    const turn=["x","x'","x2","z","z'"].find(t => c.clone().run(t).center("D")===W);
    part("holdWhite", {}, turn);
  }

  /* 1 · the daisy, then the white cross */
  if(!GOALS.cross(c)){
    begin("cross");
    const petals=[];
    for(const col of ["G","O","B","R"]){
      const e=c.find([W,col]);
      const mv=daisyMoves(c, e, petals);
      if(mv===null) throw new Error("daisy");
      part("daisy", {c:col}, mv);
      petals.push(e);
    }
    for(const col of ["G","O","B","R"]){
      guard();
      const e=c.find([W,col]);
      let k=0; for(;k<4;k++){ const t=c.clone().run(U_TURNS[k]); const s=t.stickers(t.find([W,col])); const side=Object.keys(s).find(f => f!=="U"); if(t.center(side)===col) break; }
      const t=c.clone().run(U_TURNS[k]); const side=Object.keys(t.stickers(t.find([W,col]))).find(f => f!=="U");
      part("crossDown", {c:col, f:side}, U_TURNS[k]+" "+side+"2");
    }
  }

  /* 2 · the white corners, one at a time, always into the front-right spot */
  if(!GOALS.corners(c)){
    begin("corners");
    for(let i=0;i<12 && !GOALS.corners(c);i++){
      guard();
      const todo=c.P.filter(p => isWhiteCorner(c,p) && !c.pieceOk(p));
      const top=todo.find(p => c.pos(p)[1]===1);
      if(top){
        const cols=colorsOf(top);
        /* turn the whole cube so the spot this corner belongs in is front-right */
        const yk=Y_TURNS.find(yt => { const t=c.clone().run(yt); return cols.includes(t.center("F")) && cols.includes(t.center("R")); });
        c.run(yk);
        const uk=U_TURNS.find(ut => { const t=c.clone().run(ut); return eqV(t.pos(t.find([W].concat(cols))), [1,1,1]); });
        c.run(invertSeq(split(yk)));
        part("cornerAbove", {a:cols[0], b:cols[1]}, yk+" "+uk);
        let reps=0; const piece=c.find([W].concat(cols));
        while(!c.pieceOk(piece) && reps<6){ c.run(ALG.sexy); reps++; }
        c.run(invertSeq(split(Array(reps).fill(ALG.sexy).join(" "))));
        part("cornerIn", {a:cols[0], b:cols[1], n:reps}, Array(reps).fill(ALG.sexy).join(" "));
      } else {
        const p=todo[0], pp=c.pos(p);
        const yk=Y_TURNS.find(yt => { const t=c.clone().run(yt); return eqV(t.pos(t.find(Object.values(p.cols))), [1,-1,1]); });
        part("cornerOut", {a:colorsOf(p)[0], b:colorsOf(p)[1]}, yk+" "+ALG.sexy);
        void pp;
      }
    }
  }

  /* 3 · the middle layer */
  if(!GOALS.middle(c)){
    begin("middle");
    for(let i=0;i<12 && !GOALS.middle(c);i++){
      guard();
      const yf=yellowFace(c);
      const todo=c.P.filter(p => isMidEdge(c,p) && !c.pieceOk(p));
      const top=todo.find(p => c.pos(p)[1]===1);
      if(top){
        const s=c.stickers(top), side=Object.keys(s).find(f => f!==yf), front=s[side], up=s[yf];
        const yk=Y_TURNS.find(yt => c.clone().run(yt).center("F")===front);
        c.run(yk);
        const uk=U_TURNS.find(ut => { const t=c.clone().run(ut); return eqV(t.pos(t.find([front,up])), [0,1,1]); });
        const dir = c.center("R")===up ? "midRight" : "midLeft";
        c.run(invertSeq(split(yk)));
        part("midLine", {a:front, b:up}, yk+" "+uk);
        part(dir, {a:front, b:up}, ALG[dir]);
      } else {
        const p=todo[0];
        const yk=Y_TURNS.find(yt => { const t=c.clone().run(yt); return eqV(t.pos(t.find(Object.values(p.cols))), [1,0,1]); });
        part("midOut", {a:Object.values(p.cols)[0], b:Object.values(p.cols)[1]}, yk+" "+ALG.midRight);
      }
    }
  }

  /* 4 · the yellow cross on top */
  if(!GOALS.ycross(c)){
    begin("ycross");
    for(let i=0;i<4 && !GOALS.ycross(c);i++){
      guard();
      const n=yellowUpCount(c, isYellowEdge);
      let uk="", shape="dot";
      if(n===2){
        const up=f => c.clone().run(f);
        const yes=(t,pos) => t.colorAt(pos,[0,1,0])===Y;
        uk=U_TURNS.find(ut => { const t=up(ut); return yes(t,[-1,1,0]) && yes(t,[1,1,0]); });
        if(uk!==undefined) shape="line";
        else { uk=U_TURNS.find(ut => { const t=up(ut); return yes(t,[0,1,-1]) && yes(t,[-1,1,0]); }); shape="ell"; }
        if(uk===undefined) throw new Error("ycross rule");
      }
      part("ycross_"+shape, {}, uk+" "+ALG.ycross);
    }
  }

  /* 5 · the whole top yellow */
  if(!GOALS.yface(c)){
    begin("yface");
    for(let i=0;i<6 && !GOALS.yface(c);i++){
      guard();
      const n=yellowUpCount(c, isYellowCorner);
      const at = (t,pos,dir) => t.colorAt(pos,dir)===Y;
      const FL=[-1,1,1];
      const rule = n===1 ? (t => at(t,FL,[0,1,0]))
                 : n===0 ? (t => at(t,FL,[-1,0,0]))
                 :         (t => at(t,FL,[0,0,1]));
      const uk=U_TURNS.find(ut => rule(c.clone().run(ut)));
      if(uk===undefined) throw new Error("sune rule");
      part("sune"+(n===1?"1":n===0?"0":"2"), {}, uk+" "+ALG.sune);
    }
  }

  /* 6 · the yellow corners in their places */
  if(!GOALS.ycorners(c)){
    begin("ycorners");
    for(let i=0;i<4 && !GOALS.ycorners(c);i++){
      guard();
      /* headlights: two corners on one side that show the same colour there */
      const lights = t => t.colorAt([-1,1,-1],[0,0,-1])===t.colorAt([1,1,-1],[0,0,-1]);
      const uk=U_TURNS.find(ut => lights(c.clone().run(ut)));
      part(uk===undefined ? "aperm0" : "aperm", {}, (uk||"")+" "+ALG.aperm);
    }
  }

  /* 7 · the yellow edges, and the cube is done */
  if(!c.solved()){
    begin("done");
    const uk=U_TURNS.find(ut => { const t=c.clone().run(ut); return t.P.filter(p => isYellowCorner(t,p)).every(p => t.pieceOk(p)); });
    if(uk) part("lineUp", {}, uk);
    for(let i=0;i<4 && !c.solved();i++){
      guard();
      const bar = t => [-1,0,1].every(x => t.colorAt([x,1,-1],[0,0,-1])===t.center("B"));
      const yk=Y_TURNS.find(yt => bar(c.clone().run(yt)));
      part(yk===undefined ? "uperm0" : "uperm", {}, (yk||"")+" "+ALG.uperm);
    }
  }
  return {stages, solved:c.solved(), end:c};
}

/* a fair mix: 25 face turns, never the same face twice in a row */
function scramble(n, rnd){
  rnd = rnd || Math.random; n = n || 25;
  const f=["U","D","R","L","F","B"], sfx=["","'","2"], out=[]; let last="";
  while(out.length<n){ const a=f[Math.floor(rnd()*6)]; if(a===last) continue; last=a; out.push(a+sfx[Math.floor(rnd()*3)]); }
  return out;
}

/* ── the 24 ways to hold a cube, for reading a painted cube ── */
const HOLDS = (() => { const seen={}, out=[]; const q=[ID];
  while(q.length){ const m=q.shift(), k=m.join(); if(seen[k]) continue; seen[k]=1; out.push(m);
    [FACES.R, FACES.U, FACES.F].forEach(a => q.push(mulM(rotQ(a,1), m))); }
  return out; })();

/* paint → cube. colours: {"x,y,z|face": "W"}; centres must be the home colours. Returns {cube} or {error, at} */
function fromFacelets(colors){
  const count={}; Object.values(colors).forEach(v => { count[v]=(count[v]||0)+1; });
  for(const col of "WYGBOR"){ if((count[col]||0)!==9) return {error:"count", col, n:count[col]||0}; }
  const fresh=new Cube(), used=new Set(), out=new Cube();
  out.P=[];
  for(const home of fresh.P){
    if(home.kind===1){ out.P.push({home:home.home, M:ID.slice(), cols:home.cols, kind:1}); continue; }
  }
  /* every spot on the cube that holds an edge or a corner */
  const spots=[]; for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++){ const n=Math.abs(x)+Math.abs(y)+Math.abs(z); if(n>=2) spots.push([x,y,z]); }
  for(const pos of spots){
    const seen={}; FACE_NAMES.forEach(f => { if(dot(pos,FACES[f])===1) seen[f]=colors[pos.join(",")+"|"+f]; });
    const want=Object.values(seen).sort().join("");
    const piece=fresh.P.find(p => p.kind>1 && Object.values(p.cols).sort().join("")===want);
    if(!piece) return {error:"piece", at:pos};
    if(used.has(piece.home.join())) return {error:"twice", at:pos};
    used.add(piece.home.join());
    const M=HOLDS.find(m => eqV(mulV(m,piece.home),pos) && Object.keys(piece.cols).every(f => seen[faceOf(mulV(m,FACES[f]))]===piece.cols[f]));
    if(!M) return {error:"mirror", at:pos};
    out.P.push({home:piece.home, M, cols:piece.cols, kind:piece.kind});
  }
  /* keep the same piece order as a fresh cube, so saving and drawing stay simple */
  const order=fresh.P.map(p => p.home.join());
  out.P.sort((a,b) => order.indexOf(a.home.join())-order.indexOf(b.home.join()));
  let res; try{ res=plan(out); }catch(e){ return {error:"twist"}; }
  if(!res.solved) return {error:"twist"};
  return {cube:out};
}

/* ── the cube doctor: an "altered" cube ──
   A cube that was taken apart and put back wrong, or had a corner twisted by a bump, or had stickers peeled and
   moved, can't be solved by any moves. Three things tell: the corners' twist must add up to a whole turn, the
   edges' flips must pair up, and the corners and edges must be swapped an even-matching number of times.
   diagnose(colours) says which is broken and gives a fix done by hand, at a spot that is easy to reach. */
const OPP = {W:"Y", Y:"W", G:"B", B:"G", O:"R", R:"O"};
const key = (pos,f) => pos.join(",")+"|"+f;
const facesAt = pos => FACE_NAMES.filter(f => dot(pos, FACES[f])===1);
const det3 = (a,b,c) => a[0]*(b[1]*c[2]-b[2]*c[1]) - a[1]*(b[0]*c[2]-b[2]*c[0]) + a[2]*(b[0]*c[1]-b[1]*c[0]);
/* a corner's three faces, the top or bottom one first, then turning the same way round every corner */
function cornerOrder(pos){
  const fs=facesAt(pos), ud=fs.find(f => f==="U"||f==="D"), rest=fs.filter(f => f!==ud);
  return det3(FACES[ud], FACES[rest[0]], FACES[rest[1]])>0 ? [ud,rest[0],rest[1]] : [ud,rest[1],rest[0]];
}
function spotsOf(n){ const out=[]; for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++){ if(Math.abs(x)+Math.abs(y)+Math.abs(z)===n) out.push([x,y,z]); } return out; }
const CORNERS=spotsOf(3), EDGES=spotsOf(2);
const homeOf = cols => { const v=[0,0,0]; cols.forEach(c => { const f=FACE_NAMES.find(g => HOME_COLOR[g]===c); v[0]+=FACES[f][0]; v[1]+=FACES[f][1]; v[2]+=FACES[f][2]; }); return v; };
function parity(perm){ const seen=new Array(perm.length).fill(false); let p=0;
  for(let i=0;i<perm.length;i++){ if(seen[i]) continue; let j=i, len=0; while(!seen[j]){ seen[j]=true; j=perm[j]; len++; } p+=len-1; } return p%2; }
/* read the pieces off the stickers: bad spots, or the three numbers that must all be zero */
function readPieces(cols){
  const bad=[], used={}, cPerm=[], ePerm=[]; let twist=0, flip=0;
  CORNERS.forEach((pos,i) => {
    const ord=cornerOrder(pos), seen=ord.map(f => cols[key(pos,f)]);
    const set=new Set(seen);
    if(set.size<3 || seen.some(c => !OPP[c]) || seen.some(c => set.has(OPP[c]))){ bad.push(pos); return; }
    const home=homeOf(seen), hk=home.join();
    if(used[hk]){ bad.push(pos, used[hk]); return; } used[hk]=pos;
    /* the same piece, read at home, must go round in the same order (else two of its stickers were swapped) */
    const hord=cornerOrder(home).map(f => HOME_COLOR[f]), k=seen.findIndex(c => c==="W"||c==="Y");
    const rot=[0,1,2].map(j => seen[(k+j)%3]);
    if(rot.join()!==hord.join()){ bad.push(pos); return; }
    twist+=k; cPerm[i]=CORNERS.findIndex(q => eqV(q,home));
  });
  EDGES.forEach((pos,i) => {
    const fs=facesAt(pos), seen=fs.map(f => cols[key(pos,f)]);
    if(seen[0]===seen[1] || !OPP[seen[0]] || !OPP[seen[1]] || OPP[seen[0]]===seen[1]){ bad.push(pos); return; }
    const home=homeOf(seen), hk=home.join();
    if(used[hk]){ bad.push(pos, used[hk]); return; } used[hk]=pos;
    const refFace=fs.find(f => f==="U"||f==="D") || fs.find(f => f==="F"||f==="B");
    const refCol=seen.find(c => c==="W"||c==="Y") || seen.find(c => c==="G"||c==="B");
    flip += cols[key(pos,refFace)]===refCol ? 0 : 1;
    ePerm[i]=EDGES.findIndex(q => eqV(q,home));
  });
  if(bad.length) return {bad};
  return {twist:twist%3, flip:flip%2, swap:(parity(cPerm)+parity(ePerm))%2};
}
/* the fixes, each a change of stickers at named spots: what each face shows now, and what it should show */
const UFR=[1,1,1], UF=[0,1,1], UR=[1,1,0];
function change(cols, edits){ const out=Object.assign({}, cols); edits.forEach(e => { out[key(e.pos,e.f)]=e.to; }); return out; }
function twistFix(cols, pos, k){ const ord=cornerOrder(pos); return ord.map((f,i) => ({pos, f, from:cols[key(pos,f)], to:cols[key(pos, ord[(i+k)%3])]})); }
function flipFix(cols, pos){ const fs=facesAt(pos); return fs.map((f,i) => ({pos, f, from:cols[key(pos,f)], to:cols[key(pos,fs[1-i])]})); }
function swapFix(cols, a, b){ const fa=facesAt(a), fb=facesAt(b);
  /* the top stickers trade places, and so do the side stickers */
  const ua=fa.find(f => f==="U"), sa=fa.find(f => f!=="U"), ub=fb.find(f => f==="U"), sb=fb.find(f => f!=="U");
  return [{pos:a,f:ua,from:cols[key(a,ua)],to:cols[key(b,ub)]},{pos:a,f:sa,from:cols[key(a,sa)],to:cols[key(b,sb)]},
          {pos:b,f:ub,from:cols[key(b,ub)],to:cols[key(a,ua)]},{pos:b,f:sb,from:cols[key(b,sb)],to:cols[key(a,sa)]}]; }
function diagnose(colors){
  const count={}; Object.values(colors).forEach(v => { count[v]=(count[v]||0)+1; });
  for(const col of "WYGBOR"){ if((count[col]||0)!==9) return {error:"count", col, n:count[col]||0}; }
  let cols=Object.assign({}, colors), r=readPieces(cols);
  if(r.bad) return {error:"stickers", spots:r.bad};
  const fixes=[];
  if(r.swap){ const e=swapFix(cols, UF, UR); fixes.push({kind:"swap", spots:[UF,UR], edits:e}); cols=change(cols,e); r=readPieces(cols); }
  if(r.twist){ const e=twistFix(cols, UFR, r.twist); fixes.push({kind:"twist", spots:[UFR], edits:e}); cols=change(cols,e); r=readPieces(cols); }
  if(r.flip){ const e=flipFix(cols, UF); fixes.push({kind:"flip", spots:[UF], edits:e}); cols=change(cols,e); r=readPieces(cols); }
  return {fixes, fixed:cols, ok:!fixes.length};
}

const api = {FACES, HOME_COLOR, FACE_NAMES, Cube, parse, invert, invertSeq, simplify, split, rot, rotQ, mulV, mulM, ID,
             MOVES, ALG, GOALS, STAGES, stageOf, plan, scramble, facelets, fromFacelets, diagnose, faceOf, eqV, dot};
if(typeof module!=="undefined" && module.exports) module.exports=api;
else root.AOGCube=api;

/* node aog-cube.js test */
if(typeof module!=="undefined" && require.main===module && process.argv[2]==="test"){
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  let worst=0, total=0; const N=+process.argv[3]||3000;
  const check=(cond,msg)=>{ if(!cond){ console.log("FAIL", msg); process.exit(1); } };
  check(new Cube().run("R U R' U'").run("U R U' R'").solved(), "R U R' U' undone");
  check(new Cube().run(Array(6).fill(ALG.sexy).join(" ")).solved(), "sexy ×6");
  check(new Cube().run("x y z z' y' x'").solved(), "rotations");
  check(new Cube().run("M E S S' E' M'").solved(), "slices");
  check(new Cube().run("R").colorAt([1,1,1],[0,1,0])==="G", "R lifts the front up");
  for(let i=0;i<N;i++){
    const mix=scramble(25,rnd), extra=["","x","z'","x2 y"][i%4];
    const c=new Cube().run(extra).run(mix);
    const r=plan(c);
    check(r.solved, "not solved: "+mix.join(" "));
    /* the stages arrive in order: after each stage its goal holds */
    const t=c.clone(); let need=0;
    for(const st of r.stages){ st.parts.forEach(p => t.run(p.moves)); if(st.key==="hold") continue; const k=STAGES.indexOf(st.key); check(stageOf(t)>k, "stage "+st.key+" left unfinished: "+mix.join(" ")); need=k; }
    void need;
    const n=r.stages.reduce((a,s)=>a+s.parts.reduce((b,p)=>b+p.moves.length,0),0);
    worst=Math.max(worst,n); total+=n;
    /* reading the painted cube back gives the same cube */
    if(i<300){
      const cols={}; FACE_NAMES.forEach(f => facelets(f).forEach(([pos,dir]) => { cols[pos.join(",")+"|"+f]=c.colorAt(pos,dir); }));
      if(c.center("U")==="Y" && c.center("F")==="G"){ const back=fromFacelets(cols); check(back.cube && back.cube.faceletKey()===c.faceletKey(), "paint round trip"); }
    }
  }
  /* the cube doctor: alter a good cube by hand (twist a corner, flip an edge, swap two pieces, any mix),
     and its fixes must make it solvable again; a good cube needs no fix */
  const colsOf = c => { const o={}; FACE_NAMES.forEach(f => facelets(f).forEach(([pos,dir]) => { o[pos.join(",")+"|"+f]=c.colorAt(pos,dir); })); return o; };
  const allC=[], allE=[]; for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++){ const n=Math.abs(x)+Math.abs(y)+Math.abs(z); if(n===3) allC.push([x,y,z]); if(n===2) allE.push([x,y,z]); }
  const fz = pos => FACE_NAMES.filter(f => dot(pos,FACES[f])===1);
  const kinds={};
  for(let i=0;i<1500;i++){
    const cols=colsOf(new Cube().run(scramble(25,rnd)));
    check(diagnose(cols).ok, "a good cube needs no fix");
    const alter=[]; const k=1+Math.floor(rnd()*3);
    for(let a=0;a<k;a++){
      const what=Math.floor(rnd()*4);
      if(what===0){ const p=allC[Math.floor(rnd()*8)], fs=fz(p), v=fs.map(f => cols[p.join(",")+"|"+f]); const s=1+Math.floor(rnd()*2); fs.forEach((f,j) => { cols[p.join(",")+"|"+f]=v[(j+s)%3]; }); alter.push("twist"); }
      if(what===1){ const p=allE[Math.floor(rnd()*12)], fs=fz(p), v=fs.map(f => cols[p.join(",")+"|"+f]); cols[p.join(",")+"|"+fs[0]]=v[1]; cols[p.join(",")+"|"+fs[1]]=v[0]; alter.push("flip"); }
      if(what===2){ let a1=Math.floor(rnd()*12), b1=Math.floor(rnd()*11); if(b1>=a1) b1++; const A=allE[a1], B=allE[b1], fa=fz(A), fb=fz(B); const va=fa.map(f => cols[A.join(",")+"|"+f]), vb=fb.map(f => cols[B.join(",")+"|"+f]); fa.forEach((f,j) => { cols[A.join(",")+"|"+f]=vb[j]; }); fb.forEach((f,j) => { cols[B.join(",")+"|"+f]=va[j]; }); alter.push("swapE"); }
      if(what===3){ let a1=Math.floor(rnd()*8), b1=Math.floor(rnd()*7); if(b1>=a1) b1++; const A=allC[a1], B=allC[b1], fa=fz(A), fb=fz(B); const va=fa.map(f => cols[A.join(",")+"|"+f]), vb=fb.map(f => cols[B.join(",")+"|"+f]); fa.forEach((f,j) => { cols[A.join(",")+"|"+f]=vb[j]; }); fb.forEach((f,j) => { cols[B.join(",")+"|"+f]=va[j]; }); alter.push("swapC"); }
    }
    const d=diagnose(cols);
    if(d.error==="stickers"){ kinds.mirror=(kinds.mirror||0)+1; continue; }   /* swapping corners by stickers can mirror one: told as moved stickers */
    check(!d.error, "doctor error "+d.error+" after "+alter);
    const back=fromFacelets(d.fixed);
    check(back.cube, "fixed cube is solvable after "+alter.join("+")+" ("+d.fixes.map(f=>f.kind).join("+")+")");
    d.fixes.forEach(f => { kinds[f.kind]=(kinds[f.kind]||0)+1; });
  }
  /* a piece with colours no real piece has, or two of the same piece, is told as moved stickers */
  { const cols=colsOf(new Cube()); cols["1,1,1|U"]="W"; cols["-1,-1,1|D"]="Y"; const d=diagnose(cols); check(d.error==="stickers" && d.spots.length>=2, "moved stickers caught"); }
  console.log("doctor:", JSON.stringify(kinds));
  /* a twisted corner can't be solved, and the reader says so */
  const bad=new Cube(); const p=bad.P.find(q => q.kind===3 && eqV(q.home,[1,1,1]));
  const cols={}; FACE_NAMES.forEach(f => facelets(f).forEach(([pos,dir]) => { cols[pos.join(",")+"|"+f]=bad.colorAt(pos,dir); }));
  cols["1,1,1|U"]="O"; cols["1,1,1|R"]="G"; cols["1,1,1|F"]="Y"; void p;
  check(fromFacelets(cols).error==="twist", "twisted corner caught");
  console.log("ok:", N, "cubes solved · average", (total/N).toFixed(0), "moves · longest", worst);
}
})(typeof window!=="undefined" ? window : this);
