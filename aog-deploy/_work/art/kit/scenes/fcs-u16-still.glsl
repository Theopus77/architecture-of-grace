/* FCS Unit 16 "Nutrition and Meal Planning" — pencil still life: a divided plate with a portion
   of rice, broccoli florets, a piece of chicken and slices of orange, a glass of milk, and a
   fork laid beside the plate. */
#define CAM_POS vec3(-0.3847,0.2658,-0.7081)
#define CAM_TGT vec3(-0.1704,-0.0600,0.0895)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define PL vec3(-.02,0.,.03)
#define PR .15
float plate(vec3 p){ vec3 q=p-PL; float r=length(q.xz);
  float base=max(sdCylY(q-vec3(0.,.005,0.),PR,.005)-.002,0.);
  float rim=max(abs(r-PR+.006)-.006,abs(q.y-.012)-.008)-.001;
  /* dividers: a line across and a line from centre to the back */
  float div=min(max(abs(q.z+.005)-.003,r-PR+.01),max(max(abs(q.x)-.003,-q.z-.005),r-PR+.01)); div=max(div,abs(q.y-.012)-.008)-.001;
  return min(min(base,rim),div); }
float rice(vec3 p){ vec3 q=p-PL-vec3(0.,.01,-.07); float d=(length(q/vec3(.1,.03,.045))-1.)*.03; d=max(d,-q.y); return d+.0015*vn3(q*500.); }
float broc(vec3 p){ vec3 q=p-PL-vec3(-.06,.01,.06); float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); vec3 c=q-vec3(-.02+fi*.022,0.,.01*sin(fi*2.));
    float st=sdCapsule(c,vec3(0.),vec3(.0,.02,0.),.006); float head=length(c-vec3(0.,.034,0.))-.021+.003*vn3(c*400.); d=min(d,min(st,head)); } return d; }
float chicken(vec3 p){ vec3 q=p-PL-vec3(.07,.012,.05); q.xz=rot(.4)*q.xz; return (length(q/vec3(.045,.018,.03))-1.)*.018; }
float orange(vec3 p){ vec3 q=p-vec3(.18,.0,-.07); float d=1e5;
  for(int i=0;i<2;i++){ vec3 s=q-vec3(float(i)*.035,.005+float(i)*.009,float(i)*.012); d=min(d,max(length(s.xz)-.032,abs(s.y)-.004)-.001); } return d; }
#define GM vec3(.19,0.,.07)
float glassD(vec3 p){ vec3 q=p-GM; float r=.032+q.y*.05; return min(max(abs(length(q.xz)-r)-.002,abs(q.y-.065)-.065),sdCylY(q-vec3(0.,.005,0.),r,.005)); }
float milk(vec3 p){ vec3 q=p-GM; return sdCylY(q-vec3(0.,.05,0.),.032+.1*.05-.003,.045); }
float fork(vec3 p){ vec3 q=p-vec3(-.1,.003,-.17); q.xz=rot(.25)*q.xz;
  float hdl=sdRBox(q-vec3(-.03,0.,0.),vec3(.065,.0022,.007),.002);
  float tines=max(sdBox(q-vec3(.06,0.,0.),vec3(.025,.0018,.009)),abs(fract(q.z/.0045+.5)-.5)*.0045-.0011); tines=max(tines,-(q.x-.04));
  float neck=sdRBox(q-vec3(.035,0.,0.),vec3(.008,.002,.009),.002);
  return min(min(hdl,tines),neck); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,plate(p),3.);
  r=U(r,rice(p),4.);
  r=U(r,broc(p),5.);
  r=U(r,chicken(p),6.);
  r=U(r,orange(p),7.);
  r=U(r,glassD(p),8.);
  r=U(r,milk(p),9.);
  r=U(r,fork(p),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .92;
  if(id==4.) return .9;
  if(id==5.) return .35;
  if(id==6.) return .6;
  if(id==7.){ vec3 q=p-vec3(.18,.0,-.07); int k=q.y>.012?1:0; vec2 u=q.xz-vec2(float(k)*.035,float(k)*.012); float r=length(u); if(n.y<.7) return .4; if(r>.027) return .35; if(abs(fract(atan(u.y,u.x)/(PI/5.))-.5)>.44) return .45; return .72; }
  if(id==8.) return .96;
  if(id==9.) return .93;
  if(id==10.) return .6;
  return .7; }
