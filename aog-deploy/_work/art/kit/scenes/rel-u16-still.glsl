/* World Religions Unit 16 "Judaism: Torah, Talmud and a People" (Eighteen Minutes Before
   Sunset) — pencil still life of a Sabbath table: two lit candles in brass candlesticks, a
   braided challah loaf, and a stemmed kiddush cup. No figures, no writing. */
#define CAM_POS vec3(-0.4121,0.5727,-1.0617)
#define CAM_TGT vec3(-0.2346,0.0012,0.1292)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define C1 vec3(-.08,0.,.12)
#define C2 vec3(.05,0.,.15)
#define CH vec3(-.02,0.,-.07)
#define KC vec3(.2,0.,.0)
#define CS 1.15
float challah(vec3 q){
  float Lh=.13; float x=q.x; float t=clamp(x/Lh,-1.,1.); float taper=sqrt(max(1.-t*t,0.))*.85+.15;
  float d=1e5;
  for(int i=0;i<3;i++){ float ph=float(i)*2.094; float w=x*38.+ph;
    float yc=(.022+.008*sin(w))*taper, zc=.022*cos(w)*taper; float r=.019*taper;
    d=min(d,length(vec2(q.y-yc,q.z-zc))-r); }
  d=max(d*.7,abs(x)-Lh-.01);
  return max(d,-q.y); }
float cstick(vec3 q){ return min(holderD(q/CS)*CS,candleD(q/CS,.098,.15,.0125)*CS); }
float cflame(vec3 q){ return tear(q/CS-vec3(.0015,.258,0),.05,.0105)*CS; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,min(cstick(L(p,C1,0.)),cstick(L(p,C2,0.))),3.);
  r=U(r,min(cflame(L(p,C1,0.)),cflame(L(p,C2,0.))),4.);
  r=U(r,challah(L(p,CH,.2)),5.);
  r=U(r,gobletD(L(p,KC,0.)/1.2)*1.2,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-C1; if(length(p.xz-C2.xz)<length(p.xz-C1.xz)) q=p-C2; q/=CS;
    if(q.y>.1) return q.y>.244?.2:.9; return abs(q.y-.05)<.003?.35:.5; }
  if(id==4.) return .97;
  if(id==5.){ vec3 q=L(p,CH,.2); return .5+.2*smoothstep(.02,.04,q.y)+.08*(fbm(q.xz*80.)-.5); }
  if(id==6.){ vec3 q=L(p,KC,0.)/1.2; if(abs(q.y-.11)<.003) return .35; return .45; }
  return .7; }
