/* WCS Unit 3 "Rules, Fairness and Leaders" — a brass balance scale with two hanging pans,
   a wooden gavel on its round sound block. */
#define CAM_POS vec3(-0.3987,0.5447,-1.0973)
#define CAM_TGT vec3(-0.2189,-0.0346,0.1097)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define SC vec3(0.,0.,.05)
float scale(vec3 p){ vec3 q=p-SC;
  float base=sdCylY(q-vec3(0.,.01,0.),.06,.008)-.003;
  base=min(base,sdCylY(q-vec3(0.,.024,0.),.035,.006)-.002);
  float post=sdCylY(q-vec3(0.,.14,0.),.006,.12);
  float knob=length(q-vec3(0.,.272,0.))-.012;
  float beam=sdCapsule(q,vec3(-.15,.25,0.),vec3(.15,.25,0.),.005);
  float piv=sdCylZ(q-vec3(0.,.25,0.),.013,.008);
  float ends=min(length(q-vec3(-.15,.25,0.))-.009,length(q-vec3(.15,.25,0.))-.009);
  return min(min(min(base,post),min(knob,beam)),min(piv,ends)); }
float pan(vec3 q){ float s=max(abs(length(q-vec3(0.,.06,0.))-.06)-.003,q.y-.018);
  float c=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.094+.5; vec3 e=vec3(cos(a)*.052,.018,sin(a)*.052);
    c=min(c,sdCapsule(q,e,vec3(0.,.19,0.),.0013)); }
  return min(s,c); }
float pans(vec3 p){ vec3 q=p-SC; return min(pan(q-vec3(-.15,.05,0.)),pan(q-vec3(.15,.05,0.))); }
#define GC vec3(.2,0.,-.13)
float block(vec3 p){ vec3 q=p-GC; return sdCylY(q-vec3(0.,.012,0.),.05,.012)-.003; }
float gavel(vec3 p){ vec3 q=p-GC-vec3(-.01,.052,0.); q.xz=rot(.5)*q.xz;
  float head=sdCylX(q,.018,.045)-.002;
  head=min(head,sdCylX(q-vec3(.047,0.,0.),.02,.004)); head=min(head,sdCylX(q+vec3(.047,0.,0.),.02,.004));
  float h=sdCapsule(q,vec3(0.,0.,-.01),vec3(0.,-.018,-.17),.0055);
  return min(head,h); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,scale(p),3.);
  r=U(r,pans(p),4.);
  r=U(r,block(p),5.);
  r=U(r,gavel(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .6;
  if(id==4.) return .72;
  if(id==5.) return .42+.12*grain(p,40.);
  if(id==6.){ vec3 q=p-GC-vec3(-.01,.052,0.); q.xz=rot(.5)*q.xz; if(abs(abs(q.x)-.03)<.003) return .25; return .45+.1*grain(p,50.); }
  return .7; }
