/* Social Studies Unit 12 "Faiths, Empires and Exchange" — pencil still life of trade along
   the old routes: a bolt of patterned silk cloth, a lidded spice jar, a brass oil lamp and a
   few old coins. Objects only, no figures. */
#define CAM_POS vec3(-0.3036,0.1841,-0.6781)
#define CAM_TGT vec3(-0.2034,0.0080,0.0766)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
vec3 bq(vec3 p){ vec3 q=p-vec3(.06,.05,.14); q.xz=rot(-.3)*q.xz; return q; }
vec2 silk(vec3 p){
  vec3 q=bq(p);
  float bolt=sdCylX(q,.05,.13)-.002;
  /* a length of cloth unrolled over the front and onto the table */
  vec3 c=p-vec3(.0,0.,0.);
  vec3 u=q; float drape=1e5;
  float x=u.x; float z=u.z;
  float yy=u.y;
  /* flat strip on the table in front */
  vec3 s=q-vec3(-.02,-.047,-.12); s.y-=.002*sin(s.z*90.)+.003*sin(s.x*40.);
  drape=sdRBox(s,vec3(.1,.0015,.07),.001);
  float end=sdCylX(q-vec3(0.,0.,0.),.052,.02);
  return vec2(min(bolt,drape),sdCylX(q-vec3(.135,0.,0.),.018,.006)); }
#define JC vec3(.3,0.,.18)
vec2 jar(vec3 p){
  vec3 q=p-JC;
  float t=clamp(q.y/.13,0.,1.);
  float R=.04+.022*sin(t*3.1);
  float d=(length(q.xz)-R)*.8; d=max(d,max(-q.y,q.y-.13));
  float lid=sdCone(q-vec3(0.,.15,0.),.045,.01,.022)-.002;
  float knob=length(q-vec3(0.,.178,0.))-.01;
  return vec2(d,min(lid,knob)); }
vec3 lq(vec3 p){ vec3 q=p-vec3(-.19,0.,.0); q.xz=rot(.4)*q.xz; return q; }
float lamp(vec3 p){
  vec3 q=lq(p);
  float foot=sdCylY(q-vec3(0.,.008,0.),.025,.008)-.002;
  float body=length((q-vec3(0.,.035,0.))*vec3(1.,1.8,1.3))/1.8-.045/1.8*1.;
  body=length((q-vec3(0.,.035,0.))*vec3(.9,1.7,1.25))-.045; body*=.55;
  float spout=sdCapsule(q,vec3(.03,.035,0.),vec3(.085,.045,0.),.009);
  float lidd=sdCylY(q-vec3(-.005,.058,0.),.018,.004)-.002;
  float hand=sdTorus((q-vec3(-.052,.04,0.)).xzy,.016,.0035);
  return min(min(foot,body),min(min(spout,lidd),hand)); }
float coins(vec3 p){
  float d=coinD(p-vec3(-.07,.003,-.08),.02,.0028);
  d=min(d,coinD(p-vec3(-.03,.003,-.1),.018,.0028));
  vec3 c=p-vec3(-.1,.012,-.11); c.xy=rot(.35)*c.xy; d=min(d,coinD(c,.02,.0028));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 s=silk(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  vec2 j=jar(p); r=U(r,j.x,5.); r=U(r,j.y,6.);
  r=U(r,lamp(p),7.);
  r=U(r,coins(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bq(p); vec2 u=q.y>-.04?vec2(q.x,atan(q.z,q.y)*.05):q.xz;
    vec2 g=fract(u/.028)-.5; float dm=abs(g.x)+abs(g.y);
    if(abs(dm-.32)<.06) return .3; if(dm<.1) return .4;                       /* diamond pattern */
    if(abs(fract(u.x/.028*.5+.25)-.5)<.03) return .55;
    return .8; }
  if(id==4.) return .5;
  if(id==5.){ vec3 q=p-JC; float a=atan(q.z,q.x);
    if(abs(q.y-.065)<.02){ float w=sin(a*8.)*.012; if(abs(q.y-.065-w)<.003) return .2; }
    if(abs(q.y-.03)<.002||abs(q.y-.1)<.002) return .3; return .7; }
  if(id==6.) return .6;
  if(id==7.) return .5;
  if(id==8.) return .55;
  return .7; }
