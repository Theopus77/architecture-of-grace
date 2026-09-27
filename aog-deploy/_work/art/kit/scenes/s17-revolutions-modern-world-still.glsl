/* s17 "Revolutions and the Modern World" — a model steam engine (a boiler on its firebox with
   a chimney, a cylinder and a big spoked flywheel) beside a rolled declaration tied with a
   ribbon: the industrial and the political revolutions side by side. */
#define CAM_POS vec3(-0.3438,0.2628,-0.6005)
#define CAM_TGT vec3(-0.1220,0.0264,0.0938)
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
vec3 eQ(vec3 p){ return place(p,vec3(-.03,0.,.12),-.15); }
float engine(vec3 p){ vec3 q=eQ(p);
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.14,.008,.06),.003);
  float fire=sdRBox(q-vec3(-.06,.035,0.),vec3(.05,.022,.04),.003);
  float boil=sdCylX(q-vec3(-.06,.085,0.),.035,.055)-.002;
  boil=min(boil,sdCylX(q-vec3(-.06,.085,0.),.037,.003)); boil=min(boil,sdCylX(q-vec3(-.02,.085,0.),.037,.003));
  float chim=sdCylY(q-vec3(-.1,.15,0.),.009,.045); chim=min(chim,sdCylY(q-vec3(-.1,.195,0.),.013,.004)-.001);
  float dome=length(q-vec3(-.05,.12,0.))-.014;
  float cyl=sdCylX(q-vec3(.03,.045,.0),.016,.028)-.002;
  float rod=sdCapsule(q,vec3(.06,.045,0.),vec3(.1,.05,-.02),.003);
  vec3 f=q-vec3(.1,.075,-.025); float r=length(f.xy);
  float wheel=max(abs(r-.058)-.006,abs(f.z)-.006);
  wheel=min(wheel,max(r-.01,abs(f.z)-.01));
  for(int i=0;i<3;i++){ float a=float(i)*1.047; vec2 d=vec2(cos(a),sin(a)); wheel=min(wheel,max(abs(dot(f.xy,vec2(-d.y,d.x)))-.0025,max(abs(f.z)-.003,r-.055))); }
  float post=sdRBox(q-vec3(.1,.04,-.01),vec3(.006,.035,.004),.002);
  float d=min(min(base,fire),min(boil,chim)); d=min(d,min(dome,cyl)); d=min(d,min(rod,min(wheel,post)));
  return d; }
vec3 scQ(vec3 p){ vec3 q=p-vec3(.2,.016,-.07); q.xz=rot(-.5)*q.xz; return q; }
float scroll(vec3 p){ vec3 q=scQ(p); return sdCylX(q,.016,.07)-.001; }
float ribbon(vec3 p){ vec3 q=scQ(p); float r=sdTorus(q.yxz,.0172,.0022);
  r=min(r,sdRBox(q-vec3(.006,-.012,-.018),vec3(.004,.001,.012),.001)); return r; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,engine(p),3.);
  r=U(r,scroll(p),4.);
  r=U(r,ribbon(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=eQ(p); if(q.y<.016) return .4+.1*grain(q,40.);
    if(q.x>-.11&&q.x<-.01&&q.y<.057&&q.z<-.038){ vec2 w=q.xy-vec2(-.06,.035); if(abs(w.x)<.015&&abs(w.y)<.01) return .15; }
    if(q.y>.057&&q.y<.125&&q.x<-.004&&abs(q.z)<.04&&fract(q.x/.012)<.1) return .35;
    return .55; }
  if(id==4.){ vec3 q=scQ(p); if(abs(q.x)>.068) return .5; return .88; }
  if(id==5.) return .3;
  return .7; }
