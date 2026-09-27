/* SEL sel36-u4 — pencil still life: a candle lantern, an old key and a closed book. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.5224,0.4148,-0.8134)
#define CAM_TGT vec3(-0.2661,-0.0124,0.1261)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.); vec3 q;
  q=P(p,vec3(0.0,0.0,0.04),0.5); r=U(r,lantern(q,0.05,0.17),3.);
  q=P(p,vec3(0.12,0.0,-0.09),0.4); r=U(r,key(q,0.14),4.);
  q=P(p,vec3(-0.13,0.02,-0.01),0.25); r=U(r,bookC(q,vec3(0.09,0.02,0.065)).x,5.);
  q=P(p,vec3(-0.13,0.02,-0.01),0.25); r=U(r,bookC(q,vec3(0.09,0.02,0.065)).y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.04),0.5); return lanternT(q,0.05,0.17); }
  if(id==4.){ q=P(p,vec3(0.12,0.0,-0.09),0.4); return .4; }
  if(id==5.){ q=P(p,vec3(-0.13,0.02,-0.01),0.25); return .45; }
  if(id==6.){ q=P(p,vec3(-0.13,0.02,-0.01),0.25); return bookCT(q,vec3(0.09,0.02,0.065),.45); }
  return .7; }
