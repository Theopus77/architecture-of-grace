/* Novel scene room-36-u4: a lantern-lit garden path leading to an open gate */
#define CAM_POS vec3(-0.2782,0.4883,-1.4374)
#define CAM_TGT vec3(-0.0527,0.2629,0.2157)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.5,.6,-.5)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,gate(p-vec3(0,0,.35),.16,.3,1.2),3.);
  r=U(r,min(lanternPost(p-vec3(-.25,0,.1),.35),lanternPost(pl(p,vec3(.25,0,.1),3.14),.35)),4.);
  r=U(r,min(tree(p-vec3(-.45,0,.5),.5,.15),tree(p-vec3(.45,0,.55),.55,.16)),5.);
  r=U(r,min(sdRBox(p-vec3(-.45,.05,.35),vec3(.25,.05,.03),.01),sdRBox(p-vec3(.45,.05,.35),vec3(.25,.05,.03),.01)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==1.){ if(abs(p.x+.05*sin(p.z*6.))<.1&&p.z<.35){ vec3 v=voro(p.xz*25.); return v.y-v.x<.08?.45:.85; } return .7; }
  if(id==3.) return .45; if(id==4.) return .45; if(id==5.) return .5; if(id==6.) return .6;
  return .6; }
