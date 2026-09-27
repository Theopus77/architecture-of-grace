/* Novel cover, Book Three "The Year of Two Voices" (Room 36): a row of three school lockers;
   two plain masks hang from the hooks of the middle locker, a phone lies face down on the floor. */
#define CAM_POS vec3(0.2058,0.5258,-2.0737)
#define CAM_TGT vec3(0.0343,0.3543,0.0990)
#define SUN_DIR vec3(-.6,.75,-.5)
#define CAM_FOV 30.
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
#define LS vec3(.1,.34,.1)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.3-p.z,2.);
  r=U(r,lockers(p-vec3(0,0,.2),3.,LS),3.);
  vec3 m1=p-vec3(-.035,.5,.075); m1.xy=rot(.12)*m1.xy; r=U(r,mask(m1),4.);
  vec3 m2=p-vec3(.04,.42,.08); m2.xy=rot(-.1)*m2.xy; r=U(r,mask(m2),5.);
  r=U(r,phone(pl(p,vec3(.12,0,-.14),.5)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.){ float k=lockersInk(p-vec3(0,0,.2),3.,LS); return k>0.?k:.5; }
  if(id==4.) return .92;
  if(id==5.) return .8;
  if(id==6.){ float k=phoneInk(pl(p,vec3(.12,0,-.14),.5)); return k>0.?k:.4; }
  return .7; }
