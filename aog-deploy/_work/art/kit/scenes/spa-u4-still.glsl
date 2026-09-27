/* Spanish Unit 4 "One and Many, Big and Little" — pencil still life: one big striped ball, a
   middle-sized ball, and a small crowd of little marbles rolled together in front. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.03,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define BB vec3(.05,.1,.06)
#define MB vec3(-.12,.05,.02)
vec3 mc(int i){ float fi=float(i); vec2 o=i==0?vec2(0.):i==1?vec2(.04,.01):i==2?vec2(.02,-.035):i==3?vec2(-.02,-.03):i==4?vec2(.07,-.03):i==5?vec2(-.04,.012):vec2(.1,.0);
  return vec3(-.02+o.x,.019,-.1+o.y); }
float marbles(vec3 p){ float d=1e5; for(int i=0;i<7;i++) d=min(d,length(p-mc(i))-.019); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,length(p-BB)-.1,3.);
  r=U(r,length(p-MB)-.05,4.);
  r=U(r,marbles(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=normalize(p-BB); q.xy=rot(.5)*q.xy; q.xz=rot(.4)*q.xz; float a=atan(q.z,q.x);
    if(abs(q.y)>.93) return .9;                                 /* white cap */
    float s=fract(a/(PI/3.)); if(abs(s-.5)<.025) return .3;     /* seam */
    return mod(floor(a/(PI/3.)),2.)<1.?.3:.85; }                  /* six panels, alternating */
  if(id==4.){ vec3 q=normalize(p-MB); q.xy=rot(-.4)*q.xy; return abs(q.y)<.3?.3:.8; }
  if(id==5.){ int k=0; float b=1e5; for(int i=0;i<7;i++){ float d=length(p-mc(i)); if(d<b){b=d;k=i;} }
    vec3 q=normalize(p-mc(k)); float sw=sin(atan(q.z,q.x)*2.+q.y*4.+float(k)); return sw>.6?.25:(k==2||k==5?.6:.82); }
  return .7; }
