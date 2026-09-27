/* Room b27 "Sun, Moon and Sky" — pencil still life: a garden sundial on a short stone
   pedestal (the gnomon's shadow falls across the hour lines: a shadow is a clock), and a
   small brass orrery with the Sun on its post and the Earth and Moon on an arm. */
#define CAM_POS vec3(-0.2954,0.3858,-0.7282)
#define CAM_TGT vec3(-0.1703,-0.0168,0.1110)
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
#define DC vec3(-.03,0.,0.)
#define DT .092
float pedD(vec3 p){ vec3 q=p-DC; float r=length(q.xz);
  float plinth=sdCylY(q-vec3(0.,.008,0.),.078,.008)-.002;
  float col=sdCylY(q-vec3(0.,.045,0.),.056-.006*sin(clamp((q.y-.015)/.06,0.,1.)*3.14),.03);
  float cap=sdCylY(q-vec3(0.,.08,0.),.074,.007)-.002;
  float d=min(min(plinth,col),cap);
  return d+.0012*fbm3(q*120.); }
float dialD(vec3 p){ vec3 q=p-DC; return sdCylY(q-vec3(0.,DT-.003,0.),.071,.003)-.0006; }
vec3 gQ(vec3 p){ vec3 q=p-DC-vec3(0.,DT,0.); q.xz=rot(-1.25)*q.xz; return q; }
float gnomonD(vec3 q){ float t=sdTri2(q.zy,vec2(-.045,0.),vec2(.045,0.),vec2(.045,.068));
  t=max(t,-(length(q.zy-vec2(.03,.022))-.012));
  return extrude(t,q.x,.0025,.0008); }
#define OC vec3(.2,0.,.08)
float orreryD(vec3 p){ vec3 q=p-OC;
  float base=sdCylY(q-vec3(0.,.006,0.),.05,.006)-.002;
  float post=sdCylY(q-vec3(0.,.07,0.),.004,.07);
  vec3 e=vec3(-.1,.105,-.06);
  float arm=sdCapsule(q,vec3(0.,.1,0.),e-vec3(0.,.005,0.),.003);
  arm=min(arm,sdCapsule(q,e-vec3(0.,.02,0.),e-vec3(0.,.005,0.),.0025));
  float marm=sdCapsule(q,e+vec3(0.,-.005,0.),e+vec3(.03,-.005,-.018),.0016);
  return min(min(base,post),min(arm,marm)); }
float sunD(vec3 p){ return length(p-OC-vec3(0.,.16,0.))-.038; }
float earthD(vec3 p){ return length(p-OC-vec3(-.1,.105,-.06))-.018; }
float moonD(vec3 p){ return length(p-OC-vec3(-.07,.106,-.078))-.008; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pedD(p),3.);
  r=U(r,dialD(p),4.);
  r=U(r,gnomonD(gQ(p)),5.);
  r=U(r,orreryD(p),6.);
  r=U(r,sunD(p),7.);
  r=U(r,earthD(p),8.);
  r=U(r,moonD(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .62+.2*fbm3(p*60.);
  if(id==4.){ vec3 q=gQ(p); vec2 u=vec2(q.x,q.z+.04); float r=length(u); float a=atan(u.x,u.y);
    if(n.y<.7) return .5;
    if(abs(r-.06)<.0015||abs(r-.052)<.001) return .3;
    if(r>.012&&r<.06&&abs(fract(a/.2618+.5)-.5)<.05&&u.y>-.03) return .3;
    return .78; }
  if(id==5.) return .45;
  if(id==6.) return .5;
  if(id==7.){ vec3 q=p-OC-vec3(0.,.16,0.); return .82+.08*sin(atan(q.z,q.x)*10.); }
  if(id==8.){ vec3 d=normalize(p-OC-vec3(-.1,.105,-.06)); float land=fbm(vec2(atan(d.z,d.x)*1.6,asin(d.y)*2.2))-.5; if(abs(land)<.02) return .25; return land>0.?.55:.85; }
  if(id==9.) return .7;
  return .7; }
