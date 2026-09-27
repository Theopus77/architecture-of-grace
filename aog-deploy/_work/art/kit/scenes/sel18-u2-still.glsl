/* SEL sel18-u2 — pencil still life: a candle lantern, a warm mug and a folded blanket. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.5748,0.4253,-0.8495)
#define CAM_TGT vec3(-0.3069,-0.0214,0.1331)
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
  q=P(p,vec3(-0.02,0.0,0.05),0.5); r=U(r,lantern(q,0.05,0.17),3.);
  q=P(p,vec3(0.12,0.0,-0.04),2.4); r=U(r,mug(q,0.035,0.08),4.);
  q=P(p,vec3(-0.17,0.0,-0.03),0.2); r=U(r,blanket(q,vec3(0.1,0.03,0.07)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(-0.02,0.0,0.05),0.5); return lanternT(q,0.05,0.17); }
  if(id==4.){ q=P(p,vec3(0.12,0.0,-0.04),2.4); return mugT(q,0.035,0.08,.72); }
  if(id==5.){ q=P(p,vec3(-0.17,0.0,-0.03),0.2); return blanketT(q); }
  return .7; }
