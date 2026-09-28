/* Hindu texts hub: a palm-leaf bundle tied with a cord and a brass pedestal oil lamp with a small flame. Objects only. */
#define CAM_POS vec3(-0.5674,0.4375,-0.7886)
#define CAM_TGT vec3(-0.2566,0.0116,0.1096)
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

#define PM vec3(-.05,0.,.0)
#define PH vec3(.16,.022,.036)
#define LP vec3(.14,0.,.05)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,palm(P(p,PM,.18),PH),3.);
  r=U(r,brassLamp(P(p,LP,2.7),1.15),4.);
  r=U(r,brassFlame(P(p,LP,2.7),1.15),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return palmT(P(p,PM,.18),PH);
  if(id==4.) return brassLampT(P(p,LP,2.7),1.15);
  if(id==5.) return .97;
  return .7; }
