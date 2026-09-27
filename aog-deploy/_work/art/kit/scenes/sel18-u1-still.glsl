/* SEL sel18-u1 — pencil still life: a pocket compass lying on a closed journal, with a pencil beside it. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.2135,0.2469,-0.6045)
#define CAM_TGT vec3(-0.0359,-0.0489,0.0466)
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
  q=P(p,vec3(0.0,0.018,0.02),0.15); r=U(r,bookC(q,vec3(0.11,0.018,0.075)).x,3.);
  q=P(p,vec3(0.0,0.018,0.02),0.15); r=U(r,bookC(q,vec3(0.11,0.018,0.075)).y,4.);
  q=P(p,vec3(0.01,0.036,0.0),0.3); r=U(r,compass(q,0.045),5.);
  q=P(p,vec3(0.16,0.0066,-0.08),-0.5); r=U(r,pencilL(q,0.09),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.018,0.02),0.15); return .45; }
  if(id==4.){ q=P(p,vec3(0.0,0.018,0.02),0.15); return bookCT(q,vec3(0.11,0.018,0.075),.45); }
  if(id==5.){ q=P(p,vec3(0.01,0.036,0.0),0.3); return compassT(q,0.045); }
  if(id==6.){ q=P(p,vec3(0.16,0.0066,-0.08),-0.5); return pencilT(q,0.09); }
  return .7; }
