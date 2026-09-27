/* World Religions Unit 1 "Families and Their Special Days" — pencil still life: a lit candle
   in a brass candlestick, a round ribbed paper lantern, and a small wrapped gift box tied
   with a ribbon and bow. No figures. */
#define CAM_POS vec3(-0.5553,0.6680,-1.2272)
#define CAM_TGT vec3(-0.3503,0.0072,0.1494)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define CS vec3(-.13,0.,.04)
#define LT vec3(.07,0.,.1)
#define GB vec3(.14,0.,-.08)
float lantern2(vec3 q){
  /* a paper lantern sitting on its base ring: a squashed sphere with ribs, top and bottom caps */
  vec3 c=q-vec3(0,.085,0);
  float a=atan(c.z,c.x); float rib=.0015*pow(abs(cos(a*9.)),6.);
  float b=length(c*vec3(1.,1.18,1.))-.085-rib;
  float bh=abs(c.y)-.066; b=max(b,bh);
  float capT=sdCylY(c-vec3(0,.068,0),.034,.005)-.001, capB=sdCylY(c+vec3(0,.068,0),.034,.005)-.001;
  float loop=sdTorus((c-vec3(0,.085,0)).xzy,.011,.0022);
  return min(min(b*.9,capT),min(capB,loop)); }
float gift(vec3 q){
  float b=sdRBox(q-vec3(0,.04,0),vec3(.055,.04,.05),.003);
  float lid=sdRBox(q-vec3(0,.078,0),vec3(.059,.008,.054),.002);
  float rb=min(sdBox(q-vec3(0,.043,0),vec3(.01,.044,.055)),sdBox(q-vec3(0,.043,0),vec3(.06,.044,.01)))-.0008;
  vec3 k=q-vec3(0,.09,0);
  float bow=min(length((k-vec3(-.017,.004,0))*vec3(1.,1.6,2.2))-.018,length((k-vec3(.017,.004,0))*vec3(1.,1.6,2.2))-.018)*.5;
  float knot=length(k)-.007;
  return min(min(b,lid),min(rb,min(bow,knot))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 c=L(p,CS,0.)/1.25;
  r=U(r,holderD(c)*1.25,3.);
  r=U(r,candleD(c,.098,.16,.0135)*1.25,4.);
  r=U(r,tear(c-vec3(.0015,.268,0),.05,.0105)*1.25,5.);
  r=U(r,lantern2(L(p,LT,.2)),6.);
  r=U(r,gift(L(p,GB,-.35)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,CS,0.)/1.25; if(abs(q.y-.05)<.003) return .35; return .5; }
  if(id==4.){ vec3 q=L(p,CS,0.)/1.25; return q.y>.255?.2:.9; }
  if(id==5.) return .97;
  if(id==6.){ vec3 q=L(p,LT,.2)-vec3(0,.085,0); if(abs(q.y)>.064) return .3; float a=atan(q.z,q.x);
    if(abs(cos(a*9.))>.985) return .45; if(abs(fract(q.y/.022)-.5)<.05) return .7; return .9; }
  if(id==7.){ vec3 q=L(p,GB,-.35); if(abs(q.x)<.0105||abs(q.z)<.0105||q.y>.087) return .35;
    float s=fract((q.x+q.y+q.z)/.02); return s<.2?.62:.8; }
  return .7; }
