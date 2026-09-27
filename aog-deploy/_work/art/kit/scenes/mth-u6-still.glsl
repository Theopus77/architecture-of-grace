/* Math Unit 6 "Multiplication and Division" — pencil still life: an open egg carton holding
   a dozen eggs in two rows of six, its lid standing open behind.  */
#define CAM_POS vec3(-0.2973,0.4261,-0.4421)
#define CAM_TGT vec3(-0.1608,0.0019,0.1393)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define EX .05
#define EZ .05
vec3 caQ(vec3 p){ vec3 q=p-vec3(.02,0.,.08); q.xz=rot(-.12)*q.xz; return q; }
float egg(vec3 e){ e.y-=.03; float k=e.y>0.?1.25:1.; return (length(e/vec3(.021,.028*k,.021))-1.)*.021; }
vec2 carton(vec3 p){ vec3 q=caQ(p);
  float tray=sdRBox(q-vec3(0.,.02,0.),vec3(.155,.02,.054),.006);
  vec3 c=q; c.x=c.x-EX*clamp(floor(c.x/EX+.5),-3.,3.)+ (0.); /* placeholder */
  vec3 cq=q-vec3(-.125,0.,-.025); vec2 id=clamp(floor(cq.xz/vec2(EX,EZ)+.5),vec2(0.),vec2(5.,1.)); vec3 l=cq-vec3(id.x*EX,0.,id.y*EZ);
  float cup=length(l-vec3(0.,.045,0.))-.024;
  tray=max(tray,-cup);
  float lid=sdRBox(q-vec3(0.,.075,.075),vec3(.155,.075,.012),.01);
  lid=max(lid,-sdRBox(q-vec3(0.,.075,.066),vec3(.145,.066,.012),.006));
  float eggs=egg(l-vec3(0.,.018,0.));
  return vec2(min(tray,lid),eggs); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 c=carton(p); r=U(r,c.x,3.); r=U(r,c.y,4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .55+.1*fbm(p.xy*90.);
  if(id==4.||id==5.) return .9;
  return .7; }
