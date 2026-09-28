/* Student self-reflection — pencil still life on the drafting table: a small round hand mirror on
   its stand, an open journal with hint-lines and a drawn heart, and a pencil lying across it. */
#define CAM_POS vec3(-0.4850,0.3442,-0.6482)
#define CAM_TGT vec3(-0.2291,-0.0067,0.0915)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define MR vec3(.12,0.,.1)
#define JN vec3(-.05,0.,-.01)
#define PN vec3(-.02,.03,-.05)
float pen(vec3 p){ vec3 q=p-PN; q.xz=rot(.5)*q.xz; return pencilL(q,.075); }
float penT(vec3 p){ vec3 q=p-PN; q.xz=rot(.5)*q.xz; return pencilT(q,.075); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mirror(P(p,MR,-.4),.055),3.);
  vec2 j=bookO(P(p,JN,.12),.075,.06); r=U(r,j.x,4.); r=U(r,j.y,5.);
  r=U(r,pen(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return mirrorT(P(p,MR,-.4),.055);
  if(id==4.) return pageT(P(p,JN,.12),.075,.06,60.);
  if(id==5.) return .45;
  if(id==6.) return penT(p);
  return .7; }
