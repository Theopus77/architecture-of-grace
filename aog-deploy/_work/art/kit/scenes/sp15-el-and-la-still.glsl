/* sp15-el-and-la "El and La — Naming What Is Here" — three things with everyday names from the
   room (la casa, el perro, la silla): a wooden toy house, a wooden pull-along toy dog on wheels
   with its string and ring, and a little wooden chair (la silla). No words. */
#define CAM_POS vec3(-0.3195,0.3778,-0.7587)
#define CAM_TGT vec3(-0.1907,-0.0365,0.1044)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
vec3 place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
/* ---- toy house: ridge along x, front wall toward the viewer (-z) ---- */
#define HC vec3(.07,0.,.08)
#define HB vec3(.075,.055,.055)
vec3 hoQ(vec3 p){ return place(p,HC,-.28); }
vec2 houseD(vec3 q){
  vec2 h=gableHouse(q,HB,.85,.012);
  float w=h.x;
  float door=sdBox(q-vec3(-.02,.032,-HB.z),vec3(.014,.032,.004));                 /* door recess */
  vec3 wq=q-vec3(.038,.068,-HB.z); float win=sdBox(wq,vec3(.017,.015,.004));
  w=max(w,-door); w=max(w,-win);
  vec3 sq=q-vec3(-.075,.068,0.); sq.x=abs(sq.x); float sw=sdBox(q-vec3(-HB.x,.068,0.),vec3(.004,.015,.017)); w=max(w,-sw);
  float chim=sdRBox(q-vec3(.035,.15,.02),vec3(.011,.03,.011),.002);
  float roof=min(h.y,chim);
  float step_=sdRBox(q-vec3(-.02,.004,-HB.z-.012),vec3(.022,.004,.012),.002);
  return vec2(w,min(roof,step_)); }
/* ---- pull-along toy dog, facing +x ---- */
#define DC vec3(-.16,0.,-.03)
vec3 dgQ(vec3 p){ return place(p,DC,-.15); }
float dogD(vec3 q){
  float body=sdRBox(q-vec3(0.,.048,0.),vec3(.056,.022,.021),.009);
  vec3 h=q-vec3(.064,.082,0.);
  float head=sdRBox(h,vec3(.022,.021,.019),.008);
  float snout=sdRBox(h-vec3(.026,-.008,0.),vec3(.014,.011,.012),.005);
  vec3 e=h; e.z=abs(e.z); e-=vec3(-.004,.002,.021); e.xy=rot(-.25)*e.xy;
  float ear=sdRBox(e-vec3(0.,-.012,0.),vec3(.009,.019,.004),.003);
  float neck=sdCapsule(q,vec3(.04,.058,0.),vec3(.058,.074,0.),.013);
  float tail=sdCapsule(q,vec3(-.055,.058,0.),vec3(-.074,.09,0.),.0048);
  float d=min(min(body,neck),min(min(head,snout),min(ear,tail)));
  return d; }
float wheelsD(vec3 q){ vec3 w=q; w.x=abs(w.x)-.036; w.z=abs(w.z)-.027;
  float wh=sdCylZ(w-vec3(0.,.019,0.),.019,.0045)-.001;
  float axle=sdCylZ(vec3(abs(q.x)-.036,q.y-.019,q.z),.003,.03);
  return min(wh,axle); }
float stringD(vec3 q){
  float s=sdCapsule(q,vec3(.1,.072,0.),vec3(.13,.02,-.02),.0014);
  s=min(s,sdCapsule(q,vec3(.13,.02,-.02),vec3(.175,.0016,-.06),.0014));
  float ring=sdTorus(q-vec3(.19,.0022,-.07),.013,.0022);
  return min(s,ring); }
/* ---- a little wooden chair (la silla), seat toward the viewer, back behind ---- */
#define BK vec3(.23,0.,-.04)
vec3 bkQ(vec3 p){ return place(p,BK,.5); }
float chairD(vec3 q){ vec3 l=q; l.x=abs(l.x)-.034; l.z=abs(l.z)-.032;
  float legs=sdRBox(l-vec3(0.,.03,0.),vec3(.0045,.03,.0045),.0015);
  float seat=sdRBox(q-vec3(0.,.063,0.),vec3(.043,.0045,.041),.002);
  vec3 b=q-vec3(0.,0.,.032); b.x=abs(b.x)-.034;
  float posts=sdRBox(b-vec3(0.,.1,0.),vec3(.0045,.035,.0045),.0015);
  float slat=sdRBox(q-vec3(0.,.123,.032),vec3(.036,.01,.004),.002);
  float slat2=sdRBox(q-vec3(0.,.095,.032),vec3(.036,.004,.0035),.0015);
  float rung=sdCylX(q-vec3(0.,.02,-.032),.0022,.034);
  return min(min(min(legs,seat),min(posts,slat)),min(slat2,rung)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.45-p.z,2.);
  vec3 h=hoQ(p); vec2 hh=houseD(h);
  r=U(r,hh.x,3.); r=U(r,hh.y,4.);
  vec3 d=dgQ(p);
  r=U(r,dogD(d),5.);
  r=U(r,wheelsD(d),6.);
  r=U(r,stringD(d),7.);
  r=U(r,chairD(bkQ(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hoQ(p);
    if(abs(q.x+.02)<.014&&q.y<.064&&q.z<-HB.z+.006) return .3;                 /* door */
    if(abs(q.x-.038)<.017&&abs(q.y-.068)<.015&&q.z<-HB.z+.006) return abs(q.x-.038)<.0015||abs(q.y-.068)<.0015?.3:.2;
    if(q.x<-HB.x+.006&&abs(q.y-.068)<.015&&abs(q.z)<.017) return .2;
    return .8-.08*grain(q,90.); }
  if(id==4.){ vec3 q=hoQ(p); return .38+.14*step(.5,fract(q.x/.018+.5*step(.5,fract(q.y/.02)))); }  /* shingle rows */
  if(id==5.){ vec3 q=dgQ(p); return .62+.1*grain(q,80.); }
  if(id==6.) return .3;
  if(id==7.) return .3;
  if(id==8.) return .6+.12*grain(bkQ(p),90.);
  return .7; }
