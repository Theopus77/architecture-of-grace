/* Math Unit 15 "Functions and Linear Equations" — pencil still life: a wooden staircase of
   five equal steps (the same rise for every run), with a straight plank ramp leaning beside it
   and a ball at the foot of the ramp. */
#define CAM_POS vec3(-0.3146,0.2202,-0.7211)
#define CAM_TGT vec3(-0.2093,0.0362,0.1021)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define SR .045
#define SW .055
vec3 stQ(vec3 p){ vec3 q=p-vec3(-.12,0.,.1); q.xz=rot(.35)*q.xz; return q; }
float stairs(vec3 p){ vec3 q=stQ(p); float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); d=min(d,sdRBox(q-vec3((fi+.5)*SW,(fi+1.)*SR*.5,0.),vec3(SW*.5,(fi+1.)*SR*.5,.06),.003)); }
  return d; }
vec3 rpQ(vec3 p){ vec3 q=stQ(p)-vec3(2.5*SW,2.5*SR,-.1); float a=atan(5.*SR,5.*SW); q.xy=rot(a)*q.xy; return q; }
float ramp(vec3 p){ vec3 q=rpQ(p); float L=length(vec2(5.*SR,5.*SW))*.5; return sdRBox(q,vec3(L,.006,.03),.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stairs(p),3.);
  r=U(r,ramp(p),4.);
  vec3 b=stQ(p)-vec3(-.03,.028,-.1); r=U(r,length(b)-.028,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .66+.08*grain(stQ(p),25.);
  if(id==4.) return .5;
  if(id==5.){ vec3 b=stQ(p)-vec3(-.03,.028,-.1); return abs(b.y+.3*b.x)<.006?.2:.75; }
  return .7; }
