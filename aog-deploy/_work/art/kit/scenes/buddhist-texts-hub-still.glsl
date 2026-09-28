/* Buddhist texts hub: a palm-leaf manuscript between wooden boards tied with a cord, and a small hand bell. Objects only. */
#define CAM_POS vec3(-0.4152,0.3370,-0.6344)
#define CAM_TGT vec3(-0.1697,0.0008,0.0745)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "hubparts.glsl"

#define PM vec3(-.02,0.,.02)
#define PH vec3(.17,.02,.038)
#define BL vec3(.17,0.,-.07)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,palm(P(p,PM,.3),PH),3.);
  r=U(r,palm(P(p,PM+vec3(.01,2.*PH.y,.005),.38),PH*vec3(.95,.8,1.)),4.);
  r=U(r,bell(p-BL,1.3),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return palmT(P(p,PM,.3),PH);
  if(id==4.) return palmT(P(p,PM+vec3(.01,2.*PH.y,.005),.38),PH*vec3(.95,.8,1.));
  if(id==5.) return bellT(p-BL,1.3);
  return .7; }
