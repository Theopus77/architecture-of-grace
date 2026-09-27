/* Room "How a Bill Becomes a Law" — pencil still life: a paper bill half unrolled on the table
   (hint-lines only) with a round wax seal at its foot, a wooden rubber stamp standing beside
   it (approved), and a feather quill lying across the paper (the signature). */
#define CAM_POS vec3(-0.2779,0.2613,-0.5162)
#define CAM_TGT vec3(-0.0957,-0.0183,0.0303)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define SC vec3(-.02,0.,.05)
#define ST vec3(.2,0.,.06)
vec3 scQ(vec3 p){ return place(p,SC,.15); }
float sheetD(vec3 p){ vec3 q=scQ(p);
  float sheet=sdBox(q-vec3(0.,.0012,-.04),vec3(.09,.0012,.1));
  sheet=max(sheet,-(q.z+.14)*0.-1e3);
  float roll=sdCylX(q-vec3(0.,.02,.07),.02,.092); roll=max(roll,-sdCylX(q-vec3(0.,.02,.07),.014,.1));
  /* a curled lip at the near end */
  float lip=max(abs(length((q-vec3(0.,.008,-.14)).yz)-.008)-.001,abs(q.x)-.09); lip=max(lip,q.z+.14);
  return min(min(sheet,roll),lip); }
float sealD(vec3 p){ vec3 q=scQ(p)-vec3(.05,.0024,-.1); float r=length(q.xz); float a=atan(q.z,q.x);
  float d=sdCylY(q-vec3(0.,.003,0.),.018+.0015*sin(a*9.),.003)-.002;
  d=max(d,-max(abs(r-.011)-.0012,-(q.y-.004)));
  float rib=sdCapsule(q,vec3(-.01,.001,.005),vec3(-.03,.001,.035),.004); rib=min(rib,sdCapsule(q,vec3(-.005,.001,.01),vec3(-.005,.001,.045),.004));
  return min(d,rib); }
float stampD(vec3 p){ vec3 q=place(p,ST,.3);
  float base=sdRBox(q-vec3(0.,.018,0.),vec3(.04,.012,.028),.004);
  float pad=sdRBox(q-vec3(0.,.004,0.),vec3(.037,.004,.025),.002);
  float neck=sdCylY(q-vec3(0.,.05,0.),.009+.004*smoothstep(.07,.035,q.y),.022);
  float knob=sdEll(q-vec3(0.,.085,0.),vec3(.02,.018,.02));
  return min(min(base,pad),smin(neck,knob,.01)); }
vec3 qlQ(vec3 p){ vec3 q=p-vec3(.17,.004,-.1); q.xz=rot(.35)*q.xz; return q; }   /* along x */
float quillD(vec3 p){ vec3 q=qlQ(p);
  float shaft=sdCapsule(q,vec3(-.1,0.,0.),vec3(.13,.012,0.),.0022);
  vec3 v=q-vec3(.04,.008,0.); float half_=.011*pow(sin(clamp((v.x+.09)/.2,0.,1.)*3.1416),.6);
  float vane=max(max(abs(v.z-.002)-half_,abs(v.y-.0*v.x)-.0012),abs(v.x-.01)-.1);
  return min(shaft,vane*.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,sheetD(p),3.);
  r=U(r,sealD(p),4.);
  r=U(r,stampD(p),5.);
  r=U(r,quillD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=scQ(p); if(q.y<.004&&q.z<.05){ float l=fract((q.z+.2)/.014); if(abs(q.x)<.07&&q.z>-.12&&l<.16&&!(q.z>.035&&q.x>.0)) return .55; } return .92; }
  if(id==4.) return .3;
  if(id==5.){ vec3 q=place(p,ST,.3); if(q.y<.008) return .25; return .45+.15*grain(q,70.); }
  if(id==6.){ vec3 q=qlQ(p); if(abs(q.z)<.0025) return .45; return fract(q.x/.006+abs(q.z)*30.)<.3?.62:.9; }
  return .7; }
