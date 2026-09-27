/* Novel scene room-36-u3: two chairs facing each other by a tall window at twilight, a small lamp on a table between them */
#define CAM_POS vec3(-0.2546,0.7846,-2.4750)
#define CAM_TGT vec3(0.0175,0.3764,0.1102)
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
  r=U(r,chair(pl(p,vec3(-.38,0,0),-1.5708),.9),3.);
  r=U(r,chair(pl(p,vec3(.38,0,0),1.5708),.9),4.);
  r=U(r,min(sdRCyl(p-vec3(0,.3,.1),.1,.012,.004),sdCylY(p-vec3(0,.15,.1),.012,.15)),5.);
  r=U(r,lantern(p-vec3(0,.312,.1),.8),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==2.){ vec2 w=p.xy-vec2(0.,.55); if(abs(w.x)<.22&&abs(w.y)<.4){ if(abs(w.x)<.005||abs(w.y)<.005||abs(abs(w.x)-.4)<.008||abs(abs(w.y)-.4)<.008) return .35; return .98; } return .88; }
  if(id==3.||id==4.) return .55; if(id==5.) return .45; if(id==6.) return .9;
  return .6; }
