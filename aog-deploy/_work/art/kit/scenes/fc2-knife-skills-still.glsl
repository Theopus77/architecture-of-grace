/* Practice room "Knife Skills" — pencil still life: a wooden cutting board with a chef's knife
   lying on it, a whole carrot with its top cut off, and a neat row of even carrot sticks. */
#define CAM_POS vec3(-0.4034,0.4050,-0.5019)
#define CAM_TGT vec3(-0.1979,-0.0669,0.0537)
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
#define BD vec3(0.,0.,.02)
#define BT .016
vec3 bdQ(vec3 p){ vec3 q=p-BD; q.xz=rot(.12)*q.xz; return q; }
float boardD(vec3 q){ float d=sdRBox(q-vec3(0.,BT*.5,0.),vec3(.2,BT*.5,.12),.005);
  d=max(d,-sdCapsule(q-vec3(.17,BT,0.),vec3(0.,0.,-.02),vec3(0.,0.,.02),.006)); return d; }
/* chef's knife lying flat, blade toward +x, edge toward -z */
vec3 knQ(vec3 q){ vec3 k=q-vec3(-.02,BT+.003,.07); k.xz=rot(-.12)*k.xz; return k; }
float bladeD(vec3 k){ float t=clamp(k.x/.17,0.,1.); float w=.02*(1.-t*t)+.001; float zc=-.012+.012*t*t;
  float d=max(sdBox(k-vec3(.085,0.,0.),vec3(.085,.0012,.03)),max(abs(k.z-zc+.0)-w,k.x-.17));
  d=max(d,-k.x); return d; }
float handleD(vec3 k){ float d=sdRBox(k-vec3(-.055,.004,-.002),vec3(.055,.007,.011),.006); return d; }
vec3 caQ(vec3 q){ vec3 c=q-vec3(-.08,BT+.016,-.04); c.xz=rot(.3)*c.xz; return c; }
float carrotD(vec3 c){ float t=clamp((c.x+.1)/.2,0.,1.); float r=mix(.015,.003,t*t);
  float d=max(length(c.yz)-r-.0004*sin(c.x*300.),abs(c.x)-.1); d=max(d,-(c.x+.1)); return d; }
float sticksD(vec3 q){ float d=1e3; for(int i=0;i<5;i++){ vec3 s=q-vec3(.1+float(i)*.017,BT+.0055,-.045); s.xz=rot(.04*float(i-2))*s.xz;
    d=min(d,sdRBox(s,vec3(.0055,.0055,.05),.0012)); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=bdQ(p);
  r=U(r,boardD(q),3.);
  vec3 k=knQ(q);
  r=U(r,bladeD(k),4.);
  r=U(r,handleD(k),5.);
  r=U(r,carrotD(caQ(q)),6.);
  r=U(r,sticksD(q),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bdQ(p); return .6+.12*grain(q,45.); }
  if(id==4.){ vec3 k=knQ(bdQ(p)); float t=clamp(k.x/.17,0.,1.); float zc=-.012+.012*t*t; float w=.02*(1.-t*t)+.001;
    if(k.z-zc<-w+.003) return .6; return .96; }
  if(id==5.){ vec3 k=knQ(bdQ(p)); if(length(vec2(fract((k.x+.1)/.035)-.5,k.z/.035))<.12&&k.x<-.01) return .8; return .3; }
  if(id==6.){ vec3 c=caQ(bdQ(p)); if(c.x<-.097) return .8; return fract(c.x/.012)<.12?.4:.6; }
  if(id==7.) return .7;
  return .7; }
