/* Economics Unit 8 "Markets in Action" — pencil still life: an old cash register with
   round keys and an open drawer, and a shopping basket holding a loaf, a bottle and apples. */
#define CAM_POS vec3(-0.4005,0.2194,-0.7552)
#define CAM_TGT vec3(-0.2881,0.0218,0.0910)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define RC vec3(.1,0.,.16)
vec3 rq(vec3 p){ vec3 q=p-RC; q.xz=rot(-.3)*q.xz; return q; }
vec2 reg(vec3 p){
  vec3 q=rq(p);
  float base=sdRBox(q-vec3(0.,.04,0.),vec3(.1,.04,.08),.005);
  vec3 k=q-vec3(0.,.1,-.01); k.yz=rot(.6)*k.yz;
  float keyb=sdRBox(k,vec3(.085,.03,.05),.004);
  float top=sdRBox(q-vec3(0.,.15,.045),vec3(.07,.04,.03),.005);
  float disp=sdRBox(q-vec3(0.,.205,.045),vec3(.045,.015,.012),.003);
  float drawer=sdRBox(q-vec3(0.,.02,-.1),vec3(.09,.018,.03),.002);
  drawer=max(drawer,-sdBox(q-vec3(0.,.03,-.1),vec3(.082,.02,.024)));
  float keys=1e5;
  for(int i=0;i<5;i++) for(int j=0;j<3;j++){ vec3 c=k-vec3(-.06+float(i)*.03,.034,-.03+float(j)*.03); keys=min(keys,sdCylY(c,.009,.005)-.001); }
  float crank=sdCylX(q-vec3(.105,.08,0.),.02,.006);
  return vec2(min(min(base,keyb),min(min(top,disp),min(drawer,crank))),keys); }
vec3 kq(vec3 p){ vec3 q=p-vec3(-.19,0.,.0); q.xz=rot(.4)*q.xz; return q; }
vec2 basket(vec3 p){
  vec3 q=kq(p);
  float b=sdRBox(q-vec3(0.,.04,0.),vec3(.08,.04,.055),.008);
  b=max(b,-sdRBox(q-vec3(0.,.06,0.),vec3(.074,.05,.049),.006));
  float h=max(abs(length(q.xy-vec2(0.,.08))-.065)-.004,max(abs(q.z)-.006,.08-q.y));
  float goods=sdCapsule(q,vec3(-.05,.07,-.01),vec3(.04,.1,.02),.022);
  goods=min(goods,sdCylY(q-vec3(.045,.1,-.02),.014,.05)); goods=min(goods,sdCylY(q-vec3(.045,.16,-.02),.006,.015));
  goods=min(goods,length(q-vec3(-.02,.08,-.03))-.022);
  return vec2(min(b,h),goods); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 a=reg(p); r=U(r,a.x,3.); r=U(r,a.y,4.);
  vec2 b=basket(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=rq(p); if(abs(q.y-.205)<.01&&q.z<.035&&abs(q.x)<.04) return .2; return .45; }
  if(id==4.) return .9;
  if(id==5.){ vec3 q=kq(p); float a=fract(q.x/.01+step(.5,fract(q.y/.01))*.5); return a<.5?.4:.65; }
  if(id==6.) return .6;
  return .7; }
