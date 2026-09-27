/* b4 "Reproduction and Growth" — a bird's nest holding three speckled eggs, a tulip in a
   slim bud vase, and an open bean pod with its beans. */
#define CAM_POS vec3(-0.4527,0.3110,-0.7474)
#define CAM_TGT vec3(-0.1793,0.0192,0.1098)
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
#define NS vec3(.02,0.,-.01)
float nest(vec3 p){ vec3 q=p-NS; float a=atan(q.z,q.x);
  float t=sdTorus(q-vec3(0.,.022,0.),.064,.022);
  t=smin(t,sdCylY(q-vec3(0.,.012,0.),.06,.01),.01);
  t=max(t,-(length(q-vec3(0.,.07,0.))-.058));
  float tw=fbm(vec2(a*14.,q.y*120.))+.5*sin(a*40.+q.y*300.)*.3;
  return (t-.006*tw)*.8; }
float eggs(vec3 p){ vec3 q=p-NS; float d=1e5;
  for(int i=0;i<3;i++){ float a=float(i)*2.1+.4; vec3 c=vec3(cos(a)*.026,.052,sin(a)*.024);
    vec3 k=q-c; k.xz=rot(a)*k.xz; k.xy=rot(1.2)*k.xy;
    d=min(d,sdEll(k*vec3(1.,1.,1.)-vec3(0.,0.,0.),vec3(.021,.029,.021)-vec3(0.,.003*step(0.,k.y),0.))); }
  return d; }
#define VS vec3(-.1,0.,.14)
float vase(vec3 p){ vec3 q=p-VS; float y=q.y;
  float r=.022+.018*exp(-pow((y-.035)/.03,2.))-.01*smoothstep(.07,.11,y)+.004*smoothstep(.12,.13,y);
  float d=max(length(q.xz)-r,abs(y-.065)-.065); d=max(d,-(length(q.xz)-.006)-0.+min(0.,-(y-.12)));
  return d*.8; }
float tulip(vec3 p){ vec3 q=p-VS;
  float st=sdCapsule(q,vec3(0.,.1,0.),vec3(.01,.18,0.),.0028);
  vec3 b=q-vec3(.012,.205,0.);
  float cup=sdEll(b,vec3(.026,.036,.026)); cup=max(cup,b.y-.02-.006*cos(atan(b.z,b.x)*3.));
  cup=max(cup,-sdEll(b-vec3(0.,.012,0.),vec3(.022,.032,.022)));
  vec3 l=q-vec3(-.02,.14,.0); l.xy=rot(.5)*l.xy; float lf=sdEll(l,vec3(.005,.05,.014));
  return min(st,min(cup,lf)); }
vec3 bpQ(vec3 p){ vec3 q=p-vec3(.15,.008,-.1); q.xz=rot(.25)*q.xz; return q; }
float pod(vec3 p){ vec3 q=bpQ(p);
  float x=q.x; float c=.012*x*x*20.; vec3 k=vec3(x,q.y-c*0.,q.z-c);
  float sh=sdEll(k,vec3(.085,.014,.022)); sh=max(abs(sh)-.0018,k.y-.002);
  return sh; }
float beans(vec3 p){ vec3 q=bpQ(p); float d=1e5;
  for(int i=0;i<4;i++){ float x=(float(i)-1.5)*.03; float c=.012*x*x*20.;
    d=min(d,sdEll(q-vec3(x,.002,c),vec3(.013,.009,.01))); }
  d=min(d,sdEll(q-vec3(.03,.001,-.045),vec3(.013,.008,.01)));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,nest(p),3.);
  r=U(r,eggs(p),4.);
  r=U(r,vase(p),5.);
  r=U(r,tulip(p),6.);
  r=U(r,pod(p),7.);
  r=U(r,beans(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-NS; float a=atan(q.z,q.x); float f=fract(a*9.+q.y*90.+fbm(q.xz*90.)*1.5); float g=fract(-a*6.+q.y*70.+fbm(q.xz*70.+3.)); return min(f,g)<.12?.3:.66; }
  if(id==4.){ return vn3(p*900.)>.82?.45:.9; }
  if(id==5.) return .62;
  if(id==6.) return .55;
  if(id==7.) return .55;
  if(id==8.) return .75;
  return .7; }
