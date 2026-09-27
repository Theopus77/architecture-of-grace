/* b9 "A More Perfect Union" — a partly unrolled parchment with hint-lines of writing, a quill
   standing in a square inkwell, and a wax-seal stamp beside a round seal. */
#define CAM_POS vec3(-0.5073,0.2976,-0.7703)
#define CAM_TGT vec3(-0.2245,-0.0043,0.1162)
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
/* parchment: a flat sheet with a roll at each end, lying across the table */
vec3 pQ(vec3 p){ vec3 q=p-vec3(-.02,0.,0.); q.xz=rot(.12)*q.xz; return q; }
float parch(vec3 p){ vec3 q=pQ(p);
  float sheet=sdBox(q-vec3(0.,.0015+.004*sin(q.x*30.)*0.,0.),vec3(.15,.0012,.09));
  float r1=sdCylX(q-vec3(0.,.02,.1),.02,.16); r1=max(r1,-sdCylX(q-vec3(0.,.02,.1),.012,.17));
  float r2=sdCylX(q-vec3(0.,.013,-.095),.013,.16);
  return min(sheet,min(r1,r2)); }
#define IW vec3(.2,0.,.13)
float inkwell(vec3 p){ vec3 q=place(p,IW,.3);
  float b=sdRBox(q-vec3(0.,.025,0.),vec3(.035,.025,.035),.006);
  float n=sdCylY(q-vec3(0.,.055,0.),.018,.008)-.002;
  float d=min(b,n); d=max(d,-sdCylY(q-vec3(0.,.06,0.),.012,.01));
  return d; }
vec3 qQ(vec3 p){ vec3 q=p-IW-vec3(0.,.04,0.); q.xy=rot(.62)*q.xy; q.zy=rot(-.15)*q.zy; q.xz=rot(.2)*q.xz; return q; }
float quill(vec3 p){ vec3 q=qQ(p);
  if(length(q-vec3(0.,.1,0.))>.14) return length(q-vec3(0.,.1,0.))-.12;
  float shaft=sdCapsule(q,vec3(0.,-.02,0.),vec3(0.,.2,0.),.0022);
  float y=q.y; float w=.026*smoothstep(.03,.09,y)*smoothstep(.21,.14,y);
  float bend=.012*pow(max(y,0.)/.2,2.);
  vec3 v=vec3(q.x-bend,y,q.z);
  float side=v.x;                                  /* vane spreads in x */
  float notch=.002*step(.5,fract(y/.012+(side>0.?0.:.5)))*smoothstep(.12,.2,y);
  float vane=max(abs(v.z)-.0008,max(abs(side)-w+notch,-(y-.03)));
  vane=max(vane,y-.21);
  return min(shaft,vane); }
vec3 sQ(vec3 p){ return place(p,vec3(.13,0.,-.11),-.4); }
float stamp(vec3 p){ vec3 q=sQ(p);
  float base=sdCylY(q-vec3(0.,.008,0.),.016,.008)-.001;
  float neck=sdCylY(q-vec3(0.,.03,0.),.005+.003*sin(q.y*120.),.016);
  float knob=sdEll(q-vec3(0.,.065,0.),vec3(.012,.02,.012));
  return min(base,min(neck,knob)); }
float seal(vec3 p){ vec3 q=p-vec3(.05,.0,-.1); float a=atan(q.z,q.x);
  float r=.018+.002*sin(a*7.)+.0015*sin(a*13.);
  float d=sdCylY(q-vec3(0.,.003,0.),r,.003)-.001;
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,parch(p),3.);
  r=U(r,inkwell(p),4.);
  r=U(r,quill(p),5.);
  r=U(r,stamp(p),6.);
  r=U(r,seal(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pQ(p); float a=.9-.08*fbm(q.xz*40.);
    if(q.y<.004&&abs(q.x)<.1&&q.z>-.07&&q.z<.075){ float l=fract((q.z+.07)/.012);
      float len=.07+.025*h1(vec2(floor((q.z+.07)/.012),1.));
      if(l<.22&&q.x>-.09&&q.x<-.09+len*1.8) a=.45+.2*step(.6,vn(q.xz*vec2(300.,40.))); }
    return a; }
  if(id==4.){ vec3 q=place(p,IW,.3); if(q.y>.058) return .15; return .35; }
  if(id==5.){ vec3 q=qQ(p); if(q.y<.02) return .3; return .78; }
  if(id==6.) return .4+.1*grain(sQ(p),60.);
  if(id==7.){ vec3 q=p-vec3(.05,.0,-.1); return length(q.xz)<.011&&length(q.xz)>.009?.2:.35; }
  return .7; }
