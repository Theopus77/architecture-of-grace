/* m24 "Decimals" — base-ten blocks showing one whole, two tenths and three hundredths (a flat,
   two rods and three small cubes), and a tape measure with its tape pulled out. */
#define CAM_POS vec3(-0.2253,0.2046,-0.4469)
#define CAM_TGT vec3(-0.0847,-0.0486,0.0256)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define U1 .012
float grooved(vec3 q,vec3 n,float r){ return sdRBox(q,n*U1,r); }
vec3 flQ(vec3 p){ vec3 q=p-vec3(-.05,U1*.5,.06); q.xz=rot(.18)*q.xz; return q; }
float flat_(vec3 p){ vec3 q=flQ(p); float d=sdRBox(q,vec3(5.*U1,.5*U1,5.*U1),.0015);
  vec2 g=abs(fract((q.xz+5.*U1)/U1)-.5); float gr=min(g.x,g.y)*U1-.0006;
  if(abs(q.x)<5.*U1-.001&&abs(q.z)<5.*U1-.001) d=max(d,-max(gr,-(q.y-.5*U1+.0008)));
  return d; }
vec3 rdQ(vec3 p,int i){ vec3 q=p-vec3(.1+float(i)*.022,U1*.5,.03-float(i)*.006); q.xz=rot(1.6)*q.xz; return q; }
float rod(vec3 p,int i){ vec3 q=rdQ(p,i); float d=sdRBox(q,vec3(5.*U1,.5*U1,.5*U1),.0012);
  float g=abs(fract((q.x+5.*U1)/U1)-.5)*U1-.0006; d=max(d,-max(g,-(max(abs(q.y),abs(q.z))-.5*U1+.0008)));
  return d; }
float units(vec3 p){ float d=1e5; for(int i=0;i<3;i++){ vec3 q=place(p,vec3(.17+float(i)*.018,U1*.5,-.06+float(i)*.012),float(i)*.4); d=min(d,sdRBox(q,vec3(.5*U1),.0012)); } return d; }
#define TM vec3(-.02,0.,-.1)
float tcase(vec3 p){ vec3 q=place(p,TM,-.3);
  float c=sdRBox(q-vec3(0.,.026,0.),vec3(.026,.026,.012),.005);
  float btn=sdRBox(q-vec3(0.,.054,0.),vec3(.008,.003,.005),.002);
  float hook=sdRBox(q-vec3(.028,.004,0.),vec3(.003,.004,.009),.001);
  return min(min(c,btn),hook); }
float tape(vec3 p){ vec3 q=place(p,TM,-.3); return sdBox(q-vec3(.094,.0007,0.),vec3(.066,.0006,.0085)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,flat_(p),3.);
  r=U(r,rod(p,0),4.);
  r=U(r,rod(p,1),5.);
  r=U(r,units(p),6.);
  r=U(r,tcase(p),7.);
  r=U(r,tape(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id>=3.&&id<=6.) return .8;
  if(id==7.){ vec3 q=place(p,TM,-.3); if(abs(q.z)>.016){ float r=length(q.xy-vec2(0.,.026)); if(abs(r-.016)<.0015) return .3; } return .45; }
  if(id==8.){ vec3 q=place(p,TM,-.3); float x=q.x-.028; float t=fract(x/.004);
    if(t<.15&&q.z>.0) return .2; if(fract(x/.02)<.06) return .2; return .88; }
  return .7; }
