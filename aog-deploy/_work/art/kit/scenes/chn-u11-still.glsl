/* Chinese Classics Unit 11 "The Classics Through History" — pencil still life: the imperial
   exam candidate's night of study: a tall candle in a bronze candlestick with a drip tray, a
   folded accordion exam book standing half open, and an ink stone with its ink stick. */
#define CAM_POS vec3(-0.4748,0.2946,-1.0468)
#define CAM_TGT vec3(-0.2176,0.0373,0.1111)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define CS vec3(-.1,0.,.16)
float stick(vec3 p){ vec3 q=p-CS; float r=length(q.xz);
  float base=max(abs(q.y-.012+r*.08)-.006,r-.06)-.002;
  float col=sdCone(q-vec3(0.,.07,0.),.012,.008,.06);
  col=smin(col,length((q-vec3(0.,.065,0.))/vec3(1.,.5,1.))*.5-.009,.008);
  float tray=max(abs(q.y-.132-(r*r)*2.)-.003,r-.045)-.001;
  float d=min(base,smin(col,tray,.006));
  return d; }
float candle(vec3 p){ vec3 q=p-CS; float d=sdCylY(q-vec3(0.,.2,0.),.016,.065)-.001;
  d=max(d,-(length(q-vec3(0.,.274,0.))-.012));
  d=smin(d,sdCapsule(q,vec3(.016,.25,0.),vec3(.018,.2,-.002),.004),.003);   /* a wax drip */
  return d; }
float wick(vec3 p){ vec3 q=p-CS; return sdCapsule(q,vec3(0.,.262,0.),vec3(.001,.275,0.),.0012); }
float flame(vec3 p){ vec3 q=p-CS-vec3(0.,.275,0.);
  float t=clamp((q.y+.004)/.045,0.,1.); float r=.0095*pow(sin(3.1416*pow(t,.62)),.8)*(1.-.15*t);
  return max(length(q.xz)-r,max(-q.y-.004,q.y-.041))*.7; }
/* accordion book: panels zig-zag along x, standing on the table */
#define AB vec3(.1,0.,.24)
float accordion0(vec3 p){ vec3 q=p-AB; q.xz=rot(-.3)*q.xz;
  float pw=.045; float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); float s=mod(fi,2.)<.5?1.:-1.;
    vec3 c=q-vec3(fi*pw*.82,0.,0.); vec2 u=c.xz; u=rot(s*.6)*u;
    d=min(d,sdBox(vec3(u.x-pw*.45,c.y-.075,u.y),vec3(pw*.45,.075,.0015))); }
  d=min(d,sdRBox(q-vec3(-.03,.078,.0),vec3(.004,.078,.012),.002)*1.+1.); /* (no board) */
  return d-.0008; }
float accordion(vec3 p){ return accordion0((p-AB)/1.6+AB)*1.6; }
#define IS vec3(.22,0.,-.1)
float inkstone(vec3 p){ vec3 q=p-IS; q.xz=rot(-.25)*q.xz;
  float d=sdRBox(q-vec3(0.,.014,0.),vec3(.065,.014,.09),.007);
  d=max(d,-sdRBox(q-vec3(0.,.03,-.01),vec3(.05,.007,.065),.018));
  d=max(d,-(length((q-vec3(0.,.026,.06))*vec3(1.,1.,1.6))-.03));
  return d; }
float inkstick(vec3 p){ vec3 q=p-IS; q.xz=rot(-.25)*q.xz; q-=vec3(-.1,.012,-.02); q.xz=rot(.3)*q.xz;
  return sdRBox(q,vec3(.012,.012,.055),.003); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stick(p),3.);
  r=U(r,candle(p),4.);
  r=U(r,wick(p),5.);
  r=U(r,flame(p),6.);
  r=U(r,accordion(p),7.);
  r=U(r,inkstone(p),8.);
  r=U(r,inkstick(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4+.1*fbm(p.xy*80.);
  if(id==4.) return .88;
  if(id==5.) return .1;
  if(id==6.) return .97;
  if(id==7.){ vec3 q=(p-AB)/1.6; q.xz=rot(-.3)*q.xz; float a=.93;
    float x=fract(q.x/.008); if(q.y>.02&&q.y<.13&&x<.18) a=.66;
    if(abs(q.y-.14)<.0015||abs(q.y-.012)<.0015) a=.45; return a; }
  if(id==8.){ vec3 q=p-IS; return q.y<.022?.35:.22; }
  if(id==9.) return .15;
  return .7; }
