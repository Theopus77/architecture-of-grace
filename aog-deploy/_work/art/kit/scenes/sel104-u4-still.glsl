/* SEL sel104-u4 — pencil still life: a stack of well-read books with a young plant on top, and a small lantern. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.3245,0.3447,-0.6565)
#define CAM_TGT vec3(-0.1199,0.0038,0.0935)
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
  q=P(p,vec3(0.0,0.02,0.02),0.0); r=U(r,bookC(q,vec3(0.11,0.02,0.08)).x,3.);
  q=P(p,vec3(0.0,0.02,0.02),0.0); r=U(r,bookC(q,vec3(0.11,0.02,0.08)).y,4.);
  q=P(p,vec3(0.01,0.058,0.02),0.15); r=U(r,bookC(q,vec3(0.1,0.018,0.07)).x,5.);
  q=P(p,vec3(0.01,0.058,0.02),0.15); r=U(r,bookC(q,vec3(0.1,0.018,0.07)).y,6.);
  q=P(p,vec3(0.0,0.076,0.02),0.0); r=U(r,pot(q,0.04,0.055),7.);
  q=P(p,vec3(0.0,0.115,0.02),0.4); r=U(r,sprout(q,0.07,0.03,2.0),8.);
  q=P(p,vec3(0.18,0.0,-0.03),0.4); r=U(r,lantern(q,0.035,0.12),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.02,0.02),0.0); return .45; }
  if(id==4.){ q=P(p,vec3(0.0,0.02,0.02),0.0); return bookCT(q,vec3(0.11,0.02,0.08),.45); }
  if(id==5.){ q=P(p,vec3(0.01,0.058,0.02),0.15); return .45; }
  if(id==6.){ q=P(p,vec3(0.01,0.058,0.02),0.15); return bookCT(q,vec3(0.1,0.018,0.07),.45); }
  if(id==7.){ q=P(p,vec3(0.0,0.076,0.02),0.0); return potT(q,0.04,0.055); }
  if(id==8.){ q=P(p,vec3(0.0,0.115,0.02),0.4); return .5; }
  if(id==9.){ q=P(p,vec3(0.18,0.0,-0.03),0.4); return lanternT(q,0.035,0.12); }
  return .7; }
