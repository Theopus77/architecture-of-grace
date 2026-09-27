/* Social Studies Unit 17 "The Twentieth-Century World" — pencil still life: an old
   arched table radio with a speaker grille and two knobs, a toy propeller airplane and a
   rotary telephone dial handset base. */
#define CAM_POS vec3(-0.3290,0.2409,-0.9281)
#define CAM_TGT vec3(-0.1958,0.0067,0.0752)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define RC vec3(.08,0.,.16)
vec3 rq(vec3 p){ vec3 q=p-RC; q.xz=rot(-.25)*q.xz; return q; }
vec2 radio(vec3 p){
  vec3 q=rq(p);
  /* cathedral radio: a box with a round-arched top */
  vec2 u=q.xy-vec2(0.,.1);
  float prof=max(abs(q.x)-.09,max(-q.y,u.y));
  prof=min(prof,max(length(u)-.09,-u.y));
  float body=max(prof,abs(q.z)-.05)-.004;
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.1,.008,.056),.003);
  /* grille recess and knobs */
  vec2 g=q.xy-vec2(0.,.12);
  float grille=max(max(length(g)-.058,-(g.y+.05)),q.z+.05-.004);
  body=max(body,-max(grille,-(q.z+.06)));
  float knobs=min(sdCylZ(q-vec3(-.045,.035,-.055),.011,.006),sdCylZ(q-vec3(.045,.035,-.055),.011,.006))-.001;
  float dial=sdCylZ(q-vec3(0.,.035,-.052),.016,.003);
  return vec2(min(body,base),min(knobs,dial)); }
vec3 aq(vec3 p){ vec3 q=p-vec3(-.19,.05,-.02); q.xz=rot(.65)*q.xz; return q; }
vec2 plane(vec3 p){
  vec3 q=aq(p);
  float t=clamp((q.x+.1)/.19,0.,1.);
  float R=.018*sin(t*2.6+.35)+.004;
  float body=(length(q.yz)-R)*.8; body=max(body,abs(q.x-.0)-.1);
  float wing=sdRBox(q-vec3(.035,.008,0.),vec3(.022,.003,.12),.002);
  float wing2=sdRBox(q-vec3(.035,.045,0.),vec3(.022,.003,.12),.002);
  float strut=min(sdRBox(q-vec3(.035,.026,.08),vec3(.002,.018,.002),.001),sdRBox(q-vec3(.035,.026,-.08),vec3(.002,.018,.002),.001));
  float tail=sdRBox(q-vec3(-.09,.005,0.),vec3(.012,.002,.04),.001);
  float fin=sdRBox(q-vec3(-.092,.022,0.),vec3(.012,.018,.002),.001);
  float gear=sdCylZ(q-vec3(.04,-.042,.03),.011,.004); gear=min(gear,sdCylZ(q-vec3(.04,-.042,-.03),.011,.004));
  gear=min(gear,min(sdCapsule(q,vec3(.04,-.042,.03),vec3(.04,-.008,.012),.002),sdCapsule(q,vec3(.04,-.042,-.03),vec3(.04,-.008,-.012),.002)));
  vec3 pr=q-vec3(.108,0.,0.);
  float prop=min(sdRBox(pr,vec3(.003,.045,.006),.002),length(pr)-.009);
  float b=min(min(body,tail),fin);
  return vec2(b,min(min(wing,wing2),min(strut,min(gear,prop)))); }
vec3 tq(vec3 p){ vec3 q=p-vec3(.33,0.,0.); q.xz=rot(-.4)*q.xz; return q; }
float phone(vec3 p){
  vec3 q=tq(p);
  float base=sdCone(q-vec3(0.,.03,0.),.06,.045,.03)-.004;
  float cradle=sdRBox(q-vec3(0.,.07,0.),vec3(.05,.008,.012),.004);
  vec3 h=q-vec3(0.,.09,0.);
  float hand=sdCapsule(h,vec3(-.05,0.,0.),vec3(.05,0.,0.),.012);
  hand=min(hand,length((h-vec3(-.06,-.006,0.))*vec3(1.,1.4,1.))-.02);
  hand=min(hand,length((h-vec3(.06,-.006,0.))*vec3(1.,1.4,1.))-.02);
  vec3 d=q-vec3(0.,.035,-.045); d.yz=rot(-.9)*d.yz;
  float dial=sdCylY(d,.028,.004)-.001;
  return min(min(base,cradle),min(hand,dial)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 a=radio(p); r=U(r,a.x,3.); r=U(r,a.y,4.);
  vec2 b=plane(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,phone(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=rq(p); vec2 g=q.xy-vec2(0.,.12);
    if(q.z<-.04&&length(g)<.058&&g.y>-.05){ if(abs(fract(g.x/.012)-.5)<.12) return .75; return .2; }   /* grille bars over cloth */
    return .45+.12*grain(q.zxy,40.); }
  if(id==4.){ vec3 q=rq(p); if(abs(q.x)<.02&&q.z<-.05){ float a=atan(q.y-.035,q.x); if(fract(a*12./6.2832)<.2) return .2; return .9; } return .3; }
  if(id==5.) return .6;
  if(id==6.) return .72;
  if(id==7.){ vec3 q=tq(p); vec3 d=q-vec3(0.,.035,-.045); d.yz=rot(-.9)*d.yz;
    if(d.y>.002&&length(d.xz)<.028){ for(int i=0;i<10;i++){ float a=float(i)*.52+.6; if(length(d.xz-.019*vec2(cos(a),sin(a)))<.005) return .95; } return .2; }
    return .22; }
  return .7; }
