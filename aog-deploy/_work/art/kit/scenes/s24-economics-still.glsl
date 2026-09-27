/* s24 "Economics" — a small easel holding a board with a supply and demand chart (two lines
   crossing on a pair of axes), a few stacks of coins and a paper price tag on a string. */
#define CAM_POS vec3(-0.5554,0.2959,-0.5930)
#define CAM_TGT vec3(-0.1567,0.0148,0.1029)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "roomparts_e.glsl"
#define BY .11
vec3 eQ(vec3 p){ return plc(p,vec3(0.,0.,.06),-.45); }
vec3 bdQ(vec3 p){ vec3 q=eQ(p)-vec3(0.,BY,-.028); q.yz=rot(-.2)*q.yz; return q; }
float board(vec3 p){ vec3 q=bdQ(p); return sdRBox(q,vec3(.085,.075,.005),.003); }
float chart(vec3 p){ vec3 q=bdQ(p); vec2 u=q.xy;
  float ax=min(sdSeg2(u,vec2(-.062,-.058),vec2(-.062,.058)),sdSeg2(u,vec2(-.062,-.058),vec2(.068,-.058)));
  if(ax<.0022) return .12;
  if(sdSeg2(u,vec2(-.05,.05),vec2(.06,-.045))<.0028) return .2;       /* demand, falling */
  if(sdSeg2(u,vec2(-.05,-.045),vec2(.06,.05))<.0028) return .2;       /* supply, rising */
  if(abs(u.x-.005)<.0012&&u.y<.002&&u.y>-.058&&fract(u.y/.008)<.5) return .45;  /* dotted drop line */
  if(abs(u.y-.002)<.0012&&u.x<.005&&u.x>-.062&&fract(u.x/.008)<.5) return .45;
  return .93; }
vec3 jQ(vec3 p){ return p-vec3(.17,0.,-.03); }
float coinsIn(vec3 p){ vec3 q=jQ(p); float d=1e5;
  for(int i=0;i<9;i++){ float fi=float(i); vec3 c=q-vec3(.018*sin(fi*2.4),.008+fi*.0055,.018*cos(fi*2.4));
    vec3 cc=c; cc.xy=rot(.3*sin(fi*1.3))*cc.xy; cc.yz=rot(.3*cos(fi*1.9))*cc.yz;
    d=min(d,sdCylY(cc,.016,.0015)-.0005); }
  return d; }
vec3 tQ(vec3 p){ return plc(p,vec3(.06,0.,-.1),.4)*.75; }
float string(vec3 p){ vec3 q=tQ(p); return sdCapsule(q,vec3(.022,.002,0.),vec3(.06,.0015,.02),.0012); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,easelE(eQ(p),BY,-.2),3.);
  r=U(r,board(p),4.);
  r=U(r,min(coinStackE(jQ(p),.022,.0038,9),coinStackE(jQ(p)-vec3(.035,0.,.035),.022,.0038,5)),7.);
  r=U(r,coinStackE(jQ(p)-vec3(.05,0.,-.02),.022,.0038,2),6.);
  r=U(r,tagE(tQ(p)),8.);
  r=U(r,string(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 q=bdQ(p); if(q.z<-.003) return chart(p); return .45; }
  if(id==5.) return .92;
  if(id==6.) return .6;
  if(id==7.) return .5;
  if(id==8.){ vec3 q=tQ(p); if(abs(q.z)<.012&&q.x<.01&&q.x>-.03&&fract(q.z/.008)<.28) return .5; return .9; }
  if(id==9.) return .3;
  return .7; }
