/* Buddhist Texts Unit 5 "The Buddha's Life as the Texts Tell It" — pencil still life: a small
   stone stupa (the monument built over relics after the last journey), a bodhi leaf and a
   clay oil lamp. Objects only; no image of the Buddha. */
#define CAM_POS vec3(-0.4244,0.4446,-1.2269)
#define CAM_TGT vec3(-0.2691,0.0431,0.0678)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,stupaD(ry(p-vec3(.06,0.,.1),.4),1.7),3.);
  r=U(r,bodhiLeaf(ry(p-vec3(-.14,0.,-.07),-.4),1.3),4.);
  r=U(r,diya(ry(p-vec3(.27,0.,-.07),2.7),1.3),5.);
  r=U(r,flameD(ry(p-vec3(.27,0.,-.07),2.7)-DIYA_TIP(1.3),.045),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ry(p-vec3(.06,0.,.1),.4)/1.7; if(q.y<.04){ float gy=abs(fract(q.y/.008)-.5); if(gy>.42) return .35; } return .6; }
  if(id==4.) return bodhiTone(ry(p-vec3(-.14,0.,-.07),-.4),1.3);
  if(id==5.) return .5;
  if(id==6.) return .97;
  return .7; }
