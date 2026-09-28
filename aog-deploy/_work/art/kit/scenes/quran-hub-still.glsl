/* Qur'an hub card: a wooden folding book stand (rehal) holding an open book with an ornamental frame and hint-lines only, no writing, and a lantern. Objects only. */
#define CAM_POS vec3(-0.4851,0.4119,-0.7642)
#define CAM_TGT vec3(-0.1909,0.0088,0.0856)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "hubparts.glsl"

#define RP vec3(0.,0.,.02)
#define RR .3
#define RL .17
#define LP vec3(.2,0.,-.1)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 q=P(p,RP,RR);
  r=U(r,rehal(q,RL),3.);
  r=U(r,rehalBook(q,RL,.1,.075),4.);
  r=U(r,lantern(P(p,LP,.4),.035,.13),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return rehalT(P(p,RP,RR),RL);
  if(id==4.) return rehalBookT(P(p,RP,RR),RL,.1,.075);
  if(id==5.) return lanternT(P(p,LP,.4),.035,.13);
  return .7; }
