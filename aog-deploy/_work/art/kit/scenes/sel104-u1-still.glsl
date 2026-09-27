/* SEL sel104-u1 — pencil still life: a small framed drawing of a hill and sun, a sketchbook and a pencil. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.2619,0.3190,-0.6226)
#define CAM_TGT vec3(-0.0707,0.0003,0.0785)
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
  q=P(p,vec3(-0.02,0.0,0.05),0.2); r=U(r,pframe(q,vec2(0.07,0.09)),3.);
  q=P(p,vec3(0.13,0.012,-0.04),-0.2); r=U(r,bookC(q,vec3(0.1,0.012,0.07)).x,4.);
  q=P(p,vec3(0.13,0.012,-0.04),-0.2); r=U(r,bookC(q,vec3(0.1,0.012,0.07)).y,5.);
  q=P(p,vec3(0.13,0.031,-0.04),0.5); r=U(r,pencilL(q,0.08),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(-0.02,0.0,0.05),0.2); return pframeT(q,vec2(0.07,0.09)); }
  if(id==4.){ q=P(p,vec3(0.13,0.012,-0.04),-0.2); return .45; }
  if(id==5.){ q=P(p,vec3(0.13,0.012,-0.04),-0.2); return bookCT(q,vec3(0.1,0.012,0.07),.45); }
  if(id==6.){ q=P(p,vec3(0.13,0.031,-0.04),0.5); return pencilT(q,0.08); }
  return .7; }
