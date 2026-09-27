/* Economics Unit 16 "The Business Cycle and Fiscal Policy" — pencil still life: a wooden
   marble track shaped in rising and falling waves with a ball on it (the ups and downs of
   the economy), and a small cloth money bag. */
#define CAM_POS vec3(-0.2986,0.1819,-0.6469)
#define CAM_TGT vec3(-0.2023,0.0128,0.0775)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define TC vec3(.08,0.,.16)
vec3 tq(vec3 p){ vec3 q=p-TC; q.xz=rot(-.25)*q.xz; return q; }
float wave(float x){ return .1+.05*sin(x*22.+.6); }
vec2 track(vec3 p){
  vec3 q=tq(p);
  float y=wave(q.x); float dy=.05*22.*cos(q.x*22.+.6);
  float d=(q.y-y)/sqrt(1.+dy*dy);
  float rail=max(max(abs(d)-.006,abs(q.z)-.025),abs(q.x)-.2);
  rail=max(rail,-max(max(abs(d-.006)-.004,abs(q.z)-.015),abs(q.x)-.21));
  float posts=1e5; for(int i=0;i<5;i++){ float x=-.18+float(i)*.09; posts=min(posts,sdRBox(q-vec3(x,wave(x)*.5,0.),vec3(.006,wave(x)*.5,.006),.002)); }
  float base=sdRBox(q-vec3(0.,.005,0.),vec3(.21,.005,.04),.003);
  float bx=.02; float ball=length(q-vec3(bx,wave(bx)+.022,0.))-.018;
  return vec2(min(min(rail,posts),base)*.8,ball); }
vec3 mq(vec3 p){ return p-vec3(-.2,0.,.0); }
float bag(vec3 p){
  vec3 q=mq(p);
  float b=length((q-vec3(0.,.045,0.))*vec3(1.,1.1,1.))-.048;
  float neck=sdCone(q-vec3(0.,.095,0.),.014,.022,.012);
  float tie=sdTorus(q-vec3(0.,.088,0.),.015,.003);
  return min(min(b*.9,neck),tie); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 t=track(p); r=U(r,t.x,3.); r=U(r,t.y,4.);
  r=U(r,bag(p),5.);
  r=U(r,coinD(p-vec3(-.13,.003,-.06),.022,.003),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .6+.1*grain(tq(p).zxy,40.);
  if(id==4.) return .35;
  if(id==5.){ vec3 q=mq(p); if(abs(q.z+.047)<.01&&length(q.xy-vec2(0.,.045))<.02) return .3; return .7; }
  if(id==6.) return .6;
  return .7; }
