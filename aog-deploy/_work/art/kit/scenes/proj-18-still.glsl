/* FACS project 18 "Build-your-own hoagie" — pencil still life: a long hoagie roll cut in half
   on a slant, the two halves pulled apart on a wooden board so the layers show (cheese, folded
   meat, lettuce and tomato), each half held with a toothpick, and a tomato slice beside it. */
#define CAM_POS vec3(-0.3828,0.3693,-0.6636)
#define CAM_TGT vec3(-0.1727,-0.0010,0.1180)
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
#define BD vec3(.0,0.,.04)
#define HR .2
vec3 bL(vec3 p){ vec3 q=p-BD; q.xz=rot(HR)*q.xz; return q; }
float board(vec3 p){ vec3 q=bL(p); return sdRBox(q-vec3(0.,.009,0.),vec3(.2,.009,.08),.006); }
/* sandwich-local: x along the roll; the slant cut is the plane x+.6z=0; halves pulled apart */
vec3 hL(vec3 p,out float side){ vec3 q=bL(p)-vec3(0.,.018,-.005); side=sign(q.x+.6*q.z+.0001);
  q.x-=side*.032; q.z-=side*.012; return q; }
float cutPlane(vec3 q,float side){ return -side*(q.x+.6*q.z)/1.166; }
float bread(vec3 q){ vec3 b=q-vec3(0.,.04,0.);
  float d=sdEll(b,vec3(.15,.04,.04));
  d=max(d,-q.y+.001);
  float gap=abs(q.y-.033)-.0095;                                   /* the filling sits between */
  return max(d,-gap); }
float fill(vec3 q){ vec3 b=q-vec3(0.,.033,0.);
  float w=.047+.003*sin(q.x*90.)+.002*sin(q.x*230.+q.y*50.);
  float d=max(sdEll(b,vec3(.148,.02,w)),abs(q.y-.033)-.0095);
  return d; }
vec2 sand(vec3 p){ float s; vec3 q=hL(p,s); float cp=cutPlane(q,s);
  float end=abs(q.x)-.16;
  vec2 r=vec2(max(max(bread(q),cp),end),3.);
  float f=max(max(fill(q),cp),end);
  float id=q.y<.028?5.:q.y<.033?4.:q.y<.038?6.:7.;
  r=U(r,f,id);
  vec3 t=q-vec3(s*.08,.0,0.); r=U(r,min(sdCapsule(t,vec3(0.,.02,0.),vec3(0.,.098,0.),.003),length(t-vec3(0.,.1,0.))-.008),8.);
  return r; }
float tomato(vec3 p){ vec3 q=p-vec3(.2,.004,-.1); return sdCylY(q,.028,.0035)-.001; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),9.);
  vec3 q=bL(p); float bd=sdRBox(q-vec3(0.,.07,0.),vec3(.24,.065,.07),.0);
  if(bd>.01) r.x=min(r.x,bd); else r=U(r,sand(p));
  r=U(r,tomato(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ float s; vec3 q=hL(p,s); return abs(cutPlane(q,s))<.002?.9-.08*vn3(p*700.):.58-.06*vn3(p*200.); }  /* soft crumb at the cut, golden crust */
  if(id==4.) return .9;                                   /* cheese */
  if(id==5.) return .42+.1*sin(p.x*600.);                  /* folded meat */
  if(id==6.) return .6+.2*step(.5,vn3(p*500.));            /* lettuce */
  if(id==7.){ vec3 q=p-vec3(.2,.004,-.1); float a=atan(q.z,q.x); return (length(q.xz)<.02&&abs(fract(a*.955)-.5)<.12)?.7:.3; }
  if(id==8.) return .85;
  if(id==9.) return .72-.06*grain(p,40.);
  return .7; }
