/* SEL sel104-u3 — pencil still life: two mugs facing each other across a sand timer. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.2359,0.2215,-0.4191)
#define CAM_TGT vec3(-0.0990,-0.0068,0.0830)
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
  q=P(p,vec3(-0.09,0.0,0.0),0.0); r=U(r,mug(q,0.032,0.075),3.);
  q=P(p,vec3(0.09,0.0,-0.02),3.14); r=U(r,mug(q,0.032,0.075),4.);
  q=P(p,vec3(0.0,0.0,0.08),0.3); r=U(r,timer(q,0.035,0.11),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(-0.09,0.0,0.0),0.0); return mugT(q,0.032,0.075,.72); }
  if(id==4.){ q=P(p,vec3(0.09,0.0,-0.02),3.14); return mugT(q,0.032,0.075,.72); }
  if(id==5.){ q=P(p,vec3(0.0,0.0,0.08),0.3); return timerT(q,0.035,0.11); }
  return .7; }
