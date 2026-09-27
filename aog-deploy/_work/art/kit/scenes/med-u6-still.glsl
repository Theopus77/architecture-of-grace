/* Medicine and Health Unit 6 "Medicine East and West" — pencil still life: an old leather
   doctor's bag with a metal frame and handle, beside a round lidded herb jar and a small
   tea bowl. */
#define CAM_POS vec3(-0.3332,0.3158,-0.6940)
#define CAM_TGT vec3(-0.2093,0.0098,0.0494)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define BG vec3(-.04,0.,.07)
#define JR vec3(.15,0.,.0)
#define BW vec3(.06,0.,-.1)
vec3 bagQ(vec3 p){ return place(p,BG,.28); }
float bagD(vec3 p){ vec3 q=bagQ(p);
  float w=mix(.135,.115,clamp(q.y/.13,0.,1.));             /* a little narrower at the top */
  float dz=mix(.06,.012,smoothstep(.05,.14,q.y));           /* sides pinch in to the frame */
  float d=sdRBox(q-vec3(0.,.07,0.),vec3(w,.07,dz+.012),.022);
  d+=.0015*fbm(q.xy*90.);
  return d; }
float frameD(vec3 p){ vec3 q=bagQ(p);
  float d=sdCapsule(q,vec3(-.11,.138,0.),vec3(.11,.138,0.),.006);
  d=min(d,sdRBox(q-vec3(0.,.14,-.014),vec3(.012,.008,.004),.002));     /* clasp */
  vec3 h=q-vec3(0.,.15,0.);
  float hd=length(vec2(length(vec2(h.x*.6,max(h.y,0.)))-.034,h.z))-.0065; hd=max(hd,-h.y);
  d=min(d,hd);
  d=min(d,sdCylY(q-vec3(-.055,.148,0.),.009,.008)-.001);
  d=min(d,sdCylY(q-vec3(.055,.148,0.),.009,.008)-.001);
  return d; }
float jarD(vec3 p){ vec3 q=p-JR;
  float b=sdEll(q-vec3(0.,.05,0.),vec3(.052,.052,.052)); b=max(b,.004-q.y); b=max(b,q.y-.09);
  b=smin(b,sdCylY(q-vec3(0.,.006,0.),.034,.006),.008);
  b=min(b,sdCylY(q-vec3(0.,.092,0.),.03,.006)-.002);
  return b; }
float lidD(vec3 p){ vec3 q=p-JR;
  float l=sdEll(q-vec3(0.,.1,0.),vec3(.036,.014,.036)); l=max(l,.099-q.y);
  l=min(l,sdTorus(q-vec3(0.,.1,0.),.035,.003));
  l=min(l,length(q-vec3(0.,.118,0.))-.008);
  return l; }
float bowlD(vec3 p){ vec3 q=p-BW; float o=sdEll(q-vec3(0.,.045,0.),vec3(.042,.042,.042)); o=max(o,q.y-.045); o=max(o,.004-q.y);
  float i=sdEll(q-vec3(0.,.047,0.),vec3(.037,.038,.037)); float d=max(o,-i);
  d=min(d,sdCylY(q-vec3(0.,.004,0.),.018,.004)); return min(d,sdTorus(q-vec3(0.,.045,0.),.0395,.0022)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bagD(p),3.);
  r=U(r,frameD(p),4.);
  r=U(r,jarD(p),5.);
  r=U(r,lidD(p),6.);
  r=U(r,bowlD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bagQ(p); float w=mix(.135,.115,clamp(q.y/.13,0.,1.));
    if(abs(abs(q.x)-(w-.018))<.0018||abs(q.y-.02)<.0015) return .25;   /* stitched seams */
    return .42+.08*fbm(q.xy*60.); }
  if(id==4.) return .75;
  if(id==5.){ vec3 q=p-JR; float a=atan(q.z,q.x);
    if(abs(q.y-.05)<.018){ float v=abs(fract(a*1.2732)-.5); if(abs(abs(q.y-.05)-v*.03)<.002) return .35; }   /* a painted zigzag band */
    if(abs(abs(q.y-.05)-.02)<.0015) return .35; return .85; }
  if(id==6.) return .8;
  if(id==7.){ vec3 q=p-BW; if(abs(q.y-.035)<.002) return .4; return .85; }
  return .7; }
