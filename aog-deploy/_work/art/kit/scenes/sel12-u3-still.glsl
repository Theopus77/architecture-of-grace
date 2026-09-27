/* SEL sel12-u3 — pencil still life: two small wooden chairs facing each other, with a ball between them. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.3851,0.3553,-0.6807)
#define CAM_TGT vec3(-0.1709,-0.0017,0.1049)
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
  q=P(p,vec3(-0.1,0.0,0.0),-1.5708); r=U(r,chair(q,0.1),3.);
  q=P(p,vec3(0.1,0.0,0.0),1.5708); r=U(r,chair(q,0.1),4.);
  q=P(p,vec3(0.0,0.0,-0.05),0.0); r=U(r,ball(q,0.03),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(-0.1,0.0,0.0),-1.5708); return chairT(q,0.1); }
  if(id==4.){ q=P(p,vec3(0.1,0.0,0.0),1.5708); return chairT(q,0.1); }
  if(id==5.){ q=P(p,vec3(0.0,0.0,-0.05),0.0); return ballT(q,0.03); }
  return .7; }
