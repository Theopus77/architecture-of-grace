/* Medicine and Health Unit 2 "Helpers Who Keep Us Well" — pencil still life: a doctor's
   stethoscope coiled on the table, a rolled bandage and a closed pill bottle. */
#define CAM_POS vec3(-0.3154,0.2887,-0.6532)
#define CAM_TGT vec3(-0.1989,-0.0127,0.0451)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define ST vec3(0.,0.,-.02)
#define BOT vec3(.17,0.,.17)
#define ROL vec3(-.16,0.,.1)
#define CP vec3(.12,0.,-.12)
float tubes(vec3 p){ vec3 q=p-ST;
  float loop=sdTorus(q-vec3(0.,.0055,0.),.075,.0055);
  loop=max(loop,q.z-.06);                                 /* open at the back */
  vec3 A=vec3(-.042,.0055,.062), B=vec3(.042,.0055,.062), Y=vec3(0.,.0055,.09);
  float d=min(loop,min(sdCapsule(q,A,Y,.0055),sdCapsule(q,B,Y,.0055)));
  d=min(d,sdCapsule(q,Y,Y+vec3(0.,0.,.03),.0055));
  d=min(d,sdCapsule(q,vec3(.055,.0055,-.052),CP-ST+vec3(-.035,.012,.02),.0055));
  return d; }
float metal(vec3 p){ vec3 q=p-ST; vec3 Y=vec3(0.,.0055,.118);
  vec3 L=vec3(-.05,.006,.2), R=vec3(.05,.006,.2);
  float d=min(sdCapsule(q,Y,Y+vec3(-.02,0.,.03),.0034),sdCapsule(q,Y,Y+vec3(.02,0.,.03),.0034));
  d=min(d,sdCapsule(q,Y+vec3(-.02,0.,.03),L,.0034)); d=min(d,sdCapsule(q,Y+vec3(.02,0.,.03),R,.0034));
  d=min(d,sdCapsule(q,L,L+vec3(.015,.003,.012),.0034)); d=min(d,sdCapsule(q,R,R+vec3(-.015,.003,.012),.0034));
  d=min(d,sdEll(q-L-vec3(.018,.004,.016),vec3(.008,.007,.009)));
  d=min(d,sdEll(q-R-vec3(-.018,.004,.016),vec3(.008,.007,.009)));
  /* the chest piece: a round drum with a rim and a short stem, tipped up toward us */
  vec3 c=p-CP; c.xz=rot(-.5)*c.xz; c.yz=rot(-.45)*c.yz;
  float drum=sdCylY(c-vec3(0.,.02,0.),.034,.01)-.003;
  drum=min(drum,sdTorus(c-vec3(0.,.031,0.),.032,.004));
  drum=min(drum,sdCapsule(c,vec3(0.,.02,.035),vec3(0.,.02,.055),.0055));
  return min(d,drum); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,tubes(p),3.);
  r=U(r,metal(p),4.);
  r=U(r,rollD(p-ROL,.05,.075),5.);
  r=U(r,rollTail(p-ROL,.05,.09),5.);
  r=U(r,bottleD(p-BOT,.036,.12),6.);
  r=U(r,capD(p-BOT,.036,.12),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .35;
  if(id==4.){ vec3 c=p-CP; c.xz=rot(-.5)*c.xz; c.yz=rot(-.45)*c.yz; if(length(c.xz)<.034&&c.y>.028){ float r=length(c.xz); return abs(r-.024)<.0015?.5:.88; } return .75; }
  if(id==5.){ vec3 q=p-ROL; float r=length(q.xz); if(q.y>.074&&r<.05){ return fract(r/.0045)<.3?.6:.95; } return .93; }
  if(id==6.){ vec3 q=p-BOT; if(q.y>.03&&q.y<.08){ if(q.y>.036&&q.y<.074){ float l=fract((q.y-.04)/.011); if(l<.2&&atan(q.z,q.x)<-.6&&atan(q.z,q.x)>-2.6) return .5; } return .9; } return .62; }
  if(id==7.) return .78;
  return .7; }
