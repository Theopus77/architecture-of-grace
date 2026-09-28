/* Hebrew Bible hub card: a scroll lying open on two wooden rollers, columns shown as hint-lines only, and a small oil lamp. Objects only. */
#define CAM_POS vec3(-0.3549,0.2754,-0.6105)
#define CAM_TGT vec3(-0.1285,-0.0347,0.0434)
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

#define SC vec3(-.01,0.,.02)
#define SR .12
#define LP vec3(.2,0.,-.1)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,scrollD(P(p,SC,SR),.12,.09,.026),3.);
  r=U(r,oilLamp(P(p,LP,2.5),1.),4.);
  r=U(r,lampFlame(P(p,LP,2.5),1.),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return scrollT(P(p,SC,SR),.12,.09,.026);
  if(id==4.) return oilLampT(P(p,LP,2.5),1.);
  if(id==5.) return .97;
  return .7; }
