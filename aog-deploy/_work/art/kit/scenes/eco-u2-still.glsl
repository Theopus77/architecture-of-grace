/* Economics Unit 2 "Money, Saving and Spending" — pencil still life: a piggy bank with a
   coin slot and a curly tail, a coin going in, stacks of coins and a small glass jar with
   coins saved inside. */
#define CAM_POS vec3(-0.3343,0.2043,-0.6928)
#define CAM_TGT vec3(-0.2312,0.0232,0.0837)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define PC vec3(.06,0.,.12)
vec3 pq(vec3 p){ vec3 q=p-PC; q.xz=rot(.15)*q.xz; return q; }   /* pig faces +x */
vec2 pig(vec3 p){
  vec3 q=pq(p);
  float body=length((q-vec3(0.,.095,0.))*vec3(.8,1.,1.05))-.075; body*=.8;
  float snout=sdCylX(q-vec3(.1,.095,0.),.025,.016)-.004;
  float ears=1e5; for(int i=0;i<2;i++){ float s=float(i)*2.-1.; vec3 e=q-vec3(.055,.16,s*.035); e.xy=rot(.5)*e.xy;
    ears=min(ears,sdCone(e,.018,.002,.014)); }
  float legs=1e5; for(int i=0;i<4;i++){ vec3 c=q-vec3(i<2?.045:-.045,.02,(i%2==0)?.035:-.035); legs=min(legs,sdCylY(c,.014,.02)-.002); }
  float b=smin(smin(body,snout,.012),min(ears,legs),.01);
  b=max(b,-sdBox(q-vec3(-.005,.175,0.),vec3(.022,.02,.0035)));              /* coin slot */
  vec3 t=q-vec3(-.1,.1,0.); float tail=sdTorus(t.yxz*vec3(1.,1.,1.),.011,.0028);
  vec3 c=q-vec3(-.005,.188,0.); float coin=sdCylZ(c,.02,.0028);
  return vec2(min(b,tail),coin); }
float coins(vec3 p){
  float a=coinStack(p-vec3(-.19,0.,-.02),.026,.0032,8,1.);
  float b=coinStack(p-vec3(-.24,0.,.04),.026,.0032,5,2.);
  float c=coinStack(p-vec3(-.14,0.,.05),.026,.0032,3,3.);
  return min(min(a,b),c); }
#define JC vec3(.3,0.,.2)
vec2 jar(vec3 p){
  vec3 q=p-JC;
  float glass=abs(sdCylY(q-vec3(0.,.065,0.),.045,.065)-.004)-.002; glass=max(glass,q.y-.128);
  float lid=sdCylY(q-vec3(0.,.132,0.),.047,.008)-.002;
  float inside=1e5;
  for(int i=0;i<6;i++){ vec2 o=(h22(vec2(float(i),7.))-.5)*.05; vec3 c=q-vec3(o.x,.008+float(i)*.007,o.y); c.xy=rot(o.x*8.)*c.xy; inside=min(inside,coinD(c,.017,.003)); }
  return vec2(min(glass,lid),inside); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 g=pig(p); r=U(r,g.x,3.); r=U(r,g.y,4.);
  r=U(r,coins(p),5.);
  vec2 j=jar(p); r=U(r,j.x,6.); r=U(r,j.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pq(p);
    if(q.x>.114){ vec2 u=vec2(q.z,q.y-.095); if(length(u-vec2(.009,0.))<.005||length(u-vec2(-.009,0.))<.005) return .2; }   /* nostrils */
    if(length(vec2(q.z,q.y-.125)-vec2(.03,0.))<.006&&q.x>.04||length(vec2(q.z,q.y-.125)-vec2(-.03,0.))<.006&&q.x>.04) return .12;   /* eyes */
    return .8; }
  if(id==4.) return .55;
  if(id==5.){ if(abs(n.y)>.7) return .72; return fract(p.y/.0012)<.4?.42:.6; }
  if(id==6.){ vec3 q=p-JC; if(q.y>.124) return .45; return .95; }
  if(id==7.) return .5;
  return .7; }
