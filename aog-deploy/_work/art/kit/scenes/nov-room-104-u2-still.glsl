/* Novel scene room-104-u2: a backpack set down on a park bench after rain, puddles on the path and a tree behind */
#define CAM_POS vec3(-0.5589,0.8190,-2.5506)
#define CAM_TGT vec3(-0.0839,0.4232,0.1403)
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

  r=U(r,bench(p-vec3(0,0,.1)),3.);
  r=U(r,backpack(pl(p,vec3(.18,.43,.08),.3)*1.1)/1.1,4.);
  r=U(r,tree(p-vec3(-.55,0,.55),.9,.25),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==1.){ float e=min(sdE2(p.xz-vec2(-.2,-.3),vec2(.15,.05)),sdE2(p.xz-vec2(.35,-.2),vec2(.1,.035))); if(e<0.) return abs(e)<.004?.4:.97; return .72; }
  if(id==3.) return .5;
  if(id==4.){ float k=backpackInk(pl(p,vec3(.18,.43,.08),.3)*1.1); return k>0.?k:.5; }
  if(id==5.) return .55;
  return .6; }
