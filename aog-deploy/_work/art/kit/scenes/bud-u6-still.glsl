/* Buddhist Texts Unit 6 "Key Teachings" — pencil still life: an eight-spoked Dharma wheel on
   a small wooden stand (the Eightfold Path), with a lotus flower before it. Objects only. */
#define CAM_POS vec3(-0.4578,0.4317,-1.2079)
#define CAM_TGT vec3(-0.3043,0.0481,0.0710)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define WC vec3(.06,0.,.12)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,dharmaWheel(ry(p-WC,-.35),.15),3.);
  r=U(r,lotus(ry(p-vec3(-.12,0.,-.08),.3),1.6),4.);
  r=U(r,bodhiLeaf(ry(p-vec3(.24,0.,-.08),.6),1.),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ry(p-WC,-.35); if(q.y<.024) return .38; return .55; }
  if(id==4.) return .88;
  if(id==5.) return bodhiTone(ry(p-vec3(.24,0.,-.08),.6),1.);
  return .7; }
