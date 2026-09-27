/* Novel scene room-104-u4: a stone footbridge with lanterns crossing a calm river */
#define CAM_POS vec3(-0.1795,0.1393,-1.0261)
#define CAM_TGT vec3(0.0251,0.2084,0.2220)
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
  r=U(r,archBridge(p-vec3(0,0,.2),.42,.09),3.);
  r=U(r,min(lanternPost(p-vec3(-.36,.14,.14),.2),lanternPost(p-vec3(.36,.14,.14),.2)),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==1.){ vec2 u=p.xz-vec2(0,.12); if(abs(u.x)<.14&&u.y<0.&&u.y>-.25&&fract(p.z*40.)<.3) return .45; return fract(p.z*16.+.3*sin(p.x*11.))<.1?.6:.88; }
  if(id==3.){ vec2 u=p.xy*vec2(18.,28.); u.x+=.5*mod(floor(u.y),2.); return (fract(u.x)<.07||fract(u.y)<.1)?.4:.65; }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=p; return .55; }
  return .6; }
