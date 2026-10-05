/* The Bass page — pencil still life: an electric bass (a P-style bass: offset body, split pickup, four big tuners on
   one side) standing on a tubular guitar stand, a coiled cable on the floor beside it. No names or logos. */
#define CAM_POS vec3(-1.9587,1.6521,-2.6358)
#define CAM_TGT vec3(-0.6787,0.6182,0.3181)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 40.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "musicparts.glsl"
#define YAW -.7
#define G0 vec3(0.,.19,.02)
vec3 sq(vec3 p){ vec3 s=p; s.xz=rot(YAW)*s.xz; return s; }
/* a cable in loose coils on the floor, one end running off with its plug */
float cable(vec3 p){
  vec3 c=p-vec3(.36,0.,-.12);
  float d=1e3;
  for(int i=0;i<3;i++){ float fi=float(i); vec3 k=c-vec3(.012*fi,.0065+.0105*fi,.008*fi); k.xz=rot(.5*fi)*k.xz;
    d=min(d,sdTorus(vec3(k.x/1.15,k.y,k.z),.11-.006*fi,.0055)); }
  d=min(d,segD(p,vec3(.36+.12,.0065,-.15),vec3(.53,.0065,-.25))-.0055);
  d=min(d,sdCapsule(p,vec3(.53,.008,-.25),vec3(.575,.008,-.282),.0095));
  d=min(d,segD(p,vec3(.575,.008,-.282),vec3(.60,.008,-.30))-.0035);
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,60.-p.z,2.);
  vec3 s=sq(p);
  r=U(r,bassGtr(toGuitar(s,G0),3.));
  r=U(r,gStand(s,G0,.80,.013,10.));
  r=U(r,cable(p),12.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 s=sq(p);
  if(id>=3.&&id<=7.) return bsTone(id-3.,toGuitar(s,G0));
  if(id==10.) return .3;
  if(id==11.) return .12;
  if(id==12.) return .2;
  return .7; }
