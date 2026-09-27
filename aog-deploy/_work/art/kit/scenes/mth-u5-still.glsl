/* Math Unit 5 "Shapes and Equal Shares" — pencil still life: four wooden solid shapes: a
   cube, a tall cone, a square pyramid and a ball. */
#define CAM_POS vec3(-0.2822,0.1928,-0.6702)
#define CAM_TGT vec3(-0.1842,0.0216,0.0955)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float pyr(vec3 q,float b,float h){ float l=sqrt(h*h+b*b);
  float sx=(abs(q.x)*h+q.y*b-h*b)/l, sz=(abs(q.z)*h+q.y*b-h*b)/l;
  return max(max(sx,sz),-q.y); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=p-vec3(-.02,.062,.02); q.xz=rot(.5)*q.xz; r=U(r,sdRBox(q,vec3(.062),.004),3.);   /* cube */
  q=p-vec3(.15,.1,.12); r=U(r,sdCone(q,.065,.0015,.1)-.001,4.);                          /* cone */
  q=p-vec3(-.14,0.,.1); q.xz=rot(.3)*q.xz; r=U(r,pyr(q,.065,.13)-.001,5.);              /* pyramid */
  r=U(r,length(p-vec3(.14,.048,-.06))-.048,6.);                                          /* ball */
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .62+.08*grain(p*vec3(1.,1.,1.),30.);
  if(id==4.) return .72;
  if(id==5.) return .5;
  if(id==6.) return .78;
  return .7; }
