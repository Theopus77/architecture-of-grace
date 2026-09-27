/* Medicine and Health Unit 2 "Helpers Who Keep Us Well" — pencil still life: a doctor's
   stethoscope coiled on the table, a rolled bandage and a closed pill bottle. */
#define CAM_POS vec3(-0.1500,0.5000,-0.9800)
#define CAM_TGT vec3(0.0200,0.0600,0.0400)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define ST vec3(-.01,0.,-.02)
#define BOT vec3(.12,0.,.08)
#define ROL vec3(-.12,0.,.1)
#define CP vec3(.045,.0,-.105)
float tubes(vec3 p){ vec3 q=p-ST;
  float loop=sdTorus(q-vec3(0.,.0055,0.),.085,.0055);
  float a=atan(q.z,q.x); loop=max(loop,-(q.z-.05)*1.);   /* open at the back */
  vec3 A=vec3(-.049,.0055,.07), B=vec3(.049,.0055,.07), Y=vec3(0.,.0055,.12);
  float d=min(loop,min(sdCapsule(q,A,Y,.0055),sdCapsule(q,B,Y,.0055)));
  d=min(d,sdCapsule(q,Y,Y+vec3(0.,0.,.03),.0055));
  d=min(d,sdCapsule(q,CP-ST+vec3(-.005,.01,.03),vec3(.03,.0055,-.075),.005));
  return d; }
float metal(vec3 p){ vec3 q=p-ST; vec3 Y=vec3(0.,.0055,.15);
  vec3 L=Y+vec3(-.06,.006,.1), R=Y+vec3(.06,.006,.1);
  float d=min(sdCapsule(q,Y,L,.0032),sdCapsule(q,Y,R,.0032));
  d=min(d,length(q-L-vec3(-.004,.002,.008))-.009);
  d=min(d,length(q-R-vec3(.004,.002,.008))-.009);
  /* the chest piece: a round drum with a rim and a short stem */
  vec3 c=p-CP; c.yz=rot(-.25)*c.yz;
  float drum=sdCylY(c-vec3(0.,.013,0.),.03,.009)-.003;
  drum=min(drum,sdTorus(c-vec3(0.,.023,0.),.028,.0035));
  drum=min(drum,sdCapsule(c,vec3(0.,.016,.03),vec3(0.,.018,.05),.005));
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
  if(id==4.){ vec3 c=p-CP; c.yz=rot(-.25)*c.yz; if(length(c.xz)<.03&&c.y>.02){ float r=length(c.xz); return abs(r-.02)<.0015?.5:.85; } return .75; }
  if(id==5.){ vec3 q=p-ROL; float r=length(q.xz); if(q.y>.074&&r<.05){ return fract(r/.0045)<.3?.6:.95; } return .93; }
  if(id==6.){ vec3 q=p-BOT; if(q.y>.03&&q.y<.08){ if(q.y>.036&&q.y<.074){ float l=fract((q.y-.04)/.011); if(l<.2&&atan(q.z,q.x)<-.6&&atan(q.z,q.x)>-2.6) return .5; } return .9; } return .62; }
  if(id==7.) return .78;
  return .7; }
