/* m36 "Transformations, Congruence and Similarity" — two same-size wooden set-square
   triangles standing on graph paper as mirror images across a dashed line, and a half-size
   triangle of the same shape in front. */
#define CAM_POS vec3(-0.4208,0.2783,-0.4482)
#define CAM_TGT vec3(-0.1740,0.0315,0.1371)
#define CAM_FOV 30.
// @bg 0,1,2,3
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
/* an upright wooden triangle: right angle at the origin on the table, leg a along x, leg b up y,
   thickness T along z, standing in a little slotted foot */
float triUp(vec3 q,float a,float b,float T){
  float d2=sdTri2(q.xy,vec2(0.,.006),vec2(a,.006),vec2(0.,b));
  float t=extrude(d2+.005,q.z,T,.003);
  float h=sdTri2(q.xy,vec2(a*.2,.006+b*.14),vec2(a*.58,.006+b*.14),vec2(a*.2,b*.52));
  t=max(t,-(h+.004));                                  /* a cut-out window, like a set square */
  return t; }
float footD(vec3 q,float a){ return sdRBox(q-vec3(a*.5,.006,0.),vec3(a*.5+.012,.006,.02),.003); }
vec3 ppQ(vec3 p){ return place(p,vec3(0.,0.,.1),.1); }
vec3 pp2(vec3 p){ return place(p,vec3(.04,0.,.11),.1); }
float paper(vec3 p){ vec3 q=pp2(p); return sdRBox(q-vec3(0.,.0006,0.),vec3(.22,.0006,.12),.0004); }
#define TA .15
#define TB .19
#define TT .007
/* first triangle on the left, its mirror copy on the right; mirror line at paper x=0 */
vec3 aQ(vec3 p){ vec3 q=ppQ(p)-vec3(-.03,.0012,.02); return q; }
vec3 bQ(vec3 p){ vec3 q=ppQ(p)-vec3(.03,.0012,.02); q.x=-q.x; return q; }
vec3 cQ(vec3 p){ vec3 q=place(p,vec3(.15,.0012,-.02),-.3); q.x=-q.x; return q; }
float triA(vec3 p){ vec3 q=aQ(p); q.x=-q.x; return triUp(q,TA,TB,TT); }
float triB(vec3 p){ vec3 q=bQ(p); q.x=-q.x; return triUp(q,TA,TB,TT); }
float triC(vec3 p){ vec3 q=cQ(p); return triUp(q,TA*.5,TB*.5,TT); }
float feet(vec3 p){ vec3 q=aQ(p); q.x=-q.x; float d=footD(q,TA);
  q=bQ(p); q.x=-q.x; d=min(d,footD(q,TA));
  q=cQ(p); d=min(d,footD(q,TA*.5)); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,paper(p),3.);
  r=U(r,triA(p),4.);
  r=U(r,triB(p),5.);
  r=U(r,triC(p),6.);
  r=U(r,feet(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ppQ(p); float a=.95;
    vec2 g=abs(fract(q.xz/.02+.5)-.5); if(min(g.x,g.y)<.05) a=.76;
    if(abs(q.x)<.0028&&fract(q.z/.02)<.55) a=.08;       /* the dashed mirror line */
    return a; }
  if(id>=4.&&id<=6.) return .6+.08*grain(p.zyx,5.);
  if(id==7.) return .42;
  return .7; }
