/* SEL sel36-u1 — pencil still life: an oval standing mirror beside two stacked books and a small plant. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.5933,0.4896,-0.9550)
#define CAM_TGT vec3(-0.2956,-0.0065,0.1367)
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
  q=P(p,vec3(0.02,0.0,0.06),0.25); r=U(r,mirror(q,0.11),3.);
  q=P(p,vec3(-0.14,0.016,-0.02),0.2); r=U(r,bookC(q,vec3(0.09,0.016,0.065)).x,4.);
  q=P(p,vec3(-0.14,0.016,-0.02),0.2); r=U(r,bookC(q,vec3(0.09,0.016,0.065)).y,5.);
  q=P(p,vec3(-0.135,0.048,-0.02),-0.1); r=U(r,bookC(q,vec3(0.08,0.016,0.06)).x,6.);
  q=P(p,vec3(-0.135,0.048,-0.02),-0.1); r=U(r,bookC(q,vec3(0.08,0.016,0.06)).y,7.);
  q=P(p,vec3(0.17,0.0,-0.05),0.0); r=U(r,pot(q,0.04,0.06),8.);
  q=P(p,vec3(0.17,0.044,-0.05),0.4); r=U(r,sprout(q,0.07,0.03,2.0),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.02,0.0,0.06),0.25); return mirrorT(q,0.11); }
  if(id==4.){ q=P(p,vec3(-0.14,0.016,-0.02),0.2); return .45; }
  if(id==5.){ q=P(p,vec3(-0.14,0.016,-0.02),0.2); return bookCT(q,vec3(0.09,0.016,0.065),.45); }
  if(id==6.){ q=P(p,vec3(-0.135,0.048,-0.02),-0.1); return .45; }
  if(id==7.){ q=P(p,vec3(-0.135,0.048,-0.02),-0.1); return bookCT(q,vec3(0.08,0.016,0.06),.45); }
  if(id==8.){ q=P(p,vec3(0.17,0.0,-0.05),0.0); return potT(q,0.04,0.06); }
  if(id==9.){ q=P(p,vec3(0.17,0.044,-0.05),0.4); return .5; }
  return .7; }
