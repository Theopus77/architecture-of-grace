/* SEL sel12-u4 — pencil still life: a basket of apples, with one apple set out to share. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.2217,0.2662,-0.5075)
#define CAM_TGT vec3(-0.0623,0.0008,0.0764)
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
  q=P(p,vec3(0.0,0.0,0.03),0.3); r=U(r,basket(q,0.1,0.07),3.);
  q=P(p,vec3(-0.04,0.04,0.03),0.0); r=U(r,apple(q,0.035,0.0),4.);
  q=P(p,vec3(0.035,0.04,0.05),1.0); r=U(r,apple(q,0.035,0.0),5.);
  q=P(p,vec3(0.0,0.045,-0.01),2.0); r=U(r,apple(q,0.035,0.0),6.);
  q=P(p,vec3(0.16,0.0,-0.08),0.5); r=U(r,apple(q,0.035,0.0),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.03),0.3); return basketT(q,0.1,0.07); }
  if(id==4.){ q=P(p,vec3(-0.04,0.04,0.03),0.0); return appleT(q,0.035); }
  if(id==5.){ q=P(p,vec3(0.035,0.04,0.05),1.0); return appleT(q,0.035); }
  if(id==6.){ q=P(p,vec3(0.0,0.045,-0.01),2.0); return appleT(q,0.035); }
  if(id==7.){ q=P(p,vec3(0.16,0.0,-0.08),0.5); return appleT(q,0.035); }
  return .7; }
