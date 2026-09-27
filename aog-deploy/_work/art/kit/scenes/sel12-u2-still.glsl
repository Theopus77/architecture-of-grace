/* SEL sel12-u2 — pencil still life: a watering can beside a young sprout in a clay pot. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.1847,0.2562,-0.4791)
#define CAM_TGT vec3(-0.0346,0.0061,0.0713)
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
  q=P(p,vec3(-0.03,0.0,0.04),0.2); r=U(r,wcan(q,0.06,0.1),3.);
  q=P(p,vec3(0.2,0.0,-0.03),0.0); r=U(r,pot(q,0.045,0.065),4.);
  q=P(p,vec3(0.2,0.049,-0.03),0.4); r=U(r,sprout(q,0.07,0.03,2.0),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(-0.03,0.0,0.04),0.2); return wcanT(q,0.06,0.1); }
  if(id==4.){ q=P(p,vec3(0.2,0.0,-0.03),0.0); return potT(q,0.045,0.065); }
  if(id==5.){ q=P(p,vec3(0.2,0.049,-0.03),0.4); return .5; }
  return .7; }
