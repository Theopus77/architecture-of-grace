/* Home door "Privacy & your data" — pencil still life: a small closed notebook with a ribbon marker,
   a padlock resting on its cover, a key beside it and a pencil. No writing. */
#define CAM_POS vec3(-0.3161,0.2349,-0.5360)
#define CAM_TGT vec3(-0.1173,-0.0373,0.0383)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define BK vec3(0.,.018,.03)
#define BKR .15
#define BH vec3(.12,.018,.085)
#define LK vec3(.02,.036,.035)
#define LKR -.25
#define KY vec3(.17,.0035,-.1)
#define KYR -.6
#define PN vec3(.02,.0068,-.12)
/* the notebook */
vec2 book(vec3 p){ vec3 q=P(p,BK,BKR); return bookC(q,BH); }
float bookT(vec3 p){ vec3 q=P(p,BK,BKR); return bookCT(q,BH,.5); }
/* the ribbon marker: a flat strip hanging out past the pages at the front */
float ribD(vec3 p){ vec3 q=P(p,BK,BKR); vec3 r=q-vec3(.04,0.,-BH.z-.02);
  r.y+=clamp(-r.z,0.,.03)*.55; return sdRBox(r,vec3(.006,.0008,.024),.0006); }
/* the padlock: a rounded body standing on the cover, a shackle arch above it */
float lockD(vec3 p){ vec3 q=P(p,LK,LKR);
  float body=sdRBox(q-vec3(0.,.026,0.),vec3(.03,.024,.011),.005);
  vec3 s=q-vec3(0.,.05,0.); float arch=length(vec2(length(s.xy)-.019,s.z))-.0042;
  arch=max(arch,-s.y); float legs=length(vec2(abs(s.x)-.019,s.z))-.0042; legs=max(legs,max(s.y,-s.y-.006));
  return min(body,min(arch,legs)); }
float lockT(vec3 p){ vec3 q=P(p,LK,LKR);
  if(q.y>.05) return .45;                                                       /* the steel shackle */
  vec2 k=vec2(q.x,q.y-.022); if(q.z<-.009&&(length(k)<.005||(abs(k.x)<.0018&&k.y<0.&&k.y>-.012))) return .15;  /* the keyhole */
  return .55; }
/* the key: a ring bow, a shaft and two teeth */
float keyD(vec3 p){ vec3 q=P(p,KY,KYR);
  float bow=length(vec2(length(q.xz+vec2(.035,0.))-.014,q.y))-.0035;
  float sh=sdRBox(q-vec3(.012,0.,0.),vec3(.034,.0025,.0035),.001);
  float t1=sdRBox(q-vec3(.036,0.,.008),vec3(.0035,.0025,.006),.0008);
  float t2=sdRBox(q-vec3(.026,0.,.007),vec3(.003,.0025,.005),.0008);
  return min(min(bow,sh),min(t1,t2)); }
float keyT(vec3 p){ return .5; }
float pen(vec3 p){ vec3 q=p-PN; q.xz=rot(.25)*q.xz; return pencilL(q,.09); }
float penT(vec3 p){ vec3 q=p-PN; q.xz=rot(.25)*q.xz; return pencilT(q,.09); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=book(p);
  r=U(r,b.x,3.);
  r=U(r,b.y,4.);
  r=U(r,ribD(p),5.);
  r=U(r,lockD(p),6.);
  r=U(r,keyD(p),7.);
  r=U(r,pen(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.||id==4.) return bookT(p);
  if(id==5.) return .35;
  if(id==6.) return lockT(p);
  if(id==7.) return keyT(p);
  if(id==8.) return penT(p);
  return .7; }
