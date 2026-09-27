/* Room "Me, My Family, My Class" — pencil still life: a small wooden toy house with a door,
   windows and a chimney (home and family), a brass school hand bell (the class), and three
   crayons lying in front. */
#define CAM_POS vec3(-0.3991,0.2683,-0.6296)
#define CAM_TGT vec3(-0.1797,0.0017,0.0608)
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
#define HS vec3(-.05,0.,.07)
#define BL vec3(.15,0.,.05)
vec3 hsQ(vec3 p){ return place(p,HS,.4); }
float houseD(vec3 p){ vec3 q=hsQ(p);
  float body=sdRBox(q-vec3(0.,.05,0.),vec3(.07,.05,.055),.003);
  vec3 r=q-vec3(0.,.1,0.); float roof=max(abs(r.z)*.9+r.y-.05,-r.y); roof=max(roof,abs(r.x)-.078);
  roof-=.003;
  float chim=sdRBox(q-vec3(.035,.14,.02),vec3(.009,.022,.009),.001);
  float d=min(min(body,roof),chim);
  /* door and windows cut in the front (-z) */
  float door=sdBox(q-vec3(-.02,.024,-.056),vec3(.012,.024,.004));
  float w1=sdBox(q-vec3(.03,.06,-.056),vec3(.013,.012,.003));
  d=max(d,-min(door,w1));
  float w2=sdBox(q-vec3(-.071,.06,0.),vec3(.003,.012,.014)); d=max(d,-w2);
  return d; }
float bellD(vec3 p){ vec3 q=p-BL;
  float y=q.y; float u=clamp(1.-y/.075,0.,1.); float r=.017+.03*u*u*u+.008*u;
  float body=(length(q.xz)-r)*.8; body=max(body,abs(y-.035)-.035); body=max(body,-(length(q.xz)-r+.003)*.8+(y<.004?1.:-1.)*1.);
  body=max((length(q.xz)-r)*.8,abs(y-.035)-.035);
  float lip=sdTorus(q-vec3(0.,.002,0.),.045,.003);
  float collar=sdCylY(q-vec3(0.,.074,0.),.013,.005)-.002;
  float handle=sdCapsule(q,vec3(0.,.08,0.),vec3(0.,.15,0.),.011);
  float knob=length(q-vec3(0.,.155,0.))-.014;
  return min(min(body,lip),min(collar,min(handle,knob))); }
float crayon(vec3 p,vec3 c,float a){ vec3 q=place(p,c,a); float R=.0055;
  float body=sdCylX(q,R,.04); float tip=sdCone(q.yxz-vec3(0.,.048,0.),R,.0015,.008); return min(body,tip)-.0003; }
float crayonsD(vec3 p){ return min(min(crayon(p,vec3(.02,.0058,-.12),.2),crayon(p,vec3(.06,.0058,-.14),-.35)),crayon(p,vec3(.1,.0058,-.11),.6)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,houseD(p),3.);
  r=U(r,bellD(p),4.);
  r=U(r,crayonsD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hsQ(p); if(q.y>.1&&abs(q.x)<.08) return fract((q.y+abs(q.z)*.9)/.01)<.3?.3:.55; return .82; }
  if(id==4.){ vec3 q=p-BL; if(q.y>.078) return .4+.12*grain(q.yxz,90.); return .55; }
  if(id==5.) return .4;
  return .7; }
