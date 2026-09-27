/* SEL sel207-u1 — pencil still life: a brass compass resting on an unrolled map, with a pencil. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.2626,0.1853,-0.4933)
#define CAM_TGT vec3(-0.1119,-0.0660,0.0596)
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
  q=P(p,vec3(0.0,0.0,0.02),0.05); r=U(r,mapS(q,0.16,0.1),3.);
  q=P(p,vec3(0.04,0.002,0.0),0.2); r=U(r,compass(q,0.05),4.);
  q=P(p,vec3(-0.08,0.0086,-0.04),0.9); r=U(r,pencilL(q,0.08),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.02),0.05); return mapT(q); }
  if(id==4.){ q=P(p,vec3(0.04,0.002,0.0),0.2); return compassT(q,0.05); }
  if(id==5.){ q=P(p,vec3(-0.08,0.0086,-0.04),0.9); return pencilT(q,0.08); }
  return .7; }
