/* Medicine and Health Unit 8 "Ancient Medicine" — pencil still life: a two-handled clay
   jar for oils and herbs, a rolled scroll tied with a cord, and a small clay oil lamp. */
#define CAM_POS vec3(-0.3972,0.3670,-0.8316)
#define CAM_TGT vec3(-0.2499,0.0112,0.0533)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define JR vec3(-.02,0.,.08)
#define SC vec3(.12,0.,-.05)
#define LP vec3(-.15,0.,-.06)
float jarD(vec3 p){ vec3 q=p-JR; float y=q.y;
  /* a turned profile: radius as a function of height */
  float r=.02+.06*sin(clamp((y-.0)/.19,0.,1.)*3.1416*.95)*smoothstep(-.02,.06,y);
  r=mix(r,.026,smoothstep(.17,.19,y)); r=max(r,.028*(1.-smoothstep(.0,.03,y))+.0);
  float d=(length(q.xz)-r)*.7; d=max(d,abs(y-.11)-.11);
  d=max(d,-sdCylY(q-vec3(0.,.22,0.),.018,.05));
  d=min(d,sdTorus(q-vec3(0.,.218,0.),.026,.005));
  d=min(d,sdCylY(q-vec3(0.,.006,0.),.034,.006)-.001);
  for(int s=0;s<2;s++){ float sx=float(s)*2.-1.; vec3 h=q-vec3(sx*.045,.18,0.);
    float hd=length(vec2(length(vec2(h.x,h.y*.7)*vec2(sx,1.))-.022,h.z))-.005; hd=max(hd,-sx*h.x-.0); hd=max(hd,-(h.y+.02));
    d=min(d,hd); }
  return d+.0006*fbm(q.xy*150.); }
vec3 scQ(vec3 p){ vec3 q=p-SC-vec3(0.,.028,0.); q.xz=rot(-.35)*q.xz; return q; }
float scrollD(vec3 p){ vec3 q=scQ(p);
  float d=sdCylX(q,.026,.085)-.002;
  d=max(d,-sdCylX(q-vec3(0.,.004,.003),.009,.1));
  d=min(d,sdRBox(q-vec3(0.,-.0255,-.05),vec3(.083,.0012,.04),.001));   /* the loose end lying open */
  return d; }
float cordD(vec3 p){ vec3 q=scQ(p); return min(sdTorus(q.yxz-vec3(0.,.02,0.),.029,.0022),sdTorus(q.yxz-vec3(0.,-.02,0.),.029,.0022)); }
float lampD(vec3 p){ const float S=1.6; vec3 q=place(p,LP,-.25)/S;
  float b=sdEll(q-vec3(0.,.018,0.),vec3(.04,.02,.035)); b=max(b,-q.y+.002);
  b=smin(b,sdEll(q-vec3(.045,.016,0.),vec3(.028,.012,.013)),.012);          /* nozzle */
  b=max(b,-(length(q-vec3(0.,.04,0.))-.016));                              /* fill hole */
  b=max(b,-(length(q-vec3(.062,.026,0.))-.005));                           /* wick hole */
  b=min(b,sdTorus((q-vec3(-.045,.026,0.)).xzy,.011,.0035));                 /* ring handle */
  return b*S; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,jarD(p),3.);
  r=U(r,scrollD(p),4.);
  r=U(r,cordD(p),5.);
  r=U(r,lampD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-JR; float a=atan(q.z,q.x);
    if(abs(q.y-.1)<.0025||abs(q.y-.075)<.0025) return .3;
    if(q.y>.078&&q.y<.097&&abs(fract(a*1.9)-.5)<.07) return .35;          /* a simple painted band */
    return .6+.06*fbm(q.xy*80.); }
  if(id==4.){ vec3 q=scQ(p); if(q.y<-.02&&q.z<-.015){ float l=fract((q.z+.1)/.011); if(l<.18&&abs(q.x)<.065&&q.z<-.02) return .6; }
    if(abs(abs(q.x)-.087)<.004) return .6; return .88; }
  if(id==5.) return .35;
  if(id==6.) return .55+.08*fbm(p.xz*120.);
  return .7; }
