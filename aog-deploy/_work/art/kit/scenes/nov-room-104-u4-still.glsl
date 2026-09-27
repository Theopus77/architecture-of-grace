/* Novel scene room-104-u4: a stone footbridge with lanterns crossing a calm river */
#define CAM_POS vec3(-0.1773,0.4218,-1.1208)
#define CAM_TGT vec3(0.0132,0.3728,0.2148)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.5,.5,-.5)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,p.y+.06*smoothstep(.4,.2,abs(p.z-.2))*0.+.0,1.);
  r=U(r,stoneBridge(p-vec3(0,.1,.2),.42,.09),3.);
  r=U(r,min(lanternPost(p-vec3(-.3,.34,.1),.18),lanternPost(p-vec3(.3,.34,.1),.18)),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==1.){ if(p.z<.55) return fract(p.x*10.+.5*sin(p.z*12.))<.08?.6:.85; return .75; }
  if(id==3.){ vec2 u=p.xy*vec2(18.,28.); u.x+=.5*mod(floor(u.y),2.); return (fract(u.x)<.07||fract(u.y)<.1)?.4:.65; }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=p; return .55; }
  return .6; }
