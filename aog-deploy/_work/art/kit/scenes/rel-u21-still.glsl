/* World Religions Unit 21 "Sikhism, Jainism, and the Traditions of Africa and the Americas"
   (The Kitchen With No Head of the Table) — pencil still life of a langar, the free shared
   meal: a large round cooking pot with a long ladle, a stack of round flatbreads, and a steel
   plate with two small bowls. No figures. */
#define CAM_POS vec3(-0.4549,0.5124,-0.9882)
#define CAM_TGT vec3(-0.2888,-0.0223,0.1260)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define PT vec3(-.03,0.,.1)
#define TH vec3(.18,0.,-.04)
#define RT vec3(-.22,0.,-.05)
float pot(vec3 q){ float y=q.y; float r=.1+.018*sin(clamp(y/.14,0.,1.)*2.6)-.02*smoothstep(.12,.15,y);
  float d=(length(q.xz)-r)*.85; d=max(d,max(-y,y-.15)); d=max(d,-max(length(q.xz)-r+.005,.01-y));
  float lip=sdTorus(q-vec3(0,.15,0),.083,.007);
  float ladle=sdCapsule(q,vec3(.02,.1,.01),vec3(-.06,.27,-.02),.005);
  return min(min(d,lip),ladle); }
float thali(vec3 q){ float r=length(q.xz);
  float plate=max(abs(q.y-.004-.008*smoothstep(.07,.1,r))-.002,r-.1); plate=min(plate*.8,sdTorus(q-vec3(0,.012,0),.1,.0025));
  float b1=bowlD(q-vec3(-.04,.006,.025),.045,.03), b2=bowlD(q-vec3(.045,.006,.02),.045,.03);
  float f1=sdCylY(q-vec3(-.04,.028,.025),.034,.002), f2=sdCylY(q-vec3(.045,.028,.02),.034,.002); b1=min(b1,f1); b2=min(b2,f2);
  return min(plate,min(b1,b2)); }
float rotis(vec3 q){ float d=1e5;
  for(int i=0;i<5;i++){ float f=float(i); vec3 c=q-vec3(.004*sin(f*2.),.003+f*.0045,.004*cos(f*1.3));
    float r=length(c.xz); d=min(d,max(abs(c.y-.0015*sin(c.x*40.+f))-.0018,r-.065+.002*sin(atan(c.z,c.x)*5.+f))-.0006); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pot(L(p,PT,.3)),3.);
  r=U(r,thali(L(p,TH,.2)),4.);
  r=U(r,rotis(L(p,RT,0.)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,PT,.3); if(q.y>.155) return .3; if(abs(q.y-.04)<.002) return .35; if(q.y>.12&&length(q.xz)<.085) return .35; return .5; }
  if(id==4.){ vec3 q=L(p,TH,.2); float r1=length(q.xz-vec2(-.04,.025)), r2=length(q.xz-vec2(.045,.02)); float rb=min(r1,r2);
    if(q.y>.026&&q.y<.031&&rb<.035) return r1<r2?.5+.15*fbm(q.xz*120.):.78;   /* dal and rice */
    if(q.y>.033&&rb<.05) return .3;                                           /* bowl rims */
    if(rb<.047&&q.y>.012) return .72;                                         /* bowl sides */
    if(q.y<.014&&length(q.xz)>.09) return .45; return .6; }
  if(id==5.){ vec3 q=L(p,RT,0.); float a=.72; if(n.y>.8&&fbm(q.xz*90.)>.6) a=.45; return a; }
  return .7; }
