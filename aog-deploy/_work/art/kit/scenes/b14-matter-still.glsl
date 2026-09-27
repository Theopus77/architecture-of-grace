/* Practice room "Matter and Its Interactions" — pencil still life: an Erlenmeyer flask half full
   of water, a ball-and-stick model of a water molecule, and two ice cubes melting on the table. */
#define CAM_POS vec3(-0.3313,0.3931,-0.7703)
#define CAM_TGT vec3(-0.2003,-0.0291,0.1095)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define FL vec3(.02,0.,.05)
#define MOL vec3(-.14,.0,-.04)
#define ICE vec3(.15,0.,-.07)
/* water molecule: oxygen sphere with two hydrogens at 104.5 degrees, joined by sticks */
vec3 molQ(vec3 p){ vec3 q=p-MOL-vec3(0.,.037,0.); q.xz=rot(-.35)*q.xz; return q; }
vec3 hPos(float s){ float a=radians(52.25); return vec3(s*sin(a),cos(a),0.)*.085+vec3(0.,0.,0.); }
float oxD(vec3 q){ return length(q)-.037; }
float hyD(vec3 q){ return min(length(q-hPos(1.))-.024,length(q-hPos(-1.))-.024); }
float stickD(vec3 q){ return min(sdCapsule(q,vec3(0.),hPos(1.),.006),sdCapsule(q,vec3(0.),hPos(-1.),.006)); }
float iceD(vec3 p,vec3 c,float ry,float s){ vec3 q=place(p,c,ry); q.y-=s;
  return sdRBox(q,vec3(s),.007)+.0012*fbm(q.xy*90.+q.z*40.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,flaskD(p-FL,.075,.2),3.);
  vec3 m=molQ(p);
  r=U(r,oxD(m),4.);
  r=U(r,hyD(m),5.);
  r=U(r,stickD(m),6.);
  r=U(r,iceD(p,ICE,.3,.026),7.);
  r=U(r,iceD(p,ICE+vec3(.07,0.,.035),-.4,.022),8.);
  r=U(r,sdEll(p-ICE-vec3(.02,0.,-.03),vec3(.07,.0015,.04)),9.);   /* a small puddle */
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-FL;
    if(q.y<.075){ if(q.y>.066) return .2; return .6; }          /* water line and the water */
    if(q.y>.09&&q.y<.14&&fract(q.y/.016)<.12&&dot(normalize(q.xz),vec2(-.4,-.9))>.8) return .35;  /* scale marks */
    return .9; }
  if(id==4.) return .35;
  if(id==5.) return .85;
  if(id==6.) return .6;
  if(id==7.||id==8.) return .9;
  if(id==9.) return .8;
  return .7; }
