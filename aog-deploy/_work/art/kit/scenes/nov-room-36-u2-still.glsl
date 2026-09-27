/* Novel scene room-36-u2: a desk under a window at dusk with a desk lamp, a notebook and a pencil */
#define CAM_POS vec3(-0.1260,0.2576,-1.0210)
#define CAM_TGT vec3(0.0325,0.1387,0.0888)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.6,.7,-.4)
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
  r=U(r,deskLamp(pl(p,vec3(-.28,0,.2),.3)),3.);
  r=U(r,notebook(pl(p,vec3(.03,0,-.02),.15),vec2(.13,.1)),4.);
  r=U(r,pencil(pl(p,vec3(.2,.0066,-.08),2.3)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==2.){ vec2 w=p.xy-vec2(.05,.4); if(abs(w.x)<.16&&abs(w.y)<.22){ if(abs(w.x)<.005||abs(w.y)<.005||abs(abs(w.x)-.16)<.008||abs(abs(w.y)-.22)<.008) return .35; return .98; } return .88; } 
  if(id==3.) return .5;
  if(id==4.){ float k=nbInk(pl(p,vec3(.03,0,-.02),.15),vec2(.13,.1)); return k>0.?k:.92; }
  if(id==5.) return pencilInk(pl(p,vec3(.2,.0066,-.08),2.3));
  return .6; }
