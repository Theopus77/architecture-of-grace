/* Practice room "The Subjunctive" — pencil still life of wishes and hopes: a cupcake with one
   candle waiting to be blown out, a dandelion seed head standing in a small glass bottle, and a
   sealed envelope. */
#define CAM_POS vec3(-0.3119,0.3875,-0.7563)
#define CAM_TGT vec3(-0.1831,-0.0273,0.1079)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define CK vec3(0.,0.,.02)
#define BT vec3(-.13,0.,.08)
#define EN vec3(.14,0.,-.08)
float cupD(vec3 q){ float a=atan(q.z,q.x); float d=sdCone(q-vec3(0.,.025,0.),.03,.038,.025)-.0015*abs(sin(a*12.)); return d; }
float icingD(vec3 q){ vec3 c=q-vec3(0.,.05,0.); float r=length(c.xz); float h=.028*(1.-smoothstep(0.,.044,r))+.006*sin(atan(c.z,c.x)*3.+r*200.)*smoothstep(.01,.04,r)*(1.-smoothstep(.035,.044,r));
  return max(max(c.y-h-.004,-c.y),r-.044)*.7; }
float candleD(vec3 q){ return sdCylY(q-vec3(0.,.1,0.),.0045,.022); }
float flameD(vec3 q){ return sdEll(q-vec3(0.,.132,0.),vec3(.0045,.009,.0045)); }
float bottleD2(vec3 q){ float d=sdCylY(q-vec3(0.,.03,0.),.022,.03)-.002; d=smin(d,sdCylY(q-vec3(0.,.07,0.),.008,.012),.012); d=max(d,-sdCylY(q-vec3(0.,.06,0.),.006,.03)); return d; }
float dandyD(vec3 q){ float d=sdCapsule(q,vec3(0.,.01,0.),vec3(.006,.16,0.),.0014);
  vec3 h=q-vec3(.006,.17,0.); float r=length(h); float n=vn3(normalize(h)*45.);
  d=min(d,max(r-.03-.006*n*n,-(r-.004))*.6); d=min(d,length(h)-.006); return d; }
float envD(vec3 q){ return sdRBox(q-vec3(0.,.002,0.),vec3(.07,.002,.045),.001); }
float sealD(vec3 q){ return sdCylY(q-vec3(0.,.005,-.008),.009,.002)-.001; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 c=p-CK;
  r=U(r,cupD(c),3.);
  r=U(r,icingD(c),4.);
  r=U(r,candleD(c),5.);
  r=U(r,flameD(c),6.);
  vec3 b=p-BT;
  r=U(r,bottleD2(b),7.);
  r=U(r,dandyD(b),8.);
  vec3 e=place(p,EN,-.3);
  r=U(r,envD(e),9.);
  r=U(r,sealD(e),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-CK; return abs(sin(atan(q.z,q.x)*12.))<.25?.4:.62; }
  if(id==4.) return .92;
  if(id==5.){ vec3 q=p-CK; return fract((q.y+atan(q.z,q.x)*.004)/.008)<.4?.45:.85; }
  if(id==6.) return .97;
  if(id==7.) return .9;
  if(id==8.){ vec3 h=p-BT-vec3(.006,.17,0.); if(length(h)>.012){ vec3 d=normalize(h); return vn3(d*45.)>.72?.6:.97; } return .35; }
  if(id==9.){ vec3 e=place(p,EN,-.3); vec2 u=e.xz; if(abs(abs(u.x)*.64-(u.y+.045))<.0015&&u.y>-.045) return .4; return .93; }
  if(id==10.) return .35;
  return .7; }
