/* Professional Development · Building a Culture of Grace — pencil still life: a small ring of
   wooden chairs turned toward each other around a potted sprout. A staff that meets as a circle. */
#define CAM_POS vec3(-0.4074,0.2726,-0.5245)
#define CAM_TGT vec3(-0.1988,-0.0131,0.0780)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define CT vec3(.0,0.,.05)
float ring(vec3 p){ float d=1e5;
  for(int i=0;i<5;i++){ float a=float(i)*1.2566+.3; vec3 c=CT+vec3(sin(a)*.19,0.,cos(a)*.15);
    vec3 q=p-c; vec2 dd=normalize((CT-c).xz); q=vec3(dot(q.xz,vec2(dd.y,-dd.x)),q.y,dot(q.xz,dd)); d=min(d,chair(q,.055)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,ring(p),3.);
  r=U(r,pot(p-CT,.026,.045),4.);
  r=U(r,sprout(p-CT-vec3(0.,.04,0.),.06,.03,3.),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return chairT(p,.055);
  if(id==4.) return potT(p-CT,.026,.045);
  if(id==5.) return .45;
  return .7; }
