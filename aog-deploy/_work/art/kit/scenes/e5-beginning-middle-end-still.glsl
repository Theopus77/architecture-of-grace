/* Practice room "Beginning, Middle, End" — pencil still life: three candles in little holders,
   one tall and new, one burned halfway, one a short stub (a story from start to finish), with a
   closed storybook lying behind them. */
#define CAM_POS vec3(-0.2768,0.3380,-0.6431)
#define CAM_TGT vec3(-0.1648,-0.0223,0.1075)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define BK vec3(.04,0.,.13)
#define BS vec3(.13,.02,.09)
vec3 cpos(int i){ return i==0?vec3(-.1,0.,-.02):i==1?vec3(.02,0.,-.05):vec3(.14,0.,-.03); }
float chH(int i){ return i==0?.17:i==1?.1:.035; }
float holderD(vec3 q){ float r=length(q.xz); float d=max(abs(q.y-.006-r*r*1.5)-.003,r-.042)-.001;
  d=min(d,sdCylY(q-vec3(0.,.012,0.),.018,.008)-.002);
  vec3 h=q-vec3(.05,.008,0.); d=min(d,length(vec2(length(h.xy)-.012,h.z))-.003);
  return d; }
float candleD(vec3 q,int i){ float H=chH(i); vec3 c=q-vec3(0.,.02,0.);
  float d=sdCylY(c-vec3(0.,H*.5,0.),.0145,H*.5)-.001;
  float top=H+.02; if(i>0){ d=max(d,-(sdCylY(q-vec3(0.,top,0.),.009,.004)));
    d=min(d,sdCapsule(q,vec3(.013,top-.002,.004),vec3(.0152,top-.016-float(i)*.006,.004),.003)); }
  return d; }
float wickD(vec3 q,int i){ float top=chH(i)+.02; return sdCapsule(q,vec3(0.,top-.004,0.),vec3(.001,top+.009,0.),.0012); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=p-BK; b.xz=rot(-.1)*b.xz;
  r=U(r,bookD(b,BS),3.);
  for(int i=0;i<3;i++){ vec3 q=p-cpos(i); q.xz=rot(float(i)*.7)*q.xz;
    r=U(r,holderD(q),4.); r=U(r,candleD(q,i),5.); r=U(r,wickD(q,i),6.); }
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 b=p-BK; b.xz=rot(-.1)*b.xz; if(b.y>2.*BS.y-.002){ 
      if(abs(abs(b.x)-.1)<.002&&abs(b.z)<.065||abs(abs(b.z)-.065)<.002&&abs(b.x)<.1) return .35; return .55; }
    if(b.x>-BS.x+.01&&b.y<2.*BS.y-.004&&b.y>.004) return .88; return .45; }
  if(id==4.) return .5;
  if(id==5.) return .92;
  if(id==6.) return .15;
  return .7; }
