/* FACS project 8 "Garden salad with a simple vinaigrette" — pencil still life: a big bowl of
   torn lettuce with cherry tomatoes and cucumber rounds on top, a small jar of shaken, cloudy
   dressing with its lid off beside it, and a measuring spoon. */
#define CAM_POS vec3(-0.3930,0.3966,-0.6959)
#define CAM_TGT vec3(-0.1730,0.0091,0.1226)
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
#define BC vec3(-.02,0.,.05)
#define JC vec3(.17,0.,-.05)
float bowl(vec3 p){ return bowlD(p-BC,.13,.085); }
float leaves(vec3 p){ vec3 q=p-BC;
  float d=sdEll(q-vec3(0.,.08,0.),vec3(.12,.05,.12));
  vec2 v=voro(q.xz*38.+vec2(q.y*20.,0.)).xy;
  d-=.008*smoothstep(.0,.35,v.y-v.x)-.004;               /* ruffled leaf edges */
  d+=.003*sin(q.x*140.+q.z*90.+fbm(q.xz*30.)*6.);
  return d*.6; }
vec2 tops(vec3 p){ vec3 q=p-BC; vec2 r=vec2(1e5,5.);
  for(int i=0;i<6;i++){ float fi=float(i); float a=fi*1.9+.4; float rr=.025+.07*fract(fi*.618+.2);
    vec2 xz=rr*vec2(cos(a),sin(a)); float y=heapY(xz,.12,.08,.05);
    r=U(r,length(q-vec3(xz.x,y+.006,xz.y))-.014,5.); }
  for(int i=0;i<5;i++){ float fi=float(i); float a=fi*2.5+1.3; float rr=.02+.07*fract(fi*.73+.5);
    vec2 xz=rr*vec2(cos(a),sin(a)); float y=heapY(xz,.12,.08,.05);
    vec3 l=q-vec3(xz.x,y+.004,xz.y); l.xy=rot(.3*sin(fi*3.))*l.xy;
    r=U(r,sdCylY(l,.016,.0025)-.001,6.); }
  return r; }
float jar(vec3 p){ vec3 q=p-JC;
  float body=sdCylY(q-vec3(0.,.045,0.),.032,.045)-.004;
  body=max(body,-sdCylY(q-vec3(0.,.07,0.),.029,.06));
  float neck=max(sdCylY(q-vec3(0.,.095,0.),.026,.008),-sdCylY(q-vec3(0.,.1,0.),.023,.02));
  float thr=max(sdCylY(q-vec3(0.,.095,0.),.0275+.0008*sin(q.y*1200.),.007),-sdCylY(q-vec3(0.,.1,0.),.023,.02));
  float fill=max(sdCylY(q-vec3(0.,.035,0.),.029,.03),-1.);
  return min(min(body,neck),min(thr,fill)); }
float lid(vec3 p){ vec3 q=p-JC-vec3(.07,0.,.03); q.xy=rot(.0)*q.xy;
  float d=sdCylY(q-vec3(0.,.007,0.),.03,.007)-.0015; d=max(d,-sdCylY(q-vec3(0.,.012,0.),.026,.005));
  return d; }
float spoon(vec3 p){ vec3 q=p-vec3(.1,.004,-.13); q.xz=rot(-.3)*q.xz;
  vec3 b=q-vec3(-.03,.004,0.); float bw=max(abs(sdEll(b,vec3(.013,.007,.011)))-.0012,b.y);
  float h=sdRBox(q-vec3(.025,.0035,0.),vec3(.045,.0016,.005),.0012);
  return min(bw,h); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowl(p),3.);
  vec3 q=p-BC; float bd=sdCylY(q-vec3(0.,.1,0.),.13,.05);
  if(bd>.01) r.x=min(r.x,bd); else { r=U(r,leaves(p),4.); r=U(r,tops(p)); }
  r=U(r,jar(p),7.);
  r=U(r,lid(p),8.);
  r=U(r,spoon(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; return abs(q.y-.065)<.003?.4:.8; }
  if(id==4.){ vec3 q=p-BC; float v=voro(q.xz*38.).x; return .45+.25*smoothstep(.0,.15,v)-.15*step(.93,fract(atan(q.z,q.x)*9.)); }
  if(id==5.) return .28;
  if(id==6.){ vec3 q=p-BC; return .82; }
  if(id==7.){ vec3 q=p-JC; return q.y<.065&&q.y>.006?.62+.08*vn3(q*300.):.92; }
  if(id==8.) return .5;
  if(id==9.) return .66;
  return .7; }
