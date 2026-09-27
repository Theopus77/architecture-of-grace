/* Novel scene room-18-u3: a wooden footbridge over a stream in morning light, a lantern post at either end */
#define CAM_POS vec3(-0.2578,0.4804,-1.3803)
#define CAM_TGT vec3(-0.0394,0.1891,0.2216)
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

  r=U(r,p.y+.04+.05*smoothstep(.25,.05,abs(p.x))*1.+0.*p.z,1.);
  r=U(r,woodBridge(p-vec3(0,-.05,.2),.32,.1),3.);
  r=U(r,min(lanternPost(p-vec3(-.38,0,.07),.4),lanternPost(pl(p,vec3(.38,0,.33),3.14),.4)),4.);
  r=U(r,min(rock(p-vec3(-.2,0,-.05),vec3(.06,.03,.05)),rock(p-vec3(.25,0,.45),vec3(.07,.035,.05))),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==1.){ if(abs(p.x)<.25) return fract(p.z*12.+.4*sin(p.x*14.))<.12?.55:.85; return .75; }
  if(id==3.){ float k=bridgeInk(p); return k>0.?k:.6; }
  if(id==4.) return .45; if(id==5.) return .5;
  return .6; }
