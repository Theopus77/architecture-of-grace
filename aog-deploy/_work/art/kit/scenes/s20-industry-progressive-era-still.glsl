/* s20 "US History: Industry to the Progressive Era" — an old candlestick telephone with its
   hanging earpiece, a big early light bulb standing in its socket base, and an iron railroad
   spike lying on the table. */
#define CAM_POS vec3(-0.5165,0.3266,-0.7994)
#define CAM_TGT vec3(-0.2226,0.0131,0.1215)
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
#define TP vec3(-.05,0.,.12)
float phone(vec3 p){ vec3 q=p-TP;
  float base=sdCone(q-vec3(0.,.018,0.),.05,.03,.018)-.002;
  float stem=sdCylY(q-vec3(0.,.12,0.),.009,.09);
  float collar=sdCylY(q-vec3(0.,.205,0.),.013,.006)-.001;
  vec3 m=q-vec3(0.,.225,-.012); m.yz=rot(-.35)*m.yz;
  float mouth=sdCone(m-vec3(0.,0.,0.),.012,.024,.014); mouth=max(mouth,-sdCylY(m-vec3(0.,.012,0.),.018,.008));
  mouth=sdCone(vec3(m.x,-m.z,m.y),.012,.024,.014); mouth=max(mouth,-(length(m-vec3(0.,0.,-.02))-.017));
  float hook=sdCapsule(q,vec3(.012,.18,0.),vec3(.04,.19,0.),.003);
  vec3 e=q-vec3(.052,.14,0.); float ear=sdCylY(e,.012,.035)-.002; ear=min(ear,sdCylY(e-vec3(0.,.04,0.),.018,.006)-.002);
  float cord=sdCapsule(q,vec3(.052,.105,0.),vec3(.06,.01,-.04),.0025);
  return min(min(min(base,stem),min(collar,mouth)),min(hook,min(ear,cord))); }
#define LB vec3(.13,0.,.06)
float bulbBase(vec3 p){ vec3 q=p-LB;
  float b=sdCylY(q-vec3(0.,.012,0.),.035,.012)-.003;
  float sock=sdCylY(q-vec3(0.,.04,0.),.016+.0015*sin(q.y*700.),.018);
  return min(b,sock); }
float bulb(vec3 p){ vec3 q=p-LB-vec3(0.,.1,0.);
  float g=smin(length(q)-.045,sdCylY(q+vec3(0.,.04,0.),.015,.02),.03);
  return abs(g)-.0015; }
float fil(vec3 p){ vec3 q=p-LB-vec3(0.,.1,0.);
  float w=min(sdCapsule(q,vec3(-.008,-.04,0.),vec3(-.01,.0,0.),.0012),sdCapsule(q,vec3(.008,-.04,0.),vec3(.01,.0,0.),.0012));
  vec2 a=q.xy-vec2(0.,.0); float loop=max(sdTorus(vec3(q.x,q.z,q.y-.0).xzy,.01,.0012),-q.y);
  loop=length(vec2(length(q.xy)-.01,q.z))-.0012; loop=max(loop,-q.y);
  return min(w,loop); }
vec3 spQ(vec3 p){ vec3 q=p-vec3(.08,.006,-.1); q.xz=rot(.3)*q.xz; return q; }
float spike(vec3 p){ vec3 q=spQ(p);
  float sh=sdBox(q,vec3(.06,.0055,.0055))-.0008;
  vec2 t=vec2(q.x-.06,0.); float tip=max(max(abs(q.y),abs(q.z))-.0055*(1.-clamp((q.x-.06)/.016,0.,1.)),abs(q.x-.068)-.008);
  float head=sdRBox(q-vec3(-.064,.0,-.004),vec3(.004,.007,.012),.001);
  return min(min(sh,tip),head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,phone(p),3.);
  r=U(r,bulbBase(p),4.);
  r=U(r,bulb(p),5.);
  r=U(r,fil(p),6.);
  r=U(r,spike(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .3;
  if(id==4.){ vec3 q=p-LB; if(q.y>.024) return .6; return .4+.12*grain(q,50.); }
  if(id==5.) return .94;
  if(id==6.) return .2;
  if(id==7.) return .35+.1*step(.6,fbm(p.xz*300.));
  return .7; }
