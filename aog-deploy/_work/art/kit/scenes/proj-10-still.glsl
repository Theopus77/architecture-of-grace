/* FACS project 10 "Drawstring bag by hand" — pencil still life: a finished cotton drawstring bag
   standing on the table, pulled shut so the top gathers into soft folds, the cord ends hanging
   down the front with knots, with a thimble and a threaded needle beside it. */
#define CAM_POS vec3(-0.5786,0.5116,-0.9806)
#define CAM_TGT vec3(-0.2722,0.0455,0.1601)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define BG vec3(.0,0.,.05)
float bagR(float y,float a){
  float body=.088*sqrt(clamp(y/.035,0.,1.))*(1.-.35*smoothstep(.06,.17,y));
  float neck=mix(body,.028,smoothstep(.15,.185,y));
  float fl=mix(neck,.05,smoothstep(.19,.225,y));
  float pleat=(.001+.007*smoothstep(.09,.19,y))*sin(a*11.+y*25.);
  return fl+pleat; }
float bag(vec3 p){ vec3 q=p-BG; float a=atan(q.z,q.x);
  float d=length(q.xz)-bagR(q.y,a);
  d=max(d,abs(q.y-.12)-.12);
  d=max(d,q.y-.228-.004*sin(a*11.));
  return d*.6; }
float cord(vec3 p){ vec3 q=p-BG;
  float d=sdTorus(q-vec3(0.,.185,0.),.033,.0048);
  vec3 a=vec3(.005,.185,-.036);
  vec3 e1=vec3(-.03,.1,-.078), e2=vec3(.035,.09,-.076);
  d=min(d,sdCapsule(q,a,vec3(-.015,.15,-.06),.0045)); d=min(d,sdCapsule(q,vec3(-.015,.15,-.06),e1,.0045));
  d=min(d,sdCapsule(q,a,vec3(.022,.145,-.058),.0045)); d=min(d,sdCapsule(q,vec3(.022,.145,-.058),e2,.0045));
  d=min(d,length(q-e1)-.0095); d=min(d,length(q-e2)-.0095);
  return d; }
float thimble(vec3 p){ vec3 q=p-vec3(.13,0.,-.06);
  float d=sdCylY(q-vec3(0.,.012,0.),.011-.0015*q.y/.024,.012)-.002;
  d=smin(d,length(q-vec3(0.,.024,0.))-.0095,.004);
  d+=.0005*step(.5,fract(q.y*300.))*step(.5,fract(atan(q.z,q.x)*6.));
  return d; }
float needle(vec3 p){ vec3 q=p-vec3(.1,.0018,-.12); q.xz=rot(.25)*q.xz;
  float d=sdCapsule(q,vec3(-.035,0.,0.),vec3(.035,0.,0.),.0017);
  float thr=sdCapsule(q,vec3(-.03,.0,0.),vec3(-.05,0.,.02),.0008);
  thr=min(thr,sdCapsule(q,vec3(-.05,0.,.02),vec3(-.09,0.,.015),.0008));
  return min(d,thr); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bag(p),3.);
  r=U(r,cord(p),4.);
  r=U(r,thimble(p),5.);
  r=U(r,needle(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BG; if(abs(q.y-.17)<.0015||abs(q.y-.2)<.0015) return .45;
    return .74-.14*step(.5,fract((q.x+q.y)*60.))*step(.5,fract((q.x-q.y)*60.)); }   /* a small check print */
  if(id==4.) return .32;
  if(id==5.) return .55;
  if(id==6.) return .45;
  return .7; }
