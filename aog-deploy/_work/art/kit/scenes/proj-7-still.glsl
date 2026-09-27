/* FACS project 7 "Sew a small felt pouch" — pencil still life: a finished felt pouch lying on
   the table, its rounded flap folded over and held shut by an elastic loop round a button, pale
   stitches down both sides, with a spool of floss behind and two pins in front. */
#define CAM_POS vec3(-0.3204,0.4169,-0.5523)
#define CAM_TGT vec3(-0.1404,0.0027,0.1174)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define PC vec3(-.01,0.,.02)
#define PR .18
#define SP vec3(.19,0.,.12)
vec3 pL(vec3 p){ vec3 q=p-PC; q.xz=rot(PR)*q.xz; return q; }
/* pouch-local: x across (width .12), z from bottom fold (-) to top (+), y up */
float body(vec3 p){ vec3 q=pL(p);
  float t=clamp(1.-pow(max(abs(q.x)/.064,abs(q.z)/.058),6.),0.,1.);
  float d=sdRBox(q-vec3(0.,.008,0.),vec3(.064,.008,.058),.006);
  d-=.009*t*step(0.,q.y);
  return d*.8; }
float flapTop(vec3 q){ return .016+.009*clamp(1.-pow(max(abs(q.x)/.064,abs(q.z)/.058),6.),0.,1.)+.002; }
float flap(vec3 p){ vec3 q=pL(p);
  float shape=max(abs(q.x)-.066,q.z-.06);
  shape=max(shape,length(vec2(q.x,max(-q.z+.0,0.))*vec2(1.,1.5))-.066);
  shape=max(shape,-(q.z+.03)-.0);
  vec2 cz=vec2(q.x,q.z+.0); float round=length(vec2(q.x,(min(q.z,0.))*1.9))-.066;
  shape=max(max(abs(q.x)-.066,q.z-.061),round);
  return max(shape,abs(q.y-flapTop(q))-.0022)*.8; }
float button(vec3 p){ vec3 q=pL(p)-vec3(0.,0.,-.022); float y0=flapTop(q)+.002;
  vec3 b=q-vec3(0.,y0+.003,0.);
  float d=sdCylY(b,.013,.003)-.0012;
  vec2 u=abs(b.xz)-vec2(.0035); d=max(d,-(length(u)-.0015));
  return d; }
float loop(vec3 p){ vec3 q=pL(p)-vec3(0.,0.,-.03); float y0=flapTop(q)+.002;
  vec3 b=q-vec3(0.,y0+.0025,-.0); b.z*=.7;
  float d=max(sdTorus(b,.0155,.0018),-b.z-.001);
  d=min(d,sdCapsule(q,vec3(-.0155,y0+.002,.0),vec3(-.008,y0,.02),.0018));
  d=min(d,sdCapsule(q,vec3(.0155,y0+.002,.0),vec3(.008,y0,.02),.0018));
  return d; }
float spool(vec3 p){ vec3 q=p-SP;
  float f1=sdCylY(q-vec3(0.,.005,0.),.035,.005)-.002, f2=sdCylY(q-vec3(0.,.075,0.),.035,.005)-.002;
  float core=sdCylY(q-vec3(0.,.04,0.),.026,.034)+.0008*abs(sin(q.y*700.));
  return min(min(f1,f2),core); }
float pin(vec3 p,vec3 a,float ang){ vec3 q=p-a; q.xz=rot(ang)*q.xz;
  float d=sdCapsule(q,vec3(-.025,0.,0.),vec3(.02,0.,0.),.0008);
  return min(d,length(q-vec3(-.027,.0015,0.))-.0035); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,body(p),3.);
  r=U(r,flap(p),4.);
  r=U(r,button(p),5.);
  r=U(r,loop(p),6.);
  r=U(r,spool(p),7.);
  r=U(r,min(pin(p,vec3(.12,.0035,-.08),.4),pin(p,vec3(.15,.0035,-.05),-.3)),8.);
  return r; }
float stitch(vec3 q){ float e=abs(abs(q.x)-.056); return step(.5,fract(q.z/.011))*smoothstep(.0022,.001,e); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pL(p); return stitch(q)>.5&&q.y>.012?.97:.55; }
  if(id==4.){ vec3 q=pL(p); float e=length(vec2(q.x,min(q.z,0.)*1.9)); float edge=max(abs(q.x)-.066,e-.066);
    return (abs(edge+.008)<.0014&&fract(atan(q.z,q.x)*8.)<.5)?.97:.5; }
  if(id==5.) return .82;
  if(id==6.) return .25;
  if(id==7.){ vec3 q=p-SP; return (q.y>.012&&q.y<.068)?.4+.1*sin(q.y*700.):.72; }
  if(id==8.) return .4;
  return .7; }
