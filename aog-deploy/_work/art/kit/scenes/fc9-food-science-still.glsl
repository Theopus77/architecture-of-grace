/* Practice room "Food Science — What Happens When You Cook" — pencil still life: a mixing bowl
   with a kneaded ball of dough rising above the rim, a wooden rolling pin, an egg, and a small
   heap of flour. */
#define CAM_POS vec3(-0.3107,0.3056,-0.6425)
#define CAM_TGT vec3(-0.2003,-0.0503,0.0993)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define BW vec3(0.,0.,.05)
#define RP vec3(.02,.018,-.11)
#define EGG vec3(.18,.027,-.02)
#define FL vec3(-.17,0.,-.05)
float bowlD(vec3 q){ vec3 c=q-vec3(0.,.1,0.); float s=abs(length(c)-.1)-.004; s=max(s,c.y-.0);
  s=min(s,sdCylY(q-vec3(0.,.006,0.),.045,.006)-.002);
  s=min(s,sdTorus(q-vec3(0.,.1,0.),.1,.005)); return s; }
float doughD(vec3 q){ vec3 c=q-vec3(0.,.1,0.); float d=sdEll(c,vec3(.075,.045,.07)); d+=.003*fbm3(c*40.); return d; }
vec3 rpQ(vec3 p){ vec3 q=p-RP; q.xz=rot(.18)*q.xz; return q; }
float rpD(vec3 q){ float d=sdCylX(q,.018,.085)-.002; d=min(d,sdCapsule(q,vec3(-.13,0.,0.),vec3(-.087,0.,0.),.008)); d=min(d,sdCapsule(q,vec3(.087,0.,0.),vec3(.13,0.,0.),.008)); return d; }
float eggD(vec3 q){ q.xz=rot(.5)*q.xz; q.xy=rot(1.45)*q.xy; q.y-=.004; return sdEll(q,vec3(.023,.031,.023)-vec3(0.,q.y*.1,0.)); }
float flourD(vec3 q){ float r=length(q.xz); return (q.y-.025*exp(-r*r/.0016)-.002*fbm(q.xz*80.))*.6; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=p-BW;
  r=U(r,bowlD(b),3.);
  r=U(r,doughD(b),4.);
  r=U(r,rpD(rpQ(p)),5.);
  r=U(r,eggD(p-EGG),6.);
  r=U(r,max(flourD(p-FL),length((p-FL).xz)-.07),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BW; if(abs(q.y-.075)<.003) return .45; return .82; }
  if(id==4.) return .86-.1*fbm3((p-BW)*60.);
  if(id==5.){ vec3 q=rpQ(p); if(abs(q.x)>.087) return .45; return .72+.1*grain(q.yzx,80.); }
  if(id==6.) return .9;
  if(id==7.) return .95;
  return .7; }
