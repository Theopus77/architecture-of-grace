/* Professional Development · the four-session pathway — pencil still life: four flat stepping
   stones laid in a gentle curve across the table, each a little higher, a sprout at the far end. */
#define CAM_POS vec3(-0.3758,0.2610,-0.5189)
#define CAM_TGT vec3(-0.1729,-0.0169,0.0672)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
float pdStones(vec3 p,out float k){ float d=1e5; k=0.;
  for(int i=0;i<4;i++){ float fi=float(i);
    vec3 c=vec3(-.15+fi*.1,0.,-.06+.05*sin(fi*1.1)+fi*.03);
    vec3 q=p-c; q.xz=rot(fi*.7)*q.xz;
    float s=sdEll(q-vec3(0.,.008+fi*.004,0.),vec3(.042,.012+fi*.004,.032))-.001*fbm(q.xz*90.);
    if(s<d){ d=s; k=fi; } }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  float k; r=U(r,pdStones(p,k),3.);
  r=U(r,pot(p-vec3(.2,0.,.1),.024,.04),4.);
  r=U(r,sprout(p-vec3(.2,.036,.1),.06,.03,3.),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ float k; pdStones(p,k); return .5+.08*k+.08*(fbm(p.xz*70.)-.5); }
  if(id==4.) return potT(p-vec3(.2,0.,.1),.024,.04);
  if(id==5.) return .45;
  return .7; }
