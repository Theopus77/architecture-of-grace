/* SEL sel104-u2 — pencil still life: a mended bowl with gold seams and a small teacup. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.1490,0.1889,-0.4001)
#define CAM_TGT vec3(-0.0243,-0.0190,0.0571)
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
  q=P(p,vec3(0.0,0.0,0.02),0.5); r=U(r,bowl(q,0.09,0.07),3.);
  q=P(p,vec3(0.15,0.0,-0.06),0.5); r=U(r,mug(q,0.03,0.05),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.02),0.5); return bowlT(q,0.09,0.07,.8,1.0); }
  if(id==4.){ q=P(p,vec3(0.15,0.0,-0.06),0.5); return mugT(q,0.03,0.05,.72); }
  return .7; }
