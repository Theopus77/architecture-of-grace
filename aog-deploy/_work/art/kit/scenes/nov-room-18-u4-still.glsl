/* Novel scene room-18-u4: an orchard at harvest: a ladder against an apple tree, a wheelbarrow and a basket of fruit */
#define CAM_POS vec3(-0.4774,0.6123,-2.2754)
#define CAM_TGT vec3(-0.1363,0.3848,0.2263)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.8,-.35)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,tree(p-vec3(-.05,0,.35),.8,.25),3.);
  r=U(r,ladder(pl(p,vec3(.02,0,.15),0.),.5,-.3),4.);
  r=U(r,wheelbarrow(pl(p,vec3(-.35,0,.05),.3)*1.2)/1.2,5.);
  r=U(r,basket(p-vec3(.3,0,0),.08,.05),6.);
  r=U(r,min(min(apple(p-vec3(.29,.105,0),.028),apple(p-vec3(.33,.1,.02),.028)),apple(p-vec3(-.36,.2,.05),.03)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.) return p.y<.35?.4:.55; if(id==4.) return .6; if(id==5.) return .5;
  if(id==6.){ float k=basketInk(p-vec3(.3,0,0),.08,.05); return k>0.?k:.6; }
  if(id==7.) return .45;
  return .6; }
