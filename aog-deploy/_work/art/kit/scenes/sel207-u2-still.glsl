/* SEL sel207-u2 — pencil still life: a mended bowl with gold seams, a fine brush and a small jar. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.2064,0.2062,-0.4459)
#define CAM_TGT vec3(-0.0670,-0.0262,0.0654)
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
  q=P(p,vec3(0.0,0.0,0.03),0.3); r=U(r,bowl(q,0.1,0.075),3.);
  q=P(p,vec3(0.13,0.0,-0.08),0.4); r=U(r,brush(q,0.16),4.);
  q=P(p,vec3(-0.13,0.0,-0.02),0.0); r=U(r,jar(q,0.025,0.04),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q;
  if(id==3.){ q=P(p,vec3(0.0,0.0,0.03),0.3); return bowlT(q,0.1,0.075,.8,1.0); }
  if(id==4.){ q=P(p,vec3(0.13,0.0,-0.08),0.4); return brushT(q,0.16); }
  if(id==5.){ q=P(p,vec3(-0.13,0.0,-0.02),0.0); return .55; }
  return .7; }
