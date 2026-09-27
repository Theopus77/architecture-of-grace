/* Novel scene room-36-u1: a quiet dresser at dusk with an oval mirror and a plain mask resting beside it */
#define CAM_POS vec3(-0.2260,0.3624,-1.5064)
#define CAM_TGT vec3(0.0035,0.2477,0.0993)
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
  r=U(r,sdRBox(p-vec3(0,.02,.15),vec3(.45,.02,.2),.005),3.);
  vec3 m=p-vec3(-.02,.04,.28); vec2 u=m.xy-vec2(0,.25); float e=sdE2(u,vec2(.16,.22));
  r=U(r,min(max(abs(e+.012)-.014,abs(m.z)-.016)-.003,sdRBox(m-vec3(0,.015,0),vec3(.12,.015,.05),.006)),4.);
  r=U(r,max(e+.02,abs(m.z+.002)-.004),5.);
  vec3 k=pl(p-vec3(.25,.07,.05),vec3(0),.3); k.yz=rot(-1.25)*k.yz; r=U(r,mask(k),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.) return .5+.1*grain(p,30.); if(id==4.) return .5;
  if(id==5.){ vec2 u=p.xy-vec2(-.02,.34); return .8-.25*smoothstep(-.15,.2,u.y); }
  if(id==6.) return .9;
  return .6; }
