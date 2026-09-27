/* Novel scene room-104-u3: two empty classroom chairs turned to face each other beside a tall window at dusk */
#define CAM_POS vec3(-0.2577,0.7844,-2.4718)
#define CAM_TGT vec3(0.0141,0.3768,0.1106)
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
  r=U(r,chair(pl(p,vec3(-.3,0,0),1.3),.9),3.);
  r=U(r,chair(pl(p,vec3(.3,0,0),-1.3),.9),4.);
  r=U(r,sdRBox(p-vec3(0,.36,.6),vec3(.25,.02,.18),.005),5.);
  r=U(r,sdRBox(vec3(abs(p.x)-.22,p.y-.18,abs(p.z-.6)-.15),vec3(.015,.18,.015),.004),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==2.){ vec2 w=p.xy-vec2(-.3,.55); if(abs(w.x)<.2&&abs(w.y)<.42){ if(abs(w.x)<.005||abs(w.y)<.005||abs(abs(w.x)-.2)<.008||abs(abs(w.y)-.42)<.008) return .35; return .98; } return .88; }
  if(id==3.||id==4.) return .55; if(id==5.) return .5;
  return .6; }
