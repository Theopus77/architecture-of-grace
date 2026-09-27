/* Hindu Texts Unit 17 "The Texts in Life, and Capstone" — pencil still life: a pair of tabla
   drums (a tall wooden drum and a round metal drum, each with a dark centre on its head), a
   string of dancer's ankle bells, and a clay oil lamp. Objects only. */
#define CAM_POS vec3(-0.2672,0.3153,-0.8571)
#define CAM_TGT vec3(-0.1590,-0.0002,0.0445)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define T1 vec3(.03,0.,.1)
#define T2 vec3(.2,0.,.14)
float ringB(vec3 q,float R,float h){ return sdTorus(q-vec3(0.,h,0.),R,.012); }
float dayan(vec3 p){ vec3 q=p-T1; float y=q.y;
  float r=.052+.006*sin(clamp(y/.2,0.,1.)*3.14)-.004*y/.2;
  float body=max((length(q.xz)-r)*.9,max(-y+.03,y-.2));
  float ring=ringB(q,.058,.028)*1.;
  float head=sdCylY(q-vec3(0.,.2,0.),.05,.004)-.002;
  float d=min(min(body,ring),head);
  for(int i=0;i<12;i++){ float a=float(i)*.5236; vec3 top=vec3(cos(a)*.05,.2,sin(a)*.05), bot=vec3(cos(a+.2)*.056,.03,sin(a+.2)*.056);
    d=min(d,sdCapsule(q,top,bot,.0016)); }
  for(int i=0;i<6;i++){ float a=float(i)*1.047+.3; d=min(d,sdRBox(ry(q-vec3(cos(a)*.056,.09,sin(a)*.056),-a),vec3(.006,.016,.009),.003)); }
  return d; }
float bayan(vec3 p){ vec3 q=p-T2; float d=max(sdEll(q-vec3(0.,.05,0.),vec3(.085,.075,.085)),q.y-.1);
  d=min(d,sdCylY(q-vec3(0.,.1,0.),.058,.004)-.002);
  d=min(d,ringB(q,.07,.012)*1.);
  return d; }
float bells(vec3 p){ vec3 q=p-vec3(-.12,0.,-.08); float d=1e5;
  for(int i=0;i<16;i++){ float t=float(i)/15.; float x=-.12+t*.24; float z=.05*sin(t*5.)-.02; vec3 c=vec3(x,.009,z);
    d=min(d,length(q-c)-.009); d=min(d,length(q-c-vec3(.0,.0,.013))-.007); }
  d=min(d,sdRBox(q-vec3(0.,.003,.035),vec3(.13,.003,.018),.002));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,dayan(p),3.);
  r=U(r,bayan(p),4.);
  r=U(r,bells(p),5.);
  r=U(r,diya(ry(p-vec3(.3,0.,-.08),2.5),1.2),6.);
  r=U(r,flameD(ry(p-vec3(.3,0.,-.08),2.5)-DIYA_TIP(1.2),.042),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-T1; if(q.y>.2){ float r=length(q.xz); if(r<.018) return .12; if(r>.042) return .5; return .8; } return fract(q.y*50.+fbm(q.xz*40.))<.3?.38:.48; }
  if(id==4.){ vec3 q=p-T2; if(q.y>.1){ float r=length(q.xz); if(length(q.xz-vec2(.012,0.))<.02) return .12; return .8; } return .4; }
  if(id==5.) return .55;
  if(id==6.) return .5;
  if(id==7.) return .97;
  return .7; }
