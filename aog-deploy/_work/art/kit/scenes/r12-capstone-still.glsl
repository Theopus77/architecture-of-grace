/* Room r12 "Capstone: An Inquiry into Religion in Public Life" — pencil still life: a small
   model of a columned public hall (a town hall or courthouse: steps, six columns, a pediment),
   a stack of three books, and a magnifying glass lying on top of them, for looking closely. */
#define CAM_POS vec3(-0.2679,0.2279,-0.7575)
#define CAM_TGT vec3(-0.0772,0.0111,0.0659)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
/* the hall: three steps, a floor, six columns, a beam, a pediment and a back wall */
vec3 hlQ(vec3 p){ return L(p,vec3(0.,0.,.1),-.3); }
#define HW .12
#define HD .075
float stepsD(vec3 q){ float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); d=min(d,sdRBox(q-vec3(0.,.006+fi*.012,-.008*fi),vec3(HW-fi*.008,.006,HD-fi*.008),.0015)); }
  return d; }
float columnsD(vec3 q){ vec3 c=q-vec3(0.,.036,-HD+.03);
  float k=clamp(floor(c.x/.042+3.),0.,5.); c.x-=(k-2.5)*.042;
  float y=c.y; float r=.0085-.0012*y/.11;
  float shaft=max(length(c.xz)-r-.0006*cos(atan(c.z,c.x)*16.),abs(y-.055)-.055);
  float base=sdCylY(c-vec3(0.,.003,0.),.012,.003)-.001;
  float cap=sdRBox(c-vec3(0.,.107,0.),vec3(.012,.003,.012),.001);
  return min(min(shaft,base),cap); }
float wallD(vec3 q){ return sdRBox(q-vec3(0.,.09,.02),vec3(HW-.03,.055,.03),.002); }
float roofD(vec3 q){
  float beam=sdRBox(q-vec3(0.,.155,-.005),vec3(HW-.012,.009,HD-.018),.0015);
  vec2 u=vec2(q.x,q.y-.164); float tri=max(-u.y,(abs(u.x)*.045+u.y*(HW-.01)-.045*(HW-.01))/length(vec2(.045,HW-.01)));
  float ped=max(tri,abs(q.z+.005)-(HD-.016))-.001;
  return min(beam,ped); }
/* three books stacked, a little out of line */
vec3 bk(vec3 p,int i){ float fi=float(i); return L(p,vec3(.24,.0+fi*.034,-.07),2.75-fi*.2+.1*sin(fi*3.)); }
vec3 BS(int i){ return i==0?vec3(.07,.017,.1):i==1?vec3(.062,.016,.092):vec3(.056,.015,.085); }
float booksD(vec3 p){ float d=1e5; for(int i=0;i<3;i++) d=min(d,bookD(bk(p,i),BS(i))); return d; }
vec3 mgQ(vec3 p){ vec3 q=L(p,vec3(.2,.1015,-.08),-.6); return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.6-dot(p.xz-CAM_TGT.xz,normalize(CAM_TGT.xz-CAM_POS.xz)),2.);
  vec3 h=hlQ(p);
  r=U(r,stepsD(h),3.);
  r=U(r,columnsD(h),4.);
  r=U(r,min(wallD(h),roofD(h)),5.);
  r=U(r,booksD(p),6.);
  r=U(r,magD(mgQ(p),.9),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .8;
  if(id==4.) return .9;
  if(id==5.){ vec3 h=hlQ(p); if(h.z>-.012&&h.y<.145&&h.y>.035){                        /* a tall door in the back wall */
      if(abs(h.x)<.018&&h.y<.11) return abs(h.x)>.016||h.y>.108?.2:.38; }
    if(abs(h.y-.146)<.001) return .4; return .82; }
  if(id==6.){ for(int i=0;i<3;i++){ vec3 q=bk(p,i); vec3 b=BS(i); if(abs(q.y-b.y)<b.y+.001&&abs(q.x)<b.x+.003&&abs(q.z)<b.z+.003) return bookT(q,b,i==1?.62:.4); } return .5; }
  if(id==7.){ vec3 q=mgQ(p)/.9; return length(q.xz)<.047?.9:.35; }
  return .7; }
