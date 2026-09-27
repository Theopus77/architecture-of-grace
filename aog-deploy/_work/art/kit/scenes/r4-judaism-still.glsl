/* r4 "Judaism: Torah, Talmud and a People" — an open Torah scroll on its two wooden rollers
   (columns of hint-lines only, no script), a stack of two thick bound volumes, and a pair of
   candlesticks with candles. Objects only: no people, no symbols. */
#define CAM_POS vec3(-0.8348,0.7529,-0.8044)
#define CAM_TGT vec3(-0.3474,-0.0588,0.2008)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_mid.glsl"
#define RX .13
#define RR .03
#define RL .08
vec3 scQ(vec3 p){ return place(p,vec3(.0,0.,-.02),-1.05); }
float rolls(vec3 q){ float d=1e5; for(int i=0;i<2;i++){ float s=i==0?-1.:1.;
    vec3 r=q-vec3(s*RX,RR,0.); d=min(d,sdCylZ(r,RR,RL)-.0015); } return d; }
float parch(vec3 q){ float x=abs(q.x); float y=.0015+.004*smoothstep(RX-.04,RX,x);
  return max(sdBox(q-vec3(0.,y,0.),vec3(RX,.0012,RL-.004)),0.); }
float poles(vec3 q){ float d=1e5; for(int i=0;i<2;i++){ float s=i==0?-1.:1.;
    vec3 r=q-vec3(s*RX,RR,0.);
    d=min(d,sdCylZ(r,.0065,RL+.07));
    for(int k=0;k<2;k++){ float e=k==0?-1.:1.;
      d=min(d,sdCylZ(r-vec3(0.,0.,e*(RL+.012)),RR+.012,.004)-.0015);      /* round discs at the ends of the parchment */
      d=min(d,length((r-vec3(0.,0.,e*(RL+.07)))*vec3(1.,1.,.8))-.011); } } /* knob handles */
  return d; }
/* two thick volumes stacked */
float books(vec3 p){ float d=bookD(place(p,vec3(-.06,0.,.24),.3),vec3(.1,.028,.075));
  return min(d,bookD(place(p,vec3(-.05,.056,.245),.15),vec3(.092,.025,.07))); }
float sticks(vec3 p){ return min(candlestickD(p-vec3(.17,0.,.2),.115),candlestickD(p-vec3(.25,0.,.16),.115)); }
float candles(vec3 p){ return min(candleD(p-vec3(.17,0.,.2),.119,.065),candleD(p-vec3(.25,0.,.16),.119,.065)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=scQ(p);
  r=U(r,rolls(q),3.);
  r=U(r,parch(q),4.);
  r=U(r,poles(q),5.);
  r=U(r,books(p),6.);
  r=U(r,sticks(p),7.);
  r=U(r,candles(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .8;
  if(id==4.){ vec3 q=scQ(p); float a=.9;
    /* three columns of fine hint-lines */
    for(int c=0;c<3;c++){ float cx=(float(c)-1.)*.055;
      if(abs(q.x-cx)<.021&&abs(q.z)<.065&&fract(q.z/.0075)<.3) a=.45; }
    return a; }
  if(id==5.) return .45+.1*grain(scQ(p),50.);
  if(id==6.){ if(abs(n.y)<.5&&n.x>.3) return fract(p.y/.004)<.3?.72:.88; return .38; }
  if(id==7.) return .55;
  if(id==8.) return .9;
  return .7; }
