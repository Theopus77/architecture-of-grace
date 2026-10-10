/* AOG-CUBE-DOOR-V1 — the puzzle cube for the Cube room's drawings. Switches: POPPED (a corner and an edge out
   on the table), SOLVED (each side one tone), TOP (how far the top layer is turned, radians). */
#define CS .019
#define HC .0095
#ifndef TOP
#define TOP .33
#endif
#define RY -.55
const vec3 CUBE=vec3(0.,.0285,0.);
vec3 toCube(vec3 p){ vec3 q=p-CUBE; q.xz=rot(RY)*q.xz; return q; }
/* the top layer turns about the cube's own up axis */
vec3 layerQ(vec3 q){ if(q.y>HC*.5+.0004){ q.xz=rot(TOP)*q.xz; } return q; }
float cubeD(vec3 p){
  vec3 q=toCube(p);
  float bb=sdBox(q,vec3(.034)); if(bb>.008) return bb;
  float d=1e9;
  for(int j=-1;j<=1;j++){
    vec3 qq=q; if(j==1) qq.xz=rot(TOP)*qq.xz;
    for(int i=-1;i<=1;i++) for(int k=-1;k<=1;k++){
      if(i==0&&j==0&&k==0) continue;
#ifdef POPPED
      if(j==1&&i==1&&k==-1) continue;                 /* the popped corner's empty spot */
#endif
      d=min(d,sdRBox(qq-vec3(i,j,k)*CS,vec3(HC-.0003),.0017)); } }
  return d; }
/* the loose pieces, lying on the table */
vec3 cornerQ(vec3 p){ vec3 q=p-vec3(.062,HC-.0003,-.022); q.xz=rot(.9)*q.xz; return q; }
vec3 edgeQ(vec3 p){ vec3 q=p-vec3(.012,HC-.0003,-.062); q.xz=rot(-.35)*q.xz; return q; }
float pieceD(vec3 q){ return sdRBox(q,vec3(HC-.0003),.0017); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cubeD(p),3.);
#ifdef POPPED
  r=U(r,pieceD(cornerQ(p)),4.);
  r=U(r,pieceD(edgeQ(p)),5.);
#endif
  return r; }
float h3(vec3 c){ return fract(sin(dot(c,vec3(12.9898,78.233,37.719)))*43758.5453); }
/* six sticker greys: white, yellow, orange, green, red, blue */
float stickerTone(float h){ return h<.17?.95:h<.34?.86:h<.5?.62:h<.67?.5:h<.84?.42:.32; }
/* a cubie seen from the inside of its own frame: plastic, or the sticker on an outer face */
float cubieTone(vec3 l, vec3 outer, float seed){
  vec3 a=abs(l); float m=max(a.x,max(a.y,a.z));
  vec3 f=a.x==m?vec3(sign(l.x),0,0):a.y==m?vec3(0,sign(l.y),0):vec3(0,0,sign(l.z));
  if(m<HC-.0012||dot(f,outer)<.5&&dot(f*f,outer*outer)<.5) return .16;
  vec2 uv=f.x!=0.?l.yz:f.y!=0.?l.xz:l.xy;
  if(max(abs(uv.x),abs(uv.y))>HC-.0029) return .08;    /* the black rim around a sticker */
#ifdef SOLVED
  return f.y>.5?.9:f.y<-.5?.95:f.z<-.5?.5:f.z>.5?.32:f.x>.5?.62:.42;
#endif
  return stickerTone(h3(floor(f*3.)+seed)); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=toCube(p); vec3 qq=q; if(q.y>HC*.5+.0004) qq.xz=rot(TOP)*qq.xz;
    vec3 c=clamp(floor(qq/CS+.5),-1.,1.); vec3 l=qq-c*CS;
    vec3 outer=vec3(abs(c.x)>.5?c.x:0.,abs(c.y)>.5?c.y:0.,abs(c.z)>.5?c.z:0.);
    return cubieTone(l,outer,dot(c,vec3(3.1,7.3,11.7))); }
  if(id==4.) return cubieTone(cornerQ(p),vec3(1,1,-1),5.5);
  if(id==5.) return cubieTone(edgeQ(p),vec3(0,1,1),9.25);
  return .7; }
