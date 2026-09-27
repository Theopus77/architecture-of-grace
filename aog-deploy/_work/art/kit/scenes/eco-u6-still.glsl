/* Economics Unit 6 "Trade, Government and the Community" — pencil still life: a toy
   delivery truck carrying a wooden crate, a fire hydrant (a service the community shares)
   and a small stack of parcels tied with string. */
#define CAM_POS vec3(-0.2785,0.2150,-0.8527)
#define CAM_TGT vec3(-0.1562,0.0000,0.0684)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define TC vec3(.08,0.,.13)
vec3 tq(vec3 p){ vec3 q=p-TC; q.xz=rot(-.35)*q.xz; return q; }   /* truck faces +x */
vec2 truck(vec3 p){
  vec3 q=tq(p);
  float cab=sdRBox(q-vec3(.1,.07,0.),vec3(.04,.045,.045),.008);
  float hood=sdRBox(q-vec3(.15,.052,0.),vec3(.025,.026,.042),.008);
  float bed=sdRBox(q-vec3(-.05,.045,0.),vec3(.11,.008,.05),.002);
  float sides=max(sdRBox(q-vec3(-.05,.065,0.),vec3(.11,.02,.05),.002),-sdBox(q-vec3(-.05,.075,0.),vec3(.104,.03,.044)));
  float cabwin=sdBox(q-vec3(.1,.09,0.),vec3(.03,.015,.06));
  cab=max(cab,-max(cabwin,-(abs(q.z)-.04)));
  float w=1e5;
  for(int i=0;i<4;i++){ vec3 c=q-vec3(i<2?.13:-.08,.026,(i%2==0)?.048:-.048); w=min(w,sdCylZ(c,.026,.009)-.002); }
  float crate=crateD(q-vec3(-.05,.053,0.),vec3(.06,.045,.04));
  crate=min(crate,sdRBox(q-vec3(-.05,.1,0.),vec3(.06,.004,.04),.002));
  return vec2(min(min(cab,hood),min(bed,sides)),min(w,crate)); }
#define HY vec3(-.2,0.,.02)
float hydrant(vec3 p){
  vec3 q=p-HY;
  float base=sdCylY(q-vec3(0.,.008,0.),.04,.008)-.002;
  float body=sdCylY(q-vec3(0.,.07,0.),.028,.06)-.002;
  float cap=max(length(q-vec3(0.,.13,0.))-.032,.13-q.y);
  float top=sdCylY(q-vec3(0.,.168,0.),.008,.008);
  float ring=sdCylY(q-vec3(0.,.12,0.),.034,.005);
  float nz=min(sdCylX(q-vec3(0.,.085,0.),.013,.042),sdCylZ(q-vec3(0.,.085,-.02),.016,.022))-.001;
  return min(min(base,body),min(min(cap,top),min(ring,nz))); }
vec3 bq(vec3 p){ vec3 q=p-vec3(.35,0.,.0); q.xz=rot(-.5)*q.xz; return q; }
vec2 parcels(vec3 p){
  vec3 q=bq(p);
  float a=sdRBox(q-vec3(0.,.03,0.),vec3(.05,.03,.04),.003);
  vec3 b=q-vec3(.005,.078,.0); b.xz=rot(.3)*b.xz;
  float bb=sdRBox(b,vec3(.036,.018,.03),.003);
  float str=max(abs(q.x)-.002,abs(sdRBox(q-vec3(0.,.03,0.),vec3(.05,.03,.04),.003))-.0015);
  return vec2(min(a,bb),str); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 t=truck(p); r=U(r,t.x,3.); r=U(r,t.y,4.);
  r=U(r,hydrant(p),5.);
  vec2 b=parcels(p); r=U(r,b.x,6.); r=U(r,b.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 q=tq(p); if(q.y<.055) return .22; return abs(fract(q.y/.03)-.5)>.44?.3:.65; }
  if(id==5.) return .38;
  if(id==6.) return .7;
  if(id==7.) return .35;
  return .7; }
