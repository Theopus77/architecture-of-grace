/* Spanish Unit 18 "The Subjunctive" — pencil still life of hopes and wishes (espero que...): a
   round cake with three unlit candles, a wrapped gift box with a ribbon bow, and a paper star. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.05,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define CK vec3(.04,0.,.06)
float cake(vec3 p){ vec3 q=p-CK;
  float plate=max(abs(q.y-(.004+.006*smoothstep(.1,.13,length(q.xz))))-.0022,length(q.xz)-.13);
  float body=sdCylY(q-vec3(0.,.05,0.),.1,.042)-.004;
  float icing=sdTorus(q-vec3(0.,.097,0.),.098,.006);
  float drips=1e5; for(int i=0;i<16;i++){ float a=float(i)*.3927; vec3 c=q-vec3(.103*cos(a),.085-.008*sin(float(i)*2.7),.103*sin(a)); drips=min(drips,(length(c/vec3(.006,.014,.006))-1.)*.006); }
  float candles=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.094+.6; vec3 c=q-vec3(.05*cos(a),.12,.05*sin(a));
    candles=min(candles,sdCylY(c,.005,.022)); candles=min(candles,sdCapsule(c,vec3(0.,.022,0.),vec3(0.,.028,0.),.0008)); }
  return min(min(plate,smin(body,min(icing,drips),.004)),candles); }
#define GB vec3(-.16,0.,-.01)
vec3 gq(vec3 p){ vec3 q=p-GB; q.xz=rot(.35)*q.xz; return q; }
float gift(vec3 p){ vec3 q=gq(p); float box=sdRBox(q-vec3(0.,.045,0.),vec3(.05,.045,.045),.004);
  float lid=sdRBox(q-vec3(0.,.093,0.),vec3(.053,.009,.048),.003);
  float rib=min(max(sdRBox(q-vec3(0.,.05,0.),vec3(.055,.053,.052),.004),abs(q.x)-.007),max(sdRBox(q-vec3(0.,.05,0.),vec3(.055,.053,.052),.004),abs(q.z)-.007));
  vec3 b=q-vec3(0.,.108,0.); float bow=min((length((b-vec3(-.017,.006,0.))/vec3(.018,.01,.008))-1.)*.008,(length((b-vec3(.017,.006,0.))/vec3(.018,.01,.008))-1.)*.008);
  bow=min(bow,length(b)-.007);
  return min(min(box,lid),min(rib,bow)); }
float star(vec3 p){ vec3 q=p-vec3(.21,.004,-.08); q.xz=rot(.3)*q.xz; vec2 u=q.xz; float a=atan(u.y,u.x); float r=length(u);
  float k=abs(fract(a/(2.*PI/5.))-.5)*2.; float R=mix(.017,.04,k*k*.0+k); return max(r-R,abs(q.y)-.0025)-.001; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cake(p),3.);
  r=U(r,gift(p),4.);
  r=U(r,star(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-CK; if(q.y>.105) return length(q.xz)<.06&&q.y>.13?.12:(fract(q.y/.008)<.5?.4:.8);   /* striped candles */
    if(q.y<.012) return .9; if(abs(q.y-.05)<.005) return .5; return q.y>.08?.95:.7; }
  if(id==4.){ vec3 q=gq(p); if(abs(q.x)<.008||abs(q.z)<.008||q.y>.1) return .3; return mod(floor((q.x+q.y)/.02),2.)<1.?.65:.85; }
  if(id==5.) return .6;
  return .7; }
