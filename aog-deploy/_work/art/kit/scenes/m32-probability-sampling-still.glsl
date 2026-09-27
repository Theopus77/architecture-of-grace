/* m32 "Probability and Sampling" — a spinner board in four equal parts with its arrow, a pair
   of dice, and a coin standing on its edge. */
#define CAM_POS vec3(-0.2274,0.2135,-0.3637)
#define CAM_TGT vec3(-0.1036,-0.0094,0.0522)
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
#define SP vec3(-.04,0.,.08)
vec3 spQ(vec3 p){ vec3 q=p-SP; q.yz=rot(-.0)*q.yz; return q; }
float spinner(vec3 p){ vec3 q=p-SP; return sdCylY(q-vec3(0.,.006,0.),.1,.006)-.002; }
float arrow(vec3 p){ vec3 q=p-SP-vec3(0.,.016,0.); q.xz=rot(.7)*q.xz;
  float shaft=sdRBox(q-vec3(.025,0.,0.),vec3(.05,.002,.004),.001);
  vec2 t=q.xz-vec2(.075,0.); float head=max(max(abs(t.y)*1.6+t.x-.02,-t.x),abs(q.y)-.002);
  float pin=sdCylY(q-vec3(0.,.003,0.),.006,.004)-.001;
  return min(min(shaft,head),pin); }
#define DS .022
float pip(vec3 c,vec2 u){ return length(u)-.0045; }
float die(vec3 p,vec3 c,float ry,float rx){ vec3 q=p-c; q.xz=rot(ry)*q.xz; q.xy=rot(rx)*q.xy;
  float d=sdRBox(q,vec3(DS),.005);
  if(d>.01) return d;
  /* top 5, front 3 (toward -z), right 2 (+x) */
  vec2 t=q.xz; float pp=1e5; pp=min(pp,length(t)); for(int i=0;i<4;i++){ vec2 o=vec2(i<2?-1.:1.,mod(float(i),2.)<1.?-1.:1.)*.011; pp=min(pp,length(t-o)); }
  d=max(d,-(max(pp-.0045,-(q.y-DS+.002))));
  vec2 f=q.xy; float pf=min(length(f),min(length(f-vec2(.011,.011)),length(f+vec2(.011,.011))));
  d=max(d,-(max(pf-.0045,(q.z+DS-.002))));
  vec2 s=q.zy; float ps=min(length(s-vec2(.011,.011)),length(s+vec2(.011,.011)));
  d=max(d,-(max(ps-.0045,-(q.x-DS+.002))));
  return d; }
float coin(vec3 p){ vec3 q=place(p,vec3(.2,.022,.12),-.5); return min(sdCylZ(q,.022,.0022)-.0006,sdTorus(q.xzy,.021,.0012)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,spinner(p),3.);
  r=U(r,arrow(p),4.);
  r=U(r,die(p,vec3(.13,DS,-.02),.4,0.),5.);
  r=U(r,die(p,vec3(.19,DS,.04),-.3,0.),6.);
  r=U(r,coin(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-SP; if(n.y<.5) return .5; float r=length(q.xz); float a=atan(q.z,q.x);
    if(r>.094) return .4; if(abs(q.x)<.0015||abs(q.z)<.0015) return .25;
    int k=int(floor((a+3.1416)/1.5708)); return k==0?.55:k==1?.85:k==2?.7:.92; }
  if(id==4.) return .3;
  if(id==5.||id==6.) return .9;
  if(id==7.){ vec3 q=place(p,vec3(.2,.022,.12),-.5); float r=length(q.xy); if(abs(q.z)>.0015){ if(abs(r-.017)<.001) return .4; if(r<.009) return .5; } return .6; }
  return .7; }
