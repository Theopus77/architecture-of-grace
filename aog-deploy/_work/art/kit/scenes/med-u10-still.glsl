/* Medicine Unit 10 "The Germ Revolution" — pencil still life: an old glass flask with a
   swan neck and cotton plug, two glass petri dishes (one with round mould colonies), and a
   small glass dropper bottle. */
#define CAM_POS vec3(-0.4308,0.2371,-0.9203)
#define CAM_TGT vec3(-0.2035,0.0303,0.1034)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define FC vec3(-.02,0.,.08)
float flask(vec3 p){ vec3 q=p-FC;
  float body=length(q-vec3(0.,.085,0.))-.085;
  body=smax(body,-q.y+.004,.01);
  float neck=sdCylY(q-vec3(0.,.2,0.),.022,.05)-.003;
  float lip=sdTorus(q-vec3(0.,.252,0.),.024,.005);
  float d=smin(body,neck,.03); d=min(d,lip);
  return d; }
float plug(vec3 p){ vec3 q=p-FC-vec3(0.,.262,0.); return length(q*vec3(1.,1.4,1.))-.02+.002*vn3(p*300.); }
float dish(vec3 p,vec3 c,float hasLid){ vec3 q=p-c; float r=length(q.xz);
  float base=max(abs(r-.07)-.002,abs(q.y-.008)-.008); base=min(base,sdCylY(q-vec3(0.,.001,0.),.07,.001));
  float lid=max(abs(r-.074)-.002,abs(q.y-.012)-.006); lid=min(lid,sdCylY(q-vec3(0.,.018,0.),.074,.0012));
  return min(base,hasLid>0.?lid:1e3)-.0005; }
float gel(vec3 p,vec3 c){ vec3 q=p-c; return sdCylY(q-vec3(0.,.005,0.),.067,.003); }
#define D1 vec3(.17,0.,-.1)
#define D2 vec3(.27,0.,.03)
float bottle(vec3 p){ vec3 q=p-vec3(-.17,0.,-.02);
  float b=sdCylY(q-vec3(0.,.04,0.),.025,.04)-.004;
  float sh=sdCone(q-vec3(0.,.09,0.),.027,.012,.012)-.002;
  float bulb=length((q-vec3(0.,.13,0.))*vec3(1.,.7,1.))-.014;
  float col=sdCylY(q-vec3(0.,.106,0.),.013,.006)-.001;
  return min(min(b,sh),min(bulb,col)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,flask(p),3.);
  r=U(r,plug(p),4.);
  r=U(r,dish(p,D1,0.),5.);
  r=U(r,dish(p,D2,1.),6.);
  r=U(r,gel(p,D1),7.);
  r=U(r,bottle(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-FC; if(q.y<.07&&q.y>.03) return .55; return .82; }
  if(id==4.) return .9;
  if(id==5.||id==6.) return .85;
  if(id==7.){ vec3 q=p-D1; float c=min(length(q.xz-vec2(.02,.015))-.012,min(length(q.xz-vec2(-.025,-.01))-.009,length(q.xz-vec2(.01,-.035))-.007));
    if(abs(c)<.0015) return .25; if(c<0.) return .45; return .7; }
  if(id==8.){ vec3 q=p-vec3(-.17,0.,-.02); if(q.y>.1) return .3; if(q.y>.03&&q.y<.06) return .92; return .45; }
  return .7; }
