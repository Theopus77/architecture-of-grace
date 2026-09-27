/* Novel scene room-12-u2: a watering can, a young sprout in a pot and a small trowel on a garden bench */
#define CAM_POS vec3(-0.0575,0.2971,-1.0605)
#define CAM_TGT vec3(0.1059,0.1339,0.0825)
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

  r=U(r,.9-p.z,2.);
  r=U(r,wateringCan(pl(p,vec3(-.2,0,.05),.3)*.9)/.9,3.);
  vec3 sp=pl(p,vec3(.12,0,0),0.); r=U(r,pot(sp,1.1),4.); r=U(r,sprout(sp,1.1),5.);
  r=U(r,trowel(pl(p,vec3(.3,0,-.15),-.6)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.) return .6; if(id==4.) return .55; if(id==5.) return .45; if(id==6.) return .5;
  return .6; }
