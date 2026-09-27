/* SEL sel207-u3 — pencil still life: a folded paper boat and a candle lantern. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.4350,0.3805,-0.6568)
#define CAM_TGT vec3(-0.2205,0.0230,0.1296)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.); vec3 q;
  q=P(p,vec3(0.03,0.0,-0.02),0.3); r=U(r,boat(q,0.16),3.);
  q=P(p,vec3(-0.12,0.0,0.08),0.5); r=U(r,lantern(q,0.045,0.16),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.03,0.0,-0.02),0.3); return boatT(q,0.16); }
  if(id==4.){ q=P(p,vec3(-0.12,0.0,0.08),0.5); return lanternT(q,0.045,0.16); }
  return .7; }
