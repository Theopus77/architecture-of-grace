/* SEL sel36-u2 — pencil still life: a desk lamp shining on an open feelings journal, with a pencil. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.5857,0.4932,-0.9897)
#define CAM_TGT vec3(-0.2808,-0.0153,0.1288)
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
  q=P(p,vec3(-0.1,0.0,0.07),0.3); r=U(r,lampD(q,1.0),3.);
  q=P(p,vec3(0.05,0.005,-0.02),0.1); r=U(r,bookO(q,0.075,0.07).x,4.);
  q=P(p,vec3(0.05,0.005,-0.02),0.1); r=U(r,bookO(q,0.075,0.07).y,5.);
  q=P(p,vec3(0.1,0.0066,-0.13),0.5); r=U(r,pencilL(q,0.09),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(-0.1,0.0,0.07),0.3); return lampT(q); }
  if(id==4.){ q=P(p,vec3(0.05,0.005,-0.02),0.1); return pageT(q,0.075,0.07,60.0); }
  if(id==5.){ q=P(p,vec3(0.05,0.005,-0.02),0.1); return .42; }
  if(id==6.){ q=P(p,vec3(0.1,0.0066,-0.13),0.5); return pencilT(q,0.09); }
  return .7; }
