/* Science unit 28, sound, rhythm and recorded music: a snare drum, a record player with a record, and a tuning fork. */
#define CAM_POS vec3(-0.3938,0.2715,-0.5886)
#define CAM_TGT vec3(-0.1699,-0.0350,0.0576)
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

#define TT vec3(-.06,0.,.06)
#define TH vec3(.14,.022,.11)
#define DR vec3(.17,0.,-.02)
#define FK vec3(.02,0.,-.14)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,turntable(P(p,TT,.15),TH),3.);
  r=U(r,drum(P(p,DR,.3),.085,.042),4.);
  r=U(r,fork(P(p,FK,-.25),.17),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return turntableT(P(p,TT,.15),TH);
  if(id==4.) return drumT(P(p,DR,.3),.085,.042);
  if(id==5.) return .5;
  return .7; }
