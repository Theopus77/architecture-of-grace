/* SEL sel12-u1 — pencil still life: a round standing mirror, a small potted plant and a pencil. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.5384,0.4679,-0.9801)
#define CAM_TGT vec3(-0.2406,-0.0284,0.1118)
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
  q=P(p,vec3(0.0,0.0,0.05),0.3); r=U(r,mirror(q,0.1),3.);
  q=P(p,vec3(0.17,0.0,-0.02),0.0); r=U(r,pot(q,0.05,0.07),4.);
  q=P(p,vec3(0.17,0.054,-0.02),0.4); r=U(r,sprout(q,0.09,0.035,3.0),5.);
  q=P(p,vec3(-0.05,0.0066,-0.12),0.4); r=U(r,pencilL(q,0.09),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.05),0.3); return mirrorT(q,0.1); }
  if(id==4.){ q=P(p,vec3(0.17,0.0,-0.02),0.0); return potT(q,0.05,0.07); }
  if(id==5.){ q=P(p,vec3(0.17,0.054,-0.02),0.4); return .5; }
  if(id==6.){ q=P(p,vec3(-0.05,0.0066,-0.12),0.4); return pencilT(q,0.09); }
  return .7; }
