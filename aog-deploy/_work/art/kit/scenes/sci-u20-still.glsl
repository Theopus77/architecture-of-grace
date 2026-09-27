/* Science Unit 20 "Physical Science: Forces, Energy and Waves" — pencil still life: a
   pendulum hanging from a stand, a bar magnet, and a compass. */
#define CAM_POS vec3(-0.7047,0.3324,-0.9363)
#define CAM_TGT vec3(-0.2786,0.0184,0.1853)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define SC vec3(.03,0.,.08)
vec2 pend(vec3 p){ vec3 q=p-SC; q.xz=rot(.3)*q.xz;
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.1,.008,.05),.004);
  float post=sdCylY(q-vec3(-.08,.15,0.),.006,.15);
  float arm=sdCylX(q-vec3(-.01,.29,0.),.005,.075);
  float clamp1=sdRBox(q-vec3(-.08,.29,0.),vec3(.012,.012,.012),.003);
  vec3 piv=vec3(.06,.285,0.); float a=.35; vec3 bob=piv+vec3(sin(a),-cos(a),0.)*.2;
  float str=sdCapsule(q,piv,bob,.0012);
  float b=length(q-bob)-.025;
  float hook=sdCapsule(q,bob+vec3(sin(a),-cos(a),0.)*-.025,bob+vec3(sin(a),-cos(a),0.)*-.032,.003);
  return vec2(min(min(base,post),min(arm,clamp1)),min(min(str,b),hook)); }
vec3 mq(vec3 p){ vec3 q=p-vec3(-.25,.013,.0); q.xz=rot(.4)*q.xz; return q; }
float magnet(vec3 p){ return sdRBox(mq(p),vec3(.08,.013,.02),.003); }
vec2 compass(vec3 p){ vec3 q=p-vec3(.32,0.,.0);
  float cs=sdCylY(q-vec3(0.,.01,0.),.045,.01)-.003; cs=max(cs,-sdCylY(q-vec3(0.,.02,0.),.038,.004));
  vec3 n=q-vec3(0.,.018,0.); n.xz=rot(.5)*n.xz;
  float nd=max(abs(n.z)-.006*(1.-abs(n.x)/.034),abs(n.x)-.034); nd=max(nd,abs(n.y)-.0015);
  float pin=sdCylY(n,.003,.003);
  return vec2(cs,min(nd,pin)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 d=pend(p); r=U(r,d.x,3.); r=U(r,d.y,4.);
  r=U(r,magnet(p),5.);
  vec2 c=compass(p); r=U(r,c.x,6.); r=U(r,c.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .45; if(id==4.) return .5;
  if(id==5.){ vec3 q=mq(p); if(abs(q.x)<.002) return .2; return q.x>0.?.3:.85; }
  if(id==6.){ vec3 q=p-vec3(.32,0.,.0); if(q.y>.012&&n.y>.8){ float a=atan(q.z,q.x); if(fract(a/6.2832*16.)<.12&&length(q.xz)>.03) return .3; return .92; } return .45; }
  if(id==7.){ vec3 q=p-vec3(.32,.018,0.); q.xz=rot(.5)*q.xz; return q.x>0.?.2:.8; }
  return .7; }
