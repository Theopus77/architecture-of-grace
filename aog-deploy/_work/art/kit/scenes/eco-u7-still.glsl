/* Economics Unit 7 "The Economic Way of Thinking" — pencil still life: a wooden signpost
   with two arrow boards pointing different ways (every choice), a light bulb (a good idea)
   and a single coin. */
#define CAM_POS vec3(-0.4248,0.3004,-1.0161)
#define CAM_TGT vec3(-0.2773,0.0413,0.0941)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define SP vec3(.1,0.,.16)
vec2 signpost(vec3 p){
  vec3 q=p-SP;
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.05,.012,.05),.003);
  float post=sdRBox(q-vec3(0.,.15,0.),vec3(.008,.14,.008),.002);
  float cap=sdCone(q-vec3(0.,.296,0.),.012,.001,.008);
  float boards=1e5;
  for(int i=0;i<2;i++){ float s=i==0?1.:-1.; float y=i==0?.24:.19; vec3 b=q-vec3(s*.07,y,-.012); b.xz=rot(i==0?-.2:.35)*b.xz;
    vec2 u=vec2(b.x*s,b.y);
    float pr=max(max(abs(u.y)-.02,-u.x-.075),u.x+abs(u.y)*1.-.08);
    boards=min(boards,max(pr,abs(b.z)-.005)-.001); }
  return vec2(min(min(base,post),cap),boards); }
vec3 bq(vec3 p){ vec3 q=p-vec3(-.18,.0,-.01); q.xz=rot(.3)*q.xz; q.xy=rot(1.25)*q.xy; return q; }  /* lying on its side */
vec2 bulb(vec3 p){
  vec3 q=bq(p)-vec3(0.,.035,0.);
  float glass=length(q-vec3(0.,.05,0.))-.042;
  glass=smin(glass,sdCone(q-vec3(0.,.012,0.),.016,.03,.02),.012);
  float base=sdCylY(q-vec3(0.,-.018,0.),.016,.016)-.001;
  base+=.0015*sin(q.y*600.);
  return vec2(glass,base); }
float coin(vec3 p){ return coinD(p-vec3(.3,.003,-.02),.028,.003); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 s=signpost(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  vec2 b=bulb(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,coin(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .5+.1*grain((p-SP).zxy,40.);
  if(id==4.) return .72+.1*grain((p-SP).zyx,50.);
  if(id==5.){ vec3 q=bq(p)-vec3(0.,.035,0.); if(abs(q.x)<.012&&abs(q.z)<.002&&q.y>.02&&q.y<.06) return .3; return .95; }
  if(id==6.) return .45;
  if(id==7.) return .6;
  return .7; }
