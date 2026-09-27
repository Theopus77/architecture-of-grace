/* Novel scene room-18-u2: a lighthouse on a rocky headland above a calm sea, its lamp lit at dusk */
#define CAM_POS vec3(-0.2423,0.5885,-1.8962)
#define CAM_TGT vec3(0.0446,0.3018,0.2078)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.6,.5,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,rock(p-vec3(.05,0,.2),vec3(.45,.12,.3)),3.);
  r=U(r,lighthouse(p-vec3(.1,.1,.2),.42),4.);
  r=U(r,house(pl(p,vec3(-.12,.08,.25),.4),vec3(.06,.035,.045)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==1.){ return fract(p.z*14.+.3*sin(p.x*9.))<.1?.6:.85; }
  if(id==3.) return .5;
  if(id==4.){ float k=lighthouseInk(p-vec3(.1,.1,.2),.42); return k>0.?k:.9; }
  if(id==5.) return .7;
  return .6; }
