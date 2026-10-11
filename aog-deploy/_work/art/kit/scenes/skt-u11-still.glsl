/* skt-u11 "Grinds and Slides" — pencil still life: a round steel grind rail on square legs with a
   complete skateboard resting on it truck-on-rail (a 50-50 at rest), and a worn block of skate wax
   on the table in front. Objects only. */
#define CAM_POS vec3(-0.8804,0.5035,-1.1570)
#define CAM_TGT vec3(-0.3754,0.0493,0.1687)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_b.glsl"
#define RL .42
#define RH .24
vec3 Qr(vec3 p){ vec3 q=p-vec3(0.,0.,.05); q.xz=rot(-.12)*q.xz; return q; }
vec3 Qb(vec3 p){ vec3 q=Qr(p)-vec3(.07,RH+.022-.0185,0.); return q; }
vec3 Qw(vec3 p){ vec3 q=p-vec3(-.02,0.,-.1); q.xz=rot(.5)*q.xz; return q/1.6; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sb_rail(Qr(p),RL,RH),3.);
  vec2 b=sb_board(Qb(p),.4,.1,1.,.215,.027,.016); r=U(r,b.x,4.+b.y);
  r=U(r,sb_wax(Qw(p))*1.6,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sbt_rail(Qr(p),RL,RH);
  if(id>3.5&&id<6.5) return sbt_board(Qb(p),id-4.,.4,.1,1.,.215,.027,.016,0.);
  if(id==7.) return sbt_wax(Qw(p));
  return .7; }
