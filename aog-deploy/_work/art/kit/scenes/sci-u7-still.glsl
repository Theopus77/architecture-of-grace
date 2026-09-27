/* Science Unit 7 "Life: Cycles, Traits and Survival" — pencil still life: three clay pots in
   a row showing a life cycle: a seed just sprouting, a young plant, and a grown plant in flower. */
#define CAM_POS vec3(-0.7835,0.3830,-1.0184)
#define CAM_TGT vec3(-0.3182,0.0401,0.2064)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
float potD(vec3 q,float s){ q/=s;
  float body=sdCone(q-vec3(0.,.05,0.),.045,.06,.05)-.002;
  body=max(body,-(sdCylY(q-vec3(0.,.11,0.),.052,.02)));
  float rim=sdCylY(q-vec3(0.,.095,0.),.067,.011)-.003; rim=max(rim,-sdCylY(q-vec3(0.,.1,0.),.056,.03));
  return min(body,rim)*s; }
float soilD(vec3 q,float s){ q/=s; return (sdCylY(q-vec3(0.,.083,0.),.056,.006)+.002*fbm(q.xz*80.))*s; }
float leaf(vec3 q,vec3 base,float ay,float tilt,float L){
  vec3 l=q-base; l.xz=rot(ay)*l.xz; l.xy=rot(tilt)*l.xy; l.y+=.25*l.x*l.x/L;
  return .6*sdEll(l-vec3(L*.5,0.,0.),vec3(L*.5,.005,L*.3)); }
#define P1 vec3(-.25,0.,.02)
#define P2 vec3(.0,0.,.05)
#define P3 vec3(.27,0.,.08)
vec2 pots(vec3 p){ return vec2(min(min(potD(p-P1,.85),potD(p-P2,1.)),potD(p-P3,1.15)),min(min(soilD(p-P1,.85),soilD(p-P2,1.)),soilD(p-P3,1.15))); }
vec2 plants(vec3 p){
  vec3 a=p-P1; float seed=sdEll(a-vec3(0.,.078,0.),vec3(.012,.009,.009));
  float sprout=sdCapsule(a,vec3(.003,.078,0.),vec3(.008,.1,0.),.002);
  sprout=min(sprout,leaf(a,vec3(.008,.1,0.),.3,.5,.025)); sprout=min(sprout,leaf(a,vec3(.008,.1,0.),3.4,.5,.022));
  vec3 b=p-P2; float y=sdCapsule(b,vec3(0.,.08,0.),vec3(.004,.17,0.),.0035);
  y=min(y,leaf(b,vec3(.003,.12,0.),.3,.5,.07)); y=min(y,leaf(b,vec3(.003,.125,0.),3.4,.5,.065));
  y=min(y,leaf(b,vec3(.004,.165,0.),1.6,.8,.055)); y=min(y,leaf(b,vec3(.004,.165,0.),-1.4,.8,.05));
  vec3 c=p-P3; float g=sdCapsule(c,vec3(0.,.09,0.),vec3(.006,.31,-.004),.005);
  g=min(g,leaf(c,vec3(.004,.14,0.),.2,.55,.11)); g=min(g,leaf(c,vec3(.003,.15,0.),3.4,.5,.1));
  g=min(g,leaf(c,vec3(.005,.2,0.),1.8,.6,.095)); g=min(g,leaf(c,vec3(.005,.21,0.),-1.3,.6,.09));
  g=min(g,leaf(c,vec3(.006,.26,0.),.7,.7,.075)); g=min(g,leaf(c,vec3(.006,.26,0.),3.8,.7,.07));
  vec3 f=c-vec3(.006,.315,-.006); f.yz=rot(-.5)*f.yz;
  float petals=1e5; float an=atan(f.z,f.x); float s=6.2832/10.; float aa=mod(an+s*.5,s)-s*.5; vec2 pp=length(f.xz)*vec2(cos(aa),sin(aa));
  petals=.7*sdEll(vec3(pp.x-.03,f.y-.004*pp.x/.03,pp.y),vec3(.026,.004,.009));
  float centre=sdEll(f-vec3(0.,.005,0.),vec3(.017,.009,.017));
  return vec2(min(min(seed,sprout),min(y,g)),min(petals,centre)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 a=pots(p); r=U(r,a.x,3.); r=U(r,a.y,4.);
  vec2 b=plants(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .5; if(id==4.) return .2; if(id==5.) return .45;
  if(id==6.){ vec3 f=p-P3-vec3(.006,.315,-.006); return length(f)<.02?.3:.88; }
  return .7; }
