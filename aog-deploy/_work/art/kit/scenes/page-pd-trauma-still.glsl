/* Professional Development · Trauma-Informed Reflection — pencil still life: a small wooden window
   frame standing on the table, a soft band shaded across its middle panes (the window of
   tolerance), and a sprout in a pot beside it. Hint-lines only. */
#define CAM_POS vec3(-0.3060,0.2936,-0.4642)
#define CAM_TGT vec3(-0.1196,0.0379,0.0747)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define WN vec3(.0,0.,.1)
#define PT vec3(.17,0.,-.02)
float windowD(vec3 p){ vec3 q=P(p,WN,.15); float W=.1,H=.15;
  float outer=sdRBox(q-vec3(0.,H*.5+.012,0.),vec3(W,H*.5,.012),.003);
  float hole=sdBox(q-vec3(0.,H*.5+.012,0.),vec3(W-.014,H*.5-.014,.02));
  float fr=max(outer,-hole);
  float mul=min(sdRBox(q-vec3(0.,H*.5+.012,0.),vec3(.005,H*.5,.008),.002),sdRBox(q-vec3(0.,H*.5+.012,0.),vec3(W,.005,.008),.002));
  float sill=sdRBox(q-vec3(0.,.006,-.012),vec3(W+.02,.006,.03),.003);
  float glass=sdBox(q-vec3(0.,H*.5+.012,.002),vec3(W-.013,H*.5-.013,.0012));
  return min(min(fr,mul),min(sill,glass)); }
float windowT(vec3 p){ vec3 q=P(p,WN,.15); float y=q.y-.087;
  if(abs(q.z-.002)<.004&&abs(q.x)<.086&&abs(y)<.062){
    if(abs(abs(y)-.028)<.0025) return .4;               /* the two edges of the band */
    if(abs(y)<.028) return .72;                         /* the band, gently shaded */
    return .93; }
  return .55+.1*grain(q,30.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,windowD(p),3.);
  r=U(r,pot(P(p,PT,0.),.03,.05),4.);
  r=U(r,sprout(P(p,PT+vec3(0.,.045,0.),.3),.06,.03,3.),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return windowT(p);
  if(id==4.) return potT(P(p,PT,0.),.03,.05);
  if(id==5.) return .45;
  return .7; }
