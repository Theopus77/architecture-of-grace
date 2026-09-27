/* Medicine Unit 17 "The Future of Medicine" — pencil still life: a thin tablet on a small
   stand showing a heartbeat line, and a stethoscope coiled on the table in front of it. */
#define CAM_POS vec3(-0.3918,0.1820,-0.8230)
#define CAM_TGT vec3(-0.1881,-0.0031,0.0932)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define TC vec3(.0,0.,.1)
vec3 tq(vec3 p){ vec3 q=p-TC; q.xz=rot(-.2)*q.xz; q.yz=rot(.3)*q.yz; return q; }
float tablet(vec3 p){ vec3 q=tq(p)-vec3(0.,.12,0.); return sdRBox(q,vec3(.16,.11,.006),.01); }
float standD(vec3 p){ vec3 q=p-TC; q.xz=rot(-.2)*q.xz;
  float foot=sdRBox(q-vec3(0.,.006,-.03),vec3(.13,.006,.04),.004);
  vec3 b=q-vec3(0.,.06,.07); b.yz=rot(.5)*b.yz; float back=sdRBox(b,vec3(.05,.065,.005),.003);
  float lip=sdRBox(q-vec3(0.,.02,-.055),vec3(.13,.015,.006),.003);
  return min(min(foot,back),lip); }
float tube(vec3 p){ vec3 q=p-vec3(.08,.009,-.12); float r=length(q.xz);
  float a=atan(q.z,q.x); float R=.1+.02*sin(a*1.)+.01*sin(a*3.);
  float ring=length(vec2(r-R,q.y))-.0065;
  return ring; }
float headD(vec3 p){ vec3 q=p-vec3(-.05,0.,-.2);
  float bell=sdCylY(q-vec3(0.,.012,0.),.03,.01)-.004;
  float dia=sdCylY(q-vec3(0.,.025,0.),.026,.002);
  float stem=sdCapsule(q,vec3(.02,.015,.01),vec3(.045,.012,.035),.005);
  return min(min(bell,dia),stem); }
float ears(vec3 p){ vec3 q=p-vec3(.24,.008,-.06);
  float a=sdCapsule(q,vec3(0.),vec3(.04,.0,.09),.0035); float b=sdCapsule(q,vec3(0.),vec3(-.03,.0,.1),.0035);
  float t1=length(q-vec3(.04,.0,.09))-.008; float t2=length(q-vec3(-.03,.0,.1))-.008;
  return min(min(a,b),min(t1,t2)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,tablet(p),3.);
  r=U(r,standD(p),4.);
  r=U(r,tube(p),5.);
  r=U(r,headD(p),6.);
  r=U(r,ears(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=tq(p)-vec3(0.,.12,0.); if(q.z>-.004) return .35;
    vec2 u=q.xy; if(abs(u.x)>.145||abs(u.y)>.095) return .2;   /* bezel */
    float x=u.x*40.; float y=.0; float k=fract((u.x+.2)/.1);
    y=.03*exp(-pow((k-.5)*14.,2.))-.012*exp(-pow((k-.56)*20.,2.));
    if(abs(u.y-.01-y)<.003) return .1;
    if(u.y<-.05&&u.y>-.08&&abs(u.x)<.12&&fract(u.x/.08)<.6&&fract(u.y/.012)<.3) return .55;
    return .72; }
  if(id==4.) return .45;
  if(id==5.) return .3;
  if(id==6.) return .7;
  if(id==7.) return .6;
  return .7; }
