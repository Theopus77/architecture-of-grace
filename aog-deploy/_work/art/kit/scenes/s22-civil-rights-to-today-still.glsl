/* s22-civil-rights-to-today "US History: Civil Rights to Today" — the movement comes before the
   law: a lunch-counter stool (the sit-ins), a pair of worn walking shoes (the marches) and a
   wooden ballot box with a folded ballot going in (the Voting Rights Act). No people, no signs,
   no words. */
#define CAM_POS vec3(-0.4509,0.4846,-0.9939)
#define CAM_TGT vec3(-0.2859,-0.0469,0.1138)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
/* ---- lunch-counter stool: round cushion on a chrome post with a flared foot ---- */
#define ST vec3(-.12,0.,.08)
vec3 stQ(vec3 p){ return p-ST; }
float stoolMetal(vec3 q){ float r=length(q.xz);
  float foot=sdCone(q-vec3(0.,.014,0.),.07,.03,.014)-.002;
  float post=sdCylY(q-vec3(0.,.1,0.),.013,.085);
  float ring=sdTorus(q-vec3(0.,.1,0.),.045,.004);             /* the foot ring */
  float spoke=min(sdBox(q-vec3(0.,.1,0.),vec3(.045,.003,.003)),sdBox(q-vec3(0.,.1,0.),vec3(.003,.003,.045)));
  float collar=sdCylY(q-vec3(0.,.19,0.),.05,.006)-.002;
  return min(min(foot,post),min(min(ring,spoke),collar)); }
float cushion(vec3 q){ float c=sdCylY(q-vec3(0.,.212,0.),.058,.012)-.012; return c; }
/* ---- a pair of lace-up walking shoes, toes toward the right ---- */
float shoe(vec3 q){
  float r=sdEll(q-vec3(.02,.028,0.),vec3(.075,.03,.036));
  float heel=sdRBox(q-vec3(-.045,.035,0.),vec3(.03,.035,.032),.02);
  float d=smin(r,heel,.03);
  d=max(d,-q.y+.002);
  float open=sdEll(q-vec3(-.035,.07,0.),vec3(.04,.02,.024));    /* the opening */
  d=max(d,-open);
  float sole=sdRBox(q-vec3(.0,.006,0.),vec3(.1,.006,.036),.005);
  sole=max(sole,length((q.xz-vec2(.0,0.))*vec2(.37,1.))-.037);
  float tongue=sdRBox(q-vec3(.0,.058,0.),vec3(.028,.004,.016),.004); tongue=max(tongue,-(q.x+.015));
  return min(min(d,sole),tongue); }
#define SH1 vec3(-.01,0.,-.1)
#define SH2 vec3(.085,0.,-.12)
vec3 s1Q(vec3 p){ return place(p,SH1,-1.05); }
vec3 s2Q(vec3 p){ return place(p,SH2,-1.25); }
/* ---- ballot box with a slot and a folded ballot ---- */
#define BB vec3(.2,0.,.1)
vec3 bbQ(vec3 p){ return place(p,BB,-.4); }
float boxD(vec3 q){
  float b=sdRBox(q-vec3(0.,.075,0.),vec3(.075,.075,.06),.004);
  float lid=sdRBox(q-vec3(0.,.154,0.),vec3(.08,.006,.065),.003);
  float d=min(b,lid);
  d=max(d,-sdBox(q-vec3(0.,.16,0.),vec3(.03,.02,.004)));       /* the slot */
  float hasp=sdRBox(q-vec3(0.,.13,-.062),vec3(.008,.012,.003),.001);
  return min(d,hasp); }
float ballotD(vec3 q){ vec3 b=q-vec3(.0,.18,0.); b.xy=rot(.12)*b.xy;
  return sdRBox(b,vec3(.026,.03,.0012),.0005); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.45-p.z,2.);
  vec3 s=stQ(p);
  r=U(r,stoolMetal(s),3.);
  r=U(r,cushion(s),4.);
  r=U(r,shoe(s1Q(p)),5.);
  r=U(r,shoe(s2Q(p)),5.);
  vec3 b=bbQ(p);
  r=U(r,boxD(b),6.);
  r=U(r,ballotD(b),7.);
  return r; }
float shoeTone(vec3 q){
  if(q.y<.012) return .25;                                      /* the sole */
  if(abs(q.z)<.018&&q.x>-.02&&q.x<.03&&q.y>.045&&abs(fract(q.x/.011)-.5)<.12) return .9;   /* laces */
  if(abs(q.x+.005)<.0015&&q.y>.02) return .2;                   /* seam */
  return .55; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=stQ(p); return .6+.3*smoothstep(.3,.9,n.x*.5+.5)-.3*smoothstep(.2,-.6,n.x); }   /* chrome: bright and dark streaks */
  if(id==4.){ vec3 q=stQ(p); if(abs(q.y-.212)<.0015&&length(q.xz)>.05) return .2;
    float a=atan(q.z,q.x); if(q.y>.222&&abs(fract(a/.5236+.5)-.5)<.03) return .3;   /* tufted pleats */
    return .35; }
  if(id==5.){ vec3 a=s1Q(p), b=s2Q(p); return shoeTone(length(a.xz)<length(b.xz)?a:b); }
  if(id==6.){ vec3 q=bbQ(p); float a=.6+.1*grain(q,70.);
    if(abs(q.y-.1)<.0015&&q.z<-.055) a=.3; return a; }
  if(id==7.) return .95;
  return .7; }
