/* m36 "Transformations, Congruence and Similarity" — on a gridded board: an L-shaped wooden
   piece, the same piece turned a quarter turn, and a bigger copy standing up behind (the same
   shape, scaled); a clear flip-mirror stands at the board's edge. */
#define CAM_POS vec3(-0.3665,0.3067,-0.5404)
#define CAM_TGT vec3(-0.1848,-0.0205,0.0704)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define BD vec3(0.,0.,.04)
#define GS .02
vec3 bQ(vec3 p){ return place(p,BD,.1); }
float board(vec3 p){ vec3 q=bQ(p); return sdRBox(q-vec3(0.,.005,0.),vec3(.17,.005,.11),.002); }
/* L in the xz plane: cells (0,0),(0,1),(0,2),(1,0) of size s, thickness h */
float Lpiece(vec3 q,float s,float h){
  float a=sdBox(q-vec3(.5*s,h,1.5*s),vec3(.5*s,h,1.5*s));
  float b=sdBox(q-vec3(1.5*s,h,.5*s),vec3(.5*s,h,.5*s));
  return min(a,b)-.0012; }
float L1(vec3 p){ vec3 q=bQ(p)-vec3(-.15,.01,-.09); return Lpiece(q,GS,.009); }
float L2(vec3 p){ vec3 q=bQ(p)-vec3(.02,.01,-.07); q.xz=rot(1.5708)*q.xz; return Lpiece(q,GS,.009); }
float L3(vec3 p){ vec3 q=bQ(p)-vec3(.04,.01,.05); q.yz=rot(-1.3)*q.yz; return Lpiece(q,GS*1.8,.009); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,L1(p),4.);
  r=U(r,L2(p),5.);
  r=U(r,L3(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bQ(p); if(n.y<.5) return .45; vec2 g=abs(fract(q.xz/GS)-.5); if(min(g.x,g.y)<.05) return .45; return .9; }
  if(id==4.) return .45;
  if(id==5.) return .6;
  if(id==6.) return .7+.1*grain(p,40.);
  return .7; }
