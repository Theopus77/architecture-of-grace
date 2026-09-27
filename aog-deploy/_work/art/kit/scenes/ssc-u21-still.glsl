/* Social Studies Unit 21 "U.S. History: World Wars and the Cold War" — pencil still life: a
   soldier's steel helmet resting on the table, a round satellite model with four long
   antennas on a stand (the space race), and a folded letter. */
#define CAM_POS vec3(-0.4090,0.2173,-0.8105)
#define CAM_TGT vec3(-0.2896,0.0077,0.0879)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define HC vec3(-.02,0.,.1)
vec2 helmet(vec3 p){
  vec3 q=p-HC; q.xz=rot(.3)*q.xz;
  float dome=max(abs(length((q-vec3(0.,.012,0.))*vec3(1.,1.15,1.1))-.08)-.004,.012-q.y);
  float brim=max(abs(length(q.xz*vec2(1.,1.08))-.084)-.008,abs(q.y-.012)-.003);
  float strap=sdTorus((q-vec3(0.,.0,-.02)).xyz,.06,.003); strap=max(strap,q.y-.01);
  return vec2(min(dome,brim),strap); }
#define SC vec3(.22,.17,.18)
vec2 satellite(vec3 p){
  vec3 q=p-SC;
  float ball=length(q)-.05;
  float seam=max(abs(q.y)-.0015,length(q)-.052);
  float ant=1e5;
  for(int i=0;i<4;i++){ float a=float(i)*1.5708+.785; vec3 d=normalize(vec3(cos(a)*.35,-.2,sin(a)*.35)+vec3(-.9,0.,0.));
    vec3 a0=d*.04; ant=min(ant,sdCapsule(q,a0,a0+normalize(d+vec3(-.6,-.35,0.)*0.)*.22,.0018)); }
  vec3 b=p-vec3(SC.x,0.,SC.z);
  float base=sdCylY(b-vec3(0.,.008,0.),.05,.008)-.002;
  float rod=sdCylY(b-vec3(0.,.065,0.),.004,.06);
  return vec2(min(ball,seam),min(ant,min(base,rod))); }
vec3 lq(vec3 p){ vec3 q=p-vec3(-.2,.003,-.05); q.xz=rot(.3)*q.xz; return q; }
vec2 letter(vec3 p){
  vec3 q=lq(p);
  float page=sdRBox(q,vec3(.075,.0015,.05),.0008);
  vec3 f=q-vec3(-.01,.012,.02); f.yz=rot(-.3)*f.yz;
  float half2=sdRBox(f-vec3(0.,0.,.0),vec3(.07,.0015,.03),.0008);
  float env=sdRBox(q-vec3(.04,.0,-.06)+vec3(0.,-.002,0.),vec3(.06,.0025,.035),.001);
  return vec2(min(page,half2),env); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 h=helmet(p); r=U(r,h.x,3.); r=U(r,h.y,4.);
  vec2 s=satellite(p); r=U(r,s.x,5.); r=U(r,s.y,6.);
  vec2 l=letter(p); r=U(r,l.x,7.); r=U(r,l.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .35+.1*fbm3(p*90.);
  if(id==4.) return .3;
  if(id==5.) return .82;
  if(id==6.) return .4;
  if(id==7.){ vec3 q=lq(p); if(q.y<.004&&abs(q.x+.01)<.055&&fract((q.z+.05)/.009)<.18&&q.z<-.005) return .6; return .93; }  /* handwriting hint-lines */
  if(id==8.){ vec3 q=lq(p)-vec3(.04,0.,-.06); if(abs(abs(q.x)*.58-(q.z+.035))<.002) return .5; if(q.x>.035&&q.z>.012) return .45; return .88; }
  return .7; }
