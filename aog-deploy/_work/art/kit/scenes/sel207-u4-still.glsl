/* SEL sel207-u4 — pencil still life: a young tree in a clay pot, a garden trowel and an apple. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.4156,0.4223,-0.8179)
#define CAM_TGT vec3(-0.1639,0.0028,0.1050)
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
  q=P(p,vec3(0.0,0.0,0.04),0.0); r=U(r,pot(q,0.06,0.09),3.);
  q=P(p,vec3(0.0,0.074,0.04),0.4); r=U(r,sprout(q,0.15,0.05,4.0),4.);
  q=P(p,vec3(0.14,0.0,-0.08),-0.4); r=U(r,trowel(q),5.);
  q=P(p,vec3(-0.13,0.0,-0.06),0.0); r=U(r,apple(q,0.035,0.0),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.04),0.0); return potT(q,0.06,0.09); }
  if(id==4.){ q=P(p,vec3(0.0,0.074,0.04),0.4); return .5; }
  if(id==5.){ q=P(p,vec3(0.14,0.0,-0.08),-0.4); return trowelT(q); }
  if(id==6.){ q=P(p,vec3(-0.13,0.0,-0.06),0.0); return appleT(q,0.035); }
  return .7; }
