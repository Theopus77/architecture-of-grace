/* Novel scene room-18-u1: a hiking trail stop: a backpack, a compass on a rock and a small wooden signpost */
#define CAM_POS vec3(-0.2321,0.4679,-1.5299)
#define CAM_TGT vec3(0.0024,0.2335,0.1116)
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
  r=U(r,backpack(pl(p,vec3(-.25,0,.05),.4)),3.);
  r=U(r,rock(p-vec3(.08,.0,-.05),vec3(.14,.06,.1)),4.);
  r=U(r,compass(pl(p,vec3(.08,.052,-.06),.4)),5.);
  r=U(r,signpost(pl(p,vec3(.32,0,.15),.2),.5),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.){ float k=backpackInk(pl(p,vec3(-.25,0,.05),.4)); return k>0.?k:.5; }
  if(id==4.) return .55;
  if(id==5.){ float k=compassInk(pl(p,vec3(.08,.052,-.06),.4)); return k>0.?k:.7; }
  if(id==6.) return .55;
  return .6; }
