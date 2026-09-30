/* The Unseen Realm Unit 17 "Heiser's Legacy, and Capstone" — pencil still life: a desk
   microphone on a small stand with a round foot (the Naked Bible Podcast), a stack of three
   books, and a spiral notepad with hint-lines and a pencil lying across it (the student's own
   argument from the texts). */
#define CAM_POS vec3(-0.4579,0.3379,-1.0397)
#define CAM_TGT vec3(-0.2435,0.0044,0.0803)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define MIC vec3(.02,0.,.1)
#define BKS vec3(.2,0.,.1)
#define PAD vec3(-.08,0.,-.1)
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
/* the microphone: round weighted foot, short post, a yoke holding a rounded body with a grille */
vec3 micBody(vec3 p){ vec3 q=p-MIC-vec3(0.,.19,0.); q.yz=rot(.25)*q.yz; return q; }
float micStand(vec3 p){ vec3 q=p-MIC;
  float foot=sdCylY(q-vec3(0.,.008,0.),.065,.006)-.004;
  foot=min(foot,sdCone(q-vec3(0.,.022,0.),.03,.014,.008));
  float post=sdCylY(q-vec3(0.,.07,0.),.0065,.05);
  float knob=sdCylX(q-vec3(0.,.19,0.),.008,.054)-.002;
  float ya=sdCapsule(q,vec3(-.046,.19,0.),vec3(-.046,.12,0.),.004);
  float yb=sdCapsule(q,vec3(.046,.19,0.),vec3(.046,.12,0.),.004);
  float yc=sdCapsule(q,vec3(-.046,.12,0.),vec3(.046,.12,0.),.004);
  return min(min(foot,post),min(knob,min(min(ya,yb),yc))); }
float micD(vec3 p){ vec3 q=micBody(p);
  float body=sdCapsule(q,vec3(0.,-.035,0.),vec3(0.,.05,0.),.036);
  float ring=sdTorus(q-vec3(0.,-.01,0.),.037,.0035);
  float cap=sdCylY(q-vec3(0.,-.055,0.),.03,.012)-.004;
  return min(min(body,ring),cap); }
/* three books stacked, each turned a little */
vec3 bq(vec3 p,int i){ vec3 q=p-BKS-vec3(0.,i==0?0.:i==1?.04:.074,0.); q.xz=rot(i==0?.1:i==1?-.12:.2)*q.xz; return q; }
vec3 bs(int i){ return i==0?vec3(.1,.02,.075):i==1?vec3(.09,.017,.068):vec3(.078,.014,.058); }
float booksD(vec3 p,out float w){ float d=1e3; w=0.;
  for(int i=0;i<3;i++){ float e=bookD(bq(p,i),bs(i)); if(e<d){ d=e; w=float(i); } }
  return d; }
/* the notepad: a card back, a block of pages, a spiral along the top; a pencil across it */
vec3 padQ(vec3 p){ vec3 q=p-PAD; q.xz=rot(-.2)*q.xz; return q; }
float padD(vec3 p){ vec3 q=padQ(p);
  float back=sdRBox(q-vec3(0.,.002,0.),vec3(.075,.002,.1),.001);
  float pages=sdRBox(q-vec3(0.,.007,-.004),vec3(.072,.004,.094),.001);
  return min(back,pages); }
float spiralD(vec3 p){ vec3 q=padQ(p)-vec3(0.,.008,.097); q.x=mod(q.x+.0065,.013)-.0065;
  float d=sdTorus(q.yxz*vec3(1.,1.,1.),.0075,.0014);
  return max(d,abs(padQ(p).x)-.07); }
float pencilD(vec3 p){ vec3 q=padQ(p)-vec3(.02,.018,-.01); q.xz=rot(.7)*q.xz;
  float R=.0055; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.01)-.08);
  float t=clamp((q.x-.07)/.022,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.07-q.x,q.x-.092));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.095)-.007);
  float era=max(length(q.yz)-R*.93,abs(q.x+.107)-.006)-.0005;
  return min(min(body,cone),min(fer,era)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,micStand(p),3.);
  r=U(r,micD(p),4.);
  float w; r=U(r,booksD(p,w),5.);
  r=U(r,padD(p),6.);
  r=U(r,spiralD(p),7.);
  r=U(r,pencilD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 q=micBody(p); if(q.y>-.005){ float a=atan(q.z,q.x); float g=min(fract(q.y/.007),fract(a*8./3.1416+q.y*20.)); return g<.3?.35:.72; }
    return .45; }
  if(id==5.){ float w; booksD(p,w); int i=int(w); return bookT(bq(p,i),bs(i),i==0?.4:i==1?.6:.48); }
  if(id==6.){ vec3 q=padQ(p); if(q.y<.004) return .5; if(n.y<.5) return fract(q.y/.0016)<.4?.75:.93;
    float l=fract((q.z+.09)/.012); if(q.z<.08&&q.z>-.09&&abs(q.x)<.064&&l<.14) return .62;
    if(abs(q.x+.052)<.0012&&q.z<.085) return .6; return .95; }
  if(id==7.) return .4;
  if(id==8.){ vec3 q=padQ(p)-vec3(.02,.018,-.01); q.xz=rot(.7)*q.xz;
    if(q.x>.07) return q.x>.083?.12:.88; if(q.x<-.102) return .5; if(q.x<-.088) return fract(q.x/.003)<.35?.3:.7; return .6; }
  return .7; }
