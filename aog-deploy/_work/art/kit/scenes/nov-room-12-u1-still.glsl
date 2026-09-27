/* Novel scene room-12-u1: a standing mirror reflecting a window, a small backpack by it and a potted plant */
#define CAM_POS vec3(-0.2707,0.5894,-1.9198)
#define CAM_TGT vec3(0.0204,0.2984,0.1183)
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

  r=U(r,.9-p.z,2.);
  vec3 m=pl(p,vec3(0,0,.2),.15); vec2 u=m.xy-vec2(0,.36); float e=sdE2(u,vec2(.14,.26));
  r=U(r,min(max(abs(e+.012)-.014,abs(m.z)-.016)-.003,sdRBox(m-vec3(0,.04,0),vec3(.16,.04,.06),.01)),3.);
  r=U(r,max(e+.02,abs(m.z+.002)-.004),4.);
  r=U(r,backpack(pl(p,vec3(-.3,0,-.05),.5)),5.);
  vec3 pp=pl(p,vec3(.3,0,-.05),0.); r=U(r,pot(pp,1.3),6.); r=U(r,leaves(pp,1.3,9.),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.) return .55;
  if(id==4.){ vec3 m=pl(p,vec3(0,0,.2),.15); vec2 w=m.xy-vec2(.02,.42); if(abs(w.x)<.07&&abs(w.y)<.1){ if(abs(w.x)<.004||abs(w.y)<.004) return .4; return .98; } return .75; }
  if(id==5.){ float k=backpackInk(pl(p,vec3(-.3,0,-.05),.5)); return k>0.?k:.5; }
  if(id==6.) return .6; if(id==7.) return .5;
  return .6; }
