/* Science Unit 9 "Earth, Weather and Space" — pencil still life: a telescope on its tripod
   pointing up at the sky, beside a split rock that shows its layers and a small moon globe. */
#define CAM_POS vec3(-0.7523,0.3767,-1.0142)
#define CAM_TGT vec3(-0.2924,0.0379,0.1960)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define TC vec3(.02,0.,.08)
vec3 tq(vec3 p){ vec3 q=p-TC-vec3(0.,.22,0.); q.xz=rot(.5)*q.xz; q.xy=rot(.5)*q.xy; return q; }
vec2 scope(vec3 p){ vec3 q=p-TC;
  float legs=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.094+.3; vec3 f=vec3(cos(a)*.1,0.,sin(a)*.1);
    legs=min(legs,sdCapsule(q,f,vec3(0.,.2,0.),.005)); }
  legs=min(legs,sdCylY(q-vec3(0.,.205,0.),.014,.012));
  vec3 t=tq(p);
  float tube=sdCylX(t,.028,.14)-.001;
  float dew=sdCylX(t-vec3(.16,0.,0.),.034,.03); dew=max(dew,-sdCylX(t-vec3(.17,0.,0.),.029,.04));
  float eye=sdCylX(t-vec3(-.16,0.,0.),.01,.025);
  float bands=min(sdCylX(t-vec3(.04,0.,0.),.031,.006),sdCylX(t-vec3(-.06,0.,0.),.031,.006));
  float finder=sdCylX(t-vec3(.0,.042,0.),.008,.05); finder=min(finder,sdRBox(t-vec3(.0,.032,0.),vec3(.004,.008,.003),.001));
  return vec2(legs,min(min(tube,dew),min(min(eye,bands),finder))); }
#define RK vec3(-.24,0.,.02)
float rock(vec3 p){ vec3 q=p-RK; q.xz=rot(.4)*q.xz;
  float d=sdEll(q-vec3(0.,.035,0.),vec3(.08,.05,.06));
  d=max(d,q.z-.0); d=max(d,-q.y);
  d+=.006*fbm3(q*25.);
  return d; }
#define MC vec3(.31,0.,.02)
vec2 moon(vec3 p){ vec3 q=p-MC;
  float st=min(sdCylY(q-vec3(0.,.006,0.),.04,.006)-.002,sdCylY(q-vec3(0.,.03,0.),.006,.03));
  float b=length(q-vec3(0.,.1,0.))-.055;
  return vec2(st,b); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 s=scope(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  r=U(r,rock(p),5.);
  vec2 m=moon(p); r=U(r,m.x,6.); r=U(r,m.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 t=tq(p); if(t.x<-.13) return .25; if(abs(t.x-.04)<.006||abs(t.x+.06)<.006) return .3; return .8; }
  if(id==5.){ vec3 q=p-RK; float b=fract((q.y+.01*fbm(q.xz*20.))/.016); return b<.25?.3:b<.6?.6:.45; }
  if(id==6.) return .4;
  if(id==7.){ vec3 d=normalize(p-MC-vec3(0.,.1,0.)); float c=1.;
    for(int i=0;i<7;i++){ vec3 k=normalize(vec3(sin(float(i)*2.3),cos(float(i)*1.7),sin(float(i)*3.1+1.))); float a=acos(clamp(dot(d,k),-1.,1.)); float R=.12+.1*fract(float(i)*.37);
      if(abs(a-R)<.02) c=min(c,.35); else if(a<R) c=min(c,.62); }
    return c<1.?c:.8; }
  return .7; }
