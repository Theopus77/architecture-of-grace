/* Room "Measuring the Economy" — pencil still life: a woven shopping basket with a loaf of
   bread and a milk bottle in it (a basket of goods), and a wooden bar-chart model: four bars
   rising on a base board. */
#define CAM_POS vec3(-0.3259,0.2894,-0.5505)
#define CAM_TGT vec3(-0.1280,0.0280,0.0571)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define BS vec3(-.06,0.,.06)
#define CH vec3(.17,0.,-.03)
vec3 bsQ(vec3 p){ return place(p,BS,.25); }
float basketD(vec3 p){ vec3 q=bsQ(p);
  float outer=sdRBox(q-vec3(0.,.045,0.),vec3(.1+.1*.0,.045,.065),.012);
  outer=sdRBox(q-vec3(0.,.045,0.),vec3(.09+.12*q.y*.3,.045,.058+.12*q.y*.3),.012);
  float inner=sdRBox(q-vec3(0.,.055,0.),vec3(.084,.05,.052),.01);
  float d=max(outer,-inner);
  d=min(d,sdTorus((q-vec3(0.,.09,0.)).xzy*vec3(1.,1.,1.),.0,.0)+1e3);
  vec3 h=q-vec3(0.,.09,0.); float handle=max(length(vec2(length(h.xy)-.085,h.z))-.006,-h.y);
  return min(d,handle); }
float loafD(vec3 p){ vec3 q=bsQ(p)-vec3(-.03,.085,.01); q.xy=rot(.35)*q.xy;
  float d=sdEll(q,vec3(.065,.035,.04));
  for(int i=0;i<3;i++){ float x=-.03+float(i)*.03; d=max(d,-(length(vec2(q.x-x-q.z*.3,q.y-.034))-.005)); }
  return d; }
float milkD(vec3 p){ vec3 q=bsQ(p)-vec3(.04,.02,-.005); q.xy=rot(-.2)*q.xy;
  float body=sdCylY(q-vec3(0.,.05,0.),.024,.05)-.003;
  float sh=sdCone(q-vec3(0.,.112,0.),.025,.014,.014);
  float cap=sdCylY(q-vec3(0.,.13,0.),.015,.005)-.001;
  return min(smin(body,sh,.008),cap); }
float chartD(vec3 p,out float k){ vec3 q=place(p,CH,-.3); k=0.;
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.09,.006,.035),.002);
  float d=base;
  for(int i=0;i<4;i++){ float h=.03+.025*float(i)+.008*sin(float(i)*2.); float x=-.063+float(i)*.042;
    float b=sdRBox(q-vec3(x,.012+h*.5,0.),vec3(.015,h*.5,.015),.002);
    if(b<d){ d=b; k=float(i)+1.; } }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,basketD(p),3.);
  r=U(r,loafD(p),4.);
  r=U(r,milkD(p),5.);
  float k; r=U(r,chartD(p,k),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bsQ(p); float u=abs(n.x)>abs(n.z)?q.z:q.x; float w=fract(u/.012+step(.5,fract(q.y/.012))*.5); float v=fract(q.y/.012);
    if(v<.18) return .3; return w<.2?.35:.62; }
  if(id==4.) return .55;
  if(id==5.){ vec3 q=bsQ(p)-vec3(.04,.02,-.005); if(q.y>.124) return .35; return .9; }
  if(id==6.){ float k; chartD(p,k); return k<.5?.45:mod(k,2.)<.5?.75:.55; }
  return .7; }
