/* s24 "Economics" — a small slanted chalk board with two crossing curves drawn on it (supply
   and demand), and in front two round loaves of bread on a wooden bread board. */
#define CAM_POS vec3(-0.3885,0.2579,-0.6622)
#define CAM_TGT vec3(-0.1473,0.0008,0.0932)
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
#define SA 1.05
vec3 sK(vec3 p){ vec3 k=p-vec3(-.02,0.,.1); k.xz=rot(-.25)*k.xz; return k; }
vec3 sQ(vec3 p){ vec3 k=sK(p); vec3 v=vec3(0.,sin(SA),cos(SA)), n=vec3(0.,cos(SA),-sin(SA));
  return vec3(k.x,dot(k,n),dot(k,v)-.1); }
float board(vec3 p){ vec3 q=sQ(p); float d=sdRBox(q-vec3(0.,-.006,0.),vec3(.12,.006,.1),.003);
  float fr=max(sdRBox(q-vec3(0.,-.002,0.),vec3(.125,.008,.105),.003),-sdBox(q-vec3(0.,.0,0.),vec3(.112,.02,.092)));
  vec3 k=sK(p); float leg=sdRBox(k-vec3(0.,.085,.2*cos(SA)+.012),vec3(.1,.085,.005),.002);
  return max(min(min(d,fr),leg),-p.y); }
vec3 bbQ(vec3 p){ vec3 q=p-vec3(.12,0.,-.06); q.xz=rot(.2)*q.xz; return q; }
float bboard(vec3 p){ vec3 q=bbQ(p); float d=sdRBox(q-vec3(0.,.008,0.),vec3(.1,.008,.065),.006);
  float h=sdRBox(q-vec3(.12,.008,0.),vec3(.025,.007,.012),.006); d=smin(d,h,.01);
  d=max(d,-sdCylY(q-vec3(.135,.008,0.),.005,.02)); return d; }
float loaves(vec3 p){ vec3 q=bbQ(p); float d=1e5;
  vec3 a=q-vec3(-.04,.035,.0); d=min(d,sdEll(a,vec3(.05,.03,.045)));
  vec3 b=q-vec3(.045,.03,-.01); b.xz=rot(.6)*b.xz; d=min(d,sdEll(b,vec3(.045,.026,.038)));
  d=max(d,-(q.y-.016));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,bboard(p),4.);
  r=U(r,loaves(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sQ(p); if(abs(q.x)>.112||abs(q.z)>.092||q.y<-.001) return .45+.1*grain(q.zyx,40.);
    float a=.32; vec2 u=vec2(q.x,q.z);
    if(abs(u.x+.09)<.0014&&u.y>-.075&&u.y<.075) a=.9;
    if(abs(u.y+.075)<.0014&&u.x>-.09&&u.x<.095) a=.9;
    float t=u.x+.08; float g=1./sqrt(1.+pow(.5+4.*t,2.)), h=1./sqrt(1.+pow(-1.2+6.*t,2.));
    float sy=-.065+.5*t+2.*t*t; if(abs(u.y-sy)*g<.0022&&t>0.&&t<.17) a=.95;             /* rising curve */
    float dy=.07-1.2*t+3.*t*t; if(abs(u.y-dy)*h<.0022&&t>0.&&t<.17) a=.95;             /* falling curve */
    if(length(u-vec2(.0035,-.0093))<.006) a=.97;
    return a; }
  if(id==4.) return .55+.12*grain(bbQ(p),40.);
  if(id==5.){ vec3 q=bbQ(p); vec3 a=q-vec3(-.04,.035,.0); if(abs(a.x+a.z*.3)<.0025&&a.y>.018) return .3;
    vec3 b=q-vec3(.045,.03,-.01); b.xz=rot(.6)*b.xz; if(abs(b.z)<.0025&&b.y>.015) return .3;
    return .6; }
  return .7; }
