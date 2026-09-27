/* fc4 "Hand Sewing" — a tomato pincushion stuck with round-headed pins, a wooden spool of
   thread with a threaded needle, and a pair of sewing scissors lying open. */
#define CAM_POS vec3(-0.2707,0.2244,-0.6230)
#define CAM_TGT vec3(-0.0527,-0.0082,0.0601)
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
#define PC vec3(-.03,0.,.1)
float cushion(vec3 p){ vec3 q=p-PC-vec3(0.,.05,0.); float a=atan(q.z,q.x);
  float d=sdEll(q,vec3(.075,.05,.075));
  d+=.004*pow(abs(sin(a*4.)),.3)*smoothstep(.0,.04,length(q.xz))-.002;
  return d*.8; }
float cap(vec3 p){ vec3 q=p-PC-vec3(0.,.1,0.); float a=atan(q.z,q.x); float r=.028+.012*pow(abs(cos(a*2.5)),3.);
  float d=max(length(q.xz)-r,abs(q.y)-.003)-.001;
  d=min(d,sdCapsule(q,vec3(0.),vec3(.002,.018,0.),.004));
  return d; }
float pins(vec3 p){ vec3 q=p-PC-vec3(0.,.05,0.); float d=1e5;
  for(int i=0;i<7;i++){ float fi=float(i); float a=fi*2.4+.3; float el=.35+.35*fract(fi*.618);
    vec3 dir=normalize(vec3(cos(a)*cos(el),sin(el)+.2,sin(a)*cos(el)));
    vec3 b=dir*vec3(.07,.048,.07)*.95; vec3 e=b+dir*.035;
    d=min(d,sdCapsule(q,b,e,.0011)); d=min(d,length(q-e)-.0055); }
  return d; }
#define SP vec3(.15,0.,.1)
float spool(vec3 p){ vec3 q=p-SP;
  float f1=sdCylY(q-vec3(0.,.005,0.),.03,.005)-.001, f2=sdCylY(q-vec3(0.,.075,0.),.03,.005)-.001;
  float core=sdCylY(q-vec3(0.,.04,0.),.014,.035);
  float d=min(min(f1,f2),core); d=max(d,-sdCylY(q,.005,.2)); return d; }
float thread(vec3 p){ vec3 q=p-SP; return sdCylY(q-vec3(0.,.04,0.),.024+.0006*sin(q.y*1800.),.029); }
vec3 nQ(vec3 p){ vec3 q=p-vec3(.08,.002,-.05); q.xz=rot(-.2)*q.xz; return q; }
float needle(vec3 p){ vec3 q=nQ(p);
  float t=clamp((q.x+.04)/.08,0.,1.);
  float n=sdCapsule(q,vec3(-.04,0.,0.),vec3(.04,0.,0.),.0016*(1.-t*.8));
  float eye=sdTorus((q-vec3(-.036,0.,0.)).xzy*vec3(1.,1.,1.),.0025,.0008);
  /* the thread runs from the eye back to the spool in a loose curve */
  vec3 w=q-vec3(-.036,0.,0.); float s=w.x; float c=.02*sin(clamp(-s/.1,0.,1.)*3.1);
  float th=max(length(vec2(w.y-.0005,w.z-c-s*.8*0.))-.0009,max(s,-s-.1));
  return min(min(n,eye),th); }
vec3 scQ(vec3 p){ vec3 q=p-vec3(.2,.005,-.07); q.xz=rot(-.3)*q.xz; return q/1.4; }
float scissors(vec3 p){ vec3 q=scQ(p); float d=1e5;
  for(int s=0;s<2;s++){ float sg=s==0?1.:-1.; vec3 k=q; k.xz=rot(sg*.3)*k.xz; k.y-=float(s)*.004;
    vec3 b=k-vec3(.045,0.,0.); float w=.008*(1.-clamp(b.x/.05,0.,1.))+.0012;
    float blade=max(max(abs(b.z-sg*.0)-w,abs(b.y)-.0016),abs(b.x)-.048);
    float ring=sdTorus((k-vec3(-.034,0.,sg*.004)).xyz,.012,.0032);
    float arm=sdCapsule(k,vec3(0.,0.,0.),vec3(-.022,0.,sg*.01),.003);
    d=min(d,min(blade,min(ring,arm))); }
  d=min(d,sdCylY(q,.003,.004));
  return d*1.4; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cushion(p),3.);
  r=U(r,cap(p),4.);
  r=U(r,pins(p),5.);
  r=U(r,spool(p),6.);
  r=U(r,thread(p),7.);
  r=U(r,needle(p),8.);
  r=U(r,scissors(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PC; float a=atan(q.z,q.x); return fract(a*4./3.1416+.5)<.06?.4:.62; }
  if(id==4.) return .4;
  if(id==5.){ vec3 q=p-PC-vec3(0.,.05,0.); return length(q)>.09?.35:.75; }
  if(id==6.) return .7+.1*grain(p-SP,50.);
  if(id==7.) return fract((p.y-SP.y)/.0035)<.3?.35:.55;
  if(id==8.) return .45;
  if(id==9.) return .5;
  return .7; }
