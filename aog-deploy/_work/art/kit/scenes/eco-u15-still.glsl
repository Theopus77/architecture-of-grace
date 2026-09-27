/* Economics Unit 15 "Measuring the Economy" — pencil still life: a bar chart made of
   wooden blocks rising from left to right, a folding ruler, and a magnifying glass. */
#define CAM_POS vec3(-0.3145,0.2427,-1.0111)
#define CAM_TGT vec3(-0.1712,-0.0092,0.0683)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define BC vec3(.08,0.,.16)
vec3 bq(vec3 p){ vec3 q=p-BC; q.xz=rot(-.2)*q.xz; return q; }
vec2 bars(vec3 p){
  vec3 q=bq(p);
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.16,.006,.05),.003);
  float b=1e5;
  for(int i=0;i<5;i++){ float h=.04+float(i)*.035+(i==2?-.02:0.); b=min(b,sdRBox(q-vec3(-.12+float(i)*.06,.012+h*.5,0.),vec3(.022,h*.5,.022),.003)); }
  return vec2(base,b); }
vec3 rq(vec3 p){ vec3 q=p-vec3(-.19,.004,-.03); q.xz=rot(.4)*q.xz; return q; }
float ruler(vec3 p){
  vec3 q=rq(p);
  float a=sdRBox(q-vec3(.0,0.,0.),vec3(.09,.003,.012),.001);
  vec3 c=q-vec3(.09,0.,0.); c.xz=rot(-1.)*c.xz; float b=sdRBox(c-vec3(.08,.007,0.),vec3(.08,.003,.012),.001);
  return min(a,b); }
vec3 gq(vec3 p){ vec3 q=p-vec3(.3,.012,-.04); q.xz=rot(-.6)*q.xz; return q; }
vec2 glass(vec3 p){
  vec3 q=gq(p);
  float rim=sdTorus(q,.04,.006);
  float lens=sdCylY(q,.037,.0025);
  float handle=sdCapsule(q,vec3(.05,0.,0.),vec3(.14,.0,0.),.008);
  return vec2(min(rim,handle),lens); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=bars(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,ruler(p),5.);
  vec2 g=glass(p); r=U(r,g.x,6.); r=U(r,g.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 q=bq(p); int i=int(floor((q.x+.15)/.06)); return i==4?.35:i==3?.5:.72; }
  if(id==5.){ vec3 q=rq(p); if(n.y>.5&&fract(q.x/.01)<.12&&abs(q.z+.008)<.004) return .2; return .85; }
  if(id==6.) return .4;
  if(id==7.) return .96;
  return .7; }
