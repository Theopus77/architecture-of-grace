/* The waves bench (science-waves) — pencil still life: a small oscilloscope box with a wave
   line on its gridded screen, knobs and a carry handle; a tuning fork standing on its wooden
   sounding box; and a coiled spring toy lying on the table in front. No writing. */
#define CAM_POS vec3(-0.6193,0.3104,-0.7667)
#define CAM_TGT vec3(-0.2191,0.0081,0.0780)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- the oscilloscope ---- */
#define OC vec3(.04,0.,.06)
#define ORY -.34
vec3 oq(vec3 p){ vec3 q=p-OC; q.xz=rot(ORY)*q.xz; return q; }
#define SCR vec3(-.03,.092,-.1)    /* screen centre on the front face */
float scopeBody(vec3 q){
  float d=sdRBox(q-vec3(0.,.09,0.),vec3(.12,.078,.1),.008);
  /* the screen sits in a recess */
  d=max(d,-sdRBox(q-vec3(SCR.x,SCR.y,-.1),vec3(.067,.052,.006),.008));
  /* the front bezel frame rim */
  vec3 b=q-vec3(SCR.x,SCR.y,-.101);
  float rim=max(sdRBox(b,vec3(.076,.061,.004),.01),-sdRBox(b,vec3(.066,.051,.01),.008));
  d=min(d,rim);
  vec3 f=vec3(abs(q.x)-.095,q.y-.006,abs(q.z)-.075);                  /* feet */
  d=min(d,sdRBox(f,vec3(.014,.006,.012),.003));
  return d; }
float screenD(vec3 q){ return sdRBox(q-vec3(SCR.x,SCR.y,-.095),vec3(.066,.051,.002),.007); }
float scopeKnobs(vec3 q){
  float d=1e5;
  for(int i=0;i<3;i++){
    vec3 k=q-vec3(.084,.138-float(i)*.036,-.1);
    float kd=sdCylZ(k-vec3(0.,0.,-.008),.0105,.008)-.0015;
    kd=min(kd,sdCylZ(k-vec3(0.,0.,-.001),.0135,.0012)-.0006);
    vec3 s=k; s.xy=rot(float(i)*1.3-.8)*s.xy;
    kd=min(kd,sdRBox(s-vec3(0.,.006,-.0175),vec3(.0012,.005,.0012),.0005));
    d=min(d,kd); }
  /* two jack sockets under the screen */
  for(int i=0;i<2;i++){
    vec3 j=q-vec3(-.07+float(i)*.05,.024,-.1);
    d=min(d,max(sdCylZ(j-vec3(0.,0.,-.005),.008,.005)-.001,-sdCylZ(j-vec3(0.,0.,-.01),.0035,.01))); }
  return d; }
float handle(vec3 q){
  vec3 h=q-vec3(0.,.168,0.);
  float side=sdRBox(vec3(abs(h.x)-.08,h.y-.012,h.z),vec3(.006,.014,.012),.004);
  float bar=sdCylX(h-vec3(0.,.028,0.),.008,.08)-.001;
  return min(side,bar); }
/* ---- the tuning fork on its sounding box ---- */
#define FC vec3(-.24,0.,-.05)
#define FRY -.25
vec3 fq(vec3 p){ vec3 q=p-FC; q.xz=rot(FRY)*q.xz; return q; }
float fbox(vec3 q){
  float d=sdRBox(q-vec3(0.,.03,0.),vec3(.075,.03,.042),.004);
  /* the open end of the sounding box faces right */
  d=max(d,-sdRBox(q-vec3(.08,.03,0.),vec3(.03,.022,.032),.003));
  return d; }
float fork(vec3 q){
  vec3 r=q-vec3(-.01,.06,0.);
  float stem=sdCylY(r-vec3(0.,.035,0.),.0048,.035)-.0008;
  stem=min(stem,sdCylY(r-vec3(0.,.004,0.),.009,.004)-.001);        /* the foot in the box */
  /* the U: a half ring at the bottom and two straight tines */
  vec3 u=r-vec3(0.,.082,0.);
  float bend=max(abs(length(u.xy)-.0135)-.0038,u.y);
  bend=max(bend,abs(u.z)-.0045);
  float tines=sdRBox(vec3(abs(u.x)-.0135,u.y-.05,u.z),vec3(.0038,.05,.0045),.0015);
  return min(stem,smin(bend,tines,.002)); }
/* ---- the coiled spring toy, lying on its side ---- */
#define CC vec3(.16,0.,-.2)
#define CRY .35
float coil(vec3 p){
  vec3 q=p-CC; q.xz=rot(CRY)*q.xz; q.y-=.034;
  float R=.032, pitch=.026, L=.095;
  float a=atan(q.y,q.z)/6.2832;
  float k=floor((q.x/pitch-a)+.5);
  k=clamp(k,-L/pitch,L/pitch);
  float xc=(k+a)*pitch;
  vec2 c=vec2(length(q.yz)-R,q.x-xc);
  float d=sdBox(vec3(c,0.),vec3(.0042,.0016,1.))-.0004;             /* a flat wire, on edge */
  d=max(d,abs(q.x)-L-.002);
  return d*.8; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=oq(p);
  float bb=sdBox(q-vec3(0.,.1,-.01),vec3(.14,.11,.13));
  if(bb<.03){
    r=U(r,scopeBody(q),3.);
    r=U(r,screenD(q),4.);
    r=U(r,scopeKnobs(q),5.);
    r=U(r,handle(q),6.);
  } else r=U(r,bb,3.);
  vec3 f=fq(p);
  r=U(r,fbox(f),7.);
  r=U(r,fork(f),8.);
  r=U(r,coil(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=oq(p);
  if(id==3.){
    vec3 b=q-vec3(SCR.x,SCR.y,-.1);
    if(max(abs(b.x)-.066,abs(b.y)-.051)<.012&&q.z<-.09) return .38;   /* the bezel */
    return .6; }
  if(id==4.){
    vec2 s=(q.xy-SCR.xy)/vec2(.058,.044);
    float w=.55*sin(s.x*3.1416*2.)*(1.-.12*s.x);
    float px=.03;
    if(abs(s.y-w)<.05) return .12;                                       /* the wave line */
    if(abs(s.x)<1.&&abs(s.y)<1.){
      if(abs(fract(s.x*2.+.5)-.5)<px*.5||abs(fract(s.y*2.+.5)-.5)<px*.5) return .7;  /* grid */
      if(abs(s.y)<.018||abs(s.x)<.018) return .55; }
    return .9; }
  if(id==5.) return .3;
  if(id==6.) return .45;
  if(id==7.){ vec3 f=fq(p); return .6+.12*grain(vec3(f.z,f.y,f.x),30.); }
  if(id==8.) return .8;
  if(id==9.) return .78;
  return .7; }
