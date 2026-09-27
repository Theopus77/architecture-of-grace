/* World Religions Unit 11 "South and East Asian Traditions" (The King Who Carved His
   Regret) — pencil still life: a small stone model of an Ashoka pillar, with its bell-shaped
   lotus capital and a spoked wheel on top, a carved stone slab with hint-lines (an edict,
   no real script), and a clay diya with a small flame. No figures. */
#define CAM_POS vec3(-0.5524,0.6452,-1.1647)
#define CAM_TGT vec3(-0.3561,0.0129,0.1529)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define PL vec3(-.02,0.,.08)
#define SL vec3(.17,0.,.02)
#define DY vec3(-.2,0.,-.05)
float wheel(vec3 q){  /* upright wheel in the xy plane */
  float rim=sdTorus(q.xzy,.034,.0045);
  float hub=sdCylZ(q,.008,.006);
  float a=atan(q.y,q.x); float k=floor(a/(6.2832/12.)+.5)*(6.2832/12.); vec2 d2=rot(k)*q.xy;
  float sp=max(max(abs(d2.y)-.0018,abs(q.z)-.0025),max(-d2.x,d2.x-.034));
  return min(min(rim,hub),sp); }
float pillar(vec3 q){
  float base=sdRBox(q-vec3(0,.012,0),vec3(.05,.012,.05),.003);
  float shaft=sdCone(q-vec3(0,.13,0),.022,.018,.106);
  vec3 c=q-vec3(0,.245,0);
  float bell=sdCone(c,.034,.018,.012)-.004;                       /* the lotus bell */
  float neck=sdCylY(q-vec3(0,.262,0),.02,.004);
  float abacus=sdCylY(q-vec3(0,.274,0),.032,.008)-.002;
  float w=wheel(q-vec3(0,.322,0));
  return min(min(base,shaft),min(min(bell,neck),min(abacus,w))); }
float slab(vec3 q){ vec3 s=q-vec3(0,.075,0); s.yz=rot(-.14)*s.yz; float d=sdRBox(s,vec3(.06,.075,.012),.004);
  d+=(fbm(q.xy*30.)-.5)*.003; return max(d,-q.y); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pillar(L(p,PL,-.35)),3.);
  r=U(r,slab(L(p,SL,-.35)),4.);
  r=U(r,diyaD(L(p,DY,-.4),1.1),5.);
  r=U(r,diyaFlameD(L(p,DY,-.4),1.1),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,PL,-.35); if(q.y>.23&&q.y<.26){ float a=atan(q.z,q.x); return fract(a*2.)<.3?.4:.62; }
    if(abs(q.y-.274)<.002) return .35; return .62-.08*fbm(q.xy*40.); }
  if(id==4.){ vec3 q=L(p,SL,-.35); float a=.6-.08*fbm(q.xy*40.); vec3 s=q-vec3(0,.075,0); s.yz=rot(-.14)*s.yz;
    if(s.z<-.008&&abs(s.x)<.045&&abs(s.y)<.06&&fract((s.y+.1)/.014)<.25&&fract(s.x*20.+floor(s.y/.014)*.4)<.75) a=.32; return a; }
  if(id==5.){ vec3 q=L(p,DY,-.4)/1.1; if(q.x>.04&&q.y>.02&&abs(q.z)<.006) return .3; return .58; }
  if(id==6.) return .97;
  return .7; }
