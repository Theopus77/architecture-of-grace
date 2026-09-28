/* Crosswalk: Restorative practices — a ring of five small wooden chairs facing inward around a round woven mat with a smooth talking stone at its centre. */
#define CAM_POS vec3(-0.3484,0.2363,-0.4429)
#define CAM_TGT vec3(-0.1703,-0.0074,0.0707)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define RC vec3(.0,0.,.08)
float chairs(vec3 p){ vec3 q=p-RC; float a=atan(q.z,q.x); float w=6.2831853/5.; float o=-.9424778;
  float k=floor((a-o)/w+.5); vec3 c=q; c.xz=rot(k*w+o)*c.xz; c.x-=.15;
  c.xz=rot(1.5707963)*c.xz; return chair(c,.045); }
float mat_(vec3 p){ vec3 q=p-RC; return sdCylY(q-vec3(0.,.002,0.),.09,.0015)-.001; }
float stone(vec3 p){ vec3 q=p-RC-vec3(0.,.012,0.); return sdEll(q,vec3(.034,.016,.025)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,chairs(p),3.); r=U(r,mat_(p),4.); r=U(r,stone(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  vec3 q=p-RC;
  if(id==3.) return .5+.1*grain(q,28.);
  if(id==4.){ float l=length(q.xz); if(abs(fract(l/.014)-.5)<.12) return .5; return .8; }
  if(id==5.) return .35;
  return .7; }
