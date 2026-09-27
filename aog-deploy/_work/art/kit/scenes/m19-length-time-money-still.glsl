/* Room m19 "Length, Time and Money" — pencil still life: a twin-bell alarm clock with hour
   ticks and hands at five minutes to three, a wooden ruler lying in front with its marks,
   and three coins of different sizes. */
#define CAM_POS vec3(-0.3509,0.4089,-0.8194)
#define CAM_TGT vec3(-0.2127,-0.0362,0.1080)
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
#define CC vec3(.0,.085,.07)
vec3 ckQ(vec3 p){ vec3 q=p-CC; q.xz=rot(.3)*q.xz; return q; }   /* face looks along -z */
float clockD(vec3 q){ float body=sdCylZ(q,.07,.022)-.006;
  float bez=sdTorus((q-vec3(0.,0.,-.029)).xzy,.068,.005);
  float face=max(length(q.xy)-.064,abs(q.z+.026)-.002);
  float d=min(max(body,-(q.z+.024)),min(bez,face));
  float feet=min(sdCapsule(q,vec3(-.04,-.06,0.),vec3(-.055,-.083,0.),.006),sdCapsule(q,vec3(.04,-.06,0.),vec3(.055,-.083,0.),.006));
  return min(d,feet); }
float bellsD(vec3 q){ float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 b=q-vec3(s*.045,.07,0.); b.xy=rot(-s*.5)*b.xy;
    float bell=max(abs(length(b)-.028)-.002,-b.y); d=min(d,bell); d=min(d,sdCapsule(q,vec3(s*.03,.055,0.),vec3(s*.045,.07,0.),.003)); }
  d=min(d,sdCapsule(q,vec3(0.,.07,0.),vec3(0.,.1,0.),.0025)); d=min(d,length(q-vec3(0.,.102,0.))-.006);
  vec3 h=q-vec3(0.,.098,.0); float handle=max(abs(length(h.xy*vec2(1.,1.4))-.03)-.003,-h.y); handle=max(handle,abs(h.z)-.004);
  return min(d,handle*.8); }
vec3 ruQ(vec3 p){ vec3 q=p-vec3(-.02,0.,-.12); q.xz=rot(-.12)*q.xz; return q; }
float coinsD(vec3 p){ return min(min(coinStack(p-vec3(.14,0.,-.01),.028,.0045,3),coinD(p-vec3(.19,0.,-.07),.022,.004)),coinD(p-vec3(.12,0.,-.08),.017,.0035)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 c=ckQ(p);
  r=U(r,clockD(c),3.);
  r=U(r,bellsD(c),4.);
  r=U(r,rulerD(ruQ(p),.17,.02,.003),5.);
  r=U(r,coinsD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ckQ(p); float r=length(q.xy);
    if(q.z<-.0265&&r<.064){ float a=atan(q.x,q.y);
      if(r>.05&&r<.06&&abs(fract(a/.5236+.5)-.5)<.07) return .15;
      if(r>.055&&r<.06&&abs(fract(a/.10472+.5)-.5)<.1) return .4;
      vec2 hr=vec2(sin(2.83),cos(2.83))*.028, mn=vec2(sin(-.5236),cos(-.5236))*.045;
      if(sdSeg2(q.xy,vec2(0.),hr)<.0025||sdSeg2(q.xy,vec2(0.),mn)<.0017||r<.004) return .12;
      return .95; }
    if(abs(q.y+.06)>0.&&q.y<-.058&&length(q.xy)>.07) return .4;
    return .45; }
  if(id==4.) return .6;
  if(id==5.) return rulerTone(ruQ(p),.17,.02,.02);
  if(id==6.) return .6;
  return .7; }
