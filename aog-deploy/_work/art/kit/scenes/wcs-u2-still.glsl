/* WCS Unit 2 "Food, Clothes, Words and Holidays" — a patterned bowl of rice with a pair of
   chopsticks laid on its rim, a round scored loaf of bread and a small cup. */
#define CAM_POS vec3(-0.1182,0.2502,-0.5505)
#define CAM_TGT vec3(-0.0252,-0.0493,0.0738)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BC vec3(-.02,0.,0.)
float bowl(vec3 p){ vec3 q=p-BC; vec3 s=q-vec3(0.,.11,0.);
  float d=max(abs(length(s)-.1)-.004,q.y-.078);
  d=min(d,max(abs(length(q.xz)-.04)-.004,max(-q.y,q.y-.02)));
  return d; }
float rice(vec3 p){ vec3 q=p-BC; float m=max(length((q-vec3(0.,.02,0.))*vec3(1.,1.25,1.))-.078,length(q-vec3(0.,.11,0.))-.097);
  return m+.0015*vn3(p*500.); }
float chop(vec3 p){ float a=sdCapsule(p,vec3(-.07,.079,-.03),vec3(.12,.084,-.07),.0035);
  float b=sdCapsule(p,vec3(-.07,.079,-.012),vec3(.125,.086,-.05),.0035); return min(a,b); }
#define LB vec3(.24,0.,.1)
float loaf(vec3 p){ vec3 q=p-LB; float d=length(q/vec3(.1,.07,.09))-1.; d*=.07; d=max(d,-q.y);
  d+= .006*smoothstep(.006,0.,abs(fract((q.x+q.z*.5)/.05+.5)-.5)*.05)*step(.03,q.y); return d; }
#define CC vec3(.17,0.,-.1)
float cup(vec3 p){ vec3 q=p-CC; float d=max(abs(length(q.xz)-.028)-.003,abs(q.y-.03)-.03);
  d=min(d,sdCylY(q-vec3(0.,.003,0.),.028,.003));
  d=min(d,sdTorus((q-vec3(.034,.032,0.)).xyz,.013,.004)); return max(d,-(length(q.xz)-.025)*step(.006,q.y)+0.*q.y); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowl(p),3.);
  r=U(r,rice(p),4.);
  r=U(r,chop(p),5.);
  r=U(r,loaf(p),6.);
  r=U(r,cup(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; if(abs(q.y-.06)<.003||abs(q.y-.03)<.002) return .3;
    if(q.y>.035&&q.y<.057){ float a=atan(q.z,q.x); if(abs(sin(a*14.)*.009+.046-q.y)<.0022) return .3; } return .88; }
  if(id==4.) return .95;
  if(id==5.) return .38;
  if(id==6.){ vec3 q=p-LB; if(abs(fract((q.x+q.z*.5)/.05+.5)-.5)*.05<.003&&q.y>.03) return .3; return .8; }
  if(id==7.){ vec3 q=p-CC; if(abs(q.y-.048)<.004) return .35; return .82; }
  return .7; }
