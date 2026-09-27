/* Novel scene room-207-u4: a garden path between rows of fruit trees leading toward a low hill in late golden light */
#define CAM_POS vec3(0.0646,0.3430,-1.2688)
#define CAM_TGT vec3(0.0646,0.1975,0.4041)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.3,.45,-.6)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,sdEll(p-vec3(.1,-.2,1.6),vec3(1.2,.45,.4)),3.);
  float t=1e3; for(int i=0;i<4;i++){ float z=float(i)*.3; t=min(t,tree(p-vec3(-.28-.03*float(i),0,z),.45,.12)); t=min(t,tree(p-vec3(.28+.03*float(i),0,z+.1),.42,.12)); }
  r=U(r,t,4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==1.){ if(abs(p.x-.04*sin(p.z*4.))<.08+.02*p.z) return fract(p.z*9.)<.08?.6:.9; return .7; }
  if(id==3.) return .75; if(id==4.) return p.y<.18?.4:.5;
  return .6; }
