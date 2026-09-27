/* b36 "Forces, Energy, Waves" — a Newton's cradle with its end ball pulled back, and a
   tuning fork lying beside its rubber mallet. */
#define CAM_POS vec3(-0.4770,0.2899,-0.7558)
#define CAM_TGT vec3(-0.2012,-0.0044,0.1086)
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
#define NC vec3(-.02,0.,.1)
#define NR .07
vec3 ncQ(vec3 p){ return place(p,NC,-.12); }
float frame(vec3 p){ vec3 q=ncQ(p);
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.17,.012,.07),.004);
  float d=base; float H=.2;
  for(int s=0;s<2;s++){ float z=s==0?-.05:.05;
    d=min(d,sdCapsule(q,vec3(-.15,.024,z),vec3(-.15,H,z),.0035));
    d=min(d,sdCapsule(q,vec3(.15,.024,z),vec3(.15,H,z),.0035));
    d=min(d,sdCapsule(q,vec3(-.15,H,z),vec3(.15,H,z),.0035)); }
  return d; }
vec3 ballC(int i){ float x=(float(i)-2.)*.041; float ang=i==0?.45:0.;
  return vec3(x-sin(ang)*NR*1.,.2-cos(ang)*NR*1.,0.); }
float balls(vec3 p){ vec3 q=ncQ(p); float d=1e5;
  for(int i=0;i<5;i++){ vec3 c=ballC(i); d=min(d,length(q-c)-.0202);
    vec3 top=c+normalize(vec3(0.,.2,0.)-vec3(0.,c.y,0.))*0.; }
  return d; }
float strings(vec3 p){ vec3 q=ncQ(p); float d=1e5;
  for(int i=0;i<5;i++){ vec3 c=ballC(i); float x=(float(i)-2.)*.041;
    d=min(d,sdCapsule(q,c+vec3(0.,.02,0.),vec3(x,.2,-.05),.0008));
    d=min(d,sdCapsule(q,c+vec3(0.,.02,0.),vec3(x,.2,.05),.0008)); }
  return d; }
vec3 tfQ(vec3 p){ vec3 q=p-vec3(.13,.006,-.14); q.xz=rot(.35)*q.xz; return q; }
float fork(vec3 p){ vec3 q=tfQ(p);
  float stem=sdCapsule(q,vec3(-.1,0.,0.),vec3(-.035,0.,0.),.005);
  float ball=length(q-vec3(-.1,0.,0.))-.007;
  vec2 u=q.xz-vec2(-.03,0.); float bend=abs(length(u-vec2(0.,0.))-.012);
  float yoke=max(length(vec2(bend,q.y))-.004,u.x);
  float t1=sdRBox(q-vec3(.04,0.,.012),vec3(.07,.004,.003),.0015);
  float t2=sdRBox(q-vec3(.04,0.,-.012),vec3(.07,.004,.003),.0015);
  return min(min(stem,ball),min(yoke,min(t1,t2))); }
vec3 mlQ(vec3 p){ vec3 q=p-vec3(.2,.011,-.05); q.xz=rot(-.5)*q.xz; return q; }
float mallet(vec3 p){ vec3 q=mlQ(p);
  float h=sdCapsule(q,vec3(-.08,-.004,0.),vec3(.03,-.004,0.),.004);
  float head=length(q-vec3(.045,0.,0.))-.016;
  return min(h,head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,frame(p),3.);
  r=U(r,balls(p),4.);
  r=U(r,strings(p),5.);
  r=U(r,fork(p),6.);
  r=U(r,mallet(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ncQ(p); return q.y<.026?.35+.12*grain(q,40.):.55; }
  if(id==4.) return .7;
  if(id==5.) return .3;
  if(id==6.) return .7;
  if(id==7.){ vec3 q=mlQ(p); return q.x>.03?.4:.62; }
  return .7; }
