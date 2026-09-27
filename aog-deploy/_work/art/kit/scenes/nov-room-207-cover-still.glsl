/* Novel cover, Book Five "The Year We Walked Out" (Room 207): an open door in a dark wall,
   morning light pouring through onto the floor; a suitcase, a backpack and a pair of shoes
   wait by the door. */
#define CAM_POS vec3(-0.0626,0.5001,-1.5728)
#define CAM_TGT vec3(0.1943,0.3460,0.2769)
#define SUN_DIR vec3(.25,.55,1.)
#define KEYSOFT 24.
#define CAM_FOV 30.
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
float wallD(vec3 p){ float w=sdBox(p-vec3(0,1.,.46),vec3(3.,1.,.03)); float op=sdBox(p-vec3(0,.33,.46),vec3(.15,.33,.2)); return max(w,-op); }
float doorD(vec3 p){ vec3 q=p-vec3(-.15,0,.46); q.xz=rot(1.15)*q.xz; return sdRBox(q-vec3(.148,.33,-.01),vec3(.146,.328,.012),.003); }
float frameD(vec3 p){ vec3 q=p-vec3(0,.34,.43); float f=sdRBox(q,vec3(.175,.35,.012),.003); return max(f,-sdBox(q-vec3(0,-.01,0),vec3(.15,.34,.1))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,wallD(p),2.);
  r=U(r,frameD(p),3.);
  r=U(r,doorD(p),4.);
  r=U(r,suitcase(pl(p,vec3(.3,0,.25),.3),vec3(.1,.13,.045)),5.);
  r=U(r,backpack(pl(p,vec3(.35,0,.0),-.4)*1.1)/1.1,6.);
  r=U(r,min(shoe(pl(p,vec3(-.06,0,.1),1.2)*1.3),shoe(pl(p,vec3(-.02,0,.18),1.35)*1.3))/1.3,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .6;
  if(id==3.) return .5; if(id==4.) return .55;
  if(id==5.){ vec3 q=pl(p,vec3(.3,0,.25),.3); if(abs(q.x)>.085||abs(q.y-.13)<.004) return .3; return .45; }
  if(id==6.){ float k=backpackInk(pl(p,vec3(.35,0,.0),-.4)*1.1); return k>0.?k:.5; }
  if(id==7.) return .4;
  return .7; }
