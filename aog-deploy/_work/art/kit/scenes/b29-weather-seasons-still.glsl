/* Practice room "Weather and Seasons" — pencil still life: a rain gauge with a little water in
   it, a closed umbrella lying behind, a glass thermometer and a fallen maple leaf in front. */
#define CAM_POS vec3(-0.3460,0.4314,-0.8685)
#define CAM_TGT vec3(-0.2007,-0.0363,0.1062)
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
#define GAU vec3(0.,0.,.0)
#define UMB vec3(.2,.03,-.07)
#define THR vec3(-.12,.008,-.1)
#define LEAF vec3(-.15,.004,.02)
float gaugeD(vec3 q){ float d=sdCylY(q-vec3(0.,.1,0.),.032,.1)-.002;
  d=max(d,-sdCylY(q-vec3(0.,.12,0.),.027,.1));
  d=min(d,sdCone(q-vec3(0.,.212,0.),.034,.05,.012)); d=max(d,-sdCone(q-vec3(0.,.215,0.),.028,.046,.012));
  d=min(d,cylS(q,.05,.014,.004));
  return d; }
vec3 umbQ(vec3 p){ vec3 q=p-UMB; q.xz=rot(.35)*q.xz; return q; }
float umbD(vec3 q){
  float t=clamp((q.x+.12)/.24,0.,1.);
  float r=mix(.006,.03,smoothstep(0.,.35,t))*mix(1.,.2,smoothstep(.35,1.,t));
  float a=atan(q.z,q.y); r*=1.+.12*abs(sin(a*4.));
  float can=max(length(q.yz)-r,abs(q.x)-.12)*.8;
  float shaft=sdCapsule(q,vec3(-.2,0.,0.),vec3(.16,0.,0.),.004);
  vec3 h=q-vec3(-.2,.0,-.028); float hook=max(abs(length(h.xz)-.028)-.0055,h.x);
  hook=max(length(vec2(length(h.xz)-.028,h.y))-.0065,h.x);
  return min(min(can,shaft),hook); }
vec3 thQ(vec3 p){ vec3 q=p-THR; q.xz=rot(-.25)*q.xz; return q; }
float thD(vec3 q){ return min(sdCapsule(q,vec3(-.06,0.,0.),vec3(.08,0.,0.),.006),length(q-vec3(-.066,0.,0.))-.009); }
float leafM(vec3 p){ vec3 q=p-LEAF; q.xz=rot(.6)*q.xz; float a=atan(q.x,q.z); float rr=length(q.xz);
  /* five pointed lobes of a maple leaf, the stem notch toward -z */
  float lob=pow(abs(cos(a*2.5)),4.); float R=.068*(.45+.55*lob)*(1.-.35*smoothstep(1.9,2.8,abs(a)));
  R+=.004*abs(sin(a*15.));
  float y=q.y-rr*rr*4.;
  float d=max(rr-R,abs(y)-.0012)*.6;
  d=min(d,sdCapsule(q,vec3(0.,.001,0.),vec3(0.,.002,-.06),.0017));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,gaugeD(p-GAU),3.);
  r=U(r,umbD(umbQ(p)),4.);
  r=U(r,thD(thQ(p)),5.);
  r=U(r,leafM(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-GAU; if(q.y<.014) return .55;
    if(q.y<.065) return q.y>.058?.25:.62;                         /* rain water */
    float an=atan(q.x,-q.z); if(q.y>.07&&q.y<.19&&an>-.55&&an<-.05&&fract(q.y/.02)<.1) return .3; if(q.y>.07&&q.y<.19&&an>-.55&&an<-.3&&fract(q.y/.01)<.12) return .4; return .9; }
  if(id==4.){ vec3 q=umbQ(p); if(q.x<-.13) return .3; if(q.x>.12) return .5; float a=atan(q.z,q.y); return abs(sin(a*4.))<.15?.25:.4; }
  if(id==5.){ vec3 q=thQ(p); if(q.x<-.052) return .3; if(abs(q.z)<.002&&q.x<.02&&q.y<.0) return .3;
    if(fract(q.x/.01)<.15&&q.z<-.003) return .35; return .92; }
  if(id==6.){ vec3 q=p-LEAF; q.xz=rot(.6)*q.xz; float a=atan(q.z,q.x); float v=abs(sin(a*2.5+.0)); 
    float an=atan(q.x,q.z); if(abs(fract(an*2.5/PI+.5)-.5)<.03*.05/max(length(q.xz),.005)) return .3; return .55; }
  return .7; }
