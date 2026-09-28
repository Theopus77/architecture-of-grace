/* Crosswalk: MTSS tiered supports — a three-step pyramid of wooden blocks, three on the bottom, two in the middle and one on top, with a pencil in front. */
#define CAM_POS vec3(-0.4983,0.4443,-0.7377)
#define CAM_TGT vec3(-0.2058,0.0437,0.1073)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define PY vec3(.0,0.,.06)
#define BS .042
float blk(vec3 p,vec3 c){ return sdRBox(p-c,vec3(BS),.005); }
vec3 pq(vec3 p){ return P(p,PY,.18); }
#define PN vec3(.1,0.,-.06)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 q=pq(p); float s=2.*BS+.004;
  r=U(r,min(min(blk(q,vec3(-s,BS,0.)),blk(q,vec3(s,BS,0.))),blk(q,vec3(0.,BS,0.))),3.);
  r=U(r,min(blk(q,vec3(-s*.5,BS*3.+.002,0.)),blk(q,vec3(s*.5,BS*3.+.002,0.))),4.);
  r=U(r,blk(q,vec3(0.,BS*5.+.004,0.)),5.);
  r=U(r,xwPencilD(P(p,PN,-.3),.075),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  vec3 q=pq(p); float g=.08*grain(q*vec3(1.,4.,1.),30.);
  if(id==3.) return .62+g; if(id==4.) return .45+g; if(id==5.) return .28+g;
  if(id==6.) return xwPencilT(P(p,PN,-.3),.075);
  return .7; }
