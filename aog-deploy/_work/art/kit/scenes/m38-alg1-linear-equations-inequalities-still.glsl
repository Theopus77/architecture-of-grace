/* m38 "Algebra I: Linear Equations and Inequalities" — a pan balance tipped to one side (a heavy
   weight on the low pan, one small block on the high pan), and a wooden number-line strip with an
   open ring on one mark and an arrow piece pointing along the line. */
#define CAM_POS vec3(-0.7791,0.4220,-0.9870)
#define CAM_TGT vec3(-0.2930,0.0273,0.1670)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.45,1.3,-.35)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_mid.glsl"
#define BHT .25
#define BA .14
#define BL .15
#define TILT .2
vec3 blQ(vec3 p){ return place(p,vec3(.04,0.,.14),-.12); }
vec3 panC(float s){ vec3 e=balEnd(BHT,BA,TILT,s); return vec3(e.x,e.y-BL+.004,0.); }
float loadL(vec3 p){ vec3 q=blQ(p)-panC(-1.); return sdRBox(q-vec3(0.,.016,0.),vec3(.014),.002); }
float loadR(vec3 p){ vec3 q=blQ(p)-panC(1.); return weightD(q-vec3(0.,.002,0.),.028); }
/* number-line strip lying in front, along x, with ticks; a ring on one mark, an arrow beyond it */
vec3 nlQ(vec3 p){ return place(p,vec3(-.05,0.,-.1),-.3); }
float strip(vec3 p){ vec3 q=nlQ(p); return sdRBox(q-vec3(0.,.005,0.),vec3(.2,.006,.03),.002); }
float ring(vec3 p){ vec3 q=nlQ(p)-vec3(-.06,.015,0.); return sdTorus(q,.015,.0045); }
float arrow(vec3 p){ vec3 q=nlQ(p)-vec3(.06,.015,0.); q.xz*=.75;
  float sh=sdRBox(q-vec3(-.02,0.,0.),vec3(.05,.003,.005),.002);
  vec2 u=q.xz-vec2(.035,0.); float hd=max(max(-u.x,u.x*.55+abs(u.y)-.016),-.0);
  hd=max(u.x-.03+abs(u.y)*1.8,-u.x); float h=extrude(hd,q.y,.003)-.001;
  return min(sh,h); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=balanceD(blQ(p),BHT,BA,TILT,BL);
  r=U(r,b.x,3.);
  r=U(r,b.y,4.);
  r=U(r,loadL(p),5.);
  r=U(r,loadR(p),6.);
  r=U(r,strip(p),7.);
  r=U(r,min(ring(p),arrow(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return .7;
  if(id==5.) return .8;
  if(id==6.) return .45;
  if(id==7.){ vec3 q=nlQ(p); if(n.y>.7){ if(abs(q.z)<.0012&&abs(q.x)<.185) return .25;
      if(gridLn(q.x,.03)<.0012&&abs(q.z)<.012&&abs(q.x)<.185) return .25; } return .82; }
  if(id==8.) return .35;
  return .7; }
