/* Room b30 "Light and Sound" — pencil still life: a tuning fork standing on its wooden
   sounding box (no shake, no sound), a flashlight lying on the table, and a glass prism. */
#define CAM_POS vec3(-0.4715,0.5535,-1.0444)
#define CAM_TGT vec3(-0.2960,-0.0112,0.1324)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 bQ(vec3 p){ return place(p,vec3(0.,0.,.06),.55); }
float boxD(vec3 q){ float b=sdRBox(q-vec3(0.,.035,0.),vec3(.1,.035,.045),.004);
  b=max(b,-sdBox(q-vec3(-.11,.035,0.),vec3(.1,.026,.036)));     /* open end on -x */
  b=min(b,sdRBox(q-vec3(.0,.0035,0.),vec3(.108,.0035,.052),.002));  /* feet board */
  return b; }
float forkD(vec3 q){ vec3 f=q-vec3(.03,.07,0.);
  float stem=sdCylY(f-vec3(0.,.035,0.),.0065,.045);
  float ball=length(f-vec3(0.,.07,0.))-.011;
  vec2 a=f.xy-vec2(0.,.1); float u=abs(length(a)-.021)-.0065; u=max(u,a.y);
  float bend=extrude(u,f.z,.0065,.0015);
  float p1=sdRBox(f-vec3(-.021,.16,0.),vec3(.0065,.062,.0065),.0015);
  float p2=sdRBox(f-vec3(.021,.16,0.),vec3(.0065,.062,.0065),.0015);
  return min(min(min(stem,ball),bend),min(p1,p2)); }
vec3 flQ(vec3 p){ vec3 q=p-vec3(.08,.02,-.12); q.xz=rot(2.75)*q.xz; return q; }
float flashD(vec3 q){ /* along x, head on +x */
  float body=sdCylX(q,.017,.07)-.002;
  float t=clamp((q.x-.07)/.035,0.,1.);
  float head=max(length(q.yz)-(.019+.009*t)+.0,abs(q.x-.087)-.018)-.002;
  float lens=sdCylX(q-vec3(.107,0.,0.),.026,.003);
  float cap=sdCylX(q-vec3(-.074,0.,0.),.016,.006)-.002;
  float sw=sdRBox(q-vec3(.03,.019,0.),vec3(.01,.004,.005),.002);
  return min(min(min(body,head),min(lens,cap)),sw); }
vec3 prQ(vec3 p){ return place(p,vec3(-.16,0.,-.06),.5); }
float prismD(vec3 q){ float t=sdTri2(q.xy,vec2(-.04,0.),vec2(.04,0.),vec2(0.,.07))+.0015;
  return extrude(t,q.z,.035,.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=bQ(p);
  r=U(r,boxD(b),3.);
  r=U(r,forkD(b),4.);
  r=U(r,flashD(flQ(p)),5.);
  r=U(r,prismD(prQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bQ(p); if(q.x<-.095&&abs(q.y-.035)<.027&&abs(q.z)<.037) return .15; return .6+.06*grain(p,60.); }
  if(id==4.) return .65;
  if(id==5.){ vec3 q=flQ(p); if(q.x>.103) return .85; if(abs(q.x-.02)<.003||abs(q.x+.04)<.003) return .3; if(q.x>.07) return .6; return .42; }
  if(id==6.){ vec3 q=prQ(p); if(abs(q.z)>.032) return .6; return .88; }
  return .7; }
