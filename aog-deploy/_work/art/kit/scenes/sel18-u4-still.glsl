/* SEL sel18-u4 — pencil still life: a wooden crate of pears, with one pear set out to share. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.2155,0.2428,-0.4878)
#define CAM_TGT vec3(-0.0629,-0.0111,0.0712)
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
  q=P(p,vec3(0.0,0.0,0.04),0.15); r=U(r,crate(q,vec3(0.12,0.05,0.08)),3.);
  q=P(p,vec3(-0.05,0.05,0.04),0.0); r=U(r,apple(q,0.03,1.0),4.);
  q=P(p,vec3(0.03,0.05,0.06),1.0); r=U(r,apple(q,0.03,1.0),5.);
  q=P(p,vec3(0.0,0.05,0.0),2.0); r=U(r,apple(q,0.03,1.0),6.);
  q=P(p,vec3(0.18,0.0,-0.08),0.5); r=U(r,apple(q,0.03,1.0),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.04),0.15); return crateT(q,vec3(0.12,0.05,0.08)); }
  if(id==4.){ q=P(p,vec3(-0.05,0.05,0.04),0.0); return appleT(q,0.03); }
  if(id==5.){ q=P(p,vec3(0.03,0.05,0.06),1.0); return appleT(q,0.03); }
  if(id==6.){ q=P(p,vec3(0.0,0.05,0.0),2.0); return appleT(q,0.03); }
  if(id==7.){ q=P(p,vec3(0.18,0.0,-0.08),0.5); return appleT(q,0.03); }
  return .7; }
