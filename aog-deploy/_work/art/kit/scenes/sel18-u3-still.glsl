/* SEL sel18-u3 — pencil still life: a teapot with two cups set side by side, ready to share. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.2251,0.2132,-0.4599)
#define CAM_TGT vec3(-0.0809,-0.0272,0.0688)
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
  q=P(p,vec3(0.0,0.0,0.06),0.2); r=U(r,teapot(q,0.06),3.);
  q=P(p,vec3(-0.11,0.0,-0.05),2.6); r=U(r,mug(q,0.032,0.07),4.);
  q=P(p,vec3(0.12,0.0,-0.06),-0.4); r=U(r,mug(q,0.032,0.07),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.06),0.2); return teapotT(q,0.06); }
  if(id==4.){ q=P(p,vec3(-0.11,0.0,-0.05),2.6); return mugT(q,0.032,0.07,.72); }
  if(id==5.){ q=P(p,vec3(0.12,0.0,-0.06),-0.4); return mugT(q,0.032,0.07,.72); }
  return .7; }
