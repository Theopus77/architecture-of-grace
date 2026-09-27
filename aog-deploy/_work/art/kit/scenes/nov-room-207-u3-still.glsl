/* Novel scene room-207-u3: a lighthouse on a headland at first light, its lamp still lit over a calm sea */
#define CAM_POS vec3(0.2737,0.6138,-2.0927)
#define CAM_TGT vec3(-0.0406,0.3519,0.2117)
#define CAM_FOV 30.
#define SUN_DIR vec3(.5,.35,-.5)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,rock(p-vec3(-.05,0,.25),vec3(.4,.15,.3)),3.);
  r=U(r,lighthouse(p-vec3(-.08,.13,.25),.48),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==1.){ return fract(p.z*14.+.3*sin(p.x*9.))<.1?.6:.88; }
  if(id==3.) return .5;
  if(id==4.){ float k=lighthouseInk(p-vec3(-.08,.13,.25),.48); return k>0.?k:.9; }
  return .6; }
