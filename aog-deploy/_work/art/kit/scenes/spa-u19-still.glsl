/* Spanish Unit 19 "The Spanish-Speaking World and Register" — pencil still life: a large desk
   globe on a turned wooden stand, a passport-sized travel book, and two postcards fanned out. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.06,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define GL vec3(.03,0.,.08)
#define GR .12
/* the globe is turned to show the Americas facing us */
vec3 gq(vec3 p){ vec3 q=p-GL-vec3(0.,.18,0.); q.xy=rot(.41)*q.xy; q.xz=rot(-.2)*q.xz; return q; }
float land(vec3 q){ vec3 n=normalize(q); float lat=asin(clamp(n.y,-1.,1.)), lon=atan(n.x,-n.z);
  /* rough outline of North, Central and South America, plus the west edge of Europe/Africa, as blobs */
  float d=1e5;
  d=min(d,length((vec2(lon,lat)-vec2(-.35,.8))/vec2(.55,.35))-1.);
  d=min(d,length((vec2(lon,lat)-vec2(-.15,.45))/vec2(.3,.22))-1.);
  d=min(d,length((vec2(lon,lat)-vec2(.05,.22))/vec2(.1,.14))-1.);
  d=min(d,length((vec2(lon,lat)-vec2(.3,-.2))/vec2(.28,.38))-1.);
  d=min(d,length((vec2(lon,lat)-vec2(.4,-.6))/vec2(.14,.3))-1.);
  d=min(d,length((vec2(lon,lat)-vec2(1.35,.5))/vec2(.2,.3))-1.);
  d=min(d,length((vec2(lon,lat)-vec2(1.45,.05))/vec2(.3,.35))-1.);
  return -(d+(fbm(vec2(lon,lat)*6.)-.5)*.6); }
float globe(vec3 p){ return length(gq(p))-GR; }
float stand(vec3 p){ vec3 q=p-GL;
  float base=sdCone(q-vec3(0.,.012,0.),.08,.06,.012)-.002; float ring=sdTorus(q-vec3(0.,.026,0.),.05,.006);
  float neck=sdCylY(q-vec3(0.,.045,0.),.01+.004*sin(q.y*120.),.02);
  vec3 m=q-vec3(0.,.18,0.); m.xy=rot(.41)*m.xy;
  float mer=max(abs(length(m.xy)-GR-.01)-.003,abs(m.z)-.005); mer=max(mer,m.x-.02);
  float pin=sdCylY(m,.003,GR+.02);
  return min(min(min(base,ring),neck),min(mer,pin)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,globe(p),3.);
  r=U(r,stand(p),4.);
  vec2 b=flatBook(p,vec3(-.16,.007,-.05),vec3(.045,.007,.063),.3); r=U(r,b.x,b.y>.5?6.:5.);
  vec3 c=p-vec3(.2,.0015,-.07); c.xz=rot(-.25)*c.xz; r=U(r,sdRBox(c,vec3(.07,.0015,.045),.001),7.);
  vec3 d=p-vec3(.22,.0045,-.05); d.xz=rot(.15)*d.xz; r=U(r,sdRBox(d,vec3(.07,.0015,.045),.001),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gq(p); float l=land(q); if(abs(l)<.025) return .2; vec3 nn=normalize(q);
    if(abs(fract(asin(nn.y)/.35+.5)-.5)<.02) return .6; if(abs(fract(atan(nn.x,-nn.z)/.5+.5)-.5)<.012) return .6; return l>0.?.52:.9; }
  if(id==4.) return .38;
  if(id==5.){ vec3 q=p-vec3(-.16,.007,-.05); q.xz=rot(.3)*q.xz; if(q.y>.005&&length(q.xz-vec2(0.,.01))<.018) return abs(length(q.xz-vec2(0.,.01))-.016)<.002?.8:.3; return .3; }
  if(id==6.) return .9;
  if(id==7.) return .85;
  if(id==8.){ vec3 d=p-vec3(.22,.0045,-.05); d.xz=rot(.15)*d.xz; if(d.y>.001){ if(abs(d.x-.045)<.012&&abs(d.z-.022)<.014) return .4;
      if(d.x<.0&&d.z>-.04&&d.z<.035) return .55+.2*sin(d.x*200.); if(abs(fract((d.z+.04)/.014)-.5)<.1&&d.x>.01&&d.x<.06&&d.z<.0) return .5; } return .93; }
  return .7; }
