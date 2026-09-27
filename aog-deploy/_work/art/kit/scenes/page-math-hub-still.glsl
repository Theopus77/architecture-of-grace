/* Math hub page — pencil still life: a small wooden abacus with rows of beads, three wooden
   number blocks carved 1, 2 and 3, a drawing compass standing open on its points and a
   half-circle protractor lying flat. */
#define CAM_POS vec3(-0.4127,0.3214,-0.8025)
#define CAM_TGT vec3(-0.1447,-0.0104,0.0539)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.6,.8,-.6)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define ABC vec3(-.04,0.,.1)
#define ABR .18
#define AW .13
#define AH .17
#define BH .036
#define CMP vec3(.3,0.,-.13)
#define PRO vec3(.02,0.,-.17)
/* ---- abacus: frame AW half wide, AH tall, on two little feet ---- */
float abFrame(vec3 q){
  float posts=sdRBox(vec3(abs(q.x)-AW,q.y-AH*.5-.012,q.z),vec3(.009,AH*.5,.014),.003);
  float bars=sdRBox(vec3(q.x,abs(q.y-AH*.5-.012)-AH*.5,q.z),vec3(AW+.009,.009,.014),.003);
  float feet=sdRBox(vec3(abs(q.x)-AW,q.y-.006,q.z),vec3(.013,.006,.035),.003);
  return min(min(posts,bars),feet); }
float rodY(int i){ return .012+AH*(.16+.17*float(i)); }
int nLeft(int i){ return i==0?3:i==1?7:i==2?2:i==3?5:4; }
float abRods(vec3 q){ float d=1e3; for(int i=0;i<5;i++) d=min(d,sdCylX(q-vec3(0.,rodY(i),0.),.0022,AW)); return d; }
float abBeads(vec3 q){ float d=1e3; float s=.0185; float x0=-AW+.018;
  for(int i=0;i<5;i++){ vec3 b=q-vec3(0.,rodY(i),0.); if(abs(b.y)>.03) continue;
    float nl=float(nLeft(i)), nr=10.-nl;
    float k=clamp(floor((b.x-x0)/s+.5),0.,nl-1.); d=min(d,sdEll(b-vec3(x0+k*s,0.,0.),vec3(.0092,.0125,.0125)));
    float xr=AW-.018-(nr-1.)*s; k=clamp(floor((b.x-xr)/s+.5),0.,nr-1.); d=min(d,sdEll(b-vec3(xr+k*s,0.,0.),vec3(.0092,.0125,.0125))); }
  return d; }
/* ---- number blocks ---- */
float block(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.005);
  if(d>.02) return d;
  d=carve(d,q.xy,g,.052,.0045,q.z+BH,.003);
  d=carve(d,vec2(-q.z,q.y),g2,.05,.004,q.x-BH,.003);
  return d; }
float blockInk(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-BH+.006&&glyph(q.xy/.052,g)*.052<.0065) return .15;
  if(q.x>BH-.006&&glyph(vec2(-q.z,q.y)/.05,g2)*.05<.006) return .15;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-BH*.84)<.0018) return .45;
  return .78; }
#define B1 vec3(.1,BH,-.07)
#define B2 vec3(.182,BH,-.05)
#define B3 vec3(.14,3.*BH+.001,-.06)
/* ---- drawing compass standing on its two points ---- */
float cmpD(vec3 q){
  vec3 hg=vec3(0.,.17,0.);
  vec3 f1=vec3(-.055,.0,0.), f2=vec3(.055,.012,0.);
  float l1=sdCapsule(q,hg,f1+vec3(.004,.02,0.),.0042);
  float nd=sdCone((q-f1-vec3(.0015,.011,0.))*1.,.0005,.0022,.011);   /* the needle */
  float l2=sdCapsule(q,hg,f2+vec3(-.003,.02,0.),.0042);
  float lead=sdCapsule(q,f2+vec3(-.003,.02,0.),f2,.0024);
  float clamp_=sdCylY(q-f2-vec3(-.0026,.026,0.),.0055,.006);
  float head=sdCylZ(q-hg,.011,.006)-.002;
  float knob=sdCapsule(q,hg+vec3(0.,.012,0.),hg+vec3(0.,.034,0.),.0045);
  return min(min(min(l1,nd),min(l2,lead)),min(clamp_,min(head,knob))); }
/* ---- protractor lying flat, straight edge toward us ---- */
float proD(vec3 q){ float R=.075;
  float d=max(length(q.xz)-R,-q.z); d=max(d,-max(length(q.xz)-R*.5,.01-q.z));
  return max(d,abs(q.y-.0015)-.0012)-.0008; }
float proT(vec3 q){ float R=.075; float r=length(q.xz); float a=atan(q.z,q.x); float deg=a/PI*180.;
  float f=abs(fract(deg/10.+.5)-.5)*10.*PI/180.*r, g=abs(fract(deg/2.+.5)-.5)*2.*PI/180.*r;
  if(r>R-.016&&f<.0011) return .12; if(r>R-.008&&g<.0007) return .35;
  if(abs(r-R*.7)<.0009) return .4; return .82; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 a=P(p,ABC,ABR);
  r=U(r,abFrame(a),3.);
  r=U(r,abRods(a),4.);
  r=U(r,abBeads(a),5.);
  r=U(r,block(p,B1,-.1,49,50),6.);
  r=U(r,block(p,B2,-.15,50,51),7.);
  r=U(r,block(p,B3,-.22,51,49),8.);
  r=U(r,cmpD(P(p,CMP,-.4)),9.);
  r=U(r,proD(P(p,PRO,.12)),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=P(p,ABC,ABR); return .45+.1*grain(q.zxy*vec3(1.,1.,1.),30.); }
  if(id==4.) return .5;
  if(id==5.){ vec3 q=P(p,ABC,ABR); float row=floor((q.y-.012-AH*.075)/(AH*.17));
    return mod(row,2.)<1.?.32:.62; }
  if(id==6.) return blockInk(p,B1,-.1,49,50);
  if(id==7.) return blockInk(p,B2,-.15,50,51);
  if(id==8.) return blockInk(p,B3,-.22,51,49);
  if(id==9.){ vec3 q=P(p,CMP,-.4); return q.y>.16?.3:.55; }
  if(id==10.) return proT(P(p,PRO,.12));
  return .7; }
