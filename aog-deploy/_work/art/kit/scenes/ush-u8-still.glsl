/* U.S. History Unit 8 "Twentieth-Century Crises" (The Great War) — pencil still life: a
   shallow steel "doughboy" helmet of the First World War resting on the table, a round
   cloth-covered canteen with its cap and strap, and a folded field map. No figures. */
#define CAM_POS vec3(-0.3697,0.3852,-0.8507)
#define CAM_TGT vec3(-0.2287,-0.0686,0.0949)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define HM vec3(-.03,0.,.06)
#define CT vec3(.19,0.,.06)
vec3 hq(vec3 p){ vec3 q=L(p,HM,.3); q.xy=rot(-.12)*q.xy; return q; }
float helmet(vec3 q){
  vec3 c=q-vec3(0,.012,0);
  float dome=length(c*vec3(1.,1.35,1.05))-.085; dome=max(dome*.72,-c.y);
  float r=length(c.xz*vec2(1.,1.08)); float brim=max(abs(c.y-.004+.02*(r/.15)*(r/.15)*0.)-.003,r-.15);
  brim=max(brim,-c.y-.003);
  float rim=sdTorus(c*vec3(1.,1.,1.08)-vec3(0,.004,0),.148,.0035);
  float rivet=length(c-vec3(0,.065,0))-.006;
  return min(min(dome,brim),min(rim,rivet)); }
vec3 cq(vec3 p){ vec3 q=L(p,CT,-.4)-vec3(0,.075,0); q.yz=rot(.12)*q.yz; return q; }   /* canteen standing on edge, face in xy */
float canteen(vec3 q){
  float body=length(q*vec3(1.,1.,2.2))-.07; body*=.45;
  float neck=sdCylY(q-vec3(0,.075,0),.012,.008); float cap=sdCylY(q-vec3(0,.088,0),.015,.007)-.001;
  float chain=sdTorus((q-vec3(.02,.075,0)).xzy,.012,.0016);
  float strap=max(abs(length(q.xy)-.074)-.002,abs(q.z)-.012); strap=max(strap,-q.y-.02);
  return min(min(body,neck),min(min(cap,chain),strap)); }
float map2(vec3 q){ return sdBox(q-vec3(0,.004,0),vec3(.09,.004,.06)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,helmet(hq(p)),3.);
  r=U(r,canteen(cq(p)),4.);
  r=U(r,map2(L(p,vec3(.02,0.,-.14),.2)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hq(p); return .42+.06*fbm(q.xz*60.); }
  if(id==4.){ vec3 q=cq(p); if(abs(length(q.xy)-.074)<.003) return .3; if(q.y>.07) return .35; return fract((q.x+q.y)/.004)<.3?.45:.55; }
  if(id==5.){ vec3 q=L(p,vec3(.02,0.,-.14),.2); if(abs(q.x)<.0012||abs(q.z)<.0012||abs(abs(q.x)-.045)<.001) return .55;
    float c=fbm(q.xz*40.); if(abs(c-.5)<.012) return .45; return .88; }
  return .7; }
