/* The Guitar page — pencil still life: an acoustic guitar (a dreadnought) standing on a tubular guitar stand,
   leaning back into the padded yoke, turned a little toward the light. No names or logos. */
#define CAM_POS vec3(-1.9796,1.5059,-2.3359)
#define CAM_TGT vec3(-0.8126,0.5636,0.3569)
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
#define G0 vec3(0.,.17,.02)
vec3 sq(vec3 p){ vec3 s=p; s.xz=rot(YAW)*s.xz; return s; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,60.-p.z,2.);
  vec3 s=sq(p);
  r=U(r,acoustic(toGuitar(s,G0),3.));
  r=U(r,gStand(s,G0,.74,.026,10.));
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 s=sq(p);
  if(id>=3.&&id<=8.) return acTone(id-3.,toGuitar(s,G0));
  if(id==10.) return .3;
  if(id==11.) return .12;
  if(id==12.) return .35;
  return .7; }
