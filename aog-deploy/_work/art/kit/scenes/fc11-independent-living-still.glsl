/* fc11 "Independent Living and Money" — a first-apartment still life: a coffee mug, a ring of
   two house keys with a round tag, and a pay envelope with a window, leaning on the mug. */
#define CAM_POS vec3(-0.2500,0.1598,-0.4844)
#define CAM_TGT vec3(-0.0758,-0.0258,0.0614)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define MG vec3(.0,0.,.12)
float mug(vec3 p){ return cupD(place(p,MG,-.5),.045,.1,.028); }
float coffee(vec3 p){ vec3 q=p-MG; return sdCylY(q-vec3(0.,.08,0.),.038,.005); }
vec3 eQ(vec3 p){ vec3 q=p-vec3(.04,.0022,-.07); q.xz=rot(.12)*q.xz; return q; }
float env(vec3 p){ vec3 q=eQ(p); return sdRBox(q,vec3(.1,.002,.058),.0012); }
float keyD(vec3 q){
  float head=sdCylY(q-vec3(-.028,0.,0.),.013,.0022)-.0008;
  head=max(head,-sdCylY(q-vec3(-.036,0.,0.),.004,.01));
  float blade=sdRBox(q-vec3(.01,0.,0.),vec3(.028,.0018,.0045),.001);
  float cuts=max(sdBox(q-vec3(.012,0.,-.005),vec3(.022,.004,.003)),-(abs(fract(q.x/.008)-.5)*.008-.0025));
  return max(min(head,blade),-cuts+0.*cuts); }
#define KR vec3(.17,.004,.07)
float keys(vec3 p){ vec3 q=p-KR;
  float ring=sdTorus(q,.018,.0018);
  vec3 k1=q-vec3(.04,0.,.012); k1.xz=rot(-.25)*k1.xz; float d=keyD(k1+vec3(-.0,0.,0.));
  vec3 k2=q-vec3(.03,.003,-.03); k2.xz=rot(.75)*k2.xz; d=min(d,keyD(k2));
  vec3 t=q-vec3(-.03,0.,-.014); float tag=sdCylY(t,.017,.0025)-.001;
  return min(min(ring,d),tag); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mug(p),3.);
  r=U(r,coffee(p),4.);
  r=U(r,env(p),5.);
  r=U(r,keys(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=place(p,MG,-.5); if(abs(q.y-.05)<.012&&length(q.xz)>.04) return .45; return .82; }
  if(id==4.) return .25;
  if(id==5.){ vec3 q=eQ(p); vec2 u=q.xz; float a=.93;
    float w=sdBox2(u-vec2(-.03,-.01),vec2(.045,.018)); if(w<0.) a=w>-.002?.35:.75;
    if(w<-.002&&abs(fract((u.y+.03)/.009)-.5)<.1&&u.x<-.0) a=.5;
    if(abs(sdBox2(u-vec2(.075,.035),vec2(.012,.013)))<.0016) a=.35;
    return a; }
  if(id==6.) return .55;
  return .7; }
