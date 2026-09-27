/* Chinese Classics Unit 14 "Mencius and Zhuangzi Close Up" — pencil still life: an old stone
   well with a wooden windlass frame and a rope-hung bucket (Mencius's child at the well, and
   Zhuangzi's frog in the well), with a small frog sitting on the well's rim. */
#define CAM_POS vec3(-0.6120,0.3155,-1.0183)
#define CAM_TGT vec3(-0.3531,0.0803,0.1467)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define WC vec3(0.,0.,.16)
#define WR .12
float well(vec3 p){ vec3 q=p-WC; float r=length(q.xz); float a=atan(q.z,q.x);
  /* stone courses: rows of blocks with mortar grooves */
  float d=max(abs(r-WR)-.022,abs(q.y-.06)-.06)-.003;
  d+=.002*(fbm(vec2(a*20.,q.y*60.))-.5);
  return d; }
float frame(vec3 p){ vec3 q=p-WC; float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(s*(WR+.03),0.,0.);
    d=min(d,sdRBox(c-vec3(0.,.16,0.),vec3(.01,.16,.01),.002)); }
  float roller=sdCylX(q-vec3(0.,.28,0.),.017,WR+.03);
  float crank=sdRBox(q-vec3(WR+.058,.26,0.),vec3(.004,.03,.005),.002); crank=min(crank,sdCylX(q-vec3(WR+.07,.235,0.),.004,.014));
  float roof=max(sdRBox(q-vec3(0.,.33,0.),vec3(WR+.07,.006,.07),.002),-1.);
  vec3 rq=q-vec3(0.,.325,0.); float ridge=max(abs(rq.z)*.55+rq.y-.035,max(-rq.y,abs(rq.x)-WR-.07));
  ridge=max(ridge,-(abs(rq.z)*.55+rq.y-.028)); ridge=max(ridge,-rq.y+.0);
  return min(min(d,roller),min(crank,ridge-.001)); }
float rope(vec3 p){ vec3 q=p-WC; float d=sdTorus((q-vec3(-.02,.28,0.)).yxz,.019,.003); d=min(d,sdTorus((q-vec3(.01,.28,0.)).yxz,.019,.003));
  d=min(d,sdCylY(q-vec3(0.,.225,-.019),.0025,.055)); return d; }
float bucket(vec3 p){ vec3 q=p-WC-vec3(0.,.15,-.019);
  float d=sdCone(q,.028,.034,.028)-.002; d=max(d,-sdCone(q-vec3(0.,.006,0.),.024,.03,.028));
  d=min(d,sdTorus((q-vec3(0.,.028,0.)).xzy*vec3(1.,1.,1.),.033,.0022)*1.);
  return d; }
#define FR vec3(.2,0.,-.06)
float frog0(vec3 p){ vec3 q=p-(WC+FR); q.xz=rot(.4)*q.xz;
  float body=(length((q-vec3(0.,.012,0.))/vec3(.018,.012,.024))-1.)*.012;
  float head=(length((q-vec3(0.,.02,-.018))/vec3(.014,.009,.012))-1.)*.009;
  float eyes=min(length(q-vec3(.008,.028,-.02))-.0045,length(q-vec3(-.008,.028,-.02))-.0045);
  vec3 l=vec3(abs(q.x),q.y,q.z);
  float leg=(length((l-vec3(.018,.007,.012))/vec3(.008,.007,.014))-1.)*.007;
  float arm=sdCapsule(l,vec3(.01,.01,-.012),vec3(.014,.002,-.024),.0028);
  float d=smin(body,head,.008); d=smin(d,leg,.004); d=min(d,min(eyes,arm));
  return d; }
float frog(vec3 p){ vec3 c=WC+FR; return frog0((p-c)/2.+c)*2.; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,well(p),3.);
  r=U(r,frame(p),4.);
  r=U(r,rope(p),5.);
  r=U(r,bucket(p),6.);

  r=U(r,max(length((p-WC).xz)-WR+.02,p.y-.09),8.);   /* dark water inside */
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-WC; float a=atan(q.z,q.x); float row=floor(q.y/.03);
    if(n.y<.7){ if(fract(q.y/.03)<.08) return .3; if(fract(a*12./6.2832+row*.5)<.02) return .3; }
    return .6+.12*fbm(vec2(a*10.,q.y*40.)); }
  if(id==4.) return .42+.14*grain(p,40.);
  if(id==5.) return .45;
  if(id==6.){ vec3 q=p-WC; return abs(q.y-.15)<.003?.3:.55; }
  if(id==7.){ vec3 q=(p-(WC+FR))/2.; if(q.y>.026) return .15; return .38+.15*step(.6,fbm(q.xz*400.)); }
  if(id==8.) return .1;
  return .7; }
