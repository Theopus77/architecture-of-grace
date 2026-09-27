/* SEL sel36-u3 — pencil still life: two chairs turned to face each other, with a small lantern between them. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.4353,0.3801,-0.7333)
#define CAM_TGT vec3(-0.2045,-0.0045,0.1128)
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
  q=P(p,vec3(-0.11,0.0,0.0),-1.5708); r=U(r,chair(q,0.11),3.);
  q=P(p,vec3(0.11,0.0,0.0),1.5708); r=U(r,chair(q,0.11),4.);
  q=P(p,vec3(0.0,0.0,0.03),0.4); r=U(r,lantern(q,0.028,0.09),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(-0.11,0.0,0.0),-1.5708); return chairT(q,0.11); }
  if(id==4.){ q=P(p,vec3(0.11,0.0,0.0),1.5708); return chairT(q,0.11); }
  if(id==5.){ q=P(p,vec3(0.0,0.0,0.03),0.4); return lanternT(q,0.028,0.09); }
  return .7; }
