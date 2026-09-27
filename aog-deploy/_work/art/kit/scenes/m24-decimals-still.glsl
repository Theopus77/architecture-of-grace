/* m24 "Decimals" — base-ten blocks showing one whole, two tenths and three hundredths (a flat,
   two rods and three small cubes), and a tape measure with its tape pulled out. */
#define CAM_POS vec3(-0.2408,0.2824,-0.4703)
#define CAM_TGT vec3(-0.0851,0.0021,0.0529)
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
#define SA 1.42
vec3 fK(vec3 p){ vec3 k=p-vec3(-.06,0.,.08); k.xz=rot(-.2)*k.xz; return k; }
vec3 flQ(vec3 p){ vec3 k=fK(p); vec3 v=vec3(0.,sin(SA),cos(SA)), n=vec3(0.,cos(SA),-sin(SA));
  return vec3(k.x,dot(k,n)+.5*U1,dot(k,v)-5.*U1-.012); }
float flat_(vec3 p){ vec3 q=flQ(p); float d=sdRBox(q,vec3(5.*U1,.5*U1,5.*U1),.0015);
  vec2 g=abs(fract((q.xz+5.*U1)/U1)-.5); float gr=min(g.x,g.y)*U1-.0006;
  if(abs(q.x)<5.*U1-.001&&abs(q.z)<5.*U1-.001) d=max(d,-max(gr,-(q.y-.5*U1+.0008)));
  vec3 k=fK(p); float base=sdRBox(k-vec3(0.,.008,.0),vec3(.075,.008,.022),.003);
  return min(d,base); }
vec3 rdQ(vec3 p,int i){ vec3 q=p-vec3(.05+float(i)*.026,5.*U1+.0005,.07-float(i)*.01); q.xz=rot(-.2+float(i)*.3)*q.xz; return q.yxz; }
float rod(vec3 p,int i){ vec3 q=rdQ(p,i); float d=sdRBox(q,vec3(5.*U1,.5*U1,.5*U1),.0012);
  float g=abs(fract((q.x+5.*U1)/U1)-.5)*U1-.0006; d=max(d,-max(g,-(max(abs(q.y),abs(q.z))-.5*U1+.0008)));
  return d; }
float units(vec3 p){ float d=1e5; for(int i=0;i<3;i++){ vec3 q=place(p,vec3(.04+float(i)*.02,U1*.5,-.03+float(i)*.008),float(i)*.4); d=min(d,sdRBox(q,vec3(.5*U1),.0012)); } return d; }
#define TM vec3(.12,0.,-.05)
float tcase(vec3 p){ vec3 q=place(p,TM,-.6);
  float c=sdRBox(q-vec3(0.,.026,0.),vec3(.026,.026,.012),.005);
  float btn=sdRBox(q-vec3(0.,.054,0.),vec3(.008,.003,.005),.002);
  float hook=sdRBox(q-vec3(.028,.004,0.),vec3(.003,.004,.009),.001);
  return min(min(c,btn),hook); }
float tape(vec3 p){ vec3 q=place(p,TM,-.6); return sdBox(q-vec3(.07,.0007,0.),vec3(.042,.0006,.0085)); }
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
  if(id==7.){ vec3 q=place(p,TM,-.6); if(abs(q.z)>.016){ float r=length(q.xy-vec2(0.,.026)); if(abs(r-.016)<.0015) return .3; } return .45; }
  if(id==8.){ vec3 q=place(p,TM,-.6); float x=q.x-.028; float t=fract(x/.004);
    if(t<.15&&q.z>.0) return .2; if(fract(x/.02)<.06) return .2; return .88; }
  return .7; }
