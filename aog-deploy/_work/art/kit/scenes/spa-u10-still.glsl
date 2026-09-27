/* Spanish Unit 10 "Numbers, Time and Dates" — pencil still life: a flip desk calendar on a
   wire loop showing a grid of days, an open pocket watch on its chain, and number blocks 4 and 5. */
#define CAM_POS vec3(-0.3075,0.2253,-0.6363)
#define CAM_TGT vec3(-0.1136,-0.0074,0.0854)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define CB vec3(.05,0.,.06)
vec3 cq(vec3 p){ vec3 q=p-CB; q.xz=rot(-.25)*q.xz; return q; }
/* an easel calendar: a triangular board with pages hanging from rings on its top edge */
float cal(vec3 q){ vec3 f=q; f.z=abs(f.z-.0);
  vec2 u=vec2(f.z,f.y); vec2 dir=normalize(vec2(.06,-.16)); float t=clamp(dot(u-vec2(0.,.16),dir),0.,.171);
  float board=max(length(u-vec2(0.,.16)-dir*t)-.003,abs(q.x)-.1);
  return board; }
vec3 pq(vec3 q){ vec3 r=q-vec3(0.,.16,-.004); r.yz=rot(-.36)*r.yz; return r; }   /* on the front face, y down the page */
float pages(vec3 q){ vec3 r=pq(q); return sdRBox(r-vec3(0.,-.083,-.004),vec3(.095,.08,.002+.0),.001); }
float rings(vec3 q){ float d=1e5; for(int i=0;i<7;i++){ float x=-.08+float(i)*.0267; d=min(d,sdTorus((q-vec3(x,.162,-.002)).yxz,.007,.0015)); } return d; }
float watch(vec3 p){ vec3 q=p-vec3(-.15,.009,-.04); q.xz=rot(.4)*q.xz;
  float c=sdCylY(q,.036,.005)-.004; float bow=sdTorus((q-vec3(0.,0.,.05)).xzy,.009,.0025); float crown=sdCylZ(q-vec3(0.,0.,.04),.005,.005);
  vec3 l=q-vec3(0.,.0,-.036); l.yz=rot(-1.3)*l.yz; float lid=sdCylY(l-vec3(0.,0.,-.036),.036,.002)-.002;
  float chain=1e5; for(int i=0;i<9;i++){ float fi=float(i); vec3 k=q-vec3(.02+fi*.012,-.006,.06+.012*sin(fi*.8)); k.xz=rot(fi*1.57)*k.xz; chain=min(chain,sdTorus(k.xzy,.004,.0012)); }
  return min(min(min(c,bow),min(crown,lid)),chain); }
#define BH .034
#define B1 vec3(.21,BH,-.06)
#define B2 vec3(.275,BH,-.02)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=cq(p);
  r=U(r,cal(q),3.);
  r=U(r,pages(q),4.);
  r=U(r,rings(q),5.);
  r=U(r,watch(p),6.);
  r=U(r,lblock(p,B1,-.3,BH,52,53),7.);
  r=U(r,lblock(p,B2,-.1,BH,53,52),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 r=pq(cq(p)); vec2 u=vec2(r.x,-r.y-.083);
    if(u.y<-.05){ return abs(u.y+.065)<.004&&abs(u.x)<.04?.2:.5; }                   /* month band */
    vec2 g=vec2((u.x+.09)/.0257,(u.y+.045)/.025); if(g.x>0.&&g.x<7.&&g.y>0.&&g.y<5.){ vec2 f=fract(g);
      if(f.x<.07||f.y<.08) return .45; if(floor(g.x)==3.&&floor(g.y)==2.){ if(abs(length(f-.5)-.36)<.07) return .15; }  /* one day circled */
      if(f.x>.55&&f.x<.8&&f.y>.2&&f.y<.35) return .55; }
    return .95; }
  if(id==5.) return .3;
  if(id==6.){ vec3 q=p-vec3(-.15,.009,-.04); q.xz=rot(.4)*q.xz; float r=length(q.xz);
    if(q.y>.004&&r<.032&&q.z>-.04){ float a=atan(q.x,q.z); if(sdSeg2(q.xz,vec2(0.),vec2(0.,.022))<.0015||sdSeg2(q.xz,vec2(0.),vec2(.014,-.004))<.002) return .1;
      if(r>.025&&abs(fract(a/(PI/6.)+.5)-.5)<.06) return .2; return .95; } return .45; }
  if(id==7.) return lblockInk(p,B1,-.3,BH,52,53);
  if(id==8.) return lblockInk(p,B2,-.1,BH,53,52);
  return .7; }
