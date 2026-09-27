/* Math Unit 14 "Expressions, Equations and Inequalities" — pencil still life: a pan balance
   held level, with a small bag on one pan and three weights on the other. */
#define CAM_POS vec3(-0.3822,0.2873,-0.8743)
#define CAM_TGT vec3(-0.2557,0.0662,0.1147)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BC vec3(.03,0.,.1)
vec3 bQ(vec3 p){ vec3 q=p-BC; q.xz=rot(.1)*q.xz; return q; }
#define PX .14
#define PY .13
float pan(vec3 q){ /* shallow dish at q=0 */
  float r=length(q.xz); float y=q.y-.02*(r/.07)*(r/.07);
  float dish=max(abs(y)-.0025,r-.07);
  float chains=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.094+.4; vec3 top=vec3(0.,.12,0.); vec3 bot=vec3(cos(a)*.066,.02,sin(a)*.066);
    chains=min(chains,sdCapsule(q,top,bot,.0015)); }
  return min(dish,chains); }
vec2 balance(vec3 p){ vec3 q=bQ(p);
  float base=sdCylY(q-vec3(0.,.01,0.),.07,.01)-.003;
  base=min(base,sdCone(q-vec3(0.,.035,0.),.035,.014,.02));
  float post=sdCylY(q-vec3(0.,.15,0.),.009,.12);
  float beam=sdRBox(q-vec3(0.,.265,0.),vec3(PX+.01,.006,.008),.003);
  float knob=length(q-vec3(0.,.285,0.))-.014;
  float pointer=sdCapsule(q,vec3(0.,.265,-.012),vec3(0.,.21,-.012),.003);
  float frame=min(min(base,post),min(min(beam,knob),pointer));
  float pans=min(pan(q-vec3(-PX,PY,0.)),pan(q-vec3(PX,PY,0.)));
  return vec2(frame,pans); }
float weights(vec3 p){ vec3 q=bQ(p)-vec3(PX,PY+.0035,0.); float d=1e5;
  vec3 a=q-vec3(-.02,0.,.01); d=min(d,min(sdCylY(a-vec3(0.,.02,0.),.018,.02)-.002,sdCylY(a-vec3(0.,.046,0.),.006,.006)-.001)+0.);
  d=min(d,min(sdCylY(a-vec3(0.,.046,0.),.006,.006),length(a-vec3(0.,.057,0.))-.009));
  vec3 b=q-vec3(.025,0.,-.012); d=min(d,sdCylY(b-vec3(0.,.014,0.),.014,.014)-.002); d=min(d,length(b-vec3(0.,.036,0.))-.007);
  vec3 c=q-vec3(.02,0.,.03); d=min(d,sdCylY(c-vec3(0.,.01,0.),.011,.01)-.002); d=min(d,length(c-vec3(0.,.026,0.))-.006);
  return d; }
float bag(vec3 p){ vec3 q=bQ(p)-vec3(-PX,PY+.03,0.);
  float b=length(q*vec3(1.,1.15,1.))/1.15-.034; float neck=sdCylY(q-vec3(0.,.035,0.),.008,.01);
  float tuft=length((q-vec3(0.,.05,0.))*vec3(1.,1.6,1.))/1.6-.012;
  return smin(smin(b,neck,.01),tuft,.006); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=balance(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,weights(p),5.);
  r=U(r,bag(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.) return .7;
  if(id==5.) return .3;
  if(id==6.) return .8+.08*fbm(p.xy*200.);
  return .7; }
