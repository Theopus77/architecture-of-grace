/* Buddhist Texts Unit 8 "From India Across Asia" — pencil still life: a model of a tall
   polished stone pillar crowned with a wheel (like the pillars King Ashoka set up), and a
   small tiered pagoda from further east, with a road of flat stones between. Objects only. */
#define CAM_POS vec3(-0.5272,0.4583,-1.4143)
#define CAM_TGT vec3(-0.3477,0.0848,0.0805)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define PC vec3(-.06,0.,.12)
float pillar(vec3 p){ vec3 q=p-PC;
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.05,.012,.05),.003);
  float shaft=max(length(q.xz)-(.02-.004*q.y/.3),max(.02-q.y,q.y-.3));
  vec3 b=q-vec3(0.,.31,0.); float bell=max(length(b.xz)-(.018+.012*smoothstep(.03,0.,b.y)),max(-b.y,b.y-.03));
  float abac=sdCylY(q-vec3(0.,.347,0.),.03,.007)-.002;
  vec3 w=q-vec3(0.,.395,0.); float wr=sdB2(vec2(length(w.xy)-.035,w.z),vec2(.004,.004))-.001;
  float a=atan(w.y,w.x); float s=6.2832/12.; float k=floor(a/s+.5); vec2 r2=rot(k*s)*w.xy;
  float sp=max(length(vec2(r2.y,w.z))-.0025,max(-r2.x,r2.x-.035)); float hub=sdCylZ(w,.007,.005);
  return min(min(min(base,shaft),min(bell,abac)),min(min(wr,sp),hub)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,pillar(p),3.);
  r=U(r,pagodaD(ry(p-vec3(.2,0.,.06),.5),1.25),4.);
  float st=1e5; for(int i=0;i<5;i++){ vec3 c=p-vec3(-.02+float(i)*.055,.003,-.06+float(i)*.02); st=min(st,sdEll(ry(c,float(i)),vec3(.024,.005,.018))); }
  r=U(r,st,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .66;
  if(id==4.){ vec3 q=ry(p-vec3(.2,0.,.06),.5)/1.25; return fract(q.y/.045)>.6?.4:.6; }
  if(id==5.) return .55;
  return .7; }
